// Demetrious "Mighty Mouse" Johnson's art (Christian, 2026-11-12), all drawn
// in canvas code like the rest of the fighter art (fighter-art.js calls in).
//
// look.headwear "mouse"   a giant mascot mouse head worn over his own: big
//                         round ears out past the ball (pink inside), a grey
//                         furry head, a pale muzzle with a pink nose and
//                         whiskers, and his short black hair peeking out
//                         under it. Colours: mouseFur, mouseEar, mouseMuzzle,
//                         mouseNose. No eyes or mouth (no faces).
// look.backView           the same fighter seen from behind: back muscles,
//                         the kanji in tattoos.back (his is 夢, "dream",
//                         centre of the back), the back of the mouse head and
//                         his hair at the nape. Shown when he turns his back
//                         after a win (mighty-mouse.js).
// tattoos.leftArm "bands" a four-line armband round the upper arm.
"use strict";

var MOUSE_FUR = "#8e8a94", MOUSE_EAR = "#f2a2b5", MOUSE_MUZZLE = "#d3d0d8", MOUSE_NOSE = "#e2698a";

// The mascot head's outline, shared by the front and the back.
function mouseHeadPath(c, r) {
  c.beginPath(); c.ellipse(0, -r * 0.8, r * 0.98, r * 0.58, 0, 0, Math.PI * 2);
}

function drawMouseEars(c, r, look, ink, back) {
  var fur = look.mouseFur || MOUSE_FUR, inner = look.mouseEar || MOUSE_EAR;
  var lw = Math.max(1, r * 0.04);
  [-1, 1].forEach(function (s) {
    var ex = s * r * 0.84, ey = -r * 1.1, er = r * 0.5;
    var g = c.createRadialGradient(ex - s * er * 0.2, ey - er * 0.35, er * 0.1, ex, ey, er);
    g.addColorStop(0, shadeHex(fur, 0.3)); g.addColorStop(1, shadeHex(fur, -0.18));
    c.fillStyle = g; c.strokeStyle = ink; c.lineWidth = lw;
    c.beginPath(); c.arc(ex, ey, er, 0, Math.PI * 2); c.fill(); c.stroke();
    // Pink inside (from behind it's just a darker cup of fur)
    c.fillStyle = back ? shadeHex(fur, -0.12) : inner;
    c.beginPath(); c.arc(ex - s * er * 0.06, ey + er * 0.08, er * 0.64, 0, Math.PI * 2); c.fill();
    c.strokeStyle = back ? shadeHex(fur, -0.3) : shadeHex(inner, -0.22); c.lineWidth = lw * 0.6; c.stroke();
    if (!back) {
      c.fillStyle = "rgba(255,255,255,0.35)";
      c.beginPath(); c.ellipse(ex - s * er * 0.22, ey - er * 0.18, er * 0.16, er * 0.26, s * 0.5, 0, Math.PI * 2); c.fill();
    }
  });
}

// Short black hair sticking out from under the mascot head, at both sides of
// the neck (and across the nape from behind).
function drawMouseHairPeek(c, r, look, back) {
  c.fillStyle = look.hairColor || "#121010";
  if (back) {
    c.beginPath();
    c.moveTo(-r * 0.62, -r * 0.4); c.quadraticCurveTo(0, -r * 0.16, r * 0.62, -r * 0.4);
    c.lineTo(r * 0.5, -r * 0.5); c.quadraticCurveTo(0, -r * 0.34, -r * 0.5, -r * 0.5); c.closePath(); c.fill();
    return;
  }
  // A short band along the edge of the ball at each temple, under the head.
  c.save();
  c.beginPath(); c.arc(0, 0, r, 0, Math.PI * 2); c.clip();
  [-1, 1].forEach(function (s) {
    var a0 = s < 0 ? Math.PI + 0.3 : -0.3, a1 = s < 0 ? Math.PI + 0.62 : -0.62;
    c.beginPath(); c.arc(0, 0, r * 1.02, a0, a1, s > 0); c.arc(0, 0, r * 0.8, a1, a0, s < 0); c.closePath(); c.fill();
  });
  c.restore();
}

