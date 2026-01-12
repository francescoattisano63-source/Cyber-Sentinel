
import { SecurityHeaderResult, EmailBreach } from '../types';

export interface ThreatCorrelation {
  id: string;
  title: string;
  description: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  involvedAssets: string[];
}

export interface DriftData {
  scoreDelta: number;
  newVulnerabilities: string[];
  resolvedVulnerabilities: string[];
}

export interface ScoringDetailedResult {
  finalScore: number;
  headerGrade: number;
  osintPenalty: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  isShielded: boolean;
  correlations: ThreatCorrelation[];
  drift?: DriftData;
}

export const calculateSecurityPosture20 = (
  headers: SecurityHeaderResult[],
  breaches: EmailBreach[],
  previousScan?: { headers: SecurityHeaderResult[], score: number }
): ScoringDetailedResult => {
  const REQUIRED_HEADERS = [
    'Strict-Transport-Security',
    'Content-Security-Policy',
    'X-Frame-Options',
    'X-Content-Type-Options',
    'Referrer-Policy',
    'Permissions-Policy'
  ];

  const isShielded = headers.some(h => h.value?.includes('Detected via SSL'));
  let headerPoints = 0;
  const CRITICAL_WEIGHT = 20; 
  const STANDARD_WEIGHT = 7.5; 

  REQUIRED_HEADERS.forEach(req => {
    const found = headers.find(h => h.header.toLowerCase() === req.toLowerCase());
    const isCritical = req === 'Strict-Transport-Security' || req === 'Content-Security-Policy';
    const weight = isCritical ? CRITICAL_WEIGHT : STANDARD_WEIGHT;

    if (found && found.status === 'secure') {
      headerPoints += weight;
    }
  });

  let baseScore = Math.round(headerPoints);
  if (isShielded && baseScore < 40) baseScore = 45;

  const osintPenalty = Math.min(30, breaches.length * 6);
  
  const correlations: ThreatCorrelation[] = [];
  let riskMultiplier = 1;

  const hasNoCSP = headers.find(h => h.header === 'Content-Security-Policy' && h.status !== 'secure');
  const hasNoXFrame = headers.find(h => h.header === 'X-Frame-Options' && h.status !== 'secure');
  const hasBreaches = breaches.length > 0;

  if (hasBreaches && hasNoXFrame) {
    correlations.push({
      id: 'CORR_01',
      title: 'Credential Stuffing via Clickjacking',
      description: 'Le email esposte nel Dark Web possono essere rubate di nuovo tramite un attacco Clickjacking poiché X-Frame-Options è mancante.',
      severity: 'CRITICAL',
      involvedAssets: ['X-Frame-Options', 'OSINT Breaches']
    });
    riskMultiplier += 0.2;
  }

  if (hasBreaches && hasNoCSP) {
    correlations.push({
      id: 'CORR_02',
      title: 'Session Hijacking XSS Path',
      description: 'L\'assenza di CSP permette l\'iniezione di script che, combinati con email note, facilitano il furto di sessioni amministrative.',
      severity: 'HIGH',
      involvedAssets: ['Content-Security-Policy', 'Email Targets']
    });
    riskMultiplier += 0.15;
  }

  const calculatedScore = Math.max(5, Math.min(100, (baseScore - osintPenalty) / riskMultiplier));
  const finalScore = Math.round(calculatedScore);

  let drift: DriftData | undefined;
  if (previousScan) {
    const newVulnerabilities = headers
      .filter(h => h.status !== 'secure' && previousScan.headers.find(ph => ph.header === h.header && ph.status === 'secure'))
      .map(h => h.header);
    
    const resolvedVulnerabilities = headers
      .filter(h => h.status === 'secure' && previousScan.headers.find(ph => ph.header === h.header && ph.status !== 'secure'))
      .map(h => h.header);

    drift = {
      scoreDelta: finalScore - previousScan.score,
      newVulnerabilities,
      resolvedVulnerabilities
    };
  }

  let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
  if (finalScore < 35) riskLevel = 'CRITICAL';
  else if (finalScore < 60) riskLevel = 'HIGH';
  else if (finalScore < 85) riskLevel = 'MEDIUM';

  return {
    finalScore,
    headerGrade: baseScore,
    osintPenalty,
    riskLevel,
    isShielded,
    correlations,
    drift
  };
};
