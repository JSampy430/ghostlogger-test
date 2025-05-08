// 🔥 Warm up Render server
fetch("https://ghostloggerv2.onrender.com/ping", {
  headers: { "X-Warm-Up": "true" }
}).catch(() => {});

console.log("🚀 app.js loaded and tracking initialized");
document.body.insertAdjacentHTML("beforeend", "<div style='position:fixed;bottom:0;left:0;background:#000;color:#0f0;font-size:10px;padding:5px;z-index:9999;'>📲 JS loaded</div>");

// ✅ Reset log flag if not already set
if (!sessionStorage.getItem("hasSentLog")) {
  sessionStorage.setItem("hasSentLog", "false");
}

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

// ⌛ Time at bottom tracking
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

// 📤 Final payload sender
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
  document.body.insertAdjacentHTML("beforeend", "<div style='position:fixed;bottom:15px;left:0;background:#111;color:#f90;font-size:10px;padding:5px;z-index:9999;'>📤 Payload sent</div>");

  const blob = new Blob([JSON.stringify(payload)], { type: "application/json" });
  navigator.sendBeacon("https://ghostloggerv2.onrender.com/log", blob);

  setTimeout(() => {
    sessionStorage.setItem("hasSentLog", "true");
    hasSentLog = true;
  }, 500);
}

// 🚪 Only send log when user exits the site (not internal link clicks)
if (!hasSentLog) {
  window.addEventListener("pagehide", (e) => {
    const referrer = document.referrer;
    const isLeavingSite = !referrer.includes(window.location.hostname);
    if (!e.persisted && isLeavingSite) sendSessionData();
  });
}

// 📱 Mobile auto-send after 5s
const isMobile = /Mobi|Android/i.test(navigator.userAgent);
if (isMobile) {
  console.log("📱 Mobile device detected");

  const mobileTestPayload = {
    timestamp: new Date().toISOString(),
    test: "mobile device ping",
    device: navigator.userAgent
  };
  navigator.sendBeacon("https://ghostloggerv2.onrender.com/log", new Blob([JSON.stringify(mobileTestPayload)], { type: "application/json" }));

  // ⏱️ Force send log on mobile after 5s (fallback)
  setTimeout(() => {
    console.log("⏱️ FORCED SEND on mobile");
    sendSessionData();
  }, 5000);
}
