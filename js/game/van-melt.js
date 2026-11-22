// Joshua Van's fire hands melt ice (Joe, 2026-11-22). The first one: Chuck
// Liddell's ice punches.
//
// Catch       while Van's Hands on Fire burn (van.js), an ice overhand from
//             Chuck Liddell's all-out attack (b.iceRage, liddell.js) that
//             would land on him is caught in his burning glove instead
//             (`chance` of them, special.meltIce in characters/joshua-van.json).
//             No damage. His own glove on the side of the punch snaps out of
//             the high guard onto Chuck's fist ("CAUGHT!"), and the two of
//             them hold there.
// Melt        for `melt` seconds the ice on Chuck's fist steams and shrinks in
//             his flaming glove, sizzling, water running off it and dripping
//             onto the mat ("MELTED!"). Then he lets go of the fist, Chuck's
//             glove back to its own colour for the rest of that swing.
// Douse       the water off the melted ice runs over Van's gloves and puts his
//             fire out ("FIRE'S OUT!"): the flames sputter and die over
//             `douse` seconds into smoke, the special is over (its bar goes
//             back to empty) and any chain he was keeping on fire goes out
//             with it. A puddle is left on the mat for `puddle` seconds.
// Only Van's own two arms: the catching glove is his guard glove on that side,
// on its own arm from his shoulder (vnGuardPts in van.js asks vanMeltGuard).
// More ice moves (the snowball, frost) can catch the same way later: add them
// to vanCatchIce's callers.
// State: b.vnMelt on Van (the catch), vmFx (steam, drips, the puddle).
"use strict";

var vmFx = { steam: [], drips: [], puddles: [] };
var VM_SNAP = 0.18; // how long the glove takes to come out onto the fist

function vmCfg(b) {
  var sp = b && b.char && b.char.hasSpecial && b.char.special;
  return sp && sp.move === "vanfire" && sp.meltIce ? sp.meltIce : null;
}
function vmChuckOf(m) { return m && balls[m.chuck]; }
// True while Van and Chuck are held in the catch (abilities.js skips them,
// physics.js leaves their movement alone).
function vanMeltHolding(b) {
  if (!b || typeof balls === "undefined") return false;
  for (var i = 0; i < balls.length; i++) {
    var m = balls[i] && balls[i].vnMelt;
    if (m && m.phase !== "douse" && (balls[i] === b || m.chuck === b.id)) return true;
  }
  return false;
}
// Chuck's overhand fist melted (liddell.js: no blue flare, his own glove
// colour, no all-out-attack power or ice chips): while it's held, and for the
// rest of that all-out attack once it's melted (Joe, 2026-11-22). His next
// Snow Day starts a new b.iceRage, so the ice comes back then.
function vanMeltedFist(b) {
  if (!b || typeof balls === "undefined") return false;
  if (b.iceRage && b.iceRage.melted) return true;
  var o = balls[1 - b.id], m = o && o.vnMelt;
  return !!(m && m.chuck === b.id && m.phase !== "douse");
}

// From updateSwing (cte.js), as a hook is about to land on `van` from
// `chuck` at fist point f. True when Van catches it (no damage).
function vanCatchIce(van, chuck, st, f) {
  var mc = vmCfg(van);
  if (!mc || !chuck.iceRage || chuck.iceRage.melted || van.vnMelt || !vnBurning(van) || !van.vn || over || !van.alive || !chuck.alive) return false;
  if (vnInterrupted(van) || van.punch && van.punch.hook) return false;
  if (Math.random() >= mc.chance) return false;
  st.hit = true;
  // Pin the fist where it's caught: the extended swing ends at this angle.
  var fa = Math.atan2(f.y - chuck.y, f.x - chuck.x);
  st.ang = fa - st.side * HOOK_FOLLOW;
  st.phase = "extend"; st.t = 0; st.k = 1;
  if (van.vn.combo) vnEndCombo(van, vnCfg(van), true);
  clearActions(van);
  van.vx = van.vy = 0; chuck.vx = chuck.vy = 0;
  // The glove on the side the punch comes from.
  var g = vnGuardPts(van, chuck), side = (Math.pow(g[0].x - f.x, 2) + Math.pow(g[0].y - f.y, 2)) < (Math.pow(g[1].x - f.x, 2) + Math.pow(g[1].y - f.y, 2)) ? g[0].s : g[1].s;
  van.vnMelt = { phase: "catch", t: 0, chuck: chuck.id, side: side, cfg: mc, ice: 1, drip: 0, hiss: 0 };
  floater(f.x, f.y - 40, "CAUGHT!", "crit");
  hitStop = Math.max(hitStop, 0.06);
  if (!reduceMotion) shake = Math.max(shake, 7);
  crowdReact(0.8);
  playVmCatch();
  return true;
}

