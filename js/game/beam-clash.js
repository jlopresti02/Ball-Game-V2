// The beam clash (Joe, 2026-11-13): Charles's Kamehameha (kamehameha.js) vs
// Conor's Pot o' Gold rainbow (rainbow-beam.js), like Dragon Ball. Whoever
// starts theirs first gets the other one going too (if they still have
// theirs this fight): both back off to opposite ends of the ring, charge up
// together aimed straight at each other, and fire on the same beat. The two
// beams meet in the middle in a ball of light and shove back and forth,
// one nearly winning, then the other, until one beam drives the other all
// the way back and blasts its owner into the cage (the beam's damage plus
// CLASH_BONUS), or now and then the whole thing blows up in the middle and
// throws them both into the cage (CLASH_BOOM_DMG each).
"use strict";

var CLASH_T = 4.2;         // how long they push it back and forth, once the beams meet
var CLASH_FINISH = 0.9;    // the winning push at the end
var CLASH_BOOM = 0.2;      // chance it blows up instead of anyone winning
var CLASH_BONUS = 10;      // extra damage for winning it
var CLASH_BOOM_DMG = 15;   // each, when it blows up
var CLASH_SPEED = 2400;    // the beams shooting out to meet
var CLASH_ROOM = 0.8;      // they back off to opposite ends of the ring, this much of it apart

var beamClash = null;

function resetBeamClash() { beamClash = null; }

// The two beam moves the clash knows about.
var BEAMS = {
  kamehameha: {
    has: function (b) { return !!b.char.kamehameha; },
    on: function (b) { return kameOn(b); },
    ready: function (b) { return kameReady(b); },
    start: function (b, o, charge) { startKamehameha(b, o, true, charge); },
    fire: function (b) { kameFire(b); },
    end: function (b) { endKamehameha(b); },
    prep: function () { return KM_POWER; },
    origin: function (b) { return b.r * 1.45; },
    cfg: function (b) { return b.char.kamehameha; },
    name: "KAMEHAMEHA", label: "KAMEHAMEHA!", color: "#7cc8ff", glow: "rgba(90,180,255,", spark: ["#bfe6ff", "#7cc8ff", "#ffffff"]
  },
  rainbow: {
    has: function (b) { return !!b.char.potOfGold; },
    on: function (b) { return rainbowOn(b); },
    ready: function (b) { return rainbowReady(b); },
    start: function (b, o, charge) { startRainbow(b, o, true, charge); },
    fire: function (b) { rainbowFire(b); },
    end: function (b) { endRainbow(b); },
    prep: function () { return RB_SUMMON; },
    origin: function (b) { return rbOrigin(b); },
    cfg: function (b) { return b.char.potOfGold; },
    name: "POT O' GOLD", label: "POT O' GOLD!", color: "#ffd84a", glow: "rgba(255,210,70,", spark: RB_COLORS
  }
};
function bcKind(b) {
  if (!b || !b.igbb) return null;
  return BEAMS[b.igbb.move] ? b.igbb.move : null;
}

// From each beam's start: if the other one has a beam of their own left
// this fight, they answer with it, timed to go off together.
function bcPair(self, other) {
  var mine = bcKind(self);
  if (!mine || !other.alive || over) return;
  var theirs = null;
  for (var k in BEAMS) if (k !== mine && BEAMS[k].has(other)) theirs = k;
  if (!theirs || !BEAMS[theirs].ready(other)) return;
  // (Conor drops whatever he was saying; conor.js lets go of a taunt or a counter mid igbb.)
  var fireIn = BEAMS[mine].prep() + self.igbb.charge;
  var charge = Math.max(1, fireIn - BEAMS[theirs].prep());
  BEAMS[theirs].start(other, self, charge);
  if (!rainbowOn(other) && !kameOn(other)) return;
  self.igbb.pair = true; other.igbb.pair = true;
  self.vx = self.vy = other.vx = other.vy = 0;
  floater(other.x, other.y - other.r - 30, "ANSWERS!", "crit");
  crowdReact(0.8);
}

