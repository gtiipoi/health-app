import { useState, useRef } from 'react';
import { getVoiceSettings, saveVoiceSettings, clearVoiceSettings, recordAudio, cloneVoiceVolc, cloneVoiceEL, volcTTS, elTTS } from '../utils/voiceClone';

type Provider = 'volcengine' | 'elevenlabs';

export default function VoiceCloneSetup() {
  const saved = getVoiceSettings();
  const [provider, setProvider] = useState<Provider>(saved?.provider || 'volcengine');
  const [accessKey, setAccessKey] = useState(saved?.accessKey || '');
  const [secretKey, setSecretKey] = useState(saved?.secretKey || '');
  const [voiceId, setVoiceId] = useState(saved?.voiceId || '');
  const [status, setStatus] = useState('');
  const [recording, setRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [voiceName, setVoiceName] = useState('我的声音');
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hasCloned = !!(saved?.voiceId);

  const handleSave = () => {
    if (!accessKey.trim()) { setStatus('请输入密钥'); return; }
    if (!voiceId.trim()) { setStatus('请先克隆声音'); return; }
    saveVoiceSettings({ provider, accessKey: accessKey.trim(), secretKey: secretKey.trim(), voiceId: voiceId.trim() });
    setStatus('✅ 已保存！');
  };

  const handleClear = () => { clearVoiceSettings(); setVoiceId(''); setStatus('已清除'); };

  const startRecording = async () => {
    setStatus('🎤 录音中...请用正常语气朗读30秒');
    setRecording(true);
    try {
      const blob = await recordAudio(30000);
      setRecordedBlob(blob);
      setStatus('✅ 录音完成！');
    } catch (e: any) { setStatus(`❌ ${e.message || '请允许麦克风'} `); }
    setRecording(false);
  };

  const handleClone = async () => {
    if (!accessKey.trim()) { setStatus('请先输入密钥'); return; }
    if (!recordedBlob) { setStatus('请先录音'); return; }
    setStatus('🔄 正在上传并克隆声音...');
    try {
      let id: string;
      if (provider === 'elevenlabs') {
        id = await cloneVoiceEL(accessKey.trim(), voiceName, recordedBlob);
      } else {
        if (!secretKey.trim()) { setStatus('火山引擎需要填写Secret Key'); return; }
        id = await cloneVoiceVolc(accessKey.trim(), secretKey.trim(), voiceName, recordedBlob);
      }
      setVoiceId(id);
      saveVoiceSettings({ provider, accessKey: accessKey.trim(), secretKey: secretKey.trim(), voiceId: id });
      setStatus(`✅ 克隆成功！Voice ID: ${id}`);
    } catch (e: any) { setStatus(`❌ ${e.message}`); }
  };

  const testVoice = async () => {
    if (!accessKey.trim() || !voiceId.trim()) return;
    setPlaying(true);
    try {
      const data = provider === 'elevenlabs'
        ? await elTTS(accessKey.trim(), voiceId.trim(), '你好，这是克隆声音测试。')
        : await volcTTS(accessKey.trim(), secretKey.trim(), voiceId.trim(), '你好，这是克隆声音测试。');
      const blob = new Blob([data], { type: 'audio/mpeg' });
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => { setPlaying(false); URL.revokeObjectURL(url); };
      audio.play();
    } catch (e: any) { setStatus(`❌ ${e.message}`); setPlaying(false); }
  };

  return (
    <div className="px-4 pt-4 pb-20 space-y-4">
      <div className="card bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200 text-center py-4">
        <h2 className="text-lg font-bold text-purple-700">🎤 声音克隆</h2>
        <p className="text-xs text-gray-500 mt-1">克隆你自己的声音，宠物用你的声音说话</p>
        {hasCloned && <p className="text-sm text-green-600 mt-2">✅ 已克隆</p>}
      </div>

      {/* Provider picker */}
      <div className="card">
        <h3 className="font-semibold mb-2">选择服务商</h3>
        <div className="flex gap-2">
          {[
            { k: 'volcengine' as const, l: '🇨🇳 火山引擎（国内）', desc: '免费1音色，国内直连' },
            { k: 'elevenlabs' as const, l: '🌍 ElevenLabs（海外）', desc: '免费1万字/月' },
          ].map(p => (
            <button key={p.k} onClick={() => setProvider(p.k)}
              className={`flex-1 p-3 rounded-xl text-left text-xs transition-all ${provider === p.k ? 'bg-purple-100 border-2 border-purple-400' : 'bg-gray-50 border'}`}>
              <div className="font-semibold">{p.l}</div>
              <div className="text-[10px] text-gray-400 mt-0.5">{p.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Keys */}
      <div className="card space-y-3">
        <h3 className="font-semibold">🔑 密钥</h3>
        {provider === 'volcengine' ? (
          <>
            <p className="text-xs text-gray-400">
              去 <a href="https://console.volcengine.com/iam/keymanage/" target="_blank" className="text-blue-500 underline">火山引擎控制台</a> 创建Access Key
            </p>
            <input type="password" value={accessKey} onChange={e => setAccessKey(e.target.value)} placeholder="Access Key ID" className="input-field text-sm" />
            <input type="password" value={secretKey} onChange={e => setSecretKey(e.target.value)} placeholder="Secret Access Key" className="input-field text-sm" />
          </>
        ) : (
          <>
            <p className="text-xs text-gray-400">
              去 <a href="https://elevenlabs.io/app/settings/api-keys" target="_blank" className="text-blue-500 underline">ElevenLabs</a> 获取API Key
            </p>
            <input type="password" value={accessKey} onChange={e => setAccessKey(e.target.value)} placeholder="API Key" className="input-field text-sm" />
          </>
        )}
        {accessKey && <p className="text-[10px] text-green-500">✅ 已填写</p>}
      </div>

      {/* Record */}
      <div className="card">
        <h3 className="font-semibold mb-3">🎙️ 录制声音样本</h3>
        <p className="text-xs text-gray-400 mb-3">录30秒，用正常语气朗读任意内容</p>
        <div className="flex gap-2">
          <button onClick={startRecording} disabled={recording || !accessKey}
            className={`flex-1 py-3 rounded-xl font-bold text-white ${recording ? 'bg-red-500' : 'bg-purple-500'} disabled:opacity-50`}>
            {recording ? '🎤 录音中...' : recordedBlob ? '重录' : '开始录音'}
          </button>
          {recordedBlob && (
            <button onClick={handleClone} className="flex-1 py-3 rounded-xl bg-pink-500 text-white font-bold">上传克隆</button>
          )}
        </div>
        {recordedBlob && <p className="text-xs text-green-500 mt-2">✅ 录音就绪</p>}
      </div>

      {/* Voice ID + Test */}
      <div className="card space-y-3">
        <h3 className="font-semibold">🎵 音色ID & 测试</h3>
        <input value={voiceId} onChange={e => setVoiceId(e.target.value)} placeholder="Voice ID（克隆后自动填入）" className="input-field text-sm" />
        <div className="flex gap-2">
          <button onClick={testVoice} disabled={!voiceId || playing} className="flex-1 py-2 rounded-xl bg-pink-500 text-white font-medium disabled:opacity-50">
            {playing ? '🔊 播放中' : '▶ 测试'}
          </button>
          <button onClick={handleSave} disabled={!voiceId} className="flex-1 py-2 rounded-xl bg-purple-500 text-white font-medium disabled:opacity-50">保存</button>
        </div>
        {hasCloned && <button onClick={handleClear} className="w-full py-2 text-sm text-red-400">清除</button>}
      </div>

      {status && (
        <div className={`card text-sm whitespace-pre-wrap ${status.startsWith('✅') ? 'bg-green-50 text-green-700' : status.startsWith('❌') ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-700'}`}>{status}</div>
      )}
    </div>
  );
}
