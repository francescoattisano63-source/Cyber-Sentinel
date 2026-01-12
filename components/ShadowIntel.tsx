
import React, { useEffect, useState } from 'react';
import { EmailBreach } from '../types';

interface ShadowIntelProps {
  breaches: EmailBreach[];
}

export const ShadowIntel: React.FC<ShadowIntelProps> = ({ breaches }) => {
  const [matrixText, setMatrixText] = useState<string[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*";
      const line = Array.from({length: 20}, () => chars[Math.floor(Math.random() * chars.length)]).join('');
      setMatrixText(prev => [line, ...prev].slice(0, 5));
    }, 150);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-black/60 rounded-[2rem] border border-white/5 p-8 relative overflow-hidden group">
      <div className="flex justify-between items-center mb-6">
        <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-red-500">Shadow Intel Feed</h4>
        <div className="flex items-center gap-2">
           <div className="w-1 h-1 rounded-full bg-red-500 animate-ping"></div>
           <span className="text-[8px] font-mono text-red-500/40">ONION ROUTE ACTIVE</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 relative z-10">
        <div className="font-mono text-[8px] text-red-500/30 space-y-1">
          {matrixText.map((text, i) => <p key={i}>{text}</p>)}
        </div>
        <div className="space-y-4">
          {breaches.length > 0 ? (
            breaches.slice(0, 2).map((b, i) => (
              <div key={i} className="animate-in fade-in slide-in-from-right duration-500">
                <p className="text-[9px] font-black text-white/60 uppercase tracking-tighter mb-1">{b.site}</p>
                <div className="flex gap-1">
                  <span className="text-[8px] bg-red-500/10 text-red-500 px-2 py-0.5 rounded border border-red-500/20 font-mono">HASH: MD5_SALT</span>
                  <span className="text-[8px] bg-white/5 text-white/40 px-2 py-0.5 rounded font-mono">P***WD</span>
                </div>
              </div>
            ))
          ) : (
            <div className="py-4 text-center opacity-20">
              <i className="fas fa-search text-xs mb-2 block"></i>
              <p className="text-[8px] font-black uppercase">Scanning Leaks...</p>
            </div>
          )}
        </div>
      </div>
      
      <div className="absolute inset-0 bg-gradient-to-t from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
    </div>
  );
};
