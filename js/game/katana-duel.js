// The katana duel: Tony Ferguson's katanas against Jiří Procházka's samurai
// (Joe, 2026-11-21). With both of them out, they used to slash at each
// other at the same time and trade wildly. Now, as soon as both have their
// blades out, the duel takes over the two of them:
//
//   set     they square off side by side, "KATANA DUEL!"
//   turns   `exchanges` quick, clear turns: one cuts, the other blocks or
//           parries it (BLOCKED! / PARRIED!), then they swap. The cut stops
//           dead on the block (blade on blade), so nothing goes through anyone.
//   lock    the blades meet and lock, sparking, then burst apart
//   cut     the cutscene: black bars, the camera pushes in, the mat goes dusk
//           red with petals blowing across it. Tony's flash step and two
//           quick slashes that Jiří weaves, Jiří's X cut and two more cuts
//           clanking off Tony's turtle shell, Tony ramming in in the shell
//           onto Jiří's crossed blades, a standoff, and they slash through
//           each other. They freeze, backs turned... and the loser's cut
//           opens: `damage` (massive) and a wall slam. Tony wins `tonyWins`%.
//
// Joe's rules for it: quick, no blade or body going through anyone, and the
// two of them face each other the whole time, except the final slash
// through each other (and the freeze after it).
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

var KD_DEFAULT = { on: true, exchanges: 9, tonyWins: 50, damage: 120, knockback: 1150, wallSlams: 1, slamDamage: 6 };
var KD_SET = 0.62, KD_LOCK = 0.7; // (the set: Jiří backflips and Tony turtle-slides apart to their marks)
// One turn: coil (WIND), the cut (to HIT, blade on blade), held a moment, back to guard by BACK, next turn at EX.
var KD_WIND = 0.1, KD_HIT = 0.15, KD_BACK = 0.3, KD_EX = 0.38;
// Who cuts each turn (A = whoever goes first): a wild back-and-forth, now and then two in a row.
var KD_ORDER = "ABAABBABA";
var KD_CIRCLE = 1.1; // how fast they circle round each other through the turns (radians a second)
// The cutscene's beats (seconds from its start).
var KD_C = { flash: 0.6, slashes: 1.4, shell: 2.1, ram: 3.1, stand: 3.7, pass: 4.3, zan: 4.55, reveal: 5.35, out: 5.9, end: 6.4 };
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
function kdLerpP(p, q, u) { return { x: p.x + (q.x - p.x) * u, y: p.y + (q.y - p.y) * u }; }

function resetKatanaDuel() { kDuel = null; kdPetals = []; kdCuts = []; }

// Both of them held by the duel (swordDuelLocked, sword.js; updateKatanas,
// ferguson-katanas.js; updateSamurai, prochazka.js).
function katanaDuelHeld(b) { return !!(kDuel && b && (b === kDuel.T || b === kDuel.J) && b !== kDuel.freed); }

// How far each one's blade reaches from his middle: Tony's out of the elbow
// (katArm), Jiří's from the hand (jpArm).
function kdReach(K, k) { var b = K[k]; return k === "T" ? b.r * (0.95 + KAT_LEN) + 14 : b.r * (1.2 + JP_LONG); }

// ---------------------------------------------------------------- starting

// Blades out or coming out: the duel can take them as soon as both are
// drawing or drawn, so neither runs onto the other first.
function kdReady(b, on) {
  return on(b) && b.alive && !b.koOut && (b.igbb.phase === "close" || b.igbb.phase === "draw") && !b.igbb.kdDone && !b.slam && !((b.checkStun || 0) > 0);
}
function kdTryStart() {
  if (kDuel || over || !started || !balls || balls.length < 2) return;
  var T = null, J = null;
  balls.forEach(function (b) { if (katanaOn(b)) T = b; else if (samuraiOn(b)) J = b; });
  if (!T || !J || !kdCfg(T).on) return;
  if (!kdReady(T, katanaOn) || !kdReady(J, samuraiOn)) return;
  if (sceneLocked()) return; // (scene-lock.js)
  var cfg = kdCfg(T), r = Math.max(T.r, J.r), D = T.r + J.r + 100;
  var m = D / 2 + r + 12;
  var cx = Math.min(W - m, Math.max(m, (T.x + J.x) / 2)), cy = Math.min(H - m, Math.max(m, (T.y + J.y) / 2));
  [T, J].forEach(function (b) {
    clearActions(b);
    b.igbb.sl = null; b.igbb.kdDone = true;
    b.vx = 0; b.vy = 0;
  });
  kDuel = { T: T, J: J, cfg: cfg, phase: "set", t: 0, cx: cx, cy: cy, D: D, side: 1, axis: Math.atan2(T.y - J.y, T.x - J.x), spin: Math.random() < 0.5 ? 1 : -1,
    from: { T: { x: T.x, y: T.y }, J: { x: J.x, y: J.y } }, first: Math.random() < 0.5 ? "T" : "J", n: 0,
    tonyWins: Math.random() * 100 < cfg.tonyWins, cam: { z: 1, bars: 0, grade: 0, flash: 0 }, ghosts: { T: [], J: [] }, said: {} };
  floater(cx, cy - r - 70, "KATANA DUEL!", "crit");
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
  K.t += dt; K.dt = dt;
  K.cam.flash = Math.max(0, K.cam.flash - dt * 3);
  ["T", "J"].forEach(function (k) { var g = K.ghosts[k]; g.forEach(function (q) { q.t += dt; }); K.ghosts[k] = g.filter(function (q) { return q.t < 0.3; }); });
  T.kdPose = null; J.kdPose = null;
  if (K.phase === "set") kdTickSet(K, dt);
  else if (K.phase === "turns") kdTickTurns(K, dt);
  else if (K.phase === "lock") kdTickLock(K, dt);
  else kdTickCut(K, dt);
  if (!kDuel) return;
  [T, J].forEach(function (b) { if (b !== K.freed) { b.vx = 0; b.vy = 0; } });
}

