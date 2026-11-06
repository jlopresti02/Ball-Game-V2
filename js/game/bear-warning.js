// "WARNING: BEAR IN ARENA" (Joe, 2026-11-06). The moment Khabib's ring bear
// (khabib-bear.js) starts coming in through the crowd, the jumbotron (a
// banner in the test arena) cuts to a flashing warning sign: hazard
// stripes, spinning red beacons and a yellow diamond road sign with the
// bear on it. It's an emergency, so it doesn't wait in the ad queue: it
// goes up straight away, over whatever's on the jumbotron.
"use strict";

var BEAR_WARN_SHOW = 4.0;
var bearWarnShow = 0;

function startBearWarning() { bearWarnShow = BEAR_WARN_SHOW; }
function tickBearWarning(dt) { if (bearWarnShow > 0) bearWarnShow = Math.max(0, bearWarnShow - dt); }

function drawBearWarnJumbo(x, y, w, h) {
  if (bearWarnShow <= 0) return;
  var t = BEAR_WARN_SHOW - bearWarnShow, a = Math.min(1, t / 0.12, bearWarnShow / 0.3), k = h / 250;
  var flash = Math.floor(t * 4) % 2 === 0;
  ctx.save();
  ctx.globalAlpha = a;
  ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
  // Black, with yellow-and-black hazard stripes crawling round the edge.
  ctx.fillStyle = flash ? "#1a0000" : "#0b0b0b"; ctx.fillRect(x, y, w, h);
  var band = 22 * k, sw = 26 * k, off = (t * 60 * k) % (sw * 2);
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h); ctx.rect(x + band, y + band, w - band * 2, h - band * 2);
  ctx.clip("evenodd");
  ctx.fillStyle = "#ffcc00"; ctx.fillRect(x, y, w, h);
  ctx.fillStyle = "#111111";
  for (var s = -h - sw * 2; s < w + h; s += sw * 2) {
    var sx = x + s + off;
    ctx.beginPath(); ctx.moveTo(sx, y); ctx.lineTo(sx + sw, y); ctx.lineTo(sx + sw + h, y + h); ctx.lineTo(sx + h, y + h); ctx.closePath(); ctx.fill();
  }
  ctx.restore();
  // Red beacons spinning on both sides.
  [x + w * 0.09, x + w * 0.91].forEach(function (bx, i) { drawBearBeacon(bx, y + h * 0.52, h * 0.2, t * 7 + i * Math.PI, k); });
  // The yellow diamond road sign with the bear on it.
  var dx = x + w * 0.27, dy = y + h * 0.5, ds = h * 0.36, wob = Math.sin(t * 18) * 0.03 * Math.max(0, 1 - t);
  ctx.save();
  ctx.translate(dx, dy); ctx.rotate(Math.PI / 4 + wob);
  ctx.fillStyle = "#111111"; ctx.fillRect(-ds * 0.78, -ds * 0.78, ds * 1.56, ds * 1.56);
  ctx.fillStyle = "#ffcc00"; ctx.fillRect(-ds * 0.7, -ds * 0.7, ds * 1.4, ds * 1.4);
  ctx.strokeStyle = "#111111"; ctx.lineWidth = 4 * k; ctx.strokeRect(-ds * 0.62, -ds * 0.62, ds * 1.24, ds * 1.24);
  ctx.restore();
  var bear = typeof stillTintedLogo === "function" ? stillTintedLogo(bearSideImg, "#111111") : null;
  if (bear) {
    var bh = ds * 0.95, bw = bh * BEAR_SIDE_ASPECT;
    ctx.drawImage(bear, dx - bw / 2, dy - bh / 2 + ds * 0.04, bw, bh);
  }
  // WARNING / BEAR IN ARENA
  var tx = x + w * 0.62, tw = w * 0.5;
  var pop = 1 + Math.max(0, 0.2 - t) * 2;
  ctx.save();
  ctx.translate(tx, y + h * 0.33); ctx.scale(pop, pop);
  stillText("⚠ WARNING ⚠", 0, 0, 74 * k, flash ? "#ff2a2a" : "#ffcc00", tw, { stroke: "#000000", strokeW: 0.12, glow: flash ? "#ff0000" : "#ffb000" });
  ctx.restore();
  stillText("BEAR IN ARENA", tx, y + h * 0.63, 56 * k, "#ffffff", tw, { stroke: "#000000", strokeW: 0.12 });
  stillText(flash ? "STAY CALM • DO NOT FEED THE BEAR" : "KEEP HANDS INSIDE THE CAGE", tx, y + h * 0.83, 20 * k, "#ffcc00", tw * 0.9,
    { face: "'Helvetica Neue', Helvetica, Arial, sans-serif", weight: "800" });
  ctx.restore();
}

// A rotating emergency light: a red dome with a beam sweeping round.
function drawBearBeacon(cx, cy, r, ang, k) {
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  var dir = Math.cos(ang); // the beam swings left/right
  var g = ctx.createRadialGradient(cx, cy, r * 0.2, cx, cy, r * 3.2);
  g.addColorStop(0, "rgba(255,40,40," + (0.25 + 0.5 * Math.abs(dir)) + ")"); g.addColorStop(1, "rgba(255,0,0,0)");
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, r * 3.2, (dir > 0 ? 0 : Math.PI) - 0.5, (dir > 0 ? 0 : Math.PI) + 0.5); ctx.closePath(); ctx.fill();
  ctx.restore();
  ctx.fillStyle = "#333333"; ctx.fillRect(cx - r * 0.75, cy + r * 0.55, r * 1.5, r * 0.35);
  var dome = ctx.createRadialGradient(cx - r * 0.25, cy - r * 0.2, r * 0.1, cx, cy, r);
  dome.addColorStop(0, "#ffd0d0"); dome.addColorStop(0.35, Math.sin(ang) > 0 ? "#ff2020" : "#c00000"); dome.addColorStop(1, "#600000");
  ctx.fillStyle = dome;
  ctx.beginPath(); ctx.arc(cx, cy + r * 0.55, r * 0.75, Math.PI, 0); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = "#000000"; ctx.lineWidth = Math.max(1, 2 * k); ctx.stroke();
}

function drawBearWarnBanner() {
  if (bearWarnShow <= 0 || stadiumOn()) return;
  drawBearWarnJumbo(10, 10, W - 20, 110);
}
