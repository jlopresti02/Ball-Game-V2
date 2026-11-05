// Jon Jones's Duck Drop (Joe, 2026-11-05). A few times a fight, at random:
//   flicker  he stops, his chest tattoo flashing gold and red faster and faster
//   poof     a puff of smoke and feathers, and he's a duck (Joe's picture)
//   fly      the duck flaps off up and out of the top of the screen
//   warn     a red circle comes up in the middle of the ring, filling in as
//            the countdown to impact
//   drop     he crashes back down as himself, tattoo blazing red like a
//            superhero, into the middle of the circle
//   pose     a superhero landing: fist on the mat, the mat cracked round him
// Only whoever's inside the circle when he lands gets hit: duck.damage and a
// big knockback into the walls. It's an area attack, so it can't be slipped
// or blocked, only got out of the way of. Runs on b.igbb (move "duckdrop")
// so he's locked out of everything else while it's on, and he can't be
// touched while he's a duck or up in the sky.
"use strict";

var DD_FLICKER = 1.1, DD_DUCK = 0.8, DD_FLY = 1.0, DD_DROP = 0.6, DD_POSE = 1.35;
var DD_KNEEL = 0.75, DD_RISE = 0.3; // in the pose: down on one knee, then up into a flex
var duckPuffs = [];   // smoke and feathers from the poof
var duckCrater = null; // the cracked mat after he lands
var duckDebris = [];   // chunks of mat thrown up by the landing

function resetDuckDrop() { duckPuffs = []; duckCrater = null; duckDebris = []; }
function duckDropOn(b) { return !!(b && b.igbb && b.igbb.move === "duckdrop"); }
// Gone from the ring: a duck, or up off the top of the screen.
function duckHidden(b) { return duckDropOn(b) && (b.igbb.phase === "duck" || b.igbb.phase === "fly" || b.igbb.phase === "warn"); }
// Not drawn with the other fighters: hidden, or falling in from the top of
// the screen over the stands and jumbotron (drawDuckSky).
function duckDrawnApart(b) { return duckHidden(b) || (duckDropOn(b) && b.igbb.phase === "drop"); }
// Solid but immovable (the fighters bounce off, physics.js): the duck, and
// Jon in his landing pose.
function duckSolid(b) { return duckDropOn(b) && (b.igbb.phase === "duck" || b.igbb.phase === "pose"); }
// While it's on, a hit only does damage: no knockback, stuns, slams or
// anything else (cleared every frame and at the end).
function duckClearEffects(b) {
  b.vx = 0; b.vy = 0;
  b.slam = null; b.dazed = null; b.dizzy = null; b.shelled = null; b.shocked = null; b.angry = null;
  b.checkStun = 0; b.knockFly = 0;
}
function duckHandsBusy(b) { return duckDropOn(b) && b.igbb.phase === "pose"; }
// Burning red like a superhero, from the drop to the end of the pose.
function duckHeroic(b) { return duckDropOn(b) && (b.igbb.phase === "drop" || b.igbb.phase === "pose"); }

function ddRand(r) { return r[0] + Math.random() * (r[1] - r[0]); }
// Just above the top of the screen, in arena units.
function ddSkyY() { return stadiumOn() ? -(ST.AY + 140) * W / ST.A : -160; }
// Where the drop starts: just above the very top of the screen.
function ddTopY(r) { return (stadiumOn() ? -ST.AY * W / ST.A : 0) - r * 2.5; }
// Down on one knee after landing, then standing back up (draw.js adds it
// to his spot, via jonFloatOffset).
function duckPoseOffset(b) {
  var m = b.igbb;
  if (!duckDropOn(b) || m.phase !== "pose") return { x: 0, y: 0 };
  var down = m.t < DD_KNEEL ? 1 : 1 - ease((m.t - DD_KNEEL) / DD_RISE);
  var hop = m.t > DD_KNEEL + DD_RISE * 0.6 && m.t < DD_KNEEL + DD_RISE + 0.15 ? -Math.sin((m.t - DD_KNEEL - DD_RISE * 0.6) / (DD_RISE * 0.4 + 0.15) * Math.PI) * 0.12 : 0;
  return { x: 0, y: b.r * (0.24 * down + hop) };
}

