-- ============================================================
-- 001: FIX AUDIT LOG DATA LEAK
-- Problem: Any authenticated user can see ALL audit logs
-- Fix: Add senior_id column, scope RLS via is_guardian_of
-- ============================================================

-- 1. Add senior_id column for scoping
ALTER TABLE public.audit_logs
  ADD COLUMN IF NOT EXISTS senior_id uuid DEFAULT NULL;

-- 2. Create index for performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_senior_id ON public.audit_logs(senior_id);

-- 3. Drop the overly permissive policies
DROP POLICY IF EXISTS "Authenticated users can view audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Authenticated users can insert audit logs" ON public.audit_logs;

-- 4. Create properly scoped SELECT policy
-- Guardians can only see audit logs for their linked seniors
CREATE POLICY "Guardians view own senior audit logs"
ON public.audit_logs
FOR SELECT
TO authenticated
USING (
  senior_id IS NOT NULL AND is_guardian_of(auth.uid(), senior_id)
);

-- 5. INSERT policy for triggers (security definer functions bypass RLS,
--    but this covers direct inserts from authenticated context)
CREATE POLICY "System can insert audit logs"
ON public.audit_logs
FOR INSERT
TO authenticated
WITH CHECK (true);

-- 6. Update the audit log trigger to capture senior_id
CREATE OR REPLACE FUNCTION public.fn_audit_log()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _record_id text;
  _old jsonb := null;
  _new jsonb := null;
  _changed_by uuid;
  _senior_id uuid := null;
BEGIN
  IF TG_OP = 'DELETE' THEN
    _record_id := OLD.id::text;
    _old := to_jsonb(OLD);
    _changed_by := coalesce(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid);
  ELSIF TG_OP = 'INSERT' THEN
    _record_id := NEW.id::text;
    _new := to_jsonb(NEW);
    _changed_by := coalesce(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid);
  ELSE
    _record_id := NEW.id::text;
    _old := to_jsonb(OLD);
    _new := to_jsonb(NEW);
    _changed_by := coalesce(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid);
  END IF;

  -- Extract senior_id from the record if available
  IF TG_TABLE_NAME = 'seniors' THEN
    _senior_id := coalesce((NEW).id, (OLD).id);
  ELSIF TG_TABLE_NAME IN ('medications', 'medication_logs', 'family_members', 'activity_logs', 'health_vitals') THEN
    IF TG_OP = 'DELETE' THEN
      _senior_id := (OLD).senior_id;
    ELSE
      _senior_id := (NEW).senior_id;
    END IF;
  END IF;

  INSERT INTO public.audit_logs (table_name, record_id, operation, old_values, new_values, changed_by, senior_id)
  VALUES (TG_TABLE_NAME, _record_id, TG_OP, _old, _new, _changed_by, _senior_id);

  IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
  RETURN NEW;
END;
$$;

-- 7. Re-attach triggers (idempotent)
DROP TRIGGER IF EXISTS trg_audit_medications ON public.medications;
CREATE TRIGGER trg_audit_medications
  AFTER INSERT OR UPDATE OR DELETE ON public.medications
  FOR EACH ROW EXECUTE FUNCTION public.fn_audit_log();

DROP TRIGGER IF EXISTS trg_audit_seniors ON public.seniors;
CREATE TRIGGER trg_audit_seniors
  AFTER INSERT OR UPDATE OR DELETE ON public.seniors
  FOR EACH ROW EXECUTE FUNCTION public.fn_audit_log();

DROP TRIGGER IF EXISTS trg_audit_family_members ON public.family_members;
CREATE TRIGGER trg_audit_family_members
  AFTER INSERT OR UPDATE OR DELETE ON public.family_members
  FOR EACH ROW EXECUTE FUNCTION public.fn_audit_log();

DROP TRIGGER IF EXISTS trg_audit_medication_logs ON public.medication_logs;
CREATE TRIGGER trg_audit_medication_logs
  AFTER INSERT OR UPDATE OR DELETE ON public.medication_logs
  FOR EACH ROW EXECUTE FUNCTION public.fn_audit_log();

DROP TRIGGER IF EXISTS trg_audit_health_vitals ON public.health_vitals;
CREATE TRIGGER trg_audit_health_vitals
  AFTER INSERT OR UPDATE OR DELETE ON public.health_vitals
  FOR EACH ROW EXECUTE FUNCTION public.fn_audit_log();

-- 8. Backfill senior_id for existing audit logs where possible
UPDATE public.audit_logs al
SET senior_id = CASE
  WHEN al.table_name = 'seniors' THEN al.record_id::uuid
  WHEN al.table_name IN ('medications','medication_logs','family_members','health_vitals','activity_logs')
    AND al.new_values IS NOT NULL
    THEN (al.new_values->>'senior_id')::uuid
  WHEN al.table_name IN ('medications','medication_logs','family_members','health_vitals','activity_logs')
    AND al.old_values IS NOT NULL
    THEN (al.old_values->>'senior_id')::uuid
  ELSE NULL
END
WHERE al.senior_id IS NULL;
