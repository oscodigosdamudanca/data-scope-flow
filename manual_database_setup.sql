-- =====================================================
-- SCRIPT COMPLETO PARA CONFIGURAÇÃO MANUAL DO BANCO
-- Execute este script no painel SQL do Supabase
-- =====================================================

-- 1. LIMPEZA INICIAL (remover tabelas existentes se necessário)
-- Descomente as linhas abaixo apenas se precisar recriar tudo do zero
/*
DROP TABLE IF EXISTS public.survey_responses CASCADE;
DROP TABLE IF EXISTS public.survey_questions CASCADE;
DROP TABLE IF EXISTS public.surveys CASCADE;
DROP TABLE IF EXISTS public.leads CASCADE;
DROP TABLE IF EXISTS public.company_memberships CASCADE;
DROP TABLE IF EXISTS public.companies CASCADE;
*/

-- =====================================================
-- 2. CRIAÇÃO DAS TABELAS PRINCIPAIS
-- =====================================================

-- Tabela de empresas
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
  subscription_plan VARCHAR(50) DEFAULT 'free' CHECK (subscription_plan IN ('free', 'basic', 'pro', 'enterprise')),
  subscription_status VARCHAR(50) DEFAULT 'active' CHECK (subscription_status IN ('active', 'inactive', 'suspended', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID
);

-- Tabela de membros da empresa
CREATE TABLE IF NOT EXISTS public.company_memberships (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role VARCHAR(50) DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'manager', 'member', 'viewer')),
  permissions JSONB DEFAULT '{}',
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending', 'suspended')),
  invited_by UUID,
  invited_at TIMESTAMP WITH TIME ZONE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(company_id, user_id)
);

-- Tabela de leads
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
  last_contact_date TIMESTAMP WITH TIME ZONE,
  next_follow_up_date TIMESTAMP WITH TIME ZONE,
  conversion_date TIMESTAMP WITH TIME ZONE,
  lead_score INTEGER DEFAULT 0 CHECK (lead_score >= 0 AND lead_score <= 100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE
);

-- Tabela de pesquisas
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
  created_by UUID,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE
);

-- Tabela de perguntas da pesquisa
CREATE TABLE IF NOT EXISTS public.survey_questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  survey_id UUID NOT NULL REFERENCES public.surveys(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type VARCHAR(50) DEFAULT 'text' CHECK (question_type IN ('text', 'textarea', 'multiple_choice', 'single_choice', 'rating', 'scale', 'boolean', 'date', 'email', 'number')),
  options JSONB,
  validation_rules JSONB DEFAULT '{}',
  is_required BOOLEAN DEFAULT false,
  order_index INTEGER NOT NULL,
  conditional_logic JSONB,
  help_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de respostas da pesquisa
CREATE TABLE IF NOT EXISTS public.survey_responses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  survey_id UUID NOT NULL REFERENCES public.surveys(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.survey_questions(id) ON DELETE CASCADE,
  respondent_id UUID,
  respondent_email VARCHAR(255),
  response_text TEXT,
  response_data JSONB,
  response_metadata JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 3. CRIAÇÃO DE ÍNDICES PARA PERFORMANCE
-- =====================================================

-- Índices para companies
CREATE INDEX IF NOT EXISTS idx_companies_domain ON public.companies(domain);
CREATE INDEX IF NOT EXISTS idx_companies_subscription ON public.companies(subscription_plan, subscription_status);
CREATE INDEX IF NOT EXISTS idx_companies_created_at ON public.companies(created_at);

-- Índices para company_memberships
CREATE INDEX IF NOT EXISTS idx_company_memberships_user_id ON public.company_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_company_memberships_company_role ON public.company_memberships(company_id, role);
CREATE INDEX IF NOT EXISTS idx_company_memberships_status ON public.company_memberships(status);

-- Índices para leads
CREATE INDEX IF NOT EXISTS idx_leads_email ON public.leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_company_id ON public.leads(company_id);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads(created_at);
CREATE INDEX IF NOT EXISTS idx_leads_priority_status ON public.leads(priority, status);
CREATE INDEX IF NOT EXISTS idx_leads_next_follow_up ON public.leads(next_follow_up_date) WHERE next_follow_up_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_leads_lead_score ON public.leads(lead_score);

-- Índices para surveys
CREATE INDEX IF NOT EXISTS idx_surveys_company_id ON public.surveys(company_id);
CREATE INDEX IF NOT EXISTS idx_surveys_status ON public.surveys(status);
CREATE INDEX IF NOT EXISTS idx_surveys_type ON public.surveys(survey_type);
CREATE INDEX IF NOT EXISTS idx_surveys_dates ON public.surveys(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_surveys_created_at ON public.surveys(created_at);

-- Índices para survey_questions
CREATE INDEX IF NOT EXISTS idx_survey_questions_survey_id ON public.survey_questions(survey_id);
CREATE INDEX IF NOT EXISTS idx_survey_questions_order ON public.survey_questions(survey_id, order_index);
CREATE INDEX IF NOT EXISTS idx_survey_questions_type ON public.survey_questions(question_type);

-- Índices para survey_responses
CREATE INDEX IF NOT EXISTS idx_survey_responses_survey_id ON public.survey_responses(survey_id);
CREATE INDEX IF NOT EXISTS idx_survey_responses_question_id ON public.survey_responses(question_id);
CREATE INDEX IF NOT EXISTS idx_survey_responses_respondent ON public.survey_responses(respondent_id);
CREATE INDEX IF NOT EXISTS idx_survey_responses_email ON public.survey_responses(respondent_email);
CREATE INDEX IF NOT EXISTS idx_survey_responses_created_at ON public.survey_responses(created_at);

-- =====================================================
-- 4. HABILITAÇÃO DO ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_responses ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 5. CRIAÇÃO DE POLÍTICAS RLS OTIMIZADAS
-- =====================================================

-- Políticas para companies
CREATE POLICY "companies_select_policy" ON public.companies
  FOR SELECT TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM public.company_memberships cm 
      WHERE cm.company_id = companies.id 
      AND cm.user_id = auth.uid() 
      AND cm.status = 'active'
    )
  );

CREATE POLICY "companies_insert_policy" ON public.companies
  FOR INSERT TO authenticated 
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "companies_update_policy" ON public.companies
  FOR UPDATE TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM public.company_memberships cm 
      WHERE cm.company_id = companies.id 
      AND cm.user_id = auth.uid() 
      AND cm.role IN ('owner', 'admin')
      AND cm.status = 'active'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.company_memberships cm 
      WHERE cm.company_id = companies.id 
      AND cm.user_id = auth.uid() 
      AND cm.role IN ('owner', 'admin')
      AND cm.status = 'active'
    )
  );

