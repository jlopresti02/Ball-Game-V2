// Salkilld Bakery (Joe, 2026-11-27): Daniel Cormier's snack-cake commercial
// on the jumbotron (a banner in the test arena), a Hostess parody named for
// the parents' bakery meme, with Joe's approved logo (salkilld-art.js). It
// plays once a match, right after his first special (All About That Cake,
// cormier.js): queued as the serving goes down, so it goes up once he's done
// eating. A bright, bouncy 90s snack-cake ad:
//   1. The family bakery at sunrise: striped awning, the logo sign, steam
//      from the chimney, OPEN swinging on the door. FRESH FROM THE FAMILY OVEN.
//   2. The oven: DONE on the display (DING), the door drops open into the
//      golden glow, the tray of creme cakes slides out onto the door and the
//      camera swoops in as the white squiggle pipes itself on.
//   3. DC in a chef's hat and apron, HEAD TASTER: a snack cake up in one
//      glove, rubbing his belly with the other, then CHOMP, crumbs, hearts. MMM!
//   4. The lineup: three boxes bounce onto the counter, SNACK CAKES,
//      CREME CAKES and the NEW! CHICKEN & CAKE.
//   5. The logo bounces in on blue rays: "His parents own a bakery." (Joe's
//      tagline, 2026-11-27).
// v2 (Joe, 2026-11-27: higher quality, especially the oven): the oven is a
// stainless range from Joe's photo with the door dropping open into the glow,
// and every shot got lighting, bokeh, lens flare, a vignette, grain and
// light-leak cuts.
// Only his own two arms and gloves. Code-made sound: a bouncy glockenspiel
// jingle, the oven ding, the tray, the chomp, the box pops, a sparkle. Like
// the Samurai Sushi ad, if a special, clash, lock or cutscene starts while it
// plays it pauses (off the jumbotron, sound stopped, clock held) and finishes
// after. cormier.bakeryAd false in his character file switches it off. Plus a
// silent still for the random rotation (drawSalkilldStill, still-ads.js).
// Drawing helpers shared with samurai-sushi-ad.js (ssuEase, ssuOut, ssuFade,
// ssuR, ssuStar) and cormier-cake-cut.js (dccArm, dccGlove, dccSnack,
// dccDrumstick, dccChicken) are global.
"use strict";

var SKB_SHOW = 11.6;
var SKB_CUTS = [0, 2.4, 4.5, 7.3, 9.3, SKB_SHOW];
var SKB_BLUE = "#1c4fb4", SKB_SKY = "#3fb0ec", SKB_RED = "#d81e30", SKB_CREAM = "#fff6e6";
var SKB_CUES = [["chime", 0.05], ["ding", 2.75], ["door", 2.85], ["tray", 3.28], ["pipe", 3.75], ["pipe", 3.95], ["pipe", 4.15],
  ["pop", 5.0], ["chomp", 5.75], ["chomp", 6.05], ["aww", 6.3], ["pop", 7.45], ["pop", 7.75], ["pop", 8.05], ["sparkle", 8.45],
  ["whoosh", 9.3], ["sparkle", 9.75], ["tag", 9.4]];
var SKB = { show: 0, t: 0, id: 0, done: false, paused: false, cue: 0, out: null, nb: null };

// From startMatchWith (through resetAdBreaks).
function resetSalkilld() { SKB.show = 0; SKB.t = 0; SKB.done = false; SKB.paused = false; SKB.cue = 0; stopSalkilldSound(); }
// From updateCake (cormier.js): his serving's just gone down.
function salkilldOnCake(b) {
  var c = b && b.char && b.char.cormier;
  if (SKB.done || (c && c.bakeryAd === false) || (typeof galleryDemo !== "undefined" && galleryDemo)) return;
  SKB.done = true; SKB.id = b.id; // (once a match)
  queueJumboAd(SKB_SHOW, function () {
    if (over) { jumboAdLeft = 0; return; }
    SKB.show = SKB_SHOW; SKB.t = 0; SKB.cue = 0; SKB.paused = false;
    skbDuck(); skbJingleFrom(0);
  });
}
function skbDuck() {
  try { var ac = getAudioCtx(); if (ac && typeof duckMusic === "function") duckMusic(ac.currentTime, ac.currentTime + SKB.show); } catch (e) { /* no audio */ }
}
// A special, a clash, a lock or a cutscene on: the ad holds.
function salkilldHold() {
  return (typeof jumboHold === "function" && jumboHold(null)) || (typeof sceneLocked === "function" && sceneLocked());
}
// Every frame, from tickAdBreaks (ad-breaks.js).
function tickSalkilld(dt) {
  if (SKB.show <= 0) return;
  if (salkilldHold()) {
    if (!SKB.paused) { SKB.paused = true; stopSalkilldSound(); }
    if (typeof jumboAdLeft !== "undefined" && jumboAdLeft > 0) jumboAdLeft += dt;
    return;
  }
  if (SKB.paused) { SKB.paused = false; skbDuck(); skbJingleFrom(SKB.t); }
  SKB.show = Math.max(0, SKB.show - dt);
  SKB.t = SKB_SHOW - SKB.show;
  while (SKB.cue < SKB_CUES.length && SKB.t >= SKB_CUES[SKB.cue][1]) {
    if (SKB.t - SKB_CUES[SKB.cue][1] < 0.25) playSalkilldCue(SKB_CUES[SKB.cue][0]);
    SKB.cue++;
  }
}

// ---------------------------------------------------------------- helpers
function skbText(txt, x, y, size, col, maxW, o) {
  o = o || {};
  stillText(txt, x, y, size, col, maxW, { face: SKB_FONT, weight: o.weight || "900", stroke: o.stroke, strokeW: o.strokeW || 0.22, glow: o.glow, align: o.align });
}
// Pops in with a little overshoot at `at`.
function skbPop(t, at, len) { var u = Math.max(0, Math.min(1, (t - at) / (len || 0.35))); if (u <= 0) return 0; return 1 + Math.sin(u * Math.PI) * 0.25 * (1 - u); }
function skbHeart(x, y, s, rot, a) {
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y); ctx.rotate(rot || 0); ctx.scale(s / 30, s / 30);
  ctx.beginPath(); ctx.moveTo(0, 30);
  ctx.bezierCurveTo(-34, 6, -40, -22, -18, -28); ctx.bezierCurveTo(-6, -31, 0, -22, 0, -14);
  ctx.bezierCurveTo(0, -22, 6, -31, 18, -28); ctx.bezierCurveTo(40, -22, 34, 6, 0, 30); ctx.closePath();
  ctx.lineWidth = 7; ctx.strokeStyle = "#ffffff"; ctx.stroke();
  ctx.fillStyle = SKB_RED; ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.6)"; ctx.beginPath(); ctx.ellipse(-16, -16, 7, 4, -0.7, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}
