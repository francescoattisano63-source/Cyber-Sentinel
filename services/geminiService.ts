
import { GoogleGenAI, Type } from "@google/genai";

// Recupera la chiave dall'ambiente (Vercel la inietterà qui)
const apiKey = process.env.API_KEY || "";

export const generateExecutiveReport = async (scanData: any, language: 'IT' | 'EN' = 'IT') => {
  if (!apiKey) return "ERRORE: API_KEY mancante nelle impostazioni del server.";
  
  const ai = new GoogleGenAI({ apiKey });
  const prompt = `Sei un CISO esperto (Cyber Sentinel v1.1.0). Analizza i dati forniti e genera un report Markdown professionale ad alta fedeltà. 
  Includi: Executive Summary, Analisi dettagliata dei Rischi, Roadmap di Mitigazione tecnica e strategica.
  Dati della Scansione: ${JSON.stringify(scanData)}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Executive Report Generation Failed:", error);
    return "Errore critico nella generazione del report neurale.";
  }
};

export const generateComplianceRoadmap = async (headers: any[]) => {
  if (!apiKey) return [];
  const ai = new GoogleGenAI({ apiKey });
  const prompt = `Analizza questi header di sicurezza: ${JSON.stringify(headers)}. 
  Genera una checklist JSON rigorosa per la compliance GDPR, NIST CSF 2.0 e ISO 27001. 
  Mappa ogni falla rilevata a un requisito normativo specifico.`;

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
    console.error("Compliance Engine Failure:", e);
    return [];
  }
};

export const askKoreWithRAG = async (query: string, context: string) => {
  if (!apiKey) return "Errore: Connessione IA non configurata.";
  const ai = new GoogleGenAI({ apiKey });
  const prompt = `IDENTITÀ: Kore (Cyber Sentinel v1.1.0 IA).
  BASE DI CONOSCENZA CVE 2025 AGGIORNATA.
  QUERY UTENTE: ${query}
  CONTESTO ATTUALE: ${context}
  ISTRUZIONE: Rispondi con massima precisione tecnica, mantenendo un tono professionale e tattico.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt
    });
    return response.text;
  } catch (e) {
    console.error("Kore Chat Error:", e);
    return "Connessione neurale interrotta. Verifica la configurazione su Vercel.";
  }
};

export const runThreatSimulation = async (type: string, posture: any, language: 'IT' | 'EN' = 'IT') => {
  if (!apiKey) return null;
  const ai = new GoogleGenAI({ apiKey });
  const prompt = `Simula un attacco di tipo ${type} basandoti sulla postura di sicurezza reale dell'utente: ${JSON.stringify(posture)}.
  Genera un JSON strutturato con scenarioTitle, steps (array di {time, event, impact}), defensiveVerdict, e mitigationTip.`;

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
    console.error("Simulation Failure:", e);
    return null;
  }
};
