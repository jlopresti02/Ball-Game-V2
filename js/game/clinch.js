// The clinch (Christian, 2026-11-14): a clinch any fighter can switch on with
// a `clinch` block in its character file. Generalized from Jon Jones's clinch
// (jon-clinch.js): he ties them up at close range, works knees to the body and the
// head and elbows in there, they fight to break free, and it ends with a
// shove off ("BREAK!"), them breaking free ("BROKE FREE!"), or a parting
// elbow, knee or spinning back elbow as it breaks. Leave the block out and
// the fighter fights exactly as before (Joe's plum, `knee.clinch` in
// knees.js, is untouched; a fighter with this block should leave that out,
// so there's one clinch, not two).
//
//   "clinch": { "first": [4, 7], "every": [7, 11], "range": 16, "tie": "plum",
//     "reach": 0.26, "evade": 12, "weaverEvade": 10,
//     "strikes": [2, 4], "gap": 0.36, "mix": { "bodyKnee": 3, "headKnee": 2, "elbow": 2 },
//     "knee": { "damage": 7, "headDamage": 10, "critChance": 30, "critMult": 2 },
//     "elbow": { "damage": 6 }, "ramp": 0,
//     "escape": 15, "grapplerEscape": 10, "knockback": 380, "open": 0.6,
//     "parting": { "chance": 50, "mix": { "elbow": 1 }, "shove": 90, "reach": 40,
//                  "knockback": 380, "spinTime": 0.22, "spinMult": 1.8, "step": 320 },
//     "combos": true }
//
// Every key can be left out (defaults below: CLINCH_DEF, CLINCH_MIX,
// CLINCH_KNEE, CLINCH_PART).
//
// first, every  seconds until the first clinch, then between them (lighter
//             classes a little quicker, like punches, weight.js). When one's
//             due he ties up the next time they're within `range` (the gap
//             between the two balls) and he's free.
// tie         how he ties them up. "plum": the Thai plum, both hands clasped
//             on the back of their head pulling it down. "overUnder": Jon
//             Jones's body tie, one arm over their shoulder, one under their
//             arm.
// reach       seconds he reaches in for it ("CLINCH!", the tell). They slip
//             it `evade`% of the time (`weaverEvade`% more for a weaver), or
//             get away altogether ("WHIFF"), and he's left open.
// strikes     how many strikes while he holds them (a range, rolled each
//             time), one every `gap` seconds. Each one is picked from `mix`
//             (relative odds): "bodyKnee" (a knee into the middle, "BODY
//             KNEE!", they fold over it), "headKnee" (he pulls their head
//             down into a knee, "KNEE!", their head snaps up) and "elbow"
//             (one arm lets go and the elbow comes round into their head,
//             "ELBOW!"). Held, they can't slip or block any of it. The second
//             and later strikes that land in a row say so ("KNEE! x3").
// knee        the clinch knees: `damage` to the body, `headDamage` to the
//             head, `critChance`% crits for `critMult`x ("CRIT KNEE!").
// elbow       the clinch elbows: his own `elbow` block (crits, cuts), with
//             anything set here on top ("CRIT ELBOW!").
// ramp        each strike that lands in a row does `ramp`% more than the one
//             before (Anderson Silva's knees on Rich Franklin).
// escape      after each strike they break free `escape`% of the time
//             (`grapplerEscape`% more for a Grappler, who knows the clinch):
//             "BROKE FREE!", they push him off, he's left open for `open`
//             seconds (no punch or kick) and their next punch is ready.
// knockback   once every strike's thrown he shoves them off ("BREAK!").
// parting     instead of the plain shove, `chance`% of the time he lets go
//             with a little shove (`shove`) and throws a parting shot as it
//             breaks, picked from `mix`: "elbow" ("PARTING ELBOW!", his
//             elbow), "knee" ("PARTING KNEE!", his knee) or "spinElbow" (he
//             spins for `spinTime` seconds, stepping in at `step`, the tell,
//             then a spinning back elbow for `spinMult` times his elbow,
//             "SPINNING BACK ELBOW!"). Each reaches `reach` further, lands or
//             misses on its own (they can slip or block it) and shoves them
//             off (`knockback`).
// combos      true (the default): the clinch step in his combinations
//             ("punch-clinch", "double-collar", combos.js) ties up with this
//             clinch instead of the plum, and the combination's count goes on
//             through the strikes.
//
// Each clinch takes the place of his next punch, elbow and knee, so it adds
// variety more than damage. The API, for any fighter's own moves:
// startClinch(self, other, cmb) ties up now (false if they can't be grabbed),
// clinchBusy(b), clinchHolder(b) (who's got b tied up), clinchCfg(b).
//
// Commentary calls (commentary-calls.js, fired only if it's loaded): "elbow"
// (the signal: a crit is a big elbow, two close together are "elbows") on
// every clinch elbow that lands, "spinElbow" when the spinning back elbow on
// the break lands.
"use strict";

