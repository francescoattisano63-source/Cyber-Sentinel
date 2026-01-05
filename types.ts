
export enum SubscriptionTier {
  FREE = 'FREE',
  SILVER = 'SILVER',
  GOLD = 'GOLD',
  PLATINUM = 'PLATINUM'
}

export interface User {
  uid: string;
  email: string;
  displayName: string;
  credits: number;
  tier: SubscriptionTier;
  scansPerformed: number;
  nextScanDate?: string;
}

export interface SecurityHeaderResult {
  header: string;
  value: string | null;
  status: 'secure' | 'vulnerable' | 'warning';
  description: string;
}

export interface ScanResult {
  id: string;
  target: string;
  timestamp: string;
  score: number;
  headers: SecurityHeaderResult[];
  breaches: EmailBreach[];
  nistScores: number[];
  aiReport: string;
}

export interface WazuhAgent {
  id: string;
  name: string;
  status: 'active' | 'disconnected' | 'vulnerable';
  cves: number;
  lastSeen: string;
}

export interface EmailBreach {
  site: string;
  date: string;
  dataClasses: string[];
}
