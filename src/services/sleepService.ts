
import { supabase } from '@/integrations/supabase/client';
import { Sleep } from '@/types/models';

// Get sleeps for a specific baby
export const getSleepsByBabyId = async (babyId: string): Promise<Sleep[]> => {
  const { data, error } = await supabase
    .from('sleeps')
    .select('*')
    .eq('baby_id', babyId)
    .order('start_time', { ascending: false });
  
  if (error) throw error;
  
  return data.map((sleep) => ({
    id: sleep.id,
    babyId: sleep.baby_id,
    type: sleep.type as "nap" | "night",
    startTime: new Date(sleep.start_time),
    endTime: sleep.end_time ? new Date(sleep.end_time) : undefined,
    duration: sleep.duration,
    location: sleep.location,
    mood: sleep.mood as "happy" | "fussy" | "calm" | "crying",
    note: sleep.note,
  })) as Sleep[];
};

// Add a new sleep record
export const addSleep = async (sleep: Omit<Sleep, 'id'>): Promise<Sleep> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('sleeps')
    .insert({
      baby_id: sleep.babyId,
      type: sleep.type,
      start_time: sleep.startTime.toISOString(),
      end_time: sleep.endTime ? sleep.endTime.toISOString() : null,
      duration: sleep.duration,
      location: sleep.location,
      mood: sleep.mood,
      note: sleep.note,
      user_id: user.id,
    })
    .select()
    .single();
  
  if (error) throw error;
  
  return {
    id: data.id,
    babyId: data.baby_id,
    type: data.type as "nap" | "night",
    startTime: new Date(data.start_time),
    endTime: data.end_time ? new Date(data.end_time) : undefined,
    duration: data.duration,
    location: data.location,
    mood: data.mood as "happy" | "fussy" | "calm" | "crying",
    note: data.note,
  } as Sleep;
};
