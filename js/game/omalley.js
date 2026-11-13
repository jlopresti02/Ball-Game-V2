// Sean O'Malley, "Suga" (Christian, 2026-11-12). Bantamweight.
//
// Crits       his punches are critical hits `suga.crit.chance`% of the time,
//             for `crit.mult` times the damage ("CRIT!", a pink and gold
//             star burst and a ding). Hooked into the punch in abilities.js
//             (sugaCritRoll, sugaCritLanded).
// Suga KO    (suga.critKo) a boosted crit, with a sweet in him, knocks them
//             out cold `base`% of the time at full health, up to base + low%
//             the more hurt they are (never in the first `after` seconds). He walks off with his arms up while
//             they slump, then it's called.
// Crane kick  every few seconds when he's close (suga.craneKick): he goes up
//             on one leg with both arms out like wings (the Karate Kid crane)
//             while a pink path shows where the kick will go. That's the tell:
//             some opponents read it and back off (readChance). Then he leaps
//             in with a front kick for `damage` that knocks them into the
//             cage (`wallSlams`). It whiffs if they got out of range.
// Sweets      sweets pop up in the ring (suga.sweets), one at a time: a
//             lollipop (doubles his crit chance), a gummy bear (doubles his
//             crit damage) or, rarely, a golden donut (both). Both fighters
//             race for it, dashed lines showing who's heading where: if he
//             gets there first he eats it, if the opponent does they stomp it
//             flat. The boost is momentary (`boost.time`), with a ring round
//             him that drains as it runs out. Every sweet he eats changes his
//             braids to the next of his real fight-night hair colours
//             (suga.hair, look.hairColors), with the event shown under him
//             (`hairTag`).
// Sugar crash after `crash.after` sweets (pips beside his health bar count
//             them) he's on a sugar high until the last boost runs out, then
//             he crashes: he rolls at `crash.slow` speed (slowdown.js), his
//             hands slow to `crash.attackSlow` and he can't crane kick or go
//             after sweets for `crash.time` seconds.
// Sugar Rush  his special (special.move "sugarrush"), Claude's call since the
//             spec didn't say what the special is: he throws both arms up,
//             says "Welcome to the Suga Show." and `sweets` sweets rain down
//             into the ring, `donuts` of them golden donuts. The race is on,
//             and three of them means a crash.
// Voice lines "Welcome to the Suga Show." at the start of the fight
//             (`voice.start`% of fights) and on Sugar Rush, and "Is this
//             real?" when he wins (speech.js).
// The crane kick runs on b.crane, the sweets on sgSweets; Sugar Rush runs on
// b.igbb (move "sugarrush") for its call only.
"use strict";

var SG_R = 15;            // a sweet's size
var SG_FALL_H = 430;      // how high the Sugar Rush sweets fall from
var SG_LAND = 0.18;       // the crane kick's landing
var SG_TAG = 1.6;         // how long the hair-colour event tag stays up
var SG_WIN_BEAT = 0.7;    // "Is this real?" this long after the win
var SG_KO_HOLD = 1.5;     // the walk-off after a Suga KO, before it's called
var SG_GUMMY = ["#ff3b3b", "#35c64a", "#ff9f1c", "#ffcf1f"];
var sgSweets = [];        // sweets in the ring (and falling into it)
var sgSplats = [];        // stomped sweets on the mat
var sgClock = 0, sgFightT = 0, sgSpawnT = 0, sgNextId = 1, sgWinT = 0;

function sgRand(r) { return r[0] + Math.random() * (r[1] - r[0]); }
function sgCfg(b) { return b && b.char && b.char.suga; }
function craneOn(b) { return !!(b && b.crane); }
function sugarRushCalling(b) { return !!(b && b.igbb && b.igbb.move === "sugarrush"); }
function sugaCrashed(b) { return !!(b && b.sugar && b.sugar.crashT > 0); }
function sugaHigh(b) { return !!(b && b.sugar && b.sugar.highT > 0); }
// On one leg or in the air for the crane kick: the speed regulator leaves
// him alone (physics.js).
function omalleyBusy(b) { return (craneOn(b) && b.crane.phase !== "land") || !!(b && b.sgKo); }
// His arms are drawn by drawOmalley (drawHands skips them, draw-attacks.js).
function omalleyHandsBusy(b) { return omalleyBusy(b) || sugarRushCalling(b); }

// From startMatchSeeded.
function resetOmalley() {
  sgSweets = []; sgSplats = []; sgClock = 0; sgFightT = 0; sgNextId = 1; sgWinT = 0;
  sgSpawnT = Infinity;
  if (balls) balls.forEach(function (b) {
    var sw = sgCfg(b) && sgCfg(b).sweets;
    if (sw) sgSpawnT = Math.min(sgSpawnT, sgRand(sw.first));
  });
}
// From makeBall.
function initOmalley(b) {
  b.crane = null; b.sugaCrit = null; b.sgRace = null; b.sgSaid = null; b.sgSeen = null; b.sgWon = false; b.sgKo = null;
  var cfg = sgCfg(b);
  if (!cfg) return;
  // His own copy of the fighter, so his hair can change colour mid-fight
  // without touching the roster (or the other one, in a mirror match).
  b.char = JSON.parse(JSON.stringify(b.char));
  b.craneT = cfg.craneKick ? sgRand(cfg.craneKick.first) : Infinity;
  b.sugar = { n: 0, chanceT: 0, multT: 0, highT: 0, crashT: 0, hair: cfg.hairStart || 0, flash: 0, tagT: 0 };
  b.sgAtkRate = b.atkRate;
  sugaHair(b, b.sugar.hair);
}
function sugaHair(b, ix) {
  var hair = sgCfg(b).hair;
  if (!hair || !hair.length || !b.char.look) return;
  var h = hair[((ix % hair.length) + hair.length) % hair.length];
  b.char.look.hairColors = h.colors.slice();
  b.char.look.hairColor = h.colors[0];
  b.sugar.event = h.event;
}

// ---------------------------------------------------------------- crits

