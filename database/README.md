## Standalone Supabase SQL

Use these files for your standalone Supabase project.

### Apply order

1. Run `standalone_dashboard_patch.sql`
2. Then run `SELECT public.refresh_adherence_stats();`

### What this fixes

- missing `medication_adherence_stats`
- missing `audit_logs`
- guardian dashboard 404s from REST queries to non-existent tables
- required RLS and helper indexes for those dashboard queries

This folder is intentionally focused on the current standalone gap instead of rewriting your whole database.