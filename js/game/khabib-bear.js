// Khabib's ring bear (Joe, 2026-11-06). Every so often a bear climbs over
// the cage and wanders round the ring while the fight goes on.
//   - If it bumps into anyone who isn't Khabib, a cartoon dust cloud goes up
//     (fists, paws, stars, POW! BAM!) and they take a beating; the cloud
//     clears with them seeing stars, and the bear ambles off out of the cage.
//   - If it bumps into Khabib, the dust cloud goes up again, but it clears
//     with the bear knocked out cold. Khabib picks it up over his head and
//     throws it at whoever he's fighting. Then it tumbles off into the crowd.
// The bear isn't solid: fighters only meet it when they bump into it. Only
// one bear at a time. Khabib's part (from the cloud to the throw) runs on
// b.igbb (move "bear"), so ads and other moves wait for it.
// Config: char.bear. Art: Joe's picture, bear-art.js.
"use strict";

var BEAR_H = RADIUS * 5.8;   // standing height (Joe: a lot bigger)
var BEAR_R = RADIUS * 1.5;   // how close counts as bumping into it
var BEAR_CLOUD = RADIUS * 2.1; // the dust cloud's size
var BEAR_KO = 0.55, BEAR_LIFT = 0.45, BEAR_HOLD = 0.4, BEAR_AFTER = 0.3, BEAR_DAZE = 1.3;
var BEAR_WORDS = ["POW!", "BAM!", "WHAM!", "SMACK!", "BONK!", "THWACK!", "OOF!"];

var ringBear = null;
var bearImg = new Image(); bearImg.src = BEAR_SRC;
var bearSideImg = new Image(); bearSideImg.src = BEAR_SIDE_SRC;
var BEAR_SIDE_H = RADIUS * 4.6; // on all fours, side on

function bearRand(r) { return r[0] + Math.random() * (r[1] - r[0]); }
function bearOn(b) { return !!(b && b.igbb && b.igbb.move === "bear"); }

// From makeBall.
function initRingBear(b) {
  var cfg = b.char.bear;
  b.bearN = 0;
  b.bearT = cfg ? bearRand(cfg.first) : Infinity;
  ringBear = null;
}

// Every frame from update().
function tickRingBear(dt) {
  if (!ringBear) {
    if (!started || over) return;
    balls.forEach(function (b) {
      var cfg = b.char.bear;
      if (!cfg || ringBear || !b.alive || b.bearN >= cfg.max) return;
      b.bearT -= dt;
      if (b.bearT > 0 || jumboHold() || swordDuelActive() || balls.some(function (f) { return f.igbb; })) return;
      b.bearN++;
      b.bearT = bearRand(cfg.every);
      spawnRingBear(b);
    });
    return;
  }
  var B = ringBear, cfg = B.cfg, owner = balls[B.ownerId];
  B.t += dt; B.walkT += dt;
  if (B.dazeT > 0) {
    B.dazeT -= dt;
    var dv = balls[B.dazeId];
    if (B.dazeT <= 0 && dv && dv.dazed === true) dv.dazed = false;
  }
  if (over && B.phase !== "leave" && B.phase !== "gone") bearLetGo(B);

  if (B.phase === "enter" || B.phase === "wander" || B.phase === "leave") {
    var dx = B.tx - B.x, dy = B.ty - B.y, d = Math.sqrt(dx * dx + dy * dy);
    var sp = B.phase === "leave" ? cfg.speed * 1.6 : cfg.speed;
    if (d > 2) { var st = Math.min(d, sp * dt); B.x += dx / d * st; B.y += dy / d * st; if (Math.abs(dx) > 4) B.face = dx > 0 ? 1 : -1; B.moving = true; }
    else B.moving = false;
    if (B.phase === "enter" && d <= 2) { B.phase = "wander"; B.t = 0; bearWaypoint(B); }
    else if (B.phase === "wander") {
      if (d <= 2) { B.pause = (B.pause || 0) + dt; if (B.pause > 1.3) { B.pause = 0; bearWaypoint(B); } } // (stood up having a look round)
      if (B.t >= B.life) bearLeave(B);
      else if (!over) bearBumps(B);
    } else if (B.phase === "leave" && d <= 2) { ringBear = null; }
    return;
  }
  if (B.phase === "maul") { tickBearMaul(B, dt); return; }
  if (B.phase === "scrap" || B.phase === "ko" || B.phase === "lift" || B.phase === "hold") { tickBearKhabib(B, owner, dt); return; }
  if (B.phase === "thrown") { tickBearThrown(B, dt); return; }
  if (B.phase === "gone") {
    B.x += B.vx * dt; B.y += B.vy * dt; B.vy += 600 * dt; B.spin += B.spinV * dt;
    B.z = Math.max(0, B.z + B.vz * dt); B.vz -= 900 * dt;
    B.alpha = Math.max(0, 1 - B.t / 1.1);
    if (B.t > 1.1) ringBear = null;
  }
}

