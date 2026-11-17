// Chuck Norris's entrance cutscene, "Operation Roundhouse" (Joe, 2026-11-17).
// The first time Sean Strickland's America calls Chuck Norris in
// (chuck-norris.js) the fight holds and the screen cuts away, shot like an
// over-the-top action movie, as American as it gets. Sean makes the call.
//
// Real seconds from the start:
//   0.00  crash zoom into the jumbotron: SEAN STRICKLAND IS CALLING...
//   0.50  extreme close-up: a red phone, his glove grabs the handset, the dial spins
//   0.85  Sean on the red phone under a giant flag: "GET ME CHUCK NORRIS."
//   1.70  a Texas ranch at sunrise: Chuck's one-arm pushups push the Earth
//         down, the porch phone rings, he stands and tips his hat
//   2.70  suit up, four macro shots on the drums: hat, Ranger star, buckle,
//         knuckles
//   3.70  tracking shot: Chuck standing on the back of a stars-and-stripes
//         jet, arms crossed, two bald eagles on his wings, the sound barrier
//   4.50  drone shot over Mount Rushmore, now with a fifth head in a cowboy hat
//   5.10  top-down over the WWIT stadium at night, searchlights; he salutes
//         and steps off the jet
//   5.60  spinning freefall down at the roof
//   6.20  worm's-eye against the moon: the flag parachute opens, he unclips
//         it and drops
//   7.00  back in the arena: the fight goes on in slow motion (a third of
//         speed) while he rappels down his rope (chuck-norris.js), sparks off
//         his hand, the camera pushing in, reaction shots of the opponent
//         sweating and Sean pointing up at him
//   land  real speed: red, white and blue shockwave, fireworks, a hard shake
//   +0.25 freeze frame in black and white, Chuck (and the explosion he
//         ignores) in colour, CHUCK NORRIS slams in on a flag band
//   +1.6  a giant flag wipes across and the fight carries on as before
// Later Americas in the same fight keep the plain rappel. Turn it off with
// "cutscene": false in special.norris. Every sound is made in code; there
// are no voice lines in it (the captions are only words).
// Only fighters' own two arms. Drawn in 1080x1920 units, cover-scaled.
//
// Hooks: updateAmerica (strickland.js), cnLand / resetChuckNorris
// (chuck-norris.js), frame / runTicks (main.js), the end of draw (draw.js).
"use strict";

var CNC = { pre: 7.0, slow: 1 / 3, land: 0.25, card: 1.6, wipe: 0.6, slowMax: 3.5 };
var CNC_INK = "#0e0f14";

var cncCut = null;     // { ownerId, vicId, stage, u, snap, bus, sparks, landX, landY, sparkT }
var cncPlayed = false; // once a fight

// ---------------------------------------------------------------- running it

// From resetChuckNorris (chuck-norris.js).
function cnCutReset() {
  if (cncCut && cncCut.bus) { try { cncCut.bus.gain.setTargetAtTime(0.0001, audioCtx.currentTime, 0.05); } catch (e) {} }
  cncCut = null; cncPlayed = false;
}
function cnCutOn() { return !!cncCut; }

// From updateAmerica (strickland.js), the moment the eagle's done and America
// is about to go off: true while the cutscene holds it there.
function cnCutHold(self, other) {
  if (cncCut) return cncCut.stage === "pre";
  if (cncPlayed || over) return false;
  var cfg = cnCfg(self);
  if (!cfg || cfg.cutscene === false || cnNum(cfg.chance, 100) < 100 || chuckNorris) return false;
  cncPlayed = true;
  var snap = document.createElement("canvas");
  snap.width = canvas.width; snap.height = canvas.height;
  try { snap.getContext("2d").drawImage(canvas, 0, 0); } catch (e) {}
  cncCut = { ownerId: self.id, vicId: other.id, stage: "pre", u: 0, snap: snap, bus: null, sparks: [], sparkT: 0, landX: 0, landY: 0 };
  shake = 0;
  cncAudio();
  return true;
}

// From cnLand (chuck-norris.js): he's on the mat.
function cnCutLanded(n) {
  var c = cncCut;
  if (!c || c.stage !== "slow") return;
  c.stage = "land"; c.u = 0; c.landX = n.x; c.landY = n.y;
  cncLandSound();
}

// main.js: held through the shots and the freeze frame, slow on the rope.
function cnCutTimeScale() {
  var c = cncCut;
  if (!c) return 1;
  if (c.stage === "pre" || c.stage === "card") return 0;
  if (c.stage === "slow") return CNC.slow;
  return 1;
}

// From main.js every frame, in real time.
function advanceCnCut(dt) {
  var c = cncCut;
  if (!c) return;
  c.u += dt;
  if (c.stage === "pre" && c.u >= CNC.pre) { c.stage = "slow"; c.u = 0; c.snap = null; }
  else if (c.stage === "slow") {
    if (screenFlash > 0.3) screenFlash = 0.3; // the America camera flashes don't white out his slow-motion entrance (dobronx.js)
    cncTickSparks(c, dt);
    if (c.u >= CNC.slowMax || (!chuckNorris && c.u > 0.3)) { c.stage = "wipe"; c.u = 0; cncWhoosh(); } // never stuck in slow motion
  } else if (c.stage === "land") {
    cncTickSparks(c, dt);
    if (c.u >= CNC.land) { c.stage = "card"; c.u = 0; shake = 0; cncCardSound(); }
  } else if (c.stage === "card" && c.u >= CNC.card) { c.stage = "wipe"; c.u = 0; cncWhoosh(); }
  else if (c.stage === "wipe" && c.u >= CNC.wipe) cncCut = null;
}

// ---------------------------------------------------------------- helpers

function cncClamp(k) { return Math.max(0, Math.min(1, k)); }
function cncEase(k) { k = cncClamp(k); return k * k * (3 - 2 * k); }
function cncOut(k) { k = cncClamp(k); return 1 - (1 - k) * (1 - k) * (1 - k); }
function cncRand(i) { var x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }
function cncLerp(a, b, k) { return a + (b - a) * k; }
function cncFont(w, px) { return w + " " + px + "px \"Barlow Condensed\", \"Arial Narrow\", sans-serif"; }

// Text with a thick dark outline and a coloured drop shadow.
function cncText(txt, x, y, px, fill, shadow, align, weight) {
  ctx.save();
  ctx.font = cncFont(weight || "900", px);
  ctx.textAlign = align || "center"; ctx.textBaseline = "middle";
  ctx.lineJoin = "round";
  if (shadow) { ctx.fillStyle = shadow; ctx.fillText(txt, x + px * 0.06, y + px * 0.07); }
  ctx.strokeStyle = CNC_INK; ctx.lineWidth = Math.max(4, px * 0.12); ctx.strokeText(txt, x, y);
  ctx.fillStyle = fill; ctx.fillText(txt, x, y);
  ctx.restore();
}
// A caption that types on, letter by letter.
function cncType(txt, x, y, px, fill, shadow, k) {
  var n = Math.floor(txt.length * cncClamp(k));
  if (n <= 0) return;
  cncText(txt.slice(0, n), x, y, px, fill, shadow);
}
// A lens flare: a bright core, a horizontal streak and a few ghosts along the
// line through the middle of the frame.
function cncFlare(x, y, size, a) {
  if (a <= 0.01) return;
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.globalAlpha = a;
  var g = ctx.createRadialGradient(x, y, 0, x, y, size);
  g.addColorStop(0, "rgba(255,255,240,1)"); g.addColorStop(0.25, "rgba(255,220,150,0.55)"); g.addColorStop(1, "rgba(255,160,60,0)");
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, size, 0, Math.PI * 2); ctx.fill();
  var s = ctx.createLinearGradient(x - size * 4, y, x + size * 4, y);
  s.addColorStop(0, "rgba(120,180,255,0)"); s.addColorStop(0.5, "rgba(200,230,255,0.8)"); s.addColorStop(1, "rgba(120,180,255,0)");
  ctx.fillStyle = s; ctx.fillRect(x - size * 4, y - size * 0.05, size * 8, size * 0.1);
  var dx = 540 - x, dy = 960 - y;
  [[0.6, 0.18, "rgba(120,255,200,0.25)"], [1.2, 0.3, "rgba(255,120,200,0.18)"], [1.7, 0.12, "rgba(140,170,255,0.3)"]].forEach(function (gh) {
    ctx.fillStyle = gh[2];
    ctx.beginPath(); ctx.arc(x + dx * gh[0] * 2, y + dy * gh[0] * 2, size * gh[1], 0, Math.PI * 2); ctx.fill();
  });
  ctx.restore();
}
// God rays fanning out of a point.
function cncRays(x, y, len, n, a, spin, col) {
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  for (var i = 0; i < n; i++) {
    var ang = spin + i * Math.PI * 2 / n, w = 0.06 + 0.05 * cncRand(i + 3);
    ctx.globalAlpha = a * (0.5 + 0.5 * cncRand(i));
    var g = ctx.createRadialGradient(x, y, 0, x, y, len);
    g.addColorStop(0, col); g.addColorStop(1, "rgba(255,200,120,0)");
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.arc(x, y, len, ang - w, ang + w); ctx.closePath(); ctx.fill();
  }
  ctx.restore();
}
// A big American flag, waving, filling (x, y, w, h).
function cncFlag(x, y, w, h, phase, amp) {
  var cols = 24, stripes = 13, cw = w * 0.4, chh = h * 7 / 13;
  amp = amp == null ? h * 0.05 : amp;
  for (var i = 0; i < cols; i++) {
    var u0 = i / cols, u1 = (i + 1) / cols;
    var o0 = Math.sin(phase + u0 * 7) * amp * (0.3 + u0), o1 = Math.sin(phase + u1 * 7) * amp * (0.3 + u1);
    var shade = 0.82 + 0.18 * Math.cos(phase + u0 * 7);
    for (var s = 0; s < stripes; s++) {
      var v0 = s / stripes, v1 = (s + 1) / stripes, canton = u1 <= 0.4 + 1e-6 && s < 7;
      var col = canton ? [31, 58, 138] : s % 2 ? [255, 255, 255] : [200, 16, 46];
      ctx.fillStyle = "rgb(" + Math.round(col[0] * shade) + "," + Math.round(col[1] * shade) + "," + Math.round(col[2] * shade) + ")";
      ctx.beginPath();
      ctx.moveTo(x + u0 * w, y + v0 * h + o0); ctx.lineTo(x + u1 * w + 1, y + v0 * h + o1);
      ctx.lineTo(x + u1 * w + 1, y + v1 * h + o1); ctx.lineTo(x + u0 * w, y + v1 * h + o0);
      ctx.closePath(); ctx.fill();
    }
  }
  ctx.fillStyle = "#ffffff";
  for (var r = 0; r < 5; r++) for (var c = 0; c < 6; c++) {
    var ux = (c + (r % 2 ? 1 : 0.5)) / 6.5 * 0.4, oy = Math.sin(phase + ux * 7) * amp * (0.3 + ux);
    skStar(ctx, x + ux * w, y + (r + 0.6) / 5.4 * chh + oy, Math.min(w, h) * 0.022);
  }
}
// Film grain, a vignette and thin black bars: the movie look over every shot.
function cncMovieLook(u) {
  var v = ctx.createRadialGradient(540, 960, 420, 540, 960, 1250);
  v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, "rgba(0,0,0,0.6)");
  ctx.fillStyle = v; ctx.fillRect(0, 0, 1080, 1920);
  ctx.save();
  ctx.globalAlpha = 0.07;
  var f = Math.floor(u * 24);
  for (var i = 0; i < 90; i++) {
    ctx.fillStyle = cncRand(i + f * 91) > 0.5 ? "#fff" : "#000";
    ctx.fillRect(cncRand(i * 3 + f) * 1080, cncRand(i * 7 + f * 3) * 1920, 3, 3);
  }
  ctx.restore();
  ctx.fillStyle = "#000"; ctx.fillRect(0, 0, 1080, 130); ctx.fillRect(0, 1790, 1080, 130);
}

