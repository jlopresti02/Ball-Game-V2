// Combinations (Christian, 2026-11-13): short strings of strikes any fighter
// can switch on with a `combos` block in its character file.
//
//   "combos": { "first": [3, 5], "every": [4, 6.5],
//               "list": { "jab-cross-elbow": 3, "elbow-elbow-knee": 2 } }
//
// first, every  seconds until his first combination, then between them
//             (lighter classes a little quicker, like punches, weight.js).
//             When one's due he throws it the next time he's close enough
//             for its first strike.
// list        which combinations he throws and how often (relative odds),
//             from COMBOS below. One he can't throw (a kick for a fighter who
//             doesn't kick) is left out.
//
// Every strike is the real thing, with his own numbers: jabs, crosses and
// kicks go through his normal punch and kick, a hook is his punch swung round
// (the CHAMA hook's swing, korush.js), elbows are throwElbow (elbows.js, his
// `elbow` block if he has one), knees are startKnee (knees.js, his `knee`
// block if he has one), and "plum" goes into the clinch knees (knees.js).
// He steps in behind them (the elbows and knees reach CB_STEP_IN further, and
// only the last strike shoves them off). Each one lands or misses on its own
// and can be slipped, blocked or checked like any other, and if they get away
// before a punch or a kick, the rest is off. Land every strike and it's an
// "N-HIT COMBO!" over his head. A combination takes the place of his next
// punch (his punch cooldown starts over when it ends), so it doesn't pile
// extra damage on top of his normal rhythm. The spinning back elbow ("SPINNING BACK
// ELBOW!") turns his back first and hits CB_SPIN_MULT times as hard as his elbow.
// The combination runs on b.cmb.
"use strict";

var COMBOS = {
  "jab-cross-elbow": ["jab", "cross", "elbow"],
  "cross-hook-knee": ["cross", "hook", "knee"],
  "elbow-elbow-knee": ["elbow", "elbow", "knee"],
  "jab-cross-hook": ["jab", "cross", "hook"],
  "jab-cross-knee": ["jab", "cross", "knee"],
  "one-two-kick": ["jab", "cross", "kick"],
  "jab-spin-elbow": ["jab", "spin"],          // into a spinning back elbow
  "punch-clinch": ["jab", "cross", "plum"],   // a one-two into the clinch knees
  "double-collar": ["plum"]                   // straight into the double-collar tie and the knees
};
var CB_NAMES = { jab: "jab", cross: "cross", hook: "hook", elbow: "elbow", knee: "knee", kick: "kick", spin: "spinning back elbow", plum: "the clinch knees" };
var CB_GAP = 0.04;       // breath between two strikes
var CB_WAIT = 0.35;      // how long he steps in after them before the next strike goes anyway (or, if they're gone, the rest is off)
var CB_GONE = 20;        // further out than its reach by this much, they're gone
var CB_SPIN = 0.2;       // turning his back for the spinning elbow
var CB_SPIN_MULT = 1.8;  // how much harder the spinning elbow hits than his elbow
var CB_STEP_IN = 12;     // a combination's elbows and knees reach this much further (he steps in behind them)
var CB_LUNGE = 1.15;     // and he steps in a little faster than he rolls
var cmbFrame = 0;        // bumped once a frame (tickCombos): a combination the abilities loop didn't reach is over

function cbRand(r) { return r[0] + Math.random() * (r[1] - r[0]); }
function cbDist(a, b) { var dx = b.x - a.x, dy = b.y - a.y; return Math.sqrt(dx * dx + dy * dy) || 1; }
function cbKnockable(o) { return o.alive && !o.grappled && !o.grapple && !o.slam && !subLocked(o) && !o.igbb && !o.koOut; }

// Can this fighter throw this strike at all?
function cbCan(ch, step) {
  if (step === "jab" || step === "cross" || step === "hook") return !!(ch.hasPunch && ch.punch);
  if (step === "kick") return !!(ch.hasKick && ch.kick);
  return !!CB_NAMES[step];
}
// How close he has to be to throw it (the gap between the two balls).
function cbReach(self, step) {
  var ch = self.char;
  if (step === "jab" || step === "cross" || step === "hook") return ch.punch.reach;
  if (step === "kick") return ch.kick.reach;
  if (step === "elbow" || step === "spin") return ((ch.elbow && ch.elbow.reach) || 14) + CB_STEP_IN;
  if (step === "knee") return kneeNum(self, "reach") + CB_STEP_IN;
  if (step === "plum") return plumNums(self).range;
  return 20;
}