// While they power up: both back off to opposite ends of the ring so the
// beams have room to meet in the middle.
function bcSlide(self, other, dt) {
  // Each heads for its own end of a line through the middle of the ring,
  // along the way they're already facing each other.
  var dx = self.x - other.x, dy = self.y - other.y, d = Math.sqrt(dx * dx + dy * dy) || 1;
  var ux = dx / d, uy = dy / d, half = Math.min(W, H) * CLASH_ROOM / 2;
  var tx = Math.min(W - self.r, Math.max(self.r, W / 2 + ux * half)), ty = Math.min(H - self.r, Math.max(self.r, H / 2 + uy * half));
  var mx = tx - self.x, my = ty - self.y, md = Math.sqrt(mx * mx + my * my);
  if (md < 2) return;
  var sp = Math.min(md, 560 * dt);
  self.x += mx / md * sp; self.y += my / md * sp;
  if (!reduceMotion && Math.random() < 0.5) particles.push({ x: self.x - mx / md * self.r * 0.6, y: self.y + self.r * 0.8, vx: (Math.random() - 0.5) * 60, vy: -40 - Math.random() * 40, life: 0.4, max: 0.4, size: 3, color: "#c9bfa6" });
}

// From each beam's fire: the other one goes off right with it, and the
// clash starts.
function bcFire(self, other) {
  var mine = bcKind(self);
  if (!mine || !self.igbb.pair || beamClash) return;
  var theirs = bcKind(other);
  if (!theirs || !other.igbb.pair || !other.alive) { self.igbb.pair = false; return; }
  if (other.igbb.phase !== "fire") BEAMS[theirs].fire(other);
  if (other.igbb.phase !== "fire" || self.igbb.phase !== "fire") return;
  var r = Math.random(), out = r < CLASH_BOOM ? "boom" : r < CLASH_BOOM + (1 - CLASH_BOOM) / 2 ? "a" : "b";
  beamClash = { a: self.id, b: other.id, t: 0, met: -1, p: 0.5, out: out, ph: Math.random() * 6, sparks: 0, done: false, flash: 0 };
}

function bcHolds(b) { return !!(beamClash && !beamClash.done && (b.id === beamClash.a || b.id === beamClash.b)); }

// Paired beams (charging together, or clashing) share one caption.
function bcCaptionTaken() {
  if (beamClash) return true;
  return balls ? balls.some(function (b) { return b.igbb && b.igbb.pair && bcKind(b); }) : false;
}

function bcEase(k) { k = Math.max(0, Math.min(1, k)); return k * k * (3 - 2 * k); }

// Where the beams meet: 0 is A's hands (or pot), 1 is B's.
function bcP(c, s) {
  var target = c.out === "a" ? 1 : c.out === "b" ? 0 : 0.5;
  var near = c.out === "a" ? -1 : c.out === "b" ? 1 : (c.ph > 3 ? 1 : -1); // which way the loser nearly wins it first
  var wob = 0.09 * Math.sin(s * 2.3 + c.ph) + 0.05 * Math.sin(s * 5.1 + c.ph * 2);
  // A big swing one way, then the other, then the end.
  var fake = 0.2 * Math.exp(-Math.pow((s - (CLASH_T - 2.2)) / 0.5, 2)) * near - 0.13 * Math.exp(-Math.pow((s - 1.0) / 0.45, 2)) * near;
  var p = 0.5 + wob + fake;
  var fk = bcEase((s - (CLASH_T - CLASH_FINISH)) / CLASH_FINISH);
  return p + (target - p) * fk;
}

// ---------------------------------------------------------------- the pin
// Joe (2026-11-13): a beam doesn't land as one big hit. Whoever's caught in
// it is driven back into the cage and pinned there for as long as it's
// blasting, taking small chip hits that add up to what the old single hit
// and its cage slams did (BEAM_PIN_TICK apart).
var BEAM_PIN_TICK = 0.1;
var BEAM_PIN_SPEED = 1500; // how fast it drives them back to the cage

