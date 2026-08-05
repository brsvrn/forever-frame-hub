-- ==============================================================================
-- MemoryWedding Super Admin Panel Migration
-- ==============================================================================

-- 1. Invitations Extensions for Retention, Soft-Delete and Lifecycle
ALTER TABLE public.invitations
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS qr_closing_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS retention_expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS invitation_expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS admin_notes TEXT;

CREATE INDEX IF NOT EXISTS idx_invitations_deleted_at ON public.invitations(deleted_at);
CREATE INDEX IF NOT EXISTS idx_invitations_lifecycle_status ON public.invitations(lifecycle_status);
CREATE INDEX IF NOT EXISTS idx_invitations_created_at ON public.invitations(created_at DESC);

-- 2. Transactions Extensions for Order Management
ALTER TABLE public.transactions
  ADD COLUMN IF NOT EXISTS refund_status TEXT DEFAULT 'none' CHECK (refund_status IN ('none', 'requested', 'under_review', 'externally_refunded')),
  ADD COLUMN IF NOT EXISTS admin_notes TEXT;

CREATE INDEX IF NOT EXISTS idx_transactions_refund_status ON public.transactions(refund_status);

-- 3. System Settings Extensions
ALTER TABLE public.system_settings
  ADD COLUMN IF NOT EXISTS support_phone TEXT DEFAULT '0530 381 1155',
  ADD COLUMN IF NOT EXISTS whatsapp_number TEXT DEFAULT '0530 381 1155',
  ADD COLUMN IF NOT EXISTS working_hours TEXT DEFAULT 'Hafta içi: 09:00 - 18:00',
  ADD COLUMN IF NOT EXISTS default_timezone TEXT DEFAULT 'Europe/Istanbul',
  ADD COLUMN IF NOT EXISTS default_invitation_days INTEGER DEFAULT 365,
  ADD COLUMN IF NOT EXISTS default_qr_days INTEGER DEFAULT 5,
  ADD COLUMN IF NOT EXISTS default_retention_days INTEGER DEFAULT 60,
  ADD COLUMN IF NOT EXISTS allow_code_creation BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS allow_payment_creation BOOLEAN DEFAULT true;

-- 4. Access Codes Table
CREATE TABLE IF NOT EXISTS public.access_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code_hash TEXT NOT NULL UNIQUE,
  code_label TEXT NOT NULL,
  code_prefix TEXT,
  code_type TEXT NOT NULL CHECK (code_type IN ('owner', 'single_use', 'multi_use', 'timed', 'user_specific')),
  package_type TEXT NOT NULL DEFAULT 'all_in_one',
  package_id UUID REFERENCES public.packages(id) ON DELETE SET NULL,
  max_uses INTEGER NOT NULL DEFAULT 1,
  used_count INTEGER NOT NULL DEFAULT 0,
  starts_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  restricted_user_email TEXT,
  restricted_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_owner_code BOOLEAN NOT NULL DEFAULT false,
  is_test_code BOOLEAN NOT NULL DEFAULT false,
  admin_notes TEXT,
  created_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_access_codes_code_hash ON public.access_codes(code_hash);
CREATE INDEX IF NOT EXISTS idx_access_codes_is_active ON public.access_codes(is_active);

-- 5. Access Code Redemptions Table
CREATE TABLE IF NOT EXISTS public.access_code_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code_id UUID NOT NULL REFERENCES public.access_codes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invitation_id UUID REFERENCES public.invitations(id) ON DELETE SET NULL,
  redeemed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ip_address TEXT,
  user_agent TEXT
);

CREATE INDEX IF NOT EXISTS idx_code_redemptions_code_id ON public.access_code_redemptions(code_id);
CREATE INDEX IF NOT EXISTS idx_code_redemptions_user_id ON public.access_code_redemptions(user_id);

-- 6. Support Tickets Table
CREATE TABLE IF NOT EXISTS public.support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  invitation_id UUID REFERENCES public.invitations(id) ON DELETE SET NULL,
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'waiting_user', 'resolved', 'closed')),
  admin_notes TEXT,
  last_responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON public.support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_created_at ON public.support_tickets(created_at DESC);