var CLINCH_DEF = { first: [4, 7], every: [7, 11], range: 16, tie: "plum", reach: 0.26, evade: 12, weaverEvade: 10,
  strikes: [2, 4], gap: 0.36, ramp: 0, escape: 15, grapplerEscape: 10, knockback: 380, open: 0.6, combos: true };
var CLINCH_MIX = { bodyKnee: 3, headKnee: 2, elbow: 2 };
var CLINCH_KNEE = { damage: 7, headDamage: 10, critChance: 30, critMult: 2 };
var CLINCH_PART = { chance: 0, mix: { elbow: 1 }, shove: 90, reach: 40, knockback: 380, spinTime: 0.22, spinMult: 1.8, step: 320 };
var CL_STRIKE = 0.28;  // one knee or elbow in the clinch
var CL_GAP = 0.86;     // how close the pair's held (1 = just touching)
var CL_JOLT = 0.14;    // how long a strike rocks them
var CL_LEAN = 0.42;    // how far the plum pulls their head down (radians)
var clFrame = 0;       // bumped once a frame (tickClinch): a clinch the abilities loop didn't reach is let go

function clinchCfg(b) { return b && b.char && b.char.clinch; }
function clMerge(def, c) {
  var o = {}, k;
  for (k in def) o[k] = def[k];
  if (c) for (k in c) if (c[k] != null) o[k] = c[k];
  return o;
}
// His numbers, worked out once a fight (makeBall gives every fight new balls).
function clN(b) { return b.clN || (b.clN = clMerge(CLINCH_DEF, clinchCfg(b))); }
function clKnee(n) { return clMerge(CLINCH_KNEE, n.knee); }
function clElbow(ch, n) {
  var e = clMerge({ damage: 6, critChance: ELBOW_CRIT, critMult: 2 }, ch.elbow);
  return clMerge(e, n.elbow);
}
function clPart(n) { return clMerge(CLINCH_PART, n.parting); }
function clRand(r) { return r[0] + Math.random() * (r[1] - r[0]); }
function clClamp(x, lo, hi) { return Math.max(lo, Math.min(hi, x)); }
function clEase(k) { return 1 - Math.pow(1 - Math.max(0, Math.min(1, k)), 2); }
// One of `mix`'s keys by its odds.
function clPick(mix) {
  var keys = Object.keys(mix || {}).filter(function (k) { return mix[k] > 0; }), tot = 0, i;
  if (!keys.length) return null;
  for (i = 0; i < keys.length; i++) tot += +mix[keys[i]];
  var x = Math.random() * tot;
  for (i = 0; i < keys.length; i++) { x -= mix[keys[i]]; if (x <= 0) return keys[i]; }
  return keys[keys.length - 1];
}

// In the clinch or spinning into the elbow on the break: the speed regulator
// leaves him alone (physics.js), and he isn't free for anything else.
function clinchBusy(b) { return !!(b && (b.clin || b.clSpin)); }
// His hands are on them (drawClinchOver draws them; drawHands skips them).
function clinchHandsBusy(b) { return !!(b && b.clin && b.alive); }
// Who's got this fighter tied up (null if nobody, or he's still reaching).
function clinchHolder(b) {
  var o = b && balls[1 - b.id];
  return o && o.clin && o.clin.held && o.clin.vicId === b.id ? o : null;
}
// The combinations' clinch step ties up with this clinch (combos.js).
function clinchFromCombos(b) { return !!clinchCfg(b) && clN(b).combos !== false; }
function clinchRange(b) { return clN(b).range; }
// A commentary call, only if the commentary calls are loaded.
function clCall(kind, self, other, opts) {
  if (typeof commentaryCall === "function") commentaryCall(kind, self, other, opts);
}

// A call-out for the clinch, over their head where the action is. Strikes
// come quicker than call-outs rise, so this clinch's earlier ones that are
// still up move up out of its way: never one on top of another.
function clFloat(m, x, y, text, kind) {
  floater(x, y, text, kind);
  var f = floaters[floaters.length - 1], below = f;
  m.fls = (m.fls || []).filter(function (o) { return o.life > 0; });
  for (var i = m.fls.length - 1; i >= 0; i--) {
    if (m.fls[i].y > below.y - 28) m.fls[i].y = below.y - 28;
    below = m.fls[i];
  }
  m.fls.push(f);
}

