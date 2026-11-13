// Maxx Energy (Joe, 2026-11-13): an energy-drink parody for Max Holloway,
// the man with the most strikes in the game. It runs on the jumbotron (a
// banner in the test arena) as his Button Mash kicks in after the Flashback
// (holloway.js), so once a fight at most.
//   - A black can with his teal, a red-and-blue hibiscus wrap (Waianae,
//     Hawaii) and the MAXX logo, slammed down, cracked open: PSSHT.
//   - Max grabs it, chugs it (GLUG GLUG GLUG), smashes the empty can on his
//     own head (CRUNCH!), throws it away and flexes. Only his own two arms.
//   - Then a flurry while a strike counter races up to
//     445 (his real UFC record for significant strikes in one fight,
//     against Calvin Kattar in 2021).
//   - MAXX ENERGY. MAX VOLUME. "Zero sugar. Zero breaks."
//   - Sound: the can cracking, fizz, a bass hit, gulps, the crunch, a
//     whoosh and a far-off clang, a riser and the counter ticking.
// It goes through queueJumboAd like every ad, so it never overlaps another.
// Plus a silent still for the random rotation (drawMaxxStill), and
// drawMaxxCan for anywhere else a can is wanted.
"use strict";

var MAXX_SHOW = 10.0;
var MAXX_TEAL = "#16c2b0", MAXX_RED = "#e3173d", MAXX_BLUE = "#1a4fd6";
var maxxShow = 0, maxxId = 0, maxxDone = false, maxxOut = null;

function resetMaxxAd() { maxxShow = 0; maxxDone = false; stopMaxxSound(); }
// From startMash (holloway.js): his Button Mash, right after the Flashback.
function maxxOnMash(b) {
  if (maxxDone || (typeof galleryDemo !== "undefined" && galleryDemo)) return;
  maxxDone = true;
  queueJumboAd(MAXX_SHOW, function () { maxxShow = MAXX_SHOW; maxxId = b.id; playMaxxSound(); }, b);
}
// Every frame, from tickAdBreaks (ad-breaks.js).
function tickMaxxAd(dt) { if (maxxShow > 0) maxxShow = Math.max(0, maxxShow - dt); }

// The MAXX wordmark: heavy italic letters, the two Xs crossed like lightning.
function maxxLogo(cx, cy, size, k, glow) {
  ctx.save();
  ctx.translate(cx, cy); ctx.transform(1, 0, -0.18, 1, 0, 0);
  ctx.font = "900 " + size + "px Impact, 'Arial Black', sans-serif";
  ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.lineJoin = "round";
  if (glow) { ctx.shadowColor = glow; ctx.shadowBlur = size * 0.35; }
  ctx.lineWidth = size * 0.14; ctx.strokeStyle = "#05070a"; ctx.strokeText("MA", -size * 0.5, 0);
  ctx.fillStyle = "#ffffff"; ctx.fillText("MA", -size * 0.5, 0);
  ctx.shadowBlur = 0;
  // XX in teal and red, overlapping.
  ctx.lineWidth = size * 0.14;
  ctx.strokeText("X", size * 0.5, 0); ctx.fillStyle = MAXX_TEAL; ctx.fillText("X", size * 0.5, 0);
  ctx.strokeText("X", size * 0.98, 0); ctx.fillStyle = MAXX_RED; ctx.fillText("X", size * 0.98, 0);
  ctx.restore();
}

