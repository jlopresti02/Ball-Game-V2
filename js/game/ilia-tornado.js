// Ilia Topuria's Rose Tornado (Joe, 2026-11-09). Every so often he walks
// to the middle of the ring and spins on the spot, quicker and quicker, like
// a flamenco dancer or a Tasmanian devil, until he's a red tornado throwing
// roses out all over the mat.
//   - The tornado can't be attacked: he's untouchable from the walk in to
//     the last turn.
//   - Anyone who touches it is sucked in, whipped round inside it a couple
//     of times, then spat out: flung across the ring and slammed off the
//     cage walls with the momentum.
// It runs on b.igbb (move "tornado"). The roses stay on the mat for a while
// afterwards. Config: char.tornado.
"use strict";

var TOR_WALK = 0.25, TOR_SPINUP = 0.7, TOR_WIND = 0.7, TOR_OLE = 0.55;
var torRoses = [];

function torRand(r) { return r[0] + Math.random() * (r[1] - r[0]); }
function tornadoOn(b) { return !!(b && b.igbb && b.igbb.move === "tornado"); }
function torRadius(b) { return b.r * (b.char.tornado.radius || 1.8); }

// From makeBall.
function initIliaTornado(b) {
  var cfg = b.char.tornado;
  b.torN = 0;
  b.torT = cfg ? torRand(cfg.first) : Infinity;
  b.torHeld = false;
  torRoses = [];
}

// From the abilities loop. True while it's running.
function updateIliaTornado(self, other, dt) {
  var cfg = self.char.tornado;
  if (!cfg) return false;
  if (!tornadoOn(self)) {
    if (!started || over || self.torN >= cfg.max) return false;
    self.torT -= dt;
    if (self.torT > 0) return false;
    var sw = self.rapier && self.rapier.sword;
    if ((sw && sw.out) || swordDuelActive() || ringBear || !canStartIgbb(self, other)) return false;
    clearActions(self);
    self.torN++;
    self.torT = torRand(cfg.every);
    self.igbb = { move: "tornado", phase: "walk", t: 0, ang: 0, spinV: 0, grow: 0, roseT: 0, caught: null, spat: -1, cx: W / 2, cy: H / 2 };
    self.invincible = true;
    floater(self.x, self.y - self.r - 30, "ROSE TORNADO!", "crit");
    crowdReact(1);
  }
  var m = self.igbb;
  m.t += dt;
  self.vx = 0; self.vy = 0; self.immuneCd = 1; self.invincible = true;
  if (over || !self.alive) { torLetGo(self, other); endIliaTornado(self); return false; }

  if (m.phase === "walk") {
    // Strides out to the middle of the ring.
    var dx = m.cx - self.x, dy = m.cy - self.y, d = Math.sqrt(dx * dx + dy * dy);
    var stepLen = cfg.walkSpeed * dt;
    if (d <= stepLen || m.t > 3) {
      self.x = m.cx; self.y = m.cy;
      if (m.t > TOR_WALK) { m.phase = "spin"; m.t = 0; playTornadoWind(cfg.spin + TOR_WIND); }
    } else { self.x += dx / d * stepLen; self.y += dy / d * stepLen; }
    return true;
  }

  if (m.phase === "spin" || m.phase === "wind") {
    self.x = m.cx; self.y = m.cy;
    if (m.phase === "spin") {
      var k = Math.min(1, m.t / TOR_SPINUP);
      m.spinV = cfg.spinSpeed * k * k;
      m.grow = Math.min(1, m.t / (TOR_SPINUP * 0.8));
    } else {
      var w = Math.min(1, m.t / TOR_WIND);
      m.spinV = cfg.spinSpeed * (1 - w) * (1 - w);
      m.grow = 1 - w;
    }
    m.ang += m.spinV * dt;
    // Roses flying out of it.
    m.roseT += dt;
    var every = cfg.roseEvery / Math.max(0.15, m.grow);
    while (m.grow > 0.1 && m.roseT >= every) { m.roseT -= every; torThrowRose(self, m); }
    if (m.phase === "spin") {
      torSuck(self, other, m, cfg, dt);
      // Runs its time, but always gets a moment after spitting someone out.
      var done = m.t >= cfg.spin && (!m.caught) && (m.spat < 0 || m.t - m.spat > 0.5);
      if (done) { m.phase = "wind"; m.t = 0; }
    } else if (m.t >= TOR_WIND) {
      m.phase = "ole"; m.t = 0; m.spinV = 0; m.grow = 0;
      floater(self.x, self.y - self.r - 30, "¡OLÉ!", "crit");
      crowdReact(1);
    }
    return true;
  }

  // Arms up, chest out, then back to the fight.
  if (m.t >= TOR_OLE) { endIliaTornado(self); return false; }
  return true;
}

