
import { SecurityHeaderResult, EmailBreach, WazuhAgent } from '../types';

const URLSCAN_KEY = '019b73e1-8522-71bb-92d8-a963beba08c1';
const VT_KEY = '08e674ce2a51d30359a37da57678a7983cdac199a719f4566125a46a276ab517';
const RAPID_API_KEY = '86353aa38bmsh26b575e23a317dfp171507jsn5775a4820df2';
const SHODAN_KEY = 'nKdIXKhBimIfK16VhOXm3EH3FbgC3yvO';

const proxy = (url: string) => `https://corsproxy.io/?${encodeURIComponent(url)}`;

// Helper per la Cache (Salva crediti API)
const getCachedData = (key: string) => {
  const cached = localStorage.getItem(`cache_${key}`);
  if (!cached) return null;
  const { data, timestamp } = JSON.parse(cached);
  const now = new Date().getTime();
  if (now - timestamp > 24 * 60 * 60 * 1000) { // Scadenza 24 ore
    localStorage.removeItem(`cache_${key}`);
    return null;
  }
  return data;
};

const setCachedData = (key: string, data: any) => {
  localStorage.setItem(`cache_${key}`, JSON.stringify({
    data,
    timestamp: new Date().getTime()
  }));
};

export const analyzeSecurityHeaders = async (url: string): Promise<SecurityHeaderResult[]> => {
  const cacheKey = `headers_${url}`;
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  try {
    const submitRes = await fetch(proxy('https://urlscan.io/api/v1/scan/'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'API-Key': URLSCAN_KEY },
      body: JSON.stringify({ url, visibility: 'public' })
    });
    
    const submitData = await submitRes.json();
    if (!submitData.uuid) throw new Error(submitData.message || "Sottomissione fallita");

    let resultData = null;
    for (let i = 0; i < 30; i++) {
      await new Promise(r => setTimeout(r, 2000));
      const pollRes = await fetch(proxy(`https://urlscan.io/api/v1/result/${submitData.uuid}/`));
      if (pollRes.status === 200) {
        resultData = await pollRes.json();
        break;
      }
    }

    if (!resultData) throw new Error("Timeout scansione.");

    const responseHeaders = resultData.page.headers;
    const securityHeaders = [
      { name: 'Strict-Transport-Security', desc: 'Previene attacchi SSL Stripping.' },
      { name: 'Content-Security-Policy', desc: 'Blocca attacchi XSS e injection.' },
      { name: 'X-Frame-Options', desc: 'Protegge dal clickjacking.' },
      { name: 'X-Content-Type-Options', desc: 'Impedisce il MIME-sniffing.' },
      { name: 'Referrer-Policy', desc: 'Gestisce la privacy del referrer.' },
      { name: 'Permissions-Policy', desc: 'Limita l\'accesso a feature del browser.' }
    ];

    // Fix: cast status to specific literals to satisfy SecurityHeaderResult interface at line 79
    const results: SecurityHeaderResult[] = securityHeaders.map(sh => {
      const value = responseHeaders[sh.name.toLowerCase()] || responseHeaders[sh.name];
      const status = (value ? 'secure' : (sh.name.includes('Security') || sh.name.includes('Transport')) ? 'vulnerable' : 'warning') as 'secure' | 'vulnerable' | 'warning';
      return {
        header: sh.name,
        value: value || null,
        status: status,
        description: sh.desc
      };
    });

    setCachedData(cacheKey, results);
    return results;
  } catch (error: any) {
    return [{ header: 'Status', value: null, status: 'warning', description: error.message || 'Errore rete.' }];
  }
};

export const checkSafeBrowsing = async (url: string) => {
  const domain = new URL(url).hostname;
  const cacheKey = `vt_${domain}`;
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  try {
    const response = await fetch(proxy(`https://www.virustotal.com/api/v3/domains/${domain}`), {
      headers: { 'x-apikey': VT_KEY }
    });
    const data = await response.json();
    if (!data.data) return { isSafe: true, threatType: 'NONE' };

    const stats = data.data.attributes.last_analysis_stats;
    const res = {
      isSafe: !(stats.malicious > 1),
      threatType: stats.malicious > 1 ? 'REPUTATION_ALERT' : 'NONE',
      maliciousCount: stats.malicious,
      suspiciousCount: stats.suspicious
    };
    setCachedData(cacheKey, res);
    return res;
  } catch (error) {
    return { isSafe: true, threatType: 'NONE' };
  }
};

export const scanEmailOSINT = async (email: string): Promise<EmailBreach[]> => {
  const cacheKey = `breach_${email}`;
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  try {
    const response = await fetch(proxy(`https://breachdirectory.p.rapidapi.com/?func=auto&term=${email}`), {
      headers: { 'x-rapidapi-key': RAPID_API_KEY, 'x-rapidapi-host': 'breachdirectory.p.rapidapi.com' }
    });
    const data = await response.json();
    if (!data.result) return [];
    const res = data.result.slice(0, 5).map((b: any) => ({
      site: b.sources?.[0] || 'Leak Database',
      date: b.last_breach || 'Recent',
      dataClasses: b.fields || ['Credentials']
    }));
    setCachedData(cacheKey, res);
    return res;
  } catch (error) {
    return [];
  }
};

export const fetchWazuhTelemetry = async (url?: string): Promise<WazuhAgent[]> => {
  const domain = url ? new URL(url).hostname : 'google.com';
  const cacheKey = `shodan_${domain}`;
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  try {
    const dnsRes = await fetch(proxy(`https://api.shodan.io/dns/resolve?hostnames=${domain}&key=${SHODAN_KEY}`));
    const dnsData = await dnsRes.json();
    const ip = dnsData[domain] || Object.values(dnsData)[0];

    if (!ip) throw new Error("No IP");

    const hostRes = await fetch(proxy(`https://api.shodan.io/shodan/host/${ip}?key=${SHODAN_KEY}`));
    const hostData = await hostRes.json();

    const res = (hostData.ports || []).map((port: number, i: number) => ({
      id: `P-${port}`,
      name: `Svc ${port}/${hostData.data[i]?.transport || 'TCP'}`,
      status: hostData.vulns ? 'vulnerable' : 'active',
      cves: hostData.vulns ? hostData.vulns.length : 0,
      lastSeen: 'Now'
    }));
    setCachedData(cacheKey, res);
    return res;
  } catch (error) {
    return [{ id: '001', name: 'Discovery Offline', status: 'active', cves: 0, lastSeen: 'N/A' }];
  }
};