function skbRays(cx, cy, R, t, col) {
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(t * 0.25); ctx.fillStyle = col;
  for (var i = 0; i < 16; i++) { ctx.rotate(Math.PI / 8); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(R, -R * 0.11); ctx.lineTo(R, R * 0.11); ctx.closePath(); ctx.fill(); }
  ctx.restore();
}
function skbCloud(x, y, s, a) {
  ctx.save(); ctx.globalAlpha *= a; ctx.fillStyle = "#ffffff";
  [[0, 0, 1], [-0.9, 0.25, 0.7], [0.9, 0.25, 0.75], [-0.4, -0.35, 0.7], [0.45, -0.3, 0.65]].forEach(function (p) {
    ctx.beginPath(); ctx.arc(x + p[0] * s, y + p[1] * s, p[2] * s, 0, Math.PI * 2); ctx.fill();
  });
  ctx.restore();
}
// A golden creme cake (the Twinkie kind) lying on its side, with the white
// squiggle piped along the top as far as `pipe` (0..1).
function skbCreme(x, y, L, pipe, rot) {
  var h = L * 0.36;
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot || 0);
  ctx.fillStyle = "rgba(60,30,10,0.25)"; ctx.beginPath(); ctx.ellipse(0, h * 0.55, L * 0.5, h * 0.18, 0, 0, Math.PI * 2); ctx.fill();
  var g = ctx.createLinearGradient(0, -h / 2, 0, h / 2);
  g.addColorStop(0, "#f8cf6a"); g.addColorStop(0.5, "#e9a63f"); g.addColorStop(1, "#b86a1e");
  ctx.fillStyle = g; ctx.strokeStyle = "#5a2e0e"; ctx.lineWidth = Math.max(1.2, L * 0.03);
  stillRoundRect(-L / 2, -h / 2, L, h, h / 2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = "rgba(255,255,255,0.35)"; ctx.beginPath(); ctx.ellipse(-L * 0.1, -h * 0.24, L * 0.3, h * 0.08, 0, 0, Math.PI * 2); ctx.fill();
  if (pipe > 0) {
    ctx.strokeStyle = "#fffaf0"; ctx.lineWidth = Math.max(1.5, L * 0.05); ctx.lineCap = "round";
    ctx.beginPath(); var x0 = -L * 0.38, x1 = L * 0.38, n = 7, end = x0 + (x1 - x0) * Math.min(1, pipe);
    ctx.moveTo(x0, -h * 0.05);
    for (var i = 1; i <= n * 4; i++) { var xx = x0 + (x1 - x0) * i / (n * 4); if (xx > end) break; ctx.lineTo(xx, -h * 0.05 - Math.sin(i / 4 * Math.PI * 2) * h * 0.16); }
    ctx.stroke();
  }
  ctx.restore();
}
// Crumbs flying off a bite at (x, y), `u` seconds after it.
function skbCrumbs(x, y, u, seed, s) {
  if (u < 0 || u > 0.9) return;
  for (var i = 0; i < 14; i++) {
    var a = -Math.PI * (0.15 + ssuR(seed + i) * 0.9), sp = (40 + ssuR(seed + i + 40) * 80) * s;
    var px = x + Math.cos(a) * sp * u, py = y + Math.sin(a) * sp * u + 160 * s * u * u;
    ctx.fillStyle = i % 3 ? "#5a2e16" : "#f3d9a8";
    ctx.globalAlpha = 1 - u / 0.9; ctx.beginPath(); ctx.arc(px, py, (1.4 + ssuR(seed + i + 80) * 1.6) * s, 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalAlpha = 1;
}
// A chef's hat (toque) on top of the ball.
function skbToque(cx, cy, r) {
  var top = cy - r * 0.86, bw = r * 0.95, bh = r * 0.3;
  ctx.save(); ctx.lineWidth = Math.max(1.5, r * 0.04); ctx.strokeStyle = "#8c96a6"; ctx.fillStyle = "#ffffff";
  // the puffs
  [[-0.32, -0.42, 0.34], [0.32, -0.42, 0.34], [0, -0.58, 0.4]].forEach(function (p) {
    ctx.beginPath(); ctx.arc(cx + p[0] * r, top + p[1] * r, p[2] * r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  });
  ctx.beginPath(); ctx.rect(cx - bw * 0.42, top - r * 0.42, bw * 0.84, r * 0.4); ctx.fill();
  // the band
  ctx.beginPath(); ctx.moveTo(cx - bw / 2, top - bh * 0.5); ctx.quadraticCurveTo(cx, top - bh * 0.75, cx + bw / 2, top - bh * 0.5);
  ctx.lineTo(cx + bw / 2, top + bh * 0.5); ctx.quadraticCurveTo(cx, top + bh * 0.25, cx - bw / 2, top + bh * 0.5); ctx.closePath();
  ctx.fill(); ctx.stroke();
  ctx.strokeStyle = "rgba(140,150,166,0.6)"; ctx.lineWidth = Math.max(1, r * 0.02);
  for (var i = -2; i <= 2; i++) { ctx.beginPath(); ctx.moveTo(cx + i * bw * 0.16, top - bh * 0.35); ctx.lineTo(cx + i * bw * 0.16, top + bh * 0.3); ctx.stroke(); }
  ctx.restore();
}
// The apron over the bottom of the ball, with the heart on the bib.
function skbApron(cx, cy, r) {
  ctx.save();
  ctx.beginPath(); ctx.arc(cx, cy, r * 0.98, 0, Math.PI * 2); ctx.clip();
  ctx.fillStyle = "#ffffff"; ctx.strokeStyle = "#8c96a6"; ctx.lineWidth = Math.max(1.2, r * 0.03);
  ctx.beginPath(); ctx.moveTo(cx - r * 0.42, cy + r * 0.12); ctx.lineTo(cx + r * 0.42, cy + r * 0.12); ctx.lineTo(cx + r * 0.62, cy + r * 1.1); ctx.lineTo(cx - r * 0.62, cy + r * 1.1); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx - r * 0.42, cy + r * 0.14); ctx.lineTo(cx - r * 0.62, cy - r * 0.5); ctx.moveTo(cx + r * 0.42, cy + r * 0.14); ctx.lineTo(cx + r * 0.62, cy - r * 0.5);
  ctx.lineWidth = Math.max(2, r * 0.07); ctx.strokeStyle = "#ffffff"; ctx.stroke();
  ctx.fillStyle = SKB_SKY; ctx.fillRect(cx - r * 0.7, cy + r * 0.62, r * 1.4, r * 0.06);
  ctx.restore();
  skbHeart(cx, cy + r * 0.38, r * 0.17, -0.1, 1);
}
// DC the baker: hat, apron, and his own two arms. o.cake: where the glove
// with the snack cake is ({x, y}, bit: bitten). o.rub: belly-rub angle for
// the other glove (or o.thumb: that glove up).
function skbDc(cx, cy, r, ch, o) {
  o = o || {};
  var b = { char: ch }, look = ch.look || {};
  stillFighter(cx, cy, r, look, ch.name);
  skbApron(cx, cy, r);
  skbToque(cx, cy, r);
  // near arm: belly rub (or a thumbs up)
  var sh1 = { x: cx - r * 0.86, y: cy + r * 0.05 }, h1;
  if (o.thumb) h1 = { x: cx - r * 1.25, y: cy - r * 0.35 };
  else { var ra = o.rub || 0; h1 = { x: cx - r * 0.18 + Math.cos(ra) * r * 0.14, y: cy + r * 0.48 + Math.sin(ra) * r * 0.1 }; }
  var e1 = o.thumb ? { x: cx - r * 1.35, y: cy + r * 0.3 } : { x: cx - r * 0.95, y: cy + r * 0.62 };
  var a1 = dccArm(b, sh1.x, sh1.y, e1.x, e1.y, h1.x, h1.y, r, -1);
  dccGlove(b, h1.x, h1.y, r, a1);
  // far arm: the snack cake
  if (o.cake) {
    var sh2 = { x: cx + r * 0.82, y: cy + r * 0.05 }, h2 = o.cake, e2 = { x: Math.max(h2.x, cx + r * 1.15), y: cy + r * 0.62 };
    var a2 = dccArm(b, sh2.x, sh2.y, e2.x, e2.y, h2.x, h2.y, r, 1);
    dccSnack(h2.x - r * 0.05, h2.y - r * 0.42, r * 0.42, -0.2 + (o.cakeRot || 0));
    dccGlove(b, h2.x, h2.y, r, a2);
  }
}

// ---------------------------------------------------------------- the shots
// Each draws in world units: 250 tall, ww wide.
function skbStore(ww, t, lt) {
  var sky = ctx.createLinearGradient(0, 0, 0, 250);
  sky.addColorStop(0, "#8fd3ff"); sky.addColorStop(0.6, "#ffe0a8"); sky.addColorStop(1, "#ffc27a");
  ctx.fillStyle = sky; ctx.fillRect(-ww, -250, ww * 3, 750);
  ctx.fillStyle = "rgba(255,240,170,0.9)"; ctx.beginPath(); ctx.arc(ww * 0.86, 70, 34, 0, Math.PI * 2); ctx.fill();
  skbRays(ww * 0.86, 70, ww, t, "rgba(255,250,210,0.18)");
  skbCloud(ww * 0.1 + t * 6, 40, 16, 0.9); skbCloud(ww * 0.72 - t * 4, 28, 12, 0.85);
  var half = Math.min(ww * 0.36, 300), L = ww / 2 - half, R = ww / 2 + half;
  // the chimney and its steam
  ctx.fillStyle = "#b5523a"; ctx.fillRect(R - 70, 6, 26, 40);
  ctx.fillStyle = "#8f3e2b"; ctx.fillRect(R - 74, 2, 34, 8);
  for (var p = 0; p < 6; p++) {
    var u = ((t * 0.35 + p / 6) % 1), px = R - 57 + Math.sin(u * 6 + p) * 8 + u * 20, py = 0 - u * 60;
    ctx.fillStyle = "rgba(255,255,255," + (0.75 * (1 - u)).toFixed(3) + ")"; ctx.beginPath(); ctx.arc(px, py, 7 + u * 12, 0, Math.PI * 2); ctx.fill();
  }
  // the building
  ctx.fillStyle = "#f6e3c3"; ctx.fillRect(L, 30, R - L, 200);
  ctx.fillStyle = "rgba(170,120,80,0.18)";
  for (var by = 38; by < 230; by += 12) for (var bx = L + ((by / 12) % 2) * 12; bx < R; bx += 24) ctx.fillRect(bx, by, 22, 1.5);
  ctx.fillStyle = "#e7cfa6"; ctx.fillRect(L - 8, 26, R - L + 16, 10);
  drawSalkilldLogo(ctx, ww / 2, 74, 230);
  // the striped awning, scalloped
  var aw = 128;
  for (var i = 0; i < 14; i++) {
    var x0 = L - 10 + i * (R - L + 20) / 14, x1 = x0 + (R - L + 20) / 14;
    ctx.fillStyle = i % 2 ? "#ffffff" : SKB_SKY;
    ctx.beginPath(); ctx.moveTo(x0 + 6, aw - 8); ctx.lineTo(x1 + 6, aw - 8); ctx.lineTo(x1, aw + 22); ctx.quadraticCurveTo((x0 + x1) / 2, aw + 32, x0, aw + 22); ctx.closePath(); ctx.fill();
  }
  ctx.fillStyle = SKB_BLUE; ctx.fillRect(L - 4, aw - 12, R - L + 18, 5);
  // windows with pastries, and the door
  var wwid = Math.min(170, half - 50);
  [[L + 18, "FRESH DAILY"], [R - 18 - wwid, "FAMILY OWNED"]].forEach(function (w, k) {
    var wx = w[0], wy = 160, wh = 62;
    ctx.fillStyle = "#5d3b22"; ctx.fillRect(wx - 4, wy - 4, wwid + 8, wh + 8);
    var gl = ctx.createLinearGradient(wx, wy, wx + wwid, wy + wh); gl.addColorStop(0, "#fff1c9"); gl.addColorStop(1, "#f3c98a");
    ctx.fillStyle = gl; ctx.fillRect(wx, wy, wwid, wh);
    var nq = Math.floor((wwid - 10) / 34);
    for (var q = 0; q < nq; q++) skbCreme(wx + (wwid - (nq - 1) * 34) / 2 + q * 34, wy + 48, 26, 1, 0);
    for (var q2 = 0; q2 < nq - 1; q2++) dccSnack(wx + (wwid - (nq - 2) * 34) / 2 + q2 * 34, wy + 26, 12, 0);
    skbText(w[1], wx + wwid / 2, wy + 9, 8, "#c98a1e", wwid - 10, { stroke: "rgba(255,255,255,0.7)" });
    ctx.fillStyle = "rgba(255,255,255,0.35)"; ctx.beginPath(); ctx.moveTo(wx + 8, wy); ctx.lineTo(wx + 30, wy); ctx.lineTo(wx + 6, wy + wh); ctx.lineTo(wx - 16 + 16, wy + wh); ctx.closePath(); ctx.fill();
  });
  var dx = ww / 2 - 26;
  ctx.fillStyle = SKB_BLUE; ctx.fillRect(dx, 156, 52, 74);
  ctx.fillStyle = "#cfe9ff"; ctx.fillRect(dx + 8, 164, 36, 30);
  ctx.fillStyle = "#ffcf4a"; ctx.beginPath(); ctx.arc(dx + 44, 200, 3, 0, Math.PI * 2); ctx.fill();
  // OPEN, swinging on its string
  ctx.save(); ctx.translate(ww / 2, 168); ctx.rotate(Math.sin(t * 4) * 0.18 * Math.max(0.2, 1 - lt / 2));
  ctx.strokeStyle = "#3a2a1a"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-8, 0); ctx.lineTo(0, -6); ctx.lineTo(8, 0); ctx.stroke();
  ctx.fillStyle = SKB_RED; stillRoundRect(-15, 0, 30, 12, 3); ctx.fill();
  skbText("OPEN", 0, 6.5, 8, "#ffffff", 26, {});
  ctx.restore();
  // the awning's shadow on the shop front
  ctx.fillStyle = "rgba(90,50,20,0.18)"; ctx.fillRect(L, aw + 26, R - L, 14);
  // birds crossing the sunrise
  for (var bd = 0; bd < 3; bd++) {
    var bx = ww * 0.95 - t * 60 - bd * 26, byy = 36 + bd * 9 + Math.sin(t * 3 + bd) * 3, fl = Math.sin(t * 14 + bd * 2) * 4;
    ctx.strokeStyle = "rgba(60,40,40,0.7)"; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(bx - 6, byy - fl); ctx.quadraticCurveTo(bx - 3, byy - 2, bx, byy); ctx.quadraticCurveTo(bx + 3, byy - 2, bx + 6, byy - fl); ctx.stroke();
  }
  // the sidewalk
  ctx.fillStyle = "#d9d2c6"; ctx.fillRect(-ww, 230, ww * 3, 40);
  ctx.fillStyle = "#c4bcae"; for (var sx = 0; sx < ww; sx += 40) ctx.fillRect(sx, 230, 1.5, 20);
  // golden-hour lens flare off the sun
  ctx.save(); ctx.globalCompositeOperation = "lighter";
  var sunX = ww * 0.86, sunY = 70, fdx = ww / 2 - sunX, fdy = 140 - sunY;
  var halo = ctx.createRadialGradient(sunX, sunY, 10, sunX, sunY, 120); halo.addColorStop(0, "rgba(255,230,170,0.5)"); halo.addColorStop(1, "rgba(255,200,120,0)");
  ctx.fillStyle = halo; ctx.fillRect(sunX - 120, sunY - 120, 240, 240);
  [[0.5, 10, "255,210,150", 0.18], [0.8, 18, "180,220,255", 0.14], [1.15, 7, "255,180,120", 0.2], [1.5, 26, "255,230,190", 0.1]].forEach(function (f) {
    var g = ctx.createRadialGradient(sunX + fdx * f[0], sunY + fdy * f[0], 0, sunX + fdx * f[0], sunY + fdy * f[0], f[1]);
    g.addColorStop(0, "rgba(" + f[2] + "," + f[3] + ")"); g.addColorStop(1, "rgba(" + f[2] + ",0)");
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(sunX + fdx * f[0], sunY + fdy * f[0], f[1], 0, Math.PI * 2); ctx.fill();
  });
  ctx.restore();
}

// ---- the oven shot (v2, Joe 2026-11-27: higher quality, from his oven photo):
// a stainless range seen a little from the side, copper knobs, a digital
// display, the door dropping open on its hinge into a golden glow, wire
// racks, a red-hot element, and the tray of creme cakes sliding out onto the
// open door, steaming, piped and glinting. A dark, warm kitchen around it.
function skbBokeh(ww, t, seed, n, a, cols) {
  for (var i = 0; i < n; i++) {
    var x = ssuR(seed + i) * ww, y = 10 + ssuR(seed + i + 50) * 120, r = 6 + ssuR(seed + i + 90) * 16;
    var tw = 0.6 + 0.4 * Math.sin(t * 1.3 + i * 2.1);
    var g = ctx.createRadialGradient(x, y, 0, x, y, r);
    var c = cols[i % cols.length];
    g.addColorStop(0, "rgba(" + c + "," + (0.35 * a * tw).toFixed(3) + ")"); g.addColorStop(0.7, "rgba(" + c + "," + (0.22 * a * tw).toFixed(3) + ")"); g.addColorStop(1, "rgba(" + c + ",0)");
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  }
}
// Brushed stainless: a cool gradient with fine horizontal streaks.
function skbSteel(x, y, w, h, light, seed) {
  var g = ctx.createLinearGradient(x, y, x + w, y + h);
  g.addColorStop(0, light ? "#e9edf1" : "#9aa3ad"); g.addColorStop(0.45, light ? "#b8c0c8" : "#7c858f"); g.addColorStop(0.55, light ? "#d6dce2" : "#8d96a0"); g.addColorStop(1, light ? "#a3abb4" : "#5f6770");
  ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
  ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
  for (var i = 0; i < h; i += 1.6) {
    ctx.fillStyle = "rgba(255,255,255," + (0.05 + 0.06 * ssuR(seed + i)).toFixed(3) + ")";
    ctx.fillRect(x + ssuR(seed + i * 3) * w * 0.3, y + i, w * (0.4 + 0.6 * ssuR(seed + i * 7)), 0.5);
  }
  ctx.restore();
}
function skbKnob(x, y, r, ang) {
  ctx.fillStyle = "rgba(0,0,0,0.35)"; ctx.beginPath(); ctx.ellipse(x + 1.5, y + 2.5, r * 1.05, r * 1.05, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#3b4047"; ctx.beginPath(); ctx.arc(x, y, r * 1.12, 0, Math.PI * 2); ctx.fill();
  var g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.1, x, y, r);
  g.addColorStop(0, "#ffd9a8"); g.addColorStop(0.35, "#d0864a"); g.addColorStop(0.8, "#8a4a22"); g.addColorStop(1, "#5c2e14");
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = "rgba(255,230,200,0.5)"; ctx.lineWidth = 0.8;
  for (var k = 0; k < 16; k++) { var a = k / 16 * Math.PI * 2; ctx.beginPath(); ctx.moveTo(x + Math.cos(a) * r * 0.82, y + Math.sin(a) * r * 0.82); ctx.lineTo(x + Math.cos(a) * r * 0.97, y + Math.sin(a) * r * 0.97); ctx.stroke(); }
  ctx.strokeStyle = "#3a1c0c"; ctx.lineWidth = 1.6; ctx.lineCap = "round";
  ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(ang) * r * 0.75, y + Math.sin(ang) * r * 0.75); ctx.stroke();
  ctx.fillStyle = "rgba(255,255,255,0.55)"; ctx.beginPath(); ctx.ellipse(x - r * 0.35, y - r * 0.42, r * 0.28, r * 0.14, -0.6, 0, Math.PI * 2); ctx.fill();
}
// Seven-segment-ish LED text.
function skbLed(txt, x, y, size, col, a) {
  ctx.save(); ctx.globalAlpha *= a;
  ctx.font = "700 " + size + "px 'Courier New', monospace"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.shadowColor = col; ctx.shadowBlur = size * 0.8; ctx.fillStyle = col; ctx.fillText(txt, x, y);
  ctx.shadowBlur = 0; ctx.fillText(txt, x, y);
  ctx.restore();
}
// The tray of creme cakes in perspective: depth 0 (back rack) .. 1 (out on the door).
function skbTray(cx, cy, w, d, pipeT, t) {
  var back = w * 0.78, deep = 30 + 10 * d;
  ctx.save();
  ctx.fillStyle = "rgba(0,0,0,0.35)"; ctx.beginPath(); ctx.ellipse(cx, cy + 6, w * 0.56, 8, 0, 0, Math.PI * 2); ctx.fill();
  // the sheet pan
  ctx.beginPath(); ctx.moveTo(cx - back / 2, cy - deep); ctx.lineTo(cx + back / 2, cy - deep); ctx.lineTo(cx + w / 2, cy); ctx.lineTo(cx - w / 2, cy); ctx.closePath();
  var g = ctx.createLinearGradient(0, cy - deep, 0, cy); g.addColorStop(0, "#5b5148"); g.addColorStop(1, "#9a8c7c");
  ctx.fillStyle = g; ctx.fill();
  ctx.strokeStyle = "#c9c0b4"; ctx.lineWidth = 2.2; ctx.stroke();
  ctx.fillStyle = "#7f7468"; ctx.fillRect(cx - w / 2, cy, w, 4);
  // parchment
  ctx.beginPath(); ctx.moveTo(cx - back / 2 + 6, cy - deep + 3); ctx.lineTo(cx + back / 2 - 6, cy - deep + 3); ctx.lineTo(cx + w / 2 - 6, cy - 3); ctx.lineTo(cx - w / 2 + 6, cy - 3); ctx.closePath();
  ctx.fillStyle = "#efe2c6"; ctx.fill();
  // two rows of cakes: the back row smaller
  for (var row = 0; row < 2; row++) {
    var ry = cy - deep * (row ? 0.3 : 0.72), rw = row ? w * 0.9 : back * 0.9, n = 5, L = rw / n * 0.84;
    for (var c = 0; c < n; c++) {
      var x = cx - rw / 2 + (c + 0.5) * rw / n;
      skbCreme(x, ry, L, (pipeT - (row * 5 + c) * 0.06) / 0.3, 0);
      var gl = Math.sin(t * 3 + c * 1.7 + row * 2); // a glint running over them
      if (gl > 0.92 && pipeT > 0.5) ssuStar(x + L * 0.2, ry - L * 0.12, 3 + 6 * (gl - 0.92) / 0.08, 0.9);
    }
  }
  ctx.restore();
}
function skbOven(ww, t, lt) {
  var cx = ww * 0.5, z = 1 + lt * 0.045;
  // the kitchen: dark warm wall, subway tile catching the glow, bokeh
  var bg = ctx.createLinearGradient(0, 0, 0, 250); bg.addColorStop(0, "#1c120c"); bg.addColorStop(1, "#3a2416");
  ctx.fillStyle = bg; ctx.fillRect(-ww, -250, ww * 3, 750);
  // the camera: a slow push, then it swoops down onto the tray as it comes out
  var swoop = ssuEase((lt - 1.15) / 0.5), Zc = z * (1 + 1.15 * swoop), fy = 140 + 70 * swoop;
  ctx.save(); ctx.translate(cx, 140 - 10 * swoop); ctx.scale(Zc, Zc); ctx.translate(-cx, -fy);
  var open = ssuEase((lt - 0.42) / 0.45), glow = 0.35 + 0.65 * open;
  // tile
  for (var ty = 0; ty < 160; ty += 14) for (var tx = -20 + (ty / 14 % 2) * 14; tx < ww + 20; tx += 28) {
    var dl = Math.abs(tx - cx) / (ww * 0.5), lit = Math.max(0, 1 - dl) * (0.5 + 0.5 * glow);
    ctx.fillStyle = "rgba(" + Math.round(70 + 120 * lit) + "," + Math.round(52 + 80 * lit) + "," + Math.round(40 + 40 * lit) + ",1)";
    stillRoundRect(tx + 1, ty + 1, 26, 12, 3); ctx.fill();
    ctx.fillStyle = "rgba(255,240,220," + (0.12 * lit).toFixed(3) + ")"; ctx.fillRect(tx + 3, ty + 2.5, 20, 2);
  }
  skbBokeh(ww, t, 300, 14, 0.8, ["255,190,120", "255,150,80", "255,225,170"]);
  // counters either side with a marble top
  var OW = Math.min(430, ww * 0.46), ox = cx - OW / 2, ox2 = cx + OW / 2;
  [[-ww, ox - 6], [ox2 + 46, ww * 2]].forEach(function (c) {
    ctx.fillStyle = "#2b1d14"; ctx.fillRect(c[0], 132, c[1] - c[0], 120);
    ctx.fillStyle = "#3a281b"; for (var dx = c[0]; dx < c[1]; dx += 70) ctx.fillRect(dx + 4, 146, 62, 80);
    ctx.fillStyle = "rgba(0,0,0,0.25)"; for (var dx2 = c[0]; dx2 < c[1]; dx2 += 70) ctx.fillRect(dx2 + 30, 180, 10, 3);
    var mg = ctx.createLinearGradient(0, 124, 0, 134); mg.addColorStop(0, "#f2ece4"); mg.addColorStop(1, "#bdb3a7");
    ctx.fillStyle = mg; ctx.fillRect(c[0], 124, c[1] - c[0], 10);
  });
  // props on the counters: a flour canister, a rolling pin, a stand of cakes
  if (ox - 120 > 0) {
    var fx = ox - 70;
    ctx.fillStyle = "#e8e2d8"; stillRoundRect(fx - 20, 84, 40, 40, 6); ctx.fill();
    ctx.fillStyle = "#b9b0a3"; stillRoundRect(fx - 22, 80, 44, 8, 3); ctx.fill();
    skbText("FLOUR", fx, 104, 8, "#7a5a3a", 34, {});
    ctx.save(); ctx.translate(fx - 70, 118); ctx.rotate(-0.08);
    var pg = ctx.createLinearGradient(0, -5, 0, 5); pg.addColorStop(0, "#e9c48f"); pg.addColorStop(1, "#a8743f");
    ctx.fillStyle = pg; stillRoundRect(-30, -5, 60, 10, 5); ctx.fill(); ctx.fillStyle = "#8a5a32"; ctx.fillRect(-42, -2.5, 12, 5); ctx.fillRect(30, -2.5, 12, 5);
    ctx.restore();
  }
  if (ox2 + 160 < ww) {
    var sx = ox2 + 110;
    ctx.fillStyle = "#f6f1ea"; ctx.beginPath(); ctx.ellipse(sx, 108, 38, 6, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#d9d2c8"; ctx.fillRect(sx - 3, 108, 6, 14); ctx.beginPath(); ctx.ellipse(sx, 123, 16, 3, 0, 0, Math.PI * 2); ctx.fill();
    for (var q = 0; q < 3; q++) dccSnack(sx - 22 + q * 22, 96, 11, 0);
    ctx.strokeStyle = "rgba(255,255,255,0.35)"; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(sx, 92, 40, Math.PI * 1.05, Math.PI * 1.95); ctx.stroke(); // a glass dome
    ctx.fillStyle = "rgba(255,255,255,0.08)"; ctx.beginPath(); ctx.arc(sx, 108, 40, Math.PI, 0); ctx.fill();
  }
  // ---- the range, three-quarter view: side and top first
  var top = 22, panelB = 64, cav0 = 74, cav1 = 196, base = 236;
  ctx.fillStyle = "#6d757e"; ctx.beginPath(); ctx.moveTo(ox2, top); ctx.lineTo(ox2 + 40, top - 10); ctx.lineTo(ox2 + 40, base - 10); ctx.lineTo(ox2, base); ctx.closePath(); ctx.fill();
  var sg = ctx.createLinearGradient(ox2, 0, ox2 + 40, 0); sg.addColorStop(0, "rgba(255,255,255,0.12)"); sg.addColorStop(1, "rgba(0,0,0,0.25)");
  ctx.fillStyle = sg; ctx.fill();
  ctx.fillStyle = "#4a5058"; ctx.beginPath(); ctx.moveTo(ox - 4, top); ctx.lineTo(ox2 + 4, top); ctx.lineTo(ox2 + 44, top - 10); ctx.lineTo(ox + 36, top - 10); ctx.closePath(); ctx.fill();
  // the control panel
  skbSteel(ox, top, OW, panelB - top, true, 11);
  ctx.fillStyle = "rgba(0,0,0,0.25)"; ctx.fillRect(ox, panelB - 2, OW, 2);
  var kr = 11, ky = (top + panelB) / 2 + 1, turn = -Math.PI / 2 + 0.9;
  skbKnob(ox + 34, ky, kr, turn); skbKnob(ox + 66, ky, kr, turn - 0.6);
  skbKnob(ox2 - 66, ky, kr, turn + 0.4); skbKnob(ox2 - 34, ky, kr, turn - 1.2);
  // display: 350°F counting down, then DONE flashing
  ctx.fillStyle = "#07090b"; stillRoundRect(cx - 52, ky - 12, 104, 24, 4); ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.08)"; ctx.fillRect(cx - 50, ky - 11, 100, 4);
  var secs = Math.max(0, Math.ceil(3 - lt * 8));
  if (lt < 0.36) skbLed("350° 0:0" + secs, cx, ky + 1, 13, "#ff9a3c", 1);
  else skbLed("DONE", cx, ky + 1, 15, "#ffd24a", Math.floor(lt * 8) % 2 ? 1 : 0.35);
  ctx.fillStyle = "#3b4047"; [cx - 80, cx + 80].forEach(function (bx) { ctx.beginPath(); ctx.arc(bx, ky, 3, 0, Math.PI * 2); ctx.fill(); });
  // the body below the panel
  skbSteel(ox, panelB, OW, base - panelB, false, 29);
  ctx.fillStyle = "#16191d"; ctx.fillRect(ox, cav1 + 18, OW, base - cav1 - 18); // kick plate
  ctx.fillStyle = "rgba(255,255,255,0.06)"; ctx.fillRect(ox, cav1 + 18, OW, 2);
  // ---- the cavity: orange back wall, side walls in perspective, element, racks
  var ix0 = ox + 24, ix1 = ox2 - 24, iw = ix1 - ix0, inset = 22;
  ctx.fillStyle = "#0b0c0e"; ctx.fillRect(ix0 - 4, cav0 - 4, iw + 8, cav1 - cav0 + 8);
  var bw0 = ix0 + inset, bw1 = ix1 - inset, by0 = cav0 + 12, by1 = cav1 - 14;
  var hot = ctx.createRadialGradient(cx + 30, by0 + 40, 6, cx, (by0 + by1) / 2, iw * 0.6);
  hot.addColorStop(0, "rgba(255,236,150," + glow.toFixed(3) + ")"); hot.addColorStop(0.45, "rgba(255,150,40," + glow.toFixed(3) + ")"); hot.addColorStop(1, "rgba(150,50,10," + glow.toFixed(3) + ")");
  ctx.fillStyle = "#2a0f04"; ctx.fillRect(bw0, by0, bw1 - bw0, by1 - by0);
  ctx.fillStyle = hot; ctx.fillRect(bw0, by0, bw1 - bw0, by1 - by0);
  function quad(a, b, c, d, col) { ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.lineTo(c[0], c[1]); ctx.lineTo(d[0], d[1]); ctx.closePath(); ctx.fill(); }
  var gA = (0.55 * glow).toFixed(3);
  quad([ix0, cav0], [bw0, by0], [bw0, by1], [ix0, cav1], "rgba(190,80,20," + gA + ")");
  quad([ix1, cav0], [bw1, by0], [bw1, by1], [ix1, cav1], "rgba(230,120,30," + gA + ")");
  quad([ix0, cav0], [ix1, cav0], [bw1, by0], [bw0, by0], "rgba(120,40,10," + gA + ")");
  quad([ix0, cav1], [ix1, cav1], [bw1, by1], [bw0, by1], "rgba(170,70,20," + gA + ")");
  // the element along the top, glowing red
  ctx.strokeStyle = "rgba(255," + Math.round(60 + 80 * glow) + ",40," + (0.5 + 0.5 * glow).toFixed(3) + ")"; ctx.lineWidth = 2.5;
  ctx.shadowColor = "#ff4a1a"; ctx.shadowBlur = 8 * glow;
  ctx.beginPath(); ctx.moveTo(bw0 + 8, by0 + 6);
  for (var e = 0; e < 7; e++) { var ex = bw0 + 8 + (e + 0.5) * (bw1 - bw0 - 16) / 7; ctx.lineTo(ex, by0 + (e % 2 ? 6 : 14)); }
  ctx.lineTo(bw1 - 8, by0 + 6); ctx.stroke(); ctx.shadowBlur = 0;
  // two wire racks
  [0.42, 0.78].forEach(function (k) {
    var fy = cav0 + (cav1 - cav0) * k, byy = by0 + (by1 - by0) * k;
    ctx.strokeStyle = "rgba(255,210,150," + (0.35 + 0.5 * glow).toFixed(3) + ")"; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.moveTo(ix0 + 2, fy); ctx.lineTo(ix1 - 2, fy); ctx.moveTo(bw0, byy); ctx.lineTo(bw1, byy); ctx.stroke();
    ctx.lineWidth = 0.8;
    for (var w = 0; w <= 18; w++) { var u = w / 18; ctx.beginPath(); ctx.moveTo(ix0 + 2 + u * (iw - 4), fy); ctx.lineTo(bw0 + u * (bw1 - bw0), byy); ctx.stroke(); }
  });
  // the tray: on the low rack, then sliding out onto the door
  var slide = ssuOut((lt - 0.88) / 0.5);
  if (lt < 0.88) skbTray(cx, by0 + (by1 - by0) * 0.78 + 2, (bw1 - bw0) * 0.86, 0, 0, t);
  // the door, dropping open on its bottom hinge
  var ang = open * Math.PI / 2, Hd = cav1 - cav0 + 16, hinge = cav1 + 14;
  var topY = hinge - Hd * Math.cos(ang) + Hd * 0.3 * Math.sin(ang), spread = 1 + 0.16 * Math.sin(ang);
  var dw0 = ox + 8, dw1 = ox2 - 8, dwm = (dw1 - dw0) / 2 * spread;
  ctx.beginPath(); ctx.moveTo(dw0, hinge); ctx.lineTo(dw1, hinge); ctx.lineTo(cx + dwm, topY); ctx.lineTo(cx - dwm, topY); ctx.closePath();
  if (topY < hinge - 2) { // the outside: steel frame, a dark window glowing from inside
    ctx.save(); ctx.clip();
    skbSteel(dw0 - 40, topY, dw1 - dw0 + 80, hinge - topY, false, 53);
    var f = (hinge - topY) / Hd;
    var wy0 = topY + 22 * f, wy1 = hinge - 18 * f;
    ctx.fillStyle = "#0c0d10"; ctx.fillRect(dw0 + 26, wy0, dw1 - dw0 - 52, wy1 - wy0);
    var wg = ctx.createRadialGradient(cx, (wy0 + wy1) / 2, 4, cx, (wy0 + wy1) / 2, iw * 0.55);
    wg.addColorStop(0, "rgba(255,170,60," + (0.75 * glow).toFixed(3) + ")"); wg.addColorStop(1, "rgba(120,40,10," + (0.4 * glow).toFixed(3) + ")");
    ctx.fillStyle = wg; ctx.fillRect(dw0 + 26, wy0, dw1 - dw0 - 52, wy1 - wy0);
    ctx.fillStyle = "rgba(255,255,255,0.1)"; ctx.beginPath(); ctx.moveTo(dw0 + 40, wy0); ctx.lineTo(dw0 + 90, wy0); ctx.lineTo(dw0 + 50, wy1); ctx.lineTo(dw0 + 30, wy1); ctx.closePath(); ctx.fill();
    ctx.restore();
    // the chrome handle bar across the top
    var hy = topY + 9 * f;
    ctx.fillStyle = "#2d3238"; ctx.fillRect(cx - dwm + 30, hy, 8, 9 * f + 2); ctx.fillRect(cx + dwm - 38, hy, 8, 9 * f + 2);
    var hg = ctx.createLinearGradient(0, hy - 4, 0, hy + 5); hg.addColorStop(0, "#ffffff"); hg.addColorStop(0.5, "#a8b0b8"); hg.addColorStop(1, "#59616a");
    ctx.fillStyle = hg; stillRoundRect(cx - dwm + 22, hy - 4, dwm * 2 - 44, 8, 4); ctx.fill();
  } else { // the inside face, lying flat toward us, and the handle at its far edge
    ctx.fillStyle = "#1b1e22"; ctx.fill();
    ctx.fillStyle = "rgba(255,140,50," + (0.18 * glow).toFixed(3) + ")"; ctx.fill();
    ctx.fillStyle = "#0d0f12"; ctx.beginPath(); ctx.moveTo(dw0 + 22, hinge + 4); ctx.lineTo(dw1 - 22, hinge + 4); ctx.lineTo(cx + dwm - 26, topY - 6); ctx.lineTo(cx - dwm + 26, topY - 6); ctx.closePath(); ctx.fill();
    var hg2 = ctx.createLinearGradient(0, topY, 0, topY + 9); hg2.addColorStop(0, "#ffffff"); hg2.addColorStop(0.5, "#aab2ba"); hg2.addColorStop(1, "#555d66");
    ctx.fillStyle = hg2; stillRoundRect(cx - dwm - 6, topY + 1, dwm * 2 + 12, 9, 4.5); ctx.fill();
  }
  if (lt >= 0.88) skbTray(cx, by1 + 4 + slide * 34, (bw1 - bw0) * (0.86 + 0.3 * slide), slide, (lt - 1.35) / 0.6, t);
  // heat: shimmer lines and steam once it's open
  if (open > 0) {
    ctx.strokeStyle = "rgba(255,220,170," + (0.18 * open).toFixed(3) + ")"; ctx.lineWidth = 1.2;
    for (var s = 0; s < 6; s++) {
      var u = (t * 0.7 + s / 6) % 1, sx2 = cx - iw * 0.35 + s * iw * 0.14, sy = cav0 - u * 70;
      ctx.beginPath(); ctx.moveTo(sx2, sy); for (var k2 = 1; k2 < 6; k2++) ctx.lineTo(sx2 + Math.sin(k2 * 1.4 + t * 9 + s) * 4, sy - k2 * 6); ctx.stroke();
    }
    for (var st = 0; st < 9; st++) {
      var uu = (t * 0.5 + st / 9) % 1, px = cx - iw * 0.4 + st * iw * 0.1 + Math.sin(uu * 5 + st) * 10, py = (lt >= 0.88 ? by1 - 20 + slide * 34 : by1 - 20) - uu * 110;
      ctx.fillStyle = "rgba(255,245,230," + (0.3 * (1 - uu) * open).toFixed(3) + ")"; ctx.beginPath(); ctx.arc(px, py, 7 + uu * 16, 0, Math.PI * 2); ctx.fill();
    }
  }
  ctx.restore();
  // the glow spilling out over everything, and a warm floor reflection
  ctx.save(); ctx.globalCompositeOperation = "lighter";
  var sp = ctx.createRadialGradient(cx, 150, 10, cx, 150, ww * 0.45);
  sp.addColorStop(0, "rgba(255,140,40," + (0.42 * open).toFixed(3) + ")"); sp.addColorStop(1, "rgba(255,140,40,0)");
  ctx.fillStyle = sp; ctx.fillRect(0, 0, ww, 250);
  ctx.restore();
  if (lt > 0.35 && lt < 1.0) { var dg = skbPop(lt, 0.35, 0.3); ctx.save(); ctx.translate(cx + OW * 0.36, 30); ctx.scale(dg, dg); ctx.rotate(0.12); skbText("DING!", 0, 0, 22, "#ffd23a", 120, { stroke: "#3a1606" }); ctx.restore(); }
}

