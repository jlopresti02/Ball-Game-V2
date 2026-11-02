// Justin Gaethje's special move, All American.
//
// He runs them down and loads up the biggest punch he's got. It lands so hard
// every camera in the building goes off, and when the white-out clears the
// cage is gone: the two of them are out on a two-lane highway in the middle
// of nowhere at night (US 70, out past Safford). Bald eagles dive out of the
// dark and rake them with their talons, one after another, while Gaethje
// watches from the shoulder. Then headlights come up the road, a horn
// blares, and a Ford F-250 runs them over and launches them down the
// highway. Another flash and they're back in the cage, seeing stars.
//
// Uses the fighter's `igbb` state (move "allamerican") like the other
// specials, so everything that locks or guards during IGBB does the same
// here. The opponent's held at 1 health through the whole scene; if the
// damage would have finished them, they drop once it's back in the cage.
"use strict";

var AA_CLOSE_SPEED = 900;     // running them down
var AA_CLOSE_GIVEUP = 3.5;    // gives up (stays charged) if it can't get there
var AA_WINDUP_TIME = 0.6;     // the haymaker cocked way back (the tell)
var AA_PUNCH_TIME = 0.14;     // the hook sweeping round into them
var AA_FLASH_TIME = 0.5;      // the cameras going off before the road appears
var AA_EAGLES = [0.45, 0.9, 1.3, 1.7]; // when each eagle starts its dive (road clock)
var AA_EAGLE_DIVE = 0.5;      // one swoop, in and back out (talons hit halfway): fast
var AA_TRUCK_AT = 2.4;        // the horn, and the truck starts up the road
var AA_TRUCK_HIT = 1.9;       // seconds from the horn to the hit (during its second blast)
var AA_TRUCK_SPEED = 1700;
var AA_TRUCK_L = 800;        // Joe's semi, nose to tail (arena units): towers over them
var AA_TRUCK_BASE = 70;      // its wheels sit this far below the victim's centre
var AA_TRUCK_W = 124;        // (the drawn stand-in pickup's width)
var aaTruckImg = new Image();
aaTruckImg.src = AA_TRUCK_SRC; // allamerican-art.js
var AA_FLY_TIME = 1.0;        // how long they tumble down the road after the hit
var AA_ROAD = { y: 250, half: 110 }; // the highway runs left to right across the middle
var AA_VICTIM = { x: 310, y: 305 };  // standing in the eastbound lane
var AA_SHOULDER = { x: 110, y: 84 }; // where Gaethje watches from

var aaScene = null; // the road, while it's showing: { t, scrub }

function resetAllAmerican() { aaScene = null; stopFreeBird(0); }
function allAmericanOn() { return !!aaScene; }

function updateAllAmerican(self, other, dt) {
  var sp = self.char.special;
  if (!self.igbb) {
    if (self.specialT < sp.chargeTime || !canStartIgbb(self, other)) return false;
    self.igbb = { move: "allamerican", phase: "close", t: 0 };
    clearActions(self);
    floater(self.x, self.y - self.r - 26, "ALL AMERICAN!", "crit");
    playWhoosh();
  }
  var m = self.igbb;
  m.t += dt;
  var dx = other.x - self.x, dy = other.y - self.y, d = Math.sqrt(dx * dx + dy * dy) || 1;

  if (m.phase === "close") {
    if (!other.alive || other.invincible || specialBusy(other) || m.t > AA_CLOSE_GIVEUP) { self.igbb = null; return false; }
    if (d < self.r + other.r + 16) {
      clearActions(other);
      other.dazed = "held"; other.vx = 0; other.vy = 0;
      self.vx = 0; self.vy = 0;
      m.phase = "windup"; m.t = 0; m.nx = dx / d; m.ny = dy / d;
      m.side = dx >= 0 ? 1 : -1;
      return true;
    }
    self.vx = dx / d * AA_CLOSE_SPEED; self.vy = dy / d * AA_CLOSE_SPEED;
    if (!reduceMotion) particles.push({ x: self.x, y: self.y, vx: -self.vx * 0.1, vy: -self.vy * 0.1, life: 0.2, max: 0.2, size: self.r * 0.55, color: self.char.color });
    return true;
  }

  self.vx = 0; self.vy = 0;
  if (other.alive) { other.vx = 0; other.vy = 0; }
  if (m.phase === "windup") {
    // Rocks back away from them, loading up.
    var w = Math.min(1, m.t / AA_WINDUP_TIME);
    self.x -= m.nx * 70 * (1 - w) * dt; self.y -= m.ny * 70 * (1 - w) * dt;
    if (m.t >= AA_WINDUP_TIME) { m.phase = "punch"; m.t = 0; playWhoosh(); }
    return true;
  }
  if (m.phase === "punch") {
    self.x += m.nx * 260 * dt; self.y += m.ny * 260 * dt;
    if (m.t < AA_PUNCH_TIME) return true;
    other.holdAtOne = true; // nobody dies before the truck
    hurt(other, sp.punchDamage, "igbb", self.id);
    violentHit(self, other, 1.4);
    other.squash = { t: 0.3, max: 0.3, nx: (m.nx - m.ny * m.side) / Math.SQRT2, ny: (m.ny + m.nx * m.side) / Math.SQRT2 }; // knocked sideways along the hook
    floater(other.x, other.y - other.r - 60, "BOOM!", "crit");
    playSlam(); playPunch(40);
    cameraFlash(); playCameraFlashes(); // dobronx.js, audio.js
    hitStop = Math.max(hitStop, 0.16);
    if (!reduceMotion) shake = Math.max(shake, 36);
    m.phase = "flash"; m.t = 0;
    return true;
  }
  if (m.phase === "flash") {
    // More flashes, then one last white-out hides the switch to the road.
    if (m.t > 0.22 && !m.flash2) { m.flash2 = true; screenFlash = Math.max(screenFlash, 0.7); }
    if (m.t < AA_FLASH_TIME) return true;
    screenFlash = 1;
    startRoad(self, other, m);
    return true;
  }
  if (m.phase === "road") return updateRoad(self, other, m, dt);
  if (m.phase === "back") {
    if (other.dazed && m.t >= sp.dazeTime) { other.dazed = false; setSpeed(other, (other.baseSpeed || SPEED) * 0.6); }
    if (m.t < sp.dazeTime) return true;
    endAllAmerican(self, other);
    return false;
  }
  return false;
}

