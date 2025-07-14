-- Add appointment_reminders table for tracking reminders
CREATE TABLE IF NOT EXISTS appointment_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consultation_request_id UUID REFERENCES consultation_requests(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  reminder_type TEXT NOT NULL CHECK (reminder_type IN ('patient_24h', 'doctor_24h', 'patient_1h', 'doctor_1h')),
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE appointment_reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own reminders" 
ON appointment_reminders 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can create reminders" 
ON appointment_reminders 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "System can update reminders" 
ON appointment_reminders 
FOR UPDATE 
USING (true);