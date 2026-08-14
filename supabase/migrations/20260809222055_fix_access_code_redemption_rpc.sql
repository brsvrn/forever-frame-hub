-- Redeem codes through one authenticated, atomic operation. The underlying
-- tables remain admin-only; callers never receive access-code rows.
DROP FUNCTION IF EXISTS public.redeem_access_code_atomic(TEXT, UUID, UUID, TEXT, TEXT);

CREATE OR REPLACE FUNCTION public.redeem_access_code_atomic(
  p_code_label TEXT,
  p_invitation_id UUID,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_user_email TEXT;
  v_code public.access_codes%ROWTYPE;
  v_invitation public.invitations%ROWTYPE;
  v_now TIMESTAMPTZ := now();
BEGIN
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Kodu kullanmak için giriş yapmalısınız.');
  END IF;

  IF p_invitation_id IS NULL OR trim(COALESCE(p_code_label, '')) = '' THEN
    RETURN jsonb_build_object('success', false, 'message', 'Kod ve etkinlik bilgisi zorunludur.');
  END IF;

  SELECT i.*
    INTO v_invitation
  FROM public.invitations AS i
  WHERE i.id = p_invitation_id
    AND i.user_id = v_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Etkinlik bulunamadı veya bu etkinliği güncelleme yetkiniz yok.'
    );
  END IF;

  IF COALESCE(v_invitation.is_paid, false) THEN
    RETURN jsonb_build_object('success', false, 'message', 'Bu etkinlik zaten aktif. Yeni bir kod kullanılmadı.');
  END IF;

  SELECT u.email
    INTO v_user_email
  FROM auth.users AS u
  WHERE u.id = v_user_id;

  SELECT c.*
    INTO v_code
  FROM public.access_codes AS c
  WHERE c.code_label = upper(trim(p_code_label))
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'Geçersiz veya bulunamayan erişim kodu.');
  END IF;

  IF NOT v_code.is_active THEN
    RETURN jsonb_build_object('success', false, 'message', 'Bu erişim kodu devre dışı bırakılmış.');
  END IF;

  IF v_code.starts_at IS NOT NULL AND v_now < v_code.starts_at THEN
    RETURN jsonb_build_object('success', false, 'message', 'Bu kodun kullanım tarihi henüz başlamadı.');
  END IF;

  IF v_code.expires_at IS NOT NULL AND v_now > v_code.expires_at THEN
    RETURN jsonb_build_object('success', false, 'message', 'Bu erişim kodunun süresi dolmuş.');
  END IF;

  IF v_code.discount_type <> 'free_bypass' THEN
    RETURN jsonb_build_object('success', false, 'message', 'Bu indirim kodu henüz bu ödeme adımında desteklenmiyor.');
  END IF;

  IF v_code.restricted_user_id IS NOT NULL AND v_code.restricted_user_id <> v_user_id THEN
    RETURN jsonb_build_object('success', false, 'message', 'Bu kod yalnızca tanımlı kullanıcı için geçerlidir.');
  END IF;

  IF v_code.restricted_user_email IS NOT NULL
     AND lower(v_code.restricted_user_email) <> lower(COALESCE(v_user_email, '')) THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Bu kod yalnızca belirtilen e-posta adresi için tanımlanmıştır.'
    );
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.access_code_redemptions AS r
    WHERE r.code_id = v_code.id
      AND r.invitation_id = p_invitation_id
  ) THEN
    RETURN jsonb_build_object('success', false, 'message', 'Bu kod bu etkinlik için daha önce kullanılmış.');
  END IF;

  IF NOT v_code.is_owner_code AND v_code.used_count >= v_code.max_uses THEN
    RETURN jsonb_build_object('success', false, 'message', 'Bu kodun kullanım limiti dolmuştur.');
  END IF;

  INSERT INTO public.access_code_redemptions (
    code_id,
    user_id,
    invitation_id,
    redeemed_at,
    user_agent
  ) VALUES (
    v_code.id,
    v_user_id,
    p_invitation_id,
    v_now,
    left(p_user_agent, 1000)
  );

  UPDATE public.access_codes
  SET used_count = used_count + 1,
      updated_at = v_now
  WHERE id = v_code.id;

  UPDATE public.invitations
  SET is_paid = true,
      package_type = COALESCE(v_code.package_type, 'all_in_one'),
      is_published = true,
      published_at = COALESCE(published_at, v_now),
      qr_closing_at = COALESCE(v_invitation.event_date::TIMESTAMPTZ, v_now) + interval '5 days',
      retention_expires_at = COALESCE(v_invitation.event_date::TIMESTAMPTZ, v_now) + interval '60 days',
      invitation_expires_at = COALESCE(v_invitation.event_date::TIMESTAMPTZ, v_now) + interval '1 year',
      updated_at = v_now
  WHERE id = p_invitation_id;

  RETURN jsonb_build_object(
    'success', true,
    'message', 'VIP / Promosyon kodu başarıyla uygulandı! Etkinliğiniz ve tüm özellikler aktif edildi.',
    'packageType', v_code.package_type
  );
END;
$$;

REVOKE ALL ON FUNCTION public.redeem_access_code_atomic(TEXT, UUID, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.redeem_access_code_atomic(TEXT, UUID, TEXT) TO authenticated, service_role;

COMMENT ON FUNCTION public.redeem_access_code_atomic(TEXT, UUID, TEXT) IS
  'Atomically validates and redeems an access code for the authenticated owner invitation.';
