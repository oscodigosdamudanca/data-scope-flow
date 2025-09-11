-- Create question types management tables

-- Question categories enum
CREATE TYPE public.question_category AS ENUM (
  'technical',
  'behavioral', 
  'cultural',
  'situational',
  'general'
);

-- Question difficulty enum
CREATE TYPE public.question_difficulty AS ENUM (
  'easy',
  'medium',
  'hard'
);

-- Question types table
CREATE TABLE IF NOT EXISTS public.question_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  category public.question_category NOT NULL,
  difficulty public.question_difficulty NOT NULL DEFAULT 'medium',
  tags text[] DEFAULT '{}',
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid NOT NULL,
  company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.question_types ENABLE ROW LEVEL SECURITY;

-- Add updated_at trigger
CREATE TRIGGER trg_question_types_updated_at
  BEFORE UPDATE ON public.question_types
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Question types policies
CREATE POLICY "QuestionTypes: select company member or developer" ON public.question_types
  FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'developer')
    OR (company_id IS NOT NULL AND public.is_company_member(auth.uid(), company_id))
    OR (company_id IS NULL AND public.has_role(auth.uid(), 'admin'))
  );

CREATE POLICY "QuestionTypes: insert company admin or developer" ON public.question_types
  FOR INSERT TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'developer')
    OR (company_id IS NOT NULL AND public.is_company_admin(auth.uid(), company_id))
    OR (company_id IS NULL AND public.has_role(auth.uid(), 'admin'))
  );

CREATE POLICY "QuestionTypes: update company admin or developer" ON public.question_types
  FOR UPDATE TO authenticated
  USING (
    public.has_role(auth.uid(), 'developer')
    OR (company_id IS NOT NULL AND public.is_company_admin(auth.uid(), company_id))
    OR (company_id IS NULL AND public.has_role(auth.uid(), 'admin'))
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'developer')
    OR (company_id IS NOT NULL AND public.is_company_admin(auth.uid(), company_id))
    OR (company_id IS NULL AND public.has_role(auth.uid(), 'admin'))
  );

CREATE POLICY "QuestionTypes: delete company admin or developer" ON public.question_types
  FOR DELETE TO authenticated
  USING (
    public.has_role(auth.uid(), 'developer')
    OR (company_id IS NOT NULL AND public.is_company_admin(auth.uid(), company_id))
    OR (company_id IS NULL AND public.has_role(auth.uid(), 'admin'))
  );

-- Questions table for actual questions
CREATE TABLE IF NOT EXISTS public.questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_type_id uuid NOT NULL REFERENCES public.question_types(id) ON DELETE CASCADE,
  question_text text NOT NULL,
  expected_answer text,
  evaluation_criteria text,
  time_limit_minutes integer,
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

-- Add updated_at trigger
CREATE TRIGGER trg_questions_updated_at
  BEFORE UPDATE ON public.questions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Questions policies (inherit from question_types)
CREATE POLICY "Questions: select via question_type" ON public.questions
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.question_types qt
      WHERE qt.id = question_type_id
      AND (
        public.has_role(auth.uid(), 'developer')
        OR (qt.company_id IS NOT NULL AND public.is_company_member(auth.uid(), qt.company_id))
        OR (qt.company_id IS NULL AND public.has_role(auth.uid(), 'admin'))
      )
    )
  );

CREATE POLICY "Questions: insert via question_type" ON public.questions
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.question_types qt
      WHERE qt.id = question_type_id
      AND (
        public.has_role(auth.uid(), 'developer')
        OR (qt.company_id IS NOT NULL AND public.is_company_admin(auth.uid(), qt.company_id))
        OR (qt.company_id IS NULL AND public.has_role(auth.uid(), 'admin'))
      )
    )
  );

CREATE POLICY "Questions: update via question_type" ON public.questions
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.question_types qt
      WHERE qt.id = question_type_id
      AND (
        public.has_role(auth.uid(), 'developer')
        OR (qt.company_id IS NOT NULL AND public.is_company_admin(auth.uid(), qt.company_id))
        OR (qt.company_id IS NULL AND public.has_role(auth.uid(), 'admin'))
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.question_types qt
      WHERE qt.id = question_type_id
      AND (
        public.has_role(auth.uid(), 'developer')
        OR (qt.company_id IS NOT NULL AND public.is_company_admin(auth.uid(), qt.company_id))
        OR (qt.company_id IS NULL AND public.has_role(auth.uid(), 'admin'))
      )
    )
  );

CREATE POLICY "Questions: delete via question_type" ON public.questions
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.question_types qt
      WHERE qt.id = question_type_id
      AND (
        public.has_role(auth.uid(), 'developer')
        OR (qt.company_id IS NOT NULL AND public.is_company_admin(auth.uid(), qt.company_id))
        OR (qt.company_id IS NULL AND public.has_role(auth.uid(), 'admin'))
      )
    )
  );

-- Create indexes for better performance
CREATE INDEX idx_question_types_company_id ON public.question_types(company_id);
CREATE INDEX idx_question_types_category ON public.question_types(category);
CREATE INDEX idx_question_types_difficulty ON public.question_types(difficulty);
CREATE INDEX idx_question_types_is_active ON public.question_types(is_active);
CREATE INDEX idx_questions_question_type_id ON public.questions(question_type_id);
CREATE INDEX idx_questions_is_active ON public.questions(is_active);