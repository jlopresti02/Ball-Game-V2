// Fighter art: draws a roster fighter as a muscled ball in its fight kit,
// from the fighter's `look` (skin, build, hair, beard, body hair, tattoos,
// shorts, gloves). No faces: likeness comes from the build, hair, beard,
// ink and kit. Everything is drawn in units of the ball's radius so it
// holds up at any size.
"use strict";

function defaultLook() {
  return {
    skin: "#d9a27e", build: "muscular", bodyHair: "none",
    hair: "short", hairColor: "#2b2019", beard: "none", ears: "normal",
    tattoos: { chest: false, leftArm: false, rightArm: false, ribs: false },
    shorts: "#1e3a8a", trim: "#f2f2f2", shortsStyle: "stripe", gloves: "#141414"
  };
}

// Mix a hex color toward black (amt < 0) or white (amt > 0).
function shadeHex(hex, amt) {
  var n = parseInt(hex.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255;
  var t = amt < 0 ? 0 : 255, p = Math.abs(amt);
  r = Math.round(r + (t - r) * p); g = Math.round(g + (t - g) * p); b = Math.round(b + (t - b) * p);
  return "rgb(" + r + "," + g + "," + b + ")";
}

// Small seeded random, so a fighter's body hair and ink land in the same
// spots every frame.
function artRand(seed) {
  var s = seed >>> 0 || 1;
  return function () { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}
function artSeed(str) {
  var h = 2166136261;
  for (var i = 0; i < (str || "").length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

// Draws the body ball, then the head sitting on top of it. `ink` is the
// outline color (theme.wall in game). opts.head: draw the head on top.
// opts.layout "contained" keeps the whole fighter inside the ball instead:
// head in the top third, torso in the middle, shorts in the bottom third.
function drawFighterArt(c, x, y, r, look, ink, opts) {
  opts = opts || {};
  look = look || defaultLook();
  c.save();
  c.translate(x, y);
  var contained = opts.layout === "contained";
  drawArtBody(c, r, look, ink, opts.name || "", contained);
  if (!contained && opts.head !== false) drawArtHead(c, r, look, ink);
  c.restore();
}

function drawArtHead(c, r, look, ink, hy, hr) {
  if (hr === undefined) { hr = r * 0.4; hy = -r * 1.04; }
  c.strokeStyle = ink; c.lineWidth = Math.max(2, r * 0.07);
  // Shadow the head casts on the chest
  c.fillStyle = "rgba(0,0,0,0.18)";
  c.beginPath(); c.ellipse(0, hy + hr * 0.95, hr * 0.85, hr * 0.3, 0, 0, Math.PI * 2); c.fill();

  // Ears, puffed up and lumpy when cauliflowered
  var cauli = look.ears === "cauliflower";
  [-1, 1].forEach(function (s) {
    var er = hr * (cauli ? 0.3 : 0.22);
    c.fillStyle = shadeHex(look.skin, -0.05);
    c.beginPath(); c.ellipse(s * hr * 0.95, hy + hr * 0.08, er * 0.8, er, 0, 0, Math.PI * 2); c.fill(); c.stroke();
    if (cauli) {
      c.save(); c.strokeStyle = shadeHex(look.skin, -0.35); c.lineWidth = Math.max(1, r * 0.035);
      c.beginPath(); c.arc(s * hr * 0.97, hy + hr * 0.02, er * 0.35, 0, Math.PI * 2); c.stroke();
      c.beginPath(); c.arc(s * hr * 0.93, hy + hr * 0.2, er * 0.25, 0, Math.PI * 2); c.stroke();
      c.restore();
    }
  });

  // Skull
  var g = c.createRadialGradient(-hr * 0.35, hy - hr * 0.4, hr * 0.1, 0, hy, hr * 1.1);
  g.addColorStop(0, shadeHex(look.skin, 0.18)); g.addColorStop(1, shadeHex(look.skin, -0.15));
  c.fillStyle = g;
  c.beginPath(); c.arc(0, hy, hr, 0, Math.PI * 2); c.fill();

  c.save();
  c.beginPath(); c.arc(0, hy, hr, 0, Math.PI * 2); c.clip();
  var hc = look.hairColor;
  if (look.hair === "buzz") {
    c.globalAlpha = 0.6; c.fillStyle = hc;
    c.beginPath(); c.ellipse(0, hy - hr * 0.35, hr * 1.1, hr * 0.75, 0, 0, Math.PI * 2); c.fill();
    c.globalAlpha = 1;
  } else if (look.hair === "short" || look.hair === "long" || look.hair === "dreads") {
    c.fillStyle = hc;
    c.beginPath();
    c.moveTo(-hr * 1.1, hy + hr * 0.15);
    c.quadraticCurveTo(-hr * 0.9, hy - hr * 0.35, -hr * 0.4, hy - hr * 0.28);
    c.quadraticCurveTo(0, hy - hr * 0.42, hr * 0.45, hy - hr * 0.26);
    c.quadraticCurveTo(hr * 0.9, hy - hr * 0.35, hr * 1.1, hy + hr * 0.15);
    c.lineTo(hr * 1.1, hy - hr * 1.2); c.lineTo(-hr * 1.1, hy - hr * 1.2); c.closePath();
    c.fill();
  } else if (look.hair === "mohawk") {
    c.globalAlpha = 0.35; c.fillStyle = hc;
    c.beginPath(); c.ellipse(0, hy - hr * 0.35, hr * 1.1, hr * 0.75, 0, 0, Math.PI * 2); c.fill();
    c.globalAlpha = 1;
  }
  // Beard: fills the lower half of the head, no face drawn
  if (look.beard !== "none") {
    c.globalAlpha = look.beard === "stubble" ? 0.4 : 1;
    c.fillStyle = hc;
    c.beginPath();
    c.moveTo(-hr * 1.1, hy - hr * 0.05);
    c.quadraticCurveTo(-hr * 0.55, hy + hr * 0.1, -hr * 0.5, hy + hr * 0.42);
    c.quadraticCurveTo(0, hy + hr * 0.2, hr * 0.5, hy + hr * 0.42);
    c.quadraticCurveTo(hr * 0.55, hy + hr * 0.1, hr * 1.1, hy - hr * 0.05);
    c.lineTo(hr * 1.1, hy + hr * 1.2); c.lineTo(-hr * 1.1, hy + hr * 1.2); c.closePath();
    c.fill();
    c.globalAlpha = 1;
  }
  c.restore();

  c.strokeStyle = ink; c.lineWidth = Math.max(2, r * 0.07);
  c.beginPath(); c.arc(0, hy, hr, 0, Math.PI * 2); c.stroke();

  // Hair that sticks out past the skull
  c.fillStyle = hc; c.strokeStyle = ink; c.lineWidth = Math.max(1.5, r * 0.05);
  if (look.hair === "mohawk") {
    c.beginPath();
    c.moveTo(-hr * 0.22, hy - hr * 0.55);
    for (var i = 0; i <= 4; i++) {
      var a = -Math.PI * 0.8 + i * Math.PI * 0.15;
      c.lineTo(Math.cos(a) * hr * 1.35, hy + Math.sin(a) * hr * 1.35);
      c.lineTo(Math.cos(a + 0.07) * hr * 0.9, hy + Math.sin(a + 0.07) * hr * 0.9);
    }
    c.closePath(); c.fill(); c.stroke();
  } else if (look.hair === "long") {
    [-1, 1].forEach(function (s) {
      c.beginPath();
      c.moveTo(s * hr * 0.75, hy - hr * 0.6);
      c.quadraticCurveTo(s * hr * 1.35, hy, s * hr * 1.05, hy + hr * 1.1);
      c.lineTo(s * hr * 0.8, hy + hr * 0.3);
      c.closePath(); c.fill(); c.stroke();
    });
  } else if (look.hair === "dreads") {
    for (var d = 0; d < 7; d++) {
      var da = -Math.PI + 0.2 + d * (Math.PI - 0.4) / 6;
      var sx = Math.cos(da) * hr * 0.92, sy = hy + Math.sin(da) * hr * 0.92;
      var len = hr * (0.35 + (d % 2) * 0.15);
      c.save(); c.lineCap = "round";
      c.strokeStyle = ink; c.lineWidth = hr * 0.3;
      c.beginPath(); c.moveTo(sx, sy); c.lineTo(sx + Math.cos(da) * len, sy + Math.sin(da) * len * 0.6 + len * 0.5); c.stroke();
      c.strokeStyle = hc; c.lineWidth = hr * 0.18;
      c.beginPath(); c.moveTo(sx, sy); c.lineTo(sx + Math.cos(da) * len, sy + Math.sin(da) * len * 0.6 + len * 0.5); c.stroke();
      c.restore();
    }
  }
}

// Contained layout: the ball's top third is the head itself. No outline of
// its own, just layers painted onto the ball: hair on top, ears at the
// edges, beard along the jaw, a chin shadow where it meets the chest.
function drawArtHeadLayer(c, r, look, line, lw) {
  var hc = look.hairColor, jaw = -r * 0.3;
  // Chin shadow and neck line into the chest
  c.fillStyle = "rgba(0,0,0,0.2)";
  c.beginPath(); c.ellipse(0, jaw + r * 0.08, r * 0.45, r * 0.08, 0, 0, Math.PI * 2); c.fill();
  c.strokeStyle = line; c.lineWidth = lw(0.045);
  c.beginPath(); c.moveTo(-r * 0.66, jaw - r * 0.14); c.quadraticCurveTo(-r * 0.5, jaw + r * 0.1, 0, jaw + r * 0.1); c.quadraticCurveTo(r * 0.5, jaw + r * 0.1, r * 0.66, jaw - r * 0.14); c.stroke();

  // Ears at the edges of the ball
  var cauli = look.ears === "cauliflower";
  [-1, 1].forEach(function (s) {
    var ex = s * r * 0.84, ey = -r * 0.56, er = r * (cauli ? 0.13 : 0.1);
    c.fillStyle = shadeHex(look.skin, -0.08);
    c.beginPath(); c.ellipse(ex, ey, er * 0.75, er, 0, 0, Math.PI * 2); c.fill();
    c.strokeStyle = line; c.lineWidth = lw(0.035);
    c.beginPath(); c.arc(ex - s * er * 0.1, ey, er * 0.55, s > 0 ? Math.PI * 0.5 : -Math.PI * 0.5, s > 0 ? Math.PI * 1.5 : Math.PI * 0.5); c.stroke();
    if (cauli) {
      c.beginPath(); c.arc(ex, ey - er * 0.35, er * 0.28, 0, Math.PI * 2); c.stroke();
      c.beginPath(); c.arc(ex + s * er * 0.1, ey + er * 0.3, er * 0.22, 0, Math.PI * 2); c.stroke();
    }
  });

  // Hair across the top of the ball
  var hairline = function () {
    c.beginPath();
    c.moveTo(-r, -r * 0.5);
    c.lineTo(-r * 0.74, -r * 0.6);
    c.quadraticCurveTo(-r * 0.62, -r * 0.76, -r * 0.4, -r * 0.74);
    c.quadraticCurveTo(0, -r * 0.82, r * 0.4, -r * 0.74);
    c.quadraticCurveTo(r * 0.62, -r * 0.76, r * 0.74, -r * 0.6);
    c.lineTo(r, -r * 0.5); c.lineTo(r, -r); c.lineTo(-r, -r); c.closePath();
  };
  c.fillStyle = hc;
  if (look.hair === "buzz") {
    c.globalAlpha = 0.6; hairline(); c.fill(); c.globalAlpha = 1;
  } else if (look.hair === "short" || look.hair === "long" || look.hair === "dreads") {
    hairline(); c.fill();
    c.strokeStyle = shadeHex(hc, 0.25); c.lineWidth = lw(0.025); c.globalAlpha = 0.6;
    for (var i = -3; i <= 3; i++) {
      c.beginPath(); c.moveTo(i * r * 0.12, -r * 0.97); c.quadraticCurveTo(i * r * 0.15 + r * 0.05, -r * 0.88, i * r * 0.13, -r * 0.8); c.stroke();
    }
    c.globalAlpha = 1;
    if (look.hair === "long") {
      [-1, 1].forEach(function (s) {
        c.beginPath();
        c.moveTo(s * r * 0.6, -r * 0.74);
        c.quadraticCurveTo(s * r * 0.78, -r * 0.45, s * r * 0.68, -r * 0.2);
        c.lineTo(s * r, -r * 0.2); c.lineTo(s * r, -r * 0.74); c.closePath(); c.fill();
      });
    } else if (look.hair === "dreads") {
      c.lineCap = "round";
      [-1, 1].forEach(function (s) {
        for (var d = 0; d < 3; d++) {
          var x0 = s * r * (0.52 + d * 0.12), len = r * (0.32 - d * 0.05);
          c.strokeStyle = line; c.lineWidth = lw(0.12);
          c.beginPath(); c.moveTo(x0, -r * 0.72); c.lineTo(x0 + s * r * 0.04, -r * 0.72 + len); c.stroke();
          c.strokeStyle = hc; c.lineWidth = lw(0.08);
          c.beginPath(); c.moveTo(x0, -r * 0.72); c.lineTo(x0 + s * r * 0.04, -r * 0.72 + len); c.stroke();
        }
      });
    }
  } else if (look.hair === "mohawk") {
    c.globalAlpha = 0.3; hairline(); c.fill(); c.globalAlpha = 1;
    c.beginPath(); c.ellipse(0, -r * 0.9, r * 0.13, r * 0.2, 0, 0, Math.PI * 2); c.fill();
  } else {
    // Bald: a shine on the scalp
    c.fillStyle = "rgba(255,255,255,0.35)";
    c.beginPath(); c.ellipse(-r * 0.25, -r * 0.82, r * 0.18, r * 0.06, -0.2, 0, Math.PI * 2); c.fill();
  }
  if (look.hair !== "bald") {
    c.strokeStyle = shadeHex(hc, -0.3); c.lineWidth = lw(0.03); c.globalAlpha = look.hair === "buzz" || look.hair === "mohawk" ? 0.3 : 0.8;
    hairline(); c.stroke(); c.globalAlpha = 1;
  }

  // Beard: sideburns down around the jaw to a full chin
  if (look.beard !== "none") {
    c.globalAlpha = look.beard === "stubble" ? 0.42 : 1;
    c.fillStyle = hc;
    c.beginPath();
    c.moveTo(-r * 0.74, -r * 0.66);
    c.quadraticCurveTo(-r * 0.62, -r * 0.44, -r * 0.32, -r * 0.5);
    c.quadraticCurveTo(0, -r * 0.56, r * 0.32, -r * 0.5);
    c.quadraticCurveTo(r * 0.62, -r * 0.44, r * 0.74, -r * 0.66);
    c.quadraticCurveTo(r * 0.8, -r * 0.3, r * 0.3, jaw + r * 0.02);
    c.quadraticCurveTo(0, jaw + r * 0.12, -r * 0.3, jaw + r * 0.02);
    c.quadraticCurveTo(-r * 0.8, -r * 0.3, -r * 0.74, -r * 0.66);
    c.closePath(); c.fill();
    if (look.beard === "full") {
      c.globalAlpha = 0.5; c.strokeStyle = shadeHex(hc, 0.3); c.lineWidth = lw(0.022);
      for (var k = -3; k <= 3; k++) {
        c.beginPath(); c.moveTo(k * r * 0.13, -r * 0.44); c.lineTo(k * r * 0.15, -r * 0.3); c.stroke();
      }
    }
    c.globalAlpha = 1;
  }
}

function drawArtBody(c, r, look, ink, name, contained) {
  var skin = look.skin, build = look.build;
  var line = shadeHex(skin, -0.38), hi = shadeHex(skin, 0.28);
  var def = build === "lean" ? 0.65 : build === "stocky" ? 0.55 : 1; // how cut the muscles look
  var lw = function (k) { return Math.max(1, r * k); };

  c.save();
  c.beginPath(); c.arc(0, 0, r, 0, Math.PI * 2); c.clip();

  // Skin base with a light from the top left
  var g = c.createRadialGradient(-r * 0.35, -r * 0.45, r * 0.1, 0, 0, r * 1.05);
  g.addColorStop(0, shadeHex(skin, 0.14)); g.addColorStop(0.7, skin); g.addColorStop(1, shadeHex(skin, -0.22));
  c.fillStyle = g; c.fillRect(-r, -r, r * 2, r * 2);

  c.lineCap = "round"; c.lineJoin = "round";
  if (contained) {
    // Squeeze the torso into the middle third of the ball
    c.save(); c.translate(0, r * 0.11); c.scale(0.86, 0.59);
  }
  var pecW = build === "stocky" ? 0.68 : 0.6;

  // Shoulders (delts): curves bulging in from each side
  c.strokeStyle = line; c.lineWidth = lw(0.055);
  c.globalAlpha = 0.85 * def + 0.15;
  [-1, 1].forEach(function (s) {
    c.beginPath(); c.arc(s * r * 1.02, -r * 0.3, r * 0.4, s > 0 ? Math.PI - 1.05 : -1.05, s > 0 ? Math.PI + 1.05 : 1.05); c.stroke();
  });

  // Collarbones
  c.lineWidth = lw(0.035);
  [-1, 1].forEach(function (s) {
    c.beginPath(); c.moveTo(s * r * 0.08, -r * 0.7); c.quadraticCurveTo(s * r * 0.3, -r * 0.62, s * r * 0.58, -r * 0.74); c.stroke();
  });

  // Pecs: highlight on top, deep shadow line underneath
  [-1, 1].forEach(function (s) {
    c.globalAlpha = 0.45;
    c.fillStyle = hi;
    c.beginPath(); c.ellipse(s * r * 0.3, -r * 0.38, r * pecW * 0.42, r * 0.18, s * 0.15, 0, Math.PI * 2); c.fill();
    c.globalAlpha = 0.35 * def;
    c.fillStyle = line;
    c.beginPath();
    c.moveTo(s * r * 0.04, -r * 0.12);
    c.quadraticCurveTo(s * r * 0.35, r * 0.02, s * r * (pecW + 0.05), -r * 0.24);
    c.quadraticCurveTo(s * r * 0.35, -r * 0.08, s * r * 0.04, -r * 0.2);
    c.closePath(); c.fill();
    c.globalAlpha = 0.9 * def + 0.1;
    c.strokeStyle = line; c.lineWidth = lw(0.06);
    c.beginPath();
    c.moveTo(s * r * 0.04, -r * 0.14);
    c.quadraticCurveTo(s * r * 0.35, r * 0.0, s * r * (pecW + 0.04), -r * 0.26);
    c.stroke();
  });
  // Sternum
  c.lineWidth = lw(0.035);
  c.beginPath(); c.moveTo(0, -r * 0.6); c.lineTo(0, -r * 0.14); c.stroke();

  if (build === "stocky") {
    // Thick midsection: a rounded gut, faint centre line
    c.globalAlpha = 0.3; c.fillStyle = hi;
    c.beginPath(); c.ellipse(0, r * 0.14, r * 0.36, r * 0.2, 0, 0, Math.PI * 2); c.fill();
    c.globalAlpha = 0.4; c.strokeStyle = line; c.lineWidth = lw(0.04);
    c.beginPath(); c.moveTo(0, -r * 0.05); c.lineTo(0, r * 0.32); c.stroke();
    c.beginPath(); c.arc(0, r * 0.1, r * 0.42, 0.35, Math.PI - 0.35); c.stroke();
  } else {
    // Six pack
    var top = -r * 0.06, bot = r * 0.4, half = r * 0.2;
    c.globalAlpha = 0.4;
    c.fillStyle = hi;
    for (var row = 0; row < 3; row++) {
      for (var col = -1; col <= 1; col += 2) {
        var yy = top + (row + 0.5) * (bot - top) / 3;
        c.beginPath(); c.ellipse(col * half * 0.55, yy - r * 0.01, half * 0.36, (bot - top) / 8, 0, 0, Math.PI * 2); c.fill();
      }
    }
    c.globalAlpha = 0.9 * def + 0.1;
    c.strokeStyle = line; c.lineWidth = lw(0.045);
    c.beginPath(); c.moveTo(0, top); c.lineTo(0, bot); c.stroke();
    c.lineWidth = lw(0.035);
    for (var k = 1; k < 3; k++) {
      var ly = top + k * (bot - top) / 3;
      c.beginPath(); c.moveTo(-half, ly + r * 0.02); c.quadraticCurveTo(0, ly - r * 0.03, half, ly + r * 0.02); c.stroke();
    }
    // Outer edge of the abs and the obliques / serratus
    c.lineWidth = lw(0.045);
    [-1, 1].forEach(function (s) {
      c.beginPath(); c.moveTo(s * half * 1.05, top - r * 0.02); c.quadraticCurveTo(s * half * 1.3, (top + bot) / 2, s * half * 0.95, bot); c.stroke();
      c.lineWidth = lw(0.03);
      for (var j = 0; j < 3; j++) {
        var sy = -r * 0.05 + j * r * 0.1;
        c.beginPath(); c.moveTo(s * r * 0.52, sy); c.lineTo(s * r * 0.4, sy + r * 0.06); c.stroke();
      }
      c.lineWidth = lw(0.045);
    });
  }
  c.globalAlpha = 1;

  var rnd = artRand(artSeed(name));

  // Body hair: chest patch and a trail down to the waistband
  if (look.bodyHair && look.bodyHair !== "none") {
    var heavy = look.bodyHair === "heavy";
    c.strokeStyle = look.hairColor; c.lineWidth = lw(0.022); c.globalAlpha = heavy ? 0.85 : 0.6;
    var n = heavy ? 60 : 26;
    for (var h = 0; h < n; h++) {
      var ang = rnd() * Math.PI * 2, rad = Math.sqrt(rnd());
      var px = Math.cos(ang) * rad * r * (heavy ? 0.42 : 0.22), py = -r * 0.32 + Math.sin(ang) * rad * r * (heavy ? 0.22 : 0.14);
      var tilt = (px > 0 ? 1 : -1) * 0.6 + (rnd() - 0.5);
      c.beginPath(); c.moveTo(px, py); c.lineTo(px + Math.sin(tilt) * r * 0.06, py + Math.cos(tilt) * r * 0.06); c.stroke();
    }
    for (var t = 0; t < (heavy ? 18 : 9); t++) {
      var ty = -r * 0.05 + t * r * 0.045, tx = (rnd() - 0.5) * r * 0.06;
      c.beginPath(); c.moveTo(tx, ty); c.lineTo(tx + (rnd() - 0.5) * r * 0.04, ty + r * 0.05); c.stroke();
    }
    c.globalAlpha = 1;
  }

  // Tattoos
  var tat = look.tattoos || {};
  var inkCol = "rgba(28,34,52,0.62)";
  c.strokeStyle = inkCol; c.fillStyle = inkCol;
  if (tat.chest) {
    // A spread-wing chest piece under the collarbones
    c.lineWidth = lw(0.03);
    [-1, 1].forEach(function (s) {
      for (var f = 0; f < 4; f++) {
        c.beginPath();
        c.moveTo(s * r * 0.08, -r * 0.48 + f * r * 0.035);
        c.quadraticCurveTo(s * r * (0.3 + f * 0.04), -r * (0.62 - f * 0.05), s * r * (0.52 - f * 0.05), -r * (0.5 - f * 0.07));
        c.stroke();
      }
    });
    c.beginPath(); c.arc(0, -r * 0.46, r * 0.07, 0, Math.PI * 2); c.fill();
  }
  [["leftArm", -1], ["rightArm", 1]].forEach(function (p) {
    if (!tat[p[0]]) return;
    var s = p[1];
    // Sleeve running over the shoulder: bands and curls
    c.save();
    c.beginPath(); c.arc(s * r * 1.02, -r * 0.3, r * 0.4, 0, Math.PI * 2); c.clip();
    c.globalAlpha = 0.25; c.fillRect(s > 0 ? r * 0.6 : -r, -r, r * 0.4, r);
    c.globalAlpha = 1; c.lineWidth = lw(0.035);
    for (var q = 0; q < 4; q++) {
      c.beginPath(); c.arc(s * r * 0.86, -r * 0.62 + q * r * 0.17, r * 0.08, 0, Math.PI * 1.6); c.stroke();
    }
    c.beginPath(); c.moveTo(s * r * 0.7, -r * 0.7); c.quadraticCurveTo(s * r * 0.62, -r * 0.3, s * r * 0.72, r * 0.05); c.stroke();
    c.restore();
  });
  if (tat.ribs) {
    // Script running down the right ribs
    c.lineWidth = lw(0.025);
    c.beginPath();
    for (var w = 0; w < 14; w++) {
      var wy = -r * 0.2 + w * r * 0.035, wx = r * 0.58 + Math.sin(w * 1.9) * r * 0.035;
      if (w === 0) c.moveTo(wx, wy); else c.lineTo(wx, wy);
    }
    c.stroke();
  }

  if (contained) c.restore();

  // Fight shorts
  var sTop = contained ? r * 0.36 : r * 0.42, band = r * 0.13;
  c.fillStyle = look.shorts;
  c.fillRect(-r, sTop, r * 2, r);
  if (look.shortsStyle === "split") {
    c.fillStyle = look.trim; c.fillRect(0, sTop, r, r);
  }
  // Fabric shading
  var sg = c.createLinearGradient(0, sTop, 0, r);
  sg.addColorStop(0, "rgba(255,255,255,0.12)"); sg.addColorStop(1, "rgba(0,0,0,0.3)");
  c.fillStyle = sg; c.fillRect(-r, sTop, r * 2, r);
  if (look.shortsStyle === "stripe") {
    c.fillStyle = look.trim;
    [-1, 1].forEach(function (s) {
      c.beginPath();
      c.moveTo(s * r * 0.62, sTop + band); c.lineTo(s * r * 0.74, sTop + band);
      c.lineTo(s * r * 0.86, r); c.lineTo(s * r * 0.72, r); c.closePath(); c.fill();
    });
  }
  // Waistband
  c.fillStyle = look.shortsStyle === "split" ? shadeHex(look.shorts, -0.35) : look.trim;
  c.fillRect(-r, sTop, r * 2, band);
  c.fillStyle = "rgba(0,0,0,0.18)"; c.fillRect(-r, sTop + band * 0.75, r * 2, band * 0.25);
  // Leg split and a patch on the left leg
  c.fillStyle = ink;
  c.beginPath(); c.moveTo(-r * 0.07, r); c.lineTo(0, r * 0.8); c.lineTo(r * 0.07, r); c.closePath(); c.fill();
  c.fillStyle = look.shortsStyle === "split" ? look.shorts : look.trim;
  c.globalAlpha = 0.85;
  c.fillRect(-r * 0.42, sTop + band + r * 0.1, r * 0.18, r * 0.09);
  c.globalAlpha = 1;
  c.strokeStyle = ink; c.lineWidth = lw(0.05);
  c.beginPath(); c.moveTo(-r, sTop); c.lineTo(r, sTop); c.stroke();

  if (contained) drawArtHeadLayer(c, r, look, line, lw);

  // Overall roundness: rim shadow
  var rg = c.createRadialGradient(-r * 0.2, -r * 0.25, r * 0.6, 0, 0, r);
  rg.addColorStop(0, "rgba(0,0,0,0)"); rg.addColorStop(1, "rgba(0,0,0,0.25)");
  c.fillStyle = rg; c.fillRect(-r, -r, r * 2, r * 2);
  c.restore();

  c.strokeStyle = ink; c.lineWidth = Math.max(2, r * 0.077);
  c.beginPath(); c.arc(0, 0, r, 0, Math.PI * 2); c.stroke();
}

// An open-finger MMA glove. (x, y) is its centre, `ang` points the way the
// knuckles face.
function drawGlove(c, x, y, gr, look, ink, ang) {
  c.save();
  c.translate(x, y); c.rotate(ang);
  var col = look.gloves;
  // Wrist and forearm stub in skin
  c.fillStyle = look.skin; c.strokeStyle = ink; c.lineWidth = Math.max(1.5, gr * 0.2);
  c.beginPath(); c.ellipse(-gr * 0.95, 0, gr * 0.45, gr * 0.42, 0, 0, Math.PI * 2); c.fill(); c.stroke();
  // Padding
  var g = c.createRadialGradient(gr * 0.2, -gr * 0.35, gr * 0.1, 0, 0, gr * 1.1);
  g.addColorStop(0, shadeHex(col, 0.35)); g.addColorStop(1, shadeHex(col, -0.2));
  c.fillStyle = g;
  c.beginPath(); c.arc(0, 0, gr, 0, Math.PI * 2); c.fill(); c.stroke();
  // Curled fingers showing at the front
  c.fillStyle = look.skin; c.lineWidth = Math.max(1, gr * 0.12);
  for (var i = -1.5; i <= 1.5; i++) {
    c.beginPath(); c.arc(gr * 0.82, i * gr * 0.3, gr * 0.17, 0, Math.PI * 2); c.fill(); c.stroke();
  }
  // Wrist strap
  c.fillStyle = shadeHex(col, 0.75); c.lineWidth = Math.max(1.2, gr * 0.14);
  c.beginPath(); c.rect(-gr * 0.72, -gr * 0.62, gr * 0.3, gr * 1.24); c.fill(); c.stroke();
  c.restore();
}
