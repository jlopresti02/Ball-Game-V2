// Jiří Procházka's samurai against animals and leprechauns (Joe, 2026-11-17:
// only in samurai mode). Numbers under `prochazka.react` in his character
// file; it all runs while he has both katanas in his hands (the draw, the
// run and the finisher of his samurai special, prochazka.js), never outside it.
//
// Animals   (react.animals) anything with four legs or wings that comes for
//           the samurai gets cut clean in half: Khabib's bear walking into him
//           or thrown at him, Nate's lion landing its pounce, Jon's goats,
//           Ilia's bull, Gaethje's eagle strike and Strickland's eagle.
//           Instead of the attack: a white flash across it ("CUT IN HALF!"),
//           and the two halves slide apart and puff away into smoke and cherry
//           blossom. Never bloody: a clean white line, no red, nothing inside.
//           `chance`% of the time (100 = always). Each animal's own file asks
//           with one line (jpAnimalCut), and the bear, the lion and the eagle
//           strike are let at him while he's a samurai (jpSamuraiCanCut).
// Leprechauns (react.leprechauns) Conor McGregor's Bus Crew lads: the lads
//           coming off the bus for him fill his samurai bar (once a bus) and the
//           samurai answers the bus (jpBusAnswer), and with any lad within `range` his next cut
//           is the whirlwind (jiri-spin.js). The whirlwind sends every lad off
//           the bus legging it back aboard ("RUN!"), and any still to come off
//           take one look and run back on.
"use strict";

var jpHalves = [];        // the animals he's cut, sliding apart
var JP_HALF_LIFE = 1.15;  // seconds they're on screen

function jpReactCfg(b) { var c = jpCfg(b); return c && c.react; }
function resetJiriReact() { jpHalves = []; }

// The samurai with both katanas in his hands, free to use them.
function jpSamuraiCanCut(v) {
  if (!v || !v.alive || v.koOut || !samuraiOn(v) || !jpReactCfg(v)) return false;
  var ph = v.igbb.phase;
  return (ph === "draw" || ph === "close" || ph === "final") && !samuraiLockHeld(v) && !v.slam;
}

// ---------------------------------------------------------------- animals

// From each animal's file at the moment it would hit him. `a`: { x, y } the
// middle of the animal as drawn, `r` roughly how big it is, `draw` a function
// that draws it exactly as it is right now. True: it's been cut in half, so
// the animal's file drops its attack and takes the animal away.
function jpAnimalCut(v, a) {
  var rc = jpReactCfg(v), ac = rc && rc.animals;
  if (!ac || !jpSamuraiCanCut(v) || over) return false;
  if (Math.random() * 100 >= (ac.chance != null ? ac.chance : 100)) return false;
  var ang = Math.atan2(a.y - v.y, a.x - v.x);
  jpHalves.push({ x: a.x, y: a.y, r: a.r || 60, cut: ang + Math.PI / 2 + 0.45, draw: a.draw, t: 0, puffed: false, dx: Math.cos(ang), dy: Math.sin(ang) });
  floater(a.x, a.y - (a.r || 60) - 20, "CUT IN HALF!", "crit");
  playSamuraiGlint(true);
  playElbowSwish(true);
  hitStop = Math.max(hitStop, 0.1);
  if (!reduceMotion) shake = Math.max(shake, 10);
  crowdReact(1);
  return true;
}

// ---------------------------------------------------------------- leprechauns

function jpLadsOut(v) { return typeof cmBus !== "undefined" && cmBus && cmBus.oppId === v.id && cmBus.crew.some(function (c) { return c.st === "chase" || c.st === "out" || c.st === "brawl"; }); }
// From jpSpinMaybe (jiri-spin.js): a lad close enough that the next cut is the whirlwind.
function jpLadsNear(v) {
  var lc = jpReactCfg(v) && jpReactCfg(v).leprechauns;
  if (!lc || !jpLadsOut(v)) return false;
  return cmBus.crew.some(function (c) { return (c.st === "chase" || c.st === "out") && Math.hypot(c.x - v.x, c.y - v.y) - v.r - CM_CREW_R < (lc.range || 120); });
}
// From updateSamurai (prochazka.js): the lads out for him and his bar full,
// the samurai answers the bus (like Tony's katanas get answered).
function jpBusAnswer(self, other) {
  var lc = jpReactCfg(self) && jpReactCfg(self).leprechauns;
  return !!(lc && jpLadsOut(self) && self.alive && !self.igbb && !self.cmBrawl && !specialBusy(self) && inOrdinaryMovement(self) && !swordDuelActive());
}

