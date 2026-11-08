// Death animations: what happens to the losing fighter when the fight ends.
// The Death button (deathBtn) steps through the styles, saved per device:
//   classic  - the old pop of coloured particles
//   instant  - blows apart the moment it dies, on the big blast (default)
//   explode  - slow motion: swells, flashes white, blows apart in chunks
//   arcade   - everything freezes, the ball hops up and drops off the screen
//   shatter  - freeze frame, cracks spread, then it breaks like glass
//   koflight - slow-mo knockback flight with a trail, then a big "K.O.!"
//   pixel    - dissolves into retro pixels that drift away
// Each style plays its own chiptune / video game sound. The fighter is
// snapshotted off the canvas the moment it dies, so the effect works for
// every fighter look. The win banner waits until the animation is done.
"use strict";

var DEATH_KEY = "ballbrawl_death_v1";
var DEATH_LIST = ["instant", "explode", "arcade", "shatter", "koflight", "pixel", "classic"];
var DEATH_NAMES = { instant: "Instant explode", explode: "Slow-mo explode", arcade: "Arcade drop", shatter: "Shatter", koflight: "K.O. flight", pixel: "Pixel dissolve", classic: "Classic" };
var DEATH_LEN = { instant: 1.9, explode: 2.6, arcade: 2.6, shatter: 2.4, koflight: 2.6, pixel: 2.2, classic: 0 };
var deathStyle = "instant";
try { var savedDeath = localStorage.getItem(DEATH_KEY); if (DEATH_NAMES[savedDeath]) deathStyle = savedDeath; } catch (e) {}

var deathFx = null;        // the animation playing now
var lastArenaXf = null;    // how arena units map onto the canvas (set by draw)

function setDeathStyle(id) {
  deathStyle = id;
  try { localStorage.setItem(DEATH_KEY, id); } catch (e) {}
  updateDeathButtons();
}
function updateDeathButtons() {
  Array.prototype.forEach.call(document.querySelectorAll(".deathBtn"), function (btn) {
    btn.textContent = "Death: " + DEATH_NAMES[deathStyle];
  });
}

// From burst(): the fighter just died.
function startDeathFx(b) {
  if (deathStyle === "classic" || deathFx || !lastArenaXf) return false;
  var win = balls[1 - b.id], dx = b.x - win.x, dy = b.y - win.y, d = Math.sqrt(dx * dx + dy * dy) || 1;
  deathFx = {
    style: deathStyle, t: 0, x: b.x, y: b.y, r: b.r, color: b.char.color,
    dirX: dx / d, dirY: dy / d, snap: snapFighter(b), after: null, boomed: false, shards: null
  };
  deathFx.last = performance.now();
  if (deathStyle === "instant") playDeathBoom("instant"); // no build-up: straight to the blast
  else playDeathIntro(deathFx.style);
  return true;
}
function deathFxBusy() { return !!deathFx && deathFx.t < DEATH_LEN[deathFx.style]; }
// checkEnd hands over the win banner, to show once the animation's done.
function afterDeathFx(fn) { if (deathFxBusy()) deathFx.after = fn; else fn(); }
function resetDeathFx() { deathFx = null; }

// The whole game runs slowed (or frozen) while it plays (main.js).
function deathTimeScale() {
  var f = deathFx;
  if (!f || f.t >= DEATH_LEN[f.style]) return 1;
  var t = f.t;
  switch (f.style) {
    case "instant": return t < 0.12 ? 0 : 1; // a split-second hit-stop on the blast
    case "explode": return t < 1.5 ? 0.18 : Math.min(1, 0.18 + (t - 1.5));
    case "arcade": return 0; // frozen, like the old platformers
    case "shatter": return t < 0.7 ? 0 : t < 1.7 ? 0.3 : 1;
    case "koflight": return t < 1.6 ? 0.22 : 1;
    case "pixel": return t < 1.2 ? 0.4 : 1;
  }
  return 1;
}

