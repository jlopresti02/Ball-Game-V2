// The ladder finish to Josh Hokit's Chair Shot (Joe, 2026-11-11). After the
// chair goes into the crowd (chairshot.js), with them still out on their
// feet seeing stars:
//   toEdge   he runs to the nearest side of the cage
//   pull     and drags an aluminium stepladder out from under the ring
//   carry    runs it to the middle of the ring over his head
//   set      stands it up and spreads it open
//   climb    climbs it, as "watch out, watch out, watch out" starts
//   top      on the top step, pumping his fists while a red circle closes
//            in on them
//   leap     dives off it in a big arc
//   down     body slam: ladder.slamDamage and the crowd goes wild again
//   celebrate  his lap of the ring (chairshot.js), fists pumping
//   fetch2   runs back to the ladder and folds it up
//   windup   ladder cocked over his head, aimed at them
//   thrown   hurls it at them: ladder.throwDamage, then it clatters away
//   exit     runs to the nearest side of the cage
//   hopOut   vaults over it into the stands
//   away     gone into the crowd for a moment (they come round)
//   hopIn    vaults back in, and the fight carries on
// It's all on his `igbb` (move "chairshot"), so he blocks everything and
// can't be grabbed (grapple-duel.js) until he's back in. The "watch out"
// clip is timed so the slam lands on it (LADDER_LAND_AT).
"use strict";

var LADDER_EDGE_SPEED = 760;   // running for the ladder (and back out of the ring)
var LADDER_PULL_TIME = 0.6;    // dragging it out from under the ring
var LADDER_CARRY_SPEED = 620;  // running it to the middle
var LADDER_SET_TIME = 0.5;     // standing it up
var LADDER_CLIMB_TIME = 1.0;   // up the steps
var LADDER_LEAP_TIME = 0.6;    // the dive
var LADDER_LAND_AT = 3.75;     // seconds into the clip that the slam lands
var LADDER_DOWN_TIME = 0.8;    // flat on them, then back up
var LADDER_FOLD_TIME = 0.35;   // folding it up and lifting it
var LADDER_WINDUP_TIME = 0.4;  // cocked over his head
var LADDER_THROW_SPEED = 950;
var LADDER_HOP_TIME = 0.5;     // over the cage (each way)
var LADDER_AWAY_TIME = 1.3;    // out in the crowd
var LADDER_ARC = 150;          // how high the dive goes
// "Watch out!" calls in the clip, in seconds from its start.
var LADDER_CALLS = [0.15, 1.6, 2.9];
var ladderStand = null;        // the ladder standing in the ring { x, y, t, open }
var ladderDebris = [];         // the thrown ladder, tumbling and clattering away

function resetLadder() { ladderStand = null; ladderDebris = []; }
function ladderOn(b) { return !!(b && b.igbb && b.igbb.move === "chairshot" && b.igbb.ladder); }
// Up off the mat (climbing, up top, diving, over the cage or out in the
// crowd): drawn on his own by drawLadderSky, not with the other fighters.
function ladderDrawnApart(b) {
  if (!ladderOn(b)) return false;
  var p = b.igbb.phase;
  return p === "climb" || p === "top" || p === "leap" || p === "hopOut" || p === "away" || p === "hopIn";
}
function ladderHeight(b) { return b.r * 2.5; }
function ladderBase() { return { x: W / 2, y: H / 2 }; }

// From updateChairShot once the chair's gone into the crowd.
function startLadder(self, other, m) {
  m.ladder = true;
  m.phase = "toEdge"; m.t = 0;
  // The nearest side of the cage, straight out from where he is.
  var dl = self.x, dr = W - self.x, dtop = self.y, dbot = H - self.y, near = Math.min(dl, dr, dtop, dbot);
  m.ex = near === dl ? -1 : near === dr ? 1 : 0; m.ey = m.ex ? 0 : (near === dtop ? -1 : 1);
  m.gx = m.ex < 0 ? self.r : m.ex > 0 ? W - self.r : self.x;
  m.gy = m.ey < 0 ? self.r : m.ey > 0 ? H - self.r : self.y;
  endChairFrenzy(); // the crowd settles while he goes looking for something
  floater(self.x, self.y - self.r - 30, "HE'S NOT DONE!", "note");
  crowdReact(0.6);
}

