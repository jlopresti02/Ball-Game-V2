// Conor McGregor's Pot o' Gold (Joe, 2026-11-13): his own Kamehameha. Once
// a match, at a random time, a pot of gold (Joe's picture, rainbow-art.js)
// bursts up out of the mat in front of him with a spray of coins, shoving
// the opponent back. He plants and grabs it by both handles with his own two
// gloves; it glows, coins hop out of it and a little rainbow starts rising
// off the gold while he calls out "LUCK... O'... THE... IRISH...". A
// rainbow-edged path shows where it'll go: it tracks them until a second
// before, then locks. Then he tips the pot over at them and a huge rainbow
// beam pours out of it to the cage, full of coins. Whoever's in it takes
// potOfGold.damage and is driven into the cage (wall slams). The pot rights
// itself and sinks back into the mat.
// Nothing can hit him while he does it (an igbb move: specialGuarding).
// Against Charles, whoever fires first gets the other charging too, and the
// two beams meet in a beam clash (beam-clash.js).
// Runs on b.igbb (move "rainbow"). Config: char.potOfGold.
"use strict";

var RB_LOCK = 1.0;    // tracks them until a second before it fires (like the Kamehameha)
var RB_SUMMON = 0.9;  // the pot coming up out of the mat
var RB_END = 0.55;    // the pot righting itself and sinking back down
var RB_TIP = 0.16;    // tipping it over
var RB_SPEED = 2400;  // how fast the beam pours out
var RB_CALLS = ["LUCK...", "O'...", "THE...", "IRISH..."];
var RB_COLORS = ["#ff2a2a", "#ff8a00", "#ffe100", "#2fd12f", "#1e9bff", "#4b3cff", "#a63cff"];

var rbCoins = [];      // coins flying about (spilled, sprayed, splashed off the cage)
var potImg = null;

function rainbowOn(b) { return !!(b && b.igbb && b.igbb.move === "rainbow"); }
function rbRand(r) { return r[0] + Math.random() * (r[1] - r[0]); }
function rbEase(k) { k = Math.max(0, Math.min(1, k)); return k * k * (3 - 2 * k); }

function initRainbow(b) {
  var cfg = b.char.potOfGold;
  b.rbN = 0;
  b.rbT = cfg ? rbRand(cfg.first) : Infinity;
}
function resetRainbow() { rbCoins = []; }

// Can he start it right now (for the beam clash, started by the other one's beam)?
function rainbowReady(b) {
  return !!(b.char.potOfGold && b.alive && !b.igbb && (b.rbN || 0) < 1 && !specialBusy(b));
}

// From the abilities loop, before the special. True while it's running.
function updateRainbow(self, other, dt) {
  var cfg = self.char.potOfGold;
  if (!cfg) return false;
  if (!self.igbb) {
    if (!started || over || self.rbN >= 1) return false;
    self.rbT -= dt;
    if (self.rbT > 0 || !canStartIgbb(self, other) || swordDuelActive()) return false;
    startRainbow(self, other, false);
    bcPair(self, other); // Charles answers with his Kamehameha (beam-clash.js)
  }
  var m = self.igbb;
  if (m.move !== "rainbow") return false;
  m.t += dt; m.callT = (m.callT || 0) + dt;
  self.vx = 0; self.vy = 0;
  if (over) { endRainbow(self); return false; }

  if (m.phase === "summon") {
    if (other.alive) rbAim(self, other);
    if (m.pair) bcSlide(self, other, dt);
    if (m.t >= RB_SUMMON) { m.phase = "charge"; m.t = 0; playRainbowCharge(m.charge); }
    return true;
  }
  if (m.phase === "charge") {
    if ((m.t < m.charge - RB_LOCK || m.pair) && other.alive) rbAim(self, other);
    var call = Math.floor(m.t / (m.charge / (RB_CALLS.length + 0.4)));
    if (call >= m.calls && m.calls < RB_CALLS.length) {
      m.calls++; m.callT = 0; m.pulse = 1;
      if (!reduceMotion) shake = Math.max(shake, 3 + m.calls * 1.5);
      rbSpill(self, m, 3 + m.calls);
    }
    m.pulse = Math.max(0, (m.pulse || 0) - dt * 3);
    var ck = m.t / m.charge;
    if (!reduceMotion) shake = Math.max(shake, 1 + 3 * ck);
    if (Math.random() < 0.18 + 0.4 * ck) rbSpill(self, m, 1);
    if (m.t >= m.charge) { rainbowFire(self); bcFire(self, other); }
    return true;
  }
  if (m.phase === "fire") {
    if (bcHolds(self)) return true; // locked in a beam clash (beam-clash.js)
    m.len = kmRayToWall(self.x, self.y, m.dx, m.dy);
    m.ext = Math.min(m.len, (m.ext0 || 0) + m.t * RB_SPEED);
    if (!reduceMotion) shake = Math.max(shake, 6);
    rbBeamFx(self, m, cfg);
    if (!m.hit && other.alive) {
      var ox = other.x - self.x, oy = other.y - self.y;
      var along = ox * m.dx + oy * m.dy, across = Math.abs(-m.dy * ox + m.dx * oy);
      if (along > 0 && along < m.ext + other.r && across < cfg.width / 2 + other.r * 0.85) {
        m.hit = true;
        var dealt = hurtProjectile(other, cfg.damage, self.id, m.dx, m.dy);
        if (dealt > 0) rbLand(self, other, m, cfg);
      }
    }
    if (m.t >= cfg.beamTime) {
      m.phase = "end"; m.t = 0;
      if (!m.hit && other.alive) floater(other.x, other.y - other.r - 30, "MISSED!", "dodge");
    }
    return true;
  }
  if (m.t >= RB_END) { endRainbow(self); return false; }
  return true;
}

