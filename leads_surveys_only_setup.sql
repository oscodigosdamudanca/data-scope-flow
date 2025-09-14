-- =====================================================
-- SCRIPT ESPECÍFICO PARA LEADS E SURVEYS
-- Execute no painel SQL do Supabase se só precisar dessas tabelas
-- =====================================================

-- 1. LIMPEZA (descomente se necessário recriar)
/*
DROP TABLE IF EXISTS public.survey_responses CASCADE;
DROP TABLE IF EXISTS public.survey_questions CASCADE;
DROP TABLE IF EXISTS public.surveys CASCADE;
DROP TABLE IF EXISTS public.leads CASCADE;
*/

-- =====================================================
-- 2. CRIAÇÃO DAS TABELAS LEADS E SURVEYS
-- =====================================================

-- Tabela de leads (independente)
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
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
  created_by UUID
);

-- Tabela de pesquisas (independente)
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
  created_by UUID
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
-- 3. ÍNDICES ESSENCIAIS
-- =====================================================

-- Índices para leads
CREATE INDEX IF NOT EXISTS idx_leads_email ON public.leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads(created_at);
CREATE INDEX IF NOT EXISTS idx_leads_priority_status ON public.leads(priority, status);
CREATE INDEX IF NOT EXISTS idx_leads_next_follow_up ON public.leads(next_follow_up_date) WHERE next_follow_up_date IS NOT NULL;

-- Índices para surveys
CREATE INDEX IF NOT EXISTS idx_surveys_status ON public.surveys(status);
CREATE INDEX IF NOT EXISTS idx_surveys_type ON public.surveys(survey_type);
CREATE INDEX IF NOT EXISTS idx_surveys_created_at ON public.surveys(created_at);

-- Índices para survey_questions
CREATE INDEX IF NOT EXISTS idx_survey_questions_survey_id ON public.survey_questions(survey_id);
CREATE INDEX IF NOT EXISTS idx_survey_questions_order ON public.survey_questions(survey_id, order_index);

-- Índices para survey_responses
CREATE INDEX IF NOT EXISTS idx_survey_responses_survey_id ON public.survey_responses(survey_id);
CREATE INDEX IF NOT EXISTS idx_survey_responses_question_id ON public.survey_responses(question_id);
CREATE INDEX IF NOT EXISTS idx_survey_responses_created_at ON public.survey_responses(created_at);

-- =====================================================
-- 4. HABILITAÇÃO DO RLS
-- =====================================================

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_responses ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 5. POLÍTICAS RLS SIMPLIFICADAS (ACESSO TOTAL PARA AUTENTICADOS)
-- =====================================================

-- Políticas para leads (acesso total para usuários autenticados)
CREATE POLICY "leads_full_access" ON public.leads
  FOR ALL TO authenticated 
  USING (true)
  WITH CHECK (true);

-- Políticas para surveys (acesso total para usuários autenticados)
CREATE POLICY "surveys_full_access" ON public.surveys
  FOR ALL TO authenticated 
  USING (true)
  WITH CHECK (true);

-- Políticas para survey_questions (acesso total para usuários autenticados)
CREATE POLICY "survey_questions_full_access" ON public.survey_questions
  FOR ALL TO authenticated 
  USING (true)
  WITH CHECK (true);

-- Políticas para survey_responses (acesso total para usuários autenticados)
CREATE POLICY "survey_responses_full_access" ON public.survey_responses
  FOR ALL TO authenticated 
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- 6. FUNÇÃO E TRIGGERS PARA UPDATED_AT
-- =====================================================

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers para updated_at
CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_surveys_updated_at
  BEFORE UPDATE ON public.surveys
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- 7. DADOS DE TESTE
-- =====================================================

