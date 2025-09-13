-- Enable Row Level Security on company_memberships_safe
ALTER TABLE public.company_memberships_safe ENABLE ROW LEVEL SECURITY;

-- Add RLS policies to company_memberships_safe to match the security model of company_memberships
-- Policy 1: Allow SELECT for company members or developers
CREATE POLICY "Safe Memberships: select member or developer" 
ON public.company_memberships_safe 
FOR SELECT 
USING (
  has_role(auth.uid(), 'developer'::app_role) OR 
  is_company_member(auth.uid(), company_id)
);

-- Policy 2: Allow INSERT for company admins or developers
CREATE POLICY "Safe Memberships: insert admin or developer" 
ON public.company_memberships_safe 
FOR INSERT 
WITH CHECK (
  has_role(auth.uid(), 'developer'::app_role) OR 
  is_company_admin(auth.uid(), company_id)
);

-- Policy 3: Allow UPDATE for company admins or developers
CREATE POLICY "Safe Memberships: update admin or developer" 
ON public.company_memberships_safe 
FOR UPDATE 
USING (
  has_role(auth.uid(), 'developer'::app_role) OR 
  is_company_admin(auth.uid(), company_id)
)
WITH CHECK (
  has_role(auth.uid(), 'developer'::app_role) OR 
  is_company_admin(auth.uid(), company_id)
);

-- Policy 4: Allow DELETE for company admins or developers
CREATE POLICY "Safe Memberships: delete admin or developer" 
ON public.company_memberships_safe 
FOR DELETE 
USING (
  has_role(auth.uid(), 'developer'::app_role) OR 
  is_company_admin(auth.uid(), company_id)
);