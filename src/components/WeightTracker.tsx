import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, WeightEntry } from '../db/database';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

export default function WeightTracker() {
  const [showAdd, setShowAdd] = useState(false);
  const [weight, setWeight] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(getToday());
  const [viewDays, setViewDays] = useState<30 | 90 | 180>(30);

  const entries = useLiveQuery(() => db.weightEntries.orderBy('date').reverse().limit(viewDays).toArray(), [viewDays]);
  const profile = useLiveQuery(() => db.userProfile.get(1));

  const chartData = entries
    ? [...entries]
        .reverse()
        .map((e) => ({
          date: e.date.slice(5),
          weight: e.weight,
        }))
    : [];

  const currentWeight = entries && entries.length > 0 ? entries[0].weight : null;
  const startWeight = entries && entries.length > 0 ? entries[entries.length - 1].weight : null;
  const weightChange =
    currentWeight && startWeight ? (currentWeight - startWeight).toFixed(1) : null;

  const minWeight = chartData.length > 0 ? Math.min(...chartData.map((d) => d.weight)) - 2 : 40;
  const maxWeight = chartData.length > 0 ? Math.max(...chartData.map((d) => d.weight)) + 2 : 100;

  const handleAdd = async () => {
    const w = parseFloat(weight);
    if (!w || w < 20 || w > 300) return;

    await db.weightEntries.add({
      date,
      weight: w,
      note: note || undefined,
    });

    setWeight('');
    setNote('');
    setDate(getToday());
    setShowAdd(false);
  };

  const handleDelete = async (entry: WeightEntry) => {
    if (entry.id) await db.weightEntries.delete(entry.id);
  };

  return (
    <div className="px-4 pt-4 space-y-4">
      {/* Current weight card */}
      <div className="card text-center py-4">
        <div className="text-xs text-gray-400 mb-1">当前体重</div>
        <div className="text-4xl font-bold text-gray-800">
          {currentWeight ? currentWeight : '--'}
          <span className="text-lg font-normal text-gray-400"> kg</span>
        </div>
        {weightChange && (
          <div
            className={`text-sm mt-1 font-medium ${
              Number(weightChange) <= 0 ? 'text-green-500' : 'text-red-500'
            }`}
          >
            较{viewDays}天前 {Number(weightChange) > 0 ? '+' : ''}{weightChange} kg
          </div>
        )}
        {profile?.goalWeight && currentWeight && (
          <div className="text-xs text-gray-400 mt-1">
            目标：{profile.goalWeight} kg · 还需{' '}
            {currentWeight > profile.goalWeight
              ? `减 ${(currentWeight - profile.goalWeight).toFixed(1)}`
              : `增 ${(profile.goalWeight - currentWeight).toFixed(1)}`}{' '}
            kg
          </div>
        )}
      </div>

      {/* Chart */}
      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-700">体重趋势</h3>
          <div className="flex gap-1">
            {([30, 90, 180] as const).map((days) => (
              <button
                key={days}
                onClick={() => setViewDays(days)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  viewDays === days ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-500'
                }`}
              >
                {days}天
              </button>
            ))}
          </div>
        </div>

        {chartData.length > 1 ? (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: '#9ca3af' }}
                interval="preserveStartEnd"
              />
              <YAxis
                domain={[minWeight, maxWeight]}
                tick={{ fontSize: 10, fill: '#9ca3af' }}
                width={40}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: '10px',
                  border: 'none',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                }}
                labelStyle={{ fontSize: 12 }}
              />
              {profile?.goalWeight && (
                <ReferenceLine
                  y={profile.goalWeight}
                  stroke="#22c55e"
                  strokeDasharray="6 3"
                  label={{
                    value: `目标 ${profile.goalWeight}kg`,
                    fontSize: 10,
                    fill: '#22c55e',
                    position: 'right',
                  }}
                />
              )}
              <Line
                type="monotone"
                dataKey="weight"
                stroke="#22c55e"
                strokeWidth={2.5}
                dot={{ r: 3, fill: '#22c55e', strokeWidth: 0 }}
                activeDot={{ r: 6, fill: '#16a34a', strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center py-10 text-gray-400">
            <span className="text-3xl">📈</span>
            <p className="text-sm mt-2">数据不足，请添加体重记录</p>
          </div>
        )}
      </div>

      {/* History */}
      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-700">历史记录</h3>
          <button onClick={() => setShowAdd(true)} className="btn-primary text-xs py-1.5 px-4">
            + 添加
          </button>
        </div>
        <div className="space-y-2">
          {(!entries || entries.length === 0) && (
            <div className="text-center py-4 text-gray-400 text-sm">暂无记录</div>
          )}
          {entries?.map((entry) => (
            <div
              key={entry.id}
              className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
            >
              <div>
                <div className="font-medium text-gray-800 text-sm">{entry.weight} kg</div>
                <div className="text-xs text-gray-400">{entry.date}</div>
              </div>
              <div className="flex items-center gap-2">
                {entry.note && <span className="text-xs text-gray-400">{entry.note}</span>}
                <button
                  onClick={() => handleDelete(entry)}
                  className="text-gray-300 hover:text-red-500 transition-colors"
                >
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
          <div
            className="bg-white rounded-t-2xl w-full max-w-lg p-6 animate-[slideUp_0.3s_ease-out]"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-gray-800 mb-4">记录体重</h3>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">日期</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  max={getToday()}
                  className="input-field"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">体重 (kg)</label>
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="例如：65.5"
                  step="0.1"
                  min={20}
                  max={300}
                  className="input-field"
                  autoFocus
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">备注（可选）</label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="例如：早上空腹"
                  className="input-field"
                />
              </div>
            </div>

            <button
              onClick={handleAdd}
              disabled={!weight}
              className={`w-full mt-4 py-3 rounded-xl font-semibold text-white transition-all ${
                weight ? 'bg-primary-500 hover:bg-primary-600' : 'bg-gray-300 cursor-not-allowed'
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
