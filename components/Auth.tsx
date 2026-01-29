
import React, { useState, useEffect, useRef } from 'react';

interface AuthProps {
  onLogin: () => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const identifierRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    identifierRef.current?.focus();
  }, [isSignUp]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API delay for premium feel
    setTimeout(() => {
      localStorage.setItem('articulate_session', 'simulated_token_' + Date.now());
      onLogin();
      setIsLoading(false);
    }, 1200);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-6">
      <div className="max-w-md w-full stagger-in">
        <div className="text-center mb-16">
          <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center text-white font-black text-xl mx-auto mb-8 shadow-2xl rotate-3">
            A
          </div>
          <h1 className="text-7xl font-[900] text-slate-900 tracking-tighter mb-4">Access.</h1>
          <p className="text-slate-400 font-medium tracking-tight">Unlock your rhetorical potential.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-12">
          <section className="space-y-8">
            <div className="group">
              <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mb-4 block group-focus-within:text-slate-900 transition-colors">
                Email or Phone
              </label>
              <div className="premium-input-container">
                <input 
                  ref={identifierRef}
                  type="text" 
                  required 
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full bg-transparent border-none py-4 text-3xl font-black focus:outline-none placeholder:text-slate-100 scrolling-placeholder"
                  placeholder="name@domain.com"
                />
                <div className="custom-cursor-element"></div>
              </div>
              <div className="h-px w-full bg-slate-100 mt-2 relative overflow-hidden">
                <div className={`absolute inset-0 bg-slate-900 transition-transform duration-700 origin-left ${identifier ? 'scale-x-100' : 'scale-x-0'}`} />
              </div>
            </div>

            <div className="group">
              <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mb-4 block group-focus-within:text-slate-900 transition-colors">
                Security Key
              </label>
              <div className="premium-input-container">
                <input 
                  type="password" 
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-transparent border-none py-4 text-3xl font-black focus:outline-none placeholder:text-slate-100"
                  placeholder="••••••••"
                />
              </div>
              <div className="h-px w-full bg-slate-100 mt-2 relative overflow-hidden">
                <div className={`absolute inset-0 bg-slate-900 transition-transform duration-700 origin-left ${password ? 'scale-x-100' : 'scale-x-0'}`} />
              </div>
            </div>
          </section>

          <div className="pt-8">
            <button 
              type="submit"
              disabled={isLoading}
              className={`w-full py-8 rounded-full font-black text-xl transition-all shadow-2xl active:scale-95 flex items-center justify-center gap-4 ${identifier && password ? 'bg-slate-900 text-white animate-breathe hover:bg-black' : 'bg-slate-50 text-slate-200 pointer-events-none'}`}
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                isSignUp ? 'Initialize Profile' : 'Authorize Identity'
              )}
            </button>
          </div>

          <div className="text-center pt-4">
            <button 
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-slate-900 transition-colors"
            >
              {isSignUp ? 'Already have credentials? Log In' : 'New Identity? Create Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Auth;
