// Sword clash: Diamond Guard Dustin's diamond sword (Joe, 2026-11-05).
//
// In Diamond Guard, whenever the other fighter has one of the weapons in
// diamond.swordClash.weapons out (Gane's bat, in Cheater mode), Dustin
// pulls out a diamond sword: a big two-handed longsword (Joe asked for
// "less rapier, more Braveheart"). Both hands on a long grip, heavy swings
// with his whole body behind them:
//   ready     high guard, blade raised up over his shoulder, swaying with
//             its weight; when they're close he heaves it back, threatening
//   walking   blade carried up on his shoulder, leaning into the run
//   flourish  stood still: hoisting it straight up over his head with a
//             roar, a huge windmill swing round his body, or planting the
//             tip in the mat and leaning on the pommel
//   guard     as their swing winds up, he raises it across to take the hit
//   parry     he twists into the hit, the blade slams the bat away and
//             shudders, then he chops back down at them
// Every pose is a target the hands and blade ease toward (slowly: it's
// heavy), so they flow from one to the next, and fast swings leave a trail.
//
// Each swing that would land has parryChance% to be parried (decided as the
// swing starts, so he can raise his guard in time): no damage, the swing is
// knocked away, and they're shoved back. On the duel.after-th parry the
// weapons lock up in a duel. The camera pushes in and the arena darkens,
// and they fight a choreographed exchange (DUEL_BEATS): a high clash, a low
// one, Dustin spinning into a strike, the blades bound together grinding
// sparks, a flurry, the two circling round each other locked, and a leaping
// overhead strike in slow motion. Then Dustin either disarms them (twists
// the bat away and it spins off into the crowd) or dashes straight through
// them with a delayed Diamond Slash.
"use strict";

var SWORD_DRAW = 0.35, SWORD_PUT_AWAY = 0.3, SWORD_SLASH = 0.5, SWORD_LEN = 2.6;
var swordDuel = null;   // the duel, while it's on
var flyingBats = [];    // bats knocked out of someone's hands
var clashFlashes = [];  // star flashes where the weapons meet
var duelFlash = 0;      // the whole arena flashing white on the big hit
var duelCam = { z: 1, x: 0, y: 0 };

function resetSwordClash() { swordDuel = null; flyingBats = []; clashFlashes = []; duelFlash = 0; duelCam = { z: 1, x: 0, y: 0 }; }
function swordDuelActive() { return !!swordDuel; }
// (Once it's decided, whoever lost it is let go: knocked flying or disarmed.)
function swordDuelLocked(b) { return !!(swordDuel && b && (b.id === swordDuel.dId || (b.id === swordDuel.oId && !swordDuel.let))); }

function swordWeaponOut(o) {
  return !!(o && o.alive && o.cheater && o.cheater.mode === "bat") ? "bat" : null;
}
function ease(u) { u = Math.max(0, Math.min(1, u)); return u * u * (3 - 2 * u); }
function easeOut(u) { u = Math.max(0, Math.min(1, u)); return 1 - (1 - u) * (1 - u); }
function wrapA(a) { return Math.atan2(Math.sin(a), Math.cos(a)); }

// ---------------------------------------------------------------- holding it

// Ball units, x measured toward the sword side: hand x/y, blade angle (for
// the sword side on screen right; mirrored for the left), two spare slots,
// and his body leaning toward them (+) or back (-).
function swordTarget(b, sw, other) {
  var t = sw.t + b.id * 1.3, sp = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
  var swingIn = other && other.chAct && other.chAct.kind === "bat" && sw.actRef === other.chAct && sw.willParry;
  if (sw.parry >= 0) {
    var p = sw.parry / SWORD_SLASH;
    if (p < 0.45) return { key: "parry", rate: 26, p: [0.85, -0.42, -Math.PI / 2 + 0.3, 0, 0, 0.2] }; // blade upright, taking the hit
    return { key: "riposte", rate: 13, p: [1.0, 0.2, 0.8, 0, 0, 0.32] }; // a heavy chop back down at them
  }
  if (swingIn) return { key: "guard", rate: 14, p: [0.7, -0.5, -0.3, 0, 0, -0.1] }; // raised across, both hands
  if (sp > 70) { // carried up on his shoulder
    var step = Math.abs(Math.sin(t * 9)), lean = Math.min(1, sp / 300);
    return { key: "walk", rate: 5, p: [0.4, 0.05 - step * 0.05, -Math.PI / 2 - 0.45 + step * 0.06, 0, 0, 0.06 * lean] };
  }
  // High guard: raised over his shoulder, swaying with the weight.
  var sway = Math.sin(t * 1.7), breath = Math.sin(t * 3.1);
  return { key: "ready", rate: 6, p: [0.55 + sway * 0.04, -0.05 + breath * 0.03, -Math.PI / 2 + 0.3 + sway * 0.12, 0, 0, sway * 0.03] };
}

// The flourishes he does when he's stood still, at u = 0..1.
// Each returns w (0..1, how far into the move's own pose), that pose's hand
// x/y and blade angle, and any extra spin or lean.
var SWORD_FLOURISHES = {
  hoist: { dur: 1.4, f: function (u) { // straight up over his head, roaring
    var w = u < 0.3 ? ease(u / 0.3) : u < 0.8 ? 1 : 1 - ease((u - 0.8) / 0.2);
    return { w: w, hx: 0.1, hy: -1.0 + Math.sin(u * 30) * 0.02 * w, a: -Math.PI / 2, lean: -0.08 * w };
  } },
  windmill: { dur: 1.15, f: function (u) { // one huge swing right round his body
    var w = u < 0.15 ? ease(u / 0.15) : u < 0.85 ? 1 : 1 - ease((u - 0.85) / 0.15);
    var sp = ease((u - 0.1) / 0.75) * Math.PI * 2;
    return { w: w, hx: 0.55 * Math.cos(sp - 0.4), hy: -0.15 + 0.35 * Math.sin(sp - 0.4), a: -Math.PI / 2 + 0.3, spin: sp, lean: 0.1 * Math.sin(sp) };
  } },
  plant: { dur: 1.9, f: function (u) { // tip in the mat, leaning on the pommel
    var w = u < 0.25 ? ease(u / 0.25) : u < 0.8 ? 1 : 1 - ease((u - 0.8) / 0.2);
    return { w: w, hx: 0.75, hy: 0.0, a: Math.PI / 2 - 0.12, lean: 0.06 * w };
  } }
};

