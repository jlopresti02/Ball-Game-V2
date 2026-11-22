// One shared check for "a locked, scripted sequence is on" (Joe, 2026-11-20):
// no special, and no special-like random move, may start while a sword
// clash or duel, a blade lock, a beam clash, or a cutscene is running for
// either fighter. They don't cancel: the special stays charged and simply
// waits, then goes off once the sequence is over.
//
// canStartIgbb() in special.js checks it, so every special and random move
// that already asks canStartIgbb waits for free. The few start checks that
// don't go through canStartIgbb call sceneLocked() themselves (one line
// each, commented with this file's name).
//
// To add a new locked sequence: add one line below.
"use strict";

function sceneLocked() {
  if (typeof swordDuel !== "undefined" && swordDuel) return true;                    // sword clash / duel (sword.js: Dustin, Ilia's rapier, Gane's bat)
  if (typeof saberLock !== "undefined" && saberLock) return true;                    // Hokit's saber lock (hokit-darkside.js)
  if (typeof katanaLock !== "undefined" && katanaLock) return true;                  // Tony Ferguson's katana lock (ferguson-katanas.js)
  if (typeof jpLock !== "undefined" && jpLock) return true;                          // Jiří Procházka's blade lock (prochazka.js)
  if (typeof kDuel !== "undefined" && kDuel) return true;                            // Tony vs Jiří's katana duel and its cutscene (katana-duel.js)
  if (typeof beamClash !== "undefined" && beamClash && !beamClash.done) return true; // Kamehameha vs rainbow beam struggle (beam-clash.js)
  if (typeof cncCut !== "undefined" && cncCut) return true;                          // Chuck Norris's entrance cutscene (chuck-norris-cut.js)
  if (typeof islamTrip !== "undefined" && islamTrip) return true;                  // Islam's cut to Dagestan (islam-specials.js)
  if (typeof dcCut !== "undefined" && dcCut) return true;                            // DC's music video (cormier-cake-cut.js)
  if (typeof hwFlash !== "undefined" && hwFlash) return true;                        // Max Holloway's flashback (holloway.js)
  if (typeof sl !== "undefined" && sl && sl.phase !== "over") return true;           // Khabib's orbital strike / Hokit's Death Star, space cut and all (send-location.js)
  return false;
}

// Forms that hang on an interaction (Joe, 2026-11-20): a form or weapon mode
// never runs out in the middle of one. Tony's katanas, Hokit's Dark Side and
// Gaethje's golf club pause their clocks on sceneLocked(); Jiří Procházka's
// samurai run (prochazka.js) asks formHeld(), which also waits while an
// animal is in the ring coming at him or the halves of one he just cut are
// still sliding apart (jiri-react.js), so he never sheathes mid cut (up to
// 4s of animal waiting a run, so a bear left wandering can't stretch it).
function formHeld(b) {
  if (sceneLocked()) return true;
  if (typeof jpHalves !== "undefined" && jpHalves.length) return true;                 // an animal he just cut in half (jiri-react.js)
  if (typeof ringBear !== "undefined" && ringBear) return true;                       // Khabib's bear (khabib-bear.js)
  if (typeof natLion !== "undefined" && natLion) return true;                         // Nate's lion (nate-lion.js)
  if (typeof eagleStrikes !== "undefined" && eagleStrikes.length) return true;        // Gaethje's eagle (gaethje-eagle.js)
  if (typeof jonGoats !== "undefined" && jonGoats.some(function (g) { return !g.hit; })) return true; // Jon's goats (jon.js)
  return false;
}
