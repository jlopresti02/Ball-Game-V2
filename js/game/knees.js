// Knees (Christian, 2026-11-13): a strike any fighter can switch on with a
// `knee` block in its character file, the same way as elbows (elbows.js).
// Combinations (combos.js) throw them too.
//
//   "knee": { "damage": 10, "cooldown": 2.6, "speed": 0.3, "reach": 12,
//             "critChance": 0, "critMult": 2, "knockback": 200,
//             "clinch": { ... }, "flying": { ... } }
//
// damage      what a knee does ("KNEE!"). `critChance`% of them are critical
//             hits for `critMult` times as much ("CRIT KNEE!"). Leave `damage`
//             out and he doesn't throw knees on their own, only in the
//             clinch, the flying knee or a combination.
// cooldown    seconds between knees (lighter classes throw them a little
//             quicker, like punches, weight.js). Throwing one holds the next
//             punch and kick back, so it's one limb at a time.
// speed       how long one knee takes: the knee comes up from under him and
//             drives in, landing halfway through, then drops back down.
// reach       how close they have to be (the gap between the two balls). An
//             up-close weapon, like the elbow.
// knockback   the shove on a clean one.
//
// clinch      the Muay Thai plum (leave it out and that part is off). Every
//             `every` seconds (the first after `first`) when they're within
//             `range`, he reaches up with both hands ("CLINCH!", the tell:
//             for that moment they can still get away), grabs the back of
//             their head and pulls it down into `knees` knees (rolled each
//             time), one every `gap` seconds, `damage` each. They're held
//             while it lasts and can't slip or block a knee in there, but
//             after each one they break free `escape`% of the time
//             (`grapplerEscape`% more for a Grappler): "BROKE FREE!". The
//             last knee shoves them off (`knockback`).
// flying      the flying knee (leave it out and that part is off). Every
//             `every` seconds (the first after `first`) when they're
//             `minGap` to `maxGap` away, he crouches for `load` seconds while
//             a red line shows where he's going (the tell: they back off
//             `readChance`% of the time), then leaps in knee first at `speed`
//             ("FLYING KNEE!"). A clean one does `damage` and sends them
//             flying (`knockback`), and it knocks them out koBase% of the time
//             at full health, up to koBase + koLow% the more hurt they are
//             (it goes through every defence, like the KO Rush). If they're
//             gone by the time he gets there he lands off balance: WHIFF, and
//             he's wide open for `open` seconds.
//
// Knees hit with source "knee": they can be slipped, blocked and countered
// like any strike, and they can knock a guard player onto its back. The
// plum's knees hit with "finisher" (held, nobody slips or blocks them).
// startKnee(self, other, opts) lets a fighter's own moves throw a knee with
// their own numbers (combos.js), and startPlum puts him in the clinch.
"use strict";

GUARD_SOURCES.knee = true; // a knee can knock a guard player onto its back (guard.js)
GSP_SH_MELEE.knee = true;  // and GSP's shield blocks one like any strike (gsp-shield.js)

var KNEE_HIT = 0.5;     // share of the knee's time when it lands
var KNEE_DEF = { damage: 10, cooldown: 2.6, speed: 0.3, reach: 12, critChance: 0, critMult: 2, knockback: 200 };
var PLUM_DEF = { first: [4, 7], every: [7, 11], range: 14, knees: [2, 4], damage: 8, gap: 0.4, escape: 15, grapplerEscape: 10, knockback: 380 };
var FKNEE_DEF = { first: [6, 10], every: [11, 16], minGap: 70, maxGap: 210, load: 0.4, speed: 950, damage: 22, knockback: 560,
  koBase: 3, koLow: 15, readChance: 15, open: 0.8 };
var PLUM_GRAB = 0.26;   // reaching up for the back of the head (the tell)
var PLUM_KNEE = 0.26;   // one knee in the plum
var PLUM_GAP = 0.86;    // how close the pair is held (1 = just touching)
var PLUM_LEAN = 0.42;   // how far their head's pulled down toward him
var FK_REACH = 10;      // the flying knee connects inside this gap
var FK_LAND = 0.3;      // landing after a clean one
var FK_KO_HOLD = 1.3;   // standing over a knockout before it's called
var kneeFrame = 0;      // bumped once a frame (tickKnees): a clinch or flying knee the abilities loop didn't reach is let go

function kneeCfg(b) { return b && b.char && b.char.knee; }
function kneeNum(b, k) { var c = kneeCfg(b); return c && c[k] != null ? c[k] : KNEE_DEF[k]; }
function kneeMerge(def, c) {
  var o = {}, k;
  for (k in def) o[k] = def[k];
  if (c) for (k in c) o[k] = c[k];
  return o;
}
function plumNums(b) { var c = kneeCfg(b); return kneeMerge(PLUM_DEF, c && c.clinch); }
function fkNums(b) { var c = kneeCfg(b); return kneeMerge(FKNEE_DEF, c && c.flying); }
function kRand(r) { return r[0] + Math.random() * (r[1] - r[0]); }
function kDist(a, b) { var dx = b.x - a.x, dy = b.y - a.y; return Math.sqrt(dx * dx + dy * dy) || 1; }
// In the clinch, or crouched for, flying into or landing off a flying knee:
// the speed regulator leaves him alone (physics.js).
function kneesBusy(b) { return !!(b && (b.plum || b.fknee)); }
// Both hands round their head in the clinch: drawn by drawKneesOver (drawHands skips them, draw-attacks.js).
function kneeHandsBusy(b) { return !!(b && b.plum); }
// Who's got this fighter in the plum (null if nobody).
function plumHolder(b) {
  var o = b && balls[1 - b.id];
  return o && o.plum && o.plum.phase === "hold" && o.plum.vicId === b.id ? o : null;
}
function kneeKnockable(o) { return o.alive && !o.grappled && !o.grapple && !o.slam && !subLocked(o) && !o.igbb && !o.koOut; }

