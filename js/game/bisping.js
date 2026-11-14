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
//             sprawls on a shot, `clinch` as the clinch starts, `combo` after
//             a combination where every strike landed, `blind` when a hit
//             lands from his blind side (the patched eye, screen left) or he
//             misses (a punch or kick, `missChance`%; a cannonball,
//             `cannonMissChance`%), at most `blindMax` a fight.
// Broadside   his special (special.move "broadside"): a pirate cannon rolls
//             in at his side with a Union Jack on a pole planted behind it,
//             and he puts on a captain's tricorne. He holds a lit linstock to
//             the fuse while a red line shows where it's aimed (it follows
//             them, then locks for the last `lock` seconds: the tell), then
//             BOOM: a cannonball flies down the line at `speed`. `shots`
//             shots, `gap` seconds apart, the first aimed for `aim` seconds
//             and the rest for `reaim`. A cannonball that hits does `damage`
//             (can't be slipped or blocked) and knocks them back `knockback`;
//             one that misses smashes into the cage. Nothing lands on him
//             while he's at the cannon (like the other specials).
// The special runs on b.igbb (move "broadside"), like every special.
"use strict";

// Registered here rather than in special.js's table (gsp.js does the same).
SPECIAL_MOVES.broadside = "Broadside";

var BS_CARD_T = 1.3;     // how long a 10-9 card stays up
var BS_CANNON_OFF = 36;  // the cannon's gap from his side
var BS_FLIGHT = 1.6;     // a cannonball's longest flight (seconds)
var BS_GOLD = "#d9a43a";
var BS_DODGE_LATE = 0.4; // a side step still covers the kick this long after it ends
var BS_ANGLE_NEAR = 22;  // he steps off for his kick once he's this close to kicking range
var BS_ANGLE_KEEP = 0.6; // a step that isn't followed by the kick in this long is used up
var BS_BLIND_COS = 0.34; // their side of him is his blind side when it's within ~70 degrees of screen left
var BS_BLIND_MIN = 4;    // a hit that takes this much off counts (not a cut bleeding)
var BS_LINE_WAIT = 30;   // a defining moment's line waits up to this long for quiet before it goes anyway

var bsShots = [];   // cannonballs in flight: { x, y, vx, vy, r, owner, t, trail, dodged }
var bsSmoke = [];   // smoke puffs off the cannon and the cannonballs: { x, y, vx, vy, t, max, r }
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
function resetBisping() { bsShots = []; bsSmoke = []; bsGhosts = []; bsClock = 0; }
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
    step: null, dodge: null, seenKick: null, angled: false, angledT: 0, ghostT: 0, hpPrev: null, lastN: 0, cmbRef: null
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
  if (b.sprawl && !s.wasSprawl) bsSay(b, "takedown", (cfg.lines || {}).takedownChance); // "I can't wrestle too well, but I can stop takedowns."
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
  if (missed) bsBlindLine(b, lc.missChance); // "I can't look two places at once, guys."
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

// "I can't look two places at once, guys.", at most blindMax a fight.
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
  if (over) { bsEndLines(b, other, lc, dt); return; }
  if (!b.alive) return;
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

// Where the cannon stands: at his side, its barrel turned toward them. The
// side (whichever has more room) is picked once; as the barrel turns to
// follow them the cannon swings round him with it, so it's never behind him.
function bsPlaceCannon(self, m) {
  var ux = Math.cos(m.aim), uy = Math.sin(m.aim), off = self.r + BS_CANNON_OFF;
  var at = function (s) { return { x: self.x - uy * s * off + ux * self.r * 0.2, y: self.y + ux * s * off + uy * self.r * 0.2 }; };
  if (m.side == null) {
    var a = at(-1), c = at(1);
    m.side = Math.min(a.x, W - a.x, a.y, H - a.y) > Math.min(c.x, W - c.x, c.y, H - c.y) ? -1 : 1;
  }
  var p = at(m.side), pad = self.r * 0.75;
  m.cx = Math.min(W - pad, Math.max(pad, p.x));
  m.cy = Math.min(H - pad, Math.max(pad, p.y));
}
function bsCannonLen(b) { return b.r * 1.45; }
// The muzzle and the touch hole (where the fuse is lit), along the barrel.
function bsMuzzle(b, m) { var L = bsCannonLen(b); return { x: m.cx + Math.cos(m.aim) * L * 0.62, y: m.cy + Math.sin(m.aim) * L * 0.62 }; }
function bsTouchHole(b, m) { var L = bsCannonLen(b), k = L * 0.3 + m.recoil * L * 0.16; return { x: m.cx - Math.cos(m.aim) * k, y: m.cy - Math.sin(m.aim) * k }; }

