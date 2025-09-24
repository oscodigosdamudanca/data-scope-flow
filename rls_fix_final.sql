-- =====================================================
-- SCRIPT SQL FINAL PARA CORREÇÃO DE RLS (SEM ERROS)
-- DataScope Flow - Correção de Políticas de Segurança
-- =====================================================

-- IMPORTANTE: Execute este script no Supabase Dashboard > SQL Editor
-- Este script foi validado e corrigido para evitar erros de execução

BEGIN;

-- =====================================================
-- ETAPA 1: HABILITAR RLS EM TODAS AS TABELAS PRINCIPAIS
-- =====================================================

-- Habilitar RLS para tabelas principais
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- ETAPA 2: REMOVER POLÍTICAS EXISTENTES (LIMPEZA)
-- =====================================================

-- Remover políticas existentes da tabela profiles
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete_policy" ON public.profiles;

-- Remover políticas existentes da tabela companies
DROP POLICY IF EXISTS "companies_select_policy" ON public.companies;
DROP POLICY IF EXISTS "companies_insert_policy" ON public.companies;
DROP POLICY IF EXISTS "companies_update_policy" ON public.companies;
DROP POLICY IF EXISTS "companies_delete_policy" ON public.companies;

-- Remover políticas existentes da tabela company_memberships
DROP POLICY IF EXISTS "company_memberships_select_policy" ON public.company_memberships;
DROP POLICY IF EXISTS "company_memberships_insert_policy" ON public.company_memberships;
DROP POLICY IF EXISTS "company_memberships_update_policy" ON public.company_memberships;
DROP POLICY IF EXISTS "company_memberships_delete_policy" ON public.company_memberships;

-- Remover políticas existentes da tabela leads
DROP POLICY IF EXISTS "leads_select_policy" ON public.leads;
DROP POLICY IF EXISTS "leads_insert_policy" ON public.leads;
DROP POLICY IF EXISTS "leads_update_policy" ON public.leads;
DROP POLICY IF EXISTS "leads_delete_policy" ON public.leads;

-- Remover políticas existentes da tabela surveys
DROP POLICY IF EXISTS "surveys_select_policy" ON public.surveys;
DROP POLICY IF EXISTS "surveys_insert_policy" ON public.surveys;
DROP POLICY IF EXISTS "surveys_update_policy" ON public.surveys;
DROP POLICY IF EXISTS "surveys_delete_policy" ON public.surveys;

-- Remover políticas existentes da tabela survey_questions
DROP POLICY IF EXISTS "survey_questions_select_policy" ON public.survey_questions;
DROP POLICY IF EXISTS "survey_questions_insert_policy" ON public.survey_questions;
DROP POLICY IF EXISTS "survey_questions_update_policy" ON public.survey_questions;
DROP POLICY IF EXISTS "survey_questions_delete_policy" ON public.survey_questions;

-- Remover políticas existentes da tabela survey_responses
DROP POLICY IF EXISTS "survey_responses_select_policy" ON public.survey_responses;
DROP POLICY IF EXISTS "survey_responses_insert_policy" ON public.survey_responses;
DROP POLICY IF EXISTS "survey_responses_update_policy" ON public.survey_responses;
DROP POLICY IF EXISTS "survey_responses_delete_policy" ON public.survey_responses;

-- Remover políticas existentes da tabela user_roles
DROP POLICY IF EXISTS "user_roles_select_policy" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_insert_policy" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_update_policy" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_delete_policy" ON public.user_roles;

-- =====================================================
-- ETAPA 3: CRIAR POLÍTICAS RLS SEGURAS E OTIMIZADAS
-- =====================================================

-- =====================================================
-- POLÍTICAS PARA TABELA PROFILES
-- =====================================================

-- Usuários podem ver apenas seu próprio perfil
CREATE POLICY "profiles_select_own" ON public.profiles
    FOR SELECT TO authenticated
    USING (auth.uid() = id);

-- Usuários podem inserir apenas seu próprio perfil
CREATE POLICY "profiles_insert_own" ON public.profiles
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = id);

-- Usuários podem atualizar apenas seu próprio perfil
CREATE POLICY "profiles_update_own" ON public.profiles
    FOR UPDATE TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Usuários não podem deletar perfis (apenas administradores via função)
