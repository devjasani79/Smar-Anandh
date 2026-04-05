
-- Create medication_adherence_stats view as a regular table (materialized approach)
CREATE TABLE IF NOT EXISTS public.medication_adherence_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  senior_id uuid NOT NULL REFERENCES public.seniors(id) ON DELETE CASCADE,
  adherence_date date NOT NULL,
  meds_taken integer NOT NULL DEFAULT 0,
  meds_missed integer NOT NULL DEFAULT 0,
  meds_total integer NOT NULL DEFAULT 0,
  adherence_percentage numeric NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(senior_id, adherence_date)
);

ALTER TABLE public.medication_adherence_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Guardians can view adherence stats"
  ON public.medication_adherence_stats FOR SELECT
  TO authenticated
  USING (is_guardian_of(auth.uid(), senior_id));

CREATE POLICY "Seniors can view own adherence stats"
  ON public.medication_adherence_stats FOR SELECT
  TO authenticated
  USING (senior_id = get_senior_id_for_user(auth.uid()));

CREATE POLICY "System can insert adherence stats"
  ON public.medication_adherence_stats FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "System can update adherence stats"
  ON public.medication_adherence_stats FOR UPDATE
  TO authenticated
  USING (true);

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name text NOT NULL,
  record_id text NOT NULL,
  operation text NOT NULL,
  old_values jsonb,
  new_values jsonb,
  changed_by uuid NOT NULL,
  changed_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view audit logs"
  ON public.audit_logs FOR SELECT
  TO authenticated
  USING (changed_by = auth.uid());

CREATE POLICY "Authenticated users can insert audit logs"
  ON public.audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (changed_by = auth.uid());

-- Create function to refresh adherence stats for a senior
CREATE OR REPLACE FUNCTION public.refresh_adherence_stats()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO medication_adherence_stats (senior_id, adherence_date, meds_taken, meds_missed, meds_total, adherence_percentage)
  SELECT 
    ml.senior_id,
    DATE(ml.scheduled_time) as adherence_date,
    COUNT(CASE WHEN ml.status = 'taken' THEN 1 END) as meds_taken,
    COUNT(CASE WHEN ml.status = 'missed' THEN 1 END) as meds_missed,
    COUNT(*) as meds_total,
    CASE WHEN COUNT(*) > 0 
      THEN ROUND(COUNT(CASE WHEN ml.status = 'taken' THEN 1 END)::numeric / COUNT(*)::numeric * 100, 1)
      ELSE 0 
    END as adherence_percentage
  FROM medication_logs ml
  WHERE DATE(ml.scheduled_time) >= CURRENT_DATE - INTERVAL '30 days'
  GROUP BY ml.senior_id, DATE(ml.scheduled_time)
  ON CONFLICT (senior_id, adherence_date)
  DO UPDATE SET
    meds_taken = EXCLUDED.meds_taken,
    meds_missed = EXCLUDED.meds_missed,
    meds_total = EXCLUDED.meds_total,
    adherence_percentage = EXCLUDED.adherence_percentage;
END;
$$;