// charge: how long he charges (the beam clash lines both beams up with it).
function startRainbow(self, other, paired, charge) {
  var cfg = self.char.potOfGold;
  clearActions(self);
  self.rbN = (self.rbN || 0) + 1;
  self.igbb = { move: "rainbow", phase: "summon", t: 0, calls: 0, hit: false, charge: charge || cfg.charge, pair: !!paired };
  rbAim(self, other);
  // The pot bursts up out of the mat with a spray of coins and a gold flash.
  var p = rbPotPose(self);
  for (var i = 0; i < 26; i++) {
    var a = -Math.PI / 2 + (Math.random() - 0.5) * 2.6, v = 220 + Math.random() * 380;
    rbCoins.push({ x: p.x, y: p.y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, rot: Math.random() * 6, spin: 8 + Math.random() * 14, life: 1.1, max: 1.1, size: 5 + Math.random() * 3, g: 900 });
  }
  impacts.push({ x: p.x, y: p.y, nx: 0, ny: -1, life: 0.5, max: 0.5, color: "#ffd84a" });
  if (!paired) kmPushAway(self, other); // shoves them back, so the beam has room
  if (!reduceMotion) shake = Math.max(shake, 10);
  crowdReact(0.5);
  playRainbowSummon();
}

// The tip: the pot goes over and the rainbow pours out of it.
function rainbowFire(self) {
  var m = self.igbb;
  if (!rainbowOn(self) || m.phase === "fire") return;
  m.phase = "fire"; m.t = 0; m.callT = 0;
  m.len = kmRayToWall(self.x, self.y, m.dx, m.dy);
  m.ext = 0;
  self.squash = { t: 0.2, max: 0.2, nx: -m.dx, ny: -m.dy };
  if (!reduceMotion) { shake = Math.max(shake, 18); hitStop = Math.max(hitStop, 0.06); }
  duelFlash = Math.max(duelFlash, 0.9);
  var o = rbOrigin(self);
  impacts.push({ x: self.x + m.dx * o, y: self.y + m.dy * o, nx: m.dx, ny: m.dy, life: 0.5, max: 0.5, color: "#fff1a8" });
  rbSpill(self, m, 20, 1);
  crowdReact(0.9);
  playRainbowBlast(self.char.potOfGold.beamTime);
}

