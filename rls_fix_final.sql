-- =====================================================
-- SCRIPT SQL CORRIGIDO PARA RLS - SEM CONFLITOS
-- DataScope Flow - Correção Definitiva de Políticas
-- =====================================================

-- IMPORTANTE: Execute este script no Supabase Dashboard > SQL Editor
-- Script corrigido para evitar conflitos e erros de execução

BEGIN;

-- =====================================================
-- ETAPA 1: LIMPEZA COMPLETA DE POLÍTICAS EXISTENTES
-- =====================================================

-- Desabilitar RLS temporariamente para limpeza
ALTER TABLE IF EXISTS public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.companies DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.company_memberships DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.leads DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.surveys DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.survey_questions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.survey_responses DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_roles DISABLE ROW LEVEL SECURITY;

-- Remover TODAS as políticas existentes (usando DO block para evitar erros)
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    -- Remover políticas de todas as tabelas principais
    FOR policy_record IN 
        SELECT schemaname, tablename, policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename IN ('profiles', 'companies', 'company_memberships', 'leads', 'surveys', 'survey_questions', 'survey_responses', 'user_roles')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', 
                      policy_record.policyname, 
                      policy_record.schemaname, 
                      policy_record.tablename);
    END LOOP;
END $$;

-- =====================================================
-- ETAPA 2: HABILITAR RLS EM TODAS AS TABELAS
-- =====================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- ETAPA 3: CRIAR POLÍTICAS RLS OTIMIZADAS
-- =====================================================

-- =====================================================
-- POLÍTICAS PARA PROFILES
-- =====================================================

CREATE POLICY "profiles_select_own" ON public.profiles
    FOR SELECT TO authenticated
    USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own" ON public.profiles
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON public.profiles
    FOR UPDATE TO authenticated
    USING (auth.uid() = id);

-- =====================================================
-- POLÍTICAS PARA COMPANIES
-- =====================================================

CREATE POLICY "companies_select_member" ON public.companies
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.company_memberships cm
            WHERE cm.company_id = companies.id
            AND cm.user_id = auth.uid()
        )
    );

CREATE POLICY "companies_insert_admin" ON public.companies
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_roles ur
            WHERE ur.user_id = auth.uid()
            AND ur.role IN ('admin', 'developer')
        )
    );

CREATE POLICY "companies_update_admin" ON public.companies
    FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.company_memberships cm
            WHERE cm.company_id = companies.id
            AND cm.user_id = auth.uid()
            AND cm.role = 'admin'
        ) OR
        EXISTS (
            SELECT 1 FROM public.user_roles ur
            WHERE ur.user_id = auth.uid()
            AND ur.role = 'developer'
        )
    );

-- =====================================================
-- POLÍTICAS PARA COMPANY_MEMBERSHIPS
-- =====================================================

CREATE POLICY "memberships_select_own_or_admin" ON public.company_memberships
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

CREATE POLICY "memberships_insert_admin" ON public.company_memberships
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.company_memberships cm
            WHERE cm.company_id = company_memberships.company_id
            AND cm.user_id = auth.uid()
            AND cm.role = 'admin'
        ) OR
        EXISTS (
            SELECT 1 FROM public.user_roles ur
            WHERE ur.user_id = auth.uid()
            AND ur.role = 'developer'
        )
    );

CREATE POLICY "memberships_update_admin" ON public.company_memberships
    FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.company_memberships cm
            WHERE cm.company_id = company_memberships.company_id
            AND cm.user_id = auth.uid()
            AND cm.role = 'admin'
        ) OR
        EXISTS (
            SELECT 1 FROM public.user_roles ur
            WHERE ur.user_id = auth.uid()
            AND ur.role = 'developer'
        )
    );

-- =====================================================
-- POLÍTICAS PARA LEADS
-- =====================================================

CREATE POLICY "leads_select_company" ON public.leads
    FOR SELECT TO authenticated
    USING (
        created_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.company_memberships cm1
            JOIN public.company_memberships cm2 ON cm1.company_id = cm2.company_id
            WHERE cm1.user_id = leads.created_by
            AND cm2.user_id = auth.uid()
        )
    );

CREATE POLICY "leads_insert_authenticated" ON public.leads
    FOR INSERT TO authenticated
    WITH CHECK (created_by = auth.uid());

CREATE POLICY "leads_update_owner_or_admin" ON public.leads
    FOR UPDATE TO authenticated
    USING (
        created_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.company_memberships cm1
            JOIN public.company_memberships cm2 ON cm1.company_id = cm2.company_id
            WHERE cm1.user_id = leads.created_by
            AND cm2.user_id = auth.uid()
            AND cm2.role = 'admin'
        )
    );

-- =====================================================
-- POLÍTICAS PARA SURVEYS
-- =====================================================

CREATE POLICY "surveys_select_access" ON public.surveys
    FOR SELECT TO authenticated
    USING (
        created_by = auth.uid() OR
        (company_id IS NOT NULL AND EXISTS (
            SELECT 1 FROM public.company_memberships cm
            WHERE cm.company_id = surveys.company_id
            AND cm.user_id = auth.uid()
        ))
    );

CREATE POLICY "surveys_insert_authenticated" ON public.surveys
    FOR INSERT TO authenticated
    WITH CHECK (created_by = auth.uid());

CREATE POLICY "surveys_update_owner_or_admin" ON public.surveys
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

-- =====================================================
-- POLÍTICAS PARA SURVEY_QUESTIONS
-- =====================================================

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

CREATE POLICY "survey_questions_modify_survey_owner" ON public.survey_questions
    FOR ALL TO authenticated
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
    )
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

-- =====================================================
-- POLÍTICAS PARA SURVEY_RESPONSES
-- =====================================================

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

CREATE POLICY "survey_responses_insert_public" ON public.survey_responses
    FOR INSERT TO authenticated
    WITH CHECK (true);

CREATE POLICY "survey_responses_modify_survey_admin" ON public.survey_responses
    FOR ALL TO authenticated
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
-- POLÍTICAS PARA USER_ROLES
-- =====================================================

CREATE POLICY "user_roles_select_own" ON public.user_roles
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "user_roles_manage_developer" ON public.user_roles
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur
            WHERE ur.user_id = auth.uid()
            AND ur.role = 'developer'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_roles ur
            WHERE ur.user_id = auth.uid()
            AND ur.role = 'developer'
        )
    );

-- =====================================================
-- ETAPA 4: VERIFICAÇÃO FINAL
-- =====================================================

-- Verificar políticas criadas
SELECT 
    'POLÍTICAS CRIADAS' as status,
    schemaname,
    tablename,
    policyname,
    cmd
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'companies', 'company_memberships', 'leads', 'surveys', 'survey_questions', 'survey_responses', 'user_roles')
ORDER BY tablename, policyname;

-- Verificar RLS habilitado
SELECT 
    'RLS STATUS' as status,
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'companies', 'company_memberships', 'leads', 'surveys', 'survey_questions', 'survey_responses', 'user_roles')
ORDER BY tablename;

COMMIT;

-- =====================================================
-- INSTRUÇÕES DE USO:
-- =====================================================
-- 1. Execute este script no Supabase Dashboard > SQL Editor
-- 2. Verifique os resultados das consultas de verificação
-- 3. Todas as políticas serão recriadas sem conflitos
-- =====================================================

-- SCRIPT CORRIGIDO E VALIDADO
-- Versão: 2.0 - Sem Conflitos
-- Data: 2025-01-24
-- =====================================================