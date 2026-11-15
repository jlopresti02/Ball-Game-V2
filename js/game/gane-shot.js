// Ciryl Gane's rare takedown shot (Christian, 2026-11-15): "Gane, at a very
// low frequency, should shoot shots." He stays a striker (no hasGrapple):
// every so often he changes levels and shoots, and the shot runs through the
// same takedown system everyone's grabs do (attemptGrab, grapple-duel.js):
// their sprawl or takedown defense, a weave or block, a guillotine, an
// uppercut counter, his own stuffChance (stuffed-shots.js). One that gets
// through is the ordinary grab and slam (beginGrapple, match.js) with his
// own `grapple` numbers.
//
// Everything is in his `shots` block (leave it out and none of this runs):
//   every    seconds between shots (the first one too), a fresh roll each time.
//            Once one's due he waits for the moment:
//   range    edge to edge, how close they have to be, and either
//   closing  they're charging in faster than this (he goes under it), or
//   circle   he's circling off at range on his back foot (gane.js "set").
//   level    seconds dropping his level (the tell), planted.
//   speed    the drive in on their legs, and
//   drive    how long it can last before it's a "WHIFF".
//   contact  edge to edge, in on the legs: the shot goes off.
// His `grapple` block is the takedown itself (damage, speed, cooldown,
// shotName, stuffChance), read by the shared grab code like anyone's.
//
// The shot runs on b.gs: { phase: "level" | "drive", t, aim, seen }.
"use strict";

function ganeShotCfg(b) { return b && b.char && !b.char.hasGrapple ? b.char.shots : null; }

// physics.js (inOrdinaryMovement): planted for the level change or driving in.
function ganeShotBusy(b) { return !!(b && b.gs); }

// abilities.js: a shot of his that got through is a grab like anyone's, so
// the grab and slam run for him while it lasts.
function ganeShotHolding(b) { return !!(ganeShotCfg(b) && b.grapple); }

function gsEnd(b) { b.gs = null; setSpeed(b, b.baseSpeed || SPEED); }

// Is now the moment? They're in range, and charging in or he's circling.
function gsMoment(self, other, c) {
  if (!started || over || !other.alive || other.koOut || other.invincible || self.dizzy || self.angry || self.cheater || self.chAct) return false;
  if (self.punch || self.kick || self.cmb || self.lk || self.swing || self.sprawled || !inOrdinaryMovement(self)) return false;
  if (specialBusy(self) || specialBusy(other)) return false;
  if (other.grappled || other.grapple || other.sprawl || other.sprawled || other.slam || other.igbb || subLocked(other)) return false;
  if (typeof clinchBusy === "function" && (clinchBusy(self) || clinchBusy(other))) return false;
  if (grabBlockedByImpunity(self, other)) return false;
  var dx = other.x - self.x, dy = other.y - self.y, d = Math.sqrt(dx * dx + dy * dy) || 1, gap = d - self.r - other.r;
  if (gap > c.range) return false;
  var ux = dx / d, uy = dy / d, closing = -(other.vx * ux + other.vy * uy) + (self.vx * ux + self.vy * uy);
  if (closing > c.closing) return true;
  return !!(c.circle && self.gn && self.gn.mode === "set");
}

// From updateAbilities (abilities.js), every frame. True while the shot has
// him busy.
function updateGaneShot(self, other, dt) {
  var c = ganeShotCfg(self);
  if (!c) return false;
  var s = self.gs;
  if (s && ganeClock - s.seen > 0.1) { gsEnd(self); s = null; } // held, grabbed or knocked out of it somewhere else
  if (!s) {
    if (self.gsNext == null) self.gsNext = gnRand(c.every);
    if (self.gsNext > 0) { self.gsNext -= dt; return false; }
    if (!gsMoment(self, other, c)) return false; // due: waits for the moment
    self.gsNext = gnRand(c.every);
    clearActions(self);
    s = self.gs = { phase: "level", t: 0, aim: Math.atan2(other.y - self.y, other.x - self.x), seen: ganeClock };
    self.vx = 0; self.vy = 0;
    floater(self.x, self.y - self.r - 30, "LEVEL CHANGE", "note");
    return true;
  }
  s.seen = ganeClock;
  s.t += dt;
  if (!other.alive || over || other.invincible || other.grappled || other.sprawl || other.sprawled || subLocked(other) || specialBusy(other) || self.knockFly > 0 || self.slam) { gsEnd(self); return false; }
  var dx = other.x - self.x, dy = other.y - self.y, d = Math.sqrt(dx * dx + dy * dy) || 1;
  s.aim = Math.atan2(dy, dx);
  if (s.phase === "level") {
    self.vx = 0; self.vy = 0;
    if (s.t >= c.level) { s.phase = "drive"; s.t = 0; playWhoosh(); }
    return true;
  }
  self.vx = dx / d * c.speed; self.vy = dy / d * c.speed;
  if (d - self.r - other.r < c.contact) {
    self.gs = null;
    self.vx = 0; self.vy = 0;
    if (attemptGrab(self, other) && self.grapple) floater(other.x, other.y - other.r - 30, "TAKEDOWN", "note"); // every takedown defense (grapple-duel.js)
    else if (!self.sprawled && !self.grappled && !self.choked) setSpeed(self, self.baseSpeed || SPEED);
    return true;
  }
  if (s.t > c.drive) {
    floater(self.x, self.y - self.r - 8, "WHIFF", "dodge");
    gsEnd(self);
    return false;
  }
  return true;
}

// From draw() (draw.js), with the other poses: crouched low, leaning in.
function applyGaneShotPose(b) {
  var s = b.gs;
  if (!s || !b.alive) return;
  var k = s.phase === "level" ? ease(s.t / 0.12) : 1, ax = b.x, ay = b.y + b.r;
  ctx.translate(ax, ay); ctx.rotate(Math.cos(s.aim) * 0.22 * k); ctx.scale(1 + 0.14 * k, 1 - 0.22 * k); ctx.translate(-ax, -ay);
}

// From drawGane (gane.js): both arms out low for their legs.
function drawGaneShot(b) {
  var s = b.gs;
  if (!s) return false;
  var k = s.phase === "level" ? ease(s.t / 0.12) : 1;
  var nx = Math.cos(s.aim), ny = Math.sin(s.aim), px = -ny, py = nx, r = b.r;
  var size = ((b.char.punch && b.char.punch.size) || 14) * 0.72;
  [-1, 1].forEach(function (side) {
    var sh = { x: b.x + px * side * r * 0.62 + nx * r * 0.2, y: b.y + r * 0.3 + py * side * r * 0.3 };
    var reach = r * (0.5 + 0.75 * k);
    var hand = { x: sh.x + nx * reach + px * side * r * 0.12, y: sh.y + ny * reach + r * 0.28 * k };
    strokeLimb(size * 0.75, armColor(b.char), function () { ctx.moveTo(sh.x, sh.y); ctx.lineTo(hand.x, hand.y); });
    drawGloveAt(hand.x, hand.y, size, b.char, s.aim);
  });
  return true;
}
