// Michael Bisping's cutlass (Joe, 2026-11-21): a pirate's swashbuckler sword
// for sword clashes, drawn from Joe's photo: a curved blade that widens
// toward a clipped point, an aged bronze shell guard with a full knuckle bow
// round to the pommel, and a ribbed bronze grip.
//
// It runs on Ilia's rapier code (rapier.js, which runs on sword.js): his
// character file has a `rapier` block with style "cutlass". So it comes out
// whenever they have a weapon out (Gane's bat, Gaethje's club, Tony's
// katanas, Jiří's samurai swords, Hokit's saber), he parries their swings,
// every few parries it locks into a sword duel (DISARMED or CUTLASS SLASH),
// and against Dustin's diamond sword the two draw on each other and duel.
// It's put away for his Broadside.
//
// What's his own here:
//   poses       a swashbuckler's, not a fencer's: blade held up and back at
//               the shoulder with his free fist on his hip, a downward
//               slashing riposte, a cut swung across on the charge
//   flourishes  a twirl off the wrist, resting it on his shoulder with a
//               swagger, and pointing it at them with a beckon
//   the charge  the rapier's lunge with his own words (`lunge.coilText`,
//               `lungeText`, `hitText`): "AVAST!", then he runs down the red
//               line with the blade swung over his shoulder and cuts across
//               whoever's on it
//   both hands  while it's out he only fights with the cutlass (Joe's weapon
//               rule): no punches, kicks, combos or clinch (cutlassHeld)
//
// Rapier against cutlass (Ilia vs Bisping) never draws on its own: neither
// one carries a weapon that pulls the other's out.
"use strict";

var CUTLASS_LEN = 2.25;

function cutlassStyle(b) { return !!(b && b.rapier && b.char.rapier && b.char.rapier.style === "cutlass"); }
// His sword is out (or coming out): his fists are on the hilt.
function cutlassHeld(b) { return !!(cutlassStyle(b) && b.rapier.sword && b.alive); }
// From the abilities loop: while it's out, no punch or kick (and one he was
// throwing when it came out is dropped).
function cutlassFistsOff(b) {
  if (!cutlassHeld(b)) return false;
  b.punch = null; b.kick = null;
  return true;
}
// Rapier against cutlass: neither one starts it (sword.js bladeRivals).
function cutlassNoRival(b, o) { return !!(b && o && b.rapier && o.rapier && (cutlassStyle(b) || cutlassStyle(o))); }

// ---------------------------------------------------------------- poses

// Same slots as swordTarget: hand x/y (x toward them), blade angle (0 points
// at them, -PI/2 straight up), free hand x/y, lean toward them.
function cutlassTarget(b, sw, other) {
  var t = sw.t + b.id * 1.3, sp = Math.sqrt(b.vx * b.vx + b.vy * b.vy), m = b.igbb;
  if (m && m.move === "lunge") return cutlassChargePose(b, sw, m);
  if (sw.parry >= 0) {
    var p = sw.parry / SWORD_SLASH;
    if (p < 0.4) return { key: "parry", rate: 30, p: [0.75, -0.5, -1.45, -0.6, 0.2, 0.0] };   // blade upright across him, taking it on the edge
    return { key: "riposte", rate: 20, p: [1.05, 0.15, 0.75, -0.6, 0.15, 0.3] };             // and a cut straight back down at them
  }
  var swingIn = other && other.chAct && other.chAct.kind === "bat" && sw.actRef === other.chAct && sw.willParry;
  if (swingIn) return { key: "guard", rate: 18, p: [0.7, -0.45, -1.3, -0.6, 0.2, -0.05] };
  if (sp > 70) { // on the move: up at the shoulder, ready to cut
    var step = Math.abs(Math.sin(t * 9)), lean = Math.min(1, sp / 300);
    return { key: "walk", rate: 7, p: [0.55, -0.3 - step * 0.04, -1.0 + step * 0.06, -0.6, 0.15, 0.05 * lean] };
  }
  // On guard: blade up and back at the shoulder, point toward them, free fist
  // on his hip, bouncing on his feet.
  var sway = Math.sin(t * 1.7), bob = Math.abs(Math.sin(t * 4.2)), circ = Math.sin(t * 2.3);
  return { key: "ready", rate: 8, p: [0.6 + sway * 0.03, -0.32 - bob * 0.04, -0.85 + circ * 0.1, -0.62, 0.22, sway * 0.02] };
}

