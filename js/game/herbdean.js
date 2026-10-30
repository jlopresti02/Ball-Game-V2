// Ciryl Gane's special move, Herb Dean (special.move "herbdean").
//
// The jumbotron announces Herb Dean is entering the ring and the referee
// nods off. Gane pulls out a bat, runs the opponent down and pins them,
// and goes to work on them with it. Meanwhile blind Herb Dean taps his way
// in with his white cane, wanders straight past Gane without noticing him,
// bumps into the opponent mid-beating and starts whacking them with the
// cane too (minor damage) while Gane keeps swinging. A last big swing ends
// it, Herb shuffles off out of the cage and the ref wakes up.
"use strict";

var HERB_ANNOUNCE = 1.8;   // jumbotron announcement while Gane gets the bat out
var HERB_CLOSE_SPEED = 820;
var HERB_GIVEUP = 3.5;     // can't reach them: calls it off (stays charged)
var HERB_R = 34;
var HERB_WALK = 120;       // Herb tapping his way across the cage
var HERB_BEAT_MAX = 7;     // the beating can't go on longer than this
var HERB_JOINED = 2.4;     // how long Herb gets to hit them before the finish
var HERB_SHOW = 3.2;       // seconds the jumbotron shows the announcement
var HERB_RUN = 300;        // running in (and back out) through the crowd
var HERB_CLIMB = 0.75;     // climbing over the fence, in or out
var HERB_OUTRO_MAX = 6;    // Gane celebrating while Herb finds his way out (cap)
var CANE_WIND = 0.34;      // the cane raised high over his head
var CANE_STRIKE = 0.07;    // bringing it down
var CANE_RECOVER = 0.16;

var HERB_LOOK = {
  skin: "#6b4733", build: "stocky", bodyHair: "none", hair: "twists", hairPuff: true, hairColor: "#17120f",
  beard: "full", ears: "normal", tattoos: {}, outfit: "polo", shirt: "#141518", badge: "#e3b52a",
  shorts: "#2b2d33", trim: "#0e0f11", shortsStyle: "plain", gloves: "#101012", glasses: "shades", cane: true
};

var herb = null;      // Herb Dean while he's in the cage
var herbShow = 0;     // seconds left on the jumbotron announcement

function resetHerbDean() { herb = null; herbShow = 0; }
function herbDeanActive() { return balls.some(function (b) { return b.igbb && b.igbb.move === "herbdean"; }); }

