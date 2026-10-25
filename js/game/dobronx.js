// Do Bronx: Charles Oliveira's special move.
//
// When the special bar fills, he stops and hits a pose that blasts the
// opponent away from him. The crowd goes wild taking pictures, the camera
// flashes white out the screen for a moment, and when it clears the arena
// has turned Brazil themed (stadium.js): Brazil shirts, flags and signs, a
// green walkway, a Brazil mat, every fan on their feet.
//
// For `duration` seconds (15) after that he's in the Do Bronx state:
//   - all his hits do double damage
//   - he's more likely to score takedowns: he always shoots on contact (even
//     against a Grappler), his grab reaches further, and the opponent sprawls
//     half as often
//   - every takedown he lands goes straight into a submission attempt
// Nothing can touch him while he poses: hits and grabs are dodged.
// Then he hits another pose, the cameras flash again and everything goes
// back to normal: his state, the fans and the arena. The bar starts over.
"use strict";

var DB_POSE_TIME = 1.2;      // the opening pose
var DB_OUTRO_TIME = 1.0;     // the closing pose
var DB_FLASH_AT = 0.35;      // into a pose when the cameras go off
var DB_PUSH_SPEED = 900;     // how hard the pose blasts the opponent away
var DB_REACH = 16;           // extra grab reach while it's on
var DB_FLASH_TIME = 0.7;     // how long the white-out takes to clear

var brazilMode = false;      // the arena is Brazil themed right now
var screenFlash = 0;         // white-out over the whole screen (1 = full)
var cameraFlashes = [];      // pops of camera flash in the crowd

function resetDoBronx() {
  brazilMode = false;
  screenFlash = 0;
  cameraFlashes = [];
  if (typeof stadiumCache !== "undefined") stadiumCache.key = null;
}

// Runs for a fighter whose special is Do Bronx, from updateSpecial. Returns
// true while it's posing (it does nothing else).
function updateDoBronx(self, other, dt) {
  var sp = self.char.special, m = self.igbb;
  if (!m) {
    var db = self.doBronx;
    if (db) {
      // Running: fights as normal, with the boosts, until the time's up
      // (the clock runs in tickDoBronxFx), then poses once it's free to.
      if (!other.alive || db.t < db.dur || specialBusy(self) || self.punch || self.kick) return false;
      self.igbb = { move: "dobronx", phase: "outro", t: 0 };
      clearActions(self);
      floater(self.x, self.y - self.r - 26, "OBRIGADO!", "note");
      return true;
    }
    if (self.specialT < sp.chargeTime || !canStartIgbb(self, other)) return false;
    self.igbb = { move: "dobronx", phase: "pose", t: 0 };
    clearActions(self);
    floater(self.x, self.y - self.r - 26, "DO BRONX!", "crit");
    playWhoosh();
  }
  m = self.igbb;
  m.t += dt;
  self.vx = 0; self.vy = 0;
  if (!m.flashed && m.t >= DB_FLASH_AT) {
    m.flashed = true;
    if (m.phase === "pose") blastAway(self, other);
    cameraFlash();
    brazilMode = m.phase === "pose"; // swaps behind the white-out
  }
  if (m.t < (m.phase === "pose" ? DB_POSE_TIME : DB_OUTRO_TIME)) return true;
  self.igbb = null;
  if (m.phase === "pose") {
    self.doBronx = { t: 0, dur: sp.duration || 15 };
  } else {
    self.doBronx = null;
    self.specialT = 0;
  }
  setSpeed(self, SPEED);
  return true;
}

// Striking a Do Bronx pose (the opening or the closing one): nothing can
// touch him. Hits and grabs that reach him are dodged, so a takedown can't
// knock him out of the pose and leave him restarting it over and over.
function doBronxPosing(b) {
  return !!(b.igbb && b.igbb.move === "dobronx");
}

function doBronxDodge(b) {
  if (b.immuneCd <= 0) {
    floater(b.x, b.y - b.r - 8, "DODGE", "dodge");
    b.immuneCd = 0.3;
  }
  b.justDodged = true;
}

// The pose knocks the opponent back: no damage, just a shockwave.
function blastAway(self, other) {
  if (!other.alive) return;
  var dx = other.x - self.x, dy = other.y - self.y, d = Math.sqrt(dx * dx + dy * dy) || 1;
  clearActions(other);
  other.vx = dx / d * DB_PUSH_SPEED; other.vy = dy / d * DB_PUSH_SPEED;
  other.knockFly = 0.35;
  other.squash = { t: 0.18, max: 0.18, nx: -dx / d, ny: -dy / d };
  other.flash = 0.16;
  impacts.push({ x: self.x, y: self.y, nx: dx / d, ny: dy / d, life: 0.6, max: 0.6, color: self.char.color });
  impacts.push({ x: self.x, y: self.y, nx: -dx / d, ny: -dy / d, life: 0.6, max: 0.6, color: "#009c3b" });
  igbbSparks(self.x, self.y, dx / d, dy / d, "#ffdf00", 26, 520);
  if (!reduceMotion) shake = Math.max(shake, 16);
  playSlam();
}

