let currentScanResult = null;

document.addEventListener('DOMContentLoaded', () => {
  loadScanHistory();
  setupEventListeners();
});

function setupEventListeners() {
  const singleModeBtn = document.getElementById('single-mode-btn');
  const batchModeBtn = document.getElementById('batch-mode-btn');
  const singleForm = document.getElementById('scan-form');
  const batchForm = document.getElementById('batch-form');
  const singleMetrics = document.getElementById('single-metrics');
  const clearBtn = document.getElementById('clear-history-btn');
  const downloadBtn = document.getElementById('download-json-btn');
  const copyBtn = document.getElementById('copy-summary-btn');

  // Mode Toggles
  if (singleModeBtn && batchModeBtn) {
    singleModeBtn.addEventListener('click', () => {
      singleModeBtn.style.backgroundColor = 'var(--yellow-cyber)';
      singleModeBtn.style.color = '#000';
      batchModeBtn.style.backgroundColor = 'var(--bg-dark)';
      batchModeBtn.style.color = 'var(--text-muted)';
      
      singleForm.style.display = 'flex';
      singleMetrics.style.display = 'grid';
      batchForm.style.display = 'none';
    });

    batchModeBtn.addEventListener('click', () => {
      batchModeBtn.style.backgroundColor = 'var(--yellow-cyber)';
      batchModeBtn.style.color = '#000';
      singleModeBtn.style.backgroundColor = 'var(--bg-dark)';
      singleModeBtn.style.color = 'var(--text-muted)';
      
      batchForm.style.display = 'flex';
      singleForm.style.display = 'none';
      singleMetrics.style.display = 'none';
    });
  }

  // Single Scan Form
  if (singleForm) {
    singleForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const urlInput = document.getElementById('scan-input').value;
      const statusVal = document.getElementById('status-val');
      const scoreVal = document.getElementById('score-val');
      const threatsVal = document.getElementById('threats-val');
      const threatDetailsContainer = document.getElementById('threat-details-container');
      const appContainer = document.querySelector('.app-container');

      if (appContainer) appContainer.classList.add('scanning-active');
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

        if (appContainer) appContainer.classList.remove('scanning-active');

        statusVal.textContent = data.status;
        scoreVal.textContent = `${data.reputationScore} / 100`;
        threatsVal.textContent = data.threatCount;

        if (data.status === 'HIGH RISK') {
          statusVal.style.color = '#ff3b30';
          threatsVal.style.color = '#ff3b30';
        } else if (data.status === 'SUSPICIOUS') {
          statusVal.style.color = '#ff9100';
          threatsVal.style.color = '#ff9100';
        } else {
          statusVal.style.color = '#00e676';
          threatsVal.style.color = '#00e676';
        }

        renderThreatFlags(data.threatDetails, threatDetailsContainer);
        saveToHistory(data);

      } catch (err) {
        if (appContainer) appContainer.classList.remove('scanning-active');
        statusVal.textContent = 'ERROR';
        statusVal.style.color = '#ff3b30';
        threatDetailsContainer.innerHTML = '<div class="threat-card">⚠️ Failed to connect to server backend.</div>';
      }
    });
  }

  // Batch Scan Form
  if (batchForm) {
    batchForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const rawInput = document.getElementById('batch-input').value;
      const urls = rawInput.split('\n').map(u => u.trim()).filter(u => u.length > 0);
      const threatDetailsContainer = document.getElementById('threat-details-container');

      if (urls.length === 0) {
        alert('Please enter at least one URL to scan.');
        return;
      }

      threatDetailsContainer.innerHTML = `<div id="batch-progress" style="color: var(--yellow-cyber); font-weight: bold; margin-bottom: 10px;">⏳ Processing batch scan (0 / ${urls.length})...</div>`;

      const batchResults = [];

      for (let i = 0; i < urls.length; i++) {
        try {
          const response = await fetch('/api/scan', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: urls[i] })
          });
          const data = await response.json();
          batchResults.push(data);
          saveToHistory(data);
        } catch (err) {
          batchResults.push({ url: urls[i], status: 'ERROR', reputationScore: 0, threatCount: 1, threatDetails: ['Network error'] });
        }
        const progressEl = document.getElementById('batch-progress');
        if (progressEl) {
          progressEl.textContent = `⏳ Processing batch scan (${i + 1} / ${urls.length})...`;
        }
      }

      currentScanResult = { batch: true, results: batchResults };

      threatDetailsContainer.innerHTML = `<h3 style="color: var(--yellow-cyber); margin-bottom: 12px;">BATCH SCAN COMPLETED (${batchResults.length} Targets)</h3>`;
      
      batchResults.forEach(res => {
        let color = '#00e676';
        if (res.status === 'HIGH RISK') color = '#ff3b30';
        else if (res.status === 'SUSPICIOUS') color = '#ff9100';

        const card = document.createElement('div');
        card.style.cssText = 'background: var(--bg-dark); border: 1px solid var(--border-color); border-left: 4px solid ' + color + '; padding: 10px 12px; margin-bottom: 8px; border-radius: 4px;';
        card.innerHTML = `
          <div style="display: flex; justify-content: space-between; font-weight: bold; margin-bottom: 4px;">
            <span style="color: #fff; overflow: hidden; text-overflow: ellipsis; max-width: 70%;">${res.url}</span>
            <span style="color: ${color}">${res.status} (${res.reputationScore}/100)</span>
          </div>
          <div style="font-size: 0.8rem; color: var(--text-muted);">${(res.threatDetails && res.threatDetails.join(' | ')) || 'No threats detected'}</div>
        `;
        threatDetailsContainer.appendChild(card);
      });
    });
  }

  // Clear Log Handler
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      localStorage.removeItem('hyaet_scan_history');
      loadScanHistory();
    });
  }

  // Download JSON Report Handler
  if (downloadBtn) {
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
  }

  // Copy Summary Handler (With Fallback for Non-HTTPS/Termux)
  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      if (!currentScanResult) {
        alert('Run a scan first before copying a summary!');
        return;
      }

      let summaryText = '';
      if (currentScanResult.batch) {
        summaryText = `[HYÆT VIEWS BATCH SCAN REPORT]\nTotal Targets: ${currentScanResult.results.length}\n\n` +
          currentScanResult.results.map(r => `URL: ${r.url}\nStatus: ${r.status} (${r.reputationScore}/100)\nFlags: ${(r.threatDetails && r.threatDetails.join(', ')) || 'None'}\n`).join('\n---\n');
      } else {
        summaryText = `[HYÆT VIEWS SCAN REPORT]\nURL: ${currentScanResult.url}\nStatus: ${currentScanResult.status}\nScore: ${currentScanResult.reputationScore}/100\nThreat Count: ${currentScanResult.threatCount}\nThreat Flags:\n${(currentScanResult.threatDetails && currentScanResult.threatDetails.map(t => `- ${t}`).join('\n')) || 'None'}`;
      }

      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(summaryText);
        } else {
          // Fallback clipboard method for HTTP/Localhost environments
          const textArea = document.createElement('textarea');
          textArea.value = summaryText;
          textArea.style.position = 'fixed';
          textArea.style.left = '-999999px';
          document.body.appendChild(textArea);
          textArea.focus();
          textArea.select();
          document.execCommand('copy');
          textArea.remove();
        }
        
        const originalText = copyBtn.textContent;
        copyBtn.textContent = '✓ Copied!';
        setTimeout(() => copyBtn.textContent = originalText, 2000);
      } catch (err) {
        alert('Failed to copy summary to clipboard.');
      }
    });
  }
}

// Helper Functions
function renderThreatFlags(flags, container) {
  if (flags && flags.length > 0) {
    flags.forEach(flag => {
      const flagElement = document.createElement('div');
      flagElement.className = 'threat-card';
      flagElement.textContent = `⚠️ ${flag}`;
      container.appendChild(flagElement);
    });
  } else {
    const cleanElement = document.createElement('div');
    cleanElement.className = 'clean-card';
    cleanElement.textContent = '✓ No immediate heuristic threats detected.';
    container.appendChild(cleanElement);
  }
}

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
  if (!historyList) return;

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

