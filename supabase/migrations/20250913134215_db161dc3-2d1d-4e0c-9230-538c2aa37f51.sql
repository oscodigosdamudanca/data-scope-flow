-- Drop the existing unsafe view
DROP VIEW IF EXISTS public.company_memberships_safe;

-- Create a secure version of the view that respects access controls
CREATE VIEW public.company_memberships_safe AS
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

-- Add a comment explaining the security model
COMMENT ON VIEW public.company_memberships_safe IS 
'Secure view of company memberships that respects access controls. Only shows data to developers or company members.';

-- Grant appropriate permissions
GRANT SELECT ON public.company_memberships_safe TO authenticated;
GRANT ALL ON public.company_memberships_safe TO service_role;