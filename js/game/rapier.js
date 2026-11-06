// Ilia Topuria's Spanish rapier (Joe, 2026-11-06). Whenever the other
// fighter is armed (one of rapier.weapons out: Gane's bat, Gaethje's golf
// club), Ilia draws a rapier: a long thin blade with a gold cup hilt and a
// swept knuckle bow, held one-handed like a fencer, his free hand raised
// up behind him.
//
// It does everything Dustin's diamond sword does (sword.js runs both):
// parryChance% of their swings get parried, and every duel.after-th parry
// locks them into a sword duel that ends in DISARMED or a slash. Here the
// poses are a fencer's (en garde, blade pointed at them, little stabs to
// test the distance) and his flourishes a matador's.
//
// Plus the lunge (rapier.lunge), every few seconds while it's out and
// they're in range: he coils back while a red line shows where he's going,
// then lunges down it, blade first (the line follows them for most of the
// coil, then locks). Whoever is still on the line gets run
// through: ESTOCADA! (damage, and knocked back into the cage). He can't be
// touched from the coil to the end of the lunge. It runs on b.igbb
// (move "lunge").
"use strict";

var RAPIER_LEN = 2.5;
var RAPIER_C = { o: "#5d6b78", d: "#9fb0c0", m: "#f2c14e", L: "#e4edf6", W: "#ffffff" };
var LUNGE_RECOVER = 0.45;

function rpRand(r) { return r[0] + Math.random() * (r[1] - r[0]); }
function lungeOn(b) { return !!(b && b.igbb && b.igbb.move === "lunge"); }

// From makeBall.
function initRapier(b) {
  var cfg = b.char.rapier;
  b.rapier = cfg && cfg.enabled ? { on: true, sword: null } : null;
  b.lungeT = cfg && cfg.lunge ? rpRand(cfg.lunge.first) : Infinity;
}

// From tickDiamond (diamond.js), every frame.
function tickRapier(b, dt) {
  if (b.rapier) tickDiamondSword(b, dt);
}

// ---------------------------------------------------------------- poses

// Same slots as swordTarget: hand x/y (x toward them), blade angle (0 points
// at them, -PI/2 straight up), free hand x/y, lean toward them.
function rapierTarget(b, sw, other) {
  var t = sw.t + b.id * 1.3, sp = Math.sqrt(b.vx * b.vx + b.vy * b.vy), m = b.igbb;
  if (m && m.move === "lunge" && (m.phase === "coil" || m.phase === "lunge")) {
    // Pointed straight down the line, whichever way it goes (the pose slots
    // are mirrored for his sword side, so the line is turned into them).
    var sg = sw.side >= 0 ? 1 : -1, th = Math.atan2(m.dy, m.dx);
    var a = sg > 0 ? th : Math.PI - th, cx = Math.cos(th) * sg, cy = Math.sin(th);
    if (m.phase === "coil") return { key: "coil", rate: 16, p: [cx * 0.35, cy * 0.35 - 0.12, a, -0.95, -0.85, -0.22] };
    return { key: "lunge", rate: 40, p: [cx * 1.25, cy * 1.25 - 0.05, a, -1.05, -0.35, 0.38] };
  }
  if (sw.parry >= 0) {
    var p = sw.parry / SWORD_SLASH;
    if (p < 0.4) return { key: "parry", rate: 30, p: [0.8, -0.45, -1.25, -0.7, -0.75, 0.05] }; // blade flicked up across, taking it on the guard
    return { key: "riposte", rate: 24, p: [1.2, -0.08, -0.04, -0.85, -0.6, 0.3] };          // and straight back at them: a thrust
  }
  var swingIn = other && other.chAct && other.chAct.kind === "bat" && sw.actRef === other.chAct && sw.willParry;
  if (swingIn) return { key: "guard", rate: 18, p: [0.75, -0.4, -1.0, -0.7, -0.8, -0.05] };
  if (sp > 70) { // moving: blade kept out in front, a little low
    var step = Math.abs(Math.sin(t * 9)), lean = Math.min(1, sp / 300);
    return { key: "walk", rate: 7, p: [0.65, 0.12 - step * 0.04, 0.3 + step * 0.05, -0.68, -0.6, 0.05 * lean] };
  }
  // En garde: point at them, the tip drawing little circles.
  var sway = Math.sin(t * 1.7), breath = Math.sin(t * 3.1), circ = Math.sin(t * 2.6);
  return { key: "ready", rate: 8, p: [0.8 + sway * 0.03, -0.05 + breath * 0.02, -0.2 + circ * 0.08, -0.72, -0.8 + breath * 0.03, sway * 0.02] };
}

