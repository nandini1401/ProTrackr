
-- Enum for app roles
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  phone TEXT DEFAULT '',
  position TEXT DEFAULT '',
  avatar_url TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

-- Companies table
CREATE TABLE public.companies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  line_of_business TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  email TEXT DEFAULT '',
  website TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- People table
CREATE TABLE public.people (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
  job_title TEXT DEFAULT '',
  role TEXT DEFAULT 'viewer',
  avatar_url TEXT DEFAULT '',
  progress INT DEFAULT 0,
  start_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Projects table
CREATE TABLE public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
  start_date DATE,
  end_date DATE,
  progress INT DEFAULT 0,
  status TEXT DEFAULT 'planned',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tasks table
CREATE TABLE public.tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  assignee_id UUID REFERENCES public.people(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'planned',
  start_date DATE,
  end_date DATE,
  progress INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Forms table
CREATE TABLE public.forms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  form_number TEXT NOT NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  template_type TEXT NOT NULL,
  date DATE,
  status TEXT DEFAULT 'draft',
  progress INT DEFAULT 0,
  work_today TEXT DEFAULT '',
  manpower INT DEFAULT 0,
  materials TEXT DEFAULT '',
  submitted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Project files table
CREATE TABLE public.project_files (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  uploaded_by UUID REFERENCES public.people(id) ON DELETE SET NULL,
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.people ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_files ENABLE ROW LEVEL SECURITY;

-- Security definer function for role checks
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User roles policies
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);

-- Companies policies (admins full access, authenticated read)
CREATE POLICY "Authenticated can view companies" ON public.companies FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage companies" ON public.companies FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- People policies
CREATE POLICY "Authenticated can view people" ON public.people FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage people" ON public.people FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Projects policies
CREATE POLICY "Authenticated can view projects" ON public.projects FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage projects" ON public.projects FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Tasks policies
CREATE POLICY "Authenticated can view tasks" ON public.tasks FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage tasks" ON public.tasks FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Forms policies
CREATE POLICY "Authenticated can view forms" ON public.forms FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage forms" ON public.forms FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can insert forms" ON public.forms FOR INSERT TO authenticated WITH CHECK (auth.uid() = submitted_by);

-- Project files policies
CREATE POLICY "Authenticated can view files" ON public.project_files FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage files" ON public.project_files FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Trigger function for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON public.companies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_people_updated_at BEFORE UPDATE ON public.people FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_forms_updated_at BEFORE UPDATE ON public.forms FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''), NEW.email);
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
