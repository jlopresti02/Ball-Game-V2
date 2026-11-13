// Tony Ferguson's Burrito Bell power-up (Joe, 2026-11-13). Set under
// `ferguson.burrito` in his character file.
//
// Once a fight, a few seconds after his first Kaioken burns out (the
// Burrito Bell ad is on the jumbotron by then), or when he's hurt badly
// (`lowHp`), he pulls a Burrito Bell burrito out and eats it: three big
// bites, then the foil goes flying. While he's eating, a strike at him is
// BLOCKED (his free left glove snaps out and knocks them back) or DODGED
// (he slips it and sways back). Then the red aura explodes: KAIOKEN x10,
// for `time` seconds. He hits `damage` times harder and moves `speed` times
// faster, and he gets three Dragon Ball moves:
//   Barrage     (barrage) planted at range, both arms firing red ki blasts
//               one after the other, `time` seconds of them, then one big
//               blast to finish (`bigDamage`, into the cage). Each blast is
//               something fired at you: it can be slipped or blocked.
//   Teleports   (teleport) he zips round the ring every few seconds, and
//               teleports out of the way of `chance`% of strikes and
//               `projChance`% of anything fired at him (Charles's zip lines
//               and afterimage, instant-transmission.js).
//   Shell strike (shellStrike) on his `comboAt`th teleport dodge, and once
//               anyway at `at` seconds in, he teleports behind them, pulls
//               into his turtle shell and rams it into their back
//               (`damage`, into the cage). They never saw it coming.
//   Beam surf   (beamSurf) any time, when Charles's Kamehameha or Conor's
//               rainbow beam is about to hit him (`chance`%, always at x10),
//               he hops up onto it upside down and rides it all the way back
//               to whoever fired it (Goku on Kefla's blast in the Tournament
//               of Power), then hits them for `damage`, into the cage, and
//               their beam cuts out.
// Nothing hurts him inside the shell (Joe): the shell strike, like his shell.
// "KAIOKEN" is Goku's power-up and the ki barrage a Dragon Ball move, not
// quotes of his. Burrito Bell is the parody restaurant from his ad
// (burrito-bell-ad.js). Synth sounds for now, plus Joe's teleport clip.
"use strict";

var BUR_PULL = 0.45, BUR_BITES = [0.7, 1.05, 1.4], BUR_TOSS = 1.75, BUR_EAT = 2.2;
var BUR_PLANT = 0.3, BUR_END = 0.3, BUR_TUCK = 0.14, BUR_RAM = 0.2, BUR_OUT = 0.25;
var tfKi = [];      // ki blasts in flight
var tfKiPops = [];  // little bursts where they land
var tfFoil = [];    // the crumpled foil flying away

function tfBurCfg(b) { var c = tfCfg(b); return c && c.burrito; }
function tfMasOn(b) { return !!(b && b.tfMas); }

// From resetFerguson / initFerguson (ferguson.js).
function resetTfBurrito() { tfKi = []; tfKiPops = []; tfFoil = []; }
function initTfBurrito(b, cfg) {
  b.tfSurf = null;
  b.tfBur = null; b.tfMas = null; b.tfMasMove = null; b.tfBurDone = false;
  b.tfBurT = cfg.burrito ? tfRand(cfg.burrito.first) : Infinity;
}
// From tickKaioken (ferguson.js) as a Kaioken burns out: the burrito's next.
function tfBurritoAfterKaioken(b, cfg) {
  var bc = cfg.burrito;
  if (bc && !b.tfBurDone && bc.after) b.tfBurT = Math.min(b.tfBurT, tfRand(bc.after));
}
function tfWantBurrito(self, cfg) {
  var bc = cfg.burrito;
  if (!bc || self.tfBurDone || self.tfKaio || self.tfMas) return false;
  return self.tfBurT <= 0 || self.hp < MAX_HP * bc.lowHp;
}

// ---------------------------------------------------------------- eating it