function skbTaster(ww, t, lt, ch) {
  // the bakery inside: warm wall, shelves of bread, the counter
  var bg = ctx.createLinearGradient(0, 0, 0, 250); bg.addColorStop(0, "#ffe3b8"); bg.addColorStop(1, "#f5c98d");
  ctx.fillStyle = bg; ctx.fillRect(-ww, -250, ww * 3, 750);
  for (var sh = 0; sh < 2; sh++) {
    var sy = 70 + sh * 62;
    ctx.fillStyle = "#9c6a3c"; ctx.fillRect(0, sy, ww, 6);
    for (var l = 0; l < 16; l++) {
      var lx = 14 + l * (ww / 15) + (sh ? 18 : 0);
      ctx.fillStyle = l % 3 === 0 ? "#c98a45" : (l % 3 === 1 ? "#b8743a" : "#e0a95e");
      ctx.beginPath(); ctx.ellipse(lx, sy - 9, 16, 9, 0, Math.PI, 0); ctx.fill();
      ctx.strokeStyle = "rgba(255,240,210,0.6)"; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.moveTo(lx - 6, sy - 14); ctx.lineTo(lx - 2, sy - 6); ctx.moveTo(lx + 2, sy - 15); ctx.lineTo(lx + 6, sy - 7); ctx.stroke();
    }
  }
  // shallow focus: the shelves go soft in a warm haze, a window's light
  // shafts across, bokeh, and a rim light behind him
  ctx.fillStyle = "rgba(255,214,160,0.45)"; ctx.fillRect(0, 0, ww, 250);
  ctx.save(); ctx.globalCompositeOperation = "lighter";
  for (var sh2 = 0; sh2 < 3; sh2++) {
    var lx0 = ww * (0.55 + sh2 * 0.12);
    ctx.fillStyle = "rgba(255,240,200,0.10)"; ctx.beginPath(); ctx.moveTo(lx0, -10); ctx.lineTo(lx0 + 40, -10); ctx.lineTo(lx0 - 60, 260); ctx.lineTo(lx0 - 120, 260); ctx.closePath(); ctx.fill();
  }
  var rim = ctx.createRadialGradient(ww * 0.4, 140, 20, ww * 0.4, 140, 170);
  rim.addColorStop(0, "rgba(255,230,170,0.55)"); rim.addColorStop(1, "rgba(255,230,170,0)");
  ctx.fillStyle = rim; ctx.fillRect(0, 0, ww, 250);
  ctx.restore();
  skbBokeh(ww, t, 700, 12, 0.9, ["255,250,230", "255,220,160"]);
  var z = 1 + lt * 0.025;
  ctx.save(); ctx.translate(ww * 0.4, 170); ctx.scale(z, z); ctx.translate(-ww * 0.4, -170);
  // the bite: up to his mouth at 1.25 and 1.55 seconds in
  var r = 78, cx = ww * 0.4, bob = Math.abs(Math.sin(lt * Math.PI * 2)) * 4, cy = 150 - bob;
  var bite = Math.max(Math.exp(-Math.pow((lt - 1.3) / 0.16, 2)), Math.exp(-Math.pow((lt - 1.6) / 0.16, 2)));
  var hand = { x: cx + r * 0.95 - bite * r * 0.45, y: cy + r * 0.25 - bite * r * 0.55 };
  skbDc(cx, cy, r, ch, { cake: hand, rub: lt * 9, cakeRot: -0.3 * bite });
  skbCrumbs(cx + r * 0.45, cy - r * 0.35, lt - 1.3, 11, 1);
  skbCrumbs(cx + r * 0.45, cy - r * 0.35, lt - 1.6, 37, 1);
  ctx.restore();
  // counter in front
  ctx.fillStyle = "#8a5a32"; ctx.fillRect(-ww, 224, ww * 3, 40);
  ctx.fillStyle = "#a8743f"; ctx.fillRect(-ww, 220, ww * 3, 6);
  if (lt > 1.25 && lt < 2.1) { var cp = skbPop(lt, 1.25, 0.25); ctx.save(); ctx.translate(cx + r * 1.25, cy - r * 0.9); ctx.scale(cp, cp); ctx.rotate(-0.12); skbText("CHOMP!", 0, 0, 22, "#ffffff", 140, { stroke: SKB_RED }); ctx.restore(); }
  if (lt > 1.9) {
    var mp = skbPop(lt, 1.9, 0.35);
    ctx.save(); ctx.translate(ww * 0.78, 92); ctx.scale(mp, mp); ctx.rotate(-0.06);
    skbText("MMM!", 0, 0, 46, "#ffffff", 220, { stroke: SKB_BLUE, strokeW: 0.26 });
    ctx.restore();
    for (var hh = 0; hh < 5; hh++) {
      var hu = (lt - 1.9 - hh * 0.12); if (hu < 0) continue;
      skbHeart(cx - r * 0.6 + hh * r * 0.35 + Math.sin(hu * 5 + hh) * 6, cy - r * 1.3 - hu * 50, 8 + hh % 2 * 3, Math.sin(hu * 3 + hh) * 0.3, Math.max(0, 1 - hu / 1.2));
    }
  }
  // a lower third, like a real spot
  var la = ssuFade(lt, 0.25, 0.3) * (1 - ssuFade(lt, 1.15, 0.2));
  if (la > 0) {
    ctx.save(); ctx.globalAlpha *= la;
    ctx.fillStyle = SKB_BLUE; stillRoundRect(ww * 0.62, 150, ww * 0.32, 44, 8); ctx.fill();
    ctx.fillStyle = SKB_RED; stillRoundRect(ww * 0.62, 186, ww * 0.32, 18, 6); ctx.fill();
    skbText((ch.name || "").toUpperCase(), ww * 0.78, 168, 16, "#ffffff", ww * 0.3, {});
    skbText("HEAD TASTER", ww * 0.78, 195, 10, "#ffffff", ww * 0.28, {});
    ctx.restore();
  }
}