// owner fires along (dx, dy); total: all the damage, over dur seconds.
// first: damage already dealt by the hit that started it (counted in total).
function beginBeamPin(target, owner, dx, dy, total, dur, color, first) {
  if (!target.alive) return;
  clearActions(target);
  target.slam = null;
  target.vx = 0; target.vy = 0;
  dur = Math.max(0.6, dur);
  var n = Math.max(3, Math.round(dur / BEAM_PIN_TICK));
  target.beamPin = { owner: owner.id, dx: dx, dy: dy, t: 0, dur: dur, next: BEAM_PIN_TICK, left: Math.max(0, total - (first || 0)), ticks: n - 1, color: color, wall: false };
}
function beamPinned(b) { return !!(b && b.beamPin); }

// From update(): pinned fighters slide back into the cage and take their chips.
function tickBeamPins(dt) {
  if (!balls) return;
  balls.forEach(function (b) {
    var p = b.beamPin;
    if (!p) return;
    if (!b.alive || over) { b.beamPin = null; return; }
    p.t += dt;
    b.vx = 0; b.vy = 0;
    // Driven back until the cage stops them, then held flat against it.
    var nx = Math.min(W - b.r, Math.max(b.r, b.x + p.dx * BEAM_PIN_SPEED * dt));
    var ny = Math.min(H - b.r, Math.max(b.r, b.y + p.dy * BEAM_PIN_SPEED * dt));
    var moved = Math.abs(nx - b.x) + Math.abs(ny - b.y);
    b.x = nx; b.y = ny;
    if (!p.wall && moved < BEAM_PIN_SPEED * dt * 0.3) {
      p.wall = true;
      if (!reduceMotion) shake = Math.max(shake, 16);
      impacts.push({ x: b.x + p.dx * b.r, y: b.y + p.dy * b.r, nx: -p.dx, ny: -p.dy, life: 0.5, max: 0.5, color: "#ffffff" });
      playBounce();
    }
    if (p.wall && !reduceMotion) {
      shake = Math.max(shake, 5);
      if (Math.random() < 0.5) particles.push({ x: b.x + p.dx * b.r, y: b.y + p.dy * b.r, vx: (Math.random() - 0.5) * 300 - p.dx * 120, vy: (Math.random() - 0.5) * 300 - p.dy * 120, life: 0.35, max: 0.35, size: 2 + Math.random() * 3, color: p.color });
    }
    p.next -= dt;
    while (p.next <= 0 && p.ticks > 0 && b.alive) {
      p.next += BEAM_PIN_TICK;
      var chip = p.left / p.ticks;
      p.ticks--; p.left -= chip;
      var got = hurt(b, chip, "laser", p.owner); // (chip hits: never blocked or slipped, no floater of their own)
      if (got > 0) { playBeamTick(); floater(b.x + (Math.random() - 0.5) * b.r, b.y - b.r - 8, "-" + Math.max(1, Math.round(got)), "tick"); b.flash = Math.max(b.flash, 0.1); }
      checkEnd();
    }
    if (p.t >= p.dur || (p.ticks <= 0 && p.t >= p.dur - 0.05)) {
      b.beamPin = null;
      if (b.alive) { b.vx = -p.dx * 260; b.vy = -p.dy * 260; } // sliding back off the cage as it lets go
    }
  });
}

// From draw.js: shaking against the cage while pinned.
function beamPinOffset(b) {
  var p = b.beamPin;
  if (!p || !b.alive || reduceMotion) return { x: 0, y: 0 };
  var t = performance.now() / 1000, a = b.r * (p.wall ? 0.06 : 0.03);
  return { x: Math.sin(t * 71) * a, y: Math.cos(t * 63) * a };
}

