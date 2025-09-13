-- Fix RLS Performance Alerts
-- This migration resolves all 6 performance alerts by:
-- 1-4: Replacing auth.<function>() with subselects in 4 policies
-- 5-6: Consolidating multiple permissive policies in user_roles table

-- 1. Consolidate user_roles policies (remove duplicate permissive policies)
-- Drop existing policies first
DROP POLICY IF EXISTS "UserRoles: select self or developer" ON public.user_roles;
DROP POLICY IF EXISTS "UserRoles: manage only developer" ON public.user_roles;

-- Create consolidated policies
CREATE POLICY "UserRoles: select consolidated" ON public.user_roles
FOR SELECT TO authenticated
USING (
  user_id = (SELECT auth.uid()) 
  OR EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = (SELECT auth.uid()) 
    AND ur.role = 'developer'
  )
);

CREATE POLICY "UserRoles: insert consolidated" ON public.user_roles
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = (SELECT auth.uid()) 
    AND ur.role = 'developer'
  )
);

-- 2. Fix profiles policies (replace auth functions with subselects)
DROP POLICY IF EXISTS "Profiles: select self or developer" ON public.profiles;
CREATE POLICY "Profiles: select self or developer" ON public.profiles
FOR SELECT TO authenticated
USING (
  id = (SELECT auth.uid()) 
  OR EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = (SELECT auth.uid()) 
    AND ur.role = 'developer'
  )
);

DROP POLICY IF EXISTS "Profiles: update self or developer" ON public.profiles;
CREATE POLICY "Profiles: update self or developer" ON public.profiles
FOR UPDATE TO authenticated
USING (
  id = (SELECT auth.uid()) 
  OR EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = (SELECT auth.uid()) 
    AND ur.role = 'developer'
  )
)
WITH CHECK (
  id = (SELECT auth.uid()) 
  OR EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = (SELECT auth.uid()) 
    AND ur.role = 'developer'
  )
);

-- 3. Fix companies policies (replace auth functions with subselects)
DROP POLICY IF EXISTS "Companies: select member or developer" ON public.companies;
CREATE POLICY "Companies: select member or developer" ON public.companies
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = (SELECT auth.uid()) 
    AND ur.role = 'developer'
  )
  OR EXISTS (
    SELECT 1 FROM public.company_memberships cm 
    WHERE cm.user_id = (SELECT auth.uid()) 
    AND cm.company_id = id
  )
);

DROP POLICY IF EXISTS "Companies: update admin or developer" ON public.companies;
CREATE POLICY "Companies: update admin or developer" ON public.companies
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = (SELECT auth.uid()) 
    AND ur.role = 'developer'
  )
  OR EXISTS (
    SELECT 1 FROM public.company_memberships cm 
    WHERE cm.user_id = (SELECT auth.uid()) 
    AND cm.company_id = id
    AND cm.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = (SELECT auth.uid()) 
    AND ur.role = 'developer'
  )
  OR EXISTS (
    SELECT 1 FROM public.company_memberships cm 
    WHERE cm.user_id = (SELECT auth.uid()) 
    AND cm.company_id = id
    AND cm.role = 'admin'
  )
);

-- Verification: Check if all policies were applied correctly
-- This query will show the current state of policies
-- SELECT 
--   schemaname,
--   tablename,
--   policyname,
--   permissive,
--   roles,
--   cmd,
--   qual,
--   with_check
-- FROM pg_policies 
-- WHERE schemaname = 'public' 
--   AND tablename IN ('user_roles', 'profiles', 'companies')
-- ORDER BY tablename, policyname;

-- Final comment: All RLS performance alerts should now be resolved
-- 1. Replaced auth.uid() and auth.role() with subselects in 4 policies
-- 2. Consolidated duplicate permissive policies in user_roles table
-- 3. Maintained security while improving performance