function startTfBurrito(self) {
  clearActions(self);
  self.vx = 0; self.vy = 0;
  self.tfBurDone = true;
  self.tfBur = { t: 0, bites: 0, tossed: false, slip: null, block: null };
  floater(self.x, self.y - self.r - 30, "BURRITO BELL!", "note");
  crowdReact(0.4);
}
function runTfBurrito(self, other, cfg, dt) {
  var e = self.tfBur, bc = cfg.burrito;
  e.t += dt;
  self.vx = 0; self.vy = 0;
  if (e.block) { e.block.t += dt; if (e.block.t > 0.35) e.block = null; }
  if (e.slip) {
    // out to the side and back, still chewing
    var sl = e.slip; sl.t += dt;
    var k = Math.min(1, sl.t / 0.4), cur = Math.sin(k * Math.PI), step = (cur - sl.done) * 55;
    sl.done = cur;
    self.x = tfClamp(self.x + sl.x * step, self.r, W - self.r); self.y = tfClamp(self.y + sl.y * step, self.r, H - self.r);
    if (sl.t > 0.4) e.slip = null;
  }
  // They walk into him: eased out of his space, no bounce.
  var dx = other.x - self.x, dy = other.y - self.y, d = Math.sqrt(dx * dx + dy * dy) || 1;
  if (other.alive && d < self.r + other.r + 4 && !other.slam) {
    var push = self.r + other.r + 4 - d;
    other.x = tfClamp(other.x + dx / d * push, other.r, W - other.r); other.y = tfClamp(other.y + dy / d * push, other.r, H - other.r);
  }
  if (!e.chew && e.t >= BUR_BITES[0] - 0.05) { e.chew = true; withClip("burritoEat", function () { playClip("burritoEat", 0.95); }); } // Joe's eating noise over all three bites (a sound effect, not a voice line)
  if (e.bites < BUR_BITES.length && e.t >= BUR_BITES[e.bites]) {
    e.bites++;
    var mx = self.x + self.r * 0.3, my = self.y - self.r * 0.35;
    for (var i = 0; i < 7 && !reduceMotion; i++) {
      var a = -Math.PI / 2 + (Math.random() - 0.3) * 2.2, v = 60 + Math.random() * 120;
      particles.push({ x: mx, y: my, vx: Math.cos(a) * v, vy: Math.sin(a) * v + 40, life: 0.45, max: 0.45, size: 2 + Math.random() * 2.5, color: ["#eac17a", "#7cc142", "#e8432a", "#fbf7ec"][i % 4] });
    }
  }
  if (!e.tossed && e.t >= BUR_TOSS) {
    e.tossed = true;
    var side = self.x > W / 2 ? -1 : 1;
    tfFoil.push({ x: self.x + self.r * 0.9, y: self.y - self.r * 0.2, vx: side * 260, vy: -320, t: 0, max: 0.9, rot: 0 });
    playTfFoil();
  }
  if (e.t < BUR_EAT) return true;
  // KAIOKEN x10!
  self.tfBur = null;
  self.tfMas = { t: bc.time, max: bc.time, x: bc.x || 10, dodges: 0, cd: 0, pcd: 0, strikes: 0,
    moveT: tfRand(bc.teleport.every), barrageT: bc.barrage.at, barrages: 0, shellT: bc.shellStrike.at, shellDue: false };
  self.baseSpeed = self.tfBase.speed * bc.speed;
  self.atkRate = self.tfBase.atk * bc.attack;
  setSpeed(self, self.baseSpeed);
  floater(self.x, self.y - self.r - 30, "KAIOKEN x" + self.tfMas.x + "!", "crit"); // (Goku's power-up from Dragon Ball, not a quote of his)
  tfFlash = 0.45;
  if (!reduceMotion) shake = Math.max(shake, 14);
  crowdReact(1);
  playKaiokenUp();
  return false;
}

// From fergusonDodge (ferguson.js): eating, he blocks or slips strikes;
// powered up, he teleports out of the way. True if it doesn't land.
function tfBurritoDodge(b, source, attackerId) {
  if (attackerId == null || attackerId === b.id) return false;
  var atk = balls[attackerId], bc = tfBurCfg(b);
  if (!bc || !atk) return false;
  if (b.tfSurf) { b.justDodged = true; return true; } // up on the beam: nothing touches him
  if (b.tfMasMove && b.tfMasMove.kind === "shell") { // in the shell: it clanks off
    b.justDodged = true;
    if (source !== "laser" && b.immuneCd <= 0) { floater(b.x, b.y - b.r - 8, "SHELL", "dodge"); b.immuneCd = 0.3; playShellClank(false); }
    return true;
  }
  if (tfTrySurf(b, atk, bc)) return true;
  var hard = source === "laser" || source === "slam" || source === "grapple" || source === "finisher" || source === "flow" || source === "kofinal" || source === "slugfest";
  if (b.tfBur) {
    if (hard || source === "igbb") return false;
    var e = b.tfBur, dx = atk.x - b.x, dy = atk.y - b.y, d = Math.sqrt(dx * dx + dy * dy) || 1, ux = dx / d, uy = dy / d;
    b.justDodged = true;
    if (e.slip || e.block) return true; // already out of the way
    if (PROJECTILE_SOURCES[source] || Math.random() < 0.5) {
      e.block = { t: 0, x: ux, y: uy };
      if (!PROJECTILE_SOURCES[source]) {
        atk.punch = null; atk.kick = null; atk.swing = null; atk.jabAnim = null; atk.combo = null; atk.flow = null;
        atk.vx = ux * 380; atk.vy = uy * 380;
      }
      floater(b.x + ux * b.r, b.y - b.r - 30, "BLOCKED!", "dodge");
      playTfBlock();
    } else {
      var sd = Math.random() < 0.5 ? 1 : -1, px = -uy * sd, py = ux * sd;
      if (b.x + px * 70 < b.r || b.x + px * 70 > W - b.r || b.y + py * 70 < b.r || b.y + py * 70 > H - b.r) { px = -px; py = -py; }
      px -= ux * 0.4; py -= uy * 0.4;
      var pl = Math.sqrt(px * px + py * py) || 1;
      e.slip = { t: 0, done: 0, x: px / pl, y: py / pl };
      floater(b.x, b.y - b.r - 30, "DODGED!", "dodge");
      playTfSlip();
    }
    return true;
  }
  var m = b.tfMas;
  if (!m || hard || b.igbb || (b.tfMasMove && b.tfMasMove.kind !== "barrage") || subLocked(b) || b.grappled || b.grapple || b.slam || b.koOut) return false;
  var proj = !!PROJECTILE_SOURCES[source];
  if (!proj && source === "igbb") return false;
  var tc = bc.teleport;
  if (proj ? m.pcd > 0 : m.cd > 0) return false;
  if (Math.random() * 100 >= (proj ? tc.projChance : tc.chance)) return false;
  var spot = itSpot(b, atk, (b.r + atk.r) * 2.2);
  itTeleport(b, spot.x, spot.y); // Charles's zip lines, afterimage and teleport sound (instant-transmission.js)
  floater(b.x, b.y - b.r - 8, "DODGE", "dodge");
  b.justDodged = true;
  m.cd = tc.cd; m.pcd = tc.projCd;
  m.dodges++;
  if (m.dodges >= bc.shellStrike.comboAt) { m.dodges = 0; m.shellDue = true; }
  return true;
}

// ---------------------------------------------------------------- powered up

