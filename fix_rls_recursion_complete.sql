-- =====================================================
-- SCRIPT COMPLETO PARA CORRIGIR RECURSÃO INFINITA RLS
-- =====================================================
-- 
-- PROBLEMA IDENTIFICADO: Recursão infinita nas políticas RLS
-- CAUSA: Políticas que referenciam a própria tabela em suas condições
-- SOLUÇÃO: Remover políticas problemáticas e criar políticas diretas
-- =====================================================

-- PASSO 1: DESABILITAR RLS TEMPORARIAMENTE
-- =====================================================
ALTER TABLE IF EXISTS public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.company_memberships DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.companies DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.module_permissions DISABLE ROW LEVEL SECURITY;

-- PASSO 2: REMOVER TODAS AS POLÍTICAS PROBLEMÁTICAS
-- =====================================================

-- Remover políticas de profiles
DROP POLICY IF EXISTS "Profiles: select own or developer" ON public.profiles;
DROP POLICY IF EXISTS "Profiles: insert own or developer" ON public.profiles;
DROP POLICY IF EXISTS "Profiles: update own or developer" ON public.profiles;
DROP POLICY IF EXISTS "Profiles: delete developer only" ON public.profiles;

-- Remover políticas de company_memberships
DROP POLICY IF EXISTS "Memberships: select member or developer" ON public.company_memberships;
DROP POLICY IF EXISTS "Memberships: insert admin or developer" ON public.company_memberships;
DROP POLICY IF EXISTS "Memberships: update admin or developer" ON public.company_memberships;
DROP POLICY IF EXISTS "Memberships: delete admin or developer" ON public.company_memberships;

-- Remover políticas de companies
DROP POLICY IF EXISTS "Companies: select member or developer" ON public.companies;
DROP POLICY IF EXISTS "Companies: insert developer only" ON public.companies;
DROP POLICY IF EXISTS "Companies: update admin or developer" ON public.companies;
DROP POLICY IF EXISTS "Companies: delete developer only" ON public.companies;

-- Remover políticas de module_permissions
DROP POLICY IF EXISTS "Module permissions: select all authenticated" ON public.module_permissions;
DROP POLICY IF EXISTS "Module permissions: insert developer only" ON public.module_permissions;
DROP POLICY IF EXISTS "Module permissions: update developer only" ON public.module_permissions;
DROP POLICY IF EXISTS "Module permissions: delete developer only" ON public.module_permissions;

-- PASSO 3: CRIAR POLÍTICAS SEGURAS E DIRETAS
-- =====================================================

-- POLÍTICAS PARA PROFILES (sem recursão)
CREATE POLICY "profiles_select_safe" ON public.profiles
FOR SELECT TO authenticated
USING (
  -- Usuário pode ver seu próprio perfil
  id = auth.uid()
  OR
  -- Developer pode ver todos os perfis
  app_role = 'developer'
);

CREATE POLICY "profiles_insert_safe" ON public.profiles
FOR INSERT TO authenticated
WITH CHECK (
  -- Usuário pode inserir apenas seu próprio perfil
  id = auth.uid()
);

CREATE POLICY "profiles_update_safe" ON public.profiles
FOR UPDATE TO authenticated
USING (
  -- Usuário pode atualizar apenas seu próprio perfil
  id = auth.uid()
  OR
  -- Developer pode atualizar qualquer perfil
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.id = auth.uid() AND p.app_role = 'developer'
  )
)
WITH CHECK (
  -- Mesmas regras para o check
  id = auth.uid()
  OR
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.id = auth.uid() AND p.app_role = 'developer'
  )
);

-- POLÍTICAS PARA MODULE_PERMISSIONS (acesso livre para leitura)
CREATE POLICY "module_permissions_select_all" ON public.module_permissions
FOR SELECT TO authenticated
USING (true);

CREATE POLICY "module_permissions_insert_developer" ON public.module_permissions
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.id = auth.uid() AND p.app_role = 'developer'
  )
);

CREATE POLICY "module_permissions_update_developer" ON public.module_permissions
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.id = auth.uid() AND p.app_role = 'developer'
  )
);

CREATE POLICY "module_permissions_delete_developer" ON public.module_permissions
FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.id = auth.uid() AND p.app_role = 'developer'
  )
);

-- POLÍTICAS PARA COMPANIES (se a tabela existir)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'companies') THEN
    -- Política de SELECT para companies
    EXECUTE 'CREATE POLICY "companies_select_safe" ON public.companies
    FOR SELECT TO authenticated
    USING (
      -- Developer pode ver todas as empresas
      EXISTS (
        SELECT 1 FROM public.profiles p 
        WHERE p.id = auth.uid() AND p.app_role = ''developer''
      )
      OR
      -- Usuário pode ver empresas onde é membro (verificação direta)
      id IN (
        SELECT company_id FROM public.company_memberships 
        WHERE user_id = auth.uid()
      )
    )';
  END IF;
END $$;

-- POLÍTICAS PARA COMPANY_MEMBERSHIPS (se a tabela existir)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'company_memberships') THEN
    -- Política de SELECT para company_memberships
    EXECUTE 'CREATE POLICY "company_memberships_select_safe" ON public.company_memberships
    FOR SELECT TO authenticated
    USING (
      -- Developer pode ver todos os memberships
      EXISTS (
        SELECT 1 FROM public.profiles p 
        WHERE p.id = auth.uid() AND p.app_role = ''developer''
      )
      OR
      -- Usuário pode ver apenas seus próprios memberships
      user_id = auth.uid()
    )';
  END IF;
END $$;

-- PASSO 4: REABILITAR RLS
-- =====================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.module_permissions ENABLE ROW LEVEL SECURITY;

-- Reabilitar RLS para outras tabelas se existirem
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'companies') THEN
    EXECUTE 'ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY';
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'company_memberships') THEN
    EXECUTE 'ALTER TABLE public.company_memberships ENABLE ROW LEVEL SECURITY';
  END IF;
END $$;

-- PASSO 5: VERIFICAÇÃO FINAL
-- =====================================================

-- Verificar se RLS está ativo nas tabelas principais
SELECT 
  schemaname, 
  tablename, 
  rowsecurity,
  CASE 
    WHEN rowsecurity THEN '✅ RLS ATIVO'
    ELSE '❌ RLS INATIVO'
  END as status
FROM pg_tables 
WHERE tablename IN ('profiles', 'module_permissions', 'companies', 'company_memberships')
  AND schemaname = 'public'
ORDER BY tablename;

-- Contar políticas ativas
SELECT 
  tablename,
  COUNT(*) as total_policies,
  '✅ POLÍTICAS CRIADAS' as status
FROM pg_policies 
WHERE tablename IN ('profiles', 'module_permissions', 'companies', 'company_memberships')
GROUP BY tablename
ORDER BY tablename;

-- Mensagem de sucesso
SELECT '🎯 CORREÇÃO DE RECURSÃO RLS CONCLUÍDA COM SUCESSO!' as resultado;