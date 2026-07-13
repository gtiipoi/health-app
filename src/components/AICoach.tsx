import { useState, useRef, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import {
  chatWithAI,
  analyzeMeal,
  getAIRecipeRecommendations,
  getAISettings,
  saveAISettings,
  clearAISettings,
  AISettings,
  AIProvider,
} from '../utils/aiService';

interface Message {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

const QUICK_ACTIONS = [
  { label: '🍽️ 分析饮食', prompt: '请帮我分析一下我今天的饮食情况，给出改进建议' },
  { label: '📋 推荐食谱', prompt: '请根据我的情况推荐今天的晚餐食谱' },
  { label: '🔥 减脂建议', prompt: '给我一些实用的减脂建议，要具体可执行' },
  { label: '💪 运动计划', prompt: '给我推荐一个适合新手的运动计划' },
];

export default function AICoach() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 0,
      role: 'assistant',
      content: '你好！我是你的AI健康助手 🏥\n\n我可以帮你：\n• 分析饮食并给出营养建议\n• 推荐个性化健康食谱\n• 提供减脂/增肌指导\n• 回答健康相关的问题\n\n请先配置API密钥，或直接开始提问！',
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [provider, setProvider] = useState<AIProvider>('gemini');
  const [hasKey, setHasKey] = useState(false);

  const profile = useLiveQuery(() => db.userProfile.get(1));
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    checkAPIKey();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const checkAPIKey = async () => {
    const settings = await getAISettings();
    setHasKey(!!settings);
    if (settings) {
      setProvider(settings.provider);
      setApiKey(settings.apiKey);
    }
  };

  const handleSaveSettings = async () => {
    if (!apiKey.trim()) return;
    await saveAISettings({
      provider,
      apiKey: apiKey.trim(),
      model: '',
      baseUrl: '',
    });
    setHasKey(true);
    setShowSettings(false);
    addMessage('assistant', '✅ API密钥已保存！我现在可以为你提供AI健康服务了。试试问我一些问题吧！');
  };

  const handleClearKey = async () => {
    await clearAISettings();
    setHasKey(false);
    setApiKey('');
    addMessage('assistant', 'API密钥已清除。你可以重新配置。');
  };

  const addMessage = (role: 'user' | 'assistant', content: string) => {
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), role, content, timestamp: Date.now() },
    ]);
  };

  const handleSend = async (text?: string) => {
    const msg = text || input.trim();
    if (!msg || loading) return;

    if (!hasKey) {
      setShowSettings(true);
      return;
    }

    setInput('');
    addMessage('user', msg);

    const history = messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    setLoading(true);
    try {
      const reply = await chatWithAI(msg, history, profile);
      addMessage('assistant', reply);
    } catch (err: any) {
      addMessage('assistant', `❌ 出错了：${err.message || '未知错误'}\n\n请检查API密钥是否正确，或稍后重试。`);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = (prompt: string) => {
    handleSend(prompt);
  };

  const handleMealAnalysis = async () => {
    if (!hasKey) {
      setShowSettings(true);
      return;
    }
    const desc = prompt('请描述你吃了什么（例如：一碗米饭、一份红烧肉、一盘炒青菜）：');
    if (!desc) return;
    addMessage('user', `帮我分析这顿饭：${desc}`);
    setLoading(true);
    try {
      const result = await analyzeMeal(desc);
      if (result) {
        addMessage(
          'assistant',
          `📊 **${result.foodName}** 的营养分析：\n\n` +
            `🔥 热量：约 ${result.calories} kcal\n` +
            `🥩 蛋白质：${result.protein}g\n` +
            `🍚 碳水：${result.carbs}g\n` +
            `🧈 脂肪：${result.fat}g\n\n` +
            `💡 ${result.analysis}`
        );
      } else {
        addMessage('assistant', '抱歉，分析失败，请重试。');
      }
    } catch (err: any) {
      addMessage('assistant', `❌ 分析失败：${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 bg-white border-b border-gray-100 flex items-center justify-between">
        <div>
          <h2 className="font-bold text-gray-800">🤖 AI健康助手</h2>
          <p className="text-[10px] text-gray-400">
            {hasKey ? '✅ AI已就绪' : '⚠️ 请配置API密钥'}
          </p>
        </div>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="text-gray-400 hover:text-gray-600 text-sm"
        >
          {hasKey ? '⚙️' : '🔑 配置'}
        </button>
      </div>

      {/* Settings panel */}
      {showSettings && (
        <div className="px-4 py-4 bg-amber-50 border-b border-amber-100 space-y-3">
          <h3 className="text-sm font-semibold text-gray-700">🔑 配置AI API密钥</h3>
          <p className="text-xs text-gray-500">
            免费获取API密钥：{' '}
            <a href="https://aistudio.google.com/apikey" target="_blank" className="text-blue-500 underline">
              Google AI Studio (Gemini免费)
            </a>
            {' '}或使用OpenAI兼容API
          </p>

          <div className="flex gap-2">
            {[
              { key: 'gemini' as const, label: 'Gemini (免费)' },
              { key: 'openai' as const, label: 'OpenAI' },
              { key: 'custom' as const, label: '自定义' },
            ].map((p) => (
              <button
                key={p.key}
                onClick={() => setProvider(p.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                  provider === p.key ? 'bg-primary-500 text-white' : 'bg-white text-gray-500'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="粘贴API密钥..."
            className="input-field text-sm"
          />

          <div className="flex gap-2">
            <button onClick={handleSaveSettings} className="btn-primary text-sm flex-1" disabled={!apiKey.trim()}>
              保存密钥
            </button>
            {hasKey && (
              <button onClick={handleClearKey} className="btn-outline text-sm text-red-500 border-red-300">
                清除
              </button>
            )}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 hide-scrollbar">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap ${
                msg.role === 'user'
                  ? 'bg-primary-500 text-white rounded-br-lg'
                  : 'bg-white border border-gray-100 shadow-sm rounded-bl-lg'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-100 shadow-sm rounded-2xl rounded-bl-lg px-4 py-3">
              <div className="flex gap-1.5">
                <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
                <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick actions */}
      <div className="px-4 py-2 flex gap-2 overflow-x-auto hide-scrollbar border-t border-gray-50">
        {QUICK_ACTIONS.map((action) => (
          <button
            key={action.label}
            onClick={() => handleQuickAction(action.prompt)}
            disabled={loading}
            className="shrink-0 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-xs text-gray-600 transition-colors disabled:opacity-50"
          >
            {action.label}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="px-4 py-3 bg-white border-t border-gray-100 safe-bottom">
        <div className="flex gap-2">
          <button
            onClick={handleMealAnalysis}
            disabled={loading}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-primary-50 text-primary-600 hover:bg-primary-100 transition-colors disabled:opacity-50"
            title="拍照分析食物"
          >
            📸
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={hasKey ? '问任何健康问题...' : '请先配置API密钥...'}
            className="input-field flex-1 text-sm"
            disabled={loading}
          />
          <button
            onClick={() => handleSend()}
            disabled={loading || !input.trim()}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-primary-500 text-white hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:bg-gray-300"
          >
            ➤
          </button>
        </div>
      </div>
    </div>
  );
}