// He can't keep the clinch going: knocked out, grabbed, stunned, mid-special.
function clSelfBroken(self) {
  return over || !self.alive || self.koOut || self.slam || self.grappled || self.grapple || self.sprawl || self.sprawled || subLocked(self) ||
    self.shocked || self.dazed || self.dizzy || self.igbb || self.beamPin || self.choked;
}
function clBroken(self, v) {
  return clSelfBroken(self) || !v || !v.alive || v.koOut || v.slam || v.igbb || v.grapple || v.grappled;
}

// The clinch takes the place of his next punch, elbow and knee.
function clSpent(self) {
  var ch = self.char;
  if (ch.hasPunch && ch.punch) self.punchCd = Math.max(self.punchCd || 0, ch.punch.cooldown);
  if (ch.elbow && ch.elbow.cooldown) self.elbowCd = Math.max(self.elbowCd || 0, ch.elbow.cooldown);
  if (ch.knee && ch.knee.cooldown) self.kneeCd = Math.max(self.kneeCd || 0, ch.knee.cooldown);
}

// They got out of it (slipped the tie-up or broke free): he's left open for a
// moment, and they get the first shot back.
function clPunish(self, v, n) {
  if (!n.open) return;
  if (self.char.hasPunch) self.punchCd = Math.max(self.punchCd || 0, n.open);
  if (self.char.hasKick) self.kickCd = Math.max(self.kickCd || 0, n.open);
  if (v.char.hasPunch) v.punchCd = 0;
}

// ---------------------------------------------------------------- the abilities loop

// From the abilities loop, before the clinch knees: runs the clinch (or the
// spin on the break), or ties up when one's due. True while it has him.
function updateClinch(self, other, dt) {
  if (self.clin) { self.clin.frame = clFrame; return runClinch(self, dt); }
  if (self.clSpin) { self.clSpin.frame = clFrame; return runClinchSpin(self, dt); }
  if (!clinchCfg(self)) return false;
  var n = clN(self);
  if (self.clinT == null) self.clinT = clRand(n.first);
  if (!started || over) return false;
  if (self.clinT > 0) { self.clinT -= dt * (self.atkRate || 1); return false; }
  if (!kneeFree(self) || self.chAct || self.plum || self.fknee || self.jcl || specialBusy(self) || !plumTarget(other) || other.choked) return false;
  if (kDist(self, other) - self.r - other.r >= n.range) return false;
  return startClinch(self, other, null);
}

// Reaches in to tie them up. `cmb` is the combination that led into it (combos.js), if any.
function startClinch(self, other, cmb) {
  if (!plumTarget(other)) return false;
  var n = clN(self);
  clearActions(self);
  self.kneeAnim = null; self.elbowAnim = null;
  var evade = n.evade + (other.char.hasWeave ? n.weaverEvade : 0);
  self.clin = { phase: "reach", t: 0, vicId: other.id, frame: clFrame, cmb: cmb, slip: Math.random() * 100 < evade, held: false,
    side: other.x >= self.x ? 1 : -1, count: 0, thrown: 0, landed: 0, row: 0, strike: null, jolt: 0, joltKind: null, leg: 1, arm: -1, next: 0 };
  floater(self.x, self.y - self.r - 30, "CLINCH!", "crit");
  self.clin.fls = [floaters[floaters.length - 1]];
  playClinchGrab(); // (knees.js)
  return true;
}

function runClinch(self, dt) {
  var m = self.clin, n = clN(self), v = balls[m.vicId];
  if (clBroken(self, v)) { endClinch(self, "lost"); return false; }
  m.t += dt;
  m.jolt = Math.max(0, m.jolt - dt);
  if (m.phase === "reach") {
    // Steps in with both hands reaching for them.
    var d = kDist(self, v), gap = d - self.r - v.r;
    var sp = gap > 2 ? Math.min(340, gap * 18) : 0;
    self.vx = (v.x - self.x) / d * sp; self.vy = (v.y - self.y) / d * sp;
    m.side = v.x >= self.x ? 1 : -1;
    if (m.t < n.reach) return true;
    if (m.slip || gap > n.range + 10 || !plumTarget(v)) {
      floater(v.x, v.y - v.r - 8, "WHIFF", "dodge");
      if (m.slip && inOrdinaryMovement(v)) { v.vx = (v.x - self.x) / d * 300; v.vy = (v.y - self.y) / d * 300; } // they slip out of it
      if (m.slip) clPunish(self, v, n);
      endClinch(self, "whiff");
      return false;
    }
    lockClinch(self, v, m, n);
    return true;
  }
  self.vx = 0; self.vy = 0; v.vx = 0; v.vy = 0;
  return holdClinch(self, v, m, n, dt);
}

