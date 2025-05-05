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
window.addEventListener("beforeunload", () => {
  const sessionDuration = Math.round((Date.now() - sessionStart) / 1000);
  const pagesViewed = 1;

  const payload = JSON.stringify({
    timestamp: new Date().toISOString(),
    session_duration: sessionDuration,
    pages_viewed: pagesViewed
  });

  const blob = new Blob([payload], { type: "application/json" });
  navigator.sendBeacon("https://ghostloggerv2.onrender.com/log", blob);
console.log("🔥 Logging with duration + pages...");
  
});