// When he's stood still and nothing's coming (u = 0..1).
var RAPIER_FLOURISHES = {
  salute: { dur: 1.5, f: function (u) { // hilt to his chin, blade straight up, then swept down and out
    var w = u < 0.2 ? ease(u / 0.2) : u < 0.85 ? 1 : 1 - ease((u - 0.85) / 0.15);
    var k = ease((u - 0.45) / 0.3);
    return { w: w, hx: 0.22 + 0.68 * k, hy: -0.35 + 0.6 * k, a: -Math.PI / 2 + (Math.PI / 2 + 0.9) * k, lean: -0.04 + 0.06 * k };
  } },
  twirl: { dur: 1.0, f: function (u) { // spun round twice off his wrist
    var w = u < 0.15 ? ease(u / 0.15) : u < 0.85 ? 1 : 1 - ease((u - 0.85) / 0.15);
    return { w: w, hx: 0.75, hy: -0.1, a: -0.2, spin: ease((u - 0.08) / 0.8) * Math.PI * 4 };
  } },
  desplante: { dur: 1.9, f: function (u) { // the matador's pose: blade pointed down, free hand raised high, chest out
    var w = u < 0.25 ? ease(u / 0.25) : u < 0.8 ? 1 : 1 - ease((u - 0.8) / 0.2);
    return { w: w, hx: 0.7, hy: 0.25, a: 1.15, fx: -0.35, fy: -1.1, lean: -0.1 * w };
  } }
};

// ---------------------------------------------------------------- the lunge