function spawnRingBear(owner) {
  var cfg = owner.char.bear, side = Math.floor(Math.random() * 4), m = BEAR_R + 20;
  var along = W * (0.25 + Math.random() * 0.5);
  var sx = [along, W + m, along, -m][side], sy = [-m, along, H + m, along][side];
  var tx = [along, W - m, along, m][side], ty = [m, along, H - m, along][side];
  ringBear = { ownerId: owner.id, cfg: cfg, phase: "enter", t: 0, walkT: 0, x: sx, y: sy, tx: tx, ty: ty, face: 1, moving: true,
    life: bearRand(cfg.wander), spin: 0, z: 0, alpha: 1, puffs: [], pops: [], words: [], dazeT: 0, dazeId: -1 };
  floater(tx, ty - BEAR_H * 0.6, "A BEAR?!", "crit");
  playBearSound("enter");
  crowdReact(0.8);
}

function bearWaypoint(B) {
  var m = BEAR_R + 30;
  B.tx = m + Math.random() * (W - 2 * m); B.ty = m + Math.random() * (H - 2 * m);
}
// Ambles off out of the cage, over the nearest side.
function bearLeave(B) {
  var o = BEAR_R * 3, dl = B.x, dr = W - B.x, dt = B.y, db = H - B.y, mn = Math.min(dl, dr, dt, db);
  B.phase = "leave"; B.t = 0;
  if (mn === dl) { B.tx = -o; B.ty = B.y; } else if (mn === dr) { B.tx = W + o; B.ty = B.y; }
  else if (mn === dt) { B.tx = B.x; B.ty = -o; } else { B.tx = B.x; B.ty = H + o; }
}
function bearLetGo(B) {
  balls.forEach(function (f) { if (f.bearHeld) { f.bearHeld = false; f.invincible = false; f.immuneCd = 0; if (f.dazed === "held") f.dazed = false; } });
  var k = balls[B.ownerId];
  if (bearOn(k)) k.igbb = null;
  bearLeave(B);
}

// Someone walked into it.
function bearBumps(B) {
  for (var i = 0; i < balls.length; i++) {
    var f = balls[i];
    if (!f.alive || f.invincible || specialBusy(f) || f.dazed || swordDuelLocked(f)) continue;
    var dx = f.x - B.x, dy = f.y - B.y;
    if (dx * dx + dy * dy > (f.r + BEAR_R) * (f.r + BEAR_R)) continue;
    var o = balls[1 - f.id];
    if (f.char.bear) { // Khabib
      if (o.igbb || !canStartIgbb(f, o)) continue;
      clearActions(f);
      f.igbb = { move: "bear", phase: "scrap", t: 0 };
      f.vx = f.vy = 0;
      B.phase = "scrap"; B.t = 0; B.vsId = f.id; B.hitT = 0;
    } else {
      clearActions(f);
      f.bearHeld = true; f.dazed = "held"; f.vx = f.vy = 0; f.invincible = true; f.immuneCd = 99;
      B.phase = "maul"; B.t = 0; B.vsId = f.id; B.hitT = 0.15; B.dealt = 0;
    }
    B.cx = (B.x + f.x) / 2; B.cy = (B.y + f.y) / 2;
    floater(B.cx, B.cy - BEAR_CLOUD * 1.6, f.char.bear ? "BEAR FIGHT!" : "MAULED!", "crit");
    playBearSound("bump", 1);
    crowdReact(1);
    if (!reduceMotion) shake = Math.max(shake, 10);
    return;
  }
}

