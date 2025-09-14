-- =====================================================
-- SCRIPT CORRIGIDO PARA ESTRUTURA ATUAL DO SUPABASE
-- Baseado na análise do painel: companies, company_memberships, profiles, user_roles
-- =====================================================

-- 1. VERIFICAR ESTRUTURA ATUAL
-- Primeiro, vamos verificar quais colunas existem na tabela companies
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'companies'
ORDER BY ordinal_position;

-- =====================================================
-- 2. CRIAR APENAS AS TABELAS QUE FALTAM (LEADS E SURVEYS)
-- =====================================================

-- Tabela de leads (sem referência a domain)
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
-- 3. ÍNDICES ESSENCIAIS (SEM REFERÊNCIA A DOMAIN)
-- =====================================================

-- Índices para leads
CREATE INDEX IF NOT EXISTS idx_leads_email ON public.leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads(created_at);
CREATE INDEX IF NOT EXISTS idx_leads_company_id ON public.leads(company_id);
CREATE INDEX IF NOT EXISTS idx_leads_priority_status ON public.leads(priority, status);
CREATE INDEX IF NOT EXISTS idx_leads_next_follow_up ON public.leads(next_follow_up_date) WHERE next_follow_up_date IS NOT NULL;

-- Índices para surveys
CREATE INDEX IF NOT EXISTS idx_surveys_status ON public.surveys(status);
CREATE INDEX IF NOT EXISTS idx_surveys_type ON public.surveys(survey_type);
CREATE INDEX IF NOT EXISTS idx_surveys_company_id ON public.surveys(company_id);
CREATE INDEX IF NOT EXISTS idx_surveys_created_at ON public.surveys(created_at);
CREATE INDEX IF NOT EXISTS idx_surveys_dates ON public.surveys(start_date, end_date);

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
-- 4. HABILITAR ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Habilitar RLS nas novas tabelas
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_responses ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 5. POLÍTICAS RLS BÁSICAS
-- =====================================================

-- Políticas para leads (acesso baseado na empresa)
CREATE POLICY "Users can view leads from their company" ON public.leads
  FOR SELECT USING (
    company_id IN (
      SELECT company_id FROM public.company_memberships 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Users can insert leads to their company" ON public.leads
  FOR INSERT WITH CHECK (
    company_id IN (
      SELECT company_id FROM public.company_memberships 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Users can update leads from their company" ON public.leads
  FOR UPDATE USING (
    company_id IN (
      SELECT company_id FROM public.company_memberships 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

-- Políticas para surveys (acesso baseado na empresa)
CREATE POLICY "Users can view surveys from their company" ON public.surveys
  FOR SELECT USING (
    company_id IN (
      SELECT company_id FROM public.company_memberships 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Users can manage surveys from their company" ON public.surveys
  FOR ALL USING (
    company_id IN (
      SELECT company_id FROM public.company_memberships 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

-- Políticas para survey_questions (baseado no survey)
CREATE POLICY "Users can view questions from accessible surveys" ON public.survey_questions
  FOR SELECT USING (
    survey_id IN (
      SELECT id FROM public.surveys s
      WHERE s.company_id IN (
        SELECT company_id FROM public.company_memberships 
        WHERE user_id = auth.uid() AND status = 'active'
      )
    )
  );

CREATE POLICY "Users can manage questions from accessible surveys" ON public.survey_questions
  FOR ALL USING (
    survey_id IN (
      SELECT id FROM public.surveys s
      WHERE s.company_id IN (
        SELECT company_id FROM public.company_memberships 
        WHERE user_id = auth.uid() AND status = 'active'
      )
    )
  );

-- Políticas para survey_responses (acesso público para respostas, mas restrito para visualização)
CREATE POLICY "Anyone can submit survey responses" ON public.survey_responses
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view responses from their company surveys" ON public.survey_responses
  FOR SELECT USING (
    survey_id IN (
      SELECT id FROM public.surveys s
      WHERE s.company_id IN (
        SELECT company_id FROM public.company_memberships 
        WHERE user_id = auth.uid() AND status = 'active'
      )
    )
  );

-- =====================================================
-- 6. FUNÇÃO PARA ATUALIZAR updated_at
-- =====================================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- =====================================================
-- 7. TRIGGERS PARA updated_at
-- =====================================================

CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_surveys_updated_at
  BEFORE UPDATE ON public.surveys
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- 8. DADOS DE EXEMPLO PARA TESTE
-- =====================================================

-- Inserir leads de exemplo (assumindo que existe pelo menos uma company)
-- Verificar se já existem antes de inserir
INSERT INTO public.leads (name, email, phone, company, position, status, priority, notes, company_id)
SELECT 
  'João Silva', 'joao.silva@exemplo.com', '(11) 99999-1111', 'Tech Corp', 'Gerente de TI', 'new', 'high', 'Lead qualificado via LinkedIn', c.id
FROM public.companies c 
WHERE NOT EXISTS (SELECT 1 FROM public.leads WHERE email = 'joao.silva@exemplo.com')
LIMIT 1;

INSERT INTO public.leads (name, email, phone, company, position, status, priority, notes, company_id)
SELECT 
  'Maria Santos', 'maria.santos@exemplo.com', '(11) 99999-2222', 'Inovação Ltda', 'Diretora Comercial', 'contacted', 'medium', 'Interessada em soluções de CRM', c.id
FROM public.companies c 
WHERE NOT EXISTS (SELECT 1 FROM public.leads WHERE email = 'maria.santos@exemplo.com')
LIMIT 1;

-- Inserir surveys de exemplo
INSERT INTO public.surveys (title, description, status, survey_type, target_audience, company_id)
SELECT 
  'Pesquisa de Satisfação do Cliente', 'Avaliação da experiência do cliente com nossos serviços', 'active', 'satisfaction', 'Clientes ativos', c.id
FROM public.companies c LIMIT 1;

INSERT INTO public.surveys (title, description, status, survey_type, target_audience, company_id)
SELECT 
  'NPS - Net Promoter Score', 'Medição da probabilidade de recomendação', 'active', 'nps', 'Todos os clientes', c.id
FROM public.companies c LIMIT 1;

-- =====================================================
-- 9. VERIFICAÇÃO FINAL
-- =====================================================

-- Verificar se as tabelas foram criadas
SELECT 
  schemaname,
  tablename,
  tableowner,
  hasindexes,
  hasrules,
  hastriggers
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('leads', 'surveys', 'survey_questions', 'survey_responses')
ORDER BY tablename;

-- Verificar políticas RLS
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('leads', 'surveys', 'survey_questions', 'survey_responses')
ORDER BY tablename, policyname;

-- Contar registros inseridos
SELECT 'leads' as tabela, COUNT(*) as registros FROM public.leads
UNION ALL
SELECT 'surveys' as tabela, COUNT(*) as registros FROM public.surveys
UNION ALL
SELECT 'survey_questions' as tabela, COUNT(*) as registros FROM public.survey_questions
UNION ALL
SELECT 'survey_responses' as tabela, COUNT(*) as registros FROM public.survey_responses;

-- Forçar reload do cache do PostgREST
NOTIFY pgrst, 'reload schema';

SELECT '✅ Script executado com sucesso! Tabelas de leads e surveys criadas e configuradas.' as resultado;