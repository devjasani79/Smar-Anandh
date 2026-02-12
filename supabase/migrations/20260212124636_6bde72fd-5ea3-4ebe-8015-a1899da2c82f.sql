
-- Fix the validate_family_pin_with_phone function to normalize phone numbers
-- Strip all non-digit characters before comparing
CREATE OR REPLACE FUNCTION public.validate_family_pin_with_phone(guardian_phone text, input_pin text)
RETURNS TABLE(
  senior_id uuid,
  senior_name text,
  preferred_name text,
  photo_url text,
  guardian_id uuid,
  senior_language text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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
    AND regexp_replace(p.phone, '[^0-9]', '', 'g') = regexp_replace(guardian_phone, '[^0-9]', '', 'g');
END;
$$;
