// Michael Bisping, "The Count" (Christian, 2026-11-13; finished 2026-11-14).
// Former UFC middleweight champion from England, now a commentator. Vitor
// Belfort's head kick in 2013 detached the retina in his right eye and he won
// the title fighting half blind, so here he wears a pirate's patch over that
// eye, with a skull and crossbones on his shorts (look.eyePatch, shortsStyle
// "jollyroger", drawn by drawEyePatch and drawJollyRogerShorts below for
// fighter-art.js). Everything else is in his character file under "bisping"
// (and his special); leave a block out and that part is off.
//
// Volume      a kickboxer: his normal punch and kick, plus combinations
//             (combos.js): the one-two into a body kick, jab-cross-hook,
//             and a one-two into the clinch.
// Footwork    (bisping.footwork) hit and move. After every punch or kick he
//             throws (and every combination) he steps back out at an angle
//             for `out` seconds, facing them (so a shot then isn't a grab
//             from behind); past `press` (edge to edge) he walks back in on
//             an angle, and in between he circles, switching sides every
//             `switch` seconds. `rate` is how fast he turns (radians a
//             second). When his clinch is due he walks straight in for it.
// Side step   (bisping.kickDodge) he moves to the side around kicks: when
//             they throw a kick (or a teep) at him, `chance`% of the time he
//             steps off to the side and a little back (`back` radians past
//             square) at `speed` for `time` seconds and it misses him
//             ("SIDESTEP"). He doesn't check a kick he's stepping out of.
// Angle kick  (bisping.kickAngle) before his own kick (`chance`% of them) he
//             steps off to an angle first: sideways and a little toward them
//             (`fwd` radians in from square) at `speed` for `time` seconds,
//             then the kick goes. Either side step leaves a faint trail.
// Scorecard   (bisping.scorecard) racking up points: every `every` strikes
//             he lands, a judge's card pops up over him reading 10-9 (at most
//             `max` a fight).
// Takedown defense  char.tdd (the sprawl from ilia.js): he stuffs most shots.
// Knees and elbows  (bisping.clinch) every time he's in the clinch (the plum,
//             knees.js, from his `knee.clinch` block or the one-two into it)
//             he throws an elbow (elbows.js, with these numbers) in the gap
//             after every knee but the last, off one hand while the other
//             keeps the head down: "KNEES AND ELBOWS!". Elbows in there are
//             held like the knees: nobody slips or blocks them. A critical
//             one can open a cut (`cut`).
// Grappler hater  (bisping.punish) a takedown shot he stuffs gets punished:
//             `chance`% of the time he catches them bent over from the shot
//             and goes straight into the clinch (no reach-up tell this time)
//             for `knees` knees with the elbows in between.
// Voice lines (bisping.lines) his real lines, Christian's picks (2026-11-14),
//             each one the exact text its clip is keyed by, read with say().
//             The defining moments get theirs every time, waiting (up to
//             BS_LINE_WAIT) for quiet so the talk channel never drops them:
//             `start` (one of the two) `startAt` seconds in, `mirror` instead
//             against himself; a `vs` fighter's `once` line in every fight
//             against that fighter, as soon as he's free after the start;
//             `win` after every win (after a knockout, `knockdown` first,
//             `knockdownChance`%); `loss` after every loss. The frequent
//             moments are a roll each (`...Chance`%), at most one every `gap`
//             seconds and never over his own bubble: `taunt` every
//             `tauntEvery` seconds (at most `tauntMax`), `takedown` when he
//             sprawls on a shot and stuffs it (`takedownChance`%, said as soon
//             as he's free, up to BS_TD_WAIT seconds), `clinch` as the clinch
//             starts, `combo` after a combination where every strike landed,
//             `blind` (none now: Christian took it out, 2026-11-18) when a hit
//             lands from his blind side (the patched eye, screen left,
//             `blindChance`%) or he misses a punch or kick (`missChance`%),
//             at most `blindMax` a fight. `special` every time the ship comes
//             in, waiting its turn (up to BS_LINE_WAIT) if anyone's talking.
// Broadside   his special (special.move "broadside"), a pirate ship in the
//             middle of the cage. The sea spreads over the mat and the ship
//             rises out of it (`ship.rise`), and he hops up onto the deck
//             (`ship.board`) and puts on a captain's tricorne. Union Jack
//             mainsail, a black foresail with a skull and crossbones, a Union
//             Jack flying off the stern, his red stripe down the hull. It
//             bobs and drifts a little (`ship.drift`, `ship.bob`, `ship.roll`)
//             and turns its bow to face them. Three cannons on the bow
//             (`cannons`) each lead them for the moment it fires, the three
//             fanned `spread` degrees apart along the way they're rolling, on
//             red dashed lines that lock and flash for the last `lock` seconds
//             (the tell). Then the volley, `stagger` seconds between shots.
//             `volley.volleys` volleys, `volley.gap` seconds apart. A
//             cannonball that hits does `damage` (can't be slipped or
//             blocked): splinters, smoke, and it shoves them across the cage
//             at `knockback`, easing back over `shove` seconds. One that
//             misses smashes into the cage. With `ship.solid` the hull and
//             he on deck are solid: they bounce off. Then it sinks back into
//             the sea (`ship.sink`) and leaves him on the mat. Nothing lands
//             on him while he's aboard (like the other specials).
// The special runs on b.igbb (move "broadside"), like every special.
"use strict";

// Registered here rather than in special.js's table (gsp.js does the same).
SPECIAL_MOVES.broadside = "Broadside";

var BS_CARD_T = 1.3;     // how long a 10-9 card stays up
var BS_FLIGHT = 1.6;     // a cannonball's longest flight (seconds)
var BS_GOLD = "#d9a43a";
var BS_DODGE_LATE = 0.4; // a side step still covers the kick this long after it ends
var BS_ANGLE_NEAR = 22;  // he steps off for his kick once he's this close to kicking range
var BS_ANGLE_KEEP = 0.6; // a step that isn't followed by the kick in this long is used up
var BS_BLIND_COS = 0.34; // their side of him is his blind side when it's within ~70 degrees of screen left
var BS_BLIND_MIN = 4;    // a hit that takes this much off counts (not a cut bleeding)
var BS_LINE_WAIT = 30;   // a defining moment's line waits up to this long for quiet before it goes anyway
var BS_TD_WAIT = 2;      // his stop-takedowns line waits up to this long after his sprawl for him to be free

var bsShots = [];   // cannonballs in flight: { x, y, vx, vy, r, owner, t, trail, dodged }
var bsSmoke = [];   // smoke puffs off the cannons and the cannonballs: { x, y, vx, vy, t, max, r }
var bsSplinters = []; // wooden shards off a cannonball landing: { x, y, vx, vy, rot, spin, len, t, max, color }
var bsGhosts = [];  // the faint trail of a side step: { x, y, r, t, max, color }
var bsClock = 0;    // drawing clock

function bsCfg(b) { return b && b.char && b.char.bisping; }
function bsRand(r) { return r[0] + Math.random() * (r[1] - r[0]); }
function bsTurn(a, want, maxStep) {
  var diff = Math.atan2(Math.sin(want - a), Math.cos(want - a));
  return a + Math.max(-maxStep, Math.min(maxStep, diff));
}
function broadsideOn(b) { return !!(b && b.igbb && b.igbb.move === "broadside"); }
function bsKnockable(o) { return o.alive && !o.grappled && !o.grapple && !o.slam && !subLocked(o) && !o.igbb && !o.koOut; }

// From startMatchSeeded.
function resetBisping() { bsShots = []; bsSmoke = []; bsSplinters = []; bsGhosts = []; bsClock = 0; bsShip = null; }
// From makeBall.
function initBisping(b) {
  b.bs = null; b.bsElbow = null;
  var cfg = bsCfg(b);
  if (!cfg) return;
  var lc = cfg.lines || {};
  b.bs = {
    side: Math.random() < 0.5 ? -1 : 1, sideT: 0, outT: 0, wasSprawl: false, wasCmb: false,
    fightT: 0, lineCd: 0, startAt: bsRand(lc.startAt || [1, 2.5]), talkT: null, taunts: 0, said: {}, endT: 0, endWait: 0, onceT: 0, blindN: 0,
    nextCard: cfg.scorecard ? cfg.scorecard.every : 0, cards: 0, card: null, elSide: 1,
    step: null, dodge: null, seenKick: null, angled: false, angledT: 0, ghostT: 0, hpPrev: null, lastN: 0, cmbRef: null, shipLine: null
  };
}

// ---------------------------------------------------------------- every frame

// From update(), after the abilities loop: the clinch elbows, voice lines, the
// stuffed-shot punish, the scorecard, the side steps, his footwork, the
// cannonballs.
function tickBisping(dt) {
  bsClock += dt;
  tickBsShots(dt);
  tickBsSmoke(dt);
  tickBsGhosts(dt);
  if (!balls) return;
  balls.forEach(function (b) {
    var s = b.bs;
    if (!s) return;
    var cfg = bsCfg(b), other = balls[1 - b.id];
    if (s.card) { s.card.t += dt; if (s.card.t > BS_CARD_T) s.card = null; }
    if (s.lineCd > 0) s.lineCd -= dt;
    bsClinch(b, other, cfg);
    bsElbowTick(b, dt);
    bsLines(b, other, cfg, dt);
    if (!started || over || !b.alive) { s.wasSprawl = !!b.sprawl; s.step = null; s.dodge = null; return; }
    s.fightT += dt;
    bsPunish(b, other, cfg);
    bsScore(b, cfg);
    bsStrikeWatch(b, other, cfg, dt);
    bsKickDodge(b, other, cfg, dt);
    bsKickAngle(b, other, cfg, dt);
    bsRunStep(b, dt);
    bsFootwork(b, other, cfg, dt);
  });
}

// ---------------------------------------------------------------- knees and elbows

// In the clinch (knees.js runs the hold and the knees): calls it, and throws
// an elbow in the gap after each knee.
function bsClinch(b, other, cfg) {
  var cl = cfg.clinch, m = b.plum;
  if (!cl || !m || m.phase !== "hold" || !b.alive || over) return;
  var v = balls[m.vicId];
  if (!v) return;
  if (!m.bsCalled) {
    m.bsCalled = true;
    bsSay(b, "clinch", (cfg.lines || {}).clinchChance); // "I'm going to bring my knee up..." / "...fire away with elbows."
  }
  if (!cl.elbows || m.knee || b.bsElbow || !v.alive || v.koOut) return;
  // One elbow after each knee (not the last: the last knee shoves them off),
  // if there's time before the next knee comes up.
  if ((m.bsEl || 0) >= m.thrown || m.thrown >= m.count || m.next < cl.speed * 0.9) return;
  m.bsEl = (m.bsEl || 0) + 1;
  b.bs.elSide = -b.bs.elSide;
  // Its own state rather than b.elbowAnim, which combos.js moves along (and
  // drops in the clinch) for a fighter with no `elbow` block. elbows.js's
  // landElbow lands it with these numbers.
  b.bsElbow = { t: 0, dur: cl.speed, hit: false, side: b.bs.elSide, targetId: v.id, blade: false, crit: false,
    opts: { always: true, source: "finisher", knockback: 0, damage: cl.damage, critChance: cl.critChance, critMult: cl.critMult, cut: cl.cut || null,
      onLand: function (dealt, crit) {
        // The commentator on a critical one, once a clinch (commentary-calls.js, if it's in).
        if (dealt > 0 && crit && !m.bsCommented) { m.bsCommented = true; if (typeof commentaryCall === "function") commentaryCall("elbows", b, v); }
      } } };
  playElbowSwish(false);
  if (m.bsEl === 1) bsCallClinch(b, v, m);
}

// "KNEES AND ELBOWS!" as the first elbow goes in, stacked clear of the
// "CLINCH!" call (knees.js) rising from where he grabbed them.
function bsCallClinch(b, v, m) {
  var age = (m.bsPunish ? 0 : PLUM_GRAB) + m.t, cy = b.y - b.r - 30 - 46 * age;
  var y = cy - 40 >= 26 ? cy - 40 : cy + 40;
  floater(b.x, y, "KNEES AND ELBOWS!", "crit");
  crowdReact(0.35);
}

