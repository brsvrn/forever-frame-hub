-- System Settings Migration

CREATE TABLE IF NOT EXISTS public.system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    maintenance_mode BOOLEAN DEFAULT false,
    allow_new_registrations BOOLEAN DEFAULT true,
    default_package_id UUID REFERENCES public.packages(id) ON DELETE SET NULL,
    max_upload_size_mb INT DEFAULT 100,
    support_email TEXT DEFAULT 'support@memorywedding.com',
    updated_at TIMESTAMPTZ DEFAULT now(),
    updated_by TEXT -- Admin email
);

-- Varsayılan tek bir satır ekleyelim (singleton pattern)
INSERT INTO public.system_settings (maintenance_mode) 
SELECT false 
WHERE NOT EXISTS (SELECT 1 FROM public.system_settings);

-- RLS
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view system settings" ON public.system_settings FOR SELECT USING (true);
CREATE POLICY "Admins can update system settings" ON public.system_settings FOR UPDATE USING (true); -- Demo amaçlı true
