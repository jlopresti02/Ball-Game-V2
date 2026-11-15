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
//   3.32  wide: DC in the middle bopping, a chocolate cookie ice cream cake
//         (slice out) on the left, a big piece of fried chicken on the right
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
// shoulder, bending at the elbow, to the glove. Big heavyweight arms (Joe:
// DC's a big man): a thick upper arm with a soft bulge, a thick forearm.
// Returns the glove's angle (along the forearm).
function dccArm(b, sx, sy, ex, ey, hx, hy, r, side) {
  var wU = r * 0.27, wF = r * 0.23, col = armColor(b.char, side || 1), out = Math.max(5, r * 0.03);
  var mx = sx + (ex - sx) * 0.5, my = sy + (ey - sy) * 0.5, ua = Math.atan2(ey - sy, ex - sx);
  var ul = Math.sqrt((ex - sx) * (ex - sx) + (ey - sy) * (ey - sy));
  function shape(extra) {
    ctx.lineWidth = wU + extra; ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(ex, ey); ctx.stroke();
    ctx.lineWidth = wF + extra; ctx.beginPath(); ctx.moveTo(ex, ey); ctx.lineTo(hx, hy); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(mx, my, ul * 0.36 + extra / 2, wU * 0.62 + extra / 2, ua, 0, Math.PI * 2); ctx.fill(); // the meaty upper arm
  }
  ctx.save();
  ctx.lineCap = "round"; ctx.lineJoin = "round";
  ctx.strokeStyle = DCC_INK; ctx.fillStyle = DCC_INK; shape(out * 2);
  ctx.strokeStyle = col; ctx.fillStyle = col; shape(0);
  // shading underneath and a soft highlight along the top
  ctx.strokeStyle = "rgba(0,0,0,0.16)"; ctx.lineWidth = wF * 0.3;
  ctx.beginPath(); ctx.moveTo(sx, sy + wU * 0.3); ctx.lineTo(ex, ey + wF * 0.3); ctx.lineTo(hx, hy + wF * 0.3); ctx.stroke();
  ctx.strokeStyle = "rgba(255,255,255,0.13)"; ctx.lineWidth = wF * 0.25;
  ctx.beginPath(); ctx.moveTo(sx, sy - wU * 0.28); ctx.lineTo(ex, ey - wF * 0.28); ctx.lineTo(hx, hy - wF * 0.28); ctx.stroke();
  ctx.restore();
  return Math.atan2(hy - ey, hx - ex);
}
function dccGlove(b, hx, hy, r, ang) { drawGlove(ctx, hx, hy, r * 0.23, b.char.look, DCC_INK, ang); }

// ---------------------------------------------------------------- the food