// The clinch elbow moves along here (his abilities loop is busy with the
// clinch), and is dropped if the clinch ends first.
function bsElbowTick(b, dt) {
  var e = b.bsElbow;
  if (!e) return;
  if (!b.plum || b.plum.phase !== "hold" || !b.alive || over) { b.bsElbow = null; return; }
  e.t += dt;
  if (!e.hit && e.t >= e.dur * ELBOW_HIT) { e.hit = true; landElbow(b, balls[e.targetId], e); }
  if (e.t >= e.dur) b.bsElbow = null;
}

// From drawPlum (knees.js): the arm on side `s` is throwing an elbow, so it
// isn't on their head right now (drawBispingOver draws it).
function bispingPlumElbow(b, s) {
  var e = b && b.bsElbow;
  return !!(e && e.side === s);
}

// A stuffed takedown: the sprawl just ended with him on top (ilia.js's
// takedown defense), so they're bent over in front of him.
function bsPunish(b, other, cfg) {
  var s = b.bs, pc = cfg.punish;
  // "I can't wrestle too well, but I can stop takedowns.": on his sprawl, the
  // moment he's free to talk (his sprawl or the stuff, not his own shots).
  var tdc = (cfg.lines || {}).takedownChance;
  if (b.sprawl && !s.wasSprawl && (tdc == null || Math.random() * 100 < tdc)) s.tdUntil = s.fightT + BS_TD_WAIT;
  if (s.tdUntil != null) { if (s.fightT > s.tdUntil || bsSay(b, "takedown")) s.tdUntil = null; }
  var stuffed = s.wasSprawl && !b.sprawl && !b.grappled && !b.grapple && !b.char.hasGrapple;
  s.wasSprawl = !!b.sprawl;
  if (!stuffed || !pc || !b.alive || !other.alive || other.koOut || b.plum || b.fknee || b.igbb) return;
  if (Math.random() * 100 >= pc.chance) return;
  // He catches them on the way back up: no reach-up, straight into the hold.
  other.vx = 0; other.vy = 0; b.vx = 0; b.vy = 0;
  if (!startPlum(b, other, null)) return;
  lockPlum(b, other, b.plum, plumNums(b));
  b.plum.bsPunish = true;
  if (pc.knees) b.plum.count = Math.max(1, Math.round(bsRand(pc.knees)));
}

// ---------------------------------------------------------------- scorecard

function bsScore(b, cfg) {
  var sc = cfg.scorecard, s = b.bs;
  if (!sc || s.cards >= sc.max) return;
  var n = statsFor(b.id).strikes;
  if (n < s.nextCard) return;
  s.nextCard = n + sc.every;
  s.cards++;
  s.card = { t: 0 };
  playBsCard();
}

// ---------------------------------------------------------------- footwork

// What he's just thrown and what's just happened to him: hit and move (a
// punch, kick or combination sends him back out), a miss, a combination that
// all landed, a hit from his blind side. Runs every frame of the fight.
function bsStrikeWatch(b, other, cfg, dt) {
  var fw = cfg.footwork, s = b.bs, lc = cfg.lines || {}, n = statsFor(b.id).strikes, missed = false;
  if (b.punch && b.punch.hit && !b.punch.bsSeen) { b.punch.bsSeen = true; if (fw) s.outT = fw.out; if (n === s.lastN) missed = true; }
  if (b.kick && b.kick.hit && !b.kick.bsSeen) { b.kick.bsSeen = true; if (fw) s.outT = fw.out; if (n === s.lastN && !b.kick.counter) missed = true; }
  if (s.wasCmb && !b.cmb && fw) s.outT = fw.out;
  s.wasCmb = !!b.cmb;
  s.lastN = n;
  if (s.outT > 0) s.outT -= dt;
  if (fw) { s.sideT -= dt; if (s.sideT <= 0) { s.side = -s.side; s.sideT = bsRand(fw.switch); } }
  if (missed) bsBlindLine(b, lc.missChance); // (lines.blind: none now)
  // A combination where every strike was thrown and landed (not the one into
  // the clinch: the clinch has its own line).
  if (b.cmb) s.cmbRef = b.cmb;
  else if (s.cmbRef) {
    var m = s.cmbRef;
    s.cmbRef = null;
    if (m.n >= 2 && m.n >= m.steps.length && m.hits >= m.n && m.steps[m.steps.length - 1] !== "plum") bsSay(b, "combo", lc.comboChance); // "Very basic stuff done to a high level..."
  }
  // A hit from his blind side: the patch is over his right eye, on screen left.
  var lost = s.hpPrev == null ? 0 : s.hpPrev - b.hp;
  s.hpPrev = b.hp;
  if (lost >= BS_BLIND_MIN && other.alive) {
    var dx = other.x - b.x, dy = other.y - b.y, d = Math.sqrt(dx * dx + dy * dy) || 1;
    if (dx / d < -BS_BLIND_COS) bsBlindLine(b, lc.blindChance);
  }
}

function bsFootwork(b, other, cfg, dt) {
  var fw = cfg.footwork, s = b.bs;
  if (!fw || s.step) return;
  if (!inOrdinaryMovement(b) || b.dizzy || b.angry || b.cmb || b.punch || b.kick || !other.alive || other.koOut) return;
  var dx = other.x - b.x, dy = other.y - b.y, d = Math.sqrt(dx * dx + dy * dy) || 1, gap = d - b.r - other.r;
  var to = Math.atan2(dy, dx), want, rate;
  var kc = b.char.knee && b.char.knee.clinch;
  if (kc && b.plumT != null && b.plumT <= 0) { want = to; rate = fw.rate; s.outT = 0; } // looking for the clinch
  else if (s.outT > 0) { want = to + Math.PI - s.side * fw.angle; rate = fw.rate; }
  else if (gap > fw.press) { want = to + s.side * 0.3; rate = fw.rate * 0.5; }
  else { want = to + s.side * fw.circle; rate = fw.rate * 0.6; }
  var sp = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
  if (sp < 1) return;
  var nu = bsTurn(Math.atan2(b.vy, b.vx), want, rate * dt);
  b.vx = Math.cos(nu) * sp; b.vy = Math.sin(nu) * sp;
}

// Stepping back out after a strike he stays squared up to them: the grappling
// code's "which way is he facing" says at them (facingOf, grapple-duel.js).
function bispingSquaredUp(b) {
  return !!(b && b.bs && b.bs.outT > 0 && b.alive && !b.igbb && !b.angry);
}

// ---------------------------------------------------------------- side steps

// Which way to step: `off` radians either side of straight at them, picking
// the side with more room once he's moved `dist` (his circling side on a tie).
function bsStepDir(b, other, off, dist) {
  var to = Math.atan2(other.y - b.y, other.x - b.x), best = null;
  [b.bs.side, -b.bs.side].forEach(function (sd) {
    var a = to + sd * off, x = b.x + Math.cos(a) * dist, y = b.y + Math.sin(a) * dist;
    var room = Math.min(x - b.r, W - b.r - x, y - b.r, H - b.r - y);
    if (!best || room > best.room + 8) best = { a: a, room: room, sd: sd };
  });
  b.bs.side = best.sd;
  return { x: Math.cos(best.a), y: Math.sin(best.a) };
}

function bsCanStep(b) {
  return b.alive && inOrdinaryMovement(b) && !b.dizzy && !b.angry && !b.cmb && !b.checkAnim && !b.plum && !b.fknee && !b.bs.step;
}

// They've just started a kick (or a teep) at him: `chance`% of the time he
// steps out of it to the side. bispingDodge (in hurt) makes it miss.
function bsKickDodge(b, other, cfg, dt) {
  var kd = cfg.kickDodge, s = b.bs;
  if (s.dodge) { s.dodge.t += dt; if (s.dodge.used || s.dodge.t > (kd ? kd.time : 0) + BS_DODGE_LATE) s.dodge = null; }
  if (!kd || !other.alive) return;
  var k = other.kick && !other.kick.counter && !other.kick.hit ? other.kick : (other.teep && !other.teep.hit ? other.teep : null);
  if (!k || k === s.seenKick) return;
  s.seenKick = k;
  if (!bsCanStep(b) || Math.random() * 100 >= kd.chance) return;
  var u = bsStepDir(b, other, Math.PI / 2 + (kd.back || 0), kd.speed * kd.time);
  s.dodge = { t: 0, kick: k, used: false };
  s.step = { t: 0, dur: kd.time, ux: u.x, uy: u.y, speed: kd.speed, kind: "dodge" };
  s.outT = 0;
  playBsStep();
}

// From hurt() (match.js): the kick he's stepping out of misses him.
function bispingDodge(b, source, attackerId) {
  var s = b && b.bs;
  if (!s || !s.dodge || s.dodge.used || (source !== "kick" && source !== "teep") || attackerId == null || attackerId === b.id || !b.alive) return false;
  var atk = balls[attackerId];
  if (!atk || (atk.kick !== s.dodge.kick && atk.teep !== s.dodge.kick)) return false;
  s.dodge.used = true;
  b.justDodged = true;
  floater(b.x, b.y - b.r - 8, "SIDESTEP", "dodge");
  playSlip();
  crowdReact(0.12);
  return true;
}

// From canCheck (abilities.js): he doesn't check a kick he's stepping out of.
function bispingSideStepping(b) { return !!(b && b.bs && b.bs.dodge && !b.bs.dodge.used); }

// His own kick is coming up: he steps off to an angle first, holding the kick
// (its cooldown) until the step's done.
function bsKickAngle(b, other, cfg, dt) {
  var ka = cfg.kickAngle, s = b.bs;
  if (!ka || !b.char.hasKick || !b.char.kick) return;
  if (b.kick) { s.angled = false; return; } // it's gone: the next kick gets its own step
  var st = s.step;
  if (st && st.kind === "angle") { b.kickCd = Math.max(b.kickCd || 0, st.dur - st.t); return; }
  if (s.angled) { s.angledT += dt; if (s.angledT > BS_ANGLE_KEEP) s.angled = false; return; }
  if ((b.kickCd || 0) > ka.time || !other.alive || other.koOut) return;
  var dx = other.x - b.x, dy = other.y - b.y, gap = Math.sqrt(dx * dx + dy * dy) - b.r - other.r;
  if (gap > b.char.kick.reach + BS_ANGLE_NEAR) return;
  if (st && st.kind === "dodge") { s.angled = true; s.angledT = 0; return; } // already stepping off to the side
  if (!bsCanStep(b) || b.punch) { b.kickCd = Math.max(b.kickCd || 0, 0.05); return; } // the step comes first
  s.angled = true; s.angledT = 0;
  if (Math.random() * 100 >= (ka.chance != null ? ka.chance : 100)) return;
  var u = bsStepDir(b, other, Math.PI / 2 - (ka.fwd || 0), ka.speed * ka.time);
  s.step = { t: 0, dur: ka.time, ux: u.x, uy: u.y, speed: ka.speed, kind: "angle" };
  s.outT = 0;
  b.kickCd = Math.max(b.kickCd || 0, ka.time);
  playBsStep();
}

// A side step moving along: he's carried along it, leaving a faint trail.
function bsRunStep(b, dt) {
  var s = b.bs, st = s.step;
  if (!st) return;
  if (!b.alive || !inOrdinaryMovement(b) || b.dizzy || b.plum || b.fknee) {
    s.step = null;
    if (st.kind === "dodge" && s.dodge && !s.dodge.used) s.dodge = null;
    return;
  }
  st.t += dt;
  b.vx = st.ux * st.speed; b.vy = st.uy * st.speed;
  s.ghostT -= dt;
  if (s.ghostT <= 0 && !reduceMotion) { s.ghostT = 0.035; bsGhosts.push({ x: b.x, y: b.y, r: b.r, t: 0, max: 0.26, color: b.char.color }); }
  if (st.t >= st.dur) { s.step = null; setSpeed(b, (b.baseSpeed || SPEED) * slowMult(b)); }
}

function tickBsGhosts(dt) {
  if (!bsGhosts.length) return;
  bsGhosts = bsGhosts.filter(function (g) { g.t += dt; return g.t < g.max; });
}

// ---------------------------------------------------------------- voice lines

// His lines for `key`: a `vs` fighter's own, if they're the one in the cage.
function bsPool(b, key) {
  var lc = bsCfg(b).lines, o = balls[1 - b.id], vs = lc.vs && o && o.char && lc.vs[o.char.id];
  if (vs && vs[key] && vs[key].length) return vs[key];
  return lc[key];
}

