-- Fix RLS Performance Alerts
-- This migration addresses the specific performance warnings identified by the linter

-- 1. Fix auth function re-evaluation in UserRoles: manage only developer policy
DROP POLICY IF EXISTS "UserRoles: manage only developer" ON public.user_roles;
CREATE POLICY "UserRoles: manage only developer" ON public.user_roles
  FOR ALL
  TO authenticated
  USING (
    (SELECT (auth.jwt() -> 'user_metadata' ->> 'role')) = 'developer'
  )
  WITH CHECK (
    (SELECT (auth.jwt() -> 'user_metadata' ->> 'role')) = 'developer'
  );

-- 2. Fix auth function re-evaluation in Profiles: delete only developer policy
DROP POLICY IF EXISTS "Profiles: delete only developer" ON public.profiles;
CREATE POLICY "Profiles: delete only developer" ON public.profiles
  FOR DELETE
  TO authenticated
  USING (
    (SELECT (auth.jwt() -> 'user_metadata' ->> 'role')) = 'developer'
  );

-- 3. Fix auth function re-evaluation in Companies: delete only developer policy
DROP POLICY IF EXISTS "Companies: delete only developer" ON public.companies;
CREATE POLICY "Companies: delete only developer" ON public.companies
  FOR DELETE
  TO authenticated
  USING (
    (SELECT (auth.jwt() -> 'user_metadata' ->> 'role')) = 'developer'
  );

-- 4. Consolidate multiple permissive policies for INSERT on user_roles
-- Drop existing policies that cause multiple permissive policy warning
DROP POLICY IF EXISTS "Users can self-assign default roles once" ON public.user_roles;

-- Create consolidated INSERT policy that combines both conditions
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

-- 5. Consolidate multiple permissive policies for SELECT on user_roles
-- Drop existing SELECT policies that cause multiple permissive policy warning
DROP POLICY IF EXISTS "UserRoles: select self or developer" ON public.user_roles;

-- The "UserRoles: manage only developer" policy already handles SELECT for developers
-- Create a separate policy for users to select their own roles
CREATE POLICY "UserRoles: users select own roles" ON public.user_roles
  FOR SELECT
  TO authenticated
  USING (
    -- Users can select their own roles
    (SELECT auth.uid()) = user_id
    -- Developers can select all roles (handled by the manage policy above)
  );

-- Verification queries to ensure policies are correctly applied
DO $$
BEGIN
  -- Verify UserRoles policies
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
    AND tablename = 'user_roles' 
    AND policyname = 'UserRoles: consolidated insert policy'
  ) THEN
    RAISE EXCEPTION 'UserRoles: consolidated insert policy was not created correctly';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'user_roles' 
    AND policyname = 'UserRoles: users select own roles'
  ) THEN
    RAISE EXCEPTION 'UserRoles: users select own roles policy was not created correctly';
  END IF;

  -- Verify Profiles policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'profiles' 
    AND policyname = 'Profiles: delete only developer'
  ) THEN
    RAISE EXCEPTION 'Profiles: delete only developer policy was not created correctly';
  END IF;

  -- Verify Companies policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'companies' 
    AND policyname = 'Companies: delete only developer'
  ) THEN
    RAISE EXCEPTION 'Companies: delete only developer policy was not created correctly';
  END IF;

  RAISE NOTICE 'All RLS performance optimizations applied successfully!';
END $$;