-- Production invitations predate the unused generated `category` type field;
-- event_type is the canonical identity column. Replace the trigger function
-- without referencing a column that is not part of the live schema.
CREATE OR REPLACE FUNCTION public.enforce_paid_event_entitlement()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_is_privileged BOOLEAN := false;
  v_anchor TIMESTAMPTZ;
BEGIN
  v_is_privileged := current_user::TEXT = ANY (ARRAY['postgres', 'service_role', 'supabase_admin'])
    OR COALESCE(auth.role(), '') = 'service_role'
    OR (
      auth.uid() IS NOT NULL
      AND public.has_role('admin'::public.app_role, auth.uid())
    );

  IF TG_OP = 'INSERT' THEN
    IF COALESCE(NEW.is_paid, false) THEN
      IF NOT v_is_privileged THEN
        RAISE EXCEPTION USING
          ERRCODE = 'P0001',
          MESSAGE = 'Ödeme durumu yalnızca güvenli ödeme veya kullanım kodu akışıyla etkinleştirilebilir.';
      END IF;

      v_anchor := COALESCE(NEW.event_date::TIMESTAMP AT TIME ZONE 'Europe/Istanbul', now());
      NEW.paid_at := COALESCE(NEW.paid_at, now());
      NEW.event_identity_locked_at := COALESCE(NEW.event_identity_locked_at, now());
      NEW.entitlement_event_date := COALESCE(NEW.entitlement_event_date, NEW.event_date);
      NEW.qr_closing_at := COALESCE(NEW.qr_closing_at, v_anchor + interval '5 days');
      NEW.retention_expires_at := COALESCE(NEW.retention_expires_at, v_anchor + interval '60 days');
      NEW.invitation_expires_at := COALESCE(NEW.invitation_expires_at, v_anchor + interval '1 year');
    END IF;
    RETURN NEW;
  END IF;

  IF NOT COALESCE(OLD.is_paid, false) AND COALESCE(NEW.is_paid, false) THEN
    IF NOT v_is_privileged THEN
      RAISE EXCEPTION USING
        ERRCODE = 'P0001',
        MESSAGE = 'Ödeme durumu yalnızca güvenli ödeme veya kullanım kodu akışıyla etkinleştirilebilir.';
    END IF;

    v_anchor := COALESCE(NEW.event_date::TIMESTAMP AT TIME ZONE 'Europe/Istanbul', now());
    NEW.paid_at := COALESCE(NEW.paid_at, now());
    NEW.event_identity_locked_at := COALESCE(NEW.event_identity_locked_at, now());
    NEW.entitlement_event_date := COALESCE(NEW.entitlement_event_date, NEW.event_date);
    NEW.qr_closing_at := COALESCE(NEW.qr_closing_at, v_anchor + interval '5 days');
    NEW.retention_expires_at := COALESCE(NEW.retention_expires_at, v_anchor + interval '60 days');
    NEW.invitation_expires_at := COALESCE(NEW.invitation_expires_at, v_anchor + interval '1 year');
  ELSIF COALESCE(OLD.is_paid, false) THEN
    IF NOT v_is_privileged AND (
      NEW.is_paid IS DISTINCT FROM OLD.is_paid
      OR NEW.package_id IS DISTINCT FROM OLD.package_id
      OR NEW.package_type IS DISTINCT FROM OLD.package_type
      OR NEW.partner_one IS DISTINCT FROM OLD.partner_one
      OR NEW.partner_two IS DISTINCT FROM OLD.partner_two
      OR NEW.event_type IS DISTINCT FROM OLD.event_type
      OR NEW.event_date IS DISTINCT FROM OLD.event_date
      OR NEW.slug IS DISTINCT FROM OLD.slug
      OR NEW.paid_at IS DISTINCT FROM OLD.paid_at
      OR NEW.event_identity_locked_at IS DISTINCT FROM OLD.event_identity_locked_at
      OR NEW.entitlement_event_date IS DISTINCT FROM OLD.entitlement_event_date
      OR NEW.qr_closing_at IS DISTINCT FROM OLD.qr_closing_at
      OR NEW.retention_expires_at IS DISTINCT FROM OLD.retention_expires_at
      OR NEW.invitation_expires_at IS DISTINCT FROM OLD.invitation_expires_at
    ) THEN
      RAISE EXCEPTION USING
        ERRCODE = 'P0001',
        MESSAGE = 'Bu ödeme mevcut etkinliğe bağlıdır. Yeni bir etkinlik için yeni davetiye oluşturup yeniden ödeme yapmalısınız.';
    END IF;

    IF NOT v_is_privileged THEN
      NEW.paid_at := OLD.paid_at;
      NEW.event_identity_locked_at := OLD.event_identity_locked_at;
      NEW.entitlement_event_date := OLD.entitlement_event_date;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;
