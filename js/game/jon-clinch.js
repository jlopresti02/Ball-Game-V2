// Jon Jones's clinch game and his dirty-but-legal striking (Christian,
// 2026-11-13, reworked 2026-11-14). In BOTH modes he ties them up in the
// clinch, works knees and elbows in there and finishes the exchange with his
// inside trip (a throw that hurts), and he throws his own spinning elbow. In
// EVIL mode he also stomps oblique kicks into their knee and throws his
// elbows quicker (the eye poke is his EVIL weave, jon.js). In GOAT mode he
// goes for the guillotine more the more hurt they are. Everything is under
// `jonClinch` in his character file; leave the block out (or switch a part
// off in a mode) and he fights exactly as before.
//
//   "jonClinch": { "first": [3, 5], "every": [5.5, 8], "range": 22,
//     "reach": 0.26, "evade": 18, "weaverEvade": 12,
//     "strikes": [1, 2], "gap": 0.32, "escape": 25, "grapplerEscape": 10, "knockback": 360, "open": 0.7,
//     "knee": { "damage": 5, "critChance": 25, "critMult": 2 }, "elbow": { "critChance": 20, "critMult": 2 },
//     "goat": { "on": true, "knees": 55, "trip": 55, "spinElbow": true, "oblique": false },
//     "evil": { "on": true, "knees": 35, "trip": 35, "spinElbow": true, "oblique": true, "elbowCooldown": 1.6 },
//     "trip": { "tell": 0.34, "defend": 28, "grapplerDefend": 15, "tddMult": 0.5,
//               "damage": 12, "fall": 0.36, "down": 0.5 },
//     "guillotine": { "lowHp": 40, "bonus": 35, "clinch": 40, "outcomes": { ... } },
//     "spinElbow": { "first": [5, 9], "every": [10, 15], "range": 26, "afterClinch": 30, "breakShove": 80,
//                    "turn": 0.22, "step": 380, "speed": 0.24, "damage": 8, "critChance": 25, "critMult": 2, "knockback": 380 },
//     "oblique": { "first": [1.5, 3], "every": [5, 8], "range": 46, "chamber": 0.2, "dur": 0.42,
//                  "damage": 5, "knockback": 200, "slow": 0.85, "slowTime": 1.5 } }
//
// The clinch (in each mode with `on`): every `every` seconds (the first
// after `first`), when they're within `range` (the gap between the two
// balls) and he's free, he reaches in to tie them up over-under ("CLINCH").
// The reach lasts `reach` seconds: that's the tell, and they slip it
// `evade`% of the time (`weaverEvade`% more for a weaver), or get away
// altogether ("WHIFF"). Then they're held chest to chest while he throws
// `strikes` strikes (rolled each time), one every `gap` seconds: knees
// (that mode's `knees`% of them, with the `knee` numbers here) and elbows
// (his own `elbow` block, crits and cuts and all; `elbow` here can change any
// of it). Held, they can't slip or block them, but after each one they break
// free `escape`% of the time (`grapplerEscape`% more for a Grappler):
// "BROKE FREE!". If no trip comes, the last strike shoves them off
// (`knockback`). Whenever they get out of it (they slip the reach, break
// free or keep their feet on the trip) he's left open: no punch or kick for
// `open` seconds, and their next punch is ready straight away.
//
// The inside trip (that mode's `trip`% of the clinches that last, in both
// modes): his leg hooks inside theirs and he drives into them for
// `trip.tell` seconds while a red arrow shows which way they're going (the
// tell: they keep their feet `defend`% of the time, `grapplerDefend`% more
// for a Grappler, plus `tddMult` times their sprawl chance if they have one:
// "STUFFED"). If it goes, they tip over backwards in `fall` seconds and land
// flat on their back for `damage` ("INSIDE TRIP", a dust burst, a thud),
// counted as a takedown, and he stays on top of them for `down` seconds
// before they get back up.
//
// The guillotine (only while he has it: GOAT mode). Below `lowHp`% of their
// health it gets likelier the more hurt they are, scaling up to full at 0:
// on their shots, up to `bonus`% more on top of his guillotine's own
// `chance` (tryJonGuillotine, from attemptGrab); and at the end of a clinch,
// up to `clinch`% of the time he snaps their head down into one instead of
// the trip. A guillotine he went for himself ends by `outcomes` (relative
// odds, like his guillotine block's) instead of his guillotine's own, since
// they weren't shooting a takedown they could finish.
//
// The spinning elbow (each mode with `spinElbow`): every `every` seconds
// (the first after `first`), when they're within `range` and he's free, he
// turns his back on them for `turn` seconds (the tell: he spins, stepping in
// at `step`), then the elbow comes round: `damage`, `critChance`% crits for
// `critMult` times as much (his elbow's cut on a crit), a `knockback` shove,
// "SPINNING ELBOW!". It's his elbow (elbows.js), so it can be slipped,
// blocked or whiff if they've got away. And `afterClinch`% of the clinches
// he ends by shoving them off, he lets go with only a little shove
// (`breakShove`) and spins into one on the break instead.
//
// The oblique kick (each mode with `oblique`): every `every` seconds (the
// first after `first`), when they're within `range` and he's free, he plants
// and lifts his lead knee for `chamber` seconds (the tell: his foot turned
// out and a red ring on their knee), then stomps it down into their lead
// knee: `damage`, a `knockback` shove that keeps them at bay, and a limp
// (`slow` times their speed for `slowTime` seconds, the same limp as every
// leg kick, leg-kick.js; `stack`, `maxStacks` and `minSlow` work here too).
// It's a kick: it can be slipped or blocked, or whiff if they've got away.
// With `mixGap` (seconds) and a calf kick of his own (a "legKick" block,
// leg-kick.js), the two never come on top of each other: no oblique, and no
// regular kick, while the calf kick's leg is still out, then at least
// `mixGap` before the oblique; and at least `mixGap` after an oblique before
// the next calf kick (Christian, 2026-11-17: Jon mixes the two).
//
// EVIL elbows: in a mode with `elbowCooldown`, his elbows (elbows.js) come
// round at least that often instead of his elbow block's own cooldown.
//
// Commentary calls (commentary-calls.js, fired only if it's loaded):
// "spinElbow" when the spinning elbow lands, "takedown" when the inside trip
// lands, "bigElbow" on a critical elbow in the clinch.
"use strict";

