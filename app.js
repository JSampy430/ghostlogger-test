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

// ✅ Log session duration & page views when page closes
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

  console.log("📦 Session logged with duration + pages...");
});
