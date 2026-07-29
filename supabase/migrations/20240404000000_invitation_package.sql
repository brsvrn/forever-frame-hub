-- Sprint 5.3: Add package_id to invitations

ALTER TABLE public.invitations
ADD COLUMN IF NOT EXISTS package_id UUID REFERENCES public.packages(id);

-- Optional: If we want a default package for legacy data, we can set it to a Premium package
-- UPDATE public.invitations SET package_id = (SELECT id FROM public.packages WHERE name = 'Premium Experience' LIMIT 1) WHERE package_id IS NULL;