// Where each of them stands: Tony on `side` of the middle, Jiří across.
// The line between them runs along K.axis (they circle round each other
// in the turns), Tony at +side along it.
function kdU(K) { return { x: Math.cos(K.axis), y: Math.sin(K.axis) }; }
function kdSpot(K, who, side) {
  var s = side == null ? K.side : side, d = who === "T" ? s : -s, u = kdU(K);
  return { x: K.cx + d * u.x * K.D / 2, y: K.cy + d * u.y * K.D / 2 };
}
function kdPlace(b, p) { b.x = Math.min(W - b.r, Math.max(b.r, p.x)); b.y = Math.min(H - b.r, Math.max(b.r, p.y)); }
// Along the line between the spots: +1 toward the other one.
function kdToward(K, who) { var u = kdU(K), d = who === "T" ? -K.side : K.side; return { x: u.x * d, y: u.y * d }; }
function kdAng(v) { return Math.atan2(v.y, v.x); }
// Standing `off` along the line from his spot (+ toward the other), `up` across it.
// (`up` is across the line: + is screen-up when the line runs left-right)
function kdAt(K, k, off, up) { var s = kdSpot(K, k), v = kdToward(K, k), u = kdU(K), px = u.y, py = -u.x; if (py > 0) { px = -px; py = -py; } kdPlace(K[k], { x: s.x + v.x * off - px * (up || 0), y: s.y + v.y * off - py * (up || 0) }); }

// The set: wherever they were (tangled up on the cage, even on top of each
// other), they spring apart to their marks. Jiří backflips away, in the air
// over Tony; Tony drops into his turtle shell and slides back, spinning, then
// pops out with the blades out.
function kdTickSet(K, dt) {
  var t = K.t, T = K.T, J = K.J;
  var uJ = kdE((t - 0.04) / 0.5), uT = kdEO((t - 0.1) / 0.34);
  kdPlace(J, kdLerpP(K.from.J, kdSpot(K, "J"), uJ)); kdPlace(T, kdLerpP(K.from.T, kdSpot(K, "T"), uT));
  J.kdPose = { kind: "flip", k: kdC01((t - 0.04) / 0.5), dir: kdAng(kdToward(K, "J")) };
  T.kdPose = t < 0.1 ? { kind: "shell", phase: "in", t: t * 1.8 } : t < 0.44 ? { kind: "shell", phase: "spin", t: t - 0.1 } : { kind: "shell", phase: "out", t: t - 0.44 };
  if (t > 0.1 && t < 0.44) K.ghosts.T.push({ x: T.x, y: T.y, t: 0 });
  if (!K.said.flip) { K.said.flip = true; playShellIn(); playElbowSwish(false); } // (ferguson.js, elbows.js)
  if (!K.said.slide && t >= 0.1) { K.said.slide = true; playShellSpin(); }
  if (!K.said.land && t >= 0.54) { K.said.land = true; playKatanaDraw(); if (!reduceMotion) shake = Math.max(shake, 5); }
  kdCam(K, 1 + 0.25 * kdE(t / KD_SET), 0, 0);
  if (K.t >= KD_SET) { K.phase = "turns"; K.t = 0; K.n = 0; K.hit = false; K.started = false; }
}

// ---- the turns: one cuts, the other blocks or parries it

function kdAttacker(K) { var c = KD_ORDER.charAt(K.n % KD_ORDER.length); return c === "A" ? K.first : (K.first === "T" ? "J" : "T"); }
// Where the cut meets the block: most of the attacker's reach toward the
// defender, a little up. The defender's blades come up to it.
function kdHitPoint(K, a) {
  var A = K[a], dir = kdToward(K, a), d = kdReach(K, a) * 0.82;
  return { x: A.x + dir.x * d, y: A.y + dir.y * d - A.r * 0.35 };
}
function kdTickTurns(K, dt) {
  var a = kdAttacker(K), d = a === "T" ? "J" : "T", e = K.t;
  if (!K.started) {
    K.started = true;
    K.parry = K.n % 3 === 2;
    K.both = a === "J" && K.n % 4 === 3; // now and then Jiří cuts with both swords
    K.aSide = K.n % 4 < 2 ? 1 : -1;
  }
  // The attacker steps into the cut and bounces off the block; the defender is shoved a step.
  var off = e < KD_WIND ? -5 * kdE(e / KD_WIND) : e < KD_HIT ? kdLerp(-5, 14, kdEO((e - KD_WIND) / (KD_HIT - KD_WIND))) : kdLerp(14, 0, kdE((e - KD_HIT) / (KD_BACK - KD_HIT)));
  if (e > KD_HIT && K.parry) off -= 10 * Math.sin(kdC01((e - KD_HIT) / 0.18) * Math.PI);
  var push = e > KD_HIT ? 6 * Math.sin(kdC01((e - KD_HIT) / 0.18) * Math.PI) : 0;
  K.axis += K.spin * KD_CIRCLE * dt; // circling as they trade
  kdAt(K, a, off, 0); kdAt(K, d, -push, 0);
  if (!K.whoosh && e >= KD_WIND) { K.whoosh = true; playElbowSwish(true); }
  if (!K.hit && e >= KD_HIT) {
    K.hit = true;
    var P = kdHitPoint(K, a), D = K[d];
    clashFx(P.x, P.y, kdToward(K, a).x, kdToward(K, a).y, 0.7, a === "J" ? JP_STEEL : null); // (sword.js)
    playSwordClash(1);
    floater(D.x, D.y - D.r - 34, K.parry ? "PARRIED!" : "BLOCKED!", "crit");
    crowdReact(0.45);
  }
  kdCam(K, 1.25, 0, 0);
  if (e >= KD_EX) {
    K.n++; K.t = 0; K.hit = false; K.whoosh = false; K.started = false;
    if (K.n >= (K.cfg.exchanges || 9)) { K.phase = "lock"; K.t = 0; K.sparkT = 0; floater(K.cx, K.cy - K.T.r - 70, "BLADE LOCK!", "crit"); playSwordClash(1.6); crowdReact(1); }
  }
}
function kdLockPoint(K) { return { x: (K.T.x + K.J.x) / 2, y: (K.T.y + K.J.y) / 2 - K.T.r * 0.8 }; }

