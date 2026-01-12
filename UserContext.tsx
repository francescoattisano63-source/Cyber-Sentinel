
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User, SubscriptionTier, ScanResult } from './types';
import { supabase } from './lib/supabaseClient';
import { TIERS_CONFIG } from './constants';

interface UserContextType {
  user: User | null;
  loading: boolean;
  scanHistory: ScanResult[];
  saveScan: (scan: ScanResult) => Promise<void>;
  decrementCredits: () => Promise<void>;
  incrementScans: () => Promise<void>;
  signOut: () => Promise<void>;
  updateTier: (tier: SubscriptionTier) => Promise<void>;
  loginAsTestUser: () => void;
  refreshHistory: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [scanHistory, setScanHistory] = useState<ScanResult[]>([]);
  const [isMockSession, setIsMockSession] = useState(false);

  const fetchUserData = async (userId: string, email: string) => {
    try {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*, organizations(*)')
        .eq('id', userId)
        .single();

      if (userError) {
        const defaultTier = email.includes('enterprise') || email.includes('gold') ? SubscriptionTier.GOLD : SubscriptionTier.SILVER;
        setUser({
          uid: userId,
          email: email,
          displayName: 'Agent Pending',
          credits: TIERS_CONFIG[defaultTier].maxCredits,
          tier: defaultTier,
          scansPerformed: 0
        });
        return;
      }

      if (userData) {
        const tier = (userData.organizations?.subscription_tier?.toUpperCase() as SubscriptionTier) || SubscriptionTier.SILVER;
        setUser({
          uid: userId,
          email: email,
          displayName: userData.full_name || 'Cyber Agent',
          credits: userData.organizations?.scan_credits_remaining ?? TIERS_CONFIG[tier].maxCredits,
          tier: tier,
          scansPerformed: 0
        });
        await fetchHistory(userId);
      }
    } catch (e) {
      console.error("Error fetching user data:", e);
    }
  };

  const fetchHistory = async (userId: string) => {
    const { data, error } = await supabase
      .from('scans')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (data && !error) {
      setScanHistory(data.map((s: any) => ({
        id: s.id,
        target: s.target,
        timestamp: s.created_at,
        score: s.score,
        headers: s.result_data.headers || [],
        breaches: s.result_data.breaches || [],
        nistScores: s.result_data.nistScores || [50, 50, 50, 50, 50],
        aiReport: s.ai_report || ""
      })));
    }
  };

  const loginAsTestUser = () => {
    setIsMockSession(true);
    setUser({
      uid: 'test-uid-alpha',
      email: 'test@sentinel.io',
      displayName: 'Alpha Tester',
      credits: 9999,
      tier: SubscriptionTier.PLATINUM,
      scansPerformed: 0
    });
    setLoading(false);
  };

  useEffect(() => {
    const initSession = async () => {
      if (isMockSession) return;
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await fetchUserData(session.user.id, session.user.email!);
      }
      setLoading(false);
    };

    initSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (isMockSession) return;
      setLoading(true); // Impostiamo loading a true mentre ricarichiamo i dati della nuova sessione
      if (session) {
        await fetchUserData(session.user.id, session.user.email!);
      } else {
        setUser(null);
        setScanHistory([]);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [isMockSession]);

  const saveScan = async (scan: ScanResult) => {
    setScanHistory(prev => [scan, ...prev].slice(0, 10));
    if (user && !isMockSession) {
      await supabase.from('scans').insert({
        user_id: user.uid,
        target: scan.target,
        score: scan.score,
        ai_report: scan.aiReport,
        result_data: {
          headers: scan.headers,
          breaches: scan.breaches,
          nistScores: scan.nistScores
        }
      });
    }
  };

  const decrementCredits = async () => {
    if (!user) return;
    const newCredits = Math.max(0, user.credits - 1);
    setUser(prev => prev ? { ...prev, credits: newCredits } : null);
  };

  const incrementScans = async () => {
    if (!user) return;
    setUser(prev => prev ? { ...prev, scansPerformed: (prev.scansPerformed || 0) + 1 } : null);
  };

  const updateTier = async (tier: SubscriptionTier) => {
    if (!user) return;
    setUser(prev => prev ? { ...prev, tier, credits: TIERS_CONFIG[tier].maxCredits } : null);
  };

  const signOut = async () => {
    setIsMockSession(false);
    await supabase.auth.signOut();
    setUser(null);
  };

  const refreshHistory = async () => {
    if (user) await fetchHistory(user.uid);
  };

  return (
    <UserContext.Provider value={{ user, loading, scanHistory, saveScan, decrementCredits, incrementScans, signOut, updateTier, loginAsTestUser, refreshHistory }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser must be used within a UserProvider');
  return context;
};
