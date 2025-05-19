
import { supabase } from '@/integrations/supabase/client';
import { Growth, Vaccination, HealthRecord } from '@/types/models';

// Get growth records
export const getGrowthRecords = async (babyId: string) => {
  const { data, error } = await supabase
    .from('growth_records')
    .select('*')
    .eq('baby_id', babyId)
    .order('date', { ascending: false });
  
  if (error) throw error;
  
  return data.map((record) => ({
    id: record.id,
    babyId: record.baby_id,
    date: new Date(record.date),
    weight: record.weight,
    height: record.height,
    headCircumference: record.head_circumference,
    note: record.note,
  })) as Growth[];
};

// Add growth record
export const addGrowthRecord = async (growth: Omit<Growth, 'id'>) => {
  const { data, error } = await supabase
    .from('growth_records')
    .insert({
      baby_id: growth.babyId,
      date: growth.date.toISOString(),
      weight: growth.weight,
      height: growth.height,
      head_circumference: growth.headCircumference,
      note: growth.note,
    })
    .select()
    .single();
  
  if (error) throw error;
  
  return {
    id: data.id,
    babyId: data.baby_id,
    date: new Date(data.date),
    weight: data.weight,
    height: data.height,
    headCircumference: data.head_circumference,
    note: data.note,
  } as Growth;
};

// Get vaccinations
export const getVaccinations = async (babyId: string) => {
  const { data, error } = await supabase
    .from('vaccinations')
    .select('*')
    .eq('baby_id', babyId)
    .order('date', { ascending: false });
  
  if (error) throw error;
  
  return data.map((record) => ({
    id: record.id,
    babyId: record.baby_id,
    name: record.name,
    date: new Date(record.date),
    nextDueDate: record.next_due_date ? new Date(record.next_due_date) : undefined,
    batchNumber: record.batch_number,
    note: record.note,
  })) as Vaccination[];
};

// Add vaccination
export const addVaccination = async (vaccination: Omit<Vaccination, 'id'>) => {
  const { data, error } = await supabase
    .from('vaccinations')
    .insert({
      baby_id: vaccination.babyId,
      name: vaccination.name,
      date: vaccination.date.toISOString(),
      next_due_date: vaccination.nextDueDate?.toISOString(),
      batch_number: vaccination.batchNumber,
      note: vaccination.note,
    })
    .select()
    .single();
  
  if (error) throw error;
  
  return {
    id: data.id,
    babyId: data.baby_id,
    name: data.name,
    date: new Date(data.date),
    nextDueDate: data.next_due_date ? new Date(data.next_due_date) : undefined,
    batchNumber: data.batch_number,
    note: data.note,
  } as Vaccination;
};

// Get health records
export const getHealthRecords = async (babyId: string) => {
  const { data, error } = await supabase
    .from('health_records')
    .select('*')
    .eq('baby_id', babyId)
    .order('date', { ascending: false });
  
  if (error) throw error;
  
  return data.map((record) => ({
    id: record.id,
    babyId: record.baby_id,
    type: record.type,
    date: new Date(record.date),
    value: record.value,
    medication: record.medication,
    dosage: record.dosage,
    note: record.note,
  })) as HealthRecord[];
};

// Add health record
export const addHealthRecord = async (healthRecord: Omit<HealthRecord, 'id'>) => {
  const { data, error } = await supabase
    .from('health_records')
    .insert({
      baby_id: healthRecord.babyId,
      type: healthRecord.type,
      date: healthRecord.date.toISOString(),
      value: healthRecord.value,
      medication: healthRecord.medication,
      dosage: healthRecord.dosage,
      note: healthRecord.note,
    })
    .select()
    .single();
  
  if (error) throw error;
  
  return {
    id: data.id,
    babyId: data.baby_id,
    type: data.type,
    date: new Date(data.date),
    value: data.value,
    medication: data.medication,
    dosage: data.dosage,
    note: data.note,
  } as HealthRecord;
};