function kdTickLock(K, dt) {
  var u = kdE(K.t / 0.15), push = K.t > 0.15 && K.t < 0.55 ? Math.sin((K.t - 0.15) * 14) * 5 : 0, brk = kdE((K.t - 0.55) / 0.12);
  ["T", "J"].forEach(function (k) { kdAt(K, k, 22 * u * (1 - brk) + (k === "T" ? push : -push), 0); });
  if (K.t > 0.15 && K.t < 0.55) {
    K.sparkT -= dt;
    if (K.sparkT <= 0) {
      K.sparkT = 0.06;
      var p = kdLockPoint(K);
      for (var i = 0; i < 4 && !reduceMotion; i++) {
        var a = -Math.PI / 2 + (nativeRandom() - 0.5) * 2.6, sp = 120 + nativeRandom() * 260;
        particles.push({ x: p.x, y: p.y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 0.3, max: 0.3, size: 2 + nativeRandom() * 2.5, color: i % 2 ? "#ffffff" : "#fff2c2" });
      }
      if (!reduceMotion) shake = Math.max(shake, 3);
    }
  }
  if (K.t >= 0.55 && !K.broke) {
    K.broke = true;
    var q = kdLockPoint(K);
    clashFx(q.x, q.y, 1, 0, 1.6, JP_STEEL);
    playSwordClash(1.6);
    K.cam.flash = 0.4;
  }
  kdCam(K, 1.25 + 0.1 * u, 0, 0);
  if (K.t >= KD_LOCK) { K.phase = "cut"; K.t = 0; playSamuraiTaiko(); crowdReact(0.4); }
}

// ---- the cutscene

function kdTickCut(K, dt) {
  var t = K.t, T = K.T, J = K.J, C = KD_C;
  var bars = kdE(t / 0.35) * (1 - kdE((t - C.out) / 0.4));
  var z = 1.25 + 0.25 * kdE(t / 0.6) + 0.2 * kdE((t - C.stand) / 0.5) - 0.1 * kdE((t - C.zan) / 0.4) - 0.6 * kdE((t - C.out) / 0.5);
  kdCam(K, z, bars, bars);
  if (!reduceMotion && nativeRandom() < dt * (t > C.stand ? 26 : 16)) kdPetal();
  if (t < C.flash) {
    if (K.axis0 == null) { K.axis0 = K.axis; var lv = Math.cos(K.axis) >= 0 ? 0 : Math.PI; K.axis1 = K.axis0 + Math.atan2(Math.sin(lv - K.axis0), Math.cos(lv - K.axis0)); }
    K.axis = kdLerp(K.axis0, K.axis1, kdE(t / 0.45)); // circling round into a level line for the cutscene
    kdAt(K, "T", 0, 0); kdAt(K, "J", 0, 0); T.kdPose = { kind: "guard" }; J.kdPose = { kind: "guard" }; return kdCutDone(K); }
  if (t < C.slashes) return kdBeatFlash(K, t - C.flash);
  if (t < C.shell) return kdBeatSlashes(K, t - C.slashes);
  if (t < C.ram) return kdBeatShell(K, t - C.shell);
  if (t < C.stand) return kdBeatRam(K, t - C.ram);
  if (t < C.pass) {
    // The standoff: both crouched, a glint off both sets of blades.
    var e5 = t - C.stand;
    kdAt(K, "T", 0, 0); kdAt(K, "J", 0, 0);
    T.kdPose = { kind: "ready", k: kdE(e5 / 0.3), glint: e5 > 0.35 }; J.kdPose = { kind: "ready", k: kdE(e5 / 0.3), glint: e5 > 0.35 };
    if (!K.said.glint && e5 >= 0.35) { K.said.glint = true; playSamuraiGlint(true); }
    return kdCutDone(K);
  }
  if (t < C.zan) {
    // The final slash: through each other (the one time they don't face each other).
    var e6 = (t - C.pass) / (C.zan - C.pass), sw = K.side, u6 = kdEO(e6), lane = 12; // (straight through each other: the one time they pass through)
    if (!K.said.pass) { K.said.pass = true; playElbowSwish(true); playKatanaDraw(); K.cam.flash = 0.4; }
    var sT = kdSpot(K, "T"), sJ = kdSpot(K, "J"), eT = kdSpot(K, "T", -sw), eJ = kdSpot(K, "J", -sw), uu = kdU(K), px = -uu.y, py = uu.x;
    var lift = Math.sin(u6 * Math.PI) * lane;
    K.ghosts.T.push({ x: T.x, y: T.y, t: 0 }); K.ghosts.J.push({ x: J.x, y: J.y, t: 0 });
    kdPlace(T, { x: kdLerp(sT.x, eT.x, u6) + px * lift, y: kdLerp(sT.y, eT.y, u6) + py * lift });
    kdPlace(J, { x: kdLerp(sJ.x, eJ.x, u6) - px * lift, y: kdLerp(sJ.y, eJ.y, u6) - py * lift });
    T.kdPose = { kind: "pass", dir: kdAng(kdToward(K, "T")), k: e6 }; J.kdPose = { kind: "pass", dir: kdAng(kdToward(K, "J")), k: e6 };
    return kdCutDone(K);
  }
  if (!K.passSwapped) { K.passSwapped = true; K.side = -K.side; }
  // Backs to each other, frozen... then the loser's cut opens.
  var win = K.tonyWins ? "T" : "J", lose = win === "T" ? "J" : "T", Wn = K[win], Ls = K[lose];
  var e7 = t - C.zan, away = function (k) { var v = kdToward(K, k); return kdAng({ x: -v.x, y: -v.y }); };
  if (!K.revealed) { kdAt(K, lose, 0, 0); kdAt(K, win, 0, 0); } // (after the cut their bodies are solid again: the winner isn't pinned to his spot)
  Wn.kdPose = { kind: "zanshin", dir: away(win), k: e7 };
  if (!K.revealed) Ls.kdPose = { kind: "frozen", dir: away(lose), k: e7 };
  if (!K.said.hair && e7 >= 0.3) { K.said.hair = true; kdCuts.push({ id: Ls.id, ang: Math.PI / 4, t: 0, max: C.reveal - C.zan - 0.3, kind: "hair" }); }
  if (!K.revealed && t >= C.reveal) kdReveal(K, Wn, Ls);
  return kdCutDone(K);
}

