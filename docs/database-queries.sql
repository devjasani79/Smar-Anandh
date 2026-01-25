-- ============================================
-- SmarAnandh Database Queries Reference
-- Complete SQL reference for all operations
-- ============================================

-- ============================================
-- SECTION 1: TABLE CREATION & SCHEMA
-- ============================================

-- Note: These tables already exist. This is for reference only.

-- profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT UNIQUE,
  avatar_url TEXT,
  language TEXT DEFAULT 'hinglish',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- user_roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  UNIQUE(user_id, role)
);

-- seniors table
CREATE TABLE IF NOT EXISTS public.seniors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  preferred_name TEXT,
  photo_url TEXT,
  language TEXT DEFAULT 'hinglish',
  family_pin TEXT, -- 4-digit PIN for dual-key auth
  guardian_email TEXT,
  chronic_conditions TEXT[],
  nudge_frequency TEXT DEFAULT 'medium',
  emergency_contacts JSONB DEFAULT '[]',
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- guardian_senior_links table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS public.guardian_senior_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  guardian_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  senior_id UUID NOT NULL REFERENCES public.seniors(id) ON DELETE CASCADE,
  relationship TEXT DEFAULT 'family',
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(guardian_id, senior_id)
);

-- medications table
CREATE TABLE IF NOT EXISTS public.medications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  senior_id UUID NOT NULL REFERENCES public.seniors(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  dosage TEXT NOT NULL,
  frequency TEXT NOT NULL,
  times JSONB NOT NULL DEFAULT '[]',
  instructions TEXT,
  pill_image_url TEXT,
  prescription_image_url TEXT,
  color TEXT,
  shape TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- medication_logs table
CREATE TABLE IF NOT EXISTS public.medication_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  medication_id UUID NOT NULL REFERENCES public.medications(id) ON DELETE CASCADE,
  senior_id UUID NOT NULL REFERENCES public.seniors(id) ON DELETE CASCADE,
  scheduled_time TIMESTAMPTZ NOT NULL,
  taken_at TIMESTAMPTZ,
  status TEXT DEFAULT 'pending', -- pending, taken, missed, snoozed
  snoozed_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- activity_logs table
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  senior_id UUID NOT NULL REFERENCES public.seniors(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  activity_data JSONB DEFAULT '{}',
  logged_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- joy_preferences table
CREATE TABLE IF NOT EXISTS public.joy_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  senior_id UUID NOT NULL UNIQUE REFERENCES public.seniors(id) ON DELETE CASCADE,
  suno_config JSONB DEFAULT '{"enabled": true, "type": "bhajans"}',
  dekho_config JSONB DEFAULT '{"enabled": true, "channel_url": ""}',
  yaadein_config JSONB DEFAULT '{"enabled": true, "album_url": ""}',
  khel_config JSONB DEFAULT '{"enabled": true}',
  ai_suggestions_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- health_vitals table
CREATE TABLE IF NOT EXISTS public.health_vitals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  senior_id UUID NOT NULL REFERENCES public.seniors(id) ON DELETE CASCADE,
  vital_type TEXT NOT NULL, -- blood_pressure, heart_rate, blood_sugar, weight, temperature
  value NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  notes TEXT,
  recorded_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- family_members table
CREATE TABLE IF NOT EXISTS public.family_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  senior_id UUID NOT NULL REFERENCES public.seniors(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  relationship TEXT NOT NULL,
  photo_url TEXT,
  is_emergency_contact BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  senior_id UUID REFERENCES public.seniors(id) ON DELETE CASCADE,
  guardian_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  urgency_level INTEGER DEFAULT 4, -- 1=critical, 2=high, 3=medium, 4=low
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);


-- ============================================
-- SECTION 2: DATABASE FUNCTIONS (RPCs)
-- ============================================

-- Get all seniors linked to a guardian
CREATE OR REPLACE FUNCTION public.get_guardian_seniors(guardian_user_id UUID)
RETURNS TABLE (
  senior_id UUID,
  senior_name TEXT,
  preferred_name TEXT,
  photo_url TEXT,
  language TEXT,
  is_primary BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id as senior_id,
    s.name as senior_name,
    s.preferred_name,
    s.photo_url,
    s.language,
    gsl.is_primary
  FROM public.seniors s
  INNER JOIN public.guardian_senior_links gsl ON gsl.senior_id = s.id
  WHERE gsl.guardian_id = guardian_user_id;
END;
$$;

-- Validate family PIN with phone number (Dual-Key Auth)
CREATE OR REPLACE FUNCTION public.validate_family_pin_with_phone(guardian_phone TEXT, input_pin TEXT)
RETURNS TABLE (
  senior_id UUID,
  senior_name TEXT,
  preferred_name TEXT,
  photo_url TEXT,
  guardian_id UUID,
  senior_language TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id as senior_id,
    s.name as senior_name,
    s.preferred_name,
    s.photo_url,
    gsl.guardian_id,
    s.language as senior_language
  FROM public.seniors s
  INNER JOIN public.guardian_senior_links gsl ON gsl.senior_id = s.id AND gsl.is_primary = true
  INNER JOIN public.profiles p ON p.user_id = gsl.guardian_id
  WHERE s.family_pin = input_pin 
    AND p.phone = guardian_phone;
END;
$$;

-- Validate family PIN (without phone)
CREATE OR REPLACE FUNCTION public.validate_family_pin(input_pin TEXT)
RETURNS TABLE (
  senior_id UUID,
  senior_name TEXT,
  preferred_name TEXT,
  photo_url TEXT,
  guardian_id UUID
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id as senior_id,
    s.name as senior_name,
    s.preferred_name,
    s.photo_url,
    gsl.guardian_id
  FROM public.seniors s
  LEFT JOIN public.guardian_senior_links gsl ON gsl.senior_id = s.id AND gsl.is_primary = true
  WHERE s.family_pin = input_pin;
END;
$$;

-- Check if user has a specific role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Check if user is guardian of a senior
CREATE OR REPLACE FUNCTION public.is_guardian_of(_user_id UUID, _senior_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.guardian_senior_links
    WHERE guardian_id = _user_id
      AND senior_id = _senior_id
  )
$$;

-- Get senior ID for a user
CREATE OR REPLACE FUNCTION public.get_senior_id_for_user(_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT id FROM public.seniors WHERE user_id = _user_id LIMIT 1
$$;


-- ============================================
-- SECTION 3: ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seniors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guardian_senior_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medication_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.joy_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_vitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- user_roles policies
CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

-- seniors policies
CREATE POLICY "Guardians can insert seniors" ON public.seniors
  FOR INSERT WITH CHECK (has_role(auth.uid(), 'guardian'));
CREATE POLICY "Guardians can view their linked seniors" ON public.seniors
  FOR SELECT USING (is_guardian_of(auth.uid(), id));
CREATE POLICY "Guardians can update their linked seniors" ON public.seniors
  FOR UPDATE USING (is_guardian_of(auth.uid(), id));
CREATE POLICY "Seniors can view their own record" ON public.seniors
  FOR SELECT USING (user_id = auth.uid());

-- guardian_senior_links policies
CREATE POLICY "Guardians can create links" ON public.guardian_senior_links
  FOR INSERT WITH CHECK (guardian_id = auth.uid() AND has_role(auth.uid(), 'guardian'));
CREATE POLICY "Guardians can view their links" ON public.guardian_senior_links
  FOR SELECT USING (guardian_id = auth.uid());

-- medications policies
CREATE POLICY "Guardians can manage medications" ON public.medications
  FOR ALL USING (is_guardian_of(auth.uid(), senior_id));
CREATE POLICY "Seniors can view their medications" ON public.medications
  FOR SELECT USING (senior_id = get_senior_id_for_user(auth.uid()));

-- medication_logs policies
CREATE POLICY "Guardians can view their senior's medication logs" ON public.medication_logs
  FOR SELECT USING (is_guardian_of(auth.uid(), senior_id));
CREATE POLICY "Seniors can manage their medication logs" ON public.medication_logs
  FOR ALL USING (senior_id = get_senior_id_for_user(auth.uid()));

-- activity_logs policies
CREATE POLICY "Guardians can view their senior's logs" ON public.activity_logs
  FOR SELECT USING (is_guardian_of(auth.uid(), senior_id));
CREATE POLICY "Seniors can view their own logs" ON public.activity_logs
  FOR SELECT USING (senior_id = get_senior_id_for_user(auth.uid()));
CREATE POLICY "Seniors can insert their own logs" ON public.activity_logs
  FOR INSERT WITH CHECK (senior_id = get_senior_id_for_user(auth.uid()));

-- joy_preferences policies
CREATE POLICY "Guardians can manage their senior's preferences" ON public.joy_preferences
  FOR ALL USING (is_guardian_of(auth.uid(), senior_id));
CREATE POLICY "Seniors can view their preferences" ON public.joy_preferences
  FOR SELECT USING (senior_id = get_senior_id_for_user(auth.uid()));

-- health_vitals policies
CREATE POLICY "Guardians can view their senior's vitals" ON public.health_vitals
  FOR SELECT USING (is_guardian_of(auth.uid(), senior_id));
CREATE POLICY "Seniors can manage their vitals" ON public.health_vitals
  FOR ALL USING (senior_id = get_senior_id_for_user(auth.uid()));

-- family_members policies
CREATE POLICY "Guardians can manage family members" ON public.family_members
  FOR ALL USING (is_guardian_of(auth.uid(), senior_id));
CREATE POLICY "Seniors can view their family" ON public.family_members
  FOR SELECT USING (senior_id = get_senior_id_for_user(auth.uid()));

-- notifications policies
CREATE POLICY "Users can view their notifications" ON public.notifications
  FOR SELECT USING (guardian_id = auth.uid() OR senior_id = get_senior_id_for_user(auth.uid()));
CREATE POLICY "Users can create notifications" ON public.notifications
  FOR INSERT WITH CHECK (
    guardian_id = auth.uid() 
    OR senior_id = get_senior_id_for_user(auth.uid())
    OR is_guardian_of(auth.uid(), senior_id)
  );


-- ============================================
-- SECTION 4: COMMON QUERIES
-- ============================================

-- ===== GUARDIAN QUERIES =====

-- Get guardian profile with phone
SELECT id, full_name, phone 
FROM profiles 
WHERE user_id = 'GUARDIAN_USER_ID';

-- Get all seniors linked to guardian
SELECT * FROM get_guardian_seniors('GUARDIAN_USER_ID');

-- Get senior details
SELECT * FROM seniors WHERE id = 'SENIOR_ID';

-- Get all medications for a senior
SELECT * FROM medications 
WHERE senior_id = 'SENIOR_ID' AND is_active = true
ORDER BY created_at DESC;

-- Get today's medication logs
SELECT ml.*, m.name, m.dosage
FROM medication_logs ml
JOIN medications m ON m.id = ml.medication_id
WHERE ml.senior_id = 'SENIOR_ID'
  AND ml.scheduled_time >= CURRENT_DATE
  AND ml.scheduled_time < CURRENT_DATE + INTERVAL '1 day'
ORDER BY ml.scheduled_time;

-- Get activity logs for a senior
SELECT * FROM activity_logs 
WHERE senior_id = 'SENIOR_ID'
ORDER BY logged_at DESC
LIMIT 50;

-- Get health vitals
SELECT * FROM health_vitals
WHERE senior_id = 'SENIOR_ID'
ORDER BY recorded_at DESC
LIMIT 10;

-- Get joy preferences
SELECT * FROM joy_preferences
WHERE senior_id = 'SENIOR_ID';


-- ===== SENIOR AUTH QUERIES =====

-- Validate dual-key auth (phone + PIN)
SELECT * FROM validate_family_pin_with_phone('PHONE_NUMBER', '1234');

-- Validate PIN only
SELECT * FROM validate_family_pin('1234');


-- ===== INSERT QUERIES =====

-- Create guardian profile (after signup)
INSERT INTO profiles (user_id, full_name, phone)
VALUES ('USER_ID', 'Full Name', '+919876543210');

-- Assign guardian role
INSERT INTO user_roles (user_id, role)
VALUES ('USER_ID', 'guardian');

-- Create senior
INSERT INTO seniors (name, preferred_name, language, family_pin, guardian_email)
VALUES ('Senior Name', 'Dadi', 'hinglish', '1234', 'guardian@email.com')
RETURNING *;

-- Link guardian to senior
INSERT INTO guardian_senior_links (guardian_id, senior_id, is_primary, relationship)
VALUES ('GUARDIAN_USER_ID', 'SENIOR_ID', true, 'family');

-- Add medication
INSERT INTO medications (senior_id, name, dosage, frequency, times)
VALUES ('SENIOR_ID', 'Metformin', '500mg', 'daily', '["09:00", "21:00"]');

-- Log medication taken
INSERT INTO medication_logs (medication_id, senior_id, scheduled_time, taken_at, status)
VALUES ('MEDICATION_ID', 'SENIOR_ID', NOW(), NOW(), 'taken');

-- Log activity
INSERT INTO activity_logs (senior_id, activity_type, activity_data)
VALUES ('SENIOR_ID', 'medicine_taken', '{"medicine_name": "Metformin"}');

-- Create joy preferences
INSERT INTO joy_preferences (senior_id, ai_suggestions_enabled)
VALUES ('SENIOR_ID', true);


-- ===== UPDATE QUERIES =====

-- Update senior profile
UPDATE seniors SET
  name = 'New Name',
  language = 'hindi',
  nudge_frequency = 'high'
WHERE id = 'SENIOR_ID';

-- Update medication
UPDATE medications SET
  dosage = '750mg',
  times = '["08:00", "20:00"]'
WHERE id = 'MEDICATION_ID';

-- Mark medication as taken
UPDATE medication_logs SET
  taken_at = NOW(),
  status = 'taken'
WHERE id = 'LOG_ID';

-- Soft delete medication
UPDATE medications SET is_active = false
WHERE id = 'MEDICATION_ID';

-- Update joy preferences
UPDATE joy_preferences SET
  suno_config = '{"enabled": true, "type": "oldies", "playlist_url": "https://..."}',
  ai_suggestions_enabled = false
WHERE senior_id = 'SENIOR_ID';


-- ============================================
-- SECTION 5: INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON profiles(phone);
CREATE INDEX IF NOT EXISTS idx_seniors_family_pin ON seniors(family_pin);
CREATE INDEX IF NOT EXISTS idx_guardian_links_guardian ON guardian_senior_links(guardian_id);
CREATE INDEX IF NOT EXISTS idx_guardian_links_senior ON guardian_senior_links(senior_id);
CREATE INDEX IF NOT EXISTS idx_medications_senior ON medications(senior_id);
CREATE INDEX IF NOT EXISTS idx_medication_logs_senior ON medication_logs(senior_id);
CREATE INDEX IF NOT EXISTS idx_medication_logs_scheduled ON medication_logs(scheduled_time);
CREATE INDEX IF NOT EXISTS idx_activity_logs_senior ON activity_logs(senior_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_logged_at ON activity_logs(logged_at);
CREATE INDEX IF NOT EXISTS idx_health_vitals_senior ON health_vitals(senior_id);
CREATE INDEX IF NOT EXISTS idx_notifications_guardian ON notifications(guardian_id);
CREATE INDEX IF NOT EXISTS idx_notifications_senior ON notifications(senior_id);


-- ============================================
-- SECTION 6: TRIGGERS
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER update_seniors_updated_at
  BEFORE UPDATE ON seniors
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER update_medications_updated_at
  BEFORE UPDATE ON medications
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER update_joy_preferences_updated_at
  BEFORE UPDATE ON joy_preferences
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();


-- ============================================
-- SECTION 7: USEFUL ANALYTICS QUERIES
-- ============================================

-- Get medication adherence rate for a senior (last 7 days)
SELECT 
  COUNT(*) FILTER (WHERE status = 'taken') as taken,
  COUNT(*) FILTER (WHERE status = 'missed') as missed,
  COUNT(*) as total,
  ROUND(
    COUNT(*) FILTER (WHERE status = 'taken')::NUMERIC / 
    NULLIF(COUNT(*)::NUMERIC, 0) * 100, 
    1
  ) as adherence_rate
FROM medication_logs
WHERE senior_id = 'SENIOR_ID'
  AND scheduled_time >= NOW() - INTERVAL '7 days';

-- Get daily activity summary
SELECT 
  DATE(logged_at) as date,
  activity_type,
  COUNT(*) as count
FROM activity_logs
WHERE senior_id = 'SENIOR_ID'
  AND logged_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(logged_at), activity_type
ORDER BY date DESC, count DESC;

-- Get seniors with pending medications (for guardian dashboard)
SELECT 
  s.id,
  s.name,
  s.photo_url,
  COUNT(ml.id) FILTER (WHERE ml.status = 'pending') as pending_count
FROM seniors s
JOIN guardian_senior_links gsl ON gsl.senior_id = s.id
LEFT JOIN medication_logs ml ON ml.senior_id = s.id
  AND ml.scheduled_time >= CURRENT_DATE
  AND ml.scheduled_time < CURRENT_DATE + INTERVAL '1 day'
WHERE gsl.guardian_id = 'GUARDIAN_USER_ID'
GROUP BY s.id, s.name, s.photo_url;
