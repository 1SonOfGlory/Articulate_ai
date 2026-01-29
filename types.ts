
export interface UserProfile {
  name: string;
  archetype: string;
  challenges: string[];
  vocalStyle: string;
  voiceName: 'Kore' | 'Puck' | 'Charon' | 'Fenrir' | 'Zephyr';
  accentInstruction: string;
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert' | 'Legendary';
}

export interface WordItem {
  id: string;
  term: string;
  type: 'word' | 'phrase' | 'idiom';
  definition: string;
  pronunciation: string;
  usage: string;
}

export interface Scenario {
  id: string;
  title: string;
  description: string;
  counterpart: string;
  role: string;
  audience?: string;
  sourceMaterial?: string;
  strategicOutcome?: string;
  isCustom?: boolean;
}

export type AppStep = 'onboarding' | 'scenario-input' | 'learning' | 'practice-setup' | 'practice' | 'feedback';

export interface DetailedAnalysis {
  fillerWords: { word: string; count: number; impact: string }[];
  impressionAnalysis: string;
  contextualSuggestions: { original: string; suggested: string; reason: string }[];
  overallEvaluation: string;
  coachPersona: string;
}

export interface PracticeResult {
  usedWordIds: string[];
  transcript: string;
  duration: number;
}
