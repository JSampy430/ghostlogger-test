console.log("🚀 app.js loaded and tracking initialized");

sessionStorage.setItem("hasSentLog", "false");
let sessionStart = Date.now();
let hasSentLog = sessionStorage.getItem("hasSentLog") === "true";

let pagesViewed = parseInt(sessionStorage.getItem("pagesViewed") || "0") + 1;
sessionStorage.setItem("pagesViewed", pagesViewed.toString());

let pagesVisited = JSON.parse(sessionStorage.getItem("pagesVisited") || "[]");
if (!pagesVisited.includes(window.location.pathname)) {
  pagesVisited.push(window.location.pathname);
  sessionStorage.setItem("pagesVisited", JSON.stringify(pagesVisited));
}

let maxScrollDepth = 0;
function updateScrollDepth() {
  const scrollTop = window.scrollY;
  const scrollHeight = document.body.scrollHeight - window.innerHeight;
  const percentScrolled = Math.min((scrollTop / scrollHeight) * 100, 100);
  maxScrollDepth = Math.max(maxScrollDepth, Math.round(percentScrolled));
}
window.addEventListener("scroll", updateScrollDepth);

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

let clickLogs = [];
document.addEventListener("click", (e) => {
  const x = e.pageX;
  const y = e.pageY;
  const element = e.target.tagName;
  const text = e.target.innerText.trim();
  if (text) clickLogs.push(text); // Only store button/link names
});

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

  if (navigator.sendBeacon) {
    const success = navigator.sendBeacon("https://ghostloggerv2.onrender.com/log", blob);
    if (!success) {
      fetch("https://ghostloggerv2.onrender.com/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
    }
  } else {
    fetch("https://ghostloggerv2.onrender.com/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
  }

  setTimeout(() => {
    sessionStorage.setItem("hasSentLog", "true");
    hasSentLog = true;
  }, 500);
}

if (!hasSentLog) {
  window.addEventListener("pagehide", (e) => {
    if (!e.persisted) sendSessionData();
  });
}

