//let sessionStart = Date.now();
//let hasSentLog = false;


// ✅ Set or retrieve persistent session start time
let sessionStart = sessionStorage.getItem("sessionStart");
if (!sessionStart) {
  sessionStart = Date.now();
  sessionStorage.setItem("sessionStart", sessionStart);
}

let pagesViewed = parseInt(sessionStorage.getItem("pagesViewed") || "0");
pagesViewed += 1;
sessionStorage.setItem("pagesViewed", pagesViewed);

let hasSentLog = sessionStorage.getItem("hasSentLog") === "true";



console.log("✅ app.js loaded!");
console.log("✅ app.js loaded!");
console.log("🕓 Session started at:", new Date(sessionStart).toISOString());

// ✅ Function to send session duration when user leaves tab
function sendSessionData() {
    if (hasSentLog) return; // 🛑 already sent
    hasSentLog = true;      // ✅ set flag
    sessionStorage.setItem("hasSentLog", "true");
  
  const sessionStart = parseInt(sessionStorage.getItem("sessionStart") || Date.now());
  const sessionDuration = Math.round((Date.now() - sessionStart) / 1000);
  const pagesViewed = parseInt(sessionStorage.getItem("pagesViewed") || "1");

  const payload = {
    timestamp: new Date().toISOString(),
    session_duration: sessionDuration,
    pages_viewed: pagesViewed
  };

  console.log("📦 Sending payload:", payload);

  const blob = new Blob([JSON.stringify(payload)], {
    type: "application/json"
  });

  const success = navigator.sendBeacon(
    "https://ghostloggerv2.onrender.com/log",
    blob
  );
  console.log("📤 Beacon sent success:", success);
}

// ✅ When tab is hidden (user switches tab)
window.addEventListener("pagehide", (e) => {
  if (!e.persisted) { // If it's not a page reload or internal nav
    sendSessionData();
  }
});

