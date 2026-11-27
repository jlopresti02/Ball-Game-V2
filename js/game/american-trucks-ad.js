// Strickland & Chuck's American Discount Trucks (Joe, 2026-11-27): Sean
// Strickland's truck dealership commercial on the jumbotron (a banner in the
// test arena), co-owned with Chuck Norris. A loud local car-lot ad shot like
// a big-budget truck commercial (golden hour, flares, slow-motion dust),
// following the shot list Joe got with it:
//   1. Aerial over the lot at sunset: lifted pickups, a giant flag, bunting,
//      tube men, the sign lighting up bulb by bulb.
//   2. Low-angle hero shot: the red pickup rolls up, flashes its lights, the grille glints.
// The trucks and the flag are Joe's photos (american-trucks-art.js).
//   3. Strickland walks up and points down the lens: "HERE'S THE DEAL, GUYS."
//   4. The windshield price, slashed and slashed again, star bursts.
//   5. Chuck Norris, co-owner: looks at the price, shakes his head, and
//      roundhouses the sticker off the glass in slow motion. $9,999.
//   6. Both owners in front of the truck, fireworks, the logo, "Here's the
//      deal guys." and fine print read at double speed.
// Once a match: queued the first time Chuck Norris drops in to Strickland's
// America (one-line hook in chuckNorrisArrives, chuck-norris.js), so it goes
// up once America is over. Like the Samurai Sushi ad, if a special, clash,
// lock or cutscene starts while it plays it pauses and finishes after.
// strickland.trucksAd false in his character file switches it off. Plus a
// silent still for the random rotation (drawAmTrucksStill, still-ads.js).
// Only their own two arms each. Code-made sound: a twangy riff with a
// stomp-clap beat, horns, the V8, cha-chings, the marker, the kick.
// Drawing helpers shared with samurai-sushi-ad.js (ssuEase, ssuFade, ssuR,
// ssuStar, ssuTitle are global).
"use strict";

var ATK_SHOW = 12.6;
var ATK_CUTS = [0, 2.3, 3.9, 6.0, 7.8, 10.1, ATK_SHOW];
var ATK_RED = "#c8102e", ATK_BLUE = "#1f3a8a", ATK_GOLD = "#ffcc33";
var ATK_SLAB = "Impact, 'Arial Black', 'Helvetica Neue', Helvetica, Arial, sans-serif";
var ATK_RIFF = [[0.02, 2.3], [10.1, ATK_SHOW - 0.15]];
var ATK_CUES = [["honk", 0.35], ["engine", 2.3], ["shing", 3.25], ["cash", 6.15], ["marker", 6.35], ["cash", 6.62], ["marker", 6.8], ["cash", 7.02],
  ["whoosh", 7.15], ["whoosh", 7.3], ["whoosh", 7.45], ["drone", 7.8], ["boot", 8.7], ["thwack", 9.05], ["slap", 9.4],
  ["pop", 10.35], ["pop", 10.85], ["pop", 11.35], ["honk2", 11.9]];
var ATK = { show: 0, t: 0, id: 0, done: false, paused: false, cue: 0, out: null, nb: null };

// From startMatchWith (through resetAdBreaks).
function resetAmTrucks() { ATK.show = 0; ATK.t = 0; ATK.done = false; ATK.paused = false; ATK.cue = 0; stopAmTrucksSound(); }
// From chuckNorrisArrives (chuck-norris.js): Chuck's just dropped in.
function amTrucksOnChuck(b) {
  var c = b && b.char && b.char.strickland;
  if (ATK.done || (c && c.trucksAd === false) || (typeof galleryDemo !== "undefined" && galleryDemo)) return;
  ATK.done = true; ATK.id = b.id; // (once a match)
  queueJumboAd(ATK_SHOW, function () {
    if (over) { jumboAdLeft = 0; return; }
    ATK.show = ATK_SHOW; ATK.t = 0; ATK.cue = 0; ATK.paused = false;
    atkDuck(); atkRiffFrom(0);
  });
}
function atkDuck() {
  try { var ac = getAudioCtx(); if (ac && typeof duckMusic === "function") duckMusic(ac.currentTime, ac.currentTime + ATK.show); } catch (e) { /* no audio */ }
}
// The riff for whichever stretch the clock is in (from the start, or picking
// back up after a pause).
function atkRiffFrom(t) {
  ATK_RIFF.forEach(function (r) {
    if (t < r[1] - 0.2) playAmTrucksCue("riff", r[1] - Math.max(t, r[0]), Math.max(0, r[0] - t));
  });
}
// A special, a clash, a lock or a cutscene on: the ad holds.
function amTrucksHold() {
  return (typeof jumboHold === "function" && jumboHold(null)) || (typeof sceneLocked === "function" && sceneLocked());
}
// Every frame, from tickAdBreaks (ad-breaks.js).
function tickAmTrucks(dt) {
  if (ATK.show <= 0) return;
  if (amTrucksHold()) {
    if (!ATK.paused) { ATK.paused = true; stopAmTrucksSound(); }
    if (typeof jumboAdLeft !== "undefined" && jumboAdLeft > 0) jumboAdLeft += dt;
    return;
  }
  if (ATK.paused) { ATK.paused = false; atkDuck(); atkRiffFrom(ATK.t); }
  ATK.show = Math.max(0, ATK.show - dt);
  ATK.t = ATK_SHOW - ATK.show;
  while (ATK.cue < ATK_CUES.length && ATK.t >= ATK_CUES[ATK.cue][1]) {
    if (ATK.t - ATK_CUES[ATK.cue][1] < 0.25) playAmTrucksCue(ATK_CUES[ATK.cue][0]);
    ATK.cue++;
  }
}