// A hibiscus flower (his shorts' print) for the can wrap.
function maxxHibiscus(x, y, r, col, rot) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot || 0);
  ctx.fillStyle = col;
  for (var i = 0; i < 5; i++) {
    ctx.rotate(Math.PI * 2 / 5);
    ctx.beginPath(); ctx.ellipse(0, -r * 0.55, r * 0.42, r * 0.6, 0, 0, Math.PI * 2); ctx.fill();
  }
  ctx.fillStyle = "#ffd23f"; ctx.beginPath(); ctx.arc(0, 0, r * 0.18, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

// The can, standing on (cx, base), h tall. opts.open pops the tab.
function drawMaxxCan(cx, base, h, k, opts) {
  opts = opts || {};
  var w = h * 0.42, top = base - h, rimH = h * 0.06;
  ctx.save();
  if (opts.tilt) { ctx.translate(cx, base); ctx.rotate(opts.tilt); ctx.translate(-cx, -base); }
  if (!opts.noShadow) { ctx.fillStyle = "rgba(0,0,0,0.35)"; ctx.beginPath(); ctx.ellipse(cx, base, w * 0.6, h * 0.04, 0, 0, Math.PI * 2); ctx.fill(); }
  // Body.
  ctx.beginPath();
  ctx.moveTo(cx - w / 2, top + rimH * 1.4);
  ctx.lineTo(cx - w / 2, base - rimH);
  ctx.quadraticCurveTo(cx - w / 2, base, cx - w * 0.38, base);
  ctx.lineTo(cx + w * 0.38, base);
  ctx.quadraticCurveTo(cx + w / 2, base, cx + w / 2, base - rimH);
  ctx.lineTo(cx + w / 2, top + rimH * 1.4);
  ctx.quadraticCurveTo(cx + w / 2, top + rimH * 0.6, cx + w * 0.4, top + rimH * 0.5);
  ctx.lineTo(cx - w * 0.4, top + rimH * 0.5);
  ctx.quadraticCurveTo(cx - w / 2, top + rimH * 0.6, cx - w / 2, top + rimH * 1.4);
  ctx.closePath();
  ctx.fillStyle = "#0b0d12"; ctx.fill();
  ctx.save(); ctx.clip();
  // Hibiscus wrap and a teal lightning stripe.
  var fl = [[-0.3, 0.3, MAXX_RED, 0.3], [0.32, 0.22, MAXX_BLUE, 1.1], [0.18, 0.8, MAXX_RED, 2.0], [-0.28, 0.9, MAXX_BLUE, 0.6]];
  fl.forEach(function (f) { ctx.globalAlpha = 0.55; maxxHibiscus(cx + f[0] * w, top + f[1] * h, w * 0.32, f[2], f[3]); });
  ctx.globalAlpha = 1;
  ctx.fillStyle = MAXX_TEAL;
  ctx.beginPath();
  ctx.moveTo(cx - w * 0.6, top + h * 0.62); ctx.lineTo(cx + w * 0.1, top + h * 0.5); ctx.lineTo(cx - w * 0.02, top + h * 0.58);
  ctx.lineTo(cx + w * 0.6, top + h * 0.46); ctx.lineTo(cx + w * 0.6, top + h * 0.52); ctx.lineTo(cx + w * 0.06, top + h * 0.64);
  ctx.lineTo(cx + w * 0.16, top + h * 0.56); ctx.lineTo(cx - w * 0.6, top + h * 0.68); ctx.closePath(); ctx.fill();
  // Shading: dark edges, a bright stripe of shine.
  var sh = ctx.createLinearGradient(cx - w / 2, 0, cx + w / 2, 0);
  sh.addColorStop(0, "rgba(0,0,0,0.55)"); sh.addColorStop(0.28, "rgba(255,255,255,0.18)"); sh.addColorStop(0.36, "rgba(255,255,255,0.02)");
  sh.addColorStop(0.75, "rgba(0,0,0,0.1)"); sh.addColorStop(1, "rgba(0,0,0,0.6)");
  ctx.fillStyle = sh; ctx.fillRect(cx - w, top, w * 2, h);
  ctx.restore();
  // Logo, standing up the can.
  ctx.save(); ctx.translate(cx, top + h * 0.33); ctx.rotate(-Math.PI / 2);
  maxxLogo(-w * 0.18, 0, w * 0.55, k);
  ctx.restore();
  ctx.save(); ctx.translate(cx + w * 0.3, top + h * 0.33); ctx.rotate(-Math.PI / 2);
  stillText("ENERGY", 0, 0, w * 0.15, MAXX_TEAL, h * 0.4, { weight: "900" });
  ctx.restore();
  stillText("MAX VOLUME", cx, top + h * 0.78, w * 0.14, "#ffffff", w * 0.85, { weight: "900" });
  stillText("ZERO SUGAR", cx, top + h * 0.86, w * 0.1, "#9aa3ad", w * 0.8, { face: "'Helvetica Neue', Helvetica, Arial, sans-serif", weight: "800" });
  // Top rim and lid.
  var lid = ctx.createLinearGradient(cx - w / 2, 0, cx + w / 2, 0);
  lid.addColorStop(0, "#7c858f"); lid.addColorStop(0.4, "#eef2f6"); lid.addColorStop(1, "#6b737c");
  ctx.fillStyle = lid; ctx.strokeStyle = "#3d444c"; ctx.lineWidth = 1.2 * k;
  ctx.beginPath(); ctx.ellipse(cx, top + rimH * 0.6, w * 0.42, rimH * 0.6, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = "#aab2bb";
  if (opts.open) { ctx.fillStyle = "#1a1d22"; ctx.beginPath(); ctx.ellipse(cx + w * 0.08, top + rimH * 0.6, w * 0.1, rimH * 0.28, 0, 0, Math.PI * 2); ctx.fill(); }
  ctx.fillStyle = "#c9d0d8"; ctx.strokeStyle = "#4b525a";
  stillRoundRect(cx - w * 0.14, top + rimH * 0.35 - (opts.open ? rimH * 0.5 : 0), w * 0.16, rimH * 0.45, rimH * 0.2); ctx.fill(); ctx.stroke(); // the tab
  // Bottom rim.
  ctx.fillStyle = lid; ctx.beginPath(); ctx.ellipse(cx, base - rimH * 0.3, w * 0.38, rimH * 0.35, 0, 0, Math.PI); ctx.fill();
  ctx.restore();
}

function maxxBg(x, y, w, h, t, k) {
  var bg = ctx.createRadialGradient(x + w * 0.45, y + h * 0.5, h * 0.1, x + w * 0.45, y + h * 0.5, w * 0.6);
  bg.addColorStop(0, "#14303a"); bg.addColorStop(0.6, "#0a1218"); bg.addColorStop(1, "#05070a");
  ctx.fillStyle = bg; ctx.fillRect(x, y, w, h);
  // Speed lines rushing out from the can.
  ctx.save(); ctx.translate(x + w * 0.45, y + h * 0.55);
  for (var i = 0; i < 26; i++) {
    var a = i / 26 * Math.PI * 2 + 0.1, p = (t * 1.8 + i * 0.37) % 1;
    ctx.strokeStyle = i % 3 ? "rgba(22,194,176," + (0.35 * (1 - p)) + ")" : "rgba(227,23,61," + (0.35 * (1 - p)) + ")";
    ctx.lineWidth = 3 * k;
    ctx.beginPath(); ctx.moveTo(Math.cos(a) * (h * 0.4 + p * w * 0.4), Math.sin(a) * (h * 0.4 + p * w * 0.4));
    ctx.lineTo(Math.cos(a) * (h * 0.4 + p * w * 0.4 + 40 * k), Math.sin(a) * (h * 0.4 + p * w * 0.4 + 40 * k)); ctx.stroke();
  }
  ctx.restore();
}

// The ad's beats (seconds in): the can flies into his glove, he chugs it,
// smashes it on his head, throws it away, flexes, then the flurry and MAX
// VOLUME.
var MX_GRAB = 1.0, MX_CHUG = 1.45, MX_SMASH = 3.1, MX_THROW = 3.55, MX_FLEX = 3.8, MX_FLURRY = 5.1, MX_VOLUME = 7.7;
function maxxLerp(a, b, u) { return a + (b - a) * u; }
function maxxMix(p, q, u) {
  var o = { x: maxxLerp(p.x, q.x, u), y: maxxLerp(p.y, q.y, u), a: maxxLerp(p.a, q.a, u) };
  if (p.elbow || q.elbow) {
    var pe = p.elbow || { x: p.x, y: p.y }, qe = q.elbow || { x: q.x, y: q.y };
    o.elbow = { x: maxxLerp(pe.x, qe.x, u), y: maxxLerp(pe.y, qe.y, u) };
  }
  if (p.bicep || q.bicep) o.bicep = maxxLerp(p.bicep || 0, q.bicep || 0, u);
  return o;
}
function maxxSeg(t, a, b) { var u = Math.min(1, Math.max(0, (t - a) / (b - a))); return u * u * (3 - 2 * u); }
// Where his two gloves, the can and his body are at time t. Only his own
// two arms: fg is the front (right) glove, bg the back (left) one.
function maxxPose(t, mx, my, mr, hero, x, y, w, h) {
  var guardF = { x: mx + mr * 0.95, y: my - mr * 0.32, a: -0.5 }, guardB = { x: mx + mr * 0.95, y: my + mr * 0.32, a: 0.3 };
  var hip = { x: mx - mr * 1.0, y: my + mr * 0.45, a: 2.6, elbow: { x: mx - mr * 1.25, y: my - mr * 0.05 } };
  var hold = { x: mx + mr * 1.35, y: my - mr * 0.15, a: -0.2 };
  var chug = { x: mx + mr * 0.78, y: my - mr * 1.18, a: -2.2, elbow: { x: mx + mr * 1.5, y: my - mr * 0.5 } };
  var ch = mr * 1.1, crushT = Math.min(1, Math.max(0, (t - MX_SMASH) / 0.06));
  var headTop = { x: mx + mr * 0.05, y: my - mr * 1.04 };
  var canTh = ch * 0.42 * (1 - 0.5 * crushT); // lying across the top of his head, flattened by the hit
  var smash = { x: headTop.x, y: headTop.y - canTh - mr * 0.24, a: Math.PI / 2, elbow: { x: mx + mr * 1.35, y: my - mr * 1.0 } };
  var wind = { x: mx + mr * 0.45, y: my - mr * 1.45, a: -1.2, elbow: { x: mx + mr * 1.4, y: my - mr * 1.1 } };
  var thrown = { x: mx + mr * 1.75, y: my - mr * 0.75, a: -0.4 };
  var flexF = { x: mx + mr * 1.12, y: my - mr * 0.98, a: -2.0, elbow: { x: mx + mr * 1.52, y: my - mr * 0.12 }, bicep: 1 };
  var flexB = { x: mx - mr * 1.12, y: my - mr * 0.98, a: -1.14, elbow: { x: mx - mr * 1.52, y: my - mr * 0.12 }, bicep: 1 };
  var p = { fg: guardF, bg: guardB, can: null, canBack: false, lean: 0, squash: 1 };
  var pulse = 0.75 + 0.25 * Math.sin(t * 9);
  if (t < MX_GRAB) return p;
  if (t < MX_GRAB + 0.3) { // the can flies into his glove
    var u = maxxSeg(t, MX_GRAB, MX_GRAB + 0.3);
    p.fg = maxxMix(guardF, hold, Math.min(1, u * 1.6));
    p.can = { x: maxxLerp(hero.x, hold.x, u), y: maxxLerp(hero.y, hold.y, u), h: maxxLerp(hero.h, ch, u), rot: 0 };
    p.bg = maxxMix(guardB, hip, u);
    return p;
  }
  p.bg = hip;
  if (t < MX_SMASH - 0.25) { // up to his mouth, then chug
    var r = maxxSeg(t, MX_GRAB + 0.3, MX_CHUG), c = maxxSeg(t, MX_CHUG, MX_SMASH - 0.25);
    p.fg = maxxMix(hold, chug, r);
    if (t > MX_CHUG) p.fg.y += Math.abs(Math.sin((t - MX_CHUG) * Math.PI * 3.2)) * mr * 0.06; // each gulp
    p.can = { x: p.fg.x, y: p.fg.y, h: ch, rot: maxxLerp(0, -2.15, r) - 0.5 * c };
    p.lean = -0.2 * r;
    return p;
  }
  if (t < MX_THROW - 0.2) { // up high, then down on his head: CRUNCH
    var up = maxxSeg(t, MX_SMASH - 0.25, MX_SMASH - 0.07), dn = Math.min(1, Math.max(0, (t - (MX_SMASH - 0.07)) / 0.07));
    var high = { x: smash.x + mr * 0.15, y: smash.y - mr * 0.4, a: Math.PI / 2 - 0.4, elbow: { x: mx + mr * 1.45, y: my - mr * 1.2 } };
    p.fg = t < MX_SMASH - 0.07 ? maxxMix(chug, high, up) : maxxMix(high, smash, dn);
    var rot = t < MX_SMASH - 0.07 ? maxxLerp(-2.65, Math.PI / 2, up) : Math.PI / 2;
    p.can = { x: p.fg.x, y: p.fg.y + mr * 0.24 + canTh / 2, h: ch, rot: rot, crush: crushT };
    if (t >= MX_SMASH) { p.can.y = headTop.y - canTh / 2; p.fg.y = p.can.y - canTh / 2 - mr * 0.24; }
    var hit = t >= MX_SMASH ? Math.max(0, 1 - (t - MX_SMASH) / 0.25) : 0;
    p.squash = 1 - 0.14 * hit * Math.cos((t - MX_SMASH) * 30);
    p.lean = -0.2 * (1 - up);
    return p;
  }
  if (t < MX_THROW) { // wind up with the crushed can
    var wu = maxxSeg(t, MX_THROW - 0.2, MX_THROW - 0.05);
    p.fg = maxxMix(smash, wind, wu);
    p.can = { x: p.fg.x, y: p.fg.y, h: ch, rot: maxxLerp(Math.PI / 2, 0.6, wu), crush: 1 };
    return p;
  }
  if (t < MX_FLEX) { // throw it away, it spins off the top right
    p.fg = maxxMix(wind, thrown, maxxSeg(t, MX_THROW, MX_THROW + 0.12));
    var f = (t - MX_THROW) / 0.55;
    if (f < 1) p.can = { x: wind.x + f * (x + w * 0.85 - wind.x), y: wind.y - f * h * 0.55 + f * f * h * 0.1, h: ch, rot: 0.6 + f * 14, crush: 1, trail: true };
    p.bg = maxxMix(hip, flexB, maxxSeg(t, MX_THROW + 0.12, MX_FLEX));
    p.fg = maxxMix(p.fg, flexF, maxxSeg(t, MX_THROW + 0.15, MX_FLEX));
    return p;
  }
  if (t < MX_FLURRY) { // double biceps
    p.fg = maxxMix(flexF, guardF, maxxSeg(t, MX_FLURRY - 0.15, MX_FLURRY));
    p.bg = maxxMix(flexB, guardB, maxxSeg(t, MX_FLURRY - 0.15, MX_FLURRY));
    if (t < MX_FLURRY - 0.15) { p.fg.bicep = pulse; p.bg.bicep = pulse; }
    p.squash = 1 + 0.03 * Math.sin(t * 9);
    return p;
  }
  p.bg = guardB;
  if (t < MX_VOLUME) { // the flurry
    var ph = (t * 14) % 2, side = ph < 1 ? -1 : 1, ext = Math.sin((ph % 1) * Math.PI);
    p.fg = { x: mx + mr * (0.95 + ext * 0.55), y: my + side * mr * 0.32, a: 0 };
    p.bg = { x: mx + mr * 0.95, y: my - side * mr * 0.32, a: 0 };
  }
  return p;
}
// The can held at its centre, turned `rot`; crush squashes it down its length.
function maxxCanAt(c, k) {
  ctx.save();
  if (c.trail) {
    ctx.strokeStyle = "rgba(255,255,255,0.16)"; ctx.lineWidth = c.h * 0.16; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(c.x - c.h * 0.9, c.y + c.h * 0.6); ctx.lineTo(c.x, c.y); ctx.stroke();
  }
  ctx.translate(c.x, c.y); ctx.rotate(c.rot);
  var cr = c.crush || 0;
  ctx.scale(1 - 0.5 * cr, 1 + 0.06 * cr);
  drawMaxxCan(0, c.h / 2, c.h, k, { open: true, noShadow: true });
  if (cr > 0) { // the dents
    var w = c.h * 0.42;
    ctx.strokeStyle = "rgba(0,0,0," + (0.7 * cr) + ")"; ctx.lineWidth = c.h * 0.05;
    ctx.beginPath(); ctx.moveTo(0, -c.h * 0.42);
    for (var j = 1; j <= 7; j++) ctx.lineTo((j % 2 ? 1 : -1) * w * 0.22, -c.h * 0.42 + j * c.h * 0.12);
    ctx.stroke();
    ctx.strokeStyle = "rgba(255,255,255," + (0.4 * cr) + ")"; ctx.lineWidth = c.h * 0.025;
    ctx.beginPath(); ctx.moveTo(-w * 0.3, -c.h * 0.4); ctx.lineTo(-w * 0.3, c.h * 0.4); ctx.stroke();
  }
  ctx.restore();
}
// The words and bits over the moments: GLUG, CRUNCH, flex shine.
function maxxMoments(t, mx, my, mr, k, pz, x, y, w, h) {
  if (t > MX_CHUG && t < MX_SMASH - 0.25) { // GLUG GLUG GLUG climbing up beside him
    for (var g = 0; g < 3; g++) {
      var gt = t - MX_CHUG - g * 0.42;
      if (gt < 0 || gt > 0.7) continue;
      var pop = 1 + 0.4 * Math.max(0, 1 - gt * 8);
      ctx.save(); ctx.globalAlpha *= Math.min(1, (0.7 - gt) * 4);
      ctx.translate(mx + mr * (1.75 + g * 0.75), my - mr * (0.75 + g * 0.35) - gt * mr * 0.3); ctx.rotate(-0.15 + g * 0.12); ctx.scale(pop, pop);
      stillText("GLUG!", 0, 0, 18 * k, "#bff7ef", 90 * k, { weight: "900", stroke: "#05070a", strokeW: 0.22 });
      ctx.restore();
    }
    // A few drips running off his chin.
    ctx.fillStyle = "#bff7ef";
    for (var d = 0; d < 3; d++) {
      var dp = ((t - MX_CHUG) * 1.6 + d / 3) % 1;
      ctx.globalAlpha = 0.8 * (1 - dp);
      ctx.beginPath(); ctx.arc(mx + mr * (0.55 + d * 0.05), my - mr * 0.7 + dp * mr * 0.9, 2.2 * k, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
  if (t >= MX_SMASH && t < MX_SMASH + 0.6) { // CRUNCH!
    var ct = t - MX_SMASH, hx = mx + mr * 0.05, hy = my - mr * 1.04;
    ctx.save(); ctx.globalAlpha *= Math.min(1, (0.6 - ct) * 4);
    ctx.strokeStyle = "#ffd23f"; ctx.lineWidth = 3 * k;
    for (var i = 0; i < 9; i++) {
      var a = Math.PI + i / 8 * Math.PI, r0 = mr * (0.45 + ct * 1.2), r1 = r0 + mr * 0.3;
      ctx.beginPath(); ctx.moveTo(hx + Math.cos(a) * r0, hy + Math.sin(a) * r0 * 0.7); ctx.lineTo(hx + Math.cos(a) * r1, hy + Math.sin(a) * r1 * 0.7); ctx.stroke();
    }
    var pop = 1 + 0.5 * Math.max(0, 1 - ct * 6);
    ctx.translate(mx + mr * 1.9, y + h * 0.17); ctx.rotate(-0.1); ctx.scale(pop, pop);
    stillText("CRUNCH!", 0, 0, 28 * k, "#ffd23f", 140 * k, { weight: "900", stroke: "#05070a", strokeW: 0.22 });
    ctx.restore();
  }
  if (t > MX_FLEX - 0.1 && t < MX_FLURRY - 0.15) { // shine off the flex
    ctx.save(); ctx.strokeStyle = "rgba(255,255,255,0.75)"; ctx.lineWidth = 2.5 * k;
    [pz.fg, pz.bg].forEach(function (g, i) {
      var e = g.elbow || g, sx = e.x + (i ? -1 : 1) * mr * 0.15, sy = e.y - mr * 0.55;
      for (var j = 0; j < 3; j++) {
        var a2 = -Math.PI / 2 + (j - 1) * 0.6 + (i ? -0.3 : 0.3), l0 = mr * 0.22, l1 = mr * (0.36 + 0.06 * Math.sin(t * 12 + j));
        ctx.beginPath(); ctx.moveTo(sx + Math.cos(a2) * l0, sy + Math.sin(a2) * l0); ctx.lineTo(sx + Math.cos(a2) * l1, sy + Math.sin(a2) * l1); ctx.stroke();
      }
    });
    ctx.restore();
  }
}

function drawMaxxJumbo(x, y, w, h) {
  if (maxxShow <= 0 || !balls || !balls[maxxId]) return;
  var b = balls[maxxId], t = MAXX_SHOW - maxxShow, a = Math.min(1, t / 0.2, maxxShow / 0.4), k = h / 250;
  var sans = "'Helvetica Neue', Helvetica, Arial, sans-serif";
  ctx.save();
  ctx.globalAlpha = a;
  ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
  maxxBg(x, y, w, h, t, k);

  // The can slams down (0.25s), then cracks open at 0.7s with a spray.
  var cx = x + w * 0.45, base = y + h * 0.95, ch = h * 0.86;
  if (t < MX_GRAB) {
    var slam = Math.min(1, t / 0.25), shake = t > 0.25 && t < 0.45 ? Math.sin(t * 90) * 4 * k : 0;
    drawMaxxCan(cx + shake, base - (1 - slam) * h, ch, k, { open: t > 0.7 });
  }
  if (t > 0.7 && t < 1.6) {
    var sp = (t - 0.7) / 0.9;
    ctx.save(); ctx.globalAlpha *= 1 - sp;
    for (var d = 0; d < 16; d++) {
      var da = -Math.PI / 2 + (d / 15 - 0.5) * 1.6, dr = sp * h * 0.45;
      ctx.fillStyle = d % 2 ? "#bff7ef" : "#ffffff";
      ctx.beginPath(); ctx.arc(cx + h * 0.03 + Math.cos(da) * dr, base - ch + Math.sin(da) * dr + sp * sp * h * 0.25, (4 - sp * 2.5) * k, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
    ctx.save(); ctx.globalAlpha *= Math.min(1, (1 - sp) * 2);
    ctx.translate(cx + h * 0.32, y + h * 0.16); ctx.rotate(0.12);
    stillText("PSSHT!", 0, 0, 26 * k, "#ffffff", 120 * k, { weight: "900", stroke: "#05070a", strokeW: 0.22 });
    ctx.restore();
  }

  // Max on the left: grabs the can, chugs it, smashes it on his head,
  // throws it away and flexes, then the flurry with the counter racing to 445.
  var mx = x + w * 0.24, my = y + h * 0.64, mr = h * 0.3;
  var pz = maxxPose(t, mx, my, mr, { x: cx, y: base - ch / 2, h: ch }, x, y, w, h);
  var go = Math.min(1, Math.max(0, (t - MX_FLURRY) / (MX_VOLUME - MX_FLURRY)));
  var count = Math.floor(445 * (go < 1 ? go * go * (3 - 2 * go) : 1));
  var arm = mr * 0.24, skinF = armColor(b.char, 1), skinB = armColor(b.char, -1);
  // His two arms. Most poses: behind the ball, so only the part outside it
  // shows. Flexing: in front, from the edge of the ball, bent at the elbow
  // with the bicep popping.
  function arms(front) {
    [[pz.bg, -1, skinB], [pz.fg, 1, skinF]].forEach(function (g) {
      var p = g[0], flex = (p.bicep || 0) > 0.5;
      if (flex !== front) return;
      if (flex) {
        var e = p.elbow, sh = { x: mx + g[1] * mr * 0.88, y: my - mr * 0.12 };
        strokeLimb(arm, g[2], function () { ctx.moveTo(sh.x, sh.y); ctx.lineTo(e.x, e.y); ctx.lineTo(p.x, p.y); });
        var bx = (sh.x + e.x) / 2, by = (sh.y + e.y) / 2 - arm * 0.35, br = arm * (0.42 + 0.28 * p.bicep);
        ctx.fillStyle = g[2]; ctx.strokeStyle = theme.wall; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.ellipse(bx, by, br * 1.15, br, 0, Math.PI, Math.PI * 2); ctx.fill(); ctx.stroke();
        return;
      }
      var s0 = { x: mx + g[1] * mr * 0.5, y: my + mr * 0.12 };
      var el = p.elbow || { x: (s0.x + p.x) / 2, y: (s0.y + p.y) / 2 };
      strokeLimb(arm, g[2], function () { ctx.moveTo(s0.x, s0.y); ctx.quadraticCurveTo(el.x, el.y, p.x, p.y); });
    });
  }
  arms(false);
  ctx.save();
  ctx.translate(mx, my + mr); ctx.rotate(pz.lean); ctx.scale(1 + (1 - pz.squash) * 0.6, pz.squash); ctx.translate(-mx, -my - mr);
  stillFighter(mx, my, mr, b.char.look, b.char.name);
  ctx.restore();
  arms(true);
  if (pz.can && pz.canBack) maxxCanAt(pz.can, k);
  drawGlove(ctx, pz.bg.x, pz.bg.y, mr * 0.34, b.char.look, "#0b0f12", pz.bg.a);
  if (pz.can && !pz.canBack) maxxCanAt(pz.can, k);
  drawGlove(ctx, pz.fg.x, pz.fg.y, mr * 0.34, b.char.look, "#0b0f12", pz.fg.a);
  maxxMoments(t, mx, my, mr, k, pz, x, y, w, h);
  if (t > MX_FLURRY && t < MX_VOLUME) {
    ctx.strokeStyle = "rgba(255,255,255,0.6)"; ctx.lineWidth = 2 * k;
    for (var s = 0; s < 3; s++) { var sy2 = my + (s - 1) * mr * 0.35; ctx.beginPath(); ctx.moveTo(mx + mr * 1.6, sy2); ctx.lineTo(mx + mr * 2.0, sy2); ctx.stroke(); }
  }
  if (t > MX_FLURRY) {
    var bump = t < MX_VOLUME ? 1 + 0.06 * Math.sin(t * 40) : 1;
    stillText(String(count), mx, y + h * 0.13, 30 * k * bump, count >= 445 ? "#ffd23f" : "#ffffff", w * 0.2, { weight: "900", stroke: "#05070a", strokeW: 0.2, glow: count >= 445 ? "rgba(255,210,63,0.8)" : null });
    stillText(count >= 445 ? "STRIKES. ONE NIGHT." : "STRIKES", mx, y + h * 0.24, 11 * k, MAXX_TEAL, w * 0.22, { face: sans, weight: "900" });
  }

  // The copy on the right.
  var tx = x + w * 0.77, tw = w * 0.38;
  var c1 = Math.min(1, Math.max(0, (t - 0.35) / 0.3));
  if (c1 > 0) {
    ctx.save(); ctx.globalAlpha *= c1;
    var punch = 1 + 0.25 * Math.max(0, 1 - (t - 0.35) * 5);
    ctx.translate(tx, y + h * 0.24); ctx.scale(punch, punch);
    maxxLogo(-29 * k, 0, 58 * k, k, "rgba(22,194,176,0.9)");
    ctx.restore();
    ctx.save(); ctx.globalAlpha *= c1;
    stillText("E N E R G Y", tx, y + h * 0.41, 18 * k, MAXX_TEAL, tw, { weight: "900" });
    ctx.restore();
  }
  var c2 = Math.min(1, Math.max(0, (t - MX_VOLUME) / 0.3));
  if (c2 > 0) {
    ctx.save(); ctx.globalAlpha *= c2;
    ctx.translate(tx, y + h * 0.6); var sc = 1 + 0.3 * Math.max(0, 1 - (t - MX_VOLUME) * 5); ctx.scale(sc, sc);
    stillText("MAX VOLUME.", 0, 0, 38 * k, "#ffffff", tw, { weight: "900", stroke: MAXX_RED, strokeW: 0.12, glow: "rgba(227,23,61,0.6)" });
    ctx.restore();
  }
  var c3 = Math.min(1, Math.max(0, (t - MX_VOLUME - 0.7) / 0.3));
  if (c3 > 0) {
    ctx.save(); ctx.globalAlpha *= c3;
    stillText("Zero sugar. Zero breaks.", tx, y + h * 0.76, 16 * k, "#cfd6dd", tw, { face: sans, weight: "italic 700" });
    stillText("BLESSED BY MAX HOLLOWAY • WAIANAE, HAWAII", tx, y + h * 0.88, 11 * k, MAXX_TEAL, tw, { face: sans, weight: "800" });
    ctx.restore();
  }
  ctx.strokeStyle = MAXX_TEAL; ctx.lineWidth = 3 * k; ctx.strokeRect(x + 2 * k, y + 2 * k, w - 4 * k, h - 4 * k);
  ctx.restore();
}
function drawMaxxBanner() {
  if (maxxShow <= 0 || stadiumOn()) return;
  drawMaxxJumbo(10, 10, W - 20, 110);
}

// ---------------------------------------------------------------- still version
// The silent still (in the still-ad rotation, still-ads.js): game night.
// An old CRT TV glowing teal on the left, a controller and the can on the
// rug, and Max on the right. GAME ON. MAXX ON.
function drawMaxxStill(x, y, w, h, k, ch) {
  var sans = "'Helvetica Neue', Helvetica, Arial, sans-serif";
  ctx.fillStyle = "#0b0f16"; ctx.fillRect(x, y, w, h);
  var glow = ctx.createRadialGradient(x + w * 0.14, y + h * 0.45, 10 * k, x + w * 0.14, y + h * 0.45, w * 0.35);
  glow.addColorStop(0, "rgba(22,194,176,0.35)"); glow.addColorStop(1, "rgba(22,194,176,0)");
  ctx.fillStyle = glow; ctx.fillRect(x, y, w, h);
  // The rug.
  ctx.fillStyle = "#2a1c3a"; ctx.fillRect(x, y + h * 0.82, w, h * 0.18);
  ctx.strokeStyle = "rgba(255,255,255,0.08)"; ctx.lineWidth = 2 * k;
  for (var r = 0; r < 4; r++) { ctx.beginPath(); ctx.moveTo(x, y + h * (0.86 + r * 0.04)); ctx.lineTo(x + w, y + h * (0.86 + r * 0.04)); ctx.stroke(); }
  // The CRT.
  var tvx = x + w * 0.03, tvy = y + h * 0.12, tvw = w * 0.22, tvh = h * 0.68;
  ctx.fillStyle = "#3a3d44"; ctx.strokeStyle = "#16181c"; ctx.lineWidth = 2 * k;
  stillRoundRect(tvx, tvy, tvw, tvh, 10 * k); ctx.fill(); ctx.stroke();
  var sx = tvx + tvw * 0.08, sy = tvy + tvh * 0.08, sw = tvw * 0.7, shh = tvh * 0.72;
  var scr = ctx.createLinearGradient(sx, sy, sx, sy + shh);
  scr.addColorStop(0, "#1b6f69"); scr.addColorStop(1, "#0a2f33");
  ctx.fillStyle = scr; stillRoundRect(sx, sy, sw, shh, 12 * k); ctx.fill();
  stillText("PRESS", sx + sw / 2, sy + shh * 0.38, 13 * k, "#bff7ef", sw * 0.8, { face: "'Courier New', monospace", weight: "900" });
  stillText("START", sx + sw / 2, sy + shh * 0.58, 13 * k, "#bff7ef", sw * 0.8, { face: "'Courier New', monospace", weight: "900" });
  ctx.fillStyle = "rgba(0,0,0,0.25)"; for (var l = 0; l < shh; l += 3 * k) ctx.fillRect(sx, sy + l, sw, 1 * k); // scanlines
  ctx.fillStyle = "#1f2126"; ctx.beginPath(); ctx.arc(tvx + tvw * 0.9, tvy + tvh * 0.3, tvw * 0.04, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(tvx + tvw * 0.9, tvy + tvh * 0.45, tvw * 0.04, 0, Math.PI * 2); ctx.fill();
  // The controller and the can on the rug.
  var gx = x + w * 0.3, gy = y + h * 0.86;
  ctx.fillStyle = "#6b6f78"; ctx.strokeStyle = "#16181c"; ctx.lineWidth = 1.5 * k;
  stillRoundRect(gx - 34 * k, gy - 13 * k, 68 * k, 26 * k, 12 * k); ctx.fill(); ctx.stroke();
  ctx.fillStyle = "#1f2126"; ctx.fillRect(gx - 24 * k, gy - 3 * k, 12 * k, 4 * k); ctx.fillRect(gx - 20 * k, gy - 7 * k, 4 * k, 12 * k);
  ctx.fillStyle = MAXX_RED; ctx.beginPath(); ctx.arc(gx + 16 * k, gy - 2 * k, 4 * k, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = MAXX_BLUE; ctx.beginPath(); ctx.arc(gx + 25 * k, gy - 5 * k, 4 * k, 0, Math.PI * 2); ctx.fill();
  drawMaxxCan(x + w * 0.4, y + h * 0.92, h * 0.72, k, { open: true });
  // The copy.
  var tx = x + w * 0.64, tw = w * 0.3;
  stillText("GAME ON.", tx, y + h * 0.2, 34 * k, "#ffffff", tw, { weight: "900" });
  maxxLogo(tx - 46 * k, y + h * 0.42, 50 * k, k, "rgba(22,194,176,0.9)");
  stillText("ON.", tx + 40 * k, y + h * 0.42, 34 * k, "#ffffff", tw, { weight: "900", align: "left" });
  stillText("MAXX ENERGY • MAX VOLUME • ZERO SUGAR", tx, y + h * 0.6, 12 * k, MAXX_TEAL, tw, { face: sans, weight: "900" });
  stillText("445 strikes in one night. Zero breaks.", tx, y + h * 0.72, 14 * k, "#cfd6dd", tw, { face: sans, weight: "italic 700" });
  // Max on the right.
  stillFighter(x + w * 0.89, y + h * 0.56, h * 0.3, ch.look, ch.name);
  ctx.strokeStyle = MAXX_TEAL; ctx.lineWidth = 3 * k; ctx.strokeRect(x + 2 * k, y + 2 * k, w - 4 * k, h - 4 * k);
}

// Synth sound: the can slamming down, cracking open (PSSHT) and fizzing, a
// deep bass hit with the logo, gulps, the CRUNCH, the throw and a far-off
// clang, a power-chord stab on the flex, the counter ticking up through
// the flurry on a rising riser, and a big hit on MAX VOLUME.
function playMaxxSound() {
  try {
    var ac = getAudioCtx();
    if (!ac) return;
    if (ac.state === "suspended") ac.resume();
    stopMaxxSound();
    var out = maxxOut = ac.createGain(), now = ac.currentTime + 0.03;
    out.gain.value = 0.7; out.connect(ac.destination);
    if (typeof duckMusic === "function") duckMusic(now, now + MAXX_SHOW);
    var nb = ac.createBuffer(1, Math.floor(ac.sampleRate * 1.5), ac.sampleRate), nd = nb.getChannelData(0);
    for (var i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
    function noise(at, len, f, q, vol, type, f2) {
      var s = ac.createBufferSource(), fl = ac.createBiquadFilter(), g = ac.createGain();
      s.buffer = nb; fl.type = type || "bandpass"; fl.frequency.setValueAtTime(f, at); fl.Q.value = q;
      if (f2) fl.frequency.exponentialRampToValueAtTime(f2, at + len);
      g.gain.setValueAtTime(0.0001, at); g.gain.exponentialRampToValueAtTime(vol, at + Math.min(0.01, len / 5));
      g.gain.exponentialRampToValueAtTime(0.0001, at + len);
      s.connect(fl); fl.connect(g); g.connect(out); s.start(at); s.stop(at + len + 0.02);
    }
    function boom(at, f, len, vol) {
      var o = ac.createOscillator(), g = ac.createGain();
      o.frequency.setValueAtTime(f, at); o.frequency.exponentialRampToValueAtTime(f * 0.35, at + len);
      g.gain.setValueAtTime(0.0001, at); g.gain.exponentialRampToValueAtTime(vol, at + 0.006); g.gain.exponentialRampToValueAtTime(0.0001, at + len);
      o.connect(g); g.connect(out); o.start(at); o.stop(at + len + 0.05);
    }
    boom(now + 0.25, 140, 0.3, 0.6); noise(now + 0.25, 0.12, 2500, 1, 0.4); // the can slams down (a metal clunk)
    noise(now + 0.7, 0.05, 3000, 2, 0.6); // the tab cracks
    noise(now + 0.72, 0.6, 5000, 0.6, 0.45, "highpass"); // PSSHT
    noise(now + 0.9, 1.2, 7000, 0.8, 0.08, "highpass"); // fizz
    boom(now + 0.35, 60, 0.8, 0.5); // bass hit with the logo
    // The can whooshes into his glove.
    noise(now + MX_GRAB, 0.3, 600, 1.2, 0.25, "bandpass", 2400);
    // Chugging: low gulps, each one sliding down.
    for (var gp = 0; gp < 5; gp++) {
      var ga = now + MX_CHUG + 0.1 + gp * 0.28, go = ac.createOscillator(), gg2 = ac.createGain();
      go.type = "sine"; go.frequency.setValueAtTime(260, ga); go.frequency.exponentialRampToValueAtTime(95, ga + 0.12);
      gg2.gain.setValueAtTime(0.0001, ga); gg2.gain.exponentialRampToValueAtTime(0.5, ga + 0.015); gg2.gain.exponentialRampToValueAtTime(0.0001, ga + 0.16);
      go.connect(gg2); gg2.connect(out); go.start(ga); go.stop(ga + 0.2);
      noise(ga, 0.08, 500, 2, 0.12);
    }
    // CRUNCH: the can folding on his head, a thump through his skull.
    noise(now + MX_SMASH, 0.09, 3500, 1.2, 0.7); noise(now + MX_SMASH + 0.03, 0.12, 1800, 1.5, 0.5);
    noise(now + MX_SMASH + 0.07, 0.1, 2600, 2, 0.35); boom(now + MX_SMASH, 110, 0.35, 0.7);
    // The throw, and the can clanging somewhere far off.
    noise(now + MX_THROW, 0.35, 500, 1, 0.35, "bandpass", 3000);
    [1480, 2210, 3170].forEach(function (f, i) { var co = ac.createOscillator(), cg = ac.createGain(), at2 = now + MX_THROW + 0.55;
      co.type = "triangle"; co.frequency.value = f; cg.gain.setValueAtTime(0.0001, at2); cg.gain.exponentialRampToValueAtTime(0.06 / (i + 1), at2 + 0.005);
      cg.gain.exponentialRampToValueAtTime(0.0001, at2 + 0.4); co.connect(cg); cg.connect(out); co.start(at2); co.stop(at2 + 0.45); });
    // The flex: a power-chord stab.
    boom(now + MX_FLEX, 80, 0.6, 0.6);
    [110, 165, 220].forEach(function (f) { var fo = ac.createOscillator(), fg = ac.createGain(), fl2 = ac.createBiquadFilter();
      fo.type = "sawtooth"; fo.frequency.value = f; fl2.type = "lowpass"; fl2.frequency.value = 1400;
      fg.gain.setValueAtTime(0.0001, now + MX_FLEX); fg.gain.exponentialRampToValueAtTime(0.06, now + MX_FLEX + 0.01); fg.gain.exponentialRampToValueAtTime(0.0001, now + MX_FLEX + 0.8);
      fo.connect(fl2); fl2.connect(fg); fg.connect(out); fo.start(now + MX_FLEX); fo.stop(now + MX_FLEX + 0.85); });
    // Riser through the flurry, with the counter ticking.
    var f0 = now + MX_FLURRY, f1 = now + MX_VOLUME, fd = MX_VOLUME - MX_FLURRY;
    var o = ac.createOscillator(), g = ac.createGain(), lp = ac.createBiquadFilter();
    o.type = "sawtooth"; o.frequency.setValueAtTime(110, f0); o.frequency.exponentialRampToValueAtTime(880, f1 - 0.1);
    lp.type = "lowpass"; lp.frequency.setValueAtTime(400, f0); lp.frequency.exponentialRampToValueAtTime(5000, f1 - 0.1);
    g.gain.setValueAtTime(0.0001, f0); g.gain.exponentialRampToValueAtTime(0.07, f1 - 0.5); g.gain.exponentialRampToValueAtTime(0.0001, f1);
    o.connect(lp); lp.connect(g); g.connect(out); o.start(f0); o.stop(f1 + 0.1);
    for (var tk = 0; tk < 40; tk++) {
      var at = f0 + fd * Math.sqrt(tk / 40);
      noise(at, 0.03, 1800 + tk * 40, 3, 0.18);
    }
    // MAX VOLUME: a big hit.
    boom(f1, 90, 0.9, 0.75); noise(f1, 0.5, 1200, 0.5, 0.35);
    [523.25, 659.25, 783.99].forEach(function (f) { var oo = ac.createOscillator(), gg = ac.createGain(); oo.type = "square"; oo.frequency.value = f;
      gg.gain.setValueAtTime(0.0001, f1); gg.gain.exponentialRampToValueAtTime(0.04, f1 + 0.01); gg.gain.exponentialRampToValueAtTime(0.0001, f1 + 0.9);
      oo.connect(gg); gg.connect(out); oo.start(f1); oo.stop(f1 + 1.0); });
  } catch (e) { /* never let audio break the game */ }
}
function stopMaxxSound() {
  if (!maxxOut) return;
  try { maxxOut.disconnect(); } catch (e) { /* already gone */ }
  maxxOut = null;
}
