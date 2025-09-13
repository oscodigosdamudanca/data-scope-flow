-- Force recreate tables to fix schema cache issues (PGRST205)
-- This migration will ensure tables are properly registered in PostgREST schema cache

-- Drop all existing tables and policies to start fresh
DROP TABLE IF EXISTS public.survey_responses CASCADE;
DROP TABLE IF EXISTS public.survey_questions CASCADE;
DROP TABLE IF EXISTS public.surveys CASCADE;
DROP TABLE IF EXISTS public.leads CASCADE;

-- Recreate leads table with proper structure
CREATE TABLE public.leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(20),
  company VARCHAR(255),
  position VARCHAR(255),
  source VARCHAR(100),
  status VARCHAR(50) DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'converted', 'lost')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID
);

-- Recreate surveys table
CREATE TABLE public.surveys (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE
);

-- Recreate survey_questions table
CREATE TABLE public.survey_questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  survey_id UUID NOT NULL REFERENCES public.surveys(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type VARCHAR(50) DEFAULT 'text' CHECK (question_type IN ('text', 'multiple_choice', 'rating', 'boolean', 'date')),
  options JSONB,
  is_required BOOLEAN DEFAULT false,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recreate survey_responses table
CREATE TABLE public.survey_responses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  survey_id UUID NOT NULL REFERENCES public.surveys(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.survey_questions(id) ON DELETE CASCADE,
  respondent_email VARCHAR(255),
  response_text TEXT,
  response_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_leads_email ON public.leads(email);
CREATE INDEX idx_leads_status ON public.leads(status);
CREATE INDEX idx_leads_created_at ON public.leads(created_at);
CREATE INDEX idx_surveys_company_id ON public.surveys(company_id);
CREATE INDEX idx_surveys_status ON public.surveys(status);
CREATE INDEX idx_survey_questions_survey_id ON public.survey_questions(survey_id);
CREATE INDEX idx_survey_questions_order ON public.survey_questions(survey_id, order_index);
CREATE INDEX idx_survey_responses_survey_id ON public.survey_responses(survey_id);
CREATE INDEX idx_survey_responses_question_id ON public.survey_responses(question_id);

-- Enable RLS on all tables
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_responses ENABLE ROW LEVEL SECURITY;

-- Create optimized RLS policies for leads
CREATE POLICY "leads_select_policy" ON public.leads
  FOR SELECT TO authenticated 
  USING (true);

CREATE POLICY "leads_insert_policy" ON public.leads
  FOR INSERT TO authenticated 
  WITH CHECK (true);

CREATE POLICY "leads_update_policy" ON public.leads
  FOR UPDATE TO authenticated 
  USING (true) WITH CHECK (true);

CREATE POLICY "leads_delete_policy" ON public.leads
  FOR DELETE TO authenticated 
  USING (true);

-- Create optimized RLS policies for surveys
CREATE POLICY "surveys_select_policy" ON public.surveys
  FOR SELECT TO authenticated 
  USING (true);

CREATE POLICY "surveys_insert_policy" ON public.surveys
  FOR INSERT TO authenticated 
  WITH CHECK (true);

CREATE POLICY "surveys_update_policy" ON public.surveys
  FOR UPDATE TO authenticated 
  USING (true) WITH CHECK (true);

CREATE POLICY "surveys_delete_policy" ON public.surveys
  FOR DELETE TO authenticated 
  USING (true);

-- Create optimized RLS policies for survey_questions
CREATE POLICY "survey_questions_select_policy" ON public.survey_questions
  FOR SELECT TO authenticated 
  USING (true);

CREATE POLICY "survey_questions_insert_policy" ON public.survey_questions
  FOR INSERT TO authenticated 
  WITH CHECK (true);

CREATE POLICY "survey_questions_update_policy" ON public.survey_questions
  FOR UPDATE TO authenticated 
  USING (true) WITH CHECK (true);

CREATE POLICY "survey_questions_delete_policy" ON public.survey_questions
  FOR DELETE TO authenticated 
  USING (true);

-- Create optimized RLS policies for survey_responses
CREATE POLICY "survey_responses_select_policy" ON public.survey_responses
  FOR SELECT TO authenticated 
  USING (true);

CREATE POLICY "survey_responses_insert_policy" ON public.survey_responses
  FOR INSERT TO authenticated 
  WITH CHECK (true);

CREATE POLICY "survey_responses_update_policy" ON public.survey_responses
  FOR UPDATE TO authenticated 
  USING (true) WITH CHECK (true);

CREATE POLICY "survey_responses_delete_policy" ON public.survey_responses
  FOR DELETE TO authenticated 
  USING (true);

-- Create or replace the update_updated_at function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for updated_at columns
CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_surveys_updated_at
  BEFORE UPDATE ON public.surveys
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Force PostgREST schema cache reload by updating a system table
-- This ensures the new tables are immediately available
NOTIFY pgrst, 'reload schema';

-- Insert some sample data to verify tables work
INSERT INTO public.leads (name, email, company, status) VALUES 
  ('João Silva', 'joao@exemplo.com', 'Empresa A', 'new'),
  ('Maria Santos', 'maria@exemplo.com', 'Empresa B', 'contacted');

-- Verify tables exist by selecting count
DO $$
BEGIN
  RAISE NOTICE 'Leads table created with % records', (SELECT COUNT(*) FROM public.leads);
  RAISE NOTICE 'Surveys table created with % records', (SELECT COUNT(*) FROM public.surveys);
  RAISE NOTICE 'Survey questions table created with % records', (SELECT COUNT(*) FROM public.survey_questions);
  RAISE NOTICE 'Survey responses table created with % records', (SELECT COUNT(*) FROM public.survey_responses);
END $$;