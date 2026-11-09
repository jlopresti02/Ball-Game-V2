// Who's Joe & Arman T? cologne ad (Joe, 2026-11-09). The first Rose Tornado
// of each fight (ilia-tornado.js) brings a perfume ad up on the jumbotron (a
// banner in the test arena), to Joe's music:
//   - a moody black-and-oxblood set, smoke drifting, gold dust and petals;
//   - the bull standing in the haze behind;
//   - Ilia with his rapier raised and a red rose, a beautiful woman in a red
//     dress leaning on his shoulder;
//   - Joe's bottle ("Rose", eau de cologne) catching the light, then the
//     brand and "Untouchable."
// The tornado's igbb carries adOwn, so it plays while he spins. It goes
// through queueJumboAd like every fighter ad, so it never overlaps another.
"use strict";

var COLOGNE_SHOW = 8.0;
var cologneShow = 0, cologneId = 0, cologneSrc = null;
var cologneMonoImg = new Image(), cologneWordImg = new Image();
cologneMonoImg.src = COLOGNE_MONO_SRC; cologneWordImg.src = COLOGNE_WORD_SRC;
var cologneBullCv = null;

// From the tornado starting (ilia-tornado.js): once a fight.
function startCologneAd(b) {
  if (b.cologneAdDone || (typeof galleryDemo !== "undefined" && galleryDemo)) return;
  b.cologneAdDone = true;
  queueJumboAd(COLOGNE_SHOW, function () {
    cologneShow = COLOGNE_SHOW; cologneId = b.id;
    playCologneAd();
  }, b);
}
function resetCologneAd() { cologneShow = 0; stopCologneAd(); }
// Every frame, from tickAdBreaks (ad-breaks.js).
function tickCologneAd(dt) {
  if (cologneShow > 0) cologneShow = Math.max(0, cologneShow - dt);
}

function playCologneAd() {
  try {
    var ac = getAudioCtx();
    if (!ac) return;
    if (ac.state === "suspended") ac.resume();
    stopCologneAd();
    if (typeof duckMusic === "function") duckMusic(ac.currentTime, ac.currentTime + COLOGNE_SHOW);
    withClip("cologneAd", function () { if (cologneShow > 0) cologneSrc = playClip("cologneAd", 0.85); });
  } catch (e) { /* never let audio break the game */ }
}
function stopCologneAd() {
  if (!cologneSrc) return;
  try { cologneSrc.stop(); } catch (e) { /* already stopped */ }
  cologneSrc = null;
}

function cologneFade(t, at, len) { return Math.max(0, Math.min(1, (t - at) / len)); }

