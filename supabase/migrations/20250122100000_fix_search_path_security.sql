-- Fix for the mutable search_path in public.update_updated_at_column function
-- This migration addresses a security vulnerability by setting an explicit search path

-- Drop the existing function if it exists
DROP FUNCTION IF EXISTS public.update_updated_at_column();

-- Recreate the function with explicit schema references and search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    -- Set explicit search_path to public to prevent search_path injection
    -- This ensures that the function always uses objects from the public schema
    SET LOCAL search_path TO 'public';
    
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql
   SECURITY DEFINER -- Using security definer to ensure consistent execution context
   SET search_path = public; -- Explicitly set search_path at function definition

COMMENT ON FUNCTION public.update_updated_at_column() IS 'Trigger function to automatically update the updated_at column with the current timestamp';