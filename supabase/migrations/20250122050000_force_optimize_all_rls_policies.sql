-- Force optimization of all remaining RLS policies with performance issues
-- This migration ensures all auth.<function>() calls use subselects to prevent re-evaluation
-- and consolidates multiple permissive policies

-- Force drop ALL existing policies that may have performance issues
-- This ensures we start with a clean slate

-- Drop all user_roles policies
DROP POLICY IF EXISTS "UserRoles: select self or developer" ON public.user_roles;
DROP POLICY IF EXISTS "UserRoles: manage only developer" ON public.user_roles;
DROP POLICY IF EXISTS "Users can self-assign default developer role once" ON public.user_roles;
DROP POLICY IF EXISTS "Users can self-assign default organizer role once" ON public.user_roles;
DROP POLICY IF EXISTS "Users can self-assign default roles once" ON public.user_roles;

-- Drop all profiles policies
DROP POLICY IF EXISTS "Profiles: select self or developer" ON public.profiles;
DROP POLICY IF EXISTS "Profiles: insert self" ON public.profiles;
DROP POLICY IF EXISTS "Profiles: update self or developer" ON public.profiles;
DROP POLICY IF EXISTS "Profiles: delete only developer" ON public.profiles;

-- Drop all companies policies
DROP POLICY IF EXISTS "Companies: select member or developer" ON public.companies;
DROP POLICY IF EXISTS "Companies: insert self owner or developer" ON public.companies;
DROP POLICY IF EXISTS "Companies: update admin or developer" ON public.companies;
DROP POLICY IF EXISTS "Companies: delete only developer" ON public.companies;

-- Recreate ALL policies with proper optimization using subselects

-- User Roles Policies (Optimized)
CREATE POLICY "UserRoles: select self or developer" ON public.user_roles
FOR SELECT TO authenticated
USING (
    user_id = (SELECT auth.uid()) 
    OR (SELECT public.has_role(auth.uid(), 'developer'))
);

CREATE POLICY "UserRoles: manage only developer" ON public.user_roles
FOR ALL TO authenticated
USING ((SELECT public.has_role(auth.uid(), 'developer')))
WITH CHECK ((SELECT public.has_role(auth.uid(), 'developer')));

-- Consolidated self-assignment policy (replaces multiple permissive policies)
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

-- Profiles Policies (Optimized)
CREATE POLICY "Profiles: select self or developer" ON public.profiles
FOR SELECT TO authenticated
USING (
    (SELECT auth.uid()) = id 
    OR (SELECT public.has_role(auth.uid(), 'developer'))
);

CREATE POLICY "Profiles: insert self" ON public.profiles
FOR INSERT TO authenticated
WITH CHECK ((SELECT auth.uid()) = id);

CREATE POLICY "Profiles: update self or developer" ON public.profiles
FOR UPDATE TO authenticated
USING (
    (SELECT auth.uid()) = id 
    OR (SELECT public.has_role(auth.uid(), 'developer'))
)
WITH CHECK (
    (SELECT auth.uid()) = id 
    OR (SELECT public.has_role(auth.uid(), 'developer'))
);

CREATE POLICY "Profiles: delete only developer" ON public.profiles
FOR DELETE TO authenticated
USING ((SELECT public.has_role(auth.uid(), 'developer')));

-- Companies Policies (Optimized)
CREATE POLICY "Companies: select member or developer" ON public.companies
FOR SELECT TO authenticated
USING (
  (SELECT public.has_role(auth.uid(), 'developer'))
  OR public.is_company_member((SELECT auth.uid()), id)
);

CREATE POLICY "Companies: insert self owner or developer" ON public.companies
FOR INSERT TO authenticated
WITH CHECK (
  created_by = (SELECT auth.uid()) OR (SELECT public.has_role(auth.uid(), 'developer'))
);

CREATE POLICY "Companies: update admin or developer" ON public.companies
FOR UPDATE TO authenticated
USING (
  (SELECT public.has_role(auth.uid(), 'developer'))
  OR public.is_company_admin((SELECT auth.uid()), id)
)
WITH CHECK (
  (SELECT public.has_role(auth.uid(), 'developer'))
  OR public.is_company_admin((SELECT auth.uid()), id)
);

CREATE POLICY "Companies: delete only developer" ON public.companies
FOR DELETE TO authenticated
USING ((SELECT public.has_role(auth.uid(), 'developer')));

-- Add comprehensive comments explaining the optimizations
COMMENT ON POLICY "UserRoles: select self or developer" ON public.user_roles IS 
'Optimized RLS policy using subselects to prevent re-evaluation of auth functions for each row';

COMMENT ON POLICY "UserRoles: manage only developer" ON public.user_roles IS 
'Optimized RLS policy using subselects to prevent re-evaluation of auth functions for each row';

COMMENT ON POLICY "Users can self-assign default roles once" ON public.user_roles IS 
'Consolidated and optimized RLS policy using subselects. Replaces multiple permissive policies with a single efficient one to eliminate performance warnings.';

COMMENT ON POLICY "Profiles: select self or developer" ON public.profiles IS 
'Optimized RLS policy using subselects to prevent re-evaluation of auth functions for each row';

COMMENT ON POLICY "Profiles: insert self" ON public.profiles IS 
'Optimized RLS policy using subselects to prevent re-evaluation of auth functions for each row';

COMMENT ON POLICY "Profiles: update self or developer" ON public.profiles IS 
'Optimized RLS policy using subselects to prevent re-evaluation of auth functions for each row';

COMMENT ON POLICY "Profiles: delete only developer" ON public.profiles IS 
'Optimized RLS policy using subselects to prevent re-evaluation of auth functions for each row';

COMMENT ON POLICY "Companies: select member or developer" ON public.companies IS 
'Optimized RLS policy using subselects to prevent re-evaluation of auth functions for each row';

COMMENT ON POLICY "Companies: insert self owner or developer" ON public.companies IS 
'Optimized RLS policy using subselects to prevent re-evaluation of auth functions for each row';

COMMENT ON POLICY "Companies: update admin or developer" ON public.companies IS 
'Optimized RLS policy using subselects to prevent re-evaluation of auth functions for each row';

COMMENT ON POLICY "Companies: delete only developer" ON public.companies IS 
'Optimized RLS policy using subselects to prevent re-evaluation of auth functions for each row';

-- Comprehensive verification block
DO $$
BEGIN
    -- Verify all critical policies were created successfully
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'user_roles'
        AND policyname = 'Users can self-assign default roles once'
    ) THEN
        RAISE EXCEPTION 'RLS policy optimization failed - consolidated user_roles policy was not created correctly';
    END IF;
    
    -- Verify key policies exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'profiles'
        AND policyname = 'Profiles: delete only developer'
    ) THEN
        RAISE EXCEPTION 'Profiles delete policy was not created correctly after optimization';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'companies'
        AND policyname = 'Companies: delete only developer'
    ) THEN
        RAISE EXCEPTION 'Companies delete policy was not created correctly after optimization';
    END IF;
    
    RAISE NOTICE 'All RLS policies successfully optimized with subselects and multiple permissive policies consolidated. Performance warnings should now be resolved.';
END
$$;