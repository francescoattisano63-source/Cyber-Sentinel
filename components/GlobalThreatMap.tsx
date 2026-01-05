
import React, { useEffect, useState } from 'react';

interface Threat {
  id: number;
  x: number;
  y: number;
  severity: 'high' | 'medium';
}

export const GlobalThreatMap: React.FC = () => {
  const [threats, setThreats] = useState<Threat[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      const newThreat: Threat = {
        id: Date.now(),
        x: Math.random() * 80 + 10,
        y: Math.random() * 50 + 20,
        severity: Math.random() > 0.7 ? 'high' : 'medium',
      };
      setThreats(prev => [...prev.slice(-12), newThreat]);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-full bg-[#030812] rounded-[2rem] overflow-hidden border border-white/10 shadow-[inset_0_0_80px_rgba(0,0,0,0.8)]">
      {/* Dynamic Scan Surface */}
      <div className="absolute inset-0 opacity-20 pointer-events-none" 
           style={{ backgroundImage: 'linear-gradient(#10b981 1px, transparent 1px), linear-gradient(90deg, #10b981 1px, transparent 1px)', backgroundSize: '30px 30px' }}>
      </div>

      <svg viewBox="0 0 1000 500" className="absolute inset-0 w-full h-full opacity-30 fill-emerald/20">
        <path d="M165,130 L180,110 L210,105 L230,120 L240,150 L220,190 L180,210 L150,190 L140,160 Z M450,80 L500,60 L550,70 L580,100 L590,150 L560,200 L500,210 L440,180 L430,130 Z M750,220 L800,200 L860,210 L900,250 L880,320 L820,350 L750,340 L720,280 Z" />
      </svg>
      
      {threats.map(threat => (
        <React.Fragment key={threat.id}>
          <div 
            className={`absolute rounded-full animate-ping ${threat.severity === 'high' ? 'w-20 h-20 bg-red-500/40' : 'w-10 h-10 bg-red-400/20'}`}
            style={{ left: `${threat.x}%`, top: `${threat.y}%`, transform: 'translate(-50%, -50%)' }}
          />
          <div 
            className={`absolute w-4 h-4 rounded-full shadow-[0_0_20px_#ef4444] animate-pulse ${threat.severity === 'high' ? 'bg-red-500' : 'bg-red-400'}`}
            style={{ left: `${threat.x}%`, top: `${threat.y}%`, transform: 'translate(-50%, -50%)' }}
          />
        </React.Fragment>
      ))}

      {/* Radar Sweep Effect */}
      <div className="absolute top-0 left-0 w-full h-[2px] bg-emerald/50 shadow-[0_0_20px_#10b981] animate-[pan_3s_linear_infinite]"></div>
      
      <div className="absolute bottom-6 left-8 flex gap-4">
        <div className="flex items-center gap-2">
           <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
           <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Live Intercepts</span>
        </div>
        <div className="text-[10px] font-mono text-emerald/40">LATENCY: 12ms</div>
      </div>

      <style>{`
        @keyframes pan {
          0% { transform: translateY(0); opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { transform: translateY(256px); opacity: 0; }
        }
      `}</style>
    </div>
  );
};
