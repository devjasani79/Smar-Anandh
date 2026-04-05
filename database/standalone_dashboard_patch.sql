create extension if not exists pgcrypto;

create or replace function public.refresh_adherence_stats()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.medication_adherence_stats (
    senior_id,
    adherence_date,
    meds_taken,
    meds_missed,
    meds_total,
    adherence_percentage
  )
  select
    ml.senior_id,
    date(ml.scheduled_time) as adherence_date,
    count(case when ml.status = 'taken' then 1 end)::integer as meds_taken,
    count(case when ml.status = 'missed' then 1 end)::integer as meds_missed,
    count(*)::integer as meds_total,
    case
      when count(*) > 0 then round((count(case when ml.status = 'taken' then 1 end)::numeric / count(*)::numeric) * 100, 1)
      else 0
    end as adherence_percentage
  from public.medication_logs ml
  where date(ml.scheduled_time) >= current_date - interval '30 days'
  group by ml.senior_id, date(ml.scheduled_time)
  on conflict (senior_id, adherence_date)
  do update set
    meds_taken = excluded.meds_taken,
    meds_missed = excluded.meds_missed,
    meds_total = excluded.meds_total,
    adherence_percentage = excluded.adherence_percentage;
end;
$$;

create table if not exists public.medication_adherence_stats (
  id uuid primary key default gen_random_uuid(),
  senior_id uuid not null references public.seniors(id) on delete cascade,
  adherence_date date not null,
  meds_taken integer not null default 0,
  meds_missed integer not null default 0,
  meds_total integer not null default 0,
  adherence_percentage numeric not null default 0,
  created_at timestamptz default now(),
  unique (senior_id, adherence_date)
);

create index if not exists idx_medication_adherence_stats_senior_date
on public.medication_adherence_stats (senior_id, adherence_date desc);

alter table public.medication_adherence_stats enable row level security;

drop policy if exists "Guardians can view adherence stats" on public.medication_adherence_stats;
create policy "Guardians can view adherence stats"
on public.medication_adherence_stats
for select
to authenticated
using (public.is_guardian_of(auth.uid(), senior_id));

drop policy if exists "Seniors can view own adherence stats" on public.medication_adherence_stats;
create policy "Seniors can view own adherence stats"
on public.medication_adherence_stats
for select
to authenticated
using (senior_id = public.get_senior_id_for_user(auth.uid()));

drop policy if exists "System can insert adherence stats" on public.medication_adherence_stats;
create policy "System can insert adherence stats"
on public.medication_adherence_stats
for insert
to authenticated
with check (true);

drop policy if exists "System can update adherence stats" on public.medication_adherence_stats;
create policy "System can update adherence stats"
on public.medication_adherence_stats
for update
to authenticated
using (true)
with check (true);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  table_name text not null,
  record_id text not null,
  operation text not null,
  old_values jsonb,
  new_values jsonb,
  changed_by uuid not null,
  changed_at timestamptz not null default now()
);

create index if not exists idx_audit_logs_changed_at
on public.audit_logs (changed_at desc);

create index if not exists idx_audit_logs_changed_by
on public.audit_logs (changed_by);

alter table public.audit_logs enable row level security;

drop policy if exists "Authenticated users can insert audit logs" on public.audit_logs;
create policy "Authenticated users can insert audit logs"
on public.audit_logs
for insert
to authenticated
with check (changed_by = auth.uid());

drop policy if exists "Authenticated users can view audit logs" on public.audit_logs;
create policy "Authenticated users can view audit logs"
on public.audit_logs
for select
to authenticated
using (changed_by = auth.uid());

do $$
begin
  begin
    alter publication supabase_realtime add table public.medications;
  exception
    when duplicate_object then null;
    when undefined_object then null;
  end;

  begin
    alter publication supabase_realtime add table public.medication_logs;
  exception
    when duplicate_object then null;
    when undefined_object then null;
  end;
end $$;