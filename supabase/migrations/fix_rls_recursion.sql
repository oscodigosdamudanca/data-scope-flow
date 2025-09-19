-- SCRIPT PARA CORRIGIR RECURSÃO INFINITA NAS POLÍTICAS RLS
-- ============================================================

-- PROBLEMA: As políticas RLS de company_memberships usam funções que
-- consultam a própria tabela, criando recursão infinita

-- SOLUÇÃO: Remover políticas problemáticas e criar políticas diretas
-- sem dependências de funções que consultam a mesma tabela

-- PASSO 1: REMOVER POLÍTICAS PROBLEMÁTICAS
-- ========================================

-- Desabilitar RLS temporariamente para fazer alterações
ALTER TABLE public.company_memberships DISABLE ROW LEVEL SECURITY;

-- Remover todas as políticas existentes da tabela company_memberships
DROP POLICY IF EXISTS "company_memberships_select_policy" ON public.company_memberships;
DROP POLICY IF EXISTS "company_memberships_insert_policy" ON public.company_memberships;
DROP POLICY IF EXISTS "company_memberships_update_policy" ON public.company_memberships;
DROP POLICY IF EXISTS "company_memberships_delete_policy" ON public.company_memberships;

-- PASSO 2: CRIAR POLÍTICAS SEGURAS SEM RECURSÃO
-- =============================================

-- Política de SELECT: Usuário pode ver apenas seus próprios registros
CREATE POLICY "company_memberships_select_policy" ON public.company_memberships
    FOR SELECT
    USING (user_id = auth.uid());

-- Política de INSERT: Usuário pode inserir apenas registros para si mesmo
CREATE POLICY "company_memberships_insert_policy" ON public.company_memberships
    FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- Política de UPDATE: Usuário pode atualizar apenas seus próprios registros
CREATE POLICY "company_memberships_update_policy" ON public.company_memberships
    FOR UPDATE
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Política de DELETE: Usuário pode deletar apenas seus próprios registros
CREATE POLICY "company_memberships_delete_policy" ON public.company_memberships
    FOR DELETE
    USING (user_id = auth.uid());

-- PASSO 3: REABILITAR RLS
-- =======================

ALTER TABLE public.company_memberships ENABLE ROW LEVEL SECURITY;

-- PASSO 4: VERIFICAR OUTRAS TABELAS COM POSSÍVEIS PROBLEMAS
-- =========================================================

-- Verificar se a tabela companies também tem problemas similares
-- Se necessário, aplicar correções similares

-- Desabilitar RLS temporariamente para companies
ALTER TABLE public.companies DISABLE ROW LEVEL SECURITY;

-- Remover políticas problemáticas de companies se existirem
DROP POLICY IF EXISTS "companies_select_policy" ON public.companies;
DROP POLICY IF EXISTS "companies_insert_policy" ON public.companies;
DROP POLICY IF EXISTS "companies_update_policy" ON public.companies;
DROP POLICY IF EXISTS "companies_delete_policy" ON public.companies;

-- Criar políticas seguras para companies
-- Usuários podem ver apenas empresas onde são membros
CREATE POLICY "companies_select_policy" ON public.companies
    FOR SELECT
    USING (
        id IN (
            SELECT company_id 
            FROM public.company_memberships 
            WHERE user_id = auth.uid()
        )
    );

-- Apenas admins podem inserir novas empresas
CREATE POLICY "companies_insert_policy" ON public.companies
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 
            FROM public.company_memberships cm
            WHERE cm.user_id = auth.uid() 
            AND cm.company_id = id
            AND cm.role = 'admin'::public.company_role
        )
    );

-- Apenas admins podem atualizar empresas
CREATE POLICY "companies_update_policy" ON public.companies
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 
            FROM public.company_memberships cm
            WHERE cm.user_id = auth.uid() 
            AND cm.company_id = id
            AND cm.role = 'admin'::public.company_role
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 
            FROM public.company_memberships cm
            WHERE cm.user_id = auth.uid() 
            AND cm.company_id = id
            AND cm.role = 'admin'::public.company_role
        )
    );

-- Apenas admins podem deletar empresas
CREATE POLICY "companies_delete_policy" ON public.companies
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 
            FROM public.company_memberships cm
            WHERE cm.user_id = auth.uid() 
            AND cm.company_id = id
            AND cm.role = 'admin'::public.company_role
        )
    );

-- Reabilitar RLS para companies
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- PASSO 5: VERIFICAÇÕES DE STATUS
-- ===============================

-- Verificar se RLS está habilitado
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('company_memberships', 'companies');

-- Verificar políticas criadas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('company_memberships', 'companies')
ORDER BY tablename, policyname;

-- PRINCIPAIS CORREÇÕES APLICADAS:
-- ===============================
-- 1. Removidas políticas que causavam recursão infinita
-- 2. Criadas políticas diretas baseadas em auth.uid()
-- 3. Para company_memberships: acesso apenas aos próprios registros
-- 4. Para companies: acesso baseado em membership direto
-- 5. Verificações de admin usando tipo correto company_role
-- 6. Mantida segurança sem dependências circulares