-- RLS Policies for DataScope tables

-- Leads policies
CREATE POLICY "Leads: select company member or developer"
ON public.leads FOR SELECT
USING (
    auth.uid() IN (SELECT user_id FROM profiles WHERE app_role = 'developer')
    OR is_company_member(auth.uid(), company_id)
);

CREATE POLICY "Leads: insert company member or developer"
ON public.leads FOR INSERT
WITH CHECK (
    auth.uid() IN (SELECT user_id FROM profiles WHERE app_role = 'developer')
    OR is_company_member(auth.uid(), company_id)
);

CREATE POLICY "Leads: update company admin or developer"
ON public.leads FOR UPDATE
USING (
    auth.uid() IN (SELECT user_id FROM profiles WHERE app_role = 'developer')
    OR is_company_admin(auth.uid(), company_id)
)
WITH CHECK (
    auth.uid() IN (SELECT user_id FROM profiles WHERE app_role = 'developer')
    OR is_company_admin(auth.uid(), company_id)
);

CREATE POLICY "Leads: delete company admin or developer"
ON public.leads FOR DELETE
USING (
    auth.uid() IN (SELECT user_id FROM profiles WHERE app_role = 'developer')
    OR is_company_admin(auth.uid(), company_id)
);

-- Surveys policies
CREATE POLICY "Surveys: select company member or developer"
ON public.surveys FOR SELECT
USING (
    auth.uid() IN (SELECT user_id FROM profiles WHERE app_role = 'developer')
    OR is_company_member(auth.uid(), company_id)
);

CREATE POLICY "Surveys: insert company admin or developer"
ON public.surveys FOR INSERT
WITH CHECK (
    auth.uid() IN (SELECT user_id FROM profiles WHERE app_role = 'developer')
    OR is_company_admin(auth.uid(), company_id)
);

CREATE POLICY "Surveys: update company admin or developer"
ON public.surveys FOR UPDATE
USING (
    auth.uid() IN (SELECT user_id FROM profiles WHERE app_role = 'developer')
    OR is_company_admin(auth.uid(), company_id)
)
WITH CHECK (
    auth.uid() IN (SELECT user_id FROM profiles WHERE app_role = 'developer')
    OR is_company_admin(auth.uid(), company_id)
);

CREATE POLICY "Surveys: delete company admin or developer"
ON public.surveys FOR DELETE
USING (
    auth.uid() IN (SELECT user_id FROM profiles WHERE app_role = 'developer')
    OR is_company_admin(auth.uid(), company_id)
);

-- Survey Questions policies
CREATE POLICY "SurveyQuestions: select via survey"
ON public.survey_questions FOR SELECT
USING (
    auth.uid() IN (SELECT user_id FROM profiles WHERE app_role = 'developer')
    OR EXISTS (
        SELECT 1 FROM surveys s
        WHERE s.id = survey_questions.survey_id
        AND is_company_member(auth.uid(), s.company_id)
    )
);

CREATE POLICY "SurveyQuestions: insert via survey"
ON public.survey_questions FOR INSERT
WITH CHECK (
    auth.uid() IN (SELECT user_id FROM profiles WHERE app_role = 'developer')
    OR EXISTS (
        SELECT 1 FROM surveys s
        WHERE s.id = survey_questions.survey_id
        AND is_company_admin(auth.uid(), s.company_id)
    )
);

CREATE POLICY "SurveyQuestions: update via survey"
ON public.survey_questions FOR UPDATE
USING (
    auth.uid() IN (SELECT user_id FROM profiles WHERE app_role = 'developer')
    OR EXISTS (
        SELECT 1 FROM surveys s
        WHERE s.id = survey_questions.survey_id
        AND is_company_admin(auth.uid(), s.company_id)
    )
)
WITH CHECK (
    auth.uid() IN (SELECT user_id FROM profiles WHERE app_role = 'developer')
    OR EXISTS (
        SELECT 1 FROM surveys s
        WHERE s.id = survey_questions.survey_id
        AND is_company_admin(auth.uid(), s.company_id)
    )
);

