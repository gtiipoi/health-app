import { useState, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, FoodEntry } from '../db/database';
import { foodDatabase, searchFood, calculateCalories, FoodItem } from '../utils/foodData';

interface FoodDiaryProps {
  onNavigate: (page: any) => void;
}

function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

const mealTypes = [
  { key: 'breakfast', label: '早餐', icon: '🌅' },
  { key: 'lunch', label: '午餐', icon: '🌞' },
  { key: 'dinner', label: '晚餐', icon: '🌙' },
  { key: 'snack', label: '加餐', icon: '🍪' },
] as const;

export default function FoodDiary({ onNavigate }: FoodDiaryProps) {
  const [selectedDate, setSelectedDate] = useState(getToday());
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState<FoodEntry['mealType']>('breakfast');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [amount, setAmount] = useState(100);
  const [activeTab, setActiveTab] = useState<FoodEntry['mealType']>('breakfast');

  const entries = useLiveQuery(() => db.foodEntries.where('date').equals(selectedDate).toArray(), [selectedDate]);
  const summary = useLiveQuery(() => db.getDailySummary(selectedDate), [selectedDate]);

  const searchResults = useMemo(() => {
    if (searchQuery.trim().length < 1) return foodDatabase.slice(0, 20);
    return searchFood(searchQuery).slice(0, 20);
  }, [searchQuery]);

  const mealCalories = useMemo(() => {
    const result: Record<string, number> = { breakfast: 0, lunch: 0, dinner: 0, snack: 0 };
    entries?.forEach((e) => {
      result[e.mealType] = (result[e.mealType] || 0) + e.calories;
    });
    return result;
  }, [entries]);

  const todayEntries = useMemo(() => {
    if (!entries) return [];
    return entries.filter((e) => e.mealType === activeTab);
  }, [entries, activeTab]);

  const handleAddFood = async () => {
    if (!selectedFood) return;
    const calories = calculateCalories(selectedFood, amount);
    const ratio = amount / 100;

    await db.foodEntries.add({
      date: selectedDate,
      mealType: selectedMealType,
      foodName: selectedFood.name,
      amount,
      calories,
      protein: Math.round(selectedFood.protein * ratio * 10) / 10,
      carbs: Math.round(selectedFood.carbs * ratio * 10) / 10,
      fat: Math.round(selectedFood.fat * ratio * 10) / 10,
      fiber: selectedFood.fiber ? Math.round(selectedFood.fiber * ratio * 10) / 10 : undefined,
      createdAt: new Date().toISOString(),
    });

    setShowAddModal(false);
    setSearchQuery('');
    setSelectedFood(null);
    setAmount(100);
  };

  const handleDeleteEntry = async (id: number) => {
    await db.foodEntries.delete(id);
  };

  const navigateDate = (dir: -1 | 1) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + dir);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const openAdd = (mealType: FoodEntry['mealType']) => {
    setSelectedMealType(mealType);
    setShowAddModal(true);
  };

  return (
    <div className="px-4 pt-4 space-y-4">
      {/* Date selector */}
      <div className="flex items-center justify-between bg-white rounded-xl px-4 py-3 border border-gray-100">
        <button onClick={() => navigateDate(-1)} className="text-gray-400 hover:text-gray-600 text-lg px-2">
          ◀
        </button>
        <span className="font-semibold text-gray-700">
          {selectedDate === getToday() ? '今天' : selectedDate}
        </span>
        <button
          onClick={() => navigateDate(1)}
          className={`text-lg px-2 ${selectedDate >= getToday() ? 'text-gray-200' : 'text-gray-400 hover:text-gray-600'}`}
          disabled={selectedDate >= getToday()}
        >
          ▶
        </button>
      </div>

      {/* Day summary */}
      {summary && (
        <div className="card flex justify-around text-center py-3">
          <div>
            <div className="text-lg font-bold text-gray-800">{summary.totalCalories}</div>
            <div className="text-[10px] text-gray-400">摄入 kcal</div>
          </div>
          <div className="w-px bg-gray-100" />
          <div>
            <div className="text-lg font-bold text-green-600">{summary.exerciseCalories}</div>
            <div className="text-[10px] text-gray-400">运动 kcal</div>
          </div>
          <div className="w-px bg-gray-100" />
          <div>
            <div className="text-lg font-bold text-blue-600">{summary.netCalories}</div>
            <div className="text-[10px] text-gray-400">净摄入</div>
          </div>
        </div>
      )}

      {/* Meal tabs */}
      <div className="flex border-b border-gray-100">
        {mealTypes.map((meal) => (
          <button
            key={meal.key}
            onClick={() => setActiveTab(meal.key)}
            className={`flex-1 py-3 text-center text-sm font-medium transition-all ${
              activeTab === meal.key ? 'tab-active' : 'tab-inactive'
            }`}
          >
            {meal.icon} {meal.label}
            <span className="ml-1 text-xs text-gray-400">({mealCalories[meal.key] || 0})</span>
          </button>
        ))}
      </div>

      {/* Entries */}
      <div className="space-y-2">
        {todayEntries.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            <div className="text-3xl mb-2">🍽️</div>
            <p className="text-sm">还没有记录，点击下方按钮添加</p>
          </div>
        )}
        {todayEntries.map((entry) => (
          <div key={entry.id} className="card flex items-center justify-between group">
            <div className="flex-1">
              <div className="font-medium text-gray-800 text-sm">{entry.foodName}</div>
              <div className="text-xs text-gray-400 mt-0.5">
                {entry.amount}g · 蛋白质{entry.protein}g · 碳水{entry.carbs}g · 脂肪{entry.fat}g
              </div>
            </div>
            <div className="text-right mr-3">
              <div className="font-bold text-gray-700">{entry.calories}</div>
              <div className="text-[10px] text-gray-400">kcal</div>
            </div>
            <button
              onClick={() => entry.id && handleDeleteEntry(entry.id)}
              className="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 text-lg"
            >
              🗑️
            </button>
          </div>
        ))}
      </div>

      {/* Add buttons */}
      <div className="grid grid-cols-2 gap-3">
        {mealTypes.map((meal) => (
          <button
            key={meal.key}
            onClick={() => openAdd(meal.key)}
            className="btn-outline text-sm flex items-center justify-center gap-2"
          >
            {meal.icon} 添加{meal.label}
          </button>
        ))}
      </div>

      {/* Add food modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end justify-center" onClick={() => setShowAddModal(false)}>
          <div
            className="bg-white rounded-t-2xl w-full max-w-lg max-h-[80vh] flex flex-col animate-[slideUp_0.3s_ease-out]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-gray-800">
                添加{mealTypes.find((m) => m.key === selectedMealType)?.icon} {mealTypes.find((m) => m.key === selectedMealType)?.label}
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 text-xl">✕</button>
            </div>

            <div className="p-4 border-b border-gray-100">
              <input
                type="text"
                placeholder="搜索食物..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field"
                autoFocus
              />
            </div>

            {selectedFood && (
              <div className="p-4 bg-green-50 border-b border-green-100 flex items-center gap-3">
                <div className="flex-1">
                  <div className="font-semibold text-green-800">{selectedFood.name}</div>
                  <div className="text-xs text-green-600">{selectedFood.calories} kcal/100g</div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-20 input-field text-center"
                    min={1}
                    max={2000}
                  />
                  <span className="text-sm text-gray-500">g</span>
                </div>
                <div className="font-bold text-green-700">
                  {calculateCalories(selectedFood, amount)} kcal
                </div>
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-2">
              {searchResults.map((food) => (
                <button
                  key={food.name}
                  onClick={() => setSelectedFood(food)}
                  className={`w-full text-left p-3 rounded-xl flex items-center justify-between transition-colors ${
                    selectedFood?.name === food.name ? 'bg-primary-50 border border-primary-200' : 'hover:bg-gray-50'
                  }`}
                >
                  <div>
                    <div className="font-medium text-gray-800 text-sm">{food.name}</div>
                    <div className="text-xs text-gray-400">
                      {food.calories} kcal/100g · 蛋白{food.protein}g · 碳水{food.carbs}g · 脂肪{food.fat}g
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">选择 ›</span>
                </button>
              ))}
            </div>

            <div className="p-4 border-t border-gray-100">
              <button
                onClick={handleAddFood}
                disabled={!selectedFood}
                className={`w-full py-3 rounded-xl font-semibold text-white transition-all ${
                  selectedFood ? 'bg-primary-500 hover:bg-primary-600 active:bg-primary-700' : 'bg-gray-300 cursor-not-allowed'
                }`}
              >
                确认添加
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