// Sean (the fighter who called it) and the opponent.
function cncOwner() { return cncCut && balls && balls[cncCut.ownerId]; }
function cncVic() { return cncCut && balls && balls[cncCut.vicId]; }
function cncFighter(b, x, y, r) { drawFighterArt(ctx, x, y, r, b.char.look, theme.wall, { layout: "contained", name: b.char.name }); }
function cncArm(b, side, sx, sy, ex, ey, hx, hy, r, ang) {
  strokeLimb(r * 0.26, armColor(b.char, side), function () { ctx.moveTo(sx, sy); ctx.quadraticCurveTo(ex, ey, hx, hy); });
  drawGloveAt(hx, hy, r * 0.24, b.char, ang);
}
// Chuck at any size (his own art from chuck-norris.js, drawn at CN_R and scaled).
function cncChuck(x, y, r, arms, rot) {
  ctx.save();
  ctx.translate(x, y); ctx.scale(r / CN_R, r / CN_R); ctx.rotate(rot || 0);
  drawFighterArt(ctx, 0, 0, CN_R, CN_LOOK, theme.wall, { layout: "contained", name: "chuck norris" });
  drawCnKit(CN_R);
  drawCnHat(CN_R);
  if (arms === "crossed") { cnCrossedArms(CN_R); }
  else if (arms === "salute") cnSalute(CN_R, CN_SALUTE * 0.5);
  else if (arms === "tip") cnSalute(CN_R, CN_SALUTE * 0.5);
  else if (arms === "down") cnWalkArms(CN_R, 0);
  else if (arms === "rope") cnRappelArms(CN_R);
  ctx.restore();
}

// ---------------------------------------------------------------- drawing

// From the end of draw (draw.js). ox, oy, sc: where the arena is on screen.
function drawCnCut(sc, ox, oy) {
  var c = cncCut;
  if (!c) return;
  if (c.stage === "pre") { cncDrawPre(c); return; }
  cncDrawArena(c, sc, ox, oy);
}

function cncCover(fn) {
  var cw = canvas.width, ch = canvas.height, k = Math.max(cw / 1080, ch / 1920);
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = "#000"; ctx.fillRect(0, 0, cw, ch);
  ctx.translate((cw - 1080 * k) / 2, (ch - 1920 * k) / 2); ctx.scale(k, k);
  ctx.beginPath(); ctx.rect(0, 0, 1080, 1920); ctx.clip();
  fn();
  ctx.restore();
}

function cncDrawPre(c) {
  var u = c.u;
  cncCover(function () {
    if (u < 0.5) cncShotCall(c, u);
    else if (u < 0.85) cncShotPhone(c, u - 0.5);
    else if (u < 1.7) cncShotSean(c, u - 0.85);
    else if (u < 2.7) cncShotRanch(u - 1.7);
    else if (u < 3.7) cncShotSuitUp(u - 2.7);
    else if (u < 4.5) cncShotJet(u - 3.7);
    else if (u < 5.1) cncShotRushmore(u - 4.5);
    else if (u < 6.2) cncShotDrop(u - 5.1);
    else cncShotMoon(u - 6.2);
    cncMovieLook(u);
    // hard cuts get a single white frame on the big ones
    [0.5, 1.7, 3.7, 5.1].forEach(function (at) {
      var d = u - at;
      if (d >= 0 && d < 0.05) { ctx.fillStyle = "rgba(255,255,255," + (0.6 * (1 - d / 0.05)) + ")"; ctx.fillRect(0, 0, 1080, 1920); }
    });
    if (u > 6.88) { ctx.fillStyle = "rgba(255,255,255," + cncClamp((u - 6.88) / 0.12) + ")"; ctx.fillRect(0, 0, 1080, 1920); }
  });
}

// 1. Crash zoom into the jumbotron, which has gone red: Sean's calling.
function cncShotCall(c, u) {
  var k = cncEase(u / 0.45), z = 1 + 0.75 * k * k;
  var jx = 540, jy = 363, ty = cncLerp(363, 760, k);
  function scene() {
    if (c.snap) {
      var cw = c.snap.width, ch = c.snap.height, s = Math.max(cw / 1080, ch / 1920);
      ctx.drawImage(c.snap, 540 - cw / s / 2, 960 - ch / s / 2, cw / s, ch / s);
    }
    // the jumbotron, glitched red
    var gx = 30, gy = 224, gw = 1020, gh = 278;
    ctx.fillStyle = "#3a0008"; ctx.fillRect(gx, gy, gw, gh);
    var flash = Math.floor(u * 12) % 2;
    ctx.fillStyle = flash ? "#b0001c" : "#7a0012"; ctx.fillRect(gx + 8, gy + 8, gw - 16, gh - 16);
    for (var i = 0; i < 9; i++) {
      var sy = gy + cncRand(i + Math.floor(u * 30)) * gh, sh = 6 + cncRand(i * 5) * 18, off = (cncRand(i * 9 + Math.floor(u * 30)) - 0.5) * 60;
      ctx.fillStyle = "rgba(255,80,90,0.35)"; ctx.fillRect(gx + 8 + off, sy, gw - 16, sh);
    }
    ctx.fillStyle = "rgba(0,0,0,0.25)";
    for (var y = gy + 8; y < gy + gh - 8; y += 6) ctx.fillRect(gx + 8, y, gw - 16, 2);
    // a phone icon, shaking
    var px = gx + 150, py = gy + gh / 2, sh2 = Math.sin(u * 90) * 6;
    ctx.save(); ctx.translate(px + sh2, py); ctx.rotate(-0.3);
    ctx.fillStyle = "#fff"; ctx.strokeStyle = CNC_INK; ctx.lineWidth = 6;
    ctx.beginPath(); ctx.roundRect(-70, -26, 140, 52, 26); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.roundRect(-78, -14, 44, 60, 14); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.roundRect(34, -14, 44, 60, 14); ctx.fill(); ctx.stroke();
    ctx.restore();
    cncText("SEAN STRICKLAND", gx + gw / 2 + 80, gy + 95, 74, "#ffffff", "#000");
    cncText("IS CALLING...", gx + gw / 2 + 80, gy + 185, 66, "#ffe14d", "#000");
  }
  ctx.save();
  // the smear: ghost copies trailing the zoom
  if (!reduceMotion && u > 0.12) {
    [0.82, 0.9].forEach(function (g, i) {
      ctx.save(); ctx.globalAlpha = 0.25 - i * 0.08;
      ctx.translate(jx, ty); ctx.scale(z * g, z * g); ctx.translate(-jx, -jy);
      scene(); ctx.restore();
    });
  }
  ctx.translate(jx, ty); ctx.scale(z, z); ctx.translate(-jx, -jy);
  scene();
  ctx.restore();
  // the whole arena goes red with the alarm
  ctx.fillStyle = "rgba(255,0,30," + (0.12 + 0.12 * (Math.floor(u * 12) % 2)) + ")"; ctx.fillRect(0, 0, 1080, 1920);
}