// ---------------------------------------------------------------- AVAST!
//
// The charge (Joe, 2026-11-21: "a better animation on the avast"), on the
// rapier lunge's clock (rapier.js) with `lunge.warn` stretched for it:
//   raise   (first 40% of the coil) the cutlass thrust straight up at the
//           sky, his free glove pointing at them, a glint running up the
//           blade to a star at the tip as he roars AVAST!
//   cock    (the rest) blade dropped back behind his head, crouched, a stomp
//           of dust at his feet as the red line locks
//   charge  he runs down the line with the blade still back over his
//           shoulder, speed lines streaming behind him, then the last part
//           of the run it comes round in one big swing: a wide silver
//           crescent swooshes across the line in front of him
//   twirl   (the recovery) a spin of the cutlass off his wrist and back on
//           guard
function cutlassChargePose(b, sw, m) {
  var sg = sw.side >= 0 ? 1 : -1, th = Math.atan2(m.dy, m.dx), cfg = b.char.rapier.lunge;
  var a = sg > 0 ? th : Math.PI - th, cx = Math.cos(th) * sg, cy = Math.sin(th);
  if (m.phase === "coil") {
    var u = m.t / cfg.warn;
    if (u < 0.4) return { key: "raise", rate: 18, p: [-0.45, -0.8, -Math.PI / 2 - 0.35, cx * 1.15, cy * 1.15 - 0.2, -0.12] }; // up at the sky off his back shoulder, pointing at them
    return { key: "cock", rate: 14, p: [cx * -0.05, cy * -0.05 - 0.5, a - 2.5, cx * 0.55, cy * 0.55 - 0.05, -0.24] };              // back behind his head, crouched
  }
  if (m.phase === "lunge") {
    var run = m.len ? Math.min(1, m.run / m.len) : 0, sw2 = ease((run - 0.45) / 0.45);
    return { key: "charge", rate: 30, p: [cx * (0.5 + 0.5 * sw2), cy * (0.5 + 0.5 * sw2) - 0.35 + 0.3 * sw2, a - 2.4 + 3.3 * sw2, -0.8, 0.05, 0.35] };
  }
  // The recovery: follow-through out in front, then the twirl (cutlassSpin).
  return { key: "follow", rate: 16, p: [0.85, 0.05, 0.75, -0.65, 0.15, 0.1] };
}

// From drawRapierArms (rapier.js): the twirl after the charge, added to the drawn angle.
function cutlassSpin(b) {
  var m = b.igbb;
  if (cutlassStyle(b) && m && m.move === "lunge" && m.phase === "coil") { // cocked back, trembling to go
    var cu = m.t / b.char.rapier.lunge.warn;
    return cu > 0.45 ? Math.sin(m.t * 70) * 0.05 * Math.min(1, (cu - 0.45) / 0.2) : 0;
  }
  if (!cutlassStyle(b) || !m || m.move !== "lunge" || m.phase !== "recover") return 0;
  var u = Math.min(1, m.t / LUNGE_RECOVER), sg = b.rapier.sword && b.rapier.sword.side >= 0 ? 1 : -1;
  return ease((u - 0.15) / 0.75) * Math.PI * 2 * sg;
}

