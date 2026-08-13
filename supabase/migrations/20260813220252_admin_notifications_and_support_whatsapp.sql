-- Admin notification inbox for purchases, event creation and application errors.
-- The table is deliberately admin-only; public error reports are accepted by the
-- application server with the service-role key, never directly through PostgREST.

ALTER TABLE public.system_settings
  ADD COLUMN IF NOT EXISTS support_phone TEXT DEFAULT '0530 381 1155',
  ADD COLUMN IF NOT EXISTS whatsapp_number TEXT DEFAULT '0530 381 1155';

CREATE TABLE public.admin_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL CHECK (category IN ('purchase', 'event_created', 'error')),
  severity TEXT NOT NULL DEFAULT 'info' CHECK (severity IN ('info', 'success', 'warning', 'error')),
  title TEXT NOT NULL CHECK (char_length(title) BETWEEN 1 AND 160),
  message TEXT NOT NULL CHECK (char_length(message) BETWEEN 1 AND 1000),
  actor_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  invitation_id UUID REFERENCES public.invitations(id) ON DELETE SET NULL,
  transaction_id UUID REFERENCES public.transactions(id) ON DELETE SET NULL,
  source TEXT NOT NULL DEFAULT 'database' CHECK (char_length(source) BETWEEN 1 AND 80),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  dedupe_key TEXT NOT NULL UNIQUE CHECK (char_length(dedupe_key) BETWEEN 1 AND 200),
  occurrence_count INTEGER NOT NULL DEFAULT 1 CHECK (occurrence_count > 0),
  is_read BOOLEAN NOT NULL DEFAULT false,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX admin_notifications_unread_created_idx
  ON public.admin_notifications (is_read, created_at DESC);
CREATE INDEX admin_notifications_category_created_idx
  ON public.admin_notifications (category, created_at DESC);

ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY admin_notifications_admin_select
  ON public.admin_notifications FOR SELECT TO authenticated
  USING (public.has_role('admin'::public.app_role, (SELECT auth.uid())));

CREATE POLICY admin_notifications_admin_update
  ON public.admin_notifications FOR UPDATE TO authenticated
  USING (public.has_role('admin'::public.app_role, (SELECT auth.uid())))
  WITH CHECK (public.has_role('admin'::public.app_role, (SELECT auth.uid())));

GRANT SELECT, UPDATE ON public.admin_notifications TO authenticated;
GRANT ALL ON public.admin_notifications TO service_role;

-- New public tables are no longer guaranteed to be exposed automatically by the
-- Data API. The explicit grants above opt this table in while RLS keeps it private.

CREATE OR REPLACE FUNCTION public.create_event_admin_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.admin_notifications (
    category,
    severity,
    title,
    message,
    actor_user_id,
    invitation_id,
    source,
    metadata,
    dedupe_key
  )
  VALUES (
    'event_created',
    'info',
    'Yeni etkinlik oluşturuldu',
    concat_ws(' · ', NULLIF(concat_ws(' & ', NEW.partner_one, NEW.partner_two), ''), NULLIF(NEW.slug, '')),
    NEW.user_id,
    NEW.id,
    'invitations_trigger',
    jsonb_build_object(
      'slug', NEW.slug,
      'theme', NEW.theme,
      'event_type', NEW.event_type
    ),
    'event_created:' || NEW.id::text
  )
  ON CONFLICT (dedupe_key) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS invitations_create_admin_notification ON public.invitations;
CREATE TRIGGER invitations_create_admin_notification
AFTER INSERT ON public.invitations
FOR EACH ROW EXECUTE FUNCTION public.create_event_admin_notification();

CREATE OR REPLACE FUNCTION public.create_purchase_admin_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_amount NUMERIC;
BEGIN
  IF NEW.status <> 'success' OR (TG_OP = 'UPDATE' AND OLD.status = 'success') THEN
    RETURN NEW;
  END IF;

  v_amount := NEW.amount::numeric / 100;

  INSERT INTO public.admin_notifications (
    category,
    severity,
    title,
    message,
    actor_user_id,
    invitation_id,
    transaction_id,
    source,
    metadata,
    dedupe_key
  )
  VALUES (
    'purchase',
    'success',
    'Yeni satın alım tamamlandı',
    concat(to_char(v_amount, 'FM999G999G990D00'), ' TRY · ', NEW.package_type),
    NEW.user_id,
    NEW.invitation_id,
    NEW.id,
    'transactions_trigger',
    jsonb_build_object(
      'merchant_oid', NEW.merchant_oid,
      'amount', NEW.amount,
      'currency', 'TRY',
      'package_type', NEW.package_type,
      'is_test_order', COALESCE(NEW.is_test_order, false)
    ),
    'purchase:' || NEW.merchant_oid
  )
  ON CONFLICT (dedupe_key) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS transactions_create_admin_notification ON public.transactions;
CREATE TRIGGER transactions_create_admin_notification
AFTER INSERT OR UPDATE OF status ON public.transactions
FOR EACH ROW EXECUTE FUNCTION public.create_purchase_admin_notification();

CREATE OR REPLACE FUNCTION public.record_admin_error_notification(
  p_title TEXT,
  p_message TEXT,
  p_source TEXT,
  p_dedupe_key TEXT,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO public.admin_notifications (
    category,
    severity,
    title,
    message,
    source,
    metadata,
    dedupe_key
  )
  VALUES (
    'error',
    'error',
    left(COALESCE(NULLIF(p_title, ''), 'Uygulama hatası'), 160),
    left(COALESCE(NULLIF(p_message, ''), 'Detay bulunamadı.'), 1000),
    left(COALESCE(NULLIF(p_source, ''), 'application'), 80),
    COALESCE(p_metadata, '{}'::jsonb),
    left(p_dedupe_key, 200)
  )
  ON CONFLICT (dedupe_key) DO UPDATE SET
    occurrence_count = public.admin_notifications.occurrence_count + 1,
    message = EXCLUDED.message,
    metadata = EXCLUDED.metadata,
    is_read = false,
    read_at = NULL,
    updated_at = now()
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

REVOKE ALL ON FUNCTION public.record_admin_error_notification(TEXT, TEXT, TEXT, TEXT, JSONB)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.record_admin_error_notification(TEXT, TEXT, TEXT, TEXT, JSONB)
  TO service_role;

-- Realtime is best-effort. Polling in the admin UI remains as a fallback.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime')
    AND NOT EXISTS (
      SELECT 1
      FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime'
        AND schemaname = 'public'
        AND tablename = 'admin_notifications'
    )
  THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.admin_notifications;
  END IF;
END
$$;
