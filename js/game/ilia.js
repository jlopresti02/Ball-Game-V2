// Ilia Topuria: a Brawler who starts the fight patient and light, and gets
// more dangerous the more he's hurt (char.ramp).
//   - At full health he throws single punches, rarely, for little damage.
//   - As his health drops his punches come more often and string into
//     combos: 1 punch at full health, building up to 5 by 3/4 health.
//   - Below 3/4 health the combos stay at 5 while they keep coming faster,
//     and every punch starts hitting harder.
// He also has takedown defense (char.tdd: sprawls shots without being a
// grappler) and kick defense (char.kickCheck: checks kicks without being a
// kicker), and makes the attacker pay for both with a punch combo.
"use strict";

// 0 at full health, 1 at zero health.
function iliaLost(b) {
  return 1 - Math.max(0, Math.min(1, b.hp / MAX_HP));
}

function iliaLerp(a, b, k) { return a + (b - a) * Math.max(0, Math.min(1, k)); }

// How many punches his next combo has.
function iliaComboSize(b) {
  var r = b.char.ramp, lost = iliaLost(b), at = r.fullComboAt / 100;
  return Math.min(r.maxCombo, 1 + Math.floor(lost / at * (r.maxCombo - 1) + 1e-6));
}

// Seconds between combos.
function iliaCooldown(b) {
  var r = b.char.ramp, lost = iliaLost(b), at = r.fullComboAt / 100;
  if (lost <= at) return iliaLerp(r.cdStart, r.cdFullCombo, lost / at);
  return iliaLerp(r.cdFullCombo, r.cdMin, (lost - at) / (1 - at));
}

// Damage of each punch.
function iliaDamage(b) {
  var r = b.char.ramp, lost = iliaLost(b), at = r.fullComboAt / 100;
  if (lost <= at) return r.dmgStart;
  return iliaLerp(r.dmgStart, r.dmgMax, (lost - at) / (1 - at));
}

// Runs in place of the normal punch for a fighter with char.ramp.
function updateRampPunch(self, other, dt, d) {
  var pu = self.char.punch, r = self.char.ramp;
  self.punchCd = Math.max(0, self.punchCd - dt * self.atkRate);
  if (!self.punch && !self.kick && !self.swing && self.punchCd === 0 && other.alive && d < self.r + other.r + pu.reach) {
    var n = iliaComboSize(self);
    self.punch = { t: 0, hit: false, side: 1, left: n - 1, n: n, idx: 0 };
    self.punchCd = iliaCooldown(self);
  }
  if (!self.punch) return;
  var p = self.punch;
  p.t += dt;
  // Mid combo he keeps walking into range so the next punch reaches.
  if (p.left > 0 && other.alive) {
    var gap = d - self.r - other.r;
    if (gap > pu.reach * 0.5) {
      var sp = Math.min(r.chase, (gap - pu.reach * 0.5) * 20);
      self.vx = (other.x - self.x) / d * sp; self.vy = (other.y - self.y) / d * sp;
    }
  }
  if (!p.hit && p.t >= pu.speed * 0.35) {
    p.hit = true;
    if (other.alive && d < self.r + other.r + pu.reach + r.comboSlack) {
      var last = p.left === 0;
      var dealt = hurt(other, iliaDamage(self), "punch", self.id);
      if (dealt > 0) { playPunch(dealt); violentHit(self, other, last ? 0.5 : 0.25); }
      var kb = last ? pu.knockback : r.comboKnockback;
      if (kb > 0 && !other.justDodged) {
        var kx = other.x - self.x, ky = other.y - self.y, kd = Math.sqrt(kx * kx + ky * ky) || 1;
        other.vx += kx / kd * kb; other.vy += ky / kd * kb;
      }
      if (last && p.n >= 3 && dealt > 0) floater(other.x, other.y - other.r - 40, p.n + "-PIECE", "crit");
      if (!reduceMotion) shake = Math.max(shake, Math.min(10, 2 + iliaDamage(self) * 0.4));
      checkEnd();
    }
  }
  if (self.punch && p.t >= pu.speed) {
    if (p.left > 0 && other.alive && self.alive && d < self.r + other.r + pu.reach + r.comboSlack * 2) {
      // Next punch of the combo, off the other hand.
      self.punch = { t: 0, hit: false, side: -p.side, left: p.left - 1, n: p.n, idx: p.idx + 1 };
    } else {
      self.punch = null;
    }
  }
}

// ---------------------------------------------------------------
// Takedown defense for a non-grappler: sprawls on the shot, then breaks
// off ("STUFFED") instead of scrambling for a reattack, and comes straight
// back with punches.
// ---------------------------------------------------------------
function tryTddSprawl(attacker, target) {
  var t = target.char.tdd;
  if (target.char.hasGrapple || !t || !target.alive || target.sprawl || target.sprawled) return false;
  if (Math.random() >= t.sprawlChance / 100) return false;
  beginSprawl(attacker, target);
  return true;
}

// Called by updateSprawl when the sprawler can't grapple.
function endTddSprawl(self, atk) {
  if (!self.alive || !atk.alive) return;
  floater(self.x, Math.min(self.y, atk.y) - self.r - 30, "STUFFED", "dodge");
  var dx = atk.x - self.x, dy = atk.y - self.y, d = Math.sqrt(dx * dx + dy * dy) || 1;
  atk.vx = dx / d * 240; atk.vy = dy / d * 240;
  self.vx = -dx / d * 60; self.vy = -dy / d * 60;
  if (atk.char.hasGrapple) atk.grappleCd = Math.max(atk.grappleCd, atk.char.grapple.cooldown);
  self.punchCd = 0; // punishes the failed shot
}