// From the punch in abilities.js: how many times its damage this punch does.
function sugaCritRoll(b) {
  var cfg = sgCfg(b);
  b.sugaCrit = null;
  if (!cfg || !cfg.crit) return 1;
  var su = b.sugar, bo = (cfg.sweets && cfg.sweets.boost) || {};
  var chance = cfg.crit.chance * (su.chanceT > 0 ? (bo.chance || 2) : 1);
  if (Math.random() * 100 >= chance) return 1;
  var mult = cfg.crit.mult * (su.multT > 0 ? (bo.mult || 2) : 1);
  b.sugaCrit = { mult: mult, boosted: su.chanceT > 0 || su.multT > 0 };
  return mult;
}
// From the punch in abilities.js, when it landed.
function sugaCritLanded(self, other) {
  var c = self.sugaCrit;
  self.sugaCrit = null;
  if (!c) return;
  var dx = other.x - self.x, dy = other.y - self.y, d = Math.sqrt(dx * dx + dy * dy) || 1, ux = dx / d, uy = dy / d;
  var cx = other.x - ux * other.r, cy = other.y - uy * other.r;
  floater(other.x, other.y - other.r - 34, c.boosted ? "SUGA CRIT!" : "CRIT!", "crit");
  impacts.push({ x: cx, y: cy, nx: -ux, ny: -uy, life: 0.35, max: 0.35, color: c.boosted ? "#ffd34d" : "#ff5fa8" });
  hitStop = Math.max(hitStop, c.boosted ? 0.08 : 0.05);
  if (!reduceMotion) {
    shake = Math.max(shake, c.boosted ? 14 : 9);
    for (var i = 0; i < (c.boosted ? 18 : 11); i++) {
      var a = Math.atan2(-uy, -ux) + (nativeRandom() - 0.5) * 3, s = 140 + nativeRandom() * 300;
      particles.push({ x: cx, y: cy, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 0.35 + nativeRandom() * 0.25, max: 0.6, size: 2 + nativeRandom() * 3, color: i % 3 === 0 ? "#ffffff" : (i % 3 === 1 ? "#ffd34d" : "#ff5fa8") });
    }
  }
  other.squash = { t: 0.12, max: 0.12, nx: -ux, ny: -uy };
  playCritDing(c.boosted);
  crowdReact(c.boosted ? 0.5 : 0.25);
  // A Suga KO: a boosted crit can put them out cold.
  var ko = sgCfg(self).critKo;
  // (Not if either of them is tied up: a counter grab can come off the same punch.)
  var free = sgKnockable(other) && !other.holdAtOne && !other.guard && !other.sprawl && !other.sprawled && !self.grappled && !self.grapple && !self.sprawl;
  if (ko && c.boosted && free && sgFightT >= (ko.after || 0) && Math.random() * 100 < ko.base + ko.low * (1 - other.hp / MAX_HP)) {
    other.hp = 0; other.koOut = true;
    other.punch = null; other.kick = null; other.swing = null; other.throwAnim = null; other.jabAnim = null;
    other.vx = ux * 260; other.vy = uy * 260;
    knockoutFx(self, other);
    clearActions(self);
    self.sgKo = { t: 0, targetId: other.id };
    crowdReact(1);
  }
}
// Out cold: he walks off with his arms up while they slump (from the
// abilities loop, so he throws nothing else meanwhile).
function sugaKoWalkOff(self, other, dt) {
  self.punch = null; self.kick = null; // (nothing half-thrown left hanging)
  var dx = self.x - other.x, dy = self.y - other.y, d = Math.sqrt(dx * dx + dy * dy) || 1;
  self.vx = dx / d * 110; self.vy = dy / d * 110;
  return true;
}
// Then it's called (from tickOmalley, so it always ends).
function tickSugaKo(self, dt) {
  var m = self.sgKo, other = balls[m.targetId];
  m.t += dt;
  if (other.koOut) { var damp = Math.exp(-5 * dt); other.vx *= damp; other.vy *= damp; }
  if (m.t >= SG_KO_HOLD || !other.koOut) {
    self.sgKo = null;
    finishKnockedOut(other);
    checkEnd();
  }
}

// ---------------------------------------------------------------- crane kick

function craneInterrupted(b) {
  return !b.alive || b.slam || b.grappled || b.grapple || b.sprawl || b.sprawled || subLocked(b) || b.guard || b.koOut ||
    b.shocked || b.dazed || b.dizzy || b.shelled || b.checkStun > 0 || b.igbb;
}
// Backing off from a crane kick they saw coming (only while they're rolling
// about on their own).
function sgBackOff(self, other) {
  if (!other.alive || !inOrdinaryMovement(other) || other.angry) return;
  var dx = other.x - self.x, dy = other.y - self.y, d = Math.sqrt(dx * dx + dy * dy) || 1;
  var sp = Math.max(Math.sqrt(other.vx * other.vx + other.vy * other.vy), 200);
  other.vx = dx / d * sp; other.vy = dy / d * sp;
}

// From the abilities loop, before the special. True while it's running.
function updateCraneKick(self, other, dt) {
  if (self.sgKo) return sugaKoWalkOff(self, other, dt); // (and the walk-off after a Suga KO)
  var cfg = sgCfg(self), ck = cfg && cfg.craneKick;
  if (!ck) return false;
  var m = self.crane;
  if (m && (craneInterrupted(self) || other.igbb)) { endCrane(self); return false; } // (their special took over)
  var dx = other.x - self.x, dy = other.y - self.y, d = Math.sqrt(dx * dx + dy * dy) || 1;
  if (!m) {
    if (!started || over || self.igbb || sugaCrashed(self)) return false;
    self.craneT -= dt;
    if (self.craneT > 0 || d > self.r + other.r + ck.range || !canStartIgbb(self, other) || swordDuelActive()) return false;
    clearActions(self);
    self.vx = 0; self.vy = 0;
    m = self.crane = { phase: "pose", t: 0, aim: Math.atan2(dy, dx), read: Math.random() * 100 < (ck.readChance || 0), hit: false };
    floater(self.x, self.y - self.r - 30, "CRANE KICK!", "crit");
    if (m.read) floater(other.x, other.y - other.r - 30, "!", "crit");
    playCraneCall();
    crowdReact(0.3);
  }
  m.t += dt;
  if (m.phase === "pose") {
    self.vx = 0; self.vy = 0;
    m.aim = Math.atan2(dy, dx); // keeps them lined up until he jumps
    if (m.read) sgBackOff(self, other);
    if (m.t >= ck.pose) { m.phase = "leap"; m.t = 0; playWhoosh(); }
    return true;
  }
  if (m.phase === "leap") {
    self.vx = Math.cos(m.aim) * ck.lunge; self.vy = Math.sin(m.aim) * ck.lunge;
    if (m.read) sgBackOff(self, other);
    if (!m.hit && m.t >= ck.leap * 0.6) { m.hit = true; landCraneKick(self, other, ck, m); }
    if (m.t >= ck.leap) { m.phase = "land"; m.t = 0; }
    if (!reduceMotion) particles.push({ x: self.x, y: self.y, vx: -self.vx * 0.1, vy: -self.vy * 0.1, life: 0.2, max: 0.2, size: self.r * 0.5, color: self.char.color });
    return true;
  }
  // Landing: drifts to a stop, then back to normal.
  var damp = Math.exp(-9 * dt);
  self.vx *= damp; self.vy *= damp;
  if (m.t >= SG_LAND) { endCrane(self); return false; }
  return true;
}

function landCraneKick(self, other, ck, m) {
  if (!other.alive || other.koOut) return;
  var dx = other.x - self.x, dy = other.y - self.y, d = Math.sqrt(dx * dx + dy * dy) || 1;
  if (d > self.r + other.r + ck.reach) {
    floater(other.x, other.y - other.r - 8, "WHIFF", "dodge"); // they read it and got out of range
    return;
  }
  var dealt = hurt(other, ck.damage, "kick", self.id);
  if (dealt > 0) {
    var ux = dx / d, uy = dy / d;
    playKick(); playCraneSnap();
    impacts.push({ x: other.x - ux * other.r, y: other.y - uy * other.r, nx: -ux, ny: -uy, life: 0.4, max: 0.4, color: "#ff5fa8" });
    hitStop = Math.max(hitStop, 0.07);
    if (!reduceMotion) shake = Math.max(shake, 14);
    crowdReact(0.6);
    if (other.alive && sgKnockable(other)) {
      if (ck.wallSlams > 0) beginWallSlam(other, ux, uy, { wallSlams: ck.wallSlams, slamDamage: ck.slamDamage, knockback: ck.knockback });
      else { other.vx += ux * ck.knockback; other.vy += uy * ck.knockback; }
    }
  }
  checkEnd();
}
function sgKnockable(o) { return o.alive && !o.grappled && !o.grapple && !o.slam && !subLocked(o) && !o.igbb && !o.koOut && !o.justDodged; }

function endCrane(self) {
  var ck = sgCfg(self).craneKick;
  self.crane = null;
  self.craneT = sgRand(ck.every);
  if (self.alive && inOrdinaryMovement(self)) setSpeed(self, self.baseSpeed || SPEED);
}

// ---------------------------------------------------------------- Sugar Rush

