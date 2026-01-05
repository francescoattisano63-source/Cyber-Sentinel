
import React, { useState } from 'react';
import { runThreatSimulation } from '../services/geminiService';

interface ThreatSimulatorProps {
  currentPosture: any;
  language: 'IT' | 'EN';
}

export const ThreatSimulator: React.FC<ThreatSimulatorProps> = ({ currentPosture, language }) => {
  const [simulating, setSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState<any>(null);

  const startSimulation = async (type: string) => {
    setSimulating(true);
    setSimulationResult(null);
    const result = await runThreatSimulation(type, currentPosture, language);
    setSimulationResult(result);
    setSimulating(false);
  };

  const handleDownloadSimulation = () => {
    if (!simulationResult) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(simulationResult, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `Simulazione_Attacco.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const attackTypes = [
    { id: 'ransomware', label: 'Ransomware', icon: 'fa-lock', desc: 'Simula crittografia file' },
    { id: 'sqli', label: 'SQL Injection', icon: 'fa-database', desc: 'Simula furto database' },
    { id: 'phishing', label: 'Spear Phishing', icon: 'fa-fish', desc: 'Simula furto credenziali' },
    { id: 'ddos', label: 'DDoS Cluster', icon: 'fa-cloud-showers-heavy', desc: 'Simula saturazione banda' }
  ];

  return (
    <div className="space-y-8">
      <div className="bg-white/5 border border-white/10 p-6 rounded-3xl">
        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald mb-4">Istruzioni Simulatore</h4>
        <p className="text-xs text-white/60 leading-relaxed">
          Scegli un vettore qui sotto per vedere come un hacker sfrutterebbe le falle trovate nel tuo ultimo scan. 
          Questa è una simulazione sicura ed educativa per aiutarti a capire le tue priorità di difesa.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {attackTypes.map(type => (
          <button 
            key={type.id} 
            onClick={() => startSimulation(type.label)}
            disabled={simulating}
            className="p-6 rounded-[1.5rem] border border-white/10 bg-white/[0.02] hover:bg-red-500/10 hover:border-red-500/30 transition-all flex flex-col items-center gap-2 group disabled:opacity-30 shadow-xl"
          >
            <i className={`fas ${type.icon} text-2xl text-white/40 group-hover:text-red-500 transition-colors`}></i>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60 group-hover:text-white">{type.label}</span>
            <span className="text-[8px] font-bold text-white/20 uppercase group-hover:text-red-500/60">{type.desc}</span>
          </button>
        ))}
      </div>

      <div className="min-h-[300px] glass rounded-[2.5rem] p-10 border border-white/10 bg-black/40 relative overflow-hidden shadow-2xl">
        {simulating ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-8 bg-obsidian/60 backdrop-blur-md z-10">
            <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-red-500 font-black uppercase tracking-[0.5em] animate-pulse">Analisi della Kill Chain in corso...</p>
          </div>
        ) : simulationResult ? (
          <div className="animate-in fade-in slide-in-from-bottom-5 duration-700">
             <div className="flex justify-between items-start mb-8 border-b border-white/10 pb-6">
                <div>
                   <h4 className="text-2xl font-black uppercase tracking-tight text-red-500 mb-1">{simulationResult.scenarioTitle}</h4>
                   <p className="text-[10px] font-mono uppercase tracking-widest text-white/40">Report Educativo sulla Difesa</p>
                </div>
                <div className="flex items-center gap-4">
                  <button onClick={handleDownloadSimulation} className="px-4 py-2 border border-white/10 rounded-xl text-[9px] font-black text-white/60 uppercase hover:text-emerald hover:border-emerald/40 transition-all">
                    <i className="fas fa-download mr-2"></i> Esporta Report
                  </button>
                  <div className="px-4 py-2 bg-red-500/10 border border-red-500/30 rounded-xl text-xs font-black text-red-500 uppercase">
                     Impact: {simulationResult.steps.length > 3 ? 'Elevato' : 'Medio'}
                  </div>
                </div>
             </div>
             
             <div className="space-y-4 mb-8">
                {simulationResult.steps.map((step: any, i: number) => (
                  <div key={i} className="flex gap-6 items-start group">
                     <span className="text-[10px] font-mono text-red-500/60 font-black mt-1 uppercase whitespace-nowrap">{step.time}</span>
                     <div className="flex-1 pb-4 border-b border-white/5">
                        <p className="text-sm font-bold text-white mb-1">{step.event}</p>
                        <span className={`text-[8px] font-black px-2 py-0.5 rounded uppercase ${step.impact === 'high' ? 'bg-red-500/20 text-red-500' : 'bg-gold/20 text-gold'}`}>IMPATTO: {step.impact.toUpperCase()}</span>
                     </div>
                  </div>
                ))}
             </div>

             <div className="bg-emerald/5 border border-emerald/30 p-8 rounded-3xl">
                <p className="text-[10px] font-black text-emerald uppercase tracking-widest mb-3">Conclusione del Consulente</p>
                <p className="text-sm text-white/80 leading-relaxed font-medium mb-6 italic">"{simulationResult.defensiveVerdict}"</p>
                <div className="p-4 bg-emerald/10 border border-emerald/20 rounded-xl flex gap-4 items-start">
                   <i className="fas fa-lightbulb text-emerald mt-1"></i>
                   <p className="text-xs text-emerald font-bold tracking-tight uppercase leading-relaxed">{simulationResult.mitigationTip}</p>
                </div>
             </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center opacity-20 text-center py-20">
             <i className="fas fa-shield-virus text-6xl mb-6"></i>
             <p className="text-sm font-black uppercase tracking-[0.4em]">Seleziona un attacco per vedere come Gemini simulerebbe l'intrusione</p>
          </div>
        )}
      </div>
    </div>
  );
};
