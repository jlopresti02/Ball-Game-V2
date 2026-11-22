// Islam Makhachev's fighting style (Joe, 2026-11-22): light hands, good
// kicks, some of the best grappling in the game, the best clinch, and a
// shaky start on the feet.
//
// Most of it is the shared blocks in his character file: kicks with a high
// kick check (abilities.js), calf kicks (leg-kick.js), the clinch with heavy
// knees (clinch.js), the D'Arce (ilia-darce.js), the suplex from behind
// (suplex.js), a chin that cracks under punches (chin.js), a high sprawl.
// This file adds the parts that are his own, all under `islam`:
//
//   takedowns  how his shots finish, rolled when one gets through their
//              defense (attemptGrab, grapple-duel.js), relative odds:
//              "back"     he takes the back ("TAKES THE BACK") into the rear
//                         naked choke (rnc.js, his `rnc` block),
//              "bodyLock" a body lock and a slam over his hip ("BODY LOCK!",
//                         the suplex throw, his `suplex` damage),
//              "single"   a single leg he works up into the clinch ("SINGLE
//                         LEG!"), which always ends in the judo sweep,
//              "double"   the ordinary takedown (match.js beginGrapple).
//   sweep      `chance`% of his own clinches that run their course end in a
//              judo sweep ("JUDO SWEEP!"): he turns his hip in and throws them
//              (the takedown, beginGrapple, with the ragdoll throw).
//   darceShot  `chance`% of the shots he sprawls on he snaps into the D'Arce
//              instead (his `darce` block's hold and tap odds).
//   clinchDef  their clinch on him: `evade`% more of their tie-ups slip off,
//              and `escape`% more often he breaks free after each strike.
//   early      the shaky start: the first punch that lands on him in the first
//              `window` seconds of the fight staggers him `chance`% of the
//              time ("STAGGERED!", dizzy for `dizzy` seconds, he slips).
"use strict";

function islamCfg(b) { return b && b.char && b.char.islam; }

function islamPick(mix) {
  var tot = 0, k;
  for (k in mix) tot += mix[k];
  var r = Math.random() * tot;
  for (k in mix) { r -= mix[k]; if (r < 0) return k; }
  return null;
}

// From attemptGrab (grapple-duel.js), once the shot has got past their
// defense: true if it became one of his own finishes.
function islamTakedown(atk, tgt) {
  var ic = islamCfg(atk);
  if (!ic || !ic.takedowns || !atk.alive || !tgt.alive) return false;
  var kind = islamPick(ic.takedowns);
  if (!kind || kind === "double") return false;
  atk.grappleCd = atk.char.grapple ? atk.char.grapple.cooldown : 0;
  if (kind === "back") {
    floater(atk.x, atk.y - atk.r - 44, "TAKES THE BACK", "note");
    beginRnc(atk, tgt);
    return true;
  }
  if (kind === "bodyLock" && atk.char.suplex && !atk.suplex) {
    beginSuplex(atk, tgt);
    floater(atk.x, atk.y - atk.r - 84, "BODY LOCK!", "crit");
    atk.suplexCd = atk.char.suplex.cooldown || 0;
    return true;
  }
  if (kind === "single" && clinchCfg(atk) && !clinchBusy(atk) && plumTarget(tgt)) {
    if (!startClinch(atk, tgt, null)) return false;
    atk.clin.slip = false;          // he's already on the leg: the tie-up can't be slipped
    atk.clin.islamSweep = true;     // and it ends in the judo sweep
    floater(atk.x, atk.y - atk.r - 60, "SINGLE LEG!", "crit");
    return true;
  }
  return false;
}

// From endClinch (clinch.js), before the break (`m` is the clinch that just
// ended): true if it ended in the judo sweep (they're on their way down, no
// shove off).
function islamJudoSweep(self, v, how, m) {
  var ic = islamCfg(self), sw = ic && ic.sweep;
  if (!ic || how !== "done" || !self.alive || !v.alive || self.grapple || v.grappled || !self.char.grapple) return false;
  if (!(m && m.islamSweep) && Math.random() * 100 >= ((sw && sw.chance) || 0)) return false;
  v.choked = false;
  floater((self.x + v.x) / 2, Math.min(self.y, v.y) - self.r - 50, "JUDO SWEEP!", "crit");
  beginGrapple(self, v);
  commentaryCall("shot", self, v);
  return true;
}

// From updateAbilities (abilities.js), every frame: seconds since the bell
// (for the shaky start; there's no fight clock in the engine).
function tickIslam(b, dt) {
  if (islamCfg(b) && started && !over) b.islamT = (b.islamT || 0) + dt;
}

// From attemptGrab (grapple-duel.js), when he's about to sprawl on their
// shot: true if he snaps on the D'Arce instead.
function islamDarceOnShot(atk, tgt) {
  var ic = islamCfg(tgt), ds = ic && ic.darceShot;
  if (!ds || !darceCfg(tgt) || tgt.darce || (tgt.darceCd || 0) > 0 || !darceOpen(tgt, atk)) return false;
  if (Math.random() * 100 >= ds.chance) return false;
  atk.grappleCd = atk.char.grapple ? atk.char.grapple.cooldown : 0;
  floater(tgt.x, tgt.y - tgt.r - 60, "SPRAWL", "dodge");
  beginDarce(tgt, atk);
  return true;
}

// From the clinch (clinch.js): his clinch defense, extra % to slip their
// tie-up ("evade") or break free after each strike ("escape").
function islamClinchDefense(v, key) {
  var ic = islamCfg(v);
  return (ic && ic.clinchDef && ic.clinchDef[key]) || 0;
}

// From hurt() (match.js), after the damage: the shaky start.
function islamHurt(b, dealt, source, attackerId) {
  var ic = islamCfg(b), e = ic && ic.early;
  if (!e || b.islamEarlyDone || dealt <= 0 || attackerId == null || attackerId === b.id || !b.alive) return;
  if (["punch", "jab", "combo", "flow", "kopunch"].indexOf(source) < 0) return;
  b.islamEarlyDone = true; // only ever the first punch that lands
  if ((b.islamT || 0) > e.window) return;
  if (Math.random() * 100 >= e.chance) return;
  floater(b.x, b.y - b.r - 64, "STAGGERED!", "crit");
  makeDizzy(b, e.dizzy || 1.2);
  var a = balls[attackerId], dx = b.x - a.x, dy = b.y - a.y, d = Math.sqrt(dx * dx + dy * dy) || 1;
  if (inOrdinaryMovement(b)) { b.vx = dx / d * 260; b.vy = dy / d * 260; } // the legs go out from under him: he slips back
  b.squash = { t: 0.2, max: 0.2, nx: -dx / d, ny: -dy / d };
}

// The fighter card (gallery.js).
function islamGalleryMoves(ch, add) {
  var ic = ch.islam;
  if (!ic) return;
  add("🤼", "Chain wrestling", "His shots finish as a back take into the rear naked choke, a body lock slam, a single leg worked up into the clinch, or a double leg.");
  if (ic.sweep) add("🥋", "Judo sweep", ic.sweep.chance + "% of his clinches end with knees into a judo sweep takedown (the single leg always does).");
  if (ic.darceShot) add("🐍", "D'Arce off the sprawl", ic.darceShot.chance + "% of the shots he sprawls on go straight into a D'Arce.");
  if (ic.early) add("😵", "Shaky start", "The first punch that lands in the first " + ic.early.window + "s staggers him " + ic.early.chance + "% of the time.");
}
