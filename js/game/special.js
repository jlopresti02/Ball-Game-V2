// Special moves for created (roster) characters.
//
// A special has a bar that charges over time (like CTE Rejuvenation) and
// fills faster with every clean hit the fighter lands. When it's full the
// move goes off.
//
// IGBB: grabs the opponent with one hand and throws them into a corner,
// then unloads a flurry of fast, heavy punches while they shell up. If they
// survive, the fighter backs away with its guard up, blocking everything.
//
// Father's Plan: grabs the opponent and hurls them wall to wall, then slams
// them down onto the bottom wall and finishes with a burst of brutal
// ground-and-pound punches.
//
// Both moves share the fighter's `igbb` state (move: "igbb" or
// "fathersplan"), so everything that locks or guards during IGBB does the
// same during Father's Plan.
"use strict";

var SPECIAL_MOVES = { igbb: "IGBB", fathersplan: "Father's Plan", dobronx: "Do Bronx" };

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
// A special can set punchCut to make plain punches charge it faster.
function addSpecialCharge(b, source) {
  if (!b || !b.char.hasSpecial || b.igbb || b.doBronx) return;
  var sp = b.char.special;
  var cut = source === "punch" && sp.punchCut != null ? sp.punchCut : sp.hitCut;
  b.specialT = Math.min(sp.chargeTime, (b.specialT || 0) + cut);
}

function tickSpecialCharge(b, dt) {
  if (!b.char.hasSpecial || !b.alive || b.igbb || b.doBronx || !started || over) return;
  b.specialT = Math.min(b.char.special.chargeTime, (b.specialT || 0) + dt);
}

