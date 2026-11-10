// The regular takedown as a ragdoll throw (Joe picked "C" from the
// takedown mock-up, 2026-11-10, without the dizzy stars or the ground
// cracking): the grappler grabs, hoists and spins the opponent through the
// air, slams them into the mat with a big dust burst, a camera punch-in and
// "THROWN!", and they bounce twice before the fight goes on.
//
// Only the grab's own timing changes the fight (a slightly longer carry);
// everything else here is looks and sound. Effects tick in update(), so a
// seeded replay shows them exactly the same.
var TOSS_EXTRA = 0.4;  // seconds added to the grapple's carry so the throw reads
var TOSS_HOLD = 0.22;  // matches the grab-on hold in abilities.js
var TOSS_RISE = 55, TOSS_UP = 30; // how far off the line the arc swings, and up
var TOSS_BOUNCE = 0.9; // seconds of bouncing after the landing
var tossFx = [];
var tossCam = { z: 1, x: 0, y: 0, t: 0, dur: 0, peak: 1 };
var tossZoomBuf = null;

function resetToss() { tossFx = []; tossCam.z = 1; tossCam.dur = 0; }

// From beginGrapple (match.js): every regular takedown is a throw, except
// the finisher and Do Bronx (straight into a submission). Grappler vs
// Grappler grabs throw too (Joe, 2026-11-10): the reattack out of a sprawl
// scramble, and the Iowa Style slam, which lands the throw at the wall and
// then presses them into it (grapple-duel.js).
function setupToss(attacker, target, g, gr) {
  if (g.finisher || attacker.doBronx) return;
  g.toss = true;
  g.dur = gr.speed + TOSS_EXTRA;
  // Spins away from the side the thrower is on (no dice roll, so seeded
  // fights replay the same).
  var dx = g.endX - g.startX, dy = g.endY - g.startY;
  var cx = dx * (target.y - attacker.y) - dy * (target.x - attacker.x);
  g.spin = cx >= 0 ? 1 : -1;
  playTossWhooshes(g.dur);
}

function tossOf(b) {
  var o = balls[1 - b.id], g = o && o.grapple;
  return g && g.toss && g.targetId === b.id && g.phase === "carry" ? g : null;
}
// 0 on the mat, 1 at the top of the arc.
function tossLift(g) {
  var pt = g.pt || 0;
  return pt < TOSS_HOLD ? 0 : Math.sin((pt - TOSS_HOLD) / (1 - TOSS_HOLD) * Math.PI);
}
// Where the thrown fighter is drawn (off its real spot, up the arc).
function tossView(g, b) {
  var L = tossLift(g), dx = g.endX - g.startX, dy = g.endY - g.startY, dl = Math.sqrt(dx * dx + dy * dy) || 1;
  var ax = -dy / dl * g.spin, ay = dx / dl * g.spin;
  return { x: b.x + ax * L * TOSS_RISE, y: b.y + ay * L * TOSS_RISE - L * TOSS_UP, s: 1 + 0.18 * L, L: L, dirx: dx / dl, diry: dy / dl };
}

// Pose (draw.js, inside the fighter's transform): up the arc, spinning,
// then bouncing after the landing.
function applyTossPose(b) {
  var g = tossOf(b);
  if (g) {
    var v = tossView(g, b), tt = Math.max(0, ((g.pt || 0) - TOSS_HOLD) / (1 - TOSS_HOLD));
    ctx.translate(v.x, v.y);
    ctx.scale(v.s, v.s);
    ctx.rotate(tt * Math.PI * 2.5 * g.spin);
    ctx.translate(-b.x, -b.y);
    return;
  }
  for (var i = 0; i < tossFx.length; i++) {
    var f = tossFx[i];
    if (f.kind !== "bounce" || f.id !== b.id) continue;
    var k = f.t / f.dur, hb = Math.abs(Math.sin(k * Math.PI * 2)) * (1 - k) * 34;
    ctx.translate(b.x, b.y - hb);
    ctx.scale(1 + hb / 200, 1 + hb / 200);
    ctx.rotate((1 - k) * f.spin * 1.4);
    ctx.translate(-b.x, -b.y);
  }
}

