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
    tattoos: { chest: false, portraits: false, script: false, claws: false, leftArm: false, rightArm: false, ribs: false, color: false },
    shorts: "#1e3a8a", trim: "#f2f2f2", shortsStyle: "stripe", gloves: "#141414"
  };
}

// Arms, legs and fists of fighters with art use skin and glove colours;
// everyone else keeps their fighter colour.
function armColor(ch) {
  if (!ch.look) return ch.color;
  return ch.look.tattoos && ch.look.tattoos.armInk ? sleevePattern(ch.look) : ch.look.skin;
}
function gloveColor(ch) { return ch.look ? ch.look.gloves : ch.color; }

// Mix a hex color toward black (amt < 0) or white (amt > 0).
// Blend hex colour a toward b by t (0..1)
function mixHex(a, b, t) {
  var x = parseInt(a.slice(1), 16), y = parseInt(b.slice(1), 16);
  var ch = function (sh) { var u = (x >> sh) & 255, v = (y >> sh) & 255; return Math.round(u + (v - u) * t); };
  return "rgb(" + ch(16) + "," + ch(8) + "," + ch(0) + ")";
}
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
// Decal images are created once per source and reused every frame
var artDecalCache = {};
function artDecalImage(src) {
  var im = artDecalCache[src];
  if (!im) { im = artDecalCache[src] = new Image(); im.src = src; }
  return im;
}

function drawFighterArt(c, x, y, r, look, ink, opts) {
  opts = opts || {};
  look = look || defaultLook();
  c.save();
  c.translate(x, y);
  var contained = opts.layout === "contained";
  if (contained && look.hairPuff) drawHairPuff(c, r, look, ink);
  drawArtBody(c, r, look, ink, opts.name || "", contained);
  if (contained && look.cane) drawCane(c, r, ink, opts.caneSwing || 0);
  if (!contained && opts.head !== false) drawArtHead(c, r, look, ink);
  c.restore();
}

// A white cane with a red tip, held at the right side and planted on the
// floor out past the ball, with a crook handle curled over the hand. `swing`
// (radians) sweeps the tip side to side, the way a blind walker taps ahead.
function drawCane(c, r, ink, swing) {
  var hx = r * 0.86, hy = r * 0.02, fx = r * (1.42 + swing * 0.6), fy = r * (1.12 - Math.abs(swing) * 0.25);
  var ang = Math.atan2(fy - hy, fx - hx), len = Math.hypot(fx - hx, fy - hy);
  c.save();
  c.translate(hx, hy); c.rotate(ang);
  c.lineCap = "round";
  var shaft = function (col, w, from, to) {
    c.strokeStyle = col; c.lineWidth = w;
    c.beginPath(); c.moveTo(from, 0); c.lineTo(to, 0); c.stroke();
  };
  shaft(ink, r * 0.11, 0, len);
  shaft("#f4f4f2", r * 0.065, 0, len * 0.82);
  shaft("#c8102e", r * 0.065, len * 0.82, len);
  c.strokeStyle = "rgba(0,0,0,0.18)"; c.lineWidth = r * 0.02;
  c.beginPath(); c.moveTo(0, r * 0.018); c.lineTo(len * 0.82, r * 0.018); c.stroke();
  // Crook: a hook curling back over the top
  c.beginPath(); c.arc(-r * 0.09, 0, r * 0.09, 0, Math.PI, true);
  c.strokeStyle = ink; c.lineWidth = r * 0.11; c.stroke();
  c.strokeStyle = "#f4f4f2"; c.lineWidth = r * 0.065; c.stroke();
  c.restore();
}

// Big hair as a second circle sitting behind the top of the ball: a lumpy
// cloud of twists, outlined as one shape (all the lumps stroked, then filled)
function drawHairPuff(c, r, look, ink) {
  var hc = look.hairColor, py = -r * 0.8, pr = r * 0.62;
  var lumps = [[0, 0, 1]];
  for (var i = 0; i < 9; i++) {
    var a = Math.PI * (1.05 + i * 0.1125);
    lumps.push([Math.cos(a) * pr * 0.78, Math.sin(a) * pr * 0.7, 0.34]);
  }
  var blob = function () {
    c.beginPath();
    lumps.forEach(function (l) { c.moveTo(l[0] + pr * l[2], py + l[1]); c.arc(l[0], py + l[1], pr * l[2], 0, Math.PI * 2); });
  };
  c.save();
  c.strokeStyle = ink; c.lineWidth = Math.max(2, r * 0.06) * 2;
  blob(); c.stroke();
  var g = c.createRadialGradient(-pr * 0.3, py - pr * 0.4, pr * 0.1, 0, py, pr * 1.2);
  g.addColorStop(0, shadeHex(hc, 0.3)); g.addColorStop(1, shadeHex(hc, -0.1));
  c.fillStyle = g; blob(); c.fill();
  blob(); c.clip();
  drawTwistStrands(c, r, hc, -pr * 1.1, py - pr * 1.05, pr * 2.2, pr * 1.6, 11, 170);
  c.restore();
}

