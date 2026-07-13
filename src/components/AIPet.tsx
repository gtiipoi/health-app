import { useState, useEffect, useCallback, useRef } from 'react';
import { PetMood } from '../utils/petDialog';
import { getAISettings } from '../utils/aiService';

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

const STYLE_LABELS: Record<PetStyle, string> = { cat: '🐱 猫咪', dog: '🐶 小狗', blob: '🍡 团子', rabbit: '🐰 兔子', custom: '📷 自定义' };

// Mood emotes
const MOOD_EMOJI: Record<PetMood, string> = {
  happy: '😊', worried: '😟', sleepy: '😴', excited: '🤩', proud: '🥰', reminding: '🤔', cheering: '💪', welcoming: '👋',
};

// Pure CSS pet animations
function CatFace({ mood }: { mood: PetMood }) {
  const eyeOpen = mood === 'sleepy' ? 'h-1' : 'h-3';
  const mouth = mood === 'excited' || mood === 'proud' ? 'rounded-full h-4' : mood === 'worried' ? 'rounded-full h-2' : mood === 'sleepy' ? 'rounded-full h-1' : 'rounded-b-full h-3';
  return (
    <div className="w-24 h-24 relative">
      {/* Ears */}
      <div className="absolute -top-2 left-1 w-5 h-7 bg-amber-200 rounded-full transform -rotate-12" />
      <div className="absolute -top-2 right-1 w-5 h-7 bg-amber-200 rounded-full transform rotate-12" />
      <div className="absolute top-0 left-2 w-3 h-4 bg-amber-100 rounded-full transform -rotate-12" />
      <div className="absolute top-0 right-2 w-3 h-4 bg-amber-100 rounded-full transform rotate-12" />
      {/* Face */}
      <div className="w-24 h-24 bg-amber-200 rounded-full flex flex-col items-center justify-center relative">
        {/* Eyes */}
        <div className="flex gap-3 mt-1">
          <div className={`w-2.5 ${eyeOpen} bg-gray-800 rounded-full transition-all duration-300`} />
          <div className={`w-2.5 ${eyeOpen} bg-gray-800 rounded-full transition-all duration-300`} />
        </div>
        {/* Nose */}
        <div className="w-2 h-1.5 bg-pink-400 rounded-full mt-0.5" />
        {/* Mouth */}
        <div className={`w-4 ${mouth} bg-pink-300 mt-0.5 transition-all duration-300`} />
        {/* Whiskers */}
        <div className="absolute left-0 top-10 flex gap-0.5"><div className="w-5 h-0.5 bg-gray-300 rounded" /><div className="w-4 h-0.5 bg-gray-300 rounded transform -rotate-12" /></div>
        <div className="absolute right-0 top-10 flex gap-0.5"><div className="w-4 h-0.5 bg-gray-300 rounded transform rotate-12" /><div className="w-5 h-0.5 bg-gray-300 rounded" /></div>
        {/* Blush */}
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
      {/* Ears */}
      <div className="absolute -top-3 left-2 w-6 h-8 bg-amber-700 rounded-t-full rounded-b-lg transform -rotate-6" />
      <div className="absolute -top-3 right-2 w-6 h-8 bg-amber-700 rounded-t-full rounded-b-lg transform rotate-6" />
      {/* Face */}
      <div className="w-24 h-24 bg-amber-400 rounded-2xl flex flex-col items-center justify-center relative">
        {/* Eyes */}
        <div className="flex gap-3">
          <div className="w-4 h-5 bg-white rounded-full flex items-center justify-center"><div className={`w-2 ${eyeOpen} bg-gray-800 rounded-full transition-all`} /></div>
          <div className="w-4 h-5 bg-white rounded-full flex items-center justify-center"><div className={`w-2 ${eyeOpen} bg-gray-800 rounded-full transition-all`} /></div>
        </div>
        {/* Nose */}
        <div className="w-4 h-3 bg-gray-800 rounded-full mt-0.5" />
        {/* Mouth */}
        <div className="flex gap-1 mt-0.5">
          <div className="w-3 h-2 border-b-2 border-gray-800 rounded-b-full" />
          <div className="w-3 h-2 border-b-2 border-gray-800 rounded-b-full" />
        </div>
        {tongue && <div className="w-3 h-4 bg-pink-400 rounded-b-full absolute bottom-3" />}
      </div>
    </div>
  );
}