// From drawFighterArt (contained layout), over the head.
function drawMouseHead(c, r, look, ink) {
  var fur = look.mouseFur || MOUSE_FUR, muzzle = look.mouseMuzzle || MOUSE_MUZZLE, nose = look.mouseNose || MOUSE_NOSE;
  var lw = Math.max(1, r * 0.04);
  c.save();
  c.translate(0, -r * (look.mouseLift || 0));
  drawMouseHairPeek(c, r, look, false);
  drawMouseEars(c, r, look, ink, false);
  // The head: grey fur lit from the top left, shadowed underneath.
  mouseHeadPath(c, r);
  var g = c.createRadialGradient(-r * 0.32, -r * 1.06, r * 0.08, 0, -r * 0.78, r * 1.05);
  g.addColorStop(0, shadeHex(fur, 0.36)); g.addColorStop(0.55, fur); g.addColorStop(1, shadeHex(fur, -0.3));
  c.fillStyle = g; c.fill();
  c.strokeStyle = ink; c.lineWidth = lw; c.stroke();
  // A few tufts of fur along the top.
  c.save(); mouseHeadPath(c, r); c.clip();
  c.strokeStyle = shadeHex(fur, -0.28); c.lineWidth = Math.max(1, r * 0.022); c.lineCap = "round";
  [[-0.5, -1.2], [-0.2, -1.32], [0.12, -1.33], [0.42, -1.24], [-0.66, -0.98], [0.68, -0.98]].forEach(function (p) {
    c.beginPath(); c.moveTo(r * p[0], r * p[1]); c.quadraticCurveTo(r * (p[0] + 0.05), r * (p[1] + 0.09), r * (p[0] + 0.02), r * (p[1] + 0.15)); c.stroke();
  });
  c.restore();
  // Muzzle: a pale snout low on the head.
  c.fillStyle = muzzle;
  c.beginPath(); c.ellipse(0, -r * 0.5, r * 0.42, r * 0.22, 0, 0, Math.PI * 2); c.fill();
  c.strokeStyle = shadeHex(fur, -0.25); c.lineWidth = lw * 0.55; c.stroke();
  // Whiskers fanning out each side.
  c.strokeStyle = "#2b2830"; c.lineWidth = Math.max(1, r * 0.022); c.lineCap = "round";
  [-1, 1].forEach(function (s) {
    [-0.07, 0, 0.07].forEach(function (dy, i) {
      c.beginPath(); c.moveTo(s * r * 0.24, -r * (0.53 - dy));
      c.quadraticCurveTo(s * r * 0.6, -r * (0.6 - dy * 1.6), s * r * (0.98 - i * 0.04), -r * (0.66 - dy * 2.6)); c.stroke();
    });
  });
  // Pink nose with a shine.
  c.fillStyle = nose; c.strokeStyle = shadeHex(nose, -0.4); c.lineWidth = lw * 0.6;
  c.beginPath(); c.ellipse(0, -r * 0.62, r * 0.12, r * 0.085, 0, 0, Math.PI * 2); c.fill(); c.stroke();
  c.fillStyle = "rgba(255,255,255,0.65)";
  c.beginPath(); c.ellipse(-r * 0.04, -r * 0.65, r * 0.035, r * 0.022, -0.4, 0, Math.PI * 2); c.fill();
  c.restore();
}

// The four-line armband round the upper arm, inside the shoulder at side `s`
// (torso space, from drawArtBody).
function drawArmBands(c, r, s, inkCol, lw) {
  c.save();
  c.beginPath(); c.arc(s * r * 1.02, -r * 0.3, r * 0.4, 0, Math.PI * 2); c.clip();
  c.strokeStyle = inkCol; c.lineWidth = lw(0.05); c.globalAlpha = 0.95;
  for (var i = 0; i < 4; i++) {
    var y = -r * 0.42 + i * r * 0.1;
    c.beginPath(); c.moveTo(s * r * 0.6, y); c.quadraticCurveTo(s * r * 0.8, y + r * 0.06, s * r * 1.02, y); c.stroke();
  }
  c.restore();
}

