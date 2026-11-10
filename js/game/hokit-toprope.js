// Josh Hokit's Top Rope Body Slam (Joe, 2026-11-06). A few times a fight,
// at random:
//   run    he sprints to the nearest corner of the cage
//   climb  he climbs up onto the top rope
//   perch  standing on the corner, pumping his fists to the crowd, while a
//          red circle comes up on them and fills in as the countdown. The
//          circle follows them round the ring the whole time (the parts of
//          it that would go past the cage are cut off)
//   leap   he flies off the top rope in a big arc, spreading out for a
//          belly-flop body slam, still steering at them until the last
//          moment, when the circle locks (Joe, 2026-11-10: more accurate)
//   down   he lands flat in the middle of the circle, then pops back up
// Only whoever's inside the circle when he lands gets hit: topRope.damage and
// a knockback into the walls. It's an area attack, so it can't be slipped or
// blocked, only got out of the way of. Runs on b.igbb (move "toprope") so he's
// locked out of everything else while it's on, and he can't be touched from
// the run to the landing. Config: char.topRope.
"use strict";

var TR_RUN_MAX = 1.6, TR_CLIMB = 0.5, TR_LEAP = 0.8, TR_DOWN = 0.8;
var TR_POST = 46;       // how high the top rope is, in arena units
var TR_ARC = 170;       // how high he flies at the top of the leap
var TR_RUN_SPEED = 620;
var TR_TRACK = 900;     // how fast the red circle follows them while he's on the corner
var TR_HOME = 300;      // how fast it still follows them while he's in the air
var TR_LOCK = 0.77;      // how far into the leap it stops following (the escape window)
var trCrater = null;    // the dented mat after he lands

function resetTopRope() { trCrater = null; }
function topRopeOn(b) { return !!(b && b.igbb && b.igbb.move === "toprope"); }
// Up off the mat (climbing, on the corner or in the air): drawn on his own
// (drawTopRopeOver), not with the other fighters.
function topRopeDrawnApart(b) {
  return topRopeOn(b) && (b.igbb.phase === "climb" || b.igbb.phase === "perch" || b.igbb.phase === "leap");
}
// As far into the corner as the cage lets him go.
function trCorner(b) {
  var m = b.igbb;
  return { x: m.kx < W / 2 ? b.r : W - b.r, y: m.ky < H / 2 ? b.r : H - b.r };
}
// How far he's drawn from his spot toward the corner post while he's up on
// it (he stands on the post, a little past where the cage stops his body).
function trPostShift(b) {
  var m = b.igbb, w = 0;
  if (m.phase === "climb") w = ease(m.t / TR_CLIMB);
  else if (m.phase === "perch") w = 1;
  else if (m.phase === "leap") w = 1 - Math.min(1, m.t / TR_LEAP);
  var d = b.r * 0.45 * w;
  return { x: (m.kx < W / 2 ? -d : d), y: (m.ky < H / 2 ? -d : d) };
}
function trRand(r) { return r[0] + Math.random() * (r[1] - r[0]); }

// From makeBall.
function initTopRope(b) {
  var cfg = b.char.topRope;
  b.topRopeN = 0;
  b.topRopeT = cfg ? trRand(cfg.first) : Infinity;
}

