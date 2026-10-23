// Special moves for created (roster) characters.
//
// A special has a bar that charges over time (like CTE Rejuvenation) and
// fills faster with every clean hit the fighter lands. When it's full the
// move goes off.
//
// IGBB: grabs the opponent with one hand and throws them into a corner,
// then unloads a flurry of fast, heavy punches while they shell up. If they
// survive, the fighter backs away with its guard up, blocking everything.
"use strict";

var SPECIAL_MOVES = { igbb: "IGBB" };

var IGBB_CLOSE_SPEED = 820;   // dash in to grab
var IGBB_CLOSE_GIVEUP = 3;
var IGBB_GRAB_TIME = 0.16;    // one hand locks on
var IGBB_THROW_TIME = 0.28;   // flight into the corner
var IGBB_STEP_SPEED = 1100;   // steps in after the throw
var IGBB_PUNCH_GAP = 0.24;    // average time per punch in the flurry
var IGBB_RETREAT_TIME = 1.2;  // backing away, guard up
var IGBB_RETREAT_SPEED = 210;

function specialName(ch) { return SPECIAL_MOVES[ch.special && ch.special.move] || "Special"; }

// Every clean hit the fighter lands knocks some time off the charge.
function addSpecialCharge(b) {
  if (!b || !b.char.hasSpecial || b.igbb) return;
  var sp = b.char.special;
  b.specialT = Math.min(sp.chargeTime, (b.specialT || 0) + sp.hitCut);
}

function tickSpecialCharge(b, dt) {
  if (!b.char.hasSpecial || !b.alive || b.igbb || !started || over) return;
  b.specialT = Math.min(b.char.special.chargeTime, (b.specialT || 0) + dt);
}

// Busy with something that shouldn't be interrupted.
function specialBusy(b) {
  return b.grapple || b.grappled || b.slam || b.sprawl || b.sprawled || b.combo || b.taunt || b.flow ||
    b.koRush || b.shocked || b.koOut || b.koDuel || b.checkStun > 0 || b.checkAnim || b.igbb || b.shelled;
}
function canStartIgbb(self, other) {
  if (!other.alive || other.invincible || specialBusy(self) || specialBusy(other)) return false;
  // Lets its own attack in progress finish first.
  if (self.punch || self.kick || self.swing || self.throwAnim || self.powerState || self.rageState || self.watcherState) return false;
  return true;
}

// Drops whatever a fighter was in the middle of.
function clearActions(b) {
  b.punch = null; b.kick = null; b.swing = null; b.throwAnim = null; b.jabAnim = null;
  b.powerState = null; b.rageState = null; b.watcherState = null; b.invincible = false;
  b.flow = null; b.taunt = null; b.combo = null; b.checkAnim = null; b.checkStun = 0; b.knockFly = 0;
}

// The corner the opponent gets thrown into: the one lying most in the
// direction of the throw (away from the thrower).
function throwCorner(thrower, b) {
  var tx = b.x - thrower.x, ty = b.y - thrower.y, tl = Math.sqrt(tx * tx + ty * ty) || 1;
  var best = null, bestScore = -Infinity;
  [[b.r + 2, b.r + 2], [W - b.r - 2, b.r + 2], [b.r + 2, H - b.r - 2], [W - b.r - 2, H - b.r - 2]].forEach(function (c) {
    var cx = c[0] - b.x, cy = c[1] - b.y, cl = Math.sqrt(cx * cx + cy * cy) || 1;
    var score = (cx * tx + cy * ty) / (cl * tl) - cl / (W * 4);
    if (score > bestScore) { bestScore = score; best = { x: c[0], y: c[1] }; }
  });
  return best;
}

