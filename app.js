console.log("🔥 pagesViewed before increment:", sessionStorage.getItem("pagesViewed"));

// Track and increment pages viewed
let first_click_delay = sessionStorage.getItem("first_click_delay");
if (first_click_delay !== null) {
  first_click_delay = parseInt(first_click_delay);
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

// Clear session storage if referrer is external
if (document.referrer && !document.referrer.includes(window.location.hostname)) {
  sessionStorage.clear();
}

// Track if log has already been sent
let hasSentLog = sessionStorage.getItem("hasSentLog") === "true";

console.log("✅ app.js loaded");
console.log("🕓 Session started at:", new Date(sessionStart).toISOString());

// 🔁 First click capture (only once)
document.addEventListener("click", () => {
  const existingDelay = sessionStorage.getItem("first_click_delay");
  if (!existingDelay) {
    const delay = Date.now() - sessionStart;
    sessionStorage.setItem("first_click_delay", delay.toString());
    console.log("🖱️ First click delay:", delay + "ms");
  }
});
// 📤 Send session data
function sendSessionData() {
  if (hasSentLog) return;

  const sessionDuration = Math.round((Date.now() - sessionStart) / 1000);
  const pagesViewed = parseInt(sessionStorage.getItem("pagesViewed") || "1");

  let first_click_delay = sessionStorage.getItem("first_click_delay");
  if (first_click_delay !== null && first_click_delay !== "") {
    first_click_delay = parseInt(first_click_delay);
  } else {
    first_click_delay = -1;
  }

  const payload = {
    timestamp: new Date().toISOString(),
    session_duration: sessionDuration,
    pages_viewed: pagesViewed,
    first_click_delay: first_click_delay,
    user_agent: navigator.userAgent,
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

// ✅ Only log once on unload (if not from cache)
if (!hasSentLog) {
  window.addEventListener("pagehide", (e) => {
    if (!e.persisted) {
      sendSessionData();
    }
  });
}
