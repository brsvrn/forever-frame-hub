-- Grant the platform owner access to the administration panel.
-- Idempotent: safe to run more than once.
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::public.app_role
FROM auth.users
WHERE lower(email) = lower('brsvrn@gmail.com')
  AND NOT EXISTS (
    SELECT 1
    FROM public.user_roles existing_role
    WHERE existing_role.user_id = auth.users.id
      AND existing_role.role = 'admin'::public.app_role
  );
