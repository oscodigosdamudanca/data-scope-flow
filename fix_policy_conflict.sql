-- Fix Profiles RLS Policy Conflict
-- Este script resolve o conflito entre políticas antigas e novas

-- 1. Remover TODAS as políticas existentes da tabela profiles
DROP POLICY IF EXISTS "Profiles: insert self" ON public.profiles;
DROP POLICY IF EXISTS "Profiles: insert self or developer" ON public.profiles;
DROP POLICY IF EXISTS "Profiles: select self or developer" ON public.profiles;
DROP POLICY IF EXISTS "Profiles: update self or developer" ON public.profiles;
DROP POLICY IF EXISTS "Profiles: delete self or developer" ON public.profiles;

-- 2. Criar a nova política correta para INSERT
CREATE POLICY "Profiles: insert self or developer" ON public.profiles
FOR INSERT TO authenticated
WITH CHECK (
  id = (SELECT auth.uid())
  OR
  public.has_role(auth.uid(), 'developer')
);

-- 3. Verificar se as outras políticas necessárias existem
-- Política para SELECT
CREATE POLICY "Profiles: select self or developer" ON public.profiles
FOR SELECT TO authenticated
USING (
  id = (SELECT auth.uid())
  OR
  public.has_role(auth.uid(), 'developer')
);

-- 4. Verificar se RLS está habilitado
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 5. Comentário explicativo
COMMENT ON POLICY "Profiles: insert self or developer" ON public.profiles IS 
'Permite que usuários autenticados criem perfis com seu próprio UUID ou desenvolvedores criem qualquer perfil';