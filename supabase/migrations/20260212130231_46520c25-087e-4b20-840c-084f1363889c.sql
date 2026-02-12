
-- Drop the broken restrictive INSERT policy
DROP POLICY IF EXISTS "Authenticated users can insert seniors" ON public.seniors;

-- Create a PERMISSIVE INSERT policy so authenticated users can actually insert
CREATE POLICY "Authenticated users can insert seniors"
ON public.seniors
FOR INSERT
TO authenticated
WITH CHECK (true);