// Landing on them (straight, or after winning a beam clash).
function rbLand(self, other, m, cfg, label) {
  floater(other.x, other.y - other.r - 30, label || "POT O' GOLD!", "crit");
  if (!reduceMotion) { shake = Math.max(shake, 22); hitStop = Math.max(hitStop, 0.08); }
  impacts.push({ x: other.x, y: other.y, nx: m.dx, ny: m.dy, life: 0.6, max: 0.6, color: "#ffd84a" });
  impacts.push({ x: other.x, y: other.y, nx: -m.dx, ny: -m.dy, life: 0.6, max: 0.6, color: "#ffffff" });
  for (var i = 0; i < 24; i++) {
    var a = Math.random() * Math.PI * 2, v = 160 + Math.random() * 360;
    if (i % 2) rbCoins.push({ x: other.x, y: other.y, vx: Math.cos(a) * v + m.dx * 200, vy: Math.sin(a) * v + m.dy * 200, rot: Math.random() * 6, spin: 10 + Math.random() * 12, life: 0.8, max: 0.8, size: 5 + Math.random() * 3, g: 500 });
    else if (!reduceMotion) particles.push({ x: other.x, y: other.y, vx: Math.cos(a) * v + m.dx * 200, vy: Math.sin(a) * v + m.dy * 200, life: 0.6, max: 0.6, size: 3 + Math.random() * 4, color: RB_COLORS[i % 7] });
  }
  if (other.alive) beginWallSlam(other, m.dx, m.dy, { knockback: cfg.knockback, wallSlams: cfg.wallSlams, slamDamage: cfg.slamDamage });
  checkEnd();
}

// Sparkles off the sides of the beam, coins riding it, and the cage taking it.
function rbBeamFx(self, m, cfg) {
  if (reduceMotion || m.ext < self.r * 2) return;
  var o = rbOrigin(self);
  var along0 = o + Math.random() * Math.max(1, m.ext - o), sd = Math.random() < 0.5 ? -1 : 1;
  var bx = self.x + m.dx * along0 - m.dy * sd * cfg.width * 0.5, by = self.y + m.dy * along0 + m.dx * sd * cfg.width * 0.5;
  particles.push({ x: bx, y: by, vx: -m.dy * sd * 150 + m.dx * 120, vy: m.dx * sd * 150 + m.dy * 120, life: 0.4, max: 0.4, size: 2 + Math.random() * 2.5, color: RB_COLORS[Math.floor(Math.random() * 7)] });
  if (Math.random() < 0.7) {
    var ac = (Math.random() - 0.5) * cfg.width * 0.6;
    rbCoins.push({ x: self.x + m.dx * o - m.dy * ac, y: self.y + m.dy * o + m.dx * ac, vx: m.dx * (900 + Math.random() * 500), vy: m.dy * (900 + Math.random() * 500),
      rot: Math.random() * 6, spin: 12 + Math.random() * 10, life: Math.min(0.6, m.ext / 1200), max: 0.6, size: 5 + Math.random() * 3, g: 0, ride: true });
  }
  if (m.ext >= m.len - 1 && Math.random() < 0.6) {
    var ex = self.x + m.dx * m.len, ey = self.y + m.dy * m.len, ea = Math.atan2(-m.dy, -m.dx) + (Math.random() - 0.5) * 2.4, ev = 200 + Math.random() * 260;
    rbCoins.push({ x: ex, y: ey, vx: Math.cos(ea) * ev, vy: Math.sin(ea) * ev, rot: 0, spin: 14, life: 0.6, max: 0.6, size: 5, g: 700 });
  }
}

// Coins hopping out of the pot (or pouring out, tipped).
function rbSpill(self, m, n, pour) {
  var p = rbPotPose(self), mx = p.x + Math.sin(p.ang) * p.ph * 0.36, my = p.y - Math.cos(p.ang) * p.ph * 0.36;
  for (var i = 0; i < n; i++) {
    var a = pour ? Math.atan2(m.dy, m.dx) + (Math.random() - 0.5) * 1.2 : -Math.PI / 2 + (Math.random() - 0.5) * 1.3;
    var v = pour ? 300 + Math.random() * 400 : 90 + Math.random() * 160;
    rbCoins.push({ x: mx, y: my, vx: Math.cos(a) * v, vy: Math.sin(a) * v, rot: Math.random() * 6, spin: 8 + Math.random() * 10, life: pour ? 0.9 : 0.55, max: pour ? 0.9 : 0.55, size: 4 + Math.random() * 3, g: pour ? 600 : 700 });
  }
}

function rbAim(self, other) {
  var dx = other.x - self.x, dy = other.y - self.y, d = Math.sqrt(dx * dx + dy * dy) || 1;
  self.igbb.dx = dx / d; self.igbb.dy = dy / d;
}

