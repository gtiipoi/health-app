import { useState } from 'react';
import { getVoiceSettings, saveVoiceSettings, clearVoiceSettings, recordAudio, cloneVoice, generateSpeech } from '../utils/voiceClone';

export default function VoiceCloneSetup() {
  const saved = getVoiceSettings();
  const [apiKey, setApiKey] = useState(saved?.apiKey || '');
  const [voiceId, setVoiceId] = useState(saved?.voiceId || '');
  const [status, setStatus] = useState('');
  const [step, setStep] = useState<'input' | 'record' | 'done'>('input');
  const [recording, setRecording] = useState(false);
  const [recorded, setRecorded] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [uploading, setUploading] = useState(false);
  const [playing, setPlaying] = useState(false);
  const hasDone = !!saved?.voiceId;

  const startRecord = async () => {
    setStatus('');
    setRecording(true);
    try {
      const blob = await recordAudio(30000);
      setAudioBlob(blob);
      setRecorded(true);
      setStatus('✅ 录制完成！点击"上传克隆"');
    } catch (e: any) { setStatus('❌ ' + e.message); }
    setRecording(false);
  };

  const doClone = async () => {
    if (!apiKey.trim() || !audioBlob) return;
    setUploading(true);
    setStatus('⏳ 正在上传到ElevenLabs并创建声音克隆...');
    try {
      const id = await cloneVoice(apiKey.trim(), '我的AI宠物', audioBlob);
      setVoiceId(id);
      saveVoiceSettings({ apiKey: apiKey.trim(), voiceId: id });
      setStatus(`✅ 克隆成功！Voice ID: ${id}`);
      setStep('done');
    } catch (e: any) { setStatus('❌ ' + e.message); }
    setUploading(false);
  };

  const testPlay = async () => {
    if (!apiKey.trim() || !voiceId.trim()) return;
    setPlaying(true);
    try {
      const data = await generateSpeech(apiKey.trim(), voiceId.trim(), '你好主人，这是你克隆出来的声音，你觉得像吗？');
      const blob = new Blob([data], { type: 'audio/mpeg' });
      const url = URL.createObjectURL(blob);
      const a = new Audio(url);
      a.onended = () => { setPlaying(false); URL.revokeObjectURL(url); };
      a.onerror = () => { setStatus('❌ 播放失败'); setPlaying(false); };
      a.play();
    } catch (e: any) { setStatus('❌ ' + e.message); setPlaying(false); }
  };

  const handleSave = () => {
    if (!apiKey.trim() || !voiceId.trim()) return;
    saveVoiceSettings({ apiKey: apiKey.trim(), voiceId: voiceId.trim() });
    setStatus('✅ 已保存！宠物现在会用你的声音说话');
  };

  return (
    <div className="px-4 pt-4 pb-20 space-y-4">
      <div className="card bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200 text-center py-4">
        <h2 className="text-lg font-bold text-purple-700">🎤 AI 声音克隆</h2>
        <p className="text-xs text-gray-500 mt-1">让宠物用你的声音说话</p>
        {hasDone && <p className="text-sm text-green-600 mt-2">✅ 已配置</p>}
      </div>

      {/* Step 1: Get API Key */}
      <div className="card">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-6 h-6 rounded-full bg-purple-500 text-white text-xs flex items-center justify-center font-bold">1</span>
          <h3 className="font-semibold text-gray-700">获取 ElevenLabs API 密钥</h3>
        </div>
        <p className="text-xs text-gray-500 mb-2">
          1. 打开 <a href="https://elevenlabs.io/app/sign-up" target="_blank" className="text-blue-500 underline font-medium">ElevenLabs 注册页</a><br/>
          2. 用 Google 账号登录（QQ邮箱可以注册Google账号）<br/>
          3. 注册后进入 <a href="https://elevenlabs.io/app/settings/api-keys" target="_blank" className="text-blue-500 underline">API Keys 页面</a><br/>
          4. 点击 "Create API Key" → 复制
        </p>
        <input type="password" value={apiKey} onChange={e => setApiKey(e.target.value)}
          placeholder="粘贴 ElevenLabs API Key" className="input-field text-sm" />
        {apiKey && <p className="text-[10px] text-green-500 mt-1">✅ 密钥已输入</p>}
      </div>

      {/* Step 2: Record */}
      <div className="card">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-6 h-6 rounded-full bg-purple-500 text-white text-xs flex items-center justify-center font-bold">2</span>
          <h3 className="font-semibold text-gray-700">录制你的声音</h3>
        </div>
        <p className="text-xs text-gray-500 mb-3">录30秒中文朗读，用正常语气说任意内容。安静环境下效果最好。</p>
        <div className="flex gap-2">
          <button onClick={startRecord} disabled={recording || !apiKey}
            className={`flex-1 py-3 rounded-xl font-bold text-white transition-all ${recording ? 'bg-red-500 animate-pulse' : 'bg-purple-500 hover:bg-purple-600'} disabled:opacity-50 disabled:bg-gray-300`}>
            {recording ? '🎤 录音中 30s...' : recorded ? '🔄 重新录制' : '🎤 开始录音 (30秒)'}
          </button>
          {recorded && (
            <button onClick={doClone} disabled={uploading}
              className={`flex-1 py-3 rounded-xl font-bold text-white transition-all ${uploading ? 'bg-gray-400' : 'bg-pink-500 hover:bg-pink-600'}`}>
              {uploading ? '⏳ 上传中...' : '📤 上传克隆'}
            </button>
          )}
        </div>
        {recorded && <p className="text-xs text-green-500 mt-2">✅ 录音就绪</p>}
        {uploading && <p className="text-xs text-blue-500 mt-2">⏳ 正在上传克隆，请等待30秒左右...</p>}
      </div>

      {/* Step 3: Test & Save */}
      <div className="card">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-6 h-6 rounded-full bg-purple-500 text-white text-xs flex items-center justify-center font-bold">3</span>
          <h3 className="font-semibold text-gray-700">测试并保存</h3>
        </div>
        <input value={voiceId} onChange={e => setVoiceId(e.target.value)}
          placeholder="Voice ID（克隆成功后自动填入）" className="input-field text-sm mb-3" />
        <div className="flex gap-2">
          <button onClick={testPlay} disabled={!voiceId || playing}
            className="flex-1 py-2.5 rounded-xl bg-pink-500 text-white font-bold disabled:opacity-50 disabled:bg-gray-300">
            {playing ? '🔊 播放中...' : '▶️ 试听'}
          </button>
          <button onClick={handleSave} disabled={!voiceId}
            className="flex-1 py-2.5 rounded-xl bg-purple-500 text-white font-bold disabled:opacity-50 disabled:bg-gray-300">
            💾 保存
          </button>
        </div>
        {hasDone && (
          <button onClick={() => { clearVoiceSettings(); setVoiceId(''); setStatus('已清除'); }}
            className="w-full mt-2 py-2 text-sm text-red-400 hover:text-red-600">清除声音设置</button>
        )}
      </div>

      {/* Status */}
      {status && (
        <div className={`card text-sm whitespace-pre-wrap font-medium ${
          status.startsWith('✅') ? 'bg-green-50 border-green-300 text-green-700' :
          status.startsWith('❌') ? 'bg-red-50 border-red-300 text-red-600' :
          status.startsWith('⏳') ? 'bg-blue-50 border-blue-300 text-blue-700' :
          'bg-gray-50 text-gray-600'}`}>
          {status}
        </div>
      )}
    </div>
  );
}
