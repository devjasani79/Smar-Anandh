
-- Update seniors INSERT policy since user_id is no longer required
-- Guardians should be able to insert seniors without setting user_id

DROP POLICY IF EXISTS "Guardians can insert seniors" ON public.seniors;

CREATE POLICY "Guardians can insert seniors" 
ON public.seniors 
FOR INSERT 
TO authenticated
WITH CHECK (true);

-- Note: After INSERT, the guardian will immediately create a guardian_senior_links entry
-- The SELECT/UPDATE/DELETE policies use is_guardian_of() which checks guardian_senior_links
