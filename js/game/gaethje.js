// Justin Gaethje's extras.
//
// Violent: a fighter with `violent` set makes everything it lands look like
// it hurts. Every punch, haymaker and slam lands with a short freeze, a big
// screen shake, a squashed and flashing victim, an impact ring and a spray
// of sweat (violentHit, called from the punch, the swing and the slam).
//
// Dizzy: a fighter whose `swing.dizzy` is set leaves anyone its haymaker
// lands on dizzy for that many seconds: stars and spirals round the head,
// staggering about on wobbly legs at half speed, unable to throw anything.
//
// The occasional haymaker itself is the CTE swing (cte.js) with
// `swing.cooldown` set, and the double leg is the Grappler's grab with
// `grapple.shotChance` and `grapple.shotName` (abilities.js).
"use strict";

var DIZZY_SPEED = 0.5;   // share of normal speed while staggering about
var DIZZY_WOBBLE = 7;    // how fast the stagger swings from side to side

// power: 0.5 for a punch, 1 for the haymaker or a slam.
function violentHit(atk, vic, power) {
  if (!atk.char.violent || !vic.alive) return;
  var nx = vic.x - atk.x, ny = vic.y - atk.y, nd = Math.sqrt(nx * nx + ny * ny) || 1;
  nx /= nd; ny /= nd;
  vic.squash = { t: 0.12 + 0.1 * power, max: 0.12 + 0.1 * power, nx: nx, ny: ny };
  vic.flash = 0.16;
  impacts.push({ x: vic.x - nx * vic.r * 0.8, y: vic.y - ny * vic.r * 0.8, nx: nx, ny: ny, life: 0.3 + 0.15 * power, max: 0.3 + 0.15 * power, color: "#ffffff" });
  if (reduceMotion) return;
  shake = Math.max(shake, 10 + 14 * power);
  hitStop = Math.max(hitStop, 0.03 + 0.07 * power);
  for (var i = 0; i < 4 + Math.round(8 * power); i++) {
    var a = Math.atan2(ny, nx) + (Math.random() - 0.5) * 1.7, sp = 180 + Math.random() * 280 * (0.6 + power);
    particles.push({ x: vic.x - nx * vic.r * 0.4, y: vic.y - ny * vic.r * 0.4, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 40, life: 0.35, max: 0.35, size: 2.5 + Math.random() * 2.5, color: i % 3 ? "#bfe3ff" : "#ffffff" });
  }
}

function makeDizzy(b, secs) {
  if (!b.alive || b.invincible) return;
  b.dizzy = { t: secs, ang: Math.atan2(b.vy, b.vx) || 0, phase: Math.random() * 6 };
  b.punch = null; b.kick = null; b.swing = null; b.throwAnim = null;
  setSpeed(b, (b.baseSpeed || SPEED) * DIZZY_SPEED);
  floater(b.x, b.y - b.r - 44, "DIZZY", "crit");
}

// Runs every frame (from updateAbilities): the stagger, and the clock.
function tickDizzy(dt) {
  balls.forEach(function (b) {
    var dz = b.dizzy;
    if (!dz) return;
    dz.t -= dt;
    if (dz.t <= 0 || !b.alive) {
      b.dizzy = null;
      if (b.alive) setSpeed(b, b.baseSpeed || SPEED);
      return;
    }
    if (!inOrdinaryMovement(b)) return; // a slam or a grab has them
    // Weaves about like the floor is moving.
    dz.phase += dt;
    dz.ang += Math.sin(dz.phase * DIZZY_WOBBLE) * dt * 5 + (Math.random() - 0.5) * dt * 3;
    var sp = (b.baseSpeed || SPEED) * DIZZY_SPEED;
    var ease = Math.min(1, dt * 4); // eases in, so punches still knock them about
    b.vx += (Math.cos(dz.ang) * sp - b.vx) * ease; b.vy += (Math.sin(dz.ang) * sp - b.vy) * ease;
  });
}

// The sway, for draw.js to add to where the fighter's drawn.
function dizzyOffset(b) {
  if (!b.dizzy || reduceMotion) return { x: 0, y: 0 };
  var p = b.dizzy.phase || 0;
  return { x: Math.sin(p * DIZZY_WOBBLE) * b.r * 0.12, y: Math.abs(Math.cos(p * DIZZY_WOBBLE)) * b.r * 0.05 };
}

// Stars and a spiral circling the head.
function drawDizzy(b) {
  if (!b.dizzy || !b.alive) return;
  var t = performance.now() / 1000;
  for (var i = 0; i < 4; i++) {
    var a = t * 6 + i * Math.PI / 2;
    drawStar(b.x + Math.cos(a) * b.r * 0.8, b.y - b.r * 1.08 + Math.sin(a) * b.r * 0.24, b.r * 0.16, i % 2 ? "#ffd23f" : "#ffffff"); // chairshot.js
  }
  ctx.save();
  ctx.strokeStyle = "rgba(255,255,255,0.75)"; ctx.lineWidth = 2;
  ctx.beginPath();
  for (var k = 0; k <= 40; k++) {
    var s = k / 40, ra = s * Math.PI * 4 - t * 5, rr = b.r * 0.32 * s;
    var x = b.x + Math.cos(ra) * rr, y = b.y - b.r * 1.08 + Math.sin(ra) * rr * 0.4;
    if (k === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.stroke();
  ctx.restore();
}
