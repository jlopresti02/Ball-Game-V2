// Justin Gaethje's golf mode.
//
// If one of his own Eagle Strike eagles (gaethje-eagle.js) swoops through
// him, it snatches him up instead and carries him off the screen. A moment
// later he drops back in from the top of the screen to the middle of the
// ring (like Jon's Duck Drop), wearing his trucker hat with a golf club in
// his hands. The landing only does `land.damage`; it's there to knock back
// anyone within `land.radius` so he has room. An eagle also comes for him on purpose the moment Dustin goes into
// Diamond Guard (diamond.js) or Gane pulls out his bat (cheater.js).
//
// With the club he fights like Gane with his bat (it's the same code, in
// cheater.js, with `gaethje.golf.club` for the numbers), so Diamond Guard
// Dustin's sword clash parries it too, and a sword duel can rip it out of
// his hands. Every few seconds, when they're far enough off, he stops, tees
// one up and drives a golf ball at them ("FORE!"). After `duration` seconds
// he tosses the club away and goes back to fighting; the hat stays on.
//
// Settings, under `gaethje.golf` in the character JSON:
//   duration       seconds he has the club
//   club           the swing, like Gane's `cheater.bat` (damage, cooldown,
//                  windup, swing, follow, reach, knockback)
//   ball           every [min, max] seconds, damage, speed, minDist (only
//                  tees off when they're at least this far away)
"use strict";

var GOLF_CLUB_LEN = 2.2;   // club length, in ball radii
var GOLF_CLUB_THICK = 1.8; // the picture drawn this much fatter across, so the shaft and head read at fight size
var EC_OUT = 0.9, EC_SPEED = 650, EC_CLIMB = 260; // carried off: how long, how fast along the line, how fast it climbs
var EC_GONE = 0.9, EC_DROP = 0.45;               // off screen, then the fall back in to the middle
// The golf shot's timeline (seconds into it).
var GS_SET = 0.15, GS_ADDRESS = 0.42, GS_TOP = 0.82, GS_DOWN = 0.88, GS_HIT = 0.98, GS_END = 1.55;

var golfBallImg = new Image(); golfBallImg.src = GOLF_BALL_SRC; // golf-art.js
var golfClubImg = new Image(); golfClubImg.src = GOLF_CLUB_SRC;

function golfCfg(b) { return b.char.gaethje && b.char.gaethje.golf; }
function golfing(b) { return !!(b.cheater && b.cheater.club); }
function golfGap(cfg) { var e = cfg.ball.every; return e[0] + Math.random() * (e[1] - e[0]); }

// ---------------------------------------------------------------- the snatch

// Can his eagle pick him up right now?
function canSnatch(b) {
  return !!(golfCfg(b) && b.alive && !golfing(b) && !b.igbb && !specialBusy(b) && !swordDuelLocked(b));
}

function startEagleCarry(self, e) {
  clearActions(self); self.cheater = null;
  self.dizzy = null; self.slam = null;
  self.vx = 0; self.vy = 0;
  self.invincible = true; self.immuneCd = 9;
  // Carried on along the eagle's line, up and off the screen.
  self.igbb = { move: "eaglecarry", phase: "carry", t: 0, px: self.x, py: self.y, z: 0, dx: e.dx, dy: e.dy, e: e };
  floater(self.x, self.y - self.r - 40, "SNATCHED!", "crit");
  playEagleScreech();
  if (!reduceMotion) { shake = Math.max(shake, 8); hitStop = Math.max(hitStop, 0.05); }
  for (var f = 0; f < 14 && !reduceMotion; f++) {
    var a = Math.random() * Math.PI * 2, sp = 80 + Math.random() * 200;
    particles.push({ x: self.x, y: self.y - self.r * 0.6, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 80, life: 0.7, max: 0.7, size: 3 + Math.random() * 3, color: f % 3 ? "#5a3a1e" : "#ffffff" });
  }
}

function eagleCarryOn(b) { return !!(b.igbb && b.igbb.move === "eaglecarry"); }
// Drawn on his own, over the stands and the jumbotron (drawEagleSky), or
// not at all while he's off screen.
function golfDrawnApart(b) { return eagleCarryOn(b); }

