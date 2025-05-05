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
.then(data => console.log("Logged:", data))
.catch(err => console.error("Logging error:", err));