// One of his lines for `key`, `chance`% of the time (100 if left out).
// `force` skips the wait between lines (and lets him talk after a loss).
function bsSay(b, key, chance, force) {
  var cfg = bsCfg(b), lc = cfg && cfg.lines, s = b.bs;
  if (!lc || !s || (!b.alive && !force)) return false;
  var pool = bsPool(b, key);
  if (!pool || !pool.length) return false;
  if (!force && (s.lineCd > 0 || !canSay(b))) return false;
  if (chance != null && Math.random() * 100 >= chance) return false;
  say(b, pickLine(b, pool, "bs-" + key));
  s.lineCd = lc.gap || 4;
  return true;
}

// His blind-side line (lines.blind, none now), at most blindMax a fight.
function bsBlindLine(b, chance) {
  var lc = bsCfg(b).lines || {}, s = b.bs;
  if (s.blindN >= (lc.blindMax != null ? lc.blindMax : 2)) return;
  if (bsSay(b, "blind", chance)) s.blindN++;
}

// Somebody's voice going out on the talk channel (audio.js), or the
// commentator's call up (speech.js): the end-of-fight lines wait for it.
function bsTalkBusy() {
  if (typeof announcer !== "undefined" && announcer) return true;
  try { return !!(audioCtx && audioCtx.currentTime < talkEnd); } catch (e) { return false; }
}

// Quiet: he isn't talking and nobody's voice is going out. A defining
// moment's line (the start, Anderson, a win, a loss) waits for this rather
// than being cut off or dropped by the talk channel.
function bsQuiet(b) { return !speaking(b) && !bsTalkBusy(); }

function bsLines(b, other, cfg, dt) {
  var lc = cfg.lines, s = b.bs;
  if (!lc || !started) return;
  if (over) { s.shipLine = null; bsEndLines(b, other, lc, dt); return; }
  if (!b.alive) return;
  // Every time the ship comes in: "I'll knock him out, and I'll knock all you
  // lot out, one by one." Waits its turn if anyone's talking.
  if (s.shipLine != null) {
    s.shipLine += dt;
    if (bsQuiet(b) || s.shipLine > BS_LINE_WAIT) { s.shipLine = null; bsSay(b, "special", 100, true); }
  }
  // Every fight: "I started fighting when I came out of my mother, really." or
  // "I'm fighting myself in this fight." (always that one against himself).
  if (!s.said.start) {
    if (s.fightT >= s.startAt && (bsQuiet(b) || s.fightT > s.startAt + BS_LINE_WAIT)) {
      s.said.start = true;
      s.talkT = bsRand(lc.tauntEvery || [16, 26]);
      bsSay(b, other.char.id === b.char.id && lc.mirror ? "mirror" : "start", 100, true);
    }
    return;
  }
  // Every fight against a `vs` fighter: that fighter's `once` line, as soon as
  // he's free after the start line (Anderson Silva: "I worship this guy...").
  var vs = lc.vs && lc.vs[other.char.id];
  if (vs && vs.once && vs.once.length && !s.said.once) {
    s.onceT = (s.onceT || 0) + dt;
    if ((canSay(b) && !bsTalkBusy()) || s.onceT > BS_LINE_WAIT) { s.said.once = true; bsSay(b, "once", 100, true); }
    return;
  }
  // "I think I'm a nice guy...", now and then.
  s.talkT -= dt;
  if (s.talkT <= 0 && s.taunts < (lc.tauntMax != null ? lc.tauntMax : 2) && canSay(b) && !b.igbb && !b.plum) {
    if (bsSay(b, "taunt", 100, false)) s.taunts++;
    s.talkT = bsRand(lc.tauntEvery || [16, 26]);
  }
}

// After the fight, every time. A win: "Everybody, everybody that doubted me,
// kiss my [BLEEP]." (after a knockout, "I've always said I had knockout
// power..." first). A loss: "It's back to the drawing board...". Each waits
// for quiet, for as long as BS_LINE_WAIT, rather than be lost.
function bsEndLines(b, other, lc, dt) {
  var s = b.bs;
  s.endT += dt;
  s.endWait = (s.endWait || 0) + dt;
  if (b.alive && !other.alive) {
    if (!s.said.first) {
      if (s.endT < 0.9 || (!bsQuiet(b) && s.endWait < BS_LINE_WAIT)) return;
      s.said.first = true; s.endWait = 0;
      var ko = winBy !== "submission" && Math.random() * 100 < (lc.knockdownChance != null ? lc.knockdownChance : 100);
      if (ko && bsSay(b, "knockdown", 100, true)) return; // the win line follows once he's done
      s.said.win = true;
      bsSay(b, "win", 100, true);
    } else if (!s.said.win) {
      if (!bsQuiet(b) && s.endWait < BS_LINE_WAIT) return;
      s.said.win = true;
      bsSay(b, "win", 100, true);
    }
  } else if (!b.alive && other.alive && !s.said.loss) {
    if (s.endT < 1.8 || ((speaking(other) || bsTalkBusy()) && s.endWait < BS_LINE_WAIT)) return;
    s.said.loss = true;
    bsSay(b, "loss", 100, true);
  }
}

// ---------------------------------------------------------------- Broadside

// The ship's own frame: x along the hull (+ toward the bow), y down the
// screen, the waterline at 0. Sizes are fractions of `ship.length`.
var BS_DECK = 0.1;    // the deck amidships, above the waterline
var BS_SHEER = 0.07;  // how much higher the deck sweeps up at the bow and stern
var BS_HOP = 64;      // how high he hops up onto the deck
var BS_TURN = 0.35;   // the ship coming about to face them
var BS_SHIP_DEF = { length: 290, y: 0.6, rise: 0.75, board: 0.5, sink: 0.7, drift: 12, bob: 4, roll: 0.035, solid: true, sea: 0.34 };
var BS_CANNON_DEF = { count: 3, aim: 1, reaim: 0.75, lock: 0.35, lead: 1, spread: 12, stagger: 0.14, speed: 780, size: 11 };
var BS_VOLLEY_DEF = { volleys: 2, gap: 0.5, hold: 0.5 };

var bsShip = null;    // the ship in the cage right now (its owner's igbb), for the collisions

// One config block with every key filled in (the JSON's value, else the default).
function bsDef(cfg, def) { var o = {}; for (var k in def) o[k] = cfg && cfg[k] != null ? cfg[k] : def[k]; return o; }
function bsDeckY(L, lx) { var u = lx / (L / 2); return -L * (BS_DECK + BS_SHEER * u * u); }

// A point in the ship's frame (pixels) out in the cage, as it drifts, rolls,
// rises or sinks, and faces its bow at them (`face` squashes through 0 as it
// comes about).
function bsShipPt(m, lx, ly) {
  var fx = lx * m.face, c = Math.cos(m.rot), s = Math.sin(m.rot);
  return { x: m.sx + fx * c - ly * s, y: m.sy + m.depth + fx * s + ly * c };
}
// Where he stands: on the deck amidships, behind the rail.
function bsDeckSpot(m, b) { var lx = -m.L * 0.02; return bsShipPt(m, lx, bsDeckY(m.L, lx) - b.r * 0.5); }
// The three cannons on the bow: where each one swivels, and its muzzle.
function bsCannonLen(m) { return m.L * 0.16; }
function bsPivot(m, i) {
  var n = m.cn.count, lx = m.L / 2 * (0.34 + 0.56 * (n > 1 ? i / (n - 1) : 0.5));
  return bsShipPt(m, lx, bsDeckY(m.L, lx) - 4);
}
function bsMuzzle(m, i) {
  var p = bsPivot(m, i), a = m.aims[i], k = bsCannonLen(m) * (0.62 - (m.recoil[i] || 0) * 0.16);
  return { x: p.x + Math.cos(a) * k, y: p.y + Math.sin(a) * k };
}

// The ship's place this frame: the middle of the cage, drifting a little
// and bobbing on the swell. `k` is how far it's risen out of the sea (0..1).
function bsShipMove(m, dt) {
  var sh = m.sh;
  m.clock += dt;
  m.sx = W / 2 + Math.sin(m.clock * 0.55) * sh.drift;
  m.sy = H * sh.y + Math.sin(m.clock * 0.8 + 1) * sh.drift * 0.35 + Math.sin(m.clock * 2.2) * sh.bob;
  m.rot = Math.sin(m.clock * 1.6) * sh.roll;
  m.depth = (1 - m.k) * m.L * 0.75;
  if (m.turnT > 0) {
    m.turnT = Math.max(0, m.turnT - dt);
    var u = 1 - m.turnT / BS_TURN;
    m.face = m.dir * Math.cos(Math.PI * u);
    if (m.turnT <= 0) { m.dir = -m.dir; m.face = m.dir; }
  } else m.face = m.dir;
}

// Where they'll be in `t` seconds if they keep rolling the way they're going,
// bouncing off the cage and the hull. (What it can't see coming, a change of
// direction of their own, is how they dodge it.)
function bsPredict(o, t, m) {
  var x = o.x, y = o.y, vx = o.vx, vy = o.vy, n = Math.max(1, Math.ceil(t / 0.02)), h = t / n;
  var hull = m && m.sh.solid ? bsHull(m, o) : null;
  for (var i = 0; i < n; i++) {
    x += vx * h; y += vy * h;
    if (x < o.r) { x = 2 * o.r - x; vx = -vx; } else if (x > W - o.r) { x = 2 * (W - o.r) - x; vx = -vx; }
    if (y < o.r) { y = 2 * o.r - y; vy = -vy; } else if (y > H - o.r) { y = 2 * (H - o.r) - y; vy = -vy; }
    if (hull) {
      var dx = x - hull.cx, dy = y - hull.cy, q = dx * dx / (hull.ax * hull.ax) + dy * dy / (hull.ay * hull.ay);
      if (q < 1 && q > 1e-6) {
        var s = 1 / Math.sqrt(q), nx = dx / (hull.ax * hull.ax), ny = dy / (hull.ay * hull.ay), nd = Math.sqrt(nx * nx + ny * ny);
        nx /= nd; ny /= nd; x = hull.cx + dx * s; y = hull.cy + dy * s;
        var vn = vx * nx + vy * ny;
        if (vn < 0) { vx -= 2 * vn * nx; vy -= 2 * vn * ny; }
      }
    }
  }
  return { x: x, y: y };
}
// The hull as `b` bounces off it: an ellipse round the middle of the ship,
// grown by their size (and by how far it's risen).
function bsHull(m, b) {
  return { cx: m.sx, cy: m.sy + m.depth - m.L * 0.06, ax: m.L * 0.46 * m.k + b.r, ay: m.L * 0.1 * m.k + b.r };
}

// Each cannon leads them for its own moment: fired `fireIn` seconds from now
// (plus its place in the stagger), at `speed`, `lead` of the way to where
// they'll be. Then the spread fans the three out across their path, the last
// shot furthest along the way they're rolling. `ramp` (0..1) eases the lead
// in: the lines start on them and swing out ahead of them as the lock nears.
function bsAimCannons(m, other, fireIn, ramp) {
  var cn = m.cn, sweep = m.sweep;
  for (var i = 0; i < cn.count; i++) {
    var mz = bsMuzzle(m, i), wait = fireIn + i * cn.stagger, P = { x: other.x, y: other.y };
    for (var it = 0; it < 3; it++) {
      var fl = Math.sqrt((P.x - mz.x) * (P.x - mz.x) + (P.y - mz.y) * (P.y - mz.y)) / cn.speed;
      P = bsPredict(other, (wait + fl) * cn.lead * ramp, m);
    }
    var off = cn.count > 1 ? (i / (cn.count - 1) - 0.5) * 2 * cn.spread * Math.PI / 180 * sweep : 0;
    var want = Math.atan2(P.y - mz.y, P.x - mz.x) + off;
    m.aims[i] = m.aims[i] == null ? want : bsTurn(m.aims[i], want, 0.35);
  }
}
// The sweep runs the way they're rolling across the line of fire.
function bsSweep(m, other) {
  var dx = other.x - m.sx, dy = other.y - m.sy;
  return dx * other.vy - dy * other.vx >= 0 ? 1 : -1;
}

