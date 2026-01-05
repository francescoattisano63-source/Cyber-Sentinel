
import React from 'react';

interface ScoreRingProps {
  score: number;
  color?: string;
}

export const ScoreRing: React.FC<ScoreRingProps> = ({ score, color = "#046404" }) => {
  const radius = 34; // Ridotto leggermente da 36 per evitare clipping
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center w-20 h-20 shrink-0">
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 80 80">
        <circle
          cx="40"
          cy="40"
          r={radius}
          stroke="currentColor"
          strokeWidth="6"
          fill="transparent"
          className="text-white/5"
        />
        <circle
          cx="40"
          cy="40"
          r={radius}
          stroke={color}
          strokeWidth="6"
          fill="transparent"
          strokeDasharray={circumference}
          style={{ 
            strokeDashoffset: offset, 
            transition: 'stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)',
            filter: `drop-shadow(0 0 4px ${color}44)`
          }}
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute text-base font-black font-mono tracking-tighter" style={{ color }}>
        {score}%
      </span>
    </div>
  );
};
