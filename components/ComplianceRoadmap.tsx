
import React from 'react';
import { ComplianceRequirement } from '../types';

interface Props {
  roadmap: ComplianceRequirement[];
}

export const ComplianceRoadmap: React.FC<Props> = ({ roadmap }) => {
  if (!roadmap || roadmap.length === 0) return null;

  return (
    <div className="space-y-4">
      <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald mb-6">GDPR & NIST Compliance Roadmap</h4>
      {roadmap.map((req) => (
        <div key={req.id} className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between group hover:border-emerald/20 transition-all">
          <div className="flex items-center gap-4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${req.status === 'passed' ? 'bg-emerald/20 text-emerald' : 'bg-red-500/20 text-red-500'}`}>
              <i className={`fas ${req.status === 'passed' ? 'fa-check-circle' : 'fa-circle-xmark'}`}></i>
            </div>
            <div>
              <p className="text-xs font-bold text-white uppercase tracking-tight">{req.requirement}</p>
              <p className="text-[9px] text-white/30 uppercase tracking-widest">{req.category} {req.linkedVulnerability ? `| Via ${req.linkedVulnerability}` : ''}</p>
            </div>
          </div>
          <span className={`text-[8px] font-black px-2 py-1 rounded ${req.status === 'passed' ? 'bg-emerald/10 text-emerald' : 'bg-red-500/10 text-red-500'}`}>
            {req.status === 'passed' ? 'COMPLIANT' : 'NON-COMPLIANT'}
          </span>
        </div>
      ))}
    </div>
  );
};
