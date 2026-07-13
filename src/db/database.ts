import Dexie, { Table } from 'dexie';

export interface UserProfile {
  id: number;
  name: string;
  gender: 'male' | 'female';
  birthYear: number;
  height: number; // cm
  goalWeight: number; // kg
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  goal: 'lose' | 'maintain' | 'gain';
  dailyCalorieTarget: number;
  createdAt: string;
}

export interface WeightEntry {
  id?: number;
  date: string; // YYYY-MM-DD
  weight: number; // kg
  note?: string;
}

export interface FoodEntry {
  id?: number;
  date: string; // YYYY-MM-DD
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  foodName: string;
  amount: number; // grams
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  createdAt: string;
}

export interface ExerciseEntry {
  id?: number;
  date: string;
  exerciseName: string;
  duration: number; // minutes
  caloriesBurned: number;
  note?: string;
  createdAt: string;
}

export interface CustomFood {
  id?: number;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  amount: number; // per gram
  unit: string;
  category: string;
}

export interface DailySummary {
  date: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  exerciseCalories: number;
  netCalories: number;
}

class HealthDatabase extends Dexie {
  userProfile!: Table<UserProfile, number>;
  weightEntries!: Table<WeightEntry, number>;
  foodEntries!: Table<FoodEntry, number>;
  exerciseEntries!: Table<ExerciseEntry, number>;
  customFoods!: Table<CustomFood, number>;

  constructor() {
    super('HealthAppDB');
    this.version(1).stores({
      userProfile: 'id',
      weightEntries: '++id, date',
      foodEntries: '++id, date, mealType',
      exerciseEntries: '++id, date',
      customFoods: '++id, name, category',
    });
  }

  async getTodayFoodEntries(date: string): Promise<FoodEntry[]> {
    return this.foodEntries.where('date').equals(date).toArray();
  }

  async getWeightHistory(limit = 30): Promise<WeightEntry[]> {
    return this.weightEntries
      .orderBy('date')
      .reverse()
      .limit(limit)
      .toArray()
      .then((entries) => entries.reverse());
  }

  async getDailySummary(date: string): Promise<DailySummary> {
    const foodEntries = await this.foodEntries.where('date').equals(date).toArray();
    const exerciseEntries = await this.exerciseEntries.where('date').equals(date).toArray();

    const totalCalories = foodEntries.reduce((sum, e) => sum + e.calories, 0);
    const totalProtein = foodEntries.reduce((sum, e) => sum + e.protein, 0);
    const totalCarbs = foodEntries.reduce((sum, e) => sum + e.carbs, 0);
    const totalFat = foodEntries.reduce((sum, e) => sum + e.fat, 0);
    const exerciseCalories = exerciseEntries.reduce((sum, e) => sum + e.caloriesBurned, 0);

    return {
      date,
      totalCalories,
      totalProtein,
      totalCarbs,
      totalFat,
      exerciseCalories,
      netCalories: totalCalories - exerciseCalories,
    };
  }

  async getWeekSummaries(endDate: string): Promise<DailySummary[]> {
    const summaries: DailySummary[] = [];
    const end = new Date(endDate);
    for (let i = 6; i >= 0; i--) {
      const d = new Date(end);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      summaries.push(await this.getDailySummary(dateStr));
    }
    return summaries;
  }
}

export const db = new HealthDatabase();
