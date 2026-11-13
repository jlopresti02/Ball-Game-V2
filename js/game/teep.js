// The teep: a front push kick (Christian, 2026-11-13). A small strike any
// fighter can have, not just one: give it "hasTeep": true and a "teep" block
// in its character file. Sean Strickland is the first (strickland.js).
//
// When they're inside `range` (the gap between the two of them, edge to
// edge) and coming in at him, and it's off cooldown, he plants and lifts the
// knee (`chamber` seconds: the tell), then drives the foot straight out at
// them, sole first (`extend`). If they're inside `reach` when the leg is out,
// it lands: `damage`, a shove straight back (`push`) that stops them in
// their tracks, and with `stuff` set anything they were winding up (a punch,
// a kick, a haymaker) is knocked out of them. A slipped teep does nothing; a
// blocked one still shoves them back `blockPush` of the way. Out of reach,
// it's a "WHIFF". He holds the leg out for `hold`, brings it back down
// (`recover`), and can't throw another for `cooldown` seconds.
//
// The teep block:
//   cooldown      seconds between teeps
//   range         throws one when they're this close (edge to edge)
//   reach         how far past his own edge the foot gets at full stretch
//   chamber, extend, hold, recover   how long each part takes (seconds)
//   damage        when it lands (it hurts as source "teep": it can be
//                 slipped or blocked like any strike, never kick-checked)
//   push          the shove's speed, straight back away from him
//   blockPush     share of the shove a blocked teep still gives (0 to 1)
//   stuff         true: a teep that lands cancels whatever they were winding up
//   onlyClosing   true: only thrown while they're moving in on him
//   size          how thick the leg is drawn
// A fighter's own code can ask for one with forceTeep(b) (it's thrown as
// soon as nothing's in the way, cooldown or not).
//
// The teep runs on b.teep: { phase: "chamber" | "extend" | "hold" |
// "recover", t, ang, hit }.
"use strict";

var TEEP_TRACK = 9;   // how fast he turns to keep it on them while chambered (radians a second)

function teepCfg(b) { return b && b.char && b.char.hasTeep ? b.char.teep : null; }
// Planted on one leg: the speed regulator leaves him alone (physics.js).
function teepBusy(b) { return !!(b && b.teep); }

function forceTeep(b) { if (teepCfg(b)) b.teepWant = true; }

// Anything that should stop a teep (or stop one starting).
function teepBlocked(b) {
  return !b.alive || b.grappled || b.grapple || b.slam || b.sprawl || b.sprawled || subLocked(b) || b.guard || b.koOut || b.koRush ||
    b.shocked || b.dazed || b.dizzy || b.shelled || b.checkStun > 0 || b.checkAnim || b.combo || b.taunt || b.flow || !!b.igbb ||
    swordDuelLocked(b);
}

// From the abilities loop, before the special. True while a teep's running
// (he throws nothing else meanwhile).
function updateTeep(self, other, dt) {
  var tc = teepCfg(self);
  if (!tc) return false;
  if (self.teepCd > 0) self.teepCd = Math.max(0, self.teepCd - dt * (self.atkRate || 1));
  var m = self.teep;
  if (m && (teepBlocked(self) || over)) { self.teep = null; return false; }
  var dx = other.x - self.x, dy = other.y - self.y, d = Math.sqrt(dx * dx + dy * dy) || 1, gap = d - self.r - other.r;
  if (!m) {
    if (!started || over || !other.alive || other.invincible || other.koOut || other.igbb || other.grappled || other.slam || teepBlocked(self)) return false;
    if (self.punch || self.kick || self.swing || self.throwAnim || self.powerState || self.rageState || self.angry) return false;
    var want = self.teepWant;
    if (!want) {
      if (self.teepCd > 0 || gap > tc.range) return false;
      if (tc.onlyClosing) {
        // Coming in: their speed toward him, less his toward them.
        var ux = dx / d, uy = dy / d, closing = -(other.vx * ux + other.vy * uy) + (self.vx * ux + self.vy * uy);
        if (closing < 60) return false;
      }
    } else if (gap > tc.range * 1.6) return false; // (asked for, but they're well out of range)
    self.teepWant = false;
    self.teep = m = { phase: "chamber", t: 0, ang: Math.atan2(dy, dx), hit: false };
    self.teepCd = tc.cooldown;
  }
  m.t += dt;
  // Planted on the standing leg, easing to a stop.
  var damp = Math.exp(-14 * dt); self.vx *= damp; self.vy *= damp;
  var want2 = Math.atan2(dy, dx);
  if (m.phase === "chamber") {
    m.ang += Math.max(-TEEP_TRACK * dt, Math.min(TEEP_TRACK * dt, Math.atan2(Math.sin(want2 - m.ang), Math.cos(want2 - m.ang))));
    if (m.t >= tc.chamber) { m.phase = "extend"; m.t = 0; playTeepWhoosh(); }
    return true;
  }
  if (m.phase === "extend") {
    if (m.t >= tc.extend) { m.phase = "hold"; m.t = 0; landTeep(self, other, tc, m); }
    return true;
  }
  if (m.phase === "hold") {
    if (m.t >= tc.hold) { m.phase = "recover"; m.t = 0; }
    return true;
  }
  if (m.t >= tc.recover) { self.teep = null; if (self.alive && inOrdinaryMovement(self)) setSpeed(self, self.baseSpeed || SPEED); return false; }
  return true;
}