// Every frame (tickFerguson): the x10 burning down.
function tickTfMas(b, cfg, dt) {
  var m = b.tfMas;
  if (!m) return;
  m.cd = Math.max(0, m.cd - dt); m.pcd = Math.max(0, m.pcd - dt);
  // Burns down only while he's free to use it (not while he's dazed, held or flying).
  var held = b.dizzy || b.dazed || b.shocked || b.grappled || b.choked || b.slam || subLocked(b) || b.tfMasMove;
  if (!held) m.t -= dt;
  if (m.t > 0 && b.alive && !over) return;
  b.tfMas = null;
  b.baseSpeed = b.tfBase.speed; b.atkRate = b.tfBase.atk;
  if (b.alive && inOrdinaryMovement(b)) setSpeed(b, b.baseSpeed);
  if (b.alive && !over) playKaiokenDown();
}

// From updateFerguson once he's free to act: start a barrage or a shell
// strike, or zip somewhere else in the ring. True if a move started.
function tfMasAct(self, other, cfg, dt) {
  var m = self.tfMas, bc = cfg.burrito;
  if (!m || !other.alive || other.igbb || other.koOut || other.slam || other.grapple || other.grappled) return false;
  var elapsed = m.max - m.t;
  if (m.barrages < (bc.barrage.max || 1) && elapsed >= m.barrageT) { startTfBarrage(self, other, cfg); return true; }
  if (m.strikes < (bc.shellStrike.max || 2) && (m.shellDue || (m.strikes === 0 && elapsed >= m.shellT))) { startTfShellStrike(self, other, cfg); return true; }
  m.moveT -= dt;
  if (m.moveT <= 0 && !self.punch && !self.kick && !self.elbowAnim) {
    m.moveT = tfRand(bc.teleport.every);
    var spot = itSpot(self, other, (self.r + other.r) * 1.6);
    itTeleport(self, spot.x, spot.y);
  }
  return false;
}

function startTfBarrage(self, other, cfg) {
  var m = self.tfMas, bb = cfg.burrito.barrage;
  m.barrages++;
  clearActions(self);
  self.vx = 0; self.vy = 0;
  var dx = other.x - self.x, dy = other.y - self.y, d = Math.sqrt(dx * dx + dy * dy) || 1;
  // Too close: zips back out to range first.
  if (d < bb.range) {
    var best = null;
    for (var i = 0; i < 24; i++) {
      var x = self.r + Math.random() * (W - 2 * self.r), y = self.r + Math.random() * (H - 2 * self.r);
      var od = Math.sqrt((x - other.x) * (x - other.x) + (y - other.y) * (y - other.y));
      if (!best || Math.abs(od - bb.range) < Math.abs(best.d - bb.range)) best = { x: x, y: y, d: od };
    }
    itTeleport(self, best.x, best.y);
  }
  self.tfMasMove = { kind: "barrage", phase: "plant", t: 0, shot: 0, next: 0, hand: 1, recoil: [0, 0], ang: Math.atan2(other.y - self.y, other.x - self.x) };
  floater(self.x, self.y - self.r - 30, "KI BARRAGE!", "crit"); // (a Dragon Ball move, not a quote of his)
  withClip("kiCharge", function () { playClip("kiCharge", 0.8); }); // from Joe's ki barrage reference
}

function startTfShellStrike(self, other, cfg) {
  var m = self.tfMas;
  m.strikes++; m.shellDue = false;
  clearActions(self);
  var dx = other.x - self.x, dy = other.y - self.y, d = Math.sqrt(dx * dx + dy * dy) || 1;
  dx /= d; dy /= d;
  var gap = self.r + other.r + 70;
  // Behind them (carrying on past them from where he was); if the cage is in
  // the way, beside them instead.
  var opts = [[dx, dy], [-dy, dx], [dy, -dx], [-dx, -dy]], spot = null;
  for (var i = 0; i < opts.length && !spot; i++) {
    var x = other.x + opts[i][0] * gap, y = other.y + opts[i][1] * gap;
    if (x > self.r && x < W - self.r && y > self.r && y < H - self.r) spot = { x: x, y: y };
  }
  if (!spot) spot = { x: other.x + dx * gap, y: other.y + dy * gap };
  itTeleport(self, spot.x, spot.y);
  self.vx = 0; self.vy = 0;
  var hx = other.x - self.x, hy = other.y - self.y, hd = Math.sqrt(hx * hx + hy * hy) || 1;
  self.tfMasMove = { kind: "shell", phase: "tuck", t: 0, dx: hx / hd, dy: hy / hd, hit: false };
  playShellIn();
}

