// Joshua Van, "The Fearless" (Christian, 2026-11-13; reworked to his
// direction 2026-11-14). UFC flyweight champion, born in Myanmar, fights out
// of Houston. A high-volume boxer on the Brawler base, a little slower on his
// feet than the other small guys, his hands always up in a high guard.
// Everything below is set in his character file under "van" (and his
// special); leave a block out and that part is off.
//
// High guard  (van.highGuard) both gloves up by his head all the time; the
//             one that isn't punching stays up there.
// Combos      (van.combos) in place of the Brawler's single punch he throws
//             long combinations off alternating hands, walking in behind
//             them (Max Holloway's volume in holloway.js is the model). How
//             long they are (`punches`), the rest after each one (`cooldown`)
//             and how far his punches still find them (`slack`) go from the
//             first number to the second as his hands level climbs.
// Hot hands   (van.hotHands) inside a combo, every punch that LANDS makes the
//             next one hit harder (`step` more damage per landed punch, up to
//             `maxMult` times) and more likely to crit (`critBase`% plus
//             `critStep`% per landed punch, up to `critMax`%, a crit does
//             `critMult` times). A punch that's blocked, slipped or misses
//             breaks the chain back to 0. The chain is counted under him,
//             "x5", bigger and hotter with every one that lands.
// Left hook   (hooks, the shared hook in hook-punch.js) `finisherChance`% of
//             his combos end in a hook, always off his left: it comes round
//             from the side the way every hook in the game does and hits
//             `damageMult` times harder, on top of the chain. He walks in
//             only to arm's length while it comes round (room for the arc
//             to read), and it reaches half his `punch.reach` further than
//             a straight one. While his gloves burn the hook glove glows
//             white-hot (p.hookHeat).
//             (van.hook) one that crits is a big left hook: "LEFT HOOK!", the
//             commentator's call (vanLeftHook, no more than one every
//             `callGap` seconds), a `knockback` shove and, `down`% of the
//             time, they're knocked down for `downTime` seconds (knockDown,
//             ngannou.js). He ends the combo there and lets them get up.
// Hands level (van.level) across the fight his hands get better: every punch
//             he lands adds `hitFill`, and a clean combo (every punch in it
//             landed, `cleanMin` or more) adds `cleanFill` for each punch
//             ("CLEAN x7!"). The level (0 to 1) makes his combos longer and
//             his steps bigger, his reach truer, and takes `pierce` points
//             off their block chance against him. It shows as a five-part
//             bar under his health and his gloves glowing hotter; "HOT
//             HANDS!" and "MAX HANDS!" at the `marks`.
// Takedown defense  char.tdd (the sprawl from ilia.js).
// Durable     (van.durable) "The Fearless" walks through the big ones: a single
//             strike of `over` damage or more (from `sources`) does `mult` of
//             its damage (vanDurable, from hurt).
// Hands on Fire  his special (special.move "vanfire"). He stops for `call`
//             seconds while his gloves catch fire (the tell, "ON FIRE!"), then
//             they burn for `time` seconds. While they burn, a combo that
//             finishes with the chain at `keepMin` or more doesn't reset: he
//             KEEPS that chain, and the damage and crit chance that go with
//             it, for `keep` seconds. The count under him stays lit, on fire,
//             with a fuse burning down under it; the next combo started before
//             the fuse runs out carries on from there. A punch that's blocked,
//             slipped or misses still breaks it, fire or no fire. While they
//             burn his hot hands go up to `maxMult` at most, `pierce` more
//             points come off their block chance, he walks in behind his
//             combos `chase` times as fast, and the last punch of a combo
//             doesn't knock them away, so the next one can carry on.
// Win flag    (van.winFlag) when he wins he holds the Myanmar flag up over his
//             head, the way he carries it to the cage.
// Voice lines (van.lines, read with say(); van.voice says when). Christian's
//             picks, the exact game text: `start` (one of two at the start),
//             `combo` (after a long combo lands), `knockdown` (after a left
//             hook drops them, once the commentator is done), `shot` (when they
//             shoot on him), `trading` (when they're both landing), `win` (some
//             wins; the rest get his `otherwise` slot, so every win has a line).
//             The defining moments (`always`: the start, a win) always get
//             their line and wait up to `wait` seconds for their turn; the
//             frequent ones roll a `chance`% with a `gap`, and never come within
//             `minGap` seconds of his last line.
// The combos run on b.vn, the special on b.vnFire, the flag on b.vnFlag.
"use strict";

// Registered here rather than in special.js's table (gsp.js does the same).
SPECIAL_MOVES.vanfire = "Hands on Fire";

var VN_FLAG = { yellow: "#fecb00", green: "#34b233", red: "#ea2839" }; // Myanmar's flag
var VN_HEAT = ["#ffffff", "#ffe27a", "#ffbb2e", "#ff8a1f", "#ff4a24", "#ff2a4a"]; // the counter heating up, x2 to x12+
var vnClock = 0; // drawing clock

function vnCfg(b) { return b && b.char && b.char.van; }
function vnLerp(r, k) { return r[0] + (r[1] - r[0]) * Math.max(0, Math.min(1, k)); }
function vnDist(a, b) { var dx = b.x - a.x, dy = b.y - a.y; return Math.sqrt(dx * dx + dy * dy) || 1; }
// His hands level (0 to 1); with the level switched off he fights at half.
function vnL(b) { var c = vnCfg(b); return c && c.level ? (b.vn ? b.vn.L : 0) : 0.5; }
function vnLines(b, key) { var c = vnCfg(b), l = c && c.lines && c.lines[key]; return l && l.length ? l : null; }
// Says a line from one of his slots. False when the slot is empty.
function vnSay(b, key) {
  var line = pickLine(b, vnLines(b, key), "vn-" + key);
  if (!line) return false;
  say(b, line);
  if (b.vn) { b.vn.lineT = 0; b.vn.saidN++; }
  return true;
}
// His special, when it's Hands on Fire.
function vnFireSp(b) { var sp = b.char.hasSpecial && b.char.special; return sp && sp.move === "vanfire" ? sp : null; }
// His gloves burning (after they've caught).
function vnBurning(b) { return !!(b && b.vnFire && b.vnFire.phase === "burn"); }
// Stopped while his gloves catch fire: the speed regulator leaves him alone
// (physics.js).
function vanBusy(b) { return !!(b && b.vnFire && b.vnFire.phase === "call"); }
// Standing in his high guard (drawn by drawVan, not drawHands).
function vnGuardStance(b) {
  var cfg = vnCfg(b);
  return !!(cfg && cfg.highGuard && b.vn && b.alive && !b.koOut && !b.kick && !b.grappled && !b.grapple && !b.sprawl && !b.sprawled &&
    !subLocked(b) && !b.combo && !b.swing && !b.taunt && !b.mock && !b.throwAnim && !b.koRush && !b.koPunch && !b.igbb && !b.vnFlag &&
    !b.ngDown && !b.shelled && !herbCovering(b) && !aaCovering(b) && !pushFlowHandsBusy(b)); // (arms on them in a tie-up, push-flow.js)
}
// His hands are drawn by drawVan in his high guard and while he holds the
// flag up (drawHands skips them, draw-attacks.js).
function vanHandsBusy(b) { return !!(b && b.vn && (b.vnFlag || vnGuardStance(b))); }
function vnKnockable(o) { return o.alive && !o.grappled && !o.grapple && !o.slam && !subLocked(o) && !o.igbb && !o.koOut && !o.dazed; }
function vnInterrupted(b) {
  return !b.alive || b.slam || b.grappled || b.grapple || b.sprawl || b.sprawled || subLocked(b) || b.guard || b.koOut ||
    b.shocked || b.dazed || b.dizzy || b.shelled || b.checkStun > 0 || b.igbb || b.beamPin;
}

// From startMatchSeeded.
function resetVan() { vnClock = 0; }
// From makeBall.
function initVan(b) {
  b.vn = null; b.vnFire = null; b.vnFlag = null;
  if (!vnCfg(b)) return;
  b.vn = { L: 0, chain: 0, best: 0, combo: null, cleanN: 0, crits: 0, cnt: null, t: 0, kept: null, keptN: 0, keptBest: 0, carried: 0,
    fires: 0, fireDmg: 0, hooks: 0, hookN: 0, hookLanded: 0, downs: 0, hookCallT: -99, hookCalls: 0, lineT: 99, lineAt: {}, said: {}, saidN: 0, q: null,
    hp: null, taken: [], landed: [], wasShot: false, thrownN: 0, landedN: 0 };
}

// ---------------------------------------------------------------- combos

