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
  const clearBtn = document.getElementById("clear-history-btn");
  const downloadBtn = document.getElementById("download-json-btn");

  // Mode Switcher Toggles
  if (singleModeBtn && batchModeBtn) {
    singleModeBtn.addEventListener("click", () => {
      singleModeBtn.classList.add("active");
      batchModeBtn.classList.remove("active");
      if (singleForm) singleForm.style.display = "flex";
      if (batchForm) batchForm.style.display = "none";
    });

    batchModeBtn.addEventListener("click", () => {
      batchModeBtn.classList.add("active");
      singleModeBtn.classList.remove("active");
      if (batchForm) batchForm.style.display = "flex";
      if (singleForm) singleForm.style.display = "none";
    });
  }

  // Single Scan Form Handling
  if (singleForm) {
    singleForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const urlInput = document.getElementById("scan-input") || document.getElementById("url-input");
      if (!urlInput || !urlInput.value.trim()) return;

      const targetUrl = urlInput.value.trim();

      try {
        const response = await fetch("https://hyaet-views-api.onrender.com/scan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: targetUrl })
        });

        const data = await response.json();
        currentScanResult = data;

        updateMetricsUI(data);
        saveToHistory({
          url: targetUrl,
          status: data.status || "CLEAN",
          reputationScore: data.reputationScore ?? data.score ?? 100
        });
      } catch (err) {
        console.error("Scan API Error:", err);
        const fallbackData = { url: targetUrl, status: "CLEAN", reputationScore: 100 };
        currentScanResult = fallbackData;
        updateMetricsUI(fallbackData);
        saveToHistory(fallbackData);
      }
    });
  }

  // Batch Scan Form Handling
  if (batchForm) {
    batchForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const batchInput = document.getElementById("batch-input");
      if (!batchInput || !batchInput.value.trim()) return;

      const urls = batchInput.value.split("\n").map(u => u.trim()).filter(u => u.length > 0);

      for (const targetUrl of urls) {
        try {
          const response = await fetch("https://hyaet-views-api.onrender.com/scan", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: targetUrl })
          });
          const data = await response.json();
          saveToHistory({
            url: targetUrl,
            status: data.status || "CLEAN",
            reputationScore: data.reputationScore ?? data.score ?? 100
          });
        } catch (err) {
          saveToHistory({ url: targetUrl, status: "CLEAN", reputationScore: 100 });
        }
      }
    });
  }

  // Clear Scan History
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      localStorage.removeItem("hyaet_scan_history");
      loadScanHistory();
    });
  }

  // Download JSON Log
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
  const statusVal = document.getElementById("status-val") || document.getElementById("status-value");
  const scoreVal = document.getElementById("score-val") || document.getElementById("score-value");

  if (statusVal) statusVal.textContent = data.status || "UNKNOWN";
  if (scoreVal) scoreVal.textContent = data.reputationScore ?? data.score ?? "100 / 100";
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
    historyList.innerHTML = `<div style="color: #666666; font-size: 0.85rem; padding: 10px 0;">No recent scans recorded.</div>`;
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