// Free to start a clinch or a flying knee: nothing else going on.
function kneeFree(b) {
  return b.alive && !b.koOut && inOrdinaryMovement(b) && !b.punch && !b.kick && !b.koPunch && !b.swing && !b.throwAnim &&
    !b.elbowAnim && !b.kneeAnim && !b.cmb && !b.dizzy && !swordDuelActive();
}
// Someone he can leap at.
function kneeTarget(o) {
  return o.alive && !o.koOut && !o.invincible && !specialBusy(o) && !o.beamPin && !swordDuelLocked(o);
}
// Someone he can grab: on their feet and not in the middle of a move of their own.
function plumTarget(o) { return kneeTarget(o) && inOrdinaryMovement(o) && !o.koPunch && !o.plum && !o.fknee; }

// ---------------------------------------------------------------- the knee

// From the abilities loop, after the elbow. Starts a knee when they're close
// and he's free (the knee itself is moved along by tickKnees).
function updateKnees(self, other, dt, d) {
  var cfg = kneeCfg(self);
  if (!cfg || cfg.damage == null) return; // (only the clinch, the flying knee or combinations)
  var cd = kneeNum(self, "cooldown");
  if (self.kneeCd == null) self.kneeCd = cd * stagger();
  self.kneeCd = Math.max(0, self.kneeCd - dt * (self.atkRate || 1));
  var busy = self.punch || self.kick || self.swing || self.throwAnim || self.combo || self.taunt || self.koPunch || self.elbowAnim || self.kneeAnim || self.cmb;
  if (!busy && self.kneeCd === 0 && other.alive && !other.koOut && d < self.r + other.r + kneeNum(self, "reach")) {
    self.kneeCd = cd;
    startKnee(self, other, {});
    // The punch and the kick wait for the knee to come back down.
    var back = kneeNum(self, "speed") + 0.05;
    if (self.char.hasPunch) self.punchCd = Math.max(self.punchCd || 0, back);
    if (self.char.hasKick) self.kickCd = Math.max(self.kickCd || 0, back);
  }
}

// Starts one knee. opts (all optional): damage, critChance, critMult,
// knockback, reach, speed, side, source (default "knee"), name (the floater,
// default "KNEE!"), quiet (no floater), always (lands whatever the gap),
// onLand(dealt, crit). Returns the knee.
function startKnee(self, other, opts) {
  opts = opts || {};
  var side = opts.side || (self.kneeSide = -(self.kneeSide || 1));
  self.kneeAnim = { t: 0, dur: opts.speed || kneeNum(self, "speed"), hit: false, side: side, targetId: other.id, opts: opts, crit: false };
  playKneeSwish();
  return self.kneeAnim;
}

// Taken over by something else: the knee's dropped.
function kneeStopped(b) { return !b.alive || b.koOut || !inOrdinaryMovement(b); }

// One knee landing (or missing).
function landKnee(self, other, k) {
  var o = k.opts || {};
  if (!other || !other.alive || other.koOut) { if (o.onLand) o.onLand(0, false); return 0; }
  var d = kDist(self, other), ux = (other.x - self.x) / d, uy = (other.y - self.y) / d;
  var reach = o.reach != null ? o.reach : kneeNum(self, "reach");
  if (!o.always && d > self.r + other.r + reach + 8) {
    floater(other.x, other.y - other.r - 8, "WHIFF", "dodge");
    if (o.onLand) o.onLand(0, false);
    return 0;
  }
  var critChance = o.critChance != null ? o.critChance : kneeNum(self, "critChance");
  var crit = critChance > 0 && Math.random() * 100 < critChance;
  var base = o.damage != null ? o.damage : kneeNum(self, "damage");
  var mult = crit ? (o.critMult != null ? o.critMult : kneeNum(self, "critMult")) : 1;
  var dealt = hurt(other, base * mult, o.source || "knee", self.id);
  if (dealt > 0) {
    k.crit = crit;
    var kb = o.knockback != null ? o.knockback : kneeNum(self, "knockback");
    if (!other.justDodged && kb && kneeKnockable(other)) { other.vx += ux * kb * (crit ? 1.5 : 1); other.vy += uy * kb * (crit ? 1.5 : 1); }
    kneeSpark(self, other, ux, uy, crit);
    if (!o.quiet) floater(other.x, other.y - other.r - 32, crit ? "CRIT KNEE!" : (o.name || "KNEE!"), crit ? "crit" : "note");
    playKneeHit(dealt, crit);
    if (!reduceMotion) shake = Math.max(shake, crit ? 12 : 6);
    if (crit) hitStop = Math.max(hitStop, 0.06);
  }
  if (o.onLand) o.onLand(dealt, crit);
  checkEnd();
  return dealt;
}

// ---------------------------------------------------------------- the clinch and the flying knee

