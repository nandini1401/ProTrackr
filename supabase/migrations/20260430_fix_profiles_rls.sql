-- Fix RLS policies for profiles table to allow trigger to work properly
-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

-- Create new, less restrictive policy for INSERT
CREATE POLICY "Users and system can insert profiles"
ON public.profiles FOR INSERT 
TO authenticated, service_role
WITH CHECK (true);

-- Ensure users can still view their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = user_id);

-- Ensure admins can still view all profiles
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles" 
ON public.profiles FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

-- Ensure users can update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
