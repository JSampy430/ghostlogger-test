// ✅ Initialize or resume session
let sessionStart = sessionStorage.getItem("sessionStart");
if (!sessionStart) {
  sessionStart = Date.now();
  sessionStorage.setItem("sessionStart", sessionStart.toString());
} else {
  sessionStart = parseInt(sessionStart);
}

let hasSentLog = sessionStorage.getItem("hasSentLog") === "true";

// Just for console testing
console.log("✅ app.js loaded!");
console.log("🕓 Session started at:", new Date(sessionStart).toISOString());

function sendSessionData() {
  if (hasSentLog) return;

  const sessionDuration = Math.round((Date.now() - sessionStart) / 1000);
  const pagesViewed = 1; // You can make this dynamic later

  const payload = {
    timestamp: new Date().toISOString(),
    session_duration: sessionDuration,
    pages_viewed: pagesViewed,
  };

  console.log("📦 Sending payload:", payload);

  const blob = new Blob([JSON.stringify(payload)], {
    type: "application/json",
  });

  const success = navigator.sendBeacon("https://ghostloggerv2.onrender.com/log", blob);
  console.log("📤 Beacon sent success:", success);

  sessionStorage.setItem("hasSentLog", "true");
  hasSentLog = true;
}

// ✅ This event only fires when the tab is closed or user fully leaves
window.addEventListener("pagehide", (e) => {
  if (!e.persisted) {
    sendSessionData();
  }
});
