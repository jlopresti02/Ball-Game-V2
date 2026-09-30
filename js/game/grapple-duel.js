// Grappler vs Grappler.
//
// Initiative: when both Grapplers could grab each other in the same moment,
// only one gets to.
//   - Blindside: if one is coming at the other from the side or behind
//     (it's facing its opponent but its opponent isn't facing it), it grabs.
//   - Otherwise (face to face): the one moving faster grabs; if their speeds
//     are equal, the one with more health; if that's equal too, a coin flip.
//   (A stats system for character designs will be added to the tie breakers
//   later.)
//
// Iowa Style: after one Grappler slams the other into a wall, it keeps
// pressing them into it for a moment, then disengages cleanly, unharmed.
"use strict";

var FACING_CONE = 60 * Math.PI / 180;   // how far to either side still counts as "in front"
var SPEED_TIE = 2;                      // speeds within this much count as equal
var HEALTH_TIE = 0.5;                   // health within this much counts as equal
var IOWA_PRESS_TIME = 0.4;              // how long it keeps pressing them into the wall
var IOWA_DISENGAGE_SPEED = 380;
var IOWA_IMPUNITY = 1.5;                // after disengaging, the slammed Grappler can't grab back for this long

function isGrapplerDuel(a, b) {
  return a.char.hasGrapple && b.char.hasGrapple;
}

// Which way a fighter is facing: where it's moving, or toward the opponent
// if it's standing still (the same rule its guard hands follow).
function facingOf(b, other) {
  var s = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
  if (s > 1) return { x: b.vx / s, y: b.vy / s };
  var dx = other.x - b.x, dy = other.y - b.y, d = Math.sqrt(dx * dx + dy * dy) || 1;
  return { x: dx / d, y: dy / d };
}

function isFacing(a, b) {
  var f = facingOf(a, b);
  var dx = b.x - a.x, dy = b.y - a.y, d = Math.sqrt(dx * dx + dy * dy) || 1;
  var cos = (f.x * dx + f.y * dy) / d;
  return cos >= Math.cos(FACING_CONE);
}

// Would this Grappler start a grab this frame if nothing stopped it?
function readyToGrab(self, other, dt) {
  if (!self.char.hasGrapple || !self.alive || self.grappled || self.grapple) return false;
  if (self.slam || self.combo || self.taunt || self.flow) return false;
  if (self.grappleCd - dt > 0) return false;
  if (!other.alive || other.grappled || other.invincible) return false;
  if (self.sprawl || self.sprawled || other.sprawl || other.sprawled) return false;
  if (grabBlockedByImpunity(self, other)) return false;
  var dx = other.x - self.x, dy = other.y - self.y, d = Math.sqrt(dx * dx + dy * dy);
  return d < self.r + other.r + self.char.grapple.reach;
}

// Runs once per frame before either fighter acts. If both Grapplers are
// ready to grab each other right now, picks who gets initiative and holds
// the other back for this frame.
function resolveGrabInitiative(dt) {
  var a = balls[0], b = balls[1];
  a.grabHold = false; b.grabHold = false;
  if (!isGrapplerDuel(a, b) || !readyToGrab(a, b, dt) || !readyToGrab(b, a, dt)) return;

  var winner, reason;
  var aSees = isFacing(a, b), bSees = isFacing(b, a);
  if (aSees && !bSees) { winner = a; reason = "BLINDSIDE"; }
  else if (bSees && !aSees) { winner = b; reason = "BLINDSIDE"; }
  else {
    var sa = Math.sqrt(a.vx * a.vx + a.vy * a.vy), sb = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
    if (Math.abs(sa - sb) > SPEED_TIE) { winner = sa > sb ? a : b; reason = "FASTER"; }
    else if (Math.abs(a.hp - b.hp) > HEALTH_TIE) { winner = a.hp > b.hp ? a : b; reason = "MORE HEALTH"; }
    else { winner = Math.random() < 0.5 ? a : b; reason = "COIN FLIP"; }
  }
  var loser = winner === a ? b : a;
  loser.grabHold = true;
  winner.initiativeReason = reason; // shown when the grab starts
}

// Called when a grab's slam lands in a Grappler vs Grappler match.
function beginIowaStyle(self, tgt, g) {
  g.phase = "iowa";
  g.pressT = 0;
  tgt.grappled = true;
  floater((self.x + tgt.x) / 2, Math.min(self.y, tgt.y) - self.r - 34, "IOWA STYLE", "crit");
}

// Keeps the opponent pinned against the wall with the Grappler leaning into
// them, then the Grappler pushes off and backs away.
function updateIowaStyle(self, g, dt) {
  var tgt = balls[g.targetId];
  g.pressT += dt;
  // The pinned fighter stays flat against the wall.
  tgt.x = g.endX; tgt.y = g.endY;
  tgt.vx = 0; tgt.vy = 0;
  // The Grappler leans in, pulsing like it's shoving them into the wall.
  var shove = Math.max(0, Math.sin(g.pressT * 22)) * 4;
  var gap = self.r + tgt.r - 4 - shove;
  self.x = tgt.x + g.nx * gap;
  self.y = tgt.y + g.ny * gap;
  self.vx = 0; self.vy = 0;
  if (g.pressT < 0.3 && Math.floor(g.pressT * 22 / Math.PI) !== Math.floor((g.pressT - dt) * 22 / Math.PI)) {
    tgt.squash = { t: 0.1, max: 0.1, nx: g.nx, ny: g.ny };
  }
  if (g.pressT >= IOWA_PRESS_TIME) {
    // Disengage: pushes off straight back out into the arena. Having landed
    // the slam, it gets away clean: the slammed Grappler can't grab it back
    // (no back-to-back wall slams) until it's had time to get clear.
    self.grapple = null;
    self.iowaSafe = { from: tgt.id, t: IOWA_IMPUNITY };
    tgt.grappled = false;
    self.vx = g.nx * IOWA_DISENGAGE_SPEED; self.vy = g.ny * IOWA_DISENGAGE_SPEED;
    // The one who got slammed peels off along the wall.
    var side = Math.random() < 0.5 ? -1 : 1;
    var tx = -g.ny * side, ty = g.nx * side;
    tgt.vx = (tx * 0.9 + g.nx * 0.45) * 260; tgt.vy = (ty * 0.9 + g.ny * 0.45) * 260;
  }
}