// The foot arrives: does it get there, and what does it do.
function landTeep(self, other, tc, m) {
  if (!other.alive || other.koOut) return;
  var ux = Math.cos(m.ang), uy = Math.sin(m.ang);
  // Where the sole is at full stretch, and how close they are to it.
  var fx = self.x + ux * (self.r + tc.reach * 0.85), fy = self.y + uy * (self.r + tc.reach * 0.85);
  var fd = Math.sqrt((other.x - fx) * (other.x - fx) + (other.y - fy) * (other.y - fy));
  if (fd > other.r + tc.reach * 0.45 + 6 || other.grappled || other.slam || other.igbb) {
    floater(fx, fy - 18, "WHIFF", "dodge");
    return;
  }
  m.hit = true;
  var dealt = hurt(other, tc.damage, "teep", self.id);
  if (other.justDodged) return; // slipped it
  var push = dealt > 0 ? tc.push : tc.push * (tc.blockPush || 0);
  if (push > 0 && teepPushable(other)) {
    // Straight back, whatever they were doing with their feet.
    var dx = other.x - self.x, dy = other.y - self.y, dl = Math.sqrt(dx * dx + dy * dy) || 1;
    var px = dx / dl * 0.6 + ux * 0.4, py = dy / dl * 0.6 + uy * 0.4, pl = Math.sqrt(px * px + py * py) || 1;
    other.vx = px / pl * push; other.vy = py / pl * push;
    other.knockFly = Math.max(other.knockFly || 0, 0.16);
  }
  if (dealt > 0) {
    if (tc.stuff) {
      if (other.punch && !other.punch.hit) other.punch = null;
      if (other.kick && !other.kick.hit) other.kick = null;
      if (other.swing && other.swing.phase === "windup") other.swing = null;
    }
    var cx = other.x - ux * other.r, cy = other.y - uy * other.r;
    impacts.push({ x: cx, y: cy, nx: -ux, ny: -uy, life: 0.3, max: 0.3, color: "#ffffff" });
    other.squash = { t: 0.16, max: 0.16, nx: -ux, ny: -uy };
    floater(other.x, other.y - other.r - 34, "TEEP", "note");
    if (!reduceMotion) shake = Math.max(shake, 7);
    playTeepThud(dealt);
  }
  checkEnd();
}

function teepPushable(o) {
  return o.alive && !o.grappled && !o.grapple && !o.slam && !subLocked(o) && !o.igbb && !o.koOut && !o.invincible && !o.sprawl && !o.sprawled;
}

// ---------------------------------------------------------------- drawing

// How far out the leg is right now, 0 (folded) to 1 (full stretch).
function teepReach(m, tc) {
  if (m.phase === "chamber") return 0.35 * Math.min(1, m.t / tc.chamber);
  if (m.phase === "extend") { var k = Math.min(1, m.t / tc.extend); return 0.35 + 0.65 * (1 - (1 - k) * (1 - k)); }
  if (m.phase === "hold") return 1;
  return 1 - Math.min(1, m.t / tc.recover);
}

