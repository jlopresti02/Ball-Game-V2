// Justin Gaethje's golf mode.
//
// If one of his own Eagle Strike eagles (gaethje-eagle.js) swoops through
// him, it snatches him up instead: carries him up and across the ring and
// drops him, and he lands wearing a red MAGA cap with a golf club in his
// hands. An eagle also comes for him on purpose the moment Dustin goes into
// Diamond Guard (diamond.js) or Gane pulls out his bat (cheater.js).
//
// With the club he fights like Gane with his bat (it's the same code, in
// cheater.js, with `gaethje.golf.club` for the numbers), so Diamond Guard
// Dustin's sword clash parries it too, and a sword duel can rip it out of
// his hands. Every few seconds, when they're far enough off, he stops, tees
// one up and drives a golf ball at them ("FORE!"). After `duration` seconds
// he tosses the club away and goes back to fighting; the cap stays on.
//
// Settings, under `gaethje.golf` in the character JSON:
//   duration       seconds he has the club
//   club           the swing, like Gane's `cheater.bat` (damage, cooldown,
//                  windup, swing, follow, reach, knockback)
//   ball           every [min, max] seconds, damage, speed, minDist (only
//                  tees off when they're at least this far away)
"use strict";

var GOLF_CLUB_LEN = 2.2;   // club length, in ball radii
var GOLF_CLUB_THICK = 1.8; // the picture drawn this much fatter across, so the shaft and head read at fight size
var EC_UP = 0.5, EC_MOVE = 0.9, EC_DROP = 0.35, EC_HIGH = 120; // the carry: lift, fly across, drop; how high
// The golf shot's timeline (seconds into it).
var GS_SET = 0.25, GS_ADDRESS = 0.8, GS_TOP = 1.2, GS_HIT = 1.3, GS_END = 1.75;

var golfBallImg = new Image(); golfBallImg.src = GOLF_BALL_SRC; // golf-art.js
var golfClubImg = new Image(); golfClubImg.src = GOLF_CLUB_SRC;

function golfCfg(b) { return b.char.gaethje && b.char.gaethje.golf; }
function golfing(b) { return !!(b.cheater && b.cheater.club); }
function golfGap(cfg) { var e = cfg.ball.every; return e[0] + Math.random() * (e[1] - e[0]); }

// ---------------------------------------------------------------- the snatch

// Can his eagle pick him up right now?
function canSnatch(b) {
  return !!(golfCfg(b) && b.alive && !golfing(b) && !b.igbb && !specialBusy(b) && !swordDuelLocked(b));
}

function startEagleCarry(self, e) {
  clearActions(self); self.cheater = null;
  self.dizzy = null; self.slam = null;
  self.vx = 0; self.vy = 0;
  self.invincible = true; self.immuneCd = 9;
  // Dropped somewhere across the ring, away from the cage.
  var other = balls[1 - self.id], to = null;
  for (var i = 0; i < 12; i++) {
    var p = { x: self.r * 2 + Math.random() * (W - self.r * 4), y: EC_HIGH + self.r * 1.6 + Math.random() * (H - EC_HIGH - self.r * 3.6) };
    var dd = Math.hypot(p.x - self.x, p.y - self.y), od = Math.hypot(p.x - other.x, p.y - other.y);
    if (dd > 120 && od > 110) { to = p; break; }
  }
  if (!to) to = { x: W - self.x, y: Math.max(EC_HIGH + self.r * 1.6, H - self.y) };
  self.igbb = { move: "eaglecarry", t: 0, from: { x: self.x, y: self.y }, to: to, z: 0, e: e };
  floater(self.x, self.y - self.r - 40, "SNATCHED!", "crit");
  playEagleScreech();
  if (!reduceMotion) { shake = Math.max(shake, 8); hitStop = Math.max(hitStop, 0.05); }
  for (var f = 0; f < 14 && !reduceMotion; f++) {
    var a = Math.random() * Math.PI * 2, sp = 80 + Math.random() * 200;
    particles.push({ x: self.x, y: self.y - self.r * 0.6, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 80, life: 0.7, max: 0.7, size: 3 + Math.random() * 3, color: f % 3 ? "#5a3a1e" : "#ffffff" });
  }
}

