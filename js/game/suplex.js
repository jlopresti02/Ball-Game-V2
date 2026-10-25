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
    var e = k * k * (3 - 2 * k), ang = Math.PI * e;
    vic.x = self.x + s * Math.cos(ang) * c.reach;
    vic.y = self.y - Math.sin(ang) * c.reach * 1.25;
    if (k < 1) return;
    fpImpact(self, vic, { nx: 0, ny: -1 }, self.char.suplex.damage, true);
    if (typeof recordTakedown === "function") recordTakedown(self.id);
    floater(vic.x, vic.y - vic.r - 30, "TAKEDOWN", "note");
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
  var k = Math.min(1, c.t / SUPLEX_LIFT_TIME);
  return k * k * (3 - 2 * k);
}

// The thrower arches back, and the one thrown flips over head first.
function applySuplexPose(b) {
  var c = b.suplex, angle;
  if (c) {
    var a = suplexArc(c);
    angle = -c.side * 0.75 * Math.sin(Math.PI * Math.min(1, a * 1.15));
  } else {
    if (!b.choked) return;
    c = balls[1 - b.id].suplex;
    if (!c) return;
    angle = -c.side * Math.PI * suplexArc(c);
  }
  ctx.translate(b.x, b.y);
  ctx.rotate(angle);
  ctx.translate(-b.x, -b.y);
}

// Its arms locked round their waist until the slam.
function drawSuplexes() {
  balls.forEach(function (self) {
    var c = self.suplex;
    if (!c || c.phase === "down") return;
    var vic = balls[c.vicId], r = self.r, skin = armColor(self.char);
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