// Inside the cloud: the bump and bang of it, words and limbs flying out.
function tickBearCloud(B, dt, hitEvery, onHit) {
  B.hitT -= dt;
  if (B.hitT <= 0) {
    B.hitT = hitEvery * (0.7 + Math.random() * 0.6);
    var a = Math.random() * Math.PI * 2;
    B.words.push({ txt: BEAR_WORDS[Math.floor(Math.random() * BEAR_WORDS.length)], x: B.cx + Math.cos(a) * BEAR_CLOUD * 1.15, y: B.cy - BEAR_CLOUD * 0.35 + Math.sin(a) * BEAR_CLOUD * 0.75, t: 0, rot: (Math.random() - 0.5) * 0.6 });
    if (onHit) onHit();
    playPunch(12 + Math.random() * 20);
    if (!reduceMotion) shake = Math.max(shake, 6);
  }
  if (Math.random() < dt * 9) {
    var ang = Math.random() * Math.PI * 2;
    B.pops.push({ kind: ["fist", "paw", "foot", "star", "paw"][Math.floor(Math.random() * 5)], ang: ang, t: 0, life: 0.28 + Math.random() * 0.12 });
  }
  if (!reduceMotion && Math.random() < dt * 20) {
    var pa = Math.random() * Math.PI * 2;
    particles.push({ x: B.cx + Math.cos(pa) * BEAR_CLOUD, y: B.cy + BEAR_CLOUD * 0.5, vx: Math.cos(pa) * 120, vy: -40 - Math.random() * 60, life: 0.4, max: 0.4, size: 3 + Math.random() * 4, color: "#d8cdb5" });
  }
  B.words = B.words.filter(function (w) { w.t += dt; return w.t < 0.45; });
  B.pops = B.pops.filter(function (p) { p.t += dt; return p.t < p.life; });
}

// Anyone but Khabib: a beating, then the bear leaves.
function tickBearMaul(B, dt) {
  var cfg = B.cfg, v = balls[B.vsId];
  v.x = B.cx + Math.sin(B.t * 31) * 3; v.y = B.cy + Math.cos(B.t * 27) * 3; v.vx = v.vy = 0;
  B.x = B.cx; B.y = B.cy;
  var per = cfg.maulDamage / Math.round(cfg.maulTime / 0.3);
  tickBearCloud(B, dt, 0.3, function () {
    if (!v.alive || B.dealt >= cfg.maulDamage) return;
    v.invincible = false;
    var d = hurt(v, Math.min(per, cfg.maulDamage - B.dealt), "igbb", B.ownerId);
    v.invincible = v.alive;
    B.dealt += Math.max(d, per);
    if (!v.alive) checkEnd();
  });
  if (B.t >= cfg.maulTime || !v.alive) {
    v.bearHeld = false; v.invincible = false; v.immuneCd = 0;
    if (v.alive) { v.dazed = true; B.dazeT = BEAR_DAZE; B.dazeId = v.id; }
    else v.dazed = false;
    B.words = []; B.pops = [];
    floater(B.cx, B.cy - BEAR_CLOUD * 1.6, "*GROWL*", "note");
    playBearSound("leave");
    crowdReact(1);
    B.y = B.cy; B.x = B.cx + (v.x >= B.cx ? -1 : 1) * (BEAR_R + v.r) * 0.6; // steps out of the dust
    bearLeave(B);
    checkEnd();
  }
}

// Khabib: the scrap, the knockout, the lift and the throw.
function tickBearKhabib(B, k, dt) {
  var cfg = B.cfg, o = balls[1 - k.id], m = k.igbb;
  if (!k.alive || !bearOn(k)) { bearLetGo(B); return; }
  m.t += dt; k.vx = k.vy = 0;
  if (B.phase === "scrap") {
    k.x = B.cx + Math.sin(B.t * 29) * 3; k.y = B.cy + Math.cos(B.t * 33) * 3;
    tickBearCloud(B, dt, 0.26, null);
    if (B.t >= cfg.scrapTime) {
      // Clears with the bear flat out cold beside him.
      var side = o.x >= k.x ? -1 : 1;
      k.x = B.cx; k.y = B.cy;
      B.phase = "ko"; B.t = 0; B.words = []; B.pops = [];
      B.x = Math.max(BEAR_R, Math.min(W - BEAR_R, k.x + side * (k.r + BEAR_SIDE_H * 0.5))); B.y = k.y + k.r * 0.4;
      floater(k.x, k.y - k.r - 34, "KO!", "crit");
      playSlam(); playBearSound("ko"); crowdReact(1);
      if (!reduceMotion) shake = Math.max(shake, 14);
    }
    return;
  }
  if (B.phase === "ko") {
    if (B.t >= BEAR_KO) { B.phase = "lift"; B.t = 0; B.fx = B.x; B.fy = B.y; }
    return;
  }
  if (B.phase === "lift") {
    var u = ease(Math.min(1, B.t / BEAR_LIFT));
    B.x = B.fx + (k.x - B.fx) * u; B.y = B.fy + (k.y - B.fy) * u; B.z = u * (k.r + BEAR_SIDE_H * 0.32);
    if (B.t >= BEAR_LIFT) { B.phase = "hold"; B.t = 0; floater(k.x, k.y - k.r - 34 - B.z, "BEAR TOSS!", "crit"); crowdReact(1); }
    return;
  }
  // Held up over his head, then thrown.
  B.x = k.x; B.y = k.y; B.z = k.r + BEAR_SIDE_H * 0.32 + Math.sin(B.t * 18) * 2;
  if (B.t >= BEAR_HOLD) {
    var dx = o.x - k.x, dy = o.y - k.y, d = Math.sqrt(dx * dx + dy * dy) || 1;
    B.phase = "thrown"; B.t = 0; B.dx = dx / d; B.dy = dy / d; B.dist = d; B.run = 0; B.z0 = B.z;
    B.spinV = (B.dx >= 0 ? 1 : -1) * 11;
    playWhoosh(); playBearSound("throw");
    m.phase = "after"; m.t = 0;
  }
}

