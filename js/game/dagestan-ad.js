// Dagestan World (Joe, 2026-11-06): a still theme-park ad in the ad-break
// rotation (still-ads.js). Khabib rides the front car of the park's
// coaster, arms up, cresting the lift hill, over the snowy Caucasus.
//   Title     an entrance sign on the left: DAGESTAN (gently arched, in its
//             own row so nothing covers it) over a big WORLD, marquee bulbs
//             round the edge, and the "2-3 week vacation and forget" ribbon
//   Scenery   a warm sky, layered mountain ridges with snow, rolling hills,
//             pines, soft clouds and a Ferris wheel
//   Coaster   a boarding station where the ride starts, the chain lift, the
//             drop and a vertical loop, on two rails with ties and lattice
//             supports, and a two-car train on the track
// The scenery is drawn once into an offscreen canvas per size; only the
// fighter on top is drawn each frame.
"use strict";

var dagestanCache = { key: null, cv: null };

// Smooth ridgelines: a fixed sum of sines, so the mountains never change.
function dwRidge(u, seed) {
  return 0.5 * Math.sin(u * 7.1 + seed) + 0.28 * Math.sin(u * 15.3 + seed * 2.3) + 0.14 * Math.sin(u * 33.7 + seed * 4.1) + 0.06 * Math.sin(u * 71 + seed * 7);
}

function drawDagestanWorld(x, y, w, h, k, ch) {
  var px = (typeof canvas !== "undefined" && canvas.width && typeof STAGE_W !== "undefined" && stadiumOn()) ? canvas.width / STAGE_W : 2;
  var key = Math.round(w) + "x" + Math.round(h) + "@" + px.toFixed(2);
  if (dagestanCache.key !== key) {
    var cv = document.createElement("canvas");
    cv.width = Math.ceil(w * px); cv.height = Math.ceil(h * px);
    var g = cv.getContext("2d");
    g.scale(px, px);
    var saved = ctx; ctx = g; // reuse the poster helpers on the offscreen canvas
    try { dwScene(0, 0, w, h, k); } finally { ctx = saved; }
    dagestanCache = { key: key, cv: cv, track: dwTrack(0, 0, w, h, k) };
  }
  ctx.drawImage(dagestanCache.cv, x, y, w, h);
  dwTrain(x, y, w, h, k, ch, dagestanCache.track);
}

// ---------------------------------------------------------------- the scenery

