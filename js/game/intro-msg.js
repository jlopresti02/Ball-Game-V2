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
// A slim one-line ribbon that stays off the fighting area: in the stadium
// it sits on the stands just under the cage (still above the reels'
// caption area); in the test arena it hugs the bottom edge of the ring.
function drawIntroMsg(s, ox, oy) {
  if (!introStart) return;
  var t = (performance.now() - introStart) / 1000;
  if (t > INTRO_LEN) { introStart = 0; return; }
  var pop = Math.min(1, t / 0.15);
  var al = Math.min(pop, Math.max(0, (INTRO_LEN - t) / 0.35));
  var cx, cy, k; // centre and pixels per stage unit
  if (stadiumOn()) {
    k = canvas.width / STAGE_W;
    cx = STAGE_W / 2 * k; cy = (ST.IN.y1 + 44) * k;
  } else {
    k = canvas.width / 1080;
    cx = canvas.width / 2; cy = canvas.height - 48 * k;
  }
  var text = INTRO_MSG.title + "  " + INTRO_MSG.sub;
  ctx.save();
  ctx.setTransform(k, 0, 0, k, cx, cy);
  ctx.globalAlpha = al;
  ctx.scale(0.85 + 0.15 * pop, 0.85 + 0.15 * pop);
  ctx.font = '800 40px "Barlow Condensed", "Arial Narrow", sans-serif';
  var tw = ctx.measureText(text).width, pw = Math.min(980, tw + 56), ph = 60;
  ctx.fillStyle = "rgba(90,15,24,0.92)"; ctx.strokeStyle = "#e3cd9a"; ctx.lineWidth = 3;
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(-pw / 2, -ph / 2, pw, ph, ph / 2); else ctx.rect(-pw / 2, -ph / 2, pw, ph);
  ctx.fill(); ctx.stroke();
  ctx.textAlign = "left"; ctx.textBaseline = "middle";
  var x = -tw / 2;
  ctx.fillStyle = "#ffffff"; ctx.fillText(INTRO_MSG.title + "  ", x, 2);
  ctx.fillStyle = "#e3cd9a"; ctx.fillText(INTRO_MSG.sub, x + ctx.measureText(INTRO_MSG.title + "  ").width, 2);
  ctx.restore();
}