// From the abilities loop, before the special. True while it's running.
function updateTopRope(self, other, dt) {
  var cfg = self.char.topRope;
  if (!cfg) return false;
  if (!self.igbb) {
    if (!started || over || self.topRopeN >= cfg.max) return false;
    self.topRopeT -= dt;
    if (self.topRopeT > 0 || !canStartIgbb(self, other) || swordDuelActive()) return false;
    clearActions(self);
    self.topRopeN++;
    self.topRopeT = trRand(cfg.every);
    // The nearest corner.
    self.igbb = { move: "toprope", phase: "run", t: 0, z: 0, kx: self.x < W / 2 ? 0 : W, ky: self.y < H / 2 ? 0 : H, R: cfg.radius };
    self.invincible = true;
    floater(self.x, self.y - self.r - 30, "TO THE CORNER!", "note");
  }
  var m = self.igbb;
  if (m.move !== "toprope") return false;
  m.t += dt;
  self.vx = 0; self.vy = 0;
  self.immuneCd = m.phase === "down" ? 0 : 1; // no IMMUNE popping up while he's on the ropes
  if (over && m.phase !== "down") { endTopRope(self); return false; }

  if (m.phase === "run") {
    var c = trCorner(self), dx = c.x - self.x, dy = c.y - self.y, d = Math.sqrt(dx * dx + dy * dy);
    var step = TR_RUN_SPEED * dt;
    if (d <= step || m.t >= TR_RUN_MAX) {
      self.x = c.x; self.y = c.y;
      m.phase = "climb"; m.t = 0;
      crowdReact(0.6);
    } else { self.x += dx / d * step; self.y += dy / d * step; }
    return true;
  }
  var cc = trCorner(self);
  if (m.phase === "climb") {
    self.x = cc.x; self.y = cc.y;
    m.z = TR_POST * ease(m.t / TR_CLIMB);
    if (m.t >= TR_CLIMB) {
      m.phase = "perch"; m.t = 0; m.z = TR_POST;
      // The circle: right on them, and it follows them from here on. It can
      // sit right up against the cage.
      m.cx = other.x; m.cy = other.y;
      floater(cc.x, cc.y - self.r - TR_POST - 30, "TOP ROPE!", "crit");
      floater(m.cx, m.cy - 20, "INCOMING!", "crit");
      playDuckWarn(cfg.warn);
      crowdReact(1);
    }
    return true;
  }
  if (m.phase === "perch") {
    self.x = cc.x; self.y = cc.y;
    trFollow(m, other, TR_TRACK, dt);
    if (m.t >= cfg.warn) { m.phase = "leap"; m.t = 0; m.fx = cc.x; m.fy = cc.y; playDuckFall(); }
    return true;
  }
  if (m.phase === "leap") {
    var k = Math.min(1, m.t / TR_LEAP);
    if (k < TR_LOCK) trFollow(m, other, TR_HOME, dt); // still adjusting in the air
    self.x = m.fx + (m.cx - m.fx) * k; self.y = m.fy + (m.cy - m.fy) * k;
    m.z = TR_POST * (1 - k) + TR_ARC * 4 * k * (1 - k);
    if (k >= 1) { m.phase = "down"; m.t = 0; m.z = 0; self.x = m.cx; self.y = m.cy; topRopeLand(self, other, cfg, m); }
    return true;
  }
  // Flat on the mat, then back up.
  self.x = m.cx; self.y = m.cy;
  if (m.t < TR_DOWN * 0.6) self.squash = { t: 0.2, max: 0.3, nx: 0, ny: 1 };
  if (m.t >= TR_DOWN) { endTopRope(self); return false; }
  return true;
}

// The red circle sliding after them, at most `speed` units a second.
function trFollow(m, other, speed, dt) {
  if (!other.alive) return;
  var dx = other.x - m.cx, dy = other.y - m.cy, d = Math.sqrt(dx * dx + dy * dy), step = speed * dt;
  if (d <= step) { m.cx = other.x; m.cy = other.y; } else { m.cx += dx / d * step; m.cy += dy / d * step; }
}

