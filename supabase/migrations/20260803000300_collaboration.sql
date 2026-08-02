-- Atomic, single-use team invitation acceptance.

CREATE OR REPLACE FUNCTION public.accept_event_member_invitation(_token_hash TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  invitation_record public.event_member_invitations%ROWTYPE;
  current_user_email TEXT;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Oturum gerekli.';
  END IF;

  SELECT lower(email) INTO current_user_email
  FROM auth.users
  WHERE id = auth.uid();

  SELECT * INTO invitation_record
  FROM public.event_member_invitations
  WHERE token_hash = _token_hash
  FOR UPDATE;

  IF NOT FOUND THEN RAISE EXCEPTION 'Davet bulunamadı.'; END IF;
  IF invitation_record.revoked_at IS NOT NULL THEN RAISE EXCEPTION 'Davet iptal edilmiş.'; END IF;
  IF invitation_record.accepted_at IS NOT NULL THEN RAISE EXCEPTION 'Davet daha önce kullanılmış.'; END IF;
  IF invitation_record.expires_at <= now() THEN RAISE EXCEPTION 'Davet süresi dolmuş.'; END IF;
  IF current_user_email IS NULL OR current_user_email <> lower(invitation_record.invited_email) THEN
    RAISE EXCEPTION 'Bu davet farklı bir e-posta adresine gönderilmiş.';
  END IF;

  INSERT INTO public.event_members (
    invitation_id, user_id, role, extra_permissions, invited_by
  ) VALUES (
    invitation_record.invitation_id,
    auth.uid(),
    invitation_record.role,
    invitation_record.extra_permissions,
    invitation_record.created_by
  )
  ON CONFLICT (invitation_id, user_id) DO UPDATE
  SET role = EXCLUDED.role,
      extra_permissions = EXCLUDED.extra_permissions,
      invited_by = EXCLUDED.invited_by,
      joined_at = now(),
      updated_at = now()
  WHERE public.event_members.role <> 'owner';

  UPDATE public.event_member_invitations
  SET accepted_at = now(), accepted_by = auth.uid()
  WHERE id = invitation_record.id
    AND accepted_at IS NULL
    AND revoked_at IS NULL;

  IF NOT FOUND THEN RAISE EXCEPTION 'Davet artık geçerli değil.'; END IF;

  INSERT INTO public.event_activity_logs (
    invitation_id, actor_user_id, action, target_type, changed_fields, metadata
  ) VALUES (
    invitation_record.invitation_id,
    auth.uid(),
    'team.invitation_accepted',
    'event_members',
    '[]'::jsonb,
    jsonb_build_object('role', invitation_record.role)
  );

  RETURN invitation_record.invitation_id;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.accept_event_member_invitation(TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.accept_event_member_invitation(TEXT) TO authenticated, service_role;
