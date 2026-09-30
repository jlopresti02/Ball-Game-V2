// Per-frame update, HUD health bars and canvas sizing.
"use strict";

// Which attack a fighter is charging (or, for the Watcher, firing) right
// now, and how far along it is. Drives the looping attack sounds.
function chargeProgress(b) {
  if (b.powerState && b.powerState.phase === "charge")
    return { kind: "power", p: b.powerState.t / b.char.powerPunch.chargeDur };
  if (b.rageState && b.rageState.phase === "charge")
    return { kind: "rage", p: b.rageState.t / b.char.rage.chargeDur };
  var ws = b.watcherState, wc = b.char.watcher;
  // The Watcher sits quietly for its sit delay, then the lasers charge.
  if (ws && ws.phase === "charge" && ws.t >= wc.preDelay)
    return { kind: "watcher", p: (ws.t - wc.preDelay) / wc.chargeDur };
  // Then the lasers fire.
  if (ws && ws.phase === "laser")
    return { kind: "laser", p: ws.t / wc.fireDur, n: wc.lasers };
  return null;
}

function update(dt) {
  if (hitStop > 0) {
    // Frozen for a split second after a wall slam; only the camera shake
    // and shockwaves keep moving so the impact still reads.
    hitStop -= dt;
    impacts.forEach(function (im) { im.life -= dt; });
    return;
  }
  var h = dt / SUBSTEPS;
  for (var s = 0; s < SUBSTEPS; s++) step(h);
  updateAbilities(dt);
  impacts = impacts.filter(function (im) { im.life -= dt; return im.life > 0; });

  balls.forEach(function (b) {
    var charging = (!over && b.alive) ? chargeProgress(b) : null;
    updateChargeSound(b.id, charging ? charging.kind : null, charging ? charging.p : 0, charging ? charging.n : 0);
    updateForget(b, dt);
    b.healGlow = Math.max(0, (b.healGlow || 0) - dt);
    if (b.iowaSafe) { b.iowaSafe.t -= dt; if (b.iowaSafe.t <= 0) b.iowaSafe = null; }
    b.flash = Math.max(0, b.flash - dt);
    b.immuneCd = Math.max(0, b.immuneCd - dt);
    if (b.jabAnim) {
      b.jabAnim.t += dt;
      if (b.jabAnim.t >= b.jabAnim.dur) b.jabAnim = null;
    }
    if (b.weaveAnim) {
      b.weaveAnim.t += dt;
      if (b.weaveAnim.t >= b.weaveAnim.dur) b.weaveAnim = null;
    }
    if (b.knockFly > 0) {
      // Launched by a combo finisher: flies at full launch speed for a moment
      // before the speed regulator starts easing it back down.
      b.knockFly = Math.max(0, b.knockFly - dt);
    }
    regulateSpeed(b, dt);
    if ((b.combo || b.flow || (b.jabAnim && b.jabAnim.big)) && !reduceMotion) {
      // Streak behind a fighter hunting down its combo.
      particles.push({
        x: b.x, y: b.y, vx: -b.vx * 0.12, vy: -b.vy * 0.12,
        life: 0.2, max: 0.2, size: b.r * 0.5, color: b.char.color
      });
    }
    if (b.rageState && b.rageState.phase === "attack" && !reduceMotion) {
      // A faint trail behind Sees Red while it's charging through the arena.
      particles.push({
        x: b.x, y: b.y, vx: -b.vx * 0.15, vy: -b.vy * 0.15,
        life: 0.22, max: 0.22, size: b.r * 0.45, color: b.char.color
      });
    }
    if (b.squash) {
      b.squash.t -= dt;
      if (b.squash.t <= 0) b.squash = null;
    }
    if (b.slam && b.alive && !reduceMotion) {
      // A streak in the attacker's color while the victim pinballs off the walls.
      particles.push({
        x: b.x, y: b.y, vx: -b.vx * 0.1, vy: -b.vy * 0.1,
        life: 0.3, max: 0.3, size: b.r * 0.75, color: balls[b.slam.attackerId].char.color
      });
    }
    b.shown += (b.hp - b.shown) * Math.min(1, dt * 4);
    if (Math.abs(b.hp - b.shown) < 0.1) b.shown = b.hp;
  });
  floaters = floaters.filter(function (f) { f.life -= dt; f.y -= 46 * dt; return f.life > 0; });
  particles = particles.filter(function (p) { p.life -= dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= 0.96; p.vy *= 0.96; return p.life > 0; });
  shake = Math.max(0, shake - dt * 30);
}

var hudCache = [];
function updateHud(force) {
  for (var i = 0; i < 2; i++) {
    var b = balls[i];
    var rounded = Math.ceil(b.hp);
    var key = rounded + "/" + Math.round(b.shown);
    if (!force && hudCache[i] === key) continue;
    hudCache[i] = key;
    document.getElementById("hp" + i).textContent = rounded;
    document.getElementById("fill" + i).style.width = (b.hp / MAX_HP * 100) + "%";
    document.getElementById("ghost" + i).style.width = (b.shown / MAX_HP * 100) + "%";
    document.getElementById("bar" + i).setAttribute("aria-valuenow", rounded);
  }
  updateRejuvHud(force);
}

// CTE Rejuvenation bar: fills as the next heal gets closer, then empties
// when the timer resets, glowing for a moment as the heal lands.
var rejuvCache = [];
function updateRejuvHud(force) {
  for (var i = 0; i < 2; i++) {
    var b = balls[i];
    if (!b.char.hasForget) continue;
    var p = Math.max(0, Math.min(1, (b.forgetT || 0) / b.char.forget.every));
    var healing = b.healGlow > 0;
    var key = Math.round(p * 400) + (healing ? "h" : "");
    if (!force && rejuvCache[i] === key) continue;
    rejuvCache[i] = key;
    document.getElementById("rejuvFill" + i).style.width = (p * 100) + "%";
    document.getElementById("rejuvBar" + i).setAttribute("aria-valuenow", Math.round(p * 100));
    document.getElementById("rejuv" + i).classList.toggle("healing", healing);
  }
}

function resize() {
  var rect = canvas.getBoundingClientRect();
  if (!rect.width) return;
  var dpr = window.devicePixelRatio || 1;
  canvas.width = Math.round(rect.width * dpr);
  canvas.height = Math.round(rect.width * (H / W) * dpr);
}