// The three boxes on the counter.
function skbBox(x, y, s, label, kind, isNew) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = "rgba(60,30,10,0.25)"; ctx.beginPath(); ctx.ellipse(0, 4, 62, 8, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#14408f"; ctx.beginPath(); ctx.moveTo(-56, -104); ctx.lineTo(-46, -116); ctx.lineTo(66, -116); ctx.lineTo(56, -104); ctx.closePath(); ctx.fill();
  var g = ctx.createLinearGradient(-56, 0, 56, 0); g.addColorStop(0, "#2a62cc"); g.addColorStop(1, "#1c4fb4");
  ctx.fillStyle = g; ctx.fillRect(-56, -104, 112, 104);
  ctx.fillStyle = "#123a86"; ctx.beginPath(); ctx.moveTo(56, -104); ctx.lineTo(66, -116); ctx.lineTo(66, -12); ctx.lineTo(56, 0); ctx.closePath(); ctx.fill();
  // the window with the product
  ctx.fillStyle = "#fff6e6"; stillRoundRect(-44, -62, 88, 44, 8); ctx.fill();
  ctx.save(); stillRoundRect(-44, -62, 88, 44, 8); ctx.clip();
  if (kind === "snack") { dccSnack(-18, -38, 16, 0); dccSnack(18, -38, 16, 0); }
  if (kind === "creme") { skbCreme(-18, -38, 32, 1, 0); skbCreme(18, -38, 32, 1, 0); }
  if (kind === "chicken") { skbCreme(-18, -36, 32, 1, 0); dccChicken(19, -40, 12, 0.2); }
  ctx.fillStyle = "rgba(255,255,255,0.35)"; ctx.fillRect(-44, -62, 88, 10);
  ctx.restore();
  ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 2; stillRoundRect(-44, -62, 88, 44, 8); ctx.stroke();
  drawSalkilldLogo(ctx, 0, -86, 84);
  ctx.fillStyle = SKB_RED; ctx.fillRect(-56, -14, 112, 14);
  skbText(label, 0, -7, 10, "#ffffff", 104, {});
  ctx.restore();
  if (isNew) { // a NEW! burst
    ctx.save(); ctx.translate(x + 52 * s, y - 108 * s); ctx.rotate(0.2);
    ctx.fillStyle = "#ffd23a"; ctx.beginPath();
    for (var i = 0; i < 24; i++) { var a = i * Math.PI / 12, rr = (i % 2 ? 15 : 22) * s; ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); }
    ctx.closePath(); ctx.fill(); ctx.strokeStyle = SKB_RED; ctx.lineWidth = 1.5; ctx.stroke();
    skbText("NEW!", 0, 1, 11 * s, SKB_RED, 30 * s, {});
    ctx.restore();
  }
}
function skbLineup(ww, t, lt) {
  // a product studio: deep blue sweep, spotlights, a glossy counter
  var st = ctx.createRadialGradient(ww / 2, 90, 20, ww / 2, 120, ww * 0.6);
  st.addColorStop(0, "#5fb8f0"); st.addColorStop(0.6, "#1f5fb8"); st.addColorStop(1, "#0b2a66");
  ctx.fillStyle = st; ctx.fillRect(-ww, -250, ww * 3, 750);
  skbRays(ww / 2, 120, ww, t, "rgba(255,255,255,0.07)");
  skbBokeh(ww, t, 900, 12, 0.7, ["200,235,255", "255,255,255"]);
  ctx.save(); ctx.globalCompositeOperation = "lighter";
  [-1, 0, 1].forEach(function (k) {
    var bx0 = ww / 2 + k * Math.min(200, ww * 0.3), on = ssuFade(lt, 0.15 + (k + 1) * 0.3, 0.2);
    var cg = ctx.createLinearGradient(0, -10, 0, 210); cg.addColorStop(0, "rgba(255,255,240," + (0.28 * on).toFixed(3) + ")"); cg.addColorStop(1, "rgba(255,255,240,0)");
    ctx.fillStyle = cg; ctx.beginPath(); ctx.moveTo(bx0 - 14, -10); ctx.lineTo(bx0 + 14, -10); ctx.lineTo(bx0 + 95, 212); ctx.lineTo(bx0 - 95, 212); ctx.closePath(); ctx.fill();
  });
  ctx.restore();
  var cgl = ctx.createLinearGradient(0, 206, 0, 250); cgl.addColorStop(0, "#f4f8fc"); cgl.addColorStop(1, "#9fb6cc");
  ctx.fillStyle = cgl; ctx.fillRect(-ww, 206, ww * 3, 60);
  ctx.fillStyle = "rgba(255,255,255,0.9)"; ctx.fillRect(-ww, 206, ww * 3, 1.5);
  var boxes = [["SNACK CAKES", "snack"], ["CREME CAKES", "creme"], ["CHICKEN & CAKE", "chicken"]];
  boxes.forEach(function (bx, i) {
    var at = 0.15 + i * 0.3, u = (lt - at) / 0.35;
    if (u <= 0) return;
    var x = ww / 2 + (i - 1) * Math.min(200, ww * 0.3), drop = u < 1 ? -150 * (1 - ssuOut(u)) : 0, sq = skbPop(lt, at + 0.3, 0.25) || 1;
    var bs = 1.3 * (sq > 1 ? 1 + (sq - 1) * 0.3 : 1);
    if (!drop) { // its reflection in the glossy counter
      ctx.save(); ctx.beginPath(); ctx.rect(-ww, 212, ww * 3, 60); ctx.clip();
      ctx.globalAlpha *= 0.22; ctx.translate(0, 424); ctx.scale(1, -1);
      skbBox(x, 212, bs, bx[0], bx[1], false);
      ctx.restore();
    }
    skbBox(x, 212 + drop, bs, bx[0], bx[1], i === 2 && lt > 1.15);
  });
  var ta = ssuFade(lt, 1.0, 0.25);
  if (ta > 0) { ctx.save(); ctx.globalAlpha *= ta; skbText("TRY THE WHOLE FAMILY!", ww / 2, 24, 22, "#ffffff", ww * 0.8, { stroke: "#0b2a66", glow: "rgba(150,220,255,0.9)" }); ctx.restore(); }
  if (lt > 1.15) for (var s = 0; s < 6; s++) ssuStar(ww / 2 + (s - 2.5) * ww * 0.15, 60 + (s % 2) * 30, 5 + 3 * Math.sin(t * 9 + s), 0.8);
}
function skbEnd(ww, t, lt) {
  var bg = ctx.createRadialGradient(ww / 2, 110, 10, ww / 2, 110, ww * 0.7);
  bg.addColorStop(0, "#d9f3ff"); bg.addColorStop(1, "#5ec2f2");
  ctx.fillStyle = bg; ctx.fillRect(-ww, -250, ww * 3, 750);
  skbRays(ww / 2, 100, ww, t, "rgba(255,255,255,0.28)");
  skbCloud(ww * 0.1 - lt * 5, 210, 26, 0.95); skbCloud(ww * 0.9 + lt * 5, 205, 24, 0.95); skbCloud(ww * 0.5, 240, 30, 0.95);
  var p = skbPop(lt, 0, 0.45);
  if (p > 0) {
    ctx.save(); ctx.translate(ww / 2, 98); ctx.scale(p, p); ctx.rotate(Math.sin(lt * 3) * 0.015);
    drawSalkilldLogo(ctx, 0, 0, Math.min(330, ww * 0.6));
    ctx.restore();
  }
  // a glint sweeping across the logo
  var gx = (lt - 0.5) / 0.6;
  if (gx > 0 && gx < 1) ssuStar(ww / 2 - 150 + gx * 300, 70 + Math.sin(gx * Math.PI) * -10, 10 + 8 * Math.sin(gx * Math.PI), 1);
  for (var s = 0; s < 7; s++) { var a = s / 7 * Math.PI * 2 + lt * 0.8; ssuStar(ww / 2 + Math.cos(a) * 190, 98 + Math.sin(a) * 70, 4 + 3 * Math.abs(Math.sin(t * 6 + s)), ssuFade(lt, 0.4, 0.3)); }
  var ta = ssuFade(lt, 0.6, 0.3);
  if (ta > 0) {
    ctx.save(); ctx.globalAlpha *= ta;
    var tp = ssuOut((lt - 0.6) / 0.35);
    ctx.translate(0, (1 - tp) * 12);
    stillText("His parents own a bakery.", ww / 2, 188, 24, SKB_BLUE, ww * 0.85, { face: SKB_FONT, weight: "italic 900", stroke: "#ffffff", strokeW: 0.3, glow: "rgba(255,255,255,0.9)" });
    ctx.restore();
  }
  ctx.save(); ctx.globalAlpha *= ssuFade(lt, 1.0, 0.4);
  stillText("*Parody. Not a real bakery. Chicken & Cake is not a real snack (yet).", ww / 2, 236, 8, "#245a8a", ww * 0.9, { face: "'Helvetica Neue', Helvetica, Arial, sans-serif", weight: "600" });
  ctx.restore();
}