// ---------------------------------------------------------------- the set
// Sunset sky with the sun low at (sx, sy).
function atkSky(ww, sx, sy, hz) {
  var g = ctx.createLinearGradient(0, -60, 0, hz);
  g.addColorStop(0, "#1d2a63"); g.addColorStop(0.45, "#a3466a"); g.addColorStop(0.8, "#f08a3c"); g.addColorStop(1, "#ffd27a");
  ctx.fillStyle = g; ctx.fillRect(-ww, -300, ww * 3, hz + 300);
  var sg = ctx.createRadialGradient(sx, sy, 4, sx, sy, 160);
  sg.addColorStop(0, "rgba(255,250,215,1)"); sg.addColorStop(0.12, "rgba(255,230,150,0.9)"); sg.addColorStop(1, "rgba(255,180,90,0)");
  ctx.fillStyle = sg; ctx.fillRect(sx - 170, sy - 170, 340, 340);
}
// Lens flare from the sun toward the middle of the frame.
function atkFlare(ww, sx, sy, a) {
  ctx.save(); ctx.globalCompositeOperation = "lighter"; ctx.globalAlpha *= a;
  var cx = ww / 2, cy = 125;
  [[0.35, 14, "rgba(255,200,120,0.25)"], [0.7, 22, "rgba(120,200,255,0.18)"], [1.2, 10, "rgba(255,150,80,0.3)"], [1.6, 30, "rgba(255,220,160,0.12)"]].forEach(function (f) {
    var fx = sx + (cx - sx) * f[0], fy = sy + (cy - sy) * f[0];
    ctx.fillStyle = f[2]; ctx.beginPath(); ctx.arc(fx, fy, f[1], 0, Math.PI * 2); ctx.fill();
  });
  var lg = ctx.createLinearGradient(-ww, 0, ww * 2, 0);
  lg.addColorStop(0, "rgba(255,190,120,0)"); lg.addColorStop(0.5, "rgba(255,210,150,0.45)"); lg.addColorStop(1, "rgba(255,190,120,0)");
  ctx.fillStyle = lg; ctx.fillRect(-ww, sy - 1.5, ww * 3, 3);
  ctx.restore();
}
// The lot: asphalt with painted bays from `hz` down.
function atkGround(ww, hz) {
  var g = ctx.createLinearGradient(0, hz, 0, 260);
  g.addColorStop(0, "#6b5a52"); g.addColorStop(1, "#2a2422");
  ctx.fillStyle = g; ctx.fillRect(-ww, hz, ww * 3, 300);
  ctx.strokeStyle = "rgba(255,240,200,0.25)"; ctx.lineWidth = 1.5;
  for (var i = -10; i <= 10; i++) { ctx.beginPath(); ctx.moveTo(ww / 2 + i * 70, hz); ctx.lineTo(ww / 2 + i * 190, 260); ctx.stroke(); }
}
function atkPoleFlag(x, top, h, fw, t) {
  var p = ATK_PIC.flag, pic = atkPic("flag"), k = fw * 1.03 / p.w, ph = p.h * k;
  ctx.fillStyle = "#b9bcc1"; ctx.fillRect(x - Math.max(1, 2.5 * k), top + ph * 0.9, Math.max(2, 5 * k), h - ph * 0.9);
  if (!pic) return;
  var x0 = x - p.pole * k, step = 4;
  for (var sx = 0; sx < p.w; sx += step) { // Joe's flag in slices, rippling out from the pole
    var u = sx / p.w, dy = Math.sin(u * 6 - t * 5) * u * fw * 0.035;
    ctx.drawImage(pic, sx, 0, Math.min(step, p.w - sx), p.h, x0 + sx * k, top + dy, Math.min(step, p.w - sx) * k + 0.6, ph);
  }
}
// Pennant bunting sagging between two points.
function atkBunting(x0, x1, y, sag, t) {
  ctx.strokeStyle = "#222"; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(x0, y); ctx.quadraticCurveTo((x0 + x1) / 2, y + sag * 2, x1, y); ctx.stroke();
  var n = Math.max(3, Math.floor((x1 - x0) / 14));
  for (var i = 0; i < n; i++) {
    var u = (i + 0.5) / n, px = x0 + (x1 - x0) * u, py = y + sag * 4 * u * (1 - u), sw = Math.sin(t * 4 + i) * 1.5;
    ctx.fillStyle = [ATK_RED, "#ffffff", ATK_BLUE][i % 3];
    ctx.beginPath(); ctx.moveTo(px - 5, py); ctx.lineTo(px + 5, py); ctx.lineTo(px + sw, py + 11); ctx.closePath(); ctx.fill();
  }
}
// An inflatable tube man, flailing.
function atkTubeMan(x, y, h, t, col) {
  ctx.save(); ctx.lineCap = "round"; ctx.lineJoin = "round";
  ctx.fillStyle = "#333"; ctx.fillRect(x - 8, y - 6, 16, 6);
  var pts = [], n = 8;
  for (var i = 0; i <= n; i++) { var u = i / n; pts.push({ x: x + Math.sin(t * 5 + u * 3) * h * 0.18 * u * u, y: y - 6 - u * h + Math.abs(Math.sin(t * 3.3 + u * 2)) * h * 0.08 * u }); }
  ctx.strokeStyle = col; ctx.lineWidth = 9;
  ctx.beginPath(); pts.forEach(function (p, i) { if (i) ctx.lineTo(p.x, p.y); else ctx.moveTo(p.x, p.y); }); ctx.stroke();
  var sh = pts[6], top = pts[n];
  [-1, 1].forEach(function (s) {
    var a = Math.sin(t * 7 + s) * 0.9 - (s > 0 ? 0.6 : 2.5);
    ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(sh.x, sh.y);
    ctx.quadraticCurveTo(sh.x + Math.cos(a) * h * 0.18, sh.y + Math.sin(a) * h * 0.18, sh.x + Math.cos(a + Math.sin(t * 9 + s) * 0.8) * h * 0.32, sh.y + Math.sin(a + Math.sin(t * 9) * 0.8) * h * 0.32); ctx.stroke();
  });
  ctx.fillStyle = "#ffffff"; ctx.beginPath(); ctx.arc(top.x - 2, top.y + 4, 1.8, 0, Math.PI * 2); ctx.arc(top.x + 3, top.y + 4, 1.8, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}
// The big sign: blue board, red frame, chasing bulbs (lit 0..1 turns them on
// one by one), the name in three lines.
function atkSign(cx, cy, s, lit, t) {
  ctx.save(); ctx.translate(cx, cy); ctx.scale(s, s);
  ctx.fillStyle = "#6f747b"; ctx.fillRect(-46, 40, 8, 70); ctx.fillRect(38, 40, 8, 70);
  ctx.fillStyle = ATK_RED; stillRoundRect(-104, -44, 208, 88, 8); ctx.fill();
  ctx.fillStyle = ATK_BLUE; stillRoundRect(-96, -36, 192, 72, 5); ctx.fill();
  var nb = 30;
  for (var i = 0; i < nb; i++) {
    var u = i / nb, px, py;
    if (u < 0.35) { px = -100 + u / 0.35 * 200; py = -40; } else if (u < 0.5) { px = 100; py = -40 + (u - 0.35) / 0.15 * 80; }
    else if (u < 0.85) { px = 100 - (u - 0.5) / 0.35 * 200; py = 40; } else { px = -100; py = 40 - (u - 0.85) / 0.15 * 80; }
    var on = u < lit && (lit >= 1 ? (Math.floor(t * 8) + i) % 3 !== 0 : true);
    ctx.fillStyle = on ? "#fff3b0" : "#6b5a3a";
    if (on) { ctx.shadowColor = "rgba(255,220,120,1)"; ctx.shadowBlur = 6; }
    ctx.beginPath(); ctx.arc(px, py, 2.6, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;
  }
  var a = Math.min(1, lit * 1.5);
  ctx.globalAlpha *= 0.35 + 0.65 * a;
  stillText("STRICKLAND & CHUCK'S", 0, -21, 15, "#ffffff", 176, { face: ATK_SLAB });
  stillText("AMERICAN", 0, 0, 22, ATK_RED, 176, { face: ATK_SLAB, stroke: "#ffffff", strokeW: 0.18 });
  stillText("DISCOUNT TRUCKS", 0, 22, 17, "#ffffff", 176, { face: ATK_SLAB });
  ctx.fillStyle = "#ffffff"; skStarSafe(-86, 0, 7); skStarSafe(86, 0, 7);
  ctx.restore();
}
function skStarSafe(x, y, s) {
  if (typeof skStar === "function") { skStar(ctx, x, y, s); return; }
  ctx.beginPath(); ctx.arc(x, y, s * 0.6, 0, Math.PI * 2); ctx.fill();
}
// A lifted pickup from the side, facing left, standing on (cx, gy), L long.
// o.sticker: the price on the side window ({ text, a, dx, dy, rot }).
// Joe's truck and flag photos (american-trucks-art.js), graded for the
// sunset once they've loaded. "red" and "white" are the photos as they are;
// any other colour repaints the white truck (the black trim stays black).
var ATK_PIC = { red: { src: "ATK_RED_SRC", w: 617, h: 383, glass: [0.54, 0.22], grille: [0.694, 0.47], lights: [[0.42, 0.46], [0.9, 0.44]] },
  white: { src: "ATK_WHITE_SRC", w: 616, h: 322, glass: [0.45, 0.21] },
  flag: { src: "ATK_FLAG_SRC", w: 389, h: 350, pole: 11.5 } };
var atkPicImg = {}, atkPicCache = {};
function atkPicRaw(n) {
  var p = ATK_PIC[n];
  if (!atkPicImg[n]) {
    var src = typeof window !== "undefined" ? window[p.src] : null;
    if (!src) return null;
    atkPicImg[n] = new Image(); atkPicImg[n].src = src;
  }
  var im = atkPicImg[n];
  return im.complete && im.naturalWidth ? im : null;
}
if (typeof Image !== "undefined") ["red", "white", "flag"].forEach(atkPicRaw); // start loading them now, so the still is ready when the rotation picks it
function atkPic(kind) {
  if (atkPicCache[kind]) return atkPicCache[kind];
  var base = kind === "red" || kind === "flag" ? kind : "white", im = atkPicRaw(base);
  if (!im || typeof document === "undefined") return null;
  var p = ATK_PIC[base], cv = document.createElement("canvas"); cv.width = p.w; cv.height = p.h;
  var c = cv.getContext("2d");
  c.drawImage(im, 0, 0, p.w, p.h);
  if (kind !== "red" && kind !== "white" && kind !== "flag") { // repaint: multiply, then back to the truck's own outline
    c.globalCompositeOperation = "multiply"; c.fillStyle = kind; c.fillRect(0, 0, p.w, p.h);
    c.globalCompositeOperation = "destination-in"; c.drawImage(im, 0, 0, p.w, p.h);
  }
  if (kind !== "flag") { // golden hour: warm light on the roof, cooler shade low down
    c.globalCompositeOperation = "source-atop";
    var g = c.createLinearGradient(0, 0, 0, p.h);
    g.addColorStop(0, "rgba(255,160,80,0.22)"); g.addColorStop(0.5, "rgba(255,120,60,0.08)"); g.addColorStop(1, "rgba(30,15,40,0.3)");
    c.fillStyle = g; c.fillRect(0, 0, p.w, p.h);
  }
  atkPicCache[kind] = cv;
  return cv;
}
// A truck photo standing on the ground at gy, H tall, centred on cx.
// o.flip mirrors it; o.sticker puts a price sticker on the windshield;
// o.glint (0..1) runs a glint across the grille; o.lights flashes the headlights.
function atkTruck(cx, gy, H, kind, o) {
  o = o || {};
  var base = kind === "red" ? "red" : "white", p = ATK_PIC[base], W = H * p.w / p.h, pic = atkPic(kind);
  ctx.save(); ctx.translate(cx, gy);
  ctx.fillStyle = "rgba(10,6,12,0.45)"; ctx.beginPath(); ctx.ellipse(0, -H * 0.015, W * 0.5, H * 0.07, 0, 0, Math.PI * 2); ctx.fill();
  if (o.flip) ctx.scale(-1, 1);
  if (pic) ctx.drawImage(pic, -W / 2, -H, W, H);
  if (o.lights > 0 && p.lights) p.lights.forEach(function (l) {
    var lx = -W / 2 + l[0] * W, ly = -H + l[1] * H, lr = W * 0.12 * o.lights;
    var hg = ctx.createRadialGradient(lx, ly, 1, lx, ly, lr);
    hg.addColorStop(0, "rgba(255,252,235,0.95)"); hg.addColorStop(0.3, "rgba(255,245,210,0.45)"); hg.addColorStop(1, "rgba(255,240,200,0)");
    ctx.fillStyle = hg; ctx.fillRect(lx - lr, ly - lr, lr * 2, lr * 2);
  });
  if (o.glint > 0 && o.glint < 1 && p.grille) ssuStar(-W / 2 + (p.grille[0] - 0.16 + o.glint * 0.3) * W, -H + (p.grille[1] - 0.08) * H, W * 0.07 * Math.sin(o.glint * Math.PI), 1);
  ctx.restore();
  if (o.sticker) { var sp = atkTruckSpot(cx, gy, H, kind, o.flip); atkSticker(sp.x + (o.sticker.dx || 0), sp.y + (o.sticker.dy || 0), W * 0.06, o.sticker.text, o.sticker.rot || 0, o.sticker.a == null ? 1 : o.sticker.a, o.sticker.sq); }
}
// Where the windshield is on a truck drawn by atkTruck (for the sticker).
function atkTruckSpot(cx, gy, H, kind, flip) {
  var p = ATK_PIC[kind === "red" ? "red" : "white"], W = H * p.w / p.h, fx = (p.glass[0] - 0.5) * W;
  return { x: cx + (flip ? -fx : fx), y: gy - H + p.glass[1] * H };
}
// A windshield price sticker: neon yellow with the price in marker.
function atkSticker(x, y, s, text, rot, a, sq) {
  if (a <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); if (sq) ctx.scale(1 + sq * 0.3, 1 - sq * 0.3); ctx.globalAlpha *= a;
  ctx.fillStyle = "#f6f03a"; ctx.strokeStyle = "#0b0f12"; ctx.lineWidth = Math.max(0.8, s * 0.04);
  ctx.beginPath();
  for (var i = 0; i < 16; i++) { var an = i / 16 * Math.PI * 2, rr = i % 2 ? s * 0.82 : s; ctx.lineTo(Math.cos(an) * rr * 1.15, Math.sin(an) * rr * 0.8); }
  ctx.closePath(); ctx.fill(); ctx.stroke();
  stillText(text, 0, 0, s * 0.55, ATK_RED, s * 1.8, { face: ATK_SLAB });
  ctx.restore();
}
// Sean Strickland: o.point (0..1 how far up his pointing glove is), o.walk.
function atkStrickland(cx, cy, r, look, name, o) {
  o = o || {};
  var skin = look.skin || "#e3a98f", gr = r * 0.27, bob = o.walk ? Math.abs(Math.sin(o.walk * 10)) * r * 0.05 : 0;
  cy -= bob;
  // his other glove down at his side (far side, behind)
  var fs = { x: cx + r * 0.8, y: cy + r * 0.1 }, fg = { x: cx + r * 1.02, y: cy + r * 0.62 };
  stillFighter(cx, cy, r, look, name);
  strokeLimb(r * 0.18, skin, function () { ctx.moveTo(fs.x, fs.y); ctx.lineTo(fg.x, fg.y); });
  drawGlove(ctx, fg.x, fg.y, gr, look, "#0b0f12", Math.PI / 2 - 0.2);
  // the pointing arm, from his near shoulder out toward the lens
  var p = ssuEase(o.point || 0), sh = { x: cx - r * 0.8, y: cy + r * 0.05 };
  var g = { x: cx - r * (1.0 + 0.35 * p), y: cy + r * (0.55 - 0.6 * p) }, el = { x: cx - r * (1.25 + 0.1 * p), y: cy + r * (0.45 - 0.05 * p) };
  strokeLimb(r * 0.18, skin, function () { ctx.moveTo(sh.x, sh.y); ctx.lineTo(el.x, el.y); ctx.lineTo(g.x, g.y); });
  drawGlove(ctx, g.x, g.y, gr * (1 + 0.25 * p), look, "#0b0f12", Math.atan2(g.y - el.y, g.x - el.x));
}
// Chuck Norris (his own art, kit and hat from chuck-norris.js), drawn at r.
// o.arms "crossed" folds them, otherwise at his sides; o.kick { ang, len, blur }; o.spin; o.tilt.
function atkChuck(cx, cy, r, o) {
  if (typeof CN_LOOK === "undefined") return;
  o = o || {};
  var R = CN_R, s = r / R;
  ctx.save(); ctx.translate(cx, cy); ctx.scale(s, s);
  ctx.fillStyle = "rgba(0,0,0,0.3)"; ctx.beginPath(); ctx.ellipse(0, R * 1.02, R * 0.95, R * 0.16, 0, 0, Math.PI * 2); ctx.fill();
  if (o.kick && o.kick.blur) cnLeg(R, o.kick.ang, o.kick.len, true);
  ctx.save(); ctx.rotate((o.spin || 0) + (o.tilt || 0));
  drawFighterArt(ctx, 0, 0, R, CN_LOOK, "#0b0f12", { layout: "contained", name: "chuck norris" });
  drawCnKit(R);
  ctx.lineWidth = Math.max(2, r * 0.05) / s; ctx.strokeStyle = "#0b0f12"; ctx.beginPath(); ctx.arc(0, 0, R, 0, Math.PI * 2); ctx.stroke(); // the same dark outline as Sean's (stillFighter)
  drawCnHat(R);
  ctx.restore();
  if (o.kick && !o.kick.blur) cnLeg(R, o.kick.ang, o.kick.len, false);
  ctx.restore();
  // his two arms, drawn the way Sean's are (same thickness and outline), bare fists
  var skin = CN_LOOK.skin || "#e3a98f";
  if (o.kick) { // out to the sides for balance, square to the kick
    var ux = Math.cos(o.kick.ang), uy = Math.sin(o.kick.ang), px = -uy, py = ux;
    [-1, 1].forEach(function (sd) {
      var sx = cx + px * sd * r * 0.78, sy = cy + py * sd * r * 0.78;
      var hx = cx + px * sd * r * 1.3 - ux * r * 0.3, hy = cy + py * sd * r * 1.3 - uy * r * 0.3;
      strokeLimb(r * 0.18, skin, function () { ctx.moveTo(sx, sy); ctx.lineTo(hx, hy); });
      atkFist(hx, hy, r * 0.2);
    });
  } else if (o.arms === "crossed") { // arms folded across his chest, the far arm under the near one
    [[1, 0.24], [-1, 0.3]].forEach(function (a) {
      var sd = a[0], sx = cx + sd * r * 0.8, sy = cy + r * 0.12, ex = cx + sd * r * 0.62, ey = cy + r * (a[1] + 0.22), hx = cx - sd * r * 0.5, hy = cy + r * a[1];
      strokeLimb(r * 0.18, skin, function () { ctx.moveTo(sx, sy); ctx.quadraticCurveTo(ex, ey, hx, hy); });
      atkFist(hx, hy, r * 0.17);
    });
  } else { // down at his sides, like Sean's off arm
    [-1, 1].forEach(function (sd) {
      var sx = cx + sd * r * 0.8, sy = cy + r * 0.1, hx = cx + sd * r * 1.02, hy = cy + r * 0.62;
      strokeLimb(r * 0.18, skin, function () { ctx.moveTo(sx, sy); ctx.lineTo(hx, hy); });
      atkFist(hx, hy, r * 0.2);
    });
  }
}
// Chuck's bare fist (no gloves on Chuck Norris), outlined dark like Sean's gloves.
function atkFist(x, y, g) {
  ctx.fillStyle = (CN_LOOK && CN_LOOK.skin) || "#e3a98f"; ctx.strokeStyle = "#0b0f12"; ctx.lineWidth = Math.max(1.5, g * 0.14);
  ctx.beginPath(); ctx.arc(x, y, g, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.strokeStyle = "rgba(0,0,0,0.3)"; ctx.lineWidth = Math.max(1, g * 0.08);
  ctx.beginPath(); ctx.arc(x, y, g * 0.55, -0.9, 0.9); ctx.stroke();
}
// A comic star burst with words.
function atkBurst(x, y, r, col, text, size, rot, sc) {
  if (sc <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(sc, sc);
  ctx.fillStyle = col; ctx.strokeStyle = "#0b0f12"; ctx.lineWidth = 3;
  ctx.beginPath();
  for (var i = 0; i < 28; i++) { var a = i / 28 * Math.PI * 2, rr = i % 2 ? r * 0.78 : r; ctx.lineTo(Math.cos(a) * rr * 1.35, Math.sin(a) * rr); }
  ctx.closePath(); ctx.fill(); ctx.stroke();
  stillText(text, 0, 0, size, "#ffffff", r * 2.3, { face: ATK_SLAB, stroke: "#0b0f12", strokeW: 0.2 });
  ctx.restore();
}
// A TV lower third: a red tag sliding in with a name and a title.
function atkLowerThird(x, y, name, title, u) {
  if (u <= 0) return;
  var e = ssuOut(u), w = 300;
  ctx.save(); ctx.beginPath(); ctx.rect(x, y - 30, w * e + 10, 60); ctx.clip();
  ctx.fillStyle = ATK_RED; ctx.fillRect(x, y - 16, w, 24);
  ctx.fillStyle = ATK_BLUE; ctx.fillRect(x, y + 8, w * 0.75, 16);
  ctx.fillStyle = "#ffffff"; ctx.fillRect(x, y + 7, w, 2);
  stillText(name, x + w / 2, y - 4, 17, "#ffffff", w - 16, { face: ATK_SLAB });
  stillText(title, x + w * 0.375, y + 16, 11, ATK_GOLD, w * 0.7, { face: ATK_SLAB });
  ctx.restore();
}
// Fireworks: deterministic bursts at (x, y) from `at`.
function atkFirework(x, y, R, at, t, col) {
  var u = (t - at) / 1.1;
  if (u < 0 || u > 1) return;
  ctx.save(); ctx.globalCompositeOperation = "lighter"; ctx.globalAlpha *= 1 - u;
  ctx.fillStyle = col;
  for (var i = 0; i < 18; i++) {
    var a = i / 18 * Math.PI * 2, d = R * ssuOut(u * 1.4);
    ctx.beginPath(); ctx.arc(x + Math.cos(a) * d, y + Math.sin(a) * d + u * u * 20, 2.2, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}
function atkDust(cx, gy, spread, u, n, seed) {
  if (u <= 0) return;
  for (var i = 0; i < n; i++) {
    var a = ssuR(seed + i), d = spread * (0.3 + 0.7 * ssuR(seed + i + 40)) * ssuOut(u), rr = 10 + 25 * ssuR(seed + i + 80);
    var x = cx + (a - 0.5) * 2 * d, y = gy - 6 - ssuR(seed + i + 9) * 30 * ssuOut(u);
    var g = ctx.createRadialGradient(x, y, 0, x, y, rr);
    g.addColorStop(0, "rgba(255,210,150," + (0.35 * (1 - u * 0.7)).toFixed(3) + ")"); g.addColorStop(1, "rgba(255,210,150,0)");
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, rr, 0, Math.PI * 2); ctx.fill();
  }
}

// ---------------------------------------------------------------- the shots
function atkShot(i, ww, t, lt, sk, skName) {
  var hz = 168;
  if (i === 0) { // 1. aerial over the lot, the sign lights up
    var z = 1 + lt / 2.3 * 0.1;
    ctx.translate(ww / 2, 150); ctx.scale(z, z); ctx.translate(-ww / 2, -150 - lt * 6);
    atkSky(ww, ww * 0.7, 140, hz);
    atkGround(ww, hz);
    atkPoleFlag(ww * 0.83, 22, 150, 120, t);
    var cols = ["red", "white", "#6a8be0", "#4a4d52", "#c9ccd1", "#e09050"];
    for (var row = 0; row < 2; row++) for (var k = 0; k < 9; k++) {
      var tx = ww * 0.06 + k * ww * 0.115 + row * ww * 0.05, ty = hz + 18 + row * 40;
      if (Math.abs(tx - ww * 0.33) < 90 && row === 0) continue;
      atkTruck(tx, ty, (70 + row * 18) * 0.62, cols[(k + row * 2) % cols.length], { flip: (k + row) % 2 === 1 });
    }
    atkBunting(ww * 0.02, ww * 0.5, hz - 8, 10, t); atkBunting(ww * 0.5, ww * 0.98, hz - 8, 10, t + 1);
    atkSign(ww * 0.33, 95, 1.05, lt / 1.6, t);
    atkTubeMan(ww * 0.14, hz + 6, 95, t, ATK_RED); atkTubeMan(ww * 0.58, hz + 6, 90, t + 2, ATK_BLUE);
    atkFlare(ww, ww * 0.7, 140, 0.8);
  } else if (i === 1) { // 2. the hero truck rolls up, low angle
    atkSky(ww, ww * 0.5, 175, 205);
    atkGround(ww, 205);
    var roll = ssuOut(lt / 1.0), dip = lt > 1.0 && lt < 1.35 ? Math.sin((lt - 1.0) / 0.35 * Math.PI) * 4 : 0;
    var sc = 0.55 + 0.22 * roll;
    ctx.save(); ctx.translate(ww / 2, 238); ctx.scale(sc, sc); ctx.translate(-ww / 2, -238);
    atkTruck(ww / 2, 238 + dip, 290, "red", { glint: (lt - 1.05) / 0.4, lights: 0.45 + (lt > 0.85 && lt < 1.35 ? 0.55 * Math.sin((lt - 0.85) / 0.5 * Math.PI) : 0) });
    ctx.restore();
    atkDust(ww / 2 - 130, 238, 160, lt / 1.6, 7, 3); atkDust(ww / 2 + 130, 238, 160, lt / 1.6, 7, 17);
    atkFlare(ww, ww * 0.5, 175, 0.9);
  } else if (i === 2) { // 3. Strickland: HERE'S THE DEAL, GUYS.
    var z3 = 1 + Math.max(0, lt - 0.6) * 0.03;
    ctx.translate(ww / 2, 200); ctx.scale(z3, z3); ctx.translate(-ww / 2, -200);
    atkSky(ww, ww * 0.85, 120, hz);
    atkGround(ww, hz);
    ctx.save(); ctx.globalAlpha *= 0.55; atkPoleFlag(ww * 0.2, -10, 200, 150, t); ctx.restore();
    atkTruck(ww * 0.74, 244, 270, "red", {});
    var walk = ssuOut(lt / 0.45), sx = ww * 0.12 + (ww * 0.42 - ww * 0.12) * walk;
    atkStrickland(sx, 158, 62, sk, skName, { walk: lt < 0.45 ? lt : 0, point: (lt - 0.55) / 0.2 });
  } else if (i === 3) { // 4. the prices, slashed
    var beats = [0.15, 0.62, 1.02], bump = 0;
    beats.forEach(function (b) { if (lt > b && lt < b + 0.15) bump += (1 - (lt - b) / 0.15) * 0.06; });
    var z4 = 1 + lt * 0.05 + bump;
    ctx.translate(ww / 2, 125); ctx.scale(z4, z4); ctx.translate(-ww / 2, -125);
    var wg = ctx.createLinearGradient(0, 0, 0, 250);
    wg.addColorStop(0, "#f0a060"); wg.addColorStop(0.35, "#3a3550"); wg.addColorStop(1, "#0f131d");
    ctx.fillStyle = wg; ctx.fillRect(-ww, -100, ww * 3, 450);
    ctx.fillStyle = "rgba(255,255,255,0.08)"; ctx.beginPath(); ctx.moveTo(ww * 0.1, 0); ctx.lineTo(ww * 0.25, 0); ctx.lineTo(ww * 0.1, 250); ctx.lineTo(-ww * 0.05, 250); ctx.closePath(); ctx.fill();
    // the sticker, big, and its prices
    ctx.save(); ctx.translate(ww / 2, 128); ctx.rotate(-0.05);
    ctx.fillStyle = "#f6f03a"; ctx.strokeStyle = "#0b0f12"; ctx.lineWidth = 4;
    ctx.beginPath(); for (var p = 0; p < 24; p++) { var an = p / 24 * Math.PI * 2, rr = p % 2 ? 0.86 : 1; ctx.lineTo(Math.cos(an) * 175 * rr, Math.sin(an) * 92 * rr); } ctx.closePath(); ctx.fill(); ctx.stroke();
    stillText("SALE PRICE", 0, -58, 16, "#0b0f12", 200, { face: ATK_SLAB });
    var prices = ["$69,999", "$39,999", "$19,999"];
    prices.forEach(function (pr, n) {
      var at = beats[n], py = -22 + n * 34, sz = n === 2 ? 44 : 30;
      if (lt < at) return;
      var pu = Math.min(1, (lt - at) / 0.12), ps = 1.6 - 0.6 * ssuOut(pu);
      ctx.save(); ctx.translate(n === 2 ? 0 : (n ? 40 : -40), py); ctx.scale(ps, ps);
      stillText(pr, 0, 0, sz, n === 2 ? ATK_RED : "#3a3a3a", 200, { face: ATK_SLAB });
      ctx.restore();
      if (n < 2) { // the marker slash
        var su = ssuEase((lt - at - 0.2) / 0.15);
        if (su > 0) { ctx.strokeStyle = ATK_RED; ctx.lineWidth = 6; ctx.lineCap = "round"; ctx.beginPath(); ctx.moveTo((n ? 40 : -40) - 70, py + 10); ctx.lineTo((n ? 40 : -40) - 70 + 140 * su, py - 10 + 20 * (1 - su) * 0); ctx.stroke(); }
      }
    });
    ctx.restore();
    atkBurst(ww * 0.16, 70, 48, ATK_RED, "EVERY TRUCK MUST GO!", 15, -0.15, ssuOut((lt - 1.15) / 0.12));
    atkBurst(ww * 0.84, 80, 44, ATK_BLUE, "0% APR", 24, 0.12, ssuOut((lt - 1.3) / 0.12));
    if (lt > 1.45) {
      var bu = ssuOut((lt - 1.45) / 0.15);
      ctx.save(); ctx.translate(ww / 2, 214); ctx.scale(bu, bu); ctx.rotate(-0.02);
      ctx.fillStyle = ATK_GOLD; ctx.fillRect(-190, -16, 380, 32); ctx.strokeStyle = "#0b0f12"; ctx.lineWidth = 3; ctx.strokeRect(-190, -16, 380, 32);
      stillText("NO CREDIT? NO PROBLEM.", 0, 1, 22, "#0b0f12", 360, { face: ATK_SLAB });
      ctx.restore();
    }
  } else if (i === 4) { // 5. Chuck Norris, co-owner: the roundhouse
    atkSky(ww, ww * 0.35, 132, hz);
    atkGround(ww, hz);
    var slow = lt > 0.85 && lt < 1.9;
    var truckX = ww * 0.62, L = 360, TH = 220, spot = atkTruckSpot(truckX, 222, TH, "white"), stX = spot.x, stY = spot.y;
    var kickAt = 1.25, flyU = (lt - kickAt) / 1.0, newU = (lt - 1.6) / 0.15;
    atkTruck(truckX, 222, TH, "white", { sticker: lt < kickAt ? { text: "$19,999" } : newU > 0 ? { text: "$9,999", sq: newU < 1 ? 1 - newU : 0 } : null });
    if (lt >= kickAt && flyU < 1) { // the old sticker flying off, spinning
      var fx = stX + flyU * 160, fy = stY - Math.sin(flyU * Math.PI * 0.8) * 90 + flyU * flyU * 60;
      atkSticker(fx, fy, 0.085 * L, "$19,999", flyU * 9, 1 - Math.max(0, flyU - 0.7) / 0.3);
    }
    var cx = stX - 95, cy = 174, r = 50;
    var dxk = stX - cx, dyk = stY - cy, kAng = Math.atan2(dyk, dxk), kLen = Math.sqrt(dxk * dxk + dyk * dyk) / r * CN_R - CN_R * 0.2;
    var o = { arms: "crossed" };
    if (lt > 0.55 && lt < 0.9) o.tilt = Math.sin((lt - 0.55) / 0.35 * Math.PI * 3) * 0.08; // shakes his head
    if (lt >= 0.9 && lt < kickAt) { var su5 = (lt - 0.9) / (kickAt - 0.9); o = { spin: -2 * Math.PI * ssuEase(su5), kick: { ang: kAng - (1 - su5) * 2, len: kLen * (0.5 + 0.5 * su5), blur: true } }; }
    else if (lt >= kickAt && lt < 1.75) o = { kick: { ang: kAng, len: kLen, blur: false } };
    atkDust(cx, 222, 120, slow ? (lt - 0.9) / 1.4 : 0, 8, 51);
    atkChuck(cx, cy, r, o);
    if (lt > kickAt && lt < kickAt + 0.35) ssuStar(stX, stY, 46 * Math.sin((lt - kickAt) / 0.35 * Math.PI), 1);
    if (slow) { ctx.fillStyle = "rgba(255,190,120,0.06)"; ctx.fillRect(-ww, -100, ww * 3, 450); }
    atkFlare(ww, ww * 0.35, 132, 0.7);
  } else { // 6. the owners, the logo, fireworks
    atkSky(ww, ww * 0.25, 150, hz);
    atkFirework(ww * 0.12, 50, 40, 0.25, lt, "#ff5a5a"); atkFirework(ww * 0.42, 40, 46, 0.75, lt, "#ffffff"); atkFirework(ww * 0.27, 30, 36, 1.25, lt, "#7aa8ff");
    atkGround(ww, hz);
    ctx.save(); ctx.globalAlpha *= 0.85; atkPoleFlag(ww * 0.46, 0, 190, 110, t); ctx.restore();
    var z6 = 1 + lt * 0.02; ctx.save(); ctx.translate(ww * 0.25, 230); ctx.scale(z6, z6); ctx.translate(-ww * 0.25, -230);
    atkTruck(ww * 0.25, 214, 205, "red", {});
    atkStrickland(ww * 0.1, 168, 50, sk, skName, { point: 1 });
    atkChuck(ww * 0.39, 170, 48, { arms: "crossed" });
    ctx.restore();
    // the logo
    var lp = ssuOut((lt - 0.15) / 0.3);
    ctx.save(); ctx.translate(ww * 0.74, 82); ctx.scale(lp, lp);
    stillText("STRICKLAND & CHUCK'S", 0, -42, 22, "#ffffff", ww * 0.42, { face: ATK_SLAB, stroke: ATK_BLUE, strokeW: 0.15 });
    stillText("AMERICAN", 0, -6, 44, ATK_RED, ww * 0.46, { face: ATK_SLAB, stroke: "#ffffff", strokeW: 0.12 });
    stillText("DISCOUNT TRUCKS", 0, 34, 32, "#ffffff", ww * 0.46, { face: ATK_SLAB, stroke: ATK_BLUE, strokeW: 0.14 });
    ctx.restore();
    var tg = "Here's the deal guys.", nt = Math.min(tg.length, Math.floor((lt - 0.55) * 40));
    if (nt > 0) stillText(tg.slice(0, nt), ww * 0.74, 160, 26, ATK_GOLD, ww * 0.42, { face: "Georgia, 'Times New Roman', serif", weight: "italic 700", stroke: "#0b0f12", strokeW: 0.12 });
    if (lt > 0.9) { // the fine print racing past
      var fp = "*Parody. Not a real dealership. Chuck Norris does not negotiate. Trucks may be roundhouse-kicked. 0% APR for 0 months. Sean will not take your trade-in. All sales final, no refunds, no crying.";
      ctx.save(); ctx.beginPath(); ctx.rect(ww * 0.5, 186, ww * 0.48, 16); ctx.clip();
      ctx.font = "600 9px 'Helvetica Neue', Helvetica, Arial, sans-serif"; ctx.textBaseline = "middle"; ctx.fillStyle = "#f0e6d8";
      ctx.fillText(fp, ww * 0.98 - (lt - 0.9) * 420, 194);
      ctx.restore();
    }
  }
}

function drawAmTrucksJumbo(x, y, w, h) {
  if (ATK.show <= 0 || ATK.paused || !balls || !balls[ATK.id]) return;
  var b = balls[ATK.id], ch = b.baseChar || b.char;
  atkFrame(x, y, w, h, ATK.t, ch.look || {}, ch.name, Math.min(1, ATK.t / 0.15, ATK.show / 0.4));
}
// One frame of the ad at time t.
function atkFrame(x, y, w, h, t, look, name, alpha) {
  var s = h / 250, ww = w / s;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
  ctx.fillStyle = "#000000"; ctx.fillRect(x, y, w, h);
  ctx.translate(x, y); ctx.scale(s, s);
  var i = 0; while (i < ATK_CUTS.length - 2 && t >= ATK_CUTS[i + 1]) i++;
  var lt = t - ATK_CUTS[i];
  ctx.save(); atkShot(i, ww, t, lt, look, name); ctx.restore();
  // a quick white flash on every cut
  if (i > 0 && lt < 0.08) { ctx.fillStyle = "rgba(255,255,255," + (0.85 * (1 - lt / 0.08)).toFixed(3) + ")"; ctx.fillRect(0, 0, ww, 250); }
  // overlays per shot (outside the camera moves)
  if (i === 2) {
    atkLowerThird(24, 200, "SEAN STRICKLAND", "OWNER", (lt - 0.3) / 0.25);
    if (lt > 0.7) {
      var cu = ssuOut((lt - 0.7) / 0.18);
      ctx.save(); ctx.translate(ww * 0.72, 60); ctx.scale(cu, cu); ctx.rotate(-0.04);
      stillText("\"HERE'S THE DEAL, GUYS.\"", 0, 0, 34, "#ffffff", ww * 0.5, { face: ATK_SLAB, stroke: "#0b0f12", strokeW: 0.16 });
      ctx.restore();
    }
  }
  if (i === 4) atkLowerThird(24, 200, "CHUCK NORRIS", "CO-OWNER", (lt - 0.15) / 0.25);
  // light grain and a warm vignette
  var fr = Math.floor(t * 24);
  ctx.fillStyle = "rgba(255,255,255,0.05)";
  for (var g = 0; g < 60; g++) ctx.fillRect(ssuR(fr * 131 + g) * ww, ssuR(fr * 71 + g + 500) * 250, 1.3, 1.3);
  var vg = ctx.createRadialGradient(ww / 2, 125, 100, ww / 2, 125, ww * 0.62);
  vg.addColorStop(0, "rgba(40,10,0,0)"); vg.addColorStop(1, "rgba(40,10,0,0.45)");
  ctx.fillStyle = vg; ctx.fillRect(0, 0, ww, 250);
  var bar = 12 * Math.min(1, t / 0.3);
  ctx.fillStyle = "#000000"; ctx.fillRect(0, 0, ww, bar); ctx.fillRect(0, 250 - bar, ww, bar);
  ctx.restore();
}
function drawAmTrucksBanner() {
  if (ATK.show <= 0 || stadiumOn()) return;
  drawAmTrucksJumbo(10, 10, W - 20, 110);
}

// The still for the random rotation: a lot poster. The owners in front of the
// red truck at sunset, the sign, the tagline, a price burst.
function drawAmTrucksStill(x, y, w, h, k, ch) {
  var s = h / 250, ww = w / s, look = (ch && ch.look) || {}, name = (ch && ch.name) || "";
  ctx.save();
  ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
  ctx.translate(x, y); ctx.scale(s, s);
  atkSky(ww, ww * 0.25, 150, 168);
  atkGround(ww, 168);
  atkPoleFlag(ww * 0.47, 6, 180, 110, 1.3);
  atkBunting(0, ww * 0.5, 160, 8, 0.4);
  atkTruck(ww * 0.25, 214, 205, "red", { sticker: { text: "$9,999" } });
  atkStrickland(ww * 0.1, 168, 50, look, name, { point: 1 });
  atkChuck(ww * 0.39, 170, 48, { arms: "crossed" });
  atkSign(ww * 0.75, 78, 1.25, 1, 0.3);
  stillText("Here's the deal guys.", ww * 0.75, 170, 26, ATK_GOLD, ww * 0.42, { face: "Georgia, 'Times New Roman', serif", weight: "italic 700", stroke: "#0b0f12", strokeW: 0.12 });
  atkBurst(ww * 0.93, 205, 34, ATK_RED, "0% APR", 17, 0.15, 1);
  stillText("NO CREDIT? NO PROBLEM.", ww * 0.7, 212, 15, "#ffffff", ww * 0.3, { face: ATK_SLAB, stroke: "#0b0f12", strokeW: 0.15 });
  atkFlare(ww, ww * 0.25, 150, 0.6);
  ctx.restore();
}

// ---------------------------------------------------------------- sound
function playAmTrucksCue(name, len, delay) {
  try {
    var ac = getAudioCtx(); if (!ac) return;
    if (ac.state === "suspended") ac.resume();
    if (!ATK.out) { ATK.out = ac.createGain(); ATK.out.gain.value = 0.65; ATK.out.connect(ac.destination); }
    if (!ATK.nb || ATK.nb.sampleRate !== ac.sampleRate) ATK.nb = makeNoiseBuffer(ac, 2);
    var out = ATK.out, now = ac.currentTime + 0.02 + (delay || 0);
    var tone = function (f0, f1, at, dur, vol, type, dest) {
      var o = ac.createOscillator(), g = ac.createGain();
      o.type = type || "sine"; o.frequency.setValueAtTime(f0, at); if (f1 && f1 !== f0) o.frequency.exponentialRampToValueAtTime(f1, at + dur);
      g.gain.setValueAtTime(0.0001, at); g.gain.exponentialRampToValueAtTime(vol, at + 0.005); g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
      o.connect(g); g.connect(dest || out); o.start(at); o.stop(at + dur + 0.05);
    };
    var noise = function (at, dur, vol, freq, q, type, f1) {
      var n = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain();
      n.buffer = ATK.nb; n.loop = true; f.type = type || "bandpass"; f.frequency.setValueAtTime(freq, at); if (f1) f.frequency.exponentialRampToValueAtTime(f1, at + dur); f.Q.value = q || 1;
      g.gain.setValueAtTime(0.0001, at); g.gain.exponentialRampToValueAtTime(vol, at + 0.004); g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
      n.connect(f); f.connect(g); g.connect(out); n.start(at); n.stop(at + dur + 0.05);
    };
    if (name === "riff") { // a twangy overdriven riff in E, stomp-stomp-clap under it
      var d = len || 2, dist = ac.createWaveShaper(), curve = new Float32Array(256);
      for (var c = 0; c < 256; c++) { var xx = c / 128 - 1; curve[c] = Math.tanh(xx * 4); }
      dist.curve = curve;
      var lp = ac.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 2400;
      var gg = ac.createGain(); gg.gain.value = 0.16; dist.connect(lp); lp.connect(gg); gg.connect(out);
      var notes = [82.4, 82.4, 98, 110, 82.4, 123.5, 110, 98], step = 0.25;
      for (var tt = 0, k = 0; tt < d - 0.05; tt += step, k++) {
        var f = notes[k % notes.length];
        tone(f, f, now + tt, step * 0.9, 0.5, "sawtooth", dist); tone(f * 2, f * 2, now + tt, step * 0.6, 0.2, "square", dist);
        if (k % 4 === 0 || k % 4 === 1) tone(120, 45, now + tt, 0.25, 0.4); // stomp
        if (k % 4 === 2) noise(now + tt, 0.12, 0.25, 1500, 0.8); // clap
      }
    }
    if (name === "honk") { tone(350, 350, now, 0.35, 0.12, "square"); tone(440, 440, now, 0.35, 0.1, "square"); }
    if (name === "honk2") [0, 0.25].forEach(function (o) { tone(350, 350, now + o, 0.18, 0.12, "square"); tone(440, 440, now + o, 0.18, 0.1, "square"); });
    if (name === "engine") { // the V8 rumble
      var eo = ac.createOscillator(), eg = ac.createGain(), ef = ac.createBiquadFilter(), lfo = ac.createOscillator(), lg = ac.createGain();
      eo.type = "sawtooth"; eo.frequency.value = 42; lfo.frequency.value = 9; lg.gain.value = 6; lfo.connect(lg); lg.connect(eo.frequency);
      ef.type = "lowpass"; ef.frequency.value = 320;
      eg.gain.setValueAtTime(0.0001, now); eg.gain.exponentialRampToValueAtTime(0.3, now + 0.3); eg.gain.setValueAtTime(0.3, now + 1.1); eg.gain.exponentialRampToValueAtTime(0.0001, now + 1.6);
      eo.connect(ef); ef.connect(eg); eg.connect(out); eo.start(now); lfo.start(now); eo.stop(now + 1.65); lfo.stop(now + 1.65);
      noise(now, 1.4, 0.06, 600, 0.6, "lowpass");
    }
    if (name === "shing") { tone(3800, 4300, now, 0.5, 0.1); noise(now, 0.35, 0.08, 7000, 0.8, "highpass"); }
    if (name === "cash") { noise(now, 0.06, 0.3, 3000, 1.2); [2093, 2637].forEach(function (f, i2) { tone(f, f, now + 0.08 + i2 * 0.05, 0.6, 0.09, "triangle"); }); }
    if (name === "marker") { var mo = ac.createOscillator(), mg = ac.createGain(); mo.type = "triangle"; mo.frequency.setValueAtTime(1800, now); mo.frequency.linearRampToValueAtTime(2600, now + 0.15); mg.gain.setValueAtTime(0.0001, now); mg.gain.exponentialRampToValueAtTime(0.05, now + 0.01); mg.gain.exponentialRampToValueAtTime(0.0001, now + 0.16); mo.connect(mg); mg.connect(out); mo.start(now); mo.stop(now + 0.2); noise(now, 0.15, 0.08, 4000, 2); }
    if (name === "whoosh") noise(now, 0.2, 0.18, 500, 1.2, "bandpass", 2500);
    if (name === "drone") tone(55, 52, now, 2.2, 0.12, "triangle");
    if (name === "boot") noise(now, 0.4, 0.3, 300, 1.2, "bandpass", 2800);
    if (name === "thwack") { tone(160, 50, now, 0.5, 0.45); noise(now, 0.15, 0.5, 1800, 0.7); noise(now, 0.8, 0.15, 400, 0.6, "lowpass", 100); }
    if (name === "slap") { noise(now, 0.05, 0.4, 2400, 1); tone(500, 300, now, 0.06, 0.12, "triangle"); }
    if (name === "pop") { noise(now, 0.08, 0.35, 900, 0.8); noise(now + 0.05, 0.7, 0.08, 6000, 0.5, "highpass"); }
  } catch (e) { /* no audio */ }
}
function stopAmTrucksSound() {
  if (!ATK.out) return;
  try { ATK.out.disconnect(); } catch (e) { /* already gone */ }
  ATK.out = null;
}
