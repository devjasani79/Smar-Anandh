## Goal

Tighten security across the standalone Supabase project by eliminating broad `anon` access, hashing PINs, locking storage buckets, gating routes, and reorganizing the `database/` directory so every change ships as a dated migration you can replay safely.

---

## 1. Directory restructure (database/)

Move from a flat `database/` + `add-ons/` layout to a date- and context-organized tree:

```text
database/
  README.md                          (updated index, apply order, conventions)
  baseline/                          (existing one-time patches, untouched)
    standalone_dashboard_patch.sql
    qa_fixes_patch.sql
  add-ons/                           (existing 001–004, untouched for history)
    001_fix_audit_log_leak.sql
    002_cascade_deletion.sql
    003_activity_completions.sql
    004_senior_data_proxy_rls.sql
  migrations/
    2026-05-17/                      (today's security hardening batch)
      001_drop_anon_rls.sql
      002_jwt_senior_rls.sql
      003_bcrypt_family_pin.sql
      004_private_storage_buckets.sql
      README.md                      (what + why + apply order for this date)
```

Rules going forward (documented in `database/README.md`):
- Anything net-new lives under `database/migrations/YYYY-MM-DD/NNN_short_name.sql`.
- `baseline/` and `add-ons/` are frozen history — never edited.
- Each dated folder gets its own `README.md` describing intent, order, and rollback notes.

`supabase/migrations/` stays as-is — it is the Lovable/Supabase CLI managed folder for the Lovable-side project; the user's standalone project is driven from `database/` (copy-paste into SQL editor).

---

## 2. SQL migrations (2026-05-17)

### `001_drop_anon_rls.sql`
Drops every `TO anon ... USING (true)` policy introduced in `add-ons/004`:
- `medications`, `medication_logs`, `activity_logs`, `family_members`, `joy_preferences`, `seniors` — all anon SELECT/INSERT/UPDATE policies removed.

### `002_jwt_senior_rls.sql`
Adds senior-scoped policies that read `auth.jwt() ->> 'senior_id'`:
- Helper: `public.current_senior_id() returns uuid` (stable, reads JWT claim).
- For `medications`, `medication_logs`, `family_members`, `joy_preferences`, `seniors`, `activity_logs`:
  - `SELECT` allowed when `senior_id = public.current_senior_id()`.
  - `medication_logs`: `INSERT` / `UPDATE` allowed under the same predicate.
  - `activity_logs`: `INSERT` allowed under the same predicate.
- Guardian policies left intact (`is_guardian_of(auth.uid(), senior_id)`, `auth.uid() = guardian_id`).

### `003_bcrypt_family_pin.sql`
- `CREATE EXTENSION IF NOT EXISTS pgcrypto;`
- `ALTER TABLE seniors ADD COLUMN family_pin_hash text;`
- Backfill: `UPDATE seniors SET family_pin_hash = crypt(family_pin, gen_salt('bf', 10)) WHERE family_pin IS NOT NULL;`
- `ALTER TABLE seniors DROP COLUMN family_pin;`
- `ALTER TABLE seniors RENAME COLUMN family_pin_hash TO family_pin;`
- Rewrite `validate_family_pin`, `validate_family_pin_with_phone`, `validate_exit_pin` to compare with `crypt(input_pin, family_pin) = family_pin`.
- Add `public.hash_family_pin(text) returns text` helper (SECURITY DEFINER) for the edge function / RPC paths to call when setting a PIN.

### `004_private_storage_buckets.sql`
- `UPDATE storage.buckets SET public = false WHERE id IN ('medicine-images','family-photos','senior-photos');`
- Drop any existing permissive policies on `storage.objects` for those buckets.
- New policies on `storage.objects`:
  - `INSERT`: `auth.role() = 'authenticated'` and bucket is one of ours.
  - `SELECT`: uploader (`owner = auth.uid()`) OR `is_guardian_of(auth.uid(), <senior_id parsed from path>)` OR `current_senior_id() = <senior_id from path>`.
  - `UPDATE`/`DELETE`: `owner = auth.uid()`.
- Convention: object paths must start with `{senior_id}/...` so the senior_id can be parsed via `split_part(name,'/',1)::uuid`. Migration includes a comment documenting this contract; client uploads already follow per-senior folders for medicine/family/senior photos.

---

## 3. Edge function: `senior-auth-proxy`

New file `supabase/functions/senior-auth-proxy/index.ts`.

- Accepts `POST { phone, pin }` (action/data reserved for future; initial cut just mints a token).
- Uses `SUPABASE_SERVICE_ROLE_KEY` to call a new SECURITY DEFINER RPC `validate_family_pin_bcrypt(phone, pin)` that returns the same shape as today's `validate_family_pin_with_phone` but using `crypt()` comparison.
- On success, signs a short-lived JWT (1 hour) using `SUPABASE_JWT_SECRET` with claims:
  ```json
  { "role": "authenticated", "sub": "<senior_id>", "senior_id": "<senior_id>", "guardian_id": "...", "exp": ... }
  ```
- Returns `{ access_token, senior: { id, name, preferred_name, photo_url, language, guardian_id } }`.
- CORS + Zod validation + JWT signed via `jose` (`npm:jose@5`).
- `supabase/config.toml`: add `[functions.senior-auth-proxy] verify_jwt = false`.

Note on `SUPABASE_JWT_SECRET`: it is auto-provided to edge functions in Supabase. If your standalone project doesn't expose it, I'll add a `secrets--add_secret` step before deploy.