var JCL_GAP = 0.86;     // how close the pair's held (1 = just touching)
var JCL_STRIKE = 0.26;  // one knee or elbow in the clinch
var JCL_JOLT = 0.12;    // how long a strike rocks them
var jclFrame = 0;       // bumped once a frame (tickJonClinch): a move the abilities loop didn't reach is let go

function jclCfg(b) { return b && b.char && b.char.jonClinch; }
function jclRand(r) { return r[0] + Math.random() * (r[1] - r[0]); }
function jclClamp(x, lo, hi) { return Math.max(lo, Math.min(hi, x)); }
// In the clinch, tripping them, spinning or throwing the oblique kick: the
// speed regulator leaves him alone (physics.js) and his mode waits (jon.js).
function jonClinchBusy(b) { return !!(b && (b.jcl || b.jspin || b.jobl)); }
// His hands are on them (drawJonClinch draws them; drawHands skips them).
function jonClinchHandsBusy(b) { return !!(b && b.jcl && b.alive); }
// Who's got this fighter tied up (null if nobody, or he's still reaching).
function jonClinchHolder(b) {
  var o = b && balls[1 - b.id];
  return o && o.jcl && o.jcl.vicId === b.id && o.jcl.held ? o : null;
}
// A commentary call, only if the commentary calls are loaded (commentary-calls.js).
function jclCall(kind, self, other) {
  if (typeof commentaryCall === "function") commentaryCall(kind, self, other);
}

// How hurt they are under `lowHp`% health: 0 above it, up to 1 at 0 health.
function jclLow(v, gc) {
  if (!gc || !(gc.lowHp > 0)) return 0;
  return jclClamp((gc.lowHp - v.hp / MAX_HP * 100) / gc.lowHp, 0, 1);
}

// His clinch knees and elbows: his own numbers, with the block's on top.
function jclKnee(c) {
  var k = c.knee || {};
  return { damage: k.damage != null ? k.damage : 8, critChance: k.critChance != null ? k.critChance : 30, critMult: k.critMult != null ? k.critMult : 2 };
}
function jclElbow(ch, ov) {
  var e = ch.elbow || {}, o = ov || {};
  var pick = function (k, d) { return o[k] != null ? o[k] : (e[k] != null ? e[k] : d); };
  return { damage: pick("damage", 6), critChance: pick("critChance", ELBOW_CRIT), critMult: pick("critMult", 2), cut: o.cut !== undefined ? o.cut : e.cut };
}

// Each of these moves takes the place of his next punch and elbow (like a
// combination, combos.js), so they add variety more than damage.
function jclSpent(self) {
  var ch = self.char;
  if (ch.hasPunch && ch.punch) self.punchCd = Math.max(self.punchCd || 0, ch.punch.cooldown);
  if (ch.elbow && ch.elbow.cooldown) self.elbowCd = Math.max(self.elbowCd || 0, ch.elbow.cooldown);
}

// He can't keep a move of his going: knocked out, grabbed, stunned, mid-special.
function jclSelfBroken(self) {
  return over || !self.alive || self.koOut || self.slam || self.grappled || self.grapple || self.sprawl || self.sprawled || subLocked(self) ||
    self.shocked || self.dazed || self.dizzy || self.igbb || self.beamPin || self.choked;
}

// ---------------------------------------------------------------- the abilities loop

// From the abilities loop, before the clinch knees: runs whichever of his
// moves he's in, or starts one that's due. True while one has him (he does
// nothing else).
function updateJonClinch(self, other, dt) {
  if (self.jcl) { self.jcl.frame = jclFrame; return runJonClinch(self, other, dt); }
  if (self.jspin) { self.jspin.frame = jclFrame; return runJonSpin(self, dt); }
  if (self.jobl) { self.jobl.frame = jclFrame; return runJonOblique(self, dt); }
  var c = jclCfg(self);
  if (!c || !isJon(self)) return false;
  var mc = c[self.jonMode] || {};
  // EVIL elbows: quicker than his elbow block's own cooldown.
  if (mc.elbowCooldown != null && self.elbowCd > mc.elbowCooldown) self.elbowCd = mc.elbowCooldown;
  if (self.jclT == null) self.jclT = jclRand(c.first);
  if (c.spinElbow && self.jspT == null) self.jspT = jclRand(c.spinElbow.first || c.spinElbow.every);
  if (c.oblique && self.joblT == null) self.joblT = jclRand(c.oblique.first || c.oblique.every);
  if (!started || over) return false;
  var rate = dt * (self.atkRate || 1);
  if (self.jclT > 0) self.jclT -= rate;
  if (self.jspT > 0) self.jspT -= rate;
  if (self.joblT > 0) self.joblT -= rate;
  var mg = c.oblique && c.oblique.mixGap;
  if (mg && self.lk) { // his calf kick's leg is still coming back (leg-kick.js): nothing else goes out on top of it
    self.joblT = Math.max(self.joblT, mg);
    if (self.char.hasKick) self.kickCd = Math.max(self.kickCd || 0, 0.05);
  }
  if (!kneeFree(self) || self.chAct || self.plum || self.fknee || !plumTarget(other) || other.jcl || other.choked) return false;
  var gap = kDist(self, other) - self.r - other.r;
  if (mc.on && self.jclT <= 0 && gap < c.range) { startJonClinch(self, other, c); return true; }
  if (mc.spinElbow && c.spinElbow && self.jspT <= 0 && gap < c.spinElbow.range) { startJonSpin(self, other, c, false); return true; }
  if (mc.oblique && c.oblique && self.joblT <= 0 && gap < c.oblique.range) { startJonOblique(self, other, c); return true; }
  return false;
}

// ---------------------------------------------------------------- the clinch

function startJonClinch(self, other, c) {
  if (uppercutCounter(other, self)) return; // an uppercut as he ties them up stuffs it (Gaethje, body-shots-uppercuts.js)
  clearActions(self);
  self.kneeAnim = null; self.elbowAnim = null;
  var evade = c.evade + (other.char.hasWeave ? (c.weaverEvade || 0) : 0);
  self.jcl = { phase: "reach", t: 0, vicId: other.id, frame: jclFrame, mode: self.jonMode, slip: Math.random() * 100 < evade,
    held: false, side: other.x >= self.x ? 1 : -1, count: 0, thrown: 0, landed: 0, strike: null, jolt: 0, joltKind: null, leg: 1 };
  floater(self.x, self.y - self.r - 30, "CLINCH", "crit");
  playClinchGrab(); // (knees.js)
}

function jclBroken(self, v) {
  return jclSelfBroken(self) || !v || !v.alive || v.koOut || v.slam || v.igbb || v.grapple || v.grappled;
}

