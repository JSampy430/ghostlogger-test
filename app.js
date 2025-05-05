let sessionStart = Date.now();

window.addEventListener("beforeunload", () => {
  let sessionDuration = Math.round((Date.now() - sessionStart) / 1000); // in seconds
  let pagesViewed = 1; // can later hook into navigation tracking if needed

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
  .then(data => console.log("✅ Logged:", data))
  .catch(err => console.error("❌ Logging error:", err));
});
