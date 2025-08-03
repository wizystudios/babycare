-- Fix the remaining function search path warning for handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
DECLARE
  user_role_text text;
  final_role public.app_role;
  user_name text;
BEGIN
  -- Extract role and name from metadata with fallback
  user_role_text := COALESCE(NEW.raw_user_meta_data ->> 'role', 'parent');
  user_name := COALESCE(NEW.raw_user_meta_data ->> 'full_name', 'User');
  
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

  -- Insert into profiles with name and country data
  INSERT INTO public.profiles (
    id, 
    role, 
    full_name,
    phone,
    country,
    country_code,
    specialization
  )
  VALUES (
    NEW.id, 
    final_role,
    user_name,
    NEW.raw_user_meta_data ->> 'phone',
    NEW.raw_user_meta_data ->> 'country',
    NEW.raw_user_meta_data ->> 'country_code',
    CASE WHEN final_role = 'doctor' THEN NEW.raw_user_meta_data ->> 'specialization' ELSE NULL END
  );
  
  -- Insert into user_roles  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, final_role);
  
  -- If user is a doctor, also create entry in doctors table
  IF final_role = 'doctor' THEN
    INSERT INTO public.doctors (
      user_id,
      name,
      specialization,
      phone,
      email,
      available
    )
    VALUES (
      NEW.id,
      user_name,
      COALESCE(NEW.raw_user_meta_data ->> 'specialization', 'General Medicine'),
      NEW.raw_user_meta_data ->> 'phone',
      NEW.email,
      true
    );
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error and still allow user creation
    RAISE LOG 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$function$;