function updateHerbDean(self, other, dt) {
  var sp = self.char.special;
  if (!self.igbb) {
    if (self.specialT < sp.chargeTime || !canStartIgbb(self, other)) return false;
    clearActions(self); self.cheater = null;
    self.igbb = { move: "herbdean", phase: "announce", t: 0, swings: 0, swingT: 0, side: 1 };
    herbShow = HERB_SHOW;
    floater(self.x, self.y - self.r - 26, "HERB DEAN!", "crit");
    playWhoosh();
    playHerbDeanLine(); // Joe's clip, over every other talking clip
    herbEnters(self); // already pushing through the crowd while he's announced
  }
  var m = self.igbb;
  m.t += dt;
  var dx = other.x - self.x, dy = other.y - self.y, d = Math.sqrt(dx * dx + dy * dy) || 1;

  if (m.phase === "announce") {
    self.vx = 0; self.vy = 0;
    if (m.t >= HERB_ANNOUNCE) {
      m.phase = "close"; m.t = 0;
    }
    return true;
  }
  if (m.phase === "close") {
    if (!other.alive || other.invincible || specialBusy(other) || m.t > HERB_GIVEUP) { endHerbDean(self, other, false); return false; }
    if (d < self.r + other.r + 16) {
      clearActions(other);
      other.dazed = "held"; other.vx = 0; other.vy = 0; // pinned for the beating
      self.vx = 0; self.vy = 0;
      m.phase = "beat"; m.t = 0; m.nx = dx / d; m.ny = dy / d;
      return true;
    }
    self.vx = dx / d * HERB_CLOSE_SPEED; self.vy = dy / d * HERB_CLOSE_SPEED;
    if (!reduceMotion) particles.push({ x: self.x, y: self.y, vx: -self.vx * 0.1, vy: -self.vy * 0.1, life: 0.2, max: 0.2, size: self.r * 0.55, color: self.char.color });
    return true;
  }
  self.vx = 0; self.vy = 0;
  if (m.phase === "beat") {
    // Stays right on them.
    // Rocks back as he winds up, then lunges in with the swing.
    var wk = Math.min(1, m.swingT / sp.batGap);
    var gap = self.r + other.r + 10 + (wk < 0.7 ? 14 * (wk / 0.7) : 14 - 22 * ((wk - 0.7) / 0.3));
    self.x += (other.x - m.nx * gap - self.x) * Math.min(1, dt * 18);
    self.y += (other.y - m.ny * gap - self.y) * Math.min(1, dt * 18);
    m.swingT += dt;
    var joined = herb && herb.phase === "hit" ? herb.hitT : 0;
    var finish = joined >= HERB_JOINED || m.t >= HERB_BEAT_MAX;
    if (m.swingT >= sp.batGap && other.alive) {
      m.swingT = 0; m.swings++; m.side = -m.side;
      var last = finish;
      var dealt = hurt(other, last ? sp.finisher : sp.batDamage, "igbb", self.id);
      playPunch(last ? 40 : 14);
      impacts.push({ x: other.x - m.nx * other.r, y: other.y - m.ny * other.r, nx: m.nx, ny: m.ny, life: 0.3, max: 0.3, color: "#c98a4b" });
      if (!reduceMotion) shake = Math.max(shake, last ? 20 : 7);
      herbVictimRecoil(other, m.nx, m.ny, last ? 0.6 : 0.42);
      if (last) {
        if (dealt > 0) floater(other.x, other.y - other.r - 30, "HOME RUN", "crit");
        playSlam();
        if (!reduceMotion) hitStop = Math.max(hitStop, 0.08);
        checkEnd();
        if (!other.alive || over) { endHerbDean(self, other, true); return false; }
        // Knocked back in a daze, seeing stars, while Gane celebrates and
        // Herb feels his way back out of the cage.
        other.dazed = true; other.vx = 0; other.vy = 0;
        m.phase = "outro"; m.t = 0; m.kx = m.nx * 420; m.ky = m.ny * 420;
        herbLeaves();
        return true;
      }
      checkEnd();
    }
    if (!other.alive) { endHerbDean(self, other, true); return false; }
    return true;
  }
  if (m.phase === "outro") {
    // The knockback slides them away and dies off; they just sit there.
    other.vx = 0; other.vy = 0;
    var dk = Math.exp(-6 * dt);
    other.x += m.kx * dt; other.y += m.ky * dt; m.kx *= dk; m.ky *= dk;
    other.x = Math.max(other.r, Math.min(W - other.r, other.x));
    other.y = Math.max(other.r, Math.min(H - other.r, other.y));
    herbShoveOut(other);
    if (!other.alive || over) { endHerbDean(self, other, true); return false; }
    var gone = !herb || herb.phase === "exit";
    if ((gone && m.t > 0.6) || m.t >= HERB_OUTRO_MAX) { endHerbDean(self, other, true, true); return false; }
    return true;
  }
  return true;
}

// Herb comes in on the far side of the cage from the fight, heading for
// Gane (he can't see a thing) but wandering on past him. In the stadium he
// starts out of shot below the stands, shoves his way up through the crowd,
// climbs over the fence, and leaves back out the same way.
function herbFenceY() { return stadiumOn() ? H + ST.CAGE / 2 * W / ST.A : H; }
function herbOutY() { return herbFenceY() + HERB_R + 6; }   // stood outside the fence
function herbInY() { return H - HERB_R - 4; }              // just inside it
function herbOffY() { return stadiumOn() ? (STAGE_H + 80 - ST.AY) * W / ST.A : herbOutY() + HERB_R * 2; }
function herbClampIn(h) {
  h.x = Math.max(HERB_R + 2, Math.min(W - HERB_R - 2, h.x));
  h.y = Math.max(HERB_R + 2, Math.min(H - HERB_R - 2, h.y));
}

function herbEnters(owner) {
  var x0 = Math.min(W - 70, Math.max(70, W - owner.x + (Math.random() - 0.5) * 80)); // across from Gane
  var stadium = stadiumOn();
  herb = { x: x0 + (stadium ? (Math.random() - 0.5) * 120 : 0), y: stadium ? herbOffY() : herbOutY(), t: 0,
    phase: stadium ? "run" : "climb", climb: 0, gx: x0, ownerId: owner.id, missed: false, hitT: 0, cyc: 0,
    struck: false, swing: 0, flip: 1, fade: 1 };
}