function cbCanAll(self, id) { return !!COMBOS[id] && COMBOS[id].every(function (s) { return cbCan(self.char, s); }); }
function pickCombo(self, cfg) {
  var list = [], tot = 0;
  Object.keys(cfg.list || {}).forEach(function (id) {
    var w = +cfg.list[id];
    if (!(w > 0) || !cbCanAll(self, id)) return;
    list.push({ id: id, w: w }); tot += w;
  });
  if (!list.length) return null;
  var x = Math.random() * tot;
  for (var i = 0; i < list.length; i++) { x -= list[i].w; if (x <= 0) return list[i].id; }
  return list[list.length - 1].id;
}

// Free to start one: rolling about, nothing else thrown.
function comboFree(b) {
  return b.alive && !b.koOut && inOrdinaryMovement(b) && !b.punch && !b.kick && !b.koPunch && !b.swing && !b.throwAnim &&
    !b.elbowAnim && !b.kneeAnim && !b.plum && !b.fknee && !b.dizzy && !swordDuelActive();
}

// ---------------------------------------------------------------- abilities loop

// From the abilities loop, after the punch, the elbow and the knee.
function updateCombos(self, other, dt, d) {
  var cfg = self.char.combos;
  if (!cfg) return;
  var m = self.cmb;
  if (m) { m.frame = cmbFrame; runCombo(self, other, dt, d, m); return; }
  if (self.cmbT == null) self.cmbT = cbRand(cfg.first || cfg.every);
  if (self.cmbT > 0) { self.cmbT -= dt * (self.atkRate || 1); return; }
  if (!started || over || !comboFree(self) || !other.alive || other.koOut || other.invincible || specialBusy(other)) return;
  // Picks the next one once, then waits until he's close enough for its first strike.
  var id = self.cmbNext && cbCanAll(self, self.cmbNext) ? self.cmbNext : (self.cmbNext = pickCombo(self, cfg));
  if (!id) { self.cmbT = cbRand(cfg.every); return; }
  if (d > self.r + other.r + cbReach(self, COMBOS[id][0])) return;
  self.cmbNext = null;
  self.cmb = { id: id, steps: COMBOS[id], i: 0, cur: null, gap: 0, wait: 0, hits: 0, n: 0, side: 1, frame: cmbFrame };
  runCombo(self, other, dt, d, self.cmb);
}

// Keeps his normal punch, kick, elbow and knee waiting while the combination runs.
function cbHold(self) {
  if (self.char.hasPunch) self.punchCd = Math.max(self.punchCd || 0, 0.12);
  if (self.char.hasKick) self.kickCd = Math.max(self.kickCd || 0, 0.12);
  if (self.char.elbow) self.elbowCd = Math.max(self.elbowCd || 0, 0.12);
  if (self.char.knee) self.kneeCd = Math.max(self.kneeCd || 0, 0.12);
}

// Steps in behind the strikes (the speed regulator keeps his pace).
function cbChase(self, other, d, want) {
  var gap = d - self.r - other.r;
  if (gap <= want || !inOrdinaryMovement(self)) return;
  var sp = Math.max(Math.sqrt(self.vx * self.vx + self.vy * self.vy), (self.baseSpeed || SPEED) * CB_LUNGE);
  self.vx = (other.x - self.x) / d * sp; self.vy = (other.y - self.y) / d * sp;
}

function runCombo(self, other, dt, d, m) {
  if (!self.alive || !other.alive || other.koOut || over) { endCombo(self, false); return; }
  cbHold(self);
  if (m.cur) {
    if (!cbStep(self, other, m, m.cur, dt)) { cbChase(self, other, d, cbReach(self, m.cur.k) * 0.4); return; }
    if (m.cur.landed) m.hits++;
    m.n++;
    m.cur = null; m.gap = CB_GAP; m.wait = 0;
  }
  if (m.i >= m.steps.length) { endCombo(self, true); return; }
  var step = m.steps[m.i], reach = cbReach(self, step);
  cbChase(self, other, d, reach * 0.4);
  m.gap -= dt;
  if (m.gap > 0) return;
  var gap = d - self.r - other.r;
  if (gap > reach) {
    // Not close enough yet: he steps in. A punch or a kick lands on whoever's
    // in front of him, so if they've got away the rest is off; an elbow or a
    // knee goes anyway and whiffs, unless they're long gone.
    m.wait += dt;
    if (m.wait < CB_WAIT) return;
    if (step === "jab" || step === "cross" || step === "kick" || step === "plum" || gap > reach + CB_GONE) { endCombo(self, false); return; }
  }
  m.i++;
  if (step === "plum") {
    // Into the clinch: the count goes on through the knees (knees.js).
    var cfg = self.char.combos;
    self.cmb = null;
    self.cmbT = cbRand(cfg.every);
    if (self.char.hasPunch && self.char.punch) self.punchCd = Math.max(self.punchCd || 0, self.char.punch.cooldown);
    startPlum(self, other, m);
    return;
  }
  m.cur = cbStart(self, other, m, step);
}

