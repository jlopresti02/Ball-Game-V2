// Slowed fighters: a limp from Alex Pereira's calf kicks (pereira.js), and
// anything else that should make a fighter roll slower for a while.
// Every slowdown is { mult, t, kind }. A slowed fighter rolls at its normal
// speed times the lowest mult still running (regulateSpeed, physics.js), so
// two slowdowns don't stack into a crawl.
"use strict";

function addSlow(b, mult, dur, kind) {
  if (!b || !b.alive) return;
  b.slows = (b.slows || []).filter(function (s) { return s.kind !== kind; }); // a fresh one replaces the old
  b.slows.push({ mult: mult, t: dur, max: dur, kind: kind });
}
function slowMult(b) {
  if (!b || !b.slows || !b.slows.length) return 1;
  var m = 1;
  b.slows.forEach(function (s) { m = Math.min(m, s.mult); });
  return m;
}
function slowedBy(b, kind) {
  if (!b || !b.slows) return null;
  for (var i = 0; i < b.slows.length; i++) if (b.slows[i].kind === kind) return b.slows[i];
  return null;
}
// From update(), every frame.
function tickSlows(dt) {
  balls.forEach(function (b) {
    if (!b.slows || !b.slows.length) return;
    b.slows.forEach(function (s) { s.t -= dt; });
    b.slows = b.slows.filter(function (s) { return s.t > 0 && b.alive; });
  });
}
