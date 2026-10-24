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
var GUILLO_GAP = 0.97;        // how close the pair is held (1 = just touching)

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
  // The pair always locks up side by side (the shooter bent over sideways,
  // the way it looks from cageside), on whichever side it shot in from,
  // unless there's no room for it there before the wall.
  var side = atk.x >= def.x ? 1 : -1;
  var reach = (def.r + atk.r) * GUILLO_GAP + atk.r;
  if (def.x + side * reach > W || def.x + side * reach < 0) side = -side;
  def.guillo = {
    atkId: atk.id, t: 0, dur: GUILLO_MIN_TIME + Math.random() * GUILLO_MAX_EXTRA,
    taps: Math.random() < tapChance / 100, bar: 0, phase: "squeeze", tapT: 0,
    nx: side, ny: 0, wob: Math.random() * 10
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
  var gap = (self.r + atk.r) * GUILLO_GAP;
  self.vx = 0; self.vy = 0; atk.vx = 0; atk.vy = 0;
  atk.x = self.x + g.nx * gap + (Math.random() - 0.5) * jit;
  atk.y = self.y + (Math.random() - 0.5) * jit;

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

// How hard the choke is sunk in right now (0 to 1).
function guilloSqueeze(g) {
  return g.phase === "tap" ? 1 : Math.max(0, g.bar);
}

// Poses both fighters while they're locked in a guillotine: the shooter is
// bent over sideways, head first into the defender's side (its head, the top
// third of the ball, turned to face the defender), and the defender leans
// back as it pulls the choke up. Called by the fighter drawing with the
// canvas already set up for that fighter.
function applyGuilloPose(b) {
  var g = b.guillo, def = b;
  if (!g) {
    if (!b.choked) return;
    def = balls[1 - b.id];
    g = def.guillo;
    if (!g) return;
  }
  // g.nx is +1 when the shooter is on the defender's right, -1 on its left.
  var angle = b === def ? -g.nx * 0.25 * guilloSqueeze(g) : -g.nx * Math.PI / 2;
  ctx.translate(b.x, b.y);
  ctx.rotate(angle);
  ctx.translate(-b.x, -b.y);
}

// An arm: a dark outline with the skin colour inside it.
function strokeLimb(width, color, path) {
  ctx.lineCap = "round"; ctx.lineJoin = "round";
  [[theme.wall, width + 6], [color, width]].forEach(function (pass) {
    ctx.strokeStyle = pass[0]; ctx.lineWidth = pass[1];
    ctx.beginPath(); path(); ctx.stroke();
  });
}

function drawGloveAt(x, y, r, ch) {
  ctx.fillStyle = gloveColor(ch); ctx.strokeStyle = theme.wall; ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
}

function drawGuillotines() {
  balls.forEach(function (self) {
    var g = self.guillo;
    if (!g) return;
    var atk = balls[g.atkId];
    var squeeze = guilloSqueeze(g);
    var s = g.nx, r = self.r, ar = atk.r;
    var lean = s * squeeze * r * 0.08; // the defender's lean back pulls the arm with it
    ctx.save();

    // The shooter's face (the end of its ball nearest the defender) goes
    // red as the choke sinks in.
    if (squeeze > 0) {
      ctx.save();
      ctx.beginPath(); ctx.arc(atk.x, atk.y, ar, 0, Math.PI * 2); ctx.clip();
      ctx.globalAlpha = 0.55 * squeeze;
      ctx.fillStyle = "#d62020";
      ctx.beginPath(); ctx.arc(atk.x - s * ar * 0.68, atk.y, ar * 0.45, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }

    // The defender's near arm: off its shoulder, over the top of the
    // shooter's neck (where its head meets its torso), straight down across
    // it and back under its chin to the defender's chest, where both hands
    // lock together. The shooter's head is trapped inside the loop.
    var neckX = atk.x - s * ar * 0.33 - lean;
    var shX = self.x + s * r * 0.7 - lean, shY = self.y - r * 0.55;
    var gripX = self.x + s * r * 0.72 - lean, gripY = self.y + r * 0.45;
    var arm = r * 0.24;
    strokeLimb(arm, armColor(self.char), function () {
      ctx.moveTo(shX, shY);
      ctx.quadraticCurveTo(atk.x - s * ar * 0.75, atk.y - ar * 1.12, neckX, atk.y - ar * 0.92);
      ctx.lineTo(neckX, atk.y + ar * 0.8);
      ctx.quadraticCurveTo(atk.x - s * ar * 0.75, atk.y + ar * 1.1, gripX, gripY);
    });
    // The shooter hand-fights the arm around its neck, trying to peel it off.
    if (g.phase === "squeeze") {
      var tug = Math.sin(g.t * 9 + g.wob) * ar * 0.06;
      drawGloveAt(neckX + s * ar * 0.18, atk.y + ar * 0.45 + tug, ar * 0.24, atk.char);
    }
    // Both hands locked together at the defender's chest (gable grip).
    drawGloveAt(gripX - s * r * 0.1, gripY + r * 0.05, r * 0.27, self.char);
    drawGloveAt(gripX + s * r * 0.08, gripY - r * 0.12, r * 0.27, self.char);

    // Tapping: the shooter reaches up with a free hand and pats the
    // defender's back three times.
    if (g.phase === "tap") {
      var pat = Math.abs(Math.sin(g.tapT / GUILLO_TAP_TIME * Math.PI * 3));
      var hx = self.x + s * r * 0.1 - lean, hy = self.y - r * 0.95 - pat * r * 0.35;
      strokeLimb(ar * 0.26, armColor(atk.char), function () {
        ctx.moveTo(atk.x + s * ar * 0.1, atk.y - ar * 0.8);
        ctx.quadraticCurveTo(atk.x - s * ar * 0.3, hy - r * 0.2, hx, hy);
      });
      drawGloveAt(hx, hy, ar * 0.26, atk.char);
    }

    // Tug-of-war bar over the pair: the defender's colour is the choke,
    // the shooter's is the escape. The marker is where it stands.
    var bw = 150, bh = 12, cx = (self.x + atk.x) / 2;
    var bx = Math.min(W - bw - 6, Math.max(6, cx - bw / 2));
    var by = Math.min(self.y, atk.y) - r - 64;
    if (by < 8) by = Math.max(self.y, atk.y) + r + 30;
    var split = bw * (g.bar + 1) / 2;
    ctx.fillStyle = self.char.color; ctx.fillRect(bx, by, split, bh);
    ctx.fillStyle = atk.char.color; ctx.fillRect(bx + split, by, bw - split, bh);
    ctx.lineWidth = 2.5; ctx.strokeStyle = theme.wall; ctx.strokeRect(bx, by, bw, bh);
    ctx.fillStyle = theme.ink;
    ctx.fillRect(bx + split - 2, by - 4, 4, bh + 8);
    ctx.restore();
  });
}
