-- Fix function search_path security issues
-- This migration addresses the "Function Search Path Mutable" warnings
-- by setting search_path = '' to force fully qualified references

-- 1. Fix validate_company_role function
-- Remove mutable search_path by setting it to empty string
CREATE OR REPLACE FUNCTION public.validate_company_role(role_value text)
RETURNS public.company_role
LANGUAGE plpgsql
IMMUTABLE
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    -- Convert 'owner' to 'admin' for backward compatibility
    IF role_value = 'owner' THEN
        RETURN 'admin'::public.company_role;
    END IF;
    
    -- Validate that the role exists in the enum
    -- Note: With search_path = '', we must use fully qualified references
    IF role_value NOT IN ('admin', 'interviewer') THEN
        RAISE EXCEPTION 'Invalid company role: %. Valid values are: admin, interviewer', role_value;
    END IF;
    
    RETURN role_value::public.company_role;
END;
$$;

-- 2. Fix fix_company_role_on_change function
-- Remove mutable search_path by setting it to empty string
CREATE OR REPLACE FUNCTION public.fix_company_role_on_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    -- Auto-fix 'owner' to 'admin' on insert/update
    -- Note: With search_path = '', we must use fully qualified references
    IF NEW.role::text = 'owner' THEN
        NEW.role = 'admin'::public.company_role;
        -- Use RAISE NOTICE with fully qualified function if needed
        RAISE NOTICE 'Automatically converted owner role to admin for user %', NEW.user_id;
    END IF;
    
    RETURN NEW;
END;
$$;

-- Add documentation comments
COMMENT ON FUNCTION public.validate_company_role(text) IS 
'Validates and converts company role values with secure search_path = '''' to prevent search path injection attacks';

COMMENT ON FUNCTION public.fix_company_role_on_change() IS 
'Trigger function to fix invalid company role values with secure search_path = '''' to prevent search path injection attacks';

-- Verification and logging
DO $$
BEGIN
    RAISE NOTICE '✓ Fixed search_path for validate_company_role function';
    RAISE NOTICE '✓ Fixed search_path for fix_company_role_on_change function';
    RAISE NOTICE '✓ Both functions now use search_path = '''' for enhanced security';
    RAISE NOTICE '✓ This should resolve the function_search_path_mutable warnings';
END $$;

-- Note: The functions will continue to work as before, but now with enhanced security
-- All object references within the functions are implicitly qualified with public schema
-- or use explicit schema qualification where needed