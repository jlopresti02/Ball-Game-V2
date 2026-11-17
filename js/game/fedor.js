// Fedor Emelianenko, "The Last Emperor" (Christian, 2026-11-13). Heavyweight.
// PRIDE heavyweight champion, Combat Sambo. Slow feet, very fast heavy hands,
// a wall of takedown defense, and every so often a Sambo throw into the
// fastest ground and pound in the game. He barely reacts to being hit.
// Everything here is tuned from the `fedor` key in
// characters/fedor-emelianenko.json (leave a block out and that part is off);
// his punch, combos, takedown defense and block are the normal blocks in the
// same file.
//
// Hands       (fedor.hands) his punches come off alternating hands, with
//             speed lines behind each fist and a whip of air as it goes out.
//             The numbers are his normal `punch` block (fast and heavy for a
//             heavyweight); `combos` strings them into jab, cross, hook.
// Feet        char.speedMult: slower than a heavyweight rolls, nearly as slow
//             as Ngannou.
// TDD         the plain `tdd` block: he sprawls `sprawlChance`% of shots
//             ("STUFFED") and punches straight back (ilia.js).
// Sambo throw (fedor.throw) first after `first` seconds, then every `every`,
//             when they're within `range` (edge to edge) he plants, drops his
//             level and reaches out with both arms for `reach` seconds (the
//             tell), then steps in for the clinch. Out of reach it's a
//             "WHIFF". They break free `escape`% of the time (plus
//             `grapplerEscape` for a Grappler, `weaveEscape` for a weaver, and
//             `tddScale` of their own sprawl), less the lighter they are than
//             him ("BREAKS FREE"). Otherwise he locks his arms round them and
//             throws them over his hip for `damage` ("SAMBO THROW!", a
//             takedown on the jumbotron). Then `gnpChance`% of the time he
//             follows them down (below), otherwise they both get up.
// Ground and  (fedor.gnp) the PRIDE flurry: he lands on top and drops
//  pound      `punches` punches, `damage` each and `lastDamage` for the last,
//             wound up in only `wind` seconds each (`lastWind` for the last),
//             so they come down far quicker than anyone else's. It runs on the
//             guillotine's ground and pound (bjj.js), like Jon Jones's. They
//             can't slip or block them.
// Armbar      `gnp.armbarChance`% of the time the flurry ends with him
//             switching to the armbar (armbar.js), his finish on Mark Coleman
//             (PRIDE 2004 and PRIDE 32). They tap `armbar.tapBase`% at full
//             health, plus up to `armbar.tapLowHp`% more the more hurt they are.
// The calm    (fedor.stoic) he barely reacts to being hit: punches and kicks
//             knock him back `knockback` as far as anyone else, he shakes off
//             a dizzy in `dizzy` of the time, a launch into the walls
//             pinballs him `slamCut` fewer times, and the squash of a hit
//             shrinks to `squash`. Trash talk doesn't get to him: Conor's
//             lines and Hokit's thumbs down `taunts`% of the time, Conor's
//             press conference `furious`% ("UNBOTHERED", fedorShrugs). When
//             one shot takes `noteAt` or more off him, at most once every
//             `noteGap` seconds, "UNFAZED" and a low church bell.
// Mantra      (fedor.mantra) a quiet, low Russian Orthodox-style choir under
//             the whole fight while he's in it: basses holding a drone with a
//             slow chant over it, made in code (no recording). It's tuned to
//             the key of whichever background loop is playing, sits at `level`
//             of the crowd's quietest murmur so it's never louder than the
//             crowd, and follows what the music does (fdMantraRide): it ducks
//             to `duck` under a voice line or a jumbotron ad, and drops out
//             while a special holds the music off or plays its own song (Do
//             Bronx, Down Under, Desperado, Free Bird, the Death Star). With
//             the music off it plays in D. `on` false switches it off.
// Voice lines (fedor.lines) empty named slots read with say(): `start`,
//             `win`, `unfazed`, `armbar`. A line with no clip is silent, so
//             empty slots are safe; Christian picks the real lines.
// Special     The Unmoving Man (Joe, 2026-11-15): fedor-unmoving.js.
// Emperor     (fedor.emperor) once a fight he crowns himself the Emperor: a
//             short cut with a hand mirror and a little gold crown, then his
//             strikes crit and they're shook. An extra ability on its own
//             clock, not his special: fedor-emperor.js.
//
// The throw runs on b.fd.act, the ground and pound on the opponent's guillo.
"use strict";

var FD_SHOOT = 720;       // stepping in for the clinch
var FD_SHOOT_MAX = 0.2;
var FD_LOCK = 0.22;       // arms locking round them
var FD_DOWN = 0.4;        // lying there after a throw he doesn't follow down
var FD_REACH = 0.78;      // how close he holds them in the clinch (1 = just touching)
var FD_STEEL = "#4f6d99"; // speed lines and the cold flash on UNFAZED (reads on the light mat and the dark stands)

function fdCfg(b) { return b && b.char && b.char.fedor; }
function fdRand(r) { return r[0] + Math.random() * (r[1] - r[0]); }
function fdDist(a, b) { var dx = b.x - a.x, dy = b.y - a.y; return Math.sqrt(dx * dx + dy * dy) || 1; }
function fdGap(a, b) { return fdDist(a, b) - a.r - b.r; }

// From startMatchSeeded.
function resetFedor() { stopFdMantra(0.25); }
// From makeBall (after applyWeight).
function initFedor(b) {
  b.fd = null;
  initFedorEmperor(b); // the Emperor, once a fight (fedor-emperor.js)
  var cfg = fdCfg(b);
  if (!cfg) return;
  b.fd = {
    t: 0, act: null, hand: 1, lastPunch: null, gnp: null,
    throwT: cfg.throw ? fdRand(cfg.throw.first) : Infinity,
    hpPrev: b.hp, vxPrev: 0, vyPrev: 0, slamSeen: null, dizzySeen: null, noteCd: 0,
    opened: false, openAt: cfg.lines && cfg.lines.startAt ? fdRand(cfg.lines.startAt) : 1, won: false
  };
  // Gets the mantra ready while the fight's being set up, so it's there from the bell.
  if (cfg.mantra && cfg.mantra.on) renderFdMantra(cfg.mantra.followKey === false ? "off" : musicChoice, function () {});
}