// Chuck's caught fist, and where Van's glove holds it.
function vmFist(m) {
  var c = vmChuckOf(m);
  if (!c || !c.swing) return null;
  var p = hookFist(c, c.swing, 1);
  return { x: p.x, y: p.y, a: p.a };
}

// From vnGuardPts (van.js): the guard glove on the catching side out on
// Chuck's fist instead.
function vanMeltGuard(b, pts) {
  var m = b && b.vnMelt;
  if (!m || m.phase === "douse") return pts;
  var F = vmFist(m);
  if (!F) return pts;
  var dx = b.x - F.x, dy = b.y - F.y, d = Math.sqrt(dx * dx + dy * dy) || 1;
  var k = m.phase === "catch" ? Math.min(1, m.t / VM_SNAP) : 1, e = k * k * (3 - 2 * k);
  return pts.map(function (p) {
    if (p.s !== m.side) return p;
    var gx = F.x + dx / d * SWING_FIST_R * 0.55, gy = F.y + dy / d * SWING_FIST_R * 0.55;
    return { x: p.x + (gx - p.x) * e, y: p.y + (gy - p.y) * e, r: p.r, s: p.s, sx: p.sx, sy: p.sy, ang: Math.atan2(-dy, -dx) * e + p.ang * (1 - e), melt: true };
  });
}

// From update(): the catch running, and the steam, drips and puddle.
function tickVanMelt(dt) {
  balls.forEach(function (b) {
    var m = b.vnMelt;
    if (!m) return;
    var c = vmChuckOf(m), F = vmFist(m);
    m.t += dt;
    if (!b.alive || over || !c || !c.alive || (m.phase !== "douse" && (!F || vnInterrupted(b)))) { vmRelease(b, m, false); return; }
    if (m.phase !== "douse") {
      b.vx = b.vy = 0; c.vx = c.vy = 0;
      if (c.swing) { c.swing.phase = "extend"; c.swing.t = 0; }
    }
    if (m.phase === "catch" && m.t >= VM_SNAP) { m.phase = "melt"; m.t = 0; playVmSizzle(m.cfg.melt); }
    if (m.phase === "melt") {
      m.ice = Math.max(0, 1 - m.t / m.cfg.melt);
      vmSteamAt(F.x, F.y, dt, 1);
      m.drip -= dt;
      if (m.drip <= 0) { m.drip = 0.06; vmFx.drips.push({ x: F.x + (nativeRandom() - 0.5) * 18, y: F.y + 8, vx: (nativeRandom() - 0.5) * 30, vy: 60 + nativeRandom() * 60, life: 0.5, max: 0.5, land: F.y + 30 + nativeRandom() * 25 }); }
      if (m.t >= m.cfg.melt) {
        floater(F.x, F.y - 44, "MELTED!", "crit");
        crowdReact(0.6);
        vmPuddle((F.x + b.x) / 2, (F.y + b.y) / 2 + b.r * 0.6, 1);
        if (c.iceRage) c.iceRage.melted = true; // that hand stays melted for the rest of his all-out attack
        vmRelease(b, m, true);
      }
    } else if (m.phase === "douse") {
      var gl = vnGloves(b, c, vnGuardStance(b));
      gl.forEach(function (g) { if (nativeRandom() < dt * 14) vmFx.steam.push(vmPuff(g.x, g.y - g.r * 0.4, 0.6, true)); });
      if (!m.called && m.t >= 0.3) { m.called = true; floater(b.x, b.y - b.r - 44, "FIRE'S OUT!", "note"); }
      if (m.t >= m.cfg.douse) b.vnMelt = null;
    }
  });
  // Chuck's melted fist still dripping while his all-out attack goes on.
  balls.forEach(function (c) {
    if (!c.alive || !c.iceRage || !c.iceRage.melted || !c.swing || reduceMotion) return;
    if (nativeRandom() > dt * 7) return;
    var F = icSwingFist(c);
    if (F) vmFx.drips.push({ x: F.x + (nativeRandom() - 0.5) * 12, y: F.y + 6, vx: (nativeRandom() - 0.5) * 30, vy: 40 + nativeRandom() * 50, life: 0.5, max: 0.5, land: F.y + 26 + nativeRandom() * 20 });
  });
  vmFx.steam = vmFx.steam.filter(function (s) { s.life -= dt; s.x += s.vx * dt; s.y += s.vy * dt; s.vx *= 0.97; s.r += s.grow * dt; return s.life > 0; });
  vmFx.drips = vmFx.drips.filter(function (d) {
    d.life -= dt; d.vy += 420 * dt; d.x += d.vx * dt; d.y += d.vy * dt;
    if (d.y >= d.land) { vmPuddle(d.x, d.land, 0.08); return false; }
    return d.life > 0;
  });
  vmFx.puddles = vmFx.puddles.filter(function (p) { p.t += dt; return p.t < p.max; });
}

