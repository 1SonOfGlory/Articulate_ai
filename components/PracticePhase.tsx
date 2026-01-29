
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { WordItem, Scenario, UserProfile, PracticeResult } from '../types';
import { Icons } from '../constants';

function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = binaryString.charCodeAt(i);
  return bytes;
}

async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
  }
  return buffer;
}

interface Balloon {
  id: string;
  word: WordItem;
  x: number;
  y: number;
  vx: number;
  vy: number;
  popped: boolean;
  color: string;
}

// Fix: Define the missing PracticePhaseProps interface
interface PracticePhaseProps {
  scenario: Scenario;
  targetWords: WordItem[];
  profile: UserProfile;
  duration: number;
  onFinish: (result: PracticeResult) => void;
}

const PracticePhase: React.FC<PracticePhaseProps> = ({ scenario, targetWords, profile, duration, onFinish }) => {
  const [usedWordIds, setUsedWordIds] = useState<Set<string>>(new Set());
  const [timeLeft, setTimeLeft] = useState(duration);
  const [balloons, setBalloons] = useState<Balloon[]>([]);
  const [liveTranscription, setLiveTranscription] = useState('');
  
  const containerRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sessionRef = useRef<any>(null);
  const transcriptRef = useRef('');
  // Fix: Use any instead of NodeJS.Timeout to resolve "Cannot find namespace 'NodeJS'" error in browser
  const timerRef = useRef<any>(null);
  // Add nextStartTime to track audio playback queue for smooth gapless playback as per Live API rules
  const nextStartTimeRef = useRef<number>(0);

  // Initialize Balloons
  useEffect(() => {
    const colors = ['#6366f1', '#a855f7', '#3b82f6', '#ec4899', '#10b981'];
    const initial = targetWords.map((w, i) => ({
      id: w.id,
      word: w,
      x: 10 + Math.random() * 80,
      y: 10 + Math.random() * 80,
      vx: (Math.random() - 0.5) * 0.2,
      vy: (Math.random() - 0.5) * 0.2,
      popped: false,
      color: colors[i % colors.length]
    }));
    setBalloons(initial);
  }, [targetWords]);

  // Balloon Physics Engine
  useEffect(() => {
    let animationFrame: number;
    const move = () => {
      setBalloons(prev => prev.map(b => {
        if (b.popped) return b;
        let nx = b.x + b.vx;
        let ny = b.y + b.vy;
        let nvx = b.vx;
        let nvy = b.vy;

        if (nx < 2 || nx > 98) nvx *= -1;
        if (ny < 2 || ny > 98) nvy *= -1;

        return { ...b, x: nx, y: ny, vx: nvx, vy: nvy };
      }));
      animationFrame = requestAnimationFrame(move);
    };
    animationFrame = requestAnimationFrame(move);
    return () => cancelAnimationFrame(animationFrame);
  }, []);

  // Timer logic
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleEnd();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => timerRef.current && clearInterval(timerRef.current);
  }, []);

  const handleEnd = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    sessionRef.current?.close();
    onFinish({
      usedWordIds: Array.from(usedWordIds),
      transcript: transcriptRef.current,
      duration: duration
    });
  };

  useEffect(() => {
    startLiveSession();
    return () => {
      sessionRef.current?.close();
      audioContextRef.current?.close();
    };
  }, []);

  const startLiveSession = async () => {
    // Create new instance right before call to ensure up-to-date API key
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    audioContextRef.current = outputAudioContext;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            const source = inputAudioContext.createMediaStreamSource(stream);
            const scriptProcessor = inputAudioContext.createScriptProcessor(2048, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const int16 = new Int16Array(inputData.length);
              for (let i = 0; i < inputData.length; i++) {
                // Ensure correct normalization for Int16 pcm
                int16[i] = inputData[i] * 32768;
              }
              // Solely rely on sessionPromise resolves as per guidelines
              sessionPromise.then(s => s.sendRealtimeInput({ 
                media: { 
                  data: encode(new Uint8Array(int16.buffer)), 
                  mimeType: 'audio/pcm;rate=16000' 
                } 
              }));
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputAudioContext.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio) {
              // Proper audio scheduling using nextStartTimeRef for seamless playback
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputAudioContext.currentTime);
              const audioBuffer = await decodeAudioData(decode(base64Audio), outputAudioContext, 24000, 1);
              const source = outputAudioContext.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(outputAudioContext.destination);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
            }

            if (message.serverContent?.interrupted) {
              // Reset scheduling on interruption
              nextStartTimeRef.current = 0;
            }

            if (message.serverContent?.inputTranscription) {
              const text = message.serverContent.inputTranscription.text;
              setLiveTranscription(text);
              transcriptRef.current += " " + text;
              
              // Word detection and pop logic
              targetWords.forEach(w => {
                if (new RegExp(`\\b${w.term}\\b`, 'gi').test(text)) {
                  setUsedWordIds(prev => {
                    const n = new Set(prev);
                    if (!n.has(w.id)) {
                      n.add(w.id);
                      setBalloons(bs => bs.map(b => b.id === w.id ? { ...b, popped: true } : b));
                    }
                    return n;
                  });
                }
              });
            }
          },
          onerror: (e) => console.error("Live API Error", e),
          onclose: (e) => console.log("Live API Session Closed", e)
        },
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: `Simulate ${scenario.counterpart}. Scenario Context: ${scenario.description}. User Profile: ${profile.archetype}. Keep responses professional and context-relevant.`,
          inputAudioTranscription: {},
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: profile.voiceName } }
          }
        }
      });
      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error("Live session setup failed", err);
    }
  };

  const timerColor = timeLeft < 20 ? 'text-rose-600 animate-pulse' : 'text-slate-900';
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div ref={containerRef} className="h-[calc(100vh-14rem)] relative overflow-hidden flex flex-col stagger-in">
      {/* Simulation HUD */}
      <div className="flex items-center justify-between p-10 z-20">
        <div>
          <h2 className="text-3xl font-black tracking-tighter">{scenario.counterpart}</h2>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Tactical Simulation Active</p>
        </div>
        
        <div className={`text-6xl font-[900] tabular-nums tracking-tighter transition-all duration-300 ${timerColor}`}>
          {minutes}:{seconds.toString().padStart(2, '0')}
        </div>
      </div>

      {/* Floating Word Balloons */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        {balloons.map(b => !b.popped && (
          <div
            key={b.id}
            className="absolute transition-all duration-500 flex flex-col items-center group"
            style={{ 
              left: `${b.x}%`, 
              top: `${b.y}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <div className="w-40 h-40 rounded-full flex items-center justify-center p-6 text-center shadow-2xl animate-breathe backdrop-blur-md border border-white/20" 
                 style={{ backgroundColor: `${b.color}20`, color: b.color }}>
              <span className="text-[10px] font-black uppercase tracking-widest leading-tight">{b.word.term}</span>
            </div>
            <div className="w-px h-16 bg-slate-200" />
          </div>
        ))}
      </div>

      {/* Live Text Area */}
      <div className="mt-auto p-12 z-20 flex flex-col items-center justify-center text-center">
        <div className="min-h-[100px] mb-8">
           <p className="text-4xl font-black text-slate-900 tracking-tighter leading-tight italic opacity-90 transition-all duration-700 max-w-4xl mx-auto">
             {liveTranscription ? `"${liveTranscription}"` : 'Establishing neural link...'}
           </p>
        </div>
        
        <button 
          onClick={handleEnd}
          className="bg-slate-900 text-white px-12 py-5 rounded-full font-black uppercase tracking-widest text-xs hover:bg-rose-600 transition-all"
        >
          Terminate Early
        </button>
      </div>

      {/* Progress Bar */}
      <div className="h-1 bg-slate-50 absolute bottom-0 left-0 right-0 z-30">
        <div className="h-full bg-slate-900 transition-all duration-500" style={{ width: `${(usedWordIds.size / targetWords.length) * 100}%` }} />
      </div>
    </div>
  );
};

export default PracticePhase;
