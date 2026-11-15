// The watchdog: a safety net so no fight can freeze for good.
//
// Every frame it notes how long each fighter has been in the same lock state
// (a special, a grab, a hold, a choke, a weapon swing, being held, dazed or
// dizzy). If one runs far longer than any real move does (`max` seconds, or
// `special` for a special), or both fighters have stood frozen on the spot
// for `frozen` seconds with no special running, it lets both of them go: the
// stuck states are cleared, they get their speed back and the fight carries
// on. Each time it logs "watchdog reset: <state>" to the console.
//
// Until it fires it only reads: it changes nothing and draws no random
// numbers, so a fight that never gets stuck plays exactly the same with it.
//
// Settings (WATCHDOG below):
//   max      seconds any one lock state may last
//   special  seconds a special (igbb) may last; while one runs, the other
//            lock states wait for it (being held through a long special is fine)
//   frozen   seconds both fighters may stand still with no special running
//   on       false switches it off
"use strict";

var WATCHDOG = { on: true, max: 20, special: 45, frozen: 15 };
// The states it watches. Paired ones (a grab and being grabbed) are cleared on
// both fighters together.
var WD_KEYS = ["grapple", "grappled", "sprawl", "sprawled", "guillo", "choked", "rnc", "suplex", "armbar", "guard", "hokitShot",
  "slam", "chAct", "fenceGrab", "dazed", "dizzy", "shocked", "shelled", "beamPin", "combo", "taunt", "flow", "checkAnim", "mock", "throwAnim"];

var wdState = null; // { balls, held: [{ key: { v, t } }, ...], igbb: [{ v, t }, ...], still: { x0, y0, x1, y1, t } }

function wdFresh() { return { balls: balls, held: [{}, {}], igbb: [null, null], still: null }; }

// From update.js, every frame.
function tickWatchdog(dt) {
  if (!WATCHDOG.on || !balls || balls.length < 2) return;
  if (!wdState || wdState.balls !== balls) wdState = wdFresh(); // a new fight
  var a = balls[0], b = balls[1];
  if (!started || over || !a.alive || !b.alive) { wdState.held = [{}, {}]; wdState.igbb = [null, null]; wdState.still = null; return; }
  var anySpecial = false, hit = null;
  for (var i = 0; i < 2; i++) {
    var f = balls[i], ig = wdState.igbb[i];
    if (f.igbb) {
      anySpecial = true;
      if (!ig || ig.v !== f.igbb) ig = wdState.igbb[i] = { v: f.igbb, t: 0 };
      ig.t += dt;
      if (ig.t > WATCHDOG.special && !hit) hit = { id: i, what: "special " + (f.igbb.move || "?") + (f.igbb.phase ? "/" + f.igbb.phase : "") + " " + Math.round(ig.t) + "s" };
    } else wdState.igbb[i] = null;
  }
  for (var j = 0; j < 2; j++) {
    var g = balls[j], held = wdState.held[j];
    for (var k = 0; k < WD_KEYS.length; k++) {
      var key = WD_KEYS[k], v = g[key];
      if (!v || anySpecial) { if (held[key]) delete held[key]; continue; }
      var h = held[key];
      if (!h || h.v !== v) h = held[key] = { v: v, t: 0 };
      h.t += dt;
      if (h.t > WATCHDOG.max && !hit) hit = { id: j, what: key + wdKind(v) + " " + Math.round(h.t) + "s" };
    }
  }
  // Both standing frozen on the spot, nothing running.
  var s = wdState.still;
  if (anySpecial || !s || Math.abs(a.x - s.x0) + Math.abs(a.y - s.y0) + Math.abs(b.x - s.x1) + Math.abs(b.y - s.y1) > 2) {
    wdState.still = { x0: a.x, y0: a.y, x1: b.x, y1: b.y, t: 0 };
  } else if ((s.t += dt) > WATCHDOG.frozen && !hit) hit = { id: -1, what: "both frozen " + Math.round(s.t) + "s" };
  if (hit) wdRelease(hit);
}

function wdKind(v) { return v && typeof v === "object" ? (v.move || v.kind || v.phase ? "(" + (v.move || v.kind || v.phase) + ")" : "") : v === true ? "" : "(" + v + ")"; }

// Lets both fighters go and puts them back to fighting.
function wdRelease(hit) {
  var who = hit.id >= 0 ? balls[hit.id].char.name + " " : "";
  console.log("watchdog reset: " + who + hit.what);
  balls.forEach(function (f) {
    if (!f.alive) return;
    clearActions(f);
    f.igbb = null; f.grapple = null; f.grappled = false; f.sprawl = null; f.sprawled = false;
    f.guillo = null; f.choked = false; f.rnc = null; f.suplex = null; f.armbar = null; f.guard = null; f.hokitShot = null;
    f.slam = null; f.fenceGrab = null; f.dazed = false; f.dizzy = null; f.shocked = false; f.shelled = false; f.beamPin = null;
    if (golfing(f)) endGolfMode(f, true); // Gaethje drops the club (gaethje-golf.js)
    setSpeed(f, f.baseSpeed || SPEED);
  });
  wdState.held = [{}, {}]; wdState.igbb = [null, null]; wdState.still = null;
}