function dwScene(x, y, w, h, k) {
  // Sky: deep blue up top, warm haze at the horizon, a glowing sun.
  var sky = ctx.createLinearGradient(0, y, 0, y + h);
  sky.addColorStop(0, "#1e6fd9"); sky.addColorStop(0.55, "#7cc3ff"); sky.addColorStop(1, "#ffe1b3");
  ctx.fillStyle = sky; ctx.fillRect(x, y, w, h);
  var sx = x + w * 0.62, sy = y + h * 0.2;
  var sg = ctx.createRadialGradient(sx, sy, h * 0.04, sx, sy, h * 0.45);
  sg.addColorStop(0, "rgba(255,250,215,0.95)"); sg.addColorStop(0.25, "rgba(255,236,160,0.45)"); sg.addColorStop(1, "rgba(255,236,160,0)");
  ctx.fillStyle = sg; ctx.fillRect(x, y, w, h);
  ctx.fillStyle = "#fffbe6"; ctx.beginPath(); ctx.arc(sx, sy, h * 0.065, 0, Math.PI * 2); ctx.fill();

  [[0.47, 0.12, 1.0], [0.76, 0.2, 0.8], [0.97, 0.09, 0.9], [0.56, 0.36, 0.6]].forEach(function (c) { dwCloud(x + w * c[0], y + h * c[1], h * 0.1 * c[2]); });

  // Three mountain ranges, hazier the farther back.
  dwRange(x, y, w, h, 0.44, 0.2, 3.1, ["#a9bbdc", "#c9d6ee"], 0.62, 0.55);
  dwRange(x, y, w, h, 0.53, 0.24, 0.7, ["#6f86b3", "#93a8cf"], 0.58, 0.85);
  dwRange(x, y, w, h, 0.64, 0.16, 5.4, ["#4c6a8f", "#6f8db0"], 0.75, 0.95);

  // Rolling green hills in front.
  var hill = ctx.createLinearGradient(0, y + h * 0.66, 0, y + h);
  hill.addColorStop(0, "#6dbb4a"); hill.addColorStop(1, "#2f7d2c");
  ctx.fillStyle = hill;
  ctx.beginPath(); ctx.moveTo(x, y + h);
  for (var i = 0; i <= 80; i++) { var u = i / 80; ctx.lineTo(x + w * u, y + h * (0.76 + 0.035 * Math.sin(u * 9 + 1) + 0.02 * Math.sin(u * 23))); }
  ctx.lineTo(x + w, y + h); ctx.closePath(); ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.08)";
  for (var m = 0; m < 30; m++) ctx.fillRect(x + w * ((m * 0.137) % 1), y + h * (0.86 + (m % 4) * 0.03), w * 0.04, 1.2 * k); // mowing stripes

  // Pines along the hills.
  for (var t = 0; t < 26; t++) {
    var tx = x + w * (0.41 + ((t * 0.0731) % 0.6)), ts = h * (0.06 + (t % 3) * 0.015);
    if (tx > x + w * 0.99) continue;
    dwPine(tx, y + h * (0.79 + (t % 2) * 0.02), ts);
  }
  ctx.save(); ctx.globalAlpha = 0.8; dwFerrisWheel(x + w * 0.44, y + h * 0.45, h * 0.27, k); ctx.restore(); // farther back
  dwCoaster(x, y, w, h, k);
  dwTitle(x, y, w, h, k);
}

function dwCloud(cx, cy, s) {
  [[0, 0, 1], [0.9, 0.2, 0.75], [-0.9, 0.22, 0.7], [0.4, -0.35, 0.7], [-0.35, -0.25, 0.6]].forEach(function (p) {
    var g = ctx.createRadialGradient(cx + p[0] * s, cy + p[1] * s - s * 0.3 * p[2], s * 0.1, cx + p[0] * s, cy + p[1] * s, s * p[2]);
    g.addColorStop(0, "#ffffff"); g.addColorStop(0.75, "#f4f8ff"); g.addColorStop(1, "rgba(214,226,245,0.95)");
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx + p[0] * s, cy + p[1] * s, s * p[2], 0, Math.PI * 2); ctx.fill();
  });
}

// One mountain range: `base` is where the ridge sits (fraction of h), `amp`
// how tall it is; snow covers whatever rises above the snowline.
function dwRange(x, y, w, h, base, amp, seed, cols, snow, alpha) {
  var pts = [];
  for (var i = 0; i <= 160; i++) { var u = i / 160; pts.push([x + w * u, y + h * (base - amp * (0.45 + 0.55 * dwRidge(u, seed)))]); }
  function outline() { ctx.beginPath(); ctx.moveTo(x, y + h); pts.forEach(function (p) { ctx.lineTo(p[0], p[1]); }); ctx.lineTo(x + w, y + h); ctx.closePath(); }
  ctx.save();
  ctx.globalAlpha = alpha;
  var g = ctx.createLinearGradient(0, y + h * (base - amp), 0, y + h * (base + 0.3));
  g.addColorStop(0, cols[0]); g.addColorStop(1, cols[1]);
  outline(); ctx.fillStyle = g; ctx.fill();
  ctx.clip();
  // Light from the upper left: a soft sheen that fades across the range.
  var sh = ctx.createLinearGradient(x, 0, x + w, 0);
  sh.addColorStop(0, "rgba(255,255,255,0.12)"); sh.addColorStop(0.5, "rgba(255,255,255,0)"); sh.addColorStop(1, "rgba(10,20,50,0.12)");
  ctx.fillStyle = sh; ctx.fillRect(x, y, w, h);
  // Snow above the snowline, with a ragged edge.
  var line = y + h * (base - amp * snow);
  ctx.fillStyle = "#f7fbff";
  ctx.beginPath(); ctx.moveTo(x, y);
  for (var s = 0; s <= 120; s++) { var u = s / 120; ctx.lineTo(x + w * u, line + h * 0.025 * Math.sin(u * 97 + seed) + h * 0.015 * Math.sin(u * 211)); }
  ctx.lineTo(x + w, y); ctx.closePath(); ctx.fill();
  ctx.restore();
}