function startRoad(self, other, m) {
  m.phase = "road"; m.t = 0;
  m.eagles = AA_EAGLES.map(function (at, i) { return { at: at, side: i % 2 ? -1 : 1, hit: false }; });
  // Starts far enough back that its nose reaches them AA_TRUCK_HIT after the horn.
  m.truck = { x: AA_VICTIM.x - other.r * 0.6 - AA_TRUCK_SPEED * AA_TRUCK_HIT - AA_TRUCK_L / 2, on: false, hit: false, t: 0 };
  m.recoil = null; m.slashes = [];
  m.fly = null;
  m.home = { sx: self.x, sy: self.y, ox: other.x, oy: other.y };
  self.x = AA_SHOULDER.x; self.y = AA_SHOULDER.y;
  other.x = AA_VICTIM.x; other.y = AA_VICTIM.y;
  aaScene = { t: 0, scrub: roadScrub() };
  playFreeBird(); // audio.js
}

function updateRoad(self, other, m, dt) {
  var sp = self.char.special;
  aaScene.t = m.t;
  self.x = AA_SHOULDER.x; self.y = AA_SHOULDER.y;
  if (!m.fly) { other.x = AA_VICTIM.x; other.y = AA_VICTIM.y; }
  if (m.recoil) { m.recoil.t += dt; if (m.recoil.t > 0.6) m.recoil = null; }
  m.slashes = m.slashes.filter(function (sl) { sl.t += dt; return sl.t < 0.35; });

  // The eagles.
  m.eagles.forEach(function (e, i) {
    var k = (m.t - e.at) / AA_EAGLE_DIVE;
    if (k > -0.15 && !e.called) {
      e.called = true;
      playEagleScreech();
      if (i === 0) floater(other.x, other.y - other.r - 70, "SCREECH!", "crit");
    }
    if (k >= 0.5 && !e.hit) {
      // Talons rake straight through them: a freeze, claw marks, feathers
      // everywhere, and they're knocked reeling the way it was flying.
      e.hit = true;
      hurt(other, sp.eagleDamage, "igbb", self.id);
      var hx = -e.side, hy = 0.35, hl = Math.sqrt(hx * hx + hy * hy);
      other.squash = { t: 0.26, max: 0.26, nx: hx / hl, ny: hy / hl };
      other.flash = 0.22;
      m.recoil = { x: hx / hl, y: hy / hl, t: 0, spin: -e.side * 0.6 };
      m.slashes.push({ t: 0, side: e.side });
      hitStop = Math.max(hitStop, 0.07);
      if (!reduceMotion) shake = Math.max(shake, 22);
      playPunch(30);
      impacts.push({ x: other.x, y: other.y - other.r * 0.3, nx: hx, ny: -0.5, life: 0.4, max: 0.4, color: "#ffffff" });
      impacts.push({ x: other.x, y: other.y, nx: hx, ny: hy, life: 0.3, max: 0.3, color: theme.hit });
      if (!reduceMotion) for (var f = 0; f < 22; f++) {
        var a = Math.atan2(hy, hx) + (Math.random() - 0.5) * 2.4, v = 160 + Math.random() * 420;
        particles.push({ x: other.x, y: other.y - other.r * 0.4, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 80, life: 0.8, max: 0.8,
          size: 2.5 + Math.random() * 3.5, color: f % 4 === 0 ? theme.hit : (f % 3 ? "#5a3a20" : "#f4f1ea") });
      }
    }
  });

  // The truck.
  var tr = m.truck;
  if (m.t >= AA_TRUCK_AT) {
    if (!tr.on) { tr.on = true; playTruckHorn(); }
    tr.t += dt;
    tr.x += AA_TRUCK_SPEED * dt;
    // They see it coming and turn to face the lights.
    if (!tr.hit && tr.t > AA_TRUCK_HIT - 0.5 && !m.brace) { m.brace = true; other.squash = { t: 0.5, max: 0.5, nx: 1, ny: 0 }; }
    if (!tr.hit && tr.x + AA_TRUCK_L / 2 >= other.x - other.r * 0.6) {
      tr.hit = true;
      hurt(other, sp.truckDamage, "igbb", self.id);
      floater(other.x, other.y - other.r - 70, "F-250!", "crit");
      other.squash = { t: 0.4, max: 0.4, nx: -1, ny: 0 }; // flattened against the grille
      other.flash = 0.3;
      playTruckImpact(); playSlam(); playPunch(60);
      hitStop = Math.max(hitStop, 0.3);
      screenFlash = Math.max(screenFlash, 0.55);
      if (!reduceMotion) shake = Math.max(shake, 60);
      impacts.push({ x: other.x - other.r, y: other.y, nx: -1, ny: 0, life: 0.8, max: 0.8, color: "#ffffff" });
      impacts.push({ x: other.x, y: other.y, nx: 1, ny: 0, life: 0.6, max: 0.6, color: theme.hit });
      igbbSparks(other.x - other.r, other.y, 1, -0.2, "#ffe9a8", 50, 1000);
      igbbSparks(other.x, other.y, 1, -0.6, "#cfe8ff", 24, 700); // glass
      m.fly = { x: other.x, y: other.y, vx: 1900, vy: -700, t: 0, spin: 0 };
      m.recoil = null;
    }
  }
  if (m.fly) {
    // Launched down the highway, tumbling.
    var fl = m.fly;
    fl.t += dt;
    fl.x += fl.vx * dt; fl.y += fl.vy * dt;
    fl.vx *= Math.exp(-1.6 * dt); fl.vy += 1500 * dt;
    fl.spin += (fl.vx / 1900) * 22 * dt; // cartwheeling
    if (fl.y > AA_VICTIM.y + 20) {
      // Bounces along the asphalt, each bounce a little thud and a burst of grit.
      fl.y = AA_VICTIM.y + 20; fl.vy = -Math.abs(fl.vy) * 0.5;
      if (Math.abs(fl.vy) > 120) {
        playPunch(14);
        if (!reduceMotion) { shake = Math.max(shake, 10); igbbSparks(fl.x, fl.y + other.r * 0.6, 0, -1, "#8a8174", 10, 300); }
      }
    }
    if (!reduceMotion) particles.push({ x: fl.x, y: fl.y, vx: 0, vy: 0, life: 0.25, max: 0.25, size: other.r * 0.4, color: "rgba(200,200,200,0.5)" });
    if (fl.t >= AA_FLY_TIME) { backToCage(self, other, m); return true; }
  }
  return true;
}

