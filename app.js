// 🔥 Warm up Render server
fetch("https://ghostloggerv2.onrender.com/ping", {
  headers: { "X-Warm-Up": "true" }
}).catch(() => {});

console.log("🚀 app.js loaded and tracking initialized");
console.log("📍 Pathname:", window.location.pathname);

// ✅ Reset log state for every page load
sessionStorage.setItem("hasSentLog", "false");

let sessionStart = Date.now();
let hasSentLog = sessionStorage.getItem("hasSentLog") === "true";

// 🔄 Session tracking
let pagesViewed = parseInt(sessionStorage.getItem("pagesViewed") || "0") + 1;
sessionStorage.setItem("pagesViewed", pagesViewed.toString());

let pagesVisited = JSON.parse(sessionStorage.getItem("pagesVisited") || "[]");
if (!pagesVisited.includes(window.location.pathname)) {
  pagesVisited.push(window.location.pathname);
  sessionStorage.setItem("pagesVisited", JSON.stringify(pagesVisited));
}

// 📉 Scroll tracking
let maxScrollDepth = 0;
function updateScrollDepth() {
  const scrollTop = window.scrollY;
  const scrollHeight = document.body.scrollHeight - window.innerHeight;
  const percentScrolled = Math.min((scrollTop / scrollHeight) * 100, 100);
  maxScrollDepth = Math.max(maxScrollDepth, Math.round(percentScrolled));
}
window.addEventListener("scroll", updateScrollDepth);

// ⌛ Time near bottom
let timeAtBottom = 0;
let bottomTimer;
function checkIfAtBottom() {
  const scrollTop = window.scrollY;
  const scrollHeight = document.body.scrollHeight - window.innerHeight;
  const percentScrolled = (scrollTop / scrollHeight) * 100;
  if (percentScrolled > 95) {
    if (!bottomTimer) {
      bottomTimer = setInterval(() => { timeAtBottom += 1; }, 1000);
    }
  } else {
    clearInterval(bottomTimer);
    bottomTimer = null;
  }
}
window.addEventListener("scroll", checkIfAtBottom);

// 🖱️ Click tracking (only text)
let clickLogs = [];
document.addEventListener("click", (e) => {
  const text = (e.target.innerText || "").trim().substring(0, 50);
  if (text) {
    clickLogs.push(text);
  }
});

// 📤 Send tracking
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
    click_map: clickLogs // Now only contains button names/text
  };

  console.log("📦 Sending payload:", payload);
  const blob = new Blob([JSON.stringify(payload)], { type: "application/json" });
  navigator.sendBeacon("https://ghostloggerv2.onrender.com/log", blob);

  setTimeout(() => {
    sessionStorage.setItem("hasSentLog", "true");
    hasSentLog = true;
  }, 500);
}

// 🚪 Unload tracking
if (!hasSentLog) {
  window.addEventListener("pagehide", (e) => {
    if (!e.persisted) sendSessionData();
  });
}
