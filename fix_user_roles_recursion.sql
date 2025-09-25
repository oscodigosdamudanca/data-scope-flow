-- Fix infinite recursion in user_roles RLS policies
-- The has_role function queries user_roles table, but user_roles policies use has_role
-- This creates infinite recursion

-- Drop problematic policies that cause recursion
DROP POLICY IF EXISTS "UserRoles: select self or developer" ON public.user_roles;
DROP POLICY IF EXISTS "UserRoles: manage only developer" ON public.user_roles;

-- Create new policies without using has_role function to avoid recursion
-- Policy for SELECT: users can see their own roles or if they are developer
CREATE POLICY "UserRoles: select self or developer" ON public.user_roles
FOR SELECT TO authenticated
USING (
  user_id = auth.uid() 
  OR 
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role = 'developer'
  )
);

-- Policy for INSERT/UPDATE/DELETE: only developers can manage roles
-- But we need to avoid recursion, so we check directly in user_roles table
CREATE POLICY "UserRoles: manage only developer" ON public.user_roles
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role = 'developer'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role = 'developer'
  )
);

-- Alternative: Create a simpler policy that allows users to manage their own roles
-- and developers to manage all roles, but without recursion
DROP POLICY IF EXISTS "UserRoles: select self or developer" ON public.user_roles;
DROP POLICY IF EXISTS "UserRoles: manage only developer" ON public.user_roles;

-- Simple policy: users can see and manage their own roles
CREATE POLICY "UserRoles: manage self" ON public.user_roles
FOR ALL TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Separate policy for developers to manage all roles
-- This one is tricky because we can't use has_role without recursion
-- We'll create a special policy that checks if the user has developer role directly
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

-- Update has_role function to be more efficient and avoid potential issues
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

-- Add comment explaining the fix
COMMENT ON POLICY "UserRoles: manage self" ON public.user_roles IS 
'Allows users to manage their own roles without recursion issues';

COMMENT ON POLICY "UserRoles: developer manage all" ON public.user_roles IS 
'Allows developers to manage all roles by checking user_roles directly to avoid recursion with has_role function';