function runJonClinch(self, other, dt) {
  var m = self.jcl, c = jclCfg(self), v = balls[m.vicId];
  if (!c || jclBroken(self, v)) { endJonClinch(self, "lost"); return false; }
  m.t += dt;
  m.jolt = Math.max(0, m.jolt - dt);
  if (m.phase === "reach") {
    // Steps in with both hands reaching for them.
    var d = kDist(self, v), gap = d - self.r - v.r;
    var sp = gap > 2 ? Math.min(340, gap * 18) : 0;
    self.vx = (v.x - self.x) / d * sp; self.vy = (v.y - self.y) / d * sp;
    m.side = v.x >= self.x ? 1 : -1;
    if (m.t < c.reach) return true;
    if (m.slip || gap > c.range + 10 || !plumTarget(v)) {
      floater(v.x, v.y - v.r - 8, "WHIFF", "dodge");
      if (m.slip && inOrdinaryMovement(v)) { v.vx = (v.x - self.x) / d * 300; v.vy = (v.y - self.y) / d * 300; } // they slip out of it
      if (m.slip) jclPunish(self, v);
      endJonClinch(self, "whiff");
      return false;
    }
    lockJonClinch(self, v, m);
    return true;
  }
  self.vx = 0; self.vy = 0; v.vx = 0; v.vy = 0;
  if (m.phase === "hold") return holdJonClinch(self, v, m, c, dt);
  return runJonTrip(self, v, m, c, dt);
}

// Locks on, over-under, side by side (the way it looks from cageside), with
// room on their side for them to go over.
function lockJonClinch(self, v, m) {
  clearActions(v);
  v.koPunch = null; v.elbowAnim = null; v.kneeAnim = null;
  if (v.cmb && typeof endCombo === "function") endCombo(v, false);
  v.choked = true; // held: they can't do anything until he lets go (like the clinch knees)
  m.held = true; m.phase = "hold"; m.t = 0;
  var c = jclCfg(self);
  m.count = Math.max(1, Math.round(jclRand(c.strikes)));
  m.next = 0.12;
  // Where the pair stands: clear of the cage, with room on their side for
  // where they land if he trips them.
  var half = (self.r + v.r) * JCL_GAP / 2, fall = v.r * 0.6;
  var lo = m.side > 0 ? self.r + half : v.r + half + fall, hi = m.side > 0 ? W - v.r - half - fall : W - self.r - half;
  m.ax = jclClamp((self.x + v.x) / 2, lo, hi);
  m.ay = jclClamp((self.y + v.y) / 2, Math.max(self.r, v.r) + 4, H - Math.max(self.r, v.r) - v.r * 0.35);
  placeJonClinch(self, v, m);
  crowdReact(0.3);
  playPunch(8);
}

function placeJonClinch(self, v, m) {
  var half = (self.r + v.r) * JCL_GAP / 2;
  self.x = m.ax - m.side * half; self.y = m.ay;
  v.x = m.ax + m.side * half; v.y = m.ay;
}

// Held: a knee or an elbow every `gap` seconds.
function holdJonClinch(self, v, m, c, dt) {
  placeJonClinch(self, v, m);
  var s = m.strike;
  if (s) {
    s.t += dt;
    if (!s.hit && s.t >= s.dur * s.at) {
      s.hit = true;
      landJonClinchStrike(self, v, m, c, s);
      if (!self.jcl) return false;
    }
    if (s.t >= s.dur) {
      m.strike = null; m.next = Math.max(0.04, c.gap - JCL_STRIKE);
      if (m.thrown >= m.count) { finishJonClinch(self, v, m, c); return jonClinchBusy(self); }
      // They fight hands and break free (a Grappler knows the clinch).
      var esc = c.escape + (v.char.hasGrapple ? (c.grapplerEscape || 0) : 0);
      if (Math.random() * 100 < esc) { endJonClinch(self, "escape"); return false; }
    }
    return true;
  }
  m.next -= dt;
  if (m.next <= 0) {
    var mc = c[m.mode] || {}, knee = Math.random() * 100 < (mc.knees != null ? mc.knees : 50);
    if (knee) m.leg = -m.leg;
    m.strike = { kind: knee ? "knee" : "elbow", t: 0, dur: JCL_STRIKE, at: knee ? KNEE_HIT : ELBOW_HIT, hit: false, crit: false, leg: m.leg };
    m.thrown++;
    if (knee) playKneeSwish(); else playElbowSwish(false);
  }
  return true;
}

// A clinch knee or elbow landing. Held, so it's a "finisher" hit: nobody
// slips or blocks it.
function landJonClinchStrike(self, v, m, c, s) {
  var ux = m.side, uy = 0, crit, dealt;
  if (s.kind === "knee") {
    var kn = jclKnee(c);
    crit = kn.critChance > 0 && Math.random() * 100 < kn.critChance;
    dealt = hurt(v, kn.damage * (crit ? kn.critMult : 1), "finisher", self.id);
    if (dealt > 0) {
      kneeSpark(self, v, ux, uy, crit);
      playKneeHit(dealt, crit);
      if (crit) floater(v.x, v.y - v.r - 32, "CRIT KNEE!", "crit");
    }
  } else {
    var el = jclElbow(self.char, c.elbow);
    crit = el.critChance > 0 && Math.random() * 100 < el.critChance;
    dealt = hurt(v, el.damage * (crit ? el.critMult : 1), "finisher", self.id);
    if (dealt > 0) {
      elbowSpark(self, v, ux, uy, crit, false);
      playElbowHit(dealt, crit, false);
      if (crit) {
        floater(v.x, v.y - v.r - 30, "CRIT!", "crit");
        if (el.cut && Math.random() * 100 < el.cut.chance) openCut(v, Math.atan2(-uy, -ux), el.cut, self.id, true); // (no "CUT!" on top of "CRIT!")
        jclCall("bigElbow", self, v);
      }
    }
  }
  s.crit = crit;
  m.jolt = JCL_JOLT; m.joltKind = s.kind;
  if (dealt > 0) {
    m.landed++;
    if (!reduceMotion) shake = Math.max(shake, crit ? 12 : 7);
    if (crit) hitStop = Math.max(hitStop, 0.06);
  }
  checkEnd();
  if (!v.alive || v.koOut) endJonClinch(self, "done");
}

