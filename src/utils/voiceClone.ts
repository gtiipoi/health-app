// === ElevenLabs Voice Cloning Service ===

export interface VoiceCloneSettings {
  apiKey: string;
  voiceId: string;
}

const STORAGE_KEY = 'voice_clone_settings';

export function getVoiceSettings(): VoiceCloneSettings | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch { return null; }
}

export function saveVoiceSettings(s: VoiceCloneSettings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
}

export function clearVoiceSettings() {
  localStorage.removeItem(STORAGE_KEY);
}

// Record audio from microphone
export async function recordAudio(durationMs: number = 60000): Promise<Blob> {
  return new Promise((resolve, reject) => {
    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
      mediaRecorder.onstop = () => {
        stream.getTracks().forEach(t => t.stop());
        resolve(new Blob(chunks, { type: 'audio/webm' }));
      };
      mediaRecorder.onerror = (e) => reject(e);

      mediaRecorder.start();
      setTimeout(() => mediaRecorder.stop(), durationMs);
    }).catch(reject);
  });
}

// Clone voice via ElevenLabs API
export async function cloneVoice(apiKey: string, name: string, audioBlob: Blob, description?: string): Promise<string> {
  const formData = new FormData();
  formData.append('name', name);
  formData.append('files', audioBlob, 'sample.webm');
  if (description) formData.append('description', description);

  const res = await fetch('https://api.elevenlabs.io/v1/voices/add', {
    method: 'POST',
    headers: { 'xi-api-key': apiKey },
    body: formData,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`声音克隆失败: ${res.status} ${err.slice(0, 300)}`);
  }

  const data = await res.json();
  return data.voice_id;
}

// Generate speech with cloned voice
export async function generateSpeech(apiKey: string, voiceId: string, text: string): Promise<ArrayBuffer> {
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: 'POST',
    headers: {
      'xi-api-key': apiKey,
      'Content-Type': 'application/json',
      'Accept': 'audio/mpeg',
    },
    body: JSON.stringify({
      text,
      model_id: 'eleven_multilingual_v2',
      voice_settings: { stability: 0.5, similarity_boost: 0.75, style: 0.3, use_speaker_boost: true },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`语音生成失败: ${res.status} ${err.slice(0, 200)}`);
  }

  return res.arrayBuffer();
}

// Speak using cloned voice - returns an audio element
export async function speakWithClonedVoice(text: string): Promise<HTMLAudioElement | null> {
  const settings = getVoiceSettings();
  if (!settings) return null;

  try {
    const audioData = await generateSpeech(settings.apiKey, settings.voiceId, text);
    const blob = new Blob([audioData], { type: 'audio/mpeg' });
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    audio.onended = () => URL.revokeObjectURL(url);
    return audio;
  } catch {
    return null;
  }
}
