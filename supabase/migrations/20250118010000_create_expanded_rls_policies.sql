-- RLS Policies for DataScope Expanded Structure
-- Based on PRD requirements for 4-level user hierarchy

-- Helper functions for new role checks
CREATE OR REPLACE FUNCTION public.is_fair_organizer(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = _user_id
        AND role = 'fair_organizer'
    );
$$;

CREATE OR REPLACE FUNCTION public.can_access_module(_user_id uuid, _module_name text, _permission text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.module_permissions mp
        JOIN public.user_roles ur ON (
            (mp.role_type = 'app_role' AND ur.role::text = mp.role_name)
        )
        WHERE ur.user_id = _user_id
        AND mp.module_name = _module_name
        AND mp.is_active = true
        AND (mp.permissions->_permission)::boolean = true
    ) OR public.has_role(_user_id, 'developer');
$$;

-- Question Types Policies (Developer only)
CREATE POLICY "QuestionTypes: select developer only"
ON public.question_types FOR SELECT
USING (public.has_role(auth.uid(), 'developer'));

CREATE POLICY "QuestionTypes: insert developer only"
ON public.question_types FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'developer'));

CREATE POLICY "QuestionTypes: update developer only"
ON public.question_types FOR UPDATE
USING (public.has_role(auth.uid(), 'developer'))
WITH CHECK (public.has_role(auth.uid(), 'developer'));

CREATE POLICY "QuestionTypes: delete developer only"
ON public.question_types FOR DELETE
USING (public.has_role(auth.uid(), 'developer'));

-- Custom Surveys Policies (Fair Organizer + Developer)
CREATE POLICY "CustomSurveys: select fair organizer or developer"
ON public.custom_surveys FOR SELECT
USING (
    public.has_role(auth.uid(), 'developer')
    OR public.is_fair_organizer(auth.uid())
);

CREATE POLICY "CustomSurveys: insert fair organizer or developer"
ON public.custom_surveys FOR INSERT
WITH CHECK (
    public.has_role(auth.uid(), 'developer')
    OR public.is_fair_organizer(auth.uid())
);

CREATE POLICY "CustomSurveys: update own or developer"
ON public.custom_surveys FOR UPDATE
USING (
    public.has_role(auth.uid(), 'developer')
    OR (public.is_fair_organizer(auth.uid()) AND created_by = auth.uid())
)
WITH CHECK (
    public.has_role(auth.uid(), 'developer')
    OR (public.is_fair_organizer(auth.uid()) AND created_by = auth.uid())
);

CREATE POLICY "CustomSurveys: delete own or developer"
ON public.custom_surveys FOR DELETE
USING (
    public.has_role(auth.uid(), 'developer')
    OR (public.is_fair_organizer(auth.uid()) AND created_by = auth.uid())
);

-- Custom Survey Questions Policies
CREATE POLICY "CustomSurveyQuestions: select via survey"
ON public.custom_survey_questions FOR SELECT
USING (
    public.has_role(auth.uid(), 'developer')
    OR EXISTS (
        SELECT 1 FROM custom_surveys cs
        WHERE cs.id = custom_survey_questions.survey_id
        AND (public.is_fair_organizer(auth.uid()) OR cs.created_by = auth.uid())
    )
);

CREATE POLICY "CustomSurveyQuestions: insert via survey"
ON public.custom_survey_questions FOR INSERT
WITH CHECK (
    public.has_role(auth.uid(), 'developer')
    OR EXISTS (
        SELECT 1 FROM custom_surveys cs
        WHERE cs.id = custom_survey_questions.survey_id
        AND (public.is_fair_organizer(auth.uid()) AND cs.created_by = auth.uid())
    )
);

CREATE POLICY "CustomSurveyQuestions: update via survey"
ON public.custom_survey_questions FOR UPDATE
USING (
    public.has_role(auth.uid(), 'developer')
    OR EXISTS (
        SELECT 1 FROM custom_surveys cs
        WHERE cs.id = custom_survey_questions.survey_id
        AND (public.is_fair_organizer(auth.uid()) AND cs.created_by = auth.uid())
    )
)
WITH CHECK (
    public.has_role(auth.uid(), 'developer')
    OR EXISTS (
        SELECT 1 FROM custom_surveys cs
        WHERE cs.id = custom_survey_questions.survey_id
        AND (public.is_fair_organizer(auth.uid()) AND cs.created_by = auth.uid())
    )
);

CREATE POLICY "CustomSurveyQuestions: delete via survey"
ON public.custom_survey_questions FOR DELETE
USING (
    public.has_role(auth.uid(), 'developer')
    OR EXISTS (
        SELECT 1 FROM custom_surveys cs
        WHERE cs.id = custom_survey_questions.survey_id
        AND (public.is_fair_organizer(auth.uid()) AND cs.created_by = auth.uid())
    )
);

-- Custom Survey Responses Policies (Public read for active surveys)
CREATE POLICY "CustomSurveyResponses: select survey owner or developer"
ON public.custom_survey_responses FOR SELECT
USING (
    public.has_role(auth.uid(), 'developer')
    OR EXISTS (
        SELECT 1 FROM custom_surveys cs
        WHERE cs.id = custom_survey_responses.survey_id
        AND (public.is_fair_organizer(auth.uid()) OR cs.created_by = auth.uid())
    )
);

CREATE POLICY "CustomSurveyResponses: insert public for active surveys"
ON public.custom_survey_responses FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM custom_surveys cs
        WHERE cs.id = custom_survey_responses.survey_id
        AND cs.is_active = true
    )
);

-- Fair Feedback Policies (Public insert, Fair Organizer + Developer read)
CREATE POLICY "FairFeedback: select fair organizer or developer"
ON public.fair_feedback FOR SELECT
USING (
    public.has_role(auth.uid(), 'developer')
    OR public.is_fair_organizer(auth.uid())
);

