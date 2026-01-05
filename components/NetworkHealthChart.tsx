
import React from 'react';

interface NetworkHealthChartProps {
  data: number[];
}

export const NetworkHealthChart: React.FC<NetworkHealthChartProps> = ({ data }) => {
  const points = data.length > 0 ? data : [65, 72, 68, 85, 82, 90, 88];
  const width = 400;
  const height = 120;
  const padding = 10;
  
  const getPath = () => {
    const step = (width - padding * 2) / (points.length - 1);
    return points.map((p, i) => {
      const x = padding + i * step;
      const y = height - padding - (p / 100) * (height - padding * 2);
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
  };

  return (
    <div className="w-full h-full flex flex-col justify-end">
      <div className="flex justify-between items-end mb-2 px-1">
        <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">History Log</span>
        <span className="text-[9px] font-black text-emerald uppercase tracking-widest">Efficiency: +12%</span>
      </div>
      <div className="relative w-full h-[80px] bg-black/40 rounded-xl border border-white/5 overflow-hidden">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full preserve-3d">
          <defs>
            <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="1" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.2" />
            </linearGradient>
          </defs>
          <path
            d={getPath()}
            fill="none"
            stroke="#10b981"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]"
          />
          {/* Points */}
          {points.map((p, i) => {
            const step = (width - padding * 2) / (points.length - 1);
            const x = padding + i * step;
            const y = height - padding - (p / 100) * (height - padding * 2);
            return (
              <circle key={i} cx={x} cy={y} r="3" fill="#02070d" stroke="#10b981" strokeWidth="2" />
            );
          })}
        </svg>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent pointer-events-none"></div>
      </div>
    </div>
  );
};
