
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
    <div className={`glass rounded-[2rem] p-10 transition-all duration-500 hover:border-emerald/40 hover:bg-white/[0.06] group shadow-2xl ${className}`}>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-5">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border ${isGold ? 'bg-gold/10 border-gold/30' : 'bg-emerald/10 border-emerald/30'}`}>
            <i className={`fas ${icon} ${isGold ? 'text-gold' : 'text-emerald'} text-2xl`}></i>
          </div>
          <div>
            <h3 className="text-xl font-black text-white uppercase tracking-widest">{title}</h3>
            {subtitle && <p className="text-sm text-white/60 font-medium mt-1">{subtitle}</p>}
          </div>
        </div>
        <button className="w-10 h-10 rounded-full hover:bg-white/10 flex items-center justify-center transition-all">
          <i className="fas fa-ellipsis-h text-white/30"></i>
        </button>
      </div>
      <div className="text-white">
        {children}
      </div>
    </div>
  );
};
