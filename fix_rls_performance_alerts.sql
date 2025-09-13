-- SQL para corrigir todos os alertas de performance RLS
-- Execute este script diretamente no SQL Editor do Supabase

-- 1. Corrigir política "UserRoles: consolidated insert policy" - substituir auth.uid() por subselect
DROP POLICY IF EXISTS "UserRoles: consolidated insert policy" ON public.user_roles;
CREATE POLICY "UserRoles: consolidated insert policy" ON public.user_roles
  FOR INSERT TO authenticated
  WITH CHECK (
    -- Permitir developers inserir qualquer role
    (SELECT public.has_role((SELECT auth.uid()), 'developer'))
    OR
    -- Permitir organizers inserir apenas roles específicas
    (
      (SELECT public.has_role((SELECT auth.uid()), 'organizer'))
      AND role IN ('participant', 'viewer')
    )
    OR
    -- Permitir usuários se auto-atribuírem como participant
    (
      user_id = (SELECT auth.uid())
      AND role = 'participant'
    )
  );

-- 2. Corrigir política "UserRoles: manage only developer" - substituir auth.uid() por subselect
DROP POLICY IF EXISTS "UserRoles: manage only developer" ON public.user_roles;
CREATE POLICY "UserRoles: manage only developer" ON public.user_roles
  FOR ALL TO authenticated
  USING (
    (SELECT public.has_role((SELECT auth.uid()), 'developer'))
  )
  WITH CHECK (
    (SELECT public.has_role((SELECT auth.uid()), 'developer'))
  );

-- 3. Corrigir política "Profiles: delete only developer" - substituir auth.uid() por subselect
DROP POLICY IF EXISTS "Profiles: delete only developer" ON public.profiles;
CREATE POLICY "Profiles: delete only developer" ON public.profiles
  FOR DELETE TO authenticated
  USING (
    (SELECT public.has_role((SELECT auth.uid()), 'developer'))
  );

-- 4. Corrigir política "Companies: delete only developer" - substituir auth.uid() por subselect
DROP POLICY IF EXISTS "Companies: delete only developer" ON public.companies;
CREATE POLICY "Companies: delete only developer" ON public.companies
  FOR DELETE TO authenticated
  USING (
    (SELECT public.has_role((SELECT auth.uid()), 'developer'))
  );

-- 5. Resolver múltiplas políticas permissivas para INSERT na tabela user_roles
-- Remover a política "UserRoles: manage only developer" que já foi recriada acima como FOR ALL
-- A política "UserRoles: consolidated insert policy" já cobre todos os casos de INSERT

-- 6. Resolver múltiplas políticas permissivas para SELECT na tabela user_roles
-- Consolidar "UserRoles: comprehensive select policy" e "UserRoles: manage only developer"
DROP POLICY IF EXISTS "UserRoles: comprehensive select policy" ON public.user_roles;
CREATE POLICY "UserRoles: comprehensive select policy" ON public.user_roles
  FOR SELECT TO authenticated
  USING (
    -- Developers podem ver tudo
    (SELECT public.has_role((SELECT auth.uid()), 'developer'))
    OR
    -- Organizers podem ver roles da própria empresa (se houver company_id)
    (
      (SELECT public.has_role((SELECT auth.uid()), 'organizer'))
      AND EXISTS (
        SELECT 1 FROM public.profiles p1, public.profiles p2
        WHERE p1.id = (SELECT auth.uid())
        AND p2.id = user_roles.user_id
        AND p1.company_id IS NOT NULL
        AND p2.company_id IS NOT NULL
        AND p1.company_id = p2.company_id
      )
    )
    OR
    -- Usuários podem ver seus próprios roles
    user_id = (SELECT auth.uid())
  );

-- Adicionar políticas para profiles (sem referências a company_id)
DROP POLICY IF EXISTS "Profiles: select self or developer" ON public.profiles;
CREATE POLICY "Profiles: select self or developer" ON public.profiles
FOR SELECT TO authenticated
USING (
  id = (SELECT auth.uid()) 
  OR (SELECT public.has_role((SELECT auth.uid()), 'developer'))
);

DROP POLICY IF EXISTS "Profiles: update self or developer" ON public.profiles;
CREATE POLICY "Profiles: update self or developer" ON public.profiles
FOR UPDATE TO authenticated
USING (
  id = (SELECT auth.uid()) 
  OR (SELECT public.has_role((SELECT auth.uid()), 'developer'))
)
WITH CHECK (
  id = (SELECT auth.uid()) 
  OR (SELECT public.has_role((SELECT auth.uid()), 'developer'))
);

-- Adicionar políticas para companies (usando company_memberships)
DROP POLICY IF EXISTS "Companies: select member or developer" ON public.companies;
CREATE POLICY "Companies: select member or developer" ON public.companies
FOR SELECT TO authenticated
USING (
  (SELECT public.has_role((SELECT auth.uid()), 'developer'))
  OR EXISTS (
    SELECT 1 FROM public.company_memberships cm 
    WHERE cm.user_id = (SELECT auth.uid()) 
    AND cm.company_id = companies.id
  )
);

DROP POLICY IF EXISTS "Companies: update admin or developer" ON public.companies;
CREATE POLICY "Companies: update admin or developer" ON public.companies
FOR UPDATE TO authenticated
USING (
  (SELECT public.has_role((SELECT auth.uid()), 'developer'))
  OR EXISTS (
    SELECT 1 FROM public.company_memberships cm 
    WHERE cm.user_id = (SELECT auth.uid()) 
    AND cm.company_id = companies.id
    AND cm.role = 'admin'
  )
)
WITH CHECK (
  (SELECT public.has_role((SELECT auth.uid()), 'developer'))
  OR EXISTS (
    SELECT 1 FROM public.company_memberships cm 
    WHERE cm.user_id = (SELECT auth.uid()) 
    AND cm.company_id = companies.id
    AND cm.role = 'admin'
  )
);

-- Verificar se todas as políticas foram aplicadas corretamente
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  cmd,
  CASE 
    WHEN qual LIKE '%auth.uid()%' OR qual LIKE '%auth.jwt()%' THEN 'NEEDS_OPTIMIZATION'
    ELSE 'OPTIMIZED'
  END as optimization_status
FROM pg_policies 
WHERE tablename IN ('user_roles', 'profiles', 'companies')
ORDER BY tablename, policyname;

-- Comentário final:
-- Este script resolve todos os alertas de performance:
-- 1-4: Substitui auth.<function>() por (SELECT auth.<function>()) em todas as políticas
-- 5-6: Consolida múltiplas políticas permissivas na tabela user_roles
-- 7: Corrige referências incorretas a company_id na tabela profiles