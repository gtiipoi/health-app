import { useState, useMemo } from 'react';
import { foodDatabase, foodCategories, searchFood, FoodItem } from '../utils/foodData';

export default function FoodSearch() {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [amount, setAmount] = useState(100);

  const results = useMemo(() => {
    let items = query.trim() ? searchFood(query) : foodDatabase;
    if (selectedCategory !== 'all') {
      items = items.filter((f) => f.category === selectedCategory);
    }
    return items;
  }, [query, selectedCategory]);

  const categories = useMemo(() => {
    const cats = new Map<string, number>();
    foodDatabase.forEach((f) => {
      cats.set(f.category, (cats.get(f.category) || 0) + 1);
    });
    return Array.from(cats.entries());
  }, []);

  return (
    <div className="px-4 pt-4 space-y-4">
      {/* Search input */}
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
        <input
          type="text"
          placeholder="搜索食物名称..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="input-field pl-11"
        />
      </div>

      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
            selectedCategory === 'all' ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
          }`}
        >
          全部
        </button>
        {categories.map(([cat, count]) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
              selectedCategory === cat ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            {foodCategories[cat] || cat} ({count})
          </button>
        ))}
      </div>

      {/* Results */}
      <div className="space-y-2">
        {results.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            <span className="text-3xl">🤷</span>
            <p className="text-sm mt-2">未找到相关食物</p>
          </div>
        )}
        {results.map((food) => (
          <button
            key={food.name}
            onClick={() => setSelectedFood(food)}
            className="card w-full text-left hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-800">{food.name}</div>
                <div className="text-xs text-gray-400 mt-0.5">
                  {foodCategories[food.category] || food.category}
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-primary-600">{food.calories}</div>
                <div className="text-[10px] text-gray-400">kcal/100g</div>
              </div>
            </div>
            <div className="mt-2 flex gap-3 text-xs text-gray-500">
              <span className="bg-red-50 px-2 py-0.5 rounded">蛋白质 {food.protein}g</span>
              <span className="bg-amber-50 px-2 py-0.5 rounded">碳水 {food.carbs}g</span>
              <span className="bg-blue-50 px-2 py-0.5 rounded">脂肪 {food.fat}g</span>
              {food.fiber && <span className="bg-green-50 px-2 py-0.5 rounded">纤维 {food.fiber}g</span>}
            </div>
          </button>
        ))}
      </div>

      {/* Food detail modal */}
      {selectedFood && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end justify-center" onClick={() => setSelectedFood(null)}>
          <div
            className="bg-white rounded-t-2xl w-full max-w-lg p-6 animate-[slideUp_0.3s_ease-out]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">{selectedFood.name}</h3>
              <button onClick={() => setSelectedFood(null)} className="text-gray-400 text-xl">✕</button>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 mb-4">
              <div className="text-3xl font-bold text-primary-600 text-center">
                {selectedFood.calories}
                <span className="text-sm font-normal text-gray-400"> kcal/100g</span>
              </div>
              <div className="grid grid-cols-3 gap-3 mt-3 text-center">
                <div className="bg-red-50 rounded-lg py-2">
                  <div className="font-semibold text-red-600">{selectedFood.protein}g</div>
                  <div className="text-[10px] text-gray-400">蛋白质</div>
                </div>
                <div className="bg-amber-50 rounded-lg py-2">
                  <div className="font-semibold text-amber-600">{selectedFood.carbs}g</div>
                  <div className="text-[10px] text-gray-400">碳水化合物</div>
                </div>
                <div className="bg-blue-50 rounded-lg py-2">
                  <div className="font-semibold text-blue-600">{selectedFood.fat}g</div>
                  <div className="text-[10px] text-gray-400">脂肪</div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 mb-4">
              <span className="text-sm text-gray-500">计算摄入量：</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-24 input-field text-center"
                min={1}
              />
              <span className="text-sm text-gray-500">g</span>
            </div>

            <div className="bg-primary-50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-primary-600">
                {Math.round((selectedFood.calories * amount) / 100)} kcal
              </div>
              <div className="text-xs text-gray-500 mt-1">
                蛋白质 {Math.round((selectedFood.protein * amount) / 100)}g ·
                碳水 {Math.round((selectedFood.carbs * amount) / 100)}g ·
                脂肪 {Math.round((selectedFood.fat * amount) / 100)}g
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
