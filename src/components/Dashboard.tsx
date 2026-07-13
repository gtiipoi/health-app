import { useState, useMemo, useCallback, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import { calculateTDEE, getCalorieTarget, calculateBMR } from '../utils/foodData';
import { getAIDashboardInsight, getAISettings } from '../utils/aiService';
import { petThink, PetThought } from '../utils/petBrain';
import AIPet, { PetStyle } from './AIPet';

function getToday(): string { return new Date().toISOString().split('T')[0]; }

const PET_STORAGE_KEY = 'pet_style';
const PET_NAME_KEY = 'pet_name';

export default function Dashboard({ onNavigate }: { onNavigate: (p: any) => void }) {
  const today = getToday();
  const profile = useLiveQuery(() => db.userProfile.get(1));
  const todaySummary = useLiveQuery(() => db.getDailySummary(today), [today]);
  const weightEntries = useLiveQuery(() => db.weightEntries.orderBy('date').reverse().limit(7).toArray());
  const todayFoods = useLiveQuery(() => db.getTodayFoodEntries(today), [today]);
  const todayWater = useLiveQuery(() => db.getTodayWater(today), [today]);
  const todayExercise = useLiveQuery(() => db.exerciseEntries.where('date').equals(today).toArray());

  // Pet state
  const [petMsg, setPetMsg] = useState('正在思考... 🤔');
  const [petMood, setPetMood] = useState<PetThought['mood']>('welcoming');
  const [petStyle, setPetStyle] = useState<PetStyle>(() => (localStorage.getItem(PET_STORAGE_KEY) as PetStyle) || 'custom');
  const [petName, setPetName] = useState(() => localStorage.getItem(PET_NAME_KEY) || '小轻');
  const [speaking, setSpeaking] = useState(true);
  const [showPetSettings, setShowPetSettings] = useState(false);
  const [petLoading, setPetLoading] = useState(false);

  const [aiInsight, setAiInsight] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [reminders, setReminders] = useState<string[]>([]);

  const summary = todaySummary || { date: today, totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFat: 0, exerciseCalories: 0, netCalories: 0 };
  const lastWeight = weightEntries?.[0]?.weight ?? null;

  const calorieTarget = useMemo(() => {
    if (!profile) return 2000;
    const age = new Date().getFullYear() - profile.birthYear;
    const bmr = calculateBMR(profile.goalWeight, profile.height, age, profile.gender);
    const tdee = calculateTDEE(bmr, profile.activityLevel);
    return getCalorieTarget(tdee, profile.goal);
  }, [profile]);

  const pct = Math.min((summary.totalCalories / calorieTarget) * 100, 100);
  const circumference = 2 * Math.PI * 48;
  const offset = circumference - (pct / 100) * circumference;
  const ringColor = pct > 100 ? '#f87171' : pct > 85 ? '#fbbf24' : '#34d399';

  // AI Pet Brain - autonomous thinking
  const refreshPet = useCallback(async () => {
    setPetLoading(true);
    setPetMsg('让我看看你的数据... 🔍');
    try {
      const thought = await petThink();
      setPetMsg(thought.message);
      setPetMood(thought.mood);
    } catch {
      setPetMsg('主人今天过得怎么样？我一直在这儿呢~');
      setPetMood('happy');
    }
    setPetLoading(false);
  }, []);

  useEffect(() => {
    refreshPet();
  }, []); // Only on first load

  // Build data-driven reminders
  useEffect(() => {
    const r: string[] = [];
    const hour = new Date().getHours();
    const breakfast = todayFoods?.filter(f => f.mealType === 'breakfast');
    const totalCal = todayFoods?.reduce((s, f) => s + f.calories, 0) || 0;

    if (hour >= 9 && (!breakfast || breakfast.length === 0)) r.push('🍽️ 早餐还没记录！');
    if (todayWater && todayWater < 500 && hour >= 10) r.push('💧 今天喝水不够，快去喝一杯！');
    if (hour >= 16 && (!todayExercise || todayExercise.length === 0)) r.push('🏋️ 今天还没运动哦~');
    if (hour >= 20 && totalCal > calorieTarget) r.push('⚠️ 今天热量超标了，明天注意');
    if (weightEntries && weightEntries.length > 0) {
      const recentChange = weightEntries[0].weight - (weightEntries[weightEntries.length - 1]?.weight || weightEntries[0].weight);
      if (recentChange < -1) r.push('🎉 体重在下降！趋势很好！');
    }
    if (r.length === 0) r.push('✅ 今天一切都很好！');
    setReminders(r);
  }, [profile, todayFoods, todayWater, todayExercise]);

  const handlePetStyleChange = (s: PetStyle) => {
    setPetStyle(s);
    localStorage.setItem(PET_STORAGE_KEY, s);
  };

  const handlePetNameChange = (n: string) => {
    setPetName(n);
    localStorage.setItem(PET_NAME_KEY, n);
  };

  const loadAIInsight = useCallback(async () => {
    const hasKey = await getAISettings();
    if (!hasKey) { onNavigate('ai'); return; }
    setAiLoading(true);
    try { setAiInsight(await getAIDashboardInsight()); } catch { setAiInsight('❌ AI暂时不可用'); }
    setAiLoading(false);
  }, [onNavigate]);

  return (
    <div className="px-4 pt-4 pb-20 space-y-4">
      {/* ===== PET SECTION ===== */}
      <div className="card bg-gradient-to-b from-amber-50 via-orange-50 to-white border-amber-200 pt-6 pb-4">
        <AIPet
          name={petName}
          message={petMsg}
          mood={petMood}
          style={petStyle}
          onStyleChange={handlePetStyleChange}
          speaking={speaking}
        />

        {/* Pet controls */}
        <div className="flex justify-center gap-2 mt-3 flex-wrap">
          <button onClick={refreshPet} disabled={petLoading}
            className="text-[10px] px-2 py-1 rounded-full bg-purple-100 text-purple-600 hover:bg-purple-200 disabled:opacity-50">
            {petLoading ? '🤔 思考中...' : '🧠 让宠物思考'}
          </button>
          <button onClick={() => setSpeaking(!speaking)}
            className={`text-[10px] px-2 py-1 rounded-full ${speaking ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-400'}`}>
            {speaking ? '🔊 语音开' : '🔇 语音关'}
          </button>
          <button onClick={() => onNavigate('voice')}
            className="text-[10px] px-2 py-1 rounded-full bg-pink-100 text-pink-600 hover:bg-pink-200">
            🎤 声音克隆
          </button>
          {showPetSettings && (
            <input value={petName} onChange={e => handlePetNameChange(e.target.value)}
              className="text-xs w-16 text-center border rounded-full px-2 py-1" placeholder="名字" />
          )}
          <button onClick={() => setShowPetSettings(!showPetSettings)}
            className="text-[10px] px-2 py-1 rounded-full bg-gray-100 text-gray-400">
            ✏️ 改名
          </button>
        </div>
      </div>

      {/* ===== REMINDERS ===== */}
      <div className="card bg-gradient-to-r from-red-50 to-amber-50 border-red-200">
        <h3 className="text-sm font-bold text-red-400 mb-2">🔔 {petName}的提醒</h3>
        <div className="space-y-1">
          {reminders.map((r, i) => (
            <div key={i} className="text-sm text-gray-600">{r}</div>
          ))}
        </div>
      </div>

      {/* ===== CALORIE RING + MACROS ===== */}
      <div className="card flex items-center gap-4 py-4">
        <div className="relative w-32 h-32 shrink-0">
          <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 106 106">
            <circle cx="53" cy="53" r="48" fill="none" stroke="#f3f4f6" strokeWidth="8" />
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
        <div className="flex-1 grid grid-cols-2 gap-2">
          {[
            { l: '蛋白质', v: `${Math.round(summary.totalProtein)}g`, c: 'text-red-500', b: 'bg-red-50' },
            { l: '碳水', v: `${Math.round(summary.totalCarbs)}g`, c: 'text-amber-500', b: 'bg-amber-50' },
            { l: '脂肪', v: `${Math.round(summary.totalFat)}g`, c: 'text-blue-500', b: 'bg-blue-50' },
            { l: '运动', v: `${summary.exerciseCalories}kcal`, c: 'text-orange-500', b: 'bg-orange-50' },
          ].map(i => (
            <div key={i.l} className={`${i.b} rounded-xl p-2 text-center`}>
              <div className={`text-lg font-bold ${i.c}`}>{i.v}</div>
              <div className="text-[10px] text-gray-400">{i.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ===== QUICK STATS ===== */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { l: '体重', v: lastWeight ? `${lastWeight}kg` : '--', i: '⚖️', p: 'weight' },
          { l: '饮水', v: `${todayWater || 0}ml`, i: '💧', p: 'water' },
          { l: '围度', v: '记录', i: '📏', p: 'body' },
          { l: '周报', v: '查看', i: '📋', p: 'report' },
        ].map(s => (
          <button key={s.l} onClick={() => onNavigate(s.p)} className="card text-center py-2 hover:shadow-md transition-all">
            <span className="text-lg">{s.i}</span>
            <div className="text-xs font-bold text-gray-700">{s.v}</div>
            <div className="text-[10px] text-gray-400">{s.l}</div>
          </button>
        ))}
      </div>

      {/* ===== AI INSIGHT ===== */}
      <div className="card bg-gradient-to-br from-violet-50 to-purple-50 border-violet-200">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-bold text-violet-700">🤖 AI 智能洞察</h3>
          <button onClick={loadAIInsight} disabled={aiLoading}
            className="text-xs bg-violet-500 text-white px-3 py-1 rounded-full hover:bg-violet-600 disabled:opacity-50">
            {aiLoading ? '分析中...' : aiInsight ? '刷新' : '分析'}
          </button>
        </div>
        {aiInsight ? <div className="text-sm text-gray-700 whitespace-pre-wrap">{aiInsight}</div>
          : <p className="text-xs text-gray-400">点击让AI分析你的数据</p>}
      </div>

      {/* ===== QUICK ACTIONS ===== */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { l: '🏋️ 开始训练', p: 'workout', c: 'bg-indigo-50 border-indigo-200' },
          { l: '🍽️ 记录饮食', p: 'diary', c: 'bg-green-50 border-green-200' },
          { l: '📖 查看食谱', p: 'recipes', c: 'bg-teal-50 border-teal-200' },
          { l: '💬 AI 教练', p: 'ai', c: 'bg-blue-50 border-blue-200' },
        ].map(a => (
          <button key={a.l} onClick={() => onNavigate(a.p)}
            className={`card text-left border-2 ${a.c} hover:shadow-md active:scale-95 transition-all py-3`}>
            <span className="text-sm font-medium">{a.l}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
