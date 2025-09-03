// background.js - minimal for local backend version
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    // This extension version uses a local HTTP backend at http://localhost:8080
    return true;
  });
  