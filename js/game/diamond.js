// Dustin Poirier's Diamond Guard (char.diamond).
//
// The first time he drops below half health (diamond.triggerHp of MAX_HP),
// he transforms: Joe's "Dustin Diamond" clip plays, a burst of diamond
// shards and a flash go off, and he's in the Diamond Dustin skin (the
// Minecraft-style pixel diamond armor Joe approved: a blocky helmet on his
// head, a chestplate that follows the round body, and small shoulder pads)
// for the rest of the fight.
//
// In Diamond Guard he keeps every one of his regular attacks, and every few
// seconds (diamond.throwEvery, a random gap between the two numbers) he
// throws a pixel diamond at them. It flies like any projectile (it can be
// weaved or blocked) and does the same damage as his punch.
//
// Sword clash (diamondSwordClash below) is a placeholder, to be coded in
// later: Dustin parrying hits from specific weapons (Ciryl Gane's bat to
// start with) with a diamond sword. Gane's bat already asks it before it
// lands; for now it always says no, so nothing changes yet.
"use strict";

function hasDiamond(b) { return !!(b && b.char.diamond); }

// From makeBall: every fight starts out of Diamond Guard.
function initDiamond(b) {
  b.diamond = null;
  if (!hasDiamond(b)) return;
  getImg(DIAMOND_GEM_SRC); // starts decoding the diamond so the first throw has it
  b.diamond = { on: false, t: 0, throwT: 0 };
}

// Every frame from update().
function tickDiamond(dt) {
  balls.forEach(function (b) {
    var dg = b.diamond;
    if (!dg) return;
    if (dg.on) dg.t += dt;
    if (!b.alive || over || !started) return;
    var cfg = b.char.diamond, other = balls[1 - b.id];
    if (!dg.on) {
      if (b.hp > 0 && b.hp < MAX_HP * cfg.triggerHp) startDiamondGuard(b);
      return;
    }
    // An occasional diamond, thrown when his hands are free.
    dg.throwT -= dt * b.atkRate;
    if (dg.throwT <= 0 && other.alive && !diamondBusy(b)) {
      dg.throwT = diamondThrowGap(cfg);
      b.throwAnim = { t: 0, dur: 0.5, wEnd: 0.55, relEnd: 0.72, fired: false, proj: diamondProj(b) };
    }
  });
}

function diamondThrowGap(cfg) {
  var g = cfg.throwEvery;
  return g[0] + Math.random() * (g[1] - g[0]);
}

function diamondProj(b) {
  var cfg = b.char.diamond;
  return {
    size: cfg.gemSize, speed: cfg.gemSpeed,
    damage: cfg.gemDamage != null ? cfg.gemDamage : b.char.punch.damage, // a punch's worth
    imgData: DIAMOND_GEM_SRC, aspect: DIAMOND_GEM_ASPECT, color: "#16dbe6",
    spin: (Math.random() < 0.5 ? -1 : 1) * 9, gem: true
  };
}

// Busy with something a throw would break: waits until it's done.
function diamondBusy(b) {
  return !!(b.punch || b.kick || b.swing || b.throwAnim || b.jabAnim || b.koPunch || b.powerState || b.rageState ||
    b.guillo || b.choked || b.rnc || b.suplex || b.armbar || b.guard || b.chAct ||
    specialBusy(b) || b.dazed || b.dizzy || (b.pokeStun || 0) > 0);
}

function startDiamondGuard(b) {
  var dg = b.diamond;
  dg.on = true; dg.t = 0;
  dg.throwT = b.char.diamond.firstThrow; // the first one comes quickly so it's seen
  b.flash = 0.16;
  floater(b.x, b.y - b.r - 30, "DIAMOND GUARD", "crit");
  if (!reduceMotion) shake = Math.max(shake, 10);
  for (var i = 0; i < 26 && !reduceMotion; i++) {
    var a = Math.random() * Math.PI * 2, s = 140 + Math.random() * 260;
    particles.push({ x: b.x, y: b.y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 0.6, max: 0.6,
      size: 3 + Math.random() * 4, color: DIAMOND_C[["L", "m", "W", "d"][i % 4]] });
  }
  crowdReact(0.6);
  playDiamondGuard();
}

// A landed diamond: glassy shards off the hit.
function diamondHitSparkle(target, p) {
  if (reduceMotion) return;
  for (var i = 0; i < 10; i++) {
    var a = Math.random() * Math.PI * 2, s = 90 + Math.random() * 180;
    particles.push({ x: p.x, y: p.y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 0.4, max: 0.4,
      size: 2 + Math.random() * 3, color: DIAMOND_C[i % 2 ? "L" : "W"] });
  }
}

// Sword clash: TO BE CODED IN LATER (Joe, 2026-11-05). Dustin fights off a
// hit from one of the weapons listed in diamond.swordClash.weapons (Gane's
// "bat" to start) by parrying it with a diamond sword. Called by a weapon
// right before it lands; returning true will mean the hit was parried and
// the weapon should skip its damage. For now it never parries.
function diamondSwordClash(defender, attacker, weapon) {
  if (!defender || !defender.diamond || !defender.diamond.on) return false;
  var sc = defender.char.diamond.swordClash;
  if (!sc || !sc.enabled || sc.weapons.indexOf(weapon) < 0) return false;
  return false; // the parry itself comes later
}