// From updateFerguson: the barrage or the shell strike running.
function runTfMasMove(self, other, cfg, dt) {
  var mv = self.tfMasMove, bc = cfg.burrito;
  mv.t += dt;
  self.vx = 0; self.vy = 0;
  if (over || !other.alive) { tfMasMoveEnd(self); return false; }
  if (mv.kind === "barrage") {
    var bb = bc.barrage;
    var ta = Math.atan2(other.y - self.y, other.x - self.x), da = Math.atan2(Math.sin(ta - mv.ang), Math.cos(ta - mv.ang));
    mv.ang += da * Math.min(1, dt * 6); // keeps turning after them, a little behind
    mv.recoil[0] = Math.max(0, mv.recoil[0] - dt * 9); mv.recoil[1] = Math.max(0, mv.recoil[1] - dt * 9);
    if (mv.phase === "plant") { if (mv.t >= BUR_PLANT) { mv.phase = "fire"; mv.t = 0; withClip("kiBarrage", function () { playClip("kiBarrage", 0.9); }); } return true; } // Joe's barrage sound, one play through the volley
    if (mv.phase === "fire") {
      mv.next -= dt;
      while (mv.next <= 0 && mv.t < bb.time) {
        mv.next += bb.every;
        mv.hand = -mv.hand;
        tfFireKi(self, mv, bb, false);
      }
      if (mv.t >= bb.time) { mv.phase = "big"; mv.t = 0; }
      return true;
    }
    if (mv.phase === "big") {
      // both palms together, one big one
      if (mv.t >= 0.32 && !mv.bigOut) { mv.bigOut = true; mv.recoil = [1, 1]; mv.ang = ta; tfFireKi(self, mv, bb, true); } // the big one straight at them
      if (mv.t >= 0.32 + BUR_END) { tfMasMoveEnd(self); return false; }
      return true;
    }
  }
  // the shell strike
  if (mv.phase === "tuck") { if (mv.t >= BUR_TUCK) { mv.phase = "ram"; mv.t = 0; playShellSpin(); } return true; }
  if (mv.phase === "ram") {
    var ss = bc.shellStrike, sp = ss.speed || 900;
    self.x = tfClamp(self.x + mv.dx * sp * dt, self.r, W - self.r); self.y = tfClamp(self.y + mv.dy * sp * dt, self.r, H - self.r);
    var ox = other.x - self.x, oy = other.y - self.y, od = Math.sqrt(ox * ox + oy * oy) || 1;
    if (!mv.hit && od < self.r + other.r + 6) {
      mv.hit = true;
      var dealt = hurt(other, ss.damage, "igbb", self.id); // from behind: they never saw it coming
      if (dealt > 0) {
        playPunch(dealt * 1.4); playShellClank(false);
        floater(other.x, other.y - other.r - 30, "SHELL STRIKE!", "crit");
        other.flash = 0.2;
        if (!reduceMotion) { shake = Math.max(shake, 18); hitStop = Math.max(hitStop, 0.1); }
        impacts.push({ x: (self.x + other.x) / 2, y: (self.y + other.y) / 2, nx: mv.dx, ny: mv.dy, life: 0.5, max: 0.5, color: "#9be27a" });
        crowdReact(1);
        if (other.alive && !other.grappled && !other.grapple && !other.slam && !other.koOut) beginWallSlam(other, mv.dx, mv.dy, { knockback: ss.knockback, wallSlams: ss.wallSlams, slamDamage: ss.slamDamage });
        checkEnd();
      }
      mv.phase = "out"; mv.t = 0;
      return true;
    }
    if (mv.t >= BUR_RAM) { mv.phase = "out"; mv.t = 0; }
    return true;
  }
  if (mv.t >= BUR_OUT) { tfMasMoveEnd(self); return false; }
  return true;
}
function tfMasMoveEnd(b) { b.tfMasMove = null; setSpeed(b, b.baseSpeed || SPEED); }

// From tfInterrupt (ferguson.js): grabbed, slammed, caught in a special.
function tfBurritoCancel(b) {
  if (b.tfBur) { b.tfBur = null; b.tfBurDone = false; b.tfBurT = 3; } // the burrito waits for the next quiet moment
  b.tfMasMove = null;
  b.tfSurf = null;
}

// ---------------------------------------------------------------- beam surf

