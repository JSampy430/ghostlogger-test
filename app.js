let sessionStart = Date.now();
let hasSentLog = false;
// ✅ Initial log when page loads
/*fetch("https://ghostloggerv2.onrender.com/log", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    timestamp: new Date().toISOString()
  })
})
  .then(res => res.json())
  .then(data => console.log("✅ Initial fetch log:", data))
  .catch(err => console.error("❌ Fetch error:", err));

console.log("✅ app.js loaded!");
document.body.style.background = "#eef";
console.log("🕓 Session started at:", new Date(sessionStart).toISOString());
*/


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

// ✅ When tab is hidden (user switches tab)
window.addEventListener("beforeunload", sendSessionData);
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") {
    sendSessionData();
  }
});

// ✅ When tab is about to be closed or refreshed

// Log after 3 seconds even if user doesn’t hide tab
//setTimeout(sendSessionData, 3000);
