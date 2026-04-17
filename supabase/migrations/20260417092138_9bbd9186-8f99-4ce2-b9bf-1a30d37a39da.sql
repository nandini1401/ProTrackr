-- Allow anonymous (not logged in) users to read companies and projects
-- so the registration form dropdowns work in realtime.
CREATE POLICY "Anyone can view companies for registration"
ON public.companies FOR SELECT
TO anon
USING (true);

CREATE POLICY "Anyone can view projects for registration"
ON public.projects FOR SELECT
TO anon
USING (true);