import { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import { callAI, getAISettings } from '../utils/aiService';
import { buildAIContext } from '../utils/aiContext';

function getToday(): string { return new Date().toISOString().split('T')[0]; }

export default function WeeklyReport({ onNavigate }: { onNavigate?: (p: any) => void }) {
  const [report, setReport] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const profile = useLiveQuery(() => db.userProfile.get(1));
  const weekSummaries = useLiveQuery(() => db.getWeekSummaries(getToday()), []);

  const weekData = weekSummaries || [];

  const avgCal = weekData.filter(d => d.totalCalories > 0).length > 0
    ? Math.round(weekData.reduce((s, d) => s + d.totalCalories, 0) / weekData.filter(d => d.totalCalories > 0).length)
    : 0;
  const avgExercise = weekData.filter(d => d.exerciseCalories > 0).length > 0
    ? Math.round(weekData.reduce((s, d) => s + d.exerciseCalories, 0) / weekData.filter(d => d.exerciseCalories > 0).length)
    : 0;
  const totalDays = weekData.filter(d => d.totalCalories > 0).length;

  const handleGenerate = async () => {
    const hasKey = await getAISettings();
    if (!hasKey) { onNavigate?.('ai'); return; }
    setLoading(true);
    setError('');
    try {
      const ctx = await buildAIContext();
      const result = await callAI(
        `你是专业健康分析师。基于用户一周数据生成"健康周报"。
格式要求（使用emoji，排版精美）：
📅 本周总览（一句话总结）
📊 饮食分析（日均摄入、达标率、营养素评价）
🔥 运动分析（总消耗、频率、建议）
⚖️ 体重变化（趋势判断）
💡 下周建议（3条具体可执行的改进建议）
🎯 下周目标`,
        `${ctx}\n\n请生成本周健康周报。`
      );
      setReport(result);
    } catch (e: any) {
      setError(e.message);
    }
    setLoading(false);
  };

  return (
    <div className="px-4 pt-4 pb-20 space-y-4">
      {/* Week quick stats */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: '记录天数', val: `${totalDays}天`, icon: '📅', color: 'text-blue-600' },
          { label: '日均摄入', val: `${avgCal}`, unit: 'kcal', icon: '🍽️', color: 'text-green-600' },
          { label: '日均运动', val: `${avgExercise}`, unit: 'kcal', icon: '🔥', color: 'text-orange-600' },
          { label: '目标', val: `${profile?.dailyCalorieTarget || 2000}`, unit: 'kcal', icon: '🎯', color: 'text-purple-600' },
        ].map(s => (
          <div key={s.label} className="card text-center py-2">
            <div className="text-lg">{s.icon}</div>
            <div className={`font-bold text-sm ${s.color}`}>{s.val}{s.unit ? <span className="text-[10px]">{s.unit}</span> : ''}</div>
            <div className="text-[10px] text-gray-400">{s.label}</div>
          </div>
        ))}
      </div>

      {/* 7-day calorie chart */}
      <div className="card">
        <h3 className="font-semibold text-gray-700 mb-3">📊 本周热量趋势</h3>
        <div className="flex items-end gap-1 h-32">
          {weekData.map((d, i) => {
            const maxCal = Math.max(...weekData.map(w => w.totalCalories), profile?.dailyCalorieTarget || 2000, 1);
            const h = (d.totalCalories / maxCal) * 100;
            const targetH = ((profile?.dailyCalorieTarget || 2000) / maxCal) * 100;
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[10px] text-gray-500">{d.totalCalories || 0}</span>
                <div className="w-full relative" style={{ height: '100px' }}>
                  <div className="absolute bottom-0 w-full bg-green-400 rounded-t" style={{ height: `${Math.max(h, 2)}%` }} />
                  <div className="absolute w-full border-t border-dashed border-red-300" style={{ bottom: `${targetH}%` }} />
                </div>
                <span className="text-[10px] text-gray-400">{d.date.slice(5)}</span>
              </div>
            );
          })}
        </div>
        <div className="flex items-center gap-2 mt-2 text-[10px] text-gray-400">
          <div className="w-3 h-3 bg-green-400 rounded" /> 实际摄入
          <div className="w-3 border-t border-dashed border-red-300" /> 目标线
        </div>
      </div>

      {/* AI Report */}
      <div className="card bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-bold text-purple-700">🤖 AI 健康周报</h3>
          <button onClick={handleGenerate} disabled={loading}
            className="text-xs bg-purple-500 text-white px-3 py-1 rounded-full hover:bg-purple-600 disabled:opacity-50">
            {loading ? '生成中...' : report ? '重新生成' : '生成周报'}
          </button>
        </div>
        {error && <div className="text-sm text-red-500 mb-2">{error}</div>}
        {report ? (
          <div className="text-sm whitespace-pre-wrap bg-white rounded-xl p-3">{report}</div>
        ) : (
          <p className="text-xs text-gray-400">{loading ? 'AI 正在分析你的一周数据...' : 'AI 综合一周数据生成深度分析报告'}</p>
        )}
      </div>
    </div>
  );
}
