// Charles Oliveira's Kamehameha (Joe, 2026-11-09). Its own move, apart from
// Do Bronx: once a match, at a random time, his Super Saiyan aura bursts on
// (blond hair, gold flames, Joe's burst sound) and shoves the opponent back,
// then he plants and cups his hands at his side: a blue ball of energy grows between them as he calls out
// "KA... ME... HA... ME...", then he thrusts both hands forward on "HA!" and
// a huge blue beam blasts across the ring to the cage. Whoever's in it takes
// kamehameha.damage and is driven back into the cage (wall slams). A blue
// path shows where the beam will go: it tracks them until a second before
// it fires, then locks and flashes, so a fighter that moves can still get
// out of the way. Then the aura dies down and his hair goes back to black.
// Nothing can hit him while he does it (an igbb move: specialGuarding).
// Grabbed or hit while he's still powering up or charging, he Instant
// Transmissions away to another part of the ring and keeps charging; his
// aim snaps straight back onto them, and if it was about to go off he holds
// it a moment so the new path shows before it fires (Joe, 2026-11-10).
// Runs on b.igbb (move "kamehameha"). Config: char.kamehameha.
"use strict";

var KM_LOCK = 1.0;   // he tracks them until a second before it fires (Joe)
var KM_POWER = 0.9;  // the aura bursting on before he starts charging
var KM_END = 0.4;    // hands coming back down after the beam
var KM_SPEED = 2600; // how fast the beam shoots out
var KM_CALLS = ["KA...", "ME...", "HA...", "ME..."];
var KM_SNAP = 0.55;  // after teleporting out, at least this long before it fires
var KM_ESC_CD = 0.25; // a burst of hits (diamonds, laser ticks) is blocked, not one teleport each

function kameOn(b) { return !!(b && b.igbb && b.igbb.move === "kamehameha"); }
function kmRand(r) { return r[0] + Math.random() * (r[1] - r[0]); }

// From makeBall: once a match, at a random time (kamehameha.first).
function initKamehameha(b) {
  var cfg = b.char.kamehameha;
  b.kameN = 0;
  b.kameT = cfg ? kmRand(cfg.first) : Infinity;
}