function tickDiamondSword(b, dt) {
  var dg = b.diamond, sc = b.char.diamond.swordClash, o = balls[1 - b.id];
  var want = dg.on && b.alive && !over && sc && sc.enabled && sc.weapons.indexOf(swordWeaponOut(o)) >= 0;
  if (swordDuel && swordDuel.dId === b.id) want = true; // held through the duel
  var sw = dg.sword;
  if (want && !sw) {
    sw = dg.sword = { t: 0, out: true, outT: 0, parry: -1, parries: 0, side: o.x > b.x ? 1 : -1, pose: null,
      fl: null, still: 0, feint: -1, feintCd: 2, trail: [] };
    playSwordDraw();
    floater(b.x, b.y - b.r - 30, "DIAMOND SWORD", "crit");
    for (var i = 0; i < 16 && !reduceMotion; i++) {
      var a = Math.random() * Math.PI * 2, s = 60 + Math.random() * 160;
      particles.push({ x: b.x, y: b.y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 0.45, max: 0.45, size: 2 + Math.random() * 3, color: DIAMOND_C[i % 2 ? "L" : "W"] });
    }
  }
  if (!sw) return;
  sw.t += dt;
  if (sw.parry >= 0) { sw.parry += dt; if (sw.parry > SWORD_SLASH) sw.parry = -1; }
  if (sw.out && !want) { sw.out = false; sw.outT = 0; }
  if (!sw.out) { sw.outT += dt; if (sw.outT > SWORD_PUT_AWAY) { dg.sword = null; return; } }
  // Their swing starting: decide now whether it gets parried, so the guard
  // goes up in time for it.
  if (o.chAct && o.chAct.kind === "bat" && sw.actRef !== o.chAct) {
    sw.actRef = o.chAct;
    sw.willParry = Math.random() * 100 < sc.parryChance;
    sw.fl = null; sw.feint = -1; // drops any showing off
  }
  // Which side the sword's on: toward them, eased across when they swap sides.
  var wantSide = o.x > b.x ? 1 : -1;
  sw.side += (wantSide - sw.side) * (1 - Math.exp(-dt * 7));
  // Showing off, when he's stood still and nothing's coming.
  var sp = Math.sqrt(b.vx * b.vx + b.vy * b.vy), busy = sw.parry >= 0 || b.punch || (o.chAct && o.chAct.kind === "bat") || swordDuel;
  sw.still = sp < 70 && !busy ? sw.still + dt : 0;
  if (sw.fl) { sw.fl.t += dt; if (sw.fl.t > SWORD_FLOURISHES[sw.fl.kind].dur || busy) sw.fl = null; }
  else if (sw.still > 1.1 && Math.random() < dt * 0.9) {
    var kinds = ["hoist", "windmill", "plant"], kind = kinds[Math.floor(Math.random() * 3)];
    if (kind === sw.lastFl) kind = kinds[(kinds.indexOf(kind) + 1) % 3];
    sw.fl = { kind: kind, t: 0 }; sw.lastFl = kind; sw.still = 0;
  }
  // A quick feint at them now and then, when they're close.
  var dd = Math.sqrt((o.x - b.x) * (o.x - b.x) + (o.y - b.y) * (o.y - b.y));
  sw.feintCd -= dt;
  if (sw.feint >= 0) { sw.feint += dt; if (sw.feint > 0.6) sw.feint = -1; }
  else if (!busy && !sw.fl && sw.feintCd <= 0 && dd < b.r + o.r + 160) { sw.feint = 0; sw.feintCd = 2.5 + Math.random() * 2.5; }
  // Eases the pose toward its target.
  var tg = swordTarget(b, sw, o);
  if (!sw.pose) sw.pose = tg.p.slice();
  var k = 1 - Math.exp(-dt * tg.rate);
  var last = sw.pose[2];
  sw.pose = sw.pose.map(function (v, i) {
    var d = tg.p[i] - v;
    if (i === 2) d = wrapA(d);
    return v + d * k;
  });
  sw.key = tg.key;
}

// The pose as drawn (base pose plus flourish, feint and parry extras).
// Returns hand, blade angle, free glove, toss height, body lean and twist.
function swordDrawPose(b, sw) {
  var r = b.r, s = sw.side, ps = sw.pose, sgn = s >= 0 ? 1 : -1;
  var hx = ps[0], hy = ps[1], a = ps[2], fx = ps[3], fy = ps[4], lean = ps[5], toss = 0, twist = 0;
  if (sw.fl) {
    var F = SWORD_FLOURISHES[sw.fl.kind].f(sw.fl.t / SWORD_FLOURISHES[sw.fl.kind].dur);
    hx += (F.hx - hx) * F.w; hy += (F.hy - hy) * F.w;
    a += wrapA(F.a - a) * F.w + (F.spin || 0);
    lean += F.lean || 0;
  }
  if (sw.feint >= 0) { // heaving it back over his shoulder, threatening a big swing
    var fu = sw.feint / 0.6, fk = fu < 0.45 ? easeOut(fu / 0.45) : 1 - ease((fu - 0.45) / 0.55);
    hx -= 0.2 * fk; hy -= 0.25 * fk; a += wrapA(-Math.PI / 2 - 0.9 - a) * fk; lean += 0.14 * fk;
  }
  if (sw.parry >= 0) {
    var pp = sw.parry / SWORD_SLASH;
    a += Math.sin(pp * 40) * 0.25 * Math.max(0, 1 - pp * 1.6); // the shudder
    twist = Math.sin(Math.min(1, pp * 2.2) * Math.PI) * 0.3; // twisting his body into it
  }
  var ang = sgn > 0 ? a : Math.PI - a;
  if (Math.abs(s) < 1) { var w = (s + 1) / 2; ang = Math.atan2(Math.sin(a) * w + Math.sin(Math.PI - a) * (1 - w), Math.cos(a) * w + Math.cos(Math.PI - a) * (1 - w)); }
  return {
    hand: { x: b.x + hx * s * r, y: b.y + hy * r }, ang: ang, free: { x: b.x + fx * s * r, y: b.y + fy * r },
    toss: toss, lean: lean, twist: twist * sgn
  };
}