// The red phone (the base), at (x, y), size s.
function cncRedPhone(x, y, s, dialSpin, ringing) {
  ctx.save();
  ctx.translate(x, y); ctx.scale(s, s);
  if (ringing) ctx.translate(Math.sin(ringing * 80) * 4, 0);
  ctx.lineJoin = "round"; ctx.strokeStyle = CNC_INK; ctx.lineWidth = 8;
  var g = ctx.createLinearGradient(0, -120, 0, 120);
  g.addColorStop(0, "#ff3b3b"); g.addColorStop(0.5, "#c8101e"); g.addColorStop(1, "#6e0610");
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.moveTo(-200, 110); ctx.lineTo(-150, -70); ctx.quadraticCurveTo(0, -100, 150, -70); ctx.lineTo(200, 110); ctx.closePath(); ctx.fill(); ctx.stroke();
  // the dial
  ctx.fillStyle = "#f2efe6"; ctx.beginPath(); ctx.arc(0, 30, 82, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.save(); ctx.rotate(dialSpin || 0);
  ctx.fillStyle = "#2b2b2b";
  for (var i = 0; i < 10; i++) { var a = -Math.PI * 0.35 + i * Math.PI * 1.5 / 9; ctx.beginPath(); ctx.arc(Math.cos(a) * 56, 30 + Math.sin(a) * 56, 13, 0, Math.PI * 2); ctx.fill(); }
  ctx.restore();
  ctx.fillStyle = "#c8101e"; ctx.beginPath(); ctx.arc(0, 30, 26, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = "#fff"; skStar(ctx, 0, 30, 18);
  // the eagle seal plate
  ctx.fillStyle = "#e3c46b"; ctx.beginPath(); ctx.roundRect(-60, 112, 120, 26, 6); ctx.fill(); ctx.stroke();
  ctx.restore();
}
function cncHandset(x, y, s, ang) {
  ctx.save();
  ctx.translate(x, y); ctx.rotate(ang); ctx.scale(s, s);
  ctx.lineJoin = "round"; ctx.strokeStyle = CNC_INK; ctx.lineWidth = 8;
  ctx.fillStyle = "#d4121f";
  ctx.beginPath(); ctx.roundRect(-150, -26, 300, 52, 26); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.roundRect(-170, -20, 70, 70, 22); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.roundRect(100, -20, 70, 70, 22); ctx.fill(); ctx.stroke();
  ctx.fillStyle = "rgba(255,255,255,0.3)"; ctx.fillRect(-120, -16, 240, 8);
  ctx.restore();
}

// 2a. Extreme close-up: the red phone, his glove grabbing the handset.
function cncShotPhone(c, u) {
  var b = cncOwner();
  var g = ctx.createRadialGradient(540, 1000, 50, 540, 1000, 900);
  g.addColorStop(0, "#3b2a20"); g.addColorStop(1, "#0b0705");
  ctx.fillStyle = g; ctx.fillRect(0, 0, 1080, 1920);
  // the desk
  ctx.fillStyle = "#4a2a16"; ctx.fillRect(0, 1180, 1080, 740);
  ctx.fillStyle = "rgba(255,200,140,0.15)"; ctx.fillRect(0, 1180, 1080, 10);
  var lift = cncEase((u - 0.12) / 0.2), z = 1.15 + 0.08 * u;
  ctx.save(); ctx.translate(540, 1000); ctx.scale(z, z); ctx.translate(-540, -1000);
  cncRedPhone(540, 1080, 1.9, u * 9, u < 0.14 ? u + 1 : 0);
  // the cord
  ctx.strokeStyle = "#8e0a14"; ctx.lineWidth = 12;
  ctx.beginPath(); ctx.moveTo(220, 1160);
  for (var i = 0; i <= 20; i++) { var k = i / 20; ctx.lineTo(cncLerp(220, 300 + 200 * lift, k) + Math.sin(k * 40) * 14, cncLerp(1160, 820 - 260 * lift, k)); }
  ctx.stroke();
  var hx = 470 - 120 * lift, hy = 820 - 300 * lift;
  cncHandset(hx, hy, 1.3, -0.05 - 0.4 * lift);
  if (b && b.char) {
    // his own glove, in from the lower right, closing round the handset
    var gx = hx + 160, gy = hy + 10;
    strokeLimb(70, armColor(b.char, 1), function () { ctx.moveTo(1200, 1500); ctx.quadraticCurveTo(1000, 1000, gx, gy); });
    drawGloveAt(gx, gy, 66, b.char, Math.atan2(gy - 1000, gx - 1000));
  }
  ctx.restore();
  if (u < 0.15) {
    ctx.strokeStyle = "#ffe14d"; ctx.lineWidth = 8; ctx.lineCap = "round";
    [-1, 1].forEach(function (s) { for (var j = 0; j < 3; j++) { ctx.beginPath(); ctx.arc(540, 1000, 330 + j * 40, s > 0 ? -0.5 : Math.PI - 0.5 + 0.0, s > 0 ? 0.5 : Math.PI + 0.5); ctx.stroke(); } });
  }
  cncText("THE RED PHONE", 540, 330, 58, "#ffffff", "#c8101e");
}

// 2b. Sean on the red phone, a giant flag behind him: "GET ME CHUCK NORRIS."
function cncShotSean(c, u) {
  var b = cncOwner();
  var bg = ctx.createLinearGradient(0, 0, 0, 1920);
  bg.addColorStop(0, "#0a1230"); bg.addColorStop(1, "#02040c");
  ctx.fillStyle = bg; ctx.fillRect(0, 0, 1080, 1920);
  var z = 1 + 0.06 * u, rot = reduceMotion ? 0 : -0.04;
  ctx.save();
  ctx.translate(540, 960); ctx.rotate(rot); ctx.scale(z, z); ctx.translate(-540, -960);
  ctx.globalAlpha = 0.85;
  cncFlag(-60, 260, 1200, 760, u * 5, 30);
  ctx.globalAlpha = 1;
  // a spotlight from above
  ctx.save(); ctx.globalCompositeOperation = "lighter";
  var sp = ctx.createRadialGradient(520, 820, 40, 520, 820, 520);
  sp.addColorStop(0, "rgba(255,240,210,0.35)"); sp.addColorStop(1, "rgba(255,240,210,0)");
  ctx.fillStyle = sp; ctx.fillRect(0, 300, 1080, 1100);
  ctx.restore();
  var dk = ctx.createLinearGradient(0, 900, 0, 1500);
  dk.addColorStop(0, "rgba(2,4,12,0)"); dk.addColorStop(1, "rgba(2,4,12,0.95)");
  ctx.fillStyle = dk; ctx.fillRect(0, 900, 1080, 1100);
  if (b && b.char) {
    var x = 500, y = 860, r = 250;
    // the cord, from the handset down out of the frame
    ctx.strokeStyle = "#8e0a14"; ctx.lineWidth = 10;
    ctx.beginPath(); ctx.moveTo(x + r * 1.05, y - r * 0.2);
    for (var i = 0; i <= 24; i++) { var k = i / 24; ctx.lineTo(cncLerp(x + r * 1.05, 980, k) + Math.sin(k * 44) * 12, cncLerp(y - r * 0.2, 1500, k)); }
    ctx.stroke();
    cncFighter(b, x, y, r);
    // his lead hand low across his stomach (the Philly shell), the rear
    // hand holding the red handset up to the side of his head
    cncArm(b, -1, x - r * 0.75, y + r * 0.25, x - r * 0.6, y + r * 0.9, x + r * 0.05, y + r * 0.72, r, 0.2);
    var hx = x + r * 0.92, hy = y - r * 0.55;
    cncHandset(hx + r * 0.05, hy - r * 0.2, 1.05, -1.25);
    cncArm(b, 1, x + r * 0.78, y + r * 0.2, x + r * 1.35, y + r * 0.2, hx + r * 0.1, hy, r, -1.8);
  }
  ctx.restore();
  cncText("SEAN STRICKLAND NEEDS BACKUP.", 540, 1270, 46, "#e3cd9a", "#000", "center", "800");
  cncType("\"GET ME CHUCK NORRIS.\"", 540, 1370, 82, "#ffffff", "#c8101e", (u - 0.12) / 0.45);
}

// The ranch's landscape (everything that dips when he pushes the Earth down).
function cncRanchLand(u) {
  var sky = ctx.createLinearGradient(0, 130, 0, 1150);
  sky.addColorStop(0, "#2a3e7a"); sky.addColorStop(0.45, "#e86a3a"); sky.addColorStop(0.8, "#ffc060"); sky.addColorStop(1, "#ffe7a0");
  ctx.fillStyle = sky; ctx.fillRect(-50, -50, 1180, 1300);
  cncRays(700, 1000, 1400, 14, 0.22, u * 0.15, "rgba(255,230,160,0.9)");
  var sun = ctx.createRadialGradient(700, 1000, 60, 700, 1000, 380);
  sun.addColorStop(0, "#fffbe0"); sun.addColorStop(0.55, "#ffd060"); sun.addColorStop(1, "rgba(255,150,40,0)");
  ctx.fillStyle = sun; ctx.beginPath(); ctx.arc(700, 1000, 380, 0, Math.PI * 2); ctx.fill();
  // the plain
  ctx.fillStyle = "#6b3e1e"; ctx.fillRect(-50, 1110, 1180, 500);
  ctx.fillStyle = "#3a200e";
  // the windmill
  ctx.fillRect(140, 760, 12, 360); ctx.fillRect(120, 1110, 52, 8);
  ctx.save(); ctx.translate(146, 760); ctx.rotate(u * 3);
  for (var i = 0; i < 12; i++) { ctx.rotate(Math.PI / 6); ctx.fillRect(0, -6, 90, 12); }
  ctx.restore();
  ctx.beginPath(); ctx.moveTo(150, 760); ctx.lineTo(240, 740); ctx.lineTo(240, 780); ctx.closePath(); ctx.fill();
  // the pumpjack, nodding
  var nod = Math.sin(u * 5) * 0.25;
  ctx.fillRect(880, 1000, 16, 110); ctx.fillRect(840, 1100, 120, 12);
  ctx.save(); ctx.translate(888, 1000); ctx.rotate(nod);
  ctx.fillRect(-120, -10, 220, 20);
  ctx.beginPath(); ctx.moveTo(-120, -30); ctx.quadraticCurveTo(-170, 0, -120, 40); ctx.closePath(); ctx.fill();
  ctx.restore();
  // longhorns on the horizon
  [[420, 1106], [520, 1110], [610, 1104]].forEach(function (p, j) {
    ctx.beginPath(); ctx.ellipse(p[0], p[1], 26, 12, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillRect(p[0] - 22, p[1], 5, 14); ctx.fillRect(p[0] + 17, p[1], 5, 14);
    ctx.beginPath(); ctx.arc(p[0] + 30 * (j % 2 ? -1 : 1), p[1] - 8, 9, 0, Math.PI * 2); ctx.fill();
    ctx.lineWidth = 4; ctx.strokeStyle = "#3a200e";
    ctx.beginPath(); ctx.moveTo(p[0] + 30 * (j % 2 ? -1 : 1) - 24, p[1] - 22); ctx.quadraticCurveTo(p[0] + 30 * (j % 2 ? -1 : 1), p[1] - 8, p[0] + 30 * (j % 2 ? -1 : 1) + 24, p[1] - 22); ctx.stroke();
  });
  // the flagpole, with a flag the size of a barn
  ctx.fillStyle = "#d8d2c0"; ctx.fillRect(318, 330, 10, 790);
  ctx.fillStyle = "#e3c46b"; ctx.beginPath(); ctx.arc(323, 326, 12, 0, Math.PI * 2); ctx.fill();
  cncFlag(328, 340, 460, 270, u * 6, 16);
}

// 3. The ranch at sunrise.
function cncShotRanch(u) {
  // one-arm pushups: three reps, then the phone, then he stands
  var reps = 1.05, standing = u >= reps;
  var cyc = standing ? 0 : (u % 0.35) / 0.35, down = standing ? 0 : Math.sin(cyc * Math.PI); // 0 up, 1 down
  var push = !standing && cyc > 0.5 ? Math.sin((cyc - 0.5) * 2 * Math.PI) : 0;           // the push up
  var dip = reduceMotion ? 0 : push * 14;
  var z = 1 + 0.07 * u;
  ctx.save();
  ctx.translate(540, 1200); ctx.scale(z, z); ctx.translate(-540, -1200);
  ctx.save(); ctx.translate(0, dip); cncRanchLand(u); ctx.restore();
  // the porch
  ctx.fillStyle = "#8a5a32"; ctx.fillRect(-50, 1300, 1180, 700);
  ctx.strokeStyle = "#5a3618"; ctx.lineWidth = 5;
  for (var y = 1330; y < 1900; y += 46) { ctx.beginPath(); ctx.moveTo(-50, y); ctx.lineTo(1130, y); ctx.stroke(); }
  ctx.fillStyle = "#6e4424";
  ctx.fillRect(900, 1080, 26, 230); ctx.fillRect(760, 1080, 400, 24);
  // the rotary phone on the rail, ringing
  var ring = u > 0.9 && u < 1.35 ? u : 0;
  cncRedPhone(840, 1050, 0.32, 0, ring ? ring + 1 : 0);
  if (ring) {
    ctx.strokeStyle = "#fff"; ctx.lineWidth = 5; ctx.lineCap = "round";
    for (var j = 0; j < 2; j++) { ctx.beginPath(); ctx.arc(840, 1040, 70 + j * 22, -2.4, -0.7); ctx.stroke(); }
  }
  // Chuck
  var r = 200, x = 430, baseY = 1300 - r * 0.62;
  var y2 = standing ? cncLerp(baseY - 0 + 0, 1300 - r - 40, cncOut((u - reps) / 0.3)) : baseY + down * 45 - 45;
  // dust jumping off the boards on each rep
  if (push > 0.6 && !reduceMotion) {
    ctx.fillStyle = "rgba(220,190,140,0.6)";
    for (var d = 0; d < 8; d++) { ctx.beginPath(); ctx.arc(x + 200 + (cncRand(d) - 0.5) * 200, 1300 - cncRand(d + 9) * 40 * push, 6 + cncRand(d + 4) * 8, 0, Math.PI * 2); ctx.fill(); }
  }
  ctx.save(); ctx.translate(x, y2); ctx.scale(r / CN_R, r / CN_R);
  if (!standing) {
    // one arm down to the boards, the other tucked behind his back
    cnArm(-CN_R * 0.7, CN_R * 0.05, -CN_R * 1.0, CN_R * 0.55, 13);
    drawFighterArt(ctx, 0, 0, CN_R, CN_LOOK, theme.wall, { layout: "contained", name: "chuck norris" });
    drawCnKit(CN_R); drawCnHat(CN_R);
    var handY = (1300 - y2) / (r / CN_R);
    cnBentArm(CN_R * 0.6, CN_R * 0.1, CN_R * 1.15, CN_R * 0.2 + handY * 0.4, CN_R * 1.2, handY - 4, 13);
  } else {
    drawFighterArt(ctx, 0, 0, CN_R, CN_LOOK, theme.wall, { layout: "contained", name: "chuck norris" });
    drawCnKit(CN_R); drawCnHat(CN_R);
    cnSalute(CN_R, cncClamp((u - reps - 0.25) / 0.6) * CN_SALUTE); // tips his hat
  }
  ctx.restore();
  ctx.restore();
  cncFlare(700, 1000 + dip, 160, 0.7);
  cncText("SOMEWHERE IN TEXAS", 540, 330, 64, "#ffe7a0", "#7a2a10");
}

// 4. Suit up: four macro shots, a quarter second each.
function cncShotSuitUp(u) {
  var i = Math.min(3, Math.floor(u / 0.25)), k = (u - i * 0.25) / 0.25;
  var punch = reduceMotion ? 1 : 1 + 0.06 * (1 - cncOut(k * 3));
  ctx.save(); ctx.translate(540, 960); ctx.scale(punch, punch); ctx.translate(-540, -960);
  if (i === 0) cncMacroHat(k);
  else if (i === 1) cncMacroStar(k);
  else if (i === 2) cncMacroBuckle(k);
  else cncMacroKnuckles(k);
  ctx.restore();
}
function cncDenim(col) {
  ctx.fillStyle = col; ctx.fillRect(0, 0, 1080, 1920);
  ctx.strokeStyle = "rgba(255,255,255,0.07)"; ctx.lineWidth = 3;
  for (var d = -1920; d < 1080; d += 16) { ctx.beginPath(); ctx.moveTo(d, 0); ctx.lineTo(d + 1920, 1920); ctx.stroke(); }
}
function cncMacroHat(k) {
  var bg = ctx.createLinearGradient(0, 0, 0, 1920);
  bg.addColorStop(0, "#ffb060"); bg.addColorStop(1, "#7a2e10");
  ctx.fillStyle = bg; ctx.fillRect(0, 0, 1080, 1920);
  var r = 560, x = 540, y = 1500;
  ctx.save(); ctx.translate(x, y);
  drawFighterArt(ctx, 0, 0, r, CN_LOOK, theme.wall, { layout: "contained", name: "chuck norris" });
  var drop = (1 - cncOut(k / 0.4)) * -700;
  ctx.translate(0, drop);
  drawCnHat(r);
  ctx.restore();
  if (k > 0.38 && !reduceMotion) {
    var d = (k - 0.38) / 0.62;
    ctx.fillStyle = "rgba(210,180,130," + (0.7 * (1 - d)) + ")";
    for (var j = 0; j < 16; j++) {
      var a = Math.PI + (j / 15) * Math.PI;
      ctx.beginPath(); ctx.arc(x + Math.cos(a) * (500 + 260 * d), y - r * 0.85 + Math.sin(a) * 60 * d - 40 * d, 18 + 30 * d, 0, Math.PI * 2); ctx.fill();
    }
  }
}
function cncMacroStar(k) {
  cncDenim(CN_DENIM);
  var slide = (1 - cncOut(k / 0.45)) * 900;
  var x = 540 + slide, y = 900;
  ctx.fillStyle = "#e3e6ea"; ctx.strokeStyle = "#5b6066"; ctx.lineWidth = 12;
  ctx.beginPath(); ctx.arc(x, y, 300, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.strokeStyle = "#9aa1a8"; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(x, y, 255, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = "#b9c0c8"; skStar(ctx, x, y, 240);
  ctx.fillStyle = "rgba(255,255,255,0.45)"; skStar(ctx, x - 14, y - 14, 120);
  ctx.save(); ctx.font = cncFont("900", 44); ctx.fillStyle = "#5b6066"; ctx.textAlign = "center";
  ctx.fillText("TEXAS RANGER", x, y + 210); ctx.restore();
  // his thumb pressing it on
  if (k < 0.7) cnFist.call(null, x + 260, y + 300 - 40 * cncOut(k / 0.45), 90);
  var gl = cncClamp((k - 0.45) / 0.4);
  if (gl > 0 && gl < 1) {
    var gx = cncLerp(x - 260, x + 260, gl), gy = cncLerp(y - 200, y + 120, gl);
    ctx.save(); ctx.globalCompositeOperation = "lighter"; ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.beginPath(); ctx.moveTo(gx, gy - 110); ctx.lineTo(gx + 14, gy - 14); ctx.lineTo(gx + 110, gy); ctx.lineTo(gx + 14, gy + 14);
    ctx.lineTo(gx, gy + 110); ctx.lineTo(gx - 14, gy + 14); ctx.lineTo(gx - 110, gy); ctx.lineTo(gx - 14, gy - 14); ctx.closePath(); ctx.fill();
    ctx.restore();
    cncFlare(gx, gy, 90, 0.8);
  }
}
function cncMacroBuckle(k) {
  cncDenim(CN_JEANS);
  ctx.fillStyle = "#5a3a22"; ctx.fillRect(0, 820, 1080, 200);
  ctx.strokeStyle = "rgba(0,0,0,0.3)"; ctx.setLineDash([18, 14]); ctx.lineWidth = 5;
  ctx.beginPath(); ctx.moveTo(0, 845); ctx.lineTo(1080, 845); ctx.moveTo(0, 995); ctx.lineTo(1080, 995); ctx.stroke(); ctx.setLineDash([]);
  var shut = cncOut(k / 0.3), x = 540 + (1 - shut) * 90, y = 920;
  ctx.fillStyle = "#d4af37"; ctx.strokeStyle = "#7a5a14"; ctx.lineWidth = 14;
  ctx.beginPath(); ctx.ellipse(x, y, 330, 210, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.strokeStyle = "#a8841f"; ctx.lineWidth = 8; ctx.beginPath(); ctx.ellipse(x, y, 285, 170, 0, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = "#fff2b0"; skStar(ctx, x, y, 130);
  ctx.fillStyle = "#c8101e"; skStar(ctx, x, y, 60);
  if (k > 0.28 && k < 0.7) {
    var s = (k - 0.28) / 0.42;
    ctx.save(); ctx.globalCompositeOperation = "lighter";
    ctx.strokeStyle = "rgba(255,240,180," + (1 - s) + ")"; ctx.lineWidth = 8;
    for (var j = 0; j < 10; j++) { var a = j * Math.PI / 5; ctx.beginPath(); ctx.moveTo(x - 300 + Math.cos(a) * 30, y + Math.sin(a) * 30); ctx.lineTo(x - 300 + Math.cos(a) * (60 + 140 * s), y + Math.sin(a) * (60 + 140 * s)); ctx.stroke(); }
    ctx.restore();
  }
  cncFlare(x + 120, y - 90, 70, 0.6);
}
function cncMacroKnuckles(k) {
  var bg = ctx.createRadialGradient(540, 960, 40, 540, 960, 900);
  bg.addColorStop(0, "#5a1a08"); bg.addColorStop(1, "#050202");
  ctx.fillStyle = bg; ctx.fillRect(0, 0, 1080, 1920);
  var meet = cncOut(k / 0.35), gap = (1 - meet) * 420;
  // his own two arms, from each side, fists meeting in the middle
  strokeLimb(150, CN_DENIM, function () { ctx.moveTo(-200, 1300); ctx.quadraticCurveTo(100, 1000, 380 - gap, 960); });
  strokeLimb(150, CN_DENIM, function () { ctx.moveTo(1280, 1300); ctx.quadraticCurveTo(980, 1000, 700 + gap, 960); });
  cnFist(400 - gap, 960, 150); cnFist(680 + gap, 960, 150);
  if (k > 0.33 && k < 0.8) {
    var s = (k - 0.33) / 0.47;
    ctx.save(); ctx.globalCompositeOperation = "lighter";
    ctx.strokeStyle = "rgba(255,255,255," + (1 - s) + ")"; ctx.lineWidth = 10;
    ctx.beginPath(); ctx.arc(540, 960, 80 + 380 * s, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
    cncText("CRACK!", 540, 700 - 40 * s, 110, "#ffe14d", "#c8101e");
  }
}

// The stars-and-stripes jet, side view, nose to the right, centred on (0, 0).
function cncJet(s, burn) {
  ctx.save(); ctx.scale(s, s);
  ctx.lineJoin = "round"; ctx.strokeStyle = CNC_INK; ctx.lineWidth = 6;
  // afterburner
  var fl = 0.8 + 0.2 * Math.sin(burn * 60);
  var fg = ctx.createLinearGradient(-640, 0, -420, 0);
  fg.addColorStop(0, "rgba(255,120,30,0)"); fg.addColorStop(0.5, "rgba(255,170,60,0.9)"); fg.addColorStop(1, "rgba(160,200,255,1)");
  ctx.fillStyle = fg; ctx.beginPath(); ctx.moveTo(-420, -34); ctx.lineTo(-420 - 240 * fl, 0); ctx.lineTo(-420, 34); ctx.closePath(); ctx.fill();
  // the far wing
  ctx.fillStyle = "#1f3a8a";
  ctx.beginPath(); ctx.moveTo(-120, 10); ctx.lineTo(-300, -140); ctx.lineTo(-230, -140); ctx.lineTo(60, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
  // the body
  var body = function () {
    ctx.beginPath();
    ctx.moveTo(-430, -40); ctx.lineTo(200, -50); ctx.quadraticCurveTo(420, -40, 480, 0); ctx.quadraticCurveTo(420, 36, 200, 44); ctx.lineTo(-430, 40); ctx.closePath();
  };
  body(); ctx.fillStyle = "#ffffff"; ctx.fill();
  ctx.save(); body(); ctx.clip();
  for (var i = 0; i < 6; i++) { ctx.fillStyle = i % 2 ? "#ffffff" : "#c8101e"; ctx.fillRect(-440, -52 + i * 17, 520, 17); }
  ctx.fillStyle = "#1f3a8a"; ctx.fillRect(80, -60, 420, 120);
  ctx.fillStyle = "#ffffff";
  for (var j = 0; j < 7; j++) skStar(ctx, 130 + j * 40, -8 + (j % 2) * 24, 11);
  ctx.restore();
  body(); ctx.stroke();
  // the canopy
  ctx.fillStyle = "#7fd4ff";
  ctx.beginPath(); ctx.moveTo(150, -46); ctx.quadraticCurveTo(250, -100, 340, -36); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = "rgba(255,255,255,0.6)"; ctx.beginPath(); ctx.ellipse(230, -64, 40, 8, -0.2, 0, Math.PI * 2); ctx.fill();
  // the tail
  ctx.fillStyle = "#c8101e";
  ctx.beginPath(); ctx.moveTo(-420, -40); ctx.lineTo(-470, -190); ctx.lineTo(-400, -190); ctx.lineTo(-280, -42); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = "#fff"; skStar(ctx, -410, -130, 24);
  // the near wing
  ctx.fillStyle = "#2a4ab0";
  ctx.beginPath(); ctx.moveTo(-160, 20); ctx.lineTo(-330, 170); ctx.lineTo(-250, 170); ctx.lineTo(80, 24); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = "#fff"; skStar(ctx, -230, 120, 26);
  ctx.restore();
}

// 5a. Tracking shot alongside the jet, Chuck standing on its back.
function cncShotJet(u) {
  var sky = ctx.createLinearGradient(0, 0, 0, 1920);
  sky.addColorStop(0, "#1c58b8"); sky.addColorStop(0.6, "#7ab6ee"); sky.addColorStop(1, "#d6ecff");
  ctx.fillStyle = sky; ctx.fillRect(0, 0, 1080, 1920);
  // clouds tearing past (three layers)
  [[0.5, 1500, "rgba(255,255,255,0.55)", 120], [1, 2400, "rgba(255,255,255,0.75)", 200], [1.6, 3800, "rgba(255,255,255,0.9)", 300]].forEach(function (L, li) {
    ctx.fillStyle = L[2];
    for (var i = 0; i < 6; i++) {
      var x = ((cncRand(i + li * 10) * 2200 - u * L[1]) % 2200 + 2200) % 2200 - 500, y = 200 + cncRand(i * 3 + li) * 1500;
      ctx.beginPath(); ctx.ellipse(x, y, L[3] * 1.6, L[3] * 0.35, 0, 0, Math.PI * 2); ctx.fill();
    }
  });
  // speed lines
  ctx.strokeStyle = "rgba(255,255,255,0.5)"; ctx.lineWidth = 4;
  for (var s = 0; s < 18; s++) { var lx = ((cncRand(s) * 1600 - u * 5200) % 1600 + 1600) % 1600 - 200, ly = 260 + cncRand(s + 40) * 1450; ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(lx + 260, ly); ctx.stroke(); }
  var bob = Math.sin(u * 9) * 8, jx = 560, jy = 1080 + bob;
  // the eagles on his wings, flapping
  if (typeof drawEagle === "function") {
    drawEagle(220, 820 + Math.sin(u * 7) * 18, 0, 1.3, u * 18, false);
    drawEagle(900, 1360 + Math.sin(u * 7 + 2) * 18, 0, 1.6, u * 18 + 1, false);
  }
  // red, white and blue contrails
  [CN_USA.red, "#ffffff", "#3c6bd8"].forEach(function (col, i) {
    ctx.strokeStyle = col; ctx.globalAlpha = 0.8; ctx.lineWidth = 22;
    ctx.beginPath(); ctx.moveTo(jx - 420 * 0.85, jy - 20 + i * 22); ctx.lineTo(-100, jy - 20 + i * 22 + Math.sin(u * 4 + i) * 10); ctx.stroke();
  });
  ctx.globalAlpha = 1;
  ctx.save(); ctx.translate(jx, jy); cncJet(0.85, u); ctx.restore();
  // Chuck on the jet's back, arms crossed. The hat doesn't move.
  var cr = 110, cx = jx - 80, cy = jy - 0.85 * 50 - cr * 0.92;
  // his bandana tails whipping out behind him
  ctx.save(); ctx.translate(cx - cr * 0.3, cy + cr * 0.05);
  for (var t = 0; t < 2; t++) {
    ctx.fillStyle = t ? "#ffffff" : CN_USA.red;
    ctx.beginPath(); ctx.moveTo(0, t * 10);
    for (var q = 0; q <= 10; q++) ctx.lineTo(-q * 18, t * 10 + Math.sin(u * 40 + q * 0.9 + t) * 8 * q / 10);
    ctx.lineTo(-180, t * 10 + 12); ctx.lineTo(0, t * 10 + 12); ctx.closePath(); ctx.fill();
  }
  ctx.restore();
  cncChuck(cx, cy, cr, "crossed");
  // the sound barrier
  var sb = u - 0.32;
  if (sb > 0) {
    var k = cncClamp(sb / 0.45);
    ctx.save();
    ctx.globalAlpha = 0.7 * (1 - k);
    var cg = ctx.createRadialGradient(jx + 380, jy, 10, jx + 380, jy, 520);
    cg.addColorStop(0, "rgba(255,255,255,0.9)"); cg.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = cg;
    ctx.beginPath(); ctx.moveTo(jx + 420, jy); ctx.lineTo(jx - 300, jy - 300 - 200 * k); ctx.lineTo(jx - 300, jy + 300 + 200 * k); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255," + (1 - k) + ")"; ctx.lineWidth = 14;
    ctx.beginPath(); ctx.ellipse(jx + 100, jy, 80 + 900 * k, 60 + 600 * k, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
    if (sb < 0.06) { ctx.fillStyle = "rgba(255,255,255,0.8)"; ctx.fillRect(0, 0, 1080, 1920); }
    if (sb < 0.4) cncText("BOOM!", 760, 520, 130 + 30 * k, "#ffffff", "#1f3a8a");
  }
  cncFlare(980, 200, 120, 0.5);
}

// 5b. Drone shot pulling up over Mount Rushmore, with its fifth head.
function cncShotRushmore(u) {
  var lift = cncEase(u / 0.6);
  var sky = ctx.createLinearGradient(0, 0, 0, 1920);
  sky.addColorStop(0, "#f08a4b"); sky.addColorStop(0.5, "#ffd18a"); sky.addColorStop(1, "#9fc2e0");
  ctx.fillStyle = sky; ctx.fillRect(0, 0, 1080, 1920);
  ctx.save();
  ctx.translate(540, 1100); ctx.scale(1.12 - 0.12 * lift, 1.12 - 0.12 * lift); ctx.translate(-540, -1100 + 160 * lift);
  // the mountain
  ctx.fillStyle = "#9a948a";
  ctx.beginPath(); ctx.moveTo(-100, 1700); ctx.lineTo(-100, 900); ctx.quadraticCurveTo(200, 700, 540, 720); ctx.quadraticCurveTo(900, 700, 1180, 880); ctx.lineTo(1180, 1700); ctx.closePath(); ctx.fill();
  ctx.fillStyle = "#7d776d";
  ctx.beginPath(); ctx.moveTo(-100, 1700); ctx.lineTo(-100, 1150); ctx.quadraticCurveTo(540, 1050, 1180, 1150); ctx.lineTo(1180, 1700); ctx.closePath(); ctx.fill();
  // four carved heads (rough granite, no faces on anyone)...
  [[150, 930, 105], [340, 905, 115], [520, 925, 100], [690, 960, 95]].forEach(function (h, i) {
    var g = ctx.createRadialGradient(h[0] - h[2] * 0.3, h[1] - h[2] * 0.3, 10, h[0], h[1], h[2]);
    g.addColorStop(0, "#d8d2c4"); g.addColorStop(1, "#8c867a");
    ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(h[0], h[1], h[2] * 0.82, h[2], 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "rgba(60,55,48,0.4)"; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(h[0] - h[2] * 0.5, h[1] + h[2] * 0.2 + i * 3); ctx.lineTo(h[0] + h[2] * 0.4, h[1] + h[2] * 0.35); ctx.stroke();
  });
  // ...and the fifth: a round head in a cowboy hat, the chisel dust still falling
  var fx = 890, fy = 990, fr = 92;
  ctx.save(); ctx.translate(fx, fy);
  var g2 = ctx.createRadialGradient(-30, -30, 10, 0, 0, fr);
  g2.addColorStop(0, "#e6e0d2"); g2.addColorStop(1, "#968f82");
  ctx.fillStyle = g2; ctx.beginPath(); ctx.arc(0, 0, fr, 0, Math.PI * 2); ctx.fill();
  var keep = CN_HAT; CN_HAT = "#b9b2a4"; var keepBand = CN_BAND; CN_BAND = "#8c867a";
  drawCnHat(fr);
  CN_HAT = keep; CN_BAND = keepBand;
  ctx.restore();
  ctx.fillStyle = "rgba(235,228,214,0.8)";
  for (var d = 0; d < 14; d++) { var dy = ((u * 260 + cncRand(d) * 200) % 200); ctx.beginPath(); ctx.arc(fx - 60 + cncRand(d + 3) * 120, fy + fr + dy, 4 + cncRand(d + 8) * 4, 0, Math.PI * 2); ctx.fill(); }
  // pines at the foot
  ctx.fillStyle = "#1f3a26";
  for (var p = 0; p < 22; p++) { var px = p * 55 - 40, py = 1260 + cncRand(p) * 40; ctx.beginPath(); ctx.moveTo(px, py - 110); ctx.lineTo(px + 34, py); ctx.lineTo(px - 34, py); ctx.closePath(); ctx.fill(); }
  ctx.restore();
  // the jet streaking over the top, contrails behind
  var jx = cncLerp(-200, 1300, u / 0.6), jy = 520 - 60 * u;
  [CN_USA.red, "#ffffff", "#3c6bd8"].forEach(function (col, i) {
    ctx.strokeStyle = col; ctx.lineWidth = 12; ctx.globalAlpha = 0.85;
    ctx.beginPath(); ctx.moveTo(jx - 110, jy - 6 + i * 10); ctx.lineTo(jx - 900, jy + 40 - 6 + i * 10); ctx.stroke();
  });
  ctx.globalAlpha = 1;
  ctx.save(); ctx.translate(jx, jy); ctx.rotate(-0.04); cncJet(0.22, u); ctx.restore();
  cncText("MOUNT RUSHMORE, SOUTH DAKOTA", 540, 1500, 44, "#ffffff", "#000", "center", "800");
}

// The WWIT stadium from straight above at night.
function cncStadiumTop(u, r) {
  ctx.fillStyle = "#05070f"; ctx.fillRect(-2000, -2000, 5080, 5920);
  // the parking lot lights and the city
  ctx.fillStyle = "rgba(255,210,120,0.6)";
  for (var i = 0; i < 120; i++) ctx.fillRect(540 + (cncRand(i) - 0.5) * 2400, 960 + (cncRand(i + 200) - 0.5) * 3600, 4, 4);
  // the bowl
  ctx.fillStyle = "#1c1a22"; ctx.beginPath(); ctx.ellipse(540, 960, r * 1.0, r * 1.18, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#2a2632"; ctx.beginPath(); ctx.ellipse(540, 960, r * 0.86, r * 1.02, 0, 0, Math.PI * 2); ctx.fill();
  // the crowd: phone lights
  for (var j = 0; j < 160; j++) {
    var a = cncRand(j) * Math.PI * 2, d = 0.58 + cncRand(j + 50) * 0.36;
    ctx.fillStyle = cncRand(j + Math.floor(u * 8)) > 0.8 ? "#ffffff" : j % 3 ? "#c8101e" : "#3c6bd8";
    ctx.fillRect(540 + Math.cos(a) * r * d * 0.98, 960 + Math.sin(a) * r * d * 1.15, 5, 5);
  }
  // the cage and the mat
  ctx.fillStyle = WWIT.mat;
  ctx.beginPath();
  for (var k = 0; k < 8; k++) { var aa = Math.PI / 8 + k * Math.PI / 4; ctx[k ? "lineTo" : "moveTo"](540 + Math.cos(aa) * r * 0.48, 960 + Math.sin(aa) * r * 0.48); }
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = WWIT.maroon; ctx.lineWidth = Math.max(2, r * 0.02); ctx.stroke();
  if (wwitBadge.complete && wwitBadge.naturalWidth) { var bs = r * 0.42; ctx.globalAlpha = 0.5; ctx.drawImage(wwitBadge, 540 - bs / 2, 960 - bs / 2, bs, bs); ctx.globalAlpha = 1; }
  ctx.save(); ctx.globalCompositeOperation = "lighter";
  var gl = ctx.createRadialGradient(540, 960, 0, 540, 960, r * 0.6);
  gl.addColorStop(0, "rgba(255,240,200,0.25)"); gl.addColorStop(1, "rgba(255,240,200,0)");
  ctx.fillStyle = gl; ctx.beginPath(); ctx.arc(540, 960, r * 0.6, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

// 6. Over the stadium: he steps off the jet, then the spinning freefall.
function cncShotDrop(u) {
  if (u < 0.5) {
    cncStadiumTop(u, 360);
    // searchlights sweeping
    ctx.save(); ctx.globalCompositeOperation = "lighter";
    [[80, 300, 1], [1000, 340, -1], [120, 1620, -1], [980, 1600, 1]].forEach(function (s, i) {
      var a = Math.atan2(960 - s[1], 540 - s[0]) + Math.sin(u * 3 + i) * 0.5 * s[2];
      ctx.fillStyle = "rgba(200,220,255,0.16)";
      ctx.beginPath(); ctx.moveTo(s[0], s[1]); ctx.arc(s[0], s[1], 1500, a - 0.06, a + 0.06); ctx.closePath(); ctx.fill();
    });
    ctx.restore();
    // the jet crossing (top-down), Chuck dropping off its back
    var jx = cncLerp(-150, 1250, u / 0.5), jy = 520;
    ctx.save(); ctx.translate(jx, jy);
    ctx.fillStyle = "#ffffff"; ctx.strokeStyle = CNC_INK; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(80, 0); ctx.lineTo(-20, -14); ctx.lineTo(-30, -90); ctx.lineTo(-60, -90); ctx.lineTo(-60, -14); ctx.lineTo(-90, -10); ctx.lineTo(-100, -40); ctx.lineTo(-115, -40); ctx.lineTo(-115, 40); ctx.lineTo(-100, 40); ctx.lineTo(-90, 10); ctx.lineTo(-60, 14); ctx.lineTo(-60, 90); ctx.lineTo(-30, 90); ctx.lineTo(-20, 14); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#1f3a8a"; ctx.fillRect(10, -10, 50, 20);
    ctx.restore();
    // flares fanning out behind it
    for (var f = 0; f < 8; f++) {
      var fa = Math.PI + (f - 3.5) * 0.22, fk = cncClamp((u - 0.2) / 0.3);
      if (fk <= 0) continue;
      ctx.fillStyle = [CN_USA.red, "#ffffff", "#3c6bd8"][f % 3];
      ctx.beginPath(); ctx.arc(jx - 120 + Math.cos(fa) * 260 * fk, jy + Math.sin(fa) * 260 * fk, 9, 0, Math.PI * 2); ctx.fill();
    }
    var cx = cncLerp(-150, 1250, 0.24 / 0.5) - 20;
    if (u > 0.24) cncChuck(cx, jy + 30 * (u - 0.24), 26, "salute");
    cncText("WWIT STADIUM. 2100 HOURS.", 540, 1480, 46, "#ffffff", "#000", "center", "800");
    return;
  }
  var k = (u - 0.5) / 0.6, z = 1 + 3.2 * k * k, rot = reduceMotion ? 0 : k * 2.4;
  ctx.save();
  ctx.translate(540, 960); ctx.rotate(rot); ctx.scale(z, z); ctx.translate(-540, -960);
  cncStadiumTop(u, 300);
  ctx.restore();
  // clouds and wind whipping out past the lens
  ctx.save(); ctx.globalCompositeOperation = "lighter";
  for (var i = 0; i < 26; i++) {
    var a = cncRand(i) * Math.PI * 2 + rot * 0.5, d = ((cncRand(i + 9) + k * 2.2) % 1);
    var rr = 80 + d * 1300;
    ctx.strokeStyle = "rgba(255,255,255," + (0.5 * d) + ")"; ctx.lineWidth = 6 + 20 * d;
    ctx.beginPath(); ctx.moveTo(540 + Math.cos(a) * rr * 0.7, 960 + Math.sin(a) * rr * 0.7); ctx.lineTo(540 + Math.cos(a) * rr, 960 + Math.sin(a) * rr); ctx.stroke();
  }
  ctx.restore();
}

// 7. Worm's-eye against the moon: the flag chute opens, he cuts it loose.
function cncShotMoon(u) {
  var sky = ctx.createLinearGradient(0, 0, 0, 1920);
  sky.addColorStop(0, "#01030c"); sky.addColorStop(1, "#0c1838");
  ctx.fillStyle = sky; ctx.fillRect(0, 0, 1080, 1920);
  ctx.fillStyle = "#fff";
  for (var i = 0; i < 80; i++) ctx.fillRect(cncRand(i) * 1080, cncRand(i + 80) * 1920, 3, 3);
  var mg = ctx.createRadialGradient(540, 720, 200, 540, 720, 420);
  mg.addColorStop(0, "#fffbe8"); mg.addColorStop(0.7, "#efe6c8"); mg.addColorStop(1, "rgba(239,230,200,0)");
  ctx.fillStyle = mg; ctx.beginPath(); ctx.arc(540, 720, 420, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "rgba(170,160,130,0.35)";
  [[460, 640, 50], [640, 800, 70], [600, 600, 30]].forEach(function (c) { ctx.beginPath(); ctx.arc(c[0], c[1], c[2], 0, Math.PI * 2); ctx.fill(); });
  var open = cncOut((u - 0.08) / 0.15), cut = u > 0.42, drift = cut ? (u - 0.42) / 0.38 : 0;
  // the chute
  if (open > 0) {
    var cx = 540 - 260 * drift, cy = 520 - 380 * drift, w = 520 * open * (1 - 0.4 * drift), h = 230 * open * (1 - 0.4 * drift);
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(-0.3 * drift);
    ctx.beginPath(); ctx.ellipse(0, 0, w / 2, h, 0, Math.PI, 0); ctx.closePath(); ctx.clip();
    for (var s = 0; s < 9; s++) { ctx.fillStyle = s % 2 ? "#ffffff" : "#c8101e"; ctx.fillRect(-w / 2 + s * w / 9, -h, w / 9 + 1, h); }
    ctx.fillStyle = "#1f3a8a"; ctx.fillRect(-w / 2, -h, w, h * 0.32);
    ctx.fillStyle = "#fff"; for (var t = 0; t < 7; t++) skStar(ctx, -w / 2 + (t + 0.5) * w / 7, -h * 0.84, 10 * open);
    ctx.restore();
    if (!cut) {
      ctx.strokeStyle = "rgba(20,20,30,0.9)"; ctx.lineWidth = 3;
      [-0.5, -0.25, 0, 0.25, 0.5].forEach(function (f) { ctx.beginPath(); ctx.moveTo(cx + f * w, cy); ctx.lineTo(540, 840); ctx.stroke(); });
    }
  }
  // Chuck: a silhouette against the moon, then dropping at the lens
  var fall = cut ? cncClamp((u - 0.48) / 0.32) : 0, r = 95 + 900 * fall * fall, y = 860 + 600 * fall * fall;
  ctx.save();
  ctx.translate(540, y); ctx.scale(r / CN_R, r / CN_R);
  ctx.globalAlpha = 1;
  drawFighterArt(ctx, 0, 0, CN_R, CN_LOOK, theme.wall, { layout: "contained", name: "chuck norris" });
  drawCnKit(CN_R); drawCnHat(CN_R);
  if (!cut) cnSalute(CN_R, 0); else cnRappelArms(CN_R);
  ctx.restore();
  // rim light from the moon, dark on the near side
  ctx.save(); ctx.globalAlpha = 0.55 * (1 - fall); ctx.fillStyle = "#050814";
  ctx.beginPath(); ctx.arc(540, y + r * 0.15, r * 1.02, 0, Math.PI * 2); ctx.fill(); ctx.restore();
  if (cut && u < 0.62) cncText("HE DOESN'T NEED IT.", 540, 1420, 62, "#ffffff", "#c8101e");
  cncFlare(540, 720, 200, 0.35);
}

// ---------------------------------------------------------------- back in the arena

var cncBuf = null;
function cncTickSparks(c, dt) {
  var n = chuckNorris;
  c.sparks.forEach(function (p) { p.t += dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 600 * dt; });
  c.sparks = c.sparks.filter(function (p) { return p.t < p.life; });
  if (c.stage === "slow" && n && n.phase === "rappel" && !reduceMotion) {
    c.sparkT += dt;
    while (c.sparkT > 0.02) {
      c.sparkT -= 0.02;
      var a = Math.PI * 0.5 + (Math.random() - 0.5) * 1.6, s = 120 + Math.random() * 200;
      c.sparks.push({ x: n.x + CN_R * 0.15, y: n.y - CN_R * 1.75, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 60, t: 0, life: 0.35 + Math.random() * 0.25 });
    }
  }
}

function cncCam(c) {
  var n = chuckNorris, fx = n ? n.x : W / 2, fy = n ? (n.phase === "rappel" ? Math.max(n.y, n.landY - 260) : n.y) : H / 2;
  if (c.stage === "land" || c.stage === "card") { fx = c.landX; fy = c.landY; }
  var z = 1, rot = 0;
  if (c.stage === "slow") { var k = cncEase(c.u / 1.6); z = 1 + 0.7 * k; rot = 0.07 * Math.sin(c.u * 1.8); }
  else if (c.stage === "land") z = 1.7 - 0.1 * cncOut(c.u / CNC.land);
  else if (c.stage === "card") z = 1.6 + 0.25 * cncEase(c.u / CNC.card);
  else if (c.stage === "wipe") z = 1.85 - 0.85 * cncEase(c.u / CNC.wipe);
  if (reduceMotion) rot = 0;
  return { x: fx, y: fy, z: z, rot: rot };
}

function cncDrawArena(c, sc, ox, oy) {
  var cw = canvas.width, ch = canvas.height, n = chuckNorris;
  // in the world: sparks, the shockwave, the colour pass in the freeze frame
  ctx.save();
  ctx.setTransform(sc, 0, 0, sc, ox, oy);
  c.sparks.forEach(function (p) {
    var a = 1 - p.t / p.life;
    ctx.strokeStyle = "rgba(255," + Math.round(160 + 90 * a) + ",60," + a + ")"; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x - p.vx * 0.03, p.y - p.vy * 0.03); ctx.stroke();
  });
  ctx.restore();
  if (c.stage === "card") {
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalCompositeOperation = "saturation"; ctx.fillStyle = "rgb(128,128,128)"; ctx.fillRect(0, 0, cw, ch);
    ctx.globalCompositeOperation = "source-over"; ctx.fillStyle = "rgba(0,0,0,0.25)"; ctx.fillRect(0, 0, cw, ch);
    ctx.restore();
    ctx.save(); ctx.setTransform(sc, 0, 0, sc, ox, oy);
    cncFireball(c.landX, c.landY - 80, c.u);
    if (n) drawCnChuck(n);
    ctx.restore();
  }
  if (c.stage === "land" || c.stage === "card") {
    ctx.save(); ctx.setTransform(sc, 0, 0, sc, ox, oy);
    var wk = c.stage === "land" ? c.u / CNC.land * 0.5 : 0.5; // the shockwave stops dead on the freeze
    [CN_USA.red, "#ffffff", "#3c6bd8"].forEach(function (col, i) {
      var rr = 30 + (wk * 2 - i * 0.12) * 130;
      if (rr <= 30) return;
      ctx.strokeStyle = col; ctx.globalAlpha = 0.9; ctx.lineWidth = 6;
      ctx.beginPath(); ctx.ellipse(c.landX, c.landY + CN_R * 0.7, rr, rr * 0.55, 0, 0, Math.PI * 2); ctx.stroke();
    });
    ctx.restore();
  }
  // the camera: push in on him, a little roll
  var cam = cncCam(c);
  if (cam.z > 1.002 || Math.abs(cam.rot) > 0.001) {
    if (!cncBuf) cncBuf = document.createElement("canvas");
    if (cncBuf.width !== cw || cncBuf.height !== ch) { cncBuf.width = cw; cncBuf.height = ch; }
    var bx = cncBuf.getContext("2d");
    bx.setTransform(1, 0, 0, 1, 0, 0); bx.clearRect(0, 0, cw, ch); bx.drawImage(canvas, 0, 0);
    var vw = cw / cam.z, vh = ch / cam.z;
    var fx = Math.min(cw - vw / 2, Math.max(vw / 2, ox + sc * cam.x)), fy = Math.min(ch - vh / 2, Math.max(vh / 2, oy + sc * cam.y));
    var jx = 0, jy = 0;
    if (c.stage === "land" && !reduceMotion) { var sh = 18 * (1 - c.u / CNC.land); jx = (Math.random() - 0.5) * sh * 2; jy = (Math.random() - 0.5) * sh * 2; }
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = "#000"; ctx.fillRect(0, 0, cw, ch);
    ctx.translate(cw / 2 + jx, ch / 2 + jy); ctx.rotate(cam.rot); ctx.scale(cam.z * (1 + Math.abs(cam.rot) * 0.5), cam.z * (1 + Math.abs(cam.rot) * 0.5)); ctx.translate(-fx, -fy);
    ctx.drawImage(cncBuf, 0, 0);
    // the chromatic split on the impact
    if (c.stage === "land" && c.u < 0.1 && !reduceMotion) {
      ctx.globalCompositeOperation = "lighter"; ctx.globalAlpha = 0.35;
      ctx.drawImage(cncBuf, 8, 0); ctx.drawImage(cncBuf, -8, 0);
    }
    ctx.restore();
  }
  cncCover2(function () {
    if (c.stage === "slow") cncReactions(c);
    if (c.stage === "land") cncFireworks(c.u);
    if (c.stage === "card") cncCard(c.u);
    if (c.stage === "wipe") cncWipe(c.u);
    if (c.stage === "land" && c.u < 0.06) { ctx.fillStyle = "rgba(255,255,255,0.7)"; ctx.fillRect(0, 0, 1080, 1920); }
  });
}
// The stage frame (1080x1920) over the real screen, nothing painted under it.
function cncCover2(fn) {
  var cw = canvas.width, ch = canvas.height, k = Math.max(cw / 1080, ch / 1920);
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.translate((cw - 1080 * k) / 2, (ch - 1920 * k) / 2); ctx.scale(k, k);
  fn();
  ctx.restore();
}

// Two quick reaction shots while he slides down: them sweating, Sean pointing up.
function cncReactions(c) {
  var b = cncOwner(), v = cncVic(), u = c.u;
  function panel(x, y, w, h, k, tilt, fn) {
    if (k <= 0 || k >= 1) return;
    var pop = cncOut(k / 0.15) * (1 - cncClamp((k - 0.85) / 0.15));
    ctx.save();
    ctx.translate(x + w / 2, y + h / 2); ctx.rotate(tilt); ctx.scale(pop, pop); ctx.translate(-w / 2, -h / 2);
    ctx.fillStyle = "#fff"; ctx.fillRect(-10, -10, w + 20, h + 20);
    ctx.beginPath(); ctx.rect(0, 0, w, h); ctx.clip();
    var g = ctx.createLinearGradient(0, 0, 0, h); g.addColorStop(0, "#1f3a8a"); g.addColorStop(1, "#060a1c");
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    fn(w, h);
    ctx.restore();
  }
  if (v && v.char) panel(60, 235, 440, 300, (u - 0.2) / 0.6, -0.05, function (w, h) {
    var shiver = reduceMotion ? 0 : Math.sin(u * 70) * 4;
    cncFighter(v, w / 2 + shiver, h * 0.62, 115);
    var dy = ((u - 0.2) * 260) % 120;
    ctx.fillStyle = "#9fd8ff"; ctx.strokeStyle = CNC_INK; ctx.lineWidth = 3;
    [[w / 2 + 120, h * 0.3 + dy], [w / 2 - 130, h * 0.36 + dy * 0.7]].forEach(function (p) {
      ctx.beginPath(); ctx.moveTo(p[0], p[1] - 26); ctx.quadraticCurveTo(p[0] + 18, p[1], p[0], p[1] + 12); ctx.quadraticCurveTo(p[0] - 18, p[1], p[0], p[1] - 26); ctx.fill(); ctx.stroke();
    });
    cncText("GULP.", w / 2, 40, 48, "#ffffff", "#000");
  });
  if (b && b.char) panel(580, 235, 440, 300, (u - 0.75) / 0.6, 0.05, function (w, h) {
    var x = w / 2, y = h * 0.7, r = 105;
    cncFighter(b, x, y, r);
    cncArm(b, 1, x + r * 0.7, y - r * 0.3, x + r * 1.05, y - r * 0.9, x + r * 0.55, y - r * 1.45, r, -1.4); // pointing up at him
    cncArm(b, -1, x - r * 0.75, y + r * 0.2, x - r * 1.1, y - r * 0.3 + Math.sin(u * 20) * 12, x - r * 0.85, y - r * 0.9 + Math.sin(u * 20) * 18, r, -1.9); // fist pumping
    cncText("THAT'S MY GUY!", w / 2, 40, 44, "#ffe14d", "#000");
  });
}

function cncFireworks(u) {
  [[230, 640, CN_USA.red], [850, 600, "#ffffff"], [540, 520, "#4d7dff"]].forEach(function (f, i) {
    var k = cncClamp((u - i * 0.05) / 0.25);
    if (k <= 0) return;
    ctx.strokeStyle = f[2]; ctx.lineWidth = 5; ctx.globalAlpha = 1 - k * 0.5;
    for (var j = 0; j < 14; j++) {
      var a = j * Math.PI / 7, r0 = 20 + 120 * k, r1 = 40 + 170 * k;
      ctx.beginPath(); ctx.moveTo(f[0] + Math.cos(a) * r0, f[1] + Math.sin(a) * r0); ctx.lineTo(f[0] + Math.cos(a) * r1, f[1] + Math.sin(a) * r1); ctx.stroke();
    }
  });
  ctx.globalAlpha = 1;
}

// The explosion behind him in the freeze frame (in the world, in colour).
function cncFireball(x, y, u) {
  var k = cncOut((u - 0.1) / 0.5);
  if (k <= 0) return;
  ctx.save();
  for (var i = 0; i < 9; i++) {
    var a = cncRand(i) * Math.PI * 2, d = 30 * k * cncRand(i + 3), rr = (26 + 34 * cncRand(i + 7)) * (0.4 + 0.8 * k);
    var g = ctx.createRadialGradient(x + Math.cos(a) * d, y + Math.sin(a) * d - 30 * k, 0, x + Math.cos(a) * d, y + Math.sin(a) * d - 30 * k, rr);
    g.addColorStop(0, "rgba(255,255,230,1)"); g.addColorStop(0.5, "rgba(255,190,50,1)"); g.addColorStop(0.85, "rgba(230,70,20,0.9)"); g.addColorStop(1, "rgba(120,30,10,0)");
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x + Math.cos(a) * d, y + Math.sin(a) * d - 30 * k, rr, 0, Math.PI * 2); ctx.fill();
  }
  ctx.fillStyle = "rgba(40,30,30," + (0.35 * k) + ")";
  for (var s = 0; s < 4; s++) { ctx.beginPath(); ctx.arc(x + (cncRand(s + 20) - 0.5) * 160 * k, y - 80 * k - cncRand(s + 30) * 60 * k, 30 + 30 * k, 0, Math.PI * 2); ctx.fill(); }
  ctx.restore();
}

// The name card on its flag band.
function cncCard(u) {
  var k = cncOut(u / 0.14), bump = u < 0.2 ? Math.sin(cncClamp(u / 0.2) * Math.PI) * 30 : 0;
  var y = 1290, h = 200, x = -1080 * (1 - k) + bump;
  ctx.save();
  ctx.translate(x, 0);
  ctx.fillStyle = CNC_INK; ctx.fillRect(-20, y - 14, 1120, h + 28);
  for (var s = 0; s < 7; s++) { ctx.fillStyle = s % 2 ? "#ffffff" : "#c8101e"; ctx.fillRect(0, y + s * h / 7, 1080, h / 7 + 1); }
  ctx.fillStyle = "#1f3a8a"; ctx.fillRect(0, y, 230, h);
  ctx.fillStyle = "#fff";
  for (var r = 0; r < 4; r++) for (var c = 0; c < 4; c++) skStar(ctx, 30 + c * 55 + (r % 2) * 25, y + 28 + r * 46, 13);
  ctx.fillStyle = "rgba(10,14,30,0.78)"; ctx.fillRect(230, y, 850, h);
  cncText("CHUCK NORRIS", 610, y + 78, 118, "#ffffff", "#c8101e", "center", "italic 900");
  cncText("TEXAS RANGER. AMERICAN. UNDEFEATED BY EARTH.", 610, y + 160, 33, "#e3cd9a", null, "center", "800");
  ctx.restore();
  var sweep = cncClamp((u - 0.25) / 0.7);
  if (sweep > 0 && sweep < 1) cncFlare(cncLerp(250, 980, sweep), y + 78, 80, 0.7 * Math.sin(sweep * Math.PI));
}

// The flag wiping across, back to the fight.
function cncWipe(u) {
  var k = cncEase(u / CNC.wipe), w = 1500, x = cncLerp(-w - 40, 1120, k);
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.5)"; ctx.shadowBlur = 40;
  cncFlag(x, -60, w, 2040, u * 14, 60);
  ctx.restore();
}

// ---------------------------------------------------------------- sound

// Everything here is made in code: a march (snare, bass drum, brass and an
// electric guitar on an original tune) and the hits, the jet, the wind.
function cncAudio() {
  try {
    var ac = getAudioCtx();
    if (!ac) return;
    if (ac.state === "suspended") ac.resume();
    var t0 = ac.currentTime + 0.02, bus = ac.createGain();
    bus.gain.value = 0.8; bus.connect(ac.destination);
    cncCut.bus = bus;
    duckMusic(t0, t0 + CNC.pre + 1.6);
    cncCrowdDuck(ac, CNC.pre);
    // 1. the bass hit and the alarm
    mBigKick(ac, bus, t0, 1.2); cncTone(ac, bus, t0, "sine", 60, 30, 0.6, 0.9);
    [0.08, 0.28].forEach(function (d) { cncTone(ac, bus, t0 + d, "square", 880, 880, 0.08, 0.14); cncTone(ac, bus, t0 + d + 0.07, "square", 660, 660, 0.08, 0.1); });
    // 2. the dial, the ringback, the typed words
    for (var i = 0; i < 6; i++) cncClick(ac, bus, t0 + 0.55 + i * 0.045, 2400, 0.25);
    cncTone(ac, bus, t0 + 0.9, "sine", 440, 440, 0.06, 0.35); cncTone(ac, bus, t0 + 0.9, "sine", 480, 480, 0.06, 0.35);
    for (var j = 0; j < 19; j++) cncClick(ac, bus, t0 + 0.85 + 0.12 + j * 0.45 / 19, 3200 + (j % 3) * 400, 0.18);
    cncClick(ac, bus, t0 + 1.45, 5000, 0.2); cncTone(ac, bus, t0 + 1.45, "triangle", 2600, 2600, 0.12, 0.4); // the typewriter bell
    // 3. the harmonica sting, then the march
    cncHarmonica(ac, bus, t0 + 1.72);
    [0.0, 0.35, 0.7].forEach(function (d) { cncTone(ac, bus, t0 + 1.7 + d + 0.18, "sine", 70, 40, 0.5, 0.25); }); // the Earth thumping on each rep
    cncTone(ac, bus, t0 + 2.6, "sawtooth", 140, 110, 0.08, 0.45); // the moo
    cncMarch(ac, bus, t0 + 2.0, t0 + 8.7);
    // 4. the suit-up hits
    [2.7, 2.95, 3.2, 3.45].forEach(function (d) { mBigSnare(ac, bus, t0 + d, 1.1); mBigKick(ac, bus, t0 + d, 0.8); });
    cncTone(ac, bus, t0 + 2.8, "sine", 110, 60, 0.6, 0.25);                                  // the hat
    cncTone(ac, bus, t0 + 3.06, "triangle", 2700, 2650, 0.25, 0.5);                      // the star: ting
    cncTone(ac, bus, t0 + 3.27, "triangle", 1800, 1790, 0.2, 0.25); cncTone(ac, bus, t0 + 3.33, "triangle", 2400, 2390, 0.16, 0.3); // the buckle
    mNz(ac, bus, t0 + 3.54, "bandpass", 2200, 1.5, 0.8, 0.05); mNz(ac, bus, t0 + 3.6, "bandpass", 1600, 1.5, 0.7, 0.05); // the knuckles
    // 5. the jet, the sound barrier, the eagle
    cncNoise(ac, bus, t0 + 3.7, 1.4, 500, 0.5, 0.6);
    mBigKick(ac, bus, t0 + 4.02, 1.4); cncTone(ac, bus, t0 + 4.02, "sine", 55, 28, 0.9, 1.0); mNz(ac, bus, t0 + 4.02, "bandpass", 150, 0.6, 0.9, 0.6);
    playClip("eagleScreech", 0.55, t0 + 4.2);
    cncNoise(ac, bus, t0 + 4.5, 0.6, 900, 1.0, 0.4); // whoosh past the mountain
    // 6. the wind and the fall
    cncNoise(ac, bus, t0 + 5.1, 1.1, 700, 0.6, 0.35);
    cncTone(ac, bus, t0 + 5.6, "sine", 1800, 500, 0.1, 0.6);
    cncNoise(ac, bus, t0 + 5.6, 0.6, 400, 0.4, 0.6);
    // 7. the chute snapping open
    mNz(ac, bus, t0 + 6.3, "bandpass", 700, 0.8, 0.6, 0.12);
    // slow motion: the heartbeat
    [7.2, 7.55, 8.0, 8.35].forEach(function (d) { cncTone(ac, bus, t0 + d, "sine", 62, 40, 0.55, 0.18); });
  } catch (e) { /* never let audio break the game */ }
}
function cncCrowdDuck(ac, len) {
  try {
    var c = crowd;
    if (!c || !c.gain) return;
    var now = ac.currentTime;
    c.duckUntil = now + len;
    c.gain.gain.cancelScheduledValues(now);
    c.gain.gain.setTargetAtTime(0.01, now, 0.1);
  } catch (e) { /* never let audio break the game */ }
}
function cncTone(ac, out, t, type, f0, f1, peak, dur) {
  var o = ac.createOscillator(), g = ac.createGain();
  o.type = type; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g); g.connect(out); o.start(t); o.stop(t + dur + 0.05);
}
function cncClick(ac, out, t, f, peak) { mNz(ac, out, t, "bandpass", f, 2, peak, 0.025); }
function cncNoise(ac, out, t, dur, f, q, peak) {
  var s = ac.createBufferSource(); s.buffer = mNoise(ac); s.loop = true;
  var bp = ac.createBiquadFilter(); bp.type = "bandpass"; bp.Q.value = q;
  bp.frequency.setValueAtTime(f * 0.6, t); bp.frequency.exponentialRampToValueAtTime(f * 2, t + dur);
  var g = ac.createGain();
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + dur * 0.4); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  s.connect(bp); bp.connect(g); g.connect(out); s.start(t); s.stop(t + dur + 0.05);
}
// A bent harmonica note: reedy squares with a wobble.
function cncHarmonica(ac, out, t) {
  [[67, 0, 0.12], [71, 0.12, 0.12], [74, 0.24, 0.45]].forEach(function (n) {
    var o = ac.createOscillator(), o2 = ac.createOscillator(), lfo = ac.createOscillator(), lg = ac.createGain(), lp = ac.createBiquadFilter(), g = ac.createGain();
    o.type = "square"; o2.type = "sawtooth";
    var f = mtof(n[0]), st = t + n[1];
    o.frequency.setValueAtTime(f * 0.94, st); o.frequency.exponentialRampToValueAtTime(f, st + 0.08);
    o2.frequency.setValueAtTime(f * 1.003, st);
    lfo.frequency.value = 6; lg.gain.value = f * 0.015; lfo.connect(lg); lg.connect(o.frequency);
    lp.type = "lowpass"; lp.frequency.value = 2200;
    g.gain.setValueAtTime(0.0001, st); g.gain.exponentialRampToValueAtTime(0.09, st + 0.03); g.gain.exponentialRampToValueAtTime(0.0001, st + n[2]);
    o.connect(lp); o2.connect(lp); lp.connect(g); g.connect(out);
    [o, o2, lfo].forEach(function (x) { x.start(st); x.stop(st + n[2] + 0.05); });
  });
}
// The march: 120 a minute, in B flat. Snare on every beat with rolls, bass
// drum on one and three, brass chords, the guitar on the downbeats and an
// original bugle tune over the top.
function cncMarch(ac, out, from, to) {
  var beat = 0.5, n = Math.floor((to - from) / beat);
  var chords = [[58, 62, 65], [58, 62, 65], [63, 67, 70], [65, 69, 72]]; // Bb, Bb, Eb, F
  var roots = [46, 46, 51, 53];
  var tune = [[0, 77, 0.5], [1, 77, 0.25], [1.5, 82, 0.5], [2, 81, 0.25], [2.5, 79, 0.25], [3, 77, 0.75],
              [4, 74, 0.5], [5, 77, 0.25], [5.5, 79, 0.25], [6, 81, 0.5], [7, 82, 1.0],
              [8, 84, 0.5], [9, 82, 0.25], [9.5, 81, 0.25], [10, 79, 0.5], [11, 77, 0.5], [12, 82, 1.2]];
  for (var i = 0; i < n; i++) {
    var t = from + i * beat, bar = Math.floor(i / 4) % 4;
    mBigSnare(ac, out, t, i % 4 === 0 ? 0.6 : 0.35);
    if (i % 2 === 1) for (var r = 1; r < 4; r++) mSnare(ac, out, t + r * beat / 4, 0.25);
    if (i % 2 === 0) mBigKick(ac, out, t, 0.7);
    if (i % 4 === 0) { mBrass(ac, out, chords[bar], t, 1.2, beat * 1.8); mGuitar(ac, out, roots[bar], t, 0.9, beat * 1.6); mCrash(ac, out, t, 0.5); }
    else mBrass(ac, out, chords[bar], t, 0.6, beat * 0.4);
  }
  tune.forEach(function (nt) {
    var st = from + nt[0] * beat;
    if (st > to) return;
    mBrass(ac, out, [nt[1]], st, 1.6, nt[2] * beat * 1.6);
  });
}
// The landing (on top of Chuck's own thud and sting).
function cncLandSound() {
  try { var ac = getAudioCtx(); if (!ac) return; var t = ac.currentTime, out = cncCut.bus || ac.destination; mBigKick(ac, out, t, 1.5); mCrash(ac, out, t, 1.0); cncTone(ac, out, t, "sine", 50, 25, 0.9, 0.8); } catch (e) {}
}
// The freeze frame: the power chord, then the explosion he doesn't look at.
function cncCardSound() {
  try {
    var ac = getAudioCtx(); if (!ac) return;
    var t = ac.currentTime, out = cncCut.bus || ac.destination;
    mGuitar(ac, out, 46, t, 1.4, 1.4); mGuitar(ac, out, 58, t, 0.8, 1.4); mCrash(ac, out, t, 0.8);
    setTimeout(function () { if (cncCut) playCnBoom(); }, 120);
  } catch (e) {}
}
function cncWhoosh() { try { playWhoosh(); } catch (e) {} }
