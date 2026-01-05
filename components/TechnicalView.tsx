
import React from 'react';
import { SecurityHeaderResult, EmailBreach } from '../types';

interface TechnicalViewProps {
  headers: SecurityHeaderResult[];
  breaches: EmailBreach[];
  language: 'IT' | 'EN';
}

export const TechnicalView: React.FC<TechnicalViewProps> = ({ headers, breaches, language }) => {
  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <section>
        <div className="flex items-center justify-between mb-6">
          <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-emerald flex items-center gap-3">
            <i className="fas fa-microchip text-lg"></i>
            {language === 'IT' ? 'Analisi Header HTTP' : 'HTTP Telemetry Analysis'}
          </h4>
          <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">6 Nodes Analyzed</span>
        </div>
        
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/40 shadow-2xl">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-white/5 text-white font-black text-[10px] tracking-[0.2em] uppercase">
                <th className="px-6 py-4 border-b border-white/10">Header Profile</th>
                <th className="px-6 py-4 border-b border-white/10">Risk Status</th>
                <th className="px-6 py-4 border-b border-white/10 text-right">Raw Data</th>
              </tr>
            </thead>
            <tbody className="font-medium">
              {headers.map((h, i) => (
                <tr key={i} className="hover:bg-white/[0.04] transition-all border-b border-white/5 last:border-0 group">
                  <td className="px-6 py-4">
                    <p className="font-mono text-white font-bold group-hover:text-emerald transition-colors">{h.header}</p>
                    <p className="text-[9px] text-white/40 font-medium mt-1">{h.description}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg ${
                      h.status === 'secure' ? 'bg-emerald/20 text-emerald border border-emerald/30' : 
                      h.status === 'vulnerable' ? 'bg-red-500/20 text-red-500 border border-red-500/30' : 'bg-gold/20 text-gold border border-gold/30'
                    }`}>
                      {h.status === 'secure' ? 'Optimal' : h.status === 'vulnerable' ? 'Critical' : 'Warning'}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono text-white/30 text-right group-hover:text-white/60 transition-colors">
                    {h.value ? h.value.substring(0, 20) + '...' : 'NONE'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-6">
          <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-gold flex items-center gap-3">
            <i className="fas fa-user-secret text-lg"></i>
            {language === 'IT' ? 'Esposizione OSINT' : 'OSINT Intelligence'}
          </h4>
          <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">{breaches.length} Breaches Detected</span>
        </div>

        {breaches.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {breaches.map((b, i) => (
              <div key={i} className="p-6 rounded-2xl border border-white/10 bg-black/40 flex flex-col justify-between group hover:border-gold/50 transition-all shadow-xl">
                <div className="mb-4">
                  <div className="flex justify-between items-start mb-1">
                    <p className="text-sm font-black text-white group-hover:text-gold transition-colors">{b.site}</p>
                    <span className="text-[10px] text-red-500 font-black uppercase tracking-tighter">Exploited</span>
                  </div>
                  <p className="text-[10px] font-mono text-white/30 uppercase tracking-widest">{b.date}</p>
                </div>
                <div className="flex flex-wrap gap-2 mt-auto">
                  {b.dataClasses.map((dc, j) => (
                    <span key={j} className="text-[9px] bg-white/5 border border-white/10 px-3 py-1 rounded-lg uppercase font-black tracking-tighter text-white/70 group-hover:border-gold/20 group-hover:text-gold transition-all">
                      {dc}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-16 border-2 border-dashed border-white/10 rounded-3xl text-center bg-black/20">
            <i className="fas fa-shield-check text-4xl text-emerald/20 mb-4 block"></i>
            <p className="text-xs text-white/30 font-bold uppercase tracking-[0.2em]">Zero Public Exposure Found</p>
          </div>
        )}
      </section>
    </div>
  );
};