// His body leaning and lunging with the sword (draw.js adds it to his spot).
function swordBodyOffset(b) {
  var sw = b.diamond && b.diamond.sword, o = balls[1 - b.id];
  if (!sw || !b.alive) return { x: 0, y: 0 };
  if (swordDuel && swordDuel.dId === b.id) return { x: 0, y: -(swordDuel.lift || 0) * b.r };
  if (!sw.pose) return { x: 0, y: 0 };
  var pz = swordDrawPose(b, sw), nx = o.x - b.x, ny = o.y - b.y, nd = Math.sqrt(nx * nx + ny * ny) || 1;
  return { x: nx / nd * pz.lean * b.r, y: ny / nd * pz.lean * b.r };
}
// And twisting with it (the spinning strike in a duel, the parry twist).
function swordBodySpin(b) {
  var sw = b.diamond && b.diamond.sword;
  if (!sw || !b.alive) return 0;
  if (swordDuel && swordDuel.dId === b.id) return swordDuel.spin || 0;
  if (!sw.pose || sw.parry < 0) return 0;
  return swordDrawPose(b, sw).twist;
}

// ---------------------------------------------------------------- parrying

// Called by a weapon right before it lands (Gane's bat, cheater.js). True
// when Dustin parried it: the weapon skips its damage.
function diamondSwordClash(defender, attacker, weapon) {
  if (!defender || !defender.diamond || !defender.diamond.on || !defender.alive || swordDuel) return false;
  var sc = defender.char.diamond.swordClash, sw = defender.diamond.sword;
  if (!sc || !sc.enabled || sc.weapons.indexOf(weapon) < 0) return false;
  if (!sw || !sw.out || sw.t < SWORD_DRAW) return false; // still pulling it out
  var will = sw.actRef === attacker.chAct ? sw.willParry : Math.random() * 100 < sc.parryChance;
  if (!will) return false;
  sw.parry = 0; sw.parries++; sw.fl = null; sw.feint = -1;
  var nx = defender.x - attacker.x, ny = defender.y - attacker.y, nd = Math.sqrt(nx * nx + ny * ny) || 1;
  nx /= nd; ny /= nd;
  var cp = swordPoint(defender, sw, 0.45), cx = cp.x, cy = cp.y; // where the bat meets the blade
  attacker.chAct = null; // the swing is knocked away
  // Enough parries: the weapons lock up.
  if (sc.duel && sw.parries >= sc.duel.after) { startSwordDuel(defender, attacker); return true; }
  if (attacker.cheater) attacker.cheater.cd = Math.max(attacker.cheater.cd, sc.recover);
  attacker.vx = -nx * sc.knockback; attacker.vy = -ny * sc.knockback;
  defender.vx += nx * sc.knockback * 0.25; defender.vy += ny * sc.knockback * 0.25;
  attacker.squash = { t: 0.14, max: 0.14, nx: nx, ny: ny };
  clashFx(cx, cy, -nx, -ny, 1.2);
  floater(cx, Math.min(defender.y, attacker.y) - defender.r - 34, "PARRY!", "crit"); // over both of them
  crowdReact(0.6);
  playSwordClash(1);
  return true;
}

// A point `f` of the way up the blade (from the current pose).
function swordPoint(b, sw, f) {
  if (!sw.pose) return { x: b.x, y: b.y };
  var pz = swordDrawPose(b, sw), len = b.r * SWORD_LEN * f;
  return { x: pz.hand.x + Math.cos(pz.ang) * len, y: pz.hand.y + Math.sin(pz.ang) * len };
}

// Sparks, a white flash and a jolt where the blade meets the bat.
function clashFx(x, y, nx, ny, big) {
  impacts.push({ x: x, y: y, nx: nx, ny: ny, life: 0.35, max: 0.35, color: DIAMOND_C.W });
  var n = Math.round(18 * big);
  for (var i = 0; i < n && !reduceMotion; i++) {
    var a = Math.random() * Math.PI * 2, s = (160 + Math.random() * 320) * Math.sqrt(big);
    particles.push({ x: x, y: y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 0.35 + 0.1 * big, max: 0.35 + 0.1 * big,
      size: 2 + Math.random() * 3 * Math.sqrt(big), color: i % 3 === 0 ? "#fff6c2" : (i % 3 === 1 ? DIAMOND_C.W : "#c98a4b") });
  }
  clashFlashes.push({ x: x, y: y, t: 0, max: 0.14 + 0.06 * big, size: 22 * Math.sqrt(big), rot: Math.random() });
  if (!reduceMotion) { shake = Math.max(shake, 8 + 6 * big); hitStop = Math.max(hitStop, 0.03 + 0.025 * big); }
}

// ---------------------------------------------------------------- the duel

// The choreography, beat by beat (seconds of duel time). `hits` are the
// clashes in that beat, `y` where each lands (ball radii, up is -), `dir`
// which way each swing comes from.
var DUEL_BEATS = [
  { k: "lock", dur: 0.55, hits: [] },
  { k: "strike", dur: 0.44, hits: [0.34], y: [-0.6], dir: [1] },
  { k: "strike", dur: 0.38, hits: [0.28], y: [0.35], dir: [-1] },
  { k: "spin", dur: 0.72, hits: [0.56], y: [-0.25], dir: [1] },
  { k: "bind", dur: 1.0, hits: [0.06, 0.92], y: [-0.1, -0.45], dir: [-1, 1] },
  { k: "flurry", dur: 0.78, hits: [0.12, 0.27, 0.42, 0.58], y: [-0.55, 0.3, -0.35, 0.15], dir: [1, -1, 1, -1] },
  { k: "circle", dur: 0.85, hits: [0.74], y: [-0.25], dir: [1] },
  { k: "leap", dur: 1.15, hits: [0.88], y: [-0.55], dir: [1], slow: [0.32, 0.92] }
];
var DUEL_FINISH = 1.1;
(function () { var t = 0; DUEL_BEATS.forEach(function (bt) { bt.t0 = t; t += bt.dur; }); DUEL_BEATS.total = t; })();

