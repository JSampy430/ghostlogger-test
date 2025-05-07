// ✅ Cleaned and upgraded GhostLogger session script with scroll fix

// 🔥 Warm up Render so it doesn’t go cold
fetch("https://ghostloggerv2.onrender.com/ping", {
  headers: {
    "X-Warm-Up": "true"
  }
}).catch(() => {});

// Track and increment pages viewed
let pagesViewed = parseInt(sessionStorage.getItem("pagesViewed") || "0");
pagesViewed += 1;
sessionStorage.setItem("pagesViewed", pagesViewed.toString());

// Set or get session start time
let sessionStart = sessionStorage.getItem("sessionStart");
if (!sessionStart) {
  sessionStart = Date.now();
  sessionStorage.setItem("sessionStart", sessionStart.toString());
} else {
  sessionStart = parseInt(sessionStart);
}

// Clear session storage if referrer is external
if (document.referrer && !document.referrer.includes(window.location.hostname)) {
  sessionStorage.clear();
}

// Track if log has already been sent
let hasSentLog = sessionStorage.getItem("hasSentLog") === "true";

let firstClickTime = null;
let firstClickElement = null;
let maxScrollDepth = 0;
let scrollStartTime = Date.now();
let idleTime = 0;
let idleTimer;

// ✅ Scroll tracking
function updateScrollDepth() {
  const scrollTop = window.scrollY;
  const scrollHeight = document.body.scrollHeight - window.innerHeight;
  const percentScrolled = Math.min((scrollTop / scrollHeight) * 100, 100);
  maxScrollDepth = Math.max(maxScrollDepth, Math.round(percentScrolled));
}

window.addEventListener("scroll", updateScrollDepth);

// ✅ Capture scroll before link/button navigation
function addNavigationClickTracking() {
  document.querySelectorAll("a, button").forEach(el => {
    el.addEventListener("click", () => {
      updateScrollDepth();
    });
  });
}
addNavigationClickTracking();

// ✅ First click capture
document.addEventListener("click", (e) => {
  if (!firstClickTime) {
    firstClickTime = Date.now();
    firstClickElement = e.target.tagName + (e.target.id ? `#${e.target.id}` : "");
  }
});

// ✅ Idle tracking
function resetIdleTimer() {
  clearTimeout(idleTimer);
  idleTimer = setTimeout(() => {
    idleTime += 5; // add idle if no action for 5s
  }, 5000);
}
["mousemove", "keydown", "scroll", "click"].forEach(event =>
  document.addEventListener(event, resetIdleTimer)
);
resetIdleTimer();

// ✅ Send session data once
function sendSessionData() {
  if (hasSentLog) return;

  updateScrollDepth(); // force last scroll check

  const sessionEnd = Date.now();
  const duration = Math.round((sessionEnd - sessionStart) / 1000);
  const timeToClick = firstClickTime ? ((firstClickTime - sessionStart) / 1000).toFixed(1) + "s" : "";
  const scrollVelocity = maxScrollDepth / ((sessionEnd - scrollStartTime) / 1000); // % per second

  const payload = {
    timestamp: new Date(sessionStart).toISOString(),
    session_duration: duration,
    pages_viewed: pagesViewed,
    first_click_delay: timeToClick,
    page_path: window.location.pathname,
    scroll_path: `${maxScrollDepth}%`,
    scroll_velocity: scrollVelocity.toFixed(2) + "%/s",
    first_click_element: firstClickElement || "",
    time_to_click: timeToClick,
    idle_time: idleTime + "s"
  };

  const blob = new Blob([JSON.stringify(payload)], {
    type: "application/json",
  });

  const success = navigator.sendBeacon("https://ghostloggerv2.onrender.com/log", blob);
  sessionStorage.setItem("hasSentLog", "true");
  hasSentLog = true;
}

// ✅ Log once on unload (if not from cache)
if (!hasSentLog) {
  window.addEventListener("pagehide", (e) => {
    if (!e.persisted) {
      sendSessionData();
    }
  });
}

console.log("✅ GhostLogger script initialized");
