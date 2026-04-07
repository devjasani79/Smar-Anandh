# Database Add-Ons

Run these SQL patches in order against your standalone Supabase project.

## Patches

| File | Purpose |
|------|---------|
| `001_fix_audit_log_leak.sql` | **CRITICAL**: Fixes audit log data leak where User A can see User B's logs. Adds `senior_id` column and scoped RLS. |
| `002_cascade_deletion.sql` | Adds `delete_senior_cascade()` and `delete_guardian_cascade()` RPCs for clean data removal. |
| `003_activity_completions.sql` | Creates `activity_completions` table for tracking completed activities, dice shuffle limiter, and auto-logging triggers. |
| `004_senior_data_proxy_rls.sql` | Adds anon RLS policies so standalone seniors (phone+PIN) can read medications, logs, family members, and joy preferences. |

## How to Apply

1. Open your Supabase SQL Editor
2. Paste and run each file **in order** (001 → 002 → 003 → 004)
3. Verify: `SELECT * FROM public.activity_completions LIMIT 1;` should work without error

## Important Notes

- **001 must be run first** — it fixes a security vulnerability
- **004 enables broad anon read access** — this is intentional for standalone senior auth flow. The security boundary is the phone+PIN validation.