// From the abilities loop, before the special. True while he's away.
function updateEagleCarry(self, other, dt) {
  var m = self.igbb;
  if (!m || m.move !== "eaglecarry") return false;
  m.t += dt;
  self.vx = 0; self.vy = 0; self.immuneCd = 9;
  if (over) { endEagleCarry(self, false); return false; }
  if (m.phase === "carry") {
    // Hauled off along its line, climbing as it goes.
    m.px += m.dx * EC_SPEED * dt; m.py += m.dy * EC_SPEED * dt;
    m.z = EC_CLIMB * m.t + 200 * m.t * m.t;
    if (m.t >= EC_OUT) {
      m.phase = "gone"; m.t = 0;
      if (m.e) m.e.released = true;
      // Coming back down in the middle.
      self.x = W / 2; self.y = H / 2;
    }
  } else if (m.phase === "gone") {
    if (m.t >= EC_GONE) {
      m.phase = "drop"; m.t = 0;
      golfPutHatOn(self); // the eagle's kitted him out
      playWhoosh();
    }
  } else if (m.phase === "drop") {
    var u = Math.min(1, m.t / EC_DROP);
    m.fallY = ddTopY(self.r) + (self.y - ddTopY(self.r)) * u * u; // jon-duck.js
    if (u >= 1) { golfLand(self, other); return false; }
  }
  return true;
}

// Lands in the middle: knocks back anyone close enough to clear himself
// some room, then he's in golf mode.
function golfLand(self, other) {
  var cfg = golfCfg(self).land;
  endEagleCarry(self, true);
  self.squash = { t: 0.24, max: 0.24, nx: 0, ny: 1 };
  if (!reduceMotion) { shake = Math.max(shake, 16); hitStop = Math.max(hitStop, 0.06); }
  playSlam();
  golfRing = { x: self.x, y: self.y, t: 0, R: cfg.radius };
  for (var i = 0; i < 22 && !reduceMotion; i++) {
    var a = Math.random() * Math.PI * 2, sp = 160 + Math.random() * 220;
    particles.push({ x: self.x + Math.cos(a) * self.r * 0.8, y: self.y + self.r * 0.6 + Math.sin(a) * self.r * 0.3, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp * 0.45, life: 0.55, max: 0.55, size: 4 + Math.random() * 5, color: "rgba(190,175,150,0.85)" });
  }
  ["#c8102e", "#ffffff", "#1c2f6e"].forEach(function (c, ci) {
    for (var j = 0; j < 6 && !reduceMotion; j++) {
      var a2 = Math.random() * Math.PI * 2, s2 = 100 + Math.random() * 160;
      particles.push({ x: self.x, y: self.y - self.r, vx: Math.cos(a2) * s2, vy: Math.sin(a2) * s2 - 120, life: 0.8, max: 0.8, size: 3 + ci, color: c });
    }
  });
  var dx = other.x - self.x, dy = other.y - self.y, d = Math.sqrt(dx * dx + dy * dy) || 1;
  if (other.alive && !other.invincible && !other.igbb && d < cfg.radius + other.r) {
    hurt(other, cfg.damage, "igbb", self.id);
    if (other.alive && inOrdinaryMovement(other)) {
      other.vx = dx / d * cfg.knockback; other.vy = dy / d * cfg.knockback;
    }
    other.squash = { t: 0.16, max: 0.16, nx: dx / d, ny: dy / d };
    floater(other.x, other.y - other.r - 40, "BACK OFF!", "note");
    checkEnd();
  }
  startGolfMode(self);
  if (self.alive && !over) startTruckeesAd(self); // the Truck-ee's ad on the jumbotron (truckees-ad.js)
}

function endEagleCarry(self, landed) {
  var m = self.igbb;
  self.igbb = null; self.invincible = false; self.immuneCd = 0;
  if (m && m.e) m.e.released = true;
  setSpeed(self, self.baseSpeed || SPEED);
}