// From the abilities loop in place of the normal punch: his combos. True
// for him (the base punch is skipped), false for anyone else.
function updateVanHands(self, other, dt, d) {
  var cfg = vnCfg(self);
  if (!cfg || !cfg.combos || !self.char.hasPunch || !self.vn) return false;
  vnComboPunch(self, other, dt, d, cfg);
  return true;
}

function vnChase(self, other, d, reach, speed) {
  var gap = d - self.r - other.r;
  if (gap > reach * 0.45) {
    var sp = Math.min(speed, (gap - reach * 0.45) * 20);
    self.vx = (other.x - self.x) / d * sp; self.vy = (other.y - self.y) / d * sp;
  }
}

// One punch of a combo. side -1 is his left hand. The last one rolls the
// shared hook (hook-punch.js); a hook is always his left.
function vnNewPunch(self, cfg, side, left, n) {
  var p = { t: 0, hit: false, side: side, left: left, n: n, vn: true };
  if (rollPunchType(self, p, left === 0) === "hook") { // (or an uppercut or a body shot, body-shots-uppercuts.js)
    p.side = -1;
    if (vnBurning(self)) p.hookHeat = 1; // white-hot on fire
    self.vn.hookN++;
  }
  return p;
}

function vnComboPunch(self, other, dt, d, cfg) {
  var cb = cfg.combos, pu = self.char.punch, v = self.vn, lv = vnL(self);
  var reach = self.r + other.r + pu.reach, slack = vnLerp(cb.slack, lv);
  self.punchCd = Math.max(0, self.punchCd - dt * self.atkRate);
  // (He lets them get up after a knockdown.)
  if (!self.punch && self.punchCd === 0 && other.alive && !over && d < reach && !other.ngDown) {
    var n = Math.max(2, Math.round(vnLerp(cb.punches, lv) + (Math.random() - 0.5) * cb.spread));
    v.combo = { n: n, thrown: 0, landed: 0 };
    if (v.kept) { v.chain = v.kept.n; v.kept = null; v.carried++; } // on fire: carries on from the chain he kept
    else v.chain = 0;
    self.punch = vnNewPunch(self, cfg, Math.random() < 0.5 ? 1 : -1, n - 1, n);
  }
  var p = self.punch;
  if (!p || !p.vn) return;
  p.t += dt;
  var fs = (vnBurning(self) || v.kept) && vnFireSp(self);
  if ((p.left > 0 || (p.hook && !p.hit)) && other.alive) vnChase(self, other, d, p.hook ? pu.reach * 2 : pu.reach, cb.chase * (fs && fs.chase || 1)); // walks in behind the combo (a hook: only as far as arm's length, so it has room to come round)
  if (!p.hit && p.t >= punchHitAt(self, p)) { // (later for a hook, hook-punch.js)
    p.hit = true;
    vnStrike(self, other, d < reach + slack + (p.hook ? pu.reach * 0.5 : 0), cfg, p.left === 0, p); // (a hook comes round wide: it reaches a little further)
  }
  if (self.punch === p && p.t >= punchEndAt(self, p)) {
    if (p.left > 0 && other.alive && self.alive && d < reach + slack * 2 && !other.ngDown) {
      self.punch = vnNewPunch(self, cfg, -p.side, p.left - 1, p.n); // the next one, off the other hand
    } else {
      self.punch = null;
      vnEndCombo(self, cfg, false);
    }
  }
}

// One punch arriving. inRange false is a miss. True if it landed.
function vnStrike(self, other, inRange, cfg, last, p) {
  var v = self.vn, cb = v.combo;
  if (cb) cb.thrown++;
  v.thrownN++;
  if (!other.alive || other.koOut) return false;
  if (!inRange) { vnBreak(self); return false; }
  var hh = cfg.hotHands, lvc = cfg.level, lv = vnL(self), k = v.chain, fsp = vnFireSp(self);
  var cap = hh ? ((vnBurning(self) || v.kept) && fsp && fsp.maxMult ? fsp.maxMult : hh.maxMult) : 1;
  var mult = hh ? Math.min(cap, 1 + vnLerp(hh.step, lv) * k) : 1;
  var critP = hh ? Math.min(hh.critMax, hh.critBase + vnLerp(hh.critStep, lv) * k) : 0;
  var crit = Math.random() * 100 < critP;
  var dmg = self.char.punch.damage * mult * (crit ? hh.critMult : 1); // (punchHurt below: a hook hits harder, hook-punch.js; a setup, body-shots-uppercuts.js)
  // His hands find the gaps: their block chance drops against his punches.
  var pierce = (lvc && lvc.pierce ? vnLerp(lvc.pierce, lv) : 0) + (vnBurning(self) && fsp && fsp.pierce ? fsp.pierce : 0), bb = other.blockBonus || 0, dealt = 0;
  other.blockBonus = bb - pierce;
  try { dealt = punchHurt(self, other, p, dmg); } finally { other.blockBonus = bb; }
  if (!(dealt > 0)) { vnBreak(self); checkEnd(); return false; }
  v.chain++; v.landedN++;
  if (p && p.hook) v.hookLanded++;
  if (cb) cb.landed++;
  if (v.chain > v.best) v.best = v.chain;
  if (vnBurning(self)) v.fireDmg += dealt;
  v.landed.push(v.t);
  if (lvc) vnFill(self, lvc.hitFill || 0);
  vnCount(self);
  playPunch(dealt * (crit ? 1.6 : 1));
  if (v.chain >= 3) playVnChain(v.chain);
  var ux = (other.x - self.x) / vnDist(self, other), uy = (other.y - self.y) / vnDist(self, other);
  var kb = last && !vnBurning(self) ? self.char.punch.knockback : cfg.combos.comboKnockback; // (on fire he keeps them close for the next one)
  if (!other.justDodged && vnKnockable(other)) hookShove(self, other, p, kb); // straight back, or sideways for a hook (hook-punch.js)
  var bigHook = crit && p && p.hook && cfg.hook;
  if (crit) vnCrit(self, other, ux, uy, bigHook);
  if (!reduceMotion) shake = Math.max(shake, crit ? 9 : (last ? 5 : 3));
  checkEnd();
  if (bigHook) vnBigHook(self, other, cfg, ux, uy, p);
  return true;
}

// A big left hook: a hook that crits.
function vnBigHook(self, other, cfg, ux, uy, p) {
  var hk = cfg.hook, v = self.vn;
  v.hooks++;
  crowdReact(0.35);
  playVnHook();
  if (hk.knockback && !other.justDodged && vnKnockable(other)) hookShove(self, other, p, hk.knockback); // more of the sideways shove
  if (!other.alive || over) return; // a knockout gets its own call
  if (v.t - v.hookCallT >= (hk.callGap || 0) && !announcer) {
    v.hookCallT = v.t; v.hookCalls++;
    if (typeof commentaryCall === "function") commentaryCall("vanLeftHook", self, other); // "Oh, nice left hook by Joshua Van!" (commentary-calls.js)
  }
  if (hk.down && Math.random() * 100 < hk.down && vnKnockable(other) && !other.ngDown && typeof knockDown === "function") {
    knockDown(other, hk.downTime || 1, ux, uy); // flat on the mat (ngannou.js)
    v.downs++;
    crowdReact(0.6);
    if (!reduceMotion) shake = Math.max(shake, 10);
    if (self.punch && self.punch.vn) self.punch = null;
    vnEndCombo(self, cfg, false);
    vnMoment(self, "knockdown");
  }
}

// A punch didn't land: the chain breaks (a kept one too).
function vnBreak(self) {
  var v = self.vn;
  if (v.chain >= 2 && v.cnt) { v.cnt.broke = true; v.cnt.hold = 0.3; playVnBreak(); }
  v.chain = 0; v.kept = null;
}

// The counter under him pops up a number.
function vnCount(self) {
  var v = self.vn;
  if (!v.cnt) v.cnt = { n: 0, pop: 0, hold: 0, broke: false };
  v.cnt.n = v.chain; v.cnt.pop = 1; v.cnt.hold = 0.6; v.cnt.broke = false;
}

function vnCrit(self, other, ux, uy, hook) {
  self.vn.crits++;
  floater(other.x, other.y - other.r - 26, hook ? "LEFT HOOK!" : "CRIT!", "crit");
  impacts.push({ x: other.x - ux * other.r, y: other.y - uy * other.r, nx: -ux, ny: -uy, life: 0.3, max: 0.3, color: "#ffb02e" });
  hitStop = Math.max(hitStop, 0.04);
  playVnCrit();
  if (reduceMotion) return;
  for (var i = 0; i < 9; i++) {
    var a = Math.atan2(-uy, -ux) + (nativeRandom() - 0.5) * 2.6, s = 140 + nativeRandom() * 260;
    particles.push({ x: other.x - ux * other.r, y: other.y - uy * other.r, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 0.3, max: 0.3, size: 2 + nativeRandom() * 2.5, color: i % 2 ? "#ffd34d" : "#ff7a1a" });
  }
}