// Long twists hanging down and slightly out from the middle, drawn over a
// clipped hair fill: thick dark strands with a light ridge on each
function drawTwistStrands(c, r, hc, x0, y0, w, h, seed, count) {
  var rnd = artRand(seed);
  c.lineCap = "round";
  for (var n = 0; n < count; n++) {
    var x = x0 + rnd() * w, y = y0 + rnd() * h, len = r * (0.14 + rnd() * 0.1);
    var dx = x * 0.25 + (rnd() - 0.5) * r * 0.04, dy = len;
    [[shadeHex(hc, -0.5), 0.045], [shadeHex(hc, 0.28), 0.014]].forEach(function (st) {
      c.strokeStyle = st[0]; c.lineWidth = Math.max(1, r * st[1]);
      c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + dx * 0.2 + r * 0.025, y + dy * 0.5, x + dx * 0.4, y + dy); c.stroke();
    });
  }
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
function drawArtHeadLayer(c, r, look, line, lw, name) {
  var hc = look.hairColor, jaw = -r * 0.3;
  // Chin shadow and neck line into the chest
  c.fillStyle = "rgba(0,0,0,0.2)";
  c.beginPath(); c.ellipse(0, jaw + r * 0.08, r * 0.45, r * 0.08, 0, 0, Math.PI * 2); c.fill();
  // (a chinstrap beard traces the jaw itself, so it skips the line)
  c.strokeStyle = look.beard === "chinstrap" ? "rgba(0,0,0,0)" : line; c.lineWidth = lw(0.045);
  c.beginPath(); c.moveTo(-r * 0.66, jaw - r * 0.14); c.quadraticCurveTo(-r * 0.5, jaw + r * 0.1, 0, jaw + r * 0.1); c.quadraticCurveTo(r * 0.5, jaw + r * 0.1, r * 0.66, jaw - r * 0.14); c.stroke();

  // Ears at the edges of the ball (drawn over a chinstrap beard instead, so
  // the sideburns run behind them)
  var drawEars = function () {
    var cauli = look.ears === "cauliflower";
    [-1, 1].forEach(function (s) {
      var ex = s * r * 0.76, ey = -r * 0.56, er = r * (cauli ? 0.14 : 0.12);
      c.fillStyle = shadeHex(look.skin, -0.06);
      c.strokeStyle = line; c.lineWidth = lw(0.035);
      c.beginPath(); c.ellipse(ex, ey, er * 0.7, er, 0, 0, Math.PI * 2); c.fill(); c.stroke();
      c.beginPath(); c.arc(ex - s * er * 0.1, ey, er * 0.55, s > 0 ? Math.PI * 0.5 : -Math.PI * 0.5, s > 0 ? Math.PI * 1.5 : Math.PI * 0.5); c.stroke();
      if (cauli) {
        c.beginPath(); c.arc(ex, ey - er * 0.35, er * 0.28, 0, Math.PI * 2); c.stroke();
        c.beginPath(); c.arc(ex + s * er * 0.1, ey + er * 0.3, er * 0.22, 0, Math.PI * 2); c.stroke();
      }
    });
  };
  if (look.beard !== "chinstrap") drawEars();

  // Hair across the top of the ball
  var up = look.hair === "stubble" ? r * 0.08 : 0;  // a stubble scalp sits on a higher hairline
  var hairline = function () {
    c.beginPath();
    c.moveTo(-r, -r * 0.5 - up);
    c.lineTo(-r * 0.74, -r * 0.6 - up);
    c.quadraticCurveTo(-r * 0.62, -r * 0.76 - up, -r * 0.4, -r * 0.74 - up);
    c.quadraticCurveTo(0, -r * 0.82 - up, r * 0.4, -r * 0.74 - up);
    c.quadraticCurveTo(r * 0.62, -r * 0.76 - up, r * 0.74, -r * 0.6 - up);
    c.lineTo(r, -r * 0.5 - up); c.lineTo(r, -r); c.lineTo(-r, -r); c.closePath();
  };
  c.fillStyle = hc;
  if (look.hair === "crop") {
    // Short faded sides, and a short top brushed straight up into a spiky
    // quiff over an arched hairline that comes to a point in the middle and
    // recedes at both temples
    c.save(); c.beginPath(); c.rect(-r, -r, r * 0.3, r); c.rect(r * 0.7, -r, r * 0.3, r); c.clip();
    c.fillStyle = shadeHex(hc, -0.12); hairline(); c.fill();
    c.restore();
    var crg = c.createLinearGradient(0, -r, 0, -r * 0.6);
    crg.addColorStop(0, shadeHex(hc, -0.2)); crg.addColorStop(1, shadeHex(hc, 0.1));
    c.fillStyle = crg;
    var front = function () {
      c.beginPath();
      c.moveTo(-r * 0.8, -r);
      c.quadraticCurveTo(-r * 0.8, -r * 0.8, -r * 0.66, -r * 0.8);
      c.bezierCurveTo(-r * 0.5, -r * 0.7, -r * 0.2, -r * 0.64, 0, -r * 0.64);
      c.bezierCurveTo(r * 0.2, -r * 0.64, r * 0.5, -r * 0.7, r * 0.66, -r * 0.8);
      c.quadraticCurveTo(r * 0.8, -r * 0.8, r * 0.8, -r);
      c.closePath();
    };
    front(); c.fill();
    c.strokeStyle = shadeHex(hc, -0.45); c.lineWidth = lw(0.018); c.stroke();
    // Brushed-up texture: strands rising from the hairline, fanning out a
    // little, light at the quiff in the middle
    c.save(); front(); c.clip();
    c.lineCap = "round";
    for (var qs = -7; qs <= 7; qs++) {
      var qx = qs * r * 0.085, qy = -r * (0.62 + Math.pow(Math.abs(qs) / 7, 1.6) * 0.18);
      c.strokeStyle = Math.abs(qs) < 3 ? shadeHex(hc, 0.35) : (qs % 2 ? shadeHex(hc, -0.3) : shadeHex(hc, 0.2));
      c.lineWidth = lw(Math.abs(qs) < 3 ? 0.02 : 0.014); c.globalAlpha = 0.55;
      c.beginPath(); c.moveTo(qx, qy + r * 0.02);
      c.quadraticCurveTo(qx + qs * r * 0.01, qy - r * 0.12, qx + qs * r * 0.03, qy - r * 0.26); c.stroke();
    }
    c.globalAlpha = 1;
    c.restore();
    // Fade grain on the sides
    var cr = artRand(9); c.fillStyle = shadeHex(hc, -0.3); c.globalAlpha = 0.4;
    for (var cg = 0; cg < 50; cg++) {
      var cgx = (cr() < 0.5 ? -1 : 1) * r * (0.82 + cr() * 0.15), cgy = -r * (0.5 + cr() * 0.25);
      c.fillRect(cgx, cgy, r * 0.016, r * 0.016);
    }
    c.globalAlpha = 1; c.fillStyle = hc;
  } else if (look.hair === "buzz" || look.hair === "stubble") {
    // A stubble scalp is a see-through shadow, as light as the short beard
    c.globalAlpha = look.hair === "stubble" ? 0.32 : 0.88; hairline(); c.fill();
    var br = artRand(7);
    c.fillStyle = shadeHex(hc, -0.3); c.globalAlpha = look.hair === "stubble" ? 0.3 : 0.5;
    for (var bz = 0; bz < 70; bz++) {
      var bx = (br() * 2 - 1) * r * 0.7, by = -r * (0.78 + br() * 0.2) - up;
      if (look.hair === "stubble" && bz % 2 === 0) by += r * 0.1;  // grain right down to the hairline
      c.fillRect(bx, by, r * 0.018, r * 0.018);
    }
    c.globalAlpha = 1; c.fillStyle = hc;
  } else if (look.hair === "twists") {
    // Short twists pulled back: rows of small rounded knots over the scalp
    hairline(); c.fill();
    if (look.hairPuff) {
      c.save(); hairline(); c.clip();
      drawTwistStrands(c, r, hc, -r, -r * 1.05, r * 2, r * 0.3, 12, 60);
      c.restore();
    } else {
    c.fillStyle = shadeHex(hc, 0.22); c.strokeStyle = shadeHex(hc, -0.4); c.lineWidth = lw(0.012);
    for (var tw = 0; tw < 4; tw++) {
      var twy = -r * (0.95 - tw * 0.055), twn = 7 + tw;
      for (var tk = 0; tk < twn; tk++) {
        var twx = (tk - (twn - 1) / 2) * r * (0.16 - tw * 0.012) + (tw % 2) * r * 0.04;
        c.beginPath(); c.ellipse(twx, twy, r * 0.045, r * 0.032, 0.3, 0, Math.PI * 2); c.fill(); c.stroke();
      }
    }
    }
    c.fillStyle = hc;
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
    c.strokeStyle = shadeHex(hc, -0.3); c.lineWidth = lw(0.03); c.globalAlpha = look.hair === "buzz" || look.hair === "stubble" || look.hair === "mohawk" ? 0.3 : 0.8;
    hairline(); c.stroke(); c.globalAlpha = 1;
  }

  // Chinstrap: a narrow band from the sideburns along the jaw to the chin
  if (look.beard === "chinstrap") {
    // Strap and moustache are one path, wound the same way, so a single
    // see-through fill covers both with no darker seam where they meet
    var strap = function () {
      c.beginPath();
      // Sideburns run along the side of the head against the rim, thinning
      // to a fine point in the hair (higher for a stubble scalp's hairline)
      var ro = r * 0.985, a1 = -2.62, a2 = look.hair === "stubble" ? -1.98 : -2.1, sw = r * 0.13, n = 10;
      var arcPt = function (side, u, rad) {  // u: 0 at the jaw end, 1 at the tip
        var ang = a1 + (a2 - a1) * u;
        return [-side * Math.cos(ang) * rad, Math.sin(ang) * rad];
      };
      // Flush with the side of the head; a thin strip stays visible past the
      // ball's outline almost all the way up before it closes to a point
      var inner = function (u) { return ro - Math.max(sw * Math.pow(1 - u, 1.4), r * 0.085 * (1 - Math.pow(u, 6))); };
      var k, p0;
      // Left outer edge: tip down to the jaw end, then the U under the chin
      p0 = arcPt(-1, 1, ro); c.moveTo(p0[0], p0[1]);
      for (k = n - 1; k >= 0; k--) { p0 = arcPt(-1, k / n, ro); c.lineTo(p0[0], p0[1]); }
      c.quadraticCurveTo(-r * 0.66, -r * 0.22, -r * 0.26, jaw + r * 0.04);
      c.quadraticCurveTo(0, jaw + r * 0.13, r * 0.26, jaw + r * 0.04);
      p0 = arcPt(1, 0, ro); c.quadraticCurveTo(r * 0.66, -r * 0.22, p0[0], p0[1]);
      for (k = 1; k <= n; k++) { p0 = arcPt(1, k / n, ro); c.lineTo(p0[0], p0[1]); }
      // Right inner edge back down, along the jaw, and up the left side
      for (k = n - 1; k >= 0; k--) { p0 = arcPt(1, k / n, inner(k / n)); c.lineTo(p0[0], p0[1]); }
      c.quadraticCurveTo(r * 0.56, -r * 0.3, r * 0.24, jaw - r * 0.06);
      c.quadraticCurveTo(0, jaw + r * 0.02, -r * 0.24, jaw - r * 0.06);
      p0 = arcPt(-1, 0, inner(0)); c.quadraticCurveTo(-r * 0.56, -r * 0.3, p0[0], p0[1]);
      for (k = 1; k < n; k++) { p0 = arcPt(-1, k / n, inner(k / n)); c.lineTo(p0[0], p0[1]); }
      c.closePath();
      // Thin moustache arching over the mouth, its ends running into the strap
      c.moveTo(r * 0.29, jaw - r * 0.02);
      c.quadraticCurveTo(r * 0.29, -r * 0.48, 0, -r * 0.48);
      c.quadraticCurveTo(-r * 0.29, -r * 0.48, -r * 0.29, jaw - r * 0.02);
      c.lineTo(-r * 0.25, jaw - r * 0.02);
      c.quadraticCurveTo(-r * 0.25, -r * 0.44, 0, -r * 0.44);
      c.quadraticCurveTo(r * 0.25, -r * 0.44, r * 0.25, jaw - r * 0.02);
      c.closePath();
    };
    // Skin first so body lines underneath don't show through, then the hair
    c.fillStyle = look.skin; strap(); c.fill("nonzero");
    c.fillStyle = hc; c.globalAlpha = 0.5;
    strap(); c.fill("nonzero");
    // Stubble grain inside the shape
    c.save(); strap(); c.clip("nonzero");
    var cr = artRand(11);
    c.fillStyle = shadeHex(hc, -0.3); c.globalAlpha = 0.45;
    for (var cg = 0; cg < 140; cg++) {
      c.fillRect((cr() * 2 - 1) * r * 0.8, -r * 0.7 + cr() * r * 0.55, r * 0.016, r * 0.016);
    }
    c.restore();
    c.globalAlpha = 1;
    drawEars();
  }
  // Boxed beard: short and dense, sideburns running up into the hair, a low
  // cheek line, a moustache across the top lip and stubble grain throughout
  if (look.beard === "boxed") {
    var bc = look.beardColor || hc;
    var boxed = function () {
      c.beginPath();
      c.moveTo(-r * 0.86, -r * 0.6);
      c.lineTo(-r * 0.74, -r * 0.62);
      c.quadraticCurveTo(-r * 0.66, -r * 0.48, -r * 0.42, -r * 0.46);
      c.quadraticCurveTo(-r * 0.2, -r * 0.5, 0, -r * 0.5);
      c.quadraticCurveTo(r * 0.2, -r * 0.5, r * 0.42, -r * 0.46);
      c.quadraticCurveTo(r * 0.66, -r * 0.48, r * 0.74, -r * 0.62);
      c.lineTo(r * 0.86, -r * 0.6);
      c.quadraticCurveTo(r * 0.82, -r * 0.3, r * 0.34, jaw + r * 0.03);
      c.quadraticCurveTo(0, jaw + r * 0.15, -r * 0.34, jaw + r * 0.03);
      c.quadraticCurveTo(-r * 0.82, -r * 0.3, -r * 0.86, -r * 0.6);
      c.closePath();
    };
    c.fillStyle = bc; boxed(); c.fill();
    c.save(); boxed(); c.clip();
    // Moustache: a denser band across the top lip
    c.globalAlpha = 0.35; c.fillStyle = shadeHex(bc, -0.25);
    c.beginPath(); c.ellipse(0, -r * 0.45, r * 0.3, r * 0.05, 0, 0, Math.PI * 2); c.fill();
    var br2 = artRand(17);
    c.fillStyle = shadeHex(bc, -0.35); c.globalAlpha = 0.5;
    for (var bg = 0; bg < 160; bg++) c.fillRect((br2() * 2 - 1) * r * 0.85, -r * 0.62 + br2() * r * 0.38, r * 0.016, r * 0.016);
    c.fillStyle = shadeHex(bc, 0.35); c.globalAlpha = 0.45;
    for (var bh = 0; bh < 70; bh++) c.fillRect((br2() * 2 - 1) * r * 0.85, -r * 0.62 + br2() * r * 0.38, r * 0.014, r * 0.014);
    c.restore();
    c.globalAlpha = 1;
    drawEars();  // over the sideburns
  }
  // Beard: sideburns down around the jaw to a full chin
  if (look.beard !== "none" && look.beard !== "chinstrap" && look.beard !== "boxed") {
    c.globalAlpha = look.beard === "stubble" ? 0.28 : look.beard === "short" ? 0.55 : 1;
    c.fillStyle = look.beardColor || hc;
    c.beginPath();
    c.moveTo(-r * 0.74, -r * 0.66);
    c.quadraticCurveTo(-r * 0.62, -r * 0.44, -r * 0.32, -r * 0.5);
    c.quadraticCurveTo(0, -r * 0.4, r * 0.32, -r * 0.5);
    c.quadraticCurveTo(r * 0.62, -r * 0.44, r * 0.74, -r * 0.66);
    c.quadraticCurveTo(r * 0.8, -r * 0.3, r * 0.3, jaw + r * 0.02);
    c.quadraticCurveTo(0, jaw + r * (look.beard === "full" ? 0.2 : 0.12), -r * 0.3, jaw + r * 0.02);
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

  if (look.tattoos && look.tattoos.lionCrown) drawLionChest(c, r, look, name, lw, true);
  if (look.headwear === "bandana") drawBandana(c, r, line, lw);
  if (look.glasses === "shades") drawShades(c, r, lw);
}

// A crowned lion's head in the middle of the chest with a shaggy mane hanging
// down over the pecs. In the contained layout it is drawn from the head layer,
// after the beard, so the crown can sit right up at the neck.
function drawLionChest(c, r, look, name, lw, contained) {
  c.save();
  if (contained) { c.translate(0, r * 0.11); c.scale(0.86, 0.59); }
  // Drawn round, then the torso squeeze is undone so it keeps its shape
  var lt = contained ? 0.86 / 0.59 : 1, lr = r * 0.15, sh = "rgba(24,28,40,";
  var lrnd = artRand(artSeed(name + "lion"));
  c.save(); c.translate(-r * 0.03, contained ? -r * 0.19 : -r * 0.4); c.scale(1, lt);
  c.globalAlpha = 1;
  // Mane: a jagged, shaggy silhouette, longer locks at the bottom
  c.fillStyle = sh + "0.55)";
  c.beginPath();
  for (var mn = 0; mn <= 32; mn++) {
    var ma = mn / 32 * Math.PI * 2, out = mn % 2 === 0;
    var mr = lr * ((out ? 1.5 : 1.2) + 0.3 * Math.max(0, Math.sin(ma)) + (out ? lrnd() * 0.15 : 0));
    var mx = Math.cos(ma) * mr, my = Math.sin(ma) * mr + lr * 0.1;
    if (mn === 0) c.moveTo(mx, my); else c.lineTo(mx, my);
  }
  c.closePath(); c.fill();
  // Strands flowing out and down through the mane
  c.strokeStyle = sh + "0.8)"; c.lineWidth = lw(0.014);
  for (var st = 0; st < 18; st++) {
    var sa = st / 18 * Math.PI * 2;
    c.beginPath();
    c.moveTo(Math.cos(sa) * lr * 0.85, Math.sin(sa) * lr * 0.85);
    c.quadraticCurveTo(Math.cos(sa + 0.2) * lr * 1.2, Math.sin(sa + 0.2) * lr * 1.2 + lr * 0.2, Math.cos(sa + 0.1) * lr * 1.45, Math.sin(sa + 0.1) * lr * 1.45 + lr * 0.35);
    c.stroke();
  }
  // Ears and face
  var face = shadeHex(look.skin, 0.03);
  [-1, 1].forEach(function (e) {
    c.fillStyle = face; c.beginPath(); c.arc(e * lr * 0.55, -lr * 0.62, lr * 0.2, 0, Math.PI * 2); c.fill();
    c.fillStyle = sh + "0.45)"; c.beginPath(); c.arc(e * lr * 0.55, -lr * 0.62, lr * 0.1, 0, Math.PI * 2); c.fill();
  });
  c.fillStyle = face;
  c.beginPath(); c.moveTo(-lr * 0.7, -lr * 0.45); c.quadraticCurveTo(0, -lr * 0.9, lr * 0.7, -lr * 0.45);
  c.quadraticCurveTo(lr * 0.75, lr * 0.4, 0, lr * 0.85); c.quadraticCurveTo(-lr * 0.75, lr * 0.4, -lr * 0.7, -lr * 0.45); c.fill();
  c.fillStyle = sh + "0.2)"; c.fill();
  // Shading: brow, the long nose bridge, nose pad and muzzle
  c.fillStyle = sh + "0.5)";
  c.beginPath(); c.ellipse(0, -lr * 0.2, lr * 0.5, lr * 0.09, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = sh + "0.25)";
  c.fillRect(-lr * 0.1, -lr * 0.15, lr * 0.2, lr * 0.4);
  c.fillStyle = sh + "0.75)";
  c.beginPath(); c.moveTo(-lr * 0.18, lr * 0.25); c.lineTo(lr * 0.18, lr * 0.25); c.lineTo(0, lr * 0.42); c.closePath(); c.fill();
  c.fillStyle = sh + "0.3)";
  c.beginPath(); c.ellipse(0, lr * 0.58, lr * 0.3, lr * 0.16, 0, 0, Math.PI * 2); c.fill();
  // Crown sitting on the top of the mane
  c.fillStyle = sh + "0.85)";
  var cyc = -lr * 1.3, cw = lr * 0.75;
  c.fillRect(-cw, cyc, cw * 2, lr * 0.2);
  for (var pk = 0; pk < 5; pk++) {
    var pxk = -cw + pk * cw * 0.5;
    c.beginPath(); c.moveTo(pxk - lr * 0.12, cyc); c.lineTo(pxk, cyc - lr * (pk % 2 === 0 ? 0.35 : 0.22)); c.lineTo(pxk + lr * 0.12, cyc); c.fill();
  }
  c.restore();

  c.restore();
}

// A stars-and-stripes bandana tied over the scalp, knot and tails on one side.
function drawBandana(c, r, line, lw) {
  var cap = function () {
    c.beginPath();
    c.moveTo(-r, -r * 0.62);
    c.lineTo(-r * 0.78, -r * 0.66);
    c.quadraticCurveTo(0, -r * 0.8, r * 0.78, -r * 0.66);
    c.lineTo(r, -r * 0.62); c.lineTo(r, -r); c.lineTo(-r, -r); c.closePath();
  };
  c.save();
  cap(); c.clip();
  c.fillStyle = "#f4f1ea"; c.fillRect(-r, -r, r * 2, r);
  // Red stripes running front to back over the top of the head
  c.fillStyle = "#c8202c";
  for (var i = -4; i <= 4; i += 2) {
    c.beginPath();
    c.moveTo(i * r * 0.11, -r); c.lineTo((i + 1) * r * 0.11, -r);
    c.lineTo((i + 1) * r * 0.16, -r * 0.6); c.lineTo(i * r * 0.16, -r * 0.6); c.closePath(); c.fill();
  }
  // Folded hem across the forehead
  c.fillStyle = "rgba(0,0,0,0.18)";
  c.beginPath(); c.moveTo(-r, -r * 0.7); c.quadraticCurveTo(0, -r * 0.86, r, -r * 0.7); c.lineTo(r, -r * 0.62); c.quadraticCurveTo(0, -r * 0.78, -r, -r * 0.62); c.fill();
  c.restore();
  c.strokeStyle = line; c.lineWidth = lw(0.03);
  cap(); c.stroke();
  // Knot and tails behind the right ear
  c.fillStyle = "#c8202c";
  c.beginPath(); c.ellipse(r * 0.86, -r * 0.66, r * 0.07, r * 0.05, 0.4, 0, Math.PI * 2); c.fill(); c.stroke();
  c.fillStyle = "#f4f1ea";
  c.beginPath(); c.moveTo(r * 0.88, -r * 0.63); c.lineTo(r * 0.99, -r * 0.48); c.lineTo(r * 0.9, -r * 0.46); c.closePath(); c.fill(); c.stroke();
}

// Dark wraparound sunglasses across the head, arms running back to the ears.
function drawShades(c, r, lw) {
  var y = -r * 0.6;
  c.strokeStyle = "#0d0d0f"; c.lineWidth = lw(0.035);
  c.beginPath(); c.moveTo(-r * 0.68, y - r * 0.02); c.lineTo(-r * 0.46, y - r * 0.03); c.stroke();
  c.beginPath(); c.moveTo(r * 0.68, y - r * 0.02); c.lineTo(r * 0.46, y - r * 0.03); c.stroke();
  [-1, 1].forEach(function (s) {
    var g = c.createLinearGradient(0, y - r * 0.08, 0, y + r * 0.08);
    g.addColorStop(0, "#3a3f47"); g.addColorStop(1, "#0b0c0e");
    c.fillStyle = g;
    c.beginPath(); c.ellipse(s * r * 0.24, y, r * 0.2, r * 0.095, s * -0.06, 0, Math.PI * 2); c.fill();
    c.strokeStyle = "#050506"; c.lineWidth = lw(0.025); c.stroke();
    c.fillStyle = "rgba(255,255,255,0.35)";
    c.beginPath(); c.ellipse(s * r * 0.24 - r * 0.07, y - r * 0.035, r * 0.06, r * 0.02, -0.3, 0, Math.PI * 2); c.fill();
  });
  c.strokeStyle = "#0d0d0f"; c.lineWidth = lw(0.03);
  c.beginPath(); c.moveTo(-r * 0.05, y - r * 0.03); c.quadraticCurveTo(0, y - r * 0.06, r * 0.05, y - r * 0.03); c.stroke();
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
  } else if (look.core === "solid") {
    // Solid, thick core with no six pack: one broad smooth panel, a faint
    // centre line and the obliques framing it
    c.globalAlpha = 0.28; c.fillStyle = hi;
    c.beginPath(); c.ellipse(0, r * 0.16, r * 0.3, r * 0.22, 0, 0, Math.PI * 2); c.fill();
    c.globalAlpha = 0.3; c.strokeStyle = line; c.lineWidth = lw(0.035);
    c.beginPath(); c.moveTo(0, -r * 0.06); c.lineTo(0, r * 0.3); c.stroke();
    c.globalAlpha = 0.55; c.lineWidth = lw(0.045);
    [-1, 1].forEach(function (s) {
      c.beginPath(); c.moveTo(s * r * 0.4, -r * 0.08); c.quadraticCurveTo(s * r * 0.5, r * 0.16, s * r * 0.36, r * 0.4); c.stroke();
    });
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

  // Tattoos. In the contained layout nothing is inked above the chin line,
  // so clip to the area under it (the jaw curve, mapped into torso space).
  c.save();
  if (contained) {
    var tx = function (x) { return x / 0.86; }, ty = function (y) { return (y - r * 0.11) / 0.59; };
    c.beginPath();
    c.moveTo(tx(-r), ty(-r * 0.44));
    c.lineTo(tx(-r * 0.66), ty(-r * 0.44));
    c.quadraticCurveTo(tx(-r * 0.5), ty(-r * 0.2), 0, ty(-r * 0.2));
    c.quadraticCurveTo(tx(r * 0.5), ty(-r * 0.2), tx(r * 0.66), ty(-r * 0.44));
    c.lineTo(tx(r), ty(-r * 0.44)); c.lineTo(tx(r), ty(r)); c.lineTo(tx(-r), ty(r)); c.closePath();
    c.clip();
  }
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
  if (tat.lionCrown && !contained) drawLionChest(c, r, look, name, lw, false);
  if (tat.medallion) {
    // A round sun medallion on the sternum: rays round a ringed disc
    var mt = contained ? 0.86 / 0.59 : 1, mr = r * 0.085;
    c.save(); c.translate(0, -r * 0.3); c.scale(1, mt);
    c.fillStyle = "rgba(20,24,36,0.7)";
    for (var mrz = 0; mrz < 16; mrz++) {
      var mra = mrz / 16 * Math.PI * 2, ml = mr * (mrz % 2 === 0 ? 1.9 : 1.5);
      c.beginPath();
      c.moveTo(Math.cos(mra - 0.17) * mr, Math.sin(mra - 0.17) * mr);
      c.lineTo(Math.cos(mra) * ml, Math.sin(mra) * ml);
      c.lineTo(Math.cos(mra + 0.17) * mr, Math.sin(mra + 0.17) * mr);
      c.fill();
    }
    c.strokeStyle = "rgba(20,24,36,0.8)"; c.lineWidth = lw(0.014);
    c.beginPath(); c.arc(0, 0, mr, 0, Math.PI * 2); c.stroke();
    c.fillStyle = "rgba(20,24,36,0.35)";
    c.beginPath(); c.arc(0, 0, mr * 0.95, 0, Math.PI * 2); c.fill();
    c.beginPath(); c.arc(0, 0, mr * 0.55, 0, Math.PI * 2); c.stroke();
    c.fillStyle = "rgba(20,24,36,0.65)";
    c.beginPath(); c.arc(0, 0, mr * 0.25, 0, Math.PI * 2); c.fill();
    c.restore();
    c.strokeStyle = inkCol; c.fillStyle = inkCol;
  }
  if (tat.portraits) {
    // Black-and-grey family portraits filling the upper chest: a woman with
    // long hair, an older man with grey hair (lowest) and a girl with dark
    // hair (highest), over smoky shading down to the pecs.
    var tall = contained ? 0.86 / 0.59 : 1;  // undo the torso squeeze so faces stay round
    var faceSkin = shadeHex(skin, 0.06), shade = "rgba(28,34,52,";
    c.fillStyle = shade + "0.2)";
    for (var sm = 0; sm < 7; sm++) {
      c.beginPath(); c.ellipse(r * (-0.33 + sm * 0.11), -r * (0.24 + (sm % 2) * 0.04), r * 0.12, r * 0.07, 0, 0, Math.PI * 2); c.fill();
    }
    [{ x: -0.27, y: -0.4, w: 0.14, hair: "long" }, { x: 0, y: -0.36, w: 0.145, hair: "grey" }, { x: 0.27, y: -0.42, w: 0.135, hair: "girl" }].forEach(function (pt) {
      var w = r * pt.w;
      c.save(); c.translate(r * pt.x, r * pt.y); c.scale(1, tall / 1.15);
      // Hair behind the face
      if (pt.hair === "long") {
        c.fillStyle = shade + "0.78)";
        c.beginPath(); c.moveTo(-w * 1.05, w * 1.15); c.quadraticCurveTo(-w * 1.25, -w * 1.25, 0, -w * 1.3);
        c.quadraticCurveTo(w * 1.25, -w * 1.25, w * 1.05, w * 1.15); c.quadraticCurveTo(0, w * 0.9, -w * 1.05, w * 1.15); c.fill();
      } else if (pt.hair === "girl") {
        c.fillStyle = shade + "0.8)";
        c.beginPath(); c.moveTo(-w * 1.02, w * 0.75); c.quadraticCurveTo(-w * 1.25, -w * 1.3, 0, -w * 1.32);
        c.quadraticCurveTo(w * 1.25, -w * 1.3, w * 1.02, w * 0.75); c.quadraticCurveTo(0, w * 0.5, -w * 1.02, w * 0.75); c.fill();
      } else {
        c.fillStyle = shade + "0.35)";
        c.beginPath(); c.ellipse(0, -w * 0.25, w * 0.98, w * 1.05, 0, Math.PI, Math.PI * 2); c.fill();
      }
      // Face, shaded round the edges
      var fg = c.createRadialGradient(-w * 0.15, -w * 0.15, w * 0.1, 0, 0, w * 1.05);
      fg.addColorStop(0, faceSkin); fg.addColorStop(0.65, shadeHex(skin, -0.08)); fg.addColorStop(1, shadeHex(skin, -0.3));
      c.fillStyle = fg;
      c.beginPath(); c.ellipse(0, 0, w * 0.74, w * 0.95, 0, 0, Math.PI * 2); c.fill();
      c.fillStyle = shade + "0.16)"; c.fill();  // grey ink wash
      if (pt.hair === "girl") {
        // Fringe across the forehead
        c.fillStyle = shade + "0.8)";
        c.beginPath(); c.ellipse(0, -w * 0.72, w * 0.76, w * 0.32, 0, 0, Math.PI * 2); c.fill();
      } else if (pt.hair === "long") {
        // Hair parted over the forehead
        c.fillStyle = shade + "0.78)";
        c.beginPath(); c.moveTo(-w * 0.78, -w * 0.1); c.quadraticCurveTo(-w * 0.6, -w * 0.95, w * 0.1, -w * 0.92);
        c.quadraticCurveTo(-w * 0.35, -w * 0.6, -w * 0.78, -w * 0.1); c.fill();
      } else {
        // Receding grey hairline
        c.strokeStyle = shade + "0.45)"; c.lineWidth = lw(0.02);
        c.beginPath(); c.ellipse(0, -w * 0.25, w * 0.8, w * 0.75, 0, Math.PI * 1.1, Math.PI * 1.9); c.stroke();
      }
      // Soft shading only: brow line and the shadow of a smile
      c.fillStyle = shade + "0.3)";
      c.beginPath(); c.ellipse(0, -w * 0.2, w * 0.5, w * 0.1, 0, 0, Math.PI * 2); c.fill();
      c.beginPath(); c.ellipse(0, w * 0.45, w * 0.32, w * 0.12, 0, 0, Math.PI); c.fill();
      c.strokeStyle = shade + "0.55)"; c.lineWidth = lw(0.018);
      c.beginPath(); c.ellipse(0, 0, w * 0.74, w * 0.95, 0, 0, Math.PI * 2); c.stroke();
      c.restore();
    });
    // A short line of script under the girl's portrait
    c.strokeStyle = shade + "0.6)"; c.lineWidth = lw(0.016);
    c.beginPath();
    for (var sc = 0; sc <= 12; sc++) {
      var sx = r * (0.18 + sc * 0.012), sy = -r * 0.2 + Math.sin(sc * 1.8) * r * 0.014;
      if (sc === 0) c.moveTo(sx, sy); else c.lineTo(sx, sy);
    }
    c.stroke();
    c.strokeStyle = inkCol; c.fillStyle = inkCol; c.globalAlpha = 1;
  }
  [["leftArm", -1], ["rightArm", 1]].forEach(function (p) {
    if (!tat[p[0]]) return;
    var s = p[1], style = tat[p[0]];
    // Sleeve running over the shoulder: bands and curls
    c.save();
    if (style === "dense" || style === "lion" || style === "sun") {
      drawNamedSleeve(c, r, s, style, inkCol, lw, artSeed(name + p[0]), contained ? 0.86 / 0.59 : 1);
      c.restore();
      return;
    }
    c.beginPath(); c.arc(s * r * 1.02, -r * 0.3, r * 0.4, 0, Math.PI * 2); c.clip();
    c.globalAlpha = 0.38; c.fillRect(s > 0 ? r * 0.6 : -r, -r, r * 0.4, r * 1.2);
    if (tat.color) {
      // Coloured ink: a couple of red roses in the sleeve
      c.globalAlpha = 0.7; c.fillStyle = "#b8322a";
      c.beginPath(); c.arc(s * r * 0.8, -r * 0.5, r * 0.08, 0, Math.PI * 2); c.fill();
      c.beginPath(); c.arc(s * r * 0.9, -r * 0.12, r * 0.07, 0, Math.PI * 2); c.fill();
      c.fillStyle = inkCol;
    }
    c.globalAlpha = 1; c.lineWidth = lw(0.035);
    for (var q = 0; q < 4; q++) {
      c.beginPath(); c.arc(s * r * 0.86, -r * 0.62 + q * r * 0.17, r * 0.08, 0, Math.PI * 1.6); c.stroke();
    }
    c.beginPath(); c.moveTo(s * r * 0.7, -r * 0.7); c.quadraticCurveTo(s * r * 0.62, -r * 0.3, s * r * 0.72, r * 0.05); c.stroke();
    c.restore();
  });
  if (tat.script) {
    // Two lines of cursive (a name) across the left side of the chest
    c.lineWidth = lw(0.028);
    [[-0.5, 0], [-0.43, 0.06]].forEach(function (ln) {
      c.beginPath();
      for (var u = 0; u <= 24; u++) {
        var ux = -r * (0.52 - ln[1]) + u * r * 0.016;
        var uy = r * ln[0] + Math.sin(u * 1.7) * r * 0.022 - (u % 6 === 0 ? r * 0.03 : 0);
        if (u === 0) c.moveTo(ux, uy); else c.lineTo(ux, uy);
      }
      c.stroke();
    });
  }
  if (tat.claws) {
    // Claw marks raking down the right pec, red showing through
    [0, 1, 2, 3].forEach(function (k) {
      var x0 = r * (0.2 + k * 0.09), y0 = -r * 0.62 + k * r * 0.02;
      var x1 = x0 + r * 0.12, y1 = y0 + r * 0.38;
      c.lineWidth = lw(0.055); c.strokeStyle = inkCol;
      c.beginPath(); c.moveTo(x0, y0); c.quadraticCurveTo(x0 + r * 0.02, (y0 + y1) / 2, x1, y1); c.stroke();
      if (tat.color) {
        c.lineWidth = lw(0.022); c.strokeStyle = "rgba(200,60,40,0.85)";
        c.beginPath(); c.moveTo(x0 + r * 0.02, y0 + r * 0.06); c.quadraticCurveTo(x0 + r * 0.03, (y0 + y1) / 2, x1 - r * 0.01, y1 - r * 0.06); c.stroke();
      }
    });
    c.strokeStyle = inkCol;
  }
  if (tat.sidePiece) {
    // A big colour piece down the right side of the stomach (screen left),
    // from under the pec to the waistband: a dark scene with a figure in it
    var spT = contained ? -r * 0.12 : -r * 0.22, spB = contained ? r * 0.42 : r * 0.42;
    c.save();
    c.beginPath();
    c.moveTo(-r * 0.66, spT + r * 0.06);
    c.quadraticCurveTo(-r * 0.45, spT - r * 0.03, -r * 0.22, spT + r * 0.04);
    c.quadraticCurveTo(-r * 0.17, (spT + spB) / 2, -r * 0.21, spB);
    c.lineTo(-r * 0.58, spB);
    c.quadraticCurveTo(-r * 0.7, (spT + spB) / 2, -r * 0.66, spT + r * 0.06);
    c.closePath();
    c.fillStyle = "#34404c"; c.globalAlpha = 0.72; c.fill(); c.clip();
    var spr = artRand(21);
    [["#4f6a8a", 5], ["#8b3a2e", 4], ["#c9a46a", 3]].forEach(function (pc) {
      c.fillStyle = pc[0]; c.globalAlpha = 0.3;
      for (var k = 0; k < pc[1]; k++) {
        c.beginPath(); c.ellipse(-r * (0.22 + spr() * 0.4), spT + spr() * (spB - spT), r * (0.05 + spr() * 0.05), r * (0.06 + spr() * 0.08), spr() * 3, 0, Math.PI * 2); c.fill();
      }
    });
    // A figure's head and shoulders near the top of the piece
    c.globalAlpha = 0.5; c.fillStyle = shadeHex(look.skin, -0.3);
    c.beginPath(); c.ellipse(-r * 0.4, spT + r * 0.14, r * 0.06, r * 0.09, 0.2, 0, Math.PI * 2); c.fill();
    c.beginPath(); c.ellipse(-r * 0.4, spT + r * 0.3, r * 0.15, r * 0.08, 0, Math.PI, 0); c.fill();
    c.globalAlpha = 0.7; c.lineWidth = lw(0.016); c.strokeStyle = "#1e252c";
    // Linework through the scene
    for (var sl2 = 0; sl2 < 6; sl2++) {
      var ly = spT + r * 0.32 + sl2 * r * 0.07;
      c.beginPath(); c.moveTo(-r * 0.6, ly); c.quadraticCurveTo(-r * 0.4, ly - r * 0.05, -r * 0.2, ly + r * 0.02); c.stroke();
    }
    c.restore();
    c.globalAlpha = 1;
  }
  if (tat.eyes) {
    // A pair of staring eyes just below the left pec (screen right), linework only
    var ey0 = contained ? r * 0.31 : r * 0.14, eyq = contained ? 0.86 / 0.59 : 1;
    c.save(); c.translate(r * 0.6, ey0); c.scale(0.85, eyq * 0.85);
    c.lineWidth = lw(0.022); c.globalAlpha = 0.85;
    [-1, 1].forEach(function (es) {
      var ex = es * r * 0.1;
      c.beginPath();
      c.moveTo(ex - r * 0.075, 0);
      c.quadraticCurveTo(ex, -r * 0.055, ex + r * 0.075, 0);
      c.quadraticCurveTo(ex, r * 0.045, ex - r * 0.075, 0);
      c.stroke();
      c.beginPath(); c.arc(ex, -r * 0.002, r * 0.022, 0, Math.PI * 2); c.fill();
      // Brow sweeping up and out
      c.beginPath(); c.moveTo(ex - es * r * 0.06, -r * 0.065); c.quadraticCurveTo(ex + es * r * 0.02, -r * 0.09, ex + es * r * 0.085, -r * 0.06); c.stroke();
    });
    c.globalAlpha = 1;
    c.restore();
  }
  if (tat.ribs) {
    // Script running down the ribs: the right side, or the left with "left"
    var rbs = tat.ribs === "left" ? -1 : 1;
    c.lineWidth = lw(0.025);
    c.beginPath();
    for (var w = 0; w < 14; w++) {
      var wy = -r * 0.2 + w * r * 0.035, wx = rbs * (r * 0.58 + Math.sin(w * 1.9) * r * 0.035);
      if (w === 0) c.moveTo(wx, wy); else c.lineTo(wx, wy);
    }
    c.stroke();
  }

  c.restore();
  if (contained) c.restore();

  // Tattoo decals traced from reference photos: little images placed in ball
  // units (x, y, w, h as fractions of r), kept between the jaw and the shorts
  if (tat.decals && contained) {
    c.save();
    c.beginPath(); c.rect(-r, -r * 0.28, r * 2, r * 0.64); c.clip();
    tat.decals.forEach(function (d) {
      var im = artDecalImage(d.img);
      if (!im.complete || !im.naturalWidth) return;
      c.globalAlpha = d.alpha === undefined ? 1 : d.alpha;
      c.drawImage(im, r * d.x, r * d.y, r * d.w, r * d.h);
    });
    c.restore();
  }

  // A collared polo shirt (a referee's) covering the torso, sleeves at the sides
  if (look.outfit === "polo") {
    var shirt = look.shirt || "#1b1c1f", sTopP = contained ? r * 0.36 : r * 0.42;
    var neckY = contained ? -r * 0.1 : -r * 0.5;
    c.fillStyle = shirt;
    c.beginPath();
    c.moveTo(-r, neckY - r * 0.12);
    c.quadraticCurveTo(-r * 0.5, neckY + r * 0.04, 0, neckY + r * 0.06);
    c.quadraticCurveTo(r * 0.5, neckY + r * 0.04, r, neckY - r * 0.12);
    c.lineTo(r, sTopP + r * 0.02); c.lineTo(-r, sTopP + r * 0.02); c.closePath(); c.fill();
    // Soft fabric folds and the shoulder seams
    var pg = c.createLinearGradient(0, neckY, 0, sTopP);
    pg.addColorStop(0, "rgba(255,255,255,0.08)"); pg.addColorStop(1, "rgba(0,0,0,0.2)");
    c.fillStyle = pg; c.fillRect(-r, neckY - r * 0.1, r * 2, sTopP - neckY + r * 0.12);
    c.strokeStyle = "rgba(255,255,255,0.12)"; c.lineWidth = lw(0.02);
    [-1, 1].forEach(function (sd) {
      c.beginPath(); c.moveTo(sd * r * 0.66, neckY); c.quadraticCurveTo(sd * r * 0.6, (neckY + sTopP) / 2, sd * r * 0.7, sTopP); c.stroke();
      c.beginPath(); c.moveTo(sd * r * 0.25, (neckY + sTopP) / 2); c.quadraticCurveTo(sd * r * 0.32, sTopP - r * 0.12, sd * r * 0.22, sTopP); c.stroke();
    });
    // Collar points and the button placket
    c.fillStyle = shadeHex(shirt.charAt(0) === "#" ? shirt : "#1b1c1f", 0.08);
    c.strokeStyle = "rgba(0,0,0,0.55)"; c.lineWidth = lw(0.018);
    [-1, 1].forEach(function (sd) {
      c.beginPath();
      c.moveTo(sd * r * 0.02, neckY + r * 0.06);
      c.lineTo(sd * r * 0.3, neckY - r * 0.02);
      c.lineTo(sd * r * 0.2, neckY + r * 0.13);
      c.closePath(); c.fill(); c.stroke();
    });
    c.strokeStyle = "rgba(255,255,255,0.15)";
    c.beginPath(); c.moveTo(0, neckY + r * 0.07); c.lineTo(0, neckY + r * 0.25); c.stroke();
    c.fillStyle = "rgba(255,255,255,0.35)";
    [0.13, 0.21].forEach(function (by) { c.beginPath(); c.arc(r * 0.025, neckY + r * by, r * 0.012, 0, Math.PI * 2); c.fill(); });
    // Commission badge on the left chest
    if (look.badge) {
      c.fillStyle = look.badge;
      c.beginPath(); c.moveTo(-r * 0.42, neckY + r * 0.16); c.lineTo(-r * 0.3, neckY + r * 0.16); c.lineTo(-r * 0.3, neckY + r * 0.28);
      c.lineTo(-r * 0.36, neckY + r * 0.33); c.lineTo(-r * 0.42, neckY + r * 0.28); c.closePath(); c.fill();
    }
  }

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
  if (look.shortsStyle === "print") {
    // Loud printed shorts: splashes of colour over the base
    var pr = artRand(artSeed(name + "shorts"));
    var pal = ["#e8452c", "#f2a32b", "#2fae5f", "#2c7be5", "#e94f9a", "#f4e04d", look.trim];
    for (var sp = 0; sp < 26; sp++) {
      // Little five-petal flowers and leaves
      var spx = (pr() * 2 - 1) * r, spy = sTop + band + pr() * (r - sTop), pz = r * (0.035 + pr() * 0.04);
      c.globalAlpha = 0.9;
      if (sp % 3 === 2) {
        c.fillStyle = "#2fae5f";
        c.beginPath(); c.ellipse(spx, spy, pz * 1.6, pz * 0.6, pr() * Math.PI, 0, Math.PI * 2); c.fill();
        continue;
      }
      c.fillStyle = pal[sp % pal.length];
      for (var pe = 0; pe < 5; pe++) {
        var pa = pe * Math.PI * 0.4 + sp;
        c.beginPath(); c.arc(spx + Math.cos(pa) * pz * 0.8, spy + Math.sin(pa) * pz * 0.8, pz * 0.6, 0, Math.PI * 2); c.fill();
      }
      c.fillStyle = "#f4e04d";
      c.beginPath(); c.arc(spx, spy, pz * 0.4, 0, Math.PI * 2); c.fill();
    }
    c.globalAlpha = 1;
  }
  if (look.shortsStyle === "slash") {
    // Jagged streaks raking across the legs, in the trim colour
    var slr = artRand(artSeed(name + "slash"));
    c.fillStyle = look.trim;
    for (var sl = 0; sl < 20; sl++) {
      var sy0 = sTop + band + r * 0.05 + slr() * (r * 0.88 - sTop - band), sx0 = (slr() * 2 - 1) * r * 0.75, sw = r * (0.18 + slr() * 0.25), sh0 = r * (0.01 + slr() * 0.015);
      c.globalAlpha = 0.6 + slr() * 0.35;
      c.beginPath();
      c.moveTo(sx0 - sw / 2, sy0);
      c.lineTo(sx0 - sw * 0.1, sy0 - sh0 * 1.2);
      c.lineTo(sx0 + sw / 2, sy0 - sh0 * 2.2);
      c.lineTo(sx0 + sw * 0.15, sy0 + sh0);
      c.closePath(); c.fill();
    }
    c.globalAlpha = 1;
  }
  if (look.shortsStyle === "pinstripe") {
    // Thin vertical stripes down both legs in the accent colour
    c.strokeStyle = look.accent || shadeHex(look.trim, 0.45); c.lineWidth = lw(0.03);
    [-1, 1].forEach(function (sd) {
      for (var ps = 0; ps < 4; ps++) {
        var pxs = sd * r * (0.5 + ps * 0.12);
        c.beginPath(); c.moveTo(pxs, sTop + band); c.quadraticCurveTo(pxs - sd * r * 0.04, (sTop + r) / 2, pxs - sd * r * 0.02, r); c.stroke();
      }
    });
  }
  if (look.shortsStyle === "chevron") {
    // A wide diagonal panel sweeping up the right leg, pinstripes on the left
    c.fillStyle = look.trim;
    c.beginPath();
    c.moveTo(r * 0.06, r); c.lineTo(r * 0.4, r);
    c.lineTo(r * 0.94, sTop + band); c.lineTo(r * 0.6, sTop + band); c.closePath(); c.fill();
    c.strokeStyle = look.trim; c.lineWidth = lw(0.035);
    c.beginPath(); c.moveTo(-r * 0.12, r); c.lineTo(r * 0.46, sTop + band); c.stroke();
    [0, 1].forEach(function (k) {
      c.beginPath(); c.moveTo(-r * (0.86 - k * 0.12), sTop + band); c.lineTo(-r * (0.5 - k * 0.12), r); c.stroke();
    });
  }
  if (look.shortsStyle === "usa") {
    // Stars-and-stripes panel down the outside of the right leg (screen left)
    c.save();
    c.beginPath(); c.moveTo(-r, sTop + band); c.lineTo(-r * 0.62, sTop + band); c.lineTo(-r * 0.12, r); c.lineTo(-r, r); c.closePath(); c.clip();
    for (var us = 0; us < 14; us++) {
      c.fillStyle = us % 2 ? "#f4f4f2" : "#c8202c";
      c.beginPath();
      var uy0 = sTop + band + r * 0.02 + us * r * 0.055;
      c.moveTo(-r, uy0); c.lineTo(-r * 0.2, uy0 - r * 0.22); c.lineTo(-r * 0.2, uy0 - r * 0.165); c.lineTo(-r, uy0 + r * 0.055); c.closePath(); c.fill();
    }
    c.restore();
  }
  if (look.shortsStyle === "stripe") {
    c.fillStyle = look.trim;
    [-1, 1].forEach(function (s) {
      c.beginPath();
      c.moveTo(s * r * 0.62, sTop + band); c.lineTo(s * r * 0.74, sTop + band);
      c.lineTo(s * r * 0.86, r); c.lineTo(s * r * 0.72, r); c.closePath(); c.fill();
    });
  }
  // Waistband
  c.fillStyle = look.shortsStyle === "split" ? shadeHex(look.shorts, -0.35) : look.shortsStyle === "print" ? "#111111" : look.trim;
  c.fillRect(-r, sTop, r * 2, band);
  c.fillStyle = "rgba(0,0,0,0.18)"; c.fillRect(-r, sTop + band * 0.75, r * 2, band * 0.25);
  if (look.shortsStyle === "usa") {
    // White star on the waistband over the left hip
    var stx = r * 0.5, sty = sTop + band * 0.5, sto = band * 0.42;
    c.fillStyle = "#f4f4f2";
    c.beginPath();
    for (var sti = 0; sti < 10; sti++) {
      var sta = -Math.PI / 2 + sti * Math.PI / 5, strr = sti % 2 ? sto * 0.42 : sto;
      if (sti === 0) c.moveTo(stx + Math.cos(sta) * strr, sty + Math.sin(sta) * strr); else c.lineTo(stx + Math.cos(sta) * strr, sty + Math.sin(sta) * strr);
    }
    c.closePath(); c.fill();
  }
  if (look.shortsStyle === "print") {
    // Logo patch on the front of the waistband
    c.fillStyle = "#111111"; c.fillRect(r * 0.08, sTop, r * 0.4, band + r * 0.12);
    c.fillStyle = "#f2f2f2"; c.fillRect(r * 0.14, sTop + band * 0.45, r * 0.28, r * 0.07);
  }
  // Leg split and a patch on the left leg
  c.fillStyle = ink;
  c.beginPath(); c.moveTo(-r * 0.07, r); c.lineTo(0, r * 0.8); c.lineTo(r * 0.07, r); c.closePath(); c.fill();
  c.fillStyle = look.shortsStyle === "split" ? look.shorts : look.trim;
  c.globalAlpha = look.shortsStyle === "print" ? 0 : 0.85;
  c.fillRect(-r * 0.42, sTop + band + r * 0.1, r * 0.18, r * 0.09);
  c.globalAlpha = 1;
  c.strokeStyle = ink; c.lineWidth = lw(0.05);
  c.beginPath(); c.moveTo(-r, sTop); c.lineTo(r, sTop); c.stroke();

  if (contained) drawArtHeadLayer(c, r, look, line, lw, name);

  // Overall roundness: rim shadow
  var rg = c.createRadialGradient(-r * 0.2, -r * 0.25, r * 0.6, 0, 0, r);
  rg.addColorStop(0, "rgba(0,0,0,0)"); rg.addColorStop(1, "rgba(0,0,0,0.25)");
  c.fillStyle = rg; c.fillRect(-r, -r, r * 2, r * 2);
  c.restore();

  c.strokeStyle = ink; c.lineWidth = Math.max(2, r * 0.077);
  c.beginPath(); c.arc(0, 0, r, 0, Math.PI * 2); c.stroke();
}

// Named sleeve styles, drawn inside the shoulder clip at side `s`.
// "dense": near solid black-and-grey from shoulder down, dark emblem on the delt.
// "lion": a lion's head with a shaggy mane on the delt, patchier ink below.
function drawNamedSleeve(c, r, s, style, inkCol, lw, seed, tall) {
  // The arm hangs down the side of the ball, from the shoulder to the shorts
  var rnd = artRand(seed), inner = r * 0.64, x0 = s * r * 0.8;
  c.beginPath();
  c.moveTo(s * r, -r * 0.95);
  c.quadraticCurveTo(s * (inner - r * 0.04), -r * 0.9, s * (inner - r * 0.04), -r * 0.35);
  c.quadraticCurveTo(s * (inner - r * 0.04), r * 0.1, s * (inner + r * 0.02), r * 0.6);
  c.lineTo(s * r, r * 0.6); c.closePath(); c.clip();
  c.fillStyle = inkCol;
  c.globalAlpha = style === "dense" ? 0.95 : style === "sun" ? 0.6 : 0.2;
  c.fillRect(s > 0 ? inner - r * 0.1 : -r, -r, r * 0.5, r * 1.6);
  if (style === "lion") {
    // Heavier ink on the forearm, lighter patches higher up
    c.globalAlpha = 0.35; c.fillRect(s > 0 ? inner - r * 0.1 : -r, r * 0.05, r * 0.5, r * 0.6);
  }
  // Smoky blotches so it reads as shaded ink, not a flat band
  for (var i = 0; i < 22; i++) {
    c.globalAlpha = (style === "dense" ? 0.3 : 0.2) + rnd() * 0.25;
    c.beginPath(); c.ellipse(x0 + (rnd() - 0.5) * r * 0.3, -r * 0.75 + rnd() * r * 1.35, r * (0.03 + rnd() * 0.06), r * (0.03 + rnd() * 0.05), rnd() * 3, 0, Math.PI * 2); c.fill();
  }
  c.globalAlpha = 1;
  if (style === "sun") {
    // Script across the middle of the arm
    c.strokeStyle = "rgba(14,16,24,0.85)"; c.lineWidth = lw(0.016);
    [0, 1].forEach(function (ln) {
      c.beginPath();
      for (var u = 0; u <= 10; u++) {
        var ux = s * r * (0.7 + u * 0.022), uy = r * (0.02 + ln * 0.07) + Math.sin(u * 1.9) * r * 0.012;
        if (u === 0) c.moveTo(ux, uy); else c.lineTo(ux, uy);
      }
      c.stroke();
    });
  }
  c.save(); c.translate(s * r * 0.83, -r * 0.5); c.scale(1, tall);
  if (style === "sun") {
    // Sunburst on the shoulder: rays fanning from the top of the delt
    c.fillStyle = "rgba(14,16,24,0.7)";
    for (var ry = 0; ry < 9; ry++) {
      var ra = Math.PI * (0.15 + ry * 0.09) * (s > 0 ? 1 : -1) + (s > 0 ? 0 : Math.PI);
      c.beginPath();
      c.moveTo(Math.cos(ra - 0.05) * r * 0.05, -r * 0.1 + Math.sin(ra - 0.05) * r * 0.05);
      c.lineTo(Math.cos(ra) * r * 0.28, -r * 0.1 + Math.sin(ra) * r * 0.28);
      c.lineTo(Math.cos(ra + 0.05) * r * 0.05, -r * 0.1 + Math.sin(ra + 0.05) * r * 0.05);
      c.fill();
    }
    c.beginPath(); c.arc(0, -r * 0.1, r * 0.05, 0, Math.PI * 2); c.fill();
  } else if (style === "dense") {
    // Dark emblem on the delt: a body with legs reaching out
    c.fillStyle = "rgba(14,16,24,0.9)"; c.strokeStyle = "rgba(14,16,24,0.9)"; c.lineWidth = lw(0.022);
    c.beginPath(); c.ellipse(0, 0, r * 0.05, r * 0.075, 0, 0, Math.PI * 2); c.fill();
    for (var l = 0; l < 4; l++) {
      [-1, 1].forEach(function (d) {
        var a = -0.9 + l * 0.6;
        c.beginPath(); c.moveTo(0, 0);
        c.quadraticCurveTo(d * r * 0.08, a * r * 0.06, d * r * 0.13, a * r * 0.11); c.stroke();
      });
    }
  } else {
    // Lion's head: a ring of mane tufts round a shaded face
    var lr = r * 0.11;
    c.strokeStyle = "rgba(20,24,36,0.8)"; c.lineWidth = lw(0.022);
    for (var m = 0; m < 14; m++) {
      var ma = m / 14 * Math.PI * 2;
      c.beginPath();
      c.moveTo(Math.cos(ma) * lr * 0.7, Math.sin(ma) * lr * 0.7);
      c.quadraticCurveTo(Math.cos(ma + 0.3) * lr * 1.3, Math.sin(ma + 0.3) * lr * 1.3, Math.cos(ma + 0.15) * lr * 1.6, Math.sin(ma + 0.15) * lr * 1.6);
      c.stroke();
    }
    c.fillStyle = "rgba(20,24,36,0.35)";
    c.beginPath(); c.ellipse(0, lr * 0.1, lr * 0.62, lr * 0.75, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = "rgba(20,24,36,0.65)";
    c.beginPath(); c.ellipse(0, lr * 0.45, lr * 0.25, lr * 0.16, 0, 0, Math.PI * 2); c.fill();
  }
  c.restore();
}

// Inked arm texture for fighters whose look sets tattoos.armInk: a skin tile
// with black-and-grey swirls and shading, used as the arm stroke in attacks.
var sleevePatterns = {};
function sleevePattern(look) {
  var key = look.skin;
  if (sleevePatterns[key]) return sleevePatterns[key];
  if (typeof document === "undefined") return look.skin;
  var n = 24, cv = document.createElement("canvas");
  cv.width = cv.height = n;
  var c = cv.getContext("2d"), rnd = artRand(artSeed(key + "sleeve"));
  c.fillStyle = look.skin; c.fillRect(0, 0, n, n);
  c.fillStyle = "rgba(28,34,52,0.38)"; c.fillRect(0, 0, n, n);
  c.strokeStyle = "rgba(14,16,24,0.8)"; c.lineWidth = 1.3; c.lineCap = "round";
  for (var i = 0; i < 9; i++) {
    var x = rnd() * n, y = rnd() * n, rr = 2 + rnd() * 4, a = rnd() * 6;
    // Draw each mark at its wrapped copies so the tile repeats seamlessly
    [-n, 0, n].forEach(function (dx) {
      [-n, 0, n].forEach(function (dy) {
        if (i % 3 === 0) {
          c.fillStyle = "rgba(14,16,24,0.45)";
          c.beginPath(); c.ellipse(x + dx, y + dy, rr, rr * 0.7, a, 0, Math.PI * 2); c.fill();
        } else {
          c.beginPath(); c.arc(x + dx, y + dy, rr, a, a + 3.6); c.stroke();
        }
      });
    });
  }
  sleevePatterns[key] = c.createPattern(cv, "repeat") || look.skin;
  return sleevePatterns[key];
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

// The fighter art as an image, for the roster cards. Cached per look.
var artUrlCache = {};
function fighterArtUrl(ch) {
  if (!ch.look) return null;
  var key = ch.name + JSON.stringify(ch.look);
  if (!artUrlCache[key]) {
    var cv = document.createElement("canvas");
    cv.width = cv.height = 128;
    drawFighterArt(cv.getContext("2d"), 64, 64, 64, ch.look, "#16211f", { layout: "contained", name: ch.name });
    artUrlCache[key] = cv.toDataURL();
  }
  return artUrlCache[key];
}
