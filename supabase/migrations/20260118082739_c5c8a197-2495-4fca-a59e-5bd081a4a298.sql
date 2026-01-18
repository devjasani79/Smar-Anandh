-- Add phone number to profiles for Guardian identification
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS phone TEXT UNIQUE;

-- Create index for faster phone lookups
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON public.profiles(phone);

-- Update validate_family_pin to support dual-key (phone + PIN) authentication
CREATE OR REPLACE FUNCTION public.validate_family_pin_with_phone(
  guardian_phone TEXT,
  input_pin TEXT
)
RETURNS TABLE(
  senior_id UUID,
  senior_name TEXT,
  preferred_name TEXT,
  photo_url TEXT,
  guardian_id UUID,
  senior_language TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
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

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.validate_family_pin_with_phone(TEXT, TEXT) TO anon, authenticated;

-- Create function to get guardian's seniors for dashboard
CREATE OR REPLACE FUNCTION public.get_guardian_seniors(guardian_user_id UUID)
RETURNS TABLE(
  senior_id UUID,
  senior_name TEXT,
  preferred_name TEXT,
  photo_url TEXT,
  language TEXT,
  is_primary BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
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

GRANT EXECUTE ON FUNCTION public.get_guardian_seniors(UUID) TO authenticated;