// Under the fighters: where he's going to land (a red ring that fills in
// and his shadow growing as he falls), and the shockwave once he does.
var golfRing = null;
function drawGolfDropUnder() {
  balls.forEach(function (b) { if (b.alive && b.chAct && b.chAct.kind === "golf") drawGolfCone(b, b.chAct); }); // the golf shot's cone
  balls.forEach(function (b) {
    var m = b.igbb;
    if (!eagleCarryOn(b) || (m.phase !== "gone" && m.phase !== "drop")) return;
    var cfg = golfCfg(b).land, k = m.phase === "gone" ? m.t / EC_GONE : 1, now = performance.now() / 1000;
    ctx.save();
    ctx.strokeStyle = "rgba(220,20,20," + (0.6 + 0.3 * Math.sin(now * 16)) + ")"; ctx.lineWidth = 3.5; ctx.setLineDash([12, 8]);
    ctx.beginPath(); ctx.arc(b.x, b.y, cfg.radius, 0, Math.PI * 2); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = "rgba(220,20,20,0.16)";
    ctx.beginPath(); ctx.arc(b.x, b.y, cfg.radius * Math.min(1, k), 0, Math.PI * 2); ctx.fill();
    var f = m.phase === "drop" ? Math.min(1, m.t / EC_DROP) : 0;
    ctx.fillStyle = "rgba(0,0,0," + (0.12 + 0.25 * f) + ")";
    ctx.beginPath(); ctx.ellipse(b.x, b.y + b.r * 0.85, b.r * (0.4 + 0.6 * f), b.r * 0.3 * (0.4 + 0.6 * f), 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  });
  if (golfRing) {
    var g = golfRing, a = 1 - g.t / 0.45;
    ctx.save(); ctx.globalAlpha = Math.max(0, a);
    ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.arc(g.x, g.y + 10, g.R * (0.4 + 0.8 * (1 - a)), 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
  }
}

// Over everything (after the jumbotron): him dangling from the eagle as it
// hauls him off, and him falling back in from the top of the screen.
function drawEagleSky(sc, ox, oy) {
  balls.forEach(function (b) {
    var m = b.igbb;
    if (!eagleCarryOn(b) || !b.alive || m.phase === "gone") return;
    var r = b.r, x, y, flap = performance.now() / 1000 * 22;
    ctx.save();
    ctx.setTransform(sc, 0, 0, sc, ox, oy);
    if (m.phase === "carry") {
      x = m.px; y = m.py - m.z;
      golfDrawFighter(b, x, y, 1, Math.sin(flap * 0.4) * 0.15);
      drawEagle(x, y - r * 0.95, Math.atan2(m.dy, m.dx), 0.6, flap, true); // allamerican.js
    } else {
      x = b.x; y = m.fallY != null ? m.fallY : ddTopY(r);
      var top = ddTopY(r);
      var g = ctx.createLinearGradient(0, top, 0, y);
      g.addColorStop(0, "rgba(255,255,255,0)"); g.addColorStop(1, "rgba(255,255,255,0.75)");
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.moveTo(x - r * 0.8, y); ctx.lineTo(x - r * 0.2, top); ctx.lineTo(x + r * 0.2, top); ctx.lineTo(x + r * 0.8, y); ctx.closePath(); ctx.fill();
      golfDrawFighter(b, x, y, 1.12, 0);
    }
    ctx.restore();
  });
}
// The fighter on his own at (x, y): stretched tall by `st`, swinging by `rot`.
function golfDrawFighter(b, x, y, st, rot) {
  var ch = b.char, r = b.r;
  ctx.save();
  ctx.translate(x, y); ctx.rotate(rot); ctx.scale(1 / Math.sqrt(st), st); ctx.translate(-x, -y);
  if (ch.look) drawFighterArt(ctx, x, y, r, ch.look, theme.wall, { layout: "contained", name: ch.name });
  else { ctx.fillStyle = ch.color; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); }
  ctx.lineWidth = 3; ctx.strokeStyle = theme.wall;
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.stroke();
  // Arms up, hanging on (or flung up as he falls).
  var arm = (ch.punch.size || 15) * 0.75;
  [-1, 1].forEach(function (sd) {
    var shx = x + sd * r * 0.62, shy = y - r * 0.2, hx = x + sd * r * 0.45, hy = y - r * 1.15;
    strokeLimb(arm, armColor(ch), function () { ctx.moveTo(shx, shy); ctx.lineTo(hx, hy); });
    drawGloveAt(hx, hy, r * 0.22, ch);
  });
  ctx.restore();
}

// ---------------------------------------------------------------- golf mode

function startGolfMode(b) {
  var cfg = golfCfg(b);
  if (!cfg || !b.alive) return;
  golfPutHatOn(b);
  b.golfLeft = cfg.duration;
  b.cheater = { mode: "bat", club: true, cd: 0.4, golfCd: 1.2, cfg: { bat: cfg.club, ball: cfg.ball } };
  floater(b.x, b.y - b.r - 40, "GOLF MODE", "crit");
  crowdReact(0.8);
}

function endGolfMode(b, toss) {
  if (!golfing(b)) return;
  b.cheater = null;
  if (b.chAct && (b.chAct.kind === "bat" || b.chAct.kind === "golf")) b.chAct = null;
  if (toss && b.alive) {
    flyingBats.push({ x: b.x, y: b.y - b.r * 0.4, vx: (Math.random() < 0.5 ? -1 : 1) * 260, vy: -760, rot: 0, spin: 14, t: 0, len: weaponLen(b), trail: [], club: true }); // sword.js
    playWhoosh();
  }
}

// Every frame (update.js): the club's clock.
function tickGolf(dt) {
  if (golfRing && (golfRing.t += dt) > 0.45) golfRing = null;
  balls.forEach(function (b) {
    if (!golfing(b)) return;
    if (!b.alive || over) { endGolfMode(b, false); return; }
    // His special takes over: the club goes.
    if (b.igbb || allAmericanOn()) { endGolfMode(b, true); return; }
    b.golfLeft -= dt;
    if (b.golfLeft <= 0 && !b.chAct) endGolfMode(b, true);
  });
}

// The shot itself (from updateCheaterAct, cheater.js): stopped dead, sets
// the ball down, waggles, takes it back and rips it at them.
// He only hits the way he's facing: the opponent has to be inside a cone
// running from him out to the cage on that side (`ball.cone`, the half
// angle in degrees either side of straight across).
function golfInCone(self, other, dir, cfg) {
  var dx = (other.x - self.x) * dir, dy = other.y - self.y;
  if (dx <= 0) return false;
  return Math.abs(Math.atan2(dy, dx)) <= cfg.ball.cone * Math.PI / 180;
}
// The direction the ball goes: at them, kept inside the cone.
function golfAim(self, other, dir, cfg) {
  var lim = cfg.ball.cone * Math.PI / 180;
  var an = Math.atan2(other.y - self.y, (other.x - self.x) * dir);
  an = Math.max(-lim, Math.min(lim, an));
  return { x: Math.cos(an) * dir, y: Math.sin(an) };
}

function updateGolfShot(self, other, a, cfg, dt) {
  self.vx = 0; self.vy = 0;
  // Out of the cone: they get `ball.grace` seconds to come back before he
  // gives up on it (picks the ball back up).
  if (!a.fired) {
    if (!other.alive || golfInCone(self, other, a.dir, cfg)) a.outT = 0;
    else if ((a.outT = (a.outT || 0) + dt) > cfg.ball.grace) {
      self.chAct = null;
      if (self.cheater) self.cheater.golfCd = Math.min(self.cheater.golfCd, 1);
      floater(self.x, self.y - self.r - 40, "NO SHOT", "note");
      return;
    }
  }
  // The ball sits where the club head addresses it (kept with him if he's nudged).
  var g = golfBallSpot(self, a);
  if (!a.fired) { a.bx = g.x; a.by = g.y; }
  if (!a.fired && a.t >= GS_HIT) {
    a.fired = true;
    if (other.alive) {
      var aim = golfAim(self, other, a.dir, cfg);
      cheaterObjs.push({ x: a.bx, y: a.by, vx: aim.x * cfg.ball.speed, vy: aim.y * cfg.ball.speed, rot: 0, spin: 30,
        size: self.r * 0.34, obj: { name: "FORE!", damage: cfg.ball.damage, shape: "golfball", source: "golf" }, ownerId: self.id, trail: [] });
    }
    floater(self.x, self.y - self.r - 40, "FORE!", "crit");
    playGolfPing();
    if (!reduceMotion) { shake = Math.max(shake, 6); hitStop = Math.max(hitStop, 0.03); }
    impacts.push({ x: a.bx, y: a.by, nx: a.dir, ny: 0, life: 0.25, max: 0.25, color: "#ffffff" });
    for (var k = 0; k < 8 && !reduceMotion; k++) { // a tuft of turf
      var pa = -Math.PI / 2 + (Math.random() - 0.5) * 1.4, pv = 90 + Math.random() * 140;
      particles.push({ x: a.bx, y: a.by, vx: Math.cos(pa) * pv, vy: Math.sin(pa) * pv, life: 0.4, max: 0.4, size: 2 + Math.random() * 2, color: k % 2 ? "#6f9a3c" : "#8a6a44" });
    }
  }
  if (a.t >= GS_END) self.chAct = null;
}

// The swing, as a real golf swing for him hitting to screen right (dir 1),
// mirrored for dir -1. `arm` is the angle of his straight arms from between
// his shoulders, `hinge` how far his wrists have cocked the club off that
// line, `shift` his weight moving back and through (in ball radii), `turn`
// his shoulders turning. The club lags behind the hands on the way down and
// the wrists only release at the bottom, so the head whips through the ball.
var GP_ADDRESS = { arm: 1.32, hinge: -0.28, shift: 0, turn: 0 };
var GP_CARRY = { arm: 0.6, hinge: -2.2, shift: 0, turn: 0.05 }; // walking up with the club up by his shoulder
var GP_TOP = { arm: 3.2, hinge: 1.35, shift: -0.14, turn: -0.22 };
var GP_FINISH = { arm: -0.95, hinge: -1.0, shift: 0.16, turn: 0.26 };
function gpMix(p, q, u) { return { arm: p.arm + (q.arm - p.arm) * u, hinge: p.hinge + (q.hinge - p.hinge) * u, shift: p.shift + (q.shift - p.shift) * u, turn: p.turn + (q.turn - p.turn) * u }; }
function golfPose(a, t) {
  var p;
  if (t < GS_ADDRESS) {
    // One smooth move: the club swings down off his shoulder and settles in
    // behind the ball.
    var w = Math.min(1, t / GS_ADDRESS), we = w * w * (3 - 2 * w);
    p = gpMix(GP_CARRY, GP_ADDRESS, we);
  } else if (t < GS_TOP) {
    // Takeaway: low and slow, the arms swinging back and up first, the wrists
    // cocking later, the weight easing onto the back foot.
    var u = (t - GS_ADDRESS) / (GS_TOP - GS_ADDRESS), ue = u * u * (3 - 2 * u);
    p = gpMix(GP_ADDRESS, GP_TOP, ue);
    p.hinge = GP_ADDRESS.hinge + (GP_TOP.hinge - GP_ADDRESS.hinge) * Math.pow(ue, 1.6);
  } else if (t < GS_DOWN) {
    // The little pause at the top, club still drifting back.
    var v0 = (t - GS_TOP) / (GS_DOWN - GS_TOP);
    p = gpMix(GP_TOP, GP_TOP, 0); p.hinge += 0.12 * Math.sin(v0 * Math.PI / 2); p.shift += 0.06 * v0;
  } else if (t < GS_HIT) {
    // Down: hips and arms first, the club held back, then the wrists snap
    // the head through right at the ball.
    var v = (t - GS_DOWN) / (GS_HIT - GS_DOWN);
    var top = gpMix(GP_TOP, GP_TOP, 0); top.hinge += 0.12; top.shift += 0.06;
    p = gpMix(top, GP_ADDRESS, v * v);
    p.hinge = top.hinge + (GP_ADDRESS.hinge - top.hinge) * Math.pow(v, 3.2);
    p.shift = top.shift + (0.1 - top.shift) * Math.min(1, v * 1.6);
  } else {
    // Through to a high finish, wrists rolled over, weight on the front foot.
    var f = Math.min(1, (t - GS_HIT) / (GS_END - GS_HIT - 0.25)), fe = 1 - Math.pow(1 - f, 2.4);
    var imp = { arm: GP_ADDRESS.arm, hinge: GP_ADDRESS.hinge, shift: 0.1, turn: 0.05 };
    p = gpMix(imp, GP_FINISH, fe);
    if (t > GS_END - 0.25) p.shift *= 1 - (t - (GS_END - 0.25)) / 0.25 * 0.6; // and relaxes
  }
  p.dir = a.dir;
  return p;
}
// Where the ball sits: down by his feet, right where the club head rests at
// address, like a real golfer setting up (kept inside the ring).
function golfBallSpot(b, a) {
  var h = golfGrip(b, golfPose(a, GS_ADDRESS)).head, m = b.r * 0.2;
  return { x: Math.max(m, Math.min(W - m, h.x)), y: Math.max(m, Math.min(H - m, h.y)) };
}
// A golf ball stays in the ring: it caroms off the cage, loses pace rolling
// along the mat, and is gone once it stops. After hitting the cage it's
// harmless.
function golfBallWalls(o, dt) {
  var m = o.size * 0.5, hit = false;
  if (o.x < m) { o.x = m; o.vx = Math.abs(o.vx) * 0.5; hit = true; }
  else if (o.x > W - m) { o.x = W - m; o.vx = -Math.abs(o.vx) * 0.5; hit = true; }
  if (o.y < m) { o.y = m; o.vy = Math.abs(o.vy) * 0.5; hit = true; }
  else if (o.y > H - m) { o.y = H - m; o.vy = -Math.abs(o.vy) * 0.5; hit = true; }
  if (hit) {
    if (!o.bounced) { playPunch(3); impacts.push({ x: o.x, y: o.y, nx: 0, ny: 0, life: 0.2, max: 0.2, color: "#ffffff" }); }
    o.bounced = true; o.passed = true;
  }
  if (o.bounced) {
    var k = Math.exp(-3 * dt);
    o.vx *= k; o.vy *= k; o.spin *= k;
    if (o.vx * o.vx + o.vy * o.vy < 40 * 40) o.gone = true;
  }
}
// Where his hands and the club head are for a pose. Arms hang from between
// the shoulders (shifted with his weight), the club runs on from the hands at
// the arm angle plus the wrist hinge.
function golfGrip(b, p) {
  var d = p.dir > 0 ? 1 : -1;
  function A(an) { return d > 0 ? an : Math.PI - an; }
  var r = b.r, len = weaponLen(b);
  var c = { x: b.x + d * p.shift * r, y: b.y - r * 0.12 };
  var aa = A(p.arm), ca = A(p.arm + p.hinge);
  var hand = { x: c.x + Math.cos(aa) * r * 0.6, y: c.y + Math.sin(aa) * r * 0.6 };
  return { hand: hand, ang: ca, head: { x: hand.x + Math.cos(ca) * len * 0.86, y: hand.y + Math.sin(ca) * len * 0.86 }, c: c };
}
// His body through the swing (draw.js adds it to his spot, via ganeBatLean).
function golfLean(b) {
  var a = b.chAct;
  if (!a || a.kind !== "golf") return { x: 0, y: 0 };
  var p = golfPose(a, a.t), d = a.dir > 0 ? 1 : -1;
  return { x: d * p.shift * b.r, y: Math.abs(p.turn) * b.r * 0.08 };
}

// A faint cone out to the cage the way he's facing, while he sets up.
function drawGolfCone(b, a) {
  var cfg = cheaterCfg(b), lim = cfg.ball.cone * Math.PI / 180, d = a.dir > 0 ? 1 : -1;
  var k = a.fired ? Math.max(0, 1 - (a.t - GS_HIT) / 0.2) : Math.min(1, a.t / 0.2);
  if (k <= 0) return;
  ctx.save();
  ctx.beginPath(); ctx.rect(0, 0, W, H); ctx.clip();
  ctx.globalAlpha = 0.5 * k * (a.outT > 0 ? 0.5 + 0.5 * Math.sin(a.t * 30) : 1);
  var base = d > 0 ? 0 : Math.PI, R = W * 1.5;
  var gr = ctx.createRadialGradient(b.x, b.y, b.r, b.x, b.y, W);
  gr.addColorStop(0, "rgba(255,255,255,0.35)"); gr.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = gr;
  ctx.beginPath(); ctx.moveTo(b.x, b.y); ctx.arc(b.x, b.y, R, base - lim, base + lim); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.7)"; ctx.lineWidth = 2; ctx.setLineDash([8, 8]);
  ctx.beginPath();
  ctx.moveTo(b.x, b.y); ctx.lineTo(b.x + Math.cos(base - lim) * R, b.y + Math.sin(base - lim) * R);
  ctx.moveTo(b.x, b.y); ctx.lineTo(b.x + Math.cos(base + lim) * R, b.y + Math.sin(base + lim) * R);
  ctx.stroke();
  ctx.restore();
}

