// The katana duel: Tony Ferguson's katanas against Jiří Procházka's samurai
// (Joe, 2026-11-21). With both of them out, they used to slash at each
// other at the same time and trade wildly. Now, as soon as both have their
// blades out, the duel takes over the two of them:
//
//   set     they square off side by side, "KATANA DUEL!"
//   turns   `exchanges` clear turns: one attacks, the other blocks or parries
//           (BLOCKED! / PARRIED!), then they swap. Nothing gets through.
//   lock    the blades meet and lock, sparking, then burst apart
//   cut     the cutscene: black bars, the camera pushes in, the mat goes dusk
//           red with petals blowing across it. Tony flash-steps in and Jiří
//           weaves it, Tony's cyclone and Jiří weaves twice more, Jiří's X cut
//           and two more cuts clank off Tony's turtle shell, Tony comes out
//           spinning in the shell into Jiří's crossed blades, a standoff, and
//           they dash past each other. They freeze, backs turned... and the
//           loser's cut opens: `damage` (massive) and a wall slam. The winner
//           is Tony `tonyWins`% of the time.
//
// Then both put their blades away (each special ends). Nothing else starts
// while it's on (sceneLocked, scene-lock.js) and neither special's clock runs
// out during it: both are held, like a blade lock (swordDuelLocked, sword.js).
// Only their own two arms: Tony's blades out of his elbows (katArm,
// ferguson-katanas.js), Jiří's two swords in his hands (jpArm, prochazka.js).
//
// Numbers: `special.duel` in Tony's character file (leave it out for the
// defaults below; `on: false` turns the duel off and they fight as before).
"use strict";

var KD_DEFAULT = { on: true, exchanges: 4, tonyWins: 50, damage: 120, knockback: 1150, wallSlams: 1, slamDamage: 6 };
var KD_SET = 0.55, KD_EX = 1.05, KD_LOCK = 1.0;
var KD_WIND = 0.34, KD_SWING = 0.14, KD_HIT = 0.44;
// The cutscene's beats (seconds from its start).
var KD_C = { flash: 0.9, cyclone: 2.05, jiri: 3.15, spin: 4.75, stand: 5.75, pass: 6.85, zan: 7.25, reveal: 8.35, out: 9.35, end: 10.0 };
var kDuel = null;   // the duel, while it's on
var kdPetals = [];  // petals blowing across the mat in the cutscene
var kdCuts = [];    // the cut on the loser
var kdBuf = null;

function kdCfg(t) { var d = t && t.char && t.char.special && t.char.special.duel; return Object.assign({}, KD_DEFAULT, d || {}); }
function kdE(u) { u = Math.max(0, Math.min(1, u)); return u * u * (3 - 2 * u); }
function kdEO(u) { u = Math.max(0, Math.min(1, u)); return 1 - (1 - u) * (1 - u); }
function kdC01(u) { return Math.max(0, Math.min(1, u)); }
function kdLerp(a, b, u) { return a + (b - a) * u; }
function kdLerpA(a, c, u) { var d = Math.atan2(Math.sin(c - a), Math.cos(c - a)); return a + d * u; }

function resetKatanaDuel() { kDuel = null; kdPetals = []; kdCuts = []; }

// Both of them held by the duel (swordDuelLocked, sword.js; updateKatanas,
// ferguson-katanas.js; updateSamurai, prochazka.js).
function katanaDuelHeld(b) { return !!(kDuel && b && (b === kDuel.T || b === kDuel.J) && b !== kDuel.freed); }

// ---------------------------------------------------------------- starting

function kdReady(b, on) {
  return on(b) && b.alive && !b.koOut && b.igbb.phase === "close" && !b.igbb.kdDone && !b.slam && !((b.checkStun || 0) > 0);
}
function kdTryStart() {
  if (kDuel || over || !started || !balls || balls.length < 2) return;
  var T = null, J = null;
  balls.forEach(function (b) { if (katanaOn(b)) T = b; else if (samuraiOn(b)) J = b; });
  if (!T || !J || !kdCfg(T).on) return;
  if (!kdReady(T, katanaOn) || !kdReady(J, samuraiOn)) return;
  if (sceneLocked()) return; // (scene-lock.js)
  var cfg = kdCfg(T), r = Math.max(T.r, J.r), D = T.r + J.r + 80;
  var cx = Math.min(W - D / 2 - r - 12, Math.max(D / 2 + r + 12, (T.x + J.x) / 2));
  var cy = Math.min(H - r * 1.6, Math.max(r * 2.6, (T.y + J.y) / 2));
  [T, J].forEach(function (b) {
    clearActions(b);
    b.igbb.sl = null; b.igbb.kdDone = true;
    b.vx = 0; b.vy = 0;
  });
  kDuel = { T: T, J: J, cfg: cfg, phase: "set", t: 0, cx: cx, cy: cy, D: D, side: T.x <= J.x ? -1 : 1,
    from: { T: { x: T.x, y: T.y }, J: { x: J.x, y: J.y } }, first: Math.random() < 0.5 ? "T" : "J", n: -1,
    tonyWins: Math.random() * 100 < cfg.tonyWins, cam: { z: 1, bars: 0, grade: 0, flash: 0 }, ghosts: { T: [], J: [] }, said: {} };
  floater(cx, cy - r - 60, "KATANA DUEL!", "crit");
  playKatanaDraw(); // (ferguson.js)
  crowdReact(0.8);
}

// ---------------------------------------------------------------- every frame

// From update.js, every frame.
function tickKatanaDuel(dt) {
  kdTickPetals(dt);
  kdCuts.forEach(function (f) { f.t += dt; });
  kdCuts = kdCuts.filter(function (f) { return f.t < f.max; });
  if (!kDuel) { kdTryStart(); if (!kDuel) return; }
  var K = kDuel, T = K.T, J = K.J;
  var revealed = K.phase === "cut" && K.revealed;
  if (balls[T.id] !== T || balls[J.id] !== J || (!revealed && (!T.alive || !J.alive || over || !katanaOn(T) || !samuraiOn(J)))) { kdEnd(); return; }
  K.t += dt;
  K.cam.flash = Math.max(0, K.cam.flash - dt * 3);
  ["T", "J"].forEach(function (k) { var g = K.ghosts[k]; g.forEach(function (q) { q.t += dt; }); K.ghosts[k] = g.filter(function (q) { return q.t < 0.35; }); });
  if (K.phase === "set") kdTickSet(K, dt);
  else if (K.phase === "turns") kdTickTurns(K, dt);
  else if (K.phase === "lock") kdTickLock(K, dt);
  else kdTickCut(K, dt);
  if (!kDuel) return;
  [T, J].forEach(function (b) { if (b !== K.freed) { b.vx = 0; b.vy = 0; } });
}

