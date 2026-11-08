// A short instruction to whoever's watching the reel, over the ring for the
// first couple of seconds of every fight (not in gallery demos).
"use strict";

var INTRO_MSG = { title: "WHO WINS?", sub: "COMMENT YOUR PICK BEFORE THE KO" };
var INTRO_LEN = 2.8; // seconds on screen
var introStart = 0;

function startIntroMsg() {
  introStart = (typeof galleryDemo !== "undefined" && galleryDemo) ? 0 : performance.now();
}
function resetIntroMsg() { introStart = 0; }

// From the end of draw(); s/ox/oy place the arena on the canvas.
function drawIntroMsg(s, ox, oy) {
  if (!introStart) return;
  var t = (performance.now() - introStart) / 1000;
  if (t > INTRO_LEN) { introStart = 0; return; }
  var pop = t < 0.18 ? t / 0.18 : 1;
  var sc = t < 0.18 ? 1.5 - 0.5 * pop : 1 + Math.sin(Math.min(1, (t - 0.18) / 0.25) * Math.PI) * 0.04;
  var al = Math.min(pop, Math.max(0, (INTRO_LEN - t) / 0.35));
  ctx.save();
  ctx.setTransform(s, 0, 0, s, ox, oy);
  ctx.globalAlpha = al;
  ctx.translate(W / 2, H * 0.5); ctx.scale(sc, sc);
  // Maroon WWIT plate with a cream rim
  var pw = 440, ph = 150;
  ctx.fillStyle = "rgba(90,15,24,0.94)";
  ctx.strokeStyle = "#e3cd9a"; ctx.lineWidth = 5;
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(-pw / 2, -ph / 2, pw, ph, 18); else ctx.rect(-pw / 2, -ph / 2, pw, ph);
  ctx.fill(); ctx.stroke();
  ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.lineJoin = "round";
  ctx.font = "900 78px Impact, 'Arial Black', sans-serif";
  var tw = ctx.measureText(INTRO_MSG.title).width; // (shrunk to fit the plate)
  if (tw > pw - 40) ctx.font = "900 " + Math.floor(78 * (pw - 40) / tw) + "px Impact, 'Arial Black', sans-serif";
  ctx.lineWidth = 10; ctx.strokeStyle = "#16211f"; ctx.strokeText(INTRO_MSG.title, 0, -22);
  ctx.fillStyle = "#ffffff"; ctx.fillText(INTRO_MSG.title, 0, -22);
  ctx.font = '800 30px "Barlow Condensed", "Arial Narrow", sans-serif';
  ctx.fillStyle = "#e3cd9a"; ctx.fillText(INTRO_MSG.sub, 0, 44);
  ctx.restore();
}