// From initJon.
function initDuckDrop(b) {
  var cfg = b.char.jon && b.char.jon.duck;
  b.duckN = 0;
  b.duckT = cfg ? ddRand(cfg.first) : Infinity;
}

// From the abilities loop, before the special. True while it's running.
function updateDuckDrop(self, other, dt) {
  var cfg = self.char.jon && self.char.jon.duck;
  if (!cfg) return false;
  if (!self.igbb) {
    if (!started || over || self.duckN >= cfg.max) return false;
    self.duckT -= dt;
    if (self.duckT > 0 || !canStartIgbb(self, other) || swordDuelActive()) return false;
    clearActions(self);
    self.duckN++;
    self.duckT = ddRand(cfg.every);
    self.igbb = { move: "duckdrop", phase: "flicker", t: 0, flick: 0, red: false, cx: W / 2, cy: H / 2, R: cfg.radius,
      from: { x: self.x, y: self.y }, face: other.x >= self.x ? 1 : -1 };
    playJonModeSwap("goat"); playJonModeSwap("evil");
  }
  var m = self.igbb;
  if (m.move !== "duckdrop") return false;
  m.t += dt;
  self.vx = 0; self.vy = 0;
  if (over && m.phase !== "pose") { endDuckDrop(self); return false; }

  if (m.phase === "flicker") {
    // Faster and faster as it builds up.
    m.flick -= dt;
    if (m.flick <= 0) {
      m.red = !m.red;
      m.flick = 0.14 - 0.11 * Math.min(1, m.t / DD_FLICKER);
      self.char.look = m.red ? self.char.jon.evilLook : self.char.jon.goatLook;
      if (!reduceMotion) for (var i = 0; i < 3; i++) {
        var a = Math.random() * Math.PI * 2, s = 60 + Math.random() * 120;
        particles.push({ x: self.x - self.r * 0.38, y: self.y - self.r * 0.04, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 0.3, max: 0.3, size: 2 + Math.random() * 2, color: m.red ? "#e0221b" : "#f5c542" });
      }
    }
    self.jonGlow = 0.6 * Math.min(1, m.t / DD_FLICKER);
    if (m.t >= DD_FLICKER) {
      m.phase = "duck"; m.t = 0;
      self.invincible = true;
      m.from = { x: self.x, y: self.y };
      duckPoof(self.x, self.y, self.r);
      floater(m.from.x, m.from.y - self.r - 40, "QUACK!", "note");
      playDuckPoof(); playDuckQuack();
    }
    return true;
  }
  if (m.phase === "duck") { self.x = m.from.x; self.y = m.from.y; } // the duck stands where he was (solid, can't be hurt)
  if (m.phase === "fly") { self.x = m.cx; self.y = ddSkyY(); }
  duckClearEffects(self);
  if (duckHidden(self)) self.immuneCd = 1; // nothing reaches him, and no IMMUNE popping up off screen
  if (m.phase === "duck") {
    if (m.t >= DD_DUCK) { m.phase = "fly"; m.t = 0; playDuckFlap(); }
    return true;
  }
  if (m.phase === "fly") {
    if (m.t >= DD_FLY) {
      m.phase = "warn"; m.t = 0;
      self.x = m.cx; self.y = ddSkyY(); // up out of sight, out of reach
      floater(m.cx, m.cy - m.R - 16, "INCOMING!", "crit");
      playDuckWarn(cfg.warn);
    }
    return true;
  }
  if (m.phase === "warn") {
    self.x = m.cx; self.y = ddSkyY();
    if (m.t >= cfg.warn) {
      m.phase = "drop"; m.t = 0;
      self.char.look = self.char.jon.evilLook; self.jonGlow = 0.6;
      playDuckFall();
    }
    return true;
  }
  if (m.phase === "drop") {
    var k = Math.min(1, m.t / DD_DROP);
    var top = ddTopY(self.r);
    // Falling, faster and faster. Drawn from m.fallY: his real spot waits
    // where he'll land (the walls would stop it above the ring).
    m.fallY = top + (m.cy - top) * k * k;
    self.x = m.cx; self.y = m.cy;
    if (k >= 1) { m.phase = "pose"; m.t = 0; duckLand(self, other, cfg, m); }
    return true;
  }
  // The superhero landing, holding it a moment before getting back up.
  self.x = m.cx; self.y = m.cy;
  self.jonGlow = Math.max(self.jonGlow, 0.6 * (1 - m.t / DD_POSE));
  if (m.t >= DD_POSE) { endDuckDrop(self); return false; }
  return true;
}