// From updateSpecial (special.js) for special.move "broadside".
function updateBroadside(self, other, dt) {
  var sp = self.char.special;
  if (!self.igbb) {
    if (self.specialT < sp.chargeTime || !canStartIgbb(self, other) || swordDuelActive() || self.plum || self.fknee || self.cmb) return false;
    clearActions(self);
    self.bsElbow = null; self.kneeAnim = null;
    self.igbb = { move: "broadside", phase: "roll", t: 0, aim: Math.atan2(other.y - self.y, other.x - self.x), shot: 0, locked: false, recoil: 0, fuseT: 0, side: null };
    bsPlaceCannon(self, self.igbb);
    floater(self.x, self.y - self.r - 34, "BROADSIDE!", "crit");
    playBsRoll();
    crowdReact(0.6);
    bsSay(self, "special", 100, true);
  }
  var m = self.igbb;
  if (m.move !== "broadside") return false;
  m.t += dt;
  self.vx = 0; self.vy = 0;
  if (over) { endBroadside(self); return false; }
  m.recoil = Math.max(0, m.recoil - dt * 3.2);
  if (m.flash > 0) m.flash = Math.max(0, m.flash - dt);
  var want = Math.atan2(other.y - m.cy, other.x - m.cx), aimFor = m.shot === 0 ? sp.aim : sp.reaim;
  if (m.phase === "roll") {
    m.aim = bsTurn(m.aim, want, dt * 6);
    bsPlaceCannon(self, m);
    if (m.t >= sp.roll) { m.phase = "aim"; m.t = 0; m.locked = false; }
  } else if (m.phase === "aim") {
    if (m.t < aimFor - sp.lock) { m.aim = bsTurn(m.aim, want, dt * 5); bsPlaceCannon(self, m); }
    else if (!m.locked) { m.locked = true; playBsLock(); }
    m.fuseT -= dt;
    if (m.fuseT <= 0) { m.fuseT = 0.09; playBsFuse(); }
    if (m.t >= aimFor) { fireBsCannon(self, m, sp); m.shot++; m.phase = "fire"; m.t = 0; }
  } else if (m.phase === "fire") {
    if (m.t >= sp.gap) {
      if (m.shot < sp.shots && other.alive && !other.koOut) { m.phase = "aim"; m.t = 0; m.locked = false; }
      else { m.phase = "done"; m.t = 0; }
    }
  } else if (m.t >= sp.hold) {
    endBroadside(self);
    return false;
  }
  return true;
}

function endBroadside(self) {
  self.igbb = null;
  self.specialT = 0;
  if (self.alive) setSpeed(self, self.baseSpeed || SPEED);
}

