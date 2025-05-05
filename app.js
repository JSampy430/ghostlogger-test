// ✅ Start timer when page loads
let sessionStart = Date.now();
console.log("🕐 Session started at:", new Date(sessionStart).toISOString());

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

    // Debug log before sending
    console.log("📦 Logging payload before beacon send:");
    console.log("⏱️ Duration:", sessionDuration, "seconds");
    console.log("📄 Pages viewed:", pagesViewed);
    console.log("🧠 Payload:", payload);

    const blob = new Blob([JSON.stringify(payload)], {
      type: "application/json"
    });

    const success = navigator.sendBeacon("https://ghostloggerv2.onrender.com/log", blob);
    console.log("📬 Beacon sent successfully?", success);
  }
});
