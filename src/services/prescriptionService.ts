import { supabase } from '@/integrations/supabase/client';

export interface Prescription {
  id: string;
  babyId: string;
  doctorId: string;
  patientId: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
  startDate: Date;
  endDate?: Date;
  status: 'active' | 'completed' | 'cancelled';
  prescribedAt: Date;
}

export const getPrescriptionsByPatient = async (patientId: string): Promise<Prescription[]> => {
  const { data, error } = await supabase
    .from('prescriptions')
    .select('*')
    .eq('patient_id', patientId)
    .order('prescribed_at', { ascending: false });

  if (error) throw error;

  return data.map(record => ({
    id: record.id,
    babyId: record.baby_id,
    doctorId: record.doctor_id,
    patientId: record.patient_id,
    medicationName: record.medication_name,
    dosage: record.dosage,
    frequency: record.frequency,
    duration: record.duration,
    instructions: record.instructions,
    startDate: new Date(record.start_date),
    endDate: record.end_date ? new Date(record.end_date) : undefined,
    status: record.status as Prescription['status'],
    prescribedAt: new Date(record.prescribed_at),
  }));
};

export const createPrescription = async (prescription: Omit<Prescription, 'id' | 'prescribedAt'>): Promise<Prescription> => {
  const { data, error } = await supabase
    .from('prescriptions')
    .insert({
      baby_id: prescription.babyId,
      doctor_id: prescription.doctorId,
      patient_id: prescription.patientId,
      medication_name: prescription.medicationName,
      dosage: prescription.dosage,
      frequency: prescription.frequency,
      duration: prescription.duration,
      instructions: prescription.instructions,
      start_date: prescription.startDate.toISOString(),
      end_date: prescription.endDate?.toISOString(),
      status: prescription.status,
    })
    .select()
    .single();

  if (error) throw error;

  return {
    id: data.id,
    babyId: data.baby_id,
    doctorId: data.doctor_id,
    patientId: data.patient_id,
    medicationName: data.medication_name,
    dosage: data.dosage,
    frequency: data.frequency,
    duration: data.duration,
    instructions: data.instructions,
    startDate: new Date(data.start_date),
    endDate: data.end_date ? new Date(data.end_date) : undefined,
    status: data.status as Prescription['status'],
    prescribedAt: new Date(data.prescribed_at),
  };
};

export const updatePrescriptionStatus = async (prescriptionId: string, status: 'active' | 'completed' | 'cancelled'): Promise<void> => {
  const { error } = await supabase
    .from('prescriptions')
    .update({ status })
    .eq('id', prescriptionId);

  if (error) throw error;
};