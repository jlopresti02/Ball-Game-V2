// Chair Shot: Josh Hokit's special move, a WWE style folding chair shot.
//
// When the bar fills, he reaches under the ring and comes up with a black
// folding chair, raises it overhead and charges the opponent down. When he
// gets to them he swings it down over their head for `damage` (it can't be
// weaved or blocked): CLANG, the chair bends, and they're left dazed on the
// spot with stars circling their head for `dazeTime` seconds. He throws the
// dented chair over the cage into the crowd and runs a lap of the ring with
// his arms up, celebrating, for `celebrateTime` seconds, then gives them a
// thumbs down.
//
// It shares the fighter's `igbb` state (move "chairshot"), so it locks and
// guards like the other specials: he blocks everything while he's getting
// the chair out, swinging it and running his lap, but not while he's
// charging them down.
"use strict";

var CHAIR_FETCH_TIME = 0.75;   // reaching under the ring and raising it overhead
var CHAIR_CLOSE_SPEED = 900;   // charging them down
var CHAIR_CLOSE_GIVEUP = 3.5;  // gives up (stays charged) if it can't get there
var CHAIR_SWING_TIME = 0.15;   // the swing down onto their head (a quick whip)
var CHAIR_HOLD_TIME = 0.35;    // the chair stays on them a moment after the hit
var CHAIR_LAP_SPEED = 620;     // running laps of the ring celebrating
var CHAIR_CROWD_TIME = 0.8;    // the chair's flight into the stands

var chairDebris = []; // thrown-away chairs, tumbling off and fading

function resetChairShot() { chairDebris = []; }

function updateChairShot(self, other, dt) {
  var sp = self.char.special;
  if (!self.igbb) {
    if (self.specialT < sp.chargeTime || !canStartIgbb(self, other)) return false;
    self.igbb = { move: "chairshot", phase: "fetch", t: 0 };
    clearActions(self);
    floater(self.x, self.y - self.r - 26, "FOLDING CHAIR!", "crit");
    playWhoosh();
  }
  var m = self.igbb;
  m.t += dt;
  var dx = other.x - self.x, dy = other.y - self.y, d = Math.sqrt(dx * dx + dy * dy) || 1;

  if (m.phase === "fetch") {
    self.vx = 0; self.vy = 0;
    if (m.t >= CHAIR_FETCH_TIME) { m.phase = "close"; m.t = 0; }
    return true;
  }
  if (m.phase === "close") {
    // Called off (they're untouchable or busy): drops the chair, stays charged.
    if (!other.alive || other.invincible || specialBusy(other) || m.t > CHAIR_CLOSE_GIVEUP) {
      tossChair(self, -dx / d, -dy / d, false);
      self.igbb = null;
      return false;
    }
    if (d < self.r + other.r + 14) {
      clearActions(other);
      other.dazed = "held"; other.vx = 0; other.vy = 0; // pinned in place, no stars until it lands
      self.vx = 0; self.vy = 0;
      m.phase = "swing"; m.t = 0; m.nx = dx / d; m.ny = dy / d;
      playWhoosh();
      return true;
    }
    self.vx = dx / d * CHAIR_CLOSE_SPEED; self.vy = dy / d * CHAIR_CLOSE_SPEED;
    if (!reduceMotion) particles.push({ x: self.x, y: self.y, vx: -self.vx * 0.1, vy: -self.vy * 0.1, life: 0.2, max: 0.2, size: self.r * 0.55, color: self.char.color });
    return true;
  }

  self.vx = 0; self.vy = 0;
  if (m.phase === "swing") {
    if (m.t < CHAIR_SWING_TIME) return true;
    landChairShot(self, other, m);
    m.phase = "hold"; m.t = 0;
    if (!other.alive) { other.dazed = false; checkEnd(); }
    return true;
  }
  if (m.phase === "hold") {
    if (m.t < CHAIR_HOLD_TIME) return true;
    throwChairIntoCrowd(self);
    if (!other.alive) { endChairShot(self, other); return false; }
    m.phase = "celebrate"; m.t = 0;
    m.lapA = Math.atan2(self.y - H / 2, self.x - W / 2); // where on the lap he joins it
    m.lapDir = Math.random() < 0.5 ? -1 : 1;
    floater(other.x, other.y - other.r - 34, "DAZED", "note");
    return true;
  }
  if (m.phase === "celebrate") {
    // Arms up, running a lap round the ring while they're still seeing stars.
    if (other.dazed && m.t >= sp.dazeTime) { other.dazed = false; setSpeed(other, (other.baseSpeed || SPEED) * 0.6); }
    var R = Math.min(W, H) / 2 - self.r - 10;
    m.lapA += m.lapDir * CHAIR_LAP_SPEED / R * dt;
    var tx = W / 2 + Math.cos(m.lapA) * R, ty = H / 2 + Math.sin(m.lapA) * R;
    var lx = tx - self.x, ly = ty - self.y, ld = Math.sqrt(lx * lx + ly * ly);
    var step = CHAIR_LAP_SPEED * 1.4 * dt; // catches up onto the lap first
    if (ld <= step) { self.x = tx; self.y = ty; } else { self.x += lx / ld * step; self.y += ly / ld * step; }
    if (!reduceMotion) particles.push({ x: self.x, y: self.y, vx: 0, vy: 0, life: 0.22, max: 0.22, size: self.r * 0.45, color: self.char.color });
    if (m.t < sp.celebrateTime) return true;
    endChairShot(self, other);
    return false;
  }
  return false;
}