// From the abilities loop, before the special: the clinch and the flying
// knee. True while one of them has him (he does nothing else).
function updateKneeMoves(self, other, dt) {
  if (self.plum) { self.plum.frame = kneeFrame; return runPlum(self, other, dt); } // (a combination can put a fighter with no knee block in the clinch)
  if (self.fknee) { self.fknee.frame = kneeFrame; return runFlyingKnee(self, other, dt); }
  var cfg = kneeCfg(self);
  if (!cfg || (!cfg.clinch && !cfg.flying)) return false;
  if (cfg.clinch && self.plumT == null) self.plumT = kRand(plumNums(self).first);
  if (cfg.flying && self.fkT == null) self.fkT = kRand(fkNums(self).first);
  if (!started || over) return false;
  if (self.plumT > 0) self.plumT -= dt;
  if (self.fkT > 0) self.fkT -= dt;
  if (!kneeFree(self) || !kneeTarget(other)) return false;
  var gap = kDist(self, other) - self.r - other.r;
  if (cfg.clinch && self.plumT <= 0 && gap < plumNums(self).range && plumTarget(other)) { startPlum(self, other, null); return true; }
  var fk = cfg.flying ? fkNums(self) : null;
  if (fk && self.fkT <= 0 && gap >= fk.minGap && gap <= fk.maxGap) { startFlyingKnee(self, other, fk); return true; }
  return false;
}

// ---- the plum

// Reaches up for the back of their head. `cmb` is the combination that led
// into it (combos.js), if any: its count goes on through the knees.
function startPlum(self, other, cmb) {
  if (!plumTarget(other)) return false;
  clearActions(self);
  self.kneeAnim = null;
  self.plum = { phase: "grab", t: 0, vicId: other.id, cmb: cmb, frame: kneeFrame, side: 1, thrown: 0, landed: 0, jolt: 0 };
  floater(self.x, self.y - self.r - 30, "CLINCH!", "crit");
  playClinchGrab();
  return true;
}

function plumBroken(self, v) {
  return over || !self.alive || self.koOut || self.slam || self.grappled || self.grapple || self.sprawl || self.sprawled || subLocked(self) ||
    self.shocked || self.dazed || self.dizzy || self.igbb || self.beamPin || !v || !v.alive || v.koOut || v.slam || v.igbb || v.grapple;
}

function runPlum(self, other, dt) {
  var m = self.plum, pc = plumNums(self), v = balls[m.vicId];
  if (plumBroken(self, v)) { endPlum(self, "lost"); return false; }
  m.t += dt;
  m.jolt = Math.max(0, m.jolt - dt);
  var d = kDist(self, v);
  if (m.phase === "grab") {
    // Steps in with his hands coming up round their head.
    var gap = d - self.r - v.r;
    var sp = gap > 2 ? Math.min(320, gap * 18) : 0;
    self.vx = (v.x - self.x) / d * sp; self.vy = (v.y - self.y) / d * sp;
    if (m.t < PLUM_GRAB) return true;
    if (gap > pc.range + 10 || !plumTarget(v)) { // they got out of there
      floater(v.x, v.y - v.r - 8, "WHIFF", "dodge");
      endPlum(self, "whiff");
      return false;
    }
    lockPlum(self, v, m, pc);
    return true;
  }
  // Held: a knee every `gap` seconds, alternating legs.
  self.vx = 0; self.vy = 0; v.vx = 0; v.vy = 0;
  placePlum(self, v, m);
  var kn = m.knee;
  if (kn) {
    kn.t += dt;
    if (!kn.hit && kn.t >= kn.dur * KNEE_HIT) {
      kn.hit = true;
      landPlumKnee(self, v, m, pc);
      if (!self.plum) return false;
    }
    if (kn.t >= kn.dur) {
      m.knee = null; m.next = pc.gap - PLUM_KNEE;
      if (m.thrown >= m.count) { endPlum(self, "done"); return false; }
      // They fight hands and break free (a Grappler knows the clinch).
      var esc = pc.escape + (v.char.hasGrapple ? pc.grapplerEscape : 0);
      if (Math.random() * 100 < esc) { endPlum(self, "escape"); return false; }
    }
    return true;
  }
  m.next -= dt;
  if (m.next <= 0) {
    m.side = -m.side;
    m.knee = { t: 0, dur: PLUM_KNEE, hit: false, side: m.side };
    m.thrown++;
    playKneeSwish();
  }
  return true;
}

// Locks on: they're held, their head pulled down, for `knees` knees.
function lockPlum(self, v, m, pc) {
  clearActions(v);
  v.koPunch = null; v.elbowAnim = null; v.kneeAnim = null;
  if (v.cmb && typeof endCombo === "function") endCombo(v, false);
  v.choked = true; // held: it can't do anything until it's let go (like a choke)
  m.phase = "hold"; m.t = 0;
  m.count = Math.max(1, Math.round(kRand(pc.knees)));
  m.next = 0.06;
  var d = kDist(self, v);
  m.ux = (v.x - self.x) / d; m.uy = (v.y - self.y) / d;
  // Where the pair stands: kept clear of the cage so neither gets pushed through it.
  var half = (self.r + v.r) * PLUM_GAP / 2, ax = Math.abs(m.ux) * half, ay = Math.abs(m.uy) * half;
  var mx = (self.x + v.x) / 2, my = (self.y + v.y) / 2, pad = Math.max(self.r, v.r);
  m.ax = Math.min(W - pad - ax, Math.max(pad + ax, mx));
  m.ay = Math.min(H - pad - ay, Math.max(pad + ay, my));
  placePlum(self, v, m);
  crowdReact(0.3);
  playPunch(8);
}