// Moves him toward (tx, ty) at `speed`. True once he's there.
function ladderRunTo(self, tx, ty, speed, dt) {
  var dx = tx - self.x, dy = ty - self.y, d = Math.sqrt(dx * dx + dy * dy), step = speed * dt;
  if (d <= step) { self.x = tx; self.y = ty; return true; }
  self.x += dx / d * step; self.y += dy / d * step;
  if (!reduceMotion) particles.push({ x: self.x, y: self.y, vx: 0, vy: 0, life: 0.18, max: 0.18, size: self.r * 0.45, color: self.char.color });
  return false;
}

// One frame of the ladder finish. True while it's still going.
function updateLadder(self, other, m, sp, dt) {
  var L = sp.ladder, base = ladderBase(), lh = ladderHeight(self);
  self.vx = 0; self.vy = 0;
  var gone = m.phase === "hopOut" || m.phase === "away" || m.phase === "hopIn";
  if (other.alive && !gone) { other.dazed = true; other.vx = 0; other.vy = 0; } // seeing stars until he's gone
  if (m.phase === "toEdge") {
    if (ladderRunTo(self, m.gx, m.gy, LADDER_EDGE_SPEED, dt)) { m.phase = "pull"; m.t = 0; playWhoosh(); floater(self.x, self.y - self.r - 30, "A LADDER?!", "crit"); crowdReact(1); }
    return true;
  }
  if (m.phase === "pull") {
    if (m.t >= LADDER_PULL_TIME) { m.phase = "carry"; m.t = 0; }
    return true;
  }
  if (m.phase === "carry") {
    if (ladderRunTo(self, base.x - self.r * 1.15, base.y, LADDER_CARRY_SPEED, dt)) { // stands beside the spot
      m.phase = "set"; m.t = 0;
      ladderStand = { x: base.x, y: base.y, t: 0 };
      playSlam(); // the feet banging down on the mat
      if (!reduceMotion) shake = Math.max(shake, 6);
    }
    return true;
  }
  if (m.phase === "set") {
    if (m.t >= LADDER_SET_TIME) {
      m.phase = "climb"; m.t = 0; m.z = 0;
      m.clipAt = 0; // the clip's clock (game time, so it stays in step)
      playLadderCall();
      m.calls = 0;
    }
    return true;
  }
  if (m.phase === "climb" || m.phase === "top" || m.phase === "leap") {
    m.clipAt += dt;
    while (m.calls < LADDER_CALLS.length && m.clipAt >= LADDER_CALLS[m.calls]) {
      floater(base.x, base.y - lh - self.r * 2 - 10, "WATCH OUT!", "crit");
      m.calls++;
    }
  }
  if (m.phase === "climb") {
    self.x = base.x - self.r * 1.15 * Math.max(0, 1 - m.t / 0.25); self.y = base.y; // steps onto it
    m.z = lh * ease(m.t / LADDER_CLIMB_TIME);
    if (m.t >= LADDER_CLIMB_TIME) {
      m.phase = "top"; m.t = 0; m.z = lh;
      m.cx = other.x; m.cy = other.y; m.R = Math.max(70, other.r * 1.6);
      crowdReact(1);
    }
    return true;
  }
  if (m.phase === "top") {
    self.x = base.x; self.y = base.y;
    if (other.alive) { m.cx = other.x; m.cy = other.y; }
    if (m.clipAt >= LADDER_LAND_AT - LADDER_LEAP_TIME) { m.phase = "leap"; m.t = 0; m.fx = base.x; m.fy = base.y; playDuckFall(); }
    return true;
  }
  if (m.phase === "leap") {
    if (other.alive) { m.cx = other.x; m.cy = other.y; }
    var k = Math.min(1, m.t / LADDER_LEAP_TIME);
    self.x = m.fx + (m.cx - m.fx) * k; self.y = m.fy + (m.cy - m.fy) * k;
    m.z = lh * (1 - k) + LADDER_ARC * 4 * k * (1 - k);
    if (k >= 1) {
      m.z = 0;
      // Lands on top of them, then rolls off to the side.
      var ax = self.x - base.x, ay = self.y - base.y, al = Math.sqrt(ax * ax + ay * ay) || 1;
      m.offX = ax / al; m.offY = ay / al;
      ladderSlam(self, other, L, m);
      m.phase = "down"; m.t = 0;
      if (!other.alive) { endChairShot(self, other); return false; }
    }
    return true;
  }
  if (m.phase === "down") {
    self.x = m.cx + m.offX * 2; self.y = m.cy + m.offY * 2;
    if (m.t < LADDER_DOWN_TIME * 0.6) self.squash = { t: 0.2, max: 0.3, nx: 0, ny: 1 };
    if (m.t >= LADDER_DOWN_TIME) {
      // Off them and up, into the lap.
      var gap = self.r + other.r + 4;
      self.x = Math.min(W - self.r, Math.max(self.r, other.x - m.offX * gap));
      self.y = Math.min(H - self.r, Math.max(self.r, other.y - m.offY * gap));
      m.phase = "celebrate"; m.t = 0;
      m.lapA = Math.atan2(self.y - H / 2, self.x - W / 2);
      m.lapDir = Math.random() < 0.5 ? -1 : 1;
      m.bumped = false;
    }
    return true;
  }
  if (m.phase === "fetch2") {
    if (ladderRunTo(self, base.x, base.y + self.r * 0.2, LADDER_EDGE_SPEED, dt)) {
      if (m.fold == null) { m.fold = 0; ladderStand = null; playWhoosh(); }
    }
    if (m.fold != null) {
      m.fold += dt;
      if (m.fold >= LADDER_FOLD_TIME) { m.phase = "windup"; m.t = 0; }
    }
    return true;
  }
  if (m.phase === "windup") {
    var dx = other.x - self.x, dy = other.y - self.y, d = Math.sqrt(dx * dx + dy * dy) || 1;
    m.nx = dx / d; m.ny = dy / d;
    if (m.t >= LADDER_WINDUP_TIME) {
      throwLadder(self, other, L, m);
      m.phase = "thrown"; m.t = 0;
    }
    return true;
  }
  if (m.phase === "thrown") {
    // Waits for it to hit them.
    if (ladderDebris.some(function (l) { return l.flying; }) && m.t < 1.5) return true;
    if (!other.alive) { endChairShot(self, other); return false; }
    m.phase = "exit"; m.t = 0;
    var el = self.x, er = W - self.x;
    m.ex = el < er ? -1 : 1; m.ey = 0; // out through a side, into the stands
    m.gx = m.ex < 0 ? self.r : W - self.r; m.gy = self.y;
    floater(self.x, self.y - self.r - 30, "SEE YA!", "note");
    return true;
  }
  if (m.phase === "exit") {
    if (ladderRunTo(self, m.gx, m.gy, LADDER_EDGE_SPEED, dt)) { m.phase = "hopOut"; m.t = 0; m.hx = self.x; m.hy = self.y; playWhoosh(); }
    return true;
  }
  if (m.phase === "hopOut" || m.phase === "hopIn") {
    var hk = Math.min(1, m.t / LADDER_HOP_TIME), out = self.r * 3.2;
    var from = m.phase === "hopOut" ? 0 : 1, to = 1 - from, p = from + (to - from) * hk;
    self.x = m.hx + m.ex * out * p; self.y = m.hy;
    m.z = Math.sin(Math.PI * hk) * self.r * 1.6;
    if (hk < 1) return true;
    m.z = 0;
    if (m.phase === "hopOut") {
      m.phase = "away"; m.t = 0;
      // Out of sight: they come round.
      if (other.alive) { other.dazed = false; setSpeed(other, (other.baseSpeed || SPEED) * 0.6); }
      crowdReact(1);
      return true;
    }
    self.x = m.hx; self.y = m.hy;
    endChairShot(self, other);
    return false;
  }
  if (m.phase === "away") {
    if (m.t >= LADDER_AWAY_TIME) { m.phase = "hopIn"; m.t = 0; playWhoosh(); floater(m.hx, m.hy - self.r - 30, "HE'S BACK!", "note"); }
    return true;
  }
  return false;
}

