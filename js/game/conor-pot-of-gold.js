// The pot of gold at the end of Conor McGregor's rainbow (Christian,
// 2026-11-13), on top of Joe's Pot o' Gold beam (rainbow-beam.js).
// When his aim locks, a second pot of gold (Joe's picture, rainbow-art.js)
// comes up out of the mat at the cage, right where the rainbow is going to
// end, glinting. If the rainbow blasts them into it (driven back into the
// cage within `radius` of it), it hops up, flips over and comes down on their
// head with a clang: "JACKPOT!" (`label`), a burst of coins, and `damage`
// more on top of the beam's, which can't be slipped or blocked. It sits on
// them for `hold` seconds, then tips off and is gone. If they got out of the
// way, it sinks back into the mat once the rainbow's done.
// In a beam clash with Charles it only comes up once the rainbow has won.
// Set under potOfGold.endPot in his character file (`on` false, or leave the
// block out, and it's off).
"use strict";

var PG_RISE = 0.35;   // coming up out of the mat
var PG_FLIP = 0.32;   // the hop and flip onto their head
var PG_OFF = 0.45;    // tipping off them
var PG_SINK = 0.4;    // sinking back into the mat (the rainbow missed)
var PG_WAIT = 0.3;    // it waits this long into the blast, so the camera's back out to see it land
var pgPots = [];
var pgImg = null;

function resetPotOfGoldEnd() { pgPots = []; }
function pgCfg(b) {
  var p = b && b.char && b.char.potOfGold;
  return p && p.endPot && p.endPot.on !== false ? p.endPot : null;
}
function pgEase(k) { k = Math.max(0, Math.min(1, k)); return k * k * (3 - 2 * k); }
function pgSize(b, cfg) { var pw = b.r * (cfg.size || 1.6); return { pw: pw, ph: pw * POT_OF_GOLD_ASPECT }; }

// Where the rainbow ends: at the cage straight down his aim, the pot kept
// inside the ring.
function pgSeat(b, m, s) {
  var len = kmRayToWall(b.x, b.y, m.dx || 1, m.dy || 0), pad = 4;
  var x = b.x + (m.dx || 1) * len, y = b.y + (m.dy || 0) * len;
  return { x: Math.min(W - s.pw / 2 - pad, Math.max(s.pw / 2 + pad, x)), y: Math.min(H - s.ph / 2 - pad, Math.max(s.ph / 2 + pad, y)) };
}

// Is the rainbow aimed (and locked) yet, so the pot can come up?
function pgAimed(m) {
  if (m.pair) return m.phase === "fire" && m.hit; // a beam clash: only once the rainbow has won it
  return m.phase === "fire" || m.phase === "end" || (m.phase === "charge" && m.t >= m.charge - RB_LOCK);
}

// From tickRainbow (rainbow-beam.js), every tick.
function tickPotOfGoldEnd(dt) {
  if (!balls) return;
  balls.forEach(function (b) {
    var cfg = pgCfg(b);
    if (!cfg || !b.alive || !rainbowOn(b)) return;
    var m = b.igbb;
    if (m.pgPot || !pgAimed(m)) return;
    var s = pgSize(b, cfg), seat = pgSeat(b, m, s);
    m.pgPot = { owner: b.id, m: m, phase: "rise", t: 0, x: seat.x, y: seat.y, rot: 0, a: 1, cfg: cfg };
    pgPots.push(m.pgPot);
    for (var i = 0; i < 8; i++) {
      var ca = -Math.PI / 2 + (Math.random() - 0.5) * 2, cv = 140 + Math.random() * 200;
      rbCoins.push({ x: seat.x, y: seat.y, vx: Math.cos(ca) * cv, vy: Math.sin(ca) * cv, rot: Math.random() * 6, spin: 8 + Math.random() * 10, life: 0.6, max: 0.6, size: 4 + Math.random() * 2, g: 800 });
    }
    playPotOfGoldRise();
  });
  pgPots = pgPots.filter(function (p) { return pgTick(p, dt); });
}