// From updateRapierLunge (rapier.js), every frame of the charge after its
// clock moves: the stomp, the glint, the swing's sound and its crescent.
function cutlassChargeTick(self, other, m, cfg, dt) {
  if (!cutlassStyle(self)) return;
  var u = m.phase === "coil" ? m.t / cfg.warn : 0;
  if (m.phase === "coil" && u >= 0.12 && !m.cGlint) { m.cGlint = true; playSwordDraw(); }
  if (m.phase === "coil" && u >= 0.62 && !m.cStomp) { // crouching into it: dust off his feet
    m.cStomp = true;
    if (!reduceMotion) {
      shake = Math.max(shake, 5);
      for (var i = 0; i < 16; i++) {
        var a = i / 16 * Math.PI * 2, s = 140 + Math.random() * 90;
        particles.push({ x: self.x + Math.cos(a) * self.r * 0.8, y: self.y + self.r * 0.7 + Math.sin(a) * self.r * 0.25, vx: Math.cos(a) * s, vy: Math.sin(a) * s * 0.35 - 20, life: 0.45, max: 0.45, size: 3 + Math.random() * 4, color: "#d8cdb5" });
      }
    }
  }
  if (m.phase === "lunge") {
    var run = m.len ? m.run / m.len : 1;
    if (!reduceMotion) for (var d = 0; d < 2; d++) particles.push({ x: self.x - m.dx * self.r * 0.6 + (Math.random() - 0.5) * self.r, y: self.y + self.r * 0.6, vx: -m.dx * 90 + (Math.random() - 0.5) * 60, vy: -m.dy * 90 - 30, life: 0.4, max: 0.4, size: 3 + Math.random() * 4, color: "#d8cdb5" });
    if (run >= 0.45 && !m.cSwing) { // the big swing comes round
      m.cSwing = { t: 0, x: self.x, y: self.y, ang: Math.atan2(m.dy, m.dx) };
      playWhoosh();
    }
  }
  if (m.cSwing) { m.cSwing.t += dt; m.cSwing.x = self.x; m.cSwing.y = self.y; }
}

// From drawRapierArms (rapier.js), over the blade: the glint and star on the
// raised blade, speed lines on the charge, the crescent of the swing.
function drawCutlassFx(b, hand, ang, len) {
  var m = b.igbb;
  if (!cutlassStyle(b) || !m || m.move !== "lunge") return;
  var cfg = b.char.rapier.lunge, r = b.r;
  ctx.save();
  if (m.phase === "coil") {
    var u = m.t / cfg.warn, g = Math.max(0, Math.min(1, (u - 0.1) / 0.3)); // the glint runs up the blade
    if (g > 0 && u < 0.6) {
      var ca = Math.cos(ang), sa = Math.sin(ang), gx = hand.x + ca * len * g, gy = hand.y + sa * len * g;
      var star = Math.sin(Math.min(1, (u - 0.1) / 0.5) * Math.PI) * r * 0.95;
      ctx.save();
      ctx.translate(gx, gy);
      ctx.strokeStyle = "rgba(255,240,180," + (0.7 * star / r) + ")"; ctx.lineWidth = 3; // a ring of light off it
      ctx.beginPath(); ctx.arc(0, 0, star * 0.75, 0, Math.PI * 2); ctx.stroke();
      ctx.rotate(u * 3);
      ctx.fillStyle = "rgba(255,255,255,0.97)"; ctx.shadowColor = "#fff2a8"; ctx.shadowBlur = 22;
      ctx.beginPath();
      for (var i = 0; i < 8; i++) { var aa = i * Math.PI / 4, rr = i % 2 ? star * 0.14 : (i % 4 ? star * 0.6 : star); ctx.lineTo(Math.cos(aa) * rr, Math.sin(aa) * rr); }
      ctx.closePath(); ctx.fill();
      ctx.restore();
    }
    drawAvastBurst(b, u);
  } else if (m.phase === "lunge") {
    // Speed lines streaming off behind him.
    var th = Math.atan2(m.dy, m.dx), px = -m.dy, py = m.dx;
    ctx.strokeStyle = "rgba(255,255,255,0.75)"; ctx.lineCap = "round";
    for (var k = 0; k < 6; k++) {
      var off = (k - 2.5) * r * 0.32, l = r * (1.1 + 0.5 * ((k * 37) % 5) / 4);
      var bx = b.x - m.dx * r * 1.05 + px * off, by = b.y - m.dy * r * 1.05 + py * off;
      ctx.lineWidth = 3 - Math.abs(k - 2.5) * 0.5;
      ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx - m.dx * l, by - m.dy * l); ctx.stroke();
    }
  }
  // The crescent: a wide silver swoosh across the line in front of him.
  var cs = m.cSwing;
  if (cs && cs.t < 0.42) {
    var f = cs.t / 0.42, grow = easeOut(Math.min(1, f / 0.35)), fade = 1 - ease((f - 0.35) / 0.65);
    var R = r * (0.5 + CUTLASS_LEN) * 0.92, sg = b.rapier.sword && b.rapier.sword.side >= 0 ? 1 : -1;
    var a0 = cs.ang - sg * 1.5, a1 = cs.ang - sg * 1.5 + sg * 3.0 * grow;
    ctx.globalAlpha = fade;
    ctx.fillStyle = "rgba(238,244,252,0.95)"; ctx.shadowColor = "#ffffff"; ctx.shadowBlur = 18;
    ctx.beginPath();
    ctx.arc(cs.x, cs.y, R, a0, a1, sg < 0);
    ctx.arc(cs.x + Math.cos(cs.ang) * r * 0.35, cs.y + Math.sin(cs.ang) * r * 0.35, R * 0.78, a1, a0, sg > 0);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = "rgba(255,214,120,0.95)"; ctx.lineWidth = 4; // a gold edge on the swing
    ctx.beginPath(); ctx.arc(cs.x, cs.y, R, a0, a1, sg < 0); ctx.stroke();
  }
  ctx.restore();
}

