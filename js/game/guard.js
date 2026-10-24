// Guard: a BJJ fighter who gets hit can fall onto its back and play guard.
//
// When a strike lands on a fighter with the guard, there's a `chance`% it
// drops onto its back in guard instead of staying on its feet. It's planted
// there for `time` seconds with a circle of `radius` around it; whoever hit
// it is shoved back out of the circle first. The first time the opponent
// steps into the circle, it's a coin flip (passChance%):
//   - Guard passed: the opponent gets on top for passPunches free
//     ground-and-pound punches of passDamage each.
//   - Caught: the guard player snatches a submission, picked at random from
//     `subs`. For now that's only the guillotine (bjj.js), as a placeholder
//     until the guard's own submissions are designed.
// If nobody steps in before the time's up, it gets back to its feet. Either
// way it can't pull guard again for `cooldown` seconds once it's up.
"use strict";

var GUARD_GETUP_SPEED = 220;

// Strikes that can knock it down into guard (not grabs, slams, specials or
// anything that's already moving it around).
var GUARD_SOURCES = { punch: true, kick: true, kickback: true, swing: true, proj: true, combo: true };

// Starts a guard submission on `atk`. Each entry in `subs` names one.
var GUARD_SUBS = {
  guillotine: function (self, atk) { beginGuillotine(self, atk); }
};

// Called from hurt() after a hit lands.
function tryPullGuard(b, source, attackerId) {
  if (!b.char.hasGuard || !GUARD_SOURCES[source] || b.guardCd > 0 || attackerId == null) return;
  var atk = balls[attackerId];
  if (!atk || !atk.alive || specialBusy(b) || specialBusy(atk) || b.invincible) return;
  if (Math.random() >= b.char.guard.chance / 100) return;
  beginGuard(b, atk);
}

function beginGuard(b, atk) {
  var gd = b.char.guard;
  clearActions(b);
  clearActions(atk);
  b.vx = 0; b.vy = 0;
  b.guard = {
    t: 0, dur: gd.time, radius: gd.radius,
    side: atk.x >= b.x ? 1 : -1,  // legs up toward the opponent
    armed: false                   // the opponent has to be outside the circle before it can step in
  };
  b.guardCd = gd.cooldown;
  // Whoever knocked it down backs off out of the circle.
  var dx = atk.x - b.x, dy = atk.y - b.y, d = Math.sqrt(dx * dx + dy * dy) || 1;
  var out = gd.radius + 6;
  atk.x = b.x + dx / d * out; atk.y = b.y + dy / d * out;
  atk.vx = dx / d * SPEED; atk.vy = dy / d * SPEED;
  b.squash = { t: 0.18, max: 0.18, nx: 0, ny: -1 };
  floater(b.x, b.y - b.r - 30, "GUARD", "crit");
  playSlam();
  if (!reduceMotion) shake = Math.max(shake, 8);
}

// Runs on the guard player each frame while it's on its back.
function updateGuard(self, other, dt) {
  var g = self.guard;
  self.vx = 0; self.vy = 0;
  g.t += dt;
  if (g.t >= g.dur || !other.alive) { endGuard(self, "STANDS UP"); return; }
  var dx = other.x - self.x, dy = other.y - self.y, d = Math.sqrt(dx * dx + dy * dy);
  if (d >= g.radius) { g.armed = true; return; }
  // Only an opponent that's free to engage steps in (not one flying off a
  // slam, sitting in a seat, mid special and so on).
  if (!g.armed || other.invincible || other.slam || specialBusy(other)) return;
  clearActions(other);
  if (Math.random() < self.char.guard.passChance / 100) passGuard(self, other, g);
  else catchInGuard(self, other);
}

function endGuard(self, text) {
  self.guard = null;
  if (text) floater(self.x, self.y - self.r - 30, text, "note");
  var a = Math.random() * Math.PI * 2;
  self.vx = Math.cos(a) * GUARD_GETUP_SPEED; self.vy = Math.sin(a) * GUARD_GETUP_SPEED;
}

