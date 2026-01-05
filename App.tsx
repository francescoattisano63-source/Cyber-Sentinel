
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import { 
  SecurityHeaderResult, 
  WazuhAgent, 
  EmailBreach,
  ScanResult
} from './types';
import { DashboardCard } from './components/DashboardCard';
import { NeuralAtom } from './components/NeuralAtom';
import { TerminalOutput } from './components/TerminalOutput';
import { ScoreRing } from './components/ScoreRing';
import { TechnicalView } from './components/TechnicalView';
import { ThreatSimulator } from './components/ThreatSimulator';
import { RiskHeatmap } from './components/RiskHeatmap';
import { analyzeSecurityHeaders, scanEmailOSINT, fetchWazuhTelemetry, checkSafeBrowsing } from './services/securityScanner';
import { 
  generateExecutiveReport, 
  generateCompliancePolicy,
} from './services/geminiService';
import { UserProvider, useUser } from './UserContext';
import { decodeAudio, decodeAudioData } from './services/audioService';

const AppContent: React.FC = () => {
  const { user, scanHistory, saveScan, decrementCredits, incrementScans } = useUser();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'history' | 'compliance' | 'neural' | 'forensics' | 'ciso'>('dashboard');
  const [scanning, setScanning] = useState(false);
  const [targetUrl, setTargetUrl] = useState('https://www.google.it');
  
  const [emailList, setEmailList] = useState<string>(user.email);
  const [allBreaches, setAllBreaches] = useState<Record<string, EmailBreach[]>>({});
  
  const [isLiveActive, setIsLiveActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [chatHistory, setChatHistory] = useState<{role: 'user' | 'model', text: string}[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isCisoSpeaking, setIsCisoSpeaking] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);

  const [headers, setHeaders] = useState<SecurityHeaderResult[]>([]);
  const [breaches, setBreaches] = useState<EmailBreach[]>([]);
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const [nistValues, setNistValues] = useState<number[]>([40, 55, 30, 45, 20]);
  const [forensicLogs, setForensicLogs] = useState<string>("");
  const [compliancePolicy, setCompliancePolicy] = useState<string | null>(null);
  const [loadingPolicy, setLoadingPolicy] = useState(false);

  const overallScore = Math.round(nistValues.reduce((acc, val) => acc + val, 0) / nistValues.length);

  const addLog = useCallback((msg: string) => {
    const time = new Date().toLocaleTimeString();
    setTerminalLogs(prev => [...prev, `[${time}] ${msg}`]);
  }, []);

  const playNeuralVoice = async (text: string) => {
    try {
      setIsCisoSpeaking(true);
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: `Parla in modo professionale e rassicurante in italiano: ${text}` }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        }
        const ctx = audioContextRef.current;
        const audioBuffer = await decodeAudioData(decodeAudio(base64Audio), ctx, 24000, 1);
        
        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(ctx.destination);
        
        const startTime = Math.max(ctx.currentTime, nextStartTimeRef.current);
        source.start(startTime);
        
        nextStartTimeRef.current = startTime + audioBuffer.duration;
        
        source.onended = () => {
          if (ctx.currentTime >= nextStartTimeRef.current - 0.1) {
            setIsCisoSpeaking(false);
          }
        };
      } else {
        setIsCisoSpeaking(false);
      }
    } catch (error) {
      console.error("TTS Error:", error);
      setIsCisoSpeaking(false);
    }
  };

  const handleSendText = async () => {
    if (!chatInput.trim() || isConnecting) return;
    const userMsg = chatInput;
    setChatInput('');
    setChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);
    
    setIsConnecting(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: userMsg,
        config: {
          systemInstruction: `Sei Kore, CISO Virtuale di Cyber Sentinel. RISPONDI SEMPRE IN ITALIANO. Sii conciso, esperto e rassicurante. Analizza il contesto: Score attuale ${overallScore}%.`
        }
      });
      
      const reply = response.text || "Mi scuso, ho difficoltà a elaborare la richiesta.";
      setChatHistory(prev => [...prev, { role: 'model', text: reply }]);
      await playNeuralVoice(reply);
    } catch (e) {
      addLog("Errore di comunicazione con Kore.");
    } finally {
      setIsConnecting(false);
    }
  };

  const downloadProfessionalReport = () => {
    if (!aiReport) return;
    const currentDate = new Date().toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' });
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Cyber Sentinel - Professional Audit Report</title>
        <style>
          body { font-family: 'Segoe UI', sans-serif; padding: 50px; color: #1a202c; background: #fff; line-height: 1.6; }
          .header { border-bottom: 5px solid #10b981; padding-bottom: 30px; margin-bottom: 40px; display: flex; justify-content: space-between; align-items: flex-end; }
          .logo { font-size: 24px; font-weight: 900; color: #02070d; }
          .logo span { color: #10b981; }
          .score-box { background: #f0fdf4; border: 2px solid #10b981; border-radius: 20px; padding: 30px; text-align: center; margin-bottom: 40px; }
          .score-val { font-size: 64px; font-weight: 900; color: #10b981; margin: 0; }
          .section { margin-bottom: 40px; }
          h2 { color: #02070d; border-left: 5px solid #10b981; padding-left: 15px; text-transform: uppercase; font-size: 20px; margin-bottom: 20px; }
          .report-text { background: #f8fafc; padding: 30px; border-radius: 15px; border: 1px solid #e2e8f0; white-space: pre-wrap; font-size: 14px; }
          .footer { margin-top: 60px; font-size: 10px; color: #a0aec0; border-top: 1px solid #edf2f7; padding-top: 20px; text-align: center; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="logo"><span>CYBER</span>SENTINEL</div>
            <p>Destinatario: <strong>Omega Gruppo</strong></p>
            <p>Target: <strong>${targetUrl}</strong></p>
          </div>
          <div style="text-align: right">
            <p>Data del Report: <strong>${currentDate}</strong></p>
            <p>Classificazione: <strong>Riservato</strong></p>
          </div>
        </div>
        <div class="score-box">
          <p style="margin:0; font-weight:bold; color:#065f46">INDICE DI POSTURA SICUREZZA</p>
          <p class="score-val">${overallScore}%</p>
        </div>
        <div class="section">
          <h2>Rapporto Strategico di Sicurezza IA</h2>
          <div class="report-text">${aiReport}</div>
        </div>
        <div class="footer">Cyber Sentinel v1.0 - Generato il ${new Date().toLocaleString()}</div>
      </body>
      </html>
    `;
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Report_CyberSentinel_${new Date().getTime()}.html`;
    link.click();
  };

  const handleRunScan = async () => {
    if (user.credits <= 0) return alert("Crediti insufficienti.");
    setScanning(true);
    setTerminalLogs([]);
    try {
      addLog(`Avvio audit di rete per: ${targetUrl}`);
      const safety = await checkSafeBrowsing(targetUrl);
      const headerResults = await analyzeSecurityHeaders(targetUrl);
      setHeaders(headerResults);

      const emails = emailList.split(/[\s,]+/).filter(e => e.includes('@'));
      const breachMap: Record<string, EmailBreach[]> = {};
      for (const email of emails) {
        const results = await scanEmailOSINT(email);
        breachMap[email] = results;
      }
      setAllBreaches(breachMap);
      const flattenedBreaches = Object.values(breachMap).flat();
      setBreaches(flattenedBreaches);
      
      const score = Math.round((headerResults.filter(h => h.status === 'secure').length / (headerResults.length || 1)) * 100);
      const newNist = [Math.min(100, score + 10), score, safety.isSafe ? 90 : 20, 60, 50];
      setNistValues(newNist);
      
      const report = await generateExecutiveReport({ url: targetUrl, emails, breachCount: flattenedBreaches.length, score }, 'IT');
      setAiReport(report);
      
      saveScan({ id: Date.now().toString(), target: targetUrl, timestamp: new Date().toISOString(), score, headers: headerResults, breaches: flattenedBreaches, nistScores: newNist, aiReport: report || "" });
      decrementCredits();
      incrementScans();
      addLog("Analisi completata.");
    } catch (e: any) { addLog(`[ERRORE] ${e.message}`); } finally { setScanning(false); }
  };

  return (
    <div className="min-h-screen flex bg-obsidian text-white">
      <aside className="w-80 border-r border-white/5 flex flex-col glass no-print hidden lg:flex">
        <div className="p-10"><h1 className="text-3xl font-black italic tracking-tighter"><span className="text-emerald">CYBER</span>SENTINEL</h1></div>
        <nav className="flex-1 px-6 space-y-2">
          {[{id:'dashboard',icon:'home'}, {id:'ciso',icon:'user-tie'}, {id:'history',icon:'history'}, {id:'compliance',icon:'file-shield'}, {id:'forensics',icon:'fingerprint'}].map((t) => (
            <button key={t.id} onClick={() => setActiveTab(t.id as any)} className={`w-full flex items-center gap-6 px-8 py-5 rounded-2xl transition-all ${activeTab === t.id ? 'bg-emerald/10 text-emerald border border-emerald/20 shadow-lg' : 'text-white/30 hover:text-white hover:bg-white/5'}`}>
              <i className={`fas fa-${t.icon}`}></i>
              <span className="text-[11px] font-black uppercase tracking-widest">{t.id}</span>
            </button>
          ))}
        </nav>
      </aside>

      <main className="flex-1 flex flex-col relative overflow-y-auto">
        <header className="p-10 flex items-center justify-between border-b border-white/5 sticky top-0 z-50 bg-obsidian/80 backdrop-blur-xl no-print">
           <h2 className="text-4xl font-black uppercase tracking-tighter">{activeTab}</h2>
           {aiReport && activeTab === 'dashboard' && (
             <button onClick={downloadProfessionalReport} className="bg-emerald text-black px-8 py-4 rounded-2xl font-black uppercase text-xs hover:bg-white transition-all shadow-xl">DOWNLOAD REPORT HTML</button>
           )}
        </header>

        <div className="p-10">
          {activeTab === 'dashboard' && (
            <div className="grid grid-cols-12 gap-10">
              <div className="col-span-12 xl:col-span-4 space-y-10">
                <DashboardCard title="Configurazione Audit" icon="fa-shield-halved">
                  <div className="space-y-6">
                    <input value={targetUrl} onChange={e => setTargetUrl(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-emerald" placeholder="URL Aziendale" />
                    <textarea value={emailList} onChange={e => setEmailList(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-white/70 h-32" placeholder="Email (separate da virgola)" />
                    <button onClick={handleRunScan} disabled={scanning} className="w-full py-5 bg-emerald text-black font-black uppercase rounded-xl hover:bg-white transition-all shadow-lg">
                      {scanning ? <i className="fas fa-spinner fa-spin mr-2"></i> : 'AVVIA SCANSIONE'}
                    </button>
                    <NeuralAtom active={scanning || isCisoSpeaking} />
                    <TerminalOutput logs={terminalLogs} isScanning={scanning} />
                  </div>
                </DashboardCard>
                <RiskHeatmap nistScores={nistValues} />
              </div>

              <div className="col-span-12 xl:col-span-8 space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="glass p-10 rounded-[3rem] border border-white/10 flex justify-between items-center hover:border-red-500/30 transition-all">
                    <div><p className="text-[10px] font-black uppercase text-white/30">Email Breach</p><p className="text-4xl font-black text-red-500">{Object.keys(allBreaches).length}</p></div>
                    <i className="fas fa-user-secret text-3xl text-white/10"></i>
                  </div>
                  <div className="glass p-10 rounded-[3rem] border border-white/10 col-span-2 flex items-center justify-between hover:border-emerald/30 transition-all">
                    <div><p className="text-[10px] font-black uppercase text-white/30">Postura Sicurezza</p><p className="text-5xl font-black">{overallScore}%</p></div>
                    <ScoreRing score={overallScore} color="#10b981" />
                  </div>
                </div>
                <DashboardCard title="Analisi Strategica Kore AI" icon="fa-robot">
                   <div className="p-8 border border-white/10 rounded-3xl bg-white/[0.02] text-sm leading-relaxed text-white/80 prose prose-invert max-w-none shadow-inner">
                      {aiReport ? aiReport.split('\n').map((l, i) => <p key={i}>{l}</p>) : "In attesa di scansione per generare l'intelligence..."}
                   </div>
                   <TechnicalView headers={headers} breaches={breaches} language="IT" />
                </DashboardCard>
              </div>
            </div>
          )}

          {activeTab === 'ciso' && (
            <div className="max-w-4xl mx-auto h-[75vh] glass rounded-[3rem] border border-white/10 flex flex-col overflow-hidden shadow-2xl">
               <div className="p-8 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
                  <div className="flex items-center gap-6">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center border transition-all duration-500 ${isCisoSpeaking ? 'bg-emerald/20 border-emerald shadow-[0_0_20px_#10b981] animate-pulse' : 'bg-white/5 border-white/10'}`}>
                       <i className={`fas fa-user-tie text-2xl ${isCisoSpeaking ? 'text-emerald' : 'text-white/40'}`}></i>
                    </div>
                    <div><h3 className="text-xl font-black uppercase italic tracking-tighter">Kore Premium CISO</h3><p className="text-[9px] text-white/40 uppercase tracking-widest">{isCisoSpeaking ? 'Sintesi Vocale Neurale' : 'Pronto per la consulenza'}</p></div>
                  </div>
                  <div className="flex items-center gap-3">
                    {isConnecting && <div className="text-[10px] font-black uppercase text-emerald animate-pulse">Kore sta pensando...</div>}
                  </div>
               </div>
               <div className="flex-1 overflow-y-auto p-10 space-y-6 bg-black/10">
                  {chatHistory.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center opacity-10 text-center py-20">
                       <i className="fas fa-microphone-lines text-6xl mb-6"></i>
                       <p className="text-sm font-black uppercase tracking-[0.3em]">Poni una domanda a Kore per avviare la consulenza neurale</p>
                    </div>
                  )}
                  {chatHistory.map((m, i) => (
                    <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2`}>
                      <div className={`max-w-[80%] p-6 rounded-3xl shadow-xl ${m.role === 'user' ? 'bg-emerald text-black font-bold' : 'bg-white/5 border border-white/10 text-white/80'}`}>{m.text}</div>
                    </div>
                  ))}
               </div>
               <div className="p-8 border-t border-white/10 flex gap-4 bg-obsidian">
                  <input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSendText()} className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 outline-none focus:border-emerald/50 transition-all" placeholder="Fai una domanda strategica..." />
                  <button onClick={handleSendText} disabled={isConnecting} className="bg-emerald w-16 rounded-2xl flex items-center justify-center text-black hover:bg-white transition-all shadow-lg active:scale-95 disabled:opacity-50"><i className="fas fa-paper-plane"></i></button>
               </div>
            </div>
          )}

          {activeTab === 'compliance' && (
            <div className="space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {['GDPR', 'ISO 27001', 'NIST CSF 2.0'].map(type => (
                  <div key={type} className="p-12 glass border border-white/10 rounded-[3rem] hover:border-emerald transition-all text-center group">
                    <div className="w-16 h-16 rounded-full bg-emerald/10 border border-emerald/20 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                       <i className="fas fa-file-shield text-3xl text-emerald"></i>
                    </div>
                    <h4 className="text-xl font-black uppercase mb-6 tracking-tight">{type}</h4>
                    <button onClick={async () => {
                      setLoadingPolicy(true);
                      setCompliancePolicy(null);
                      const p = await generateCompliancePolicy(type, { headers, overallScore, targetUrl });
                      setCompliancePolicy(p);
                      setLoadingPolicy(false);
                    }} className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase hover:bg-emerald hover:text-black transition-all">GENERA POLICY IA</button>
                  </div>
                ))}
              </div>
              {loadingPolicy && <div className="py-20 flex flex-col items-center gap-6"><NeuralAtom active /><p className="text-emerald font-black uppercase tracking-widest animate-pulse">Analisi Requisiti Normativi...</p></div>}
              {compliancePolicy && (
                <div className="p-12 glass border border-white/10 rounded-[3rem] animate-in slide-in-from-bottom-5">
                   <div className="flex justify-between items-center mb-8">
                      <h4 className="text-2xl font-black uppercase tracking-tighter">Documento Policy Generato</h4>
                      <button onClick={() => {
                         const blob = new Blob([compliancePolicy], {type: 'text/markdown'});
                         const url = URL.createObjectURL(blob);
                         const a = document.createElement('a'); a.href = url; a.download = 'CyberSentinel_Policy.md'; a.click();
                      }} className="text-[10px] font-black text-emerald border border-emerald/20 px-6 py-2 rounded-full hover:bg-emerald/10">ESPORTA .MD</button>
                   </div>
                   <div className="prose prose-invert max-w-none text-white/80 whitespace-pre-wrap font-sans text-sm leading-relaxed">{compliancePolicy}</div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
               {scanHistory.length === 0 ? (
                 <div className="col-span-full py-20 text-center opacity-20"><i className="fas fa-folder-open text-6xl mb-4"></i><p className="font-black uppercase tracking-widest">Nessun audit in archivio</p></div>
               ) : (
                 scanHistory.map(s => (
                   <button key={s.id} onClick={() => { setHeaders(s.headers); setAiReport(s.aiReport); setNistValues(s.nistScores); setBreaches(s.breaches); setTargetUrl(s.target); setActiveTab('dashboard'); }} className="p-10 glass border border-white/10 rounded-[2.5rem] hover:border-emerald/40 hover:bg-white/[0.02] transition-all text-left group shadow-xl">
                      <div className="flex justify-between mb-6">
                        <span className="text-[10px] text-white/30 font-black uppercase tracking-widest">{new Date(s.timestamp).toLocaleDateString()}</span>
                        <span className="text-2xl font-black text-emerald">{s.score}%</span>
                      </div>
                      <h4 className="font-black text-xl text-white truncate mb-4 group-hover:text-emerald transition-colors">{s.target}</h4>
                      <div className="flex items-center gap-2 opacity-40"><i className="fas fa-chevron-right text-[10px]"></i><span className="text-[9px] font-black uppercase">Apri Dettaglio</span></div>
                   </button>
                 ))
               )}
            </div>
          )}
          
          {activeTab === 'neural' && <ThreatSimulator currentPosture={{ overallScore, headers }} language="IT" />}
          
          {activeTab === 'forensics' && (
            <div className="max-w-4xl mx-auto space-y-10">
               <DashboardCard title="Analisi Forense Cloud IA" icon="fa-fingerprint">
                  <div className="space-y-6">
                    <p className="text-xs text-white/50 leading-relaxed uppercase tracking-widest font-black">Identifica pattern di attacco nei log server (Omega Gruppo Forensic Tool)</p>
                    <textarea value={forensicLogs} onChange={e => setForensicLogs(e.target.value)} className="w-full h-64 bg-black/40 border border-white/10 rounded-2xl p-8 font-mono text-xs text-emerald focus:border-emerald/50 outline-none resize-none shadow-inner" placeholder="Incolla qui i log grezzi del server (es. Apache, Nginx, Auth)..." />
                    <button className="w-full py-6 bg-emerald text-black font-black uppercase rounded-2xl hover:bg-white transition-all shadow-xl tracking-[0.2em]">Analizza Log Ora</button>
                  </div>
               </DashboardCard>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

const App: React.FC = () => <UserProvider><AppContent /></UserProvider>;
export default App;
