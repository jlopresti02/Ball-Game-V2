// Incredible Bulk logo (Joe, 2026-11-27): the protein powder brand in
// Francis Ngannou's jumbotron ad (incredible-bulk-ad.js), a parody of the old
// green-giant comic logos. A torn purple burst, INCREDIBLE in gold across the
// top, BULK in huge cracked green block letters with a purple extrusion, and
// a black slab with WHEY PROTEIN and two lightning bolts. All drawn in code
// (760x340 units), then kept as one picture so the ad just stamps it.
"use strict";

var IBK_FONT = "Impact, 'Arial Black', 'Helvetica Neue', Arial, sans-serif";
var IBK_GREEN = "#43b02a", IBK_DEEP = "#1d5e12", IBK_PURPLE = "#5b2a86", IBK_GOLD = "#ffd23a";

// A deterministic 0..1 noise so the jagged edges never move.
function ibkR(n) { var x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }

function ibkDrawLogoRaw(ctx, cx, cy, w) {
  var s = w / 760;
  ctx.save();
  ctx.translate(cx - 380 * s, cy - 170 * s);
  ctx.scale(s, s);
  ctx.lineJoin = "round"; ctx.lineCap = "round";

  // the torn purple burst behind everything
  function burst(grow) {
    ctx.beginPath();
    var n = 34;
    for (var i = 0; i <= n; i++) {
      var a = i / n * Math.PI * 2, spike = i % 2 ? 1 : 0.86 - ibkR(i) * 0.08;
      var rx = (350 + grow) * spike, ry = (150 + grow) * spike;
      var x = 380 + Math.cos(a) * rx, y = 172 + Math.sin(a) * ry;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.closePath();
  }
  burst(10); ctx.fillStyle = "#14081f"; ctx.fill();
  burst(0);
  var pg = ctx.createRadialGradient(380, 150, 20, 380, 172, 360);
  pg.addColorStop(0, "#9a5bd0"); pg.addColorStop(0.6, IBK_PURPLE); pg.addColorStop(1, "#2e1250");
  ctx.fillStyle = pg; ctx.fill();
  // halftone dots, comic style
  ctx.save(); burst(0); ctx.clip();
  ctx.fillStyle = "rgba(255,255,255,0.08)";
  for (var dy = 0; dy < 340; dy += 14) for (var dx = (dy / 14) % 2 * 7; dx < 760; dx += 14) {
    var d = Math.hypot(dx - 380, (dy - 172) * 2.2) / 360, rr = Math.max(0, 3.4 * (1 - d));
    if (rr > 0.3) { ctx.beginPath(); ctx.arc(dx, dy, rr, 0, Math.PI * 2); ctx.fill(); }
  }
  ctx.restore();

  // INCREDIBLE, gold, on a gentle arch
  var top = "INCREDIBLE";
  ctx.font = "900 50px " + IBK_FONT; ctx.textAlign = "center"; ctx.textBaseline = "middle";
  var tws = [], ttot = 0;
  for (var k0 = 0; k0 < top.length; k0++) { tws.push(ctx.measureText(top[k0]).width); ttot += tws[k0] + (k0 ? 7 : 0); }
  var run = 380 - ttot / 2;
  for (var k = 0; k < top.length; k++) {
    var x = run + tws[k] / 2; run += tws[k] + 7;
    var y = 54 + Math.pow((x - 380) / 200, 2) * 14, rot = (x - 380) / 1400;
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
    ctx.lineWidth = 12; ctx.strokeStyle = "#14081f"; ctx.strokeText(top[k], 0, 0);
    var tg = ctx.createLinearGradient(0, -22, 0, 22); tg.addColorStop(0, "#fff3a8"); tg.addColorStop(0.5, IBK_GOLD); tg.addColorStop(1, "#e08a12");
    ctx.fillStyle = tg; ctx.fillText(top[k], 0, 0);
    ctx.restore();
  }

  // BULK: huge block letters with a purple 3D extrusion, cracked
  var word = "BULK", FS = 178;
  var lay = ibkDrawLogoRaw.layer || (ibkDrawLogoRaw.layer = document.createElement("canvas"));
  var LW = 900, LH = 300; if (lay.width !== LW) { lay.width = LW; lay.height = LH; }
  var lc = lay.getContext("2d"); lc.setTransform(1, 0, 0, 1, 0, 0); lc.clearRect(0, 0, LW, LH);
  lc.font = "900 " + FS + "px " + IBK_FONT; lc.textBaseline = "alphabetic"; lc.textAlign = "left"; lc.lineJoin = "miter";
  var xs = [], xx = 0, gap = 10;
  for (var j = 0; j < word.length; j++) { xs.push(xx); xx += lc.measureText(word[j]).width + gap; }
  var tw = xx - gap, ox = (LW - tw) / 2, base = 250;
  function letters(c, dx, dy) { for (var j = 0; j < word.length; j++) c.fillText(word[j], ox + xs[j] + dx, base + dy); }
  // extrusion: many purple copies stepping down-right
  for (var e = 14; e >= 1; e--) { lc.fillStyle = e > 12 ? "#14081f" : (e % 2 ? "#3b1660" : "#4a1f78"); letters(lc, e * 0.8, e); }
  lc.lineWidth = 14; lc.strokeStyle = "#0a1a06";
  for (var j2 = 0; j2 < word.length; j2++) lc.strokeText(word[j2], ox + xs[j2], base);
  var fg = lc.createLinearGradient(0, base - FS * 0.75, 0, base);
  fg.addColorStop(0, "#b6f25a"); fg.addColorStop(0.35, "#6fd13a"); fg.addColorStop(0.7, IBK_GREEN); fg.addColorStop(1, IBK_DEEP);
  lc.fillStyle = fg; letters(lc, 0, 0);
  // inside the letters only: one crack running down each letter
  lc.save(); lc.globalCompositeOperation = "source-atop";
  var cracks = [[0.3, 0.12], [0.18, 0.55], [0.22, 0.2], [0.62, 0.35]];
  for (var c = 0; c < word.length; c++) {
    var lw0 = lc.measureText(word[c]).width, cx0 = ox + xs[c] + lw0 * cracks[c][0], cy0 = base - FS * 0.72 + FS * cracks[c][1] * 0.3;
    var pts = [[cx0, cy0]], px = cx0, py = cy0;
    for (var sg = 0; sg < 4; sg++) { px += (sg % 2 ? -1 : 1) * (6 + ibkR(c * 7 + sg) * 10); py += 12 + ibkR(c * 5 + sg) * 10; pts.push([px, py]); }
    [[7, "#0a1a06"], [2, "rgba(220,255,170,0.7)"]].forEach(function (pass, pi) {
      lc.lineWidth = pass[0]; lc.strokeStyle = pass[1]; lc.lineJoin = "miter";
      lc.beginPath(); pts.forEach(function (q, qi) { if (qi) lc.lineTo(q[0] + pi * 3, q[1] + pi * 2); else lc.moveTo(q[0] + pi * 3, q[1] + pi * 2); }); lc.stroke();
    });
    // a small branch off the second joint
    lc.lineWidth = 4; lc.strokeStyle = "#0a1a06";
    lc.beginPath(); lc.moveTo(pts[2][0], pts[2][1]); lc.lineTo(pts[2][0] + 14, pts[2][1] + 4); lc.stroke();
  }
  // chips knocked out of the top edges
  lc.globalCompositeOperation = "destination-out";
  for (var ch = 0; ch < 7; ch++) {
    var kx = ox + tw * (0.08 + ch * 0.135), ky = base - FS * 0.72 + ibkR(ch + 40) * 6;
    lc.beginPath(); lc.moveTo(kx, ky - 6); lc.lineTo(kx + 9 + ibkR(ch) * 8, ky + 6 + ibkR(ch + 1) * 6); lc.lineTo(kx + 20, ky - 6); lc.closePath(); lc.fill();
  }
  lc.restore();
  var sx = Math.min(1, 600 / tw);
  ctx.save(); ctx.translate(380, 238); ctx.scale(sx, 1.04);
  ctx.drawImage(lay, -LW / 2, -base);
  ctx.restore();
  // flying chunks off the letters
  [[118, 112, 12, 0.4], [640, 104, 10, -0.6], [662, 150, 7, 0.9], [96, 176, 8, -0.2], [600, 84, 6, 1.2]].forEach(function (p) {
    ctx.save(); ctx.translate(p[0], p[1]); ctx.rotate(p[3]);
    ctx.beginPath(); ctx.moveTo(-p[2], -p[2] * 0.4); ctx.lineTo(p[2] * 0.3, -p[2]); ctx.lineTo(p[2], p[2] * 0.5); ctx.lineTo(-p[2] * 0.5, p[2] * 0.8); ctx.closePath();
    ctx.fillStyle = IBK_GREEN; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = "#0a1a06"; ctx.stroke();
    ctx.restore();
  });

  // the WHEY PROTEIN slab with two lightning bolts
  ctx.save(); ctx.translate(380, 288);
  ctx.beginPath(); ctx.moveTo(-170, -22); ctx.lineTo(170, -22); ctx.lineTo(184, 0); ctx.lineTo(170, 22); ctx.lineTo(-170, 22); ctx.lineTo(-184, 0); ctx.closePath();
  ctx.fillStyle = "#0e0a12"; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = IBK_GOLD; ctx.stroke();
  function bolt(x, f) {
    ctx.save(); ctx.translate(x, 0); ctx.scale(f, 1);
    ctx.beginPath(); ctx.moveTo(-4, -16); ctx.lineTo(8, -16); ctx.lineTo(2, -3); ctx.lineTo(10, -3); ctx.lineTo(-6, 17); ctx.lineTo(-1, 2); ctx.lineTo(-9, 2); ctx.closePath();
    ctx.fillStyle = IBK_GOLD; ctx.fill();
    ctx.restore();
  }
  bolt(-148, 1); bolt(148, -1);
  ctx.font = "900 30px " + IBK_FONT; ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillStyle = "#ffffff"; ctx.fillText("WHEY  PROTEIN", 0, 1);
  ctx.restore();
  ctx.restore();
}

// The logo, centred on (cx, cy), w wide (it's 760:340). Drawn once into its
// own canvas, then stamped.
var ibkLogoCache = null;
function drawBulkLogo(c, cx, cy, w) {
  if (!ibkLogoCache) {
    ibkLogoCache = document.createElement("canvas"); ibkLogoCache.width = 1140; ibkLogoCache.height = 510;
    ibkDrawLogoRaw(ibkLogoCache.getContext("2d"), 570, 255, 1140);
  }
  c.drawImage(ibkLogoCache, cx - w / 2, cy - w * 340 / 760 / 2, w, w * 340 / 760);
}