// AVAST! as a comic shout: a jagged white burst over his head that pops in
// and shakes while he roars it, through the wind-up.
function drawAvastBurst(b, u) {
  var r = b.r, pop = u < 0.12 ? easeOut(u / 0.12) * 1.15 : u < 0.2 ? 1.15 - 0.15 * ease((u - 0.12) / 0.08) : 1;
  var jx = u < 0.6 ? Math.sin(u * 90) * r * 0.04 : 0, jy = u < 0.6 ? Math.cos(u * 77) * r * 0.03 : 0;
  var o = balls[1 - b.id], toward = o && o.x < b.x ? -1 : 1; // up on their side, clear of the raised blade
  var x = b.x + toward * r * 1.15 + jx, y = b.y - r * 1.75 + jy, w = r * 1.55 * pop, h = r * 0.8 * pop;
  if (pop <= 0) return;
  ctx.save();
  ctx.translate(x, y); ctx.rotate(-0.08);
  ctx.beginPath();
  for (var i = 0; i < 18; i++) { // the spiky outline
    var a = i / 18 * Math.PI * 2, k = i % 2 ? 0.74 : 1.0;
    ctx.lineTo(Math.cos(a) * w * k, Math.sin(a) * h * k);
  }
  ctx.closePath();
  ctx.fillStyle = "#ffffff"; ctx.fill();
  ctx.strokeStyle = "#1f2328"; ctx.lineWidth = 3.5; ctx.lineJoin = "round"; ctx.stroke();
  // A little tail down to his head.
  var tx = -toward * w * 0.55; // the tail leans back down to his head
  ctx.fillStyle = "#ffffff"; ctx.beginPath(); ctx.moveTo(tx - w * 0.12, h * 0.6); ctx.lineTo(tx - toward * w * 0.18, h * 1.25); ctx.lineTo(tx + w * 0.12, h * 0.58); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(tx - w * 0.12, h * 0.64); ctx.lineTo(tx - toward * w * 0.18, h * 1.25); ctx.lineTo(tx + w * 0.12, h * 0.62); ctx.stroke();
  ctx.font = "900 " + Math.round(r * 0.5 * pop) + "px Impact, 'Arial Black', sans-serif";
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.lineWidth = 5; ctx.strokeStyle = "#5a0f18"; ctx.strokeText("AVAST!", 0, 2);
  ctx.fillStyle = "#e3b23c"; ctx.fillText("AVAST!", 0, 2);
  ctx.restore();
}