// A combo ending (cut: something took over before it finished). A clean
// one, every punch in it landed, makes his hands better. With his gloves on
// fire he keeps the chain instead of dropping it.
function vnEndCombo(self, cfg, cut) {
  var v = self.vn, cb = v.combo;
  if (!cb) return;
  v.combo = null;
  self.punchCd = vnLerp(cfg.combos.cooldown, vnL(self));
  var lvc = cfg.level, clean = !cut && lvc && cb.thrown >= cb.n && cb.landed >= cb.n && cb.n >= (lvc.cleanMin || 3);
  if (clean) {
    v.cleanN++;
    floater(self.x, self.y - self.r - 66, "CLEAN x" + cb.n + "!", cb.n >= 7 ? "crit" : "note");
    playVnClean(cb.n);
    crowdReact(0.12 + cb.n * 0.04);
    vnFill(self, lvc.cleanFill * cb.n);
  }
  var fsp = vnFireSp(self);
  if (!cut && fsp && vnBurning(self) && v.chain >= (fsp.keepMin || 3)) {
    v.kept = { n: v.chain, t: fsp.keep, max: fsp.keep };
    v.keptN++; v.keptBest = Math.max(v.keptBest, v.chain);
    if (!v.cnt) vnCount(self);
    v.cnt.n = v.chain; v.cnt.broke = false; v.cnt.pop = 0.6;
    playVnKeep();
  } else {
    if (v.cnt && !v.cnt.broke) v.cnt.hold = 0.55; // the count hangs there, then fades
    v.chain = 0;
  }
  var vc = (cfg.voice || {}).combo;
  if (!cut && vc && cb.landed >= (vc.landed || 6)) vnMoment(self, "combo");
}

// The chain he kept ran out before the next combo.
function vnDropKept(b) {
  var v = b.vn;
  v.kept = null;
  if (v.combo) return;
  v.chain = 0;
  if (v.cnt && !v.cnt.broke) v.cnt.hold = 0.15;
  playVnFizzle();
}

// His hands level going up.
function vnFill(self, amt) {
  var cfg = vnCfg(self), lvc = cfg && cfg.level, v = self.vn;
  if (!lvc || !(amt > 0) || v.L >= 1) return;
  var was = v.L;
  v.L = Math.min(1, v.L + amt);
  var marks = lvc.marks || [0.5, 1];
  marks.forEach(function (mk, i) {
    if (was < mk && v.L >= mk) {
      var top = i === marks.length - 1;
      floater(self.x, self.y - self.r - 40, top ? "MAX HANDS!" : "HOT HANDS!", "crit");
      crowdReact(top ? 0.6 : 0.4);
      playVnLevel(top);
    }
  });
}

// From hurt (match.js): he walks through the big single shots.
function vanDurable(b, amount, source, attackerId) {
  var cfg = vnCfg(b), du = cfg && cfg.durable;
  if (!du || attackerId == null || attackerId === b.id || amount < du.over || du.sources.indexOf(source) < 0) return 1;
  return du.mult;
}

// ---------------------------------------------------------------- Hands on Fire (special)

// From updateSpecial (special.js) for special.move "vanfire". True only
// while he's stopped for his gloves catching; once they burn he fights on.
function updateVanFire(self, other, dt) {
  var sp = self.char.special, cfg = vnCfg(self), f = self.vnFire;
  if (!cfg || !self.vn) return false;
  if (!f) {
    if (self.specialT < sp.chargeTime || !started || over || vnInterrupted(self) || !canStartIgbb(self, other)) return false;
    if (other.guard || other.koOut || swordDuelActive() || vnDist(self, other) > sp.range) return false;
    vnStartFire(self, cfg);
    f = self.vnFire;
  }
  if (f.phase !== "call") return false;
  f.t += dt;
  if (!f.lit && f.t >= sp.call * 0.5) { f.lit = true; vnIgnite(self); }
  if (vnInterrupted(self) || over || f.t >= sp.call) {
    if (!f.lit) { f.lit = true; vnIgnite(self); }
    f.phase = "burn"; f.t = 0;
    return false;
  }
  self.vx = 0; self.vy = 0;
  return true;
}

function vnStartFire(self, cfg) {
  if (self.vn.combo) vnEndCombo(self, cfg, true);
  clearActions(self);
  self.vx = 0; self.vy = 0;
  self.vn.fires++;
  self.vnFire = { phase: "call", t: 0, lit: false, crackle: 0, ember: 0 };
  playWhoosh();
}

// The moment they catch: a burst of flame off both gloves.
function vnIgnite(self) {
  floater(self.x, self.y - self.r - 44, "ON FIRE!", "crit");
  crowdReact(0.5);
  playVnIgnite();
  if (reduceMotion) return;
  shake = Math.max(shake, 4);
  vnGloves(self, balls[1 - self.id], vnGuardStance(self)).forEach(function (g) {
    for (var i = 0; i < 12; i++) {
      var a = -Math.PI / 2 + (nativeRandom() - 0.5) * 2.6, s = 120 + nativeRandom() * 220;
      particles.push({ x: g.x, y: g.y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 0.4, max: 0.4, size: 2 + nativeRandom() * 3, color: i % 3 ? "#ff7a1a" : "#ffd34d" });
    }
  });
}

// From tickVan: the fire burning down (the special's bar drains with it),
// embers and a crackle.
function vnTickFire(b, cfg, dt) {
  var f = b.vnFire, sp = vnFireSp(b);
  if (!f) return;
  if (!sp || !b.alive || over) { b.vnFire = null; b.specialT = 0; return; }
  if (f.phase === "burn") {
    f.t += dt;
    b.specialT = sp.chargeTime * Math.max(0, 1 - f.t / sp.time) * 0.9; // (never full while it burns)
    if (f.t >= sp.time) { b.vnFire = null; b.specialT = 0; return; }
  }
  vnEmbers(b, f, dt);
  f.crackle -= dt;
  if (f.lit && f.crackle <= 0) { f.crackle = 0.4 + nativeRandom() * 0.35; playVnCrackle(); }
}

// Sparks rising off his burning gloves.
function vnEmbers(b, f, dt) {
  if (reduceMotion || !f.lit) return;
  f.ember -= dt;
  if (f.ember > 0) return;
  f.ember = 0.05;
  vnGloves(b, balls[1 - b.id], vnGuardStance(b)).forEach(function (g) {
    particles.push({ x: g.x + (nativeRandom() - 0.5) * g.r * 1.4, y: g.y - g.r * (0.8 + nativeRandom()), vx: (nativeRandom() - 0.5) * 50, vy: -70 - nativeRandom() * 90,
      life: 0.45, max: 0.45, size: 1.4 + nativeRandom() * 1.8, color: nativeRandom() < 0.5 ? "#ffb02e" : "#ff5a1a" });
  });
}

// How big the flames on his gloves are right now (0: none).
function vnFireHeat(b) {
  var f = b.vnFire, sp = vnFireSp(b), v = b.vn;
  if (f && sp) {
    if (f.phase === "call") return f.lit ? 1 : 0.35 * Math.min(1, f.t / (sp.call * 0.5));
    var left = sp.time - f.t;
    return left < 0.4 && !v.kept ? Math.max(0.3, left / 0.4) : 1;
  }
  return v && v.kept ? 0.85 : 0; // the chain he kept still burning after the fire's out
}

// ---------------------------------------------------------------- every frame

// From update(): the counter, cleaning up a combo something else cut short,
// the kept chain and the fire running down, his fight clock, the win flag
// and his lines.
function tickVan(dt) {
  vnClock += dt;
  balls.forEach(function (b) {
    var cfg = vnCfg(b), v = b.vn;
    if (!cfg || !v) return;
    var o = balls[1 - b.id];
    if (v.cnt) {
      v.cnt.pop = Math.max(0, v.cnt.pop - dt * 5);
      if (v.chain <= 0 || v.cnt.broke) { v.cnt.hold -= dt; if (v.cnt.hold <= -0.35) v.cnt = null; }
    }
    if (v.combo && !(b.punch && b.punch.vn)) vnEndCombo(b, cfg, true); // grabbed, sprawled, cleared...
    if (v.kept) { v.kept.t -= dt; if (v.kept.t <= 0 || !b.alive || over) vnDropKept(b); }
    vnTickFire(b, cfg, dt);
    if (started && !over && b.alive) { v.t += dt; v.lineT += dt; }
    if (b.vnFlag) b.vnFlag.t += dt;
    else if (cfg.winFlag && over && b.alive && !o.alive) { b.vnFlag = { t: 0 }; b.punch = null; }
    vnWatch(b, v, o, cfg);
    vnVoice(b, v, o, cfg, dt);
  });
}