function skbShot(i, ww, t, lt, ch) {
  if (i === 0) {
    var z = 1 + lt / 2.4 * 0.1;
    ctx.translate(ww / 2, 150); ctx.scale(z, z); ctx.translate(-ww / 2, -150);
    skbStore(ww, t, lt);
  } else if (i === 1) skbOven(ww, t, lt);
  else if (i === 2) skbTaster(ww, t, lt, ch);
  else if (i === 3) skbLineup(ww, t, lt);
  else skbEnd(ww, t, lt);
}

function drawSalkilldJumbo(x, y, w, h) {
  if (SKB.show <= 0 || SKB.paused || !balls || !balls[SKB.id]) return;
  var b = balls[SKB.id], ch = b.baseChar || b.char;
  skbFrame(x, y, w, h, SKB.t, ch, Math.min(1, SKB.t / 0.15, SKB.show / 0.4));
}
// One frame of the ad at time t.
function skbFrame(x, y, w, h, t, ch, alpha) {
  var s = h / 250, ww = w / s;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
  ctx.translate(x, y); ctx.scale(s, s);
  var i = 0; while (i < SKB_CUTS.length - 2 && t >= SKB_CUTS[i + 1]) i++;
  var lt = t - SKB_CUTS[i];
  ctx.save(); skbShot(i, ww, t, lt, ch); ctx.restore();
  // a quick white pop on every cut
  // the finish: a soft vignette, a little grain, and a warm light leak
  // washing over every cut
  var vg = ctx.createRadialGradient(ww / 2, 125, 80, ww / 2, 125, ww * 0.6);
  vg.addColorStop(0, "rgba(0,0,0,0)"); vg.addColorStop(1, "rgba(10,5,0,0.38)");
  ctx.fillStyle = vg; ctx.fillRect(0, 0, ww, 250);
  var fr = Math.floor(t * 24);
  ctx.fillStyle = "rgba(255,255,255,0.05)";
  for (var gr = 0; gr < 70; gr++) ctx.fillRect(ssuR(fr * 131 + gr) * ww, ssuR(fr * 71 + gr + 500) * 250, 1.3, 1.3);
  var into = lt, wf = i > 0 ? Math.max(0, 1 - into / 0.22) : 0;
  if (wf > 0) {
    ctx.save(); ctx.globalCompositeOperation = "lighter";
    var lk = ctx.createRadialGradient(ww * (0.15 + 0.7 * ((i * 0.37) % 1)), 60, 10, ww * 0.5, 125, ww * 0.7);
    lk.addColorStop(0, "rgba(255,240,210," + wf.toFixed(3) + ")"); lk.addColorStop(0.5, "rgba(255,170,90," + (0.6 * wf).toFixed(3) + ")"); lk.addColorStop(1, "rgba(255,120,60,0)");
    ctx.fillStyle = lk; ctx.fillRect(0, 0, ww, 250);
    ctx.restore();
  }
  if (i === 0) { // FRESH FROM THE FAMILY OVEN
    var a = ssuFade(lt, 0.7, 0.3);
    if (a > 0) {
      ctx.save(); ctx.globalAlpha *= a; var sl = (1 - ssuOut((lt - 0.7) / 0.35)) * ww * 0.3;
      ctx.fillStyle = SKB_RED; ctx.beginPath(); ctx.moveTo(ww * 0.22 - sl, 216); ctx.lineTo(ww * 0.8 - sl, 216); ctx.lineTo(ww * 0.78 - sl, 242); ctx.lineTo(ww * 0.2 - sl, 242); ctx.closePath(); ctx.fill();
      skbText("FRESH FROM THE FAMILY OVEN", ww / 2 - sl, 229.5, 17, "#ffffff", ww * 0.5, {});
      ctx.restore();
    }
  }
  if (i === 1) {
    var a2 = ssuFade(lt, 1.5, 0.3);
    if (a2 > 0) {
      ctx.save(); ctx.globalAlpha *= a2;
      ctx.fillStyle = "rgba(30,10,2,0.55)"; stillRoundRect(ww * 0.5 - 160, 14, 320, 32, 16); ctx.fill();
      skbText("BAKED WITH LOVE", ww * 0.5, 30, 22, "#fff3dc", ww * 0.6, { weight: "900", glow: "rgba(255,150,40,0.9)", stroke: "rgba(60,20,5,0.6)" });
      skbHeart(ww * 0.5 + 138, 28, 9, 0.1, 1); skbHeart(ww * 0.5 - 138, 28, 9, -0.1, 1);
      ctx.restore();
    }
  }
  ctx.restore();
}
function drawSalkilldBanner() {
  if (SKB.show <= 0 || stadiumOn()) return;
  drawSalkilldJumbo(10, 10, W - 20, 110);
}