CREATE POLICY "SurveyQuestions: delete via survey"
ON public.survey_questions FOR DELETE
USING (
    auth.uid() IN (SELECT user_id FROM profiles WHERE app_role = 'developer')
    OR EXISTS (
        SELECT 1 FROM surveys s
        WHERE s.id = survey_questions.survey_id
        AND is_company_admin(auth.uid(), s.company_id)
    )
);

-- Survey Responses policies (more permissive for public access)
CREATE POLICY "SurveyResponses: select company member or developer"
ON public.survey_responses FOR SELECT
USING (
    auth.uid() IN (SELECT user_id FROM profiles WHERE app_role = 'developer')
    OR EXISTS (
        SELECT 1 FROM surveys s
        WHERE s.id = survey_responses.survey_id
        AND is_company_member(auth.uid(), s.company_id)
    )
);

CREATE POLICY "SurveyResponses: insert public access"
ON public.survey_responses FOR INSERT
WITH CHECK (true); -- Allow public to submit responses

-- Raffles policies
CREATE POLICY "Raffles: select company member or developer"
ON public.raffles FOR SELECT
USING (
    auth.uid() IN (SELECT user_id FROM profiles WHERE app_role = 'developer')
    OR is_company_member(auth.uid(), company_id)
);

CREATE POLICY "Raffles: insert company admin or developer"
ON public.raffles FOR INSERT
WITH CHECK (
    auth.uid() IN (SELECT user_id FROM profiles WHERE app_role = 'developer')
    OR is_company_admin(auth.uid(), company_id)
);

CREATE POLICY "Raffles: update company admin or developer"
ON public.raffles FOR UPDATE
USING (
    auth.uid() IN (SELECT user_id FROM profiles WHERE app_role = 'developer')
    OR is_company_admin(auth.uid(), company_id)
)
WITH CHECK (
    auth.uid() IN (SELECT user_id FROM profiles WHERE app_role = 'developer')
    OR is_company_admin(auth.uid(), company_id)
);

CREATE POLICY "Raffles: delete company admin or developer"
ON public.raffles FOR DELETE
USING (
    auth.uid() IN (SELECT user_id FROM profiles WHERE app_role = 'developer')
    OR is_company_admin(auth.uid(), company_id)
);

-- Raffle Participants policies
CREATE POLICY "RaffleParticipants: select via raffle"
ON public.raffle_participants FOR SELECT
USING (
    auth.uid() IN (SELECT user_id FROM profiles WHERE app_role = 'developer')
    OR EXISTS (
        SELECT 1 FROM raffles r
        WHERE r.id = raffle_participants.raffle_id
        AND is_company_member(auth.uid(), r.company_id)
    )
);

CREATE POLICY "RaffleParticipants: insert public access"
ON public.raffle_participants FOR INSERT
WITH CHECK (true); -- Allow public to participate in raffles

-- Feedback policies
CREATE POLICY "Feedback: select company member or developer"
ON public.feedback FOR SELECT
USING (
    auth.uid() IN (SELECT user_id FROM profiles WHERE app_role = 'developer')
    OR is_company_member(auth.uid(), company_id)
);

CREATE POLICY "Feedback: insert public access"
ON public.feedback FOR INSERT
WITH CHECK (true); -- Allow public to submit feedback

CREATE POLICY "Feedback: update company admin or developer"
ON public.feedback FOR UPDATE
USING (
    auth.uid() IN (SELECT user_id FROM profiles WHERE app_role = 'developer')
    OR is_company_admin(auth.uid(), company_id)
)
WITH CHECK (
    auth.uid() IN (SELECT user_id FROM profiles WHERE app_role = 'developer')
    OR is_company_admin(auth.uid(), company_id)
);

CREATE POLICY "Feedback: delete company admin or developer"
ON public.feedback FOR DELETE
USING (
    auth.uid() IN (SELECT user_id FROM profiles WHERE app_role = 'developer')
    OR is_company_admin(auth.uid(), company_id)
);