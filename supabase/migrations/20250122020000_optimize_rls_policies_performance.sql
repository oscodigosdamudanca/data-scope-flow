-- Optimize RLS policies performance by using subselects to avoid re-evaluation
-- This fixes the auth_rls_initplan warnings for better query performance at scale

-- Drop existing policies that need optimization
DROP POLICY IF EXISTS "UserRoles: select self or developer" ON public.user_roles;
DROP POLICY IF EXISTS "UserRoles: manage only developer" ON public.user_roles;
DROP POLICY IF EXISTS "Profiles: select self or developer" ON public.profiles;
DROP POLICY IF EXISTS "Profiles: insert self" ON public.profiles;
DROP POLICY IF EXISTS "Profiles: update self or developer" ON public.profiles;
DROP POLICY IF EXISTS "Profiles: delete only developer" ON public.profiles;

-- Recreate optimized policies for user_roles table
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

-- Recreate optimized policies for profiles table
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

-- Add comment explaining the optimization
COMMENT ON POLICY "UserRoles: select self or developer" ON public.user_roles IS 
'Optimized RLS policy using subselects to prevent re-evaluation of auth functions for each row';

COMMENT ON POLICY "UserRoles: manage only developer" ON public.user_roles IS 
'Optimized RLS policy using subselects to prevent re-evaluation of auth functions for each row';

COMMENT ON POLICY "Profiles: select self or developer" ON public.profiles IS 
'Optimized RLS policy using subselects to prevent re-evaluation of auth functions for each row';

COMMENT ON POLICY "Profiles: insert self" ON public.profiles IS 
'Optimized RLS policy using subselects to prevent re-evaluation of auth functions for each row';

COMMENT ON POLICY "Profiles: update self or developer" ON public.profiles IS 
'Optimized RLS policy using subselects to prevent re-evaluation of auth functions for each row';

COMMENT ON POLICY "Profiles: delete only developer" ON public.profiles IS 
'Optimized RLS policy using subselects to prevent re-evaluation of auth functions for each row';

-- Verification block
DO $$
BEGIN
    -- Verify all policies were created successfully
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename IN ('user_roles', 'profiles')
        AND policyname IN (
            'UserRoles: select self or developer',
            'UserRoles: manage only developer',
            'Profiles: select self or developer',
            'Profiles: insert self',
            'Profiles: update self or developer',
            'Profiles: delete only developer'
        )
        GROUP BY schemaname, tablename
        HAVING COUNT(*) = CASE 
            WHEN tablename = 'user_roles' THEN 2
            WHEN tablename = 'profiles' THEN 4
        END
    ) THEN
        RAISE EXCEPTION 'RLS policy optimization failed - not all policies were created correctly';
    END IF;
    
    RAISE NOTICE 'RLS policies successfully optimized for better performance';
END
$$;