function ladderSlam(self, other, L, m) {
  self.squash = { t: 0.3, max: 0.3, nx: 0, ny: 1 };
  trCrater = { x: m.cx, y: m.cy, R: m.R, t: 0 }; // the dent in the mat (hokit-toprope.js)
  if (!reduceMotion) { shake = Math.max(shake, 36); hitStop = Math.max(hitStop, 0.16); }
  impacts.push({ x: m.cx, y: m.cy, nx: 0, ny: -1, life: 0.6, max: 0.6, color: "#ffffff" });
  for (var i = 0; i < 34 && !reduceMotion; i++) {
    var a = i / 34 * Math.PI * 2, s = 260 + Math.random() * 220;
    particles.push({ x: m.cx + Math.cos(a) * self.r, y: m.cy + Math.sin(a) * self.r * 0.6, vx: Math.cos(a) * s, vy: Math.sin(a) * s * 0.6, life: 0.6, max: 0.6, size: 3 + Math.random() * 4, color: i % 3 ? "#d8cdb5" : "#ffffff" });
  }
  playDuckLand(); playSlam();
  startChairFrenzy(); // the crowd goes wild again
  if (!other.alive) return;
  hurt(other, L.slamDamage, "igbb", self.id); // can't be slipped or blocked
  other.flash = 0.2;
  other.squash = { t: 0.4, max: 0.4, nx: 0, ny: -1 };
  floater(other.x, other.y - other.r - 40, "BODY SLAM!", "crit");
  checkEnd();
}

