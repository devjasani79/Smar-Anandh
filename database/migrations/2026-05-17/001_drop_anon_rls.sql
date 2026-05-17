-- ============================================================
-- 2026-05-17 / 001 — Drop broad anon RLS policies
-- Reason: add-ons/004 opened anon SELECT/INSERT/UPDATE on senior
--         data tables with USING (true). This is being replaced by
--         JWT-claim-based RLS (see 002_jwt_senior_rls.sql), backed
--         by the senior-auth-proxy edge function which mints a
--         short-lived JWT with a senior_id claim.
-- Apply order: BEFORE 002. After this file, standalone seniors will
--              lose data access until 002 is applied AND the
--              senior-auth-proxy flow is live in the client.
-- ============================================================

DROP POLICY IF EXISTS "Anon can view medications"        ON public.medications;
DROP POLICY IF EXISTS "Anon can view medication logs"    ON public.medications;

DROP POLICY IF EXISTS "Anon can view medication_logs"    ON public.medication_logs;
DROP POLICY IF EXISTS "Anon can insert medication_logs"  ON public.medication_logs;
DROP POLICY IF EXISTS "Anon can update medication_logs"  ON public.medication_logs;

DROP POLICY IF EXISTS "Anon can insert activity_logs"    ON public.activity_logs;

DROP POLICY IF EXISTS "Anon can view family_members"     ON public.family_members;
DROP POLICY IF EXISTS "Anon can view joy_preferences"    ON public.joy_preferences;
DROP POLICY IF EXISTS "Anon can view seniors"            ON public.seniors;