// Another white-out and they're back in the cage where they were.
function backToCage(self, other, m) {
  screenFlash = 1;
  stopFreeBird();
  aaScene = null;
  m.fly = null;
  m.phase = "back"; m.t = 0;
  self.x = m.home.sx; self.y = m.home.sy;
  other.x = m.home.ox; other.y = m.home.oy;
  other.holdAtOne = false;
  if (other.hp <= 1 && other.alive) { other.dazed = false; hurt(other, 1, "igbb", self.id); }
  if (!other.alive) { endAllAmerican(self, other); checkEnd(); return; }
  other.dazed = true; // stars
  floater(other.x, other.y - other.r - 34, "DAZED", "note");
}

function endAllAmerican(self, other) {
  if (aaScene) stopFreeBird();
  aaScene = null;
  self.igbb = null;
  self.specialT = 0;
  other.holdAtOne = false;
  if (other.dazed) other.dazed = false;
  setSpeed(self, self.baseSpeed || SPEED);
  if (other.alive) setSpeed(other, (other.baseSpeed || SPEED) * 0.6);
}

// Where they're drawn while flying down the road after the truck (draw.js).
// Or knocked reeling by an eagle: snapped hard one way, wobbling back.
function allAmericanOffset(b) {
  var m = aaVictimMove(b);
  if (!m) return { x: 0, y: 0 };
  if (m.fly) return { x: m.fly.x - b.x, y: m.fly.y - b.y };
  if (m.recoil && !reduceMotion) {
    var rc = m.recoil, k = Math.exp(-rc.t * 7) * Math.cos(rc.t * 16) * b.r * 0.9;
    return { x: rc.x * k, y: rc.y * k };
  }
  return { x: 0, y: 0 };
}
// How far they're turned: cartwheeling after the truck, or wrenched round by an eagle.
function allAmericanSpin(b) {
  var m = aaVictimMove(b);
  if (!m || reduceMotion) return 0;
  if (m.fly) return m.fly.spin;
  if (m.recoil) return m.recoil.spin * Math.exp(-m.recoil.t * 7) * Math.cos(m.recoil.t * 16);
  return 0;
}
function aaVictimMove(b) {
  var o = balls[1 - b.id], m = o && o.igbb;
  return m && m.move === "allamerican" && m.phase === "road" ? m : null;
}
// Covering up from the eagles (both gloves over the head).
function aaCovering(b) {
  var m = aaVictimMove(b);
  return !!(m && !m.fly && !(m.truck && m.truck.on && m.truck.t > AA_TRUCK_HIT - 0.5));
}
// Claw marks raked across them, fading fast.
function drawAaSlashes(b) {
  var m = aaVictimMove(b);
  if (!m || !m.slashes.length) return;
  ctx.save(); ctx.lineCap = "round";
  m.slashes.forEach(function (sl) {
    var k = 1 - sl.t / 0.35;
    for (var i = -1; i <= 1; i++) {
      var ox = i * b.r * 0.28;
      ctx.globalAlpha = k;
      ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 7;
      ctx.beginPath(); ctx.moveTo(b.x + ox - sl.side * b.r * 0.5, b.y - b.r * 0.7); ctx.lineTo(b.x + ox + sl.side * b.r * 0.5, b.y + b.r * 0.6); ctx.stroke();
      ctx.strokeStyle = theme.hit; ctx.lineWidth = 3.5;
      ctx.beginPath(); ctx.moveTo(b.x + ox - sl.side * b.r * 0.5, b.y - b.r * 0.7); ctx.lineTo(b.x + ox + sl.side * b.r * 0.5, b.y + b.r * 0.6); ctx.stroke();
    }
  });
  ctx.restore();
}

