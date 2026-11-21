// Suplex. When a fighter with the suplex grabs an opponent from behind (the
// opponent isn't facing it), `chance`% of the time it throws a back suplex
// instead of its normal grab: it locks its arms round their waist, arches
// back and lifts them up over its own head, then slams them down head first
// on the other side for `damage`. Afterwards it can't suplex again for
// `cooldown` seconds. Khabib and wrestlers get this one.
"use strict";

var SUPLEX_LOCK_TIME = 0.3;   // locking the arms round their waist
var SUPLEX_LIFT_TIME = 0.55;  // up and over its head
var SUPLEX_DOWN_TIME = 0.35;  // left lying head first after the slam
// More power (Joe, 2026-11-21): he sinks his hips as he locks on, explodes up
// and over in a high arc that speeds up into the mat (ghost trail behind
// them), holds the bridge after the slam while they bounce, and the landing
// sends out a shockwave ring, dust, cracks in the mat, a white flash, a big
// SUPLEX! and a heavy thud. All drawing only: the throw's timing, damage and
// the fight's random numbers are unchanged, so saved fights replay the same.
var SUPLEX_ARC_H = 1.45;      // how high over his head they go (x reach), was 1.25
var sxFx = [];                // landings still showing: {x, y, side, t0, sounded}
function suplexEase(k) { return Math.pow(k, 1.8); } // slow off the floor, fastest into it

function canSuplex(self) {
  if (!self.char.hasSuplex || !self.alive || self.suplexCd > 0) return false;
  return !(self.koOut || self.shocked || self.shelled || self.igbb || self.koRush || self.koDuel ||
    self.slam || self.combo || self.taunt || self.flow || self.grapple || subLocked(self));
}

// Called from attemptGrab: true if the grab became a suplex.
function trySuplex(attacker, target) {
  if (!canSuplex(attacker) || isFacing(target, attacker)) return false;
  if (Math.random() >= attacker.char.suplex.chance / 100) return false;
  beginSuplex(attacker, target);
  return true;
}

function beginSuplex(self, vic) {
  var side = vic.x >= self.x ? 1 : -1;
  // Room to throw them over to the other side, or it turns round.
  var reach = (self.r + vic.r) * 0.8;
  if (self.x - side * reach < vic.r || self.x - side * reach > W - vic.r) side = -side;
  self.suplex = { vicId: vic.id, t: 0, phase: "lock", side: side, reach: reach };
  vic.choked = true;
  [self, vic].forEach(function (b) {
    b.vx = 0; b.vy = 0;
    b.punch = null; b.kick = null; b.throwAnim = null; b.swing = null; b.checkAnim = null;
  });
  // Room above it to lift them.
  self.y = Math.max(self.y, reach * 1.25 + vic.r + 4);
  floater(self.x, self.y - self.r - 60, "SUPLEX", "crit");
  playWhoosh();
}

// Runs on the fighter throwing it; the one thrown is carried along.
function updateSuplex(self, dt) {
  var c = self.suplex, vic = balls[c.vicId];
  if (!self.alive || !vic.alive) { endSuplex(self); return; }
  c.t += dt;
  self.vx = 0; self.vy = 0; vic.vx = 0; vic.vy = 0;
  var s = c.side, k;
  if (c.phase === "lock") {
    // Pulls them in tight, its chest to their back.
    k = Math.min(1, c.t / SUPLEX_LOCK_TIME);
    vic.x = self.x + s * c.reach; vic.y = self.y;
    if (k >= 1) { c.phase = "lift"; c.t = 0; playWhoosh(); }
    return;
  }
  if (c.phase === "lift") {
    // Up and over in an arc, speeding up into the floor.
    k = Math.min(1, c.t / SUPLEX_LIFT_TIME);
    var e = suplexEase(k), ang = Math.PI * e;
    vic.x = self.x + s * Math.cos(ang) * c.reach;
    vic.y = self.y - Math.sin(ang) * c.reach * SUPLEX_ARC_H;
    if (k < 1) return;
    sxFx.push({ x: vic.x, y: vic.y + vic.r * 0.6, side: s, r: vic.r, t0: performance.now() / 1000, sounded: false }); // the landing (drawSuplexes)
    fpImpact(self, vic, { nx: 0, ny: -1 }, self.char.suplex.damage, true);
    if (typeof recordTakedown === "function") recordTakedown(self.id);
    floater(vic.x, vic.y - vic.r - 30, "TAKEDOWN", "note");
    commentaryCall("suplex", self, vic); // "Did that just suplex him?" (commentary-calls.js)
    c.phase = "down"; c.t = 0;
    checkEnd();
    return;
  }
  if (c.t >= SUPLEX_DOWN_TIME) {
    // Lets go and both scramble back up.
    endSuplex(self);
    self.suplexCd = self.char.suplex.cooldown;
    self.grappleCd = self.char.grapple ? self.char.grapple.cooldown : 0;
    vic.vx = -s * SPEED * 0.6; vic.vy = SPEED * 0.2;
    self.vx = s * SPEED * 0.4; self.vy = -SPEED * 0.2;
  }
}

