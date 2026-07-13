import { useState, useMemo } from 'react';
import { recipes, searchRecipes, Recipe } from '../utils/recipes';
import { getAIRecipe, getAISettings } from '../utils/aiService';

const mealLabels: Record<string, string> = { breakfast: '早餐', lunch: '午餐', dinner: '晚餐', snack: '加餐' };
const diffColors: Record<string, string> = { '简单': 'bg-green-100 text-green-600', '中等': 'bg-amber-100 text-amber-600', '困难': 'bg-red-100 text-red-600' };

export default function Recipes({ onNavigate }: { onNavigate?: (p: any) => void }) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'breakfast' | 'lunch' | 'dinner' | 'snack'>('all');
  const [selected, setSelected] = useState<Recipe | null>(null);

  // AI recipe generation
  const [aiIngredients, setAiIngredients] = useState('');
  const [aiPrefs, setAiPrefs] = useState('');
  const [aiRecipe, setAiRecipe] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  const filtered = useMemo(() => {
    let r = query.trim() ? searchRecipes(query) : recipes;
    if (filter !== 'all') r = r.filter(rec => rec.mealType === filter);
    return r;
  }, [query, filter]);

  const handleAIGenerate = async () => {
    const hasKey = await getAISettings();
    if (!hasKey) { onNavigate?.('ai'); return; }
    setAiLoading(true);
    try { setAiRecipe(await getAIRecipe(aiIngredients, aiPrefs)); } catch { setAiRecipe(''); }
    setAiLoading(false);
  };

  return (
    <div className="px-4 pt-4 pb-20 space-y-4">
      {/* AI Recipe Generator */}
      <div className="card bg-gradient-to-r from-teal-50 to-green-50 border-teal-200">
        <h3 className="font-bold text-teal-700 mb-2">🤖 AI 智能食谱生成</h3>
        <div className="space-y-2">
          <input value={aiIngredients} onChange={e => setAiIngredients(e.target.value)}
            placeholder="有什么食材？（如：鸡胸肉、西兰花...）" className="input-field text-sm" />
          <input value={aiPrefs} onChange={e => setAiPrefs(e.target.value)}
            placeholder="偏好？（如：低脂、高蛋白、快手...）" className="input-field text-sm" />
          <button onClick={handleAIGenerate} disabled={aiLoading}
            className="w-full py-2 rounded-xl bg-teal-500 text-white font-medium text-sm hover:bg-teal-600 disabled:opacity-50">
            {aiLoading ? '✨ AI 创作中...' : '✨ AI 生成食谱'}
          </button>
        </div>
        {aiRecipe && <div className="mt-3 text-sm whitespace-pre-wrap bg-white rounded-xl p-3">{aiRecipe}</div>}
      </div>

      {/* Search + Filter */}
      <input type="text" placeholder="🔍 搜索食谱..." value={query} onChange={e => setQuery(e.target.value)} className="input-field" />
      <div className="flex gap-2 overflow-x-auto hide-scrollbar">
        {[{ k: 'all' as const, l: '全部', i: '🍳' }, { k: 'breakfast' as const, l: '早餐', i: '🌅' }, { k: 'lunch' as const, l: '午餐', i: '🌞' }, { k: 'dinner' as const, l: '晚餐', i: '🌙' }, { k: 'snack' as const, l: '加餐', i: '🍪' }]
          .map(f => (
            <button key={f.k} onClick={() => setFilter(f.k)}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium flex items-center gap-1 ${filter === f.k ? 'bg-primary-500 text-white' : 'bg-white border text-gray-500'}`}>
              {f.i} {f.l}
            </button>
          ))}
      </div>

      {/* Recipe cards */}
      <div className="grid gap-3">
        {filtered.map(r => (
          <button key={r.id} onClick={() => setSelected(r)}
            className="card text-left hover:shadow-md active:scale-[0.98] transition-all">
            <div className="flex justify-between"><h3 className="font-semibold">{r.name}</h3><span className="text-xs bg-primary-50 text-primary-600 px-2 py-0.5 rounded-full">{mealLabels[r.mealType]}</span></div>
            <p className="text-xs text-gray-400 mt-1 line-clamp-2">{r.description}</p>
            <div className="flex gap-3 text-xs text-gray-500 mt-2">
              <span>🔥 {r.calories} kcal</span><span>⏱ {r.prepTime}分钟</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${diffColors[r.difficulty]}`}>{r.difficulty}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Recipe Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-t-2xl w-full max-w-lg max-h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b flex justify-between shrink-0"><h3 className="font-bold">{selected.name}</h3><button onClick={() => setSelected(null)} className="text-gray-400 text-xl">✕</button></div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="grid grid-cols-4 gap-2 text-center">
                {[{ l: '千卡', v: selected.calories, c: 'text-green-600' }, { l: '蛋白质', v: `${selected.protein}g`, c: 'text-red-600' }, { l: '碳水', v: `${selected.carbs}g`, c: 'text-amber-600' }, { l: '脂肪', v: `${selected.fat}g`, c: 'text-blue-600' }]
                  .map(n => (<div key={n.l} className="bg-gray-50 rounded-xl py-2"><div className={`font-bold ${n.c}`}>{n.v}</div><div className="text-[10px] text-gray-400">{n.l}</div></div>))}
              </div>
              <div><h4 className="font-semibold mb-2">📋 食材</h4>
                <div className="bg-gray-50 rounded-xl p-3 space-y-1">{selected.ingredients.map((ing, i) => <div key={i} className="text-sm text-gray-600">· {ing}</div>)}</div>
              </div>
              <div><h4 className="font-semibold mb-2">👨‍🍳 做法</h4>
                <div className="space-y-3">{selected.steps.map((step, i) => <div key={i} className="flex gap-3"><span className="w-6 h-6 rounded-full bg-primary-500 text-white text-xs flex items-center justify-center shrink-0">{i + 1}</span><p className="text-sm text-gray-600">{step}</p></div>)}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
