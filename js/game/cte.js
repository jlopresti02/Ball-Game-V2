// CTE's abilities.
//
// Swing: whenever an opponent is in the general vicinity, CTE winds up a big
// telegraphed punch, tracking them while the fist is cocked back. At the end
// of the windup it commits to a direction (with some aim error) and throws.
// The fist travels a fixed reach, so if the opponent moved or was too far
// away, it whiffs. After the throw the arm hangs extended for a moment (an
// opening for the opponent), then retracts, and the next swing can start
// immediately: there's no cooldown. CTE stalks in while winding up, steps
// into the punch as it's thrown, and shuffles slowly while stuck extended.
//
// Forget: every few seconds CTE forgets some of the damage it's taken and
// regains health.
"use strict";

var SWING_STRIKE_TIME = 0.08;  // how fast the fist shoots out
var SWING_FIST_R = 15;         // fist size, which is also its hit area
var SWING_STALK = 0.5;         // share of normal speed while stalking in during the windup
var SWING_SHUFFLE = 0.35;      // share of normal speed while stuck extended
var SWING_LUNGE = 520;         // speed of the step into the punch as it's thrown
var SWING_KNOCKBACK = 260;

function swingFistDist(self) {
  return self.r + self.char.swing.reach;
}

function updateSwing(self, other, dt) {
  var sw = self.char.swing;
  var st = self.swing;
  var dx = other.x - self.x, dy = other.y - self.y, d = Math.sqrt(dx * dx + dy * dy) || 1;

  if (!st) {
    // Starts a swing at anyone in the general vicinity, no cooldown.
    if (other.alive && !other.invincible && d - self.r - other.r < sw.vicinity) {
      self.swing = { phase: "windup", t: 0, ang: Math.atan2(dy, dx), hit: false };
    }
    return;
  }

  st.t += dt;
  if (st.phase === "extend") setSpeed(self, SPEED * SWING_SHUFFLE);

  if (st.phase === "windup") {
    // Keeps watching the opponent and stalks in while the fist is cocked back.
    if (other.alive) st.ang = Math.atan2(dy, dx);
    self.vx = Math.cos(st.ang) * SPEED * SWING_STALK;
    self.vy = Math.sin(st.ang) * SPEED * SWING_STALK;
    if (st.t >= sw.windup) {
      // Commits: the aim is a guess, and the reach is fixed.
      st.ang += (Math.random() * 2 - 1) * sw.aimError * Math.PI / 180;
      st.phase = "strike"; st.t = 0;
      playWhoosh();
    }
    return;
  }

  if (st.phase === "strike") {
    // Steps into the punch along the committed aim.
    self.vx = Math.cos(st.ang) * SWING_LUNGE;
    self.vy = Math.sin(st.ang) * SWING_LUNGE;
    var k = Math.min(1, st.t / SWING_STRIKE_TIME);
    var reachNow = self.r + (swingFistDist(self) - self.r) * k;
    var fx = self.x + Math.cos(st.ang) * reachNow, fy = self.y + Math.sin(st.ang) * reachNow;
    if (!st.hit && other.alive) {
      var ox = other.x - fx, oy = other.y - fy;
      if (ox * ox + oy * oy < (other.r + SWING_FIST_R) * (other.r + SWING_FIST_R)) {
        st.hit = true;
        var dealt = hurt(other, sw.damage, "swing", self.id);
        if (dealt > 0) {
          playPunch(dealt);
          if (!other.justDodged && !other.grappled) {
            other.vx += Math.cos(st.ang) * SWING_KNOCKBACK;
            other.vy += Math.sin(st.ang) * SWING_KNOCKBACK;
          }
          if (!reduceMotion) shake = Math.max(shake, 10);
        }
        checkEnd();
      }
    }
    if (st.t >= SWING_STRIKE_TIME) {
      if (!st.hit) floater(fx, fy - 20, "MISS", "dodge");
      st.phase = "extend"; st.t = 0;
    }
    return;
  }

  if (st.phase === "extend") {
    if (st.t >= sw.extend) { st.phase = "recover"; st.t = 0; }
    return;
  }

  // recover: the arm comes back, then the next swing can start right away.
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

// The swinging arm. During the windup the fist is pulled back behind the
// body with a faint aim line showing where the shot is headed (the
// telegraph); then it shoots out, hangs extended, and comes back.
function drawSwing(self) {
  var st = self.swing;
  if (!st || !self.alive) return;
  var sw = self.char.swing, r = self.r;
  var ax = Math.cos(st.ang), ay = Math.sin(st.ang), px = -ay, py = ax;
  var gap = r * 0.4;
  var dist;
  if (st.phase === "windup") {
    var w = Math.min(1, st.t / sw.windup);
    dist = r * (0.8 - 1.3 * w); // pulls further back the longer it winds up
  } else if (st.phase === "strike") {
    dist = r * -0.5 + (swingFistDist(self) + r * 0.5) * Math.min(1, st.t / SWING_STRIKE_TIME);
  } else if (st.phase === "extend") {
    dist = swingFistDist(self);
  } else {
    dist = swingFistDist(self) + (r * 0.8 - swingFistDist(self)) * Math.min(1, st.t / sw.recover);
  }
  var fx = self.x + ax * dist + px * gap, fy = self.y + ay * dist + py * gap;
  var sx = self.x + ax * r * 0.2 + px * gap, sy = self.y + ay * r * 0.2 + py * gap;

  ctx.save();
  ctx.lineCap = "round";
  if (st.phase === "windup") {
    // Telegraph: a dashed line out to where the fist will land, and a ring
    // on the landing spot, both getting bolder as the windup builds.
    var w2 = Math.min(1, st.t / sw.windup);
    var tx = self.x + ax * swingFistDist(self), ty = self.y + ay * swingFistDist(self);
    ctx.setLineDash([7, 6]);
    ctx.globalAlpha = 0.35 + 0.55 * w2;
    ctx.strokeStyle = theme.hit;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(self.x + ax * r, self.y + ay * r);
    ctx.lineTo(tx, ty);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(tx, ty, SWING_FIST_R + 2, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.globalAlpha = 1;
  }
  if (st.phase !== "windup") {
    ctx.strokeStyle = theme.wall; ctx.lineWidth = SWING_FIST_R * 0.9 + 6;
    ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(fx, fy); ctx.stroke();
    ctx.strokeStyle = self.char.color; ctx.lineWidth = SWING_FIST_R * 0.6;
    ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(fx, fy); ctx.stroke();
  }
  // Trembles while it's cocked back.
  var jx = 0, jy = 0;
  if (st.phase === "windup") { jx = (Math.random() - 0.5) * 2.5; jy = (Math.random() - 0.5) * 2.5; }
  ctx.fillStyle = self.char.color; ctx.strokeStyle = theme.wall; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(fx + jx, fy + jy, SWING_FIST_R, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.restore();
}
