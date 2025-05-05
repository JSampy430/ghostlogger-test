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

window.addEventListener("beforeunload", () => {
  let sessionDuration = Math.round((Date.now() - sessionStart) / 1000);
  let pagesViewed = 1;

  fetch("https://ghostloggerv2.onrender.com/log", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      timestamp: new Date().toISOString(),
      session_duration: sessionDuration,
      pages_viewed: pagesViewed
    })
  })
  .then(res => res.json())
  .then(data => console.log("✅ Unload Logged:", data))
  .catch(err => console.error("❌ Logging error (unload):", err));
});