// Throws one strike of the combination.
function cbStart(self, other, m, step) {
  var s = { k: step, t: 0, landed: false }, last = m.i >= m.steps.length;
  // Only the last strike shoves them off; the ones before it keep them in range.
  var e = self.char.elbow || {}, ekb = last ? (e.knockback || 150) : 30, kkb = last ? kneeNum(self, "knockback") : 30;
  if (step === "jab" || step === "cross") {
    // His normal punch (abilities.js lands it), off the lead hand then the rear.
    s.strikes = statsFor(self.id).strikes;
    self.punch = { t: 0, hit: false, side: step === "jab" ? -1 : 1, cb: true };
    s.p = self.punch;
  } else if (step === "kick") {
    s.strikes = statsFor(self.id).strikes;
    self.kick = { t: 0, hit: false, cb: true };
    s.p = self.kick;
  } else if (step === "hook") {
    var size = self.char.punch.size || 13, coil = 0.06, sweep = 0.15;
    m.side = -m.side;
    self.koPunch = { t: 0, coil: coil, sweep: sweep, dur: coil + sweep + 0.08, hitAt: coil + sweep * QHOOK_OPEN / (QHOOK_OPEN + QHOOK_FOLLOW),
      hit: false, targetId: other.id, size: size * 1.15, kind: "qhook", side: m.side, cb: true, last: last };
    s.p = self.koPunch;
    playWhoosh();
  } else if (step === "elbow") {
    throwElbow(self, other, { reach: cbReach(self, "elbow"), knockback: ekb, onLand: function (dealt) { s.landed = dealt > 0; } });
    s.p = self.elbowAnim;
  } else if (step === "knee") {
    s.p = startKnee(self, other, { reach: cbReach(self, "knee"), knockback: kkb, onLand: function (dealt) { s.landed = dealt > 0; } });
  } else if (step === "spin") {
    // Turns his back first (the tell), then the elbow comes round.
    m.side = -m.side;
    self.cbSpin = { t: 0, dur: CB_SPIN, dir: m.side };
    playWhoosh();
  }
  return s;
}

// Moves one strike along. True once it's over (s.landed says if it landed).
function cbStep(self, other, m, s, dt) {
  s.t += dt;
  if (s.t > 2) { if (self.koPunch && self.koPunch.cb) self.koPunch = null; return true; } // (never left hanging)
  if (s.k === "jab" || s.k === "cross") {
    if (self.punch === s.p) return false;
    s.landed = statsFor(self.id).strikes > s.strikes;
    return true;
  }
  if (s.k === "kick") {
    if (self.kick === s.p) return false;
    s.landed = statsFor(self.id).strikes > s.strikes;
    return true;
  }
  if (s.k === "hook") {
    var kp = self.koPunch;
    if (kp !== s.p) return true; // something else took it
    kp.t += dt;
    if (!kp.hit && kp.t >= kp.hitAt) { kp.hit = true; s.landed = cbLandHook(self, other, kp.last) > 0; }
    if (kp.t >= kp.dur) { self.koPunch = null; return true; }
    return false;
  }
  if (s.k === "elbow") return self.elbowAnim !== s.p;
  if (s.k === "knee") return self.kneeAnim !== s.p;
  if (s.k === "spin") {
    var sp = self.cbSpin;
    if (sp && !s.p) {
      sp.t += dt;
      if (sp.t < sp.dur) return false;
      s.p = cbSpinElbow(self, other, s, sp.dir);
      return false;
    }
    if (!s.p) return true;
    if (self.elbowAnim === s.p) return false;
    self.cbSpin = null;
    return true;
  }
  return true;
}

// The hook: his punch swung round.
function cbLandHook(self, other, last) {
  if (!other.alive || other.koOut) return 0;
  var pu = self.char.punch, d = cbDist(self, other), ux = (other.x - self.x) / d, uy = (other.y - self.y) / d;
  if (d > self.r + other.r + pu.reach + 14) { floater(other.x, other.y - other.r - 8, "WHIFF", "dodge"); return 0; }
  var dealt = hurt(other, pu.damage, "punch", self.id);
  if (dealt > 0) {
    playPunch(dealt * 1.3);
    var kb = last ? pu.knockback : Math.min(pu.knockback, 40);
    if (!other.justDodged && kb > 0 && cbKnockable(other)) { other.vx += ux * kb; other.vy += uy * kb; }
    if (!reduceMotion) shake = Math.max(shake, Math.min(10, 3 + pu.damage * 0.4));
  }
  checkEnd();
  return dealt;
}

