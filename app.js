// ✅ Start timer when page loads
let sessionStart = Date.now();
console.log("🕒 Session started at:", new Date(sessionStart).toISOString());

// ✅ Log session info when tab is closed or hidden
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") {
    const sessionDuration = Math.round((Date.now() - sessionStart) / 1000);
    const pagesViewed = 1;

    const payload = {
      timestamp: new Date().toISOString(),
      session_duration: sessionDuration,
      pages_viewed: pagesViewed
    };

    console.log("📤 Sending payload:", payload);

    const blob = new Blob([JSON.stringify(payload)], {
      type: "application/json"
    });

    const success = navigator.sendBeacon("https://ghostloggerv2.onrender.com/log", blob);
    console.log("📬 Beacon success:", success);
  }
});
