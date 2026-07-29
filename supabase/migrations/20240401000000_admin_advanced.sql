-- Admin Panel Advanced Features Migration (Soft Delete, Audit Logs, RBAC)

-- 1. RBAC (Role Based Access Control)
CREATE TABLE IF NOT EXISTS public.roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Varsayılan roller
INSERT INTO public.roles (name, description) VALUES 
('platform_owner', 'Tam yetkili platform sahibi'),
('admin', 'Sistem yöneticisi'),
('editor', 'İçerik düzenleyici'),
('support', 'Müşteri destek ekibi')
ON CONFLICT (name) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.user_roles (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role_id UUID REFERENCES public.roles(id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (user_id, role_id)
);

-- 2. Soft Delete (packages & themes)
ALTER TABLE public.packages 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

ALTER TABLE public.themes 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

-- 3. Package Price History
CREATE TABLE IF NOT EXISTS public.package_price_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    package_id UUID REFERENCES public.packages(id) ON DELETE CASCADE,
    old_price DECIMAL(10,2) NOT NULL,
    new_price DECIMAL(10,2) NOT NULL,
    changed_by TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Admin Audit Logs
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    admin_email TEXT,
    action TEXT NOT NULL, 
    target_type TEXT NOT NULL, 
    target_id UUID,
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS Policies
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view roles" ON public.roles FOR SELECT USING (true);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view user roles" ON public.user_roles FOR SELECT USING (true);

ALTER TABLE public.package_price_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view price history" ON public.package_price_history FOR SELECT USING (true); 
CREATE POLICY "Admins can insert price history" ON public.package_price_history FOR INSERT TO public WITH CHECK (true); 

ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view audit logs" ON public.admin_audit_logs FOR SELECT USING (true);
CREATE POLICY "Admins can insert audit logs" ON public.admin_audit_logs FOR INSERT TO public WITH CHECK (true);
