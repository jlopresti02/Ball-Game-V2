// Do Bronx: Charles Oliveira's special move.
//
// When the special bar fills, he stops and hits a pose that blasts the
// opponent away from him. The crowd goes wild taking pictures, the camera
// flashes white out the screen for a moment, and when it clears the arena
// has turned Brazil themed (stadium.js): Brazil shirts, flags and signs, a
// green walkway, a Brazil mat, every fan on their feet.
//
// For `duration` seconds (15) after that he's in the Do Bronx state:
//   - all his hits do extra damage (special.damageMult: 4x)
//   - he's more likely to score takedowns: he always shoots on contact (even
//     against a Grappler), his grab reaches further, and the opponent sprawls
//     half as often
//   - every takedown he lands goes straight into a submission attempt
// Nothing can touch him while he poses: hits and grabs are dodged.
// Then he hits another pose, the cameras flash again and everything goes
// back to normal: his state, the fans and the arena. The bar starts over.
"use strict";

var DB_POSE_TIME = 3.6;      // the opening pose: "Charrrles... Do... BRONX!" (audio.js)
var DB_OUTRO_TIME = 1.0;     // the closing pose
var DB_FLASH_AT = DO_BRONX_HIT; // into the opening pose when the cameras go off, on "Bronx"
var DB_OUTRO_FLASH_AT = 0.35; // into the closing pose
var DB_PUSH_SPEED = 900;     // how hard the pose blasts the opponent away
var DB_REACH = 16;           // extra grab reach while it's on
var DB_FLASH_TIME = 0.7;     // how long the white-out takes to clear

var brazilMode = false;      // the arena is Brazil themed right now
var screenFlash = 0;         // white-out over the whole screen (1 = full)
var cameraFlashes = [];      // pops of camera flash in the crowd
var auraSnd = null;          // the aura's looping hum (audio.js)
var auraOn = false;          // the aura sound is on