function tickBearThrown(B, dt) {
  var cfg = B.cfg, k = balls[B.ownerId], o = balls[1 - B.ownerId];
  if (bearOn(k) && k.igbb.phase === "after") { k.igbb.t += dt; if (k.igbb.t >= BEAR_AFTER) k.igbb = null; }
  var step = cfg.throwSpeed * dt;
  B.run += step; B.x += B.dx * step; B.y += B.dy * step;
  var fk = Math.min(1, B.run / Math.max(1, B.dist));
  B.z = B.z0 * (1 - fk) + Math.sin(Math.PI * Math.min(1, fk)) * 24;
  B.spin += B.spinV * dt;
  var ox = o.x - B.x, oy = o.y - B.y;
  if (o.alive && !o.invincible && ox * ox + oy * oy < (o.r + BEAR_R) * (o.r + BEAR_R)) {
    var dealt = hurt(o, cfg.throwDamage, "igbb", k.id);
    if (dealt > 0) {
      floater(o.x, o.y - o.r - 34, "BEAR BOMB!", "crit");
      playBearSound("land");
      o.flash = 0.16;
      playSlam(); playPunch(cfg.throwDamage);
      if (!reduceMotion) { shake = Math.max(shake, 26); hitStop = Math.max(hitStop, 0.14); }
      impacts.push({ x: o.x, y: o.y, nx: B.dx, ny: B.dy, life: 0.5, max: 0.5, color: "#ffd23f" });
      crowdReact(1);
      if (o.alive) beginWallSlam(o, B.dx, B.dy, { knockback: cfg.knockback, wallSlams: cfg.wallSlams, slamDamage: cfg.slamDamage });
      checkEnd();
    }
    bearGone(B, -B.dx * 0.4 + (Math.random() - 0.5), -0.8);
    return;
  }
  // Missed: it sails on into the cage and tumbles out over it.
  if (B.x < BEAR_R || B.x > W - BEAR_R || B.y < BEAR_R || B.y > H - BEAR_R) {
    if (o.alive) floater(o.x, o.y - o.r - 30, "MISSED!", "dodge");
    playSlam();
    if (!reduceMotion) shake = Math.max(shake, 12);
    bearGone(B, B.dx, B.dy - 0.5);
  }
}
function bearGone(B, ux, uy) {
  var l = Math.sqrt(ux * ux + uy * uy) || 1;
  B.phase = "gone"; B.t = 0; B.vx = ux / l * 380; B.vy = uy / l * 380; B.vz = 380; B.spinV *= 0.6;
  var k = balls[B.ownerId];
  if (bearOn(k)) k.igbb = null;
}

// drawHands leaves Khabib's hands to us while he's holding the bear up.
function bearHandsBusy(b) {
  return !!(ringBear && ringBear.ownerId === b.id && bearOn(b) && (ringBear.phase === "lift" || ringBear.phase === "hold"));
}

// ---------------------------------------------------------------- drawing