// Copies the fighter off the canvas as it looked the frame it died.
function snapFighter(b) {
  var xf = lastArenaXf, rad = b.r * 1.25;
  var px = Math.max(8, Math.round(rad * 2 * xf.s));
  var c = document.createElement("canvas");
  c.width = px; c.height = px;
  var g = c.getContext("2d");
  try {
    g.drawImage(canvas, xf.ox + (b.x - rad) * xf.s, xf.oy + (b.y - rad) * xf.s, rad * 2 * xf.s, rad * 2 * xf.s, 0, 0, px, px);
    // Keep just the ball (and a little round it for the gloves).
    g.globalCompositeOperation = "destination-in";
    g.beginPath(); g.arc(px / 2, px / 2, px / 2 * (b.r * 1.08 / rad), 0, Math.PI * 2); g.fill();
  } catch (e) { /* drawn as a plain coloured ball instead */ c = null; }
  return { canvas: c, rad: rad };
}
function drawSnap(f, x, y, scale, rot, alpha) {
  ctx.save();
  ctx.globalAlpha = alpha == null ? 1 : alpha;
  ctx.translate(x, y); ctx.rotate(rot || 0); ctx.scale(scale, scale);
  var rad = f.snap.rad;
  if (f.snap.canvas) ctx.drawImage(f.snap.canvas, -rad, -rad, rad * 2, rad * 2);
  else { ctx.fillStyle = f.color; ctx.beginPath(); ctx.arc(0, 0, f.r, 0, Math.PI * 2); ctx.fill(); }
  ctx.restore();
}

// From draw(), in arena units, over the fighters.
function drawDeathFx() {
  var f = deathFx;
  if (!f) return;
  var now = performance.now();
  var dt = gamePaused ? 0 : Math.min(0.1, (now - f.last) / 1000);
  f.last = now; f.t += dt;
  var len = DEATH_LEN[f.style];
  if (f.t >= len && f.after) { var fn = f.after; f.after = null; fn(); }
  if (f.t > len + 0.5) return;
  ({ instant: drawExplode, explode: drawExplode, arcade: drawArcade, shatter: drawShatter, koflight: drawKoFlight, pixel: drawPixel })[f.style](f, dt);
}

// ---------------------------------------------------------------- explode
// Swells and shakes, flashing white faster and faster, then a white-hot
// blast: chunks of the fighter, fire and smoke, and a shockwave, all drifting
// in slow motion before the game speeds back up.
var EX_POP = 0.95;
function drawExplode(f, dt) {
  var t = f.t, inst = f.style === "instant", pop = inst ? 0 : EX_POP;
  if (t < pop) {
    var k = t / EX_POP, jit = k * k * f.r * 0.12;
    var x = f.x + (Math.random() - 0.5) * jit, y = f.y + (Math.random() - 0.5) * jit;
    drawSnap(f, x, y, 1 + 0.35 * k * k, 0);
    // White flashes, quicker as it builds
    var flash = Math.max(0, Math.sin(t * (10 + 40 * k)));
    ctx.fillStyle = "rgba(255,255,255," + (flash * 0.75 * k).toFixed(3) + ")";
    ctx.beginPath(); ctx.arc(x, y, f.r * (1 + 0.35 * k * k), 0, Math.PI * 2); ctx.fill();
    return;
  }
  if (!f.boomed) {
    f.boomed = true;
    shake = Math.max(shake, inst ? 18 : 14);
    if (!inst) playDeathBoom(f.style); // (instant's blast already went off in startDeathFx)
    f.shards = inst ? makeTileShards(f, 6, 160, 420) : makeTileShards(f, 5, 70, 160);
    f.fire = [];
    for (var i = 0; i < (inst ? 90 : 70); i++) {
      var a = Math.random() * Math.PI * 2, sp = inst ? 120 + Math.random() * 420 : 50 + Math.random() * 230;
      f.fire.push({ x: f.x, y: f.y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, s: 9 + Math.random() * 20, life: 0.9 + Math.random() * 1.1, smoke: Math.random() < 0.35 });
    }
  }
  var bt = t - pop, slow = inst ? 1 : deathTimeScale() * 0.7 + 0.3; // drifts slowly, then speeds up
  // Fire and smoke
  f.fire.forEach(function (p) {
    p.x += p.vx * dt * slow; p.y += p.vy * dt * slow; p.life -= dt * slow;
    if (p.life <= 0) return;
    var a = Math.min(1, p.life);
    ctx.fillStyle = p.smoke ? "rgba(60,60,60," + (a * 0.55).toFixed(3) + ")" : (p.life > 0.7 ? "rgba(255,230,120," + a.toFixed(3) + ")" : "rgba(255,120,30," + a.toFixed(3) + ")");
    ctx.beginPath(); ctx.arc(p.x, p.y, p.s * (p.smoke ? 1.4 + (1 - a) : 0.6 + a * 0.6), 0, Math.PI * 2); ctx.fill();
  });
  stepShards(f, dt * slow, 0);
  // Shockwave ring and the white-hot core
  var ring = Math.min(1, bt / (inst ? 0.6 : 1.1));
  ctx.strokeStyle = "rgba(255,255,255," + (1 - ring).toFixed(3) + ")";
  ctx.lineWidth = 10 * (1 - ring) + 1;
  ctx.beginPath(); ctx.arc(f.x, f.y, f.r + (inst ? 340 : 260) * ring, 0, Math.PI * 2); ctx.stroke();
  var core = Math.max(0, 1 - bt / (inst ? 0.25 : 0.35));
  if (core > 0) {
    ctx.fillStyle = "rgba(255,255,240," + core.toFixed(3) + ")";
    ctx.beginPath(); ctx.arc(f.x, f.y, f.r * (1.4 + bt * 3), 0, Math.PI * 2); ctx.fill();
  }
}

