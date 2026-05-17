# 2026-05-17 — Security hardening batch

Apply these files in your standalone Supabase SQL editor in numeric order.

| # | File | What it does | Safe to re-run |
|---|------|--------------|----------------|
| 001 | `001_drop_anon_rls.sql` | Removes the broad `TO anon … USING (true)` policies opened by `add-ons/004`. | Yes |
| 002 | `002_jwt_senior_rls.sql` | Adds `current_senior_id()` helper + JWT-claim scoped policies for senior data. | Yes |
| 003 | `003_bcrypt_family_pin.sql` | Hashes `seniors.family_pin` with bcrypt. Rewrites validators + adds `set_family_pin` / `hash_family_pin`. | **No** — drops the plaintext column. Take a backup first. |
| 004 | `004_private_storage_buckets.sql` | Flips the three buckets to private and adds owner/guardian/senior-scoped policies. | Yes |

## Coupling with the client

- 001 + 002 require the client to be running the **senior-auth-proxy** flow (this release). Without it, standalone seniors lose access to their data.
- 003 requires the new `set_family_pin` RPC path — guardian onboarding + settings now call it instead of writing the column directly.
- 004 requires every `<img>` source under those buckets to come from `useSignedUrl`. Apply **last**, and only after verifying the client deploy.

## Rollback notes

- 001 / 002: re-running `add-ons/004_senior_data_proxy_rls.sql` will restore anon access.
- 003: irreversible (plaintext PINs are gone).
- 004: `UPDATE storage.buckets SET public = true WHERE id IN (...)` plus dropping the `smaranandh:*` policies restores prior behavior.