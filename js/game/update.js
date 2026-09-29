// Per-frame update, HUD health bars and canvas sizing.
"use strict";

function update(dt) {
  var h = dt / SUBSTEPS;
  for (var s = 0; s < SUBSTEPS; s++) step(h);
  updateAbilities(dt);

  balls.forEach(function (b) {
    b.flash = Math.max(0, b.flash - dt);
    b.immuneCd = Math.max(0, b.immuneCd - dt);
    if (b.jabAnim) {
      b.jabAnim.t += dt;
      if (b.jabAnim.t >= b.jabAnim.dur) b.jabAnim = null;
    }
    if (b.rageState && b.rageState.phase === "attack" && !reduceMotion) {
      // A faint trail behind Sees Red while it's charging through the arena.
      particles.push({
        x: b.x, y: b.y, vx: -b.vx * 0.15, vy: -b.vy * 0.15,
        life: 0.22, max: 0.22, size: b.r * 0.45, color: b.char.color
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
    document.getElementById("fill" + i).style.width = b.hp + "%";
    document.getElementById("ghost" + i).style.width = b.shown + "%";
    document.getElementById("bar" + i).setAttribute("aria-valuenow", rounded);
  }
}

function resize() {
  var rect = canvas.getBoundingClientRect();
  if (!rect.width) return;
  var dpr = window.devicePixelRatio || 1;
  canvas.width = Math.round(rect.width * dpr);
  canvas.height = Math.round(rect.width * (H / W) * dpr);
}
