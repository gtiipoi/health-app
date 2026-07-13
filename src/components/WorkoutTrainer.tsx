import { useState, useEffect, useRef } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import { workoutTemplates, exerciseLibrary, WorkoutTemplate, Exercise } from '../utils/workoutData';
import { getAIExercisePlan, getAISettings } from '../utils/aiService';
import { safetyWarnings, getRandomTrainingCheer } from '../utils/petDialog';

function getToday(): string { return new Date().toISOString().split('T')[0]; }

type Mode = 'browse' | 'detail' | 'training' | 'complete';

export default function WorkoutTrainer({ onNavigate }: { onNavigate?: (p: any) => void }) {
  const [mode, setMode] = useState<Mode>('browse');
  const [filter, setFilter] = useState<'all' | 'home' | 'gym'>('all');
  const [selectedTemplate, setSelectedTemplate] = useState<WorkoutTemplate | null>(null);
  const [currentExIdx, setCurrentExIdx] = useState(0);
  const [timer, setTimer] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [completedExercises, setCompletedExercises] = useState<Set<number>>(new Set());
  const [aiPlan, setAiPlan] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [workoutStartTime, setWorkoutStartTime] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const todayLogs = useLiveQuery(() =>
    db.exerciseEntries.where('date').equals(getToday()).toArray()
  );

  useEffect(() => {
    if (isRunning && timer > 0) {
      timerRef.current = setInterval(() => setTimer(t => t - 1), 1000);
      return () => { if (timerRef.current) clearInterval(timerRef.current); };
    } else if (timer === 0 && isRunning) {
      setIsRunning(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }, [isRunning, timer]);

  const filtered = filter === 'all' ? workoutTemplates : workoutTemplates.filter(t => t.type === filter);

  const startWorkout = (template: WorkoutTemplate) => {
    setSelectedTemplate(template);
    setCurrentExIdx(0);
    setCompletedExercises(new Set());
    setMode('detail');
  };

  const beginTraining = () => {
    if (!selectedTemplate) return;
    setMode('training');
    setCurrentExIdx(0);
    setCompletedExercises(new Set());
    setWorkoutStartTime(Date.now());
    const firstEx = selectedTemplate.exercises[0];
    setTimer(firstEx.duration || 60);
    setIsRunning(false);
  };

  const currentExercise = selectedTemplate?.exercises[currentExIdx];
  const exerciseDetail = currentExercise
    ? exerciseLibrary.find(e => e.name === currentExercise.name)
    : null;

  const markComplete = async () => {
    const newCompleted = new Set(completedExercises);
    newCompleted.add(currentExIdx);
    setCompletedExercises(newCompleted);

    // Log the exercise
    if (currentExercise && exerciseDetail) {
      const cals = Math.round((currentExercise.duration || 60) / 60 * 400); // rough estimate
      await db.exerciseEntries.add({
        date: getToday(),
        exerciseName: currentExercise.name,
        duration: Math.round((currentExercise.duration || 60) / 60),
        caloriesBurned: cals,
        createdAt: new Date().toISOString(),
      });
    }

    if (currentExIdx < (selectedTemplate?.exercises.length || 0) - 1) {
      const nextIdx = currentExIdx + 1;
      setCurrentExIdx(nextIdx);
      const nextEx = selectedTemplate!.exercises[nextIdx];
      setTimer(nextEx.duration || 60);
      setIsRunning(false);
    } else {
      // Workout complete!
      setMode('complete');
      setIsRunning(false);
    }
  };

  const handleAIPlan = async () => {
    const hasKey = await getAISettings();
    if (!hasKey) { onNavigate?.('ai'); return; }
    setAiLoading(true);
    try { setAiPlan(await getAIExercisePlan()); } catch { setAiPlan(''); }
    setAiLoading(false);
  };

  const diffBadge = (d: string) => {
    const m: Record<string, string> = { '初级': 'bg-green-100 text-green-600', '中级': 'bg-amber-100 text-amber-600', '高级': 'bg-red-100 text-red-600' };
    return m[d] || '';
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div className="px-4 pt-4 pb-20 space-y-4">
      {/* === BROWSE MODE === */}
      {mode === 'browse' && (
        <>
          {/* AI Plan */}
          <div className="card bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-bold text-indigo-700">🤖 AI 定制训练计划</h3>
              <button onClick={handleAIPlan} disabled={aiLoading}
                className="text-xs bg-indigo-500 text-white px-3 py-1 rounded-full hover:bg-indigo-600 disabled:opacity-50">
                {aiLoading ? '生成中...' : '生成计划'}
              </button>
            </div>
            {aiPlan ? <div className="text-sm whitespace-pre-wrap bg-white rounded-xl p-3">{aiPlan}</div>
              : <p className="text-xs text-gray-400">{aiLoading ? 'AI 正在定制...' : 'AI 根据你的数据生成个性化训练方案'}</p>}
          </div>

          {/* Type filter */}
          <div className="flex gap-2">
            {[{ k: 'all' as const, l: '全部' }, { k: 'home' as const, l: '🏠 居家' }, { k: 'gym' as const, l: '🏋️ 健身房' }]
              .map(f => (
                <button key={f.k} onClick={() => setFilter(f.k)}
                  className={`px-4 py-2 rounded-full text-sm font-medium ${filter === f.k ? 'bg-primary-500 text-white' : 'bg-white border text-gray-500'}`}>{f.l}</button>
              ))}
          </div>

          {/* Templates */}
          <div className="grid gap-3">
            {filtered.map(t => (
              <button key={t.id} onClick={() => startWorkout(t)}
                className="card text-left hover:shadow-md active:scale-[0.98] transition-all">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{t.target} · {t.name}</h3>
                    <p className="text-xs text-gray-400 mt-1">{t.description}</p>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${diffBadge(t.difficulty)}`}>{t.difficulty}</span>
                </div>
                <div className="flex gap-3 text-xs text-gray-500 mt-2">
                  <span>⏱ {t.duration}分钟</span>
                  <span>{t.exercises.length}个动作</span>
                  <span>{t.type === 'home' ? '🏠' : '🏋️'}</span>
                </div>
              </button>
            ))}
          </div>
        </>
      )}

      {/* === DETAIL MODE === */}
      {mode === 'detail' && selectedTemplate && (
        <>
          <div className="card">
            <button onClick={() => setMode('browse')} className="text-gray-400 text-sm mb-2">← 返回</button>
            <h3 className="text-lg font-bold">{selectedTemplate.name}</h3>
            <p className="text-sm text-gray-500 mt-1">{selectedTemplate.description}</p>
            <div className="flex gap-3 mt-3 text-sm">
              <span className="bg-gray-100 px-3 py-1 rounded-full">⏱ {selectedTemplate.duration}分钟</span>
              <span className="bg-gray-100 px-3 py-1 rounded-full">{selectedTemplate.exercises.length}个动作</span>
              <span className={`px-3 py-1 rounded-full ${diffBadge(selectedTemplate.difficulty)}`}>{selectedTemplate.difficulty}</span>
            </div>
            <button onClick={beginTraining}
              className="w-full mt-4 py-3 rounded-xl bg-indigo-500 text-white font-bold text-lg hover:bg-indigo-600 active:scale-[0.98] transition-all">
              🏃 开始训练
            </button>
          </div>
          <div className="card">
            <h3 className="font-semibold mb-3">📋 训练动作列表</h3>
            {selectedTemplate.exercises.map((ex, i) => {
              const detail = exerciseLibrary.find(e => e.name === ex.name);
              return (
                <div key={i} className="flex items-start gap-3 py-2 border-b border-gray-50 last:border-0">
                  <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 text-xs flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{ex.name}
                      <span className="text-[10px] text-gray-400 ml-2">{detail?.category === 'warmup' ? '热身' : detail?.category === 'stretch' ? '拉伸' : detail?.category === 'cardio' ? '有氧' : '力量'}</span>
                    </div>
                    <div className="text-xs text-gray-400">
                      {ex.sets && ex.reps ? `${ex.sets}组 × ${ex.reps}` : ex.duration ? `${ex.duration}秒` : ''} · 休息{ex.rest}秒
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* === TRAINING MODE === */}
      {mode === 'training' && selectedTemplate && currentExercise && (
        <div className="space-y-4">
          {/* Progress bar */}
          <div className="card">
            <div className="flex justify-between text-xs text-gray-400 mb-2">
              <span>动作 {currentExIdx + 1} / {selectedTemplate.exercises.length}</span>
              <span>{completedExercises.size} 已完成</span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500 rounded-full transition-all"
                style={{ width: `${(completedExercises.size / selectedTemplate.exercises.length) * 100}%` }} />
            </div>
          </div>

          {/* Current exercise */}
          <div className="card text-center py-6 bg-gradient-to-br from-indigo-50 to-blue-50 border-indigo-200">
            <div className="text-5xl mb-3">
              {exerciseDetail?.category === 'warmup' ? '🔥' :
               exerciseDetail?.category === 'stretch' ? '🧘' :
               exerciseDetail?.category === 'cardio' ? '💨' : '💪'}
            </div>
            <h2 className="text-2xl font-bold text-gray-800">{currentExercise.name}</h2>
            <div className="text-sm text-gray-500 mt-1">
              {currentExercise.sets && currentExercise.reps
                ? `${currentExercise.sets}组 × ${currentExercise.reps}`
                : `持续 ${currentExercise.duration}秒`}
            </div>
            {currentExercise.rest > 0 && (
              <div className="text-xs text-gray-400 mt-1">完成后休息 {currentExercise.rest} 秒</div>
            )}

            {/* Timer */}
            <div className="my-4">
              <div className={`text-6xl font-bold font-mono ${timer <= 10 && isRunning ? 'text-red-500 animate-pulse' : 'text-indigo-600'}`}>
                {formatTime(timer)}
              </div>
              <div className="flex justify-center gap-3 mt-3">
                {!isRunning ? (
                  <button onClick={() => setIsRunning(true)}
                    className="px-6 py-2 rounded-full bg-indigo-500 text-white font-bold hover:bg-indigo-600 transition-all">
                    {timer === (currentExercise.duration || 60) ? '▶ 开始' : '▶ 继续'}
                  </button>
                ) : (
                  <button onClick={() => setIsRunning(false)}
                    className="px-6 py-2 rounded-full bg-amber-500 text-white font-bold">⏸ 暂停</button>
                )}
                <button onClick={() => { setIsRunning(false); setTimer(currentExercise.duration || 60); }}
                  className="px-4 py-2 rounded-full bg-gray-200 text-gray-600 font-medium">↺ 重置</button>
              </div>
            </div>
          </div>

          {/* Exercise detail & tips */}
          {exerciseDetail && (
            <div className="card">
              <h3 className="font-semibold mb-2">📖 动作说明</h3>
              <p className="text-sm text-gray-600 mb-3">{exerciseDetail.description}</p>
              <h3 className="font-semibold mb-2">⚠️ 动作要点</h3>
              <div className="space-y-1">
                {exerciseDetail.tips.map((tip, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="text-amber-500 shrink-0">•</span> {tip}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Safety warning */}
          {currentExercise && safetyWarnings[currentExercise.name] && (
            <div className="card bg-red-50 border-red-200 animate-pulse">
              <div className="flex items-start gap-2">
                <span className="text-lg">😟</span>
                <div>
                  <div className="text-sm font-bold text-red-600">小轻的安全提醒</div>
                  <p className="text-xs text-red-500 mt-1">{safetyWarnings[currentExercise.name]}</p>
                </div>
              </div>
            </div>
          )}

          {/* Pet encouragement */}
          <div className="card bg-amber-50 border-amber-200">
            <div className="flex items-center gap-2">
              <span className="text-lg">🐱</span>
              <p className="text-sm text-amber-700">小轻说：{getRandomTrainingCheer().text}</p>
            </div>
          </div>

          {/* Mark complete */}
          <button onClick={markComplete}
            className="w-full py-4 rounded-xl bg-green-500 text-white font-bold text-lg hover:bg-green-600 active:scale-[0.98] transition-all shadow-lg shadow-green-200">
            ✅ 完成{currentExercise.name}
            {currentExIdx < selectedTemplate.exercises.length - 1 ? '，进入下一动作' : '，结束训练'}
          </button>

          {/* Skip */}
          <button onClick={() => {
            if (currentExIdx < selectedTemplate.exercises.length - 1) {
              setCurrentExIdx(currentExIdx + 1);
              setTimer(selectedTemplate.exercises[currentExIdx + 1].duration || 60);
              setIsRunning(false);
            } else {
              setMode('complete');
            }
          }} className="w-full py-2 text-gray-400 text-sm">
            跳过此动作 →
          </button>
        </div>
      )}

      {/* === COMPLETE MODE === */}
      {mode === 'complete' && selectedTemplate && (
        <div className="space-y-4">
          <div className="card text-center py-8 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-green-700">训练完成！</h2>
            <p className="text-gray-500 mt-2">{selectedTemplate.name}</p>
            <div className="flex justify-center gap-6 mt-4">
              <div>
                <div className="text-2xl font-bold text-green-600">{selectedTemplate.duration}</div>
                <div className="text-xs text-gray-400">总时长(分钟)</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{selectedTemplate.exercises.length}</div>
                <div className="text-xs text-gray-400">完成动作</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{Math.round(selectedTemplate.duration * 6)}</div>
                <div className="text-xs text-gray-400">估算消耗(kcal)</div>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={() => setMode('browse')}
              className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-600 font-medium hover:bg-gray-200">
              返回列表
            </button>
            <button onClick={beginTraining}
              className="flex-1 py-3 rounded-xl bg-green-500 text-white font-bold hover:bg-green-600">
              再做一次
            </button>
          </div>

          {/* Today's logs */}
          <div className="card">
            <h3 className="font-semibold text-gray-700 mb-3">📋 今日训练记录</h3>
            {todayLogs && todayLogs.length > 0 ? (
              todayLogs.slice().reverse().map(e => (
                <div key={e.id} className="flex justify-between py-2 border-b border-gray-50 last:border-0">
                  <div>
                    <div className="font-medium text-sm">{e.exerciseName}</div>
                    <div className="text-xs text-gray-400">{e.duration}分钟 · {e.caloriesBurned}kcal</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-gray-400 text-sm">暂无记录</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
