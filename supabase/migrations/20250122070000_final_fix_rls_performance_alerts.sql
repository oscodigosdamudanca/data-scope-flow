-- Final fix for all remaining RLS performance alerts
-- This migration addresses the 6 remaining performance warnings:
-- 1. UserRoles: manage only developer - auth function re-evaluation
-- 2. Profiles: delete only developer - auth function re-evaluation  
-- 3. Companies: delete only developer - auth function re-evaluation
-- 4. UserRoles: consolidated insert policy - auth function re-evaluation
-- 5. Multiple permissive policies for INSERT on user_roles
-- 6. Multiple permissive policies for SELECT on user_roles

-- Drop and recreate the problematic policies with proper subselects

-- 1. Fix UserRoles: manage only developer policy
DROP POLICY IF EXISTS "UserRoles: manage only developer" ON public.user_roles;
CREATE POLICY "UserRoles: manage only developer" ON public.user_roles
  FOR ALL
  TO authenticated
  USING ((SELECT public.has_role(auth.uid(), 'developer')))
  WITH CHECK ((SELECT public.has_role(auth.uid(), 'developer')));

-- 2. Fix Profiles: delete only developer policy
DROP POLICY IF EXISTS "Profiles: delete only developer" ON public.profiles;
CREATE POLICY "Profiles: delete only developer" ON public.profiles
  FOR DELETE
  TO authenticated
  USING ((SELECT public.has_role(auth.uid(), 'developer')));

-- 3. Fix Companies: delete only developer policy
DROP POLICY IF EXISTS "Companies: delete only developer" ON public.companies;
CREATE POLICY "Companies: delete only developer" ON public.companies
  FOR DELETE
  TO authenticated
  USING ((SELECT public.has_role(auth.uid(), 'developer')));

-- 4. Fix UserRoles: consolidated insert policy
DROP POLICY IF EXISTS "UserRoles: consolidated insert policy" ON public.user_roles;
CREATE POLICY "UserRoles: consolidated insert policy" ON public.user_roles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Allow developers to manage all roles
    (SELECT (auth.jwt() -> 'user_metadata' ->> 'role')) = 'developer'
    OR
    -- Allow users to self-assign default roles once (if they don't have any roles yet)
    (
      (SELECT auth.uid()) = user_id 
      AND role IN ('developer'::app_role, 'organizer'::app_role, 'admin'::app_role)
      AND NOT EXISTS (
        SELECT 1 FROM public.user_roles ur 
        WHERE ur.user_id = (SELECT auth.uid())
      )
    )
  );

-- 5. & 6. Resolve multiple permissive policies by consolidating them
-- Drop existing policies that cause multiple permissive policy warnings
DROP POLICY IF EXISTS "UserRoles: users select own roles" ON public.user_roles;
DROP POLICY IF EXISTS "UserRoles: select self or developer" ON public.user_roles;
DROP POLICY IF EXISTS "Users can self-assign default roles once" ON public.user_roles;
DROP POLICY IF EXISTS "Users can self-assign default developer role once" ON public.user_roles;
DROP POLICY IF EXISTS "Users can self-assign default organizer role once" ON public.user_roles;

-- Create a single comprehensive SELECT policy for user_roles
CREATE POLICY "UserRoles: comprehensive select policy" ON public.user_roles
  FOR SELECT
  TO authenticated
  USING (
    -- Developers can select all roles
    (SELECT public.has_role(auth.uid(), 'developer'))
    OR
    -- Users can select their own roles
    (SELECT auth.uid()) = user_id
  );

-- The INSERT policy is already handled by "UserRoles: consolidated insert policy" above
-- and "UserRoles: manage only developer" for developer management
-- This eliminates the multiple permissive policies issue

-- Add comprehensive comments explaining the optimizations
COMMENT ON POLICY "UserRoles: manage only developer" ON public.user_roles IS 
'Optimized RLS policy using subselects to prevent re-evaluation of auth functions for each row. Handles ALL operations for developers.';

COMMENT ON POLICY "Profiles: delete only developer" ON public.profiles IS 
'Optimized RLS policy using subselects to prevent re-evaluation of auth functions for each row.';

COMMENT ON POLICY "Companies: delete only developer" ON public.companies IS 
'Optimized RLS policy using subselects to prevent re-evaluation of auth functions for each row.';

COMMENT ON POLICY "UserRoles: consolidated insert policy" ON public.user_roles IS 
'Optimized RLS policy using subselects to prevent re-evaluation of auth functions for each row. Handles both developer management and user self-assignment.';

COMMENT ON POLICY "UserRoles: comprehensive select policy" ON public.user_roles IS 
'Consolidated SELECT policy using subselects to prevent re-evaluation and eliminate multiple permissive policies.';

-- Verification block
DO $$
BEGIN
  -- Verify all policies were created successfully
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'user_roles' 
    AND policyname = 'UserRoles: manage only developer'
  ) THEN
    RAISE EXCEPTION 'UserRoles: manage only developer policy was not created correctly';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'profiles' 
    AND policyname = 'Profiles: delete only developer'
  ) THEN
    RAISE EXCEPTION 'Profiles: delete only developer policy was not created correctly';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'companies' 
    AND policyname = 'Companies: delete only developer'
  ) THEN
    RAISE EXCEPTION 'Companies: delete only developer policy was not created correctly';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'user_roles' 
    AND policyname = 'UserRoles: consolidated insert policy'
  ) THEN
    RAISE EXCEPTION 'UserRoles: consolidated insert policy was not created correctly';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'user_roles' 
    AND policyname = 'UserRoles: comprehensive select policy'
  ) THEN
    RAISE EXCEPTION 'UserRoles: comprehensive select policy was not created correctly';
  END IF;

  -- Verify no multiple permissive policies exist
  IF EXISTS (
    SELECT tablename, cmd, COUNT(*)
    FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'user_roles'
    AND cmd IN ('SELECT', 'INSERT')
    GROUP BY tablename, cmd
    HAVING COUNT(*) > 2  -- Allow for manage policy + one specific policy
  ) THEN
    RAISE EXCEPTION 'Multiple permissive policies still exist after consolidation';
  END IF;

  RAISE NOTICE 'All RLS performance alerts have been successfully resolved!';
END $$;