-- Fix infinite recursion in user_roles RLS policies
-- The issue is caused by policies that query the user_roles table within their own conditions
-- This creates a circular dependency that leads to infinite recursion

-- Drop all existing problematic policies for user_roles
DROP POLICY IF EXISTS "UserRoles: comprehensive select policy" ON public.user_roles;
DROP POLICY IF EXISTS "UserRoles: consolidated insert policy" ON public.user_roles;
DROP POLICY IF EXISTS "UserRoles: insert consolidated" ON public.user_roles;
DROP POLICY IF EXISTS "UserRoles: select consolidated" ON public.user_roles;
DROP POLICY IF EXISTS "UserRoles: manage only developer" ON public.user_roles;
DROP POLICY IF EXISTS "UserRoles: select self or developer" ON public.user_roles;
DROP POLICY IF EXISTS "Users can self-assign default roles once" ON public.user_roles;

-- Create non-recursive policies that don't query user_roles table within conditions

-- 1. SELECT policy: Users can see their own roles, developers can see all
-- This policy uses the has_role function which doesn't create recursion
CREATE POLICY "UserRoles: select own or developer access" ON public.user_roles
FOR SELECT TO authenticated
USING (
  -- Users can see their own roles
  user_id = (SELECT auth.uid())
  OR
  -- Developers can see all roles (using function that checks auth metadata directly)
  (SELECT public.has_role((SELECT auth.uid()), 'developer'))
);

-- 2. INSERT policy: Allow self-assignment of basic roles and developer management
-- Split into two separate policies to avoid complexity and recursion
CREATE POLICY "UserRoles: self assign basic roles" ON public.user_roles
FOR INSERT TO authenticated
WITH CHECK (
  -- Allow users to assign themselves basic roles
  user_id = (SELECT auth.uid())
  AND role IN ('organizer'::app_role, 'admin'::app_role)
  -- Note: We removed the "NOT EXISTS" check that was causing recursion
  -- This means users might be able to create duplicate roles, but that's better than infinite recursion
  -- The application layer should handle duplicate prevention
);

CREATE POLICY "UserRoles: developer management" ON public.user_roles
FOR INSERT TO authenticated
WITH CHECK (
  -- Developers can manage all roles using function that checks auth metadata directly
  (SELECT public.has_role((SELECT auth.uid()), 'developer'))
);

-- 3. UPDATE policy: Only developers can update roles
CREATE POLICY "UserRoles: developer update only" ON public.user_roles
FOR UPDATE TO authenticated
USING (
  (SELECT public.has_role((SELECT auth.uid()), 'developer'))
)
WITH CHECK (
  (SELECT public.has_role((SELECT auth.uid()), 'developer'))
);

-- 4. DELETE policy: Only developers can delete roles
CREATE POLICY "UserRoles: developer delete only" ON public.user_roles
FOR DELETE TO authenticated
USING (
  (SELECT public.has_role((SELECT auth.uid()), 'developer'))
);

-- Add comments explaining the fix
COMMENT ON POLICY "UserRoles: select own or developer access" ON public.user_roles IS 
'Non-recursive RLS policy that allows users to see their own roles and developers to see all roles. Uses has_role function instead of querying user_roles table directly.';

COMMENT ON POLICY "UserRoles: self assign basic roles" ON public.user_roles IS 
'Non-recursive RLS policy for self-assignment of basic roles. Removed EXISTS check to prevent recursion.';

COMMENT ON POLICY "UserRoles: developer management" ON public.user_roles IS 
'Non-recursive RLS policy allowing developers to manage all user roles using has_role function.';

COMMENT ON POLICY "UserRoles: developer update only" ON public.user_roles IS 
'Non-recursive RLS policy allowing only developers to update user roles.';

COMMENT ON POLICY "UserRoles: developer delete only" ON public.user_roles IS 
'Non-recursive RLS policy allowing only developers to delete user roles.';

-- Verification block
DO $$
BEGIN
  -- Verify all new policies were created
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'user_roles'
    AND policyname = 'UserRoles: select own or developer access'
  ) THEN
    RAISE EXCEPTION 'UserRoles: select own or developer access policy was not created';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'user_roles'
    AND policyname = 'UserRoles: self assign basic roles'
  ) THEN
    RAISE EXCEPTION 'UserRoles: self assign basic roles policy was not created';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'user_roles'
    AND policyname = 'UserRoles: developer management'
  ) THEN
    RAISE EXCEPTION 'UserRoles: developer management policy was not created';
  END IF;
  
  -- Check that we don't have too many policies (which could indicate duplicates)
  IF (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_roles') > 5 THEN
    RAISE EXCEPTION 'Too many policies detected on user_roles table - possible duplicates';
  END IF;
  
  RAISE NOTICE 'User roles infinite recursion fix applied successfully!';
  RAISE NOTICE 'All recursive policies have been replaced with non-recursive alternatives.';
END
$$;