function updateHerb(dt) {
  if (herbShow > 0) herbShow = Math.max(0, herbShow - dt);
  tickHerbJolt(dt);
  var h = herb;
  if (!h) return;
  h.t += dt;
  var owner = balls[h.ownerId], vic = balls[1 - h.ownerId];
  var sp = owner.char.special;
  if (h.phase === "run") {
    // Shoving up through the stands, cane flailing, to the fence.
    h.y -= HERB_RUN * dt;
    h.x += (h.gx - h.x) * Math.min(1, dt * 2) + Math.sin(h.t * 5) * 60 * dt;
    h.swing = Math.sin(h.t * 14) * 0.7;
    if (h.y <= herbOutY()) { h.y = herbOutY(); h.phase = "climb"; h.climb = 0; }
  } else if (h.phase === "climb" || h.phase === "climbOut") {
    // Up and over the fence. climb runs 0 (outside) to 1 (inside).
    var inward = h.phase === "climb";
    h.climb = Math.max(0, Math.min(1, h.climb + (inward ? 1 : -1) * dt / HERB_CLIMB));
    var e = h.climb * h.climb * (3 - 2 * h.climb);
    h.y = herbOutY() + (herbInY() - herbOutY()) * e;
    h.swing = 0;
    if (inward && h.climb >= 1) { h.phase = "walk"; h.t = 0; }
    else if (!inward && h.climb <= 0) { h.phase = "exit"; h.t = 0; }
  } else if (h.phase === "walk") {
    // Heads roughly at Gane, but drifts off to one side and sails past him.
    var tx, ty;
    if (!h.missed) {
      var gx = owner.x - h.x, gy = owner.y - h.y, gd = Math.sqrt(gx * gx + gy * gy) || 1;
      tx = owner.x - gy / gd * (owner.r + HERB_R + 18); ty = owner.y + gx / gd * (owner.r + HERB_R + 18);
      if (Math.abs(h.x - owner.x) < owner.r + 6 || Math.sqrt((tx - h.x) * (tx - h.x) + (ty - h.y) * (ty - h.y)) < 14) {
        h.missed = true;
      }
    } else { tx = vic.x; ty = vic.y; }
    var mx = tx - h.x, my = ty - h.y, md = Math.sqrt(mx * mx + my * my) || 1;
    h.x += mx / md * HERB_WALK * dt + Math.sin(h.t * 3.1) * 18 * dt;
    h.y += my / md * HERB_WALK * dt + Math.cos(h.t * 2.3) * 18 * dt;
    herbSteerClear(h, owner, mx, my); // walks round Gane, never through him
    herbClampIn(h);
    h.flip = mx < 0 ? -1 : 1;
    h.swing = Math.sin(h.t * 5) * 0.45;
    // Bumps right into the one getting beaten.
    var vx = vic.x - h.x, vy = vic.y - h.y;
    if (h.missed && vic.alive && Math.sqrt(vx * vx + vy * vy) < vic.r + HERB_R + 2) {
      h.phase = "hit"; h.hitT = 0; h.cyc = 0; h.struck = false;
      h.flip = vx < 0 ? -1 : 1;
      h.ang = Math.atan2(h.y - vic.y, h.x - vic.x);
      floater(vic.x, vic.y - vic.r - 52, "HERB JOINS IN", "crit");
    }
  } else if (h.phase === "hit") {
    h.hitT += dt;
    h.cyc += dt;
    // Feels his way round them to the side away from Gane, still swinging.
    var want = herbSpotAngle(vic, owner, Math.atan2(vic.y - owner.y, vic.x - owner.x));
    var diff = Math.atan2(Math.sin(want - h.ang), Math.cos(want - h.ang));
    h.ang += Math.max(-4 * dt, Math.min(4 * dt, diff));
    var rr = vic.r + HERB_R + 16; // an arm and a cane's length off them
    var hk = Math.min(1, dt * 10);
    h.x += (vic.x + Math.cos(h.ang) * rr - h.x) * hk; h.y += (vic.y + Math.sin(h.ang) * rr - h.y) * hk;
    herbClampIn(h); // never through the cage, even with them pinned on it
    h.flip = vic.x < h.x ? -1 : 1;
    // Each whack: a big slow wind-up with the cane raised over his head,
    // then he brings it crashing down on them.
    var stillOn = vic.alive && owner.igbb && owner.igbb.move === "herbdean";
    if (h.cyc >= CANE_WIND + CANE_STRIKE + CANE_RECOVER) { h.cyc = 0; h.struck = false; }
    if (stillOn && !h.struck && h.cyc >= CANE_WIND + CANE_STRIKE) {
      h.struck = true;
      hurt(vic, sp.caneDamage, "igbb", owner.id);
      playPunch(18);
      var ax = vic.x - h.x, ay = vic.y - h.y, al = Math.sqrt(ax * ax + ay * ay) || 1;
      impacts.push({ x: vic.x - ax / al * vic.r * 0.6, y: vic.y - vic.r * 0.5, nx: ax / al, ny: ay / al, life: 0.32, max: 0.32, color: "#ffffff" });
      herbVictimRecoil(vic, ax / al, ay / al, 0.36);
      if (!reduceMotion) { shake = Math.max(shake, 9); hitStop = Math.max(hitStop, 0.04); }
      if (Math.random() < 0.5) floater(vic.x + (Math.random() - 0.5) * 30, vic.y - vic.r - 40, "WHACK", "crit");
      checkEnd();
    }
    if (!stillOn) herbLeaves();
  } else if (h.phase === "leave") {
    // Hurries back to the near fence to climb out.
    var ox = Math.max(70, Math.min(W - 70, h.x)) - h.x, oy = herbInY() - h.y, od = Math.sqrt(ox * ox + oy * oy) || 1;
    var step = Math.min(od, HERB_WALK * 1.8 * dt);
    h.x += ox / od * step; h.y += oy / od * step;
    herbSteerClear(h, owner, ox, oy); herbSteerClear(h, vic, ox, oy);
    herbClampIn(h);
    h.flip = ox < 0 ? -1 : 1;
    h.swing = Math.sin(h.t * 10) * 0.6;
    if (od < 2) { h.phase = "climbOut"; h.climb = 1; }
  } else if (h.phase === "exit") {
    // Off down through the crowd and out of shot.
    h.y += HERB_RUN * dt;
    h.x += Math.sin(h.t * 5) * 60 * dt;
    h.swing = Math.sin(h.t * 14) * 0.7;
    if (!stadiumOn()) h.fade = Math.max(0, 1 - (h.y - herbOutY()) / (herbOffY() - herbOutY()));
    if (h.y >= herbOffY()) herb = null;
  }
}

