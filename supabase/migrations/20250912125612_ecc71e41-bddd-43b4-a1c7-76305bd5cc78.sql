-- Create candidates table
CREATE TABLE public.candidates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  resume_url TEXT,
  linkedin_url TEXT,
  portfolio_url TEXT,
  status TEXT NOT NULL DEFAULT 'applied' CHECK (status IN ('applied', 'screening', 'interview_scheduled', 'interviewed', 'approved', 'rejected', 'hired')),
  notes TEXT,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create interviews table
CREATE TABLE public.interviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  interviewer_id UUID,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  scheduled_at TIMESTAMP WITH TIME ZONE,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled', 'no_show')),
  meeting_url TEXT,
  notes TEXT,
  overall_rating INTEGER CHECK (overall_rating >= 1 AND overall_rating <= 5),
  recommendation TEXT,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create interview_questions table (links questions to interviews)
CREATE TABLE public.interview_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  interview_id UUID NOT NULL REFERENCES interviews(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  order_index INTEGER NOT NULL,
  is_required BOOLEAN NOT NULL DEFAULT true,
  time_limit_minutes INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(interview_id, question_id)
);

-- Create interview_responses table (stores candidate responses)
CREATE TABLE public.interview_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  interview_id UUID NOT NULL REFERENCES interviews(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  response_text TEXT,
  response_file_url TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  feedback TEXT,
  time_spent_seconds INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(interview_id, question_id, candidate_id)
);

-- Enable RLS on all tables
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_responses ENABLE ROW LEVEL SECURITY;

-- RLS Policies for candidates
CREATE POLICY "Candidates: select company member or developer"
ON public.candidates FOR SELECT
USING (
  has_role(auth.uid(), 'developer'::app_role) OR 
  is_company_member(auth.uid(), company_id)
);

CREATE POLICY "Candidates: insert company admin or developer"
ON public.candidates FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'developer'::app_role) OR 
  is_company_admin(auth.uid(), company_id)
);

CREATE POLICY "Candidates: update company admin or developer"
ON public.candidates FOR UPDATE
USING (
  has_role(auth.uid(), 'developer'::app_role) OR 
  is_company_admin(auth.uid(), company_id)
)
WITH CHECK (
  has_role(auth.uid(), 'developer'::app_role) OR 
  is_company_admin(auth.uid(), company_id)
);

CREATE POLICY "Candidates: delete company admin or developer"
ON public.candidates FOR DELETE
USING (
  has_role(auth.uid(), 'developer'::app_role) OR 
  is_company_admin(auth.uid(), company_id)
);

-- RLS Policies for interviews
CREATE POLICY "Interviews: select company member or developer"
ON public.interviews FOR SELECT
USING (
  has_role(auth.uid(), 'developer'::app_role) OR 
  is_company_member(auth.uid(), company_id)
);

CREATE POLICY "Interviews: insert company admin or developer"
ON public.interviews FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'developer'::app_role) OR 
  is_company_admin(auth.uid(), company_id)
);

CREATE POLICY "Interviews: update company member or developer"
ON public.interviews FOR UPDATE
USING (
  has_role(auth.uid(), 'developer'::app_role) OR 
  is_company_member(auth.uid(), company_id) OR
  interviewer_id = auth.uid()
)
WITH CHECK (
  has_role(auth.uid(), 'developer'::app_role) OR 
  is_company_member(auth.uid(), company_id) OR
  interviewer_id = auth.uid()
);

CREATE POLICY "Interviews: delete company admin or developer"
ON public.interviews FOR DELETE
USING (
  has_role(auth.uid(), 'developer'::app_role) OR 
  is_company_admin(auth.uid(), company_id)
);

-- RLS Policies for interview_questions
CREATE POLICY "InterviewQuestions: select via interview"
ON public.interview_questions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM interviews i 
    WHERE i.id = interview_questions.interview_id 
    AND (
      has_role(auth.uid(), 'developer'::app_role) OR 
      is_company_member(auth.uid(), i.company_id)
    )
  )
);

