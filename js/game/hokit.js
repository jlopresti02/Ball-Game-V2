// Josh Hokit's two tricks (on top of the BMF base).
//
// Armbar shot (hasArmbarShot): every time he bumps into the opponent there's
// a `chance`% he shoots a double leg. The shot always lands (no sprawl, no
// weave, no block) and goes straight into an armbar, but he never finishes
// it: the armbar's tap odds are his own char.armbar, which he has at 0, so the
// one caught always escapes. Once they're out he's straight into a thumbs
// down at them.
//
// Thumbs down (hasThumbsDown): every `cooldown` seconds, when there's some
// space between them, he stops for a moment and gives the opponent a thumbs
// down. It gets to them: for `anger` seconds they steer straight at him, a
// little faster than normal, right into his jabs and weaves.
"use strict";

var SHOT_TIME = 0.42;       // level change and drive, before they hit the mat
var SHOT_DRIVE = 70;        // how far the drive carries them
var SHOT_ROLL_GAP = 1;      // seconds between rolls while they're touching
var MOCK_TIME = 1.0;        // the thumbs down
var MOCK_AT = 0.3;          // into it when it lands on them
var MOCK_GAP = 80;          // only bothers when they're at least this far apart
var ANGER_TURN = 7;         // how fast an angry fighter turns toward him (radians/second)
var ANGER_SPEED = 1.25;     // and how much faster it rolls

// Runs from updateAbilities for a fighter with either trick. Returns true
// while one of them has it busy.
function updateHokit(self, other, dt, d) {
  if (self.hokitShot) { updateShot(self, dt); return true; }
  if (self.mock) { updateMock(self, other, dt); return true; }
  if (!other.alive) return false;
  var free = !specialBusy(self) && !specialBusy(other) && !other.invincible && !self.punch;

  if (self.char.hasArmbarShot) {
    self.shotRollCd = Math.max(0, (self.shotRollCd || 0) - dt);
    if (free && self.shotRollCd === 0 && d < self.r + other.r + 6) {
      self.shotRollCd = SHOT_ROLL_GAP;
      if (Math.random() < self.char.armbarShot.chance / 100) { beginShot(self, other); return true; }
    }
  }

  if (self.char.hasThumbsDown) {
    self.mockCd = Math.max(0, self.mockCd - dt * self.atkRate);
    if (free && self.mockCd === 0 && d > self.r + other.r + MOCK_GAP) {
      clearActions(self);
      self.mock = { t: 0, landed: false, side: other.x >= self.x ? 1 : -1 };
      self.mockCd = self.char.thumbsDown.cooldown;
      self.vx = 0; self.vy = 0;
      return true;
    }
  }
  return false;
}

// The double leg: drops his level, wraps the legs and drives them back.
function beginShot(self, vic) {
  clearActions(self); clearActions(vic);
  var dx = vic.x - self.x, dy = vic.y - self.y, dd = Math.sqrt(dx * dx + dy * dy) || 1;
  self.hokitShot = { vicId: vic.id, t: 0, nx: dx / dd, ny: dy / dd, sx: self.x, sy: self.y, vx0: vic.x, vy0: vic.y };
  vic.choked = true; // held: it can't do anything until it's out of the armbar
  self.vx = 0; self.vy = 0; vic.vx = 0; vic.vy = 0;
  floater((self.x + vic.x) / 2, Math.min(self.y, vic.y) - self.r - 30, "DOUBLE LEG", "crit");
  playWhoosh();
}

function updateShot(self, dt) {
  var s = self.hokitShot, vic = balls[s.vicId];
  s.t += dt;
  if (!vic.alive || !self.alive) { vic.choked = false; self.hokitShot = null; return; }
  var p = Math.min(1, s.t / SHOT_TIME), drive = SHOT_DRIVE * p * p;
  vic.x = s.vx0 + s.nx * drive; vic.y = s.vy0 + s.ny * drive;
  self.x = s.sx + s.nx * drive; self.y = s.sy + s.ny * drive;
  vic.x = Math.min(W - vic.r, Math.max(vic.r, vic.x)); vic.y = Math.min(H - vic.r, Math.max(vic.r, vic.y));
  if (p < 1) return;
  self.hokitShot = null;
  vic.choked = false;
  vic.squash = { t: 0.16, max: 0.16, nx: -s.nx, ny: -s.ny };
  impacts.push({ x: vic.x, y: vic.y, nx: -s.nx, ny: -s.ny, life: 0.4, max: 0.4, color: self.char.color });
  floater(vic.x, vic.y - vic.r - 8, "TAKEDOWN", "note");
  playSlam();
  if (!reduceMotion) shake = Math.max(shake, 10);
  recordTakedown(self.id);
  beginArmbar(self, vic); // never taps: his char.armbar odds are 0
  self.armbar.letGo = true;
}

// Called by armbar.js when the one caught in his armbar gets out: he lets it
// go and goes right into a thumbs down.
function onArmbarLetGo(self) {
  if (self.char.hasThumbsDown) self.mockCd = Math.min(self.mockCd, 0.6);
}

function updateMock(self, other, dt) {
  var m = self.mock;
  m.t += dt;
  self.vx = 0; self.vy = 0;
  if (!m.landed && m.t >= MOCK_AT) {
    m.landed = true;
    floater(self.x, self.y - self.r - 26, "👎", "crit");
    if (other.alive) {
      other.angry = { t: 0, dur: self.char.thumbsDown.anger, atId: self.id };
      floater(other.x, other.y - other.r - 26, "ANGRY", "note");
    }
  }
  if (m.t >= MOCK_TIME) { self.mock = null; setSpeed(self, self.baseSpeed || SPEED); }
}

