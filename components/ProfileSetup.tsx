import React, { useState, useEffect, useRef } from 'react';
import { UserProfile } from '../types';
import { geminiService } from '../services/geminiService';
import { Icons } from '../constants';

interface ProfileSetupProps {
  onComplete: (profile: UserProfile) => void;
}

type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert' | 'Legendary';
type SetupSection = 'name' | 'archetype' | 'voice' | 'difficulty' | 'submit';

const QUOTES = [
  "Words are the wings of the mind.",
  "The limits of my language mean the limits of my world.",
  "Precision of communication is the beginning of wisdom.",
  "Eloquence is the power to translate a truth into language.",
  "Your voice is the primary instrument of your influence.",
  "Rhetoric is the art of ruling the minds of men.",
  "Speak so that I may see thee."
];

const VOICES = [
  { id: 'Kore', name: 'Kore', label: 'Balanced' },
  { id: 'Puck', name: 'Puck', label: 'Dynamic' },
  { id: 'Zephyr', name: 'Zephyr', label: 'Fluid' },
  { id: 'Fenrir', name: 'Fenrir', label: 'Deep' },
  { id: 'Charon', name: 'Charon', label: 'Solid' }
] as const;

const DIFFICULTY_LEVELS: { level: Difficulty; desc: string; color: string }[] = [
  { level: 'Beginner', desc: 'Core', color: 'bg-slate-900' },
  { level: 'Intermediate', desc: 'Flow', color: 'bg-indigo-600' },
  { level: 'Advanced', desc: 'Elite', color: 'bg-blue-600' },
  { level: 'Expert', desc: 'Master', color: 'bg-purple-600' },
  { level: 'Legendary', desc: 'Zenith', color: 'bg-rose-600' },
];

