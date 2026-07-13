import { useState, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, FoodEntry } from '../db/database';
import { foodDatabase, searchFood, calculateCalories, FoodItem } from '../utils/foodData';
import { analyzeMealWithAI, getAISettings } from '../utils/aiService';

function getToday(): string { return new Date().toISOString().split('T')[0]; }

const mealTypes = [
  { key: 'breakfast' as const, label: '早餐', icon: '🌅', color: 'border-amber-300 bg-amber-50' },
  { key: 'lunch' as const, label: '午餐', icon: '🌞', color: 'border-red-300 bg-red-50' },
  { key: 'dinner' as const, label: '晚餐', icon: '🌙', color: 'border-indigo-300 bg-indigo-50' },
  { key: 'snack' as const, label: '加餐', icon: '🍪', color: 'border-teal-300 bg-teal-50' },
];

export default function FoodDiary({ onNavigate }: { onNavigate: (p: any) => void }) {
  const [date, setDate] = useState(getToday());
  const [showAdd, setShowAdd] = useState(false);
  const [mealType, setMealType] = useState<FoodEntry['mealType']>('breakfast');
  const [search, setSearch] = useState('');
  const [food, setFood] = useState<FoodItem | null>(null);
  const [amount, setAmount] = useState(100);
  const [activeTab, setActiveTab] = useState<FoodEntry['mealType']>('breakfast');

  // AI meal analysis
  const [aiDesc, setAiDesc] = useState('');
  const [aiResult, setAiResult] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  const entries = useLiveQuery(() => db.foodEntries.where('date').equals(date).toArray(), [date]);
  const summary = useLiveQuery(() => db.getDailySummary(date), [date]);
  const profile = useLiveQuery(() => db.userProfile.get(1));

  const searchResults = useMemo(() =>
    search.trim().length < 1 ? foodDatabase.slice(0, 20) : searchFood(search).slice(0, 20),
  [search]);

  const mealCal = useMemo(() => {
    const r: Record<string, number> = { breakfast: 0, lunch: 0, dinner: 0, snack: 0 };
    entries?.forEach(e => { r[e.mealType] = (r[e.mealType] || 0) + e.calories; });
    return r;
  }, [entries]);

  const tabEntries = useMemo(() => entries?.filter(e => e.mealType === activeTab) || [], [entries, activeTab]);
  const target = profile?.dailyCalorieTarget || 2000;

  const handleAdd = async () => {
    if (!food) return;
    const ratio = amount / 100;
    await db.foodEntries.add({
      date, mealType, foodName: food.name, amount,
      calories: calculateCalories(food, amount),
      protein: Math.round(food.protein * ratio * 10) / 10,
      carbs: Math.round(food.carbs * ratio * 10) / 10,
      fat: Math.round(food.fat * ratio * 10) / 10,
      fiber: food.fiber ? Math.round(food.fiber * ratio * 10) / 10 : undefined,
      createdAt: new Date().toISOString(),
    });
    setShowAdd(false); setSearch(''); setFood(null); setAmount(100);
  };

  const handleDelete = async (id: number) => { await db.foodEntries.delete(id); };

  const handleAIAnalyze = async () => {
    if (!aiDesc.trim()) return;
    const hasKey = await getAISettings();
    if (!hasKey) { onNavigate('ai'); return; }
    setAiLoading(true);
    setAiResult('');
    try { setAiResult(await analyzeMealWithAI(aiDesc)); } catch (e: any) { setAiResult(`❌ ${e.message}`); }
    setAiLoading(false);
  };

  const navDate = (d: number) => {
    const n = new Date(date); n.setDate(n.getDate() + d);
    setDate(n.toISOString().split('T')[0]);
  };

  return (
    <div className="px-4 pt-4 pb-20 space-y-4">
      {/* Date + summary */}
      <div className="card flex items-center justify-between py-3">
        <button onClick={() => navDate(-1)} className="text-gray-400 px-2 text-lg">◀</button>
        <span className="font-bold text-gray-700">{date === getToday() ? '📅 今天' : date}</span>
        <button onClick={() => navDate(1)} disabled={date >= getToday()} className="text-gray-400 px-2 text-lg disabled:text-gray-200">▶</button>
      </div>

      {summary && (
        <div className="grid grid-cols-4 gap-2 text-center">
          {[
            { label: '摄入', val: summary.totalCalories, color: 'text-gray-700' },
            { label: '运动', val: summary.exerciseCalories, color: 'text-green-600' },
            { label: '净摄入', val: summary.netCalories, color: 'text-blue-600' },
            { label: '目标', val: target, color: 'text-purple-600' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl p-2 border border-gray-100">
              <div className={`text-lg font-bold ${s.color}`}>{s.val}</div>
              <div className="text-[10px] text-gray-400">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* AI Meal Analyzer */}
      <div className="card bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <h3 className="text-sm font-bold text-green-700 mb-2">🤖 AI 智能饮食分析</h3>
        <p className="text-xs text-gray-500 mb-2">描述你吃了什么，AI 自动估算营养</p>
        <div className="flex gap-2">
          <input value={aiDesc} onChange={e => setAiDesc(e.target.value)}
            placeholder="比如：一碗米饭+红烧肉+炒青菜..."
            className="input-field flex-1 text-sm" />
          <button onClick={handleAIAnalyze} disabled={aiLoading || !aiDesc.trim()}
            className="btn-primary text-sm whitespace-nowrap disabled:opacity-50">
            {aiLoading ? '...' : '分析'}
          </button>
        </div>
        {aiResult && <div className="mt-3 text-sm whitespace-pre-wrap bg-white rounded-xl p-3">{aiResult}</div>}
      </div>

      {/* Meal tabs */}
      <div className="flex border-b border-gray-100 bg-white rounded-t-xl">
        {mealTypes.map(m => (
          <button key={m.key} onClick={() => setActiveTab(m.key)}
            className={`flex-1 py-3 text-center text-sm font-medium ${activeTab === m.key ? 'tab-active' : 'tab-inactive'}`}>
            {m.icon} {m.label} <span className="text-[10px] text-gray-400">({mealCal[m.key] || 0})</span>
          </button>
        ))}
      </div>

      {/* Entries */}
      <div className="space-y-2">
        {tabEntries.length === 0 && (
          <div className="text-center py-8 text-gray-400"><span className="text-3xl">🍽️</span><p className="text-sm mt-2">还没有记录</p></div>
        )}
        {tabEntries.map(e => (
          <div key={e.id} className="card flex items-center justify-between group">
            <div>
              <div className="font-medium text-gray-800 text-sm">{e.foodName}</div>
              <div className="text-xs text-gray-400">{e.amount}g · 蛋白{e.protein}g 碳水{e.carbs}g 脂肪{e.fat}g</div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right"><div className="font-bold text-gray-700">{e.calories}</div><div className="text-[10px] text-gray-400">kcal</div></div>
              <button onClick={() => e.id && handleDelete(e.id)} className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100">🗑️</button>
            </div>
          </div>
        ))}
      </div>

      {/* Add buttons */}
      <div className="grid grid-cols-2 gap-3">
        {mealTypes.map(m => (
          <button key={m.key} onClick={() => { setMealType(m.key); setShowAdd(true); }}
            className={`py-3 rounded-xl text-sm font-medium border-2 ${m.color} hover:shadow-sm active:scale-95 transition-all`}>
            {m.icon} 添加{m.label}
          </button>
        ))}
      </div>

      {/* Add Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end" onClick={() => setShowAdd(false)}>
          <div className="bg-white rounded-t-2xl w-full max-w-lg max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="font-bold">{mealTypes.find(m => m.key === mealType)?.icon} 添加{mealTypes.find(m => m.key === mealType)?.label}</h3>
              <button onClick={() => setShowAdd(false)} className="text-gray-400 text-xl">✕</button>
            </div>
            <div className="p-4 border-b"><input type="text" placeholder="搜索食物..." value={search} onChange={e => setSearch(e.target.value)} className="input-field" autoFocus /></div>
            {food && (
              <div className="p-4 bg-green-50 flex items-center gap-3">
                <div className="flex-1"><div className="font-semibold text-green-800">{food.name}</div><div className="text-xs text-green-600">{food.calories} kcal/100g</div></div>
                <input type="number" value={amount} onChange={e => setAmount(Number(e.target.value))} className="w-20 input-field text-center" min={1} max={2000} />
                <span className="text-sm">g</span>
                <div className="font-bold text-green-700">{calculateCalories(food, amount)} kcal</div>
              </div>
            )}
            <div className="flex-1 overflow-y-auto p-2">
              {searchResults.map(f => (
                <button key={f.name} onClick={() => setFood(f)}
                  className={`w-full text-left p-3 rounded-xl flex justify-between ${food?.name === f.name ? 'bg-primary-50 border border-primary-200' : 'hover:bg-gray-50'}`}>
                  <div><div className="font-medium text-sm">{f.name}</div><div className="text-xs text-gray-400">{f.calories} kcal/100g</div></div>
                  <span className="text-xs text-gray-400">选择 ›</span>
                </button>
              ))}
            </div>
            <div className="p-4 border-t">
              <button onClick={handleAdd} disabled={!food}
                className={`w-full py-3 rounded-xl font-bold text-white ${food ? 'bg-primary-500' : 'bg-gray-300'}`}>确认添加</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