// A bumpy outline round a centre: rx, ry the size, `bumps` how many lumps,
// `amp` how big, `seed` to vary it. Returns the points.
function dccLumpy(rx, ry, n, amp, seed, shape) {
  var pts = [];
  for (var i = 0; i < n; i++) {
    var a = i / n * Math.PI * 2, k = 1 + amp * (dccRand(seed + i * 1.37) - 0.5) * 2 + 0.06 * Math.sin(a * 3 + seed);
    var w = shape ? shape(a) : 1;
    pts.push({ x: Math.cos(a) * rx * k * w, y: Math.sin(a) * ry * k * w });
  }
  return pts;
}
// A smooth closed path through points (midpoint curves), so lumps look soft.
function dccBlobPath(pts) {
  var n = pts.length;
  ctx.beginPath();
  ctx.moveTo((pts[n - 1].x + pts[0].x) / 2, (pts[n - 1].y + pts[0].y) / 2);
  for (var i = 0; i < n; i++) {
    var p = pts[i], q = pts[(i + 1) % n];
    ctx.quadraticCurveTo(p.x, p.y, (p.x + q.x) / 2, (p.y + q.y) / 2);
  }
  ctx.closePath();
}
// Cartoon fried chicken breading: a scalloped, cloud-like outline, the
// inside built up from overlapping golden lumps (lit on top, a dark crevice
// under each), then fine crunchy specks. s is the piece's size, n how many lumps.
function dccScallopPath(pts) {
  var n = pts.length;
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (var i = 0; i < n; i++) {
    var p = pts[i], q = pts[(i + 1) % n], mx = (p.x + q.x) / 2, my = (p.y + q.y) / 2, d = Math.sqrt(mx * mx + my * my) || 1;
    var bulge = Math.sqrt((q.x - p.x) * (q.x - p.x) + (q.y - p.y) * (q.y - p.y)) * 0.42;
    ctx.quadraticCurveTo(mx + mx / d * bulge, my + my / d * bulge, q.x, q.y);
  }
  ctx.closePath();
}
function dccCrust(pts, s, n, seed) {
  var minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  pts.forEach(function (p) { minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x); minY = Math.min(minY, p.y); maxY = Math.max(maxY, p.y); });
  var cx = (minX + maxX) / 2, cy = (minY + maxY) / 2, hw = (maxX - minX) / 2, hh = (maxY - minY) / 2;
  dccScallopPath(pts);
  var g = ctx.createRadialGradient(cx - hw * 0.35, cy - hh * 0.45, s * 0.05, cx, cy, Math.max(hw, hh) * 1.2);
  g.addColorStop(0, "#f0b45a"); g.addColorStop(0.65, "#c87a2c"); g.addColorStop(1, "#8a4614");
  ctx.fillStyle = g; ctx.fill();
  ctx.save(); ctx.clip();
  var lumps = [];
  for (var i = 0; i < n; i++) {
    var a = dccRand(seed + i * 3.3) * Math.PI * 2, rr = Math.sqrt(dccRand(seed + i * 5.9 + 2)) * 1.05;
    lumps.push({ x: cx + Math.cos(a) * hw * rr, y: cy + Math.sin(a) * hh * rr, r: s * (0.13 + 0.12 * dccRand(seed + i * 7.1)), k: i });
  }
  lumps.sort(function (p, q) { return p.y - q.y; });
  lumps.forEach(function (L) {
    var shade = ((L.x - cx) / hw + (L.y - cy) / hh) * 0.5; // down-right is in shadow
    var pts2 = [];
    for (var j = 0; j < 8; j++) { var an = j / 8 * Math.PI * 2, q = L.r * (0.8 + 0.3 * dccRand(L.k * 9.1 + j)); pts2.push({ x: L.x + Math.cos(an) * q, y: L.y + Math.sin(an) * q * 0.8 }); }
    // crevice: a dark rim under the lump
    ctx.save(); ctx.translate(L.r * 0.12, L.r * 0.16);
    dccBlobPath(pts2); ctx.fillStyle = "rgba(92,38,8,0.75)"; ctx.fill();
    ctx.restore();
    dccBlobPath(pts2);
    var lg = ctx.createRadialGradient(L.x - L.r * 0.35, L.y - L.r * 0.4, L.r * 0.05, L.x, L.y, L.r * 1.1);
    var base = shade > 0.3 ? "#c9792c" : shade < -0.3 ? "#eaa94f" : "#da9038";
    lg.addColorStop(0, shadeHex(base, 0.35)); lg.addColorStop(0.7, base); lg.addColorStop(1, shadeHex(base, -0.18));
    ctx.fillStyle = lg; ctx.fill();
    ctx.strokeStyle = "rgba(255,230,170,0.55)"; ctx.lineWidth = Math.max(1.5, L.r * 0.1); ctx.lineCap = "round";
    ctx.beginPath(); ctx.arc(L.x, L.y, L.r * 0.62, Math.PI * 1.08, Math.PI * 1.55); ctx.stroke();
  });
  // crunchy specks
  for (var k = 0; k < n * 4; k++) {
    var sx = cx + (dccRand(seed + k * 1.9) * 2 - 1) * hw, sy = cy + (dccRand(seed + k * 2.7 + 4) * 2 - 1) * hh;
    ctx.fillStyle = k % 2 ? "rgba(255,226,160,0.7)" : "rgba(110,48,10,0.55)";
    ctx.beginPath(); ctx.arc(sx, sy, s * (0.01 + 0.012 * dccRand(k)), 0, Math.PI * 2); ctx.fill();
  }
  var sh = ctx.createLinearGradient(cx - hw, cy - hh, cx + hw, cy + hh);
  sh.addColorStop(0, "rgba(255,240,200,0.15)"); sh.addColorStop(0.55, "rgba(0,0,0,0)"); sh.addColorStop(1, "rgba(70,25,0,0.3)");
  ctx.fillStyle = sh; ctx.fillRect(minX - s, minY - s, hw * 2 + 2 * s, hh * 2 + 2 * s);
  ctx.restore();
  dccScallopPath(pts);
  ctx.strokeStyle = DCC_INK; ctx.lineWidth = Math.max(3, s * 0.03); ctx.lineJoin = "round"; ctx.stroke();
}
// A soft crinkly flake of breading: a lumpy, flattened blob.
function dccFlakeSoft(x, y, s, a, seed) {
  var pts = [];
  for (var i = 0; i < 7; i++) {
    var an = i / 7 * Math.PI * 2, rr = s * (0.65 + 0.45 * dccRand(seed * 3.1 + i));
    var px = Math.cos(an) * rr, py = Math.sin(an) * rr * 0.55, c = Math.cos(a), sn = Math.sin(a);
    pts.push({ x: x + px * c - py * sn, y: y + px * sn + py * c });
  }
  dccBlobPath(pts);
}
// One craggy chunk (cookie bits).
function dccFlake(x, y, s, a, seed) {
  ctx.beginPath();
  for (var i = 0; i < 6; i++) {
    var an = a + i / 6 * Math.PI * 2, rr = s * (0.6 + 0.5 * dccRand(seed * 3.1 + i));
    var px = x + Math.cos(an) * rr, py = y + Math.sin(an) * rr * 0.75;
    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  }
  ctx.closePath();
}

