-- Bring the historical one-off analytics SQL into versioned migrations so a
-- fresh environment has the same transaction shape as production.
ALTER TABLE public.transactions
  ADD COLUMN IF NOT EXISTS currency TEXT NOT NULL DEFAULT 'TL',
  ADD COLUMN IF NOT EXISTS is_test_order BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS analytics_purchase_sent BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS meta_purchase_sent BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS google_ads_purchase_sent BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS analytics_sent_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS first_utm_source TEXT,
  ADD COLUMN IF NOT EXISTS first_utm_medium TEXT,
  ADD COLUMN IF NOT EXISTS first_utm_campaign TEXT,
  ADD COLUMN IF NOT EXISTS first_utm_content TEXT,
  ADD COLUMN IF NOT EXISTS first_utm_term TEXT,
  ADD COLUMN IF NOT EXISTS last_utm_source TEXT,
  ADD COLUMN IF NOT EXISTS last_utm_medium TEXT,
  ADD COLUMN IF NOT EXISTS last_utm_campaign TEXT,
  ADD COLUMN IF NOT EXISTS last_utm_content TEXT,
  ADD COLUMN IF NOT EXISTS last_utm_term TEXT,
  ADD COLUMN IF NOT EXISTS gclid TEXT,
  ADD COLUMN IF NOT EXISTS fbclid TEXT,
  ADD COLUMN IF NOT EXISTS landing_page TEXT,
  ADD COLUMN IF NOT EXISTS referrer TEXT;

UPDATE public.transactions
SET is_test_order = COALESCE(is_test_order, false),
    analytics_purchase_sent = COALESCE(analytics_purchase_sent, false),
    meta_purchase_sent = COALESCE(meta_purchase_sent, false),
    google_ads_purchase_sent = COALESCE(google_ads_purchase_sent, false),
    currency = COALESCE(NULLIF(currency, ''), 'TL');
ALTER TABLE public.transactions
  ALTER COLUMN currency SET DEFAULT 'TL',
  ALTER COLUMN currency SET NOT NULL,
  ALTER COLUMN is_test_order SET DEFAULT false,
  ALTER COLUMN is_test_order SET NOT NULL,
  ALTER COLUMN analytics_purchase_sent SET DEFAULT false,
  ALTER COLUMN analytics_purchase_sent SET NOT NULL,
  ALTER COLUMN meta_purchase_sent SET DEFAULT false,
  ALTER COLUMN meta_purchase_sent SET NOT NULL,
  ALTER COLUMN google_ads_purchase_sent SET DEFAULT false,
  ALTER COLUMN google_ads_purchase_sent SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_transactions_analytics_sent
ON public.transactions (analytics_purchase_sent);
CREATE INDEX IF NOT EXISTS idx_transactions_status_created
ON public.transactions (status, created_at);

-- Close the accidentally public transaction mutation policy. Service-role
-- requests bypass RLS and do not need a permissive policy.
DROP POLICY IF EXISTS "Service role can manage transactions" ON public.transactions;
DROP POLICY IF EXISTS transactions_admin_all ON public.transactions;
CREATE POLICY transactions_admin_select ON public.transactions
FOR SELECT TO authenticated
USING (public.has_role('admin'::public.app_role, auth.uid()));

REVOKE ALL ON public.transactions FROM anon;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON public.transactions FROM authenticated;
GRANT SELECT ON public.transactions TO authenticated;
GRANT ALL ON public.transactions TO service_role;

-- A paid, published invitation may be used by public child-table policies,
-- without exposing the invitations base table to anonymous clients.
CREATE OR REPLACE FUNCTION public.is_public_invitation(_invitation_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.invitations AS i
    WHERE i.id = _invitation_id
      AND i.is_published = true
      AND i.is_paid = true
      AND i.deleted_at IS NULL
      AND (i.invitation_expires_at IS NULL OR i.invitation_expires_at > now())
  );
$$;