// From drawFighterArt when look.backView is set (contained layout): the
// fighter from behind.
function drawArtBack(c, r, look, ink, name) {
  var skin = look.skin, line = shadeHex(skin, -0.38), hi = shadeHex(skin, 0.24);
  var lw = function (k) { return Math.max(1, r * k); };
  c.save();
  c.beginPath(); c.arc(0, 0, r, 0, Math.PI * 2); c.clip();
  var g = c.createRadialGradient(r * 0.3, -r * 0.45, r * 0.1, 0, 0, r * 1.05);
  g.addColorStop(0, shadeHex(skin, 0.12)); g.addColorStop(0.7, skin); g.addColorStop(1, shadeHex(skin, -0.24));
  c.fillStyle = g; c.fillRect(-r, -r, r * 2, r * 2);
  c.lineCap = "round"; c.lineJoin = "round";
  // Torso squeezed into the middle third, as in the front view.
  c.save(); c.translate(0, r * 0.11); c.scale(0.86, 0.59);
  c.strokeStyle = line; c.lineWidth = lw(0.05); c.globalAlpha = 0.75;
  // Traps sloping off the neck, delts at the sides
  [-1, 1].forEach(function (s) {
    c.beginPath(); c.moveTo(s * r * 0.14, -r * 0.82); c.quadraticCurveTo(s * r * 0.36, -r * 0.66, s * r * 0.66, -r * 0.62); c.stroke();
    c.beginPath(); c.arc(s * r * 1.02, -r * 0.3, r * 0.4, s > 0 ? Math.PI - 1.05 : -1.05, s > 0 ? Math.PI + 1.05 : 1.05); c.stroke();
  });
  // Shoulder blades and lats
  [-1, 1].forEach(function (s) {
    c.globalAlpha = 0.35; c.fillStyle = hi;
    c.beginPath(); c.ellipse(s * r * 0.34, -r * 0.42, r * 0.2, r * 0.14, s * 0.3, 0, Math.PI * 2); c.fill();
    c.globalAlpha = 0.75;
    c.beginPath(); c.moveTo(s * r * 0.16, -r * 0.56); c.quadraticCurveTo(s * r * 0.2, -r * 0.2, s * r * 0.46, -r * 0.12); c.stroke();
    c.beginPath(); c.moveTo(s * r * 0.62, -r * 0.42); c.quadraticCurveTo(s * r * 0.58, r * 0.06, s * r * 0.34, r * 0.4); c.stroke();
  });
  // The spine groove
  c.globalAlpha = 0.6; c.lineWidth = lw(0.04);
  c.beginPath(); c.moveTo(0, -r * 0.74); c.lineTo(0, r * 0.4); c.stroke();
  c.globalAlpha = 1;
  var tat = look.tattoos || {};
  var inkCol = "rgba(22,24,34,0.78)";
  // From behind his left arm is on the left of the screen.
  if (tat.leftArm === "bands") drawArmBands(c, r, -1, inkCol, lw);
  if (tat.rightArm === "bands") drawArmBands(c, r, 1, inkCol, lw);
  c.restore();
  // The kanji, big in the middle of the upper back.
  if (tat.back) {
    c.save();
    c.fillStyle = inkCol; c.textAlign = "center"; c.textBaseline = "middle";
    c.font = "900 " + (r * 0.5) + 'px "Hiragino Mincho ProN", "Yu Mincho", "Noto Serif CJK JP", "Songti SC", serif';
    c.fillText(tat.back, 0, r * 0.06);
    c.restore();
  }
  // Shorts from behind: waistband, side stripes in the trim
  var sTop = r * 0.36;
  c.fillStyle = look.shorts; c.fillRect(-r, sTop, r * 2, r);
  var sg = c.createLinearGradient(0, sTop, 0, r);
  sg.addColorStop(0, "rgba(255,255,255,0.1)"); sg.addColorStop(1, "rgba(0,0,0,0.3)");
  c.fillStyle = sg; c.fillRect(-r, sTop, r * 2, r);
  c.fillStyle = look.trim;
  c.fillRect(-r, sTop, r * 2, r * 0.07);
  c.fillStyle = ink;
  c.beginPath(); c.moveTo(-r * 0.06, r); c.lineTo(0, r * 0.78); c.lineTo(r * 0.06, r); c.closePath(); c.fill();
  c.strokeStyle = ink; c.lineWidth = lw(0.05);
  c.beginPath(); c.moveTo(-r, sTop); c.lineTo(r, sTop); c.stroke();
  // The back of the head: his own short hair, or the mouse head over it.
  if (look.headwear === "mouse") {
    drawMouseHairPeek(c, r, look, true);
  } else {
    c.fillStyle = look.hairColor;
    c.beginPath(); c.moveTo(-r, -r); c.lineTo(r, -r); c.lineTo(r, -r * 0.5);
    c.quadraticCurveTo(0, -r * 0.18, -r, -r * 0.5); c.closePath(); c.fill();
  }
  var rg = c.createRadialGradient(r * 0.2, -r * 0.25, r * 0.6, 0, 0, r);
  rg.addColorStop(0, "rgba(0,0,0,0)"); rg.addColorStop(1, "rgba(0,0,0,0.25)");
  c.fillStyle = rg; c.fillRect(-r, -r, r * 2, r * 2);
  c.restore();
  c.strokeStyle = ink; c.lineWidth = Math.max(2, r * 0.077);
  c.beginPath(); c.arc(0, 0, r, 0, Math.PI * 2); c.stroke();
  if (look.headwear === "mouse") {
    // The back of the mascot head: plain fur, a seam down the middle.
    var fur = look.mouseFur || MOUSE_FUR;
    c.save();
    drawMouseEars(c, r, look, ink, true);
    mouseHeadPath(c, r);
    var hg = c.createRadialGradient(r * 0.3, -r * 1.06, r * 0.08, 0, -r * 0.78, r * 1.05);
    hg.addColorStop(0, shadeHex(fur, 0.3)); hg.addColorStop(0.55, fur); hg.addColorStop(1, shadeHex(fur, -0.32));
    c.fillStyle = hg; c.fill();
    c.strokeStyle = ink; c.lineWidth = Math.max(1, r * 0.04); c.stroke();
    c.strokeStyle = shadeHex(fur, -0.35); c.lineWidth = Math.max(1, r * 0.025); c.setLineDash([r * 0.05, r * 0.04]);
    c.beginPath(); c.moveTo(0, -r * 1.36); c.quadraticCurveTo(r * 0.04, -r * 0.8, 0, -r * 0.24); c.stroke();
    c.restore();
  }
}
