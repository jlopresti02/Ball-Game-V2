// Sean O'Malley, "Suga" (Christian, 2026-11-12; the candy rain 2026-11-13;
// the sniper's right hand and his real lines 2026-11-14). Bantamweight.
//
// Sniper      (suga.snipe) fewer punches, more single power shots. Every
//             `every` seconds, when they're `minGap`-`maxGap` away, he plants
//             and lines them up for `aim` seconds: lead hand out measuring,
//             right hand cocked by his chin, a laser from his glove to them
//             and a scope closing in on them ("SNIPER!"). The aim follows them
//             (`track`) until the last `lock` seconds, when it locks and goes
//             red. Then one long straight right: he flies down the line at
//             `speed`, leaning after them a little (`turn`), for `damage` with
//             `crit`% more crit chance on top of his own ("SNIPED!", and a
//             Suga KO like any crit). A sniper crit is `critMult` times the
//             damage (opt-in; without it, his normal `crit.mult`).
//             `readChance`% of the time they see it coming ("!") and slip
//             out of the line, and it whiffs; he's off balance for `miss`
//             seconds. It can be slipped or blocked like any punch. Runs on
//             b.sgSnipe, from updateCraneKick.
// Crits       his punches are critical hits for `suga.crit.mult` times the
//             damage ("CRIT!", a pink and gold star burst and a ding),
//             `crit.chance`% of the time plus `sugar.crit`% for every sugar
//             he's carrying (below), never more than `sugar.maxChance`%.
//             Hooked into the punch in abilities.js (sugaCritRoll,
//             sugaCritLanded).
// Candy rain  (suga.candy) candies drop into the ring all fight long, one
//             every `every` seconds while fewer than `max` are on the mat,
//             their shadows showing where they'll land: lollipops, gummy
//             bears, wrapped candies, gumballs, candy canes, cotton candy and
//             now and then a golden donut (`kinds`, each with its `odds`).
//             They melt after `life` seconds. Only he goes for them: the
//             opponent never does, and they don't touch the opponent at all.
// Sweet tooth (suga.drift) every `every` seconds, between exchanges (not with
//             them within `notWithin` of him), he leans toward the nearest
//             candy within `range` for `time` seconds: a curve at `turn`, not
//             a beeline, and he still fights all the way. A candy he touches
//             is his (`candy.reach`), and one within `candy.magnet` of him
//             slides into him, so nothing can knock him off it.
// Sugar       (suga.sugar) each candy adds its `sugar` (a golden donut 3) to a
//             stack shown beside his health bar ("SUGAR x4"), up to `cap`,
//             each one `crit`% more crit chance. He loses one every `drain`
//             seconds he goes without. Every candy also switches his braids to
//             the next of his real fight-night hair colours (suga.hair), with
//             the event shown under him now and then (`hairTag`, at most once
//             every `hairTagGap` seconds).
// Sugar high  (suga.crash) at the cap he's on a SUGAR HIGH for `high` seconds:
// and crash   buzzing, a gold ring draining round him, crits at the cap. Cotton
//             candy (`crash: true` in its kind) is pure sugar: it fills him to
//             the cap on the spot. Then the crash: for `time` seconds he's
//             greyed out with Z's, rolling at `slow` of his speed
//             (slowdown.js) and throwing at `attackSlow` of his rate, too
//             drowsy to eat, go after candy or crane kick, and his stack is
//             cut to `keep` of what it was.
// Suga KO    (suga.critKo) a crit with `sugar` or more in him (or on the high)
//             is a SUGA CRIT: it knocks them out cold `base`% of the time at
//             full health, up to base + low% the more hurt they are (never in
//             the first `after` seconds). He walks off with his arms up while
//             they slump, then it's called.
// Crane kick  every few seconds when he's close (suga.craneKick): he goes up
//             on one leg with both arms out like wings (the Karate Kid crane)
//             while a pink path shows where the kick will go. That's the tell:
//             some opponents read it and back off (readChance). Then he leaps
//             in with a front kick for `damage` that knocks them into the
//             cage (`wallSlams`). It whiffs if they got out of range.
// Sugar Rush  his special (special.move "sugarrush"): he throws both arms up,
//             says "Welcome to the Suga Show." and `sweets` more candies rain
//             down on top of the rain (over the `max`), `donuts` of them golden
//             donuts and none of them cotton candy. Then for `hunt` seconds he
//             goes after them for real, straight at each one (`huntTurn`) at
//             `huntSprint` times his speed with the magnet twice as strong,
//             until he's on the sugar high.
// Voice lines his real lines, Christian's picks (suga.lines, through say(),
//             so they go on the talk channel), the exact text as the clip key.
//             Every time (they wait up to `voice.wait` seconds for their turn
//             rather than be dropped): one of `start` at the start of
//             `voice.start`% of fights (100; against Ilia Topuria his
//             `linesVs` callout instead), "Welcome to the Suga Show." on every
//             Sugar Rush, one of `win` on every win (or `comeback` if
//             he won from behind and hasn't said it yet), and one of `loss`
//             after every loss (`voice.loss`). Now and then, at
//             most one every `voice.gap` seconds: `sniper` as he lines one up
//             (`voice.snipeAim`%) or lands it (`snipeLand`%), `rightHand`
//             after a SNIPED! (`rightHand`%), `bigShot` after a crane kick or
//             a SUGA CRIT lands (`bigShot`%), `combo` after a clean
//             combination (`combo`%, combos.js), and `comeback` (`comeback`%)
//             once a fight, when he draws level after being `comebackDown`
//             points behind. Empty slots stay silent: `candy` (`voice.candy`%
//             of the candies he eats), `donut`, `sugarHigh`, `crash`, `wakeUp`.
// Combos      (combos, combos.js) only a rare one-two-kick now.
// The crane kick runs on b.crane, the candies on sgSweets, the lean on
// b.sgDrift; Sugar Rush runs on b.igbb (move "sugarrush") for its call only.
"use strict";

var SG_R = 15;            // a candy's size
var SG_FALL_H = 430;      // how high the Sugar Rush candies fall from
var SG_DROP_H = 240;      // how high the rain falls from
var SG_LAND = 0.18;       // the crane kick's landing
var SG_TAG = 1.6;         // how long the hair-colour event tag stays up
var SG_POP = 0.3;         // the SUGAR pill swelling when it goes up
var SG_PULL = 480;        // how fast a candy slides into him (the magnet)
var SG_WIN_BEAT = 0.7;    // "Is this real?" this long after the win
var SG_LOSS_BEAT = 1.8;   // his loss line no sooner than this after the loss
var SG_KO_HOLD = 1.5;     // the walk-off after a Suga KO, before it's called
var SG_SNIPE_SETTLE = 0.16; // pulling the right hand back after a snipe lands
var SG_GUMMY = ["#ff3b3b", "#35c64a", "#ff9f1c", "#ffcf1f"];
var SG_BRIGHT = ["#ff5fa8", "#2d7ff9", "#35c64a", "#ffcf1f", "#8a3ffc", "#ff9f1c"]; // wrappers and gumballs
var sgSweets = [];        // candies in the ring (and falling into it)
var sgClock = 0, sgFightT = 0, sgSpawnT = 0, sgNextId = 1, sgWinT = 0;

function sgRand(r) { return typeof r === "number" ? r : r[0] + Math.random() * (r[1] - r[0]); }
function sgCfg(b) { return b && b.char && b.char.suga; }
function craneOn(b) { return !!(b && b.crane); }
function sugarRushCalling(b) { return !!(b && b.igbb && b.igbb.move === "sugarrush"); }
function sugaCrashed(b) { return !!(b && b.sugar && b.sugar.crashT > 0); }
function sugaHigh(b) { return !!(b && b.sugar && b.sugar.highT > 0); }
// On one leg or in the air for the crane kick, or lining up and firing a
// snipe: the speed regulator leaves him alone (physics.js).
function omalleyBusy(b) { return (craneOn(b) && b.crane.phase !== "land") || !!(b && (b.sgKo || b.sgSnipe)); }
// His arms are drawn by drawOmalley (drawHands skips them, draw-attacks.js).
function omalleyHandsBusy(b) { return omalleyBusy(b) || sugarRushCalling(b); }
function sgDist(a, b) { var dx = b.x - a.x, dy = b.y - a.y; return Math.sqrt(dx * dx + dy * dy) || 1; }
function sgTurn(a, want, maxStep) { var d = Math.atan2(Math.sin(want - a), Math.cos(want - a)); return a + Math.max(-maxStep, Math.min(maxStep, d)); }