// From the abilities loop, before the special. True while it's running.
function updateKamehameha(self, other, dt) {
  var cfg = self.char.kamehameha;
  if (!cfg) return false;
  if (!self.igbb) {
    if (!started || over || self.kameN >= 1 || self.doBronx || charlesBlond(self)) return false;
    self.kameT -= dt;
    if (self.kameT > 0 || !canStartIgbb(self, other) || swordDuelActive()) return false;
    clearActions(self);
    self.kameN++;
    self.igbb = { move: "kamehameha", phase: "power", t: 0, calls: 0, hit: false };
    kmAim(self, other);
    self.igbb.side = self.igbb.dx > 0 ? -1 : 1;
    // The aura bursts on: blond hair, the gold flames and Joe's burst (dobronx.js).
    doBronxHair(self, true); self.kameBlond = true;
    kmPushAway(self, other); // the energy coming up shoves them back, so the beam has room to fly
    if (!reduceMotion) shake = Math.max(shake, 10);
  }
  var m = self.igbb;
  if (m.move !== "kamehameha") return false;
  m.t += dt; m.callT = (m.callT || 0) + dt;
  if (m.escCd) m.escCd = Math.max(0, m.escCd - dt);
  if (m.snap) m.snap = Math.max(0, m.snap - dt);
  self.vx = 0; self.vy = 0;
  if (over) { endKamehameha(self); return false; }

  if (m.phase === "power") {
    if (other.alive) kmAim(self, other);
    kmTurn(m, dt);
    if (m.t >= KM_POWER) { m.phase = "charge"; m.t = 0; playKameCharge(cfg.charge); }
    return true;
  }
  if (m.phase === "charge") {
    // (Right after a teleport out, it follows them for a moment even in the
    // last second, then locks again.)
    if ((m.t < cfg.charge - KM_LOCK || m.track > 0) && other.alive) { kmAim(self, other); kmTurn(m, dt); }
    if (m.track) m.track = Math.max(0, m.track - dt);
    var call = Math.floor(m.t / (cfg.charge / (KM_CALLS.length + 0.4)));
    if (call >= m.calls && m.calls < KM_CALLS.length) {
      m.calls++; m.callT = 0; // shown in the caption (drawKameCaption), not over his head (Joe)
      m.pulse = 1; // the ball flares on every syllable
      if (!reduceMotion) shake = Math.max(shake, 3 + m.calls * 1.5);
    }
    m.pulse = Math.max(0, (m.pulse || 0) - dt * 3);
    // The ground trembles harder and harder, and bits of the mat lift off round him.
    var ck = m.t / cfg.charge;
    if (!reduceMotion) {
      shake = Math.max(shake, 1 + 3 * ck);
      if (Math.random() < 0.25 + 0.5 * ck) {
        var ra = Math.random() * Math.PI * 2, rd = self.r * (1.3 + Math.random() * 0.9);
        particles.push({ x: self.x + Math.cos(ra) * rd, y: self.y + Math.sin(ra) * rd * 0.6 + self.r * 0.5, vx: (Math.random() - 0.5) * 20, vy: -60 - Math.random() * 90,
          life: 0.7, max: 0.7, size: 2 + Math.random() * 3, color: Math.random() < 0.5 ? "#c9bfa6" : "#9fd6ff" });
      }
    }
    if (m.t >= cfg.charge) {
      m.phase = "fire"; m.t = 0;
      m.len = kmRayToWall(self.x, self.y, m.dx, m.dy);
      m.callT = 0;
      self.squash = { t: 0.2, max: 0.2, nx: -m.dx, ny: -m.dy };
      if (!reduceMotion) { shake = Math.max(shake, 18); hitStop = Math.max(hitStop, 0.06); }
      duelFlash = Math.max(duelFlash, 0.9); // a white flash as it goes off (sword.js draws it)
      impacts.push({ x: self.x + m.dx * self.r * 1.4, y: self.y + m.dy * self.r * 1.4, nx: m.dx, ny: m.dy, life: 0.5, max: 0.5, color: "#bfe6ff" });
      crowdReact(0.9);
      playKameBlast(cfg.beamTime);
    }
    return true;
  }
  if (m.phase === "fire") {
    // The blast's recoil slides him back a little.
    if (m.t < cfg.beamTime * 0.6) {
      self.x = Math.min(W - self.r, Math.max(self.r, self.x - m.dx * 40 * dt));
      self.y = Math.min(H - self.r, Math.max(self.r, self.y - m.dy * 40 * dt));
    }
    m.len = kmRayToWall(self.x, self.y, m.dx, m.dy);
    m.ext = Math.min(m.len, m.t * KM_SPEED);
    if (!reduceMotion) shake = Math.max(shake, 6);
    // Sparks and dust thrown off the sides of the beam, and the cage taking it.
    if (!reduceMotion && m.ext > self.r * 2) {
      var along0 = self.r * 1.5 + Math.random() * (m.ext - self.r * 1.5), sd = Math.random() < 0.5 ? -1 : 1;
      var bx = self.x + m.dx * along0 - m.dy * sd * cfg.width * 0.5, by = self.y + m.dy * along0 + m.dx * sd * cfg.width * 0.5;
      particles.push({ x: bx, y: by, vx: -m.dy * sd * 160 + m.dx * 120, vy: m.dx * sd * 160 + m.dy * 120, life: 0.4, max: 0.4, size: 2 + Math.random() * 2.5, color: Math.random() < 0.6 ? "#bfe6ff" : "#ffffff" });
      if (m.ext >= m.len - 1 && Math.random() < 0.6) {
        var ex = self.x + m.dx * m.len, ey = self.y + m.dy * m.len, ea = Math.atan2(-m.dy, -m.dx) + (Math.random() - 0.5) * 2.4, ev = 200 + Math.random() * 260;
        particles.push({ x: ex, y: ey, vx: Math.cos(ea) * ev, vy: Math.sin(ea) * ev, life: 0.5, max: 0.5, size: 3 + Math.random() * 4, color: Math.random() < 0.5 ? "#7cc8ff" : "#e8f6ff" });
      }
    }
    if (!m.hit && other.alive) {
      // Is any of them inside the beam so far?
      var ox = other.x - self.x, oy = other.y - self.y;
      var along = ox * m.dx + oy * m.dy, across = Math.abs(-m.dy * ox + m.dx * oy);
      if (along > 0 && along < m.ext + other.r && across < cfg.width / 2 + other.r * 0.85) {
        m.hit = true;
        var dealt = hurtProjectile(other, cfg.damage, self.id, m.dx, m.dy);
        if (dealt > 0) {
          floater(other.x, other.y - other.r - 30, "KAMEHAMEHA!", "crit");
          if (!reduceMotion) { shake = Math.max(shake, 22); hitStop = Math.max(hitStop, 0.08); }
          impacts.push({ x: other.x, y: other.y, nx: m.dx, ny: m.dy, life: 0.6, max: 0.6, color: "#7cc8ff" });
          impacts.push({ x: other.x, y: other.y, nx: -m.dx, ny: -m.dy, life: 0.6, max: 0.6, color: "#ffffff" });
          for (var pi = 0; pi < 22 && !reduceMotion; pi++) {
            var pa = Math.random() * Math.PI * 2, pv = 150 + Math.random() * 350;
            particles.push({ x: other.x, y: other.y, vx: Math.cos(pa) * pv + m.dx * 200, vy: Math.sin(pa) * pv + m.dy * 200, life: 0.6, max: 0.6, size: 3 + Math.random() * 4, color: pi % 2 ? "#9fd6ff" : "#ffffff" });
          }
          if (other.alive) beginWallSlam(other, m.dx, m.dy, { knockback: cfg.knockback, wallSlams: cfg.wallSlams, slamDamage: cfg.slamDamage });
          checkEnd();
        }
      }
    }
    if (m.t >= cfg.beamTime) {
      m.phase = "end"; m.t = 0;
      if (!m.hit && other.alive) floater(other.x, other.y - other.r - 30, "MISSED!", "dodge");
    }
    return true;
  }
  if (m.t >= KM_END) { endKamehameha(self); return false; }
  return true;
}

