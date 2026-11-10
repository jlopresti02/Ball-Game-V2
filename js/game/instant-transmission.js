// Charles Oliveira's Instant Transmission (Joe, 2026-11-10). While he's
// blond in the Do Bronx state he teleports: every few seconds just to move
// round the ring (instantTransmission.every), and to dodge a strike or a
// projectile that would have hit him (dodgeChance %, at most once every
// dodgeCd seconds). On his 3rd dodge (comboAt) he teleports right behind
// (or beside) the opponent and nails them with a really hard shot: damage
// (Do Bronx's damage boost applies) and a knockback into the cage. Joe's
// Dragon Ball teleport and hard-shot sounds.
// The hard shot runs on b.igbb (move "itshot"); the teleports don't stop
// him doing anything else. Config: char.instantTransmission.
"use strict";

var IT_APPEAR = 0.22;  // there behind them, winding up
var IT_HIT = 0.1;      // the shot landing
var IT_RECOVER = 0.35; // fist out after it
var itGhosts = [];     // fading afterimages where he vanished from
var itStreaks = [];    // the zip lines where he vanished and appeared

function itRand(r) { return r[0] + Math.random() * (r[1] - r[0]); }
function itShotOn(b) { return !!(b && b.igbb && b.igbb.move === "itshot"); }

// Can he teleport right now? Blond in Do Bronx, free, and not in a move.
function itActive(b) {
  var cfg = b.char.instantTransmission;
  return !!(cfg && b.alive && b.doBronx && started && !over && charlesBlond(b) && !b.igbb &&
    !b.grapple && !b.grappled && !b.slam && !b.sprawl && !b.sprawled && !subLocked(b) && !b.guard && !b.koOut && !b.shocked);
}

function resetInstantTransmission() { itGhosts = []; itStreaks = []; }

// Gone from here, there now: the afterimage and the zip lines, and the sound.
function itTeleport(b, x, y) {
  itGhosts.push({ x: b.x, y: b.y, r: b.r, look: b.char.look, name: b.char.name, t: 0, max: 0.35 });
  itStreaks.push({ x: b.x, y: b.y, r: b.r, t: 0, max: 0.3, out: true });
  b.x = Math.min(W - b.r, Math.max(b.r, x)); b.y = Math.min(H - b.r, Math.max(b.r, y));
  b.vx *= 0.2; b.vy *= 0.2;
  itStreaks.push({ x: b.x, y: b.y, r: b.r, t: 0, max: 0.3, out: false });
  playClipOnce("itTeleport", 0.9);
}

// A random open spot: in the ring, not on top of them.
function itSpot(b, other, minD, path) {
  var best = null;
  for (var i = 0; i < 16; i++) {
    var x = b.r + Math.random() * (W - 2 * b.r), y = b.r + Math.random() * (H - 2 * b.r);
    var d = Math.sqrt((x - other.x) * (x - other.x) + (y - other.y) * (y - other.y));
    var move = Math.sqrt((x - b.x) * (x - b.x) + (y - b.y) * (y - b.y));
    // Out of a projectile's line of flight, so it sails on past.
    var clear = !path || Math.abs(-path.dy * (x - path.x) + path.dx * (y - path.y)) > b.r * 3;
    if (d >= minD && move > b.r * 2.5 && clear) return { x: x, y: y };
    if (clear && (!best || d > best.d)) best = { x: x, y: y, d: d };
  }
  return best || { x: b.x - path.dy * b.r * 3.5, y: b.y + path.dx * b.r * 3.5 };
}

// Special-move projectiles (eagles, goats, a thrown bear, a beam) hit with
// "igbb" so nothing can slip or block them, but he can still teleport out
// of their way. Callers check justDodged and let the thing fly on.
var itProjHit = null;
function hurtProjectile(b, amount, attackerId, dx, dy) {
  itProjHit = { x: b.x, y: b.y, dx: dx || 0, dy: dy || 0 };
  try { return hurt(b, amount, "igbb", attackerId); } finally { itProjHit = null; }
}

