// ✅ GhostLogger Tracking Script (Internal Nav Fix + LocalStorage Duration)

console.log("🚀 app.js loaded");

// 🔥 Warm-up Render server
fetch("https://ghostloggerv2.onrender.com/ping", {
  headers: { "X-Warm-Up": "true" }
}).catch(() => {});

// ✅ Flags and session setup
let hasSentLog = false;
let isInternalNav = false;
let maxScrollDepth = 0;
let timeAtBottom = 0;
let bottomTimer = null;

// ✅ Use localStorage for session start (to persist across pages)
let sessionStart;
if (!localStorage.getItem("ghost_session_start")) {
  sessionStart = Date.now();
  localStorage.setItem("ghost_session_start", sessionStart);
} else {
  sessionStart = parseInt(localStorage.getItem("ghost_session_start"));
}

// 📉 Scroll tracking
function updateScrollDepth() {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  if (docHeight === 0) return;
  const percent = Math.min(100, Math.round((scrollTop / docHeight) * 100));
  maxScrollDepth = Math.max(maxScrollDepth, percent);
}
window.addEventListener("scroll", updateScrollDepth);

// ⌛ Time near bottom
function checkIfAtBottom() {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const percent = (scrollTop / docHeight) * 100;
  if (percent > 80) {
    if (!bottomTimer) bottomTimer = setInterval(() => timeAtBottom++, 1000);
  } else {
    clearInterval(bottomTimer);
    bottomTimer = null;
  }
}
window.addEventListener("scroll", checkIfAtBottom);

// 🖱️ Click tracking
let clickLogs = [];
document.addEventListener("click", (e) => {
  // Click logging
  const text = (e.target.innerText || "").trim().substring(0, 50);
  if (text) clickLogs.push(text);

  // Detect internal navigation
  const link = e.target.closest("a");
  const href = link?.getAttribute("href") || "";
  if (href.startsWith("/") && !href.startsWith("//")) {
    isInternalNav = true;
  }
});

// 📤 Send session data
function sendSessionData() {
  if (hasSentLog) return;
  hasSentLog = true;

  updateScrollDepth();
  const sessionEnd = Date.now();
  const durationSec = Math.round((sessionEnd - sessionStart) / 1000);
  const scrollVelocity = (maxScrollDepth / (durationSec || 1)).toFixed(2) + "%/s";

  const payload = {
    event: "session_summary",
    timestamp: new Date(sessionStart).toISOString(),
    session_duration: durationSec + "s",
    page_path: window.location.pathname,
    scroll_depth: maxScrollDepth + "%",
    scroll_velocity: scrollVelocity,
    time_at_bottom: timeAtBottom + "s",
    finished_page: maxScrollDepth >= 80,
    click_map: clickLogs,
    device: navigator.userAgent
  };

  console.log("📦 Sending payload:", payload);
  navigator.sendBeacon("https://ghostloggerv2.onrender.com/log", JSON.stringify(payload));

  localStorage.removeItem("ghost_session_start");
}

// 🚪 Trigger only when user truly leaves (not internal clicks)
window.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden" && !isInternalNav) {
    sendSessionData();
  }
});