// The strikes are done: the guillotine (GOAT, on someone hurt), the trip, or
// he shoves them off (and maybe spins into an elbow on the break).
function finishJonClinch(self, v, m, c) {
  var mc = c[m.mode] || {}, gc = c.guillotine, low = jclLow(v, gc);
  if (low > 0 && canGuillotine(self) && Math.random() * 100 < (gc.clinch || 0) * low) { jonClinchGuillotine(self, v, gc); return; } // (canGuillotine: GOAT mode only)
  if (c.trip && mc.trip && Math.random() * 100 < mc.trip) { startJonTrip(self, v, m, c); return; }
  endJonClinch(self, "done");
}

// Lets go. how: "done" (the last strike shoves them off), "escape" (they
// broke free), "whiff" (the reach missed), "stuffed" (they kept their feet
// on the trip), "tripped" (they get back up after it), "sub" (straight into
// the guillotine), "lost" (something else took over).
function endJonClinch(self, how) {
  var m = self.jcl;
  if (!m) return;
  self.jcl = null;
  var v = balls[m.vicId], c = jclCfg(self) || {};
  // (unless something else of his has them now: a suplex, a guillotine)
  var kept = v && ((self.suplex && self.suplex.vicId === v.id) || (self.guillo && self.guillo.atkId === v.id) || self.rnc || self.armbar);
  if (v && m.held && !kept) v.choked = false;
  self.jclT = jclRand(c.every || [4, 7]);
  jclSpent(self);
  if (!m.held || how === "sub" || how === "lost" || !v) return;
  var s = m.side;
  if (how === "tripped") {
    // They scramble back up and away; he gets up off them.
    if (self.char.grapple) self.grappleCd = Math.max(self.grappleCd || 0, self.char.grapple.cooldown);
    if (v.alive && !v.koOut) { v.vx = s * 240; v.vy = -140; }
    if (self.alive) { self.vx = -s * 120; self.vy = -60; }
    return;
  }
  if (!v.alive || v.koOut) return;
  var esc = how === "escape" || how === "stuffed", kb = esc ? 300 : (c.knockback || 360);
  // On the break he might let go soft and spin into an elbow instead.
  var sc = c.spinElbow, spin = how === "done" && sc && (c[m.mode] || {}).spinElbow && self.alive && plumTarget(v) && Math.random() * 100 < (sc.afterClinch || 0);
  if (spin) kb = sc.breakShove != null ? sc.breakShove : 80;
  v.vx = s * kb; v.vy = 0;
  if (self.alive) { self.vx = spin ? 0 : -s * (esc ? 260 : 160); self.vy = 0; }
  if (how === "escape") floater(v.x, v.y - v.r - 30, "BROKE FREE!", "dodge");
  if (esc) jclPunish(self, v);
  // A clinch full of strikes that all landed counts as a combination (combos.js).
  if (how === "done" && m.thrown >= 2 && m.landed === m.thrown && typeof comboCounter === "function") comboCounter(self, m.landed, m.thrown);
  if (spin) startJonSpin(self, v, c, true);
}

// They got out of it (slipped the reach, broke free, kept their feet on the
// trip): he's left open for a moment, and they get the first shot back.
function jclPunish(self, v) {
  var open = (jclCfg(self) || {}).open || 0;
  if (!open) return;
  if (self.char.hasPunch) self.punchCd = Math.max(self.punchCd || 0, open);
  if (self.char.hasKick) self.kickCd = Math.max(self.kickCd || 0, open);
  if (v.char.hasPunch) v.punchCd = 0;
}

// ---------------------------------------------------------------- the inside trip

function startJonTrip(self, v, m, c) {
  var tc = c.trip;
  m.phase = "hook"; m.t = 0; m.strike = null;
  var def = (tc.defend || 0) + (v.char.hasGrapple ? (tc.grapplerDefend || 0) : 0) + (v.char.tdd && v.char.tdd.sprawlChance ? v.char.tdd.sprawlChance * (tc.tddMult || 0) : 0);
  m.stuff = Math.random() * 100 < def;
  playJonTripHook();
}

function runJonTrip(self, v, m, c, dt) {
  var tc = c.trip;
  if (m.phase === "hook") {
    // His leg hooks inside theirs and he drives into them: the tell.
    placeJonClinch(self, v, m);
    if (m.t < tc.tell) return true;
    if (m.stuff) {
      floater((self.x + v.x) / 2, Math.min(self.y, v.y) - v.r - 30, "STUFFED", "dodge");
      endJonClinch(self, "stuffed");
      return false;
    }
    m.phase = "fall"; m.t = 0;
    m.fx = v.x; m.fy = v.y; m.jx = self.x; m.jy = self.y;
    playWhoosh();
    return true;
  }
  if (m.phase === "fall") {
    // Over they go, backwards, faster and faster into the mat, and he goes
    // down with them.
    var k = Math.min(1, m.t / tc.fall), e = k * k;
    v.x = m.fx + m.side * v.r * 0.6 * e; v.y = m.fy + v.r * 0.32 * e;
    self.x = m.jx + m.side * self.r * 0.5 * e; self.y = m.jy + self.r * 0.12 * e;
    if (k < 1) return true;
    landJonTrip(self, v, m, c);
    return !!self.jcl;
  }
  // On the mat, him on top of them, then they get up.
  if (m.t >= tc.down) { endJonClinch(self, "tripped"); return false; }
  return true;
}

// Flat on their back: the damage, the dust, the thud.
function landJonTrip(self, v, m, c) {
  var tc = c.trip;
  m.phase = "down"; m.t = 0;
  var x = v.x, y = v.y + v.r * 0.7;
  v.squash = { t: 0.26, max: 0.26, nx: 0, ny: -1 };
  impacts.push({ x: x, y: y, nx: 0, ny: -1, life: 0.5, max: 0.5, color: self.char.color });
  impacts.push({ x: x, y: y, nx: 0, ny: -1, life: 0.6, max: 0.6, color: theme.hit });
  tossDust(x, y, 12, 1.1); // the takedown throw's dust burst (toss.js)
  tossFx.push({ kind: "ring", t: 0, dur: 0.45, x: x, y: y });
  for (var i = 0; i < 14 && !reduceMotion; i++) {
    var a = (i % 2 ? 0 : Math.PI) + (Math.random() - 0.5) * 0.9, sp = 120 + Math.random() * 200;
    particles.push({ x: x, y: y, vx: Math.cos(a) * sp, vy: -Math.abs(Math.sin(a)) * sp * 0.5 - 20, life: 0.35 + Math.random() * 0.3, max: 0.65, size: 2.5 + Math.random() * 3, color: i % 3 ? "#cfc4ae" : "#ffffff" });
  }
  if (!reduceMotion) shake = Math.max(shake, 22);
  hitStop = Math.max(hitStop, 0.09);
  playJonTripThud();
  crowdReact(0.6);
  floater(x, v.y - v.r - 40, "INSIDE TRIP", "crit");
  var dealt = hurt(v, tc.damage, "grapple", self.id); // (a takedown in the jumbotron stats)
  if (dealt > 0) jclCall("takedown", self, v);
  checkEnd();
  if (!v.alive || v.koOut) endJonClinch(self, "lost");
}

