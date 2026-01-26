-- Fix RLS policies for onboarding flow
-- Issue: Users cannot insert into user_roles or seniors during onboarding

-- 1. Allow authenticated users to insert their own role (for onboarding)
CREATE POLICY "Users can insert their own guardian role"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 2. Drop and recreate the seniors INSERT policy to allow first-time guardians
DROP POLICY IF EXISTS "Guardians can insert seniors" ON public.seniors;

-- Allow users to insert seniors if they are the guardian (user_id matches)
CREATE POLICY "Guardians can insert seniors"
ON public.seniors
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- 3. Fix guardian_senior_links to allow first-time link creation
DROP POLICY IF EXISTS "Guardians can create links" ON public.guardian_senior_links;

CREATE POLICY "Guardians can create links"
ON public.guardian_senior_links
FOR INSERT
TO authenticated
WITH CHECK (guardian_id = auth.uid());

-- 4. Fix joy_preferences to allow insert during onboarding
CREATE POLICY "Guardians can insert joy preferences for their seniors"
ON public.joy_preferences
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.seniors s 
    WHERE s.id = senior_id AND s.user_id = auth.uid()
  )
);