// Ties up: they're held side by side (the way it looks from cageside), clear of the cage.
function lockClinch(self, v, m, n) {
  clearActions(v);
  v.koPunch = null; v.elbowAnim = null; v.kneeAnim = null;
  if (v.cmb && typeof endCombo === "function") endCombo(v, false);
  v.choked = true; // held: they can't do anything until he lets go (like the plum)
  m.held = true; m.phase = "hold"; m.t = 0;
  m.count = Math.max(1, Math.round(clRand(n.strikes)));
  m.next = 0.1;
  var half = (self.r + v.r) * CL_GAP / 2, s = m.side;
  m.ax = clClamp((self.x + v.x) / 2, (s > 0 ? self.r : v.r) + half, W - (s > 0 ? v.r : self.r) - half);
  m.ay = clClamp((self.y + v.y) / 2, Math.max(self.r, v.r) + 4, H - Math.max(self.r, v.r) - 4);
  placeClinch(self, v, m);
  crowdReact(0.3);
  playPunch(8);
}

function placeClinch(self, v, m) {
  var half = (self.r + v.r) * CL_GAP / 2;
  self.x = m.ax - m.side * half; self.y = m.ay;
  v.x = m.ax + m.side * half; v.y = m.ay;
}

// Held: a knee or an elbow every `gap` seconds.
function holdClinch(self, v, m, n, dt) {
  placeClinch(self, v, m);
  var s = m.strike;
  if (s) {
    s.t += dt;
    if (!s.hit && s.t >= s.dur * s.at) {
      s.hit = true;
      landClinchStrike(self, v, m, n, s);
      if (!self.clin) return false;
    }
    if (s.t >= s.dur) {
      m.strike = null; m.next = Math.max(0.04, n.gap - CL_STRIKE);
      if (m.thrown >= m.count) { endClinch(self, "done"); return clinchBusy(self); }
      // They fight hands and break free (a Grappler knows the clinch).
      var esc = n.escape + (v.char.hasGrapple ? n.grapplerEscape : 0);
      if (Math.random() * 100 < esc) { endClinch(self, "escape"); return false; }
    }
    return true;
  }
  m.next -= dt;
  if (m.next <= 0) {
    var kind = clPick(n.mix || CLINCH_MIX) || "bodyKnee";
    if (kind === "elbow") m.arm = -m.arm; else m.leg = -m.leg;
    m.strike = { kind: kind, t: 0, dur: CL_STRIKE, at: kind === "elbow" ? ELBOW_HIT : KNEE_HIT, hit: false, crit: false, leg: m.leg, arm: m.arm };
    m.thrown++;
    if (kind === "elbow") playElbowSwish(false); else playKneeSwish();
  }
  return true;
}

// A knee or an elbow landing. Held, so it's a "finisher" hit: nobody slips or blocks it.
function landClinchStrike(self, v, m, n, s) {
  var sd = m.side, head = s.kind !== "bodyKnee";
  var ux = sd * (head ? 0.75 : 1), uy = head ? 0.66 : -0.15; // (where it lands: their head, or their middle)
  var more = 1 + (n.ramp || 0) / 100 * m.row, crit, dealt, name;
  if (s.kind === "elbow") {
    var el = clElbow(self.char, n);
    crit = el.critChance > 0 && Math.random() * 100 < el.critChance;
    dealt = hurt(v, el.damage * more * (crit ? el.critMult : 1), "finisher", self.id);
    if (dealt > 0) {
      elbowSpark(self, v, ux, uy, crit, false);
      playElbowHit(dealt, crit, false);
      if (crit && el.cut && Math.random() * 100 < el.cut.chance) openCut(v, Math.atan2(-uy, -ux), el.cut, self.id, true); // (no "CUT!" on top of it)
      clCall("elbow", self, v, { crit: crit });
    }
    name = crit ? "CRIT ELBOW!" : "ELBOW!";
  } else {
    var kn = clKnee(n);
    crit = kn.critChance > 0 && Math.random() * 100 < kn.critChance;
    dealt = hurt(v, (head ? kn.headDamage : kn.damage) * more * (crit ? kn.critMult : 1), "finisher", self.id);
    if (dealt > 0) {
      kneeSpark(self, v, ux, uy, crit);
      playKneeHit(dealt, crit);
    }
    name = crit ? "CRIT KNEE!" : (head ? "KNEE!" : "BODY KNEE!");
  }
  s.crit = crit;
  m.jolt = CL_JOLT; m.joltKind = s.kind;
  if (dealt > 0) {
    m.landed++; m.row++;
    clFloat(m, v.x, v.y - v.r - 30, name + (m.row >= 2 ? " x" + m.row : ""), crit ? "crit" : "note");
    if (!reduceMotion) shake = Math.max(shake, crit ? 12 : 7);
    if (crit) hitStop = Math.max(hitStop, 0.06);
  } else m.row = 0;
  checkEnd();
  if (!v.alive || v.koOut) endClinch(self, "done");
}