// From updateSpecial (special.js) for special.move "broadside".
function updateBroadside(self, other, dt) {
  var sp = self.char.special;
  if (!self.igbb) {
    if (over || self.specialT < sp.chargeTime || !canStartIgbb(self, other) || swordDuelActive() || self.plum || self.fknee || self.cmb) return false;
    clearActions(self);
    self.bsElbow = null; self.kneeAnim = null;
    var sh = bsDef(sp.ship, BS_SHIP_DEF), cn = bsDef(sp.cannons, BS_CANNON_DEF);
    var nm = self.igbb = { move: "broadside", phase: "rise", t: 0, owner: self.id, sh: sh, cn: cn, vo: bsDef(sp.volley, BS_VOLLEY_DEF),
      L: sh.length, clock: 0, k: 0, sx: W / 2, sy: H * sh.y, rot: 0, depth: sh.length * 0.75, dir: other.x >= W / 2 ? 1 : -1, face: 1, turnT: 0,
      from: { x: self.x, y: self.y }, lift: 0, volley: 0, shot: 0, locked: false, sweep: 1, aims: [], recoil: [], flash: [], fuseT: 0, splashT: 0 };
    bsShipMove(nm, 0);
    for (var i = 0; i < cn.count; i++) { nm.aims.push(null); nm.recoil.push(0); nm.flash.push(0); }
    bsAimCannons(nm, other, cn.aim, 0);
    bsShip = nm;
    floater(W / 2, H * sh.y - sh.length * 0.7, "BROADSIDE!", "crit");
    playBsSplash(true);
    crowdReact(0.7);
    if (self.bs) self.bs.shipLine = 0; // "I'll knock him out...", every time the ship comes in (bsLines)
  }
  var m = self.igbb;
  if (m.move !== "broadside") return false;
  if (!self.alive) { endBroadside(self); return false; }
  m.t += dt;
  self.vx = 0; self.vy = 0;
  if (over && m.phase !== "sink") bsStartSink(self, m); // the fight's over: it goes back down
  for (var j = 0; j < m.cn.count; j++) { m.recoil[j] = Math.max(0, m.recoil[j] - dt * 3.2); m.flash[j] = Math.max(0, m.flash[j] - dt); }
  var shc = m.sh, cnc = m.cn, vo = m.vo;
  if (m.phase === "rise") {
    m.k = easeOut(m.t / shc.rise);
    bsShipMove(m, dt);
    bsSplash(m, dt);
    // He hops on board over the last `board` seconds of it coming up.
    var h = Math.max(0, Math.min(1, (m.t - (shc.rise - shc.board)) / shc.board)), e = h * h * (3 - 2 * h), d = bsDeckSpot(m, self);
    m.lift = Math.sin(Math.PI * h) * BS_HOP;
    self.x = m.from.x + (d.x - m.from.x) * e;
    self.y = m.from.y + (d.y - m.from.y) * e - m.lift;
    m.hop = h;
    if (m.k > 0.25) bsMaybeTurn(m, other);
    bsAimCannons(m, other, shc.rise - m.t + cnc.aim, 0);
    if (m.t >= shc.rise) { m.phase = "aim"; m.t = 0; m.k = 1; m.lift = 0; m.sweep = bsSweep(m, other); }
    return true;
  }
  bsShipMove(m, dt);
  if (m.phase === "sink") {
    m.k = m.k0 * (1 - easeOut(m.t / shc.sink));
    bsSplash(m, dt);
    // The deck drops out from under him and he hops down onto the mat.
    var hs = Math.min(1, m.t / shc.sink);
    m.lift = Math.sin(Math.PI * hs) * BS_HOP * 0.45;
    self.x = m.land.x; self.y = m.land.y - m.lift;
    if (m.t >= shc.sink) { self.y = m.land.y; endBroadside(self); return false; }
    return true;
  }
  var spot = bsDeckSpot(m, self);
  self.x = spot.x; self.y = spot.y;
  if (m.phase === "aim") {
    var aimFor = m.volley === 0 ? cnc.aim : cnc.reaim, lockAt = aimFor - cnc.lock;
    if (m.turnT > 0) m.t = Math.min(m.t, lockAt - 0.02); // no lock until it's come about
    if (m.t < lockAt) {
      bsMaybeTurn(m, other);
      m.sweep = bsSweep(m, other);
      bsAimCannons(m, other, aimFor - m.t, Math.min(1, m.t / Math.max(0.05, lockAt)));
    } else if (!m.locked) {
      m.locked = true; playBsLock();
      bsAimCannons(m, other, aimFor - m.t, 1);
    }
    m.fuseT -= dt;
    if (m.fuseT <= 0) { m.fuseT = 0.09; playBsFuse(); }
    // The volley: each cannon `stagger` seconds after the last.
    while (m.shot < cnc.count && m.t >= aimFor + m.shot * cnc.stagger) { fireBsCannon(self, m, sp, m.shot); m.shot++; }
    if (m.shot >= cnc.count) { m.phase = "reload"; m.t = 0; m.volley++; }
  } else if (m.phase === "reload") {
    if (m.t >= vo.gap) {
      if (m.volley < vo.volleys && other.alive && !other.koOut) { m.phase = "aim"; m.t = 0; m.shot = 0; m.locked = false; }
      else { m.phase = "hold"; m.t = 0; }
    }
  } else if (m.phase === "hold" && m.t >= vo.hold) bsStartSink(self, m);
  return true;
}

// They've gone round to the stern: the ship comes about to face them.
function bsMaybeTurn(m, other) {
  if (m.turnT <= 0 && (other.x - m.sx) * m.dir < -40) { m.turnT = BS_TURN; playBsCreak(); }
}

function bsStartSink(self, m) {
  m.phase = "sink"; m.t = 0; m.locked = false; m.k0 = m.k;
  m.land = { x: self.x, y: self.y + m.lift }; // where his feet come down (mid-hop if it's cut short)
  playBsSplash(false);
}

function endBroadside(self) {
  if (bsShip === self.igbb) bsShip = null;
  self.igbb = null;
  self.specialT = 0;
  if (self.alive) setSpeed(self, self.baseSpeed || SPEED);
}

// Water thrown up round the hull while it rises out of the sea or goes back down.
function bsSplash(m, dt) {
  m.splashT -= dt;
  if (m.splashT > 0 || reduceMotion) return;
  m.splashT = 0.03;
  for (var i = 0; i < 3; i++) {
    var lx = (Math.random() - 0.5) * m.L * 1.05, p = bsShipPt(m, lx, 0), up = 120 + Math.random() * 220;
    particles.push({ x: p.x, y: m.sy + 4, vx: (Math.random() - 0.5) * 140, vy: -up, life: 0.45, max: 0.45, size: 2.5 + Math.random() * 3.5, color: i % 2 ? "#e8f6ff" : "#7cc4ec" });
  }
}

// One cannon going off: the muzzle flash, smoke, the barrel kicking back and
// a cannonball down its line. The first of each volley: BOOM.
function fireBsCannon(self, m, sp, i) {
  var a = m.aims[i], ux = Math.cos(a), uy = Math.sin(a), mz = bsMuzzle(m, i), cn = m.cn;
  bsShots.push({ x: mz.x, y: mz.y, vx: ux * cn.speed, vy: uy * cn.speed, r: cn.size, owner: self.id, t: 0, trail: [], dodged: false, puffT: 0 });
  m.recoil[i] = 1;
  m.flash[i] = 0.12;
  for (var k = 0; k < 8 && !reduceMotion; k++) {
    var sa = a + (Math.random() - 0.5) * 1.3, s = 40 + Math.random() * 150;
    bsSmoke.push({ x: mz.x, y: mz.y, vx: Math.cos(sa) * s, vy: Math.sin(sa) * s - 20, t: 0, max: 0.7 + Math.random() * 0.6, r: 9 + Math.random() * 10 });
  }
  for (var j = 0; j < 10 && !reduceMotion; j++) {
    var a2 = a + (Math.random() - 0.5) * 0.9, s2 = 200 + Math.random() * 300;
    particles.push({ x: mz.x, y: mz.y, vx: Math.cos(a2) * s2, vy: Math.sin(a2) * s2, life: 0.2, max: 0.2, size: 2 + Math.random() * 2.5, color: j % 2 ? "#ffd27a" : "#ff8a2a" });
  }
  if (i === 0) { var bow = bsPivot(m, 1); floater(bow.x, Math.max(30, m.sy - m.L * 0.36), "BOOM!", "crit"); crowdReact(0.5); } // up over the bow, clear of the hits
  if (!reduceMotion) shake = Math.max(shake, 9 + i * 2);
  playBsBoom();
}

function tickBsShots(dt) {
  if (!bsShots.length) return;
  bsShots = bsShots.filter(function (c) {
    c.t += dt;
    var owner = balls[c.owner], other = balls[1 - c.owner], sp = owner && owner.char.special;
    if (!owner || !sp) return false;
    var n = 4, h = dt / n, sv = Math.sqrt(c.vx * c.vx + c.vy * c.vy) || 1, ux = c.vx / sv, uy = c.vy / sv;
    for (var i = 0; i < n; i++) {
      c.x += c.vx * h; c.y += c.vy * h;
      if (!c.dodged && other.alive && !other.koOut && !over) {
        var ox = other.x - c.x, oy = other.y - c.y;
        if (ox * ox + oy * oy < (other.r + c.r) * (other.r + c.r)) {
          var dealt = hurtProjectile(other, sp.damage, c.owner, ux, uy);
          if (other.justDodged) { c.dodged = true; continue; } // teleported out of its way: it flies on
          if (dealt > 0) bsShotHit(c, other, sp, ux, uy, dealt);
          checkEnd();
          return false;
        }
      }
      if (c.x < c.r || c.x > W - c.r || c.y < c.r || c.y > H - c.r) { bsShotWall(c, ux, uy); return false; }
    }
    c.trail.push({ x: c.x, y: c.y });
    if (c.trail.length > 7) c.trail.shift();
    c.puffT -= dt;
    if (c.puffT <= 0 && !reduceMotion) { c.puffT = 0.035; bsSmoke.push({ x: c.x - ux * c.r, y: c.y - uy * c.r, vx: -ux * 30, vy: -uy * 30 - 10, t: 0, max: 0.4, r: c.r * 0.7 }); }
    return c.t < BS_FLIGHT;
  });
}

// A cannonball landing: splinters, smoke, a shockwave, and it shoves them
// across the cage (`knockback`, easing back to their own speed over `shove`).
function bsShotHit(c, other, sp, ux, uy, dealt) {
  floater(other.x, other.y - other.r - 30, "DIRECT HIT!", "crit");
  if (bsKnockable(other)) {
    other.vx = ux * sp.knockback; other.vy = uy * sp.knockback;
    other.speedEase = { t: 0, dur: sp.shove || 0.8, v0: sp.knockback };
  }
  other.squash = { t: 0.18, max: 0.18, nx: -ux, ny: -uy };
  impacts.push({ x: other.x - ux * other.r, y: other.y - uy * other.r, nx: -ux, ny: -uy, life: 0.45, max: 0.45, color: "#222222" });
  bsBurst(c.x, c.y, Math.atan2(-uy, -ux), 2.6, 16, 10);
  hitStop = Math.max(hitStop, 0.09);
  if (!reduceMotion) shake = Math.max(shake, 16);
  playBsHit(dealt);
  crowdReact(0.7);
}

// One that missed smashes into the cage.
function bsShotWall(c, ux, uy) {
  var x = Math.min(W - 6, Math.max(6, c.x)), y = Math.min(H - 6, Math.max(6, c.y));
  bsBurst(x, y, Math.atan2(-uy, -ux), 2.2, 10, 6);
  floater(Math.min(W - 40, Math.max(40, x)), Math.min(H - 20, Math.max(30, y)), "THUD", "note");
  if (!reduceMotion) shake = Math.max(shake, 6);
  playBsWall();
}

// Splinters (`n` wooden shards spinning off), smoke and sparks thrown back
// along `ang`, `wide` radians across.
function bsBurst(x, y, ang, wide, n, puffs) {
  if (reduceMotion) return;
  for (var i = 0; i < n; i++) {
    var a = ang + (Math.random() - 0.5) * wide, s = 160 + Math.random() * 300;
    bsSplinters.push({ x: x, y: y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, rot: Math.random() * 6.3, spin: (Math.random() - 0.5) * 30,
      len: 7 + Math.random() * 9, t: 0, max: 0.45 + Math.random() * 0.3, color: i % 3 ? "#9a6a35" : "#d9b27a" });
  }
  for (var j = 0; j < puffs; j++) {
    var a2 = ang + (Math.random() - 0.5) * 3, s2 = 40 + Math.random() * 120;
    bsSmoke.push({ x: x, y: y, vx: Math.cos(a2) * s2, vy: Math.sin(a2) * s2 - 20, t: 0, max: 0.6 + Math.random() * 0.5, r: 8 + Math.random() * 9 });
  }
  for (var k = 0; k < 8; k++) {
    var a3 = ang + (Math.random() - 0.5) * wide, s3 = 150 + Math.random() * 250;
    particles.push({ x: x, y: y, vx: Math.cos(a3) * s3, vy: Math.sin(a3) * s3, life: 0.25, max: 0.25, size: 2 + Math.random() * 2.5, color: k % 2 ? "#ffd27a" : "#555555" });
  }
}