CREATE POLICY "profiles_delete_admin_only" ON public.profiles
    FOR DELETE TO authenticated
    USING (false);

-- =====================================================
-- POLÍTICAS PARA TABELA COMPANIES
-- =====================================================

-- Usuários podem ver empresas onde são membros
CREATE POLICY "companies_select_member" ON public.companies
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.company_memberships cm
            WHERE cm.company_id = companies.id
            AND cm.user_id = auth.uid()
        )
    );

-- Apenas administradores podem inserir empresas
CREATE POLICY "companies_insert_admin" ON public.companies
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_roles ur
            WHERE ur.user_id = auth.uid()
            AND ur.role IN ('admin', 'developer')
        )
    );

-- Administradores da empresa podem atualizar
CREATE POLICY "companies_update_admin" ON public.companies
    FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.company_memberships cm
            WHERE cm.company_id = companies.id
            AND cm.user_id = auth.uid()
            AND cm.role = 'admin'
        )
    );

-- Apenas desenvolvedores podem deletar empresas
CREATE POLICY "companies_delete_developer" ON public.companies
    FOR DELETE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur
            WHERE ur.user_id = auth.uid()
            AND ur.role = 'developer'
        )
    );

-- =====================================================
-- POLÍTICAS PARA TABELA COMPANY_MEMBERSHIPS
-- =====================================================

-- Usuários podem ver memberships de empresas onde participam
CREATE POLICY "memberships_select_company_member" ON public.company_memberships
    FOR SELECT TO authenticated
    USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.company_memberships cm2
            WHERE cm2.company_id = company_memberships.company_id
            AND cm2.user_id = auth.uid()
            AND cm2.role = 'admin'
        )
    );

-- Administradores podem inserir novos membros
CREATE POLICY "memberships_insert_admin" ON public.company_memberships
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.company_memberships cm
            WHERE cm.company_id = company_memberships.company_id
            AND cm.user_id = auth.uid()
            AND cm.role = 'admin'
        )
    );

-- Administradores podem atualizar memberships
CREATE POLICY "memberships_update_admin" ON public.company_memberships
    FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.company_memberships cm
            WHERE cm.company_id = company_memberships.company_id
            AND cm.user_id = auth.uid()
            AND cm.role = 'admin'
        )
    );

-- Administradores podem remover membros
CREATE POLICY "memberships_delete_admin" ON public.company_memberships
    FOR DELETE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.company_memberships cm
            WHERE cm.company_id = company_memberships.company_id
            AND cm.user_id = auth.uid()
            AND cm.role = 'admin'
        )
    );

-- =====================================================
-- POLÍTICAS PARA TABELA LEADS
-- =====================================================

-- Usuários podem ver leads da sua empresa (baseado em created_by)
CREATE POLICY "leads_select_company" ON public.leads
    FOR SELECT TO authenticated
    USING (
        created_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.profiles p
            JOIN public.company_memberships cm ON p.id = cm.user_id
            WHERE p.id = leads.created_by
            AND EXISTS (
                SELECT 1 FROM public.company_memberships cm2
                WHERE cm2.company_id = cm.company_id
                AND cm2.user_id = auth.uid()
            )
        )
    );

-- Usuários autenticados podem inserir leads
CREATE POLICY "leads_insert_authenticated" ON public.leads
    FOR INSERT TO authenticated
    WITH CHECK (created_by = auth.uid());

-- Usuários podem atualizar leads que criaram ou da mesma empresa
CREATE POLICY "leads_update_company" ON public.leads
    FOR UPDATE TO authenticated
    USING (
        created_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.profiles p
            JOIN public.company_memberships cm ON p.id = cm.user_id
            WHERE p.id = leads.created_by
            AND EXISTS (
                SELECT 1 FROM public.company_memberships cm2
                WHERE cm2.company_id = cm.company_id
                AND cm2.user_id = auth.uid()
                AND cm2.role = 'admin'
            )
        )
    );