// Lets go. how: "done" (every strike thrown), "escape" (they broke free),
// "whiff" (the tie-up missed), "lost" (something else took over).
function endClinch(self, how) {
  var m = self.clin;
  if (!m) return;
  self.clin = null;
  var v = balls[m.vicId], n = clN(self);
  // (unless something else of his has them now)
  var kept = v && ((self.suplex && self.suplex.vicId === v.id) || (self.guillo && self.guillo.atkId === v.id) || self.rnc || self.armbar);
  if (v && m.held && !kept) v.choked = false;
  self.clinT = clRand(n.every);
  clSpent(self);
  // A combination into the clinch: every strike landed and every one in here too.
  if (m.cmb && how === "done" && typeof comboCounter === "function") comboCounter(self, m.cmb.hits + m.landed, m.cmb.n + m.thrown);
  if (!m.held || how === "lost" || !v || !v.alive || v.koOut) return;
  var s = m.side, esc = how === "escape", pc = clPart(n), part = null;
  if (!esc && pc.chance > 0 && self.alive && plumTarget(v) && Math.random() * 100 < pc.chance) part = clPick(pc.mix);
  var kb = esc ? 300 : (part ? pc.shove : n.knockback);
  v.vx = s * kb; v.vy = 0;
  if (self.alive) { self.vx = part ? 0 : -s * (esc ? 260 : 160); self.vy = 0; }
  if (esc) { clFloat(m, v.x, v.y - v.r - 30, "BROKE FREE!", "dodge"); clPunish(self, v, n); }
  else if (!part) clFloat(m, (self.x + v.x) / 2, Math.min(self.y, v.y) - Math.max(self.r, v.r) - 34, "BREAK!", "note");
  playWhoosh();
  if (part) clParting(self, v, pc, part, s, m);
}

// ---------------------------------------------------------------- the parting shot

// `m` is the clinch it came out of (its call-outs stack on).
function clParting(self, v, pc, kind, s, m) {
  var el = self.char.elbow || {};
  if (kind === "spinElbow") {
    // Turns his back on them first (the tell), then the elbow comes round.
    self.clSpin = { t: 0, dur: pc.spinTime, dir: s, vicId: v.id, frame: clFrame, pc: pc, m: m };
    return;
  }
  var said = function (text) { return function (dealt, crit) { if (dealt > 0) clFloat(m, v.x, v.y - v.r - 30, text, crit ? "crit" : "note"); }; };
  if (kind === "knee") {
    startKnee(self, v, { quiet: true, reach: kneeNum(self, "reach") + pc.reach, knockback: pc.knockback, onLand: said("PARTING KNEE!") });
    return;
  }
  throwElbow(self, v, { quietCrit: true, reach: (el.reach || 14) + pc.reach, knockback: Math.max(pc.knockback, el.knockback || 0), onLand: said("PARTING ELBOW!") });
}

// The spin on the break: he turns his back, stepping in, then the spinning back elbow.
function runClinchSpin(self, dt) {
  var sp = self.clSpin, v = balls[sp.vicId];
  if (clSelfBroken(self) || !v || !v.alive || v.koOut) { self.clSpin = null; return false; }
  sp.t += dt;
  var d = kDist(self, v), gap = d - self.r - v.r, spd = gap > 4 ? sp.pc.step : 0;
  self.vx = (v.x - self.x) / d * spd; self.vy = (v.y - self.y) / d * spd;
  if (sp.t < sp.dur) return true;
  self.clSpin = null;
  var el = self.char.elbow || {}, pc = sp.pc;
  throwElbow(self, v, {
    damage: Math.round((el.damage || 6) * pc.spinMult), knockback: Math.max(pc.knockback, el.knockback || 0), speed: 0.24, side: sp.dir,
    reach: (el.reach || 14) + pc.reach, quietCrit: true,
    onLand: function (dealt, crit) {
      if (dealt <= 0) return;
      clFloat(sp.m || {}, v.x, v.y - v.r - 30, "SPINNING BACK ELBOW!", crit ? "crit" : "note");
      clCall("spinElbow", self, v); // "Spinning elbow! Wow!"
      hitStop = Math.max(hitStop, 0.06);
      crowdReact(0.4);
    }
  });
  return false;
}