// One pot: true while it's still around.
function pgTick(p, dt) {
  var owner = balls[p.owner], cfg = p.cfg, live = owner && owner.alive && owner.igbb === p.m;
  p.t += dt;
  if (p.phase === "rise" || p.phase === "sit") {
    if (!live) { p.phase = "sink"; p.t = 0; return true; }
    var s = pgSize(owner, cfg), seat = pgSeat(owner, p.m, s);
    p.x = seat.x; p.y = seat.y;
    if (p.phase === "rise" && p.t >= PG_RISE) { p.phase = "sit"; p.t = 0; }
    // Blasted into it: driven back by the rainbow to within `radius` of it.
    var v = balls[1 - p.owner];
    var settled = p.m.phase !== "fire" || p.m.t >= PG_WAIT;
    if (settled && v && v.alive && v.beamPin && v.beamPin.owner === owner.id && Math.hypot(v.x - p.x, v.y - p.y) < cfg.radius) {
      p.phase = "flip"; p.t = 0; p.victim = v.id; p.x0 = p.x; p.y0 = p.y;
    }
    return true;
  }
  if (p.phase === "flip") {
    var vf = balls[p.victim], k = Math.min(1, p.t / PG_FLIP), e = pgEase(k), sf = pgSize(owner, cfg);
    var tx = vf.x, ty = pgOnY(vf, sf), by = p.y0 + (ty - p.y0) * e;
    var hop = Math.max(0, Math.min(70 + vf.r, by - sf.ph * 0.55)); // (it stays inside the ring)
    p.x = p.x0 + (tx - p.x0) * e;
    p.y = by - Math.sin(k * Math.PI) * hop;
    p.rot = Math.PI * e;
    if (k >= 1) { p.phase = "on"; p.t = 0; pgLand(p, owner, vf, cfg); }
    return true;
  }
  if (p.phase === "on") {
    var vo = balls[p.victim];
    p.x = vo.x; p.y = pgOnY(vo, pgSize(owner, cfg)); p.rot = Math.PI + (reduceMotion ? 0 : Math.sin(p.t * 40) * 0.08 * Math.max(0, 1 - p.t / 0.4)); // still ringing
    if (p.t >= (cfg.hold || 1)) { p.phase = "off"; p.t = 0; p.side = vo.x < W / 2 ? 1 : -1; }
    return true;
  }
  if (p.phase === "off") {
    var ko = Math.min(1, p.t / PG_OFF);
    p.x += p.side * 160 * dt; p.y += (-120 + 700 * ko) * dt;
    p.rot += p.side * 7 * dt; p.a = 1 - ko;
    return p.t < PG_OFF;
  }
  // sink
  p.a = 1;
  return p.t < PG_SINK;
}

// Sitting upside down on their head (kept inside the ring).
function pgOnY(v, s) { return Math.max(s.ph * 0.5 + 2, v.y - v.r * 0.5); }

// It comes down on their head.
function pgLand(p, owner, v, cfg) {
  var dealt = v.alive ? hurt(v, cfg.damage, "igbb", owner.id) : 0;
  playPotOfGoldClang();
  if (!reduceMotion) { shake = Math.max(shake, 20); hitStop = Math.max(hitStop, 0.07); }
  impacts.push({ x: v.x, y: v.y - v.r * 0.6, nx: 0, ny: -1, life: 0.55, max: 0.55, color: "#ffd84a" });
  for (var i = 0; i < 18; i++) { // spraying out from under the rim, either side
    var sd = i % 2 ? 1 : -1, a = (sd > 0 ? 0 : Math.PI) + sd * (-0.9 + Math.random() * 1.1), sp = 240 + Math.random() * 320;
    rbCoins.push({ x: v.x + sd * v.r * 0.6, y: v.y - v.r * 0.1, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, rot: Math.random() * 6, spin: 10 + Math.random() * 12, life: 0.7, max: 0.7, size: 5 + Math.random() * 2.5, g: 1100 });
  }
  if (dealt > 0) {
    floater(v.x, Math.max(26, v.y - v.r - 64), cfg.label || "JACKPOT!", "crit");
    v.flash = Math.max(v.flash || 0, 0.2);
    v.squash = { t: 0.24, max: 0.24, nx: 0, ny: 1 };
    crowdReact(1);
  }
  checkEnd();
}

