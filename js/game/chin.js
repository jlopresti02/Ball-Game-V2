// A chin that gets cracked (Christian, 2026-11-15), for any fighter with a
// `chin` block (Khabib Nurmagomedov fights with his chin up), and taken out
// of Ciryl Gane's file so it's shared: his hands-down chin (`gane.chin`)
// runs through here too, exactly as before.
//
// Chin    `critChance`% of the strikes in `sources` that land on him are
//         critical hits for `critMult`x: `text` over his head ("CRIT!"
//         unless it's set), a white flash where it landed, a jolt and a
//         short freeze.
//
// A fighter with no `chin` block takes hits exactly as before. Jiří
// Procházka keeps his own (`prochazka.chin`, with the crack and the sound).

var CHIN_SOURCES = ["punch", "jab", "kick", "kickback", "elbow", "knee", "combo", "swing", "teep", "flow", "bat", "poke"];

function chinCfg(b) {
  var ch = b && b.char;
  if (!ch) return null;
  return ch.chin || (ch.gane && ch.gane.chin) || null;
}

// From hurt() (match.js), with the damage multipliers: 1, or `critMult`.
function chinCritMult(b, source, attackerId) {
  var ch = chinCfg(b);
  if (!ch || attackerId == null || attackerId === b.id || !b.alive) return 1;
  if ((ch.sources || CHIN_SOURCES).indexOf(source) < 0 || Math.random() * 100 >= ch.critChance) return 1;
  var a = balls[attackerId], dx = b.x - a.x, dy = b.y - a.y, d = Math.sqrt(dx * dx + dy * dy) || 1, ux = dx / d, uy = dy / d;
  floater(b.x, b.y - b.r - 34, ch.text || "CRIT!", "crit");
  impacts.push({ x: b.x - ux * b.r, y: b.y - uy * b.r, nx: -ux, ny: -uy, life: 0.3, max: 0.3, color: "#ffffff" });
  b.squash = { t: 0.12, max: 0.12, nx: -ux, ny: -uy };
  hitStop = Math.max(hitStop, 0.04);
  if (!reduceMotion) shake = Math.max(shake, 9);
  b.chinCrits = (b.chinCrits || 0) + 1; // counted for the "rattled" voice line moment (chatter.js)
  return ch.critMult;
}

// The fighter card (gallery.js). Gane's card says it itself (gane.js).
function chinGalleryMoves(ch, add) {
  if (!ch.chin) return;
  add("🎯", "Chin up", ch.chin.critChance + "% of the strikes that land on him are critical hits for " + ch.chin.critMult + "x" +
    (ch.chin.text ? " (\"" + ch.chin.text + "\")" : "") + ".");
}