function placePlum(self, v, m) {
  var half = (self.r + v.r) * PLUM_GAP / 2;
  self.x = m.ax - m.ux * half; self.y = m.ay - m.uy * half;
  v.x = m.ax + m.ux * half; v.y = m.ay + m.uy * half;
}

function landPlumKnee(self, v, m, pc) {
  var dealt = hurt(v, pc.damage, "finisher", self.id); // (held: nobody slips or blocks a knee in the plum)
  m.jolt = 0.12;
  if (dealt > 0) {
    m.landed++;
    kneeSpark(self, v, m.ux, m.uy, false);
    playKneeHit(dealt, false);
    if (!reduceMotion) shake = Math.max(shake, 7);
  }
  checkEnd();
  if (!v.alive || v.koOut) endPlum(self, "done");
}

// Lets go. how: "done" (all the knees), "escape" (they broke free), "whiff"
// (the grab missed), "lost" (something else took over).
function endPlum(self, how) {
  var m = self.plum;
  if (!m) return;
  self.plum = null;
  var v = balls[m.vicId], pc = plumNums(self);
  if (v && m.phase === "hold") v.choked = false;
  self.plumT = kRand(pc.every);
  if (m.phase === "hold" && v && (how === "done" || how === "escape")) {
    // Shoved off (the last knee), or they push him off breaking free.
    var esc = how === "escape", kb = esc ? 300 : pc.knockback;
    if (v.alive && !v.koOut) { v.vx = m.ux * kb; v.vy = m.uy * kb; }
    if (self.alive) { self.vx = -m.ux * (esc ? 260 : 160); self.vy = -m.uy * (esc ? 260 : 160); }
    if (esc) floater(v.x, v.y - v.r - 30, "BROKE FREE!", "dodge");
  }
  // A combination into the clinch: every strike landed and every knee went in.
  if (m.cmb && typeof comboCounter === "function" && how === "done") comboCounter(self, m.cmb.hits + m.landed, m.cmb.n + m.thrown);
}

// ---- the flying knee

function startFlyingKnee(self, other, fk) {
  clearActions(self);
  self.kneeAnim = null;
  self.vx = 0; self.vy = 0;
  var readP = fk.readChance + (other.char.hasWeave ? 10 : 0);
  self.fknee = { phase: "load", t: 0, tx: other.x, ty: other.y, read: Math.random() * 100 < readP, frame: kneeFrame, side: Math.random() < 0.5 ? -1 : 1 };
  if (self.fknee.read) floater(other.x, other.y - other.r - 30, "!", "crit");
  playKneeLoad();
}

function fkBroken(self) {
  return over || !self.alive || self.koOut || self.slam || self.grappled || self.grapple || self.sprawl || self.sprawled || subLocked(self) ||
    self.shocked || self.dazed || self.igbb || self.beamPin;
}

// Backing off from a flying knee they saw coming (only while they're rolling
// about on their own).
function kneeBackOff(self, other) {
  if (!other.alive || !inOrdinaryMovement(other) || other.angry) return;
  var d = kDist(self, other), sp = Math.max(Math.sqrt(other.vx * other.vx + other.vy * other.vy), 200);
  other.vx = (other.x - self.x) / d * sp; other.vy = (other.y - self.y) / d * sp;
}

function runFlyingKnee(self, other, dt) {
  var m = self.fknee, fk = fkNums(self);
  if (m.phase === "ko") { self.vx = 0; self.vy = 0; return true; } // (tickKnees calls it)
  if (fkBroken(self)) { endFlyingKnee(self); return false; }
  m.t += dt;
  if (m.phase === "load") {
    self.vx = 0; self.vy = 0;
    if (m.t < fk.load - 0.12) { m.tx = other.x; m.ty = other.y; } // follows them, then locks just before he goes
    if (m.read) kneeBackOff(self, other);
    if (m.t >= fk.load) {
      var dx = m.tx - self.x, dy = m.ty - self.y, dd = Math.sqrt(dx * dx + dy * dy) || 1;
      m.phase = "air"; m.t = 0; m.ux = dx / dd; m.uy = dy / dd;
      m.airMax = Math.min(0.6, (dd + 40) / fk.speed);
      floater(self.x, self.y - self.r - 30, "FLYING KNEE!", "crit");
      crowdReact(0.3);
      playWhoosh();
    }
    return true;
  }
  if (m.phase === "air") {
    self.vx = m.ux * fk.speed; self.vy = m.uy * fk.speed;
    if (!reduceMotion) particles.push({ x: self.x, y: self.y, vx: -self.vx * 0.1, vy: -self.vy * 0.1, life: 0.2, max: 0.2, size: self.r * 0.5, color: self.char.color });
    var gap = kDist(self, other) - self.r - other.r;
    if (other.alive && !other.koOut && gap < FK_REACH) return landFlyingKnee(self, other, m, fk);
    if (m.t >= m.airMax) {
      // Nobody there: lands off balance, wide open.
      m.phase = "open"; m.t = 0;
      self.vx = m.ux * 160; self.vy = m.uy * 160;
      floater(self.x, self.y - self.r - 8, "WHIFF", "dodge");
      playKneeLand();
    }
    return true;
  }
  var damp = Math.exp(-6 * dt);
  self.vx *= damp; self.vy *= damp;
  if ((m.phase === "land" && m.t >= FK_LAND) || (m.phase === "open" && m.t >= fk.open)) { endFlyingKnee(self); return false; }
  return true;
}

