// Josh Hokit's pressure (Christian, 2026-11-15): "coming forward a lot with
// combinations, just consistently forward with either a shot or punches,
// even though he's lacking power, and he's setting himself up for crits.
// He should just have a lot, a lot of health, and he should be trading
// pitter-patter punches with them."
//
// Set under "pressure" in his character file (plus `combos` and `maxHp`
// next to it); leave the block out and none of this happens.
//
// Walking them down  whenever he's rolling about freely he turns toward
//           them at `turn` radians a second and rolls `speed` times his
//           normal speed until he's within `pocket` (edge to edge). Knocked
//           back or bounced off them, he turns straight back round. Not in
//           his Dark Side form, and not while he's busy with a shot, an
//           armbar, a thumbs down or anything else that holds him.
// Combinations  his punches come in strings, through the shared `combos`
//           block (combos.js): jab-jab-cross, jab-cross-jab-cross,
//           jab-cross-hook and the five-punch jab-cross-jab-cross-hook, every
//           one his normal light punch. The three new strings are added to
//           COMBOS below, so any fighter can use them.
// The shot  his armbar shot (hokit.js): armbarShot.chance on every bump,
//           and `shotChance`% of the moments a combination is due he shoots
//           the double leg instead (pressure.shotChance), waiting up to
//           `shotWait` seconds to get on them first.
// Takedown defense  the plain `tdd` block in his file (ilia.js): he
//           sprawls `tdd.sprawlChance`% of shots and grabs ("STUFFED").
// Walking onto shots (pressure.chin)  coming forward he's wide open:
//           `critChance`% of the strikes in `sources` that land on him while
//           he's free and pressing (not in a shot, an armbar, a thumbs down or
//           his Dark Side) are crits, `critMult` times the
//           damage: "CRIT!" over his head, a white flash where it landed, a
//           snap of his head and a crack. The weave still slips what it
//           always did; this is only what gets through.
// A lot of health  `maxHp` in his file (max-hp.js): the extra health is
//           the pale layer over his health bar.
"use strict";

// Extra combination strings (combos.js), all hands.
(function () {
  var add = {
    "jab-jab-cross": ["jab", "jab", "cross"],
    "jab-cross-jab-cross": ["jab", "cross", "jab", "cross"],
    "jab-cross-jab-cross-hook": ["jab", "cross", "jab", "cross", "hook"]
  };
  Object.keys(add).forEach(function (id) { if (!COMBOS[id]) COMBOS[id] = add[id]; });
})();

function hokitPressCfg(b) { return b && b.char && b.char.pressure; }

// From updateHokit (hokit.js), every frame he's free: turns him toward them,
// and when a combination is due, makes room for it (or shoots instead). True
// when he's just shot.
function hokitPress(self, other, dt, d) {
  var pc = hokitPressCfg(self);
  if (!pc || !other.alive || other.koOut || darkSideOn(self) || self.dizzy || !inOrdinaryMovement(self)) { self.hkDue = null; return false; }
  if (pc.turn) {
    var dx = other.x - self.x, dy = other.y - self.y, gap = d - self.r - other.r;
    var sp = Math.sqrt(self.vx * self.vx + self.vy * self.vy), want = Math.atan2(dy, dx);
    var cur = sp > 1 ? Math.atan2(self.vy, self.vx) : want;
    var diff = Math.atan2(Math.sin(want - cur), Math.cos(want - cur)), turn = pc.turn * dt;
    var nu = cur + Math.max(-turn, Math.min(turn, diff));
    if (gap > (pc.pocket || 0)) sp = Math.max(sp, (self.baseSpeed || SPEED) * slowMult(self) * (pc.speed || 1));
    self.vx = Math.cos(nu) * sp; self.vy = Math.sin(nu) * sp;
  }
  return hokitComboOrShot(self, other, dt, d, pc);
}

