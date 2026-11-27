// Samurai Sushi (Joe, 2026-11-27): Jiří Procházka's cinematic restaurant ad
// on the jumbotron (a banner in the test arena), the first time he goes
// samurai in a fight (once a match). It goes up as the kimono goes on
// (jpSuitUp, prochazka.js) and plays during his samurai run (his own run
// doesn't hold it up: igbb.adOwn). Shot like a high-end knife commercial, letterboxed,
// with film grain, following the shot list Joe got with it:
//   1. Wide: a giant bluefin tuna on a cedar board in a dark dojo, one paper
//      lantern above, mist and petals, a slow push-in. ONE FISH. ONE SAMURAI.
//   2. Macro: the light runs along the tuna's skin, a drop rolls off.
//   3. Close-up: Jiří in his kimono, the headband tails lifting, the light
//      coming up on him.
//   4. Insert: his glove on the hilt, the other on the scabbard, an inch of
//      steel slides out and a glint runs down it. SHING.
//   5. Wide: he dashes over the fish in a blur, three slashes hang in the
//      air, a white flash.
//   6. He stands on the far side and slides the sword home. CLICK. Nothing.
//   7. Overhead, slow motion: the tuna falls apart into slices that fly
//      onto rice as nigiri on a black slate.
//   8. Hero shot of one nigiri, steam, a petal lands. SAMURAI SUSHI.
//      "Sliced by a samurai. Served in seconds." Jiří nods in the background.
// Only his own two arms and gloves, always. Sound is code-made (taiko, wind,
// shakuhachi, koto, the shing, the slashes, the click, tak tak tak, a gong)
// on the ad's own clock. Like the Suga Smiles ad, if a special, clash, lock
// or cutscene starts while it plays it pauses (off the jumbotron, sound
// stopped, clock held) and finishes after. prochazka.sushiAd false in his
// character file switches it off. Plus a silent still for the random
// rotation (drawSamuraiSushiStill, still-ads.js).
"use strict";

var SSU_SHOW = 11.6;
var SSU_CUTS = [0, 2.2, 3.4, 4.8, 5.9, 7.0, 8.2, 9.8, SSU_SHOW]; // where each shot starts
var SSU_N = 6; // slices (and nigiri)
var SSU_LAND = [0, 1, 2, 3, 4, 5].map(function (i) { return 9.02 + i * 0.09; }); // each nigiri landing
var SSU_CREAM = "#efe6d2", SSU_RED = "#c8102e", SSU_SERIF = "Georgia, 'Times New Roman', serif";
var SSU_CUES = [["boom", 0.02], ["wind", 0.02], ["flute", 0.4], ["koto", 3.5], ["koto2", 3.95], ["shing", 5.25],
  ["dash", 5.97], ["slash", 6.04], ["slash", 6.11], ["slash", 6.18], ["hit", 6.24], ["click", 7.9],
  ["swish", 8.56], ["swish", 8.68], ["swish", 8.8], ["roll", 8.9]].concat(
  SSU_LAND.map(function (d) { return ["tak", d]; }), [["gong", 9.82], ["melody", 10.05]]);
var SSU = { show: 0, t: 0, id: 0, done: false, paused: false, cue: 0, out: null, nb: null };

// From startMatchWith (through resetAdBreaks).
function resetSamuraiSushi() { SSU.show = 0; SSU.t = 0; SSU.done = false; SSU.paused = false; SSU.cue = 0; stopSamuraiSushiSound(); }
// From jpSuitUp (prochazka.js): the kimono's just gone on.
function samuraiSushiOnSuit(b) {
  var c = b && b.char && b.char.prochazka;
  if (SSU.done || (c && c.sushiAd === false) || (typeof galleryDemo !== "undefined" && galleryDemo)) return;
  SSU.done = true; SSU.id = b.id; // (once a match)
  if (b.igbb) b.igbb.adOwn = true; // his own samurai run doesn't hold it up (Joe: it plays once he's gone samurai)
  queueJumboAd(SSU_SHOW, function () {
    if (over) { jumboAdLeft = 0; return; }
    SSU.show = SSU_SHOW; SSU.t = 0; SSU.cue = 0; SSU.paused = false;
    ssuDuck();
  }, b);
}
function ssuDuck() {
  try { var ac = getAudioCtx(); if (ac && typeof duckMusic === "function") duckMusic(ac.currentTime, ac.currentTime + SSU.show); } catch (e) { /* no audio */ }
}
// A special, a clash, a lock or a cutscene on: the ad holds.
function samuraiSushiHold() {
  return (typeof jumboHold === "function" && jumboHold(balls && balls[SSU.id])) || (typeof sceneLocked === "function" && sceneLocked());
}
// Every frame, from tickAdBreaks (ad-breaks.js).
function tickSamuraiSushi(dt) {
  if (SSU.show <= 0) return;
  if (samuraiSushiHold()) {
    if (!SSU.paused) { SSU.paused = true; stopSamuraiSushiSound(); }
    if (typeof jumboAdLeft !== "undefined" && jumboAdLeft > 0) jumboAdLeft += dt;
    return;
  }
  if (SSU.paused) { // back on: the wind picks up again if it was still blowing
    SSU.paused = false;
    ssuDuck();
    if (SSU.t < 5.2) playSamuraiSushiCue("wind", 5.8 - SSU.t);
  }
  SSU.show = Math.max(0, SSU.show - dt);
  SSU.t = SSU_SHOW - SSU.show;
  while (SSU.cue < SSU_CUES.length && SSU.t >= SSU_CUES[SSU.cue][1]) {
    if (SSU.t - SSU_CUES[SSU.cue][1] < 0.25) playSamuraiSushiCue(SSU_CUES[SSU.cue][0]);
    SSU.cue++;
  }
}

// ---------------------------------------------------------------- helpers
function ssuEase(u) { u = Math.max(0, Math.min(1, u)); return u * u * (3 - 2 * u); }
function ssuOut(u) { u = Math.max(0, Math.min(1, u)); return 1 - (1 - u) * (1 - u) * (1 - u); }
function ssuFade(t, at, len) { return Math.max(0, Math.min(1, (t - at) / (len || 0.3))); }
function ssuR(i) { var s = Math.sin(i * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); } // fixed noise (no Math.random in draw code)
function ssuLook(ch) {
  var look = (ch && ch.look) || {}, sam = ch && ch.prochazka && ch.prochazka.samurai;
  return Object.assign({}, look, (sam && sam.look) || {});
}
// Spaced-out film-title type.
function ssuTitle(txt, x, y, size, col, a, maxW) {
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha *= a;
  stillText(txt.split("").join(" "), x, y, size, col, maxW, { face: SSU_SERIF, weight: "400", glow: "rgba(255,200,140,0.35)" });
  ctx.restore();
}

