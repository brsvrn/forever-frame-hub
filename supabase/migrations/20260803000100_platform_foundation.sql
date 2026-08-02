-- MemoryWedding platform foundation.
-- This migration is additive: legacy invitation columns and public URLs remain valid.

DO $$
BEGIN
  CREATE TYPE public.event_member_role AS ENUM (
    'owner',
    'co_manager',
    'content_manager',
    'gallery_manager',
    'viewer'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$$;

DO $$
BEGIN
  CREATE TYPE public.event_lifecycle_status AS ENUM (
    'draft',
    'ready',
    'published',
    'expired',
    'archived'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$$;

ALTER TABLE public.invitations
  ADD COLUMN IF NOT EXISTS lifecycle_status public.event_lifecycle_status NOT NULL DEFAULT 'draft',
  ADD COLUMN IF NOT EXISTS schema_version INTEGER NOT NULL DEFAULT 1 CHECK (schema_version > 0),
  ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 1 CHECK (version > 0),
  ADD COLUMN IF NOT EXISTS primary_schedule_id UUID;

ALTER TABLE public.transactions
  ADD COLUMN IF NOT EXISTS idempotency_key UUID;

CREATE UNIQUE INDEX IF NOT EXISTS transactions_idempotency_key_idx
  ON public.transactions (idempotency_key)
  WHERE idempotency_key IS NOT NULL;

UPDATE public.invitations
SET lifecycle_status = CASE
  WHEN is_published THEN 'published'::public.event_lifecycle_status
  ELSE 'draft'::public.event_lifecycle_status
END
WHERE lifecycle_status = 'draft';

CREATE TABLE IF NOT EXISTS public.event_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invitation_id UUID NOT NULL REFERENCES public.invitations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.event_member_role NOT NULL,
  extra_permissions JSONB NOT NULL DEFAULT '{}'::jsonb,
  invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (invitation_id, user_id)
);

CREATE INDEX IF NOT EXISTS event_members_user_id_idx
  ON public.event_members (user_id, invitation_id);

CREATE UNIQUE INDEX IF NOT EXISTS event_members_single_owner_idx
  ON public.event_members (invitation_id)
  WHERE role = 'owner';

CREATE TABLE IF NOT EXISTS public.event_member_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invitation_id UUID NOT NULL REFERENCES public.invitations(id) ON DELETE CASCADE,
  invited_email TEXT NOT NULL,
  invited_name TEXT,
  role public.event_member_role NOT NULL CHECK (role <> 'owner'),
  extra_permissions JSONB NOT NULL DEFAULT '{}'::jsonb,
  message TEXT CHECK (char_length(message) <= 1000),
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  accepted_at TIMESTAMPTZ,
  accepted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  revoked_at TIMESTAMPTZ,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (expires_at > created_at)
);

