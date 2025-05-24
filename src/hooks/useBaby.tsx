
import { useState, useEffect } from 'react';
import { Baby } from '@/types/models';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export const useBaby = () => {
  const { user } = useAuth();
  const [babies, setBabies] = useState<Baby[]>([]);
  const [selectedBaby, setSelectedBaby] = useState<Baby | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchBabies();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const fetchBabies = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('babies')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const fetchedBabies = (data || []).map(baby => ({
        id: baby.id,
        name: baby.name,
        birthDate: new Date(baby.birth_date),
        gender: (baby.gender === 'male' || baby.gender === 'female' || baby.gender === 'other') 
          ? baby.gender as "male" | "female" | "other" 
          : 'other' as "male" | "female" | "other",
        weight: baby.weight || 0,
        height: baby.height || 0,
        photoUrl: baby.photo_url || '',
      }));

      setBabies(fetchedBabies);
      
      // Set selected baby (first one if none selected, or keep current if still exists)
      if (fetchedBabies.length > 0) {
        if (!selectedBaby || !fetchedBabies.find(b => b.id === selectedBaby.id)) {
          setSelectedBaby(fetchedBabies[0]);
        }
      } else {
        setSelectedBaby(null);
      }
    } catch (error) {
      console.error('Error fetching babies:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addBaby = async (babyData: Omit<Baby, 'id'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('babies')
        .insert([
          {
            name: babyData.name,
            birth_date: babyData.birthDate.toISOString(),
            gender: babyData.gender,
            weight: babyData.weight,
            height: babyData.height,
            photo_url: babyData.photoUrl,
            user_id: user.id
          }
        ])
        .select()
        .single();

      if (error) throw error;

      const newBaby: Baby = {
        id: data.id,
        name: data.name,
        birthDate: new Date(data.birth_date),
        gender: (data.gender === 'male' || data.gender === 'female' || data.gender === 'other') 
          ? data.gender as "male" | "female" | "other" 
          : 'other' as "male" | "female" | "other",
        weight: data.weight || 0,
        height: data.height || 0,
        photoUrl: data.photo_url || '',
      };

      setBabies(prev => [newBaby, ...prev]);
      setSelectedBaby(newBaby);
      
      return newBaby;
    } catch (error) {
      console.error('Error adding baby:', error);
      throw error;
    }
  };

  const selectBaby = (baby: Baby) => {
    console.log('Selecting baby:', baby.name);
    setSelectedBaby(baby);
  };

  const switchBaby = (babyId: string) => {
    const baby = babies.find(b => b.id === babyId);
    if (baby) {
      console.log('Switching to baby:', baby.name);
      setSelectedBaby(baby);
    }
  };

  const updateBaby = async (babyId: string, updates: Partial<Baby>) => {
    if (!user) return;

    try {
      const updateData: any = { ...updates };
      if (updates.birthDate) {
        updateData.birth_date = updates.birthDate.toISOString();
        delete updateData.birthDate;
      }

      const { data, error } = await supabase
        .from('babies')
        .update(updateData)
        .eq('id', babyId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      const updatedBaby: Baby = {
        id: data.id,
        name: data.name,
        birthDate: new Date(data.birth_date),
        gender: (data.gender === 'male' || data.gender === 'female' || data.gender === 'other') 
          ? data.gender as "male" | "female" | "other" 
          : 'other' as "male" | "female" | "other",
        weight: data.weight || 0,
        height: data.height || 0,
        photoUrl: data.photo_url || '',
      };

      setBabies(prev => prev.map(baby => baby.id === babyId ? updatedBaby : baby));
      
      if (selectedBaby?.id === babyId) {
        setSelectedBaby(updatedBaby);
      }

      return updatedBaby;
    } catch (error) {
      console.error('Error updating baby:', error);
      throw error;
    }
  };

  const deleteBaby = async (babyId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('babies')
        .delete()
        .eq('id', babyId)
        .eq('user_id', user.id);

      if (error) throw error;

      setBabies(prev => prev.filter(baby => baby.id !== babyId));
      
      if (selectedBaby?.id === babyId) {
        const remainingBabies = babies.filter(baby => baby.id !== babyId);
        setSelectedBaby(remainingBabies.length > 0 ? remainingBabies[0] : null);
      }
    } catch (error) {
      console.error('Error deleting baby:', error);
      throw error;
    }
  };

  return {
    babies,
    selectedBaby,
    currentBaby: selectedBaby,
    isLoading,
    addBaby,
    selectBaby,
    switchBaby,
    updateBaby,
    deleteBaby,
    refreshBabies: fetchBabies
  };
};