// Runs for the special's owner each frame. Returns true while the move is
// running (the fighter does nothing else).
function updateSpecial(self, other, dt) {
  if (!self.char.hasSpecial || self.char.special.move !== "igbb") return false;
  var sp = self.char.special;
  if (!self.igbb) {
    if (self.specialT < sp.chargeTime || !canStartIgbb(self, other)) return false;
    self.igbb = { phase: "close", t: 0 };
    floater(self.x, self.y - self.r - 26, "IGBB!", "crit");
    playWhoosh();
  }
  var m = self.igbb;
  m.t += dt;
  var dx = other.x - self.x, dy = other.y - self.y, d = Math.sqrt(dx * dx + dy * dy) || 1;

  if (m.phase === "close") {
    // Called off (opponent became untouchable or got busy): stays charged.
    if (!other.alive || other.invincible || specialBusy(other) || m.t > IGBB_CLOSE_GIVEUP) {
      self.igbb = null;
      return false;
    }
    if (d < self.r + other.r + 10) {
      clearActions(other);
      other.shelled = true; other.vx = 0; other.vy = 0;
      // Yanked in by the collar.
      other.squash = { t: 0.14, max: 0.14, nx: -dx / d, ny: -dy / d };
      other.flash = 0.12;
      if (!reduceMotion) shake = Math.max(shake, 5);
      self.vx = 0; self.vy = 0;
      m.phase = "grab"; m.t = 0;
    } else {
      self.vx = dx / d * IGBB_CLOSE_SPEED; self.vy = dy / d * IGBB_CLOSE_SPEED;
      if (!reduceMotion) particles.push({ x: self.x, y: self.y, vx: -self.vx * 0.1, vy: -self.vy * 0.1, life: 0.2, max: 0.2, size: self.r * 0.55, color: self.char.color });
    }
    return true;
  }

  self.vx = 0; self.vy = 0;
  if (m.phase === "grab") {
    if (m.t >= IGBB_GRAB_TIME) {
      var c = throwCorner(self, other);
      m.phase = "throw"; m.t = 0;
      m.sx = other.x; m.sy = other.y; m.ex = c.x; m.ey = c.y;
      playWhoosh();
    }
    return true;
  }
  if (m.phase === "throw") {
    var k = Math.min(1, m.t / IGBB_THROW_TIME), e = k * k; // speeds up into the corner
    other.x = m.sx + (m.ex - m.sx) * e; other.y = m.sy + (m.ey - m.sy) * e;
    if (!reduceMotion) {
      particles.push({ x: other.x, y: other.y, vx: 0, vy: 0, life: 0.3, max: 0.3, size: other.r * 0.85, color: self.char.color });
      // Speed lines streaking off behind them.
      var fdx = m.ex - m.sx, fdy = m.ey - m.sy, fl = Math.sqrt(fdx * fdx + fdy * fdy) || 1;
      particles.push({ x: other.x - fdx / fl * other.r + (Math.random() - 0.5) * other.r, y: other.y - fdy / fl * other.r + (Math.random() - 0.5) * other.r,
        vx: -fdx / fl * 260, vy: -fdy / fl * 260, life: 0.18, max: 0.18, size: 3, color: theme.ink });
    }
    if (k >= 1) {
      // Crashes into the corner.
      var nx = other.x < W / 2 ? 1 : -1, ny = other.y < H / 2 ? 1 : -1;
      other.squash = { t: 0.2, max: 0.2, nx: nx * 0.7071, ny: ny * 0.7071 };
      impacts.push({ x: other.x - nx * other.r * 0.7, y: other.y - ny * other.r * 0.7, nx: nx * 0.7071, ny: ny * 0.7071, life: 0.45, max: 0.45, color: self.char.color });
      impacts.push({ x: other.x - nx * other.r * 0.7, y: other.y - ny * other.r * 0.7, nx: nx * 0.7071, ny: ny * 0.7071, life: 0.7, max: 0.7, color: theme.hit });
      igbbSparks(other.x - nx * other.r * 0.7, other.y - ny * other.r * 0.7, nx * 0.7071, ny * 0.7071, self.char.color, 18, 420);
      other.flash = 0.16;
      hitStop = 0.16;
      if (!reduceMotion) shake = Math.max(shake, 20);
      playSlam(); playPunch(40);
      m.phase = "step"; m.t = 0;
      m.out = { x: nx * 0.7071, y: ny * 0.7071 }; // from the corner toward the middle
    }
    return true;
  }
  if (m.phase === "step") {
    // Steps right in front of the cornered opponent.
    var tx = other.x + m.out.x * (self.r + other.r + 8), ty = other.y + m.out.y * (self.r + other.r + 8);
    var sx = tx - self.x, sy = ty - self.y, sd = Math.sqrt(sx * sx + sy * sy);
    if (sd <= IGBB_STEP_SPEED * dt || sd < 1) {
      self.x = tx; self.y = ty;
      m.phase = "flurry"; m.t = 0; m.thrown = 0;
      m.times = flurrySchedule(sp.punches, Math.min(sp.shellTime, Math.max(0.9, sp.punches * IGBB_PUNCH_GAP)));
      floater(other.x, other.y - other.r - 30, "SHELLED UP", "note");
    } else {
      self.x += sx / sd * IGBB_STEP_SPEED * dt; self.y += sy / sd * IGBB_STEP_SPEED * dt;
    }
    return true;
  }
  if (m.phase === "flurry") {
    // Aggressive shuffle in front of them, the whole body driving into
    // each punch.
    var kp = self.koPunch;
    var lean = kp ? Math.max(0, Math.sin(Math.PI * Math.min(1, kp.t / kp.dur))) * 9 : 0;
    var gapIn = self.r + other.r + 8 - lean;
    self.x = other.x + m.out.x * gapIn + Math.sin(m.t * 23) * 2.5;
    self.y = other.y + m.out.y * gapIn + Math.cos(m.t * 19) * 2.5;
    if (kp) {
      kp.t += dt;
      if (!kp.hit && kp.t >= kp.hitAt) { kp.hit = true; landIgbbPunch(self, other, kp); }
      if (kp.t >= kp.dur) self.koPunch = null;
    }
    if (!other.alive) { endIgbb(self, other); checkEnd(); return false; }
    if (!self.koPunch && m.thrown < sp.punches && m.t >= m.times[m.thrown]) {
      var last = m.thrown === sp.punches - 1;
      var hook = last || Math.random() < 0.55;
      var side = m.thrown % 2 ? -1 : 1;
      var size = self.char.punch.size * (last ? 1.45 : 1.15);
      if (hook) {
        var sweep = last ? 0.16 : 0.1;
        self.koPunch = { t: 0, dur: sweep + 0.04, hitAt: sweep * QHOOK_OPEN / (QHOOK_OPEN + QHOOK_FOLLOW), sweep: sweep, hit: false,
          targetId: other.id, size: size, kind: "qhook", side: side, heavy: true, last: last };
      } else {
        self.koPunch = { t: 0, dur: 0.12, hitAt: 0.05, hit: false, targetId: other.id, size: size, kind: "jab", side: side, last: last };
      }
      m.thrown++;
    }
    // Done once every punch is thrown (the shell-up time is the most it can last).
    var done = m.thrown >= sp.punches && m.t >= m.times[m.times.length - 1] + 0.3;
    if ((done || m.t >= sp.shellTime) && !self.koPunch && m.thrown >= Math.min(sp.punches, m.times.length)) {
      // They survived it: back off behind a high guard.
      other.shelled = false;
      setSpeed(other, SPEED * 0.6);
      other.vx = m.out.x * SPEED * 0.6; other.vy = m.out.y * SPEED * 0.6;
      m.phase = "retreat"; m.t = 0;
    }
    return true;
  }
  if (m.phase === "retreat") {
    self.vx = -dx / d * IGBB_RETREAT_SPEED; self.vy = -dy / d * IGBB_RETREAT_SPEED;
    if (m.t >= IGBB_RETREAT_TIME) { endIgbb(self, other); setSpeed(self, SPEED); return false; }
    return true;
  }
  return false;
}