CREATE INDEX IF NOT EXISTS event_member_invitations_event_idx
  ON public.event_member_invitations (invitation_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.event_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invitation_id UUID NOT NULL REFERENCES public.invitations(id) ON DELETE CASCADE,
  actor_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL CHECK (char_length(action) BETWEEN 1 AND 120),
  target_type TEXT NOT NULL CHECK (char_length(target_type) BETWEEN 1 AND 80),
  target_id UUID,
  changed_fields JSONB NOT NULL DEFAULT '[]'::jsonb,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS event_activity_logs_event_created_idx
  ON public.event_activity_logs (invitation_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.event_builder_progress (
  invitation_id UUID PRIMARY KEY REFERENCES public.invitations(id) ON DELETE CASCADE,
  current_step TEXT NOT NULL DEFAULT 'package-event',
  completed_steps TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  missing_fields JSONB NOT NULL DEFAULT '[]'::jsonb,
  draft_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  progress_percent SMALLINT NOT NULL DEFAULT 0 CHECK (progress_percent BETWEEN 0 AND 100),
  version BIGINT NOT NULL DEFAULT 1 CHECK (version > 0),
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.event_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invitation_id UUID NOT NULL REFERENCES public.invitations(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL DEFAULT 'other',
  title TEXT NOT NULL DEFAULT '',
  event_date DATE,
  starts_at TIME,
  ends_at TIME,
  venue_name TEXT NOT NULL DEFAULT '',
  address TEXT NOT NULL DEFAULT '',
  google_maps_url TEXT,
  apple_maps_url TEXT,
  yandex_maps_url TEXT,
  description TEXT,
  dress_code TEXT,
  parking_info TEXT,
  valet_info TEXT,
  transport_info TEXT,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (ends_at IS NULL OR starts_at IS NULL OR ends_at >= starts_at)
);

CREATE INDEX IF NOT EXISTS event_schedules_event_sort_idx
  ON public.event_schedules (invitation_id, sort_order, created_at);

CREATE UNIQUE INDEX IF NOT EXISTS event_schedules_single_primary_idx
  ON public.event_schedules (invitation_id)
  WHERE is_primary;

ALTER TABLE public.invitations
  DROP CONSTRAINT IF EXISTS invitations_primary_schedule_id_fkey;
ALTER TABLE public.invitations
  ADD CONSTRAINT invitations_primary_schedule_id_fkey
  FOREIGN KEY (primary_schedule_id) REFERENCES public.event_schedules(id) ON DELETE SET NULL;

INSERT INTO public.event_members (invitation_id, user_id, role)
SELECT id, user_id, 'owner'::public.event_member_role
FROM public.invitations
ON CONFLICT (invitation_id, user_id) DO NOTHING;

INSERT INTO public.event_builder_progress (invitation_id, current_step, progress_percent)
SELECT id, 'package-event', CASE WHEN is_published THEN 100 ELSE 0 END
FROM public.invitations
ON CONFLICT (invitation_id) DO NOTHING;

INSERT INTO public.event_schedules (
  invitation_id,
  event_type,
  title,
  event_date,
  starts_at,
  venue_name,
  address,
  google_maps_url,
  is_primary,
  sort_order
)
SELECT
  i.id,
  i.event_type::text,
  i.headline,
  i.event_date,
  CASE
    WHEN i.event_time ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$' THEN i.event_time::time
    ELSE NULL
  END,
  i.venue,
  concat_ws(', ', nullif(i.address, ''), nullif(i.city, '')),
  i.map_url,
  true,
  0
FROM public.invitations i
WHERE NOT EXISTS (
  SELECT 1 FROM public.event_schedules s WHERE s.invitation_id = i.id
);

UPDATE public.invitations i
SET primary_schedule_id = s.id
FROM public.event_schedules s
WHERE s.invitation_id = i.id
  AND s.is_primary
  AND i.primary_schedule_id IS NULL;

CREATE OR REPLACE FUNCTION public.is_event_member(_invitation_id UUID, _user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.invitations i
    WHERE i.id = _invitation_id AND i.user_id = _user_id
  ) OR EXISTS (
    SELECT 1
    FROM public.event_members em
    WHERE em.invitation_id = _invitation_id AND em.user_id = _user_id
  );
$$;

CREATE OR REPLACE FUNCTION public.has_event_permission(
  _invitation_id UUID,
  _user_id UUID,
  _permission TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  member_role public.event_member_role;
  extra JSONB;
BEGIN
  SELECT em.role, em.extra_permissions
  INTO member_role, extra
  FROM public.event_members em
  WHERE em.invitation_id = _invitation_id AND em.user_id = _user_id;

  IF member_role IS NULL AND EXISTS (
    SELECT 1 FROM public.invitations i
    WHERE i.id = _invitation_id AND i.user_id = _user_id
  ) THEN
    member_role := 'owner';
  END IF;

  IF member_role = 'owner' THEN RETURN true; END IF;
  IF COALESCE(extra -> _permission, 'false'::jsonb) = 'true'::jsonb THEN RETURN true; END IF;

  RETURN CASE member_role
    WHEN 'co_manager' THEN _permission = ANY (ARRAY[
      'view_event', 'edit_content', 'edit_schedule', 'edit_theme', 'view_rsvp',
      'edit_rsvp', 'manage_gallery', 'download_media', 'edit_audio', 'edit_share',
      'publish_event'
    ])
    WHEN 'content_manager' THEN _permission = ANY (ARRAY[
      'view_event', 'edit_content', 'edit_schedule', 'edit_theme', 'view_rsvp',
      'manage_gallery', 'edit_audio', 'edit_share'
    ])
    WHEN 'gallery_manager' THEN _permission = ANY (ARRAY[
      'view_event', 'manage_gallery', 'download_media'
    ])
    WHEN 'viewer' THEN _permission = 'view_event'
    ELSE false
  END;
END;
$$;

CREATE OR REPLACE FUNCTION public.create_event_owner_membership()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.event_members (invitation_id, user_id, role)
  VALUES (NEW.id, NEW.user_id, 'owner')
  ON CONFLICT (invitation_id, user_id) DO NOTHING;

  INSERT INTO public.event_builder_progress (invitation_id)
  VALUES (NEW.id)
  ON CONFLICT (invitation_id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS invitations_create_foundation_records ON public.invitations;
CREATE TRIGGER invitations_create_foundation_records
AFTER INSERT ON public.invitations
FOR EACH ROW EXECUTE FUNCTION public.create_event_owner_membership();

DROP TRIGGER IF EXISTS event_members_updated_at ON public.event_members;
CREATE TRIGGER event_members_updated_at BEFORE UPDATE ON public.event_members
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS event_builder_progress_updated_at ON public.event_builder_progress;
CREATE TRIGGER event_builder_progress_updated_at BEFORE UPDATE ON public.event_builder_progress
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS event_schedules_updated_at ON public.event_schedules;
CREATE TRIGGER event_schedules_updated_at BEFORE UPDATE ON public.event_schedules
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.event_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_member_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_builder_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_schedules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS event_members_read ON public.event_members;
DROP POLICY IF EXISTS event_members_owner_manage ON public.event_members;
DROP POLICY IF EXISTS event_member_invitations_owner_manage ON public.event_member_invitations;
DROP POLICY IF EXISTS event_activity_logs_read ON public.event_activity_logs;
DROP POLICY IF EXISTS event_builder_progress_member_read ON public.event_builder_progress;
DROP POLICY IF EXISTS event_builder_progress_editor_write ON public.event_builder_progress;
DROP POLICY IF EXISTS event_schedules_public_read ON public.event_schedules;
DROP POLICY IF EXISTS event_schedules_member_read ON public.event_schedules;
DROP POLICY IF EXISTS event_schedules_editor_write ON public.event_schedules;

CREATE POLICY event_members_read ON public.event_members FOR SELECT TO authenticated
USING (public.is_event_member(invitation_id, auth.uid()));

CREATE POLICY event_activity_logs_read ON public.event_activity_logs FOR SELECT TO authenticated
USING (public.has_event_permission(invitation_id, auth.uid(), 'view_audit'));

CREATE POLICY event_builder_progress_member_read ON public.event_builder_progress FOR SELECT TO authenticated
USING (public.is_event_member(invitation_id, auth.uid()));

CREATE POLICY event_schedules_public_read ON public.event_schedules FOR SELECT TO anon
USING (
  is_visible AND EXISTS (
    SELECT 1 FROM public.invitations i
    WHERE i.id = invitation_id AND i.is_published
  )
);

CREATE POLICY event_schedules_member_read ON public.event_schedules FOR SELECT TO authenticated
USING (
  is_visible AND EXISTS (
    SELECT 1 FROM public.invitations i
    WHERE i.id = invitation_id AND i.is_published
  )
  OR public.is_event_member(invitation_id, auth.uid())
);

REVOKE EXECUTE ON FUNCTION public.is_event_member(UUID, UUID) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.has_event_permission(UUID, UUID, TEXT) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.create_event_owner_membership() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_event_member(UUID, UUID) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.has_event_permission(UUID, UUID, TEXT) TO authenticated, service_role;

GRANT SELECT ON public.event_members, public.event_member_invitations,
  public.event_activity_logs, public.event_builder_progress, public.event_schedules TO authenticated;
GRANT SELECT ON public.event_schedules TO anon;
REVOKE INSERT, UPDATE, DELETE ON public.event_members, public.event_member_invitations,
  public.event_activity_logs, public.event_builder_progress, public.event_schedules FROM anon, authenticated;
GRANT ALL ON public.event_members, public.event_member_invitations,
  public.event_activity_logs, public.event_builder_progress, public.event_schedules TO service_role;
