// Chuck Liddell's look from Joe's photos (Joe, 2026-11-18), turned on by
// look.icemanReal in characters/chuck-liddell.json. Each function takes over
// from its counterpart in liddell.js (one-line hooks there):
//   drawIcemanRealHawk    a short, flat, reddish-brown strip front to back (drawIcehawk)
//   drawIcemanRealHead    stubble on the shaved sides, the real Koei-Kan kanji behind
//                         his left ear, a horseshoe goatee and soul patch (drawIcemanHead)
//   drawIcemanRealShorts  white paint drips off the waistband and ICEMAN in pink
//                         and red (drawIcicleShorts)
// c is at the ball's centre, r its radius (contained layout).

function drawIcemanRealHawk(c, r, look, ink) {
  var hc = look.hairColor, rnd = artRand(77);
  var strip = function () {
    c.beginPath();
    c.moveTo(-r * 0.15, -r * 0.68);                         // squared front edge at the hairline
    c.quadraticCurveTo(0, -r * 0.71, r * 0.15, -r * 0.68);
    c.lineTo(r * 0.12, -r * 0.98); c.quadraticCurveTo(r * 0.1, -r * 1.07, 0, -r * 1.075); // a low flat crest just over the top
    c.quadraticCurveTo(-r * 0.1, -r * 1.07, -r * 0.12, -r * 0.98); c.closePath();
  };
  c.save();
  var g = c.createLinearGradient(0, -r * 1.08, 0, -r * 0.68);
  g.addColorStop(0, shadeHex(hc, 0.18)); g.addColorStop(1, shadeHex(hc, -0.12));
  c.fillStyle = g; strip(); c.fill();
  c.save(); c.beginPath(); c.rect(-r, -r * 2, r * 2, r * 1.02); c.clip();  // outlined only where it sits past the ball
  c.strokeStyle = ink; c.lineWidth = Math.max(1.5, r * 0.035); strip(); c.stroke(); c.restore();
  c.save(); strip(); c.clip(); c.lineCap = "round";                       // short bristles
  for (var k = 0; k < 70; k++) {
    var x = (rnd() * 2 - 1) * r * 0.13, y = -r * (0.7 + rnd() * 0.36);
    c.strokeStyle = rnd() < 0.5 ? shadeHex(hc, -0.3) : shadeHex(hc, 0.3); c.globalAlpha = 0.55; c.lineWidth = Math.max(0.8, r * 0.012);
    c.beginPath(); c.moveTo(x, y); c.lineTo(x + (rnd() - 0.5) * r * 0.02, y - r * 0.035); c.stroke();
  }
  c.restore(); c.restore();
}

function drawIcemanRealHead(c, r, look, lw) {
  // shaved sides: a fine stubble shadow
  var rnd = artRand(31);
  c.save(); c.fillStyle = shadeHex(look.hairColor, -0.2); c.globalAlpha = 0.22;
  for (var k = 0; k < 160; k++) {
    var s = rnd() < 0.5 ? -1 : 1, x = s * r * (0.2 + rnd() * 0.7), y = -r * (0.6 + rnd() * 0.38);
    if (x * x + y * y < r * r * 0.97) c.fillRect(x, y, r * 0.012, r * 0.012);
  }
  c.restore();
  // Koei-Kan kanji: three characters stacked behind his left ear (screen right)
  c.save(); c.translate(r * 0.47, -r * 0.62); c.rotate(0.5);
  c.fillStyle = "rgba(22,26,36,0.88)"; c.textAlign = "center"; c.textBaseline = "middle";
  c.font = "bold " + (r * 0.105) + "px \"Hiragino Mincho ProN\",\"Yu Mincho\",\"Noto Serif CJK JP\",\"WenQuanYi Zen Hei\",serif";
  ["幸", "栄", "館"].forEach(function (ch, i) { c.fillText(ch, 0, (i - 1) * r * 0.115); });
  c.restore();
  // Horseshoe goatee: moustache running down past the mouth into the chin, open in the middle
  var bc = look.beardColor || look.hairColor;
  var hs = function () {
    c.beginPath();
    c.moveTo(-r * 0.18, -r * 0.38); c.quadraticCurveTo(0, -r * 0.47, r * 0.18, -r * 0.38);  // top of the moustache
    c.quadraticCurveTo(r * 0.21, -r * 0.27, r * 0.16, -r * 0.2);                            // down the right side
    c.quadraticCurveTo(0, -r * 0.14, -r * 0.16, -r * 0.2);                                 // round under the chin
    c.quadraticCurveTo(-r * 0.21, -r * 0.27, -r * 0.18, -r * 0.38); c.closePath();
    // the shaved middle: lips and chin between the bars
    c.moveTo(r * 0.105, -r * 0.375); c.quadraticCurveTo(0, -r * 0.39, -r * 0.105, -r * 0.375);
    c.quadraticCurveTo(-r * 0.115, -r * 0.27, -r * 0.06, -r * 0.235); c.quadraticCurveTo(0, -r * 0.215, r * 0.06, -r * 0.235);
    c.quadraticCurveTo(r * 0.115, -r * 0.27, r * 0.105, -r * 0.375); c.closePath();
  };
  c.save(); c.fillStyle = bc; c.globalAlpha = 0.92; hs(); c.fill("evenodd");
  hs(); c.clip("evenodd"); c.globalAlpha = 0.45; c.fillStyle = shadeHex(bc, 0.3);
  var g2 = artRand(23);
  for (var i = 0; i < 90; i++) c.fillRect((g2() * 2 - 1) * r * 0.19, -r * 0.46 + g2() * r * 0.33, r * 0.014, r * 0.014);
  c.restore();
  // soul patch under the lip
  c.save(); c.fillStyle = bc; c.globalAlpha = 0.85; c.beginPath();
  c.moveTo(0, -r * 0.315); c.lineTo(r * 0.02, -r * 0.29); c.lineTo(0, -r * 0.265); c.lineTo(-r * 0.02, -r * 0.29); c.closePath(); c.fill();
  c.restore();
}

function drawIcemanRealShorts(c, r, look, sTop, band, name) {
  var rnd = artRand(artSeed(name + "drips")), y0 = sTop + band - r * 0.01;
  c.save(); c.fillStyle = "#f4f8ff";
  c.beginPath(); c.moveTo(-r, y0); c.lineTo(r, y0); c.lineTo(r, y0 + r * 0.04);
  for (var i = 24; i >= 0; i--) {
    var x = -r + i * r / 12, len = r * (0.04 + (i % 3 === 0 ? 0.1 + rnd() * 0.12 : rnd() * 0.05));
    c.lineTo(x + r * 0.03, y0 + r * 0.04); c.quadraticCurveTo(x + r * 0.025, y0 + len, x, y0 + len + r * 0.01); c.quadraticCurveTo(x - r * 0.025, y0 + len, x - r * 0.03, y0 + r * 0.04);
  }
  c.closePath(); c.fill();
  c.font = "900 " + (r * 0.15) + "px \"Arial Black\",Impact,sans-serif"; c.textAlign = "center"; c.textBaseline = "middle";
  var ty = y0 + r * 0.33; c.lineJoin = "round";
  c.lineWidth = r * 0.05; c.strokeStyle = "#ffffff"; c.strokeText("ICEMAN", 0, ty);
  c.lineWidth = r * 0.022; c.strokeStyle = "#c8102e"; c.strokeText("ICEMAN", 0, ty);
  c.fillStyle = "#ff5c8a"; c.fillText("ICEMAN", 0, ty);
  c.restore();
}
