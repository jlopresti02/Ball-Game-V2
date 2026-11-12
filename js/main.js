// Game loop, buttons, tap-to-set sliders, and startup. Load this last.
"use strict";

var last = null;
// The fight runs in fixed 1/60s ticks on its seeded numbers (seed.js), so a
// saved seed replays the same fight on any phone and frame rate.
var TICK = 1 / 60, tickAcc = 0;
function runTicks(dt) {
  tickAcc = Math.min(tickAcc + dt, TICK * 4);
  withFightRandom(function () {
    while (tickAcc >= TICK - 1e-9) { update(TICK); tickAcc -= TICK; }
  });
}
function frame(t) {
  if (last === null) last = t;
  var dt = Math.min((t - last) / 1000, 1 / 30);
  last = t;
  if (!screens.game.hidden) {
    var ts = deathTimeScale() * sendLocTimeScale(); // slow motion or a freeze while the loser dies (death.js); held while Khabib's strike is up in orbit (send-location.js)
    if (started && !gamePaused) advanceSendLocSpace(dt); // the space cut plays out in real time
    if (started && !gamePaused && ts > 0) runTicks(dt * ts); // a gallery demo can be paused (gallery.js)
    updateHud(false);
    draw();
  }
  requestAnimationFrame(frame);
}

document.getElementById("rematch").addEventListener("click", function () { startMatchWith(balls[0].baseChar, balls[1].baseChar); });
document.getElementById("backBtn").addEventListener("click", function () { showMenu(); });
Array.prototype.forEach.call(document.querySelectorAll(".arenaBtn"), function (btn) {
  btn.addEventListener("click", function () { setArenaMode(stadiumOn() ? "test" : "stadium"); });
});
// The Music button steps through the loops and Off (music.js).
Array.prototype.forEach.call(document.querySelectorAll(".musicBtn"), function (btn) {
  btn.addEventListener("click", function () {
    setMusicChoice(MUSIC_LIST[(MUSIC_LIST.indexOf(musicChoice) + 1) % MUSIC_LIST.length]);
  });
});
updateMusicButtons();
// The Death button steps through the death animations (death.js).
Array.prototype.forEach.call(document.querySelectorAll(".deathBtn"), function (btn) {
  btn.addEventListener("click", function () {
    setDeathStyle(DEATH_LIST[(DEATH_LIST.indexOf(deathStyle) + 1) % DEATH_LIST.length]);
  });
});
updateDeathButtons();
// Tapping past the win banner opens the menu.
banner.addEventListener("click", function (e) {
  if (gamePhase === "win" && e.target !== startBtn) setGamePhase("menu");
});
document.getElementById("menuRematch").addEventListener("click", function () { startMatchWith(balls[0].baseChar, balls[1].baseChar); });
document.getElementById("menuChange").addEventListener("click", function () { showMenu(); });
startBtn.addEventListener("click", function () {
  var ctx = getAudioCtx();
  if (ctx && ctx.state === "suspended") ctx.resume();
  if (over) startMatchWith(balls[0].baseChar, balls[1].baseChar); else start();
});
window.addEventListener("resize", resize);
if (window.ResizeObserver) new ResizeObserver(resize).observe(canvas);

// Every slider in the editor jumps to wherever you tap along its track,
// instead of requiring a precise drag on the small thumb (the default
// range-input behavior on some mobile browsers, which made them feel
// unresponsive).
Array.prototype.forEach.call(document.querySelectorAll('input[type="range"]'), function (el) {
  function setFromClientX(clientX) {
    var rect = el.getBoundingClientRect();
    if (!rect.width) return;
    var frac = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    var min = parseFloat(el.min) || 0, max = parseFloat(el.max) || 100, step = parseFloat(el.step) || 1;
    var raw = min + frac * (max - min);
    var stepped = Math.round(raw / step) * step;
    stepped = Math.min(max, Math.max(min, stepped));
    var decimals = (String(step).split(".")[1] || "").length;
    stepped = parseFloat(stepped.toFixed(decimals));
    if (parseFloat(el.value) !== stepped) {
      el.value = stepped;
      el.dispatchEvent(new Event("input", { bubbles: true }));
    }
  }
  el.addEventListener("pointerdown", function (e) {
    setFromClientX(e.clientX);
    if (el.setPointerCapture && e.pointerId != null) {
      try { el.setPointerCapture(e.pointerId); } catch (err) {}
    }
  });
});

initRosterStore(); // pull in saved fighters (repo + cloud roster)
applyArenaLayout(); // test arena or WWIT stadium, whichever was picked last
showScreen("select");
requestAnimationFrame(frame);