-- Inserir leads de exemplo
INSERT INTO public.leads (name, email, company, status, priority, lead_score) VALUES 
  ('João Silva', 'joao.silva@exemplo.com', 'Tech Corp', 'new', 'high', 85),
  ('Maria Santos', 'maria.santos@exemplo.com', 'Inovação Ltda', 'contacted', 'medium', 70),
  ('Pedro Oliveira', 'pedro.oliveira@exemplo.com', 'StartUp XYZ', 'qualified', 'high', 90),
  ('Ana Costa', 'ana.costa@exemplo.com', 'Empresa ABC', 'new', 'low', 45),
  ('Carlos Ferreira', 'carlos.ferreira@exemplo.com', 'Soluções Tech', 'converted', 'high', 95)
ON CONFLICT (email) DO NOTHING;

-- Inserir pesquisas de exemplo
INSERT INTO public.surveys (title, description, status, survey_type) VALUES 
  ('Pesquisa de Satisfação do Cliente', 'Avaliação da experiência do cliente com nossos serviços', 'active', 'satisfaction'),
  ('NPS - Net Promoter Score', 'Medição da lealdade e satisfação dos clientes', 'active', 'nps'),
  ('Qualificação de Leads', 'Pesquisa para qualificar potenciais clientes', 'draft', 'lead_qualification'),
  ('Feedback do Produto', 'Coleta de feedback sobre nossos produtos', 'paused', 'feedback')
ON CONFLICT DO NOTHING;

-- Inserir perguntas de exemplo para a primeira pesquisa
INSERT INTO public.survey_questions (survey_id, question_text, question_type, order_index, is_required, options) 
SELECT 
  s.id,
  'Como você avalia nosso atendimento?',
  'rating',
  1,
  true,
  '{"min": 1, "max": 5, "labels": ["Muito Ruim", "Ruim", "Regular", "Bom", "Excelente"]}'
FROM public.surveys s 
WHERE s.title = 'Pesquisa de Satisfação do Cliente'
ON CONFLICT DO NOTHING;

INSERT INTO public.survey_questions (survey_id, question_text, question_type, order_index, is_required) 
SELECT 
  s.id,
  'Deixe seus comentários e sugestões:',
  'textarea',
  2,
  false
FROM public.surveys s 
WHERE s.title = 'Pesquisa de Satisfação do Cliente'
ON CONFLICT DO NOTHING;

INSERT INTO public.survey_questions (survey_id, question_text, question_type, order_index, is_required, options) 
SELECT 
  s.id,
  'Qual a probabilidade de você nos recomendar?',
  'scale',
  3,
  true,
  '{"min": 0, "max": 10, "step": 1}'
FROM public.surveys s 
WHERE s.title = 'Pesquisa de Satisfação do Cliente'
ON CONFLICT DO NOTHING;

-- =====================================================
-- 8. VERIFICAÇÃO E LIMPEZA DO CACHE
-- =====================================================

-- Forçar reload do schema cache do PostgREST
NOTIFY pgrst, 'reload schema';

-- Verificar criação das tabelas
DO $$
BEGIN
  RAISE NOTICE '=== VERIFICAÇÃO DAS TABELAS ===';
  RAISE NOTICE 'Leads criados: % registros', (SELECT COUNT(*) FROM public.leads);
  RAISE NOTICE 'Surveys criados: % registros', (SELECT COUNT(*) FROM public.surveys);
  RAISE NOTICE 'Survey Questions criadas: % registros', (SELECT COUNT(*) FROM public.survey_questions);
  RAISE NOTICE 'Survey Responses criadas: % registros', (SELECT COUNT(*) FROM public.survey_responses);
  RAISE NOTICE '=== CONFIGURAÇÃO CONCLUÍDA ===';
  RAISE NOTICE 'As tabelas estão prontas para uso!';
END $$;

-- =====================================================
-- INSTRUÇÕES:
-- =====================================================
-- 1. Copie este script completo
-- 2. Acesse Supabase Dashboard > SQL Editor
-- 3. Cole e execute o script
-- 4. Verifique os logs de sucesso
-- 5. Teste as tabelas via API ou interface
-- =====================================================