// Watching for his moments: them shooting on him, and the two of them
// trading.
function vnWatch(b, v, o, cfg) {
  if (!started || over || !b.alive) return;
  var tr = (cfg.voice && cfg.voice.trading) || {}, win = tr.window || 2.5;
  if (v.hp == null) v.hp = b.hp;
  if (b.hp < v.hp - 0.5 && o.alive) v.taken.push(v.t);
  v.hp = b.hp;
  while (v.taken.length && v.taken[0] < v.t - win) v.taken.shift();
  while (v.landed.length && v.landed[0] < v.t - win) v.landed.shift();
  var shot = !!(b.sprawl || b.grappled);
  if (shot && !v.wasShot) vnMoment(b, "shot");
  v.wasShot = shot;
  if (v.taken.length >= (tr.took || 2) && v.landed.length >= (tr.landed || 3) && vnDist(b, o) < b.r + o.r + 90) vnMoment(b, "trading");
}

// A moment that might get a line: rolls its chance, then waits for him to be
// quiet (and the commentator to finish) for up to `wait` seconds.
function vnMoment(b, key) {
  var cfg = vnCfg(b), vc = (cfg && cfg.voice) || {}, m = vc[key], v = b.vn;
  if (!m || !vnLines(b, key) || v.said[key + "Done"]) return false;
  if (v.t < (m.after || 0)) return false;
  if (v.lineAt[key] != null && v.t - v.lineAt[key] < (m.gap || 0)) return false;
  if (!m.always && v.lineT < (vc.minGap || 0)) return false;
  if (v.q && !m.always) return false;
  v.lineAt[key] = v.t;
  if (m.chance != null && Math.random() * 100 >= m.chance) return false;
  v.q = { key: key, t: 0, max: m.wait != null ? m.wait : 1 };
  if (m.once) v.said[key + "Done"] = true;
  return true;
}

// Nobody's voice on the talk channel (audio.js), or near enough done that
// playTalk will put his line right after it.
function vnTalkFree() {
  try { return !audioCtx || audioCtx.currentTime >= talkEnd - 1; } catch (e) { return true; }
}

function vnVoice(b, v, o, cfg, dt) {
  if (!started || !b.alive) return;
  var vc = cfg.voice || {};
  if (!over && !v.said.start && vc.start && v.t > (vc.start.at || 1.2)) { v.said.start = true; vnMoment(b, "start"); }
  if (over && !v.said.win && !o.alive) { // every win gets a line: `win` some of the time, his `otherwise` slot the rest
    v.said.win = true; v.q = null;
    if (!vnMoment(b, "win") && vc.win && vc.win.otherwise && vnLines(b, vc.win.otherwise)) v.q = { key: vc.win.otherwise, t: 0, max: vc.win.wait || 1 };
  }
  if (!v.q) return;
  if (canSay(b) && !announcer && !speaking(o) && vnTalkFree()) { var k = v.q.key; v.q = null; vnSay(b, k); return; }
  v.q.t += dt;
  if (v.q.t > v.q.max) v.q = null;
}

// ---------------------------------------------------------------- drawing

// Which way his guard faces: at them, or the way he's going.
function vnFacing(b, o) {
  if (o && o.alive) { var dx = o.x - b.x, dy = o.y - b.y, dd = Math.sqrt(dx * dx + dy * dy) || 1; return { x: dx / dd, y: dy / dd }; }
  var spd = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
  if (spd > 1) return { x: b.vx / spd, y: b.vy / spd };
  return { x: b.id === 0 ? 1 : -1, y: 0 };
}

// The punching glove, where drawFist puts it (a hook: where hook-punch.js
// has it on its curve).
function vnFist(b, o) {
  var p = b.punch, pu = b.char.punch;
  if (!p || !o.alive || b.taunt || b.flow || b.combo) return null;
  if (p.hook || p.upper || p.body) {
    var h = p.hook ? hookGlove(b, o) : punchTypeGlove(b, o), s = p.side || 1, ha = Math.atan2(o.y - b.y, o.x - b.x) + s * Math.PI / 2; // (an uppercut or body shot, body-shots-uppercuts.js)
    return h && { x: h.x, y: h.y, r: h.r, fist: true, side: s, pt: 1, ax: b.x + Math.cos(ha) * b.r * 0.55, ay: b.y + Math.sin(ha) * b.r * 0.55 };
  }
  var qx = o.x - b.x, qy = o.y - b.y, qd = Math.sqrt(qx * qx + qy * qy) || 1, nx = qx / qd, ny = qy / qd;
  var windup = pu.speed * 0.35, pt = p.t < windup ? p.t / windup : 1 - (p.t - windup) / (pu.speed - windup);
  pt = Math.max(0, Math.min(1, pt));
  var rest = b.r + 4, full = Math.max(rest, qd - o.r + 4), fd = rest + (full - rest) * pt, gp = b.r * 0.4 * (p.side || 1);
  return { x: b.x + nx * fd - ny * gp, y: b.y + ny * fd + nx * gp, r: pu.size, fist: true, side: p.side || 1, pt: pt,
    ax: b.x + nx * (b.r - 2) - ny * gp, ay: b.y + ny * (b.r - 2) + nx * gp };
}

// His two gloves up in the high guard, by the sides of his head and leaning
// a little toward them, each on an arm from his shoulder.
function vnGuardPts(b, o) {
  var r = b.r, f = vnFacing(b, o);
  if (b.vnMelt) return vanMeltGuard(b, vnGuardPts(Object.assign({}, b, { vnMelt: null }), o)); // the glove out catching Chuck's ice punch (van-melt.js)
  return [-1, 1].map(function (s) {
    return { x: b.x + s * r * 0.4 + f.x * r * 0.2, y: b.y - r * 0.52 + f.y * r * 0.16, r: r * 0.3, s: s,
      sx: b.x + s * r * 0.8, sy: b.y - r * 0.04, ang: Math.atan2(-1 + f.y * 0.25, -s * 0.38 + f.x * 0.45) };
  });
}

// Where his gloves are right now: the punching one and the guard hands.
function vnGloves(b, o, guard) {
  var list = [], fist = vnFist(b, o);
  if (fist) list.push(fist);
  if (guard) {
    var pts = vnGuardPts(b, o);
    if (fist) { // the guard glove on the punching side is the one throwing
      var d0 = Math.pow(pts[0].x - fist.ax, 2) + Math.pow(pts[0].y - fist.ay, 2), d1 = Math.pow(pts[1].x - fist.ax, 2) + Math.pow(pts[1].y - fist.ay, 2);
      pts.splice(d0 < d1 ? 0 : 1, 1);
    }
    return list.concat(pts);
  }
  var r = b.r, spd = Math.sqrt(b.vx * b.vx + b.vy * b.vy), f = spd > 1 ? { x: b.vx / spd, y: b.vy / spd } : vnFacing(b, o); // (drawHands' spots)
  (fist ? [-fist.side] : [1, -1]).forEach(function (s) {
    list.push({ x: b.x + f.x * r * 0.8 - f.y * r * 0.4 * s, y: b.y + f.y * r * 0.8 + f.x * r * 0.4 * s, r: r * 0.3 });
  });
  return list;
}

// From draw(), per fighter, after its hands: the hands bar, his high guard,
// his gloves glowing or on fire, the flag.
function drawVan(b) {
  var cfg = vnCfg(b), v = b.vn;
  if (!cfg || !v || !b.alive) return;
  var o = balls[1 - b.id];
  if (cfg.level) drawVnHandsBar(b, o);
  if (b.vnFlag) { drawVnFlagUp(b); return; }
  var guard = vnGuardStance(b);
  if (!guard && (b.koOut || b.kick || b.grappled || b.grapple || b.sprawl || subLocked(b) || b.combo || b.swing || b.ngDown)) return; // hands not out
  var gl = vnGloves(b, o, guard), fire = vnFireHeat(b); // (a hook is drawn by drawFist, hook-punch.js)
  if (fire > 0) {
    gl.forEach(function (g, i) { drawVnFlame(g.x, g.y, g.r, fire, i, false); });
    if (guard) drawVnGuard(b, gl);
    gl.forEach(function (g, i) { if (!g.fist) drawVnFlame(g.x, g.y, g.r, fire * 0.55, i + 3, true); }); // licking over the guard gloves
    return;
  }
  if (guard) drawVnGuard(b, gl);
  var heat = Math.min(1, v.L * 0.9 + Math.min(1, v.chain / 8) * 0.35);
  if (heat < 0.06) return;
  gl.forEach(function (g, i) { drawVnGlow(g.x, g.y, g.r, heat, v.L, i); });
}