CREATE POLICY "companies_delete_policy" ON public.companies
  FOR DELETE TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM public.company_memberships cm 
      WHERE cm.company_id = companies.id 
      AND cm.user_id = auth.uid() 
      AND cm.role = 'owner'
      AND cm.status = 'active'
    )
  );

-- Políticas para company_memberships
CREATE POLICY "company_memberships_select_policy" ON public.company_memberships
  FOR SELECT TO authenticated 
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.company_memberships cm 
      WHERE cm.company_id = company_memberships.company_id 
      AND cm.user_id = auth.uid() 
      AND cm.role IN ('owner', 'admin', 'manager')
      AND cm.status = 'active'
    )
  );

CREATE POLICY "company_memberships_insert_policy" ON public.company_memberships
  FOR INSERT TO authenticated 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.company_memberships cm 
      WHERE cm.company_id = company_memberships.company_id 
      AND cm.user_id = auth.uid() 
      AND cm.role IN ('owner', 'admin')
      AND cm.status = 'active'
    ) OR
    (user_id = auth.uid() AND status = 'pending')
  );

CREATE POLICY "company_memberships_update_policy" ON public.company_memberships
  FOR UPDATE TO authenticated 
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.company_memberships cm 
      WHERE cm.company_id = company_memberships.company_id 
      AND cm.user_id = auth.uid() 
      AND cm.role IN ('owner', 'admin')
      AND cm.status = 'active'
    )
  )
  WITH CHECK (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.company_memberships cm 
      WHERE cm.company_id = company_memberships.company_id 
      AND cm.user_id = auth.uid() 
      AND cm.role IN ('owner', 'admin')
      AND cm.status = 'active'
    )
  );

CREATE POLICY "company_memberships_delete_policy" ON public.company_memberships
  FOR DELETE TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM public.company_memberships cm 
      WHERE cm.company_id = company_memberships.company_id 
      AND cm.user_id = auth.uid() 
      AND cm.role IN ('owner', 'admin')
      AND cm.status = 'active'
    )
  );

-- Políticas para leads
CREATE POLICY "leads_select_policy" ON public.leads
  FOR SELECT TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM public.company_memberships cm 
      WHERE cm.company_id = leads.company_id 
      AND cm.user_id = auth.uid() 
      AND cm.status = 'active'
    )
  );

CREATE POLICY "leads_insert_policy" ON public.leads
  FOR INSERT TO authenticated 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.company_memberships cm 
      WHERE cm.company_id = leads.company_id 
      AND cm.user_id = auth.uid() 
      AND cm.role IN ('owner', 'admin', 'manager', 'member')
      AND cm.status = 'active'
    )
  );