// From draw.js, with the other attacks: the leg, chambered at the knee, then
// shot straight out with the sole of the foot facing them.
function drawTeep(b) {
  var m = b.teep, tc = teepCfg(b);
  if (!m || !tc || !b.alive) return;
  var ux = Math.cos(m.ang), uy = Math.sin(m.ang), px = -uy, py = ux;
  var k = teepReach(m, tc), size = tc.size || 15, skin = armColor(b.char);
  var side = b.id === 0 ? 1 : -1; // which leg (screen side), so two teepers don't mirror
  // Hip low on the body, a little to one side; the foot out at the end.
  var hx = b.x + ux * (b.r - 6) + px * b.r * 0.28 * side, hy = b.y + uy * (b.r - 6) + py * b.r * 0.28 * side + b.r * 0.12;
  var len = 8 + (tc.reach * 0.85 + 4) * k;
  var fx = hx + ux * len, fy = hy + uy * len;
  // Chambered: the knee comes up first and the shin hangs folded under it.
  var bend = m.phase === "chamber" ? 1 : m.phase === "extend" ? 1 - Math.min(1, m.t / tc.extend) : m.phase === "recover" ? Math.min(1, m.t / tc.recover) * 0.6 : 0;
  var kx = hx + ux * len * 0.55 + px * size * 0.9 * bend * side, ky = hy + uy * len * 0.55 + py * size * 0.9 * bend * side;
  ctx.save();
  ctx.lineCap = "round"; ctx.lineJoin = "round";
  [[theme.wall, size * 0.9 + 7], [skin, size * 0.62]].forEach(function (st) {
    ctx.strokeStyle = st[0]; ctx.lineWidth = st[1];
    ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(kx, ky); ctx.lineTo(fx, fy); ctx.stroke();
  });
  // A blur of speed lines behind the foot as it shoots out.
  if (m.phase === "extend" || (m.phase === "hold" && m.t < 0.06)) {
    ctx.strokeStyle = theme.ink; ctx.globalAlpha = 0.45; ctx.lineWidth = 2.5;
    for (var i = -1; i <= 1; i++) {
      var ox = px * i * size * 0.55, oy = py * i * size * 0.55;
      ctx.beginPath(); ctx.moveTo(fx - ux * size * 1.2 + ox, fy - uy * size * 1.2 + oy); ctx.lineTo(fx - ux * size * 3 + ox, fy - uy * size * 3 + oy); ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }
  // The foot: sole first, toes up (drawKickFoot's foot turns off the shin
  // with the sole facing along it).
  ctx.translate(fx, fy);
  ctx.rotate(m.ang);
  drawKickFoot(size, skin, -side);
  ctx.strokeStyle = skin; ctx.lineWidth = size * 0.62; ctx.lineCap = "butt";
  ctx.beginPath(); ctx.moveTo(-size * 1.1, 0); ctx.lineTo(-size * 0.55, 0); ctx.stroke();
  ctx.restore();
}

// ---------------------------------------------------------------- sound

function teepAudio(fn) {
  try {
    var ac = getAudioCtx();
    if (!ac) return;
    if (ac.state === "suspended") ac.resume();
    fn(ac, ac.currentTime);
  } catch (e) { /* never let audio break the game */ }
}
// The leg snapping out: a short, dry swish.
function playTeepWhoosh() {
  teepAudio(function (ac, t) { caneBurst(ac, t, 900, 0.7, 0.35, 0.12); caneBurst(ac, t + 0.02, 2200, 1.2, 0.18, 0.08); });
}
// The sole landing in the middle of them: a deep, flat thump (a shove, not a
// crack) with a slap of skin on top.
function playTeepThud(dealt) {
  teepAudio(function (ac, t) {
    var v = Math.min(1, 0.5 + (dealt || 0) / 30);
    caneTone(ac, t, "sine", 120, 45, 0.55 * v, 0.22);
    caneBurst(ac, t, 380, 0.8, 0.6 * v, 0.14);
    caneBurst(ac, t + 0.004, 2600, 1.4, 0.3 * v, 0.05);
  });
}
