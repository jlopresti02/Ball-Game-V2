// Justin Gaethje's Eagle Strike.
//
// A few times a fight, at random, a bald eagle comes for his opponent. It
// screams (the warning) and a red path appears straight across the middle
// of the ring at a random angle. Then it swoops down through the path, in
// from off one side of the screen and out the other (Joe's swoop clip
// plays as it dives). Anyone but Gaethje caught in the path when it comes
// through is raked by its talons: damage, claw marks, feathers and a hard
// knock the way it was flying. Gaethje keeps fighting the whole time.
//
// Set up per fighter by `gaethje.eagle` in the character JSON:
//   first, every   [min, max] seconds until the first one, then between them
//   max            how many a fight
//   warn           seconds the red path shows before the swoop
//   swoop          seconds for the eagle to cross from off screen to off screen
//   width          half the path's width (how close it has to come to hit)
//   damage         talon damage
//   knockback, wallSlams, slamDamage   the knock it sends them off with
"use strict";

var ES_REACH = 640;  // how far either side of the middle the swoop starts and ends (off screen)
var ES_LOW = 0.45;   // only this low in the dive (0 = right at the bottom) can it hit

var eagleStrikes = []; // the eagles on their way: { from, dx, dy, cx, cy, phase, t, ... }
var eagleSlashes = []; // claw marks on whoever got raked

function esRand(r) { return r[0] + Math.random() * (r[1] - r[0]); }
function esCfg(b) { return b.char.gaethje && b.char.gaethje.eagle; }

function resetEagleStrikes() {
  eagleStrikes = []; eagleSlashes = [];
  balls.forEach(function (b) {
    var cfg = esCfg(b);
    b.eagleN = 0;
    b.eagleT = cfg ? esRand(cfg.first) : Infinity;
  });
}

// Every frame (update.js): the clocks, the eagles and the claw marks.
function tickEagleStrikes(dt) {
  if (over || allAmericanOn()) { eagleStrikes = []; }
  eagleSlashes = eagleSlashes.filter(function (s) { s.t += dt; return s.t < 0.4; });
  if (!started || over) return;
  balls.forEach(function (self) {
    var cfg = esCfg(self), other = balls[1 - self.id];
    if (!cfg || !self.alive || self.eagleN >= cfg.max) return;
    if (eagleStrikes.some(function (e) { return e.owner === self.id; })) return;
    self.eagleT -= dt;
    if (self.eagleT > 0) return;
    // Not over the top of a special, a sword duel or the road.
    if (!other.alive || self.igbb || other.igbb || allAmericanOn() || swordDuelActive()) { self.eagleT = 0.5; return; }
    self.eagleN++;
    self.eagleT = esRand(cfg.every);
    startEagleStrike(self, other, cfg);
  });
  eagleStrikes = eagleStrikes.filter(function (e) { return updateEagleStrike(e, dt); });
}

function startEagleStrike(self, other, cfg) {
  // Mostly side to side (the eagle's a side-on picture), never straight up
  // and down, through somewhere near the middle.
  var ang = (Math.random() - 0.5) * 1.6 + (Math.random() < 0.5 ? 0 : Math.PI);
  var dx = Math.cos(ang), dy = Math.sin(ang), off = (Math.random() - 0.5) * 80;
  var e = { owner: self.id, cfg: cfg, dx: dx, dy: dy, cx: W / 2 - dy * off, cy: H / 2 + dx * off,
    phase: "warn", t: 0, hit: false, x: 0, y: 0, k: 0 };
  e.x = e.cx - dx * ES_REACH; e.y = e.cy - dy * ES_REACH;
  eagleStrikes.push(e);
  playEagleScreech();
  floater(W / 2, 46, "EAGLE!", "crit");
}

// False once it's flown off.
function updateEagleStrike(e, dt) {
  e.t += dt;
  var cfg = e.cfg;
  if (e.phase === "warn") {
    if (e.t < cfg.warn) return true;
    e.phase = "swoop"; e.t = 0;
    playEagleSwoop();
  }
  var k = Math.min(1, e.t / cfg.swoop);
  var px = e.x, py = e.y;
  e.k = k;
  e.x = e.cx + e.dx * ES_REACH * (2 * k - 1);
  e.y = e.cy + e.dy * ES_REACH * (2 * k - 1);
  var low = Math.abs(k - 0.5) * 2 < ES_LOW;
  if (low && !e.hit) {
    var self = balls[e.owner], other = balls[1 - e.owner];
    if (other.alive && !other.invincible && !other.igbb && segDist(other.x, other.y, px, py, e.x, e.y) < cfg.width + other.r) {
      e.hit = true;
      eagleRake(e, self, other);
    }
  }
  return k < 1;
}

// Closest the point comes to the segment a-b.
function segDist(x, y, ax, ay, bx, by) {
  var vx = bx - ax, vy = by - ay, l2 = vx * vx + vy * vy;
  var s = l2 ? Math.max(0, Math.min(1, ((x - ax) * vx + (y - ay) * vy) / l2)) : 0;
  var qx = ax + vx * s - x, qy = ay + vy * s - y;
  return Math.sqrt(qx * qx + qy * qy);
}

