
import { supabase } from '@/integrations/supabase/client';
import { Diaper } from '@/types/models';

// Get diapers for a specific baby
export const getDiapersByBabyId = async (babyId: string): Promise<Diaper[]> => {
  const { data, error } = await supabase
    .from('diapers')
    .select('*')
    .eq('baby_id', babyId)
    .order('time', { ascending: false });
  
  if (error) throw error;
  
  return data.map((diaper) => ({
    id: diaper.id,
    babyId: diaper.baby_id,
    type: diaper.type as "wet" | "dirty" | "mixed",
    time: new Date(diaper.time),
    note: diaper.note,
  })) as Diaper[];
};

// Add a new diaper record
export const addDiaper = async (diaper: Omit<Diaper, 'id'>): Promise<Diaper> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('diapers')
    .insert({
      baby_id: diaper.babyId,
      type: diaper.type,
      time: diaper.time.toISOString(),
      note: diaper.note,
      user_id: user.id,
    })
    .select()
    .single();
  
  if (error) throw error;
  
  return {
    id: data.id,
    babyId: data.baby_id,
    type: data.type as "wet" | "dirty" | "mixed",
    time: new Date(data.time),
    note: data.note,
  } as Diaper;
};
