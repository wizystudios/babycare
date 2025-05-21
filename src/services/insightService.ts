
import { Feeding, Diaper, Sleep, Growth } from '@/types/models';
import { supabase } from '@/integrations/supabase/client';
import { differenceInMonths } from 'date-fns';

// Get combined insights data for dashboard
export const getInsightsData = async (babyId: string) => {
  try {
    // Fetch all required data in parallel
    const [feedings, diapers, sleeps, growthRecords] = await Promise.all([
      getFeedingsByBabyId(babyId),
      getDiapersByBabyId(babyId),
      getSleepsByBabyId(babyId),
      getGrowthRecordsByBabyId(babyId)
    ]);
    
    return {
      feedings,
      diapers,
      sleeps,
      growthRecords
    };
  } catch (error) {
    console.error('Error fetching insights data:', error);
    throw error;
  }
};

// Get feedings for a baby
async function getFeedingsByBabyId(babyId: string): Promise<Feeding[]> {
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
}

// Get diapers for a baby
async function getDiapersByBabyId(babyId: string): Promise<Diaper[]> {
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
}

// Get sleeps for a baby
async function getSleepsByBabyId(babyId: string): Promise<Sleep[]> {
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
    mood: sleep.mood,
    note: sleep.note,
  })) as Sleep[];
}

// Get growth records for a baby
async function getGrowthRecordsByBabyId(babyId: string): Promise<Growth[]> {
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
}

// Calculate growth percentiles based on WHO standards
export const calculatePercentile = (
  value: number,
  ageInMonths: number,
  gender: 'male' | 'female',
  metric: 'weight' | 'height' | 'headCircumference'
): number => {
  // Simplified percentile calculator - in a real app, this would use complete WHO data
  // This is just a demo approximation
  
  // Return a number between 0-100 representing the percentile
  // This is a placeholder implementation
  
  // In a real implementation, we would:
  // 1. Have complete WHO data tables for different ages, genders, and metrics
  // 2. Find the closest age in the table
  // 3. Compare the value to the distribution to find the percentile
  
  // For demo purposes, we'll just return an approximate percentile based on typical values
  if (metric === 'weight') {
    if (gender === 'male') {
      if (ageInMonths <= 1) {
        // Newborn to 1 month
        if (value < 3.5) return 10;
        if (value < 4.0) return 50;
        return 90;
      } else if (ageInMonths <= 6) {
        // 1-6 months
        if (value < 6.0) return 10;
        if (value < 7.5) return 50;
        return 90;
      } else if (ageInMonths <= 12) {
        // 6-12 months
        if (value < 8.0) return 10;
        if (value < 9.5) return 50;
        return 90;
      } else {
        // 12+ months
        if (value < 10.0) return 10;
        if (value < 12.0) return 50;
        return 90;
      }
    } else {
      // Female
      if (ageInMonths <= 1) {
        if (value < 3.3) return 10;
        if (value < 3.8) return 50;
        return 90;
      } else if (ageInMonths <= 6) {
        if (value < 5.5) return 10;
        if (value < 7.0) return 50;
        return 90;
      } else if (ageInMonths <= 12) {
        if (value < 7.5) return 10;
        if (value < 9.0) return 50;
        return 90;
      } else {
        if (value < 9.5) return 10;
        if (value < 11.5) return 50;
        return 90;
      }
    }
  } else if (metric === 'height') {
    // Similar logic for height
    return 50; // Placeholder
  } else {
    // Similar logic for head circumference
    return 50; // Placeholder
  }
};
