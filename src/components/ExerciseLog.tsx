import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, ExerciseEntry } from '../db/database';
import { exerciseDatabase } from '../utils/foodData';
import { getAIExercisePlan, getAISettings } from '../utils/aiService';

function getToday(): string { return new Date().toISOString().split('T')[0]; }

export default function ExerciseLog({ onNavigate }: { onNavigate?: (p: any) => void }) {
  const [showAdd, setShowAdd] = useState(false);
  const [exercise, setExercise] = useState('');
  const [duration, setDuration] = useState(30);
  const [aiPlan, setAiPlan] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  const entries = useLiveQuery(() => db.exerciseEntries.where('date').equals(getToday()).toArray());
  const todayList = entries || [];
  const totalCal = todayList.reduce((s, e) => s + e.caloriesBurned, 0);
  const totalMin = todayList.reduce((s, e) => s + e.duration, 0);

  const handleAdd = async () => {
    const ex = exerciseDatabase.find(e => e.name === exercise);
    if (!ex || duration <= 0) return;
    await db.exerciseEntries.add({
      date: getToday(), exerciseName: exercise, duration,
      caloriesBurned: Math.round((ex.caloriesPerHour * duration) / 60),
      createdAt: new Date().toISOString(),
    });
    setExercise(''); setDuration(30); setShowAdd(false);
  };

  const handleDelete = async (e: ExerciseEntry) => { if (e.id) await db.exerciseEntries.delete(e.id); };

  const handleAIPlan = async () => {
    const hasKey = await getAISettings();
    if (!hasKey) { onNavigate?.('ai'); return; }
    setAiLoading(true);
    try { setAiPlan(await getAIExercisePlan()); } catch { setAiPlan(''); }
    setAiLoading(false);
  };

  return (
    <div className="px-4 pt-4 pb-20 space-y-4">
      {/* Summary */}
      <div className="card bg-gradient-to-br from-orange-50 to-red-50 border-orange-200 text-center py-4">
        <div className="text-xs text-orange-500">今日运动</div>
        <div className="text-4xl font-bold text-orange-600">{totalCal}<span className="text-lg text-orange-400"> kcal</span></div>
        <div className="text-xs text-orange-400">{todayList.length}项 · {totalMin}分钟</div>
      </div>

      {/* AI Exercise Plan */}
      <div className="card bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-bold text-orange-700">🤖 AI 运动计划</h3>
          <button onClick={handleAIPlan} disabled={aiLoading}
            className="text-xs bg-orange-500 text-white px-3 py-1 rounded-full hover:bg-orange-600 disabled:opacity-50">
            {aiLoading ? '生成中...' : '生成计划'}
          </button>
        </div>
        {aiPlan ? <div className="text-sm whitespace-pre-wrap bg-white rounded-xl p-3">{aiPlan}</div>
          : <p className="text-xs text-gray-400">{aiLoading ? 'AI 正在定制运动计划...' : 'AI 根据你的目标和数据定制运动计划'}</p>}
      </div>

      {/* Quick add */}
      <div className="card">
        <div className="flex justify-between mb-3">
          <h3 className="font-semibold text-gray-700">⚡ 快速记录</h3>
          <button onClick={() => setShowAdd(true)} className="btn-primary text-xs py-1.5 px-4">+ 自定义</button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {exerciseDatabase.slice(0, 12).map(ex => (
            <button key={ex.name} onClick={() => { setExercise(ex.name); setShowAdd(true); }}
              className="p-3 rounded-xl bg-gray-50 hover:bg-orange-50 border border-transparent hover:border-orange-200 text-center active:scale-95 transition-all">
              <div className="text-lg">
                {ex.name.includes('跑') || ex.name.includes('走') ? '🏃' : ex.name.includes('泳') ? '🏊' : ex.name.includes('车') || ex.name.includes('骑行') ? '🚴' : ex.name.includes('球') ? '🏀' : ex.name.includes('瑜伽') ? '🧘' : ex.name.includes('HIIT') ? '💪' : ex.name.includes('绳') ? '🏃' : '🔥'}
              </div>
              <div className="text-xs font-medium text-gray-700">{ex.name}</div>
              <div className="text-[10px] text-gray-400">{ex.caloriesPerHour} kcal/h</div>
            </button>
          ))}
        </div>
      </div>

      {/* Today entries */}
      <div className="card">
        <h3 className="font-semibold text-gray-700 mb-3">📋 今日记录</h3>
        {todayList.length === 0 && <div className="text-center py-6 text-gray-400">🏋️ 今天还没运动</div>}
        {todayList.map(e => (
          <div key={e.id} className="flex justify-between py-2 border-b border-gray-50 last:border-0">
            <div><div className="font-medium text-sm">{e.exerciseName}</div><div className="text-xs text-gray-400">{e.duration}分钟</div></div>
            <div className="flex items-center gap-2">
              <div className="text-right"><div className="font-bold text-orange-600">{e.caloriesBurned}</div><div className="text-[10px] text-gray-400">kcal</div></div>
              <button onClick={() => handleDelete(e)} className="text-gray-300 hover:text-red-500">🗑️</button>
            </div>
          </div>
        ))}
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end" onClick={() => setShowAdd(false)}>
          <div className="bg-white rounded-t-2xl w-full max-w-lg p-6" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold mb-4">添加运动</h3>
            <div className="space-y-3">
              <select value={exercise} onChange={e => setExercise(e.target.value)} className="input-field">
                <option value="">选择运动...</option>
                {exerciseDatabase.map(ex => <option key={ex.name} value={ex.name}>{ex.name} ({ex.caloriesPerHour} kcal/h)</option>)}
              </select>
              <input type="number" value={duration} onChange={e => setDuration(Number(e.target.value))} placeholder="分钟" min={1} className="input-field" />
              {exercise && <div className="bg-orange-50 rounded-xl p-3 text-center text-sm text-orange-600">
                预计消耗：{Math.round((exerciseDatabase.find(e => e.name === exercise)?.caloriesPerHour || 0) * duration / 60)} kcal
              </div>}
            </div>
            <button onClick={handleAdd} disabled={!exercise || duration <= 0}
              className={`w-full mt-4 py-3 rounded-xl font-bold text-white ${exercise && duration > 0 ? 'bg-orange-500' : 'bg-gray-300'}`}>保存</button>
          </div>
        </div>
      )}
    </div>
  );
}
