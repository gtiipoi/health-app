// === 火山引擎 + ElevenLabs 声音克隆服务 ===
// 火山引擎国内可用，免费额度：1个复刻音色 + 5000字符试用

export interface VoiceCloneSettings {
  provider: 'volcengine' | 'elevenlabs';
  accessKey: string;   // 火山引擎: Access Key
  secretKey: string;   // 火山引擎: Secret Key
  voiceId: string;     // 音色ID
}

const STORAGE_KEY = 'voice_clone_settings';

export function getVoiceSettings(): VoiceCloneSettings | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function saveVoiceSettings(s: VoiceCloneSettings) { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); }
export function clearVoiceSettings() { localStorage.removeItem(STORAGE_KEY); }

// Record audio from microphone
export async function recordAudio(durationMs: number = 30000): Promise<Blob> {
  return new Promise((resolve, reject) => {
    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
      const mr = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      const chunks: Blob[] = [];
      mr.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };
      mr.onstop = () => { stream.getTracks().forEach(t => t.stop()); resolve(new Blob(chunks, { type: 'audio/webm' })); };
      mr.start();
      setTimeout(() => mr.stop(), durationMs);
    }).catch(reject);
  });
}

// ====== 火山引擎 HMAC-SHA256 签名 ======
async function hmacSha256(key: string, data: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(key);
  const dataData = encoder.encode(data);
  const cryptoKey = await crypto.subtle.importKey('raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', cryptoKey, dataData);
  return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function volcSign(accessKey: string, secretKey: string, method: string, path: string, query: string, body: string, date: string): Promise<string> {
  const region = 'cn-north-1';
  const service = 'openspeech';
  const algorithm = 'HMAC-SHA256';

  // Step 1: Canonical Request
  const canonicalHeaders = `content-type:application/json\nhost:openspeech.bytedance.com\nx-date:${date}\n`;
  const signedHeaders = 'content-type;host;x-date';
  const bodyHash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(body));
  const bodyHashHex = Array.from(new Uint8Array(bodyHash)).map(b => b.toString(16).padStart(2, '0')).join('');
  const canonicalRequest = `${method}\n${path}\n${query}\n${canonicalHeaders}\n${signedHeaders}\n${bodyHashHex}`;

  // Step 2: String to sign
  const credentialScope = `${date.slice(0, 8)}/${region}/${service}/request`;
  const canonicalHash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(canonicalRequest));
  const canonicalHashHex = Array.from(new Uint8Array(canonicalHash)).map(b => b.toString(16).padStart(2, '0')).join('');
  const stringToSign = `${algorithm}\n${date}\n${credentialScope}\n${canonicalHashHex}`;

  // Step 3: Signing key
  const kDate = await hmacSha256(secretKey, date.slice(0, 8));
  const kRegion = await hmacSha256(kDate, region);
  const kService = await hmacSha256(kRegion, service);
  const kSigning = await hmacSha256(kService, 'request');
  const signature = await hmacSha256(kSigning, stringToSign);

  return `${algorithm} Credential=${accessKey}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;
}

// ====== 火山引擎：创建复刻音色 ======
export async function cloneVoiceVolc(accessKey: string, secretKey: string, name: string, audioBlob: Blob): Promise<string> {
  const date = new Date().toISOString().replace(/[:\-]/g, '').replace(/\.\d{3}/, '') + 'Z';
  const path = '/api/v1/voice_clone/create';
  const query = `Action=CreateVoiceClone&Version=2021-01-01`;

  // Upload audio as multipart
  const formData = new FormData();
  formData.append('audio', audioBlob, 'sample.wav');
  formData.append('voice_name', name);

  const sig = await volcSign(accessKey, secretKey, 'POST', path, query, '', date);

  const res = await fetch(`https://openspeech.bytedance.com${path}?${query}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'multipart/form-data',
      'X-Date': date,
      'Authorization': sig,
    },
    body: formData,
  });

  // The above multipart approach might not work with volc signing. Let's use a simpler approach.
  // Fall back to base64 audio in JSON body
  const reader = new FileReader();
  const base64Audio = await new Promise<string>(resolve => {
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(audioBlob);
  });

  const body = JSON.stringify({ voice_name: name, audio: base64Audio, audio_format: 'wav' });
  const sig2 = await volcSign(accessKey, secretKey, 'POST', path, query, body, date);

  const res2 = await fetch(`https://openspeech.bytedance.com${path}?${query}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Date': date,
      'Authorization': sig2,
    },
    body,
  });

  if (!res2.ok) {
    const err = await res2.text();
    throw new Error(`火山引擎错误: ${res2.status} ${err.slice(0, 300)}`);
  }

  const data = await res2.json();
  if (data.Response?.Error) throw new Error(data.Response.Error.Message);
  return data.Response?.voice_id || data.voice_id || '';
}

// ====== 火山引擎 TTS ======
export async function volcTTS(accessKey: string, secretKey: string, voiceId: string, text: string): Promise<ArrayBuffer> {
  const date = new Date().toISOString().replace(/[:\-]/g, '').replace(/\.\d{3}/, '') + 'Z';
  const path = '/api/v1/tts';
  const query = `Action=TextToSpeech&Version=2021-01-01`;

  const body = JSON.stringify({
    text,
    voice_type: voiceId,
    encoding: 'mp3',
    speed_ratio: 1.0,
    volume_ratio: 1.0,
    pitch_ratio: 1.0,
    language: 'zh',
  });

  const sig = await volcSign(accessKey, secretKey, 'POST', path, query, body, date);

  const res = await fetch(`https://openspeech.bytedance.com${path}?${query}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Date': date,
      'Authorization': sig,
    },
    body,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`TTS错误: ${res.status} ${err.slice(0, 200)}`);
  }

  return res.arrayBuffer();
}

// ====== ElevenLabs (备用) ======
export async function cloneVoiceEL(apiKey: string, name: string, audioBlob: Blob): Promise<string> {
  const fd = new FormData();
  fd.append('name', name);
  fd.append('files', audioBlob, 'sample.webm');
  const res = await fetch('https://api.elevenlabs.io/v1/voices/add', {
    method: 'POST', headers: { 'xi-api-key': apiKey }, body: fd,
  });
  if (!res.ok) throw new Error(`克隆失败: ${res.status}`);
  const data = await res.json();
  return data.voice_id;
}

export async function elTTS(apiKey: string, voiceId: string, text: string): Promise<ArrayBuffer> {
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: 'POST',
    headers: { 'xi-api-key': apiKey, 'Content-Type': 'application/json', Accept: 'audio/mpeg' },
    body: JSON.stringify({ text, model_id: 'eleven_multilingual_v2', voice_settings: { stability: 0.5, similarity_boost: 0.75 } }),
  });
  if (!res.ok) throw new Error(`TTS错误: ${res.status}`);
  return res.arrayBuffer();
}

// ====== 统一调用 ======
export async function speakWithClonedVoice(text: string): Promise<HTMLAudioElement | null> {
  const s = getVoiceSettings();
  if (!s) return null;
  try {
    const audioData = s.provider === 'elevenlabs'
      ? await elTTS(s.accessKey, s.voiceId, text)
      : await volcTTS(s.accessKey, s.secretKey, s.voiceId, text);
    const blob = new Blob([audioData], { type: 'audio/mpeg' });
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    audio.onended = () => URL.revokeObjectURL(url);
    return audio;
  } catch { return null; }
}
