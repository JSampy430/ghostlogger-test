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

// 2. Start session timer
let sessionStart = Date.now();

// 3. Log session duration & pages viewed when tab is hidden or closed
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") {
    const sessionDuration = Math.round((Date.now() - sessionStart) / 1000);
    const pagesViewed = 1; // You can enhance this later if needed

    const payload = {
      timestamp: new Date().toISOString(),
      session_duration: sessionDuration,
      pages_viewed: pagesViewed
    };

    const blob = new Blob([JSON.stringify(payload)], { type: "application/json" });
    navigator.sendBeacon("https://ghostloggerv2.onrender.com/log", blob);
    console.log("📤 Logging on tab hide:", payload);
  }
});
