// Conor McGregor's guard during his set pieces (Joe, 2026-11-17).
// While he runs the Bus Crew (calling it in, waiting on the lads, catching
// and lifting the dolly) and while he's at the podium for the Press
// Conference, he's solid and every strike, shot or grab they start on him is
// BLOCKED! (shoulder turned into it, they're knocked back) or DODGED! (a slip
// out to the side and a sway back), the same as Daniel Cormier eating
// (dcDefend, cormier.js) and Chuck Liddell's Snow Day (icDefend, liddell.js).
// Walking into him just eases them out of his space. Anything that still
// lands is blocked by the special's guard (specialGuarding, special.js).
// Grabs on him don't go through (attemptGrab, grapple-duel.js).
"use strict";

function conorGuardOn(b) {
  return !!(b && b.alive && b.cm && b.igbb && (b.igbb.move === "buscrew" || b.igbb.move === "presser"));
}
// From attemptGrab: no takedowns on him while he's guarded.
function conorGuardSafe(b) { return conorGuardOn(b); }

// From update(): his slips and blocks.
function tickConorGuard(dt) {
  if (!balls || !started) return;
  balls.forEach(function (b) {
    if (!conorGuardOn(b)) { if (b.cmGuard) { b.cmGuard = null; b.immuneCd = 0; } return; }
    var other = balls[1 - b.id];
    if (!b.cmGuard) b.cmGuard = {};
    b.immuneCd = 1; // no BLOCK popping up from the special guard: he slips or blocks instead
    dcDefend(b, other, b.cmGuard, dt);
  });
}

// From draw.js: his shoulder turning into a blocked shot.
function conorGuardOffset(b) {
  var g = b.cmGuard;
  if (!g || !g.def || !b.alive) return { x: 0, y: 0 };
  var k = Math.sin(Math.min(1, g.def.t / 0.35) * Math.PI);
  return { x: g.def.x * b.r * 0.14 * k, y: g.def.y * b.r * 0.14 * k };
}
