-- Optimize remaining RLS policies for user_roles, profiles, and companies tables
-- This migration fixes performance issues by replacing auth.<function>() calls with subselects
-- and consolidates multiple permissive policies to prevent re-evaluation for each row

-- Drop existing problematic policies for user_roles table
DROP POLICY IF EXISTS "Users can self-assign default developer role once" ON public.user_roles;
DROP POLICY IF EXISTS "Users can self-assign default organizer role once" ON public.user_roles;
DROP POLICY IF EXISTS "UserRoles: manage only developer" ON public.user_roles;

-- Drop existing problematic policy for profiles table
DROP POLICY IF EXISTS "Profiles: delete only developer" ON public.profiles;

-- Drop existing problematic policy for companies table
DROP POLICY IF EXISTS "Companies: delete only developer" ON public.companies;

-- Create consolidated and optimized policy for user_roles self-assignment
-- This replaces the two separate policies with a single optimized one
CREATE POLICY "Users can self-assign default roles once" 
ON public.user_roles 
FOR INSERT TO anon, authenticated
WITH CHECK (
  (SELECT auth.uid()) = user_id 
  AND role IN ('developer'::app_role, 'organizer'::app_role)
  AND NOT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = (SELECT auth.uid())
  )
);

-- Recreate optimized UserRoles manage policy
CREATE POLICY "UserRoles: manage only developer" ON public.user_roles
FOR ALL TO authenticated
USING ((SELECT public.has_role(auth.uid(), 'developer')))
WITH CHECK ((SELECT public.has_role(auth.uid(), 'developer')));

-- Recreate optimized Profiles delete policy
CREATE POLICY "Profiles: delete only developer" ON public.profiles
FOR DELETE TO authenticated
USING ((SELECT public.has_role(auth.uid(), 'developer')));

-- Recreate optimized Companies delete policy
CREATE POLICY "Companies: delete only developer" ON public.companies
FOR DELETE TO authenticated
USING ((SELECT public.has_role(auth.uid(), 'developer')));

-- Add comments explaining the optimizations
COMMENT ON POLICY "Users can self-assign default roles once" ON public.user_roles IS 
'Consolidated and optimized RLS policy using subselects to prevent re-evaluation of auth functions for each row. Replaces multiple permissive policies with a single efficient one.';

COMMENT ON POLICY "UserRoles: manage only developer" ON public.user_roles IS 
'Optimized RLS policy using subselects to prevent re-evaluation of auth functions for each row';

COMMENT ON POLICY "Profiles: delete only developer" ON public.profiles IS 
'Optimized RLS policy using subselects to prevent re-evaluation of auth functions for each row';

COMMENT ON POLICY "Companies: delete only developer" ON public.companies IS 
'Optimized RLS policy using subselects to prevent re-evaluation of auth functions for each row';

-- Verification block
DO $$
BEGIN
    -- Verify consolidated policy was created successfully
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'user_roles'
        AND policyname = 'Users can self-assign default roles once'
    ) THEN
        RAISE EXCEPTION 'RLS policy optimization failed - consolidated user_roles policy was not created correctly';
    END IF;
    
    RAISE NOTICE 'All remaining RLS policies successfully optimized for better performance and consolidated to eliminate multiple permissive policies';
END
$$;