// From the abilities loop, before the special. True while it's running.
function updateRapierLunge(self, other, dt) {
  var rc = self.char.rapier, cfg = rc && rc.lunge;
  if (!cfg || !self.rapier) return false;
  var sw = self.rapier.sword;
  if (!lungeOn(self)) {
    if (!started || over) return false;
    if (!sw || !sw.out || sw.t < SWORD_DRAW || sw.parry >= 0 || swordDuelActive()) return false;
    self.lungeT -= dt;
    if (self.lungeT > 0) return false;
    var dx = other.x - self.x, dy = other.y - self.y, d = Math.sqrt(dx * dx + dy * dy) || 1;
    if (d > cfg.range || other.chAct || !canStartIgbb(self, other)) return false;
    clearActions(self);
    self.lungeT = rpRand(cfg.every);
    sw.fl = null; sw.feint = -1;
    var ux = dx / d, uy = dy / d;
    // The line: from him, through them, a little past (never past the cage).
    var len = Math.min(d + other.r + 30, hcRayToWall(self.x, self.y, ux, uy, self.r));
    self.igbb = { move: "lunge", phase: "coil", t: 0, sx: self.x, sy: self.y, dx: ux, dy: uy, len: len, run: 0, hit: false };
    self.invincible = true;
    floater(self.x, self.y - self.r - 30, "EN GARDE", "note");
    playSwordDraw();
  }
  var m = self.igbb;
  m.t += dt;
  self.vx = 0; self.vy = 0; self.immuneCd = 1;
  if (over || !self.alive) { endRapierLunge(self); return false; }
  if (m.phase === "coil") {
    // Follows them with the point for most of the coil, then the line locks.
    if (m.t < cfg.warn * 0.65 && other.alive) {
      var ax = other.x - m.sx, ay = other.y - m.sy, ad = Math.sqrt(ax * ax + ay * ay) || 1;
      m.dx = ax / ad; m.dy = ay / ad;
      m.len = Math.min(ad + other.r + 30, hcRayToWall(m.sx, m.sy, m.dx, m.dy, self.r));
    }
    // Drawn back on his back foot, then off.
    var back = ease(m.t / cfg.warn) * self.r * 0.25;
    self.x = m.sx - m.dx * back; self.y = m.sy - m.dy * back;
    if (m.t >= cfg.warn) {
      m.phase = "lunge"; m.t = 0; m.sx = self.x; m.sy = self.y; m.len += back;
      playWhoosh();
      floater(self.x, self.y - self.r - 30, "LUNGE!", "crit");
    }
    return true;
  }
  if (m.phase === "lunge") {
    m.run = Math.min(m.len, m.run + cfg.speed * dt);
    self.x = m.sx + m.dx * m.run; self.y = m.sy + m.dy * m.run;
    if (!reduceMotion && Math.random() < 0.5) {
      particles.push({ x: self.x - m.dx * self.r, y: self.y + self.r * 0.6, vx: -m.dx * 70 + (Math.random() - 0.5) * 50, vy: -m.dy * 70 - 25, life: 0.3, max: 0.3, size: 2 + Math.random() * 3, color: "#d8cdb5" });
    }
    // Run through: the blade reaches well past his body.
    var tipX = self.x + m.dx * self.r * (0.3 + RAPIER_LEN * 0.95), tipY = self.y + m.dy * self.r * (0.3 + RAPIER_LEN * 0.95);
    var hitD = lungeSegDist(other.x, other.y, self.x, self.y, tipX, tipY);
    if (!m.hit && other.alive && !other.invincible && hitD < other.r * 0.95) {
      m.hit = true;
      var dealt = hurt(other, cfg.damage, "igbb", self.id); // can't be slipped or blocked, only got out of the way of
      if (dealt > 0) {
        floater(other.x, other.y - other.r - 30, "ESTOCADA!", "crit");
        other.flash = 0.16;
        if (!reduceMotion) { shake = Math.max(shake, 16); hitStop = Math.max(hitStop, 0.1); }
        playSwordSlash();
        crowdReact(1);
        impacts.push({ x: other.x - m.dx * other.r * 0.5, y: other.y - m.dy * other.r * 0.5, nx: m.dx, ny: m.dy, life: 0.35, max: 0.35, color: RAPIER_C.W });
        for (var i = 0; i < 18 && !reduceMotion; i++) {
          var a = Math.atan2(m.dy, m.dx) + (Math.random() - 0.5) * 1.4, s = 180 + Math.random() * 320;
          particles.push({ x: other.x, y: other.y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 0.45, max: 0.45, size: 2 + Math.random() * 3, color: RAPIER_C[["W", "L", "m"][i % 3]] });
        }
        if (other.alive) beginWallSlam(other, m.dx, m.dy, { knockback: cfg.knockback, wallSlams: cfg.wallSlams, slamDamage: cfg.slamDamage });
        checkEnd();
      }
      m.len = Math.min(m.len, m.run + 8); // stops dead in them
    }
    if (m.run >= m.len) {
      m.phase = "recover"; m.t = 0; self.invincible = false; self.immuneCd = 0;
      if (!m.hit && other.alive) floater(other.x, other.y - other.r - 30, "MISSED!", "dodge");
    }
    return true;
  }
  // Back up on guard (he can be hit again).
  self.immuneCd = 0;
  if (m.t >= LUNGE_RECOVER) { endRapierLunge(self); return false; }
  return true;
}

function lungeSegDist(px, py, ax, ay, bx, by) {
  var vx = bx - ax, vy = by - ay, l2 = vx * vx + vy * vy || 1;
  var u = Math.max(0, Math.min(1, ((px - ax) * vx + (py - ay) * vy) / l2));
  var qx = ax + vx * u - px, qy = ay + vy * u - py;
  return Math.sqrt(qx * qx + qy * qy);
}

function endRapierLunge(self) {
  self.igbb = null;
  self.invincible = false;
  self.immuneCd = 0;
}

