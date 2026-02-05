
-- Fix: Remove unique constraint on seniors.user_id to allow guardians to have multiple seniors
-- The user_id column was incorrectly unique - a guardian should be able to add multiple seniors

-- Step 1: Drop the unique constraint
ALTER TABLE public.seniors DROP CONSTRAINT IF EXISTS seniors_user_id_key;

-- Step 2: Drop the foreign key to auth.users (seniors don't need auth accounts)
ALTER TABLE public.seniors DROP CONSTRAINT IF EXISTS seniors_user_id_fkey;

-- The relationship between guardians and seniors is managed via guardian_senior_links table
-- seniors.user_id can remain for legacy purposes but shouldn't be unique or required
