// No jumbotron in special cutscenes (Joe, 2026-11-24: "this isn't amateur
// hour"). When a special takes the whole screen somewhere else, the
// scoreboard over the stands goes with the rest of the arena:
//   - Gaethje's All American: out on the night highway (gone the moment the
//     road cuts in, back the moment it cuts out, like the road itself),
//   - Ilia's Aura Farm: fades out as the lights go down, back as they come up,
//   - Tony vs Jiří's katana duel cutscene: fades with its colour grade,
//   - Fedor's The Unmoving Man: fades with its letterbox and grade.
// The cutscenes drawn over everything (Khabib's space cut, Islam's Dagestan,
// Chuck Norris, DC's music video, Max's flashback, Jiří's dream) already
// cover it. Nothing else changes: ads keep their own pause rules
// (jumboHold), the jumbotron just isn't drawn.
//
// To add a cutscene: add one line to jumboCutsceneHide() returning how far
// it is hidden, 0 (shown) to 1 (gone).
"use strict";

function jumboCutsceneHide() {
  var h = 0;
  if (typeof allAmericanOn === "function" && allAmericanOn()) return 1;                        // the highway (allamerican.js)
  if (typeof aura !== "undefined" && aura) h = Math.max(h, aura.dark || 0);                    // lights down (aurafarm.js)
  if (typeof kDuel !== "undefined" && kDuel && kDuel.cam) h = Math.max(h, kDuel.cam.grade || 0); // katana duel cutscene (katana-duel.js)
  if (typeof umOwner === "function") {                                                         // The Unmoving Man (fedor-unmoving.js)
    var f = umOwner();
    if (f && f.igbb) h = Math.max(h, umCam(f, f.igbb).grade || 0);
  }
  return Math.max(0, Math.min(1, h));
}

// From draw.js in place of drawJumbotron(px): drawn as normal, skipped when
// hidden, and in between drawn on its own layer and faded.
var jcBuf = null;
function drawJumbotronUnlessCutscene(px) {
  var hide = jumboCutsceneHide();
  if (hide >= 0.995) return;
  if (hide <= 0.005) { drawJumbotron(px); return; }
  var cw = canvas.width, ch = canvas.height;
  if (!jcBuf) jcBuf = document.createElement("canvas");
  if (jcBuf.width !== cw || jcBuf.height !== ch) { jcBuf.width = cw; jcBuf.height = ch; }
  var bx = jcBuf.getContext("2d"), saved = ctx;
  bx.setTransform(1, 0, 0, 1, 0, 0); bx.clearRect(0, 0, cw, ch);
  ctx = bx;
  try { drawJumbotron(px); } finally { ctx = saved; }
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 1 - hide;
  ctx.drawImage(jcBuf, 0, 0);
  ctx.restore();
  ctx.setTransform(px, 0, 0, px, 0, 0); // left as drawJumbotron leaves it
}
