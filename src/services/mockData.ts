
import {
  Baby,
  Feeding,
  Diaper,
  Sleep,
  Growth,
  Vaccination,
  Milestone,
  HealthRecord,
} from "@/types/models";

// Helper function to generate random ID
const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15);
};

// Sample baby data
export const mockBaby: Baby = {
  id: "baby1",
  name: "Alex",
  birthDate: new Date(2024, 0, 15), // January 15, 2024
  gender: "male",
  weight: 3.5, // kg
  height: 50, // cm
};

// Generate today and dates within the past 48 hours
const now = new Date();
const yesterday = new Date(now);
yesterday.setDate(now.getDate() - 1);

const twoDaysAgo = new Date(now);
twoDaysAgo.setDate(now.getDate() - 2);

// Sample feeding data
export const mockFeedings: Feeding[] = [
  {
    id: generateId(),
    babyId: "baby1",
    type: "breast-left",
    startTime: new Date(now.getTime() - 2 * 60 * 60 * 1000), // 2 hours ago
    endTime: new Date(now.getTime() - 1.5 * 60 * 60 * 1000), // 1.5 hours ago
    duration: 30, // 30 minutes
    note: "Good feeding session",
  },
  {
    id: generateId(),
    babyId: "baby1",
    type: "bottle",
    startTime: new Date(now.getTime() - 6 * 60 * 60 * 1000), // 6 hours ago
    endTime: new Date(now.getTime() - 5.75 * 60 * 60 * 1000), // 5.75 hours ago
    duration: 15, // 15 minutes
    amount: 120, // 120 ml
  },
  {
    id: generateId(),
    babyId: "baby1",
    type: "breast-right",
    startTime: new Date(now.getTime() - 10 * 60 * 60 * 1000), // 10 hours ago
    endTime: new Date(now.getTime() - 9.5 * 60 * 60 * 1000), // 9.5 hours ago
    duration: 30, // 30 minutes
  },
  {
    id: generateId(),
    babyId: "baby1",
    type: "formula",
    startTime: new Date(yesterday.getTime() + 10 * 60 * 60 * 1000), // Yesterday + 10 hours
    endTime: new Date(yesterday.getTime() + 10.25 * 60 * 60 * 1000), // Yesterday + 10.25 hours
    duration: 15, // 15 minutes
    amount: 150, // 150 ml
    note: "Used new formula brand",
  },
  {
    id: generateId(),
    babyId: "baby1",
    type: "solid",
    startTime: new Date(yesterday.getTime() + 6 * 60 * 60 * 1000), // Yesterday + 6 hours
    endTime: new Date(yesterday.getTime() + 6.5 * 60 * 60 * 1000), // Yesterday + 6.5 hours
    duration: 30, // 30 minutes
    note: "First time trying banana puree",
  },
];

// Sample diaper data
export const mockDiapers: Diaper[] = [
  {
    id: generateId(),
    babyId: "baby1",
    type: "wet",
    time: new Date(now.getTime() - 3 * 60 * 60 * 1000), // 3 hours ago
  },
  {
    id: generateId(),
    babyId: "baby1",
    type: "dirty",
    time: new Date(now.getTime() - 8 * 60 * 60 * 1000), // 8 hours ago
    note: "Soft consistency",
  },
  {
    id: generateId(),
    babyId: "baby1",
    type: "wet",
    time: new Date(yesterday.getTime() + 12 * 60 * 60 * 1000), // Yesterday + 12 hours
  },
  {
    id: generateId(),
    babyId: "baby1",
    type: "mixed",
    time: new Date(yesterday.getTime() + 6 * 60 * 60 * 1000), // Yesterday + 6 hours
    note: "Normal color",
  },
];

// Sample sleep data
export const mockSleeps: Sleep[] = [
  {
    id: generateId(),
    babyId: "baby1",
    type: "nap",
    startTime: new Date(now.getTime() - 4 * 60 * 60 * 1000), // 4 hours ago
    endTime: new Date(now.getTime() - 3 * 60 * 60 * 1000), // 3 hours ago
    duration: 60, // 60 minutes
    location: "Crib",
    mood: "happy",
  },
  {
    id: generateId(),
    babyId: "baby1",
    type: "night",
    startTime: new Date(now.getTime() - 20 * 60 * 60 * 1000), // 20 hours ago
    endTime: new Date(now.getTime() - 12 * 60 * 60 * 1000), // 12 hours ago
    duration: 480, // 8 hours
    location: "Crib",
    mood: "calm",
  },
  {
    id: generateId(),
    babyId: "baby1",
    type: "nap",
    startTime: new Date(yesterday.getTime() + 4 * 60 * 60 * 1000), // Yesterday + 4 hours
    endTime: new Date(yesterday.getTime() + 5.5 * 60 * 60 * 1000), // Yesterday + 5.5 hours
    duration: 90, // 90 minutes
    location: "Stroller",
    mood: "fussy",
    note: "Woke up when stroller stopped",
  },
];

