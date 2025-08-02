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
  hasSeenTutorial: boolean;
  userId?: string;
}