// Square tiles cut from the snapshot, flying out from the middle.
function makeTileShards(f, n, s0, s1) {
  var out = [], rad = f.snap.rad, cell = rad * 2 / n;
  for (var i = 0; i < n; i++) for (var j = 0; j < n; j++) {
    var cx = -rad + (i + 0.5) * cell, cy = -rad + (j + 0.5) * cell;
    if (cx * cx + cy * cy > f.r * f.r * 1.1) continue;
    var a = Math.atan2(cy, cx) + (Math.random() - 0.5) * 0.6, sp = s0 + Math.random() * (s1 - s0);
    out.push({ i: i, j: j, n: n, cell: cell, x: f.x + cx, y: f.y + cy, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, rot: 0, vr: (Math.random() - 0.5) * 8, life: 1.6 + Math.random() * 0.6 });
  }
  return out;
}
function stepShards(f, dt, gravity) {
  var img = f.snap.canvas;
  f.shards.forEach(function (p) {
    p.x += p.vx * dt; p.y += p.vy * dt; p.vy += gravity * dt; p.rot += p.vr * dt; p.life -= dt;
    if (p.life <= 0) return;
    ctx.save();
    ctx.globalAlpha = Math.min(1, p.life * 1.5);
    ctx.translate(p.x, p.y); ctx.rotate(p.rot);
    if (img) {
      var sc = img.width / (f.snap.rad * 2);
      ctx.drawImage(img, p.i * p.cell * sc, p.j * p.cell * sc, p.cell * sc, p.cell * sc, -p.cell / 2, -p.cell / 2, p.cell, p.cell);
    } else { ctx.fillStyle = f.color; ctx.fillRect(-p.cell / 2, -p.cell / 2, p.cell, p.cell); }
    ctx.restore();
  });
}

// ---------------------------------------------------------------- arcade
// The old platformer death: everything stops, the ball blinks, then pops up
// and falls spinning off the bottom of the screen.
function drawArcade(f) {
  var t = f.t, hold = 0.55;
  if (t < hold) {
    if (Math.floor(t * 14) % 2 === 0) drawSnap(f, f.x, f.y, 1, 0);
    return;
  }
  var u = t - hold, vy0 = -520, g = 1500;
  var y = f.y + vy0 * u + 0.5 * g * u * u;
  drawSnap(f, f.x, y, 1.1, u * 7);
}

