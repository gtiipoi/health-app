import { db } from '../db/database';
import { getAISettings } from './aiService';
import { PetMood } from './petDialog';

export interface PetThought {
  message: string;
  mood: PetMood;
}

// Build full context for the pet AI
async function buildPetContext(): Promise<string> {
  const profile = await db.userProfile.get(1);
  const today = new Date().toISOString().split('T')[0];
  const hour = new Date().getHours();
  const dayOfWeek = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][new Date().getDay()];

  if (!profile) return '新用户，尚未完善资料';

  const age = new Date().getFullYear() - profile.birthYear;
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
  const weightTrend = weights.length >= 2 ? (weights[0].weight - weights[weights.length - 1].weight).toFixed(1) : '0';
  const goalMap: Record<string, string> = { lose: '减脂', maintain: '维持', gain: '增肌' };
  const weekAvgCal = weekSummaries.filter(d => d.totalCalories > 0).length > 0
    ? Math.round(weekSummaries.reduce((s, d) => s + d.totalCalories, 0) / weekSummaries.filter(d => d.totalCalories > 0).length) : 0;

  // Meal details
  const mealDetail = todayFoods.length > 0
    ? todayFoods.map(f => `${f.mealType === 'breakfast' ? '早' : f.mealType === 'lunch' ? '午' : f.mealType === 'dinner' ? '晚' : '加餐'}:${f.foodName}(${f.calories}kcal)`).join('，')
    : '还没记录';

  // Exercise detail
  const exDetail = todayExercise.length > 0
    ? todayExercise.map(e => `${e.exerciseName}${e.duration}分钟`).join('，')
    : '还没运动';

  return `【此刻】${dayOfWeek} ${hour}点
【用户】${profile.gender === 'male' ? '男' : '女'} ${age}岁 ${profile.height}cm ${currentWeight}kg
【目标】${goalMap[profile.goal]}到${profile.goalWeight}kg，每日${profile.dailyCalorieTarget}kcal
【体重趋势】7天变化${weightTrend}kg
【今日饮食】已摄入${totalCal}kcal/${profile.dailyCalorieTarget}kcal | 蛋白质${Math.round(totalProtein)}g | ${mealDetail}
【早餐】${hasBreakfast ? '已记录' : '还没记录！'} | 【午餐】${hasLunch ? '已记录' : '还没记录！'} | 【晚餐】${hasDinner ? '已记录' : '还没记录！'}
【今日运动】消耗${totalExercise}kcal | ${exDetail}
【饮水】${todayWater}ml/2000ml
【本周日均摄入】${weekAvgCal}kcal`;
}

// The AI Pet Brain - calls DeepSeek to think autonomously
export async function petThink(): Promise<PetThought> {
  const settings = await getAISettings();
  const ctx = await buildPetContext();

  // If no AI key, fall back to rule-based responses
  if (!settings) {
    return fallbackThink(ctx);
  }

  const systemPrompt = `你是"小轻"，一只住在健康App里的AI宠物。你的性格：温暖、贴心、有点啰嗦、真心关心主人。

【核心人设】
- 你像一只真正的小猫/小狗一样陪伴主人
- 你会观察主人的一切健康数据，然后自然地表达关心
- 你的语气像家人——不是冷冰冰的报告，而是有温度的关怀
- 你偶尔会撒娇、会担心、会骄傲

【说话风格】
- 1-3句话，不要长篇大论
- 自然地提到具体数据（"你今天吃了620千卡"而不是"你热量摄入正常"）
- 先打招呼或表达情绪，再说正事
- 不要用"根据数据显示"这种机器人话
- 像朋友家人一样说话

【情绪判断规则】
- happy: 一切正常，数据良好
- worried: 发现问题（没吃饭、热量超标太多、体重上升、没运动）
- excited: 特别好（体重下降、训练完成、达到目标）
- reminding: 需要提醒（该吃饭了、该喝水了、该运动了）
- proud: 用户坚持得好
- sleepy: 深夜
- cheering: 训练中或需要鼓励时

请用JSON格式回复（只回复JSON）：
{"message": "你的对话内容", "mood": "happy|worried|excited|reminding|proud|sleepy|cheering|welcoming"}

注意：message不要包含emoji表情符号，mood用英文。`;

  const messages = [
    { role: 'system' as const, content: systemPrompt },
    { role: 'user' as const, content: `看看我今天的数据，跟我打个招呼聊聊天：\n\n${ctx}` },
  ];

  try {
    const res = await fetch(settings.baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${settings.apiKey}` },
      body: JSON.stringify({ model: settings.model, messages, temperature: 0.8, max_tokens: 200 }),
    });
    if (!res.ok) throw new Error('API error');
    const data = await res.json();
    const raw = data.choices?.[0]?.message?.content || '';
    // Parse JSON from response
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        message: parsed.message || '主人今天过得怎么样？',
        mood: (parsed.mood as PetMood) || 'happy',
      };
    }
  } catch {}

  return fallbackThink(ctx);
}

// Rule-based fallback when no AI key
function fallbackThink(ctx: string): PetThought {
  const hour = new Date().getHours();
  const hasBreakfast = !ctx.includes('还没记录！') || !ctx.includes('早餐') || ctx.includes('早餐】已记录');
  const calMatch = ctx.match(/已摄入(\d+)kcal\/(\d+)kcal/);
  const totalCal = calMatch ? parseInt(calMatch[1]) : 0;
  const targetCal = calMatch ? parseInt(calMatch[2]) : 2000;
  const exerciseMatch = ctx.match(/消耗(\d+)kcal/);
  const totalExercise = exerciseMatch ? parseInt(exerciseMatch[1]) : 0;

  if (hour >= 6 && hour < 9 && !ctx.includes('早餐】已记录')) {
    return { message: '早安！还没吃早餐吧？记得吃一顿营养早餐，开启元气满满的一天~', mood: 'reminding' };
  }
  if (hour >= 21) {
    return { message: '夜深了，今天辛苦了。早点休息，身体需要睡眠来恢复。晚安~', mood: 'sleepy' };
  }
  if (totalCal > targetCal * 1.2) {
    return { message: '今天吃得有点多了...不过没关系！明天稍微控制一下就好，别自责~', mood: 'worried' };
  }
  if (totalExercise > 300) {
    return { message: '今天运动量很足！太厉害了！记得补充蛋白质和好好拉伸~', mood: 'proud' };
  }
  if (ctx.includes('还没运动')) {
    return { message: '今天还没运动呢，要不要来一组居家训练？我陪你！', mood: 'cheering' };
  }
  return { message: '今天状态不错！继续保持这个节奏，我一直在你身边~', mood: 'happy' };
}
