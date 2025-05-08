console.log("🚀 app.js loaded and tracking initialized");

let sessionStart = Date.now();
let hasSentLog = false;

sessionStorage.setItem("hasSentLog", "false");

// 🔄 Page view tracking
let pagesViewed = parseInt(sessionStorage.getItem("pagesViewed") || "0") + 1;
sessionStorage.setItem("pagesViewed", pagesViewed.toString());

let pagesVisited = JSON.parse(sessionStorage.getItem("pagesVisited") || "[]");
if (!pagesVisited.includes(window.location.pathname)) {
  pagesVisited.push(window.location.pathname);
  sessionStorage.setItem("pagesVisited", JSON.stringify(pagesVisited));
}

// 📉 Scroll tracking
let maxScrollDepth = 0;
window.addEventListener("scroll", () => {
  const scrollTop = window.scrollY;
  const scrollHeight = document.body.scrollHeight - window.innerHeight;
  const percentScrolled = Math.min((scrollTop / scrollHeight) * 100, 100);
  maxScrollDepth = Math.max(maxScrollDepth, Math.round(percentScrolled));
});

// ⌛ Time near bottom (80% threshold for mobile)
let timeAtBottom = 0;
let bottomTimer;
window.addEventListener("scroll", () => {
  const scrollTop = window.scrollY;
  const scrollHeight = document.body.scrollHeight - window.innerHeight;
  const percentScrolled = (scrollTop / scrollHeight) * 100;

  if (percentScrolled > 80) {
    if (!bottomTimer) bottomTimer = setInterval(() => timeAtBottom += 1, 1000);
  } else {
    clearInterval(bottomTimer);
    bottomTimer = null;
  }
});

// 🖱️ Click tracking (text only)
let clickLogs = [];
document.addEventListener("click", (e) => {
  const text = e.target.innerText.trim();
  if (text) clickLogs.push(text);
});

// 📤 Send data
function sendSessionData() {
  if (hasSentLog) return;

  const sessionEnd = Date.now();
  const sessionDuration = Math.round((sessionEnd - sessionStart) / 1000);
  const scrollVelocity = (maxScrollDepth / (sessionDuration || 1)).toFixed(2) + "%/s";
  const finishedPage = maxScrollDepth >= 90;

  const scrollTop = window.scrollY;
  const scrollHeight = document.body.scrollHeight - window.innerHeight;
  const currentScrollPercent = Math.min((scrollTop / scrollHeight) * 100, 100);

  const payload = {
    timestamp: new Date(sessionStart).toISOString(),
    session_duration: sessionDuration + "s",
    pages_viewed: pagesVisited.length,
    page_path: window.location.pathname,
    scroll_depth: Math.round(currentScrollPercent) + "%",
    scroll_velocity: scrollVelocity,
    time_at_bottom: timeAtBottom + "s",
    finished_page: finishedPage,
    click_map: clickLogs
  };

  console.log("📦 Sending payload:", payload);

  const blob = new Blob([JSON.stringify(payload)], { type: "application/json" });
  navigator.sendBeacon("https://ghostloggerv2.onrender.com/log", blob);

  setTimeout(() => {
    sessionStorage.setItem("hasSentLog", "true");
    hasSentLog = true;
  }, 500);
}

// 🚪 On unload and visibility change
window.addEventListener("pagehide", (e) => {
  if (!e.persisted) sendSessionData();
});
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") {
    sendSessionData();
  }
});
