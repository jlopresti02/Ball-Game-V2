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
// Sword clash: when they have a weapon out (Ciryl Gane's bat), Dustin pulls
// out a diamond sword and parries some of the swings (diamondSwordClash).
"use strict";

function hasDiamond(b) { return !!(b && b.char.diamond); }

// From makeBall: every fight starts out of Diamond Guard.
var DIAMOND_SHOW = 5.1;  // seconds on the jumbotron: as long as the Dustin Diamond clip
var diamondShow = 0, diamondShowId = 0; // time left on it, and whose show it is

function initDiamond(b) {
  b.diamond = null;
  diamondShow = 0;
  if (!hasDiamond(b)) return;
  getImg(DIAMOND_GEM_SRC); // starts decoding the diamond so the first throw has it
  getImg(DIAMOND_SWORD_SRC);
  b.diamond = { on: false, t: 0, throwT: 0, sword: null };
}

// Every frame from update().
function tickDiamond(dt) {
  if (diamondShow > 0) diamondShow = Math.max(0, diamondShow - dt);
  balls.forEach(function (b) {
    var dg = b.diamond;
    if (!dg) return;
    if (dg.on) dg.t += dt;
    tickDiamondSword(b, dt);
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
  b.blockBonus = (b.blockBonus || 0) + (b.char.diamond.blockBonus || 0); // a tighter guard in the armor (+5%)
  diamondShow = DIAMOND_SHOW; diamondShowId = b.id; // and he takes over the jumbotron
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

// Sword clash (Joe, 2026-11-05). In Diamond Guard, whenever the other
// fighter has one of the weapons in diamond.swordClash.weapons out (Gane's
// bat, in Cheater mode), Dustin pulls out a diamond sword and holds it in
// his guard hand. Each swing that would land has a parryChance% chance to
// be parried: he slashes into it, the sword and bat clash with sparks and a
// clang, no damage, and the swing is knocked away (Gane is shoved back and
// has to reset before swinging again). The sword goes away once the
// weapon does.

function swordWeaponOut(o) {
  return !!(o && o.alive && o.cheater && o.cheater.mode === "bat") ? "bat" : null;
}

function tickDiamondSword(b, dt) {
  var dg = b.diamond, sc = b.char.diamond.swordClash, o = balls[1 - b.id];
  var want = dg.on && b.alive && !over && sc && sc.enabled && sc.weapons.indexOf(swordWeaponOut(o)) >= 0;
  var sw = dg.sword;
  if (want && !sw) {
    sw = dg.sword = { t: 0, out: true, outT: 0, parry: -1 };
    playSwordDraw();
    floater(b.x, b.y - b.r - 30, "DIAMOND SWORD", "crit");
    for (var i = 0; i < 12 && !reduceMotion; i++) {
      var a = Math.random() * Math.PI * 2, s = 60 + Math.random() * 140;
      particles.push({ x: b.x, y: b.y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 0.4, max: 0.4, size: 2 + Math.random() * 3, color: DIAMOND_C[i % 2 ? "L" : "W"] });
    }
  }
  if (!sw) return;
  sw.t += dt;
  if (sw.parry >= 0) sw.parry += dt;
  if (sw.parry > SWORD_SLASH) sw.parry = -1;
  if (sw.out && !want) { sw.out = false; sw.outT = 0; }
  if (!sw.out) { sw.outT += dt; if (sw.outT > SWORD_PUT_AWAY) dg.sword = null; }
}
var SWORD_DRAW = 0.35, SWORD_PUT_AWAY = 0.3, SWORD_SLASH = 0.32;

// Called by a weapon right before it lands (Gane's bat, cheater.js). True
// when Dustin parried it: the weapon skips its damage.
function diamondSwordClash(defender, attacker, weapon) {
  if (!defender || !defender.diamond || !defender.diamond.on || !defender.alive) return false;
  var sc = defender.char.diamond.swordClash, sw = defender.diamond.sword;
  if (!sc || !sc.enabled || sc.weapons.indexOf(weapon) < 0) return false;
  if (!sw || !sw.out || sw.t < SWORD_DRAW) return false; // still pulling it out
  if (Math.random() * 100 >= sc.parryChance) return false;
  sw.parry = 0;
  var nx = defender.x - attacker.x, ny = defender.y - attacker.y, nd = Math.sqrt(nx * nx + ny * ny) || 1;
  nx /= nd; ny /= nd;
  // Where the bat meets the blade: just off Dustin, toward Gane.
  var cx = defender.x - nx * (defender.r + 14), cy = defender.y - ny * (defender.r + 14);
  sw.cx = cx; sw.cy = cy;
  attacker.chAct = null; // the swing is knocked away
  if (attacker.cheater) attacker.cheater.cd = Math.max(attacker.cheater.cd, sc.recover);
  attacker.vx = -nx * sc.knockback; attacker.vy = -ny * sc.knockback;
  defender.vx += nx * sc.knockback * 0.25; defender.vy += ny * sc.knockback * 0.25;
  impacts.push({ x: cx, y: cy, nx: -nx, ny: -ny, life: 0.35, max: 0.35, color: DIAMOND_C.W });
  for (var i = 0; i < 22 && !reduceMotion; i++) {
    var a = Math.random() * Math.PI * 2, s = 160 + Math.random() * 320;
    particles.push({ x: cx, y: cy, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 0.35, max: 0.35,
      size: 2 + Math.random() * 3, color: i % 3 === 0 ? "#fff6c2" : (i % 3 === 1 ? DIAMOND_C.W : "#c98a4b") });
  }
  if (!reduceMotion) { shake = Math.max(shake, 12); hitStop = Math.max(hitStop, 0.07); }
  floater(cx, Math.min(defender.y, attacker.y) - defender.r - 34, "PARRY!", "crit"); // over both of them
  crowdReact(0.6);
  playSwordClash();
  return true;
}

function drawDiamondSwordsTop() {
  balls.forEach(function (b) { drawDiamondSword(b, balls[1 - b.id], true); });
}

// Drawn just before his gloves, so the guard glove (the one on his -1 side)
// sits over the grip.
function drawDiamondSword(b, other, top) {
  var sw = b.diamond && b.diamond.sword;
  if (!sw || !b.alive) return;
  // Mid parry it's drawn over both fighters (drawDiamondSwordsTop), so the
  // clash isn't hidden behind them.
  if ((sw.parry >= 0) !== !!top) return;
  var im = getImg(DIAMOND_SWORD_SRC);
  if (!im) return;
  var fx, fy; // squared up to them (drawHands faces them too while it's out)
  if (other && other.alive) { var dx = other.x - b.x, dy = other.y - b.y, dd = Math.sqrt(dx * dx + dy * dy) || 1; fx = dx / dd; fy = dy / dd; }
  else { fx = b.id === 0 ? 1 : -1; fy = 0; }
  var px = -fy, py = fx;
  var hx = b.x + fx * b.r * 0.8 - px * b.r * 0.4, hy = b.y + fy * b.r * 0.8 - py * b.r * 0.4;
  // The blade: raised up and out in front of him, ready.
  var ox = other ? other.x - b.x : fx, oy = other ? other.y - b.y : fy, ol = Math.sqrt(ox * ox + oy * oy) || 1;
  ox /= ol; oy /= ol;
  var rx = fx * 0.55 - px * 0.35, ry = fy * 0.55 - py * 0.35 - 0.8;
  var ang = Math.atan2(ry, rx);
  var len = b.r * 1.45, k = 1, alpha = 1;
  if (sw.out && sw.t < SWORD_DRAW) { // pulled out: swings up from his side
    var e = sw.t / SWORD_DRAW; e = 1 - (1 - e) * (1 - e);
    ang = ang + (1 - e) * 2.2; k = 0.4 + 0.6 * e; alpha = e;
  }
  if (!sw.out) { alpha = Math.max(0, 1 - sw.outT / SWORD_PUT_AWAY); k = 1 - 0.5 * (1 - alpha); }
  if (sw.parry >= 0) {
    // The parry: the blade is out on the bat the moment they clash, then
    // swings back to ready.
    var at = Math.atan2(oy, ox), p = sw.parry / SWORD_SLASH;
    var hit = p < 0.25 ? 1 : 1 - (p - 0.25) / 0.75; // on the bat at the clash, then back to ready
    hit = hit * hit * (3 - 2 * hit);
    var da = Math.atan2(Math.sin(at - ang), Math.cos(at - ang));
    ang = ang + da * hit;
    hx += ox * b.r * 0.35 * hit; hy += oy * b.r * 0.35 * hit;
  }
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.translate(hx, hy); ctx.rotate(ang + Math.PI / 4); ctx.scale(k, k);
  ctx.imageSmoothingEnabled = false;
  // The image is 16 px with the grip at (2.5, 13.5) and the tip at (15.5, 0.5).
  var u = len / (13 * Math.SQRT2);
  ctx.drawImage(im, -2.5 * u, -13.5 * u, 16 * u, 16 * u);
  ctx.restore();
  // A bright flash where they met.
  if (sw.parry >= 0 && sw.parry < 0.16 && sw.cx != null) {
    var f = 1 - sw.parry / 0.16;
    ctx.save();
    ctx.globalAlpha = f;
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    for (var i = 0; i < 8; i++) {
      var a2 = i * Math.PI / 4, rr = i % 2 ? 7 : 22 + 10 * (1 - f);
      ctx.lineTo(sw.cx + Math.cos(a2) * rr, sw.cy + Math.sin(a2) * rr);
    }
    ctx.closePath(); ctx.fill();
    ctx.restore();
  }
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
  if (b.flash > 0) { // the white hit flash, over the armor too
    ctx.fillStyle = "rgba(255,255,255," + (b.flash / 0.16) * 0.6 + ")";
    ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2); ctx.fill();
  }
  if (dg.t < 0.6) {
    ctx.save();
    ctx.globalAlpha = (1 - dg.t / 0.6) * 0.8;
    ctx.strokeStyle = DIAMOND_C.W; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.arc(b.x, b.y, b.r + 6 + dg.t * 90, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
  }
}

// ---------------------------------------------------------------
// The jumbotron while the Dustin Diamond clip plays: "DIAMOND GUARD" with
// Dustin dancing in his armor (in the test arena, a banner across the top).
// ---------------------------------------------------------------
function drawDiamondJumbo(x, y, w, h) {
  if (diamondShow <= 0 || !balls || !balls[diamondShowId]) return;
  var b = balls[diamondShowId], look = b.char.look;
  var t = DIAMOND_SHOW - diamondShow, a = Math.min(1, t / 0.25, diamondShow / 0.3);
  ctx.save();
  ctx.globalAlpha = a;
  var bg = ctx.createLinearGradient(0, y, 0, y + h);
  bg.addColorStop(0, "#04262b"); bg.addColorStop(1, "#020c10");
  ctx.fillStyle = bg; ctx.fillRect(x, y, w, h);
  var flash = Math.sin(t * 14) > 0;
  ctx.strokeStyle = flash ? DIAMOND_C.m : DIAMOND_C.W; ctx.lineWidth = 6; ctx.strokeRect(x + 6, y + 6, w - 12, h - 12);
  // Twinkling diamonds in the background
  for (var i = 0; i < 14; i++) {
    var sx = x + 20 + ((i * 97) % (w - 40)), sy = y + 16 + ((i * 53) % (h - 32));
    var tw = 0.5 + 0.5 * Math.sin(t * 6 + i * 1.7);
    ctx.globalAlpha = a * tw * 0.8;
    drawDiamondGem(sx, sy, 6 + (i % 3) * 3);
  }
  ctx.globalAlpha = a;
  // Dustin dancing: bouncing on the beat, swaying, fists pumping in turn.
  if (look) {
    var r = h * 0.3, beat = t * Math.PI * 2 * 2.1;
    var cx = x + 56 + r * 1.55 + Math.sin(beat / 2) * r * 0.12, cy = y + h * 0.56 - Math.abs(Math.sin(beat)) * r * 0.22;
    ctx.save();
    ctx.translate(cx, cy); ctx.rotate(Math.sin(beat / 2) * 0.16); ctx.translate(-cx, -cy);
    drawFighterArt(ctx, cx, cy, r, look, "#0b0f12", { layout: "contained", name: b.char.name });
    ctx.lineWidth = 3; ctx.strokeStyle = "#0b0f12"; ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
    var im = diamondArmorImage(r);
    ctx.drawImage(im.cv, cx - im.half, cy - im.half, im.half * 2, im.half * 2);
    var gr = r * 0.36, up = Math.max(0, Math.sin(beat / 2)), dn = Math.max(0, -Math.sin(beat / 2));
    drawGlove(ctx, cx - r * 1.12, cy + r * (0.42 - 1.0 * up), gr, look, "#0b0f12", -Math.PI / 2 + 0.35 - up * 0.5);
    drawGlove(ctx, cx + r * 1.12, cy + r * (0.42 - 1.0 * dn), gr, look, "#0b0f12", -Math.PI / 2 - 0.35 + dn * 0.5);
    ctx.restore();
  }
  var tx = x + 56 + h * 0.3 * 3.1 + 14, tw2 = x + w - tx - 30;
  jtText("DUSTIN POIRIER", tx + tw2 / 2, y + h * 0.24, 30, "#c9f7f2", "center", "#000000", tw2);
  jtText("DIAMOND GUARD", tx + tw2 / 2, y + h * 0.54, 80, DIAMOND_C.L, "center", DIAMOND_C.d, tw2);
  jtText("ACTIVATED", tx + tw2 / 2, y + h * 0.8, 26, flash ? "#ffffff" : DIAMOND_C.m, "center", "#000000", tw2);
  ctx.restore();
}
function drawDiamondBanner() {
  if (diamondShow <= 0 || stadiumOn()) return;
  drawDiamondJumbo(10, 10, W - 20, 110);
}
function drawDiamondGem(x, y, s) {
  var im = getImg(DIAMOND_GEM_SRC);
  if (!im) return;
  ctx.drawImage(im, x - s * DIAMOND_GEM_ASPECT, y - s, s * 2 * DIAMOND_GEM_ASPECT, s * 2);
}
