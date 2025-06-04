export type FeedingType = "breast-left" | "breast-right" | "bottle" | "formula" | "solid";

export type DiaperType = "wet" | "dirty" | "mixed";

export type SleepType = "nap" | "night";

export type MoodType = "happy" | "fussy" | "calm" | "crying";

// Updated role type to match database enum - simplified to only parent, doctor, and admin
export type UserRole = 'parent' | 'doctor' | 'admin';

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

// Updated interfaces to match new database structure
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
  country_code: string | null;
  specialization: string | null;
  license_number: string | null;
  hospital_affiliation: string | null;
  bio: string | null;
  role: UserRole;
  created_at: string;
}

// New interfaces for multi-role functionality
export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  created_at: string;
  data?: any;
}

export interface Consultation {
  id: string;
  patient_id: string;
  doctor_id: string;
  baby_id: string | null;
  type: 'audio' | 'video' | 'chat';
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  scheduled_at: string;
  started_at: string | null;
  ended_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface BabyReport {
  id: string;
  baby_id: string;
  parent_id: string;
  doctor_id: string | null;
  title: string;
  report_type: 'growth' | 'feeding' | 'sleep' | 'health' | 'milestone' | 'comprehensive';
  period_start: string;
  period_end: string;
  data: any;
  shared_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ReportRequest {
  id: string;
  doctor_id: string;
  parent_id: string;
  baby_id: string;
  report_type: 'growth' | 'feeding' | 'sleep' | 'health' | 'milestone' | 'comprehensive';
  period_start: string;
  period_end: string;
  message: string | null;
  status: 'pending' | 'approved' | 'declined' | 'fulfilled';
  created_at: string;
  updated_at: string;
}
