// Daniel Cormier's "All About That Cake" music video as a cutscene (Joe,
// 2026-11-15). The FIRST time his special (All About That Cake, cormier.js)
// goes off in a fight, the fight holds and the whole screen cuts to his video,
// shot for shot, with the real song (dcCakeSong, cormier-cake-song.js) and the
// karaoke lyrics along the bottom. Then it's back to the arena, the serving
// goes down (belly swells, STRONGER) and the fight carries on. Every serving
// after that is his normal eating animation.
//
// The shots, timed to the song (seconds):
//   0.00  a star spins open on the pink backdrop, his face inside it
//   0.40  close-up, head tilted, a chocolate snack cake in his glove, up by
//         his cheek on the beat
//   3.32  wide: DC in the middle bopping, a whole cake (slice out) on the
//         left, a big piece of fried chicken on the right
//   7.00  medium: a drumstick in each glove, waving them, rubbing them together
//  11.35  medium close: swaying and singing to the camera, music notes
//  13.84  extreme close-up: a Twinkie in its wrapper up to his mouth, CHOMP
//  14.45  white flash back to the arena
// Only his own two arms and gloves. All drawn in 1080x1920 units, scaled to
// cover the canvas.
//
// Hooks: updateCake / resetCormier / initCormier (cormier.js), frame and
// runTicks (main.js), the end of draw (draw.js).
"use strict";

var DCC = { len: 14.75, end: 14.45, beat0: 1.84, beat: 0.898, gain: 1 };
var DCC_PINK = "#cf6ab8", DCC_INK = "#151515", DCC_YELLOW = "#ffe94d";
// [starts, highlight done, words]: the yellow sweeps across each line.
var DCC_LYRICS = [
  [0.30, 0.90, "BECAUSE YOU KNOW"],
  [0.95, 2.10, "I'M ALL ABOUT THAT CAKE"],
  [2.45, 4.15, "'BOUT THAT CAKE AND CHICKEN"],
  [4.35, 5.72, "I'M ALL ABOUT THAT CAKE"],
  [5.85, 7.60, "'BOUT THAT CAKE AND CHICKEN"],
  [7.80, 9.45, "I'M ALL ABOUT THAT CAKE"],
  [9.65, 11.35, "'BOUT THAT CAKE AND CHICKEN"],
  [11.55, 13.05, "I'M ALL ABOUT THAT CAKE"],
  [13.20, 14.10, "'BOUT THAT CAKE"]
];
// How loud the song is, 30 times a second (0-z), so he bobs as he sings.
var DCC_ENV = "002sli706guwvulfoxwtxyttpstsrspoqpswyuwzxvwwxwvulqqomh56wytpmhionojfdede9a9cpqqoh34ztrpjdfmsplkjkkihc76ihhhikkmkoe9dafnkc026gbfc15b75433nnpoortzzzrrpmwyzztlwzssn72oxsrofeespgeedjifillquqpi42psqvnfclyqhfefgffe85ahighjjklpe7eaakkd114eec8227a75429mnloqnopvprrsnxtotncvsppi45wuuxmdhlurmgbhkojfefqwrnnb2pxsorggjkhd998988723ejghijhlkl68fbenle125hgif44aa7654aknmoqstvwtvvsnuuuqjrwpomb2kztqqkhikkifebhec9bbgsqmpe2dwprofeftokjhjjjif865555444553000";

var dcCut = null;   // { id, u (seconds into the video), at (audio time it started), src }
var dcCutFlash = 0; // the white flash fading off the arena after

// ---------------------------------------------------------------- running it

