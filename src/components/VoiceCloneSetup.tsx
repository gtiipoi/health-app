import { useState } from 'react';
import { getVoiceSettings, saveVoiceSettings, clearVoiceSettings, recordAudio, cloneVoiceVolc } from '../utils/voiceClone';

export default function VoiceCloneSetup() {
  const saved = getVoiceSettings();
  const [appId, setAppId] = useState(saved?.appId || '');
  const [token, setToken] = useState(saved?.token || '');
  const [voiceId, setVoiceId] = useState(saved?.voiceId || '');
  const [status, setStatus] = useState('');
  const [recording, setRecording] = useState(false);
  const [recorded, setRecorded] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [uploading, setUploading] = useState(false);
  const hasDone = !!(saved?.appId && saved?.token);

  const startRecord = async () => {
    setStatus('');
    setRecording(true);
    try {
      const blob = await recordAudio(15000);
      setAudioBlob(blob);
      setRecorded(true);
      setStatus('✅ 录制完成！点击克隆');
    } catch (e: any) { setStatus('❌ ' + e.message); }
    setRecording(false);
  };

  const doClone = async () => {
    if (!appId.trim() || !token.trim() || !audioBlob) return;
    setUploading(true);
    setStatus('⏳ 上传中，正在创建声音复刻...');
    try {
      const id = await cloneVoiceVolc(appId.trim(), token.trim(), '我的声音', audioBlob);
      setVoiceId(id);
      saveVoiceSettings({ appId: appId.trim(), token: token.trim(), voiceId: id });
      setStatus(`✅ 克隆成功！Voice ID: ${id}`);
    } catch (e: any) { setStatus('❌ ' + e.message); }
    setUploading(false);
  };

  const handleSave = () => {
    if (!appId.trim() || !token.trim()) return;
    saveVoiceSettings({ appId: appId.trim(), token: token.trim(), voiceId: voiceId.trim() });
    setStatus('✅ 已保存！');
  };

  return (
    <div className="px-4 pt-4 pb-20 space-y-4">
      <div className="card bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 text-center py-4">
        <h2 className="text-lg font-bold text-blue-700">🎤 火山引擎声音复刻</h2>
        <p className="text-xs text-gray-500 mt-1">国内直连，无需翻墙</p>
        {hasDone && <p className="text-sm text-green-600 mt-2">✅ 已配置</p>}
      </div>

      {/* Step 1: Get credentials */}
      <div className="card">
        <h3 className="font-semibold mb-3">🔑 获取凭证</h3>
        <div className="text-xs text-gray-500 space-y-1 mb-3">
          <p>1. 打开 <a href="https://console.volcengine.com/speech/service/8" target="_blank" className="text-blue-500 underline">火山引擎语音控制台</a></p>
          <p>2. 开通「语音合成」服务（免费试用）</p>
          <p>3. 左侧菜单 → 应用管理 → 创建应用</p>
          <p>4. 复制 <b>APP ID</b> 和 <b>Access Token</b></p>
        </div>
        <input value={appId} onChange={e => setAppId(e.target.value)} placeholder="APP ID" className="input-field text-sm mb-2" />
        <input type="password" value={token} onChange={e => setToken(e.target.value)} placeholder="Access Token" className="input-field text-sm" />
        {appId && token && <p className="text-[10px] text-green-500 mt-1">✅ 凭证已填写</p>}
      </div>

      {/* Step 2: Record & Clone */}
      <div className="card">
        <h3 className="font-semibold mb-3">🎙️ 录制并克隆</h3>
        <p className="text-xs text-gray-500 mb-3">录 15 秒中文语音，安静环境下朗读任意内容。注：火山引擎声音复刻免费版限制较多，可能需要多次尝试。</p>
        <div className="flex gap-2">
          <button onClick={startRecord} disabled={recording || !appId || !token}
            className={`flex-1 py-3 rounded-xl font-bold text-white ${recording ? 'bg-red-500' : 'bg-blue-600 hover:bg-blue-700'} disabled:opacity-50 disabled:bg-gray-300`}>
            {recording ? '🎤 录音 15s...' : recorded ? '🔄 重录' : '🎤 开始录音'}
          </button>
          {recorded && (
            <button onClick={doClone} disabled={uploading}
              className={`flex-1 py-3 rounded-xl font-bold text-white ${uploading ? 'bg-gray-400' : 'bg-indigo-500 hover:bg-indigo-600'}`}>
              {uploading ? '⏳ 克隆中...' : '📤 创建复刻'}
            </button>
          )}
        </div>
        {recorded && <p className="text-xs text-green-500 mt-2">✅ 录音就绪</p>}
        {uploading && <p className="text-xs text-blue-500 mt-2">⏳ 正在上传创建，请等待...</p>}
      </div>

      {/* Step 3: Verify & Save */}
      <div className="card">
        <h3 className="font-semibold mb-3">💾 保存</h3>
        <input value={voiceId} onChange={e => setVoiceId(e.target.value)}
          placeholder="Voice ID（克隆成功后自动填入）" className="input-field text-sm mb-3" />
        <button onClick={handleSave} disabled={!appId || !token}
          className="w-full py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 disabled:opacity-50">
          💾 保存设置
        </button>
        {hasDone && (
          <button onClick={() => { clearVoiceSettings(); setVoiceId(''); setStatus('已清除'); }}
            className="w-full mt-2 py-2 text-sm text-red-400">清除</button>
        )}
      </div>

      {status && (
        <div className={`card text-sm font-medium ${
          status.startsWith('✅') ? 'bg-green-50 text-green-700 border-green-300' :
          status.startsWith('❌') ? 'bg-red-50 text-red-600 border-red-300' :
          'bg-blue-50 text-blue-700'}`}>{status}</div>
      )}
    </div>
  );
}
