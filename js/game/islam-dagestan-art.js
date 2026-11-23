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
  for (j = 0; j < 38; j++) {
    var hx = rnd() * 640 - 20, base = 560 + 0.25 * hx + Math.max(0, hx - 400) * 0.25;
    hs.push([hx, base - 30 + rnd() * 110, 48 + rnd() * 40, 32 + rnd() * 34]);
  }
  hs.sort(function (a, b) { return a[1] - b[1]; });
  hs.forEach(function (h) { islDagHouse(c, h[0], h[1], h[2], h[3], rnd, 1); });
  // morning haze over the village
  var hz = c.createLinearGradient(0, 480, 0, 760); hz.addColorStop(0, "rgba(220,232,242,0.18)"); hz.addColorStop(1, "rgba(220,232,242,0)");
  c.fillStyle = hz; c.fillRect(0, 440, 1080, 340);
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

// A flat-roofed stone house in the village style: rough stone courses, a
// shaded side, a parapet and roof slab, framed windows (a few lit), now and
// then a wooden balcony with a railing, or a second storey stepped back.
function islDagHouse(c, x, y, w, h, rnd, sc, top) {
  var cols = ["#cdbb9c", "#b9a688", "#d9cdb5", "#a59783", "#c4b598", "#e0d5bf", "#bfae92"];
  var col = cols[Math.floor(rnd() * cols.length)], ink = "rgba(40,32,24,0.6)";
  if (!top) { c.fillStyle = "rgba(0,0,0,0.25)"; c.beginPath(); c.ellipse(x + w * 0.5, y + 2, w * 0.6, 5 * sc, 0, 0, Math.PI * 2); c.fill(); }
  var g = c.createLinearGradient(x, y - h, x + w, y);
  g.addColorStop(0, shadeHex(col, 0.08)); g.addColorStop(1, shadeHex(col, -0.08));
  c.fillStyle = g; c.fillRect(x, y - h, w, h);
  c.fillStyle = "rgba(30,24,18,0.28)"; c.fillRect(x + w * 0.74, y - h, w * 0.26, h); // the side in shade
  // stone courses with offset joints
  c.strokeStyle = "rgba(70,58,44,0.28)"; c.lineWidth = 1;
  var row = 0;
  for (var cy = y - h + 6; cy < y; cy += 6 * sc) {
    c.beginPath(); c.moveTo(x, cy); c.lineTo(x + w, cy); c.stroke();
    for (var jx = x + (row++ % 2 ? 4 : 9); jx < x + w; jx += 11) { c.beginPath(); c.moveTo(jx, cy); c.lineTo(jx, Math.min(y, cy + 6 * sc)); c.stroke(); }
  }
  c.strokeStyle = ink; c.lineWidth = 1.5 * sc; c.strokeRect(x, y - h, w, h);
  // parapet and roof slab
  c.fillStyle = "#6a6052"; c.fillRect(x - 3, y - h - 5 * sc, w + 6, 5 * sc);
  c.fillStyle = shadeHex(col, -0.15); c.fillRect(x - 1, y - h - 9 * sc, w + 2, 4 * sc);
  if (rnd() < 0.35) { c.fillStyle = "#7d7266"; c.fillRect(x + w * 0.2, y - h - 18 * sc, 6 * sc, 10 * sc); } // a chimney
  // windows: a dark pane in a pale frame, a few lit warm
  var n = Math.max(1, Math.floor(w / 15)), fls = Math.max(1, Math.floor(h / 17));
  for (var i = 0; i < n; i++) for (var fl = 0; fl < fls; fl++) {
    if (rnd() < 0.2) continue;
    var wx = x + 5 + i * (w - 10) / n, wy = y - h + 6 + fl * 16, ww = Math.max(4, (w - 10) / n * 0.55), wh = 7 * sc;
    c.fillStyle = "#efe8da"; c.fillRect(wx - 1, wy - 1, ww + 2, wh + 2);
    c.fillStyle = rnd() < 0.15 ? "#f2c66b" : "#2c2a29"; c.fillRect(wx, wy, ww, wh);
    c.fillStyle = "#efe8da"; c.fillRect(wx + ww / 2 - 0.5, wy, 1, wh);
  }
  if (rnd() < 0.35) { // wooden balcony
    var by = y - h * 0.45, bx = x + w * 0.08, bw = w * 0.62;
    c.fillStyle = "#6e4b2c"; c.fillRect(bx, by, bw, 3 * sc);
    c.strokeStyle = "#5a3b20"; c.lineWidth = 1;
    for (var rx = bx; rx <= bx + bw; rx += 4) { c.beginPath(); c.moveTo(rx, by); c.lineTo(rx, by - 6 * sc); c.stroke(); }
    c.beginPath(); c.moveTo(bx, by - 6 * sc); c.lineTo(bx + bw, by - 6 * sc); c.stroke();
  }
  if (!top && rnd() < 0.25 && w > 40) islDagHouse(c, x + w * 0.15, y - h - 8 * sc, w * 0.55, h * 0.6, rnd, sc, true); // a storey stepped back on the roof
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
// pivoting low in the middle in a twisted rope bundle, the carved spoon at
// its end. `arm` is the arm's angle (resting up to the right, swung up and
// over to hit the crossbar), `sc` its size and `roll` the wheels' turn as
// it's wheeled out. Returns where the spoon is.
var ISL_CAT = { pivotX: 10, pivotY: -28, len: 290 };
function drawIslCatapult(c, cx, cy, arm, now, sc, roll) {
  var ink = "#1f2328", IRON = "#3b3f44", IRONL = "#6b7178";
  sc = sc || 1; roll = roll || 0;
  c.save();
  c.translate(cx, cy); c.scale(sc, sc); c.translate(-cx, -cy);
  c.lineJoin = "round";
  // a squared timber: shaded across its width, grain lines, dark outline
  var beam = function (x0, y0, x1, y1, w, base) {
    var dx = x1 - x0, dy = y1 - y0, l = Math.hypot(dx, dy) || 1, nx = -dy / l * w / 2, ny = dx / l * w / 2;
    var g = c.createLinearGradient(x0 + nx, y0 + ny, x0 - nx, y0 - ny);
    g.addColorStop(0, shadeHex(base, -0.25)); g.addColorStop(0.35, shadeHex(base, 0.12)); g.addColorStop(1, shadeHex(base, -0.18));
    c.fillStyle = g; c.strokeStyle = ink; c.lineWidth = 3.5;
    c.beginPath(); c.moveTo(x0 + nx, y0 + ny); c.lineTo(x1 + nx, y1 + ny); c.lineTo(x1 - nx, y1 - ny); c.lineTo(x0 - nx, y0 - ny); c.closePath(); c.fill(); c.stroke();
    c.strokeStyle = "rgba(30,18,8,0.35)"; c.lineWidth = 1.2;
    [0.45, -0.2].forEach(function (k) {
      c.beginPath(); c.moveTo(x0 + nx * k + dx * 0.04, y0 + ny * k + dy * 0.04);
      c.bezierCurveTo(x0 + dx * 0.35 + nx * (k + 0.15), y0 + dy * 0.35 + ny * (k + 0.15), x0 + dx * 0.65 + nx * (k - 0.15), y0 + dy * 0.65 + ny * (k - 0.15), x1 + nx * k - dx * 0.04, y1 + ny * k - dy * 0.04);
      c.stroke();
    });
  };
  var strap = function (x, y, ang, len) { // an iron strap with two rivets
    c.save(); c.translate(x, y); c.rotate(ang);
    c.fillStyle = IRON; c.strokeStyle = ink; c.lineWidth = 2; c.fillRect(-5, -len / 2, 10, len); c.strokeRect(-5, -len / 2, 10, len);
    c.fillStyle = IRONL; [-len * 0.3, len * 0.3].forEach(function (ry) { c.beginPath(); c.arc(0, ry, 2.2, 0, Math.PI * 2); c.fill(); });
    c.restore();
  };
  var wheel = function (wx, wy, wr, far) {
    c.save(); c.translate(wx, wy);
    c.fillStyle = far ? "#2e1f10" : "#4d3219"; c.strokeStyle = ink; c.lineWidth = 3.5;
    c.beginPath(); c.arc(0, 0, wr, 0, Math.PI * 2); c.fill(); c.stroke();
    if (!far) {
      c.rotate(roll);
      c.fillStyle = "#6a4626"; // felloe ring
      c.beginPath(); c.arc(0, 0, wr - 3, 0, Math.PI * 2); c.arc(0, 0, wr * 0.72, 0, Math.PI * 2, true); c.fill();
      c.strokeStyle = "#2a1a0c"; c.lineWidth = 1.5;
      var k, a;
      for (k = 0; k < 8; k++) { a = k / 8 * Math.PI * 2; c.beginPath(); c.moveTo(Math.cos(a) * wr * 0.72, Math.sin(a) * wr * 0.72); c.lineTo(Math.cos(a) * (wr - 3), Math.sin(a) * (wr - 3)); c.stroke(); }
      c.strokeStyle = "#5a3b1e"; c.lineWidth = 6; c.lineCap = "round"; // spokes
      for (k = 0; k < 8; k++) { a = (k + 0.5) / 8 * Math.PI * 2; c.beginPath(); c.moveTo(Math.cos(a) * wr * 0.2, Math.sin(a) * wr * 0.2); c.lineTo(Math.cos(a) * wr * 0.74, Math.sin(a) * wr * 0.74); c.stroke(); }
      c.strokeStyle = IRON; c.lineWidth = 4; c.beginPath(); c.arc(0, 0, wr - 1.5, 0, Math.PI * 2); c.stroke(); // iron tyre
      c.fillStyle = IRON; c.strokeStyle = ink; c.lineWidth = 2; c.beginPath(); c.arc(0, 0, wr * 0.22, 0, Math.PI * 2); c.fill(); c.stroke();
      c.fillStyle = IRONL; c.beginPath(); c.arc(0, 0, wr * 0.08, 0, Math.PI * 2); c.fill();
    }
    c.restore();
  };
  // shadow on the ground
  c.fillStyle = "rgba(0,0,0,0.28)"; c.beginPath(); c.ellipse(cx, cy + 74, 200, 16, 0, 0, Math.PI * 2); c.fill();
  var apex = { x: cx - 70, y: cy - 165 };
  // far wheels and the far A-frame leg, behind everything
  wheel(cx - 100, cy + 30, 32, true); wheel(cx + 135, cy + 30, 32, true);
  beam(cx - 120, cy - 4, apex.x + 10, apex.y, 15, "#4a3019");
  // the base: a lower rail and the heavy top rail
  beam(cx - 160, cy + 18, cx + 150, cy + 18, 12, "#4a3019");
  beam(cx - 175, cy - 6, cx + 178, cy - 6, 26, "#6b4626");
  c.fillStyle = "#3d2814"; c.strokeStyle = ink; c.lineWidth = 3;
  [[cx - 175, cy - 6], [cx + 178, cy - 6]].forEach(function (p) { c.fillRect(p[0] - 5, p[1] - 13, 10, 26); c.strokeRect(p[0] - 5, p[1] - 13, 10, 26); }); // end grain
  // A-frame legs with a brace, the crossbar and its leather pad
  beam(cx - 150, cy - 12, apex.x, apex.y + 4, 18, "#7a5230");
  beam(cx + 18, cy - 12, apex.x + 6, apex.y + 4, 18, "#7a5230");
  beam(cx - 118, cy - 70, cx - 8, cy - 70, 10, "#6b4626");
  beam(apex.x - 38, apex.y, apex.x + 44, apex.y, 20, "#6b4626");
  c.fillStyle = "#7a5a3c"; c.strokeStyle = ink; c.lineWidth = 3;
  c.beginPath(); c.ellipse(apex.x + 4, apex.y - 13, 24, 11, 0, 0, Math.PI * 2); c.fill(); c.stroke();
  c.strokeStyle = "rgba(240,220,180,0.6)"; c.lineWidth = 1; c.setLineDash([3, 3]);
  c.beginPath(); c.ellipse(apex.x + 4, apex.y - 13, 18, 7, 0, 0, Math.PI * 2); c.stroke(); c.setLineDash([]);
  strap(cx - 150, cy - 8, 0, 26); strap(cx + 18, cy - 8, 0, 26); strap(apex.x, apex.y, Math.PI / 2, 24); strap(cx + 150, cy - 6, 0, 26);
  // the arm, the spoon at the end
  var px = cx + ISL_CAT.pivotX, py = cy + ISL_CAT.pivotY, L = ISL_CAT.len, ca = Math.cos(arm), sa = Math.sin(arm);
  var ex = px + ca * L, ey = py + sa * L;
  c.strokeStyle = "#cbb894"; c.lineWidth = 3; // the pull-down rope from the spoon to the back trigger
  if (arm > -0.9) { c.beginPath(); c.moveTo(ex - ca * 30, ey - sa * 30); c.quadraticCurveTo((ex + cx + 160) / 2, (ey + cy) / 2 + 20, cx + 160, cy - 12); c.stroke(); }
  beam(px - ca * 34, py - sa * 34, ex - ca * 44, ey - sa * 44, 22, "#82582f");
  strap(px + ca * L * 0.45, py + sa * L * 0.45, arm + Math.PI / 2, 26);
  strap(ex - ca * 54, ey - sa * 54, arm + Math.PI / 2, 26);
  c.save(); c.translate(ex, ey); c.rotate(arm);
  var bg = c.createRadialGradient(-12, -6, 6, -8, 0, 52);
  bg.addColorStop(0, "#8a5f35"); bg.addColorStop(1, "#4e3219");
  c.fillStyle = bg; c.strokeStyle = ink; c.lineWidth = 3.5;
  c.beginPath(); c.ellipse(-8, 0, 54, 32, 0, 0, Math.PI * 2); c.fill(); c.stroke();
  var ig = c.createRadialGradient(-2, 4, 4, -6, -2, 40);
  ig.addColorStop(0, "#5a3a1c"); ig.addColorStop(1, "#24160a");
  c.fillStyle = ig; c.beginPath(); c.ellipse(-6, -2, 40, 21, 0, 0, Math.PI * 2); c.fill();
  c.strokeStyle = "rgba(255,230,190,0.25)"; c.lineWidth = 2; c.beginPath(); c.ellipse(-8, 0, 50, 28, 0, Math.PI * 1.1, Math.PI * 1.7); c.stroke();
  c.strokeStyle = IRON; c.lineWidth = 6; c.beginPath(); c.moveTo(-60, -16); c.lineTo(-60, 16); c.stroke();
  c.restore();
  // the twisted rope bundle at the pivot
  c.save(); c.translate(px, py);
  for (var t = -3; t <= 3; t++) {
    c.fillStyle = t % 2 ? "#b9a47c" : "#d1bd93"; c.strokeStyle = "rgba(60,45,25,0.7)"; c.lineWidth = 1.2;
    c.beginPath(); c.ellipse(t * 4.5, 0, 5, 17, 0.25, 0, Math.PI * 2); c.fill(); c.stroke();
  }
  c.fillStyle = IRON; c.strokeStyle = ink; c.lineWidth = 2.5; c.beginPath(); c.arc(0, 0, 8, 0, Math.PI * 2); c.fill(); c.stroke();
  c.restore();
  // the rope from the crossbar down to the arm
  c.strokeStyle = "#cbb894"; c.lineWidth = 3;
  var rx = px + ca * L * 0.55, ry = py + sa * L * 0.55;
  c.beginPath(); c.moveTo(apex.x + 32, apex.y + 6); c.quadraticCurveTo((apex.x + rx) / 2 + 10, (apex.y + ry) / 2 + 24, rx, ry); c.stroke();
  // the near wheels
  wheel(cx - 122, cy + 34, 40, false); wheel(cx + 122, cy + 34, 40, false);
  c.restore();
  return { x: cx + (ex - cx) * sc, y: cy + (ey - cy) * sc, nx: ca, ny: sa };
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
