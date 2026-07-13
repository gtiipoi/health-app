import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, ExerciseEntry } from '../db/database';
import { exerciseDatabase } from '../utils/foodData';

function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

export default function ExerciseLog() {
  const [showAdd, setShowAdd] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState('');
  const [duration, setDuration] = useState(30);
  const [date, setDate] = useState(getToday());
  const [note, setNote] = useState('');

  const entries = useLiveQuery(() =>
    db.exerciseEntries.where('date').equals(getToday()).toArray()
  );

  const todayEntries = entries || [];
  const totalCalories = todayEntries.reduce((sum, e) => sum + e.caloriesBurned, 0);

  const handleAdd = async () => {
    const exercise = exerciseDatabase.find((e) => e.name === selectedExercise);
    if (!exercise || duration <= 0) return;

    const caloriesBurned = Math.round((exercise.caloriesPerHour * duration) / 60);

    await db.exerciseEntries.add({
      date,
      exerciseName: selectedExercise,
      duration,
      caloriesBurned,
      note: note || undefined,
      createdAt: new Date().toISOString(),
    });

    setSelectedExercise('');
    setDuration(30);
    setNote('');
    setDate(getToday());
    setShowAdd(false);
  };

  const handleDelete = async (entry: ExerciseEntry) => {
    if (entry.id) await db.exerciseEntries.delete(entry.id);
  };

  return (
    <div className="px-4 pt-4 space-y-4">
      {/* Summary card */}
      <div className="card text-center py-4 bg-gradient-to-br from-orange-50 to-red-50 border-orange-100">
        <div className="text-xs text-orange-500 mb-1">今日运动消耗</div>
        <div className="text-4xl font-bold text-orange-600">
          {totalCalories}
          <span className="text-lg font-normal text-orange-400"> kcal</span>
        </div>
        <div className="text-xs text-orange-400 mt-1">
          共 {todayEntries.length} 项运动 · {todayEntries.reduce((s, e) => s + e.duration, 0)} 分钟
        </div>
      </div>

      {/* Quick add buttons */}
      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-700">快速记录运动</h3>
          <button onClick={() => setShowAdd(true)} className="btn-primary text-xs py-1.5 px-4">
            + 自定义
          </button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {exerciseDatabase.slice(0, 12).map((exercise) => (
            <button
              key={exercise.name}
              onClick={() => {
                setSelectedExercise(exercise.name);
                setShowAdd(true);
              }}
              className="text-center p-3 rounded-xl bg-gray-50 hover:bg-primary-50 hover:border-primary-200 border border-transparent transition-all active:scale-95"
            >
              <div className="text-lg mb-0.5">
                {exercise.name.includes('跑') || exercise.name.includes('走') ? '🏃' :
                 exercise.name.includes('泳') ? '🏊' :
                 exercise.name.includes('车') || exercise.name.includes('骑行') ? '🚴' :
                 exercise.name.includes('球') ? '🏀' :
                 exercise.name.includes('瑜伽') ? '🧘' :
                 exercise.name.includes('HIIT') ? '💪' :
                 exercise.name.includes('绳') ? '🏃' : '🔥'}
              </div>
              <div className="text-xs font-medium text-gray-700">{exercise.name}</div>
              <div className="text-[10px] text-gray-400">{exercise.caloriesPerHour} kcal/h</div>
            </button>
          ))}
        </div>
      </div>

      {/* Today entries */}
      <div className="card">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">今日运动记录</h3>
        {todayEntries.length === 0 && (
          <div className="text-center py-6 text-gray-400">
            <span className="text-3xl block mb-2">🏋️</span>
            <span className="text-sm">今天还没有运动记录</span>
          </div>
        )}
        <div className="space-y-2">
          {todayEntries.map((entry) => (
            <div key={entry.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
              <div>
                <div className="font-medium text-gray-800 text-sm">{entry.exerciseName}</div>
                <div className="text-xs text-gray-400">{entry.duration} 分钟</div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <div className="font-bold text-orange-600 text-sm">{entry.caloriesBurned}</div>
                  <div className="text-[10px] text-gray-400">kcal</div>
                </div>
                <button onClick={() => handleDelete(entry)} className="text-gray-300 hover:text-red-500">
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end justify-center" onClick={() => setShowAdd(false)}>
          <div className="bg-white rounded-t-2xl w-full max-w-lg p-6 animate-[slideUp_0.3s_ease-out]" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-800 mb-4">添加运动记录</h3>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">运动类型</label>
                <select
                  value={selectedExercise}
                  onChange={(e) => setSelectedExercise(e.target.value)}
                  className="input-field"
                >
                  <option value="">选择运动...</option>
                  {exerciseDatabase.map((ex) => (
                    <option key={ex.name} value={ex.name}>
                      {ex.name} ({ex.caloriesPerHour} kcal/h)
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">时长 (分钟)</label>
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  min={1}
                  max={600}
                  className="input-field"
                />
              </div>
              {selectedExercise && (
                <div className="bg-orange-50 rounded-xl p-3 text-center">
                  <span className="text-sm text-orange-600">
                    预计消耗：{Math.round((exerciseDatabase.find(e => e.name === selectedExercise)?.caloriesPerHour || 0) * duration / 60)} kcal
                  </span>
                </div>
              )}
              <div>
                <label className="text-xs text-gray-500 mb-1 block">日期</label>
                <input type="date" value={date} max={getToday()} onChange={(e) => setDate(e.target.value)} className="input-field" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">备注（可选）</label>
                <input type="text" value={note} onChange={(e) => setNote(e.target.value)} placeholder="例如：慢跑5公里" className="input-field" />
              </div>
            </div>

            <button
              onClick={handleAdd}
              disabled={!selectedExercise || duration <= 0}
              className={`w-full mt-4 py-3 rounded-xl font-semibold text-white transition-all ${
                selectedExercise && duration > 0 ? 'bg-orange-500 hover:bg-orange-600' : 'bg-gray-300 cursor-not-allowed'
              }`}
            >
              保存记录
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
