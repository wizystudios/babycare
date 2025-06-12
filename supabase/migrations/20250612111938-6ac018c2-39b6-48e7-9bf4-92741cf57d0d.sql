
-- First, let's completely reset and rebuild the schema properly
-- Drop existing objects that might be causing conflicts
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Drop and recreate the enum type to ensure it exists
DROP TYPE IF EXISTS app_role CASCADE;
CREATE TYPE app_role AS ENUM ('parent', 'doctor', 'admin');

-- Ensure the profiles table has the correct structure
ALTER TABLE profiles 
DROP COLUMN IF EXISTS role CASCADE;

ALTER TABLE profiles 
ADD COLUMN role app_role DEFAULT 'parent'::app_role NOT NULL;

-- Ensure the user_roles table has the correct structure
ALTER TABLE user_roles 
DROP COLUMN IF EXISTS role CASCADE;

ALTER TABLE user_roles 
ADD COLUMN role app_role DEFAULT 'parent'::app_role NOT NULL;

-- Create the trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Insert into profiles with minimal required data
  INSERT INTO public.profiles (
    id, 
    role
  )
  VALUES (
    NEW.id, 
    COALESCE((NEW.raw_user_meta_data ->> 'role')::app_role, 'parent'::app_role)
  );
  
  -- Insert into user_roles
  INSERT INTO public.user_roles (user_id, role)
  VALUES (
    NEW.id, 
    CASE 
      WHEN NEW.email = 'wizy76719@gmail.com' THEN 'admin'::app_role
      WHEN NEW.raw_user_meta_data ->> 'role' IS NOT NULL THEN (NEW.raw_user_meta_data ->> 'role')::app_role
      ELSE 'parent'::app_role
    END
  );
  
  RETURN NEW;
END;
$$;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies and recreate them
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view own role" ON user_roles;
DROP POLICY IF EXISTS "View doctor profiles" ON profiles;

-- Create policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own role" ON user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "View doctor profiles" ON profiles
  FOR SELECT USING (role = 'doctor'::app_role);
