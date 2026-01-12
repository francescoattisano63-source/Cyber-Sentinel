
import { SubscriptionTier } from './types';

export interface TierCapabilities {
  name: string;
  maxCredits: number;
  hasForensics: boolean;
  hasCompliance: boolean;
  hasKoreLive: boolean;
  koreMessageLimit: number;
  scanFrequency: 'daily' | 'hourly' | 'realtime';
}

export const TIERS_CONFIG: Record<SubscriptionTier, TierCapabilities> = {
  [SubscriptionTier.FREE]: {
    name: 'Trial',
    maxCredits: 3,
    hasForensics: false,
    hasCompliance: false,
    hasKoreLive: false,
    koreMessageLimit: 2,
    scanFrequency: 'daily'
  },
  [SubscriptionTier.SILVER]: {
    name: 'Silver',
    maxCredits: 30,
    hasForensics: false,
    hasCompliance: false,
    hasKoreLive: false,
    koreMessageLimit: 10,
    scanFrequency: 'daily'
  },
  [SubscriptionTier.GOLD]: {
    name: 'Gold',
    maxCredits: 999,
    hasForensics: true,
    hasCompliance: true,
    hasKoreLive: true,
    koreMessageLimit: 9999,
    scanFrequency: 'hourly'
  },
  [SubscriptionTier.PLATINUM]: {
    name: 'Platinum',
    maxCredits: 9999,
    hasForensics: true,
    hasCompliance: true,
    hasKoreLive: true,
    koreMessageLimit: 99999,
    scanFrequency: 'realtime'
  },
};

export const NIST_CSF_CATEGORIES = [
  'Identify',
  'Protect',
  'Detect',
  'Respond',
  'Recover'
];