function fireBsCannon(self, m, sp) {
  var ux = Math.cos(m.aim), uy = Math.sin(m.aim), mz = bsMuzzle(self, m);
  bsShots.push({ x: mz.x, y: mz.y, vx: ux * sp.speed, vy: uy * sp.speed, r: sp.size, owner: self.id, t: 0, trail: [], dodged: false, puffT: 0 });
  m.recoil = 1;
  m.flash = 0.12;
  for (var i = 0; i < 9 && !reduceMotion; i++) {
    var a = m.aim + (Math.random() - 0.5) * 1.2, s = 40 + Math.random() * 140;
    bsSmoke.push({ x: mz.x, y: mz.y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 20, t: 0, max: 0.7 + Math.random() * 0.5, r: 8 + Math.random() * 9 });
  }
  for (var j = 0; j < 12 && !reduceMotion; j++) {
    var a2 = m.aim + (Math.random() - 0.5) * 0.9, s2 = 200 + Math.random() * 300;
    particles.push({ x: mz.x, y: mz.y, vx: Math.cos(a2) * s2, vy: Math.sin(a2) * s2, life: 0.2, max: 0.2, size: 2 + Math.random() * 2.5, color: j % 2 ? "#ffd27a" : "#ff8a2a" });
  }
  floater(mz.x, mz.y - 24, "BOOM!", "crit");
  if (!reduceMotion) shake = Math.max(shake, 10);
  playBsBoom();
  crowdReact(0.45);
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
      if (c.x < c.r || c.x > W - c.r || c.y < c.r || c.y > H - c.r) {
        bsShotWall(c);
        if (owner.alive && owner.bs && !over) bsBlindLine(owner, (bsCfg(owner).lines || {}).cannonMissChance); // a miss: "I can't look two places at once, guys."
        return false;
      }
    }
    c.trail.push({ x: c.x, y: c.y });
    if (c.trail.length > 6) c.trail.shift();
    c.puffT -= dt;
    if (c.puffT <= 0 && !reduceMotion) { c.puffT = 0.035; bsSmoke.push({ x: c.x - ux * c.r, y: c.y - uy * c.r, vx: -ux * 30, vy: -uy * 30 - 10, t: 0, max: 0.4, r: c.r * 0.7 }); }
    return c.t < BS_FLIGHT;
  });
}

function bsShotHit(c, other, sp, ux, uy, dealt) {
  floater(other.x, other.y - other.r - 30, "DIRECT HIT!", "crit");
  if (bsKnockable(other)) { other.vx += ux * sp.knockback; other.vy += uy * sp.knockback; }
  other.squash = { t: 0.16, max: 0.16, nx: -ux, ny: -uy };
  impacts.push({ x: other.x - ux * other.r, y: other.y - uy * other.r, nx: -ux, ny: -uy, life: 0.4, max: 0.4, color: "#222222" });
  for (var i = 0; i < 14 && !reduceMotion; i++) {
    var a = Math.atan2(-uy, -ux) + (Math.random() - 0.5) * 2.4, s = 140 + Math.random() * 260;
    particles.push({ x: c.x, y: c.y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 0.3, max: 0.3, size: 2 + Math.random() * 2.5, color: i % 3 ? "#ffd27a" : "#555555" });
  }
  hitStop = Math.max(hitStop, 0.08);
  if (!reduceMotion) shake = Math.max(shake, 14);
  playBsHit(dealt);
  crowdReact(0.6);
}

function bsShotWall(c) {
  var x = Math.min(W - 6, Math.max(6, c.x)), y = Math.min(H - 6, Math.max(6, c.y));
  for (var i = 0; i < 6 && !reduceMotion; i++) bsSmoke.push({ x: x, y: y, vx: (Math.random() - 0.5) * 120, vy: (Math.random() - 0.5) * 120 - 20, t: 0, max: 0.6, r: 7 + Math.random() * 7 });
  for (var j = 0; j < 10 && !reduceMotion; j++) {
    var a = Math.random() * Math.PI * 2, s = 100 + Math.random() * 200;
    particles.push({ x: x, y: y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 0.3, max: 0.3, size: 2 + Math.random() * 2, color: j % 2 ? "#8a5a2b" : "#cfcfcf" });
  }
  floater(Math.min(W - 40, Math.max(40, x)), Math.min(H - 20, Math.max(30, y)), "THUD", "note");
  if (!reduceMotion) shake = Math.max(shake, 5);
  playBsWall();
}

