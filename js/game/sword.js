// Sword clash: Diamond Guard Dustin's diamond sword (Joe, 2026-11-05).
//
// In Diamond Guard, whenever the other fighter has one of the weapons in
// diamond.swordClash.weapons out (Gane's bat, in Cheater mode), Dustin
// pulls out a diamond sword. He holds it front on, like Gane holds the bat:
//   ready    sword arm out on the side toward them, blade up and out,
//            breathing with it
//   walking  resting back over his shoulder, bouncing with his stride
//   twirl    stood still for a moment, he spins it in his hand
//   guard    as their swing winds up, blade raised across to meet it
//   parry    the blade slams into the swing and shudders back
// Every pose is a target the hand and blade ease toward, so they flow from
// one to the next instead of snapping.
//
// Each swing that would land has parryChance% to be parried (decided as the
// swing starts, so he can raise his guard in time): no damage, the swing is
// knocked away, and they're shoved back. On the duel.after-th parry the
// weapons lock up in a duel: the two of them squared up, trading clash after
// clash, faster and harder, then a slow-motion last clash, and Dustin either
// disarms them (the bat goes spinning off into the crowd) or cuts straight
// through with a Diamond Slash. The sword goes away with their weapon.
"use strict";

var SWORD_DRAW = 0.35, SWORD_PUT_AWAY = 0.3, SWORD_SLASH = 0.42;
var swordDuel = null;   // the duel, while it's on
var flyingBats = [];    // bats knocked out of someone's hands

function resetSwordClash() { swordDuel = null; flyingBats = []; }
function swordDuelActive() { return !!swordDuel; }
// (Once it's decided, whoever lost it is let go: knocked flying or disarmed.)
function swordDuelLocked(b) { return !!(swordDuel && b && (b.id === swordDuel.dId || (b.id === swordDuel.oId && !swordDuel.done))); }

function swordWeaponOut(o) {
  return !!(o && o.alive && o.cheater && o.cheater.mode === "bat") ? "bat" : null;
}

// Ball units, x measured toward the sword side: hand x/y, blade angle (for
// the sword side on screen right; mirrored for the left), free glove x/y.
function swordTarget(b, sw, other) {
  var t = sw.t + b.id * 1.3, sp = Math.sqrt(b.vx * b.vx + b.vy * b.vy), breathe = Math.sin(t * 2.4);
  var swingIn = other && other.chAct && other.chAct.kind === "bat" && sw.actRef === other.chAct && sw.willParry;
  if (sw.parry >= 0) return { key: "parry", p: [1.15, -0.12, -Math.PI / 2 + 0.75, -0.45, 0.05] };
  if (swingIn) return { key: "guard", p: [1.0, -0.15, -Math.PI / 2 + 0.55, -0.42, 0.02] };
  if (sp > 70) {
    var step = Math.abs(Math.sin(t * 9));
    return { key: "walk", p: [0.6, -0.02 - step * 0.07, -Math.PI / 2 - 0.85 + step * 0.06, -0.5, 0.12 - step * 0.05] };
  }
  return { key: "ready", p: [0.98, 0.1 + breathe * 0.03, -Math.PI / 2 + 0.8 + breathe * 0.07, -0.5, 0.08 + breathe * 0.02] };
}

