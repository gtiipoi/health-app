// === 声音克隆服务（简化版）===

export interface VoiceCloneSettings {
  apiKey: string;
  voiceId: string;
}

const KEY = 'voice_clone_v2';

export function getVoiceSettings(): VoiceCloneSettings | null {
  try { const r = localStorage.getItem(KEY); return r ? JSON.parse(r) : null; } catch { return null; }
}
export function saveVoiceSettings(s: VoiceCloneSettings) { localStorage.setItem(KEY, JSON.stringify(s)); }
export function clearVoiceSettings() { localStorage.removeItem(KEY); }

// 录制音频
export async function recordAudio(ms = 30000): Promise<Blob> {
  return new Promise((resolve, reject) => {
    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
      const mr = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' });
      const chunks: Blob[] = [];
      mr.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };
      mr.onstop = () => { stream.getTracks().forEach(t => t.stop()); resolve(new Blob(chunks, { type: 'audio/webm' })); };
      mr.onerror = () => reject(new Error('录音失败'));
      mr.start();
      setTimeout(() => { if (mr.state === 'recording') mr.stop(); }, ms);
    }).catch(() => reject(new Error('麦克风权限被拒绝，请在浏览器设置中允许')));
  });
}

// 克隆声音 (ElevenLabs)
export async function cloneVoice(apiKey: string, name: string, audioBlob: Blob): Promise<string> {
  const fd = new FormData();
  fd.append('name', name);
  fd.append('files', audioBlob, 'sample.webm');
  fd.append('description', 'AI宠物声音');

  const res = await fetch('https://api.elevenlabs.io/v1/voices/add', {
    method: 'POST',
    headers: { 'xi-api-key': apiKey },
    body: fd,
  });

  if (!res.ok) {
    const err = await res.text();
    if (res.status === 401) throw new Error('API密钥无效，请检查');
    if (res.status === 429) throw new Error('请求太频繁，请稍后再试');
    throw new Error(`克隆失败(${res.status}): ${err.slice(0, 200)}`);
  }
  const data = await res.json();
  return data.voice_id;
}

// 生成语音
export async function generateSpeech(apiKey: string, voiceId: string, text: string): Promise<ArrayBuffer> {
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: 'POST',
    headers: { 'xi-api-key': apiKey, 'Content-Type': 'application/json', Accept: 'audio/mpeg' },
    body: JSON.stringify({
      text,
      model_id: 'eleven_multilingual_v2',
      voice_settings: { stability: 0.5, similarity_boost: 0.75, style: 0.3, use_speaker_boost: true },
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    if (res.status === 401) throw new Error('API密钥无效');
    if (res.status === 429) throw new Error('免费额度用完了');
    throw new Error(`TTS失败(${res.status}): ${err.slice(0, 200)}`);
  }
  return res.arrayBuffer();
}

// 用克隆声音说话
export async function speakWithClonedVoice(text: string): Promise<HTMLAudioElement | null> {
  const s = getVoiceSettings();
  if (!s) return null;
  try {
    const data = await generateSpeech(s.apiKey, s.voiceId, text);
    const blob = new Blob([data], { type: 'audio/mpeg' });
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    audio.onended = () => URL.revokeObjectURL(url);
    return audio;
  } catch { return null; }
}