// Sample growth data
export const mockGrowth: Growth[] = [
  {
    id: generateId(),
    babyId: "baby1",
    date: new Date(2024, 0, 15), // Birth date
    weight: 3.5, // kg
    height: 50, // cm
    headCircumference: 35, // cm
    note: "Birth measurements",
  },
  {
    id: generateId(),
    babyId: "baby1",
    date: new Date(2024, 1, 15), // 1 month checkup
    weight: 4.2, // kg
    height: 53, // cm
    headCircumference: 37, // cm
    note: "1 month checkup",
  },
  {
    id: generateId(),
    babyId: "baby1",
    date: new Date(2024, 3, 15), // 3 month checkup
    weight: 5.8, // kg
    height: 59, // cm
    headCircumference: 40, // cm
    note: "3 month checkup - healthy growth",
  },
];

// Sample vaccination data
export const mockVaccinations: Vaccination[] = [
  {
    id: generateId(),
    babyId: "baby1",
    name: "Hepatitis B",
    date: new Date(2024, 0, 15), // Birth
    nextDueDate: new Date(2024, 1, 15), // 1 month
    batchNumber: "HB123456",
  },
  {
    id: generateId(),
    babyId: "baby1",
    name: "DTaP",
    date: new Date(2024, 1, 15), // 1 month
    nextDueDate: new Date(2024, 3, 15), // 3 months
    batchNumber: "DT789012",
    note: "Slight fever after vaccination",
  },
  {
    id: generateId(),
    babyId: "baby1",
    name: "Rotavirus",
    date: new Date(2024, 1, 15), // 1 month
    nextDueDate: new Date(2024, 3, 15), // 3 months
    batchNumber: "RV345678",
  },
];

// Sample milestone data
export const mockMilestones: Milestone[] = [
  {
    id: generateId(),
    babyId: "baby1",
    title: "First Smile",
    date: new Date(2024, 1, 1), // February 1, 2024
    description: "Alex smiled for the first time while being changed",
    category: "Social",
  },
  {
    id: generateId(),
    babyId: "baby1",
    title: "Rolled Over",
    date: new Date(2024, 2, 15), // March 15, 2024
    description: "Rolled from back to side during tummy time",
    category: "Motor Skills",
  },
  {
    id: generateId(),
    babyId: "baby1",
    title: "First Laugh",
    date: new Date(2024, 3, 1), // April 1, 2024
    description: "Laughed out loud when playing peek-a-boo",
    category: "Social",
  },
];

// Sample health record data
export const mockHealthRecords: HealthRecord[] = [
  {
    id: generateId(),
    babyId: "baby1",
    type: "fever",
    date: new Date(2024, 1, 20), // February 20, 2024
    value: "38.2°C",
    note: "Slight fever after vaccination",
  },
  {
    id: generateId(),
    babyId: "baby1",
    type: "medication",
    date: new Date(2024, 1, 20), // February 20, 2024
    medication: "Infant Paracetamol",
    dosage: "2.5ml",
    note: "Given for fever",
  },
  {
    id: generateId(),
    babyId: "baby1",
    type: "cough",
    date: new Date(2024, 2, 5), // March 5, 2024
    note: "Mild cough in the morning",
  },
];

// Mock Storage Service to save and retrieve data
export class MockStorage {
  private static baby: Baby = mockBaby;
  private static feedings: Feeding[] = mockFeedings;
  private static diapers: Diaper[] = mockDiapers;
  private static sleeps: Sleep[] = mockSleeps;
  private static growth: Growth[] = mockGrowth;
  private static vaccinations: Vaccination[] = mockVaccinations;
  private static milestones: Milestone[] = mockMilestones;
  private static healthRecords: HealthRecord[] = mockHealthRecords;

  // Baby methods
  static getBaby(): Baby {
    return this.baby;
  }

  static updateBaby(baby: Baby): Baby {
    this.baby = baby;
    return this.baby;
  }

  // Feeding methods
  static getFeedings(): Feeding[] {
    return this.feedings.sort((a, b) => b.startTime.getTime() - a.startTime.getTime());
  }

  static addFeeding(feeding: Omit<Feeding, 'id'>): Feeding {
    const newFeeding = { ...feeding, id: generateId() };
    this.feedings.push(newFeeding);
    return newFeeding;
  }

  static updateFeeding(feeding: Feeding): Feeding {
    const index = this.feedings.findIndex((f) => f.id === feeding.id);
    if (index !== -1) {
      this.feedings[index] = feeding;
    }
    return feeding;
  }

  static deleteFeeding(id: string): boolean {
    const initialLength = this.feedings.length;
    this.feedings = this.feedings.filter((f) => f.id !== id);
    return initialLength > this.feedings.length;
  }