function endRainbow(self) {
  self.igbb = null;
  setSpeed(self, SPEED);
}

// From update(): the coins.
function tickRainbow(dt) {
  rbCoins = rbCoins.filter(function (c) {
    c.t = (c.t || 0) + dt; c.life -= dt;
    c.x += c.vx * dt; c.y += c.vy * dt; c.vy += (c.g || 0) * dt; c.rot += c.spin * dt;
    if (!c.ride) { c.vx *= 1 - dt * 1.2; }
    return c.life > 0;
  });
}

// ---------------------------------------------------------------- the pot
function rbPotSize(b) { var pw = b.r * 1.8; return { pw: pw, ph: pw * POT_OF_GOLD_ASPECT }; }
// How far in front of him the pot sits, and where the beam leaves its mouth.
function rbPotDist(b) { return b.r + rbPotSize(b).pw * 0.4; }
function rbOrigin(b) { return rbPotDist(b) + rbPotSize(b).ph * 0.4; }

// Where the pot is, its tilt and how far out of the mat it's come.
function rbPotPose(b) {
  var m = b.igbb, s = rbPotSize(b), d = rbPotDist(b), dx = m.dx || 1, dy = m.dy || 0;
  var tip = Math.atan2(dx, -dy); // turns the pot's mouth to face them
  var ang = 0, rise = 1, t = performance.now() / 1000;
  if (m.phase === "summon") rise = rbEase(m.t / (RB_SUMMON * 0.55));
  else if (m.phase === "charge") {
    var ck = m.t / m.charge;
    ang = tip * 0.12 * ck + (reduceMotion ? 0 : Math.sin(t * 30) * 0.03 * ck) + 0.08 * (m.pulse || 0) * Math.sin(t * 40);
  } else if (m.phase === "fire") ang = tip * (0.12 + 0.88 * rbEase(m.t / RB_TIP));
  else { var e = rbEase(m.t / RB_END); ang = tip * (1 - Math.min(1, e * 1.6)); rise = 1 - rbEase((m.t - RB_END * 0.45) / (RB_END * 0.55)); }
  return { x: b.x + dx * d, y: b.y + dy * d, ang: ang, rise: rise, pw: s.pw, ph: s.ph };
}

function rbDrawPot(b) {
  var m = b.igbb, p = rbPotPose(b), t = performance.now() / 1000;
  if (!potImg && typeof POT_OF_GOLD_SRC !== "undefined") { potImg = new Image(); potImg.src = POT_OF_GOLD_SRC; }
  ctx.save();
  ctx.translate(p.x, p.y + p.ph * 0.5);
  ctx.scale(1, Math.max(0.01, p.rise));
  ctx.translate(0, -p.ph * 0.5);
  ctx.rotate(p.ang);
  // Glowing gold as it charges.
  var glow = m.phase === "charge" ? 0.35 + 0.65 * (m.t / m.charge) + 0.4 * (m.pulse || 0) : m.phase === "fire" ? 1 : m.phase === "summon" ? 0.6 * p.rise : 0;
  if (glow > 0) {
    var g = ctx.createRadialGradient(0, -p.ph * 0.36, 0, 0, -p.ph * 0.36, p.pw * (0.8 + 0.5 * glow));
    g.addColorStop(0, "rgba(255,240,150," + (0.85 * Math.min(1, glow)) + ")"); g.addColorStop(1, "rgba(255,200,40,0)");
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, -p.ph * 0.36, p.pw * (0.8 + 0.5 * glow), 0, Math.PI * 2); ctx.fill();
  }
  if (potImg && potImg.complete && potImg.naturalWidth) ctx.drawImage(potImg, -p.pw / 2, -p.ph / 2, p.pw, p.ph);
  else {
    ctx.fillStyle = "#2a1d10"; ctx.beginPath(); ctx.ellipse(0, 0, p.pw * 0.45, p.ph * 0.48, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#f2c230"; ctx.beginPath(); ctx.ellipse(0, -p.ph * 0.36, p.pw * 0.38, p.ph * 0.1, 0, 0, Math.PI * 2); ctx.fill();
  }
  // A little rainbow growing up out of the gold as he charges.
  if (m.phase === "charge") {
    var ck = m.t / m.charge, ah = p.ph * (0.25 + 1.0 * ck) * (1 + 0.15 * (m.pulse || 0)), aw = p.pw * 0.34;
    ctx.save();
    ctx.globalAlpha = 0.5 + 0.4 * ck;
    ctx.lineCap = "round";
    for (var i = 0; i < 7; i++) {
      ctx.strokeStyle = RB_COLORS[i]; ctx.lineWidth = 2.2 + 2 * ck;
      var w = aw * (1 - i * 0.1);
      ctx.beginPath(); ctx.ellipse(0, -p.ph * 0.36, w, ah * (1 - i * 0.07), 0, Math.PI, Math.PI * 2); ctx.stroke();
    }
    // Sparkles over the coins.
    ctx.globalAlpha = 1;
    for (var s = 0; s < 5; s++) {
      var ph = (t * 1.7 + s * 0.23) % 1, sx = Math.sin(s * 2.3 + t) * p.pw * 0.3, sy = -p.ph * 0.4 - ph * p.ph * 0.6;
      rbStar(sx, sy, 3 + 4 * Math.sin(ph * Math.PI), "rgba(255,250,210," + Math.sin(ph * Math.PI) + ")");
    }
    ctx.restore();
  }
  ctx.restore();
  return p;
}