-- 7. Retention Jobs Table
CREATE TABLE IF NOT EXISTS public.retention_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_type TEXT NOT NULL CHECK (job_type IN ('close_qr_upload', 'retention_warning', 'delete_expired_media', 'expire_invitation', 'expire_codes')),
  invitation_id UUID REFERENCES public.invitations(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  files_count INTEGER DEFAULT 0,
  bytes_freed BIGINT DEFAULT 0,
  error_message TEXT,
  executed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_retention_jobs_status ON public.retention_jobs(status);

-- 8. Row Level Security for New Tables
ALTER TABLE public.access_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.access_code_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.retention_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY access_codes_admin_all ON public.access_codes FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY access_code_redemptions_admin_all ON public.access_code_redemptions FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY support_tickets_public_insert ON public.support_tickets FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY support_tickets_admin_all ON public.support_tickets FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY retention_jobs_admin_all ON public.retention_jobs FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY transactions_admin_all ON public.transactions FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 9. Atomic Code Redemption Function
CREATE OR REPLACE FUNCTION public.redeem_access_code_atomic(
  p_code_hash TEXT,
  p_user_id UUID,
  p_invitation_id UUID,
  p_ip TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_code RECORD;
  v_now TIMESTAMPTZ := now();
  v_user_email TEXT;
BEGIN
  -- Get user email
  SELECT email INTO v_user_email FROM auth.users WHERE id = p_user_id;

  -- Lock the code row for atomic update
  SELECT * INTO v_code
  FROM public.access_codes
  WHERE code_hash = p_code_hash
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Geçersiz veya bulunamayan kullanım kodu.');
  END IF;

  IF NOT v_code.is_active THEN
    RETURN jsonb_build_object('success', false, 'error', 'Bu kullanım kodu pasif durumdadır.');
  END IF;

  IF v_code.starts_at IS NOT NULL AND v_now < v_code.starts_at THEN
    RETURN jsonb_build_object('success', false, 'error', 'Bu kod henüz kullanıma açılmamıştır.');
  END IF;

  IF v_code.expires_at IS NOT NULL AND v_now > v_code.expires_at THEN
    RETURN jsonb_build_object('success', false, 'error', 'Bu kodun kullanım süresi dolmuştur.');
  END IF;

  -- If not an owner code (which has unlimited uses), check usage limit
  IF NOT v_code.is_owner_code AND v_code.used_count >= v_code.max_uses THEN
    RETURN jsonb_build_object('success', false, 'error', 'Bu kodun kullanım limiti dolmuştur.');
  END IF;

  -- User restriction check
  IF v_code.restricted_user_id IS NOT NULL AND v_code.restricted_user_id <> p_user_id THEN
    RETURN jsonb_build_object('success', false, 'error', 'Bu kod yalnızca tanımlı kullanıcı tarafından kullanılabilir.');
  END IF;

  IF v_code.restricted_user_email IS NOT NULL AND lower(v_code.restricted_user_email) <> lower(COALESCE(v_user_email, '')) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Bu kod bu e-posta adresi için geçerli değildir.');
  END IF;

  -- Increment use count
  UPDATE public.access_codes
  SET used_count = used_count + 1,
      updated_at = v_now
  WHERE id = v_code.id;

  -- Insert redemption log
  INSERT INTO public.access_code_redemptions (
    code_id,
    user_id,
    invitation_id,
    redeemed_at,
    ip_address,
    user_agent
  ) VALUES (
    v_code.id,
    p_user_id,
    p_invitation_id,
    v_now,
    p_ip,
    p_user_agent
  );

  -- If invitation_id provided, mark as paid
  IF p_invitation_id IS NOT NULL THEN
    UPDATE public.invitations
    SET is_paid = true,
        package_type = v_code.package_type,
        updated_at = v_now
    WHERE id = p_invitation_id;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'code_id', v_code.id,
    'package_type', v_code.package_type,
    'is_owner_code', v_code.is_owner_code
  );
END;
$$;