function startSwordDuel(d, o) {
  var sc = d.char.diamond.swordClash.duel;
  clearActions(d); clearActions(o);
  d.vx = d.vy = o.vx = o.vy = 0;
  var gap = d.r + o.r + sc.gap;
  var mx = (d.x + o.x) / 2, my = (d.y + o.y) / 2;
  // Squared up side by side (it reads best front on), kept inside the cage
  // with room to circle round each other.
  mx = Math.min(W - gap / 2 - d.r - 20, Math.max(gap / 2 + d.r + 20, mx));
  my = Math.min(H - gap / 2 - d.r, Math.max(gap / 2 + d.r + 30, my));
  swordDuel = {
    dId: d.id, oId: o.id, t: 0, mx: mx, my: my, gap: gap, phi0: o.x >= d.x ? 0 : Math.PI,
    fromD: { x: d.x, y: d.y }, fromO: { x: o.x, y: o.y }, fired: {}, spin: 0, lift: 0,
    outcome: Math.random() * 100 < sc.disarmChance ? "disarm" : "slash", done: false, endT: -1, let: false
  };
  floater(mx, my - d.r - 50, "SWORD CLASH!", "crit");
  crowdReact(1);
  playSwordClash(1.4);
  if (!reduceMotion) shake = Math.max(shake, 14);
}

function duelBeat(t) {
  for (var i = DUEL_BEATS.length - 1; i >= 0; i--) if (t >= DUEL_BEATS[i].t0) return { i: i, bt: DUEL_BEATS[i], u: t - DUEL_BEATS[i].t0 };
  return { i: 0, bt: DUEL_BEATS[0], u: 0 };
}

// Where everything is at duel time t: both fighters, Dustin's spin and
// lift, the next (or last) clash point, and how far each weapon is wound.
function duelState(sd, t) {
  var B = duelBeat(Math.min(t, DUEL_BEATS.total - 1e-6)), bt = B.bt, u = B.u;
  var phi = sd.phi0 + (B.i > 6 || (B.i === 6 && u > bt.dur) ? Math.PI : 0);
  if (bt.k === "circle") phi = sd.phi0 + Math.PI * ease(u / 0.74);
  if (B.i === 7 || t >= DUEL_BEATS.total) phi = sd.phi0 + Math.PI;
  var ux = Math.cos(phi), uy = Math.sin(phi);
  // Nearest clash: the next one in this beat, or the last one gone.
  var hi = -1, best = 1e9;
  bt.hits.forEach(function (h, j) { var dd = h - u; if (dd >= -0.12 && dd < best) { best = dd; hi = j; } });
  if (hi < 0 && bt.hits.length) hi = bt.hits.length - 1;
  var cy = hi >= 0 ? bt.y[hi] : -0.4, dir = hi >= 0 ? bt.dir[hi] : 1, toHit = hi >= 0 ? bt.hits[hi] - u : 1;
  // Lunging in before a clash, jolted back after.
  var push = 0;
  bt.hits.forEach(function (h) {
    var dd = u - h;
    if (dd > -0.1 && dd < 0) push -= 0.14 * (1 + dd / 0.1);
    else if (dd >= 0 && dd < 0.35) push += 0.2 * Math.exp(-dd * 8) * Math.cos(dd * 20);
  });
  var lockK = B.i === 0 ? ease(u / 0.45) : 1;
  var spin = 0, lift = 0, wind = 0;
  // How far the weapons are drawn back: most of the way through the gap
  // between clashes, whipping through to the contact.
  if (toHit > 0) wind = Math.min(1, toHit / 0.22);
  else wind = -0.25 * Math.exp(toHit * 9); // a little past, then settles
  if (bt.k === "lock") wind = 0.9 * lockK; // en garde: raised and waiting
  if (bt.k === "bind") { wind = Math.sin(u * 47) * 0.03; push = -0.12 + Math.sin(u * 31) * 0.04; if (u > 0.9) push += 0.3 * ease((u - 0.9) / 0.1); cy = -0.1 - 0.35 * ease(u / 0.9); }
  if (bt.k === "circle" && u < 0.62) wind = 0.05 * Math.sin(u * 30);
  if (bt.k === "spin" && u < 0.56) spin = Math.PI * 2 * ease(u / 0.56);
  if (bt.k === "leap") { var a = Math.min(1, u / 0.88); lift = u < 0.88 ? 4 * a * (1 - a) * 1.25 : 0; if (u < 0.6) wind = 1.6; }
  return { B: B, ux: ux, uy: uy, cy: cy, dir: dir, push: push, lockK: lockK, spin: spin, lift: lift, wind: wind, toHit: toHit };
}

