// Chuck Liddell's snowball (Joe, 2026-11-18). At the end of his Snow Day
// wind-up (liddell.js), once the snowball he packed has flared blue, he
// doesn't burst it into his gloves any more: he takes it in his right glove,
// draws it back low out to his right side and slings it at them. It flies a little
// ahead of where they're heading (a gentle curve after them), and when it
// lands it bursts into snow for a small hit (special.snowball.damage, source
// "throw", so it can be slipped or blocked like any thrown thing). Then the
// all-out attack starts as usual, chasing in behind it.
//
// Only his own two arms and gloves: the right one throws, the left stays in
// front of his stomach. Opt-in: a fighter whose special has no `snowball`
// block keeps the old wind-up (the snowball flares into the gloves).
// Tuned in characters/chuck-liddell.json, special.snowball:
//   damage   the hit when it lands
//   speed    how fast it flies (px a second)
//   windup   seconds drawing it back behind his shoulder
//   follow   seconds of follow-through after it leaves his glove
//   turn     how hard it curves after them (radians a second)
"use strict";

var icSnowballs = [];          // snowballs in the air: { x, y, vx, vy, t, r, owner, target, dmg, spin }

function icSnowballCfg(b) { var sp = b && b.char && b.char.special; return sp && sp.snowball; }
function resetSnowballs() { icSnowballs = []; }

// From updateSnowDay (liddell.js) once the flare is done. True while he's
// still throwing; false once he's done (the all-out attack starts).
function snowballThrowPhase(self, other, m, dt) {
  var cfg = icSnowballCfg(self);
  if (!m.thrown && m.t >= cfg.windup) {
    m.thrown = true;
    var h = snowThrowHand(self, other, m, cfg.windup);
    var lead = 0.18, tx = other.x + (other.vx || 0) * lead, ty = other.y + (other.vy || 0) * lead;
    var dx = tx - h.x, dy = ty - h.y, d = Math.sqrt(dx * dx + dy * dy) || 1;
    icSnowballs.push({ x: h.x, y: h.y, vx: dx / d * cfg.speed, vy: dy / d * cfg.speed, t: 0, r: self.r * 0.3,
      owner: self.id, target: other.id, dmg: cfg.damage, turn: cfg.turn || 0, spin: 0 });
    playWhoosh();
    for (var i = 0; i < 6 && !reduceMotion; i++) {
      particles.push({ x: h.x, y: h.y, vx: (Math.random() - 0.5) * 120 - dx / d * 60, vy: (Math.random() - 0.5) * 120 - dy / d * 60, life: 0.25, max: 0.25, size: 2 + Math.random() * 2, color: "#d9f2ff" });
    }
  }
  return m.t < cfg.windup + cfg.follow;
}

// Where his right glove is during the throw: from the hold in front of his
// stomach, drawn back out to his right side (kept low), then whipped out toward them.
function snowThrowHand(b, other, m, t) {
  var cfg = icSnowballCfg(b), r = b.r;
  var ang = m.throwAng != null ? m.throwAng : (m.throwAng = Math.atan2(other.y - b.y, other.x - b.x));
  var ux = Math.cos(ang), uy = Math.sin(ang);
  var sh = { x: b.x + r * 0.62, y: b.y - r * 0.05 };
  var hold = { x: b.x + r * 0.3, y: b.y + r * 0.3 };
  var back = { x: b.x + r * 1.05 - ux * r * 0.3, y: b.y + r * 0.2 - uy * r * 0.3 }; // out to his right side, low (never up by his head)
  var out = { x: b.x + ux * r * 1.55 + r * 0.2, y: b.y + uy * r * 1.55 };
  if (t < cfg.windup) {
    var k = easeOut(t / cfg.windup);
    return { x: hold.x + (back.x - hold.x) * k, y: hold.y + (back.y - hold.y) * k, sh: sh };
  }
  var k2 = Math.min(1, (t - cfg.windup) / Math.max(0.01, cfg.follow * 0.45));
  k2 = k2 * k2 * (3 - 2 * k2);
  var k3 = Math.max(0, (t - cfg.windup - cfg.follow * 0.45) / (cfg.follow * 0.55)); // and back toward the guard
  var x = back.x + (out.x - back.x) * k2, y = back.y + (out.y - back.y) * k2;
  if (k3 > 0) { var kk = Math.min(1, k3) * 0.5; x += (hold.x - x) * kk; y += (hold.y - y) * kk; }
  return { x: x, y: y, sh: sh };
}

// From tickLiddell (liddell.js): the snowballs flying.
function tickSnowballs(dt) {
  for (var i = icSnowballs.length - 1; i >= 0; i--) {
    var s = icSnowballs[i], tg = balls[s.target];
    s.t += dt; s.spin += dt * 9;
    if (tg && tg.alive && s.turn) { // a gentle curve after them
      var want = Math.atan2(tg.y - s.y, tg.x - s.x), cur = Math.atan2(s.vy, s.vx), sp = Math.sqrt(s.vx * s.vx + s.vy * s.vy);
      var dA = Math.atan2(Math.sin(want - cur), Math.cos(want - cur)), step = Math.max(-s.turn * dt, Math.min(s.turn * dt, dA));
      cur += step; s.vx = Math.cos(cur) * sp; s.vy = Math.sin(cur) * sp;
    }
    s.x += s.vx * dt; s.y += s.vy * dt;
    var gone = false;
    if (tg && tg.alive && !s.missed) {
      var dx = tg.x - s.x, dy = tg.y - s.y;
      if (dx * dx + dy * dy < (tg.r + s.r) * (tg.r + s.r)) {
        var dealt = over ? 0 : hurt(tg, s.dmg, "throw", s.owner);
        if (tg.justDodged) s.missed = true; // slipped: it flies on past
        else {
          snowballSplat(s.x, s.y, s.vx, s.vy, dealt > 0 ? 18 : 10);
          if (dealt > 0) {
            floater(tg.x, tg.y - tg.r - 26, "SNOWBALL!", "crit");
            var sp2 = Math.sqrt(s.vx * s.vx + s.vy * s.vy) || 1;
            tg.vx += s.vx / sp2 * 160; tg.vy += s.vy / sp2 * 160;
            crowdReact(0.5);
          }
          gone = true;
        }
      }
    }
    if (!gone && (s.x < s.r || s.x > W - s.r || s.y < s.r || s.y > H - s.r)) { // into the cage
      snowballSplat(Math.max(0, Math.min(W, s.x)), Math.max(0, Math.min(H, s.y)), s.vx, s.vy, 12);
      gone = true;
    }
    if (gone || s.t > 2) icSnowballs.splice(i, 1);
  }
}

function snowballSplat(x, y, vx, vy, n) {
  playSnowCrunch(1.3);
  if (reduceMotion) return;
  var back = Math.atan2(-vy, -vx);
  for (var i = 0; i < n; i++) {
    var a = back + (Math.random() - 0.5) * 2.8, v = 80 + Math.random() * 220;
    particles.push({ x: x, y: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 0.35 + Math.random() * 0.35, max: 0.7, size: 2.5 + Math.random() * 3, color: i % 3 ? "#ffffff" : "#bfe9ff" });
  }
  shake = Math.max(shake, 3);
}

// The snowball itself (white with a blue glow from the flare, spinning).
function drawSnowballAt(x, y, r, spin) {
  drawGloveFlare(ctx, x, y, r, 0.6);
  ctx.fillStyle = mixHex("#ffffff", "#6cc6ff", 0.5); ctx.strokeStyle = "#4f7fa8"; ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = "rgba(255,255,255,0.95)";
  ctx.beginPath(); ctx.arc(x - r * 0.35, y - r * 0.35, r * 0.28, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "rgba(95,141,181,0.4)"; // a clump of packed snow, turning as it flies
  ctx.beginPath(); ctx.arc(x + Math.cos(spin) * r * 0.45, y + Math.sin(spin) * r * 0.45, r * 0.24, 0, Math.PI * 2); ctx.fill();
}

// From drawSnowDay (liddell.js) in the throw: his own two arms. The left glove
// stays in front of his stomach; the right takes the snowball back and throws it.
function drawSnowThrow(b, m) {
  var other = balls[1 - b.id] || b, cfg = icSnowballCfg(b), r = b.r;
  var size = (b.char.punch && b.char.punch.size) || 15, gs = size * 0.72;
  var shL = { x: b.x - r * 0.62, y: b.y - r * 0.05 };
  var h = snowThrowHand(b, other, m, m.t);
  var L = { x: b.x - r * 0.5, y: b.y + r * 0.24 };
  var fade = Math.max(0, 1 - m.t / (cfg.windup + cfg.follow));
  strokeLimb(size * 0.7, armColor(b.char), function () { ctx.moveTo(shL.x, shL.y); ctx.lineTo(L.x, L.y); });
  strokeLimb(size * 0.7, armColor(b.char), function () { ctx.moveTo(h.sh.x, h.sh.y); ctx.lineTo(h.x, h.y); });
  drawGloveAt(L.x, L.y, gs, b.char, -0.4);
  drawGloveAt(h.x, h.y, gs, b.char, Math.atan2(h.y - h.sh.y, h.x - h.sh.x));
  if (!m.thrown) { // in his glove, held out on the far side of it
    var ax = h.x - h.sh.x, ay = h.y - h.sh.y, al = Math.sqrt(ax * ax + ay * ay) || 1;
    drawSnowballAt(h.x + ax / al * gs * 0.55, h.y + ay / al * gs * 0.55, r * 0.3, m.t * 4);
  }
  if (fade > 0) { drawGloveFlare(ctx, L.x, L.y, gs, fade); drawGloveFlare(ctx, h.x, h.y, gs, fade); }
}

// From draw(), over the fighters: the snowballs in the air.
function drawSnowballsOver() {
  icSnowballs.forEach(function (s) {
    if (!reduceMotion) { // a short trail of snow dust behind it
      ctx.save();
      for (var j = 1; j <= 3; j++) {
        ctx.globalAlpha = 0.25 / j; ctx.fillStyle = "#e8f6ff";
        ctx.beginPath(); ctx.arc(s.x - s.vx * 0.018 * j, s.y - s.vy * 0.018 * j, s.r * (1 - j * 0.18), 0, Math.PI * 2); ctx.fill();
      }
      ctx.restore();
    }
    drawSnowballAt(s.x, s.y, s.r, s.spin);
  });
}
