// Islam Makhachev's "2-3 years Dagestan" cutscene art (Joe's reference
// photos, 2026-11-22, project-files/art/islam/dagestan-refs): the snowy
// Caucasus ridges with dark rock gullies, a stone village stacked up a
// hillside with autumn trees and power poles, a wheeled wooden catapult with
// an A-frame, crossbar and spoon arm, and Hasbulla in his maroon velvet cap
// and light blue collared shirt. Drawn from drawIslamCutscene
// (islam-specials.js) in its 1080 x 1920 frame.

var islDagBg = null;  // the backdrop, painted once on its own canvas

function islDagRand(seed) {
  var s = seed;
  return function () { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
}

// The whole still backdrop: sky, mountains, village, foreground hillside.
function drawDagestanBackdrop(c) {
  if (!islDagBg) islDagBg = islBuildDagBg();
  c.drawImage(islDagBg, 0, 0);
}

function islBuildDagBg() {
  var cv = document.createElement("canvas"); cv.width = 1080; cv.height = 1920;
  var c = cv.getContext("2d"), rnd = islDagRand(4242), i, j;
  // Morning sky, just a strip above the ridge.
  var sky = c.createLinearGradient(0, 0, 0, 520);
  sky.addColorStop(0, "#6fa3d6"); sky.addColorStop(1, "#cfe2f1");
  c.fillStyle = sky; c.fillRect(0, 0, 1080, 1100);

  // The big snowy massif: a jagged ridge, snow fields, dark rock ribs
  // running down in diagonal gullies.
  var ridge = [], peaks = [[0, 310], [230, 230], [430, 165], [610, 215], [790, 150], [1080, 270]];
  peaks.forEach(function (p, k) {
    ridge.push(p);
    if (k < peaks.length - 1) { var q = peaks[k + 1]; var mx = (p[0] + q[0]) / 2; ridge.push([mx - 30, (p[1] + q[1]) / 2 + 10]); ridge.push([mx + (rnd() - 0.5) * 30, Math.max(p[1], q[1]) + 30 + rnd() * 25]); ridge.push([mx + 35, (p[1] + q[1]) / 2 + 15]); }
  });
  var mtn = function () {
    c.beginPath(); c.moveTo(0, 1000);
    ridge.forEach(function (p) { c.lineTo(p[0], p[1]); });
    c.lineTo(1080, 1000); c.closePath();
  };
  var sn = c.createLinearGradient(0, 200, 0, 950);
  sn.addColorStop(0, "#fbfdff"); sn.addColorStop(0.55, "#e4ecf4"); sn.addColorStop(1, "#b9c7d6");
  c.fillStyle = sn; mtn(); c.fill();
  c.save(); mtn(); c.clip();
  // shadowed faces on the right of each spur
  for (i = 0; i < 9; i++) {
    var sx = 60 + i * 125 + rnd() * 40, top = 260 + rnd() * 80;
    c.fillStyle = "rgba(120,150,190,0.22)";
    c.beginPath(); c.moveTo(sx, top); c.lineTo(sx + 160, top + 520); c.lineTo(sx + 260, top + 520); c.lineTo(sx + 40, top); c.closePath(); c.fill();
  }
  // rock ribs: thin dark streaks fanning down the slope
  for (i = 0; i < 55; i++) {
    var rx = rnd() * 1180 - 60, ry = 230 + rnd() * 300, len = 80 + rnd() * 380, ang = 0.85 + rnd() * 0.75, w = 2 + rnd() * rnd() * 12;
    var g = c.createLinearGradient(rx, ry, rx + Math.cos(ang) * len, ry + Math.sin(ang) * len);
    g.addColorStop(0, "rgba(70,82,104,0)"); g.addColorStop(0.25, "rgba(70,82,104,0.75)"); g.addColorStop(1, "rgba(70,82,104,0.15)");
    c.strokeStyle = g; c.lineWidth = w; c.lineCap = "round";
    c.beginPath(); c.moveTo(rx, ry);
    c.quadraticCurveTo(rx + Math.cos(ang) * len * 0.5 + (rnd() - 0.5) * 40, ry + Math.sin(ang) * len * 0.5, rx + Math.cos(ang) * len, ry + Math.sin(ang) * len);
    c.stroke();
  }
  // bare brown rock low down where the snow thins
  var low = c.createLinearGradient(0, 700, 0, 1000);
  low.addColorStop(0, "rgba(120,104,90,0)"); low.addColorStop(1, "rgba(120,104,90,0.7)");
  c.fillStyle = low; c.fillRect(0, 650, 1080, 400);
  c.restore();
  c.strokeStyle = "rgba(31,35,40,0.45)"; c.lineWidth = 3;
  c.beginPath(); ridge.forEach(function (p, k) { if (k) c.lineTo(p[0], p[1]); else c.moveTo(p[0], p[1]); }); c.stroke();

  // A far hillside on the right with the lower town in it.
  c.fillStyle = "#7d7262";
  c.beginPath(); c.moveTo(560, 1000); c.quadraticCurveTo(820, 820, 1080, 800); c.lineTo(1080, 1000); c.closePath(); c.fill();
  for (i = 0; i < 26; i++) {
    var tx = 640 + rnd() * 440, ty = 840 + rnd() * 120 + (1080 - tx) * 0.05;
    islDagHouse(c, tx, ty, 18 + rnd() * 16, 12 + rnd() * 12, rnd, 0.75);
  }

  // The village hill: dark slope rising to the left, houses stacked on it.
  c.fillStyle = "#3d3326";
  c.beginPath(); c.moveTo(0, 560); c.quadraticCurveTo(260, 600, 460, 700); c.quadraticCurveTo(700, 820, 1080, 930);
  c.lineTo(1080, 1100); c.lineTo(0, 1100); c.closePath(); c.fill();
  // dry grass light on the slope
  for (i = 0; i < 240; i++) {
    var gx = rnd() * 1080, gy = 640 + rnd() * 460;
    if (gy < 560 + gx * 0.35) continue;
    c.strokeStyle = rnd() < 0.5 ? "rgba(168,140,84,0.55)" : "rgba(120,104,60,0.6)"; c.lineWidth = 2;
    c.beginPath(); c.moveTo(gx, gy); c.lineTo(gx + (rnd() - 0.5) * 8, gy - 6 - rnd() * 8); c.stroke();
  }
  // houses, back rows first, climbing the hill to the left
  var hs = [];
  for (j = 0; j < 46; j++) {
    var hx = rnd() * 640 - 20, base = 560 + 0.25 * hx + Math.max(0, hx - 400) * 0.25;
    hs.push([hx, base - 30 + rnd() * 110, 40 + rnd() * 38, 28 + rnd() * 34]);
  }
  hs.sort(function (a, b) { return a[1] - b[1]; });
  hs.forEach(function (h) { islDagHouse(c, h[0], h[1], h[2], h[3], rnd, 1); });
  // autumn trees in front of the houses
  for (i = 0; i < 22; i++) {
    var ax = rnd() * 1000 + 20, ay = 660 + ax * 0.3 + rnd() * 200;
    islDagTree(c, ax, ay, 9 + rnd() * 10, rnd);
  }
  // power poles and their wires across the slope
  var poles = [[110, 830], [330, 880], [560, 950], [820, 1010]];
  c.strokeStyle = "#1f1a14"; c.lineWidth = 5;
  poles.forEach(function (p) {
    c.beginPath(); c.moveTo(p[0], p[1]); c.lineTo(p[0], p[1] - 150); c.stroke();
    c.beginPath(); c.moveTo(p[0] - 22, p[1] - 138); c.lineTo(p[0] + 22, p[1] - 138); c.stroke();
  });
  c.lineWidth = 1.5; c.strokeStyle = "rgba(20,18,14,0.8)";
  [-18, 18].forEach(function (o) {
    c.beginPath(); c.moveTo(poles[0][0] + o, poles[0][1] - 138);
    for (var q = 1; q < poles.length; q++) {
      var a = poles[q - 1], b = poles[q];
      c.quadraticCurveTo((a[0] + b[0]) / 2 + o, (a[1] + b[1]) / 2 - 110, b[0] + o, b[1] - 138);
    }
    c.stroke();
  });

  // Foreground: the dirt hillside where it all happens.
  var gr = c.createLinearGradient(0, 960, 0, 1920);
  gr.addColorStop(0, "#8a7246"); gr.addColorStop(0.4, "#6e5833"); gr.addColorStop(1, "#4a3a22");
  c.fillStyle = gr;
  c.beginPath(); c.moveTo(0, 1010); c.quadraticCurveTo(540, 950, 1080, 1000); c.lineTo(1080, 1920); c.lineTo(0, 1920); c.closePath(); c.fill();
  // the dirt road
  c.fillStyle = "rgba(196,168,118,0.55)";
  c.beginPath(); c.moveTo(0, 1180); c.lineTo(1080, 1140); c.lineTo(1080, 1290); c.lineTo(0, 1330); c.closePath(); c.fill();
  c.strokeStyle = "rgba(90,70,40,0.35)"; c.lineWidth = 4;
  [1200, 1260, 1310].forEach(function (y) { c.beginPath(); c.moveTo(0, y + 10); c.lineTo(1080, y - 30); c.stroke(); });
  // dry grass tufts and stones
  for (i = 0; i < 160; i++) {
    var fx = rnd() * 1080, fy = 1000 + rnd() * 820;
    if (fy > 1150 && fy < 1340) continue;
    if (rnd() < 0.2) { c.fillStyle = "rgba(150,140,125,0.8)"; c.beginPath(); c.ellipse(fx, fy, 6 + rnd() * 8, 4 + rnd() * 4, 0, 0, Math.PI * 2); c.fill(); continue; }
    c.strokeStyle = rnd() < 0.5 ? "#b49a5e" : "#8f7a44"; c.lineWidth = 2.5;
    for (var t = -2; t <= 2; t++) { c.beginPath(); c.moveTo(fx, fy); c.lineTo(fx + t * 4, fy - 10 - rnd() * 10); c.stroke(); }
  }
  return cv;
}

// A flat-roofed stone house: a box with a darker roof slab, small dark
// windows, sometimes a wooden balcony.
function islDagHouse(c, x, y, w, h, rnd, sc) {
  var cols = ["#cdbb9c", "#b3a286", "#d9cdb5", "#9c8f7a", "#c2b49a", "#e2d8c4"];
  var col = cols[Math.floor(rnd() * cols.length)];
  c.fillStyle = col; c.strokeStyle = "rgba(40,32,24,0.55)"; c.lineWidth = 1.5 * sc;
  c.fillRect(x, y - h, w, h); c.strokeRect(x, y - h, w, h);
  c.fillStyle = "rgba(0,0,0,0.18)"; c.fillRect(x + w * 0.72, y - h, w * 0.28, h); // the side in shade
  c.fillStyle = "#5e554a"; c.fillRect(x - 2, y - h - 4 * sc, w + 4, 4 * sc);       // roof slab
  c.fillStyle = "#2a2622";
  var n = Math.max(1, Math.floor(w / 14));
  for (var i = 0; i < n; i++) {
    for (var fl = 0; fl < Math.max(1, Math.floor(h / 16)); fl++) {
      if (rnd() < 0.25) continue;
      c.fillRect(x + 4 + i * (w - 8) / n, y - h + 5 + fl * 15, Math.max(3, w / n * 0.45), 6 * sc);
    }
  }
  if (rnd() < 0.3) { c.fillStyle = "#7a5634"; c.fillRect(x + w * 0.1, y - h * 0.45, w * 0.6, 3 * sc); }
}

function islDagTree(c, x, y, r, rnd) {
  c.strokeStyle = "#3a2a1a"; c.lineWidth = 3;
  c.beginPath(); c.moveTo(x, y); c.lineTo(x, y - r * 1.2); c.stroke();
  var cols = ["#e8b83a", "#d99a2b", "#c9b04a", "#f0c95a"];
  for (var i = 0; i < 4; i++) {
    c.fillStyle = cols[(i + Math.floor(rnd() * 4)) % 4];
    c.beginPath(); c.arc(x + (rnd() - 0.5) * r, y - r * 1.4 - (rnd() - 0.3) * r * 0.8, r * (0.5 + rnd() * 0.3), 0, Math.PI * 2); c.fill();
  }
}

// The catapult from Joe's photo, base at (cx, cy): a wooden frame on spoked
// wheels, an A-frame at the back with a padded crossbar, and the long arm
// pivoting low in the middle with the spoon at its end. `arm` is the arm's
// angle (resting up to the right, swung up and over to hit the crossbar).
// Returns where the spoon is.
var ISL_CAT = { pivotX: 10, pivotY: -28, len: 290 };
function drawIslCatapult(c, cx, cy, arm, now, sc) {
  var W1 = "#5c3d22", W2 = "#7a5432", W3 = "#3e2914", ink = "#1f2328";
  sc = sc || 1;
  c.save();
  c.translate(cx, cy); c.scale(sc, sc); c.translate(-cx, -cy);
  c.lineJoin = "round"; c.strokeStyle = ink; c.lineWidth = 4;
  var beam = function (x0, y0, x1, y1, w, col) {
    var dx = x1 - x0, dy = y1 - y0, l = Math.hypot(dx, dy) || 1, nx = -dy / l * w / 2, ny = dx / l * w / 2;
    c.fillStyle = col;
    c.beginPath(); c.moveTo(x0 + nx, y0 + ny); c.lineTo(x1 + nx, y1 + ny); c.lineTo(x1 - nx, y1 - ny); c.lineTo(x0 - nx, y0 - ny); c.closePath(); c.fill(); c.stroke();
    c.strokeStyle = "rgba(255,230,190,0.18)"; c.lineWidth = 2; // a grain line
    c.beginPath(); c.moveTo(x0 + nx * 0.3, y0 + ny * 0.3); c.lineTo(x1 + nx * 0.3, y1 + ny * 0.3); c.stroke();
    c.strokeStyle = ink; c.lineWidth = 4;
  };
  var apex = { x: cx - 70, y: cy - 165 };
  // far-side A-frame leg (darker, behind)
  beam(cx - 120, cy, apex.x + 10, apex.y, 16, W3);
  // the base frame: two long rails and a cross piece
  beam(cx - 170, cy - 6, cx + 175, cy - 6, 26, W1);
  beam(cx - 160, cy + 16, cx + 150, cy + 16, 12, W3);
  // A-frame legs and the crossbar with its padding
  beam(cx - 150, cy - 10, apex.x, apex.y, 18, W2);
  beam(cx + 15, cy - 10, apex.x + 6, apex.y, 18, W2);
  beam(apex.x - 34, apex.y, apex.x + 40, apex.y, 20, W1);
  c.fillStyle = "#6b5a46"; c.beginPath(); c.ellipse(apex.x + 4, apex.y - 12, 22, 10, 0, 0, Math.PI * 2); c.fill(); c.stroke();
  // iron brackets
  c.fillStyle = "#3b3f44";
  [[cx - 150, cy - 6], [cx + 15, cy - 6], [cx + 150, cy - 6]].forEach(function (p) { c.fillRect(p[0] - 7, p[1] - 9, 14, 18); });
  // the arm: pivot low in the middle, a thick tapering beam, the spoon at the end
  var px = cx + ISL_CAT.pivotX, py = cy + ISL_CAT.pivotY, L = ISL_CAT.len;
  var ex = px + Math.cos(arm) * L, ey = py + Math.sin(arm) * L;
  // the rope from the crossbar down to the arm, and from the spoon to the back of the base
  c.strokeStyle = "#cbb894"; c.lineWidth = 3;
  c.beginPath(); c.moveTo(apex.x + 30, apex.y + 4); c.quadraticCurveTo((apex.x + px + Math.cos(arm) * L * 0.55) / 2, (apex.y + py + Math.sin(arm) * L * 0.55) / 2 + 20, px + Math.cos(arm) * L * 0.55, py + Math.sin(arm) * L * 0.55); c.stroke();
  if (arm > -0.9) { c.beginPath(); c.moveTo(ex, ey); c.lineTo(cx + 160, cy - 10); c.stroke(); }
  c.strokeStyle = ink; c.lineWidth = 4;
  beam(px - Math.cos(arm) * 30, py - Math.sin(arm) * 30, ex - Math.cos(arm) * 40, ey - Math.sin(arm) * 40, 22, W2);
  // the spoon: a carved bowl
  c.save(); c.translate(ex, ey); c.rotate(arm);
  c.fillStyle = W1; c.beginPath(); c.ellipse(-8, 0, 52, 30, 0, 0, Math.PI * 2); c.fill(); c.stroke();
  c.fillStyle = W3; c.beginPath(); c.ellipse(-6, -2, 38, 19, 0, 0, Math.PI * 2); c.fill();
  c.strokeStyle = "#3b3f44"; c.lineWidth = 5; c.beginPath(); c.moveTo(-58, -14); c.lineTo(-58, 14); c.stroke(); // iron band
  c.restore();
  c.fillStyle = "#3b3f44"; c.beginPath(); c.arc(px, py, 10, 0, Math.PI * 2); c.fill(); c.stroke(); // the pivot pin
  // the wheels: planked discs with an iron hub, a darker far pair
  [[cx - 115, 0.75, W3], [cx + 115, 0.75, W3], [cx - 125, 1, W1], [cx + 120, 1, W1]].forEach(function (wh, k) {
    var wr = 40 * wh[1], wx = wh[0] + (k < 2 ? 18 : 0), wy = cy + 34 - (k < 2 ? 6 : 0);
    c.fillStyle = wh[2]; c.beginPath(); c.arc(wx, wy, wr, 0, Math.PI * 2); c.fill(); c.stroke();
    if (k < 2) return;
    c.strokeStyle = "rgba(20,12,6,0.6)"; c.lineWidth = 2;
    [-0.5, 0, 0.5].forEach(function (o) { c.beginPath(); c.moveTo(wx + o * wr, wy - Math.sqrt(1 - o * o) * wr); c.lineTo(wx + o * wr, wy + Math.sqrt(1 - o * o) * wr); c.stroke(); });
    c.strokeStyle = "#3b3f44"; c.lineWidth = 4; c.beginPath(); c.arc(wx, wy, wr - 2, 0, Math.PI * 2); c.stroke();
    c.fillStyle = "#3b3f44"; c.beginPath(); c.arc(wx, wy, 9, 0, Math.PI * 2); c.fill();
    c.strokeStyle = ink; c.lineWidth = 4;
  });
  c.restore();
  return { x: cx + (ex - cx) * sc, y: cy + (ey - cy) * sc, nx: Math.cos(arm), ny: Math.sin(arm) };
}

// Hasbulla from Joe's photos: small, light brown hair, a light blue
// collared shirt, beige trousers and his maroon velvet cap with its black
// band. `lean` tips him back as he heaves on the rope.
var ISL_HASBULLA = { skin: "#f1c6a4", build: "slim", hair: "short", hairColor: "#9a7650", beard: "none", ears: "normal", tattoos: {},
  outfit: "polo", shirt: "#b8d2ea", shorts: "#d9ceb6", trim: "#cfc3aa", shortsStyle: "plain", gloves: "#f1c6a4", bodyHair: "none" };
function drawHasbulla(c, x, y, r, lean) {
  c.save();
  c.translate(x, y); c.rotate(-(lean || 0) * 0.25); c.translate(-x, -y);
  drawFighterArt(c, x, y, r, ISL_HASBULLA, theme.wall, { layout: "contained", name: "" });
  // the cap: a maroon velvet dome sat on top, a black band round it
  c.translate(x, y);
  var cg = c.createLinearGradient(-r * 0.6, -r * 1.15, r * 0.6, -r * 0.7);
  cg.addColorStop(0, "#9b2236"); cg.addColorStop(1, "#5e0f1e");
  c.fillStyle = cg; c.strokeStyle = "#1f2328"; c.lineWidth = Math.max(2, r * 0.05);
  c.beginPath(); c.moveTo(-r * 0.64, -r * 0.74);
  c.bezierCurveTo(-r * 0.7, -r * 1.3, r * 0.7, -r * 1.3, r * 0.64, -r * 0.74);
  c.quadraticCurveTo(0, -r * 0.82, -r * 0.64, -r * 0.74); c.closePath(); c.fill(); c.stroke();
  c.fillStyle = "rgba(255,255,255,0.14)"; // velvet sheen
  c.beginPath(); c.ellipse(-r * 0.22, -r * 1.08, r * 0.24, r * 0.07, -0.2, 0, Math.PI * 2); c.fill();
  c.fillStyle = "#151515";
  c.beginPath(); c.moveTo(-r * 0.66, -r * 0.72); c.quadraticCurveTo(0, -r * 0.8, r * 0.66, -r * 0.72);
  c.lineTo(r * 0.64, -r * 0.82); c.quadraticCurveTo(0, -r * 0.9, -r * 0.64, -r * 0.82); c.closePath(); c.fill();
  c.strokeStyle = "rgba(160,40,60,0.9)"; c.lineWidth = Math.max(1, r * 0.025); // the stitched zigzag on the band
  c.beginPath();
  for (var i = 0; i <= 12; i++) { var u = i / 12, bx = -r * 0.6 + u * r * 1.2, by = -r * (0.8 + 0.05 * Math.sin(Math.PI * u)) + (i % 2 ? r * 0.035 : -r * 0.035) + r * 0.03; if (i) c.lineTo(bx, by); else c.moveTo(bx, by); }
  c.stroke();
  c.restore();
}