function tickBsSmoke(dt) {
  if (bsSmoke.length) bsSmoke = bsSmoke.filter(function (p) {
    p.t += dt;
    var damp = Math.exp(-2.5 * dt);
    p.vx *= damp; p.vy *= damp;
    p.x += p.vx * dt; p.y += p.vy * dt;
    return p.t < p.max;
  });
  if (bsSplinters.length) bsSplinters = bsSplinters.filter(function (p) {
    p.t += dt;
    var damp = Math.exp(-3 * dt);
    p.vx *= damp; p.vy = p.vy * damp + 260 * dt;
    p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.spin * dt;
    return p.t < p.max;
  });
}

// From step() (physics.js), for each fighter rolling free: the hull is solid
// (`ship.solid`), so they bounce off it like the cage, and off him on deck.
function bispingShipBlock(b) {
  var m = bsShipNow();
  if (!m || !m.sh.solid || b.id === m.owner || m.k <= 0.05) return;
  var hl = bsHull(m, b), cx = hl.cx, cy = hl.cy, ax = hl.ax, ay = hl.ay;
  var dx = b.x - cx, dy = b.y - cy, q = (dx * dx) / (ax * ax) + (dy * dy) / (ay * ay);
  if (q < 1) {
    if (q < 1e-6) { dx = 0; dy = 1; q = 1 / (ay * ay); }
    var s = 1 / Math.sqrt(q);
    bsBounceOff(b, cx + dx * s, cy + dy * s, dx / (ax * ax), dy / (ay * ay));
  }
  var o = balls[m.owner];
  if (o && o.alive) {
    var ex = b.x - o.x, ey = b.y - o.y, ed = Math.sqrt(ex * ex + ey * ey), min = b.r + o.r + 6;
    if (ed < min && ed > 0) bsBounceOff(b, o.x + ex / ed * min, o.y + ey / ed * min, ex, ey);
  }
}
// From attemptGrab (grapple-duel.js): nobody takes him down off his own ship.
function bispingAboard(b) { return broadsideOn(b) && b.igbb === bsShip; }
function bsBounceOff(b, x, y, nx, ny) {
  var nd = Math.sqrt(nx * nx + ny * ny) || 1;
  nx /= nd; ny /= nd;
  b.x = Math.min(W - b.r, Math.max(b.r, x));
  b.y = Math.min(H - b.r, Math.max(b.r, y));
  var vn = b.vx * nx + b.vy * ny;
  if (vn < 0) { b.vx -= 2 * vn * nx; b.vy -= 2 * vn * ny; playBounce(); }
}

// ---------------------------------------------------------------- drawing

// His hands are drawn by drawBisping on deck (drawHands skips them,
// draw-attacks.js).
function bispingHandsBusy(b) { return broadsideOn(b) && b.alive; }

// The ship in the cage, if its captain is still aboard.
function bsShipNow() {
  var m = bsShip, o = m && balls && balls[m.owner];
  if (m && (!o || o.igbb !== m)) { bsShip = null; return null; }
  return m;
}
// Once he's on deck the hull goes over him, so he stands behind the rail;
// while he hops on or off it goes under him, with the masts.
function bsHullOverHim(m) {
  if (m.phase === "rise") return m.hop > 0.8;
  if (m.phase === "sink") return m.t < m.sh.sink * 0.2;
  return true;
}