// Punch times spread across the shell-up, in a stuttering, aggressive rhythm.
function flurrySchedule(n, total) {
  // Quick bursts with short breaths in between.
  var gaps = [], sum = 0;
  for (var i = 0; i < n; i++) { var g = (i % 3 === 2) ? 1.6 + Math.random() * 0.6 : 0.6 + Math.random() * 0.5; gaps.push(g); sum += g; }
  var span = Math.max(0.4, total - 0.25), t = 0.08, times = [];
  for (var j = 0; j < n; j++) { times.push(t); t += gaps[j] / sum * span; }
  return times;
}

function landIgbbPunch(self, other, kp) {
  var dealt = hurt(other, self.char.special.damage, "igbb", self.id);
  if (dealt > 0) playPunch(dealt * (kp.last ? 3 : 1.8));
  // Smashed back into the corner behind the shell: the body caves in, a
  // shockwave and a spray of sparks fly off the contact point.
  var dx = other.x - self.x, dy = other.y - self.y, d = Math.sqrt(dx * dx + dy * dy) || 1;
  var ux = dx / d, uy = dy / d;
  var cx = other.x - ux * other.r, cy = other.y - uy * other.r;
  other.squash = { t: kp.last ? 0.22 : 0.14, max: kp.last ? 0.22 : 0.14, nx: -ux, ny: -uy };
  other.flash = 0.16;
  impacts.push({ x: cx, y: cy, nx: -ux, ny: -uy, life: kp.last ? 0.5 : 0.28, max: kp.last ? 0.5 : 0.28, color: kp.last ? theme.hit : self.char.color });
  igbbSparks(cx, cy, -ux, -uy, self.char.color, kp.last ? 22 : 9, kp.last ? 520 : 340);
  if (!reduceMotion) shake = Math.max(shake, kp.last ? 18 : 10);
  hitStop = Math.max(hitStop, kp.last ? 0.14 : 0.05);
  if (kp.last && other.alive) floater(other.x, other.y - other.r - 34, "IGBB!", "crit");
}

