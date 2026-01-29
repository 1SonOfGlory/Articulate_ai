import React, { useState, useEffect, useRef } from 'react';
import { WordItem, Scenario, UserProfile } from '../types';
import { Icons } from '../constants';
import { geminiService } from '../services/geminiService';

interface LearningPhaseProps {
  scenario: Scenario;
  words: WordItem[];
  profile: UserProfile;
  onContinue: () => void;
}

const LearningPhase: React.FC<LearningPhaseProps> = ({ scenario, words, profile, onContinue }) => {
  const [activeIdx, setActiveIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const activeWord = words[activeIdx];
  const pageRef = useRef<HTMLDivElement>(null);
  const matrixRef = useRef<HTMLDivElement>(null);

  // Auto-scroll hint logic: Gently "bounces" the scroll to show more content after 2 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      window.scrollBy({ top: 120, behavior: 'smooth' });
      // Gentle bounce back after a moment to pique curiosity without being annoying
      setTimeout(() => {
        window.scrollBy({ top: -40, behavior: 'smooth' });
      }, 800);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        if (activeIdx < words.length - 1) setActiveIdx(prev => prev + 1);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        if (activeIdx > 0) setActiveIdx(prev => prev - 1);
      } else if (e.key === 'Enter') {
        if (activeIdx === words.length - 1) onContinue();
        else setActiveIdx(prev => prev + 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIdx, words, onContinue]);

  const handlePronounce = async () => {
    if (isPlaying) return;
    setIsPlaying(true);
    try {
      const audioBytes = await geminiService.speak(activeWord.term, profile);
      if (audioBytes) {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        const dataInt16 = new Int16Array(audioBytes.buffer);
        const buffer = audioContext.createBuffer(1, dataInt16.length, 24000);
        const channelData = buffer.getChannelData(0);
        for (let i = 0; i < dataInt16.length; i++) {
          channelData[i] = dataInt16[i] / 32768.0;
        }
        const source = audioContext.createBufferSource();
        source.buffer = buffer;
        source.connect(audioContext.destination);
        source.onended = () => setIsPlaying(false);
        source.start();
      }
    } catch (e) {
      setIsPlaying(false);
    }
  };

  const displayIdx = hoveredIdx !== null ? hoveredIdx : activeIdx;
  const itemHeight = 114; // Based on p-8 + text-sm + border
  const gap = 12; // space-y-3 is 0.75rem = 12px

  return (
    <div ref={pageRef} className="py-8 min-h-screen">
      <div className="flex items-center justify-between mb-16 stagger-in" style={{ animationDelay: '0.1s' }}>
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Encoding Targets.</h2>
          <p className="text-slate-400 font-medium tracking-tight">Priming specific rhetorical tools for your scenario.</p>
        </div>
        <div className="bg-slate-50 px-6 py-3 rounded-full border border-slate-100 shadow-sm">
          <span className="text-xs font-black text-slate-900 tracking-widest">{activeIdx + 1} OF {words.length}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start pb-32">
        {/* Main Content Card */}
        <div className="lg:col-span-8 stagger-in" style={{ animationDelay: '0.2s' }}>
          <div className="bg-white border border-slate-100 rounded-[4rem] p-12 md:p-20 min-h-[600px] flex flex-col justify-center relative overflow-hidden shadow-[0_40px_100px_-20px_rgba(0,0,0,0.04)]">
            <div className="flex items-center gap-6 mb-12">
              <span className="px-5 py-2 bg-slate-900 text-white rounded-full text-[10px] font-black uppercase tracking-[0.2em]">
                {activeWord.type}
              </span>
              <button 
                onClick={handlePronounce}
                disabled={isPlaying}
                className="flex items-center gap-3 text-[10px] font-black text-slate-900 uppercase tracking-widest hover:opacity-50 transition-all"
              >
                <Icons.Volume className={`w-4 h-4 ${isPlaying ? 'animate-pulse' : ''}`} />
                {isPlaying ? 'Synthesizing...' : 'Neural Scan Audio'}
              </button>
            </div>

            <h1 className="text-7xl md:text-8xl font-black text-slate-900 mb-6 tracking-tighter leading-none">
              {activeWord.term}
            </h1>
            
            <p className="text-xl text-slate-200 font-medium mb-12 font-mono italic tracking-wide">
              /{activeWord.pronunciation}/
            </p>

            <div className="space-y-12">
              <div className="max-w-xl">
                <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.4em] mb-4">Semantic Core</h4>
                <p className="text-3xl text-slate-800 leading-tight font-black italic tracking-tight">
                  "{activeWord.definition}"
                </p>
              </div>

              <div className="max-w-xl">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-4">Strategic Usage</h4>
                <p className="text-lg text-slate-500 leading-relaxed font-medium">
                  {activeWord.usage}
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-16 flex justify-between items-center px-4">
            <button 
              disabled={activeIdx === 0}
              onClick={() => setActiveIdx(prev => Math.max(0, prev - 1))}
              className="text-slate-300 hover:text-slate-900 font-black uppercase text-[10px] tracking-widest disabled:opacity-20 transition-all"
            >
              Previous Target
            </button>
            
            <button 
              onClick={() => activeIdx < words.length - 1 ? setActiveIdx(prev => prev + 1) : onContinue()}
              className="bg-slate-900 text-white px-16 py-8 rounded-full font-black hover:bg-black shadow-2xl transition-all active:scale-95 text-sm uppercase tracking-widest animate-breathe"
            >
              {activeIdx < words.length - 1 ? 'Next Term' : 'Commence Practice'}
            </button>
          </div>
        </div>

        {/* Sidebar Knowledge Matrix - Fluid Vertical Selection */}
        <div className="lg:col-span-4 space-y-4 stagger-in" style={{ animationDelay: '0.3s' }}>
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.8em] mb-8 px-2">Knowledge Matrix</h4>
          
          <div ref={matrixRef} className="relative space-y-3 p-1.5 bg-slate-50 rounded-[3rem] border border-slate-100 overflow-hidden">
            {/* Liquid Shifting Vertical Pill */}
            <div 
              className="absolute fluid-pill rounded-[2.5rem] shadow-2xl bg-slate-900"
              style={{ 
                left: '6px',
                right: '6px',
                height: `${itemHeight}px`,
                top: `${6 + displayIdx * (itemHeight + gap)}px`,
                boxShadow: '0 20px 40px -10px rgba(0,0,0,0.15)',
                transition: 'top 0.7s var(--fluid-ease), background-color 0.8s var(--apple-ease)'
              }}
            />

            {words.map((w, idx) => (
              <button 
                key={w.id}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                onClick={() => setActiveIdx(idx)}
                style={{ height: `${itemHeight}px` }}
                className={`relative z-10 w-full p-8 rounded-[2.5rem] transition-all duration-700 flex items-center justify-between group`}
              >
                <div className="flex flex-col items-start">
                  <span className={`font-black text-sm tracking-[0.1em] uppercase transition-colors duration-500 ${displayIdx === idx ? 'text-white' : 'text-slate-400'}`}>
                    {w.term}
                  </span>
                  <span className={`text-[9px] font-bold uppercase tracking-widest mt-1 transition-colors duration-500 ${displayIdx === idx ? 'text-white/40' : 'text-slate-300'}`}>
                    {w.type}
                  </span>
                </div>
                
                {idx < activeIdx ? (
                  <Icons.Check className={`w-4 h-4 transition-colors duration-500 ${displayIdx === idx ? 'text-emerald-400' : 'text-emerald-500 opacity-30'}`} />
                ) : displayIdx === idx ? (
                  <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                ) : null}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearningPhase;