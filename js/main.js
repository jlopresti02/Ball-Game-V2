// Game loop, buttons, tap-to-set sliders, and startup. Load this last.
"use strict";

var last = null;
function frame(t) {
  if (last === null) last = t;
  var dt = Math.min((t - last) / 1000, 1 / 30);
  last = t;
  if (!screens.game.hidden) {
    if (started) update(dt);
    updateHud(false);
    draw();
  }
  requestAnimationFrame(frame);
}

document.getElementById("rematch").addEventListener("click", function () { startMatchWith(balls[0].char, balls[1].char); });
document.getElementById("backBtn").addEventListener("click", function () { showScreen("select"); });
startBtn.addEventListener("click", function () {
  var ctx = getAudioCtx();
  if (ctx && ctx.state === "suspended") ctx.resume();
  if (over) startMatchWith(balls[0].char, balls[1].char); else start();
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

showScreen("select");
requestAnimationFrame(frame);
