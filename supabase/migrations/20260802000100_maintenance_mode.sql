-- Extend the existing singleton system_settings row for the production maintenance gate.
-- Enabling or disabling maintenance never runs a migration; it only updates this row.
ALTER TABLE public.system_settings
  ADD COLUMN IF NOT EXISTS maintenance_title TEXT,
  ADD COLUMN IF NOT EXISTS maintenance_message TEXT,
  ADD COLUMN IF NOT EXISTS maintenance_started_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS maintenance_updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS maintenance_updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS estimated_return_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS allow_admin_access BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS maintenance_contact_email TEXT,
  ADD COLUMN IF NOT EXISTS maintenance_whatsapp_url TEXT,
  ADD COLUMN IF NOT EXISTS maintenance_instagram_url TEXT,
  ADD COLUMN IF NOT EXISTS show_whatsapp BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS show_instagram BOOLEAN NOT NULL DEFAULT false;

UPDATE public.system_settings
SET
  maintenance_title = COALESCE(maintenance_title, 'MemoryWedding kısa bir bakımda'),
  maintenance_message = COALESCE(
    maintenance_message,
    'Size daha iyi bir deneyim sunabilmek için sistemimizde planlı geliştirmeler yapıyoruz. Kısa süre içinde yeniden hizmetinizde olacağız.'
  ),
  maintenance_contact_email = COALESCE(maintenance_contact_email, support_email),
  maintenance_updated_at = COALESCE(maintenance_updated_at, updated_at, now());