// ---------------------------------------------------------------- the guillotine

// From attemptGrab, just before the normal guillotine roll: GOAT Jon catches
// their shot in a guillotine up to `bonus`% more often the more hurt they
// are. True if he caught it.
function tryJonGuillotine(attacker, target) {
  var c = jclCfg(target);
  if (!c || !isJon(target) || target.jonMode !== "goat" || !c.guillotine || !canGuillotine(target)) return false;
  if (Math.random() * 100 >= (c.guillotine.bonus || 0) * jclLow(attacker, c.guillotine)) return false;
  beginGuillotine(target, attacker); // (bjj.js)
  return true;
}

// Out of the clinch, he snaps their head down into a guillotine. It ends by
// `outcomes`, swapped in on his own copy of his character until it's over.
function jonClinchGuillotine(self, v, gc) {
  endJonClinch(self, "sub");
  if (gc.outcomes && self.char.guillotine) {
    if (!self.jclGuOut) self.jclGuOut = self.char.guillotine.outcomes;
    self.char.guillotine.outcomes = gc.outcomes;
  }
  beginGuillotine(self, v); // (bjj.js)
}

// ---------------------------------------------------------------- the spinning elbow

// Turns his back on them (the tell). `brk`: on the break from the clinch.
function startJonSpin(self, other, c, brk) {
  var sc = c.spinElbow;
  if (!brk) clearActions(self);
  self.jspin = { t: 0, dur: sc.turn || 0.22, dir: Math.random() < 0.5 ? -1 : 1, vicId: other.id, frame: jclFrame, brk: !!brk };
  self.jspT = jclRand(sc.every);
  playWhoosh();
}

// Spinning round toward them, stepping in, then the elbow comes round
// (elbows.js moves it along and lands it from here on).
function runJonSpin(self, dt) {
  var sp = self.jspin, c = jclCfg(self), v = balls[sp.vicId];
  if (!c || !c.spinElbow || jclSelfBroken(self) || !v || !v.alive || v.koOut) { self.jspin = null; return false; }
  var sc = c.spinElbow, d = kDist(self, v), gap = d - self.r - v.r;
  sp.t += dt;
  var spd = gap > 2 ? (sc.step || 380) : 0;
  self.vx = (v.x - self.x) / d * spd; self.vy = (v.y - self.y) / d * spd;
  if (sp.t < sp.dur) return true;
  self.jspin = null;
  var el = jclElbow(self.char, sc);
  throwElbow(self, v, {
    damage: el.damage, critChance: el.critChance, critMult: el.critMult, cut: el.cut,
    knockback: sc.knockback != null ? sc.knockback : 380, speed: sc.speed || 0.24, side: sp.dir, reach: (sc.range || 26) + 8, jonSpin: true,
    onLand: function (dealt) {
      if (!(dealt > 0)) return;
      floater(v.x, v.y - v.r - 56, "SPINNING ELBOW!", "note");
      var dd = kDist(self, v), ux = (v.x - self.x) / dd, uy = (v.y - self.y) / dd;
      impacts.push({ x: v.x - ux * v.r, y: v.y - uy * v.r, nx: -ux, ny: -uy, life: 0.35, max: 0.35, color: self.char.color });
      hitStop = Math.max(hitStop, 0.06);
      crowdReact(0.45);
      jclCall("spinElbow", self, v);
    }
  });
  jclSpent(self);
  return false;
}

// ---------------------------------------------------------------- the oblique kick

function startJonOblique(self, other, c) {
  clearActions(self);
  self.jobl = { t: 0, hit: false, landed: false, vicId: other.id, frame: jclFrame, side: other.x >= self.x ? 1 : -1 };
  self.joblT = jclRand(c.oblique.every);
  if (c.oblique.mixGap && self.lkT != null) self.lkT = Math.max(self.lkT, (c.oblique.dur || 0.42) + c.oblique.mixGap); // the calf kick waits (leg-kick.js)
  playJonObliqueLift();
}

// Planted, knee up (the tell), then the stomp into their knee.
function runJonOblique(self, dt) {
  var k = self.jobl, c = jclCfg(self), v = balls[k.vicId];
  if (!c || !c.oblique || jclSelfBroken(self) || !v) { self.jobl = null; return false; }
  var oc = c.oblique;
  k.t += dt;
  self.vx = 0; self.vy = 0;
  if (!k.hit && k.t >= (oc.chamber || 0.2)) {
    k.hit = true;
    landJonOblique(self, v, k, oc);
  }
  if (k.t >= (oc.dur || 0.42)) { self.jobl = null; jclSpent(self); return false; }
  return true;
}

function landJonOblique(self, v, k, oc) {
  if (!v.alive || v.koOut || specialBusy(v)) return;
  var d = kDist(self, v), gap = d - self.r - v.r;
  if (gap > (oc.range || 46) + 14) { floater(v.x, v.y - v.r - 8, "WHIFF", "dodge"); return; }
  var dealt = hurt(v, oc.damage, "kick", self.id);
  if (dealt > 0) {
    k.landed = true;
    floater(v.x, v.y - v.r - 30, "OBLIQUE KICK!", "note");
    if (oc.slow) legKickLimp(v, oc, self); // the limp, and its look: the same as every leg kick's (leg-kick.js)
    var ux = (v.x - self.x) / d, uy = (v.y - self.y) / d;
    if (!v.justDodged && oc.knockback && elbowKnockable(v)) { v.vx += ux * oc.knockback; v.vy += uy * oc.knockback; }
    playKick(); playJonObliqueCrack();
    if (!reduceMotion) shake = Math.max(shake, 9);
  }
  checkEnd();
}

// ---------------------------------------------------------------- every frame

