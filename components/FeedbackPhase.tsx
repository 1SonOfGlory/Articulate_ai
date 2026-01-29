
import React from 'react';
import { Icons } from '../constants';
import { DetailedAnalysis } from '../types';

interface FeedbackPhaseProps {
  analysis: DetailedAnalysis | null;
  isLoading: boolean;
  onRestart: () => void;
}

const FeedbackPhase: React.FC<FeedbackPhaseProps> = ({ analysis, isLoading, onRestart }) => {
  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-32 px-6 text-center">
        <div className="mb-12 flex justify-center">
           <div className="w-24 h-24 border-t-4 border-slate-900 rounded-full animate-spin" />
        </div>
        <h2 className="text-4xl font-black text-slate-900 tracking-tighter mb-4">Analyzing Calibration Data...</h2>
        <p className="text-slate-400 font-medium">Channeling insights from Simon Sinek & John Maxwell...</p>
      </div>
    );
  }

  if (!analysis) return null;

  return (
    <div className="max-w-5xl mx-auto py-12 px-6 stagger-in space-y-24 pb-32">
      {/* Summary Header */}
      <div className="text-center">
        <div className="w-24 h-24 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-10 shadow-sm border border-emerald-100">
          <Icons.Check className="w-12 h-12" />
        </div>
        <h1 className="text-7xl font-[900] text-slate-900 tracking-tighter mb-4">Strategic Review.</h1>
        <p className="text-slate-500 text-xl font-medium max-w-2xl mx-auto leading-relaxed">
          Your communication patterns have been mapped. Here is your path to elite articulation.
        </p>
      </div>

      {/* Coach Persona Quote */}
      <div className="bg-slate-900 rounded-[4rem] p-16 text-white relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 p-12 opacity-10">
           <Icons.Volume className="w-48 h-48 rotate-12" />
        </div>
        <div className="relative z-10 max-w-3xl">
          <h3 className="text-[10px] font-black uppercase tracking-[0.8em] text-slate-500 mb-8">Lead Coach Synthesis</h3>
          <p className="text-3xl font-bold leading-tight italic text-indigo-200 mb-10">
            "{analysis.overallEvaluation}"
          </p>
          <div className="flex items-center gap-6">
             <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-xs font-black">AI</div>
             <div>
               <p className="font-black uppercase tracking-widest text-[10px]">Linguistic Architect</p>
               <p className="text-xs text-slate-400">Persona: {analysis.coachPersona}</p>
             </div>
          </div>
        </div>
      </div>

      {/* Impression & Impact */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
        <div className="space-y-8">
           <h4 className="text-[10px] font-black uppercase tracking-[0.8em] text-slate-400">Impression Analysis</h4>
           <div className="bg-white border border-slate-100 p-10 rounded-[3rem] shadow-sm">
             <p className="text-lg text-slate-700 leading-relaxed font-medium italic">
                {analysis.impressionAnalysis}
             </p>
           </div>
        </div>

        <div className="space-y-8">
           <h4 className="text-[10px] font-black uppercase tracking-[0.8em] text-slate-400">The "Friction" Audit (Fillers)</h4>
           <div className="space-y-4">
              {analysis.fillerWords.map((f, i) => (
                <div key={i} className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 flex items-center justify-between">
                   <div>
                     <span className="text-2xl font-black text-slate-900 mr-4">"{f.word}"</span>
                     <span className="bg-rose-100 text-rose-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">{f.count} Uses</span>
                     <p className="text-xs text-slate-400 mt-2 font-medium">{f.impact}</p>
                   </div>
                </div>
              ))}
              {analysis.fillerWords.length === 0 && (
                <div className="bg-emerald-50 p-8 rounded-[2rem] border border-emerald-100 text-emerald-600 font-bold">
                  Perfect Signal-to-Noise Ratio. No filler words detected.
                </div>
              )}
           </div>
        </div>
      </div>

      {/* Contextual Suggestions */}
      <div className="space-y-12">
        <h4 className="text-[10px] font-black uppercase tracking-[0.8em] text-slate-400 text-center">Refinement Matrix</h4>
        <div className="grid grid-cols-1 gap-8">
           {analysis.contextualSuggestions.map((s, i) => (
             <div key={i} className="bg-white border border-slate-100 p-12 rounded-[4rem] shadow-sm flex flex-col md:flex-row gap-12 items-center">
                <div className="flex-1 space-y-4">
                  <span className="text-[10px] font-black text-rose-300 uppercase tracking-widest">Original Delivery</span>
                  <p className="text-xl text-slate-400 italic">"{s.original}"</p>
                </div>
                <div className="hidden md:block">
                   <Icons.ArrowRight className="w-8 h-8 text-slate-200" />
                </div>
                <div className="flex-1 space-y-4">
                  <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Optimized Articulation</span>
                  <p className="text-xl text-slate-900 font-black tracking-tight">"{s.suggested}"</p>
                  <p className="text-xs text-slate-400 leading-relaxed font-medium">{s.reason}</p>
                </div>
             </div>
           ))}
        </div>
      </div>

      {/* Restart CTA */}
      <div className="pt-24 text-center">
        <button 
          onClick={onRestart}
          className="bg-slate-900 text-white px-20 py-8 rounded-full font-black text-xl hover:bg-black shadow-[0_40px_100px_-20px_rgba(0,0,0,0.15)] transition-all active:scale-95 animate-breathe"
        >
          Begin Next Simulation
        </button>
      </div>
    </div>
  );
};

export default FeedbackPhase;