function landFlyingKnee(self, other, m, fk) {
  var d = kDist(self, other), ux = (other.x - self.x) / d, uy = (other.y - self.y) / d;
  var free = kneeKnockable(other) && !other.holdAtOne && !other.guard && !other.sprawl && !other.sprawled;
  var koP = fk.koBase + fk.koLow * (1 - Math.max(0, Math.min(1, other.hp / MAX_HP)));
  m.phase = "land"; m.t = 0;
  self.vx = -ux * 140; self.vy = -uy * 140;
  if (free && Math.random() * 100 < koP) {
    // The knockout knee goes through every defence, like the KO Rush; slipped
    // or blocked, it does nothing at all.
    if (throwKoPunch(self, other)) {
      m.phase = "ko";
      self.vx = 0; self.vy = 0;
      kneeSpark(self, other, ux, uy, true);
      playImpactClip(2, 1.3, 45);
      crowdReact(1);
    }
    return true;
  }
  if (other.alive && !other.koOut) {
    var dealt = hurt(other, fk.damage, "knee", self.id);
    if (dealt > 0) {
      if (!other.justDodged && kneeKnockable(other)) { other.vx = ux * fk.knockback; other.vy = uy * fk.knockback; }
      kneeSpark(self, other, ux, uy, true);
      impacts.push({ x: other.x - ux * other.r, y: other.y - uy * other.r, nx: -ux, ny: -uy, life: 0.4, max: 0.4, color: self.char.color });
      hitStop = Math.max(hitStop, 0.07);
      if (!reduceMotion) shake = Math.max(shake, 14);
      playKneeHit(dealt, true);
      playImpactClip(1, 1.1, dealt);
      crowdReact(0.5);
    }
    checkEnd();
  }
  return true;
}

function endFlyingKnee(self) {
  var m = self.fknee;
  if (!m) return;
  self.fknee = null;
  self.fkT = kRand(fkNums(self).every);
  if (self.alive && !self.koOut && inOrdinaryMovement(self)) setSpeed(self, self.baseSpeed || SPEED);
}

// ---------------------------------------------------------------- every frame

// From update(), after the abilities loop: moves knees along and lands them,
// lets go of a clinch or a flying knee the abilities loop didn't get to this
// frame (something else took him over), and calls a flying-knee knockout.
function tickKnees(dt) {
  balls.forEach(function (b) {
    var other = balls[1 - b.id];
    if (b.plum && b.plum.frame !== kneeFrame) endPlum(b, "lost");
    var f = b.fknee;
    if (f && f.phase === "ko") {
      f.t += dt;
      if (other.koOut) { var damp = Math.exp(-5 * dt); other.vx *= damp; other.vy *= damp; }
      if (f.t >= FK_KO_HOLD || !other.koOut || !b.alive) { b.fknee = null; b.fkT = kRand(fkNums(b).every); finishKnockedOut(other); checkEnd(); }
    } else if (f && f.frame !== kneeFrame) endFlyingKnee(b);
    var k = b.kneeAnim;
    if (k) {
      if (kneeStopped(b)) {
        b.kneeAnim = null;
        if (!k.hit && k.opts && k.opts.onLand) k.opts.onLand(0, false);
      } else {
        k.t += dt;
        if (!k.hit && k.t >= k.dur * KNEE_HIT) { k.hit = true; landKnee(b, balls[k.targetId], k); }
        if (b.kneeAnim === k && k.t >= k.dur) b.kneeAnim = null;
      }
    }
    if (b.kneeFx && b.kneeFx.length) b.kneeFx = b.kneeFx.filter(function (x) { x.t += dt; return x.t < x.max; });
  });
  kneeFrame++;
}

// ---------------------------------------------------------------- drawing

function kneeLimb(b) { return ((b.char.kick && b.char.kick.size) || (b.char.punch && b.char.punch.size) || 14) * 0.8; }
function kneeSkin(b) { return b.char.look ? b.char.look.skin : b.char.color; }
function kneeShorts(b) { return b.char.look ? b.char.look.shorts : shadeHex(b.char.color, -0.3); }

// Where a knee is: the hip, the knee and the foot of fighter b driving a knee
// along `ang`, out to `reachTo` from his middle. `p` 0..1 through the knee
// (it lands at `hitAt`), `side` which leg. The knee comes up from under him
// and drives in; the shin hangs folded back underneath it.
function kneePose(b, ang, side, p, reachTo, hitAt) {
  var r = b.r, ux = Math.cos(ang), uy = Math.sin(ang), h = hitAt || KNEE_HIT;
  var e = p < h ? easeOut(p / h) : 1 - (p - h) / (1 - h);
  e = Math.max(0, Math.min(1, e));
  var hip = { x: b.x + ux * r * 0.28 + side * r * 0.14, y: b.y + uy * r * 0.28 + r * 0.5 };
  var kd = r * 0.55 + (reachTo - r * 0.55) * e;
  var knee = { x: b.x + ux * kd, y: b.y + uy * kd + r * (0.5 - 0.62 * e) }; // up as it drives in
  var foot = { x: knee.x - ux * r * (0.3 + 0.28 * e), y: knee.y - uy * r * (0.3 + 0.28 * e) + r * 0.58 };
  return { hip: hip, knee: knee, foot: foot, e: e };
}

