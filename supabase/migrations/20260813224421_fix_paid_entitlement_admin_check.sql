-- The current role-first helper was created without a fixed search path and
-- referenced user_roles without schema qualification. Harden it so policies
-- and the paid-event entitlement trigger can safely use it.
CREATE OR REPLACE FUNCTION public.has_role(
  _role public.app_role,
  _user_id UUID
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles AS ur
    WHERE ur.user_id = _user_id
      AND ur.role = _role
  );
$$;

REVOKE ALL ON FUNCTION public.has_role(public.app_role, UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(public.app_role, UUID) TO authenticated, service_role;

COMMENT ON FUNCTION public.has_role(public.app_role, UUID) IS
  'Checks an application role using a schema-qualified, fixed-search-path security definer.';