function landChairShot(self, other, m) {
  var dealt = hurt(other, self.char.special.damage, "igbb", self.id); // can't be weaved or blocked
  m.dent = true;
  if (other.alive) other.dazed = true; // now the stars come out
  playSlam(); playSlam(); playPunch(Math.max(60, dealt * 3));
  floater(other.x, other.y - other.r - 60, "CLANG!", "crit");
  other.flash = 0.2;
  impacts.push({ x: other.x, y: other.y - other.r * 0.5, nx: 0, ny: -1, life: 0.6, max: 0.6, color: theme.hit });
  impacts.push({ x: other.x, y: other.y - other.r * 0.5, nx: -m.nx, ny: -m.ny, life: 0.45, max: 0.45, color: self.char.color });
  impacts.push({ x: other.x, y: other.y, nx: 0, ny: -1, life: 0.9, max: 0.9, color: "#ffffff" });
  igbbSparks(other.x, other.y - other.r * 0.4, 0, -1, "#d7dbe2", 40, 700);
  igbbSparks(other.x, other.y - other.r * 0.4, -m.nx, -m.ny, theme.hit, 18, 560);
  // Bits of the chair (bolts, a rubber foot) and sweat spraying off them.
  if (!reduceMotion) for (var i = 0; i < 14; i++) {
    var a = -Math.PI / 2 + (Math.random() - 0.5) * 2.6, v = 300 + Math.random() * 420;
    particles.push({ x: other.x, y: other.y - other.r * 0.8, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 0.5 + Math.random() * 0.3, max: 0.8,
      size: 2.5 + Math.random() * 3, color: i % 3 ? "#1b1d21" : "#cfe8ff" });
  }
  other.squash = { t: 0.34, max: 0.34, nx: 0, ny: -1 }; // flattened down from above
  hitStop = Math.max(hitStop, 0.28);
  if (!reduceMotion) shake = Math.max(shake, 34);
}