function topRopeLand(self, other, cfg, m) {
  self.invincible = false;
  self.squash = { t: 0.3, max: 0.3, nx: 0, ny: 1 };
  trCrater = { x: m.cx, y: m.cy, R: m.R, t: 0 };
  if (!reduceMotion) { shake = Math.max(shake, 28); hitStop = Math.max(hitStop, 0.12); }
  impacts.push({ x: m.cx, y: m.cy + self.r * 0.5, nx: 0, ny: -1, life: 0.5, max: 0.5, color: "#ffffff" });
  for (var i = 0; i < 30 && !reduceMotion; i++) { // dust thrown out round him
    var a = i / 30 * Math.PI * 2, s = 240 + Math.random() * 200;
    particles.push({ x: m.cx + Math.cos(a) * self.r, y: m.cy + Math.sin(a) * self.r * 0.6, vx: Math.cos(a) * s, vy: Math.sin(a) * s * 0.6, life: 0.6, max: 0.6, size: 3 + Math.random() * 4, color: i % 3 ? "#d8cdb5" : "#ffffff" });
  }
  playDuckLand();
  crowdReact(1);
  var dx = other.x - m.cx, dy = other.y - m.cy, d = Math.sqrt(dx * dx + dy * dy);
  if (other.alive && d <= m.R) {
    if (d < 1) { var ra = Math.random() * Math.PI * 2; dx = Math.cos(ra); dy = Math.sin(ra); d = 1; }
    var dealt = hurt(other, cfg.damage, "igbb", self.id); // an area hit: can't be slipped or blocked
    if (dealt > 0) {
      floater(other.x, other.y - other.r - 30, "BODY SLAM!", "crit");
      other.flash = 0.16;
      if (other.alive) beginWallSlam(other, dx / d, dy / d, { knockback: cfg.knockback, wallSlams: cfg.wallSlams, slamDamage: cfg.slamDamage });
      checkEnd();
    }
  } else if (other.alive) {
    floater(other.x, other.y - other.r - 30, "MISSED!", "dodge");
  }
}

function endTopRope(self) {
  self.igbb = null;
  self.invincible = false;
  self.immuneCd = 0;
  self.vx = 0; self.vy = 0;
}

// Every frame from update().
function tickTopRope(dt) {
  if (trCrater) { trCrater.t += dt; if (trCrater.t > 2) trCrater = null; }
}

// ---------------------------------------------------------------- drawing