// From updateSpecial (special.js) for special.move "sugarrush".
function updateSugarRush(self, other, dt) {
  var sp = self.char.special;
  if (!self.igbb) {
    if (self.specialT < sp.chargeTime || !started || over || craneOn(self) || sugaCrashed(self) || sugaHigh(self) || !canStartIgbb(self, other)) return false;
    clearActions(self);
    self.igbb = { move: "sugarrush", phase: "call", t: 0 };
    self.vx = 0; self.vy = 0;
    floater(self.x, self.y - self.r - 84, "SUGAR RUSH!", "crit"); // (over the speech bubble)
    if (canSay(self)) say(self, "Welcome to the Suga Show.");
    playSugarRush();
    crowdReact(1);
  }
  var m = self.igbb;
  if (m.move !== "sugarrush") return false;
  m.t += dt;
  self.vx = 0; self.vy = 0;
  if (m.t >= (sp.call || 1)) {
    rainSweets(self, sp);
    self.igbb = null;
    self.specialT = 0;
    if (self.alive) setSpeed(self, self.baseSpeed || SPEED);
    return false;
  }
  return true;
}

// The shower: sweets falling in from high over the cage, a little apart.
function rainSweets(self, sp) {
  var n = sp.sweets || 5, donuts = Math.min(n, sp.donuts || 0), spots = [];
  for (var i = 0; i < n; i++) {
    var kind = i < donuts ? "donut" : (Math.random() < 0.5 ? "lollipop" : "gummy");
    var spot = pickSweetSpot(spots, 0, 55);
    spots.push(spot);
    addSweet(kind, spot.x, spot.y, { fall: (sp.fall || 0.7) + i * 0.13, life: (sgCfg(self).sweets || {}).life, quiet: kind !== "donut" });
  }
}

// ---------------------------------------------------------------- sweets

function addSweet(kind, x, y, o) {
  var s = { id: sgNextId++, kind: kind, x: x, y: y, t: 0, life: (o && o.life) || 9, fall: (o && o.fall) || 0, color: SG_GUMMY[Math.floor(Math.random() * SG_GUMMY.length)], spin: Math.random() * 6, quiet: !!(o && o.quiet) };
  s.fallMax = s.fall;
  sgSweets.push(s);
  if (!s.fall) sweetLanded(s);
  return s;
}
function sweetLanded(s) {
  s.t = 0;
  if (!s.quiet) floater(s.x, s.y - SG_R - 14, s.kind === "donut" ? "GOLDEN DONUT!" : (s.kind === "gummy" ? "GUMMY BEAR" : "LOLLIPOP"), s.kind === "donut" ? "crit" : "note");
  for (var i = 0; i < 10 && !reduceMotion; i++) {
    var a = i / 10 * Math.PI * 2, sp = 90 + nativeRandom() * 90;
    particles.push({ x: s.x, y: s.y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 0.3, max: 0.3, size: 2 + nativeRandom() * 1.5, color: i % 2 ? "#ffffff" : sweetColor(s) });
  }
  playSweetPop(s.kind);
  if (s.kind === "donut") crowdReact(0.4);
}
function sweetColor(s) { return s.kind === "donut" ? "#ffd34d" : (s.kind === "gummy" ? s.color : "#ff5fa8"); }

// A spot for a new sweet: away from the walls, the fighters and other
// sweets. With `contested`% it's the spot of several tried that's the most
// even race between the two of them.
function pickSweetSpot(others, contested, gap) {
  var best = null, bestScore = Infinity, first = null;
  for (var i = 0; i < 14; i++) {
    var x = 45 + Math.random() * (W - 90), y = 45 + Math.random() * (H - 90), ok = true;
    others.forEach(function (o) { if ((o.x - x) * (o.x - x) + (o.y - y) * (o.y - y) < gap * gap) ok = false; });
    var ds = balls.map(function (b) { return Math.sqrt((b.x - x) * (b.x - x) + (b.y - y) * (b.y - y)); });
    if (balls.some(function (b, k) { return b.alive && ds[k] < b.r + 45; })) ok = false;
    if (!ok) continue;
    if (!first) first = { x: x, y: y };
    var score = Math.abs(ds[0] - ds[1]);
    if (score < bestScore) { bestScore = score; best = { x: x, y: y }; }
  }
  if (!first) return { x: W / 2 + (Math.random() - 0.5) * 200, y: H / 2 + (Math.random() - 0.5) * 200 };
  return Math.random() * 100 < contested ? best : first;
}
function pickSweetKind(odds) {
  var total = 0, k;
  for (k in odds) total += odds[k];
  var roll = Math.random() * total;
  for (k in odds) { roll -= odds[k]; if (roll < 0) return k; }
  return "lollipop";
}

// Someone who can head for a sweet right now: rolling about freely.
function canRace(b) {
  return b.alive && started && !over && inOrdinaryMovement(b) && !b.angry && !b.dizzy && !b.koOut &&
    !(sgCfg(b) && (sugaCrashed(b) || sugaHigh(b)));
}
function nearestSweet(b) {
  var best = null, bd = Infinity;
  sgSweets.forEach(function (s) {
    if (s.fall > 0 || s.gone) return;
    var d = (s.x - b.x) * (s.x - b.x) + (s.y - b.y) * (s.y - b.y);
    if (d < bd) { bd = d; best = s; }
  });
  return best;
}
// Turns toward the sweet at a sprint (the speed regulator then holds it).
function steerToSweet(b, s, sw, dt) {
  var sp0 = Math.sqrt(b.vx * b.vx + b.vy * b.vy) || 1;
  var cur = Math.atan2(b.vy, b.vx), want = Math.atan2(s.y - b.y, s.x - b.x);
  var diff = Math.atan2(Math.sin(want - cur), Math.cos(want - cur));
  var turn = Math.max(-sw.turn * dt, Math.min(sw.turn * dt, diff));
  var sp = Math.max(sp0, (b.baseSpeed || SPEED) * slowMult(b) * (sw.sprint || 1));
  b.vx = Math.cos(cur + turn) * sp; b.vy = Math.sin(cur + turn) * sp;
}

function eatSweet(b, s) {
  var cfg = sgCfg(b), sw = cfg.sweets || {}, su = b.sugar, kind = (sw.kinds && sw.kinds[s.kind]) || {}, bt = (sw.boost && sw.boost.time) || 4;
  s.gone = true;
  su.n++;
  var boosts = kind.boosts || [];
  if (boosts.indexOf("chance") >= 0) su.chanceT = bt;
  if (boosts.indexOf("mult") >= 0) su.multT = bt;
  su.hair++; sugaHair(b, su.hair);
  su.flash = 0.5; su.tagT = cfg.hairTag ? SG_TAG : 0;
  var label = s.kind === "donut" ? "2x CRIT CHANCE + DAMAGE" : (s.kind === "gummy" ? "2x CRIT DAMAGE" : "2x CRIT CHANCE");
  floater(b.x, b.y - b.r - 30, label, "note");
  if (cfg.crash && su.n >= cfg.crash.after) {
    su.highT = Math.max(su.chanceT, su.multT, 0.6); // a sugar high until the boost runs out, then the crash
    floater(b.x, b.y - b.r - 56, "SUGAR HIGH", "crit");
  }
  for (var i = 0; i < 16 && !reduceMotion; i++) {
    var a = nativeRandom() * Math.PI * 2, sp = 80 + nativeRandom() * 200;
    particles.push({ x: b.x, y: b.y - b.r * 0.7, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 60, life: 0.5, max: 0.5, size: 2 + nativeRandom() * 2.5, color: b.char.look ? b.char.look.hairColors[i % b.char.look.hairColors.length] : sweetColor(s) });
  }
  playSweetEat(s.kind);
  crowdReact(s.kind === "donut" ? 0.6 : 0.3);
}

