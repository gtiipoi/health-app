import { db } from '../db/database';

// AI Provider types
export type AIProvider = 'gemini' | 'openai' | 'custom';

export interface AISettings {
  provider: AIProvider;
  apiKey: string;
  model: string;
  baseUrl: string;
}

const DEFAULT_SETTINGS: Record<AIProvider, Omit<AISettings, 'apiKey'>> = {
  gemini: {
    provider: 'gemini',
    model: 'gemini-2.0-flash',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta/models',
  },
  openai: {
    provider: 'openai',
    model: 'gpt-4o-mini',
    baseUrl: 'https://api.openai.com/v1/chat/completions',
  },
  custom: {
    provider: 'custom',
    model: '',
    baseUrl: '',
  },
};

export async function getAISettings(): Promise<AISettings | null> {
  try {
    const key = localStorage.getItem('ai_api_key');
    const provider = (localStorage.getItem('ai_provider') || 'gemini') as AIProvider;
    const model = localStorage.getItem('ai_model') || '';
    const baseUrl = localStorage.getItem('ai_base_url') || '';

    if (!key) return null;

    return {
      provider,
      apiKey: key,
      model: model || DEFAULT_SETTINGS[provider].model,
      baseUrl: baseUrl || DEFAULT_SETTINGS[provider].baseUrl,
    };
  } catch {
    return null;
  }
}

export async function saveAISettings(settings: AISettings): Promise<void> {
  localStorage.setItem('ai_api_key', settings.apiKey);
  localStorage.setItem('ai_provider', settings.provider);
  localStorage.setItem('ai_model', settings.model);
  localStorage.setItem('ai_base_url', settings.baseUrl);
}

export async function clearAISettings(): Promise<void> {
  localStorage.removeItem('ai_api_key');
  localStorage.removeItem('ai_provider');
  localStorage.removeItem('ai_model');
  localStorage.removeItem('ai_base_url');
}

// Build system prompt for health coach
function buildSystemPrompt(userProfile?: any): string {
  let prompt = `你是一个专业的AI健康营养助手，名叫"轻享健康助手"。你的职责是：

1. 提供科学、准确的营养和健康建议
2. 帮助用户分析饮食、估算热量
3. 提供个性化的运动和饮食建议
4. 回答关于减脂、增肌、健康饮食的问题

重要规则：
- 只回答与健康、营养、运动、饮食相关的问题
- 如果用户问无关话题，礼貌地引导回健康话题
- 回答简洁实用，少说废话
- 热量估算尽量准确，基于中国常见食物
- 给出具体可操作的建议，不要只说"多运动"这种空话
- 使用中文回复`;

  if (userProfile) {
    prompt += `\n\n当前用户信息：
- 性别：${userProfile.gender === 'male' ? '男' : '女'}
- 年龄：${new Date().getFullYear() - userProfile.birthYear}岁
- 身高：${userProfile.height}cm
- 目标体重：${userProfile.goalWeight}kg
- 目标：${userProfile.goal === 'lose' ? '减脂' : userProfile.goal === 'gain' ? '增肌' : '维持体重'}
- 每日推荐热量：${userProfile.dailyCalorieTarget}千卡`;
  }

  return prompt;
}

// Chat with AI
export async function chatWithAI(
  message: string,
  history: { role: 'user' | 'assistant'; content: string }[],
  userProfile?: any
): Promise<string> {
  const settings = await getAISettings();
  if (!settings) {
    throw new Error('请先配置AI API密钥');
  }

  const systemPrompt = buildSystemPrompt(userProfile);

  const messages = [
    { role: 'system', content: systemPrompt },
    ...history.slice(-10).map((m) => ({
      role: m.role,
      content: m.content,
    })),
    { role: 'user', content: message },
  ];

  if (settings.provider === 'gemini') {
    return callGemini(settings, messages);
  } else {
    return callOpenAI(settings, messages);
  }
}

async function callGemini(
  settings: AISettings,
  messages: { role: string; content: string }[]
): Promise<string> {
  const url = `${settings.baseUrl}/${settings.model}:generateContent?key=${settings.apiKey}`;

  // Convert OpenAI format to Gemini format
  const systemMsg = messages.find((m) => m.role === 'system');
  const chatMessages = messages.filter((m) => m.role !== 'system');

  const contents = chatMessages.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  const body: any = { contents };
  if (systemMsg) {
    body.systemInstruction = { parts: [{ text: systemMsg.content }] };
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini API错误: ${res.status} ${err}`);
  }

  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '抱歉，我无法回答这个问题。';
}

async function callOpenAI(
  settings: AISettings,
  messages: { role: string; content: string }[]
): Promise<string> {
  const res = await fetch(settings.baseUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${settings.apiKey}`,
    },
    body: JSON.stringify({
      model: settings.model,
      messages,
      temperature: 0.7,
      max_tokens: 1000,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`API错误: ${res.status} ${err}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || '抱歉，我无法回答这个问题。';
}

// AI Meal Analyzer - analyze food description and return nutrition estimate
export async function analyzeMeal(description: string): Promise<{
  foodName: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  analysis: string;
} | null> {
  const settings = await getAISettings();
  if (!settings) return null;

  const prompt = `分析以下食物描述，估算营养成分。请以JSON格式返回（只返回JSON，不要其他文字）：

{
  "foodName": "食物名称",
  "calories": 估算热量(kcal),
  "protein": 蛋白质克数,
  "carbs": 碳水克数,
  "fat": 脂肪克数,
  "analysis": "简短的分析建议（一句话）"
}

食物描述：${description}

注意：
- 根据中国常见食物的营养成分估算
- 如果用户说了份量（如"一碗"、"两个"），请根据份量估算
- 默认按一人份估算`;

  try {
    const result = await chatWithAI(prompt, [], undefined);
    // Extract JSON from response
    const jsonMatch = result.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return null;
  } catch {
    return null;
  }
}

// Smart recipe recommendations based on user preferences
export async function getAIRecipeRecommendations(
  preferences: string,
  calorieTarget: number
): Promise<string> {
  const prompt = `根据以下条件，推荐3道健康食谱：

- 偏好/限制：${preferences || '无特殊偏好'}
- 目标热量：每餐约${Math.round(calorieTarget / 3)}千卡

请为每道食谱提供：
1. 菜名
2. 热量估算
3. 主要食材
4. 简短做法（2-3步）
5. 为什么适合用户

请用友好的语气回复，格式清晰。`;

  return chatWithAI(prompt, [], undefined);
}