// When he's stood still and nothing's coming (u = 0..1).
var CUTLASS_FLOURISHES = {
  twirl: { dur: 1.0, f: function (u) { // spun round twice off his wrist
    var w = u < 0.15 ? ease(u / 0.15) : u < 0.85 ? 1 : 1 - ease((u - 0.85) / 0.15);
    return { w: w, hx: 0.75, hy: -0.1, a: -0.3, spin: ease((u - 0.08) / 0.8) * Math.PI * 4 };
  } },
  shoulder: { dur: 1.8, f: function (u) { // rested on his shoulder, leaning back with a swagger
    var w = u < 0.2 ? ease(u / 0.2) : u < 0.82 ? 1 : 1 - ease((u - 0.82) / 0.18);
    return { w: w, hx: 0.3, hy: -0.35 + Math.sin(u * 14) * 0.015 * w, a: -Math.PI + 0.55, fx: -0.62, fy: 0.22, lean: -0.1 * w };
  } },
  beckon: { dur: 1.6, f: function (u) { // pointed straight at them, free glove waving them in
    var w = u < 0.2 ? ease(u / 0.2) : u < 0.8 ? 1 : 1 - ease((u - 0.8) / 0.2);
    var wave = Math.max(0, Math.sin(u * Math.PI * 6)) * w;
    return { w: w, hx: 0.95, hy: -0.12, a: -0.08, fx: -0.45 + wave * 0.12, fy: -0.55 - wave * 0.15, lean: 0.06 * w };
  } }
};

// ---------------------------------------------------------------- the sword

// The cutlass, (x, y) at his hand on the grip, pointing along ang.
// Which way the edge faces: the curve and cutting edge always turn toward
// the opponent (Joe, 2026-11-21), so the blade flips over as he turns.
// A little hysteresis keeps it from flickering while it points straight at them.
function cutlassFlip(b, hx, hy, ang) {
  var o = balls[1 - b.id], sw = b.rapier && b.rapier.sword;
  if (!o || !sw) return 1;
  var dx = o.x - hx, dy = o.y - hy, d = Math.sqrt(dx * dx + dy * dy) || 1;
  var dot = (-Math.sin(ang) * dx + Math.cos(ang) * dy) / d; // edge normal (local +y) toward them
  if (sw.edge == null) sw.edge = dot >= 0 ? 1 : -1;
  else if (dot > 0.2) sw.edge = 1;
  else if (dot < -0.2) sw.edge = -1;
  return sw.edge;
}