function endSuplex(self) {
  if (!self.suplex) return;
  balls[self.suplex.vicId].choked = false;
  self.suplex = null;
}

// How far through the throw it is: 0 locked on, 1 slammed down.
function suplexArc(c) {
  if (c.phase === "lock") return 0;
  if (c.phase === "down") return 1;
  return suplexEase(Math.min(1, c.t / SUPLEX_LIFT_TIME));
}

// The thrower arches back, and the one thrown flips over head first.
function applySuplexPose(b) {
  var c = b.suplex, angle;
  if (c) {
    if (c.phase === "lock") angle = c.side * 0.18 * Math.sin(Math.PI * 0.5 * Math.min(1, c.t / SUPLEX_LOCK_TIME)); // sinks in, chest to their back
    else if (c.phase === "down") angle = -c.side * 0.95 * Math.max(0, 1 - Math.max(0, c.t - 0.15) / 0.2); // holds the bridge, then up
    else angle = c.side * 0.18 * (1 - Math.min(1, c.t / 0.08)) - c.side * 0.95 * Math.sin(Math.PI * 0.5 * Math.min(1, suplexArc(c) * 1.4)); // whips back into a full arch
  } else {
    if (!b.choked) return;
    c = balls[1 - b.id].suplex;
    if (!c) return;
    angle = -c.side * Math.PI * suplexArc(c);
    if (c.phase === "down") { // bounces off the mat
      var bt = c.t, hop = bt < 0.22 ? Math.sin(Math.PI * bt / 0.22) * b.r * 0.35 : 0;
      ctx.translate(0, -hop);
    }
  }
  ctx.translate(b.x, b.y);
  ctx.rotate(angle);
  ctx.translate(-b.x, -b.y);
}

// Its arms locked round their waist until the slam.
function drawSuplexes() {
  drawSuplexLandings();
  balls.forEach(function (self) {
    var c = self.suplex;
    if (!c || c.phase === "down") return;
    var vic = balls[c.vicId], r = self.r, skin = armColor(self.char);
    if (c.phase === "lift" && !reduceMotion) drawSuplexTrail(self, vic, c);
    var dx = vic.x - self.x, dy = vic.y - self.y, d = Math.sqrt(dx * dx + dy * dy) || 1;
    var ux = dx / d, uy = dy / d, px = -uy, py = ux;
    ctx.save();
    [-1, 1].forEach(function (k) {
      var sh = { x: self.x + ux * r * 0.3 + px * k * r * 0.75, y: self.y + uy * r * 0.3 + py * k * r * 0.75 };
      var hand = { x: vic.x - ux * vic.r * 0.15 + px * k * vic.r * 0.22, y: vic.y - uy * vic.r * 0.15 + py * k * vic.r * 0.22 };
      strokeLimb(r * 0.2, skin, function () {
        ctx.moveTo(sh.x, sh.y);
        ctx.quadraticCurveTo(vic.x - ux * vic.r * 0.6 + px * k * vic.r * 0.95, vic.y - uy * vic.r * 0.6 + py * k * vic.r * 0.95, hand.x, hand.y);
      });
      drawGloveAt(hand.x, hand.y, r * 0.22, self.char);
    });
    ctx.restore();
  });
}

