// ✅ Log load immediately
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

// ✅ Start timer when page loads
let sessionStart = Date.now();
console.log("🕒 Session started at:", new Date(sessionStart).toISOString());

// ✅ Log session duration & pages viewed on visibility change
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") {
    const sessionDuration = Math.round((Date.now() - sessionStart) / 1000);
    const pagesViewed = 1;

    const payload = {
      timestamp: new Date().toISOString(),
      session_duration: sessionDuration,
      pages_viewed: pagesViewed
    };

    console.log("📤 Sending unload payload:", payload);

    const blob = new Blob([JSON.stringify(payload)], {
      type: "application/json"
    });

    navigator.sendBeacon("https://ghostloggerv2.onrender.com/log", blob);
  }
});