// From tickJon (jon.js): lets go of a move the abilities loop didn't get to
// this frame (something else took him over), and puts his guillotine's own
// outcomes back once his clinch guillotine is over.
function tickJonClinch(dt) {
  balls.forEach(function (b) {
    if (b.jcl && b.jcl.frame !== jclFrame) endJonClinch(b, "lost");
    if (b.jspin && b.jspin.frame !== jclFrame) b.jspin = null;
    if (b.jobl && b.jobl.frame !== jclFrame) b.jobl = null;
    if (b.jclGuOut && !b.guillo) { b.char.guillotine.outcomes = b.jclGuOut; b.jclGuOut = null; }
  });
  jclFrame++;
}

// ---------------------------------------------------------------- drawing

function jclEase(k) { return 1 - Math.pow(1 - Math.max(0, Math.min(1, k)), 2); }

// From draw(), on each fighter's body: leaning into the clinch, rocked by
// the strikes, losing their balance on the trip, over and flat on the mat;
// spinning round for the elbow; leaning back off the oblique kick.
function applyJonClinchPose(b) {
  var rot = 0, lift = 0, m, s;
  if (b.jspin && b.alive) {
    var sp = b.jspin, ks = jclEase(sp.t / sp.dur);
    rot = -sp.dir * ks * Math.PI * 2;
  } else if (b.jobl && b.alive) {
    var oc = (jclCfg(b) || {}).oblique || {}, ko = b.jobl.t < (oc.chamber || 0.2) ? jclEase(b.jobl.t / (oc.chamber || 0.2)) : 1;
    rot = -b.jobl.side * 0.14 * ko; // leaning back off the kicking leg
  } else if (b.jcl && b.alive) {
    m = b.jcl; s = m.side;
    if (m.phase === "reach") rot = s * 0.12 * jclEase(m.t / 0.2);
    else if (m.phase === "hold") rot = s * 0.18 + (m.strike && m.strike.kind === "elbow" ? s * 0.1 * Math.sin(Math.min(1, m.strike.t / m.strike.dur) * Math.PI) : 0);
    else if (m.phase === "hook") rot = s * (0.18 + 0.14 * jclEase(m.t / 0.15));
    else if (m.phase === "fall") { var cfg = jclCfg(b), kf = Math.min(1, m.t / ((cfg && cfg.trip.fall) || 0.36)); rot = s * (0.32 + 0.4 * kf * kf); }
    else if (m.phase === "down") rot = s * 0.62;
  } else {
    var h = jonClinchHolder(b);
    if (!h) return;
    m = h.jcl; s = m.side;
    var jolt = m.jolt > 0 ? m.jolt / JCL_JOLT : 0;
    if (m.phase === "hold") {
      rot = -s * 0.14;
      if (m.joltKind === "knee") lift = jolt * b.r * 0.14; // jolted up by the knee
      else rot += s * 0.22 * jolt;                          // snapped back by the elbow
    } else if (m.phase === "hook") {
      var tc = jclCfg(h).trip, kh = Math.min(1, m.t / tc.tell);
      rot = -s * 0.14 + s * (0.1 * kh + (reduceMotion ? 0 : 0.08 * Math.sin(m.t * 34) * kh)); // losing their balance
    } else if (m.phase === "fall") {
      var kt = Math.min(1, m.t / jclCfg(h).trip.fall);
      rot = -s * 0.14 + s * 1.6 * kt * kt; // tipping over backwards
    } else if (m.phase === "down") {
      rot = s * 1.46;
    }
  }
  if (!rot && !lift) return;
  ctx.translate(b.x, b.y - lift); ctx.rotate(rot); ctx.translate(-b.x, -b.y);
}

// From draw(), over both fighters: his arms locked round them over-under, a
// knee or an elbow coming in, his leg hooking theirs and the arrow showing
// which way they'll fall; the swirl of the spin; the oblique kick's leg.
function drawJonClinch() {
  balls.forEach(function (b) {
    if (!b.alive) return;
    if (b.jspin) drawJclSpin(b);
    if (b.jobl) drawJclOblique(b);
    var m = b.jcl, v = m && balls[m.vicId];
    if (!m || !v) return;
    ctx.save();
    var s = m.side, ang = s > 0 ? 0 : Math.PI, r = b.r;
    if (m.phase === "reach") drawJclArms(b, v, s, jclEase(m.t / ((jclCfg(b) || {}).reach || 0.28)), true, true);
    else if (m.phase === "hold") {
      var st = m.strike, p = st ? Math.min(1, st.t / st.dur) : 0;
      if (st && st.kind === "knee") {
        var reach = kneeReachTo(b, v, 30);
        drawKneeArc(b, ang, st.leg, p, reach);
        drawKneeLeg(b, kneePose(b, ang, st.leg, p, reach), st.hit ? Math.max(0, 1 - (st.t - st.dur * KNEE_HIT) / 0.12) : 0);
        drawJclArms(b, v, s, 1, true, true);
      } else if (st) {
        // The top arm lets go to throw the elbow; the underhook stays in.
        drawJclArms(b, v, s, 1, false, true);
        drawElbowTrail(b, ang, -s, p, false);
        drawElbowArm(b, ang, -s, p, false, st.hit && st.crit ? Math.max(0, 1 - (st.t - st.dur * ELBOW_HIT) / 0.15) : 0);
      } else drawJclArms(b, v, s, 1, true, true);
    } else if (m.phase === "hook" || m.phase === "fall") {
      var tc = jclCfg(b).trip, kh = m.phase === "hook" ? jclEase(m.t / (tc.tell * 0.6)) : 1;
      drawJclTripLeg(b, v, s, kh);
      drawJclArms(b, v, s, 1, true, true);
      if (m.phase === "hook") drawJclTripArrow(v, s, Math.min(1, m.t / tc.tell));
    } else if (m.phase === "down") {
      // On top of them, both hands posted on their chest.
      var limb = r * 0.2;
      [[-0.2, -0.45], [0.25, 0.1]].forEach(function (o, i) {
        var sh = { x: b.x + s * r * 0.4, y: b.y - r * (0.35 - i * 0.45) };
        var hd = { x: v.x - s * v.r * 0.15 + s * o[0] * v.r, y: v.y + o[1] * v.r };
        strokeLimb(limb, armColor(b.char, i ? 1 : -1), function () { ctx.moveTo(sh.x, sh.y); ctx.lineTo(hd.x, hd.y); });
        drawGloveAt(hd.x, hd.y, r * 0.24, b.char, ang);
      });
    }
    ctx.restore();
  });
}

