// Brawler's opening KO Rush, and the Slugfest when two Brawlers both go for it.
//
// At the very start of a fight a fighter with a KO rush chance (the Brawler,
// 5%) may sprint straight at the opponent and throw a single punch that
// knocks them out cold. The opponent is shocked ("!") and can't attack until
// that punch is thrown. The punch can still be weaved, blocked or countered
// like any other punch.
//
// If both fighters roll the rush at once, they meet in the middle and trade
// heavy punches for 5 seconds. Whoever took less damage winds up a big punch
// that sends the other into the wall behind them, then runs in and finishes
// them with the knockout punch.
"use strict";

var KO_RUSH_SPEED = 500;      // sprint speed toward the opponent
var KO_RUSH_GIVEUP = 3;       // seconds before an unreachable rush is called off
var KO_PUNCH_DUR = 0.42, KO_PUNCH_HIT = 0.18; // the knockout hook: sweep lands at HIT
var KO_HOOK_OPEN = 1.9;       // how far round to the side the hook starts (radians)
var KO_HOOK_FOLLOW = 0.6;     // how far it carries through past the target
var KO_HOOK_SWEEP = 0.24;     // seconds from the start of the sweep to full follow-through
var KO_BACKPEDAL = 75;        // how fast the shocked opponent backs away
var KO_FOLLOWUPS = 3;         // little shots on the knocked-out opponent
var KO_FOLLOW_MIN = 3, KO_FOLLOW_MAX = 6;
var KO_CELEBRATE = 1.7;
var QHOOK_DUR = 0.26, QHOOK_OPEN = 1.5, QHOOK_FOLLOW = 0.5; // the quick follow-up hooks       // seconds of celebrating before the result
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
// If it lands, the opponent is out cold (koOut): it stays on the canvas,
// slumped with stars over its head, while the Brawler gets a few more shots
// in and celebrates. The fight ends once the celebration is over.
function throwKoPunch(self, target) {
  var amount = Math.ceil(target.hp / incomingMultiplier(target));
  var wasHolding = target.holdAtOne;
  target.holdAtOne = true;
  var dealt = hurt(target, amount, "kopunch", self.id);
  target.holdAtOne = wasHolding;
  if (dealt > 0) {
    playPunch(dealt);
    target.hp = 0;
    target.koOut = true;
    target.punch = null; target.kick = null; target.swing = null; target.throwAnim = null; target.jabAnim = null;
    // Sent sliding back a little by the hook.
    var dx = target.x - self.x, dy = target.y - self.y, d = Math.sqrt(dx * dx + dy * dy) || 1;
    target.vx = dx / d * 260; target.vy = dy / d * 260;
    knockoutFx(self, target);
    return true;
  }
  return false;
}

// The unconscious fighter finally drops once the Brawler is done celebrating.
function finishKnockedOut(b) {
  if (!b.koOut) return;
  b.koOut = false;
  b.hp = 0; b.alive = false;
  burst(b);
  document.getElementById("hud" + b.id).classList.add("dead");
}