// The camera pushes in on him while he charges (closer on every syllable),
// then snaps back out to show the beam crossing the ring. Uses the sword
// duel's camera and vignette (sword.js). Null when nobody's doing it.
function kameCam() {
  var out = null;
  balls.forEach(function (b) {
    if (!kameOn(b) || !b.alive) return;
    var m = b.igbb, cfg = b.char.kamehameha;
    if (m.phase === "power") out = { z: 1 + 0.12 * Math.min(1, m.t / KM_POWER), x: b.x, y: b.y };
    else if (m.phase === "charge") out = { z: 1.12 + 0.2 * (m.t / cfg.charge) + 0.03 * (m.pulse || 0), x: b.x, y: b.y };
    else if (m.phase === "fire" && m.t < 0.12) out = { z: 1.36, x: b.x, y: b.y };
  });
  return out;
}

function kmPushAway(self, other) {
  if (!other.alive) return;
  var dx = other.x - self.x, dy = other.y - self.y, d = Math.sqrt(dx * dx + dy * dy) || 1;
  clearActions(other);
  other.vx = dx / d * 650; other.vy = dy / d * 650;
  other.knockFly = 0.3;
  impacts.push({ x: self.x, y: self.y, nx: dx / d, ny: dy / d, life: 0.45, max: 0.45, color: "#7cc8ff" });
  if (!reduceMotion) shake = Math.max(shake, 8);
}

// Joe: while he's aiming he always faces them, live. His stance turns as
// they move: the hands swing round to the hip away from them (side -1 when
// they're to his right, 1 to his left) and he leans and tilts with it.
function kmTurn(m, dt) {
  var target = m.dx >= 0 ? -1 : 1;
  if (m.side == null) m.side = target;
  m.side += Math.max(-dt * 5, Math.min(dt * 5, target - m.side));
}

// Powering up or charging (not yet fired): the part he can be got at in.
function kameCharging(b) {
  return kameOn(b) && b.alive && (b.igbb.phase === "power" || b.igbb.phase === "charge");
}

// From hurt() and attemptGrab(): grabbed or hit while charging, he
// teleports away (Instant Transmission) instead of being stopped. True if
// he got away. path: a projectile's line of flight, to land off it. A
// grab always gets away; hits right after a teleport are just blocked.
function kameEscape(b, attackerId, grab, path) {
  if (!kameCharging(b) || attackerId == null || attackerId === b.id) return false;
  var other = balls[attackerId], m = b.igbb;
  if (!other) return false;
  if ((m.escCd || 0) > 0) { b.justDodged = true; return true; } // only just teleported: whatever else was coming misses
  var spot = kmEscapeSpot(b, other, path);
  itTeleport(b, spot.x, spot.y);
  b.vx = 0; b.vy = 0;
  other.punch = null; other.kick = null; other.jabAnim = null; // swinging at thin air (and the arm doesn't chase him across the ring)
  floater(b.x, b.y - b.r - 8, grab ? "ESCAPED!" : "DODGE", "dodge");
  m.escCd = KM_ESC_CD;
  m.esc = (m.esc || 0) + 1;
  // His aim snaps onto them from where he is now, and his stance turns with it.
  if (other.alive) kmAim(b, other);
  m.side = m.dx >= 0 ? -1 : 1;
  m.snap = 0.25; // the path flashes as it snaps across (drawKamehameha)
  // About to fire: hold it a moment, so they can see where it's going now.
  var cfg = b.char.kamehameha;
  if (m.phase === "charge" && m.t > cfg.charge - KM_SNAP) m.t = cfg.charge - KM_SNAP;
  m.track = KM_SNAP - 0.3; // then locks for the last 0.3s
  b.justDodged = true;
  return true;
}