function endChairShot(self, other) {
  var m = self.igbb;
  self.igbb = null;
  self.specialT = 0;
  other.dazed = false;
  // Off the lap at full speed, the way he was running.
  if (m && m.lapA != null) { self.vx = -Math.sin(m.lapA) * m.lapDir; self.vy = Math.cos(m.lapA) * m.lapDir; }
  setSpeed(self, self.baseSpeed || SPEED);
  if (other.alive) setSpeed(other, (other.baseSpeed || SPEED) * 0.6);
  // Straight into a thumbs down at them (hokit.js).
  if (self.char.hasThumbsDown) self.mockCd = Math.min(self.mockCd, 0.2);
}

// Hurls the dented chair over the cage into the nearest stand: it tumbles
// out of the ring, shrinking as it sails up into the crowd, who pop.
function throwChairIntoCrowd(self) {
  var h = chairHold(self, self.igbb);
  var dl = h.x, dr = W - h.x, dt = h.y, db = H - h.y, near = Math.min(dl, dr, dt, db);
  var nx = near === dl ? -1 : near === dr ? 1 : 0, ny = nx ? 0 : (near === dt ? -1 : 1);
  var dist = near + self.r * 3.2; // well past the cage, into the seats
  chairDebris.push({ x: h.x, y: h.y, a: h.a, vx: nx * dist / CHAIR_CROWD_TIME + (Math.random() - 0.5) * 60, vy: ny * dist / CHAIR_CROWD_TIME + (Math.random() - 0.5) * 60,
    va: (Math.random() < 0.5 ? -1 : 1) * 11, t: 0, life: CHAIR_CROWD_TIME, size: self.r, dent: true, crowd: true });
  floater(self.x, self.y - self.r - 30, "INTO THE CROWD!", "note");
  playWhoosh();
}

// Throws the chair away (dented once it's been used), tumbling off.
function tossChair(self, nx, ny, dented) {
  var h = chairHold(self, self.igbb);
  chairDebris.push({ x: h.x, y: h.y, a: h.a, vx: nx * 420 + (Math.random() - 0.5) * 160, vy: ny * 420 - 120, va: (Math.random() < 0.5 ? -1 : 1) * 9, t: 0, life: 0.9, size: self.r, dent: dented });
  playWhoosh();
}

function tickChairDebris(dt) {
  chairDebris.forEach(function (c) {
    c.t += dt; c.x += c.vx * dt; c.y += c.vy * dt; c.a += c.va * dt;
    if (!c.crowd) { c.vx *= 0.97; c.vy *= 0.97; }
  });
  chairDebris = chairDebris.filter(function (c) {
    if (c.t < c.life) return true;
    if (c.crowd) crowdReact(1); // lands in the seats: the crowd goes up
    return false;
  });
}

// Where the chair is and how it's tilted: rising out from under him in the
// fetch, held up over his head while he charges, then swung over and down
// onto their head.
function chairHold(b, m) {
  var o = balls[1 - b.id], r = b.r;
  var dx = o.x - b.x, dy = o.y - b.y, d = Math.sqrt(dx * dx + dy * dy) || 1;
  var nx = m && m.nx != null ? m.nx : dx / d, ny = m && m.ny != null ? m.ny : dy / d;
  var over = { x: b.x - nx * r * 0.25, y: b.y - r * 1.25, a: -Math.atan2(nx, 1) * 0.35 };
  if (!m || m.phase === "close" || m.phase === "daze") return over;
  if (m.phase === "fetch") {
    var k = Math.min(1, m.t / CHAIR_FETCH_TIME); k = k * k * (3 - 2 * k);
    return { x: over.x, y: b.y + r * 0.9 - (r * 2.15) * k, a: over.a * k, rise: k };
  }
  // Swung from back over his head down onto theirs.
  var p = m.phase === "swing" ? Math.min(1, m.t / CHAIR_SWING_TIME) : 1, e = p * p * p; // whips in, fastest at the end
  // Lands flat across the top of their head, the seat facing out.
  var sgn = nx < -0.15 ? -1 : 1;
  var back = { x: b.x - nx * r * 0.7, y: b.y - r * 1.35, a: -sgn * 0.6 };
  var hit = { x: o.x, y: o.y - o.r - r * 0.3, a: sgn * Math.PI / 2 };
  if (p < 0.15) {
    var q = p / 0.15;
    return { x: over.x + (back.x - over.x) * q, y: over.y + (back.y - over.y) * q, a: over.a + (back.a - over.a) * q };
  }
  return { x: back.x + (hit.x - back.x) * e, y: back.y + (hit.y - back.y) * e - Math.sin(Math.PI * e) * r * 0.5, a: back.a + (hit.a - back.a) * e };
}

