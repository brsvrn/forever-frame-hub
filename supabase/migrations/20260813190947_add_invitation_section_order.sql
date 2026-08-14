ALTER TABLE public.event_feature_settings
  ADD COLUMN IF NOT EXISTS section_order TEXT[] NOT NULL DEFAULT ARRAY[
    'audio_greeting',
    'story',
    'gallery',
    'countdown',
    'schedule',
    'rsvp',
    'memory_box',
    'qr_upload',
    'gift'
  ]::TEXT[];

ALTER TABLE public.event_feature_settings
  DROP CONSTRAINT IF EXISTS event_feature_settings_section_order_check;

ALTER TABLE public.event_feature_settings
  ADD CONSTRAINT event_feature_settings_section_order_check CHECK (
    cardinality(section_order) = 9
    AND section_order <@ ARRAY[
      'audio_greeting', 'story', 'gallery', 'countdown', 'schedule',
      'rsvp', 'memory_box', 'qr_upload', 'gift'
    ]::TEXT[]
    AND ARRAY[
      'audio_greeting', 'story', 'gallery', 'countdown', 'schedule',
      'rsvp', 'memory_box', 'qr_upload', 'gift'
    ]::TEXT[] <@ section_order
  );
