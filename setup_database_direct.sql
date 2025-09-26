-- =====================================================
-- SCRIPT COMPLETO PARA SETUP DO BANCO DE DADOS
-- Execute este script no painel SQL do Supabase
-- =====================================================

-- 1. CRIAR EXTENSÕES NECESSÁRIAS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. CRIAR TABELA COMPANIES
CREATE TABLE IF NOT EXISTS public.companies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  domain VARCHAR(255),
  industry VARCHAR(100),
  size VARCHAR(50) CHECK (size IN ('startup', 'small', 'medium', 'large', 'enterprise')),
  description TEXT,
  website VARCHAR(255),
  phone VARCHAR(20),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  country VARCHAR(100) DEFAULT 'Brasil',
  postal_code VARCHAR(20),
  logo_url TEXT,
  settings JSONB DEFAULT '{}',
  subscription_plan VARCHAR(50) DEFAULT 'free',
  subscription_status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID
);

-- 3. CRIAR TABELA PROFILES (ESTENDENDO AUTH.USERS)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email VARCHAR(255),
  full_name VARCHAR(255),
  avatar_url TEXT,
  app_role VARCHAR(50) DEFAULT 'interviewer' CHECK (app_role IN ('developer', 'organizer', 'admin', 'interviewer')),
  company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
  permissions JSONB DEFAULT '{}',
  settings JSONB DEFAULT '{}',
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. CRIAR TABELA LEADS
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  company VARCHAR(255),
  position VARCHAR(255),
  source VARCHAR(100),
  status VARCHAR(50) DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'converted', 'lost')),
  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  notes TEXT,
  tags TEXT[],
  custom_fields JSONB DEFAULT '{}',
  lgpd_consent BOOLEAN DEFAULT false,
  last_contact_date TIMESTAMP WITH TIME ZONE,
  next_follow_up_date TIMESTAMP WITH TIME ZONE,
  conversion_date TIMESTAMP WITH TIME ZONE,
  lead_score INTEGER DEFAULT 0 CHECK (lead_score >= 0 AND lead_score <= 100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES public.profiles(id),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE
);

-- 5. CRIAR TABELA SURVEYS
CREATE TABLE IF NOT EXISTS public.surveys (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed', 'archived')),
  survey_type VARCHAR(50) DEFAULT 'feedback' CHECK (survey_type IN ('feedback', 'satisfaction', 'nps', 'custom', 'lead_qualification')),
  settings JSONB DEFAULT '{}',
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  target_audience TEXT,
  response_limit INTEGER,
  anonymous_responses BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES public.profiles(id),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE
);

-- 6. CRIAR TABELA SURVEY_QUESTIONS
CREATE TABLE IF NOT EXISTS public.survey_questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  survey_id UUID REFERENCES public.surveys(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type VARCHAR(50) NOT NULL CHECK (question_type IN ('text', 'textarea', 'select', 'multiselect', 'radio', 'checkbox', 'rating', 'date', 'email', 'phone')),
  options JSONB DEFAULT '[]',
  required BOOLEAN DEFAULT false,
  order_index INTEGER DEFAULT 0,
  validation_rules JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. CRIAR TABELA SURVEY_RESPONSES
CREATE TABLE IF NOT EXISTS public.survey_responses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  survey_id UUID REFERENCES public.surveys(id) ON DELETE CASCADE,
  question_id UUID REFERENCES public.survey_questions(id) ON DELETE CASCADE,
  respondent_id UUID,
  response_value TEXT,
  response_data JSONB DEFAULT '{}',
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT
);

-- 8. CRIAR TABELA MODULE_PERMISSIONS
CREATE TABLE IF NOT EXISTS public.module_permissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  module_name VARCHAR(100) NOT NULL,
  permission_name VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(module_name, permission_name)
);

-- 9. CRIAR TABELA RAFFLE_PARTICIPANTS
CREATE TABLE IF NOT EXISTS public.raffle_participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  participant_name VARCHAR(255) NOT NULL,
  participant_email VARCHAR(255) NOT NULL,
  participant_phone VARCHAR(20),
  is_winner BOOLEAN DEFAULT false,
  prize_position INTEGER,
  prize_description TEXT,
  drawn_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. CRIAR TABELA USER_ROLES (PARA COMPATIBILIDADE)
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  role_name VARCHAR(50) NOT NULL,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, role_name, company_id)
);

-- 11. CRIAR TABELA USER_PERMISSIONS (PARA COMPATIBILIDADE)
CREATE TABLE IF NOT EXISTS public.user_permissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  permission_id UUID REFERENCES public.module_permissions(id) ON DELETE CASCADE,
  granted_by UUID REFERENCES public.profiles(id),
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, permission_id)
);

-- 12. INSERIR PERMISSÕES BÁSICAS
INSERT INTO public.module_permissions (module_name, permission_name, description) VALUES
('leads', 'create', 'Criar novos leads'),
('leads', 'read', 'Visualizar leads'),
('leads', 'update', 'Atualizar leads'),
('leads', 'delete', 'Excluir leads'),
('surveys', 'create', 'Criar pesquisas'),
('surveys', 'read', 'Visualizar pesquisas'),
('surveys', 'update', 'Atualizar pesquisas'),
('surveys', 'delete', 'Excluir pesquisas'),
('raffles', 'create', 'Criar sorteios'),
('raffles', 'read', 'Visualizar sorteios'),
('raffles', 'execute', 'Executar sorteios'),
('analytics', 'read', 'Visualizar relatórios'),
('feedback', 'create', 'Criar feedback'),
('feedback', 'read', 'Visualizar feedback')
ON CONFLICT (module_name, permission_name) DO NOTHING;