// From the abilities loop, before the special. True while he's being carried.
function updateEagleCarry(self, other, dt) {
  var m = self.igbb;
  if (!m || m.move !== "eaglecarry") return false;
  m.t += dt;
  self.vx = 0; self.vy = 0; self.immuneCd = 9;
  if (over) { endEagleCarry(self, false); return false; }
  var t = m.t, u;
  if (t < EC_UP) {
    u = t / EC_UP;
    m.z = EC_HIGH * (1 - (1 - u) * (1 - u));
    // Hauled down off the top wall as it climbs, so he stays in view.
    self.y = Math.max(m.from.y, Math.min(m.to.y, m.z + self.r * 1.6));
  } else if (t < EC_UP + EC_MOVE) {
    u = (t - EC_UP) / EC_MOVE; u = u * u * (3 - 2 * u);
    var fy = Math.max(m.from.y, Math.min(m.to.y, EC_HIGH + self.r * 1.6));
    self.x = m.from.x + (m.to.x - m.from.x) * u; self.y = fy + (m.to.y - fy) * u;
    m.z = EC_HIGH + Math.sin(u * Math.PI) * 30;
  } else if (t < EC_UP + EC_MOVE + EC_DROP) {
    if (!m.let) { m.let = true; floater(self.x, self.y - self.r - m.z - 30, "LET GO!", "note"); playWhoosh(); }
    u = (t - EC_UP - EC_MOVE) / EC_DROP;
    m.z = EC_HIGH * (1 - u * u);
  } else {
    endEagleCarry(self, true);
    return false;
  }
  return true;
}

function endEagleCarry(self, landed) {
  var m = self.igbb;
  self.igbb = null; self.invincible = false; self.immuneCd = 0;
  if (m && m.e) m.e.released = true;
  setSpeed(self, self.baseSpeed || SPEED);
  if (!landed || !self.alive) return;
  // Thud: lands in a cloud of dust, cap on, club in hand.
  self.squash = { t: 0.22, max: 0.22, nx: 0, ny: 1 };
  if (!reduceMotion) { shake = Math.max(shake, 14); hitStop = Math.max(hitStop, 0.05); }
  playSlam();
  for (var i = 0; i < 16 && !reduceMotion; i++) {
    var a = Math.PI + Math.random() * Math.PI, sp = 120 + Math.random() * 200;
    particles.push({ x: self.x, y: self.y + self.r * 0.8, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp * 0.4, life: 0.5, max: 0.5, size: 4 + Math.random() * 4, color: "rgba(190,175,150,0.8)" });
  }
  ["#c8102e", "#ffffff", "#1c2f6e"].forEach(function (c, ci) {
    for (var j = 0; j < 6 && !reduceMotion; j++) {
      var a2 = Math.random() * Math.PI * 2, s2 = 100 + Math.random() * 160;
      particles.push({ x: self.x, y: self.y - self.r, vx: Math.cos(a2) * s2, vy: Math.sin(a2) * s2 - 120, life: 0.8, max: 0.8, size: 3 + ci, color: c });
    }
  });
  startGolfMode(self);
}

// Drawn this far up while he's carried (draw.js adds it to his spot).
function eagleCarryOffset(b) {
  var m = b.igbb;
  if (!m || m.move !== "eaglecarry") return { x: 0, y: 0 };
  return { x: 0, y: -m.z };
}

// ---------------------------------------------------------------- golf mode

function startGolfMode(b) {
  var cfg = golfCfg(b);
  if (!cfg || !b.alive) return;
  b.maga = true;
  b.golfLeft = cfg.duration;
  b.cheater = { mode: "bat", club: true, cd: 0.4, golfCd: 1.2, cfg: { bat: cfg.club, ball: cfg.ball } };
  floater(b.x, b.y - b.r - 40, "GOLF MODE", "crit");
  crowdReact(0.8);
}

function endGolfMode(b, toss) {
  if (!golfing(b)) return;
  b.cheater = null;
  if (b.chAct && (b.chAct.kind === "bat" || b.chAct.kind === "golf")) b.chAct = null;
  if (toss && b.alive) {
    flyingBats.push({ x: b.x, y: b.y - b.r * 0.4, vx: (Math.random() < 0.5 ? -1 : 1) * 260, vy: -760, rot: 0, spin: 14, t: 0, len: weaponLen(b), trail: [], club: true }); // sword.js
    playWhoosh();
  }
}

// Every frame (update.js): the club's clock.
function tickGolf(dt) {
  balls.forEach(function (b) {
    if (!golfing(b)) return;
    if (!b.alive || over) { endGolfMode(b, false); return; }
    // His special takes over: the club goes.
    if (b.igbb || allAmericanOn()) { endGolfMode(b, true); return; }
    b.golfLeft -= dt;
    if (b.golfLeft <= 0 && !b.chAct) endGolfMode(b, true);
  });
}

