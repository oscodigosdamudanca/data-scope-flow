-- Migration to fix company_role enum issues
-- This migration ensures data consistency and fixes any 'owner' references

-- 1. First, let's check if there are any invalid enum values and fix them
DO $$
DECLARE
    rows_affected integer;
BEGIN
    -- Update any existing 'owner' values to 'admin' in company_memberships
    UPDATE public.company_memberships 
    SET role = 'admin'::public.company_role
    WHERE role::text = 'owner';
    
    -- Get the number of rows affected
    GET DIAGNOSTICS rows_affected = ROW_COUNT;
    
    -- Log the number of rows affected
    RAISE NOTICE 'Fixed % rows with invalid owner role', rows_affected;
END $$;

-- 2. Create a function to validate company_role enum values
CREATE OR REPLACE FUNCTION public.validate_company_role(role_value text)
RETURNS public.company_role
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
    -- Convert 'owner' to 'admin' for backward compatibility
    IF role_value = 'owner' THEN
        RETURN 'admin'::public.company_role;
    END IF;
    
    -- Validate that the role exists in the enum
    IF role_value NOT IN ('admin', 'interviewer') THEN
        RAISE EXCEPTION 'Invalid company role: %. Valid values are: admin, interviewer', role_value;
    END IF;
    
    RETURN role_value::public.company_role;
END;
$$;

-- 3. Create a trigger to automatically fix invalid enum values on insert/update
CREATE OR REPLACE FUNCTION public.fix_company_role_on_change()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- Auto-fix 'owner' to 'admin' on insert/update
    IF NEW.role::text = 'owner' THEN
        NEW.role = 'admin'::public.company_role;
        RAISE NOTICE 'Automatically converted owner role to admin for user %', NEW.user_id;
    END IF;
    
    RETURN NEW;
END;
$$;

-- 4. Apply the trigger to company_memberships table
DROP TRIGGER IF EXISTS trg_fix_company_role ON public.company_memberships;
CREATE TRIGGER trg_fix_company_role
    BEFORE INSERT OR UPDATE OF role ON public.company_memberships
    FOR EACH ROW
    EXECUTE FUNCTION public.fix_company_role_on_change();

-- 5. Create a view for safe company membership queries
CREATE OR REPLACE VIEW public.company_memberships_safe AS
SELECT 
    cm.id,
    cm.company_id,
    cm.user_id,
    cm.role,
    CASE 
        WHEN cm.role = 'admin' THEN 'Administrador'
        WHEN cm.role = 'interviewer' THEN 'Entrevistador'
        ELSE 'Desconhecido'
    END as role_display,
    cm.added_by,
    cm.created_at,
    c.name as company_name,
    p.display_name as user_name
FROM public.company_memberships cm
JOIN public.companies c ON c.id = cm.company_id
JOIN public.profiles p ON p.id = cm.user_id;

-- 6. Create helper functions for role checking with proper enum handling
CREATE OR REPLACE FUNCTION public.is_company_admin_safe(_user_id uuid, _company_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.company_memberships
        WHERE user_id = _user_id
          AND company_id = _company_id
          AND role = 'admin'::public.company_role
    );
$$;

CREATE OR REPLACE FUNCTION public.is_company_interviewer_safe(_user_id uuid, _company_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.company_memberships
        WHERE user_id = _user_id
          AND company_id = _company_id
          AND role = 'interviewer'::public.company_role
    );
$$;

-- 7. Create a function to safely add company memberships
CREATE OR REPLACE FUNCTION public.add_company_membership(
    _company_id uuid,
    _user_id uuid,
    _role text,
    _added_by uuid DEFAULT auth.uid()
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    _membership_id uuid;
    _validated_role public.company_role;
BEGIN
    -- Validate and convert role
    _validated_role := public.validate_company_role(_role);
    
    -- Insert the membership
    INSERT INTO public.company_memberships (company_id, user_id, role, added_by)
    VALUES (_company_id, _user_id, _validated_role, _added_by)
    ON CONFLICT (company_id, user_id) 
    DO UPDATE SET 
        role = _validated_role,
        added_by = _added_by
    RETURNING id INTO _membership_id;
    
    RETURN _membership_id;
END;
$$;

-- 8. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON public.company_memberships_safe TO authenticated;
GRANT EXECUTE ON FUNCTION public.validate_company_role(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_company_admin_safe(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_company_interviewer_safe(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.add_company_membership(uuid, uuid, text, uuid) TO authenticated;

-- 9. Add comments for documentation
COMMENT ON FUNCTION public.validate_company_role(text) IS 'Validates and converts company role values, automatically converting owner to admin';
COMMENT ON FUNCTION public.add_company_membership(uuid, uuid, text, uuid) IS 'Safely adds company membership with role validation';
COMMENT ON VIEW public.company_memberships_safe IS 'Safe view for company memberships with display names';
COMMENT ON TRIGGER trg_fix_company_role ON public.company_memberships IS 'Automatically fixes invalid company role values on insert/update';

-- 10. Final validation query to ensure everything is working
DO $$
DECLARE
    invalid_count integer;
BEGIN
    -- Check for any remaining invalid enum values
    SELECT COUNT(*) INTO invalid_count
    FROM public.company_memberships
    WHERE role::text NOT IN ('admin', 'interviewer');
    
    IF invalid_count > 0 THEN
        RAISE EXCEPTION 'Still found % invalid company role values after migration', invalid_count;
    ELSE
        RAISE NOTICE 'Migration completed successfully. All company roles are valid.';
    END IF;
END $$;