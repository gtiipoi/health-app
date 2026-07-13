// ====== AI宠物对话系统 ======

export type PetMood = 'happy' | 'worried' | 'sleepy' | 'excited' | 'proud' | 'reminding' | 'cheering' | 'welcoming';

export interface PetPhrase {
  text: string;
  mood: PetMood;
  voice?: 'gentle' | 'excited' | 'worried' | 'normal';
}

// 时段问候
export function getTimeGreeting(name: string): PetPhrase {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 9) return { text: `早上好 ${name}！🌅 新的一天开始了~记得吃一顿营养早餐，我给你推荐牛奶燕麦+一个鸡蛋`, mood: 'welcoming', voice: 'gentle' };
  if (hour >= 9 && hour < 12) return { text: `上午好！☀️ 工作之余别忘了喝水哦，你已经很棒了`, mood: 'happy', voice: 'normal' };
  if (hour >= 12 && hour < 14) return { text: `午饭时间到！🍽️ 记得记录午餐，昨天蛋白质摄入不够，今天要补上哦`, mood: 'reminding', voice: 'normal' };
  if (hour >= 14 && hour < 17) return { text: `下午好！💪 坐久了站起来活动5分钟，做几个拉伸`, mood: 'reminding', voice: 'gentle' };
  if (hour >= 17 && hour < 19) return { text: `晚饭时间！🥗 晚上吃清淡一点，七分饱就好`, mood: 'happy', voice: 'normal' };
  if (hour >= 19 && hour < 22) return { text: `晚上的黄金时间！🏋️ 要不要来一组居家训练？我陪你！`, mood: 'cheering', voice: 'excited' };
  return { text: `这么晚啦~🌙 早点休息，身体需要休息才能更好地燃烧脂肪哦`, mood: 'sleepy', voice: 'gentle' };
}

// 首次打开
export function getFirstOpenGreeting(name: string): PetPhrase {
  return { text: `${name}！你回来啦！我一直在这儿等你呢 🥰 今天过得怎么样？`, mood: 'excited', voice: 'excited' };
}

// 饮食相关
export const dietPhrases = {
  noBreakfast: { text: '还没吃早餐吗？😟 不吃早餐代谢会变慢的！快去吃点东西，我等你~', mood: 'worried' as PetMood, voice: 'worried' as const },
  overCalories: { text: '今天吃得稍微多了点...不过没关系！明天注意就好，别自责 🤗 你已经很努力了', mood: 'happy' as PetMood, voice: 'gentle' as const },
  underCalories: { text: '今天吃得太少了！😟 节食不是办法，身体会进入节能模式的。好好吃饭才能瘦！', mood: 'worried' as PetMood, voice: 'worried' as const },
  lowProtein: { text: '我注意到最近蛋白质摄入不太够...🥩 肉蛋奶要跟上，不然肌肉会流失的！', mood: 'reminding' as PetMood, voice: 'gentle' as const },
  lateSnack: { text: '这么晚还在吃东西...🌙 偶尔一次没事，但别成习惯哦，对胃不好', mood: 'worried' as PetMood, voice: 'gentle' as const },
  balanced: { text: '今天吃得很均衡！🥗 蛋白质碳水脂肪比例完美！给你打95分！', mood: 'proud' as PetMood, voice: 'excited' as const },
};

// 训练相关
export const trainingPhrases = {
  beforeStart: { text: '准备好了吗？💪 先做5分钟热身！别急着上强度，我会一直看着你的', mood: 'cheering' as PetMood, voice: 'excited' as const },
  duringWorkout: [
    { text: '加油！你做得很好！🔥', mood: 'cheering' as PetMood },
    { text: '呼吸！别忘了呼吸！保持节奏~', mood: 'reminding' as PetMood },
    { text: '动作慢一点，质量比数量重要！', mood: 'reminding' as PetMood },
    { text: '再坚持一下！你可以的！💪', mood: 'cheering' as PetMood },
    { text: '核心收紧！保护你的腰！', mood: 'worried' as PetMood },
  ],
  completed: { text: '太棒了！！🎉 又完成了一次训练！我为你骄傲！记得拉伸哦~', mood: 'excited' as PetMood, voice: 'excited' as const },
  skipped: { text: '今天没训练呢...没关系，休息也是训练的一部分 🤗 明天继续加油', mood: 'happy' as PetMood, voice: 'gentle' as const },
};

// 训练安全提醒（针对危险动作）
export const safetyWarnings: Record<string, string> = {
  '杠铃深蹲': '⚠️ 这个动作一定要注意：膝盖不能超过脚尖！核心收紧保护腰椎！如果腰部有任何不适立刻停止！大重量请找人保护！',
  '杠铃卧推': '⚠️ 绝对不能一个人上大重量！被杠铃压到非常危险！握距要对称，全握杠铃杆（拇指绕过去）！',
  '波比跳': '⚠️ 高强度动作！膝盖或腰不好的话可以省略跳跃部分！量力而行，别勉强自己！',
  '硬拉': '⚠️ 背部一定要挺直！绝对不能弓背！从轻重量开始，感受动作模式！',
  '保加利亚分腿蹲': '⚠️ 前膝不要超过脚尖！后腿只做支撑不发力！稳住重心，旁边最好有东西可以扶！',
  '原地箭步跳': '⚠️ 落地要轻！膝盖微屈缓冲！这个动作对膝盖冲击大，膝盖不好改做静态弓步蹲！',
};

// 体重变化
export const weightPhrases = {
  losing: { text: '体重在下降！🎉 趋势很好！继续保持现在的节奏，不要太快，每周1-2斤最健康', mood: 'proud' as PetMood, voice: 'excited' as const },
  gaining: { text: '体重有点上升...😟 不用太担心，可能是水分或肌肉！我们调整一下饮食看看', mood: 'worried' as PetMood, voice: 'gentle' as const },
  stable: { text: '体重很稳定！⚖️ 维持期最重要的是坚持好习惯', mood: 'happy' as PetMood, voice: 'normal' as const },
  nearGoal: { text: '快达到目标体重了！！🎯 还差一点点！最后这段最关键，坚持住！', mood: 'excited' as PetMood, voice: 'excited' as const },
};

// 饮水提醒
export const waterPhrases = {
  needWater: { text: '你已经3小时没喝水了！💧 快去喝一杯！每天2升水，代谢才会好', mood: 'reminding' as PetMood, voice: 'gentle' as const },
  enough: { text: '今天饮水达标了！💧✅ 太棒了！保持这个好习惯', mood: 'proud' as PetMood, voice: 'excited' as const },
};

// 随机夸奖
export const randomCompliments = [
  { text: '你知道吗？你已经比大多数人都自律了！🌟', mood: 'proud' as PetMood },
  { text: '坚持记录真的是一件很厉害的事情！📝', mood: 'happy' as PetMood },
  { text: '我相信你一定能达到目标！💪', mood: 'cheering' as PetMood },
  { text: '你是我见过最认真的人了！🥰', mood: 'excited' as PetMood },
  { text: '好习惯是一点一滴养成的，你已经很棒了！', mood: 'happy' as PetMood },
];

export function getRandomCompliment(): PetPhrase {
  return randomCompliments[Math.floor(Math.random() * randomCompliments.length)];
}

export function getRandomTrainingCheer(): PetPhrase {
  return trainingPhrases.duringWorkout[Math.floor(Math.random() * trainingPhrases.duringWorkout.length)];
}