// Pulls them toward it a little; touching it sucks them in.
function torSuck(self, other, m, cfg, dt) {
  var R = torRadius(self) * m.grow;
  var c = m.caught;
  if (!c) {
    if (!other.alive || other.invincible || other.torHeld || swordDuelLocked(other) || (specialBusy(other) && !other.slam)) return;
    var dx = m.cx - other.x, dy = m.cy - other.y, d = Math.sqrt(dx * dx + dy * dy) || 1;
    if (m.spat < 0 && d < R * 3.2 && !other.slam) { // the suction (only before it's had someone)
      var pull = cfg.pull * (1 - d / (R * 3.2));
      other.vx += dx / d * pull * dt; other.vy += dy / d * pull * dt;
    }
    if (m.spat >= 0 || d > R + other.r * 0.6) return;
    clearActions(other);
    if (other.slam) endWallSlam(other);
    other.torHeld = true; other.dazed = "held"; other.vx = other.vy = 0; other.invincible = true; other.immuneCd = 99;
    m.caught = { a: Math.atan2(other.y - m.cy, other.x - m.cx), rad: d, t: 0, lift: 0 };
    floater(other.x, other.y - other.r - 30, "SUCKED IN!", "crit");
    playWhoosh();
    crowdReact(1);
    if (!reduceMotion) shake = Math.max(shake, 8);
    return;
  }
  // Whipped round inside it, lifted up off the mat.
  c.t += dt;
  c.a += (m.spinV * 0.45) * dt;
  c.rad += (R * 0.7 - c.rad) * Math.min(1, dt * 6);
  c.lift = Math.sin(Math.min(1, c.t / 0.45) * Math.PI / 2) * self.r * 1.8;
  other.x = m.cx + Math.cos(c.a) * c.rad;
  other.y = m.cy + Math.sin(c.a) * c.rad * 0.6 - c.lift;
  other.vx = other.vy = 0;
  if (Math.random() < dt * 8) playWhoosh();
  if (c.t >= cfg.orbit || m.t >= cfg.spin + 1.5) torSpit(self, other, m, cfg);
}

// Flung out along the way it was going round, into the cage.
function torSpit(self, other, m, cfg) {
  var c = m.caught;
  m.caught = null; m.spat = m.t;
  other.torHeld = false; other.dazed = false; other.invincible = false; other.immuneCd = 0;
  var tx = -Math.sin(c.a), ty = Math.cos(c.a), tl = Math.sqrt(tx * tx + ty * ty) || 1;
  tx /= tl; ty /= tl;
  var dealt = hurt(other, cfg.damage, "igbb", self.id);
  if (dealt > 0) {
    floater(other.x, other.y - other.r - 30, "SPAT OUT!", "crit");
    other.flash = 0.16;
  }
  playSlam();
  if (!reduceMotion) { shake = Math.max(shake, 16); hitStop = Math.max(hitStop, 0.08); }
  for (var i = 0; i < 14 && !reduceMotion; i++) {
    var a = Math.atan2(ty, tx) + (Math.random() - 0.5) * 1.6, s = 150 + Math.random() * 300;
    particles.push({ x: other.x, y: other.y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 0.5, max: 0.5, size: 2 + Math.random() * 3, color: ["#b5121b", "#e0303a", "#3d9a35"][i % 3] });
  }
  if (other.alive) beginWallSlam(other, tx, ty, { knockback: cfg.spitSpeed, wallSlams: cfg.wallSlams, slamDamage: cfg.slamDamage });
  checkEnd();
}

// The fight ended with them still inside it: just let them go.
function torLetGo(self, other) {
  var m = self.igbb;
  if (!m || !m.caught) return;
  m.caught = null;
  other.torHeld = false; other.dazed = false; other.invincible = false; other.immuneCd = 0;
}

function endIliaTornado(self) {
  self.igbb = null;
  self.invincible = false;
  self.immuneCd = 0;
}

