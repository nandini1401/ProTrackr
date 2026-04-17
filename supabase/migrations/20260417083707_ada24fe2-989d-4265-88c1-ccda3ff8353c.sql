
-- 1) Bersihkan semua data lama agar tidak muncul lagi
DELETE FROM public.project_files;
DELETE FROM public.forms;
DELETE FROM public.tasks;
DELETE FROM public.projects;
DELETE FROM public.people;
DELETE FROM public.companies;

-- 2) Aktifkan realtime untuk semua tabel terkait
ALTER TABLE public.companies REPLICA IDENTITY FULL;
ALTER TABLE public.projects REPLICA IDENTITY FULL;
ALTER TABLE public.people REPLICA IDENTITY FULL;
ALTER TABLE public.tasks REPLICA IDENTITY FULL;
ALTER TABLE public.forms REPLICA IDENTITY FULL;
ALTER TABLE public.project_files REPLICA IDENTITY FULL;
ALTER TABLE public.profiles REPLICA IDENTITY FULL;

DO $$
BEGIN
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.companies; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.projects; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.people; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.forms; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.project_files; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles; EXCEPTION WHEN duplicate_object THEN NULL; END;
END $$;

-- 3) RLS allow authenticated INSERT untuk people/projects/tasks/companies (admin sudah bisa via has_role)
-- Allow authenticated to insert (so register can auto-add company/people)
CREATE POLICY "Authenticated can insert companies"
ON public.companies FOR INSERT TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated can insert people"
ON public.people FOR INSERT TO authenticated
WITH CHECK (true);

-- 4) Update trigger handle_new_user agar otomatis upsert company + insert people
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_company_id uuid;
  v_company text;
  v_full_name text;
  v_phone text;
  v_position text;
  v_email text;
BEGIN
  v_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', '');
  v_email := COALESCE(NEW.email, '');
  v_phone := COALESCE(NEW.raw_user_meta_data->>'phone', '');
  v_position := COALESCE(NEW.raw_user_meta_data->>'position', '');
  v_company := COALESCE(NEW.raw_user_meta_data->>'company', '');

  -- profile
  INSERT INTO public.profiles (user_id, full_name, email, phone, position, company, project)
  VALUES (NEW.id, v_full_name, v_email, v_phone, v_position, v_company,
          COALESCE(NEW.raw_user_meta_data->>'project', ''));

  -- default role
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');

  -- upsert company
  IF v_company <> '' THEN
    SELECT id INTO v_company_id FROM public.companies WHERE LOWER(name) = LOWER(v_company) LIMIT 1;
    IF v_company_id IS NULL THEN
      INSERT INTO public.companies (name, line_of_business, phone, email)
      VALUES (v_company, '-', v_phone, v_email)
      RETURNING id INTO v_company_id;
    END IF;
  END IF;

  -- people record (only for non-admin users; admin manages via UI)
  INSERT INTO public.people (name, email, phone, company_id, job_title, role, start_date)
  VALUES (v_full_name, v_email, v_phone, v_company_id, v_position, 'viewer', CURRENT_DATE);

  RETURN NEW;
END;
$function$;

-- ensure trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
