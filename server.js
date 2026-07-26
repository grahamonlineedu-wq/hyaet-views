const express = require('express');
const path = require('path');
const https = require('https');
const tls = require('tls');
const Database = require('better-sqlite3');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize SQLite Database
const db = new Database('hyaet_views.db');
db.exec(`
  CREATE TABLE IF NOT EXISTS scan_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    url TEXT NOT NULL,
    status TEXT NOT NULL,
    score INTEGER NOT NULL,
    threat_count INTEGER NOT NULL,
    threat_details TEXT,
    ssl_valid INTEGER,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS custom_rules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL, -- 'WHITELIST' or 'BLACKLIST_KEYWORD'
    value TEXT UNIQUE NOT NULL
  );
`);

app.use(express.json());
app.use(express.static(path.join(__dirname)));

// API Key Middleware for programmatic access
const API_KEY = "hyaet_sec_secret_key_2026";
const authenticateApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (req.path.startsWith('/api/v1/') && apiKey !== API_KEY) {
    return res.status(401).json({ error: 'Unauthorized: Invalid or missing X-API-KEY header.' });
  }
  next();
};

app.use(authenticateApiKey);

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
  const rules = db.prepare('SELECT * FROM custom_rules').all();
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

// Hybrid Core Scanner
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

  // Check Custom Rules First
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

  // Rule 1: Raw IP Hostname Check
  const ipPattern = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (ipPattern.test(parsed.hostname)) {
    reputationScore -= 35;
    threatCount++;
    threatDetails.push('Uses raw IP address instead of domain name.');
  }

  // Rule 2: High-Risk TLD Check
  const riskyTLDs = ['.zip', '.mov', '.top', '.xyz', '.work', '.kim', '.gq', '.tk'];
  if (riskyTLDs.some(tld => parsed.hostname.endsWith(tld))) {
    reputationScore -= 25;
    threatCount++;
    threatDetails.push('Uses high-risk top-level domain (TLD) commonly associated with abuse.');
  }

  // Rule 3: Phishing Keyword Matcher
  const suspiciousKeywords = ['login', 'verify', 'update', 'account', 'banking', 'secure', 'wallet', 'credential'];
  const matches = suspiciousKeywords.filter(keyword => parsed.href.toLowerCase().includes(keyword));
  if (matches.length > 0) {
    reputationScore -= (matches.length * 15);
    threatCount += matches.length;
    threatDetails.push(`Contains suspicious keyword(s) in URL path: [${matches.join(', ')}]`);
  }

  // Rule 4: Subdomain Nesting Depth Check
  const domainParts = parsed.hostname.split('.');
  if (domainParts.length > 4) {
    reputationScore -= 20;
    threatCount++;
    threatDetails.push('Excessive subdomain nesting depth detected.');
  }

  // SSL Inspection
  const sslInfo = await checkSSLCertificate(parsed.hostname);
  if (!sslInfo.valid && parsed.protocol === 'https:') {
    reputationScore -= 20;
    threatCount++;
    threatDetails.push(`SSL/TLS Inspection Issue: ${sslInfo.reason}`);
  }

  // Live Threat DB Lookup (URLHaus API)
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
  } catch (err) {
    // Graceful fallback if threat intelligence API is unreachable
  }

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
    sslInfo
  };

  // Persist to SQLite
  const stmt = db.prepare(`
    INSERT INTO scan_logs (url, status, score, threat_count, threat_details, ssl_valid)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  stmt.run(normalizedUrl, status, reputationScore, threatCount, JSON.stringify(threatDetails), sslInfo.valid ? 1 : 0);

  return scanPayload;
}

// UI & REST API Routes
app.post('/api/scan', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'URL parameter is required.' });
  const result = await performScan(url);
  res.json(result);
});

// Programmatic REST API Endpoint v1 (API Key Required)
app.post('/api/v1/scan', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'URL parameter is required.' });
  const result = await performScan(url);
  res.json({ api_version: '1.0', ...result });
});

// Custom Rules Endpoints
app.get('/api/rules', (req, res) => {
  const rules = db.prepare('SELECT * FROM custom_rules').all();
  res.json(rules);
});

app.post('/api/rules', (req, res) => {
  const { type, value } = req.body;
  if (!type || !value) return res.status(400).json({ error: 'Type and Value required.' });
  try {
    const stmt = db.prepare('INSERT INTO custom_rules (type, value) VALUES (?, ?)');
    stmt.run(type, value.trim());
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: 'Rule already exists or invalid.' });
  }
});

app.delete('/api/rules/:id', (req, res) => {
  const stmt = db.prepare('DELETE FROM custom_rules WHERE id = ?');
  stmt.run(req.params.id);
  res.json({ success: true });
});

// Analytics Endpoint
app.get('/api/analytics', (req, res) => {
  const totalScans = db.prepare('SELECT COUNT(*) as count FROM scan_logs').get().count;
  const highRiskCount = db.prepare("SELECT COUNT(*) as count FROM scan_logs WHERE status = 'HIGH RISK'").get().count;
  const rulesCount = db.prepare('SELECT COUNT(*) as count FROM custom_rules').get().count;
  res.json({ totalScans, highRiskCount, rulesCount });
});

app.listen(PORT, () => {
  console.log(`Hyæt Views v2.0 active on http://localhost:${PORT}`);
});