// Held by something else: grabbed, slammed, choked, knocked out, dizzy...
function fdHeld(b) {
  return !b.alive || b.grappled || b.grapple || b.slam || b.sprawl || b.sprawled || subLocked(b) || b.koOut || b.koRush ||
    b.shocked || b.dazed || b.dizzy || b.shelled || b.checkStun > 0 || b.koDuel || b.igbb;
}
// Planted for the throw: the speed regulator leaves him alone (physics.js).
function fedorBusy(b) { return !!(b && b.fd && b.fd.act); }
// His hands are drawn by drawFedor / drawFedorOver (drawHands skips them, draw-attacks.js).
function fedorHandsBusy(b) { return !!(b && b.fd && b.fd.act && b.alive); }

// Someone he can clinch and throw right now.
function fdThrowable(o) {
  if (!o.alive || o.koOut || o.invincible || o.grappled || o.grapple || o.slam || o.sprawl || o.sprawled || subLocked(o) || o.slamSafe > 0 || o.cheater) return false;
  if (specialBusy(o) || o.bearHeld || o.torHeld || doBronxPosing(o) || o.shocked || o.beamPin) return false;
  return inOrdinaryMovement(o) || !!o.dizzy;
}
function fdCanAct(self, other) {
  if (!inOrdinaryMovement(self) || self.punch || self.kick || self.koPunch || self.cmb || specialBusy(self) || swordDuelActive()) return false;
  return fdThrowable(other);
}

// ---------------------------------------------------------------- every frame

// From update(): the clock, alternating hands, the calm, the ground and pound
// coming down fast, the armbar off it, his lines and the mantra.
function tickFedor(dt) {
  balls.forEach(function (b) {
    var m = b.fd, cfg = fdCfg(b), other = balls[1 - b.id];
    if (!m) return;
    if (started && !over && b.alive) m.t += dt;
    if (m.noteCd > 0) m.noteCd -= dt;
    // Something took him over mid-throw (a projectile still in the air, a
    // bear): whoever he had hold of is let go.
    if (m.act && m.act.vicId != null && (fdHeld(b) || b.bearHeld || b.torHeld)) fdEndAct(b, other, m);
    fdHands(b, m, cfg);
    fdStalk(b, other, cfg, dt);
    fdStoic(b, m, cfg, dt);
    fdGnpWatch(b, other, m, cfg);
    fdLines(b, other, m, cfg);
    tickFedorEmperor(b, other, dt); // the Emperor's cut, his reign, the crown, them shook (fedor-emperor.js)
  });
  tickFdMantra();
}

// A new punch: off the other hand from the last one, with a whip of air.
function fdHands(b, m, cfg) {
  if (!b.punch || b.punch === m.lastPunch) return;
  m.lastPunch = b.punch;
  if (cfg.hands && cfg.hands.alternate && b.punch.side == null) { b.punch.side = m.hand; m.hand = -m.hand; }
  if (cfg.hands && cfg.hands.whip) playFdWhip();
}

// He walks them down: slow, but always turning back toward them.
function fdStalk(b, other, cfg, dt) {
  var sk = cfg.stalk;
  if (!sk || !started || over || !b.alive || !other.alive || other.invincible || !inOrdinaryMovement(b) || b.dizzy || b.speedEase) return;
  var dx = other.x - b.x, dy = other.y - b.y, d = Math.sqrt(dx * dx + dy * dy) || 1;
  if (d - b.r - other.r < sk.minGap) return;
  var sp = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
  if (sp < 1) return;
  var cur = Math.atan2(b.vy, b.vx), want = Math.atan2(dy, dx);
  var diff = Math.atan2(Math.sin(want - cur), Math.cos(want - cur)), step = Math.max(-sk.turn * dt, Math.min(sk.turn * dt, diff));
  b.vx = Math.cos(cur + step) * sp; b.vy = Math.sin(cur + step) * sp;
}

// The Last Emperor's calm: less knockback, a quick dizzy, fewer bounces off
// the walls, and UNFAZED when a big one lands.
function fdStoic(b, m, cfg, dt) {
  var st = cfg.stoic, dealt = m.hpPrev - b.hp;
  if (st && b.alive) {
    if (b.slam && b.slam !== m.slamSeen) {
      m.slamSeen = b.slam;
      if (st.slamCut > 0) b.slam.hitsLeft = Math.max(1, b.slam.hitsLeft - st.slamCut);
    }
    if (b.dizzy && b.dizzy !== m.dizzySeen) { m.dizzySeen = b.dizzy; b.dizzy.t *= st.dizzy; }
    // A hit landed this frame: only part of the knockback it gave him sticks.
    var nearWall = b.x < b.r + 3 || b.x > W - b.r - 3 || b.y < b.r + 3 || b.y > H - b.r - 3;
    if (dealt > 0.001 && st.knockback < 1 && !nearWall && !b.slam && !b.grappled && !subLocked(b) && !b.dizzy && !fedorBusy(b)) {
      b.vx = m.vxPrev + (b.vx - m.vxPrev) * st.knockback;
      b.vy = m.vyPrev + (b.vy - m.vyPrev) * st.knockback;
      if (b.knockFly > 0) b.knockFly *= st.knockback;
    }
    // He doesn't flinch: whatever squashes him on impact (not the walls) barely shows.
    if (b.squash && b.squash !== m.squashSeen) { m.squashSeen = b.squash; if (!b.slam && st.squash != null) b.squash.t *= st.squash; }
    if (dealt >= st.noteAt && b.hp > 0 && m.noteCd <= 0 && started && !over) {
      m.noteCd = st.noteGap;
      floater(b.x, b.y - b.r - 70, "UNFAZED", "crit");
      m.chill = 0.6;
      if (st.bell) playFdBell();
      fdSay(b, cfg, "unfazed");
    }
  }
  if (m.chill > 0) m.chill = Math.max(0, m.chill - dt);
  m.hpPrev = b.hp; m.vxPrev = b.vx; m.vyPrev = b.vy;
}

