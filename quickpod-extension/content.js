// content.js - extracts title/description/transcript when available
// Listens for a COLLECT_PAGE_DATA message and responds with page data.

async function wait(ms){ return new Promise(r=>setTimeout(r, ms)); }
function cleanText(t) { if (!t) return ""; return t.replace(/\s+/g," ").trim(); }
function getMeta(name) {
  const el = document.querySelector(`meta[name="${name}"]`) || document.querySelector(`meta[property="${name}"]`);
  return el ? el.getAttribute("content") : "";
}

// YouTube transcript extraction (via ytInitialPlayerResponse captionTracks -> fmt=json3)
async function extractYouTubeTranscript() {
  try {
    const tryGetPlayerResponse = () => {
      if (window.ytInitialPlayerResponse) return window.ytInitialPlayerResponse;
      const scripts = Array.from(document.querySelectorAll("script"));
      for (const s of scripts) {
        const txt = s.textContent || "";
        if (txt.includes("ytInitialPlayerResponse")) {
          const start = txt.indexOf("{");
          const end = txt.lastIndexOf("}");
          if (start >= 0 && end > start) {
            try { return JSON.parse(txt.slice(start, end + 1)); } catch(e){}
          }
        }
      }
      return null;
    };

    let pr = tryGetPlayerResponse();
    if (!pr) { await wait(800); pr = tryGetPlayerResponse(); }
    if (!pr) return null;

    const tracks = pr?.captions?.playerCaptionsTracklistRenderer?.captionTracks;
    if (!tracks || !tracks.length) return null;

    let track = tracks.find(t => t.languageCode?.startsWith("en")) || tracks[0];
    if (!track?.baseUrl) return null;

    const url = track.baseUrl + (track.baseUrl.includes("?") ? "&" : "?") + "fmt=json3";
    const r = await fetch(url, { credentials: "include" });
    if (!r.ok) return null;
    const data = await r.json();
    const events = data.events || [];
    let out = [];
    for (const ev of events) {
      if (!ev.segs) continue;
      for (const s of ev.segs) {
        if (s.utf8) out.push(s.utf8);
      }
    }
    const text = cleanText(out.join(" "));
    return text || null;
  } catch (e) {
    return null;
  }
}

function extractYouTubeTitleDesc() {
  const title =
    document.querySelector("h1.ytd-watch-metadata")?.innerText ||
    getMeta("og:title") ||
    document.title;
  const description =
    document.querySelector("#description")?.innerText ||
    getMeta("og:description") ||
    "";
  return { title: cleanText(title), description: cleanText(description) };
}

function extractSpotifyData() {
  const title =
    document.querySelector('[data-testid="nowplaying-track-link"]')?.innerText ||
    document.querySelector('[data-testid="episode-title"]')?.innerText ||
    getMeta("og:title") ||
    document.title;

  const description =
    document.querySelector('[data-testid="episode-description"]')?.innerText ||
    getMeta("og:description") || "";

  return { title: cleanText(title), description: cleanText(description) };
}

function extractApplePodcastsData() {
  const title = getMeta("og:title") || document.title;
  let description = getMeta("og:description") || "";
  const transcriptNode = document.querySelector('[data-test-transcript], .transcript, [class*="transcript"]');
  if (transcriptNode) {
    description = description + " " + transcriptNode.innerText;
  }
  return { title: cleanText(title), description: cleanText(description) };
}

async function collectPageData() {
  const host = location.host;
  if (host.includes("youtube.com")) {
    const { title, description } = extractYouTubeTitleDesc();
    const transcript = await extractYouTubeTranscript();
    return {
      source: "YouTube",
      title, description,
      transcript,
      url: location.href
    };
  } else if (host.includes("open.spotify.com")) {
    const { title, description } = extractSpotifyData();
    return { source: "Spotify", title, description, transcript: null, url: location.href };
  } else if (host.includes("podcasts.apple.com")) {
    const { title, description } = extractApplePodcastsData();
    return { source: "Apple Podcasts", title, description, transcript: null, url: location.href };
  } else {
    return { source: "Unknown", title: document.title, description: getMeta("description") || "", transcript: null, url: location.href };
  }
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  (async () => {
    if (msg?.type === "COLLECT_PAGE_DATA") {
      const data = await collectPageData();
      sendResponse({ ok: true, data });
    }
  })();
  return true;
});
