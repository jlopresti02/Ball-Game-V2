// A short instruction to whoever's watching the reel, over the ring for the
// first couple of seconds of every fight (not in gallery demos).
"use strict";

var INTRO_MSG = { title: "FIRST TO KNOCKOUT WINS!", sub: "COMMENT YOUR PICK DOWN BELOW" };
var INTRO_LEN = 3.2; // seconds on screen
var introStart = 0;

function startIntroMsg() {
  introStart = (typeof galleryDemo !== "undefined" && galleryDemo) ? 0 : performance.now();
}
function resetIntroMsg() { introStart = 0; }

// From the end of draw(); s/ox/oy place the arena on the canvas.
// In the stadium it takes over the whole jumbotron, up where it's seen; in
// the test arena (no jumbotron) it sits along the top of the ring.
function drawIntroMsg(s, ox, oy) {
  if (!introStart) return;
  var t = (performance.now() - introStart) / 1000;
  if (t > INTRO_LEN) { introStart = 0; return; }
  var pop = Math.min(1, t / 0.18);
  var al = Math.min(1, Math.max(0, (INTRO_LEN - t) / 0.35));
  var k, box;
  if (stadiumOn()) {
    k = canvas.width / STAGE_W;
    box = { x: ST.JT.x, y: ST.JT.y, w: ST.JT.w, h: ST.JT.h };
  } else {
    k = canvas.width / 1080;
    box = { x: 30, y: 30, w: 1020, h: 250 };
  }
  ctx.save();
  ctx.setTransform(k, 0, 0, k, 0, 0);
  ctx.globalAlpha = al;
  var cx = box.x + box.w / 2, cy = box.y + box.h / 2;
  ctx.translate(cx, cy);
  var sc = pop < 1 ? 0.6 + 0.4 * pop + Math.sin(pop * Math.PI) * 0.12 : 1;
  ctx.scale(sc, sc);
  // Maroon WWIT panel with a gold rim, the size of the jumbotron
  var pw = box.w, ph = box.h;
  ctx.fillStyle = "#5a0f18"; ctx.strokeStyle = "#e3cd9a"; ctx.lineWidth = 8;
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(-pw / 2, -ph / 2, pw, ph, 18); else ctx.rect(-pw / 2, -ph / 2, pw, ph);
  ctx.fill(); ctx.stroke();
  ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.lineJoin = "round";
  // Big headline, shrunk to fit
  var big = 104;
  ctx.font = "900 " + big + "px Impact, 'Arial Black', sans-serif";
  var tw = ctx.measureText(INTRO_MSG.title).width;
  if (tw > pw - 60) { big = Math.floor(big * (pw - 60) / tw); ctx.font = "900 " + big + "px Impact, 'Arial Black', sans-serif"; }
  var pulse = 1 + Math.sin(t * 7) * 0.025;
  ctx.save(); ctx.translate(0, -ph * 0.16); ctx.scale(pulse, pulse);
  ctx.lineWidth = 12; ctx.strokeStyle = "#16211f"; ctx.strokeText(INTRO_MSG.title, 0, 0);
  ctx.fillStyle = "#ffffff"; ctx.fillText(INTRO_MSG.title, 0, 0);
  ctx.restore();
  // The ask, with arrows pointing down to the comments
  ctx.font = '800 54px "Barlow Condensed", "Arial Narrow", sans-serif';
  var sw = ctx.measureText(INTRO_MSG.sub).width, sy = ph * 0.24;
  ctx.fillStyle = "#e3cd9a"; ctx.fillText(INTRO_MSG.sub, 0, sy);
  var bob = Math.sin(t * 9) * 5;
  [-1, 1].forEach(function (side) {
    var ax = side * (sw / 2 + 40), ay = sy + bob;
    ctx.fillStyle = "#e3cd9a";
    ctx.beginPath(); ctx.moveTo(ax - 18, ay - 12); ctx.lineTo(ax + 18, ay - 12); ctx.lineTo(ax, ay + 16); ctx.closePath(); ctx.fill();
    ctx.fillRect(ax - 6, ay - 30, 12, 20);
  });
  ctx.restore();
}
