
import React from 'react';

interface HeaderProps {
  onLogoClick: () => void;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ onLogoClick, onLogout }) => {
  return (
    <header className="sticky top-0 z-50 glass-morphism">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <div 
          onClick={onLogoClick}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-6 h-6 bg-slate-900 rounded-md flex items-center justify-center text-white font-black text-[10px] group-hover:scale-110 transition-transform">
            A
          </div>
          <span className="font-extrabold text-sm tracking-tight text-slate-900">Articulate <span className="text-slate-400">/ Intelligence</span></span>
        </div>
        
        <nav className="flex items-center gap-8">
          <a href="#" className="text-[10px] font-black text-slate-400 hover:text-slate-900 uppercase tracking-widest transition-colors hidden md:block">Lab</a>
          <a href="#" className="text-[10px] font-black text-slate-400 hover:text-slate-900 uppercase tracking-widest transition-colors hidden md:block">Glossary</a>
          <button 
            onClick={onLogout}
            className="text-[10px] font-black text-rose-500 hover:text-rose-700 uppercase tracking-widest transition-colors"
          >
            Logout
          </button>
          <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200"></div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
