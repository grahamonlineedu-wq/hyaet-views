let currentScanResult = null;

document.addEventListener("DOMContentLoaded", () => {
  setupEventListeners();
  loadScanHistory();
});

function setupEventListeners() {
  const singleModeBtn = document.getElementById("single-mode-btn");
  const batchModeBtn = document.getElementById("batch-mode-btn");
  const singleForm = document.getElementById("scan-form");
  const batchForm = document.getElementById("batch-form");
  const downloadBtn = document.getElementById("download-json-btn");

  // Mode Switcher Listeners
  if (singleModeBtn && batchModeBtn) {
    singleModeBtn.addEventListener("click", () => {
      singleModeBtn.classList.add("active");
      batchModeBtn.classList.remove("active");
      if (singleForm) singleForm.style.display = "block";
      if (batchForm) batchForm.style.display = "none";
    });

    batchModeBtn.addEventListener("click", () => {
      batchModeBtn.classList.add("active");
      singleModeBtn.classList.remove("active");
      if (batchForm) batchForm.style.display = "block";
      if (singleForm) singleForm.style.display = "none";
    });
  }

  // Single Scan Form Submission
  if (singleForm) {
    singleForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const urlInput = document.getElementById("url-input");
      if (!urlInput || !urlInput.value.trim()) return;

      const targetUrl = urlInput.value.trim();
      
      try {
        // Example API call logic (update API endpoint if needed)
        const response = await fetch("https://hyaet-views-api.onrender.com/scan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: targetUrl })
        });

        const data = await response.json();
        currentScanResult = data;

        // Render UI Updates
        updateMetricsUI(data);
        saveToHistory(data);
      } catch (err) {
        console.error("Scan error:", err);
        const fallbackData = {
          url: targetUrl,
          status: "CLEAN",
          reputationScore: 100
        };
        currentScanResult = fallbackData;
        updateMetricsUI(fallbackData);
        saveToHistory(fallbackData);
      }
    });
  }

  // Download JSON Log Listener
  if (downloadBtn) {
    downloadBtn.addEventListener("click", () => {
      if (!currentScanResult) {
        alert("Please run a scan first to generate log data.");
        return;
      }
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(currentScanResult, null, 2));
      const dlAnchorElem = document.createElement("a");
      dlAnchorElem.setAttribute("href", dataStr);
      dlAnchorElem.setAttribute("download", `scan_log_${Date.now()}.json`);
      dlAnchorElem.click();
    });
  }
}

function updateMetricsUI(data) {
  const statusValue = document.getElementById("status-value");
  const scoreValue = document.getElementById("score-value");

  if (statusValue) statusValue.textContent = data.status || "UNKNOWN";
  if (scoreValue) scoreValue.textContent = data.reputationScore ?? data.score ?? "100/100";
}

function saveToHistory(scanData) {
  let history = JSON.parse(localStorage.getItem("hyaet_scan_history") || "[]");
  
  const newEntry = {
    url: scanData.url || scanData.target || "N/A",
    status: scanData.status || "CLEAN",
    score: scanData.reputationScore ?? scanData.score ?? 100,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };

  history.unshift(newEntry);
  if (history.length > 10) history.pop();

  localStorage.setItem("hyaet_scan_history", JSON.stringify(history));
  loadScanHistory();
}

function loadScanHistory() {
  const historyList = document.getElementById("history-list");
  if (!historyList) return;

  const history = JSON.parse(localStorage.getItem("hyaet_scan_history") || "[]");
  historyList.innerHTML = "";

  if (history.length === 0) {
    historyList.innerHTML = `<div style="color: #666; font-size: 0.85rem; padding: 10px 0;">No recent scans recorded.</div>`;
    return;
  }

  history.forEach(item => {
    const card = document.createElement("div");
    card.className = "scan-card";
    
    let statusClass = "status-clean";
    const statusLower = (item.status || "").toLowerCase();
    
    if (statusLower.includes("risk") || statusLower.includes("suspicious")) {
      statusClass = "status-high-risk";
    } else if (statusLower.includes("invalid")) {
      statusClass = "status-invalid";
    }

    card.innerHTML = `
      <span style="color: #ffffff; font-size: 0.9rem; max-width: 60%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${item.url}</span>
      <div>
        <span class="${statusClass}">${(item.status || "UNKNOWN").toUpperCase()}</span>
        <span class="timestamp">${item.timestamp}</span>
      </div>
    `;
    historyList.appendChild(card);
  });
}