function drawCologneJumbo(x, y, w, h) {
  if (cologneShow <= 0 || !balls || !balls[cologneId]) return;
  var b = balls[cologneId], look = b.char.look;
  var t = COLOGNE_SHOW - cologneShow, a = Math.min(1, t / 0.6, cologneShow / 0.6), k = h / 250;
  ctx.save();
  ctx.globalAlpha = a;
  ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();

  // The set: near black, warming to oxblood behind the couple.
  ctx.fillStyle = "#070405"; ctx.fillRect(x, y, w, h);
  var glow = ctx.createRadialGradient(x + w * 0.42, y + h * 0.55, h * 0.1, x + w * 0.42, y + h * 0.55, w * 0.45);
  glow.addColorStop(0, "rgba(120,14,24,0.85)"); glow.addColorStop(0.55, "rgba(60,6,12,0.55)"); glow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = glow; ctx.fillRect(x, y, w, h);
  // A shaft of light from above.
  var shaft = ctx.createLinearGradient(0, y, 0, y + h);
  shaft.addColorStop(0, "rgba(255,225,180,0.16)"); shaft.addColorStop(1, "rgba(255,225,180,0)");
  ctx.fillStyle = shaft;
  ctx.beginPath(); ctx.moveTo(x + w * 0.36, y); ctx.lineTo(x + w * 0.5, y); ctx.lineTo(x + w * 0.58, y + h); ctx.lineTo(x + w * 0.26, y + h); ctx.closePath(); ctx.fill();

  // Everything pushes in, slowly.
  var push = 1 + 0.06 * ease(t / COLOGNE_SHOW);
  ctx.save();
  ctx.translate(x + w * 0.42, y + h * 0.6); ctx.scale(push, push); ctx.translate(-(x + w * 0.42), -(y + h * 0.6));

  // The bull in the haze, behind them on the left.
  var bullA = cologneFade(t, 0.2, 1.2);
  if (bullA > 0) {
    ctx.save(); ctx.globalAlpha *= bullA * 0.9;
    var breathe = 1 + Math.sin(t * 2.2) * 0.01;
    cologneBull(x + w * 0.16, y + h * 0.7, h * 0.32 * breathe, k);
    ctx.restore();
  }
  cologneSmoke(x, y, w, h, t, 0);

  // The couple.
  var cA = cologneFade(t, 0.7, 1.0);
  if (cA > 0) {
    ctx.save(); ctx.globalAlpha *= cA;
    var ix = x + w * 0.49, iy = y + h * 0.54 + (1 - easeOut(cA)) * h * 0.05, r = h * 0.25;
    cologneIlia(ix, iy, r, look, t, k);
    cologneWoman(ix - r * 1.42, iy + r * 0.1, r * 0.88, t, k);
    // His other hand: holding the rose out to her.
    var hx = ix - r * 0.72, hy = iy + r * 0.12;
    cologneArm(ix - r * 0.6, iy - r * 0.25, ix - r * 0.85, iy + r * 0.25, hx, hy, r, look);
    drawRose(hx - r * 0.18, hy - r * 0.2, -0.9 + Math.sin(t * 1.3) * 0.05, r / 22);
    drawGlove(ctx, hx, hy, r * 0.24, look, "#0b0f12", Math.PI * 0.85);
    ctx.restore();
  }
  cologneSmoke(x, y, w, h, t, 1);
  ctx.restore();

  // Petals and gold dust drifting across.
  for (var p = 0; p < 14; p++) {
    var px = x + ((p * 0.173 + t * (0.025 + (p % 4) * 0.008)) % 1) * w;
    var py = y + ((p * 0.37) % 1) * h + Math.sin(t * 1.4 + p) * h * 0.05;
    ctx.save(); ctx.translate(px, py); ctx.rotate(t * (0.8 + p % 3) + p);
    ctx.fillStyle = p % 2 ? "rgba(196,20,36,0.8)" : "rgba(150,10,24,0.7)";
    ctx.beginPath(); ctx.ellipse(0, 0, 4.5 * k, 2.4 * k, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
  for (var d = 0; d < 30; d++) {
    var dx = x + ((d * 0.618 + t * 0.01 * (1 + d % 3)) % 1) * w, dy = y + h - ((d * 0.29 + t * 0.04 * (1 + d % 2)) % 1) * h;
    ctx.fillStyle = "rgba(243,220,166," + (0.25 + 0.35 * Math.abs(Math.sin(t * 2 + d))) + ")";
    ctx.beginPath(); ctx.arc(dx, dy, (1 + d % 2) * k, 0, Math.PI * 2); ctx.fill();
  }

  // The bottle, on the right, with a glint sweeping across it.
  var bA = cologneFade(t, 2.3, 0.9);
  if (bA > 0) {
    ctx.save(); ctx.globalAlpha *= bA;
    cologneBottle(x + w * 0.72, y + h * 0.56 + (1 - easeOut(bA)) * h * 0.08, h * 0.62, t, k);
    ctx.restore();
  }
  // The brand.
  var lA = cologneFade(t, 3.6, 0.9), fx = x + w * 0.885;
  if (lA > 0 && cologneMonoImg.complete && cologneMonoImg.naturalWidth) {
    ctx.save(); ctx.globalAlpha *= lA;
    var ms = h * 0.34;
    ctx.drawImage(cologneMonoImg, fx - ms / 2, y + h * 0.1, ms, ms * cologneMonoImg.naturalHeight / cologneMonoImg.naturalWidth);
    ctx.restore();
  }
  var tA = cologneFade(t, 4.4, 0.8);
  if (tA > 0) {
    ctx.save(); ctx.globalAlpha *= tA;
    stillText("Rose", fx, y + h * 0.6, 34 * k, "#f3dca6", w * 0.2, { face: "'Snell Roundhand', 'Brush Script MT', Georgia, serif", weight: "italic 600" });
    stillText("EAU DE COLOGNE · SPAIN", fx, y + h * 0.7, 12 * k, "rgba(243,220,166,0.75)", w * 0.2, { face: "Georgia, 'Times New Roman', serif", weight: "400" });
    ctx.restore();
  }
  var gA = cologneFade(t, 5.4, 0.9);
  if (gA > 0) {
    ctx.save(); ctx.globalAlpha *= gA;
    stillText("Untouchable.", fx, y + h * 0.84, 22 * k, "#ffffff", w * 0.2, { face: "Georgia, 'Times New Roman', serif", weight: "italic 400" });
    ctx.restore();
  }
  // The wordmark along the bottom left, under the couple.
  var wA = cologneFade(t, 4.0, 1.0);
  if (wA > 0 && cologneWordImg.complete && cologneWordImg.naturalWidth) {
    ctx.save(); ctx.globalAlpha *= wA;
    var ww = w * 0.3, wh = ww * cologneWordImg.naturalHeight / cologneWordImg.naturalWidth;
    ctx.fillStyle = "rgba(0,0,0,0.45)"; ctx.fillRect(x + w * 0.03 - 8 * k, y + h * 0.9 - wh / 2 - 6 * k, ww + 16 * k, wh + 12 * k);
    ctx.drawImage(cologneWordImg, x + w * 0.03, y + h * 0.9 - wh / 2, ww, wh);
    ctx.restore();
  }
  // Letterbox bars, like a film.
  ctx.fillStyle = "#000"; ctx.fillRect(x, y, w, h * 0.035); ctx.fillRect(x, y + h * 0.965, w, h * 0.035);
  ctx.strokeStyle = "rgba(243,220,166,0.5)"; ctx.lineWidth = 2 * k; ctx.strokeRect(x + 5 * k, y + 5 * k, w - 10 * k, h - 10 * k);
  ctx.restore();
}

function drawCologneBanner() {
  if (cologneShow <= 0 || stadiumOn()) return;
  drawCologneJumbo(10, 10, W - 20, 110);
}

// Soft smoke banks drifting (layer 0 behind the couple, 1 in front, thinner).
function cologneSmoke(x, y, w, h, t, layer) {
  for (var i = 0; i < 5; i++) {
    var sx = x + (((i * 0.23 + layer * 0.11) + t * (0.015 + i * 0.004) * (layer ? -1 : 1)) % 1 + 1) % 1 * w;
    var sy = y + h * (0.55 + 0.35 * ((i * 0.41) % 1)), sr = h * (0.35 + 0.15 * (i % 3));
    var g = ctx.createRadialGradient(sx, sy, 0, sx, sy, sr);
    var al = layer ? 0.07 : 0.13;
    g.addColorStop(0, "rgba(220,200,200," + al + ")"); g.addColorStop(1, "rgba(220,200,200,0)");
    ctx.fillStyle = g; ctx.fillRect(sx - sr, sy - sr, sr * 2, sr * 2);
  }
}

// Joe's bull picture, turned into a dark red-lit silhouette in the haze.
function cologneBull(cx, cy, r, k) {
  var im = typeof bullImage === "function" ? bullImage() : null;
  if (!im) return;
  if (!cologneBullCv) {
    var cw = 440, ch = Math.round(cw * AF_BULL_ASPECT);
    cologneBullCv = document.createElement("canvas"); cologneBullCv.width = cw; cologneBullCv.height = ch;
    var c = cologneBullCv.getContext("2d");
    c.drawImage(im, 0, 0, cw, ch);
    c.globalCompositeOperation = "source-atop";
    var g = c.createLinearGradient(0, 0, cw, 0);
    g.addColorStop(0, "rgba(20,4,6,0.78)"); g.addColorStop(1, "rgba(90,10,18,0.62)");
    c.fillStyle = g; c.fillRect(0, 0, cw, ch);
  }
  var w = r * 2.4, h = w * AF_BULL_ASPECT;
  ctx.save(); ctx.translate(cx, cy); ctx.scale(-1, 1); // facing in toward them
  ctx.drawImage(cologneBullCv, -w / 2, r * 0.95 - h, w, h);
  ctx.restore();
}

// Ilia, side lit, his rapier raised up past his shoulder.
function cologneIlia(cx, cy, r, look, t, k) {
  var sway = Math.sin(t * 0.9) * 0.03;
  // The rapier, held up, behind his head.
  var hx = cx + r * 0.85, hy = cy - r * 0.35;
  drawRapier(hx, hy, -Math.PI / 2 - 0.35 + sway, r * 2.6, 1, 1);
  drawFighterArt(ctx, cx, cy, r, look, "#0b0f12", { layout: "contained", name: "Ilia Topuria" });
  ctx.lineWidth = 2.5 * k; ctx.strokeStyle = "#0b0f12"; ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
  // A warm rim of light down his right side.
  ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.clip();
  var rim = ctx.createLinearGradient(cx - r, 0, cx + r, 0);
  rim.addColorStop(0, "rgba(0,0,0,0.35)"); rim.addColorStop(0.7, "rgba(0,0,0,0)"); rim.addColorStop(1, "rgba(255,190,120,0.25)");
  ctx.fillStyle = rim; ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
  ctx.restore();
  cologneArm(cx + r * 0.62, cy - r * 0.25, cx + r * 1.0, cy - r * 0.05, hx, hy, r, look);
  drawGlove(ctx, hx, hy, r * 0.24, look, "#0b0f12", -Math.PI / 2);
}
function cologneArm(sx, sy, ex, ey, hx, hy, r, look) {
  ctx.lineCap = "round";
  ctx.strokeStyle = "#0b0f12"; ctx.lineWidth = r * 0.2;
  ctx.beginPath(); ctx.moveTo(sx, sy); ctx.quadraticCurveTo(ex, ey, hx, hy); ctx.stroke();
  ctx.strokeStyle = look.skin; ctx.lineWidth = r * 0.13;
  ctx.beginPath(); ctx.moveTo(sx, sy); ctx.quadraticCurveTo(ex, ey, hx, hy); ctx.stroke();
}

// The woman: faceless like everyone, long dark waves down past her
// shoulders, a red rose in her hair, gold hoops, a red off-the-shoulder dress
// and a gold chain. Her head tilts onto his shoulder.
var COLOGNE_LOOK = null;
function cologneWoman(cx, cy, r, t, k) {
  if (!COLOGNE_LOOK) {
    COLOGNE_LOOK = defaultLook();
    COLOGNE_LOOK.skin = "#d8a07a"; COLOGNE_LOOK.hair = "long"; COLOGNE_LOOK.hairColor = "#1a1010"; COLOGNE_LOOK.beard = "none";
  }
  var look = COLOGNE_LOOK, tilt = 0.12 + Math.sin(t * 0.9) * 0.02, hc = look.hairColor;
  ctx.save();
  ctx.translate(cx, cy); ctx.rotate(tilt);
  // Hair behind: long waves falling past the ball on both sides.
  ctx.fillStyle = hc;
  [-1, 1].forEach(function (s) {
    ctx.beginPath();
    ctx.moveTo(s * r * 0.2, -r * 1.02);
    ctx.bezierCurveTo(s * r * 1.35, -r * 0.95, s * r * 1.05, -r * 0.1, s * r * 1.3, r * 0.45);
    ctx.bezierCurveTo(s * r * 1.45, r * 0.85, s * r * 1.05, r * 1.05, s * r * 0.95, r * 0.75);
    ctx.bezierCurveTo(s * r * 0.8, r * 0.4, s * r * 0.75, -r * 0.2, s * r * 0.2, -r * 0.7);
    ctx.closePath(); ctx.fill();
  });
  ctx.strokeStyle = "rgba(255,220,200,0.15)"; ctx.lineWidth = 1.5 * k;
  [-1, 1].forEach(function (s) {
    for (var i = 0; i < 3; i++) {
      ctx.beginPath(); ctx.moveTo(s * r * (0.85 + i * 0.12), -r * 0.6);
      ctx.bezierCurveTo(s * r * (1.15 + i * 0.05), -r * 0.2, s * r * (0.9 + i * 0.1), r * 0.2, s * r * (1.15 + i * 0.07), r * 0.6); ctx.stroke();
    }
  });
  // The ball: skin, the dress, the head layer.
  var line = shadeHex(look.skin, -0.38), lw = function (q) { return Math.max(1, r * q); };
  ctx.save();
  ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.clip();
  var g = ctx.createRadialGradient(-r * 0.35, -r * 0.45, r * 0.1, 0, 0, r * 1.05);
  g.addColorStop(0, shadeHex(look.skin, 0.14)); g.addColorStop(0.7, look.skin); g.addColorStop(1, shadeHex(look.skin, -0.22));
  ctx.fillStyle = g; ctx.fillRect(-r, -r, r * 2, r * 2);
  // Off-the-shoulder red dress: a gently curved neckline low across the ball.
  var dg = ctx.createLinearGradient(0, r * 0.05, 0, r);
  dg.addColorStop(0, "#c8102e"); dg.addColorStop(1, "#6e0716");
  ctx.fillStyle = dg;
  ctx.beginPath(); ctx.moveTo(-r, r * 0.05); ctx.quadraticCurveTo(0, r * 0.32, r, r * 0.05); ctx.lineTo(r, r); ctx.lineTo(-r, r); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = "#5a0512"; ctx.lineWidth = lw(0.05);
  ctx.beginPath(); ctx.moveTo(-r, r * 0.05); ctx.quadraticCurveTo(0, r * 0.32, r, r * 0.05); ctx.stroke();
  // Ruffle along the neckline.
  ctx.fillStyle = "#e0203f";
  for (var f = 0; f < 7; f++) { var fx = -r * 0.85 + f * r * 0.28; ctx.beginPath(); ctx.arc(fx, r * 0.07 + Math.sin(f / 6 * Math.PI) * r * 0.2, r * 0.07, 0, Math.PI); ctx.fill(); }
  // Gold chain.
  ctx.strokeStyle = "#e2b23e"; ctx.lineWidth = lw(0.025);
  ctx.beginPath(); ctx.moveTo(-r * 0.35, -r * 0.3); ctx.quadraticCurveTo(0, -r * 0.02, r * 0.35, -r * 0.3); ctx.stroke();
  ctx.fillStyle = "#e2b23e"; ctx.beginPath(); ctx.arc(0, -r * 0.1, r * 0.04, 0, Math.PI * 2); ctx.fill();
  drawArtHeadLayer(ctx, r, look, line, lw);
  var rg = ctx.createRadialGradient(-r * 0.2, -r * 0.25, r * 0.6, 0, 0, r);
  rg.addColorStop(0, "rgba(0,0,0,0)"); rg.addColorStop(1, "rgba(0,0,0,0.3)");
  ctx.fillStyle = rg; ctx.fillRect(-r, -r, r * 2, r * 2);
  ctx.restore();
  ctx.strokeStyle = "#0b0f12"; ctx.lineWidth = Math.max(2, r * 0.077);
  ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.stroke();
  // Gold hoops at the sides of her head, a rose tucked behind her ear.
  ctx.strokeStyle = "#f0c454"; ctx.lineWidth = lw(0.04);
  [-1, 1].forEach(function (s) { ctx.beginPath(); ctx.arc(s * r * 0.98, -r * 0.25, r * 0.11, 0, Math.PI * 2); ctx.stroke(); });
  drawRose(-r * 0.62, -r * 0.82, 0.6, r / 18);
  ctx.restore();
}

// The bottle: Joe's picture, with a glint sweeping across the glass and a
// sparkle off the stopper.
var cologneBottleImg = new Image(); cologneBottleImg.src = COLOGNE_BOTTLE_SRC;
var cologneGlintCv = null;
function cologneBottle(cx, cy, h, t, k) {
  var im = cologneBottleImg;
  if (!im.complete || !im.naturalWidth) return;
  var bh = h * 1.25, bw = bh * COLOGNE_BOTTLE_ASPECT, top = cy - bh * 0.55, bot = top + bh;
  ctx.fillStyle = "rgba(0,0,0,0.55)"; ctx.beginPath(); ctx.ellipse(cx, bot - 2 * k, bw * 0.55, h * 0.04, 0, 0, Math.PI * 2); ctx.fill();
  // A soft rose glow behind it.
  var gg = ctx.createRadialGradient(cx, cy, 0, cx, cy, bh * 0.6);
  gg.addColorStop(0, "rgba(255,120,150,0.25)"); gg.addColorStop(1, "rgba(255,120,150,0)");
  ctx.fillStyle = gg; ctx.fillRect(cx - bh * 0.6, cy - bh * 0.6, bh * 1.2, bh * 1.2);
  ctx.drawImage(im, cx - bw / 2, top, bw, bh);
  // The glint, only on the bottle (drawn through its shape off screen).
  var gp = (t - 3.2) / 0.9;
  if (gp > 0 && gp < 1) {
    var cw = im.naturalWidth, ch = im.naturalHeight;
    if (!cologneGlintCv) { cologneGlintCv = document.createElement("canvas"); cologneGlintCv.width = cw; cologneGlintCv.height = ch; }
    var c = cologneGlintCv.getContext("2d");
    c.globalCompositeOperation = "source-over"; c.clearRect(0, 0, cw, ch);
    c.drawImage(im, 0, 0);
    c.globalCompositeOperation = "source-in";
    var gx = -cw * 0.6 + gp * cw * 2.2;
    var sg = c.createLinearGradient(gx - cw * 0.25, 0, gx + cw * 0.25, ch * 0.3);
    sg.addColorStop(0, "rgba(255,255,255,0)"); sg.addColorStop(0.5, "rgba(255,255,255,0.55)"); sg.addColorStop(1, "rgba(255,255,255,0)");
    c.fillStyle = sg; c.fillRect(0, 0, cw, ch);
    ctx.drawImage(cologneGlintCv, cx - bw / 2, top, bw, bh);
  }
  var sp = Math.max(0, Math.sin((t - 3.6) * 3));
  if (t > 3.6 && t < 4.7) ganeAdStar(cx + bw * 0.18, top + bh * 0.1, 10 * k * sp, "rgba(255,250,240," + sp + ")");
}

// ---------------------------------------------------------------- still version
// The still ad for the random rotation (still-ads.js), a magazine page
// instead of the smoky film: a black-and-white photo of Ilia with his rapier
// where only the rose he holds is in color, beside Joe's bottle on blush
// satin and rose petals. "Every rose has its thorn."
function drawCologneStill(x, y, w, h, k, ch) {
  var look = ch.look;
  // Blush satin, with soft folds.
  var bg = ctx.createLinearGradient(x, y, x + w, y + h);
  bg.addColorStop(0, "#f7dfe2"); bg.addColorStop(0.5, "#eec3c9"); bg.addColorStop(1, "#e2a8b1");
  ctx.fillStyle = bg; ctx.fillRect(x, y, w, h);
  for (var f = 0; f < 6; f++) {
    var fx = x + w * (0.4 + f * 0.11);
    var fg = ctx.createLinearGradient(fx - w * 0.05, 0, fx + w * 0.05, 0);
    fg.addColorStop(0, "rgba(255,255,255,0)"); fg.addColorStop(0.5, "rgba(255,255,255," + (0.18 + (f % 2) * 0.12) + ")"); fg.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = fg;
    ctx.beginPath(); ctx.moveTo(fx - w * 0.04, y); ctx.bezierCurveTo(fx + w * 0.05, y + h * 0.3, fx - w * 0.06, y + h * 0.7, fx + w * 0.03, y + h);
    ctx.lineTo(fx + w * 0.09, y + h); ctx.bezierCurveTo(fx, y + h * 0.7, fx + w * 0.1, y + h * 0.3, fx + w * 0.02, y); ctx.closePath(); ctx.fill();
  }

  // The photo: Ilia in black and white.
  var px = x + w * 0.03, py = y + h * 0.08, pw = w * 0.34, ph = h * 0.84;
  ctx.save();
  ctx.translate(px + pw / 2, py + ph / 2); ctx.rotate(-0.025); ctx.translate(-(px + pw / 2), -(py + ph / 2));
  ctx.fillStyle = "rgba(0,0,0,0.25)"; ctx.fillRect(px + 5 * k, py + 6 * k, pw, ph);
  ctx.fillStyle = "#fbfaf7"; ctx.fillRect(px - 6 * k, py - 6 * k, pw + 12 * k, ph + 12 * k);
  ctx.save();
  ctx.beginPath(); ctx.rect(px, py, pw, ph); ctx.clip();
  var pg = ctx.createRadialGradient(px + pw * 0.6, py + ph * 0.35, 0, px + pw * 0.5, py + ph * 0.5, pw * 0.75);
  pg.addColorStop(0, "#4c4c4c"); pg.addColorStop(1, "#080808");
  ctx.fillStyle = pg; ctx.fillRect(px, py, pw, ph);
  var r = ph * 0.34, ix = px + pw * 0.56, iy = py + ph * 0.66;
  cologneIlia(ix, iy, r, look, 0, k); // rapier raised behind his shoulder
  var hx = ix - r * 0.78, hy = iy - r * 0.35;
  cologneArm(ix - r * 0.62, iy - r * 0.2, ix - r * 1.0, iy - r * 0.0, hx, hy, r, look);
  drawGlove(ctx, hx, hy, r * 0.24, look, "#0b0f12", -Math.PI * 0.6);
  // Everything so far to black and white...
  ctx.globalCompositeOperation = "saturation"; ctx.fillStyle = "#808080"; ctx.fillRect(px, py, pw, ph);
  ctx.globalCompositeOperation = "source-over";
  // ...except the rose in his hand.
  drawRose(hx + r * 0.02, hy - r * 0.28, 0.25, r / 22);
  var vg = ctx.createRadialGradient(px + pw / 2, py + ph / 2, pw * 0.3, px + pw / 2, py + ph / 2, pw * 0.75);
  vg.addColorStop(0, "rgba(0,0,0,0)"); vg.addColorStop(1, "rgba(0,0,0,0.45)");
  ctx.fillStyle = vg; ctx.fillRect(px, py, pw, ph);
  ctx.restore();
  ctx.restore();

  // Petals on the satin round the bottle.
  var pts = [[0.47, 0.86, 0.4], [0.5, 0.78, 2.1], [0.55, 0.92, 1.2], [0.66, 0.9, 2.8], [0.71, 0.82, 0.9], [0.62, 0.95, 1.9], [0.45, 0.95, 2.5], [0.74, 0.94, 0.2], [0.52, 0.18, 1.4], [0.69, 0.12, 2.2]];
  pts.forEach(function (p, i) {
    ctx.save(); ctx.translate(x + w * p[0], y + h * p[1]); ctx.rotate(p[2]);
    ctx.fillStyle = i % 2 ? "#b3122a" : "#d0213f";
    ctx.beginPath(); ctx.ellipse(0, 0, 9 * k, 5 * k, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.2)"; ctx.beginPath(); ctx.ellipse(-2 * k, -1.5 * k, 4 * k, 2 * k, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  });
  drawRose(x + w * 0.69, y + h * 0.84, -1.2, 2.0 * k);
  // The bottle.
  var im = cologneBottleImg;
  if (im.complete && im.naturalWidth) {
    var bh = h * 0.86, bw = bh * COLOGNE_BOTTLE_ASPECT, bx = x + w * 0.585, by = y + h * 0.07;
    ctx.fillStyle = "rgba(90,20,30,0.25)"; ctx.beginPath(); ctx.ellipse(bx, by + bh - 3 * k, bw * 0.6, h * 0.035, 0, 0, Math.PI * 2); ctx.fill();
    ctx.drawImage(im, bx - bw / 2, by, bw, bh);
  }
  // The brand column.
  var tx = x + w * 0.865, ink = "#2a0a10";
  var mono = stillTintedLogo(cologneMonoImg, ink), word = stillTintedLogo(cologneWordImg, ink);
  if (mono) { var ms = h * 0.22; ctx.drawImage(mono, tx - ms / 2, y + h * 0.07, ms, ms); }
  if (word) { var ww = w * 0.24, wh = ww * word.height / word.width; ctx.drawImage(word, tx - ww / 2, y + h * 0.34, ww, wh); }
  stillText("Rose", tx, y + h * 0.55, 36 * k, "#a3102a", w * 0.22, { face: "'Snell Roundhand', 'Brush Script MT', Georgia, serif", weight: "italic 600" });
  stillText("EAU DE COLOGNE", tx, y + h * 0.67, 12 * k, ink, w * 0.22, { face: "Georgia, 'Times New Roman', serif", weight: "400" });
  ctx.fillStyle = ink; ctx.fillRect(tx - w * 0.04, y + h * 0.725, w * 0.08, 1.5 * k);
  stillText("Every rose has its thorn.", tx, y + h * 0.8, 17 * k, ink, w * 0.22, { face: "Georgia, 'Times New Roman', serif", weight: "italic 400" });
  stillText("SPAIN · 100 ML", tx, y + h * 0.9, 10 * k, "rgba(42,10,16,0.7)", w * 0.22, { face: "Georgia, 'Times New Roman', serif", weight: "400" });
  ctx.strokeStyle = "rgba(42,10,16,0.35)"; ctx.lineWidth = 1.5 * k; ctx.strokeRect(x + 5 * k, y + 5 * k, w - 10 * k, h - 10 * k);
}
