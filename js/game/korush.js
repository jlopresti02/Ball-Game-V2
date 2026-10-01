// Brawler's opening KO Rush, and the Slugfest when two Brawlers both go for it.
//
// At the very start of a fight a fighter with a KO rush chance (the Brawler,
// 1%) may sprint straight at the opponent and throw a single punch that
// knocks them out cold. The opponent is shocked ("!") and can't attack until
// that punch is thrown. The punch can still be weaved, blocked or countered
// like any other punch.
//
// If both fighters roll the rush at once, they meet in the middle and trade
// heavy punches for 5 seconds. Whoever took less damage winds up a big punch
// that sends the other into the wall behind them, then runs in and finishes
// them with the knockout punch.
"use strict";

var KO_RUSH_SPEED = 640;      // sprint speed toward the opponent
var KO_RUSH_GIVEUP = 3;       // seconds before an unreachable rush is called off
var KO_PUNCH_DUR = 0.34, KO_PUNCH_HIT = 0.16;
var SLUG_TIME = 5;            // seconds of trading punches
var SLUG_MIN = 10, SLUG_MAX = 30;
var SLUG_GAP = 44;            // how far each fighter stands from the centre
var SLUG_BIG_DAMAGE = 10;


var koDuel = null;
var koEndTimer = 0;  // a beat after a knockout before the winner is announced

// Lets the knockout land and the "KNOCKOUT!" read before the result banner.
function endAfterKnockout() { koEndTimer = 1.1; }
function tickKoEnd(dt) {
  if (koEndTimer <= 0) return;
  koEndTimer -= dt;
  if (koEndTimer <= 0) { koEndTimer = 0; checkEnd(); }
}

function koRushChance(ch) {
  if (!ch.hasPunch || !(ch.punch.koChance > 0)) return 0;
  if (devForceKo && menuScreen === "dev") return 100;
  return ch.punch.koChance;
}

// Called once when the match starts.
function rollKoRush() {
  koDuel = null; koEndTimer = 0;
  var rolled = balls.map(function (b) { return Math.random() * 100 < koRushChance(b.char); });
  if (rolled[0] && rolled[1]) { beginSlugfest(); return; }
  balls.forEach(function (b, i) {
    if (!rolled[i]) return;
    var target = balls[1 - i];
    b.koRush = { phase: "run", t: 0 };
    target.shocked = true;
    target.vx = 0; target.vy = 0;
    floater(b.x, b.y - b.r - 8, "KO RUSH", "crit");
    playWhoosh();
  });
}

function koDistance(a, b) {
  var dx = b.x - a.x, dy = b.y - a.y;
  return Math.sqrt(dx * dx + dy * dy) || 1;
}

function releaseShock(b) {
  if (!b.shocked) return;
  b.shocked = false;
  if (b.alive && Math.abs(b.vx) + Math.abs(b.vy) < 1) setSpeed(b, SPEED);
}

// A big, dramatic knockout: freeze-frame, shake, shockwave.
function knockoutFx(attacker, target) {
  var dx = target.x - attacker.x, dy = target.y - attacker.y, d = Math.sqrt(dx * dx + dy * dy) || 1;
  floater(target.x, target.y - target.r - 44, "KNOCKOUT!", "crit");
  impacts.push({ x: target.x - dx / d * target.r, y: target.y - dy / d * target.r, nx: -dx / d, ny: -dy / d, life: 0.6, max: 0.6, color: attacker.char.color });
  hitStop = 0.45;
  if (!reduceMotion) shake = Math.max(shake, 16);
  playSlam();
}

// The single KO punch at the end of a rush. Goes through every normal
// defence (weave, block, flow counter, counter grab, ...).
function throwKoPunch(self, target) {
  var amount = Math.ceil(target.hp / incomingMultiplier(target));
  var dealt = hurt(target, amount, "kopunch", self.id);
  if (dealt > 0) {
    playPunch(dealt);
    if (!target.alive) { knockoutFx(self, target); endAfterKnockout(); }
  }
}