function tickDiamondSword(b, dt) {
  var dg = b.diamond, sc = b.char.diamond.swordClash, o = balls[1 - b.id];
  var want = dg.on && b.alive && !over && sc && sc.enabled && sc.weapons.indexOf(swordWeaponOut(o)) >= 0;
  if (swordDuel && swordDuel.dId === b.id) want = true; // held through the duel
  var sw = dg.sword;
  if (want && !sw) {
    sw = dg.sword = { t: 0, out: true, outT: 0, parry: -1, parries: 0, side: o.x > b.x ? 1 : -1, pose: null, twirl: -1, still: 0 };
    playSwordDraw();
    floater(b.x, b.y - b.r - 30, "DIAMOND SWORD", "crit");
    for (var i = 0; i < 12 && !reduceMotion; i++) {
      var a = Math.random() * Math.PI * 2, s = 60 + Math.random() * 140;
      particles.push({ x: b.x, y: b.y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 0.4, max: 0.4, size: 2 + Math.random() * 3, color: DIAMOND_C[i % 2 ? "L" : "W"] });
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
  }
  // Which side the sword's on: toward them, eased across when they swap sides.
  var wantSide = o.x > b.x ? 1 : -1;
  sw.side += (wantSide - sw.side) * (1 - Math.exp(-dt * 7));
  // The twirl: stood still for a bit, now and then.
  var sp = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
  sw.still = sp < 70 && sw.parry < 0 && !b.punch ? sw.still + dt : 0;
  if (sw.twirl >= 0) { sw.twirl += dt; if (sw.twirl > 0.7) sw.twirl = -1; }
  else if (sw.still > 1.4 && Math.random() < dt * 0.6) { sw.twirl = 0; sw.still = 0; }
  // Eases the pose toward its target (faster into the guard and the parry).
  var tg = swordTarget(b, sw, o), rate = tg.key === "parry" ? 30 : tg.key === "guard" ? 16 : tg.key === "walk" ? 6 : 8;
  if (!sw.pose) sw.pose = tg.p.slice();
  var k = 1 - Math.exp(-dt * rate);
  sw.pose = sw.pose.map(function (v, i) {
    var d = tg.p[i] - v;
    if (i === 2) d = Math.atan2(Math.sin(d), Math.cos(d));
    return v + d * k;
  });
  sw.key = tg.key;
}

// Called by a weapon right before it lands (Gane's bat, cheater.js). True
// when Dustin parried it: the weapon skips its damage.
function diamondSwordClash(defender, attacker, weapon) {
  if (!defender || !defender.diamond || !defender.diamond.on || !defender.alive || swordDuel) return false;
  var sc = defender.char.diamond.swordClash, sw = defender.diamond.sword;
  if (!sc || !sc.enabled || sc.weapons.indexOf(weapon) < 0) return false;
  if (!sw || !sw.out || sw.t < SWORD_DRAW) return false; // still pulling it out
  var will = sw.actRef === attacker.chAct ? sw.willParry : Math.random() * 100 < sc.parryChance;
  if (!will) return false;
  sw.parry = 0; sw.parries++;
  var nx = defender.x - attacker.x, ny = defender.y - attacker.y, nd = Math.sqrt(nx * nx + ny * ny) || 1;
  nx /= nd; ny /= nd;
  // Where the bat meets the blade: part way up it.
  var cp = swordPoint(defender, sw, 0.45), cx = cp.x, cy = cp.y;
  attacker.chAct = null; // the swing is knocked away
  // Enough parries: the weapons lock up.
  if (sc.duel && sw.parries >= sc.duel.after) { startSwordDuel(defender, attacker); return true; }
  if (attacker.cheater) attacker.cheater.cd = Math.max(attacker.cheater.cd, sc.recover);
  attacker.vx = -nx * sc.knockback; attacker.vy = -ny * sc.knockback;
  defender.vx += nx * sc.knockback * 0.25; defender.vy += ny * sc.knockback * 0.25;
  clashFx(cx, cy, -nx, -ny, 1);
  floater(cx, Math.min(defender.y, attacker.y) - defender.r - 34, "PARRY!", "crit"); // over both of them
  crowdReact(0.6);
  playSwordClash(1);
  return true;
}

// A point `f` of the way up the blade (from the current pose).
function swordPoint(b, sw, f) {
  var s = sw.side >= 0 ? 1 : -1, ps = sw.pose || [1, 0, -Math.PI / 2 + 0.6];
  var hx = b.x + ps[0] * s * b.r, hy = b.y + ps[1] * b.r, a = s > 0 ? ps[2] : Math.PI - ps[2], len = b.r * 2.2 * f;
  return { x: hx + Math.cos(a) * len, y: hy + Math.sin(a) * len };
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
  clashFlashes.push({ x: x, y: y, t: 0, max: 0.14 + 0.06 * big, size: 22 * Math.sqrt(big) });
  if (!reduceMotion) { shake = Math.max(shake, 8 + 6 * big); hitStop = Math.max(hitStop, 0.03 + 0.025 * big); }
}
var clashFlashes = [];

// ---------------------------------------------------------------- the duel

function startSwordDuel(d, o) {
  var sc = d.char.diamond.swordClash.duel;
  clearActions(d); clearActions(o);
  d.vx = d.vy = o.vx = o.vy = 0;
  // Squared up side by side (it reads best front on), whichever side each is on.
  var nx = o.x >= d.x ? 1 : -1, ny = 0, nd = 1;
  var gap = d.r + o.r + sc.gap;
  var mx = (d.x + o.x) / 2, my = (d.y + o.y) / 2;
  // Squared up a sword's length apart, kept inside the cage.
  mx = Math.min(W - gap / 2 - d.r, Math.max(gap / 2 + d.r, mx));
  my = Math.min(H - d.r - 10, Math.max(d.r + 10, my));
  swordDuel = {
    dId: d.id, oId: o.id, t: 0, n: 0, clashes: sc.clashes, nx: nx / nd, ny: ny / nd,
    dx0: mx - nx / nd * gap / 2, dy0: my - ny / nd * gap / 2, ox0: mx + nx / nd * gap / 2, oy0: my + ny / nd * gap / 2,
    fromD: { x: d.x, y: d.y }, fromO: { x: o.x, y: o.y },
    outcome: Math.random() * 100 < sc.disarmChance ? "disarm" : "slash", done: false, endT: -1, lean: 0
  };
  floater(mx, my - d.r - 46, "SWORD CLASH!", "crit");
  crowdReact(1);
  playSwordClash(1.4);
  if (!reduceMotion) shake = Math.max(shake, 14);
}

// Timeline: LOCK seconds sliding into place, then the clashes (each one a
// little quicker than the last), a slow-motion last one, then the finish.
var DUEL_LOCK = 0.35, DUEL_FIRST = 0.42, DUEL_LAST = 0.22, DUEL_SLOW = 0.55, DUEL_FINISH = 0.8;
function duelClashTimes(n) {
  var out = [], t = DUEL_LOCK;
  for (var i = 0; i < n - 1; i++) { t += DUEL_FIRST + (DUEL_LAST - DUEL_FIRST) * i / Math.max(1, n - 2); out.push(t); }
  out.push(t + DUEL_SLOW); // the big one
  return out;
}

// From tickDiamond (every frame, before anyone moves).
function tickSwordDuel(dt) {
  flyingBats = flyingBats.filter(function (fb) {
    fb.t += dt; fb.x += fb.vx * dt; fb.y += fb.vy * dt; fb.vy += 900 * dt; fb.rot += fb.spin * dt;
    return fb.t < 2.2;
  });
  clashFlashes = clashFlashes.filter(function (f) { f.t += dt; return f.t < f.max; });
  var sd = swordDuel;
  if (!sd) return;
  var d = balls[sd.dId], o = balls[sd.oId];
  if (!d.alive || (!o.alive && !sd.done)) { swordDuel = null; return; }
  var times = duelClashTimes(sd.clashes), last = times[times.length - 1];
  // Slow motion leading into the last clash.
  var slow = sd.t > times[times.length - 2] && sd.t < last + 0.05 ? 0.4 : 1;
  sd.t += dt * slow;
  if (sd.done) { // the finish: Dustin follows through, they're on their own
    d.vx = d.vy = 0;
    if (sd.t >= sd.endT + DUEL_FINISH) endSwordDuel(d, o, sd);
    return;
  }
  // Slides into place, then rocks with every exchange.
  var k = Math.min(1, sd.t / DUEL_LOCK); k = k * (2 - k);
  var push = duelPush(sd, times);
  d.x = sd.fromD.x + (sd.dx0 - sd.fromD.x) * k - sd.nx * push * d.r; d.y = sd.fromD.y + (sd.dy0 - sd.fromD.y) * k - sd.ny * push * d.r;
  o.x = sd.fromO.x + (sd.ox0 - sd.fromO.x) * k + sd.nx * push * o.r; o.y = sd.fromO.y + (sd.oy0 - sd.fromO.y) * k + sd.ny * push * o.r;
  d.vx = d.vy = o.vx = o.vy = 0;
  // Each clash as its moment passes.
  while (sd.n < times.length && sd.t >= times[sd.n]) {
    var c = duelContact(sd, sd.n), big = sd.n === times.length - 1;
    clashFx(c.x, c.y, -sd.nx, -sd.ny, big ? 3 : 1 + sd.n * 0.15);
    playSwordClash(big ? 2 : 1 + sd.n * 0.08);
    if (big && !reduceMotion) hitStop = Math.max(hitStop, 0.12);
    crowdReact(big ? 1 : 0.35);
    sd.n++;
  }
  // The finish.
  if (!sd.done && sd.t >= last + 0.12) {
    sd.done = true; sd.endT = sd.t;
    if (sd.outcome === "disarm") duelDisarm(d, o, sd); else duelSlash(d, o, sd);
  }
}

// How far each of them is shoved back (+) or lunging in (-), in ball radii.
function duelPush(sd, times) {
  var p = 0;
  times.forEach(function (ct, i) {
    var u = sd.t - ct;
    if (u > -0.12 && u < 0) p -= 0.12 * (1 + u / 0.12); // driving in
    else if (u >= 0 && u < 0.3) p += (i === times.length - 1 ? 0.3 : 0.16) * Math.exp(-u * 9) * Math.cos(u * 22); // the jolt
  });
  return p;
}

// Where clash `i` happens: between them, high and low in turn.
function duelContact(sd, i) {
  var d = balls[sd.dId], o = balls[sd.oId];
  var mx = (d.x + o.x) / 2, my = (d.y + o.y) / 2, px = -sd.ny, py = sd.nx;
  var off = (i % 2 ? 1 : -1) * d.r * 0.45 * (i === sd.clashes - 1 ? 0 : 1);
  return { x: mx + px * off, y: my + py * off - d.r * 0.25 };
}

function duelDisarm(d, o, sd) {
  // The bat goes flying, spinning, out over the cage into the crowd.
  var px = -sd.ny, py = sd.nx, up = py < 0 ? 1 : -1;
  flyingBats.push({ x: o.x - sd.nx * o.r, y: o.y - sd.ny * o.r, vx: sd.nx * 420 + px * up * 200, vy: -760, rot: 0, spin: 17, t: 0, len: o.r * 1.6 });
  if (o.cheater) o.cheater = null; // empty handed: back to fighting fair
  o.vx = sd.nx * 520; o.vy = sd.ny * 520;
  floater(o.x, o.y - o.r - 34, "DISARMED!", "crit");
  if (!reduceMotion) { shake = Math.max(shake, 18); }
  crowdReact(1);
  playWhoosh(); playSwordClash(1.6);
}

function duelSlash(d, o, sd) {
  var cfg = d.char.diamond.swordClash.duel;
  d.diamond.sword.slashT = 0;
  var dealt = hurt(o, cfg.slashDamage, "igbb", d.id); // through the bind: can't be slipped or blocked
  floater(o.x, o.y - o.r - 34, "DIAMOND SLASH!", "crit");
  o.flash = 0.16;
  for (var i = 0; i < 24 && !reduceMotion; i++) {
    var a = Math.atan2(sd.ny, sd.nx) + (Math.random() - 0.5) * 1.6, s = 200 + Math.random() * 360;
    particles.push({ x: o.x, y: o.y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 0.5, max: 0.5, size: 2 + Math.random() * 4, color: DIAMOND_C[["W", "L", "m"][i % 3]] });
  }
  if (!reduceMotion) { shake = Math.max(shake, 26); hitStop = Math.max(hitStop, 0.1); }
  crowdReact(1);
  playSwordSlash();
  if (dealt > 0 && o.alive) beginWallSlam(o, sd.nx, sd.ny, { knockback: cfg.slashKnockback, wallSlams: 2, slamDamage: 4 });
  checkEnd();
}

function endSwordDuel(d, o, sd) {
  swordDuel = null;
  var sw = d.diamond.sword;
  if (sw) { sw.parries = 0; sw.parry = -1; sw.slashT = null; }
  var cfg = d.char.diamond.swordClash;
  if (o.cheater) o.cheater.cd = Math.max(o.cheater.cd, cfg.recover);
}

// ---------------------------------------------------------------- drawing

// drawHands leaves his hands to us while the sword is out.
function diamondHandsBusy(b) { return !!(b.diamond && b.diamond.sword && b.alive); }

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
  var r = b.r, s = sw.side, ps = sw.pose;
  var sideK = Math.max(-1, Math.min(1, s * 1.5)); // shoulders swap smoothly as the side does
  function P(x, y) { return { x: b.x + x * r, y: b.y + y * r }; }
  var hand = P(ps[0] * s, ps[1]);
  var ang = s > 0 ? ps[2] : Math.PI - ps[2];
  // Blend of the mirrored angles while the side is swinging across.
  if (Math.abs(s) < 1) { var a1 = ps[2], a2 = Math.PI - ps[2], w = (s + 1) / 2; ang = Math.atan2(Math.sin(a1) * w + Math.sin(a2) * (1 - w), Math.cos(a1) * w + Math.cos(a2) * (1 - w)); }
  var len = r * 2.2, k = 1, alpha = 1;
  if (sw.out && sw.t < SWORD_DRAW) { // pulled out: swings up from his side
    var e = sw.t / SWORD_DRAW; e = 1 - (1 - e) * (1 - e);
    ang += (1 - e) * 2.2 * (s > 0 ? 1 : -1); k = 0.4 + 0.6 * e; alpha = e;
  }
  if (!sw.out) { alpha = Math.max(0, 1 - sw.outT / SWORD_PUT_AWAY); k = 1 - 0.5 * (1 - alpha); }
  if (sw.twirl >= 0) { var tw = sw.twirl / 0.7; tw = tw * tw * (3 - 2 * tw); ang += tw * Math.PI * 2 * (s > 0 ? 1 : -1); }
  if (sw.parry >= 0) { var pp = sw.parry / SWORD_SLASH; ang += Math.sin(pp * 34) * 0.22 * (1 - pp); } // the shudder
  var free = P(ps[3] * s, ps[4]);
  if (inDuel) {
    var dd = duelSwordPose(b, swordDuel);
    hand = dd.hand; ang = dd.ang; free = dd.free;
  }
  var sh = P(0.66 * sideK, -0.3), fsh = P(-0.66 * sideK, -0.3);
  ctx.save();
  ctx.globalAlpha *= alpha;
  // Free arm and glove first (behind), then the sword arm, blade and grip.
  if (!b.punch) { drawBentArm(b, fsh, free, -s); drawGloveAt(free.x, free.y, r * 0.22, b.char); }
  drawBentArm(b, sh, hand, s);
  if (sw.slashT != null && inDuel) drawSlashArc(b, swordDuel);
  ctx.save();
  ctx.translate(hand.x, hand.y); ctx.rotate(ang + Math.PI / 4); ctx.scale(k, k);
  ctx.imageSmoothingEnabled = false;
  // The image is 16 px with the grip at (2.5, 13.5) and the tip at (15.5, 0.5).
  var u = len / (13 * Math.SQRT2);
  ctx.drawImage(im, -2.5 * u, -13.5 * u, 16 * u, 16 * u);
  ctx.restore();
  drawGloveAt(hand.x, hand.y, r * 0.24, b.char, ang);
  ctx.restore();
}

