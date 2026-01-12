
import React from 'react';

export const NeuralAtom: React.FC<{ active?: boolean; color?: string }> = ({ active = true, color = '#10b981' }) => {
  return (
    <div className={`relative flex items-center justify-center w-64 h-64 mx-auto perspective-1000 ${active ? 'opacity-100' : 'opacity-20'}`}>
      {/* Nucleo */}
      <div 
        className={`absolute w-8 h-8 rounded-full z-20 transition-all duration-1000 ${active ? 'animate-pulse scale-110' : 'scale-75'}`}
        style={{ backgroundColor: color, boxShadow: `0 0 30px ${color}` }}
      ></div>
      
      {/* Orbite */}
      <div className="absolute inset-0 border-2 rounded-full animate-[spin_3s_linear_infinite] rotate-x-45 rotate-y-45" style={{ borderColor: `${color}22` }}>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full" style={{ backgroundColor: color, boxShadow: `0 0 15px ${color}` }}></div>
      </div>
      
      <div className="absolute inset-0 border-2 border-gold/10 rounded-full animate-[spin_4s_linear_infinite_reverse] rotate-x-60 rotate-y--30">
        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-2 h-2 rounded-full bg-gold shadow-[0_0_15px_#FFD700]"></div>
      </div>
      
      <div className="absolute inset-0 border-2 border-white/5 rounded-full animate-[spin_6s_linear_infinite] rotate-x-30 rotate-y-60">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-white shadow-[0_0_10px_white]"></div>
      </div>

      {/* Glow Effects */}
      <div className="absolute inset-0 blur-[80px] rounded-full opacity-20" style={{ backgroundColor: color }}></div>
      
      <style>{`
        .rotate-x-45 { transform: rotateX(45deg); }
        .rotate-y-45 { transform: rotateY(45deg); }
        .rotate-x-60 { transform: rotateX(60deg); }
        .rotate-y--30 { transform: rotateY(-30deg); }
        .rotate-x-30 { transform: rotateX(30deg); }
        .rotate-y-60 { transform: rotateY(60deg); }
        .perspective-1000 { perspective: 1000px; }
      `}</style>
    </div>
  );
};
