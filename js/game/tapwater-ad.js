// Tap Water (Joe, 2026-11-09): a bottled-water parody ad that runs on the
// jumbotron (a banner in the test arena) the first time Charles Oliveira
// goes into guard in a fight, and never again that fight.
//   - Cool aqua, bubbles rising, the TAP WATER bottle in the middle.
//   - Charles, gone Super Saiyan (blond, golden aura), on his back in guard on the left while his opponent's glove
//     taps out on the mat: TAP! TAP! TAP!, a ripple each time.
//   - "Everybody taps." Bottled at the source: the guard of Charles
//     Oliveira, the most submissions in UFC history. Product of Brazil.
//   - Sound: water bloops, the three taps, a pour and a sparkle.
// It goes through queueJumboAd like every ad, so it never overlaps another.
// Plus a silent still for the random rotation (drawTapWaterStill).
"use strict";

var TAPWATER_SHOW = 7.0;
var TAPWATER_TAPS = [1.5, 2.0, 2.5];   // when the glove taps the mat
var tapWaterShow = 0, tapWaterIds = null, tapWaterDone = false, tapWaterOut = null;

function resetTapWater() { tapWaterShow = 0; tapWaterIds = null; tapWaterDone = false; stopTapWaterSound(); }
function isCharlesBall(b) { return !!(b && b.char && String(b.char.id || "").indexOf("c-charles-oliveira") === 0); }
// From beginGuard (guard.js) every time a fighter pulls guard.
function tapWaterOnGuard(b, atk) {
  if (tapWaterDone || !isCharlesBall(b) || (typeof galleryDemo !== "undefined" && galleryDemo)) return;
  tapWaterDone = true;
  queueJumboAd(TAPWATER_SHOW, function () {
    tapWaterShow = TAPWATER_SHOW; tapWaterIds = { charles: b.id, opp: atk ? atk.id : 1 - b.id };
    playTapWaterSound();
  }, b);
}
// Every frame, from tickAdBreaks (ad-breaks.js).
function tickTapWater(dt) { if (tapWaterShow > 0) tapWaterShow = Math.max(0, tapWaterShow - dt); }

var TW_BLUE = "#0b5fa5", TW_DEEP = "#073b6b";

// Charles gone Super Saiyan for the ad (Joe): his blond Do Bronx hair and
// the golden flame aura and lightning from dobronx.js, at (cx, cy).
function tapWaterSaiyan(cx, cy, r, chr) {
  var base = chr.look, hc = chr.special && chr.special.hairColor;
  var look = hc ? Object.assign({}, base, { hairColor: hc }) : base;
  var fake = { x: cx, y: cy, r: r, alive: true, dbBaseLook: base, char: { look: look } };
  if (hc && typeof drawSaiyanAura === "function") drawSaiyanAura(fake);
  stillFighter(cx, cy, r, look, chr.name);
  if (hc && typeof drawSaiyanBolts === "function") drawSaiyanBolts(fake);
}
function twSans() { return "'Helvetica Neue', Helvetica, Arial, sans-serif"; }