// Where each of them stands: Tony on `side` of the middle, Jiří across.
function kdSpot(K, who, side) {
  var s = side == null ? K.side : side, d = who === "T" ? s : -s;
  return { x: K.cx + d * K.D / 2, y: K.cy };
}
function kdPlace(b, p) { b.x = Math.min(W - b.r, Math.max(b.r, p.x)); b.y = Math.min(H - b.r, Math.max(b.r, p.y)); }
// Along the line between the spots: +1 toward the other one.
function kdToward(K, who) { return who === "T" ? -K.side : K.side; }

function kdTickSet(K, dt) {
  var u = kdE(K.t / KD_SET);
  ["T", "J"].forEach(function (k) { var s = kdSpot(K, k), f = K.from[k]; kdPlace(K[k], { x: kdLerp(f.x, s.x, u), y: kdLerp(f.y, s.y, u) }); });
  kdCam(K, 1.25 * u + (1 - u), 0, 0);
  if (K.t >= KD_SET) { K.phase = "turns"; K.t = 0; K.n = 0; K.hit = false; }
}

// ---- the turns: one attacks, the other blocks or parries

function kdAttacker(K) { var a = K.n % 2 === 0 ? K.first : (K.first === "T" ? "J" : "T"); return a; }
function kdTickTurns(K, dt) {
  var a = kdAttacker(K), d = a === "T" ? "J" : "T", e = K.t, A = K[a], Dd = K[d];
  var sa = kdSpot(K, a), sd = kdSpot(K, d), dirA = kdToward(K, a);
  // The attacker: a little coil back, then lunging into the cut, knocked back off the block.
  var off = 0;
  if (e < KD_WIND) off = -8 * kdE(e / KD_WIND);
  else if (e < KD_HIT) off = kdLerp(-8, 30, kdEO((e - KD_WIND) / (KD_HIT - KD_WIND)));
  else off = kdLerp(K.parry ? -22 : 30, 0, kdE((e - KD_HIT) / 0.45)) + (K.parry ? 0 : -12 * Math.sin(kdC01((e - KD_HIT) / 0.2) * Math.PI));
  kdPlace(A, { x: sa.x + dirA * off, y: sa.y });
  // The defender: braced, pushed back a step by it.
  var push = e > KD_HIT ? 12 * Math.sin(kdC01((e - KD_HIT) / 0.4) * Math.PI) : 0;
  kdPlace(Dd, { x: sd.x + dirA * push, y: sd.y }); // (pushed away from the attacker)
  if (!K.started) {
    K.started = true;
    K.parry = K.n % 2 === 1;
    K.both = a === "J" && K.n >= (K.cfg.exchanges || 4) - 2; // Jiří's last one: both swords
    K.aSide = (K.n % 4 < 2 ? 1 : -1);
    playSamuraiGlint(false); // (prochazka.js)
  }
  if (!K.whoosh && e >= KD_WIND) { K.whoosh = true; playElbowSwish(true); }
  if (!K.hit && e >= KD_HIT) {
    K.hit = true;
    var P = kdBlockPoint(K, d);
    clashFx(P.x, P.y, dirA, 0, 1.15, a === "J" ? JP_STEEL : null); // (sword.js)
    playSwordClash(1.1);
    floater(Dd.x, Dd.y - Dd.r - 34, K.parry ? "PARRIED!" : "BLOCKED!", "crit");
    crowdReact(0.55);
  }
  kdCam(K, 1.25, 0, 0);
  if (e >= KD_EX) {
    K.n++; K.t = 0; K.hit = false; K.whoosh = false; K.started = false;
    if (K.n >= (K.cfg.exchanges || 4)) { K.phase = "lock"; K.t = 0; K.sparkT = 0; floater(K.cx, K.cy - K.T.r - 60, "BLADE LOCK!", "crit"); playSwordClash(1.6); crowdReact(1); }
  }
}
// Where the attacker's blade meets the defender's: in front of the defender,
// toward the attacker, a little up.
function kdBlockPoint(K, d) {
  var b = K[d], dir = -kdToward(K, d === "T" ? "J" : "T");
  return { x: b.x + dir * b.r * 1.45, y: b.y - b.r * 0.45 };
}
function kdLockPoint(K) { return { x: (K.T.x + K.J.x) / 2, y: (K.T.y + K.J.y) / 2 - K.T.r * 1.0 }; }

function kdTickLock(K, dt) {
  var u = kdE(K.t / 0.22), push = K.t > 0.22 && K.t < 0.85 ? Math.sin((K.t - 0.22) * 9) * 6 : 0;
  var brk = kdE((K.t - 0.85) / 0.15);
  ["T", "J"].forEach(function (k) {
    var s = kdSpot(K, k), dirIn = kdToward(K, k), inn = K.D * 0.16 * u * (1 - brk) + (k === "T" ? push : -push) * dirIn;
    kdPlace(K[k], { x: s.x + dirIn * inn, y: s.y });
  });
  if (K.t > 0.22 && K.t < 0.85) {
    K.sparkT -= dt;
    if (K.sparkT <= 0) {
      K.sparkT = 0.07;
      var p = kdLockPoint(K);
      for (var i = 0; i < 4 && !reduceMotion; i++) {
        var a = -Math.PI / 2 + (nativeRandom() - 0.5) * 2.6, sp = 120 + nativeRandom() * 260;
        particles.push({ x: p.x, y: p.y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 0.3, max: 0.3, size: 2 + nativeRandom() * 2.5, color: i % 2 ? "#ffffff" : "#fff2c2" });
      }
      if (!reduceMotion) shake = Math.max(shake, 3);
    }
  }
  if (K.t >= 0.85 && !K.broke) {
    K.broke = true;
    var q = kdLockPoint(K);
    clashFx(q.x, q.y, 1, 0, 2, JP_STEEL);
    playSwordClash(1.6);
    K.cam.flash = 0.6;
  }
  kdCam(K, 1.25 + 0.1 * u, 0, 0);
  if (K.t >= KD_LOCK) { K.phase = "cut"; K.t = 0; playSamuraiTaiko(); crowdReact(0.4); }
}

