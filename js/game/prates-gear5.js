// Carlos Prates's Gear 5 (Joe, 2026-11-15): his special's transformation, in
// place of the gold Super Saiyan look. Turned on by `special.gear5` in
// characters/carlos-prates.json; everything else about The Cigarette (the
// light, the party, the misses, the numbers, the music) stays in prates.js.
//
//  - While he smokes, ONE smoke trail pours out of the tip of the cigarette:
//    a thin wisp at the tip that swells as it travels out past his shoulder,
//    up round behind his head, down his left side and under him, where it
//    thins out and breaks into little puffs that drift off and fade. The bumps
//    glide outward from the tip (each keeps its own size, nothing snaps back).
//  - Just before the party the ring tightens and covers him; then POOF, it
//    blows back out and he's in Gear 5: a short white curly cut with a white
//    Clark Kent curl (sitting on his head like his real hair, faded sides),
//    white shorts and gloves with purple trim, the clouds flowing round him
//    off the cigarette the whole party.
//  - When the party's over the smoke thins away and his own look comes back.
//
// Hooks (one line each): drawPratesBehind and drawPrates (prates.js) for the
// smoke and the hair, prStartParty for the "GEAR 5!" call and the white burst,
// draw.js for the white kit (prGear5Look), gloveColor (fighter-art.js) for
// the punching gloves (gloveColor, drawGlove).
"use strict";

var G5_KIT = { shorts: "#f4f2ec", trim: "#6e4f96", gloves: "#f0eee8" };
var G5_HAIR = { proud: 0.05, hl: 0.66, rows: 3, cs: 1 }; // Joe's pick: "2, a touch of height"
var g5Puff = null;

function prGear5On(b) { return !!(b && b.pr && b.char && b.char.special && b.char.special.gear5); }

function g5Ease(t) { return t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t); }

// Where the transformation is: pour (smoke coming off the tip, 0..1), close
// (wrapping over him), open (blowing back out after the poof), gone (thinning
// away at the end), on (Gear 5 look showing).
function g5State(b) {
  var sm = b.pr && b.pr.smoke, sp = b.char.special;
  if (!sm || !b.alive) return null;
  var S = sp.smoke || 2.2;
  if (sm.phase === "smoke") return { pour: g5Ease((sm.t - 0.15) / Math.max(0.6, S - 0.8)), close: g5Ease((sm.t - (S - 0.55)) / 0.5), open: 0, gone: 0, on: 0, poof: 0 };
  if (sm.phase === "party") return { pour: 1, close: 0, open: g5Ease(sm.t / 0.45), gone: 0, on: 1, poof: sm.t < 0.45 ? 1 - sm.t / 0.45 : 0 };
  if (sm.phase === "out") { var o = Math.min(1, sm.t / (sp.out || 0.7)); return { pour: 1, close: 0, open: 1, gone: o, on: 1 - o, poof: 0 }; }
  return null;
}

// The white kit for draw.js while he's in Gear 5 (null otherwise: his own look).
function prGear5Look(b) {
  if (!prGear5On(b)) return null;
  var st = g5State(b);
  if (!st || st.on <= 0) return null;
  if (!b.pr.g5Look || b.pr.g5Base !== b.char.look) { b.pr.g5Base = b.char.look; b.pr.g5Look = Object.assign({}, b.char.look, G5_KIT); }
  return b.pr.g5Look;
}
// The punching gloves (gloveColor, fighter-art.js).
function gear5GloveColor(ch) {
  if (typeof balls === "undefined" || !balls || !ch || !ch.special || !ch.special.gear5) return null;
  for (var i = 0; i < balls.length; i++) if (balls[i].char === ch && prGear5Look(balls[i])) return G5_KIT.gloves;
  return null;
}

