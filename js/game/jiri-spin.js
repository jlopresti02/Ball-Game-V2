// Jiří Procházka's whirlwind (Joe, 2026-11-17): now and then in the samurai's
// run, instead of a single cut, he coils both katanas over his shoulder and
// spins round like a blender with both blades out, the same idea as Tony
// Ferguson's blade cyclone (Katana B, ferguson-katanas.js). Numbers live in
// his character file under `prochazka.samurai.spin`; leave the block out and
// it never happens.
//
//   chance   % of his cuts that become the whirlwind, once at least
//            `minPlain` ordinary cuts have gone since the last one (never on
//            an X cut, never with them up against the cage)
//   wind     seconds coiling up (the tell: blades cross over his shoulder
//            with a glint, "WHIRLWIND!")
//   time     seconds spinning
//   turns    turns a second at full speed
//   hits     the most cuts one whirlwind can land
//   mult     each cut is the samurai's `damage` x `mult` (crits, bleeding
//            cuts, clashes with their weapon and the cut down all work the
//            same as his other cuts: it goes through jpCut in prochazka.js)
//
// Like Tony's, it never pins anyone in a corner (Joe's rule for the
// cyclone): no knockback off its cuts, it never starts near the cage, and it
// stops drifting in if they get there. Only his own two arms.
"use strict";

function jpSpinCfg(b) { var s = jpSam(b); return s && s.spin; }

// From jpStartSlash (prochazka.js): turns the cut that's starting into a
// whirlwind now and then.
function jpSpinMaybe(self, other, cfg, m) {
  var c = cfg.spin, sl = m.sl;
  if (!c || !sl || sl.both) { m.plainCuts = (m.plainCuts || 0) + 1; return; }
  var ok = (m.plainCuts || 0) >= (c.minPlain || 0) && katWallGap(other) > 20 && Math.random() * 100 < (c.chance || 0); // (katWallGap: ferguson-katanas.js)
  if (!ok) { m.plainCuts = (m.plainCuts || 0) + 1; return; }
  m.plainCuts = 0;
  sl.kind = "spin"; sl.spin = m.ang + 1.3; sl.spinV = 0; sl.hits = 0; sl.cd = 0; sl.whoosh = 0; sl.hit = true; sl.a0 = m.ang;
  floater(self.x, self.y - self.r - 30, "WHIRLWIND!", "crit");
}

// From jpRunSlash (prochazka.js) while the cut is a whirlwind.
function jpSpinRun(self, other, cfg, m, dt, gap) {
  var c = cfg.spin, sl = m.sl, Wd = c.wind || 0.2, T = c.time || 0.75;
  sl.t += dt;
  var dx = other.x - self.x, dy = other.y - self.y, d = Math.sqrt(dx * dx + dy * dy) || 1, ux = dx / d, uy = dy / d, spd = (self.baseSpeed || SPEED) * cfg.speed;
  if (sl.t < Wd) { self.vx = ux * spd * 0.2; self.vy = uy * spd * 0.2; return; } // coiling up
  if (!sl.scared) { sl.scared = true; if (typeof jpScareLads === "function") jpScareLads(self); } // Conor's lads leg it (jiri-react.js)
  var t = sl.t - Wd, k = jpClamp(t / 0.12) * jpClamp((T - t) / 0.12 + 0.15);
  sl.spinV = 2 * Math.PI * (c.turns || 3) * k;
  sl.spin += sl.spinV * dt;
  // Drifts in, but never pins them: stops once they're near the cage.
  var drift = katWallGap(other) > other.r + 25 && gap > 4 ? spd * 0.45 : 0;
  self.vx = ux * drift; self.vy = uy * drift;
  sl.cd -= dt; sl.whoosh -= dt;
  if (sl.whoosh <= 0 && k > 0.4) { sl.whoosh = 0.15; playElbowSwish(true); }
  var ang = Math.atan2(uy, ux);
  for (var s = -1; s <= 1; s += 2) {
    var ba = sl.spin + (s > 0 ? 0 : Math.PI), diff = Math.atan2(Math.sin(ba - ang), Math.cos(ba - ang));
    if (sl.cd <= 0 && sl.hits < (c.hits || 2) && Math.abs(diff) < 0.4 && k > 0.5 && other.alive && gap < self.r * (s > 0 ? JP_LONG : JP_SHORT) * 0.8) {
      sl.cd = 0.22; sl.hits++;
      m.ang = ang;
      var vx = other.vx, vy = other.vy;
      jpCut(self, other, cfg, m, c.mult || 0.8, "line", ang + Math.PI / 2 + 0.3);
      if (m.phase !== "close") return; // (the cut down took over)
      if (!other.justDodged) { other.vx = vx; other.vy = vy; } // no knockback: no bouncing them off the cage
      if (!m.sl) return; // (it met their weapon: the clash ends the whirlwind)
    }
  }
  if (t >= T) { m.sl = null; m.next = 0.15; }
}

// From applyProchazkaPose (prochazka.js): his body turning with the spin.
function jpSpinPose(sl) {
  return sl.t < 0 ? 0 : sl.spin - (sl.a0 + 1.3) + 0.28 * jpEase(Math.min(1, sl.t / 0.12));
}

// From drawProchazka (prochazka.js): coiled with both blades crossed over his
// shoulder, then both straight out either side, trailing a swoosh.
function jpDrawSpin(b, sam, m) {
  var sl = m.sl, c = sam.spin, Wd = c.wind || 0.2;
  if (sl.t < Wd) {
    var u = jpEase(sl.t / (Wd * 0.7)), ang = sl.a0;
    [1, -1].forEach(function (s) {
      var len = b.r * (s > 0 ? JP_LONG : JP_SHORT), g = jpGuard(b, ang, s);
      var hand = jpAt(b, jpLerpA(ang + s * 0.62, ang + 1.05 + s * 0.2, u), 1.0 - 0.1 * u);
      jpArm(b, ang, s, hand, jpLerpA(g.ba, ang + 2.5 + s * 0.25, u), len, sl.t > Wd * 0.5 ? 0.5 + 0.5 * Math.sin(jpClock * 40) : 0);
    });
    return;
  }
  [1, -1].forEach(function (s) {
    var len = b.r * (s > 0 ? JP_LONG : JP_SHORT), th = sl.spin + (s > 0 ? 0 : Math.PI);
    if (sl.spinV > 6) {
      var pts = [];
      for (var i = 0; i <= 12; i++) {
        var back = (1 - i / 12) * 1.25, a = th - back, h = jpAt(b, a, 1.05), ba = a - 0.12;
        pts.push({ m: { x: h.x + Math.cos(ba) * len * 0.3, y: h.y + Math.sin(ba) * len * 0.3 }, t: { x: h.x + Math.cos(ba) * len, y: h.y + Math.sin(ba) * len } });
      }
      katTrail(pts, Math.min(1, sl.spinV / 18) * 0.85); // (ferguson-katanas.js)
    }
    jpArm(b, th - s * Math.PI / 2, s, jpAt(b, th, 1.05), th - 0.12, len, 0);
  });
}

// The fighter card's move list (gallery.js).
function jpSpinGalleryMove(p, add) {
  var c = p && p.samurai && p.samurai.spin;
  if (c) add("🌀", "Whirlwind", "Now and then in the samurai's run, " + c.chance + "% of his cuts become a spin with both katanas out: up to " + c.hits + " cuts at " + c.mult + "x, no knockback, never in a corner.");
}
