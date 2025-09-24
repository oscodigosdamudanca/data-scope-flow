-- =====================================================
-- CORREÇÃO MANUAL DE POLÍTICAS RLS - DataScope Flow
-- Execute este script no SQL Editor do Supabase Dashboard
-- =====================================================

-- PASSO 1: Habilitar RLS em todas as tabelas principais
-- =====================================================
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- PASSO 2: Remover políticas existentes que podem estar causando conflitos
-- =====================================================
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view companies they belong to" ON public.companies;
DROP POLICY IF EXISTS "Company admins can update company" ON public.companies;
DROP POLICY IF EXISTS "Users can view their memberships" ON public.company_memberships;
DROP POLICY IF EXISTS "Company admins can manage memberships" ON public.company_memberships;

-- Remover políticas duplicadas das tabelas principais
DROP POLICY IF EXISTS "leads_delete_policy" ON public.leads;
DROP POLICY IF EXISTS "leads_insert_policy" ON public.leads;
DROP POLICY IF EXISTS "leads_select_policy" ON public.leads;
DROP POLICY IF EXISTS "leads_update_policy" ON public.leads;

DROP POLICY IF EXISTS "surveys_delete_policy" ON public.surveys;
DROP POLICY IF EXISTS "surveys_insert_policy" ON public.surveys;
DROP POLICY IF EXISTS "surveys_select_policy" ON public.surveys;
DROP POLICY IF EXISTS "surveys_update_policy" ON public.surveys;

-- PASSO 3: Criar políticas RLS seguras e otimizadas
-- =====================================================

-- TABELA: profiles
-- Usuários podem ver e editar apenas seu próprio perfil
CREATE POLICY "profiles_own_data" ON public.profiles
    FOR ALL
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- TABELA: companies
-- Usuários podem ver empresas onde são membros
CREATE POLICY "companies_member_access" ON public.companies
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.company_memberships cm
            WHERE cm.company_id = companies.id
            AND cm.user_id = auth.uid()
        )
    );

-- Administradores podem atualizar dados da empresa
CREATE POLICY "companies_admin_update" ON public.companies
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.company_memberships cm
            WHERE cm.company_id = companies.id
            AND cm.user_id = auth.uid()
            AND cm.role = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.company_memberships cm
            WHERE cm.company_id = companies.id
            AND cm.user_id = auth.uid()
            AND cm.role = 'admin'
        )
    );

-- TABELA: company_memberships
-- Usuários podem ver suas próprias associações
CREATE POLICY "memberships_own_access" ON public.company_memberships
    FOR SELECT
    USING (user_id = auth.uid());

-- Administradores podem gerenciar membros da empresa
CREATE POLICY "memberships_admin_manage" ON public.company_memberships
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.company_memberships cm
            WHERE cm.company_id = company_memberships.company_id
            AND cm.user_id = auth.uid()
            AND cm.role = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.company_memberships cm
            WHERE cm.company_id = company_memberships.company_id
            AND cm.user_id = auth.uid()
            AND cm.role = 'admin'
        )
    );

-- TABELA: leads
-- Usuários podem ver leads de suas empresas
CREATE POLICY "leads_company_access" ON public.leads
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.company_memberships cm
            WHERE cm.user_id = auth.uid()
            AND cm.company_id = leads.company_id
        )
    );

-- Usuários podem inserir leads para suas empresas
CREATE POLICY "leads_company_insert" ON public.leads
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.company_memberships cm
            WHERE cm.user_id = auth.uid()
            AND cm.company_id = leads.company_id
        )
    );

-- Usuários podem atualizar leads de suas empresas
CREATE POLICY "leads_company_update" ON public.leads
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.company_memberships cm
            WHERE cm.user_id = auth.uid()
            AND cm.company_id = leads.company_id
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.company_memberships cm
            WHERE cm.user_id = auth.uid()
            AND cm.company_id = leads.company_id
        )
    );

-- TABELA: surveys
-- Usuários podem ver pesquisas de suas empresas
CREATE POLICY "surveys_company_access" ON public.surveys
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.company_memberships cm
            WHERE cm.user_id = auth.uid()
            AND cm.company_id = surveys.company_id
        )
    );

-- Administradores podem gerenciar pesquisas
CREATE POLICY "surveys_admin_manage" ON public.surveys
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.company_memberships cm
            WHERE cm.user_id = auth.uid()
            AND cm.company_id = surveys.company_id
            AND cm.role = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.company_memberships cm
            WHERE cm.user_id = auth.uid()
            AND cm.company_id = surveys.company_id
            AND cm.role = 'admin'
        )
    );

-- TABELA: survey_questions
-- Usuários podem ver perguntas de pesquisas de suas empresas
CREATE POLICY "survey_questions_company_access" ON public.survey_questions
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.surveys s
            JOIN public.company_memberships cm ON cm.company_id = s.company_id
            WHERE s.id = survey_questions.survey_id
            AND cm.user_id = auth.uid()
        )
    );

-- Administradores podem gerenciar perguntas
CREATE POLICY "survey_questions_admin_manage" ON public.survey_questions
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.surveys s
            JOIN public.company_memberships cm ON cm.company_id = s.company_id
            WHERE s.id = survey_questions.survey_id
            AND cm.user_id = auth.uid()
            AND cm.role = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.surveys s
            JOIN public.company_memberships cm ON cm.company_id = s.company_id
            WHERE s.id = survey_questions.survey_id
            AND cm.user_id = auth.uid()
            AND cm.role = 'admin'
        )
    );

-- TABELA: survey_responses
-- Usuários podem ver respostas de pesquisas de suas empresas
CREATE POLICY "survey_responses_company_access" ON public.survey_responses
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.surveys s
            JOIN public.company_memberships cm ON cm.company_id = s.company_id
            WHERE s.id = survey_responses.survey_id
            AND cm.user_id = auth.uid()
        )
    );

-- Usuários podem inserir respostas
CREATE POLICY "survey_responses_insert" ON public.survey_responses
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.surveys s
            JOIN public.company_memberships cm ON cm.company_id = s.company_id
            WHERE s.id = survey_responses.survey_id
            AND cm.user_id = auth.uid()
        )
    );

-- TABELA: user_roles
-- Usuários podem ver seus próprios roles
CREATE POLICY "user_roles_own_access" ON public.user_roles
    FOR SELECT
    USING (user_id = auth.uid());

-- Administradores podem gerenciar roles
CREATE POLICY "user_roles_admin_manage" ON public.user_roles
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.company_memberships cm
            WHERE cm.user_id = auth.uid()
            AND cm.role = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.company_memberships cm
            WHERE cm.user_id = auth.uid()
            AND cm.role = 'admin'
        )
    );

-- PASSO 4: Verificar se as políticas foram criadas corretamente
-- =====================================================
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
ORDER BY tablename, policyname;

-- =====================================================
-- FIM DO SCRIPT
-- =====================================================