// Any glove drawn from his own look (guard hands, punches: drawGlove, fighter-art.js).
function gear5LookGloves(look) {
  if (typeof balls === "undefined" || !balls || !look) return null;
  for (var i = 0; i < balls.length; i++) { var b = balls[i]; if (b.char && b.char.look === look && prGear5Look(b)) return G5_KIT.gloves; }
  return null;
}

// Local frame: his centre at 0,0, unsquashed (his lanky pose scales it).
function g5Frame(b) {
  var p = prPose(b);
  ctx.translate(b.x, b.y + p.bob);
  ctx.scale(p.wide, p.tall);
  return p;
}
function g5Tip(b, p) {
  var t = prCigTip(b);
  return [(t.x - b.x) / p.wide, (t.y - b.y - p.bob) / p.tall];
}

// From drawPratesBehind (prates.js): the smoke ring behind him.
function drawPratesGear5Behind(b) {
  var st = g5State(b);
  if (!st || st.close >= 0.5) return;
  ctx.save();
  var p = g5Frame(b);
  g5Smoke(b, p, st, false);
  ctx.restore();
}

// From drawPrates (prates.js), over him: the hair, the stretch of smoke
// leaving the tip, the ring wrapped over him, the poof.
function drawPratesGear5Front(b) {
  var st = g5State(b);
  if (!st) return;
  var r = b.r, ink = theme.wall || "#16211f";
  ctx.save();
  var p = g5Frame(b);
  if (st.on > 0) {
    ctx.save(); ctx.globalAlpha = Math.min(1, st.on * 1.5);
    g5Hair(ctx, r, G5_HAIR, ink);
    ctx.restore();
  }
  if (st.close >= 0.5) g5Smoke(b, p, st, false);
  else g5Smoke(b, p, st, true);
  if (st.poof > 0 && !reduceMotion) { // puffs bursting out round him
    var k = st.poof;
    for (var i = 0; i < 12; i++) {
      var a = i * 0.524 + 0.3, d = r * (1 + (1 - k) * 1.5), rr = r * (0.2 + 0.08 * (i % 3)) * k;
      g5Blobs(ctx, [[Math.cos(a) * d, Math.sin(a) * d, rr, 1]], ink, 0);
    }
    var g = ctx.createRadialGradient(0, 0, r * 0.6, 0, 0, r * 2.6);
    g.addColorStop(0, "rgba(255,255,255," + (0.8 * k) + ")"); g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, r * 2.6, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

// From prStartParty (prates.js): the call and a white burst instead of gold.
function prGear5Burst(b) {
  floater(b.x, b.y - b.r - 44, "GEAR 5!", "crit");
  for (var i = 0; i < 16; i++) {
    var a = Math.random() * Math.PI * 2, v = 140 + Math.random() * 200;
    particles.push({ x: b.x, y: b.y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 0.55, max: 0.55, size: 3 + Math.random() * 3, color: i % 2 ? "#ffffff" : "#d9dce2" });
  }
}

// ---------------------------------------------------------------- the smoke

function g5Bez(P, t) {
  var u = 1 - t;
  return [u * u * u * P[0][0] + 3 * u * u * t * P[1][0] + 3 * u * t * t * P[2][0] + t * t * t * P[3][0],
          u * u * u * P[0][1] + 3 * u * u * t * P[1][1] + 3 * u * t * t * P[2][1] + t * t * t * P[3][1]];
}

// One ribbon: tip -> out and up -> round behind his head -> down his left
// side -> under him. In his local frame, r = his radius.
function g5Smoke(b, p, st, front) {
  var r = b.r, ink = theme.wall || "#16211f", ft = prClock;
  var s = st.on > 0 ? 0.38 + 0.62 * st.open : 1 - st.close * 0.62; // how tight round him
  var thick = (1 + (1 - s) * 2.2) * (1 - st.gone), g = st.pour;
  if (g <= 0 || thick <= 0.02) return;
  var tip = g5Tip(b, p), tx = tip[0], ty = tip[1];
  var M = function (q) { return [q[0] * s, q[1] * s]; };
  var segs = [
    [[tx, ty], [tx + r * 0.3, ty - r * 0.05], M([r * 1.15, -r * 0.15]), M([r * 1.25, -r * 0.55])],
    [[r * 1.25, -r * 0.55], [r * 1.75, -r * 1.1], [r * 0.9, -r * 1.95], [r * 0.05, -r * 1.8]].map(M),
    [[r * 0.05, -r * 1.8], [-r * 0.95, -r * 1.95], [-r * 1.9, -r * 0.6], [-r * 1.15, r * 0.6]].map(M),
    [[-r * 1.15, r * 0.6], [-r * 0.7, r * 1.55], [r * 0.7, r * 1.6], [r * 1.25, r * 1.0]].map(M)
  ];
  var P = [], L = [0], i, d;
  segs.forEach(function (B, si) { for (var j = si ? 1 : 0; j <= 30; j++) { var q = g5Bez(B, j / 30); P.push([q[0], q[1], si]); } });
  for (i = 1; i < P.length; i++) L.push(L[i - 1] + Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]));
  var Lt = L[L.length - 1], Lg = Lt * g, L0 = L[30];
  var at = function (dd) {
    var k = 1; while (k < L.length - 1 && L[k] < dd) k++;
    var f = (dd - L[k - 1]) / ((L[k] - L[k - 1]) || 1), a = P[k - 1], c = P[k];
    var dx = c[0] - a[0], dy = c[1] - a[1], l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l, px = a[0] + dx * f, py = a[1] + dy * f;
    if (nx * px + ny * py < 0) { nx = -nx; ny = -ny; }
    return [px, py, nx, ny, a[2]];
  };
  var full = function (dd) { // thin at the tip, swelling, thinning to nothing at the far end
    var u = Math.min(1, dd / (L0 * 1.35)), sw = u * u * (3 - 2 * u);
    var wEnd = dd > Lt * 0.55 ? Math.pow(Math.max(0, (Lt * 0.82 - dd) / (Lt * 0.27)), 0.8) : 1;
    var seg = at(dd)[4];
    return (r * 0.05 + (r * (seg === 3 ? 0.3 : 0.42) - r * 0.05) * sw) * wEnd * thick;
  };
  var head = function (dd) { return Math.min(1, Math.max(0, (Lg - dd) / (r * 0.5))); };
  var blobs = [], step = Math.max(1.5, r * 0.04);
  for (d = 0; d <= Math.min(Lg, Lt * 0.82); d += step) {
    var w = full(d) * (0.4 + 0.6 * Math.sqrt(head(d))), q = at(d);
    if (w < 0.6) break;
    var wav = Math.sin(d / (r * 0.35) - ft * 2.6) * r * 0.06 * Math.max(0, 1 - d / (L0 * 1.2)); // the wisp sways
    blobs.push([q[0] + q[2] * wav, q[1] + q[3] * wav, w * 0.42 + 0.4, 0, d]);
  }
  // lobes gliding outward along it, each born small and growing in
  var sp = r * 0.3, v = r * 0.45, d0 = L0 * 0.55, n;
  for (n = Math.floor(-ft * v / sp) - 1; ; n++) {
    d = d0 + n * sp + ft * v;
    if (d > Lg) break;
    if (d < d0) continue;
    var born = Math.min(1, (d - d0) / (r * 0.5)), bs = born * born * (3 - 2 * born), w2 = full(d) * Math.sqrt(head(d)) * bs;
    if (w2 < 0.8) continue;
    var q2 = at(d), id = ((n % 1000) + 1000) % 1000, sd = id % 2 ? 1 : -0.55, rr = w2 * (0.42 + 0.22 * ((id * 7) % 3) / 2);
    blobs.push([q2[0] + q2[2] * w2 * 0.3 * sd, q2[1] + q2[3] * w2 * 0.3 * sd, rr, id % 4 === 1 && w2 > r * 0.12 ? 2 : 1, d]);
  }
  if (Lg > L0 * 0.6 && Lg < Lt * 0.74) { var qh = at(Lg); blobs.push([qh[0], qh[1], full(Lg) * 0.45, 2, Lg]); } // the rolling front
  ctx.save();
  if (front) { // the stretch leaving the tip that lies over his body
    blobs = blobs.filter(function (q) { return q[4] < L0 * 1.3 && Math.hypot(q[0], q[1]) < r * 1.3; });
    ctx.beginPath(); ctx.arc(0, 0, r * 0.99, 0, Math.PI * 2); ctx.clip();
  }
  g5Blobs(ctx, blobs, ink, 1);
  ctx.restore();
  // the far end breaks into little puffs that drift off and fade
  if (!front && Lg > Lt * 0.66 && !reduceMotion) {
    var D0 = Lt * 0.66, span = Lt - D0, sp2 = r * 0.3, v2 = r * 0.45, m;
    for (m = Math.floor(-ft * v2 / sp2) - 1; ; m++) {
      d = D0 + m * sp2 + ft * v2;
      if (d > Lt || d > Lg) break;
      if (d < D0) continue;
      var k2 = ((m % 1000) + 1000) % 1000, u2 = (d - D0) / span, q3 = at(d);
      var pr = r * 0.2 * thick * (1 - u2 * 0.6) * (0.85 + 0.3 * ((k2 * 5) % 3) / 2);
      var ox = q3[2] * u2 * r * 0.8 + Math.sin(k2 * 2.1) * u2 * r * 0.12, oy = q3[3] * u2 * r * 0.8 - u2 * r * 0.5;
      var al = Math.max(0, 1 - u2 * 1.15) * Math.min(1, u2 / 0.12) * Math.min(1, (Lg - d) / (r * 0.4));
      if (al > 0.02 && pr > 0.8) g5FadePuff(q3[0] + ox, q3[1] + oy, pr, al, ink);
    }
  }
}