CREATE OR REPLACE FUNCTION public.is_public_invitation_path(_invitation_id TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT CASE
    WHEN _invitation_id ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
      THEN public.is_public_invitation(_invitation_id::UUID)
    ELSE false
  END;
$$;

CREATE OR REPLACE FUNCTION public.is_public_memory_gallery(_invitation_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT public.is_public_invitation(_invitation_id)
    AND EXISTS (
      SELECT 1
      FROM public.event_memory_settings AS settings
      WHERE settings.invitation_id = _invitation_id
        AND settings.gallery_visibility = 'public_after_approval'
    );
$$;

REVOKE ALL ON FUNCTION public.is_public_invitation(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_public_invitation_path(TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_public_memory_gallery(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_public_invitation(UUID) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_public_invitation_path(TEXT) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_public_memory_gallery(UUID) TO anon, authenticated, service_role;

DROP POLICY IF EXISTS "invitations_public_read" ON public.invitations;
REVOKE SELECT ON public.invitations FROM anon;
GRANT SELECT ON public.invitations TO authenticated;

-- Public visitors only need contact information, not maintenance controls,
-- upload limits, internal defaults or updater identities.
CREATE OR REPLACE FUNCTION public.get_public_support_settings()
RETURNS JSONB
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT jsonb_build_object(
    'support_email', settings.support_email,
    'support_phone', settings.support_phone,
    'whatsapp_number', settings.whatsapp_number,
    'working_hours', settings.working_hours
  )
  FROM public.system_settings AS settings
  ORDER BY settings.updated_at DESC
  LIMIT 1;
$$;
REVOKE ALL ON FUNCTION public.get_public_support_settings() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_support_settings() TO anon, authenticated, service_role;
DROP POLICY IF EXISTS system_settings_public_read ON public.system_settings;
REVOKE SELECT ON public.system_settings FROM anon;
GRANT SELECT ON public.system_settings TO authenticated;

-- Ticket creation currently has no public UI and must not be a direct,
-- unthrottled PostgREST write primitive.
DROP POLICY IF EXISTS support_tickets_public_insert ON public.support_tickets;
REVOKE INSERT ON public.support_tickets FROM anon;

DROP POLICY IF EXISTS "rsvps_insert_public" ON public.rsvps;
CREATE POLICY rsvps_insert_public ON public.rsvps FOR INSERT TO anon, authenticated
WITH CHECK (public.is_public_invitation(invitation_id));

DROP POLICY IF EXISTS event_schedules_public_read ON public.event_schedules;
CREATE POLICY event_schedules_public_read ON public.event_schedules FOR SELECT TO anon
USING (is_visible AND public.is_public_invitation(invitation_id));
DROP POLICY IF EXISTS event_schedules_member_read ON public.event_schedules;
CREATE POLICY event_schedules_member_read ON public.event_schedules FOR SELECT TO authenticated
USING (
  (is_visible AND public.is_public_invitation(invitation_id))
  OR public.is_event_member(invitation_id, auth.uid())
);

DROP POLICY IF EXISTS event_feature_settings_public_read ON public.event_feature_settings;
CREATE POLICY event_feature_settings_public_read ON public.event_feature_settings FOR SELECT TO anon
USING (public.is_public_invitation(invitation_id));
DROP POLICY IF EXISTS event_feature_settings_member_read ON public.event_feature_settings;
CREATE POLICY event_feature_settings_member_read ON public.event_feature_settings FOR SELECT TO authenticated
USING (
  public.is_public_invitation(invitation_id)
  OR public.is_event_member(invitation_id, auth.uid())
);

DROP POLICY IF EXISTS event_custom_questions_public_read ON public.event_custom_questions;
CREATE POLICY event_custom_questions_public_read ON public.event_custom_questions FOR SELECT TO anon
USING (is_active AND public.is_public_invitation(invitation_id));
DROP POLICY IF EXISTS event_custom_questions_member_read ON public.event_custom_questions;
CREATE POLICY event_custom_questions_member_read ON public.event_custom_questions FOR SELECT TO authenticated
USING (
  (is_active AND public.is_public_invitation(invitation_id))
  OR public.is_event_member(invitation_id, auth.uid())
);

DROP POLICY IF EXISTS guest_uploads_public_read ON public.guest_uploads;
CREATE POLICY guest_uploads_public_read ON public.guest_uploads FOR SELECT TO anon, authenticated
USING (
  status IN ('active', 'approved')
  AND public.is_public_memory_gallery(invitation_id)
);

DROP POLICY IF EXISTS guest_upload_storage_read ON storage.objects;
CREATE POLICY guest_upload_storage_read ON storage.objects FOR SELECT TO anon, authenticated
USING (
  bucket_id = 'guest-uploads'
  AND (
    public.is_public_invitation_path((storage.foldername(name))[1])
    OR EXISTS (
      SELECT 1 FROM public.invitations AS i
      WHERE i.id::TEXT = (storage.foldername(name))[1]
        AND i.user_id = auth.uid()
    )
  )
);

-- Return an explicit public projection. Internal ownership, notes, billing,
-- retention and storage-accounting columns never cross this boundary.
CREATE OR REPLACE FUNCTION public.get_public_invitation(p_slug TEXT)
RETURNS JSONB
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT jsonb_build_object(
    'id', i.id,
    'slug', i.slug,
    'package_id', i.package_id,
    'package_type', i.package_type,
    'theme', i.theme,
    'event_type', i.event_type,
    'category', i.category,
    'partner_one', i.partner_one,
    'partner_two', i.partner_two,
    'headline', i.headline,
    'message', i.message,
    'event_date', i.event_date,
    'event_time', i.event_time,
    'venue', i.venue,
    'address', i.address,
    'city', i.city,
    'map_url', i.map_url,
    'music_url', i.music_url,
    'cover_photo', i.cover_photo,
    'rsvp_label', i.rsvp_label,
    'event_program', i.event_program,
    'our_story', i.our_story,
    'family_info', i.family_info,
    'custom_sections', i.custom_sections,
    'is_published', i.is_published,
    'is_paid', i.is_paid,
    'published_at', i.published_at,
    'primary_schedule_id', i.primary_schedule_id,
    'schema_version', i.schema_version,
    'version', i.version,
    'updated_at', i.updated_at,
    'package', CASE WHEN p.id IS NULL THEN NULL ELSE jsonb_build_object(
      'id', p.id,
      'name', p.name,
      'description', p.description,
      'features', p.features,
      'limits', p.limits,
      'storage', p.storage,
      'retention', p.retention
    ) END
  )
  FROM public.invitations AS i
  LEFT JOIN public.packages AS p ON p.id = i.package_id AND p.deleted_at IS NULL
  WHERE i.slug = p_slug
    AND public.is_public_invitation(i.id)
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.get_public_invitation(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_invitation(TEXT) TO anon, authenticated, service_role;

-- Durable payment-event outbox. Payment activation commits independently of
-- external analytics and can be retried by a cron worker.
CREATE TABLE IF NOT EXISTS public.payment_event_outbox (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID NOT NULL REFERENCES public.transactions(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('purchase')),
  payload JSONB NOT NULL DEFAULT '{}'::JSONB,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  attempts INTEGER NOT NULL DEFAULT 0 CHECK (attempts >= 0),
  available_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_at TIMESTAMPTZ,
  last_error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (transaction_id, event_type)
);
CREATE INDEX IF NOT EXISTS payment_event_outbox_pending_idx
ON public.payment_event_outbox (available_at, created_at)
WHERE status IN ('pending', 'failed', 'processing');
ALTER TABLE public.payment_event_outbox ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.payment_event_outbox FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.payment_event_outbox TO service_role;

CREATE OR REPLACE FUNCTION public.claim_payment_event_outbox(p_limit INTEGER DEFAULT 20)
RETURNS TABLE (id UUID, payload JSONB, attempts INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN QUERY
  WITH claimed AS (
    SELECT candidate.id
    FROM public.payment_event_outbox AS candidate
    WHERE (
        candidate.status IN ('pending', 'failed')
        AND candidate.available_at <= now()
      ) OR (
        candidate.status = 'processing'
        AND candidate.updated_at < now() - interval '15 minutes'
      )
    ORDER BY candidate.created_at
    FOR UPDATE SKIP LOCKED
    LIMIT LEAST(GREATEST(p_limit, 1), 100)
  )
  UPDATE public.payment_event_outbox AS target
  SET status = 'processing',
      attempts = target.attempts + 1,
      updated_at = now()
  FROM claimed
  WHERE target.id = claimed.id
  RETURNING target.id, target.payload, target.attempts;
END;
$$;

REVOKE ALL ON FUNCTION public.claim_payment_event_outbox(INTEGER) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_payment_event_outbox(INTEGER) TO service_role;

CREATE OR REPLACE FUNCTION public.finalize_paytr_payment(
  p_merchant_oid TEXT,
  p_total_amount INTEGER
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_transaction public.transactions%ROWTYPE;
BEGIN
  SELECT * INTO v_transaction
  FROM public.transactions
  WHERE merchant_oid = p_merchant_oid
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('status', 'not_found');
  END IF;
  IF v_transaction.amount IS DISTINCT FROM p_total_amount THEN
    RETURN jsonb_build_object('status', 'amount_mismatch');
  END IF;
  IF v_transaction.status NOT IN ('pending', 'success') THEN
    RETURN jsonb_build_object('status', 'invalid_status');
  END IF;
  IF v_transaction.invitation_id IS NULL THEN
    RETURN jsonb_build_object('status', 'invitation_not_found');
  END IF;

  UPDATE public.invitations
  SET is_paid = true,
      package_type = v_transaction.package_type,
      package_id = v_transaction.package_type::UUID,
      updated_at = now()
  WHERE id = v_transaction.invitation_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('status', 'invitation_not_found');
  END IF;

  IF v_transaction.status <> 'success' THEN
    UPDATE public.transactions
    SET status = 'success', updated_at = now()
    WHERE id = v_transaction.id;
  END IF;

  INSERT INTO public.payment_event_outbox (transaction_id, event_type, payload)
  VALUES (
    v_transaction.id,
    'purchase',
    jsonb_build_object(
      'merchant_oid', v_transaction.merchant_oid,
      'user_id', v_transaction.user_id,
      'package_type', v_transaction.package_type,
      'amount', v_transaction.amount,
      'is_test_order', v_transaction.is_test_order
    )
  )
  ON CONFLICT (transaction_id, event_type) DO NOTHING;

  RETURN jsonb_build_object(
    'status', CASE WHEN v_transaction.status = 'success' THEN 'already_processed' ELSE 'processed' END,
    'transaction_id', v_transaction.id,
    'merchant_oid', v_transaction.merchant_oid,
    'user_id', v_transaction.user_id,
    'package_type', v_transaction.package_type,
    'amount', v_transaction.amount,
    'is_test_order', v_transaction.is_test_order
  );
END;
$$;

REVOKE ALL ON FUNCTION public.finalize_paytr_payment(TEXT, INTEGER) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.finalize_paytr_payment(TEXT, INTEGER) TO service_role;

-- Role changes are serialized so two concurrent demotions cannot remove the
-- final administrator. The function is service-role only and the caller is
-- independently authenticated by the server function.
CREATE OR REPLACE FUNCTION public.set_admin_role_atomic(
  p_actor_user_id UUID,
  p_actor_email TEXT,
  p_target_user_id UUID,
  p_target_email TEXT,
  p_grant_admin BOOLEAN
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_admin_count INTEGER;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtext('memorywedding-admin-role-management'));

  IF NOT public.has_role('admin'::public.app_role, p_actor_user_id) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Yönetici yetkisi gerekli.');
  END IF;
  IF NOT p_grant_admin AND p_actor_user_id = p_target_user_id THEN
    RETURN jsonb_build_object('success', false, 'error', 'Kendi yöneticilik yetkinizi kaldıramazsınız.');
  END IF;

  IF p_grant_admin THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (p_target_user_id, 'admin'::public.app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  ELSE
    SELECT count(*) INTO v_admin_count
    FROM public.user_roles
    WHERE role = 'admin'::public.app_role;
    IF v_admin_count <= 1 THEN
      RETURN jsonb_build_object('success', false, 'error', 'Sistemdeki son yönetici kaldırılamaz.');
    END IF;
    DELETE FROM public.user_roles
    WHERE user_id = p_target_user_id AND role = 'admin'::public.app_role;
  END IF;

  INSERT INTO public.admin_audit_logs (
    admin_id, admin_email, action, target_type, target_id, details
  ) VALUES (
    p_actor_user_id,
    COALESCE(p_actor_email, 'unknown@memorywedding.com'),
    CASE WHEN p_grant_admin THEN 'grant_admin_role' ELSE 'revoke_admin_role' END,
    'user',
    p_target_user_id,
    jsonb_build_object('targetEmail', p_target_email)
  );
  RETURN jsonb_build_object('success', true);
END;
$$;

REVOKE ALL ON FUNCTION public.set_admin_role_atomic(UUID, TEXT, UUID, TEXT, BOOLEAN)
FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.set_admin_role_atomic(UUID, TEXT, UUID, TEXT, BOOLEAN)
TO service_role;
