// === 火山引擎 TTS V3 + 系统语音 ===
// V3 API 支持 Token 认证（不需要复杂的 HMAC 签名）

export interface VoiceCloneSettings {
  appId: string;     // 火山引擎应用ID
  token: string;     // 访问Token
  voiceId: string;   // 音色ID（可选，不填用系统默认）
}

const KEY = 'voice_clone_v3';

export function getVoiceSettings(): VoiceCloneSettings | null {
  try { const r = localStorage.getItem(KEY); return r ? JSON.parse(r) : null; } catch { return null; }
}
export function saveVoiceSettings(s: VoiceCloneSettings) { localStorage.setItem(KEY, JSON.stringify(s)); }
export function clearVoiceSettings() { localStorage.removeItem(KEY); }

// 录制
export async function recordAudio(ms = 30000): Promise<Blob> {
  return new Promise((resolve, reject) => {
    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
      const mr = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' });
      const chunks: Blob[] = [];
      mr.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };
      mr.onstop = () => { stream.getTracks().forEach(t => t.stop()); resolve(new Blob(chunks, { type: 'audio/webm' })); };
      mr.start();
      setTimeout(() => { if (mr.state === 'recording') mr.stop(); }, ms);
    }).catch(() => reject(new Error('请允许麦克风权限')));
  });
}

// ====== 火山引擎 V3 TTS (Token认证) ======
async function volcTTSV3(appId: string, token: string, text: string, voiceType?: string): Promise<ArrayBuffer> {
  const body = JSON.stringify({
    app: { appid: appId, token, cluster: 'volcano_tts' },
    user: { uid: 'health-app-user' },
    audio: { voice_type: voiceType || 'BV700_V2_streaming', encoding: 'mp3', speed_ratio: 1.0, rate: 24000 },
    request: { reqid: crypto.randomUUID(), text, text_type: 'plain', operation: 'query' },
  });

  const res = await fetch('https://openspeech.bytedance.com/api/v1/tts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer;${token}` },
    body,
  });

  if (!res.ok) {
    const err = await res.text();
    if (res.status === 401 || res.status === 403) throw new Error('认证失败，请检查 App ID 和 Token');
    throw new Error(`TTS错误(${res.status}): ${err.slice(0, 200)}`);
  }

  // Response is JSON with base64 audio
  const data = await res.json();
  if (data.code !== 3000 && data.message) throw new Error(data.message);

  const audioBase64 = data.audio?.data || data.data;
  if (!audioBase64) throw new Error('未返回音频数据');

  const binary = atob(audioBase64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

// 创建复刻音色（上传音频→获得voice_id）
export async function cloneVoiceVolc(appId: string, token: string, name: string, audioBlob: Blob): Promise<string> {
  // Convert audio to base64
  const base64 = await new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(audioBlob);
  });

  const body = JSON.stringify({
    app: { appid: appId, token, cluster: 'volcano_tts' },
    user: { uid: 'health-app-user' },
    audio: { encoding: 'mp3', sample_rate: 24000 },
    request: { reqid: crypto.randomUUID(), operation: 'copy', target_voice_name: name, audio_data: base64 },
  });

  const res = await fetch('https://openspeech.bytedance.com/api/v1/voice_clone', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer;${token}` },
    body,
  });

  if (!res.ok) {
    const err = await res.text();
    if (res.status === 401) throw new Error('认证失败，请检查Token');
    throw new Error(`克隆失败(${res.status}): ${err.slice(0, 200)}`);
  }

  const data = await res.json();
  if (data.code === 3000) return data.voice_id || data.voice_type || '';
  if (data.message) throw new Error(data.message);
  throw new Error('克隆失败，请重试');
}

// 用复刻音色说话
export async function speakWithClonedVoice(text: string): Promise<HTMLAudioElement | null> {
  const s = getVoiceSettings();
  if (!s) return null;
  try {
    const data = await volcTTSV3(s.appId, s.token, text, s.voiceId || undefined);
    const blob = new Blob([data], { type: 'audio/mpeg' });
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    audio.onended = () => URL.revokeObjectURL(url);
    return audio;
  } catch { return null; }
}