var SURF_HOP = 0.3, SURF_HIT = 0.35;
// From tfBurritoDodge: a beam (hurtProjectile from the Kamehameha or the
// rainbow) about to hit him. True if he hops on it instead.
function tfTrySurf(b, atk, bc) {
  var sc = bc.beamSurf;
  if (!sc || !itProjHit || !atk.igbb || !(atk.igbb.move === "kamehameha" || atk.igbb.move === "rainbow")) return false;
  if (b.tfBur || b.grappled || b.grapple || b.slam || b.koOut || subLocked(b) || katanaOn(b)) return false;
  if (!b.tfMas && Math.random() * 100 >= sc.chance) return false;
  var dx = itProjHit.dx || (b.x - atk.x), dy = itProjHit.dy || (b.y - atk.y), d = Math.sqrt(dx * dx + dy * dy) || 1;
  clearActions(b);
  b.tfMasMove = null; b.tfShell = null; b.tfSlide = null; b.tfShot = null;
  b.vx = 0; b.vy = 0;
  b.tfSurf = { phase: "hop", t: 0, owner: atk.id, dx: dx / d, dy: dy / d, trail: 0 };
  b.justDodged = true;
  floater(b.x, b.y - b.r - 30, "BEAM SURF!", "crit"); // (Goku riding Kefla's blast, Dragon Ball Super)
  crowdReact(0.9);
  playTfSurfHop();
  return true;
}
// From updateFerguson.
function runTfSurf(self, other, cfg, dt) {
  var s = self.tfSurf, sc = cfg.burrito.beamSurf, own = balls[s.owner];
  s.t += dt;
  self.vx = 0; self.vy = 0;
  if (over || !own || !own.alive) { tfSurfEnd(self); return false; }
  if (s.phase === "hop") {
    // up onto the beam, flipping upside down: onto the line it's firing along
    var along = (self.x - own.x) * s.dx + (self.y - own.y) * s.dy, k = Math.min(1, dt * 14);
    self.x = tfClamp(self.x + (own.x + s.dx * along - self.x) * k, self.r, W - self.r);
    self.y = tfClamp(self.y + (own.y + s.dy * along - self.y) * k, self.r, H - self.r);
    if (s.t >= SURF_HOP) { s.phase = "ride"; s.t = 0; playTfSurfRide(); }
    return true;
  }
  if (s.phase === "ride") {
    // Down the beam toward them, riding the top of it.
    var ox = own.x - self.x, oy = own.y - self.y, od = Math.sqrt(ox * ox + oy * oy) || 1;
    var step = Math.min(od, sc.speed * dt);
    self.x = tfClamp(self.x + ox / od * step, self.r, W - self.r); self.y = tfClamp(self.y + oy / od * step, self.r, H - self.r);
    s.trail -= dt;
    if (s.trail <= 0 && !reduceMotion) {
      s.trail = 0.03;
      tfGhosts.push({ x: self.x, y: self.y, r: self.r, t: 0, max: 0.25, color: "#ff3b2b" });
      for (var i = 0; i < 3; i++) {
        var a = Math.atan2(-oy, -ox) + (Math.random() - 0.5) * 1.4, v = 120 + Math.random() * 200;
        particles.push({ x: self.x, y: self.y + self.r * 0.6, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 0.35, max: 0.35, size: 2 + Math.random() * 3, color: i % 2 ? "#ffffff" : "#ffe680" });
      }
    }
    od = Math.sqrt((own.x - self.x) * (own.x - self.x) + (own.y - self.y) * (own.y - self.y)) || 1;
    if (od < self.r + own.r + 8 || s.t > 1.6) {
      s.phase = "hit"; s.t = 0;
      var ux = ox / Math.sqrt(ox * ox + oy * oy || 1), uy = oy / Math.sqrt(ox * ox + oy * oy || 1);
      // Their beam cuts out (beam-clash.js knows how to end each one).
      var kind = own.igbb && BEAMS[own.igbb.move] ? own.igbb.move : null;
      if (kind) BEAMS[kind].end(own);
      var dealt = hurt(own, sc.damage * (self.tfMas ? cfg.burrito.damage : 1), "igbb", self.id);
      if (dealt > 0) {
        floater(own.x, own.y - own.r - 30, "SURF'S UP!", "crit");
        own.flash = 0.25;
        if (!reduceMotion) { shake = Math.max(shake, 22); hitStop = Math.max(hitStop, 0.12); }
        impacts.push({ x: own.x, y: own.y, nx: ux, ny: uy, life: 0.6, max: 0.6, color: "#ffd21f" });
        crowdReact(1);
        playTfKiHit(true);
        if (own.alive && !own.grappled && !own.grapple && !own.koOut) beginWallSlam(own, ux, uy, { knockback: sc.knockback, wallSlams: sc.wallSlams, slamDamage: sc.slamDamage });
        checkEnd();
      }
    }
    return true;
  }
  // flipping back over onto his feet
  if (s.t >= SURF_HIT) { tfSurfEnd(self); return false; }
  return true;
}
function tfSurfEnd(b) { b.tfSurf = null; setSpeed(b, b.baseSpeed || SPEED); }
function tfSurfK(s) { return s.phase === "hop" ? easeOut(s.t / SURF_HOP) : s.phase === "ride" ? 1 : 1 - easeOut(s.t / SURF_HIT); }
function tfSurfLift(s, r) { var k = tfSurfK(s); return (s.phase === "hop" ? Math.sin(Math.min(1, s.t / SURF_HOP) * Math.PI) * 0.6 + k * 0.25 : k * 0.25) * r; }

