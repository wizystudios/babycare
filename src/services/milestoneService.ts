
import { supabase } from '@/integrations/supabase/client';
import { Milestone } from '@/types/models';

// Get milestones for a specific baby
export const getMilestonesByBabyId = async (babyId: string): Promise<Milestone[]> => {
  const { data, error } = await supabase
    .from('milestones')
    .select('*')
    .eq('baby_id', babyId)
    .order('date', { ascending: false });
  
  if (error) {
    console.error('Error fetching milestones:', error);
    throw error;
  }
  
  return data.map((milestone) => ({
    id: milestone.id,
    babyId: milestone.baby_id,
    title: milestone.title,
    date: new Date(milestone.date),
    description: milestone.description,
    category: milestone.category,
    photoUrls: milestone.photo_urls || [],
  })) as Milestone[];
};

// Add a new milestone record
export const addMilestone = async (milestone: Omit<Milestone, 'id'>): Promise<Milestone> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('milestones')
    .insert({
      baby_id: milestone.babyId,
      title: milestone.title,
      date: milestone.date.toISOString(),
      description: milestone.description,
      category: milestone.category,
      photo_urls: milestone.photoUrls,
      user_id: user.id,
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error adding milestone:', error);
    throw error;
  }
  
  return {
    id: data.id,
    babyId: data.baby_id,
    title: data.title,
    date: new Date(data.date),
    description: data.description,
    category: data.category,
    photoUrls: data.photo_urls || [],
  } as Milestone;
};

// Delete a milestone
export const deleteMilestone = async (milestoneId: string): Promise<void> => {
  const { error } = await supabase
    .from('milestones')
    .delete()
    .eq('id', milestoneId);
  
  if (error) {
    console.error('Error deleting milestone:', error);
    throw error;
  }
};
