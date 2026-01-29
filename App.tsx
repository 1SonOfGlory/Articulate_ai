
import React, { useState, useEffect } from 'react';
import { AppStep, Scenario, WordItem, UserProfile, DetailedAnalysis, PracticeResult } from './types';
import { geminiService } from './services/geminiService';
import ProfileSetup from './components/ProfileSetup';
import ScenarioInput from './components/ScenarioInput';
import LearningPhase from './components/LearningPhase';
import PracticePhase from './components/PracticePhase';
import PracticeSetup from './components/PracticeSetup';
import FeedbackPhase from './components/FeedbackPhase';
import Header from './components/Header';
import Auth from './components/Auth';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [step, setStep] = useState<AppStep>('onboarding');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [curriculum, setCurriculum] = useState<WordItem[]>([]);
  const [practiceDuration, setPracticeDuration] = useState(180); // Default 3 mins
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<DetailedAnalysis | null>(null);

  // Check for session on mount
  useEffect(() => {
    const session = localStorage.getItem('articulate_session');
    if (session) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('articulate_session');
    setIsLoggedIn(false);
    setStep('onboarding');
    setProfile(null);
  };

  const handleProfileComplete = (userProfile: UserProfile) => {
    setProfile(userProfile);
    setStep('scenario-input');
  };

  const handleGenerateScenario = async (goal: string, audience: string, material: string, outcome: string) => {
    if (!profile) return;
    setIsLoading(true);
    try {
      const data = await geminiService.generateCustomScenario(profile, goal, audience, material, outcome);
      setSelectedScenario({ ...data.scenario, audience, sourceMaterial: material, strategicOutcome: outcome });
      setCurriculum(data.words);
      setStep('learning');
    } catch (err) {
      setError("Failed to architect your scenario.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePracticeComplete = async (result: PracticeResult) => {
    if (!profile || !selectedScenario) return;
    setIsLoading(true);
    setStep('feedback');
    try {
      const feedback = await geminiService.analyzeConversation(profile, selectedScenario, result);
      setAnalysis(feedback);
    } catch (err) {
      setError("Calibration report failed to generate.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isLoggedIn) {
    return <Auth onLogin={() => setIsLoggedIn(true)} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F9FAFB] text-slate-900 overflow-x-hidden selection:bg-indigo-100 selection:text-indigo-900">
      <Header onLogoClick={() => setStep('scenario-input')} onLogout={handleLogout} />
      
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8 md:py-12 relative">
        <div key={step} className="transition-all duration-700">
          {step === 'onboarding' && <ProfileSetup onComplete={handleProfileComplete} />}
          
          {step === 'scenario-input' && <ScenarioInput onSubmit={handleGenerateScenario} isLoading={isLoading} />}
          
          {step === 'learning' && selectedScenario && profile && (
            <LearningPhase scenario={selectedScenario} words={curriculum} onContinue={() => setStep('practice-setup')} profile={profile} />
          )}

          {step === 'practice-setup' && (
            <PracticeSetup 
              onStart={(duration) => {
                setPracticeDuration(duration);
                setStep('practice');
              }} 
            />
          )}
          
          {step === 'practice' && selectedScenario && profile && (
            <PracticePhase 
              scenario={selectedScenario} 
              targetWords={curriculum} 
              profile={profile} 
              duration={practiceDuration}
              onFinish={handlePracticeComplete} 
            />
          )}

          {step === 'feedback' && (
            <FeedbackPhase 
              analysis={analysis} 
              isLoading={isLoading}
              onRestart={() => setStep('scenario-input')} 
            />
          )}
        </div>

        {error && (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-red-900 text-white px-8 py-4 rounded-3xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-10">
            <span className="font-bold text-sm tracking-wide">{error}</span>
            <button onClick={() => setError(null)} className="ml-4 hover:opacity-70">&times;</button>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
