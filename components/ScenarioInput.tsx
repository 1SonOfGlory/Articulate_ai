import React, { useState, useEffect, useRef } from 'react';
import { Icons } from '../constants';

interface ScenarioInputProps {
  onSubmit: (goal: string, audience: string, material: string, outcome: string) => void;
  isLoading: boolean;
}

type Step = 'goal' | 'audience' | 'outcome' | 'material';

const ScenarioInput: React.FC<ScenarioInputProps> = ({ onSubmit, isLoading }) => {
  const [goal, setGoal] = useState('');
  const [audience, setAudience] = useState('');
  const [outcome, setOutcome] = useState('');
  const [material, setMaterial] = useState('');
  const [step, setStep] = useState<Step>('goal');

  const containerRef = useRef<HTMLDivElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const steps: Step[] = ['goal', 'audience', 'outcome', 'material'];
  const currentIndex = steps.indexOf(step);

  useEffect(() => {
    // Natural scroll to center architect box
    if (containerRef.current) {
      containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    // Maintain focus for blinking cursor
    if (textAreaRef.current) {
      textAreaRef.current.focus();
    }
  }, [step]);

  const goNext = () => {
    if (currentIndex < steps.length - 1) setStep(steps[currentIndex + 1]);
    else onSubmit(goal, audience, material, outcome);
  };

  const goBack = () => {
    if (currentIndex > 0) setStep(steps[currentIndex - 1]);
  };

  const isStepValid = () => {
    if (step === 'goal') return goal.length > 5;
    if (step === 'audience') return audience.length > 3;
    if (step === 'outcome') return outcome.length > 5;
    return true;
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (isStepValid()) goNext();
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-12 px-6 stagger-in">
      <div className="text-center mb-24">
        <span className="text-[10px] font-black tracking-[0.8em] uppercase text-slate-900 mb-8 block">Strategic Matrix</span>
        <h2 className="text-8xl font-[900] text-slate-900 tracking-tighter leading-tight mb-8">
          Architect.
        </h2>
        <p className="text-slate-400 text-xl max-w-2xl mx-auto font-medium leading-relaxed">
          Define the precise boundaries of your neural simulation.
        </p>
      </div>

      <div ref={containerRef} className="bg-white border border-slate-100 rounded-[5rem] shadow-[0_80px_160px_-40px_rgba(0,0,0,0.06)] overflow-hidden">
        {/* Progress Bar - Neural Scan Style */}
        <div className="h-2 bg-slate-50 relative">
           <div 
            className="h-full bg-slate-900 transition-all duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)]" 
            style={{ width: `${((currentIndex + 1) / steps.length) * 100}%` }}
           />
        </div>

        <div className="min-h-[550px] flex flex-col p-16 md:p-24">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-16">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-900" />
              <label className="text-[10px] font-black text-slate-900 uppercase tracking-[0.4em]">{step}</label>
            </div>

            <div className="animate-in fade-in slide-in-from-right-12 duration-1000">
                {step === 'goal' && (
                  <>
                    <h3 className="text-5xl font-black text-slate-900 tracking-tighter mb-12 leading-tight">Primary Objective?</h3>
                    <div className="premium-input-container">
                      <textarea 
                        ref={textAreaRef}
                        onKeyDown={handleKeyDown}
                        value={goal}
                        onChange={e => setGoal(e.target.value)}
                        placeholder="Type here..."
                        className="w-full bg-transparent border-none py-4 text-5xl text-slate-800 focus:outline-none placeholder:text-slate-100 font-black leading-tight h-56 resize-none scrolling-placeholder"
                      />
                      <div className="custom-cursor-element"></div>
                    </div>
                  </>
                )}

                {step === 'audience' && (
                  <>
                    <h3 className="text-5xl font-black text-slate-900 tracking-tighter mb-12 leading-tight">Identify Counterpart.</h3>
                    <div className="premium-input-container">
                      <textarea 
                        ref={textAreaRef}
                        onKeyDown={handleKeyDown}
                        value={audience}
                        onChange={e => setAudience(e.target.value)}
                        placeholder="Type here..."
                        className="w-full bg-transparent border-none py-4 text-5xl text-slate-800 focus:outline-none placeholder:text-slate-100 font-black leading-tight h-56 resize-none scrolling-placeholder"
                      />
                      <div className="custom-cursor-element"></div>
                    </div>
                  </>
                )}

                {step === 'outcome' && (
                  <>
                    <h3 className="text-5xl font-black text-slate-900 tracking-tighter mb-12 leading-tight">Win Condition.</h3>
                    <div className="premium-input-container">
                      <textarea 
                        ref={textAreaRef}
                        onKeyDown={handleKeyDown}
                        value={outcome}
                        onChange={e => setOutcome(e.target.value)}
                        placeholder="Type here..."
                        className="w-full bg-transparent border-none py-4 text-5xl text-slate-800 focus:outline-none placeholder:text-slate-100 font-black leading-tight h-56 resize-none scrolling-placeholder"
                      />
                      <div className="custom-cursor-element"></div>
                    </div>
                  </>
                )}

                {step === 'material' && (
                  <>
                    <h3 className="text-5xl font-black text-slate-900 tracking-tighter mb-12 leading-tight">Contextual Context.</h3>
                    <div className="premium-input-container">
                      <textarea 
                        ref={textAreaRef}
                        onKeyDown={handleKeyDown}
                        value={material}
                        onChange={e => setMaterial(e.target.value)}
                        placeholder="Type here..."
                        className="w-full bg-transparent border-none py-4 text-5xl text-slate-800 focus:outline-none placeholder:text-slate-100 font-black leading-tight h-56 resize-none scrolling-placeholder"
                      />
                      <div className="custom-cursor-element"></div>
                    </div>
                  </>
                )}
            </div>
          </div>

          <div className="flex justify-between items-center pt-16">
            <button 
              onClick={goBack}
              disabled={currentIndex === 0}
              className="text-slate-300 font-black text-[10px] uppercase tracking-[0.4em] hover:text-slate-900 transition-all disabled:opacity-0"
            >
              Back
            </button>
            
            <button 
              onClick={goNext}
              disabled={!isStepValid() || isLoading}
              className={`flex items-center gap-8 px-16 py-8 rounded-full font-black text-sm uppercase tracking-[0.2em] transition-all shadow-2xl ${
                isStepValid() 
                  ? 'bg-slate-900 text-white hover:scale-[1.05] active:scale-95 shadow-indigo-100' 
                  : 'bg-slate-50 text-slate-200 pointer-events-none'
              }`}
            >
              {isLoading ? 'ENCODING' : (step === 'material' ? 'INITIALIZE' : 'PROCEED')}
              <Icons.ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScenarioInput;