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
// Runs on b.igbb (move "kamehameha"). Config: char.kamehameha.
"use strict";

var KM_LOCK = 1.0;   // he tracks them until a second before it fires (Joe)
var KM_POWER = 0.9;  // the aura bursting on before he starts charging
var KM_END = 0.4;    // hands coming back down after the beam
var KM_SPEED = 2600; // how fast the beam shoots out
var KM_CALLS = ["KA...", "ME...", "HA...", "ME..."];

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
    // The aura bursts on: blond hair, the gold flames and Joe's burst (dobronx.js).
    doBronxHair(self, true); self.kameBlond = true;
    kmPushAway(self, other); // the energy coming up shoves them back, so the beam has room to fly
    floater(self.x, self.y - self.r - 30, "POWER UP!", "crit");
    if (!reduceMotion) shake = Math.max(shake, 10);
  }
  var m = self.igbb;
  if (m.move !== "kamehameha") return false;
  m.t += dt;
  self.vx = 0; self.vy = 0;
  if (over) { endKamehameha(self); return false; }

  if (m.phase === "power") {
    if (other.alive) kmAim(self, other);
    if (m.t >= KM_POWER) { m.phase = "charge"; m.t = 0; playKameCharge(cfg.charge); }
    return true;
  }
  if (m.phase === "charge") {
    if (m.t < cfg.charge - KM_LOCK && other.alive) kmAim(self, other);
    var call = Math.floor(m.t / (cfg.charge / (KM_CALLS.length + 0.4)));
    if (call >= m.calls && m.calls < KM_CALLS.length) {
      floater(self.x, self.y - self.r - 30 - m.calls * 4, KM_CALLS[m.calls], "note");
      m.calls++;
    }
    if (m.t >= cfg.charge) {
      m.phase = "fire"; m.t = 0;
      m.len = kmRayToWall(self.x, self.y, m.dx, m.dy);
      floater(self.x, self.y - self.r - 34, "HA!!!", "crit");
      self.squash = { t: 0.2, max: 0.2, nx: -m.dx, ny: -m.dy };
      if (!reduceMotion) shake = Math.max(shake, 14);
      crowdReact(0.9);
      playKameBlast(cfg.beamTime);
    }
    return true;
  }
  if (m.phase === "fire") {
    m.ext = Math.min(m.len, m.t * KM_SPEED);
    if (!m.hit && other.alive) {
      // Is any of them inside the beam so far?
      var ox = other.x - self.x, oy = other.y - self.y;
      var along = ox * m.dx + oy * m.dy, across = Math.abs(-m.dy * ox + m.dx * oy);
      if (along > 0 && along < m.ext + other.r && across < cfg.width / 2 + other.r * 0.85) {
        m.hit = true;
        var dealt = hurt(other, cfg.damage, "igbb", self.id);
        if (dealt > 0) {
          floater(other.x, other.y - other.r - 30, "KAMEHAMEHA!", "crit");
          if (!reduceMotion) { shake = Math.max(shake, 22); hitStop = Math.max(hitStop, 0.08); }
          impacts.push({ x: other.x, y: other.y, nx: m.dx, ny: m.dy, life: 0.5, max: 0.5, color: "#7cc8ff" });
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

function kmPushAway(self, other) {
  if (!other.alive) return;
  var dx = other.x - self.x, dy = other.y - self.y, d = Math.sqrt(dx * dx + dy * dy) || 1;
  clearActions(other);
  other.vx = dx / d * 650; other.vy = dy / d * 650;
  other.knockFly = 0.3;
  impacts.push({ x: self.x, y: self.y, nx: dx / d, ny: dy / d, life: 0.45, max: 0.45, color: "#7cc8ff" });
  if (!reduceMotion) shake = Math.max(shake, 8);
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

// His hands and the ball of energy (with the fighter, from draw.js).
function drawKameHands(b) {
  if (!kameOn(b) || !b.alive) return;
  var m = b.igbb, r = b.r, t = performance.now() / 1000;
  var dx = m.dx || 1, dy = m.dy || 0, px = -dy, py = dx;
  var size = b.char.punch.size || 15, cfg = b.char.kamehameha;
  var hx, hy, ball;
  if (m.phase === "charge") {
    // Cupped at his side, pulled back away from them.
    var k = Math.min(1, m.t / 0.3); k = k * k * (3 - 2 * k);
    hx = b.x - dx * r * (0.2 + 0.75 * k) + px * r * (0.95 * k);
    hy = b.y - dy * r * (0.2 + 0.75 * k) + py * r * (0.95 * k);
    ball = size * (0.5 + 1.3 * Math.min(1, m.t / cfg.charge));
  } else {
    var k2 = m.phase === "fire" ? Math.min(1, m.t / 0.08) : 1 - Math.min(1, m.t / KM_END);
    hx = b.x + dx * r * (0.3 + 0.85 * k2); hy = b.y + dy * r * (0.3 + 0.85 * k2);
    ball = m.phase === "fire" ? size * 1.9 : size * 1.2 * (1 - m.t / KM_END);
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
  // Both arms to the hands, wrists together.
  [-1, 1].forEach(function (s) {
    var shx = b.x + px * s * r * 0.7, shy = b.y + py * s * r * 0.7;
    var gx = hx + px * s * size * 0.55, gy = hy + py * s * size * 0.55;
    strokeLimb(size * 0.75, armColor(b.char), function () { ctx.moveTo(shx, shy); ctx.lineTo(gx, gy); });
    ctx.fillStyle = gloveColor(b.char); ctx.strokeStyle = theme.wall; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(gx, gy, size * 0.85, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  });
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
      var len = m.phase === "fire" ? m.ext : m.len, x0 = r * 1.1;
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
        ctx.beginPath(); ctx.arc(x0, 0, hw * 1.25, 0, Math.PI * 2); ctx.fill();
      });
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
  });
}

// Every frame (from tickDoBronxFx): if something else cut the move off
// (a bear, a grab...), the aura still dies down and his hair goes back.
function tickKamehameha() {
  if (!balls) return;
  balls.forEach(function (b) {
    if (b.kameBlond && !kameOn(b)) { b.kameBlond = false; doBronxHair(b, false); }
  });
}
