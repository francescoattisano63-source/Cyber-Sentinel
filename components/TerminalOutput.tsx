
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
      className="mt-6 bg-black/90 border border-emerald/30 rounded-2xl p-6 h-56 overflow-y-auto font-mono text-[11px] leading-relaxed shadow-2xl"
    >
      <div className="flex items-center gap-3 mb-4 border-b border-white/10 pb-3">
        <div className="flex gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/60 shadow-[0_0_5px_rgba(239,68,68,0.3)]"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60 shadow-[0_0_5px_rgba(234,179,8,0.3)]"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-emerald/60 shadow-[0_0_5px_rgba(16,185,129,0.3)]"></div>
        </div>
        <span className="text-white/40 text-[9px] uppercase font-black tracking-[0.3em]">Sentinel-OS Shell v2.1</span>
      </div>
      {logs.map((log, i) => (
        <div key={i} className="mb-2 flex gap-3 group">
          <span className="text-emerald/40 font-bold shrink-0">[{new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}]</span>
          <span className={`${log.includes('[ERROR]') ? 'text-red-400 font-bold' : log.includes('[WARN]') ? 'text-gold' : 'text-emerald/90'} group-hover:text-white transition-colors`}>
            {log}
          </span>
        </div>
      ))}
      {isScanning && (
        <div className="flex items-center gap-2 text-emerald animate-pulse mt-1">
          <span className="font-bold">SYSTEM ACTIVE</span>
          <span className="w-2 h-4 bg-emerald"></span>
        </div>
      )}
    </div>
  );
};