function drawGolfShot(b, a) {
  var p = golfPose(a, a.t), g = golfGrip(b, p), r = b.r;
  var len = weaponLen(b), cs = Math.cos(g.ang), sn = Math.sin(g.ang), d = a.dir > 0 ? 1 : -1;
  // The ball on the ground until he hits it (dropped in at the start).
  if (!a.fired) {
    var drop = Math.max(0, 1 - a.t / GS_SET), bp = golfBallSpot(b, a);
    drawGolfBall(bp.x, bp.y - drop * r * 0.6, r * 0.34, 0);
  }
  var h2 = { x: g.hand.x - cs * len * 0.1, y: g.hand.y - sn * len * 0.1 };
  // Shoulders turn with the swing: the lead one drops as he coils.
  var tl = p.turn * d;
  var shL = { x: b.x - r * 0.62 + tl * r * 0.2, y: b.y - r * 0.28 - tl * r * 0.25 };
  var shR = { x: b.x + r * 0.62 + tl * r * 0.2, y: b.y - r * 0.28 + tl * r * 0.25 };
  var lead = d > 0 ? shL : shR, trail = d > 0 ? shR : shL;
  drawBentArm(b, trail, h2, d);
  drawBentArm(b, lead, g.hand, -d);
  // A blur on the downswing.
  if (a.t >= GS_DOWN && a.t < GS_HIT + 0.1) {
    ctx.save();
    for (var k = 1; k <= 4; k++) {
      ctx.globalAlpha = 0.22 - k * 0.04;
      var pg = golfGrip(b, golfPose(a, a.t - k * 0.018));
      drawClub(pg.hand.x, pg.hand.y, pg.ang, len);
    }
    ctx.restore();
  }
  drawClub(g.hand.x, g.hand.y, g.ang, len);
  drawGloveAt(h2.x, h2.y, r * 0.22, b.char);
  drawGloveAt(g.hand.x, g.hand.y, r * 0.22, b.char);
}