// Through the duel: the sword arm reaching for each clash point, drawn
// back and swinging in between.
function duelSwordPose(b, sd) {
  var times = duelClashTimes(sd.clashes), r = b.r;
  var i = 0; while (i < times.length - 1 && sd.t > times[i] + 0.06) i++;
  var c = duelContact(sd, i), prev = i > 0 ? times[i - 1] : DUEL_LOCK - 0.2, u = (sd.t - prev) / Math.max(0.05, times[i] - prev);
  u = Math.max(0, Math.min(1.2, u));
  var nx = sd.nx, ny = sd.ny, px = -ny, py = nx;
  var hand = { x: b.x + nx * r * 0.95 + px * r * 0.15, y: b.y + ny * r * 0.95 + py * r * 0.15 - r * 0.15 };
  var aim = Math.atan2(c.y - hand.y, c.x - hand.x);
  var swingDir = i % 2 ? -1 : 1;
  // Wound back early in each exchange, whipping through to the contact.
  var back = u < 0.6 ? Math.sin(u / 0.6 * Math.PI / 2) : 1 - (u - 0.6) / 0.4;
  if (u > 1) back = -0.15 * (1.2 - u) / 0.2;
  var ang = aim + swingDir * 1.1 * Math.max(-0.2, back);
  if (sd.done) {
    var f = Math.min(1, (sd.t - sd.endT) / 0.25);
    if (sd.outcome === "slash") ang = aim - 1.3 + 2.8 * (f * (2 - f)); // a big cut right through
    else ang = aim + f * Math.PI * 1.6; // the twist that rips it away
  }
  return { hand: hand, ang: ang, free: { x: b.x - px * r * 0.5, y: b.y - py * r * 0.5 + r * 0.1 } };
}