// combos.js only starts a combination between two punches, and his jab
// comes back so fast there's hardly ever a gap, so when one's due his single
// jab waits a frame. `shotChance`% of the time the moment goes to the shot
// instead: he holds the combination back (up to `shotWait` seconds, 1.2 if
// left out) until he's on them, then shoots the double leg (hokit.js).
function hokitComboOrShot(self, other, dt, d, pc) {
  var cc = self.char.combos;
  if (!cc) return false;
  if (self.cmb || self.cmbT == null || self.cmbT > 0) { self.hkDue = null; return false; }
  if (self.punch) return false;
  var due = self.hkDue || (self.hkDue = { t: 0, shot: !!(pc.shotChance && self.char.hasArmbarShot && Math.random() * 100 < pc.shotChance) });
  due.t += dt;
  if (due.shot && due.t < (pc.shotWait || 1.2)) {
    if (d < self.r + other.r + 6 && !specialBusy(self) && !specialBusy(other) && !other.invincible) {
      self.hkDue = null;
      self.cmbT = cbRand(cc.every); // the shot takes the combination's turn
      if (!cheaterFenceGrab(self, other)) beginShot(self, other); // (Gane cheating grabs the cage)
      return true;
    }
    self.cmbT = 0.001; // not yet: the combination waits for the shot
    return false;
  }
  self.punchCd = Math.max(self.punchCd || 0, 0.02);
  return false;
}

// On the front foot right now: free, not in a shot, an armbar, a thumbs down
// or his Dark Side. (He's always coming forward when he's free.)
function hokitComingForward(b) {
  return !(darkSideOn(b) || b.hokitShot || b.mock || b.armbar || !inOrdinaryMovement(b));
}

// From hurt (match.js), next to Jiri Prochazka's chin: a strike that lands
// on him while he's coming forward is sometimes a crit. Returns the damage
// multiplier (1 for everyone else, before any dice are rolled).
function hokitChin(b, source, attackerId) {
  var pc = hokitPressCfg(b), ch = pc && pc.chin;
  if (!ch || attackerId == null || attackerId === b.id || !b.alive || !balls[attackerId]) return 1;
  if ((ch.sources || []).indexOf(source) < 0) return 1;
  var a = balls[attackerId];
  if (!hokitComingForward(b)) return 1;
  if (Math.random() * 100 >= ch.critChance) return 1;
  var dx = b.x - a.x, dy = b.y - a.y, d = Math.sqrt(dx * dx + dy * dy) || 1, ux = dx / d, uy = dy / d;
  floater(b.x, b.y - b.r - 60, "CRIT!", "crit"); // (high, clear of the hit numbers and the other fighter's move names)
  impacts.push({ x: b.x - ux * b.r, y: b.y - uy * b.r, nx: -ux, ny: -uy, life: 0.3, max: 0.3, color: "#ffffff" });
  b.squash = { t: 0.12, max: 0.12, nx: -ux, ny: -uy };
  hitStop = Math.max(hitStop, 0.05);
  if (!reduceMotion) shake = Math.max(shake, 10);
  crowdReact(0.3);
  playChinCrack(); // (the crack off Jiri's chin, prochazka.js)
  b.hkCrits = (b.hkCrits || 0) + 1;
  return ch.critMult;
}

// The fighter card's move list (gallery.js).
function hokitPressureGalleryMoves(ch, add) {
  var pc = ch.pressure;
  if (!pc) return;
  if (pc.turn) add("➡️", "Always coming forward", "Walks them down all fight and turns straight back at them after every bounce. Up close it's combinations of light punches" +
    (pc.shotChance ? ", or (" + pc.shotChance + "% of the time) the double leg" : "") + ".");
  if (ch.tdd) add("🧱", "Takedown defense", "Sprawls on " + ch.tdd.sprawlChance + "% of takedown shots and grabs (\"STUFFED\") and comes straight back with punches.");
  if (pc.chin) add("💥", "Walks onto shots", pc.chin.critChance + "% of the strikes that land on him while he's coming forward are crits, " + pc.chin.critMult + "x the damage.");
}
