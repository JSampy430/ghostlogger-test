// 🧠 Persist session start time across pages
let sessionStart = sessionStorage.getItem("sessionStart");
if (!sessionStart) {
  sessionStart = Date.now();
  sessionStorage.setItem("sessionStart", sessionStart.toString());
} else {
  sessionStart = parseInt(sessionStart);
}

let pagesViewed = parseInt(sessionStorage.getItem("pagesViewed") || "0");
pagesViewed += 1;
sessionStorage.setItem("pagesViewed", pagesViewed.toString());

let hasSentLog = sessionStorage.getItem("hasSentLog") === "true";

console.log("✅ app.js loaded!");
console.log("🕓 Session started at:", new Date(sessionStart).toISOString());
console.log("📄 Pages viewed:", pagesViewed);

// 🧾 Final logging function
function sendSessionData() {
  if (hasSentLog) return;

  const sessionDuration = Math.round((Date.now() - sessionStart) / 1000);

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

// 🔥 Only run once when tab is actually closed
window.addEventListener("pagehide", (e) => {
  if (!e.persisted) {
    sendSessionData();
  }
});