function torThrowRose(self, m) {
  var R = torRadius(self) * m.grow;
  var a = m.ang + Math.random() * Math.PI * 2, h = Math.random() * self.r * 2.5;
  var out = 220 + Math.random() * 380, side = 160 + Math.random() * 200;
  torRoses.push({ x: m.cx + Math.cos(a) * R * 0.8, y: m.cy + Math.sin(a) * R * 0.5, z: h,
    vx: Math.cos(a) * out - Math.sin(a) * side, vy: (Math.sin(a) * out + Math.cos(a) * side) * 0.8, vz: 120 + Math.random() * 260,
    rot: Math.random() * 6.28, vr: (Math.random() - 0.5) * 16, landed: false, age: 0 });
  if (torRoses.length > 140) torRoses.shift();
}

// Every frame from update(): the roses flying and lying on the mat.
function tickIliaTornado(dt) {
  torRoses.forEach(function (r) {
    r.age += dt;
    if (r.landed) return;
    r.x += r.vx * dt; r.y += r.vy * dt; r.z += r.vz * dt; r.vz -= 900 * dt; r.rot += r.vr * dt;
    // They bounce off the cage and stay in the ring.
    if (r.x < 8) { r.x = 8; r.vx = Math.abs(r.vx) * 0.4; }
    if (r.x > W - 8) { r.x = W - 8; r.vx = -Math.abs(r.vx) * 0.4; }
    if (r.y < 8) { r.y = 8; r.vy = Math.abs(r.vy) * 0.4; }
    if (r.y > H - 8) { r.y = H - 8; r.vy = -Math.abs(r.vy) * 0.4; }
    if (r.z <= 0) { r.z = 0; r.landed = true; r.age = 0; }
  });
  torRoses = torRoses.filter(function (r) { return !r.landed || r.age < 12; });
}

// ---------------------------------------------------------------- drawing

// Whipped round inside it: tumbling (theirs).
function tornadoSpin(b) {
  if (reduceMotion || !b.torHeld) return 0;
  var o = balls[1 - b.id], c = o && o.igbb && o.igbb.caught;
  return c ? c.a * 1.6 : 0;
}
// His spin (Joe: on his own axis, like a pirouette): how far round he's
// turned. 0 faces us, PI faces away.
function tornadoTurnAng(b) {
  var m = b.igbb;
  if (!tornadoOn(b) || (m.phase !== "spin" && m.phase !== "wind")) return 0;
  return m.ang * 0.5;
}
// How wide his body looks as he turns (cos of the turn): squeezed thin side
// on, then opening back out.
function tornadoTurn(b) {
  if (reduceMotion) return 1;
  var a = tornadoTurnAng(b);
  if (!a) return 1;
  var c = Math.cos(a);
  return (c < 0 ? -1 : 1) * Math.max(0.12, Math.abs(c));
}
function tornadoHandsBusy(b) {
  return tornadoOn(b) && b.igbb.phase !== "walk";
}

// His arms: flung out wide and turning round with him, then up over his head
// for the olé.
function drawTornadoArms(b) {
  if (!tornadoHandsBusy(b) || !b.alive) return;
  var m = b.igbb, ch = b.char, r = b.r, arm = (ch.punch.size || 15) * 0.6, gr = r * 0.3;
  function limb(s, e, h) {
    strokeLimb(arm, armColor(ch), function () { ctx.moveTo(s.x, s.y); ctx.quadraticCurveTo(e.x, e.y, h.x, h.y); });
    drawGloveAt(h.x, h.y, gr, ch, Math.atan2(h.y - e.y, h.x - e.x));
  }
  if (m.phase === "ole" || m.phase === "walk") {
    [-1, 1].forEach(function (k) { limb({ x: b.x + k * r * 0.62, y: b.y - r * 0.35 }, { x: b.x + k * r * 1.05, y: b.y - r * 1.05 }, { x: b.x + k * r * 0.3, y: b.y - r * 1.5 }); });
    return;
  }
  // Each arm swings round a circle at shoulder height as he turns; the one
  // going round behind him is hidden by his body.
  var a = tornadoTurnAng(b), c = Math.cos(a), sn = Math.sin(a);
  [-1, 1].forEach(function (k) {
    var depth = -k * sn; // > 0: round in front of him
    function pt(d, h) { return { x: b.x + k * c * r * d, y: b.y - r * h + depth * r * 0.22 * d / 1.55 }; }
    var hand = pt(1.55, 0.15);
    if (depth < 0 && Math.abs(hand.x - b.x) < r * 1.0) return;
    limb(pt(0.6, 0.12), pt(1.1, 0.3), hand);
  });
}