// Getting hit: knocked back a step, squashed, flashing, sweat flying, and
// sometimes yelling about it. Purely for show (they're pinned).
var HERB_OUCH = ["OOF", "OW!", "AAGH", "NOT THE FACE", "REF?!", "HELP"];
function herbVictimRecoil(b, nx, ny, amt) {
  b.herbJolt = { t: 0.22, max: 0.22, nx: nx, ny: ny, amt: b.r * amt };
  b.squash = { t: 0.16, max: 0.16, nx: nx, ny: ny };
  b.flash = 0.14;
  if (!reduceMotion) for (var i = 0; i < 5; i++) {
    var a = Math.atan2(ny, nx) + (Math.random() - 0.5) * 1.6, sp = 160 + Math.random() * 160;
    particles.push({ x: b.x, y: b.y - b.r * 0.4, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 60, life: 0.35, max: 0.35, size: 3, color: "#bfe3ff" });
  }
  if (Math.random() < 0.3) floater(b.x + (Math.random() - 0.5) * 50, b.y + b.r + 26, HERB_OUCH[(Math.random() * HERB_OUCH.length) | 0], "note");
}
function tickHerbJolt(dt) {
  balls.forEach(function (b) { if (b.herbJolt && (b.herbJolt.t -= dt) <= 0) b.herbJolt = null; });
}
// Where to draw them this frame (draw.js adds it to the fighter's spot).
function herbJoltOffset(b) {
  var j = b.herbJolt, x = 0, y = 0;
  if (j) { var k = j.t / j.max; x = j.nx * j.amt * k * k; y = j.ny * j.amt * k * k; }
  if (herbCovering(b) && !reduceMotion) { x += (Math.random() - 0.5) * 2.4; y += (Math.random() - 0.5) * 2.4; } // trembling
  return { x: x, y: y };
}