function rbStar(x, y, s, col) {
  ctx.fillStyle = col;
  ctx.beginPath();
  ctx.moveTo(x, y - s); ctx.lineTo(x + s * 0.25, y - s * 0.25); ctx.lineTo(x + s, y); ctx.lineTo(x + s * 0.25, y + s * 0.25);
  ctx.lineTo(x, y + s); ctx.lineTo(x - s * 0.25, y + s * 0.25); ctx.lineTo(x - s, y); ctx.lineTo(x - s * 0.25, y - s * 0.25);
  ctx.closePath(); ctx.fill();
}

// His own two arms, from the shoulders to the pot's handles, gloves on them.
function rbDrawArms(b, p, which) {
  var r = b.r, size = b.char.punch.size || 15;
  var c = Math.cos(p.ang), s = Math.sin(p.ang), sy = Math.max(0.01, p.rise);
  var hs = [-1, 1].map(function (side) {
    var lx = side * p.pw * 0.47, ly = -p.ph * 0.2;
    var x = lx * c - ly * s, y = lx * s + ly * c;
    return [p.x + x, p.y + p.ph * 0.5 + (y - p.ph * 0.5) * sy]; // (rising out of the mat, the handles come up with it)
  });
  var shL = [b.x - r * 0.72, b.y - r * 0.05], shR = [b.x + r * 0.72, b.y - r * 0.05];
  var d = function (a, q) { return Math.hypot(a[0] - q[0], a[1] - q[1]); };
  var pairs = d(shL, hs[0]) + d(shR, hs[1]) <= d(shL, hs[1]) + d(shR, hs[0]) ? [[shL, hs[0]], [shR, hs[1]]] : [[shL, hs[1]], [shR, hs[0]]];
  if (which !== "gloves") pairs.forEach(function (pr) {
    var sh = pr[0], h = pr[1];
    // A slight bend at the elbow, out away from his body.
    var mx = (sh[0] + h[0]) / 2, my = (sh[1] + h[1]) / 2, ox = mx - b.x, oy = my - b.y, ol = Math.hypot(ox, oy) || 1;
    var ex = mx + ox / ol * r * 0.12, ey = my + oy / ol * r * 0.12;
    strokeLimb(size * 0.75, armColor(b.char), function () { ctx.moveTo(sh[0], sh[1]); ctx.quadraticCurveTo(ex, ey, h[0], h[1]); });
  });
  if (which !== "limbs") pairs.forEach(function (pr) {
    var sh = pr[0], h = pr[1];
    drawGloveAt(h[0], h[1], size * 0.9, b.char, Math.atan2(h[1] - sh[1], h[0] - sh[0]));
  });
}

// From draw.js, with the fighter: the pot and his arms while he summons and
// charges (once it's tipped they're drawn over the beam, in drawRainbowBeam).
function drawRainbowPot(b) {
  if (!rainbowOn(b) || !b.alive) return;
  var m = b.igbb;
  if (m.phase !== "summon" && m.phase !== "charge") return;
  rbDrawPotAndArms(b, m.phase === "charge" || m.t > RB_SUMMON * 0.4);
}

