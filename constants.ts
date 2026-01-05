
import { SubscriptionTier } from './types';

export const TIERS_CONFIG = {
  [SubscriptionTier.FREE]: { name: 'Trial', credits: 5, scanLimit: 0 },
  [SubscriptionTier.SILVER]: { name: 'Silver', credits: 0, scanLimit: 2 },
  [SubscriptionTier.GOLD]: { name: 'Gold', credits: 0, scanLimit: 3 },
  [SubscriptionTier.PLATINUM]: { name: 'Platinum', credits: 0, scanLimit: 4 },
};

export const NIST_CSF_CATEGORIES = [
  'Identify',
  'Protect',
  'Detect',
  'Respond',
  'Recover'
];

export const MOCK_USER_EMAIL = 'enterprise@cyberlux.com';
