-- Create notification tracking table for activity reminders
CREATE TABLE IF NOT EXISTS public.activity_reminders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  baby_id UUID NOT NULL,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('feeding', 'diaper', 'sleep')),
  expected_time TIMESTAMP WITH TIME ZONE NOT NULL,
  reminder_sent BOOLEAN DEFAULT FALSE,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.activity_reminders ENABLE ROW LEVEL SECURITY;

-- Create policies for activity reminders
CREATE POLICY "Users can manage their own activity reminders" 
ON public.activity_reminders 
FOR ALL 
USING (auth.uid() = user_id);

-- Create system function to generate notifications
CREATE OR REPLACE FUNCTION public.create_activity_notification(
  p_user_id UUID,
  p_title TEXT,
  p_message TEXT,
  p_type TEXT DEFAULT 'activity_reminder',
  p_data JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
$$;

-- Function to check and create activity reminders
CREATE OR REPLACE FUNCTION public.check_activity_reminders()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
$$;

-- Create trigger for automatic notifications when reviews are added
CREATE OR REPLACE FUNCTION public.notify_review_created()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
$$;

CREATE TRIGGER trigger_review_notification
AFTER INSERT ON doctor_reviews
FOR EACH ROW
EXECUTE FUNCTION notify_review_created();

-- Create trigger for consultation request notifications
CREATE OR REPLACE FUNCTION public.notify_consultation_status()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
$$;

CREATE TRIGGER trigger_consultation_notification
AFTER INSERT OR UPDATE ON consultation_requests
FOR EACH ROW
EXECUTE FUNCTION notify_consultation_status();

-- Create trigger for baby report notifications
CREATE OR REPLACE FUNCTION public.notify_report_shared()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
$$;

CREATE TRIGGER trigger_report_notification
AFTER UPDATE ON baby_reports
FOR EACH ROW
EXECUTE FUNCTION notify_report_shared();

-- Update updated_at trigger for activity_reminders
CREATE TRIGGER update_activity_reminders_updated_at
BEFORE UPDATE ON public.activity_reminders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();