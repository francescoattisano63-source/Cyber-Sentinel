
import React from 'react';
import { NIST_CSF_CATEGORIES } from '../constants';

interface NistComplianceTrackerProps {
  scores: number[];
}

export const NistComplianceTracker: React.FC<NistComplianceTrackerProps> = ({ scores }) => {
  return (
    <div className="space-y-6">
      {NIST_CSF_CATEGORIES.map((category, i) => {
        const score = scores[i] || 0;
        return (
          <div key={category} className="group">
            <div className="flex justify-between items-end mb-2">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/70 group-hover:text-emerald transition-colors">
                {category}
              </span>
              <span className="text-xs font-mono font-bold text-white">
                {score}%
              </span>
            </div>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
              <div 
                className="h-full bg-gradient-to-r from-emerald/40 to-emerald shadow-[0_0_10px_rgba(16,185,129,0.3)] transition-all duration-1000 ease-out"
                style={{ width: `${score}%` }}
              ></div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
