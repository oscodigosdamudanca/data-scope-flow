-- Optimize RLS policies for companies and company_memberships tables
-- This migration fixes performance issues by replacing auth.<function>() calls with subselects
-- to prevent re-evaluation for each row

-- Drop existing policies for companies table
DROP POLICY IF EXISTS "Companies: select member or developer" ON public.companies;
DROP POLICY IF EXISTS "Companies: insert self owner or developer" ON public.companies;
DROP POLICY IF EXISTS "Companies: update admin or developer" ON public.companies;
DROP POLICY IF EXISTS "Companies: delete only developer" ON public.companies;

-- Drop existing policies for company_memberships table
DROP POLICY IF EXISTS "Memberships: select member or developer" ON public.company_memberships;
DROP POLICY IF EXISTS "Memberships: insert admin or developer" ON public.company_memberships;
DROP POLICY IF EXISTS "Memberships: update admin or developer" ON public.company_memberships;
DROP POLICY IF EXISTS "Memberships: delete admin or developer" ON public.company_memberships;

-- Recreate optimized policies for companies table
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

-- Recreate optimized policies for company_memberships table
CREATE POLICY "Memberships: select member or developer" ON public.company_memberships
FOR SELECT TO authenticated
USING (
  (SELECT public.has_role(auth.uid(), 'developer'))
  OR public.is_company_member((SELECT auth.uid()), company_id)
);

CREATE POLICY "Memberships: insert admin or developer" ON public.company_memberships
FOR INSERT TO authenticated
WITH CHECK (
  (SELECT public.has_role(auth.uid(), 'developer'))
  OR public.is_company_admin((SELECT auth.uid()), company_id)
);

CREATE POLICY "Memberships: update admin or developer" ON public.company_memberships
FOR UPDATE TO authenticated
USING (
  (SELECT public.has_role(auth.uid(), 'developer'))
  OR public.is_company_admin((SELECT auth.uid()), company_id)
)
WITH CHECK (
  (SELECT public.has_role(auth.uid(), 'developer'))
  OR public.is_company_admin((SELECT auth.uid()), company_id)
);

CREATE POLICY "Memberships: delete admin or developer" ON public.company_memberships
FOR DELETE TO authenticated
USING (
  (SELECT public.has_role(auth.uid(), 'developer'))
  OR public.is_company_admin((SELECT auth.uid()), company_id)
);

-- Add comments explaining the optimization
COMMENT ON POLICY "Companies: select member or developer" ON public.companies IS 
'Optimized RLS policy using subselects to prevent re-evaluation of auth functions for each row';

COMMENT ON POLICY "Memberships: select member or developer" ON public.company_memberships IS 
'Optimized RLS policy using subselects to prevent re-evaluation of auth functions for each row';

-- Verification block
DO $$
BEGIN
    -- Verify all policies were created successfully
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename IN ('companies', 'company_memberships')
        AND policyname IN (
            'Companies: select member or developer',
            'Companies: insert self owner or developer',
            'Companies: update admin or developer',
            'Companies: delete only developer',
            'Memberships: select member or developer',
            'Memberships: insert admin or developer',
            'Memberships: update admin or developer',
            'Memberships: delete admin or developer'
        )
        GROUP BY schemaname, tablename
        HAVING COUNT(*) = CASE 
            WHEN tablename = 'companies' THEN 4
            WHEN tablename = 'company_memberships' THEN 4
        END
    ) THEN
        RAISE EXCEPTION 'RLS policy optimization failed - not all policies were created correctly';
    END IF;
    
    RAISE NOTICE 'Companies and company_memberships RLS policies successfully optimized for better performance';
END
$$;