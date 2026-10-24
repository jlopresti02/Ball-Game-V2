// BJJ submissions. For now: the guillotine off a shot.
//
// When a Grappler shoots for a grab on a fighter with the guillotine, there's
// a chance (`chance`%) the defender snaps on a guillotine instead: it wraps
// an arm around the shooter's head and the two lock up. A tug-of-war bar
// shows the choke sinking in against the escape. If the choke wins, the
// shooter taps (three pats) and loses the fight on the spot: a win by
// submission. If the escape wins, they scramble apart and the fight goes on.
//
// The odds of the tap: `tapBase`% at full health, plus up to `tapLowHp`% more
// the more damage the shooter has taken, so subs land late in fights the way
// they do in real MMA. After a failed attempt the defender can't throw
// another one for `cooldown` seconds.
"use strict";

var GUILLO_MIN_TIME = 2.6;   // the struggle lasts this long...
var GUILLO_MAX_EXTRA = 1.2;  // ...plus up to this much more
var GUILLO_TAP_TIME = 0.75;  // three pats, then the fight's called
var GUILLO_ESCAPE_SPEED = 360;

// Locked up in a submission: either applying it or caught in it.
function subLocked(b) {
  return !!(b.guillo || b.choked);
}

function canGuillotine(def) {
  if (!def.char.hasGuillotine || !def.alive || def.guilloCd > 0) return false;
  return !(def.koOut || def.shocked || def.shelled || def.igbb || def.koRush || def.koDuel ||
    def.slam || def.combo || def.taunt || def.flow || def.grapple || subLocked(def));
}

// Called from attemptGrab: true if the shot got caught in a guillotine.
function tryGuillotine(attacker, target) {
  if (!canGuillotine(target) || Math.random() >= target.char.guillotine.chance / 100) return false;
  beginGuillotine(target, attacker);
  return true;
}

function beginGuillotine(def, atk) {
  var gu = def.char.guillotine;
  var hurtFrac = 1 - Math.max(0, Math.min(1, atk.hp / MAX_HP));
  var tapChance = Math.min(95, gu.tapBase + gu.tapLowHp * hurtFrac);
  var dx = atk.x - def.x, dy = atk.y - def.y, d = Math.sqrt(dx * dx + dy * dy) || 1;
  def.guillo = {
    atkId: atk.id, t: 0, dur: GUILLO_MIN_TIME + Math.random() * GUILLO_MAX_EXTRA,
    taps: Math.random() < tapChance / 100, bar: 0, phase: "squeeze", tapT: 0,
    nx: dx / d, ny: dy / d, wob: Math.random() * 10
  };
  atk.choked = true;
  atk.grappleCd = atk.char.grapple ? atk.char.grapple.cooldown : 0;
  [atk, def].forEach(function (b) {
    b.vx = 0; b.vy = 0;
    b.punch = null; b.kick = null; b.throwAnim = null; b.swing = null; b.checkAnim = null;
  });
  floater(def.x, Math.min(atk.y, def.y) - def.r - 30, "GUILLOTINE", "crit");
  playPunch(20);
  if (!reduceMotion) shake = Math.max(shake, 8);
}

// Runs on the fighter applying the choke each frame; the one caught in it is
// held still.
function updateGuillotine(self, dt) {
  var g = self.guillo, atk = balls[g.atkId];
  if (!self.alive || !atk.alive) { endGuillotine(self); return; }
  g.t += dt;

  // The shooter's head stays tucked under the defender's arm, and both
  // shudder a little as they fight over it.
  var jit = reduceMotion || g.phase !== "squeeze" ? 0 : 1.6;
  var gap = self.r + atk.r - 14;
  self.vx = 0; self.vy = 0; atk.vx = 0; atk.vy = 0;
  atk.x = self.x + g.nx * gap + (Math.random() - 0.5) * jit;
  atk.y = self.y + g.ny * gap + (Math.random() - 0.5) * jit;

  if (g.phase === "squeeze") {
    // The bar swings back and forth, then commits to how it ends: +1 is the
    // choke sunk in, -1 is the escape.
    var p = Math.min(1, g.t / g.dur), sgn = g.taps ? 1 : -1;
    var drift = sgn * Math.pow(p, 2.2);
    var swing = Math.sin(g.t * 4.7 + g.wob) * Math.sin(g.t * 1.9 + g.wob * 0.5) * 0.55 * (1 - p);
    g.bar = Math.max(-1, Math.min(1, drift + swing));
    if (p < 1) return;
    g.bar = sgn;
    if (g.taps) {
      g.phase = "tap";
      floater(atk.x, Math.min(atk.y, self.y) - atk.r - 30, "TAP", "crit");
      playPunch(10);
    } else {
      floater((self.x + atk.x) / 2, Math.min(atk.y, self.y) - atk.r - 30, "ESCAPE", "note");
      self.guilloCd = self.char.guillotine.cooldown;
      endGuillotine(self);
      // They pop apart and the fight goes on.
      self.vx = -g.nx * GUILLO_ESCAPE_SPEED; self.vy = -g.ny * GUILLO_ESCAPE_SPEED;
      atk.vx = g.nx * GUILLO_ESCAPE_SPEED; atk.vy = g.ny * GUILLO_ESCAPE_SPEED;
    }
    return;
  }

  // Tapping: three pats on the defender, then the fight is over.
  g.tapT += dt;
  if (g.tapT >= GUILLO_TAP_TIME) {
    endGuillotine(self);
    submit(atk);
  }
}