// ---------------------------------------------------------------- shatter
// Freeze frame, cracks race across it, then it breaks into glass shards
// that tumble and fall.
var SH_BREAK = 0.75;
function drawShatter(f, dt) {
  var t = f.t;
  if (!f.cracks) {
    f.cracks = [];
    for (var i = 0; i < 9; i++) {
      var a = i / 9 * Math.PI * 2 + Math.random() * 0.4, pts = [{ x: 0, y: 0 }], r = 0;
      while (r < f.r * 1.05) { r += f.r * (0.15 + Math.random() * 0.15); var aa = a + (Math.random() - 0.5) * 0.5; pts.push({ x: Math.cos(aa) * r, y: Math.sin(aa) * r }); }
      f.cracks.push(pts);
    }
  }
  if (t < SH_BREAK) {
    drawSnap(f, f.x, f.y, 1, 0);
    var k = Math.min(1, t / (SH_BREAK * 0.8));
    ctx.save(); ctx.translate(f.x, f.y);
    ctx.strokeStyle = "rgba(255,255,255,0.95)"; ctx.lineWidth = 2.2; ctx.lineJoin = "round";
    f.cracks.forEach(function (pts) {
      var n = Math.max(1, Math.ceil(pts.length * k));
      ctx.beginPath(); ctx.moveTo(pts[0].x, pts[0].y);
      for (var i = 1; i < n; i++) ctx.lineTo(pts[i].x, pts[i].y);
      ctx.stroke();
    });
    ctx.restore();
    if (!f.tinked && t > 0.05) { f.tinked = true; playDeathCrack(); }
    return;
  }
  if (!f.boomed) {
    f.boomed = true;
    shake = Math.max(shake, 8);
    playDeathBoom(f.style);
    // Wedge shards between neighbouring cracks
    f.shards = f.cracks.map(function (pts, i) {
      var next = f.cracks[(i + 1) % f.cracks.length], a0 = Math.atan2(pts[1].y, pts[1].x), a1 = Math.atan2(next[1].y, next[1].x);
      if (a1 < a0) a1 += Math.PI * 2;
      var mid = (a0 + a1) / 2, sp = 60 + Math.random() * 90;
      return { a0: a0, a1: a1, x: f.x, y: f.y, vx: Math.cos(mid) * sp, vy: Math.sin(mid) * sp - 60, rot: 0, vr: (Math.random() - 0.5) * 5, life: 1.6 };
    });
    f.glints = [];
    for (var j = 0; j < 30; j++) { var ga = Math.random() * Math.PI * 2, gs = 80 + Math.random() * 200; f.glints.push({ x: f.x, y: f.y, vx: Math.cos(ga) * gs, vy: Math.sin(ga) * gs, life: 0.6 + Math.random() * 0.6 }); }
  }
  var slow = Math.max(0.3, deathTimeScale()), step = dt * slow;
  f.shards.forEach(function (p) {
    p.x += p.vx * step; p.y += p.vy * step; p.vy += 520 * step; p.rot += p.vr * step; p.life -= step;
    if (p.life <= 0) return;
    ctx.save();
    ctx.globalAlpha = Math.min(1, p.life * 1.5);
    ctx.translate(p.x, p.y); ctx.rotate(p.rot);
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, f.r * 1.08, p.a0, p.a1); ctx.closePath();
    ctx.save(); ctx.clip();
    drawSnap(f, 0, 0, 1, 0);
    ctx.fillStyle = "rgba(200,230,255,0.18)"; ctx.fillRect(-f.r * 1.2, -f.r * 1.2, f.r * 2.4, f.r * 2.4);
    ctx.restore();
    ctx.strokeStyle = "rgba(255,255,255,0.9)"; ctx.lineWidth = 1.6; ctx.stroke();
    ctx.restore();
  });
  f.glints.forEach(function (p) {
    p.x += p.vx * step; p.y += p.vy * step; p.life -= step;
    if (p.life <= 0) return;
    ctx.fillStyle = "rgba(235,250,255," + Math.min(1, p.life * 2).toFixed(3) + ")";
    ctx.fillRect(p.x - 1.5, p.y - 1.5, 3, 3);
  });
}

