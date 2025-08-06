-- Fix security issues by updating function search paths
CREATE OR REPLACE FUNCTION public.notify_report_shared()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  -- Notify doctor when report is shared
  IF TG_OP = 'UPDATE' AND OLD.shared_at IS NULL AND NEW.shared_at IS NOT NULL AND NEW.doctor_id IS NOT NULL THEN
    PERFORM create_activity_notification(
      NEW.doctor_id,
      'New Baby Report Shared',
      'A new baby report has been shared with you!',
      'report_shared',
      jsonb_build_object('report_id', NEW.id, 'report_type', NEW.report_type)
    );
  END IF;
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.create_activity_notification(p_user_id uuid, p_title text, p_message text, p_type text DEFAULT 'activity_reminder'::text, p_data jsonb DEFAULT '{}'::jsonb)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO public.real_time_notifications (
    user_id,
    title,
    message,
    type,
    data,
    read,
    created_at
  ) VALUES (
    p_user_id,
    p_title,
    p_message,
    p_type,
    p_data,
    false,
    now()
  ) RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.check_activity_reminders()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  user_record RECORD;
  baby_record RECORD;
  last_feeding TIMESTAMP WITH TIME ZONE;
  last_diaper TIMESTAMP WITH TIME ZONE;
  last_sleep TIMESTAMP WITH TIME ZONE;
  reminder_threshold INTERVAL := '3 hours';
BEGIN
  -- Check for each baby that belongs to parents
  FOR baby_record IN 
    SELECT b.*, p.id as parent_id 
    FROM babies b 
    JOIN profiles p ON b.user_id = p.id 
    WHERE p.role = 'parent'
  LOOP
    -- Check feeding reminders
    SELECT MAX(start_time) INTO last_feeding
    FROM feedings 
    WHERE baby_id = baby_record.id 
    AND start_time > now() - INTERVAL '24 hours';
    
    IF last_feeding IS NULL OR last_feeding < now() - reminder_threshold THEN
      -- Check if reminder already sent
      IF NOT EXISTS (
        SELECT 1 FROM activity_reminders 
        WHERE user_id = baby_record.parent_id 
        AND baby_id = baby_record.id 
        AND activity_type = 'feeding'
        AND expected_time > now() - INTERVAL '3 hours'
        AND reminder_sent = true
      ) THEN
        -- Create reminder record
        INSERT INTO activity_reminders (user_id, baby_id, activity_type, expected_time, reminder_sent)
        VALUES (baby_record.parent_id, baby_record.id, 'feeding', now(), true);
        
        -- Create notification
        PERFORM create_activity_notification(
          baby_record.parent_id,
          'Feeding Reminder',
          'It''s been a while since ' || baby_record.name || '''s last feeding. Time to feed?',
          'activity_reminder',
          jsonb_build_object('baby_id', baby_record.id, 'activity_type', 'feeding')
        );
      END IF;
    END IF;
    
    -- Check diaper reminders
    SELECT MAX(time) INTO last_diaper
    FROM diapers 
    WHERE baby_id = baby_record.id 
    AND time > now() - INTERVAL '24 hours';
    
    IF last_diaper IS NULL OR last_diaper < now() - reminder_threshold THEN
      IF NOT EXISTS (
        SELECT 1 FROM activity_reminders 
        WHERE user_id = baby_record.parent_id 
        AND baby_id = baby_record.id 
        AND activity_type = 'diaper'
        AND expected_time > now() - INTERVAL '3 hours'
        AND reminder_sent = true
      ) THEN
        INSERT INTO activity_reminders (user_id, baby_id, activity_type, expected_time, reminder_sent)
        VALUES (baby_record.parent_id, baby_record.id, 'diaper', now(), true);
        
        PERFORM create_activity_notification(
          baby_record.parent_id,
          'Diaper Check Reminder',
          'Time to check ' || baby_record.name || '''s diaper!',
          'activity_reminder',
          jsonb_build_object('baby_id', baby_record.id, 'activity_type', 'diaper')
        );
      END IF;
    END IF;
    
    -- Check sleep reminders
    SELECT MAX(start_time) INTO last_sleep
    FROM sleeps 
    WHERE baby_id = baby_record.id 
    AND start_time > now() - INTERVAL '24 hours';
    
    IF last_sleep IS NULL OR last_sleep < now() - INTERVAL '4 hours' THEN
      IF NOT EXISTS (
        SELECT 1 FROM activity_reminders 
        WHERE user_id = baby_record.parent_id 
        AND baby_id = baby_record.id 
        AND activity_type = 'sleep'
        AND expected_time > now() - INTERVAL '4 hours'
        AND reminder_sent = true
      ) THEN
        INSERT INTO activity_reminders (user_id, baby_id, activity_type, expected_time, reminder_sent)
        VALUES (baby_record.parent_id, baby_record.id, 'sleep', now(), true);
        
        PERFORM create_activity_notification(
          baby_record.parent_id,
          'Sleep Time Reminder',
          baby_record.name || ' might be ready for a nap or bedtime!',
          'activity_reminder',
          jsonb_build_object('baby_id', baby_record.id, 'activity_type', 'sleep')
        );
      END IF;
    END IF;
  END LOOP;
END;
$function$;

CREATE OR REPLACE FUNCTION public.notify_review_created()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  -- Notify the doctor about new review
  PERFORM create_activity_notification(
    NEW.doctor_id,
    'New Review Received',
    'You received a new ' || NEW.rating || '-star review!',
    'review',
    jsonb_build_object('review_id', NEW.id, 'rating', NEW.rating)
  );
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.notify_consultation_status()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  -- Notify patient when doctor responds to consultation request
  IF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
    IF NEW.status = 'accepted' THEN
      PERFORM create_activity_notification(
        NEW.patient_id,
        'Consultation Accepted',
        'Your consultation request has been accepted!',
        'consultation_response',
        jsonb_build_object('consultation_id', NEW.id, 'status', NEW.status)
      );
    ELSIF NEW.status = 'rejected' THEN
      PERFORM create_activity_notification(
        NEW.patient_id,
        'Consultation Update',
        'Your consultation request needs attention. Please check for alternative times.',
        'consultation_response',
        jsonb_build_object('consultation_id', NEW.id, 'status', NEW.status)
      );
    END IF;
  END IF;
  
  -- Notify doctor when new consultation request is created
  IF TG_OP = 'INSERT' THEN
    PERFORM create_activity_notification(
      NEW.doctor_id,
      'New Consultation Request',
      'You have a new consultation request!',
      'consultation_request',
      jsonb_build_object('consultation_id', NEW.id)
    );
  END IF;
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
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