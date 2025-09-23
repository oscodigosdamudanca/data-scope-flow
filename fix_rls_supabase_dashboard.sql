-- =====================================================
-- CORREÇÃO DEFINITIVA DE RECURSÃO INFINITA NAS POLÍTICAS RLS
-- Execute este script COMPLETO no SQL Editor do Supabase Dashboard
-- =====================================================

-- PASSO 1: Desabilitar RLS em todas as tabelas
ALTER TABLE IF EXISTS public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.companies DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.company_memberships DISABLE ROW LEVEL SECURITY;

-- PASSO 2: Remover TODAS as políticas existentes (sem exceção)
DO $$
DECLARE
    pol RECORD;
BEGIN
    -- Remover todas as políticas da tabela profiles
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'profiles' AND schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || pol.policyname || '" ON public.profiles';
    END LOOP;
    
    -- Remover todas as políticas da tabela companies
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'companies' AND schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || pol.policyname || '" ON public.companies';
    END LOOP;
    
    -- Remover todas as políticas da tabela company_memberships
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'company_memberships' AND schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || pol.policyname || '" ON public.company_memberships';
    END LOOP;
END $$;

-- PASSO 3: Criar políticas ULTRA SIMPLES para profiles
CREATE POLICY "allow_own_profile_select" ON public.profiles 
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "allow_own_profile_insert" ON public.profiles 
FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "allow_own_profile_update" ON public.profiles 
FOR UPDATE USING (auth.uid() = id);

-- PASSO 4: Criar políticas ULTRA SIMPLES para companies
CREATE POLICY "allow_companies_select" ON public.companies 
FOR SELECT USING (true);

CREATE POLICY "allow_companies_insert" ON public.companies 
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "allow_companies_update" ON public.companies 
FOR UPDATE USING (auth.role() = 'authenticated');

-- PASSO 5: Criar políticas ULTRA SIMPLES para company_memberships
CREATE POLICY "allow_memberships_select" ON public.company_memberships 
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "allow_memberships_insert" ON public.company_memberships 
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "allow_memberships_update" ON public.company_memberships 
FOR UPDATE USING (auth.uid() = user_id);

-- PASSO 6: Reabilitar RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_memberships ENABLE ROW LEVEL SECURITY;

-- PASSO 7: Verificar se as políticas foram criadas corretamente
SELECT 
    schemaname,
    tablename, 
    policyname,
    cmd,
    permissive,
    qual,
    with_check
FROM pg_policies 
WHERE tablename IN ('profiles', 'companies', 'company_memberships')
  AND schemaname = 'public'
ORDER BY tablename, policyname;

-- PASSO 8: Teste final de acesso
SELECT 'Teste concluído - Execute o teste MCP novamente' as status;