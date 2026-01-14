
import { GoogleGenAI, Type } from "@google/genai";

// Sistema di recupero chiave multi-strato (standard, Vite, o window)
const getApiKey = () => {
  const key = process.env.API_KEY || (import.meta as any).env?.VITE_API_KEY || "";
  if (!key) console.error("FATAL: API_KEY non trovata nell'ambiente.");
  return key;
};

export const generateExecutiveReport = async (scanData: any) => {
  const apiKey = getApiKey();
  if (!apiKey) return "ERRORE: API_KEY non configurata. Inseriscila nelle impostazioni del provider.";
  
  const ai = new GoogleGenAI({ apiKey });
  const prompt = `Sei l'IA Cyber Sentinel v1.1.0. Analizza i dati e genera un report tecnico ma leggibile per un CEO. Lingua: Italiano. Dati: ${JSON.stringify(scanData)}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    return "Errore critico durante la generazione del report neurale.";
  }
};

export const generateComplianceRoadmap = async (headers: any[]) => {
  const apiKey = getApiKey();
  if (!apiKey) return [];
  const ai = new GoogleGenAI({ apiKey });
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analizza questi header per conformità GDPR/NIST: ${JSON.stringify(headers)}`,
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
  const apiKey = getApiKey();
  if (!apiKey) return "Connessione IA non disponibile.";
  const ai = new GoogleGenAI({ apiKey });
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Contesto: ${context}\nUtente: ${query}`
    });
    return response.text;
  } catch (e) {
    return "Errore di link neurale.";
  }
};

export const runThreatSimulation = async (type: string, posture: any, language: 'IT' | 'EN') => {
  const apiKey = getApiKey();
  if (!apiKey) return null;
  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Simula attacco ${type} in lingua ${language} basandoti su: ${JSON.stringify(posture)}`,
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
