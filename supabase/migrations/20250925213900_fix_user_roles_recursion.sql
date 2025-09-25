-- Fix infinite recursion in user_roles RLS policies
-- The has_role function queries user_roles table, but user_roles policies use has_role
-- This creates infinite recursion

-- Drop problematic policies that cause recursion
DROP POLICY IF EXISTS "UserRoles: select self or developer" ON public.user_roles;
DROP POLICY IF EXISTS "UserRoles: manage only developer" ON public.user_roles;

-- Create new policies without using has_role function to avoid recursion
-- Simple policy: users can see and manage their own roles
CREATE POLICY "UserRoles: manage self" ON public.user_roles
FOR ALL TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Separate policy for developers to manage all roles
-- This checks if the user has developer role directly to avoid recursion
CREATE POLICY "UserRoles: developer manage all" ON public.user_roles
FOR ALL TO authenticated
USING (
  -- Check if current user is developer by looking directly in user_roles
  -- This avoids the has_role function
  auth.uid() IN (
    SELECT ur.user_id 
    FROM public.user_roles ur 
    WHERE ur.role = 'developer'
  )
)
WITH CHECK (
  auth.uid() IN (
    SELECT ur.user_id 
    FROM public.user_roles ur 
    WHERE ur.role = 'developer'
  )
);

-- Add comments explaining the fix
COMMENT ON POLICY "UserRoles: manage self" ON public.user_roles IS 
'Allows users to manage their own roles without recursion issues';

COMMENT ON POLICY "UserRoles: developer manage all" ON public.user_roles IS 
'Allows developers to manage all roles by checking user_roles directly to avoid recursion with has_role function';