// ---------------------------------------------------------------- every frame

// From update(): lets go of a clinch (or a spin) the abilities loop didn't
// get to this frame (something else took him over).
function tickClinch(dt) {
  balls.forEach(function (b) {
    if (b.clin && b.clin.frame !== clFrame) endClinch(b, "lost");
    if (b.clSpin && b.clSpin.frame !== clFrame) b.clSpin = null;
  });
  clFrame++;
}

// ---------------------------------------------------------------- drawing

function clTie(b) { return clN(b).tie === "overUnder" ? "overUnder" : "plum"; }

// How whoever's held is leaning: pulled down into the plum (further for a
// head knee), folded by a body knee, the head snapped up by a head knee,
// snapped sideways by an elbow. {rot, lift, sx, sy} round their middle.
function clVictimPose(h, v) {
  var m = h.clin, s = m.side, plum = clTie(h) === "plum", st = m.strike;
  var j = m.jolt > 0 ? m.jolt / CL_JOLT : 0, deep = 0;
  if (st && st.kind === "headKnee" && !st.hit) deep = clEase(st.t / (st.dur * st.at));
  var o = { rot: -s * (plum ? CL_LEAN + 0.22 * deep : 0.14 + 0.1 * deep), lift: 0, sx: 1, sy: 1 };
  if (m.joltKind === "headKnee") { o.lift = j * v.r * 0.2; o.rot += s * 0.5 * j; }
  else if (m.joltKind === "bodyKnee") { o.sx = 1 + 0.08 * j; o.sy = 1 - 0.1 * j; o.lift = j * v.r * 0.06; }
  else if (m.joltKind === "elbow") o.rot += s * 0.32 * j;
  return o;
}

// From draw(), on each fighter's body: leaning into the clinch, rocked by
// each strike, spinning round for the elbow on the break.
function applyClinchPose(b) {
  var rot = 0, lift = 0, sx = 1, sy = 1, m, s;
  if (b.clSpin && b.alive) {
    rot = -b.clSpin.dir * clEase(b.clSpin.t / b.clSpin.dur) * Math.PI * 2;
  } else if (b.clin && b.alive) {
    m = b.clin; s = m.side;
    if (m.phase === "reach") rot = s * 0.12 * clEase(m.t / 0.2);
    else {
      var st = m.strike, k = st ? Math.sin(Math.min(1, st.t / st.dur) * Math.PI) : 0;
      rot = s * (clTie(b) === "plum" ? 0.22 : 0.18);
      if (st && st.kind === "elbow") rot += s * 0.12 * k;
      else if (st) rot -= s * 0.08 * k; // leaning back off the knee
    }
  } else {
    var h = clinchHolder(b);
    if (!h) return;
    var p = clVictimPose(h, b);
    rot = p.rot; lift = p.lift; sx = p.sx; sy = p.sy;
  }
  if (!rot && !lift && sx === 1 && sy === 1) return;
  ctx.translate(b.x, b.y - lift); ctx.rotate(rot); ctx.scale(sx, sy); ctx.translate(-b.x, -b.y);
}