const ProfileSetup: React.FC<ProfileSetupProps> = ({ onComplete }) => {
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    archetype: '',
    challenges: [],
    vocalStyle: 'Measured & Clear',
    voiceName: 'Kore',
    accentInstruction: 'Speak with a natural, sophisticated Ghanaian accent',
    difficulty: 'Intermediate'
  });
  
  const [activeSection, setActiveSection] = useState<SetupSection>('name');
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [quoteIdx, setQuoteIdx] = useState(0);
  const [isQuoteExiting, setIsQuoteExiting] = useState(false);
  
  const [focusedVoiceIdx, setFocusedVoiceIdx] = useState<number | null>(null);
  const [focusedDiffIdx, setFocusedDiffIdx] = useState<number | null>(null);

  // Refs for auto-scrolling
  const nameRef = useRef<HTMLElement>(null);
  const archetypeRef = useRef<HTMLElement>(null);
  const voiceRef = useRef<HTMLElement>(null);
  const difficultyRef = useRef<HTMLElement>(null);
  const submitRef = useRef<HTMLButtonElement>(null);

  const sections: SetupSection[] = ['name', 'archetype', 'voice', 'difficulty', 'submit'];

  useEffect(() => {
    const interval = setInterval(() => {
      setIsQuoteExiting(true);
      setTimeout(() => {
        setQuoteIdx(prev => (prev + 1) % QUOTES.length);
        setIsQuoteExiting(false);
      }, 1000);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // Smooth auto-scroll when section changes
  useEffect(() => {
    const sectionMap: Record<SetupSection, React.RefObject<HTMLElement | null>> = {
      name: nameRef,
      archetype: archetypeRef,
      voice: voiceRef,
      difficulty: difficultyRef,
      submit: submitRef as any
    };
    
    const target = sectionMap[activeSection]?.current;
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      // Auto-focus inputs if the section is an input
      if (activeSection === 'name' || activeSection === 'archetype') {
        const input = target.querySelector('input');
        if (input) input.focus();
      }
    }
  }, [activeSection]);

  // Keyboard navigation logic
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const currentIndex = sections.indexOf(activeSection);

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        const nextIndex = Math.min(currentIndex + 1, sections.length - 1);
        setActiveSection(sections[nextIndex]);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const prevIndex = Math.max(currentIndex - 1, 0);
        setActiveSection(sections[prevIndex]);
      } else if (e.key === 'Enter') {
        if (activeSection === 'submit' || (profile.name && profile.archetype && activeSection === 'difficulty')) {
          handleSubmit(new Event('submit') as any);
        } else {
          const nextIndex = Math.min(currentIndex + 1, sections.length - 1);
          setActiveSection(sections[nextIndex]);
        }
      }

      // Voice selection arrow keys
      if (activeSection === 'voice') {
        const currentVoiceIdx = VOICES.findIndex(v => v.id === profile.voiceName);
        if (e.key === 'ArrowRight') {
          const nextIdx = (currentVoiceIdx + 1) % VOICES.length;
          setProfile(p => ({ ...p, voiceName: VOICES[nextIdx].id }));
        } else if (e.key === 'ArrowLeft') {
          const prevIdx = (currentVoiceIdx - 1 + VOICES.length) % VOICES.length;
          setProfile(p => ({ ...p, voiceName: VOICES[prevIdx].id }));
        }
      }

      // Difficulty selection arrow keys
      if (activeSection === 'difficulty') {
        const currentDiffIdx = DIFFICULTY_LEVELS.findIndex(d => d.level === profile.difficulty);
        if (e.key === 'ArrowRight') {
          const nextIdx = (currentDiffIdx + 1) % DIFFICULTY_LEVELS.length;
          setProfile(p => ({ ...p, difficulty: DIFFICULTY_LEVELS[nextIdx].level }));
        } else if (e.key === 'ArrowLeft') {
          const prevIdx = (currentDiffIdx - 1 + DIFFICULTY_LEVELS.length) % DIFFICULTY_LEVELS.length;
          setProfile(p => ({ ...p, difficulty: DIFFICULTY_LEVELS[prevIdx].level }));
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeSection, profile]);

  // Liquid shifting logic for Voice
  const activeVoiceIdx = VOICES.findIndex(v => v.id === profile.voiceName);
  const displayVoiceIdx = focusedVoiceIdx !== null ? focusedVoiceIdx : activeVoiceIdx;

  // Liquid shifting logic for Difficulty
  const activeDiffIdx = DIFFICULTY_LEVELS.findIndex(d => d.level === profile.difficulty);
  const displayDiffIdx = focusedDiffIdx !== null ? focusedDiffIdx : activeDiffIdx;

  const handlePreview = async () => {
    if (isPreviewing) return;
    setIsPreviewing(true);
    try {
      const text = `Acoustic calibration successful. ${profile.name || 'User'} protocol active.`;
      const audioBytes = await geminiService.speak(text, profile);
      if (audioBytes) {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        const dataInt16 = new Int16Array(audioBytes.buffer);
        const buffer = audioContext.createBuffer(1, dataInt16.length, 24000);
        const channelData = buffer.getChannelData(0);
        for (let i = 0; i < dataInt16.length; i++) channelData[i] = dataInt16[i] / 32768.0;
        const source = audioContext.createBufferSource();
        source.buffer = buffer;
        source.connect(audioContext.destination);
        source.onended = () => setIsPreviewing(false);
        source.start();
      } else setIsPreviewing(false);
    } catch (e) {
      setIsPreviewing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (profile.name && profile.archetype) onComplete(profile);
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <div className="text-center mb-16 stagger-in" style={{ animationDelay: '0.1s' }}>
        <h1 className="text-8xl font-[900] tracking-tighter text-slate-900 mb-6">Identity.</h1>
        <p className="text-slate-400 text-xl font-medium tracking-tight">Design your neural and acoustic fingerprint.</p>
      </div>

      <div className="relative mb-32 h-20 flex items-center justify-center stagger-in" style={{ animationDelay: '0.2s' }}>
         <div className={`relative z-10 text-center transition-all duration-1000 ${isQuoteExiting ? 'quote-exit' : 'quote-transition'}`}>
            <p className="text-2xl font-semibold italic text-slate-800 tracking-tight leading-relaxed max-w-2xl mx-auto">
              "{QUOTES[quoteIdx]}"
            </p>
         </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-48 pb-64">
        {/* Step 1: Signature */}
        <section 
          ref={nameRef}
          onClick={() => setActiveSection('name')}
          className={`stagger-in section-focus ${activeSection === 'name' ? 'opacity-100 scale-100' : 'opacity-30 scale-95'} transition-all duration-1000`} 
          style={{ animationDelay: '0.3s' }}
        >
           <div className="flex items-center gap-4 mb-12">
             <div className="w-1.5 h-1.5 rounded-full bg-slate-900"></div>
             <h2 className="text-[10px] font-black uppercase tracking-[0.8em] text-slate-900">01 SIGNATURE</h2>
           </div>
           <div className="premium-input-container group">
              <input 
                type="text" required value={profile.name}
                onFocus={() => setActiveSection('name')}
                onChange={e => setProfile({...profile, name: e.target.value})}
                className="w-full bg-transparent border-none py-6 text-7xl font-black focus:outline-none placeholder:text-slate-100 transition-all scrolling-placeholder"
                placeholder="Full Name"
              />
              <div className="custom-cursor-element"></div>
           </div>
           <div className="h-[2px] w-full bg-slate-50 mt-2 relative">
             <div className={`absolute inset-0 bg-slate-900 transition-transform duration-1000 origin-left ${profile.name ? 'scale-x-100' : 'scale-x-0'}`} />
           </div>
        </section>

        {/* Step 2: Persona */}
        <section 
          ref={archetypeRef}
          onClick={() => setActiveSection('archetype')}
          className={`stagger-in section-focus ${activeSection === 'archetype' ? 'opacity-100 scale-100' : 'opacity-30 scale-95'} transition-all duration-1000`} 
          style={{ animationDelay: '0.4s' }}
        >
           <div className="flex items-center gap-4 mb-12">
             <div className="w-1.5 h-1.5 rounded-full bg-slate-900"></div>
             <h2 className="text-[10px] font-black uppercase tracking-[0.8em] text-slate-900">02 STRATEGIC PERSONA</h2>
           </div>
           <div className="premium-input-container">
              <input 
                type="text" required value={profile.archetype}
                onFocus={() => setActiveSection('archetype')}
                onChange={e => setProfile({...profile, archetype: e.target.value})}
                className="w-full bg-transparent border-none py-6 text-6xl font-black focus:outline-none placeholder:text-slate-100 transition-all scrolling-placeholder"
                placeholder="e.g. Founder"
              />
              <div className="custom-cursor-element"></div>
           </div>
           <div className="h-[2px] w-full bg-slate-50 mt-2 relative">
             <div className={`absolute inset-0 bg-indigo-600 transition-transform duration-1000 origin-left ${profile.archetype ? 'scale-x-100' : 'scale-x-0'}`} />
           </div>
           <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest mt-6">Input your professional archetype for context-aware simulation.</p>
        </section>

        {/* Step 3: Voice - Fluid Shifting */}
        <section 
          ref={voiceRef}
          onClick={() => setActiveSection('voice')}
          className={`stagger-in section-focus ${activeSection === 'voice' ? 'opacity-100 scale-100' : 'opacity-30 scale-95'} transition-all duration-1000`} 
          style={{ animationDelay: '0.5s' }}
        >
           <div className="flex items-center justify-between mb-12">
             <div className="flex items-center gap-4">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-900"></div>
                <h2 className="text-[10px] font-black uppercase tracking-[0.8em] text-slate-900">03 ACOUSTIC MODEL</h2>
             </div>
             <button 
                type="button" onClick={handlePreview} disabled={isPreviewing}
                className="flex items-center gap-3 text-[10px] font-black text-slate-900 uppercase tracking-widest hover:opacity-50 transition-opacity"
              >
                <Icons.Volume className={`w-3.5 h-3.5 ${isPreviewing ? 'animate-pulse' : ''}`} />
                Neural Scan
              </button>
           </div>
           
           <div className="relative bg-slate-50 p-1.5 rounded-[3rem] flex items-center justify-between h-24 overflow-hidden border border-slate-100">
              {/* Fluid Shifting Pill - Liquified Motion */}
              <div 
                className={`absolute h-[calc(100%-1.5rem)] fluid-pill rounded-[2.5rem] shadow-2xl bg-slate-900`}
                style={{ 
                  width: 'calc(20% - 0.8rem)',
                  left: `calc(${displayVoiceIdx * 20}% + 0.4rem)`,
                  boxShadow: '0 20px 40px -10px rgba(0,0,0,0.2)',
                  transform: `scale(${focusedVoiceIdx !== null ? 1.05 : 1})`,
                }}
              />

              {VOICES.map((voice, idx) => (
                <button
                  key={voice.id}
                  type="button"
                  onMouseEnter={() => setFocusedVoiceIdx(idx)}
                  onMouseLeave={() => setFocusedVoiceIdx(null)}
                  onClick={() => {
                    setProfile({...profile, voiceName: voice.id});
                    setActiveSection('voice');
                  }}
                  className="relative z-10 w-1/5 h-full flex flex-col items-center justify-center"
                >
                  <span className={`text-[10px] font-black uppercase mb-1 tracking-[0.2em] transition-colors duration-500 ${displayVoiceIdx === idx ? 'text-white' : 'text-slate-400'}`}>
                    {voice.name}
                  </span>
                  <span className={`text-[8px] font-bold opacity-50 transition-colors duration-500 uppercase tracking-widest ${displayVoiceIdx === idx ? 'text-white/60' : 'text-slate-300'}`}>
                    {voice.label}
                  </span>
                </button>
              ))}
           </div>
        </section>

        {/* Step 4: Load - Fluid Color Shifting */}
        <section 
          ref={difficultyRef}
          onClick={() => setActiveSection('difficulty')}
          className={`stagger-in section-focus ${activeSection === 'difficulty' ? 'opacity-100 scale-100' : 'opacity-30 scale-95'} transition-all duration-1000`} 
          style={{ animationDelay: '0.6s' }}
        >
           <div className="flex items-center gap-4 mb-12">
             <div className="w-1.5 h-1.5 rounded-full bg-slate-900"></div>
             <h2 className="text-[10px] font-black uppercase tracking-[0.8em] text-slate-900">04 COGNITIVE LOAD</h2>
           </div>
           
           <div className="relative bg-slate-50 p-1.5 rounded-[3rem] flex items-center justify-between h-24 overflow-hidden border border-slate-100">
              {/* Fluid Shifting Color Pill */}
              <div 
                className={`absolute h-[calc(100%-1.5rem)] fluid-pill rounded-[2.5rem] shadow-2xl ${DIFFICULTY_LEVELS[displayDiffIdx].color}`}
                style={{ 
                  width: 'calc(20% - 0.8rem)',
                  left: `calc(${displayDiffIdx * 20}% + 0.4rem)`,
                  boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
                  transform: `scale(${focusedDiffIdx !== null ? 1.05 : 1})`,
                }}
              />

              {DIFFICULTY_LEVELS.map((d, idx) => (
                <button
                  key={d.level}
                  type="button"
                  onMouseEnter={() => setFocusedDiffIdx(idx)}
                  onMouseLeave={() => setFocusedDiffIdx(null)}
                  onClick={() => {
                    setProfile({ ...profile, difficulty: d.level });
                    setActiveSection('difficulty');
                  }}
                  className="relative z-10 w-1/5 h-full flex flex-col items-center justify-center group"
                >
                  <span className={`text-[10px] font-black uppercase mb-1 tracking-[0.2em] transition-colors duration-500 ${displayDiffIdx === idx ? 'text-white' : 'text-slate-400'}`}>
                    {d.level}
                  </span>
                  <span className={`text-[8px] font-bold opacity-50 transition-colors duration-500 uppercase tracking-widest ${displayDiffIdx === idx ? 'text-white/60' : 'text-slate-300'}`}>
                    {d.desc}
                  </span>
                </button>
              ))}
           </div>
        </section>

        <div className="pt-20 stagger-in" style={{ animationDelay: '0.7s' }}>
          <button 
            ref={submitRef}
            type="submit"
            onMouseEnter={() => setActiveSection('submit')}
            className={`w-full py-12 rounded-full font-black text-4xl transition-all shadow-2xl active:scale-95 ${profile.name && profile.archetype ? 'bg-slate-900 text-white animate-breathe hover:bg-black' : 'bg-slate-50 text-slate-200 pointer-events-none opacity-20'}`}
          >
            Engage Protocol
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileSetup;