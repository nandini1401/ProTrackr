-- Allow users to update their own forms
CREATE POLICY "Users can update own forms"
ON public.forms
FOR UPDATE
USING (auth.uid() = submitted_by);

-- Allow users to delete their own forms
CREATE POLICY "Users can delete own forms"
ON public.forms
FOR DELETE
USING (auth.uid() = submitted_by);