// ---------------------------------------------------------------- his lines

// A slot's lines (suga.lines), or his lines for this one opponent
// (suga.linesVs, by fighter id) when he has some for that moment.
function sgLines(b, key) {
  var cfg = sgCfg(b), o = balls && balls[1 - b.id], vs = cfg.linesVs && o && o.char && cfg.linesVs[o.char.id];
  if (vs && vs[key] && vs[key].length) return vs[key];
  return cfg.lines && cfg.lines[key];
}
// Says a line from a slot if he's quiet. True if he said it. (A line with
// no clip yet is silent but still takes its turn, speech.js.)
function sgSay(b, key) {
  var lines = sgLines(b, key);
  if (!lines || !lines.length || !canSay(b)) return false;
  say(b, pickLine(b, lines, key));
  return true;
}
// A line for something that just happened in the fight: `chance`% of the
// time, and never within `voice.gap` seconds of his last one (and never
// while one of his always-lines is waiting for its turn).
function sgMoment(b, key, chance) {
  var v = sgCfg(b).voice || {};
  if (b.sgDue || !(chance > 0) || Math.random() * 100 >= chance) return false;
  if (sgFightT - b.sgLineT < (v.gap || 0)) return false;
  if (!sgSay(b, key)) return false;
  b.sgLineT = sgFightT;
  return true;
}
// Lines that play every time (the start of the fight, the win, Sugar Rush's
// call): rather than be dropped because someone else is talking (playTalk
// skips a line that would wait more than TALK_WAIT), the line waits until
// he's quiet and the talk channel can take it, for up to `voice.wait`
// seconds. Then it goes through say() like any other.
function sgSayAlways(b, text) {
  if (!text) return;
  b.sgDue = { text: text, t: 0 };
  tickSgDue(b, 0);
}
function sgTalkClear() {
  if (typeof audioCtx === "undefined" || !audioCtx || audioCtx.state !== "running" || typeof talkEnd === "undefined") return true;
  var left = talkEnd - audioCtx.currentTime;
  return left <= 0 || (!talkQueued && left <= TALK_WAIT - 0.1);
}
function tickSgDue(b, dt) {
  var q = b.sgDue, v = sgCfg(b).voice || {};
  if (!q) return;
  q.t += dt;
  if (!b.alive || q.t > (v.wait || 8)) { b.sgDue = null; return; }
  if (speaking(b) || !sgTalkClear()) return;
  b.sgDue = null;
  say(b, q.text);
  b.sgLineT = sgFightT;
}