// Puffs with one shared ink outline, white, a grey crescent under each, swirls.
function g5Blobs(c, blobs, ink, swirls) {
  c.fillStyle = ink;
  blobs.forEach(function (q) { c.beginPath(); c.arc(q[0], q[1], q[2] + Math.max(1.2, Math.min(2.4, q[2] * 0.18)), 0, Math.PI * 2); c.fill(); });
  c.fillStyle = "#ffffff";
  blobs.forEach(function (q) { c.beginPath(); c.arc(q[0], q[1], q[2], 0, Math.PI * 2); c.fill(); });
  c.strokeStyle = "#d3d7de"; c.lineCap = "round";
  blobs.forEach(function (q) { if (!q[3]) return; c.lineWidth = Math.max(1, q[2] * 0.18); c.beginPath(); c.arc(q[0], q[1], q[2] * 0.72, 0.3, 1.9); c.stroke(); });
  if (!swirls) return;
  c.strokeStyle = "#a9aeb8";
  blobs.forEach(function (q) {
    if (q[3] !== 2) return;
    var R = q[2] * 0.58; c.lineWidth = Math.max(1, q[2] * 0.1); c.beginPath();
    for (var t = 0; t <= 1; t += 0.05) { var a = t * Math.PI * 3 + 1, rr = R * (1 - t * 0.85), X = q[0] + Math.cos(a) * rr, Y = q[1] + Math.sin(a) * rr; if (t) c.lineTo(X, Y); else c.moveTo(X, Y); }
    c.stroke();
  });
}