// The giant bluefin, facing left, `L` long, centered on (cx, cy).
// o.top: seen from above. o.cut: glowing slash lines (0..1).
function ssuTunaPath(L) {
  ctx.beginPath();
  ctx.moveTo(-0.5 * L, 0.01 * L);
  ctx.bezierCurveTo(-0.46 * L, -0.08 * L, -0.3 * L, -0.15 * L, -0.08 * L, -0.15 * L);
  ctx.bezierCurveTo(0.12 * L, -0.15 * L, 0.28 * L, -0.06 * L, 0.37 * L, -0.025 * L);
  ctx.quadraticCurveTo(0.43 * L, -0.1 * L, 0.52 * L, -0.19 * L);
  ctx.quadraticCurveTo(0.47 * L, -0.06 * L, 0.45 * L, 0);
  ctx.quadraticCurveTo(0.47 * L, 0.06 * L, 0.52 * L, 0.19 * L);
  ctx.quadraticCurveTo(0.43 * L, 0.1 * L, 0.37 * L, 0.025 * L);
  ctx.bezierCurveTo(0.28 * L, 0.06 * L, 0.12 * L, 0.14 * L, -0.08 * L, 0.14 * L);
  ctx.bezierCurveTo(-0.3 * L, 0.14 * L, -0.46 * L, 0.08 * L, -0.5 * L, 0.01 * L);
  ctx.closePath();
}
function ssuTuna(cx, cy, L, o) {
  o = o || {};
  ctx.save(); ctx.translate(cx, cy);
  if (o.rot) ctx.rotate(o.rot);
  // fins behind the body: dorsal and anal, and the yellow finlets
  ctx.fillStyle = "#0f1a2b";
  ctx.beginPath(); ctx.moveTo(-0.12 * L, -0.14 * L); ctx.quadraticCurveTo(-0.02 * L, -0.3 * L, 0.04 * L, -0.31 * L); ctx.quadraticCurveTo(0.02 * L, -0.2 * L, 0.06 * L, -0.14 * L); ctx.fill();
  ctx.beginPath(); ctx.moveTo(0.02 * L, 0.13 * L); ctx.quadraticCurveTo(0.1 * L, 0.24 * L, 0.13 * L, 0.25 * L); ctx.quadraticCurveTo(0.12 * L, 0.17 * L, 0.14 * L, 0.11 * L); ctx.fill();
  ctx.fillStyle = "#e8c23a";
  for (var f = 0; f < 6; f++) {
    var fx = 0.15 * L + f * 0.036 * L, fy = -0.115 * L + f * 0.016 * L;
    ctx.beginPath(); ctx.moveTo(fx, fy + 0.01 * L); ctx.lineTo(fx + 0.012 * L, fy - 0.035 * L); ctx.lineTo(fx + 0.026 * L, fy + 0.01 * L); ctx.fill();
    ctx.beginPath(); ctx.moveTo(fx, -fy - 0.012 * L); ctx.lineTo(fx + 0.012 * L, -fy + 0.03 * L); ctx.lineTo(fx + 0.026 * L, -fy - 0.012 * L); ctx.fill();
  }
  // the body: dark steel blue on top, silver below (all dark blue from above)
  ssuTunaPath(L);
  var g = ctx.createLinearGradient(0, -0.15 * L, 0, 0.14 * L);
  if (o.top) { g.addColorStop(0, "#1a2c45"); g.addColorStop(0.5, "#0d1828"); g.addColorStop(1, "#1a2c45"); }
  else { g.addColorStop(0, "#0d1828"); g.addColorStop(0.38, "#1f3a5c"); g.addColorStop(0.55, "#8fa6b8"); g.addColorStop(1, "#dfe7ee"); }
  ctx.fillStyle = g; ctx.fill();
  ctx.save(); ssuTunaPath(L); ctx.clip();
  // a blue lateral sheen, and a hint of scales
  ctx.fillStyle = "rgba(90,170,230,0.22)"; ctx.fillRect(-0.5 * L, (o.top ? -0.03 : -0.02) * L, L, 0.035 * L);
  ctx.strokeStyle = "rgba(255,255,255,0.07)"; ctx.lineWidth = Math.max(0.6, L * 0.002);
  for (var sx = -0.3; sx < 0.36; sx += 0.025) for (var sy = -0.12; sy < 0.12; sy += 0.03) {
    ctx.beginPath(); ctx.arc((sx + (Math.round(sy / 0.03) % 2) * 0.0125) * L, sy * L, 0.014 * L, -0.9, 0.9); ctx.stroke();
  }
  if (o.sheen != null) { // the light running along the skin
    var shx = (-0.5 + o.sheen * 1.1) * L, sg = ctx.createLinearGradient(shx - 0.12 * L, 0, shx + 0.12 * L, 0);
    sg.addColorStop(0, "rgba(255,240,215,0)"); sg.addColorStop(0.5, "rgba(255,240,215,0.45)"); sg.addColorStop(1, "rgba(255,240,215,0)");
    ctx.fillStyle = sg; ctx.fillRect(shx - 0.12 * L, -0.2 * L, 0.24 * L, 0.4 * L);
  }
  // top light from the lantern
  var tl = ctx.createLinearGradient(0, -0.15 * L, 0, 0);
  tl.addColorStop(0, "rgba(255,200,130,0.28)"); tl.addColorStop(1, "rgba(255,200,130,0)");
  ctx.fillStyle = tl; ctx.fillRect(-0.5 * L, -0.15 * L, L, 0.15 * L);
  ctx.restore();
  ctx.strokeStyle = "rgba(0,0,0,0.6)"; ctx.lineWidth = Math.max(1, L * 0.004); ssuTunaPath(L); ctx.stroke();
  if (!o.top) {
    // gill line, pectoral fin, eye
    ctx.strokeStyle = "rgba(10,20,35,0.7)"; ctx.lineWidth = Math.max(1, L * 0.004);
    ctx.beginPath(); ctx.moveTo(-0.3 * L, -0.1 * L); ctx.quadraticCurveTo(-0.25 * L, 0, -0.3 * L, 0.09 * L); ctx.stroke();
    ctx.fillStyle = "#14243a";
    ctx.beginPath(); ctx.moveTo(-0.26 * L, -0.01 * L); ctx.quadraticCurveTo(-0.12 * L, -0.02 * L, -0.05 * L, 0.03 * L); ctx.quadraticCurveTo(-0.14 * L, 0.03 * L, -0.25 * L, 0.025 * L); ctx.fill();
    ctx.fillStyle = "#c9a24a"; ctx.beginPath(); ctx.arc(-0.39 * L, -0.025 * L, 0.03 * L, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#05080c"; ctx.beginPath(); ctx.arc(-0.39 * L, -0.025 * L, 0.022 * L, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.9)"; ctx.beginPath(); ctx.arc(-0.395 * L, -0.032 * L, 0.007 * L, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "rgba(10,20,35,0.8)"; ctx.beginPath(); ctx.moveTo(-0.5 * L, 0.012 * L); ctx.lineTo(-0.43 * L, 0.03 * L); ctx.stroke(); // mouth
  } else {
    ctx.fillStyle = "#c9a24a"; [-1, 1].forEach(function (s) { ctx.beginPath(); ctx.arc(-0.4 * L, s * 0.045 * L, 0.014 * L, 0, Math.PI * 2); ctx.fill(); });
  }
  if (o.cut > 0) { // the three cuts, glowing on the fish
    ctx.save(); ssuTunaPath(L); ctx.clip();
    ctx.strokeStyle = "rgba(255,255,255," + (0.9 * o.cut).toFixed(3) + ")"; ctx.lineWidth = Math.max(1.2, L * 0.004);
    ctx.shadowColor = "rgba(255,80,90,0.9)"; ctx.shadowBlur = L * 0.02;
    [[-0.22, 0.25], [0.0, -0.2], [0.18, 0.22]].forEach(function (c) { ctx.beginPath(); ctx.moveTo((c[0] - 0.06) * L, -0.2 * L); ctx.lineTo((c[0] + c[1] * 0.3) * L, 0.2 * L); ctx.stroke(); });
    ctx.restore();
  }
  ctx.restore();
}

// One piece of nigiri, s wide, from the side (o.top: from above).
function ssuNigiri(x, y, s, o) {
  o = o || {};
  ctx.save(); ctx.translate(x, y);
  // the rice
  ctx.fillStyle = "rgba(0,0,0,0.45)"; ctx.beginPath(); ctx.ellipse(0, s * 0.24, s * 0.5, s * 0.08, 0, 0, Math.PI * 2); ctx.fill();
  if (o.rice !== 0) {
    ctx.save(); ctx.globalAlpha *= o.rice == null ? 1 : o.rice;
    ctx.fillStyle = "#f4f1e8"; ctx.strokeStyle = "rgba(60,50,40,0.35)"; ctx.lineWidth = Math.max(0.8, s * 0.012);
    ctx.beginPath(); ctx.ellipse(0, s * 0.08, s * 0.44, s * (o.top ? 0.2 : 0.17), 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "rgba(200,190,170,0.6)";
    for (var i = 0; i < 14; i++) { ctx.beginPath(); ctx.ellipse((ssuR(i) - 0.5) * s * 0.75, s * 0.08 + (ssuR(i + 30) - 0.5) * s * 0.22, s * 0.03, s * 0.014, ssuR(i + 60) * 3, 0, Math.PI * 2); ctx.fill(); }
    ctx.restore();
  }
  // the fish slab draped over it
  if (o.fish !== 0) {
    ctx.save(); ctx.translate(0, -(o.lift || 0) * s); if (o.spin) ctx.rotate(o.spin);
    ctx.beginPath();
    ctx.moveTo(-s * 0.5, s * 0.06);
    ctx.bezierCurveTo(-s * 0.48, -s * 0.12, -s * 0.2, -s * 0.16, s * 0.05, -s * 0.13);
    ctx.bezierCurveTo(s * 0.35, -s * 0.11, s * 0.52, -s * 0.06, s * 0.52, s * 0.05);
    ctx.bezierCurveTo(s * 0.3, s * 0.0, -s * 0.3, s * 0.02, -s * 0.5, s * 0.06);
    ctx.closePath();
    var fg = ctx.createLinearGradient(-s * 0.5, -s * 0.15, s * 0.5, s * 0.06);
    fg.addColorStop(0, "#ff7a86"); fg.addColorStop(0.5, "#e2283f"); fg.addColorStop(1, "#b5122c");
    ctx.fillStyle = fg; ctx.fill();
    ctx.save(); ctx.clip();
    ctx.strokeStyle = "rgba(255,225,225,0.55)"; ctx.lineWidth = Math.max(0.8, s * 0.018);
    for (var l = 0; l < 5; l++) { var lx = -s * 0.36 + l * s * 0.19; ctx.beginPath(); ctx.moveTo(lx, -s * 0.2); ctx.quadraticCurveTo(lx + s * 0.08, -s * 0.05, lx + s * 0.02, s * 0.1); ctx.stroke(); }
    var hl = ctx.createLinearGradient(0, -s * 0.16, 0, -s * 0.04);
    hl.addColorStop(0, "rgba(255,255,255,0.55)"); hl.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = hl; ctx.fillRect(-s * 0.5, -s * 0.18, s, s * 0.14);
    ctx.restore();
    ctx.strokeStyle = "rgba(90,0,15,0.6)"; ctx.lineWidth = Math.max(0.8, s * 0.012); ctx.stroke();
    ctx.restore();
  }
  ctx.restore();
}

// A katana blade from the hand (hilt end) out along `a`, `len` long, curving
// a little toward `side`. glow 0..1 for the glint.
function ssuBlade(hx, hy, a, len, w, glow, glintAt) {
  if (len <= 0) return;
  var cx = Math.cos(a), cy = Math.sin(a), nx = -cy, ny = cx;
  var tip = { x: hx + cx * len, y: hy + cy * len }, c = { x: hx + cx * len * 0.55 + nx * len * 0.05, y: hy + cy * len * 0.55 + ny * len * 0.05 };
  ctx.save(); ctx.lineCap = "round";
  if (glow > 0) { ctx.globalAlpha = Math.min(1, glow); ctx.strokeStyle = "rgba(220,240,255,0.8)"; ctx.lineWidth = w * 3; ctx.beginPath(); ctx.moveTo(hx, hy); ctx.quadraticCurveTo(c.x, c.y, tip.x, tip.y); ctx.stroke(); ctx.globalAlpha = 1; }
  ctx.strokeStyle = "#1d2328"; ctx.lineWidth = w * 1.5; ctx.beginPath(); ctx.moveTo(hx, hy); ctx.quadraticCurveTo(c.x, c.y, tip.x, tip.y); ctx.stroke();
  var g = ctx.createLinearGradient(hx, hy, tip.x, tip.y);
  g.addColorStop(0, "#8b98a3"); g.addColorStop(0.5, "#f4f8fb"); g.addColorStop(1, "#cbd6de");
  ctx.strokeStyle = g; ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(hx, hy); ctx.quadraticCurveTo(c.x, c.y, tip.x, tip.y); ctx.stroke();
  ctx.strokeStyle = "rgba(255,255,255,0.95)"; ctx.lineWidth = Math.max(0.8, w * 0.25);
  ctx.beginPath(); ctx.moveTo(hx + nx * w * 0.35, hy + ny * w * 0.35); ctx.quadraticCurveTo(c.x + nx * w * 0.35, c.y + ny * w * 0.35, tip.x, tip.y); ctx.stroke();
  if (glintAt != null && glintAt >= 0 && glintAt <= 1) ssuStar(hx + (tip.x - hx) * glintAt, hy + (tip.y - hy) * glintAt, w * 5, 1);
  ctx.restore();
}
function ssuStar(x, y, r, a) {
  ctx.save(); ctx.globalAlpha *= a; ctx.fillStyle = "#ffffff";
  ctx.beginPath(); ctx.moveTo(x, y - r); ctx.quadraticCurveTo(x, y, x + r, y); ctx.quadraticCurveTo(x, y, x, y + r); ctx.quadraticCurveTo(x, y, x - r, y); ctx.quadraticCurveTo(x, y, x, y - r); ctx.fill();
  var g = ctx.createRadialGradient(x, y, 0, x, y, r * 0.6); g.addColorStop(0, "rgba(255,255,255,0.9)"); g.addColorStop(1, "rgba(160,210,255,0)");
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r * 0.6, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}
// A scabbard from its mouth (m) back along `a`, `len` long, `w` thick, with the
// round gold guard at the mouth when `guard`.
function ssuSaya(mx, my, a, len, w) {
  var ex = mx + Math.cos(a) * len, ey = my + Math.sin(a) * len;
  ctx.save(); ctx.lineCap = "round";
  ctx.strokeStyle = "#0b0f12"; ctx.lineWidth = w + 3; ctx.beginPath(); ctx.moveTo(mx, my); ctx.lineTo(ex, ey); ctx.stroke();
  ctx.strokeStyle = "#1b1a1f"; ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(mx, my); ctx.lineTo(ex, ey); ctx.stroke();
  ctx.strokeStyle = "rgba(255,255,255,0.28)"; ctx.lineWidth = Math.max(0.8, w * 0.18);
  ctx.beginPath(); ctx.moveTo(mx - Math.sin(a) * w * 0.25, my + Math.cos(a) * w * 0.25 - w * 0.2); ctx.lineTo(ex - Math.sin(a) * w * 0.25, ey + Math.cos(a) * w * 0.25 - w * 0.2); ctx.stroke();
  ctx.strokeStyle = JP_RED || "#b3202a"; ctx.lineWidth = Math.max(1, w * 0.3); // the cord
  var cx0 = mx + Math.cos(a) * len * 0.12, cy0 = my + Math.sin(a) * len * 0.12;
  ctx.beginPath(); ctx.moveTo(cx0, cy0); ctx.quadraticCurveTo(cx0 + Math.cos(a) * len * 0.1, cy0 + w * 1.6, cx0 + Math.cos(a) * len * 0.22, cy0 + Math.sin(a) * len * 0.22); ctx.stroke();
  ctx.restore();
}
// The hilt: white wrap with black diamonds, from the guard at g out along a.
function ssuHilt(gx, gy, a, len, w) {
  var ex = gx + Math.cos(a) * len, ey = gy + Math.sin(a) * len;
  ctx.save(); ctx.lineCap = "round";
  ctx.strokeStyle = "#0b0f12"; ctx.lineWidth = w + 3; ctx.beginPath(); ctx.moveTo(gx, gy); ctx.lineTo(ex, ey); ctx.stroke();
  ctx.strokeStyle = "#ece6d8"; ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(gx, gy); ctx.lineTo(ex, ey); ctx.stroke();
  ctx.fillStyle = "#15120f";
  for (var i = 1; i < 6; i++) {
    var u = i / 6, px = gx + (ex - gx) * u, py = gy + (ey - gy) * u, d = w * 0.32;
    ctx.save(); ctx.translate(px, py); ctx.rotate(a);
    ctx.beginPath(); ctx.moveTo(-d, 0); ctx.lineTo(0, -d * 0.9); ctx.lineTo(d, 0); ctx.lineTo(0, d * 0.9); ctx.closePath(); ctx.fill();
    ctx.restore();
  }
  ctx.fillStyle = "#c8a24a"; ctx.strokeStyle = "#0b0f12"; ctx.lineWidth = 1.5; // the guard
  ctx.save(); ctx.translate(gx, gy); ctx.rotate(a);
  ctx.beginPath(); ctx.ellipse(0, 0, w * 0.28, w * 1.05, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.restore();
  ctx.fillStyle = "#c8a24a"; ctx.beginPath(); ctx.arc(ex, ey, w * 0.5, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); // the pommel cap
  ctx.restore();
}

// The dojo in world units (ww x 250): back wall with glowing shoji, pillars,
// a plank floor, the lantern and its warm light. `lamp` 0..1 brightness.
function ssuDojo(ww, t, lamp, lx) {
  if (lx == null) lx = ww / 2;
  var bg = ctx.createLinearGradient(0, 0, 0, 250);
  bg.addColorStop(0, "#06080c"); bg.addColorStop(0.65, "#0d1017"); bg.addColorStop(1, "#08090c");
  ctx.fillStyle = bg; ctx.fillRect(-ww, -250, ww * 3, 750);
  // shoji panels glowing faint blue behind
  for (var p = -3; p < 8; p++) {
    var px = ww / 2 + (p - 2.5) * 150;
    ctx.fillStyle = "rgba(60,95,150,0.10)"; ctx.fillRect(px + 8, 30, 134, 140);
    ctx.strokeStyle = "rgba(120,160,220,0.10)"; ctx.lineWidth = 1.5;
    for (var gx = 1; gx < 4; gx++) { ctx.beginPath(); ctx.moveTo(px + 8 + gx * 33.5, 30); ctx.lineTo(px + 8 + gx * 33.5, 170); ctx.stroke(); }
    for (var gy = 1; gy < 5; gy++) { ctx.beginPath(); ctx.moveTo(px + 8, 30 + gy * 28); ctx.lineTo(px + 142, 30 + gy * 28); ctx.stroke(); }
    ctx.fillStyle = "#120c08"; ctx.fillRect(px - 6, 0, 14, 172); // pillar
  }
  // the floor: planks running to the back
  var fl = ctx.createLinearGradient(0, 170, 0, 260);
  fl.addColorStop(0, "#1a120c"); fl.addColorStop(1, "#0c0806");
  ctx.fillStyle = fl; ctx.fillRect(-ww, 170, ww * 3, 120);
  ctx.strokeStyle = "rgba(0,0,0,0.5)"; ctx.lineWidth = 1.2;
  for (var i = -14; i <= 14; i++) { ctx.beginPath(); ctx.moveTo(ww / 2 + i * 45, 170); ctx.lineTo(ww / 2 + i * 150, 260); ctx.stroke(); }
  // the lantern's warm pool of light
  ctx.save(); ctx.globalCompositeOperation = "lighter";
  var lg = ctx.createRadialGradient(lx, 40, 5, ww / 2, 150, 330);
  lg.addColorStop(0, "rgba(255,170,90," + (0.32 * lamp).toFixed(3) + ")"); lg.addColorStop(1, "rgba(255,170,90,0)");
  ctx.fillStyle = lg; ctx.fillRect(-ww, -250, ww * 3, 750);
  ctx.fillStyle = "rgba(255,190,120," + (0.06 * lamp).toFixed(3) + ")";
  ctx.beginPath(); ctx.moveTo(lx - 20, 45); ctx.lineTo(lx + 20, 45); ctx.lineTo(ww / 2 + 330, 200); ctx.lineTo(ww / 2 - 330, 200); ctx.closePath(); ctx.fill();
  ctx.restore();
}
function ssuLantern(x, y, s, t) {
  var sway = Math.sin(t * 1.3) * 0.04;
  ctx.save(); ctx.translate(x, y - 40 * s); ctx.rotate(sway); ctx.translate(0, 40 * s);
  ctx.strokeStyle = "#1a1410"; ctx.lineWidth = 1.5 * s; ctx.beginPath(); ctx.moveTo(0, -60 * s); ctx.lineTo(0, -22 * s); ctx.stroke();
  var g = ctx.createRadialGradient(0, 0, 2 * s, 0, 0, 24 * s);
  g.addColorStop(0, "#fff1c9"); g.addColorStop(0.6, "#f5a54a"); g.addColorStop(1, "#b9441f");
  ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(0, 0, 17 * s, 21 * s, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = "rgba(120,40,15,0.6)"; ctx.lineWidth = 1 * s;
  for (var r = -2; r <= 2; r++) { ctx.beginPath(); ctx.ellipse(0, r * 6.5 * s, 17 * s * Math.sqrt(1 - Math.pow(r * 6.5 / 21, 2)), 1.5 * s, 0, 0, Math.PI * 2); ctx.stroke(); }
  ctx.fillStyle = "#1a1410"; ctx.fillRect(-9 * s, -23 * s, 18 * s, 4 * s); ctx.fillRect(-9 * s, 19 * s, 18 * s, 4 * s);
  ctx.fillStyle = SSU_RED; ctx.beginPath(); ctx.arc(0, 0, 5 * s, 0, Math.PI * 2); ctx.fill(); // the red sun on it
  ctx.restore();
}
// The cedar board (a low table) under the fish.
function ssuBoard(cx, y, half) {
  ctx.fillStyle = "rgba(0,0,0,0.5)"; ctx.beginPath(); ctx.ellipse(cx, y + 30, half * 1.05, 10, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#3b2414"; ctx.fillRect(cx - half + 20, y + 10, 16, 20); ctx.fillRect(cx + half - 36, y + 10, 16, 20);
  var g = ctx.createLinearGradient(0, y - 6, 0, y + 12);
  g.addColorStop(0, "#b37c45"); g.addColorStop(0.45, "#8a5a30"); g.addColorStop(1, "#4a2d17");
  ctx.fillStyle = g; ctx.fillRect(cx - half, y - 6, half * 2, 18);
  ctx.strokeStyle = "rgba(60,30,10,0.5)"; ctx.lineWidth = 1;
  for (var i = 0; i < 6; i++) { ctx.beginPath(); ctx.moveTo(cx - half, y - 3 + i * 2.6); ctx.bezierCurveTo(cx - half * 0.3, y - 2 + i * 2.6 + Math.sin(i) * 2, cx + half * 0.3, y - 4 + i * 2.6, cx + half, y - 3 + i * 2.6); ctx.stroke(); }
}
// Mist drifting low over the floor.
function ssuMist(ww, t, y0, a) {
  for (var i = 0; i < 7; i++) {
    var mx = ((ssuR(i) * ww * 1.6 + t * (18 + ssuR(i + 9) * 20)) % (ww * 1.6)) - ww * 0.3, my = y0 + ssuR(i + 4) * 50, mr = 110 + ssuR(i + 2) * 90;
    var g = ctx.createRadialGradient(mx, my, 0, mx, my, mr);
    g.addColorStop(0, "rgba(190,205,230," + (0.07 * a).toFixed(3) + ")"); g.addColorStop(1, "rgba(190,205,230,0)");
    ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(mx, my, mr, mr * 0.35, 0, 0, Math.PI * 2); ctx.fill();
  }
}
// Cherry blossom petals falling, fixed paths. size scales them (bigger, softer
// ones in front of the lens).
function ssuPetals(ww, t, n, size, seed, a) {
  ctx.save(); ctx.globalAlpha *= a == null ? 1 : a;
  for (var i = 0; i < n; i++) {
    var sp = 22 + ssuR(seed + i) * 26, ph = ssuR(seed + i + 50);
    var y = ((ph * 330 + t * sp) % 330) - 40, x = ssuR(seed + i + 90) * ww + Math.sin(t * 1.4 + i) * 22 - t * 14 * size;
    x = ((x % ww) + ww) % ww;
    var s = size * (2.6 + ssuR(seed + i + 7) * 2.2), r = t * (1.5 + ssuR(i)) + i;
    ctx.save(); ctx.translate(x, y); ctx.rotate(r); ctx.scale(1, 0.5 + 0.5 * Math.abs(Math.sin(t * 2.2 + i)));
    ctx.fillStyle = i % 3 ? "#f6b8c8" : "#fbd3dd";
    ctx.beginPath(); ctx.moveTo(0, -s); ctx.quadraticCurveTo(s * 0.9, -s * 0.2, 0, s); ctx.quadraticCurveTo(-s * 0.9, -s * 0.2, 0, -s); ctx.fill();
    ctx.restore();
  }
  ctx.restore();
}

// Jiří in his kimono, his two scabbards at his left hip. o.hand: where his
// sword hand is ({x, y}, with o.blade { a, len } out of it), o.saya: his
// other glove on the scabbard mouth. Only his own two arms.
function ssuJiri(cx, cy, r, look, name, o) {
  o = o || {};
  var arm = look.sleeves || look.kimono || look.skin || "#1c2232", gr = r * 0.27;
  var mouth = { x: cx - r * 0.55, y: cy + r * 0.42 }, sa = Math.PI * 0.86;
  ssuSaya(mouth.x, mouth.y, sa, r * 1.4, r * 0.15);
  stillFighter(cx, cy, r, look, name);
  if (o.sheathed) ssuHilt(mouth.x, mouth.y, sa + Math.PI, r * 0.5, r * 0.15);
  // his other glove on the scabbard's mouth, from his near shoulder
  var sh2 = { x: cx - r * 0.75, y: cy + r * 0.05 }, g2 = { x: mouth.x - Math.cos(sa) * -r * 0.05, y: mouth.y + r * 0.06 };
  strokeLimb(r * 0.18, arm, function () { ctx.moveTo(sh2.x, sh2.y); ctx.quadraticCurveTo(sh2.x - r * 0.35, sh2.y + r * 0.35, g2.x, g2.y); });
  drawGlove(ctx, g2.x, g2.y, gr, look, "#0b0f12", 0.9);
  if (o.hand) { // the sword hand, from his far shoulder, bending at the elbow
    var sh = { x: cx + r * 0.72, y: cy - r * 0.1 }, h = o.hand;
    var dx = h.x - sh.x, dy = h.y - sh.y, d = Math.sqrt(dx * dx + dy * dy) || 1, reach = r * 1.5;
    var bend = Math.sqrt(Math.max(0, reach * reach / 4 - d * d / 4)), nx = -dy / d, ny = dx / d;
    if (ny < 0) { nx = -nx; ny = -ny; }
    var el = { x: (sh.x + h.x) / 2 + nx * bend, y: (sh.y + h.y) / 2 + ny * bend };
    if (o.blade) { ssuHilt(h.x, h.y, o.blade.a + Math.PI, r * 0.42, r * 0.13); ssuBlade(h.x, h.y, o.blade.a, o.blade.len, r * 0.09, o.blade.glow || 0, o.blade.glint); }
    strokeLimb(r * 0.18, arm, function () { ctx.moveTo(sh.x, sh.y); ctx.lineTo(el.x, el.y); ctx.lineTo(h.x, h.y); });
    drawGlove(ctx, h.x, h.y, gr, look, "#0b0f12", Math.atan2(h.y - el.y, h.x - el.x));
  }
}

// ---------------------------------------------------------------- the shots
// Each draws in world units: 250 tall, ww wide, centered.
function ssuShotWide(ww, t, lt, o, look, name) {
  ssuDojo(ww, t, 1, ww / 2 + 110);
  ssuLantern(ww / 2 + 110, 50, 1, t);
  ssuMist(ww, t, 165, 1);
  ssuBoard(ww / 2, 178, 300);
  ssuTuna(ww / 2, 134, 430, { cut: o.cut || 0, sheen: o.sheen, rot: o.tremble ? Math.sin(t * 70) * 0.004 * o.tremble : 0 });
  if (o.jiri) o.jiri();
  ssuMist(ww, t + 7, 205, 0.8);
  ssuPetals(ww, t, 14, 1, 3, 0.9);
}

function ssuShot(i, ww, t, lt, look, name) {
  var cut;
  if (i === 0) { // 1. wide establishing, slow push-in
    var z = 1 + lt / 2.2 * 0.12;
    ctx.translate(ww / 2, 140); ctx.scale(z, z); ctx.translate(-ww / 2, -140);
    ssuShotWide(ww, t, lt, { sheen: 0.2 + lt * 0.15 }, look, name);
  } else if (i === 1) { // 2. macro along the skin to the eye
    var hx = ww / 2 - 430 * 0.39, z2 = 3.2 + lt * 0.25, fx = hx + 150 - ssuEase(lt / 1.2) * 130;
    ctx.translate(ww / 2, 125); ctx.scale(z2, z2); ctx.translate(-fx, -134);
    ssuDojo(ww, t, 0.7);
    ssuBoard(ww / 2, 178, 300);
    ssuTuna(ww / 2, 134, 430, { sheen: 0.05 + lt / 1.2 * 0.4 });
    // a drop of water running down off the fin
    var dy = Math.min(1, lt / 1.0), dpx = hx + 80 - dy * 6, dpy = 134 - 18 + dy * dy * 70;
    ctx.fillStyle = "rgba(200,230,255,0.75)"; ctx.beginPath(); ctx.moveTo(dpx, dpy - 4.5); ctx.quadraticCurveTo(dpx + 3, dpy, dpx, dpy + 2.5); ctx.quadraticCurveTo(dpx - 3, dpy, dpx, dpy - 4.5); ctx.fill();
    ctx.fillStyle = "#ffffff"; ctx.beginPath(); ctx.arc(dpx - 0.8, dpy - 0.5, 0.7, 0, Math.PI * 2); ctx.fill();
  } else if (i === 2) { // 3. close-up: Jiří, the light comes up on him
    var z3 = 1 + lt / 1.4 * 0.07;
    ctx.translate(ww / 2, 200); ctx.scale(z3, z3); ctx.translate(-ww / 2, -200);
    var bg = ctx.createRadialGradient(ww / 2, 120, 10, ww / 2, 120, ww * 0.6);
    bg.addColorStop(0, "#1c2436"); bg.addColorStop(1, "#05070a");
    ctx.fillStyle = bg; ctx.fillRect(-ww, -250, ww * 3, 750);
    // an ink wash blot and the red sun behind him
    ctx.fillStyle = "rgba(200,16,46," + (0.55 * ssuFade(lt, 0.1, 0.8)).toFixed(3) + ")";
    ctx.beginPath(); ctx.arc(ww / 2 + 150, 95, 92, 0, Math.PI * 2); ctx.fill();
    ssuPetals(ww, t, 10, 0.8, 21, 0.6);
    var r = 165, cx = ww / 2, cy = 225;
    // the headband tails, lifting in the wind behind his head
    ctx.save(); ctx.strokeStyle = "#f6f4ee"; ctx.lineCap = "round";
    [0, 1].forEach(function (k2) {
      ctx.lineWidth = 15 - k2 * 3;
      var bx = cx + r * 0.78, by = cy - r * 0.62 + k2 * 10;
      ctx.beginPath(); ctx.moveTo(bx, by);
      for (var s = 1; s <= 6; s++) ctx.lineTo(bx + s * 26, by + s * (4 + k2 * 6) + Math.sin(t * 9 - s * 0.9 + k2) * (3 + s * 2.2));
      ctx.stroke();
    });
    ctx.restore();
    stillFighter(cx, cy, r, look, name);
    // blue rim light down his back edge, warm light coming up on his face
    ctx.save(); ctx.strokeStyle = "rgba(120,180,255,0.85)"; ctx.lineWidth = 4; ctx.shadowColor = "rgba(120,180,255,1)"; ctx.shadowBlur = 16;
    ctx.beginPath(); ctx.arc(cx, cy, r + 1, Math.PI * 1.05, Math.PI * 1.6); ctx.stroke(); ctx.restore();
    ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.clip();
    var dark = 0.7 * (1 - ssuEase((lt - 0.45) / 0.5));
    var sg = ctx.createLinearGradient(0, cy - r, 0, cy);
    sg.addColorStop(0, "rgba(0,0,0," + dark.toFixed(3) + ")"); sg.addColorStop(1, "rgba(0,0,0," + (dark * 0.6).toFixed(3) + ")");
    ctx.fillStyle = sg; ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
    ctx.globalCompositeOperation = "lighter";
    var wg = ctx.createRadialGradient(cx, cy - r, 5, cx, cy - r, r * 1.2);
    wg.addColorStop(0, "rgba(255,170,90," + (0.3 * ssuFade(lt, 0.5, 0.5)).toFixed(3) + ")"); wg.addColorStop(1, "rgba(255,170,90,0)");
    ctx.fillStyle = wg; ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
    ctx.restore();
    if (lt > 0.5 && lt < 0.95) ssuStar(cx - r * 0.3, cy - r * 0.62, 16 * Math.sin((lt - 0.5) / 0.45 * Math.PI), 0.9); // a glint off the headband
    ssuPetals(ww, t, 4, 3.2, 40, 0.75);
  } else if (i === 3) { // 4. the draw: an inch of steel and a glint
    var tilt = lt / 1.1;
    ctx.translate(ww / 2, 125); ctx.scale(1.05 + tilt * 0.05, 1.05 + tilt * 0.05); ctx.translate(-ww / 2, -125 - tilt * 18);
    // his kimono filling the frame, the obi across it
    ctx.fillStyle = look.kimono || "#1c2232"; ctx.fillRect(-ww, -250, ww * 3, 750);
    ctx.strokeStyle = "rgba(255,255,255,0.04)"; ctx.lineWidth = 1;
    for (var wv = -40; wv < 60; wv++) { ctx.beginPath(); ctx.moveTo(wv * 22, -100); ctx.lineTo(wv * 22 + 200, 400); ctx.stroke(); }
    ctx.fillStyle = look.obi || "#b3202a"; ctx.save(); ctx.translate(ww / 2, 150); ctx.rotate(-0.12); ctx.fillRect(-ww, -34, ww * 2, 68);
    ctx.fillStyle = "rgba(0,0,0,0.25)"; ctx.fillRect(-ww, 24, ww * 2, 10); ctx.restore();
    ctx.fillStyle = look.mon || "#efe9dc"; ctx.beginPath(); ctx.arc(ww * 0.78, 40, 30, 0, Math.PI * 2); ctx.fill(); // the crest
    ctx.fillStyle = look.kimono || "#1c2232"; ctx.beginPath(); ctx.arc(ww * 0.78, 40, 21, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = look.mon || "#efe9dc"; ctx.beginPath(); ctx.arc(ww * 0.78, 40, 12, 0, Math.PI * 2); ctx.fill();
    // the sword along the frame: scabbard low left, hilt up right
    var a = -0.32, out = 46 * ssuOut((lt - 0.25) / 0.3), mx = ww / 2 - 40, my = 160;
    var ca = Math.cos(a), sa = Math.sin(a);
    ssuSaya(mx, my, a + Math.PI, 600, 30);
    var gxp = mx + ca * out, gyp = my + sa * out;
    ssuBlade(mx - ca * 20, my - sa * 20, a, out + 20, 22, 0, null);
    ssuHilt(gxp, gyp, a, 190, 30);
    // the glint running down the steel, and the flare across the frame
    var gu = (lt - 0.45) / 0.3;
    if (gu > 0 && gu < 1) {
      ssuStar(mx + ca * out * gu, my + sa * out * gu - 6, 30 * Math.sin(gu * Math.PI), 1);
      ctx.save(); ctx.globalCompositeOperation = "lighter";
      var fy = my + sa * out * gu - 6, fg = ctx.createLinearGradient(-ww, 0, ww * 2, 0);
      fg.addColorStop(0, "rgba(120,180,255,0)"); fg.addColorStop(0.5, "rgba(170,210,255," + (0.6 * Math.sin(gu * Math.PI)).toFixed(3) + ")"); fg.addColorStop(1, "rgba(120,180,255,0)");
      ctx.fillStyle = fg; ctx.fillRect(-ww, fy - 2, ww * 3, 4);
      ctx.restore();
    }
    // his gloves: one round the hilt, the other's thumb on the guard
    var arm = look.sleeves || look.kimono || "#1c2232";
    var hg = { x: gxp + ca * 120, y: gyp + sa * 120 };
    strokeLimb(46, arm, function () { ctx.moveTo(hg.x + 60, hg.y - 200); ctx.lineTo(hg.x, hg.y); });
    drawGlove(ctx, hg.x, hg.y, 50, look, "#0b0f12", Math.atan2(200, -60));
    var sg2 = { x: mx - ca * 40, y: my - sa * 40 + 10 };
    strokeLimb(46, arm, function () { ctx.moveTo(sg2.x - 120, sg2.y + 200); ctx.lineTo(sg2.x, sg2.y); });
    drawGlove(ctx, sg2.x, sg2.y, 48, look, "#0b0f12", Math.atan2(-200, 120));
  } else if (i === 4) { // 5. the dash over the fish
    var pan = lt < 0.12 ? (1 - lt / 0.12) * -140 : 0;
    ctx.translate(pan, 0);
    var du = ssuEase((lt - 0.08) / 0.28), dash = lt > 0.08 && lt < 0.38;
    var x0 = ww / 2 - 330, x1 = ww / 2 + 330, jx = x0 + (x1 - x0) * du, jy = 190 - Math.sin(du * Math.PI) * 120;
    var after = lt >= 0.36;
    cut = ssuFade(lt, 0.22, 0.1);
    ssuShotWide(ww, t, lt, { cut: cut, jiri: function () {
      if (dash) { // a blur, with afterimages
        for (var g = 4; g >= 1; g--) {
          var gu2 = ssuEase((lt - 0.08 - g * 0.025) / 0.28), gx = x0 + (x1 - x0) * gu2, gy = 190 - Math.sin(gu2 * Math.PI) * 120;
          ctx.save(); ctx.globalAlpha *= 0.12 * (5 - g); ctx.fillStyle = "#1c2232"; ctx.beginPath(); ctx.arc(gx, gy, 46, 0, Math.PI * 2); ctx.fill(); ctx.restore();
        }
        ctx.strokeStyle = "rgba(255,255,255,0.5)"; ctx.lineWidth = 2;
        for (var sl = 0; sl < 6; sl++) { var ly = jy - 40 + sl * 16; ctx.beginPath(); ctx.moveTo(jx - 60 - sl * 10, ly); ctx.lineTo(jx - 220, ly); ctx.stroke(); }
        ssuJiri(jx, jy, 46, look, name, { hand: { x: jx - 40, y: jy + 30 }, blade: { a: Math.PI * 0.92, len: 80, glow: 0.8 } });
      } else if (!after) { // crouched, hand on the hilt
        ssuJiri(x0, 190, 46, look, name, { sheathed: true });
      } else { // landed on the far side, blade out behind him
        ssuJiri(x1, 190, 46, look, name, { hand: { x: x1 + 58, y: 192 }, blade: { a: 0.35, len: 82, glow: Math.max(0, 1 - (lt - 0.4) / 0.4), glint: (lt - 0.55) / 0.3 } });
      }
    } }, look, name);
    // three slashes hanging in the air over the fish
    if (lt > 0.12) {
      ctx.save(); ctx.lineCap = "round";
      [[-150, 0.12], [0, 0.17], [150, 0.22]].forEach(function (s, k2) {
        var su = ssuEase((lt - s[1]) / 0.06), fade = 1 - ssuFade(lt, 0.5 + k2 * 0.05, 0.45);
        if (su <= 0 || fade <= 0) return;
        ctx.globalAlpha = fade; ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 7 * fade + 1;
        ctx.shadowColor = "rgba(160,210,255,1)"; ctx.shadowBlur = 14;
        var sx0 = ww / 2 + s[0] - 70, sy0 = 50, ex = ww / 2 + s[0] + 70, ey = 205;
        ctx.beginPath(); ctx.moveTo(sx0, sy0); ctx.quadraticCurveTo(ww / 2 + s[0] + (k2 % 2 ? -50 : 50), 128, sx0 + (ex - sx0) * su, sy0 + (ey - sy0) * su); ctx.stroke();
      });
      ctx.restore();
    }
    if (pan) { // whip-pan smear
      ctx.fillStyle = "rgba(255,255,255,0.05)";
      for (var ps = 0; ps < 18; ps++) ctx.fillRect(-ww, 20 + ps * 12, ww * 3, 2);
    }
  } else if (i === 5) { // 6. the sheathe. CLICK. Nothing.
    var z6 = 1.1 + lt * 0.04, xr = ww / 2 + 330;
    ctx.translate(ww / 2 + 260, 236); ctx.scale(z6, z6); ctx.translate(-ww / 2 - 260, -236);
    var su6 = ssuEase((lt - 0.12) / 0.75), clicked = lt >= 0.9;
    var trem = lt > 0.95 ? (lt - 0.95) / 0.25 : 0;
    ssuShotWide(ww, t, lt, { cut: 0.35 + 0.65 * trem, tremble: trem, jiri: function () {
      if (clicked) { ssuJiri(xr, 180, 46, look, name, { sheathed: true }); return; }
      // the blade sliding back into the scabbard at his hip
      var mouth = { x: xr - 46 * 0.55, y: 180 + 46 * 0.42 }, back = Math.PI * 0.86, fw = back - Math.PI;
      var len = 82 * (1 - su6), hx = mouth.x + Math.cos(fw) * (len + 4), hy = mouth.y + Math.sin(fw) * (len + 4);
      ssuJiri(xr, 180, 46, look, name, { hand: { x: hx, y: hy }, blade: { a: back, len: len + 4, glow: 0 } });
    } }, look, name);
    if (lt > 0.9 && lt < 1.05) ssuStar(xr - 25, 198, 14 * Math.sin((lt - 0.9) / 0.15 * Math.PI), 1);
  } else if (i === 6) { // 7. overhead, slow motion: the fish comes apart into nigiri
    var bg7 = ctx.createLinearGradient(0, 0, 0, 250);
    bg7.addColorStop(0, "#7a4d27"); bg7.addColorStop(1, "#4f3019");
    ctx.fillStyle = bg7; ctx.fillRect(-ww, -250, ww * 3, 750);
    ctx.strokeStyle = "rgba(40,20,8,0.35)"; ctx.lineWidth = 1.4;
    for (var wg2 = 0; wg2 < 22; wg2++) { var yy = wg2 * 12 + 4; ctx.beginPath(); ctx.moveTo(-ww, yy); ctx.bezierCurveTo(ww * 0.3, yy + Math.sin(wg2) * 5, ww * 0.7, yy - Math.cos(wg2) * 5, ww * 2, yy); ctx.stroke(); }
    var lg7 = ctx.createRadialGradient(ww / 2, 125, 20, ww / 2, 125, ww * 0.55);
    lg7.addColorStop(0, "rgba(255,200,140,0.25)"); lg7.addColorStop(1, "rgba(0,0,0,0.55)");
    ctx.fillStyle = lg7; ctx.fillRect(-ww, -250, ww * 3, 750);
    var z7 = 1.06 - lt * 0.04; ctx.translate(ww / 2, 125); ctx.scale(z7, z7); ctx.translate(-ww / 2, -125);
    // the black slate the nigiri land on
    var sl7 = ssuEase((lt - 0.3) / 0.4);
    ctx.save(); ctx.globalAlpha *= sl7;
    ctx.fillStyle = "rgba(0,0,0,0.5)"; stillRoundRect(ww / 2 - 330 + 6, 82 + 8, 660, 96, 10); ctx.fill();
    ctx.fillStyle = "#16181b"; stillRoundRect(ww / 2 - 330, 82, 660, 96, 10); ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.08)"; ctx.lineWidth = 2; ctx.stroke();
    ctx.restore();
    var L = 560, tx = ww / 2, ty = 125, sep = ssuEase((lt - 0.12) / 0.3);
    var edges = []; for (var e = 0; e <= SSU_N; e++) edges.push(-0.3 + e * (0.62 / SSU_N));
    // head and tail sliding off
    [[-0.5, edges[0], -1], [edges[SSU_N], 0.55, 1]].forEach(function (pc) {
      var off = pc[2] * (sep * 40 + Math.max(0, lt - 0.45) * 420);
      ctx.save(); ctx.translate(off, 0); ctx.beginPath(); ctx.rect(tx + pc[0] * L, 0, (pc[1] - pc[0]) * L, 250); ctx.clip();
      ssuTuna(tx, ty, L, { top: true }); ctx.restore();
    });
    for (var n = 0; n < SSU_N; n++) {
      var x0n = tx + edges[n] * L, x1n = tx + edges[n + 1] * L, mid = (x0n + x1n) / 2, gap = (n - (SSU_N - 1) / 2) * 14 * sep;
      var flyU = (lt - 0.5 - n * 0.05) / (SSU_LAND[n] - 8.2 - 0.5 - n * 0.05);
      var tgt = { x: ww / 2 - 270 + n * 108, y: 132 };
      if (flyU <= 0) { // still a slice of fish, coming apart
        ctx.save(); ctx.translate(gap, Math.sin(n * 2.1) * 3 * sep); ctx.beginPath(); ctx.rect(x0n + 1, 0, x1n - x0n - 2, 250); ctx.clip();
        ssuTuna(tx, ty, L, { top: true, cut: (1 - sep) * 0.9 }); ctx.restore();
        if (sep > 0) { // the red flesh showing on the cut faces
          ctx.fillStyle = "rgba(226,40,63," + (0.9 * sep).toFixed(3) + ")";
          ctx.fillRect(x1n + gap - 1, ty - L * 0.15, 5 * sep, L * 0.28);
        }
        if (sl7 > 0.5) ssuNigiri(tgt.x, tgt.y, 84, { top: true, fish: 0, rice: ssuEase((lt - 0.45 - n * 0.05) / 0.25) });
      } else { // flying over in an arc, turning into nigiri, landing on its rice
        var fu = Math.min(1, flyU), fe = ssuEase(fu);
        var px = mid + gap + (tgt.x - mid - gap) * fe, py = ty + (tgt.y - ty) * fe - Math.sin(fu * Math.PI) * 60;
        ssuNigiri(tgt.x, tgt.y, 84, { top: true, fish: 0 });
        ctx.save(); ctx.globalAlpha *= Math.min(1, fu * 3);
        if (fu < 1) ssuNigiri(px, py - 10, 84 * (0.85 + 0.15 * fe), { top: true, rice: 0, spin: Math.sin(fu * Math.PI) * 0.6 * (n % 2 ? 1 : -1) });
        ctx.restore();
        if (fu >= 1) {
          ssuNigiri(tgt.x, tgt.y, 84, { top: true });
          var lu = (t - SSU_LAND[n]) / 0.2;
          if (lu < 1) { ctx.strokeStyle = "rgba(255,255,255," + (0.6 * (1 - lu)).toFixed(3) + ")"; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(tgt.x, tgt.y + 10, 40 + lu * 25, 12 + lu * 8, 0, 0, Math.PI * 2); ctx.stroke(); }
        }
      }
    }
    // wasabi and ginger pop on at the end
    var wp = ssuOut((lt - 1.3) / 0.2);
    if (wp > 0) {
      ctx.fillStyle = "#8bbf3a"; ctx.beginPath(); ctx.ellipse(ww / 2 + 300, 100, 16 * wp, 11 * wp, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#f4b6a6"; for (var gi = 0; gi < 3; gi++) { ctx.beginPath(); ctx.ellipse(ww / 2 + 300 + (gi - 1) * 9, 158 + gi * 2, 12 * wp, 7 * wp, gi * 0.6, 0, Math.PI * 2); ctx.fill(); }
    }
    if (lt < 0.5) { ssuTitle("SLOW MOTION", ww - 90, 36, 8, "rgba(255,255,255,0.6)", 1 - ssuFade(lt, 0.35, 0.15), 120); }
  } else { // 8. hero nigiri, the logo
    var orbit = lt / 1.8;
    var bg8 = ctx.createRadialGradient(ww * 0.3, 140, 10, ww * 0.3, 140, ww * 0.7);
    bg8.addColorStop(0, "#2a1a10"); bg8.addColorStop(1, "#050506");
    ctx.fillStyle = bg8; ctx.fillRect(-ww, -250, ww * 3, 750);
    // warm lantern bokeh behind, drifting with the orbit
    for (var bk = 0; bk < 9; bk++) {
      var bx = ssuR(bk + 70) * ww * 0.6 + orbit * 50 * (0.5 + ssuR(bk)), by = 40 + ssuR(bk + 80) * 110, br = 14 + ssuR(bk + 3) * 26;
      var bgr = ctx.createRadialGradient(bx, by, 0, bx, by, br);
      bgr.addColorStop(0, "rgba(255,170,90,0.22)"); bgr.addColorStop(0.7, "rgba(255,170,90,0.12)"); bgr.addColorStop(1, "rgba(255,170,90,0)");
      ctx.fillStyle = bgr; ctx.beginPath(); ctx.arc(bx, by, br, 0, Math.PI * 2); ctx.fill();
    }
    // Jiří soft in the background, giving one small nod
    var nod = lt > 1.15 && lt < 1.55 ? Math.sin((lt - 1.15) / 0.4 * Math.PI) * 6 : 0;
    ctx.save(); ctx.globalAlpha *= 0.55 * ssuFade(lt, 0.2, 0.5);
    ssuJiri(ww * 0.9, 150 + nod, 52, look, name, { sheathed: true });
    ctx.fillStyle = "rgba(5,5,6,0.35)"; ctx.fillRect(ww * 0.9 - 120, 60, 240, 190);
    ctx.restore();
    // the slate and the one piece
    var nx8 = ww * 0.27 + orbit * 18;
    ctx.fillStyle = "#16181b"; ctx.beginPath(); ctx.moveTo(nx8 - 230, 205); ctx.lineTo(nx8 + 230, 205); ctx.lineTo(nx8 + 260, 240); ctx.lineTo(nx8 - 260, 240); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.12)"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(nx8 - 230, 205); ctx.lineTo(nx8 + 230, 205); ctx.stroke();
    ctx.save(); ctx.translate(nx8, 178); ctx.scale(1 - orbit * 0.06, 1);
    ssuNigiri(0, 0, 230, {});
    ctx.restore();
    ctx.save(); ctx.strokeStyle = "rgba(255,210,170,0.9)"; ctx.lineWidth = 2.5; ctx.shadowColor = "rgba(255,180,120,1)"; ctx.shadowBlur = 10; // rim light on the fish
    ctx.beginPath(); ctx.moveTo(nx8 - 105, 165); ctx.bezierCurveTo(nx8 - 60, 146, nx8 + 20, 145, nx8 + 95, 152); ctx.stroke(); ctx.restore();
    // steam off the rice
    for (var st = 0; st < 3; st++) {
      var su8 = ((lt * 0.6 + st / 3) % 1);
      ctx.strokeStyle = "rgba(255,255,255," + (0.22 * Math.sin(su8 * Math.PI)).toFixed(3) + ")"; ctx.lineWidth = 5;
      var sx8 = nx8 - 40 + st * 40, sy8 = 150 - su8 * 80;
      ctx.beginPath(); ctx.moveTo(sx8, sy8 + 30); ctx.bezierCurveTo(sx8 + 12, sy8 + 15, sx8 - 12, sy8, sx8 + Math.sin(lt * 3 + st) * 8, sy8 - 15); ctx.stroke();
    }
    // a petal floating down to land beside it
    var pu = ssuEase((lt - 0.1) / 0.8), ppx = nx8 + 150 - pu * 20 + Math.sin(lt * 5) * 14 * (1 - pu), ppy = 20 + pu * 180;
    ctx.save(); ctx.translate(ppx, ppy); ctx.rotate(lt * 2 * (1 - pu) + 0.4); ctx.scale(1, pu >= 1 ? 0.55 : 0.6 + 0.4 * Math.abs(Math.sin(lt * 4)));
    ctx.fillStyle = "#f6b8c8"; ctx.beginPath(); ctx.moveTo(0, -9); ctx.quadraticCurveTo(8, -2, 0, 9); ctx.quadraticCurveTo(-8, -2, 0, -9); ctx.fill(); ctx.restore();
    // the logo: the red stamp slams on, the name, the line
    var lx = ww * 0.64, sp = ssuFade(lt, 0.35, 0.12);
    ctx.save(); ctx.globalAlpha *= ssuFade(lt, 0.2, 0.4);
    stillText("SAMURAI", lx, 92, 50, SSU_CREAM, ww * 0.36, { face: SSU_SERIF, weight: "700", glow: "rgba(255,180,120,0.35)" });
    stillText("S  U  S  H  I", lx, 130, 24, SSU_CREAM, ww * 0.3, { face: SSU_SERIF, weight: "400" });
    ctx.restore();
    if (sp > 0) {
      var ss = 1.8 - 0.8 * ssuOut(sp);
      ctx.save(); ctx.translate(lx + ww * 0.17, 74); ctx.rotate(0.12); ctx.scale(ss, ss); ctx.globalAlpha *= Math.min(1, sp * 2);
      ctx.fillStyle = SSU_RED; stillRoundRect(-19, -19, 38, 38, 5); ctx.fill();
      ctx.strokeStyle = "#f8e9e0"; ctx.lineWidth = 2; stillRoundRect(-15, -15, 30, 30, 3); ctx.stroke();
      // a slash and a sun, in the stamp
      ctx.fillStyle = "#f8e9e0"; ctx.beginPath(); ctx.arc(0, 0, 7, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = SSU_RED; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-11, 9); ctx.lineTo(11, -9); ctx.stroke();
      ctx.restore();
    }
    var tag = "Sliced by a samurai. Served in seconds.", nt = Math.min(tag.length, Math.floor((lt - 0.6) * 60));
    if (nt > 0) stillText(tag.slice(0, nt), lx, 168, 15, "#d9cbb0", ww * 0.42, { face: SSU_SERIF, weight: "italic 400" });
  }
}

function drawSamuraiSushiJumbo(x, y, w, h) {
  if (SSU.show <= 0 || SSU.paused || !balls || !balls[SSU.id]) return;
  var t = SSU.t, jiri = balls[SSU.id], ch = jiri.baseChar || jiri.char;
  ssuFrame(x, y, w, h, t, ssuLook(ch), ch.name, Math.min(1, t / 0.15, SSU.show / 0.4));
}
// One frame of the ad at time t.
function ssuFrame(x, y, w, h, t, look, name, alpha) {
  var s = h / 250, ww = w / s;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
  ctx.fillStyle = "#000000"; ctx.fillRect(x, y, w, h);
  ctx.translate(x, y); ctx.scale(s, s);
  var i = 0; while (i < SSU_CUTS.length - 2 && t >= SSU_CUTS[i + 1]) i++;
  var lt = t - SSU_CUTS[i];
  ctx.save();
  ssuShot(i, ww, t, lt, look, name);
  ctx.restore();
  // a dip to black on every cut (the dash cuts on its white flash instead)
  var into = lt, outOf = SSU_CUTS[i + 1] - t, dip = 0;
  if (i > 0 && i !== 5) dip = Math.max(dip, 1 - into / 0.07);
  if (i < SSU_CUTS.length - 2 && i !== 4) dip = Math.max(dip, 1 - outOf / 0.07);
  if (dip > 0) { ctx.fillStyle = "rgba(0,0,0," + Math.min(1, dip).toFixed(3) + ")"; ctx.fillRect(0, 0, ww, 250); }
  if (i === 4 && lt > 0.33) { var fl = lt < 0.4 ? 1 : 1 - (lt - 0.4) / 0.25; if (fl > 0) { ctx.fillStyle = "rgba(255,255,255," + fl.toFixed(3) + ")"; ctx.fillRect(0, 0, ww, 250); } }
  // film grain, a vignette and the letterbox
  var fr = Math.floor(t * 24);
  ctx.fillStyle = "rgba(255,255,255,0.06)";
  for (var g = 0; g < 90; g++) ctx.fillRect(ssuR(fr * 131 + g) * ww, ssuR(fr * 71 + g + 500) * 250, 1.4, 1.4);
  ctx.fillStyle = "rgba(0,0,0,0.08)";
  for (var g2 = 0; g2 < 60; g2++) ctx.fillRect(ssuR(fr * 37 + g2 + 900) * ww, ssuR(fr * 53 + g2 + 1300) * 250, 1.6, 1.6);
  var vg = ctx.createRadialGradient(ww / 2, 125, 90, ww / 2, 125, ww * 0.62);
  vg.addColorStop(0, "rgba(0,0,0,0)"); vg.addColorStop(1, "rgba(0,0,0,0.6)");
  ctx.fillStyle = vg; ctx.fillRect(0, 0, ww, 250);
  var bar = 20 * Math.min(1, t / 0.4);
  ctx.fillStyle = "#000000"; ctx.fillRect(0, 0, ww, bar); ctx.fillRect(0, 250 - bar, ww, bar);
  if (i === 0) { // ONE FISH. ONE SAMURAI.
    ssuTitle("ONE FISH.", ww * 0.2, 84, 22, SSU_CREAM, ssuFade(lt, 0.45, 0.4) * (1 - ssuFade(lt, 1.95, 0.2)), 240);
    ssuTitle("ONE SAMURAI.", ww * 0.8, 84, 22, SSU_CREAM, ssuFade(lt, 1.15, 0.4) * (1 - ssuFade(lt, 1.95, 0.2)), 280);
  }
  if (i === 2) { // a film credit on his close-up
    ssuTitle("STARRING", ww * 0.16, 186, 9, "#9aa7b8", ssuFade(lt, 0.3, 0.4) * (1 - ssuFade(lt, 1.2, 0.2)), 200);
    ssuTitle("JIŘÍ PROCHÁZKA", ww * 0.16, 202, 15, SSU_CREAM, ssuFade(lt, 0.4, 0.4) * (1 - ssuFade(lt, 1.2, 0.2)), 260);
  }
  if (t > 9.8) {
    ctx.save(); ctx.globalAlpha *= ssuFade(t, 10.4, 0.4);
    stillText("*Parody. Not a real restaurant. Please don't let a fighter near your fish with a sword.", ww / 2, 240, 8, "#7d7d7d", ww * 0.9, { face: "'Helvetica Neue', Helvetica, Arial, sans-serif", weight: "600" });
    ctx.restore();
  }
  ctx.restore();
}
function drawSamuraiSushiBanner() {
  if (SSU.show <= 0 || stadiumOn()) return;
  drawSamuraiSushiJumbo(10, 10, W - 20, 110);
}

// The still for the random rotation: an omakase poster. A row of nigiri on
// the slate, Jiří with his sword sheathed, the logo and the line.
function drawSamuraiSushiStill(x, y, w, h, k, ch) {
  var s = h / 250, ww = w / s, look = ssuLook(ch), name = (ch && ch.name) || "";
  ctx.save();
  ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
  ctx.translate(x, y); ctx.scale(s, s);
  ssuDojo(ww, 1, 1, ww * 0.68);
  ssuLantern(ww * 0.68, 48, 0.9, 0.5);
  ssuMist(ww, 3, 190, 1);
  ctx.fillStyle = "#16181b"; stillRoundRect(ww * 0.03, 168, ww * 0.5, 50, 8); ctx.fill();
  for (var n = 0; n < 4; n++) ssuNigiri(ww * 0.08 + n * ww * 0.12, 186, 78, {});
  ssuJiri(ww * 0.86, 160, 66, look, name, { sheathed: true });
  stillText("SAMURAI", ww * 0.28, 70, 46, SSU_CREAM, ww * 0.4, { face: SSU_SERIF, weight: "700", glow: "rgba(255,180,120,0.35)" });
  stillText("S  U  S  H  I", ww * 0.28, 106, 22, SSU_CREAM, ww * 0.34, { face: SSU_SERIF, weight: "400" });
  ctx.save(); ctx.translate(ww * 0.43, 50); ctx.rotate(0.12);
  ctx.fillStyle = SSU_RED; stillRoundRect(-17, -17, 34, 34, 5); ctx.fill();
  ctx.strokeStyle = "#f8e9e0"; ctx.lineWidth = 2; stillRoundRect(-13, -13, 26, 26, 3); ctx.stroke();
  ctx.fillStyle = "#f8e9e0"; ctx.beginPath(); ctx.arc(0, 0, 6, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = SSU_RED; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-10, 8); ctx.lineTo(10, -8); ctx.stroke();
  ctx.restore();
  stillText("Sliced by a samurai. Served in seconds.", ww * 0.28, 140, 14, "#d9cbb0", ww * 0.42, { face: SSU_SERIF, weight: "italic 400" });
  stillText("OMAKASE  ·  ONE CUT", ww * 0.62, 226, 11, "#9aa7b8", ww * 0.3, { face: SSU_SERIF, weight: "400" });
  ssuPetals(ww, 2.2, 12, 1, 5, 0.9);
  var vg = ctx.createRadialGradient(ww / 2, 125, 90, ww / 2, 125, ww * 0.62);
  vg.addColorStop(0, "rgba(0,0,0,0)"); vg.addColorStop(1, "rgba(0,0,0,0.5)");
  ctx.fillStyle = vg; ctx.fillRect(0, 0, ww, 250);
  ctx.restore();
}

// ---------------------------------------------------------------- sound
function playSamuraiSushiCue(name, len) {
  try {
    var ac = getAudioCtx(); if (!ac) return;
    if (ac.state === "suspended") ac.resume();
    if (!SSU.out) { SSU.out = ac.createGain(); SSU.out.gain.value = 0.7; SSU.out.connect(ac.destination); }
    if (!SSU.nb || SSU.nb.sampleRate !== ac.sampleRate) SSU.nb = makeNoiseBuffer(ac, 2);
    var out = SSU.out, now = ac.currentTime + 0.02;
    var tone = function (f0, f1, at, dur, vol, type) {
      var o = ac.createOscillator(), g = ac.createGain();
      o.type = type || "sine"; o.frequency.setValueAtTime(f0, at); if (f1 && f1 !== f0) o.frequency.exponentialRampToValueAtTime(f1, at + dur);
      g.gain.setValueAtTime(0.0001, at); g.gain.exponentialRampToValueAtTime(vol, at + 0.004); g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
      o.connect(g); g.connect(out); o.start(at); o.stop(at + dur + 0.05);
    };
    var noise = function (at, dur, vol, freq, q, type, f1, attack) {
      var n = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain();
      n.buffer = SSU.nb; n.loop = true; f.type = type || "bandpass"; f.frequency.setValueAtTime(freq, at); if (f1) f.frequency.exponentialRampToValueAtTime(f1, at + dur); f.Q.value = q || 1;
      g.gain.setValueAtTime(0.0001, at); g.gain.exponentialRampToValueAtTime(vol, at + (attack || 0.003)); g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
      n.connect(f); f.connect(g); g.connect(out); n.start(at); n.stop(at + dur + 0.05);
    };
    var taiko = function (at, v) { tone(110, 42, at, 0.9, 0.55 * v); tone(180, 70, at, 0.35, 0.18 * v, "triangle"); noise(at, 0.12, 0.5 * v, 260, 0.9); };
    var koto = function (f, at, v) { tone(f * 1.015, f, at, 1.3, 0.12 * v, "triangle"); tone(f * 2, f * 2, at, 0.5, 0.04 * v); noise(at, 0.02, 0.06 * v, 3000, 2); };
    if (name === "boom") taiko(now, 1);
    if (name === "wind") noise(now, len || 5.8, 0.05, 380, 0.6, "lowpass", 700, 1.2);
    if (name === "flute") { // a breathy shakuhachi note bending up into pitch
      var f = 587, d = 2.3, fl = ac.createGain();
      fl.gain.setValueAtTime(0.0001, now); fl.gain.exponentialRampToValueAtTime(0.13, now + 0.25); fl.gain.setValueAtTime(0.13, now + d - 0.5); fl.gain.exponentialRampToValueAtTime(0.0001, now + d);
      fl.connect(out);
      var lfo = ac.createOscillator(), lg = ac.createGain(); lfo.frequency.value = 5; lg.gain.setValueAtTime(0, now); lg.gain.linearRampToValueAtTime(7, now + 1.1); lfo.connect(lg);
      [[1, 1], [2, 0.16], [3, 0.05]].forEach(function (hm) {
        var o = ac.createOscillator(), g = ac.createGain();
        o.frequency.setValueAtTime(f * 0.94 * hm[0], now); o.frequency.exponentialRampToValueAtTime(f * hm[0], now + 0.35);
        lg.connect(o.frequency); g.gain.value = hm[1]; o.connect(g); g.connect(fl); o.start(now); o.stop(now + d + 0.05);
      });
      lfo.start(now); lfo.stop(now + d + 0.05);
      noise(now, d, 0.04, 1500, 1.4, "bandpass", null, 0.08);
    }
    if (name === "koto") koto(293.66, now, 1);
    if (name === "koto2") { koto(440, now, 1); koto(392, now + 0.16, 0.8); }
    if (name === "shing") { tone(3800, 4300, now, 0.6, 0.11); tone(5600, 5700, now + 0.03, 0.35, 0.05); noise(now, 0.45, 0.12, 7000, 0.8, "highpass"); }
    if (name === "dash") noise(now, 0.28, 0.32, 400, 1.2, "bandpass", 3200);
    if (name === "slash") { noise(now, 0.13, 0.4, 2600, 1.4); tone(1900, 600, now, 0.1, 0.06, "triangle"); }
    if (name === "hit") { taiko(now, 1.4); tone(60, 30, now, 1.4, 0.4); noise(now, 1.4, 0.3, 300, 0.5, "lowpass", 80, 0.01); noise(now, 0.25, 0.25, 5000, 0.6, "highpass"); }
    if (name === "click") { noise(now, 0.025, 0.5, 5200, 3); tone(2600, 2300, now, 0.05, 0.22, "triangle"); tone(1700, 1650, now + 0.012, 0.08, 0.12); }
    if (name === "swish") noise(now, 0.22, 0.14, 1600, 1.2, "bandpass", 900);
    if (name === "tak") { tone(900, 480, now, 0.07, 0.22, "triangle"); noise(now, 0.03, 0.16, 3200, 1.5); }
    if (name === "roll") for (var rl = 0; rl < 12; rl++) taiko(now + rl * 0.075, 0.2 + rl * 0.05);
    if (name === "gong") {
      [[98, 0.4, 3.4], [149, 0.26, 2.8], [199, 0.2, 2.4], [268, 0.14, 2.0], [323, 0.1, 1.6], [404, 0.07, 1.2]].forEach(function (p) { tone(p[0] * 0.99, p[0], now, p[2], p[1]); });
      noise(now, 0.25, 0.3, 300, 0.8);
    }
    if (name === "melody") { // the koto line resolving under the logo
      koto(146.83, now, 1.1);
      [[587.33, 0], [523.25, 0.18], [440, 0.36], [392, 0.6], [440, 0.84], [587.33, 1.1]].forEach(function (nt) { koto(nt[0], now + nt[1], 0.9); });
    }
  } catch (e) { /* no audio */ }
}
function stopSamuraiSushiSound() {
  if (!SSU.out) return;
  try { SSU.out.disconnect(); } catch (e) { /* already gone */ }
  SSU.out = null;
}
