
import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { GoogleGenAI, Modality, LiveServerMessage } from '@google/genai';
import { SecurityHeaderResult, EmailBreach, WazuhAgent, SubscriptionTier, ScanResult, ComplianceRequirement } from './types';
import { DashboardCard } from './components/DashboardCard';
import { NeuralAtom } from './components/NeuralAtom';
import { TerminalOutput } from './components/TerminalOutput';
import { ScoreRing } from './components/ScoreRing';
import { TechnicalView } from './components/TechnicalView';
import { RiskHeatmap } from './components/RiskHeatmap';
import { AssetTopology } from './components/AssetTopology';
import { NetworkHealthChart } from './components/NetworkHealthChart';
import { NistComplianceTracker } from './components/NistComplianceTracker';
import { UpgradeModal } from './components/UpgradeModal';
import { ShadowIntel } from './components/ShadowIntel';
import { DriftAnalysisWidget } from './components/DriftAnalysisWidget';
import { AgentDeploymentWizard } from './components/AgentDeploymentWizard';
import { ComplianceRoadmap } from './components/ComplianceRoadmap';
import { NotificationProvider, useNotify } from './components/NotificationSystem';
import { analyzeSecurityHeaders, scanEmailOSINT, checkSafeBrowsing, fetchWazuhTelemetry } from './services/securityScanner';
import { generateExecutiveReport, generateComplianceRoadmap, askKoreWithRAG } from './services/geminiService';
import { calculateSecurityPosture20 } from './services/scoringOracle';
import { UserProvider, useUser } from './UserContext';
import { decodeAudio, decodeAudioData, createBlob } from './services/audioService';
import { AuthPage } from './components/AuthPage';
import { LandingPage } from './components/LandingPage';
import { TIERS_CONFIG } from './constants';