// From resetCormier.
function dcCakeCutReset() { dcCut = null; dcCutFlash = 0; }
// From initCormier: decode the song ahead of time.
function dcCakeCutPreload() { withClip("dcCakeSong"); }
function dcCakeCutOn() { return !!dcCut; }
// From updateCake: only the first serving of the fight gets the video.
function dcCakeCutWanted(self) {
  var m = self.dc, fd = dcCfg(self) && dcCfg(self).food;
  return !!(fd && fd.cutscene !== false && m && !m.cutDone && !m.servings);
}
function startDcCakeCut(self) {
  self.dc.cutDone = true;
  var ac = audioCtx;
  dcCut = { id: self.id, u: 0, at: ac ? ac.currentTime : 0, src: null };
  if (ac && clipBuffers.dcCakeSong) dcCut.src = cutInTalk("dcCakeSong", DCC.gain); // he's singing: the talk channel
  dcCrowdDuck(DCC.len);
}
// The crowd drops right down while we're away from the arena.
function dcCrowdDuck(len) {
  try {
    var c = crowd;
    if (!c || !c.gain) return;
    var now = audioCtx.currentTime;
    c.duckUntil = now + len;
    c.gain.gain.cancelScheduledValues(now);
    c.gain.gain.setTargetAtTime(0.01, now, 0.12);
  } catch (e) { /* never let audio break the game */ }
}
// main.js: the fight holds while the video plays.
function dcCakeCutTimeScale() { return dcCut ? 0 : 1; }
// From main.js every frame (real time). Follows the song's clock when it's
// playing, so the pictures stay on the music.
function advanceDcCakeCut(dt) {
  if (!dcCut) { if (dcCutFlash > 0) dcCutFlash = Math.max(0, dcCutFlash - dt); return; }
  var u = dcCut.u + dt;
  if (dcCut.src && audioCtx) {
    var song = audioCtx.currentTime - dcCut.at;
    if (Math.abs(song - u) < 0.5) u = Math.max(dcCut.u, song);
  }
  dcCut.u = u;
  if (u >= DCC.len) { dcCut = null; dcCutFlash = 0.3; }
}

// ---------------------------------------------------------------- helpers

function dccClamp(k) { return Math.max(0, Math.min(1, k)); }
function dccEase(k) { k = dccClamp(k); return k * k * (3 - 2 * k); }
function dccEnv(u) {
  var i = Math.floor(u * 30);
  if (i < 0 || i >= DCC_ENV.length) return 0;
  return parseInt(DCC_ENV.charAt(i), 36) / 35;
}
// 1 on every half beat, falling to 0 between.
function dccBounce(u) { return Math.abs(Math.sin(Math.PI * (u - DCC.beat0) / (DCC.beat / 2))); }
// A slow side to side, one way per beat.
function dccSway(u) { return Math.sin(Math.PI * (u - DCC.beat0) / DCC.beat); }
function dccBump(u, at, w) { var d = (u - at) / w; return Math.exp(-d * d); }
function dccRand(i) { var x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }
function dccRot(x, y, a) { var c = Math.cos(a), s = Math.sin(a); return { x: x * c - y * s, y: x * s + y * c }; }

// DC himself: the ball, with a little stretch when he sings.
function dccBall(b, x, y, r, rot, sing) {
  var sq = sing || 0;
  ctx.save();
  ctx.translate(x, y); ctx.rotate(rot || 0);
  ctx.scale(1 - 0.012 * sq, 1 + 0.03 * sq);
  drawFighterArt(ctx, 0, 0, r, b.char.look, DCC_INK, { layout: "contained", name: b.char.name });
  ctx.restore();
}
// Where a spot on the ball (in radii) ends up on screen.
function dccOn(x, y, r, rot, lx, ly) { var p = dccRot(lx * r, ly * r, rot); return { x: x + p.x, y: y + p.y }; }
// One of his arms (his own two only): out of the side of the ball at the
// shoulder, bending at the elbow, to the glove. The upper arm tapers a little
// into the forearm. Returns the glove's angle (along the forearm).
function dccArm(b, sx, sy, ex, ey, hx, hy, r, side) {
  var w = r * 0.15, col = armColor(b.char, side || 1), out = Math.max(5, r * 0.03);
  ctx.save();
  ctx.lineCap = "round"; ctx.lineJoin = "round";
  ctx.strokeStyle = DCC_INK;
  ctx.lineWidth = w * 1.12 + out * 2; ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(ex, ey); ctx.stroke();
  ctx.lineWidth = w + out * 2; ctx.beginPath(); ctx.moveTo(ex, ey); ctx.lineTo(hx, hy); ctx.stroke();
  ctx.strokeStyle = col;
  ctx.lineWidth = w * 1.12; ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(ex, ey); ctx.stroke();
  ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(ex, ey); ctx.lineTo(hx, hy); ctx.stroke();
  // a soft highlight down the top of the arm
  ctx.strokeStyle = "rgba(255,255,255,0.12)"; ctx.lineWidth = w * 0.3;
  ctx.beginPath(); ctx.moveTo(sx, sy - w * 0.2); ctx.lineTo(ex, ey - w * 0.2); ctx.lineTo(hx, hy - w * 0.2); ctx.stroke();
  ctx.restore();
  return Math.atan2(hy - ey, hx - ex);
}
function dccGlove(b, hx, hy, r, ang) { drawGlove(ctx, hx, hy, r * 0.21, b.char.look, DCC_INK, ang); }