// From hurt() (match.js): a strike or a projectile about to land. True if
// he teleported out of the way (no damage).
function itDodge(b, source, attackerId) {
  if (!itActive(b) || attackerId == null || attackerId === b.id) return false;
  var proj = !!PROJECTILE_SOURCES[source] || (source === "igbb" && !!itProjHit);
  if (!proj && (source === "laser" || source === "slam" || source === "grapple" || source === "finisher" || source === "flow" ||
      source === "slugfest" || source === "kofinal" || source === "igbb")) return false;
  var cfg = b.char.instantTransmission, st = itState(b);
  // Anything thrown or fired at him he sees coming: a better chance, and a
  // shorter wait (a volley of diamonds can be dodged one after another).
  if (proj ? st.pcd > 0 : st.cd > 0) return false;
  if (Math.random() * 100 >= (proj ? cfg.projDodgeChance : cfg.dodgeChance)) return false;
  var other = balls[attackerId];
  var path = proj && itProjHit && (itProjHit.dx || itProjHit.dy) ? itProjHit : null;
  var spot = itSpot(b, other, (b.r + other.r) * 2.2, path);
  itTeleport(b, spot.x, spot.y);
  floater(b.x, b.y - b.r - 8, "DODGE", "dodge");
  b.justDodged = true;
  st.cd = cfg.dodgeCd;
  st.pcd = cfg.projDodgeCd;
  st.dodges++;
  if (st.dodges >= cfg.comboAt) { st.dodges = 0; st.shotDue = true; } // the hard shot, as soon as he can
  return true;
}

function itState(b) {
  if (!b.itState) b.itState = { moveT: itRand(b.char.instantTransmission.every), cd: 0, pcd: 0, dodges: 0, shotDue: 0 };
  return b.itState;
}

// From the abilities loop. True while the hard shot is running.
function updateInstantTransmission(self, other, dt) {
  var cfg = self.char.instantTransmission;
  if (!cfg) return false;
  var m = self.igbb;
  if (m && m.move === "itshot") return itShot(self, other, cfg, dt);
  if (!itActive(self)) { if (self.itState && !self.doBronx) self.itState = null; return false; }
  var st = itState(self);
  st.cd = Math.max(0, st.cd - dt);
  st.pcd = Math.max(0, (st.pcd || 0) - dt);
  // The 3rd dodge: straight behind them for the hard shot.
  if (st.shotDue) {
    // Waits only while they're tied up in something he can't hit them out of.
    if (other.alive && !other.invincible && !other.igbb && !other.grapple && !other.grappled && !other.slam && !subLocked(other) && !other.koOut && !swordDuelActive()) {
      st.shotDue = false;
      clearActions(self);
      var dx = other.x - self.x, dy = other.y - self.y, d = Math.sqrt(dx * dx + dy * dy) || 1;
      dx /= d; dy /= d;
      var gap = self.r + other.r + 2;
      // Behind them (carrying on past them from where he was); if the cage is
      // in the way, beside them instead.
      var opts = [[dx, dy], [-dy, dx], [dy, -dx], [-dx, -dy]], spot = null;
      for (var i = 0; i < opts.length && !spot; i++) {
        var x = other.x + opts[i][0] * gap, y = other.y + opts[i][1] * gap;
        if (x > self.r && x < W - self.r && y > self.r && y < H - self.r) spot = { x: x, y: y };
      }
      if (!spot) spot = { x: other.x + dx * gap, y: other.y + dy * gap };
      itTeleport(self, spot.x, spot.y);
      self.vx = 0; self.vy = 0;
      var hx = other.x - self.x, hy = other.y - self.y, hd = Math.sqrt(hx * hx + hy * hy) || 1;
      self.igbb = { move: "itshot", phase: "appear", t: 0, dx: hx / hd, dy: hy / hd };
      return true;
    }
    return false;
  }
  // Every so often, just popping up somewhere else in the ring.
  st.moveT -= dt;
  if (st.moveT <= 0 && !self.punch && !self.kick) {
    st.moveT = itRand(cfg.every);
    var spot2 = itSpot(self, other, (self.r + other.r) * 1.6);
    itTeleport(self, spot2.x, spot2.y);
  }
  return false;
}

function itShot(self, other, cfg, dt) {
  var m = self.igbb;
  m.t += dt;
  self.vx = 0; self.vy = 0;
  if (over || !other.alive) { self.igbb = null; return false; }
  if (m.phase === "appear") {
    // Keeps facing them while he winds up.
    var hx = other.x - self.x, hy = other.y - self.y, hd = Math.sqrt(hx * hx + hy * hy) || 1;
    m.dx = hx / hd; m.dy = hy / hd;
    if (m.t >= IT_APPEAR) {
      m.phase = "hit"; m.t = 0;
      playClipOnce("itShot", 1.0);
      var dealt = hurt(other, cfg.damage, "igbb", self.id); // can't be slipped or blocked: they never saw it coming
      if (dealt > 0) {
        floater(other.x, other.y - other.r - 30, "INSTANT TRANSMISSION!", "crit");
        other.flash = 0.2;
        if (!reduceMotion) { shake = Math.max(shake, 24); hitStop = Math.max(hitStop, 0.14); }
        impacts.push({ x: (self.x + other.x) / 2, y: (self.y + other.y) / 2, nx: m.dx, ny: m.dy, life: 0.5, max: 0.5, color: "#ffffff" });
        impacts.push({ x: other.x, y: other.y, nx: m.dx, ny: m.dy, life: 0.6, max: 0.6, color: "#ffd21f" });
        for (var i = 0; i < 18 && !reduceMotion; i++) {
          var a = Math.atan2(m.dy, m.dx) + (Math.random() - 0.5) * 1.8, v = 200 + Math.random() * 300;
          particles.push({ x: other.x, y: other.y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 0.45, max: 0.45, size: 3 + Math.random() * 3, color: i % 2 ? "#ffe680" : "#ffffff" });
        }
        crowdReact(1);
        if (other.alive) beginWallSlam(other, m.dx, m.dy, { knockback: cfg.knockback, wallSlams: cfg.wallSlams, slamDamage: cfg.slamDamage });
        checkEnd();
      }
    }
    return true;
  }
  if (m.phase === "hit") { if (m.t >= IT_HIT) { m.phase = "recover"; m.t = 0; } return true; }
  if (m.t >= IT_RECOVER) { self.igbb = null; return false; }
  return true;
}

