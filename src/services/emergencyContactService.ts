import { supabase } from '@/integrations/supabase/client';

export interface EmergencyContact {
  id: string;
  userId: string;
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  address?: string;
  isPrimary: boolean;
  createdAt: Date;
}

export const getEmergencyContacts = async (userId: string): Promise<EmergencyContact[]> => {
  const { data, error } = await supabase
    .from('emergency_contacts')
    .select('*')
    .eq('user_id', userId)
    .order('is_primary', { ascending: false })
    .order('name');

  if (error) throw error;

  return data.map(record => ({
    id: record.id,
    userId: record.user_id,
    name: record.name,
    relationship: record.relationship,
    phone: record.phone,
    email: record.email,
    address: record.address,
    isPrimary: record.is_primary,
    createdAt: new Date(record.created_at),
  }));
};

export const createEmergencyContact = async (contact: Omit<EmergencyContact, 'id' | 'createdAt'>): Promise<EmergencyContact> => {
  // If setting as primary, first remove primary from all others
  if (contact.isPrimary) {
    await supabase
      .from('emergency_contacts')
      .update({ is_primary: false })
      .eq('user_id', contact.userId);
  }

  const { data, error } = await supabase
    .from('emergency_contacts')
    .insert({
      user_id: contact.userId,
      name: contact.name,
      relationship: contact.relationship,
      phone: contact.phone,
      email: contact.email,
      address: contact.address,
      is_primary: contact.isPrimary,
    })
    .select()
    .single();

  if (error) throw error;

  return {
    id: data.id,
    userId: data.user_id,
    name: data.name,
    relationship: data.relationship,
    phone: data.phone,
    email: data.email,
    address: data.address,
    isPrimary: data.is_primary,
    createdAt: new Date(data.created_at),
  };
};

export const updateEmergencyContact = async (contactId: string, updates: Partial<EmergencyContact>): Promise<void> => {
  const updateData: any = {};
  
  if (updates.name) updateData.name = updates.name;
  if (updates.relationship) updateData.relationship = updates.relationship;
  if (updates.phone) updateData.phone = updates.phone;
  if (updates.email !== undefined) updateData.email = updates.email;
  if (updates.address !== undefined) updateData.address = updates.address;
  if (updates.isPrimary !== undefined) {
    updateData.is_primary = updates.isPrimary;
    
    // If setting as primary, remove primary from all others
    if (updates.isPrimary && updates.userId) {
      await supabase
        .from('emergency_contacts')
        .update({ is_primary: false })
        .eq('user_id', updates.userId);
    }
  }

  const { error } = await supabase
    .from('emergency_contacts')
    .update(updateData)
    .eq('id', contactId);

  if (error) throw error;
};

export const deleteEmergencyContact = async (contactId: string): Promise<void> => {
  const { error } = await supabase
    .from('emergency_contacts')
    .delete()
    .eq('id', contactId);

  if (error) throw error;
};