-- Create medications table for tracking baby medications
CREATE TABLE IF NOT EXISTS public.medications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  baby_id UUID NOT NULL,
  user_id UUID NOT NULL,
  medication_name TEXT NOT NULL,
  dosage TEXT NOT NULL,
  frequency TEXT NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE,
  times_per_day INTEGER NOT NULL DEFAULT 1,
  reminder_times TEXT[] NOT NULL,
  notes TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create medication doses table for tracking individual doses
CREATE TABLE IF NOT EXISTS public.medication_doses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  medication_id UUID NOT NULL REFERENCES public.medications(id) ON DELETE CASCADE,
  scheduled_time TIMESTAMP WITH TIME ZONE NOT NULL,
  taken_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medication_doses ENABLE ROW LEVEL SECURITY;

-- RLS Policies for medications
CREATE POLICY "Users can manage their baby medications"
  ON public.medications
  FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Doctors can view baby medications"
  ON public.medications
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM consultations
      WHERE consultations.baby_id = medications.baby_id
      AND consultations.doctor_id = auth.uid()
    )
  );

-- RLS Policies for medication_doses
CREATE POLICY "Users can manage their medication doses"
  ON public.medication_doses
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM medications
      WHERE medications.id = medication_doses.medication_id
      AND medications.user_id = auth.uid()
    )
  );

-- Create function to automatically create doses when medication is added
CREATE OR REPLACE FUNCTION create_medication_doses()
RETURNS TRIGGER AS $$
DECLARE
  dose_time TEXT;
  dose_date TIMESTAMP WITH TIME ZONE;
  final_date TIMESTAMP WITH TIME ZONE;
BEGIN
  dose_date := NEW.start_date;
  final_date := COALESCE(NEW.end_date, NEW.start_date + INTERVAL '30 days');
  
  WHILE dose_date <= final_date LOOP
    FOREACH dose_time IN ARRAY NEW.reminder_times LOOP
      INSERT INTO medication_doses (medication_id, scheduled_time, status)
      VALUES (
        NEW.id,
        (dose_date::date || ' ' || dose_time)::timestamp with time zone,
        'pending'
      );
    END LOOP;
    dose_date := dose_date + INTERVAL '1 day';
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- Create trigger
CREATE TRIGGER create_doses_on_medication_insert
  AFTER INSERT ON medications
  FOR EACH ROW
  EXECUTE FUNCTION create_medication_doses();

-- Create updated_at trigger for medications
CREATE TRIGGER update_medications_updated_at
  BEFORE UPDATE ON medications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();