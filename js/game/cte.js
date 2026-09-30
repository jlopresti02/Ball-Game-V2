// CTE's abilities.
//
// Swing: whenever an opponent is in the general vicinity, CTE winds up a big
// telegraphed hook, tracking them while the arm is cocked out wide. At the
// end of the windup it commits to a direction (with some aim error) and the
// fist sweeps around in an arc at a fixed reach, so if the opponent moved or
// was too far away, it whiffs. After the throw the arm hangs extended for a moment (an
// opening for the opponent), then retracts, and the next swing can start
// immediately: there's no cooldown. CTE stalks in while winding up, steps
// into the punch as it's thrown, and shuffles slowly while stuck extended.
//
// Forget: every few seconds CTE forgets some of the damage it's taken and
// regains health.
"use strict";

var SWING_STRIKE_TIME = 0.16;  // how long the hook takes to sweep around
var SWING_FIST_R = 15;         // fist size, which is also its hit area
var SWING_STALK = 0.5;         // share of normal speed while stalking in during the windup
var SWING_SHUFFLE = 0.35;      // share of normal speed while stuck extended
var SWING_LUNGE = 420;         // speed of the step into the hook as it's thrown
var SWING_KNOCKBACK = 300;
var HOOK_OPEN = 100 * Math.PI / 180;    // how far out to the side the hook starts
var HOOK_FOLLOW = 40 * Math.PI / 180;   // how far past the target it follows through

function swingFistDist(self) {
  return self.r + self.char.swing.reach;
}

// Where the fist is at a point k (0 to 1) through the hook: it starts wide
// out to the side, sweeps around through the aim and follows through across.
function hookFist(self, st, k) {
  var e = k * k * (3 - 2 * k);
  var a0 = st.ang - st.side * HOOK_OPEN, a1 = st.ang + st.side * HOOK_FOLLOW;
  var a = a0 + (a1 - a0) * e;
  var R = swingFistDist(self) * (0.72 + 0.28 * Math.min(1, k / 0.35)); // arm straightens as it comes around
  return { x: self.x + Math.cos(a) * R, y: self.y + Math.sin(a) * R, a: a };
}

function updateSwing(self, other, dt) {
  var sw = self.char.swing;
  var st = self.swing;
  var dx = other.x - self.x, dy = other.y - self.y, d = Math.sqrt(dx * dx + dy * dy) || 1;

  if (!st) {
    // Starts a hook at anyone in the general vicinity, no cooldown,
    // alternating left and right.
    if (other.alive && !other.invincible && d - self.r - other.r < sw.vicinity) {
      self.hookSide = -(self.hookSide || -1);
      self.swing = { phase: "windup", t: 0, ang: Math.atan2(dy, dx), side: self.hookSide, hit: false, k: 0 };
    }
    return;
  }

  st.t += dt;
  if (st.phase === "extend") setSpeed(self, SPEED * SWING_SHUFFLE);

  if (st.phase === "windup") {
    // Keeps watching the opponent and stalks in while the arm is cocked out wide.
    if (other.alive) st.ang = Math.atan2(dy, dx);
    self.vx = Math.cos(st.ang) * SPEED * SWING_STALK;
    self.vy = Math.sin(st.ang) * SPEED * SWING_STALK;
    if (st.t >= sw.windup) {
      // Commits: the aim is a guess, and the reach is fixed.
      st.ang += (Math.random() * 2 - 1) * sw.aimError * Math.PI / 180;
      st.phase = "strike"; st.t = 0; st.k = 0;
      playWhoosh();
    }
    return;
  }

  if (st.phase === "strike") {
    // Steps into the hook along the committed aim.
    self.vx = Math.cos(st.ang) * SWING_LUNGE;
    self.vy = Math.sin(st.ang) * SWING_LUNGE;
    var kPrev = st.k, k = Math.min(1, st.t / SWING_STRIKE_TIME);
    st.k = k;
    // Checks several points along this frame's stretch of the arc so a fast
    // sweep can't skip over the opponent.
    for (var i = 1; i <= 4 && !st.hit && other.alive; i++) {
      var f = hookFist(self, st, kPrev + (k - kPrev) * i / 4);
      var ox = other.x - f.x, oy = other.y - f.y;
      if (ox * ox + oy * oy < (other.r + SWING_FIST_R) * (other.r + SWING_FIST_R)) {
        st.hit = true;
        var dealt = hurt(other, sw.damage, "swing", self.id);
        if (dealt > 0) {
          playPunch(dealt);
          if (!other.justDodged && !other.grappled) {
            // Knocked sideways along the sweep, and a bit away.
            var rx = Math.cos(f.a), ry = Math.sin(f.a);
            var tx = -ry * st.side, ty = rx * st.side;
            var kx = rx * 0.6 + tx, ky = ry * 0.6 + ty, kl = Math.sqrt(kx * kx + ky * ky) || 1;
            other.vx += kx / kl * SWING_KNOCKBACK;
            other.vy += ky / kl * SWING_KNOCKBACK;
          }
          if (!reduceMotion) shake = Math.max(shake, 10);
        }
        checkEnd();
      }
    }
    if (st.t >= SWING_STRIKE_TIME) {
      if (!st.hit) { var end = hookFist(self, st, 1); floater(end.x, end.y - 20, "MISS", "dodge"); }
      st.phase = "extend"; st.t = 0;
    }
    return;
  }

  if (st.phase === "extend") {
    if (st.t >= sw.extend) { st.phase = "recover"; st.t = 0; }
    return;
  }

  // recover: the arm comes back, then the next hook can start right away.
  if (st.t >= sw.recover) self.swing = null;
}

