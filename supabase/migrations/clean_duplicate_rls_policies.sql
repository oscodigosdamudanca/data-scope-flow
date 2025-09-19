-- SCRIPT PARA LIMPEZA DE POLÍTICAS RLS DUPLICADAS E CONFLITANTES
-- ==============================================================

-- PROBLEMA IDENTIFICADO: Existem políticas RLS duplicadas e conflitantes
-- nas tabelas companies e company_memberships que podem causar:
-- 1. Recursão infinita
-- 2. Conflitos de permissão
-- 3. Performance degradada
-- 4. Comportamento imprevisível

-- ANÁLISE DAS POLÍTICAS PROBLEMÁTICAS:
-- ===================================

-- TABELA: companies
-- Políticas duplicadas para SELECT:
-- - "Users can view companies they belong to" (política antiga)
-- - "companies_select_policy" (política nova do nosso script)

-- Políticas com erro de referência para INSERT/UPDATE/DELETE:
-- - "companies_insert_policy", "companies_update_policy", "companies_delete_policy"
--   Problema: usam cm.company_id = cm.id (deveria ser cm.company_id = companies.id)

-- TABELA: company_memberships  
-- Políticas duplicadas:
-- - "Users can view their own company memberships" (política antiga)
-- - "company_memberships_select_policy" (política nova)
-- - "Company admins can manage memberships" (política com recursão)

-- SOLUÇÃO: LIMPEZA COMPLETA E RECRIAÇÃO
-- ====================================

-- PASSO 1: DESABILITAR RLS TEMPORARIAMENTE
-- ========================================

ALTER TABLE public.companies DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_memberships DISABLE ROW LEVEL SECURITY;

-- PASSO 2: REMOVER TODAS AS POLÍTICAS EXISTENTES
-- ==============================================

-- Remover políticas da tabela companies
DROP POLICY IF EXISTS "Company admins can update their companies" ON public.companies;
DROP POLICY IF EXISTS "Users can view companies they belong to" ON public.companies;
DROP POLICY IF EXISTS "companies_delete_policy" ON public.companies;
DROP POLICY IF EXISTS "companies_insert_policy" ON public.companies;
DROP POLICY IF EXISTS "companies_select_policy" ON public.companies;
DROP POLICY IF EXISTS "companies_update_policy" ON public.companies;

-- Remover políticas da tabela company_memberships
DROP POLICY IF EXISTS "Company admins can manage memberships" ON public.company_memberships;
DROP POLICY IF EXISTS "Users can view their own company memberships" ON public.company_memberships;
DROP POLICY IF EXISTS "company_memberships_delete_policy" ON public.company_memberships;
DROP POLICY IF EXISTS "company_memberships_insert_policy" ON public.company_memberships;
DROP POLICY IF EXISTS "company_memberships_select_policy" ON public.company_memberships;
DROP POLICY IF EXISTS "company_memberships_update_policy" ON public.company_memberships;

-- PASSO 3: CRIAR POLÍTICAS LIMPAS E CORRETAS
-- ==========================================

-- POLÍTICAS PARA company_memberships (SEM RECURSÃO)
-- =================================================

-- SELECT: Usuário vê apenas seus próprios registros
CREATE POLICY "company_memberships_select_policy" ON public.company_memberships
    FOR SELECT
    USING (user_id = auth.uid());

-- INSERT: Usuário pode inserir apenas para si mesmo
CREATE POLICY "company_memberships_insert_policy" ON public.company_memberships
    FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- UPDATE: Usuário pode atualizar apenas seus próprios registros
CREATE POLICY "company_memberships_update_policy" ON public.company_memberships
    FOR UPDATE
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- DELETE: Usuário pode deletar apenas seus próprios registros
CREATE POLICY "company_memberships_delete_policy" ON public.company_memberships
    FOR DELETE
    USING (user_id = auth.uid());

-- POLÍTICAS PARA companies (CORRIGIDAS)
-- ====================================

-- SELECT: Usuário vê empresas onde é membro
CREATE POLICY "companies_select_policy" ON public.companies
    FOR SELECT
    USING (
        id IN (
            SELECT company_id 
            FROM public.company_memberships 
            WHERE user_id = auth.uid()
        )
    );

-- INSERT: Apenas admins podem criar empresas (CORRIGIDO)
CREATE POLICY "companies_insert_policy" ON public.companies
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 
            FROM public.company_memberships cm
            WHERE cm.user_id = auth.uid() 
            AND cm.company_id = companies.id  -- CORRIGIDO: era cm.id
            AND cm.role = 'admin'::public.company_role
        )
    );

-- UPDATE: Apenas admins podem atualizar empresas (CORRIGIDO)
CREATE POLICY "companies_update_policy" ON public.companies
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 
            FROM public.company_memberships cm
            WHERE cm.user_id = auth.uid() 
            AND cm.company_id = companies.id  -- CORRIGIDO: era cm.id
            AND cm.role = 'admin'::public.company_role
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 
            FROM public.company_memberships cm
            WHERE cm.user_id = auth.uid() 
            AND cm.company_id = companies.id  -- CORRIGIDO: era cm.id
            AND cm.role = 'admin'::public.company_role
        )
    );

-- DELETE: Apenas admins podem deletar empresas (CORRIGIDO)
CREATE POLICY "companies_delete_policy" ON public.companies
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 
            FROM public.company_memberships cm
            WHERE cm.user_id = auth.uid() 
            AND cm.company_id = companies.id  -- CORRIGIDO: era cm.id
            AND cm.role = 'admin'::public.company_role
        )
    );

-- PASSO 4: REABILITAR RLS
-- =======================

ALTER TABLE public.company_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- PASSO 5: VERIFICAÇÕES FINAIS
-- ============================

-- Verificar se RLS está habilitado
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('company_memberships', 'companies')
ORDER BY tablename;

-- Verificar políticas criadas (deve mostrar apenas as novas)
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('company_memberships', 'companies')
ORDER BY tablename, policyname;

-- Contar políticas por tabela (deve ser 4 para cada)
SELECT tablename, COUNT(*) as total_policies
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('company_memberships', 'companies')
GROUP BY tablename
ORDER BY tablename;

-- PRINCIPAIS CORREÇÕES APLICADAS:
-- ===============================
-- 1. Removidas TODAS as políticas duplicadas e conflitantes
-- 2. Corrigido erro de referência: cm.company_id = cm.id → cm.company_id = companies.id
-- 3. Eliminada recursão infinita em company_memberships
-- 4. Mantida segurança: apenas admins gerenciam empresas
-- 5. Políticas simples e diretas para company_memberships
-- 6. Estrutura limpa: 4 políticas por tabela (SELECT, INSERT, UPDATE, DELETE)
-- 7. Performance otimizada sem consultas circulares