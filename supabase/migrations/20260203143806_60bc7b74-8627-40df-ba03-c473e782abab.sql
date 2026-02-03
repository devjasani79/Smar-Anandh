-- Fix RLS policies for validate_family_pin_with_phone to work properly
-- The function is SECURITY DEFINER so it bypasses RLS, which is correct

-- Add RLS policy for profiles table to allow reading phone by other authenticated users
-- This is needed for the validate_family_pin_with_phone function (but it's SECURITY DEFINER so not needed)

-- Ensure seniors table has proper delete policy for guardians
DROP POLICY IF EXISTS "Guardians can delete their linked seniors" ON public.seniors;
CREATE POLICY "Guardians can delete their linked seniors" 
ON public.seniors 
FOR DELETE
USING (is_guardian_of(auth.uid(), id));

-- Add delete policies for related tables
DROP POLICY IF EXISTS "Guardians can delete guardian_senior_links" ON public.guardian_senior_links;
CREATE POLICY "Guardians can delete guardian_senior_links"
ON public.guardian_senior_links
FOR DELETE
USING (guardian_id = auth.uid());

DROP POLICY IF EXISTS "Guardians can delete joy_preferences for their seniors" ON public.joy_preferences;
CREATE POLICY "Guardians can delete joy_preferences for their seniors"
ON public.joy_preferences
FOR DELETE
USING (is_guardian_of(auth.uid(), senior_id));

DROP POLICY IF EXISTS "Guardians can delete medication_logs for their seniors" ON public.medication_logs;
CREATE POLICY "Guardians can delete medication_logs for their seniors"
ON public.medication_logs
FOR DELETE
USING (is_guardian_of(auth.uid(), senior_id));

DROP POLICY IF EXISTS "Guardians can delete medications for their seniors" ON public.medications;
CREATE POLICY "Guardians can delete medications for their seniors"
ON public.medications
FOR DELETE
USING (is_guardian_of(auth.uid(), senior_id));

DROP POLICY IF EXISTS "Guardians can delete activity_logs for their seniors" ON public.activity_logs;
CREATE POLICY "Guardians can delete activity_logs for their seniors"
ON public.activity_logs
FOR DELETE
USING (is_guardian_of(auth.uid(), senior_id));

DROP POLICY IF EXISTS "Guardians can delete health_vitals for their seniors" ON public.health_vitals;
CREATE POLICY "Guardians can delete health_vitals for their seniors"
ON public.health_vitals
FOR DELETE
USING (is_guardian_of(auth.uid(), senior_id));

DROP POLICY IF EXISTS "Guardians can delete family_members for their seniors" ON public.family_members;
CREATE POLICY "Guardians can delete family_members for their seniors"
ON public.family_members
FOR DELETE
USING (is_guardian_of(auth.uid(), senior_id));

-- Allow authenticated users to delete their own profile
DROP POLICY IF EXISTS "Users can delete their own profile" ON public.profiles;
CREATE POLICY "Users can delete their own profile"
ON public.profiles
FOR DELETE
USING (auth.uid() = user_id);

-- Allow authenticated users to delete their own roles
DROP POLICY IF EXISTS "Users can delete their own roles" ON public.user_roles;
CREATE POLICY "Users can delete their own roles"
ON public.user_roles
FOR DELETE
USING (auth.uid() = user_id);