// One leg with the knee up: the thigh in its shorts, the shin folded back,
// a big round kneecap. `glow` (0..1) lights the kneecap up white.
function drawKneeLeg(b, pose, glow) {
  var limb = kneeLimb(b), skin = kneeSkin(b), hip = pose.hip, knee = pose.knee, foot = pose.foot;
  ctx.save();
  strokeLimb(limb * 1.05, skin, function () { ctx.moveTo(knee.x, knee.y); ctx.lineTo(foot.x, foot.y); });
  strokeLimb(limb * 1.4, skin, function () { ctx.moveTo(hip.x, hip.y); ctx.lineTo(knee.x, knee.y); });
  // Just the hem of the shorts at the top, so the bare leg and the knee read.
  strokeLimb(limb * 1.55, kneeShorts(b), function () { ctx.moveTo(hip.x, hip.y); ctx.lineTo(hip.x + (knee.x - hip.x) * 0.22, hip.y + (knee.y - hip.y) * 0.22); });
  ctx.fillStyle = shadeHex(b.char.look ? b.char.look.skin : "#d9a27e", 0.14); ctx.strokeStyle = theme.wall; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(knee.x, knee.y, limb, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  if (glow > 0) {
    ctx.globalAlpha = Math.min(1, glow);
    ctx.fillStyle = "#ffffff";
    ctx.beginPath(); ctx.arc(knee.x, knee.y, limb * 0.75, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;
  }
  ctx.restore();
}

// The swoosh the kneecap leaves as it comes up.
function drawKneeArc(b, ang, side, p, reachTo, hitAt) {
  var h = hitAt || KNEE_HIT;
  if (p < 0.12 || p > h + 0.25) return;
  // Traced just outside the kneecap (away from the hip), so the leg doesn't cover it.
  var pts = [], off = kneeLimb(b) * 1.6;
  for (var i = 0; i <= 7; i++) {
    var ps = kneePose(b, ang, side, Math.max(0, Math.min(p, h) - 0.35 + i * 0.35 / 7), reachTo, h);
    var ox = ps.knee.x - ps.hip.x, oy = ps.knee.y - ps.hip.y, od = Math.sqrt(ox * ox + oy * oy) || 1;
    pts.push({ x: ps.knee.x + ox / od * off, y: ps.knee.y + oy / od * off });
  }
  var line = function () { ctx.beginPath(); pts.forEach(function (q, k) { if (k) ctx.lineTo(q.x, q.y); else ctx.moveTo(q.x, q.y); }); ctx.stroke(); };
  ctx.save();
  ctx.lineCap = "round"; ctx.lineJoin = "round";
  var a = Math.max(0, Math.min(1, p < h ? (p - 0.12) / 0.15 : 1 - (p - h) / 0.25));
  ctx.globalAlpha = 0.35 * a; ctx.strokeStyle = theme.wall; ctx.lineWidth = kneeLimb(b) * 0.7 + 4; line(); // (a dark edge so it shows on a light mat)
  ctx.globalAlpha = 0.85 * a; ctx.strokeStyle = "#ffffff"; ctx.lineWidth = kneeLimb(b) * 0.7; line();
  ctx.restore();
}

// How far out a knee reaches toward `o` (into them, not through them).
function kneeReachTo(b, o, extra) {
  var d = kDist(b, o);
  return Math.max(b.r * 0.95, Math.min(d - o.r * 0.7, b.r + (extra || 40)));
}

// From draw(), over both fighters: knees, the clinch, the flying knee.
function drawKneesOver() {
  balls.forEach(function (b) {
    var other = balls[1 - b.id];
    if (b.alive && b.fknee) drawFlyingKnee(b, other);
    if (b.alive && b.plum) drawPlum(b);
    var k = b.kneeAnim;
    if (b.alive && k) {
      var o = balls[k.targetId] || other, ang = Math.atan2(o.y - b.y, o.x - b.x), p = Math.min(1, k.t / k.dur), reach = kneeReachTo(b, o);
      drawKneeArc(b, ang, k.side, p, reach);
      drawKneeLeg(b, kneePose(b, ang, k.side, p, reach), k.hit ? Math.max(0, 1 - (k.t - k.dur * KNEE_HIT) / 0.15) : 0);
    }
    (b.kneeFx || []).forEach(drawKneeFlash);
  });
}

// The plum: both arms over their shoulders, hands clasped on the back of
// their head, pulling it down, and a knee driving up into it.
function drawPlum(b) {
  var m = b.plum, v = balls[m.vicId];
  if (!v) return;
  var ang = Math.atan2(v.y - b.y, v.x - b.x), ux = Math.cos(ang), uy = Math.sin(ang), px = -uy, py = ux, r = b.r, V = v.r;
  var lean = m.phase === "hold" ? plumLean(b, v) : 0;
  // The top of their head (turned with the lean), where his hands lock.
  var head = { x: v.x + Math.sin(lean) * V * 0.52, y: v.y - Math.cos(lean) * V * 0.52 + (m.phase === "hold" ? V * 0.06 : 0) };
  var g = m.phase === "grab" ? easeOut(m.t / PLUM_GRAB) : 1, size = (b.char.punch && b.char.punch.size) || 13, limb = size * 0.62;
  ctx.save();
  if (m.knee) {
    var kn = m.knee, p = Math.min(1, kn.t / kn.dur), reach = kneeReachTo(b, v, 30);
    drawKneeArc(b, ang, kn.side, p, reach);
    drawKneeLeg(b, kneePose(b, ang, kn.side, p, reach), kn.hit ? Math.max(0, 1 - (kn.t - kn.dur * KNEE_HIT) / 0.12) : 0);
  }
  [-1, 1].forEach(function (s) {
    var sh = { x: b.x + ux * r * 0.3 + px * s * r * 0.6, y: b.y + uy * r * 0.3 + py * s * r * 0.6 - r * 0.15 };
    var guard = { x: b.x + ux * r * 0.8 + px * s * r * 0.4, y: b.y + uy * r * 0.8 + py * s * r * 0.4 };
    var lock = { x: head.x + px * s * V * 0.2 - ux * V * 0.05, y: head.y + py * s * V * 0.2 - uy * V * 0.05 };
    var hd = { x: guard.x + (lock.x - guard.x) * g, y: guard.y + (lock.y - guard.y) * g };
    strokeLimb(limb, armColor(b.char, s), function () { ctx.moveTo(sh.x, sh.y); ctx.lineTo(hd.x, hd.y); });
    drawGloveAt(hd.x, hd.y, size * 0.72, b.char, ang);
  });
  ctx.restore();
}

// The flying knee: the red line where he's going while he crouches, then the
// knee out in front of him in the air with speed lines behind.
function drawFlyingKnee(b, other) {
  var m = b.fknee, r = b.r;
  ctx.save();
  if (m.phase === "load") {
    var fk = fkNums(b), k = Math.min(1, m.t / fk.load);
    ctx.globalAlpha = 0.35 + 0.5 * k;
    ctx.strokeStyle = "#e0202a"; ctx.lineWidth = 4; ctx.setLineDash([12, 9]); ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(b.x, b.y); ctx.lineTo(m.tx, m.ty); ctx.stroke();
    ctx.setLineDash([]);
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(m.tx, m.ty, r * (0.5 + 0.2 * Math.sin(m.t * 30)), 0, Math.PI * 2); ctx.stroke();
    ctx.globalAlpha = 1;
    // The knee cocked, ready to go.
    var a0 = Math.atan2(m.ty - b.y, m.tx - b.x);
    drawKneeLeg(b, kneePose(b, a0, m.side, 0.12 * k, r * 1.2), 0);
  } else if (m.phase === "air" || m.phase === "land") {
    var ang = Math.atan2(m.uy, m.ux), ux = m.ux, uy = m.uy, px = -uy, py = ux;
    if (m.phase === "air") {
      ctx.strokeStyle = "#ffffff"; ctx.lineCap = "round"; ctx.lineWidth = 4;
      [-0.55, -0.18, 0.18, 0.55].forEach(function (o, i) {
        var back = r * (1.15 + (i % 2) * 0.35), len = r * (0.9 + (i % 2) * 0.4);
        ctx.globalAlpha = 0.7;
        ctx.beginPath();
        ctx.moveTo(b.x - ux * back + px * o * r, b.y - uy * back + py * o * r);
        ctx.lineTo(b.x - ux * (back + len) + px * o * r, b.y - uy * (back + len) + py * o * r);
        ctx.stroke();
      });
      ctx.globalAlpha = 1;
    }
    var p = m.phase === "air" ? KNEE_HIT : KNEE_HIT + (1 - KNEE_HIT) * Math.min(1, m.t / FK_LAND);
    drawKneeLeg(b, kneePose(b, ang, m.side, p, r * 1.3), 0);
  }
  ctx.restore();
}

// The flash where a knee lands: a white star burst.
function drawKneeFlash(f) {
  var k = f.t / f.max, R = (f.big ? 46 : 30) * (0.55 + 0.45 * easeOut(k));
  ctx.save();
  ctx.globalAlpha = 1 - k * k;
  ctx.translate(f.x, f.y); ctx.rotate(f.ang);
  ctx.beginPath();
  for (var i = 0; i < 16; i++) {
    var rr = i % 2 ? R * 0.42 : R, a = i * Math.PI / 8;
    if (i) ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); else ctx.moveTo(rr, 0);
  }
  ctx.closePath();
  ctx.fillStyle = "#ffffff"; ctx.fill();
  ctx.lineWidth = 3; ctx.strokeStyle = f.big ? "#ffb31a" : "#ffd86b"; ctx.stroke();
  ctx.restore();
}

// Sparks and a flash where a knee lands.
function kneeSpark(self, other, ux, uy, big) {
  var cx = other.x - ux * other.r * 0.85, cy = other.y - uy * other.r * 0.85;
  other.flash = 0.16;
  self.kneeFx = self.kneeFx || [];
  self.kneeFx.push({ x: cx, y: cy, t: 0, max: big ? 0.3 : 0.2, big: big, ang: Math.random() * Math.PI });
  for (var i = 0; i < (big ? 16 : 8) && !reduceMotion; i++) {
    var a = Math.atan2(-uy, -ux) + (Math.random() - 0.5) * 2.4, s = 120 + Math.random() * (big ? 320 : 180);
    particles.push({ x: cx, y: cy, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 0.25 + Math.random() * 0.2, max: 0.45, size: 1.8 + Math.random() * 2.6, color: i % 3 ? "#ffffff" : "#ffd86b" });
  }
}

// Their head pulled down toward him (radians: which way it leans).
function plumLean(holder, v) { return (holder.x >= v.x ? 1 : -1) * PLUM_LEAN; }

// From draw(), on each fighter's body: pulled down into the clinch (jolted up
// by each knee), crouched for a flying knee, up in the air for it, stumbling
// after a miss.
function applyKneePose(b) {
  var h = plumHolder(b);
  if (h) {
    var lean = plumLean(h, b), jolt = h.plum.jolt > 0 ? h.plum.jolt / 0.12 : 0;
    ctx.translate(b.x, b.y + b.r * 0.06 - jolt * b.r * 0.12); ctx.rotate(lean * (1 - 0.35 * jolt)); ctx.translate(-b.x, -b.y);
  }
  if (b.plum && b.plum.phase === "hold") { // hunched forward into it
    var v = balls[b.plum.vicId];
    ctx.translate(b.x, b.y); ctx.rotate(-plumLean(b, v) * 0.35); ctx.translate(-b.x, -b.y);
  }
  var m = b.fknee;
  if (!m) return;
  if (m.phase === "load") {
    var k = Math.min(1, m.t / fkNums(b).load);
    ctx.translate(b.x, b.y + b.r); ctx.scale(1 + 0.08 * k, 1 - 0.14 * k); ctx.translate(-b.x, -(b.y + b.r));
  } else if (m.phase === "air") {
    var s = 1 + 0.16 * Math.sin(Math.min(1, m.t / (m.airMax || 0.4)) * Math.PI);
    ctx.translate(b.x, b.y); ctx.scale(s, s); ctx.rotate((m.ux >= 0 ? 1 : -1) * 0.25); ctx.translate(-b.x, -b.y);
  } else if (m.phase === "open") {
    ctx.translate(b.x, b.y); ctx.rotate(Math.sin(m.t * 16) * 0.22 * (1 - m.t / fkNums(b).open)); ctx.translate(-b.x, -b.y);
  }
}

// ---------------------------------------------------------------- sound

function kneeAudio(fn) {
  try {
    var ac = getAudioCtx();
    if (!ac) return;
    if (ac.state === "suspended") ac.resume();
    fn(ac, ac.currentTime);
  } catch (e) { /* never let audio break the game */ }
}
// A short rush of air as the knee comes up.
function playKneeSwish() { kneeAudio(function (ac, t) { caneBurst(ac, t, 1100, 1.0, 0.2, 0.1); }); }
// The deep thud of a knee going in, on top of the punch's crack.
function playKneeHit(dealt, big) {
  playPunch(dealt);
  kneeAudio(function (ac, t) {
    caneTone(ac, t, "sine", big ? 150 : 200, 60, big ? 0.6 : 0.42, big ? 0.22 : 0.14);
    caneBurst(ac, t, 850, 1.2, big ? 0.75 : 0.45, 0.08);
  });
}
// Gloves slapping onto the back of the head.
function playClinchGrab() {
  kneeAudio(function (ac, t) {
    caneBurst(ac, t, 2300, 1.4, 0.35, 0.05);
    caneBurst(ac, t + 0.06, 2000, 1.4, 0.3, 0.05);
    caneTone(ac, t, "triangle", 320, 190, 0.16, 0.08);
  });
}
// Crouching to spring: a low scrape.
function playKneeLoad() { kneeAudio(function (ac, t) { caneBurst(ac, t, 500, 0.8, 0.25, 0.18); }); }
// Landing off balance after a miss.
function playKneeLand() { kneeAudio(function (ac, t) { caneTone(ac, t, "sine", 120, 55, 0.4, 0.16); caneBurst(ac, t, 400, 0.9, 0.3, 0.1); }); }

// ---------------------------------------------------------------- gallery

// The fighter card's move list (gallery.js).
function kneeGalleryMoves(ch, add) {
  var k = ch.knee;
  if (!k) return;
  var num = function (key) { return k[key] != null ? k[key] : KNEE_DEF[key]; };
  var crit = num("critChance") > 0 ? " " + num("critChance") + "% are critical hits for " + num("critMult") + "x." : "";
  if (k.damage != null) add("🦵", "Knees", num("damage") + " damage up close (" + num("reach") + " reach), one every " + secs(num("cooldown")) + "." + crit);
  if (k.clinch) {
    var c = kneeMerge(PLUM_DEF, k.clinch);
    add("🤼", "Clinch knees", "Every " + c.every[0] + "-" + c.every[1] + "s up close he grabs the back of their head (\"CLINCH!\") and pulls it down into " +
      c.knees[0] + "-" + c.knees[1] + " knees of " + c.damage + ". They're held, but they break free " + c.escape + "% of the time after each knee (" +
      (c.escape + c.grapplerEscape) + "% for a Grappler).");
  }
  if (k.flying) {
    var f = kneeMerge(FKNEE_DEF, k.flying);
    add("🚀", "Flying knee", "Every " + f.every[0] + "-" + f.every[1] + "s from " + f.minGap + "-" + f.maxGap + " away he crouches (a red line shows where he's going) and leaps in knee first for " +
      f.damage + ". A clean one knocks them out " + f.koBase + "% of the time at full health, up to " + (f.koBase + f.koLow) + "% the more hurt they are. If they get out of the way he lands off balance, wide open for " + secs(f.open) + ".");
  }
}
