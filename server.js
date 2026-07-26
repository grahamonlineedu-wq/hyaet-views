const express = require('express');
const cors = require('cors')
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});
	

// Heuristic Scanner Logic}
function analyzeUrl(targetUrl) {
  let score = 100;
  const flags = [];

  try {
    const parsed = new URL(targetUrl.startsWith('http') ? targetUrl : `http://${targetUrl}`);
    const hostname = parsed.hostname;
    const pathname = parsed.pathname + parsed.search;

    // Check 1: Raw IP Address Hostname
    if (/^(\d{1,3}\.){3}\d{1,3}$/.test(hostname)) {
      score -= 30;
      flags.push('URL uses a raw IP address instead of a standard domain name');
    }

    // Check 2: High-Risk TLDs
    const suspiciousTlds = ['.zip', '.mov', '.top', '.xyz', '.work', '.kim', '.gq', '.cf'];
    if (suspiciousTlds.some(tld => hostname.endsWith(tld))) {
      score -= 20;
      flags.push('Domain uses a high-risk or commonly abused TLD');
    }

    // Check 3: Phishing Keyword Detection in Path or Hostname
    const phishingKeywords = ['login', 'signin', 'verify', 'account', 'banking', 'secure', 'update', 'paypal', 'wallet'];
    const lowerTarget = (hostname + pathname).toLowerCase();
    const matchedKeywords = phishingKeywords.filter(keyword => lowerTarget.includes(keyword));
    
    if (matchedKeywords.length > 0) {
      score -= 15 * matchedKeywords.length;
      flags.push(`Suspicious phishing keywords found: [${matchedKeywords.join(', ')}]`);
    }

    // Check 4: Excessive Subdomain Nesting
    if (hostname.split('.').length > 4) {
      score -= 15;
      flags.push('Excessive subdomain nesting detected (common in spoofing)');
    }

    // Check 5: Path Obfuscation & Long URLs
    if (pathname.length > 60 || (pathname.match(/%[0-9A-Fa-f]{2}/g) || []).length > 3) {
      score -= 10;
      flags.push('URL path contains heavy encoding or abnormal string length');
    }

    // Final Status Determination
    const finalScore = Math.max(0, score);
    let status = 'CLEAN';
    if (finalScore < 50) status = 'HIGH RISK';
    else if (finalScore < 80) status = 'SUSPICIOUS';

    return {
      url: targetUrl,
      reputationScore: finalScore,
      status: status,
      threatCount: flags.length,
      threatDetails: flags
    };

  } catch (err) {
    return {
      url: targetUrl,
      reputationScore: 0,
      status: 'INVALID FORMAT',
      threatCount: 1,
      threatDetails: ['Malformed URL string provided']
    };
  }
}

// API Endpoint;;
app.post('/api/scan', async (req, res) => {
  const { url } = req.body;
  
  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  // Step 1: Run Local Heuristics
  const result = analyzeUrl(url);

  // Step 2: Live Query to URLHaus (Free Threat Intelligence API)
  try {
    const cleanUrl = url.replace(/^(https?:\/\/)/, '');
    const apiRes = await fetch('https://urlhaus-api.abuse.ch/v1/host/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `host=${encodeURIComponent(cleanUrl)}`
    });

    const apiData = await apiRes.json();

    if (apiData.query_status === 'ok' && apiData.threat) {
      result.reputationScore = Math.max(0, result.reputationScore - 40);
      result.threatCount += 1;
      result.threatDetails.push(`Live Threat Database: Flagged for active '${apiData.threat}' malware/phishing host`);
      result.status = result.reputationScore < 50 ? 'HIGH RISK' : 'SUSPICIOUS';
    }
  } catch (apiErr) {
    // Graceful fallback to heuristic-only mode if API is unreachable
    result.threatDetails.push('Note: Live API check skipped (Offline/Fallback Mode)');
  }

  res.json(result);
});

app.listen(PORT, () => {
  console.log(`[Hyæt Views Engine] Running at http://localhost:${PORT}`);
});

	