CREATE POLICY "leads_update_policy" ON public.leads
  FOR UPDATE TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM public.company_memberships cm 
      WHERE cm.company_id = leads.company_id 
      AND cm.user_id = auth.uid() 
      AND cm.role IN ('owner', 'admin', 'manager', 'member')
      AND cm.status = 'active'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.company_memberships cm 
      WHERE cm.company_id = leads.company_id 
      AND cm.user_id = auth.uid() 
      AND cm.role IN ('owner', 'admin', 'manager', 'member')
      AND cm.status = 'active'
    )
  );

CREATE POLICY "leads_delete_policy" ON public.leads
  FOR DELETE TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM public.company_memberships cm 
      WHERE cm.company_id = leads.company_id 
      AND cm.user_id = auth.uid() 
      AND cm.role IN ('owner', 'admin', 'manager')
      AND cm.status = 'active'
    )
  );

-- Políticas para surveys
CREATE POLICY "surveys_select_policy" ON public.surveys
  FOR SELECT TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM public.company_memberships cm 
      WHERE cm.company_id = surveys.company_id 
      AND cm.user_id = auth.uid() 
      AND cm.status = 'active'
    )
  );

CREATE POLICY "surveys_insert_policy" ON public.surveys
  FOR INSERT TO authenticated 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.company_memberships cm 
      WHERE cm.company_id = surveys.company_id 
      AND cm.user_id = auth.uid() 
      AND cm.role IN ('owner', 'admin', 'manager', 'member')
      AND cm.status = 'active'
    )
  );

CREATE POLICY "surveys_update_policy" ON public.surveys
  FOR UPDATE TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM public.company_memberships cm 
      WHERE cm.company_id = surveys.company_id 
      AND cm.user_id = auth.uid() 
      AND cm.role IN ('owner', 'admin', 'manager', 'member')
      AND cm.status = 'active'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.company_memberships cm 
      WHERE cm.company_id = surveys.company_id 
      AND cm.user_id = auth.uid() 
      AND cm.role IN ('owner', 'admin', 'manager', 'member')
      AND cm.status = 'active'
    )
  );

CREATE POLICY "surveys_delete_policy" ON public.surveys
  FOR DELETE TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM public.company_memberships cm 
      WHERE cm.company_id = surveys.company_id 
      AND cm.user_id = auth.uid() 
      AND cm.role IN ('owner', 'admin', 'manager')
      AND cm.status = 'active'
    )
  );

-- Políticas para survey_questions
CREATE POLICY "survey_questions_select_policy" ON public.survey_questions
  FOR SELECT TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM public.surveys s
      JOIN public.company_memberships cm ON cm.company_id = s.company_id
      WHERE s.id = survey_questions.survey_id 
      AND cm.user_id = auth.uid() 
      AND cm.status = 'active'
    )
  );

CREATE POLICY "survey_questions_insert_policy" ON public.survey_questions
  FOR INSERT TO authenticated 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.surveys s
      JOIN public.company_memberships cm ON cm.company_id = s.company_id
      WHERE s.id = survey_questions.survey_id 
      AND cm.user_id = auth.uid() 
      AND cm.role IN ('owner', 'admin', 'manager', 'member')
      AND cm.status = 'active'
    )
  );

CREATE POLICY "survey_questions_update_policy" ON public.survey_questions
  FOR UPDATE TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM public.surveys s
      JOIN public.company_memberships cm ON cm.company_id = s.company_id
      WHERE s.id = survey_questions.survey_id 
      AND cm.user_id = auth.uid() 
      AND cm.role IN ('owner', 'admin', 'manager', 'member')
      AND cm.status = 'active'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.surveys s
      JOIN public.company_memberships cm ON cm.company_id = s.company_id
      WHERE s.id = survey_questions.survey_id 
      AND cm.user_id = auth.uid() 
      AND cm.role IN ('owner', 'admin', 'manager', 'member')
      AND cm.status = 'active'
    )
  );

CREATE POLICY "survey_questions_delete_policy" ON public.survey_questions
  FOR DELETE TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM public.surveys s
      JOIN public.company_memberships cm ON cm.company_id = s.company_id
      WHERE s.id = survey_questions.survey_id 
      AND cm.user_id = auth.uid() 
      AND cm.role IN ('owner', 'admin', 'manager')
      AND cm.status = 'active'
    )
  );

-- Políticas para survey_responses
CREATE POLICY "survey_responses_select_policy" ON public.survey_responses
  FOR SELECT TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM public.surveys s
      JOIN public.company_memberships cm ON cm.company_id = s.company_id
      WHERE s.id = survey_responses.survey_id 
      AND cm.user_id = auth.uid() 
      AND cm.status = 'active'
    )
  );

