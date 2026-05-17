# `database/` — Standalone Supabase SQL

All SQL for the standalone Supabase project lives here. Copy each file
into the Supabase SQL Editor and run it in the documented order.

## Layout

```
database/
  baseline/                 One-time foundational patches (frozen history)
    standalone_dashboard_patch.sql
    qa_fixes_patch.sql
  add-ons/                  Earlier feature/security patches (frozen)
    001_fix_audit_log_leak.sql
    002_cascade_deletion.sql
    003_activity_completions.sql
    004_senior_data_proxy_rls.sql
  migrations/               New work, organised by date
    YYYY-MM-DD/
      NNN_short_name.sql
      README.md
```

## Apply order for a fresh project

1. `baseline/standalone_dashboard_patch.sql`
2. `baseline/qa_fixes_patch.sql`
3. `SELECT public.refresh_adherence_stats();`
4. `add-ons/001` → `002` → `003` → `004` (in order)
5. Each `migrations/YYYY-MM-DD/` folder in chronological order, files in numeric order. Read the folder's own `README.md` first — some migrations are irreversible or coupled to a client deploy.

## Conventions

- **Never edit** files under `baseline/` or `add-ons/` — they are history.
- New work goes in `migrations/YYYY-MM-DD/NNN_short_name.sql`.
- Every dated folder ships a `README.md` describing intent, ordering, client coupling, and rollback.
- Schema changes only — data backfills that are part of the schema change can live alongside, but ad-hoc data fixes should be tracked separately.
