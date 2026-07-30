INSERT INTO public.packages (name, price, features, limits, storage, retention, is_active)
VALUES
  (
    'QR Memories', 299,
    '{"qr_gallery": true, "digital_invitation": false, "music": false, "timeline": false, "story": false, "gallery": true, "guestbook": false, "rsvp": false}',
    '{"photoLimit": 1000, "videoLimit": 50}', '{"maxGb": 5}', '{"days": 30}', true
  ),
  (
    'Digital Invitation', 499,
    '{"qr_gallery": false, "digital_invitation": true, "music": true, "timeline": true, "story": true, "gallery": true, "guestbook": true, "rsvp": true}',
    '{"photoLimit": 500, "videoLimit": 10}', '{"maxGb": 2}', '{"days": 60}', true
  ),
  (
    'Premium Experience', 1499,
    '{"qr_gallery": true, "digital_invitation": true, "music": true, "timeline": true, "story": true, "gallery": true, "guestbook": true, "rsvp": true}',
    '{"photoLimit": 5000, "videoLimit": 500}', '{"maxGb": 20}', '{"days": 90}', true
  )
ON CONFLICT (name) DO UPDATE SET
  price = EXCLUDED.price,
  features = EXCLUDED.features,
  limits = EXCLUDED.limits,
  storage = EXCLUDED.storage,
  retention = EXCLUDED.retention,
  is_active = EXCLUDED.is_active,
  deleted_at = NULL;