// The whirlwind (jpSpinRun, jiri-spin.js) scares off every lad off the bus.
function jpScareLads(v) {
  if (typeof cmBus === "undefined" || !cmBus || cmBus.oppId !== v.id) return 0;
  var n = 0, first = v.jpScaredBus !== cmBus;
  v.jpScaredBus = cmBus; // (any lad still to come off the bus takes one look and runs back on: tickJiriReact)
  cmBus.crew.forEach(function (c) {
    if (c.st !== "chase" && c.st !== "out" && c.st !== "brawl") return;
    c.st = "back"; c.t = 0; c.dizzy = 0; c.puff = 0; c.scared = true;
    floater(c.x, c.y - 30, (c.i % 2) ? "AAAH!" : "RUN!", "note");
    n++;
  });
  if (n && first) {
    floater(v.x, v.y - v.r - 44, "SCARED OFF!", "crit");
    crowdReact(1);
  }
  return n;
}

// ---------------------------------------------------------------- every frame

// From tickProchazka (prochazka.js).
function tickJiriReact(dt) {
  jpHalves.forEach(function (h) {
    h.t += dt;
    if (!h.puffed && h.t >= JP_HALF_LIFE - 0.35) { h.puffed = true; jpHalfPuff(h); }
  });
  jpHalves = jpHalves.filter(function (h) { return h.t < JP_HALF_LIFE; });
  balls.forEach(function (v) {
    if (!jpReactCfg(v) || typeof cmBus === "undefined" || !cmBus || !v.alive) return;
    if (v.jpScaredBus === cmBus) jpScareLads(v); // the rest of the crew won't come near him either
    // The lads coming for him fill the samurai's bar (once a bus), so he answers them.
    var sp = v.char.special, lc = jpReactCfg(v).leprechauns;
    if (lc && v.jpBusFilled !== cmBus && jpLadsOut(v) && sp && sp.move === "samurai" && !samuraiOn(v)) { v.jpBusFilled = cmBus; v.specialT = Math.max(v.specialT || 0, sp.chargeTime); }
  });
}
// Smoke and cherry blossom where the halves were.
function jpHalfPuff(h) {
  for (var i = 0; i < 22 && !reduceMotion; i++) {
    var a = nativeRandom() * Math.PI * 2, s = 60 + nativeRandom() * 160;
    particles.push({ x: h.x + Math.cos(a) * h.r * 0.4, y: h.y + Math.sin(a) * h.r * 0.3, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 40,
      life: 0.5 + nativeRandom() * 0.3, max: 0.8, size: 5 + nativeRandom() * 7, color: i % 3 ? "rgba(236,232,224,0.85)" : "#f4b6c8" });
  }
  playWhoosh();
}

// ---------------------------------------------------------------- drawing

// From draw() over the fighters (draw.js): the halves sliding apart.
function drawJiriReactOver() {
  jpHalves.forEach(function (h) {
    var u = h.t / JP_HALF_LIFE, e = jpEaseOut(Math.min(1, h.t / 0.5));
    var cx = Math.cos(h.cut), cy = Math.sin(h.cut), nx = -cy, ny = cx, R = h.r * 3;
    var alpha = h.t < JP_HALF_LIFE - 0.4 ? 1 : Math.max(0, (JP_HALF_LIFE - h.t) / 0.4);
    [-1, 1].forEach(function (s) {
      var sep = h.r * 0.38 * e, rot = s * 0.22 * e, drop = h.r * 0.12 * e;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(nx * s * sep + h.dx * h.r * 0.25 * e, ny * s * sep + drop + h.dy * h.r * 0.25 * e);
      ctx.translate(h.x, h.y); ctx.rotate(rot); ctx.translate(-h.x, -h.y);
      // this side of the cut line
      ctx.beginPath();
      ctx.moveTo(h.x - cx * R, h.y - cy * R);
      ctx.lineTo(h.x + cx * R, h.y + cy * R);
      ctx.lineTo(h.x + cx * R + nx * s * R, h.y + cy * R + ny * s * R);
      ctx.lineTo(h.x - cx * R + nx * s * R, h.y - cy * R + ny * s * R);
      ctx.closePath();
      ctx.clip();
      try { h.draw(); } catch (err) { /* an animal's art not loaded yet */ }
      // the clean cut face: a white edge, nothing inside
      ctx.strokeStyle = "rgba(255,255,255,0.95)"; ctx.lineWidth = 5; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(h.x - cx * h.r * 1.3, h.y - cy * h.r * 1.3); ctx.lineTo(h.x + cx * h.r * 1.3, h.y + cy * h.r * 1.3); ctx.stroke();
      ctx.restore();
    });
    // the flash of the cut itself, across the gap
    if (h.t < 0.3) {
      var g = jpClamp(h.t / 0.06), L = h.r * 1.8;
      ctx.save(); ctx.lineCap = "round";
      ctx.globalAlpha = 1 - h.t / 0.3;
      ctx.strokeStyle = JP_INK; ctx.lineWidth = 12;
      ctx.beginPath(); ctx.moveTo(h.x - cx * L, h.y - cy * L); ctx.lineTo(h.x - cx * L + cx * 2 * L * g, h.y - cy * L + cy * 2 * L * g); ctx.stroke();
      ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 6;
      ctx.beginPath(); ctx.moveTo(h.x - cx * L, h.y - cy * L); ctx.lineTo(h.x - cx * L + cx * 2 * L * g, h.y - cy * L + cy * 2 * L * g); ctx.stroke();
      ctx.restore();
    }
  });
}

