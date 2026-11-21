// Flowing weaves (Joe, 2026-11-21): "The weaves also look very glitchy, make
// the weave of a bunch of attacks look like a more flowy animation."
//
// A weave used to shove the whole fighter sideways along his direction of
// travel, restarting from zero with a random side every time one landed. In
// a string of slips, and while bouncing off people (his heading flipping
// every frame), the body snapped from side to side.
//
// Now the slip is drawn off the line to the opponent (steady), a slip that
// follows another one inside `chain` seconds goes the other way (bob and
// weave, left, right, left), every slip lasts at least `minDur`, and the drawn
// offset glides toward where it should be (`ease`), so one slip flows into the
// next instead of jumping. Drawing only: what gets slipped, and when, is
// unchanged, and nothing here draws a random number.
"use strict";

var WEAVE_FLOW = { minDur: 0.32, chain: 0.4, side: 0.7, back: 0.2, ease: 20 };

// From update.js, every frame for each fighter.
function tickWeaveFlow(b, dt) {
  var F = WEAVE_FLOW, wa = b.weaveAnim;
  if (wa && wa !== b.wfAnim) {
    b.wfAnim = wa;
    b.wfSign = (b.wfRecent > 0 && b.wfSign) ? -b.wfSign : (wa.sign || 1);
    b.wfT = 0; b.wfDur = Math.max(F.minDur, wa.dur || 0);
    b.wfRecent = F.chain + b.wfDur;
  }
  if (b.wfRecent > 0) b.wfRecent = Math.max(0, b.wfRecent - dt);
  var tx = 0, ty = 0;
  if (b.wfT != null && b.wfT < b.wfDur && b.alive) {
    b.wfT += dt;
    var k = Math.min(1, b.wfT / b.wfDur), amp = Math.sin(Math.PI * k);
    amp = amp * amp * (3 - 2 * amp); // softer in and out
    var o = balls[1 - b.id], fx, fy;
    if (o && o.alive) {
      var dx = o.x - b.x, dy = o.y - b.y, d = Math.sqrt(dx * dx + dy * dy) || 1;
      fx = dx / d; fy = dy / d;
    } else {
      var s = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
      fx = s > 1 ? b.vx / s : 1; fy = s > 1 ? b.vy / s : 0;
    }
    tx = (-fy * b.wfSign * F.side - fx * F.back) * b.r * amp;
    ty = (fx * b.wfSign * F.side - fy * F.back) * b.r * amp;
  }
  var e = 1 - Math.exp(-F.ease * dt);
  if (!b.wfD) b.wfD = { x: 0, y: 0 };
  b.wfD.x += (tx - b.wfD.x) * e; b.wfD.y += (ty - b.wfD.y) * e;
  if (Math.abs(b.wfD.x) < 0.01 && Math.abs(b.wfD.y) < 0.01 && !tx && !ty) { b.wfD.x = 0; b.wfD.y = 0; }
}

// From draw.js: how far the weave has the fighter slipped right now.
function weaveFlowOffset(b) { return b.wfD || { x: 0, y: 0 }; }