// Over-under: the top arm over their shoulder, the bottom one under their
// arm, both hands locked on their far side. `g` 0..1 how far in they've got
// (the reach), and which of the two arms to draw.
function drawJclArms(b, v, s, g, top, bottom) {
  var r = b.r, R = v.r, limb = r * 0.2;
  var arms = [];
  if (top) arms.push({ sh: { x: b.x + s * r * 0.3, y: b.y - r * 0.48 }, c: { x: v.x - s * R * 0.1, y: v.y - R * 1.02 }, hd: { x: v.x + s * R * 0.5, y: v.y - R * 0.34 }, side: -1 });
  if (bottom) arms.push({ sh: { x: b.x + s * r * 0.52, y: b.y + r * 0.08 }, c: { x: v.x - s * R * 0.1, y: v.y + R * 0.42 }, hd: { x: v.x + s * R * 0.56, y: v.y + R * 0.06 }, side: 1 });
  arms.forEach(function (a) {
    // From up in his guard out to the lock.
    var guard = { x: b.x + s * r * 0.9, y: a.sh.y + r * 0.1 };
    var hd = { x: guard.x + (a.hd.x - guard.x) * g, y: guard.y + (a.hd.y - guard.y) * g };
    var cp = { x: guard.x + (a.c.x - guard.x) * g, y: guard.y + (a.c.y - guard.y) * g };
    strokeLimb(limb, armColor(b.char, a.side), function () { ctx.moveTo(a.sh.x, a.sh.y); ctx.quadraticCurveTo(cp.x, cp.y, hd.x, hd.y); });
    drawGloveAt(hd.x, hd.y, r * 0.24, b.char, s > 0 ? 0 : Math.PI);
  });
}

// His near leg stepping in between theirs and hooking behind their heel.
function drawJclTripLeg(b, v, s, k) {
  var r = b.r, R = v.r;
  var hip = { x: b.x + s * r * 0.3, y: b.y + r * 0.5 };
  var from = { x: b.x + s * r * 0.55, y: b.y + r * 1.0 }, to = { x: v.x - s * R * 0.05, y: v.y + R * 0.98 };
  var foot = { x: from.x + (to.x - from.x) * k, y: from.y + (to.y - from.y) * k };
  var knee = { x: (hip.x + foot.x) / 2 + s * r * 0.15, y: Math.max(hip.y, foot.y) + r * 0.12 };
  drawBjjLeg(b.char, hip, knee, foot, r * 0.18, -s * 0.9, r * 0.22);
}

// The tell: a red arrow curving over them the way they're about to go.
function drawJclTripArrow(v, s, k) {
  var R = v.r, cx = v.x, cy = v.y + R * 0.9, rad = R * 1.5;
  var a0 = -Math.PI / 2 - s * 0.35, a1 = -Math.PI / 2 + s * (0.25 + 0.75 * jclEase(k));
  var pulse = reduceMotion ? 1 : 0.75 + 0.25 * Math.sin(k * 40);
  ctx.save();
  ctx.globalAlpha = 0.9 * pulse;
  ctx.lineCap = "round";
  ctx.strokeStyle = theme.wall; ctx.lineWidth = 9;
  ctx.beginPath(); ctx.arc(cx, cy, rad, a0, a1, s < 0); ctx.stroke();
  ctx.strokeStyle = "#e0202a"; ctx.lineWidth = 5;
  ctx.beginPath(); ctx.arc(cx, cy, rad, a0, a1, s < 0); ctx.stroke();
  // The arrowhead, pointing on round the arc.
  var tx = cx + Math.cos(a1) * rad, ty = cy + Math.sin(a1) * rad, ta = a1 + s * Math.PI / 2, hl = R * 0.38;
  ctx.fillStyle = "#e0202a"; ctx.strokeStyle = theme.wall; ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(tx + Math.cos(ta) * hl * 0.9, ty + Math.sin(ta) * hl * 0.9);
  ctx.lineTo(tx + Math.cos(ta + 2.4) * hl * 0.6, ty + Math.sin(ta + 2.4) * hl * 0.6);
  ctx.lineTo(tx + Math.cos(ta - 2.4) * hl * 0.6, ty + Math.sin(ta - 2.4) * hl * 0.6);
  ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.restore();
}

// The spin: a white swirl round him the way he's turning (the tell).
function drawJclSpin(b) {
  var sp = b.jspin, k = Math.min(1, sp.t / sp.dur), R = b.r * 1.22;
  var a0 = -Math.PI / 2, a1 = a0 - sp.dir * Math.PI * 1.6 * jclEase(k);
  ctx.save();
  ctx.lineCap = "round";
  ctx.globalAlpha = 0.85 * (1 - 0.4 * k);
  ctx.strokeStyle = theme.wall; ctx.lineWidth = 8;
  ctx.beginPath(); ctx.arc(b.x, b.y, R, a0, a1, sp.dir > 0); ctx.stroke();
  ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 4.5;
  ctx.beginPath(); ctx.arc(b.x, b.y, R, a0, a1, sp.dir > 0); ctx.stroke();
  ctx.restore();
}

