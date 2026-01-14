
import { GoogleGenAI, Type } from "@google/genai";

/**
 * Recupera la chiave API in modo ultra-resiliente per ambienti browser/Vite/Vercel
 */
const getApiKey = (): string => {
  // 1. Prova process.env (iniettato da Vite define)
  if (typeof process !== 'undefined' && process.env?.API_KEY) return process.env.API_KEY;
  
  // 2. Prova import.meta.env (standard Vite)
  const metaEnv = (import.meta as any).env;
  if (metaEnv?.VITE_API_KEY) return metaEnv.VITE_API_KEY;
  if (metaEnv?.API_KEY) return metaEnv.API_KEY;

  // 3. Fallback per debug (non loggare mai la chiave reale in produzione)
  console.error("AI CONFIG ERROR: API_KEY non rilevata nel runtime.");
  return "";
};

export const generateExecutiveReport = async (scanData: any) => {
  const apiKey = getApiKey();
  if (!apiKey) return "ERRORE DI SISTEMA: Chiave API non trovata. Inserire 'API_KEY' nelle variabili d'ambiente del provider (Vercel/Netlify).";
  
  const ai = new GoogleGenAI({ apiKey });
  const prompt = `Agisci come CISO IA. Analizza questi dati e produci un report in Italiano: ${JSON.stringify(scanData)}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "Report generato ma vuoto.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Connessione neurale fallita. Verifica i permessi della chiave API.";
  }
};

export const generateComplianceRoadmap = async (headers: any[]) => {
  const apiKey = getApiKey();
  if (!apiKey) return [];
  const ai = new GoogleGenAI({ apiKey });
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Genera checklist GDPR in JSON per questi header: ${JSON.stringify(headers)}`,
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
              status: { type: Type.STRING }
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
  if (!apiKey) return "Servizio IA non configurato.";
  const ai = new GoogleGenAI({ apiKey });
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Contesto: ${context}\nDomanda: ${query}`
    });
    return response.text || "Nessuna risposta ricevuta.";
  } catch (e) {
    return "Errore di comunicazione con Kore.";
  }
};

export const runThreatSimulation = async (type: string, posture: any, language: 'IT' | 'EN') => {
  const apiKey = getApiKey();
  if (!apiKey) return null;
  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Simula attacco ${type} in ${language} su: ${JSON.stringify(posture)}`,
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