function vmPuff(x, y, k, smoke) {
  return { x: x + (nativeRandom() - 0.5) * 14, y: y, vx: (nativeRandom() - 0.5) * 40, vy: -50 - nativeRandom() * 60, r: 5 + nativeRandom() * 5, grow: 18 + nativeRandom() * 14,
    life: 0.7 + nativeRandom() * 0.4, max: 1.1, k: k, smoke: !!smoke };
}
function vmSteamAt(x, y, dt, k) {
  if (reduceMotion) return;
  var n = dt * 40 * k;
  while (n > 0) { if (nativeRandom() < n) vmFx.steam.push(vmPuff(x, y - 8, k, false)); n -= 1; }
}
function vmPuddle(x, y, size) {
  for (var i = 0; i < vmFx.puddles.length; i++) {
    var p = vmFx.puddles[i], dx = p.x - x, dy = p.y - y;
    if (dx * dx + dy * dy < 40 * 40) { p.size = Math.min(1.4, p.size + size * 0.4); p.t = Math.min(p.t, 0.2); return; }
  }
  vmFx.puddles.push({ x: x, y: y, size: size, t: 0, max: vmFx.puddles.length < 12 ? 8 : 4, seed: nativeRandom() * 10 });
}

// The ice is gone: he lets go of the fist and the water puts his fire out.
function vmRelease(b, m, melted) {
  var c = vmChuckOf(m);
  if (c && c.swing && c.swing.phase === "extend") c.swing.t = 0; // (the swing carries on from extend to recover)
  if (!melted) { b.vnMelt = null; return; }
  if (c) { // a little shove apart
    var dx = c.x - b.x, dy = c.y - b.y, d = Math.sqrt(dx * dx + dy * dy) || 1;
    c.vx += dx / d * 160; c.vy += dy / d * 160; b.vx -= dx / d * 60; b.vy -= dy / d * 60;
  }
  m.phase = "douse"; m.t = 0;
  m.heat = vnFireHeat(b) || 1;
  if (b.vnFire) { b.vnFire = null; b.specialT = 0; }
  if (b.vn && b.vn.kept) { b.vn.kept = null; if (!b.vn.combo) b.vn.chain = 0; }
  var gl = vnGloves(b, c, vnGuardStance(b));
  if (!reduceMotion) gl.forEach(function (g) {
    for (var i = 0; i < 10; i++) {
      var a = -Math.PI / 2 + (nativeRandom() - 0.5) * 2.8, s = 60 + nativeRandom() * 140;
      particles.push({ x: g.x, y: g.y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 0.45, max: 0.45, size: 1.6 + nativeRandom() * 2.2, color: i % 2 ? "#7cc8ff" : "#d9f1ff" });
    }
    for (var j = 0; j < 6; j++) vmFx.steam.push(vmPuff(g.x, g.y - g.r * 0.3, 1, j % 2 === 0));
  });
  playVmDouse();
}

