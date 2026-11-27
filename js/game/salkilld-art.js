// Salkilld Bakery logo (Joe, 2026-11-27): the Hostess-style parody logo for
// Daniel Cormier's bakery ad (salkilld-ad.js). Joe saw it and said use it:
// a blue cloud badge, glossy blue bubble letters "Salkilld" with a red heart
// for the dot on the i, and BAKERY on a red ribbon. All drawn in code
// (760x340 units), then kept as one picture so the ad just stamps it.
"use strict";

var SKB_FONT = "'Arial Black', 'Arial Rounded MT Bold', 'Helvetica Neue', Arial, sans-serif";
function skbDrawLogoRaw(ctx, cx, cy, w) {
  var s = w / 760;
  ctx.save();
  ctx.translate(cx - 380 * s, cy - 170 * s);
  ctx.scale(s, s);
  ctx.lineJoin = "round"; ctx.lineCap = "round";
  function cloud() {
    ctx.beginPath();
    ctx.moveTo(52, 170);
    ctx.bezierCurveTo(36, 104, 92, 76, 158, 90);
    ctx.bezierCurveTo(182, 40, 272, 30, 306, 70);
    ctx.bezierCurveTo(338, 52, 390, 52, 412, 84);
    ctx.bezierCurveTo(440, 30, 560, 36, 580, 88);
    ctx.bezierCurveTo(650, 80, 726, 118, 712, 182);
    ctx.bezierCurveTo(726, 236, 676, 272, 596, 266);
    ctx.bezierCurveTo(480, 258, 400, 282, 300, 276);
    ctx.bezierCurveTo(200, 270, 130, 284, 90, 262);
    ctx.bezierCurveTo(50, 244, 40, 210, 52, 170);
    ctx.closePath();
  }
  cloud(); ctx.lineWidth = 42; ctx.strokeStyle = "#1a63b4"; ctx.stroke();
  cloud(); ctx.lineWidth = 32; ctx.strokeStyle = "#3fb0ec"; ctx.stroke();
  ctx.save(); ctx.translate(-2, -4); cloud(); ctx.lineWidth = 7; ctx.strokeStyle = "#9adcfa"; ctx.stroke(); ctx.restore();
  cloud(); ctx.fillStyle = "#ffffff"; ctx.fill();
  // "Salkılld" letter by letter (dotless i: its dot is the heart), drawn on
  // a layer so the gloss stays inside the letters.
  var word = "Salk\u0131lld", FS = 128, gap = 6;
  var lay = skbDrawLogoRaw.layer || (skbDrawLogoRaw.layer = document.createElement("canvas"));
  var LW = 1400, LH = 260; if (lay.width !== LW) { lay.width = LW; lay.height = LH; }
  var lc = lay.getContext("2d"); lc.setTransform(1, 0, 0, 1, 0, 0); lc.clearRect(0, 0, LW, LH);
  lc.font = "700 " + FS + "px " + SKB_FONT; lc.textBaseline = "alphabetic"; lc.lineJoin = "round"; lc.lineCap = "round";
  var xs = [], x = 0;
  for (var k = 0; k < word.length; k++) { xs.push(x); x += lc.measureText(word[k]).width + gap; }
  var tw = x - gap, ox = 20, base = 190;
  function pass(lw, col, dy) {
    lc.lineWidth = lw; lc.strokeStyle = col; lc.fillStyle = col;
    for (var k = 0; k < word.length; k++) { if (lw) lc.strokeText(word[k], ox + xs[k], base + (dy || 0)); lc.fillText(word[k], ox + xs[k], base + (dy || 0)); }
  }
  pass(10, "#1c4fb4", 0);
  var fg = lc.createLinearGradient(0, base - FS * 0.75, 0, base + 6);
  fg.addColorStop(0, "#3d7be0"); fg.addColorStop(0.55, "#2457c2"); fg.addColorStop(1, "#173f9c");
  pass(0, fg, 0);
  lc.globalCompositeOperation = "source-atop";
  var gl = lc.createLinearGradient(0, base - FS * 0.8, 0, base - FS * 0.35);
  gl.addColorStop(0, "rgba(255,255,255,0.45)"); gl.addColorStop(1, "rgba(255,255,255,0)");
  lc.fillStyle = gl; lc.fillRect(0, 0, LW, base - FS * 0.35);
  lc.globalCompositeOperation = "source-over";
  // dark rim around the whole word
  var sx = Math.min(1.05, 560 / tw), wx = 380 - tw * sx / 2, wy = 214;
  ctx.save(); ctx.translate(wx, wy); ctx.scale(sx, 1);
  ctx.font = lc.font; ctx.lineWidth = 22; ctx.strokeStyle = "#0e2f7a"; ctx.lineJoin = "round";
  for (var k = 0; k < word.length; k++) ctx.strokeText(word[k], xs[k], 0);
  ctx.drawImage(lay, -ox, -base);
  ctx.restore();
  var hx = wx + (xs[4] + lc.measureText("\u0131").width / 2) * sx, hy = 98;
  // heart for the i's dot
  ctx.save(); ctx.translate(hx, hy); ctx.rotate(-0.12); ctx.scale(0.8, 0.8);
  function heart() {
    ctx.beginPath(); ctx.moveTo(0, 30);
    ctx.bezierCurveTo(-34, 6, -40, -22, -18, -28);
    ctx.bezierCurveTo(-6, -31, 0, -22, 0, -14);
    ctx.bezierCurveTo(0, -22, 6, -31, 18, -28);
    ctx.bezierCurveTo(40, -22, 34, 6, 0, 30); ctx.closePath();
  }
  heart(); ctx.lineWidth = 12; ctx.strokeStyle = "#ffffff"; ctx.stroke();
  heart(); var g = ctx.createLinearGradient(-20, -28, 14, 28); g.addColorStop(0, "#ff3b47"); g.addColorStop(1, "#b5081c"); ctx.fillStyle = g; ctx.fill();
  ctx.beginPath(); ctx.ellipse(-16, -16, 7, 4, -0.7, 0, Math.PI * 2); ctx.fillStyle = "rgba(255,255,255,0.65)"; ctx.fill();
  ctx.restore();
  // BAKERY ribbon across the bottom of the cloud
  ctx.save(); ctx.translate(380, 274);
  function tail(d) {
    ctx.beginPath(); ctx.moveTo(d * 120, -12); ctx.lineTo(d * 176, -8); ctx.lineTo(d * 160, 12); ctx.lineTo(d * 178, 32); ctx.lineTo(d * 120, 30); ctx.closePath();
    ctx.fillStyle = "#8e0b1a"; ctx.fill();
  }
  tail(-1); tail(1);
  ctx.beginPath(); ctx.moveTo(-140, -22); ctx.quadraticCurveTo(0, -36, 140, -22); ctx.lineTo(140, 20); ctx.quadraticCurveTo(0, 6, -140, 20); ctx.closePath();
  var rg = ctx.createLinearGradient(0, -30, 0, 20); rg.addColorStop(0, "#e8283a"); rg.addColorStop(1, "#b10f22"); ctx.fillStyle = rg; ctx.fill();
  ctx.lineWidth = 3; ctx.strokeStyle = "#ffffff"; ctx.stroke();
  ctx.font = "900 30px " + SKB_FONT; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillStyle = "#ffffff";
  var L = "BAKERY", sp = 34;
  for (var k = 0; k < L.length; k++) { var x = (k - 2.5) * sp; ctx.fillText(L[k], x, -7 + Math.pow(x / 140, 2) * 6 - 2); }
  ctx.restore();
  ctx.restore();
}

// The logo, centred on (cx, cy), w wide (it's 760:340). Drawn once into its
// own canvas, then stamped.
var skbLogoCache = null;
function drawSalkilldLogo(c, cx, cy, w) {
  if (!skbLogoCache) {
    skbLogoCache = document.createElement("canvas"); skbLogoCache.width = 1140; skbLogoCache.height = 510;
    skbDrawLogoRaw(skbLogoCache.getContext("2d"), 570, 255, 1140);
  }
  c.drawImage(skbLogoCache, cx - w / 2, cy - w * 340 / 760 / 2, w, w * 340 / 760);
}
