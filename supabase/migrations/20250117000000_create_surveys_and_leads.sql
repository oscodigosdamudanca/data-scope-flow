-- Create leads table
CREATE TABLE IF NOT EXISTS public.leads (
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
  created_by UUID REFERENCES auth.users(id)
);

-- Create surveys table
CREATE TABLE IF NOT EXISTS public.surveys (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  company_id UUID REFERENCES public.companies(id)
);

-- Create survey_questions table
CREATE TABLE IF NOT EXISTS public.survey_questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  survey_id UUID NOT NULL REFERENCES public.surveys(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type VARCHAR(50) DEFAULT 'text',
  options JSONB,
  is_required BOOLEAN DEFAULT false,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create survey_responses table
CREATE TABLE IF NOT EXISTS public.survey_responses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  survey_id UUID NOT NULL REFERENCES public.surveys(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.survey_questions(id) ON DELETE CASCADE,
  respondent_email VARCHAR(255),
  response_text TEXT,
  response_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_leads_email ON public.leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created_by ON public.leads(created_by);

CREATE INDEX IF NOT EXISTS idx_surveys_status ON public.surveys(status);
CREATE INDEX IF NOT EXISTS idx_surveys_created_by ON public.surveys(created_by);
CREATE INDEX IF NOT EXISTS idx_surveys_company_id ON public.surveys(company_id);

CREATE INDEX IF NOT EXISTS idx_survey_questions_survey_id ON public.survey_questions(survey_id);
CREATE INDEX IF NOT EXISTS idx_survey_questions_order ON public.survey_questions(survey_id, order_index);

CREATE INDEX IF NOT EXISTS idx_survey_responses_survey_id ON public.survey_responses(survey_id);
CREATE INDEX IF NOT EXISTS idx_survey_responses_question_id ON public.survey_responses(question_id);
CREATE INDEX IF NOT EXISTS idx_survey_responses_email ON public.survey_responses(respondent_email);

-- Enable RLS (Row Level Security)
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_responses ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for leads
CREATE POLICY "Users can view leads from their companies" ON public.leads
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.company_memberships cm
      WHERE cm.user_id = auth.uid()
      AND cm.company_id IN (
        SELECT company_id FROM public.company_memberships
        WHERE user_id = leads.created_by
      )
    )
  );

CREATE POLICY "Users can insert leads" ON public.leads
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update leads from their companies" ON public.leads
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.company_memberships cm
      WHERE cm.user_id = auth.uid()
      AND cm.company_id IN (
        SELECT company_id FROM public.company_memberships
        WHERE user_id = leads.created_by
      )
    )
  );

-- Create RLS policies for surveys
CREATE POLICY "Users can view surveys from their companies" ON public.surveys
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.company_memberships cm
      WHERE cm.user_id = auth.uid()
      AND cm.company_id = surveys.company_id
    )
  );

CREATE POLICY "Users can insert surveys" ON public.surveys
  FOR INSERT WITH CHECK (
    auth.uid() = created_by AND
    EXISTS (
      SELECT 1 FROM public.company_memberships cm
      WHERE cm.user_id = auth.uid()
      AND cm.company_id = surveys.company_id
    )
  );

CREATE POLICY "Users can update surveys from their companies" ON public.surveys
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.company_memberships cm
      WHERE cm.user_id = auth.uid()
      AND cm.company_id = surveys.company_id
    )
  );

-- Create RLS policies for survey_questions
CREATE POLICY "Users can view survey questions from their companies" ON public.survey_questions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.surveys s
      JOIN public.company_memberships cm ON cm.company_id = s.company_id
      WHERE s.id = survey_questions.survey_id
      AND cm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage survey questions from their companies" ON public.survey_questions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.surveys s
      JOIN public.company_memberships cm ON cm.company_id = s.company_id
      WHERE s.id = survey_questions.survey_id
      AND cm.user_id = auth.uid()
    )
  );

-- Create RLS policies for survey_responses (more permissive for public surveys)
CREATE POLICY "Anyone can insert survey responses" ON public.survey_responses
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view survey responses from their companies" ON public.survey_responses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.surveys s
      JOIN public.company_memberships cm ON cm.company_id = s.company_id
      WHERE s.id = survey_responses.survey_id
      AND cm.user_id = auth.uid()
    )
  );

-- Create updated_at trigger for leads
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON public.leads
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_surveys_updated_at BEFORE UPDATE ON public.surveys
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();