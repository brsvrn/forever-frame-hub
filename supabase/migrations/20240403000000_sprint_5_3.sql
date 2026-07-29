-- Sprint 5.3: Productization Expansion Migration

-- 1. Paketler tablosunu JSONB alanlarla genişletme
ALTER TABLE public.packages 
  DROP COLUMN IF EXISTS feature_flags,
  DROP COLUMN IF EXISTS storage_limit,
  ADD COLUMN IF NOT EXISTS features JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS limits JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS storage JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS retention JSONB DEFAULT '{}';

-- Mevcut paketleri temizleyip (isteğe bağlı, demo olduğu için) 3 Ana paketi ekliyoruz.
-- Not: Gerçek sistemde silinmez, soft delete yapılır. Ancak bu seed amaçlı olduğu için arşivliyoruz.
UPDATE public.packages SET is_active = false, deleted_at = now() WHERE is_active = true;

-- "QR Memories" Paketi
INSERT INTO public.packages (name, price, features, limits, storage, retention, is_active)
VALUES (
  'QR Memories',
  299,
  '{"qr_gallery": true, "digital_invitation": false, "music": false, "timeline": false, "story": false, "gallery": true, "guestbook": false, "rsvp": false}',
  '{"photoLimit": 1000, "videoLimit": 50}',
  '{"maxGb": 5}',
  '{"days": 30}',
  true
);

-- "Digital Invitation" Paketi
INSERT INTO public.packages (name, price, features, limits, storage, retention, is_active)
VALUES (
  'Digital Invitation',
  499,
  '{"qr_gallery": false, "digital_invitation": true, "music": true, "timeline": true, "story": true, "gallery": true, "guestbook": true, "rsvp": true}',
  '{"photoLimit": 500, "videoLimit": 10}',
  '{"maxGb": 2}',
  '{"days": 60}',
  true
);

-- "Premium Experience" Paketi
INSERT INTO public.packages (name, price, features, limits, storage, retention, is_active)
VALUES (
  'Premium Experience',
  1499,
  '{"qr_gallery": true, "digital_invitation": true, "music": true, "timeline": true, "story": true, "gallery": true, "guestbook": true, "rsvp": true}',
  '{"photoLimit": 5000, "videoLimit": 500}',
  '{"maxGb": 20}',
  '{"days": 90}',
  true
);
