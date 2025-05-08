// 🔥 Warm up Render server
fetch("https://ghostloggerv2.onrender.com/ping", {
  headers: { "X-Warm-Up": "true" }
}).catch(() => {});

console.log("🚀 app.js loaded and tracking initialized");

// ✅ Reset session log state and prepare tracking
sessionStorage.setItem("hasSentLog", "false");

let sessionStart = sessionStorage.getItem("sessionStart");
if (!sessionStart) {
  sessionStart = Date.now();
  sessionStorage.setItem("sessionStart", sessionStart);
} else {
  sessionStart = parseInt(sessionStart);
}

let hasSentLog = sessionStorage.getItem("hasSentLog") === "true";
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

// ⌛ Time near bottom tracking
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

// 🖱️ Click tracking with just visible button text
let clickLogs = JSON.parse(sessionStorage.getItem("clickLogs") || "[]");
document.addEventListener("click", (e) => {
  const text = (e.target.innerText || "").trim().substring(0, 50);
  if (text) {
    clickLogs.push(text);
    sessionStorage.setItem("clickLogs", JSON.stringify(clickLogs));
  }
});

// 📤 Send tracking data
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

  let beaconSuccess = false;
  if (navigator.sendBeacon) {
    beaconSuccess = navigator.sendBeacon("https://ghostloggerv2.onrender.com/log", blob);
    console.log("📡 Beacon success:", beaconSuccess);
  }

  if (!beaconSuccess) {
    console.log("↩️ Falling back to fetch...");
    fetch("https://ghostloggerv2.onrender.com/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
    .then(res => console.log("✅ Fallback fetch status:", res.status))
    .catch(err => console.error("❌ Fallback fetch failed:", err));
  }

  setTimeout(() => {
    sessionStorage.setItem("hasSentLog", "true");
    hasSentLog = true;
  }, 500);
}

// 🚪 Send on unload
if (!hasSentLog) {
  window.addEventListener("pagehide", (e) => {
    if (!e.persisted) sendSessionData();
  });
}
