// Rear naked choke. When a fighter with the RNC grabs an opponent from
// behind (the opponent isn't facing it), `chance`% of the time it takes the
// back instead of slamming: it climbs on behind them, hooks its legs round
// their waist, snakes an arm under the chin and locks the choke (its other
// hand behind their head). The same tug-of-war bar as the guillotine decides
// it: the tap (a win by submission) or the escape (they turn in and pop
// free). Tap odds: `tapBase`% at full health, plus up to `tapLowHp`% more
// the more damage the one being choked has taken. After an escape it can't
// take the back again for `cooldown` seconds.
"use strict";

var RNC_MIN_TIME = 2.4, RNC_MAX_EXTRA = 1.2;
var RNC_TAP_TIME = 0.75;
var RNC_ESCAPE_SPEED = 340;
var RNC_OFF_X = 0.45, RNC_OFF_Y = 0.7; // where it sits on their back (in their radii)

function canRnc(self) {
  if (!self.char.hasRnc || !self.alive || self.rncCd > 0) return false;
  return !(self.koOut || self.shocked || self.shelled || self.igbb || self.koRush || self.koDuel ||
    self.slam || self.combo || self.taunt || self.flow || self.grapple || subLocked(self));
}

// Called from attemptGrab: true if the grab became a back take.
function tryRnc(attacker, target) {
  if (!canRnc(attacker) || isFacing(target, attacker)) return false;
  if (Math.random() >= attacker.char.rnc.chance / 100) return false;
  floater(attacker.x, attacker.y - attacker.r - 30, "BACK TAKE", "note");
  beginRnc(attacker, target);
  return true;
}

function beginRnc(self, vic) {
  var rc = self.char.rnc || defaultRnc();
  var hurtFrac = 1 - Math.max(0, Math.min(1, vic.hp / MAX_HP));
  var tapChance = Math.min(95, rc.tapBase + rc.tapLowHp * hurtFrac);
  // Climbs on from whichever side it came in on.
  var side = self.x >= vic.x ? 1 : -1;
  self.rnc = {
    vicId: vic.id, t: 0, dur: RNC_MIN_TIME + Math.random() * RNC_MAX_EXTRA,
    taps: Math.random() < tapChance / 100, bar: 0, phase: "squeeze", tapT: 0,
    side: side, wob: Math.random() * 10
  };
  vic.choked = true;
  self.guard = null; // (when it comes from the guard)
  [self, vic].forEach(function (b) {
    b.vx = 0; b.vy = 0;
    b.punch = null; b.kick = null; b.throwAnim = null; b.swing = null; b.checkAnim = null;
  });
  // Room above them to climb on behind.
  vic.y = Math.max(vic.y, vic.r * RNC_OFF_Y + self.r + 4);
  floater(vic.x, vic.y - vic.r - 60, "REAR NAKED CHOKE", "crit");
  playPunch(20);
  if (!reduceMotion) shake = Math.max(shake, 8);
}

// Runs on the fighter applying the choke; the one in it is held still.
function updateRnc(self, dt) {
  var c = self.rnc, vic = balls[c.vicId];
  if (!self.alive || !vic.alive) { endRnc(self); return; }
  c.t += dt;
  // On their back: behind and above them, its head peeking over one
  // shoulder.
  var jit = reduceMotion || c.phase !== "squeeze" ? 0 : 1.6;
  self.vx = 0; self.vy = 0; vic.vx = 0; vic.vy = 0;
  self.x = vic.x + c.side * vic.r * RNC_OFF_X + (Math.random() - 0.5) * jit;
  self.y = vic.y - vic.r * RNC_OFF_Y + (Math.random() - 0.5) * jit;

  if (c.phase === "squeeze") {
    var p = Math.min(1, c.t / c.dur), sgn = c.taps ? 1 : -1;
    var swing = Math.sin(c.t * 4.3 + c.wob) * Math.sin(c.t * 1.7 + c.wob * 0.5) * 0.55 * (1 - p);
    c.bar = Math.max(-1, Math.min(1, sgn * Math.pow(p, 2.2) + swing));
    if (p < 1) return;
    c.bar = sgn;
    if (c.taps) {
      c.phase = "tap";
      floater(vic.x, vic.y - vic.r - 30, "TAP", "crit");
      playPunch(10);
      return;
    }
    // They turn in to face it and pop free.
    floater(vic.x, vic.y - vic.r - 30, "ESCAPE", "note");
    self.rncCd = (self.char.rnc || defaultRnc()).cooldown;
    endRnc(self);
    var a = -Math.PI / 2 + c.side * (0.5 + Math.random() * 0.4);
    self.vx = Math.cos(a) * RNC_ESCAPE_SPEED; self.vy = Math.sin(a) * RNC_ESCAPE_SPEED;
    vic.vx = -Math.cos(a) * RNC_ESCAPE_SPEED; vic.vy = -Math.sin(a) * RNC_ESCAPE_SPEED;
    return;
  }
  c.tapT += dt;
  if (c.tapT >= RNC_TAP_TIME) {
    endRnc(self);
    submit(vic);
  }
}

function endRnc(self) {
  if (!self.rnc) return;
  balls[self.rnc.vicId].choked = false;
  self.rnc = null;
}

