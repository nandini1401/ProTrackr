CREATE POLICY "Authenticated can insert files"
ON public.project_files FOR INSERT
TO authenticated
WITH CHECK (true);