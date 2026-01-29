
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { WordItem, Scenario, UserProfile, DetailedAnalysis, PracticeResult } from "../types";

export const geminiService = {
  async generateCustomScenario(
    profile: UserProfile, 
    rawGoal: string, 
    audience: string = "General", 
    material: string = "",
    outcome: string = "General Proficiency"
  ): Promise<{ scenario: Scenario, words: WordItem[] }> {
    const difficulty = profile.difficulty || 'Intermediate';
    
    // Initialize GoogleGenAI instance inside the method to ensure it uses the current process.env.API_KEY
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `You are a world-class communications coach and rhetorical expert.
      User Profile: ${JSON.stringify(profile)}
      Intention: "${rawGoal}"
      Target Audience: "${audience}"
      Strategic Outcome Goal: "${outcome}"
      Difficulty Level: "${difficulty}"
      Source Material: "${material.substring(0, 2000)}" 
      
      Task:
      1. Create a simulation scenario.
      2. Select 5 target words/phrases/idioms based on difficulty.
      
      Return JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            scenario: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                counterpart: { type: Type.STRING },
                role: { type: Type.STRING }
              },
              required: ['id', 'title', 'description', 'counterpart', 'role']
            },
            words: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  term: { type: Type.STRING },
                  type: { type: Type.STRING, enum: ['word', 'phrase', 'idiom'] },
                  definition: { type: Type.STRING },
                  pronunciation: { type: Type.STRING },
                  usage: { type: Type.STRING }
                },
                required: ['id', 'term', 'type', 'definition', 'pronunciation', 'usage']
              }
            }
          }
        }
      }
    });

    try {
      // Access the response text property directly (not as a method)
      return JSON.parse(response.text || '{}');
    } catch (e) {
      console.error("Failed to parse custom scenario", e);
      throw e;
    }
  },

  async analyzeConversation(profile: UserProfile, scenario: Scenario, result: PracticeResult): Promise<DetailedAnalysis> {
    // Initialize GoogleGenAI instance inside the method to ensure it uses the current process.env.API_KEY
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `You are an elite communications coach (channeling the wisdom of Simon Sinek, John Maxwell, and James Clear).
      
      User Profile: ${profile.name}, a ${profile.archetype}.
      Scenario: ${scenario.title} - ${scenario.description}.
      Transcript: "${result.transcript}"
      Target Words Used: ${result.usedWordIds.length}
      
      Task: Provide a detailed, professional, yet encouraging assessment.
      1. Identify filler words (um, uh, like, etc.), count them, and explain how they specifically impede clarity in this context.
      2. Analyze the impression the user's speech creates (Confidence, Competence, Warmth).
      3. Give 3 contextual suggestions: specific sentences where they could have used better words or used the target words more effectively.
      4. Provide an overall evaluation and a path to improvement.
      
      Return JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            fillerWords: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  word: { type: Type.STRING },
                  count: { type: Type.NUMBER },
                  impact: { type: Type.STRING }
                }
              }
            },
            impressionAnalysis: { type: Type.STRING },
            contextualSuggestions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  original: { type: Type.STRING },
                  suggested: { type: Type.STRING },
                  reason: { type: Type.STRING }
                }
              }
            },
            overallEvaluation: { type: Type.STRING },
            coachPersona: { type: Type.STRING }
          }
        }
      }
    });

    // Access the response text property directly (not as a method)
    return JSON.parse(response.text || '{}');
  },

  async speak(text: string, profile: UserProfile): Promise<Uint8Array | undefined> {
    const prompt = `${profile.accentInstruction}: ${text}`;
    // Initialize GoogleGenAI instance inside the method to ensure it uses the current process.env.API_KEY
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: profile.voiceName },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) return undefined;
    
    const binaryString = atob(base64Audio);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }
};
