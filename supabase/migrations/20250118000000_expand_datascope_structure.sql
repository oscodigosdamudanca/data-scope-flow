-- DataScope Expansion - Complete Structure for PRD Requirements
-- This migration expands the existing structure to support all 5 modules

-- 1. Update app_role enum to match PRD requirements
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'fair_organizer';

-- 2. Create question_types table for developer configuration
CREATE TABLE IF NOT EXISTS public.question_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    description TEXT,
    input_type TEXT NOT NULL CHECK (input_type IN ('text', 'textarea', 'select', 'radio', 'checkbox', 'rating', 'yes_no')),
    validation_rules JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_by UUID NOT NULL REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create custom_surveys table for Fair Organizer exclusive surveys
CREATE TABLE IF NOT EXISTS public.custom_surveys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    target_audience TEXT NOT NULL CHECK (target_audience IN ('exhibitors', 'visitors', 'general')),
    is_active BOOLEAN DEFAULT true,
    created_by UUID NOT NULL REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT custom_surveys_organizer_only CHECK (
        EXISTS (
            SELECT 1 FROM user_roles ur 
            WHERE ur.user_id = created_by 
            AND ur.role = 'fair_organizer'
        )
    )
);

-- 4. Create custom_survey_questions table
CREATE TABLE IF NOT EXISTS public.custom_survey_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    survey_id UUID NOT NULL REFERENCES custom_surveys(id) ON DELETE CASCADE,
    question_type_id UUID NOT NULL REFERENCES question_types(id),
    question_text TEXT NOT NULL,
    options JSONB,
    is_required BOOLEAN DEFAULT false,
    order_index INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create custom_survey_responses table
CREATE TABLE IF NOT EXISTS public.custom_survey_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    survey_id UUID NOT NULL REFERENCES custom_surveys(id) ON DELETE CASCADE,
    respondent_name TEXT,
    respondent_email TEXT,
    respondent_profile JSONB,
    responses JSONB NOT NULL,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Create fair_feedback table (separate from general feedback)
CREATE TABLE IF NOT EXISTS public.fair_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category TEXT NOT NULL CHECK (category IN ('organization', 'venue', 'logistics', 'networking', 'content', 'overall')),
    subcategory TEXT,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    suggestions TEXT,
    respondent_name TEXT,
    respondent_email TEXT,
    respondent_company TEXT,
    respondent_type TEXT CHECK (respondent_type IN ('exhibitor', 'visitor', 'sponsor', 'speaker')),
    is_anonymous BOOLEAN DEFAULT false,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Create business_intelligence_configs table for BI customization
CREATE TABLE IF NOT EXISTS public.business_intelligence_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id),
    dashboard_type TEXT NOT NULL CHECK (dashboard_type IN ('leads', 'surveys', 'raffles', 'feedback', 'overview')),
    widget_configs JSONB NOT NULL DEFAULT '[]',
    layout_config JSONB NOT NULL DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Create system_logs table for developer monitoring
CREATE TABLE IF NOT EXISTS public.system_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id),
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id UUID,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Create module_permissions table for developer control
CREATE TABLE IF NOT EXISTS public.module_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_name TEXT NOT NULL CHECK (module_name IN ('leads', 'surveys', 'raffles', 'feedback', 'custom_surveys', 'business_intelligence')),
    role_type TEXT NOT NULL CHECK (role_type IN ('app_role', 'company_role')),
    role_name TEXT NOT NULL,
    permissions JSONB NOT NULL DEFAULT '{}', -- {"read": true, "write": true, "delete": false}
    is_active BOOLEAN DEFAULT true,
    created_by UUID NOT NULL REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(module_name, role_type, role_name)
);

-- 10. Enable RLS on new tables
ALTER TABLE public.question_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_survey_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_survey_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fair_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_intelligence_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.module_permissions ENABLE ROW LEVEL SECURITY;

