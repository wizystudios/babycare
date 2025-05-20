
import { supabase } from '@/integrations/supabase/client';
import { Baby } from '@/types/models';

// Get babies
export const getBabies = async (): Promise<Baby[]> => {
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');
  
  const { data, error } = await supabase
    .from('babies')
    .select('*')
    .eq('user_id', user.id);
  
  if (error) throw error;
  
  return data.map((baby) => ({
    id: baby.id,
    name: baby.name,
    birthDate: new Date(baby.birth_date),
    gender: baby.gender as "male" | "female" | "other",
    weight: baby.weight,
    height: baby.height,
    photoUrl: baby.photo_url,
  })) as Baby[];
};

// Get baby by ID
export const getBabyById = async (id: string): Promise<Baby> => {
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');
  
  const { data, error } = await supabase
    .from('babies')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();
  
  if (error) throw error;
  
  return {
    id: data.id,
    name: data.name,
    birthDate: new Date(data.birth_date),
    gender: data.gender as "male" | "female" | "other",
    weight: data.weight,
    height: data.height,
    photoUrl: data.photo_url,
  } as Baby;
};

// Add baby
export const addBaby = async (baby: Omit<Baby, 'id'>): Promise<Baby> => {
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('babies')
    .insert({
      name: baby.name,
      birth_date: baby.birthDate.toISOString(),
      gender: baby.gender,
      weight: baby.weight,
      height: baby.height,
      photo_url: baby.photoUrl,
      user_id: user.id,  // Adding the user_id field
    })
    .select()
    .single();
  
  if (error) throw error;
  
  return {
    id: data.id,
    name: data.name,
    birthDate: new Date(data.birth_date),
    gender: data.gender as "male" | "female" | "other",
    weight: data.weight,
    height: data.height,
    photoUrl: data.photo_url,
  } as Baby;
};

// Update baby
export const updateBaby = async (baby: Baby): Promise<Baby> => {
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('babies')
    .update({
      name: baby.name,
      birth_date: baby.birthDate.toISOString(),
      gender: baby.gender,
      weight: baby.weight,
      height: baby.height,
      photo_url: baby.photoUrl,
    })
    .eq('id', baby.id)
    .eq('user_id', user.id)
    .select()
    .single();
  
  if (error) throw error;
  
  return {
    id: data.id,
    name: data.name,
    birthDate: new Date(data.birth_date),
    gender: data.gender as "male" | "female" | "other",
    weight: data.weight,
    height: data.height,
    photoUrl: data.photo_url,
  } as Baby;
};

// Delete baby
export const deleteBaby = async (id: string): Promise<boolean> => {
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');
  
  const { error } = await supabase
    .from('babies')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);
  
  if (error) throw error;
  
  return true;
};
