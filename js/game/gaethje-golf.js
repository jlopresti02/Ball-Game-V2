// Justin Gaethje's golf mode.
//
// If one of his own Eagle Strike eagles (gaethje-eagle.js) swoops through
// him, it snatches him up instead and carries him off the screen. A moment
// later he drops back in from the top of the screen to the middle of the
// ring (like Jon's Duck Drop), wearing a red MAGA cap with a golf club in
// his hands. The landing only does `land.damage`; it's there to knock back
// anyone within `land.radius` so he has room. An eagle also comes for him on purpose the moment Dustin goes into
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
var EC_OUT = 0.9, EC_SPEED = 650, EC_CLIMB = 260; // carried off: how long, how fast along the line, how fast it climbs
var EC_GONE = 0.9, EC_DROP = 0.45;               // off screen, then the fall back in to the middle
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
  // Carried on along the eagle's line, up and off the screen.
  self.igbb = { move: "eaglecarry", phase: "carry", t: 0, px: self.x, py: self.y, z: 0, dx: e.dx, dy: e.dy, e: e };
  floater(self.x, self.y - self.r - 40, "SNATCHED!", "crit");
  playEagleScreech();
  if (!reduceMotion) { shake = Math.max(shake, 8); hitStop = Math.max(hitStop, 0.05); }
  for (var f = 0; f < 14 && !reduceMotion; f++) {
    var a = Math.random() * Math.PI * 2, sp = 80 + Math.random() * 200;
    particles.push({ x: self.x, y: self.y - self.r * 0.6, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 80, life: 0.7, max: 0.7, size: 3 + Math.random() * 3, color: f % 3 ? "#5a3a1e" : "#ffffff" });
  }
}

function eagleCarryOn(b) { return !!(b.igbb && b.igbb.move === "eaglecarry"); }
// Drawn on his own, over the stands and the jumbotron (drawEagleSky), or
// not at all while he's off screen.
function golfDrawnApart(b) { return eagleCarryOn(b); }

// From the abilities loop, before the special. True while he's away.
function updateEagleCarry(self, other, dt) {
  var m = self.igbb;
  if (!m || m.move !== "eaglecarry") return false;
  m.t += dt;
  self.vx = 0; self.vy = 0; self.immuneCd = 9;
  if (over) { endEagleCarry(self, false); return false; }
  if (m.phase === "carry") {
    // Hauled off along its line, climbing as it goes.
    m.px += m.dx * EC_SPEED * dt; m.py += m.dy * EC_SPEED * dt;
    m.z = EC_CLIMB * m.t + 200 * m.t * m.t;
    if (m.t >= EC_OUT) {
      m.phase = "gone"; m.t = 0;
      if (m.e) m.e.released = true;
      // Coming back down in the middle.
      self.x = W / 2; self.y = H / 2;
    }
  } else if (m.phase === "gone") {
    if (m.t >= EC_GONE) {
      m.phase = "drop"; m.t = 0;
      self.maga = true; // the eagle's kitted him out
      playWhoosh();
    }
  } else if (m.phase === "drop") {
    var u = Math.min(1, m.t / EC_DROP);
    m.fallY = ddTopY(self.r) + (self.y - ddTopY(self.r)) * u * u; // jon-duck.js
    if (u >= 1) { golfLand(self, other); return false; }
  }
  return true;
}

// Lands in the middle: knocks back anyone close enough to clear himself
// some room, then he's in golf mode.
function golfLand(self, other) {
  var cfg = golfCfg(self).land;
  endEagleCarry(self, true);
  self.squash = { t: 0.24, max: 0.24, nx: 0, ny: 1 };
  if (!reduceMotion) { shake = Math.max(shake, 16); hitStop = Math.max(hitStop, 0.06); }
  playSlam();
  golfRing = { x: self.x, y: self.y, t: 0, R: cfg.radius };
  for (var i = 0; i < 22 && !reduceMotion; i++) {
    var a = Math.random() * Math.PI * 2, sp = 160 + Math.random() * 220;
    particles.push({ x: self.x + Math.cos(a) * self.r * 0.8, y: self.y + self.r * 0.6 + Math.sin(a) * self.r * 0.3, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp * 0.45, life: 0.55, max: 0.55, size: 4 + Math.random() * 5, color: "rgba(190,175,150,0.85)" });
  }
  ["#c8102e", "#ffffff", "#1c2f6e"].forEach(function (c, ci) {
    for (var j = 0; j < 6 && !reduceMotion; j++) {
      var a2 = Math.random() * Math.PI * 2, s2 = 100 + Math.random() * 160;
      particles.push({ x: self.x, y: self.y - self.r, vx: Math.cos(a2) * s2, vy: Math.sin(a2) * s2 - 120, life: 0.8, max: 0.8, size: 3 + ci, color: c });
    }
  });
  var dx = other.x - self.x, dy = other.y - self.y, d = Math.sqrt(dx * dx + dy * dy) || 1;
  if (other.alive && !other.invincible && !other.igbb && d < cfg.radius + other.r) {
    hurt(other, cfg.damage, "igbb", self.id);
    if (other.alive && inOrdinaryMovement(other)) {
      other.vx = dx / d * cfg.knockback; other.vy = dy / d * cfg.knockback;
    }
    other.squash = { t: 0.16, max: 0.16, nx: dx / d, ny: dy / d };
    floater(other.x, other.y - other.r - 40, "BACK OFF!", "note");
    checkEnd();
  }
  startGolfMode(self);
}

