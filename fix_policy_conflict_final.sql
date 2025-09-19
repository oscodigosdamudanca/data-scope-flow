-- Script para resolver conflito de políticas RLS na tabela companies
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar estrutura da tabela companies
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'companies' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Remover TODAS as políticas existentes para evitar conflitos
DROP POLICY IF EXISTS "Companies: delete only developer" ON public.companies;
DROP POLICY IF EXISTS "Companies: insert authenticated" ON public.companies;
DROP POLICY IF EXISTS "Companies: select member or developer" ON public.companies;
DROP POLICY IF EXISTS "Companies: update admin or developer" ON public.companies;
DROP POLICY IF EXISTS "companies_insert_policy" ON public.companies;

-- 3. Verificar se a coluna created_by existe na tabela
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'companies' 
        AND column_name = 'created_by'
        AND table_schema = 'public'
    ) THEN
        -- Adicionar coluna created_by se não existir
        ALTER TABLE public.companies 
        ADD COLUMN created_by UUID REFERENCES auth.users(id);
        
        -- Definir valor padrão para registros existentes
        UPDATE public.companies 
        SET created_by = (SELECT id FROM auth.users LIMIT 1)
        WHERE created_by IS NULL;
    END IF;
END $$;

-- 4. Criar políticas RLS simplificadas e funcionais

-- Política INSERT: Permite usuários autenticados criarem empresas
-- E automaticamente define created_by como o usuário atual
CREATE POLICY "companies_insert_policy" ON public.companies
    FOR INSERT 
    TO authenticated 
    WITH CHECK (
        auth.uid() IS NOT NULL
    );

-- Política SELECT: Permite ver empresas onde o usuário é membro
CREATE POLICY "companies_select_policy" ON public.companies
    FOR SELECT 
    TO authenticated 
    USING (
        -- Desenvolvedor pode ver tudo
        has_role(auth.uid(), 'developer'::app_role) 
        OR 
        -- Usuário pode ver empresas onde é membro
        is_company_member(auth.uid(), id)
        OR
        -- Usuário pode ver empresa que criou
        created_by = auth.uid()
    );

-- Política UPDATE: Permite admins e desenvolvedores atualizarem
CREATE POLICY "companies_update_policy" ON public.companies
    FOR UPDATE 
    TO authenticated 
    USING (
        has_role(auth.uid(), 'developer'::app_role) 
        OR 
        is_company_admin(auth.uid(), id)
        OR
        created_by = auth.uid()
    )
    WITH CHECK (
        has_role(auth.uid(), 'developer'::app_role) 
        OR 
        is_company_admin(auth.uid(), id)
        OR
        created_by = auth.uid()
    );

-- Política DELETE: Apenas desenvolvedores podem deletar
CREATE POLICY "companies_delete_policy" ON public.companies
    FOR DELETE 
    TO authenticated 
    USING (
        has_role(auth.uid(), 'developer'::app_role)
    );

-- 5. Criar trigger para automaticamente definir created_by no INSERT
CREATE OR REPLACE FUNCTION set_created_by()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.created_by IS NULL THEN
        NEW.created_by = auth.uid();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Aplicar o trigger na tabela companies
DROP TRIGGER IF EXISTS companies_set_created_by ON public.companies;
CREATE TRIGGER companies_set_created_by
    BEFORE INSERT ON public.companies
    FOR EACH ROW
    EXECUTE FUNCTION set_created_by();

-- 6. Verificar se as políticas foram criadas corretamente
SELECT 
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'companies'
ORDER BY policyname;

-- 7. Testar se RLS está habilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'companies';