function dwPine(x, base, s) {
  ctx.fillStyle = "#5a3a20"; ctx.fillRect(x - s * 0.06, base - s * 0.2, s * 0.12, s * 0.25);
  [["#1f5a2a", 0], ["#24692f", 0.3], ["#2c7a37", 0.58]].forEach(function (l) {
    var lw = s * (0.42 - l[1] * 0.35), ly = base - s * (0.15 + l[1] * 0.75);
    ctx.fillStyle = l[0];
    ctx.beginPath(); ctx.moveTo(x, ly - s * 0.45); ctx.lineTo(x + lw, ly); ctx.lineTo(x - lw, ly); ctx.closePath(); ctx.fill();
  });
}

function dwFerrisWheel(cx, cy, r, k) {
  ctx.save();
  ctx.strokeStyle = "#f4f4f4"; ctx.lineWidth = 3 * k;
  ctx.beginPath(); ctx.moveTo(cx - r * 0.55, cy + r * 1.45); ctx.lineTo(cx, cy); ctx.lineTo(cx + r * 0.55, cy + r * 1.45); ctx.stroke();
  ctx.lineWidth = 2.2 * k;
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
  ctx.lineWidth = 1.2 * k;
  ctx.beginPath(); ctx.arc(cx, cy, r * 0.9, 0, Math.PI * 2); ctx.stroke();
  for (var i = 0; i < 12; i++) {
    var a = i * Math.PI / 6;
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); ctx.stroke();
  }
  var cols = ["#e53935", "#fdd835", "#43a047", "#1e88e5", "#8e24aa", "#fb8c00"];
  for (var j = 0; j < 12; j++) {
    var b = j * Math.PI / 6 + Math.PI / 12, gx = cx + Math.cos(b) * r, gy = cy + Math.sin(b) * r;
    ctx.strokeStyle = "#cccccc"; ctx.lineWidth = 1 * k; ctx.beginPath(); ctx.moveTo(gx, gy); ctx.lineTo(gx, gy + 5 * k); ctx.stroke();
    ctx.fillStyle = cols[j % cols.length];
    stillRoundRect(gx - 6 * k, gy + 4 * k, 12 * k, 10 * k, 3 * k); ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.5)"; ctx.fillRect(gx - 4 * k, gy + 6 * k, 8 * k, 3 * k);
  }
  ctx.fillStyle = "#d32f2f"; ctx.beginPath(); ctx.arc(cx, cy, 5 * k, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

// ---------------------------------------------------------------- the coaster

// The track as a dense list of points (with unit tangents and normals and
// running length): station, lift hill, drop, loop, then off the right edge.
function dwTrack(x, y, w, h, k) {
  var yb = y + h * 0.86, H = h * 0.5;
  var P = [[0.47, 0], [0.585, 0], [0.605, 0.07], [0.642, 0.85], [0.662, 1], [0.738, 1], [0.758, 0.85], [0.785, 0.25], [0.8, 0.02], [0.815, 0], [0.845, 0]]
    .map(function (p) { return [x + w * p[0], yb - H * p[1]]; });
  var pts = [];
  // Catmull-Rom through the control points (from the station to the valley).
  for (var i = 0; i < P.length - 2; i++) {
    var p0 = P[Math.max(0, i - 1)], p1 = P[i], p2 = P[i + 1], p3 = P[Math.min(P.length - 1, i + 2)];
    for (var s = 0; s < 24; s++) {
      var t = s / 24, t2 = t * t, t3 = t2 * t;
      pts.push({
        x: 0.5 * (2 * p1[0] + (-p0[0] + p2[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3),
        y: 0.5 * (2 * p1[1] + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3),
        lift: i === 2 || i === 3
      });
    }
  }
  // A vertical loop that comes out still going forward.
  var xv = P[P.length - 2][0], R = h * 0.2, lc = R * 0.3;
  for (var l = 0; l <= 96; l++) { var th = l / 96 * Math.PI * 2; pts.push({ x: xv + lc * th + R * Math.sin(th), y: yb - R + R * Math.cos(th), loop: true }); }
  for (var e = 1; e <= 10; e++) pts.push({ x: xv + lc * Math.PI * 2 + (x + w + 20 - xv - lc * Math.PI * 2) * e / 10, y: yb });
  var len = 0;
  pts.forEach(function (p, j) {
    var a = pts[Math.max(0, j - 1)], b = pts[Math.min(pts.length - 1, j + 1)];
    var dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy) || 1;
    p.tx = dx / d; p.ty = dy / d; p.nx = dy / d; p.ny = -dx / d; // normal points "up" off the rails
    if (j) len += Math.hypot(p.x - pts[j - 1].x, p.y - pts[j - 1].y);
    p.s = len;
  });
  return { pts: pts, yb: yb, gap: 4.2 * k, xv: xv, R: R, lc: lc, station: [x + w * 0.47, x + w * 0.585] };
}
function dwAt(tr, s) {
  var pts = tr.pts;
  for (var i = 1; i < pts.length; i++) if (pts[i].s >= s) {
    var a = pts[i - 1], b = pts[i], u = (s - a.s) / Math.max(1e-6, b.s - a.s);
    return { x: a.x + (b.x - a.x) * u, y: a.y + (b.y - a.y) * u, ang: Math.atan2(b.y - a.y, b.x - a.x) };
  }
  return pts[pts.length - 1];
}

function dwCoaster(x, y, w, h, k) {
  var tr = dwTrack(x, y, w, h, k), pts = tr.pts, gap = tr.gap, yb = tr.yb, ground = y + h;
  // Supports: steel columns every so often down to the ground, X-braced.
  ctx.save();
  ctx.strokeStyle = "#f2f2f2"; ctx.lineWidth = 2 * k;
  var cols = [], last = -1e9;
  pts.forEach(function (p) {
    if (p.loop || p.x > x + w || yb - p.y < h * 0.06 || p.x - last < 16 * k) return;
    last = p.x; cols.push(p);
  });
  cols.forEach(function (p, i) {
    ctx.beginPath(); ctx.moveTo(p.x, p.y + gap); ctx.lineTo(p.x, ground); ctx.stroke();
    var q = cols[i + 1];
    if (!q || q.x - p.x > 30 * k) return;
    ctx.lineWidth = 1 * k;
    for (var by = Math.max(p.y, q.y) + 10 * k; by + 14 * k < ground; by += 18 * k) {
      ctx.beginPath(); ctx.moveTo(p.x, by); ctx.lineTo(q.x, by + 14 * k); ctx.moveTo(q.x, by); ctx.lineTo(p.x, by + 14 * k); ctx.stroke();
    }
    ctx.lineWidth = 2 * k;
  });
  var top = tr.xv + tr.lc * Math.PI; // the loop's A-frame
  ctx.lineWidth = 2.5 * k;
  ctx.beginPath(); ctx.moveTo(top - tr.R * 0.9, ground); ctx.lineTo(top, yb - tr.R * 2 - gap); ctx.lineTo(top + tr.R * 0.9, ground); ctx.stroke();
  ctx.restore();

  // The station where the ride starts: platform, posts, striped roof, sign.
  var s0 = tr.station[0], s1 = tr.station[1], sw = s1 - s0, roofY = yb - h * 0.42;
  ctx.fillStyle = "#8d6e63"; ctx.fillRect(s0 - 4 * k, yb + gap + 1, sw + 8 * k, h * 0.05); // platform
  ctx.fillStyle = "#6d4c41"; ctx.fillRect(s0 - 4 * k, yb + gap + 1 + h * 0.05, sw + 8 * k, ground - yb);
  ctx.fillStyle = "#ffffff";
  [0.04, 0.5, 0.96].forEach(function (f) { ctx.fillRect(s0 + sw * f - 2 * k, roofY, 4 * k, yb - roofY); });
  ctx.save(); // red-and-white striped roof
  ctx.beginPath(); ctx.moveTo(s0 - 10 * k, roofY); ctx.lineTo(s0 + sw * 0.5, roofY - h * 0.1); ctx.lineTo(s1 + 10 * k, roofY); ctx.closePath(); ctx.clip();
  for (var st = 0; st < 12; st++) { ctx.fillStyle = st % 2 ? "#ffffff" : "#d32f2f"; ctx.fillRect(s0 - 10 * k + st * (sw + 20 * k) / 12, roofY - h * 0.12, (sw + 20 * k) / 12 + 1, h * 0.12); }
  ctx.restore();
  ctx.strokeStyle = "#7f1d1d"; ctx.lineWidth = 1.5 * k;
  ctx.beginPath(); ctx.moveTo(s0 - 10 * k, roofY); ctx.lineTo(s0 + sw * 0.5, roofY - h * 0.1); ctx.lineTo(s1 + 10 * k, roofY); ctx.closePath(); ctx.stroke();
  ctx.fillStyle = "#1b1b5a"; stillRoundRect(s0 + sw * 0.08, roofY + 3 * k, sw * 0.84, h * 0.075, 4 * k); ctx.fill();
  stillText("DAGESTAN EXPRESS", s0 + sw / 2, roofY + 3 * k + h * 0.0375, 11 * k, "#ffd23f", sw * 0.78, { face: "'Helvetica Neue', Helvetica, Arial, sans-serif", weight: "900" });
  stillText("RIDE STARTS HERE →", s0 + sw / 2, yb + gap + h * 0.025 + 1, 8 * k, "#ffffff", sw * 0.9, { face: "'Helvetica Neue', Helvetica, Arial, sans-serif", weight: "800" });

  // Ties, the lift chain, then the two rails.
  ctx.strokeStyle = "#4a4a4a"; ctx.lineWidth = 2.2 * k;
  var acc = 0;
  for (var i = 1; i < pts.length; i++) {
    acc += pts[i].s - pts[i - 1].s;
    if (acc < 7 * k) continue;
    acc = 0;
    var T = pts[i];
    ctx.beginPath(); ctx.moveTo(T.x - T.nx * gap * 1.7, T.y - T.ny * gap * 1.7); ctx.lineTo(T.x + T.nx * gap * 1.7, T.y + T.ny * gap * 1.7); ctx.stroke();
  }
  ctx.strokeStyle = "#222222"; ctx.lineWidth = 1.6 * k; ctx.setLineDash([2 * k, 2 * k]);
  ctx.beginPath(); var on = false;
  pts.forEach(function (p) { if (p.lift) { if (on) ctx.lineTo(p.x, p.y); else { ctx.moveTo(p.x, p.y); on = true; } } });
  ctx.stroke(); ctx.setLineDash([]);
  [-1, 1].forEach(function (side) {
    ctx.strokeStyle = "#b71c1c"; ctx.lineWidth = 3.2 * k; ctx.lineJoin = "round"; ctx.lineCap = "round";
    ctx.beginPath();
    pts.forEach(function (p, j) { var a = p.x + p.nx * gap * side, b = p.y + p.ny * gap * side; if (j) ctx.lineTo(a, b); else ctx.moveTo(a, b); });
    ctx.stroke();
    ctx.strokeStyle = "rgba(255,255,255,0.35)"; ctx.lineWidth = 1 * k;
    ctx.beginPath();
    pts.forEach(function (p, j) { var a = p.x + p.nx * (gap * side + 0.8 * k), b = p.y + p.ny * (gap * side + 0.8 * k); if (j) ctx.lineTo(a, b); else ctx.moveTo(a, b); });
    ctx.stroke();
  });
}

// The train: Khabib in the front car just over the crest, arms up, a fan
// in the car behind him. Drawn every frame (the fighter art can load late).
function dwTrain(x, y, w, h, k, ch, tr) {
  // The middle of the flat top of the hill, so the train sits level.
  var topY = tr.pts.reduce(function (m, p) { return !p.loop && p.y < m ? p.y : m; }, 1e9);
  var flat = tr.pts.filter(function (p) { return !p.loop && p.y < topY + h * 0.012; });
  var crest = flat[Math.floor(flat.length / 2)];
  var r = h * 0.11, carLen = r * 2.4;
  [{ s: crest.s + carLen * 0.55, who: "khabib" }, { s: crest.s - carLen * 0.5, who: "fan" }].forEach(function (car, i) {
    var at = dwAt(tr, car.s);
    ctx.save();
    ctx.translate(x + at.x, y + at.y); ctx.rotate(at.ang); ctx.translate(0, -tr.gap * 1.7);
    var look = car.who === "khabib" ? ch.look : (typeof poorbetFan === "function" ? poorbetFan().look : ch.look);
    var rr = car.who === "khabib" ? r : r * 0.85;
    // Arms up.
    drawGlove(ctx, -rr * 0.78, -rr * 2.25, rr * 0.36, look, "#0b0f12", -Math.PI / 2 - 0.35);
    drawGlove(ctx, rr * 0.78, -rr * 2.25, rr * 0.36, look, "#0b0f12", -Math.PI / 2 + 0.35);
    ctx.strokeStyle = look.skin; ctx.lineWidth = rr * 0.22; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(-rr * 0.62, -rr * 1.25); ctx.lineTo(-rr * 0.74, -rr * 1.95); ctx.moveTo(rr * 0.62, -rr * 1.25); ctx.lineTo(rr * 0.74, -rr * 1.95); ctx.stroke();
    if (car.who === "khabib") {
      drawFighterArt(ctx, 0, -rr * 1.1, rr, look, "#0b0f12", { layout: "contained", name: ch.name });
      ctx.lineWidth = Math.max(1.5, rr * 0.05); ctx.strokeStyle = "#0b0f12"; ctx.beginPath(); ctx.arc(0, -rr * 1.1, rr, 0, Math.PI * 2); ctx.stroke();
    } else if (typeof drawFanBall === "function") {
      ctx.save(); ctx.translate(0, -rr * 1.1); drawFanBall(ctx, rr, poorbetFan()); ctx.restore();
    }
    // The car: rounded body, a stripe, a lap bar and two wheels on the rail.
    var cl = carLen * (i ? 0.92 : 1);
    var body = ctx.createLinearGradient(0, -rr * 0.7, 0, 0);
    body.addColorStop(0, i ? "#ffb300" : "#ffe14d"); body.addColorStop(1, i ? "#e08e00" : "#f2b600");
    ctx.fillStyle = body; ctx.strokeStyle = "#0b0f12"; ctx.lineWidth = 2 * k;
    ctx.beginPath();
    ctx.moveTo(-cl / 2, -rr * 0.7); ctx.lineTo(cl / 2 - rr * 0.15, -rr * 0.7);
    if (!i) ctx.quadraticCurveTo(cl / 2 + rr * 0.35, -rr * 0.6, cl / 2 + rr * 0.15, -rr * 0.08); else ctx.lineTo(cl / 2, -rr * 0.08);
    ctx.lineTo(-cl / 2, -rr * 0.08); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#c62828"; ctx.fillRect(-cl / 2, -rr * 0.42, cl, rr * 0.09);
    ctx.fillStyle = "#333333";
    [-0.32, 0.32].forEach(function (f) { ctx.beginPath(); ctx.arc(f * cl, 0, rr * 0.13, 0, Math.PI * 2); ctx.fill(); });
    ctx.restore();
  });
  // The connecting hitch.
  var a = dwAt(tr, crest.s + carLen * 0.02);
  ctx.fillStyle = "#333333"; ctx.fillRect(x + a.x - 4 * k, y + a.y - tr.gap * 1.7 - r * 0.35, 8 * k, 3 * k);
  var at = dwAt(tr, crest.s + carLen * 0.55);
  stillText("WHEEE!", x + at.x + r * 2.4, y + at.y - r * 2.2, 24 * k, "#ffffff", w * 0.1, { stroke: "#c62828", strokeW: 0.2 });
}

// ---------------------------------------------------------------- the title

function dwTitle(x, y, w, h, k) {
  var bx = x + w * 0.025, by = y + h * 0.06, bw = w * 0.37, bh = h * 0.62, cx = bx + bw / 2;
  // The sign board: navy, gold trim, posts down to the ground.
  ctx.fillStyle = "#5d4037"; ctx.fillRect(bx + bw * 0.12, by + bh, 7 * k, y + h - by - bh); ctx.fillRect(bx + bw * 0.88 - 7 * k, by + bh, 7 * k, y + h - by - bh);
  ctx.fillStyle = "rgba(0,0,0,0.3)"; stillRoundRect(bx + 4 * k, by + 5 * k, bw, bh, 18 * k); ctx.fill();
  var g = ctx.createLinearGradient(0, by, 0, by + bh);
  g.addColorStop(0, "#22307a"); g.addColorStop(1, "#121a4a");
  ctx.fillStyle = g; stillRoundRect(bx, by, bw, bh, 18 * k); ctx.fill();
  ctx.strokeStyle = "#e3c26a"; ctx.lineWidth = 4 * k; stillRoundRect(bx, by, bw, bh, 18 * k); ctx.stroke();
  ctx.strokeStyle = "rgba(227,194,106,0.5)"; ctx.lineWidth = 1.2 * k; stillRoundRect(bx + 9 * k, by + 9 * k, bw - 18 * k, bh - 18 * k, 12 * k); ctx.stroke();
  // Marquee bulbs round the edge.
  var per = 2 * (bw + bh), nb = Math.round(per / (17 * k));
  for (var i = 0; i < nb; i++) {
    var d = i * per / nb, px, py;
    if (d < bw) { px = bx + d; py = by; } else if (d < bw + bh) { px = bx + bw; py = by + d - bw; }
    else if (d < 2 * bw + bh) { px = bx + bw - (d - bw - bh); py = by + bh; } else { px = bx; py = by + bh - (d - 2 * bw - bh); }
    var bg = ctx.createRadialGradient(px, py, 0, px, py, 5 * k);
    bg.addColorStop(0, "#fffbe0"); bg.addColorStop(0.5, "#ffd54f"); bg.addColorStop(1, "rgba(255,213,79,0)");
    ctx.fillStyle = bg; ctx.beginPath(); ctx.arc(px, py, 5 * k, 0, Math.PI * 2); ctx.fill();
  }
  // DAGESTAN in its own row, gently arched, one color per letter.
  var word = "DAGESTAN", cols = ["#ff5252", "#ffb300", "#ffee58", "#66bb6a", "#29b6f6", "#7e57c2", "#ec407a", "#ff7043"];
  var fs = 40 * k, face = "Impact, 'Arial Black', sans-serif";
  ctx.font = "900 " + fs + "px " + face;
  var widths = word.split("").map(function (c) { return ctx.measureText(c).width + fs * 0.06; });
  var total = widths.reduce(function (a, b) { return a + b; }, 0), maxW = bw * 0.82;
  if (total > maxW) { fs *= maxW / total; widths = widths.map(function (v) { return v * maxW / total; }); total = maxW; }
  var arcR = bw * 1.4, ax = cx, ay = by + bh * 0.22 + arcR, run = -total / 2;
  word.split("").forEach(function (c, j) {
    var mid = run + widths[j] / 2, ang = mid / arcR;
    run += widths[j];
    ctx.save();
    ctx.translate(ax + Math.sin(ang) * arcR, ay - Math.cos(ang) * arcR); ctx.rotate(ang);
    stillText(c, 0, 0, fs, cols[j], widths[j] * 1.2, { stroke: "#0b0f2e", strokeW: 0.22 });
    ctx.restore();
  });
  // WORLD below it, clear of the arch.
  ctx.save();
  ctx.translate(cx, by + bh * 0.62);
  stillText("WORLD", 3 * k, 4 * k, 78 * k, "#0b0f2e", bw * 0.8);
  stillText("WORLD", 0, 0, 78 * k, "#ffffff", bw * 0.8, { stroke: "#e3c26a", strokeW: 0.1 });
  ctx.restore();
  // Little stars either side of WORLD.
  [[-0.43, 0.6], [0.43, 0.6], [-0.38, 0.84], [0.38, 0.84]].forEach(function (s, j) { dwStar(cx + bw * s[0], by + bh * s[1], (j < 2 ? 7 : 5) * k); });
  stillText("THEME PARK  •  MAKHACHKALA", cx, by + bh * 0.86, 12 * k, "#e3c26a", bw * 0.7, { face: "'Helvetica Neue', Helvetica, Arial, sans-serif", weight: "800" });
  // The tagline ribbon across the bottom of the sign.
  var ry = by + bh + h * 0.11, rh = h * 0.13, rw = bw * 1.0;
  ctx.fillStyle = "#8e1a1a";
  [-1, 1].forEach(function (s) {
    ctx.beginPath(); ctx.moveTo(cx + s * rw * 0.44, ry - rh * 0.25); ctx.lineTo(cx + s * rw * 0.56, ry - rh * 0.25);
    ctx.lineTo(cx + s * rw * 0.51, ry + rh * 0.25); ctx.lineTo(cx + s * rw * 0.56, ry + rh * 0.75); ctx.lineTo(cx + s * rw * 0.44, ry + rh * 0.75); ctx.closePath(); ctx.fill();
  });
  var rg = ctx.createLinearGradient(0, ry - rh / 2, 0, ry + rh / 2);
  rg.addColorStop(0, "#ef5350"); rg.addColorStop(1, "#c62828");
  ctx.fillStyle = rg; ctx.fillRect(cx - rw / 2, ry - rh / 2, rw, rh);
  ctx.strokeStyle = "rgba(255,255,255,0.5)"; ctx.lineWidth = 1 * k; ctx.setLineDash([4 * k, 3 * k]);
  ctx.strokeRect(cx - rw / 2 + 4 * k, ry - rh / 2 + 3 * k, rw - 8 * k, rh - 6 * k); ctx.setLineDash([]);
  stillText("2-3 WEEK VACATION AND FORGET", cx, ry + k, 22 * k, "#ffffff", rw * 0.88, { stroke: "#7f1010", strokeW: 0.12 });
  stillText("OPEN ALL YEAR  •  SEND ME LOCATION", cx, y + h * 0.95, 12 * k, "#ffffff", bw, { face: "'Helvetica Neue', Helvetica, Arial, sans-serif", weight: "800", stroke: "#1b3d14", strokeW: 0.3 });
}
function dwStar(x, y, s) {
  ctx.fillStyle = "#ffd54f"; ctx.beginPath();
  for (var i = 0; i < 10; i++) { var a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? s * 0.45 : s; ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
  ctx.closePath(); ctx.fill();
}