// Tony's flash step: a crouch, he blurs in and cuts, Jiří sways back out of it.
function kdBeatFlash(K, e) {
  var T = K.T, J = K.J;
  if (!K.said.flash) { K.said.flash = true; floater(T.x, T.y - T.r - 34, "FLASH STEP!", "crit"); }
  var inT = e < 0.12 ? 0 : e < 0.19 ? 36 * kdEO((e - 0.12) / 0.07) : e < 0.45 ? 36 : 36 * (1 - kdE((e - 0.45) / 0.3));
  if (e > 0.12 && e < 0.2) K.ghosts.T.push({ x: T.x, y: T.y, t: 0 });
  if (!K.said.fgo && e >= 0.12) { K.said.fgo = true; playKatanaDraw(); }
  kdAt(K, "T", inT, 0);
  T.kdPose = e < 0.12 ? { kind: "crouch", k: e / 0.12 } : { kind: "whiff", p: kdC01(0.35 + (e - 0.16) / 0.3 * 0.65), side: 1 };
  var w = e < 0.1 ? 0 : e < 0.2 ? kdEO((e - 0.1) / 0.1) : 1 - kdE((e - 0.45) / 0.3);
  if (e > 0.1 && e < 0.22) K.ghosts.J.push({ x: J.x, y: J.y, t: 0 });
  kdAt(K, "J", -64 * w, -34 * w);
  J.kdPose = { kind: "weave", lean: -0.3 * w };
  if (!K.said.weave1 && e >= 0.2) { K.said.weave1 = true; floater(J.x, J.y - J.r - 34, "WEAVE!", "dodge"); playElbowSwish(true); crowdReact(0.6); }
  return kdCutDone(K);
}
// Two quick slashes from Tony; Jiří slips one each way.
function kdBeatSlashes(K, e) {
  var T = K.T, J = K.J, i = e < 0.32 ? 0 : 1, le = e - i * 0.32, side = i ? -1 : 1;
  var inT = 24 * kdE(e / 0.15) * (1 - kdE((e - 0.55) / 0.15));
  kdAt(K, "T", inT, 0);
  T.kdPose = { kind: "whiff", p: kdC01(le / 0.28), side: side };
  if (!K.said["sw" + i] && le >= 0.08) { K.said["sw" + i] = true; playElbowSwish(true); }
  var w = Math.sin(kdC01((le - 0.02) / 0.3) * Math.PI) * (i === 1 && e > 0.62 ? 0 : 1), dir = i ? 1 : -1;
  if (w > 0.25 && w < 0.95) K.ghosts.J.push({ x: J.x, y: J.y, t: 0 });
  kdAt(K, "J", -(40 + 20 * w) * kdE(e / 0.12) * (1 - kdE((e - 0.55) / 0.15)), dir * 40 * w);
  J.kdPose = { kind: "weave", lean: dir * 0.3 * w };
  if (!K.said["wv" + i] && le >= 0.12) { K.said["wv" + i] = true; floater(J.x, J.y - J.r - 34, "WEAVE!", "dodge"); crowdReact(0.5); }
  return kdCutDone(K);
}
// Jiří's X cut and two more, clanking off Tony's turtle shell.
function kdBeatShell(K, e) {
  var T = K.T, J = K.J, SH = T.r * 1.14;
  if (!K.said.shell) { K.said.shell = true; floater(T.x, T.y - T.r - 34, "TURTLE SHELL!", "crit"); playShellIn(); } // (ferguson.js)
  K.shellMarks = K.shellMarks || [];
  K.shellMarks.forEach(function (m) { m.t += K.dt || 1 / 60; });
  var jolt = 0;
  K.shellMarks.forEach(function (m) { jolt = Math.max(jolt, 9 * Math.max(0, 1 - m.t / 0.16)); });
  kdAt(K, "T", -jolt, 0); // knocked back a touch by each cut
  T.kdPose = { kind: "shell", phase: e < 0.12 ? "in" : "hold", t: e, marks: K.shellMarks };
  var cuts = [{ at: 0.08, both: true, side: 1 }, { at: 0.42, both: false, side: 1 }, { at: 0.7, both: false, side: -1 }];
  var cur = cuts[0], ci = 0;
  cuts.forEach(function (c, i) { if (e >= c.at) { cur = c; ci = i; } });
  var ce = e - cur.at, wind = 0.12, hit = 0.18;
  // in close enough that the blade comes down on the shell itself
  var reachIn = K.D - (kdReach(K, "J") + SH * 0.4);
  var off = e < cuts[0].at ? 0 : ce < wind ? kdLerp(ci ? reachIn : 0, reachIn, kdE(ce / wind)) : reachIn - 6 * Math.sin(kdC01((ce - hit) / 0.16) * Math.PI);
  if (ci === 2 && ce > 0.25) off = kdLerp(reachIn, 0, kdE((ce - 0.25) / 0.2));
  kdAt(K, "J", off, 0);
  var vJ = kdToward(K, "J"), sp = kdSpot(K, "T"), P = { x: sp.x - vJ.x * SH * 0.4, y: sp.y - vJ.y * SH * 0.4 - T.r * 0.15 };
  J.kdPose = e < cuts[0].at ? { kind: "guard" } : { kind: "cut", e: ce, wind: wind, hit: hit, both: cur.both, side: cur.side, P: P };
  if (e >= cuts[0].at && !K.said["c" + ci] && ce >= hit) {
    K.said["c" + ci] = true;
    clashFx(P.x, P.y, -vJ.x, -vJ.y, ci === 0 ? 1.2 : 0.8, JP_STEEL);
    var at = kdAng({ x: -vJ.x, y: -vJ.y });
    if (cur.both) { K.shellMarks.push({ t: 0, at: at - 0.25, ang: at + Math.PI / 4 }); K.shellMarks.push({ t: 0, at: at + 0.25, ang: at - Math.PI / 4 }); }
    else K.shellMarks.push({ t: 0, at: at + cur.side * 0.3, ang: at + Math.PI / 2 + cur.side * 0.4 });
    playShellClank(false); playSwordClash(0.7);
    if (ci === 0) floater(J.x, J.y - J.r - 34, "X CUT!", "crit");
    if (ci === 1) floater(T.x, T.y - T.r - 34, "SHELL!", "dodge");
    crowdReact(0.5);
  }
  return kdCutDone(K);
}
// Tony rams in in his shell, right onto Jiří's crossed blades; Jiří's shoved back.
function kdBeatRam(K, e) {
  var T = K.T, J = K.J, SH = T.r * 1.14, hitE = 0.2;
  if (!K.said.ram) { K.said.ram = true; floater(T.x, T.y - T.r - 34, "SHELL RAM!", "crit"); playShellSpin(); }
  var bl = J.r * 1.05 + J.r * JP_LONG * 0.55; // where Jiří's crossed blades are, in front of him
  var reachIn = K.D - bl - SH;
  var go = e < hitE ? reachIn * kdEO(e / hitE) : kdLerp(reachIn, 0, kdE((e - hitE) / 0.3));
  var skid = e > hitE ? 22 * kdEO((e - hitE) / 0.15) * (1 - kdE((e - 0.4) / 0.2)) : 0;
  kdAt(K, "T", go + skid, 0); kdAt(K, "J", -skid, 0); // (Tony stays on the blades as Jiří skids back)
  var outT = 0.42;
  (K.shellMarks || []).forEach(function (m) { m.t += K.dt || 1 / 60; });
  T.kdPose = e < outT ? { kind: "shell", phase: "hold", t: e, marks: K.shellMarks } : { kind: "shell", phase: "out", t: e - outT };
  J.kdPose = { kind: "block", u: kdE(e / 0.12) * (1 - kdE((e - 0.45) / 0.15)), P: { x: J.x - kdToward(K, "T").x * bl, y: J.y - kdToward(K, "T").y * bl - J.r * 0.2 } };
  if (!K.said.ramHit && e >= hitE) {
    K.said.ramHit = true;
    var vT = kdToward(K, "T"), bp = { x: J.x - vT.x * bl, y: J.y - vT.y * bl - J.r * 0.2 };
    clashFx(bp.x, bp.y, vT.x, vT.y, 1.1, JP_STEEL);
    playShellClank(false); playSwordClash(1);
    floater(J.x, J.y - J.r - 34, "BLOCKED!", "crit");
    crowdReact(0.6);
  }
  if (!K.said.out && e >= outT) { K.said.out = true; playKatanaDraw(); }
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
  var dx = Ls.x - Wn.x, dy = Ls.y - Wn.y, dd = Math.sqrt(dx * dx + dy * dy) || 1;
  if (dealt > 0 && Ls.alive && !Ls.koOut) beginWallSlam(Ls, dx / dd, dy / dd, { knockback: cfg.knockback, wallSlams: cfg.wallSlams, slamDamage: cfg.slamDamage });
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
    var ph = b.igbb && b.igbb.phase;
    if ((katanaOn(b) || samuraiOn(b)) && (ph === "close" || ph === "draw")) { b.igbb.phase = "sheathe"; b.igbb.t = 0; b.igbb.sl = null; }
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
    var R = K.D * 1.15, sun = ctx.createRadialGradient(K.cx, K.cy, R * 0.2, K.cx, K.cy, R);
    sun.addColorStop(0, "rgba(214,40,40,0.75)"); sun.addColorStop(0.75, "rgba(180,24,30,0.55)"); sun.addColorStop(1, "rgba(180,24,30,0)");
    ctx.globalAlpha = g; ctx.fillStyle = sun; ctx.beginPath(); ctx.arc(K.cx, K.cy, R, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
  ["T", "J"].forEach(function (k) {
    var b = K[k], gh = K.ghosts[k];
    if (!gh.length) return;
    ctx.save();
    gh.forEach(function (q) { ctx.globalAlpha = 0.35 * (1 - q.t / 0.3); ctx.fillStyle = b.char.color; ctx.beginPath(); ctx.arc(q.x, q.y, b.r, 0, Math.PI * 2); ctx.fill(); });
    ctx.restore();
  });
}

// What a fighter is doing this frame in the turns: "atk" (cutting), "def"
// (blocking), with the turn's clock.
function kdRole(K, k) { return K.phase === "turns" ? (kdAttacker(K) === k ? "atk" : "def") : null; }

// The body's turn (applyKatanaPose, ferguson-katanas.js; applyProchazkaPose,
// prochazka.js): twisting into a cut, crouched, leaning out of a weave.
function applyKatanaDuelPose(b) {
  if (!katanaDuelHeld(b)) return false;
  var K = kDuel, k = b === K.T ? "T" : "J", p = b.kdPose, rot = 0, sx = 1, sy = 1, base = b.y + b.r;
  if (kdRole(K, k) === "atk") {
    var e = K.t, s = K.aSide || 1;
    rot = s * (e < KD_WIND ? 0.22 * kdE(e / KD_WIND) : e < KD_HIT ? kdLerp(0.22, -0.12, kdEO((e - KD_WIND) / (KD_HIT - KD_WIND))) : -0.12 * (1 - kdE((e - KD_HIT) / (KD_BACK - KD_HIT))));
    if (K.both && k === "J") rot *= 0.4;
    base = b.y;
  } else if (p) {
    if (p.kind === "flip") { kdFlipXform(b, p); return true; }
    if (p.kind === "crouch") { var c = kdEO(p.k); sx = 1 + 0.08 * c; sy = 1 - 0.12 * c; }
    else if (p.kind === "weave") rot = p.lean;
    else if (p.kind === "ready") { sx = 1 + 0.04 * p.k; sy = 1 - 0.07 * p.k; }
    else if (p.kind === "pass") { sx = 1.2; sy = 0.84; }
    else if (p.kind === "frozen" && p.k > 0.3 && !reduceMotion) rot = Math.sin(p.k * 70) * 0.03;
    else if (p.kind === "shell") { sx = 1.04; sy = 0.94; }
    else if (p.kind === "whiff") { var s2 = p.side || 1; rot = s2 * (p.p < 0.35 ? 0.3 * p.p / 0.35 : 0.3 - 0.6 * kdEO((p.p - 0.35) / 0.3)); base = b.y; }
  }
  if (rot || sx !== 1) { ctx.translate(b.x, base); ctx.rotate(rot); ctx.scale(sx, sy); ctx.translate(-b.x, -base); }
  return true;
}

// A backflip seen from above: up toward the camera (bigger, lifted), the body
// turning over along the way he's going (squashed to nothing and back, the
// far side showing), and down again.
function kdFlipXform(b, p) {
  var k = p.k, h = Math.sin(k * Math.PI), sc = 1 + 0.28 * h, turn = Math.cos(k * Math.PI * 2);
  ctx.translate(b.x, b.y - h * b.r * 0.55); ctx.rotate(p.dir); ctx.scale(sc * (0.25 + 0.75 * Math.abs(turn)) * (turn < 0 ? -1 : 1), sc); ctx.rotate(-p.dir); ctx.translate(-b.x, -b.y);
}
// The shell taking a cut: a white flash across it and a scratch where the blade landed.
function kdShellHit(b, p) {
  (p.marks || []).forEach(function (m) {
    var a = Math.max(0, 1 - m.t / 0.9), cx = b.x + Math.cos(m.at) * b.r * 0.5, cy = b.y + Math.sin(m.at) * b.r * 0.5, ca = Math.cos(m.ang), sa = Math.sin(m.ang), L = b.r * 0.55;
    if (a <= 0) return;
    ctx.save(); ctx.lineCap = "round";
    ctx.globalAlpha = a; ctx.strokeStyle = "rgba(10,30,10,0.8)"; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.moveTo(cx - ca * L, cy - sa * L); ctx.lineTo(cx + ca * L, cy + sa * L); ctx.stroke();
    ctx.strokeStyle = "#f4fff0"; ctx.lineWidth = 2; ctx.stroke();
    if (m.t < 0.12) { ctx.globalAlpha = 0.7 * (1 - m.t / 0.12); ctx.fillStyle = "#ffffff"; ctx.beginPath(); ctx.ellipse(b.x, b.y, b.r * 1.14, b.r * 1.08, 0, 0, Math.PI * 2); ctx.fill(); }
    ctx.restore();
  });
}

// ---- Tony

function kdTonyGuard(b, ang, s, L) { katArm(b, ang, s, ang + s * 0.95, 0, ang + s * 0.35, L, 0); }
// One of Tony's cuts that stops dead on the block: coiled back, ripped across
// to the point where it meets their blade, held, then back to guard.
function kdTonyCut(b, ang, s, e, wind, hit, back, P, L) {
  var gTh = ang + s * 0.95, gBa = ang + s * 0.35, wTh = ang + s * 1.95, wBa = wTh + s * 0.35, cTh = ang + s * 0.45, cExt = 14;
  var re = b.r * 0.95 + cExt, ex = b.x + Math.cos(cTh) * re, ey = b.y + Math.sin(cTh) * re, cBa = Math.atan2(P.y - ey, P.x - ex);
  var pose = function (t) {
    if (t < wind) { var u = kdE(t / wind); return { th: kdLerp(gTh, wTh, u), ext: 0, ba: kdLerpA(gBa, wBa, u) }; }
    if (t < hit) { var v = kdEO((t - wind) / (hit - wind)); return { th: kdLerp(wTh, cTh, v), ext: cExt * v, ba: kdLerpA(wBa, cBa, v) }; }
    var w = kdE((t - hit - 0.05) / (back - hit - 0.05));
    return { th: kdLerp(cTh, gTh, w), ext: cExt * (1 - w), ba: kdLerpA(cBa - s * 0.12 * Math.sin(kdC01((t - hit) / 0.08) * Math.PI), gBa, w) };
  };
  var Q = pose(e);
  if (e > wind && e < hit + 0.12) {
    var pts = [];
    for (var i = 0; i <= 8; i++) { var R = pose(Math.max(wind, Math.min(hit, e) - 0.07 + i * 0.0088)); pts.push(katPt(b, R.th, R.ext, R.ba, L)); }
    katTrail(pts, e < hit ? 1 : Math.max(0, 1 - (e - hit) / 0.12));
  }
  katArm(b, ang, s, Q.th, Q.ext, Q.ba, L, e > wind * 0.5 && e < wind ? 0.6 : 0);
}
// Tony's two blades raised into a point, from guard (u 0) to braced (u 1);
// a parry flicks them out.
function kdTonyBlock(b, ang, P, u, sweep, L, glow) {
  [-1, 1].forEach(function (s) {
    var th = ang + s * kdLerp(0.95, 0.55, u), ext = 8 * u, re = b.r * 0.95 + ext, ex = b.x + Math.cos(th) * re, ey = b.y + Math.sin(th) * re;
    var ba = kdLerpA(ang + s * 0.35, Math.atan2(P.y - ey, P.x - ex) + s * 0.04, u) + s * 0.5 * sweep;
    katArm(b, ang, s, th, ext, ba, L * (0.92 + 0.08 * (1 - u)), glow);
  });
}
// The block's rise and fall over a turn, and a parry's flick.
function kdBlockU(e) { return kdE((e - 0.01) / 0.08) * (1 - kdE((e - 0.24) / 0.1)); }
function kdSweep(K, e) { return K.parry ? kdEO((e - KD_HIT) / 0.06) * (1 - kdE((e - 0.24) / 0.1)) : 0; }

// From drawTfKatanas (ferguson-katanas.js): Tony's arms and blades in the duel.
function drawKatanaDuelTony(b, ang) {
  if (!kDuel || b !== kDuel.T) return false;
  var K = kDuel, L = b.r * KAT_LEN, p = b.kdPose, role = kdRole(K, "T");
  if (K.phase === "lock") { kdTonyBlock(b, ang, kdLockPoint(K), 1, 0, L, 0.35 + 0.25 * Math.sin(performance.now() / 40)); return true; }
  if (role === "atk") {
    var s0 = K.aSide || 1, P = kdHitPoint(K, "T");
    [-1, 1].forEach(function (s) { if (s === s0) kdTonyCut(b, ang, s, K.t, KD_WIND, KD_HIT, KD_BACK, P, L); else kdTonyGuard(b, ang, s, L); });
    return true;
  }
  if (role === "def") { kdTonyBlock(b, ang, kdHitPoint(K, "J"), kdBlockU(K.t), kdSweep(K, K.t), L, 0); return true; }
  if (!p || p.kind === "guard") { [-1, 1].forEach(function (s) { kdTonyGuard(b, ang, s, L); }); return true; }
  if (p.kind === "shell") { drawTfShell(b, { phase: p.phase, t: p.t }); kdShellHit(b, p); if (p.phase === "out") [-1, 1].forEach(function (s) { katArm(b, ang, s, ang + s * 0.95, 0, ang + s * 0.35, L * kdC01(p.t / 0.15), 0); }); return true; } // (ferguson.js)
  if (p.kind === "crouch") { var c = kdEO(p.k); [-1, 1].forEach(function (s) { var th = ang + s * (0.95 + 1.0 * c); katArm(b, ang, s, th, 0, th + s * 0.35, L, p.k > 0.5 ? 0.7 : 0); }); return true; }
  if (p.kind === "whiff") {
    // A full sweeping cut (his A slash) through the air where Jiří was.
    var sw = p.side || 1;
    [-1, 1].forEach(function (s) {
      if (s !== sw) { kdTonyGuard(b, ang, s, L); return; }
      var Q = katPoseA(ang, s, p.p);
      if (p.p > 0.35 && p.p < 0.85) {
        var pts = [];
        for (var i = 0; i <= 10; i++) { var R = katPoseA(ang, s, Math.max(0.35, p.p - 0.11 + i * 0.011)); pts.push(katPt(b, R.th, R.ext, R.ba, L)); }
        katTrail(pts, kdC01(1 - (p.p - 0.6) / 0.25));
      }
      katArm(b, ang, s, Q.th, Q.ext, Q.ba, L, 0);
    });
    return true;
  }
  if (p.kind === "ready") {
    [-1, 1].forEach(function (s) { katArm(b, ang, s, ang + s * (0.95 - 0.45 * p.k), 0, ang - s * 0.6 * p.k, L, p.glint ? 0.5 + 0.5 * Math.sin(performance.now() / 30) : 0); });
    return true;
  }
  if (p.kind === "pass") {
    var v = kdEO(p.k), d2 = p.dir;
    [-1, 1].forEach(function (s) { katArm(b, d2, s, d2 + s * (0.35 + 1.4 * v), Math.sin(v * Math.PI) * 18, d2 + s * (-0.6 + 2.3 * v), L, 0.4); });
    return true;
  }
  if (p.kind === "zanshin") { [-1, 1].forEach(function (s) { katArm(b, p.dir, s, p.dir + s * 1.75, 10, p.dir + s * 1.95, L, p.k > 0.05 && p.k < 0.3 ? 0.8 : 0); }); return true; } // flung out behind him
  if (p.kind === "frozen") { [-1, 1].forEach(function (s) { kdTonyGuard(b, p.dir, s, L); }); return true; }
  [-1, 1].forEach(function (s) { kdTonyGuard(b, ang, s, L); });
  return true;
}

// ---- Jiří

function kdJiriLen(b, s) { return b.r * (s > 0 ? JP_LONG : JP_SHORT); }
function kdJiriGuard(b, ang) { [1, -1].forEach(function (s) { var g = jpGuard(b, ang, s); jpArm(b, ang, s, g.hand, g.ba, kdJiriLen(b, s), 0); }); }
// One of Jiří's cuts that stops dead on the block (or the shell): the sword
// up over his shoulder, brought down onto the point, held, back to guard.
function kdJiriCut(b, ang, s, e, wind, hit, back, P) {
  var L = kdJiriLen(b, s), g = jpGuard(b, ang, s), wH = jpAt(b, ang + s * 1.35, 0.88), wBa = ang + s * 2.55;
  var cH = jpAt(b, ang + s * 0.22, 1.2), cBa = Math.atan2(P.y - cH.y, P.x - cH.x);
  var pose = function (t) {
    if (t < wind) { var u = kdE(t / wind); return { h: kdLerpP(g.hand, wH, u), ba: kdLerpA(g.ba, wBa, u) }; }
    if (t < hit) { var v = kdEO((t - wind) / (hit - wind)); return { h: kdLerpP(wH, cH, v), ba: kdLerpA(wBa, cBa, v) }; }
    var w = kdE((t - hit - 0.05) / (back - hit - 0.05));
    return { h: kdLerpP(cH, g.hand, w), ba: kdLerpA(cBa - s * 0.12 * Math.sin(kdC01((t - hit) / 0.08) * Math.PI), g.ba, w) };
  };
  var Q = pose(e);
  if (e > wind && e < hit + 0.12) {
    var pts = [];
    for (var i = 0; i <= 8; i++) { var R = pose(Math.max(wind, Math.min(hit, e) - 0.07 + i * 0.0088)); pts.push({ m: { x: R.h.x + Math.cos(R.ba) * L * 0.3, y: R.h.y + Math.sin(R.ba) * L * 0.3 }, t: { x: R.h.x + Math.cos(R.ba) * L, y: R.h.y + Math.sin(R.ba) * L } }); }
    katTrail(pts, e < hit ? 1 : Math.max(0, 1 - (e - hit) / 0.12)); // (ferguson-katanas.js)
  }
  jpArm(b, ang, s, Q.h, Q.ba, L, e > wind * 0.5 && e < wind ? 0.6 : 0); // (prochazka.js)
}
// Jiří's two swords raised into a point, from guard (u 0) to braced (u 1).
function kdJiriBlock(b, ang, P, u, sweep, glow) {
  var lang = Math.atan2(P.y - b.y, P.x - b.x);
  [1, -1].forEach(function (s) {
    var g = jpGuard(b, ang, s), h = jpAt(b, lang + s * 0.45, 1.05);
    var hand = kdLerpP(g.hand, h, u);
    var ba = kdLerpA(g.ba, Math.atan2(P.y - hand.y, P.x - hand.x) + s * 0.05, u) + s * 0.5 * sweep;
    jpArm(b, ang, s, hand, ba, kdJiriLen(b, s) * 0.92, glow);
  });
}

// From drawProchazka (prochazka.js): Jiří's arms and swords in the duel.
function drawKatanaDuelJiri(b, ang) {
  if (!kDuel || b !== kDuel.J) return false;
  var K = kDuel, p = b.kdPose, role = kdRole(K, "J");
  if (K.phase === "lock") { kdJiriBlock(b, ang, kdLockPoint(K), 1, 0, 0.35 + 0.25 * Math.sin(jpClock * 25)); return true; }
  if (role === "atk") {
    var P = kdHitPoint(K, "J"), s0 = K.aSide || 1;
    [1, -1].forEach(function (s) {
      if (K.both || s === s0) kdJiriCut(b, ang, s, K.t, KD_WIND, KD_HIT, KD_BACK, { x: P.x, y: P.y + (K.both ? s * b.r * 0.25 : 0) });
      else { var g = jpGuard(b, ang, s); jpArm(b, ang, s, g.hand, g.ba, kdJiriLen(b, s), 0); }
    });
    return true;
  }
  if (role === "def") { kdJiriBlock(b, ang, kdHitPoint(K, "T"), kdBlockU(K.t), kdSweep(K, K.t), 0); return true; }
  if (p && p.kind === "flip") { ctx.save(); kdFlipXform(b, p); kdJiriGuard(b, ang); ctx.restore(); return true; }
  if (!p || p.kind === "guard" || p.kind === "weave") { kdJiriGuard(b, ang); return true; }
  if (p.kind === "cut") {
    [1, -1].forEach(function (s) {
      if (p.both || s === p.side) kdJiriCut(b, ang, s, p.e, p.wind, p.hit, p.hit + 0.22, { x: p.P.x, y: p.P.y + (p.both ? s * b.r * 0.25 : 0) });
      else { var g = jpGuard(b, ang, s); jpArm(b, ang, s, g.hand, g.ba, kdJiriLen(b, s), 0); }
    });
    return true;
  }
  if (p.kind === "block") { kdJiriBlock(b, ang, p.P, p.u, 0, 0); return true; }
  if (p.kind === "ready") {
    [1, -1].forEach(function (s) { var g = jpGuard(b, ang, s), hand = jpAt(b, ang + s * kdLerp(0.62, 1.1, p.k), 0.95); jpArm(b, ang, s, kdLerpP(g.hand, hand, p.k), kdLerpA(g.ba, ang + s * 1.6, p.k), kdJiriLen(b, s), p.glint ? 0.5 + 0.5 * Math.sin(jpClock * 40) : 0); });
    return true;
  }
  if (p.kind === "pass") {
    var v = kdEO(p.k), d = p.dir;
    [1, -1].forEach(function (s) { jpArm(b, d, s, jpAt(b, kdLerpA(d + s * 1.1, d + s * 0.55, v), 0.95), kdLerpA(d + s * 1.6, d + Math.PI - s * 0.35, v), kdJiriLen(b, s), 0.4); });
    return true;
  }
  if (p.kind === "zanshin") { [1, -1].forEach(function (s) { jpArm(b, p.dir, s, jpAt(b, p.dir + s * 1.35, 1.0), p.dir + s * 1.95, kdJiriLen(b, s), p.k > 0.05 && p.k < 0.3 ? 0.8 : 0); }); return true; } // out to the sides, a little back (zanshin)
  if (p.kind === "frozen") { kdJiriGuard(b, p.dir); return true; }
  kdJiriGuard(b, ang);
  return true;
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