// ---------------------------------------------------------------
// Drawing
// ---------------------------------------------------------------

// Scrub, rocks and the odd fence post scattered off the road, the same
// every time (a fixed seed).
function roadScrub() {
  var seed = 7, out = [];
  function rnd() { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }
  for (var i = 0; i < 70; i++) {
    var x = -500 + rnd() * 1500, top = rnd() < 0.5;
    var y = top ? AA_ROAD.y - AA_ROAD.half - 40 - rnd() * 900 : AA_ROAD.y + AA_ROAD.half + 40 + rnd() * 900;
    out.push({ x: x, y: y, r: 6 + rnd() * 16, kind: rnd() < 0.7 ? "bush" : "rock", tone: rnd() });
  }
  return out;
}

// The highway at night, in arena units, over everything (drawn instead of
// the mat; it's big enough to cover the whole stadium stage too).
function drawRoadScene() {
  var R = AA_ROAD, x0 = -900, x1 = 1400;
  ctx.save();
  // Desert floor.
  ctx.fillStyle = "#1f1a16"; ctx.fillRect(x0, -1600, x1 - x0, 3700);
  aaScene.scrub.forEach(function (s) {
    if (s.kind === "bush") {
      ctx.fillStyle = s.tone < 0.5 ? "#2c3322" : "#343a27";
      for (var k = 0; k < 4; k++) { ctx.beginPath(); ctx.arc(s.x + Math.cos(k * 1.7) * s.r * 0.5, s.y + Math.sin(k * 1.7) * s.r * 0.5, s.r * 0.6, 0, Math.PI * 2); ctx.fill(); }
    } else {
      ctx.fillStyle = s.tone < 0.5 ? "#3a332c" : "#453c33";
      ctx.beginPath(); ctx.ellipse(s.x, s.y, s.r * 0.8, s.r * 0.55, s.tone * 3, 0, Math.PI * 2); ctx.fill();
    }
  });
  // Gravel shoulders, then the asphalt.
  ctx.fillStyle = "#3b362f"; ctx.fillRect(x0, R.y - R.half - 22, x1 - x0, R.half * 2 + 44);
  ctx.fillStyle = "#26282d"; ctx.fillRect(x0, R.y - R.half, x1 - x0, R.half * 2);
  // Edge lines and the dashed yellow centre line.
  ctx.fillStyle = "#d9d6cc";
  ctx.fillRect(x0, R.y - R.half + 8, x1 - x0, 5); ctx.fillRect(x0, R.y + R.half - 13, x1 - x0, 5);
  ctx.fillStyle = "#e8b923";
  for (var dx = x0; dx < x1; dx += 80) ctx.fillRect(dx, R.y - 3, 46, 6);
  // A highway sign on the far side of the road.
  drawRouteSign(430, R.y - R.half - 70);
  // Fence posts along the near side.
  ctx.strokeStyle = "#5b4a39"; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(x0, R.y + R.half + 70); ctx.lineTo(x1, R.y + R.half + 70); ctx.stroke();
  ctx.fillStyle = "#6b5741";
  for (var px = x0; px < x1; px += 90) ctx.fillRect(px - 3, R.y + R.half + 64, 6, 12);
  ctx.restore();
}

