import { db } from '../db/database';

// Gather ALL user data into a rich context for AI prompts
export async function buildAIContext(): Promise<string> {
  const profile = await db.userProfile.get(1);
  if (!profile) return '';

  const age = new Date().getFullYear() - profile.birthYear;
  const today = new Date().toISOString().split('T')[0];

  // Get 7-day summaries
  const weekSummaries = await db.getWeekSummaries(today);

  // Get weight history (last 30 days)
  const weights = await db.weightEntries.orderBy('date').reverse().limit(30).toArray();
  const sortedWeights = [...weights].reverse();

  // Get today's food entries
  const todayFoods = await db.foodEntries.where('date').equals(today).toArray();

  // Get today's exercise
  const todayExercise = await db.exerciseEntries.where('date').equals(today).toArray();

  // Past 7 days food
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recentFoods = await db.foodEntries
    .where('date')
    .between(sevenDaysAgo.toISOString().split('T')[0], today)
    .toArray();

  // Past 7 days exercise
  const recentExercise = await db.exerciseEntries
    .where('date')
    .between(sevenDaysAgo.toISOString().split('T')[0], today)
    .toArray();

  const bmr = profile.gender === 'male'
    ? 10 * (sortedWeights[sortedWeights.length - 1]?.weight || profile.goalWeight) + 6.25 * profile.height - 5 * age + 5
    : 10 * (sortedWeights[sortedWeights.length - 1]?.weight || profile.goalWeight) + 6.25 * profile.height - 5 * age - 161;

  const activityMultipliers = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, very_active: 1.9 };
  const tdee = Math.round(bmr * activityMultipliers[profile.activityLevel]);

  const goalMap = { lose: '减脂（每日热量缺口约500kcal）', maintain: '维持体重', gain: '增肌（每日热量盈余约300kcal）' };

  // Calculate weekly averages
  const weekCalAvg = weekSummaries.length > 0
    ? Math.round(weekSummaries.reduce((s, d) => s + d.totalCalories, 0) / weekSummaries.filter(d => d.totalCalories > 0).length || 1)
    : 0;
  const weekProteinAvg = weekSummaries.length > 0
    ? Math.round(weekSummaries.reduce((s, d) => s + d.totalProtein, 0) / weekSummaries.filter(d => d.totalProtein > 0).length || 1)
    : 0;
  const weekExerciseAvg = weekSummaries.length > 0
    ? Math.round(weekSummaries.reduce((s, d) => s + d.exerciseCalories, 0) / weekSummaries.filter(d => d.exerciseCalories > 0).length || 1)
    : 0;

  // Weight trend
  const weightTrend = sortedWeights.length >= 2
    ? (sortedWeights[sortedWeights.length - 1].weight - sortedWeights[0].weight).toFixed(1)
    : '0';

  return `【用户数据】
性别：${profile.gender === 'male' ? '男' : '女'}
年龄：${age}岁
身高：${profile.height}cm
目标体重：${profile.goalWeight}kg
目标：${goalMap[profile.goal]}
基础代谢(BMR)：${Math.round(bmr)}千卡
每日总消耗(TDEE)：${tdee}千卡
每日目标摄入：${profile.dailyCalorieTarget}千卡

【体重数据】
当前体重：${sortedWeights[sortedWeights.length - 1]?.weight || '未知'}kg
30天体重变化：${weightTrend}kg
${sortedWeights.length > 0 ? '最近体重记录：' + sortedWeights.slice(-5).map(w => `${w.date}: ${w.weight}kg`).join(', ') : ''}

【本周饮食统计】
日均摄入：${weekCalAvg}千卡
日均蛋白质：${weekProteinAvg}g
日均运动消耗：${weekExerciseAvg}千卡
${
  weekSummaries.filter(d => d.totalCalories > 0).length > 0
    ? '每日详情：' + weekSummaries.filter(d => d.totalCalories > 0).map(d => `${d.date.slice(5)}: 摄入${d.totalCalories}/运动${d.exerciseCalories}/净${d.netCalories}`).join(', ')
    : ''
}

【今日饮食】
${todayFoods.length > 0
  ? todayFoods.map(f => `- ${f.mealType === 'breakfast' ? '早餐' : f.mealType === 'lunch' ? '午餐' : f.mealType === 'dinner' ? '晚餐' : '加餐'}: ${f.foodName} ${f.amount}g (${f.calories}kcal, 蛋白质${f.protein}g)`)
    .join('\n')
  : '今日暂无饮食记录'}
今日总摄入：${todayFoods.reduce((s, f) => s + f.calories, 0)}千卡

【今日运动】
${todayExercise.length > 0
  ? todayExercise.map(e => `- ${e.exerciseName}: ${e.duration}分钟 (${e.caloriesBurned}kcal)`)
    .join('\n')
  : '今日暂无运动记录'}
今日总消耗：${todayExercise.reduce((s, e) => s + e.caloriesBurned, 0)}千卡`;
}

// Build a concise context for quick AI calls
export async function buildQuickContext(): Promise<string> {
  const profile = await db.userProfile.get(1);
  if (!profile) return '';

  const age = new Date().getFullYear() - profile.birthYear;
  const today = new Date().toISOString().split('T')[0];

  const weights = await db.weightEntries.orderBy('date').reverse().limit(7).toArray();
  const todayFoods = await db.foodEntries.where('date').equals(today).toArray();
  const todayExercise = await db.exerciseEntries.where('date').equals(today).toArray();

  const todayCal = todayFoods.reduce((s, f) => s + f.calories, 0);
  const todayExerciseCal = todayExercise.reduce((s, e) => s + e.caloriesBurned, 0);
  const currentWeight = weights.length > 0 ? weights[0].weight : profile.goalWeight;
  const goalMap = { lose: '减脂', maintain: '维持', gain: '增肌' };

  return `用户：${profile.gender === 'male' ? '男' : '女'} ${age}岁 ${profile.height}cm ${currentWeight}kg
目标：${goalMap[profile.goal]}至${profile.goalWeight}kg，每日${profile.dailyCalorieTarget}千卡
今日：摄入${todayCal}kcal 运动${todayExerciseCal}kcal`;
}