// Busy with something that shouldn't be interrupted.
function specialBusy(b) {
  return b.grapple || b.grappled || b.slam || b.sprawl || b.sprawled || subLocked(b) || b.combo || b.taunt || b.flow ||
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
  b.mock = null;
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
  if (!self.char.hasSpecial || !SPECIAL_MOVES[self.char.special.move]) return false;
  var sp = self.char.special;
  if (sp.move === "dobronx") return updateDoBronx(self, other, dt); // dobronx.js
  if (!self.igbb) {
    if (self.specialT < sp.chargeTime || !canStartIgbb(self, other)) return false;
    self.igbb = { phase: "close", t: 0, move: sp.move };
    floater(self.x, self.y - self.r - 26, sp.move === "fathersplan" ? "FATHER'S PLAN!" : "IGBB!", "crit");
    playWhoosh();
    if (sp.move === "igbb") playIgbbLine();
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
  if (m.move === "fathersplan") return updateFathersPlan(self, other, m, sp, dt);
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
// Father's Plan
// ---------------------------------------------------------------

var FP_GRAB_TIME = 0.2;     // both hands lock on
var FP_TOSS_TIME = 0.17;    // each flight into a wall
var FP_SLAM_TIME = 0.22;    // the final slam down onto the bottom wall
var FP_MOUNT_TIME = 0.25;   // climbs on top
// Ground and pound: each punch is wound up high where the viewer can see
// it coming (fist cocked over the head, trembling, a target ring closing in
// on them), then hammered straight down.
var FP_WIND = 0.26, FP_WIND_LAST = 0.5;  // wind-up
var FP_STRIKE = 0.06;                     // the drop onto them
var FP_RECOIL = 0.1;                      // fist bounces back up
var FP_RETREAT_TIME = 1;

// Picks the next wall to throw them into: a different wall from the one
// they're on (never the floor, which is saved for the final slam), the
// farther the better, at a random spot along it.
function fpWallTarget(b, lastWall) {
  var r = b.r + 2, best = null, bestD = -1;
  ["left", "right", "top"].forEach(function (w) {
    if (w === lastWall) return;
    var along = 0.2 + Math.random() * 0.6, p;
    if (w === "left") p = { x: r, y: H * along * 0.85, nx: 1, ny: 0 };
    else if (w === "right") p = { x: W - r, y: H * along * 0.85, nx: -1, ny: 0 };
    else p = { x: W * along, y: r, nx: 0, ny: 1 };
    var d = Math.hypot(p.x - b.x, p.y - b.y) + Math.random() * 60;
    if (d > bestD) { bestD = d; best = p; best.wall = w; }
  });
  return best;
}

function fpStartFlight(m, other, target, dur) {
  m.sx = other.x; m.sy = other.y; m.ex = target.x; m.ey = target.y;
  m.nx = target.nx; m.ny = target.ny; m.wall = target.wall; m.dur = dur;
  m.t = 0;
  playWhoosh();
}

// The fighter stays hooked onto them, right behind the ball it's hurling.
function fpFollow(self, other, dirx, diry, dt) {
  var wx = other.x - dirx * (self.r + other.r - 2), wy = other.y - diry * (self.r + other.r - 2);
  var k = Math.min(1, dt * 28);
  self.x += (wx - self.x) * k; self.y += (wy - self.y) * k;
  self.x = Math.max(self.r, Math.min(W - self.r, self.x));
  self.y = Math.max(self.r, Math.min(H - self.r, self.y));
}

function fpImpact(self, other, m, dmg, big) {
  var cx = other.x - m.nx * other.r, cy = other.y - m.ny * other.r;
  other.squash = { t: big ? 0.26 : 0.18, max: big ? 0.26 : 0.18, nx: m.nx, ny: m.ny };
  other.flash = 0.16;
  impacts.push({ x: cx, y: cy, nx: m.nx, ny: m.ny, life: 0.5, max: 0.5, color: self.char.color });
  impacts.push({ x: cx, y: cy, nx: m.nx, ny: m.ny, life: big ? 0.8 : 0.55, max: big ? 0.8 : 0.55, color: theme.hit });
  igbbSparks(cx, cy, m.nx, m.ny, self.char.color, big ? 26 : 16, big ? 560 : 440);
  if (!reduceMotion) shake = Math.max(shake, big ? 32 : 24);
  hitStop = Math.max(hitStop, big ? 0.2 : 0.09);
  playSlam(); playPunch(big ? 50 : 35);
  hurt(other, dmg, "igbb", self.id);
}

function updateFathersPlan(self, other, m, sp, dt) {
  var fdx, fdy, fl, k, e;
  if (m.phase === "grab") {
    if (m.t >= FP_GRAB_TIME) {
      m.tossed = 0; m.wall = null;
      fpStartFlight(m, other, fpWallTarget(other, null), FP_TOSS_TIME);
      m.phase = "toss";
    }
    return true;
  }
  if (m.phase === "toss" || m.phase === "slamdown") {
    k = Math.min(1, m.t / m.dur); e = k * k; // speeds up into the wall
    other.x = m.sx + (m.ex - m.sx) * e; other.y = m.sy + (m.ey - m.sy) * e;
    fdx = m.ex - m.sx; fdy = m.ey - m.sy; fl = Math.sqrt(fdx * fdx + fdy * fdy) || 1;
    fpFollow(self, other, fdx / fl, fdy / fl, dt);
    if (!reduceMotion) {
      particles.push({ x: other.x, y: other.y, vx: 0, vy: 0, life: 0.25, max: 0.25, size: other.r * 0.8, color: self.char.color });
      particles.push({ x: other.x - fdx / fl * other.r + (Math.random() - 0.5) * other.r, y: other.y - fdy / fl * other.r + (Math.random() - 0.5) * other.r,
        vx: -fdx / fl * 300, vy: -fdy / fl * 300, life: 0.18, max: 0.18, size: 3, color: theme.ink });
    }
    if (k < 1) return true;
    if (m.phase === "toss") {
      fpImpact(self, other, m, sp.wallDamage, false);
      if (!other.alive) { endIgbb(self, other); checkEnd(); return false; }
      m.tossed++;
      if (m.tossed < sp.walls) {
        fpStartFlight(m, other, fpWallTarget(other, m.wall), FP_TOSS_TIME);
      } else {
        // Dragged down and slammed onto the floor.
        var gx = Math.max(other.r + 40, Math.min(W - other.r - 40, other.x));
        fpStartFlight(m, other, { x: gx, y: H - other.r - 2, nx: 0, ny: -1, wall: "bottom" }, FP_SLAM_TIME);
        m.phase = "slamdown";
      }
      return true;
    }
    fpImpact(self, other, m, sp.slamDamage, true);
    floater(other.x, other.y - other.r - 30, "TAKEDOWN", "note");
    recordTakedown(self.id);
    if (!other.alive) { endIgbb(self, other); checkEnd(); return false; }
    m.phase = "mount"; m.t = 0;
    m.mx = self.x; m.my = self.y;
    return true;
  }
  if (m.phase === "mount" || m.phase === "pound") {
    // Kneeling over them from the side nearer the middle, pinning them to
    // the floor, so the punches land where the viewer can see them.
    if (!m.dir) m.dir = other.x > W / 2 ? -1 : 1;
    var tx = other.x + m.dir * (self.r + other.r) * 0.62, ty = other.y - (self.r + other.r) * 0.62;
    if (m.phase === "mount") {
      k = Math.min(1, m.t / FP_MOUNT_TIME);
      self.x = m.mx + (tx - m.mx) * k; self.y = m.my + (ty - m.my) * k;
      if (k >= 1) { m.phase = "pound"; m.t = 0; m.thrown = 0; playSmashLine(); }
      return true;
    }
    // Leans back while winding up, then drops their whole weight in.
    var gp = m.gp, lean = 0;
    if (gp) {
      gp.t += dt;
      if (gp.t < gp.wind) lean = -6 * (gp.t / gp.wind);
      else if (gp.t < gp.wind + FP_STRIKE) lean = 12;
      else lean = 12 * Math.max(0, 1 - (gp.t - gp.wind - FP_STRIKE) / FP_RECOIL);
      if (!gp.hit && gp.t >= gp.wind + FP_STRIKE) { gp.hit = true; landFpPunch(self, other, gp); }
      if (gp.t >= gp.wind + FP_STRIKE + FP_RECOIL) m.gp = null;
    }
    self.x = tx + Math.sin(m.t * 31) * 1.5; self.y = ty + lean;
    if (!other.alive) { m.gp = null; endIgbb(self, other); checkEnd(); return false; }
    if (!m.gp && m.thrown < sp.punches) {
      var last = m.thrown === sp.punches - 1;
      m.gp = { t: 0, wind: last ? FP_WIND_LAST : FP_WIND, hit: false, last: last, side: m.thrown % 2 ? -1 : 1 };
      m.thrown++;
      playWhoosh();
    }
    if (m.thrown >= sp.punches && !m.gp) {
      // They survived it: lets them up and backs off.
      other.shelled = false;
      setSpeed(other, SPEED * 0.6);
      other.vx = 0; other.vy = -SPEED * 0.6;
      m.phase = "retreat"; m.t = 0;
    }
    return true;
  }
  if (m.phase === "retreat") {
    var dx = other.x - self.x, dy = other.y - self.y, d = Math.sqrt(dx * dx + dy * dy) || 1;
    self.vx = -dx / d * IGBB_RETREAT_SPEED; self.vy = -dy / d * IGBB_RETREAT_SPEED;
    if (m.t >= FP_RETREAT_TIME) { endIgbb(self, other); setSpeed(self, SPEED); return false; }
    return true;
  }
  return false;
}

function landFpPunch(self, other, gp) {
  var big = gp.last;
  var dealt = hurt(other, self.char.special.damage, "igbb", self.id);
  if (dealt > 0) playPunch(dealt * (big ? 4 : 3));
  if (big) playSlam();
  var cx = other.x, cy = other.y - other.r * 0.45;
  // Flattened into the floor, a white flash, a shockwave at the fist and
  // cracks in the floor under them.
  other.squash = { t: big ? 0.32 : 0.2, max: big ? 0.32 : 0.2, nx: 0, ny: -1 };
  other.flash = big ? 0.22 : 0.16;
  impacts.push({ x: cx, y: cy, nx: 0, ny: -1, life: big ? 0.6 : 0.4, max: big ? 0.6 : 0.4, color: theme.hit });
  impacts.push({ x: other.x, y: H, nx: 0, ny: -1, life: big ? 0.8 : 0.45, max: big ? 0.8 : 0.45, color: self.char.color });
  igbbSparks(cx, cy, 0, -1, self.char.color, big ? 34 : 20, big ? 640 : 460);
  if (!reduceMotion) {
    // Dust kicked out along the floor to both sides.
    for (var i = 0; i < (big ? 18 : 10); i++) {
      var sgn = i % 2 ? 1 : -1;
      particles.push({ x: other.x + sgn * other.r * 0.8, y: H - 4, vx: sgn * (120 + Math.random() * 260), vy: -Math.random() * 120,
        life: 0.35 + Math.random() * 0.25, max: 0.6, size: 3 + Math.random() * 4, color: theme.wall });
    }
    shake = Math.max(shake, big ? 36 : 22);
  }
  hitStop = Math.max(hitStop, big ? 0.28 : 0.1);
  if (big && other.alive) floater(other.x, other.y - other.r - 34, "FATHER'S PLAN!", "crit");
}

// ---------------------------------------------------------------
// Drawing
// ---------------------------------------------------------------

// The one-handed grab and throw.
function drawSpecial(b) {
  var m = b.igbb;
  if (m && m.gp && b.alive) { drawFpPound(b, m.gp); return; }
  if (!m || !b.alive || (m.phase !== "grab" && m.phase !== "throw" && m.phase !== "toss" && m.phase !== "slamdown")) return;
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

// Father's Plan ground and pound: the fist cocked high over the head and
// trembling (with a target ring closing in on the opponent), then driven
// straight down with speed lines behind it.
function drawFpPound(b, gp) {
  var o = balls[1 - b.id], r = b.r;
  var size = (b.char.punch.size || 15) * (gp.last ? 1.9 : 1.5);
  var toward = o.x < b.x ? -1 : 1; // which side the opponent is on
  var shx = b.x + toward * gp.side * r * 0.45, shy = b.y - r * 0.15;
  var cockX = b.x + toward * r * (gp.side > 0 ? 0.55 : 0.1), cockY = b.y - r * (gp.last ? 1.9 : 1.55);
  var hitX = o.x - toward * o.r * 0.1, hitY = o.y - o.r * 0.45;
  var fx, fy, k;
  if (gp.t < gp.wind) {
    k = gp.t / gp.wind; k = k * k * (3 - 2 * k);
    fx = shx + (cockX - shx) * k; fy = shy + (cockY - shy) * k;
    var tr = (gp.last ? 5 : 3) * k;
    fx += (Math.random() - 0.5) * tr; fy += (Math.random() - 0.5) * tr;
  } else if (gp.t < gp.wind + FP_STRIKE) {
    k = (gp.t - gp.wind) / FP_STRIKE;
    fx = cockX + (hitX - cockX) * k; fy = cockY + (hitY - cockY) * k;
  } else {
    k = Math.min(1, (gp.t - gp.wind - FP_STRIKE) / FP_RECOIL);
    fx = hitX + (shx - hitX) * k * 0.6; fy = hitY + (cockY - hitY) * k * 0.35;
  }
  ctx.save();
  // Target ring closing in on the spot the punch will land.
  if (gp.t < gp.wind) {
    var w = gp.t / gp.wind;
    ctx.globalAlpha = 0.35 + 0.5 * w;
    ctx.strokeStyle = theme.hit; ctx.lineWidth = 3 + 2 * w;
    ctx.beginPath(); ctx.arc(hitX, hitY, o.r * (1.6 - 1.1 * w), 0, Math.PI * 2); ctx.stroke();
    ctx.globalAlpha = 1;
  }
  // Speed lines behind the fist on the way down (and just after it lands).
  if (gp.t >= gp.wind && gp.t < gp.wind + FP_STRIKE + 0.05) {
    ctx.strokeStyle = theme.ink; ctx.lineWidth = 3; ctx.globalAlpha = 0.55;
    for (var i = -2; i <= 2; i++) {
      ctx.beginPath(); ctx.moveTo(fx + i * size * 0.4, fy - size * 1.2); ctx.lineTo(fx + i * size * 0.4, fy - size * 3.2); ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }
  ctx.lineCap = "round";
  ctx.strokeStyle = theme.wall; ctx.lineWidth = size * 0.9 + 6;
  ctx.beginPath(); ctx.moveTo(shx, shy); ctx.lineTo(fx, fy); ctx.stroke();
  ctx.strokeStyle = armColor(b.char); ctx.lineWidth = size * 0.6;
  ctx.beginPath(); ctx.moveTo(shx, shy); ctx.lineTo(fx, fy); ctx.stroke();
  // A pulsing glow around the cocked fist on the big last one.
  if (gp.last && gp.t < gp.wind) {
    ctx.fillStyle = theme.hit; ctx.globalAlpha = 0.25 + 0.2 * Math.sin(gp.t * 40);
    ctx.beginPath(); ctx.arc(fx, fy, size * 1.6, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;
  }
  var ang = Math.atan2(hitY - fy, hitX - fx);
  if (b.char.look) drawGlove(ctx, fx, fy, size, b.char.look, theme.wall, ang);
  else {
    ctx.fillStyle = gloveColor(b.char); ctx.strokeStyle = theme.wall; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(fx, fy, size, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  }
  ctx.restore();
}

// HUD charge bar (same look as CTE Rejuvenation).
var specialCache = [];
function updateSpecialHud(force) {
  for (var i = 0; i < 2; i++) {
    var b = balls[i];
    if (!b.char.hasSpecial) continue;
    var p = Math.max(0, Math.min(1, (b.specialT || 0) / b.char.special.chargeTime));
    if (b.doBronx) p = Math.max(0, 1 - b.doBronx.t / b.doBronx.dur); // Do Bronx running down
    var live = !!b.igbb && !b.doBronx;
    var key = Math.round(p * 400) + (live ? "l" : "") + (p >= 1 ? "f" : "");
    if (!force && specialCache[i] === key) continue;
    specialCache[i] = key;
    document.getElementById("specialFill" + i).style.width = (live ? 100 : p * 100) + "%";
    document.getElementById("specialBar" + i).setAttribute("aria-valuenow", Math.round(p * 100));
    document.getElementById("special" + i).classList.toggle("healing", live || p >= 1);
  }
}