// His arms reach to the handles, the pot goes over his arms, and his gloves
// grip the handles on top.
function rbDrawPotAndArms(b, arms) {
  var p = rbPotPose(b);
  if (arms) rbDrawArms(b, p, "limbs");
  rbDrawPot(b);
  if (arms) rbDrawArms(b, p, "gloves");
}

// From draw.js: a little lean in toward the pot, and a tremble as it charges.
function rainbowOffset(b) {
  if (!rainbowOn(b) || !b.alive) return { x: 0, y: 0 };
  var m = b.igbb, r = b.r, t = performance.now() / 1000;
  var ck = m.phase === "charge" ? m.t / m.charge : m.phase === "fire" ? 1 : 0;
  var lean = m.phase === "summon" ? rbEase(m.t / RB_SUMMON) * 0.08 : m.phase === "charge" ? 0.08 : m.phase === "fire" ? 0.08 + 0.1 * rbEase(m.t / RB_TIP) : 0.18 * (1 - rbEase(m.t / RB_END));
  var trem = reduceMotion || m.phase !== "charge" ? 0 : r * 0.03 * ck;
  return { x: (m.dx || 0) * lean * r + Math.sin(t * 61) * trem, y: (m.dy || 0) * lean * r + Math.cos(t * 53) * trem };
}

// ---------------------------------------------------------------- the beam
// The aim path, the beam, the tipped pot over it, the coins and the call.
function drawRainbowBeam() {
  balls.forEach(function (b) {
    if (!rainbowOn(b) || !b.alive) return;
    var m = b.igbb, cfg = b.char.potOfGold, t = performance.now() / 1000;
    var ang = Math.atan2(m.dy, m.dx), x0 = rbOrigin(b);
    ctx.save();
    ctx.beginPath(); ctx.rect(0, 0, W, H); ctx.clip();
    ctx.translate(b.x, b.y); ctx.rotate(ang);
    if (m.phase === "summon" || m.phase === "charge") {
      var len0 = kmRayToWall(b.x, b.y, m.dx, m.dy), wdt = cfg.width;
      var locked = m.phase === "charge" && !m.pair && m.t >= m.charge - RB_LOCK;
      var show = m.phase === "summon" ? Math.min(1, m.t / 0.3) : 1;
      var pulse = locked ? 0.6 + 0.4 * Math.sin(t * 30) : 0.75 + 0.25 * Math.sin(t * 10);
      ctx.globalAlpha = show;
      ctx.fillStyle = "rgba(255,220,80," + ((locked ? 0.26 : 0.13) * pulse) + ")";
      ctx.fillRect(x0, -wdt / 2, len0 - x0, wdt);
      ctx.lineWidth = locked ? 4 : 3; ctx.setLineDash([14, 10]);
      ctx.lineDashOffset = -t * 60;
      ctx.strokeStyle = "rgba(255,60,60," + (0.9 * pulse) + ")";
      ctx.beginPath(); ctx.moveTo(x0, -wdt / 2); ctx.lineTo(len0, -wdt / 2); ctx.stroke();
      ctx.strokeStyle = "rgba(150,70,255," + (0.9 * pulse) + ")";
      ctx.beginPath(); ctx.moveTo(x0, wdt / 2); ctx.lineTo(len0, wdt / 2); ctx.stroke();
      ctx.setLineDash([]);
      // Chevrons in the colours of the rainbow, marching toward them.
      var o = (t * (locked ? 420 : 220)) % 46, k = 0;
      for (var xx = x0 + o; xx < len0 - 10; xx += 46, k++) {
        ctx.fillStyle = RB_COLORS[k % 7]; ctx.globalAlpha = show * 0.8 * pulse;
        ctx.beginPath(); ctx.moveTo(xx, -wdt * 0.28); ctx.lineTo(xx + 14, 0); ctx.lineTo(xx, wdt * 0.28); ctx.lineTo(xx + 6, 0); ctx.closePath(); ctx.fill();
      }
      ctx.globalAlpha = 1;
    } else if (m.phase === "fire" || (m.phase === "end" && m.t < 0.25)) {
      var fade = m.phase === "end" ? 1 - m.t / 0.25 : Math.min(1, m.t / 0.06);
      var len = m.phase === "fire" ? m.ext : m.len;
      if (len > x0) rbDrawBand(x0, len, cfg.width * fade * (1 + 0.06 * Math.sin(t * 50)), t, m.phase === "fire" && m.ext < m.len - 1, m.phase === "fire" && m.ext >= m.len - 1);
    }
    ctx.restore();
    // The tipped pot and his arms, over the beam pouring out of it.
    if (m.phase === "fire" || m.phase === "end") {
      rbDrawPotAndArms(b, true);
    }
    drawRainbowCaption(b);
  });
  rbDrawCoins();
}