// Somewhere well away from them (room for the beam to fly), in the ring,
// and out of a projectile's line.
function kmEscapeSpot(b, other, path) {
  var good = [], best = null, minD = Math.min(W, H) * 0.45;
  for (var i = 0; i < 24; i++) {
    var x = b.r + Math.random() * (W - 2 * b.r), y = b.r + Math.random() * (H - 2 * b.r);
    var d = Math.sqrt((x - other.x) * (x - other.x) + (y - other.y) * (y - other.y));
    var clear = !path || Math.abs(-path.dy * (x - path.x) + path.dx * (y - path.y)) > b.r * 3;
    if (!clear) continue;
    if (d >= minD) good.push({ x: x, y: y });
    if (!best || d > best.d) best = { x: x, y: y, d: d };
  }
  if (good.length) return good[Math.floor(Math.random() * good.length)];
  return best || { x: W - other.x, y: H - other.y };
}

function kmAim(self, other) {
  var dx = other.x - self.x, dy = other.y - self.y, d = Math.sqrt(dx * dx + dy * dy) || 1;
  self.igbb.dx = dx / d; self.igbb.dy = dy / d;
}

// How far the beam goes from (x, y) along (dx, dy) before the cage.
function kmRayToWall(x, y, dx, dy) {
  var t = Infinity;
  if (dx > 1e-6) t = Math.min(t, (W - x) / dx); else if (dx < -1e-6) t = Math.min(t, -x / dx);
  if (dy > 1e-6) t = Math.min(t, (H - y) / dy); else if (dy < -1e-6) t = Math.min(t, -y / dy);
  return Math.max(0, t);
}

function endKamehameha(self) {
  self.igbb = null;
  if (self.kameBlond) { self.kameBlond = false; doBronxHair(self, false); } // the aura dies down and his hair goes back to black
  setSpeed(self, SPEED);
}

// ---------------------------------------------------------------- his pose
// Joe (2026-11-09): the stance should look like the real thing. Powering up
// he sinks into a crouch. Charging he leans back and tilts over the hip his
// hands are cupped at, trembling harder as it builds. On "HA!" he lunges
// forward, leaning into the blast with both arms locked out, palms open.

function kmEase(k) { k = Math.max(0, Math.min(1, k)); return k * k * (3 - 2 * k); }

// How far into the stance he is: crouch (0-1), lean back (0-1), lunge (0-1).
function kmStance(b) {
  var m = b.igbb, cfg = b.char.kamehameha;
  if (m.phase === "power") return { crouch: kmEase(m.t / KM_POWER), back: kmEase(m.t / KM_POWER) * 0.4, lunge: 0, ck: 0 };
  if (m.phase === "charge") return { crouch: 1, back: 0.4 + 0.6 * kmEase(m.t / 0.5), lunge: 0, ck: m.t / cfg.charge };
  if (m.phase === "fire") { var l = kmEase(m.t / 0.08); return { crouch: 1 - 0.6 * l, back: 1 - l, lunge: l, ck: 1 }; }
  var e = 1 - kmEase(m.t / KM_END); return { crouch: 0.4 * e, back: 0, lunge: e, ck: 0 };
}

// From draw.js: the whole fighter shifts (leaning back, then lunging in).
function kameOffset(b) {
  if (!kameOn(b) || !b.alive) return { x: 0, y: 0 };
  var m = b.igbb, st = kmStance(b), r = b.r, dx = m.dx || 1, dy = m.dy || 0;
  var trem = reduceMotion ? 0 : r * 0.035 * st.ck;
  var t = performance.now() / 1000;
  return {
    x: (-dx * 0.16 * st.back + dx * 0.24 * st.lunge) * r + Math.sin(t * 61) * trem,
    y: (-dy * 0.16 * st.back + dy * 0.24 * st.lunge) * r + 0.06 * r * st.crouch + Math.cos(t * 53) * trem
  };
}

// From draw.js, on the body's transform: the crouch and the tilt.
function applyKamePose(b) {
  if (!kameOn(b) || !b.alive) return;
  var m = b.igbb, st = kmStance(b), r = b.r, dx = m.dx || 1;
  var side = m.side || (dx > 0 ? -1 : 1);
  // Tilt over the hip his hands are at while he charges, into the blast on the fire.
  var tilt = side * 0.24 * st.back + Math.max(-1, Math.min(1, dx * 1.6)) * 0.2 * st.lunge;
  ctx.translate(b.x, b.y + r);
  ctx.rotate(tilt);
  // Mid-turn (his hands swinging across) he narrows a little, as if turning side-on.
  var turn = m.phase === "power" || m.phase === "charge" ? 0.82 + 0.18 * Math.min(1, Math.abs(side)) : 1;
  ctx.scale((1 + 0.05 * st.crouch) * turn, 1 - 0.08 * st.crouch);
  ctx.translate(-b.x, -(b.y + r));
}