// Hurls the folded ladder at them, end over end.
function throwLadder(self, other, L, m) {
  var h = ladderHeld(self, m);
  ladderDebris.push({ x: h.x, y: h.y, a: h.a, va: 14 * (m.nx >= 0 ? 1 : -1), vx: 0, vy: 0, t: 0, flying: true, targetId: other.id, dmg: L.throwDamage, from: self.id, size: self.r, alpha: 1 });
  floater(self.x, self.y - self.r - 30, "LADDER!", "crit");
  playWhoosh(); playWhoosh();
}

function tickLadder(dt) {
  if (ladderStand) ladderStand.t += dt;
  ladderDebris.forEach(function (l) {
    l.t += dt; l.a += l.va * dt;
    if (l.flying) {
      var o = balls[l.targetId], tx = o.x, ty = o.y - o.r * 0.3;
      var dx = tx - l.x, dy = ty - l.y, d = Math.sqrt(dx * dx + dy * dy), step = LADDER_THROW_SPEED * dt;
      if (d <= step + o.r * 0.6 || l.t > 1.4) {
        l.flying = false; l.t = 0;
        var nx = d ? dx / d : 1, ny = d ? dy / d : 0;
        l.vx = -nx * 260 + (Math.random() - 0.5) * 120; l.vy = -ny * 200 - 160; l.va *= -0.6;
        if (o.alive) {
          hurt(o, l.dmg, "igbb", l.from);
          o.flash = 0.18;
          o.squash = { t: 0.25, max: 0.25, nx: nx, ny: ny };
          floater(o.x, o.y - o.r - 40, "CLANG!", "crit");
          checkEnd();
        }
        playChairShot(); playSlam(); crowdReact(1);
        if (!reduceMotion) shake = Math.max(shake, 22);
        impacts.push({ x: o.x, y: o.y - o.r * 0.3, nx: -nx, ny: -ny, life: 0.45, max: 0.45, color: "#ffffff" });
        igbbSparks(o.x, o.y - o.r * 0.3, -nx, -ny, "#d7dbe2", 26, 600);
      } else { l.x += dx / d * step; l.y += dy / d * step; }
    } else {
      // Clattering away: bounces once off the mat, then fades.
      l.x += l.vx * dt; l.y += l.vy * dt; l.vy += 900 * dt; l.vx *= 0.98; l.va *= 0.98;
      if (l.t > 0.35 && l.vy > 0 && !l.bounced) { l.bounced = true; l.vy = -l.vy * 0.35; playBounce(); }
      l.alpha = Math.max(0, 1 - Math.max(0, l.t - 0.5) / 0.5);
    }
  });
  ladderDebris = ladderDebris.filter(function (l) { return l.flying || l.alpha > 0; });
}

