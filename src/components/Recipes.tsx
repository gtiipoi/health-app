import { useState, useMemo } from 'react';
import { recipes, searchRecipes, Recipe } from '../utils/recipes';

const mealTypeLabels: Record<string, string> = {
  breakfast: '早餐',
  lunch: '午餐',
  dinner: '晚餐',
  snack: '加餐',
};

const difficultyColors: Record<string, string> = {
  '简单': 'bg-green-100 text-green-600',
  '中等': 'bg-amber-100 text-amber-600',
  '困难': 'bg-red-100 text-red-600',
};

export default function Recipes() {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'breakfast' | 'lunch' | 'dinner' | 'snack'>('all');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  const filtered = useMemo(() => {
    let result = query.trim() ? searchRecipes(query) : recipes;
    if (filter !== 'all') {
      result = result.filter((r) => r.mealType === filter);
    }
    return result;
  }, [query, filter]);

  const filters = [
    { key: 'all' as const, label: '全部', icon: '🍳' },
    { key: 'breakfast' as const, label: '早餐', icon: '🌅' },
    { key: 'lunch' as const, label: '午餐', icon: '🌞' },
    { key: 'dinner' as const, label: '晚餐', icon: '🌙' },
    { key: 'snack' as const, label: '加餐', icon: '🍪' },
  ];

  return (
    <div className="px-4 pt-4 space-y-4">
      {/* Search */}
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
        <input
          type="text"
          placeholder="搜索食谱..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="input-field pl-11"
        />
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-1 ${
              filter === f.key
                ? 'bg-primary-500 text-white shadow-sm'
                : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50'
            }`}
          >
            {f.icon} {f.label}
          </button>
        ))}
      </div>

      {/* Recipe grid */}
      <div className="grid gap-3">
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <span className="text-4xl block mb-2">📖</span>
            <span className="text-sm">暂无匹配的食谱</span>
          </div>
        )}
        {filtered.map((recipe) => (
          <button
            key={recipe.id}
            onClick={() => setSelectedRecipe(recipe)}
            className="card text-left hover:shadow-md transition-all active:scale-[0.98]"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800">{recipe.name}</h3>
                <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{recipe.description}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {recipe.tags.map((tag) => (
                <span key={tag} className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                  {tag}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span>🔥 {recipe.calories} kcal</span>
              <span>⏱ {recipe.prepTime}分钟</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${difficultyColors[recipe.difficulty]}`}>
                {recipe.difficulty}
              </span>
              <span className="ml-auto text-[10px] bg-primary-50 text-primary-600 px-2 py-0.5 rounded-full">
                {mealTypeLabels[recipe.mealType]}
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Recipe detail modal */}
      {selectedRecipe && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-end justify-center"
          onClick={() => setSelectedRecipe(null)}
        >
          <div
            className="bg-white rounded-t-2xl w-full max-w-lg max-h-[85vh] flex flex-col animate-[slideUp_0.3s_ease-out]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-gray-100 flex items-center justify-between shrink-0">
              <h3 className="font-bold text-gray-800">{selectedRecipe.name}</h3>
              <button onClick={() => setSelectedRecipe(null)} className="text-gray-400 text-xl">✕</button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Nutrition */}
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="bg-green-50 rounded-xl py-2">
                  <div className="font-bold text-green-600">{selectedRecipe.calories}</div>
                  <div className="text-[10px] text-gray-400">千卡</div>
                </div>
                <div className="bg-red-50 rounded-xl py-2">
                  <div className="font-bold text-red-600">{selectedRecipe.protein}g</div>
                  <div className="text-[10px] text-gray-400">蛋白质</div>
                </div>
                <div className="bg-amber-50 rounded-xl py-2">
                  <div className="font-bold text-amber-600">{selectedRecipe.carbs}g</div>
                  <div className="text-[10px] text-gray-400">碳水</div>
                </div>
                <div className="bg-blue-50 rounded-xl py-2">
                  <div className="font-bold text-blue-600">{selectedRecipe.fat}g</div>
                  <div className="text-[10px] text-gray-400">脂肪</div>
                </div>
              </div>

              <div className="flex gap-3 text-sm text-gray-500">
                <span>⏱ {selectedRecipe.prepTime} 分钟</span>
                <span className={difficultyColors[selectedRecipe.difficulty] + ' px-2 py-0.5 rounded-full text-xs'}>
                  {selectedRecipe.difficulty}
                </span>
                <span>{mealTypeLabels[selectedRecipe.mealType]}</span>
              </div>

              {/* Ingredients */}
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">📋 食材</h4>
                <div className="bg-gray-50 rounded-xl p-3 space-y-1.5">
                  {selectedRecipe.ingredients.map((ingredient, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary-400 shrink-0" />
                      {ingredient}
                    </div>
                  ))}
                </div>
              </div>

              {/* Steps */}
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">👨‍🍳 做法</h4>
                <div className="space-y-3">
                  {selectedRecipe.steps.map((step, idx) => (
                    <div key={idx} className="flex gap-3">
                      <span className="w-6 h-6 rounded-full bg-primary-500 text-white text-xs flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <p className="text-sm text-gray-600">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