-- 13. HABILITAR ROW LEVEL SECURITY
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.module_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.raffle_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_permissions ENABLE ROW LEVEL SECURITY;

-- 14. CRIAR POLÍTICAS RLS

-- Políticas para profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Developers can manage all profiles" ON public.profiles;

CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Developers can manage all profiles" ON public.profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.app_role = 'developer'
    )
  );

-- Políticas para companies
DROP POLICY IF EXISTS "Company members can view their company" ON public.companies;
DROP POLICY IF EXISTS "Developers can manage all companies" ON public.companies;

CREATE POLICY "Company members can view their company" ON public.companies
  FOR SELECT USING (
    id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY "Developers can manage all companies" ON public.companies
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.app_role = 'developer'
    )
  );

-- Políticas para leads
DROP POLICY IF EXISTS "Company members can manage company leads" ON public.leads;

CREATE POLICY "Company members can manage company leads" ON public.leads
  FOR ALL USING (
    company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
  );

-- Políticas para surveys
DROP POLICY IF EXISTS "Company members can manage company surveys" ON public.surveys;

CREATE POLICY "Company members can manage company surveys" ON public.surveys
  FOR ALL USING (
    company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
  );

-- Políticas para module_permissions
DROP POLICY IF EXISTS "All authenticated users can read permissions" ON public.module_permissions;

CREATE POLICY "All authenticated users can read permissions" ON public.module_permissions
  FOR SELECT USING (auth.role() = 'authenticated');

-- Políticas para survey_questions
CREATE POLICY "Company members can manage survey questions" ON public.survey_questions
  FOR ALL USING (
    survey_id IN (
      SELECT id FROM public.surveys 
      WHERE company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
    )
  );

-- Políticas para survey_responses
CREATE POLICY "Company members can view survey responses" ON public.survey_responses
  FOR SELECT USING (
    survey_id IN (
      SELECT id FROM public.surveys 
      WHERE company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
    )
  );

-- Políticas para raffle_participants
CREATE POLICY "Company members can manage raffle participants" ON public.raffle_participants
  FOR ALL USING (
    company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
  );

-- 15. CRIAR FUNÇÃO PARA TRIGGER DE UPDATED_AT
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 16. CRIAR TRIGGERS PARA UPDATED_AT
DROP TRIGGER IF EXISTS handle_updated_at_profiles ON public.profiles;
DROP TRIGGER IF EXISTS handle_updated_at_companies ON public.companies;
DROP TRIGGER IF EXISTS handle_updated_at_leads ON public.leads;
DROP TRIGGER IF EXISTS handle_updated_at_surveys ON public.surveys;
DROP TRIGGER IF EXISTS handle_updated_at_survey_questions ON public.survey_questions;
DROP TRIGGER IF EXISTS handle_updated_at_raffle_participants ON public.raffle_participants;

CREATE TRIGGER handle_updated_at_profiles
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at_companies
  BEFORE UPDATE ON public.companies
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at_leads
  BEFORE UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at_surveys
  BEFORE UPDATE ON public.surveys
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at_survey_questions
  BEFORE UPDATE ON public.survey_questions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at_raffle_participants
  BEFORE UPDATE ON public.raffle_participants
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 17. CRIAR ÍNDICES PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_company_id ON public.profiles(company_id);
CREATE INDEX IF NOT EXISTS idx_profiles_app_role ON public.profiles(app_role);
CREATE INDEX IF NOT EXISTS idx_leads_company_id ON public.leads(company_id);
CREATE INDEX IF NOT EXISTS idx_leads_email ON public.leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);
CREATE INDEX IF NOT EXISTS idx_surveys_company_id ON public.surveys(company_id);
CREATE INDEX IF NOT EXISTS idx_survey_questions_survey_id ON public.survey_questions(survey_id);
CREATE INDEX IF NOT EXISTS idx_survey_responses_survey_id ON public.survey_responses(survey_id);
CREATE INDEX IF NOT EXISTS idx_raffle_participants_company_id ON public.raffle_participants(company_id);
CREATE INDEX IF NOT EXISTS idx_raffle_participants_lead_id ON public.raffle_participants(lead_id);

-- 18. CRIAR VIEW PARA PERMISSÕES DE USUÁRIO
CREATE OR REPLACE VIEW public.user_module_permissions AS
SELECT 
  p.id as profile_id,
  p.email,
  p.app_role,
  p.company_id,
  mp.module_name,
  mp.permission_name,
  mp.description,
  CASE 
    WHEN p.app_role = 'developer' THEN true
    WHEN p.app_role = 'organizer' AND mp.module_name IN ('feedback', 'surveys', 'analytics') THEN true
    WHEN p.app_role = 'admin' AND mp.module_name IN ('leads', 'raffles', 'analytics') THEN true
    WHEN p.app_role = 'interviewer' AND mp.module_name = 'leads' AND mp.permission_name IN ('create', 'read') THEN true
    ELSE false
  END as has_permission
FROM public.profiles p
CROSS JOIN public.module_permissions mp
WHERE p.id = auth.uid() OR p.app_role = 'developer';

-- 19. COMENTÁRIOS PARA DOCUMENTAÇÃO
COMMENT ON TABLE public.companies IS 'Tabela de empresas/expositores';
COMMENT ON TABLE public.profiles IS 'Perfis de usuários estendendo auth.users';
COMMENT ON TABLE public.leads IS 'Leads captados pelos expositores';
COMMENT ON TABLE public.surveys IS 'Pesquisas e formulários';
COMMENT ON TABLE public.module_permissions IS 'Permissões por módulo do sistema';
COMMENT ON VIEW public.user_module_permissions IS 'View que combina usuários com suas permissões por módulo';

-- =====================================================
-- SETUP CONCLUÍDO!
-- =====================================================