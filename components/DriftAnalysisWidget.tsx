
import React from 'react';
import { DriftData } from '../services/scoringOracle';

interface DriftAnalysisWidgetProps {
  drift: DriftData;
}

export const DriftAnalysisWidget: React.FC<DriftAnalysisWidgetProps> = ({ drift }) => {
  const isPositive = drift.scoreDelta >= 0;

  return (
    <div className="glass p-8 rounded-[2.5rem] border border-white/5 bg-white/[0.01] animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-6">
        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Drift Analysis</h4>
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black ${isPositive ? 'bg-emerald/10 text-emerald' : 'bg-red-500/10 text-red-500'}`}>
          <i className={`fas fa-caret-${isPositive ? 'up' : 'down'}`}></i>
          {isPositive ? '+' : ''}{drift.scoreDelta}% DELTA
        </div>
      </div>

      <div className="space-y-4">
        {drift.newVulnerabilities.length > 0 && (
          <div>
            <p className="text-[8px] font-black text-red-500 uppercase tracking-widest mb-2">Regressions Detected</p>
            <div className="flex flex-wrap gap-2">
              {drift.newVulnerabilities.map(v => (
                <span key={v} className="text-[9px] bg-red-500/10 border border-red-500/20 px-2 py-1 rounded text-red-500 font-mono">{v}</span>
              ))}
            </div>
          </div>
        )}

        {drift.resolvedVulnerabilities.length > 0 && (
          <div>
            <p className="text-[8px] font-black text-emerald uppercase tracking-widest mb-2">Hardening Success</p>
            <div className="flex flex-wrap gap-2">
              {drift.resolvedVulnerabilities.map(v => (
                <span key={v} className="text-[9px] bg-emerald/10 border border-emerald/20 px-2 py-1 rounded text-emerald font-mono">{v}</span>
              ))}
            </div>
          </div>
        )}

        {drift.newVulnerabilities.length === 0 && drift.resolvedVulnerabilities.length === 0 && (
          <p className="text-[10px] text-white/20 italic text-center py-4">Infrastruttura stabile. Nessuna deriva rilevata.</p>
        )}
      </div>
    </div>
  );
};
