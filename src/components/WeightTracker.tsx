import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, WeightEntry } from '../db/database';
import { getAIWeightAnalysis, getAISettings } from '../utils/aiService';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

function getToday(): string { return new Date().toISOString().split('T')[0]; }

export default function WeightTracker({ onNavigate }: { onNavigate?: (p: any) => void }) {
  const [showAdd, setShowAdd] = useState(false);
  const [weight, setWeight] = useState('');
  const [date, setDate] = useState(getToday());
  const [viewDays, setViewDays] = useState<30 | 90 | 180>(30);
  const [aiAnalysis, setAiAnalysis] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  const entries = useLiveQuery(() => db.weightEntries.orderBy('date').reverse().limit(viewDays).toArray(), [viewDays]);
  const profile = useLiveQuery(() => db.userProfile.get(1));

  const chartData = entries ? [...entries].reverse().map(e => ({ date: e.date.slice(5), weight: e.weight })) : [];
  const current = entries?.[0]?.weight ?? null;
  const start = entries?.[entries.length - 1]?.weight ?? null;
  const change = current && start ? (current - start).toFixed(1) : null;
  const minW = chartData.length > 0 ? Math.min(...chartData.map(d => d.weight)) - 3 : 40;
  const maxW = chartData.length > 0 ? Math.max(...chartData.map(d => d.weight)) + 3 : 100;

  const handleAdd = async () => {
    const w = parseFloat(weight);
    if (!w || w < 20 || w > 300) return;
    await db.weightEntries.add({ date, weight: w });
    setWeight(''); setDate(getToday()); setShowAdd(false);
  };

  const handleDelete = async (e: WeightEntry) => { if (e.id) await db.weightEntries.delete(e.id); };

  const handleAIAnalysis = async () => {
    const hasKey = await getAISettings();
    if (!hasKey) { onNavigate?.('ai'); return; }
    setAiLoading(true);
    try { setAiAnalysis(await getAIWeightAnalysis()); } catch { setAiAnalysis(''); }
    setAiLoading(false);
  };

  return (
    <div className="px-4 pt-4 pb-20 space-y-4">
      {/* Current weight */}
      <div className="card text-center py-4">
        <div className="text-xs text-gray-400">当前体重</div>
        <div className="text-4xl font-bold">{current ?? '--'}<span className="text-lg text-gray-400"> kg</span></div>
        {change && <div className={`text-sm font-medium ${Number(change) <= 0 ? 'text-green-500' : 'text-red-500'}`}>
          {viewDays}天 {Number(change) > 0 ? '+' : ''}{change} kg
        </div>}
        {profile?.goalWeight && current && (
          <div className="text-xs text-gray-400 mt-1">
            目标 {profile.goalWeight}kg · 还需{current > profile.goalWeight ? '减' : '增'} {Math.abs(current - profile.goalWeight).toFixed(1)}kg
          </div>
        )}
      </div>

      {/* Chart */}
      <div className="card">
        <div className="flex justify-between mb-3">
          <h3 className="font-semibold text-gray-700">📈 趋势</h3>
          <div className="flex gap-1">
            {([30, 90, 180] as const).map(d => (
              <button key={d} onClick={() => setViewDays(d)}
                className={`px-3 py-1 rounded-lg text-xs font-medium ${viewDays === d ? 'bg-primary-500 text-white' : 'bg-gray-100'}`}>{d}天</button>
            ))}
          </div>
        </div>
        {chartData.length > 1 ? (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9ca3af' }} interval="preserveStartEnd" />
              <YAxis domain={[minW, maxW]} tick={{ fontSize: 10, fill: '#9ca3af' }} width={40} />
              <Tooltip contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
              {profile?.goalWeight && <ReferenceLine y={profile.goalWeight} stroke="#22c55e" strokeDasharray="6 3" label={{ value: `目标${profile.goalWeight}kg`, fontSize: 10, fill: '#22c55e', position: 'right' }} />}
              <Line type="monotone" dataKey="weight" stroke="#22c55e" strokeWidth={2.5} dot={{ r: 3, fill: '#22c55e' }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        ) : <div className="text-center py-10 text-gray-400">📈 数据不足</div>}
      </div>

      {/* AI Analysis */}
      <div className="card bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-bold text-blue-700">🤖 AI 体重分析</h3>
          <button onClick={handleAIAnalysis} disabled={aiLoading}
            className="text-xs bg-blue-500 text-white px-3 py-1 rounded-full hover:bg-blue-600 disabled:opacity-50">
            {aiLoading ? '分析中...' : '分析趋势'}
          </button>
        </div>
        {aiAnalysis ? <div className="text-sm whitespace-pre-wrap bg-white rounded-xl p-3">{aiAnalysis}</div>
          : <p className="text-xs text-gray-400">{aiLoading ? 'AI 正在分析...' : 'AI 解读体重趋势，预测达标时间'}</p>}
      </div>

      {/* History + Add */}
      <div className="card">
        <div className="flex justify-between mb-3">
          <h3 className="font-semibold text-gray-700">📋 记录</h3>
          <button onClick={() => setShowAdd(true)} className="btn-primary text-xs py-1.5 px-4">+ 记录</button>
        </div>
        {entries?.map(e => (
          <div key={e.id} className="flex justify-between py-2 border-b border-gray-50 last:border-0">
            <div><div className="font-medium text-sm">{e.weight} kg</div><div className="text-xs text-gray-400">{e.date}</div></div>
            <button onClick={() => handleDelete(e)} className="text-gray-300 hover:text-red-500">🗑️</button>
          </div>
        ))}
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end" onClick={() => setShowAdd(false)}>
          <div className="bg-white rounded-t-2xl w-full max-w-lg p-6" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold mb-4">记录体重</h3>
            <div className="space-y-3">
              <input type="date" value={date} max={getToday()} onChange={e => setDate(e.target.value)} className="input-field" />
              <input type="number" value={weight} onChange={e => setWeight(e.target.value)} placeholder="体重 kg" step="0.1" className="input-field" autoFocus />
            </div>
            <button onClick={handleAdd} disabled={!weight} className={`w-full mt-4 py-3 rounded-xl font-bold text-white ${weight ? 'bg-primary-500' : 'bg-gray-300'}`}>保存</button>
          </div>
        </div>
      )}
    </div>
  );
}