function drawRouteSign(x, y) {
  ctx.save();
  ctx.fillStyle = "#6f6f6f"; ctx.fillRect(x - 3, y, 6, 46);
  ctx.fillStyle = "#f4f4f0"; ctx.strokeStyle = "#151515"; ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x - 22, y - 34); ctx.lineTo(x + 22, y - 34); ctx.lineTo(x + 22, y - 10);
  ctx.quadraticCurveTo(x + 20, y + 4, x, y + 10); ctx.quadraticCurveTo(x - 20, y + 4, x - 22, y - 10); ctx.closePath();
  ctx.fill(); ctx.stroke();
  ctx.fillStyle = "#151515"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.font = '800 9px "Barlow Condensed", "Arial Narrow", sans-serif'; ctx.fillText("US", x, y - 26);
  ctx.font = '800 20px "Barlow Condensed", "Arial Narrow", sans-serif'; ctx.fillText("70", x, y - 10);
  ctx.restore();
}

// Night falls over the road (but not the fighters): a dark, moonlit blue
// with the edges fading to black. Then the truck's headlights cut through.
function drawRoadNight(m) {
  ctx.save();
  ctx.fillStyle = "rgba(8,14,40,0.45)"; ctx.fillRect(-900, -1600, 2300, 3700);
  var g = ctx.createRadialGradient(W / 2, H / 2, W * 0.35, W / 2, H / 2, W * 1.6);
  g.addColorStop(0, "rgba(0,0,0,0)"); g.addColorStop(1, "rgba(0,0,0,0.85)");
  ctx.fillStyle = g; ctx.fillRect(-900, -1600, 2300, 3700);
  if (m && m.truck && m.truck.on) { drawDistantLights(m.truck); drawHeadlightBeams(m.truck.x); }
  ctx.restore();
}

// Headlights coming up the road out of the dark, before the truck's in view:
// a glow at the left edge that grows as it gets closer.
function drawDistantLights(tr) {
  var k = Math.min(1, tr.t / AA_TRUCK_HIT), y = AA_VICTIM.y + AA_TRUCK_BASE - AA_TRUCK_L * AA_TRUCK_ASPECT * 0.3;
  var x = Math.max(-160, tr.x + AA_TRUCK_L / 2);
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  var g = ctx.createRadialGradient(x, y, 0, x, y, 80 + 260 * k);
  g.addColorStop(0, "rgba(255,244,205," + (0.25 + 0.55 * k) + ")"); g.addColorStop(1, "rgba(255,244,205,0)");
  ctx.fillStyle = g; ctx.fillRect(x - 400, y - 400, 800, 800);
  ctx.restore();
}

function drawHeadlightBeams(tx) {
  var front = tx + AA_TRUCK_L / 2, y = AA_VICTIM.y + AA_TRUCK_BASE - AA_TRUCK_L * AA_TRUCK_ASPECT * 0.3;
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  [0].forEach(function () {
    var ly = y;
    var g = ctx.createLinearGradient(front, 0, front + 560, 0);
    g.addColorStop(0, "rgba(255,240,190,0.45)"); g.addColorStop(1, "rgba(255,240,190,0)");
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.moveTo(front, ly - 8); ctx.lineTo(front + 560, ly - 90); ctx.lineTo(front + 560, ly + 90); ctx.lineTo(front, ly + 8); ctx.closePath(); ctx.fill();
  });
  ctx.restore();
}