// The "watch out, watch out, watch out" call (Joe's clip). Cuts in on the
// talk channel so it's never skipped.
function playLadderCall() {
  try {
    var ctx = getAudioCtx();
    if (!ctx) return;
    if (ctx.state === "suspended") ctx.resume();
    if (!clipBuffers.ladderWatchOut) { withClip("ladderWatchOut", function () { cutInTalk("ladderWatchOut", 0.9); }); return; }
    cutInTalk("ladderWatchOut", 0.9);
  } catch (e) { /* never let audio break the game */ }
}

// ---------------------------------------------------------------- drawing

// An aluminium stepladder, side on, standing with its feet at (x, y) (like
// Joe's reference photo): front rails with flat treads, a top cap, the back
// legs splayed out behind with cross braces, black rubber feet. `open` 0..1
// spreads the back legs out as it's stood up; `h` is its height.
function drawStepLadder(x, y, h, open, alpha) {
  var w = h * 0.34, spread = h * 0.42 * open;
  ctx.save();
  ctx.globalAlpha = alpha == null ? 1 : alpha;
  ctx.translate(x, y);
  ctx.lineCap = "round"; ctx.lineJoin = "round";
  var rail = Math.max(2.5, h * 0.035);
  var topY = -h, topW = w * 0.62;
  // Back legs (behind, darker), splayed back to the right.
  var bx0 = topW * 0.5, bx1 = w * 0.5 + spread;
  ctx.strokeStyle = "#7d828a"; ctx.lineWidth = rail;
  ctx.beginPath();
  ctx.moveTo(bx0 - topW * 0.15, topY + h * 0.03); ctx.lineTo(bx1 - w * 0.25, -h * 0.02);
  ctx.moveTo(bx0 + topW * 0.05, topY + h * 0.03); ctx.lineTo(bx1 + w * 0.1, 0);
  ctx.stroke();
  ctx.lineWidth = rail * 0.6; // cross braces on the back legs
  ctx.beginPath();
  ctx.moveTo(bx0 - topW * 0.05, topY + h * 0.25); ctx.lineTo(bx1 - w * 0.08, -h * 0.35);
  ctx.moveTo(bx0 + w * 0.02 + spread * 0.55, -h * 0.4); ctx.lineTo(bx1 - w * 0.12, -h * 0.12);
  ctx.stroke();
  // Spreader bar, front to back, halfway down.
  if (open > 0.3) {
    ctx.strokeStyle = "#a9aeb5"; ctx.lineWidth = rail * 0.5;
    ctx.beginPath(); ctx.moveTo(w * 0.3, -h * 0.42); ctx.lineTo(w * 0.32 + spread * 0.6, -h * 0.42); ctx.stroke();
  }
  // Front rails, closer together at the top.
  var fl = function (u) { return -w / 2 + (w / 2 - topW / 2) * u; }, fr = function (u) { return w / 2 - (w / 2 - topW / 2) * u; };
  [["#4a4e55", rail * 1.6], ["#c9cdd3", rail]].forEach(function (st) {
    ctx.strokeStyle = st[0]; ctx.lineWidth = st[1];
    ctx.beginPath();
    ctx.moveTo(fl(0), 0); ctx.lineTo(fl(1), topY);
    ctx.moveTo(fr(0), 0); ctx.lineTo(fr(1), topY);
    ctx.stroke();
  });
  // Seven flat treads.
  for (var i = 1; i <= 7; i++) {
    var u = i / 8, ty = -h * u;
    ctx.fillStyle = "#b7bcc3"; ctx.strokeStyle = "#5c6168"; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.rect(fl(u), ty - h * 0.018, fr(u) - fl(u), h * 0.036); ctx.fill(); ctx.stroke();
  }
  // Top cap.
  ctx.fillStyle = "#d4d8dd"; ctx.strokeStyle = "#5c6168"; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.rect(-topW * 0.62, topY - h * 0.045, topW * 1.3 + spread * 0.25, h * 0.05); ctx.fill(); ctx.stroke();
  // Rubber feet.
  ctx.fillStyle = "#15171a";
  [fl(0), fr(0), bx1 - w * 0.25, bx1 + w * 0.1].forEach(function (fx, j) {
    ctx.fillRect(fx - rail * 0.9, (j > 1 ? (j === 2 ? -h * 0.02 : 0) : 0) - rail * 0.5, rail * 1.8, rail * 1.1);
  });
  ctx.restore();
}

