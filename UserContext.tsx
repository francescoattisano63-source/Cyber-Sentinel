
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User, SubscriptionTier, ScanResult } from './types';
import { MOCK_USER_EMAIL } from './constants';

interface UserContextType {
  user: User;
  scanHistory: ScanResult[];
  saveScan: (scan: ScanResult) => void;
  decrementCredits: () => void;
  incrementScans: () => void;
  updateUser: (updates: Partial<User>) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>(() => {
    const saved = localStorage.getItem('sentinel_user');
    return saved ? JSON.parse(saved) : {
      uid: 'sentinel-001',
      email: MOCK_USER_EMAIL,
      displayName: 'Elite Enterprise',
      credits: 10,
      tier: SubscriptionTier.GOLD,
      scansPerformed: 0
    };
  });

  const [scanHistory, setScanHistory] = useState<ScanResult[]>(() => {
    const saved = localStorage.getItem('sentinel_history');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('sentinel_user', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem('sentinel_history', JSON.stringify(scanHistory));
  }, [scanHistory]);

  const saveScan = (scan: ScanResult) => {
    setScanHistory(prev => [scan, ...prev].slice(0, 10)); // Keep last 10
  };

  const decrementCredits = () => {
    setUser(prev => ({ ...prev, credits: Math.max(0, prev.credits - 1) }));
  };

  const incrementScans = () => {
    setUser(prev => ({ ...prev, scansPerformed: prev.scansPerformed + 1 }));
  };

  const updateUser = (updates: Partial<User>) => {
    setUser(prev => ({ ...prev, ...updates }));
  };

  return (
    <UserContext.Provider value={{ user, scanHistory, saveScan, decrementCredits, incrementScans, updateUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser must be used within a UserProvider');
  return context;
};