function stompSweet(b, s) {
  s.gone = true;
  floater(s.x, s.y - SG_R - 14, "STOMPED!", "crit");
  sgSplats.push({ x: s.x, y: s.y, t: 0, color: sweetColor(s), kind: s.kind, rot: Math.random() * 6 });
  b.squash = { t: 0.12, max: 0.12, nx: 0, ny: -1 };
  for (var i = 0; i < 14 && !reduceMotion; i++) {
    var a = nativeRandom() * Math.PI * 2, sp = 100 + nativeRandom() * 220;
    particles.push({ x: s.x, y: s.y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 0.4, max: 0.4, size: 2 + nativeRandom() * 3, color: i % 3 ? sweetColor(s) : "#ffffff" });
  }
  if (!reduceMotion) shake = Math.max(shake, 5);
  playSweetStomp();
  crowdReact(0.25);
}

function startSugarCrash(b) {
  var cr = sgCfg(b).crash, su = b.sugar;
  su.highT = 0; su.chanceT = 0; su.multT = 0;
  su.crashT = cr.time;
  addSlow(b, cr.slow, cr.time, "sugarcrash");
  if (cr.attackSlow) b.atkRate = b.sgAtkRate * cr.attackSlow;
  floater(b.x, b.y - b.r - 30, "SUGAR CRASH", "crit");
  playSugarCrash();
  crowdReact(0.3);
}
function endSugarCrash(b) {
  b.sugar.crashT = 0; b.sugar.n = 0;
  b.atkRate = b.sgAtkRate;
}

// ---------------------------------------------------------------- every frame

// From update(): the sweets (spawning, falling, the race, eating and
// stomping), his boosts, sugar highs and crashes, and his voice lines.
function tickOmalley(dt) {
  sgClock += dt;
  var sugas = balls.filter(function (b) { return !!sgCfg(b); });
  if (!sugas.length) return;
  if (started && !over) sgFightT += dt;
  var frozen = (typeof allAmericanOn === "function" && allAmericanOn()) || (typeof auraFarmOn === "function" && auraFarmOn());

  sugas.forEach(function (b) {
    var su = b.sugar, cfg = sgCfg(b);
    if (b.sgKo) tickSugaKo(b, dt);
    su.flash = Math.max(0, su.flash - dt);
    su.tagT = Math.max(0, su.tagT - dt);
    if (!b.alive) return;
    su.chanceT = Math.max(0, su.chanceT - dt);
    su.multT = Math.max(0, su.multT - dt);
    if (su.highT > 0) { su.highT -= dt; if (su.highT <= 0) startSugarCrash(b); }
    else if (su.crashT > 0) { su.crashT -= dt; if (su.crashT <= 0) endSugarCrash(b); }
    // "Welcome to the Suga Show." as the fight gets going.
    var v = cfg.voice || {};
    if (!b.sgSaid && started && sgFightT > 0.6) {
      b.sgSaid = true;
      if (v.start && Math.random() * 100 < v.start && canSay(b)) say(b, "Welcome to the Suga Show.");
    }
  });

  // "Is this real?" after a win.
  if (over) {
    sgWinT += dt;
    sugas.forEach(function (b) {
      var v = sgCfg(b).voice || {};
      if (v.win && b.alive && !balls[1 - b.id].alive && !b.sgWon && sgWinT >= SG_WIN_BEAT) { b.sgWon = true; say(b, "Is this real?"); }
    });
  }

  sgSplats.forEach(function (p) { p.t += dt; });
  sgSplats = sgSplats.filter(function (p) { return p.t < 2.6; });
  if (frozen) return;

  // A new sweet once the last one's gone (not while he's on a sugar high
  // or crashed, or anyone's in the middle of a special).
  var sw0 = sgCfg(sugas[0]).sweets;
  if (sw0 && started && !over && !sgSweets.length) {
    var anyUp = sugas.some(function (b) { return b.alive && !sugaCrashed(b) && !sugaHigh(b); });
    if (anyUp && !jumboHold(null)) {
      sgSpawnT -= dt;
      if (sgSpawnT <= 0) {
        var spot = pickSweetSpot([], sw0.contested || 0, 0);
        addSweet(pickSweetKind(sw0.odds || { lollipop: 1 }), spot.x, spot.y, { life: sw0.life });
        sgSpawnT = sgRand(sw0.every);
      }
    }
  }

  // Falling in from the Sugar Rush, then sitting there bobbing until it melts.
  sgSweets.forEach(function (s) {
    if (s.fall > 0) {
      s.fall -= dt;
      if (s.fall <= 0) { s.fall = 0; sweetLanded(s); }
      return;
    }
    s.t += dt;
    if (s.t >= s.life) s.gone = true;
  });

  // The race: both of them head for the nearest sweet.
  balls.forEach(function (b) {
    var was = b.sgRace;
    b.sgRace = null;
    if (!canRace(b)) return;
    var s = nearestSweet(b);
    if (!s) return;
    if (was == null && !sgCfg(b) && sgClock - (b.sgSeen || -9) > 2) {
      b.sgSeen = sgClock;
      floater(b.x, b.y - b.r - 30, "!", "crit"); // the opponent spots it and goes for it
    }
    b.sgRace = s.id;
    steerToSweet(b, s, sw0 || { turn: 5, sprint: 1 }, dt);
  });

  // Getting there: he eats it, anyone else stomps it.
  sgSweets.forEach(function (s) {
    if (s.fall > 0 || s.gone) return;
    balls.forEach(function (b) {
      if (s.gone || !b.alive || b.koOut) return;
      var dx = s.x - b.x, dy = s.y - b.y, reach = b.r + SG_R * 0.6;
      if (dx * dx + dy * dy > reach * reach) return;
      if (sgCfg(b)) {
        if (!sugaCrashed(b) && !sugaHigh(b) && !b.grappled && !b.slam && !b.igbb) eatSweet(b, s);
      } else if (!b.grappled && !b.igbb) stompSweet(b, s);
    });
  });
  sgSweets = sgSweets.filter(function (s) { return !s.gone; });
}

// ---------------------------------------------------------------- drawing

// How high he's lifted off the mat right now (the crane stance, the leap).
function sgLift(b) {
  var m = b.crane;
  if (!m) return 0;
  var ck = sgCfg(b).craneKick;
  if (m.phase === "pose") return b.r * 0.14 * easeOut(Math.min(1, m.t / 0.2));
  if (m.phase === "leap") return b.r * (0.14 + 0.3 * Math.sin(Math.PI * Math.min(1, m.t / ck.leap)));
  return b.r * 0.14 * Math.max(0, 1 - m.t / SG_LAND);
}
// From draw(), with the other body poses: up on one leg, flying in, buzzing
// on a sugar high, slumped in a crash.
function applyOmalleyPose(b) {
  if (!sgCfg(b) || !b.alive) return;
  var lift = sgLift(b), ay = b.y + b.r;
  if (lift) {
    var wob = b.crane.phase === "pose" ? Math.sin(sgClock * 23) * 0.04 : 0; // balancing on one leg
    ctx.translate(b.x, ay); ctx.rotate(wob); ctx.translate(-b.x, -ay);
    ctx.translate(0, -lift);
    if (b.crane.phase === "leap") { ctx.translate(b.x, b.y); ctx.scale(1.08, 1.08); ctx.translate(-b.x, -b.y); }
    return;
  }
  if (sugaHigh(b)) { ctx.translate(Math.sin(sgClock * 61) * 1.6, Math.cos(sgClock * 47) * 1.2); return; }
  if (sugaCrashed(b)) { ctx.translate(b.x, ay); ctx.scale(1.05, 0.93); ctx.translate(-b.x, -ay); }
}