function endEagleCarry(self, landed) {
  var m = self.igbb;
  self.igbb = null; self.invincible = false; self.immuneCd = 0;
  if (m && m.e) m.e.released = true;
  setSpeed(self, self.baseSpeed || SPEED);
}

// Under the fighters: where he's going to land (a red ring that fills in
// and his shadow growing as he falls), and the shockwave once he does.
var golfRing = null;
function drawGolfDropUnder() {
  balls.forEach(function (b) {
    var m = b.igbb;
    if (!eagleCarryOn(b) || (m.phase !== "gone" && m.phase !== "drop")) return;
    var cfg = golfCfg(b).land, k = m.phase === "gone" ? m.t / EC_GONE : 1, now = performance.now() / 1000;
    ctx.save();
    ctx.strokeStyle = "rgba(220,20,20," + (0.6 + 0.3 * Math.sin(now * 16)) + ")"; ctx.lineWidth = 3.5; ctx.setLineDash([12, 8]);
    ctx.beginPath(); ctx.arc(b.x, b.y, cfg.radius, 0, Math.PI * 2); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = "rgba(220,20,20,0.16)";
    ctx.beginPath(); ctx.arc(b.x, b.y, cfg.radius * Math.min(1, k), 0, Math.PI * 2); ctx.fill();
    var f = m.phase === "drop" ? Math.min(1, m.t / EC_DROP) : 0;
    ctx.fillStyle = "rgba(0,0,0," + (0.12 + 0.25 * f) + ")";
    ctx.beginPath(); ctx.ellipse(b.x, b.y + b.r * 0.85, b.r * (0.4 + 0.6 * f), b.r * 0.3 * (0.4 + 0.6 * f), 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  });
  if (golfRing) {
    var g = golfRing, a = 1 - g.t / 0.45;
    ctx.save(); ctx.globalAlpha = Math.max(0, a);
    ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.arc(g.x, g.y + 10, g.R * (0.4 + 0.8 * (1 - a)), 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
  }
}

// Over everything (after the jumbotron): him dangling from the eagle as it
// hauls him off, and him falling back in from the top of the screen.
function drawEagleSky(sc, ox, oy) {
  balls.forEach(function (b) {
    var m = b.igbb;
    if (!eagleCarryOn(b) || !b.alive || m.phase === "gone") return;
    var r = b.r, x, y, flap = performance.now() / 1000 * 22;
    ctx.save();
    ctx.setTransform(sc, 0, 0, sc, ox, oy);
    if (m.phase === "carry") {
      x = m.px; y = m.py - m.z;
      golfDrawFighter(b, x, y, 1, Math.sin(flap * 0.4) * 0.15);
      drawEagle(x, y - r * 0.95, Math.atan2(m.dy, m.dx), 0.6, flap, true); // allamerican.js
    } else {
      x = b.x; y = m.fallY != null ? m.fallY : ddTopY(r);
      var top = ddTopY(r);
      var g = ctx.createLinearGradient(0, top, 0, y);
      g.addColorStop(0, "rgba(255,255,255,0)"); g.addColorStop(1, "rgba(255,255,255,0.75)");
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.moveTo(x - r * 0.8, y); ctx.lineTo(x - r * 0.2, top); ctx.lineTo(x + r * 0.2, top); ctx.lineTo(x + r * 0.8, y); ctx.closePath(); ctx.fill();
      golfDrawFighter(b, x, y, 1.12, 0);
    }
    ctx.restore();
  });
}
// The fighter on his own at (x, y): stretched tall by `st`, swinging by `rot`.
function golfDrawFighter(b, x, y, st, rot) {
  var ch = b.char, r = b.r;
  ctx.save();
  ctx.translate(x, y); ctx.rotate(rot); ctx.scale(1 / Math.sqrt(st), st); ctx.translate(-x, -y);
  if (ch.look) drawFighterArt(ctx, x, y, r, ch.look, theme.wall, { layout: "contained", name: ch.name });
  else { ctx.fillStyle = ch.color; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); }
  ctx.lineWidth = 3; ctx.strokeStyle = theme.wall;
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.stroke();
  var sx = b.x, sy = b.y; b.x = x; b.y = y; drawGolfHat(b); b.x = sx; b.y = sy;
  // Arms up, hanging on (or flung up as he falls).
  var arm = (ch.punch.size || 15) * 0.75;
  [-1, 1].forEach(function (sd) {
    var shx = x + sd * r * 0.62, shy = y - r * 0.2, hx = x + sd * r * 0.45, hy = y - r * 1.15;
    strokeLimb(arm, armColor(ch), function () { ctx.moveTo(shx, shy); ctx.lineTo(hx, hy); });
    drawGloveAt(hx, hy, r * 0.22, ch);
  });
  ctx.restore();
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
  if (golfRing && (golfRing.t += dt) > 0.45) golfRing = null;
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