// From applyFergusonPose: upside down on the beam.
function applyTfSurfPose(b) {
  var s = b.tfSurf;
  if (!s || !b.alive) return false;
  ctx.translate(b.x, b.y - tfSurfLift(s, b.r)); ctx.rotate(Math.PI * tfSurfK(s)); ctx.translate(-b.x, -b.y);
  return true;
}
// From drawFerguson: the blast glowing under him like a board, and his own
// two arms flung out wide for balance (upside down, so his shoulders are
// below his middle).
function drawTfSurf(b, over) {
  var s = b.tfSurf;
  if (!s) return false;
  if (!over) return true; // drawn over the beam instead (drawTfKi)
  var r = b.r, size = (b.char.punch && b.char.punch.size) || 14, wob = Math.sin(performance.now() / 70) * 0.15;
  var k = tfSurfK(s), cy = b.y - tfSurfLift(s, r), flip = Math.cos(Math.PI * k);
  if (s.phase === "ride") {
    ctx.save();
    var g = ctx.createRadialGradient(b.x, b.y + r * 0.35, 0, b.x, b.y + r * 0.35, r * 1.4);
    g.addColorStop(0, "rgba(255,255,230,0.9)"); g.addColorStop(0.5, "rgba(255,200,80,0.5)"); g.addColorStop(1, "rgba(255,80,40,0)");
    ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(b.x, b.y + r * 0.35, r * 1.4, r * 0.6, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
  // on top of the beam: him again, upside down, over it
  ctx.save();
  applyTfSurfPose(b);
  drawFighterArt(ctx, b.x, b.y, b.r, b.char.look, theme.wall, { layout: "contained", name: b.char.name });
  ctx.restore();
  [-1, 1].forEach(function (sd) {
    var sx = b.x + sd * r * 0.6, sy = cy - r * 0.05 * flip;
    var a = (sd > 0 ? 0 : Math.PI) + sd * (0.35 + wob) * flip;
    var len = r * (0.55 + 0.45 * k);
    var hx = sx + Math.cos(a) * len, hy = sy + Math.sin(a) * len;
    strokeLimb(size * 0.6, armColor(b.char, sd), function () { ctx.moveTo(sx, sy); ctx.lineTo(hx, hy); });
    drawGloveAt(hx, hy, size * 0.75, b.char);
  });
  return true;
}
function playTfSurfHop() { tfAudio(function (ac, t) { caneTone(ac, t, "triangle", 300, 900, 0.2, 0.25); caneBurst(ac, t, 1800, 1.5, 0.25, 0.2); }); }
function playTfSurfRide() { tfAudio(function (ac, t) { caneBurst(ac, t, 1200, 0.7, 0.35, 1.0); caneTone(ac, t, "sawtooth", 140, 260, 0.12, 1.0); }); }

// One ki blast out of a palm (or the big one out of both).
function tfFireKi(self, mv, bb, big) {
  var a = mv.ang + (big ? 0 : (Math.random() - 0.5) * bb.spread), ca = Math.cos(mv.ang), sa = Math.sin(mv.ang);
  var side = big ? 0 : mv.hand, r = self.r;
  if (!big) mv.recoil[side > 0 ? 1 : 0] = 1;
  var hx = self.x + ca * r * 1.45 - sa * side * r * 0.45, hy = self.y + sa * r * 1.45 + ca * side * r * 0.45;
  tfKi.push({ x: hx, y: hy, vx: Math.cos(a) * bb.speed * (big ? 1.1 : 1), vy: Math.sin(a) * bb.speed * (big ? 1.1 : 1), owner: self.id, t: 0,
    r: big ? 18 : 8.5, dmg: big ? bb.bigDamage : bb.damage, big: big, trail: [] });
  mv.flash = big ? 1 : 0.6;
  if (big) playTfKi(true); // (the small ones are in the barrage clip)
}

// Every frame (tickFerguson): blasts flying, hitting, popping on the cage.
function tickTfKi(dt) {
  tfFoil.forEach(function (f) { f.t += dt; f.vy += 900 * dt; f.x += f.vx * dt; f.y += f.vy * dt; f.rot += dt * 14; });
  tfFoil = tfFoil.filter(function (f) { return f.t < f.max; });
  tfKiPops.forEach(function (p) { p.t += dt; });
  tfKiPops = tfKiPops.filter(function (p) { return p.t < p.max; });
  tfKi.forEach(function (k) {
    k.t += dt;
    k.trail.unshift({ x: k.x, y: k.y }); if (k.trail.length > 5) k.trail.pop();
    k.x += k.vx * dt; k.y += k.vy * dt;
    var o = balls[1 - k.owner], owner = balls[k.owner], bc = tfBurCfg(owner);
    if (!k.dead && o && o.alive && !over) {
      var dx = o.x - k.x, dy = o.y - k.y, d = Math.sqrt(dx * dx + dy * dy);
      if (d < o.r + k.r) {
        var sp = Math.sqrt(k.vx * k.vx + k.vy * k.vy) || 1, ux = k.vx / sp, uy = k.vy / sp;
        var dealt = hurt(o, k.dmg, "proj", k.owner);
        if (o.justDodged) return; // slipped or teleported: it flies on
        k.dead = true;
        tfKiPops.push({ x: k.x, y: k.y, t: 0, max: k.big ? 0.5 : 0.22, big: k.big });
        if (dealt > 0) {
          playTfKiHit(k.big);
          if (k.big) {
            floater(o.x, o.y - o.r - 30, "BIG BANG!", "crit"); // (a Dragon Ball blast, not a quote of his)
            if (!reduceMotion) { shake = Math.max(shake, 16); hitStop = Math.max(hitStop, 0.08); }
            impacts.push({ x: o.x, y: o.y, nx: ux, ny: uy, life: 0.5, max: 0.5, color: "#ffd21f" });
            crowdReact(0.9);
            var bb = bc && bc.barrage;
            if (bb && o.alive && !o.grappled && !o.grapple && !o.slam && !o.igbb && !o.koOut) beginWallSlam(o, ux, uy, { knockback: bb.bigKnockback, wallSlams: 1, slamDamage: bb.bigSlamDamage });
          } else if (!o.slam && !o.grapple && !o.grappled && !subLocked(o)) {
            o.vx += ux * 50; o.vy += uy * 50; // a nudge, never pinned
            o.flash = Math.max(o.flash || 0, 0.06);
          }
          checkEnd();
        }
      }
    }
    if (!k.dead && (k.x < -20 || k.x > W + 20 || k.y < -20 || k.y > H + 20)) k.dead = true;
    if (!k.dead && (k.x < 2 || k.x > W - 2 || k.y < 2 || k.y > H - 2)) { k.dead = true; tfKiPops.push({ x: tfClamp(k.x, 2, W - 2), y: tfClamp(k.y, 2, H - 2), t: 0, max: k.big ? 0.45 : 0.2, big: k.big }); }
  });
  tfKi = tfKi.filter(function (k) { return !k.dead; });
}

// ---------------------------------------------------------------- drawing

// Behind him (drawFergusonBehind): the x10 aura is the Kaioken's, bigger,
// with gold sparks.
function tfMasAuraScale(b) { return b.tfMas ? 1.22 : 1; }
function drawTfMasSparks(b) {
  if (!b.tfMas || reduceMotion) return;
  var t = performance.now() / 1000, r = b.r;
  ctx.save();
  for (var i = 0; i < 8; i++) {
    var p = (t * 2.1 + i * 0.173) % 1, a = i * 2.39 + t * 0.6, rr = r * (1.05 + 0.35 * p);
    ctx.globalAlpha = Math.sin(p * Math.PI);
    ctx.fillStyle = i % 2 ? "#ffe680" : "#ffffff";
    ctx.beginPath(); ctx.arc(b.x + Math.cos(a) * rr, b.y + Math.sin(a) * rr - p * r * 0.9, 2 + (i % 3), 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

// From drawFerguson: his own two arms while he eats, fires the barrage or
// rams the shell. True if it drew him.
function drawTfBurrito(b, other, ang) {
  var e = b.tfBur, mv = b.tfMasMove, r = b.r, size = (b.char.punch && b.char.punch.size) || 14;
  var shR = [b.x + r * 0.62, b.y - r * 0.05], shL = [b.x - r * 0.62, b.y - r * 0.05];
  if (e) {
    var t = e.t;
    // the left glove: up in guard, snapping out to block
    var lh = [b.x - r * 0.85, b.y - r * 0.55];
    if (e.block) {
      var bk = Math.sin(Math.min(1, e.block.t / 0.35) * Math.PI);
      lh = [lh[0] + (b.x + e.block.x * r * 1.5 - lh[0]) * bk, lh[1] + (b.y + e.block.y * r * 1.5 - lh[1]) * bk];
    }
    strokeLimb(size * 0.62, armColor(b.char, -1), function () { ctx.moveTo(shL[0], shL[1]); ctx.lineTo(lh[0], lh[1]); });
    drawGloveAt(lh[0], lh[1], size * 0.78, b.char);
    // the right glove: down to the hip, up to his mouth with the burrito, bites, the foil tossed
    var len = r * 1.5, eaten = 0, hx, hy;
    for (var i = 0; i < BUR_BITES.length; i++) if (t >= BUR_BITES[i]) eaten++;
    var bl = len * (1 - eaten * 0.2);
    var mouth = [b.x, b.y - r * 0.36], hip = [b.x + r * 1.0, b.y + r * 0.55], hold = [b.x + r * 1.25, b.y - r * 0.05];
    var bite = [mouth[0] + bl * 0.88, mouth[1] + 2]; // glove on the foil end, the open end at his mouth
    if (t < BUR_PULL) {
      var pk = t / BUR_PULL;
      if (pk < 0.4) { var a1 = easeOut(pk / 0.4); hx = shR[0] + (hip[0] - shR[0]) * a1 + r * 0.3 * a1; hy = shR[1] + (hip[1] - shR[1]) * a1; }
      else { var a2 = easeOut((pk - 0.4) / 0.6); hx = hip[0] + (hold[0] - hip[0]) * a2; hy = hip[1] + (hold[1] - hip[1]) * a2; }
    } else if (t < BUR_TOSS) {
      // to his mouth for each bite, back a little to chew
      var bt = t - BUR_PULL, ph = (bt % 0.35) / 0.35, near = ph < 0.35 ? easeOut(ph / 0.35) : 1 - easeOut((ph - 0.35) / 0.65) * 0.7;
      hx = hold[0] + (bite[0] - hold[0]) * near; hy = hold[1] + (bite[1] - hold[1]) * near;
    } else {
      var tk = Math.min(1, (t - BUR_TOSS) / (BUR_EAT - BUR_TOSS)), ft = easeOut(tk);
      hx = hold[0] + r * 0.4 * Math.sin(ft * Math.PI) ; hy = hold[1] - r * 0.4 * Math.sin(ft * Math.PI) + (shR[1] + r * 0.4 - hold[1]) * ft;
    }
    strokeLimb(size * 0.62, armColor(b.char, 1), function () { ctx.moveTo(shR[0], shR[1]); ctx.quadraticCurveTo(shR[0] + r * 0.45, shR[1] + r * 0.4, hx, hy); });
    if (t >= BUR_PULL * 0.4 && !e.tossed) {
      // held by the foil end, the open end toward his mouth (drawBurrito, burrito-bell-ad.js)
      var grow = Math.min(1, (t - BUR_PULL * 0.4) / 0.15);
      drawBurrito(hx - bl * 0.4 * grow, hy - 2, bl * grow, Math.PI + 0.08, 1.2);
    }
    drawGloveAt(hx, hy, size * 0.78, b.char); // over the foil, holding it
    // chewing: cheeks puffing
    if (eaten > 0 && t < BUR_EAT) {
      var cw = Math.abs(Math.sin(t * 18)) * 2.5;
      ctx.save(); ctx.fillStyle = "rgba(0,0,0,0.18)";
      ctx.beginPath(); ctx.ellipse(b.x - r * 0.28, b.y - r * 0.28, 4 + cw, 3 + cw * 0.5, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(b.x + r * 0.28, b.y - r * 0.28, 4 + cw, 3 + cw * 0.5, 0, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }
    return true;
  }
  if (!mv) return false;
  if (mv.kind === "shell") {
    var k = mv.phase === "tuck" ? { phase: "in", t: mv.t } : mv.phase === "ram" ? { phase: "spin", t: mv.t } : { phase: "out", t: mv.t };
    drawTfShell(b, k);
    return true;
  }
  // The barrage: arms punching out one after the other, palms open, a flash
  // at each palm as it fires.
  var ca = Math.cos(mv.ang), sa = Math.sin(mv.ang), px = -sa, py = ca;
  var plant = mv.phase === "plant" ? Math.min(1, mv.t / BUR_PLANT) : 1;
  [-1, 1].forEach(function (s) {
    var sx = b.x + px * s * r * 0.55 + ca * r * 0.1, sy = b.y + py * s * r * 0.55 + sa * r * 0.1;
    var ext;
    if (mv.phase === "plant") ext = 0.35 - 0.3 * plant;            // pulled back, gathering it
    else if (mv.phase === "big") ext = mv.t < 0.32 ? 0.1 : 1.0;   // both palms together for the big one
    else ext = 0.55 + 0.45 * mv.recoil[s > 0 ? 1 : 0];             // the firing arm snapped out
    var spread = mv.phase === "big" ? 0.12 : 0.45;
    var hx2 = b.x + ca * r * (0.8 + 0.75 * ext) + px * s * r * spread, hy2 = b.y + sa * r * (0.8 + 0.75 * ext) + py * s * r * spread;
    strokeLimb(size * 0.62, armColor(b.char, s), function () { ctx.moveTo(sx, sy); ctx.lineTo(hx2, hy2); });
    drawGloveAt(hx2, hy2, size * 0.78, b.char, mv.ang);
    // the energy in the palm
    var glow = mv.phase === "plant" ? plant * 0.7 : mv.phase === "big" ? (mv.t < 0.32 ? 0.6 + mv.t * 1.5 : Math.max(0, 1 - (mv.t - 0.32) / BUR_END)) : 0.35 + 0.65 * mv.recoil[s > 0 ? 1 : 0];
    var gx = hx2 + ca * size * 0.7, gy = hy2 + sa * size * 0.7, gr = size * (0.6 + 0.9 * glow) * (mv.phase === "big" && mv.t < 0.32 ? 1.6 : 1);
    var g = ctx.createRadialGradient(gx, gy, 0, gx, gy, gr);
    g.addColorStop(0, "rgba(255,255,230," + (0.95 * glow) + ")"); g.addColorStop(0.4, "rgba(255,200,60," + (0.8 * glow) + ")"); g.addColorStop(1, "rgba(255,40,20,0)");
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(gx, gy, gr, 0, Math.PI * 2); ctx.fill();
  });
  return true;
}

// Over the fighters (drawFergusonOver): ki blasts, their pops, the foil.
function drawTfKi() {
  balls.forEach(function (b) { if (b.tfSurf && b.alive) drawTfSurf(b, true); }); // Tony riding a beam, on top of it
  tfFoil.forEach(function (f) {
    ctx.save(); ctx.translate(f.x, f.y); ctx.rotate(f.rot);
    ctx.fillStyle = "#c9d0d6"; ctx.strokeStyle = "#6f7a83"; ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (var i = 0; i < 9; i++) { var a = i / 9 * Math.PI * 2, rr = 7 + (i % 2 ? 2.5 : -1); ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); }
    ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "rgba(255,255,255,0.7)"; ctx.beginPath(); ctx.arc(-2, -2, 2.5, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  });
  tfKi.forEach(function (k) {
    ctx.save();
    k.trail.forEach(function (p, i) {
      var a = 0.35 * (1 - i / k.trail.length);
      ctx.fillStyle = "rgba(255,80,40," + a + ")";
      ctx.beginPath(); ctx.arc(p.x, p.y, k.r * (1 - i * 0.12), 0, Math.PI * 2); ctx.fill();
    });
    var g = ctx.createRadialGradient(k.x, k.y, 0, k.x, k.y, k.r * 1.8);
    g.addColorStop(0, "rgba(255,255,240,1)"); g.addColorStop(0.35, "rgba(255,215,80,0.95)"); g.addColorStop(0.7, "rgba(255,60,30,0.6)"); g.addColorStop(1, "rgba(255,30,20,0)");
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(k.x, k.y, k.r * 1.8, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  });
  tfKiPops.forEach(function (p) {
    var u = p.t / p.max, rr = (p.big ? 46 : 16) * (0.4 + u);
    ctx.save(); ctx.globalAlpha = 1 - u;
    var g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, rr);
    g.addColorStop(0, "rgba(255,255,230,1)"); g.addColorStop(0.5, "rgba(255,170,50,0.8)"); g.addColorStop(1, "rgba(255,40,20,0)");
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, rr, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  });
}

// ---------------------------------------------------------------- gallery and sound

function fergusonBurritoInfo(f) {
  var bc = f.burrito;
  return "Once a fight, after his first Kaioken burns out (or when he's badly hurt), he eats a Burrito Bell burrito: strikes at him while he eats are blocked or slipped. Then KAIOKEN x" + (bc.x || 10) + " for " + secs(bc.time) + ": " +
    Math.round((bc.damage - 1) * 100) + "% harder and " + Math.round((bc.speed - 1) * 100) + "% faster, teleporting round the ring and out of the way of " + bc.teleport.chance + "% of strikes and " + bc.teleport.projChance + "% of projectiles. " +
    "He fires a ki barrage (" + bc.barrage.damage + " a blast, then a big one for " + bc.barrage.bigDamage + " into the cage), and teleports behind them to ram his turtle shell into their back (" + bc.shellStrike.damage + ", into the cage), and nothing hurts him inside the shell." + (bc.beamSurf ? " Any time a Kamehameha or a rainbow beam comes at him (" + bc.beamSurf.chance + "%, always at x10) he hops on it upside down, surfs it back to whoever fired it and hits them for " + bc.beamSurf.damage + ", into the cage." : "");
}

function playTfFoil() { tfAudio(function (ac, t) { for (var i = 0; i < 5; i++) caneBurst(ac, t + i * 0.03, 5200 - i * 400, 2.5, 0.12, 0.04); }); }
function playTfBlock() { tfAudio(function (ac, t) { caneTone(ac, t, "sine", 140, 70, 0.4, 0.1); caneBurst(ac, t, 900, 1.2, 0.3, 0.06); }); }
function playTfKi(big) {
  tfAudio(function (ac, t) {
    if (big) { caneTone(ac, t, "sawtooth", 320, 60, 0.22, 0.5); caneBurst(ac, t, 700, 0.8, 0.5, 0.4); return; }
    caneTone(ac, t, "square", 1100 + Math.random() * 300, 380, 0.035, 0.07); caneBurst(ac, t, 2400, 1.5, 0.07, 0.05);
  });
}
function playTfKiHit(big) {
  tfAudio(function (ac, t) {
    if (big) { caneTone(ac, t, "sine", 120, 40, 0.7, 0.45); caneBurst(ac, t, 400, 0.7, 0.7, 0.5); return; }
    caneBurst(ac, t, 900 + Math.random() * 400, 1, 0.16, 0.06); caneTone(ac, t, "sine", 160, 80, 0.12, 0.05);
  });
}