// From tickDiamond (every frame, before anyone moves).
function tickSwordDuel(dt) {
  flyingBats = flyingBats.filter(function (fb) {
    fb.t += dt; fb.x += fb.vx * dt; fb.y += fb.vy * dt; fb.vy += 900 * dt; fb.rot += fb.spin * dt;
    return fb.t < 2.4;
  });
  clashFlashes = clashFlashes.filter(function (f) { f.t += dt; return f.t < f.max; });
  duelFlash = Math.max(0, duelFlash - dt * 3);
  var sd = swordDuel;
  // The camera pushing in for the duel, and back out after.
  var zt = sd ? (sd.done ? 1.32 - 0.32 * ease((sd.t - sd.endT - 0.45) / 0.6) : 1 + 0.32 * ease(sd.t / 0.5)) : 1;
  if (sd && sd.punch) { zt += sd.punch; sd.punch = Math.max(0, sd.punch - dt * 0.8); }
  duelCam.z += (zt - duelCam.z) * (1 - Math.exp(-dt * 8));
  if (sd) { duelCam.x += (sd.mx - duelCam.x) * (1 - Math.exp(-dt * 10)); duelCam.y += (sd.my - duelCam.y) * (1 - Math.exp(-dt * 10)); }
  if (!sd) return;
  var d = balls[sd.dId], o = balls[sd.oId];
  if (!d.alive || (!o.alive && !sd.done)) { swordDuel = null; return; }
  if (sd.done) { tickDuelFinish(d, o, sd, dt); return; }
  // Slow motion for the leap.
  var leap = DUEL_BEATS[7], lu = sd.t - leap.t0;
  var slow = lu > leap.slow[0] && lu < leap.slow[1] ? 0.3 : 1;
  sd.t += dt * slow;
  var S = duelState(sd, sd.t), half = sd.gap / 2;
  sd.spin = S.spin; sd.lift = S.lift;
  var dxT = sd.mx - S.ux * (half + S.push * d.r), dyT = sd.my - S.uy * (half + S.push * d.r);
  var oxT = sd.mx + S.ux * (half + S.push * o.r), oyT = sd.my + S.uy * (half + S.push * o.r);
  d.x = sd.fromD.x + (dxT - sd.fromD.x) * S.lockK; d.y = sd.fromD.y + (dyT - sd.fromD.y) * S.lockK;
  o.x = sd.fromO.x + (oxT - sd.fromO.x) * S.lockK; o.y = sd.fromO.y + (oyT - sd.fromO.y) * S.lockK;
  d.vx = d.vy = o.vx = o.vy = 0;
  // Each clash as its moment passes.
  var B = S.B;
  B.bt.hits.forEach(function (h, j) {
    var key = B.i + ":" + j;
    if (sd.fired[key] || B.u < h) return;
    sd.fired[key] = true;
    var c = duelContact(sd, S, B.bt.y[j]), big = B.i === 7 ? 3.5 : B.bt.k === "spin" || (B.bt.k === "bind" && j === 1) ? 2 : B.bt.k === "flurry" ? 0.9 : 1.3;
    clashFx(c.x, c.y, -S.ux, -S.uy, big);
    playSwordClash(big > 3 ? 2.2 : big);
    d.squash = { t: 0.12, max: 0.12, nx: S.ux, ny: S.uy }; o.squash = { t: 0.12, max: 0.12, nx: -S.ux, ny: -S.uy };
    crowdReact(big > 3 ? 1 : 0.35);
    if (big > 3) { // the leaping strike landing: everything goes white
      duelFlash = 1; sd.punch = 0.18;
      if (!reduceMotion) { hitStop = Math.max(hitStop, 0.18); shake = Math.max(shake, 30); }
      impacts.push({ x: c.x, y: c.y + d.r, nx: 0, ny: -1, life: 0.5, max: 0.5, color: DIAMOND_C.L });
      for (var q = 0; q < 26 && !reduceMotion; q++) { // dust ring off the mat
        var qa = q / 26 * Math.PI * 2;
        particles.push({ x: d.x + Math.cos(qa) * d.r, y: d.y + d.r * 0.8 + Math.sin(qa) * d.r * 0.3, vx: Math.cos(qa) * 260, vy: Math.sin(qa) * 90, life: 0.5, max: 0.5, size: 3 + Math.random() * 3, color: "#d8cdb5" });
      }
    }
  });
  // Grinding sparks while the blades are bound.
  if (B.bt.k === "bind" && B.u > 0.06 && B.u < 0.9 && !reduceMotion) {
    var gc = duelContact(sd, S, S.cy);
    for (var g = 0; g < 2; g++) {
      var ga = -Math.PI / 2 + (Math.random() - 0.5) * 2.4, gs = 120 + Math.random() * 220;
      particles.push({ x: gc.x, y: gc.y, vx: Math.cos(ga) * gs, vy: Math.sin(ga) * gs, life: 0.3, max: 0.3, size: 1.5 + Math.random() * 2, color: g ? "#fff6c2" : DIAMOND_C.W });
    }
    shake = Math.max(shake, 4 + 6 * B.u);
    sd.grind = (sd.grind || 0) - dt;
    if (sd.grind <= 0) { sd.grind = 0.13; playSwordClash(0.45); }
  }
  // The finish.
  if (sd.t >= DUEL_BEATS.total + 0.08) {
    sd.done = true; sd.endT = sd.t; sd.spin = 0; sd.lift = 0;
    if (sd.outcome === "disarm") duelDisarm(d, o, sd, S); else duelDash(d, o, sd, S);
  }
}

function duelContact(sd, S, cy) {
  var d = balls[sd.dId], o = balls[sd.oId];
  return { x: (d.x + o.x) / 2, y: (d.y + o.y) / 2 + cy * d.r - (sd.lift || 0) * d.r * 0.5 };
}

// The disarm: the sword winds round the bat and rips it away.
function duelDisarm(d, o, sd, S) {
  sd.ux = S.ux; sd.uy = S.uy; sd.let = false;
  floater(o.x, o.y - o.r - 34, "DISARMED!", "crit");
  playSwordClash(1.6);
}
// The slash: Dustin dashes straight through them, and a beat later it lands.
function duelDash(d, o, sd, S) {
  sd.ux = S.ux; sd.uy = S.uy;
  var run = sd.gap + d.r * 1.2;
  sd.dashFrom = { x: d.x, y: d.y };
  sd.dashTo = { x: Math.min(W - d.r, Math.max(d.r, d.x + S.ux * run)), y: Math.min(H - d.r, Math.max(d.r, d.y + S.uy * run)) };
  sd.slashLine = { x0: d.x, y0: d.y, x1: sd.dashTo.x, y1: sd.dashTo.y };
  playSwordDraw(); playWhoosh();
}

