// Khabib's ground elbows (Christian, 2026-11-14). In Father's Plan's ground
// and pound (special.js) some of the strikes he drops on them are elbows,
// drawn as elbows: his arm folded, the point of the elbow coming down onto
// them, the glove tucked back by his head.
//
//   "groundElbows": { "on": [2, 4, 5] }   in his character file
//
// on   which strikes are elbows (1 is the first; the last one is the big one,
//      with the long wind-up). The rest stay fists. Leave the block out and
//      they're all fists, as before.
//
// An elbow does the same damage as a fist (special.damage), so the move hits
// exactly as hard as it did; it lands with the elbow's sharp crack. The big
// last one, when it's an elbow, brings up the commentator's real call on the
// lower-third (commentary-calls.js): "Oh, big elbow from Nurmagomedov!".
// Which strikes are elbows is fixed by `on` (no dice), so a saved fight plays
// out the same.
"use strict";

// From updateFathersPlan (special.js) as strike `n` (1-based) starts.
function fpElbowOn(self, gp, n) {
  var ge = self && self.char && self.char.groundElbows;
  gp.elbow = !!(ge && ge.on && ge.on.indexOf(n) >= 0);
}

// From landFpPunch (special.js) when it lands: the elbow's crack.
function fpElbowLand(self, other, gp, dealt) {
  if (!gp.elbow || !(dealt > 0)) return;
  try {
    var ac = getAudioCtx();
    if (!ac) return;
    if (ac.state === "suspended") ac.resume();
    var t = ac.currentTime;
    caneBurst(ac, t, 2600, 2.4, gp.last ? 0.8 : 0.5, 0.05);
    caneTone(ac, t, "triangle", 620, 240, gp.last ? 0.4 : 0.25, 0.08);
    if (gp.last) caneBurst(ac, t + 0.02, 6200, 1.2, 0.35, 0.12);
  } catch (e) { /* never let audio break the game */ }
}

// From drawFpPound (special.js) in place of the fist: the elbow coming down.
// Same path as the fist (cocked up high, the target ring closing in, then
// driven straight down), with the point of the elbow leading.
function drawFpElbow(b, gp) {
  var o = balls[1 - b.id], r = b.r;
  var size = (b.char.punch.size || 15) * (gp.last ? 1.5 : 1.2), limb = size * 0.72;
  var toward = o.x < b.x ? -1 : 1;
  var shx = b.x + toward * gp.side * r * 0.4, shy = b.y - r * 0.2;
  var cockX = b.x + toward * r * (gp.side > 0 ? 0.6 : 0.15), cockY = b.y - r * (gp.last ? 1.75 : 1.4);
  var hitX = o.x - toward * o.r * 0.1, hitY = o.y - o.r * 0.55;
  var ex, ey, k;
  if (gp.t < gp.wind) {
    k = gp.t / gp.wind; k = k * k * (3 - 2 * k);
    ex = shx + (cockX - shx) * k; ey = shy + (cockY - shy) * k;
    var tr = (gp.last ? 5 : 3) * k;
    ex += (Math.random() - 0.5) * tr; ey += (Math.random() - 0.5) * tr;
  } else if (gp.t < gp.wind + FP_STRIKE) {
    k = (gp.t - gp.wind) / FP_STRIKE;
    ex = cockX + (hitX - cockX) * k; ey = cockY + (hitY - cockY) * k;
  } else {
    k = Math.min(1, (gp.t - gp.wind - FP_STRIKE) / FP_RECOIL);
    ex = hitX + (shx - hitX) * k * 0.6; ey = hitY + (cockY - hitY) * k * 0.35;
  }
  // The forearm folds back: the glove stays tucked between the elbow and his head.
  var hx = ex + (b.x + toward * r * 0.15 - ex) * 0.62, hy = ey + (b.y - r * 0.45 - ey) * 0.62;
  ctx.save();
  if (gp.t < gp.wind) { // the target ring closing in
    var w = gp.t / gp.wind;
    ctx.globalAlpha = 0.35 + 0.5 * w;
    ctx.strokeStyle = theme.hit; ctx.lineWidth = 3 + 2 * w;
    ctx.beginPath(); ctx.arc(hitX, hitY, o.r * (1.6 - 1.1 * w), 0, Math.PI * 2); ctx.stroke();
    ctx.globalAlpha = 1;
  }
  if (gp.t >= gp.wind && gp.t < gp.wind + FP_STRIKE + 0.05) { // speed lines behind the elbow
    ctx.strokeStyle = theme.ink; ctx.lineWidth = 3; ctx.globalAlpha = 0.55;
    for (var i = -2; i <= 2; i++) {
      ctx.beginPath(); ctx.moveTo(ex + i * size * 0.35, ey - size * 1.1); ctx.lineTo(ex + i * size * 0.35, ey - size * 3); ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }
  if (gp.last && gp.t < gp.wind) { // the big one: a pulsing glow round the raised elbow
    ctx.fillStyle = theme.hit; ctx.globalAlpha = 0.25 + 0.2 * Math.sin(gp.t * 40);
    ctx.beginPath(); ctx.arc(ex, ey, size * 1.4, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;
  }
  strokeLimb(limb, armColor(b.char), function () { ctx.moveTo(shx, shy); ctx.lineTo(ex, ey); ctx.lineTo(hx, hy); });
  // The point of the elbow, white for a moment as it lands.
  ctx.fillStyle = shadeHex((b.char.look && b.char.look.skin) || "#d9a27e", -0.12); ctx.strokeStyle = theme.wall; ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.arc(ex, ey, limb * 0.66, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  var flash = gp.t >= gp.wind + FP_STRIKE ? Math.max(0, 1 - (gp.t - gp.wind - FP_STRIKE) / 0.12) : 0;
  if (flash > 0) {
    ctx.globalAlpha = flash; ctx.fillStyle = "#ffffff";
    ctx.beginPath(); ctx.arc(ex, ey + limb * 0.15, limb * 0.45, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;
  }
  drawGloveAt(hx, hy, size * 0.62, b.char, Math.atan2(hy - ey, hx - ex));
  ctx.restore();
}
