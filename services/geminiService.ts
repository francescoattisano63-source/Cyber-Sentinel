
import { GoogleGenAI, Type } from "@google/genai";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateExecutiveReport = async (scanData: any, language: 'IT' | 'EN' = 'IT') => {
  const ai = getAI();
  const currentDate = new Date().toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' });
  
  const prompt = `Agisci come un consulente senior di cybersecurity. Genera un "Rapporto Strategico di Sicurezza" aggiornato al ${currentDate}.
  
  DATI TECNICI DA ANALIZZARE:
  ${JSON.stringify(scanData)}
  
  REQUISITI MANDATORI:
  1. DATA: Scrivi chiaramente che il report è datato ${currentDate}.
  2. LINGUAGGIO: Semplice, per un imprenditore (Omega Gruppo).
  3. EXECUTIVE SUMMARY: Massimo 3 righe.
  4. PIANO D'AZIONE: 3 passi pratici.
  5. FORMATO: Markdown.
  
  Lingua: ${language === 'IT' ? 'Italiano' : 'Inglese'}.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    return "Errore nella generazione del report IA. Si prega di riprovare.";
  }
};

export const generateCompliancePolicy = async (policyType: string, scanData: any, language: 'IT' | 'EN' = 'IT') => {
  const ai = getAI();
  const prompt = `Crea una bozza professionale di policy ${policyType} basata su questi dati aziendali: ${JSON.stringify(scanData)}. Tono formale, formato Markdown. Lingua: ${language === 'IT' ? 'Italiano' : 'Inglese'}.`;
  try {
    const response = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: prompt });
    return response.text;
  } catch (error) { return "Errore generazione policy."; }
};

export const analyzeLogForensics = async (rawLogs: string, language: 'IT' | 'EN' = 'IT') => {
  const ai = getAI();
  const prompt = `Analizza questi log e restituisci un verdetto di sicurezza in JSON: ${rawLogs}`;
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            findings: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { type: { type: Type.STRING }, description: { type: Type.STRING } } } },
            severity: { type: Type.STRING },
            verdict: { type: Type.STRING },
            remediation: { type: Type.STRING }
          },
          required: ["severity", "verdict", "remediation"]
        }
      }
    });
    return JSON.parse(response.text);
  } catch (error) { return null; }
};

export const runThreatSimulation = async (attackType: string, currentPosture: any, language: 'IT' | 'EN' = 'IT') => {
  const ai = getAI();
  const prompt = `Simula un attacco ${attackType} in JSON.`;
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
            steps: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { time: { type: Type.STRING }, event: { type: Type.STRING }, impact: { type: Type.STRING } } } },
            defensiveVerdict: { type: Type.STRING },
            mitigationTip: { type: Type.STRING }
          }
        }
      }
    });
    return JSON.parse(response.text);
  } catch (error) { return null; }
};