// The still for the random rotation: a shop-window poster. DC the baker with
// a thumbs up, the three boxes, the logo and the line.
function drawSalkilldStill(x, y, w, h, k, ch) {
  var s = h / 250, ww = w / s;
  ch = ch || { look: {}, name: "" };
  ctx.save();
  ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
  ctx.translate(x, y); ctx.scale(s, s);
  var bg = ctx.createRadialGradient(ww * 0.3, 90, 10, ww * 0.3, 90, ww * 0.8);
  bg.addColorStop(0, "#e2f6ff"); bg.addColorStop(1, "#6cc8f4");
  ctx.fillStyle = bg; ctx.fillRect(0, 0, ww, 250);
  skbRays(ww * 0.3, 90, ww, 0.6, "rgba(255,255,255,0.3)");
  skbCloud(ww * 0.06, 226, 24, 0.95); skbCloud(ww * 0.36, 236, 26, 0.95);
  ctx.fillStyle = "#a8743f"; ctx.fillRect(ww * 0.47, 206, ww * 0.53, 8);
  ctx.fillStyle = "#8a5a32"; ctx.fillRect(ww * 0.47, 214, ww * 0.53, 40);
  drawSalkilldLogo(ctx, ww * 0.3, 78, Math.min(300, ww * 0.5));
  stillText("His parents own a bakery.", ww * 0.3, 160, 19, SKB_BLUE, ww * 0.5, { face: SKB_FONT, weight: "italic 900", stroke: "#ffffff", strokeW: 0.3 });
  skbText("FRESH DAILY  ·  FAMILY OWNED", ww * 0.3, 186, 10, "#ffffff", ww * 0.45, { stroke: SKB_BLUE });
  var bs = Math.min(0.78, ww * 0.45 / 3 / 112);
  skbBox(ww * 0.555, 210, bs, "SNACK CAKES", "snack", false);
  skbBox(ww * 0.555 + 124 * bs, 210, bs, "CHICKEN & CAKE", "chicken", true);
  skbDc(ww * 0.885, 152, 52, ch, { thumb: true, cake: { x: ww * 0.885 + 58, y: 172 } });
  ctx.restore();
}

