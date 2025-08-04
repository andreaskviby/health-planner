// lib/types.ts
export interface UserProfile {
  id: string;
  name: string;
  currentWeight: number;
  targetWeight: number;
  height: number;
  age: number;
  goals: string[];
  lifestyle: string[];
  hasSeenTutorial?: boolean;
}

export interface Partner {
  id: string;
  name: string;
  connected: boolean;
  lastSync: Date | null;
}

export interface FoodList {
  yes: string[];
  no: string[];
  sometimes: string[];
}

export interface HealthPlan {
  id: string;
  userId: string;
  plan: string;
  exercises: string[];
  recipes: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Recipe {
  id: string;
  userId: string;
  title: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  cookingTime: string;
  servings: string;
  source: 'manual' | 'link' | 'ai';
  sourceUrl?: string;
  createdAt: Date;
}

export interface Activity {
  id: string;
  userId: string;
  name: string;
  description: string;
  duration: string;
  difficulty: 'Lätt' | 'Medel' | 'Svår';
  category: 'Kondition' | 'Styrka' | 'Flexibilitet' | 'Balans' | 'Mental hälsa' | 'Utomhus' | 'Grupp';
  source: 'manual' | 'ai';
  createdAt: Date;
}

export interface DailyCheckIn {
  id: string;
  userId: string;
  date: Date;
  mood: number; // 1-10
  energy: number; // 1-10
  weight?: number;
  notes: string;
  activities: string[];
}

export interface BluetoothSync {
  isHuggingMode: boolean;
  partnerDevice: BluetoothDevice | null;
  isConnected: boolean;
}

export interface AppSettings {
  id?: string;
  hasSeenTutorial: boolean;
  userId?: string;
}

export interface AppVersion {
  id: string;
  version: string;
  buildDate: string;
  lastChecked?: string;
  updateAvailable?: boolean;
}