// ---------------------------------------------------------------
// The Diamond Dustin skin: flat pixel armor over his fighter art, built
// from shape tests in ball units (-1..1), DIAMOND_N cells across the ball.
// ---------------------------------------------------------------
var DIAMOND_C = { o: "#008c96", d: "#00b3be", m: "#16dbe6", L: "#8ff5df", W: "#e6fffa" };
var DIAMOND_N = 20;

function diamondShapeGrid(test, x0, x1, y0, y1) {
  var N = DIAMOND_N, cols = Math.round((x1 - x0) * N / 2), rows = Math.round((y1 - y0) * N / 2), g = [], i, j;
  for (j = 0; j < rows; j++) {
    var row = [];
    for (i = 0; i < cols; i++) row.push(test(x0 + (i + 0.5) * 2 / N, y0 + (j + 0.5) * 2 / N) ? "L" : ".");
    g.push(row);
  }
  var out = g.map(function (r) { return r.slice(); });
  for (j = 0; j < rows; j++) for (i = 0; i < cols; i++) {
    if (g[j][i] === ".") continue;
    var edge = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(function (o) { return !g[j + o[1]] || g[j + o[1]][i + o[0]] !== "L"; });
    if (edge) { out[j][i] = "o"; continue; }
    var u = x0 + (i + 0.5) * 2 / N;
    // light on the left, deeper toward the right edge
    var right = [1, 2].some(function (k) { return !g[j][i + k] || g[j][i + k] === "."; });
    out[j][i] = right ? "d" : (u > 0.45 ? "m" : "L");
  }
  return { rows: out, x0: x0, y0: y0 };
}

var DIAMOND_PARTS = null;
function diamondParts() {
  if (DIAMOND_PARTS) return DIAMOND_PARTS;
  var A = Math.abs;
  DIAMOND_PARTS = [
    { sh: diamondShapeGrid(function (u, v) { // chestplate, down over the legs
      if (Math.hypot(u, v) > 0.98 || v < -0.4 || v > 0.9) return false;
      if (A(u) < 0.5 && v < -0.3) return false; // wide, shallow V neck
      if (A(u) < 0.3 && v < -0.2) return false;
      return true;
    }, -1.2, 1.2, -0.5, 0.9), dy: 0, hi: [[3, 1], [4, 1], [7, 3], [8, 3], [7, 4]] },
    { sh: diamondShapeGrid(function (u, v) { return u > -1.14 && u < -0.66 && v > -0.54 && v < -0.14; }, -1.2, 1.2, -0.54, -0.1), dy: 0, hi: [[2, 1], [3, 1], [2, 2]] },
    { sh: diamondShapeGrid(function (u, v) { return u < 1.14 && u > 0.66 && v > -0.54 && v < -0.14; }, -1.2, 1.2, -0.54, -0.1), dy: 0, hi: [[18, 1], [19, 1]] },
    { sh: diamondShapeGrid(function (u, v) { // blocky helmet on the head only
      if (A(u) > 0.9 || v < -1.1 || v > -0.38) return false;
      if (v < -1.0 && A(u) > 0.8) return false; // clipped top corners
      if (v > -0.62 && A(u) > 0.12 && A(u) < 0.7) return false; // eye openings either side of the nose guard
      return true;
    }, -1.1, 1.1, -1.1, -0.3), dy: -0.1, hi: [[3, 1], [4, 1], [3, 2]] }
  ];
  return DIAMOND_PARTS;
}

// Drawn once per ball size onto a small canvas, then stamped each frame.
var diamondArmorCache = {};
function diamondArmorImage(r) {
  var key = Math.round(r * 10);
  if (diamondArmorCache[key]) return diamondArmorCache[key];
  var S = 2, pad = 1.3, size = Math.ceil(r * pad * 2 * S);
  var cv = document.createElement("canvas");
  cv.width = cv.height = size;
  var c = cv.getContext("2d"), px = 2 * r / DIAMOND_N;
  c.scale(S, S);
  var cx = r * pad, cy = r * pad;
  diamondParts().forEach(function (part) {
    var sh = part.sh;
    sh.rows.forEach(function (row, j) {
      row.forEach(function (ch, i) {
        if (ch === ".") return;
        if (ch !== "o" && part.hi.some(function (h) { return h[0] === i && h[1] === j; })) ch = "W";
        c.fillStyle = DIAMOND_C[ch];
        c.fillRect(cx + sh.x0 * r + i * px - 0.3, cy + (sh.y0 + part.dy) * r + j * px - 0.3, px + 0.6, px + 0.6);
      });
    });
  });
  diamondArmorCache[key] = { cv: cv, half: r * pad };
  return diamondArmorCache[key];
}

// From drawBall, right over the fighter art (so it follows every pose).
function drawDiamondArmor(b) {
  var dg = b.diamond;
  if (!dg || !dg.on) return;
  var im = diamondArmorImage(b.r), k = Math.min(1, dg.t / 0.35);
  ctx.save();
  if (k < 1) {
    // Snaps on: grows in from a touch big with a white flash.
    var sc = 1.25 - 0.25 * k;
    ctx.translate(b.x, b.y); ctx.scale(sc, sc); ctx.translate(-b.x, -b.y);
    ctx.globalAlpha = k;
  }
  ctx.drawImage(im.cv, b.x - im.half, b.y - im.half, im.half * 2, im.half * 2);
  ctx.restore();
  if (dg.t < 0.6) {
    ctx.save();
    ctx.globalAlpha = (1 - dg.t / 0.6) * 0.8;
    ctx.strokeStyle = DIAMOND_C.W; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.arc(b.x, b.y, b.r + 6 + dg.t * 90, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
  }
}
