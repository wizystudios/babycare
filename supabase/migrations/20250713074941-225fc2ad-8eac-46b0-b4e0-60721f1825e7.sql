-- Update doctor names to use email prefix for better display
UPDATE doctors 
SET name = CASE 
  WHEN name IN ('User', 'User DR', 'Dr. User') THEN 
    CASE 
      WHEN email IS NOT NULL THEN 
        'Dr. ' || SPLIT_PART(email, '@', 1)
      ELSE 
        'Dr. ' || SPLIT_PART(name, ' ', 1)
    END
  ELSE name
END
WHERE name IN ('User', 'User DR', 'Dr. User') OR name ILIKE '%user%';

-- Add a parent_features_enabled column to profiles to track doctor's choice about parent features
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS parent_features_enabled boolean DEFAULT false;

-- Create a consultation_requests table for real booking functionality
CREATE TABLE IF NOT EXISTS consultation_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL,
  doctor_id UUID NOT NULL,
  baby_id UUID,
  requested_date TIMESTAMP WITH TIME ZONE NOT NULL,
  requested_time_slot TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  doctor_response TEXT,
  suggested_date TIMESTAMP WITH TIME ZONE,
  suggested_time_slot TEXT,
  reason TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on consultation_requests
ALTER TABLE consultation_requests ENABLE ROW LEVEL SECURITY;

-- Create policies for consultation_requests
CREATE POLICY "Patients can create consultation requests" 
ON consultation_requests 
FOR INSERT 
WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Patients can view their own requests" 
ON consultation_requests 
FOR SELECT 
USING (auth.uid() = patient_id);

CREATE POLICY "Doctors can view their requests" 
ON consultation_requests 
FOR SELECT 
USING (auth.uid() = doctor_id);

CREATE POLICY "Doctors can update their requests" 
ON consultation_requests 
FOR UPDATE 
USING (auth.uid() = doctor_id);

-- Create notifications table for real-time updates
CREATE TABLE IF NOT EXISTS real_time_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on notifications
ALTER TABLE real_time_notifications ENABLE ROW LEVEL SECURITY;

-- Create policies for notifications
CREATE POLICY "Users can view their own notifications" 
ON real_time_notifications 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" 
ON real_time_notifications 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for consultation_requests
CREATE TRIGGER update_consultation_requests_updated_at
    BEFORE UPDATE ON consultation_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_consultation_requests_patient_id ON consultation_requests(patient_id);
CREATE INDEX IF NOT EXISTS idx_consultation_requests_doctor_id ON consultation_requests(doctor_id);
CREATE INDEX IF NOT EXISTS idx_consultation_requests_status ON consultation_requests(status);
CREATE INDEX IF NOT EXISTS idx_real_time_notifications_user_id ON real_time_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_real_time_notifications_read ON real_time_notifications(read);

-- Enable realtime for consultation requests and notifications
ALTER TABLE consultation_requests REPLICA IDENTITY FULL;
ALTER TABLE real_time_notifications REPLICA IDENTITY FULL;