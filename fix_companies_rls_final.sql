-- Script para corrigir definitivamente as políticas RLS da tabela companies
-- Problema identificado: Erro 42501 - new row violates row-level security policy

-- 1. Verificar status atual da tabela companies
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'companies';

-- 2. Listar políticas existentes
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE tablename = 'companies';

-- 3. Remover todas as políticas existentes problemáticas
DROP POLICY IF EXISTS "Companies: select member or developer" ON public.companies;
DROP POLICY IF EXISTS "Companies: insert self owner or developer" ON public.companies;
DROP POLICY IF EXISTS "Companies: update admin or developer" ON public.companies;
DROP POLICY IF EXISTS "Companies: delete only developer" ON public.companies;
DROP POLICY IF EXISTS "companies_insert_policy" ON public.companies;
DROP POLICY IF EXISTS "companies_select_policy" ON public.companies;
DROP POLICY IF EXISTS "companies_update_policy" ON public.companies;
DROP POLICY IF EXISTS "companies_delete_policy" ON public.companies;

-- 4. Criar políticas RLS mais simples e funcionais

-- Política INSERT: Permite que usuários autenticados criem empresas
-- Esta é a política crítica que estava falhando
CREATE POLICY "companies_insert_authenticated" ON public.companies
    FOR INSERT 
    TO authenticated 
    WITH CHECK (
        -- Permite inserção se o usuário está autenticado
        -- E define o created_by como o usuário atual
        created_by = auth.uid()
    );

-- Política SELECT: Permite ver empresas onde o usuário é membro
CREATE POLICY "companies_select_member" ON public.companies
    FOR SELECT 
    TO authenticated 
    USING (
        -- Permite ver se é desenvolvedor
        EXISTS (
            SELECT 1 FROM public.user_roles ur 
            WHERE ur.user_id = auth.uid() 
            AND ur.role = 'developer'
        )
        OR
        -- Permite ver se é membro da empresa
        EXISTS (
            SELECT 1 FROM public.company_memberships cm 
            WHERE cm.company_id = companies.id 
            AND cm.user_id = auth.uid()
        )
    );

-- Política UPDATE: Permite atualizar se for admin da empresa
CREATE POLICY "companies_update_admin" ON public.companies
    FOR UPDATE 
    TO authenticated 
    USING (
        -- Permite atualizar se é desenvolvedor
        EXISTS (
            SELECT 1 FROM public.user_roles ur 
            WHERE ur.user_id = auth.uid() 
            AND ur.role = 'developer'
        )
        OR
        -- Permite atualizar se é admin da empresa
        EXISTS (
            SELECT 1 FROM public.company_memberships cm 
            WHERE cm.company_id = companies.id 
            AND cm.user_id = auth.uid() 
            AND cm.role = 'admin'
        )
    );

-- Política DELETE: Apenas desenvolvedores podem deletar
CREATE POLICY "companies_delete_developer" ON public.companies
    FOR DELETE 
    TO authenticated 
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur 
            WHERE ur.user_id = auth.uid() 
            AND ur.role = 'developer'
        )
    );

-- 5. Verificar se as políticas foram criadas corretamente
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE tablename = 'companies'
ORDER BY policyname;
