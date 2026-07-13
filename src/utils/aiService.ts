import { buildAIContext, buildQuickContext } from './aiContext';

export type AIProvider = 'deepseek' | 'gemini' | 'openai' | 'custom';

export interface AISettings {
  provider: AIProvider;
  apiKey: string;
  model: string;
  baseUrl: string;
}

const DEFAULT_SETTINGS: Record<AIProvider, Omit<AISettings, 'apiKey'>> = {
  deepseek: { provider: 'deepseek', model: 'deepseek-chat', baseUrl: 'https://api.deepseek.com/v1/chat/completions' },
  gemini: { provider: 'gemini', model: 'gemini-2.0-flash', baseUrl: 'https://generativelanguage.googleapis.com/v1beta/models' },
  openai: { provider: 'openai', model: 'gpt-4o-mini', baseUrl: 'https://api.openai.com/v1/chat/completions' },
  custom: { provider: 'custom', model: '', baseUrl: '' },
};

export async function getAISettings(): Promise<AISettings | null> {
  try {
    const key = localStorage.getItem('ai_api_key');
    const provider = (localStorage.getItem('ai_provider') || 'deepseek') as AIProvider;
    if (!key) return null;
    return {
      provider,
      apiKey: key,
      model: localStorage.getItem('ai_model') || DEFAULT_SETTINGS[provider].model,
      baseUrl: localStorage.getItem('ai_base_url') || DEFAULT_SETTINGS[provider].baseUrl,
    };
  } catch { return null; }
}

export async function saveAISettings(s: AISettings): Promise<void> {
  localStorage.setItem('ai_api_key', s.apiKey);
  localStorage.setItem('ai_provider', s.provider);
  localStorage.setItem('ai_model', s.model);
  localStorage.setItem('ai_base_url', s.baseUrl);
}

export async function clearAISettings(): Promise<void> {
  localStorage.removeItem('ai_api_key');
  localStorage.removeItem('ai_provider');
  localStorage.removeItem('ai_model');
  localStorage.removeItem('ai_base_url');
}

