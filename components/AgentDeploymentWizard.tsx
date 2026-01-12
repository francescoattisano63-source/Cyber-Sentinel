
import React, { useState } from 'react';
import { generateAgentScript } from '../services/securityScanner';

interface AgentDeploymentWizardProps {
  userId: string;
}

export const AgentDeploymentWizard: React.FC<AgentDeploymentWizardProps> = ({ userId }) => {
  const [copied, setCopied] = useState(false);
  const script = generateAgentScript(userId);

  const handleCopy = () => {
    navigator.clipboard.writeText(script);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="glass p-10 rounded-[3rem] border border-emerald/20 bg-emerald/[0.02] relative overflow-hidden">
      <div className="absolute top-0 right-0 p-8 opacity-10">
        <i className="fas fa-terminal text-6xl text-emerald"></i>
      </div>
      
      <div className="relative z-10">
        <h3 className="text-xl font-black uppercase tracking-tighter text-emerald mb-2 italic">Active Defense Deployment</h3>
        <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-8">Esegui l'agente sui tuoi server per telemetria reale</p>
        
        <div className="space-y-6">
          <div className="p-6 bg-black/60 rounded-2xl border border-white/5 font-mono text-xs text-emerald/80 leading-relaxed relative group">
            <code className="block break-all">{script}</code>
            <button 
              onClick={handleCopy}
              className="absolute top-4 right-4 w-10 h-10 rounded-xl bg-emerald text-black flex items-center justify-center hover:scale-110 transition-all active:scale-95"
            >
              <i className={`fas ${copied ? 'fa-check' : 'fa-copy'}`}></i>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: 'System Integrity', icon: 'fa-file-shield' },
              { label: 'Process Audit', icon: 'fa-microchip' },
              { label: 'Log Analysis', icon: 'fa-list-check' }
            ].map(f => (
              <div key={f.label} className="flex items-center gap-3 px-4 py-2 bg-white/5 rounded-xl border border-white/5">
                <i className={`fas ${f.icon} text-emerald/40 text-[10px]`}></i>
                <span className="text-[8px] font-black uppercase text-white/60">{f.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