// The shadow left on the mat under the fighter in the air (under fighters).
function drawTossUnder() {
  balls.forEach(function (b) {
    var g = tossOf(b);
    if (!g || !b.alive) return;
    var L = tossLift(g);
    if (L <= 0.01) return;
    ctx.save();
    ctx.globalAlpha = 0.28 + 0.1 * (1 - L);
    ctx.fillStyle = "#000";
    ctx.beginPath(); ctx.ellipse(b.x, b.y + b.r * 0.6, b.r * (1 - 0.3 * L), b.r * 0.42 * (1 - 0.3 * L), 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  });
}

// From drawGrapple (draw-attacks.js): afterimages, speed lines, and both
// gloves dug in until the release. True if it drew the grab.
function drawTossGrip(self) {
  var g = self.grapple;
  if (!g || !g.toss || g.phase !== "carry") return false;
  var tgt = balls[g.targetId];
  if (!tgt) return true;
  var pt = g.pt || 0, v = tossView(g, tgt), px = -v.diry, py = v.dirx;
  ctx.save();
  if (pt > 0.25) {
    ctx.fillStyle = tgt.char.color;
    for (var k = 1; k <= 4; k++) {
      ctx.globalAlpha = 0.22 - k * 0.04;
      ctx.beginPath(); ctx.arc(v.x - v.dirx * k * 16, v.y - v.diry * k * 16, tgt.r * v.s, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 0.7;
    ctx.strokeStyle = "#fff"; ctx.lineCap = "round"; ctx.lineWidth = 3;
    for (var s = -2; s <= 2; s++) {
      var off = s * tgt.r * 0.45, len = 40 + 30 * (2 - Math.abs(s));
      var sx = v.x - v.dirx * (tgt.r + 10) + px * off, sy = v.y - v.diry * (tgt.r + 10) + py * off;
      ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(sx - v.dirx * len, sy - v.diry * len); ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }
  if (pt < 0.97) {
    var sq = pt < TOSS_HOLD ? pt / TOSS_HOLD : 1;
    var hr = tgt.r * 0.38 * v.s, ho = tgt.r * (0.86 - 0.12 * sq) * v.s;
    ctx.fillStyle = gloveColor(self.char); ctx.strokeStyle = theme.wall; ctx.lineWidth = 2.5;
    [1, -1].forEach(function (sg) {
      var hx = v.x + px * ho * sg - v.dirx * tgt.r * 0.25 * v.s, hy = v.y + py * ho * sg - v.diry * tgt.r * 0.25 * v.s;
      ctx.beginPath(); ctx.arc(hx, hy, hr, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      if (sq >= 1 && Math.floor(pt * 30) % 2 === 0) { // squeezing
        ctx.save(); ctx.strokeStyle = "#fff"; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(hx + px * sg * hr * 1.3, hy + py * sg * hr * 1.3); ctx.lineTo(hx + px * sg * hr * 2, hy + py * sg * hr * 2); ctx.stroke();
        ctx.restore();
      }
    });
  }
  ctx.restore();
  return true;
}

// The landing (abilities.js, right after the takedown's damage).
function tossImpact(atk, b, g) {
  var x = b.x, y = b.y;
  tossDust(x, y, 10, 1.1);
  tossFx.push({ kind: "ring", t: 0, dur: 0.45, x: x, y: y });
  for (var i = 0; i < 18; i++) {
    var a = Math.atan2(g.ny, g.nx) + (Math.random() * 2 - 1) * 1.4, sp = 144 + Math.random() * 216;
    particles.push({ x: x, y: y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 0.35 + Math.random() * 0.45, max: 0.8, size: 2.5 + Math.random() * 3.5, color: i % 2 ? "#ffffff" : "#cfc4ae" });
  }
  tossFx.push({ kind: "word", t: 0, dur: 1.1, x: x, y: y - b.r - 95 });
  tossFx.push({ kind: "bounce", t: 0, dur: TOSS_BOUNCE, id: b.id, spin: g.spin, dusted: false });
  if (!reduceMotion) {
    shake = Math.max(shake, 24);
    hitStop = Math.max(hitStop, 0.1);
    tossCam.z = tossCam.peak = 1.22; tossCam.x = x; tossCam.y = y; tossCam.t = 0; tossCam.dur = 0.6;
  }
  playTossLand();
}
// Iowa Style takes over right after the landing: the pinned fighter is
// pressed flat into the wall, so it skips the bounce.
function tossSkipBounce(b) {
  tossFx = tossFx.filter(function (f) { return !(f.kind === "bounce" && f.id === b.id); });
}
function tossDust(x, y, n, big) {
  for (var i = 0; i < n; i++) {
    tossFx.push({ kind: "puff", t: 0, dur: 0.6 + Math.random() * 0.3, x: x, y: y, a: i / n * Math.PI * 2 + (Math.random() - 0.5) * 0.4, v: (90 + Math.random() * 80) * big, s: (10 + Math.random() * 8) * big });
  }
}

// From update() (also through hit-stops, so the landing keeps moving).
function tickToss(dt) {
  for (var i = 0; i < tossFx.length; i++) {
    var f = tossFx[i];
    f.t += dt;
    if (f.kind === "bounce" && !f.dusted && f.t > f.dur / 2) { // the second landing
      f.dusted = true;
      var b = balls[f.id];
      if (b && b.alive) tossDust(b.x, b.y, 6, 0.8);
    }
  }
  tossFx = tossFx.filter(function (f) { return f.t < f.dur; });
  if (tossCam.dur) {
    tossCam.t += dt;
    var k = Math.min(1, tossCam.t / tossCam.dur);
    tossCam.z = 1 + (tossCam.peak - 1) * Math.pow(1 - k, 2);
    if (k >= 1) { tossCam.dur = 0; tossCam.z = 1; }
  }
}

// Over the fighters, in arena space (draw.js): dust, the shockwave ring
// and "THROWN!".
function drawTossOver() {
  tossFx.forEach(function (f) {
    var k = f.t / f.dur;
    ctx.save();
    if (f.kind === "puff") {
      var e = 1 - Math.pow(1 - k, 2);
      ctx.globalAlpha = 0.55 * (1 - k); ctx.fillStyle = "#cfc4ae";
      ctx.beginPath(); ctx.arc(f.x + Math.cos(f.a) * f.v * e * 0.6, f.y + Math.sin(f.a) * f.v * e * 0.6, f.s * (1 + k), 0, Math.PI * 2); ctx.fill();
    } else if (f.kind === "ring") {
      ctx.globalAlpha = 1 - k; ctx.strokeStyle = "#fff"; ctx.lineWidth = 8 * (1 - k) + 1;
      ctx.beginPath(); ctx.arc(f.x, f.y, 10 + 110 * (1 - Math.pow(1 - k, 3)), 0, Math.PI * 2); ctx.stroke();
    } else if (f.kind === "word") {
      var pop = k < 0.12 ? 1.8 - 0.8 * (k / 0.12) : 1;
      ctx.globalAlpha = k > 0.75 ? (1 - k) / 0.25 : 1;
      ctx.font = '900 48px Impact, "Arial Black", sans-serif';
      var half = ctx.measureText("THROWN!").width / 2 + 8;
      ctx.translate(Math.min(W - half, Math.max(half, f.x)), Math.max(30, f.y - k * 20)); ctx.rotate(-0.12); ctx.scale(pop, pop);
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.lineJoin = "round"; ctx.lineWidth = 9; ctx.strokeStyle = "#1b1718"; ctx.strokeText("THROWN!", 0, 0);
      ctx.fillStyle = "#7ee0ff"; ctx.fillText("THROWN!", 0, 0);
    }
    ctx.restore();
  });
}

// The camera punching in on the landing (end of draw()).
function tossScreenZoom(ox, oy, sc) {
  if (tossCam.z <= 1.002) return;
  var cw = canvas.width, ch = canvas.height;
  if (!tossZoomBuf) tossZoomBuf = document.createElement("canvas");
  if (tossZoomBuf.width !== cw || tossZoomBuf.height !== ch) { tossZoomBuf.width = cw; tossZoomBuf.height = ch; }
  var bx = tossZoomBuf.getContext("2d");
  bx.setTransform(1, 0, 0, 1, 0, 0); bx.clearRect(0, 0, cw, ch); bx.drawImage(canvas, 0, 0);
  var vw = cw / tossCam.z, vh = ch / tossCam.z;
  var fx = Math.min(cw - vw / 2, Math.max(vw / 2, ox + sc * tossCam.x)), fy = Math.min(ch - vh / 2, Math.max(vh / 2, oy + sc * tossCam.y));
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.drawImage(tossZoomBuf, fx - vw / 2, fy - vh / 2, vw, vh, 0, 0, cw, ch);
  ctx.restore();
}