function drawCutlass(x, y, ang, len, k, alpha, flip) {
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.translate(x, y); ctx.rotate(ang); ctx.scale(k, k * (flip || 1));
  var B = "#a07a3a", BD = "#4a3416", BL = "#e0c27a", OUT = "#1f2328";
  // Blade: a curve that widens toward the tip, edge on the outside of the
  // curve (+y), clipped back to the point along the spine.
  var b0 = len * 0.07, L = len;
  var bend = function (u) { return -L * 0.15 * u * u; }; // curves up toward the tip
  var wAt = function (u) { return L * (0.04 + 0.045 * u); };
  function bladePath(grow) {
    var n = 14, i, u, xx;
    ctx.beginPath();
    ctx.moveTo(b0, bend(0) - wAt(0) * 0.5 - grow);
    for (i = 1; i <= n; i++) { u = i / n * 0.8; xx = b0 + (L - b0) * u; ctx.lineTo(xx, bend(u) - wAt(u) * 0.5 - grow); } // spine
    ctx.lineTo(L + grow * 1.2, bend(1) + wAt(1) * 0.1); // clipped point
    for (i = n; i >= 0; i--) { u = i / n * 0.97; xx = b0 + (L - b0) * u; ctx.lineTo(xx, bend(u) + wAt(u) * 0.5 + grow); } // edge
    ctx.closePath();
  }
  ctx.fillStyle = OUT; bladePath(2.5); ctx.fill();
  var gr = ctx.createLinearGradient(0, -L * 0.1, 0, L * 0.05);
  gr.addColorStop(0, "#f6f8fa"); gr.addColorStop(0.45, "#c3ccd4"); gr.addColorStop(0.7, "#8e99a3"); gr.addColorStop(1, "#dfe5ea");
  ctx.fillStyle = gr; bladePath(0); ctx.fill();
  // The bevel along the edge, catching the light (the dotted strip in the photo).
  ctx.strokeStyle = "rgba(255,255,255,0.75)"; ctx.lineWidth = Math.max(1, L * 0.008);
  ctx.beginPath();
  for (var j = 0; j <= 12; j++) { var uu = j / 12 * 0.92, x2 = b0 + (L - b0) * uu; var y2 = bend(uu) + wAt(uu) * 0.2; if (j) ctx.lineTo(x2, y2); else ctx.moveTo(x2, y2); }
  ctx.stroke();
  ctx.scale(1.25, 1.25); // hilt a size up so it reads at fight size
  var g0 = -len * 0.075, g1 = len * 0.045;
  // Grip, ribbed bronze.
  ctx.fillStyle = BD; ctx.fillRect(g0, -len * 0.026, g1 - g0, len * 0.052);
  ctx.fillStyle = "#6b5126"; ctx.fillRect(g0, -len * 0.02, g1 - g0, len * 0.04);
  ctx.strokeStyle = BD; ctx.lineWidth = 1.2;
  for (var i = 0; i < 6; i++) { var gx = g0 + (g1 - g0) * (i + 0.5) / 6; ctx.beginPath(); ctx.moveTo(gx, -len * 0.022); ctx.lineTo(gx, len * 0.022); ctx.stroke(); }
  // Pommel cap.
  ctx.fillStyle = BD; ctx.beginPath(); ctx.ellipse(g0 - len * 0.022, 0, len * 0.03, len * 0.034, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = B; ctx.beginPath(); ctx.ellipse(g0 - len * 0.022, 0, len * 0.022, len * 0.026, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = BL; ctx.beginPath(); ctx.arc(g0 - len * 0.03, -len * 0.01, len * 0.007, 0, Math.PI * 2); ctx.fill();
  // Knuckle bow: a wide D swept from the shell round under the hand to the pommel.
  ctx.lineCap = "round";
  var bow = function () { ctx.beginPath(); ctx.moveTo(g1 + len * 0.01, len * 0.08); ctx.bezierCurveTo(g1, len * 0.17, g0 - len * 0.01, len * 0.16, g0 - len * 0.03, len * 0.02); };
  ctx.strokeStyle = BD; ctx.lineWidth = len * 0.03; bow(); ctx.stroke();
  ctx.strokeStyle = B; ctx.lineWidth = len * 0.018; bow(); ctx.stroke();
  // The shell guard, seen edge on: a deep bronze cup across the blade.
  ctx.fillStyle = BD;
  ctx.beginPath(); ctx.ellipse(g1 + len * 0.022, len * 0.01, len * 0.03, len * 0.1, 0, -Math.PI / 2, Math.PI / 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(g1 + len * 0.012, len * 0.01, len * 0.02, len * 0.1, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = B;
  ctx.beginPath(); ctx.ellipse(g1 + len * 0.014, len * 0.01, len * 0.014, len * 0.088, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = BL;
  ctx.beginPath(); ctx.ellipse(g1 + len * 0.016, -len * 0.04, len * 0.005, len * 0.022, 0, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}