// The Diamond Slash's trail.
function drawSlashArc(b, sd) {
  var f = Math.min(1, (sd.t - sd.endT) / 0.45);
  var a0 = Math.atan2(sd.ny, sd.nx) - 1.3, a1 = a0 + 2.8 * Math.min(1, f * 1.8);
  ctx.save();
  ctx.globalAlpha = 1 - f;
  ctx.strokeStyle = DIAMOND_C.W; ctx.lineWidth = b.r * 0.28; ctx.lineCap = "round";
  ctx.shadowColor = DIAMOND_C.m; ctx.shadowBlur = 18;
  ctx.beginPath(); ctx.arc(b.x, b.y, b.r * 2.1, a0, a1); ctx.stroke();
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
      var ang = i * Math.PI / 4 + f.x * 0.01, rr = i % 2 ? f.size * 0.3 : f.size * (1 + (1 - a) * 0.6);
      ctx.lineTo(f.x + Math.cos(ang) * rr, f.y + Math.sin(ang) * rr);
    }
    ctx.closePath(); ctx.fill();
    ctx.restore();
  });
  flyingBats.forEach(function (fb) {
    ctx.save(); ctx.globalAlpha = Math.min(1, (2.2 - fb.t) / 0.4);
    drawBat(fb.x, fb.y, fb.rot, fb.len);
    ctx.restore();
  });
}