// From startMatchSeeded.
function resetOmalley() {
  sgSweets = []; sgClock = 0; sgFightT = 0; sgNextId = 1; sgWinT = 0;
  sgSpawnT = Infinity;
  if (balls) balls.forEach(function (b) {
    var cc = sgCfg(b) && sgCfg(b).candy;
    if (cc) sgSpawnT = Math.min(sgSpawnT, sgRand(cc.first));
  });
}
// From makeBall.
function initOmalley(b) {
  b.crane = null; b.sugaCrit = null; b.sgDrift = null; b.sgHuntT = 0; b.sgSaid = null; b.sgWon = false; b.sgLost = false; b.sgKo = null;
  b.sgSnipe = null; b.sgLineT = -99; b.sgDown = false; b.sgBack = false; b.sgCmb = null; b.sgDue = null; b.sgBackTry = 0;
  var cfg = sgCfg(b);
  if (!cfg) return;
  // His own copy of the fighter, so his hair can change colour mid-fight
  // without touching the roster (or the other one, in a mirror match).
  b.char = JSON.parse(JSON.stringify(b.char));
  b.craneT = cfg.craneKick ? sgRand(cfg.craneKick.first) : Infinity;
  b.snipeT = cfg.snipe ? sgRand(cfg.snipe.first) : Infinity;
  b.sgDriftT = cfg.drift ? sgRand(cfg.drift.every) : Infinity;
  b.sugar = { n: 0, highT: 0, highMax: 0, crashT: 0, drainT: 0, pop: 0, floatT: 0, hair: cfg.hairStart || 0, flash: 0, tagT: 0, tagCd: 0 };
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

// His crit chance right now: the base plus every sugar in him (all of them
// on the sugar high).
function sugaCritChance(b) {
  var cfg = sgCfg(b), sg = cfg.sugar || {}, n = sugaHigh(b) ? (sg.cap || 0) : b.sugar.n;
  return Math.min(sg.maxChance || 95, cfg.crit.chance + (sg.crit || 0) * n);
}
// A SUGA CRIT: on the high, or with critKo.sugar or more in him.
function sugaBoosted(b) {
  var ko = sgCfg(b).critKo;
  return sugaHigh(b) || !!(ko && ko.sugar != null && b.sugar.n >= ko.sugar);
}
// From the punch in abilities.js: how many times its damage this punch does.
function sugaCritRoll(b) {
  var cfg = sgCfg(b);
  b.sugaCrit = null;
  if (!cfg || !cfg.crit) return 1;
  if (Math.random() * 100 >= sugaCritChance(b)) return 1;
  b.sugaCrit = { mult: cfg.crit.mult, boosted: sugaBoosted(b) };
  return cfg.crit.mult;
}
// From the punch in abilities.js, when it landed.
function sugaCritLanded(self, other) {
  var c = self.sugaCrit;
  self.sugaCrit = null;
  if (!c) return;
  var dx = other.x - self.x, dy = other.y - self.y, d = Math.sqrt(dx * dx + dy * dy) || 1, ux = dx / d, uy = dy / d;
  var cx = other.x - ux * other.r, cy = other.y - uy * other.r;
  floater(other.x, other.y - other.r - 34, c.snipe ? "SNIPED!" : (c.boosted ? "SUGA CRIT!" : "CRIT!"), "crit");
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
    if (typeof commentaryCall === "function") commentaryCall("instantKo", self, other); // one shot, out cold (commentary-calls.js)
    knockoutFx(self, other);
    clearActions(self);
    self.sgSnipe = null;
    self.sgKo = { t: 0, targetId: other.id };
    crowdReact(1);
    return;
  }
  // "I'm just that good." after a big one (the snipe has its own lines).
  if (c.boosted && !c.snipe && other.alive) sgMoment(self, "bigShot", (sgCfg(self).voice || {}).bigShot);
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
// (The snipe and the walk-off after a Suga KO run from here too.)
function updateCraneKick(self, other, dt) {
  if (self.sgKo) return sugaKoWalkOff(self, other, dt);
  if (!self.crane && updateSnipe(self, other, dt)) return true;
  var cfg = sgCfg(self), ck = cfg && cfg.craneKick;
  if (!ck) return false;
  var m = self.crane;
  if (m && (craneInterrupted(self) || other.igbb)) { endCrane(self); return false; } // (their special took over)
  var dx = other.x - self.x, dy = other.y - self.y, d = Math.sqrt(dx * dx + dy * dy) || 1;
  if (!m) {
    if (!started || over || self.igbb || self.sgSnipe || sugaCrashed(self)) return false;
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
    if (other.alive) sgMoment(self, "bigShot", (sgCfg(self).voice || {}).bigShot); // "I'm just that good."
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

// ---------------------------------------------------------------- the snipe

// From updateCraneKick: lining one up, firing it, and pulling the hand back.
// True while it's running.
function updateSnipe(self, other, dt) {
  var sn = sgCfg(self) && sgCfg(self).snipe;
  if (!sn) return false;
  var m = self.sgSnipe;
  if (m && (craneInterrupted(self) || other.igbb || over)) { endSnipe(self); return false; } // (their special took over)
  var dx = other.x - self.x, dy = other.y - self.y, d = Math.sqrt(dx * dx + dy * dy) || 1, want = Math.atan2(dy, dx);
  if (!m) {
    if (!started || over || self.igbb || sugaCrashed(self) || self.sgHuntT > 0 || !other.alive || other.koOut) return false;
    self.snipeT -= dt;
    if (self.snipeT > 0) return false;
    var gap = d - self.r - other.r;
    if (gap < sn.minGap || gap > sn.maxGap || self.cmb || !canStartIgbb(self, other) || swordDuelActive()) return false;
    startSnipe(self, other, sn, want);
    return true;
  }
  m.t += dt;
  if (m.phase === "aim") {
    // Planted, measuring: the aim follows them until it locks.
    self.vx = 0; self.vy = 0;
    if (m.t < sn.aim - sn.lock) m.aim = sgTurn(m.aim, want, dt * (sn.track || 9));
    else if (!m.locked) { m.locked = true; playSnipeLock(); }
    if (m.read) sgSidestep(other, m);
    if (m.t >= sn.aim) {
      m.phase = "shot"; m.t = 0;
      m.dur = Math.max(0.12, Math.min(0.34, (d - self.r - other.r + sn.reach) / sn.speed + 0.05));
      playSnipeShot();
    }
    return true;
  }
  if (m.phase === "shot") {
    // Down the line, right hand first. They juked it if they read it.
    if (!m.read) m.aim = sgTurn(m.aim, want, dt * (sn.turn || 0));
    else sgSidestep(other, m);
    var ux = Math.cos(m.aim), uy = Math.sin(m.aim);
    self.vx = ux * sn.speed; self.vy = uy * sn.speed;
    if (!m.hit && other.alive && !other.koOut) {
      var fx = self.x + ux * (self.r + sn.reach * 0.8), fy = self.y + uy * (self.r + sn.reach * 0.8);
      var fd = Math.sqrt((other.x - fx) * (other.x - fx) + (other.y - fy) * (other.y - fy));
      if (fd < other.r + 10 || d < self.r + other.r + 4) { m.hit = true; landSnipe(self, other, sn, m); }
    }
    if (!reduceMotion && self.sgSnipe) particles.push({ x: self.x - ux * self.r * 0.6, y: self.y - uy * self.r * 0.6, vx: -ux * 60, vy: -uy * 60, life: 0.18, max: 0.18, size: self.r * 0.35, color: "#ffffff" });
    if (!self.sgSnipe) return true; // (a Suga KO took over)
    if (m.hit || m.t >= m.dur) {
      if (!m.hit) { m.missed = true; floater(other.x, other.y - other.r - 8, "WHIFF", "dodge"); }
      m.phase = "land"; m.t = 0;
      self.vx *= m.hit ? 0.2 : 0.6; self.vy *= m.hit ? 0.2 : 0.6;
    }
    return true;
  }
  // Pulling the hand back (off balance for a moment after a miss).
  var damp = Math.exp(-10 * dt);
  self.vx *= damp; self.vy *= damp;
  if (m.t >= (m.missed ? (sn.miss || 0.3) : SG_SNIPE_SETTLE)) { endSnipe(self); return false; }
  return true;
}

function startSnipe(self, other, sn, aim) {
  clearActions(self);
  self.vx = 0; self.vy = 0;
  if (self.sgDrift) endDrift(self);
  var m = self.sgSnipe = { phase: "aim", t: 0, aim: aim, locked: false, hit: false, missed: false,
    read: Math.random() * 100 < (sn.readChance || 0), side: Math.random() < 0.5 ? -1 : 1 };
  floater(self.x, self.y - self.r - 56, "SNIPER!", "crit"); // (over his health bar and SUGAR pill)
  if (m.read) floater(other.x, other.y - other.r - 30, "!", "crit");
  playSnipeAim();
  crowdReact(0.25);
  sgMoment(self, "sniper", (sgCfg(self).voice || {}).snipeAim); // "I'm a sniper."
}

// Seeing it coming: they slide out of the line, sideways to it (only while
// they're rolling about on their own).
function sgSidestep(other, m) {
  if (!other.alive || !inOrdinaryMovement(other) || other.angry) return;
  var sp = Math.max(Math.sqrt(other.vx * other.vx + other.vy * other.vy), 240);
  other.vx = -Math.sin(m.aim) * m.side * sp; other.vy = Math.cos(m.aim) * m.side * sp;
}

// The right hand lands: `damage`, a bigger chance to crit than his punches,
// and a crit hits harder than theirs (`critMult`, else his normal mult).
function landSnipe(self, other, sn, m) {
  var cfg = sgCfg(self), sg = cfg.sugar || {}, ux = Math.cos(m.aim), uy = Math.sin(m.aim);
  var crit = !!cfg.crit && Math.random() * 100 < Math.min(sg.maxChance || 95, sugaCritChance(self) + (sn.crit || 0));
  var critMult = cfg.crit ? (sn.critMult != null ? sn.critMult : cfg.crit.mult) : 1;
  var dealt = hurt(other, sn.damage * (crit ? critMult : 1), "punch", self.id);
  if (dealt > 0) {
    if (!other.justDodged && sgKnockable(other)) { other.vx += ux * sn.knockback; other.vy += uy * sn.knockback; other.knockFly = 0.25; }
    var cx = other.x - ux * other.r, cy = other.y - uy * other.r;
    impacts.push({ x: cx, y: cy, nx: -ux, ny: -uy, life: 0.45, max: 0.45, color: "#ff2a3d" });
    igbbSparks(cx, cy, -ux, -uy, "#ff5fa8", 12, 420);
    other.squash = { t: 0.16, max: 0.16, nx: -ux, ny: -uy };
    hitStop = Math.max(hitStop, 0.07);
    if (!reduceMotion) shake = Math.max(shake, 13);
    playPunch(dealt);
    playSnipeHit();
    crowdReact(0.5);
    if (typeof commentaryCall === "function") commentaryCall("rightHand", self, other); // "Big right hand!" (commentary-calls.js)
    if (crit) {
      self.sugaCrit = { mult: critMult, boosted: sugaBoosted(self), snipe: true };
      sugaCritLanded(self, other); // SNIPED!, and a Suga KO like any crit
    }
    var v = cfg.voice || {};
    if (self.sgKo || !other.alive) { checkEnd(); return; } // (out cold, or it finished them: the win has its own line)
    if (!(crit && sgMoment(self, "rightHand", v.rightHand))) sgMoment(self, "sniper", v.snipeLand);
  }
  checkEnd();
}

function endSnipe(self) {
  var sn = sgCfg(self).snipe;
  self.sgSnipe = null;
  self.snipeT = sgRand(sn.every);
  if (self.alive && inOrdinaryMovement(self)) setSpeed(self, self.baseSpeed || SPEED);
}

// ---------------------------------------------------------------- Sugar Rush

// From updateSpecial (special.js) for special.move "sugarrush".
function updateSugarRush(self, other, dt) {
  var sp = self.char.special;
  if (!self.igbb) {
    if (self.specialT < sp.chargeTime || !started || over || craneOn(self) || self.sgSnipe || sugaCrashed(self) || sugaHigh(self) || !canStartIgbb(self, other)) return false;
    clearActions(self);
    self.igbb = { move: "sugarrush", phase: "call", t: 0 };
    self.vx = 0; self.vy = 0;
    self.sgDrift = null;
    floater(self.x, self.y - self.r - 84, "SUGAR RUSH!", "crit"); // (over the speech bubble)
    sgSayAlways(self, "Welcome to the Suga Show."); // every Sugar Rush (it waits its turn)
    playSugarRush();
    crowdReact(1);
  }
  var m = self.igbb;
  if (m.move !== "sugarrush") return false;
  m.t += dt;
  self.vx = 0; self.vy = 0;
  if (m.t >= (sp.call || 1)) {
    var landed = rainSweets(self, sp);
    self.sgHuntT = landed + (sp.hunt || 0); // then he goes after them
    self.igbb = null;
    self.specialT = 0;
    if (self.alive) setSpeed(self, self.baseSpeed || SPEED);
    return false;
  }
  return true;
}

// The shower: candies falling in from high over the cage, a little apart, on
// top of the ones already down. Returns when the last one lands.
function rainSweets(self, sp) {
  var cc = sgCfg(self).candy || {}, n = sp.sweets || 5, donuts = Math.min(n, sp.donuts || 0), spots = sgSweets.slice(), last = 0;
  for (var i = 0; i < n; i++) {
    var kind = i < donuts ? "donut" : pickSweetKind(cc.kinds, true);
    var spot = pickSweetSpot(spots, cc.gap || 55);
    spots.push(spot);
    last = (sp.fall || 0.7) + i * 0.13;
    addSweet(kind, spot.x, spot.y, { fall: last, high: SG_FALL_H, life: cc.life, rush: true });
  }
  return last;
}

// ---------------------------------------------------------------- candies

function addSweet(kind, x, y, o) {
  var pal = kind === "gummy" ? SG_GUMMY : SG_BRIGHT;
  var s = { id: sgNextId++, kind: kind, x: x, y: y, t: 0, life: o.life || 11, fall: o.fall || 0, high: o.high || SG_DROP_H, rush: !!o.rush,
    color: pal[Math.floor(Math.random() * pal.length)], spin: Math.random() * 6 };
  s.fallMax = s.fall;
  sgSweets.push(s);
  if (!s.fall) sweetLanded(s);
  return s;
}
function sweetLanded(s) {
  s.t = 0;
  if (s.kind === "donut" && !s.rush) floater(s.x, s.y - SG_R - 14, "GOLDEN DONUT!", "crit"); // (Sugar Rush has had its call)
  for (var i = 0; i < 8 && !reduceMotion; i++) {
    var a = i / 8 * Math.PI * 2, sp = 80 + nativeRandom() * 80;
    particles.push({ x: s.x, y: s.y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 0.28, max: 0.28, size: 2 + nativeRandom() * 1.5, color: i % 2 ? "#ffffff" : sweetColor(s) });
  }
  playSweetPop(s.kind, !s.rush && s.kind !== "donut");
  if (s.kind === "donut") crowdReact(0.4);
}
function sweetColor(s) {
  if (s.kind === "donut") return "#ffd34d";
  if (s.kind === "lollipop") return "#ff5fa8";
  if (s.kind === "candyCane") return "#e8263b";
  if (s.kind === "cottonCandy") return "#ff8fcb";
  return s.color;
}
function sweetById(id) {
  for (var i = 0; i < sgSweets.length; i++) if (sgSweets[i].id === id) return sgSweets[i];
  return null;
}

// A spot for a new candy: away from the cage, the fighters and the other
// candies (`gap`).
function pickSweetSpot(others, gap) {
  for (var i = 0; i < 16; i++) {
    var x = 40 + Math.random() * (W - 80), y = 40 + Math.random() * (H - 80), ok = true;
    others.forEach(function (o) { if ((o.x - x) * (o.x - x) + (o.y - y) * (o.y - y) < gap * gap) ok = false; });
    balls.forEach(function (b) { if (b.alive && (b.x - x) * (b.x - x) + (b.y - y) * (b.y - y) < (b.r + 40) * (b.r + 40)) ok = false; });
    if (ok) return { x: x, y: y };
  }
  return { x: 40 + Math.random() * (W - 80), y: 40 + Math.random() * (H - 80) };
}
// A kind by its odds (the Sugar Rush shower leaves out the ones that crash him).
function pickSweetKind(kinds, noCrash) {
  var total = 0, k;
  kinds = kinds || { lollipop: { odds: 1 } };
  for (k in kinds) if (!(noCrash && kinds[k].crash)) total += kinds[k].odds || 0;
  var roll = Math.random() * total;
  for (k in kinds) {
    if (noCrash && kinds[k].crash) continue;
    roll -= kinds[k].odds || 0;
    if (roll < 0) return k;
  }
  return "lollipop";
}
// One more candy dropping in (the rain).
function dropCandy(cc) {
  var spot = pickSweetSpot(sgSweets, cc.gap || 55);
  addSweet(pickSweetKind(cc.kinds), spot.x, spot.y, { fall: cc.fall || 0.55, life: cc.life });
}

// ---------------------------------------------------------------- his sweet tooth

// Free to go after candy: rolling about on his own, awake, nobody's special
// going on (and not on the high: he's busy fighting).
function canDrift(b, scene) {
  return b.alive && started && !over && !scene && inOrdinaryMovement(b) && !b.angry && !b.dizzy && !b.koOut &&
    !sugaCrashed(b) && !sugaHigh(b);
}
function nearestSweet(b, range) {
  var best = null, bd = range * range;
  sgSweets.forEach(function (s) {
    if (s.fall > 0 || s.gone) return;
    var d = (s.x - b.x) * (s.x - b.x) + (s.y - b.y) * (s.y - b.y);
    if (d < bd) { bd = d; best = s; }
  });
  return best;
}
// Turns toward the candy at `turn` (the speed regulator then holds the speed).
function steerToSweet(b, s, turnRate, speedMult, dt) {
  var sp0 = Math.sqrt(b.vx * b.vx + b.vy * b.vy) || 1;
  var cur = Math.atan2(b.vy, b.vx), want = Math.atan2(s.y - b.y, s.x - b.x);
  var diff = Math.atan2(Math.sin(want - cur), Math.cos(want - cur));
  var turn = Math.max(-turnRate * dt, Math.min(turnRate * dt, diff));
  var sp = Math.max(sp0, (b.baseSpeed || SPEED) * slowMult(b) * (speedMult || 1));
  b.vx = Math.cos(cur + turn) * sp; b.vy = Math.sin(cur + turn) * sp;
}
function endDrift(b) {
  var dr = sgCfg(b).drift;
  b.sgDrift = null;
  b.sgDriftT = dr ? sgRand(dr.every) : Infinity;
}
// Every frame: leaning toward a candy now and then (suga.drift), or hunting
// them down after Sugar Rush.
function updateSweetTooth(b, dt, scene) {
  var cfg = sgCfg(b), dr = cfg.drift, sp = b.char.special || {}, hunting = b.sgHuntT > 0;
  var free = canDrift(b, scene);
  if (b.sgDrift) {
    // (Knocked about on the way, he keeps his eye on it: he just can't steer
    // until he's rolling free again.)
    var m = b.sgDrift, s = sweetById(m.id);
    m.t += dt;
    if (!s || !canEat(b, scene) || sugaHigh(b) || (m.hunt ? !hunting : m.t >= m.dur)) endDrift(b);
    else {
      if (free) {
        if (m.hunt) steerToSweet(b, s, sp.huntTurn || 7, sp.huntSprint || 1.25, dt);
        else steerToSweet(b, s, dr.turn, dr.speed, dt);
      }
      return;
    }
  }
  if (!free) return;
  if (hunting) {
    var h = nearestSweet(b, Infinity);
    if (h) b.sgDrift = { id: h.id, t: 0, hunt: true };
    return;
  }
  if (!dr) return;
  b.sgDriftT -= dt;
  if (b.sgDriftT > 0) return;
  var o = balls[1 - b.id];
  if (o && o.alive && sgDist(b, o) - b.r - o.r < (dr.notWithin || 0)) { b.sgDriftT = 0.3; return; } // trading shots: keep fighting
  var c = nearestSweet(b, dr.range || 240);
  if (!c) { b.sgDriftT = 0.3; return; }
  b.sgDrift = { id: c.id, t: 0, dur: sgRand(dr.time) };
}

// ---------------------------------------------------------------- sugar

function canEat(b, scene) { return b.alive && !b.koOut && started && !over && !scene && !sugaCrashed(b); }

function eatSweet(b, s) {
  var cfg = sgCfg(b), cc = cfg.candy || {}, kind = (cc.kinds && cc.kinds[s.kind]) || {}, sg = cfg.sugar || {}, su = b.sugar;
  var cap = sg.cap || 0, before = su.n, high = sugaHigh(b);
  s.gone = true;
  if (b.sgDrift && b.sgDrift.id === s.id) endDrift(b);
  su.n = kind.crash && cfg.crash ? cap : Math.min(cap, su.n + (kind.sugar != null ? kind.sugar : 1));
  su.drainT = 0;
  if (su.n !== before) su.pop = SG_POP;
  su.hair++; sugaHair(b, su.hair);
  su.flash = 0.5;
  if (cfg.hairTag && su.tagCd <= 0) { su.tagT = SG_TAG; su.tagCd = cfg.hairTagGap || 0; }
  var gain = su.n - before, goHigh = !high && cfg.crash && (kind.crash || (cfg.crash.atCap && cap && su.n >= cap));
  // What it did, over his head (not when it tips him onto the high: that
  // gets its own call; and not twice in a blink, so a full mat stays readable).
  if (kind.crash && !high) floater(b.x, b.y - b.r - 30, "COTTON CANDY!", "crit");
  else if (gain > 0 && !goHigh && sg.floater && (s.kind === "donut" || su.floatT <= 0)) {
    floater(b.x, b.y - b.r - 30, "+" + gain * (sg.crit || 0) + "% CRIT", s.kind === "donut" ? "crit" : "note");
    su.floatT = 0.7;
  }
  if (goHigh) startSugarHigh(b);
  else {
    var v = cfg.voice || {};
    if (s.kind === "donut") sgSay(b, "donut");
    else if (v.candy && Math.random() * 100 < v.candy) sgSay(b, "candy");
  }
  for (var i = 0; i < 14 && !reduceMotion; i++) {
    var a = nativeRandom() * Math.PI * 2, sp = 80 + nativeRandom() * 200;
    particles.push({ x: b.x, y: b.y - b.r * 0.7, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 60, life: 0.5, max: 0.5, size: 2 + nativeRandom() * 2.5, color: b.char.look ? b.char.look.hairColors[i % b.char.look.hairColors.length] : sweetColor(s) });
  }
  playSweetEat(s.kind);
  crowdReact(s.kind === "donut" || kind.crash ? 0.5 : 0.2);
}

function startSugarHigh(b) {
  var cr = sgCfg(b).crash, su = b.sugar;
  su.highT = su.highMax = cr.high || 3;
  b.sgDrift = null; b.sgHuntT = 0;
  floater(b.x, b.y - b.r - 56, "SUGAR HIGH!", "crit");
  sgSay(b, "sugarHigh");
  playSugarHigh();
  crowdReact(0.5);
}
function startSugarCrash(b) {
  var cr = sgCfg(b).crash, su = b.sugar;
  su.highT = 0;
  su.n = Math.floor(su.n * (cr.keep || 0));
  su.drainT = 0;
  su.crashT = cr.time;
  b.sgDrift = null; b.sgHuntT = 0;
  addSlow(b, cr.slow, cr.time, "sugarcrash");
  if (cr.attackSlow) b.atkRate = b.sgAtkRate * cr.attackSlow;
  floater(b.x, b.y - b.r - 30, "SUGAR CRASH", "crit");
  sgSay(b, "crash");
  playSugarCrash();
  crowdReact(0.3);
}
function endSugarCrash(b) {
  b.sugar.crashT = 0;
  b.atkRate = b.sgAtkRate;
  endDrift(b);
  sgSay(b, "wakeUp");
}

// ---------------------------------------------------------------- every frame

// From update(): the candy rain (dropping, melting), his lean toward them,
// eating them, his sugar, highs and crashes, and his voice lines.
function tickOmalley(dt) {
  sgClock += dt;
  var sugas = balls.filter(function (b) { return !!sgCfg(b); });
  if (!sugas.length) return;
  if (started && !over) sgFightT += dt;
  var frozen = (typeof allAmericanOn === "function" && allAmericanOn()) || (typeof auraFarmOn === "function" && auraFarmOn());

  sugas.forEach(function (b) {
    var su = b.sugar, cfg = sgCfg(b), sg = cfg.sugar || {};
    if (b.sgKo) tickSugaKo(b, dt);
    su.flash = Math.max(0, su.flash - dt);
    su.tagT = Math.max(0, su.tagT - dt);
    su.tagCd = Math.max(0, su.tagCd - dt);
    su.pop = Math.max(0, su.pop - dt);
    su.floatT = Math.max(0, su.floatT - dt);
    if (!b.alive) return;
    if (su.highT > 0) { su.highT -= dt; if (su.highT <= 0) startSugarCrash(b); }
    else if (su.crashT > 0) { su.crashT -= dt; if (su.crashT <= 0) endSugarCrash(b); }
    else if (su.n > 0 && sg.drain && started && !over && !frozen) {
      su.drainT += dt;
      if (su.drainT >= sg.drain) { su.drainT = 0; su.n--; } // going without
    }
    if (b.sgHuntT > 0) b.sgHuntT = Math.max(0, b.sgHuntT - dt);
    // His start line as the fight gets going, every fight (against Ilia,
    // his callout), waiting its turn if someone's talking.
    var v = cfg.voice || {}, o = balls[1 - b.id];
    if (!b.sgSaid && started && sgFightT > 0.6) {
      b.sgSaid = true;
      var st = sgLines(b, "start");
      if (v.start && Math.random() * 100 < v.start && st && st.length) sgSayAlways(b, pickLine(b, st, "start"));
    }
    tickSgDue(b, dt);
    if (!started || over || !o) return;
    // "Championship mindset, baby!": when he draws level after being
    // `comebackDown` behind, `voice.comeback`% of the time (once a fight; it
    // keeps trying for a couple of seconds if he's busy talking).
    if (v.comebackDown) {
      if (o.hp - b.hp >= v.comebackDown) b.sgDown = true;
      else if (b.sgDown && !b.sgBack && b.hp >= o.hp && o.alive) { b.sgBack = true; b.sgBackTry = Math.random() * 100 < (v.comeback || 0) ? 2 : 0; }
      if (b.sgBackTry > 0) { b.sgBackTry -= dt; if (sgMoment(b, "comeback", 100)) b.sgBackTry = 0; }
    }
    // "Ah, that was sexy." after a combination where every strike landed
    // (combos.js ends it and clears b.cmb).
    if (b.cmb) b.sgCmb = b.cmb;
    else if (b.sgCmb) {
      var cm = b.sgCmb;
      b.sgCmb = null;
      if (cm.n >= 2 && cm.hits >= cm.n && cm.n === cm.steps.length && o.alive) sgMoment(b, "combo", v.combo);
    }
  });

  // Every win: one of `win` ("Is this real?", "God, it feels good to win...")
  // ("Championship mindset, baby!" if he won it from behind and hasn't said
  // it yet), waiting for the knockout call.
  if (over) {
    sgWinT += dt;
    sugas.forEach(function (b) {
      var v = sgCfg(b).voice || {};
      if (v.win && b.alive && !balls[1 - b.id].alive && !b.sgWon && sgWinT >= SG_WIN_BEAT) {
        b.sgWon = true;
        var back = b.sgDown && !b.sgBack ? sgLines(b, "comeback") : null, won = sgLines(b, "win");
        sgSayAlways(b, back && back.length ? pickLine(b, back, "comeback") : won && won.length ? pickLine(b, won, "win") : "Is this real?");
      }
      // Every loss (`voice.loss`): one of `loss` ("Yeah, I didn't feel like
      // it was gonna go like that.") once the knockout call and the winner
      // are done, for up to `voice.wait` seconds (he's down, so sgSayAlways
      // can't carry it).
      var lost = sgLines(b, "loss"), o = balls[1 - b.id];
      if (v.loss && !b.alive && o.alive && !b.sgLost && sgWinT >= SG_LOSS_BEAT && lost && lost.length) {
        if (sgWinT > SG_LOSS_BEAT + (v.wait || 8)) b.sgLost = true;
        else if (!speaking(b) && !speaking(o) && sgTalkClear()) { b.sgLost = true; say(b, pickLine(b, lost, "loss")); }
      }
    });
  }
  if (frozen) return;

  // The rain: one more every `every` seconds while there's room on the mat
  // (held while anyone's special is going on).
  var cc = sgCfg(sugas[0]).candy, scene = jumboHold(null);
  if (cc && started && !over && !scene) {
    sgSpawnT -= dt;
    if (sgSpawnT <= 0) {
      if (sgSweets.length < (cc.max || 5)) { dropCandy(cc); sgSpawnT = sgRand(cc.every); }
      else sgSpawnT = 0.4; // full: the next one as soon as there's room
    }
  }

  // Dropping in, then sitting there bobbing until it melts.
  sgSweets.forEach(function (s) {
    if (s.fall > 0) {
      s.fall -= dt;
      if (s.fall <= 0) { s.fall = 0; sweetLanded(s); }
      return;
    }
    s.t += dt;
    if (s.t >= s.life) s.gone = true;
  });
  sgSweets = sgSweets.filter(function (s) { return !s.gone; });

  // His lean toward them, or the hunt after Sugar Rush.
  sugas.forEach(function (b) { updateSweetTooth(b, dt, scene); });

  // Getting there: a candy he touches is his, and the one he's going after
  // slides into him once he's close, so nothing knocks him off it. Nobody
  // else touches them.
  sgSweets.forEach(function (s) {
    s.pull = null;
    if (s.fall > 0 || s.gone) return;
    sugas.forEach(function (b) {
      if (s.gone || !canEat(b, scene)) return;
      var dx = b.x - s.x, dy = b.y - s.y, d = Math.sqrt(dx * dx + dy * dy) || 1, reach = b.r + SG_R * 0.6 + ((cc && cc.reach) || 0);
      if (d <= reach) { eatSweet(b, s); return; }
      if (!b.sgDrift || b.sgDrift.id !== s.id) return;
      var mag = ((cc && cc.magnet) || 0) * (b.sgHuntT > 0 ? 2 : 1);
      if (d > reach + mag) return;
      var step = Math.min(d - reach + 0.5, SG_PULL * dt);
      s.x += dx / d * step; s.y += dy / d * step; s.pull = b.id;
      if (d - step <= reach) eatSweet(b, s);
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

// Under the fighters: the crane kick's path and the candies on the mat (and
// the shadows of the ones dropping in). From draw().
function drawOmalleyUnder() {
  if (!balls.some(function (b) { return !!sgCfg(b); })) return;
  if (typeof allAmericanOn === "function" && allAmericanOn()) return; // out on the highway
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
  balls.forEach(function (b) { if (b.alive && b.sgSnipe && b.sgSnipe.phase === "aim") drawSnipeLaser(b); });
  sgSweets.forEach(function (s) {
    if (s.fall > 0) { drawSweetShadow(s); return; }
    var melt = Math.max(0, Math.min(1, (s.life - s.t) / 0.8)), pop = Math.min(1, s.t / 0.25);
    var size = SG_R * (pop < 1 ? easeOut(pop) * 1.25 - 0.25 * pop * pop : 1) * (0.4 + 0.6 * melt);
    var blink = s.life - s.t < 2 ? 0.55 + 0.45 * Math.abs(Math.cos(s.t * 9)) : 1;
    // The one he's going after gets a ring in his colour; a golden donut
    // always has a gold one. The rest sit quiet so a full mat stays readable.
    var after = null;
    balls.forEach(function (b) { if (b.alive && b.sgDrift && b.sgDrift.id === s.id) after = b; });
    ctx.save();
    if (after || s.kind === "donut") {
      var pr = (sgClock * 1.6 + s.id * 0.3) % 1;
      ctx.globalAlpha = melt * (1 - pr) * 0.8;
      ctx.strokeStyle = after ? after.char.color : "#ffd34d"; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(s.x, s.y, SG_R * (1.2 + pr * 1.4), 0, Math.PI * 2); ctx.stroke();
    }
    ctx.globalAlpha = melt * blink;
    ctx.fillStyle = "rgba(0,0,0,0.18)";
    ctx.beginPath(); ctx.ellipse(s.x, s.y + SG_R * 0.85, size * 0.85, size * 0.28, 0, 0, Math.PI * 2); ctx.fill();
    var wob = s.pull != null ? Math.sin(sgClock * 40) * 0.25 : 0; // being pulled in
    drawSweet(s, s.x, s.y + Math.sin(sgClock * 4 + s.id) * 1.6 - 2, size, wob);
    ctx.restore();
  });
}

// The snipe's laser, from his lead glove to them along the aim: pink and
// dashed while it follows them, solid red and flashing once it locks.
function drawSnipeLaser(b) {
  var m = b.sgSnipe, sn = sgCfg(b).snipe, o = balls[1 - b.id];
  var ux = Math.cos(m.aim), uy = Math.sin(m.aim), on = Math.min(1, m.t / 0.12);
  var x0 = b.x + ux * b.r * 1.1, y0 = b.y + uy * b.r * 1.1, len = Math.max(20, sgDist(b, o) - b.r * 1.1 + o.r * 0.4);
  var flash = m.locked ? 0.55 + 0.45 * Math.abs(Math.sin(sgClock * 38)) : 1;
  ctx.save();
  ctx.lineCap = "round";
  ctx.globalAlpha = 0.35 * on; ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 7;
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x0 + ux * len, y0 + uy * len); ctx.stroke();
  ctx.globalAlpha = 0.95 * on * flash; ctx.strokeStyle = m.locked ? "#ff2a3d" : "#ff5fa8"; ctx.lineWidth = m.locked ? 3.5 : 3;
  if (!m.locked) { ctx.setLineDash([9, 7]); ctx.lineDashOffset = -sgClock * 60; }
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x0 + ux * len, y0 + uy * len); ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();
}
// The scope settling on them while he lines it up: a ring with crosshair
// ticks that closes in, then snaps red when it locks. Over the fighters.
function drawSnipeScope(b) {
  var m = b.sgSnipe, sn = sgCfg(b).snipe, o = balls[1 - b.id];
  if (!o || !o.alive) return;
  var k = easeOut(Math.min(1, m.t / Math.max(0.05, sn.aim - sn.lock))), rr = o.r * (2.2 - 1.0 * k);
  var col = m.locked ? "#ff2a3d" : "#ff5fa8", flash = m.locked ? 0.6 + 0.4 * Math.abs(Math.sin(sgClock * 38)) : 1;
  var spin = m.locked ? 0 : (1 - k) * 1.2;
  ctx.save();
  ctx.translate(o.x, o.y); ctx.rotate(spin);
  ctx.globalAlpha = Math.min(1, m.t / 0.1) * flash;
  ctx.lineCap = "round";
  [[theme.wall, 6], [col, 3]].forEach(function (p) {
    ctx.strokeStyle = p[0]; ctx.lineWidth = p[1];
    ctx.beginPath(); ctx.arc(0, 0, rr, 0, Math.PI * 2); ctx.stroke();
    for (var i = 0; i < 4; i++) {
      var a = i * Math.PI / 2, c = Math.cos(a), s = Math.sin(a);
      ctx.beginPath(); ctx.moveTo(c * rr * 0.55, s * rr * 0.55); ctx.lineTo(c * rr * 1.3, s * rr * 1.3); ctx.stroke();
    }
  });
  if (m.locked) { ctx.fillStyle = col; ctx.beginPath(); ctx.arc(0, 0, 4, 0, Math.PI * 2); ctx.fill(); }
  ctx.restore();
}

// Over the fighters: the snipe's scope, and candies dropping in (the rain,
// and the Sugar Rush shower from higher up). From draw().
function drawOmalleyOver() {
  if (typeof allAmericanOn === "function" && allAmericanOn()) return;
  balls.forEach(function (b) { if (b.alive && b.sgSnipe && b.sgSnipe.phase === "aim" && sgCfg(b)) drawSnipeScope(b); });
  if (!sgSweets.length) return;
  sgSweets.forEach(function (s) {
    if (!(s.fall > 0)) return;
    var k = s.fall / s.fallMax, h = k * k * s.high;
    ctx.save();
    ctx.globalAlpha = Math.min(1, (1 - k) * 4) * 0.6;
    ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 4; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(s.x, s.y - h - SG_R * 1.4); ctx.lineTo(s.x, s.y - h - SG_R * 1.4 - 24 - 50 * k); ctx.stroke();
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
  else if (s.kind === "wrapped") drawWrappedCandy(x, y, size, s.color, rot || 0);
  else if (s.kind === "gumball") drawGumball(x, y, size, s.color);
  else if (s.kind === "candyCane") drawCandyCane(x, y, size, rot || 0);
  else if (s.kind === "cottonCandy") drawCottonCandy(x, y, size, rot || 0);
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
// A hard candy in a twisted wrapper, striped.
function drawWrappedCandy(x, y, R, col, rot) {
  ctx.save();
  ctx.translate(x, y); ctx.rotate(rot - 0.35);
  ctx.lineJoin = "round"; ctx.strokeStyle = theme.wall; ctx.lineWidth = 2.5; ctx.fillStyle = col;
  [-1, 1].forEach(function (k) { // the twists
    ctx.beginPath();
    ctx.moveTo(k * R * 0.45, 0); ctx.lineTo(k * R * 1.18, -R * 0.52);
    ctx.quadraticCurveTo(k * R * 1.0, 0, k * R * 1.18, R * 0.52);
    ctx.closePath(); ctx.fill(); ctx.stroke();
  });
  ctx.beginPath(); ctx.ellipse(0, 0, R * 0.68, R * 0.54, 0, 0, Math.PI * 2); ctx.fill();
  ctx.save(); ctx.clip();
  ctx.strokeStyle = "rgba(255,255,255,0.85)"; ctx.lineWidth = R * 0.17;
  for (var i = -2; i <= 2; i++) { ctx.beginPath(); ctx.moveTo(i * R * 0.36 - R * 0.35, -R * 0.6); ctx.lineTo(i * R * 0.36 + R * 0.35, R * 0.6); ctx.stroke(); }
  ctx.restore();
  ctx.strokeStyle = theme.wall; ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.ellipse(0, 0, R * 0.68, R * 0.54, 0, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = "rgba(255,255,255,0.6)";
  ctx.beginPath(); ctx.ellipse(-R * 0.25, -R * 0.24, R * 0.2, R * 0.09, -0.4, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}
// A shiny gumball.
function drawGumball(x, y, R, col) {
  var d = R * 0.74;
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = col; ctx.strokeStyle = theme.wall; ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.arc(0, 0, d, 0, Math.PI * 2); ctx.fill();
  ctx.save(); ctx.clip();
  ctx.fillStyle = "rgba(0,0,0,0.16)";
  ctx.beginPath(); ctx.arc(d * 0.3, d * 0.35, d, 0, Math.PI * 2); ctx.arc(0, 0, d * 1.4, 0, Math.PI * 2, true); ctx.fill();
  ctx.restore();
  ctx.beginPath(); ctx.arc(0, 0, d, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = "rgba(255,255,255,0.75)";
  ctx.beginPath(); ctx.ellipse(-d * 0.34, -d * 0.38, d * 0.3, d * 0.17, -0.6, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(d * 0.1, -d * 0.6, d * 0.08, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}
// A red and white candy cane.
function drawCandyCane(x, y, R, rot) {
  ctx.save();
  ctx.translate(x, y); ctx.rotate(rot + 0.3);
  var path = function () {
    ctx.beginPath();
    ctx.moveTo(R * 0.28, R * 1.0); ctx.lineTo(R * 0.28, -R * 0.32);
    ctx.arc(-R * 0.14, -R * 0.32, R * 0.42, 0, Math.PI, true);
    ctx.lineTo(-R * 0.56, -R * 0.08);
  };
  ctx.lineCap = "round"; ctx.lineJoin = "round";
  ctx.strokeStyle = theme.wall; ctx.lineWidth = R * 0.56; path(); ctx.stroke();
  ctx.strokeStyle = "#ffffff"; ctx.lineWidth = R * 0.36; path(); ctx.stroke();
  ctx.lineCap = "butt"; ctx.strokeStyle = "#e8263b"; ctx.setLineDash([R * 0.2, R * 0.2]); path(); ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();
}
// Cotton candy on a paper cone, pink and blue: pure sugar, the one that
// crashes him.
function drawCottonCandy(x, y, R, rot) {
  var puffs = [[0, -0.42, 0.42], [-0.44, -0.2, 0.33], [0.44, -0.2, 0.33], [-0.2, 0.02, 0.32], [0.22, 0.02, 0.32], [0, -0.8, 0.28], [-0.32, -0.62, 0.24], [0.33, -0.6, 0.24]];
  ctx.save();
  ctx.translate(x, y + R * 0.1); ctx.rotate(rot * 0.5);
  // the cone
  ctx.fillStyle = "#f6f2ea"; ctx.strokeStyle = theme.wall; ctx.lineWidth = 2.5; ctx.lineJoin = "round";
  ctx.beginPath(); ctx.moveTo(-R * 0.3, R * 0.15); ctx.lineTo(R * 0.3, R * 0.15); ctx.lineTo(0, R * 1.08); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.strokeStyle = "#2d7ff9"; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(-R * 0.16, R * 0.42); ctx.lineTo(R * 0.12, R * 0.62); ctx.stroke();
  // the fluff: an outline, then the puffs
  ctx.fillStyle = theme.wall;
  puffs.forEach(function (p) { ctx.beginPath(); ctx.arc(p[0] * R, p[1] * R, p[2] * R + 2.4, 0, Math.PI * 2); ctx.fill(); });
  puffs.forEach(function (p, i) { ctx.fillStyle = i % 3 === 1 ? "#9fd8ff" : "#ff9fd2"; ctx.beginPath(); ctx.arc(p[0] * R, p[1] * R, p[2] * R, 0, Math.PI * 2); ctx.fill(); });
  ctx.fillStyle = "rgba(255,255,255,0.6)";
  ctx.beginPath(); ctx.arc(-R * 0.14, -R * 0.56, R * 0.12, 0, Math.PI * 2); ctx.arc(R * 0.28, -R * 0.3, R * 0.08, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

// From draw(), per fighter, after its hands: the crane kick and Sugar Rush
// arms and legs, the sugar high's ring, the crash, the SUGAR pill and the
// hair tag.
function drawOmalley(b) {
  var cfg = sgCfg(b);
  if (!cfg || !b.alive) return;
  var su = b.sugar, lift = sgLift(b);
  if (b.crane && b.crane.phase === "pose") drawCraneStance(b, lift);
  else if (b.crane && b.crane.phase === "leap") drawCraneLeap(b, lift);
  else if (sugarRushCalling(b) || b.sgKo) drawSugarRushArms(b);
  else if (b.sgSnipe) drawSnipeArms(b);

  // On the sugar high: a gold ring draining as it runs out, sparkles round it.
  if (sugaHigh(b)) {
    ctx.save();
    ctx.lineCap = "round";
    ctx.globalAlpha = 0.35; ctx.strokeStyle = "#ffd34d"; ctx.lineWidth = 9;
    ctx.beginPath(); ctx.arc(b.x, b.y - lift, b.r + 7, 0, Math.PI * 2); ctx.stroke();
    ctx.globalAlpha = 0.95; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.arc(b.x, b.y - lift, b.r + 7, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * Math.min(1, su.highT / (su.highMax || 1))); ctx.stroke();
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
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.lineWidth = 4; ctx.lineJoin = "round"; ctx.strokeStyle = theme.floor; ctx.fillStyle = "#4a6fd1";
    for (var z = 0; z < 3; z++) {
      var zk = (sgClock * 0.6 + z / 3) % 1;
      ctx.globalAlpha = ck2 * Math.sin(zk * Math.PI);
      var zx = b.x - b.r * 0.75 - zk * 14, zy = b.y - b.r * 0.4 - zk * 30;
      ctx.font = '900 ' + Math.round(12 + zk * 10) + 'px "Barlow Condensed", "Arial Narrow", sans-serif';
      ctx.strokeText("Z", zx, zy); ctx.fillText("Z", zx, zy);
    }
    ctx.restore();
  }
  // How much sugar is in him, beside his health bar.
  if (cfg.sugar && (su.n > 0 || sugaHigh(b) || sugaCrashed(b))) drawSugarPill(b, cfg.sugar);
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
// "SUGAR x4" beside his health bar, filling up toward the cap: gold and
// "SUGAR HIGH" on the high, grey in a crash. It swells as it goes up.
function drawSugarPill(b, sg) {
  var su = b.sugar, high = sugaHigh(b), crashed = sugaCrashed(b);
  var label = high ? "SUGAR HIGH" : "SUGAR x" + su.n;
  var by = b.y - b.r - 18;
  if (by < 4) by = b.y + b.r + 10; // (where the health bar goes when he's up against the top)
  ctx.save();
  ctx.font = '900 14px "Barlow Condensed", "Arial Narrow", sans-serif'; ctx.textAlign = "center"; ctx.textBaseline = "middle";
  var w = ctx.measureText(label).width + 14, h = 17, onRight = b.x + 37 + w <= W - 2, cy = by + 4; // (to the right of his health bar, or the left by the cage)
  var sc = 1 + 0.35 * (su.pop / SG_POP) + (high ? 0.06 * Math.sin(sgClock * 18) : 0);
  ctx.translate(onRight ? b.x + 37 : b.x - 37, cy); ctx.scale(sc, sc); // (it swells away from the health bar)
  var x0 = onRight ? 0 : -w, y0 = -h / 2;
  ctx.fillStyle = crashed ? "#d3d7dd" : "#ffffff";
  ctx.beginPath(); ctx.roundRect(x0, y0, w, h, h / 2); ctx.fill();
  ctx.save(); ctx.clip();
  ctx.fillStyle = crashed ? "#9aa0ab" : (high ? "#ffd34d" : "#ff8fc6");
  ctx.fillRect(x0, y0, w * (high ? 1 : Math.min(1, su.n / (sg.cap || 1))), h);
  ctx.restore();
  ctx.lineWidth = 2; ctx.strokeStyle = "#16211f";
  ctx.beginPath(); ctx.roundRect(x0, y0, w, h, h / 2); ctx.stroke();
  ctx.fillStyle = crashed ? "#4b5160" : "#16211f";
  ctx.fillText(label, x0 + w / 2, 1);
  ctx.restore();
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

// The snipe: lining up (lead hand out measuring, right hand cocked by his
// chin and glowing as it loads), then the long straight right, then pulling
// it back.
function drawSnipeArms(b) {
  var m = b.sgSnipe, sn = sgCfg(b).snipe, r = b.r, size = (b.char.punch.size || 13);
  var ux = Math.cos(m.aim), uy = Math.sin(m.aim), px = -uy, py = ux, cx = b.x, cy = b.y;
  function arm(sx, sy, hx, hy, w, ang) {
    strokeLimb(w * 0.62, armColor(b.char), function () { ctx.moveTo(sx, sy); ctx.lineTo(hx, hy); });
    drawGloveAt(hx, hy, w * 0.82, b.char, ang);
  }
  ctx.save();
  if (m.phase === "aim") {
    var c = Math.min(1, m.t / 0.15), paw = m.locked ? 0 : Math.sin(sgClock * 16) * r * 0.08;
    var tr = m.locked ? Math.sin(sgClock * 80) * 1.2 : 0;
    // the lead hand, out at them, pawing to measure the distance
    arm(cx - px * r * 0.45, cy - py * r * 0.45, cx + ux * (r * (0.75 + 0.45 * c) + paw) - px * r * 0.3, cy + uy * (r * (0.75 + 0.45 * c) + paw) - py * r * 0.3, size, m.aim);
    // the right hand, cocked back by his chin
    var hx = cx - ux * r * 0.2 * c + px * r * (0.55 + 0.25 * c) + tr, hy = cy - uy * r * 0.2 * c + py * r * (0.55 + 0.25 * c);
    var load = Math.min(1, m.t / sn.aim);
    ctx.save();
    ctx.globalAlpha = 0.25 + 0.35 * load; ctx.fillStyle = m.locked ? "#ff2a3d" : "#ff5fa8";
    ctx.beginPath(); ctx.arc(hx, hy, size * (0.9 + 0.9 * load), 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    arm(cx + px * r * 0.45, cy + py * r * 0.45, hx, hy, size * 1.1, m.aim);
  } else {
    // the right hand all the way out down the line, the left tucked at his chin
    var ext = m.phase === "shot" ? Math.min(1, m.t / Math.max(0.05, m.dur * 0.45)) : Math.max(0, 1 - m.t / SG_SNIPE_SETTLE);
    var tx = cx + ux * (r + sn.reach * ext) + px * r * 0.1, ty = cy + uy * (r + sn.reach * ext) + py * r * 0.1;
    arm(cx - px * r * 0.45, cy - py * r * 0.45, cx + ux * r * 0.55 - px * r * 0.55, cy + uy * r * 0.55 - py * r * 0.55, size * 0.95, m.aim);
    arm(cx + px * r * 0.35, cy + py * r * 0.35, tx, ty, size * (1.05 + 0.25 * ext), m.aim);
    if (m.phase === "shot") {
      // speed lines behind him, like a round leaving the barrel
      ctx.strokeStyle = "rgba(255,255,255,0.85)"; ctx.lineWidth = 3; ctx.lineCap = "round";
      for (var i = -1; i <= 1; i++) {
        var ox = cx - ux * r * 1.15 + px * i * r * 0.5, oy = cy - uy * r * 1.15 + py * i * r * 0.5, ll = r * (0.8 + 0.3 * (1 - Math.abs(i)));
        ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(ox - ux * ll, oy - uy * ll); ctx.stroke();
      }
    }
  }
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
// A candy landing (a soft plip for the steady rain, a shimmer for the golden donut).
function playSweetPop(kind, soft) {
  var g = soft ? 0.45 : 1;
  sgAudio(function (ac, t) {
    caneBurst(ac, t, 1900, 2, 0.35 * g, 0.04);
    caneTone(ac, t, "sine", 520, 1250, 0.25 * g, 0.09);
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
// The sugar high: a fast buzzing trill up the scale.
function playSugarHigh() {
  sgAudio(function (ac, t) {
    [784, 988, 1175, 1568, 1976, 2349].forEach(function (f, i) { caneTone(ac, t + i * 0.05, "square", f, f * 1.02, 0.08, 0.09); });
    caneTone(ac, t + 0.3, "sawtooth", 1568, 2093, 0.08, 0.3);
  });
}
// The crash: a sad trombone slide, wah-wahhh.
function playSugarCrash() {
  sgAudio(function (ac, t) {
    caneTone(ac, t, "triangle", 392, 330, 0.3, 0.32);
    caneTone(ac, t + 0.34, "triangle", 330, 196, 0.3, 0.7);
  });
}
// Lining up a snipe: the scope's two clicks, and a rising whine as it loads.
function playSnipeAim() {
  sgAudio(function (ac, t) {
    caneBurst(ac, t, 3600, 4, 0.35, 0.03);
    caneBurst(ac, t + 0.07, 2600, 4, 0.3, 0.03);
    caneTone(ac, t + 0.08, "sine", 500, 1700, 0.05, 0.5);
  });
}
// The aim locking: two quick beeps.
function playSnipeLock() {
  sgAudio(function (ac, t) {
    caneTone(ac, t, "square", 2200, 2200, 0.06, 0.045);
    caneTone(ac, t + 0.065, "square", 2200, 2200, 0.06, 0.045);
  });
}
// The shot going: a sharp crack and a falling zip.
function playSnipeShot() {
  sgAudio(function (ac, t) {
    caneBurst(ac, t, 5200, 0.8, 0.55, 0.06);
    caneTone(ac, t, "sawtooth", 1500, 220, 0.1, 0.14);
  });
}
// The right hand landing: a deep thump under the punch.
function playSnipeHit() {
  sgAudio(function (ac, t) {
    caneTone(ac, t, "sine", 170, 55, 0.55, 0.2);
    caneBurst(ac, t, 1300, 1, 0.45, 0.07);
  });
}
// Sugar Rush: a bright jingle up the scale.
function playSugarRush() {
  sgAudio(function (ac, t) {
    [1046, 1318, 1568, 2093, 2637].forEach(function (f, i) { caneTone(ac, t + i * 0.07, "triangle", f, f, 0.24, 0.22); });
    caneBurst(ac, t + 0.35, 5000, 1.2, 0.2, 0.25);
  });
}