// ---- the cutscene

function kdTickCut(K, dt) {
  var t = K.t, T = K.T, J = K.J, C = KD_C;
  var bars = kdE(t / 0.5) * (1 - kdE((t - C.out) / 0.5));
  var z = 1.25 + 0.3 * kdE(t / 0.9) + 0.25 * kdE((t - C.stand) / 0.8) - 0.15 * kdE((t - C.zan) / 0.5) - 0.65 * kdE((t - C.out) / 0.6);
  kdCam(K, z, bars, bars);
  if (t < 3.0 && !reduceMotion && nativeRandom() < dt * 18) kdPetal();
  if (t > C.stand && t < C.reveal + 0.6 && !reduceMotion && nativeRandom() < dt * 26) kdPetal();
  var sT = kdSpot(K, "T"), sJ = kdSpot(K, "J");
  T.kdPose = null; J.kdPose = null;
  if (t < C.flash) { kdPlace(T, sT); kdPlace(J, sJ); return kdCutDone(K); }
  if (t < C.cyclone) {
    // Tony's flash-step: a crouch, he streaks past, Jiří weaves out of its way.
    var e = t - C.flash, sw = K.side, toX = kdSpot(K, "T", -sw).x;
    if (!K.said.flash) { K.said.flash = true; floater(T.x, T.y - T.r - 30, "FLASH STEP!", "crit"); }
    if (e < 0.22) { kdPlace(T, sT); T.kdPose = { kind: "crouch", k: e / 0.22 }; }
    else if (e < 0.34) {
      if (!K.said.flashGo) { K.said.flashGo = true; playKatanaDraw(); K.fx0 = sT.x; }
      var u = (e - 0.22) / 0.12;
      K.ghosts.T.push({ x: T.x, y: T.y, t: 0 });
      kdPlace(T, { x: kdLerp(sT.x, toX, u), y: sT.y + Math.sin(u * Math.PI) * 8 });
      T.kdPose = { kind: "streak", dir: -sw > 0 ? 0 : Math.PI, from: K.fx0 };
    } else { kdPlace(T, { x: toX, y: sT.y }); T.kdPose = { kind: "freeze", dir: -sw > 0 ? 0 : Math.PI, k: (e - 0.34) / 0.4, from: K.fx0 }; }
    // Jiří: up and out of the line before it gets there, back after.
    var w = e < 0.14 ? 0 : e < 0.3 ? kdEO((e - 0.14) / 0.16) : 1 - kdE((e - 0.55) / 0.4);
    if (e > 0.14 && e < 0.32) K.ghosts.J.push({ x: J.x, y: J.y, t: 0 });
    kdPlace(J, { x: sJ.x, y: sJ.y - 62 * w });
    J.kdPose = { kind: "weave", lean: -0.32 * w };
    if (!K.said.weave1 && e >= 0.28) { K.said.weave1 = true; floater(J.x, J.y - J.r - 30, "WEAVE!", "dodge"); playElbowSwish(false); crowdReact(0.6); }
    if (e >= C.cyclone - C.flash - 0.02 && !K.swapped) { K.swapped = true; K.side = -K.side; }
    return kdCutDone(K);
  }
  if (t < C.jiri) {
    // Tony's cyclone spins in; Jiří weaves back and away, twice.
    var e2 = t - C.cyclone, L = C.jiri - C.cyclone, dirT = kdToward(K, "T");
    if (!K.said.cyc) { K.said.cyc = true; floater(T.x, T.y - T.r - 30, "CYCLONE!", "crit"); }
    var inn = K.D * 0.42 * Math.sin(kdC01(e2 / (L * 0.92)) * Math.PI);
    kdPlace(T, { x: sT.x + dirT * inn, y: sT.y });
    var k = kdC01(e2 / 0.12) * kdC01((L * 0.85 - e2) / 0.15);
    K.spinV = 2 * Math.PI * 3.2 * k; K.spin = (K.spin || 0) + K.spinV * dt;
    T.kdPose = { kind: "cyclone", spin: K.spin, spinV: K.spinV };
    K.whT = (K.whT || 0) - dt;
    if (K.whT <= 0 && k > 0.4) { K.whT = 0.16; playElbowSwish(true); }
    var w1 = Math.sin(kdC01((e2 - 0.15) / 0.4) * Math.PI), w2 = Math.sin(kdC01((e2 - 0.5) / 0.42) * Math.PI);
    var back = 28 * kdE(e2 / 0.5) * (1 - kdE((e2 - 0.8) / 0.3));
    kdPlace(J, { x: sJ.x + dirT * back, y: sJ.y - 46 * w1 + 46 * w2 });
    J.kdPose = { kind: "weave", lean: -0.3 * w1 + 0.3 * w2 };
    if ((w1 > 0.2 && w1 < 0.95) || (w2 > 0.2 && w2 < 0.95)) K.ghosts.J.push({ x: J.x, y: J.y, t: 0 });
    if (!K.said.weave2 && e2 >= 0.32) { K.said.weave2 = true; floater(J.x, J.y - J.r - 30, "WEAVE!", "dodge"); crowdReact(0.5); }
    if (!K.said.weave3 && e2 >= 0.68) { K.said.weave3 = true; floater(J.x, J.y - J.r - 30, "WEAVE!", "dodge"); crowdReact(0.6); }
    return kdCutDone(K);
  }
  if (t < C.spin) {
    // Jiří's X cut and two more into Tony's turtle shell.
    var e3 = t - C.jiri, dirJ = kdToward(K, "J");
    if (!K.said.shell) { K.said.shell = true; floater(T.x, T.y - T.r - 30, "TURTLE SHELL!", "crit"); playShellIn(); } // (ferguson.js)
    T.kdPose = { kind: "shell", phase: e3 < 0.18 ? "in" : "hold", t: e3 };
    kdPlace(T, sT);
    // three cuts: an X (both), then the long one, then the short one
    var cuts = [{ at: 0, wind: 0.32, both: true, side: 1 }, { at: 0.62, wind: 0.2, both: false, side: 1 }, { at: 1.06, wind: 0.2, both: false, side: -1 }];
    var cur = null;
    cuts.forEach(function (c, i) { if (e3 >= c.at) cur = { c: c, i: i, e: e3 - c.at }; });
    var c0 = cur.c, ce = cur.e, hitAt = c0.wind + KD_SWING * 0.7;
    var lunge = ce < c0.wind ? -6 * kdE(ce / c0.wind) : kdLerp(-6, K.D * 0.42, kdEO((ce - c0.wind) / (hitAt - c0.wind)));
    if (ce > hitAt) lunge = kdLerp(K.D * 0.42, cur.i === 2 ? 0 : K.D * 0.3, kdE((ce - hitAt) / 0.3));
    kdPlace(J, { x: sJ.x + dirJ * lunge, y: sJ.y });
    J.kdPose = { kind: "swing", st: ce, wind: c0.wind, both: c0.both, side: c0.side };
    if (!K.said["c" + cur.i] && ce >= hitAt) {
      K.said["c" + cur.i] = true;
      var px = T.x - dirJ * T.r * 0.9, py = T.y - T.r * 0.2;
      clashFx(px, py, -dirJ, 0, cur.i === 0 ? 1.4 : 1, JP_STEEL);
      playShellClank(false); playSwordClash(0.8);
      floater(T.x, T.y - T.r - 30 - cur.i * 4, cur.i === 0 ? "SHELL!" : "CLANG!", "dodge");
      if (cur.i === 0) floater(J.x, J.y - J.r - 30, "X CUT!", "crit");
      crowdReact(0.5);
    }
    return kdCutDone(K);
  }
  if (t < C.stand) {
    // Out spinning in the shell, into Jiří's crossed swords; he's shoved back.
    var e4 = t - C.spin, dirT2 = kdToward(K, "T"), hitE = 0.36;
    if (!K.said.spin) { K.said.spin = true; floater(T.x, T.y - T.r - 30, "SHELL SPIN!", "crit"); playShellSpin(); }
    var reach = K.D - T.r - J.r - 6; // (right up against his blades)
    var go = e4 < hitE ? kdEO(e4 / hitE) * reach : kdLerp(reach, 0, kdE((e4 - hitE) / 0.4));
    kdPlace(T, { x: sT.x + dirT2 * go, y: sT.y });
    var spinPh = e4 < 0.8 ? "spin" : "out";
    T.kdPose = { kind: "shell", phase: spinPh, t: spinPh === "out" ? e4 - 0.8 : e4 };
    var skid = e4 > hitE ? 34 * kdEO((e4 - hitE) / 0.25) * (1 - kdE((e4 - 0.7) / 0.3)) : 0;
    kdPlace(J, { x: sJ.x + dirT2 * skid, y: sJ.y });
    J.kdPose = { kind: "block", u: kdE(e4 / 0.2) * (1 - kdE((e4 - 0.8) / 0.2)) };
    if (!K.said.spinHit && e4 >= hitE) {
      K.said.spinHit = true;
      var bp = kdBlockPoint(K, "J");
      clashFx(bp.x, bp.y, dirT2, 0, 1.3, JP_STEEL);
      playShellClank(false); playSwordClash(1.2);
      floater(J.x, J.y - J.r - 30, "BLOCKED!", "crit");
      crowdReact(0.7);
    }
    if (!K.said.out && e4 >= 0.8) { K.said.out = true; playKatanaDraw(); }
    return kdCutDone(K);
  }
  if (t < C.pass) {
    // The standoff: both crouched, a glint off both sets of blades.
    var e5 = t - C.stand;
    kdPlace(T, sT); kdPlace(J, sJ);
    T.kdPose = { kind: "ready", k: kdE(e5 / 0.4), glint: e5 > 0.6 }; J.kdPose = { kind: "ready", k: kdE(e5 / 0.4), glint: e5 > 0.6 };
    if (!K.said.glint && e5 >= 0.6) { K.said.glint = true; playSamuraiGlint(true); }
    return kdCutDone(K);
  }
  if (t < C.zan) {
    // They dash past each other.
    var e6 = (t - C.pass) / (C.zan - C.pass), sw2 = K.side;
    if (!K.said.pass) { K.said.pass = true; playElbowSwish(true); playKatanaDraw(); K.cam.flash = 0.5; }
    var u6 = kdEO(e6), tX = kdLerp(sT.x, kdSpot(K, "T", -sw2).x, u6), jX = kdLerp(sJ.x, kdSpot(K, "J", -sw2).x, u6);
    K.ghosts.T.push({ x: T.x, y: T.y, t: 0 }); K.ghosts.J.push({ x: J.x, y: J.y, t: 0 });
    kdPlace(T, { x: tX, y: sT.y - 26 * Math.sin(u6 * Math.PI) }); kdPlace(J, { x: jX, y: sJ.y + 26 * Math.sin(u6 * Math.PI) });
    T.kdPose = { kind: "pass", dir: -sw2 > 0 ? 0 : Math.PI, k: e6 }; J.kdPose = { kind: "pass", dir: sw2 > 0 ? 0 : Math.PI, k: e6 };
    return kdCutDone(K);
  }
  if (!K.passSwapped) { K.passSwapped = true; K.side = -K.side; sT = kdSpot(K, "T"); sJ = kdSpot(K, "J"); }
  // Backs to each other, frozen... then the loser's cut opens.
  var win = K.tonyWins ? "T" : "J", lose = win === "T" ? "J" : "T", Wn = K[win], Ls = K[lose];
  var e7 = t - C.zan, dirAway = { T: -kdToward(K, "T") > 0 ? 0 : Math.PI, J: -kdToward(K, "J") > 0 ? 0 : Math.PI };
  if (!K.revealed) kdPlace(Ls, kdSpot(K, lose));
  kdPlace(Wn, kdSpot(K, win));
  Wn.kdPose = { kind: "zanshin", dir: dirAway[win], k: e7, win: true };
  if (!K.revealed) Ls.kdPose = { kind: "frozen", dir: dirAway[lose], k: e7 };
  if (!K.said.hair && e7 >= 0.45) { K.said.hair = true; kdCuts.push({ id: Ls.id, ang: Math.PI / 4, t: 0, max: C.reveal - C.zan - 0.45, kind: "hair" }); }
  if (!K.revealed && t >= C.reveal) kdReveal(K, Wn, Ls);
  return kdCutDone(K);
}
function kdCutDone(K) {
  if (K.t >= KD_C.end) kdEnd();
}
function kdReveal(K, Wn, Ls) {
  K.revealed = true;
  var cfg = K.cfg, tony = Wn === K.T;
  kdCuts.push({ id: Ls.id, ang: Math.PI / 4, t: 0, max: 1.3, kind: "x" });
  // The loser's blades are done: out of the duel and out of his special
  // first, so the wall slam can carry him.
  K.freed = Ls; Ls.kdPose = null;
  kdFinish(Ls);
  floater(Wn.x, Wn.y - Wn.r - 74, tony ? "X SLASH!" : "NITEN ICHI-RYU!", "crit");
  var dealt = hurt(Ls, cfg.damage, "igbb", Wn.id);
  floater(Ls.x, Ls.y + Ls.r + 30, "CUT DOWN!", "crit");
  playElbowHit(Math.max(dealt, 40), true, true); // (elbows.js)
  playSamuraiTaiko();
  playSwordClash(1.6);
  K.cam.flash = 0.55;
  var ux = Ls.x >= Wn.x ? 1 : -1;
  if (dealt > 0 && Ls.alive && !Ls.koOut) beginWallSlam(Ls, ux, 0, { knockback: cfg.knockback, wallSlams: cfg.wallSlams, slamDamage: cfg.slamDamage });
  if (!reduceMotion) shake = Math.max(shake, 26);
  hitStop = Math.max(hitStop, 0.2);
  crowdReact(1);
  checkEnd();
}
// A special over on the spot (the loser's, cut down).
function kdFinish(b) {
  if (katanaOn(b)) { b.igbb = null; b.elbowAnim = null; }
  else if (samuraiOn(b)) { var sam = jpSam(b); b.igbb = null; b.jpLastEnd = jpClock; if (!(sam && sam.keepOutfit)) jpSuit(b, false, sam); } // (prochazka.js)
  else return;
  if (b.alive) setSpeed(b, b.baseSpeed || SPEED);
}
function kdEnd() {
  var K = kDuel;
  kDuel = null;
  if (!K) return;
  [K.T, K.J].forEach(function (b) {
    b.kdPose = null;
    if (b === K.freed) return;
    if (!b.slam) { b.vx = 0; b.vy = 0; }
    if (katanaOn(b) && b.igbb.phase === "close") { b.igbb.phase = "sheathe"; b.igbb.t = 0; b.igbb.sl = null; }
    else if (samuraiOn(b) && b.igbb.phase === "close") { b.igbb.phase = "sheathe"; b.igbb.t = 0; b.igbb.sl = null; }
  });
}
// The camera: zoomed on the duel, with the letterbox and the colour grade.
function kdCam(K, z, bars, grade) { K.cam.z = z; K.cam.bars = bars; K.cam.grade = grade; }