// A black folding chair seen from the front (like the reference photo):
// tube frame with rounded corners, a grey backrest with a wavy bottom edge,
// a padded grey seat, a crossbar near the feet. `s` is its height.
function drawFoldingChair(x, y, s, a, dent, alpha) {
  var w = s * 0.56, h = s;
  ctx.save();
  ctx.globalAlpha = alpha == null ? 1 : alpha;
  ctx.translate(x, y);
  ctx.rotate(a || 0);
  if (dent) ctx.scale(1.06, 0.84); // bent from the hit
  ctx.translate(-w / 2, -h / 2);
  var tube = Math.max(2, s * 0.045);
  // Backrest panel.
  ctx.fillStyle = "#9aa1ab";
  ctx.beginPath();
  ctx.moveTo(w * 0.1, h * 0.06);
  ctx.lineTo(w * 0.9, h * 0.06);
  ctx.lineTo(w * 0.9, h * 0.18);
  ctx.quadraticCurveTo(w * 0.7, h * 0.15, w * 0.5, h * 0.19);
  ctx.quadraticCurveTo(w * 0.3, h * 0.15, w * 0.1, h * 0.18);
  ctx.closePath(); ctx.fill();
  // Frame: one tube looping up the sides and round the top, down to the feet.
  ctx.lineCap = "round"; ctx.lineJoin = "round";
  [["#0b0c0e", tube * 1.9], ["#2a2d33", tube]].forEach(function (st) {
    ctx.strokeStyle = st[0]; ctx.lineWidth = st[1];
    ctx.beginPath();
    ctx.moveTo(w * 0.06, h * 0.96);
    ctx.lineTo(w * 0.06, h * 0.12);
    ctx.quadraticCurveTo(w * 0.06, h * 0.02, w * 0.2, h * 0.02);
    ctx.lineTo(w * 0.8, h * 0.02);
    ctx.quadraticCurveTo(w * 0.94, h * 0.02, w * 0.94, h * 0.12);
    ctx.lineTo(w * 0.94, h * 0.96);
    ctx.moveTo(w * 0.1, h * 0.18); ctx.lineTo(w * 0.9, h * 0.18);   // under the backrest
    ctx.moveTo(w * 0.12, h * 0.8); ctx.lineTo(w * 0.88, h * 0.8);   // crossbar
    ctx.moveTo(w * 0.14, h * 0.93); ctx.lineTo(w * 0.86, h * 0.93); // foot rail
    ctx.stroke();
  });
  // Seat pad.
  ctx.fillStyle = "#6f7680"; ctx.strokeStyle = "#0b0c0e"; ctx.lineWidth = Math.max(1.5, s * 0.02);
  var sx = w * 0.15, sy = h * 0.29, sw = w * 0.7, sh = h * 0.39, rr = w * 0.1;
  ctx.beginPath();
  ctx.moveTo(sx + rr, sy); ctx.lineTo(sx + sw - rr, sy); ctx.quadraticCurveTo(sx + sw, sy, sx + sw, sy + rr);
  ctx.lineTo(sx + sw, sy + sh - rr); ctx.quadraticCurveTo(sx + sw, sy + sh, sx + sw - rr, sy + sh);
  ctx.lineTo(sx + rr, sy + sh); ctx.quadraticCurveTo(sx, sy + sh, sx, sy + sh - rr);
  ctx.lineTo(sx, sy + rr); ctx.quadraticCurveTo(sx, sy, sx + rr, sy);
  ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = "rgba(255,255,255,0.12)"; // a little shine on the vinyl
  ctx.fillRect(sx + sw * 0.12, sy + sh * 0.1, sw * 0.5, sh * 0.12);
  ctx.restore();
}