CREATE POLICY "InterviewQuestions: insert via interview"
ON public.interview_questions FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM interviews i 
    WHERE i.id = interview_questions.interview_id 
    AND (
      has_role(auth.uid(), 'developer'::app_role) OR 
      is_company_admin(auth.uid(), i.company_id)
    )
  )
);

CREATE POLICY "InterviewQuestions: update via interview"
ON public.interview_questions FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM interviews i 
    WHERE i.id = interview_questions.interview_id 
    AND (
      has_role(auth.uid(), 'developer'::app_role) OR 
      is_company_admin(auth.uid(), i.company_id)
    )
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM interviews i 
    WHERE i.id = interview_questions.interview_id 
    AND (
      has_role(auth.uid(), 'developer'::app_role) OR 
      is_company_admin(auth.uid(), i.company_id)
    )
  )
);

CREATE POLICY "InterviewQuestions: delete via interview"
ON public.interview_questions FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM interviews i 
    WHERE i.id = interview_questions.interview_id 
    AND (
      has_role(auth.uid(), 'developer'::app_role) OR 
      is_company_admin(auth.uid(), i.company_id)
    )
  )
);

-- RLS Policies for interview_responses
CREATE POLICY "InterviewResponses: select via interview"
ON public.interview_responses FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM interviews i 
    WHERE i.id = interview_responses.interview_id 
    AND (
      has_role(auth.uid(), 'developer'::app_role) OR 
      is_company_member(auth.uid(), i.company_id) OR
      i.interviewer_id = auth.uid() OR
      interview_responses.candidate_id = auth.uid()
    )
  )
);

CREATE POLICY "InterviewResponses: insert via interview"
ON public.interview_responses FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM interviews i 
    WHERE i.id = interview_responses.interview_id 
    AND (
      has_role(auth.uid(), 'developer'::app_role) OR 
      is_company_member(auth.uid(), i.company_id) OR
      i.interviewer_id = auth.uid() OR
      interview_responses.candidate_id = auth.uid()
    )
  )
);

CREATE POLICY "InterviewResponses: update via interview"
ON public.interview_responses FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM interviews i 
    WHERE i.id = interview_responses.interview_id 
    AND (
      has_role(auth.uid(), 'developer'::app_role) OR 
      is_company_member(auth.uid(), i.company_id) OR
      i.interviewer_id = auth.uid() OR
      interview_responses.candidate_id = auth.uid()
    )
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM interviews i 
    WHERE i.id = interview_responses.interview_id 
    AND (
      has_role(auth.uid(), 'developer'::app_role) OR 
      is_company_member(auth.uid(), i.company_id) OR
      i.interviewer_id = auth.uid() OR
      interview_responses.candidate_id = auth.uid()
    )
  )
);

CREATE POLICY "InterviewResponses: delete via interview"
ON public.interview_responses FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM interviews i 
    WHERE i.id = interview_responses.interview_id 
    AND (
      has_role(auth.uid(), 'developer'::app_role) OR 
      is_company_admin(auth.uid(), i.company_id) OR
      i.interviewer_id = auth.uid()
    )
  )
);

-- Add indexes for better performance
CREATE INDEX idx_candidates_company_id ON candidates(company_id);
CREATE INDEX idx_candidates_status ON candidates(status);
CREATE INDEX idx_interviews_company_id ON interviews(company_id);
CREATE INDEX idx_interviews_candidate_id ON interviews(candidate_id);
CREATE INDEX idx_interviews_interviewer_id ON interviews(interviewer_id);
CREATE INDEX idx_interviews_status ON interviews(status);
CREATE INDEX idx_interviews_scheduled_at ON interviews(scheduled_at);
CREATE INDEX idx_interview_questions_interview_id ON interview_questions(interview_id);
CREATE INDEX idx_interview_questions_question_id ON interview_questions(question_id);
CREATE INDEX idx_interview_responses_interview_id ON interview_responses(interview_id);
CREATE INDEX idx_interview_responses_candidate_id ON interview_responses(candidate_id);

-- Create triggers for updated_at
CREATE TRIGGER update_candidates_updated_at
  BEFORE UPDATE ON candidates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_interviews_updated_at
  BEFORE UPDATE ON interviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_interview_responses_updated_at
  BEFORE UPDATE ON interview_responses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();