// Sparks spraying off a hit, out to the sides of (nx, ny).
function igbbSparks(x, y, nx, ny, color, n, speed) {
  if (reduceMotion) return;
  var base = Math.atan2(ny, nx);
  for (var i = 0; i < n; i++) {
    // Fanned out to both sides of the punch so they show around the attacker.
    var a = base + (i % 2 ? 1 : -1) * (1.1 + Math.random() * 0.9), sp = speed * (0.4 + Math.random() * 0.8);
    // Start just outside the two bodies so they aren't hidden under them.
    var off = RADIUS * (0.8 + Math.random() * 0.5);
    particles.push({ x: x + Math.cos(a) * off, y: y + Math.sin(a) * off, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 0.22 + Math.random() * 0.2, max: 0.42,
      size: 2 + Math.random() * 3.5, color: i % 3 === 0 ? "#ffffff" : (i % 3 === 1 ? theme.hit : color) });
  }
}

function endIgbb(self, other) {
  self.igbb = null;
  self.koPunch = null;
  self.specialT = 0;
  if (other) other.shelled = false;
}

// Blocks everything while the move is running (it's thrown them, then has
// its hands full or its guard up), except while still dashing in to grab.
// Positions are set by the move itself (no physics) while it has hold of them.
function igbbLocked(b) {
  return b.shelled || (b.igbb && b.igbb.phase !== "close" && b.igbb.phase !== "retreat");
}

function specialGuarding(b) {
  return b.igbb && b.igbb.phase !== "close";
}

// ---------------------------------------------------------------
// Drawing
// ---------------------------------------------------------------

// The one-handed grab and throw.
function drawSpecial(b) {
  var m = b.igbb;
  if (!m || !b.alive || (m.phase !== "grab" && m.phase !== "throw")) return;
  var o = balls[1 - b.id];
  var dx = o.x - b.x, dy = o.y - b.y, d = Math.sqrt(dx * dx + dy * dy) || 1;
  var nx = dx / d, ny = dy / d, px = -ny, py = nx, r = b.r;
  var sx = b.x + nx * (r - 2) + px * r * 0.4, sy = b.y + ny * (r - 2) + py * r * 0.4;
  // Hand on the opponent: gripping during the grab, then letting go at the
  // end of the throw with the arm fully extended toward the corner.
  var reach = m.phase === "grab" ? d - o.r * 0.6 : Math.min(d - o.r * 0.6, r + 46);
  var hx = b.x + nx * reach + px * r * 0.2, hy = b.y + ny * reach + py * r * 0.2;
  var size = b.char.punch.size || 15;
  ctx.save();
  ctx.lineCap = "round";
  ctx.strokeStyle = theme.wall; ctx.lineWidth = size * 0.9 + 6;
  ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(hx, hy); ctx.stroke();
  ctx.strokeStyle = armColor(b.char); ctx.lineWidth = size * 0.6;
  ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(hx, hy); ctx.stroke();
  ctx.fillStyle = gloveColor(b.char); ctx.strokeStyle = theme.wall; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(hx, hy, size, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.restore();
}

// HUD charge bar (same look as CTE Rejuvenation).
var specialCache = [];
function updateSpecialHud(force) {
  for (var i = 0; i < 2; i++) {
    var b = balls[i];
    if (!b.char.hasSpecial) continue;
    var p = Math.max(0, Math.min(1, (b.specialT || 0) / b.char.special.chargeTime));
    var live = !!b.igbb;
    var key = Math.round(p * 400) + (live ? "l" : "") + (p >= 1 ? "f" : "");
    if (!force && specialCache[i] === key) continue;
    specialCache[i] = key;
    document.getElementById("specialFill" + i).style.width = (live ? 100 : p * 100) + "%";
    document.getElementById("specialBar" + i).setAttribute("aria-valuenow", Math.round(p * 100));
    document.getElementById("special" + i).classList.toggle("healing", live || p >= 1);
  }
}
