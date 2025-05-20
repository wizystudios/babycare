
import { useEffect, useState } from 'react';
import { Baby } from '@/types/models';
import { getBabies } from '@/services/babyService';
import { useToast } from '@/components/ui/use-toast';
import { useQuery } from '@tanstack/react-query';

export const useBaby = () => {
  const [currentBaby, setCurrentBaby] = useState<Baby | null>(null);
  const { toast } = useToast();

  // Fetch babies using React Query for better caching and loading states
  const { 
    data: babies = [], 
    isLoading, 
    error,
    refetch
  } = useQuery({
    queryKey: ['babies'],
    queryFn: getBabies,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  useEffect(() => {
    if (babies.length > 0 && !currentBaby) {
      // Set current baby from local storage or use the first baby
      const savedBabyId = localStorage.getItem('currentBabyId');
      if (savedBabyId && babies.some(baby => baby.id === savedBabyId)) {
        setCurrentBaby(babies.find(baby => baby.id === savedBabyId) || null);
      } else if (babies.length > 0) {
        setCurrentBaby(babies[0]);
        localStorage.setItem('currentBabyId', babies[0].id);
      }
    }
  }, [babies, currentBaby]);

  const switchBaby = (babyId: string) => {
    const baby = babies.find(b => b.id === babyId);
    if (baby) {
      setCurrentBaby(baby);
      localStorage.setItem('currentBabyId', baby.id);
      
      toast({
        title: `Switched to ${baby.name}`,
        description: "You are now viewing data for this baby",
      });
    }
  };

  // Generate an avatar URL or initial for a baby
  const getBabyAvatar = (baby: Baby) => {
    if (baby.photoUrl) {
      return baby.photoUrl;
    }
    
    // Create a color based on the baby's name
    const stringToColor = (str: string) => {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
      }
      let color = '#';
      for (let i = 0; i < 3; i++) {
        const value = (hash >> (i * 8)) & 0xFF;
        color += ('00' + value.toString(16)).substr(-2);
      }
      return color;
    };
    
    const backgroundColor = stringToColor(baby.name);
    return {
      initials: baby.name.substring(0, 2).toUpperCase(),
      backgroundColor
    };
  };

  return {
    babies,
    currentBaby,
    isLoading,
    error,
    switchBaby,
    getBabyAvatar,
    refetchBabies: refetch
  };
};
