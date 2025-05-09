// ✅ GhostLogger Tracking Script (One log per user only)

console.log("🚀 app.js loaded and tracking initialized");

// 🔥 Warm up Render server
fetch("https://ghostloggerv2.onrender.com/ping", {
  headers: { "X-Warm-Up": "true" }
}).catch(() => {});

// ✅ Lock in session start time (only once per tab)
let sessionStart;
if (!sessionStorage.getItem("sessionStart")) {
  sessionStart = Date.now();
  sessionStorage.setItem("sessionStart", sessionStart);
} else {
  sessionStart = parseInt(sessionStorage.getItem("sessionStart"));
}

// ✅ Other session values
let hasSentLog = sessionStorage.getItem("hasSentLog") === "true";
if (!sessionStorage.getItem("hasSentLog")) {
  sessionStorage.setItem("hasSentLog", "false");
}

let pagesViewed = parseInt(sessionStorage.getItem("pagesViewed") || "0") + 1;
sessionStorage.setItem("pagesViewed", pagesViewed.toString());

let pagesVisited = JSON.parse(sessionStorage.getItem("pagesVisited") || "[]");
if (!pagesVisited.includes(window.location.pathname)) {
  pagesVisited.push(window.location.pathname);
  sessionStorage.setItem("pagesVisited", JSON.stringify(pagesVisited));
}

// 🧹 Reset scroll data if page changed
let lastPage = sessionStorage.getItem("lastPage");
if (lastPage !== window.location.pathname) {
  sessionStorage.setItem("lastPage", window.location.pathname);
  sessionStorage.setItem("scrollDepth:" + window.location.pathname, "0");
}
let maxScrollDepth = 0;

// 📉 Scroll tracking (per page)
function updateScrollDepth() {
  const scrollTop = window.scrollY;
  const scrollHeight = document.body.scrollHeight - window.innerHeight;
  const percentScrolled = Math.min((scrollTop / scrollHeight) * 100, 100);
  maxScrollDepth = Math.max(maxScrollDepth, Math.round(percentScrolled));
  sessionStorage.setItem("scrollDepth:" + window.location.pathname, maxScrollDepth.toString());
}
window.addEventListener("scroll", updateScrollDepth);

// ⌛ Time near bottom
let timeAtBottom = 0;
let bottomTimer;
function checkIfAtBottom() {
  const scrollTop = window.scrollY;
  const scrollHeight = document.body.scrollHeight - window.innerHeight;
  const percentScrolled = (scrollTop / scrollHeight) * 100;
  if (percentScrolled > 80) {
    if (!bottomTimer) {
      bottomTimer = setInterval(() => { timeAtBottom += 1; }, 1000);
    }
  } else {
    clearInterval(bottomTimer);
    bottomTimer = null;
  }
}
window.addEventListener("scroll", checkIfAtBottom);

// 🖱️ Click tracking
let clickLogs = JSON.parse(sessionStorage.getItem("clickLogs") || "[]");
document.addEventListener("click", (e) => {
  const text = (e.target.innerText || "").trim().substring(0, 50);
  if (text) {
    clickLogs.push(text);
    sessionStorage.setItem("clickLogs", JSON.stringify(clickLogs));
  }
});

// 📤 Send session data
function sendSessionData() {
  if (hasSentLog) return;

  updateScrollDepth();
  const sessionEnd = Date.now();
  const sessionDuration = Math.round((sessionEnd - sessionStart) / 1000);
  const scrollVelocity = (maxScrollDepth / (sessionDuration || 1)).toFixed(2) + "%/s";
  const finishedPage = maxScrollDepth >= 80;

  const scrollTop = window.scrollY;
  const scrollHeight = document.body.scrollHeight - window.innerHeight;
  const currentScrollPercent = Math.min((scrollTop / scrollHeight) * 100, 100);

  const payload = {
    event: "session_summary",
    timestamp: new Date(sessionStart).toISOString(),
    session_duration: sessionDuration + "s",
    pages_viewed: pagesVisited.length,
    pages_list: pagesVisited,
    page_path: window.location.pathname,
    scroll_depth: Math.round(currentScrollPercent) + "%",
    scroll_velocity: scrollVelocity,
    time_at_bottom: timeAtBottom + "s",
    finished_page: finishedPage,
    click_map: clickLogs,
    device: navigator.userAgent
  };

  console.log("📦 Sending payload:", payload);
  const blob = new Blob([JSON.stringify(payload)], { type: "application/json" });
  navigator.sendBeacon("https://ghostloggerv2.onrender.com/log", blob);

  sessionStorage.setItem("hasSentLog", "true");
  hasSentLog = true;
}

// 🚪 Send on page exit
window.addEventListener("pagehide", (e) => {
  if (!e.persisted && !hasSentLog) sendSessionData();
});