// His ground and pound comes down fast, and may end in the armbar.
function fdGnpWatch(b, other, m, cfg) {
  var g = m.gnp;
  if (!g) return;
  var gc = cfg.gnp;
  if (other.guillo === g) {
    if (g.gp && !g.gp.fdFast) { g.gp.fdFast = true; g.gp.wind = g.gp.last ? gc.lastWind : gc.wind; }
    return;
  }
  // The flurry's over (the guillotine's ground and pound let them up).
  m.gnp = null;
  if (!g.fdArmbar || over || !b.alive || !other.alive || b.armbar || subLocked(other) || other.grappled) return;
  beginArmbar(b, other);
  if (!b.armbar) return;
  var ab = cfg.armbar || {}, hurtFrac = 1 - Math.max(0, Math.min(1, other.hp / MAX_HP));
  var tap = Math.min(95, (ab.tapBase || 0) + (ab.tapLowHp || 0) * hurtFrac);
  tap = conorTapChance(other, tap, ab); // Conor McGregor taps easier, more once he's gassed (conor.js)
  b.armbar.taps = Math.random() * 100 < tap;
  crowdReact(0.6);
  fdSay(b, cfg, "armbar");
}

// From conor.js (trash talk, the press conference) and hokit.js (the thumbs
// down) when they'd make him angry: `stoic.taunts`% of the time (`furious`,
// the press conference: `stoic.furious`%) it doesn't get to him. True when it
// doesn't.
function fedorShrugs(b, furious) {
  var st = fdCfg(b) && fdCfg(b).stoic;
  if (!b.fd || !st || !b.alive || Math.random() * 100 >= (furious ? st.furious || 0 : st.taunts || 0)) return false;
  floater(b.x, b.y - b.r - 26, "UNBOTHERED", "note");
  return true;
}

function fdSay(b, cfg, key) {
  var ln = cfg.lines && cfg.lines[key];
  if (!ln || !ln.length || !canSay(b)) return;
  var line = pickLine(b, ln, key);
  if (line) say(b, line);
}

// His lines: one to open the fight, one when he wins. Empty slots stay quiet.
function fdLines(b, other, m, cfg) {
  if (started && !over && b.alive && !m.opened && m.t >= m.openAt) {
    m.opened = true;
    var lc = cfg.lines || {};
    if (Math.random() * 100 < (lc.startChance != null ? lc.startChance : 100)) fdSay(b, cfg, "start");
  }
  if (over && b.alive && !other.alive && !m.won && !speaking(b)) { m.won = true; fdSay(b, cfg, "win"); }
}

// ---------------------------------------------------------------- the Sambo throw

// From updateAbilities: true while he's in the middle of a throw.
function updateFedor(self, other, dt) {
  var m = self.fd;
  if (!m) return false;
  var cfg = fdCfg(self);
  if (updateFedorEmperor(self, other, dt)) return true; // crowning himself the Emperor (fedor-emperor.js)
  if (m.act) {
    if (!self.alive || !other.alive || over || self.bearHeld || self.torHeld) { fdEndAct(self, other, m); return false; }
    if (m.act.phase === "reach" || m.act.phase === "shoot") {
      if (fdHeld(self)) { m.act = null; return false; }
      return fdRunReach(self, other, m, cfg, dt);
    }
    return fdRunThrow(self, other, m, cfg, dt);
  }
  if (fdHeld(self) || !started || over || !other.alive || !cfg.throw) return false;
  m.throwT -= dt;
  if (m.throwT > 0 || fdGap(self, other) > cfg.throw.range || !fdCanAct(self, other)) return false;
  self.punch = null; self.jabAnim = null;
  m.act = { phase: "reach", t: 0, ang: Math.atan2(other.y - self.y, other.x - self.x) };
  self.vx = 0; self.vy = 0;
  playFdGrip();
  return true;
}

// The tell: he drops his level and reaches out with both arms, then steps in.
function fdRunReach(self, other, m, cfg, dt) {
  var a = m.act, tc = cfg.throw;
  a.t += dt;
  var dx = other.x - self.x, dy = other.y - self.y, d = Math.sqrt(dx * dx + dy * dy) || 1, ux = dx / d, uy = dy / d;
  var gap = d - self.r - other.r;
  a.ang = Math.atan2(dy, dx);
  if (a.phase === "reach") {
    self.vx = 0; self.vy = 0;
    if (a.t < tc.reach) return true;
    a.phase = "shoot"; a.t = 0;
    playWhoosh();
  }
  if (gap > 4 && a.t < FD_SHOOT_MAX) { self.vx = ux * FD_SHOOT; self.vy = uy * FD_SHOOT; return true; }
  self.vx = 0; self.vy = 0;
  m.act = null;
  m.throwT = fdRand(tc.every);
  if (!fdThrowable(other) || gap > 14) {
    if (gap > 14) floater(other.x, other.y - other.r - 8, "WHIFF", "dodge");
    if (self.alive && inOrdinaryMovement(self)) setSpeed(self, self.baseSpeed || SPEED);
    return false;
  }
  if (Math.random() * 100 < fdEscape(self, other, tc)) {
    floater(other.x, other.y - other.r - 30, "BREAKS FREE", "note");
    other.vx += ux * 280; other.vy += uy * 280;
    self.vx = -ux * 200; self.vy = -uy * 200;
    playWhoosh();
    return false;
  }
  fdLock(self, other, m);
  return true;
}

