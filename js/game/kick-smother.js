// Kicks smothered up close (Christian, 2026-11-15), for any fighter with a
// `smother` block. Josh Hokit is inside so much that most kicks thrown at
// him never get the room to land: "he should just get hit by kicks less
// because he's inside so much."
//
// Smother  `chance`% of the kicks thrown at him that would land are jammed
//          before they get going: no damage, no knockback, no limp, and a
//          short "SMOTHERED!" over his head. The kicks are the `sources`
//          (SMOTHER_KICKS if left out): the regular kick, the calf kicks
//          (leg-kick.js), the teep (teep.js) and "headkick", the head kick
//          (head-kick.js, which hurts as a "finisher").
//
// A fighter with no `smother` block takes kicks exactly as before. From
// hurt() (match.js), with the other dodges, before the weave and the block.
"use strict";

var SMOTHER_KICKS = ["kick", "teep", "headkick"];

// From hurt() (match.js): true when the kick was smothered (no damage).
function kickSmothered(b, source, attackerId) {
  var c = b && b.char && b.char.smother;
  if (!c || !c.chance || attackerId == null || attackerId === b.id || !b.alive) return false;
  var a = balls[attackerId];
  if (!a) return false;
  var kind = source === "finisher" ? (a.hkk && a.hkk.vicId === b.id ? "headkick" : null) : source; // (a head kick hurts as a finisher)
  if (!kind || (c.sources || SMOTHER_KICKS).indexOf(kind) < 0) return false;
  if (Math.random() * 100 >= c.chance) return false;
  b.justDodged = true; // callers skip the knockback
  floater(b.x, b.y - b.r - 30, "SMOTHERED!", "dodge");
  b.flash = 0.08;
  playPunch(3); // a dull thud: the kick jammed on him
  crowdReact(0.08);
  return true;
}

// The fighter card (gallery.js).
function smotherGalleryMoves(ch, add) {
  var c = ch.smother;
  if (!c || !c.chance) return;
  add("🛡️", "Smothers kicks", "Always inside: " + c.chance + "% of the kicks thrown at him" + (c.sources ? "" : " (calf kicks, teeps and head kicks too)") +
    " get smothered (\"SMOTHERED!\") and do nothing.");
}