// Behind them on the way over: ghosts of where they just were.
function drawSuplexTrail(self, vic, c) {
  var k = Math.min(1, c.t / SUPLEX_LIFT_TIME);
  ctx.save();
  for (var i = 1; i <= 4; i++) {
    var kk = Math.max(0, k - i * 0.06), ang = Math.PI * suplexEase(kk);
    var x = self.x + c.side * Math.cos(ang) * c.reach, y = self.y - Math.sin(ang) * c.reach * SUPLEX_ARC_H;
    ctx.globalAlpha = (0.32 - i * 0.07) * Math.min(1, k * 3);
    ctx.fillStyle = vic.char.color || "#ffffff";
    ctx.beginPath(); ctx.arc(x, y, vic.r * (1 - i * 0.06), 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

// The landing: a white flash, a shockwave ring, dust kicked out both ways,
// cracks in the mat and a big SUPLEX!, with the heavy thud (played from here
// so the fight's own random numbers aren't touched).
function drawSuplexLandings() {
  if (!sxFx.length) return;
  var now = performance.now() / 1000;
  sxFx = sxFx.filter(function (f) { return now - f.t0 < 1.1 && now >= f.t0 - 0.05; });
  sxFx.forEach(function (f) {
    var t = Math.max(0, now - f.t0), R = f.r;
    if (!f.sounded) { f.sounded = true; if (typeof playTossLand === "function") playTossLand(); }
    ctx.save();
    if (t < 0.12) { ctx.fillStyle = "rgba(255,255,255," + (0.45 * (1 - t / 0.12)).toFixed(3) + ")"; ctx.fillRect(0, 0, W, H); }
    // cracks
    var ca = Math.min(1, t / 0.06) * Math.max(0, 1 - Math.max(0, t - 0.6) / 0.5);
    ctx.strokeStyle = "rgba(40,28,20," + (0.55 * ca).toFixed(3) + ")"; ctx.lineWidth = 3; ctx.lineCap = "round";
    for (var i = 0; i < 7; i++) {
      var a = -Math.PI + (i + 0.5) / 7 * Math.PI * 2, len = R * (1.1 + 0.5 * ((i * 37) % 5) / 5);
      ctx.beginPath(); ctx.moveTo(f.x, f.y);
      ctx.lineTo(f.x + Math.cos(a + 0.2) * len * 0.5, f.y + Math.sin(a + 0.2) * len * 0.3);
      ctx.lineTo(f.x + Math.cos(a) * len, f.y + Math.sin(a) * len * 0.55);
      ctx.stroke();
    }
    // shockwave rings
    [0, 0.08].forEach(function (d, j) {
      var tt = t - d; if (tt <= 0 || tt > 0.5) return;
      var rr = R * (0.6 + tt * 6), al = (1 - tt / 0.5) * (j ? 0.5 : 0.85);
      ctx.strokeStyle = "rgba(255,255,255," + al.toFixed(3) + ")"; ctx.lineWidth = (j ? 4 : 8) * (1 - tt / 0.5) + 1;
      ctx.beginPath(); ctx.ellipse(f.x, f.y, rr, rr * 0.45, 0, 0, Math.PI * 2); ctx.stroke();
    });
    // dust thrown out both ways
    if (t < 0.9) {
      for (var q = 0; q < 12; q++) {
        var dir = q % 2 ? 1 : -1, sp = 0.6 + ((q * 53) % 7) / 7, up = ((q * 29) % 5) / 5;
        var dx = f.x + dir * R * (0.4 + t * 3.2 * sp), dy = f.y - R * up * 0.6 * Math.sin(Math.min(1, t * 2) * Math.PI) - t * 10;
        ctx.fillStyle = "rgba(205,190,165," + (0.6 * (1 - t / 0.9)).toFixed(3) + ")";
        ctx.beginPath(); ctx.arc(dx, dy, R * (0.18 + 0.35 * t) * (0.7 + up * 0.5), 0, Math.PI * 2); ctx.fill();
      }
    }
    // SUPLEX!
    if (t < 0.85) {
      var pop = t < 0.12 ? 0.4 + 0.9 * (t / 0.12) : t < 0.2 ? 1.3 - 0.3 * ((t - 0.12) / 0.08) : 1;
      ctx.globalAlpha = Math.min(1, (0.85 - t) / 0.2);
      ctx.translate(f.x, f.y - R * 2.7); ctx.rotate(-f.side * 0.08); ctx.scale(pop, pop);
      ctx.font = "900 46px Impact, \"Arial Black\", sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.lineJoin = "round";
      ctx.lineWidth = 9; ctx.strokeStyle = "#000"; ctx.strokeText("SUPLEX!", 0, 0);
      ctx.fillStyle = "#ffd23f"; ctx.fillText("SUPLEX!", 0, 0);
    }
    ctx.restore();
  });
}