// The oblique kick: his lead knee comes up with the foot turned out, then
// the sole stomps down into the front of their knee. A red ring on their
// knee while it's coming (the tell), a yellow star when it lands.
function drawJclOblique(b) {
  var k = b.jobl, o = balls[k.vicId], oc = (jclCfg(b) || {}).oblique || {};
  if (!o) return;
  var ch = oc.chamber || 0.2, dur = oc.dur || 0.42, r = b.r;
  var dx = o.x - b.x, dy = o.y - b.y, d = Math.sqrt(dx * dx + dy * dy) || 1, ux = dx / d, uy = dy / d;
  var hip = { x: b.x + ux * r * 0.3, y: b.y + r * 0.5 };
  var stand = { x: b.x + ux * r * 0.35, y: b.y + r * 1.0 };
  var cocked = { x: b.x + ux * r * 0.75, y: b.y + r * 0.45 };
  var target = { x: o.x - ux * o.r * 0.7, y: o.y + o.r * 0.6 };
  var foot, knee;
  if (k.t < ch) {
    var kc = jclEase(k.t / ch);
    foot = { x: stand.x + (cocked.x - stand.x) * kc, y: stand.y + (cocked.y - stand.y) * kc };
    knee = { x: hip.x + ux * r * (0.25 + 0.45 * kc), y: hip.y - r * 0.3 * kc + r * 0.15 };
  } else {
    // Out fast, then back down to the mat over the rest of it.
    var kx = k.t - ch, ke = kx < 0.08 ? jclEase(kx / 0.08) : Math.max(0, 1 - (kx - 0.08) / Math.max(0.05, dur - ch - 0.08));
    foot = { x: cocked.x + (target.x - cocked.x) * ke, y: cocked.y + (target.y - cocked.y) * ke };
    knee = { x: (hip.x + foot.x) / 2 + ux * r * 0.12 * (1 - ke), y: Math.min(hip.y, foot.y) - r * 0.1 * (1 - ke) };
  }
  ctx.save();
  if (!k.hit) {
    // The tell: their knee lit up red.
    var kt = Math.min(1, k.t / ch), pulse = reduceMotion ? 1 : 0.7 + 0.3 * Math.sin(k.t * 50);
    ctx.globalAlpha = 0.85 * pulse;
    ctx.strokeStyle = theme.wall; ctx.lineWidth = 6;
    ctx.beginPath(); ctx.arc(target.x, target.y, o.r * (0.42 - 0.12 * kt), 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = "#e0202a"; ctx.lineWidth = 3.5;
    ctx.beginPath(); ctx.arc(target.x, target.y, o.r * (0.42 - 0.12 * kt), 0, Math.PI * 2); ctx.stroke();
    ctx.globalAlpha = 1;
  }
  // The foot turned out sideways: the sole leads.
  drawBjjLeg(b.char, hip, knee, foot, r * 0.14, -k.side * 1.25, r * 0.24);
  if (k.hit && k.landed && k.t < ch + 0.14) {
    ctx.globalAlpha = Math.max(0, 1 - (k.t - ch) / 0.14);
    ctx.strokeStyle = "#ffe066"; ctx.lineWidth = 3.5; ctx.lineCap = "round";
    for (var i = 0; i < 7; i++) {
      var a = i / 7 * Math.PI * 2;
      ctx.beginPath(); ctx.moveTo(target.x + Math.cos(a) * 7, target.y + Math.sin(a) * 7); ctx.lineTo(target.x + Math.cos(a) * 19, target.y + Math.sin(a) * 19); ctx.stroke();
    }
  }
  ctx.restore();
}

// ---------------------------------------------------------------- sound

function jclAudio(fn) {
  try {
    var ac = getAudioCtx();
    if (!ac) return;
    if (ac.state === "suspended") ac.resume();
    fn(ac, ac.currentTime);
  } catch (e) { /* never let audio break the game */ }
}
// His foot scuffing in behind their heel.
function playJonTripHook() { jclAudio(function (ac, t) { caneBurst(ac, t, 650, 0.9, 0.32, 0.16); caneTone(ac, t, "triangle", 240, 150, 0.12, 0.1); }); }
// Their back hitting the mat: a slam with a deep thud under it.
function playJonTripThud() {
  playSlam(); playPunch(40);
  jclAudio(function (ac, t) { caneTone(ac, t, "sine", 120, 38, 0.85, 0.34); caneBurst(ac, t, 260, 0.8, 0.7, 0.22); });
}
// The knee coming up for the oblique kick: a short rising swish.
function playJonObliqueLift() { jclAudio(function (ac, t) { caneBurst(ac, t, 900, 1.2, 0.22, 0.12); caneTone(ac, t, "triangle", 180, 260, 0.08, 0.1); }); }
// The sole landing on the knee: a dry crack on top of the kick.
function playJonObliqueCrack() { jclAudio(function (ac, t) { caneBurst(ac, t + 0.04, 4200, 2.5, 0.5, 0.04); caneTone(ac, t + 0.04, "square", 300, 120, 0.12, 0.06); }); }

// ---------------------------------------------------------------- gallery

// The fighter card's move list (gallery.js).
function jonClinchGalleryMoves(ch, add) {
  var c = ch.jonClinch;
  if (!c) return;
  var on = function (key) {
    return ["goat", "evil"].filter(function (k) { return c[k] && c[k][key]; }).map(function (k) { return k === "goat" ? "GOAT" : "EVIL"; });
  };
  var modes = on("on");
  if (modes.length) {
    var kn = jclKnee(c), el = jclElbow(ch, c.elbow);
    add("🤼", "Clinch", "In " + modes.join(" and ") + " mode, every " + c.every[0] + "-" + c.every[1] + "s up close he ties them up over-under (\"CLINCH\"; they slip it " + c.evade + "% of the time) and throws " +
      c.strikes[0] + "-" + c.strikes[1] + " knees (" + kn.damage + ") and elbows (" + el.damage + ", " + el.critChance + "% crits for " + el.critMult + "x). They break free " + c.escape + "% of the time after each one.");
  }
  var t = c.trip, trips = ["goat", "evil"].filter(function (k) { return c[k] && c[k].on && c[k].trip; });
  if (t && trips.length) add("🦵", "Inside trip", trips.map(function (k) { return c[k].trip + "% of his " + (k === "goat" ? "GOAT" : "EVIL") + " clinches"; }).join(" and ") +
    " end in his inside trip: his leg hooks theirs (a red arrow shows where they're going; they keep their feet " + t.defend + "% of the time) and they go over backwards onto the mat for " + t.damage + ".");
  var sc = c.spinElbow, spins = on("spinElbow");
  if (sc && spins.length) add("🌀", "Spinning elbow", "In " + spins.join(" and ") + " mode, every " + sc.every[0] + "-" + sc.every[1] + "s up close he spins (the tell) into his elbow for " + sc.damage +
    " (" + jclElbow(ch, sc).critChance + "% crits) and a big shove, and " + sc.afterClinch + "% of the clinches he breaks end in one.");
  var oc = c.oblique, obls = on("oblique");
  if (oc && obls.length) add("🦶", "Oblique kick", "In " + obls.join(" and ") + " mode, every " + oc.every[0] + "-" + oc.every[1] + "s he lifts his knee (a red ring on theirs is the tell) and stomps into their lead knee for " + oc.damage +
    ": it shoves them back and they limp at " + Math.round(oc.slow * 100) + "% speed for " + oc.slowTime + "s.");
  var ev = c.evil;
  if (ev && ev.elbowCooldown != null) add("😈", "EVIL elbows", "In EVIL mode his elbows come every " + ev.elbowCooldown + "s, with oblique kicks and the eye poke.");
  var gu = c.guillotine;
  if (gu) add("🪢", "Guillotine on the hurt", "In GOAT mode, once they're under " + gu.lowHp + "% health his guillotine gets likelier the more hurt they are: up to " + gu.bonus + "% more on their shots, and up to " + gu.clinch + "% of his clinches end in one instead of the trip.");
}
