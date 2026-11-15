// Shots that get stuffed (Christian, 2026-11-15). Khabib Nurmagomedov's and
// Charles Oliveira's takedowns landed almost every time, because whether a
// shot lands was only ever up to the one being shot on.
//
// A Grappler with `stuffChance` in his `grapple` block gets that % of his
// takedown shots stuffed, on top of whatever takedown defense they have
// (their sprawl, or a `tdd` block); half as often in the Do Bronx state,
// like a sprawl. They sprawl on it ("SPRAWL"): a Grappler then scrambles for
// the reattack as usual, anyone else stuffs it ("STUFFED") and comes
// straight back with punches (ilia.js). Leave it out and his shots land
// exactly as before. From attemptGrab (grapple-duel.js), after their own
// sprawl.
function tryShotStuffed(attacker, target) {
  var gr = attacker.char.grapple;
  if (!gr || !gr.stuffChance || !target.alive || target.sprawl || target.sprawled) return false;
  if (Math.random() * 100 >= gr.stuffChance * (attacker.doBronx ? 0.5 : 1)) return false;
  beginSprawl(attacker, target);
  return true;
}