// Him with the chair: both arms up gripping the frame.
function drawChairShot(b) {
  var m = b.igbb;
  if (!m || m.move !== "chairshot" || !b.alive) return;
  if (m.phase === "celebrate") { drawArmsUp(b, m.t); return; }
  var h = chairHold(b, m), s = b.r * 2;
  if (m.phase === "fetch" && h.rise < 0.35) return; // still under the ring
  var grip = [-1, 1].map(function (k) {
    return { x: h.x + Math.cos(h.a) * k * s * 0.3 + Math.sin(h.a) * s * 0.1, y: h.y + Math.sin(h.a) * k * s * 0.3 - Math.cos(h.a) * s * 0.1 + s * 0.12 };
  });
  var size = b.char.punch.size || 13;
  grip.forEach(function (g, i) {
    var sh = { x: b.x + (i ? 1 : -1) * b.r * 0.6, y: b.y - b.r * 0.25 };
    strokeLimb(size * 0.75, armColor(b.char), function () { ctx.moveTo(sh.x, sh.y); ctx.lineTo(g.x, g.y); });
  });
  drawFoldingChair(h.x, h.y, s, h.a, m.phase === "hold" || m.dent, 1);
  grip.forEach(function (g) { drawGloveAt(g.x, g.y, size * 0.85, b.char); });
}

// Both fists pumping in the air.
function drawArmsUp(b, t) {
  var size = b.char.punch.size || 13;
  [-1, 1].forEach(function (k, i) {
    var pump = Math.max(0, Math.sin(t * 12 + i * Math.PI)) * b.r * 0.35;
    var sh = { x: b.x + k * b.r * 0.62, y: b.y - b.r * 0.5 };
    var hand = { x: b.x + k * b.r * 0.9, y: b.y - b.r * 1.15 - pump };
    strokeLimb(size * 0.75, armColor(b.char), function () { ctx.moveTo(sh.x, sh.y); ctx.lineTo(hand.x, hand.y); });
    drawGloveAt(hand.x, hand.y, size * 0.9, b.char);
  });
}

// Thrown-away chairs tumbling off.
function drawChairDebris() {
  chairDebris.forEach(function (c) {
    var k = c.t / c.life;
    // Into the crowd it sails up and away (shrinks), only fading at the end.
    if (c.crowd) drawFoldingChair(c.x, c.y - Math.sin(Math.PI * k) * c.size * 1.2, c.size * 2 * (1 - 0.45 * k), c.a, c.dent, k > 0.8 ? (1 - k) / 0.2 : 1);
    else drawFoldingChair(c.x, c.y, c.size * 2, c.a, c.dent, Math.max(0, 1 - k));
  });
}

// Stars spinning round a dazed fighter's head.
function drawDazed(b) {
  if (b.dazed !== true || !b.alive) return;
  var t = performance.now() / 1000;
  for (var i = 0; i < 3; i++) {
    var a = t * 5 + i * Math.PI * 2 / 3;
    var x = b.x + Math.cos(a) * b.r * 0.75, y = b.y - b.r * 1.05 + Math.sin(a) * b.r * 0.22;
    drawStar(x, y, b.r * 0.17, "#ffd23f");
  }
}

function drawStar(x, y, r, color) {
  ctx.save();
  ctx.fillStyle = color; ctx.strokeStyle = theme.wall; ctx.lineWidth = 1.5;
  ctx.beginPath();
  for (var i = 0; i < 10; i++) {
    var rr = i % 2 ? r * 0.45 : r, a = -Math.PI / 2 + i * Math.PI / 5;
    ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
  }
  ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.restore();
}