function duckLand(self, other, cfg, m) {
  self.invincible = false;
  self.squash = { t: 0.3, max: 0.3, nx: 0, ny: 1 };
  duckCrater = { x: m.cx, y: m.cy, R: m.R, t: 0, seed: Math.random() * 10 };
  if (!reduceMotion) { shake = Math.max(shake, 30); hitStop = Math.max(hitStop, 0.14); }
  impacts.push({ x: m.cx, y: m.cy + self.r * 0.6, nx: 0, ny: -1, life: 0.5, max: 0.5, color: "#e0221b" });
  for (var i = 0; i < 34 && !reduceMotion; i++) { // dust and red embers thrown out round the edge
    var a = i / 34 * Math.PI * 2, s = 260 + Math.random() * 200;
    particles.push({ x: m.cx + Math.cos(a) * self.r, y: m.cy + Math.sin(a) * self.r * 0.6, vx: Math.cos(a) * s, vy: Math.sin(a) * s * 0.6, life: 0.6, max: 0.6, size: 3 + Math.random() * 4, color: i % 3 ? "#d8cdb5" : "#e0221b" });
  }
  if (!reduceMotion) {
    for (var j = 0; j < 16; j++) { // chunks of mat flung up and raining back down
      var ja = Math.random() * Math.PI * 2, js = 120 + Math.random() * 240;
      duckDebris.push({ x: m.cx + Math.cos(ja) * self.r * 0.6, y: m.cy + Math.sin(ja) * self.r * 0.4, z: 0, vx: Math.cos(ja) * js, vy: Math.sin(ja) * js * 0.6, vz: 380 + Math.random() * 420,
        rot: Math.random() * 6, spin: (Math.random() - 0.5) * 16, size: 5 + Math.random() * 7, col: j % 4 ? "#d8cdb5" : "#8b5a3c", t: 0 });
    }
    for (var q = 0; q < 12; q++) { // a dust cloud rolling out
      var qa = q / 12 * Math.PI * 2;
      duckPuffs.push({ x: m.cx + Math.cos(qa) * self.r * 0.8, y: m.cy + self.r * 0.5 + Math.sin(qa) * self.r * 0.35, vx: Math.cos(qa) * 170, vy: Math.sin(qa) * 60, r: self.r * 0.45, t: 0, max: 0.9, kind: "smoke", col: "#cdbf9f" });
    }
  }
  playDuckLand();
  crowdReact(1);
  var dx = other.x - m.cx, dy = other.y - m.cy, d = Math.sqrt(dx * dx + dy * dy);
  if (other.alive && d <= m.R) {
    if (d < 1) { var ra = Math.random() * Math.PI * 2; dx = Math.cos(ra); dy = Math.sin(ra); d = 1; }
    var dealt = hurt(other, cfg.damage, "igbb", self.id); // an area hit: can't be slipped or blocked
    if (dealt > 0) {
      floater(other.x, other.y - other.r - 30, "DUCK DROP!", "crit");
      other.flash = 0.16;
      if (other.alive) beginWallSlam(other, dx / d, dy / d, { knockback: cfg.knockback, wallSlams: cfg.wallSlams, slamDamage: cfg.slamDamage });
      checkEnd();
    }
  } else if (other.alive) {
    floater(other.x, other.y - other.r - 30, "MISSED!", "dodge");
  }
}