// ---------------------------------------------------------------- sound
// The jingle: a bouncy glockenspiel tune over a plucky bass and claps, 132 bpm,
// with the "Sal-killd Ba-ke-ry" sting on the logo.
var SKB_BEAT = 60 / 132;
var SKB_MEL = (function () {
  var n = [], C = 523.25, D = 587.33, E = 659.25, F = 698.46, G = 783.99, A = 880, B = 987.77, C2 = 1046.5;
  var phrase = [[0, C], [0.5, E], [1, G], [1.5, E], [2, A], [3, G], [4, F], [4.5, A], [5, C2], [5.5, A], [6, G], [7, E],
    [8, D], [8.5, F], [9, A], [9.5, F], [10, G], [11, B], [12, C2], [13, G], [14, E], [15, G]];
  [0, 16].forEach(function (off) { phrase.forEach(function (p) { var at = (off + p[0]) * SKB_BEAT; if (at < 9.2) n.push([at, p[1]]); }); });
  [[9.4, G], [9.62, A], [9.84, B], [10.06, C2], [10.5, C2 * 1.5]].forEach(function (p) { n.push(p); });
  return n;
})();
var SKB_BASS = (function () {
  var n = [], roots = [130.81, 174.61, 146.83, 196];
  for (var bar = 0; bar < 5; bar++) for (var bt = 0; bt < 4; bt++) { var at = (bar * 4 + bt) * SKB_BEAT; if (at < 9.2) n.push([at, roots[bar % 4] * (bt % 2 ? 1.5 : 1)]); }
  n.push([9.4, 196]); n.push([10.06, 130.81]);
  return n;
})();
function skbJingleFrom(t) { playSalkilldCue("jingle", 0, t); }