// From update(): the clash itself.
function tickBeamClash(dt) {
  var c = beamClash;
  if (!c) return;
  var A = balls[c.a], B = balls[c.b];
  if (over || !A.alive || !B.alive || !bcKind(A) || !bcKind(B) || A.igbb.phase !== "fire" || B.igbb.phase !== "fire") { beamClash = null; return; }
  c.t += dt; c.flash = Math.max(0, c.flash - dt * 2);
  var ka = BEAMS[bcKind(A)], kb = BEAMS[bcKind(B)], ma = A.igbb, mb = B.igbb;
  // Straight at each other.
  var dx = B.x - A.x, dy = B.y - A.y, d = Math.sqrt(dx * dx + dy * dy) || 1;
  ma.dx = dx / d; ma.dy = dy / d; mb.dx = -dx / d; mb.dy = -dy / d;
  var oa = ka.origin(A), ob = kb.origin(B), gap = Math.max(0, d - oa - ob);
  ma.len = kmRayToWall(A.x, A.y, ma.dx, ma.dy); mb.len = kmRayToWall(B.x, B.y, mb.dx, mb.dy);
  var p;
  if (c.met < 0) {
    var each = c.t * CLASH_SPEED;
    if (each * 2 >= gap) { c.met = c.t; c.flash = 1; bcMeet(A, B, c); }
    p = Math.min(0.5, gap ? each / gap : 0.5);
    ma.ext = oa + gap * p; mb.ext = ob + Math.min(each, gap * 0.5);
    return;
  }
  var s = c.t - c.met;
  p = bcP(c, s);
  c.p = p;
  ma.ext = oa + gap * p; mb.ext = ob + gap * (1 - p);
  c.x = A.x + ma.dx * ma.ext; c.y = A.y + ma.dy * ma.ext;
  if (!reduceMotion) shake = Math.max(shake, 6 + 4 * Math.abs(Math.sin(s * 3)));
  // Sparks spraying off where they meet, in both beams' colours.
  for (var i = 0; i < 3 && !reduceMotion; i++) {
    var a = Math.random() * Math.PI * 2, v = 200 + Math.random() * 420, col = i % 2 ? ka.spark[Math.floor(Math.random() * ka.spark.length)] : kb.spark[Math.floor(Math.random() * kb.spark.length)];
    particles.push({ x: c.x, y: c.y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 0.5, max: 0.5, size: 2 + Math.random() * 3.5, color: col });
  }
  if (Math.random() < 0.08) rbCoins.push({ x: c.x, y: c.y, vx: (Math.random() - 0.5) * 600, vy: -200 - Math.random() * 300, rot: 0, spin: 12, life: 0.8, max: 0.8, size: 5, g: 900 });
  if (s >= CLASH_T) bcFinish(A, B, c);
}

function bcMeet(A, B, c) {
  if (!reduceMotion) { shake = Math.max(shake, 20); hitStop = Math.max(hitStop, 0.1); }
  duelFlash = Math.max(duelFlash, 0.7);
  crowdReact(1);
  playBeamClash(CLASH_T);
}