// ---------------------------------------------------------------- K.O. flight
// Knocked flying away from the winner in slow motion, spinning, with a
// trail of ghost copies and stars, until a giant "K.O.!" slams onto the
// screen and it bursts against the cage.
function drawKoFlight(f) {
  var t = f.t, fly = Math.min(1, t / 1.5), e = 1 - Math.pow(1 - fly, 2);
  // How far it can go before the cage stops it
  if (f.dist == null) {
    var maxD = 1e9;
    if (f.dirX > 0.01) maxD = Math.min(maxD, (W - f.r - f.x) / f.dirX); else if (f.dirX < -0.01) maxD = Math.min(maxD, (f.r - f.x) / f.dirX);
    if (f.dirY > 0.01) maxD = Math.min(maxD, (H - f.r - f.y) / f.dirY); else if (f.dirY < -0.01) maxD = Math.min(maxD, (f.r - f.y) / f.dirY);
    f.dist = Math.max(40, Math.min(320, maxD));
  }
  var x = f.x + f.dirX * f.dist * e, y = f.y + f.dirY * f.dist * e;
  if (fly < 1) {
    for (var g = 5; g >= 1; g--) {
      var ge = 1 - Math.pow(1 - Math.max(0, fly - g * 0.05), 2);
      drawSnap(f, f.x + f.dirX * f.dist * ge, f.y + f.dirY * f.dist * ge, 1, (t - g * 0.05) * 9, 0.12 * (6 - g) / 5);
    }
    drawSnap(f, x, y, 1, t * 9);
    for (var s = 0; s < 4; s++) {
      var a = t * 6 + s * Math.PI / 2;
      drawStar(x + Math.cos(a) * f.r * 0.9, y - f.r * 1.05 + Math.sin(a) * f.r * 0.25, f.r * 0.17, "#ffe14a");
    }
  } else {
    if (!f.boomed) {
      f.boomed = true;
      shake = Math.max(shake, 12);
      playDeathBoom(f.style);
      f.shards = makeTileShards({ x: x, y: y, r: f.r, snap: f.snap, color: f.color }, 4, 80, 200);
    }
    stepShards(f, 1 / 60, 0);
  }
  // The camera rides along with it (deathScreenZoom, after draw() is done)
  var ix = f.x + f.dirX * f.dist, iy = f.y + f.dirY * f.dist;
  var cx = fly < 1 ? x : ix, cy = fly < 1 ? y : iy, z;
  if (t < 0.3) z = 1 + 1.0 * easeInOut(t / 0.3);
  else if (t < 1.5) z = 2.0;
  else if (t < 1.62) z = 2.0 + 0.35 * Math.sin((t - 1.5) / 0.12 * Math.PI / 2); // punch in on the impact
  else if (t < 1.95) z = 2.35;
  else z = 1 + 1.35 * (1 - easeInOut(Math.min(1, (t - 1.95) / 0.45)));
  f.cam = { z: z, x: cx, y: cy };
}
function easeInOut(k) { return k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2; }

// Pushes the camera in on the dying fighter: the whole finished frame is
// blown up round them at the end of draw(), like the sword duel's camera.
var deathZoomBuf = null;
function deathScreenZoom(ox, oy, sc) {
  var f = deathFx;
  if (!f || !f.cam || f.t > DEATH_LEN[f.style] + 0.5) return;
  var z = f.cam.z;
  if (z > 1.002) {
    var cw = canvas.width, ch = canvas.height;
    if (!deathZoomBuf) deathZoomBuf = document.createElement("canvas");
    if (deathZoomBuf.width !== cw || deathZoomBuf.height !== ch) { deathZoomBuf.width = cw; deathZoomBuf.height = ch; }
    var bx = deathZoomBuf.getContext("2d");
    bx.setTransform(1, 0, 0, 1, 0, 0); bx.clearRect(0, 0, cw, ch); bx.drawImage(canvas, 0, 0);
    var vw = cw / z, vh = ch / z;
    var fx = Math.min(cw - vw / 2, Math.max(vw / 2, ox + sc * f.cam.x)), fy = Math.min(ch - vh / 2, Math.max(vh / 2, oy + sc * f.cam.y));
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.drawImage(deathZoomBuf, fx - vw / 2, fy - vh / 2, vw, vh, 0, 0, cw, ch);
    ctx.restore();
  }
  if (f.style === "koflight") {
    ctx.save();
    ctx.setTransform(sc, 0, 0, sc, ox, oy);
    drawKoText(f.t);
    ctx.restore();
  }
}

