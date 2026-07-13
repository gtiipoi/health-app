import { useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, UserProfile, DailySummary } from '../db/database';
import { calculateBMR, calculateTDEE, getCalorieTarget } from '../utils/foodData';

interface DashboardProps {
  onNavigate: (page: any) => void;
}

function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

function CalorieRing({ consumed, target }: { consumed: number; target: number }) {
  const pct = Math.min((consumed / target) * 100, 100);
  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (pct / 100) * circumference;

  let color = '#22c55e';
  if (pct > 90) color = '#f59e0b';
  if (pct > 100) color = '#ef4444';

  return (
    <div className="relative w-40 h-40 mx-auto">
      <svg className="w-40 h-40 transform -rotate-90" viewBox="0 0 100 100">
        <circle
          cx="50" cy="50" r="45"
          fill="none" stroke="#e5e7eb" strokeWidth="8"
        />
        <circle
          cx="50" cy="50" r="45"
          fill="none" stroke={color} strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-gray-800">{consumed}</span>
        <span className="text-xs text-gray-400">/ {target} 千卡</span>
        <span className="text-xs mt-0.5 text-gray-500">
          {pct <= 100 ? `剩余 ${target - consumed}` : `超出 ${consumed - target}`}
        </span>
      </div>
    </div>
  );
}

function MacroBar({ label, value, target, color }: { label: string; value: number; target: number; color: string }) {
  const pct = target > 0 ? Math.min((value / target) * 100, 100) : 0;
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-500 w-8">{label}</span>
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-gray-600 w-12 text-right">{value}g</span>
    </div>
  );
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const today = getToday();
  const profile = useLiveQuery(() => db.userProfile.get(1));
  const todaySummary = useLiveQuery(() => db.getDailySummary(today), [today]);
  const weightEntries = useLiveQuery(() => db.weightEntries.orderBy('date').reverse().limit(7).toArray());
  const todayFoods = useLiveQuery(() => db.getTodayFoodEntries(today), [today]);

  const calorieTarget = useMemo(() => {
    if (!profile) return 2000;
    const age = new Date().getFullYear() - profile.birthYear;
    const bmr = calculateBMR(profile.goalWeight > 0 ? profile.goalWeight : 65, profile.height, age, profile.gender);
    const tdee = calculateTDEE(bmr, profile.activityLevel);
    return getCalorieTarget(tdee, profile.goal);
  }, [profile]);

  const summary = todaySummary || {
    date: today,
    totalCalories: 0,
    totalProtein: 0,
    totalCarbs: 0,
    totalFat: 0,
    exerciseCalories: 0,
    netCalories: 0,
  };

  const lastWeight = weightEntries && weightEntries.length > 0 ? weightEntries[0].weight : null;
  const firstWeight = weightEntries && weightEntries.length > 1 ? weightEntries[weightEntries.length - 1].weight : lastWeight;
  const weightChange = lastWeight && firstWeight ? (lastWeight - firstWeight).toFixed(1) : null;

  const mealTypes: { key: string; label: string; icon: string; color: string }[] = [
    { key: 'breakfast', label: '早餐', icon: '🌅', color: 'bg-amber-50 border-amber-200' },
    { key: 'lunch', label: '午餐', icon: '🌞', color: 'bg-red-50 border-red-200' },
    { key: 'dinner', label: '晚餐', icon: '🌙', color: 'bg-indigo-50 border-indigo-200' },
    { key: 'snack', label: '加餐', icon: '🍪', color: 'bg-teal-50 border-teal-200' },
  ];

  return (
    <div className="px-4 pt-4 space-y-4">
      {/* Calorie Ring */}
      <div className="card flex flex-col items-center py-6">
        <CalorieRing consumed={summary.totalCalories} target={calorieTarget} />
        <div className="flex gap-6 mt-3 text-center">
          <div>
            <div className="text-sm font-semibold text-green-600">{summary.exerciseCalories}</div>
            <div className="text-[10px] text-gray-400">运动消耗</div>
          </div>
          <div className="w-px bg-gray-200" />
          <div>
            <div className="text-sm font-semibold text-blue-600">{summary.netCalories}</div>
            <div className="text-[10px] text-gray-400">净摄入</div>
          </div>
        </div>
      </div>

      {/* Macro nutrients */}
      <div className="card space-y-2">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">今日营养</h3>
        <MacroBar label="蛋白质" value={Math.round(summary.totalProtein)} target={80} color="bg-red-400" />
        <MacroBar label="碳水" value={Math.round(summary.totalCarbs)} target={250} color="bg-amber-400" />
        <MacroBar label="脂肪" value={Math.round(summary.totalFat)} target={60} color="bg-blue-400" />
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-3">
        <button onClick={() => onNavigate('weight')} className="card text-center hover:shadow-md transition-shadow">
          <div className="text-2xl mb-1">⚖️</div>
          <div className="text-lg font-bold text-gray-800">
            {lastWeight ? `${lastWeight}` : '--'}
          </div>
          <div className="text-[10px] text-gray-400">体重 kg</div>
          {weightChange && (
            <div className={`text-[10px] mt-0.5 ${Number(weightChange) <= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {Number(weightChange) > 0 ? '+' : ''}{weightChange} kg
            </div>
          )}
        </button>
        <button onClick={() => onNavigate('diary')} className="card text-center hover:shadow-md transition-shadow">
          <div className="text-2xl mb-1">📝</div>
          <div className="text-lg font-bold text-gray-800">
            {todayFoods?.length || 0}
          </div>
          <div className="text-[10px] text-gray-400">记录条数</div>
        </button>
        <button onClick={() => onNavigate('exercise')} className="card text-center hover:shadow-md transition-shadow">
          <div className="text-2xl mb-1">🔥</div>
          <div className="text-lg font-bold text-gray-800">
            {summary.exerciseCalories}
          </div>
          <div className="text-[10px] text-gray-400">运动消耗</div>
        </button>
      </div>

      {/* Meal quick add */}
      <div className="card">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">快速记录</h3>
        <div className="grid grid-cols-4 gap-2">
          {mealTypes.map((meal) => (
            <button
              key={meal.key}
              onClick={() => onNavigate('diary')}
              className={`flex flex-col items-center gap-1 py-3 rounded-xl border ${meal.color} hover:shadow-sm transition-all active:scale-95`}
            >
              <span className="text-xl">{meal.icon}</span>
              <span className="text-xs font-medium text-gray-600">{meal.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Recent entries */}
      {todayFoods && todayFoods.length > 0 && (
        <div className="card">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">今日饮食记录</h3>
          <div className="space-y-2">
            {todayFoods.slice(-5).reverse().map((entry) => (
              <div key={entry.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-2">
                  <span className={`meal-tag meal-${entry.mealType}`}>
                    {mealTypes.find(m => m.key === entry.mealType)?.label}
                  </span>
                  <span className="text-sm text-gray-700">{entry.foodName}</span>
                </div>
                <span className="text-sm font-semibold text-gray-600">{entry.calories} kcal</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