// Pinned for the beating: both gloves up in front of the face, elbows in,
// shaking, and knocked back into their own head on every hit.
function herbCovering(b) {
  var o = balls[1 - b.id];
  return b.alive && b.dazed === "held" && o.igbb && o.igbb.move === "herbdean" && o.igbb.phase === "beat";
}
function drawHerbCover(b) {
  var o = balls[1 - b.id], a = Math.atan2(o.y - b.y, o.x - b.x);
  // Turns the guard toward whichever of them hit last.
  if (b.herbJolt) a = Math.atan2(-b.herbJolt.ny, -b.herbJolt.nx);
  var cx = Math.cos(a), cy = Math.sin(a), px = -cy, py = cx;
  var j = b.herbJolt ? b.herbJolt.t / b.herbJolt.max : 0;
  var out = b.r * (0.62 - 0.3 * j), arm = (b.char.punch.size || 13) * 0.75;
  [-1, 1].forEach(function (k) {
    var sx = b.x + px * k * b.r * 0.62, sy = b.y + py * k * b.r * 0.62;
    var gx = b.x + cx * out + px * k * b.r * (0.24 + 0.1 * j), gy = b.y + cy * out + py * k * b.r * (0.24 + 0.1 * j) - b.r * 0.2;
    strokeLimb(arm, armColor(b.char), function () { ctx.moveTo(sx, sy); ctx.lineTo(gx, gy); });
    drawGloveAt(gx, gy, b.r * 0.3, b.char);
  });
}

// The angle round the victim closest to `want` (the side away from Gane)
// where Herb fits inside the cage without standing on Gane.
function herbSpotAngle(vic, owner, want) {
  var rr = vic.r + HERB_R + 16, offs = [0, 0.4, -0.4, 0.8, -0.8, 1.2, -1.2, 1.6, -1.6, 2.0, -2.0];
  for (var i = 0; i < offs.length; i++) {
    var a = want + offs[i], x = vic.x + Math.cos(a) * rr, y = vic.y + Math.sin(a) * rr;
    var gx = x - owner.x, gy = y - owner.y;
    if (x > HERB_R + 2 && x < W - HERB_R - 2 && y > HERB_R + 2 && y < H - HERB_R - 2 &&
        gx * gx + gy * gy > (owner.r + HERB_R + 6) * (owner.r + HERB_R + 6)) return a;
  }
  return want;
}

// Keeps Herb from walking through a fighter: pushes him back out to their
// edge and slides him round them the way he was heading.
function herbSteerClear(h, b, dx, dy) {
  if (!b || !b.alive) return;
  var px = h.x - b.x, py = h.y - b.y, pd = Math.sqrt(px * px + py * py) || 1, min = b.r + HERB_R + 4;
  if (pd >= min) return;
  var nx = px / pd, ny = py / pd;
  h.x = b.x + nx * min; h.y = b.y + ny * min;
  var side = (-ny * dx + nx * dy) >= 0 ? 1 : -1; // around whichever way is closer to where he's going
  if (Math.abs(-ny * dx + nx * dy) < 1e-3) side = 1;
  h.x += -ny * side * 3; h.y += nx * side * 3;
}

// And a fighter sliding into him gets stopped at his edge.
function herbShoveOut(b) {
  var h = herb;
  if (!h || h.y > H) return;
  var px = b.x - h.x, py = b.y - h.y, pd = Math.sqrt(px * px + py * py) || 1, min = b.r + HERB_R + 2;
  if (pd < min) { b.x = h.x + px / pd * min; b.y = h.y + py / pd * min; }
}

function herbLeaves() {
  if (!herb || herb.phase === "leave" || herb.phase === "climbOut" || herb.phase === "exit") return;
  if (herb.phase === "run") { herb.phase = "exit"; herb.t = 0; return; } // never got in
  if (herb.phase === "climb") { herb.phase = "climbOut"; return; }
  herb.phase = "leave";
}

function endHerbDean(self, other, landed, afterOutro) {
  if (other.dazed === "held" || (afterOutro && other.dazed === true)) other.dazed = false;
  if (landed && other.alive && !afterOutro) {
    var m = self.igbb, nx = m.nx || 1, ny = m.ny || 0;
    other.vx = nx * 420; other.vy = ny * 420;
  }
  self.igbb = null;
  if (landed) self.specialT = 0;
  herbLeaves();
  if (!herb) herbShow = 0;
  if (referee && referee.asleep && !over) wakeRef(referee);
  setSpeed(self, self.baseSpeed || SPEED);
}

// ---------------------------------------------------------------- drawing

