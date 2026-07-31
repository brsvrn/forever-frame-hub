-- Eski paketleri güncelle
UPDATE public.packages 
SET name = 'digital_only', 
    price = 500, 
    features = '{"qr_gallery": false, "digital_invitation": true, "music": true, "timeline": true, "story": true, "gallery": true, "guestbook": true, "rsvp": true}'::jsonb
WHERE name = 'Digital Invitation' OR name = 'Standard';

UPDATE public.packages 
SET name = 'qr_only', 
    price = 750, 
    features = '{"qr_gallery": true, "digital_invitation": false, "music": false, "timeline": false, "story": false, "gallery": true, "guestbook": false, "rsvp": false}'::jsonb
WHERE name = 'QR Memories';

UPDATE public.packages 
SET name = 'full', 
    price = 1000, 
    features = '{"qr_gallery": true, "digital_invitation": true, "music": true, "timeline": true, "story": true, "gallery": true, "guestbook": true, "rsvp": true}'::jsonb
WHERE name = 'Premium Experience' OR name = 'Premium';

-- Eğer hala eksik varsa (yeni kurulumsa) Insert yap:
INSERT INTO public.packages (name, price, features, limits, storage, retention, is_active)
SELECT 'digital_only', 500, '{"qr_gallery": false, "digital_invitation": true, "music": true, "timeline": true, "story": true, "gallery": true, "guestbook": true, "rsvp": true}', '{"photoLimit": 500, "videoLimit": 10}', '{"maxGb": 2}', '{"days": 60}', true
WHERE NOT EXISTS (SELECT 1 FROM public.packages WHERE name = 'digital_only');

INSERT INTO public.packages (name, price, features, limits, storage, retention, is_active)
SELECT 'qr_only', 750, '{"qr_gallery": true, "digital_invitation": false, "music": false, "timeline": false, "story": false, "gallery": true, "guestbook": false, "rsvp": false}', '{"photoLimit": 1000, "videoLimit": 50}', '{"maxGb": 5}', '{"days": 30}', true
WHERE NOT EXISTS (SELECT 1 FROM public.packages WHERE name = 'qr_only');

INSERT INTO public.packages (name, price, features, limits, storage, retention, is_active)
SELECT 'full', 1000, '{"qr_gallery": true, "digital_invitation": true, "music": true, "timeline": true, "story": true, "gallery": true, "guestbook": true, "rsvp": true}', '{"photoLimit": 5000, "videoLimit": 500}', '{"maxGb": 20}', '{"days": 90}', true
WHERE NOT EXISTS (SELECT 1 FROM public.packages WHERE name = 'full');
