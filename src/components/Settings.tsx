import { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, UserProfile } from '../db/database';
import { calculateBMR, calculateTDEE, getCalorieTarget } from '../utils/foodData';

interface SettingsProps {
  onComplete?: () => void;
  isSetup?: boolean;
}

export default function Settings({ onComplete, isSetup }: SettingsProps) {
  const profile = useLiveQuery(() => db.userProfile.get(1));

  const [name, setName] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [birthYear, setBirthYear] = useState(1995);
  const [height, setHeight] = useState(170);
  const [currentWeight, setCurrentWeight] = useState(65);
  const [goalWeight, setGoalWeight] = useState(60);
  const [activityLevel, setActivityLevel] = useState<UserProfile['activityLevel']>('light');
  const [goal, setGoal] = useState<UserProfile['goal']>('maintain');
  const [saved, setSaved] = useState(false);

  // Load profile + latest weight
  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setGender(profile.gender);
      setBirthYear(profile.birthYear || 1995);
      setHeight(profile.height || 170);
      setGoalWeight(profile.goalWeight || 60);
      setActivityLevel(profile.activityLevel);
      setGoal(profile.goal);
      // Load actual current weight from weight entries
      db.weightEntries.orderBy('date').reverse().first().then(w => {
        if (w) setCurrentWeight(w.weight);
      });
    }
  }, [profile]);

  const age = new Date().getFullYear() - birthYear;
  const bmr = calculateBMR(currentWeight || goalWeight, height, age, gender);
  const tdee = calculateTDEE(bmr, activityLevel);
  const target = getCalorieTarget(tdee, goal);

  const handleSave = async () => {
    const data: UserProfile = {
      id: 1,
      name,
      gender,
      birthYear,
      height,
      goalWeight,
      activityLevel,
      goal,
      dailyCalorieTarget: target,
      createdAt: new Date().toISOString(),
    };

    const existing = await db.userProfile.get(1);
    if (existing) {
      await db.userProfile.update(1, data);
    } else {
      await db.userProfile.put(data);
    }

    // Only add weight entry if changed or first time
    const latestWeight = await db.weightEntries.orderBy('date').reverse().first();
    if (!latestWeight || Math.abs(latestWeight.weight - currentWeight) > 0.1) {
      await db.weightEntries.add({
        date: new Date().toISOString().split('T')[0],
        weight: currentWeight,
        note: '更新资料',
      });
    }

    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onComplete?.();
    }, 1500);
  };

  return (
    <div className="px-4 pt-4 space-y-4 pb-8">
      {isSetup && (
        <div className="card bg-primary-50 border-primary-200 text-center py-4">
          <div className="text-3xl mb-2">👋</div>
          <h2 className="text-lg font-bold text-gray-800">欢迎使用轻享健康</h2>
          <p className="text-sm text-gray-500 mt-1">请设置你的个人资料，我们将为你定制健康计划</p>
        </div>
      )}

      {/* Calorie preview */}
      <div className="card bg-gradient-to-r from-green-50 to-emerald-50 border-green-100">
        <div className="text-center">
          <div className="text-xs text-green-500 mb-1">每日推荐摄入</div>
          <div className="text-4xl font-bold text-green-600">{target}</div>
          <div className="text-xs text-green-400 mt-1">千卡 / 天</div>
        </div>
        <div className="grid grid-cols-3 gap-2 mt-3 text-center text-xs text-gray-500">
          <div>
            <div className="font-semibold text-gray-700">{bmr}</div>
            基础代谢
          </div>
          <div>
            <div className="font-semibold text-gray-700">{tdee}</div>
            总消耗
          </div>
          <div>
            <div className="font-semibold text-gray-700">{goal === 'lose' ? '减脂' : goal === 'gain' ? '增肌' : '维持'}</div>
            目标
          </div>
        </div>
      </div>

      {/* Profile form */}
      <div className="card space-y-4">
        <h3 className="font-semibold text-gray-700">基本信息</h3>

        <div>
          <label className="text-xs text-gray-500 mb-1 block">昵称</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="你的名字"
            className="input-field"
          />
        </div>

        <div>
          <label className="text-xs text-gray-500 mb-1 block">性别</label>
          <div className="flex gap-2">
            {[
              { key: 'male' as const, label: '男', icon: '👨' },
              { key: 'female' as const, label: '女', icon: '👩' },
            ].map((g) => (
              <button
                key={g.key}
                onClick={() => setGender(g.key)}
                className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all ${
                  gender === g.key
                    ? 'bg-primary-500 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                {g.icon} {g.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs text-gray-500 mb-1 block">出生年份</label>
          <select
            value={birthYear}
            onChange={(e) => setBirthYear(Number(e.target.value))}
            className="input-field"
          >
            {Array.from({ length: 60 }, (_, i) => new Date().getFullYear() - i).map((year) => (
              <option key={year} value={year}>{year} 年</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">身高 (cm)</label>
            <input
              type="number"
              value={height}
              onChange={(e) => setHeight(Number(e.target.value))}
              min={100}
              max={250}
              className="input-field"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">当前体重 (kg)</label>
            <input
              type="number"
              value={currentWeight}
              onChange={(e) => setCurrentWeight(Number(e.target.value))}
              min={30}
              max={300}
              step="0.1"
              className="input-field"
            />
          </div>
        </div>

        <div>
          <label className="text-xs text-gray-500 mb-1 block">目标体重 (kg)</label>
          <input
            type="number"
            value={goalWeight}
            onChange={(e) => setGoalWeight(Number(e.target.value))}
            min={30}
            max={300}
            step="0.1"
            className="input-field"
          />
        </div>
      </div>

      <div className="card space-y-4">
        <h3 className="font-semibold text-gray-700">目标与活动</h3>

        <div>
          <label className="text-xs text-gray-500 mb-1 block">健康目标</label>
          <div className="flex gap-2">
            {[
              { key: 'lose' as const, label: '减脂', icon: '🔥', desc: '每日缺口约500kcal' },
              { key: 'maintain' as const, label: '维持', icon: '⚖️', desc: '保持当前体重' },
              { key: 'gain' as const, label: '增肌', icon: '💪', desc: '每日盈余约300kcal' },
            ].map((g) => (
              <button
                key={g.key}
                onClick={() => setGoal(g.key)}
                className={`flex-1 py-3 rounded-xl text-sm transition-all flex flex-col items-center gap-1 ${
                  goal === g.key
                    ? 'bg-primary-500 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                <span className="text-lg">{g.icon}</span>
                <span className="font-medium">{g.label}</span>
                <span className="text-[10px] opacity-70">{g.desc}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs text-gray-500 mb-1 block">活动水平</label>
          <div className="space-y-2">
            {[
              { key: 'sedentary' as const, label: '久坐不动', desc: '几乎不运动，办公室工作', mult: 1.2 },
              { key: 'light' as const, label: '轻度活动', desc: '每周运动1-3次', mult: 1.375 },
              { key: 'moderate' as const, label: '中度活动', desc: '每周运动3-5次', mult: 1.55 },
              { key: 'active' as const, label: '积极运动', desc: '每周运动6-7次', mult: 1.725 },
              { key: 'very_active' as const, label: '高强度运动', desc: '每天高强度运动或体力工作', mult: 1.9 },
            ].map((l) => (
              <button
                key={l.key}
                onClick={() => setActivityLevel(l.key)}
                className={`w-full text-left p-3 rounded-xl transition-all ${
                  activityLevel === l.key
                    ? 'bg-primary-50 border border-primary-200'
                    : 'bg-gray-50 hover:bg-gray-100 border border-transparent'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-700 text-sm">{l.label}</span>
                  <span className="text-xs text-gray-400">×{l.mult}</span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">{l.desc}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Save button */}
      <button
        onClick={handleSave}
        className={`w-full py-4 rounded-xl font-bold text-lg text-white transition-all ${
          saved
            ? 'bg-green-500 scale-[0.98]'
            : 'bg-primary-500 hover:bg-primary-600 active:bg-primary-700 shadow-lg shadow-primary-200'
        }`}
      >
        {saved ? '✅ 保存成功！' : isSetup ? '开始使用' : '保存设置'}
      </button>

      {!isSetup && (
        <div className="card text-center">
          <p className="text-xs text-gray-400">
            轻享健康 v1.0 · 所有数据均保存在本地 · 完全免费
          </p>
        </div>
      )}
    </div>
  );
}