// The shot itself (from updateCheaterAct, cheater.js): stopped dead, sets
// the ball down, waggles, takes it back and rips it at them.
function updateGolfShot(self, other, a, cfg, dt) {
  self.vx = 0; self.vy = 0;
  // The ball sits where the club head addresses it (kept with him if he's nudged).
  var g = golfGrip(self, a.dir, golfAngle(a, 0));
  if (!a.fired) { a.bx = g.head.x; a.by = g.head.y; }
  if (!a.fired && a.t >= GS_HIT) {
    a.fired = true;
    if (other.alive) {
      var dx = other.x - a.bx, dy = other.y - a.by, d = Math.sqrt(dx * dx + dy * dy) || 1;
      cheaterObjs.push({ x: a.bx, y: a.by, vx: dx / d * cfg.ball.speed, vy: dy / d * cfg.ball.speed, rot: 0, spin: 20,
        size: self.r * 0.34, obj: { name: "FORE!", damage: cfg.ball.damage, shape: "golfball" }, ownerId: self.id });
    }
    floater(self.x, self.y - self.r - 40, "FORE!", "crit");
    playGolfPing();
    if (!reduceMotion) shake = Math.max(shake, 5);
    impacts.push({ x: a.bx, y: a.by, nx: a.dir, ny: 0, life: 0.25, max: 0.25, color: "#ffffff" });
  }
  if (a.t >= GS_END) self.chAct = null;
}

// The club's angle through the shot, for him hitting to screen right (dir
// 1): pointing down and out at the ball, back up over his other shoulder,
// and through to a high finish. Mirrored for dir -1.
function golfAngle(a, t) {
  var A0 = 1.05, TOP = A0 + Math.PI, FIN = -1.75, an;
  if (t < GS_ADDRESS) an = A0 + (t > GS_SET ? Math.sin((t - GS_SET) * 13) * 0.1 : 0);
  else if (t < GS_TOP) { var u = (t - GS_ADDRESS) / (GS_TOP - GS_ADDRESS); an = A0 + (TOP - A0) * u * u * (3 - 2 * u); }
  else if (t < GS_HIT) { var v = (t - GS_TOP) / (GS_HIT - GS_TOP); an = TOP + (A0 - TOP) * v * v; }
  else { var w = Math.min(1, (t - GS_HIT) / (GS_END - GS_HIT - 0.1)); an = A0 + (FIN - A0) * (1 - (1 - w) * (1 - w)); }
  return a.dir > 0 ? an : Math.PI - an;
}
// Arms straight like a pendulum from between the shoulders: where his hands
// are and where the club head is.
function golfGrip(b, dir, an) {
  var c = { x: b.x, y: b.y - b.r * 0.12 }, cs = Math.cos(an), sn = Math.sin(an);
  var hand = { x: c.x + cs * b.r * 0.6, y: c.y + sn * b.r * 0.6 };
  var len = weaponLen(b);
  return { hand: hand, head: { x: hand.x + cs * len * 0.86, y: hand.y + sn * len * 0.86 } };
}

function drawGolfShot(b, a) {
  var an = golfAngle(a, a.t), g = golfGrip(b, a.dir, an), r = b.r;
  var len = weaponLen(b), cs = Math.cos(an), sn = Math.sin(an);
  // The ball on the ground until he hits it (dropped in at the start).
  if (!a.fired) {
    var drop = Math.max(0, 1 - a.t / GS_SET), bp = golfGrip(b, a.dir, golfAngle(a, 0)).head;
    drawGolfBall(bp.x, bp.y - drop * r * 0.6, r * 0.34, 0);
  }
  var h2 = { x: g.hand.x - cs * len * 0.12, y: g.hand.y - sn * len * 0.12 };
  var shL = { x: b.x - r * 0.62, y: b.y - r * 0.28 }, shR = { x: b.x + r * 0.62, y: b.y - r * 0.28 };
  drawBentArm(b, shL, g.hand, -1);
  drawBentArm(b, shR, h2, 1);
  // A blur on the downswing.
  if (a.t >= GS_TOP && a.t < GS_HIT + 0.12) {
    ctx.save(); ctx.globalAlpha = 0.25;
    for (var k = 1; k <= 3; k++) {
      var pa = golfAngle(a, a.t - k * 0.025), pg = golfGrip(b, a.dir, pa);
      drawClub(pg.hand.x, pg.hand.y, pa, len);
    }
    ctx.restore();
  }
  drawClub(g.hand.x, g.hand.y, an, len);
  drawGloveAt(h2.x, h2.y, r * 0.22, b.char);
  drawGloveAt(g.hand.x, g.hand.y, r * 0.22, b.char);
}

// ---------------------------------------------------------------- drawing

