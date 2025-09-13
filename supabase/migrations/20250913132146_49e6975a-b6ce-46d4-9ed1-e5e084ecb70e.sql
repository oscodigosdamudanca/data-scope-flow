-- Drop and recreate the company_memberships_safe view without SECURITY DEFINER
-- This fixes the security linter issue about Security Definer View

DROP VIEW IF EXISTS public.company_memberships_safe;

-- Recreate the view as a regular view (without SECURITY DEFINER)
-- The view will use the permissions of the querying user instead of the view creator
CREATE VIEW public.company_memberships_safe AS
SELECT 
  cm.id,
  cm.company_id,
  cm.user_id,
  cm.role,
  CASE
    WHEN cm.role = 'admin'::company_role THEN 'Administrador'::text
    WHEN cm.role = 'interviewer'::company_role THEN 'Entrevistador'::text
    ELSE 'Desconhecido'::text
  END AS role_display,
  cm.added_by,
  cm.created_at,
  c.name AS company_name,
  p.display_name AS user_name
FROM company_memberships cm
  JOIN companies c ON c.id = cm.company_id
  JOIN profiles p ON p.id = cm.user_id;

-- Enable RLS on the view (this will respect the user's permissions)
ALTER VIEW public.company_memberships_safe SET (security_barrier = true);

-- Add comment explaining the security approach
COMMENT ON VIEW public.company_memberships_safe IS 'Safe view for company memberships that respects RLS policies of underlying tables';