// A chocolate cake bite with glossy fudge frosting dripping down it, a white
// icing squiggle, and a bite out of the corner showing the cream and crumb.
function dccSnack(x, y, s, rot) {
  ctx.save();
  ctx.translate(x, y); ctx.rotate(rot);
  ctx.lineJoin = "round"; ctx.lineCap = "round";
  var lw = Math.max(3, s * 0.055);
  function body() {
    ctx.beginPath();
    ctx.moveTo(-s * 0.8, s * 0.5);
    ctx.quadraticCurveTo(-s * 0.88, -s * 0.45, -s * 0.35, -s * 0.62);
    ctx.lineTo(s * 0.02, -s * 0.66);
    ctx.quadraticCurveTo(s * 0.06, -s * 0.38, s * 0.3, -s * 0.42);   // the bite
    ctx.quadraticCurveTo(s * 0.38, -s * 0.16, s * 0.6, -s * 0.18);
    ctx.quadraticCurveTo(s * 0.56, s * 0.06, s * 0.8, s * 0.1);
    ctx.quadraticCurveTo(s * 0.86, s * 0.58, s * 0.6, s * 0.62);
    ctx.quadraticCurveTo(0, s * 0.72, -s * 0.8, s * 0.5);
    ctx.closePath();
  }
  // the sponge
  body();
  var sp = ctx.createLinearGradient(0, -s * 0.6, 0, s * 0.7);
  sp.addColorStop(0, "#6b3b22"); sp.addColorStop(1, "#3c1f12");
  ctx.fillStyle = sp; ctx.fill();
  ctx.save(); ctx.clip();
  // fudge frosting over the top half, dripping
  var fr = ctx.createLinearGradient(-s, -s * 0.7, s * 0.4, s * 0.3);
  fr.addColorStop(0, "#4a2414"); fr.addColorStop(1, "#1f0c06");
  ctx.fillStyle = fr;
  ctx.beginPath();
  ctx.moveTo(-s, -s); ctx.lineTo(s, -s); ctx.lineTo(s, -s * 0.05);
  var drips = [[0.62, 0.12], [0.35, 0.28], [0.08, 0.05], [-0.2, 0.34], [-0.48, 0.1], [-0.75, 0.24]];
  drips.forEach(function (d) { ctx.quadraticCurveTo(d[0] * s + s * 0.1, d[1] * s + s * 0.12, d[0] * s, d[1] * s); ctx.quadraticCurveTo(d[0] * s - s * 0.08, d[1] * s - s * 0.2, d[0] * s - s * 0.14, -s * 0.05); });
  ctx.lineTo(-s, -s * 0.05); ctx.closePath(); ctx.fill();
  // crumb texture on the sponge
  ctx.fillStyle = "rgba(30,12,5,0.35)";
  for (var i = 0; i < 26; i++) { ctx.beginPath(); ctx.arc((dccRand(i * 2.1) * 1.6 - 0.8) * s, (0.1 + dccRand(i * 3.7) * 0.55) * s, s * (0.02 + 0.02 * dccRand(i)), 0, Math.PI * 2); ctx.fill(); }
  ctx.restore();
  // inside the bite: cream and crumb
  ctx.fillStyle = "#fbf3e6";
  ctx.beginPath();
  ctx.moveTo(s * 0.06, -s * 0.34); ctx.quadraticCurveTo(s * 0.3, -s * 0.36, s * 0.36, -s * 0.12);
  ctx.quadraticCurveTo(s * 0.52, -s * 0.08, s * 0.6, s * 0.1);
  ctx.quadraticCurveTo(s * 0.32, s * 0.16, s * 0.06, -s * 0.34);
  ctx.fill();
  ctx.fillStyle = "#7a4528";
  [[0.14, -0.22], [0.26, -0.05], [0.44, 0.06], [0.2, -0.3]].forEach(function (c) { ctx.beginPath(); ctx.arc(c[0] * s, c[1] * s, s * 0.035, 0, Math.PI * 2); ctx.fill(); });
  body(); ctx.strokeStyle = DCC_INK; ctx.lineWidth = lw; ctx.stroke();
  // gloss on the frosting and the white squiggle
  ctx.fillStyle = "rgba(255,255,255,0.28)";
  ctx.beginPath(); ctx.ellipse(-s * 0.45, -s * 0.38, s * 0.22, s * 0.08, -0.25, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = "#f8efe2"; ctx.lineWidth = Math.max(2, s * 0.055);
  ctx.beginPath(); ctx.moveTo(-s * 0.66, -s * 0.36);
  for (var j = 1; j <= 6; j++) ctx.quadraticCurveTo(-s * 0.66 + (j - 0.5) * s * 0.11, -s * (j % 2 ? 0.56 : 0.24), -s * 0.66 + j * s * 0.11, -s * 0.4);
  ctx.stroke();
  ctx.restore();
}

// A whole chocolate ice cream cake on a plate (like the one in his video):
// mocha frosted sides, a ring of piped chocolate rosettes, the top heaped
// with crushed chocolate sandwich cookies, and a slice cut out of the front
// showing the layers: chocolate ice cream with cookie bits, the fudge crunch,
// then darker chocolate.
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
  // the frosted walls either side of the gap, with comb lines
  var wall = ctx.createLinearGradient(-R, 0, R, 0);
  wall.addColorStop(0, "#8a5e57"); wall.addColorStop(0.35, "#c79a92"); wall.addColorStop(0.7, "#b8887f"); wall.addColorStop(1, "#7c5049");
  [[0, a1], [a2, Math.PI]].forEach(function (seg) {
    ctx.beginPath();
    ctx.ellipse(0, 0, R, ry, 0, seg[0], seg[1], false);
    var e = P(seg[1], h); ctx.lineTo(e.x, e.y);
    ctx.ellipse(0, h, R, ry, 0, seg[1], seg[0], true);
    ctx.closePath();
    ctx.fillStyle = wall; ctx.fill();
    ctx.save(); ctx.clip();
    ctx.strokeStyle = "rgba(255,255,255,0.14)"; ctx.lineWidth = R * 0.012;
    for (var c = 1; c < 6; c++) { ctx.beginPath(); ctx.ellipse(0, h * c / 6, R, ry, 0, seg[0], seg[1], false); ctx.stroke(); }
    ctx.restore();
    ctx.strokeStyle = DCC_INK; ctx.lineWidth = lw;
    ctx.stroke();
  });
  // the two cut faces
  var bands = [[0, 0.07, "#b98c84"], [0.07, 0.46, "#a8766a"], [0.46, 0.58, "#3a1e13"], [0.58, 1, "#734536"]];
  [a2, a1].forEach(function (a) {
    var p = P(a);
    function quad(f0, f1) { ctx.beginPath(); ctx.moveTo(0, f0 * h); ctx.lineTo(p.x, p.y + f0 * h); ctx.lineTo(p.x, p.y + f1 * h); ctx.lineTo(0, f1 * h); ctx.closePath(); }
    bands.forEach(function (bd) { ctx.fillStyle = bd[2]; quad(bd[0], bd[1]); ctx.fill(); });
    // cookie bits in the ice cream, specks in the crunch
    ctx.save(); quad(0.07, 0.58); ctx.clip();
    for (var i = 0; i < 26; i++) {
      var k = dccRand(i * 4.3 + a), f = 0.1 + 0.46 * dccRand(i * 2.9 + a * 3);
      ctx.fillStyle = f > 0.46 ? "#c9a07a" : "#2a150d";
      ctx.beginPath(); ctx.arc(p.x * k, p.y * k + f * h, R * (0.015 + 0.02 * dccRand(i + 5)), 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
    ctx.fillStyle = a === a1 ? "rgba(0,0,0,0.18)" : "rgba(255,255,255,0.05)"; // light from the left
    quad(0, 1); ctx.fill(); ctx.stroke();
  });
  // the top, minus the slice
  var q2 = P(a2);
  function topPath() {
    ctx.beginPath();
    ctx.moveTo(0, 0); ctx.lineTo(q2.x, q2.y);
    ctx.ellipse(0, 0, R, ry, 0, a2, a1 + Math.PI * 2, false);
    ctx.closePath();
  }
  topPath();
  ctx.fillStyle = "#5a3328"; ctx.fill();
  ctx.save(); topPath(); ctx.clip();
  // crushed cookies heaped on top: dark chunks, a few with their cream showing
  for (var j = 0; j < 70; j++) {
    var ca = dccRand(j * 1.7) * Math.PI * 2, cr = Math.sqrt(dccRand(j * 2.3 + 1)) * 0.92;
    var px = Math.cos(ca) * R * cr, py = Math.sin(ca) * ry * cr - R * 0.02, cs = R * (0.05 + 0.05 * dccRand(j + 9));
    ctx.fillStyle = "rgba(20,8,4,0.5)";
    dccFlake(px + cs * 0.2, py + cs * 0.25, cs, dccRand(j) * 6, j + 40); ctx.fill();
    ctx.fillStyle = j % 7 === 0 ? "#efe4d2" : (j % 3 ? "#24120b" : "#3a2016");
    dccFlake(px, py, cs, dccRand(j) * 6, j + 40); ctx.fill();
    if (j % 7 !== 0) { ctx.fillStyle = "rgba(255,255,255,0.16)"; ctx.beginPath(); ctx.arc(px - cs * 0.25, py - cs * 0.25, cs * 0.25, 0, Math.PI * 2); ctx.fill(); }
  }
  ctx.restore();
  topPath(); ctx.stroke();
  // piped chocolate rosettes round the edge, skipping the cut
  for (var r2 = 0; r2 < 26; r2++) {
    var ra = a2 + 0.14 + r2 / 25 * (a1 + Math.PI * 2 - a2 - 0.28), rp = { x: R * 0.94 * Math.cos(ra), y: ry * 0.94 * Math.sin(ra) };
    var rs = R * 0.075 * (0.85 + 0.15 * Math.sin(ra)); // the near ones a touch bigger
    ctx.fillStyle = "#6e4136"; ctx.strokeStyle = DCC_INK; ctx.lineWidth = lw * 0.6;
    ctx.beginPath(); ctx.arc(rp.x, rp.y, rs, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = "#a6766a"; ctx.lineWidth = rs * 0.28;
    ctx.beginPath(); ctx.arc(rp.x, rp.y, rs * 0.5, ra, ra + 4.4); ctx.stroke();
  }
  ctx.restore();
}

// A big piece of fried chicken (a breast, like the one in his video): a
// lumpy shape covered in craggy golden breading.
function dccChicken(x, y, s, rot) {
  ctx.save();
  ctx.translate(x, y); ctx.rotate(rot);
  ctx.fillStyle = "rgba(60,0,40,0.16)";
  ctx.beginPath(); ctx.ellipse(s * 0.12, s * 0.2, s * 1.3, s * 0.8, 0, 0, Math.PI * 2); ctx.fill();
  var pts = dccLumpy(s * 1.2, s * 0.72, 20, 0.12, 11, function (a) { return 1 + 0.16 * Math.cos(a) - 0.08 * Math.cos(2 * a); });
  dccCrust(pts, s, 46, 17);
  ctx.restore();
}

// A fried chicken drumstick, the bone in his glove at (x, y) and the meat
// pointing `ang`: a knobbly bone end poking out under the glove, then the
// fat craggy drumstick, `s` about its length.
function dccDrumstick(x, y, s, ang) {
  ctx.save();
  ctx.translate(x, y); ctx.rotate(ang + Math.PI / 2); // up the stick is -y
  ctx.lineJoin = "round"; ctx.lineCap = "round";
  var lw = Math.max(3, s * 0.035);
  // the bone, through the glove and out the bottom
  ctx.strokeStyle = DCC_INK; ctx.lineWidth = s * 0.2 + lw * 2;
  ctx.beginPath(); ctx.moveTo(0, s * 0.42); ctx.lineTo(0, -s * 0.35); ctx.stroke();
  var bone = ctx.createLinearGradient(-s * 0.1, 0, s * 0.1, 0);
  bone.addColorStop(0, "#efe6d2"); bone.addColorStop(0.5, "#fffaf0"); bone.addColorStop(1, "#d4c7ac");
  ctx.strokeStyle = bone; ctx.lineWidth = s * 0.2;
  ctx.beginPath(); ctx.moveTo(0, s * 0.42); ctx.lineTo(0, -s * 0.35); ctx.stroke();
  ctx.fillStyle = "#fbf4e6"; ctx.strokeStyle = DCC_INK; ctx.lineWidth = lw;
  [-1, 1].forEach(function (k) { ctx.beginPath(); ctx.arc(k * s * 0.09, s * 0.47, s * 0.1, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); });
  ctx.fillStyle = "#fbf4e6";
  ctx.fillRect(-s * 0.09, s * 0.37, s * 0.18, s * 0.1);
  // the meat: narrow where it meets the bone, round and fat at the top
  var pts = dccLumpy(s * 0.4, s * 0.64, 14, 0.1, 3, function (a) { var sn = Math.sin(a); return sn > 0 ? 1 - 0.62 * Math.pow(sn, 3) : 1 + 0.06 * sn * sn; });
  ctx.save(); ctx.translate(0, -s * 0.75);
  dccCrust(pts, s * 0.9, 22, 29);
  ctx.restore();
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
  dccSnack(hx + 4, hy - r * 0.21 - 90, 135, -0.25 + 0.1 * near);
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
  dccChicken(870, 800 + 8 * Math.sin(u * 2 + 1), 155, -0.22 + 0.04 * Math.sin(u * 1.7));
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
    dccDrumstick(gx, gy, 215, meat);
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