// "K.O.!" slams in as it hits the cage, on top of the zoomed-in shot.
function drawKoText(t) {
  var kt = t - 1.35;
  if (kt > 0) {
    var sc = kt < 0.18 ? 3 - 2 * (kt / 0.18) : 1 + Math.sin(Math.min(1, (kt - 0.18) / 0.3) * Math.PI) * 0.08;
    var al = Math.min(1, kt / 0.1) * Math.min(1, (DEATH_LEN.koflight + 0.4 - t) / 0.4);
    ctx.save();
    ctx.globalAlpha = Math.max(0, al);
    ctx.translate(W / 2, H / 2); ctx.scale(sc, sc); ctx.rotate(-0.08);
    ctx.font = "900 120px Impact, 'Arial Black', sans-serif";
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.lineJoin = "round"; ctx.lineWidth = 16; ctx.strokeStyle = "#16211f"; ctx.strokeText("K.O.!", 0, 0);
    ctx.fillStyle = "#e53935"; ctx.fillText("K.O.!", 0, 0);
    ctx.lineWidth = 3; ctx.strokeStyle = "#ffe14a"; ctx.strokeText("K.O.!", 0, 0);
    ctx.restore();
  }
}

// ---------------------------------------------------------------- pixel
// Breaks into chunky retro pixels that float up and away, top first.
function drawPixel(f, dt) {
  if (!f.pix) {
    f.pix = [];
    var n = 12, rad = f.snap.rad, cell = rad * 2 / n, data = null;
    if (f.snap.canvas) {
      var c = document.createElement("canvas"); c.width = n; c.height = n;
      var g = c.getContext("2d"); g.drawImage(f.snap.canvas, 0, 0, n, n);
      try { data = g.getImageData(0, 0, n, n).data; } catch (e) { data = null; }
    }
    for (var j = 0; j < n; j++) for (var i = 0; i < n; i++) {
      var k = (j * n + i) * 4, col = f.color, a = 1;
      if (data) { a = data[k + 3] / 255; col = "rgb(" + data[k] + "," + data[k + 1] + "," + data[k + 2] + ")"; }
      else { var cx = -rad + (i + 0.5) * cell, cy = -rad + (j + 0.5) * cell; if (cx * cx + cy * cy > f.r * f.r) a = 0; }
      if (a < 0.4) continue;
      f.pix.push({ x: f.x - rad + i * cell, y: f.y - rad + j * cell, s: cell, col: col, delay: j / n * 0.7 + Math.random() * 0.15, vx: (Math.random() - 0.5) * 60, vy: -40 - Math.random() * 90 });
    }
  }
  var t = f.t;
  f.pix.forEach(function (p) {
    var u = t - p.delay, al = 1, x = p.x, y = p.y;
    if (u > 0) { x += p.vx * u; y += p.vy * u - 30 * u * u; al = Math.max(0, 1 - u / 1.1); }
    if (al <= 0) return;
    ctx.globalAlpha = al;
    ctx.fillStyle = p.col;
    var s = p.s * (u > 0 ? 1 - Math.min(0.5, u * 0.4) : 1);
    ctx.fillRect(x, y, s + 0.5, s + 0.5);
  });
  ctx.globalAlpha = 1;
}