// Returns true while the rush is still running (the Brawler does nothing else).
function updateKoRush(self, other, dt) {
  var kr = self.koRush;
  if (!kr) return false;
  kr.t += dt;
  if (!other.alive) { self.koRush = null; releaseShock(other); return false; }
  if (other.shocked) { other.vx = 0; other.vy = 0; }
  var d = koDistance(self, other);
  if (kr.phase === "run") {
    var pu = self.char.punch;
    if (d < self.r + other.r + pu.reach) {
      kr.phase = "throw"; kr.t = 0;
      self.koPunch = { t: 0, dur: KO_PUNCH_DUR, hitAt: KO_PUNCH_HIT, hit: false, targetId: other.id, size: pu.size * 1.25 };
      self.vx *= 0.15; self.vy *= 0.15;
    } else if (kr.t > KO_RUSH_GIVEUP || !self.alive) {
      self.koRush = null; releaseShock(other); return false;
    } else {
      self.vx = (other.x - self.x) / d * KO_RUSH_SPEED;
      self.vy = (other.y - self.y) / d * KO_RUSH_SPEED;
      if (!reduceMotion) particles.push({ x: self.x, y: self.y, vx: -self.vx * 0.1, vy: -self.vy * 0.1, life: 0.22, max: 0.22, size: self.r * 0.6, color: self.char.color });
    }
    return true;
  }
  // Throwing.
  var kp = self.koPunch;
  kp.t += dt;
  if (!kp.hit && kp.t >= kp.hitAt) {
    kp.hit = true;
    releaseShock(other); // the punch is out: the opponent can act again
    throwKoPunch(self, other);
  }
  if (kp.t >= kp.dur) {
    self.koPunch = null; self.koRush = null;
    self.punchCd = self.char.punch.cooldown;
    if (self.alive) setSpeed(self, SPEED);
    return false;
  }
  return true;
}

// ---------------------------------------------------------------
// Slugfest: both Brawlers rushed at once.
// ---------------------------------------------------------------
function beginSlugfest() {
  var left = balls[0].x <= balls[1].x ? balls[0] : balls[1];
  var right = balls[1 - left.id];
  var cy = H / 2;
  koDuel = {
    phase: "approach", t: 0,
    spots: {}, taken: [0, 0], next: 0.25, turn: Math.random() < 0.5 ? 0 : 1,
    winner: -1, loser: -1, fly: null
  };
  koDuel.spots[left.id] = { x: W / 2 - SLUG_GAP, y: cy };
  koDuel.spots[right.id] = { x: W / 2 + SLUG_GAP, y: cy };
  balls.forEach(function (b) {
    b.koDuel = true; b.holdAtOne = true; b.vx = 0; b.vy = 0;
    floater(b.x, b.y - b.r - 8, "KO RUSH", "crit");
  });
  playWhoosh();
}

function slugPunch(b, targetId, dur, hitAt, sizeMult, dmg, kind) {
  b.koPunch = { t: 0, dur: dur, hitAt: hitAt, hit: false, targetId: targetId, size: b.char.punch.size * sizeMult, dmg: dmg, kind: kind };
}

function moveToward(b, x, y, speed, dt) {
  var dx = x - b.x, dy = y - b.y, d = Math.sqrt(dx * dx + dy * dy);
  if (d <= speed * dt || d < 0.5) { b.x = x; b.y = y; return true; }
  b.x += dx / d * speed * dt; b.y += dy / d * speed * dt;
  if (!reduceMotion) particles.push({ x: b.x, y: b.y, vx: -dx / d * 40, vy: -dy / d * 40, life: 0.2, max: 0.2, size: b.r * 0.5, color: b.char.color });
  return false;
}

function endSlugfest() {
  balls.forEach(function (b) {
    b.koDuel = false; b.holdAtOne = false; b.koPunch = null;
    if (b.alive) setSpeed(b, SPEED);
  });
  koDuel = null;
}

