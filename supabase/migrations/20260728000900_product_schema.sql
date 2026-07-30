-- Product, administration, and guest-media schema.
-- This migration intentionally runs after the core auth/invitation schema.

CREATE TABLE IF NOT EXISTS public.packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  price NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (price >= 0),
  features JSONB NOT NULL DEFAULT '{}'::jsonb,
  limits JSONB NOT NULL DEFAULT '{}'::jsonb,
  storage JSONB NOT NULL DEFAULT '{}'::jsonb,
  retention JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.packages
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS features JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS limits JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS storage JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS retention JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS public.themes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  theme_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  preview_image_url TEXT,
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.themes
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS preview_image_url TEXT,
  ADD COLUMN IF NOT EXISTS config JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

ALTER TABLE public.invitations
  ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'wedding',
  ADD COLUMN IF NOT EXISTS package_id UUID REFERENCES public.packages(id),
  ADD COLUMN IF NOT EXISTS auto_delete_date DATE,
  ADD COLUMN IF NOT EXISTS storage_used BIGINT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS map_url TEXT,
  ADD COLUMN IF NOT EXISTS music_url TEXT,
  ADD COLUMN IF NOT EXISTS cover_photo TEXT,
  ADD COLUMN IF NOT EXISTS event_program JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS our_story JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS family_info JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS custom_sections JSONB NOT NULL DEFAULT '[]'::jsonb;

CREATE TABLE IF NOT EXISTS public.package_price_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id UUID NOT NULL REFERENCES public.packages(id) ON DELETE CASCADE,
  old_price NUMERIC(10, 2) NOT NULL,
  new_price NUMERIC(10, 2) NOT NULL,
  changed_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  admin_email TEXT,
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id UUID,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  maintenance_mode BOOLEAN NOT NULL DEFAULT false,
  allow_new_registrations BOOLEAN NOT NULL DEFAULT true,
  default_package_id UUID REFERENCES public.packages(id) ON DELETE SET NULL,
  max_upload_size_mb INTEGER NOT NULL DEFAULT 100 CHECK (max_upload_size_mb BETWEEN 1 AND 100),
  support_email TEXT NOT NULL DEFAULT 'support@memorywedding.com',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by TEXT
);

INSERT INTO public.system_settings (maintenance_mode)
SELECT false
WHERE NOT EXISTS (SELECT 1 FROM public.system_settings);

CREATE TABLE IF NOT EXISTS public.guest_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invitation_id UUID NOT NULL REFERENCES public.invitations(id) ON DELETE CASCADE,
  guest_name TEXT,
  note TEXT,
  file_url TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL CHECK (file_type LIKE 'image/%' OR file_type LIKE 'video/%'),
  file_size BIGINT NOT NULL CHECK (file_size > 0),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'hidden')),
  is_favorite BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.guest_uploads
  ADD COLUMN IF NOT EXISTS note TEXT,
  ADD COLUMN IF NOT EXISTS file_path TEXT,
  ADD COLUMN IF NOT EXISTS is_favorite BOOLEAN NOT NULL DEFAULT false;
UPDATE public.guest_uploads
SET file_path = regexp_replace(file_url, '^.*/guest_uploads/', '')
WHERE file_path IS NULL;
ALTER TABLE public.guest_uploads ALTER COLUMN file_path SET NOT NULL;
CREATE INDEX IF NOT EXISTS guest_uploads_invitation_id_idx
  ON public.guest_uploads (invitation_id);

CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invitation_id UUID NOT NULL REFERENCES public.invitations(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.package_price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guest_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Remove the permissive demo policies if they were applied to an existing project.
DROP POLICY IF EXISTS "Public can view user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view price history" ON public.package_price_history;
DROP POLICY IF EXISTS "Admins can insert price history" ON public.package_price_history;
DROP POLICY IF EXISTS "Admins can view audit logs" ON public.admin_audit_logs;
DROP POLICY IF EXISTS "Admins can insert audit logs" ON public.admin_audit_logs;
DROP POLICY IF EXISTS "Public can view system settings" ON public.system_settings;
DROP POLICY IF EXISTS "Admins can update system settings" ON public.system_settings;

DO $$
BEGIN
  IF to_regclass('public.roles') IS NOT NULL THEN
    EXECUTE 'DROP POLICY IF EXISTS "Public can view roles" ON public.roles';
  END IF;
END
$$;

CREATE POLICY packages_public_read ON public.packages FOR SELECT TO anon, authenticated
  USING (is_active AND deleted_at IS NULL);
CREATE POLICY packages_admin_all ON public.packages FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY themes_public_read ON public.themes FOR SELECT TO anon, authenticated
  USING (is_active AND deleted_at IS NULL);
CREATE POLICY themes_admin_all ON public.themes FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY price_history_admin_all ON public.package_price_history FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY audit_logs_admin_all ON public.admin_audit_logs FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY system_settings_public_read ON public.system_settings FOR SELECT TO anon, authenticated
  USING (true);
CREATE POLICY system_settings_admin_write ON public.system_settings FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY guest_uploads_public_read ON public.guest_uploads FOR SELECT TO anon, authenticated
  USING (status = 'active' AND EXISTS (
    SELECT 1 FROM public.invitations i
    WHERE i.id = invitation_id AND i.is_published
  ));
CREATE POLICY guest_uploads_public_insert ON public.guest_uploads FOR INSERT TO anon, authenticated
  WITH CHECK (
    status = 'active'
    AND file_size <= COALESCE((SELECT max_upload_size_mb FROM public.system_settings LIMIT 1), 100) * 1024 * 1024
    AND EXISTS (
      SELECT 1 FROM public.invitations i
      WHERE i.id = invitation_id AND i.is_published
    )
  );
CREATE POLICY guest_uploads_owner_manage ON public.guest_uploads FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.invitations i
    WHERE i.id = invitation_id AND i.user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.invitations i
    WHERE i.id = invitation_id AND i.user_id = auth.uid()
  ));

CREATE POLICY activity_logs_owner_read ON public.activity_logs FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.invitations i
    WHERE i.id = invitation_id AND i.user_id = auth.uid()
  ));

GRANT SELECT ON public.packages, public.themes, public.system_settings TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.packages, public.themes, public.system_settings TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.package_price_history, public.admin_audit_logs TO authenticated;
GRANT SELECT, INSERT ON public.guest_uploads TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.guest_uploads TO authenticated;
GRANT SELECT ON public.activity_logs TO authenticated;
GRANT ALL ON public.packages, public.themes, public.package_price_history,
  public.admin_audit_logs, public.system_settings, public.guest_uploads, public.activity_logs TO service_role;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'guest_uploads',
  'guest_uploads',
  true,
  104857600,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm', 'video/quicktime']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

CREATE POLICY guest_upload_storage_insert ON storage.objects FOR INSERT TO anon, authenticated
  WITH CHECK (
    bucket_id = 'guest_uploads'
    AND EXISTS (
      SELECT 1 FROM public.invitations i
      WHERE i.id::text = (storage.foldername(name))[1] AND i.is_published
    )
  );
CREATE POLICY guest_upload_storage_owner_delete ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'guest_uploads'
    AND EXISTS (
      SELECT 1 FROM public.invitations i
      WHERE i.id::text = (storage.foldername(name))[1] AND i.user_id = auth.uid()
    )
  );

DROP TRIGGER IF EXISTS packages_updated_at ON public.packages;
CREATE TRIGGER packages_updated_at BEFORE UPDATE ON public.packages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
DROP TRIGGER IF EXISTS themes_updated_at ON public.themes;
CREATE TRIGGER themes_updated_at BEFORE UPDATE ON public.themes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