function tickBsSmoke(dt) {
  if (!bsSmoke.length) return;
  bsSmoke = bsSmoke.filter(function (p) {
    p.t += dt;
    var damp = Math.exp(-2.5 * dt);
    p.vx *= damp; p.vy *= damp;
    p.x += p.vx * dt; p.y += p.vy * dt;
    return p.t < p.max;
  });
}

// ---------------------------------------------------------------- drawing

// Both hands are drawn by drawBisping at the cannon (drawHands skips them,
// draw-attacks.js).
function bispingHandsBusy(b) { return broadsideOn(b) && b.alive; }

// From draw(), under the fighters: the trail of a side step, and in
// Broadside the cannon on the mat, the Union Jack behind it and the red aim line.
function drawBispingUnder() {
  bsGhosts.forEach(function (g) {
    var k = g.t / g.max;
    ctx.save();
    ctx.globalAlpha = 0.3 * (1 - k);
    ctx.fillStyle = g.color;
    ctx.beginPath(); ctx.arc(g.x, g.y, g.r * (1 - 0.15 * k), 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  });
  balls.forEach(function (b) {
    var m = b.igbb;
    if (!b.alive || !broadsideOn(b)) return;
    var sp = b.char.special;
    if (m.phase === "roll" || m.phase === "aim") drawBsAimLine(b, m, sp);
    var roll = m.phase === "roll" ? easeOut(m.t / sp.roll) : 1;
    var fade = m.phase === "done" ? Math.max(0, 1 - m.t / sp.hold) : 1;
    ctx.save();
    ctx.globalAlpha = fade;
    drawBsFlagPole(b, m, 1 - roll);
    drawBsCannon(m.cx, m.cy, m.aim, bsCannonLen(b), m.recoil, (1 - roll), m.phase === "aim" ? Math.min(1, m.t / (m.shot === 0 ? sp.aim : sp.reaim)) : (m.phase === "roll" ? 0 : 1), m.flash > 0);
    ctx.restore();
  });
}

// The Union Jack on a pole planted behind the cannon, on the side away from
// him, flying away from him (or back in, if the cage is in the way).
function drawBsFlagPole(b, m, drop) {
  var L = bsCannonLen(b), ax = m.cx - b.x, ay = m.cy - b.y, ad = Math.sqrt(ax * ax + ay * ay) || 1;
  ax /= ad; ay /= ad;
  var bx = m.cx + ax * L * 0.45 - Math.cos(m.aim) * L * 0.3, by = m.cy + ay * L * 0.45 - Math.sin(m.aim) * L * 0.3 + drop * 30;
  var fw = L * 0.82, poleH = Math.max(L * 0.6, Math.min(L * 1.15, by - 6));
  var dir = ax >= 0 ? 1 : -1;
  if (bx + dir * fw > W - 4) dir = -1;
  else if (bx + dir * fw < 4) dir = 1;
  drawFlagOnPole(ctx, bx, by, poleH, fw, dir, bsClock);
}

// A flagpole standing at x, y (its foot) `poleH` tall, flying a Union Jack
// `w` wide toward `dir` (1 right, -1 left), waving with clock `t`.
function drawFlagOnPole(c, x, y, poleH, w, dir, t) {
  c.save();
  c.lineCap = "round";
  c.fillStyle = "rgba(0,0,0,0.2)"; // its foot in the mat
  c.beginPath(); c.ellipse(x, y, 7, 3, 0, 0, Math.PI * 2); c.fill();
  c.strokeStyle = theme.wall; c.lineWidth = 5.5;
  c.beginPath(); c.moveTo(x, y); c.lineTo(x, y - poleH); c.stroke();
  c.strokeStyle = "#8a5a2b"; c.lineWidth = 3;
  c.beginPath(); c.moveTo(x, y); c.lineTo(x, y - poleH); c.stroke();
  c.fillStyle = BS_GOLD; c.strokeStyle = theme.wall; c.lineWidth = 1.5;
  c.beginPath(); c.arc(x, y - poleH - 2, 3.6, 0, Math.PI * 2); c.fill(); c.stroke();
  drawUnionJack(c, x + dir * 1.5, y - poleH + 1, w, dir, t);
  c.restore();
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

// A red dashed line from the muzzle out to the cage, flashing once it locks.
function drawBsAimLine(b, m, sp) {
  var mz = bsMuzzle(b, m), ux = Math.cos(m.aim), uy = Math.sin(m.aim);
  var tx = ux > 0 ? (W - mz.x) / ux : (ux < 0 ? -mz.x / ux : Infinity), ty = uy > 0 ? (H - mz.y) / uy : (uy < 0 ? -mz.y / uy : Infinity);
  var len = Math.max(0, Math.min(tx, ty));
  var on = m.phase === "roll" ? 0.35 * Math.min(1, m.t / sp.roll) : 1;
  var flash = m.locked ? 0.55 + 0.45 * Math.sin(bsClock * 40) : 0.8;
  ctx.save();
  ctx.lineCap = "round";
  ctx.setLineDash([12, 9]); ctx.lineDashOffset = -bsClock * 90;
  ctx.globalAlpha = on * flash;
  ctx.strokeStyle = "#e0221b"; ctx.lineWidth = m.locked ? 5 : 3.5;
  ctx.beginPath(); ctx.moveTo(mz.x, mz.y); ctx.lineTo(mz.x + ux * len, mz.y + uy * len); ctx.stroke();
  ctx.restore();
}

// A pirate's cannon on a wooden carriage, barrel along `ang`, `len` long.
// `recoil` 0..1 slides the barrel back, `drop` 0..1 sinks it in from below
// as it rolls in, `burn` 0..1 is how far the fuse has burned down, `flash`
// lights the muzzle.
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

// From draw(), per fighter after his body: the captain's hat and his arms at
// the cannon during Broadside.
function drawBisping(b, other) {
  if (!b.alive || !broadsideOn(b)) return;
  var m = b.igbb, sp = b.char.special, r = b.r;
  var hatIn = m.phase === "roll" ? easeOut(m.t / sp.roll) : (m.phase === "done" ? Math.max(0, 1 - m.t / sp.hold) : 1);
  // The near arm holds the lit linstock to the fuse; the other points at them.
  var near = { x: m.cx - b.x, y: m.cy - b.y }, nd = Math.sqrt(near.x * near.x + near.y * near.y) || 1;
  var nx = near.x / nd, ny = near.y / nd, size = (b.char.punch && b.char.punch.size) || 13, limb = size * 0.62;
  var th = bsTouchHole(b, m), aiming = m.phase === "aim";
  var reachK = aiming ? Math.min(1, m.t / 0.25) : (m.phase === "roll" ? 0.3 : 0.5);
  var sh = { x: b.x + nx * r * 0.62, y: b.y + ny * r * 0.62 };
  var rest = { x: b.x + nx * r * 1.05, y: b.y + ny * r * 1.05 - r * 0.25 };
  var hand = { x: rest.x + (th.x - 6 - rest.x) * reachK, y: rest.y + (th.y - r * 0.5 - rest.y) * reachK };
  strokeLimb(limb, armColor(b.char, 0), function () { ctx.moveTo(sh.x, sh.y); ctx.lineTo(hand.x, hand.y); });
  // The linstock: a short stick with a glowing match at its tip.
  var tip = { x: hand.x + (th.x - hand.x) * 0.9, y: hand.y + (th.y - r * 0.18 - hand.y) * 0.9 };
  ctx.save();
  ctx.lineCap = "round"; ctx.strokeStyle = "#5a3a1a"; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(hand.x, hand.y); ctx.lineTo(tip.x, tip.y); ctx.stroke();
  var glow = 3.5 + 1.5 * Math.sin(bsClock * 30);
  ctx.fillStyle = "#ff6a1a"; ctx.beginPath(); ctx.arc(tip.x, tip.y, glow + 1.5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#ffe08a"; ctx.beginPath(); ctx.arc(tip.x, tip.y, glow * 0.55, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  drawGloveAt(hand.x, hand.y, size * 0.7, b.char, Math.atan2(tip.y - hand.y, tip.x - hand.x));
  // The other hand: pointing at them while he aims, a fist up after a hit.
  var ang = Math.atan2(other.y - b.y, other.x - b.x), fx = -nx, fy = -ny;
  var sh2 = { x: b.x + fx * r * 0.62, y: b.y + fy * r * 0.62 };
  var h2 = m.phase === "done" ? { x: b.x + fx * r * 0.8, y: b.y - r * 1.25 } : { x: b.x + Math.cos(ang) * r * 1.35 + fx * r * 0.2, y: b.y + Math.sin(ang) * r * 1.35 + fy * r * 0.2 };
  strokeLimb(limb, armColor(b.char, 0), function () { ctx.moveTo(sh2.x, sh2.y); ctx.lineTo(h2.x, h2.y); });
  drawGloveAt(h2.x, h2.y, size * 0.7, b.char, m.phase === "done" ? -Math.PI / 2 : ang);
  if (m.phase !== "done") { // a pointing finger off the glove
    ctx.save(); ctx.lineCap = "round";
    var fx2 = h2.x + Math.cos(ang) * size * 1.15, fy2 = h2.y + Math.sin(ang) * size * 1.15;
    ctx.strokeStyle = theme.wall; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(h2.x, h2.y); ctx.lineTo(fx2, fy2); ctx.stroke();
    ctx.strokeStyle = b.char.look ? b.char.look.gloves : "#151515"; ctx.lineWidth = 4.5; ctx.beginPath(); ctx.moveTo(h2.x, h2.y); ctx.lineTo(fx2, fy2); ctx.stroke();
    ctx.restore();
  }
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
// thrown in the clinch, the cannonballs and their smoke, the 10-9 cards.
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
  return "A pirate cannon rolls in at his side with a Union Jack flying behind it, and he puts on a captain's tricorne. He holds a lit match to the fuse while a red line shows where it's aimed (it follows them, then locks), then BOOM: " + sp.shots + " cannonballs, " + secs(sp.gap) +
    " apart, each re-aimed. One that hits does " + sp.damage + " (can't be slipped or blocked) and knocks them back; one that misses smashes into the cage. Nothing lands on him while he's at the cannon.";
}

function bispingGalleryAssets(list) {
  list.push({ name: "Pirate cannon", info: "Michael Bisping's Broadside, and the Union Jack behind it.", w: 300, h: 200, draw: function (c, w, h) {
    withCtx(c, function () { drawFlagOnPole(ctx, w * 0.1, h * 0.9, 150, 84, 1, 0.6); drawBsCannon(w * 0.55, h * 0.64, -0.15, 120, 0, 0, 0.4, false); drawTricorne(w * 0.86, h * 0.26, 34, 1); });
  } });
}

function bispingGallerySounds(groups, synth) {
  groups.push({ title: "Michael Bisping", items: [
    synth("Cannon rolls in", "Broadside starting.", function () { playBsRoll(); }),
    synth("Fuse", "The fuse burning while he aims.", function () { playBsFuse(); }),
    synth("Cannon fire", "BOOM.", function () { playBsBoom(); }),
    synth("Cannonball hit", "A cannonball hitting them.", function () { lastPunchSound = 0; playBsHit(16); }),
    synth("Cannonball on the cage", "A cannonball that missed.", function () { playBsWall(); }),
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
// Wooden wheels rumbling over the mat.
function playBsRoll() {
  bsAudio(function (ac, t) {
    for (var i = 0; i < 5; i++) caneBurst(ac, t + i * 0.07, 260 + i * 15, 1.4, 0.28, 0.07);
    caneTone(ac, t + 0.36, "triangle", 190, 120, 0.18, 0.1);
  });
}
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