// ---------------------------------------------------------------- sounds
// All chiptune, synthesized: square and triangle waves and crunchy
// low-rate noise, like an old console.
function chipNote(ctx2, t, freq, dur, type, gain, slideTo) {
  var o = ctx2.createOscillator(), g = ctx2.createGain();
  o.type = type || "square";
  o.frequency.setValueAtTime(freq, t);
  if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + 0.008);
  g.gain.setValueAtTime(gain, t + dur * 0.75);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g); g.connect(ctx2.destination);
  o.start(t); o.stop(t + dur + 0.02);
}
var chipNoiseBuf = null;
function chipNoise(ctx2, t, dur, gain, f0, f1) {
  if (!chipNoiseBuf) {
    // Stepped noise: each value held for several samples, for that 8-bit crunch
    var n = Math.floor(ctx2.sampleRate * 1.5); chipNoiseBuf = ctx2.createBuffer(1, n, ctx2.sampleRate);
    var d = chipNoiseBuf.getChannelData(0), v = 0;
    for (var i = 0; i < n; i++) { if (i % 6 === 0) v = Math.random() * 2 - 1; d[i] = v; }
  }
  var s = ctx2.createBufferSource(); s.buffer = chipNoiseBuf;
  var lp = ctx2.createBiquadFilter(); lp.type = "lowpass";
  lp.frequency.setValueAtTime(f0, t); lp.frequency.exponentialRampToValueAtTime(f1, t + dur);
  var g = ctx2.createGain();
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(gain, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  s.connect(lp); lp.connect(g); g.connect(ctx2.destination);
  s.start(t); s.stop(t + dur + 0.05);
}
function withChip(fn) {
  try {
    var c = getAudioCtx();
    if (!c) return;
    if (c.state === "suspended") c.resume();
    fn(c, c.currentTime);
  } catch (e) { /* never let audio break the game */ }
}
function playDeathIntro(style) {
  withChip(function (c, t) {
    if (style === "explode") {
      // a rising alarm warble as it swells
      for (var i = 0; i < 8; i++) chipNote(c, t + i * 0.11, 300 + i * 70, 0.1, "square", 0.08);
    } else if (style === "arcade") {
      // the classic "you died" tune: a quick blip, a pause, then down it goes
      chipNote(c, t, 988, 0.08, "square", 0.12); chipNote(c, t + 0.08, 1318, 0.12, "square", 0.12);
      [784, 659, 523, 494, 440, 392, 330, 262].forEach(function (f2, i) { chipNote(c, t + 0.6 + i * 0.16, f2, 0.15, "square", 0.11); });
      chipNote(c, t + 0.6 + 8 * 0.16, 196, 0.5, "triangle", 0.2, 98);
    } else if (style === "koflight") {
      chipNote(c, t, 1200, 0.9, "square", 0.07, 180); // falling whistle as it flies
      chipNoise(c, t, 0.5, 0.12, 6000, 900);
    } else if (style === "pixel") {
      [1046, 988, 880, 784, 698, 659, 587, 523, 494, 440, 392, 349].forEach(function (f2, i) { chipNote(c, t + i * 0.09, f2, 0.08, "square", 0.08); });
      chipNote(c, t + 12 * 0.09, 262, 0.6, "triangle", 0.18, 131);
    }
  });
}
// Joe's big bassy blast (from a clip he sent) for every burst; the chiptune
// boom stands in if it hasn't loaded.
function playDeathBlast(c, t) {
  if (playClip("deathBoom", 1.0, t)) return true;
  withClip("deathBoom");
  return false;
}
function playDeathBoom(style) {
  withChip(function (c, t) {
    var big = playDeathBlast(c, t);
    if (style === "instant" && !big) { chipNoise(c, t, 1.2, 0.6, 4000, 120); chipNote(c, t, 140, 0.7, "triangle", 0.35, 40); }
    if (style === "explode") {
      if (!big) { chipNoise(c, t, 1.6, 0.6, 4000, 120); chipNote(c, t, 140, 0.9, "triangle", 0.35, 40); }
      // the game-over jingle as the dust settles
      [523, 494, 466, 440].forEach(function (f2, i) { chipNote(c, t + 0.9 + i * 0.22, f2, 0.2, "square", 0.1); });
      chipNote(c, t + 0.9 + 4 * 0.22, 415, 0.7, "square", 0.1, 207);
    } else if (style === "shatter") {
      chipNoise(c, t, 0.7, big ? 0.25 : 0.4, 9000, 2500); // the glass over the blast
      for (var i = 0; i < 9; i++) chipNote(c, t + 0.05 + Math.random() * 0.6, 2000 + Math.random() * 3000, 0.06, "triangle", 0.08);
      chipNote(c, t + 0.4, 330, 0.5, "square", 0.08, 110);
    } else if (style === "koflight") {
      if (!big) { chipNoise(c, t, 0.9, 0.55, 3000, 100); chipNote(c, t, 110, 0.6, "triangle", 0.4, 45); }
      [392, 523, 659, 784].forEach(function (f2, i) { chipNote(c, t + 0.15 + i * 0.09, f2, 0.09, "square", 0.1); });
      chipNote(c, t + 0.15 + 4 * 0.09, 1046, 0.45, "square", 0.1);
    }
  });
}
function playDeathCrack() {
  withChip(function (c, t) {
    chipNoise(c, t, 0.12, 0.3, 8000, 3000);
    chipNote(c, t, 3200, 0.05, "triangle", 0.1);
  });
}
