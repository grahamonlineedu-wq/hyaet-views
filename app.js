let currentScanResult = null; // Store active scan payload

document.addEventListener('DOMContentLoaded', () => {
  loadScanHistory();
});

const scanForm = document.getElementById('scan-form');
const clearBtn = document.getElementById('clear-history-btn');
const downloadBtn = document.getElementById('download-json-btn');
const copyBtn = document.getElementById('copy-summary-btn');

scanForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const urlInput = document.getElementById('scan-input').value;
  const statusVal = document.getElementById('status-val');
  const scoreVal = document.getElementById('score-val');
  const threatsVal = document.getElementById('threats-val');
  const threatDetailsContainer = document.getElementById('threat-details-container');

  // Set pending state (Cyber Yellow)
  statusVal.textContent = 'ANALYZING...';
  statusVal.style.color = '#ffd700'; 
  threatDetailsContainer.innerHTML = '';

  try {
    const response = await fetch('/api/scan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: urlInput })
    });

    const data = await response.json();
    currentScanResult = data; // Cache for export actions

    // Update main metrics
    statusVal.textContent = data.status;
    scoreVal.textContent = `${data.reputationScore} / 100`;
    threatsVal.textContent = data.threatCount;

    // Apply color dynamics
    if (data.status === 'HIGH RISK') {
      statusVal.style.color = '#ff3b30'; // Alert Red
      threatsVal.style.color = '#ff3b30';
    } else if (data.status === 'SUSPICIOUS') {
      statusVal.style.color = '#ff9100'; // Orange
      threatsVal.style.color = '#ff9100';
    } else {
      statusVal.style.color = '#00e676'; // Safe Green
      threatsVal.style.color = '#00e676';
    }

    // Render detailed threat cards
    if (data.threatDetails && data.threatDetails.length > 0) {
      data.threatDetails.forEach(flag => {
        const flagElement = document.createElement('div');
        flagElement.className = 'threat-card';
        flagElement.textContent = `⚠️ ${flag}`;
        threatDetailsContainer.appendChild(flagElement);
      });
    } else {
      const cleanElement = document.createElement('div');
      cleanElement.className = 'clean-card';
      cleanElement.textContent = '✓ No immediate heuristic threats detected.';
      threatDetailsContainer.appendChild(cleanElement);
    }

    // Save scan result into browser LocalStorage
    saveToHistory(data);

  }

  // Set pending state & activate visual FX
  const appContainer = document.querySelector('.app-container');
  appContainer.classList.add('scanning-active');
 }
  
  statusVal.textContent = 'ANALYZING...';
  statusVal.style.color = '#ffd700'; 
  threatDetailsContainer.innerHTML = '';

  try {
    const response = await fetch('/api/scan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: urlInput })
    });

    const data = await response.json();
    currentScanResult = data;

    // Remove scanning effect
    appContainer.classList.remove('scanning-active');

    // ... rest of your code remains unchanged ...

// Download JSON Security Report
downloadBtn.addEventListener('click', () => {
  if (!currentScanResult) {
    alert('Run a scan first before downloading a report!');
    return;
  }

  const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(currentScanResult, null, 2))}`;
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', jsonString);
  downloadAnchor.setAttribute('download', `hyaet_scan_${Date.now()}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
});

// Copy Text Summary to Clipboard
copyBtn.addEventListener('click', async () => {
  if (!currentScanResult) {
    alert('Run a scan first before copying a summary!');
    return;
  }

  const summaryText = `[HYÆT VIEWS SCAN REPORT]
URL: ${currentScanResult.url}
Status: ${currentScanResult.status}
Score: ${currentScanResult.reputationScore}/100
Threat Count: ${currentScanResult.threatCount}
Threat Flags:
${currentScanResult.threatDetails.map(t => `- ${t}`).join('\n') || 'None'}`;

  try {
    await navigator.clipboard.writeText(summaryText);
    const originalText = copyBtn.textContent;
    copyBtn.textContent = '✓ Copied!';
    setTimeout(() => copyBtn.textContent = originalText, 2000);
  } catch (err) {
    alert('Failed to copy summary to clipboard.');
  }
});

// LocalStorage helpers
function saveToHistory(scanData) {
  const history = JSON.parse(localStorage.getItem('hyaet_scan_history') || '[]');
  
  const newEntry = {
    url: scanData.url,
    status: scanData.status,
    score: scanData.reputationScore,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };

  history.unshift(newEntry);
  if (history.length > 5) history.pop();

  localStorage.setItem('hyaet_scan_history', JSON.stringify(history));
  loadScanHistory();
}

function loadScanHistory() {
  const historyList = document.getElementById('history-list');
  const history = JSON.parse(localStorage.getItem('hyaet_scan_history') || '[]');

  if (history.length === 0) {
    historyList.innerHTML = '<div style="color: var(--text-muted); font-size: 0.85rem; text-align: center; padding: 10px;">No recent scans stored.</div>';
    return;
  }

  historyList.innerHTML = '';
  history.forEach(item => {
    let statusColor = '#00e676';
    if (item.status === 'HIGH RISK') statusColor = '#ff3b30';
    else if (item.status === 'SUSPICIOUS') statusColor = '#ff9100';

    const row = document.createElement('div');
    row.style.cssText = 'display: flex; justify-content: space-between; align-items: center; background: var(--bg-dark); border: 1px solid var(--border-color); padding: 10px 12px; border-radius: 6px; font-size: 0.85rem;';
    
    row.innerHTML = `
      <div style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 60%; color: #ffffff;">${item.url}</div>
      <div style="display: flex; gap: 12px; align-items: center;">
        <span style="color: ${statusColor}; font-weight: bold;">${item.status}</span>
        <span style="color: var(--text-muted); font-size: 0.75rem;">${item.timestamp}</span>
      </div>
    `;
    historyList.appendChild(row);
  });
}

clearBtn.addEventListener('click', () => {
  localStorage.removeItem('hyaet_scan_history');
  loadScanHistory();
});

