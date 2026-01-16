-- Fix function search path for handle_updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- Drop the overly permissive notification insert policy and create a more secure one
DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;

CREATE POLICY "Users can create notifications for their linked seniors"
ON public.notifications FOR INSERT
TO authenticated
WITH CHECK (
    (guardian_id = auth.uid()) OR 
    (senior_id = public.get_senior_id_for_user(auth.uid())) OR
    (public.is_guardian_of(auth.uid(), senior_id))
);