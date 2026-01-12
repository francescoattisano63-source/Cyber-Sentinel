
import { GoogleGenAI, Type } from "@google/genai";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateExecutiveReport = async (scanData: any, language: 'IT' | 'EN' = 'IT') => {
  const ai = getAI();
  const prompt = `Sei un CISO esperto. Analizza i dati e genera un report Markdown professionale. 
  Includi: Executive Summary, Analisi dei Rischi, Roadmap di Mitigazione.
  Dati: ${JSON.stringify(scanData)}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    return "Errore nella generazione del report.";
  }
};

export const generateComplianceRoadmap = async (headers: any[]) => {
  const ai = getAI();
  const prompt = `Analizza questi header: ${JSON.stringify(headers)}. 
  Genera una checklist JSON per GDPR e NIST. 
  Mappa ogni header mancante a un requisito fallito.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
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
              status: { type: Type.STRING }, // 'passed' | 'failed'
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
  const ai = getAI();
  const prompt = `BASE DI CONOSCENZA CVE 2025: [Apache Exploit CVE-2024-XXXX, OpenSSL Patch v3.2].
  QUERY UTENTE: ${query}
  CONTESTO SISTEMA: ${context}
  Rispondi come Kore, l'assistente IA di Cyber Sentinel. Sii tecnico e preciso.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt
  });
  return response.text;
};

// Fix: Exporting runThreatSimulation to resolve the import error in ThreatSimulator.tsx
export const runThreatSimulation = async (type: string, posture: any, language: 'IT' | 'EN' = 'IT') => {
  const ai = getAI();
  const prompt = `Simula un attacco di tipo ${type} basandoti sulla postura di sicurezza: ${JSON.stringify(posture)}.
  Genera un JSON con scenarioTitle, steps (array di {time, event, impact}), defensiveVerdict, e mitigationTip.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
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
                },
                required: ["time", "event", "impact"]
              }
            },
            defensiveVerdict: { type: Type.STRING },
            mitigationTip: { type: Type.STRING }
          },
          required: ["scenarioTitle", "steps", "defensiveVerdict", "mitigationTip"]
        }
      }
    });
    return JSON.parse(response.text || "{}");
  } catch (e) {
    return null;
  }
};