function vnArm(b, sx, sy, hx, hy, gr, ang, side) {
  if (hasArmMuscle(b.char)) drawArmMuscle(ctx, b.char, sx, sy, hx, hy, b.r * 0.2, theme.wall);
  else strokeLimb(gr * 0.7, armColor(b.char, side), function () { ctx.moveTo(sx, sy); ctx.lineTo(hx, hy); });
  drawGloveAt(hx, hy, gr, b.char, ang);
}

// The high guard: forearms up from his shoulders, gloves by his head.
function drawVnGuard(b, gl) {
  gl.forEach(function (g) { if (!g.fist && g.sx != null) vnArm(b, g.sx, g.sy, g.x, g.y, g.r, g.ang, g.s); });
}

// A glove heating up with his hands level: a hot halo, and flames licking
// off it at a high level.
function drawVnGlow(x, y, gr, heat, L, i) {
  var h = Math.min(1, heat), flick = 1 + 0.07 * Math.sin(vnClock * 19 + i * 2.1);
  var rad = gr * (1.35 + h * 1.05) * flick;
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  var g = ctx.createRadialGradient(x, y, gr * 0.55, x, y, rad);
  g.addColorStop(0, "rgba(255,190,80," + (0.5 * h) + ")");
  g.addColorStop(0.45, "rgba(255,120,30," + (0.38 * h) + ")");
  g.addColorStop(1, "rgba(255,60,0,0)");
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(x, y, rad, 0, Math.PI * 2); ctx.fill();
  if (L >= 0.5 && !reduceMotion) {
    // little tongues of flame rising off the glove
    var n = L >= 1 ? 4 : 3;
    for (var k = 0; k < n; k++) {
      var ph = vnClock * (7 + k) + i * 1.7 + k * 2.3, sway = Math.sin(ph) * gr * 0.25;
      var fx = x + (k - (n - 1) / 2) * gr * 0.42, tall = gr * (0.9 + 0.5 * (0.5 + 0.5 * Math.sin(ph * 1.3))) * (L >= 1 ? 1.3 : 1);
      ctx.fillStyle = k % 2 ? "rgba(255,200,70,0.55)" : "rgba(255,110,30,0.5)";
      ctx.beginPath();
      ctx.moveTo(fx - gr * 0.2, y - gr * 0.5);
      ctx.quadraticCurveTo(fx - gr * 0.25 + sway, y - gr * 0.5 - tall * 0.6, fx + sway * 1.4, y - gr * 0.5 - tall);
      ctx.quadraticCurveTo(fx + gr * 0.25 + sway, y - gr * 0.5 - tall * 0.6, fx + gr * 0.2, y - gr * 0.5);
      ctx.closePath(); ctx.fill();
    }
  }
  ctx.restore();
}

// One tongue of flame: wide at the bottom round (x, by), up to a flickering
// tip `h` above it.
function vnTongue(x, by, w, h, sway) {
  ctx.beginPath();
  ctx.moveTo(x - w, by);
  ctx.bezierCurveTo(x - w * 1.1, by - h * 0.45, x - w * 0.3 + sway, by - h * 0.72, x + sway * 1.5, by - h);
  ctx.bezierCurveTo(x + w * 0.3 + sway, by - h * 0.72, x + w * 1.1, by - h * 0.45, x + w, by);
  ctx.quadraticCurveTo(x, by + w * 0.85, x - w, by);
  ctx.closePath();
}

// A glove on fire: solid flames (they have to read on the light mat at phone
// size), red at the edge, then orange, then a yellow core, with two side
// tongues, rising off the top of the glove. front: a thinner lick drawn over
// the glove.
function drawVnFlame(x, y, gr, k, i, front) {
  if (k <= 0) return;
  var t = vnClock, fl = 0.86 + 0.1 * Math.sin(t * 23 + i * 1.9) + 0.06 * Math.sin(t * 41 + i * 0.7);
  var h = gr * 3.9 * k * fl, w = gr * 1.2 * (0.55 + 0.45 * k), by = y - gr * 0.05;
  ctx.save();
  if (front) {
    ctx.globalAlpha = 0.8;
    ctx.fillStyle = "#ff9a1f"; vnTongue(x + Math.sin(t * 13 + i) * gr * 0.15, y - gr * 0.25, w * 0.5, h * 0.75, Math.sin(t * 11 + i) * gr * 0.3); ctx.fill();
    ctx.fillStyle = "#ffe36b"; vnTongue(x, y - gr * 0.3, w * 0.28, h * 0.45, Math.sin(t * 15 + i) * gr * 0.2); ctx.fill();
    ctx.restore();
    return;
  }
  var halo = ctx.createRadialGradient(x, y - gr * 0.6, gr * 0.4, x, y - gr * 0.6, gr * 2.6);
  halo.addColorStop(0, "rgba(255,140,30," + (0.42 * k) + ")"); halo.addColorStop(1, "rgba(255,80,0,0)");
  ctx.fillStyle = halo; ctx.beginPath(); ctx.arc(x, y - gr * 0.6, gr * 2.6, 0, Math.PI * 2); ctx.fill();
  [-1, 1].forEach(function (s) { // the side tongues
    ctx.fillStyle = "#e8340c";
    vnTongue(x + s * w * 0.8, by - gr * 0.1, w * 0.45, h * (0.5 + 0.12 * Math.sin(t * 17 + i + s)), s * gr * 0.35 + Math.sin(t * 9 + s) * gr * 0.15);
    ctx.fill();
  });
  ctx.lineJoin = "round";
  [[1, "#e8340c", "#8f1a00"], [0.68, "#ff8c1a", null], [0.4, "#ffe066", null]].forEach(function (Ly, j) {
    var s = Ly[0], sway = Math.sin(t * 9 + i * 2 + j * 0.8) * gr * 0.3 * s;
    vnTongue(x, by - j * gr * 0.12, w * s, h * s, sway);
    ctx.fillStyle = Ly[1]; ctx.fill();
    if (Ly[2]) { ctx.lineWidth = Math.max(1.2, gr * 0.1); ctx.strokeStyle = Ly[2]; ctx.stroke(); }
  });
  ctx.restore();
}

// His hands level: five pieces under his health bar, orange running to
// white hot.
function drawVnHandsBar(b, o) {
  var pinned = (o.grapple && o.grapple.finisher && o.grapple.phase !== "carry") || o.rnc;
  if (pinned) return;
  var bw = 64, bh = 8, bx = b.x - bw / 2, by = b.y - b.r - 18;
  if (by < 4) by = b.y + b.r + 10;
  var y = by + bh + 2, h = 6, segs = 5, gp = 2, sw = (bw - gp * (segs - 1)) / segs, L = b.vn.L, full = L >= 1;
  ctx.save();
  for (var i = 0; i < segs; i++) {
    var sx = bx + i * (sw + gp), k = Math.max(0, Math.min(1, L * segs - i));
    ctx.fillStyle = theme.grid; ctx.fillRect(sx, y, sw, h);
    if (k > 0) {
      ctx.fillStyle = full ? (Math.sin(vnClock * 16) > 0 ? "#fff3c4" : "#ff8a1f") : mixHex("#ff8a1f", "#ffd34d", i / (segs - 1));
      ctx.fillRect(sx, y, sw * k, h);
    }
    ctx.lineWidth = 1.5; ctx.strokeStyle = theme.wall; ctx.strokeRect(sx, y, sw, h);
  }
  ctx.restore();
}