// From draw(), under the fighters: the trail of a side step, and in
// Broadside the sea spreading over the mat, the ship's masts and sails (and
// its hull while he isn't on deck), the red aim lines and his shadow as he hops.
function drawBispingUnder() {
  bsGhosts.forEach(function (g) {
    var k = g.t / g.max;
    ctx.save();
    ctx.globalAlpha = 0.3 * (1 - k);
    ctx.fillStyle = g.color;
    ctx.beginPath(); ctx.arc(g.x, g.y, g.r * (1 - 0.15 * k), 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  });
  var m = bsShipNow();
  if (!m) return;
  var o = balls[m.owner];
  drawBsSea(m);
  drawBsShipRig(m);
  if (!bsHullOverHim(m)) drawBsShipHull(m);
  if (m.phase === "rise" || m.phase === "aim") drawBsAimLines(m);
  if (m.lift > 1) {
    ctx.save();
    ctx.globalAlpha = 0.28 * (1 - 0.4 * m.lift / BS_HOP);
    ctx.fillStyle = "#000000";
    ctx.beginPath(); ctx.ellipse(o.x, o.y + m.lift + o.r * 0.75, o.r * 0.8, o.r * 0.28, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
}

// How far the sea has spread over the mat (0..1): out from the ship as it
// rises, back in as it sinks.
function bsSeaK(m) {
  if (m.phase === "rise") return Math.min(1, m.t / (m.sh.rise * 0.6));
  if (m.phase === "sink") return 1 - Math.min(1, m.t / m.sh.sink);
  return 1;
}
// The sea over the whole cage: a blue wash (`ship.sea`, how strong) with
// wave crests rolling across it, and foam round the hull.
function drawBsSea(m) {
  var k = bsSeaK(m), a = m.sh.sea;
  if (k <= 0 || a <= 0) return;
  ctx.save();
  ctx.beginPath(); ctx.arc(m.sx, m.sy, 30 + easeOut(k) * Math.sqrt(W * W + H * H), 0, Math.PI * 2); ctx.clip();
  ctx.globalAlpha = a;
  ctx.fillStyle = "#1d6fa5"; ctx.fillRect(0, 0, W, H);
  ctx.globalAlpha = Math.min(1, a * 1.6);
  ctx.strokeStyle = "#cdeeff"; ctx.lineWidth = 2.5; ctx.lineCap = "round";
  var t = reduceMotion ? 0 : bsClock;
  for (var row = 0; row < 11; row++) {
    var y0 = 18 + row * 46, shift = (t * (row % 2 ? 26 : -22)) % 90;
    for (var x0 = -90 + (row % 2) * 45 + shift; x0 < W + 30; x0 += 90) {
      ctx.beginPath();
      for (var i = 0; i <= 8; i++) { var px = x0 + i * 4, py = y0 - Math.sin(i / 8 * Math.PI) * 5; if (i) ctx.lineTo(px, py); else ctx.moveTo(px, py); }
      ctx.stroke();
    }
  }
  ctx.restore();
  // Darker water and a ring of foam where the hull sits.
  var L = m.L, fk = Math.min(1, m.k * 1.3);
  ctx.save();
  ctx.globalAlpha = 0.35 * fk;
  ctx.fillStyle = "#0c3f63";
  ctx.beginPath(); ctx.ellipse(m.sx, m.sy + L * 0.04, L * 0.6, L * 0.09, 0, 0, Math.PI * 2); ctx.fill();
  ctx.globalAlpha = 0.7 * fk;
  ctx.strokeStyle = "#f2fbff"; ctx.lineWidth = 3; ctx.setLineDash([14, 8]); ctx.lineDashOffset = -t * 30;
  ctx.beginPath(); ctx.ellipse(m.sx, m.sy + L * 0.04, L * 0.6, L * 0.09, 0, 0, Math.PI * 2); ctx.stroke();
  ctx.restore();
}

// The ship's own frame (call between ctx.save() and ctx.restore()): only
// what's above the waterline shows, so it rises out of the sea and sinks back.
function bsShipClip(m) {
  ctx.beginPath(); ctx.rect(m.sx - m.L * 1.5, -H, m.L * 3, m.sy + m.L * 0.035 + H); ctx.clip();
}
function bsShipXform(m) {
  var f = Math.abs(m.face) < 0.03 ? (m.face < 0 ? -0.03 : 0.03) : m.face;
  ctx.translate(m.sx, m.sy + m.depth); ctx.rotate(m.rot); ctx.scale(f, 1);
}
function bsSpar(x0, y0, x1, y1, w) {
  ctx.strokeStyle = theme.wall; ctx.lineWidth = w + 3;
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
  ctx.strokeStyle = "#7a4a22"; ctx.lineWidth = w;
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
}

// The masts, the rigging, a Union Jack mainsail, a black foresail with a
// skull and crossbones, the crow's nest, a red pennant, and a Union Jack
// flying off the stern.
function drawBsShipRig(m) {
  var L = m.L, HL = L / 2, t = m.clock;
  var mainX = -L * 0.2, foreX = L * 0.13, mainTop = -L * 0.67, foreTop = -L * 0.56, sternX = -HL * 0.97;
  var sternTop = bsDeckY(L, sternX) - L * 0.075;
  ctx.save();
  bsShipClip(m); bsShipXform(m);
  ctx.lineJoin = "round"; ctx.lineCap = "round";
  // The rigging.
  ctx.strokeStyle = theme.wall; ctx.globalAlpha = 0.55; ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(mainX, mainTop); ctx.lineTo(sternX + 6, sternTop);
  ctx.moveTo(mainX, mainTop); ctx.lineTo(foreX, foreTop);
  ctx.moveTo(foreX, foreTop); ctx.lineTo(HL * 1.26, bsDeckY(L, HL) - L * 0.1);
  ctx.moveTo(mainX, mainTop + L * 0.05); ctx.lineTo(-HL * 0.55, bsDeckY(L, -HL * 0.55) - L * 0.035);
  ctx.moveTo(foreX, foreTop + L * 0.05); ctx.lineTo(HL * 0.7, bsDeckY(L, HL * 0.7) - L * 0.035);
  ctx.stroke();
  ctx.globalAlpha = 1;
  // The masts.
  bsSpar(mainX, bsDeckY(L, mainX), mainX, mainTop, 5);
  bsSpar(foreX, bsDeckY(L, foreX), foreX, foreTop, 4.5);
  // The sails, bellied out by the wind.
  drawBsSail(mainX, -L * 0.6, L * 0.33, L * 0.27, L * 0.045, t, bsUnionJack(), null);
  drawBsSail(foreX, -L * 0.5, L * 0.25, L * 0.21, L * 0.035, t + 1.3, null, "#18181b");
  drawSkullAndBones(ctx, foreX, -L * 0.5 + L * 0.115, L * 0.036);
  // The crow's nest and a red pennant streaming off the top of the mainmast.
  ctx.fillStyle = "#8a5a2b"; ctx.strokeStyle = theme.wall; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.rect(mainX - L * 0.035, -L * 0.645, L * 0.07, L * 0.03); ctx.fill(); ctx.stroke();
  var pw = Math.sin(t * 6) * 3;
  ctx.fillStyle = "#b3202a";
  ctx.beginPath(); ctx.moveTo(mainX, mainTop); ctx.quadraticCurveTo(mainX - L * 0.07, mainTop + pw, mainX - L * 0.14, mainTop + 5 + pw * 1.6); ctx.lineTo(mainX, mainTop + 11); ctx.closePath(); ctx.fill(); ctx.stroke();
  // The ensign: a Union Jack on a staff over the stern, flying aft.
  var staffTop = sternTop - L * 0.17;
  bsSpar(sternX + 4, sternTop, sternX - 4, staffTop, 2.5);
  drawUnionJack(ctx, sternX - 4, staffTop + 1, L * 0.18, -1, t);
  ctx.restore();
}

// A sail `w` wide hanging `h` from a yard at `top`, its foot bellied out
// `belly` and rippling. Drawn in strips: the image (`img`) or a plain `fill`.
function drawBsSail(x, top, w, h, belly, t, img, fill) {
  var N = 20, left = x - w / 2;
  var foot = function (u) { return h + belly * Math.sin(Math.PI * u) * (1 + 0.15 * Math.sin(t * 3 + u * 4)); };
  ctx.save();
  for (var i = 0; i < N; i++) {
    var u0 = i / N, bh = foot(u0 + 0.5 / N);
    if (img) ctx.drawImage(img, i * img.width / N, 0, img.width / N, img.height, left + u0 * w, top, w / N + 0.7, bh);
    else { ctx.fillStyle = fill; ctx.fillRect(left + u0 * w, top, w / N + 0.7, bh); }
  }
  ctx.strokeStyle = theme.wall; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(left, top);
  for (var j = 0; j <= N; j++) ctx.lineTo(left + j / N * w, top + foot(j / N));
  ctx.lineTo(left + w, top); ctx.closePath(); ctx.stroke();
  ctx.restore();
  bsSpar(left - 5, top, left + w + 5, top, 4); // the yard
}

// The hull: a stern castle, the rail sweeping up to the bow, a stripe in his
// red, gun ports, the bowsprit, then the three cannons on the bow and the sea
// lapping along the waterline.
function drawBsShipHull(m) {
  var L = m.L, HL = L / 2, dk = function (x) { return bsDeckY(L, x); }, rail = L * 0.035, wl = L * 0.06, castle = L * 0.075;
  ctx.save();
  bsShipClip(m);
  ctx.save();
  bsShipXform(m);
  ctx.lineJoin = "round"; ctx.lineCap = "round";
  bsSpar(HL * 0.8, dk(HL * 0.8) - rail, HL * 1.28, dk(HL) - L * 0.1, 5); // the bowsprit
  ctx.beginPath();
  ctx.moveTo(-HL, dk(-HL) - castle);
  ctx.lineTo(-HL * 0.62, dk(-HL * 0.62) - castle);
  ctx.lineTo(-HL * 0.6, dk(-HL * 0.6) - rail);
  for (var x = -HL * 0.6; x < HL * 0.96; x += HL * 0.06) ctx.lineTo(x, dk(x) - rail);
  ctx.lineTo(HL * 1.05, dk(HL) - L * 0.055);
  ctx.quadraticCurveTo(HL * 0.98, wl * 0.3, HL * 0.7, wl);
  ctx.lineTo(-HL * 0.86, wl);
  ctx.quadraticCurveTo(-HL * 1.03, wl * 0.2, -HL * 1.04, dk(-HL) - castle);
  ctx.closePath();
  ctx.fillStyle = "#6b3f1f"; ctx.fill();
  ctx.strokeStyle = theme.wall; ctx.lineWidth = 3; ctx.stroke();
  // Planks, following the sweep of the deck.
  ctx.strokeStyle = "rgba(0,0,0,0.28)"; ctx.lineWidth = 1.5;
  [0.06, 0.09].forEach(function (d) {
    ctx.beginPath();
    for (var x2 = -HL * 0.92; x2 <= HL * 0.85; x2 += HL * 0.08) { var y2 = dk(x2) + L * d; if (x2 === -HL * 0.92) ctx.moveTo(x2, y2); else ctx.lineTo(x2, y2); }
    ctx.stroke();
  });
  // His red stripe under the rail, and a gold cap rail along the top.
  ctx.strokeStyle = "#b3202a"; ctx.lineWidth = L * 0.022;
  ctx.beginPath();
  for (var x3 = -HL * 0.95; x3 <= HL * 0.98; x3 += HL * 0.06) { var y3 = dk(x3) + L * 0.002; if (x3 === -HL * 0.95) ctx.moveTo(x3, y3); else ctx.lineTo(x3, y3); }
  ctx.stroke();
  ctx.strokeStyle = BS_GOLD; ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.moveTo(-HL * 0.6, dk(-HL * 0.6) - rail);
  for (var x4 = -HL * 0.6; x4 < HL * 0.96; x4 += HL * 0.06) ctx.lineTo(x4, dk(x4) - rail);
  ctx.lineTo(HL * 1.05, dk(HL) - L * 0.055);
  ctx.moveTo(-HL * 1.02, dk(-HL) - castle); ctx.lineTo(-HL * 0.62, dk(-HL * 0.62) - castle);
  ctx.stroke();
  // Gun ports, and the stern windows.
  [-0.5, -0.25, 0, 0.25].forEach(function (u) {
    var gx = HL * u, gy = dk(gx) + L * 0.032, s = L * 0.032;
    ctx.fillStyle = "#151515"; ctx.strokeStyle = BS_GOLD; ctx.lineWidth = 1.8;
    ctx.beginPath(); ctx.rect(gx - s / 2, gy - s / 2, s, s); ctx.fill(); ctx.stroke();
  });
  [-0.92, -0.78].forEach(function (u) {
    var wx = HL * u, wy = dk(wx) - castle * 0.45;
    ctx.fillStyle = "#ffd98a"; ctx.strokeStyle = theme.wall; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.rect(wx - L * 0.018, wy - L * 0.014, L * 0.036, L * 0.028); ctx.fill(); ctx.stroke();
  });
  ctx.restore();
  // The cannons on the bow, each turned to its own line.
  var burn = bsBurn(m);
  for (var i = 0; i < m.cn.count; i++) {
    var p = bsPivot(m, i);
    if (m.aims[i] != null) drawBsCannon(p.x, p.y, m.aims[i], bsCannonLen(m), m.recoil[i], 0, m.phase === "aim" && i < m.shot ? 1 : burn, m.flash[i] > 0);
  }
  // The sea along the waterline.
  var wy2 = m.sy + L * 0.035, t = reduceMotion ? 0 : bsClock;
  ctx.fillStyle = "#1d6fa5";
  ctx.beginPath(); ctx.ellipse(m.sx, wy2 + 2, L * 0.62, L * 0.035, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = "#f2fbff"; ctx.lineWidth = 4;
  ctx.beginPath();
  for (var k = 0; k <= 30; k++) { var fx = m.sx - L * 0.58 + k / 30 * L * 1.16, fy = wy2 + Math.sin(k * 1.3 + t * 6) * 2.2; if (k) ctx.lineTo(fx, fy); else ctx.moveTo(fx, fy); }
  ctx.stroke();
  ctx.restore();
}

// How far the fuses have burned down: over the aim, then spent.
function bsBurn(m) {
  if (m.phase === "aim") return Math.min(1, m.t / (m.volley === 0 ? m.cn.aim : m.cn.reaim));
  return m.phase === "rise" ? 0 : 1;
}

// A Union Jack `w` wide (half as tall), its hoist (the edge on the pole) at
// x with its top at y, flying toward `dir` and waving more toward the fly end.
// Drawn once into a little canvas, then in strips so it waves.
var bsFlagImg = null;
function drawUnionJack(c, x, y, w, dir, t) {
  var img = bsUnionJack(), h = w / 2, N = 40, sw = img.width / N;
  var off = function (u) { return Math.sin(t * 7 - u * 5.5) * h * 0.13 * u; };
  c.save();
  c.translate(x, y);
  c.scale(dir, 1);
  for (var i = 0; i < N; i++) {
    var u0 = i / N, oy = off(u0 + 0.5 / N);
    c.drawImage(img, i * sw, 0, sw, img.height, u0 * w, oy, w / N + 0.7, h);
  }
  c.strokeStyle = theme.wall; c.lineWidth = 1.5; c.lineJoin = "round";
  c.beginPath();
  for (var j = 0; j <= N; j++) { var u = j / N; if (j) c.lineTo(u * w, off(u)); else c.moveTo(0, off(0)); }
  for (var k = N; k >= 0; k--) { var v = k / N; c.lineTo(v * w, off(v) + h); }
  c.closePath(); c.stroke();
  c.restore();
}
function bsUnionJack() {
  if (bsFlagImg) return bsFlagImg;
  var cv = document.createElement("canvas"), k = 5;
  cv.width = 60 * k; cv.height = 30 * k;
  var c = cv.getContext("2d");
  c.scale(k, k);
  c.fillStyle = "#012169"; c.fillRect(0, 0, 60, 30);
  var saltire = function () { c.beginPath(); c.moveTo(0, 0); c.lineTo(60, 30); c.moveTo(60, 0); c.lineTo(0, 30); c.stroke(); };
  var cross = function () { c.beginPath(); c.moveTo(30, 0); c.lineTo(30, 30); c.moveTo(0, 15); c.lineTo(60, 15); c.stroke(); };
  c.strokeStyle = "#ffffff"; c.lineWidth = 6; saltire();
  // The red diagonals sit off centre (counterchanged): clip to the four
  // triangles that keep one half of each.
  c.save();
  c.beginPath();
  c.moveTo(30, 15); c.lineTo(60, 15); c.lineTo(60, 30); c.closePath();
  c.moveTo(30, 15); c.lineTo(30, 30); c.lineTo(0, 30); c.closePath();
  c.moveTo(30, 15); c.lineTo(0, 15); c.lineTo(0, 0); c.closePath();
  c.moveTo(30, 15); c.lineTo(30, 0); c.lineTo(60, 0); c.closePath();
  c.clip();
  c.strokeStyle = "#c8102e"; c.lineWidth = 4; saltire();
  c.restore();
  c.strokeStyle = "#ffffff"; c.lineWidth = 10; cross();
  c.strokeStyle = "#c8102e"; c.lineWidth = 6; cross();
  bsFlagImg = cv;
  return cv;
}

// The red dashed lines from the cannons' muzzles out to the cage: they
// follow them, then lock and flash for the last `lock` seconds (the tell).
function drawBsAimLines(m) {
  var on = m.phase === "rise" ? 0.3 * m.k : 1, flash = m.locked ? 0.55 + 0.45 * Math.sin(bsClock * 40) : 0.8;
  ctx.save();
  ctx.lineCap = "round";
  ctx.setLineDash([12, 9]); ctx.lineDashOffset = -bsClock * 90;
  ctx.strokeStyle = "#e0221b"; ctx.lineWidth = m.locked ? 5 : 3.5;
  ctx.globalAlpha = on * flash;
  for (var i = 0; i < m.cn.count; i++) {
    if (m.aims[i] == null || (m.phase === "aim" && i < m.shot)) continue; // that one's gone
    var mz = bsMuzzle(m, i), ux = Math.cos(m.aims[i]), uy = Math.sin(m.aims[i]);
    var tx = ux > 0 ? (W - mz.x) / ux : (ux < 0 ? -mz.x / ux : Infinity), ty = uy > 0 ? (H - mz.y) / uy : (uy < 0 ? -mz.y / uy : Infinity);
    var len = Math.max(0, Math.min(tx, ty));
    ctx.beginPath(); ctx.moveTo(mz.x, mz.y); ctx.lineTo(mz.x + ux * len, mz.y + uy * len); ctx.stroke();
  }
  ctx.restore();
}

// A pirate's cannon on a wooden carriage, barrel along `ang`, `len` long
// (three of them on the ship's bow). `recoil` 0..1 slides the barrel back,
// `drop` 0..1 sinks it in from below, `burn` 0..1 is how far the fuse has
// burned down, `flash` lights the muzzle.
function drawBsCannon(x, y, ang, len, recoil, drop, burn, flash) {
  var ux = Math.cos(ang), uy = Math.sin(ang), px = -uy, py = ux;
  ctx.save();
  ctx.translate(x - ux * recoil * len * 0.16, y - uy * recoil * len * 0.16 + drop * 30);
  ctx.lineJoin = "round"; ctx.lineCap = "round";
  // Shadow on the mat.
  ctx.fillStyle = "rgba(0,0,0,0.22)";
  ctx.beginPath(); ctx.ellipse(0, len * 0.22, len * 0.62, len * 0.18, 0, 0, Math.PI * 2); ctx.fill();
  // The carriage: a wooden block under the barrel.
  ctx.save(); ctx.rotate(ang);
  ctx.fillStyle = "#8a5a2b"; ctx.strokeStyle = theme.wall; ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.rect(-len * 0.42, -len * 0.2, len * 0.6, len * 0.4); ctx.fill(); ctx.stroke();
  ctx.strokeStyle = "rgba(0,0,0,0.25)"; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(-len * 0.42, -len * 0.06); ctx.lineTo(len * 0.18, -len * 0.06); ctx.moveTo(-len * 0.42, len * 0.07); ctx.lineTo(len * 0.18, len * 0.07); ctx.stroke();
  ctx.restore();
  // Two wheels, one each side of the carriage.
  [-1, 1].forEach(function (s) {
    var wx = px * s * len * 0.3 - ux * len * 0.08, wy = py * s * len * 0.3 - uy * len * 0.08, wr = len * 0.2;
    ctx.fillStyle = "#6b4220"; ctx.strokeStyle = theme.wall; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.arc(wx, wy, wr, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = "#3a2410"; ctx.lineWidth = 1.6;
    for (var k = 0; k < 4; k++) {
      var a = k * Math.PI / 4;
      ctx.beginPath(); ctx.moveTo(wx + Math.cos(a) * wr * 0.85, wy + Math.sin(a) * wr * 0.85); ctx.lineTo(wx - Math.cos(a) * wr * 0.85, wy - Math.sin(a) * wr * 0.85); ctx.stroke();
    }
    ctx.fillStyle = "#2a2a2a"; ctx.beginPath(); ctx.arc(wx, wy, wr * 0.25, 0, Math.PI * 2); ctx.fill();
  });
  // The iron barrel: thick at the back, a ring at the muzzle, the knob behind.
  ctx.save(); ctx.rotate(ang);
  var back = -len * 0.38, front = len * 0.62, rb = len * 0.17, rf = len * 0.12;
  ctx.fillStyle = "#1f2226"; ctx.strokeStyle = theme.wall; ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.arc(back - rb * 0.55, 0, rb * 0.42, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); // the knob
  ctx.beginPath();
  ctx.moveTo(back, -rb); ctx.lineTo(front, -rf); ctx.lineTo(front, rf); ctx.lineTo(back, rb);
  ctx.quadraticCurveTo(back - rb * 0.4, 0, back, -rb); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.rect(front - len * 0.07, -rf * 1.25, len * 0.08, rf * 2.5); ctx.fill(); ctx.stroke(); // the muzzle ring
  ctx.beginPath(); ctx.rect(back + len * 0.18, -rb * 0.98, len * 0.05, rb * 1.96); ctx.fill(); ctx.stroke(); // a band
  ctx.fillStyle = "rgba(255,255,255,0.28)"; // the shine along the top
  ctx.beginPath(); ctx.moveTo(back + len * 0.04, -rb * 0.62); ctx.lineTo(front - len * 0.1, -rf * 0.55); ctx.lineTo(front - len * 0.1, -rf * 0.25); ctx.lineTo(back + len * 0.04, -rb * 0.3); ctx.closePath(); ctx.fill();
  // The fuse out of the touch hole, burning down, a spark at its tip.
  var hx = back + len * 0.08, fl = len * 0.22 * (1 - burn);
  if (fl > 1) {
    ctx.strokeStyle = "#c9b48a"; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(hx, -rb * 0.9); ctx.quadraticCurveTo(hx - fl * 0.5, -rb * 0.9 - fl * 0.6, hx - fl * 0.2, -rb * 0.9 - fl); ctx.stroke();
    if (burn > 0) {
      var sx = hx - fl * 0.2, sy = -rb * 0.9 - fl, fr = 4 + 2 * Math.sin(bsClock * 50);
      ctx.fillStyle = "#ff8a2a"; ctx.beginPath(); ctx.arc(sx, sy, fr + 2, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#fff3b0"; ctx.beginPath(); ctx.arc(sx, sy, fr * 0.6, 0, Math.PI * 2); ctx.fill();
    }
  }
  if (flash) { // the muzzle flash
    ctx.fillStyle = "#ffd27a"; ctx.beginPath();
    for (var i = 0; i < 10; i++) {
      var fa = (i / 10) * Math.PI - Math.PI / 2, fr2 = i % 2 ? len * 0.18 : len * 0.42;
      var fx = front + Math.cos(fa) * fr2, fy = Math.sin(fa) * fr2 * 0.9;
      if (i) ctx.lineTo(fx, fy); else ctx.moveTo(fx, fy);
    }
    ctx.closePath(); ctx.fill();
  }
  ctx.restore();
  ctx.restore();
}

// From draw(), per fighter after his body: on deck, the hull in front of him
// (he stands behind the rail), one arm pointing them out to the cannons and
// a fist up, and the captain's hat.
function drawBisping(b, other) {
  if (!b.alive || !broadsideOn(b)) return;
  var m = b.igbb, sp = m.sh, r = b.r;
  if (m === bsShipNow() && bsHullOverHim(m)) drawBsShipHull(m);
  var hatIn = m.phase === "rise" ? easeOut(m.t / sp.rise) : (m.phase === "sink" ? Math.max(0, 1 - m.t / sp.sink) : 1);
  var size = (b.char.punch && b.char.punch.size) || 13, limb = size * 0.62;
  var ang = Math.atan2(other.y - b.y, other.x - b.x), fx = Math.cos(ang) >= 0 ? 1 : -1;
  // The pointing arm, toward them.
  var sh1 = { x: b.x + Math.cos(ang) * r * 0.62, y: b.y + Math.sin(ang) * r * 0.62 };
  var h1 = { x: b.x + Math.cos(ang) * r * 1.35, y: b.y + Math.sin(ang) * r * 1.35 };
  strokeLimb(limb, armColor(b.char, 0), function () { ctx.moveTo(sh1.x, sh1.y); ctx.lineTo(h1.x, h1.y); });
  drawGloveAt(h1.x, h1.y, size * 0.7, b.char, ang);
  ctx.save(); ctx.lineCap = "round";
  var px = h1.x + Math.cos(ang) * size * 1.15, py = h1.y + Math.sin(ang) * size * 1.15;
  ctx.strokeStyle = theme.wall; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(h1.x, h1.y); ctx.lineTo(px, py); ctx.stroke();
  ctx.strokeStyle = b.char.look ? b.char.look.gloves : "#151515"; ctx.lineWidth = 4.5; ctx.beginPath(); ctx.moveTo(h1.x, h1.y); ctx.lineTo(px, py); ctx.stroke();
  ctx.restore();
  // The other fist up over his head, pumping as the volley goes.
  var pump = m.phase === "aim" && m.locked ? Math.abs(Math.sin(bsClock * 14)) * r * 0.15 : 0;
  var sh2 = { x: b.x - fx * r * 0.62, y: b.y - r * 0.1 };
  var h2 = { x: b.x - fx * r * 0.85, y: b.y - r * 1.25 - pump };
  strokeLimb(limb, armColor(b.char, 0), function () { ctx.moveTo(sh2.x, sh2.y); ctx.lineTo(h2.x, h2.y); });
  drawGloveAt(h2.x, h2.y, size * 0.7, b.char, -Math.PI / 2);
  drawTricorne(b.x, b.y - r * (0.8 + 0.5 * (1 - hatIn)), r * 0.82, hatIn);
}

// A black captain's tricorne with gold trim and a little white skull on the
// front, sitting on top of his head.
function drawTricorne(x, y, r, alpha) {
  if (alpha <= 0) return;
  ctx.save();
  ctx.globalAlpha = Math.min(1, alpha);
  ctx.translate(x, y);
  ctx.lineJoin = "round"; ctx.lineCap = "round";
  // The crown.
  ctx.fillStyle = "#1a1a1d"; ctx.strokeStyle = theme.wall; ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.moveTo(-r * 0.42, 0); ctx.quadraticCurveTo(-r * 0.42, -r * 0.48, 0, -r * 0.5); ctx.quadraticCurveTo(r * 0.42, -r * 0.48, r * 0.42, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
  // The cocked brim: up at both sides, a point at the front.
  var brim = function () {
    ctx.beginPath();
    ctx.moveTo(-r * 0.98, -r * 0.34);
    ctx.quadraticCurveTo(-r * 0.62, -r * 0.04, 0, r * 0.08);
    ctx.quadraticCurveTo(r * 0.62, -r * 0.04, r * 0.98, -r * 0.34);
    ctx.quadraticCurveTo(r * 0.7, -r * 0.08, r * 0.4, -r * 0.12);
    ctx.quadraticCurveTo(0, -r * 0.02, -r * 0.4, -r * 0.12);
    ctx.quadraticCurveTo(-r * 0.7, -r * 0.08, -r * 0.98, -r * 0.34);
    ctx.closePath();
  };
  ctx.fillStyle = "#26262a"; brim(); ctx.fill(); ctx.stroke();
  ctx.strokeStyle = BS_GOLD; ctx.lineWidth = Math.max(1.5, r * 0.05);
  ctx.beginPath(); ctx.moveTo(-r * 0.92, -r * 0.3); ctx.quadraticCurveTo(-r * 0.6, -r * 0.05, 0, r * 0.03); ctx.quadraticCurveTo(r * 0.6, -r * 0.05, r * 0.92, -r * 0.3); ctx.stroke();
  // The skull and crossbones on the front.
  drawSkullAndBones(ctx, 0, -r * 0.2, r * 0.14);
  ctx.restore();
}

// A white skull over crossed bones, `s` the skull's radius, centred on x, y.
// `c` is the canvas context (fighter art draws on its own).
function drawSkullAndBones(c, x, y, s) {
  c.save();
  c.translate(x, y);
  c.lineCap = "round";
  // The bones, crossed behind it, with knobbly ends.
  [-1, 1].forEach(function (d) {
    var ex = s * 1.55, ey = s * 1.2 * d;
    c.strokeStyle = "#f2efe6"; c.lineWidth = s * 0.42;
    c.beginPath(); c.moveTo(-ex, -ey + s * 0.35); c.lineTo(ex, ey + s * 0.35); c.stroke();
    c.fillStyle = "#f2efe6";
    [[-ex, -ey + s * 0.35], [ex, ey + s * 0.35]].forEach(function (p) {
      [-1, 1].forEach(function (k) { c.beginPath(); c.arc(p[0] + k * s * 0.14 * d, p[1] - k * s * 0.18, s * 0.26, 0, Math.PI * 2); c.fill(); });
    });
  });
  // The skull: the dome and the jaw.
  c.fillStyle = "#f2efe6";
  c.beginPath(); c.arc(0, -s * 0.1, s, 0, Math.PI * 2); c.fill();
  c.beginPath(); c.rect(-s * 0.55, s * 0.4, s * 1.1, s * 0.6); c.fill();
  // Eye sockets, the nose, the teeth.
  c.fillStyle = "#151515";
  [-1, 1].forEach(function (k) { c.beginPath(); c.ellipse(k * s * 0.4, -s * 0.05, s * 0.27, s * 0.32, 0, 0, Math.PI * 2); c.fill(); });
  c.beginPath(); c.moveTo(0, s * 0.3); c.lineTo(-s * 0.12, s * 0.5); c.lineTo(s * 0.12, s * 0.5); c.closePath(); c.fill();
  c.strokeStyle = "#151515"; c.lineWidth = Math.max(0.8, s * 0.1);
  [-0.2, 0.2].forEach(function (k) { c.beginPath(); c.moveTo(k * s, s * 0.62); c.lineTo(k * s, s * 0.98); c.stroke(); });
  c.restore();
}

// From draw(), over both fighters (after the clinch, knees.js): the elbow
// thrown in the clinch, the cannonballs, their smoke and splinters, the 10-9 cards.
function drawBispingOver() {
  balls.forEach(function (b) {
    var e = b.bsElbow;
    if (!b.alive || !e) return;
    var o = balls[e.targetId], ang = Math.atan2(o.y - b.y, o.x - b.x), p = Math.min(1, e.t / e.dur);
    var glow = e.hit ? Math.max(0, 1 - (e.t - e.dur * ELBOW_HIT) / 0.15) : 0;
    drawElbowTrail(b, ang, e.side, p, false);
    drawElbowArm(b, ang, e.side, p, false, glow);
  });
  bsSmoke.forEach(function (p) {
    var k = p.t / p.max;
    ctx.save();
    ctx.globalAlpha = 0.55 * (1 - k);
    ctx.fillStyle = k < 0.15 ? "#e8e2d6" : "#b9b5ad";
    ctx.beginPath(); ctx.arc(p.x, p.y, p.r * (0.7 + k * 0.9), 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  });
  bsSplinters.forEach(function (p) {
    var k = p.t / p.max;
    ctx.save();
    ctx.globalAlpha = k > 0.7 ? (1 - k) / 0.3 : 1;
    ctx.translate(p.x, p.y); ctx.rotate(p.rot);
    ctx.fillStyle = p.color; ctx.strokeStyle = theme.wall; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(-p.len / 2, -1.5); ctx.lineTo(p.len / 2, 0); ctx.lineTo(-p.len / 2, 2); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.restore();
  });
  bsShots.forEach(function (c) {
    ctx.save();
    c.trail.forEach(function (q, i) {
      ctx.globalAlpha = 0.12 + 0.05 * i;
      ctx.fillStyle = "#3a3a3a";
      ctx.beginPath(); ctx.arc(q.x, q.y, c.r * (0.5 + 0.08 * i), 0, Math.PI * 2); ctx.fill();
    });
    ctx.globalAlpha = 1;
    ctx.fillStyle = "#141414"; ctx.strokeStyle = theme.wall; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "rgba(255,255,255,0.45)";
    ctx.beginPath(); ctx.arc(c.x - c.r * 0.35, c.y - c.r * 0.35, c.r * 0.3, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  });
  balls.forEach(function (b) { if (b.alive && b.bs && b.bs.card) drawBsCard(b, b.bs.card); });
}

// A judge's scorecard over him: 10-9 in big black numbers.
function drawBsCard(b, card) {
  var k = card.t / BS_CARD_T, pop = Math.min(1, card.t / 0.12);
  var w = 58, h = 40, x = b.x, y = b.y - b.r - 44 - k * 14;
  if (y - h / 2 < 4) y = b.y + b.r + 34 + k * 14;
  ctx.save();
  ctx.globalAlpha = k > 0.75 ? Math.max(0, 1 - (k - 0.75) / 0.25) : 1;
  ctx.translate(x, y); ctx.scale(0.6 + 0.4 * pop, 0.6 + 0.4 * pop); ctx.rotate(-0.06);
  ctx.fillStyle = "#fbfaf5"; ctx.strokeStyle = theme.wall; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.rect(-w / 2, -h / 2, w, h); ctx.fill(); ctx.stroke();
  ctx.fillStyle = "#b3202a"; ctx.fillRect(-w / 2 + 1.5, -h / 2 + 1.5, w - 3, 7);
  ctx.fillStyle = "#151515"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.font = "900 24px \"Barlow Condensed\", \"Arial Narrow\", sans-serif";
  ctx.fillText("10-9", 0, 4);
  ctx.restore();
}

// ---------------------------------------------------------------- his look (fighter-art.js)

// A black pirate's patch over one eye ("right" is his right eye, on screen
// left, the one he lost), its strap running across his forehead to the ear.
function drawEyePatch(c, r, side, lw) {
  var s = side === "left" ? 1 : -1, ex = s * r * 0.24, ey = -r * 0.6;
  c.save();
  c.lineCap = "round"; c.lineJoin = "round";
  // The strap: from the inside corner up across the forehead to the far side
  // of the head, and from the outside edge back round to his ear.
  c.strokeStyle = "#0d0d0f"; c.lineWidth = lw(0.045);
  c.beginPath(); c.moveTo(ex - s * r * 0.1, ey - r * 0.1); c.quadraticCurveTo(-s * r * 0.2, ey - r * 0.2, -s * r * 0.74, -r * 0.84); c.stroke();
  c.beginPath(); c.moveTo(ex + s * r * 0.15, ey - r * 0.03); c.quadraticCurveTo(s * r * 0.55, ey - r * 0.05, s * r * 0.78, ey + r * 0.02); c.stroke();
  // The patch: a rounded shield shape.
  var g = c.createLinearGradient(0, ey - r * 0.13, 0, ey + r * 0.13);
  g.addColorStop(0, "#34343a"); g.addColorStop(1, "#070708");
  c.fillStyle = g; c.strokeStyle = "#000000"; c.lineWidth = lw(0.025);
  c.beginPath();
  c.moveTo(ex - r * 0.17, ey - r * 0.1);
  c.quadraticCurveTo(ex, ey - r * 0.16, ex + r * 0.17, ey - r * 0.1);
  c.quadraticCurveTo(ex + r * 0.18, ey + r * 0.06, ex, ey + r * 0.14);
  c.quadraticCurveTo(ex - r * 0.18, ey + r * 0.06, ex - r * 0.17, ey - r * 0.1);
  c.closePath(); c.fill(); c.stroke();
  // A little shine on the leather.
  c.fillStyle = "rgba(255,255,255,0.3)";
  c.beginPath(); c.ellipse(ex - r * 0.06, ey - r * 0.06, r * 0.06, r * 0.022, -0.3, 0, Math.PI * 2); c.fill();
  c.restore();
}

// The skull and crossbones on the outside of his left leg (on screen right).
function drawJollyRogerShorts(c, r, look, sTop, band) {
  var x = r * 0.44, y = sTop + band + (r - sTop - band) * 0.4;
  drawSkullAndBones(c, x, y, r * 0.1);
}

// ---------------------------------------------------------------- gallery

function bispingGalleryMoves(ch, add) {
  var g = ch.bisping;
  if (g.footwork) add("👣", "Hit and move", "After every punch, kick or combination he steps back out at an angle, facing them, then walks back in on an angle and circles at the edge of his range.");
  if (g.scorecard) add("📋", "Scorecard", "Racks up points: every " + g.scorecard.every + " strikes he lands a judge's card pops up over him reading 10-9 (up to " + g.scorecard.max + " a fight).");
  if (g.clinch && g.clinch.elbows) add("💥", "Knees and elbows", "Every time he's in the clinch (\"KNEES AND ELBOWS!\") he throws an elbow (" + g.clinch.damage + ", " + g.clinch.critChance + "% critical for " + g.clinch.critMult + "x" + (g.clinch.cut ? ", and a crit can cut them" : "") + ") after each knee but the last, one hand keeping their head down. Nobody slips or blocks them in there.");
  if (g.kickDodge) add("↔️", "Side step", "When they throw a kick at him, " + g.kickDodge.chance + "% of the time he steps off to the side and it misses (\"SIDESTEP\"). He doesn't check a kick he's stepping out of.");
  if (g.kickAngle) add("📐", "Angle kick", "Before his own kick" + ((g.kickAngle.chance != null ? g.kickAngle.chance : 100) < 100 ? " (" + g.kickAngle.chance + "% of them)" : "") + " he steps off to an angle first, then the kick goes.");
  if (g.punish) add("🏴‍☠️", "Grappler hater", "A takedown he stuffs gets punished " + g.punish.chance + "% of the time: he catches them bent over from the shot and goes straight into the clinch for " + g.punish.knees[0] + "-" + g.punish.knees[1] + " knees with elbows in between.");
}

function bispingSpecialInfo(sp) {
  var sh = bsDef(sp.ship, BS_SHIP_DEF), cn = bsDef(sp.cannons, BS_CANNON_DEF), vo = bsDef(sp.volley, BS_VOLLEY_DEF);
  return "The sea spreads over the mat and a pirate ship rises out of it in the middle of the cage: a Union Jack mainsail, a black skull-and-crossbones foresail, a Union Jack off the stern. He hops on deck in a captain's hat and it bobs and drifts while " + cn.count +
    " cannons on the bow lead them, fanned out along the way they're rolling. The red lines lock and flash, then the volley: " + vo.volleys + " of them, " + cn.count + " cannonballs each. A hit does " + sp.damage +
    " (can't be slipped or blocked) and shoves them across the cage; a miss smashes into the cage." + (sh.solid ? " The hull is solid, so they bounce off it." : "") + " Then the ship sinks back into the sea. Nothing lands on him while he's aboard.";
}

function bispingGalleryAssets(list) {
  list.push({ name: "Pirate ship", info: "Michael Bisping's Broadside: Union Jack mainsail, three cannons on the bow.", w: 340, h: 260, draw: function (c, w, h) {
    withCtx(c, function () {
      var L = 215, m = { L: L, sx: w * 0.53, sy: h * 0.84, depth: 0, rot: -0.02, face: 1, clock: 0.6, k: 1, phase: "aim", t: 0.55, volley: 0, shot: 0,
        sh: BS_SHIP_DEF, cn: { count: 3, aim: 1, reaim: 0.75 }, aims: [-0.55, -0.3, -0.05], recoil: [0, 0, 0.6], flash: [0, 0, 0.1] };
      ctx.fillStyle = "#1d6fa5"; ctx.fillRect(0, m.sy - 4, w, h - m.sy + 4);
      drawBsShipRig(m); drawBsShipHull(m);
    });
  } });
}

function bispingGallerySounds(groups, synth) {
  groups.push({ title: "Michael Bisping", items: [
    synth("Ship rises", "Broadside: the ship coming up out of the sea, and the bell.", function () { playBsSplash(true); }),
    synth("Ship comes about", "Turning its bow to face them.", function () { playBsCreak(); }),
    synth("Fuse", "The fuses burning while he aims.", function () { playBsFuse(); }),
    synth("Cannon fire", "BOOM, one cannon of the volley.", function () { playBsBoom(); }),
    synth("Cannonball hit", "A cannonball hitting them.", function () { lastPunchSound = 0; playBsHit(16); }),
    synth("Cannonball on the cage", "A cannonball that missed.", function () { playBsWall(); }),
    synth("Ship sinks", "Going back down into the sea.", function () { playBsSplash(false); }),
    synth("Side step", "Stepping off to the side of a kick, or to an angle for his own.", function () { playBsStep(); }),
    synth("Scorecard", "A 10-9 card popping up.", function () { playBsCard(); })
  ] });
}

// ---------------------------------------------------------------- sound

function bsAudio(fn) {
  try {
    var ac = getAudioCtx();
    if (!ac) return;
    if (ac.state === "suspended") ac.resume();
    fn(ac, ac.currentTime);
  } catch (e) { /* never let audio break the game */ }
}
// The ship surging up out of the sea (a wash of water, the timbers groaning
// and the ship's bell), or going back down (`up` false: just the water).
function playBsSplash(up) {
  bsAudio(function (ac, t) {
    caneBurst(ac, t, 520, 0.6, 0.55, 0.7);
    caneBurst(ac, t + 0.08, 1500, 0.8, 0.3, 0.5);
    caneTone(ac, t, "sine", up ? 70 : 110, up ? 120 : 50, 0.35, 0.6);
    if (up) {
      caneTone(ac, t + 0.25, "sawtooth", 150, 120, 0.05, 0.4);
      caneTone(ac, t + 0.5, "sine", 1240, 1236, 0.3, 1.1);
      caneTone(ac, t + 0.5, "sine", 2480, 2470, 0.08, 0.6);
    }
  });
}
// The hull creaking round as it comes about.
function playBsCreak() { bsAudio(function (ac, t) { caneTone(ac, t, "sawtooth", 170, 120, 0.06, 0.35); caneTone(ac, t + 0.12, "sawtooth", 140, 100, 0.05, 0.25); }); }
// The fuse fizzing.
function playBsFuse() { bsAudio(function (ac, t) { caneBurst(ac, t, 5200 + Math.random() * 1500, 0.8, 0.08, 0.08); }); }
// The aim locking: a sharp click of the carriage.
function playBsLock() { bsAudio(function (ac, t) { caneBurst(ac, t, 3200, 3, 0.3, 0.03); caneTone(ac, t, "square", 900, 700, 0.06, 0.04); }); }
// The cannon going off: a deep boom and a crack.
function playBsBoom() {
  bsAudio(function (ac, t) {
    caneTone(ac, t, "sine", 120, 34, 0.95, 0.65);
    caneBurst(ac, t, 380, 0.6, 0.95, 0.4);
    caneBurst(ac, t, 1600, 0.9, 0.55, 0.12);
    caneTone(ac, t, "triangle", 240, 60, 0.35, 0.3);
  });
}
// A cannonball hitting them: a heavy thud on top of the punch.
function playBsHit(dealt) {
  playPunch(dealt * 1.5);
  bsAudio(function (ac, t) { caneTone(ac, t, "sine", 160, 45, 0.8, 0.3); caneBurst(ac, t, 700, 1, 0.6, 0.15); });
}
// Smashing into the cage.
function playBsWall() {
  bsAudio(function (ac, t) {
    caneBurst(ac, t, 900, 1.1, 0.6, 0.18);
    caneTone(ac, t, "sine", 150, 55, 0.5, 0.25);
    caneBurst(ac, t + 0.05, 2400, 2, 0.25, 0.1);
  });
}
// A quick shuffle of the feet: a side step.
function playBsStep() { bsAudio(function (ac, t) { caneBurst(ac, t, 1500, 0.8, 0.07, 0.05); caneBurst(ac, t + 0.06, 1300, 0.8, 0.05, 0.04); }); }
// A judge's card flicked up.
function playBsCard() { bsAudio(function (ac, t) { caneBurst(ac, t, 2800, 2.2, 0.18, 0.05); caneTone(ac, t + 0.02, "sine", 1320, 1290, 0.12, 0.3); }); }