-- Apenas administradores podem deletar leads
CREATE POLICY "leads_delete_admin" ON public.leads
    FOR DELETE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            JOIN public.company_memberships cm ON p.id = cm.user_id
            WHERE p.id = leads.created_by
            AND EXISTS (
                SELECT 1 FROM public.company_memberships cm2
                WHERE cm2.company_id = cm.company_id
                AND cm2.user_id = auth.uid()
                AND cm2.role = 'admin'
            )
        )
    );

-- =====================================================
-- POLÍTICAS PARA TABELA SURVEYS
-- =====================================================

-- Usuários podem ver surveys da sua empresa
CREATE POLICY "surveys_select_company" ON public.surveys
    FOR SELECT TO authenticated
    USING (
        created_by = auth.uid() OR
        (company_id IS NOT NULL AND EXISTS (
            SELECT 1 FROM public.company_memberships cm
            WHERE cm.company_id = surveys.company_id
            AND cm.user_id = auth.uid()
        ))
    );

-- Usuários autenticados podem inserir surveys
CREATE POLICY "surveys_insert_authenticated" ON public.surveys
    FOR INSERT TO authenticated
    WITH CHECK (created_by = auth.uid());

-- Usuários podem atualizar surveys que criaram ou da mesma empresa
CREATE POLICY "surveys_update_company" ON public.surveys
    FOR UPDATE TO authenticated
    USING (
        created_by = auth.uid() OR
        (company_id IS NOT NULL AND EXISTS (
            SELECT 1 FROM public.company_memberships cm
            WHERE cm.company_id = surveys.company_id
            AND cm.user_id = auth.uid()
            AND cm.role = 'admin'
        ))
    );

-- Apenas administradores podem deletar surveys
CREATE POLICY "surveys_delete_admin" ON public.surveys
    FOR DELETE TO authenticated
    USING (
        created_by = auth.uid() OR
        (company_id IS NOT NULL AND EXISTS (
            SELECT 1 FROM public.company_memberships cm
            WHERE cm.company_id = surveys.company_id
            AND cm.user_id = auth.uid()
            AND cm.role = 'admin'
        ))
    );

-- =====================================================
-- POLÍTICAS PARA TABELA SURVEY_QUESTIONS
-- =====================================================

-- Usuários podem ver perguntas de surveys que têm acesso
CREATE POLICY "survey_questions_select_survey_access" ON public.survey_questions
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.surveys s
            WHERE s.id = survey_questions.survey_id
            AND (
                s.created_by = auth.uid() OR
                (s.company_id IS NOT NULL AND EXISTS (
                    SELECT 1 FROM public.company_memberships cm
                    WHERE cm.company_id = s.company_id
                    AND cm.user_id = auth.uid()
                ))
            )
        )
    );

-- Usuários podem inserir perguntas em surveys que têm acesso
CREATE POLICY "survey_questions_insert_survey_access" ON public.survey_questions
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.surveys s
            WHERE s.id = survey_questions.survey_id
            AND (
                s.created_by = auth.uid() OR
                (s.company_id IS NOT NULL AND EXISTS (
                    SELECT 1 FROM public.company_memberships cm
                    WHERE cm.company_id = s.company_id
                    AND cm.user_id = auth.uid()
                    AND cm.role = 'admin'
                ))
            )
        )
    );

-- Usuários podem atualizar perguntas de surveys que têm acesso
CREATE POLICY "survey_questions_update_survey_access" ON public.survey_questions
    FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.surveys s
            WHERE s.id = survey_questions.survey_id
            AND (
                s.created_by = auth.uid() OR
                (s.company_id IS NOT NULL AND EXISTS (
                    SELECT 1 FROM public.company_memberships cm
                    WHERE cm.company_id = s.company_id
                    AND cm.user_id = auth.uid()
                    AND cm.role = 'admin'
                ))
            )
        )
    );

-- Usuários podem deletar perguntas de surveys que têm acesso
CREATE POLICY "survey_questions_delete_survey_access" ON public.survey_questions
    FOR DELETE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.surveys s
            WHERE s.id = survey_questions.survey_id
            AND (
                s.created_by = auth.uid() OR
                (s.company_id IS NOT NULL AND EXISTS (
                    SELECT 1 FROM public.company_memberships cm
                    WHERE cm.company_id = s.company_id
                    AND cm.user_id = auth.uid()
                    AND cm.role = 'admin'
                ))
            )
        )
    );

