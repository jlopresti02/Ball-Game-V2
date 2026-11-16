// Fedor Emelianenko's haircut from Joe's photos (Joe, 2026-11-15): look.hair
// "fedor" in his character file. Shaved close all over: a faint light-brown
// stubble shadow over the scalp, the hairline gone back at both temples with
// a rounded front in the middle, the sides cut down to nothing over the ears,
// and the light catching the top of his head. Drawn from the head layer in
// fighter-art.js (the hair branch for "fedor").
"use strict";

// The edge of the stubble: down to just above the ears at the sides, swept
// back up at the temples, a soft rounded front in the middle.
function fdHairlinePath(c, r) {
  c.beginPath();
  c.moveTo(-r, -r * 0.56);
  c.lineTo(-r * 0.84, -r * 0.62);
  c.quadraticCurveTo(-r * 0.62, -r * 0.68, -r * 0.52, -r * 0.8);
  c.quadraticCurveTo(-r * 0.42, -r * 0.86, -r * 0.28, -r * 0.8);
  c.quadraticCurveTo(0, -r * 0.71, r * 0.28, -r * 0.8);
  c.quadraticCurveTo(r * 0.42, -r * 0.86, r * 0.52, -r * 0.8);
  c.quadraticCurveTo(r * 0.62, -r * 0.68, r * 0.84, -r * 0.62);
  c.lineTo(r, -r * 0.56); c.lineTo(r, -r * 1.05); c.lineTo(-r, -r * 1.05); c.closePath();
}

function drawFedorHair(c, r, look, lw) {
  var hc = look.hairColor || "#9a7a5c";
  c.save();
  // The stubble: a see-through shadow, a touch darker toward the crown.
  var g = c.createLinearGradient(0, -r, 0, -r * 0.55);
  g.addColorStop(0, hc); g.addColorStop(1, shadeHex(hc, 0.12));
  c.fillStyle = g; c.globalAlpha = 0.6;
  fdHairlinePath(c, r); c.fill();
  // Grain, fading out toward the hairline.
  c.save(); fdHairlinePath(c, r); c.clip();
  var rnd = artRand(23);
  c.fillStyle = shadeHex(hc, -0.3);
  for (var i = 0; i < 220; i++) {
    var x = (rnd() * 2 - 1) * r * 0.9, y = -r * (0.6 + rnd() * 0.4);
    c.globalAlpha = 0.3 + 0.3 * Math.min(1, (-y / r - 0.6) / 0.35);
    c.fillRect(x, y, r * 0.011, r * 0.011);
  }
  c.restore();
  // Bare temples, a little shinier than the rest.
  c.globalAlpha = 1;
  c.fillStyle = "rgba(255,255,255,0.2)";
  [-1, 1].forEach(function (s) { c.beginPath(); c.ellipse(s * r * 0.5, -r * 0.74, r * 0.08, r * 0.035, s * 0.5, 0, Math.PI * 2); c.fill(); });
  // The light on top of his shaved head.
  c.fillStyle = "rgba(255,255,255,0.26)";
  c.beginPath(); c.ellipse(-r * 0.12, -r * 0.9, r * 0.28, r * 0.05, -0.08, 0, Math.PI * 2); c.fill();
  c.restore();
}