// Talons straight through them.
function eagleRake(e, self, other) {
  var cfg = e.cfg;
  hurt(other, cfg.damage, "igbb", self.id);
  if (!other.alive) return;
  other.squash = { t: 0.24, max: 0.24, nx: e.dx, ny: e.dy };
  other.flash = 0.22;
  eagleSlashes.push({ id: other.id, t: 0, side: e.dx >= 0 ? 1 : -1 });
  if (inOrdinaryMovement(other)) beginWallSlam(other, e.dx, e.dy, cfg);
  floater(other.x, other.y - other.r - 44, "RAKED!", "crit");
  hitStop = Math.max(hitStop, 0.07);
  if (!reduceMotion) shake = Math.max(shake, 20);
  playPunch(30);
  impacts.push({ x: other.x, y: other.y, nx: e.dx, ny: e.dy, life: 0.35, max: 0.35, color: "#ffffff" });
  if (!reduceMotion) for (var f = 0; f < 18; f++) {
    var a = Math.atan2(e.dy, e.dx) + (Math.random() - 0.5) * 2.2, sp = 120 + Math.random() * 260;
    particles.push({ x: other.x, y: other.y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 60, life: 0.6, max: 0.6, size: 3 + Math.random() * 3, color: f % 3 ? "#5a3a1e" : "#ffffff" });
  }
}

// Under the fighters: the red path while it's coming, and the eagle's
// shadow sweeping across the mat.
function drawEagleStrikeUnder() {
  if (!eagleStrikes.length) return;
  var now = performance.now() / 1000;
  eagleStrikes.forEach(function (e) {
    var cfg = e.cfg, wdt = cfg.width * 2;
    var show = e.phase === "warn" ? Math.min(1, e.t / 0.15) : Math.max(0, 1 - e.t / (cfg.swoop * 0.7));
    if (show > 0) {
      var pulse = 0.7 + 0.3 * Math.sin(now * 18), len = ES_REACH * 2;
      ctx.save();
      ctx.beginPath(); ctx.rect(0, 0, W, H); ctx.clip(); // just across the ring
      ctx.translate(e.cx - e.dx * ES_REACH, e.cy - e.dy * ES_REACH); ctx.rotate(Math.atan2(e.dy, e.dx));
      ctx.globalAlpha = show;
      ctx.fillStyle = "rgba(220,20,20," + (0.22 * pulse) + ")";
      ctx.fillRect(0, -wdt / 2, len, wdt);
      ctx.strokeStyle = "rgba(220,20,20," + (0.85 * pulse) + ")"; ctx.lineWidth = 3; ctx.setLineDash([14, 10]);
      ctx.beginPath(); ctx.moveTo(0, -wdt / 2); ctx.lineTo(len, -wdt / 2); ctx.moveTo(0, wdt / 2); ctx.lineTo(len, wdt / 2); ctx.stroke();
      ctx.setLineDash([]);
      // Chevrons streaming the way it'll fly, filling in as it gets close.
      ctx.fillStyle = "rgba(235,30,30," + (0.75 * pulse) + ")";
      var off = (now * 220) % 46;
      for (var x = off; x < len - 10; x += 46) {
        ctx.beginPath(); ctx.moveTo(x, -wdt * 0.28); ctx.lineTo(x + 14, 0); ctx.lineTo(x, wdt * 0.28); ctx.lineTo(x + 6, 0); ctx.closePath(); ctx.fill();
      }
      ctx.restore();
    }
    if (e.phase === "swoop") {
      var h = Math.abs(e.k - 0.5) * 2;
      ctx.save();
      ctx.globalAlpha = 0.35 * (1 - h * 0.6);
      ctx.fillStyle = "#000";
      ctx.beginPath(); ctx.ellipse(e.x + h * 40, e.y + 26 + h * 80, 46 * (1 - h * 0.3), 13, 0, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }
  });
}

// Over the fighters: the eagle itself, coming down out of the sky, and the
// claw marks on whoever it got.
function drawEagleStrikeOver() {
  eagleSlashes.forEach(function (sl) {
    var b = balls[sl.id];
    if (!b || !b.alive) return;
    var k = 1 - sl.t / 0.4;
    ctx.save(); ctx.lineCap = "round"; ctx.globalAlpha = k;
    for (var i = -1; i <= 1; i++) {
      var ox = i * b.r * 0.28;
      [["#ffffff", 7], [theme.hit, 3.5]].forEach(function (st) {
        ctx.strokeStyle = st[0]; ctx.lineWidth = st[1];
        ctx.beginPath(); ctx.moveTo(b.x + ox - sl.side * b.r * 0.5, b.y - b.r * 0.7); ctx.lineTo(b.x + ox + sl.side * b.r * 0.5, b.y + b.r * 0.6); ctx.stroke();
      });
    }
    ctx.restore();
  });
  eagleStrikes.forEach(function (e) {
    if (e.phase !== "swoop") return;
    var h = Math.abs(e.k - 0.5) * 2;           // 0 at the bottom of the dive, 1 up high
    var lift = h * h * 90;                     // drawn higher up the screen when it's up in the air
    var sc = 0.62 + 0.5 * h, ang = Math.atan2(e.dy, e.dx), flap = e.t * 16;
    // A blur of ghosts behind it, it's coming in that fast.
    [0.07, 0.035].forEach(function (back, gi) {
      var kb = e.k - back;
      if (kb <= 0) return;
      var hb = Math.abs(kb - 0.5) * 2;
      ctx.save(); ctx.globalAlpha = 0.18 + gi * 0.12;
      drawEagle(e.cx + e.dx * ES_REACH * (2 * kb - 1), e.cy + e.dy * ES_REACH * (2 * kb - 1) - hb * hb * 90, ang, 0.62 + 0.5 * hb, flap, false);
      ctx.restore();
    });
    drawEagle(e.x, e.y - lift, ang, sc, flap, h < 0.3); // allamerican.js
  });
}