// Gane's bat: on his shoulder, then swung down on them in turn from each side.
function drawHerbDeanSpecial(b) {
  var m = b.igbb;
  if (!m || m.move !== "herbdean" || !b.alive) return;
  var other = balls[1 - b.id], ch = b.char, sp = ch.special;
  var nx = other.x - b.x, ny = other.y - b.y, nd = Math.sqrt(nx * nx + ny * ny) || 1;
  var base = Math.atan2(ny, nx), ang;
  if (m.phase === "outro") { drawGaneCelebrating(b, m.t); return; }
  if (m.phase === "beat") {
    // Cocks it way back over his shoulder (shaking at the top), then whips
    // it through them and follows through across his body.
    var k = Math.min(1, m.swingT / sp.batGap), whip = false;
    if (k < 0.12) ang = base - m.side * (0.5 - 0.5 * (k / 0.12)) ;          // follow-through settling
    else if (k < 0.72) { var e = (k - 0.12) / 0.6; e = e * (2 - e); ang = base + m.side * 2.4 * e + (e > 0.85 ? Math.sin(m.swingT * 80) * 0.06 : 0); }
    else { var f = (k - 0.72) / 0.28; f = f * f; ang = base + m.side * (2.4 - 2.9 * f); whip = true; }
  } else if (m.phase === "announce") {
    var up = Math.min(1, m.t / 0.4);
    ang = base - 2.3 * up;
  } else ang = base - 2.3;
  var arm = (ch.punch.size || 13) * 0.75, bl = b.r * 1.7;
  var hx = b.x + Math.cos(ang) * b.r * 0.85, hy = b.y + Math.sin(ang) * b.r * 0.85;
  var shx = b.x + Math.cos(ang) * b.r * 0.4, shy = b.y + Math.sin(ang) * b.r * 0.4;
  if (whip && !reduceMotion) {
    ctx.save(); ctx.strokeStyle = "rgba(255,255,255,0.7)"; ctx.lineCap = "round";
    for (var i = 1; i <= 3; i++) {
      var ga = ang + m.side * i * 0.25;
      ctx.lineWidth = 5 - i;
      ctx.beginPath(); ctx.moveTo(hx + Math.cos(ga) * bl * 0.45, hy + Math.sin(ga) * bl * 0.45); ctx.lineTo(hx + Math.cos(ga) * bl, hy + Math.sin(ga) * bl); ctx.stroke();
    }
    ctx.restore();
  }
  drawBat(hx, hy, ang, bl); // cheater.js
  // Two hands on the handle, the back one from the other shoulder.
  var h2x = hx + Math.cos(ang) * b.r * 0.3, h2y = hy + Math.sin(ang) * b.r * 0.3;
  var s2a = ang + m.side * 1.4, s2x = b.x + Math.cos(s2a) * b.r * 0.5, s2y = b.y + Math.sin(s2a) * b.r * 0.5;
  strokeLimb(arm, armColor(ch), function () { ctx.moveTo(s2x, s2y); ctx.lineTo(h2x, h2y); });
  strokeLimb(arm, armColor(ch), function () { ctx.moveTo(shx, shy); ctx.lineTo(hx, hy); });
  drawGloveAt(hx, hy, b.r * 0.22, ch);
  drawGloveAt(h2x, h2y, b.r * 0.22, ch);
}

function drawGaneCelebrating(b, t) {
  var ch = b.char, arm = (ch.punch.size || 13) * 0.75, other = balls[1 - b.id];
  var batSide = other.x > b.x ? -1 : 1; // held up on the side away from them
  [-1, 1].forEach(function (k, i) {
    var pump = Math.max(0, Math.sin(t * 11 + i * Math.PI)) * b.r * 0.35;
    var shx = b.x + k * b.r * 0.62, shy = b.y - b.r * 0.5;
    var hx = b.x + k * b.r * 0.9, hy = b.y - b.r * 1.15 - pump;
    if (k === batSide) drawBat(hx, hy, -Math.PI / 2 + k * (0.7 + Math.sin(t * 11) * 0.2), b.r * 1.5); // cheater.js
    strokeLimb(arm, armColor(ch), function () { ctx.moveTo(shx, shy); ctx.lineTo(hx, hy); });
    drawGloveAt(hx, hy, b.r * 0.22, ch);
  });
}

