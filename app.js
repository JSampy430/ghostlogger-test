console.log("🔥 pagesViewed before increment:", sessionStorage.getItem("pagesViewed"));

// Track and increment pages viewed
let firstClickDelay = sessionStorage.getItem("firstClickDelay");
if (firstClickDelay !== null) {
  firstClickDelay = parseInt(firstClickDelay);
} // -1 = never clicked

let pagesViewed = parseInt(sessionStorage.getItem("pagesViewed") || "0");
pagesViewed += 1;
sessionStorage.setItem("pagesViewed", pagesViewed.toString());
console.log("✅ Incrementing pagesViewed to:", pagesViewed);
console.log("📄 Pages viewed this session:", pagesViewed);

// Set or get session start time
let sessionStart = sessionStorage.getItem("sessionStart");
if (!sessionStart) {
  sessionStart = Date.now();
  sessionStorage.setItem("sessionStart", sessionStart.toString());
} else {
  sessionStart = parseInt(sessionStart);
}

if (document.referrer && !document.referrer.includes(window.location.hostname)) {
  sessionStorage.clear();
}

// Track if log has already been sent
let hasSentLog = sessionStorage.getItem("hasSentLog") === "true";

console.log("✅ app.js loaded");
console.log("🕓 Session started at:", new Date(sessionStart).toISOString());

function sendSessionData() {
  if (hasSentLog) return;

  const sessionDuration = Math.round((Date.now() - sessionStart) / 1000);
  const pagesViewed = parseInt(sessionStorage.getItem("pagesViewed") || "1");
  const firstClickDelay = parseInt(sessionStorage.getItem("firstClickDelay") || "-1");

  const payload = {
    timestamp: new Date().toISOString(),
    session_duration: sessionDuration,
    pages_viewed: pagesViewed,
    first_click_delay: firstClickDelay,
    user_agent: navigator.userAgent,
  };

  console.log("📦 Sending payload:", payload);

  const blob = new Blob([JSON.stringify(payload)], {
    type: "application/json",
  });

  const success = navigator.sendBeacon("https://ghostloggerv2.onrender.com/log", blob);
  console.log("📤 Beacon