// The fighter card's move list (gallery.js).
function jpReactGalleryMoves(p, add) {
  var rc = p && p.react;
  if (!rc) return;
  if (rc.animals) add("🗡️", "Samurai vs animals", "As a samurai, any animal that comes for him (a bear, a lion, goats, a bull, an eagle) is cut clean in half.");
  if (rc.leprechauns) add("🍀", "Scares off leprechauns", "As a samurai, his whirlwind sends Conor's bus crew legging it back to the bus.");
}

// ---------------------------------------------------------------- the animals, as they look right now

// Each returns { x, y, r, draw } for jpAnimalCut: where the middle of it is
// and a function that draws it frozen at this moment (their own art).
function jpBearArt(B) {
  if (B.phase === "thrown") {
    var tx = B.x, ty = B.y - (B.z || 0), rot = Math.PI + (B.spin || 0);
    return { x: tx, y: ty, r: BEAR_SIDE_H * 0.45, draw: function () { drawBearSide(tx, ty, rot, 1); } };
  }
  if (B.moving) {
    var x = B.x, y = B.y - (B.z || 0), face = B.face;
    return { x: x, y: y, r: BEAR_SIDE_H * 0.45, draw: function () { drawBearSide(x, y, 0, face); } }; // (khabib-bear.js)
  }
  var sx = B.x, sy = B.y - BEAR_H * 0.1, sf = B.face;
  return { x: sx, y: sy, r: BEAR_H * 0.4, draw: function () { drawBearSprite(sx, sy, 0, sf, 1); } };
}
function jpLionArt(L) {
  var x = L.x, y = L.y - (L.z || 0), face = L.face, h = LION_SIDE_H;
  return { x: x, y: y, r: h * 0.55, draw: function () { drawLionPic(lionSideImg, LION_SIDE_ASPECT, x, y, h, face, -0.15); } }; // (nate-lion.js)
}
function jpGoatArt(g) {
  var x = g.x, y = g.y - (g.z || 0), face = g.face, r = GS_GOAT_R, tilt = Math.max(-0.4, Math.min(0.4, g.dy * 0.5)) * g.face;
  return { x: x, y: y, r: r * 1.3, draw: function () { // (as drawJonGoats draws it, jon.js)
    var im = goatImage();
    ctx.save(); ctx.translate(x, y); ctx.rotate(tilt); ctx.scale(face, 1);
    if (im) { var w = r * 2.6, h = w * JON_GOAT_ASPECT; ctx.drawImage(im, -w / 2, r * 0.95 - h, w, h); }
    else { ctx.fillStyle = "#1b1b1b"; ctx.beginPath(); ctx.ellipse(0, 0, r * 1.1, r * 0.7, 0, 0, Math.PI * 2); ctx.fill(); }
    ctx.restore();
  } };
}
function jpEsEagleArt(e) {
  var h = Math.abs(e.k - 0.5) * 2, x = e.x, y = e.y - h * h * 90, sc = 0.62 + 0.5 * h, ang = Math.atan2(e.dy, e.dx), flap = e.t * 16;
  return { x: x, y: y, r: 70 * sc, draw: function () { drawEagle(x, y, ang, sc, flap, true); } }; // (allamerican.js)
}
function jpSkEagleArt(e) {
  var x = e.x, y = e.y, ux = e.ux, uy = e.uy, flap = e.flap;
  var tilt = Math.max(-0.9, Math.min(0.9, (ux >= 0 ? 1 : -1) * Math.atan2(uy, Math.abs(ux) + 0.001) * 0.6));
  return { x: x, y: y, r: 60, draw: function () { ctx.save(); ctx.translate(x, y); ctx.rotate(tilt); drawEagle(0, 0, Math.atan2(uy, ux), 0.8, flap, true); ctx.restore(); } }; // (as strickland.js draws it)
}
function jpBullArt(b) {
  var x = b.x, y = b.y - (b.z || 0), face = b.face, spin = b.spin || 0, ko = b.ko, t = b.t;
  return { x: x, y: y - AF_BULL_R * 0.3, r: AF_BULL_R * 1.2, draw: function () { drawBull(x, y, AF_BULL_R, face, spin, ko, t, true); } }; // (aurafarm.js)
}