// Returns true while the slugfest is running (it takes over both fighters).
function updateSlugfest(dt) {
  var kd = koDuel;
  if (!kd) return false;
  kd.t += dt;
  balls.forEach(function (b) {
    b.vx = 0; b.vy = 0;
    var kp = b.koPunch;
    if (!kp) return;
    kp.t += dt;
    if (!kp.hit && kp.t >= kp.hitAt) { kp.hit = true; landSlugPunch(b, balls[kp.targetId], kp); }
    if (kp.t >= kp.dur) b.koPunch = null;
  });
  if (!koDuel) return false; // ended inside a punch
  var a = balls[0], c = balls[1];

  if (kd.phase === "approach") {
    var aIn = moveToward(a, kd.spots[0].x, kd.spots[0].y, 520, dt);
    var cIn = moveToward(c, kd.spots[1].x, kd.spots[1].y, 520, dt);
    if ((aIn && cIn) || kd.t > 1.2) {
      a.x = kd.spots[0].x; a.y = kd.spots[0].y; c.x = kd.spots[1].x; c.y = kd.spots[1].y;
      kd.phase = "exchange"; kd.t = 0; kd.next = 0.2;
      floater(W / 2, H / 2 - RADIUS - 70, "SLUGFEST!", "crit");
    }
  } else if (kd.phase === "exchange") {
    kd.next -= dt;
    if (kd.next <= 0 && kd.t < SLUG_TIME - 0.3) {
      var p = balls[kd.turn];
      var dmg = SLUG_MIN + Math.floor(Math.random() * (SLUG_MAX - SLUG_MIN + 1));
      slugPunch(p, 1 - kd.turn, 0.28, 0.13, 1.1, dmg, "slug");
      kd.turn = 1 - kd.turn;
      kd.next = 0.45 + Math.random() * 0.3;
    }
    if (kd.t >= SLUG_TIME && !a.koPunch && !c.koPunch) {
      kd.winner = kd.taken[0] < kd.taken[1] ? 0 : (kd.taken[1] < kd.taken[0] ? 1 : (Math.random() < 0.5 ? 0 : 1));
      kd.loser = 1 - kd.winner;
      kd.phase = "windup"; kd.t = 0;
      slugPunch(balls[kd.winner], kd.loser, 1.15, 0.95, 1.6, SLUG_BIG_DAMAGE, "big");
      floater(balls[kd.winner].x, balls[kd.winner].y - RADIUS - 10, "WIND UP", "note");
    }
  } else if (kd.phase === "fly") {
    var f = kd.fly, L = balls[kd.loser];
    f.t += dt;
    var k = Math.min(1, f.t / f.dur), e = 1 - Math.pow(1 - k, 3);
    L.x = f.sx + (f.ex - f.sx) * e; L.y = f.sy + (f.ey - f.sy) * e;
    if (!reduceMotion) particles.push({ x: L.x, y: L.y, vx: 0, vy: 0, life: 0.25, max: 0.25, size: L.r * 0.7, color: balls[kd.winner].char.color });
    if (k >= 1) {
      L.squash = { t: 0.22, max: 0.22, nx: f.nx, ny: f.ny };
      impacts.push({ x: L.x - f.nx * L.r, y: L.y - f.ny * L.r, nx: f.nx, ny: f.ny, life: 0.45, max: 0.45, color: balls[kd.winner].char.color });
      hitStop = 0.12;
      if (!reduceMotion) shake = Math.max(shake, 11);
      playSlam();
      kd.phase = "rush"; kd.t = 0;
    }
  } else if (kd.phase === "rush") {
    var Wn = balls[kd.winner], Ls = balls[kd.loser];
    var d = koDistance(Wn, Ls), reach = Wn.r + Ls.r + Wn.char.punch.reach * 0.6;
    if (d > reach) {
      var step = Math.min(d - reach, KO_RUSH_SPEED * dt);
      Wn.x += (Ls.x - Wn.x) / d * step; Wn.y += (Ls.y - Wn.y) / d * step;
      if (!reduceMotion) particles.push({ x: Wn.x, y: Wn.y, vx: 0, vy: 0, life: 0.22, max: 0.22, size: Wn.r * 0.6, color: Wn.char.color });
    } else {
      kd.phase = "ko"; kd.t = 0;
      slugPunch(Wn, kd.loser, 0.75, 0.5, 1.7, 0, "ko");
    }
  } else if (kd.phase === "ko") {
    // The finishing punch lands inside the punch update above.
  }
  return true;
}

function landSlugPunch(self, target, kp) {
  var kd = koDuel;
  if (!kd || !target.alive) return;
  if (kp.kind === "slug") {
    var dealt = hurt(target, kp.dmg, "slugfest", self.id);
    kd.taken[target.id] += dealt;
    if (dealt > 0) playPunch(dealt);
    if (!reduceMotion) shake = Math.max(shake, 4);
    return;
  }
  if (kp.kind === "big") {
    var bd = hurt(target, kp.dmg, "slugfest", self.id);
    if (bd > 0) playPunch(30);
    // Knocked straight back into the wall behind them.
    var dx = target.x - self.x, dy = target.y - self.y, d = Math.sqrt(dx * dx + dy * dy) || 1;
    var ux = dx / d, uy = dy / d;
    var tx = ux > 0 ? (W - target.r - target.x) / ux : (ux < 0 ? (target.r - target.x) / ux : Infinity);
    var ty = uy > 0 ? (H - target.r - target.y) / uy : (uy < 0 ? (target.r - target.y) / uy : Infinity);
    var tt = Math.max(0, Math.min(tx, ty));
    var ex = target.x + ux * tt, ey = target.y + uy * tt;
    var nx = tx <= ty ? -Math.sign(ux) : 0, ny = tx <= ty ? 0 : -Math.sign(uy);
    kd.fly = { t: 0, dur: 0.38, sx: target.x, sy: target.y, ex: ex, ey: ey, nx: nx, ny: ny };
    kd.phase = "fly"; kd.t = 0;
    hitStop = 0.1;
    if (!reduceMotion) shake = Math.max(shake, 8);
    return;
  }
  if (kp.kind === "ko") {
    target.holdAtOne = false;
    hurt(target, Math.ceil(target.hp), "kofinal", self.id);
    playPunch(40);
    knockoutFx(self, target);
    endSlugfest();
    endAfterKnockout();
  }
}