// Under the fighters: stomped sweets, the crane kick's path, the race lines
// and the sweets on the mat. From draw().
function drawOmalleyUnder() {
  if (!balls.some(function (b) { return !!sgCfg(b); })) return;
  if (typeof allAmericanOn === "function" && allAmericanOn()) return; // out on the highway
  sgSplats.forEach(drawSplat);
  balls.forEach(function (b) {
    var m = b.crane;
    if (!b.alive || !m || m.phase !== "pose") return;
    // The crane kick's path: a pink chevron lane where he's about to fly.
    var ck = sgCfg(b).craneKick, len = ck.lunge * ck.leap * 0.6 + ck.reach + b.r;
    var on = Math.min(1, m.t / 0.2), flash = m.t > ck.pose - 0.25 ? 0.55 + 0.45 * Math.sin(sgClock * 40) : 1;
    var ux = Math.cos(m.aim), uy = Math.sin(m.aim), px = -uy, py = ux, w = b.r * 0.8;
    ctx.save();
    ctx.globalAlpha = 0.62 * on * flash;
    ctx.fillStyle = "#ff5fa8";
    ctx.beginPath();
    ctx.moveTo(b.x + px * w * 0.6, b.y + py * w * 0.6);
    ctx.lineTo(b.x + ux * len + px * w, b.y + uy * len + py * w);
    ctx.lineTo(b.x + ux * len - px * w, b.y + uy * len - py * w);
    ctx.lineTo(b.x - px * w * 0.6, b.y - py * w * 0.6);
    ctx.closePath(); ctx.fill();
    ctx.globalAlpha = 0.9 * on * flash; ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 3.5; ctx.lineCap = "round"; ctx.lineJoin = "round";
    for (var c = 0; c < 3; c++) {
      var k = ((sgClock * 2.2 + c / 3) % 1) * 0.75 + 0.2, cx = b.x + ux * len * k, cy = b.y + uy * len * k, cw = w * 0.55;
      ctx.beginPath(); ctx.moveTo(cx - ux * cw * 0.6 + px * cw, cy - uy * cw * 0.6 + py * cw); ctx.lineTo(cx, cy); ctx.lineTo(cx - ux * cw * 0.6 - px * cw, cy - uy * cw * 0.6 - py * cw); ctx.stroke();
    }
    ctx.restore();
  });
  // Who's racing for which sweet: a dashed line from each of them to it.
  balls.forEach(function (b) {
    if (!b.alive || b.sgRace == null) return;
    var s = sgSweets.filter(function (q) { return q.id === b.sgRace; })[0];
    if (!s) return;
    var dx = s.x - b.x, dy = s.y - b.y, d = Math.sqrt(dx * dx + dy * dy) || 1, ux = dx / d, uy = dy / d;
    if (d < b.r + SG_R + 6) return;
    var x0 = b.x + ux * (b.r + 4), y0 = b.y + uy * (b.r + 4), x1 = s.x - ux * (SG_R + 8), y1 = s.y - uy * (SG_R + 8);
    ctx.save();
    ctx.globalAlpha = 0.75; ctx.lineCap = "round";
    ctx.strokeStyle = theme.wall; ctx.lineWidth = 6; ctx.setLineDash([9, 8]); ctx.lineDashOffset = -sgClock * 60;
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
    ctx.strokeStyle = b.char.color; ctx.lineWidth = 3.5;
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = b.char.color; ctx.strokeStyle = theme.wall; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(x1 + ux * 6, y1 + uy * 6); ctx.lineTo(x1 - ux * 6 - uy * 7, y1 - uy * 6 + ux * 7); ctx.lineTo(x1 - ux * 6 + uy * 7, y1 - uy * 6 - ux * 7); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.restore();
  });
  sgSweets.forEach(function (s) {
    if (s.fall > 0) { drawSweetShadow(s); return; }
    var melt = Math.max(0, Math.min(1, (s.life - s.t) / 0.8)), pop = Math.min(1, s.t / 0.25);
    var size = SG_R * (pop < 1 ? easeOut(pop) * 1.25 - 0.25 * pop * pop : 1) * (0.4 + 0.6 * melt);
    var blink = s.life - s.t < 2 ? 0.55 + 0.45 * Math.abs(Math.cos(s.t * 9)) : 1;
    ctx.save();
    ctx.globalAlpha = melt * blink;
    // A ring pulsing out from it so it can't be missed.
    var pr = (sgClock * 1.4 + s.id * 0.3) % 1;
    ctx.globalAlpha = melt * (1 - pr) * 0.7;
    ctx.strokeStyle = sweetColor(s); ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(s.x, s.y, SG_R * (1.2 + pr * 1.6), 0, Math.PI * 2); ctx.stroke();
    ctx.globalAlpha = melt * blink;
    ctx.fillStyle = "rgba(0,0,0,0.18)";
    ctx.beginPath(); ctx.ellipse(s.x, s.y + SG_R * 0.85, size * 0.85, size * 0.28, 0, 0, Math.PI * 2); ctx.fill();
    drawSweet(s, s.x, s.y + Math.sin(sgClock * 4 + s.id) * 1.6 - 2, size);
    ctx.restore();
  });
}

