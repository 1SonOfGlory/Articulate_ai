
import React, { useState } from 'react';

interface PracticeSetupProps {
  onStart: (duration: number) => void;
}

const DURATIONS = [
  { label: 'Short', value: 60, desc: '1 Minute - Blitz Session' },
  { label: 'Standard', value: 180, desc: '3 Minutes - Core Drill' },
  { label: 'Full', value: 300, desc: '5 Minutes - Deep Immersion' },
  { label: 'Custom', value: 600, desc: '10 Minutes - Endurance' }
];

const PracticeSetup: React.FC<PracticeSetupProps> = ({ onStart }) => {
  const [selected, setSelected] = useState(180);

  return (
    <div className="max-w-4xl mx-auto py-24 px-6 text-center animate-in fade-in slide-in-from-bottom-12 duration-1000">
      <h1 className="text-7xl font-[900] text-slate-900 tracking-tighter mb-8">Calibration.</h1>
      <p className="text-slate-400 text-xl font-medium mb-16 max-w-xl mx-auto">Set your tactical window. How long do you need to secure the objective?</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-20">
        {DURATIONS.map(d => (
          <button
            key={d.value}
            onClick={() => setSelected(d.value)}
            className={`p-10 rounded-[3rem] border-2 text-left transition-all duration-500 group relative overflow-hidden ${selected === d.value ? 'border-slate-900 bg-slate-900 text-white shadow-2xl scale-[1.02]' : 'border-slate-100 bg-white text-slate-400 hover:border-slate-200'}`}
          >
            <div className="relative z-10">
              <span className={`text-[10px] font-black uppercase tracking-[0.4em] mb-4 block ${selected === d.value ? 'text-white/50' : 'text-slate-300'}`}>{d.label}</span>
              <h3 className="text-3xl font-black mb-2">{d.value / 60} Minutes</h3>
              <p className={`text-sm font-medium ${selected === d.value ? 'text-white/60' : 'text-slate-400'}`}>{d.desc}</p>
            </div>
          </button>
        ))}
      </div>

      <button 
        onClick={() => onStart(selected)}
        className="w-full bg-slate-900 text-white py-12 rounded-full font-black text-4xl shadow-2xl hover:bg-black transition-all active:scale-95 animate-breathe"
      >
        Ignite Simulation
      </button>
    </div>
  );
};

export default PracticeSetup;