// Every frame from update().
function tickInstantTransmission(dt) {
  itGhosts = itGhosts.filter(function (g) { g.t += dt; return g.t < g.max; });
  itStreaks = itStreaks.filter(function (s) { s.t += dt; return s.t < s.max; });
}

// Under the fighters: the afterimage he leaves behind, stretching up and fading.
function drawItGhosts() {
  itGhosts.forEach(function (g) {
    var k = g.t / g.max;
    ctx.save();
    ctx.globalAlpha = 0.55 * (1 - k);
    ctx.translate(g.x, g.y + g.r); ctx.scale(1 - 0.6 * k, 1 + 0.5 * k); ctx.translate(-g.x, -(g.y + g.r));
    if (g.look) drawFighterArt(ctx, g.x, g.y, g.r, g.look, theme.wall, { layout: "contained", name: g.name });
    ctx.restore();
  });
}

// Over the fighters: zip lines where he vanished and appeared, and his fist
// on the hard shot.
function drawItFx() {
  itStreaks.forEach(function (s) {
    var k = s.t / s.max, a = 1 - k;
    ctx.save();
    ctx.lineCap = "round";
    for (var i = 0; i < 7; i++) {
      var ox = (i - 3) * s.r * 0.28, len = s.r * (1.2 + 0.4 * Math.sin(i * 2.3)) * (s.out ? 1 + k : 1.6 - k);
      ctx.strokeStyle = "rgba(255,240,170," + (0.85 * a) + ")"; ctx.lineWidth = i % 2 ? 2 : 3;
      ctx.beginPath(); ctx.moveTo(s.x + ox, s.y - len); ctx.lineTo(s.x + ox, s.y + len * 0.5); ctx.stroke();
    }
    ctx.globalAlpha = 0.5 * a;
    ctx.fillStyle = "#fff6c8";
    ctx.beginPath(); ctx.ellipse(s.x, s.y, s.r * (s.out ? 0.3 + k : 1.2 - k) * 0.6, s.r * 1.3, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  });
  balls.forEach(function (b) {
    if (!itShotOn(b) || !b.alive) return;
    var m = b.igbb, r = b.r, size = (b.char.punch.size || 15) * 1.3;
    var ext = m.phase === "appear" ? -0.3 * Math.min(1, m.t / IT_APPEAR) : m.phase === "hit" ? 1 : 1 - Math.min(1, m.t / IT_RECOVER) * 0.8;
    var sx = b.x + m.dy * r * 0.5, sy = b.y - m.dx * r * 0.5;
    var gx = b.x + m.dx * r * (0.9 + 0.75 * ext), gy = b.y + m.dy * r * (0.9 + 0.75 * ext);
    if (m.phase !== "appear") {
      ctx.save(); ctx.strokeStyle = "rgba(255,240,170,0.8)"; ctx.lineWidth = 3; ctx.lineCap = "round";
      for (var i = -1; i <= 1; i++) {
        ctx.beginPath(); ctx.moveTo(gx - m.dx * r * 1.1 - m.dy * i * size * 0.6, gy - m.dy * r * 1.1 + m.dx * i * size * 0.6);
        ctx.lineTo(gx - m.dx * size - m.dy * i * size * 0.6, gy - m.dy * size + m.dx * i * size * 0.6); ctx.stroke();
      }
      ctx.restore();
    }
    strokeLimb(size * 0.6, armColor(b.char), function () { ctx.moveTo(sx, sy); ctx.lineTo(gx, gy); });
    ctx.fillStyle = gloveColor(b.char); ctx.strokeStyle = theme.wall; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(gx, gy, size * 0.8, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  });
}