// ---------------------------------------------------------------- drawing

function weaponLen(b) { return b.cheater && b.cheater.saber ? b.r * SABER_LEN : golfing(b) ? b.r * GOLF_CLUB_LEN : b.r * 1.6; }
// The bat, or the club when it's Gaethje's.
function drawWeapon(b, x, y, a, len) {
  if (b.cheater && b.cheater.saber) drawSaber(x, y, a, len, saberIgnite(b)); // Hokit's lightsaber (hokit-darkside.js)
  else if (golfing(b)) drawClub(x, y, a, len); else drawBat(x, y, a, len);
}

// Joe's driver, held at the grip at (x, y) and pointing along `a`.
function drawClub(x, y, a, len) {
  if (!(golfClubImg.complete && golfClubImg.naturalWidth)) { drawBat(x, y, a, len); return; }
  var G = GOLF_CLUB_GRIP, H = GOLF_CLUB_HEAD;
  var ax = H.x - G.x, ay = H.y - G.y, alen = Math.sqrt(ax * ax + ay * ay), aang = Math.atan2(ay, ax);
  var sc = len / alen, hold = 0.1; // held a little down from the end of the grip
  ctx.save();
  ctx.translate(x, y); ctx.rotate(a);
  ctx.scale(sc, sc * GOLF_CLUB_THICK * (Math.cos(a) < 0 ? -1 : 1)); // (flipped so the face of the head leads the swing)
  ctx.rotate(-aang);
  // Keeps the head's face toward the way it's swung (flips it when it's pointing left).
  ctx.drawImage(golfClubImg, -(G.x + ax * hold), -(G.y + ay * hold));
  ctx.restore();
}

function drawGolfBall(x, y, s, rot) {
  if (!(golfBallImg.complete && golfBallImg.naturalWidth)) {
    ctx.fillStyle = "#ffffff"; ctx.strokeStyle = theme.wall; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(x, y, s / 2, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    return;
  }
  ctx.save();
  ctx.translate(x, y); ctx.rotate(rot);
  ctx.drawImage(golfBallImg, -s / 2, -s / 2, s, s);
  ctx.restore();
  ctx.save();
  ctx.strokeStyle = "rgba(0,0,0,0.35)"; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.arc(x, y, s / 2, 0, Math.PI * 2); ctx.stroke();
  ctx.restore();
}

// His golf look: the trucker hat Joe approved (`golf.hat`, drawn by
// fighter-art.js as look.headwear "trucker"), put on his own copy of the
// character so it stays on for the rest of the fight.
function golfPutHatOn(b) {
  var hat = golfCfg(b) && golfCfg(b).hat;
  if (!hat || b.golfHat) return;
  b.golfHat = true;
  b.char = Object.assign({}, b.char, { look: Object.assign({}, b.char.look, hat) });
}
