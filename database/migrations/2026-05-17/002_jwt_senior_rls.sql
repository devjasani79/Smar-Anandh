-- ============================================================
-- 2026-05-17 / 002 — JWT-claim-based RLS for standalone seniors
-- Reason: replaces the broad anon policies dropped in 001 with
--         scoped policies that read a custom `senior_id` claim from
--         the JWT minted by the senior-auth-proxy edge function.
-- Apply order: AFTER 001.
-- ============================================================

-- Helper: parse the senior_id claim from the request JWT.
-- Returns NULL if no JWT or no claim — which makes policies fail closed.
CREATE OR REPLACE FUNCTION public.current_senior_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT NULLIF(
    current_setting('request.jwt.claims', true)::jsonb ->> 'senior_id',
    ''
  )::uuid
$$;

-- medications ------------------------------------------------
DROP POLICY IF EXISTS "Senior JWT can view medications" ON public.medications;
CREATE POLICY "Senior JWT can view medications"
ON public.medications FOR SELECT
TO authenticated
USING (senior_id = public.current_senior_id());

-- medication_logs --------------------------------------------
DROP POLICY IF EXISTS "Senior JWT can view medication_logs"   ON public.medication_logs;
DROP POLICY IF EXISTS "Senior JWT can insert medication_logs" ON public.medication_logs;
DROP POLICY IF EXISTS "Senior JWT can update medication_logs" ON public.medication_logs;

CREATE POLICY "Senior JWT can view medication_logs"
ON public.medication_logs FOR SELECT
TO authenticated
USING (senior_id = public.current_senior_id());

CREATE POLICY "Senior JWT can insert medication_logs"
ON public.medication_logs FOR INSERT
TO authenticated
WITH CHECK (senior_id = public.current_senior_id());

CREATE POLICY "Senior JWT can update medication_logs"
ON public.medication_logs FOR UPDATE
TO authenticated
USING (senior_id = public.current_senior_id());

-- activity_logs ----------------------------------------------
DROP POLICY IF EXISTS "Senior JWT can view activity_logs"   ON public.activity_logs;
DROP POLICY IF EXISTS "Senior JWT can insert activity_logs" ON public.activity_logs;

CREATE POLICY "Senior JWT can view activity_logs"
ON public.activity_logs FOR SELECT
TO authenticated
USING (senior_id = public.current_senior_id());

CREATE POLICY "Senior JWT can insert activity_logs"
ON public.activity_logs FOR INSERT
TO authenticated
WITH CHECK (senior_id = public.current_senior_id());

-- family_members ---------------------------------------------
DROP POLICY IF EXISTS "Senior JWT can view family_members" ON public.family_members;
CREATE POLICY "Senior JWT can view family_members"
ON public.family_members FOR SELECT
TO authenticated
USING (senior_id = public.current_senior_id());

-- joy_preferences --------------------------------------------
DROP POLICY IF EXISTS "Senior JWT can view joy_preferences" ON public.joy_preferences;
CREATE POLICY "Senior JWT can view joy_preferences"
ON public.joy_preferences FOR SELECT
TO authenticated
USING (senior_id = public.current_senior_id());

-- seniors ----------------------------------------------------
DROP POLICY IF EXISTS "Senior JWT can view own record" ON public.seniors;
CREATE POLICY "Senior JWT can view own record"
ON public.seniors FOR SELECT
TO authenticated
USING (id = public.current_senior_id());

-- health_vitals (parity) -------------------------------------
DROP POLICY IF EXISTS "Senior JWT can view health_vitals"   ON public.health_vitals;
DROP POLICY IF EXISTS "Senior JWT can insert health_vitals" ON public.health_vitals;
CREATE POLICY "Senior JWT can view health_vitals"
ON public.health_vitals FOR SELECT
TO authenticated
USING (senior_id = public.current_senior_id());
CREATE POLICY "Senior JWT can insert health_vitals"
ON public.health_vitals FOR INSERT
TO authenticated
WITH CHECK (senior_id = public.current_senior_id());