// Under the fighters: the red circle (cut off at the cage), his shadow, the dent.
function drawTopRopeUnder() {
  ctx.save();
  ctx.beginPath(); ctx.rect(0, 0, W, H); ctx.clip(); // nothing past the cage
  if (trCrater) {
    var c = trCrater, fade = Math.min(1, (2 - c.t) / 0.8);
    ctx.globalAlpha = fade;
    ctx.fillStyle = "rgba(60,40,25,0.25)";
    ctx.beginPath(); ctx.ellipse(c.x, c.y + 6, 50, 26, 0, 0, Math.PI * 2); ctx.fill();
    [[0, "#ffffff", 14], [0.1, "#e0221b", 9]].forEach(function (w) { // shockwave rings
      var wt = c.t - w[0];
      if (wt < 0 || wt > 0.5) return;
      var k = wt / 0.5;
      ctx.globalAlpha = (1 - k) * fade; ctx.strokeStyle = w[1]; ctx.lineWidth = w[2] * (1 - k) + 2;
      ctx.beginPath(); ctx.ellipse(c.x, c.y + 10, c.R * (0.25 + 1.3 * k), c.R * (0.25 + 1.3 * k) * 0.8, 0, 0, Math.PI * 2); ctx.stroke();
    });
    ctx.globalAlpha = 1;
  }
  balls.forEach(function (b) {
    var m = b.igbb;
    if (!topRopeOn(b) || (m.phase !== "perch" && m.phase !== "leap")) return;
    var cfg = b.char.topRope;
    var k = m.phase === "perch" ? Math.min(1, m.t / cfg.warn) : 1, pulse = 0.5 + 0.5 * Math.sin(performance.now() / 90);
    var pop = m.phase === "perch" ? easeOut(Math.min(1, m.t / 0.25)) : 1;
    ctx.save();
    ctx.translate(m.cx, m.cy);
    ctx.fillStyle = "rgba(224,34,27," + (0.14 + 0.1 * pulse) + ")";
    ctx.beginPath(); ctx.arc(0, 0, m.R * pop, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "rgba(224,34,27,0.28)"; // filling in: the countdown to impact
    ctx.beginPath(); ctx.arc(0, 0, m.R * pop * k, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "#e0221b"; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.arc(0, 0, m.R * pop, 0, Math.PI * 2); ctx.stroke();
    ctx.setLineDash([12, 10]); ctx.lineDashOffset = -performance.now() / 30; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(0, 0, m.R * pop * 0.78, 0, Math.PI * 2); ctx.stroke();
    ctx.setLineDash([]); ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(-18, 0); ctx.lineTo(18, 0); ctx.moveTo(0, -18); ctx.lineTo(0, 18); ctx.stroke();
    ctx.restore();
  });
  ctx.restore();
  // His shadow on the mat while he's up.
  balls.forEach(function (b) {
    if (!topRopeDrawnApart(b) || !b.alive) return;
    var z = b.igbb.z || 0, s = Math.max(0.35, 1 - z / 260), ps = trPostShift(b);
    ctx.save();
    ctx.fillStyle = "rgba(0,0,0," + (0.3 * s) + ")";
    ctx.beginPath(); ctx.ellipse(b.x + ps.x, b.y + ps.y + b.r * 0.85, b.r * s, b.r * 0.3 * s, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  });
}

// Him on the corner and flying through the air: drawn after the stands and
// the jumbotron so he's never hidden behind them (sc/ox/oy place the arena on
// the canvas). From draw().
function drawTopRopeSky(scl, ox, oy) {
  balls.forEach(function (b) {
    if (!topRopeDrawnApart(b) || !b.alive) return;
    var m = b.igbb, ch = b.char, r = b.r, z = m.z || 0, ps = trPostShift(b);
    var bx = b.x + ps.x, by = b.y + ps.y - z, sc = 1 + z / 420;
    ctx.save();
    ctx.setTransform(scl, 0, 0, scl, ox, oy);
    var arm = (ch.punch.size || 15) * 0.75, gr = r * 0.24;
    var face = (m.cx != null ? m.cx : W / 2) >= bx ? 1 : -1;
    var lk = m.phase === "leap" ? Math.min(1, m.t / TR_LEAP) : 0;
    ctx.save();
    ctx.translate(bx, by); ctx.scale(sc, sc);
    if (m.phase === "leap") { // spreading out flat for the belly-flop
      var flat = ease(Math.min(1, lk / 0.6));
      ctx.rotate(face * 0.25 * flat); ctx.scale(1 + 0.12 * flat, 1 - 0.14 * flat);
    }
    ctx.translate(-bx, -by);
    // Arms: pumping on the corner, spread wide in the air, reaching up on the climb.
    var pump = Math.sin(performance.now() / 120);
    [-1, 1].forEach(function (sd) {
      var sx = bx + sd * r * 0.62, sy = by - r * 0.15, hx, hy;
      if (m.phase === "climb") { hx = bx + sd * r * 0.7; hy = by - r * (1.1 + 0.2 * Math.sin(m.t * 20 + sd)); }
      else if (m.phase === "perch") { var up = sd > 0 ? Math.max(0, pump) : Math.max(0, -pump); hx = bx + sd * r * 1.05; hy = by - r * (0.7 + 0.6 * up); }
      else { var sp = ease(Math.min(1, lk / 0.5)); hx = bx + sd * r * (0.9 + 0.7 * sp); hy = by - r * (0.9 - 0.9 * sp); }
      strokeLimb(arm, armColor(ch), function () { ctx.moveTo(sx, sy); ctx.lineTo(hx, hy); });
      drawGloveAt(hx, hy, gr, ch);
    });
    if (ch.look) drawFighterArt(ctx, bx, by, r, ch.look, theme.wall, { layout: "contained", name: ch.name });
    else { ctx.fillStyle = ch.color; ctx.beginPath(); ctx.arc(bx, by, r, 0, Math.PI * 2); ctx.fill(); }
    ctx.lineWidth = 3; ctx.strokeStyle = theme.wall;
    ctx.beginPath(); ctx.arc(bx, by, r, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
    ctx.restore();
  });
}
