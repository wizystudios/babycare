import { supabase } from '@/integrations/supabase/client';

export interface Medication {
  id: string;
  babyId: string;
  userId: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  startDate: Date;
  endDate?: Date;
  timesPerDay: number;
  reminderTimes: string[];
  notes?: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface MedicationDose {
  id: string;
  medicationId: string;
  scheduledTime: Date;
  takenAt?: Date;
  status: 'pending' | 'taken' | 'missed' | 'skipped';
  notes?: string;
  createdAt: Date;
}

export const getMedicationsByBabyId = async (babyId: string): Promise<Medication[]> => {
  const { data, error } = await supabase
    .from('medications')
    .select('*')
    .eq('baby_id', babyId)
    .eq('active', true)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  
  return data.map((med) => ({
    id: med.id,
    babyId: med.baby_id,
    userId: med.user_id,
    medicationName: med.medication_name,
    dosage: med.dosage,
    frequency: med.frequency,
    startDate: new Date(med.start_date),
    endDate: med.end_date ? new Date(med.end_date) : undefined,
    timesPerDay: med.times_per_day,
    reminderTimes: med.reminder_times,
    notes: med.notes,
    active: med.active,
    createdAt: new Date(med.created_at),
    updatedAt: new Date(med.updated_at),
  })) as Medication[];
};

export const addMedication = async (medication: Omit<Medication, 'id' | 'createdAt' | 'updatedAt'>): Promise<Medication> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('medications')
    .insert({
      baby_id: medication.babyId,
      user_id: user.id,
      medication_name: medication.medicationName,
      dosage: medication.dosage,
      frequency: medication.frequency,
      start_date: medication.startDate.toISOString(),
      end_date: medication.endDate?.toISOString(),
      times_per_day: medication.timesPerDay,
      reminder_times: medication.reminderTimes,
      notes: medication.notes,
      active: medication.active,
    })
    .select()
    .single();
  
  if (error) throw error;
  
  return {
    id: data.id,
    babyId: data.baby_id,
    userId: data.user_id,
    medicationName: data.medication_name,
    dosage: data.dosage,
    frequency: data.frequency,
    startDate: new Date(data.start_date),
    endDate: data.end_date ? new Date(data.end_date) : undefined,
    timesPerDay: data.times_per_day,
    reminderTimes: data.reminder_times,
    notes: data.notes,
    active: data.active,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  } as Medication;
};

export const getTodaysDoses = async (babyId: string): Promise<(MedicationDose & { medication: Medication })[]> => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const { data, error } = await supabase
    .from('medication_doses')
    .select(`
      *,
      medications:medication_id (*)
    `)
    .gte('scheduled_time', startOfDay.toISOString())
    .lte('scheduled_time', endOfDay.toISOString())
    .eq('medications.baby_id', babyId)
    .order('scheduled_time', { ascending: true });
  
  if (error) throw error;
  
  return data.map((dose: any) => ({
    id: dose.id,
    medicationId: dose.medication_id,
    scheduledTime: new Date(dose.scheduled_time),
    takenAt: dose.taken_at ? new Date(dose.taken_at) : undefined,
    status: dose.status,
    notes: dose.notes,
    createdAt: new Date(dose.created_at),
    medication: {
      id: dose.medications.id,
      babyId: dose.medications.baby_id,
      userId: dose.medications.user_id,
      medicationName: dose.medications.medication_name,
      dosage: dose.medications.dosage,
      frequency: dose.medications.frequency,
      startDate: new Date(dose.medications.start_date),
      endDate: dose.medications.end_date ? new Date(dose.medications.end_date) : undefined,
      timesPerDay: dose.medications.times_per_day,
      reminderTimes: dose.medications.reminder_times,
      notes: dose.medications.notes,
      active: dose.medications.active,
      createdAt: new Date(dose.medications.created_at),
      updatedAt: new Date(dose.medications.updated_at),
    },
  }));
};

export const markDoseAsTaken = async (doseId: string): Promise<void> => {
  const { error } = await supabase
    .from('medication_doses')
    .update({ 
      status: 'taken',
      taken_at: new Date().toISOString()
    })
    .eq('id', doseId);

  if (error) throw error;
};

export const markDoseAsSkipped = async (doseId: string, notes?: string): Promise<void> => {
  const { error } = await supabase
    .from('medication_doses')
    .update({ 
      status: 'skipped',
      notes: notes
    })
    .eq('id', doseId);

  if (error) throw error;
};