// Where his hands are and how big the ball of energy is. The fighters are
// drawn facing us, so the charge is always cupped at one hip, on the side
// away from the opponent (never up by his head), and on the fire the hands
// push out toward them.
function kmHandPose(b) {
  var m = b.igbb, r = b.r, dx = m.dx || 1, dy = m.dy || 0;
  var size = b.char.punch.size || 15, cfg = b.char.kamehameha;
  if (m.phase === "power" || m.phase === "charge") {
    if (m.side == null) m.side = dx > 0 ? -1 : 1;
    var cs = m.side;
    var k = kmEase((m.phase === "charge" ? m.t + KM_POWER : m.t) / (KM_POWER * 0.6));
    return { hx: b.x + cs * r * (0.85 + 0.45 * k), hy: b.y + r * (0.05 + 0.3 * k), side: cs, cup: true, k: k,
      ball: m.phase === "charge" ? size * (0.5 + 1.3 * Math.min(1, m.t / cfg.charge)) : size * 0.35 * k };
  }
  var k2 = m.phase === "fire" ? kmEase(m.t / 0.08) : 1 - kmEase(m.t / KM_END);
  return { hx: b.x + dx * r * (0.95 + 0.6 * k2), hy: b.y + dy * r * (0.95 + 0.6 * k2), side: 0, k: k2,
    ball: m.phase === "fire" ? size * 1.9 : size * 1.2 * (1 - m.t / KM_END) };
}

// Hands pushed up above his shoulders go behind his head, so the arms are
// drawn before his body (from draw.js, with the aura) and only the hands
// and the energy show over the top.
function kmArmsBehind(b, h) { return !h.cup && h.hy < b.y - b.r * 0.25; }

function drawKameArmsBehind(b) {
  if (!kameOn(b) || !b.alive) return;
  var h = kmHandPose(b);
  if (!h.cup) kmDrawArms(b, h, "back");
}

// An open hand: the fingerless glove's padding over the knuckles and back
// of the hand, fingers and thumb spread out along (fx, fy).
function kmOpenHand(b, x, y, fx, fy, size, curl) {
  var skin = armColor(b.char), fa = Math.atan2(fy, fx);
  ctx.lineCap = "round";
  for (var i = 0; i < 5; i++) {
    var thumb = i === 4, a = fa + (thumb ? -1.05 : (-0.42 + i * 0.28)) * (1 - 0.45 * curl);
    var len = size * (thumb ? 0.55 : 0.78 - Math.abs(i - 1.5) * 0.06) * (1 - 0.35 * curl);
    var bx = x + Math.cos(a) * size * 0.45, by = y + Math.sin(a) * size * 0.45;
    [[theme.wall, size * 0.34], [skin, size * 0.22]].forEach(function (pass) {
      ctx.strokeStyle = pass[0]; ctx.lineWidth = pass[1];
      ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx + Math.cos(a) * len, by + Math.sin(a) * len); ctx.stroke();
    });
  }
  ctx.fillStyle = gloveColor(b.char); ctx.strokeStyle = theme.wall; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(x, y, size * 0.62, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
}

