// Armbar from the guard. When the guard player catches the opponent stepping
// in (or a Do Bronx takedown goes into a submission) and "armbar" is the
// submission picked from its guard's `subs`, it stays flat on its back,
// grabs the opponent's wrist to its chest, swings both legs up over them (one
// across the face, one across the chest) and straightens the arm across its
// hips. The same tug-of-war bar as the other submissions decides it: the tap
// (a win by submission) or the escape (they rip the arm out and pop free).
// Tap odds: `tapBase`% at full health, plus up to `tapLowHp`% more the more
// damage the one caught has taken.
"use strict";

var ARMBAR_MIN_TIME = 2.4, ARMBAR_MAX_EXTRA = 1.2;
var ARMBAR_TAP_TIME = 0.75;
var ARMBAR_ESCAPE_SPEED = 340;
var ARMBAR_GAP = 0.85; // how close the opponent is held (1 = just touching)

function beginArmbar(self, vic) {
  var ab = self.char.armbar || defaultArmbar();
  var hurtFrac = 1 - Math.max(0, Math.min(1, vic.hp / MAX_HP));
  var tapChance = Math.min(95, ab.tapBase + ab.tapLowHp * hurtFrac);
  var side = vic.x >= self.x ? 1 : -1;
  // Room on that side to pull them in, or it turns to the other side.
  var gap = (self.r + vic.r) * ARMBAR_GAP;
  if (self.x + side * (gap + vic.r) > W || self.x + side * (gap + vic.r) < 0) side = -side;
  self.armbar = {
    vicId: vic.id, t: 0, dur: ARMBAR_MIN_TIME + Math.random() * ARMBAR_MAX_EXTRA,
    taps: Math.random() < tapChance / 100, bar: 0, phase: "squeeze", tapT: 0,
    side: side, wob: Math.random() * 10
  };
  vic.choked = true;
  self.guard = null;
  [self, vic].forEach(function (b) {
    b.vx = 0; b.vy = 0;
    b.punch = null; b.kick = null; b.throwAnim = null; b.swing = null; b.checkAnim = null;
  });
  self.y = Math.max(self.y, vic.r * 1.4 + 4);
  floater((self.x + vic.x) / 2, Math.min(self.y, vic.y) - vic.r - 60, "ARMBAR", "crit");
  playPunch(20);
  if (!reduceMotion) shake = Math.max(shake, 8);
}

// Runs on the guard player; the one caught in it is held still.
function updateArmbar(self, dt) {
  var c = self.armbar, vic = balls[c.vicId];
  if (!self.alive || !vic.alive) { endArmbar(self); return; }
  c.t += dt;
  // Pulled in over its hips, bent over toward it.
  var jit = reduceMotion || c.phase !== "squeeze" ? 0 : 1.6;
  self.vx = 0; self.vy = 0; vic.vx = 0; vic.vy = 0;
  vic.x = self.x + c.side * (self.r + vic.r) * ARMBAR_GAP + (Math.random() - 0.5) * jit;
  vic.y = self.y - self.r * 0.3 + (Math.random() - 0.5) * jit;

  if (c.phase === "squeeze") {
    var p = Math.min(1, c.t / c.dur), sgn = c.taps ? 1 : -1;
    var swing = Math.sin(c.t * 4.1 + c.wob) * Math.sin(c.t * 1.8 + c.wob * 0.5) * 0.55 * (1 - p);
    c.bar = Math.max(-1, Math.min(1, sgn * Math.pow(p, 2.2) + swing));
    if (p < 1) return;
    c.bar = sgn;
    if (c.taps) {
      c.phase = "tap";
      floater(vic.x, vic.y - vic.r - 30, "TAP", "crit");
      playPunch(10);
      return;
    }
    // They rip the arm out and spin away.
    floater(vic.x, vic.y - vic.r - 30, "ESCAPE", "note");
    endArmbar(self);
    var a = -Math.PI / 2 + c.side * (0.6 + Math.random() * 0.4);
    vic.vx = Math.cos(a) * ARMBAR_ESCAPE_SPEED; vic.vy = Math.sin(a) * ARMBAR_ESCAPE_SPEED;
    self.vx = -Math.cos(a) * ARMBAR_ESCAPE_SPEED * 0.6; self.vy = -Math.sin(a) * ARMBAR_ESCAPE_SPEED * 0.6;
    return;
  }
  c.tapT += dt;
  if (c.tapT >= ARMBAR_TAP_TIME) {
    endArmbar(self);
    submit(vic);
  }
}

