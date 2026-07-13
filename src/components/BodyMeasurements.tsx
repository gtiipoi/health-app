import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, BodyMeasurement } from '../db/database';

function getToday(): string { return new Date().toISOString().split('T')[0]; }

const MEASURE_FIELDS: { key: keyof BodyMeasurement; label: string; icon: string }[] = [
  { key: 'waist', label: '腰围', icon: '📏' },
  { key: 'hip', label: '臀围', icon: '🔄' },
  { key: 'chest', label: '胸围', icon: '❤️' },
  { key: 'arm', label: '臂围', icon: '💪' },
  { key: 'thigh', label: '腿围', icon: '🦵' },
  { key: 'bodyFat', label: '体脂率', icon: '📊' },
];

export default function BodyMeasurements() {
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState<Partial<BodyMeasurement>>({ date: getToday() });

  const latest = useLiveQuery(() => db.getLatestMeasurements());
  const history = useLiveQuery(() => db.bodyMeasurements.orderBy('date').reverse().limit(10).toArray());

  const handleSave = async () => {
    await db.bodyMeasurements.add({
      date: form.date || getToday(),
      waist: form.waist,
      hip: form.hip,
      chest: form.chest,
      arm: form.arm,
      thigh: form.thigh,
      bodyFat: form.bodyFat,
    });
    setForm({ date: getToday() });
    setShowAdd(false);
  };

  const handleDelete = async (id: number) => { await db.bodyMeasurements.delete(id); };

  return (
    <div className="px-4 pt-4 pb-20 space-y-4">
      {/* Latest measurements */}
      <div className="card">
        <div className="flex justify-between mb-3">
          <h3 className="font-semibold text-gray-700">📏 最新数据</h3>
          <button onClick={() => setShowAdd(true)} className="btn-primary text-xs py-1.5 px-4">+ 记录</button>
        </div>
        {latest ? (
          <div className="grid grid-cols-3 gap-3">
            {MEASURE_FIELDS.map(f => {
              const val = latest[f.key];
              if (val == null) return null;
              return (
                <div key={f.key} className="bg-gray-50 rounded-xl p-3 text-center">
                  <div className="text-lg">{f.icon}</div>
                  <div className="font-bold text-lg text-gray-800">
                    {f.key === 'bodyFat' ? `${val}%` : `${val}`}
                  </div>
                  <div className="text-[10px] text-gray-400">{f.label}{f.key !== 'bodyFat' ? ' cm' : ''}</div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-6 text-gray-400">暂无数据，点击右上角记录</div>
        )}
      </div>

      {/* History */}
      <div className="card">
        <h3 className="font-semibold text-gray-700 mb-3">📋 历史记录</h3>
        {history?.map(m => (
          <div key={m.id} className="py-3 border-b border-gray-50 last:border-0">
            <div className="flex justify-between items-start">
              <span className="text-xs text-gray-400">{m.date}</span>
              <button onClick={() => m.id && handleDelete(m.id)} className="text-gray-300 hover:text-red-500 text-xs">删除</button>
            </div>
            <div className="flex gap-4 mt-1 flex-wrap">
              {MEASURE_FIELDS.map(f => {
                const val = m[f.key];
                if (val == null) return null;
                return (
                  <span key={f.key} className="text-sm text-gray-600">
                    {f.icon} {f.key === 'bodyFat' ? `${val}%` : `${val}cm`}
                  </span>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end" onClick={() => setShowAdd(false)}>
          <div className="bg-white rounded-t-2xl w-full max-w-lg p-6 max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold mb-4">📏 记录身体数据</h3>
            <div className="space-y-3">
              <input type="date" value={form.date || ''} max={getToday()}
                onChange={e => setForm({ ...form, date: e.target.value })} className="input-field" />
              {MEASURE_FIELDS.map(f => (
                <div key={f.key}>
                  <label className="text-xs text-gray-500 mb-1 block">{f.icon} {f.label}{f.key !== 'bodyFat' ? ' (cm)' : ' (%)'}</label>
                  <input type="number" step="0.1"
                    value={form[f.key] ?? ''}
                    onChange={e => setForm({ ...form, [f.key]: e.target.value ? Number(e.target.value) : undefined })}
                    placeholder={f.key === 'bodyFat' ? '例如：22.5' : '例如：72'}
                    className="input-field" />
                </div>
              ))}
            </div>
            <button onClick={handleSave} className="w-full mt-4 py-3 rounded-xl bg-primary-500 text-white font-bold">保存</button>
          </div>
        </div>
      )}
    </div>
  );
}
