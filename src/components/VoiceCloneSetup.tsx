import { useState, useRef } from 'react';
import { getVoiceSettings, saveVoiceSettings, clearVoiceSettings, recordAudio, cloneVoice } from '../utils/voiceClone';

export default function VoiceCloneSetup() {
  const [apiKey, setApiKey] = useState(() => getVoiceSettings()?.apiKey || '');
  const [voiceId, setVoiceId] = useState(() => getVoiceSettings()?.voiceId || '');
  const [status, setStatus] = useState('');
  const [recording, setRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [voiceName, setVoiceName] = useState('我的声音');
  const [step, setStep] = useState(1);
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [hasCloned, setHasCloned] = useState(!!getVoiceSettings()?.voiceId);

  const handleSave = () => {
    if (!apiKey.trim()) { setStatus('请输入API密钥'); return; }
    if (!voiceId.trim()) { setStatus('请先克隆声音获取Voice ID'); return; }
    saveVoiceSettings({ apiKey: apiKey.trim(), voiceId: voiceId.trim() });
    setStatus('✅ 声音克隆已就绪！');
    setHasCloned(true);
  };

  const handleClear = () => {
    clearVoiceSettings();
    setVoiceId('');
    setHasCloned(false);
    setStatus('已清除声音设置');
  };

  const startRecording = async () => {
    setStatus('🎤 正在录音...请用正常语气朗读一段话（约60秒）');
    setRecording(true);
    try {
      const blob = await recordAudio(60000);
      setRecordedBlob(blob);
      setStatus('✅ 录音完成！点击"上传并克隆"');
    } catch (e: any) {
      setStatus(`❌ 录音失败：${e.message || '请允许麦克风权限'}`);
    }
    setRecording(false);
  };

  const handleClone = async () => {
    if (!apiKey.trim()) { setStatus('请先输入API密钥'); return; }
    if (!recordedBlob) { setStatus('请先录音'); return; }

    setStatus('🔄 正在上传录音并克隆声音...这可能需要30秒');
    try {
      const id = await cloneVoice(apiKey.trim(), voiceName, recordedBlob, '我的克隆声音');
      setVoiceId(id);
      saveVoiceSettings({ apiKey: apiKey.trim(), voiceId: id });
      setHasCloned(true);
      setStatus(`✅ 声音克隆成功！Voice ID: ${id}`);
      setStep(3);
    } catch (e: any) {
      setStatus(`❌ ${e.message}`);
    }
  };

  const testVoice = async () => {
    if (!apiKey.trim() || !voiceId.trim()) return;
    setPlaying(true);
    try {
      const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: { 'xi-api-key': apiKey.trim(), 'Content-Type': 'application/json', Accept: 'audio/mpeg' },
        body: JSON.stringify({ text: '你好！我是你的AI宠物小轻。这是我克隆出来的声音，听起来像吗？', model_id: 'eleven_multilingual_v2', voice_settings: { stability: 0.5, similarity_boost: 0.75 } }),
      });
      if (!res.ok) throw new Error('生成失败');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => { setPlaying(false); URL.revokeObjectURL(url); };
      audio.play();
    } catch (e: any) {
      setStatus(`❌ 测试失败：${e.message}`);
      setPlaying(false);
    }
  };

  return (
    <div className="px-4 pt-4 pb-20 space-y-4">
      <div className="card bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200 text-center py-4">
        <h2 className="text-lg font-bold text-purple-700">🎤 AI 声音克隆</h2>
        <p className="text-xs text-gray-500 mt-1">克隆你自己的声音，宠物用你的声音说话</p>
        {hasCloned && <p className="text-sm text-green-600 mt-2">✅ 声音克隆已就绪</p>}
      </div>

      {/* Step 1: API Key */}
      <div className="card">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-6 h-6 rounded-full bg-purple-500 text-white text-xs flex items-center justify-center">1</span>
          <h3 className="font-semibold text-gray-700">ElevenLabs API 密钥</h3>
        </div>
        <p className="text-xs text-gray-400 mb-2">
          去 <a href="https://elevenlabs.io/app/settings/api-keys" target="_blank" className="text-blue-500 underline">elevenlabs.io</a> 注册，免费额度够用
        </p>
        <input type="password" value={apiKey} onChange={e => setApiKey(e.target.value)}
          placeholder="粘贴 ElevenLabs API Key..." className="input-field text-sm" />
        {apiKey && <p className="text-[10px] text-green-500 mt-1">✅ 密钥已输入</p>}
      </div>

      {/* Step 2: Record */}
      <div className="card">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-6 h-6 rounded-full bg-purple-500 text-white text-xs flex items-center justify-center">2</span>
          <h3 className="font-semibold text-gray-700">录制声音样本</h3>
        </div>
        <p className="text-xs text-gray-400 mb-3">
          录1分钟，用正常语气朗读。比如："大家好，这是我的声音样本。我要用这个声音来作为我的AI宠物的声音..."
        </p>
        <div className="flex gap-2">
          <button onClick={startRecording} disabled={recording || !apiKey}
            className={`flex-1 py-3 rounded-xl font-bold text-white ${recording ? 'bg-red-500 animate-pulse' : 'bg-purple-500 hover:bg-purple-600'} disabled:opacity-50`}>
            {recording ? '🎤 录音中...' : recordedBlob ? '🔄 重新录制' : '🎤 开始录音'}
          </button>
          {recordedBlob && (
            <button onClick={handleClone}
              className="flex-1 py-3 rounded-xl bg-pink-500 text-white font-bold hover:bg-pink-600">
              📤 上传并克隆
            </button>
          )}
        </div>
        {recordedBlob && <p className="text-xs text-green-500 mt-2">✅ 录音就绪 ({(recordedBlob.size / 1024).toFixed(0)}KB)</p>}
      </div>

      {/* Step 3: Voice ID & Test */}
      <div className="card">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-6 h-6 rounded-full bg-purple-500 text-white text-xs flex items-center justify-center">3</span>
          <h3 className="font-semibold text-gray-700">确认 & 测试</h3>
        </div>
        <div className="space-y-3">
          <input value={voiceId} onChange={e => setVoiceId(e.target.value)}
            placeholder="Voice ID（克隆后自动填入）" className="input-field text-sm" readOnly={!!voiceId} />
          <div className="flex gap-2">
            <button onClick={testVoice} disabled={!voiceId || !apiKey || playing}
              className="flex-1 py-2 rounded-xl bg-pink-500 text-white font-medium disabled:opacity-50">
              {playing ? '🔊 播放中...' : '▶️ 测试我的声音'}
            </button>
            <button onClick={handleSave} disabled={!voiceId || !apiKey}
              className="flex-1 py-2 rounded-xl bg-purple-500 text-white font-medium disabled:opacity-50">
              💾 保存设置
            </button>
          </div>
          {hasCloned && (
            <button onClick={handleClear} className="w-full py-2 text-sm text-red-400 hover:text-red-600">
              清除声音设置
            </button>
          )}
        </div>
      </div>

      {/* Status */}
      {status && (
        <div className={`card text-sm whitespace-pre-wrap ${status.startsWith('✅') ? 'bg-green-50 border-green-200 text-green-700' : status.startsWith('❌') ? 'bg-red-50 border-red-200 text-red-600' : 'bg-blue-50 border-blue-200 text-blue-700'}`}>
          {status}
        </div>
      )}
    </div>
  );
}