function endArmbar(self) {
  if (!self.armbar) return;
  balls[self.armbar.vicId].choked = false;
  self.armbar = null;
}

// How far it's cranked right now (0 to 1).
function armbarSqueeze(c) {
  return c.phase === "tap" ? 1 : Math.max(0, c.bar);
}

// The one caught in it is pulled over, bent toward the guard player.
function applyArmbarPose(b) {
  if (!b.choked) return;
  var c = balls[1 - b.id].armbar;
  if (!c) return;
  ctx.translate(b.x, b.y);
  ctx.rotate(-c.side * (0.3 + 0.15 * armbarSqueeze(c)));
  ctx.translate(-b.x, -b.y);
}

function drawArmbars() {
  balls.forEach(function (self) {
    var c = self.armbar;
    if (!c) return;
    var vic = balls[c.vicId], s = c.side, r = self.r, ar = vic.r;
    var sx = self.x, sy = self.y, vx = vic.x, vy = vic.y;
    var squeeze = armbarSqueeze(c);
    var limb = r * 0.2, skin = armColor(self.char), legSkin = self.char.look ? self.char.look.skin : self.char.color;
    ctx.save();

    // Both legs up from its hips: one across their neck, one across their
    // stomach, squeezing their shoulder between them.
    var hip = { x: sx + s * r * 0.7, y: sy };
    strokeLimb(limb * 1.25, legSkin, function () {
      ctx.moveTo(hip.x, hip.y - r * 0.15);
      ctx.quadraticCurveTo(vx - s * ar * 0.3, vy - ar * 0.8, vx + s * ar * 0.85, vy - ar * 0.42);
    });
    strokeLimb(limb * 1.25, legSkin, function () {
      ctx.moveTo(hip.x, hip.y + r * 0.15);
      ctx.quadraticCurveTo(vx - s * ar * 0.1, vy + ar * 0.6, vx + s * ar * 0.9, vy + ar * 0.38);
    });

    // Their arm, pulled straight across its hips to its chest, the elbow
    // bending the wrong way as it's cranked.
    var sh = { x: vx - s * ar * 0.72, y: vy + ar * 0.05 };
    var wrist = { x: sx - s * r * 0.1, y: sy - r * 0.12 };
    var elbow = { x: (sh.x + wrist.x) / 2, y: (sh.y + wrist.y) / 2 - squeeze * r * 0.22 };
    strokeLimb(ar * 0.2, armColor(vic.char), function () {
      ctx.moveTo(sh.x, sh.y);
      ctx.lineTo(elbow.x, elbow.y);
      ctx.lineTo(wrist.x, wrist.y);
    });
    drawGloveAt(wrist.x - s * r * 0.08, wrist.y, ar * 0.22, vic.char);

    // Its arms hugging the wrist to its chest.
    [-1, 1].forEach(function (k) {
      var g = { x: wrist.x + s * r * 0.12, y: wrist.y + k * r * 0.2 };
      strokeLimb(limb, skin, function () {
        ctx.moveTo(sx - s * r * 0.35, sy + k * r * 0.6);
        ctx.quadraticCurveTo(sx - s * r * 0.05, sy + k * r * 0.55, g.x, g.y);
      });
      drawGloveAt(g.x, g.y, r * 0.22, self.char);
    });

    // Tapping: their free hand pats its leg three times.
    if (c.phase === "tap") {
      var pat = Math.abs(Math.sin(c.tapT / ARMBAR_TAP_TIME * Math.PI * 3));
      drawGloveAt(vx + s * ar * 0.55, vy + ar * 0.45 - pat * ar * 0.2, ar * 0.22, vic.char);
    }

    // Tug-of-war bar: its colour is the armbar, theirs the escape.
    var bw = 150, bh = 12;
    var bx = Math.min(W - bw - 6, Math.max(6, (sx + vx) / 2 - bw / 2));
    var by = Math.min(sy, vy) - Math.max(r, ar) - 64;
    if (by < 8) by = Math.max(sy, vy) + Math.max(r, ar) + 30;
    var split = bw * (c.bar + 1) / 2;
    ctx.fillStyle = self.char.color; ctx.fillRect(bx, by, split, bh);
    ctx.fillStyle = vic.char.color; ctx.fillRect(bx + split, by, bw - split, bh);
    ctx.lineWidth = 2.5; ctx.strokeStyle = theme.wall; ctx.strokeRect(bx, by, bw, bh);
    ctx.fillStyle = theme.ink;
    ctx.fillRect(bx + split - 2, by - 4, 4, bh + 8);
    ctx.restore();
  });
}