// How often they get out of the clinch.
function fdEscape(self, other, tc) {
  if (other.dizzy) return tc.escapeDizzy != null ? tc.escapeDizzy : 5;
  var esc = tc.escape;
  if (other.char.hasGrapple) esc += tc.grapplerEscape || 0;
  if (other.char.hasWeave) esc += tc.weaveEscape || 0;
  var spr = other.char.tdd && other.char.tdd.sprawlChance ? other.char.tdd.sprawlChance : (other.char.hasGrapple ? other.char.grapple.sprawlChance || 0 : 0);
  esc += spr * (tc.tddScale || 0);
  esc *= grappleScale(other, self); // a lighter fighter is easier to throw (weight.js)
  return Math.max(5, Math.min(90, esc));
}

// The clinch: arms locked round them, then over the hip.
function fdLock(self, other, m) {
  var side = other.x >= self.x ? 1 : -1, reach = (self.r + other.r) * FD_REACH;
  // Room to throw them over to the other side, and up over his hip.
  self.x = Math.max(reach + other.r + 2, Math.min(W - reach - other.r - 2, self.x));
  self.y = Math.max(self.y, reach * 1.15 + other.r + 4);
  m.act = { phase: "lock", t: 0, side: side, reach: reach, vicId: other.id, e: 0 };
  other.choked = true;
  other.dizzy = null; // (thrown, not staggering)
  [self, other].forEach(function (b) {
    b.vx = 0; b.vy = 0;
    b.punch = null; b.kick = null; b.throwAnim = null; b.swing = null; b.checkAnim = null; b.jabAnim = null;
  });
  other.x = self.x + side * reach; other.y = self.y;
  playFdGrip();
}

function fdRunThrow(self, other, m, cfg, dt) {
  var a = m.act, tc = cfg.throw, s = a.side;
  a.t += dt;
  self.vx = 0; self.vy = 0; other.vx = 0; other.vy = 0;
  if (a.phase === "lock") {
    other.x = self.x + s * a.reach; other.y = self.y;
    if (a.t < FD_LOCK) return true;
    a.phase = "throw"; a.t = 0;
    floater(self.x, self.y - self.r - 60, "SAMBO THROW!", "crit");
    playWhoosh();
    crowdReact(0.4);
  }
  if (a.phase === "throw") {
    // Up over his hip in an arc, slow up and fast down, head first.
    var k = Math.min(1, a.t / tc.lift);
    a.e = k < 0.55 ? k / 0.55 * 0.45 : 0.45 + Math.pow((k - 0.55) / 0.45, 2) * 0.55;
    var ang = Math.PI * a.e;
    other.x = self.x + s * Math.cos(ang) * a.reach;
    other.y = self.y - Math.sin(ang) * a.reach * 1.15;
    if (k < 1) return true;
    // Down on the other side.
    other.x = self.x - s * a.reach; other.y = self.y;
    guilloImpact(self, other, tc.damage, true); // flattened, a shockwave, the slam (bjj.js)
    if (typeof recordTakedown === "function") recordTakedown(self.id);
    floater(other.x, other.y - other.r - 30, "TAKEDOWN", "note");
    crowdReact(0.8);
    checkEnd();
    if (!other.alive || over) { fdEndAct(self, other, m); return false; }
    if (cfg.gnp && Math.random() * 100 < tc.gnpChance) { fdStartGnp(self, other, m, cfg, s); return false; }
    a.phase = "down"; a.t = 0;
    return true;
  }
  // Lying there for a moment, then both get up.
  other.x = self.x - s * a.reach; other.y = self.y;
  if (a.t < FD_DOWN) return true;
  fdEndAct(self, other, m);
  other.vx = -s * SPEED * 0.55; other.vy = -SPEED * 0.25;
  self.vx = s * SPEED * 0.35; self.vy = SPEED * 0.15;
  return false;
}

function fdEndAct(self, other, m) {
  var a = m.act;
  m.act = null;
  if (a && a.vicId != null) balls[a.vicId].choked = false;
}

// Follows them down: the guillotine's ground and pound, already on top.
function fdStartGnp(self, other, m, cfg, side) {
  var gc = cfg.gnp;
  m.act = null;
  other.choked = false;
  var g = { atkId: self.id, t: 0, nx: -side, ny: 0, bar: 0, phase: "mount", mx: self.x, my: self.y, fedor: true, hits: [] };
  for (var i = 0; i < gc.punches; i++) g.hits.push(i === gc.punches - 1 ? gc.lastDamage : gc.damage);
  g.fdArmbar = Math.random() * 100 < (gc.armbarChance || 0);
  other.guillo = g;
  self.choked = true;
  m.gnp = g;
  floater(self.x, self.y - self.r - 44, "GROUND AND POUND", "crit");
  crowdReact(0.6);
}

// ---------------------------------------------------------------- hurt (match.js)

var FD_DURABLE_SKIP = { finisher: true, kopunch: true, kofinal: true, slugfest: true, laser: true }; // scripted finishes keep their numbers
// His chin: he takes `durability.take` of the damage from everything else.
// And the Emperor: his crits, and them shook hitting him.
function fedorDamageMult(b, source, attackerId) {
  var em = fedorEmperorMult(b, source, attackerId); // the Emperor's crits and them shook (fedor-emperor.js)
  var cfg = fdCfg(b);
  if (!b.fd || !cfg || !cfg.durability || FD_DURABLE_SKIP[source] || attackerId == null || attackerId === b.id) return em;
  return cfg.durability.take * em;
}

// ---------------------------------------------------------------- drawing

// He drops his level reaching for the clinch, turns into the throw, and the
// one thrown flips over head first. From draw() with the canvas set up for b.
function applyFedorPose(b) {
  applyUnmovingPose(b); // his slips and their lean in The Unmoving Man (fedor-unmoving.js)
  applyEmperorPose(b); // stepping back and tilting to the mirror, and them trembling when shook (fedor-emperor.js)
  var a, angle = 0;
  if (b.fd && b.fd.act) {
    a = b.fd.act;
    if (a.phase === "reach" || a.phase === "shoot") {
      ctx.translate(b.x, b.y + b.r); ctx.scale(1.05, 0.92); ctx.translate(-b.x, -(b.y + b.r));
      return;
    }
    if (a.phase === "throw") angle = -a.side * 0.55 * Math.sin(Math.PI * Math.min(1, a.e * 1.1));
  } else if (b.choked) {
    var o = balls[1 - b.id];
    a = o && o.fd && o.fd.act;
    if (!a || a.vicId !== b.id) return;
    if (a.phase === "throw") angle = -a.side * Math.PI * a.e;
    else if (a.phase === "down") angle = -a.side * Math.PI * 0.5;
    else return;
  } else return;
  ctx.translate(b.x, b.y); ctx.rotate(angle); ctx.translate(-b.x, -b.y);
}

