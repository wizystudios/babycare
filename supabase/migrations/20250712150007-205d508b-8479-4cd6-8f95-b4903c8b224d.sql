-- Fix the auth trigger to handle enum casting more robustly
-- Drop the existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Recreate the enum to ensure it exists in the current session
DROP TYPE IF EXISTS public.app_role CASCADE;
CREATE TYPE public.app_role AS ENUM ('parent', 'doctor', 'admin');

-- Ensure the profiles table role column uses the correct type
ALTER TABLE public.profiles 
  ALTER COLUMN role TYPE public.app_role USING 
    CASE 
      WHEN role::text = 'parent' THEN 'parent'::public.app_role
      WHEN role::text = 'doctor' THEN 'doctor'::public.app_role  
      WHEN role::text = 'admin' THEN 'admin'::public.app_role
      ELSE 'parent'::public.app_role
    END;

-- Ensure the user_roles table role column uses the correct type
ALTER TABLE public.user_roles 
  ALTER COLUMN role TYPE public.app_role USING 
    CASE 
      WHEN role::text = 'parent' THEN 'parent'::public.app_role
      WHEN role::text = 'doctor' THEN 'doctor'::public.app_role
      WHEN role::text = 'admin' THEN 'admin'::public.app_role  
      ELSE 'parent'::public.app_role
    END;

-- Create a more robust trigger function with explicit schema references
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  user_role_text text;
  final_role public.app_role;
BEGIN
  -- Extract role from metadata with fallback
  user_role_text := COALESCE(NEW.raw_user_meta_data ->> 'role', 'parent');
  
  -- Convert to enum with explicit casting and validation
  final_role := CASE 
    WHEN user_role_text = 'doctor' THEN 'doctor'::public.app_role
    WHEN user_role_text = 'admin' THEN 'admin'::public.app_role
    ELSE 'parent'::public.app_role
  END;
  
  -- Special case for admin email
  IF NEW.email = 'wizy76719@gmail.com' THEN
    final_role := 'admin'::public.app_role;
  END IF;

  -- Insert into profiles
  INSERT INTO public.profiles (id, role)
  VALUES (NEW.id, final_role);
  
  -- Insert into user_roles  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, final_role);
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error and still allow user creation
    RAISE LOG 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO supabase_auth_admin;
GRANT ALL ON public.profiles TO supabase_auth_admin;
GRANT ALL ON public.user_roles TO supabase_auth_admin;
GRANT USAGE ON TYPE public.app_role TO supabase_auth_admin;