function drawHerb() {
  var h = herb;
  if (!h) return;
  ctx.save();
  ctx.translate(h.x, h.y);
  // Shadow
  ctx.fillStyle = "rgba(0,0,0,0.14)";
  ctx.beginPath(); ctx.ellipse(HERB_R * 0.15, HERB_R * 0.9, HERB_R * 0.9, HERB_R * 0.28, 0, 0, Math.PI * 2); ctx.fill();
  ctx.globalAlpha = h.fade;
  if (h.phase === "hit") { drawHerbWhacking(h); ctx.restore(); return; }
  if (h.phase === "climb" || h.phase === "climbOut") { drawHerbClimbing(h); ctx.restore(); return; }
  var running = h.phase === "run" || h.phase === "exit" || h.phase === "leave";
  var bob = Math.abs(Math.sin(h.t * (running ? 14 : 6))) * (running ? 5 : 2);
  ctx.translate(0, -bob);
  ctx.scale(h.flip, 1); // the cane on the side he's heading
  drawFighterArt(ctx, 0, 0, HERB_R, HERB_LOOK, theme.wall, { layout: "contained", name: "herb dean", caneSwing: h.swing });
  ctx.restore();
}

// Hauling himself over the top of the fence: he rises up toward the camera
// at the top, both hands on the rail, cane tucked under his arm.
function drawHerbClimbing(h) {
  var lift = Math.sin(h.climb * Math.PI), r = HERB_R;
  var ry = herbFenceY() - h.y; // the rail, relative to him
  ctx.save();
  ctx.translate(0, -lift * r * 0.35);
  ctx.scale(1 + lift * 0.2, 1 + lift * 0.2);
  drawFighterArt(ctx, 0, 0, r, HERB_LOOK, theme.wall, { layout: "contained", name: "herb dean", caneSwing: 1.2 });
  ctx.restore();
  // Hands gripping the rail, and a leg swinging over at the top.
  ctx.fillStyle = HERB_LOOK.skin; ctx.strokeStyle = theme.wall; ctx.lineWidth = 2;
  [-1, 1].forEach(function (sd) {
    var hx = sd * r * (0.75 + lift * 0.1), hy = ry + Math.sin(h.t * 18 + sd) * 1.5;
    ctx.beginPath(); ctx.arc(hx, hy, r * 0.22, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  });
  if (lift > 0.5) {
    var k = (lift - 0.5) * 2;
    ctx.fillStyle = HERB_LOOK.shorts; ctx.strokeStyle = theme.wall;
    ctx.beginPath(); ctx.ellipse(r * 0.95 * k, ry - r * 0.15, r * 0.28, r * 0.42 * k + 2, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  }
}

// Whacking them: the cane comes up behind his head while he leans back,
// trembles at the top, then he lunges in and cracks it down on their head.
var HERB_LOOK_NOCANE = null;
function drawHerbWhacking(h) {
  if (!HERB_LOOK_NOCANE) { HERB_LOOK_NOCANE = JSON.parse(JSON.stringify(HERB_LOOK)); HERB_LOOK_NOCANE.cane = false; }
  var vic = balls[1 - h.ownerId], r = HERB_R;
  var ax = vic.x - h.x, ay = vic.y - h.y, aim = Math.atan2(ay, ax), al = Math.sqrt(ax * ax + ay * ay) || 1;
  var c = h.cyc, k, lean;
  var up = aim - h.flip * 2.6; // raised up behind him
  var down = aim + h.flip * 0.05; // across the top of their head
  var ang;
  if (c < CANE_WIND) {
    k = c / CANE_WIND; k = k * (2 - k);
    ang = aim + (up - aim) * k + (k > 0.8 ? Math.sin(c * 70) * 0.06 : 0);
    lean = -k * 5;
  } else if (c < CANE_WIND + CANE_STRIKE) {
    k = (c - CANE_WIND) / CANE_STRIKE; k = k * k;
    ang = up + (down - up) * k; lean = -5 + 13 * k;
  } else {
    k = (c - CANE_WIND - CANE_STRIKE) / CANE_RECOVER;
    ang = down + (aim - h.flip * 0.4 - down) * k * 0.5; lean = 8 * (1 - k);
  }
  ctx.translate(ax / al * lean, ay / al * lean);
  ctx.save(); ctx.scale(h.flip, 1);
  drawFighterArt(ctx, 0, 0, r, HERB_LOOK_NOCANE, theme.wall, { layout: "contained", name: "herb dean" });
  ctx.restore();
  // Motion streaks on the way down
  var len = r * 2.1, hx = Math.cos(ang) * r * 0.75, hy = Math.sin(ang) * r * 0.75;
  if (c >= CANE_WIND && c < CANE_WIND + CANE_STRIKE + 0.06) {
    ctx.strokeStyle = "rgba(255,255,255,0.7)"; ctx.lineWidth = 3;
    for (var i = 1; i <= 3; i++) {
      var ga = ang - h.flip * i * 0.22;
      ctx.beginPath(); ctx.moveTo(hx + Math.cos(ga) * len * 0.5, hy + Math.sin(ga) * len * 0.5); ctx.lineTo(hx + Math.cos(ga) * len, hy + Math.sin(ga) * len); ctx.stroke();
    }
  }
  ctx.save();
  ctx.translate(hx, hy); ctx.rotate(ang);
  ctx.lineCap = "round";
  [[theme.wall, r * 0.13, 0, len], ["#f4f4f2", r * 0.075, 0, len * 0.82], ["#c8102e", r * 0.075, len * 0.82, len]].forEach(function (s) {
    ctx.strokeStyle = s[0]; ctx.lineWidth = s[1]; ctx.beginPath(); ctx.moveTo(s[2], 0); ctx.lineTo(s[3], 0); ctx.stroke();
  });
  ctx.restore();
  // Both hands gripping it
  ctx.fillStyle = HERB_LOOK.skin; ctx.strokeStyle = theme.wall; ctx.lineWidth = 2;
  [0, 0.22].forEach(function (f) {
    ctx.beginPath(); ctx.arc(hx + Math.cos(ang) * len * f, hy + Math.sin(ang) * len * f, r * 0.2, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  });
}

// "Herb Dean is entering the ring" across the jumbotron (stadium.js), or
// as a banner over the cage in the test arena.
function drawHerbJumbo(x, y, w, h) {
  if (herbShow <= 0) return;
  var a = Math.min(1, herbShow / 0.3, (HERB_SHOW - herbShow) / 0.2);
  ctx.save();
  ctx.globalAlpha = a;
  ctx.fillStyle = "#06080f"; ctx.fillRect(x, y, w, h);
  var flash = Math.sin(performance.now() / 90) > 0;
  ctx.strokeStyle = flash ? "#ffd23f" : "#c8102e"; ctx.lineWidth = 6; ctx.strokeRect(x + 6, y + 6, w - 12, h - 12);
  var pr = h * 0.33, px = x + 40 + pr, py = y + h / 2;
  ctx.fillStyle = "#1b2238"; ctx.beginPath(); ctx.arc(px, py, pr + 8, 0, Math.PI * 2); ctx.fill();
  // Scaled down so his hair and cane stay inside the circle, and clipped to it.
  ctx.save();
  ctx.beginPath(); ctx.arc(px, py, pr + 8, 0, Math.PI * 2); ctx.clip();
  var ar = (pr + 8) / 1.75;
  drawFighterArt(ctx, px - ar * 0.2, py + ar * 0.28, ar, HERB_LOOK, "#0b0f12", { layout: "contained", name: "herb dean", caneSwing: Math.sin(performance.now() / 300) * 0.4 });
  ctx.restore();
  var tx = px + pr + 30, tw = x + w - tx - 30;
  jtText("NOW ENTERING THE RING", tx + tw / 2, y + h * 0.27, 30, "#c9d3ea", "center", "#000000", tw);
  jtText("HERB DEAN", tx + tw / 2, y + h * 0.55, 86, "#ffd23f", "center", "#b8862f", tw);
  jtText("REFEREE", tx + tw / 2, y + h * 0.8, 26, flash ? "#ffffff" : "#c9d3ea", "center", "#000000", tw);
  ctx.restore();
}
function drawHerbBanner() {
  if (herbShow <= 0 || stadiumOn()) return;
  drawHerbJumbo(10, 10, W - 20, 110);
}

// Fans get shoved aside as Herb barges through the stands (stadium.js asks
// for each fan's offset in stage pixels; it eases in and back out).
function herbShove(f, dt) {
  var tx = 0, ty = 0, h = herb;
  if (h && h.y > H) {
    var k = ST.A / W, hx = ST.AX + h.x * k, hy = ST.AY + h.y * k;
    var dx = f.x - hx, dy = f.y - hy, d = Math.sqrt(dx * dx + dy * dy) || 1, reach = f.r * 0.85 + HERB_R * k * 1.1;
    if (d < reach) {
      var push = reach - d;
      tx = (dx < 0 ? -1 : 1) * push * 1.1; ty = dy / d * push * 0.25;
    }
  }
  var a = Math.min(1, dt * 12);
  f.shx = (f.shx || 0) + (tx - (f.shx || 0)) * a;
  f.shy = (f.shy || 0) + (ty - (f.shy || 0)) * a;
}