// ====== Core AI call ======
export async function callAI(systemPrompt: string, userMessage: string): Promise<string> {
  const settings = await getAISettings();
  if (!settings) throw new Error('请先配置AI密钥');

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userMessage },
  ];

  if (settings.provider === 'gemini') {
    const url = `${settings.baseUrl}/${settings.model}:generateContent?key=${settings.apiKey}`;
    const body = {
      systemInstruction: { parts: [{ text: systemPrompt }] },
      contents: [{ role: 'user', parts: [{ text: userMessage }] }],
    };
    const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (!res.ok) throw new Error(`API错误: ${res.status}`);
    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '无回复';
  }

  // OpenAI-compatible (DeepSeek, OpenAI, custom)
  const res = await fetch(settings.baseUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${settings.apiKey}` },
    body: JSON.stringify({ model: settings.model, messages, temperature: 0.7, max_tokens: 1500 }),
  });
  if (!res.ok) { const err = await res.text(); throw new Error(`API错误 ${res.status}: ${err.slice(0, 200)}`); }
  const data = await res.json();
  return data.choices?.[0]?.message?.content || '无回复';
}

// ====== 1. AI 智能分析仪表盘 ======
export async function getAIDashboardInsight(): Promise<string> {
  const ctx = await buildAIContext();
  if (!ctx) return '请先完善个人资料';

  return callAI(
    `你是专业AI健康教练。基于用户数据给出3-5条今日洞察和建议。
要求：每条15-30字，用📊🔥💪🥗⚠️等emoji开头，语气鼓励，指出问题和改进方向。
格式：每条一行，不要编号不要标题。`,
    ctx
  );
}

// ====== 2. AI 饮食分析 ======
export async function analyzeMealWithAI(description: string): Promise<string> {
  const ctx = await buildQuickContext();
  return callAI(
    `你是营养师。分析用户描述的食物，给出营养评估和建议。
格式：
🔥 估算热量：XXX kcal
🥩 蛋白质：XXg | 🍚 碳水：XXg | 🧈 脂肪：XXg
💡 评价：一句话评价（热量高低、营养是否均衡等）
⚠️ 建议：一句改进建议`,
    `${ctx}\n\n用户吃了：${description}\n\n请分析以上食物。`
  );
}

// ====== 3. AI 每日饮食计划 ======
export async function getAIMealPlan(): Promise<string> {
  const ctx = await buildAIContext();
  if (!ctx) return '请先完善个人资料';
  return callAI(
    `你是营养师。基于用户数据生成今日饮食计划。
要求：为早中晚三餐+加餐分别推荐，每餐包含具体食物名称和热量。
格式用emoji和清晰的分隔。总热量要接近用户的每日目标。`,
    `${ctx}\n\n请为我生成今天的饮食计划。`
  );
}

// ====== 4. AI 运动计划 ======
export async function getAIExercisePlan(): Promise<string> {
  const ctx = await buildAIContext();
  if (!ctx) return '请先完善个人资料';
  return callAI(
    `你是健身教练。基于用户数据推荐今日运动计划。
包括：热身、主训练（具体动作+组数+时长）、有氧、拉伸。
根据用户目标调整（减脂偏有氧，增肌偏力量）。
格式用🏃💪🔥🧘等emoji，具体可执行。`,
    `${ctx}\n\n请为我生成今日运动计划。`
  );
}

// ====== 5. AI 食谱生成 ======
export async function getAIRecipe(ingredients: string, preferences: string): Promise<string> {
  const ctx = await buildQuickContext();
  return callAI(
    `你是健康厨师。根据用户的情况和偏好，推荐一道健康菜谱。
格式：
🍳 菜名
🔥 热量：约XXX kcal
📋 食材清单（含用量）
👨‍🍳 做法步骤（3-5步）
💡 营养点评（一句话）`,
    `${ctx}\n${ingredients ? `可用食材：${ingredients}` : ''}\n${preferences ? `偏好：${preferences}` : '推荐适合用户的菜谱'}\n请推荐菜谱。`
  );
}

// ====== 6. AI 体重分析 ======
export async function getAIWeightAnalysis(): Promise<string> {
  const ctx = await buildAIContext();
  if (!ctx) return '请先完善个人资料';
  return callAI(
    `你是健康分析师。基于用户体重数据分析趋势并给出建议。
包含：趋势判断（进展如何）、预测（按当前速度何时达标）、建议调整。
格式清晰，用📈📉等emoji，数据说话。`,
    `${ctx}\n\n请分析我的体重趋势。`
  );
}

// ====== 7. AI 自由对话 ======
export async function chatWithAI(message: string, history: { role: string; content: string }[]): Promise<string> {
  const ctx = await buildAIContext();
  const settings = await getAISettings();
  if (!settings) throw new Error('请先配置AI密钥');

  const systemPrompt = `你是"轻享AI健康助手"，一个专业、友好、懂中文的健康教练。

你有用户的完整健康数据（见下文）。基于数据给出个性化建议。

能力范围：
- 分析饮食、估算营养
- 制定饮食和运动计划
- 回答健康、营养、健身问题
- 解读体重趋势
- 推荐食谱
- 提供心理鼓励

规则：
- 用中文，语气亲切但不啰嗦
- 用emoji让回复生动
- 给出具体可操作的建议
- 数据说话，引用用户实际数据
- 不回答与健康无关的问题

${ctx}`;

  const messages: any[] = [
    { role: 'system', content: systemPrompt },
    ...history.slice(-10).map(m => ({ role: m.role, content: m.content })),
    { role: 'user', content: message },
  ];

  if (settings.provider === 'gemini') {
    const url = `${settings.baseUrl}/${settings.model}:generateContent?key=${settings.apiKey}`;
    const chatMsgs = messages.filter(m => m.role !== 'system');
    const body: any = { contents: chatMsgs.map(m => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] })) };
    body.systemInstruction = { parts: [{ text: systemPrompt }] };
    const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (!res.ok) throw new Error(`API错误: ${res.status}`);
    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '抱歉，请重试';
  }

  const res = await fetch(settings.baseUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${settings.apiKey}` },
    body: JSON.stringify({ model: settings.model, messages, temperature: 0.7, max_tokens: 1500 }),
  });
  if (!res.ok) { const err = await res.text(); throw new Error(`API错误 ${res.status}`); }
  const data = await res.json();
  return data.choices?.[0]?.message?.content || '抱歉，请重试';
}