// Per fighter (after the ball): the reaching arms, speed lines behind his
// fists, and a cold flash when he's UNFAZED.
function drawFedor(b, other) {
  var m = b.fd, cfg = fdCfg(b);
  if (!m || !b.alive) return;
  drawEmperor(b, other); // the mirror and the crown, the crown on through his reign (fedor-emperor.js)
  if (fedorCrowning(b)) return;
  if (m.chill > 0) {
    ctx.save();
    ctx.globalAlpha = m.chill / 0.6 * 0.7;
    ctx.strokeStyle = FD_STEEL; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(b.x, b.y, b.r + 6 + (0.6 - m.chill) * 22, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
  }
  if (m.act && (m.act.phase === "reach" || m.act.phase === "shoot")) { fdDrawReach(b, m.act); return; }
  if (cfg.hands && cfg.hands.streaks && b.punch && other && other.alive && !b.taunt && !b.flow && !b.combo) fdDrawStreaks(b, other);
}

// Both arms out for the clinch, open gloves, and a ring closing in (the tell).
function fdDrawReach(b, a) {
  var ux = Math.cos(a.ang), uy = Math.sin(a.ang), px = -uy, py = ux, r = b.r;
  var k = a.phase === "reach" ? Math.min(1, a.t / 0.3) : 1;
  ctx.save();
  [-1, 1].forEach(function (s) {
    var sx = b.x + ux * r * 0.3 + px * s * r * 0.7, sy = b.y + uy * r * 0.3 + py * s * r * 0.7;
    var hx = b.x + ux * r * (0.9 + 0.55 * k) + px * s * r * (0.85 - 0.25 * k), hy = b.y + uy * r * (0.9 + 0.55 * k) + py * s * r * (0.85 - 0.25 * k);
    strokeLimb(r * 0.2, armColor(b.char, s), function () { ctx.moveTo(sx, sy); ctx.lineTo(hx, hy); });
    drawGloveAt(hx, hy, r * 0.27, b.char, a.ang);
  });
  if (a.phase === "reach") {
    ctx.globalAlpha = 0.35 + 0.4 * k;
    ctx.strokeStyle = b.char.color; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(b.x, b.y, r + 4 + (1 - k) * 18, 0, Math.PI * 2); ctx.stroke();
  }
  ctx.restore();
}

// Speed lines trailing the fist on the way out.
function fdDrawStreaks(b, other) {
  var pu = b.char.punch, p = b.punch;
  var windup = pu.speed * 0.35;
  if (p.t > windup + (pu.speed - windup) * 0.5) return;
  var qx = other.x - b.x, qy = other.y - b.y, qd = Math.sqrt(qx * qx + qy * qy) || 1, nx = qx / qd, ny = qy / qd;
  var pt = Math.max(0, Math.min(1, p.t < windup ? p.t / windup : 1 - (p.t - windup) / (pu.speed - windup)));
  var restDist = b.r + 4, fullDist = Math.max(restDist, qd - other.r + 4), dist = restDist + (fullDist - restDist) * pt;
  var gap = b.r * 0.4 * (p.side || 1), fx = b.x + nx * dist - ny * gap, fy = b.y + ny * dist + nx * gap;
  ctx.save();
  ctx.lineCap = "round"; ctx.strokeStyle = FD_STEEL; ctx.lineWidth = 3;
  [-1, 0, 1].forEach(function (k) {
    var ox = -ny * k * pu.size * 0.6, oy = nx * k * pu.size * 0.6, len = pu.size * (2.8 - Math.abs(k) * 0.9) * pt;
    ctx.globalAlpha = 0.8 * pt;
    ctx.beginPath(); ctx.moveTo(fx - nx * pu.size * 1.2 + ox, fy - ny * pu.size * 1.2 + oy); ctx.lineTo(fx - nx * (pu.size * 1.2 + len) + ox, fy - ny * (pu.size * 1.2 + len) + oy); ctx.stroke();
  });
  ctx.restore();
}

// Over both fighters: his arms locked round them through the clinch and the throw.
function drawFedorOver() {
  drawUnmovingOver(); // The Unmoving Man: both fighters' arms, the shadow over his eyes, the manga marks (fedor-unmoving.js)
  balls.forEach(function (b) {
    var a = b.fd && b.fd.act;
    if (!a || (a.phase !== "lock" && a.phase !== "throw")) return;
    var vic = balls[a.vicId], r = b.r, skin = armColor(b.char);
    var dx = vic.x - b.x, dy = vic.y - b.y, d = Math.sqrt(dx * dx + dy * dy) || 1;
    var ux = dx / d, uy = dy / d, px = -uy, py = ux;
    ctx.save();
    [-1, 1].forEach(function (k) {
      var sh = { x: b.x + ux * r * 0.3 + px * k * r * 0.72, y: b.y + uy * r * 0.3 + py * k * r * 0.72 };
      var hand = { x: vic.x + ux * vic.r * 0.2 + px * k * vic.r * 0.3, y: vic.y + uy * vic.r * 0.2 + py * k * vic.r * 0.3 };
      strokeLimb(r * 0.2, skin, function () {
        ctx.moveTo(sh.x, sh.y);
        ctx.quadraticCurveTo(vic.x - ux * vic.r * 0.5 + px * k * vic.r * 1.0, vic.y - uy * vic.r * 0.5 + py * k * vic.r * 1.0, hand.x, hand.y);
      });
      drawGloveAt(hand.x, hand.y, r * 0.22, b.char);
    });
    ctx.restore();
  });
}

// ---------------------------------------------------------------- his kit

// His PRIDE trunks: blue with a red waistband and the Russian tricolour (white,
// blue, red) down the outside of each leg. From drawArtBody (fighter-art.js).
function drawTricolorShorts(c, r, look, sTop, band) {
  var cols = ["#f4f4f2", "#1c4fd8", "#d52b1e"], w = r * 0.07;
  [-1, 1].forEach(function (s) {
    cols.forEach(function (col, i) {
      var x0 = s * (r * 0.4 + i * w), x1 = s * (r * 0.5 + i * w);
      c.fillStyle = col;
      c.beginPath();
      c.moveTo(x0, sTop + band); c.lineTo(x0 + s * w, sTop + band);
      c.lineTo(x1 + s * w, r); c.lineTo(x1, r); c.closePath(); c.fill();
    });
  });
}

// ---------------------------------------------------------------- the gallery

function fedorGalleryMoves(ch, add) {
  var f = ch.fedor, tc = f.throw, gc = f.gnp, st = f.stoic, mt = f.mantra, pct = function (x) { return Math.round(x * 100) + "%"; };
  if (f.hands) add("👊", "Fast hands", "Heavy punches off alternating hands, faster than a heavyweight has any right to throw them, with speed lines behind every fist.");
  if (tc) add("🤼", "Sambo throw", "Every " + tc.every[0] + "-" + tc.every[1] + "s up close he drops his level and reaches out with both arms (the tell), then steps into the clinch. They break free " + tc.escape + "% of the time (more for grapplers, weavers and good sprawlers, less the lighter they are). Otherwise he throws them over his hip for " + tc.damage + ", a takedown.");
  if (gc && tc) add("🔨", "Ground and pound", tc.gnpChance + "% of his throws he follows them down: " + gc.punches + " punches from on top (" + gc.damage + " each, " + gc.lastDamage + " for the last), the fastest ground and pound in the game. They can't slip or block them.");
  if (gc && gc.armbarChance && f.armbar) add("🦾", "Armbar", gc.armbarChance + "% of the time the ground and pound ends in the armbar, his finish on Mark Coleman. They tap " + f.armbar.tapBase + "%, up to " + (f.armbar.tapBase + f.armbar.tapLowHp) + "% the more hurt they are.");
  if (st) add("🧊", "The Last Emperor's calm", "He barely reacts to being hit: knocked back only " + pct(st.knockback) + " as far, dizzy for " + pct(st.dizzy) + " as long, " + st.slamCut + " fewer bounce off the walls, and trash talk doesn't get to him. A shot of " + st.noteAt + "+ gets an \"UNFAZED\" and a low church bell.");
  emperorGalleryMove(f, add); // the Emperor (fedor-emperor.js)
  if (mt && mt.on) add("🎵", "The mantra", "A low Russian Orthodox-style choir hums under the whole fight while he's in it, in the key of the music, never louder than the crowd, dipping when the music dips.");
}

function fedorGallerySounds(groups, synth) {
  groups.push({ title: "Fedor Emelianenko", items: [
    synth("The mantra", "The low choir under his fights (about 12 seconds here).", function () { previewFdMantra(); }),
    synth("Unfazed bell", "A big shot lands and he doesn't react.", function () { playFdBell(); }),
    synth("Clinch grip", "Reaching for and locking the clinch.", function () { playFdGrip(); }),
    synth("Fast hands", "The whip of air on each punch.", function () { playFdWhip(); })
  ] });
}

// ---------------------------------------------------------------- sound
// Synth stand-ins: nothing here is a recording.

function fdAudio(fn) {
  try {
    var ac = getAudioCtx();
    if (!ac) return;
    if (ac.state === "suspended") ac.resume();
    fn(ac, ac.currentTime);
  } catch (e) { /* never let audio break the game */ }
}
// A quick whip of air off the glove.
function playFdWhip() {
  fdAudio(function (ac, t) { caneBurst(ac, t, 5200 + nativeRandom() * 1200, 0.8, 0.07, 0.05); });
}
// Hands slapping onto the body and the cloth pulling tight.
function playFdGrip() {
  fdAudio(function (ac, t) {
    caneBurst(ac, t, 900, 0.7, 0.35, 0.12);
    caneBurst(ac, t + 0.05, 1500, 1.0, 0.2, 0.08);
    caneTone(ac, t, "sine", 140, 90, 0.18, 0.12);
  });
}
// A low church bell: one stroke, long and cold.
function playFdBell() {
  fdAudio(function (ac, t) {
    var out = strikeOut(ac);
    [[1, 0.12, 2.6], [2.0, 0.05, 1.8], [2.4, 0.045, 1.4], [3.0, 0.03, 1.0], [4.2, 0.02, 0.7]].forEach(function (p) {
      var o = ac.createOscillator(), g = ac.createGain();
      o.type = "sine"; o.frequency.value = 98 * p[0];
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(p[1], t + 0.006); g.gain.exponentialRampToValueAtTime(0.0001, t + p[2]);
      o.connect(g); g.connect(out); o.start(t); o.stop(t + p[2] + 0.05);
    });
  });
}

// ---------------------------------------------------------------- the mantra
// A low male choir: three bass parts holding the drone (the ison: root, fifth,
// octave), breathing at staggered times so it never stops, and a slow chant
// over it, stepwise in a narrow range like Znamenny chant. Each voice is three
// detuned saws with a slow vibrato through two vowel formants ("oh", "ah",
// "oo"), into a long stone-hall reverb. It's rendered once per key into a 24
// second loop (notes ringing past the end fold back onto the start).

var FD_MANTRA_LOOP = 24, FD_MANTRA_TAIL = 4, FD_MANTRA_RMS = 0.1;
// The key of each background loop (music.js): its root note, low, and whether
// it's major. "off" (no music) is his own, D.
var FD_KEYS = { A: [36, 1], B: [33, 0], C: [36, 1], D: [38, 0], E: [40, 0], F: [33, 0], G: [33, 0], H: [38, 0], I: [40, 0], J: [33, 0], K: [38, 0], L: [38, 0], off: [38, 0] };
var FD_VOWELS = { o: [430, 780], a: [650, 1080], u: [330, 700] };
// The chant: [scale degree, beats] (a beat is a second; null is a breath).
var FD_CHANT = [[0, 2], [1, 1.5], [2, 2], [1, 1], [0, 2.5], [null, 1], [2, 1.5], [3, 1.5], [4, 2.5], [3, 1], [2, 1], [1, 1.5], [0, 3], [null, 1.5]];
var fdMantraBufs = {}, fdMantraWait = {}, fdMantra = null, fdCrowdRms = null;

function fdKey(id) { var k = FD_KEYS[id] || FD_KEYS.off; return { root: k[0], major: !!k[1], id: k[0] + (k[1] ? "M" : "m") }; }

function fdHall(ctx, secs) {
  var n = Math.floor(ctx.sampleRate * secs), pre = Math.floor(ctx.sampleRate * 0.03), b = ctx.createBuffer(2, n, ctx.sampleRate);
  for (var c = 0; c < 2; c++) {
    var d = b.getChannelData(c);
    for (var i = pre; i < n; i++) d[i] = (nativeRandom() * 2 - 1) * Math.pow(1 - i / n, 3.2);
  }
  return b;
}

// One sung note: `v` loudness, `att` and `rel` seconds of swell in and out.
function fdSing(ctx, out, midi, t, len, v, vowel, att, rel) {
  var F = FD_VOWELS[vowel] || FD_VOWELS.o, f = mtof(midi), end = t + len + rel;
  var mix = ctx.createGain(); mix.gain.value = 1;
  var lfo = ctx.createOscillator(); lfo.frequency.value = 4.4 + nativeRandom() * 0.9;
  var dep = ctx.createGain(); dep.gain.value = 6 + nativeRandom() * 6; // cents
  lfo.connect(dep); lfo.start(t); lfo.stop(end + 0.05);
  [-9, 0, 8].forEach(function (dc) {
    var o = ctx.createOscillator(); o.type = "sawtooth"; o.frequency.value = f; o.detune.value = dc + (nativeRandom() - 0.5) * 5;
    dep.connect(o.detune); o.connect(mix); o.start(t); o.stop(end + 0.05);
  });
  var env = ctx.createGain();
  env.gain.setValueAtTime(0.0001, t);
  env.gain.linearRampToValueAtTime(v, t + att);
  env.gain.linearRampToValueAtTime(v * 0.85, t + Math.max(att, len * 0.6));
  env.gain.linearRampToValueAtTime(0.0001, end);
  [[F[0], 5, 1], [F[1], 7, 0.45]].forEach(function (fm) {
    var bp = ctx.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = fm[0] * (midi < 45 ? 0.92 : 1); bp.Q.value = fm[1];
    var g = ctx.createGain(); g.gain.value = fm[2];
    mix.connect(bp); bp.connect(g); g.connect(env);
  });
  env.connect(out);
}

function fdChoir(ctx, key) {
  var out = ctx.createGain(), lp = ctx.createBiquadFilter(), dry = ctx.createGain(), wet = ctx.createGain(), cv = ctx.createConvolver();
  lp.type = "lowpass"; lp.frequency.value = 2000;
  dry.gain.value = 0.7; wet.gain.value = 0.5;
  cv.buffer = fdHall(ctx, 3.4);
  out.connect(lp); lp.connect(dry); dry.connect(ctx.destination); lp.connect(cv); cv.connect(wet); wet.connect(ctx.destination);
  var r = key.root, L = FD_MANTRA_LOOP;
  // The ison: root, fifth and octave, each part breathing at its own time.
  [[r, "u", 0, 1], [r + 7, "o", 2, 0.5], [r + 12, "o", 4, 0.55]].forEach(function (p) {
    for (var t = p[2]; t < L; t += 6) fdSing(ctx, out, p[0], t, 8, p[3] * 0.5, p[1], 1.6, 2);
  });
  // The chant over it.
  var scale = key.major ? [0, 2, 4, 5, 7, 9, 11] : [0, 2, 3, 5, 7, 8, 10], vowels = ["o", "a", "o", "u"], tt = 0.5, vi = 0;
  FD_CHANT.forEach(function (n) {
    if (n[0] !== null) fdSing(ctx, out, r + 12 + scale[n[0] % 7], tt, n[1] + 0.3, 0.55, vowels[vi++ % vowels.length], 0.25, 0.45);
    tt += n[1];
  });
}

function renderFdMantra(keyId, done) {
  var key = fdKey(keyId);
  if (fdMantraBufs[key.id]) { done(fdMantraBufs[key.id]); return; }
  (fdMantraWait[key.id] = fdMantraWait[key.id] || []).push(done);
  if (fdMantraWait[key.id].length > 1) return;
  try {
    var OAC = window.OfflineAudioContext || window.webkitOfflineAudioContext, sr = 22050; // (the choir is low-passed at 2 kHz)
    var off = new OAC(2, Math.ceil(sr * (FD_MANTRA_LOOP + FD_MANTRA_TAIL)), sr);
    fdChoir(off, key);
    off.oncomplete = function (e) {
      var ac = getAudioCtx(), waiting = fdMantraWait[key.id];
      fdMantraWait[key.id] = null;
      if (!ac) return;
      var full = e.renderedBuffer, n = Math.round(sr * FD_MANTRA_LOOP), buf = ac.createBuffer(2, n, sr), sum = 0;
      for (var c = 0; c < 2; c++) {
        var src = full.getChannelData(c), dst = buf.getChannelData(c);
        for (var i = 0; i < n; i++) dst[i] = src[i];
        for (var j = n; j < src.length; j++) dst[j - n] += src[j];
        for (var q = 0; q < n; q += 3) sum += dst[q] * dst[q];
      }
      var rms = Math.sqrt(sum / (2 * Math.ceil(n / 3))) || 1, k = FD_MANTRA_RMS / rms;
      for (var c2 = 0; c2 < 2; c2++) { var dd = buf.getChannelData(c2); for (var z = 0; z < n; z++) dd[z] *= k; }
      fdMantraBufs[key.id] = buf;
      (waiting || []).forEach(function (cb) { cb(buf); });
    };
    off.startRendering();
  } catch (e) { fdMantraWait[key.id] = null; /* no mantra is fine */ }
}

// How loud the crowd's loop is (its RMS), measured once.
function fdCrowdLoudness() {
  if (fdCrowdRms == null && typeof clipBuffers !== "undefined" && clipBuffers.crowd) {
    var d = clipBuffers.crowd.getChannelData(0), sum = 0, n = 0;
    for (var i = 0; i < d.length; i += 11) { sum += d[i] * d[i]; n++; }
    fdCrowdRms = Math.sqrt(sum / Math.max(1, n)) || 0.15;
  }
  return fdCrowdRms || 0.15;
}

function startFdMantra(keyId) {
  var ac = getAudioCtx();
  if (!ac) return;
  var tok = fdMantra = { key: keyId, src: null, gain: null, at: 0, last: Date.now(), timer: null };
  renderFdMantra(keyId, function (buf) {
    if (fdMantra !== tok) return;
    try {
      tok.src = ac.createBufferSource(); tok.src.buffer = buf; tok.src.loop = true;
      tok.gain = ac.createGain(); tok.gain.gain.setValueAtTime(0.0001, ac.currentTime);
      tok.src.connect(tok.gain); tok.gain.connect(ac.destination);
      tok.src.start(ac.currentTime);
      tok.at = ac.currentTime;
      // If the fight stops ticking (paused, left the screen) it fades away by
      // itself (tickFdMantra), and after a few seconds it's stopped for good.
      tok.timer = setInterval(function () { if (Date.now() - tok.last > 3000) stopFdMantra(0.3, tok); }, 1000);
    } catch (e) { /* never let audio break the game */ }
  });
}

// Fades it out over `fade` seconds and stops it (`only`: just that one).
function stopFdMantra(fade, only) {
  var tok = only || fdMantra;
  if (!tok) return;
  if (fdMantra === tok) fdMantra = null;
  if (tok.timer) clearInterval(tok.timer);
  tok.timer = null;
  if (!tok.src) return;
  try {
    var now = audioCtx.currentTime;
    tok.gain.gain.cancelScheduledValues(now);
    tok.gain.gain.setTargetAtTime(0.0001, now, Math.max(0.05, fade / 3));
    tok.src.stop(now + fade + 0.1);
  } catch (e) { /* already stopped */ }
}

// How much of its level the choir gets right now, following what the music
// does (music.js, audio.js): gone while a special holds the music off or
// plays its own song, down with it under a voice line or a jumbotron ad.
function fdMantraRide(cfg, now) {
  var duck = cfg.duck != null ? cfg.duck : MUSIC_DUCK;
  if (typeof music !== "undefined" && music && music.off) return 0; // Do Bronx, the Kangaroo's Down Under, the Death Star
  if (typeof auraMusic !== "undefined" && auraMusic) return 0;      // Aura Farm's Desperado
  if (typeof freeBirdPlaying !== "undefined" && freeBirdPlaying) return 0; // All American's Free Bird
  if (now < talkEnd) return duck;                                    // someone talking
  if (typeof jumboAdLeft !== "undefined" && jumboAdLeft > 0) return duck; // an ad on the jumbotron
  return 1;
}

// Every frame: starts it once the fight's on, keeps it in the music's key,
// at its level under the crowd, riding the music's volume, and fades it out
// at the end.
function tickFdMantra() {
  var cfg = null;
  if (balls) balls.forEach(function (b) { var c = fdCfg(b); if (c && c.mantra && c.mantra.on) cfg = c.mantra; });
  if (!cfg || !started) { if (fdMantra) stopFdMantra(0.4); return; }
  var tok = fdMantra;
  if (over) {
    if (tok && !tok.ending) { tok.ending = true; stopFdMantra(cfg.fadeOut || 3); }
    return;
  }
  var key = cfg.followKey === false ? "off" : musicChoice;
  if (!tok || tok.ending) { startFdMantra(key); return; }
  if (fdKey(tok.key).id !== fdKey(key).id) { stopFdMantra(0.8); startFdMantra(key); return; }
  tok.last = Date.now();
  if (!tok.gain) return;
  try {
    var now = audioCtx.currentTime;
    // Never louder than the crowd: `level` of its quietest murmur.
    var target = (cfg.level || 0.8) * CROWD_FLOOR * fdCrowdLoudness() / FD_MANTRA_RMS;
    var ride = fdMantraRide(cfg, now);
    var fadeIn = Math.min(1, (now - tok.at) / (cfg.fadeIn || 2.5));
    var g = tok.gain.gain;
    g.cancelScheduledValues(now);
    g.setTargetAtTime(Math.max(0.0001, target * ride * fadeIn), now, 0.12);
    g.setTargetAtTime(0.0001, now + 0.6, 0.3); // the next frame cancels this; a stalled fight fades out
  } catch (e) { /* never let audio break the game */ }
}

// The gallery's play button: twelve seconds of it, in the key of the music.
function previewFdMantra() {
  var ac = getAudioCtx();
  if (!ac) return;
  if (ac.state === "suspended") ac.resume();
  renderFdMantra(musicChoice, function (buf) {
    try {
      var now = ac.currentTime, src = ac.createBufferSource(), g = ac.createGain();
      src.buffer = buf; src.connect(g); g.connect(ac.destination);
      var lvl = 0.8 * CROWD_FLOOR * fdCrowdLoudness() / FD_MANTRA_RMS * 2.5; // a little louder on its own
      g.gain.setValueAtTime(0.0001, now); g.gain.linearRampToValueAtTime(lvl, now + 1.5);
      g.gain.setValueAtTime(lvl, now + 10); g.gain.linearRampToValueAtTime(0.0001, now + 12);
      src.start(now); src.stop(now + 12.1);
    } catch (e) { /* never let audio break the game */ }
  });
}