// From drawRainbowBeam (rainbow-beam.js): over the fighters and the beam.
function drawPotOfGoldEnd() {
  if (!pgPots.length) return;
  if (!pgImg && typeof POT_OF_GOLD_SRC !== "undefined") { pgImg = new Image(); pgImg.src = POT_OF_GOLD_SRC; }
  var t = performance.now() / 1000;
  pgPots.forEach(function (p) {
    var owner = balls[p.owner];
    if (!owner) return;
    var s = pgSize(owner, p.cfg), rise = 1;
    if (p.phase === "rise") rise = pgEase(p.t / PG_RISE);
    else if (p.phase === "sink") rise = 1 - pgEase(p.t / PG_SINK);
    if (rise <= 0.01 || p.a <= 0.01) return;
    var px = p.x, py = p.y;
    if (p.phase === "on") { var vo = balls[p.victim]; px = vo.x; py = pgOnY(vo, s); } // right on them as they slide (it ticks before the beam moves them)
    ctx.save();
    ctx.globalAlpha = p.a;
    // A soft shadow on the mat while it sits there.
    if (p.phase === "rise" || p.phase === "sit" || p.phase === "sink") {
      ctx.fillStyle = "rgba(0,0,0,0.25)";
      ctx.beginPath(); ctx.ellipse(px, py + s.ph * 0.46, s.pw * 0.42 * rise, s.ph * 0.1, 0, 0, Math.PI * 2); ctx.fill();
    }
    ctx.translate(px, py + s.ph * 0.5);
    ctx.scale(1, Math.max(0.01, rise));
    ctx.translate(0, -s.ph * 0.5);
    ctx.rotate(p.rot);
    // Glowing gold where the rainbow pours into it.
    var glow = p.phase === "sit" || p.phase === "rise" ? 0.55 + 0.25 * Math.sin(t * 6) : p.phase === "flip" ? 0.8 : 0;
    if (glow > 0) {
      var g = ctx.createRadialGradient(0, -s.ph * 0.36, 0, 0, -s.ph * 0.36, s.pw * 0.9);
      g.addColorStop(0, "rgba(255,240,150," + (0.8 * glow) + ")"); g.addColorStop(1, "rgba(255,200,40,0)");
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, -s.ph * 0.36, s.pw * 0.9, 0, Math.PI * 2); ctx.fill();
    }
    if (pgImg && pgImg.complete && pgImg.naturalWidth) ctx.drawImage(pgImg, -s.pw / 2, -s.ph / 2, s.pw, s.ph);
    else {
      // (until the picture loads) a black cauldron and its heap of gold
      ctx.fillStyle = "#1d1712"; ctx.beginPath(); ctx.ellipse(0, s.ph * 0.04, s.pw * 0.45, s.ph * 0.46, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#f2c230"; ctx.beginPath(); ctx.ellipse(0, -s.ph * 0.36, s.pw * 0.4, s.ph * 0.12, 0, 0, Math.PI * 2); ctx.fill();
    }
    // A little glint running over the coins.
    if (p.phase === "sit" || p.phase === "rise") {
      for (var i = 0; i < 2; i++) {
        var ph = (t * 1.3 + i * 0.5) % 1, gx = (-0.28 + 0.5 * ((i * 0.37 + Math.floor(t * 1.3 + i * 0.5) * 0.61) % 1)) * s.pw;
        rbStar(gx, -s.ph * 0.4, 3 + 6 * Math.sin(ph * Math.PI), "rgba(255,255,235," + Math.sin(ph * Math.PI) + ")");
      }
    }
    ctx.restore();
  });
}

// ---------------------------------------------------------------- sounds
// Coming up out of the mat: a soft whoomp and a few coins.
function playPotOfGoldRise() {
  try {
    var ac = getAudioCtx();
    if (!ac) return;
    if (ac.state === "suspended") ac.resume();
    var now = ac.currentTime;
    var o = ac.createOscillator(); o.type = "sine"; o.frequency.setValueAtTime(90, now); o.frequency.exponentialRampToValueAtTime(180, now + 0.2);
    var og = ac.createGain(); og.gain.setValueAtTime(0.35, now); og.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);
    o.connect(og); og.connect(ac.destination); o.start(now); o.stop(now + 0.35);
    for (var i = 0; i < 5; i++) rbTing(ac, now + 0.04 + i * 0.05, 2400 + Math.abs(rbNoise()) * 2200, 0.05);
  } catch (e) { /* never let audio break the game */ }
}
// Landing on their head: a big iron clang (a bell's out-of-tune partials,
// ringing on), a thud, and coins going everywhere.
function playPotOfGoldClang() {
  try {
    var ac = getAudioCtx();
    if (!ac) return;
    if (ac.state === "suspended") ac.resume();
    var now = ac.currentTime;
    [[1, 0.3, 1.4], [2.41, 0.2, 1.0], [3.93, 0.14, 0.7], [5.4, 0.1, 0.5], [7.3, 0.06, 0.35]].forEach(function (h) {
      var o = ac.createOscillator(); o.type = "triangle"; o.frequency.value = 196 * h[0];
      var g = ac.createGain(); g.gain.setValueAtTime(0.0001, now); g.gain.exponentialRampToValueAtTime(h[1], now + 0.004); g.gain.exponentialRampToValueAtTime(0.0001, now + h[2]);
      o.connect(g); g.connect(ac.destination); o.start(now); o.stop(now + h[2] + 0.05);
    });
    var src = ac.createBufferSource(); src.buffer = rbNoiseBuf(ac, 0.2);
    var lp = ac.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 900;
    var ng = ac.createGain(); ng.gain.setValueAtTime(0.5, now); ng.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
    src.connect(lp); lp.connect(ng); ng.connect(ac.destination); src.start(now); src.stop(now + 0.2);
    for (var i = 0; i < 14; i++) rbTing(ac, now + 0.06 + i * 0.04 + Math.abs(rbNoise()) * 0.03, 2000 + Math.abs(rbNoise()) * 3000, 0.06);
  } catch (e) { /* never let audio break the game */ }
}

// ---------------------------------------------------------------- gallery
// A line for his fighter card's move list (from conorGalleryMoves, conor.js).
function potOfGoldEndGalleryMove(ch, add) {
  var pg = ch.potOfGold, ep = pgCfg({ char: ch });
  if (!pg || !ep) return;
  add("🌈", "Pot of gold", "Once a fight he tips his pot of gold over and a rainbow blasts across the ring (" + pg.damage + ", pinned to the cage). A second pot comes up where the rainbow ends: blast them into it and it flips over onto their head for " + ep.damage + " more.");
}
