// Track session start time
let sessionStart = Date.now();

// 1. Log initial page visit
fetch("https://ghostloggerv2.onrender.com/log", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    timestamp: new Date().toISOString()
  })
})
.then(res => res.json())
.then(data => console.log("✅ Load Logged:", data))
.catch(err => console.error("❌ Load Logging error:", err));

// 2. Log session duration when tab closes or user leaves
window.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") {
    const sessionDuration = Math.round((Date.now() - sessionStart) / 1000);
    const pagesViewed = 1;

    const payload = {
      timestamp: new Date().toISOString(),
      session_duration: sessionDuration,
      pages_viewed: pagesViewed
    };

    const blob = new Blob([JSON.stringify(payload)], { type: "application/json" });
    navigator.sendBeacon("https://ghostloggerv2.onrender.com/log", blob);
    console.log("📤 Sent duration + pages via Beacon:", payload);
  }
});
