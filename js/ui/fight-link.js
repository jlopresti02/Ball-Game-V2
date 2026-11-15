// Fight links: opening the game with ?fight=CODE&a=ID&b=ID (and optionally
// &arena=stadium or test) loads that exact fight, waiting on Start match, so
// a fight found offline (for a reel) can be replayed on the phone from a link.
// Seeds and codes: seed.js. Load after main.js.
"use strict";

(function () {
  var q;
  try { q = new URLSearchParams(location.search); } catch (e) { return; }
  var code = q.get("fight"), aId = q.get("a"), bId = q.get("b");
  if (!code || !aId || !bId) return;
  var seed = parseSeedCode(code), a = findChar(aId), b = findChar(bId);
  if (seed == null || !a || !b) return;
  var arena = q.get("arena");
  if ((arena === "stadium" || arena === "test") && arena !== (stadiumOn() ? "stadium" : "test")) setArenaMode(arena);
  startMatchWith(a, b, seed);
})();
