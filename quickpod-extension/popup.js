async function getActiveTab() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    return tab;
  }
  
  function setStatus(msg) {
    document.getElementById("status").textContent = msg;
  }
  
  function show(elId) { document.getElementById(elId).classList.remove("hidden"); }
  function hide(elId) { document.getElementById(elId).classList.add("hidden"); }
  
  function renderSummaryText(text) {
    const cleaned = text
      .replace(/\r/g, "")
      .split("\n")
      .map(line => line.trim())
      .filter(Boolean)
      .map(line => line.startsWith("-") || line.match(/^\d+\./) ? line : `• ${line}`)
      .join("\n");
    document.getElementById("summary-content").textContent = cleaned;
  }
  
  async function loadSponsor() {
    try {
      const url = chrome.runtime.getURL("sponsors.json");
      const res = await fetch(url);
      if (!res.ok) return;
      const sponsors = await res.json();
      if (!Array.isArray(sponsors) || sponsors.length === 0) return;
      const choice = sponsors[Math.floor(Math.random() * sponsors.length)];
      const box = document.getElementById("sponsor-box");
      box.innerHTML = `<div class="sponsor">
        <strong>${choice.title}</strong><br/>
        <span>${choice.text}</span><br/>
        <a href="${choice.url}" target="_blank" rel="noreferrer">Learn more</a>
      </div>`;
      show("sponsor");
    } catch {}
  }
  
  async function main() {
    document.getElementById("open-options").addEventListener("click", (e) => {
      e.preventDefault();
      chrome.runtime.openOptionsPage();
    });
  
    const tab = await getActiveTab();
    if (!tab?.id) { setStatus("No active tab found."); return; }
  
    setStatus("Collecting page data…");
    const dataResp = await chrome.tabs.sendMessage(tab.id, { type: "COLLECT_PAGE_DATA" }).catch(() => null);
  
    if (!dataResp?.ok) {
      setStatus("This page isn't supported. Open a podcast episode on YouTube, Spotify, or Apple Podcasts.");
      return;
    }
  
    const { data } = dataResp;
    setStatus("Contacting local QuickPod backend…");
  
    try {
      const backendUrl = "http://localhost:8080/api/summarize";
      const res = await fetch(backendUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: data.url })
      });
      if (!res.ok) { setStatus(`Backend HTTP error ${res.status}`); return; }
      const json = await res.json();
      if (!json.ok) { setStatus(json.error || "Backend error"); return; }
  
      hide("status");
      show("summary");
      renderSummaryText(json.summary || (Array.isArray(json.bullets) ? json.bullets.join("\n") : "(no summary)"));
  
      if (json.transcript) {
        show("transcript");
        document.getElementById("transcript-box").textContent = json.transcript;
  
        const tabSummary = document.getElementById("tab-summary");
        const tabTranscript = document.getElementById("tab-transcript");
  
        tabSummary.addEventListener("click", () => {
          tabSummary.classList.add("active");
          tabTranscript.classList.remove("active");
          document.getElementById("transcript-box").style.display = "none";
          document.getElementById("summary-content").style.display = "block";
        });
  
        tabTranscript.addEventListener("click", () => {
          tabTranscript.classList.add("active");
          tabSummary.classList.remove("active");
          document.getElementById("transcript-box").style.display = "block";
          document.getElementById("summary-content").style.display = "none";
        });
      }
  
      // Load sponsor
      loadSponsor();
    } catch (e) {
      setStatus("Failed to contact backend: " + String(e));
    }
  }
  
  main();
  