// From draw(), over both fighters: his arms tied round them, each knee and
// elbow coming in, and the swirl of the spin on the break.
function drawClinchOver() {
  balls.forEach(function (b) {
    if (!b.alive) return;
    if (b.clSpin) drawClinchSwirl(b);
    var m = b.clin, v = m && balls[m.vicId];
    if (!m || !v || !v.alive) return;
    var s = m.side, ang = s > 0 ? 0 : Math.PI, plum = clTie(b) === "plum";
    var g = m.phase === "reach" ? clEase(m.t / clN(b).reach) : 1;
    var st = m.phase === "hold" ? m.strike : null, p = st ? Math.min(1, st.t / st.dur) : 0;
    ctx.save();
    // The arm throwing an elbow lets go; the other stays on.
    var elbow = st && st.kind === "elbow", topThrows = elbow && st.arm > 0;
    if (plum) clPlumArms(b, v, s, g, elbow ? (topThrows ? -s : s) : 0);
    else clOverUnderArms(b, v, s, g, !(elbow && topThrows), !(elbow && !topThrows));
    if (elbow) {
      var vp = m.held ? clVictimPose(b, v) : { lift: 0 };
      var eAng = Math.atan2(v.y - vp.lift - v.r * 0.45 - b.y, v.x - b.x), side = topThrows ? -s : s;
      drawElbowTrail(b, eAng, side, p, false);
      drawElbowArm(b, eAng, side, p, false, st.hit ? Math.max(0, 1 - (st.t - st.dur * ELBOW_HIT) / (st.crit ? 0.18 : 0.12)) : 0);
    } else if (st) {
      // The knee comes up in front of his arms, so it reads.
      var head = st.kind === "headKnee", reach = kneeReachTo(b, v, 30);
      clKneeArc(b, ang, st.leg, p, reach, head);
      drawKneeLeg(b, clKneePose(b, ang, st.leg, p, reach, head), st.hit ? Math.max(0, 1 - (st.t - st.dur * KNEE_HIT) / 0.12) : 0);
    }
    ctx.restore();
  });
}

// A knee in the clinch: into their middle, or up into their head.
function clKneePose(b, ang, leg, p, reach, head) {
  var pose = kneePose(b, ang, leg, p, reach), r = b.r, e = pose.e;
  if (head) { pose.knee.y -= r * 0.42 * e; pose.foot.y -= r * 0.24 * e; }
  else { pose.knee.y += r * 0.2 * e; pose.foot.y += r * 0.1 * e; }
  return pose;
}
// The swoosh behind the kneecap (drawKneeArc's, along this knee's path).
function clKneeArc(b, ang, leg, p, reach, head) {
  var h = KNEE_HIT;
  if (p < 0.12 || p > h + 0.25) return;
  var pts = [], off = kneeLimb(b) * 1.6;
  for (var i = 0; i <= 7; i++) {
    var ps = clKneePose(b, ang, leg, Math.max(0, Math.min(p, h) - 0.35 + i * 0.35 / 7), reach, head);
    var ox = ps.knee.x - ps.hip.x, oy = ps.knee.y - ps.hip.y, od = Math.sqrt(ox * ox + oy * oy) || 1;
    pts.push({ x: ps.knee.x + ox / od * off, y: ps.knee.y + oy / od * off });
  }
  var line = function () { ctx.beginPath(); pts.forEach(function (q, k) { if (k) ctx.lineTo(q.x, q.y); else ctx.moveTo(q.x, q.y); }); ctx.stroke(); };
  var a = Math.max(0, Math.min(1, p < h ? (p - 0.12) / 0.15 : 1 - (p - h) / 0.25));
  ctx.save();
  ctx.lineCap = "round"; ctx.lineJoin = "round";
  ctx.globalAlpha = 0.35 * a; ctx.strokeStyle = theme.wall; ctx.lineWidth = kneeLimb(b) * 0.7 + 4; line(); // (a dark edge so it shows on a light mat)
  ctx.globalAlpha = 0.85 * a; ctx.strokeStyle = "#ffffff"; ctx.lineWidth = kneeLimb(b) * 0.7; line();
  ctx.restore();
}

// The Thai plum: both arms up over their shoulders, hands clasped on the back
// of their head (pulled down). `g` 0..1 how far in he's got (the reach);
// `skip` the arm that's letting go to throw an elbow (0: neither).
function clPlumArms(b, v, s, g, skip) {
  var r = b.r, V = v.r, size = (b.char.punch && b.char.punch.size) || 13, limb = size * 0.62, ang = s > 0 ? 0 : Math.PI;
  var vp = b.clin && b.clin.held ? clVictimPose(b, v) : { rot: 0, lift: 0, sy: 1 };
  var head = { x: v.x + Math.sin(vp.rot) * V * 0.52 * vp.sy, y: v.y - vp.lift - Math.cos(vp.rot) * V * 0.52 * vp.sy };
  [-1, 1].forEach(function (k) {
    if (k === skip) return;
    var sh = { x: b.x + s * r * 0.3, y: b.y + s * k * r * 0.6 - r * 0.15 };
    var guard = { x: b.x + s * r * 0.8, y: b.y + s * k * r * 0.4 };
    var lock = { x: head.x - s * V * 0.05, y: head.y + s * k * V * 0.2 };
    var hd = { x: guard.x + (lock.x - guard.x) * g, y: guard.y + (lock.y - guard.y) * g };
    strokeLimb(limb, armColor(b.char, k), function () { ctx.moveTo(sh.x, sh.y); ctx.lineTo(hd.x, hd.y); });
    drawGloveAt(hd.x, hd.y, size * 0.72, b.char, ang);
  });
}

