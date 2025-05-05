// ✅ Start session time
console.log("✅ app.js loaded!");
document.body.style.background = "#eef";

let sessionStart = Date.now();
console.log("🕒 Session started at:", new Date(sessionStart).toISOString());

// ✅ When tab is closed or refreshed
window.addEventListener("beforeunload", () => {
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
  console.log("✅ Beacon send success:", success);
});
