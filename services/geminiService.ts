
import { GoogleGenAI, Type } from "@google/genai";

// Standard initialization for @google/genai
const getAiClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const generateExecutiveReport = async (scanData: any) => {
  const ai = getAiClient();
  const prompt = `Sei un CISO esperto (Cyber Sentinel IA). Analizza i dati e genera un report Markdown professionale.
  Dati Scansione: ${JSON.stringify(scanData)}`;

  try {
    // Correct method: ai.models.generateContent with model and contents
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("AI Generation Error:", error);
    return "Errore nella generazione neurale del report.";
  }
};

export const generateComplianceRoadmap = async (headers: any[]) => {
  const ai = getAiClient();
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analizza questi header: ${JSON.stringify(headers)}. Genera checklist JSON per GDPR/NIST.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              category: { type: Type.STRING },
              requirement: { type: Type.STRING },
              status: { type: Type.STRING },
              linkedVulnerability: { type: Type.STRING }
            },
            required: ["id", "category", "requirement", "status"]
          }
        }
      }
    });
    return JSON.parse(response.text || "[]");
  } catch (e) {
    return [];
  }
};

export const askKoreWithRAG = async (query: string, context: string) => {
  const ai = getAiClient();
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Contesto: ${context}\nUtente: ${query}`
    });
    return response.text;
  } catch (e) {
    return "Connessione neurale fallita.";
  }
};

/**
 * Fix: Added language parameter to match usage in ThreatSimulator.tsx
 */
export const runThreatSimulation = async (type: string, posture: any, language: 'IT' | 'EN') => {
  const ai = getAiClient();

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Simula attacco ${type} su postura: ${JSON.stringify(posture)}. Rispondi in lingua: ${language}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            scenarioTitle: { type: Type.STRING },
            steps: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  time: { type: Type.STRING },
                  event: { type: Type.STRING },
                  impact: { type: Type.STRING }
                }
              }
            },
            defensiveVerdict: { type: Type.STRING },
            mitigationTip: { type: Type.STRING }
          }
        }
      }
    });
    return JSON.parse(response.text || "{}");
  } catch (e) {
    return null;
  }
};
