// 1. Log immediately on page load
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
.catch(err => console.error("❌ Logging error (load):", err));

// 2. Track session time and log on unload
let sessionStart = Date.now();

window.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") {
    const sessionDuration = Math.round((Date.now() - sessionStart) / 1000);
    const pagesViewed = 1; // You can increment this based on your logic later

    const payload = {
      timestamp: new Date().toISOString(),
      session_duration: sessionDuration,
      pages_viewed: pagesViewed
    };

    const blob = new Blob([JSON.stringify(payload)], { type: "application/json" });
    navigator.sendBeacon("https://ghostloggerv2.onrender.com/log", blob);
    console.log("📤 Logging with duration + pages...");
  }
});

console.log("🟢 app.js is running!");