function bcFinish(A, B, c) {
  c.done = true;
  beamClash = null;
  var ka = BEAMS[bcKind(A)], kb = BEAMS[bcKind(B)];
  if (c.out === "boom") {
    ka.end(A); kb.end(B);
    floater(c.x, c.y - 40, "KABOOM!", "crit");
    if (!reduceMotion) { shake = Math.max(shake, 30); hitStop = Math.max(hitStop, 0.12); }
    duelFlash = Math.max(duelFlash, 1);
    for (var i = 0; i < 40; i++) {
      var a = Math.random() * Math.PI * 2, v = 200 + Math.random() * 600, sp = i % 2 ? ka.spark : kb.spark;
      particles.push({ x: c.x, y: c.y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 0.8, max: 0.8, size: 3 + Math.random() * 5, color: sp[i % sp.length] });
    }
    for (var j = 0; j < 8; j++) impacts.push({ x: c.x, y: c.y, nx: Math.cos(j * Math.PI / 4), ny: Math.sin(j * Math.PI / 4), life: 0.7, max: 0.7, color: j % 2 ? ka.color : kb.color });
    playClashBoom();
    crowdReact(1);
    [A, B].forEach(function (f) {
      var fx = f.x - c.x, fy = f.y - c.y, fd = Math.sqrt(fx * fx + fy * fy) || 1;
      var dealt = hurt(f, CLASH_BOOM_DMG, "igbb", f === A ? B.id : A.id);
      if (dealt > 0 && f.alive) beginWallSlam(f, fx / fd, fy / fd, { knockback: 1300, wallSlams: 1, slamDamage: 5 });
    });
    checkEnd();
    return;
  }
  var X = c.out === "a" ? A : B, Y = c.out === "a" ? B : A, kx = c.out === "a" ? ka : kb, ky = c.out === "a" ? kb : ka;
  var m = X.igbb, cfg = kx.cfg(X);
  ky.end(Y); // their beam's beaten: it's gone, and they're wide open
  m.hit = true; m.ext0 = m.ext; m.t = 0; // the winning beam carries on through them to the cage
  var total = cfg.damage + CLASH_BONUS + cfg.wallSlams * cfg.slamDamage;
  var first = total / Math.max(3, Math.round(cfg.beamTime / BEAM_PIN_TICK));
  var dealt = hurt(Y, first, "igbb", X.id);
  if (dealt <= 0) return;
  floater(Y.x, Y.y - Y.r - 30, kx.label, "crit");
  if (!reduceMotion) { shake = Math.max(shake, 24); hitStop = Math.max(hitStop, 0.1); }
  duelFlash = Math.max(duelFlash, 0.8);
  impacts.push({ x: Y.x, y: Y.y, nx: m.dx, ny: m.dy, life: 0.6, max: 0.6, color: kx.color });
  impacts.push({ x: Y.x, y: Y.y, nx: -m.dx, ny: -m.dy, life: 0.6, max: 0.6, color: "#ffffff" });
  for (var pi = 0; pi < 24 && !reduceMotion; pi++) {
    var pa = Math.random() * Math.PI * 2, pv = 150 + Math.random() * 350;
    particles.push({ x: Y.x, y: Y.y, vx: Math.cos(pa) * pv + m.dx * 200, vy: Math.sin(pa) * pv + m.dy * 200, life: 0.6, max: 0.6, size: 3 + Math.random() * 4, color: kx.spark[pi % kx.spark.length] });
  }
  crowdReact(1);
  if (Y.alive) beginBeamPin(Y, X, m.dx, m.dy, total, cfg.beamTime, kx.color, first);
  checkEnd();
}

// The camera: pulled back to take in both while they charge, then in on
// where the beams meet.
function beamClashCam() {
  if (!balls) return null;
  var c = beamClash;
  if (c && c.met >= 0 && c.x != null) {
    var s = c.t - c.met;
    return { z: 1.12 + 0.06 * bcEase(s / 0.4) + 0.02 * Math.sin(s * 9), x: (c.x + W / 2) / 2, y: (c.y + H / 2) / 2 };
  }
  if (c) return { z: 1.05, x: W / 2, y: H / 2 };
  var pr = balls.filter(function (b) { return b.alive && b.igbb && b.igbb.pair && bcKind(b); });
  if (pr.length === 2) return { z: 1.04, x: W / 2, y: H / 2 };
  return null;
}

