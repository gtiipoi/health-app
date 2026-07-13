import { db } from '../db/database';
import { getAISettings } from './aiService';
import { PetMood } from './petDialog';

export interface PetThought {
  message: string;
  mood: PetMood;
}

// ====== Smart rule-based engine (immediate, no API call) ======
export async function petThink(): Promise<PetThought> {
  const profile = await db.userProfile.get(1);
  const today = new Date().toISOString().split('T')[0];
  const hour = new Date().getHours();
  const dayOfWeek = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][new Date().getDay()];

  if (!profile) {
    return { message: '欢迎来到轻享健康！请先完善你的个人资料，我才能更好地照顾你~', mood: 'welcoming' };
  }

  const name = profile.name || '主人';
  const age = new Date().getFullYear() - profile.birthYear;

  // Get today's data
  const todayFoods = await db.foodEntries.where('date').equals(today).toArray();
  const todayExercise = await db.exerciseEntries.where('date').equals(today).toArray();
  const todayWater = await db.getTodayWater(today);
  const weights = await db.weightEntries.orderBy('date').reverse().limit(14).toArray();
  const weekSummaries = await db.getWeekSummaries(today);

  const totalCal = todayFoods.reduce((s, f) => s + f.calories, 0);
  const totalExercise = todayExercise.reduce((s, e) => s + e.caloriesBurned, 0);
  const totalProtein = todayFoods.reduce((s, f) => s + f.protein, 0);
  const hasBreakfast = todayFoods.some(f => f.mealType === 'breakfast');
  const hasLunch = todayFoods.some(f => f.mealType === 'lunch');
  const hasDinner = todayFoods.some(f => f.mealType === 'dinner');
  const currentWeight = weights.length > 0 ? weights[0].weight : profile.goalWeight;
  const weightTrend = weights.length >= 2 ? weights[0].weight - weights[weights.length - 1].weight : 0;
  const weekAvgCal = weekSummaries.filter(d => d.totalCalories > 0).length > 0
    ? Math.round(weekSummaries.reduce((s, d) => s + d.totalCalories, 0) / weekSummaries.filter(d => d.totalCalories > 0).length) : 0;
  const remainingCal = profile.dailyCalorieTarget - totalCal;

  // --- Time-based priority checks ---

  // 1. Deep night
  if (hour >= 23 || hour < 5) {
    return { message: `${name}，凌晨${hour}点了！🌙 身体需要休息才能好好燃脂，快放下手机睡觉吧。明天我陪你继续加油~`, mood: 'sleepy' };
  }
  if (hour >= 22) {
    const msg = totalCal > 0
      ? `快11点了${name}，今天摄入${totalCal}kcal，该休息啦。睡前别看手机了🌙`
      : `${name}，夜深了~早点休息，熬夜会影响代谢的。晚安🌙`;
    return { message: msg, mood: 'sleepy' };
  }

  // 2. Early morning - breakfast check
  if (hour >= 6 && hour < 9) {
    if (!hasBreakfast) {
      return { message: `早安${name}！☀️ 新的一天~记得吃早餐，营养早餐能启动一天的代谢。推荐：牛奶+全麦面包+一个鸡蛋`, mood: 'reminding' };
    }
    return { message: `早上好${name}！☀️ 早餐已记录，今天也元气满满地开始吧！`, mood: 'happy' };
  }

  // 3. Late morning - lunch approaching
  if (hour >= 9 && hour < 11.5) {
    if (!hasBreakfast) {
      return { message: `${name}，快${hour}点了还没吃早餐？😟 不吃早餐代谢会变慢的！赶紧去吃点东西`, mood: 'worried' };
    }
    if (todayWater < 300) {
      return { message: `上午好${name}！💧 今天还没怎么喝水呢，先喝一杯温水吧~`, mood: 'reminding' };
    }
    return { message: `上午好${name}！☀️ 上午工作再忙也别忘了喝水，目标是每天2000ml哦~`, mood: 'happy' };
  }

  // 4. Lunch time
  if (hour >= 11.5 && hour < 14) {
    if (!hasLunch) {
      const suggestion = remainingCal > 600 ? '可以正常吃，主食+蛋白质+蔬菜' : remainingCal > 300 ? '吃个七分饱就刚好' : '今天已经吃了不少了，午餐控制一下';
      return { message: `午饭时间到！🍽️ ${suggestion}。上次蛋白质摄入偏低，今天记得多吃点肉蛋类`, mood: 'reminding' };
    }
    return { message: `午餐已记录~${name}下午继续加油！午饭后可以站15分钟再坐下`, mood: 'happy' };
  }

  // 5. Afternoon
  if (hour >= 14 && hour < 17) {
    const msgs: string[] = [];
    if (!todayExercise || todayExercise.length === 0) msgs.push('今天还没运动，下午是个好时机');
    if (todayWater < 800) msgs.push(`才喝了${todayWater}ml水，该补水了`);
    if (msgs.length === 0) {
      return { message: `下午好${name}！🌤️ 今天已经摄入${totalCal}kcal，还剩${remainingCal}kcal。节奏不错！`, mood: 'happy' };
    }
    return { message: `${name}，${msgs.join('；')}💪`, mood: 'reminding' };
  }

  // 6. Evening - dinner + exercise
  if (hour >= 17 && hour < 20) {
    if (!hasDinner && !hasLunch && totalCal < 300) {
      return { message: `${name}！你今天几乎还没吃东西！😟 这样不行的，身体会进入节能模式。赶紧吃一顿合理的晚餐！`, mood: 'worried' };
    }
    if (!hasDinner) {
      return { message: `晚饭时间~🥗 还剩${remainingCal}kcal预算，晚上吃清淡点，推荐蔬菜汤+清蒸鱼`, mood: 'reminding' };
    }
    if (!todayExercise || todayExercise.length === 0) {
      return { message: `${name}，晚上要不要来一组居家训练？💪 选个${profile.goal === 'lose' ? 'HIIT燃脂' : '全身力量'}？`, mood: 'cheering' };
    }
    return { message: `${name}晚上好！今天表现不错，已经消耗${totalExercise}kcal了。记得拉伸~`, mood: 'proud' };
  }

  // 7. Late evening
  if (hour >= 20 && hour < 22) {
    if (totalCal > profile.dailyCalorieTarget * 1.15) {
      return { message: `今天吃得多了点...${totalCal}kcal😅 不过没关系，明天控制一下就好，别自责！`, mood: 'worried' };
    }
    if (totalExercise > 300) {
      return { message: `太棒了${name}！🎉 今天消耗了${totalExercise}kcal，运动量很足！记得补充蛋白质和好好拉伸`, mood: 'proud' };
    }
    return { message: `${name}，今天还有${remainingCal > 0 ? remainingCal + 'kcal预算' : '已经超标了'}。${remainingCal > 0 ? '可以吃个健康宵夜' : '明天注意控制'}~`, mood: 'happy' };
  }

  // Default: data-driven summary
  if (totalCal === 0 && totalExercise === 0) {
    return { message: `${name}，今天还没开始记录呢~先记录早餐，开启健康的一天吧！🍽️`, mood: 'reminding' };
  }
  if (Math.abs(weightTrend) > 0.5) {
    const dir = weightTrend < 0 ? '下降' : '上升';
    const emoji = weightTrend < 0 ? '🎉' : '';
    return { message: `${emoji}${name}，最近7天体重${dir}了${Math.abs(weightTrend).toFixed(1)}kg！${weightTrend < 0 ? '趋势很好，继续保持！' : '不用太担心，我们调整一下'}`, mood: weightTrend < 0 ? 'proud' : 'worried' };
  }
  if (weekAvgCal > 0 && weekAvgCal < profile.dailyCalorieTarget * 0.7) {
    return { message: `${name}，这周平均才吃${weekAvgCal}kcal，有点太少了...多吃蛋白质，别让肌肉流失`, mood: 'worried' };
  }

  return { message: `${dayOfWeek}愉快${name}！💪 今日已摄入${totalCal}kcal${totalExercise > 0 ? '，消耗' + totalExercise + 'kcal' : ''}。继续保持！`, mood: 'happy' };
}

