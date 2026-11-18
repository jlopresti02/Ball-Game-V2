// Charles Oliveira hunts the submission once they're hurt (Christian,
// 2026-11-18). A fighter opts in with an "oliveira": { "subHunt": {...} }
// block in his character file. A fighter without one is untouched: nothing
// here runs for him and nothing here draws a random number for him.
//
//   "oliveira": { "subHunt": {
//     "below": 40,          once the opponent is under this % of a full bar:
//     "shotMult": 1.6,      his takedown clock (grapple.cooldown) runs this
//                           many times as fast, so he shoots that much more
//                           often
//     "press": {            and he walks them down to get the contact he
//       "turn": 4,          needs to shoot (the shared movement.js press, only
//       "lead": 0.15        while they're hurt; take the block out and he
//     },                    moves as before)
//     "subChance": 45       and this % of the takedowns he lands go straight
//                           into one of his BJJ submissions (his guard's
//                           `subs`: the rear naked choke or the armbar,
//                           guard.js startSubmission), the same way every Do
//                           Bronx takedown does (abilities.js)
//   } }
//
// The takedown still lands (its damage and the throw); the submission takes
// the place of letting them go. The tap odds are the submission's own, so
// they already rise the more hurt the victim is (rnc.js, armbar.js). A
// takedown that would finish them is still the finisher. Do Bronx is left
// exactly as it was: while it's on, none of this runs (every takedown is a
// submission then anyway).
"use strict";

function ohCfg(b) { var o = b && b.char && b.char.oliveira; return (o && o.subHunt) || null; }
function ohBelow(h) { return h.below != null ? h.below : 40; }
function ohHurt(other, h) { return !!(other && other.alive && other.hp < MAX_HP * ohBelow(h) / 100); }

// From the takedown landing (abilities.js, the Do Bronx branch): true when
// this takedown goes straight into a submission.
function oliveiraHuntSub(self, tgt) {
  var h = ohCfg(self);
  if (!h || self.doBronx || !ohHurt(tgt, h)) return false;
  if (Math.random() * 100 >= (h.subChance != null ? h.subChance : 45)) return false;
  if (typeof tossSkipBounce === "function") tossSkipBounce(tgt); // straight into the hold: no bounce after the throw (toss.js)
  return true;
}

// Every frame (update.js): while they're hurt, the faster takedown clock and
// the walk-down.
function tickOliveiraHunt(dt) {
  balls.forEach(function (b) {
    var h = ohCfg(b);
    if (!h || !started || over || !b.alive || b.doBronx) return;
    var o = balls[1 - b.id];
    if (!ohHurt(o, h)) return;
    var m = h.shotMult || 1;
    if (m > 1 && b.char.hasGrapple && b.grappleCd > 0 && !b.guard && inOrdinaryMovement(b)) {
      b.grappleCd = Math.max(0, b.grappleCd - dt * (b.atkRate || 1) * (m - 1));
    }
    if (h.press && !b.char.movement && typeof mvSteer === "function") {
      if (!b.ohMv) b.ohMv = { t: 1, step: null, reset: null };
      mvSteer(b, o, b.ohMv, { press: h.press }, dt);
    }
  });
}

// The card (gallery.js).
function oliveiraGalleryMoves(ch, add) {
  var h = ohCfg({ char: ch });
  if (!h) return;
  var gd = ch.guard || {}, subs = (gd.subs || ["bjj"]).map(function (s) { return SUB_NAMES[s] || s; }).join(" or ");
  add("🥋", "Sub hunt", "Once they're under " + ohBelow(h) + "% health he hunts the finish: " + (h.press ? "he walks them down, " : "") +
    "shoots " + (h.shotMult || 1) + "x as often, and " + (h.subChance != null ? h.subChance : 45) + "% of the takedowns he lands go straight into a " + subs +
    " (they tap more the more hurt they are).");
}