// The rainbow itself, in the beam's own frame (along +x from x0 to len).
function rbDrawBand(x0, len, w, t, head, splash) {
  var wave = function (x, s) { return 1 + 0.06 * Math.sin(x * 0.07 + s * t * 40); };
  // A soft white-gold glow round it.
  ctx.fillStyle = "rgba(255,245,200,0.35)";
  ctx.beginPath(); ctx.moveTo(x0, -w * 0.75);
  for (var x = x0; x <= len; x += 12) ctx.lineTo(x, -w * 0.95 * wave(x, 1));
  ctx.arc(len, 0, w * 0.95, -Math.PI / 2, Math.PI / 2);
  for (var x2 = len; x2 >= x0; x2 -= 12) ctx.lineTo(x2, w * 0.95 * wave(x2, -1));
  ctx.closePath(); ctx.fill();
  // Seven bands, red on one edge, violet on the other.
  var bw = w / 7;
  for (var i = 0; i < 7; i++) {
    var top = -w / 2 + i * bw, bot = top + bw + 0.8;
    ctx.fillStyle = RB_COLORS[i];
    ctx.beginPath();
    ctx.moveTo(x0, top * 0.7);
    for (var xa = x0; xa <= len; xa += 12) ctx.lineTo(xa, top * wave(xa, 1));
    for (var xb = len; xb >= x0; xb -= 12) ctx.lineTo(xb, bot * wave(xb, 1));
    ctx.lineTo(x0, bot * 0.7);
    ctx.closePath(); ctx.fill();
  }
  // A bright shine down the middle, and light streaks racing along it.
  ctx.fillStyle = "rgba(255,255,255,0.45)";
  ctx.fillRect(x0, -w * 0.08, len - x0, w * 0.16);
  ctx.strokeStyle = "rgba(255,255,255,0.8)"; ctx.lineWidth = 2;
  for (var sx = x0 + ((t * 900) % 70); sx < len - 20; sx += 70) {
    ctx.beginPath(); ctx.moveTo(sx, -w * 0.3); ctx.lineTo(sx + 26, -w * 0.3); ctx.moveTo(sx + 30, w * 0.22); ctx.lineTo(sx + 50, w * 0.22); ctx.stroke();
  }
  // Rounded rainbow end where it leaves the pot.
  ctx.save(); ctx.globalAlpha = 0.9;
  for (var j = 0; j < 7; j++) { ctx.fillStyle = RB_COLORS[j]; ctx.beginPath(); ctx.arc(x0, 0, w * 0.55 * (1 - j * 0.11), 0, Math.PI * 2); ctx.fill(); }
  ctx.fillStyle = "rgba(255,250,220,0.95)"; ctx.beginPath(); ctx.arc(x0, 0, w * 0.18, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  // The head while it's still pouring across.
  if (head) {
    var hg = ctx.createRadialGradient(len, 0, 0, len, 0, w * 1.3);
    hg.addColorStop(0, "rgba(255,255,255,1)"); hg.addColorStop(0.4, "rgba(255,236,140,0.9)"); hg.addColorStop(1, "rgba(255,200,60,0)");
    ctx.fillStyle = hg; ctx.beginPath(); ctx.arc(len, 0, w * 1.3, 0, Math.PI * 2); ctx.fill();
    for (var s = 0; s < 4; s++) rbStar(len + Math.cos(t * 9 + s * 1.6) * w * 0.6, Math.sin(t * 9 + s * 1.6) * w * 0.6, 7, "rgba(255,255,255,0.95)");
  }
  // Splash against the cage.
  if (splash) {
    for (var k = 0; k < 7; k++) {
      var a = (k / 7) * Math.PI + Math.PI / 2 + Math.sin(t * 20 + k) * 0.2;
      ctx.fillStyle = RB_COLORS[k]; ctx.globalAlpha = 0.75;
      ctx.beginPath(); ctx.arc(len + Math.cos(a) * w * 0.6, Math.sin(a) * w * 0.9, w * 0.2, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
}

function rbDrawCoins() {
  rbCoins.forEach(function (c) {
    var a = Math.min(1, c.life / Math.min(c.max, 0.25));
    ctx.save();
    ctx.globalAlpha = a;
    ctx.translate(c.x, c.y);
    var sx = Math.abs(Math.cos(c.rot)) * 0.85 + 0.15;
    ctx.scale(sx, 1);
    ctx.fillStyle = "#f6c531"; ctx.strokeStyle = "#8a5a00"; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.arc(0, 0, c.size, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#fff0a0"; ctx.beginPath(); ctx.arc(-c.size * 0.3, -c.size * 0.3, c.size * 0.35, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  });
}

// The call, word by word, on the far side of the ring from him (like the Kamehameha's).
function drawRainbowCaption(b) {
  var m = b.igbb, words, last;
  if (bcCaptionTaken()) return; // the beam clash has its own (beam-clash.js)
  if (m.phase === "summon") { words = ["POT O' GOLD!"]; last = true; }
  else if (m.phase === "charge") { words = RB_CALLS.slice(0, m.calls); last = false; }
  else if (m.phase === "fire" || (m.phase === "end" && m.t < 0.3)) { words = RB_CALLS.concat(["RAINBOW!!!"]); last = true; }
  else return;
  if (!words.length) return;
  var y = b.y < H / 2 ? H * 0.86 : H * 0.14;
  var pop = Math.max(0, 1 - (m.callT || 0) / 0.18);
  ctx.save();
  ctx.globalAlpha = m.phase === "end" ? 1 - m.t / 0.3 : 1;
  ctx.textBaseline = "middle"; ctx.lineJoin = "round";
  var fs = 30, big = last ? 44 : fs;
  var font = function (n) { return "900 " + n + 'px "Barlow Condensed", "Arial Narrow", sans-serif'; };
  var widths = words.map(function (w, i) { ctx.font = font(i === words.length - 1 ? big : fs); return ctx.measureText(w + " ").width; });
  var total = widths.reduce(function (a, c) { return a + c; }, 0);
  var x = W / 2 - total / 2;
  words.forEach(function (w, i) {
    var newest = i === words.length - 1, n = newest ? big * (1 + 0.35 * pop) : fs;
    ctx.font = font(n); ctx.textAlign = "left";
    ctx.lineWidth = 6; ctx.strokeStyle = "rgba(10,50,20,0.9)"; ctx.strokeText(w, x, y);
    if (w === "RAINBOW!!!") {
      var tw = ctx.measureText(w).width, gr = ctx.createLinearGradient(x, 0, x + tw, 0);
      RB_COLORS.forEach(function (c, k) { gr.addColorStop(k / 6, c); });
      ctx.fillStyle = gr;
    } else ctx.fillStyle = w === "POT O' GOLD!" ? "#ffd21f" : "#5fe08a";
    ctx.shadowColor = "rgba(255,210,60,0.9)"; ctx.shadowBlur = 12;
    ctx.fillText(w, x, y);
    ctx.shadowBlur = 0;
    x += widths[i];
  });
  ctx.restore();
}

// The camera pushes in on him while he charges, like the Kamehameha (from kameCam).
function rainbowCam() {
  var out = null;
  balls.forEach(function (b) {
    if (!rainbowOn(b) || !b.alive) return;
    var m = b.igbb;
    if (m.phase === "summon") out = { z: 1 + 0.12 * Math.min(1, m.t / RB_SUMMON), x: b.x, y: b.y };
    else if (m.phase === "charge") out = { z: 1.12 + 0.2 * (m.t / m.charge) + 0.03 * (m.pulse || 0), x: b.x, y: b.y };
    else if (m.phase === "fire" && m.t < 0.12) out = { z: 1.36, x: b.x, y: b.y };
  });
  return out;
}