// A fading puff: drawn on its own little canvas so the outline fades with it.
function g5FadePuff(x, y, rr, a, ink) {
  if (!g5Puff) { g5Puff = document.createElement("canvas"); g5Puff.cx = g5Puff.getContext("2d"); }
  var m = ctx.getTransform ? ctx.getTransform() : null, sc = m ? Math.max(1, Math.hypot(m.a, m.b)) : 2;
  var sz = Math.ceil((rr + 4) * 2), px = Math.ceil(sz * sc);
  if (g5Puff.width !== px) { g5Puff.width = px; g5Puff.height = px; }
  var c = g5Puff.cx;
  c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, px, px); c.setTransform(sc, 0, 0, sc, sz * sc / 2, sz * sc / 2);
  g5Blobs(c, [[0, 0, rr, 1]], ink, 0);
  ctx.save(); ctx.globalAlpha *= a; ctx.drawImage(g5Puff, x - sz / 2, y - sz / 2, sz, sz); ctx.restore();
}

// ---------------------------------------------------------------- the hair

// A short white curly cut sitting on his head like his real hair: the outline
// follows his head with small curl bumps, a lined-up hairline on the forehead,
// white with grey shading and drawn curls, white faded sides, the Clark Kent curl.
function g5Hair(c, r, o, ink) {
  var lw = Math.max(1.6, r * 0.032), G = "#9aa1ac", GL = "rgba(154,161,172,0.55)", i;
  c.save();
  // white fade on the sides
  c.save(); c.beginPath(); c.arc(0, 0, r * 0.985, 0, Math.PI * 2); c.clip();
  var side = function () {
    c.beginPath(); c.moveTo(-r, -r * 0.46); c.lineTo(-r * 0.84, -r * 0.5); c.quadraticCurveTo(-r * 0.74, -r * (o.hl - 0.04), -r * 0.6, -r * o.hl);
    c.lineTo(r * 0.6, -r * o.hl); c.quadraticCurveTo(r * 0.74, -r * (o.hl - 0.04), r * 0.84, -r * 0.5); c.lineTo(r, -r * 0.46); c.lineTo(r, -r); c.lineTo(-r, -r); c.closePath();
  };
  var fg = c.createLinearGradient(0, -r * 0.85, 0, -r * 0.48);
  fg.addColorStop(0, "rgba(244,245,248,1)"); fg.addColorStop(0.6, "rgba(244,245,248,0.55)"); fg.addColorStop(1, "rgba(244,245,248,0)");
  c.fillStyle = fg; side(); c.fill();
  var gr = artRand(91); c.fillStyle = "rgba(150,156,166,0.35)"; c.save(); side(); c.clip();
  for (i = 0; i < 140; i++) { var sx = (gr() < 0.5 ? -1 : 1) * r * (0.6 + gr() * 0.38), sy = -r * (0.5 + gr() * 0.3); c.fillRect(sx, sy, r * 0.012, r * 0.012); }
  c.restore(); c.restore();
  // the top
  var R = r * (1 + o.proud), xt = 0.7, th = Math.acos(xt * r / R), A0 = Math.PI + th, A1 = 2 * Math.PI - th, N = 16;
  var top = new Path2D();
  top.moveTo(-r * xt, -r * (o.hl + 0.02)); top.lineTo(Math.cos(A0) * R, Math.sin(A0) * R);
  for (i = 0; i < N; i++) {
    var a = A0 + (A1 - A0) * (i + 1) / N, am = A0 + (A1 - A0) * (i + 0.5) / N, bb = R * (1 + 0.035 * o.cs);
    top.quadraticCurveTo(Math.cos(am) * bb, Math.sin(am) * bb, Math.cos(a) * R, Math.sin(a) * R);
  }
  top.lineTo(r * xt, -r * (o.hl + 0.02));
  var H = 7;
  for (i = H - 1; i >= 0; i--) { var x1 = -r * xt + i * 2 * r * xt / H, xm = x1 + r * xt / H, dip = (i === 3 ? 0 : 0.045) * o.cs; top.quadraticCurveTo(xm, -r * (o.hl - dip), x1, -r * (o.hl + 0.02)); }
  top.closePath();
  // its shadow on the forehead
  c.save(); c.beginPath(); c.arc(0, 0, r * 0.985, 0, Math.PI * 2); c.clip(); c.translate(0, r * 0.03); c.fillStyle = "rgba(60,35,20,0.22)"; c.fill(top); c.restore();
  var tg = c.createLinearGradient(-r * 0.3, -R, r * 0.3, -r * o.hl);
  tg.addColorStop(0, "#ffffff"); tg.addColorStop(0.7, "#f1f2f5"); tg.addColorStop(1, "#dcdfe5");
  c.fillStyle = tg; c.fill(top);
  c.save(); c.clip(top); c.lineCap = "round";
  c.strokeStyle = "rgba(154,161,172,0.3)"; c.lineWidth = r * 0.07;
  c.beginPath(); c.moveTo(-r * 0.75, -r * (o.hl - 0.01)); c.quadraticCurveTo(0, -r * (o.hl + 0.08), r * 0.75, -r * (o.hl - 0.01)); c.stroke();
  c.strokeStyle = "rgba(255,255,255,0.9)"; c.lineWidth = r * 0.05;
  c.beginPath(); c.moveTo(-r * 0.45, -R * 0.93); c.quadraticCurveTo(-r * 0.1, -R * 0.99, r * 0.2, -R * 0.95); c.stroke();
  for (var ri = 0; ri < o.rows; ri++) {
    var yy = -r * (o.hl + 0.07) - ri * (R - r * (o.hl + 0.07)) / o.rows, w = Math.sqrt(Math.max(0, R * R - yy * yy)) * 0.9;
    var n = Math.max(3, Math.round(w * 2 / (r * 0.17 * o.cs)));
    for (i = 0; i < n; i++) {
      var xx = -w + (i + 0.5) * 2 * w / n + (ri % 2) * r * 0.04, cr = r * 0.055 * o.cs, d = (i + ri) % 2 ? 1 : -1;
      c.strokeStyle = G; c.lineWidth = Math.max(1, r * 0.016);
      c.beginPath(); c.arc(xx, yy, cr, d > 0 ? 0.2 : Math.PI - 3.2, d > 0 ? 3.4 : Math.PI - 0.2, d < 0); c.stroke();
      c.strokeStyle = GL; c.lineWidth = Math.max(0.8, r * 0.011);
      c.beginPath(); c.arc(xx + d * cr * 0.25, yy + cr * 0.15, cr * 0.45, d > 0 ? 3.2 : -0.1, d > 0 ? 6.0 : 2.7); c.stroke();
    }
  }
  c.restore();
  c.strokeStyle = ink; c.lineWidth = lw; c.lineJoin = "round"; c.stroke(top);
  // the white Clark Kent curl dropping out of the front of the hairline
  var s2 = r * 0.11, lx = -r * 0.06, ly = -r * (o.hl - 0.01);
  c.beginPath(); c.moveTo(lx - s2 * 0.4, ly);
  c.bezierCurveTo(lx - s2 * 0.9, ly + s2 * 0.8, lx + s2 * 0.3, ly + s2 * 1.3, lx + s2 * 0.7, ly + s2 * 0.9);
  c.bezierCurveTo(lx + s2 * 1.0, ly + s2 * 0.5, lx + s2 * 0.6, ly + s2 * 0.15, lx + s2 * 0.25, ly + s2 * 0.45);
  c.bezierCurveTo(lx + s2 * 0.5, ly + s2 * 0.6, lx + s2 * 0.2, ly + s2 * 0.8, lx, ly + s2 * 0.55);
  c.bezierCurveTo(lx - s2 * 0.2, ly + s2 * 0.3, lx + s2 * 0.1, ly + s2 * 0.05, lx + s2 * 0.4, ly - s2 * 0.05);
  c.closePath();
  c.lineWidth = Math.max(1.3, r * 0.026); c.strokeStyle = ink; c.stroke(); c.fillStyle = "#fff"; c.fill();
  c.restore();
}
