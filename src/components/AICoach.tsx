import { useState, useRef, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import { chatWithAI, getAIMealPlan, getAIExercisePlan, getAISettings, saveAISettings, clearAISettings, AIProvider } from '../utils/aiService';

interface Message { id: number; role: 'user' | 'assistant'; content: string; }

const QUICK = [
  { label: '📋 今日饮食计划', action: 'mealplan' },
  { label: '🏃 今日运动计划', action: 'exerciseplan' },
  { label: '📊 分析我的数据', action: 'analyze' },
  { label: '🍳 推荐食谱', action: 'recipe' },
  { label: '🔥 减脂建议', action: 'fatloss' },
  { label: '💪 增肌指导', action: 'muscle' },
];

export default function AICoach() {
  const [msgs, setMsgs] = useState<Message[]>([{
    id: 0, role: 'assistant',
    content: '👋 你好！我是你的 **AI 健康教练**。\n\n我了解你的全部健康数据，可以为你：\n\n📋 **生成个性化饮食计划**\n🏃 **定制运动训练方案**\n📊 **分析数据给出建议**\n🍳 **根据食材推荐食谱**\n💬 **回答健康营养问题**\n\n👇 点击下方快捷按钮或直接问我吧！',
  }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [provider, setProvider] = useState<AIProvider>('deepseek');
  const [hasKey, setHasKey] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const profile = useLiveQuery(() => db.userProfile.get(1));

  useEffect(() => { checkKey(); }, []);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs]);

  const checkKey = async () => {
    const s = await getAISettings();
    setHasKey(!!s);
    if (s) { setProvider(s.provider); setApiKey(s.apiKey); }
  };

  const addMsg = (role: 'user' | 'assistant', content: string) => {
    setMsgs(prev => [...prev, { id: Date.now(), role, content }]);
  };

  const handleSend = async (text?: string) => {
    const msg = text || input.trim();
    if (!msg || loading) return;
    if (!hasKey) { setShowSettings(true); return; }

    setInput(''); addMsg('user', msg);
    setLoading(true);
    try {
      const history = msgs.map(m => ({ role: m.role, content: m.content }));
      const reply = await chatWithAI(msg, history);
      addMsg('assistant', reply);
    } catch (e: any) { addMsg('assistant', `❌ ${e.message}`); }
    setLoading(false);
  };

  const handleQuick = async (action: string) => {
    if (!hasKey) { setShowSettings(true); return; }

    setLoading(true);
    try {
      if (action === 'mealplan') {
        addMsg('user', '请根据我的数据生成今日饮食计划');
        addMsg('assistant', await getAIMealPlan());
      } else if (action === 'exerciseplan') {
        addMsg('user', '请根据我的数据生成今日运动计划');
        addMsg('assistant', await getAIExercisePlan());
      } else if (action === 'analyze') {
        addMsg('user', '请全面分析我的健康数据');
        addMsg('assistant', await chatWithAI('请全面分析我的健康数据，包括饮食、体重、运动等方面，给出综合评价和改进建议', []));
      } else if (action === 'recipe') {
        addMsg('user', '根据我的情况推荐今日食谱');
        addMsg('assistant', await chatWithAI('根据我的数据和目标，推荐一日的食谱安排（早中晚+加餐），每餐给出具体菜名和热量', []));
      } else if (action === 'fatloss') {
        addMsg('user', '给我实用的减脂建议');
        addMsg('assistant', await chatWithAI('根据我目前的数据和进展，给我5条具体可执行的减脂建议', []));
      } else if (action === 'muscle') {
        addMsg('user', '给我增肌训练和饮食建议');
        addMsg('assistant', await chatWithAI('根据我的数据，给我增肌的训练计划和饮食建议', []));
      }
    } catch (e: any) { addMsg('assistant', `❌ ${e.message}`); }
    setLoading(false);
  };

  const handleSaveKey = async () => {
    if (!apiKey.trim()) return;
    await saveAISettings({ provider, apiKey: apiKey.trim(), model: '', baseUrl: '' });
    setHasKey(true); setShowSettings(false);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 bg-white border-b flex justify-between items-center">
        <div>
          <h2 className="font-bold">🤖 AI 健康教练</h2>
          <p className="text-[10px] text-gray-400">{hasKey ? `✅ ${provider === 'deepseek' ? 'DeepSeek' : provider} 已连接` : '⚠️ 未配置密钥'}</p>
        </div>
        <div className="flex gap-2">
          {hasKey && (
            <button onClick={async () => { await clearAISettings(); setHasKey(false); setApiKey(''); }}
              className="text-xs text-red-400 px-2 py-1">退出</button>
          )}
          <button onClick={() => setShowSettings(!showSettings)}
            className="text-xs bg-gray-100 px-3 py-1 rounded-full">{hasKey ? '⚙️' : '🔑 配置'}</button>
        </div>
      </div>

      {/* Settings */}
      {showSettings && (
        <div className="px-4 py-4 bg-amber-50 border-b space-y-3">
          <h3 className="font-semibold text-sm">🔑 配置 AI</h3>
          <div className="text-xs text-gray-500">
            获取密钥：{' '}
            <a href="https://platform.deepseek.com/api_keys" target="_blank" className="text-blue-500 underline">DeepSeek</a>
            {' '}|{' '}
            <a href="https://aistudio.google.com/apikey" target="_blank" className="text-blue-500 underline">Gemini</a>
          </div>
          <div className="flex gap-2">
            {[{ k: 'deepseek' as const, l: 'DeepSeek' }, { k: 'gemini' as const, l: 'Gemini' }, { k: 'openai' as const, l: 'OpenAI' }, { k: 'custom' as const, l: '自定义' }]
              .map(p => (
                <button key={p.k} onClick={() => setProvider(p.k)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium ${provider === p.k ? 'bg-primary-500 text-white' : 'bg-white text-gray-500'}`}>{p.l}</button>
              ))}
          </div>
          <input type="password" value={apiKey} onChange={e => setApiKey(e.target.value)} placeholder="粘贴 API 密钥..." className="input-field text-sm" />
          <button onClick={handleSaveKey} disabled={!apiKey.trim()} className="btn-primary text-sm w-full">保存</button>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 hide-scrollbar">
        {msgs.map(m => (
          <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap ${
              m.role === 'user' ? 'bg-primary-500 text-white rounded-br-lg' : 'bg-white border shadow-sm rounded-bl-lg'}`}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border shadow-sm rounded-2xl rounded-bl-lg px-4 py-3">
              <div className="flex gap-1.5">
                <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" />
                <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce [animation-delay:0.15s]" />
                <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce [animation-delay:0.3s]" />
              </div>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Quick actions */}
      <div className="px-3 py-2 flex gap-2 overflow-x-auto hide-scrollbar border-t bg-white">
        {QUICK.map(q => (
          <button key={q.action} onClick={() => handleQuick(q.action)} disabled={loading}
            className="shrink-0 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-xs transition-colors disabled:opacity-50">
            {q.label}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="px-4 py-3 bg-white border-t safe-bottom">
        <div className="flex gap-2">
          <input value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder={hasKey ? '问我任何健康问题...' : '请先配置 API 密钥'}
            className="input-field flex-1 text-sm" disabled={loading} />
          <button onClick={() => handleSend()} disabled={loading || !input.trim()}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-primary-500 text-white disabled:opacity-50 disabled:bg-gray-300">➤</button>
        </div>
      </div>
    </div>
  );
}
