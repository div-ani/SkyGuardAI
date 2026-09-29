/* ==========================================================
   utils.js – small helpers used across the app
   ========================================================== */

// `html` lets us write JSX-like markup without a build step:
//   html`<div className="card">${text}</div>`
SkyGuard.html = htm.bind(React.createElement);

// 1234.5 -> "1235", 12.345 -> "12.3"
SkyGuard.formatValue = (value) =>
  Math.abs(value) >= 100 ? value.toFixed(0) : value.toFixed(1);

// timestamp -> "14:05"
SkyGuard.formatTime = (timestamp) =>
  new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
