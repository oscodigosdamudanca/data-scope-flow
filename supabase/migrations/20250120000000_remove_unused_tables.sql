-- Remove unused tables from the database
-- This migration removes tables that were created but are not being used in the application

-- Drop tables in correct order to avoid foreign key constraint issues

-- 1. Drop survey-related tables (not being used - only mock data exists)
DROP TABLE IF EXISTS public.survey_responses CASCADE;
DROP TABLE IF EXISTS public.survey_questions CASCADE;
DROP TABLE IF EXISTS public.surveys CASCADE;

-- 2. Drop raffle-related tables (not being used - only mock data exists)
DROP TABLE IF EXISTS public.raffle_participants CASCADE;
DROP TABLE IF EXISTS public.raffles CASCADE;

-- 3. Drop feedback table (not being used - only mock data exists)
DROP TABLE IF EXISTS public.feedback CASCADE;

-- 4. Drop fair_feedback table (not being used - only mock data exists)
DROP TABLE IF EXISTS public.fair_feedback CASCADE;

-- 5. Drop custom_surveys table (not being used - only mock data exists)
DROP TABLE IF EXISTS public.custom_surveys CASCADE;

-- 6. Drop custom_survey_questions table (not being used - only mock data exists)
DROP TABLE IF EXISTS public.custom_survey_questions CASCADE;

-- 7. Drop system_logs table (not being used - only mock data exists)
DROP TABLE IF EXISTS public.system_logs CASCADE;

-- 8. Drop question_types table (not being used - only mock data exists)
DROP TABLE IF EXISTS public.question_types CASCADE;

-- 9. Drop module_permissions table (not being used - only mock data exists)
DROP TABLE IF EXISTS public.module_permissions CASCADE;

-- 10. Drop interview-related tables (not being used in current application)
DROP TABLE IF EXISTS public.interview_responses CASCADE;
DROP TABLE IF EXISTS public.interview_questions CASCADE;
DROP TABLE IF EXISTS public.interviews CASCADE;
DROP TABLE IF EXISTS public.questions CASCADE;
DROP TABLE IF EXISTS public.candidates CASCADE;

-- Drop related enums that are no longer needed
DROP TYPE IF EXISTS public.question_category CASCADE;
DROP TYPE IF EXISTS public.question_difficulty CASCADE;

-- Note: Keeping app_role enum as is since it has many dependencies
-- The unused roles can be cleaned up later if needed

COMMIT;