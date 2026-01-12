
import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';

export type NotificationType = 'info' | 'alert' | 'success';

interface Notification {
  id: string;
  message: string;
  type: NotificationType;
}

interface NotificationContextType {
  notify: (message: string, type: NotificationType) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const notify = (message: string, type: NotificationType) => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 4000);
  };

  return (
    <NotificationContext.Provider value={{ notify }}>
      {children}
      <div className="fixed bottom-10 right-10 z-[300] flex flex-col gap-4 pointer-events-none">
        {notifications.map(n => (
          <div 
            key={n.id}
            className={`pointer-events-auto min-w-[300px] glass p-6 rounded-2xl border-l-4 flex items-center gap-4 animate-in slide-in-from-right duration-500 shadow-2xl ${
              n.type === 'success' ? 'border-emerald bg-emerald/10' : 
              n.type === 'alert' ? 'border-red-500 bg-red-500/10' : 'border-gold bg-gold/10'
            }`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
              n.type === 'success' ? 'bg-emerald/20 text-emerald' : 
              n.type === 'alert' ? 'bg-red-500/20 text-red-500' : 'bg-gold/20 text-gold'
            }`}>
              <i className={`fas ${n.type === 'success' ? 'fa-check' : n.type === 'alert' ? 'fa-radiation' : 'fa-info-circle'} text-xs`}></i>
            </div>
            <p className="text-[11px] font-black uppercase tracking-wider text-white/90">{n.message}</p>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotify = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotify must be used within a NotificationProvider');
  return context;
};
