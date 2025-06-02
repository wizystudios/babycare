
export type FeedingType = "breast-left" | "breast-right" | "bottle" | "formula" | "solid";

export type DiaperType = "wet" | "dirty" | "mixed";

export type SleepType = "nap" | "night";

export type MoodType = "happy" | "fussy" | "calm" | "crying";

export interface Baby {
  id: string;
  name: string;
  birthDate: Date;
  gender: "male" | "female" | "other";
  weight?: number; // in kg
  height?: number; // in cm
  photoUrl?: string;
}

export interface Feeding {
  id: string;
  babyId: string;
  type: FeedingType;
  startTime: Date;
  endTime?: Date;
  duration?: number; // in minutes
  amount?: number; // in ml or oz
  note?: string;
}

export interface Diaper {
  id: string;
  babyId: string;
  type: DiaperType;
  time: Date;
  note?: string;
}

export interface Sleep {
  id: string;
  babyId: string;
  type: SleepType;
  startTime: Date;
  endTime?: Date;
  duration?: number; // in minutes
  location?: string;
  mood?: MoodType;
  note?: string;
}

export interface Growth {
  id: string;
  babyId: string;
  date: Date;
  weight?: number; // in kg
  height?: number; // in cm
  headCircumference?: number; // in cm
  note?: string;
}

export interface Vaccination {
  id: string;
  babyId: string;
  name: string;
  date: Date;
  nextDueDate?: Date;
  batchNumber?: string;
  note?: string;
}

export interface Milestone {
  id: string;
  babyId: string;
  title: string;
  date: Date;
  description?: string;
  photoUrls?: string[];
  category?: string;
}

export interface HealthRecord {
  id: string;
  babyId: string;
  type: string; // e.g., "fever", "cough", "medication"
  date: Date;
  value?: string; // e.g., temperature value
  medication?: string;
  dosage?: string;
  note?: string;
}

// Admin-specific interfaces
export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  hospital_id: string | null;
  phone: string | null;
  email: string | null;
  experience: string | null;
  available: boolean;
  created_at: string;
  created_by: string | null;
  user_id: string | null;
  hospitals?: {
    name: string;
  } | null;
}

export interface Hospital {
  id: string;
  name: string;
  location: string;
  phone: string | null;
  email: string | null;
  services: string[] | null;
  description: string | null;
  created_at: string;
  created_by: string | null;
}

export interface UserProfile {
  id: string;
  full_name: string | null;
  phone: string | null;
  country: string | null;
  created_at: string;
  role: string;
}