// Both arms up holding the Myanmar flag over his head.
function drawVnFlagUp(b) {
  var r = b.r, t = b.vnFlag.t, up = Math.min(1, t / 0.35), ee = up * up * (3 - 2 * up);
  var lift = r * (0.4 + 0.8 * ee), wav = Math.sin(t * 6);
  var hands = [-1, 1].map(function (s) {
    return { x: b.x + s * r * (0.95 + 0.05 * wav * s), y: b.y - r * 0.55 - lift + s * wav * r * 0.05, sx: b.x + s * r * 0.62, sy: b.y - r * 0.45, s: s };
  });
  // the flag between his gloves, rippling
  var x0 = hands[0].x, x1 = hands[1].x, yb = (hands[0].y + hands[1].y) / 2 - r * 0.15, hgt = r * 1.25, n = 14;
  ctx.save();
  ctx.globalAlpha = ee;
  var cols = [VN_FLAG.yellow, VN_FLAG.green, VN_FLAG.red];
  for (var i = 0; i < n; i++) {
    var u0 = i / n, u1 = (i + 1) / n;
    var w0 = Math.sin(t * 7 - u0 * 6) * r * 0.1 * Math.sin(u0 * Math.PI), w1 = Math.sin(t * 7 - u1 * 6) * r * 0.1 * Math.sin(u1 * Math.PI);
    var xa = x0 + (x1 - x0) * u0, xb = x0 + (x1 - x0) * u1;
    for (var sI = 0; sI < 3; sI++) {
      var ya0 = yb - hgt + sI * hgt / 3, ya1 = ya0 + hgt / 3 + 0.6;
      ctx.fillStyle = cols[sI];
      ctx.beginPath(); ctx.moveTo(xa, ya0 + w0); ctx.lineTo(xb + 0.6, ya0 + w1); ctx.lineTo(xb + 0.6, ya1 + w1); ctx.lineTo(xa, ya1 + w0); ctx.closePath(); ctx.fill();
    }
  }
  // the white star in the middle
  var cx = (x0 + x1) / 2, cy = yb - hgt / 2 + Math.sin(t * 7 - 3) * r * 0.1, so = hgt * 0.42;
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  for (var q = 0; q < 10; q++) {
    var a = -Math.PI / 2 + q * Math.PI / 5, rr = q % 2 ? so * 0.4 : so;
    if (q === 0) ctx.moveTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr); else ctx.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr);
  }
  ctx.closePath(); ctx.fill();
  ctx.globalAlpha = 1;
  ctx.strokeStyle = theme.wall; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(x0, yb - hgt); ctx.lineTo(x0, yb); ctx.moveTo(x1, yb - hgt); ctx.lineTo(x1, yb); ctx.stroke();
  ctx.restore();
  hands.forEach(function (h) { vnArm(b, h.sx, h.sy, h.x, h.y, r * 0.3, -Math.PI / 2, h.s); });
}

// Over both fighters: the chain counter, "x5", under him. A chain he's
// keeping (his gloves on fire) stays lit: on fire, with a fuse burning down
// under it.
function drawVanOver() {
  balls.forEach(function (b) {
    var v = b.vn;
    if (!v || !v.cnt || v.cnt.n < 2 || !b.alive || b.vnFlag) return;
    var c = v.cnt, live = v.chain > 0 && !c.broke, kept = !!(v.kept && live);
    var a = live ? 1 : Math.max(0, Math.min(1, (c.hold + 0.35) / 0.35));
    if (a <= 0) return;
    // Under him (the space over his head is full of BLOCK, WHIFF and hit
    // numbers), leaning away from them; over his bars when he's low down.
    var o = balls[1 - b.id], n = c.n, side = o.x >= b.x ? -1 : 1;
    c.side = c.side == null ? side : c.side + (side - c.side) * 0.15;
    var size = Math.min(50, 24 + n * 2.4) * (1 + c.pop * 0.35);
    if (kept) size = Math.max(size, 44) * (1 + 0.05 * Math.sin(vnClock * 14));
    var y = b.y + b.r + 24;
    if (y > H - 22) { var by = b.y - b.r - 18; y = by < 4 ? b.y : by - 20; }
    var x = Math.min(W - 34, Math.max(34, b.x + c.side * b.r * 0.55));
    var col = c.broke ? "#a7a7a7" : VN_HEAT[Math.min(VN_HEAT.length - 1, Math.max(0, Math.floor((n - 2) / 2)))];
    ctx.save();
    ctx.globalAlpha = a;
    ctx.translate(x, y);
    if (c.broke) { ctx.translate(Math.sin(vnClock * 70) * 2, (1 - a) * 10); ctx.rotate(-0.15 * (1 - a)); }
    else ctx.rotate(-0.08);
    ctx.font = "italic 900 " + Math.round(size) + "px \"Barlow Condensed\", \"Arial Narrow\", sans-serif";
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    var txt = "x" + n, tw = ctx.measureText(txt).width;
    if (kept) { // flames up behind the number
      for (var q = 0; q < 4; q++) {
        var fx = (q - 1.5) * tw * 0.3, ph = vnClock * (8 + q * 1.3) + q * 2.1;
        ctx.fillStyle = q % 2 ? "#ff7a1a" : "#e8340c";
        vnTongue(fx, -size * 0.05, size * 0.2, size * (0.75 + 0.2 * Math.sin(ph)), Math.sin(ph * 0.7) * size * 0.1);
        ctx.fill();
      }
      ctx.fillStyle = "#ffcf3a";
      vnTongue(0, -size * 0.1, size * 0.22, size * (0.6 + 0.12 * Math.sin(vnClock * 11)), Math.sin(vnClock * 7) * size * 0.08); ctx.fill();
    }
    ctx.lineJoin = "round"; ctx.lineWidth = 7; ctx.strokeStyle = theme.floor; ctx.strokeText(txt, 0, 0);
    if (kept) { ctx.lineWidth = 3.5; ctx.strokeStyle = "#d42a00"; ctx.strokeText(txt, 0, 0); }
    else if (!c.broke && n >= 6) { ctx.lineWidth = 2.5; ctx.strokeStyle = "rgba(255,120,30,0.9)"; ctx.strokeText(txt, 0, 0); }
    ctx.fillStyle = kept ? "#fff6c9" : col; ctx.fillText(txt, 0, 0);
    if (kept) { // the fuse: how long he keeps it
      var fw = Math.max(tw, 40), k = Math.max(0, v.kept.t / v.kept.max), fy = size * 0.52;
      ctx.fillStyle = theme.floor; ctx.fillRect(-fw / 2 - 2, fy - 2, fw + 4, 9);
      ctx.fillStyle = "#5a2a12"; ctx.fillRect(-fw / 2, fy, fw, 5);
      ctx.fillStyle = "#ff8a1f"; ctx.fillRect(-fw / 2, fy, fw * k, 5);
      ctx.fillStyle = Math.sin(vnClock * 40) > 0 ? "#ffffff" : "#ffe066"; // the spark at the burning end
      ctx.beginPath(); ctx.arc(-fw / 2 + fw * k, fy + 2.5, 4.5, 0, Math.PI * 2); ctx.fill();
    }
    if (c.broke) { // cracked through
      ctx.strokeStyle = theme.floor; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(-tw * 0.55, -size * 0.3); ctx.lineTo(-tw * 0.1, size * 0.05); ctx.lineTo(tw * 0.15, -size * 0.1); ctx.lineTo(tw * 0.55, size * 0.3); ctx.stroke();
    }
    ctx.restore();
  });
}

// ---------------------------------------------------------------- fighter art (fighter-art.js)

