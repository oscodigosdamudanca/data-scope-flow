-- Migration to fix security issues identified by Supabase linter
-- Fixes:
-- 1. Remove SECURITY DEFINER from view company_memberships_safe
-- 2. Set search_path for functions validate_company_role and fix_company_role_on_change
-- 3. Enable leaked password protection in Auth (requires dashboard configuration)

-- 1. Recreate company_memberships_safe view without SECURITY DEFINER
-- Views should not use SECURITY DEFINER as they don't enforce proper RLS
DROP VIEW IF EXISTS public.company_memberships_safe;

CREATE VIEW public.company_memberships_safe AS
SELECT 
    cm.id,
    cm.company_id,
    cm.user_id,
    cm.role,
    CASE 
        WHEN cm.role = 'admin' THEN 'Administrador'
        WHEN cm.role = 'interviewer' THEN 'Entrevistador'
        ELSE 'Desconhecido'
    END as role_display,
    cm.added_by,
    cm.created_at,
    c.name as company_name,
    p.display_name as user_name
FROM public.company_memberships cm
JOIN public.companies c ON c.id = cm.company_id
JOIN public.profiles p ON p.id = cm.user_id;

-- Grant permissions to the view
GRANT SELECT ON public.company_memberships_safe TO authenticated;

-- 2. Fix validate_company_role function to set search_path
CREATE OR REPLACE FUNCTION public.validate_company_role(role_value text)
RETURNS public.company_role
LANGUAGE plpgsql
IMMUTABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Convert 'owner' to 'admin' for backward compatibility
    IF role_value = 'owner' THEN
        RETURN 'admin'::public.company_role;
    END IF;
    
    -- Validate that the role exists in the enum
    IF role_value NOT IN ('admin', 'interviewer') THEN
        RAISE EXCEPTION 'Invalid company role: %. Valid values are: admin, interviewer', role_value;
    END IF;
    
    RETURN role_value::public.company_role;
END;
$$;

-- 3. Fix fix_company_role_on_change function to set search_path
CREATE OR REPLACE FUNCTION public.fix_company_role_on_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Auto-fix 'owner' to 'admin' on insert/update
    IF NEW.role::text = 'owner' THEN
        NEW.role = 'admin'::public.company_role;
        RAISE NOTICE 'Automatically converted owner role to admin for user %', NEW.user_id;
    END IF;
    
    RETURN NEW;
END;
$$;

-- 4. Update other security definer functions to ensure they have proper search_path
-- Fix is_company_admin_safe function (already has search_path, but let's ensure it's correct)
CREATE OR REPLACE FUNCTION public.is_company_admin_safe(_user_id uuid, _company_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.company_memberships
        WHERE user_id = _user_id
          AND company_id = _company_id
          AND role = 'admin'::public.company_role
    );
$$;

-- Fix add_company_membership function to ensure proper search_path
CREATE OR REPLACE FUNCTION public.add_company_membership(
    _company_id uuid,
    _user_id uuid,
    _role text,
    _added_by uuid DEFAULT auth.uid()
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    _membership_id uuid;
    _validated_role public.company_role;
BEGIN
    -- Validate and convert role
    _validated_role := public.validate_company_role(_role);
    
    -- Insert the membership
    INSERT INTO public.company_memberships (company_id, user_id, role, added_by)
    VALUES (_company_id, _user_id, _validated_role, _added_by)
    ON CONFLICT (company_id, user_id) 
    DO UPDATE SET 
        role = _validated_role,
        added_by = _added_by
    RETURNING id INTO _membership_id;
    
    RETURN _membership_id;
END;
$$;

-- Add comments for documentation
COMMENT ON VIEW public.company_memberships_safe IS 'Safe view for company memberships with display names (without SECURITY DEFINER)';
COMMENT ON FUNCTION public.validate_company_role(text) IS 'Validates and converts company role values with fixed search_path';
COMMENT ON FUNCTION public.fix_company_role_on_change() IS 'Trigger function to fix invalid company role values with fixed search_path';

-- 5. Note about leaked password protection
-- The leaked password protection must be enabled in the Supabase Dashboard:
-- Go to Authentication > Settings > Password Protection
-- Enable "Check for leaked passwords"
-- This cannot be done via SQL migration and requires manual dashboard configuration

-- Log completion
DO $$
BEGIN
    RAISE NOTICE 'Security fixes applied successfully:';
    RAISE NOTICE '1. ✓ Removed SECURITY DEFINER from company_memberships_safe view';
    RAISE NOTICE '2. ✓ Fixed search_path for validate_company_role function';
    RAISE NOTICE '3. ✓ Fixed search_path for fix_company_role_on_change function';
    RAISE NOTICE '4. ⚠ Manual action required: Enable leaked password protection in Supabase Dashboard';
    RAISE NOTICE '   Go to Authentication > Settings > Password Protection > Enable "Check for leaked passwords"';
END $$;