CREATE POLICY "FairFeedback: insert public"
ON public.fair_feedback FOR INSERT
WITH CHECK (true); -- Anyone can submit feedback

CREATE POLICY "FairFeedback: update fair organizer or developer"
ON public.fair_feedback FOR UPDATE
USING (
    public.has_role(auth.uid(), 'developer')
    OR public.is_fair_organizer(auth.uid())
)
WITH CHECK (
    public.has_role(auth.uid(), 'developer')
    OR public.is_fair_organizer(auth.uid())
);

CREATE POLICY "FairFeedback: delete developer only"
ON public.fair_feedback FOR DELETE
USING (public.has_role(auth.uid(), 'developer'));

-- Business Intelligence Configs Policies
CREATE POLICY "BIConfigs: select own company or developer"
ON public.business_intelligence_configs FOR SELECT
USING (
    public.has_role(auth.uid(), 'developer')
    OR user_id = auth.uid()
    OR (company_id IS NOT NULL AND public.is_company_member(auth.uid(), company_id))
);

CREATE POLICY "BIConfigs: insert own or developer"
ON public.business_intelligence_configs FOR INSERT
WITH CHECK (
    public.has_role(auth.uid(), 'developer')
    OR user_id = auth.uid()
);

CREATE POLICY "BIConfigs: update own or developer"
ON public.business_intelligence_configs FOR UPDATE
USING (
    public.has_role(auth.uid(), 'developer')
    OR user_id = auth.uid()
)
WITH CHECK (
    public.has_role(auth.uid(), 'developer')
    OR user_id = auth.uid()
);

CREATE POLICY "BIConfigs: delete own or developer"
ON public.business_intelligence_configs FOR DELETE
USING (
    public.has_role(auth.uid(), 'developer')
    OR user_id = auth.uid()
);

-- System Logs Policies (Developer only)
CREATE POLICY "SystemLogs: select developer only"
ON public.system_logs FOR SELECT
USING (public.has_role(auth.uid(), 'developer'));

CREATE POLICY "SystemLogs: insert system only"
ON public.system_logs FOR INSERT
WITH CHECK (true); -- System can always log

CREATE POLICY "SystemLogs: update developer only"
ON public.system_logs FOR UPDATE
USING (public.has_role(auth.uid(), 'developer'))
WITH CHECK (public.has_role(auth.uid(), 'developer'));

CREATE POLICY "SystemLogs: delete developer only"
ON public.system_logs FOR DELETE
USING (public.has_role(auth.uid(), 'developer'));

-- Module Permissions Policies (Developer only)
CREATE POLICY "ModulePermissions: select developer only"
ON public.module_permissions FOR SELECT
USING (public.has_role(auth.uid(), 'developer'));

CREATE POLICY "ModulePermissions: insert developer only"
ON public.module_permissions FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'developer'));

CREATE POLICY "ModulePermissions: update developer only"
ON public.module_permissions FOR UPDATE
USING (public.has_role(auth.uid(), 'developer'))
WITH CHECK (public.has_role(auth.uid(), 'developer'));

CREATE POLICY "ModulePermissions: delete developer only"
ON public.module_permissions FOR DELETE
USING (public.has_role(auth.uid(), 'developer'));

-- Create logging trigger function
CREATE OR REPLACE FUNCTION public.log_user_action()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.system_logs (
        user_id,
        action,
        resource_type,
        resource_id,
        details
    ) VALUES (
        auth.uid(),
        TG_OP,
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        CASE 
            WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD)
            ELSE to_jsonb(NEW)
        END
    );
    
    RETURN COALESCE(NEW, OLD);
EXCEPTION
    WHEN OTHERS THEN
        -- Don't fail the main operation if logging fails
        RETURN COALESCE(NEW, OLD);
END;
$$;

-- Add logging triggers to important tables
CREATE TRIGGER log_leads_changes
    AFTER INSERT OR UPDATE OR DELETE ON public.leads
    FOR EACH ROW EXECUTE FUNCTION public.log_user_action();

CREATE TRIGGER log_surveys_changes
    AFTER INSERT OR UPDATE OR DELETE ON public.surveys
    FOR EACH ROW EXECUTE FUNCTION public.log_user_action();

CREATE TRIGGER log_raffles_changes
    AFTER INSERT OR UPDATE OR DELETE ON public.raffles
    FOR EACH ROW EXECUTE FUNCTION public.log_user_action();

CREATE TRIGGER log_custom_surveys_changes
    AFTER INSERT OR UPDATE OR DELETE ON public.custom_surveys
    FOR EACH ROW EXECUTE FUNCTION public.log_user_action();

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.is_fair_organizer(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_access_module(uuid, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_user_action() TO authenticated;

-- Comments for documentation
COMMENT ON FUNCTION public.is_fair_organizer(uuid) IS 'Checks if user has fair_organizer role';
COMMENT ON FUNCTION public.can_access_module(uuid, text, text) IS 'Checks if user has specific permission for a module';
COMMENT ON TABLE public.question_types IS 'Pre-configured question types for surveys, managed by developer';
COMMENT ON TABLE public.custom_surveys IS 'Custom surveys created by fair organizers for specific audiences';
COMMENT ON TABLE public.fair_feedback IS 'Feedback about the fair event itself, visible to organizers';
COMMENT ON TABLE public.business_intelligence_configs IS 'User-specific BI dashboard configurations';
COMMENT ON TABLE public.system_logs IS 'System activity logs for monitoring and auditing';
COMMENT ON TABLE public.module_permissions IS 'Fine-grained permissions for each module and role';