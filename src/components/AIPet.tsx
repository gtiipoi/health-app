import { useState, useEffect, useRef } from 'react';
import { PetMood } from '../utils/petDialog';
import { getVoiceSettings, speakWithClonedVoice } from '../utils/voiceClone';
import { PET_IMAGE } from '../utils/petImage';

export type PetStyle = 'cat' | 'dog' | 'blob' | 'rabbit' | 'custom';

interface AIPetProps {
  name: string;
  message: string;
  mood: PetMood;
  style: PetStyle;
  customImage?: string;
  onStyleChange: (s: PetStyle) => void;
  speaking?: boolean;
}

const STYLE_LABELS: Record<PetStyle, string> = {
  cat: '🐱 猫咪', dog: '🐶 小狗', blob: '🍡 团子', rabbit: '🐰 兔子', custom: '📷 我的宠物',
};

// Strip emoji and special chars for speech
function stripEmoji(text: string): string {
  return text
    .replace(/[\u{1F600}-\u{1F64F}]/gu, '')
    .replace(/[\u{1F300}-\u{1F5FF}]/gu, '')
    .replace(/[\u{1F680}-\u{1F6FF}]/gu, '')
    .replace(/[\u{1F1E0}-\u{1F1FF}]/gu, '')
    .replace(/[\u{2600}-\u{26FF}]/gu, '')
    .replace(/[\u{2700}-\u{27BF}]/gu, '')
    .replace(/[\u{FE00}-\u{FE0F}]/gu, '')
    .replace(/[\u{200D}]/gu, '')
    .replace(/[⚠️✅🔥💪🥗🍽️🏋️📊📈📉🎉🎯💧⚖️📏📋🤖🍳💬🏠🏃🧘🥩🍚🧈]/gu, '')
    .replace(/[🌅☀️🌙🌞🍪🌟⭐✨❤️💙💚💛🧡💜🖤🤍🤎]/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
}

const MOOD_EMOJI: Record<PetMood, string> = {
  happy: '😊', worried: '😟', sleepy: '😴', excited: '🤩', proud: '🥰', reminding: '🤔', cheering: '💪', welcoming: '👋',
};

// CSS Pet faces (same as before)
function CatFace({ mood }: { mood: PetMood }) {
  const eyeOpen = mood === 'sleepy' ? 'h-1' : 'h-3';
  const mouth = mood === 'excited' || mood === 'proud' ? 'rounded-full h-4' : mood === 'worried' ? 'rounded-full h-2' : mood === 'sleepy' ? 'rounded-full h-1' : 'rounded-b-full h-3';
  return (
    <div className="w-24 h-24 relative">
      <div className="absolute -top-2 left-1 w-5 h-7 bg-amber-200 rounded-full transform -rotate-12" />
      <div className="absolute -top-2 right-1 w-5 h-7 bg-amber-200 rounded-full transform rotate-12" />
      <div className="absolute top-0 left-2 w-3 h-4 bg-amber-100 rounded-full transform -rotate-12" />
      <div className="absolute top-0 right-2 w-3 h-4 bg-amber-100 rounded-full transform rotate-12" />
      <div className="w-24 h-24 bg-amber-200 rounded-full flex flex-col items-center justify-center relative">
        <div className="flex gap-3 mt-1">
          <div className={`w-2.5 ${eyeOpen} bg-gray-800 rounded-full transition-all duration-300`} />
          <div className={`w-2.5 ${eyeOpen} bg-gray-800 rounded-full transition-all duration-300`} />
        </div>
        <div className="w-2 h-1.5 bg-pink-400 rounded-full mt-0.5" />
        <div className={`w-4 ${mouth} bg-pink-300 mt-0.5 transition-all duration-300`} />
        <div className="absolute left-0 top-10 flex gap-0.5"><div className="w-5 h-0.5 bg-gray-300 rounded" /><div className="w-4 h-0.5 bg-gray-300 rounded transform -rotate-12" /></div>
        <div className="absolute right-0 top-10 flex gap-0.5"><div className="w-4 h-0.5 bg-gray-300 rounded transform rotate-12" /><div className="w-5 h-0.5 bg-gray-300 rounded" /></div>
        <div className="absolute left-3 top-9 w-3 h-2 bg-pink-200 rounded-full opacity-50" />
        <div className="absolute right-3 top-9 w-3 h-2 bg-pink-200 rounded-full opacity-50" />
      </div>
    </div>
  );
}

function DogFace({ mood }: { mood: PetMood }) {
  const eyeOpen = mood === 'sleepy' ? 'h-1' : 'h-3';
  const tongue = mood === 'excited' || mood === 'proud';
  return (
    <div className="w-24 h-24 relative">
      <div className="absolute -top-3 left-2 w-6 h-8 bg-amber-700 rounded-t-full rounded-b-lg transform -rotate-6" />
      <div className="absolute -top-3 right-2 w-6 h-8 bg-amber-700 rounded-t-full rounded-b-lg transform rotate-6" />
      <div className="w-24 h-24 bg-amber-400 rounded-2xl flex flex-col items-center justify-center relative">
        <div className="flex gap-3">
          <div className="w-4 h-5 bg-white rounded-full flex items-center justify-center"><div className={`w-2 ${eyeOpen} bg-gray-800 rounded-full transition-all`} /></div>
          <div className="w-4 h-5 bg-white rounded-full flex items-center justify-center"><div className={`w-2 ${eyeOpen} bg-gray-800 rounded-full transition-all`} /></div>
        </div>
        <div className="w-4 h-3 bg-gray-800 rounded-full mt-0.5" />
        <div className="flex gap-1 mt-0.5"><div className="w-3 h-2 border-b-2 border-gray-800 rounded-b-full" /><div className="w-3 h-2 border-b-2 border-gray-800 rounded-b-full" /></div>
        {tongue && <div className="w-3 h-4 bg-pink-400 rounded-b-full absolute bottom-3" />}
      </div>
    </div>
  );
}

function BlobFace({ mood }: { mood: PetMood }) {
  const b = mood === 'excited' || mood === 'cheering';
  const s = mood === 'worried' || mood === 'sleepy';
  return (
    <div className={`w-24 h-24 bg-gradient-to-b from-pink-300 to-purple-300 rounded-full flex flex-col items-center justify-center ${b ? 'animate-bounce' : ''} ${s ? 'scale-90' : ''} transition-all duration-500 shadow-lg`}>
      <div className="flex gap-4">
        <div className={`w-3 ${mood === 'sleepy' ? 'h-1' : 'h-4'} bg-white rounded-full flex items-center justify-center transition-all`}><div className="w-1.5 h-1.5 bg-gray-800 rounded-full" /></div>
        <div className={`w-3 ${mood === 'sleepy' ? 'h-1' : 'h-4'} bg-white rounded-full flex items-center justify-center transition-all`}><div className="w-1.5 h-1.5 bg-gray-800 rounded-full" /></div>
      </div>
      <div className={`mt-1 ${mood === 'excited' ? 'w-5 h-4' : mood === 'worried' ? 'w-4 h-2' : 'w-3 h-2'} bg-pink-200 rounded-full transition-all`} />
    </div>
  );
}

function RabbitFace({ mood }: { mood: PetMood }) {
  const eyeOpen = mood === 'sleepy' ? 'h-1' : 'h-3';
  return (
    <div className="w-24 h-24 relative">
      <div className="absolute -top-8 left-3 w-4 h-12 bg-gray-100 rounded-t-full transform -rotate-6"><div className="w-2 h-8 bg-pink-200 rounded-t-full mx-auto mt-1" /></div>
      <div className="absolute -top-8 right-3 w-4 h-12 bg-gray-100 rounded-t-full transform rotate-6"><div className="w-2 h-8 bg-pink-200 rounded-t-full mx-auto mt-1" /></div>
      <div className="w-24 h-24 bg-gray-100 rounded-2xl flex flex-col items-center justify-center">
        <div className="flex gap-3"><div className={`w-2.5 ${eyeOpen} bg-gray-800 rounded-full transition-all`} /><div className={`w-2.5 ${eyeOpen} bg-gray-800 rounded-full transition-all`} /></div>
        <div className="w-2 h-2 bg-pink-300 rounded-full mt-0.5" />
        <div className="flex gap-1 mt-0.5"><div className="w-2 h-1.5 bg-gray-300 rounded-full" /><div className="w-2 h-1.5 bg-gray-300 rounded-full" /></div>
      </div>
    </div>
  );
}

export default function AIPet({ name, message, mood, style, onStyleChange, speaking }: AIPetProps) {
  const [showPicker, setShowPicker] = useState(false);
  const [bouncing, setBouncing] = useState(false);
  const [voiceName, setVoiceName] = useState(() => localStorage.getItem('pet_voice') || '');
  const [showVoicePicker, setShowVoicePicker] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);

  // Load voices
  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      setAvailableVoices(voices);
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  // Speak - prefer cloned voice, fallback to Web Speech API
  useEffect(() => {
    if (!speaking || !message) return;
    const cleanText = stripEmoji(message);
    if (!cleanText) return;

    // Try cloned voice first
    const cloneSettings = getVoiceSettings();
    if (cloneSettings) {
      window.speechSynthesis.cancel();
      speakWithClonedVoice(cleanText).then(audio => {
        if (audio) audio.play().catch(() => {});
        else fallbackTTS(cleanText);
      });
    } else {
      fallbackTTS(cleanText);
    }

    return () => { window.speechSynthesis.cancel(); };
  }, [message, speaking]);

  // Fallback TTS function
  function fallbackTTS(text: string) {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'zh-CN';
    utter.rate = 0.95;
    utter.pitch = 1.15;
    if (voiceName) {
      const v = availableVoices.find(v => v.name === voiceName);
      if (v) utter.voice = v;
    } else {
      const zhVoice = availableVoices.find(v => v.lang.includes('zh-CN') || v.lang.includes('zh-HK') || v.lang.includes('zh-TW'));
      if (zhVoice) utter.voice = zhVoice;
    }
    window.speechSynthesis.speak(utter);
  }

  // Bounce on new message
  useEffect(() => {
    setBouncing(true);
    const t = setTimeout(() => setBouncing(false), 600);
    return () => clearTimeout(t);
  }, [message]);

  const zhVoices = availableVoices.filter(v => v.lang.includes('zh'));

  const renderPet = () => {
    if (style === 'custom') {
      return <img src={PET_IMAGE} alt="宠物" className="w-24 h-24 object-cover rounded-full shadow-lg border-2 border-amber-300" />;
    }
    switch (style) {
      case 'cat': return <CatFace mood={mood} />;
      case 'dog': return <DogFace mood={mood} />;
      case 'blob': return <BlobFace mood={mood} />;
      case 'rabbit': return <RabbitFace mood={mood} />;
      default: return <CatFace mood={mood} />;
    }
  };

  return (
    <div className="relative">
      <div className="flex flex-col items-center">
        <div className="text-xs mb-1 bg-white px-2 py-0.5 rounded-full shadow-sm">{MOOD_EMOJI[mood]} {name}</div>
        <div className={`transition-transform duration-300 ${bouncing ? 'scale-110' : 'scale-100'}`}>
          {renderPet()}
        </div>
        {speaking && (
          <div className="flex gap-1 mt-1">
            <span className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-bounce" />
            <span className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-bounce [animation-delay:0.15s]" />
            <span className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-bounce [animation-delay:0.3s]" />
          </div>
        )}
        <div className="mt-2 bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-md max-w-[280px] relative">
          <p className="text-sm text-gray-700 leading-relaxed">{message}</p>
          <div className="absolute -top-2 left-6 w-4 h-4 bg-white transform rotate-45" />
        </div>

        {/* Controls row */}
        <div className="flex gap-2 mt-2 flex-wrap justify-center">
          <button onClick={() => setShowPicker(!showPicker)}
            className="text-[10px] px-2 py-1 rounded-full bg-gray-100 text-gray-400 hover:bg-gray-200">
            切换形象 ▾
          </button>
          <button onClick={() => setShowVoicePicker(!showVoicePicker)}
            className="text-[10px] px-2 py-1 rounded-full bg-gray-100 text-gray-400 hover:bg-gray-200">
            🎤 音色 ▾
          </button>
        </div>

        {/* Style picker */}
        {showPicker && (
          <div className="flex gap-1.5 mt-2 flex-wrap justify-center">
            {(Object.keys(STYLE_LABELS) as PetStyle[]).map(s => (
              <button key={s} onClick={() => { onStyleChange(s); setShowPicker(false); }}
                className={`text-xs px-3 py-1.5 rounded-full transition-all ${style === s ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                {STYLE_LABELS[s]}
              </button>
            ))}
          </div>
        )}

        {/* Voice picker */}
        {showVoicePicker && (
          <div className="mt-2 bg-white rounded-xl shadow-md p-3 max-w-[260px]">
            <div className="text-[10px] text-gray-400 mb-2">选择朗读音色</div>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              <button onClick={() => { setVoiceName(''); localStorage.removeItem('pet_voice'); }}
                className={`w-full text-left text-xs px-3 py-1.5 rounded-full ${!voiceName ? 'bg-primary-100 text-primary-600' : 'text-gray-500'}`}>
                系统默认
              </button>
              {zhVoices.map(v => (
                <button key={v.name} onClick={() => { setVoiceName(v.name); localStorage.setItem('pet_voice', v.name); }}
                  className={`w-full text-left text-xs px-3 py-1.5 rounded-full ${voiceName === v.name ? 'bg-primary-100 text-primary-600' : 'text-gray-500 hover:bg-gray-50'}`}>
                  {v.name.replace(/Microsoft |-.*$/g, '')} {v.lang}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
