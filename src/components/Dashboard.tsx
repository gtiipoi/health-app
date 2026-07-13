import { useState, useMemo, useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, FoodEntry } from '../db/database';
import { calculateBMR, calculateTDEE, getCalorieTarget } from '../utils/foodData';
import { getAIDashboardInsight, getAISettings } from '../utils/aiService';

function getToday(): string { return new Date().toISOString().split('T')[0]; }

export default function Dashboard({ onNavigate }: { onNavigate: (p: any) => void }) {
  const today = getToday();
  const profile = useLiveQuery(() => db.userProfile.get(1));
  const todaySummary = useLiveQuery(() => db.getDailySummary(today), [today]);
  const weightEntries = useLiveQuery(() => db.weightEntries.orderBy('date').reverse().limit(7).toArray());
  const todayFoods = useLiveQuery(() => db.getTodayFoodEntries(today), [today]);

  const [aiInsight, setAiInsight] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  const calorieTarget = useMemo(() => {
    if (!profile) return 2000;
    const age = new Date().getFullYear() - profile.birthYear;
    const bmr = calculateBMR(profile.goalWeight, profile.height, age, profile.gender);
    const tdee = calculateTDEE(bmr, profile.activityLevel);
    return getCalorieTarget(tdee, profile.goal);
  }, [profile]);

  const summary = todaySummary || { date: today, totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFat: 0, exerciseCalories: 0, netCalories: 0 };
  const lastWeight = weightEntries?.[0]?.weight ?? null;
  const pct = Math.min((summary.totalCalories / calorieTarget) * 100, 100);
  const circumference = 2 * Math.PI * 48;
  const offset = circumference - (pct / 100) * circumference;
  const ringColor = pct > 100 ? '#ef4444' : pct > 85 ? '#f59e0b' : '#22c55e';

  const mealCal: Record<string, number> = { breakfast: 0, lunch: 0, dinner: 0, snack: 0 };
  todayFoods?.forEach(f => { mealCal[f.mealType] = (mealCal[f.mealType] || 0) + f.calories; });

  const loadAIInsight = useCallback(async () => {
    const hasKey = await getAISettings();
    if (!hasKey) { onNavigate('ai'); return; }
    setAiLoading(true);
    try { setAiInsight(await getAIDashboardInsight()); } catch { setAiInsight(''); }
    setAiLoading(false);
  }, [onNavigate]);

  return (
    <div className="px-4 pt-4 pb-20 space-y-4">
      {/* AI Insight Card */}
      <div className="card bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-bold text-purple-700">🤖 AI 智能洞察</h3>
          <button onClick={loadAIInsight} disabled={aiLoading} className="text-xs bg-purple-500 text-white px-3 py-1 rounded-full hover:bg-purple-600 disabled:opacity-50">
            {aiLoading ? '分析中...' : aiInsight ? '刷新' : '分析'}
          </button>
        </div>
        {aiInsight ? (
          <div className="text-sm text-gray-700 space-y-1 whitespace-pre-wrap">{aiInsight}</div>
        ) : (
          <p className="text-xs text-gray-400">{aiLoading ? 'AI 正在分析你的数据...' : '点击分析，AI 基于你的数据给出个性化建议'}</p>
        )}
      </div>

      {/* Calorie ring + quick stats */}
      <div className="card flex items-center gap-4 py-4">
        <div className="relative w-32 h-32 shrink-0">
          <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 106 106">
            <circle cx="53" cy="53" r="48" fill="none" stroke="#e5e7eb" strokeWidth="8" />
            <circle cx="53" cy="53" r="48" fill="none" stroke={ringColor} strokeWidth="8" strokeLinecap="round"
              strokeDasharray={circumference} strokeDashoffset={offset} className="transition-all duration-700" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-gray-800">{summary.totalCalories}</span>
            <span className="text-[10px] text-gray-400">/ {calorieTarget} kcal</span>
            <span className="text-[10px] font-medium" style={{ color: ringColor }}>
              {pct > 100 ? `超出${summary.totalCalories - calorieTarget}` : `剩余${calorieTarget - summary.totalCalories}`}
            </span>
          </div>
        </div>
        <div className="flex-1 grid grid-cols-2 gap-3">
          {[
            { label: '蛋白质', val: `${Math.round(summary.totalProtein)}g`, color: 'text-red-500', bg: 'bg-red-50' },
            { label: '碳水', val: `${Math.round(summary.totalCarbs)}g`, color: 'text-amber-500', bg: 'bg-amber-50' },
            { label: '脂肪', val: `${Math.round(summary.totalFat)}g`, color: 'text-blue-500', bg: 'bg-blue-50' },
            { label: '运动', val: `${summary.exerciseCalories}`, unit: 'kcal', color: 'text-orange-500', bg: 'bg-orange-50' },
          ].map(item => (
            <div key={item.label} className={`${item.bg} rounded-xl p-2 text-center`}>
              <div className={`text-lg font-bold ${item.color}`}>{item.val}</div>
              <div className="text-[10px] text-gray-400">{item.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-2">
        <button onClick={() => onNavigate('weight')} className="card text-center hover:shadow-md transition-all py-3">
          <span className="text-lg">⚖️</span>
          <div className="text-sm font-bold">{lastWeight ?? '--'}<span className="text-[10px] text-gray-400"> kg</span></div>
          <div className="text-[10px] text-gray-400">体重</div>
        </button>
        <button onClick={() => onNavigate('water')} className="card text-center hover:shadow-md transition-all py-3">
          <span className="text-lg">💧</span>
          <div className="text-sm font-bold text-blue-500">{todayFoods?.length || '--'}<span className="text-[10px] text-gray-400"> 杯</span></div>
          <div className="text-[10px] text-gray-400">饮水</div>
        </button>
        <button onClick={() => onNavigate('body')} className="card text-center hover:shadow-md transition-all py-3">
          <span className="text-lg">📏</span>
          <div className="text-sm font-bold text-purple-500">{todayFoods?.length || '--'}<span className="text-[10px] text-gray-400"> 项</span></div>
          <div className="text-[10px] text-gray-400">围度</div>
        </button>
        <button onClick={() => onNavigate('report')} className="card text-center hover:shadow-md transition-all py-3">
          <span className="text-lg">📋</span>
          <div className="text-sm font-bold text-purple-500">周报</div>
          <div className="text-[10px] text-gray-400">报告</div>
        </button>
      </div>

      {/* AI Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: '📋 AI 饮食计划', page: 'ai', icon: '📋' },
          { label: '🏃 AI 运动计划', page: 'ai', icon: '🏃' },
          { label: '🍳 AI 生成食谱', page: 'recipes', icon: '🍳' },
          { label: '💬 AI 健康问答', page: 'ai', icon: '💬' },
        ].map(a => (
          <button key={a.label} onClick={() => onNavigate(a.page)}
            className="card text-left hover:shadow-md transition-all active:scale-95 flex items-center gap-3 py-3">
            <span className="text-2xl">{a.icon}</span>
            <span className="text-sm font-medium text-gray-700">{a.label}</span>
          </button>
        ))}
      </div>

      {/* Today's meals */}
      {todayFoods && todayFoods.length > 0 && (
        <div className="card">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">今日饮食</h3>
          {(['breakfast', 'lunch', 'dinner', 'snack'] as const).map(meal => {
            const items = todayFoods.filter(f => f.mealType === meal);
            if (!items.length) return null;
            const names: Record<string, string> = { breakfast: '🌅 早餐', lunch: '🌞 午餐', dinner: '🌙 晚餐', snack: '🍪 加餐' };
            return (
              <div key={meal} className="mb-2 last:mb-0">
                <div className="text-xs text-gray-400 mb-1">{names[meal]} · {items.reduce((s, f) => s + f.calories, 0)} kcal</div>
                {items.map(f => (
                  <div key={f.id} className="text-sm text-gray-600 ml-2">· {f.foodName} {f.amount}g</div>
                ))}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
