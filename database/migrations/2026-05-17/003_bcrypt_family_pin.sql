-- ============================================================
-- 2026-05-17 / 003 — Hash family_pin with bcrypt (pgcrypto)
-- Reason: family_pin was stored as plaintext. We now store a
--         bcrypt hash and validate using crypt() at the DB layer.
-- Apply order: any time after schema baseline. Safe to run once.
--              IRREVERSIBLE: drops the plaintext column.
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Add hash column, backfill, swap.
ALTER TABLE public.seniors ADD COLUMN IF NOT EXISTS family_pin_hash text;

UPDATE public.seniors
SET family_pin_hash = crypt(family_pin, gen_salt('bf', 10))
WHERE family_pin IS NOT NULL
  AND family_pin_hash IS NULL
  -- Only hash plaintext-looking values (4 digits). If already a
  -- bcrypt hash it starts with $2.
  AND family_pin !~ '^\$2[aby]?\$';

-- If a previous partial run already hashed in-place, preserve it.
UPDATE public.seniors
SET family_pin_hash = family_pin
WHERE family_pin_hash IS NULL
  AND family_pin ~ '^\$2[aby]?\$';

ALTER TABLE public.seniors DROP COLUMN family_pin;
ALTER TABLE public.seniors RENAME COLUMN family_pin_hash TO family_pin;

-- 2. Helpers ------------------------------------------------
CREATE OR REPLACE FUNCTION public.hash_family_pin(_pin text)
RETURNS text
LANGUAGE sql
IMMUTABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT crypt(_pin, gen_salt('bf', 10))
$$;

-- 3. Rewrite validators to use crypt() comparison ----------
CREATE OR REPLACE FUNCTION public.validate_family_pin(input_pin text)
RETURNS TABLE(senior_id uuid, senior_name text, preferred_name text, photo_url text, guardian_id uuid)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.id, s.name, s.preferred_name, s.photo_url, gsl.guardian_id
  FROM public.seniors s
  LEFT JOIN public.guardian_senior_links gsl
    ON gsl.senior_id = s.id AND gsl.is_primary = true
  WHERE s.family_pin IS NOT NULL
    AND s.family_pin = crypt(input_pin, s.family_pin);
END;
$$;

CREATE OR REPLACE FUNCTION public.validate_exit_pin(senior_uuid uuid, input_pin text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  stored text;
BEGIN
  SELECT family_pin INTO stored FROM public.seniors WHERE id = senior_uuid;
  IF stored IS NULL THEN RETURN false; END IF;
  RETURN stored = crypt(input_pin, stored);
END;
$$;

CREATE OR REPLACE FUNCTION public.validate_family_pin_with_phone(guardian_phone text, input_pin text)
RETURNS TABLE(
  senior_id uuid, senior_name text, preferred_name text,
  photo_url text, guardian_id uuid, senior_language text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.id, s.name, s.preferred_name, s.photo_url,
    gsl.guardian_id, s.language
  FROM public.seniors s
  INNER JOIN public.guardian_senior_links gsl
    ON gsl.senior_id = s.id AND gsl.is_primary = true
  INNER JOIN public.profiles p
    ON p.user_id = gsl.guardian_id
  WHERE regexp_replace(p.phone, '[^0-9]', '', 'g') =
        regexp_replace(guardian_phone, '[^0-9]', '', 'g')
    AND s.family_pin IS NOT NULL
    AND s.family_pin = crypt(input_pin, s.family_pin);
END;
$$;

-- 4. Server-side PIN setter (clients never see the hash) ----
CREATE OR REPLACE FUNCTION public.set_family_pin(_senior_id uuid, _new_pin text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF _new_pin !~ '^\d{4}$' THEN
    RAISE EXCEPTION 'PIN must be exactly 4 digits';
  END IF;

  IF NOT public.is_guardian_of(auth.uid(), _senior_id) THEN
    RAISE EXCEPTION 'Not authorized to set PIN for this senior';
  END IF;

  UPDATE public.seniors
  SET family_pin = crypt(_new_pin, gen_salt('bf', 10))
  WHERE id = _senior_id;

  RETURN true;
END;
$$;

GRANT EXECUTE ON FUNCTION public.set_family_pin(uuid, text) TO authenticated;