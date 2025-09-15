-- Enable leaked password protection in Supabase Auth
-- This migration addresses a security vulnerability by enabling protection against leaked passwords

-- Note: This SQL migration will not directly modify Auth settings as they are managed through the Supabase dashboard
-- This file serves as documentation for the required change

/*
MANUAL ACTION REQUIRED:

To enable leaked password protection in Supabase Auth:
1. Log in to the Supabase dashboard
2. Navigate to Authentication > Settings
3. Under "Security" section, find "Protect against leaked passwords"
4. Toggle the setting to "Enabled"
5. Save changes

This setting helps prevent users from using passwords that have been exposed in data breaches,
enhancing the overall security of user accounts in the application.
*/

-- Add a comment to the database to document this security requirement
COMMENT ON DATABASE postgres IS 'Leaked password protection should be enabled in Supabase Auth settings';