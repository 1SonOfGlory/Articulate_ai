
import React from 'react';
import { Scenario } from '../types';
import { Icons } from '../constants';

interface ScenarioSelectorProps {
  scenarios: Scenario[];
  onSelect: (scenario: Scenario) => void;
}

const ScenarioSelector: React.FC<ScenarioSelectorProps> = ({ scenarios, onSelect }) => {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 mb-4">Choose your arena.</h1>
        <p className="text-slate-500 text-lg max-w-2xl mx-auto">
          Select a high-stakes scenario to master specific vocabulary and communication patterns.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {scenarios.map((s) => (
          <div 
            key={s.id}
            onClick={() => onSelect(s)}
            className="group relative p-8 bg-white border border-slate-200 rounded-3xl cursor-pointer hover:border-indigo-400 hover:shadow-2xl hover:shadow-indigo-100 transition-all duration-300 transform hover:-translate-y-1"
          >
            <div className="flex justify-between items-start mb-6">
              <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
                <Icons.Play className="w-6 h-6" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-widest text-slate-400 group-hover:text-indigo-400">Simulation</span>
            </div>
            
            <h3 className="text-2xl font-bold text-slate-800 mb-2">{s.title}</h3>
            <p className="text-slate-500 leading-relaxed mb-8">{s.description}</p>
            
            <div className="flex items-center justify-between pt-6 border-t border-slate-50">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Opponent</span>
                <span className="text-sm font-semibold text-slate-700">{s.counterpart}</span>
              </div>
              <div className="flex items-center gap-2 text-indigo-600 font-bold group-hover:translate-x-1 transition-transform">
                <span>Start Session</span>
                <Icons.ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScenarioSelector;
