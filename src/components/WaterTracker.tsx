import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';

function getToday(): string { return new Date().toISOString().split('T')[0]; }

const QUICK_AMOUNTS = [100, 200, 300, 500];

export default function WaterTracker() {
  const today = getToday();
  const entries = useLiveQuery(() => db.waterEntries.where('date').equals(today).toArray(), [today]);
  const total = entries?.reduce((s, e) => s + e.amount, 0) || 0;
  const target = 2000;
  const pct = Math.min((total / target) * 100, 100);

  const [showAdd, setShowAdd] = useState(false);
  const [amount, setAmount] = useState(200);

  const handleAdd = async () => {
    await db.waterEntries.add({
      date: today,
      amount,
      time: new Date().toTimeString().slice(0, 5),
    });
    setShowAdd(false);
  };

  const handleQuickAdd = async (ml: number) => {
    await db.waterEntries.add({
      date: today,
      amount: ml,
      time: new Date().toTimeString().slice(0, 5),
    });
  };

  const handleDelete = async (id: number) => { await db.waterEntries.delete(id); };

  return (
    <div className="px-4 pt-4 pb-20 space-y-4">
      {/* Progress */}
      <div className="card text-center py-6 bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
        <div className="text-5xl mb-2">💧</div>
        <div className="text-4xl font-bold text-blue-600">{total}<span className="text-lg text-blue-400"> ml</span></div>
        <div className="text-sm text-blue-400 mt-1">目标 {target}ml</div>
        <div className="w-full h-3 bg-blue-100 rounded-full mt-3 overflow-hidden">
          <div className="h-full bg-blue-500 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
        </div>
        <div className="text-xs text-blue-400 mt-1">{pct >= 100 ? '✅ 已达标' : `还差 ${target - total}ml`}</div>
      </div>

      {/* Quick add */}
      <div className="card">
        <h3 className="font-semibold text-gray-700 mb-3">⚡ 快速记录</h3>
        <div className="flex gap-2">
          {QUICK_AMOUNTS.map(ml => (
            <button key={ml} onClick={() => handleQuickAdd(ml)}
              className="flex-1 py-3 rounded-xl bg-blue-50 text-blue-600 font-bold hover:bg-blue-100 active:scale-95 transition-all">
              +{ml}ml
            </button>
          ))}
          <button onClick={() => setShowAdd(true)}
            className="flex-1 py-3 rounded-xl bg-blue-500 text-white font-bold hover:bg-blue-600 active:scale-95 transition-all">
            自定义
          </button>
        </div>
      </div>

      {/* Today log */}
      <div className="card">
        <h3 className="font-semibold text-gray-700 mb-3">📋 今日记录</h3>
        {(!entries || entries.length === 0) && (
          <div className="text-center py-4 text-gray-400 text-sm">💧 今天还没喝水记录</div>
        )}
        {entries?.slice().reverse().map(e => (
          <div key={e.id} className="flex justify-between py-2 border-b border-gray-50 last:border-0">
            <div className="flex items-center gap-2">
              <span className="text-blue-400">💧</span>
              <span className="font-medium text-sm">{e.amount}ml</span>
              <span className="text-xs text-gray-400">{e.time}</span>
            </div>
            <button onClick={() => e.id && handleDelete(e.id)} className="text-gray-300 hover:text-red-500 text-xs">删除</button>
          </div>
        ))}
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end" onClick={() => setShowAdd(false)}>
          <div className="bg-white rounded-t-2xl w-full max-w-lg p-6" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold mb-4">💧 记录饮水</h3>
            <input type="number" value={amount} onChange={e => setAmount(Number(e.target.value))}
              placeholder="毫升 (ml)" min={50} max={5000} step={50} className="input-field text-center text-2xl" autoFocus />
            <div className="grid grid-cols-4 gap-2 mt-3">
              {[100, 200, 250, 300, 350, 500, 750, 1000].map(ml => (
                <button key={ml} onClick={() => setAmount(ml)}
                  className={`py-2 rounded-lg text-sm ${amount === ml ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}>{ml}</button>
              ))}
            </div>
            <button onClick={handleAdd} className="w-full mt-4 py-3 rounded-xl bg-blue-500 text-white font-bold">保存</button>
          </div>
        </div>
      )}
    </div>
  );
}