// Under the fighters: roses on the mat, and the swirl of dust at his feet.
function drawTornadoUnder() {
  torRoses.forEach(function (r) {
    if (!r.landed) return;
    ctx.save();
    ctx.globalAlpha = Math.min(1, (12 - r.age) / 1.5);
    drawRose(r.x, r.y, r.rot, 1);
    ctx.restore();
  });
  balls.forEach(function (b) {
    var m = b.igbb;
    if (!tornadoOn(b) || m.grow <= 0) return;
    var R = torRadius(b) * m.grow;
    ctx.save();
    ctx.fillStyle = "rgba(90,20,25," + (0.22 * m.grow).toFixed(3) + ")";
    ctx.beginPath(); ctx.ellipse(m.cx, m.cy + b.r * 0.8, R * 1.05, R * 0.38, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "rgba(200,170,140," + (0.5 * m.grow).toFixed(3) + ")"; ctx.lineWidth = 2.5;
    for (var i = 0; i < 3; i++) {
      var a0 = m.ang * 0.6 + i * 2.1;
      ctx.beginPath(); ctx.ellipse(m.cx, m.cy + b.r * 0.8, R * (0.8 + i * 0.15), R * (0.28 + i * 0.05), 0, a0, a0 + 1.4); ctx.stroke();
    }
    ctx.restore();
  });
}

// Over the fighters: the funnel itself, petals whipping round in it, and the
// roses in the air.
function drawTornadoOver() {
  balls.forEach(function (b) {
    var m = b.igbb;
    if (!tornadoOn(b) || m.grow <= 0.02) return;
    var R = torRadius(b) * m.grow, base = m.cy + b.r * 0.8, top = base - b.r * 5.6 * m.grow;
    var rings = 15;
    ctx.save();
    // A see-through red veil, wider at the top.
    var g = ctx.createLinearGradient(0, top, 0, base);
    g.addColorStop(0, "rgba(255,170,180,0.22)"); g.addColorStop(1, "rgba(190,25,40,0.34)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(m.cx - R * 0.45, base); ctx.quadraticCurveTo(m.cx - R * 0.6, (base + top) / 2, m.cx - R * 1.6, top); ctx.lineTo(m.cx + R * 1.6, top); ctx.quadraticCurveTo(m.cx + R * 0.6, (base + top) / 2, m.cx + R * 0.45, base);
    ctx.closePath(); ctx.fill();
    // Wind bands going round, faster at the bottom.
    ctx.lineCap = "round";
    for (var i = 0; i < rings; i++) {
      var u = i / (rings - 1), y = base - (base - top) * u, rx = R * (0.45 + 1.15 * u * u), ry = rx * 0.26;
      var sway = Math.sin(m.ang * 0.15 + u * 3) * R * 0.12 * u;
      for (var j = 0; j < 2; j++) {
        var a0 = m.ang * (1.1 - u * 0.4) + j * Math.PI + u * 1.7;
        ctx.strokeStyle = j ? "rgba(255,215,220,0.8)" : "rgba(180,20,35,0.75)";
        ctx.lineWidth = 3.5 + 3 * (1 - u);
        ctx.beginPath(); ctx.ellipse(m.cx + sway, y, rx, ry, 0, a0, a0 + 2.6); ctx.stroke();
      }
    }
    // Petals caught in it.
    for (var p = 0; p < 40; p++) {
      var pu = ((p * 0.618) % 1), py = base - (base - top) * pu, prx = R * (0.45 + 1.15 * pu * pu);
      var pa = m.ang * (1.3 - pu * 0.5) + p * 2.39;
      var px = m.cx + Math.cos(pa) * prx, pyy = py + Math.sin(pa) * prx * 0.26;
      ctx.fillStyle = p % 3 ? "#c41a28" : "#e8404c";
      ctx.beginPath(); ctx.ellipse(px, pyy, 3.2, 1.8, pa, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  });
  torRoses.forEach(function (r) {
    if (r.landed) return;
    drawRose(r.x, r.y - r.z, r.rot, 1 + r.z / 260);
  });
}
