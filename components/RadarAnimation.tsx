
import React from 'react';

interface RadarAnimationProps {
  isScanning?: boolean;
}

export const RadarAnimation: React.FC<RadarAnimationProps> = ({ isScanning = false }) => {
  return (
    <div className={`relative flex items-center justify-center w-full h-48 overflow-hidden rounded-xl bg-obsidian border glass transition-colors duration-500 ${isScanning ? 'border-emerald/50 bg-emerald/5' : 'border-white/10'}`}>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className={`radar-wave w-24 h-24 ${isScanning ? 'border-emerald animate-[sonar_1.5s_infinite_linear]' : 'border-white/20'}`}></div>
        <div className={`radar-wave w-24 h-24 delay-500 ${isScanning ? 'border-emerald animate-[sonar_1.5s_infinite_linear]' : 'border-white/20'}`}></div>
        <div className={`radar-wave w-24 h-24 delay-1000 ${isScanning ? 'border-emerald animate-[sonar_1.5s_infinite_linear]' : 'border-white/20'}`}></div>
      </div>
      
      <div className="z-10 text-center">
        <i className={`fas ${isScanning ? 'fa-spinner fa-spin' : 'fa-shield-halved'} ${isScanning ? 'text-gold' : 'text-emerald'} text-4xl mb-2 transition-colors duration-300`}></i>
        <p className={`text-xs font-mono uppercase tracking-widest ${isScanning ? 'text-gold' : 'text-emerald'} opacity-70`}>
          {isScanning ? 'Deep Analysis In Progress' : 'System Guard Active'}
        </p>
      </div>

      {/* Scanning sweep */}
      <div className={`absolute top-0 left-1/2 w-[2px] h-full origin-bottom transition-opacity duration-300 ${isScanning ? 'bg-gold/40 opacity-100 animate-[spin_2s_linear_infinite]' : 'bg-emerald/20 opacity-30 animate-[spin_8s_linear_infinite]'}`}></div>
    </div>
  );
};
