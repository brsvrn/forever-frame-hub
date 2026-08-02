-- Advanced event features share the existing invitation lifecycle and server-side permission model.
-- All writes remain server-only; public invitation reads are resolved through guarded server functions.

CREATE TABLE IF NOT EXISTS public.event_share_settings (
  invitation_id UUID PRIMARY KEY REFERENCES public.invitations(id) ON DELETE CASCADE,
  share_title TEXT,
  share_description TEXT,
  share_message TEXT,
  cover_image_url TEXT,
  use_theme_image BOOLEAN NOT NULL DEFAULT true,
  version INTEGER NOT NULL DEFAULT 1 CHECK (version > 0),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS public.event_audio_settings (
  invitation_id UUID PRIMARY KEY REFERENCES public.invitations(id) ON DELETE CASCADE,
  is_enabled BOOLEAN NOT NULL DEFAULT false,
  title TEXT,
  description TEXT,
  alternative_text TEXT,
  object_key TEXT,
  mime_type TEXT,
  file_size BIGINT CHECK (file_size IS NULL OR file_size BETWEEN 1 AND 20971520),
  duration_seconds NUMERIC(6,2) CHECK (duration_seconds IS NULL OR duration_seconds BETWEEN 0 AND 30.5),
  version INTEGER NOT NULL DEFAULT 1 CHECK (version > 0),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS public.event_music_settings (
  invitation_id UUID PRIMARY KEY REFERENCES public.invitations(id) ON DELETE CASCADE,
  is_enabled BOOLEAN NOT NULL DEFAULT false,
  source_type TEXT NOT NULL DEFAULT 'none' CHECK (source_type IN ('none', 'library', 'upload', 'legacy')),
  track_id TEXT,
  title TEXT,
  object_key TEXT,
  mime_type TEXT,
  file_size BIGINT CHECK (file_size IS NULL OR file_size BETWEEN 1 AND 31457280),
  volume NUMERIC(4,3) NOT NULL DEFAULT 0.65 CHECK (volume BETWEEN 0 AND 1),
  license_name TEXT,
  license_url TEXT,
  version INTEGER NOT NULL DEFAULT 1 CHECK (version > 0),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS public.event_gift_settings (
  invitation_id UUID PRIMARY KEY REFERENCES public.invitations(id) ON DELETE CASCADE,
  is_enabled BOOLEAN NOT NULL DEFAULT false,
  account_holder TEXT,
  iban TEXT,
  bank_name TEXT,
  description TEXT,
  version INTEGER NOT NULL DEFAULT 1 CHECK (version > 0),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS public.event_guest_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invitation_id UUID NOT NULL REFERENCES public.invitations(id) ON DELETE CASCADE,
  guest_name TEXT NOT NULL,
  guest_phone TEXT,
  guest_email TEXT,
  welcome_message TEXT,
  invited_party_size INTEGER NOT NULL DEFAULT 1 CHECK (invited_party_size BETWEEN 1 AND 50),
  schedule_ids UUID[] NOT NULL DEFAULT '{}',
  token_hash TEXT NOT NULL UNIQUE,
  token_hint TEXT NOT NULL,
  rsvp_status TEXT CHECK (rsvp_status IS NULL OR rsvp_status IN ('yes', 'no', 'maybe')),
  first_opened_at TIMESTAMPTZ,
  last_opened_at TIMESTAMPTZ,
  view_count INTEGER NOT NULL DEFAULT 0 CHECK (view_count >= 0),
  expires_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS event_guest_links_invitation_idx
  ON public.event_guest_links(invitation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS event_guest_links_active_idx
  ON public.event_guest_links(invitation_id, revoked_at, expires_at);

INSERT INTO public.event_share_settings (invitation_id)
SELECT id FROM public.invitations ON CONFLICT (invitation_id) DO NOTHING;
INSERT INTO public.event_audio_settings (invitation_id)
SELECT id FROM public.invitations ON CONFLICT (invitation_id) DO NOTHING;
INSERT INTO public.event_music_settings (invitation_id, is_enabled, source_type, title)
SELECT id, music_url IS NOT NULL, CASE WHEN music_url IS NULL THEN 'none' ELSE 'legacy' END, NULL
FROM public.invitations ON CONFLICT (invitation_id) DO NOTHING;
INSERT INTO public.event_gift_settings (invitation_id)
SELECT id FROM public.invitations ON CONFLICT (invitation_id) DO NOTHING;

CREATE OR REPLACE FUNCTION public.ensure_advanced_event_settings()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.event_share_settings (invitation_id) VALUES (NEW.id) ON CONFLICT DO NOTHING;
  INSERT INTO public.event_audio_settings (invitation_id) VALUES (NEW.id) ON CONFLICT DO NOTHING;
  INSERT INTO public.event_music_settings (invitation_id) VALUES (NEW.id) ON CONFLICT DO NOTHING;
  INSERT INTO public.event_gift_settings (invitation_id) VALUES (NEW.id) ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS invitations_ensure_advanced_settings ON public.invitations;
CREATE TRIGGER invitations_ensure_advanced_settings
AFTER INSERT ON public.invitations
FOR EACH ROW EXECUTE FUNCTION public.ensure_advanced_event_settings();

ALTER TABLE public.event_share_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_audio_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_music_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_gift_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_guest_links ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.event_share_settings, public.event_audio_settings,
  public.event_music_settings, public.event_gift_settings, public.event_guest_links
FROM anon, authenticated;
GRANT ALL ON public.event_share_settings, public.event_audio_settings,
  public.event_music_settings, public.event_gift_settings, public.event_guest_links
TO service_role;