// ---------------------------------------------------------------
// Drawing
// ---------------------------------------------------------------

// The KO punch fist (rush, slugfest jabs, the big wind-up and the finisher).
function drawKoPunch(b) {
  var kp = b.koPunch;
  if (!kp || !b.alive) return;
  var tgt = balls[kp.targetId];
  var qx = tgt.x - b.x, qy = tgt.y - b.y, qd = Math.sqrt(qx * qx + qy * qy) || 1;
  var nx = qx / qd, ny = qy / qd, px = -ny, py = nx;
  var gap = b.r * 0.4; // same shoulder as a normal punch (drawHands keeps the other hand up)
  var rest = b.r + 4, full = Math.max(rest, qd - tgt.r + 4), back = -b.r * 0.15;
  var dist, jitter = 0;
  if (kp.t < kp.hitAt) {
    var w = kp.t / kp.hitAt;
    if (kp.kind === "big" || kp.kind === "ko") {
      // Long telegraphed wind-up: the fist pulls back and out wide and
      // trembles, then fires.
      var pull = Math.min(1, w / 0.8), cocked = b.r * 0.95;
      var ease = pull * pull * (3 - 2 * pull);
      if (w < 0.8) {
        dist = rest + (back - rest) * ease;
        gap = b.r * 0.4 + (cocked - b.r * 0.4) * ease;
        jitter = (Math.random() - 0.5) * 7 * pull;
      } else {
        var f = (w - 0.8) / 0.2;
        dist = back + (full - back) * f;
        gap = cocked + (b.r * 0.4 - cocked) * f;
      }
    } else {
      dist = rest + (full - rest) * w;
    }
  } else {
    var r2 = (kp.t - kp.hitAt) / Math.max(0.01, kp.dur - kp.hitAt);
    dist = full + (rest - full) * Math.min(1, r2);
  }
  var size = kp.size || b.char.punch.size;
  var fx = b.x + nx * dist + px * gap + jitter, fy = b.y + ny * dist + py * gap + jitter;
  var ax = b.x + nx * (b.r - 2) + px * gap, ay = b.y + ny * (b.r - 2) + py * gap;
  ctx.save();
  ctx.lineCap = "round";
  if (dist > b.r) {
    ctx.strokeStyle = theme.wall; ctx.lineWidth = size * 0.9 + 6;
    ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(fx, fy); ctx.stroke();
    ctx.strokeStyle = b.char.color; ctx.lineWidth = size * 0.6;
    ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(fx, fy); ctx.stroke();
  }
  ctx.fillStyle = b.char.color; ctx.strokeStyle = theme.wall; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(fx, fy, size, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  if (kp.kind === "big" || kp.kind === "ko" || !kp.kind) {
    // A charged glow around the knockout fist.
    ctx.globalAlpha = 0.35 + 0.25 * Math.sin(performance.now() / 60);
    ctx.strokeStyle = theme.hit; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(fx, fy, size + 5, 0, Math.PI * 2); ctx.stroke();
  }
  ctx.restore();
}

// The "!" over a shocked fighter's head.
function drawShock(b) {
  if (!b.shocked || !b.alive) return;
  var bob = Math.sin(performance.now() / 90) * 2;
  var y = b.y - b.r - 34 + bob;
  if (y < 16) y = b.y + b.r + 30;
  ctx.save();
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.font = '900 34px "Barlow Condensed", "Arial Narrow", sans-serif';
  ctx.lineWidth = 6; ctx.lineJoin = "round";
  ctx.strokeStyle = theme.floor; ctx.strokeText("!", b.x, y);
  ctx.fillStyle = theme.hit; ctx.fillText("!", b.x, y);
  ctx.restore();
}
