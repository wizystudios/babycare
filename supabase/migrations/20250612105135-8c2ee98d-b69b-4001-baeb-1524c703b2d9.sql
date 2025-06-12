
-- Drop the problematic policy that's blocking the column type change
DROP POLICY IF EXISTS "Admins can update any role" ON user_roles;

-- Drop other existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view own role" ON user_roles;
DROP POLICY IF EXISTS "View doctor profiles" ON profiles;

-- First, create the app_role enum type if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
        CREATE TYPE app_role AS ENUM ('parent', 'doctor', 'admin');
    END IF;
END$$;

-- Add the role column to profiles table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'role') THEN
        ALTER TABLE profiles ADD COLUMN role app_role DEFAULT 'parent'::app_role NOT NULL;
    END IF;
END$$;

-- Update user_roles table to ensure it uses the enum correctly
ALTER TABLE user_roles 
ALTER COLUMN role TYPE app_role USING role::text::app_role,
ALTER COLUMN role SET DEFAULT 'parent'::app_role;

-- Create or replace the handle_new_user function
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

-- Create the trigger if it doesn't exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable RLS if not already enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Allow users to view their own roles
CREATE POLICY "Users can view own role" ON user_roles
  FOR SELECT USING (auth.uid() = user_id);

-- Allow viewing doctor profiles for parents
CREATE POLICY "View doctor profiles" ON profiles
  FOR SELECT USING (role = 'doctor'::app_role);