// The ball of light where they meet, crackling, and the caption.
function drawBeamClash() {
  var c = beamClash;
  var pr = balls ? balls.filter(function (b) { return b.alive && b.igbb && b.igbb.pair && bcKind(b); }) : [];
  if (c && c.met >= 0 && c.x != null) {
    var A = balls[c.a], B = balls[c.b], ka = BEAMS[bcKind(A)], kb = BEAMS[bcKind(B)];
    var t = c.t, s = t - c.met, R = 40 + 8 * Math.sin(t * 23) + 5 * Math.sin(t * 37);
    if (c.out === "boom") R *= 1 + 0.6 * bcEase((s - (CLASH_T - CLASH_FINISH)) / CLASH_FINISH);
    ctx.save();
    var ang = Math.atan2(A.igbb.dy, A.igbb.dx);
    // Each half glows in its own beam's colour.
    [[ka, -1], [kb, 1]].forEach(function (h) {
      var gx = c.x - Math.cos(ang) * h[1] * R * 0.35, gy = c.y - Math.sin(ang) * h[1] * R * 0.35;
      var g = ctx.createRadialGradient(gx, gy, 0, gx, gy, R * 1.6);
      g.addColorStop(0, h[0].glow + "0.9)"); g.addColorStop(1, h[0].glow + "0)");
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(gx, gy, R * 1.6, 0, Math.PI * 2); ctx.fill();
    });
    var core = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, R);
    core.addColorStop(0, "rgba(255,255,255,1)"); core.addColorStop(0.55, "rgba(255,255,240,0.9)"); core.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = core; ctx.beginPath(); ctx.arc(c.x, c.y, R, 0, Math.PI * 2); ctx.fill();
    // Lightning arcing off it.
    ctx.lineWidth = 2.5; ctx.lineJoin = "round";
    for (var i = 0; i < 6; i++) {
      var a = t * 7 + i * 1.05 + Math.sin(t * 13 + i) * 0.6, L = R * (1.5 + 0.7 * Math.abs(Math.sin(t * 17 + i * 3)));
      ctx.strokeStyle = i % 2 ? "rgba(190,235,255,0.95)" : "rgba(255,240,150,0.95)";
      ctx.beginPath(); ctx.moveTo(c.x + Math.cos(a) * R * 0.4, c.y + Math.sin(a) * R * 0.4);
      for (var q = 1; q <= 4; q++) {
        var jr = R * 0.4 + (L - R * 0.4) * q / 4, ja = a + Math.sin(t * 31 + i * 7 + q * 2.3) * 0.35;
        ctx.lineTo(c.x + Math.cos(ja) * jr, c.y + Math.sin(ja) * jr);
      }
      ctx.stroke();
    }
    // Shock rings rolling out.
    for (var k = 0; k < 2; k++) {
      var ph = (s * 1.6 + k * 0.5) % 1;
      ctx.strokeStyle = "rgba(255,255,255," + (0.5 * (1 - ph)) + ")"; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.ellipse(c.x, c.y, R * (1 + 2.2 * ph) * 0.45, R * (1 + 2.2 * ph), ang, 0, Math.PI * 2); ctx.stroke();
    }
    if (c.flash > 0) { ctx.fillStyle = "rgba(255,255,255," + (0.6 * c.flash) + ")"; ctx.beginPath(); ctx.arc(c.x, c.y, R * 3 * (1.5 - c.flash), 0, Math.PI * 2); ctx.fill(); }
    ctx.restore();
    bcCaption("BEAM CLASH!", ka.name + "  vs  " + kb.name, s);
  } else if (c) {
    bcCaption("BEAM CLASH!", null, 0);
  } else if (pr.length === 2) {
    var k1 = BEAMS[bcKind(pr[0])], k2 = BEAMS[bcKind(pr[1])];
    var m0 = pr[0].igbb, prog = m0.phase === "charge" ? m0.t / m0.charge : 0;
    bcCaption(k1.name + "  vs  " + k2.name, prog > 0.15 ? "WHO'S GOT MORE?" : null, -1);
  }
}

// One caption for both of them, at the top of the ring.
function bcCaption(big, small, s) {
  ctx.save();
  ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.lineJoin = "round";
  var y = H * 0.1, pop = s >= 0 ? 1 + 0.25 * Math.max(0, 1 - s / 0.25) + 0.04 * Math.sin(s * 12) : 1;
  var fs = s >= 0 ? 52 : 34;
  ctx.font = "900 " + Math.round(fs * pop) + 'px "Barlow Condensed", "Arial Narrow", sans-serif';
  ctx.lineWidth = 7; ctx.strokeStyle = "rgba(20,10,40,0.9)"; ctx.strokeText(big, W / 2, y);
  var tw = ctx.measureText(big).width, gr = ctx.createLinearGradient(W / 2 - tw / 2, 0, W / 2 + tw / 2, 0);
  gr.addColorStop(0, "#8fd3ff"); gr.addColorStop(0.5, "#ffffff"); gr.addColorStop(1, "#ffd84a");
  ctx.fillStyle = gr; ctx.shadowColor = "rgba(255,255,255,0.8)"; ctx.shadowBlur = 14;
  ctx.fillText(big, W / 2, y);
  ctx.shadowBlur = 0;
  if (small) {
    ctx.font = "800 24px \"Barlow Condensed\", \"Arial Narrow\", sans-serif";
    ctx.lineWidth = 5; ctx.strokeText(small, W / 2, y + fs * 0.75);
    ctx.fillStyle = "#ffffff"; ctx.fillText(small, W / 2, y + fs * 0.75);
  }
  ctx.restore();
}