// ---------------------------------------------------------------- petals

function kdPetal() {
  kdPetals.push({ x: -20 + nativeRandom() * 40, y: nativeRandom() * H, vx: 160 + nativeRandom() * 140, vy: 20 + nativeRandom() * 50, rot: nativeRandom() * 6, spin: (nativeRandom() - 0.5) * 8, flut: nativeRandom() * 6, s: 4 + nativeRandom() * 4, t: 0 });
}
function kdTickPetals(dt) {
  kdPetals.forEach(function (p) { p.t += dt; p.flut += dt * 5; p.x += p.vx * dt; p.y += (p.vy + Math.sin(p.flut) * 30) * dt; p.rot += p.spin * dt; });
  kdPetals = kdPetals.filter(function (p) { return p.x < W + 30 && p.t < 6; });
}

// ---------------------------------------------------------------- drawing

// Under the fighters (draw.js): the mat going dusk red with a red sun behind
// them, and their afterimages.
function drawKatanaDuelUnder() {
  var K = kDuel;
  if (!K) return;
  var g = K.cam.grade;
  if (g > 0.01) {
    ctx.save();
    ctx.globalAlpha = 0.5 * g; ctx.fillStyle = "#1a0608"; ctx.fillRect(-W, -H, W * 3, H * 3);
    var R = K.D * 1.25, sun = ctx.createRadialGradient(K.cx, K.cy, R * 0.2, K.cx, K.cy, R);
    sun.addColorStop(0, "rgba(214,40,40,0.75)"); sun.addColorStop(0.75, "rgba(180,24,30,0.55)"); sun.addColorStop(1, "rgba(180,24,30,0)");
    ctx.globalAlpha = g; ctx.fillStyle = sun; ctx.beginPath(); ctx.arc(K.cx, K.cy, R, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
  ["T", "J"].forEach(function (k) {
    var b = K[k], gh = K.ghosts[k];
    if (!gh.length) return;
    ctx.save();
    gh.forEach(function (q) { ctx.globalAlpha = 0.35 * (1 - q.t / 0.35); ctx.fillStyle = b.char.color; ctx.beginPath(); ctx.arc(q.x, q.y, b.r, 0, Math.PI * 2); ctx.fill(); });
    ctx.restore();
  });
  var T = K.T, p = T.kdPose;
  if (p && (p.kind === "streak" || (p.kind === "freeze" && p.k < 1))) {
    var fade = p.kind === "freeze" ? Math.max(0, 1 - p.k) : 1;
    ctx.save(); ctx.lineCap = "round";
    ctx.globalAlpha = 0.8 * fade; ctx.strokeStyle = "#ffffff"; ctx.lineWidth = T.r * 1.2;
    ctx.beginPath(); ctx.moveTo(p.from, T.y); ctx.lineTo(T.x, T.y); ctx.stroke();
    ctx.globalAlpha = 0.9 * fade; ctx.strokeStyle = "#e0202a"; ctx.lineWidth = 3; ctx.stroke();
    ctx.restore();
  }
}

// The body's turn (applyKatanaPose, ferguson-katanas.js; applyProchazkaPose,
// prochazka.js): spinning in the cyclone, crouched, leaning out of a weave.
function applyKatanaDuelPose(b) {
  if (!katanaDuelHeld(b)) return false;
  var K = kDuel, p = b.kdPose, rot = 0, sx = 1, sy = 1, base = b.y + b.r;
  if (K.phase === "turns" && kdAttacker(K) === (b === K.T ? "T" : "J")) {
    var e = K.t, s = K.aSide || 1;
    rot = s * (e < KD_WIND ? 0.28 * kdE(e / KD_WIND) : e < KD_HIT + 0.1 ? kdLerp(0.28, -0.34, kdEO((e - KD_WIND) / 0.2)) : -0.34 * (1 - kdE((e - KD_HIT - 0.1) / 0.3)));
    if (K.both && b === K.J) rot *= 0.4;
    base = b.y;
  } else if (p) {
    if (p.kind === "cyclone") { rot = p.spin; base = b.y; }
    else if (p.kind === "crouch") { var k = kdEO(p.k); sx = 1 + 0.08 * k; sy = 1 - 0.12 * k; }
    else if (p.kind === "streak") { sx = 1.25; sy = 0.8; }
    else if (p.kind === "weave") rot = p.lean;
    else if (p.kind === "ready") { sx = 1 + 0.04 * p.k; sy = 1 - 0.07 * p.k; }
    else if (p.kind === "pass") { sx = 1.2; sy = 0.84; }
    else if (p.kind === "frozen" && p.k > 0.45 && !reduceMotion) rot = Math.sin(p.k * 70) * 0.03;
    else if (p.kind === "shell") { sx = 1.04; sy = 0.94; }
  }
  if (rot || sx !== 1) { ctx.translate(b.x, base); ctx.rotate(rot); ctx.scale(sx, sy); ctx.translate(-b.x, -base); }
  return true;
}

// From drawTfKatanas (ferguson-katanas.js): Tony's arms and blades in the duel.
function drawKatanaDuelTony(b, ang) {
  if (!kDuel || b !== kDuel.T) return false;
  var K = kDuel, L = b.r * KAT_LEN, p = b.kdPose;
  var guard = function (s, a) { katArm(b, a, s, a + s * 0.95, 0, a + s * 0.35, L, 0); };
  if (K.phase === "lock") { kdTonyBlock(b, ang, kdLockPoint(K), 1, 0, L, 0.35 + 0.25 * Math.sin(performance.now() / 40)); return true; }
  if (K.phase === "turns") {
    var a = kdAttacker(K), e = K.t;
    if (a === "T") {
      var s0 = K.aSide || 1, pp = e < KD_WIND ? 0.35 * e / KD_WIND : e < KD_HIT + 0.04 ? 0.35 + 0.25 * kdC01((e - KD_WIND) / (KD_HIT + 0.04 - KD_WIND)) : 0.6 + 0.4 * kdC01((e - KD_HIT - 0.04) / 0.45);
      [-1, 1].forEach(function (s) {
        if (s !== s0) { guard(s, ang); return; }
        var P = katPoseA(ang, s, pp);
        if (pp > 0.35 && pp < 0.85) {
          var pts = [];
          for (var i = 0; i <= 10; i++) { var Q = katPoseA(ang, s, Math.max(0.35, pp - 0.11 + i * 0.011)); pts.push(katPt(b, Q.th, Q.ext, Q.ba, L)); }
          katTrail(pts, kdC01(1 - (pp - 0.6) / 0.25));
        }
        katArm(b, ang, s, P.th, P.ext, P.ba, L, e < KD_WIND && e > KD_WIND * 0.6 ? 0.6 : 0);
      });
    } else {
      var u = kdE((e - 0.1) / 0.22) * (1 - kdE((e - 0.75) / 0.25)), sweep = K.parry ? kdEO((e - KD_HIT) / 0.15) * (1 - kdE((e - 0.7) / 0.3)) : 0;
      kdTonyBlock(b, ang, kdBlockPoint(K, "T"), u, sweep, L, 0);
    }
    return true;
  }
  if (!p) { [-1, 1].forEach(function (s) { guard(s, ang); }); return true; }
  if (p.kind === "shell") { drawTfShell(b, { phase: p.phase, t: p.t }); if (p.phase === "out") [-1, 1].forEach(function (s) { katArm(b, ang, s, ang + s * 0.95, 0, ang + s * 0.35, L * kdC01(p.t / 0.2), 0); }); return true; } // (ferguson.js)
  if (p.kind === "crouch") { var k = kdEO(p.k); [-1, 1].forEach(function (s) { var th = ang + s * (0.95 + 1.1 * k); katArm(b, ang, s, th, 0, th + s * 0.9 * k, L, p.k > 0.6 ? 0.7 : 0); }); return true; }
  if (p.kind === "streak" || p.kind === "freeze") {
    var side = K.side === 1 ? 1 : -1, d = p.dir;
    [-1, 1].forEach(function (s) {
      if (s === side) katArm(b, d, s, d - s * 1.9, 18, d - s * 2.4, L, p.kind === "freeze" && p.k < 0.5 ? 0.5 : 0);
      else katArm(b, d, s, d + s * 0.9, 0, d + s * 0.4, L, 0);
    });
    return true;
  }
  if (p.kind === "cyclone") {
    [-1, 1].forEach(function (s) {
      var th = p.spin + (s > 0 ? 0 : Math.PI), ba = th + 0.45;
      if (p.spinV > 6) {
        var pts = [];
        for (var i = 0; i <= 12; i++) { var back = (1 - i / 12) * 1.25; pts.push(katPt(b, th - back, 16, ba - back, L)); }
        katTrail(pts, Math.min(1, p.spinV / 18) * 0.85);
      }
      katArm(b, ang, 1, th, 16, ba, L, 0);
    });
    return true;
  }
  if (p.kind === "ready") {
    // Blades crossed high, ready to go.
    [-1, 1].forEach(function (s) { var u = p.k; katArm(b, ang, s, ang + s * (0.95 - 0.45 * u), 0, ang - s * 0.6 * u, L, p.glint ? 0.5 + 0.5 * Math.sin(performance.now() / 30) : 0); });
    return true;
  }
  if (p.kind === "pass") {
    // Ripping both blades down through as he goes by.
    var v = kdEO(p.k), d2 = p.dir;
    [-1, 1].forEach(function (s) { katArm(b, d2, s, d2 + s * (0.35 + 1.4 * v), Math.sin(v * Math.PI) * 18, d2 + s * (-0.6 + 2.3 * v), L, 0.4); });
    return true;
  }
  if (p.kind === "zanshin" || p.kind === "frozen") {
    var d3 = p.dir;
    if (p.kind === "zanshin") [-1, 1].forEach(function (s) { katArm(b, d3, s, d3 + s * 1.75, 10, d3 + s * 1.95, L, p.k > 0.1 && p.k < 0.35 ? 0.8 : 0); }); // flung out behind him
    else [-1, 1].forEach(function (s) { katArm(b, d3, s, d3 + s * 0.95, 0, d3 + s * 0.35, L, 0); });
    return true;
  }
  [-1, 1].forEach(function (s) { guard(s, ang); });
  return true;
}
// Tony's two blades raised into a point, from guard (u 0) to braced (u 1);
// a parry sweeps them out.
function kdTonyBlock(b, ang, P, u, sweep, L, glow) {
  [-1, 1].forEach(function (s) {
    var th = ang + s * kdLerp(0.95, 0.55, u), ext = 8 * u, re = b.r * 0.95 + ext, ex = b.x + Math.cos(th) * re, ey = b.y + Math.sin(th) * re;
    var ba = kdLerpA(ang + s * 0.35, Math.atan2(P.y - ey, P.x - ex) + s * 0.04, u) + s * 0.7 * sweep;
    katArm(b, ang, s, th, ext, ba, L * (0.92 + 0.08 * (1 - u)), glow);
  });
}

// From drawProchazka (prochazka.js): Jiří's arms and swords in the duel.
function drawKatanaDuelJiri(b, ang) {
  if (!kDuel || b !== kDuel.J) return false;
  var K = kDuel, p = b.kdPose, len = function (s) { return b.r * (s > 0 ? JP_LONG : JP_SHORT); };
  var guard = function (a) { [1, -1].forEach(function (s) { var g = jpGuard(b, a, s); jpArm(b, a, s, g.hand, g.ba, len(s), 0); }); };
  if (K.phase === "lock") { kdJiriBlock(b, ang, kdLockPoint(K), 1, 0, 0.35 + 0.25 * Math.sin(jpClock * 25)); return true; }
  if (K.phase === "turns") {
    var a = kdAttacker(K), e = K.t;
    if (a === "J") kdJiriSwing(b, ang, { st: e, wind: KD_WIND, both: K.both, side: K.aSide || 1 });
    else {
      var u = kdE((e - 0.1) / 0.22) * (1 - kdE((e - 0.75) / 0.25)), sweep = K.parry ? kdEO((e - KD_HIT) / 0.15) * (1 - kdE((e - 0.7) / 0.3)) : 0;
      kdJiriBlock(b, ang, kdBlockPoint(K, "J"), u, sweep, 0);
    }
    return true;
  }
  if (!p || p.kind === "weave") { guard(ang); return true; }
  if (p.kind === "swing") { kdJiriSwing(b, ang, p); return true; }
  if (p.kind === "block") { kdJiriBlock(b, ang, kdBlockPoint(K, "J"), p.u, 0, 0); return true; }
  if (p.kind === "ready") {
    [1, -1].forEach(function (s) { var g = jpGuard(b, ang, s), hand = jpAt(b, ang + s * kdLerp(0.62, 1.1, p.k), 0.95); jpArm(b, ang, s, { x: kdLerp(g.hand.x, hand.x, p.k), y: kdLerp(g.hand.y, hand.y, p.k) }, kdLerpA(g.ba, ang + s * 1.6, p.k), len(s), p.glint ? 0.5 + 0.5 * Math.sin(jpClock * 40) : 0); });
    return true;
  }
  if (p.kind === "pass") {
    var v = kdEO(p.k), d = p.dir;
    [1, -1].forEach(function (s) { jpArm(b, d, s, jpAt(b, kdLerpA(d + s * 1.1, d + s * 0.55, v), 0.95), kdLerpA(d + s * 1.6, d + Math.PI - s * 0.35, v), len(s), 0.4); });
    return true;
  }
  if (p.kind === "zanshin" || p.kind === "frozen") {
    var d2 = p.dir;
    if (p.kind === "zanshin") [1, -1].forEach(function (s) { jpArm(b, d2, s, jpAt(b, d2 + s * 1.35, 1.0), d2 + s * 1.95, len(s), p.k > 0.1 && p.k < 0.35 ? 0.8 : 0); }); // out to the sides, a little back (zanshin)
    else guard(d2);
    return true;
  }
  guard(ang);
  return true;
}
function kdJiriSwing(b, ang, p) {
  var sam = { tell: p.wind, swing: KD_SWING, recover: 0.4 }, sl = { t: p.st, side: p.side, both: p.both };
  [1, -1].forEach(function (s) {
    var L = b.r * (s > 0 ? JP_LONG : JP_SHORT);
    if (p.both || p.side === s) {
      var P = jpSwingPose(b, ang, s, sl, sam); // (prochazka.js)
      if (P.trail) {
        var pts = [];
        for (var i = 0; i <= 10; i++) {
          var Q = jpSwingPose(b, ang, s, { t: Math.max(sam.tell, sl.t - 0.09 + i * 0.009), side: sl.side, both: sl.both }, sam);
          pts.push({ m: { x: Q.hand.x + Math.cos(Q.ba) * L * 0.3, y: Q.hand.y + Math.sin(Q.ba) * L * 0.3 }, t: { x: Q.hand.x + Math.cos(Q.ba) * L, y: Q.hand.y + Math.sin(Q.ba) * L } });
        }
        katTrail(pts, P.trail);
      }
      jpArm(b, ang, s, P.hand, P.ba, L, P.glow);
    } else { var g = jpGuard(b, ang, s); jpArm(b, ang, s, g.hand, g.ba, L, 0); }
  });
}
// Jiří's two swords raised into a point, from guard (u 0) to braced (u 1).
function kdJiriBlock(b, ang, P, u, sweep, glow) {
  var lang = Math.atan2(P.y - b.y, P.x - b.x);
  [1, -1].forEach(function (s) {
    var g = jpGuard(b, ang, s), h = jpAt(b, lang + s * 0.45, 1.05);
    var hand = { x: kdLerp(g.hand.x, h.x, u), y: kdLerp(g.hand.y, h.y, u) };
    var ba = kdLerpA(g.ba, Math.atan2(P.y - hand.y, P.x - hand.x) + s * 0.05, u) + s * 0.7 * sweep;
    jpArm(b, ang, s, hand, ba, b.r * (s > 0 ? JP_LONG : JP_SHORT) * 0.92, glow);
  });
}

// Over the fighters (draw.js): the petals, and the cut opening on the loser.
function drawKatanaDuelOver() {
  if (kdPetals.length) {
    ctx.save();
    kdPetals.forEach(function (p) {
      ctx.globalAlpha = Math.min(1, p.t * 3) * 0.9;
      ctx.translate(p.x, p.y); ctx.rotate(p.rot);
      ctx.fillStyle = "#f7b8c8"; ctx.beginPath(); ctx.ellipse(0, 0, p.s, p.s * 0.55, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#e48aa3"; ctx.beginPath(); ctx.ellipse(p.s * 0.3, 0, p.s * 0.4, p.s * 0.25, 0, 0, Math.PI * 2); ctx.fill();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.restore(); ctx.save();
    });
    ctx.restore();
  }
  kdCuts.forEach(function (f) {
    var o = balls[f.id];
    if (!o) return;
    var R = o.r * 1.5;
    ctx.save(); ctx.lineCap = "round";
    if (f.kind === "hair") {
      var grow = kdC01(f.t / 0.1), cx = Math.cos(f.ang), cy = Math.sin(f.ang);
      ctx.globalAlpha = 0.75 + (reduceMotion ? 0 : 0.25 * Math.sin(f.t * 40));
      ctx.strokeStyle = "rgba(200,16,46,0.6)"; ctx.lineWidth = 5;
      ctx.beginPath(); ctx.moveTo(o.x - cx * R, o.y - cy * R); ctx.lineTo(o.x - cx * R + cx * 2 * R * grow, o.y - cy * R + cy * 2 * R * grow); ctx.stroke();
      ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 2; ctx.stroke();
      ctx.restore();
      return;
    }
    var k = f.t / f.max;
    [f.ang, f.ang - Math.PI / 2].forEach(function (a, i) {
      var g2 = kdC01((f.t - i * 0.06) / 0.08), cx2 = Math.cos(a), cy2 = Math.sin(a);
      var x0 = o.x - cx2 * R, y0 = o.y - cy2 * R, x1 = x0 + cx2 * 2 * R * g2, y1 = y0 + cy2 * 2 * R * g2, w = 14 * (1 - k * 0.6);
      ctx.globalAlpha = Math.max(0, 1 - k);
      ctx.strokeStyle = "#15120f"; ctx.lineWidth = w + 8; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
      ctx.strokeStyle = "rgba(224,32,42,0.95)"; ctx.lineWidth = w + 3; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
      ctx.strokeStyle = "#ffffff"; ctx.lineWidth = w * (k < 0.3 ? 0.8 : 0.4); ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
    });
    ctx.restore();
  });
}

// End of draw() (draw.js): the camera pushing in on the duel, the letterbox,
// the title, the white flash. ox/oy/sc place the arena on the canvas.
function katanaDuelScreenCam(ox, oy, sc) {
  var K = kDuel;
  if (!K) return;
  var c = K.cam, cw = canvas.width, ch = canvas.height, z = Math.max(1, c.z);
  if (z > 1.002) {
    if (!kdBuf) kdBuf = document.createElement("canvas");
    if (kdBuf.width !== cw || kdBuf.height !== ch) { kdBuf.width = cw; kdBuf.height = ch; }
    var bx = kdBuf.getContext("2d");
    bx.setTransform(1, 0, 0, 1, 0, 0); bx.clearRect(0, 0, cw, ch); bx.drawImage(canvas, 0, 0);
    var vw = cw / z, vh = ch / z;
    var fx = Math.min(cw - vw / 2, Math.max(vw / 2, ox + sc * K.cx)), fy = Math.min(ch - vh / 2, Math.max(vh / 2, oy + sc * (K.cy - 20)));
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.drawImage(kdBuf, fx - vw / 2, fy - vh / 2, vw, vh, 0, 0, cw, ch);
    ctx.restore();
  }
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  if (c.grade > 0.01) {
    var vg = ctx.createRadialGradient(cw / 2, ch / 2, Math.min(cw, ch) * 0.25, cw / 2, ch / 2, Math.max(cw, ch) * 0.62);
    vg.addColorStop(0, "rgba(0,0,0,0)"); vg.addColorStop(1, "rgba(0,0,0," + 0.6 * c.grade + ")");
    ctx.fillStyle = vg; ctx.fillRect(0, 0, cw, ch);
  }
  var bar = ch * 0.09 * c.bars;
  if (bar > 0.5) { ctx.fillStyle = "#000"; ctx.fillRect(0, 0, cw, bar); ctx.fillRect(0, ch - bar, cw, bar); }
  if (K.phase === "cut" && bar > 10) kdTitle(K, cw, ch, bar);
  if (c.flash > 0) { ctx.fillStyle = "rgba(255,255,255," + (0.8 * c.flash).toFixed(3) + ")"; ctx.fillRect(0, 0, cw, ch); }
  ctx.restore();
}
function kdTitle(K, cw, ch, bar) {
  var t = K.t, k = kdE((t - 0.35) / 0.4) * (1 - kdE((t - 2.4) / 0.5)), k2 = kdE((t - KD_C.reveal) / 0.3) * (1 - kdE((t - KD_C.out) / 0.3));
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  if (k > 0.01) {
    ctx.globalAlpha = k;
    ctx.font = "800 " + Math.round(bar * 0.42) + 'px "Barlow Condensed", "Arial Narrow", sans-serif';
    ctx.fillStyle = "#f2efe8"; ctx.fillText("THE FINAL DUEL", cw / 2, ch - bar / 2);
    ctx.font = "700 " + Math.round(bar * 0.3) + 'px "Barlow Condensed", "Arial Narrow", sans-serif';
    ctx.fillStyle = "#e0202a"; ctx.fillText((K.T.char.name || "").toUpperCase() + "  vs  " + (K.J.char.name || "").toUpperCase(), cw / 2, bar / 2);
  }
  if (k2 > 0.01) {
    var Wn = K.tonyWins ? K.T : K.J;
    ctx.globalAlpha = k2;
    ctx.font = "800 " + Math.round(bar * 0.42) + 'px "Barlow Condensed", "Arial Narrow", sans-serif';
    ctx.fillStyle = "#f2efe8"; ctx.fillText((Wn.char.name || "").toUpperCase() + " WINS THE DUEL", cw / 2, ch - bar / 2);
  }
  ctx.globalAlpha = 1;
}
