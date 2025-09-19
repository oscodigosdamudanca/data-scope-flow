-- Script para corrigir políticas RLS da tabela companies
-- Este script deve ser executado no SQL Editor do Supabase

-- 1. Primeiro, vamos ver as políticas existentes
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'companies';

-- 2. Remover todas as políticas existentes da tabela companies
DROP POLICY IF EXISTS "companies_insert_policy" ON public.companies;
DROP POLICY IF EXISTS "companies_select_policy" ON public.companies;
DROP POLICY IF EXISTS "companies_update_policy" ON public.companies;
DROP POLICY IF EXISTS "companies_delete_policy" ON public.companies;

-- 3. Verificar se RLS está habilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'companies';

-- 4. Criar políticas RLS mais permissivas para usuários autenticados

-- Política para INSERT: Permite que usuários autenticados criem empresas
-- IMPORTANTE: Esta política permite que qualquer usuário autenticado crie uma empresa
-- Isso é necessário para o fluxo de cadastro inicial
CREATE POLICY "companies_insert_policy" ON public.companies
    FOR INSERT 
    TO authenticated 
    WITH CHECK (true);

-- Política para SELECT: Permite que usuários vejam apenas suas próprias empresas
CREATE POLICY "companies_select_policy" ON public.companies
    FOR SELECT 
    TO authenticated 
    USING (
        -- Usuários podem ver empresas onde são administradores ou entrevistadores
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.company_id = companies.id 
            AND users.auth_id = auth.uid()
        )
        OR
        -- Ou se for desenvolvedor (role = 'developer')
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.auth_id = auth.uid() 
            AND users.role = 'developer'
        )
        OR
        -- Ou se for organizador (role = 'organizer')
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.auth_id = auth.uid() 
            AND users.role = 'organizer'
        )
    );

-- Política para UPDATE: Permite que administradores atualizem suas empresas
CREATE POLICY "companies_update_policy" ON public.companies
    FOR UPDATE 
    TO authenticated 
    USING (
        -- Apenas administradores da empresa podem atualizar
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.company_id = companies.id 
            AND users.auth_id = auth.uid()
            AND users.role IN ('admin', 'developer')
        )
    )
    WITH CHECK (
        -- Mesma condição para o WITH CHECK
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.company_id = companies.id 
            AND users.auth_id = auth.uid()
            AND users.role IN ('admin', 'developer')
        )
    );

-- Política para DELETE: Apenas desenvolvedores podem deletar empresas
CREATE POLICY "companies_delete_policy" ON public.companies
    FOR DELETE 
    TO authenticated 
    USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.auth_id = auth.uid() 
            AND users.role = 'developer'
        )
    );

-- 5. Verificar se as políticas foram criadas corretamente
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'companies'
ORDER BY policyname;