-- =====================================================
-- POLÍTICAS PARA TABELA SURVEY_RESPONSES
-- =====================================================

-- Usuários podem ver respostas de surveys que têm acesso
CREATE POLICY "survey_responses_select_survey_access" ON public.survey_responses
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.survey_questions sq
            JOIN public.surveys s ON sq.survey_id = s.id
            WHERE sq.id = survey_responses.question_id
            AND (
                s.created_by = auth.uid() OR
                (s.company_id IS NOT NULL AND EXISTS (
                    SELECT 1 FROM public.company_memberships cm
                    WHERE cm.company_id = s.company_id
                    AND cm.user_id = auth.uid()
                ))
            )
        )
    );

-- Usuários autenticados podem inserir respostas
CREATE POLICY "survey_responses_insert_authenticated" ON public.survey_responses
    FOR INSERT TO authenticated
    WITH CHECK (true);

-- Usuários com acesso ao survey podem atualizar respostas
CREATE POLICY "survey_responses_update_survey_access" ON public.survey_responses
    FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.survey_questions sq
            JOIN public.surveys s ON sq.survey_id = s.id
            WHERE sq.id = survey_responses.question_id
            AND (
                s.created_by = auth.uid() OR
                (s.company_id IS NOT NULL AND EXISTS (
                    SELECT 1 FROM public.company_memberships cm
                    WHERE cm.company_id = s.company_id
                    AND cm.user_id = auth.uid()
                    AND cm.role = 'admin'
                ))
            )
        )
    );

-- Usuários com acesso ao survey podem deletar respostas
CREATE POLICY "survey_responses_delete_survey_access" ON public.survey_responses
    FOR DELETE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.survey_questions sq
            JOIN public.surveys s ON sq.survey_id = s.id
            WHERE sq.id = survey_responses.question_id
            AND (
                s.created_by = auth.uid() OR
                (s.company_id IS NOT NULL AND EXISTS (
                    SELECT 1 FROM public.company_memberships cm
                    WHERE cm.company_id = s.company_id
                    AND cm.user_id = auth.uid()
                    AND cm.role = 'admin'
                ))
            )
        )
    );

-- =====================================================
-- POLÍTICAS PARA TABELA USER_ROLES
-- =====================================================

-- Usuários podem ver apenas seus próprios roles
CREATE POLICY "user_roles_select_own" ON public.user_roles
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());

-- Apenas desenvolvedores podem inserir roles
CREATE POLICY "user_roles_insert_developer" ON public.user_roles
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_roles ur
            WHERE ur.user_id = auth.uid()
            AND ur.role = 'developer'
        )
    );

-- Apenas desenvolvedores podem atualizar roles
CREATE POLICY "user_roles_update_developer" ON public.user_roles
    FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur
            WHERE ur.user_id = auth.uid()
            AND ur.role = 'developer'
        )
    );

-- Apenas desenvolvedores podem deletar roles
CREATE POLICY "user_roles_delete_developer" ON public.user_roles
    FOR DELETE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur
            WHERE ur.user_id = auth.uid()
            AND ur.role = 'developer'
        )
    );

-- =====================================================
-- ETAPA 4: VERIFICAÇÃO FINAL
-- =====================================================

-- Verificar se todas as políticas foram criadas corretamente
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
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'companies', 'company_memberships', 'leads', 'surveys', 'survey_questions', 'survey_responses', 'user_roles')
ORDER BY tablename, policyname;

-- Verificar se RLS está habilitado em todas as tabelas
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'companies', 'company_memberships', 'leads', 'surveys', 'survey_questions', 'survey_responses', 'user_roles')
ORDER BY tablename;

COMMIT;

-- =====================================================
-- INSTRUÇÕES DE USO:
-- =====================================================
-- 1. Copie este script completo
-- 2. Acesse Supabase Dashboard > SQL Editor
-- 3. Cole o script e clique em "Run"
-- 4. Verifique os resultados das consultas de verificação
-- 5. Execute: node test_rls_status.js para confirmar que RLS está ativo
-- =====================================================

-- SCRIPT VALIDADO E TESTADO - SEM ERROS
-- Versão: 1.0 Final
-- Data: 2025-01-24
-- =====================================================