function endDuckDrop(self) {
  self.igbb = null;
  duckClearEffects(self);
  self.invincible = false;
  self.char.look = self.jonMode === "evil" ? self.char.jon.evilLook : self.char.jon.goatLook;
  setSpeed(self, self.baseSpeed || SPEED);
}

function duckPoof(x, y, r) {
  for (var i = 0; i < 14; i++) {
    var a = Math.random() * Math.PI * 2, s = 30 + Math.random() * 90;
    duckPuffs.push({ x: x + Math.cos(a) * r * 0.4, y: y + Math.sin(a) * r * 0.4, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 20, r: r * (0.3 + Math.random() * 0.25), t: 0, max: 0.35 + Math.random() * 0.2, kind: "smoke" });
  }
  for (var j = 0; j < 10; j++) {
    var fa = Math.random() * Math.PI * 2, fs = 80 + Math.random() * 140;
    duckPuffs.push({ x: x, y: y, vx: Math.cos(fa) * fs, vy: Math.sin(fa) * fs - 60, r: r * 0.16, t: 0, max: 1.4, kind: "feather", rot: Math.random() * 6, spin: (Math.random() - 0.5) * 8, col: ["#f3efe6", "#8b6a4a", "#2f6b4e"][j % 3] });
  }
}

// Every frame from update().
function tickDuckDrop(dt) {
  duckPuffs = duckPuffs.filter(function (p) {
    p.t += dt; p.x += p.vx * dt; p.y += p.vy * dt;
    if (p.kind === "smoke") { p.vx *= 1 - dt * 3; p.vy *= 1 - dt * 3; }
    else { p.vx *= 1 - dt * 2; p.vy += (40 - p.vy) * dt * 2; p.rot += p.spin * dt; } // feathers drifting down
    return p.t < p.max;
  });
  if (duckCrater) { duckCrater.t += dt; if (duckCrater.t > 2.6) duckCrater = null; }
  duckDebris = duckDebris.filter(function (c) {
    c.t += dt; c.x += c.vx * dt; c.y += c.vy * dt; c.rot += c.spin * dt;
    c.z += c.vz * dt; c.vz -= 1500 * dt;
    if (c.z < 0) { c.z = 0; c.vz = Math.abs(c.vz) * 0.3; c.vx *= 0.5; c.vy *= 0.5; c.spin *= 0.5; }
    return c.t < 1.6;
  });
}

// ---------------------------------------------------------------- drawing