// ====== AI-enhanced thinking (optional, user triggered) ======
export async function petThinkAI(): Promise<PetThought> {
  const settings = await getAISettings();
  if (!settings) throw new Error('请先配置AI密钥');

  const ctx = await buildContext();
  const systemPrompt = `你是"小轻"，用户的AI健康宠物。基于数据生成一句1-2句话的问候。语气温暖像家人。JSON回复：{"message":"...","mood":"happy|worried|proud|cheering|reminding|sleepy"}`;

  const res = await fetch(settings.baseUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${settings.apiKey}` },
    body: JSON.stringify({ model: settings.model, messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: ctx }], temperature: 0.8, max_tokens: 150 }),
  });

  if (!res.ok) throw new Error('AI请求失败');
  const data = await res.json();
  const raw = data.choices?.[0]?.message?.content || '';
  const m = raw.match(/\{[\s\S]*\}/);
  if (m) {
    const p = JSON.parse(m[0]);
    return { message: p.message || '今天也要加油哦~', mood: p.mood || 'happy' };
  }
  throw new Error('AI响应解析失败');
}

async function buildContext(): Promise<string> {
  const profile = await db.userProfile.get(1);
  if (!profile) return '';
  const today = new Date().toISOString().split('T')[0];
  const foods = await db.foodEntries.where('date').equals(today).toArray();
  const ex = await db.exerciseEntries.where('date').equals(today).toArray();
  const water = await db.getTodayWater(today);
  const weights = await db.weightEntries.orderBy('date').reverse().limit(7).toArray();
  const totalCal = foods.reduce((s, f) => s + f.calories, 0);
  const totalEx = ex.reduce((s, e) => s + e.caloriesBurned, 0);
  const wt = weights[0]?.weight || profile.goalWeight;
  const trend = weights.length >= 2 ? (weights[0].weight - weights[weights.length - 1].weight).toFixed(1) : '0';
  return `${new Date().getHours()}点 | 摄入${totalCal}/${profile.dailyCalorieTarget}kcal | 运动${totalEx}kcal | 饮水${water}ml | 体重${wt}kg(趋势${trend}kg) | ${foods.length > 0 ? '已记录饮食' : '还没记饮食'}`;
}
