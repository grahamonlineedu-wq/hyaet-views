const express = require('express');
const path = require('path');
const tls = require('tls');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, 'hyaet_db.json');

// Initialize local JSON storage if not present
if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify({ scan_logs: [], custom_rules: [] }, null, 2));
}

function readDb() {
  try {
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  } catch (err) {
    return { scan_logs: [], custom_rules: [] };
  }
}

function writeDb(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

app.use(express.json());
app.use(express.static(path.join(__dirname)));

// API Key Middleware
const API_KEY = "hyaet_sec_secret_key_2026";
app.use((req, res, next) => {
  if (req.path.startsWith('/api/v1/')) {
    const apiKey = req.headers['x-api-key'];
    if (apiKey !== API_KEY) {
      return res.status(401).json({ error: 'Unauthorized: Invalid or missing X-API-KEY header.' });
    }
  }
  next();
});

// SSL Inspection Helper
function checkSSLCertificate(hostname) {
  return new Promise((resolve) => {
    if (!hostname || hostname.match(/^(\d{1,3}\.){3}\d{1,3}$/)) {
      return resolve({ valid: false, reason: 'Raw IP address or empty host (No SSL certificate)' });
    }

    const socket = tls.connect(443, hostname, { servername: hostname, timeout: 3000 }, () => {
      const cert = socket.getPeerCertificate();
      const valid = socket.authorized;
      socket.end();
      resolve({
        valid: valid,
        issuer: cert && cert.issuer ? cert.issuer.O || cert.issuer.CN : 'Unknown',
        validTo: cert ? cert.valid_to : 'Unknown',
        reason: valid ? 'Valid SSL/TLS Certificate' : socket.authorizationError || 'Untrusted Certificate'
      });
    });

    socket.on('error', (err) => {
      resolve({ valid: false, reason: `SSL Connection failed: ${err.message}` });
    });

    socket.setTimeout(3000, () => {
      socket.destroy();
      resolve({ valid: false, reason: 'SSL Inspection connection timed out' });
    });
  });
}

// Custom Rules Engine Helper
function checkCustomRules(parsedUrl) {
  const db = readDb();
  const rules = db.custom_rules || [];
  const hostname = parsedUrl.hostname.toLowerCase();
  const fullUrl = parsedUrl.href.toLowerCase();

  const isWhitelisted = rules.some(r => r.type === 'WHITELIST' && hostname.includes(r.value.toLowerCase()));
  if (isWhitelisted) {
    return { whitelisted: true };
  }

  const customBlacklistMatches = rules
    .filter(r => r.type === 'BLACKLIST_KEYWORD' && fullUrl.includes(r.value.toLowerCase()))
    .map(r => `Custom Rule Flagged Keyword: "${r.value}"`);

  return { whitelisted: false, customFlags: customBlacklistMatches };
}

// Core Scanner
async function performScan(targetUrl) {
  let reputationScore = 100;
  let threatCount = 0;
  const threatDetails = [];

  let normalizedUrl = targetUrl.trim();
  if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
    normalizedUrl = 'http://' + normalizedUrl;
  }

  let parsed;
  try {
    parsed = new URL(normalizedUrl);
  } catch (err) {
    return {
      url: targetUrl,
      status: 'HIGH RISK',
      reputationScore: 0,
      threatCount: 1,
      threatDetails: ['Invalid or malformed URL syntax'],
      sslInfo: { valid: false, reason: 'Invalid URL' }
    };
  }

  // Custom Rules Check
  const customRuleResult = checkCustomRules(parsed);
  if (customRuleResult.whitelisted) {
    return {
      url: normalizedUrl,
      status: 'CLEAN (WHITELISTED)',
      reputationScore: 100,
      threatCount: 0,
      threatDetails: ['Domain matches user custom Whitelist rule.'],
      sslInfo: { valid: true, reason: 'Whitelisted Host' }
    };
  }

  if (customRuleResult.customFlags && customRuleResult.customFlags.length > 0) {
    customRuleResult.customFlags.forEach(flag => {
      reputationScore -= 30;
      threatCount++;
      threatDetails.push(flag);
    });
  }

  // Heuristics Checks
  if (/^(\d{1,3}\.){3}\d{1,3}$/.test(parsed.hostname)) {
    reputationScore -= 35;
    threatCount++;
    threatDetails.push('Uses raw IP address instead of domain name.');
  }

  const riskyTLDs = ['.zip', '.mov', '.top', '.xyz', '.work', '.kim', '.gq', '.tk'];
  if (riskyTLDs.some(tld => parsed.hostname.endsWith(tld))) {
    reputationScore -= 25;
    threatCount++;
    threatDetails.push('Uses high-risk top-level domain (TLD) commonly associated with abuse.');
  }

  const suspiciousKeywords = ['login', 'verify', 'update', 'account', 'banking', 'secure', 'wallet', 'credential'];
  const matches = suspiciousKeywords.filter(keyword => parsed.href.toLowerCase().includes(keyword));
  if (matches.length > 0) {
    reputationScore -= (matches.length * 15);
    threatCount += matches.length;
    threatDetails.push(`Contains suspicious keyword(s) in URL path: [${matches.join(', ')}]`);
  }

  if (parsed.hostname.split('.').length > 4) {
    reputationScore -= 20;
    threatCount++;
    threatDetails.push('Excessive subdomain nesting depth detected.');
  }

  // SSL Certificate Check
  const sslInfo = await checkSSLCertificate(parsed.hostname);
  if (!sslInfo.valid && parsed.protocol === 'https:') {
    reputationScore -= 20;
    threatCount++;
    threatDetails.push(`SSL/TLS Inspection Issue: ${sslInfo.reason}`);
  }

  // Live Threat DB Query
  try {
    const apiResponse = await fetch('https://urlhaus-api.abuse.ch/v1/url/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `url=${encodeURIComponent(normalizedUrl)}`
    });
    const apiData = await apiResponse.json();

    if (apiData.query_status === 'ok') {
      reputationScore = 0;
      threatCount++;
      threatDetails.push(`[URLHaus Intelligence] Flagged as ACTIVE MALWARE host (${apiData.threat || 'Malicious'})`);
    }
  } catch (err) {}

  reputationScore = Math.max(0, reputationScore);
  let status = 'CLEAN';
  if (reputationScore <= 40) status = 'HIGH RISK';
  else if (reputationScore <= 75) status = 'SUSPICIOUS';

  const scanPayload = {
    url: normalizedUrl,
    status,
    reputationScore,
    threatCount,
    threatDetails,
    sslInfo,
    timestamp: new Date().toISOString()
  };

  // Persist Scan Log
  const db = readDb();
  db.scan_logs.unshift(scanPayload);
  if (db.scan_logs.length > 50) db.scan_logs.pop();
  writeDb(db);

  return scanPayload;
}

// Routes
app.post('/api/scan', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'URL parameter is required.' });
  const result = await performScan(url);
  res.json(result);
});

app.post('/api/v1/scan', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'URL parameter is required.' });
  const result = await performScan(url);
  res.json({ api_version: '1.0', ...result });
});

app.get('/api/rules', (req, res) => {
  const db = readDb();
  res.json(db.custom_rules || []);
});

app.post('/api/rules', (req, res) => {
  const { type, value } = req.body;
  if (!type || !value) return res.status(400).json({ error: 'Type and Value required.' });
  const db = readDb();
  const id = Date.now();
  db.custom_rules.push({ id, type, value: value.trim() });
  writeDb(db);
  res.json({ success: true });
});

app.delete('/api/rules/:id', (req, res) => {
  const db = readDb();
  db.custom_rules = db.custom_rules.filter(r => r.id != req.params.id);
  writeDb(db);
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`Hyæt Views v2.0 server active at http://localhost:${PORT}`);
});

