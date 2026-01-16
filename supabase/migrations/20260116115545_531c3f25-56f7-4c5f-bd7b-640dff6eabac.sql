-- Create role enum for user types
CREATE TYPE public.app_role AS ENUM ('guardian', 'senior');

-- Create user roles table (security best practice - roles in separate table)
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create profiles table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    language TEXT DEFAULT 'hinglish',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create seniors table
CREATE TABLE public.seniors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    name TEXT NOT NULL,
    photo_url TEXT,
    language TEXT DEFAULT 'hinglish',
    chronic_conditions TEXT[],
    nudge_frequency TEXT DEFAULT 'medium',
    emergency_contacts JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create guardian-senior relationship table
CREATE TABLE public.guardian_senior_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    guardian_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    senior_id UUID REFERENCES public.seniors(id) ON DELETE CASCADE NOT NULL,
    relationship TEXT DEFAULT 'family',
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (guardian_id, senior_id)
);

-- Create medications table
CREATE TABLE public.medications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    senior_id UUID REFERENCES public.seniors(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    dosage TEXT NOT NULL,
    frequency TEXT NOT NULL,
    times JSONB NOT NULL DEFAULT '[]'::jsonb,
    pill_image_url TEXT,
    prescription_image_url TEXT,
    instructions TEXT,
    color TEXT,
    shape TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create activity logs table
CREATE TABLE public.activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    senior_id UUID REFERENCES public.seniors(id) ON DELETE CASCADE NOT NULL,
    activity_type TEXT NOT NULL,
    activity_data JSONB DEFAULT '{}'::jsonb,
    logged_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create medication logs table
CREATE TABLE public.medication_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    medication_id UUID REFERENCES public.medications(id) ON DELETE CASCADE NOT NULL,
    senior_id UUID REFERENCES public.seniors(id) ON DELETE CASCADE NOT NULL,
    scheduled_time TIMESTAMP WITH TIME ZONE NOT NULL,
    taken_at TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'pending',
    snoozed_until TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create health vitals table
CREATE TABLE public.health_vitals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    senior_id UUID REFERENCES public.seniors(id) ON DELETE CASCADE NOT NULL,
    vital_type TEXT NOT NULL,
    value DECIMAL NOT NULL,
    unit TEXT NOT NULL,
    notes TEXT,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create joy preferences table
CREATE TABLE public.joy_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    senior_id UUID REFERENCES public.seniors(id) ON DELETE CASCADE NOT NULL UNIQUE,
    suno_config JSONB DEFAULT '{"enabled": true, "type": "bhajans"}'::jsonb,
    dekho_config JSONB DEFAULT '{"enabled": true, "channel_url": ""}'::jsonb,
    yaadein_config JSONB DEFAULT '{"enabled": true, "album_url": ""}'::jsonb,
    khel_config JSONB DEFAULT '{"enabled": true}'::jsonb,
    ai_suggestions_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create family members table for quick calling
CREATE TABLE public.family_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    senior_id UUID REFERENCES public.seniors(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    relationship TEXT NOT NULL,
    phone TEXT NOT NULL,
    photo_url TEXT,
    is_emergency_contact BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notifications table
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    senior_id UUID REFERENCES public.seniors(id) ON DELETE CASCADE,
    guardian_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    urgency_level INTEGER DEFAULT 4,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seniors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guardian_senior_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medication_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_vitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.joy_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is guardian of a senior
CREATE OR REPLACE FUNCTION public.is_guardian_of(_user_id UUID, _senior_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.guardian_senior_links
    WHERE guardian_id = _user_id
      AND senior_id = _senior_id
  )
$$;

-- Helper function to get senior_id for a user (if they are a senior)
CREATE OR REPLACE FUNCTION public.get_senior_id_for_user(_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.seniors WHERE user_id = _user_id LIMIT 1
$$;

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for seniors
CREATE POLICY "Seniors can view their own record"
ON public.seniors FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Guardians can view their linked seniors"
ON public.seniors FOR SELECT
TO authenticated
USING (public.is_guardian_of(auth.uid(), id));

CREATE POLICY "Guardians can insert seniors"
ON public.seniors FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'guardian'));

CREATE POLICY "Guardians can update their linked seniors"
ON public.seniors FOR UPDATE
TO authenticated
USING (public.is_guardian_of(auth.uid(), id));

-- RLS Policies for guardian_senior_links
CREATE POLICY "Guardians can view their links"
ON public.guardian_senior_links FOR SELECT
TO authenticated
USING (guardian_id = auth.uid());

CREATE POLICY "Guardians can create links"
ON public.guardian_senior_links FOR INSERT
TO authenticated
WITH CHECK (guardian_id = auth.uid() AND public.has_role(auth.uid(), 'guardian'));

-- RLS Policies for medications
CREATE POLICY "Seniors can view their medications"
ON public.medications FOR SELECT
TO authenticated
USING (senior_id = public.get_senior_id_for_user(auth.uid()));

CREATE POLICY "Guardians can view their senior's medications"
ON public.medications FOR SELECT
TO authenticated
USING (public.is_guardian_of(auth.uid(), senior_id));

CREATE POLICY "Guardians can manage medications"
ON public.medications FOR ALL
TO authenticated
USING (public.is_guardian_of(auth.uid(), senior_id));

-- RLS Policies for activity_logs
CREATE POLICY "Seniors can insert their own logs"
ON public.activity_logs FOR INSERT
TO authenticated
WITH CHECK (senior_id = public.get_senior_id_for_user(auth.uid()));

CREATE POLICY "Seniors can view their own logs"
ON public.activity_logs FOR SELECT
TO authenticated
USING (senior_id = public.get_senior_id_for_user(auth.uid()));

CREATE POLICY "Guardians can view their senior's logs"
ON public.activity_logs FOR SELECT
TO authenticated
USING (public.is_guardian_of(auth.uid(), senior_id));

-- RLS Policies for medication_logs
CREATE POLICY "Seniors can manage their medication logs"
ON public.medication_logs FOR ALL
TO authenticated
USING (senior_id = public.get_senior_id_for_user(auth.uid()));

CREATE POLICY "Guardians can view their senior's medication logs"
ON public.medication_logs FOR SELECT
TO authenticated
USING (public.is_guardian_of(auth.uid(), senior_id));

-- RLS Policies for health_vitals
CREATE POLICY "Seniors can manage their vitals"
ON public.health_vitals FOR ALL
TO authenticated
USING (senior_id = public.get_senior_id_for_user(auth.uid()));

CREATE POLICY "Guardians can view their senior's vitals"
ON public.health_vitals FOR SELECT
TO authenticated
USING (public.is_guardian_of(auth.uid(), senior_id));

-- RLS Policies for joy_preferences
CREATE POLICY "Seniors can view their preferences"
ON public.joy_preferences FOR SELECT
TO authenticated
USING (senior_id = public.get_senior_id_for_user(auth.uid()));

CREATE POLICY "Guardians can manage their senior's preferences"
ON public.joy_preferences FOR ALL
TO authenticated
USING (public.is_guardian_of(auth.uid(), senior_id));

-- RLS Policies for family_members
CREATE POLICY "Seniors can view their family"
ON public.family_members FOR SELECT
TO authenticated
USING (senior_id = public.get_senior_id_for_user(auth.uid()));

CREATE POLICY "Guardians can manage family members"
ON public.family_members FOR ALL
TO authenticated
USING (public.is_guardian_of(auth.uid(), senior_id));

-- RLS Policies for notifications
CREATE POLICY "Users can view their notifications"
ON public.notifications FOR SELECT
TO authenticated
USING (guardian_id = auth.uid() OR senior_id = public.get_senior_id_for_user(auth.uid()));

CREATE POLICY "System can create notifications"
ON public.notifications FOR INSERT
TO authenticated
WITH CHECK (true);

-- Create trigger for updating timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER update_seniors_updated_at BEFORE UPDATE ON public.seniors FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER update_medications_updated_at BEFORE UPDATE ON public.medications FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER update_joy_preferences_updated_at BEFORE UPDATE ON public.joy_preferences FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Create storage bucket for medicine images
INSERT INTO storage.buckets (id, name, public) VALUES ('medicine-images', 'medicine-images', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('family-photos', 'family-photos', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('senior-photos', 'senior-photos', true);

-- Storage policies for medicine-images
CREATE POLICY "Authenticated users can upload medicine images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'medicine-images');

CREATE POLICY "Medicine images are publicly viewable"
ON storage.objects FOR SELECT
USING (bucket_id = 'medicine-images');

CREATE POLICY "Users can update their medicine images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'medicine-images');

-- Storage policies for family-photos
CREATE POLICY "Authenticated users can upload family photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'family-photos');

CREATE POLICY "Family photos are publicly viewable"
ON storage.objects FOR SELECT
USING (bucket_id = 'family-photos');

-- Storage policies for senior-photos
CREATE POLICY "Authenticated users can upload senior photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'senior-photos');

CREATE POLICY "Senior photos are publicly viewable"
ON storage.objects FOR SELECT
USING (bucket_id = 'senior-photos');

-- Enable realtime for activity logs
ALTER PUBLICATION supabase_realtime ADD TABLE public.activity_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.medication_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;