  // Diaper methods
  static getDiapers(): Diaper[] {
    return this.diapers.sort((a, b) => b.time.getTime() - a.time.getTime());
  }

  static addDiaper(diaper: Omit<Diaper, 'id'>): Diaper {
    const newDiaper = { ...diaper, id: generateId() };
    this.diapers.push(newDiaper);
    return newDiaper;
  }

  static updateDiaper(diaper: Diaper): Diaper {
    const index = this.diapers.findIndex((d) => d.id === diaper.id);
    if (index !== -1) {
      this.diapers[index] = diaper;
    }
    return diaper;
  }

  static deleteDiaper(id: string): boolean {
    const initialLength = this.diapers.length;
    this.diapers = this.diapers.filter((d) => d.id !== id);
    return initialLength > this.diapers.length;
  }

  // Sleep methods
  static getSleeps(): Sleep[] {
    return this.sleeps.sort((a, b) => b.startTime.getTime() - a.startTime.getTime());
  }

  static addSleep(sleep: Omit<Sleep, 'id'>): Sleep {
    const newSleep = { ...sleep, id: generateId() };
    this.sleeps.push(newSleep);
    return newSleep;
  }

  static updateSleep(sleep: Sleep): Sleep {
    const index = this.sleeps.findIndex((s) => s.id === sleep.id);
    if (index !== -1) {
      this.sleeps[index] = sleep;
    }
    return sleep;
  }

  static deleteSleep(id: string): boolean {
    const initialLength = this.sleeps.length;
    this.sleeps = this.sleeps.filter((s) => s.id !== id);
    return initialLength > this.sleeps.length;
  }

  // Growth methods
  static getGrowth(): Growth[] {
    return this.growth.sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  static addGrowth(growth: Omit<Growth, 'id'>): Growth {
    const newGrowth = { ...growth, id: generateId() };
    this.growth.push(newGrowth);
    return newGrowth;
  }

  static updateGrowth(growth: Growth): Growth {
    const index = this.growth.findIndex((g) => g.id === growth.id);
    if (index !== -1) {
      this.growth[index] = growth;
    }
    return growth;
  }

  static deleteGrowth(id: string): boolean {
    const initialLength = this.growth.length;
    this.growth = this.growth.filter((g) => g.id !== id);
    return initialLength > this.growth.length;
  }

  // Vaccination methods
  static getVaccinations(): Vaccination[] {
    return this.vaccinations.sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  static addVaccination(vaccination: Omit<Vaccination, 'id'>): Vaccination {
    const newVaccination = { ...vaccination, id: generateId() };
    this.vaccinations.push(newVaccination);
    return newVaccination;
  }

  static updateVaccination(vaccination: Vaccination): Vaccination {
    const index = this.vaccinations.findIndex((v) => v.id === vaccination.id);
    if (index !== -1) {
      this.vaccinations[index] = vaccination;
    }
    return vaccination;
  }

  static deleteVaccination(id: string): boolean {
    const initialLength = this.vaccinations.length;
    this.vaccinations = this.vaccinations.filter((v) => v.id !== id);
    return initialLength > this.vaccinations.length;
  }

  // Milestone methods
  static getMilestones(): Milestone[] {
    return this.milestones.sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  static addMilestone(milestone: Omit<Milestone, 'id'>): Milestone {
    const newMilestone = { ...milestone, id: generateId() };
    this.milestones.push(newMilestone);
    return newMilestone;
  }

  static updateMilestone(milestone: Milestone): Milestone {
    const index = this.milestones.findIndex((m) => m.id === milestone.id);
    if (index !== -1) {
      this.milestones[index] = milestone;
    }
    return milestone;
  }

  static deleteMilestone(id: string): boolean {
    const initialLength = this.milestones.length;
    this.milestones = this.milestones.filter((m) => m.id !== id);
    return initialLength > this.milestones.length;
  }

  // Health Record methods
  static getHealthRecords(): HealthRecord[] {
    return this.healthRecords.sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  static addHealthRecord(healthRecord: Omit<HealthRecord, 'id'>): HealthRecord {
    const newHealthRecord = { ...healthRecord, id: generateId() };
    this.healthRecords.push(newHealthRecord);
    return newHealthRecord;
  }

  static updateHealthRecord(healthRecord: HealthRecord): HealthRecord {
    const index = this.healthRecords.findIndex((h) => h.id === healthRecord.id);
    if (index !== -1) {
      this.healthRecords[index] = healthRecord;
    }
    return healthRecord;
  }

  static deleteHealthRecord(id: string): boolean {
    const initialLength = this.healthRecords.length;
    this.healthRecords = this.healthRecords.filter((h) => h.id !== id);
    return initialLength > this.healthRecords.length;
  }
}
