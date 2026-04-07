-- ============================================================
-- 002: CASCADE DELETION FOR SENIORS
-- Problem: Deleting user from Supabase doesn't clean up seniors
-- Fix: Function to hard-delete a senior and all related data
-- ============================================================

-- 1. Function to fully delete a senior and all related records
CREATE OR REPLACE FUNCTION public.delete_senior_cascade(senior_uuid uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only allow guardians of this senior
  IF NOT is_guardian_of(auth.uid(), senior_uuid) THEN
    RAISE EXCEPTION 'Not authorized to delete this senior';
  END IF;

  -- Delete in dependency order
  DELETE FROM public.audit_logs WHERE senior_id = senior_uuid;
  DELETE FROM public.medication_adherence_stats WHERE senior_id = senior_uuid;
  DELETE FROM public.medication_logs WHERE senior_id = senior_uuid;
  DELETE FROM public.medications WHERE senior_id = senior_uuid;
  DELETE FROM public.activity_logs WHERE senior_id = senior_uuid;
  DELETE FROM public.health_vitals WHERE senior_id = senior_uuid;
  DELETE FROM public.family_members WHERE senior_id = senior_uuid;
  DELETE FROM public.joy_preferences WHERE senior_id = senior_uuid;
  DELETE FROM public.notifications WHERE senior_id = senior_uuid;
  DELETE FROM public.guardian_senior_links WHERE senior_id = senior_uuid;
  DELETE FROM public.seniors WHERE id = senior_uuid;
END;
$$;

-- 2. Function to fully delete a guardian account and all their seniors
CREATE OR REPLACE FUNCTION public.delete_guardian_cascade(guardian_uuid uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _senior_id uuid;
BEGIN
  -- Only allow the user themselves
  IF auth.uid() != guardian_uuid THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  -- Delete all linked seniors
  FOR _senior_id IN
    SELECT senior_id FROM public.guardian_senior_links WHERE guardian_id = guardian_uuid
  LOOP
    -- Clean up all senior data
    DELETE FROM public.audit_logs WHERE senior_id = _senior_id;
    DELETE FROM public.medication_adherence_stats WHERE senior_id = _senior_id;
    DELETE FROM public.medication_logs WHERE senior_id = _senior_id;
    DELETE FROM public.medications WHERE senior_id = _senior_id;
    DELETE FROM public.activity_logs WHERE senior_id = _senior_id;
    DELETE FROM public.health_vitals WHERE senior_id = _senior_id;
    DELETE FROM public.family_members WHERE senior_id = _senior_id;
    DELETE FROM public.joy_preferences WHERE senior_id = _senior_id;
    DELETE FROM public.notifications WHERE senior_id = _senior_id;
    DELETE FROM public.guardian_senior_links WHERE senior_id = _senior_id;
    DELETE FROM public.seniors WHERE id = _senior_id;
  END LOOP;

  -- Delete guardian's own data
  DELETE FROM public.user_roles WHERE user_id = guardian_uuid;
  DELETE FROM public.profiles WHERE user_id = guardian_uuid;
  DELETE FROM public.notifications WHERE guardian_id = guardian_uuid;
END;
$$;

-- 3. Allow DELETE on audit_logs for cascade function (security definer bypasses RLS,
--    but let's also add a policy for completeness)
DROP POLICY IF EXISTS "System can delete audit logs" ON public.audit_logs;
CREATE POLICY "System can delete audit logs"
ON public.audit_logs
FOR DELETE
TO authenticated
USING (
  senior_id IS NOT NULL AND is_guardian_of(auth.uid(), senior_id)
);

-- 4. Allow DELETE on medication_adherence_stats
DROP POLICY IF EXISTS "Guardians can delete adherence stats" ON public.medication_adherence_stats;
CREATE POLICY "Guardians can delete adherence stats"
ON public.medication_adherence_stats
FOR DELETE
TO authenticated
USING (is_guardian_of(auth.uid(), senior_id));