// Any fire touching Chuck's ice fists melts them the same way (Joe,
// 2026-11-22: Dustin's hot sauce fire breath, hot-sauce.js). His overhand fist
// steams and drips (MELTED!) and stays melted for the rest of his all-out
// attack, like after Van's catch. Nothing gets put out: the fire's still going.
function meltIceByFire(c) {
  if (!c || !c.alive || !c.iceRage || c.iceRage.melted || over) return false;
  c.iceRage.melted = true;
  var F = (c.swing && icSwingFist(c)) || { x: c.x, y: c.y };
  floater(F.x, F.y - 78, "MELTED!", "crit"); // (above the ON FIRE! call)
  crowdReact(0.5);
  if (!reduceMotion) for (var i = 0; i < 14; i++) vmFx.steam.push(vmPuff(F.x, F.y - 6, 1, false));
  for (var j = 0; j < 6; j++) vmFx.drips.push({ x: F.x + (nativeRandom() - 0.5) * 20, y: F.y + 6, vx: (nativeRandom() - 0.5) * 50, vy: 50 + nativeRandom() * 70, life: 0.5, max: 0.5, land: F.y + 26 + nativeRandom() * 22 });
  vmPuddle(F.x, F.y + c.r * 0.5, 0.7);
  playVmSizzle(0.6);
  return true;
}

// ---------------------------------------------------------------- drawing