// tattoos.blessed: his chest piece. "Blessed" in script across the chest
// under a pair of spread angel wings, red roses on both pecs, praying hands
// down the middle, and the clock on his right shoulder.
function drawVanChest(c, r, lw, contained, look) {
  var ink = "rgba(16,18,26,0.85)", grey = "rgba(28,32,44,0.42)", tall = contained ? 0.86 / 0.59 : 1;
  c.save();
  // the wings: spread out from under his chin along the collarbones, grey
  // shading with three rows of feather edges
  [-1, 1].forEach(function (s) {
    c.save(); c.scale(s, 1);
    var wing = function () {
      c.beginPath();
      c.moveTo(r * 0.05, -r * 0.6);
      c.quadraticCurveTo(r * 0.3, -r * 0.74, r * 0.66, -r * 0.66);
      c.quadraticCurveTo(r * 0.6, -r * 0.56, r * 0.5, -r * 0.5);
      c.quadraticCurveTo(r * 0.32, -r * 0.48, r * 0.12, -r * 0.47);
      c.closePath();
    };
    c.fillStyle = grey; wing(); c.fill();
    c.save(); wing(); c.clip();
    c.strokeStyle = "rgba(16,18,26,0.5)"; c.lineWidth = lw(0.014);
    for (var row = 0; row < 3; row++) {
      c.beginPath();
      for (var f = 0; f < 7 - row; f++) {
        var x0 = r * (0.1 + f * 0.085 + row * 0.04), y0 = -r * (0.64 - row * 0.055) + f * r * 0.004;
        c.moveTo(x0, y0); c.quadraticCurveTo(x0 + r * 0.04, y0 + r * 0.06, x0 + r * 0.085, y0);
      }
      c.stroke();
    }
    c.restore();
    c.restore();
  });
  // praying hands down the middle, faint grey
  c.save();
  c.translate(0, -r * 0.02); c.fillStyle = "rgba(28,32,44,0.3)";
  [-1, 1].forEach(function (s) {
    c.beginPath(); c.ellipse(s * r * 0.028, 0, r * 0.034, r * 0.16, s * 0.08, 0, Math.PI * 2); c.fill();
  });
  c.strokeStyle = "rgba(16,18,26,0.4)"; c.lineWidth = lw(0.012);
  c.beginPath(); c.moveTo(0, -r * 0.15); c.lineTo(0, r * 0.15); c.stroke();
  c.restore();
  // roses: two on his left pec (screen right), one on his right
  [[0.36, -0.2, 0.085], [0.17, -0.12, 0.07], [-0.3, -0.15, 0.08]].forEach(function (p) {
    c.save(); c.translate(r * p[0], r * p[1]); c.scale(1, tall * 0.8);
    var rr = r * p[2];
    c.fillStyle = "rgba(60,80,60,0.55)"; // leaves
    c.beginPath(); c.ellipse(-rr * 1.05, rr * 0.5, rr * 0.6, rr * 0.25, -0.5, 0, Math.PI * 2); c.fill();
    c.beginPath(); c.ellipse(rr * 1.05, rr * 0.45, rr * 0.6, rr * 0.25, 0.5, 0, Math.PI * 2); c.fill();
    c.fillStyle = "rgba(170,20,38,0.88)";
    c.beginPath(); c.arc(0, 0, rr, 0, Math.PI * 2); c.fill();
    c.strokeStyle = "rgba(70,6,16,0.85)"; c.lineWidth = lw(0.012);
    c.beginPath();
    for (var q = 0; q <= 22; q++) { var a = q * 0.6, sr = rr * 0.85 * (1 - q / 24); if (q === 0) c.moveTo(Math.cos(a) * sr, Math.sin(a) * sr); else c.lineTo(Math.cos(a) * sr, Math.sin(a) * sr); }
    c.stroke();
    c.restore();
  });
  // "Blessed" across the chest
  c.save();
  c.translate(-r * 0.02, -r * 0.36); c.rotate(-0.05); c.scale(1, tall * 0.75);
  c.font = "italic 700 " + (r * 0.23) + "px 'Snell Roundhand', 'Brush Script MT', 'Segoe Script', 'Apple Chancery', cursive";
  c.textAlign = "center"; c.textBaseline = "middle";
  c.fillStyle = ink;
  c.fillText("Blessed", 0, 0);
  c.restore();
  // the clock on his right shoulder (screen left)
  c.save();
  c.translate(-r * 0.84, -r * 0.36); c.scale(1, tall * 0.85);
  var cr = r * 0.085;
  c.strokeStyle = ink; c.lineWidth = lw(0.014);
  c.beginPath(); c.arc(0, 0, cr, 0, Math.PI * 2); c.stroke();
  for (var tk = 0; tk < 12; tk++) { var ta = tk * Math.PI / 6; c.beginPath(); c.moveTo(Math.cos(ta) * cr * 0.75, Math.sin(ta) * cr * 0.75); c.lineTo(Math.cos(ta) * cr * 0.92, Math.sin(ta) * cr * 0.92); c.stroke(); }
  c.beginPath(); c.moveTo(0, 0); c.lineTo(0, -cr * 0.65); c.moveTo(0, 0); c.lineTo(cr * 0.45, cr * 0.2); c.stroke();
  c.restore();
  c.restore();
}

// shortsStyle "acheik": his UFC 331 kit, red with darker wave bands (the
// acheik weave of Myanmar's traditional fabric) picked out in gold, the
// flag's yellow, green and red down the outside of each leg, the flag on his
// left leg and "JOSHUA 1:9" (a verse on his real shorts) on his right.
function drawVanShorts(c, r, look, sTop, band, name) {
  if (look.vanReal) return drawVanRealShorts(c, r, look, sTop, band, name); // Joe's look from his photos (van-skin.js)
  var dark = shadeHex(look.shorts, -0.45), gold = look.accent || "#e8b923";
  c.save();
  c.beginPath(); c.rect(-r, sTop + band, r * 2, r - sTop - band); c.clip();
  // the wave bands
  for (var row = 0; row < 5; row++) {
    var y0 = sTop + band + r * 0.05 + row * r * 0.12;
    c.strokeStyle = dark; c.lineWidth = Math.max(1, r * 0.045); c.globalAlpha = 0.75;
    c.beginPath();
    for (var u = 0; u <= 40; u++) {
      var x = -r + u * r * 0.05, y = y0 + Math.sin(u * 0.9 + row * 1.6) * r * 0.035;
      if (u === 0) c.moveTo(x, y); else c.lineTo(x, y);
    }
    c.stroke();
    c.strokeStyle = gold; c.lineWidth = Math.max(0.6, r * 0.012); c.globalAlpha = 0.7;
    c.beginPath();
    for (var u2 = 0; u2 <= 40; u2++) {
      var x2 = -r + u2 * r * 0.05, y2 = y0 - r * 0.035 + Math.sin(u2 * 0.9 + row * 1.6) * r * 0.035;
      if (u2 === 0) c.moveTo(x2, y2); else c.lineTo(x2, y2);
    }
    c.stroke();
  }
  c.globalAlpha = 1;
  // the flag's three colours down the outside seam of each leg
  [-1, 1].forEach(function (s) {
    [VN_FLAG.yellow, VN_FLAG.green, VN_FLAG.red].forEach(function (col, i) {
      c.fillStyle = col;
      var x = s * r * (0.9 - i * 0.05);
      c.beginPath(); c.moveTo(x - r * 0.025, sTop + band); c.lineTo(x + r * 0.025, sTop + band); c.lineTo(x + r * 0.025 - s * r * 0.06, r); c.lineTo(x - r * 0.025 - s * r * 0.06, r); c.closePath(); c.fill();
    });
  });
  // the flag on his left leg (screen right)
  var fw = r * 0.26, fh = r * 0.16, fx0 = r * 0.3, fy0 = sTop + band + r * 0.1;
  [VN_FLAG.yellow, VN_FLAG.green, VN_FLAG.red].forEach(function (col, i) { c.fillStyle = col; c.fillRect(fx0, fy0 + i * fh / 3, fw, fh / 3 + 0.4); });
  c.fillStyle = "#ffffff";
  c.beginPath();
  for (var q = 0; q < 10; q++) {
    var a = -Math.PI / 2 + q * Math.PI / 5, rr = q % 2 ? fh * 0.17 : fh * 0.42;
    var sx = fx0 + fw / 2 + Math.cos(a) * rr, sy = fy0 + fh / 2 + Math.sin(a) * rr;
    if (q === 0) c.moveTo(sx, sy); else c.lineTo(sx, sy);
  }
  c.closePath(); c.fill();
  c.strokeStyle = "rgba(0,0,0,0.35)"; c.lineWidth = Math.max(0.6, r * 0.01); c.strokeRect(fx0, fy0, fw, fh);
  // JOSHUA 1:9 on his right leg (screen left), near the hem
  c.fillStyle = gold;
  c.font = "900 " + (r * 0.075) + "px Arial, Helvetica, sans-serif";
  c.textAlign = "center"; c.textBaseline = "middle";
  c.fillText("JOSHUA 1:9", -r * 0.24, r * 0.8);
  c.restore();
}

// look.vanGoatee: his thin moustache and the short beard on his chin, both
// fine stubble rather than solid hair.
function drawVanGoatee(c, r, look, line, lw) {
  if (look.vanReal) return drawVanRealHead(c, r, look, line, lw); // Joe's look from his photos (van-skin.js)
  var bc = look.beardColor || look.hairColor, gr = artRand(731);
  var stache = function () {
    c.beginPath();
    c.moveTo(-r * 0.2, -r * 0.4);
    c.quadraticCurveTo(-r * 0.1, -r * 0.455, 0, -r * 0.445);
    c.quadraticCurveTo(r * 0.1, -r * 0.455, r * 0.2, -r * 0.4);
    c.quadraticCurveTo(r * 0.1, -r * 0.425, 0, -r * 0.42);
    c.quadraticCurveTo(-r * 0.1, -r * 0.425, -r * 0.2, -r * 0.4);
    c.closePath();
  };
  var chin = function () {
    c.beginPath();
    c.moveTo(-r * 0.12, -r * 0.37);
    c.quadraticCurveTo(0, -r * 0.39, r * 0.12, -r * 0.37);
    c.quadraticCurveTo(r * 0.16, -r * 0.29, r * 0.1, -r * 0.235);
    c.quadraticCurveTo(0, -r * 0.2, -r * 0.1, -r * 0.235);
    c.quadraticCurveTo(-r * 0.16, -r * 0.29, -r * 0.12, -r * 0.37);
    c.closePath();
  };
  c.save();
  [stache, chin].forEach(function (shape, i) {
    c.globalAlpha = i ? 0.2 : 0.5; c.fillStyle = bc; shape(); c.fill();
    c.save(); shape(); c.clip();
    c.globalAlpha = i ? 0.45 : 0.7; c.fillStyle = bc;
    for (var k = 0; k < (i ? 60 : 50); k++) c.fillRect((gr() * 2 - 1) * r * 0.2, -r * (i ? 0.39 : 0.46) + gr() * r * (i ? 0.19 : 0.07), r * 0.013, r * 0.013);
    c.restore();
  });
  c.restore();
}