// Runs every frame from update(): someone he's angered turns toward him.
function steerAngry(b, dt) {
  var a = b.angry;
  if (!a) return;
  a.t += dt;
  var tgt = balls[a.atId];
  if (a.t >= a.dur || !tgt.alive || !b.alive) { b.angry = null; return; }
  if (!inOrdinaryMovement(b)) return;
  var s = Math.sqrt(b.vx * b.vx + b.vy * b.vy) || 1;
  var cur = Math.atan2(b.vy, b.vx), want = Math.atan2(tgt.y - b.y, tgt.x - b.x);
  var diff = Math.atan2(Math.sin(want - cur), Math.cos(want - cur));
  var turn = Math.max(-ANGER_TURN * dt, Math.min(ANGER_TURN * dt, diff));
  var sp = Math.max(s, (b.baseSpeed || SPEED) * ANGER_SPEED);
  b.vx = Math.cos(cur + turn) * sp; b.vy = Math.sin(cur + turn) * sp;
}

// The shot: arms wrapped round their legs, head tucked into their hip.
function drawShot(b) {
  var s = b.hokitShot;
  if (!s) return;
  var vic = balls[s.vicId], nx = s.nx, ny = s.ny, px = -ny, py = nx;
  var size = b.r * 0.2;
  [-1, 1].forEach(function (k) {
    var sh = { x: b.x + nx * b.r * 0.5 + px * k * b.r * 0.6, y: b.y + ny * b.r * 0.5 + py * k * b.r * 0.6 };
    var hand = { x: vic.x + nx * vic.r * 0.35 + px * k * vic.r * 0.55, y: vic.y + ny * vic.r * 0.35 + py * k * vic.r * 0.55 };
    strokeLimb(size, armColor(b.char), function () {
      ctx.moveTo(sh.x, sh.y);
      ctx.quadraticCurveTo(vic.x - nx * vic.r * 0.2 + px * k * vic.r * 1.05, vic.y - ny * vic.r * 0.2 + py * k * vic.r * 1.05, hand.x, hand.y);
    });
    drawGloveAt(hand.x, hand.y, b.r * 0.22, b.char);
  });
}

// The thumbs down: one arm out toward them, the glove turned over with the
// thumb pointing at the floor, pumping down twice.
function drawMock(b) {
  var m = b.mock;
  if (!m || !b.alive) return;
  var k = Math.min(1, m.t / 0.18); k = k * k * (3 - 2 * k);
  var pump = m.t > 0.18 ? Math.abs(Math.sin((m.t - 0.18) * 9)) * b.r * 0.12 : 0;
  var s = m.side, r = b.r, size = b.char.punch.size || 13;
  var sh = { x: b.x + s * r * 0.7, y: b.y - r * 0.1 };
  var hand = { x: b.x + s * r * (0.8 + 0.65 * k), y: b.y - r * (0.1 + 0.35 * k) + pump };
  strokeLimb(size * 0.75, armColor(b.char), function () { ctx.moveTo(sh.x, sh.y); ctx.lineTo(hand.x, hand.y); });
  var gr = size * 0.95;
  ctx.save();
  ctx.fillStyle = gloveColor(b.char); ctx.strokeStyle = theme.wall; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(hand.x, hand.y, gr, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  // The thumb, sticking straight down out of the glove.
  ctx.beginPath();
  ctx.ellipse(hand.x + s * gr * 0.15, hand.y + gr * 1.25, gr * 0.4, gr * 0.78, 0, 0, Math.PI * 2);
  ctx.fill(); ctx.stroke();
  ctx.restore();
  // The other glove stays up by the chin.
  ctx.fillStyle = gloveColor(b.char); ctx.strokeStyle = theme.wall; ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.arc(b.x - s * r * 0.55, b.y - r * 0.55, size * 0.85, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
}

// Fuming: a red glow and an anger mark over its head.
function drawAngry(b) {
  var a = b.angry;
  if (!a || !b.alive) return;
  var fade = Math.min(1, (a.dur - a.t) / 0.4, a.t / 0.15);
  var pulse = 0.5 + 0.5 * Math.sin(a.t * 12);
  ctx.save();
  ctx.globalAlpha = (0.45 + 0.35 * pulse) * fade;
  ctx.strokeStyle = "#e11d2e"; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.arc(b.x, b.y, b.r + 5 + pulse * 3, 0, Math.PI * 2); ctx.stroke();
  // The anger mark: four bent ticks round a point.
  var cx = b.x + b.r * 0.55, cy = b.y - b.r * 1.05, u = b.r * (0.16 + 0.03 * pulse);
  ctx.globalAlpha = fade;
  ctx.strokeStyle = "#e11d2e"; ctx.lineWidth = 3.5; ctx.lineCap = "round";
  [[1, 1], [-1, 1], [1, -1], [-1, -1]].forEach(function (q) {
    ctx.beginPath();
    ctx.moveTo(cx + q[0] * u * 0.4, cy + q[1] * u * 1.5);
    ctx.lineTo(cx + q[0] * u * 0.4, cy + q[1] * u * 0.4);
    ctx.lineTo(cx + q[0] * u * 1.5, cy + q[1] * u * 0.4);
    ctx.stroke();
  });
  ctx.restore();
}
