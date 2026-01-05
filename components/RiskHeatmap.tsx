
import React from 'react';

interface RiskHeatmapProps {
  nistScores: number[];
}

export const RiskHeatmap: React.FC<RiskHeatmapProps> = ({ nistScores }) => {
  const avg = nistScores.reduce((a, b) => a + b, 0) / 5;
  // Map average score to coordinates (1-5)
  const impact = Math.min(5, Math.ceil((100 - avg) / 20));
  const likelihood = Math.min(5, Math.ceil((100 - nistScores[2]) / 20)); // Focus on 'Detect' for likelihood

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-6 grid-rows-6 gap-2 w-full aspect-square md:aspect-auto md:h-64">
        {/* Labels */}
        <div className="col-start-1 row-start-1 flex items-center justify-center text-[8px] font-black text-white/30 uppercase vertical-text">Impact</div>
        {[5, 4, 3, 2, 1].map((val, i) => (
          <div key={val} className={`col-start-1 row-start-${i + 2} flex items-center justify-center text-[10px] font-bold text-white/40`}>{val}</div>
        ))}
        
        {/* Grid cells */}
        {Array.from({ length: 25 }).map((_, i) => {
          const row = Math.floor(i / 5) + 1; // 1 to 5
          const col = (i % 5) + 1; // 1 to 5
          const displayRow = 6 - row;
          const displayCol = col + 1;
          
          const isSelected = displayRow === impact && col === likelihood;
          
          // Color logic
          let bgColor = 'bg-white/5';
          if (row + col > 7) bgColor = 'bg-red-500/20 border-red-500/40';
          else if (row + col > 5) bgColor = 'bg-gold/20 border-gold/40';
          else bgColor = 'bg-emerald/20 border-emerald/40';

          return (
            <div 
              key={i} 
              className={`col-start-${displayCol} row-start-${row + 1} rounded-md border flex items-center justify-center transition-all duration-1000 ${bgColor} ${isSelected ? 'ring-4 ring-white ring-inset shadow-[0_0_20px_white]' : 'opacity-40'}`}
            >
              {isSelected && <div className="w-2 h-2 rounded-full bg-white animate-ping"></div>}
            </div>
          );
        })}

        {/* X labels */}
        {[1, 2, 3, 4, 5].map((val) => (
          <div key={val} className={`col-start-${val + 1} row-start-1 flex items-center justify-center text-[10px] font-bold text-white/40`}>{val}</div>
        ))}
        <div className="col-start-2 col-span-5 row-start-1 flex items-center justify-center text-[8px] font-black text-white/30 uppercase mt-[-20px]">Likelihood</div>
      </div>
      
      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-white/40 border-t border-white/5 pt-4">
        <span>Current Risk Level:</span>
        <span className={impact > 3 ? 'text-red-500' : impact > 2 ? 'text-gold' : 'text-emerald'}>
          {impact > 3 ? 'CRITICAL' : impact > 2 ? 'ELEVATED' : 'STABLE'}
        </span>
      </div>
      
      <style>{`
        .vertical-text { writing-mode: vertical-rl; transform: rotate(180deg); }
      `}</style>
    </div>
  );
};