function updateForget(b, dt) {
  if (!b.char.hasForget || !b.alive || over) return;
  var fg = b.char.forget;
  b.forgetT = (b.forgetT || 0) + dt;
  if (b.forgetT < fg.every) return;
  b.forgetT -= fg.every;
  var gain = Math.min(fg.heal, MAX_HP - b.hp);
  if (gain <= 0) return;
  b.hp += gain;
  b.healGlow = 0.7;
  floater(b.x, b.y - b.r - 8, "+" + Math.round(gain * 100) / 100, "heal");
  playForget();
}

// The hooking arm. During the windup it's cocked out wide to the side with
// a dashed arc showing the sweep and a ring on the aim point (the telegraph);
// then it sweeps around, hangs across the body on the follow-through, and
// comes back. The other hand stays up as a guard.
function drawSwing(self) {
  var st = self.swing;
  if (!st || !self.alive) return;
  var sw = self.char.swing, r = self.r;
  var R = swingFistDist(self);
  var fist, trail = [];
  if (st.phase === "windup") {
    var w = Math.min(1, st.t / sw.windup);
    var ca = st.ang - st.side * (HOOK_OPEN + 0.25 * w); // coils further back
    var cr = r * (1.25 - 0.2 * w);
    fist = { x: self.x + Math.cos(ca) * cr, y: self.y + Math.sin(ca) * cr, a: ca };
  } else if (st.phase === "strike") {
    fist = hookFist(self, st, st.k);
    [0.12, 0.24, 0.36].forEach(function (back) {
      if (st.k - back > 0) trail.push(hookFist(self, st, st.k - back));
    });
  } else if (st.phase === "extend") {
    fist = hookFist(self, st, 1);
  } else {
    var e = hookFist(self, st, 1), q = Math.min(1, st.t / sw.recover);
    var rx = self.x + Math.cos(st.ang) * r * 0.8, ry = self.y + Math.sin(st.ang) * r * 0.8;
    fist = { x: e.x + (rx - e.x) * q, y: e.y + (ry - e.y) * q };
  }
  var shA = st.ang - st.side * Math.PI / 2;
  var sx = self.x + Math.cos(shA) * r * 0.55, sy = self.y + Math.sin(shA) * r * 0.55;

  ctx.save();
  ctx.lineCap = "round";
  if (st.phase === "windup") {
    // Telegraph: the path the hook will sweep, and where it's aimed.
    var w2 = Math.min(1, st.t / sw.windup);
    var a0 = st.ang - st.side * HOOK_OPEN, a1 = st.ang + st.side * HOOK_FOLLOW;
    ctx.setLineDash([7, 6]);
    ctx.globalAlpha = 0.35 + 0.55 * w2;
    ctx.strokeStyle = theme.hit;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(self.x, self.y, R, Math.min(a0, a1), Math.max(a0, a1));
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(self.x + Math.cos(st.ang) * R, self.y + Math.sin(st.ang) * R, SWING_FIST_R + 2, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.globalAlpha = 1;
  }
  // Blur of the fist sweeping around.
  trail.forEach(function (t, i) {
    ctx.globalAlpha = 0.3 - i * 0.08;
    ctx.fillStyle = self.char.color;
    ctx.beginPath(); ctx.arc(t.x, t.y, SWING_FIST_R * 0.9, 0, Math.PI * 2); ctx.fill();
  });
  ctx.globalAlpha = 1;
  // Arm from the shoulder to the fist.
  ctx.strokeStyle = theme.wall; ctx.lineWidth = SWING_FIST_R * 0.9 + 6;
  ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(fist.x, fist.y); ctx.stroke();
  ctx.strokeStyle = self.char.color; ctx.lineWidth = SWING_FIST_R * 0.6;
  ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(fist.x, fist.y); ctx.stroke();
  // Trembles while it's cocked back.
  var jx = 0, jy = 0;
  if (st.phase === "windup") { jx = (Math.random() - 0.5) * 2.5; jy = (Math.random() - 0.5) * 2.5; }
  ctx.fillStyle = self.char.color; ctx.strokeStyle = theme.wall; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(fist.x + jx, fist.y + jy, SWING_FIST_R, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  // The other hand stays up guarding on the opposite side.
  var ga = st.ang + st.side * 0.9;
  ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.arc(self.x + Math.cos(ga) * r * 0.85, self.y + Math.sin(ga) * r * 0.85, r * 0.3, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.restore();
}