function BlobFace({ mood }: { mood: PetMood }) {
  const bounce = mood === 'excited' || mood === 'cheering';
  const squish = mood === 'worried' || mood === 'sleepy';
  return (
    <div className={`w-24 h-24 bg-gradient-to-b from-pink-300 to-purple-300 rounded-full flex flex-col items-center justify-center ${bounce ? 'animate-bounce' : ''} ${squish ? 'scale-90' : ''} transition-all duration-500 shadow-lg`}>
      {/* Eyes */}
      <div className="flex gap-4">
        <div className={`w-3 ${mood === 'sleepy' ? 'h-1' : 'h-4'} bg-white rounded-full flex items-center justify-center transition-all`}>
          <div className="w-1.5 h-1.5 bg-gray-800 rounded-full" />
        </div>
        <div className={`w-3 ${mood === 'sleepy' ? 'h-1' : 'h-4'} bg-white rounded-full flex items-center justify-center transition-all`}>
          <div className="w-1.5 h-1.5 bg-gray-800 rounded-full" />
        </div>
      </div>
      {/* Mouth */}
      <div className={`mt-1 ${mood === 'excited' ? 'w-5 h-4' : mood === 'worried' ? 'w-4 h-2' : 'w-3 h-2'} bg-pink-200 rounded-full transition-all`} />
      {/* Blush */}
      <div className="absolute ml-12 mt-4 w-4 h-2 bg-pink-300 rounded-full opacity-60" />
    </div>
  );
}

function RabbitFace({ mood }: { mood: PetMood }) {
  const eyeOpen = mood === 'sleepy' ? 'h-1' : 'h-3';
  return (
    <div className="w-24 h-24 relative">
      {/* Ears */}
      <div className="absolute -top-8 left-3 w-4 h-12 bg-gray-100 rounded-t-full transform -rotate-6"><div className="w-2 h-8 bg-pink-200 rounded-t-full mx-auto mt-1" /></div>
      <div className="absolute -top-8 right-3 w-4 h-12 bg-gray-100 rounded-t-full transform rotate-6"><div className="w-2 h-8 bg-pink-200 rounded-t-full mx-auto mt-1" /></div>
      {/* Face */}
      <div className="w-24 h-24 bg-gray-100 rounded-2xl flex flex-col items-center justify-center">
        <div className="flex gap-3">
          <div className={`w-2.5 ${eyeOpen} bg-gray-800 rounded-full transition-all`} />
          <div className={`w-2.5 ${eyeOpen} bg-gray-800 rounded-full transition-all`} />
        </div>
        <div className="w-2 h-2 bg-pink-300 rounded-full mt-0.5" />
        <div className="flex gap-1 mt-0.5">
          <div className="w-2 h-1.5 bg-gray-300 rounded-full" />
          <div className="w-2 h-1.5 bg-gray-300 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export default function AIPet({ name, message, mood, style, customImage, onStyleChange, speaking }: AIPetProps) {
  const [showStylePicker, setShowStylePicker] = useState(false);
  const [bouncing, setBouncing] = useState(false);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Speak message when it changes
  useEffect(() => {
    if (speaking && message && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(message);
      utter.lang = 'zh-CN';
      utter.rate = 1.0;
      utter.pitch = 1.2;
      // Try to find a Chinese voice
      const voices = window.speechSynthesis.getVoices();
      const zhVoice = voices.find(v => v.lang.includes('zh'));
      if (zhVoice) utter.voice = zhVoice;
      speechRef.current = utter;
      window.speechSynthesis.speak(utter);
    }
    return () => { window.speechSynthesis.cancel(); };
  }, [message, speaking]);

  // Bounce animation on message change
  useEffect(() => {
    setBouncing(true);
    const t = setTimeout(() => setBouncing(false), 600);
    return () => clearTimeout(t);
  }, [message]);

  const renderPet = () => {
    if (style === 'custom' && customImage) {
      return <img src={customImage} alt="宠物" className="w-24 h-24 object-cover rounded-full shadow-lg" />;
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
      {/* Pet area */}
      <div className="flex flex-col items-center">
        {/* Mood emoji badge */}
        <div className="text-xs mb-1 bg-white px-2 py-0.5 rounded-full shadow-sm">{MOOD_EMOJI[mood]} {name}</div>

        {/* Pet animation */}
        <div className={`transition-transform duration-300 ${bouncing ? 'scale-110' : 'scale-100'}`}>
          {renderPet()}
        </div>

        {/* Speaking indicator */}
        {speaking && (
          <div className="flex gap-1 mt-1">
            <span className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-bounce" />
            <span className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-bounce [animation-delay:0.15s]" />
            <span className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-bounce [animation-delay:0.3s]" />
          </div>
        )}

        {/* Speech bubble */}
        <div className="mt-2 bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-md max-w-[280px] relative">
          <p className="text-sm text-gray-700 leading-relaxed">{message}</p>
          <div className="absolute -top-2 left-6 w-4 h-4 bg-white transform rotate-45" />
        </div>

        {/* Style switcher */}
        <button onClick={() => setShowStylePicker(!showStylePicker)}
          className="text-[10px] text-gray-300 mt-2 hover:text-gray-400">
          {showStylePicker ? '收起' : '切换形象 ▾'}
        </button>

        {showStylePicker && (
          <div className="flex gap-1.5 mt-2 flex-wrap justify-center">
            {(Object.keys(STYLE_LABELS) as PetStyle[]).map(s => (
              <button key={s} onClick={() => { onStyleChange(s); setShowStylePicker(false); }}
                className={`text-xs px-3 py-1.5 rounded-full transition-all ${style === s ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                {STYLE_LABELS[s]}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