// The spinning back elbow: his elbow, harder, with a big shove.
function cbSpinElbow(self, other, s, side) {
  var e = self.char.elbow || {}, base = e.damage || 6;
  throwElbow(self, other, {
    damage: Math.round(base * CB_SPIN_MULT), knockback: Math.max(e.knockback || 0, 360), speed: 0.24, side: side, reach: cbReach(self, "spin"),
    onLand: function (dealt) {
      s.landed = dealt > 0;
      if (dealt > 0) {
        floater(other.x, other.y - other.r - 56, "SPINNING BACK ELBOW!", "note");
        var d = cbDist(self, other), ux = (other.x - self.x) / d, uy = (other.y - self.y) / d;
        impacts.push({ x: other.x - ux * other.r, y: other.y - uy * other.r, nx: -ux, ny: -uy, life: 0.35, max: 0.35, color: self.char.color });
        hitStop = Math.max(hitStop, 0.06);
        crowdReact(0.4);
      }
    }
  });
  return self.elbowAnim;
}

// Done (finished: every strike was thrown), or cut short.
function endCombo(self, finished) {
  var m = self.cmb, cfg = self.char.combos;
  if (!m) return;
  self.cmb = null;
  self.cbSpin = null;
  if (self.koPunch && self.koPunch.cb) self.koPunch = null;
  if (cfg) self.cmbT = cbRand(cfg.every);
  // It takes the place of his next punch, rather than coming on top of it.
  if (self.char.hasPunch && self.char.punch) self.punchCd = Math.max(self.punchCd || 0, self.char.punch.cooldown);
  if (finished) comboCounter(self, m.hits, m.n);
}

// "3-HIT COMBO!" when every strike landed (the clinch knees count too, knees.js).
function comboCounter(self, hits, n) {
  if (n < 2 || hits < n || !self.alive) return;
  floater(self.x, self.y - self.r - 34, hits + "-HIT COMBO!", "crit");
  crowdReact(0.15 + hits * 0.07);
  playComboChime(hits);
}

// ---------------------------------------------------------------- every frame

// From update(), after the abilities loop: a combination the loop didn't get
// to this frame is over (something else took him over), and an elbow thrown
// by a fighter without his own `elbow` block is moved along here
// (updateElbows does everyone else's).
function tickCombos(dt) {
  balls.forEach(function (b) {
    var other = balls[1 - b.id];
    if (b.cmb && b.cmb.frame !== cmbFrame) endCombo(b, false);
    if (b.cbSpin && !b.cmb) b.cbSpin = null;
    if (b.elbowAnim && !b.char.elbow) {
      if (!b.alive || b.koOut || !inOrdinaryMovement(b)) b.elbowAnim = null;
      else tickElbowAnim(b, other, dt);
    }
  });
  cmbFrame++;
}

// ---------------------------------------------------------------- drawing

// From draw(), on each fighter's body: turning his back for the spinning elbow.
function applyComboPose(b) {
  var s = b.cbSpin;
  if (!s) return;
  var k = Math.min(1, s.t / s.dur), e = 1 - (1 - k) * (1 - k);
  ctx.translate(b.x, b.y); ctx.rotate(-s.dir * e * Math.PI * 2); ctx.translate(-b.x, -b.y);
}

// ---------------------------------------------------------------- sound

// A bright little rising chime for a clean combination, one note a strike.
function playComboChime(hits) {
  try {
    var ac = getAudioCtx();
    if (!ac) return;
    if (ac.state === "suspended") ac.resume();
    var t = ac.currentTime;
    for (var i = 0; i < Math.min(5, hits); i++) caneTone(ac, t + i * 0.055, "triangle", 660 * Math.pow(1.19, i), 680 * Math.pow(1.19, i), 0.12, 0.09);
  } catch (e) { /* never let audio break the game */ }
}

// ---------------------------------------------------------------- gallery

// The fighter card's move list (gallery.js).
function comboGalleryMoves(ch, add) {
  var c = ch.combos;
  if (!c || !c.list) return;
  var names = Object.keys(c.list).filter(function (id) { return COMBOS[id] && c.list[id] > 0; }).map(function (id) {
    return COMBOS[id].map(function (s) { return CB_NAMES[s]; }).join(", ");
  });
  if (!names.length) return;
  add("🥊", "Combinations", "Every " + c.every[0] + "-" + c.every[1] + "s up close he strings strikes together: " + names.join("; ") +
    ". Each one lands or misses on its own; land them all for an N-HIT COMBO!");
}