const AppContent: React.FC = () => {
  const { user, loading, scanHistory, saveScan, decrementCredits, incrementScans, signOut, updateTier } = useUser();
  const { notify } = useNotify();
  const [showLanding, setShowLanding] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'forensics' | 'history' | 'ciso'>('dashboard');
  
  const [scanningTasks, setScanningTasks] = useState({
    headers: false, osint: false, telemetry: false, ai: false
  });

  const [targetUrl, setTargetUrl] = useState('https://www.google.com');
  const [emailInput, setEmailInput] = useState<string>('');
  const [headers, setHeaders] = useState<SecurityHeaderResult[]>([]);
  const [breaches, setBreaches] = useState<EmailBreach[]>([]);
  const [telemetry, setTelemetry] = useState<WazuhAgent[]>([]);
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [roadmap, setRoadmap] = useState<ComplianceRequirement[]>([]);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const [nistValues, setNistValues] = useState<number[]>([40, 55, 30, 45, 20]);

  // Missing state for Kore chat
  const [textInput, setTextInput] = useState('');
  const [chatHistory, setChatHistory] = useState<{role: 'user' | 'model', text: string}[]>([]);
  const [isLiveActive, setIsLiveActive] = useState(false);
  const [isCisoSpeaking, setIsCisoSpeaking] = useState(false);

  const scoringResult = useMemo(() => calculateSecurityPosture20(headers, breaches), [headers, breaches]);
  const currentScore = scoringResult.finalScore;

  const isScanning = Object.values(scanningTasks).some(v => v);
  const capabilities = useMemo(() => user ? (TIERS_CONFIG[user.tier] || TIERS_CONFIG[SubscriptionTier.FREE]) : TIERS_CONFIG[SubscriptionTier.FREE], [user]);

  const addLog = useCallback((msg: string) => {
    setTerminalLogs(prev => [...prev.slice(-50), `[${new Date().toLocaleTimeString()}] ${msg}`]);
  }, []);

  const downloadReport = () => {
    if (!aiReport) return;
    const blob = new Blob([aiReport], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Sentinel_Intelligence_${targetUrl.replace(/https?:\/\//, '')}.md`;
    a.click();
    notify("Intelligence Report scaricato", "success");
  };

  const handleRunScan = async () => {
    if (isScanning || !user || user.credits <= 0) return;
    setTerminalLogs([]);
    setScanningTasks({ headers: true, osint: true, telemetry: true, ai: true });
    notify("Innesco Protocollo Neural Scan...", 'info');

    try {
      addLog("INIT: Aggancio canali di intelligence...");
      const h = await analyzeSecurityHeaders(targetUrl);
      setHeaders(h);
      addLog("ENG: Analisi Header HTTP completata.");

      const b = await scanEmailOSINT(emailInput || user.email);
      setBreaches(b);
      addLog(`ENG: OSINT Leak Search terminata. Rilevate ${b.length} esposizioni.`);

      const t = await fetchWazuhTelemetry(targetUrl);
      setTelemetry(t);
      addLog("ENG: Telemetria EDR/SIEM sincronizzata.");

      const [report, rdmap] = await Promise.all([
        generateExecutiveReport({ url: targetUrl, headers: h, breaches: b, score: currentScore }),
        generateComplianceRoadmap(h)
      ]);
      setAiReport(report);
      setRoadmap(rdmap);
      addLog("KORE: Report Strategico e Roadmap generati.");

      const scan: ScanResult = {
        id: Date.now().toString(),
        target: targetUrl,
        timestamp: new Date().toISOString(),
        score: calculateSecurityPosture20(h, b).finalScore,
        headers: h,
        breaches: b,
        nistScores: nistValues,
        aiReport: report || "",
        complianceRoadmap: rdmap
      };
      
      saveScan(scan);
      decrementCredits();
      incrementScans();
      notify("Audit Globale Completato", "success");
    } catch (e) {
      notify("Falla nel kernel di scansione", "alert");
    } finally {
      setScanningTasks({ headers: false, osint: false, telemetry: false, ai: false });
    }
  };

  const handleKoreChat = async () => {
    if (!textInput.trim() || !user) return;
    const q = textInput;
    setChatHistory(prev => [...prev, { role: 'user', text: q }]);
    setTextInput('');
    try {
      const context = `L'utente ha una postura di sicurezza del ${currentScore}%. Target: ${targetUrl}. Breaches: ${breaches.length}.`;
      const ans = await askKoreWithRAG(q, context);
      setChatHistory(prev => [...prev, { role: 'model', text: ans }]);
    } catch (e) {
      notify("Kore Link offline", "alert");
    }
  };

  if (loading) return <div className="min-h-screen bg-obsidian flex items-center justify-center"><NeuralAtom active /></div>;
  if (showLanding && !user) return <LandingPage onEnterPortal={() => setShowLanding(false)} />;
  if (!user) return <AuthPage />;

  return (
    <div className="min-h-screen flex bg-obsidian text-white selection:bg-emerald selection:text-black font-['Space_Grotesk']">
      <aside className="no-print w-24 lg:w-72 border-r border-white/5 flex flex-col glass z-[100] sticky top-0 h-screen">
        <div className="p-10 text-center">
          <h1 className="text-xl font-black text-emerald italic tracking-tighter">CYBER SENTINEL</h1>
          <p className="text-[8px] text-white/30 uppercase tracking-widest mt-2">{user.tier} CLEARANCE</p>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          {[
            {id:'dashboard', icon:'fa-th-large', label:'War Room'}, 
            {id:'forensics', icon:'fa-fingerprint', label:'Active Defense'}, 
            {id:'history', icon:'fa-history', label:'Snapshots'}, 
            {id:'ciso', icon:'fa-user-tie', label:'Kore IA'}
          ].map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id as any)} className={`w-full p-5 rounded-2xl flex items-center gap-4 uppercase font-black text-[10px] transition-all ${activeTab === t.id ? 'bg-emerald/10 text-emerald' : 'text-white/20 hover:text-white/60'}`}>
              <i className={`fas ${t.icon} text-lg`}></i><span className="hidden lg:inline">{t.label}</span>
            </button>
          ))}
        </nav>
        
        <div className="mt-auto px-6 py-8 border-t border-white/5">
           <div className="p-4 bg-white/[0.02] rounded-2xl border border-white/5">
              <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">Session Identity</p>
              <p className="text-[10px] font-bold text-white/60 truncate">{user.email}</p>
           </div>
        </div>
        <div className="p-6"><button onClick={signOut} className="w-full p-4 border border-white/5 text-[8px] font-black uppercase text-white/40 hover:text-red-500 transition-colors">DISCONNECT</button></div>
      </aside>

      <main className="flex-1 overflow-x-hidden">
        <header className="no-print px-10 py-12 flex justify-between items-center bg-obsidian/60 backdrop-blur-2xl sticky top-0 z-[60] border-b border-white/5">
           <div className="flex flex-col">
              <h2 className="text-4xl font-black uppercase tracking-tighter italic">{activeTab}</h2>
              {isScanning && <div className="text-[10px] text-gold animate-pulse font-black mt-2 tracking-widest uppercase">Deep Audit in Progress...</div>}
           </div>
           <div className="flex items-center gap-6">
             <div className="text-right">
                <p className="text-[8px] font-black text-white/30 uppercase tracking-widest">Available Ops</p>
                <p className="text-xl font-black text-emerald">{user.credits} Credits</p>
             </div>
             <button onClick={handleRunScan} disabled={isScanning} className="px-12 py-5 bg-emerald text-black rounded-xl font-black uppercase text-xs shadow-lg shadow-emerald/20 hover:scale-105 transition-all disabled:opacity-50">
               {isScanning ? 'EXECUTING...' : 'RUN GLOBAL AUDIT'}
             </button>
           </div>
        </header>

        <div className="p-10 max-w-[1800px] mx-auto space-y-10">
          {activeTab === 'dashboard' && (
            <div className="grid grid-cols-12 gap-10">
              <div className="col-span-12 xl:col-span-8 space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="glass p-10 rounded-[2.5rem] flex justify-between items-center group relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform"><i className="fas fa-shield-halved text-4xl"></i></div>
                    <div><p className="text-[10px] uppercase text-white/30 font-black tracking-widest">Risk Posture</p><p className="text-5xl font-black italic">{currentScore}%</p></div>
                    <ScoreRing score={currentScore} color={currentScore < 50 ? "#ef4444" : "#10b981"} />
                  </div>
                  <div className="glass p-10 rounded-[2.5rem]"><NetworkHealthChart data={nistValues} /></div>
                  <div className="glass p-10 rounded-[2.5rem] flex justify-between items-center text-red-500">
                    <div><p className="text-[10px] uppercase text-white/30 font-black tracking-widest">Leak Points</p><p className="text-5xl font-black italic">{breaches.length}</p></div>
                    <i className="fas fa-biohazard text-4xl opacity-20"></i>
                  </div>
                </div>

                <DashboardCard title="Strategic Intelligence" subtitle="Neural Synthesis by Kore" icon="fa-brain">
                   <div className="flex justify-between items-center mb-8 bg-white/5 p-4 rounded-2xl border border-white/5">
                      <span className="text-[9px] font-black text-white/40 uppercase tracking-[0.4em]">Audit Assessment v2.0</span>
                      {aiReport && (
                        <button onClick={downloadReport} className="text-emerald hover:text-white transition-colors flex items-center gap-2 text-[10px] font-black uppercase tracking-widest bg-emerald/10 px-5 py-2.5 rounded-xl border border-emerald/20">
                          <i className="fas fa-download"></i> Export Intelligence
                        </button>
                      )}
                   </div>
                   <div className="p-10 bg-black/40 rounded-[2.5rem] text-sm leading-relaxed text-white/80 border border-white/5 min-h-[300px] prose prose-invert max-w-none whitespace-pre-wrap font-medium">
                      {aiReport ? aiReport : (isScanning ? "Processing attack vectors..." : "Avvia l'audit per generare l'analisi dei rischi strategici.")}
                   </div>
                   <div className="mt-10">
                      <TechnicalView headers={headers} breaches={breaches} language="IT" />
                   </div>
                </DashboardCard>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                   <DashboardCard title="Compliance Roadmap" subtitle="Regulatory Alignment" icon="fa-tasks">
                      <ComplianceRoadmap roadmap={roadmap} />
                   </DashboardCard>
                   <DriftAnalysisWidget drift={scoringResult.drift || { scoreDelta: 0, newVulnerabilities: [], resolvedVulnerabilities: [] }} />
                </div>
              </div>

              <div className="col-span-12 xl:col-span-4 space-y-10">
                <DashboardCard title="Tactical Command" icon="fa-terminal">
                   <div className="space-y-6">
                      <div className="relative group">
                         <label className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] mb-2 block ml-4">Target Domain</label>
                         <i className="fas fa-globe absolute left-5 top-[2.4rem] text-white/20 group-focus-within:text-emerald transition-colors"></i>
                         <input value={targetUrl} onChange={e => setTargetUrl(e.target.value)} className="w-full bg-black/60 border border-white/10 rounded-2xl p-5 pl-14 text-xs text-emerald font-mono outline-none focus:border-emerald/40" placeholder="https://domain.io" />
                      </div>
                      <div className="relative group">
                         <label className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] mb-2 block ml-4">OSINT Targets (Emails)</label>
                         <textarea value={emailInput} onChange={e => setEmailInput(e.target.value)} className="w-full bg-black/60 border border-white/10 rounded-2xl p-5 text-xs text-emerald h-32 outline-none font-mono focus:border-emerald/40 resize-none" placeholder="john.doe@company.com\nadmin@company.com" />
                         <p className="text-[8px] text-white/20 uppercase mt-2 ml-4">Insere una email per riga per l'analisi dei leak.</p>
                      </div>
                      <TerminalOutput logs={terminalLogs} isScanning={isScanning} />
                   </div>
                </DashboardCard>
                <ShadowIntel breaches={breaches} />
                <div className="glass p-10 rounded-[3rem] shadow-2xl"><RiskHeatmap nistScores={nistValues} /></div>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-10">
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-emerald/10 border border-emerald/20 flex items-center justify-center text-emerald">
                       <i className="fas fa-history text-2xl"></i>
                    </div>
                    <h3 className="text-3xl font-black uppercase tracking-tighter italic">Temporal Records</h3>
                 </div>
                 <div className="text-right">
                    <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">Snapshots Collected</p>
                    <p className="text-xl font-black text-emerald">{scanHistory.length} / 50</p>
                 </div>
              </div>

              {scanHistory.length === 0 ? (
                <div className="p-32 glass rounded-[4rem] text-center border-dashed border-2 border-white/5 opacity-50">
                   <i className="fas fa-database text-6xl mb-6"></i>
                   <p className="text-sm font-black uppercase tracking-[0.4em]">Nessun audit registrato nello storico.</p>
                </div>
              ) : (
                <div className="grid gap-6">
                  {scanHistory.map((s) => (
                    <div key={s.id} onClick={() => { 
                      setHeaders(s.headers); 
                      setBreaches(s.breaches); 
                      setAiReport(s.aiReport); 
                      setRoadmap(s.complianceRoadmap || []);
                      setTargetUrl(s.target);
                      setActiveTab('dashboard'); 
                      notify(`Snapshot ${s.target} ripristinato`, "info");
                    }} className="glass p-10 rounded-[3rem] flex justify-between items-center group cursor-pointer hover:border-emerald/40 transition-all active:scale-[0.98]">
                      <div className="flex items-center gap-10">
                         <div className={`w-20 h-20 rounded-[2rem] flex flex-col items-center justify-center font-black italic shadow-lg ${s.score > 70 ? 'bg-emerald/20 text-emerald' : 'bg-red-500/20 text-red-500'}`}>
                           <span className="text-2xl">{s.score}%</span>
                           <span className="text-[8px] uppercase tracking-widest">Score</span>
                         </div>
                         <div>
                           <p className="font-black text-white text-3xl uppercase tracking-tighter group-hover:text-emerald transition-colors">{s.target.replace(/https?:\/\//, '')}</p>
                           <p className="text-[10px] text-white/30 font-bold uppercase mt-1">Audit Timestamp: {new Date(s.timestamp).toLocaleString()}</p>
                         </div>
                      </div>
                      <i className="fas fa-chevron-right text-white/10 group-hover:translate-x-2 transition-all group-hover:text-emerald"></i>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'forensics' && (
            <div className="space-y-12">
               {!capabilities.hasForensics && (
                 <div className="absolute inset-0 bg-obsidian/60 backdrop-blur-2xl z-[110] rounded-[4rem] flex flex-col items-center justify-center p-12 text-center border border-white/10">
                    <i className="fas fa-lock text-5xl text-emerald mb-8 shadow-emerald/50"></i>
                    <h3 className="text-4xl font-black uppercase mb-4 italic tracking-tighter">Active Defense Access Restricted</h3>
                    <p className="text-white/40 text-sm mb-10 max-w-md leading-relaxed">Il monitoraggio agenti EDR e la telemetria SIEM in tempo reale richiedono un upgrade alla Clearance GOLD o superiore.</p>
                    <button onClick={() => updateTier(SubscriptionTier.GOLD)} className="bg-emerald text-black px-16 py-6 rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg shadow-emerald/20 hover:scale-105 transition-all">Sblocca Moduli Forensics</button>
                 </div>
               )}
               
               <AgentDeploymentWizard userId={user.uid} />

               <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                  <div className="lg:col-span-8">
                    <DashboardCard title="Asset Infrastructure" subtitle="Mesh Monitoring Feed" icon="fa-network-wired">
                      <AssetTopology agents={telemetry} />
                    </DashboardCard>
                  </div>
                  <div className="lg:col-span-4 space-y-8">
                    <DashboardCard title="Active SIEM Feed" icon="fa-list-check">
                       <div className="space-y-4 max-h-[500px] overflow-y-auto pr-4 custom-scrollbar">
                          {telemetry.map(agent => (
                             <div key={agent.id} className="p-5 bg-white/5 rounded-2xl border border-white/5 group hover:border-emerald/30 transition-all">
                                <div className="flex justify-between items-center mb-3">
                                   <span className="text-[10px] font-black text-white uppercase tracking-tighter">{agent.name}</span>
                                   <span className={`text-[8px] font-black px-2 py-0.5 rounded uppercase ${agent.status === 'active' ? 'bg-emerald/20 text-emerald' : 'bg-red-500/20 text-red-500'}`}>{agent.status}</span>
                                </div>
                                <div className="flex justify-between items-center text-[9px] text-white/30 font-mono">
                                   <span>CVE Detectate: {agent.cves}</span>
                                   <span>Ping: {agent.lastSeen}</span>
                                </div>
                             </div>
                          ))}
                       </div>
                    </DashboardCard>
                    <div className="glass p-10 rounded-[3rem]">
                      <h4 className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em] mb-6">Framework Compliance</h4>
                      <NistComplianceTracker scores={nistValues} />
                    </div>
                  </div>
               </div>
            </div>
          )}

          {activeTab === 'ciso' && (
            <div className="grid grid-cols-12 gap-10 h-[75vh]">
              <div className="col-span-12 lg:col-span-4 glass p-12 rounded-[4rem] flex flex-col items-center justify-center text-center relative overflow-hidden">
                 <div className="absolute inset-0 bg-emerald/5 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(16, 185, 129, 0.4) 1px, transparent 0)', backgroundSize: '20px 20px' }}></div>
                 <NeuralAtom active={isLiveActive || isCisoSpeaking} color={isCisoSpeaking ? '#10b981' : '#ffffff'} />
                 <h3 className="text-3xl font-black uppercase mt-10 italic tracking-tighter">Kore Intelligence</h3>
                 <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mt-2 mb-10 italic">Neural Knowledge: v2.0-RAG-ENABLED</p>
                 <button onClick={() => notify("Kore Voice Link abilitato in Gold", "info")} className={`px-12 py-6 rounded-2xl bg-emerald text-black font-black uppercase text-xs tracking-widest shadow-xl shadow-emerald/20 hover:scale-105 transition-all`}>
                   ESTABLISH VOICE LINK
                 </button>
              </div>
              <div className="col-span-12 lg:col-span-8 glass rounded-[4rem] flex flex-col overflow-hidden shadow-2xl border-white/10">
                 <div className="flex-1 p-12 overflow-y-auto space-y-8 custom-scrollbar bg-black/20">
                    {chatHistory.length === 0 && (
                      <div className="h-full flex flex-col items-center justify-center opacity-10 text-center uppercase tracking-[0.5em] text-[10px]">
                         <i className="fas fa-comment-dots text-7xl mb-6"></i>
                         Waiting for instructions.
                      </div>
                    )}
                    {chatHistory.map((m, i) => (
                      <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2`}>
                        <div className={`max-w-[80%] p-8 rounded-[3rem] text-sm shadow-2xl ${m.role === 'user' ? 'bg-emerald text-black font-extrabold' : 'bg-white/5 border border-white/10 text-white/90'}`}>
                          {m.text}
                        </div>
                      </div>
                    ))}
                 </div>
                 <div className="p-10 bg-black/40 border-t border-white/5 flex gap-4">
                    <input value={textInput} onChange={e => setTextInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleKoreChat()} className="flex-1 bg-white/[0.03] border border-white/10 rounded-2xl px-8 text-sm outline-none focus:border-emerald/40 transition-colors py-6 font-medium" placeholder="Chiedi a Kore: 'Siamo vulnerabili a CVE-2024-XXXX?'" />
                    <button onClick={handleKoreChat} className="bg-emerald text-black w-20 h-20 rounded-2xl flex items-center justify-center hover:scale-105 shadow-xl shadow-emerald/20 transition-transform"><i className="fas fa-paper-plane text-xl"></i></button>
                 </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

const App: React.FC = () => (
  <NotificationProvider>
    <UserProvider>
      <AppContent />
    </UserProvider>
  </NotificationProvider>
);
export default App;