// Bald eagles: seen from above, wings spread, white head and tail. Each one
// dives in from high up (bigger, closer to the camera, its shadow far off on
// the ground), rakes them at the bottom of the swoop and climbs back out.
function drawEagles(m) {
  var vic = AA_VICTIM;
  m.eagles.forEach(function (e) {
    var k = (m.t - e.at) / AA_EAGLE_DIVE;
    if (k <= 0 || k >= 1) return;
    var p0 = { x: vic.x + e.side * 560, y: vic.y - 640 }, p2 = { x: vic.x - e.side * 520, y: vic.y - 700 };
    var c = { x: 2 * vic.x - (p0.x + p2.x) / 2, y: 2 * (vic.y - 20) - (p0.y + p2.y) / 2 };
    var pos = bez(p0, c, p2, k), ahead = bez(p0, c, p2, Math.min(1, k + 0.02));
    var h = Math.abs(k - 0.5) * 2; // 0 at the bottom of the dive, 1 up high
    var ang = Math.atan2(ahead.y - pos.y, ahead.x - pos.x);
    // Shadow on the road.
    ctx.save();
    ctx.globalAlpha = 0.35 * (1 - h * 0.6);
    ctx.fillStyle = "#000";
    ctx.beginPath(); ctx.ellipse(pos.x + h * 70, pos.y + h * 120 + 20, 60 * (1 - h * 0.3), 18, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    // A blur of ghosts behind it, it's coming in that fast.
    [0.09, 0.05].forEach(function (back, gi) {
      if (k - back <= 0) return;
      var gp = bez(p0, c, p2, k - back), gh = Math.abs(k - back - 0.5) * 2;
      ctx.save(); ctx.globalAlpha = 0.18 + gi * 0.12;
      drawEagle(gp.x, gp.y, ang, 1.3 + 0.8 * gh, m.t * 14 + e.at * 5, false);
      ctx.restore();
    });
    drawEagle(pos.x, pos.y, ang, 1.3 + 0.8 * h, m.t * 14 + e.at * 5, h < 0.25);
  });
}
function bez(a, c, b, k) {
  var u = 1 - k;
  return { x: u * u * a.x + 2 * u * k * c.x + k * k * b.x, y: u * u * a.y + 2 * u * k * c.y + k * k * b.y };
}

var aaEagleImg = new Image();
aaEagleImg.src = AA_EAGLE_SRC; // allamerican-art.js

// Joe's eagle picture, upright, turned to face the way it's flying (the
// picture faces left), with a little wobble as it beats its wings. Until it's
// loaded, the drawn eagle from above stands in.
function drawEagle(x, y, ang, sc, flap, talons) {
  if (aaEagleImg.complete && aaEagleImg.naturalWidth) {
    var size = 170 * sc, dir = Math.cos(ang) > 0 ? -1 : 1;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(Math.sin(flap) * 0.06);
    ctx.scale(dir, 1 + Math.sin(flap) * 0.04);
    ctx.drawImage(aaEagleImg, -size / 2, -size * 0.62, size, size);
    ctx.restore();
    return;
  }
  drawTopDownEagle(x, y, ang, sc, flap, talons);
}
function drawTopDownEagle(x, y, ang, sc, flap, talons) {
  var span = 0.8 + 0.2 * Math.cos(flap);
  ctx.save();
  ctx.translate(x, y); ctx.rotate(ang); ctx.scale(sc, sc);
  ctx.lineJoin = "round"; ctx.lineWidth = 2.5; ctx.strokeStyle = "#140c06";
  // Wings, with ragged feather tips.
  [-1, 1].forEach(function (s) {
    ctx.fillStyle = "#4a2c17";
    ctx.beginPath();
    ctx.moveTo(8, s * 8);
    ctx.quadraticCurveTo(-4, s * 50 * span, -18, s * 82 * span);
    for (var f = 0; f < 5; f++) ctx.lineTo(-24 - f * 4, s * (78 - f * 13) * span), ctx.lineTo(-30 - f * 3, s * (70 - f * 13) * span);
    ctx.lineTo(-26, s * 10);
    ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = "rgba(20,12,6,0.6)"; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(-2, s * 18 * span); ctx.lineTo(-22, s * 60 * span); ctx.stroke();
    ctx.strokeStyle = "#140c06"; ctx.lineWidth = 2.5;
  });
  // White tail fan.
  ctx.fillStyle = "#f4f1ea";
  ctx.beginPath(); ctx.moveTo(-28, -10); ctx.lineTo(-58, -18); ctx.lineTo(-63, 0); ctx.lineTo(-58, 18); ctx.lineTo(-28, 10); ctx.closePath(); ctx.fill(); ctx.stroke();
  // Talons out at the bottom of the dive.
  if (talons) {
    ctx.strokeStyle = "#e0a91c"; ctx.lineWidth = 4;
    [-1, 1].forEach(function (s) {
      ctx.beginPath(); ctx.moveTo(4, s * 6); ctx.lineTo(30, s * 12); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(30, s * 12); ctx.lineTo(38, s * 6); ctx.moveTo(30, s * 12); ctx.lineTo(38, s * 17); ctx.stroke();
    });
    ctx.strokeStyle = "#140c06"; ctx.lineWidth = 2.5;
  }
  // Body, then the white head and hooked yellow beak.
  ctx.fillStyle = "#3b2414";
  ctx.beginPath(); ctx.ellipse(-6, 0, 30, 13, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = "#f4f1ea";
  ctx.beginPath(); ctx.arc(24, 0, 11, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = "#f0b416";
  ctx.beginPath(); ctx.moveTo(32, -5); ctx.lineTo(46, -1); ctx.quadraticCurveTo(48, 3, 43, 5); ctx.lineTo(32, 5); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = "#140c06";
  ctx.beginPath(); ctx.arc(28, -5, 1.8, 0, Math.PI * 2); ctx.arc(28, 5, 1.8, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

// The truck: Joe's red semi, side on, heading right with its wheels on the
// eastbound lane. Until the picture's loaded, a drawn red pickup from above
// stands in (drawPickup).
function drawTruck(tx) {
  if (aaTruckImg.complete && aaTruckImg.naturalWidth) {
    var L = AA_TRUCK_L, Ht = L * AA_TRUCK_ASPECT, bottom = AA_VICTIM.y + AA_TRUCK_BASE;
    ctx.drawImage(aaTruckImg, tx - L / 2, bottom - Ht, L, Ht);
    return;
  }
  drawPickup(tx + (AA_TRUCK_L - 270) / 2);
}
function drawPickup(tx) {
  var L = 270, Wd = AA_TRUCK_W, y = AA_VICTIM.y;
  ctx.save();
  ctx.translate(tx, y);
  ctx.lineJoin = "round";
  ctx.fillStyle = "rgba(0,0,0,0.4)";
  aaRoundRect(-L / 2 + 10, -Wd / 2 + 14, L, Wd, 20); ctx.fill();
  // Tyres poking out.
  ctx.fillStyle = "#0d0d0d";
  [L * 0.3, -L * 0.3].forEach(function (wx) { [-1, 1].forEach(function (s) { aaRoundRect(wx - 24, s * (Wd / 2 + 2) - 10, 48, 20, 6); ctx.fill(); }); });
  // Body.
  ctx.fillStyle = "#9b1717"; ctx.strokeStyle = "#1a0606"; ctx.lineWidth = 4;
  aaRoundRect(-L / 2, -Wd / 2, L, Wd, 18); ctx.fill(); ctx.stroke();
  // Bed (open, with ribs) and tailgate.
  ctx.fillStyle = "#2a2626"; aaRoundRect(-L / 2 + 10, -Wd / 2 + 12, L * 0.32, Wd - 24, 6); ctx.fill();
  ctx.strokeStyle = "#3d3737"; ctx.lineWidth = 3;
  for (var rb = 0; rb < 4; rb++) { var rx = -L / 2 + 22 + rb * L * 0.075; ctx.beginPath(); ctx.moveTo(rx, -Wd / 2 + 16); ctx.lineTo(rx, Wd / 2 - 16); ctx.stroke(); }
  // Rear window, roof, windshield.
  ctx.fillStyle = "#1b2633"; aaRoundRect(-L * 0.16, -Wd / 2 + 12, 12, Wd - 24, 4); ctx.fill();
  ctx.fillStyle = "#ae2020"; aaRoundRect(-L * 0.12, -Wd / 2 + 8, L * 0.26, Wd - 16, 10); ctx.fill();
  ctx.fillStyle = "#1b2633";
  ctx.beginPath(); ctx.moveTo(L * 0.14, -Wd / 2 + 10); ctx.lineTo(L * 0.22, -Wd / 2 + 16); ctx.lineTo(L * 0.22, Wd / 2 - 16); ctx.lineTo(L * 0.14, Wd / 2 - 10); ctx.closePath(); ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.18)"; ctx.fillRect(L * 0.16, -Wd / 2 + 16, 4, Wd * 0.4);
  // Hood ridges.
  ctx.strokeStyle = "rgba(0,0,0,0.3)"; ctx.lineWidth = 3;
  [-1, 1].forEach(function (s) { ctx.beginPath(); ctx.moveTo(L * 0.24, s * Wd * 0.18); ctx.lineTo(L / 2 - 16, s * Wd * 0.2); ctx.stroke(); });
  // Mirrors.
  ctx.fillStyle = "#111"; [-1, 1].forEach(function (s) { ctx.fillRect(L * 0.12, s * (Wd / 2 + 10) - 5, 14, 10); });
  // Chrome grille and headlights.
  ctx.fillStyle = "#c9ccd1"; ctx.fillRect(L / 2 - 12, -Wd / 2 + 16, 10, Wd - 32);
  ctx.fillStyle = "#2b2b2b"; for (var gs = -2; gs <= 2; gs++) ctx.fillRect(L / 2 - 11, gs * 14 - 3, 8, 6);
  ctx.fillStyle = "#fff6cf"; [-1, 1].forEach(function (s) { aaRoundRect(L / 2 - 14, s * (Wd / 2 - 16) - 9, 12, 18, 3); ctx.fill(); });
  ctx.fillStyle = "#e01818"; [-1, 1].forEach(function (s) { ctx.fillRect(-L / 2 - 1, s * (Wd / 2 - 14) - 8, 5, 16); });
  ctx.restore();
}

function aaRoundRect(x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y); ctx.closePath();
}

// Over the fighters while the road's up: the eagles and the truck.
function drawRoadActors() {
  var m = aaOwnerMove();
  if (!aaScene || !m) return;
  drawEagles(m);
  if (m.truck.on) drawTruck(m.truck.x);
}
function aaOwnerMove() {
  for (var i = 0; i < balls.length; i++) if (balls[i].igbb && balls[i].igbb.move === "allamerican") return balls[i].igbb;
  return null;
}

// His arms: the haymaker cocked way back, the punch driving through, and
// fists pumping once the truck hits.
function drawAllAmerican(b) {
  var m = b.igbb;
  if (!m || m.move !== "allamerican" || !b.alive) return;
  var size = b.char.punch.size || 15;
  if (m.phase === "windup" || m.phase === "punch") {
    var nx = m.nx, ny = m.ny, px = -ny * m.side, py = nx * m.side;
    var sh = { x: b.x - px * b.r * 0.6, y: b.y - py * b.r * 0.6 };
    // A hook: the fist's cocked out wide to the side, then sweeps round in
    // an arc into the side of their head and follows through across.
    var ang = Math.atan2(ny, nx), hand;
    if (m.phase === "windup") {
      var w = Math.min(1, m.t / AA_WINDUP_TIME), wob = Math.sin(m.t * 40) * 2 * w;
      hand = aaHookFist(b, ang, -m.side * (AA_HOOK_OPEN + 0.35 * w), b.r * (1.2 - 0.15 * w));
      hand.x += wob;
    } else {
      var k = Math.min(1, m.t / AA_PUNCH_TIME);
      var hk = function (kk) { var e = kk * kk * (3 - 2 * kk); return aaHookFist(b, ang, -m.side * (AA_HOOK_OPEN + 0.35) * (1 - e) + m.side * AA_HOOK_FOLLOW * e, b.r * (1.05 + 0.6 * Math.min(1, kk / 0.6))); };
      hand = hk(k);
      // Blur along the arc behind the fist.
      ctx.save(); ctx.lineCap = "round";
      [0.15, 0.3, 0.45].forEach(function (back, i) {
        if (k - back <= 0) return;
        var g = hk(k - back);
        ctx.globalAlpha = 0.5 - i * 0.14; ctx.strokeStyle = "#ffffff"; ctx.lineWidth = size * (1.6 - i * 0.4);
        ctx.beginPath(); ctx.moveTo(g.x, g.y); ctx.lineTo(hand.x, hand.y); ctx.stroke();
      });
      ctx.restore();
    }
    strokeLimb(size * 0.8, armColor(b.char), function () { ctx.moveTo(sh.x, sh.y); ctx.lineTo(hand.x, hand.y); });
    drawGloveAt(hand.x, hand.y, size * (m.phase === "punch" ? 1.3 : 1.1), b.char);
    // The lead hand stays up.
    var lead = { x: b.x + nx * b.r * 0.85 + px * b.r * 0.4, y: b.y + ny * b.r * 0.85 + py * b.r * 0.4 };
    drawGloveAt(lead.x, lead.y, size * 0.9, b.char);
    return;
  }
  if ((m.phase === "road" && m.fly) || m.phase === "back") drawArmsUp(b, m.t); // chairshot.js
}
var AA_HOOK_OPEN = 105 * Math.PI / 180;  // how far out to the side the hook's cocked
var AA_HOOK_FOLLOW = 35 * Math.PI / 180; // how far past them it follows through
function aaHookFist(b, ang, off, R) {
  return { x: b.x + Math.cos(ang + off) * R, y: b.y + Math.sin(ang + off) * R };
}
function allAmericanHandsBusy(b) {
  var m = b.igbb;
  return !!(m && m.move === "allamerican" && (m.phase === "windup" || m.phase === "punch" || (m.phase === "road" && m.fly) || m.phase === "back"));
}
