
import React, { useEffect, useRef } from 'react';

interface TerminalOutputProps {
  logs: string[];
  isScanning: boolean;
}

export const TerminalOutput: React.FC<TerminalOutputProps> = ({ logs, isScanning }) => {
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logs]);

  if (!isScanning && logs.length === 0) return null;

  return (
    <div 
      ref={terminalRef}
      className="mt-10 bg-black/60 border border-white/5 rounded-[1.5rem] p-8 h-64 overflow-y-auto font-mono text-[11px] leading-relaxed shadow-inner backdrop-blur-md"
    >
      <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-4">
        <div className="flex gap-2">
          <div className="w-2 h-2 rounded-full bg-red-500/40"></div>
          <div className="w-2 h-2 rounded-full bg-emerald/40"></div>
        </div>
        <span className="text-white/20 text-[8px] uppercase font-black tracking-[0.5em]">System Log v2.0</span>
      </div>
      {logs.map((log, i) => (
        <div key={i} className="mb-3 flex gap-4 group">
          <span className="text-white/10 font-black shrink-0">{new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
          <span className={`${log.includes('ERRORE') || log.includes('CRITICAL') ? 'text-red-400 font-black' : log.includes('IA') ? 'text-gold font-black' : 'text-emerald/80'} group-hover:text-white transition-colors`}>
            {log}
          </span>
        </div>
      ))}
      {isScanning && (
        <div className="flex items-center gap-3 text-emerald animate-pulse mt-4 bg-emerald/5 p-2 rounded-lg border border-emerald/10 inline-flex">
          <div className="w-2 h-2 rounded-full bg-emerald"></div>
          <span className="font-black text-[9px] tracking-widest uppercase">Kernel Analysis Active</span>
        </div>
      )}
    </div>
  );
};