// The ladder folded flat (carried or thrown): two rails with the treads
// between them, `len` long, centred on (x, y), turned `a`.
function drawFoldedLadder(x, y, len, a, alpha) {
  var w = len * 0.2;
  ctx.save();
  ctx.globalAlpha = alpha == null ? 1 : alpha;
  ctx.translate(x, y); ctx.rotate(a || 0);
  ctx.lineCap = "round";
  var rail = Math.max(2.5, len * 0.035);
  for (var i = 1; i <= 7; i++) {
    var u = -len / 2 + len * i / 8;
    ctx.fillStyle = "#b7bcc3"; ctx.strokeStyle = "#5c6168"; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.rect(u - len * 0.018, -w / 2, len * 0.036, w); ctx.fill(); ctx.stroke();
  }
  [["#4a4e55", rail * 1.6], ["#c9cdd3", rail]].forEach(function (st) {
    ctx.strokeStyle = st[0]; ctx.lineWidth = st[1];
    ctx.beginPath();
    ctx.moveTo(-len / 2, -w / 2); ctx.lineTo(len / 2, -w / 2);
    ctx.moveTo(-len / 2, w / 2); ctx.lineTo(len / 2, w / 2);
    ctx.stroke();
  });
  ctx.fillStyle = "#15171a";
  ctx.fillRect(-len / 2 - rail, -w / 2 - rail, rail * 1.6, rail * 2); ctx.fillRect(-len / 2 - rail, w / 2 - rail, rail * 1.6, rail * 2);
  ctx.restore();
}

// Where the folded ladder is when he's got hold of it.
function ladderHeld(b, m) {
  var len = ladderHeight(b) * 1.05;
  if (m.phase === "pull") {
    // Sliding out from under the ring toward him, then up over his head.
    var k = Math.min(1, m.t / LADDER_PULL_TIME), kk = ease(k);
    var sx = b.x + m.ex * b.r * (1.6 - 1.6 * kk), sy = b.y + m.ey * b.r * (1.6 - 1.6 * kk) + b.r * 0.6 * (1 - kk) - b.r * 1.3 * kk;
    return { x: sx, y: sy, a: m.ey ? Math.PI / 2 * (1 - kk) : 0, len: len, alpha: Math.min(1, k * 3) };
  }
  if (m.phase === "windup") {
    // Cocked back over his head, away from them, shaking with the effort.
    var wk = easeOut(Math.min(1, m.t / LADDER_WINDUP_TIME)), shk = reduceMotion ? 0 : wk * b.r * 0.05;
    return { x: b.x - m.nx * b.r * 0.9 * wk + (Math.random() - 0.5) * shk, y: b.y - b.r * 1.35 - m.ny * b.r * 0.5 * wk + (Math.random() - 0.5) * shk, a: -(m.nx >= 0 ? 1 : -1) * 0.6 * wk, len: len };
  }
  if (m.phase === "fetch2") {
    var fk = m.fold == null ? 0 : ease(m.fold / LADDER_FOLD_TIME);
    return { x: b.x, y: b.y - b.r * 1.35 * fk + b.r * 0.2 * (1 - fk), a: 0, len: len, alpha: m.fold == null ? 0 : 1 };
  }
  return { x: b.x, y: b.y - b.r * 1.35, a: 0, len: len }; // carried over his head
}

