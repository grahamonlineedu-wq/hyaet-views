let currentScanResult = null;

document.addEventListener("DOMContentLoaded", () => {
    setupThemeSelector();
    setupEventListeners();
    loadScanHistory();
});

function setupThemeSelector() {
    const themeBtns = document.querySelectorAll(".theme-btn");
    const savedTheme = localStorage.getItem("hyaet_theme");

    if (savedTheme) {
        document.body.className = savedTheme;
    }

    themeBtns.forEach(btn => {
        // Synchronize initial active classes based on saved theme
        if (btn.dataset.theme === savedTheme) {
            btn.classList.add("active");
        } else {
            btn.classList.remove("active");
        }

        btn.addEventListener("click", () => {
            themeBtns.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            document.body.className = btn.dataset.theme;
            localStorage.setItem("hyaet_theme", btn.dataset.theme);
        });
    });
}

function setupEventListeners() {
    const singleModeBtn = document.getElementById("single-mode-btn");
    const batchModeBtn = document.getElementById("batch-mode-btn");
    const singleForm = document.getElementById("scan-form");
    const batchForm = document.getElementById("batch-form");
    const clearBtn = document.getElementById("clear-history");
    const downloadBtn = document.getElementById("download-btn");
    const copyBtn = document.getElementById("copy-summary");

    // Switcher Actions
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

    // Single URL Scan Submit
    if (singleForm) {
        singleForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const urlInput = document.getElementById("scan-url");
            if (!urlInput || !urlInput.value.trim()) return;

            const targetUrl = urlInput.value.trim();
            updateMetricsUI({ status: "SCANNING...", reputationScore: "N/A" });

            try {
                const response = await fetch("https://api.mock", {
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
                    reputationScore: data.reputationScore ?? data.score ?? 100,
                    threatFlags: data.threatFlags ?? 0,
                    timestamp: new Date().toLocaleString()
                });

            } catch (err) {
                console.error("API error:", err);
                const fallbackData = {
                    url: targetUrl,
                    status: "ERROR",
                    reputationScore: "0",
                    threatFlags: "Unknown",
                    timestamp: new Date().toLocaleString()
                };
                updateMetricsUI(fallbackData);
                saveToHistory(fallbackData);
            }
        });
    }

    // Copy Summary Action
    if (copyBtn) {
        copyBtn.addEventListener("click", () => {
            if (!currentScanResult) {
                alert("Run a scan first to generate a summary!");
                return;
            }
            const text = `Hyæt Views Scan Summary\nURL: ${currentScanResult.url}\nStatus: ${currentScanResult.status}\nScore: ${currentScanResult.reputationScore}`;
            navigator.clipboard.writeText(text).then(() => {
                alert("Summary copied to clipboard!");
            }).catch(err => {
                console.error("Could not copy text: ", err);
            });
        });
    }

    // Clear History
    if (clearBtn) {
        clearBtn.addEventListener("click", () => {
            localStorage.removeItem("hyaet_scan_history");
            loadScanHistory();
        });
    }
}

function loadScanHistory() {
    const historyList = document.getElementById("history-list");
    if (!historyList) return;

    const historyData = localStorage.getItem("hyaet_scan_history");
    const history = historyData ? JSON.parse(historyData) : [];
    historyList.innerHTML = "";

    if (history.length === 0) {
        historyList.innerHTML = `<div style="color: #666666; padding: 10px;">No scan history found.</div>`;
        return;
    }

    history.forEach(item => {
        const card = document.createElement("div");
        card.className = "scan-card";
        
        const statusLower = (item.status || "").toLowerCase();
        const statusClass = statusLower.includes("risk") || statusLower.includes("malicious") || statusLower.includes("error") ? "risk" : "clean";

        card.innerHTML = `
            <div style="color: #ffffff; font-size: 0.85rem; display: flex; justify-content: space-between; width: 100%;">
                <div>
                    <span class="url-text" style="font-weight: bold;">${item.url}</span>
                    <span class="${statusClass}" style="margin-left: 10px; font-weight: bold;">[${item.status}]</span>
                </div>
                <span class="timestamp" style="color: #888888;">${item.timestamp || ""}</span>
            </div>
        `;
        historyList.appendChild(card);
    });
}

function saveToHistory(item) {
    const historyData = localStorage.getItem("hyaet_scan_history");
    const history = historyData ? JSON.parse(historyData) : [];
    history.unshift(item); // Add new scan to the top
    localStorage.setItem("hyaet_scan_history", JSON.stringify(history));
    loadScanHistory(); // Refresh the UI view immediately
}

function updateMetricsUI(data) {
    // Helper function to update elements safely if they exist in your HTML template
    const statusEl = document.getElementById("status-display");
    const scoreEl = document.getElementById("score-display");
    
    if (statusEl) statusEl.textContent = data.status || "UNKNOWN";
    if (scoreEl) scoreEl.textContent = data.reputationScore ?? "N/A";
}