function tickDuelFinish(d, o, sd, dt) {
  sd.t += dt;
  var f = sd.t - sd.endT, cfg = d.char.diamond.swordClash.duel;
  d.vx = d.vy = 0;
  if (sd.outcome === "disarm") {
    if (f >= 0.38 && !sd.flung) { // ripped away: the bat goes flying into the crowd
      sd.flung = true; sd.let = true;
      var up = -1;
      flyingBats.push({ x: o.x + sd.ux * o.r * 0.5, y: o.y - o.r * 0.4, vx: sd.ux * 380, vy: -820, rot: 0, spin: 19, t: 0, len: o.r * 1.6, trail: [] });
      if (o.cheater) o.cheater = null; // empty handed: back to fighting fair
      o.vx = sd.ux * 380; o.vy = sd.uy * 380;
      o.squash = { t: 0.16, max: 0.16, nx: -sd.ux, ny: -sd.uy };
      clashFx(o.x - sd.ux * o.r, o.y - o.r * 0.3, sd.ux, sd.uy, 2);
      if (!reduceMotion) shake = Math.max(shake, 20);
      crowdReact(1);
      playWhoosh();
    }
  } else {
    // The dash through, then the cut landing a beat later.
    var k = easeOut(Math.min(1, f / 0.14));
    if (sd.dashTo) { d.x = sd.dashFrom.x + (sd.dashTo.x - sd.dashFrom.x) * k; d.y = sd.dashFrom.y + (sd.dashTo.y - sd.dashFrom.y) * k; }
    if (f >= 0.45 && !sd.cut) {
      sd.cut = true; sd.let = true;
      var dealt = hurt(o, cfg.slashDamage, "igbb", d.id); // through the bind: can't be slipped or blocked
      floater(o.x, o.y - o.r - 34, "DIAMOND SLASH!", "crit");
      o.flash = 0.16; duelFlash = 0.7; sd.punch = 0.12;
      for (var i = 0; i < 30 && !reduceMotion; i++) {
        var a = Math.atan2(sd.uy, sd.ux) + (Math.random() - 0.5) * 2.2, s = 200 + Math.random() * 400;
        particles.push({ x: o.x, y: o.y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 0.55, max: 0.55, size: 2 + Math.random() * 4, color: DIAMOND_C[["W", "L", "m"][i % 3]] });
      }
      if (!reduceMotion) { shake = Math.max(shake, 28); hitStop = Math.max(hitStop, 0.12); }
      crowdReact(1);
      playSwordSlash();
      if (dealt > 0 && o.alive) beginWallSlam(o, -sd.ux, -sd.uy, { knockback: cfg.slashKnockback, wallSlams: 2, slamDamage: 4 });
      checkEnd();
    }
  }
  if (f >= DUEL_FINISH) endSwordDuel(d, o, sd);
}

function endSwordDuel(d, o, sd) {
  swordDuel = null;
  var sw = d.diamond.sword;
  if (sw) { sw.parries = 0; sw.parry = -1; sw.fl = null; }
  var cfg = d.char.diamond.swordClash;
  if (o.cheater) o.cheater.cd = Math.max(o.cheater.cd, cfg.recover);
}

// ---------------------------------------------------------------- camera

// Pushes the camera in on the duel (draw.js, around everything in the
// arena). Returns true when it changed the transform (end with swordCamEnd).
function swordCamBegin() {
  if (duelCam.z < 1.002) return false;
  // Centred on the duel, but never looking past the cage walls, so fighters
  // squared up near a wall stay fully in shot.
  var z = duelCam.z, hw = W / (2 * z), hh = H / (2 * z);
  var cx = Math.min(W - hw, Math.max(hw, duelCam.x)), cy = Math.min(H - hh, Math.max(hh, duelCam.y));
  ctx.save();
  ctx.beginPath(); ctx.rect(0, 0, W, H); ctx.clip();
  ctx.translate(W / 2, H / 2); ctx.scale(z, z); ctx.translate(-cx, -cy);
  return true;
}
function swordCamEnd(on) { if (on) ctx.restore(); }

// The arena darkening round the duel, and the white flash on the big hit.
function drawDuelVignette() {
  var k = Math.max(0, Math.min(1, (duelCam.z - 1) / 0.32));
  if (k > 0.01) {
    var g = ctx.createRadialGradient(duelCam.x, duelCam.y, W * 0.12, duelCam.x, duelCam.y, W * 0.62);
    g.addColorStop(0, "rgba(0,0,0,0)"); g.addColorStop(1, "rgba(0,10,20," + 0.55 * k + ")");
    ctx.fillStyle = g; ctx.fillRect(-W, -H, W * 3, H * 3);
  }
  if (duelFlash > 0) { ctx.fillStyle = "rgba(255,255,255," + duelFlash * 0.75 + ")"; ctx.fillRect(-W, -H, W * 3, H * 3); }
}

// ---------------------------------------------------------------- drawing

// drawHands leaves his hands to us while the sword is out.
function diamondHandsBusy(b) { return !!(b.diamond && b.diamond.sword && b.alive); }

