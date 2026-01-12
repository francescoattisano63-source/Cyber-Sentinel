
import React from 'react';

interface DashboardCardProps {
  title: string;
  subtitle?: string;
  icon: string;
  children: React.ReactNode;
  className?: string;
  isGold?: boolean;
}

export const DashboardCard: React.FC<DashboardCardProps> = ({ title, subtitle, icon, children, className = '', isGold = false }) => {
  return (
    <div className={`glass rounded-[2.5rem] p-8 md:p-10 cyber-card flex flex-col h-full ${className}`}>
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-6">
          <div className={`w-16 h-16 rounded-[1.25rem] flex items-center justify-center border transition-transform duration-500 group-hover:scale-110 ${isGold ? 'bg-gold/5 border-gold/20 shadow-[0_0_20px_rgba(255,215,0,0.1)]' : 'bg-emerald/5 border-emerald/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]'}`}>
            <i className={`fas ${icon} ${isGold ? 'text-gold' : 'text-emerald'} text-2xl`}></i>
          </div>
          <div>
            <h3 className="text-xl font-black text-white uppercase tracking-tighter leading-none">{title}</h3>
            {subtitle && <p className="text-[10px] text-white/40 font-black uppercase tracking-[0.2em] mt-2">{subtitle}</p>}
          </div>
        </div>
        <div className="flex gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-white/10"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-white/10"></div>
        </div>
      </div>
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
};
