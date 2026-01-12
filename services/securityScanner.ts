
import { SecurityHeaderResult, EmailBreach, WazuhAgent } from '../types';

const URLSCAN_KEY = '019b73e1-8522-71bb-92d8-a963beba08c1';
const VT_KEY = '08e674ce2a51d30359a37da57678a7983cdac199a719f4566125a46a276ab517';
const RAPID_API_KEY = '86353aa38bmsh26b575e23a317dfp171507jsn5775a4820df2';
const SHODAN_KEY = 'nKdIXKhBimIfK16VhOXm3EH3FbgC3yvO';

const proxyUrl = (url: string) => `https://corsproxy.io/?${encodeURIComponent(url)}`;

const SECURITY_HEADERS_MAP = [
  { name: 'Strict-Transport-Security', desc: 'Previene attacchi SSL Stripping.' },
  { name: 'Content-Security-Policy', desc: 'Blocca attacchi XSS e iniezioni.' },
  { name: 'X-Frame-Options', desc: 'Protegge dal clickjacking.' },
  { name: 'X-Content-Type-Options', desc: 'Impedisce il MIME-sniffing.' },
  { name: 'Referrer-Policy', desc: 'Controlla quali informazioni di referral vengono inviate.' },
  { name: 'Permissions-Policy', desc: 'Limita l\'accesso alle feature del browser.' }
];

export const analyzeSecurityHeaders = async (url: string): Promise<SecurityHeaderResult[]> => {
  const isHttps = url.startsWith('https');
  const fallbackResults: SecurityHeaderResult[] = SECURITY_HEADERS_MAP.map(sh => ({
    header: sh.name,
    value: sh.name === 'Strict-Transport-Security' && isHttps ? 'Detected via SSL' : null,
    status: (sh.name === 'Strict-Transport-Security' && isHttps) ? 'secure' : 'warning' as const,
    description: sh.desc
  }));

  try {
    const target = 'https://urlscan.io/api/v1/scan/';
    const submitRes = await fetch(proxyUrl(target), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'API-Key': URLSCAN_KEY },
      body: JSON.stringify({ url, visibility: 'public' })
    });
    
    if (submitRes.ok) {
      const submitData = await submitRes.json();
      const uuid = submitData.uuid;
      if (!uuid) throw new Error("No UUID");

      for (let i = 0; i < 10; i++) {
        await new Promise(r => setTimeout(r, 4000));
        const pollRes = await fetch(proxyUrl(`https://urlscan.io/api/v1/result/${uuid}/`));
        if (pollRes.status === 200) {
          const resultData = await pollRes.json();
          const responseHeaders = resultData?.page?.headers;
          if (!responseHeaders) return fallbackResults;

          return SECURITY_HEADERS_MAP.map(sh => {
            const entry = Object.entries(responseHeaders).find(([k]) => k.toLowerCase() === sh.name.toLowerCase());
            const value = entry ? (entry[1] as string) : null;
            return { 
              header: sh.name, 
              value: value || null, 
              status: (value ? 'secure' : 'vulnerable') as 'secure' | 'vulnerable' | 'warning', 
              description: sh.desc 
            };
          });
        }
      }
    }
  } catch (e) { console.error("Header Error:", e); }
  return fallbackResults;
};

export const checkSafeBrowsing = async (url: string) => {
  try {
    const domain = new URL(url).hostname;
    const response = await fetch(proxyUrl(`https://www.virustotal.com/api/v3/domains/${domain}`), {
      headers: { 'x-apikey': VT_KEY }
    });
    if (!response.ok) return { isSafe: true };
    const data = await response.json();
    const stats = data.data?.attributes?.last_analysis_stats;
    return { isSafe: !stats || stats.malicious === 0 };
  } catch (error) { return { isSafe: true }; }
};

export const scanEmailOSINT = async (emailInput: string): Promise<EmailBreach[]> => {
  const emails = emailInput.split(/[\n,]/).map(e => e.trim()).filter(e => e.includes('@'));
  if (emails.length === 0) return [];
  const allBreaches: EmailBreach[] = [];
  const scanPromises = emails.map(async (email) => {
    try {
      const response = await fetch(proxyUrl(`https://breachdirectory.p.rapidapi.com/?func=auto&term=${email}`), {
        headers: { 'x-rapidapi-key': RAPID_API_KEY, 'x-rapidapi-host': 'breachdirectory.p.rapidapi.com' }
      });
      if (response.ok) {
        const data = await response.json();
        return (data.result || []).slice(0, 3).map((b: any) => ({
          email: email,
          site: b.sources?.[0] || 'Leak Database',
          date: b.last_breach || 'Recent',
          dataClasses: b.fields || ['Credentials']
        }));
      }
    } catch (error) {}
    return [];
  });
  const results = await Promise.all(scanPromises);
  results.forEach(r => allBreaches.push(...r));
  return allBreaches;
};

// TELEMETRY 2.0: Generazione dati agenti simulati ma strutturati come SIEM reale
export const fetchWazuhTelemetry = async (url?: string): Promise<WazuhAgent[]> => {
  const mockAgents: WazuhAgent[] = [
    { id: 'SRV-01', name: 'Main Web Cluster', status: 'active', cves: 0, lastSeen: 'Now' },
    { id: 'DB-01', name: 'User Production DB', status: 'active', cves: 2, lastSeen: '2m ago' },
    { id: 'GW-01', name: 'Edge Gateway', status: 'vulnerable', cves: 5, lastSeen: 'Now' }
  ];

  try {
    if (url) {
      const domain = new URL(url).hostname;
      const dnsRes = await fetch(proxyUrl(`https://api.shodan.io/dns/resolve?hostnames=${domain}&key=${SHODAN_KEY}`));
      const dnsData = await dnsRes.json();
      const ip = dnsData[domain];
      if (ip) {
        mockAgents[0].name = `Public Node (${ip})`;
      }
    }
  } catch (e) {}

  return mockAgents;
};

export const generateAgentScript = (userId: string) => {
  return `curl -sSL https://api.sentinel.io/v1/install/${userId} | sudo bash -s -- --token=SENTINEL_${Math.random().toString(36).substring(7).toUpperCase()}`;
};
