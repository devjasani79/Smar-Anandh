CREATE OR REPLACE FUNCTION public.validate_exit_pin(senior_uuid uuid, input_pin text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.seniors
    WHERE id = senior_uuid
      AND family_pin = input_pin
  );
END;
$$;