// Over-under (Jon Jones's tie, jon-clinch.js): the top arm over their
// shoulder, the bottom one under their arm, both hands locked on their far side.
function clOverUnderArms(b, v, s, g, top, bottom) {
  var r = b.r, R = v.r, limb = r * 0.2, arms = [];
  if (top) arms.push({ sh: { x: b.x + s * r * 0.3, y: b.y - r * 0.48 }, c: { x: v.x - s * R * 0.1, y: v.y - R * 1.02 }, hd: { x: v.x + s * R * 0.5, y: v.y - R * 0.34 }, side: -1 });
  if (bottom) arms.push({ sh: { x: b.x + s * r * 0.52, y: b.y + r * 0.08 }, c: { x: v.x - s * R * 0.1, y: v.y + R * 0.42 }, hd: { x: v.x + s * R * 0.56, y: v.y + R * 0.06 }, side: 1 });
  arms.forEach(function (a) {
    var guard = { x: b.x + s * r * 0.9, y: a.sh.y + r * 0.1 };
    var hd = { x: guard.x + (a.hd.x - guard.x) * g, y: guard.y + (a.hd.y - guard.y) * g };
    var cp = { x: guard.x + (a.c.x - guard.x) * g, y: guard.y + (a.c.y - guard.y) * g };
    strokeLimb(limb, armColor(b.char, a.side), function () { ctx.moveTo(a.sh.x, a.sh.y); ctx.quadraticCurveTo(cp.x, cp.y, hd.x, hd.y); });
    drawGloveAt(hd.x, hd.y, r * 0.24, b.char, s > 0 ? 0 : Math.PI);
  });
}

// The spin on the break: a gold swirl round him the way he's turning (the tell).
function drawClinchSwirl(b) {
  var sp = b.clSpin, k = Math.min(1, sp.t / sp.dur), R = b.r * 1.22;
  var a0 = -Math.PI / 2, a1 = a0 - sp.dir * Math.PI * 1.6 * clEase(k);
  ctx.save();
  ctx.lineCap = "round";
  ctx.globalAlpha = 0.9 * (1 - 0.4 * k);
  ctx.strokeStyle = theme.wall; ctx.lineWidth = 9;
  ctx.beginPath(); ctx.arc(b.x, b.y, R, a0, a1, sp.dir > 0); ctx.stroke();
  ctx.strokeStyle = "#ffd21f"; ctx.lineWidth = 5;
  ctx.beginPath(); ctx.arc(b.x, b.y, R, a0, a1, sp.dir > 0); ctx.stroke();
  ctx.restore();
}

// ---------------------------------------------------------------- gallery

// The fighter card's move list (gallery.js).
function clinchGalleryMoves(ch, add) {
  if (!ch.clinch) return;
  var n = clMerge(CLINCH_DEF, ch.clinch), mix = n.mix || CLINCH_MIX, kn = clKnee(n), el = clElbow(ch, n), parts = [];
  if (mix.bodyKnee > 0) parts.push("knees to the body (" + kn.damage + ")");
  if (mix.headKnee > 0) parts.push("knees to the head (" + kn.headDamage + ")");
  if (mix.elbow > 0) parts.push("elbows (" + el.damage + ", " + el.critChance + "% crits)");
  var tie = n.tie === "overUnder" ? "over-under" : "in the Thai plum";
  add("🤼", "Clinch", "Every " + n.every[0] + "-" + n.every[1] + "s up close he ties them up " + tie + " (\"CLINCH!\"; they slip it " + n.evade + "% of the time) and throws " +
    n.strikes[0] + "-" + n.strikes[1] + " strikes: " + parts.join(", ") + (kn.critChance > 0 ? "; " + kn.critChance + "% of the knees crit" : "") +
    (n.ramp ? "; each one in a row hits " + n.ramp + "% harder" : "") + ". They break free " + n.escape + "% of the time after each one.");
  var pc = clPart(n);
  if (pc.chance > 0) {
    var names = { elbow: "a parting elbow", knee: "a parting knee", spinElbow: "a spinning back elbow" };
    var list = Object.keys(pc.mix || {}).filter(function (k) { return pc.mix[k] > 0 && names[k]; }).map(function (k) { return names[k]; });
    if (list.length) add("💥", "On the break", pc.chance + "% of the time he lets go with " + list.join(" or ") + ".");
  }
}