// The one taking the back is drawn behind the one it's choking.
function rncBehind(b) {
  return !!b.rnc;
}

function drawRncs() {
  balls.forEach(function (self) {
    var c = self.rnc;
    if (!c) return;
    var vic = balls[c.vicId], r = vic.r, s = c.side, vx = vic.x, vy = vic.y;
    var squeeze = c.phase === "tap" ? 1 : Math.max(0, c.bar);
    var limb = self.r * 0.2, skin = armColor(self.char);
    ctx.save();

    // Their face (the top third of the ball) goes red as the choke sinks in.
    if (squeeze > 0) {
      ctx.save();
      ctx.beginPath(); ctx.arc(vx, vy, r, 0, Math.PI * 2); ctx.clip();
      ctx.globalAlpha = 0.55 * squeeze;
      ctx.fillStyle = "#d62020";
      ctx.beginPath(); ctx.arc(vx, vy - r * 0.66, r * 0.38, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }

    // Hooks in: both legs come round from behind their hips and cross over
    // their stomach, feet tucked in (its shorts are hidden behind them).
    drawBjjLeg(self.char, { x: vx - s * r * 0.97, y: vy + r * 0.32 }, { x: vx - s * r * 0.6, y: vy + r * 0.8 },
      { x: vx + s * r * 0.22, y: vy + r * 0.7 }, limb, s * 1.1, r * 0.2, true);
    drawBjjLeg(self.char, { x: vx + s * r * 0.97, y: vy + r * 0.32 }, { x: vx + s * r * 0.6, y: vy + r * 0.8 },
      { x: vx - s * r * 0.22, y: vy + r * 0.7 }, limb, -s * 1.1, r * 0.2, true);

    // The arm behind their head: only the forearm shows, coming out from
    // behind the far side of their head down to the elbow (the hand's out of
    // sight on the back of the head).
    var neckY = vy - r * 0.16;
    var elbow = { x: vx - s * r * 0.86, y: neckY + r * 0.04 };
    strokeLimb(limb, skin, function () {
      ctx.moveTo(vx - s * r * 0.74, vy - r * 0.74);
      ctx.quadraticCurveTo(vx - s * r * 0.98, vy - r * 0.6, elbow.x, elbow.y);
    });
    // The choking arm: over their near shoulder and right across the front
    // of the neck, cinched tighter as it sinks in, hand gripping the other
    // bicep.
    var cinch = squeeze * r * 0.06;
    strokeLimb(limb, skin, function () {
      ctx.moveTo(vx + s * r * 1.0, vy - r * 0.5);
      ctx.quadraticCurveTo(vx + s * r * 0.55, neckY + cinch, vx - s * r * 0.1, neckY + cinch);
      ctx.lineTo(elbow.x + s * r * 0.12, elbow.y - r * 0.02);
    });
    drawGloveAt(elbow.x + s * r * 0.1, elbow.y - r * 0.06, self.r * 0.26, self.char);

    // Their arms: up from the shoulders, elbows tucked, both hands gripping
    // the choking arm and tugging at it. When they tap, the near hand lets go
    // and pats the arm three times instead.
    var vlimb = r * 0.17, vskin = armColor(vic.char), tug = c.phase === "squeeze" ? Math.sin(c.t * 9 + c.wob) * r * 0.03 : 0;
    var pat = c.phase === "tap" ? Math.abs(Math.sin(c.tapT / RNC_TAP_TIME * Math.PI * 3)) * r * 0.22 : 0;
    var grips = [
      { sh: { x: vx + s * r * 0.78, y: vy + r * 0.02 }, el: { x: vx + s * r * 0.62, y: vy + r * 0.4 }, h: { x: vx + s * r * 0.42, y: neckY - r * 0.05 + cinch + tug - pat } },
      { sh: { x: vx - s * r * 0.78, y: vy + r * 0.02 }, el: { x: vx - s * r * 0.3, y: vy + r * 0.42 }, h: { x: vx - s * r * 0.08, y: neckY - r * 0.02 + cinch - tug } }
    ];
    grips.forEach(function (g) {
      strokeLimb(vlimb, vskin, function () {
        ctx.moveTo(g.sh.x, g.sh.y);
        ctx.quadraticCurveTo(g.el.x, g.el.y, g.h.x, g.h.y + r * 0.08);
      });
      drawGloveAt(g.h.x, g.h.y, r * 0.19, vic.char);
    });

    // Tug-of-war bar: its colour is the choke, theirs the escape.
    var bw = 150, bh = 12;
    var bx = Math.min(W - bw - 6, Math.max(6, vx - bw / 2));
    var by = self.y - self.r - 64;
    if (by < 8) by = vy + r + 30;
    var split = bw * (c.bar + 1) / 2;
    ctx.fillStyle = self.char.color; ctx.fillRect(bx, by, split, bh);
    ctx.fillStyle = vic.char.color; ctx.fillRect(bx + split, by, bw - split, bh);
    ctx.lineWidth = 2.5; ctx.strokeStyle = theme.wall; ctx.strokeRect(bx, by, bw, bh);
    ctx.fillStyle = theme.ink;
    ctx.fillRect(bx + split - 2, by - 4, 4, bh + 8);
    ctx.restore();
  });
}