---

## 4. Frontend changes

### `AuthContext.tsx`
- `validateDualKey(phone, pin)`:
  - Call `supabase.functions.invoke('senior-auth-proxy', { body: { phone, pin } })`.
  - On success, `await supabase.auth.setSession({ access_token, refresh_token: access_token })` so subsequent queries carry the senior JWT (PostgREST will see `senior_id` claim).
  - Persist `seniorSession` in localStorage as today.
- `exitSeniorMode` / `signOut` call `supabase.auth.signOut()` to clear the senior JWT.
- `enterSeniorMode` (guardian-side PIN) also switches to bcrypt verification via the same proxy (passing the linked guardian's phone) — keeps logic symmetric.

### `ProtectedRoute.tsx` (new, `src/components/ProtectedRoute.tsx`)
- Props: `{ requireRole?: 'guardian' | 'senior'; requireAuth?: boolean; children }`.
- Reads `useAuth()`; while `loading || (requireRole==='guardian' && !linkedSeniorsLoaded)` show centered spinner.
- Guardian: needs `user && role === 'guardian'`; else `<Navigate to="/auth" replace />`.
- Senior: needs `seniorSession`; else `<Navigate to="/senior/auth" replace />`.
- Wrong role → `/unauthorized` (new tiny page).

### `App.tsx`
- Wrap `/guardian/*` element tree in `<ProtectedRoute requireRole="guardian">`.
- Wrap each `/senior/*` route (and `/app`) in `<ProtectedRoute requireAuth />`.
- Add `/unauthorized` route.

### Storage URL handling
- Add `src/lib/storage.ts` with `getSignedUrl(bucket, path, ttl = 3600)` wrapping `supabase.storage.from(bucket).createSignedUrl(...)`.
- Add `useSignedUrl(bucket, path)` hook (React Query) for components that currently use `getPublicUrl` or raw public URLs: `MedicationCard`, `FamilyCard`, senior/guardian photo renders, prescription scan view, joy album thumbnails.
- Upload sites (`GuardianMedicines`, `GuardianOnboarding`, `GuardianSettings`, family/joy editors) keep using `upload()` — only read paths switch to signed URLs. Stored DB values become object paths (not full public URLs); a small migration note in the 2026-05-17 README explains that existing rows with full public URLs are still readable because we keep the path segment after `/object/public/<bucket>/`.

### Onboarding / PIN setters
- Anywhere the client previously wrote `family_pin` directly (onboarding, settings PIN change), switch to a new `set_family_pin(senior_id, new_pin)` SECURITY DEFINER RPC included in `003_bcrypt_family_pin.sql` that calls `crypt()` server-side. Client never sees the hash.

---

## 5. Verification checklist (after you apply the SQL + I deploy the function)

1. Guardian login → guardian dashboard loads (existing RLS unchanged).
2. Senior phone+PIN → proxy returns JWT → `supabase.auth.setSession` succeeds → Dawa page shows medications via JWT-scoped RLS (no more anon).
3. Direct REST hit with only anon key + no JWT against `medications` returns `[]` / 401.
4. Bucket file fetched via raw public URL returns 400; via `createSignedUrl` returns the file.
5. Visiting `/guardian/*` while logged out redirects to `/auth`; visiting `/senior/*` without seniorSession redirects to `/senior/auth`.
6. Guardian A still cannot see Guardian B's audit logs (untouched policy from `add-ons/001`).

---

## 6. Files touched / created

**New**
- `database/migrations/2026-05-17/001_drop_anon_rls.sql`
- `database/migrations/2026-05-17/002_jwt_senior_rls.sql`
- `database/migrations/2026-05-17/003_bcrypt_family_pin.sql`
- `database/migrations/2026-05-17/004_private_storage_buckets.sql`
- `database/migrations/2026-05-17/README.md`
- `database/baseline/` (move existing two top-level SQL files here)
- `supabase/functions/senior-auth-proxy/index.ts`
- `src/components/ProtectedRoute.tsx`
- `src/pages/Unauthorized.tsx`
- `src/lib/storage.ts`
- `src/hooks/useSignedUrl.ts`

**Edited**
- `database/README.md` (new layout + conventions)
- `supabase/config.toml` (verify_jwt=false for new function)
- `src/App.tsx` (ProtectedRoute wrapping + /unauthorized)
- `src/contexts/AuthContext.tsx` (proxy-based dual-key, setSession, signOut clearing)
- `src/pages/guardian/GuardianOnboarding.tsx` and `GuardianSettings.tsx` (use `set_family_pin` RPC)
- Components that render bucket images → `useSignedUrl` (MedicationCard, FamilyCard, GuardianMedicines, GuardianJoy, SeniorParivaar, SeniorDawa, etc. — I'll touch them in one pass)

---

## 7. What I need from you to land this safely

- Confirm you're OK with me **moving** `standalone_dashboard_patch.sql` and `qa_fixes_patch.sql` into `database/baseline/` (no SQL changes — just a path move so the new layout is clean). If you prefer leaving them in place for muscle memory, say so and I'll add a `LEGACY/` symlink note instead.
- Confirm the storage path convention `{senior_id}/...` is acceptable — uploads already largely follow this, but I'll add a small client-side guard so any new upload that doesn't will throw early.
- After I ship, you'll apply the four SQL files in order in your standalone Supabase SQL editor, then I'll test the senior JWT flow end to end.

Reply "go" and I'll implement everything in one pass; or tell me which sections to trim.