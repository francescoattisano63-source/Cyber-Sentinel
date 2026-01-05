
import React, { useMemo } from 'react';
import { WazuhAgent } from '../types';

interface AssetTopologyProps {
  agents: WazuhAgent[];
}

export const AssetTopology: React.FC<AssetTopologyProps> = ({ agents }) => {
  const nodePositions = useMemo(() => {
    return agents.map((agent, i) => {
      // Circle layout with dynamic radius adjustment
      const radius = 38; 
      const angle = (i * (360 / agents.length)) * (Math.PI / 180);
      return {
        x: 50 + radius * Math.cos(angle),
        y: 50 + radius * Math.sin(angle),
      };
    });
  }, [agents.length]);

  return (
    <div className="relative w-full h-[400px] bg-black/40 rounded-[2rem] border border-white/10 overflow-hidden flex items-center justify-center p-8 shadow-[inset_0_0_40px_rgba(0,0,0,0.5)]">
      {/* Background Grids */}
      <div className="absolute inset-0 opacity-10" style={{ 
        backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(16, 185, 129, 0.4) 1px, transparent 0)',
        backgroundSize: '24px 24px'
      }}></div>

      {/* Central Core */}
      <div className="relative z-10">
        <div className="w-24 h-24 rounded-full bg-emerald/10 border border-emerald/40 flex flex-col items-center justify-center shadow-[0_0_40px_rgba(16,185,129,0.2)]">
          <div className="absolute inset-0 rounded-full border border-emerald animate-ping opacity-10"></div>
          <i className="fas fa-project-diagram text-3xl text-emerald mb-1"></i>
          <span className="text-[8px] font-black uppercase text-white/40 tracking-[0.2em]">Core</span>
        </div>
      </div>

      {/* Connection Lines (SVG) */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {nodePositions.map((pos, i) => (
          <line 
            key={i}
            x1="50%" y1="50%" 
            x2={`${pos.x}%`} y2={`${pos.y}%`} 
            stroke="rgba(16, 185, 129, 0.2)" 
            strokeWidth="1"
            strokeDasharray="4 4"
          />
        ))}
      </svg>

      {/* Satellite Nodes */}
      {nodePositions.map((pos, i) => {
        const agent = agents[i];
        const isAlert = agent.status !== 'active';
        return (
          <div 
            key={agent.id}
            className={`absolute w-12 h-12 rounded-xl border flex items-center justify-center transition-all duration-500 hover:scale-110 cursor-help group ${
              isAlert ? 'bg-red-500/10 border-red-500/40 shadow-[0_0_15px_rgba(239,68,68,0.2)] animate-pulse' : 'bg-white/5 border-white/10'
            }`}
            style={{ left: `${pos.x}%`, top: `${pos.y}%`, transform: 'translate(-50%, -50%)' }}
          >
            <i className={`fas ${agent.name.includes('Server') ? 'fa-server' : 'fa-laptop-code'} text-lg ${isAlert ? 'text-red-500' : 'text-white/60'}`}></i>
            
            {/* Tooltip Overlay */}
            <div className="absolute bottom-full mb-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-50">
               <div className="bg-obsidian border border-white/10 px-4 py-2 rounded-lg shadow-2xl whitespace-nowrap">
                  <p className="text-[10px] font-black uppercase text-white mb-1">{agent.name}</p>
                  <p className={`text-[8px] font-mono ${isAlert ? 'text-red-400' : 'text-emerald'}`}>{agent.status.toUpperCase()} // ID: {agent.id}</p>
               </div>
            </div>
          </div>
        );
      })}

      <div className="absolute top-6 left-6 flex items-center gap-2 opacity-50">
         <div className="w-1.5 h-1.5 rounded-full bg-emerald animate-pulse"></div>
         <span className="text-[9px] font-black uppercase tracking-widest">Active Mesh Monitoring</span>
      </div>
    </div>
  );
};
