-- Final fix for company_memberships_safe view SECURITY DEFINER issue
-- This migration specifically addresses the security linter error

-- Drop the existing view completely to ensure clean state
DROP VIEW IF EXISTS public.company_memberships_safe CASCADE;

-- Recreate the view with explicit security_invoker=on to prevent SECURITY DEFINER
-- This ensures the view uses the permissions of the querying user, not the creator
CREATE VIEW public.company_memberships_safe
WITH (security_invoker=on) AS
SELECT 
    cm.id,
    cm.company_id,
    cm.user_id,
    cm.role,
    CASE
        WHEN (cm.role = 'admin'::company_role) THEN 'Administrador'::text
        WHEN (cm.role = 'interviewer'::company_role) THEN 'Entrevistador'::text
        ELSE 'Desconhecido'::text
    END AS role_display,
    cm.added_by,
    cm.created_at,
    c.name AS company_name,
    p.display_name AS user_name
FROM company_memberships cm
JOIN companies c ON (c.id = cm.company_id)
JOIN profiles p ON (p.id = cm.user_id)
WHERE (
    -- Access control: only developers or company members can see memberships
    has_role(auth.uid(), 'developer'::app_role) OR 
    is_company_member(auth.uid(), cm.company_id)
);

-- Grant necessary permissions
GRANT SELECT ON public.company_memberships_safe TO authenticated;
GRANT ALL ON public.company_memberships_safe TO service_role;

-- Document the security approach
COMMENT ON VIEW public.company_memberships_safe IS 
'Secure view of company memberships created with security_invoker=on to respect RLS policies and user permissions. This prevents the SECURITY DEFINER security issue.';

-- Verify the view was created correctly
DO $$
DECLARE
    view_exists boolean;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM information_schema.views 
        WHERE table_schema = 'public' 
        AND table_name = 'company_memberships_safe'
    ) INTO view_exists;
    
    IF view_exists THEN
        RAISE NOTICE '✓ View company_memberships_safe recreated successfully with SECURITY INVOKER';
        RAISE NOTICE '✓ This should resolve the security_definer_view linter error';
    ELSE
        RAISE EXCEPTION 'Failed to create company_memberships_safe view';
    END IF;
END $$;