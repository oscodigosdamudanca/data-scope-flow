-- Update app_role enum to include fair_organizer
-- Based on PRD requirements for 4-level user hierarchy

-- Add fair_organizer to app_role enum if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'fair_organizer' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'app_role')) THEN
        ALTER TYPE app_role ADD VALUE 'fair_organizer';
    END IF;
END$$;

-- Insert default module permissions for fair_organizer
INSERT INTO public.module_permissions (module_name, role_type, role_name, permissions, is_active)
VALUES 
    ('feedback', 'app_role', 'fair_organizer', '{"read": true, "write": true, "delete": false}', true),
    ('custom_surveys', 'app_role', 'fair_organizer', '{"read": true, "write": true, "delete": true}', true),
    ('business_intelligence', 'app_role', 'fair_organizer', '{"read": true, "write": false, "delete": false}', true),
    ('leads', 'app_role', 'fair_organizer', '{"read": true, "write": false, "delete": false}', true),
    ('surveys', 'app_role', 'fair_organizer', '{"read": true, "write": false, "delete": false}', true),
    ('raffles', 'app_role', 'fair_organizer', '{"read": true, "write": false, "delete": false}', true)
ON CONFLICT (module_name, role_type, role_name) DO UPDATE SET
    permissions = EXCLUDED.permissions,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

-- Update existing permissions for other roles to ensure consistency
-- Organizer (company admin) permissions
INSERT INTO public.module_permissions (module_name, role_type, role_name, permissions, is_active)
VALUES 
    ('leads', 'app_role', 'organizer', '{"read": true, "write": true, "delete": true}', true),
    ('surveys', 'app_role', 'organizer', '{"read": true, "write": true, "delete": true}', true),
    ('raffles', 'app_role', 'organizer', '{"read": true, "write": true, "delete": true}', true),
    ('business_intelligence', 'app_role', 'organizer', '{"read": true, "write": true, "delete": false}', true),
    ('feedback', 'app_role', 'organizer', '{"read": false, "write": false, "delete": false}', false),
    ('custom_surveys', 'app_role', 'organizer', '{"read": false, "write": false, "delete": false}', false)
ON CONFLICT (module_name, role_type, role_name) DO UPDATE SET
    permissions = EXCLUDED.permissions,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

-- Admin (company admin) permissions
INSERT INTO public.module_permissions (module_name, role_type, role_name, permissions, is_active)
VALUES 
    ('leads', 'app_role', 'admin', '{"read": true, "write": true, "delete": true}', true),
    ('surveys', 'app_role', 'admin', '{"read": true, "write": true, "delete": true}', true),
    ('raffles', 'app_role', 'admin', '{"read": true, "write": true, "delete": true}', true),
    ('business_intelligence', 'app_role', 'admin', '{"read": true, "write": true, "delete": false}', true),
    ('feedback', 'app_role', 'admin', '{"read": false, "write": false, "delete": false}', false),
    ('custom_surveys', 'app_role', 'admin', '{"read": false, "write": false, "delete": false}', false)
ON CONFLICT (module_name, role_type, role_name) DO UPDATE SET
    permissions = EXCLUDED.permissions,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

-- Interviewer permissions (restricted access)
INSERT INTO public.module_permissions (module_name, role_type, role_name, permissions, is_active)
VALUES 
    ('leads', 'app_role', 'interviewer', '{"read": false, "write": true, "delete": false}', true),
    ('surveys', 'app_role', 'interviewer', '{"read": false, "write": false, "delete": false}', false),
    ('raffles', 'app_role', 'interviewer', '{"read": false, "write": false, "delete": false}', false),
    ('business_intelligence', 'app_role', 'interviewer', '{"read": false, "write": false, "delete": false}', false),
    ('feedback', 'app_role', 'interviewer', '{"read": false, "write": false, "delete": false}', false),
    ('custom_surveys', 'app_role', 'interviewer', '{"read": false, "write": false, "delete": false}', false)
ON CONFLICT (module_name, role_type, role_name) DO UPDATE SET
    permissions = EXCLUDED.permissions,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

-- Developer permissions (full access to everything)
INSERT INTO public.module_permissions (module_name, role_type, role_name, permissions, is_active)
VALUES 
    ('leads', 'app_role', 'developer', '{"read": true, "write": true, "delete": true}', true),
    ('surveys', 'app_role', 'developer', '{"read": true, "write": true, "delete": true}', true),
    ('raffles', 'app_role', 'developer', '{"read": true, "write": true, "delete": true}', true),
    ('business_intelligence', 'app_role', 'developer', '{"read": true, "write": true, "delete": true}', true),
    ('feedback', 'app_role', 'developer', '{"read": true, "write": true, "delete": true}', true),
    ('custom_surveys', 'app_role', 'developer', '{"read": true, "write": true, "delete": true}', true),
    ('question_types', 'app_role', 'developer', '{"read": true, "write": true, "delete": true}', true),
    ('system_logs', 'app_role', 'developer', '{"read": true, "write": true, "delete": true}', true),
    ('module_permissions', 'app_role', 'developer', '{"read": true, "write": true, "delete": true}', true)
ON CONFLICT (module_name, role_type, role_name) DO UPDATE SET
    permissions = EXCLUDED.permissions,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

-- Create view for easier permission checking
CREATE OR REPLACE VIEW public.user_module_permissions AS
SELECT 
    ur.user_id,
    ur.role as user_role,
    mp.module_name,
    mp.permissions,
    mp.is_active,
    p.email as user_email,
    p.full_name as user_name
FROM public.user_roles ur
JOIN public.module_permissions mp ON (
    mp.role_type = 'app_role' AND mp.role_name = ur.role::text
)
JOIN public.profiles p ON p.id = ur.user_id
WHERE mp.is_active = true;

-- Grant access to the view
GRANT SELECT ON public.user_module_permissions TO authenticated;

-- Comments for documentation
COMMENT ON VIEW public.user_module_permissions IS 'Consolidated view of user permissions across all modules';
COMMENT ON COLUMN public.user_module_permissions.permissions IS 'JSON object with read, write, delete permissions';
COMMENT ON COLUMN public.user_module_permissions.is_active IS 'Whether this permission set is currently active';

-- Create helper function to check specific permission
CREATE OR REPLACE FUNCTION public.user_has_permission(_user_id uuid, _module_name text, _permission text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT COALESCE(
        (SELECT (permissions->>_permission)::boolean 
         FROM public.user_module_permissions 
         WHERE user_id = _user_id 
         AND module_name = _module_name 
         AND is_active = true
         LIMIT 1),
        false
    );
$$;

GRANT EXECUTE ON FUNCTION public.user_has_permission(uuid, text, text) TO authenticated;

COMMENT ON FUNCTION public.user_has_permission(uuid, text, text) IS 'Check if user has specific permission for a module';