-- Allow users to self-assign default organizer role once
CREATE POLICY "Users can self-assign default organizer role once" 
ON public.user_roles 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id 
  AND role = 'organizer'::app_role 
  AND NOT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid()
  )
);