
-- Fix: Make INSERT policy more restrictive
-- Only users with 'guardian' role can insert seniors

DROP POLICY IF EXISTS "Guardians can insert seniors" ON public.seniors;

CREATE POLICY "Guardians can insert seniors" 
ON public.seniors 
FOR INSERT 
TO authenticated
WITH CHECK (
  -- User must have the guardian role
  has_role(auth.uid(), 'guardian')
);