// Guard passed: the opponent climbs on top and gets free ground and pound.
// This uses the guillotine's ground-and-pound (bjj.js), straight from the
// mount, with the guard player still flat on its back underneath.
function passGuard(self, atk, g) {
  var gd = self.char.guard;
  self.guard = null;
  self.guillo = {
    atkId: atk.id, t: 0, phase: "mount", fromGuard: true, side: g.side,
    nx: g.side, ny: 0, mx: atk.x, my: atk.y, dir: g.side,
    hits: Array.apply(null, Array(Math.max(1, gd.passPunches))).map(function () { return gd.passDamage; })
  };
  atk.choked = true;
  atk.vx = 0; atk.vy = 0;
  floater((self.x + atk.x) / 2, Math.min(self.y, atk.y) - self.r - 30, "GUARD PASSED", "crit");
  playWhoosh();
}

// Caught: pulls the opponent in and goes for a submission.
function catchInGuard(self, atk) {
  var subs = self.char.guard.subs.filter(function (s) { return GUARD_SUBS[s]; });
  self.guard = null;
  floater(self.x, self.y - self.r - 60, "CAUGHT", "note");
  GUARD_SUBS[subs.length ? subs[Math.floor(Math.random() * subs.length)] : "guillotine"](self, atk);
}

// Flat on its back: in guard, or underneath after the guard's been passed.
function onBack(b) {
  if (b.guard) return b.guard.side;
  if (b.guillo && b.guillo.fromGuard && (b.guillo.phase === "mount" || b.guillo.phase === "pound")) return b.guillo.side;
  return 0;
}

// Lays the ball on its back, head away from the opponent and hips toward
// it. Called with the canvas already set up for that fighter.
function applyGuardPose(b) {
  var side = onBack(b);
  if (!side) return;
  ctx.translate(b.x, b.y);
  ctx.rotate(-side * Math.PI / 2);
  ctx.translate(-b.x, -b.y);
}

// The guard circle (with a ring that drains as the time runs out), drawn on
// the floor under the fighters.
function drawGuardZones() {
  balls.forEach(function (b) {
    var g = b.guard;
    if (!g || !b.alive) return;
    var left = Math.max(0, 1 - g.t / g.dur);
    ctx.save();
    ctx.globalAlpha = 0.12;
    ctx.fillStyle = b.char.color;
    ctx.beginPath(); ctx.arc(b.x, b.y, g.radius, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 0.85;
    ctx.setLineDash([10, 8]);
    ctx.lineDashOffset = -g.t * 30;
    ctx.lineWidth = 3;
    ctx.strokeStyle = b.char.color;
    ctx.beginPath(); ctx.arc(b.x, b.y, g.radius, 0, Math.PI * 2); ctx.stroke();
    ctx.setLineDash([]);
    ctx.lineCap = "round";
    ctx.lineWidth = 5;
    ctx.beginPath(); ctx.arc(b.x, b.y, g.radius + 7, -Math.PI / 2, -Math.PI / 2 + left * Math.PI * 2); ctx.stroke();
    ctx.restore();
  });
}

// Both legs up in guard toward the opponent, feet pedalling a little.
function drawGuardLegs(b) {
  var g = b.guard;
  if (!g || !b.alive) return;
  var s = g.side, r = b.r, look = b.char.look;
  var skin = look ? look.skin : b.char.color, shorts = look ? look.shorts : b.char.color;
  ctx.save();
  [-1, 1].forEach(function (k, i) {
    var pedal = reduceMotion ? 0 : Math.sin(g.t * 6 + i * Math.PI) * r * 0.12;
    var hipX = b.x + s * r * 0.55, hipY = b.y + k * r * 0.35;
    var kneeX = b.x + s * r * 1.15, kneeY = b.y + k * r * 0.62 - r * 0.55 + pedal;
    var footX = b.x + s * r * 1.5 + pedal * 0.5, footY = b.y + k * r * 0.3 - r * 0.95;
    strokeLimb(r * 0.3, skin, function () {
      ctx.moveTo(hipX, hipY); ctx.lineTo(kneeX, kneeY); ctx.lineTo(footX, footY);
    });
    // Shorts over the thigh
    strokeLimb(r * 0.36, shorts, function () {
      ctx.moveTo(hipX, hipY); ctx.lineTo(hipX + (kneeX - hipX) * 0.45, hipY + (kneeY - hipY) * 0.45);
    });
    ctx.fillStyle = skin; ctx.strokeStyle = theme.wall; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.ellipse(footX, footY, r * 0.2, r * 0.13, -s * 0.5, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  });
  ctx.restore();
}
