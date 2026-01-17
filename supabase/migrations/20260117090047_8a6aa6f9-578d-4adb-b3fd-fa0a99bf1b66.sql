-- Add family_pin and preferred_name to seniors table for PIN-based auth
ALTER TABLE public.seniors 
ADD COLUMN IF NOT EXISTS family_pin TEXT,
ADD COLUMN IF NOT EXISTS preferred_name TEXT;

-- Add guardian_email to seniors for password reset functionality
ALTER TABLE public.seniors 
ADD COLUMN IF NOT EXISTS guardian_email TEXT;

-- Create index on family_pin for faster lookups
CREATE INDEX IF NOT EXISTS idx_seniors_family_pin ON public.seniors(family_pin);

-- Create a function to validate PIN and return senior data (without exposing PIN hash)
CREATE OR REPLACE FUNCTION public.validate_family_pin(input_pin TEXT)
RETURNS TABLE(
  senior_id UUID,
  senior_name TEXT,
  preferred_name TEXT,
  photo_url TEXT,
  guardian_id UUID
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
    gsl.guardian_id
  FROM public.seniors s
  LEFT JOIN public.guardian_senior_links gsl ON gsl.senior_id = s.id AND gsl.is_primary = true
  WHERE s.family_pin = input_pin;
END;
$$;

-- Grant execute permission to anonymous users for PIN validation
GRANT EXECUTE ON FUNCTION public.validate_family_pin(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.validate_family_pin(TEXT) TO authenticated;