// True while `target` is still getting away clean from an Iowa Style slam
// it landed on `grabber`.
function grabBlockedByImpunity(grabber, target) {
  return !!(target.iowaSafe && target.iowaSafe.from === grabber.id && target.iowaSafe.t > 0);
}

// ---------------------------------------------------------------
// Sprawl and Reattack. When a Grappler goes for a grab on another
// Grappler, the defender has a chance to sprawl: it drops its weight onto
// the attacker and stuffs the grab, and the two tie up for a moment. Then
// it's a scramble: either one (50/50 by default) comes out of it and
// slams the other (the Reattack). A Reattack can't itself be sprawled.
// ---------------------------------------------------------------
var SPRAWL_TIME = 0.6;

// Every grab on a Grappler goes through here (normal grabs and counter-grabs).
function attemptGrab(attacker, target) {
  var gr = target.char.grapple;
  if (target.char.hasGrapple && gr && Math.random() < gr.sprawlChance / 100) {
    beginSprawl(attacker, target);
    return false;
  }
  beginGrapple(attacker, target);
  return true;
}

function beginSprawl(attacker, defender) {
  defender.sprawl = { attackerId: attacker.id, t: 0 };
  attacker.sprawled = true;
  attacker.grappleCd = attacker.char.grapple.cooldown;
  // Both stop what they were doing and lock up.
  [attacker, defender].forEach(function (b) {
    b.vx = 0; b.vy = 0;
    b.punch = null; b.kick = null; b.throwAnim = null; b.swing = null;
  });
  floater(defender.x, Math.min(attacker.y, defender.y) - defender.r - 30, "SPRAWL", "crit");
  playPunch(20);
  if (!reduceMotion) shake = Math.max(shake, 8);
  attacker.squash = { t: 0.2, max: 0.2, nx: (attacker.x - defender.x), ny: (attacker.y - defender.y) };
  var l = Math.sqrt(attacker.squash.nx * attacker.squash.nx + attacker.squash.ny * attacker.squash.ny) || 1;
  attacker.squash.nx /= l; attacker.squash.ny /= l;
}

// Runs on the sprawling defender each frame; the attacker is held still.
function updateSprawl(self, dt) {
  var sp = self.sprawl, atk = balls[sp.attackerId];
  sp.t += dt;
  // The defender stays draped over the attacker, pressing down.
  var dx = atk.x - self.x, dy = atk.y - self.y, d = Math.sqrt(dx * dx + dy * dy) || 1;
  var gap = self.r + atk.r - 10;
  self.x = atk.x - dx / d * gap; self.y = atk.y - dy / d * gap;
  self.vx = 0; self.vy = 0; atk.vx = 0; atk.vy = 0;
  if (sp.t < SPRAWL_TIME) return;

  // The scramble: who comes out on top and slams the other.
  self.sprawl = null;
  atk.sprawled = false;
  var sprawlerWins = Math.random() < self.char.grapple.reattackChance / 100;
  var winner = sprawlerWins ? self : atk, loser = sprawlerWins ? atk : self;
  if (grabBlockedByImpunity(winner, loser)) { var tmp = winner; winner = loser; loser = tmp; }
  if (!winner.alive || !loser.alive) return;
  floater(winner.x, Math.min(winner.y, loser.y) - winner.r - 30, "REATTACK", "crit");
  beginGrapple(winner, loser);
}

function drawSprawls() {
  balls.forEach(function (self) {
    if (!self.sprawl) return;
    var atk = balls[self.sprawl.attackerId];
    var dx = atk.x - self.x, dy = atk.y - self.y, d = Math.sqrt(dx * dx + dy * dy) || 1;
    var nx = dx / d, ny = dy / d, px = -ny, py = nx;
    // Both hands pressing down on the attacker's back.
    ctx.save();
    ctx.fillStyle = self.char.color; ctx.strokeStyle = theme.wall; ctx.lineWidth = 2.5;
    [1, -1].forEach(function (sgn) {
      var hx = atk.x - nx * atk.r * 0.1 + px * atk.r * 0.72 * sgn, hy = atk.y - ny * atk.r * 0.1 + py * atk.r * 0.72 * sgn;
      ctx.beginPath(); ctx.arc(hx, hy, atk.r * 0.32, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    });
    // A tie-up ring around the pair, filling up until the scramble.
    var k = Math.min(1, self.sprawl.t / SPRAWL_TIME);
    ctx.strokeStyle = theme.ink; ctx.globalAlpha = 0.5; ctx.lineWidth = 3; ctx.lineCap = "round";
    ctx.beginPath();
    ctx.arc((self.x + atk.x) / 2, (self.y + atk.y) / 2, self.r + atk.r + 6, -Math.PI / 2, -Math.PI / 2 + k * Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  });
}