function playSalkilldCue(name, len, from) {
  try {
    var ac = getAudioCtx(); if (!ac) return;
    if (ac.state === "suspended") ac.resume();
    if (!SKB.out) { SKB.out = ac.createGain(); SKB.out.gain.value = 0.7; SKB.out.connect(ac.destination); }
    if (!SKB.nb || SKB.nb.sampleRate !== ac.sampleRate) SKB.nb = makeNoiseBuffer(ac, 2);
    var out = SKB.out, now = ac.currentTime + 0.02;
    var tone = function (f0, f1, at, dur, vol, type) {
      var o = ac.createOscillator(), g = ac.createGain();
      o.type = type || "sine"; o.frequency.setValueAtTime(f0, at); if (f1 && f1 !== f0) o.frequency.exponentialRampToValueAtTime(f1, at + dur);
      g.gain.setValueAtTime(0.0001, at); g.gain.exponentialRampToValueAtTime(vol, at + 0.004); g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
      o.connect(g); g.connect(out); o.start(at); o.stop(at + dur + 0.05);
    };
    var noise = function (at, dur, vol, freq, q, type, f1) {
      var n = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain();
      n.buffer = SKB.nb; n.loop = true; f.type = type || "bandpass"; f.frequency.setValueAtTime(freq, at); if (f1) f.frequency.exponentialRampToValueAtTime(f1, at + dur); f.Q.value = q || 1;
      g.gain.setValueAtTime(0.0001, at); g.gain.exponentialRampToValueAtTime(vol, at + 0.003); g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
      n.connect(f); f.connect(g); g.connect(out); n.start(at); n.stop(at + dur + 0.05);
    };
    var glock = function (f, at, v) { tone(f, f, at, 0.7, 0.09 * v); tone(f * 2.76, f * 2.76, at, 0.25, 0.025 * v); tone(f * 4, f * 4, at, 0.12, 0.015 * v); };
    if (name === "jingle") {
      var t0 = from || 0;
      SKB_MEL.forEach(function (n) { if (n[0] >= t0) glock(n[1], now + n[0] - t0, n[0] >= 9.4 ? 1.3 : 1); });
      SKB_BASS.forEach(function (n) { if (n[0] >= t0) tone(n[1], n[1], now + n[0] - t0, SKB_BEAT * 0.8, 0.12, "triangle"); });
      for (var b = 0; b * SKB_BEAT < 9.2; b++) {
        var at = b * SKB_BEAT; if (at < t0) continue;
        if (b % 2) noise(now + at - t0, 0.08, 0.12, 1800, 0.9); // the clap
        else tone(120, 50, now + at - t0, 0.15, 0.25); // a soft kick
      }
    }
    if (name === "chime") { [1046.5, 1318.5, 1568, 2093].forEach(function (f, i) { glock(f, now + i * 0.06, 0.8); }); }
    if (name === "ding") { tone(2093, 2093, now, 1.4, 0.18); tone(4186, 4186, now, 0.6, 0.05); tone(2637, 2637, now, 1.0, 0.06); }
    if (name === "door") { noise(now, 0.25, 0.18, 500, 2, "bandpass", 180); tone(90, 60, now + 0.2, 0.2, 0.25); }
    if (name === "tray") { noise(now, 0.45, 0.12, 2400, 3, "bandpass", 1400); tone(1200, 1150, now + 0.4, 0.2, 0.05, "triangle"); }
    if (name === "pipe") { noise(now, 0.18, 0.08, 900, 4, "bandpass", 1600); }
    if (name === "pop") { tone(400, 900, now, 0.08, 0.2, "triangle"); noise(now, 0.04, 0.12, 2500, 1.5); }
    if (name === "chomp") { noise(now, 0.12, 0.45, 1400, 0.8, "bandpass", 600); tone(160, 80, now, 0.1, 0.25); noise(now + 0.05, 0.08, 0.25, 3200, 1.2); }
    if (name === "aww") { [523.25, 659.25, 783.99].forEach(function (f, i) { tone(f, f * 1.02, now + i * 0.05, 0.8, 0.05, "triangle"); }); }
    if (name === "sparkle") { for (var s = 0; s < 8; s++) tone(2000 + s * 260, 2200 + s * 260, now + s * 0.04, 0.25, 0.04); }
    if (name === "whoosh") noise(now, 0.35, 0.18, 500, 1, "bandpass", 3500);
    if (name === "tag") { tone(98, 98, now + 0.66, 1.5, 0.12, "triangle"); }
  } catch (e) { /* no audio */ }
}
function stopSalkilldSound() {
  if (!SKB.out) return;
  try { SKB.out.disconnect(); } catch (e) { /* already gone */ }
  SKB.out = null;
}