// The crowd's cameras all go off at once: the screen whites out and flashes
// pop all over the stands.
function cameraFlash() {
  screenFlash = 1;
  cameraFlashes = [];
  if (typeof stadiumFans === "undefined") return;
  for (var i = 0; i < 70; i++) {
    var f = stadiumFans[Math.floor(Math.random() * stadiumFans.length)];
    cameraFlashes.push({ x: f.x + (Math.random() - 0.5) * f.r, y: f.y - f.r * 1.2, at: Math.random() * 1.4, life: 0.18 + Math.random() * 0.12, r: f.r * (0.5 + Math.random() * 0.4) });
  }
  playPunch(30);
}

// Double damage for everything a fighter in the Do Bronx state lands.
function doBronxMult(attackerId) {
  return attackerId != null && balls[attackerId] && balls[attackerId].doBronx ? 2 : 1;
}

function tickDoBronxFx(dt) {
  // The state's clock keeps running whatever he's doing (even while he's
  // being slammed or choked), so it's always 15 real seconds.
  if (balls && started && !over) balls.forEach(function (b) { if (b.doBronx && b.alive) b.doBronx.t += dt; });
  if (screenFlash > 0) screenFlash = Math.max(0, screenFlash - dt / DB_FLASH_TIME);
  cameraFlashes.forEach(function (c) { c.at -= dt; });
  cameraFlashes = cameraFlashes.filter(function (c) { return c.at + c.life > 0; });
}

// Camera pops in the stands (stage units, drawn by drawStadium).
function drawCameraFlashes() {
  cameraFlashes.forEach(function (c) {
    if (c.at > 0) return;
    var k = 1 + c.at / c.life; // 1 when it pops, 0 when it's gone
    ctx.save();
    ctx.globalAlpha = Math.max(0, k);
    ctx.fillStyle = "rgba(255,255,255,0.35)";
    ctx.beginPath(); ctx.arc(c.x, c.y, c.r * 1.8, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.beginPath(); ctx.arc(c.x, c.y, c.r * 0.6, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(c.x - c.r * 1.6, c.y); ctx.lineTo(c.x + c.r * 1.6, c.y);
    ctx.moveTo(c.x, c.y - c.r * 1.6); ctx.lineTo(c.x, c.y + c.r * 1.6);
    ctx.stroke();
    ctx.restore();
  });
}

// The white-out over everything (screen pixels).
function drawScreenFlash() {
  if (screenFlash <= 0) return;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = "rgba(255,255,255," + Math.min(1, screenFlash * 1.25) + ")";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// The test arena's floor gets a faded Brazil flag too (arena units).
function drawBrazilFloor() {
  ctx.save();
  ctx.globalAlpha = 0.18;
  ctx.fillStyle = "#009c3b"; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "#ffdf00";
  ctx.beginPath(); ctx.moveTo(W / 2, H * 0.12); ctx.lineTo(W * 0.9, H / 2); ctx.lineTo(W / 2, H * 0.88); ctx.lineTo(W * 0.1, H / 2); ctx.closePath(); ctx.fill();
  ctx.fillStyle = "#002776";
  ctx.beginPath(); ctx.arc(W / 2, H / 2, W * 0.17, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

// The poses: a double-biceps flex, gloves up by the head. While the state
// is on he glows green and gold.
function drawDoBronx(b) {
  if (!b.alive) return;
  var r = b.r;
  if (b.doBronx) {
    var pulse = 0.5 + 0.5 * Math.sin(b.doBronx.t * 8);
    ctx.save();
    ctx.lineWidth = 4;
    ctx.globalAlpha = 0.55 + 0.3 * pulse;
    ctx.strokeStyle = "#ffdf00";
    ctx.beginPath(); ctx.arc(b.x, b.y, r + 7 + pulse * 3, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = "#009c3b"; ctx.lineWidth = 3;
    ctx.setLineDash([8, 7]); ctx.lineDashOffset = -b.doBronx.t * 40;
    ctx.beginPath(); ctx.arc(b.x, b.y, r + 13 + pulse * 3, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
  }
  var m = b.igbb;
  if (!m || m.move !== "dobronx") return;
  var k = Math.min(1, m.t / 0.25); k = k * k * (3 - 2 * k); // arms snap up
  var flex = m.t > 0.25 ? Math.sin((m.t - 0.25) * 18) * r * 0.04 : 0;
  var size = b.char.punch.size || 15;
  [-1, 1].forEach(function (s) {
    var shx = b.x + s * r * 0.75, shy = b.y - r * 0.15;
    var elx = b.x + s * r * (0.9 + 0.55 * k), ely = b.y - r * (0.15 + 0.15 * k);
    var hx = b.x + s * r * (0.85 + 0.35 * k), hy = b.y - r * (0.3 + 0.85 * k) - flex;
    strokeLimb(size * 0.75, armColor(b.char), function () {
      ctx.moveTo(shx, shy); ctx.lineTo(elx, ely); ctx.lineTo(hx, hy);
    });
    ctx.fillStyle = gloveColor(b.char); ctx.strokeStyle = theme.wall; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(hx, hy, size * 0.95, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  });
}