-- 11. Create indexes for performance
CREATE INDEX idx_question_types_active ON question_types(is_active);
CREATE INDEX idx_custom_surveys_active ON custom_surveys(is_active);
CREATE INDEX idx_custom_surveys_created_by ON custom_surveys(created_by);
CREATE INDEX idx_custom_survey_questions_survey_id ON custom_survey_questions(survey_id);
CREATE INDEX idx_custom_survey_questions_order ON custom_survey_questions(order_index);
CREATE INDEX idx_custom_survey_responses_survey_id ON custom_survey_responses(survey_id);
CREATE INDEX idx_fair_feedback_category ON fair_feedback(category);
CREATE INDEX idx_fair_feedback_rating ON fair_feedback(rating);
CREATE INDEX idx_fair_feedback_submitted_at ON fair_feedback(submitted_at);
CREATE INDEX idx_bi_configs_company_id ON business_intelligence_configs(company_id);
CREATE INDEX idx_bi_configs_user_id ON business_intelligence_configs(user_id);
CREATE INDEX idx_bi_configs_dashboard_type ON business_intelligence_configs(dashboard_type);
CREATE INDEX idx_system_logs_user_id ON system_logs(user_id);
CREATE INDEX idx_system_logs_action ON system_logs(action);
CREATE INDEX idx_system_logs_created_at ON system_logs(created_at);
CREATE INDEX idx_module_permissions_module ON module_permissions(module_name);
CREATE INDEX idx_module_permissions_role ON module_permissions(role_type, role_name);

-- 12. Create triggers for updated_at
CREATE TRIGGER update_question_types_updated_at
    BEFORE UPDATE ON question_types
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_custom_surveys_updated_at
    BEFORE UPDATE ON custom_surveys
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_bi_configs_updated_at
    BEFORE UPDATE ON business_intelligence_configs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_module_permissions_updated_at
    BEFORE UPDATE ON module_permissions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- 13. Insert default question types for developer
INSERT INTO public.question_types (name, display_name, description, input_type, validation_rules, created_by) 
SELECT 
    'short_text', 'Texto Curto', 'Campo de texto simples para respostas curtas', 'text', 
    '{"maxLength": 255}', 
    (SELECT id FROM profiles WHERE id IN (SELECT user_id FROM user_roles WHERE role = 'developer') LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM question_types WHERE name = 'short_text');

INSERT INTO public.question_types (name, display_name, description, input_type, validation_rules, created_by) 
SELECT 
    'long_text', 'Texto Longo', 'Campo de texto para respostas detalhadas', 'textarea', 
    '{"maxLength": 2000}', 
    (SELECT id FROM profiles WHERE id IN (SELECT user_id FROM user_roles WHERE role = 'developer') LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM question_types WHERE name = 'long_text');

INSERT INTO public.question_types (name, display_name, description, input_type, validation_rules, created_by) 
SELECT 
    'multiple_choice', 'Múltipla Escolha', 'Seleção única entre várias opções', 'radio', 
    '{"minOptions": 2, "maxOptions": 10}', 
    (SELECT id FROM profiles WHERE id IN (SELECT user_id FROM user_roles WHERE role = 'developer') LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM question_types WHERE name = 'multiple_choice');

INSERT INTO public.question_types (name, display_name, description, input_type, validation_rules, created_by) 
SELECT 
    'yes_no', 'Sim/Não', 'Pergunta binária simples', 'yes_no', 
    '{}', 
    (SELECT id FROM profiles WHERE id IN (SELECT user_id FROM user_roles WHERE role = 'developer') LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM question_types WHERE name = 'yes_no');

INSERT INTO public.question_types (name, display_name, description, input_type, validation_rules, created_by) 
SELECT 
    'rating_5', 'Avaliação 1-5', 'Escala de avaliação de 1 a 5 estrelas', 'rating', 
    '{"min": 1, "max": 5}', 
    (SELECT id FROM profiles WHERE id IN (SELECT user_id FROM user_roles WHERE role = 'developer') LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM question_types WHERE name = 'rating_5');

-- 14. Insert default module permissions
INSERT INTO public.module_permissions (module_name, role_type, role_name, permissions, created_by)
SELECT 
    'leads', 'app_role', 'developer', 
    '{"read": true, "write": true, "delete": true, "admin": true}',
    (SELECT id FROM profiles WHERE id IN (SELECT user_id FROM user_roles WHERE role = 'developer') LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM module_permissions WHERE module_name = 'leads' AND role_type = 'app_role' AND role_name = 'developer');

INSERT INTO public.module_permissions (module_name, role_type, role_name, permissions, created_by)
SELECT 
    'custom_surveys', 'app_role', 'fair_organizer', 
    '{"read": true, "write": true, "delete": true, "admin": true}',
    (SELECT id FROM profiles WHERE id IN (SELECT user_id FROM user_roles WHERE role = 'developer') LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM module_permissions WHERE module_name = 'custom_surveys' AND role_type = 'app_role' AND role_name = 'fair_organizer');

-- Add more default permissions as needed...