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

// ✅ Log session duration & page views when page becomes hidden
window.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") {
    const sessionDuration = Math.round((Date.now() - sessionStart) / 1000);
    const pagesViewed = 1;

    const payload = {
      timestamp: new Date().toISOString(),
      session_duration: sessionDuration,
      pages_viewed: pagesViewed
    };

    console.log("📤 About to send this payload via Beacon:");
    console.log("🕒 Duration:", sessionDuration, "seconds");
    console.log("📄 Pages viewed:", pagesViewed);
    console.log("📦 Payload:", payload);

    const blob = new Blob([JSON.stringify(payload)], {
      type: "application/json"
    });

    const success = navigator.sendBeacon("https://ghostloggerv2.onrender.com/log", blob);
    console.log("📬 Beacon send success:", success);
  }
});