// which: "back" (arms that go behind his body), "front" (the rest, and the
// hands), or "all".
function kmDrawArms(b, h, which) {
  which = which || "all";
  var r = b.r, size = b.char.punch.size || 15, m = b.igbb, st = kmStance(b);
  var arms = [];
  if (h.cup) {
    // Cupped at the hip, one hand above the ball and one below, palms facing
    // each other round it; elbows bent out behind him.
    var s = h.side, gap = Math.max(h.ball * 0.9, size * 0.5) + size * 0.45;
    var hands = [[h.hx, h.hy - gap, 0.35, 1], [h.hx, h.hy + gap, 0.35, -1]];
    var shs = [[b.x + s * r * 0.8, b.y - r * 0.15], [b.x + s * r * 0.72, b.y + r * 0.28]];
    for (var i = 0; i < 2; i++) {
      var sh = shs[i], hd = hands[i];
      var ex = (sh[0] + hd[0]) / 2 + s * r * 0.18 * h.k - (m.dx || 0) * r * 0.25 * h.k, ey = (sh[1] + hd[1]) / 2 - (m.dy || 0) * r * 0.25 * h.k;
      arms.push({ path: [sh, [ex, ey], [hd[0], hd[1]]], hand: [hd[0], hd[1], -s * 0.35, hd[3], hd[2]] });
    }
  } else {
    // Locked straight out from both shoulders, heels of the hands together,
    // palms open toward them with the fingers splayed (the real thing).
    var ux = h.hx - b.x, uy = h.hy - b.y, ul = Math.sqrt(ux * ux + uy * uy) || 1;
    ux /= ul; uy /= ul;
    var px = -uy, py = ux, shL = [b.x - r * 0.75, b.y - r * 0.12], shR = [b.x + r * 0.75, b.y - r * 0.12];
    var hA = [h.hx + px * size * 0.55, h.hy + py * size * 0.55], hB = [h.hx - px * size * 0.55, h.hy - py * size * 0.55];
    // Each shoulder to the hand on its own side.
    var aFirst = (hA[0] - b.x) * 1 < (hB[0] - b.x);
    arms.push({ path: [aFirst ? shL : shR, hA], hand: [hA[0], hA[1], px * 0.55 + ux * 0.85, py * 0.55 + uy * 0.85, 0] });
    arms.push({ path: [aFirst ? shR : shL, hB], hand: [hB[0], hB[1], -px * 0.55 + ux * 0.85, -py * 0.55 + uy * 0.85, 0] });
    // Reaching up over his head, both arms go behind it; reaching across to
    // one side, the far arm goes behind his body instead of over his chest.
    var up = kmArmsBehind(b, h);
    arms.forEach(function (a) {
      var shSide = a.path[0][0] - b.x, hdSide = a.hand[0] - b.x;
      a.back = up || (Math.abs(ux) > 0.35 && shSide * hdSide < 0);
    });
  }
  var hs = size * 1.25; // open hands, bigger than a fist
  arms.forEach(function (a) {
    if (which !== "all" && (which === "back") !== !!a.back) return;
    strokeLimb(size * 0.75, armColor(b.char), function () {
      ctx.moveTo(a.path[0][0], a.path[0][1]);
      for (var q = 1; q < a.path.length; q++) ctx.lineTo(a.path[q][0], a.path[q][1]);
    });
  });
  if (which !== "back") arms.forEach(function (a) { kmOpenHand(b, a.hand[0], a.hand[1], a.hand[2], a.hand[3], h.cup ? size : hs, a.hand[4]); });
}