// ---------------------------------------------------------------- drawing

// Under the fighters: the red line he's about to lunge down.
function drawRapierLungeUnder() {
  var now = performance.now() / 1000;
  balls.forEach(function (b) {
    var m = b.igbb;
    if (!lungeOn(b) || !b.alive || (m.phase !== "coil" && m.phase !== "lunge")) return;
    var cfg = b.char.rapier.lunge, wdt = b.r * 0.55, len = m.len + b.r * (0.3 + RAPIER_LEN);
    var show = m.phase === "coil" ? Math.min(1, m.t / 0.12) : Math.max(0, 1 - m.t / 0.4);
    if (show <= 0) return;
    var pulse = 0.7 + 0.3 * Math.sin(now * 20);
    ctx.save();
    ctx.beginPath(); ctx.rect(0, 0, W, H); ctx.clip();
    ctx.translate(m.sx, m.sy); ctx.rotate(Math.atan2(m.dy, m.dx));
    ctx.globalAlpha = show;
    // A narrowing red line: a blade's path, not a bull's.
    ctx.fillStyle = "rgba(220,20,20," + (0.22 * pulse) + ")";
    ctx.beginPath(); ctx.moveTo(0, -wdt / 2); ctx.lineTo(len, -wdt * 0.12); ctx.lineTo(len + wdt * 0.6, 0); ctx.lineTo(len, wdt * 0.12); ctx.lineTo(0, wdt / 2); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = "rgba(220,20,20," + (0.85 * pulse) + ")"; ctx.lineWidth = 2.5; ctx.setLineDash([10, 8]);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = "rgba(235,30,30," + (0.8 * pulse) + ")";
    var o = (now * 260) % 34;
    for (var xx = o; xx < len - 8; xx += 34) {
      var hw = wdt * (0.32 - 0.2 * xx / len);
      ctx.beginPath(); ctx.moveTo(xx, -hw); ctx.lineTo(xx + 10, 0); ctx.lineTo(xx, hw); ctx.lineTo(xx + 4, 0); ctx.closePath(); ctx.fill();
    }
    ctx.restore();
  });
}

// One hand on the grip, the other raised up behind him (sword.js calls this
// from drawDiamondSword, with the shoulders and pose worked out).
function drawRapierArms(b, sw, sh, fsh, hand, ang, len, k, alpha, sideK, pz, inDuel) {
  var r = b.r, sg = sideK >= 0 ? 1 : -1;
  var free = !inDuel && pz.free ? pz.free : { x: fsh.x - sg * r * 0.12, y: fsh.y - r * 0.5 };
  if (inDuel) { // the back hand flung out behind on the big moves
    free = { x: fsh.x - sg * r * 0.25, y: fsh.y - r * 0.45 };
  }
  ctx.save();
  ctx.globalAlpha *= alpha;
  drawBentArm(b, fsh, free, -sg);
  drawGloveAt(free.x, free.y, r * 0.2, b.char);
  if (inDuel && swordDuel.slashLine && swordDuel.done) drawSlashLine(b, swordDuel);
  drawTrail(sw.trail, function (g, a) { drawRapier(g.x, g.y, g.ang, len, k, a); });
  drawRapier(hand.x, hand.y, ang, len, k, 1);
  pushTrail(sw.trail, hand.x, hand.y, ang);
  drawBentArm(b, sh, hand, sg);
  drawGloveAt(hand.x, hand.y, r * 0.22, b.char, ang);
  ctx.restore();
}

