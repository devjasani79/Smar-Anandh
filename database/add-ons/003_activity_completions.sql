-- ============================================================
-- 003: ACTIVITY COMPLETIONS TABLE
-- Track which activities a senior has completed today
-- Supports dice shuffle limiter (2/4 completed to shuffle)
-- ============================================================

-- 1. Create activity_completions table
CREATE TABLE IF NOT EXISTS public.activity_completions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  senior_id uuid NOT NULL REFERENCES public.seniors(id) ON DELETE CASCADE,
  activity_id text NOT NULL,
  activity_name text NOT NULL,
  activity_icon text,
  completed_at timestamptz NOT NULL DEFAULT now(),
  completion_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

-- 2. Index for fast daily lookups
CREATE INDEX IF NOT EXISTS idx_activity_completions_daily
  ON public.activity_completions(senior_id, completion_date);

-- 3. Unique constraint: one completion per activity per day per senior
CREATE UNIQUE INDEX IF NOT EXISTS idx_activity_completions_unique
  ON public.activity_completions(senior_id, activity_id, completion_date);

-- 4. Enable RLS
ALTER TABLE public.activity_completions ENABLE ROW LEVEL SECURITY;

-- 5. Seniors can manage their own completions
CREATE POLICY "Seniors can insert own completions"
ON public.activity_completions
FOR INSERT
TO authenticated
WITH CHECK (senior_id = get_senior_id_for_user(auth.uid()));

CREATE POLICY "Seniors can view own completions"
ON public.activity_completions
FOR SELECT
TO authenticated
USING (senior_id = get_senior_id_for_user(auth.uid()));

-- 6. Guardians can view their senior's completions
CREATE POLICY "Guardians can view senior completions"
ON public.activity_completions
FOR SELECT
TO authenticated
USING (is_guardian_of(auth.uid(), senior_id));

-- 7. Allow anon insert for standalone seniors (via edge function proxy)
CREATE POLICY "Anon can insert completions"
ON public.activity_completions
FOR INSERT
TO anon
WITH CHECK (true);

CREATE POLICY "Anon can select completions"
ON public.activity_completions
FOR SELECT
TO anon
USING (true);

-- 8. Trigger to log activity completion in activity_logs
CREATE OR REPLACE FUNCTION public.fn_activity_completion_log()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.activity_logs (senior_id, activity_type, activity_data)
  VALUES (
    NEW.senior_id,
    'activity_completed',
    jsonb_build_object(
      'activity_id', NEW.activity_id,
      'activity_name', NEW.activity_name,
      'activity_icon', NEW.activity_icon,
      'completed_at', NEW.completed_at
    )
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_activity_completion_log ON public.activity_completions;
CREATE TRIGGER trg_activity_completion_log
  AFTER INSERT ON public.activity_completions
  FOR EACH ROW EXECUTE FUNCTION public.fn_activity_completion_log();

-- 9. Also re-create the medication activity and adherence triggers
-- (in case qa_fixes_patch.sql was not applied)

CREATE OR REPLACE FUNCTION public.fn_medication_activity_log()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _med_name text;
  _activity_type text;
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
    SELECT name INTO _med_name FROM public.medications WHERE id = NEW.medication_id;
    IF NEW.status = 'taken' THEN _activity_type := 'medication_taken';
    ELSIF NEW.status = 'missed' THEN _activity_type := 'medication_missed';
    ELSIF NEW.status = 'snoozed' THEN _activity_type := 'medication_snoozed';
    ELSE RETURN NEW;
    END IF;

    INSERT INTO public.activity_logs (senior_id, activity_type, activity_data)
    VALUES (NEW.senior_id, _activity_type, jsonb_build_object(
      'medication_log_id', NEW.id, 'medication_id', NEW.medication_id,
      'medicine_name', coalesce(_med_name, 'Unknown'), 'scheduled_time', NEW.scheduled_time, 'status', NEW.status
    ));
  END IF;

  IF TG_OP = 'INSERT' AND NEW.status = 'taken' THEN
    SELECT name INTO _med_name FROM public.medications WHERE id = NEW.medication_id;
    INSERT INTO public.activity_logs (senior_id, activity_type, activity_data)
    VALUES (NEW.senior_id, 'medication_taken', jsonb_build_object(
      'medication_log_id', NEW.id, 'medication_id', NEW.medication_id,
      'medicine_name', coalesce(_med_name, 'Unknown'), 'scheduled_time', NEW.scheduled_time, 'status', NEW.status
    ));
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_medication_activity ON public.medication_logs;
CREATE TRIGGER trg_medication_activity
  AFTER INSERT OR UPDATE ON public.medication_logs
  FOR EACH ROW EXECUTE FUNCTION public.fn_medication_activity_log();

-- Allow system inserts into activity_logs (for triggers)
DROP POLICY IF EXISTS "System can insert activity logs" ON public.activity_logs;
CREATE POLICY "System can insert activity logs"
ON public.activity_logs
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Adherence auto-refresh trigger
CREATE OR REPLACE FUNCTION public.fn_refresh_adherence_on_log()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.refresh_adherence_stats();
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_refresh_adherence ON public.medication_logs;
CREATE TRIGGER trg_refresh_adherence
  AFTER INSERT OR UPDATE OR DELETE ON public.medication_logs
  FOR EACH STATEMENT EXECUTE FUNCTION public.fn_refresh_adherence_on_log();