// The bottle, standing at (cx, base), h tall. `fill` 0-1 is how full it is.
function tapWaterBottle(cx, base, h, k, t) {
  var bw = h * 0.36, bodyTop = base - h * 0.72, neckW = bw * 0.36, top = base - h;
  ctx.save();
  // Shadow.
  ctx.fillStyle = "rgba(0,30,60,0.22)"; ctx.beginPath(); ctx.ellipse(cx, base + 2 * k, bw * 0.6, h * 0.035, 0, 0, Math.PI * 2); ctx.fill();
  // The bottle's outline: shoulders up into the neck.
  ctx.beginPath();
  ctx.moveTo(cx - bw / 2, base - h * 0.04);
  ctx.quadraticCurveTo(cx - bw / 2, base, cx - bw / 2 + h * 0.04, base);
  ctx.lineTo(cx + bw / 2 - h * 0.04, base);
  ctx.quadraticCurveTo(cx + bw / 2, base, cx + bw / 2, base - h * 0.04);
  ctx.lineTo(cx + bw / 2, bodyTop);
  ctx.bezierCurveTo(cx + bw / 2, bodyTop - h * 0.1, cx + neckW / 2, bodyTop - h * 0.08, cx + neckW / 2, top + h * 0.08);
  ctx.lineTo(cx - neckW / 2, top + h * 0.08);
  ctx.bezierCurveTo(cx - neckW / 2, bodyTop - h * 0.08, cx - bw / 2, bodyTop - h * 0.1, cx - bw / 2, bodyTop);
  ctx.closePath();
  var gl = ctx.createLinearGradient(cx - bw / 2, 0, cx + bw / 2, 0);
  gl.addColorStop(0, "rgba(170,225,255,0.75)"); gl.addColorStop(0.35, "rgba(235,250,255,0.85)"); gl.addColorStop(1, "rgba(120,190,240,0.75)");
  ctx.fillStyle = gl; ctx.fill();
  ctx.save(); ctx.clip();
  // The water inside, with a gently rocking surface.
  var wy = bodyTop - h * 0.02 + Math.sin(t * 3) * h * 0.008;
  var wg = ctx.createLinearGradient(0, wy, 0, base);
  wg.addColorStop(0, "rgba(80,170,240,0.55)"); wg.addColorStop(1, "rgba(20,110,200,0.65)");
  ctx.fillStyle = wg;
  ctx.beginPath(); ctx.moveTo(cx - bw, wy);
  for (var i = 0; i <= 12; i++) ctx.lineTo(cx - bw / 2 + bw * i / 12, wy + Math.sin(t * 4 + i) * h * 0.006);
  ctx.lineTo(cx + bw, base); ctx.lineTo(cx - bw, base); ctx.closePath(); ctx.fill();
  // Tiny bubbles inside.
  ctx.fillStyle = "rgba(255,255,255,0.7)";
  for (var j = 0; j < 7; j++) {
    var bp = (t * 0.35 + j * 0.37) % 1;
    ctx.beginPath(); ctx.arc(cx - bw * 0.3 + ((j * 37) % 10) / 10 * bw * 0.6, base - h * 0.06 - bp * (base - wy - h * 0.06), (1.2 + (j % 3)) * k, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
  ctx.strokeStyle = "rgba(7,59,107,0.55)"; ctx.lineWidth = 2 * k; ctx.stroke();
  // Shine down the left side.
  ctx.strokeStyle = "rgba(255,255,255,0.9)"; ctx.lineWidth = 4 * k; ctx.lineCap = "round";
  ctx.beginPath(); ctx.moveTo(cx - bw * 0.32, base - h * 0.1); ctx.lineTo(cx - bw * 0.32, bodyTop + h * 0.02); ctx.stroke();
  // Ridges and the cap.
  ctx.strokeStyle = "rgba(7,59,107,0.25)"; ctx.lineWidth = 1.5 * k;
  [0.12, 0.2].forEach(function (f) { ctx.beginPath(); ctx.moveTo(cx - bw / 2, base - h * f); ctx.lineTo(cx + bw / 2, base - h * f); ctx.stroke(); });
  ctx.fillStyle = TW_BLUE; ctx.strokeStyle = TW_DEEP; ctx.lineWidth = 1.5 * k;
  stillRoundRect(cx - neckW * 0.62, top, neckW * 1.24, h * 0.09, 3 * k); ctx.fill(); ctx.stroke();
  ctx.strokeStyle = "rgba(255,255,255,0.35)";
  for (var r = 1; r < 6; r++) { ctx.beginPath(); ctx.moveTo(cx - neckW * 0.62 + neckW * 1.24 * r / 6, top + 2 * k); ctx.lineTo(cx - neckW * 0.62 + neckW * 1.24 * r / 6, top + h * 0.09 - 2 * k); ctx.stroke(); }
  // The label.
  var ly = base - h * 0.52, lh = h * 0.27;
  ctx.fillStyle = "#ffffff"; ctx.fillRect(cx - bw / 2, ly, bw, lh);
  ctx.fillStyle = TW_BLUE; ctx.fillRect(cx - bw / 2, ly, bw, lh * 0.12); ctx.fillRect(cx - bw / 2, ly + lh * 0.88, bw, lh * 0.12);
  ctx.fillStyle = "#1f9d55"; ctx.fillRect(cx - bw / 2, ly + lh * 0.12, bw, lh * 0.04); // a Brazil-green pinstripe
  ctx.fillStyle = "#f2c200"; ctx.fillRect(cx - bw / 2, ly + lh * 0.84, bw, lh * 0.04);
  stillText("TAP", cx, ly + lh * 0.4, lh * 0.42, TW_BLUE, bw * 0.86, { weight: "900" });
  stillText("WATER", cx, ly + lh * 0.7, lh * 0.2, TW_DEEP, bw * 0.8, { face: twSans(), weight: "800" });
  ctx.restore();
}

function drawTapWaterJumbo(x, y, w, h) {
  if (tapWaterShow <= 0 || !tapWaterIds || !balls) return;
  var ch = balls[tapWaterIds.charles], opp = balls[tapWaterIds.opp];
  if (!ch) return;
  var t = TAPWATER_SHOW - tapWaterShow, a = Math.min(1, t / 0.3, tapWaterShow / 0.4), k = h / 250, sans = twSans();
  ctx.save();
  ctx.globalAlpha = a;
  ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();

  // Cool aqua with light rippling across it and bubbles rising.
  var bg = ctx.createLinearGradient(0, y, 0, y + h);
  bg.addColorStop(0, "#dff5ff"); bg.addColorStop(0.6, "#9ad8f5"); bg.addColorStop(1, "#4fb0e3");
  ctx.fillStyle = bg; ctx.fillRect(x, y, w, h);
  ctx.save(); ctx.globalAlpha *= 0.18; ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 3 * k;
  for (var c = 0; c < 6; c++) {
    ctx.beginPath();
    for (var i = 0; i <= 40; i++) { var px = x + w * i / 40; ctx.lineTo(px, y + h * (0.15 + c * 0.15) + Math.sin(i * 0.5 + t * 1.5 + c) * 6 * k); }
    ctx.stroke();
  }
  ctx.restore();
  ctx.strokeStyle = "rgba(255,255,255,0.75)"; ctx.lineWidth = 1.5 * k;
  for (var bi = 0; bi < 18; bi++) {
    var bp = (t * (0.18 + (bi % 4) * 0.05) + bi * 0.29) % 1, bx = x + w * ((bi * 0.618) % 1), by = y + h * (1.05 - bp * 1.15);
    ctx.beginPath(); ctx.arc(bx + Math.sin(t * 2 + bi) * 5 * k, by, (3 + (bi % 4) * 2) * k, 0, Math.PI * 2); ctx.stroke();
  }

  // Charles on his back in guard on the left, his opponent's glove tapping
  // the mat beside him.
  var cx = x + w * 0.12, cy = y + h * 0.6, cr = h * 0.25, matY = cy + cr * 0.98;
  var rise = easeOut(Math.min(1, t / 0.6));
  ctx.save(); ctx.translate(0, (1 - rise) * h * 0.5);
  // A strip of mat to tap on.
  ctx.fillStyle = "#1f6fb2"; stillRoundRect(x + w * 0.02, matY, w * 0.27, h * 0.07, 6 * k); ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.25)"; ctx.fillRect(x + w * 0.02 + 6 * k, matY + 3 * k, w * 0.27 - 12 * k, 2 * k);
  tapWaterSaiyan(cx, cy, cr, ch.baseChar || ch.char);
  var gxT = cx + cr * 1.75, gyT = matY - cr * 0.3;
  if (opp) {
    var tapK = 0; // 1 = glove down on the mat
    TAPWATER_TAPS.forEach(function (tt) { var d = t - tt; if (d > -0.2 && d < 0.15) tapK = Math.max(tapK, d < 0 ? 1 + d / 0.2 : 1 - d / 0.15); });
    var gr = cr * 0.5, gy = gyT - (1 - tapK) * cr * 1.1;
    // The opponent's forearm, reaching in from off the top.
    ctx.fillStyle = opp.char.look.skin; ctx.strokeStyle = "#0b0f12"; ctx.lineWidth = 2 * k;
    stillRoundRect(gxT - gr * 0.42, y - 10 * k, gr * 0.84, gy - y + 10 * k - gr * 0.6, gr * 0.3); ctx.fill(); ctx.stroke();
    drawGlove(ctx, gxT, gy, gr, opp.char.look, "#0b0f12", Math.PI / 2);
  }
  ctx.restore();
  TAPWATER_TAPS.forEach(function (tt, n) {
    var d = t - tt;
    if (d < 0 || d > 0.9) return;
    ctx.save(); ctx.globalAlpha *= 1 - d / 0.9;
    ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 2.5 * k;
    ctx.beginPath(); ctx.ellipse(gxT, matY + h * 0.02, (12 + d * 80) * k, (3 + d * 14) * k, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.translate(gxT + cr * 0.9, y + h * (0.22 + n * 0.17) - d * 8 * k); ctx.rotate(-0.12 + n * 0.12);
    stillText("TAP!", 0, 0, 30 * k * (1 + 0.3 * Math.max(0, 1 - d * 6)), "#ffffff", 120 * k, { weight: "900", stroke: TW_DEEP, strokeW: 0.22 });
    ctx.restore();
  });

  // The bottle drops in, with a splash.
  var bt = Math.min(1, Math.max(0, (t - 0.2) / 0.5)), drop = 1 - easeOut(bt);
  var bxC = x + w * 0.46, base = y + h * 0.93 - drop * h;
  if (bt > 0) tapWaterBottle(bxC, base, h * 0.86, k, t);
  if (t > 0.65 && t < 1.4) {
    var sp = (t - 0.65) / 0.75;
    ctx.save(); ctx.globalAlpha *= 1 - sp; ctx.fillStyle = "#ffffff";
    for (var s = 0; s < 10; s++) {
      var sa = Math.PI + (s / 9) * Math.PI, sd = sp * 60 * k;
      ctx.beginPath(); ctx.arc(bxC + Math.cos(sa) * sd * 1.4, y + h * 0.93 + Math.sin(sa) * sd - sp * sp * -40 * k, (4 - sp * 3) * k, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  }

  // The copy on the right.
  var tx = x + w * 0.76, tw = w * 0.4;
  var c1 = Math.min(1, Math.max(0, (t - 0.5) / 0.4));
  ctx.save(); ctx.globalAlpha *= c1;
  stillText("TAP WATER", tx, y + h * 0.2, 44 * k, TW_BLUE, tw, { weight: "900", stroke: "#ffffff", strokeW: 0.16 });
  stillText("BOTTLED AT THE SOURCE: CHARLES OLIVEIRA'S GUARD", tx, y + h * 0.33, 12 * k, TW_DEEP, tw, { face: sans, weight: "800" });
  ctx.restore();
  var c2 = Math.min(1, Math.max(0, (t - 3.0) / 0.4));
  if (c2 > 0) {
    ctx.save(); ctx.globalAlpha *= c2;
    ctx.translate(tx, y + h * 0.53); ctx.scale(0.8 + 0.2 * easeOut(c2), 0.8 + 0.2 * easeOut(c2));
    stillText("Everybody taps.", 0, 0, 38 * k, "#ffffff", tw, { face: "Georgia, 'Times New Roman', serif", weight: "italic 700", stroke: TW_DEEP, strokeW: 0.14 });
    ctx.restore();
  }
  var c3 = Math.min(1, Math.max(0, (t - 4.2) / 0.4));
  if (c3 > 0) {
    ctx.save(); ctx.globalAlpha *= c3;
    stillText("From the man with the most submissions in UFC history.", tx, y + h * 0.69, 13 * k, TW_DEEP, tw, { face: sans, weight: "600" });
    ctx.fillStyle = "rgba(255,255,255,0.85)"; stillRoundRect(tx - tw * 0.3, y + h * 0.77, tw * 0.6, h * 0.13, 10 * k); ctx.fill();
    stillText("100% PURE. PRODUCT OF BRAZIL.", tx, y + h * 0.835, 13 * k, "#1f9d55", tw * 0.56, { face: sans, weight: "900" });
    ctx.restore();
  }
  ctx.strokeStyle = "rgba(255,255,255,0.9)"; ctx.lineWidth = 3 * k; stillRoundRect(x + 4 * k, y + 4 * k, w - 8 * k, h - 8 * k, 12 * k); ctx.stroke();
  ctx.restore();
}
function drawTapWaterBanner() {
  if (tapWaterShow <= 0 || stadiumOn()) return;
  drawTapWaterJumbo(10, 10, W - 20, 110);
}

// ---------------------------------------------------------------- still version
// The silent still (in the still-ad rotation, still-ads.js): a chrome
// kitchen tap pouring into a glass on a white counter, the bottle beside it
// and Charles on the right. STRAIGHT FROM THE GUARD.
function drawTapWaterStill(x, y, w, h, k, ch) {
  var sans = twSans();
  var bg = ctx.createLinearGradient(0, y, 0, y + h);
  bg.addColorStop(0, "#f4fbff"); bg.addColorStop(0.72, "#d9eef9"); bg.addColorStop(0.72, "#ffffff"); bg.addColorStop(1, "#e9eef2");
  ctx.fillStyle = bg; ctx.fillRect(x, y, w, h);
  // Subway tiles behind.
  ctx.strokeStyle = "rgba(11,95,165,0.08)"; ctx.lineWidth = 1.5 * k;
  for (var ty = 0; ty < 6; ty++) {
    var yy = y + ty * h * 0.12; ctx.beginPath(); ctx.moveTo(x, yy); ctx.lineTo(x + w, yy); ctx.stroke();
    for (var tx0 = (ty % 2) * 30 * k; tx0 < w; tx0 += 60 * k) { ctx.beginPath(); ctx.moveTo(x + tx0, yy); ctx.lineTo(x + tx0, yy + h * 0.12); ctx.stroke(); }
  }
  // The chrome tap, coming in from the top.
  var fx = x + w * 0.2, chrome = ctx.createLinearGradient(fx - 30 * k, 0, fx + 30 * k, 0);
  chrome.addColorStop(0, "#8d99a6"); chrome.addColorStop(0.45, "#f7fbff"); chrome.addColorStop(1, "#7a8794");
  ctx.fillStyle = chrome; ctx.strokeStyle = "#5d6873"; ctx.lineWidth = 1.5 * k;
  stillRoundRect(fx - 70 * k, y - 10 * k, 30 * k, h * 0.25, 8 * k); ctx.fill(); ctx.stroke(); // the riser
  ctx.lineWidth = 16 * k; ctx.lineCap = "round"; ctx.strokeStyle = "#5d6873";
  ctx.beginPath(); ctx.moveTo(fx - 55 * k, y + h * 0.18); ctx.quadraticCurveTo(fx - 55 * k, y + h * 0.06, fx, y + h * 0.1); ctx.lineTo(fx, y + h * 0.16); ctx.stroke();
  ctx.lineWidth = 12 * k; ctx.strokeStyle = chrome;
  ctx.beginPath(); ctx.moveTo(fx - 55 * k, y + h * 0.18); ctx.quadraticCurveTo(fx - 55 * k, y + h * 0.06, fx, y + h * 0.1); ctx.lineTo(fx, y + h * 0.16); ctx.stroke();
  // The stream into a glass on the counter.
  var gw = h * 0.26, gTop = y + h * 0.42, gBase = y + h * 0.88;
  var sg = ctx.createLinearGradient(fx - 5 * k, 0, fx + 5 * k, 0);
  sg.addColorStop(0, "rgba(120,190,240,0.5)"); sg.addColorStop(0.5, "rgba(255,255,255,0.95)"); sg.addColorStop(1, "rgba(120,190,240,0.5)");
  ctx.fillStyle = sg; ctx.fillRect(fx - 4 * k, y + h * 0.17, 8 * k, gBase - h * 0.2 - (y + h * 0.17));
  ctx.beginPath(); ctx.moveTo(fx - gw / 2, gTop); ctx.lineTo(fx + gw / 2, gTop); ctx.lineTo(fx + gw * 0.42, gBase); ctx.lineTo(fx - gw * 0.42, gBase); ctx.closePath();
  ctx.fillStyle = "rgba(200,235,255,0.35)"; ctx.fill();
  ctx.save(); ctx.clip();
  var wq = ctx.createLinearGradient(0, gTop + h * 0.12, 0, gBase);
  wq.addColorStop(0, "rgba(90,180,240,0.55)"); wq.addColorStop(1, "rgba(30,120,210,0.7)");
  ctx.fillStyle = wq; ctx.fillRect(fx - gw, gTop + h * 0.12, gw * 2, gBase);
  ctx.restore();
  ctx.strokeStyle = "rgba(60,110,150,0.6)"; ctx.lineWidth = 2 * k; ctx.stroke();
  ctx.strokeStyle = "rgba(255,255,255,0.9)"; ctx.lineWidth = 3 * k;
  ctx.beginPath(); ctx.moveTo(fx - gw * 0.33, gTop + h * 0.05); ctx.lineTo(fx - gw * 0.28, gBase - h * 0.06); ctx.stroke();
  // The bottle beside it.
  tapWaterBottle(x + w * 0.33, gBase, h * 0.7, k, 0.7);
  // The copy.
  var cx = x + w * 0.565, cw = w * 0.32;
  stillText("TAP WATER", cx, y + h * 0.2, 46 * k, TW_BLUE, cw, { weight: "900" });
  stillText("STRAIGHT FROM THE GUARD.", cx, y + h * 0.4, 26 * k, TW_DEEP, cw, { face: sans, weight: "900" });
  ctx.fillStyle = TW_BLUE; ctx.fillRect(cx - cw * 0.3, y + h * 0.5, cw * 0.6, Math.max(1, 2 * k));
  stillText("Everybody taps eventually.", cx, y + h * 0.61, 20 * k, "#3d5468", cw, { face: "Georgia, 'Times New Roman', serif", weight: "italic 600" });
  stillText("ON TAP SINCE 2010 • PRODUCT OF BRAZIL", cx, y + h * 0.8, 13 * k, "#1f9d55", cw, { face: sans, weight: "900" });
  // Charles on the right.
  var jx = x + w * 0.88, jr = h * 0.3;
  tapWaterSaiyan(jx, y + h * 0.56, jr, ch);
  ctx.strokeStyle = TW_BLUE; ctx.lineWidth = 3 * k; stillRoundRect(x + 5 * k, y + 5 * k, w - 10 * k, h - 10 * k, 12 * k); ctx.stroke();
}

// Synth sound: water bloops as the bottle drops in, the three taps on the
// mat, a short pour, and a bright sparkle on "Everybody taps."
function playTapWaterSound() {
  try {
    var ac = getAudioCtx();
    if (!ac) return;
    if (ac.state === "suspended") ac.resume();
    stopTapWaterSound();
    var out = tapWaterOut = ac.createGain(), now = ac.currentTime + 0.03;
    out.gain.value = 0.7; out.connect(ac.destination);
    if (typeof duckMusic === "function") duckMusic(now, now + TAPWATER_SHOW);
    function bloop(at, f, vol) {
      var o = ac.createOscillator(), g = ac.createGain();
      o.type = "sine"; o.frequency.setValueAtTime(f, at); o.frequency.exponentialRampToValueAtTime(f * 2.2, at + 0.08);
      g.gain.setValueAtTime(0.0001, at); g.gain.exponentialRampToValueAtTime(vol, at + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, at + 0.12);
      o.connect(g); g.connect(out); o.start(at); o.stop(at + 0.15);
    }
    var nb = ac.createBuffer(1, Math.floor(ac.sampleRate * 1.2), ac.sampleRate), nd = nb.getChannelData(0);
    for (var i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
    function noise(at, len, f, q, vol, type) {
      var s = ac.createBufferSource(), fl = ac.createBiquadFilter(), g = ac.createGain();
      s.buffer = nb; fl.type = type || "bandpass"; fl.frequency.value = f; fl.Q.value = q;
      g.gain.setValueAtTime(0.0001, at); g.gain.exponentialRampToValueAtTime(vol, at + Math.min(0.05, len / 4));
      g.gain.setValueAtTime(vol, at + len * 0.7); g.gain.exponentialRampToValueAtTime(0.0001, at + len);
      s.connect(fl); fl.connect(g); g.connect(out); s.start(at); s.stop(at + len + 0.02);
    }
    // The bottle splashing down, then a few bubbles.
    noise(now + 0.62, 0.35, 900, 0.8, 0.35);
    [0.7, 0.82, 0.9, 1.05, 1.2].forEach(function (d, n) { bloop(now + d, 380 + n * 90, 0.18); });
    // Three taps on the mat: a soft slap each.
    TAPWATER_TAPS.forEach(function (d) {
      noise(now + d, 0.07, 1400, 1.2, 0.7);
      var o = ac.createOscillator(), g = ac.createGain(), at = now + d;
      o.frequency.setValueAtTime(160, at); o.frequency.exponentialRampToValueAtTime(70, at + 0.08);
      g.gain.setValueAtTime(0.0001, at); g.gain.exponentialRampToValueAtTime(0.4, at + 0.005); g.gain.exponentialRampToValueAtTime(0.0001, at + 0.12);
      o.connect(g); g.connect(out); o.start(at); o.stop(at + 0.14);
    });
    // A short pour with bubbles in it.
    noise(now + 2.9, 1.1, 2200, 0.7, 0.16, "highpass");
    for (var b = 0; b < 8; b++) bloop(now + 2.95 + b * 0.12 + Math.random() * 0.05, 500 + Math.random() * 400, 0.08);
    // The sparkle on "Everybody taps."
    [[1568, 0], [2093, 0.08], [2637, 0.16], [3136, 0.24]].forEach(function (d) {
      var o = ac.createOscillator(), g = ac.createGain(), at = now + 3.05 + d[1];
      o.type = "sine"; o.frequency.value = d[0];
      g.gain.setValueAtTime(0.0001, at); g.gain.exponentialRampToValueAtTime(0.12, at + 0.006); g.gain.exponentialRampToValueAtTime(0.0001, at + 0.7);
      o.connect(g); g.connect(out); o.start(at); o.stop(at + 0.75);
    });
  } catch (e) { /* never let audio break the game */ }
}
function stopTapWaterSound() {
  if (!tapWaterOut) return;
  try { tapWaterOut.disconnect(); } catch (e) { /* already gone */ }
  tapWaterOut = null;
}