function weaponLen(b) { return golfing(b) ? b.r * GOLF_CLUB_LEN : b.r * 1.6; }
// The bat, or the club when it's Gaethje's.
function drawWeapon(b, x, y, a, len) { if (golfing(b)) drawClub(x, y, a, len); else drawBat(x, y, a, len); }

// Joe's driver, held at the grip at (x, y) and pointing along `a`.
function drawClub(x, y, a, len) {
  if (!(golfClubImg.complete && golfClubImg.naturalWidth)) { drawBat(x, y, a, len); return; }
  var G = GOLF_CLUB_GRIP, H = GOLF_CLUB_HEAD;
  var ax = H.x - G.x, ay = H.y - G.y, alen = Math.sqrt(ax * ax + ay * ay), aang = Math.atan2(ay, ax);
  var sc = len / alen, hold = 0.1; // held a little down from the end of the grip
  ctx.save();
  ctx.translate(x, y); ctx.rotate(a);
  ctx.scale(sc, sc * GOLF_CLUB_THICK * (Math.cos(a) < 0 ? -1 : 1)); // (flipped so the face of the head leads the swing)
  ctx.rotate(-aang);
  // Keeps the head's face toward the way it's swung (flips it when it's pointing left).
  ctx.drawImage(golfClubImg, -(G.x + ax * hold), -(G.y + ay * hold));
  ctx.restore();
}

function drawGolfBall(x, y, s, rot) {
  if (!(golfBallImg.complete && golfBallImg.naturalWidth)) {
    ctx.fillStyle = "#ffffff"; ctx.strokeStyle = theme.wall; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(x, y, s / 2, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    return;
  }
  ctx.save();
  ctx.translate(x, y); ctx.rotate(rot);
  ctx.drawImage(golfBallImg, -s / 2, -s / 2, s, s);
  ctx.restore();
  ctx.save();
  ctx.strokeStyle = "rgba(0,0,0,0.35)"; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.arc(x, y, s / 2, 0, Math.PI * 2); ctx.stroke();
  ctx.restore();
}

// The red cap, front on, low over the top of his head. Drawn in the
// fighter's own frame (so it squashes with him).
function drawGolfHat(b) {
  if (!b.maga || !b.alive) return;
  var x = b.x, y = b.y, r = b.r, red = "#c8102e", dark = "#8f0b20";
  ctx.save();
  ctx.lineJoin = "round"; ctx.strokeStyle = theme.wall; ctx.lineWidth = 2.5;
  // The crown: the top of the ball down to a gently curved band.
  var bandY = y - r * 0.42;
  ctx.beginPath();
  ctx.arc(x, y - r * 0.03, r * 1.04, Math.PI + 0.42, -0.42);
  ctx.quadraticCurveTo(x, bandY - r * 0.12, x - r * 0.95, y - r * 0.43);
  ctx.closePath();
  ctx.fillStyle = red; ctx.fill(); ctx.stroke();
  // Panel seams and the button.
  ctx.strokeStyle = "rgba(0,0,0,0.25)"; ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x, y - r * 1.06); ctx.quadraticCurveTo(x - r * 0.05, y - r * 0.8, x, bandY - r * 0.1);
  ctx.moveTo(x - r * 0.1, y - r * 1.05); ctx.quadraticCurveTo(x - r * 0.55, y - r * 0.85, x - r * 0.72, bandY - r * 0.04);
  ctx.moveTo(x + r * 0.1, y - r * 1.05); ctx.quadraticCurveTo(x + r * 0.55, y - r * 0.85, x + r * 0.72, bandY - r * 0.04);
  ctx.stroke();
  ctx.fillStyle = dark; ctx.strokeStyle = theme.wall; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.arc(x, y - r * 1.06, r * 0.08, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  // The brim, sticking out toward us over the eyes.
  ctx.fillStyle = dark; ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(x - r * 0.8, bandY + r * 0.02);
  ctx.quadraticCurveTo(x, bandY - r * 0.16, x + r * 0.8, bandY + r * 0.02);
  ctx.quadraticCurveTo(x + r * 0.72, bandY + r * 0.24, x, bandY + r * 0.26);
  ctx.quadraticCurveTo(x - r * 0.72, bandY + r * 0.24, x - r * 0.8, bandY + r * 0.02);
  ctx.closePath(); ctx.fill(); ctx.stroke();
  // The lettering.
  ctx.fillStyle = "#ffffff";
  ctx.font = "900 " + Math.round(r * 0.3) + "px Impact, 'Arial Black', sans-serif";
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillText("MAGA", x, y - r * 0.68);
  ctx.restore();
}
