-- Recreate leads and surveys tables to fix schema cache issues
-- The tables exist physically but are not in Supabase's schema cache (PGRST205 error)

-- First, drop existing tables if they exist (to clean up any inconsistent state)
DROP TABLE IF EXISTS public.survey_responses CASCADE;
DROP TABLE IF EXISTS public.survey_questions CASCADE;
DROP TABLE IF EXISTS public.surveys CASCADE;
DROP TABLE IF EXISTS public.leads CASCADE;

-- Recreate leads table
CREATE TABLE public.leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  company VARCHAR(255),
  position VARCHAR(255),
  source VARCHAR(100),
  status VARCHAR(50) DEFAULT 'new',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID -- Removed FK to auth.users to avoid cross-schema issues
);

-- Recreate surveys table
CREATE TABLE public.surveys (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID, -- Removed FK to auth.users to avoid cross-schema issues
  company_id UUID REFERENCES public.companies(id)
);

-- Recreate survey_questions table
CREATE TABLE public.survey_questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  survey_id UUID NOT NULL REFERENCES public.surveys(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type VARCHAR(50) DEFAULT 'text',
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

-- Enable RLS on all tables
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_responses ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies for leads
CREATE POLICY "Leads: select for authenticated users" ON public.leads
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Leads: insert for authenticated users" ON public.leads
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Leads: update for authenticated users" ON public.leads
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Leads: delete for authenticated users" ON public.leads
  FOR DELETE TO authenticated USING (true);

-- Create basic RLS policies for surveys
CREATE POLICY "Surveys: select for authenticated users" ON public.surveys
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Surveys: insert for authenticated users" ON public.surveys
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Surveys: update for authenticated users" ON public.surveys
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Surveys: delete for authenticated users" ON public.surveys
  FOR DELETE TO authenticated USING (true);

-- Create basic RLS policies for survey_questions
CREATE POLICY "Survey questions: select for authenticated users" ON public.survey_questions
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Survey questions: insert for authenticated users" ON public.survey_questions
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Survey questions: update for authenticated users" ON public.survey_questions
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Survey questions: delete for authenticated users" ON public.survey_questions
  FOR DELETE TO authenticated USING (true);

-- Create basic RLS policies for survey_responses
CREATE POLICY "Survey responses: select for authenticated users" ON public.survey_responses
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Survey responses: insert for authenticated users" ON public.survey_responses
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Survey responses: update for authenticated users" ON public.survey_responses
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Survey responses: delete for authenticated users" ON public.survey_responses
  FOR DELETE TO authenticated USING (true);

-- Add updated_at triggers for leads and surveys
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_surveys_updated_at
  BEFORE UPDATE ON public.surveys
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();