CREATE POLICY "survey_responses_insert_policy" ON public.survey_responses
  FOR INSERT TO authenticated 
  WITH CHECK (true); -- Permite inserção para qualquer usuário autenticado (respostas públicas)

CREATE POLICY "survey_responses_update_policy" ON public.survey_responses
  FOR UPDATE TO authenticated 
  USING (
    respondent_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.surveys s
      JOIN public.company_memberships cm ON cm.company_id = s.company_id
      WHERE s.id = survey_responses.survey_id 
      AND cm.user_id = auth.uid() 
      AND cm.role IN ('owner', 'admin', 'manager')
      AND cm.status = 'active'
    )
  )
  WITH CHECK (
    respondent_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.surveys s
      JOIN public.company_memberships cm ON cm.company_id = s.company_id
      WHERE s.id = survey_responses.survey_id 
      AND cm.user_id = auth.uid() 
      AND cm.role IN ('owner', 'admin', 'manager')
      AND cm.status = 'active'
    )
  );

CREATE POLICY "survey_responses_delete_policy" ON public.survey_responses
  FOR DELETE TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM public.surveys s
      JOIN public.company_memberships cm ON cm.company_id = s.company_id
      WHERE s.id = survey_responses.survey_id 
      AND cm.user_id = auth.uid() 
      AND cm.role IN ('owner', 'admin')
      AND cm.status = 'active'
    )
  );

-- =====================================================
-- 6. FUNÇÕES E TRIGGERS
-- =====================================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers para updated_at
CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON public.companies
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_company_memberships_updated_at
  BEFORE UPDATE ON public.company_memberships
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_surveys_updated_at
  BEFORE UPDATE ON public.surveys
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- 7. DADOS DE EXEMPLO (OPCIONAL)
-- =====================================================

-- Inserir empresa de exemplo
INSERT INTO public.companies (id, name, domain, industry, size, description, country)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Empresa Exemplo',
  'exemplo.com',
  'Tecnologia',
  'medium',
  'Empresa de exemplo para testes',
  'Brasil'
) ON CONFLICT (id) DO NOTHING;

-- Inserir leads de exemplo
INSERT INTO public.leads (name, email, company, status, company_id) VALUES 
  ('João Silva', 'joao@exemplo.com', 'Empresa A', 'new', '00000000-0000-0000-0000-000000000001'),
  ('Maria Santos', 'maria@exemplo.com', 'Empresa B', 'contacted', '00000000-0000-0000-0000-000000000001'),
  ('Pedro Oliveira', 'pedro@exemplo.com', 'Empresa C', 'qualified', '00000000-0000-0000-0000-000000000001')
ON CONFLICT (email) DO NOTHING;

-- Inserir pesquisa de exemplo
INSERT INTO public.surveys (id, title, description, status, company_id)
VALUES (
  '00000000-0000-0000-0000-000000000002',
  'Pesquisa de Satisfação',
  'Pesquisa para avaliar a satisfação dos clientes',
  'active',
  '00000000-0000-0000-0000-000000000001'
) ON CONFLICT (id) DO NOTHING;

-- Inserir perguntas de exemplo
INSERT INTO public.survey_questions (survey_id, question_text, question_type, order_index, is_required) VALUES 
  ('00000000-0000-0000-0000-000000000002', 'Como você avalia nosso atendimento?', 'rating', 1, true),
  ('00000000-0000-0000-0000-000000000002', 'Deixe seus comentários:', 'textarea', 2, false)
ON CONFLICT DO NOTHING;

-- =====================================================
-- 8. VERIFICAÇÃO FINAL
-- =====================================================

-- Verificar se as tabelas foram criadas
DO $$
BEGIN
  RAISE NOTICE 'Tabelas criadas com sucesso:';
  RAISE NOTICE '- Companies: % registros', (SELECT COUNT(*) FROM public.companies);
  RAISE NOTICE '- Company Memberships: % registros', (SELECT COUNT(*) FROM public.company_memberships);
  RAISE NOTICE '- Leads: % registros', (SELECT COUNT(*) FROM public.leads);
  RAISE NOTICE '- Surveys: % registros', (SELECT COUNT(*) FROM public.surveys);
  RAISE NOTICE '- Survey Questions: % registros', (SELECT COUNT(*) FROM public.survey_questions);
  RAISE NOTICE '- Survey Responses: % registros', (SELECT COUNT(*) FROM public.survey_responses);
  RAISE NOTICE 'Configuração concluída com sucesso!';
END $$;

-- =====================================================
-- INSTRUÇÕES DE USO:
-- =====================================================
-- 1. Copie todo este script
-- 2. Acesse o painel do Supabase > SQL Editor
-- 3. Cole o script e execute
-- 4. Verifique os logs para confirmar a criação
-- 5. Teste as tabelas através da interface ou API
-- =====================================================