// ---------------------------------------------------------------- gallery (gallery.js)

function vanSpecialInfo(sp) {
  return "His gloves catch fire: he stops for " + secs(sp.call) + " while they light (the tell, ON FIRE!), then they burn for " + secs(sp.time) +
    ". While they burn, a combo that finishes with his chain at x" + sp.keepMin + " or more doesn't reset: he keeps that chain (and the damage and crit chance that go with it) for " +
    secs(sp.keep) + ", the count under him lit up and on fire with a fuse burning down. Start the next combo before the fuse runs out and it carries on from there, up to " +
    sp.maxMult + "x damage. A blocked, slipped or missed punch still breaks it. Charges in " + secs(sp.chargeTime) + "; each clean hit takes " + secs(sp.hitCut) + " off, each punch " + secs(sp.punchCut) + ".";
}

function vanGalleryMoves(ch, add) {
  var v = ch.van, cb = v.combos, hh = v.hotHands, lv = v.level, hk = v.hook;
  if (v.highGuard) add("🛡️", "High guard", "His hands are always up by his head. The one that isn't punching stays up there.");
  if (cb) add("👊", "Combos", "Long combinations off both hands instead of single punches, " + Math.round(cb.punches[0]) + " to " + Math.round(cb.punches[1]) + " at a time (" + ch.punch.damage + " a punch to start), walking in behind them. They get longer as his hands get better.");
  if (hh) add("🔥", "Hot hands", "Every punch that lands in a combo makes the next one hit harder (+" + Math.round(hh.step[0] * 100) + "% to +" + Math.round(hh.step[1] * 100) + "% each, up to " + hh.maxMult + "x) and more likely to crit (" + hh.critBase + "% plus " + hh.critStep[0] + "-" + hh.critStep[1] + "% each, up to " + hh.critMax + "%, " + hh.critMult + "x). One blocked, slipped or missed breaks the chain. The count goes up under him: x5, x7...");
  if (hk) add("🪝", "Left hook", (ch.hooks && ch.hooks.finisherChance ? ch.hooks.finisherChance + "% of his combos end in a left hook that comes round from the side. " : "") + "A hook that crits is a big LEFT HOOK, the commentator calls it, and " + hk.down + "% of the time it knocks them down for " + secs(hk.downTime) + ". He lets them get up.");
  if (lv) add("🥊", "Hands level", "His hands get better through the fight: every punch he lands, and much more every clean combo (all of it landed, \"CLEAN x7!\"). It makes his combos longer and truer and takes up to " + lv.pierce[1] + " points off their block chance. His gloves glow hotter as it climbs, \"HOT HANDS!\" at half and \"MAX HANDS!\" when it's full.");
  if (v.durable) add("🧱", "Durable", "Hard to hurt: a single strike of " + v.durable.over + " or more does " + Math.round(v.durable.mult * 100) + "% of its damage.");
  if (ch.tdd) add("🤼", "Takedown defense", "Sprawls on " + ch.tdd.sprawlChance + "% of takedown shots (\"STUFFED\") and punches straight back.");
  if (ch.speedMult && ch.speedMult < 1) add("👣", "Footwork", "A flyweight, but not as quick on his feet as the other small guys: " + Math.round(ch.speedMult * 100) + "% of a flyweight's speed.");
  if (v.winFlag) add("🇲🇲", "Myanmar flag", "When he wins he holds the flag of Myanmar up over his head.");
}

function vanGallerySounds(groups, synth) {
  groups.push({ title: "Joshua Van", items: [
    synth("Chain", "Each punch that lands in a long chain, climbing higher.", function () { playVnChain(6); }),
    synth("Chain broken", "A punch blocked or missed: the chain breaks.", function () { playVnBreak(); }),
    synth("Clean combo", "Every punch in a combo landed.", function () { playVnClean(7); }),
    synth("Crit", "A critical punch at the end of a chain.", function () { playVnCrit(); }),
    synth("Left hook", "A big left hook landing.", function () { playVnHook(); }),
    synth("Hands level", "HOT HANDS! and MAX HANDS!", function () { playVnLevel(true); }),
    synth("On fire", "His gloves catching fire.", function () { playVnIgnite(); }),
    synth("Burning", "The crackle while his gloves burn.", function () { playVnCrackle(); }),
    synth("Kept", "A combo ending on fire: he keeps the chain.", function () { playVnKeep(); }),
    synth("Fizzle", "The chain he kept running out.", function () { playVnFizzle(); })
  ] });
}

// ---------------------------------------------------------------- sound
// Synth stand-ins, like every move's sounds until Joe records real ones.

function vnAudio(fn) {
  try {
    var ac = getAudioCtx();
    if (!ac) return;
    if (ac.state === "suspended") ac.resume();
    fn(ac, ac.currentTime);
  } catch (e) { /* never let audio break the game */ }
}
// A chain punch landing: a bright tick a step higher for every one.
function playVnChain(n) {
  vnAudio(function (ac, t) { var f = 520 * Math.pow(2, Math.min(18, n - 3) / 12); caneTone(ac, t + 0.01, "triangle", f, f * 1.01, 0.08, 0.07); });
}
// The chain breaking: a dull thunk sliding down.
function playVnBreak() {
  vnAudio(function (ac, t) { caneTone(ac, t, "sine", 260, 110, 0.18, 0.18); caneBurst(ac, t, 700, 1.2, 0.12, 0.08); });
}
// A clean combo: a quick climbing run.
function playVnClean(n) {
  vnAudio(function (ac, t) {
    [659, 784, 988, 1319].slice(0, n >= 7 ? 4 : 3).forEach(function (f, i) { caneTone(ac, t + i * 0.06, "triangle", f, f, 0.16, 0.14); });
  });
}
// A crit: a heavy crack with a sizzle on top.
function playVnCrit() {
  vnAudio(function (ac, t) { caneBurst(ac, t, 1800, 1.6, 0.5, 0.06); caneBurst(ac, t + 0.01, 5200, 0.8, 0.18, 0.2); caneTone(ac, t, "sine", 160, 60, 0.4, 0.16); });
}
// A big left hook: a swish round the side, then a deep thud.
function playVnHook() {
  vnAudio(function (ac, t) { caneBurst(ac, t, 2400, 0.9, 0.22, 0.09); caneTone(ac, t + 0.06, "sine", 120, 45, 0.6, 0.28); caneBurst(ac, t + 0.06, 900, 1.4, 0.45, 0.1); });
}
// The hands level going up: a whoosh of flame and a chime.
function playVnLevel(top) {
  vnAudio(function (ac, t) {
    caneBurst(ac, t, 900, 0.6, 0.35, 0.45);
    [880, 1109, 1319].concat(top ? [1760] : []).forEach(function (f, i) { caneTone(ac, t + 0.05 + i * 0.07, "sine", f, f, 0.2, 0.3); });
  });
}
// His gloves catching: a low whoomp of flame going up.
function playVnIgnite() {
  vnAudio(function (ac, t) { caneTone(ac, t, "sine", 70, 140, 0.5, 0.35); caneBurst(ac, t, 500, 0.5, 0.5, 0.55); caneBurst(ac, t + 0.08, 2600, 0.7, 0.18, 0.4); });
}
// Burning: a few dry crackles.
function playVnCrackle() {
  vnAudio(function (ac, t) { for (var i = 0; i < 3; i++) caneBurst(ac, t + i * (0.03 + nativeRandom() * 0.05), 3000 + nativeRandom() * 2500, 2.5, 0.05 + nativeRandom() * 0.05, 0.03); });
}
// He keeps the chain: a hiss and a rising tone.
function playVnKeep() {
  vnAudio(function (ac, t) { caneBurst(ac, t, 4200, 0.8, 0.16, 0.3); caneTone(ac, t, "triangle", 660, 990, 0.1, 0.22); });
}
// The chain he kept running out: a fizzle sliding down.
function playVnFizzle() {
  vnAudio(function (ac, t) { caneBurst(ac, t, 1800, 0.7, 0.12, 0.35); caneTone(ac, t, "sine", 500, 180, 0.08, 0.3); });
}
