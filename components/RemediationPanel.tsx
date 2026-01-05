
import React from 'react';

interface RemediationItem {
  title: string;
  issue: string;
  solution: string;
  codeSnippet: string;
}

interface RemediationPanelProps {
  items: RemediationItem[];
  language: 'IT' | 'EN';
}

export const RemediationPanel: React.FC<RemediationPanelProps> = ({ items, language }) => {
  if (items.length === 0) return (
    <div className="py-10 text-center text-white/20 italic">
      {language === 'IT' ? 'Nessun piano di remediation richiesto.' : 'No remediation plan required.'}
    </div>
  );

  return (
    <div className="space-y-6 animate-in slide-in-from-right-10 duration-500">
      {items.map((item, i) => (
        <div key={i} className="glass border-l-4 border-l-emerald p-6 rounded-r-2xl bg-white/[0.02] hover:bg-white/[0.05] transition-all">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded bg-emerald/10 flex items-center justify-center text-emerald">
              <i className="fas fa-hammer"></i>
            </div>
            <h4 className="font-bold text-white uppercase tracking-widest text-sm">{item.title}</h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
            <div>
              <p className="text-[10px] text-white/40 uppercase font-black mb-1">{language === 'IT' ? 'Problema Identificato' : 'Identified Issue'}</p>
              <p className="text-xs text-white/70">{item.issue}</p>
            </div>
            <div>
              <p className="text-[10px] text-emerald/40 uppercase font-black mb-1">{language === 'IT' ? 'Soluzione Proposta' : 'Proposed Solution'}</p>
              <p className="text-xs text-emerald/70">{item.solution}</p>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute -top-3 left-4 px-2 bg-obsidian text-[8px] font-black text-emerald border border-emerald/30 uppercase tracking-[0.2em]">Blueprint Snippet</div>
            <pre className="p-4 bg-black/60 rounded-xl border border-white/5 font-mono text-[10px] text-emerald/90 overflow-x-auto custom-scrollbar leading-relaxed">
              <code>{item.codeSnippet}</code>
            </pre>
            <button 
              onClick={() => navigator.clipboard.writeText(item.codeSnippet)}
              className="absolute top-4 right-4 text-white/20 hover:text-emerald transition-colors"
              title="Copy to clipboard"
            >
              <i className="fas fa-copy"></i>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