function resetDoBronx() {
  brazilMode = false;
  screenFlash = 0;
  cameraFlashes = [];
  if (auraOn) { stopAuraSound(auraSnd, true); auraOn = false; auraSnd = null; }
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
    playDoBronx();
  }
  m = self.igbb;
  m.t += dt;
  self.vx = 0; self.vy = 0;
  if (!m.flashed && m.t >= (m.phase === "pose" ? DB_FLASH_AT : DB_OUTRO_FLASH_AT)) {
    m.flashed = true;
    if (m.phase === "pose") blastAway(self, other);
    cameraFlash();
    brazilMode = m.phase === "pose"; // swaps behind the white-out
    doBronxHair(self, m.phase === "pose"); // and his hair goes blond for it, black again after (Joe)
    if (m.phase === "outro") { crowdRelease(); releaseMusic(); } // background music back (music.js)
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

// Joe (2026-11-09): his normal hair is black, and it's blond for Do Bronx
// (special.hairColor). Swapped on his own copy of the character.
function doBronxHair(b, on) {
  var hc = b.char.special && b.char.special.hairColor;
  if (!hc) return;
  if (!b.dbBaseLook) b.dbBaseLook = b.char.look;
  b.char = Object.assign({}, b.char, { look: on ? Object.assign({}, b.dbBaseLook, { hairColor: hc }) : b.dbBaseLook });
  // The aura powers up with the blond hair and dies down with it (Joe).
  if (on && !auraOn) { auraSnd = startAuraSound(); auraOn = true; }
  else if (!on && auraOn) { stopAuraSound(auraSnd); auraSnd = null; auraOn = false; }
}

// Joe (2026-11-09): whenever his hair is blond he has a Super Saiyan style
// aura: a glowing golden flame shell flaring up high over his head, energy
// streaking up through it and lightning crackling over him. The flames are
// drawn behind his body, the lightning in front (draw.js).
function charlesBlond(b) {
  return !!(b.dbBaseLook && b.char.look !== b.dbBaseLook);
}

function drawSaiyanAura(b) {
  if (!b.alive || !charlesBlond(b)) return;
  var r = b.r, t = performance.now() / 1000;
  var pulse = 0.5 + 0.5 * Math.sin(t * 14); // the aura throbs fast, like it's powering up
  ctx.save();
  // Three flame shells: a wide gold one, a brighter yellow one, a white-hot core.
  [[1.0, 0.0], [0.8, 0.9], [0.6, 1.7]].forEach(function (L, li) {
    var sc = L[0], ph = L[1];
    ctx.beginPath();
    saiyanFlamePath(b.x, b.y, r * sc, t, ph, li);
    if (li === 0) {
      var g = ctx.createLinearGradient(0, b.y + r * 1.3, 0, b.y - r * 2.8);
      g.addColorStop(0, "rgba(255,170,0,0.6)");
      g.addColorStop(0.5, "rgba(255,206,30,0.5)");
      g.addColorStop(1, "rgba(255,236,120,0.28)");
      ctx.fillStyle = g;
      ctx.shadowColor = "rgba(255,200,0,0.9)"; ctx.shadowBlur = 18 + 10 * pulse;
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.lineWidth = 2.5; ctx.lineJoin = "round";
      ctx.strokeStyle = "rgba(255,150,0," + (0.65 + 0.25 * pulse) + ")";
      ctx.stroke();
    } else if (li === 1) {
      var g2 = ctx.createLinearGradient(0, b.y + r, 0, b.y - r * 2.6);
      g2.addColorStop(0, "rgba(255,226,60,0.65)"); g2.addColorStop(1, "rgba(255,240,140,0.3)");
      ctx.fillStyle = g2; ctx.fill();
    } else {
      var g3 = ctx.createLinearGradient(0, b.y + r * 0.8, 0, b.y - r * 2.0);
      g3.addColorStop(0, "rgba(255,255,235,0.8)"); g3.addColorStop(1, "rgba(255,250,200,0.0)");
      ctx.fillStyle = g3; ctx.fill();
    }
  });
  // Streaks of energy shooting up through it.
  ctx.lineCap = "round";
  for (var k = 0; k < 10; k++) {
    var p = (t * 1.6 + k * 0.137 + (k % 3) * 0.29) % 1;
    var sx = b.x + Math.sin(k * 2.39) * r * 1.05;
    var sy = b.y + r * 0.9 - p * r * 4.0;
    var len = r * (0.35 + 0.25 * ((k * 7) % 3) / 2);
    ctx.strokeStyle = "rgba(255,252,215," + (0.85 * Math.sin(p * Math.PI)) + ")";
    ctx.lineWidth = 2 + (k % 2);
    ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(sx, sy - len); ctx.stroke();
  }
  ctx.restore();
}

// The flame outline: a teardrop that hugs his sides and flares up high over
// his head, edged with tongues of flame that run up both sides.
function saiyanFlamePath(cx, cy, r, t, ph, li) {
  var n = 64;
  for (var i = 0; i <= n; i++) {
    var a = Math.PI / 2 + i / n * Math.PI * 2;       // starts at the bottom, goes all the way round
    var side = Math.cos(a), vert = Math.sin(a);      // vert -1 = top, 1 = bottom
    var up = Math.max(0, -vert);
    var s = (1 - vert) / 2;                           // 0 at the bottom, 1 at the top
    var base = r * (1.4 + 0.12 * up);
    // Tongues of flame scrolling upward along the edge.
    var wave = Math.sin(Math.PI * 2 * (s * 8 - t * 2.4) + ph + (side > 0 ? 0 : 1.3));
    var tongue = Math.pow(Math.max(0, wave), 2.2) * r * (0.2 + 0.6 * s);
    var flick = Math.sin(t * 23 + i * 2.1 + li) * r * 0.03;
    var rad = base + tongue + flick;
    var x = cx + side * rad * (1 - 0.22 * up * up);  // narrows toward the top
    var y = cy + vert * rad - r * 1.5 * Math.pow(up, 1.4) * (0.9 + 0.1 * Math.sin(t * 9 + li));
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.closePath();
}

// Lightning crackling over him now and then (drawn in front of him).
function drawSaiyanBolts(b) {
  if (!b.alive || !charlesBlond(b)) return;
  var r = b.r, t = performance.now() / 1000;
  var slot = Math.floor(t * 9);
  ctx.save();
  ctx.lineJoin = "round"; ctx.lineCap = "round";
  for (var j = 0; j < 2; j++) {
    var h = Math.sin((slot + j * 17) * 12.9898) * 43758.5453; h -= Math.floor(h);
    if (h > 0.45) continue;                             // only some slots crackle
    var a0 = h * 40, sx = b.x + Math.cos(a0) * r * 1.1, sy = b.y + Math.sin(a0) * r * 0.9;
    var pts = [[sx, sy]];
    for (var q = 1; q <= 4; q++) {
      var hh = Math.sin((slot * 5 + q * 31 + j * 7) * 78.233) * 12345.678; hh -= Math.floor(hh);
      pts.push([sx + (hh - 0.5) * r * 0.9, sy - q * r * 0.32 + (hh - 0.5) * r * 0.2]);
    }
    [[5, "rgba(120,200,255,0.45)"], [2, "rgba(235,250,255,0.95)"]].forEach(function (st) {
      ctx.lineWidth = st[0]; ctx.strokeStyle = st[1];
      ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
      for (var q = 1; q < pts.length; q++) ctx.lineTo(pts[q][0], pts[q][1]);
      ctx.stroke();
    });
  }
  ctx.restore();
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
  playCameraFlashes();
}

// Extra damage for everything a fighter in the Do Bronx state lands
// (special.damageMult, double if it isn't set).
function doBronxMult(attackerId) {
  var b = attackerId != null && balls[attackerId];
  return b && b.doBronx ? (b.char.special.damageMult || 2) : 1;
}

function tickDoBronxFx(dt) {
  tickKamehameha(); // the Kamehameha's aura never gets left on (kamehameha.js)
  // The state's clock keeps running whatever he's doing (even while he's
  // being slammed or choked), so it's always 15 real seconds.
  if (balls && started && !over) balls.forEach(function (b) { if (b.doBronx && b.alive) b.doBronx.t += dt; });
  if (auraOn && (over || !balls || !balls.some(charlesBlond))) { stopAuraSound(auraSnd); auraSnd = null; auraOn = false; }
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

// The poses: a double-biceps flex, gloves up by the head.
function drawDoBronx(b) {
  if (!b.alive) return;
  var r = b.r;
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
