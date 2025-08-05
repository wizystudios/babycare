-- Prescription Management Tables
CREATE TABLE public.prescriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  baby_id UUID NOT NULL,
  doctor_id UUID NOT NULL,
  patient_id UUID NOT NULL,
  medication_name TEXT NOT NULL,
  dosage TEXT NOT NULL,
  frequency TEXT NOT NULL,
  duration TEXT NOT NULL,
  instructions TEXT,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'active',
  prescribed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Emergency Contacts Table
CREATE TABLE public.emergency_contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  relationship TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  address TEXT,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Medical History Documents Table
CREATE TABLE public.medical_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  baby_id UUID NOT NULL,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  document_type TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER,
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Video Consultation Sessions Table
CREATE TABLE public.video_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  consultation_id UUID NOT NULL,
  session_token TEXT,
  room_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  started_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Prescriptions
CREATE POLICY "Doctors can create prescriptions" 
ON public.prescriptions 
FOR INSERT 
WITH CHECK (auth.uid() = doctor_id);

CREATE POLICY "Patients and doctors can view prescriptions" 
ON public.prescriptions 
FOR SELECT 
USING (auth.uid() = patient_id OR auth.uid() = doctor_id);

CREATE POLICY "Doctors can update their prescriptions" 
ON public.prescriptions 
FOR UPDATE 
USING (auth.uid() = doctor_id);

-- RLS Policies for Emergency Contacts
CREATE POLICY "Users can manage their emergency contacts" 
ON public.emergency_contacts 
FOR ALL 
USING (auth.uid() = user_id);

-- RLS Policies for Medical Documents
CREATE POLICY "Users can manage their baby's medical documents" 
ON public.medical_documents 
FOR ALL 
USING (auth.uid() = user_id);

CREATE POLICY "Doctors can view medical documents for their consultations" 
ON public.medical_documents 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM consultations 
  WHERE consultations.baby_id = medical_documents.baby_id 
  AND consultations.doctor_id = auth.uid()
));

-- RLS Policies for Video Sessions
CREATE POLICY "Consultation participants can access video sessions" 
ON public.video_sessions 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM consultations 
  WHERE consultations.id = video_sessions.consultation_id 
  AND (consultations.patient_id = auth.uid() OR consultations.doctor_id = auth.uid())
));

-- Triggers for updated_at columns
CREATE TRIGGER update_prescriptions_updated_at
BEFORE UPDATE ON public.prescriptions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_emergency_contacts_updated_at
BEFORE UPDATE ON public.emergency_contacts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_video_sessions_updated_at
BEFORE UPDATE ON public.video_sessions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();