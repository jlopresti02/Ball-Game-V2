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
    // Disengage: pushes off straight back out into the arena.
    self.grapple = null;
    tgt.grappled = false;
    self.vx = g.nx * IOWA_DISENGAGE_SPEED; self.vy = g.ny * IOWA_DISENGAGE_SPEED;
    // The one who got slammed peels off along the wall.
    var side = Math.random() < 0.5 ? -1 : 1;
    var tx = -g.ny * side, ty = g.nx * side;
    tgt.vx = (tx * 0.9 + g.nx * 0.45) * 260; tgt.vy = (ty * 0.9 + g.ny * 0.45) * 260;
  }
}