// Over the fighters: the bear, or the dust cloud with the fight inside it.
function drawRingBear() {
  var B = ringBear;
  if (!B) return;
  var now = performance.now() / 1000;
  if (B.phase === "maul" || B.phase === "scrap") { drawBearCloud(B, now); return; }
  ctx.save();
  ctx.globalAlpha = B.alpha;
  if (B.phase === "ko") {
    drawBearSide(B.x, B.y, Math.PI, B.x < balls[B.ownerId].x ? 1 : -1); // flat on its back, legs in the air
    for (var i = 0; i < 3; i++) { // seeing stars
      var a = now * 5 + i * Math.PI * 2 / 3;
      drawStar(B.x + Math.cos(a) * BEAR_SIDE_H * 0.35, B.y - BEAR_SIDE_H * 0.5 + Math.sin(a) * 8, 9, "#ffd23f");
    }
  } else if (B.phase === "lift" || B.phase === "hold") {
    var k = balls[B.ownerId];
    drawBearSide(B.x, B.y - B.z, Math.PI, 1); // upside down over his head
    // His arms up holding it.
    var r = k.r, by = B.y - B.z;
    [-1, 1].forEach(function (s) {
      var sh = { x: k.x + s * r * 0.66, y: k.y - r * 0.3 }, hand = { x: k.x + s * BEAR_SIDE_H * 0.3, y: by + BEAR_SIDE_H * 0.12 };
      drawBentArm(k, sh, hand, s);
      drawGloveAt(hand.x, hand.y, r * 0.22, k.char);
    });
  } else if (B.phase === "thrown" || B.phase === "gone") {
    // Its shadow on the mat, then the bear spinning through the air.
    ctx.fillStyle = "rgba(0,0,0,0.18)";
    ctx.beginPath(); ctx.ellipse(B.x, B.y + RADIUS * 0.7, BEAR_SIDE_H * 0.45, BEAR_SIDE_H * 0.12, 0, 0, Math.PI * 2); ctx.fill();
    drawBearSide(B.x, B.y - B.z, Math.PI + B.spin, 1);
  } else {
    if (B.moving) {
      // Walking on all fours, side on: a heavy rolling gait.
      var w = Math.sin(B.walkT * 7);
      ctx.fillStyle = "rgba(0,0,0,0.18)";
      ctx.beginPath(); ctx.ellipse(B.x, B.y + BEAR_SIDE_H * 0.45, BEAR_SIDE_H * 0.45, BEAR_SIDE_H * 0.08, 0, 0, Math.PI * 2); ctx.fill();
      drawBearSide(B.x, B.y - Math.abs(w) * 2.5, w * 0.035, B.face);
    } else {
      // Stopped: up on its back legs, having a look round.
      var sw = Math.sin(B.walkT * 1.5) * 0.25;
      ctx.fillStyle = "rgba(0,0,0,0.18)";
      ctx.beginPath(); ctx.ellipse(B.x, B.y + BEAR_H * 0.44, BEAR_H * 0.2, BEAR_H * 0.06, 0, 0, Math.PI * 2); ctx.fill();
      drawBearSprite(B.x, B.y - BEAR_H * 0.1, sw * 0.09, B.face, 1);
    }
  }
  ctx.restore();
}

// The side-on bear, centred on (x, y), turned by `rot`; face 1 = heading right.
function drawBearSide(x, y, rot, face) {
  if (!(bearSideImg.complete && bearSideImg.naturalWidth)) return;
  var h = BEAR_SIDE_H, w = h * BEAR_SIDE_ASPECT;
  ctx.save();
  ctx.translate(x, y); ctx.rotate(rot); ctx.scale(face > 0 ? -1 : 1, 1); // (the picture faces left)
  ctx.drawImage(bearSideImg, -w / 2, -h / 2, w, h);
  ctx.restore();
}

// Joe's standing bear, centred on (x, y), turned by `rot`, mirrored by `face`.
function drawBearSprite(x, y, rot, face, k) {
  if (!(bearImg.complete && bearImg.naturalWidth)) return;
  var h = BEAR_H * k, w = h * BEAR_ASPECT;
  ctx.save();
  ctx.translate(x, y); ctx.rotate(rot); ctx.scale(face < 0 ? -1 : 1, 1);
  ctx.drawImage(bearImg, -w / 2, -h / 2, w, h);
  ctx.restore();
}