// His shadow on the mat while he's in the air (under the fighters).
function drawDuelShadow() {
  var sd = swordDuel;
  if (!sd || !sd.lift) return;
  var d = balls[sd.dId], k = sd.lift / 1.25;
  ctx.save();
  ctx.fillStyle = "rgba(0,0,0," + (0.25 - 0.1 * k) + ")";
  ctx.beginPath(); ctx.ellipse(d.x, d.y + d.r * 0.85, d.r * (1 - 0.3 * k), d.r * 0.28 * (1 - 0.3 * k), 0, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

// Ghost copies of a fast-moving blade (or bat), fading behind it.
function drawTrail(trail, fn) {
  for (var i = 0; i < trail.length - 1; i++) {
    var a = trail[i], nb = trail[i + 1];
    var moved = Math.abs(wrapA(a.ang - nb.ang)) + Math.hypot(a.x - nb.x, a.y - nb.y) / 40;
    if (moved < 0.06) continue;
    fn(a, 0.07 + 0.07 * i);
  }
}
function pushTrail(trail, x, y, ang) {
  trail.push({ x: x, y: y, ang: ang });
  if (trail.length > 6) trail.shift();
}

// Front on, like Gane's bat: shoulders at the top corners of the ball, the
// sword arm on the side toward them. Drawn right before his gloves would be.
function drawDiamondSword(b, other, top) {
  var sw = b.diamond && b.diamond.sword;
  if (!sw || !b.alive) return;
  var inDuel = swordDuel && swordDuel.dId === b.id;
  // Mid parry (and through a duel) it's drawn over both fighters
  // (drawDiamondSwordsTop), so the clash isn't hidden behind them.
  if ((sw.parry >= 0 || !!inDuel) !== !!top) return;
  var im = getImg(DIAMOND_SWORD_SRC);
  if (!im || !sw.pose) return;
  var r = b.r, len = r * SWORD_LEN, k = 1, alpha = 1;
  var pz = inDuel ? duelSwordPose(b, swordDuel) : swordDrawPose(b, sw);
  var hand = pz.hand, ang = pz.ang, s = pz.side != null ? pz.side : sw.side;
  if (!inDuel && sw.out && sw.t < SWORD_DRAW) { // pulled out: swings up from his side
    var e = easeOut(sw.t / SWORD_DRAW);
    ang += (1 - e) * 2.4 * (s > 0 ? 1 : -1); k = 0.4 + 0.6 * e; alpha = e;
  }
  if (!sw.out) { alpha = Math.max(0, 1 - sw.outT / SWORD_PUT_AWAY); k = 1 - 0.5 * (1 - alpha); }
  var sideK = Math.max(-1, Math.min(1, s * 1.5)); // shoulders swap smoothly as the side does
  var sh = { x: b.x + 0.66 * sideK * r, y: b.y - 0.3 * r }, fsh = { x: b.x - 0.66 * sideK * r, y: b.y - 0.3 * r };
  // Two hands on a long grip: the lead hand up by the crossguard, the other
  // below it toward the pommel.
  var ca = Math.cos(ang), sa = Math.sin(ang);
  var h1 = { x: hand.x + ca * len * 0.035, y: hand.y + sa * len * 0.035 }, h2 = { x: hand.x - ca * len * 0.12, y: hand.y - sa * len * 0.12 };
  ctx.save();
  ctx.globalAlpha *= alpha;
  drawBentArm(b, fsh, h2, -sideK || -1);
  drawBentArm(b, sh, h1, sideK || 1);
  if (inDuel && swordDuel.slashLine && swordDuel.done) drawSlashLine(b, swordDuel);
  drawTrail(sw.trail, function (g, a) { drawLongsword(im, g.x, g.y, g.ang, len, k, a); });
  drawLongsword(im, hand.x, hand.y, ang, len, k, 1);
  pushTrail(sw.trail, hand.x, hand.y, ang);
  drawGloveAt(h2.x, h2.y, r * 0.21, b.char, ang);
  drawGloveAt(h1.x, h1.y, r * 0.22, b.char, ang);
  ctx.restore();
}

// The diamond sword with its grip lengthened for two hands: a wrapped
// handle and a diamond pommel behind the picture's own hilt. (x, y) is the
// middle of the grip.
function drawLongsword(im, x, y, ang, len, k, alpha) {
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.translate(x, y); ctx.rotate(ang); ctx.scale(k, k);
  var L = len * 0.2, w = len * 0.05;
  ctx.fillStyle = "#281e0b"; ctx.fillRect(-L, -w * 0.5 - 1.5, L + len * 0.1, w + 3);
  ctx.fillStyle = "#684e1e"; ctx.fillRect(-L, -w * 0.5, L + len * 0.1, w);
  ctx.fillStyle = "#89672a"; for (var i = 0; i < 5; i++) ctx.fillRect(-L + (L + len * 0.08) * i / 5, -w * 0.5, w * 0.35, w); // wraps
  ctx.fillStyle = "#081f1b"; ctx.fillRect(-L - w * 1.4, -w * 1.05, w * 1.5, w * 2.1); // pommel
  ctx.fillStyle = "#0e3f36"; ctx.fillRect(-L - w * 1.2, -w * 0.85, w * 1.1, w * 1.7);
  ctx.fillStyle = DIAMOND_C.L; ctx.fillRect(-L - w * 1.0, -w * 0.6, w * 0.55, w * 0.55);
  // The picture's own short hilt is cut off: only crossguard and blade.
  ctx.beginPath(); ctx.rect(len * 0.07, -len, len * 1.2, len * 2); ctx.clip();
  ctx.rotate(Math.PI / 4); ctx.imageSmoothingEnabled = false;
  var u = len / (13 * Math.SQRT2); // 16 px image: grip at (2.5, 13.5), tip at (15.5, 0.5)
  ctx.drawImage(im, -2.5 * u, -13.5 * u, 16 * u, 16 * u);
  ctx.restore();
}

// Through the duel: the sword arm reaching for each clash, wound back and
// whipping in between, the spinning strike, the overhead leap, the finish.
function duelSwordPose(b, sd) {
  var r = b.r, S, o = balls[sd.oId];
  if (sd.done) S = { ux: sd.ux, uy: sd.uy, cy: -0.3, dir: 1, wind: 0, spin: 0, B: { bt: DUEL_BEATS[7] } };
  else S = duelState(sd, sd.t);
  var nx = S.ux, ny = S.uy, side = nx >= 0 ? 1 : -1;
  var hand = { x: b.x + nx * r * 0.8, y: b.y + ny * r * 0.8 - r * 0.15 - (sd.lift || 0) * r };
  var c = duelContact(sd, S, S.cy);
  var aim = Math.atan2(c.y - hand.y, c.x - hand.x);
  var ang = aim - S.dir * 1.8 * S.wind * side; // big, heavy two-handed arcs
  if (S.B.bt.k === "spin" && S.spin) ang = aim - (Math.PI * 2 - S.spin) * side; // the full circle, landing on the hit
  if (S.B.bt.k === "leap" && !sd.done && S.wind > 1) ang = -Math.PI / 2 - 0.9 * side; // raised high overhead
  if (sd.done) {
    var f = sd.t - sd.endT;
    if (sd.outcome === "disarm") {
      var w = ease(f / 0.38);
      ang = aim + w * Math.PI * 2 * side; // winding round the bat to rip it out
      if (f > 0.45) { var pt = ease((f - 0.45) / 0.3); ang = aim + Math.PI * 2 * side + wrapA(Math.atan2(o.y - hand.y, o.x - hand.x) - aim) * pt; hand.x += nx * r * 0.3 * pt; } // point at them: done
    } else {
      var cut = easeOut(Math.min(1, f / 0.16));
      ang = (side > 0 ? -1.1 : Math.PI + 1.1) + cut * 2.2 * side; // one huge cut on the way through
      if (f > 0.5) ang += wrapA(-Math.PI / 2 + 0.6 * side - ang) * ease((f - 0.5) / 0.4); // and up into a pose
    }
  }
  return { hand: hand, ang: ang, free: { x: b.x - nx * r * 0.5, y: b.y + r * 0.1 - (sd.lift || 0) * r }, side: side, toss: 0 };
}

// The Diamond Slash: a bright line where he cut through, then it fades.
function drawSlashLine(b, sd) {
  var f = sd.t - sd.endT, L = sd.slashLine;
  var grow = easeOut(Math.min(1, f / 0.14)), fade = f < 0.45 ? 1 : Math.max(0, 1 - (f - 0.45) / 0.5);
  var x1 = L.x0 + (L.x1 - L.x0) * grow, y1 = L.y0 + (L.y1 - L.y0) * grow;
  ctx.save();
  ctx.globalAlpha = fade;
  ctx.lineCap = "round";
  ctx.shadowColor = DIAMOND_C.m; ctx.shadowBlur = 24;
  ctx.strokeStyle = DIAMOND_C.m; ctx.lineWidth = b.r * (f < 0.45 ? 0.16 : 0.5 * (1 - fade) + 0.16);
  ctx.beginPath(); ctx.moveTo(L.x0, L.y0 - b.r * 0.2); ctx.lineTo(x1, y1 - b.r * 0.2); ctx.stroke();
  ctx.strokeStyle = "#ffffff"; ctx.lineWidth = b.r * 0.06;
  ctx.beginPath(); ctx.moveTo(L.x0, L.y0 - b.r * 0.2); ctx.lineTo(x1, y1 - b.r * 0.2); ctx.stroke();
  ctx.restore();
}

// Over both fighters: the sword mid parry or through a duel, the bat in the
// duel, the clash flashes and any bats flying off into the crowd.
function drawDiamondSwordsTop() {
  balls.forEach(function (b) { drawDiamondSword(b, balls[1 - b.id], true); });
  if (swordDuel) drawDuelBat(balls[swordDuel.oId], swordDuel);
  clashFlashes.forEach(function (f) {
    var a = 1 - f.t / f.max;
    ctx.save();
    ctx.globalAlpha = a;
    ctx.fillStyle = "#ffffff";
    ctx.shadowColor = DIAMOND_C.L; ctx.shadowBlur = 20;
    ctx.beginPath();
    for (var i = 0; i < 8; i++) {
      var ang = i * Math.PI / 4 + f.rot, rr = i % 2 ? f.size * 0.3 : f.size * (1 + (1 - a) * 0.6);
      ctx.lineTo(f.x + Math.cos(ang) * rr, f.y + Math.sin(ang) * rr);
    }
    ctx.closePath(); ctx.fill();
    ctx.restore();
  });
  flyingBats.forEach(function (fb) {
    ctx.save(); ctx.globalAlpha = Math.min(1, (2.4 - fb.t) / 0.4);
    drawTrail(fb.trail, function (g, a) { ctx.save(); ctx.globalAlpha *= a * 2; drawBat(g.x, g.y, g.ang, fb.len); ctx.restore(); });
    drawBat(fb.x, fb.y, fb.rot, fb.len);
    pushTrail(fb.trail, fb.x, fb.y, fb.rot);
    ctx.restore();
  });
}

// Gane in the duel: both hands on the bat, swinging it into each clash.
var duelBatTrail = [];
function drawDuelBat(o, sd) {
  if (!o.alive || sd.let || (sd.done && sd.outcome === "slash")) { duelBatTrail = []; return; }
  var r = o.r, S;
  if (sd.done) S = { ux: sd.ux, uy: sd.uy, cy: -0.3, dir: 1, wind: 0, B: { bt: DUEL_BEATS[7] } };
  else S = duelState(sd, sd.t);
  var nx = -S.ux, ny = -S.uy, side = nx >= 0 ? 1 : -1;
  var hand = { x: o.x + nx * r * 0.85, y: o.y + ny * r * 0.85 - r * 0.1 };
  var c = duelContact(sd, S, S.cy);
  var aim = Math.atan2(c.y - hand.y, c.x - hand.x);
  var ang = aim + S.dir * 1.2 * S.wind * side;
  if (S.B.bt.k === "leap" && !sd.done && S.wind > 1) ang = side > 0 ? -0.25 : Math.PI + 0.25; // braced up high for it
  if (sd.done) ang = aim + ease((sd.t - sd.endT) / 0.38) * Math.PI * 2 * -side; // wrenched round by the sword
  var len = r * 1.6;
  var sh1 = { x: o.x + r * 0.66 * side, y: o.y - r * 0.3 }, sh2 = { x: o.x - r * 0.66 * side, y: o.y - r * 0.3 };
  var h2 = { x: hand.x - Math.cos(ang) * len * 0.12, y: hand.y - Math.sin(ang) * len * 0.12 };
  drawBentArm(o, sh2, h2, -side);
  drawTrail(duelBatTrail, function (g, a) { ctx.save(); ctx.globalAlpha *= a * 2; drawBat(g.x, g.y, g.ang, len); ctx.restore(); });
  drawBat(hand.x, hand.y, ang, len);
  pushTrail(duelBatTrail, hand.x, hand.y, ang);
  drawBentArm(o, sh1, hand, side);
  drawGloveAt(h2.x, h2.y, r * 0.22, o.char);
  drawGloveAt(hand.x, hand.y, r * 0.22, o.char);
}