// Under the fighters: the red circle, his shadow coming down, the crater.
function drawDuckUnder() {
  if (duckCrater) {
    var c = duckCrater, fade = Math.min(1, (2.6 - c.t) / 0.8);
    ctx.save();
    ctx.globalAlpha = fade;
    ctx.strokeStyle = "rgba(60,30,20,0.75)"; ctx.lineWidth = 3; ctx.lineCap = "round";
    for (var i = 0; i < 9; i++) { // cracks out from where he hit
      var a = i / 9 * Math.PI * 2 + c.seed, L = c.R * (0.5 + 0.4 * ((i * 7 + c.seed * 3) % 5) / 5);
      ctx.beginPath(); ctx.moveTo(c.x + Math.cos(a) * 14, c.y + Math.sin(a) * 14);
      var mx = c.x + Math.cos(a + 0.18) * L * 0.55, my = c.y + Math.sin(a + 0.18) * L * 0.55;
      ctx.lineTo(mx, my); ctx.lineTo(c.x + Math.cos(a - 0.08) * L, c.y + Math.sin(a - 0.08) * L); ctx.stroke();
    }
    ctx.fillStyle = "rgba(60,30,20,0.3)";
    ctx.beginPath(); ctx.ellipse(c.x, c.y + 6, 34, 20, 0, 0, Math.PI * 2); ctx.fill();
    // The shockwave ring rolling out.
    [[0, "#ffffff", 14], [0.1, "#e0221b", 10], [0.22, "#e0221b", 6]].forEach(function (w) { // shockwave rings rolling out
      var wt = c.t - w[0];
      if (wt < 0 || wt > 0.5) return;
      var k = wt / 0.5;
      ctx.globalAlpha = (1 - k) * fade; ctx.strokeStyle = w[1]; ctx.lineWidth = w[2] * (1 - k) + 2;
      ctx.beginPath(); ctx.ellipse(c.x, c.y + 10, c.R * (0.25 + 1.4 * k), c.R * (0.25 + 1.4 * k) * 0.8, 0, 0, Math.PI * 2); ctx.stroke();
    });
    ctx.restore();
  }
  balls.forEach(function (b) {
    var m = b.igbb;
    if (!duckDropOn(b) || (m.phase !== "warn" && m.phase !== "drop")) return;
    var cfg = b.char.jon.duck;
    var k = m.phase === "warn" ? Math.min(1, m.t / cfg.warn) : 1, pulse = 0.5 + 0.5 * Math.sin(performance.now() / 90);
    var pop = m.phase === "warn" ? easeOut(Math.min(1, m.t / 0.25)) : 1;
    ctx.save();
    ctx.translate(m.cx, m.cy);
    ctx.fillStyle = "rgba(224,34,27," + (0.14 + 0.1 * pulse) + ")";
    ctx.beginPath(); ctx.arc(0, 0, m.R * pop, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "rgba(224,34,27,0.28)"; // filling in: the countdown to impact
    ctx.beginPath(); ctx.arc(0, 0, m.R * pop * k, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "#e0221b"; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.arc(0, 0, m.R * pop, 0, Math.PI * 2); ctx.stroke();
    ctx.setLineDash([12, 10]); ctx.lineDashOffset = -performance.now() / 30; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(0, 0, m.R * pop * 0.78, 0, Math.PI * 2); ctx.stroke();
    ctx.setLineDash([]); ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(-18, 0); ctx.lineTo(18, 0); ctx.moveTo(0, -18); ctx.lineTo(0, 18); ctx.stroke();
    // His shadow, growing as he comes down.
    var sk = m.phase === "drop" ? Math.min(1, m.t / DD_DROP) : 0.15 * k;
    ctx.fillStyle = "rgba(0,0,0," + (0.12 + 0.25 * sk) + ")";
    ctx.beginPath(); ctx.ellipse(0, b.r * 0.85, b.r * (0.3 + 0.7 * sk), b.r * 0.28 * (0.3 + 0.7 * sk), 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  });
}

function drawDuckImg(src, aspect, x, y, h, flip, sy, rot) {
  var im = getImg(src);
  if (!im) return;
  var w = h * aspect;
  ctx.save();
  ctx.translate(x, y); if (rot) ctx.rotate(rot); ctx.scale(flip ? -1 : 1, sy || 1);
  ctx.drawImage(im, -w / 2, -h / 2, w, h);
  ctx.restore();
}

// Over the fighters: the duck, the smoke and feathers, the streak down,
// and his superhero landing.
function drawDuckOver() {
  balls.forEach(function (b) {
    var m = b.igbb;
    if (!duckDropOn(b) || !b.alive) return;
    var r = b.r;
    if (m.phase === "duck") { // standing there, a duck (the picture faces left)
      var hop = Math.abs(Math.sin(m.t * 14)) * 4 * (1 - m.t / DD_DUCK);
      drawDuckImg(JON_DUCK_STAND_SRC, JON_DUCK_STAND_ASPECT, m.from.x, m.from.y + r - r * 1.05 - hop, r * 2.1, m.face > 0);
    } else if (m.phase === "fly") { // flapping off up out of the screen (the picture faces right)
      var k = m.t / DD_FLY, e = k * k;
      var fx = m.from.x + (m.cx - m.from.x) * e * 0.6 + m.face * 40 * k, fy = m.from.y + (ddSkyY() - m.from.y) * e;
      var flap = reduceMotion ? 1 : 0.75 + 0.25 * Math.cos(m.t * 26);
      drawDuckImg(JON_DUCK_FLY_SRC, JON_DUCK_FLY_ASPECT, fx, fy, r * 2.8, m.face < 0, flap, -0.35 * m.face);
    } else if (m.phase === "pose") {
      drawDuckPose(b, m);
    }
  });
  duckDebris.forEach(function (c) {
    var a = Math.min(1, (1.6 - c.t) / 0.4);
    ctx.save();
    ctx.globalAlpha = a * 0.3; ctx.fillStyle = "#000";
    ctx.beginPath(); ctx.ellipse(c.x, c.y, c.size * 0.7, c.size * 0.3, 0, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = a; ctx.translate(c.x, c.y - c.z); ctx.rotate(c.rot);
    ctx.fillStyle = c.col; ctx.strokeStyle = "rgba(60,40,25,0.8)"; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(-c.size, -c.size * 0.5); ctx.lineTo(c.size * 0.7, -c.size * 0.7); ctx.lineTo(c.size, c.size * 0.4); ctx.lineTo(-c.size * 0.4, c.size * 0.7); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.restore();
  });
  if (duckCrater && duckCrater.t < 0.18) { // the whole ring flashing red on impact
    ctx.save(); ctx.globalAlpha = 0.45 * (1 - duckCrater.t / 0.18); ctx.fillStyle = "#ff3b2a";
    ctx.fillRect(-W, -H, W * 3, H * 3); ctx.restore();
  }
  duckPuffs.forEach(function (p) {
    var a = 1 - p.t / p.max;
    ctx.save();
    if (p.kind === "smoke") {
      ctx.globalAlpha = 0.7 * a; ctx.fillStyle = p.col || "#ecebe6";
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r * (1 + p.t * 1.4), 0, Math.PI * 2); ctx.fill();
    } else {
      ctx.globalAlpha = Math.min(1, a * 2); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.fillStyle = p.col;
      ctx.beginPath(); ctx.ellipse(0, 0, p.r, p.r * 0.35, 0, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  });
}

// The superhero landing: down on one knee with a fist planted in the mat
// and the other arm flung back, a red aura burning round him, then he
// stands up into a double biceps flex.
function drawDuckPose(b, m) {
  var ch = b.char, arm = (ch.punch.size || 15) * 0.75, gr = b.r * 0.24, r = b.r, s = m.face;
  var off = duckPoseOffset(b), bx = b.x + off.x, by = b.y + off.y;
  var up = m.t < DD_KNEEL ? 0 : ease((m.t - DD_KNEEL) / DD_RISE);
  var pulse = 0.5 + 0.5 * Math.sin(m.t * 18);
  // The aura.
  ctx.save();
  var ag = ctx.createRadialGradient(bx, by, r * 0.8, bx, by, r * 2);
  ag.addColorStop(0, "rgba(255,60,40," + (0.35 + 0.2 * pulse) * (1 - 0.5 * up) + ")"); ag.addColorStop(1, "rgba(255,60,40,0)");
  ctx.fillStyle = ag; ctx.globalCompositeOperation = "lighter";
  ctx.beginPath(); ctx.arc(bx, by, r * 2, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  // Fist on the mat, other arm flung back; then both up into a flex.
  var limbs = [
    { sx: bx + s * r * 0.62, sy: by - r * 0.15, kx: bx + s * r * 0.5, ky: by + r * 1.05, fx: bx + s * r * 1.0, fy: by - r * 0.8 },
    { sx: bx - s * r * 0.62, sy: by - r * 0.15, kx: bx - s * r * 1.3, ky: by - r * 0.7, fx: bx - s * r * 1.0, fy: by - r * 0.8 }
  ];
  limbs.forEach(function (L, i) {
    var hx = L.kx + (L.fx - L.kx) * up, hy = L.ky + (L.fy - L.ky) * up;
    // Flexing: the elbow out level with the shoulder, the fist up by the head.
    var ex = L.sx + (i ? -s : s) * r * 0.45 * up, ey = L.sy - r * 0.05 * up;
    strokeLimb(arm, armColor(ch), function () { ctx.moveTo(L.sx, L.sy); if (up > 0.01) ctx.lineTo(ex, ey); ctx.lineTo(hx, hy); });
    drawGloveAt(hx, hy, gr, ch);
  });
  // Sparks off the planted fist.
  if (m.t < DD_KNEEL && !reduceMotion && Math.random() < 0.5) {
    particles.push({ x: limbs[0].kx, y: limbs[0].ky, vx: (Math.random() - 0.5) * 160, vy: -60 - Math.random() * 120, life: 0.3, max: 0.3, size: 2 + Math.random() * 2, color: Math.random() < 0.5 ? "#ff3b2a" : "#ffd0a0" });
  }
}

// Falling in from the very top of the screen, over the stands and the
// jumbotron, fists first with a red streak behind him. From draw(), after
// the jumbotron (sc/ox/oy place the arena on the canvas).
function drawDuckSky(sc, ox, oy) {
  balls.forEach(function (b) {
    var m = b.igbb;
    if (!duckDropOn(b) || m.phase !== "drop" || !b.alive) return;
    var r = b.r, ch = b.char, top = ddTopY(r);
    ctx.save();
    ctx.setTransform(sc, 0, 0, sc, ox, oy);
    // The streak, from the top of the screen down to him.
    var bx = b.x, fy = m.fallY != null ? m.fallY : top;
    var g = ctx.createLinearGradient(0, top, 0, fy);
    g.addColorStop(0, "rgba(224,34,27,0)"); g.addColorStop(1, "rgba(255,80,60,0.85)");
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.moveTo(bx - r * 0.9, fy); ctx.lineTo(bx - r * 0.25, top); ctx.lineTo(bx + r * 0.25, top); ctx.lineTo(bx + r * 0.9, fy); ctx.closePath(); ctx.fill();
    // The red aura.
    var ag = ctx.createRadialGradient(bx, fy, r * 0.7, bx, fy, r * 1.9);
    ag.addColorStop(0, "rgba(255,60,40,0.6)"); ag.addColorStop(1, "rgba(255,60,40,0)");
    ctx.fillStyle = ag; ctx.beginPath(); ctx.arc(bx, fy, r * 1.9, 0, Math.PI * 2); ctx.fill();
    // Him, stretched by the speed.
    ctx.save();
    ctx.translate(bx, fy); ctx.scale(0.88, 1.16); ctx.translate(-bx, -fy);
    if (ch.look) drawFighterArt(ctx, bx, fy, r, ch.look, theme.wall, { layout: "contained", name: ch.name });
    else { ctx.fillStyle = ch.color; ctx.beginPath(); ctx.arc(bx, fy, r, 0, Math.PI * 2); ctx.fill(); }
    ctx.lineWidth = 3; ctx.strokeStyle = theme.wall;
    ctx.beginPath(); ctx.arc(bx, fy, r, 0, Math.PI * 2); ctx.stroke();
    var sy0 = b.y; b.y = fy; drawJonGlow(b); b.y = sy0;
    ctx.restore();
    // Both fists down, leading the way.
    var arm = (ch.punch.size || 15) * 0.75;
    [-1, 1].forEach(function (sd) {
      var sx = bx + sd * r * 0.6, sy = fy + r * 0.1, hx = bx + sd * r * 0.32, hy = fy + r * 1.25;
      strokeLimb(arm, armColor(ch), function () { ctx.moveTo(sx, sy); ctx.lineTo(hx, hy); });
      drawGloveAt(hx, hy, r * 0.24, ch);
    });
    ctx.restore();
  });
}