// Returns true while the rush is still running (the Brawler does nothing else).
function updateKoRush(self, other, dt) {
  var kr = self.koRush;
  if (!kr) return false;
  kr.t += dt;
  if (!other.alive && kr.phase === "run") { self.koRush = null; releaseShock(other); return false; }
  if (other.koOut) {
    // Out cold: slides to a stop and stays there.
    var damp = Math.exp(-5 * dt);
    other.vx *= damp; other.vy *= damp;
  }
  if (kr.phase === "followup" || kr.phase === "celebrate") return updateKoAftermath(self, other, kr, dt);
  var d = koDistance(self, other);
  if (other.shocked && other.alive) {
    // Startled: slowly backs away from the charging Brawler.
    var bp = KO_BACKPEDAL * Math.min(1, kr.t / 0.2 + (kr.phase === "throw" ? 1 : 0));
    other.vx = (other.x - self.x) / d * bp;
    other.vy = (other.y - self.y) / d * bp;
  }
  if (kr.phase === "run") {
    var pu = self.char.punch;
    if (d < self.r + other.r + pu.reach) {
      kr.phase = "throw"; kr.t = 0;
      self.koPunch = { t: 0, dur: KO_PUNCH_DUR, hitAt: KO_PUNCH_HIT, hit: false, targetId: other.id, size: pu.size * 1.25, kind: "hook", side: 1 };
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
    kr.landed = throwKoPunch(self, other);
  }
  if (kp.t >= kp.dur && kr.landed) {
    self.koPunch = null;
    kr.phase = "followup"; kr.t = 0; kr.shots = 0; kr.next = 0.15;
    return true;
  }
  if (kp.t >= kp.dur) {
    self.koPunch = null; self.koRush = null;
    self.punchCd = self.char.punch.cooldown;
    if (self.alive) setSpeed(self, SPEED);
    return false;
  }
  return true;
}

// After the knockout: a few quick little shots on the slumped opponent,
// then hands up in celebration.
function updateKoAftermath(self, other, kr, dt) {
  self.vx = 0; self.vy = 0;
  if (kr.phase === "followup") {
    var kp = self.koPunch;
    if (kp) {
      kp.t += dt;
      if (!kp.hit && kp.t >= kp.hitAt) {
        kp.hit = true;
        var dmg = KO_FOLLOW_MIN + Math.floor(Math.random() * (KO_FOLLOW_MAX - KO_FOLLOW_MIN + 1));
        other.flash = 0.16;
        floater(other.x + (Math.random() - 0.5) * 16, other.y - other.r - 8, "-" + dmg, "hit");
        playPunch(dmg * 2);
        if (!reduceMotion) shake = Math.max(shake, 3);
        var nx = other.x - self.x, ny = other.y - self.y, nd = Math.sqrt(nx * nx + ny * ny) || 1;
        other.x += nx / nd * 3; other.y += ny / nd * 3; // a little jolt
      }
      if (kp.t >= kp.dur) self.koPunch = null;
      return true;
    }
    var d = koDistance(self, other), want = self.r + other.r + 18;
    if (d > want + 2) {
      // Step back in to finish the job.
      var stepLen = Math.min(d - want, 420 * dt);
      self.x += (other.x - self.x) / d * stepLen; self.y += (other.y - self.y) / d * stepLen;
      return true;
    }
    kr.next -= dt;
    if (kr.next <= 0) {
      if (kr.shots >= KO_FOLLOWUPS) {
        kr.phase = "celebrate"; kr.t = 0;
        floater(self.x, self.y - self.r - 26, "LIGHTS OUT!", "crit");
        return true;
      }
      kr.shots++;
      // A quick little hook, alternating hands.
      var sweep = QHOOK_DUR * 0.75;
      self.koPunch = { t: 0, dur: QHOOK_DUR, hitAt: sweep * QHOOK_OPEN / (QHOOK_OPEN + QHOOK_FOLLOW), sweep: sweep, hit: false,
        targetId: other.id, size: self.char.punch.size * 0.85, kind: "qhook", side: kr.shots % 2 ? 1 : -1 };
      kr.next = 0.08 + Math.random() * 0.08;
    }
    return true;
  }
  // Celebrating.
  if (kr.t >= KO_CELEBRATE) {
    self.koRush = null;
    finishKnockedOut(other);
    if (self.alive) setSpeed(self, SPEED);
    checkEnd();
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

// A big, exaggerated looping hook: a quick coil way back, then a huge sweep
// that carries well through the target. Alternates hands.
var SLUG_HOOK_COIL = 0.07, SLUG_HOOK_SWEEP = 0.2, SLUG_HOOK_OPEN = 2.5, SLUG_HOOK_FOLLOW = 1.0;
function slugHook(b, targetId, dmg) {
  b.slugHand = -(b.slugHand || -1);
  var kHit = SLUG_HOOK_OPEN / (SLUG_HOOK_OPEN + SLUG_HOOK_FOLLOW);
  b.koPunch = {
    t: 0, coil: SLUG_HOOK_COIL, sweep: SLUG_HOOK_SWEEP, dur: SLUG_HOOK_COIL + SLUG_HOOK_SWEEP + 0.08,
    hitAt: SLUG_HOOK_COIL + SLUG_HOOK_SWEEP * kHit, hit: false, targetId: targetId,
    size: b.char.punch.size * 1.3, dmg: dmg, kind: "slug", side: b.slugHand,
    open: SLUG_HOOK_OPEN, follow: SLUG_HOOK_FOLLOW, heavy: true
  };
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
    // Recover back to their spots after getting rocked by a hook.
    [a, c].forEach(function (b) {
      var sp = kd.spots[b.id], ex = sp.x - b.x, ey = sp.y - b.y;
      var f = 1 - Math.exp(-9 * dt);
      b.x += ex * f; b.y += ey * f;
    });
    kd.next -= dt;
    if (kd.next <= 0 && kd.t < SLUG_TIME - 0.3) {
      var p = balls[kd.turn];
      var dmg = SLUG_MIN + Math.floor(Math.random() * (SLUG_MAX - SLUG_MIN + 1));
      slugHook(p, 1 - kd.turn, dmg);
      kd.turn = 1 - kd.turn;
      kd.next = 0.36 + Math.random() * 0.22;
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
    if (d > reach + 0.5) {
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
    if (dealt > 0) playPunch(dealt * 1.6);
    // Heavy: the head snaps sideways with the hook, a shockwave, a tiny freeze.
    var dx = target.x - self.x, dy = target.y - self.y, d = Math.sqrt(dx * dx + dy * dy) || 1;
    var ux = dx / d, uy = dy / d, tx = uy * kp.side, ty = -ux * kp.side; // direction the hook is sweeping
    var jolt = 6 + kp.dmg * 0.45;
    target.x += (tx * 0.8 + ux * 0.5) * jolt; target.y += (ty * 0.8 + uy * 0.5) * jolt;
    target.squash = { t: 0.12, max: 0.12, nx: -tx, ny: -ty };
    impacts.push({ x: target.x - ux * target.r, y: target.y - uy * target.r, nx: -ux, ny: -uy, life: 0.25, max: 0.25, color: self.char.color });
    hitStop = Math.max(hitStop, 0.035 + kp.dmg * 0.0015);
    if (!reduceMotion) shake = Math.max(shake, 5 + kp.dmg * 0.25);
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
  if (!b.alive) return;
  if (b.koRush && (b.koRush.phase === "run" || b.koRush.phase === "throw")) { drawKoHook(b); return; }
  if (b.koRush && b.koRush.phase === "celebrate") { drawKoCelebrate(b); return; }
  var kp = b.koPunch;
  if (!kp) return;
  if (kp.kind === "qhook" || kp.kind === "slug") { drawQuickHook(b, kp); return; }
  var tgt = balls[kp.targetId];
  var qx = tgt.x - b.x, qy = tgt.y - b.y, qd = Math.sqrt(qx * qx + qy * qy) || 1;
  var nx = qx / qd, ny = qy / qd, px = -ny, py = nx;
  var gap = b.r * 0.4 * (kp.side || 1); // same shoulder as a normal punch (drawHands keeps the other hand up)
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

// The KO Rush hook. While running in, the fist is cocked way back out to the
// side and trembling, with a dashed arc showing the path it will sweep; then
// it whips round in a big sweeping hook and carries through past the target.
function drawKoHook(b) {
  var kr = b.koRush, kp = b.koPunch, other = balls[1 - b.id];
  var qx = other.x - b.x, qy = other.y - b.y, qd = Math.sqrt(qx * qx + qy * qy) || 1;
  var ang = Math.atan2(qy, qx), side = 1, r = b.r;
  var size = b.char.punch.size * 1.25;
  var reachR = Math.max(r + 6, Math.min(qd - other.r + 4, r + b.char.punch.reach + 10));
  var fist, trail = [], windup = kr.phase === "run";
  function hookAt(k) {
    var a = ang + side * (KO_HOOK_OPEN - (KO_HOOK_OPEN + KO_HOOK_FOLLOW) * k);
    var rr = r * 1.2 + (reachR - r * 1.2) * Math.sin(Math.min(1, k / 0.76) * Math.PI / 2);
    return { x: b.x + Math.cos(a) * rr, y: b.y + Math.sin(a) * rr };
  }
  var w = Math.min(1, kr.t / 0.35);
  if (windup) {
    // Coiled further and further back the closer the charge gets.
    var ca = ang + side * (KO_HOOK_OPEN + 0.35 * w);
    fist = { x: b.x + Math.cos(ca) * r * 1.25 + (Math.random() - 0.5) * 4 * w, y: b.y + Math.sin(ca) * r * 1.25 + (Math.random() - 0.5) * 4 * w };
  } else {
    var start = KO_PUNCH_HIT - KO_HOOK_SWEEP * 0.76; // the sweep reaches the target at hitAt
    var k = Math.max(0, Math.min(1, (kp.t - start) / KO_HOOK_SWEEP));
    if (kp.t < start) {
      var ca2 = ang + side * (KO_HOOK_OPEN + 0.35);
      fist = { x: b.x + Math.cos(ca2) * r * 1.25, y: b.y + Math.sin(ca2) * r * 1.25 };
    } else if (k < 1) {
      fist = hookAt(k);
      [0.12, 0.24, 0.36].forEach(function (back) { if (k - back > 0) trail.push(hookAt(k - back)); });
    } else {
      // Recover back to guard.
      var e = hookAt(1), rest = { x: b.x + Math.cos(ang) * r * 0.8, y: b.y + Math.sin(ang) * r * 0.8 };
      var q = Math.min(1, (kp.t - start - KO_HOOK_SWEEP) / Math.max(0.01, kp.dur - start - KO_HOOK_SWEEP));
      fist = { x: e.x + (rest.x - e.x) * q, y: e.y + (rest.y - e.y) * q };
    }
  }
  var shA = ang + side * Math.PI / 2;
  var sx = b.x + Math.cos(shA) * r * 0.55, sy = b.y + Math.sin(shA) * r * 0.55;
  ctx.save();
  ctx.lineCap = "round";
  if (windup) {
    // Telegraph: the arc the hook will sweep through, aimed at the opponent.
    var a0 = ang + side * KO_HOOK_OPEN, a1 = ang - side * KO_HOOK_FOLLOW;
    ctx.setLineDash([8, 6]);
    ctx.globalAlpha = 0.3 + 0.6 * w;
    ctx.strokeStyle = theme.hit; ctx.lineWidth = 3.5;
    ctx.beginPath(); ctx.arc(b.x, b.y, reachR, Math.min(a0, a1), Math.max(a0, a1)); ctx.stroke();
    ctx.setLineDash([]);
    ctx.globalAlpha = 1;
  }
  trail.forEach(function (t, i) {
    ctx.globalAlpha = 0.35 - i * 0.09;
    ctx.fillStyle = b.char.color;
    ctx.beginPath(); ctx.arc(t.x, t.y, size * 0.95, 0, Math.PI * 2); ctx.fill();
  });
  ctx.globalAlpha = 1;
  ctx.strokeStyle = theme.wall; ctx.lineWidth = size * 0.9 + 6;
  ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(fist.x, fist.y); ctx.stroke();
  ctx.strokeStyle = b.char.color; ctx.lineWidth = size * 0.6;
  ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(fist.x, fist.y); ctx.stroke();
  ctx.fillStyle = b.char.color; ctx.strokeStyle = theme.wall; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(fist.x, fist.y, size, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.globalAlpha = 0.35 + 0.25 * Math.sin(performance.now() / 60);
  ctx.strokeStyle = theme.hit; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(fist.x, fist.y, size + 5, 0, Math.PI * 2); ctx.stroke();
  ctx.restore();
}

// A short, quick hook: swings round from the side, through the target, and
// snaps back to guard.
function drawQuickHook(b, kp) {
  var tgt = balls[kp.targetId], r = b.r, side = kp.side || 1;
  var ang = Math.atan2(tgt.y - b.y, tgt.x - b.x);
  var qd = koDistance(b, tgt);
  var reachR = Math.max(r + 6, qd - tgt.r + 4);
  var open = kp.open || QHOOK_OPEN, follow = kp.follow || QHOOK_FOLLOW, coil = kp.coil || 0;
  var kHit = open / (open + follow);
  function at(k) {
    var a = ang + side * (open - (open + follow) * k);
    var rr = r * 1.1 + (reachR - r * 1.1) * Math.sin(Math.min(1, k / kHit) * Math.PI / 2);
    return { x: b.x + Math.cos(a) * rr, y: b.y + Math.sin(a) * rr };
  }
  var fist, trail = [], st = kp.t - coil;
  if (st < 0) {
    // Coiling way back before the hook loops round.
    var c = kp.t / coil, ca = ang + side * (open + 0.35 * c);
    fist = { x: b.x + Math.cos(ca) * r * 1.15, y: b.y + Math.sin(ca) * r * 1.15 };
  } else if (st < kp.sweep) {
    var k = st / kp.sweep;
    fist = at(k);
    (kp.heavy ? [0.08, 0.16, 0.24, 0.32] : [0.15, 0.3]).forEach(function (back) { if (k - back > 0) trail.push(at(k - back)); });
  } else {
    var e = at(1), q = Math.min(1, (st - kp.sweep) / (kp.dur - coil - kp.sweep));
    var gx = b.x + Math.cos(ang) * r * 0.8 + Math.cos(ang + side * Math.PI / 2) * r * 0.4;
    var gy = b.y + Math.sin(ang) * r * 0.8 + Math.sin(ang + side * Math.PI / 2) * r * 0.4;
    fist = { x: e.x + (gx - e.x) * q, y: e.y + (gy - e.y) * q };
  }
  var shA = ang + side * Math.PI / 2;
  var sx = b.x + Math.cos(shA) * r * 0.55, sy = b.y + Math.sin(shA) * r * 0.55;
  var size = kp.size;
  ctx.save();
  ctx.lineCap = "round";
  trail.forEach(function (t, i) {
    ctx.globalAlpha = kp.heavy ? 0.4 - i * 0.09 : 0.3 - i * 0.12;
    ctx.fillStyle = b.char.color;
    ctx.beginPath(); ctx.arc(t.x, t.y, size * 0.9, 0, Math.PI * 2); ctx.fill();
  });
  ctx.globalAlpha = 1;
  ctx.strokeStyle = theme.wall; ctx.lineWidth = size * 0.9 + 6;
  ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(fist.x, fist.y); ctx.stroke();
  ctx.strokeStyle = b.char.color; ctx.lineWidth = size * 0.6;
  ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(fist.x, fist.y); ctx.stroke();
  ctx.fillStyle = b.char.color; ctx.strokeStyle = theme.wall; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(fist.x, fist.y, size, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.restore();
}

// Hands up, pumping, bouncing on the spot.
function drawKoCelebrate(b) {
  var tt = b.koRush.t, r = b.r;
  ctx.save();
  ctx.lineCap = "round";
  [-1, 1].forEach(function (sgn, i) {
    var pump = Math.max(0, Math.sin(tt * 11 + i * Math.PI)) * r * 0.4;
    var hx = b.x + sgn * r * 0.85, hy = b.y - r * 1.05 - pump;
    var sx = b.x + sgn * r * 0.62, sy = b.y - r * 0.55;
    ctx.strokeStyle = theme.wall; ctx.lineWidth = r * 0.34;
    ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(hx, hy); ctx.stroke();
    ctx.strokeStyle = b.char.color; ctx.lineWidth = r * 0.2;
    ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(hx, hy); ctx.stroke();
    ctx.fillStyle = b.char.color; ctx.strokeStyle = theme.wall; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.arc(hx, hy, r * 0.32, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  });
  ctx.restore();
}

// Stars circling the head of a knocked-out fighter.
function drawKoOut(b) {
  if (!b.koOut) return;
  var t = performance.now() / 1000;
  ctx.save();
  // Dimmed: out cold.
  ctx.fillStyle = "rgba(0,0,0,0.28)";
  ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2); ctx.fill();
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.font = '900 18px "Barlow Condensed", "Arial Narrow", sans-serif';
  var cy = b.y - b.r - 32;
  if (cy < 14) cy = b.y + b.r + 30;
  for (var i = 0; i < 3; i++) {
    var a = t * 5 + i * Math.PI * 2 / 3;
    var sx = b.x + Math.cos(a) * b.r * 0.8, sy = cy + Math.sin(a) * 6;
    ctx.lineWidth = 4; ctx.lineJoin = "round";
    ctx.strokeStyle = theme.floor; ctx.strokeText("\u2605", sx, sy);
    ctx.fillStyle = "#f5c518"; ctx.fillText("\u2605", sx, sy);
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
