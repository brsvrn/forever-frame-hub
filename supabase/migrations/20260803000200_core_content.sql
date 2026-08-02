-- Core invitation content and guest-response settings.
-- Existing invitation, RSVP and guest upload records remain the compatibility source.

CREATE TABLE IF NOT EXISTS public.event_family_details (
  invitation_id UUID PRIMARY KEY REFERENCES public.invitations(id) ON DELETE CASCADE,
  bride_mother TEXT,
  bride_father TEXT,
  bride_family_name TEXT,
  groom_mother TEXT,
  groom_father TEXT,
  groom_family_name TEXT,
  family_message TEXT,
  family_photo_key TEXT,
  is_enabled BOOLEAN NOT NULL DEFAULT false,
  version BIGINT NOT NULL DEFAULT 1 CHECK (version > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.event_invitation_content (
  invitation_id UUID PRIMARY KEY REFERENCES public.invitations(id) ON DELETE CASCADE,
  headline TEXT NOT NULL DEFAULT '',
  welcome_message TEXT NOT NULL DEFAULT '',
  invitation_text TEXT NOT NULL DEFAULT '',
  selected_template_id UUID,
  version BIGINT NOT NULL DEFAULT 1 CHECK (version > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.invitation_text_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  locale TEXT NOT NULL DEFAULT 'tr' CHECK (locale IN ('tr', 'en')),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS invitation_text_templates_seed_key
  ON public.invitation_text_templates (locale, category, title);

INSERT INTO public.invitation_text_templates (category, locale, title, body, sort_order)
VALUES
  ('romantic', 'tr', 'Bir Ömür Birlikte', 'Hayatlarımızı birleştirdiğimiz bu özel günde mutluluğumuzu sizinle paylaşmak istiyoruz.', 10),
  ('modern', 'tr', 'Birlikte Kutlayalım', 'Yeni başlangıcımızı sevdiklerimizle birlikte kutlamak için sizi aramızda görmekten mutluluk duyarız.', 20),
  ('classic', 'tr', 'Davetlisiniz', 'Bu mutlu günümüzde sizleri de aramızda görmekten onur duyarız.', 30),
  ('formal', 'tr', 'Teşriflerinizi Bekleriz', 'Evlilik törenimize teşrifleriniz bizleri onurlandıracaktır.', 40),
  ('friendly', 'tr', 'Bu Gün Bizimle Olun', 'Kahkahamızın ve heyecanımızın eksik kalmaması için bu güzel günde yanımızda olun.', 50),
  ('short', 'tr', 'Evet Diyoruz', 'Evet dediğimiz bu özel günde sizi de yanımızda görmek istiyoruz.', 60),
  ('religious', 'tr', 'Hayırlı Başlangıcımız', 'Rabbimizin izniyle kuracağımız yuvamızın ilk gününde dualarınızla yanımızda olmanızı dileriz.', 70),
  ('henna', 'tr', 'Kına Gecemize Davetlisiniz', 'Geleneklerimizi, neşemizi ve bu unutulmaz geceyi birlikte paylaşmaya davetlisiniz.', 80),
  ('engagement', 'tr', 'Nişanımıza Davetlisiniz', 'Birlikteliğimizi taçlandırdığımız bu güzel günde sizi aramızda görmek istiyoruz.', 90),
  ('circumcision', 'tr', 'Sünnet Törenimize Davetlisiniz', 'Evladımızın bu özel gününde sizleri de aramızda görmekten mutluluk duyarız.', 100),
  ('birthday', 'tr', 'Doğum Gününü Birlikte Kutlayalım', 'Yeni yaşın sevincini birlikte paylaşmak için sizi kutlamamıza bekliyoruz.', 110),
  ('baby', 'tr', 'Minik Mutluluğumuza Davetlisiniz', 'Ailemizin en tatlı heyecanını sizinle birlikte kutlamak istiyoruz.', 120),
  ('school', 'tr', 'Etkinliğimize Davetlisiniz', 'Öğrencilerimizin hazırladığı bu özel günde sizi de aramızda görmekten mutluluk duyarız.', 130),
  ('corporate', 'tr', 'Etkinlik Daveti', 'Etkinliğimizde sizi aramızda görmekten memnuniyet duyacağız.', 140)
ON CONFLICT (locale, category, title) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.user_text_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'custom',
  locale TEXT NOT NULL DEFAULT 'tr' CHECK (locale IN ('tr', 'en')),
  body TEXT NOT NULL,
  is_favorite BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.event_invitation_content
  DROP CONSTRAINT IF EXISTS event_invitation_content_selected_template_id_fkey;
ALTER TABLE public.event_invitation_content
  ADD CONSTRAINT event_invitation_content_selected_template_id_fkey
  FOREIGN KEY (selected_template_id) REFERENCES public.invitation_text_templates(id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS public.event_feature_settings (
  invitation_id UUID PRIMARY KEY REFERENCES public.invitations(id) ON DELETE CASCADE,
  opening_enabled BOOLEAN NOT NULL DEFAULT true,
  music_enabled BOOLEAN NOT NULL DEFAULT true,
  audio_greeting_enabled BOOLEAN NOT NULL DEFAULT false,
  story_enabled BOOLEAN NOT NULL DEFAULT true,
  family_enabled BOOLEAN NOT NULL DEFAULT false,
  gallery_enabled BOOLEAN NOT NULL DEFAULT true,
  schedule_enabled BOOLEAN NOT NULL DEFAULT true,
  countdown_enabled BOOLEAN NOT NULL DEFAULT true,
  map_enabled BOOLEAN NOT NULL DEFAULT true,
  rsvp_enabled BOOLEAN NOT NULL DEFAULT true,
  memory_box_enabled BOOLEAN NOT NULL DEFAULT true,
  qr_upload_enabled BOOLEAN NOT NULL DEFAULT true,
  gift_enabled BOOLEAN NOT NULL DEFAULT false,
  wishes_enabled BOOLEAN NOT NULL DEFAULT false,
  reactions_enabled BOOLEAN NOT NULL DEFAULT false,
  share_enabled BOOLEAN NOT NULL DEFAULT true,
  calendar_enabled BOOLEAN NOT NULL DEFAULT true,
  version BIGINT NOT NULL DEFAULT 1 CHECK (version > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.event_memory_settings (
  invitation_id UUID PRIMARY KEY REFERENCES public.invitations(id) ON DELETE CASCADE,
  photo_enabled BOOLEAN NOT NULL DEFAULT true,
  video_enabled BOOLEAN NOT NULL DEFAULT true,
  text_note_enabled BOOLEAN NOT NULL DEFAULT true,
  audio_message_enabled BOOLEAN NOT NULL DEFAULT false,
  guest_name_required BOOLEAN NOT NULL DEFAULT false,
  moderation_required BOOLEAN NOT NULL DEFAULT true,
  gallery_visibility TEXT NOT NULL DEFAULT 'public_after_approval'
    CHECK (gallery_visibility IN ('private', 'public_after_approval')),
  upload_starts_at TIMESTAMPTZ,
  upload_ends_at TIMESTAMPTZ,
  max_image_size_mb INTEGER NOT NULL DEFAULT 25 CHECK (max_image_size_mb BETWEEN 1 AND 100),
  max_video_size_mb INTEGER NOT NULL DEFAULT 100 CHECK (max_video_size_mb BETWEEN 1 AND 500),
  max_audio_seconds INTEGER NOT NULL DEFAULT 30 CHECK (max_audio_seconds IN (30, 60)),
  thank_you_message TEXT NOT NULL DEFAULT 'Anınızı paylaştığınız için teşekkür ederiz.',
  version BIGINT NOT NULL DEFAULT 1 CHECK (version > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (upload_ends_at IS NULL OR upload_starts_at IS NULL OR upload_ends_at > upload_starts_at)
);

ALTER TABLE public.guest_uploads DROP CONSTRAINT IF EXISTS guest_uploads_status_check;
ALTER TABLE public.guest_uploads ADD CONSTRAINT guest_uploads_status_check
  CHECK (status IN ('pending', 'active', 'approved', 'hidden', 'rejected'));

UPDATE public.guest_uploads
SET file_url = 'protected://guest-upload'
WHERE file_path IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.guest_upload_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invitation_id UUID NOT NULL REFERENCES public.invitations(id) ON DELETE CASCADE,
  object_key TEXT NOT NULL UNIQUE,
  file_type TEXT NOT NULL,
  file_size BIGINT NOT NULL CHECK (file_size > 0),
  requester_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  finalized_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS guest_upload_sessions_rate_idx
  ON public.guest_upload_sessions (requester_hash, created_at DESC);

CREATE TABLE IF NOT EXISTS public.event_rsvp_settings (
  invitation_id UUID PRIMARY KEY REFERENCES public.invitations(id) ON DELETE CASCADE,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  collect_phone BOOLEAN NOT NULL DEFAULT true,
  collect_email BOOLEAN NOT NULL DEFAULT false,
  collect_adult_count BOOLEAN NOT NULL DEFAULT true,
  collect_child_count BOOLEAN NOT NULL DEFAULT true,
  collect_meal_preference BOOLEAN NOT NULL DEFAULT false,
  collect_allergy_info BOOLEAN NOT NULL DEFAULT false,
  collect_transport_need BOOLEAN NOT NULL DEFAULT false,
  collect_special_note BOOLEAN NOT NULL DEFAULT true,
  event_level_attendance BOOLEAN NOT NULL DEFAULT false,
  response_deadline TIMESTAMPTZ,
  version BIGINT NOT NULL DEFAULT 1 CHECK (version > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.event_custom_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invitation_id UUID NOT NULL REFERENCES public.invitations(id) ON DELETE CASCADE,
  question_type TEXT NOT NULL CHECK (question_type IN (
    'short_text', 'long_text', 'yes_no', 'single_choice', 'multiple_choice',
    'number', 'date', 'meal_preference', 'transport_need'
  )),
  label TEXT NOT NULL,
  help_text TEXT,
  options JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_required BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS event_custom_questions_event_sort_idx
  ON public.event_custom_questions (invitation_id, sort_order, created_at);

DROP TRIGGER IF EXISTS event_family_details_updated_at ON public.event_family_details;
CREATE TRIGGER event_family_details_updated_at BEFORE UPDATE ON public.event_family_details
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
DROP TRIGGER IF EXISTS event_invitation_content_updated_at ON public.event_invitation_content;
CREATE TRIGGER event_invitation_content_updated_at BEFORE UPDATE ON public.event_invitation_content
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
DROP TRIGGER IF EXISTS invitation_text_templates_updated_at ON public.invitation_text_templates;
CREATE TRIGGER invitation_text_templates_updated_at BEFORE UPDATE ON public.invitation_text_templates
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
DROP TRIGGER IF EXISTS user_text_templates_updated_at ON public.user_text_templates;
CREATE TRIGGER user_text_templates_updated_at BEFORE UPDATE ON public.user_text_templates
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
DROP TRIGGER IF EXISTS event_feature_settings_updated_at ON public.event_feature_settings;
CREATE TRIGGER event_feature_settings_updated_at BEFORE UPDATE ON public.event_feature_settings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
DROP TRIGGER IF EXISTS event_memory_settings_updated_at ON public.event_memory_settings;
CREATE TRIGGER event_memory_settings_updated_at BEFORE UPDATE ON public.event_memory_settings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
DROP TRIGGER IF EXISTS event_rsvp_settings_updated_at ON public.event_rsvp_settings;
CREATE TRIGGER event_rsvp_settings_updated_at BEFORE UPDATE ON public.event_rsvp_settings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
DROP TRIGGER IF EXISTS event_custom_questions_updated_at ON public.event_custom_questions;
CREATE TRIGGER event_custom_questions_updated_at BEFORE UPDATE ON public.event_custom_questions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.rsvps
  ADD COLUMN IF NOT EXISTS adult_count INTEGER NOT NULL DEFAULT 1 CHECK (adult_count >= 0),
  ADD COLUMN IF NOT EXISTS child_count INTEGER NOT NULL DEFAULT 0 CHECK (child_count >= 0),
  ADD COLUMN IF NOT EXISTS meal_preference TEXT,
  ADD COLUMN IF NOT EXISTS allergy_info TEXT,
  ADD COLUMN IF NOT EXISTS transport_required BOOLEAN,
  ADD COLUMN IF NOT EXISTS special_note TEXT;

DROP POLICY IF EXISTS "rsvps_insert_public" ON public.rsvps;
REVOKE INSERT ON public.rsvps FROM anon, authenticated;

DROP POLICY IF EXISTS "rsvps_owner_select" ON public.rsvps;
DROP POLICY IF EXISTS rsvps_member_select ON public.rsvps;
CREATE POLICY rsvps_member_select ON public.rsvps FOR SELECT TO authenticated
  USING (public.is_event_member(invitation_id, auth.uid()));

UPDATE public.rsvps
SET adult_count = GREATEST(party_size, 1)
WHERE adult_count = 1 AND party_size <> 1;

CREATE TABLE IF NOT EXISTS public.rsvp_event_selections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rsvp_id UUID NOT NULL REFERENCES public.rsvps(id) ON DELETE CASCADE,
  schedule_id UUID NOT NULL REFERENCES public.event_schedules(id) ON DELETE CASCADE,
  attending BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (rsvp_id, schedule_id)
);

ALTER TABLE public.event_schedules
  ADD COLUMN IF NOT EXISTS timezone TEXT NOT NULL DEFAULT 'Europe/Istanbul',
  ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 1 CHECK (version > 0);

CREATE TABLE IF NOT EXISTS public.rsvp_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rsvp_id UUID NOT NULL REFERENCES public.rsvps(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.event_custom_questions(id) ON DELETE CASCADE,
  answer JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (rsvp_id, question_id)
);

INSERT INTO public.event_family_details (
  invitation_id,
  bride_mother,
  bride_father,
  bride_family_name,
  groom_mother,
  groom_father,
  groom_family_name,
  is_enabled
)
SELECT
  id,
  family_info #>> '{bride,mother}',
  family_info #>> '{bride,father}',
  family_info #>> '{bride,familyName}',
  family_info #>> '{groom,mother}',
  family_info #>> '{groom,father}',
  family_info #>> '{groom,familyName}',
  family_info IS NOT NULL AND family_info <> '{}'::jsonb
FROM public.invitations
ON CONFLICT (invitation_id) DO NOTHING;

INSERT INTO public.event_invitation_content (
  invitation_id, headline, welcome_message, invitation_text
)
SELECT id, headline, message, message
FROM public.invitations
ON CONFLICT (invitation_id) DO NOTHING;

INSERT INTO public.event_feature_settings (invitation_id, family_enabled)
SELECT id, family_info IS NOT NULL AND family_info <> '{}'::jsonb
FROM public.invitations
ON CONFLICT (invitation_id) DO NOTHING;

INSERT INTO public.event_memory_settings (invitation_id)
SELECT id FROM public.invitations
ON CONFLICT (invitation_id) DO NOTHING;

INSERT INTO public.event_rsvp_settings (invitation_id)
SELECT id FROM public.invitations
ON CONFLICT (invitation_id) DO NOTHING;

CREATE OR REPLACE FUNCTION public.create_event_content_records()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.event_family_details (invitation_id) VALUES (NEW.id)
  ON CONFLICT (invitation_id) DO NOTHING;
  INSERT INTO public.event_invitation_content (
    invitation_id, headline, welcome_message, invitation_text
  ) VALUES (NEW.id, NEW.headline, NEW.message, NEW.message)
  ON CONFLICT (invitation_id) DO NOTHING;
  INSERT INTO public.event_feature_settings (invitation_id) VALUES (NEW.id)
  ON CONFLICT (invitation_id) DO NOTHING;
  INSERT INTO public.event_memory_settings (invitation_id) VALUES (NEW.id)
  ON CONFLICT (invitation_id) DO NOTHING;
  INSERT INTO public.event_rsvp_settings (invitation_id) VALUES (NEW.id)
  ON CONFLICT (invitation_id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS invitations_create_content_records ON public.invitations;
CREATE TRIGGER invitations_create_content_records
AFTER INSERT ON public.invitations
FOR EACH ROW EXECUTE FUNCTION public.create_event_content_records();

DO $$
DECLARE
  table_name TEXT;
BEGIN
  FOREACH table_name IN ARRAY ARRAY[
    'event_family_details', 'event_invitation_content', 'invitation_text_templates',
    'user_text_templates', 'event_feature_settings', 'event_memory_settings',
    'event_rsvp_settings', 'event_custom_questions', 'rsvp_event_selections', 'rsvp_answers',
    'guest_upload_sessions'
  ]
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', table_name);
  END LOOP;
END
$$;

DROP POLICY IF EXISTS invitation_text_templates_public_read ON public.invitation_text_templates;
CREATE POLICY invitation_text_templates_public_read ON public.invitation_text_templates
FOR SELECT TO anon, authenticated USING (is_active);

DROP POLICY IF EXISTS user_text_templates_owner_read ON public.user_text_templates;
CREATE POLICY user_text_templates_owner_read ON public.user_text_templates
FOR SELECT TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS event_family_details_member_read ON public.event_family_details;
CREATE POLICY event_family_details_member_read ON public.event_family_details
FOR SELECT TO authenticated USING (public.is_event_member(invitation_id, auth.uid()));

DROP POLICY IF EXISTS event_invitation_content_member_read ON public.event_invitation_content;
CREATE POLICY event_invitation_content_member_read ON public.event_invitation_content
FOR SELECT TO authenticated USING (public.is_event_member(invitation_id, auth.uid()));

DROP POLICY IF EXISTS event_feature_settings_member_read ON public.event_feature_settings;
DROP POLICY IF EXISTS event_feature_settings_public_read ON public.event_feature_settings;
CREATE POLICY event_feature_settings_public_read ON public.event_feature_settings
FOR SELECT TO anon USING (
  EXISTS (
    SELECT 1 FROM public.invitations i WHERE i.id = invitation_id AND i.is_published
  )
);
CREATE POLICY event_feature_settings_member_read ON public.event_feature_settings
FOR SELECT TO authenticated USING (
  EXISTS (
    SELECT 1 FROM public.invitations i WHERE i.id = invitation_id AND i.is_published
  ) OR public.is_event_member(invitation_id, auth.uid())
);

DROP POLICY IF EXISTS event_memory_settings_member_read ON public.event_memory_settings;
CREATE POLICY event_memory_settings_member_read ON public.event_memory_settings
FOR SELECT TO authenticated USING (public.is_event_member(invitation_id, auth.uid()));

DROP POLICY IF EXISTS event_rsvp_settings_member_read ON public.event_rsvp_settings;
CREATE POLICY event_rsvp_settings_member_read ON public.event_rsvp_settings
FOR SELECT TO authenticated USING (public.is_event_member(invitation_id, auth.uid()));

DROP POLICY IF EXISTS event_custom_questions_public_read ON public.event_custom_questions;
DROP POLICY IF EXISTS event_custom_questions_member_read ON public.event_custom_questions;
CREATE POLICY event_custom_questions_public_read ON public.event_custom_questions
FOR SELECT TO anon USING (
  is_active AND EXISTS (
    SELECT 1 FROM public.invitations i WHERE i.id = invitation_id AND i.is_published
  )
);
CREATE POLICY event_custom_questions_member_read ON public.event_custom_questions
FOR SELECT TO authenticated USING (
  (is_active AND EXISTS (
    SELECT 1 FROM public.invitations i WHERE i.id = invitation_id AND i.is_published
  )) OR public.is_event_member(invitation_id, auth.uid())
);

DROP POLICY IF EXISTS rsvp_event_selections_owner_read ON public.rsvp_event_selections;
CREATE POLICY rsvp_event_selections_owner_read ON public.rsvp_event_selections
FOR SELECT TO authenticated USING (
  EXISTS (
    SELECT 1
    FROM public.rsvps r
    WHERE r.id = rsvp_id AND public.is_event_member(r.invitation_id, auth.uid())
  )
);

DROP POLICY IF EXISTS rsvp_answers_owner_read ON public.rsvp_answers;
CREATE POLICY rsvp_answers_owner_read ON public.rsvp_answers
FOR SELECT TO authenticated USING (
  EXISTS (
    SELECT 1
    FROM public.rsvps r
    WHERE r.id = rsvp_id AND public.is_event_member(r.invitation_id, auth.uid())
  )
);

REVOKE INSERT, UPDATE, DELETE ON public.event_family_details, public.event_invitation_content,
  public.invitation_text_templates, public.user_text_templates, public.event_feature_settings,
  public.event_memory_settings, public.event_rsvp_settings, public.event_custom_questions,
  public.rsvp_event_selections, public.rsvp_answers FROM anon, authenticated;

DROP POLICY IF EXISTS guest_uploads_public_insert ON public.guest_uploads;
REVOKE INSERT ON public.guest_uploads FROM anon, authenticated;
DROP POLICY IF EXISTS guest_upload_storage_insert ON storage.objects;

DROP POLICY IF EXISTS guest_uploads_public_read ON public.guest_uploads;
CREATE POLICY guest_uploads_public_read ON public.guest_uploads FOR SELECT TO anon, authenticated
  USING (
    status IN ('active', 'approved')
    AND EXISTS (
      SELECT 1
      FROM public.invitations i
      JOIN public.event_memory_settings m ON m.invitation_id = i.id
      WHERE i.id = invitation_id
        AND i.is_published
        AND m.gallery_visibility = 'public_after_approval'
    )
  );

DROP POLICY IF EXISTS guest_uploads_owner_manage ON public.guest_uploads;
DROP POLICY IF EXISTS guest_uploads_member_manage ON public.guest_uploads;
DROP POLICY IF EXISTS guest_uploads_member_read ON public.guest_uploads;
CREATE POLICY guest_uploads_member_read ON public.guest_uploads FOR SELECT TO authenticated
  USING (public.is_event_member(invitation_id, auth.uid()));
REVOKE INSERT, UPDATE, DELETE ON public.guest_uploads FROM anon, authenticated;
REVOKE SELECT ON public.guest_uploads FROM anon, authenticated;
GRANT SELECT (
  id, invitation_id, guest_name, note, file_url, file_type, file_size,
  status, is_favorite, created_at
) ON public.guest_uploads TO anon, authenticated;

GRANT SELECT ON public.invitation_text_templates, public.event_custom_questions TO anon;
GRANT SELECT ON public.event_feature_settings TO anon;
GRANT SELECT ON public.event_family_details, public.event_invitation_content,
  public.invitation_text_templates, public.user_text_templates, public.event_feature_settings,
  public.event_memory_settings, public.event_rsvp_settings, public.event_custom_questions TO authenticated;
GRANT SELECT ON public.rsvp_event_selections, public.rsvp_answers TO authenticated;
GRANT ALL ON public.event_family_details, public.event_invitation_content,
  public.invitation_text_templates, public.user_text_templates, public.event_feature_settings,
  public.event_memory_settings, public.event_rsvp_settings, public.event_custom_questions,
  public.rsvp_event_selections, public.rsvp_answers, public.guest_upload_sessions TO service_role;

REVOKE EXECUTE ON FUNCTION public.create_event_content_records() FROM PUBLIC, anon, authenticated;