// The rapier, (x, y) at his hand on the grip. Gold cup hilt, quillons
// and a knuckle bow, a long, narrow steel blade.
function drawRapier(x, y, ang, len, k, alpha) {
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.translate(x, y); ctx.rotate(ang); ctx.scale(k, k);
  var G = "#e2b23e", GD = "#5e400c", GL = "#fff0b8";
  var g0 = -len * 0.07, g1 = len * 0.06; // grip
  // Blade: from the cup to the point, tapering.
  var b0 = len * 0.08, bw = len * 0.034;
  ctx.fillStyle = "#1f2328"; // dark outline, like the fighters'
  ctx.beginPath(); ctx.moveTo(b0, -bw - 2.5); ctx.lineTo(len + 3, 0); ctx.lineTo(b0, bw + 2.5); ctx.closePath(); ctx.fill();
  var gr = ctx.createLinearGradient(0, -bw, 0, bw);
  gr.addColorStop(0, "#f4f8fc"); gr.addColorStop(0.5, "#b9c6d3"); gr.addColorStop(1, "#7e8c99");
  ctx.fillStyle = gr;
  ctx.beginPath(); ctx.moveTo(b0, -bw); ctx.lineTo(len - 2, 0); ctx.lineTo(b0, bw); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.7)"; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(b0 + 3, 0); ctx.lineTo(len * 0.55, 0); ctx.stroke(); // fuller
  ctx.scale(1.25, 1.25); // hilt drawn a size up so it reads at fight size
  // Grip, wire wrapped.
  ctx.fillStyle = "#2a1a10"; ctx.fillRect(g0, -len * 0.022, g1 - g0, len * 0.044);
  ctx.strokeStyle = "#8a6a3a"; ctx.lineWidth = 1;
  for (var i = 0; i < 6; i++) { var gx = g0 + (g1 - g0) * (i + 0.5) / 6; ctx.beginPath(); ctx.moveTo(gx - 2, -len * 0.022); ctx.lineTo(gx + 2, len * 0.022); ctx.stroke(); }
  // Pommel.
  ctx.fillStyle = GD; ctx.beginPath(); ctx.arc(g0 - len * 0.02, 0, len * 0.032, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = G; ctx.beginPath(); ctx.arc(g0 - len * 0.02, 0, len * 0.024, 0, Math.PI * 2); ctx.fill();
  // Knuckle bow, swept round from the cup to the pommel.
  ctx.strokeStyle = GD; ctx.lineWidth = len * 0.018; ctx.lineCap = "round";
  ctx.beginPath(); ctx.moveTo(g1 + len * 0.01, -len * 0.06); ctx.quadraticCurveTo(0, -len * 0.13, g0 - len * 0.02, -len * 0.02); ctx.stroke();
  ctx.strokeStyle = G; ctx.lineWidth = len * 0.01;
  ctx.beginPath(); ctx.moveTo(g1 + len * 0.01, -len * 0.06); ctx.quadraticCurveTo(0, -len * 0.13, g0 - len * 0.02, -len * 0.02); ctx.stroke();
  // Quillons, straight across.
  ctx.strokeStyle = GD; ctx.lineWidth = len * 0.022;
  ctx.beginPath(); ctx.moveTo(g1 + len * 0.012, -len * 0.15); ctx.lineTo(g1 + len * 0.012, len * 0.15); ctx.stroke();
  ctx.strokeStyle = G; ctx.lineWidth = len * 0.012;
  ctx.beginPath(); ctx.moveTo(g1 + len * 0.012, -len * 0.15); ctx.lineTo(g1 + len * 0.012, len * 0.15); ctx.stroke();
  ctx.fillStyle = G;
  [-1, 1].forEach(function (s) { ctx.beginPath(); ctx.arc(g1 + len * 0.012, s * len * 0.155, len * 0.018, 0, Math.PI * 2); ctx.fill(); });
  // The cup, seen edge on.
  ctx.fillStyle = GD;
  ctx.beginPath(); ctx.ellipse(g1 + len * 0.03, 0, len * 0.028, len * 0.09, 0, -Math.PI / 2, Math.PI / 2); ctx.fill();
  ctx.fillStyle = G;
  ctx.beginPath(); ctx.ellipse(g1 + len * 0.026, 0, len * 0.02, len * 0.08, 0, -Math.PI / 2, Math.PI / 2); ctx.fill();
  ctx.fillStyle = GL;
  ctx.beginPath(); ctx.ellipse(g1 + len * 0.03, -len * 0.035, len * 0.007, len * 0.022, 0, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}