// His hands and the ball of energy (with the fighter, from draw.js).
function drawKameHands(b) {
  if (!kameOn(b) || !b.alive) return;
  var t = performance.now() / 1000, h = kmHandPose(b), hx = h.hx, hy = h.hy, ball = h.ball;
  if (h.cup) kmDrawArms(b, h); // thrust out, they're drawn over the beam (drawKamehameha)
  var m = b.igbb;
  if (m.phase === "charge" && ball > 1) {
    ball *= 1 + 0.35 * (m.pulse || 0);
    var ck = m.t / b.char.kamehameha.charge;
    ctx.save();
    // Light rays spinning off the ball.
    ctx.globalAlpha = 0.25 + 0.35 * ck;
    ctx.fillStyle = "rgba(170,225,255,0.8)";
    for (var ri = 0; ri < 8; ri++) {
      var ra = t * 2.2 + ri * Math.PI / 4, rl = ball * (3.5 + 2.5 * ck) * (0.8 + 0.2 * Math.sin(t * 9 + ri));
      ctx.beginPath(); ctx.moveTo(hx, hy);
      ctx.lineTo(hx + Math.cos(ra - 0.07) * rl, hy + Math.sin(ra - 0.07) * rl);
      ctx.lineTo(hx + Math.cos(ra + 0.07) * rl, hy + Math.sin(ra + 0.07) * rl);
      ctx.closePath(); ctx.fill();
    }
    // Energy streaking in from all round and being drawn into his hands.
    ctx.globalAlpha = 1;
    ctx.lineCap = "round";
    for (var si = 0; si < 14; si++) {
      var ph = (t * 1.3 + si * 0.071 + (si % 3) * 0.33) % 1;
      var sa = si * 2.39 + t * 0.6, sr = b.r * (2.6 - 2.2 * ph);
      var sx = hx + Math.cos(sa + ph * 1.2) * sr, sy = hy + Math.sin(sa + ph * 1.2) * sr;
      var tx = hx + Math.cos(sa + ph * 1.2 - 0.25) * sr * 0.75, ty = hy + Math.sin(sa + ph * 1.2 - 0.25) * sr * 0.75;
      ctx.strokeStyle = "rgba(190,235,255," + (0.85 * Math.sin(ph * Math.PI)) + ")"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(tx, ty); ctx.stroke();
    }
    ctx.restore();
  }
  // The ball of energy between his hands, glowing and crackling.
  if (ball > 1) {
    var fl = 1 + 0.12 * Math.sin(t * 40);
    ctx.save();
    var g = ctx.createRadialGradient(hx, hy, 0, hx, hy, ball * 2.2 * fl);
    g.addColorStop(0, "rgba(255,255,255,1)"); g.addColorStop(0.3, "rgba(150,215,255,0.95)");
    g.addColorStop(0.6, "rgba(60,150,255,0.5)"); g.addColorStop(1, "rgba(40,120,255,0)");
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(hx, hy, ball * 2.2 * fl, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "rgba(220,245,255,0.9)"; ctx.lineWidth = 1.5;
    for (var i = 0; i < 3; i++) {
      var a = t * 13 + i * 2.1, a2 = a + 0.9;
      ctx.beginPath();
      ctx.moveTo(hx + Math.cos(a) * ball * 0.5, hy + Math.sin(a) * ball * 0.5);
      ctx.lineTo(hx + Math.cos(a + 0.4) * ball * 1.4, hy + Math.sin(a + 0.4) * ball * 1.4);
      ctx.lineTo(hx + Math.cos(a2) * ball * 1.9, hy + Math.sin(a2) * ball * 1.9);
      ctx.stroke();
    }
    ctx.restore();
  }
}

// The aim line and the beam itself, over both fighters (from draw.js).
function drawKamehameha() {
  balls.forEach(function (b) {
    if (!kameOn(b) || !b.alive) return;
    var m = b.igbb, cfg = b.char.kamehameha, t = performance.now() / 1000;
    var ang = Math.atan2(m.dy, m.dx), r = b.r;
    ctx.save();
    ctx.beginPath(); ctx.rect(0, 0, W, H); ctx.clip();
    ctx.translate(b.x, b.y); ctx.rotate(ang);
    if (m.phase === "power" || m.phase === "charge") {
      // The path the beam will take: it follows them while he aims, then
      // locks and flashes for the last second.
      var len0 = kmRayToWall(b.x, b.y, m.dx, m.dy), wdt = cfg.width;
      var locked = m.phase === "charge" && m.t >= cfg.charge - KM_LOCK;
      var show = m.phase === "power" ? Math.min(1, m.t / 0.3) : 1;
      var pulse = locked ? 0.6 + 0.4 * Math.sin(t * 30) : 0.75 + 0.25 * Math.sin(t * 10);
      if (m.snap) pulse = 1 + 1.5 * m.snap / 0.25; // snapping onto them after a teleport
      ctx.globalAlpha = show;
      ctx.fillStyle = "rgba(70,160,255," + ((locked ? 0.3 : 0.16) * pulse) + ")";
      ctx.fillRect(r, -wdt / 2, len0 - r, wdt);
      ctx.strokeStyle = "rgba(90,180,255," + (0.85 * pulse) + ")"; ctx.lineWidth = locked ? 4 : 3; ctx.setLineDash([14, 10]);
      ctx.beginPath(); ctx.moveTo(r, -wdt / 2); ctx.lineTo(len0, -wdt / 2); ctx.moveTo(r, wdt / 2); ctx.lineTo(len0, wdt / 2); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = "rgba(120,200,255," + (0.8 * pulse) + ")";
      var o = (t * (locked ? 420 : 220)) % 46;
      for (var xx = r + o; xx < len0 - 10; xx += 46) {
        ctx.beginPath(); ctx.moveTo(xx, -wdt * 0.28); ctx.lineTo(xx + 14, 0); ctx.lineTo(xx, wdt * 0.28); ctx.lineTo(xx + 6, 0); ctx.closePath(); ctx.fill();
      }
      ctx.globalAlpha = 1;
    } else if (m.phase === "fire" || (m.phase === "end" && m.t < 0.25)) {
      var fade = m.phase === "end" ? 1 - m.t / 0.25 : Math.min(1, m.t / 0.06);
      var len = m.phase === "fire" ? m.ext : m.len, x0 = r * 1.45; // starts at his hands, clear of his body
      var w = cfg.width * fade * (1 + 0.08 * Math.sin(t * 50));
      [[2.0, "rgba(40,120,255,0.28)"], [1.35, "rgba(80,170,255,0.6)"], [0.9, "rgba(150,215,255,0.95)"], [0.42, "rgba(255,255,255,1)"]].forEach(function (L) {
        var hw = w * L[0] / 2;
        ctx.fillStyle = L[1];
        ctx.beginPath();
        ctx.moveTo(x0, -hw * 0.6);
        for (var x = x0; x <= len; x += 12) ctx.lineTo(x, -hw * (0.85 + 0.15 * Math.sin(x * 0.08 - t * 60)));
        ctx.lineTo(len, -hw); ctx.arc(len, 0, hw, -Math.PI / 2, Math.PI / 2);
        for (var x2 = len; x2 >= x0; x2 -= 12) ctx.lineTo(x2, hw * (0.85 + 0.15 * Math.sin(x2 * 0.08 + t * 60)));
        ctx.closePath(); ctx.fill();
        // A bigger ball where it leaves his hands.
        ctx.beginPath(); ctx.arc(x0, 0, hw * 0.75, 0, Math.PI * 2); ctx.fill();
      });
      // Rings of energy spiralling along it, and the big head while it's still flying.
      ctx.strokeStyle = "rgba(220,245,255," + (0.6 * fade) + ")"; ctx.lineWidth = 2.5;
      for (var rx = x0 + ((t * 700) % 60); rx < len - 10; rx += 60) {
        ctx.beginPath(); ctx.ellipse(rx, 0, w * 0.18, w * 0.62, 0, 0, Math.PI * 2); ctx.stroke();
      }
      if (m.phase === "fire" && m.ext < m.len - 1) {
        var hg = ctx.createRadialGradient(len, 0, 0, len, 0, w * 1.3);
        hg.addColorStop(0, "rgba(255,255,255,1)"); hg.addColorStop(0.45, "rgba(150,215,255,0.9)"); hg.addColorStop(1, "rgba(60,150,255,0)");
        ctx.fillStyle = hg; ctx.beginPath(); ctx.arc(len, 0, w * 1.3, 0, Math.PI * 2); ctx.fill();
      }
      // Splash against the cage.
      if (m.phase === "fire" && m.ext >= m.len - 1) {
        ctx.fillStyle = "rgba(200,235,255," + (0.6 + 0.3 * Math.sin(t * 45)) + ")";
        for (var i = 0; i < 6; i++) {
          var a = (i / 6) * Math.PI + Math.PI / 2 + Math.sin(t * 20 + i) * 0.2;
          ctx.beginPath(); ctx.arc(len + Math.cos(a) * w * 0.6, Math.sin(a) * w * 0.9, w * 0.22, 0, Math.PI * 2); ctx.fill();
        }
      }
    }
    ctx.restore();
    // Arms locked out in front: over the beam, pushing it out of his palms.
    if (m.phase === "fire" || m.phase === "end") {
      kmDrawArms(b, kmHandPose(b), "front");
    }
    drawKameCaption(b);
  });
}

// The call, built up word by word in one big caption on the far side of
// the ring from him: POWER UP!, then KA... ME... HA... ME... and HA!!!
function drawKameCaption(b) {
  var m = b.igbb, words, last;
  if (m.phase === "power") { words = ["POWER UP!"]; last = true; }
  else if (m.phase === "charge") { words = KM_CALLS.slice(0, m.calls); last = false; }
  else if (m.phase === "fire" || (m.phase === "end" && m.t < 0.3)) { words = KM_CALLS.concat(["HA!!!"]); last = true; }
  else return;
  if (!words.length) return;
  var y = b.y < H / 2 ? H * 0.86 : H * 0.14;
  var pop = Math.max(0, 1 - (m.callT || 0) / 0.18); // the newest word pops in
  var fade = m.phase === "end" ? 1 - m.t / 0.3 : 1;
  ctx.save();
  ctx.globalAlpha = fade;
  ctx.textBaseline = "middle"; ctx.lineJoin = "round";
  var fs = 30, big = last ? 44 : fs;
  var font = function (n) { return "900 " + n + 'px "Barlow Condensed", "Arial Narrow", sans-serif'; };
  // Measure the line so it sits centred.
  var widths = words.map(function (w, i) { ctx.font = font(i === words.length - 1 ? big : fs); return ctx.measureText(w + " ").width; });
  var total = widths.reduce(function (a, c) { return a + c; }, 0);
  var x = W / 2 - total / 2;
  words.forEach(function (w, i) {
    var newest = i === words.length - 1, n = newest ? big * (1 + 0.35 * pop) : fs;
    ctx.font = font(n);
    ctx.textAlign = "left";
    ctx.lineWidth = 6; ctx.strokeStyle = "rgba(10,30,70,0.85)"; ctx.strokeText(w, x, y);
    ctx.fillStyle = w === "POWER UP!" ? "#ffd21f" : newest && last ? "#ffffff" : "#8fd3ff";
    ctx.shadowColor = w === "POWER UP!" ? "rgba(255,190,0,0.9)" : "rgba(80,170,255,0.9)"; ctx.shadowBlur = 12;
    ctx.fillText(w, x, y);
    ctx.shadowBlur = 0;
    x += widths[i];
  });
  ctx.restore();
}

// Every frame (from tickDoBronxFx): if something else cut the move off
// (a bear, a grab...), the aura still dies down and his hair goes back.
function tickKamehameha() {
  if (!balls) return;
  balls.forEach(function (b) {
    if (b.kameBlond && !kameOn(b)) { b.kameBlond = false; doBronxHair(b, false); }
  });
}