// The cartoon fight cloud: a churning ball of dust with fists, paws, feet
// and stars poking out of it, and POW! BAM! words flying off.
function drawBearCloud(B, now) {
  var cx = B.cx, cy = B.cy - RADIUS * 0.15, R = BEAR_CLOUD * 1.4, i;
  var puffs = [];
  for (i = 0; i < 11; i++) {
    var a = i / 11 * Math.PI * 2 + now * 2.2, wob = Math.sin(now * 17 + i * 2.3);
    puffs.push({ x: cx + Math.cos(a) * R * (0.62 + 0.08 * wob), y: cy + Math.sin(a) * R * (0.5 + 0.06 * wob), r: R * (0.42 + 0.06 * Math.sin(now * 13 + i)) });
  }
  puffs.push({ x: cx, y: cy, r: R * 0.72 });
  // Limbs flying out from inside it (drawn first, so the cloud covers their ends).
  var vs = balls[B.vsId];
  B.pops.forEach(function (p) {
    var u = p.t / p.life, out = Math.sin(Math.PI * u) * R * 0.75;
    var x0 = cx + Math.cos(p.ang) * R * 0.6, y0 = cy + Math.sin(p.ang) * R * 0.5;
    var x = x0 + Math.cos(p.ang) * out, y = y0 + Math.sin(p.ang) * out;
    ctx.save();
    if (p.kind === "fist" && vs) { drawGloveAt(x, y, RADIUS * 0.26, vs.char, p.ang); }
    else if (p.kind === "paw") {
      ctx.fillStyle = "#5a3a22"; ctx.strokeStyle = "#1e130b"; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.arc(x, y, RADIUS * 0.26, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = "#f2ead8";
      for (var c = -1; c <= 1; c++) { var ca = p.ang + c * 0.45; ctx.beginPath(); ctx.arc(x + Math.cos(ca) * RADIUS * 0.3, y + Math.sin(ca) * RADIUS * 0.3, 2.6, 0, Math.PI * 2); ctx.fill(); }
    } else if (p.kind === "foot") {
      ctx.translate(x, y); ctx.rotate(p.ang);
      ctx.fillStyle = "#3b2a1c"; ctx.strokeStyle = "#1e130b"; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.ellipse(0, 0, RADIUS * 0.34, RADIUS * 0.18, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    } else drawStar(x, y, RADIUS * 0.22, "#ffd23f");
    ctx.restore();
  });
  ctx.save();
  // Outline under, fill over: one lumpy shape with a dark edge.
  ctx.fillStyle = "#2a2118";
  puffs.forEach(function (p) { ctx.beginPath(); ctx.arc(p.x, p.y, p.r + 3, 0, Math.PI * 2); ctx.fill(); });
  ctx.fillStyle = "#efe6d2";
  puffs.forEach(function (p) { ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill(); });
  ctx.fillStyle = "#d9cdb4"; // shading
  puffs.forEach(function (p) { ctx.beginPath(); ctx.arc(p.x + p.r * 0.2, p.y + p.r * 0.25, p.r * 0.55, 0, Math.PI * 2); ctx.fill(); });
  // Glimpses of the fight inside: a flash of fur, a glove, swirl lines.
  ctx.strokeStyle = "rgba(60,45,30,0.55)"; ctx.lineWidth = 2.5; ctx.lineCap = "round";
  for (i = 0; i < 4; i++) {
    var sa = now * 9 + i * 1.7;
    ctx.beginPath(); ctx.arc(cx + Math.cos(sa) * R * 0.25, cy + Math.sin(sa * 1.3) * R * 0.2, R * (0.18 + 0.05 * i), sa, sa + 1.6); ctx.stroke();
  }
  ctx.restore();
  B.words.forEach(function (w) {
    var u = w.t / 0.45, sc = u < 0.25 ? 0.5 + 2.4 * u : 1.1 - 0.1 * u;
    ctx.save();
    ctx.globalAlpha = u > 0.75 ? (1 - u) / 0.25 : 1;
    ctx.translate(w.x, w.y - u * 10); ctx.rotate(w.rot); ctx.scale(sc, sc);
    // A spiky burst behind the word.
    ctx.fillStyle = "#e8321e"; ctx.strokeStyle = "#2a1208"; ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (var j = 0; j < 16; j++) { var ba = j / 16 * Math.PI * 2, br = j % 2 ? 15 : 27; ctx.lineTo(Math.cos(ba) * br * 1.45, Math.sin(ba) * br); }
    ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.font = "900 17px 'Arial Black', Impact, sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.lineWidth = 5; ctx.strokeStyle = "#2a1208"; ctx.strokeText(w.txt, 0, 1);
    ctx.fillStyle = "#ffe14a"; ctx.fillText(w.txt, 0, 1);
    ctx.restore();
  });
}