// Over the fighters: Sugar Rush sweets falling in. From draw().
function drawOmalleyOver() {
  if (!sgSweets.length || (typeof allAmericanOn === "function" && allAmericanOn())) return;
  sgSweets.forEach(function (s) {
    if (!(s.fall > 0)) return;
    var k = s.fall / s.fallMax, h = k * k * SG_FALL_H;
    ctx.save();
    ctx.globalAlpha = Math.min(1, (1 - k) * 4) * 0.6;
    ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 4; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(s.x, s.y - h - SG_R * 1.4); ctx.lineTo(s.x, s.y - h - SG_R * 1.4 - 30 - 60 * k); ctx.stroke();
    ctx.globalAlpha = Math.min(1, (1 - k) * 4);
    drawSweet(s, s.x, s.y - h, SG_R * (1 + k * 0.35), sgClock * 5 + s.spin);
    ctx.restore();
  });
}
function drawSweetShadow(s) {
  var k = s.fall / s.fallMax;
  ctx.save();
  ctx.globalAlpha = 0.15 + 0.35 * (1 - k);
  ctx.fillStyle = "#000000";
  ctx.beginPath(); ctx.ellipse(s.x, s.y + SG_R * 0.6, SG_R * (0.4 + 0.6 * (1 - k)), SG_R * (0.15 + 0.2 * (1 - k)), 0, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

function drawSweet(s, x, y, size, rot) {
  if (s.kind === "donut") drawDonut(x, y, size, rot || 0);
  else if (s.kind === "gummy") drawGummy(x, y, size, s.color, rot || 0);
  else drawLollipop(x, y, size, rot || 0);
}
// A pink and white swirl lollipop on a stick.
function drawLollipop(x, y, R, rot) {
  ctx.save();
  ctx.translate(x, y); ctx.rotate(rot);
  ctx.lineCap = "round";
  ctx.strokeStyle = theme.wall; ctx.lineWidth = R * 0.32;
  ctx.beginPath(); ctx.moveTo(R * 0.3, R * 0.3); ctx.lineTo(R * 1.15, R * 1.2); ctx.stroke();
  ctx.strokeStyle = "#f6f2ea"; ctx.lineWidth = R * 0.18; ctx.stroke();
  var d = R * 0.82;
  ctx.fillStyle = "#ff5fa8"; ctx.strokeStyle = theme.wall; ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.arc(0, 0, d, 0, Math.PI * 2); ctx.fill();
  ctx.save(); ctx.clip();
  ctx.strokeStyle = "#ffffff"; ctx.lineWidth = R * 0.2;
  ctx.beginPath();
  for (var a = 0; a <= Math.PI * 5; a += 0.2) {
    var rr = d * a / (Math.PI * 5) * 1.05;
    if (a === 0) ctx.moveTo(0, 0); else ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
  }
  ctx.stroke();
  ctx.restore();
  ctx.beginPath(); ctx.arc(0, 0, d, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = "rgba(255,255,255,0.55)";
  ctx.beginPath(); ctx.ellipse(-d * 0.35, -d * 0.4, d * 0.28, d * 0.14, -0.6, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}
// A see-through gummy bear.
function drawGummy(x, y, R, col, rot) {
  ctx.save();
  ctx.translate(x, y); ctx.rotate(rot);
  var parts = function () {
    ctx.beginPath();
    ctx.arc(0, -R * 0.42, R * 0.42, 0, Math.PI * 2);
    ctx.moveTo(-R * 0.18, -R * 0.78); ctx.arc(-R * 0.32, -R * 0.78, R * 0.15, 0, Math.PI * 2);
    ctx.moveTo(R * 0.47, -R * 0.78); ctx.arc(R * 0.32, -R * 0.78, R * 0.15, 0, Math.PI * 2);
    ctx.moveTo(R * 0.5, R * 0.28); ctx.ellipse(0, R * 0.28, R * 0.5, R * 0.58, 0, 0, Math.PI * 2);
    ctx.moveTo(-R * 0.36, R * 0.04); ctx.ellipse(-R * 0.52, R * 0.04, R * 0.18, R * 0.13, 0.5, 0, Math.PI * 2);
    ctx.moveTo(R * 0.68, R * 0.04); ctx.ellipse(R * 0.52, R * 0.04, R * 0.18, R * 0.13, -0.5, 0, Math.PI * 2);
    ctx.moveTo(-R * 0.1, R * 0.8); ctx.arc(-R * 0.3, R * 0.8, R * 0.2, 0, Math.PI * 2);
    ctx.moveTo(R * 0.5, R * 0.8); ctx.arc(R * 0.3, R * 0.8, R * 0.2, 0, Math.PI * 2);
  };
  ctx.strokeStyle = theme.wall; ctx.lineWidth = 5; ctx.lineJoin = "round";
  parts(); ctx.stroke();
  ctx.fillStyle = col; parts(); ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.45)";
  ctx.beginPath(); ctx.ellipse(-R * 0.15, -R * 0.55, R * 0.16, R * 0.09, -0.5, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(-R * 0.2, R * 0.12, R * 0.12, R * 0.22, 0.2, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "rgba(0,0,0,0.45)";
  ctx.beginPath(); ctx.arc(-R * 0.14, -R * 0.45, R * 0.05, 0, Math.PI * 2); ctx.arc(R * 0.14, -R * 0.45, R * 0.05, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}
// The rare golden donut: glazed, sprinkled, glowing and twinkling.
function drawDonut(x, y, R, rot) {
  ctx.save();
  ctx.translate(x, y);
  var glow = 0.35 + 0.2 * Math.sin(sgClock * 6);
  var gg = ctx.createRadialGradient(0, 0, R * 0.5, 0, 0, R * 2);
  gg.addColorStop(0, "rgba(255,215,80," + glow + ")"); gg.addColorStop(1, "rgba(255,215,80,0)");
  ctx.fillStyle = gg; ctx.beginPath(); ctx.arc(0, 0, R * 2, 0, Math.PI * 2); ctx.fill();
  ctx.rotate(rot);
  var ring = function (ro, ri) { ctx.beginPath(); ctx.arc(0, 0, ro, 0, Math.PI * 2); ctx.moveTo(ri, 0); ctx.arc(0, 0, ri, 0, Math.PI * 2, true); };
  var dg = ctx.createRadialGradient(-R * 0.3, -R * 0.3, R * 0.1, 0, 0, R);
  dg.addColorStop(0, "#fff0a6"); dg.addColorStop(0.6, "#f2c23a"); dg.addColorStop(1, "#b9861a");
  ctx.fillStyle = dg; ctx.strokeStyle = theme.wall; ctx.lineWidth = 2.5;
  ring(R, R * 0.36); ctx.fill("evenodd"); ctx.stroke();
  // the glaze, with a wavy edge
  ctx.fillStyle = "#ffe36e";
  ctx.beginPath();
  for (var i = 0; i <= 24; i++) {
    var a = i / 24 * Math.PI * 2, rr = R * (0.8 + (i % 2 ? 0.06 : -0.02));
    if (!i) ctx.moveTo(Math.cos(a) * rr, Math.sin(a) * rr); else ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
  }
  ctx.moveTo(R * 0.46, 0); ctx.arc(0, 0, R * 0.46, 0, Math.PI * 2, true);
  ctx.fill("evenodd");
  // sprinkles
  ctx.lineCap = "round"; ctx.lineWidth = Math.max(1.5, R * 0.1);
  ["#ff5fa8", "#2d7ff9", "#ffffff", "#35c64a", "#ff5fa8", "#ffffff", "#2d7ff9", "#ff9f1c"].forEach(function (c, k) {
    var a = k / 8 * Math.PI * 2 + 0.3, rr = R * (k % 2 ? 0.58 : 0.68), t = a * 2.3;
    ctx.strokeStyle = c;
    ctx.beginPath(); ctx.moveTo(Math.cos(a) * rr - Math.cos(t) * R * 0.07, Math.sin(a) * rr - Math.sin(t) * R * 0.07); ctx.lineTo(Math.cos(a) * rr + Math.cos(t) * R * 0.07, Math.sin(a) * rr + Math.sin(t) * R * 0.07); ctx.stroke();
  });
  ctx.restore();
  // twinkles round it
  ctx.save();
  ctx.fillStyle = "#ffffff";
  for (var s = 0; s < 3; s++) {
    var ta = sgClock * 1.5 + s * 2.1, tw = Math.max(0, Math.sin(sgClock * 5 + s * 2));
    sparkle(x + Math.cos(ta) * R * 1.35, y + Math.sin(ta) * R * 1.35, R * 0.35 * tw);
  }
  ctx.restore();
}
// A four-point twinkle.
function sparkle(x, y, s) {
  if (s <= 0.2) return;
  ctx.beginPath();
  ctx.moveTo(x, y - s); ctx.quadraticCurveTo(x, y, x + s, y); ctx.quadraticCurveTo(x, y, x, y + s);
  ctx.quadraticCurveTo(x, y, x - s, y); ctx.quadraticCurveTo(x, y, x, y - s);
  ctx.fill();
}
// A stomped sweet flattened on the mat, fading away.
function drawSplat(p) {
  var k = Math.max(0, 1 - p.t / 2.6);
  ctx.save();
  ctx.globalAlpha = 0.8 * Math.min(1, k * 2);
  ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.scale(1, 0.62);
  ctx.fillStyle = p.color; ctx.strokeStyle = theme.wall; ctx.lineWidth = 2;
  ctx.beginPath();
  for (var i = 0; i <= 12; i++) {
    var a = i / 12 * Math.PI * 2, rr = SG_R * (i % 2 ? 1.25 : 0.85) * (1 + 0.15 * Math.sin(i * 3.1));
    if (!i) ctx.moveTo(Math.cos(a) * rr, Math.sin(a) * rr); else ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
  }
  ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = "rgba(255,255,255,0.6)";
  [[0.7, -0.9], [-1.4, 0.4], [1.5, 0.8], [-0.3, 1.5]].forEach(function (q) { ctx.beginPath(); ctx.arc(q[0] * SG_R, q[1] * SG_R, 2.2, 0, Math.PI * 2); ctx.fill(); });
  ctx.restore();
}

// From draw(), per fighter, after its hands: the crane kick and Sugar Rush
// arms and legs, the boost ring, the sugar pips, the crash and the hair tag.
function drawOmalley(b) {
  var cfg = sgCfg(b);
  if (!cfg || !b.alive) return;
  var su = b.sugar, lift = sgLift(b);
  if (b.crane && b.crane.phase === "pose") drawCraneStance(b, lift);
  else if (b.crane && b.crane.phase === "leap") drawCraneLeap(b, lift);
  else if (sugarRushCalling(b) || b.sgKo) drawSugarRushArms(b);

  // The boost: a ring draining as it runs out, pink for crit chance, orange
  // for crit damage, gold for both.
  var bt = Math.max(su.chanceT, su.multT), bmax = (cfg.sweets && cfg.sweets.boost && cfg.sweets.boost.time) || 4;
  if (bt > 0) {
    var col = su.chanceT > 0 && su.multT > 0 ? "#ffd34d" : (su.chanceT > 0 ? "#ff5fa8" : "#ff9f1c");
    ctx.save();
    ctx.lineCap = "round";
    ctx.globalAlpha = 0.35; ctx.strokeStyle = col; ctx.lineWidth = 9;
    ctx.beginPath(); ctx.arc(b.x, b.y - lift, b.r + 7, 0, Math.PI * 2); ctx.stroke();
    ctx.globalAlpha = 0.95; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.arc(b.x, b.y - lift, b.r + 7, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * Math.min(1, bt / bmax)); ctx.stroke();
    ctx.fillStyle = "#ffffff";
    for (var i = 0; i < 4; i++) {
      var a = sgClock * 3 + i * Math.PI / 2;
      sparkle(b.x + Math.cos(a) * (b.r + 12), b.y - lift + Math.sin(a) * (b.r + 12), 4 + 2 * Math.sin(sgClock * 9 + i));
    }
    ctx.restore();
  }
  // Hair just changed: a burst of sparkle round his head.
  if (su.flash > 0) {
    ctx.save();
    ctx.globalAlpha = su.flash / 0.5;
    ctx.strokeStyle = b.char.look ? b.char.look.hairColors[0] : "#ff5fa8"; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.arc(b.x, b.y - b.r * 0.7 - lift, b.r * (0.5 + (0.5 - su.flash) * 1.6), Math.PI * 1.05, Math.PI * 1.95); ctx.stroke();
    ctx.restore();
  }
  // Crashed: greyed out, with sleepy Z's drifting up.
  if (sugaCrashed(b)) {
    var ck2 = Math.min(1, su.crashT / 0.4);
    ctx.save();
    ctx.globalAlpha = 0.28 * ck2; ctx.fillStyle = "#5b6475";
    ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = ck2;
    ctx.font = '900 18px "Barlow Condensed", "Arial Narrow", sans-serif'; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.lineWidth = 4; ctx.lineJoin = "round"; ctx.strokeStyle = theme.floor; ctx.fillStyle = "#4a6fd1";
    for (var z = 0; z < 3; z++) {
      var zk = (sgClock * 0.6 + z / 3) % 1;
      ctx.globalAlpha = ck2 * Math.sin(zk * Math.PI);
      var zx = b.x + b.r * 0.6 + zk * 16, zy = b.y - b.r * 0.9 - zk * 34;
      ctx.font = '900 ' + Math.round(12 + zk * 10) + 'px "Barlow Condensed", "Arial Narrow", sans-serif';
      ctx.strokeText("Z", zx, zy); ctx.fillText("Z", zx, zy);
    }
    ctx.restore();
  }
  // Sugar pips beside his health bar: one per sweet toward the crash.
  var after = cfg.crash ? cfg.crash.after : 0;
  if (after && cfg.sweets && (su.n > 0 || sgSweets.length)) {
    var by = b.y - b.r - 18;
    if (by < 4) by = b.y + b.r + 10;
    ctx.save();
    for (var p = 0; p < after; p++) {
      var px = b.x + 32 + 8 + p * 11, py = by + 4, full = p < su.n;
      var hot = sugaHigh(b) ? 1 + 0.25 * Math.sin(sgClock * 20) : 1;
      ctx.fillStyle = sugaCrashed(b) ? "#8a8f9a" : (full ? "#ff5fa8" : "rgba(255,255,255,0.75)");
      ctx.strokeStyle = theme.wall; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(px, py, 4.2 * (full ? hot : 1), 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    }
    ctx.restore();
  }
  // Which fight's hair he's in now (his real event colours).
  if (su.tagT > 0 && su.event) {
    var tk = Math.min(1, su.tagT / 0.3, (SG_TAG - su.tagT) / 0.15 + 0.2);
    ctx.save();
    ctx.globalAlpha = Math.max(0, tk);
    ctx.font = '800 15px "Barlow Condensed", "Arial Narrow", sans-serif'; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    var tw = ctx.measureText(su.event + " HAIR").width + 12, tx = Math.min(W - tw / 2 - 2, Math.max(tw / 2 + 2, b.x)), ty = Math.min(H - 10, b.y + b.r + 14);
    ctx.fillStyle = "#ffffff"; ctx.strokeStyle = theme.wall; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.roundRect(tx - tw / 2, ty - 9, tw, 18, 9); ctx.fill(); ctx.stroke();
    var cols = b.char.look ? b.char.look.hairColors : ["#ff5fa8"];
    ctx.fillStyle = cols[0]; ctx.fillText(su.event + " HAIR", tx, ty + 1);
    ctx.restore();
  }
}

// Up on one leg for the crane kick: the kicking knee raised toward them,
// both arms out and up like wings with the wrists dropped.
function drawCraneStance(b, lift) {
  var m = b.crane, ux = Math.cos(m.aim), s = ux >= 0 ? 1 : -1, r = b.r, cy = b.y - lift;
  var size = (b.char.punch.size || 13), skin = armColor(b.char), shorts = b.char.look ? b.char.look.shorts : b.char.color;
  var flap = Math.sin(sgClock * 10) * r * 0.06, rise = easeOut(Math.min(1, m.t / 0.2));
  ctx.save();
  // the raised leg: thigh up and forward, shin hanging, toes pointed
  var hip = { x: b.x + s * r * 0.62, y: cy + r * 0.62 }, knee = { x: b.x + s * r * (0.85 + 0.55 * rise), y: cy + r * (0.62 - 0.55 * rise) }, foot = { x: knee.x - s * r * 0.05, y: knee.y + r * 0.68 };
  strokeLimb(size * 0.85, skin, function () { ctx.moveTo(hip.x, hip.y); ctx.lineTo(knee.x, knee.y); ctx.lineTo(foot.x, foot.y); });
  strokeLimb(size * 1.05, shorts, function () { ctx.moveTo(hip.x, hip.y); ctx.lineTo(hip.x + (knee.x - hip.x) * 0.3, hip.y + (knee.y - hip.y) * 0.3); });
  strokeLimb(size * 0.6, skin, function () { ctx.moveTo(foot.x, foot.y); ctx.lineTo(foot.x + s * r * 0.16, foot.y + r * 0.08); });
  // the wings
  [-1, 1].forEach(function (k) {
    var sh = { x: b.x + k * r * 0.86, y: cy - r * 0.32 };
    var el = { x: b.x + k * r * (1.05 + 0.4 * rise), y: cy - r * (0.5 + 0.45 * rise) + flap * k };
    var hd = { x: b.x + k * r * (1.2 + 0.55 * rise), y: cy - r * (0.38 + 0.55 * rise) - flap * k };
    strokeLimb(size * 0.62, armColor(b.char, k), function () { ctx.moveTo(sh.x, sh.y); ctx.lineTo(el.x, el.y); ctx.lineTo(hd.x, hd.y); });
    drawGloveAt(hd.x, hd.y, size * 0.8, b.char, Math.PI / 2 + k * 0.5);
  });
  ctx.restore();
}
// Flying in with the front kick: the leg straight out at them, foot first.
function drawCraneLeap(b, lift) {
  var m = b.crane, ck = sgCfg(b).craneKick, ux = Math.cos(m.aim), uy = Math.sin(m.aim), px = -uy, py = ux, r = b.r, cy = b.y - lift;
  var size = (b.char.kick.size || 15), skin = armColor(b.char), shorts = b.char.look ? b.char.look.shorts : b.char.color;
  var ext = Math.min(1, m.t / (ck.leap * 0.55)), len = r * 0.2 + (ck.reach + r * 0.4) * easeOut(ext);
  var hip = { x: b.x + ux * r * 0.92, y: cy + uy * r * 0.92 }, tip = { x: hip.x + ux * len, y: hip.y + uy * len };
  ctx.save();
  // arms: one up guarding, one thrown back for balance
  [[1, 0.55, 0.3], [-1, -0.9, -0.2]].forEach(function (a) {
    var sh = { x: b.x + px * a[0] * r * 0.55, y: cy + py * a[0] * r * 0.55 - r * 0.15 };
    var hd = { x: sh.x + ux * r * a[1] + px * a[0] * r * 0.45, y: sh.y + uy * r * a[1] + py * a[0] * r * 0.45 - r * a[2] };
    strokeLimb((b.char.punch.size || 13) * 0.62, armColor(b.char, a[0]), function () { ctx.moveTo(sh.x, sh.y); ctx.lineTo(hd.x, hd.y); });
    drawGloveAt(hd.x, hd.y, (b.char.punch.size || 13) * 0.8, b.char, m.aim);
  });
  strokeLimb(size * 0.66, skin, function () { ctx.moveTo(hip.x, hip.y); ctx.lineTo(tip.x, tip.y); });
  strokeLimb(size * 0.85, shorts, function () { ctx.moveTo(hip.x, hip.y); ctx.lineTo(hip.x + ux * len * 0.3, hip.y + uy * len * 0.3); });
  ctx.translate(tip.x, tip.y); ctx.rotate(m.aim);
  drawKickFoot(size, skin, ux >= 0 ? -1 : 1); // toes up: the ball of the foot leads
  ctx.restore();
  // speed lines behind him
  ctx.save();
  ctx.strokeStyle = "rgba(255,255,255,0.8)"; ctx.lineWidth = 3; ctx.lineCap = "round";
  for (var i = -1; i <= 1; i++) {
    var ox = b.x - ux * r * 1.2 + px * i * r * 0.5, oy = cy - uy * r * 1.2 + py * i * r * 0.5;
    ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(ox - ux * r * (0.6 + 0.3 * Math.abs(i)), oy - uy * r * (0.6 + 0.3 * Math.abs(i))); ctx.stroke();
  }
  ctx.restore();
}
// Both arms thrown up for Sugar Rush (or walking off a Suga KO), pumping,
// with sparkles off the gloves.
function drawSugarRushArms(b) {
  var t = b.igbb ? b.igbb.t : sgClock, r = b.r, size = (b.char.punch.size || 13);
  ctx.save();
  [-1, 1].forEach(function (k, i) {
    var pump = Math.max(0, Math.sin(t * 12 + i * Math.PI)) * r * 0.3;
    var sh = { x: b.x + k * r * 0.62, y: b.y - r * 0.5 }, hd = { x: b.x + k * r * 0.95, y: b.y - r * 1.15 - pump };
    strokeLimb(size * 0.62, armColor(b.char, k), function () { ctx.moveTo(sh.x, sh.y); ctx.lineTo(hd.x, hd.y); });
    drawGloveAt(hd.x, hd.y, size * 0.85, b.char, -Math.PI / 2);
    ctx.fillStyle = k < 0 ? "#ff5fa8" : "#ffd34d";
    sparkle(hd.x + k * 10, hd.y - 12 - pump * 0.3, 6 + 3 * Math.sin(sgClock * 14 + i));
  });
  ctx.restore();
}

// ---------------------------------------------------------------- sound
// Synthesized, like the rest of the game's stand-ins.

function sgAudio(fn) {
  try {
    var ac = getAudioCtx();
    if (!ac) return;
    if (ac.state === "suspended") ac.resume();
    fn(ac, ac.currentTime);
  } catch (e) { /* never let audio break the game */ }
}
// A critical punch: a bright ding over the punch (two, a fifth apart, when boosted).
function playCritDing(boosted) {
  sgAudio(function (ac, t) {
    caneTone(ac, t, "sine", 2640, 2600, 0.3, 0.28);
    caneTone(ac, t, "sine", 3960, 3900, 0.12, 0.2);
    if (boosted) { caneTone(ac, t + 0.07, "sine", 3520, 3480, 0.25, 0.3); caneBurst(ac, t, 6000, 1.5, 0.25, 0.08); }
  });
}
// Going up into the crane: a rising bird call.
function playCraneCall() {
  sgAudio(function (ac, t) {
    caneTone(ac, t, "sine", 1100, 2300, 0.22, 0.2);
    caneTone(ac, t + 0.21, "sine", 2300, 1500, 0.18, 0.26);
  });
}
// The front kick snapping in.
function playCraneSnap() {
  sgAudio(function (ac, t) { caneBurst(ac, t, 4200, 1.6, 0.55, 0.05); caneTone(ac, t, "triangle", 900, 300, 0.25, 0.1); });
}
// A sweet popping up (a shimmer for the golden donut).
function playSweetPop(kind) {
  sgAudio(function (ac, t) {
    caneBurst(ac, t, 1900, 2, 0.35, 0.04);
    caneTone(ac, t, "sine", 520, 1250, 0.25, 0.09);
    if (kind === "donut") [1320, 1660, 1980, 2640].forEach(function (f, i) { caneTone(ac, t + 0.06 + i * 0.06, "sine", f, f, 0.16, 0.2); });
  });
}
// Eating it: two crunchy munches, then a happy chime.
function playSweetEat(kind) {
  sgAudio(function (ac, t) {
    caneBurst(ac, t, 1100, 1.1, 0.5, 0.05);
    caneBurst(ac, t + 0.09, 900, 1.1, 0.45, 0.05);
    var notes = kind === "donut" ? [1046, 1318, 1568, 2093] : [1046, 1568];
    notes.forEach(function (f, i) { caneTone(ac, t + 0.16 + i * 0.07, "triangle", f, f, 0.22, 0.18); });
  });
}
// Stomped: a thud and a crunch.
function playSweetStomp() {
  sgAudio(function (ac, t) {
    caneTone(ac, t, "sine", 150, 55, 0.6, 0.14);
    caneBurst(ac, t, 650, 0.8, 0.55, 0.08);
    for (var i = 0; i < 3; i++) caneBurst(ac, t + 0.02 + i * 0.025, 2600 + i * 500, 1.2, 0.3, 0.03);
  });
}
// The crash: a sad trombone slide, wah-wahhh.
function playSugarCrash() {
  sgAudio(function (ac, t) {
    caneTone(ac, t, "triangle", 392, 330, 0.3, 0.32);
    caneTone(ac, t + 0.34, "triangle", 330, 196, 0.3, 0.7);
  });
}
// Sugar Rush: a bright jingle up the scale.
function playSugarRush() {
  sgAudio(function (ac, t) {
    [1046, 1318, 1568, 2093, 2637].forEach(function (f, i) { caneTone(ac, t + i * 0.07, "triangle", f, f, 0.24, 0.22); });
    caneBurst(ac, t + 0.35, 5000, 1.2, 0.2, 0.25);
  });
}
