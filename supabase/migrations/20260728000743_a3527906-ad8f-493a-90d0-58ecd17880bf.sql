-- Roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');
CREATE TYPE public.event_type AS ENUM ('wedding', 'engagement', 'henna', 'birthday', 'other');
CREATE TYPE public.rsvp_status AS ENUM ('yes', 'no', 'maybe');

-- updated_at helper
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_roles_select_own" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

-- New user bootstrap
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name'),
    NEW.raw_user_meta_data ->> 'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user')
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Invitations
CREATE TABLE public.invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  slug TEXT NOT NULL UNIQUE,
  event_type public.event_type NOT NULL DEFAULT 'wedding',
  theme TEXT NOT NULL DEFAULT 'midnight',
  partner_one TEXT NOT NULL DEFAULT '',
  partner_two TEXT NOT NULL DEFAULT '',
  headline TEXT NOT NULL DEFAULT '',
  message TEXT NOT NULL DEFAULT '',
  event_date DATE,
  event_time TEXT,
  venue TEXT NOT NULL DEFAULT '',
  address TEXT NOT NULL DEFAULT '',
  city TEXT NOT NULL DEFAULT '',
  rsvp_label TEXT NOT NULL DEFAULT '',
  is_published BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX invitations_user_id_idx ON public.invitations (user_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.invitations TO authenticated;
GRANT SELECT ON public.invitations TO anon;
GRANT ALL ON public.invitations TO service_role;
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "invitations_owner_all" ON public.invitations FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "invitations_public_read" ON public.invitations FOR SELECT TO anon, authenticated USING (is_published = true);
CREATE TRIGGER invitations_updated_at BEFORE UPDATE ON public.invitations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RSVPs
CREATE TABLE public.rsvps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invitation_id UUID NOT NULL REFERENCES public.invitations(id) ON DELETE CASCADE,
  guest_name TEXT NOT NULL,
  guest_email TEXT,
  guest_phone TEXT,
  status public.rsvp_status NOT NULL DEFAULT 'yes',
  party_size INTEGER NOT NULL DEFAULT 1,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX rsvps_invitation_id_idx ON public.rsvps (invitation_id);
GRANT SELECT, UPDATE, DELETE ON public.rsvps TO authenticated;
GRANT INSERT ON public.rsvps TO anon, authenticated;
GRANT ALL ON public.rsvps TO service_role;
ALTER TABLE public.rsvps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rsvps_insert_public" ON public.rsvps FOR INSERT TO anon, authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.invitations i WHERE i.id = invitation_id AND i.is_published = true));
CREATE POLICY "rsvps_owner_select" ON public.rsvps FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.invitations i WHERE i.id = invitation_id AND i.user_id = auth.uid()));
CREATE POLICY "rsvps_owner_delete" ON public.rsvps FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.invitations i WHERE i.id = invitation_id AND i.user_id = auth.uid()));