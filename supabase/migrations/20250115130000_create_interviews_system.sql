-- Criar enum para status de entrevista
CREATE TYPE interview_status AS ENUM (
  'scheduled',
  'in_progress', 
  'completed',
  'cancelled',
  'no_show'
);

-- Criar enum para status de candidato
CREATE TYPE candidate_status AS ENUM (
  'applied',
  'screening',
  'interview_scheduled',
  'interviewed',
  'approved',
  'rejected',
  'hired'
);

-- Tabela de candidatos
CREATE TABLE IF NOT EXISTS public.candidates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  resume_url TEXT,
  linkedin_url TEXT,
  portfolio_url TEXT,
  status candidate_status DEFAULT 'applied',
  notes TEXT,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de entrevistas
CREATE TABLE IF NOT EXISTS public.interviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  candidate_id UUID REFERENCES public.candidates(id) ON DELETE CASCADE,
  interviewer_id UUID REFERENCES auth.users(id),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  scheduled_at TIMESTAMP WITH TIME ZONE,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  status interview_status DEFAULT 'scheduled',
  meeting_url TEXT,
  notes TEXT,
  overall_rating INTEGER CHECK (overall_rating >= 1 AND overall_rating <= 5),
  recommendation TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de perguntas da entrevista
CREATE TABLE IF NOT EXISTS public.interview_questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  interview_id UUID REFERENCES public.interviews(id) ON DELETE CASCADE,
  question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE,
  order_index INTEGER NOT NULL,
  is_required BOOLEAN DEFAULT false,
  time_limit_minutes INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de respostas
CREATE TABLE IF NOT EXISTS public.interview_responses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  interview_id UUID REFERENCES public.interviews(id) ON DELETE CASCADE,
  question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE,
  candidate_id UUID REFERENCES public.candidates(id) ON DELETE CASCADE,
  response_text TEXT,
  response_file_url TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  feedback TEXT,
  time_spent_seconds INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_candidates_company_id ON public.candidates(company_id);
CREATE INDEX idx_candidates_status ON public.candidates(status);
CREATE INDEX idx_candidates_email ON public.candidates(email);

CREATE INDEX idx_interviews_candidate_id ON public.interviews(candidate_id);
CREATE INDEX idx_interviews_interviewer_id ON public.interviews(interviewer_id);
CREATE INDEX idx_interviews_company_id ON public.interviews(company_id);
CREATE INDEX idx_interviews_status ON public.interviews(status);
CREATE INDEX idx_interviews_scheduled_at ON public.interviews(scheduled_at);

CREATE INDEX idx_interview_questions_interview_id ON public.interview_questions(interview_id);
CREATE INDEX idx_interview_questions_question_id ON public.interview_questions(question_id);

CREATE INDEX idx_interview_responses_interview_id ON public.interview_responses(interview_id);
CREATE INDEX idx_interview_responses_candidate_id ON public.interview_responses(candidate_id);

-- Triggers para updated_at
CREATE TRIGGER update_candidates_updated_at
  BEFORE UPDATE ON public.candidates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_interviews_updated_at
  BEFORE UPDATE ON public.interviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_interview_responses_updated_at
  BEFORE UPDATE ON public.interview_responses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Políticas RLS
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_responses ENABLE ROW LEVEL SECURITY;

-- Políticas para candidates
CREATE POLICY "Users can view candidates from their companies" ON public.candidates
  FOR SELECT USING (
    company_id IN (
      SELECT company_id FROM public.company_memberships 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Company admins can insert candidates" ON public.candidates
  FOR INSERT WITH CHECK (
    company_id IN (
      SELECT company_id FROM public.company_memberships 
      WHERE user_id = auth.uid() AND role IN ('admin', 'owner')
    )
  );

CREATE POLICY "Company admins can update candidates" ON public.candidates
  FOR UPDATE USING (
    company_id IN (
      SELECT company_id FROM public.company_memberships 
      WHERE user_id = auth.uid() AND role IN ('admin', 'owner')
    )
  );

CREATE POLICY "Company admins can delete candidates" ON public.candidates
  FOR DELETE USING (
    company_id IN (
      SELECT company_id FROM public.company_memberships 
      WHERE user_id = auth.uid() AND role IN ('admin', 'owner')
    )
  );

-- Políticas para interviews
CREATE POLICY "Users can view interviews from their companies" ON public.interviews
  FOR SELECT USING (
    company_id IN (
      SELECT company_id FROM public.company_memberships 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Company members can insert interviews" ON public.interviews
  FOR INSERT WITH CHECK (
    company_id IN (
      SELECT company_id FROM public.company_memberships 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Interviewers and admins can update interviews" ON public.interviews
  FOR UPDATE USING (
    interviewer_id = auth.uid() OR
    company_id IN (
      SELECT company_id FROM public.company_memberships 
      WHERE user_id = auth.uid() AND role IN ('admin', 'owner')
    )
  );

CREATE POLICY "Company admins can delete interviews" ON public.interviews
  FOR DELETE USING (
    company_id IN (
      SELECT company_id FROM public.company_memberships 
      WHERE user_id = auth.uid() AND role IN ('admin', 'owner')
    )
  );

-- Políticas para interview_questions
CREATE POLICY "Users can view interview questions from their companies" ON public.interview_questions
  FOR SELECT USING (
    interview_id IN (
      SELECT id FROM public.interviews 
      WHERE company_id IN (
        SELECT company_id FROM public.company_memberships 
        WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Company members can manage interview questions" ON public.interview_questions
  FOR ALL USING (
    interview_id IN (
      SELECT id FROM public.interviews 
      WHERE company_id IN (
        SELECT company_id FROM public.company_memberships 
        WHERE user_id = auth.uid()
      )
    )
  );

-- Políticas para interview_responses
CREATE POLICY "Users can view responses from their companies" ON public.interview_responses
  FOR SELECT USING (
    interview_id IN (
      SELECT id FROM public.interviews 
      WHERE company_id IN (
        SELECT company_id FROM public.company_memberships 
        WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Interviewers can manage responses" ON public.interview_responses
  FOR ALL USING (
    interview_id IN (
      SELECT id FROM public.interviews 
      WHERE interviewer_id = auth.uid() OR
      company_id IN (
        SELECT company_id FROM public.company_memberships 
        WHERE user_id = auth.uid() AND role IN ('admin', 'owner')
      )
    )
  );

-- Função para calcular estatísticas de entrevistas
CREATE OR REPLACE FUNCTION get_interview_stats(company_uuid UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_candidates', (
      SELECT COUNT(*) FROM public.candidates 
      WHERE company_id = company_uuid
    ),
    'total_interviews', (
      SELECT COUNT(*) FROM public.interviews 
      WHERE company_id = company_uuid
    ),
    'scheduled_interviews', (
      SELECT COUNT(*) FROM public.interviews 
      WHERE company_id = company_uuid AND status = 'scheduled'
    ),
    'completed_interviews', (
      SELECT COUNT(*) FROM public.interviews 
      WHERE company_id = company_uuid AND status = 'completed'
    ),
    'average_rating', (
      SELECT ROUND(AVG(overall_rating), 2) FROM public.interviews 
      WHERE company_id = company_uuid AND overall_rating IS NOT NULL
    )
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;