// ---------------------------------------------------------------- the food

// A chocolate snack cake with a bite out of it, showing the cream.
function dccSnack(x, y, s, rot) {
  ctx.save();
  ctx.translate(x, y); ctx.rotate(rot);
  ctx.lineJoin = "round"; ctx.lineWidth = Math.max(3, s * 0.06); ctx.strokeStyle = DCC_INK;
  var g = ctx.createLinearGradient(0, -s, 0, s);
  g.addColorStop(0, "#5a2e1b"); g.addColorStop(1, "#2a140c");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(-s * 0.75, s * 0.55);
  ctx.quadraticCurveTo(-s * 0.85, -s * 0.55, -s * 0.2, -s * 0.72);
  ctx.lineTo(s * 0.05, -s * 0.74);
  // the bite: three scallops out of the top right corner
  ctx.quadraticCurveTo(s * 0.1, -s * 0.42, s * 0.32, -s * 0.48);
  ctx.quadraticCurveTo(s * 0.42, -s * 0.22, s * 0.64, -s * 0.24);
  ctx.quadraticCurveTo(s * 0.6, s * 0.02, s * 0.8, s * 0.06);
  ctx.quadraticCurveTo(s * 0.85, s * 0.6, s * 0.65, s * 0.62);
  ctx.closePath(); ctx.fill(); ctx.stroke();
  // cream inside the bite
  ctx.fillStyle = "#fbf1e4";
  ctx.beginPath();
  ctx.moveTo(s * 0.12, -s * 0.36); ctx.quadraticCurveTo(s * 0.34, -s * 0.38, s * 0.4, -s * 0.16);
  ctx.quadraticCurveTo(s * 0.56, -s * 0.12, s * 0.62, s * 0.08);
  ctx.quadraticCurveTo(s * 0.3, s * 0.12, s * 0.12, -s * 0.36);
  ctx.fill();
  // glossy coating and a squiggle on top
  ctx.fillStyle = "rgba(255,255,255,0.22)";
  ctx.beginPath(); ctx.ellipse(-s * 0.42, -s * 0.3, s * 0.14, s * 0.28, 0.4, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = "#f4e6d4"; ctx.lineWidth = Math.max(2, s * 0.05);
  ctx.beginPath(); ctx.moveTo(-s * 0.6, -s * 0.5);
  for (var i = 1; i <= 5; i++) ctx.quadraticCurveTo(-s * 0.6 + (i - 0.5) * s * 0.13, -s * (i % 2 ? 0.66 : 0.46), -s * 0.6 + i * s * 0.13, -s * 0.56);
  ctx.stroke();
  ctx.restore();
}

// A whole round cake on a plate with a slice cut out of the front: pink
// frosted sides with cookie bits, chocolate crumble on top, layers inside.
function dccCake(x, y, R) {
  var ry = R * 0.38, h = R * 0.62, a1 = 1.0, a2 = 2.1, lw = Math.max(3, R * 0.025);
  function P(a, dy) { return { x: R * Math.cos(a), y: ry * Math.sin(a) + (dy || 0) }; }
  ctx.save();
  ctx.translate(x, y);
  ctx.lineJoin = "round"; ctx.strokeStyle = DCC_INK; ctx.lineWidth = lw;
  // drop shadow and the plate
  ctx.fillStyle = "rgba(60,0,40,0.18)";
  ctx.beginPath(); ctx.ellipse(R * 0.08, h + ry * 0.55, R * 1.38, ry * 1.4, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#f6f4f0";
  ctx.beginPath(); ctx.ellipse(0, h + ry * 0.2, R * 1.32, ry * 1.38, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.strokeStyle = "rgba(0,0,0,0.12)"; ctx.lineWidth = lw * 0.8;
  ctx.beginPath(); ctx.ellipse(0, h + ry * 0.2, R * 1.12, ry * 1.12, 0, 0, Math.PI * 2); ctx.stroke();
  ctx.strokeStyle = DCC_INK; ctx.lineWidth = lw;
  // the frosted walls either side of the gap
  var wall = ctx.createLinearGradient(-R, 0, R, 0);
  wall.addColorStop(0, "#c45f8c"); wall.addColorStop(0.35, "#f19bbf"); wall.addColorStop(0.7, "#e886b0"); wall.addColorStop(1, "#b9527f");
  [[0, a1], [a2, Math.PI]].forEach(function (seg) {
    ctx.beginPath();
    ctx.ellipse(0, 0, R, ry, 0, seg[0], seg[1], false);
    var e = P(seg[1], h); ctx.lineTo(e.x, e.y);
    ctx.ellipse(0, h, R, ry, 0, seg[1], seg[0], true);
    ctx.closePath();
    ctx.fillStyle = wall; ctx.fill();
    ctx.save(); ctx.clip();
    ctx.fillStyle = "#4a2416";
    for (var i = 0; i < 40; i++) {
      var a = seg[0] + dccRand(i + seg[0] * 10) * (seg[1] - seg[0]), q = P(a, h * (0.15 + 0.75 * dccRand(i * 3.1 + 7)));
      ctx.beginPath(); ctx.ellipse(q.x, q.y, R * 0.035, R * 0.022, dccRand(i) * 3, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
    ctx.stroke();
  });
  // the two cut faces: frosting, sponge, cream, sponge, cream, sponge
  var bands = [[0, 0.1, "#f19bbf"], [0.1, 0.36, "#4b2818"], [0.36, 0.46, "#f9dce7"], [0.46, 0.72, "#4b2818"], [0.72, 0.8, "#f9dce7"], [0.8, 1, "#3f2014"]];
  [a2, a1].forEach(function (a) {
    var p = P(a);
    bands.forEach(function (bd) {
      ctx.fillStyle = bd[2];
      ctx.beginPath();
      ctx.moveTo(0, bd[0] * h); ctx.lineTo(p.x, p.y + bd[0] * h); ctx.lineTo(p.x, p.y + bd[1] * h); ctx.lineTo(0, bd[1] * h);
      ctx.closePath(); ctx.fill();
    });
    ctx.fillStyle = a === a1 ? "rgba(0,0,0,0.16)" : "rgba(255,255,255,0.06)"; // light from the left
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(p.x, p.y); ctx.lineTo(p.x, p.y + h); ctx.lineTo(0, h); ctx.closePath(); ctx.fill(); ctx.stroke();
  });
  // the top, minus the slice
  var q2 = P(a2);
  ctx.beginPath();
  ctx.moveTo(0, 0); ctx.lineTo(q2.x, q2.y);
  ctx.ellipse(0, 0, R, ry, 0, a2, a1 + Math.PI * 2, false);
  ctx.closePath();
  var top = ctx.createRadialGradient(-R * 0.3, -ry * 0.4, R * 0.1, 0, 0, R);
  top.addColorStop(0, "#6b3a22"); top.addColorStop(1, "#3a1d11");
  ctx.fillStyle = top; ctx.fill();
  ctx.save(); ctx.clip();
  for (var j = 0; j < 60; j++) { // crumble
    var ca = dccRand(j * 1.7) * Math.PI * 2, cr = Math.sqrt(dccRand(j * 2.3 + 1)) * 0.95;
    ctx.fillStyle = j % 3 ? "#2b140b" : "#f2a6c6";
    ctx.beginPath(); ctx.arc(Math.cos(ca) * R * cr, Math.sin(ca) * ry * cr, R * (0.02 + 0.025 * dccRand(j + 9)), 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
  ctx.stroke();
  // a piped pink rim round the top edge
  ctx.strokeStyle = "#f6b6d0"; ctx.lineWidth = R * 0.05; ctx.lineCap = "round";
  ctx.beginPath(); ctx.ellipse(0, 0, R * 0.97, ry * 0.95, 0, a2 + 0.06, a1 + Math.PI * 2 - 0.06, false); ctx.stroke();
  ctx.restore();
}

// A big piece of fried chicken: a lumpy golden crust.
function dccChicken(x, y, s, rot) {
  ctx.save();
  ctx.translate(x, y); ctx.rotate(rot);
  ctx.lineJoin = "round";
  ctx.fillStyle = "rgba(60,0,40,0.16)";
  ctx.beginPath(); ctx.ellipse(s * 0.1, s * 0.16, s * 1.3, s * 0.82, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath();
  for (var i = 0; i <= 30; i++) {
    var a = i / 30 * Math.PI * 2, k = 1 + 0.1 * Math.sin(a * 5 + 1) + 0.07 * Math.sin(a * 9 + 2) + 0.05 * (dccRand(i % 30) - 0.5);
    var px = Math.cos(a) * s * 1.25 * k, py = Math.sin(a) * s * 0.78 * k;
    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  }
  ctx.closePath();
  var g = ctx.createRadialGradient(-s * 0.3, -s * 0.3, s * 0.1, 0, 0, s * 1.3);
  g.addColorStop(0, "#f6c174"); g.addColorStop(0.55, "#d98c3c"); g.addColorStop(1, "#94511d");
  ctx.fillStyle = g; ctx.fill();
  ctx.strokeStyle = DCC_INK; ctx.lineWidth = Math.max(3, s * 0.035); ctx.stroke();
  ctx.save(); ctx.clip();
  for (var j = 0; j < 46; j++) { // the crunchy bits
    var ba = dccRand(j * 4.1) * Math.PI * 2, br = Math.sqrt(dccRand(j * 1.3 + 5)) * 1.05;
    var bx = Math.cos(ba) * s * 1.2 * br, by = Math.sin(ba) * s * 0.75 * br, bs = s * (0.06 + 0.07 * dccRand(j + 2));
    ctx.fillStyle = j % 2 ? "rgba(255,226,160,0.55)" : "rgba(110,52,14,0.45)";
    ctx.beginPath(); ctx.ellipse(bx, by, bs, bs * 0.7, dccRand(j) * 3, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
  ctx.restore();
}

// A fried chicken drumstick (cormier.js draws it), pointing `ang`, the bone
// in his glove at (x, y), `s` long-ish.
function dccDrumstick(x, y, s, ang) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(ang - (Math.PI + 0.6)); // the meat end points along ang
  ctx.scale(s / 40, s / 40);
  drawDcDrumstick(0, 0, 40, 1, 1);
  ctx.restore();
}

// A Twinkie, half out of its wrapper, standing up out of his glove at
// (x, y). `bit` 0..1: how much of the top end is gone.
function dccTwinkie(x, y, len, w, rot, bit) {
  var L = len * (1 - 0.32 * bit);
  ctx.save();
  ctx.translate(x, y); ctx.rotate(rot);
  ctx.lineJoin = "round"; ctx.lineCap = "round"; ctx.lineWidth = Math.max(3, w * 0.05); ctx.strokeStyle = DCC_INK;
  var g = ctx.createLinearGradient(-w / 2, 0, w / 2, 0);
  g.addColorStop(0, "#c97a26"); g.addColorStop(0.35, "#f6c45c"); g.addColorStop(0.75, "#e9a63f"); g.addColorStop(1, "#b86a1e");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(-w / 2, 0);
  ctx.lineTo(-w / 2, -L + w / 2);
  if (bit > 0) { // a bitten end: scalloped
    ctx.quadraticCurveTo(-w * 0.35, -L - w * 0.12, -w * 0.15, -L + w * 0.05);
    ctx.quadraticCurveTo(0, -L - w * 0.15, w * 0.18, -L + w * 0.04);
    ctx.quadraticCurveTo(w * 0.38, -L - w * 0.1, w / 2, -L + w / 2);
  } else ctx.arc(0, -L + w / 2, w / 2, Math.PI, 0);
  ctx.lineTo(w / 2, 0);
  ctx.closePath(); ctx.fill(); ctx.stroke();
  if (bit > 0) { // the cream inside
    ctx.fillStyle = "#fff8ea";
    ctx.beginPath(); ctx.ellipse(0, -L + w * 0.18, w * 0.26, w * 0.13, 0, 0, Math.PI * 2); ctx.fill();
  }
  ctx.fillStyle = "rgba(255,255,255,0.3)";
  ctx.beginPath(); ctx.ellipse(-w * 0.2, -L * 0.62, w * 0.07, L * 0.22, 0, 0, Math.PI * 2); ctx.fill();
  // the wrapper peeled down round the bottom half, see-through
  var wt = -len * 0.5;
  ctx.fillStyle = "rgba(255,255,255,0.5)"; ctx.strokeStyle = "rgba(255,255,255,0.9)"; ctx.lineWidth = Math.max(2, w * 0.03);
  ctx.beginPath();
  ctx.moveTo(-w * 0.62, w * 0.1);
  ctx.lineTo(-w * 0.66, wt + w * 0.12);
  ctx.lineTo(-w * 0.42, wt - w * 0.05); ctx.lineTo(-w * 0.2, wt + w * 0.1); ctx.lineTo(0, wt - w * 0.08);
  ctx.lineTo(w * 0.22, wt + w * 0.08); ctx.lineTo(w * 0.45, wt - w * 0.06); ctx.lineTo(w * 0.66, wt + w * 0.12);
  ctx.lineTo(w * 0.62, w * 0.1);
  ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.strokeStyle = "rgba(255,255,255,0.85)";
  for (var i = 0; i < 5; i++) { // crinkles
    var cx = -w * 0.48 + i * w * 0.24;
    ctx.beginPath(); ctx.moveTo(cx, wt + w * 0.25); ctx.lineTo(cx + w * 0.05, wt + len * 0.22); ctx.stroke();
  }
  ctx.fillStyle = "rgba(200,30,40,0.55)"; // a stripe of print on the wrapper
  ctx.fillRect(-w * 0.62, wt + len * 0.3, w * 1.24, w * 0.12);
  ctx.restore();
}

// ---------------------------------------------------------------- the shots

// 0.00-3.32: close-up, his head tilted, the snack cake up by his cheek on the beat.
function dccShotClose(b, u) {
  var push = 1 + 0.05 * dccEase((u - 0.4) / 2.9);
  ctx.save();
  ctx.translate(540, 900); ctx.scale(push, push); ctx.translate(-540, -900);
  var r = 560, x = 330, y = 1010 - 10 * dccBounce(u), rot = 0.2 + 0.04 * dccSway(u);
  dccBall(b, x, y, r, rot, dccEnv(u));
  var near = Math.max(dccBump(u, 1.55, 0.35), dccBump(u, 3.05, 0.35));
  var hx = 760 - 90 * near, hy = 900 - 40 * near - 16 * dccBounce(u);
  // the upper arm hangs off his right side, the forearm comes up to his cheek
  var sh = dccOn(x, y, r, rot, 0.84, -0.38), el = { x: Math.min(1025, sh.x + 150), y: hy + 270 };
  var ang = dccArm(b, sh.x, sh.y, el.x, el.y, hx, hy, r, 1);
  dccSnack(hx + 4, hy - r * 0.21 - 70, 100, -0.25 + 0.1 * near);
  dccGlove(b, hx, hy, r, ang);
  ctx.restore();
}

// A five-point star (the opening wipe).
function dccStarPath(cx, cy, R, rot) {
  ctx.beginPath();
  for (var i = 0; i < 10; i++) {
    var a = rot - Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? R * 0.45 : R;
    if (i === 0) ctx.moveTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr); else ctx.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr);
  }
  ctx.closePath();
}

// 3.32-7.00: wide, DC bopping between a whole cake and a piece of fried chicken.
function dccShotWide(b, u) {
  var t = u - 3.32, z = 1 + 0.035 * dccEase(t / 3.7);
  ctx.save();
  ctx.translate(540, 1000); ctx.scale(z, z); ctx.translate(-540, -1000);
  var r = 215, bo = dccBounce(u), x = 540 + 16 * dccSway(u), y = 1010 - 20 * bo;
  // his shadow on the floor
  ctx.fillStyle = "rgba(60,0,40,0.18)";
  ctx.beginPath(); ctx.ellipse(540, 1010 + r * 1.02, r * (0.95 - 0.08 * bo), r * 0.16, 0, 0, Math.PI * 2); ctx.fill();
  dccCake(165, 1170 + 6 * Math.sin(u * 2.2), 128);
  dccChicken(880, 800 + 8 * Math.sin(u * 2 + 1), 140, -0.22 + 0.04 * Math.sin(u * 1.7));
  var rot = 0.05 * dccSway(u);
  dccBall(b, x, y, r, rot, dccEnv(u));
  [-1, 1].forEach(function (sd) {
    var sw = 0.12 * Math.sin(Math.PI * (u - DCC.beat0) / DCC.beat + (sd > 0 ? 0 : Math.PI));
    var sh = dccOn(x, y, r, rot, sd * 0.92, -0.12), el = dccOn(x, y, r, rot, sd * 1.2, 0.3 + sw * 0.5), g = dccOn(x, y, r, rot, sd * (1.08 + sw * 0.3), 0.72 - sw);
    var ang = dccArm(b, sh.x, sh.y, el.x, el.y, g.x, g.y, r, sd);
    dccGlove(b, g.x, g.y, r, ang);
  });
  ctx.restore();
}

// 7.00-11.35: a drumstick in each glove: waving them, then rubbing them
// together, then holding them up.
function dccShotDrumsticks(b, u) {
  var t = u - 7, r = 470, x = 540, y = 1330 - 8 * dccBounce(u), rot = 0.04 * dccSway(u);
  dccBall(b, x, y, r, rot, dccEnv(u) * 0.6);
  var rub = dccEase((t - 1.55) / 0.5) * (1 - dccEase((t - 3.55) / 0.45));
  var show = dccEase((t - 3.6) / 0.4);
  [-1, 1].forEach(function (sd) {
    var wave = Math.sin(Math.PI * (u - DCC.beat0) / (DCC.beat / 2) + (sd > 0 ? Math.PI : 0));
    var gx = 540 + sd * 240, gy = 1450 - 45 * Math.max(0, wave);
    // together in the middle, rubbing
    var rx = 540 + sd * 110 + sd * 22 * Math.sin(u * 30), ry = 1440 + 10 * Math.cos(u * 30);
    gx += (rx - gx) * rub; gy += (ry - gy) * rub;
    gy -= 70 * show; gx += sd * 40 * show;
    var sh = dccOn(x, y, r, rot, sd * 0.94, 0.05), el = dccOn(x, y, r, rot, sd * 1.08, 0.5 - 0.12 * show);
    var ang = dccArm(b, sh.x, sh.y, el.x, el.y, gx, gy, r, sd);
    var meat = -Math.PI / 2 + sd * (0.5 - 0.2 * rub) + 0.12 * wave * (1 - rub);
    dccDrumstick(gx, gy, 150, meat);
    dccGlove(b, gx, gy, r, ang);
  });
}

// 11.35-13.84: swaying and singing straight down the camera.
function dccShotSing(b, u) {
  var t = u - 11.35, r = 470, sw = dccSway(u), x = 540 + 46 * sw, y = 1300 - 16 * dccBounce(u), rot = 0.07 * sw;
  dccBall(b, x, y, r, rot, dccEnv(u) * 1.2);
  [-1, 1].forEach(function (sd) {
    var bob = 0.05 * Math.sin(Math.PI * (u - DCC.beat0) / (DCC.beat / 2) + (sd > 0 ? 0 : Math.PI));
    var sh = dccOn(x, y, r, rot, sd * 0.94, 0.0), el = dccOn(x, y, r, rot, sd * 1.1, 0.34), g = dccOn(x, y, r, rot, sd * 0.86, 0.68 - bob);
    var ang = dccArm(b, sh.x, sh.y, el.x, el.y, g.x, g.y, r, sd);
    dccGlove(b, g.x, g.y, r, ang);
  });
  // music notes floating up out of his mouth
  var m = dccOn(x, y, r, rot, 0, -0.36);
  ctx.save();
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  for (var i = 0; i < 8; i++) {
    var born = 0.05 + i * 0.32, a = t - born;
    if (a < 0 || a > 1.4) continue;
    var side = i % 2 ? 1 : -1, nx = m.x + side * (60 + 140 * a) + 20 * Math.sin(a * 6 + i), ny = m.y - 40 - 300 * a;
    ctx.globalAlpha = Math.min(1, a / 0.15) * (1 - dccClamp((a - 1) / 0.4));
    ctx.font = "900 " + Math.round(70 + 20 * dccRand(i)) + 'px "Segoe UI Symbol", "DejaVu Sans", sans-serif';
    ctx.lineWidth = 8; ctx.strokeStyle = "rgba(90,10,60,0.55)";
    var note = i % 3 ? "♪" : "♫";
    ctx.strokeText(note, nx, ny); ctx.fillStyle = "#fff"; ctx.fillText(note, nx, ny);
  }
  ctx.restore();
}

// 13.84-end: extreme close-up, the Twinkie up to his mouth and a big bite.
function dccShotTwinkie(b, u) {
  var t = u - 13.84, r = 1150, mx = 540, my = 820;
  var z = 1 + 0.08 * dccEase(t / 0.9);
  ctx.save();
  ctx.translate(mx, my); ctx.scale(z, z); ctx.translate(-mx, -my);
  var chew = t > 0.5 ? Math.max(0, Math.sin((t - 0.5) * 22)) * (1 - dccClamp((t - 0.5) / 0.4)) : 0;
  dccBall(b, mx, my + 0.36 * r, r, 0, chew * 1.5);
  var up = dccEase(t / 0.36), bite = t >= 0.5 ? 1 : 0;
  var len = 520, gx = 580 - 20 * up, gy = 2500 + (1350 - 2500) * up + (t > 0.5 ? 70 * dccEase((t - 0.5) / 0.25) : 0);
  // his right arm coming up from below the frame, bent at the elbow
  var ar = 520, ang = dccArm(b, 900, 2900, 860 + 40 * up, 2050 + 120 * up, gx, gy, ar, 1);
  dccTwinkie(gx + 4, gy - ar * 0.12, len, 175, -0.06, bite);
  dccGlove(b, gx, gy, ar, ang);
  // crumbs off the bite
  if (t >= 0.5) {
    var a = t - 0.5;
    for (var i = 0; i < 16; i++) {
      var an = -Math.PI / 2 + (dccRand(i) - 0.5) * 2.8, sp = 300 + 500 * dccRand(i + 3);
      var cx = mx + 20 + Math.cos(an) * sp * a, cy = my + 30 + Math.sin(an) * sp * a + 1400 * a * a;
      ctx.globalAlpha = 1 - dccClamp(a / 0.5);
      ctx.fillStyle = i % 3 ? "#e9a63f" : "#fff6e2";
      ctx.beginPath(); ctx.arc(cx, cy, 7 + 8 * dccRand(i + 7), 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
  ctx.restore();
}

// The karaoke line along the bottom: white, and the yellow sweeping across.
function dccLyrics(u) {
  if (u > 14.55) return;
  var line = null;
  for (var i = 0; i < DCC_LYRICS.length; i++) if (u >= DCC_LYRICS[i][0]) line = DCC_LYRICS[i];
  if (!line) return;
  var p = dccClamp((u - line[0]) / (line[1] - line[0])), text = line[2];
  ctx.save();
  ctx.font = '900 84px "Barlow Condensed", "Arial Narrow", sans-serif';
  ctx.textAlign = "left"; ctx.textBaseline = "middle";
  var tw = ctx.measureText(text).width, sc = Math.min(1, 980 / tw), y = 1450;
  ctx.translate(540, y); ctx.scale(sc, sc);
  var x0 = -tw / 2;
  ctx.lineJoin = "round"; ctx.lineWidth = 10; ctx.strokeStyle = "rgba(70,10,50,0.55)";
  ctx.strokeText(text, x0, 4);
  ctx.fillStyle = "#ffffff"; ctx.fillText(text, x0, 0);
  ctx.save();
  ctx.beginPath(); ctx.rect(x0 - 10, -70, (tw + 20) * p, 140); ctx.clip();
  ctx.fillStyle = DCC_YELLOW; ctx.fillText(text, x0, 0);
  ctx.restore();
  ctx.restore();
}

// ---------------------------------------------------------------- drawing it (draw.js, over everything)

function drawDcCakeCut() {
  if (!dcCut && !(dcCutFlash > 0)) return;
  var cw = canvas.width, ch = canvas.height;
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  if (!dcCut) { // back in the arena: the white fading off
    ctx.globalAlpha = dcCutFlash / 0.3; ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, cw, ch);
    ctx.restore();
    return;
  }
  var b = balls[dcCut.id], u = dcCut.u;
  ctx.fillStyle = DCC_PINK; ctx.fillRect(0, 0, cw, ch);
  var k = Math.max(cw / 1080, ch / 1920);
  ctx.translate((cw - 1080 * k) / 2, (ch - 1920 * k) / 2); ctx.scale(k, k);
  if (b && b.char) {
    if (u < 0.4) { // the star opening
      var s = dccEase((u - 0.03) / 0.37);
      if (s > 0) {
        ctx.save();
        dccStarPath(560, 880, 40 + 1500 * s * s, -1.4 * (1 - s));
        ctx.clip();
        dccShotClose(b, u);
        ctx.restore();
      }
    } else if (u < 3.32) dccShotClose(b, u);
    else if (u < 7.0) dccShotWide(b, u);
    else if (u < 11.35) dccShotDrumsticks(b, u);
    else if (u < 13.84) dccShotSing(b, u);
    else dccShotTwinkie(b, u);
  }
  // a soft studio vignette
  var vg = ctx.createRadialGradient(540, 900, 500, 540, 960, 1250);
  vg.addColorStop(0, "rgba(80,0,60,0)"); vg.addColorStop(1, "rgba(80,0,60,0.22)");
  ctx.fillStyle = vg; ctx.fillRect(-200, -200, 1480, 2320);
  dccLyrics(u);
  if (u > DCC.end) { ctx.globalAlpha = dccClamp((u - DCC.end) / (DCC.len - DCC.end)); ctx.fillStyle = "#fff"; ctx.fillRect(-200, -200, 1480, 2320); }
  ctx.restore();
}
