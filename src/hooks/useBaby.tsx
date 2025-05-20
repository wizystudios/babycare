
import { useEffect, useState } from 'react';
import { Baby } from '@/types/models';
import { getBabies } from '@/services/babyService';
import { useToast } from '@/components/ui/use-toast';

export const useBaby = () => {
  const [babies, setBabies] = useState<Baby[]>([]);
  const [currentBaby, setCurrentBaby] = useState<Baby | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchBabies = async () => {
      try {
        setIsLoading(true);
        const fetchedBabies = await getBabies();
        setBabies(fetchedBabies);
        
        // Set current baby from local storage or use the first baby
        const savedBabyId = localStorage.getItem('currentBabyId');
        if (savedBabyId && fetchedBabies.some(baby => baby.id === savedBabyId)) {
          setCurrentBaby(fetchedBabies.find(baby => baby.id === savedBabyId) || null);
        } else if (fetchedBabies.length > 0) {
          setCurrentBaby(fetchedBabies[0]);
          localStorage.setItem('currentBabyId', fetchedBabies[0].id);
        }
      } catch (error) {
        console.error('Error fetching babies:', error);
        toast({
          title: 'Error loading babies',
          description: 'Please try again later.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchBabies();
  }, [toast]);

  const switchBaby = (babyId: string) => {
    const baby = babies.find(b => b.id === babyId);
    if (baby) {
      setCurrentBaby(baby);
      localStorage.setItem('currentBabyId', baby.id);
    }
  };

  return {
    babies,
    currentBaby,
    isLoading,
    switchBaby,
  };
};
