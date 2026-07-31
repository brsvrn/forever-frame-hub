
-- Add package_type and is_paid to invitations
ALTER TABLE public.invitations ADD COLUMN IF NOT EXISTS package_type TEXT DEFAULT 'standard';
ALTER TABLE public.invitations ADD COLUMN IF NOT EXISTS is_paid BOOLEAN DEFAULT false;

-- Grandfather in existing invitations (so they don't get 404'd)
UPDATE public.invitations SET is_paid = true;

-- Create transactions table
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    invitation_id UUID REFERENCES public.invitations(id) ON DELETE SET NULL,
    amount INTEGER NOT NULL, -- in kuruş (e.g. 100 = 1 TL)
    status TEXT NOT NULL DEFAULT 'pending', -- pending, success, failed
    merchant_oid TEXT NOT NULL UNIQUE,
    package_type TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for transactions
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own transactions"
    ON public.transactions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage transactions"
    ON public.transactions FOR ALL
    USING (true)
    WITH CHECK (true);
