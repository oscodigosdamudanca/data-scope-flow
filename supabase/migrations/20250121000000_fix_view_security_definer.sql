-- Fix company_memberships_safe view to remove SECURITY DEFINER
-- This addresses the security linter error about Security Definer View

-- Drop the existing view completely
DROP VIEW IF EXISTS public.company_memberships_safe CASCADE;

-- Recreate the view with explicit SECURITY INVOKER to ensure it uses
-- the permissions of the querying user, not the view creator
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
    -- Only show memberships if user is a developer OR is a member of the company
    has_role(auth.uid(), 'developer'::app_role) OR 
    is_company_member(auth.uid(), cm.company_id)
);

-- Grant appropriate permissions
GRANT SELECT ON public.company_memberships_safe TO authenticated;
GRANT ALL ON public.company_memberships_safe TO service_role;

-- Add a comment explaining the security model
COMMENT ON VIEW public.company_memberships_safe IS 
'Secure view of company memberships with SECURITY INVOKER that respects access controls and RLS policies. Only shows data to developers or company members.';

-- Log the fix
DO $$
BEGIN
    RAISE NOTICE 'Fixed company_memberships_safe view:';
    RAISE NOTICE '✓ Removed SECURITY DEFINER property';
    RAISE NOTICE '✓ Added explicit SECURITY INVOKER (security_invoker=on)';
    RAISE NOTICE '✓ View now respects RLS policies and user permissions';
END $$;