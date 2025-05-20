
import { supabase } from '@/integrations/supabase/client';
import { Feeding } from '@/types/models';

// Get feedings for a specific baby
export const getFeedingsByBabyId = async (babyId: string): Promise<Feeding[]> => {
  const { data, error } = await supabase
    .from('feedings')
    .select('*')
    .eq('baby_id', babyId)
    .order('start_time', { ascending: false });
  
  if (error) throw error;
  
  return data.map((feeding) => ({
    id: feeding.id,
    babyId: feeding.baby_id,
    type: feeding.type,
    startTime: new Date(feeding.start_time),
    endTime: feeding.end_time ? new Date(feeding.end_time) : undefined,
    duration: feeding.duration,
    amount: feeding.amount,
    note: feeding.note,
  })) as Feeding[];
};

// Add a new feeding record
export const addFeeding = async (feeding: Omit<Feeding, 'id'>): Promise<Feeding> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('feedings')
    .insert({
      baby_id: feeding.babyId,
      type: feeding.type,
      start_time: feeding.startTime.toISOString(),
      end_time: feeding.endTime ? feeding.endTime.toISOString() : null,
      duration: feeding.duration,
      amount: feeding.amount,
      note: feeding.note,
      user_id: user.id,
    })
    .select()
    .single();
  
  if (error) throw error;
  
  return {
    id: data.id,
    babyId: data.baby_id,
    type: data.type,
    startTime: new Date(data.start_time),
    endTime: data.end_time ? new Date(data.end_time) : undefined,
    duration: data.duration,
    amount: data.amount,
    note: data.note,
  } as Feeding;
};