function endGuillotine(self) {
  var g = self.guillo;
  if (!g) return;
  balls[g.atkId].choked = false;
  self.guillo = null;
}

// Loses by submission: no damage number, just out.
function submit(b) {
  b.hp = 0; b.shown = 0; b.alive = false;
  burst(b);
  document.getElementById("hud" + b.id).classList.add("dead");
  winBy = "submission";
  checkEnd();
}

function drawGuillotines() {
  balls.forEach(function (self) {
    var g = self.guillo;
    if (!g) return;
    var atk = balls[g.atkId];
    var squeeze = Math.max(0, g.bar);

    // The shooter goes red in the face as the choke sinks in.
    if (squeeze > 0) {
      ctx.save();
      ctx.globalAlpha = 0.45 * squeeze;
      ctx.fillStyle = "#d62020";
      ctx.beginPath(); ctx.arc(atk.x, atk.y, atk.r, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }

    // The defender's arm comes off its shoulder and wraps around the far
    // side of the shooter's head, hands clasped where it closes.
    var back = Math.atan2(self.y - atk.y, self.x - atk.x);
    var ring = atk.r * (0.95 - 0.08 * squeeze);
    var a0 = back + 1.95, a1 = back - 1.95 + Math.PI * 2;
    var px = -g.ny, py = g.nx;
    var sx = self.x + g.nx * self.r * 0.45 + px * self.r * 0.7, sy = self.y + g.ny * self.r * 0.45 + py * self.r * 0.7;
    var endX = atk.x + Math.cos(a1) * ring, endY = atk.y + Math.sin(a1) * ring;
    ctx.save();
    ctx.lineCap = "round"; ctx.lineJoin = "round";
    [[theme.wall, self.r * 0.44], [armColor(self.char), self.r * 0.3]].forEach(function (pass) {
      ctx.strokeStyle = pass[0]; ctx.lineWidth = pass[1];
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(atk.x + Math.cos(a0) * ring, atk.y + Math.sin(a0) * ring);
      ctx.arc(atk.x, atk.y, ring, a0, a1);
      ctx.stroke();
    });
    // Gable grip: both gloves locked together at the end of the wrap.
    ctx.fillStyle = gloveColor(self.char); ctx.strokeStyle = theme.wall; ctx.lineWidth = 2.5;
    [0, 1].forEach(function (k) {
      var hx = endX + px * (k ? -1 : 1) * self.r * 0.14, hy = endY + py * (k ? -1 : 1) * self.r * 0.14;
      ctx.beginPath(); ctx.arc(hx, hy, self.r * 0.27, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    });

    // Tapping: the shooter's glove pats the defender three times.
    if (g.phase === "tap") {
      var pat = Math.abs(Math.sin(g.tapT / GUILLO_TAP_TIME * Math.PI * 3));
      var side = -1;
      var tx = self.x + px * side * self.r * 0.95 - g.nx * self.r * 0.1;
      var ty = self.y + py * side * self.r * 0.95 - g.ny * self.r * 0.1 - pat * 10;
      ctx.fillStyle = gloveColor(atk.char);
      ctx.beginPath(); ctx.arc(tx, ty, atk.r * 0.27, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    }

    // Tug-of-war bar over the pair: the defender's colour is the choke,
    // the shooter's is the escape. The marker is where it stands.
    var bw = 150, bh = 12, cx = (self.x + atk.x) / 2;
    var bx = Math.min(W - bw - 6, Math.max(6, cx - bw / 2));
    var by = Math.min(self.y, atk.y) - self.r - 64;
    if (by < 8) by = Math.max(self.y, atk.y) + self.r + 30;
    var split = bw * (g.bar + 1) / 2;
    ctx.fillStyle = self.char.color; ctx.fillRect(bx, by, split, bh);
    ctx.fillStyle = atk.char.color; ctx.fillRect(bx + split, by, bw - split, bh);
    ctx.lineWidth = 2.5; ctx.strokeStyle = theme.wall; ctx.strokeRect(bx, by, bw, bh);
    ctx.fillStyle = theme.ink;
    ctx.fillRect(bx + split - 2, by - 4, 4, bh + 8);
    ctx.restore();
  });
}