// Gane in the duel: both hands on the bat, swinging it into each clash.
function drawDuelBat(o, sd) {
  if (!o.alive) return;
  var times = duelClashTimes(sd.clashes), r = o.r;
  var i = 0; while (i < times.length - 1 && sd.t > times[i] + 0.06) i++;
  var c = duelContact(sd, i), prev = i > 0 ? times[i - 1] : DUEL_LOCK - 0.2, u = (sd.t - prev) / Math.max(0.05, times[i] - prev);
  u = Math.max(0, Math.min(1.2, u));
  var nx = -sd.nx, ny = -sd.ny, px = -ny, py = nx;
  var hand = { x: o.x + nx * r * 0.85 + px * r * 0.1, y: o.y + ny * r * 0.85 + py * r * 0.1 - r * 0.1 };
  var aim = Math.atan2(c.y - hand.y, c.x - hand.x);
  var back = u < 0.6 ? Math.sin(u / 0.6 * Math.PI / 2) : 1 - (u - 0.6) / 0.4;
  if (u > 1) back = -0.15 * (1.2 - u) / 0.2;
  var ang = aim + (i % 2 ? 1 : -1) * 1.1 * Math.max(-0.2, back);
  if (sd.done) return; // decided: gone flying, or back in his normal grip (drawCheater)
  var len = r * 1.6;
  var sh1 = { x: o.x + r * 0.66, y: o.y - r * 0.3 }, sh2 = { x: o.x - r * 0.66, y: o.y - r * 0.3 };
  var h2 = { x: hand.x - Math.cos(ang) * len * 0.12, y: hand.y - Math.sin(ang) * len * 0.12 };
  drawBentArm(o, sh2, h2, -1);
  drawBat(hand.x, hand.y, ang, len);
  drawBentArm(o, sh1, hand, 1);
  drawGloveAt(h2.x, h2.y, r * 0.22, o.char);
  drawGloveAt(hand.x, hand.y, r * 0.22, o.char);
}
