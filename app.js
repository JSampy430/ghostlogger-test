let sessionStart = Date.now();
let hasSentLog = false;

console.log("✅ app.js loaded!");
console.log("🕓 Session started at:", new Date(sessionStart).toISOString());

// ✅ Function to send session duration when user leaves tab
function sendSessionData() {
  if (hasSentLog) return; // 🛑 already sent
  hasSentLog = true;      // ✅ set flag

  const sessionDuration = Math.round((Date.now() - sessionStart) / 1000);
  const pagesViewed = 1;

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

// ✅ When tab is closed or refreshed
window.addEventListener("beforeunload", sendSessionData);

// ❌ Don’t use visibilitychange anymore
// ❌ Don’t use sessionStorage just yet
// ❌ Triggers on every internal nav — that’s your next fix
