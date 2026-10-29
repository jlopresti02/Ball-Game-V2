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
  }
  var m = self.igbb;
  m.t += dt;
  var dx = other.x - self.x, dy = other.y - self.y, d = Math.sqrt(dx * dx + dy * dy) || 1;

  if (m.phase === "announce") {
    self.vx = 0; self.vy = 0;
    if (m.t >= HERB_ANNOUNCE) {
      m.phase = "close"; m.t = 0;
      herbEnters(self);
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
    var gap = self.r + other.r + 10;
    self.x += (other.x - m.nx * gap - self.x) * Math.min(1, dt * 10);
    self.y += (other.y - m.ny * gap - self.y) * Math.min(1, dt * 10);
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
      if (last) {
        if (dealt > 0) floater(other.x, other.y - other.r - 30, "HOME RUN", "crit");
        playSlam();
        if (!reduceMotion) hitStop = Math.max(hitStop, 0.08);
        endHerbDean(self, other, true);
        checkEnd();
        return false;
      }
      checkEnd();
    }
    if (!other.alive) { endHerbDean(self, other, true); return false; }
    return true;
  }
  return true;
}

// Herb comes in through the far side of the cage from the fight, heading
// for Gane (he can't see a thing) but wandering on past him.
function herbEnters(owner) {
  var fromRight = owner.x < W / 2;
  var x0 = fromRight ? W + HERB_R : -HERB_R, y0 = Math.min(H - HERB_R - 10, Math.max(HERB_R + 10, owner.y + (Math.random() - 0.5) * 120));
  herb = { x: x0, y: y0, t: 0, phase: "walk", ownerId: owner.id, missed: false, hitT: 0, hitCd: 0, swing: 0, flip: fromRight ? -1 : 1, outX: x0 };
}

function updateHerb(dt) {
  if (herbShow > 0) herbShow = Math.max(0, herbShow - dt);
  var h = herb;
  if (!h) return;
  h.t += dt;
  var owner = balls[h.ownerId], vic = balls[1 - h.ownerId];
  var sp = owner.char.special;
  if (h.phase === "walk") {
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
    h.flip = mx < 0 ? -1 : 1;
    h.swing = Math.sin(h.t * 5) * 0.45;
    // Bumps right into the one getting beaten.
    var vx = vic.x - h.x, vy = vic.y - h.y;
    if (h.missed && vic.alive && Math.sqrt(vx * vx + vy * vy) < vic.r + HERB_R + 2) {
      h.phase = "hit"; h.hitT = 0; h.hitCd = 0.3;
      h.flip = vx < 0 ? -1 : 1;
      h.ang = Math.atan2(h.y - vic.y, h.x - vic.x);
      floater(vic.x, vic.y - vic.r - 52, "HERB JOINS IN", "crit");
    }
  } else if (h.phase === "hit") {
    h.hitT += dt;
    h.hitCd -= dt;
    // Feels his way round them to the side away from Gane, still swinging.
    var want = Math.atan2(vic.y - owner.y, vic.x - owner.x);
    var diff = Math.atan2(Math.sin(want - h.ang), Math.cos(want - h.ang));
    h.ang += Math.max(-4 * dt, Math.min(4 * dt, diff));
    var rr = vic.r + HERB_R - 4;
    h.x = vic.x + Math.cos(h.ang) * rr; h.y = vic.y + Math.sin(h.ang) * rr;
    h.flip = vic.x < h.x ? -1 : 1;
    h.swing = 0.25 + Math.abs(Math.sin(h.hitT * 12)) * 0.9; // whacking away with the cane
    var stillOn = vic.alive && owner.igbb && owner.igbb.move === "herbdean";
    if (stillOn && h.hitCd <= 0) {
      h.hitCd = sp.caneGap;
      hurt(vic, sp.caneDamage, "igbb", owner.id);
      playPunch(6);
      checkEnd();
    }
    if (!stillOn) herbLeaves();
  } else if (h.phase === "leave") {
    var ox = h.outX - h.x;
    h.flip = ox < 0 ? -1 : 1;
    h.x += (ox < 0 ? -1 : 1) * HERB_WALK * 1.2 * dt;
    h.swing = Math.sin(h.t * 5) * 0.45;
    if (Math.abs(ox) < 4 || h.x < -HERB_R * 2 || h.x > W + HERB_R * 2) herb = null;
  }
}

function herbLeaves() {
  if (!herb || herb.phase === "leave") return;
  herb.phase = "leave";
  herb.outX = herb.x < W / 2 ? -HERB_R * 2 : W + HERB_R * 2;
}

function endHerbDean(self, other, landed) {
  if (other.dazed === "held") other.dazed = false;
  if (landed && other.alive) {
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
  if (m.phase === "beat") {
    var k = Math.min(1, m.swingT / sp.batGap);
    // Cocks it back, then whips down at the end of each beat.
    var e = k < 0.7 ? -0.6 * (k / 0.7) : -0.6 + 1.6 * ((k - 0.7) / 0.3);
    ang = base + m.side * (1.1 - Math.max(-0.6, e) * 1.1);
    if (k < 0.15) ang = base + m.side * 0.05; // just landed
  } else if (m.phase === "announce") {
    var up = Math.min(1, m.t / 0.4);
    ang = base - 2.3 * up;
  } else ang = base - 2.3;
  var arm = (ch.punch.size || 13) * 0.75;
  var hx = b.x + Math.cos(ang) * b.r * 0.85, hy = b.y + Math.sin(ang) * b.r * 0.85;
  var shx = b.x + Math.cos(ang) * b.r * 0.4, shy = b.y + Math.sin(ang) * b.r * 0.4;
  drawBat(hx, hy, ang, b.r * 1.6); // cheater.js
  strokeLimb(arm, armColor(ch), function () { ctx.moveTo(shx, shy); ctx.lineTo(hx, hy); });
  drawGloveAt(hx, hy, b.r * 0.22, ch);
}

function drawHerb() {
  var h = herb;
  if (!h) return;
  ctx.save();
  ctx.translate(h.x, h.y);
  // Shadow
  ctx.fillStyle = "rgba(0,0,0,0.14)";
  ctx.beginPath(); ctx.ellipse(HERB_R * 0.15, HERB_R * 0.9, HERB_R * 0.9, HERB_R * 0.28, 0, 0, Math.PI * 2); ctx.fill();
  var bob = h.phase === "hit" ? 0 : Math.abs(Math.sin(h.t * 6)) * 2;
  ctx.translate(0, -bob);
  ctx.scale(h.flip, 1); // the cane on the side he's heading (or hitting)
  drawFighterArt(ctx, 0, 0, HERB_R, HERB_LOOK, theme.wall, { layout: "contained", name: "herb dean", caneSwing: h.swing });
  ctx.restore();
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
  drawFighterArt(ctx, px, py, pr, HERB_LOOK, "#0b0f12", { layout: "contained", name: "herb dean", caneSwing: Math.sin(performance.now() / 300) * 0.4 });
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