// From draw(), under the fighters: the puddles of melt water.
function drawVanMeltUnder() {
  vmFx.puddles.forEach(function (p) {
    var a = Math.min(1, p.t / 0.3) * Math.min(1, (p.max - p.t) / 1.5), R = 16 + 22 * p.size;
    ctx.save();
    ctx.globalAlpha = 0.55 * a;
    ctx.fillStyle = "#7ec4ef";
    ctx.beginPath();
    for (var i = 0; i <= 16; i++) {
      var t = i / 16 * Math.PI * 2, w = 1 + 0.12 * Math.sin(t * 3 + p.seed) + 0.08 * Math.sin(t * 5 + p.seed * 2);
      var x = p.x + Math.cos(t) * R * w, y = p.y + Math.sin(t) * R * 0.55 * w;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.closePath(); ctx.fill();
    ctx.globalAlpha = 0.5 * a;
    ctx.fillStyle = "#ffffff";
    ctx.beginPath(); ctx.ellipse(p.x - R * 0.3, p.y - R * 0.15, R * 0.28, R * 0.08, -0.2, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  });
}

// From draw(), over the fighters: the ice on Chuck's fist melting in Van's
// glove, the steam and the drips, and his fire sputtering out.
function drawVanMeltOver() {
  balls.forEach(function (b) {
    var m = b.vnMelt;
    if (!m || !b.alive) return;
    var c = vmChuckOf(m);
    if (m.phase !== "douse") {
      var F = vmFist(m);
      if (!F) return;
      drawVmIce(F.x, F.y, SWING_FIST_R, m.ice, m.t);
      // His own catching glove over the ice, still burning (the guard glove
      // on that side, redrawn on top so it reads as gripping the fist).
      var g = vnGuardPts(b, c).filter(function (p) { return p.melt; })[0];
      if (g) {
        drawGloveAt(g.x, g.y, g.r, b.char, g.ang);
        drawVnFlame(g.x, g.y, g.r, 0.9 + 0.25 * Math.sin(m.t * 30), 7, true);
      }
    } else {
      var k = Math.max(0, 1 - m.t / m.cfg.douse), gl = vnGloves(b, c, vnGuardStance(b));
      // The flames sputter: shrinking, flickering off and on, then gone.
      var on = k > 0.55 || Math.sin(m.t * 55) > -0.2;
      if (on && k > 0.04) gl.forEach(function (gg, i) { drawVnFlame(gg.x, gg.y, gg.r, (m.heat || 1) * k * k * 0.8, i, false); });
      gl.forEach(function (gg) { drawVmWet(gg.x, gg.y, gg.r, k); });
    }
  });
  vmFx.drips.forEach(function (d) {
    ctx.save();
    ctx.globalAlpha = 0.85;
    ctx.fillStyle = "#6fbef0";
    ctx.beginPath(); ctx.ellipse(d.x, d.y, 2.6, 4.2, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  });
  vmFx.steam.forEach(function (s) {
    var a = Math.max(0, s.life / s.max);
    ctx.save();
    ctx.globalAlpha = (s.smoke ? 0.45 : 0.6) * a * s.k;
    ctx.fillStyle = s.smoke ? "#7c7c80" : "#f4f8fb";
    ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  });
}

// A chunk of ice round the fist, shrinking as it melts (k 1..0): pale blue
// glassy body, crystals round the rim, a shine, water running off the bottom.
function drawVmIce(x, y, fr, k, t) {
  if (k <= 0.01) return;
  var R = fr * (1.3 + 0.9 * k);
  ctx.save();
  ctx.globalAlpha = 0.5 + 0.4 * k;
  var g = ctx.createRadialGradient(x - R * 0.3, y - R * 0.3, R * 0.1, x, y, R);
  g.addColorStop(0, "rgba(240,250,255,0.95)");
  g.addColorStop(0.6, "rgba(150,210,245,0.85)");
  g.addColorStop(1, "rgba(80,160,230,0.75)");
  ctx.fillStyle = g;
  ctx.strokeStyle = "rgba(40,110,190,0.9)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  var n = 9;
  for (var i = 0; i <= n * 2; i++) {
    var a = i / (n * 2) * Math.PI * 2 + 0.3, spike = i % 2 === 0 ? 1 + 0.35 * k * (0.6 + 0.4 * Math.sin(i * 2.7)) : 0.82;
    var px = x + Math.cos(a) * R * spike, py = y + Math.sin(a) * R * spike;
    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  }
  ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.globalAlpha = 0.8 * k;
  ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 2.5; ctx.lineCap = "round";
  ctx.beginPath(); ctx.moveTo(x - R * 0.5, y - R * 0.15); ctx.lineTo(x - R * 0.15, y - R * 0.5); ctx.stroke();
  // water running off it
  ctx.globalAlpha = 0.7 * (1 - k * 0.5);
  ctx.fillStyle = "#6fbef0";
  for (var j = 0; j < 3; j++) {
    var dx = x + (j - 1) * R * 0.45, len = R * (0.3 + 0.35 * ((Math.sin(t * 9 + j * 2) + 1) / 2));
    ctx.beginPath(); ctx.ellipse(dx, y + R * 0.8 + len * 0.5, 2.4, len * 0.5 + 2, 0, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

// A glove soaked: a wet sheen and drops running off it as the fire dies.
function drawVmWet(x, y, gr, k) {
  ctx.save();
  ctx.globalAlpha = 0.45 * Math.min(1, k * 2 + 0.3);
  ctx.strokeStyle = "#8fd0ff"; ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.arc(x, y, gr * 1.02, Math.PI * 0.15, Math.PI * 0.85); ctx.stroke();
  ctx.fillStyle = "#6fbef0";
  ctx.beginPath(); ctx.ellipse(x - gr * 0.35, y + gr * (0.95 + 0.4 * (1 - k)), 2, 3.4, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(x + gr * 0.4, y + gr * (1 + 0.6 * (1 - k)), 2, 3.4, 0, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

function resetVanMelt() { vmFx = { steam: [], drips: [], puddles: [] }; }

// ---------------------------------------------------------------- sound (code-made)

// The catch: a heavy wet smack of glove on ice, with a glassy crack.
function playVmCatch() {
  vnAudio(function (ac, t) { caneTone(ac, t, "sine", 150, 60, 0.5, 0.2); caneBurst(ac, t, 1200, 1.2, 0.4, 0.08); caneBurst(ac, t + 0.01, 5200, 3, 0.2, 0.06); caneTone(ac, t, "sine", 2800, 2500, 0.08, 0.2); });
}
// The ice melting: a long sizzle with little pops.
function playVmSizzle(dur) {
  vnAudio(function (ac, t) {
    caneBurst(ac, t, 5200, 0.6, 0.22, dur);
    caneBurst(ac, t + 0.05, 3200, 0.9, 0.12, dur * 0.9);
    for (var i = 0; i < 8; i++) caneBurst(ac, t + nativeRandom() * dur, 2500 + nativeRandom() * 3000, 3, 0.12, 0.03);
  });
}
// The fire put out: a big hiss falling away and a sputter.
function playVmDouse() {
  vnAudio(function (ac, t) {
    caneBurst(ac, t, 4200, 0.5, 0.35, 0.7);
    caneTone(ac, t, "sine", 420, 120, 0.1, 0.5);
    for (var i = 0; i < 5; i++) caneBurst(ac, t + 0.1 + i * 0.09, 1400 + i * 200, 2, 0.12, 0.04);
  });
}
