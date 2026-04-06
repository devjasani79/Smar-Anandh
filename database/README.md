## Standalone Supabase SQL

Use these files for your standalone Supabase project.

### Apply order

1. Run `standalone_dashboard_patch.sql` — creates `medication_adherence_stats` and `audit_logs` tables
2. Run `qa_fixes_patch.sql` — creates triggers, soft-delete columns, export RPC, RLS fixes
3. Then run `SELECT public.refresh_adherence_stats();` to backfill adherence data

### What standalone_dashboard_patch.sql fixes

- missing `medication_adherence_stats`
- missing `audit_logs`
- guardian dashboard 404s from REST queries to non-existent tables
- required RLS and helper indexes for those dashboard queries

### What qa_fixes_patch.sql fixes

- missing audit log triggers (audit_logs was always empty)
- missing activity_log triggers on medication status changes (activity feed was disconnected)
- adherence stats never auto-refreshing (chart always empty)
- missing soft-delete columns on seniors and guardian_senior_links
- missing `export_senior_data` RPC (export button was broken)
- RLS too restrictive on audit_logs (triggers couldn't write)
- RLS missing for system activity_log inserts

This folder is intentionally focused on incremental patches instead of rewriting your whole database.
