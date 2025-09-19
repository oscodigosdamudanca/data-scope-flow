-- Fix Profiles RLS Policy
-- Migration to fix the profile creation issue by updating the RLS policy

-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Profiles: insert self" ON public.profiles;

-- Create a new, more permissive policy for profile insertion
-- This allows authenticated users to create profiles with their own UUID
-- OR developers to create profiles for any user
CREATE POLICY "Profiles: insert self or developer" ON public.profiles
FOR INSERT TO authenticated
WITH CHECK (
  -- User can create profile with their own UUID
  id = (SELECT auth.uid())
  OR
  -- OR developer can create any profile
  (SELECT public.has_role((SELECT auth.uid()), 'developer'))
);

-- Add a comment explaining the policy
COMMENT ON POLICY "Profiles: insert self or developer" ON public.profiles IS 
'Allows authenticated users to create profiles with their own UUID, or developers to create profiles for any user';