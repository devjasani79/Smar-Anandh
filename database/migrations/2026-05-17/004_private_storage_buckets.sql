-- ============================================================
-- 2026-05-17 / 004 — Private storage buckets + scoped policies
-- Reason: medicine-images, family-photos, senior-photos were
--         public. Switch to private and gate reads behind auth.
--
-- ⚠️  APPLY ORDER + CLIENT COUPLING ⚠️
-- Do NOT apply this file until the client has been deployed with
-- the `useSignedUrl` hook in place for all read sites. Otherwise
-- existing <img src=publicUrl> references will 400.
--
-- Object path convention: `{senior_id}/...`
-- The senior_id is parsed from the first path segment so RLS can
-- check guardian/senior ownership.
-- ============================================================

-- 1. Flip buckets to private
UPDATE storage.buckets
SET public = false
WHERE id IN ('medicine-images', 'family-photos', 'senior-photos');

-- 2. Drop any prior permissive policies on these buckets
DO $$
DECLARE pol record;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname ILIKE 'smaranandh:%'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', pol.policyname);
  END LOOP;
END $$;

-- 3. New policies (named with smaranandh: prefix for easy cleanup)
CREATE POLICY "smaranandh: senior bucket insert (authenticated)"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id IN ('medicine-images','family-photos','senior-photos')
);

CREATE POLICY "smaranandh: senior bucket select (guardian or senior)"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id IN ('medicine-images','family-photos','senior-photos')
  AND (
    owner = auth.uid()
    OR public.is_guardian_of(
         auth.uid(),
         NULLIF(split_part(name, '/', 1), '')::uuid
       )
    OR public.current_senior_id() =
         NULLIF(split_part(name, '/', 1), '')::uuid
  )
);

CREATE POLICY "smaranandh: senior bucket update (owner)"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id IN ('medicine-images','family-photos','senior-photos')
  AND owner = auth.uid()
);

CREATE POLICY "smaranandh: senior bucket delete (owner)"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id IN ('medicine-images','family-photos','senior-photos')
  AND owner = auth.uid()
);