// Under the fighters: the standing ladder (the one in the middle of the
// ring), the red circle on them while he's up top, his shadow when he's up.
function drawLadderUnder() {
  balls.forEach(function (b) {
    var m = b.igbb;
    if (!ladderOn(b) || !b.alive) return;
    if ((m.phase === "top" || m.phase === "leap") && m.cx != null) {
      var cfgWarn = LADDER_LAND_AT - LADDER_LEAP_TIME - LADDER_CLIMB_TIME;
      var k = m.phase === "top" ? Math.min(1, m.t / Math.max(0.5, cfgWarn)) : 1, pulse = 0.5 + 0.5 * Math.sin(performance.now() / 90);
      ctx.save();
      ctx.translate(m.cx, m.cy);
      ctx.fillStyle = "rgba(224,34,27," + (0.14 + 0.1 * pulse) + ")";
      ctx.beginPath(); ctx.arc(0, 0, m.R, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "rgba(224,34,27,0.28)";
      ctx.beginPath(); ctx.arc(0, 0, m.R * k, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "#e0221b"; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.arc(0, 0, m.R, 0, Math.PI * 2); ctx.stroke();
      ctx.restore();
    }
    if (ladderDrawnApart(b) && m.phase !== "away") {
      var z = m.z || 0, s = Math.max(0.35, 1 - z / 300);
      ctx.save();
      ctx.fillStyle = "rgba(0,0,0," + (0.3 * s) + ")";
      ctx.beginPath(); ctx.ellipse(b.x, b.y + b.r * 0.85, b.r * s, b.r * 0.3 * s, 0, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }
  });
  if (ladderStand) {
    var hb = balls.filter(ladderOn)[0], r = hb ? hb.r : RADIUS;
    var open = ease(Math.min(1, ladderStand.t / (LADDER_SET_TIME * 0.8)));
    ctx.save();
    ctx.fillStyle = "rgba(0,0,0,0.18)";
    ctx.beginPath(); ctx.ellipse(ladderStand.x + r * 0.2, ladderStand.y + r * 0.88, r * 0.9, r * 0.22, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    // Swung up from lying flat: it grows up off the mat as it's stood up.
    var rise = 0.35 + 0.65 * open;
    ctx.save();
    ctx.translate(ladderStand.x, ladderStand.y + r * 0.85); ctx.scale(1, rise); ctx.translate(-ladderStand.x, -(ladderStand.y + r * 0.85));
    drawStepLadder(ladderStand.x, ladderStand.y + r * 0.85, ladderHeight({ r: r }), open, 1);
    ctx.restore();
  }
}

// Him with the folded ladder over his head (pulling it out, carrying it,
// folding it up and winding up to throw). From drawChairShot.
function drawLadderCarry(b) {
  var m = b.igbb;
  if (!ladderOn(b)) return false;
  if (m.phase === "celebrate") return false; // fists up (drawChairShot)
  if (m.phase !== "pull" && m.phase !== "carry" && m.phase !== "fetch2" && m.phase !== "windup") {
    if (m.phase === "set" || m.phase === "toEdge" || m.phase === "down" || m.phase === "exit" || m.phase === "thrown") drawLadderArms(b, m);
    return true;
  }
  var h = ladderHeld(b, m), size = b.char.punch.size || 13;
  if (h.alpha === 0) { drawLadderArms(b, m); return true; }
  var grip = [-1, 1].map(function (k) { return { x: h.x + Math.cos(h.a) * k * h.len * 0.22, y: h.y + Math.sin(h.a) * k * h.len * 0.22 }; });
  grip.forEach(function (g, i) {
    var sh = { x: b.x + (i ? 1 : -1) * b.r * 0.6, y: b.y - b.r * 0.25 };
    strokeLimb(size * 0.75, armColor(b.char), function () { ctx.moveTo(sh.x, sh.y); ctx.lineTo(g.x, g.y); });
  });
  drawFoldedLadder(h.x, h.y, h.len, h.a, h.alpha);
  grip.forEach(function (g) { drawGloveAt(g.x, g.y, size * 0.85, b.char); });
  return true;
}
// His own two arms when his hands are empty during the finish: pumping
// while he runs, out wide setting it up, follow-through after the throw.
function drawLadderArms(b, m) {
  var size = b.char.punch.size || 13;
  [-1, 1].forEach(function (k, i) {
    var sh = { x: b.x + k * b.r * 0.62, y: b.y - b.r * 0.3 }, hand;
    if (m.phase === "set") hand = { x: b.x + k * b.r * 0.7, y: b.y - b.r * 1.0 };
    else if (m.phase === "thrown") hand = { x: b.x + m.nx * b.r * 1.3 + k * b.r * 0.35, y: b.y + m.ny * b.r * 1.3 - b.r * 0.3 };
    else { var sw = Math.sin(m.t * 16 + i * Math.PI) * b.r * 0.3; hand = { x: b.x + k * b.r * 0.95, y: b.y - b.r * 0.2 + sw }; }
    strokeLimb(size * 0.75, armColor(b.char), function () { ctx.moveTo(sh.x, sh.y); ctx.lineTo(hand.x, hand.y); });
    drawGloveAt(hand.x, hand.y, size * 0.85, b.char);
  });
}

// The thrown ladder tumbling and clattering away. From draw().
function drawLadderDebris() {
  ladderDebris.forEach(function (l) { drawFoldedLadder(l.x, l.y, ladderHeight({ r: l.size }) * 1.05, l.a, l.alpha); });
}

// Him up the ladder, diving off it, and vaulting the cage: drawn after the
// stands and jumbotron so he's never hidden behind them. From draw().
function drawLadderSky(scl, ox, oy) {
  balls.forEach(function (b) {
    if (!ladderDrawnApart(b) || !b.alive || b.igbb.phase === "away") return;
    var m = b.igbb, ch = b.char, r = b.r, z = m.z || 0;
    var bx = b.x, by = b.y - z, sc = 1 + z / 520;
    ctx.save();
    ctx.setTransform(scl, 0, 0, scl, ox, oy);
    var arm = (ch.punch.size || 15) * 0.75, gr = r * 0.24;
    var face = (m.cx != null ? m.cx : W / 2) >= bx ? 1 : -1;
    var lk = m.phase === "leap" ? Math.min(1, m.t / LADDER_LEAP_TIME) : 0;
    ctx.save();
    ctx.translate(bx, by); ctx.scale(sc, sc);
    if (m.phase === "leap") { var flat = ease(Math.min(1, lk / 0.6)); ctx.rotate(face * 0.25 * flat); ctx.scale(1 + 0.12 * flat, 1 - 0.14 * flat); }
    ctx.translate(-bx, -by);
    var pump = Math.sin(performance.now() / 120);
    [-1, 1].forEach(function (sd) {
      var sx = bx + sd * r * 0.62, sy = by - r * 0.15, hx, hy;
      if (m.phase === "climb") { hx = bx + sd * r * 0.55; hy = by - r * (0.9 + 0.35 * Math.max(0, Math.sin(m.t * 14 + (sd > 0 ? Math.PI : 0)))); }
      else if (m.phase === "top") { var up = sd > 0 ? Math.max(0, pump) : Math.max(0, -pump); hx = bx + sd * r * 1.05; hy = by - r * (0.7 + 0.6 * up); }
      else if (m.phase === "leap") { var sp = ease(Math.min(1, lk / 0.5)); hx = bx + sd * r * (0.9 + 0.7 * sp); hy = by - r * (0.9 - 0.9 * sp); }
      else { hx = bx + sd * r * 0.9; hy = by - r * 1.1; } // over the cage, arms up
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
