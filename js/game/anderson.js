// Anderson Silva, "The Spider" (Christian, 2026-11-13; finished 2026-11-14).
// Middleweight, on the Brawler base, with one of the widest move sets in the
// game: punches and kicks, elbows (his `elbow` block, elbows.js), knees, the
// Thai plum and the flying knee (his `knee` block, knees.js), combinations
// (his `combos` block, combos.js), and his own moves below. A Matrix homage:
// he leans back out of nearly everything. Everything below is set in his
// character file under "anderson" (and "special" for Spider Code); leave a
// block out and that part is switched off.
//
// Weave     (anderson.weave) the Matrix head movement (the Forrest Griffin
//           dodges, UFC 101): he leans back out of `chance`% of strikes and
//           `projChance`% of anything thrown ("WEAVE"). The whole body bends
//           back away from the shot for `lean` seconds and leaves a ghost of
//           himself where he was. Not while he's held, down, or in the air.
// Counter   (anderson.counter) `chance`% of the strikes he leans out of, he
//           fires straight back `delay` seconds later if they're within
//           `reach`: a counter right for `damage` ("COUNTER"). It can be
//           slipped or blocked like any punch.
// Hands down (anderson.handsDown) after `after` weaves in a row (each within
//           `window` seconds of the last; a hit on him ends the run) he drops
//           his hands to his sides and sways, taunting them ("HANDS DOWN")
//           for `time` seconds. He throws nothing then, but leans out of
//           `dodge`% of strikes instead. At most `max` a fight, `cooldown`
//           seconds apart. His line: lines.handsDown.
// Front kick (anderson.frontKick) the leaping front kick to the face (the
//           Vitor Belfort knockout, UFC 126). First after `first` seconds,
//           then every `every`, when they're `minGap` to `maxGap` away: he
//           squares up and chambers his lead knee for `load` seconds while a
//           yellow line shows where it's going ("FRONT KICK!", the tell: they
//           back off `readChance`% of the time), then hops in at `speed` with
//           the leg straight out, sole first at their face, `reach` past his
//           own edge. A clean one does `damage` and sends them back
//           (`knockback`), and from `koAfter` seconds into the fight it knocks
//           them out `koBase`% of the time at full health, up to
//           koBase + koLow% the more hurt they are (that one goes through
//           every defence, like the KO Rush). If they're gone he
//           lands off balance ("WHIFF"), wide open for `open` seconds.
// Off his back (anderson.triangle) the triangle choke (the Chael Sonnen
//           finish, UFC 117). Three ways in:
//             - his guard (hasGuard, guard.js): a strike can drop him on his
//               back; whoever steps in either passes (ground and pound) or
//               gets caught: "triangle" in guard.subs is the triangle, or
//               the armbar `guardArmbar`% of the time.
//             - ground and pound on him (a passed guard, Jon Jones's ground
//               and pound): `fromGnp`% of the time, after `gnpAfter` punches,
//               he throws his legs up round their head.
//             - a takedown that slams him (a Grappler's throw): `fromTakedown`%
//               of the time he locks it up as they come down after him.
//           Then the same tug-of-war bar as every submission ("TRIANGLE"):
//           they tap `tapBase`% of the time at full health, up to
//           tapBase + tapLowHp% the more hurt they are (never in the first
//           `tapAfter` seconds of the fight), after `time` seconds of
//           squeezing; otherwise they posture out ("ESCAPE"). After one he
//           can't go for another off a takedown or ground and pound for
//           `cooldown` seconds. It runs on the armbar's state (b.armbar with
//           tri: true, armbar.js), so everything that already knows about
//           submissions (Tony's "won't tap", Nate's sub defence, Conor's
//           tapping) works on it too; only the drawing is its own.
//           Strikes (triangle.strikes): while he holds it he hits them, the
//           way Tony Ferguson throws elbows off his back: the first after
//           `first` seconds, then one every `gap`, up to `max`, an elbow
//           (`elbows`% of them) or a short punch, `damage` each, `critChance`%
//           critical hits for `critMult` times as much. They're held, so they
//           can't slip or block them. Re-roll (triangle.reroll): that far into
//           the squeeze, if they weren't going to tap, the damage since is
//           counted again, so the bar can swing back to the tap ("SINKING IN").
// Comeback  (anderson.comeback) he won close fights with a finish near the
//           end. When he's `behind` health behind them and either under
//           `lowHp` of his health or `after` seconds into the fight, he's in
//           comeback mode ("COMEBACK", lines.comeback): `crit`% of his strikes
//           are critical hits for `critMult` times the damage ("CRIT!"), his
//           triangle taps `triTap`% more often and comes off ground and pound
//           `fromGnp`% more often, and his front kick knocks out `kickKo`%
//           more often. Off again once he's back within 40% of `behind`.
// Spider Code (special.move "mranderson") his special, a Matrix homage under
//           our own name. The bar is full at the start of the fight
//           (`atStart`), so `delay` seconds in he stops, the cage goes dark,
//           green code rains down it (`rain`, how dark) and over `suit`
//           seconds he's in a long black coat and small dark glasses
//           ("SPIDER CODE"). For `time` seconds he leans out of `dodge`% of
//           strikes and `projDodge`% of anything thrown (`lean` seconds, a
//           trail of ghosts), counters `counter`% of them, and `bullet.chance`%
//           of those weaves (every one off something thrown) go into bullet
//           time: the whole fight slows to `bullet.scale` for `bullet.time`
//           seconds while he bends back, with ripples in the air along the
//           shot (at most one every `bullet.cooldown` seconds). Then the coat
//           comes off in a burst of code and the bar starts charging again
//           (`chargeTime`, `hitCut`, `punchCut`); with `again` on it comes
//           back when it's full.
// Lines     (anderson.lines) his real lines, picked by Christian
//           (2026-11-14), said with say(). Christian's rule: a line on a
//           defining moment plays every time and waits for its turn rather
//           than being dropped: `win` (after he wins). Lines on frequent
//           moments are rolled, with chances and gaps (anderson.talk):
//           `handsDown` (his hands going down, `handsDownChance`%),
//           `comeback` (comeback mode coming on, `comebackChance`%) and
//           `combo` (while a combination or the clinch knees are landing:
//           `comboChance`% of the time, `comboGap` seconds apart).
// Commentary (commentaryCall, commentary-calls.js, called only if it exists):
//           "choke" as his triangle locks, "instantKo" on a front kick
//           knockout, "rightHand" on some counters, "elbows" on a critical
//           elbow from the triangle.
//
// The front kick runs on b.asKick, the hands down on b.asTaunt, a waiting
// counter on b.asCounter, the lean on b.asLean, Spider Code on b.igbb (move
// "mranderson", the change) then b.asNeo, comeback mode on b.asCb. The code
// rain is asRain, bullet time asBullet. Look: shaved head, goatee, black
// shorts with yellow stripes and a yellow spider (look.spiderLogo,
// drawSpiderLogo below); in Spider Code, look.neoCoat on his own copy of the
// character (drawNeoKit below, Hokit's Dark Side pattern).
"use strict";

// Registered here rather than in special.js's table (GSP's pattern).
SPECIAL_MOVES.mranderson = "Spider Code";

var AS_LAND = 0.3;       // settling after a clean front kick
var AS_KO_HOLD = 1.3;    // standing over a front kick knockout before it's called
var AS_GHOST = 0.32;     // how long a ghost of him hangs where he leaned from
var AS_NEO_GHOST = 0.55; // and the trail of ghosts in Spider Code
var AS_YELLOW = "#f5c400", AS_GREEN = "#3dff6e";
var AS_NO_SLIP = { laser: true, slam: true, grapple: true, finisher: true, flow: true, kickback: true, slugfest: true, kofinal: true, igbb: true, kopunch: true };
var AS_CRIT_SOURCES = { punch: true, kick: true, elbow: true, knee: true, combo: true, finisher: true }; // what a comeback crit can be
var AS_GLYPHS = "ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾗﾘﾜ0123456789Z:=*+<>";
var AS_CELL = 20;        // one glyph of code rain
var asFrame = 0;         // bumped once a frame (tickAnderson): a move the abilities loop didn't reach is let go
var asNow = 0;           // fight time, for the coat and the rain
var asRain = null;       // the green code rain while anyone's in Spider Code
var asBullet = null;     // bullet time: { t (real seconds), dur, scale, x0, y0, x1, y1 }
var asAtlas = null;      // the code glyphs, drawn once

// A guard submission (guard.js): "triangle" in a fighter's guard.subs. With
// triangle.guardArmbar set, that share of them is the armbar instead.
GUARD_SUBS.triangle = function (self, atk) {
  var t = asCfg(self) && asCfg(self).triangle;
  if (t && t.guardArmbar && Math.random() * 100 < t.guardArmbar) { beginArmbar(self, atk); return; }
  beginSpiderTriangle(self, atk, "guard");
};

function asCfg(b) { return b && b.char && b.char.anderson; }
// Spider Code's numbers, with defaults for anything the special block leaves
// out (a created fighter can pick it in the editor with just a charge time).
var AS_NEO_DEF = { chargeTime: 50, atStart: true, delay: 0.6, suit: 1.1, time: 12, again: true, dodge: 85, projDodge: 75, counter: 70, lean: 0.45, rain: 0.78,
  bullet: { chance: 60, scale: 0.3, time: 0.6, cooldown: 1.4 } };
function asNeoSp(b) {
  var ch = b && b.char, sp = ch && ch.hasSpecial && ch.special;
  return sp && sp.move === "mranderson" ? asNeoNums(sp) : null;
}
function asNeoNums(sp) {
  var o = {}, k;
  for (k in AS_NEO_DEF) o[k] = AS_NEO_DEF[k];
  for (k in sp) if (sp[k] != null) o[k] = sp[k];
  o.bullet = Object.assign({}, AS_NEO_DEF.bullet, sp.bullet || {});
  return o;
}
function asRand(r) { return r[0] + Math.random() * (r[1] - r[0]); }
// Test counters (read by the headless harness), never used in play.
function asStat(b, k) { if (b.asStats) b.asStats[k] = (b.asStats[k] || 0) + 1; }
function asDist(a, b) { var dx = b.x - a.x, dy = b.y - a.y; return Math.sqrt(dx * dx + dy * dy) || 1; }
function asComm(kind, a, d) { if (typeof commentaryCall === "function") commentaryCall(kind, a, d); } // (commentary-calls.js, when it's merged)
// Planted for the front kick or taunting with his hands down: the speed regulator leaves him alone (physics.js).
function andersonBusy(b) { return !!(b && (b.asKick || b.asTaunt)); }
// Hands down by his sides: drawn by drawAnderson (drawHands skips them, draw-attacks.js).
function andersonHandsBusy(b) { return !!(b && b.asTaunt); }
function asNeoOn(b) { return !!(b && b.asNeo); }

// From startMatchSeeded.
function resetAnderson() { asRain = null; asBullet = null; asNow = 0; }

// From makeBall.
function initAnderson(b) {
  b.asKick = null; b.asTaunt = null; b.asCounter = null; b.asLean = null; b.asGhosts = [];
  b.asTd = null; b.asTriCd = 0; b.asRun = 0; b.asRunT = 0; b.asTauntN = 0; b.asTauntCd = 0; b.asClock = 0;
  b.asNeo = null; b.asNeoN = 0; b.asLookOff = null; b.asBulletCd = 0; b.asCb = false; b.asCbN = 0; b.asPend = null;
  var cfg = asCfg(b), sp = asNeoSp(b);
  if (cfg || sp) b.asStats = { kick: 0, kickHit: 0, kickKo: 0, weave: 0, handsDown: 0, counter: 0, tri: 0, triTap: 0, triGuard: 0, triGnp: 0, triTd: 0, guard: 0, triHit: 0, sinking: 0, neo: 0, bullet: 0, comeback: 0, crit: 0 };
  if (sp && sp.atStart !== false) b.specialT = sp.chargeTime; // Spider Code goes off at the start
  if (!cfg) return;
  b.asKickT = cfg.frontKick ? asRand(cfg.frontKick.first) : Infinity;
  b.asHp = b.hp; b.asSaid = {}; b.asWasGuard = false; b.asCmbSeen = null; b.asPlumSeen = null; b.asComboT = -99;
}

// ---------------------------------------------------------------- lines

function asSay(b, key) {
  var cfg = asCfg(b), ln = cfg && cfg.lines && cfg.lines[key];
  var text = pickLine(b, ln, "as-" + key);
  if (text) say(b, text);
}

// Nobody's talking: not him, not them, no commentator, nothing still playing
// on the talk channel (audio.js). A line that must be heard waits for this.
function asTalkFree(b) {
  var o = balls[1 - b.id];
  if (!canSay(b) || (o && speaking(o)) || announcer) return false;
  return !(typeof audioCtx !== "undefined" && audioCtx && typeof talkEnd !== "undefined" && audioCtx.currentTime < talkEnd);
}

// A combination (or the clinch knees) landing: "I love my job."
function asComboLine(b, cfg) {
  var tk = cfg.talk || {};
  if (b.asClock - b.asComboT < (tk.comboGap != null ? tk.comboGap : 12) || !canSay(b)) return;
  if (Math.random() * 100 >= (tk.comboChance != null ? tk.comboChance : 60)) return;
  b.asComboT = b.asClock;
  asSay(b, "combo");
}

// ---------------------------------------------------------------- the weave

function asCantWeave(b) {
  return !b.alive || b.grappled || b.grapple || b.slam || b.sprawl || b.sprawled || subLocked(b) || b.igbb || b.koOut || b.shocked ||
    b.dazed || b.dizzy || b.shelled || b.beamPin || b.checkStun > 0 || plumHolder(b) || (b.asKick && b.asKick.phase === "air");
}

// From hurt (match.js): leaning out of a strike. True if he got out of it.
function andersonWeave(b, source, attackerId) {
  var cfg = asCfg(b), wv = cfg && cfg.weave, neo = b.asNeo ? asNeoSp(b) : null;
  if ((!wv && !neo) || attackerId == null || attackerId === b.id || AS_NO_SLIP[source] || asCantWeave(b)) return false;
  var proj = !!PROJECTILE_SOURCES[source], hd = cfg && cfg.handsDown;
  var chance = !wv ? 0 : proj ? wv.projChance : (b.asTaunt && hd ? hd.dodge : wv.chance);
  if (neo) chance = Math.max(chance, proj ? neo.projDodge : neo.dodge);
  if (Math.random() * 100 >= chance) return false;
  var atk = balls[attackerId];
  var ax = atk ? b.x - atk.x : 0, ay = atk ? b.y - atk.y : -1, al = Math.sqrt(ax * ax + ay * ay) || 1;
  b.asLean = { t: 0, dur: neo ? (neo.lean || 0.45) : wv.lean, ux: ax / al, uy: ay / al, ghost: false, neo: !!neo, qn: 0 };
  b.asGhosts.push({ x: b.x, y: b.y, t: 0, neo: !!neo });
  floater(b.x, b.y - b.r - 8, "WEAVE", "dodge");
  b.justDodged = true;
  playAsWeave();
  asStat(b, "weave");
  if (neo && neo.bullet) asTryBullet(b, atk, neo.bullet, proj);
  if (hd) {
    b.asRun++; b.asRunT = hd.window;
  }
  var cc = cfg && cfg.counter, cChance = cc ? (neo && neo.counter != null ? neo.counter : cc.chance) : 0;
  if (cc && !proj && atk && atk.alive && !b.asCounter && Math.random() * 100 < cChance) b.asCounter = { t: 0, targetId: atk.id };
  return true;
}

// How far he's leaned back right now (0 to 1).
function asLeanK(b) {
  var l = b.asLean;
  return l ? Math.sin(Math.PI * Math.min(1, l.t / l.dur)) : 0;
}

// The counter right, straight back after a weave.
function runAsCounter(self, other, cc, dt) {
  var c = self.asCounter;
  c.t += dt;
  if (c.t < cc.delay) return;
  self.asCounter = null;
  if (!other.alive || other.koOut || other.id !== c.targetId || self.asKick || self.koOut || subLocked(self) || self.grappled || self.grapple || self.slam || self.igbb || self.plum || self.fknee) return;
  var d = asDist(self, other), gap = d - self.r - other.r;
  if (gap > cc.reach) return;
  var ux = (other.x - self.x) / d, uy = (other.y - self.y) / d;
  self.punch = null;
  self.jabAnim = { t: 0, dur: 0.22, sign: Math.random() < 0.5 ? 1 : -1, big: true, dx: ux, dy: uy };
  var dealt = hurt(other, cc.damage, "punch", self.id);
  if (dealt > 0) {
    floater(other.x, other.y - other.r - 34, "COUNTER", "crit");
    asStat(self, "counter");
    playPunch(dealt + 12);
    if (!other.justDodged && kneeKnockable(other)) { other.vx += ux * 260; other.vy += uy * 260; }
    other.squash = { t: 0.14, max: 0.14, nx: -ux, ny: -uy };
    igbbSparks(other.x - ux * other.r, other.y - uy * other.r, -ux, -uy, AS_YELLOW, 8, 320);
    if (!reduceMotion) shake = Math.max(shake, 9);
    crowdReact(0.3);
    if (Math.random() < 0.35) asComm("rightHand", self, other);
  }
  checkEnd();
}

// ---------------------------------------------------------------- hands down

function startHandsDown(self, hd) {
  clearActions(self);
  self.asRun = 0; self.asTauntN++; self.asTauntCd = hd.cooldown;
  self.asTaunt = { t: 0, dur: hd.time, frame: asFrame, sway: Math.random() * 6 };
  floater(self.x, self.y - self.r - 30, "HANDS DOWN", "crit");
  asStat(self, "handsDown");
  var tk = asCfg(self).talk || {}; // a frequent moment: `talk.handsDownChance`% of the time (and at most `handsDown.max` a fight)
  if (canSay(self) && Math.random() * 100 < (tk.handsDownChance != null ? tk.handsDownChance : 50)) asSay(self, "handsDown");
  crowdReact(0.6);
  playAsTaunt();
}

function runHandsDown(self, dt) {
  var m = self.asTaunt;
  m.frame = asFrame;
  m.t += dt;
  var damp = Math.exp(-8 * dt); self.vx *= damp; self.vy *= damp; // stands his ground, swaying
  if (m.t >= m.dur) { endHandsDown(self); return false; }
  return true;
}
function endHandsDown(self) {
  self.asTaunt = null;
  if (self.alive && inOrdinaryMovement(self)) setSpeed(self, self.baseSpeed || SPEED);
}

// ---------------------------------------------------------------- his turn

function asInterrupted(b) {
  return !b.alive || b.grappled || b.grapple || b.slam || b.sprawl || b.sprawled || subLocked(b) || b.koOut || b.shocked ||
    b.dazed || b.dizzy || b.shelled || b.checkStun > 0 || b.igbb || b.beamPin || b.plum || b.fknee;
}

// From the abilities loop, before the submissions: the triangle off ground
// and pound, his strikes from the triangle, the counter, the hands down and
// the front kick. True while one of his own moves has him (he does nothing
// else that frame).
function updateAnderson(self, other, dt) {
  var cfg = asCfg(self);
  if (!cfg) return false;
  if (self.guillo) return asGnpTriangle(self, cfg); // being pounded on: maybe the triangle (otherwise bjj.js runs it)
  if (self.armbar && self.armbar.tri) { runAsTriangle(self, cfg, dt); return false; } // (armbar.js runs the hold itself)
  if (self.asCounter && cfg.counter) runAsCounter(self, other, cfg.counter, dt);
  if (self.asKick) {
    if (self.asKick.phase !== "ko" && (asInterrupted(self) || over)) { endFrontKick(self); return false; }
    return runFrontKick(self, other, cfg.frontKick, dt);
  }
  if (self.asTaunt) {
    if (asInterrupted(self) || over) { endHandsDown(self); return false; }
    return runHandsDown(self, dt);
  }
  if (!started || over || !other.alive) return false;
  var hd = cfg.handsDown;
  if (hd && self.asRun >= hd.after && self.asTauntCd <= 0 && self.asTauntN < hd.max && kneeFree(self) && !self.asCounter && kneeTarget(other)) {
    startHandsDown(self, hd);
    return true;
  }
  var fk = cfg.frontKick;
  if (!fk) return false;
  self.asKickT -= dt;
  if (self.asKickT > 0 || !kneeFree(self) || !kneeTarget(other) || kneesBusy(self) || other.grappled || other.slam || subLocked(other)) return false;
  var gap = asDist(self, other) - self.r - other.r;
  if (gap < fk.minGap || gap > fk.maxGap) return false;
  startFrontKick(self, other, fk);
  return true;
}

// ---------------------------------------------------------------- front kick

// Where their face is (the top of their ball).
function asFace(o) { return { x: o.x, y: o.y - o.r * 0.42 }; }

function startFrontKick(self, other, fk) {
  clearActions(self);
  self.kneeAnim = null;
  self.vx = 0; self.vy = 0;
  var f = asFace(other);
  self.asKick = { phase: "load", t: 0, tx: f.x, ty: f.y, read: Math.random() * 100 < fk.readChance, frame: asFrame, side: Math.random() < 0.5 ? -1 : 1 };
  if (self.asKick.read) floater(other.x, other.y - other.r - 30, "!", "crit");
  floater(self.x, self.y - self.r - 30, "FRONT KICK!", "crit");
  asStat(self, "kick");
  crowdReact(0.25);
  playAsKickLoad();
}

function runFrontKick(self, other, fk, dt) {
  var m = self.asKick;
  m.frame = asFrame;
  if (m.phase === "ko") { self.vx = 0; self.vy = 0; return true; } // (tickAnderson calls it)
  m.t += dt;
  if (m.phase === "load") {
    self.vx = 0; self.vy = 0;
    if (m.t < fk.load - 0.12) { var f = asFace(other); m.tx = f.x; m.ty = f.y; } // follows them, then locks just before he goes
    if (m.read) kneeBackOff(self, other);
    if (m.t >= fk.load) {
      var dx = m.tx - self.x, dy = m.ty - self.y, dd = Math.sqrt(dx * dx + dy * dy) || 1;
      m.phase = "air"; m.t = 0; m.ux = dx / dd; m.uy = dy / dd;
      m.airMax = Math.min(0.5, Math.max(0.12, (dd - self.r - fk.reach + 40) / fk.speed));
      playAsKickWhoosh();
    }
    return true;
  }
  if (m.phase === "air") {
    self.vx = m.ux * fk.speed; self.vy = m.uy * fk.speed;
    if (!reduceMotion) particles.push({ x: self.x, y: self.y, vx: -self.vx * 0.1, vy: -self.vy * 0.1, life: 0.18, max: 0.18, size: self.r * 0.45, color: AS_YELLOW });
    if (other.alive && !other.koOut) {
      var foot = { x: self.x + m.ux * (self.r + fk.reach), y: self.y + m.uy * (self.r + fk.reach) }, face = asFace(other);
      var fd = Math.sqrt((foot.x - face.x) * (foot.x - face.x) + (foot.y - face.y) * (foot.y - face.y));
      if (fd < other.r * 0.8 + 8 || asDist(self, other) < self.r + other.r + 4) return landFrontKick(self, other, m, fk);
    }
    if (m.t >= m.airMax) {
      // Nobody there: lands off balance, wide open.
      m.phase = "open"; m.t = 0;
      self.vx = m.ux * 150; self.vy = m.uy * 150;
      floater(self.x, self.y - self.r - 8, "WHIFF", "dodge");
      playKneeLand();
    }
    return true;
  }
  var damp = Math.exp(-7 * dt); self.vx *= damp; self.vy *= damp;
  if ((m.phase === "land" && m.t >= AS_LAND) || (m.phase === "open" && m.t >= fk.open)) { endFrontKick(self); return false; }
  return true;
}

function landFrontKick(self, other, m, fk) {
  var ux = m.ux, uy = m.uy, cb = self.asCb && asCfg(self).comeback;
  var free = kneeKnockable(other) && !other.holdAtOne && !other.guard && !other.sprawl && !other.sprawled;
  var koP = fk.koBase + fk.koLow * (1 - Math.max(0, Math.min(1, other.hp / MAX_HP))) + (cb ? cb.kickKo || 0 : 0);
  m.phase = "land"; m.t = 0; m.hit = true;
  self.vx = -ux * 120; self.vy = -uy * 120;
  var face = asFace(other), cx = face.x - ux * other.r * 0.35, cy = face.y - uy * other.r * 0.35;
  m.hx = face.x - ux * other.r * 0.15; m.hy = face.y - uy * other.r * 0.15; // where the sole lands
  if (free && (self.asClock || 0) >= (fk.koAfter || 0) && Math.random() * 100 < koP) {
    // The Belfort knockout: goes through every defence, like the KO Rush;
    // slipped or blocked, it does nothing at all.
    if (throwKoPunch(self, other)) {
      m.phase = "ko"; m.t = 0;
      self.vx = 0; self.vy = 0;
      asStat(self, "kickHit"); asStat(self, "kickKo");
      asKickSpark(self, other, cx, cy, ux, uy, true);
      playAsKickHit(60, true);
      playImpactClip(2, 1.3, 45);
      crowdReact(1);
      asComm("instantKo", self, other);
    }
    return true;
  }
  if (other.alive && !other.koOut) {
    var dealt = hurt(other, fk.damage, "kick", self.id);
    if (dealt > 0) {
      asStat(self, "kickHit");
      if (!other.justDodged && kneeKnockable(other)) { other.vx = ux * fk.knockback; other.vy = uy * fk.knockback; other.knockFly = Math.max(other.knockFly || 0, 0.22); }
      asKickSpark(self, other, cx, cy, ux, uy, false);
      other.squash = { t: 0.18, max: 0.18, nx: -ux, ny: -uy };
      hitStop = Math.max(hitStop, 0.08);
      if (!reduceMotion) shake = Math.max(shake, 16);
      playAsKickHit(dealt, false);
      playImpactClip(1, 1.1, dealt);
      crowdReact(0.6);
    }
    checkEnd();
  }
  return true;
}

function asKickSpark(self, other, cx, cy, ux, uy, big) {
  other.flash = 0.16;
  impacts.push({ x: cx, y: cy, nx: -ux, ny: -uy, life: big ? 0.6 : 0.45, max: big ? 0.6 : 0.45, color: AS_YELLOW });
  igbbSparks(cx, cy, -ux, -uy, AS_YELLOW, big ? 24 : 14, big ? 560 : 420);
  self.kneeFx = self.kneeFx || [];
  self.kneeFx.push({ x: cx, y: cy, t: 0, max: big ? 0.32 : 0.24, big: true, ang: Math.random() * Math.PI }); // the white star (drawKneeFlash, knees.js)
}

function endFrontKick(self) {
  var fk = asCfg(self) && asCfg(self).frontKick;
  self.asKick = null;
  self.asKickT = fk ? asRand(fk.every) : Infinity;
  if (self.alive && !self.koOut && inOrdinaryMovement(self)) setSpeed(self, self.baseSpeed || SPEED);
}

// ---------------------------------------------------------------- the triangle

function asTriNums(b) {
  var t = (asCfg(b) && asCfg(b).triangle) || {};
  return { tapBase: t.tapBase != null ? t.tapBase : 15, tapLowHp: t.tapLowHp != null ? t.tapLowHp : 55, time: t.time || [2.6, 3.8],
    tapAfter: t.tapAfter || 0, fromGnp: t.fromGnp || 0, gnpAfter: t.gnpAfter || [1, 2], fromTakedown: t.fromTakedown || 0, cooldown: t.cooldown || 0,
    strikes: t.strikes || null, reroll: t.reroll || 0 };
}
// His comeback numbers, while comeback mode is on (or nothing).
function asCbOn(b) { return b.asCb ? ((asCfg(b) && asCfg(b).comeback) || null) : null; }

// The chance they tap right now: their health, and comeback mode.
function asTapChance(self, vic) {
  var tri = asTriNums(self), cb = asCbOn(self);
  var hurtFrac = 1 - Math.max(0, Math.min(1, vic.hp / MAX_HP));
  var tapChance = Math.min(95, tri.tapBase + tri.tapLowHp * hurtFrac + (cb ? cb.triTap || 0 : 0));
  return conorTapChance(vic, tapChance, tri); // Conor McGregor taps easier (conor.js)
}

// Locks a triangle on `vic` from his back. `how`: "guard", "gnp" or "takedown".
function beginSpiderTriangle(self, vic, how) {
  var tri = asTriNums(self);
  var tapChance = asTapChance(self, vic);
  var side = vic.x >= self.x ? 1 : -1;
  var gap = (self.r + vic.r) * ARMBAR_GAP;
  if (self.x + side * (gap + vic.r) > W || self.x + side * (gap + vic.r) < 0) side = -side;
  clearActions(self); clearActions(vic);
  self.guard = null; self.asKick = null; self.asTaunt = null; self.asCounter = null;
  self.armbar = {
    vicId: vic.id, t: 0, dur: asRand(tri.time), taps: (self.asClock || 0) >= tri.tapAfter && Math.random() < tapChance / 100, tapChance: tapChance,
    bar: 0, phase: "squeeze", tapT: 0, side: side, wob: Math.random() * 10, tri: true, how: how, asNext: null, asN: 0
  };
  vic.choked = true;
  [self, vic].forEach(function (b) { b.vx = 0; b.vy = 0; });
  self.y = Math.max(self.y, self.r * 0.3 + vic.r * 2 + 6); // room over their head for his legs (they're held just above him)
  self.asTriCd = tri.cooldown;
  floater((self.x + vic.x) / 2, Math.min(self.y, vic.y) - vic.r - 60, "TRIANGLE", "crit");
  if (how !== "guard") floater(self.x, self.y + self.r + 26, "OFF HIS BACK", "note");
  var st = self.asStats;
  if (st) { st.tri++; if (how === "guard") st.triGuard++; else if (how === "gnp") st.triGnp++; else st.triTd++; }
  if (!reduceMotion) shake = Math.max(shake, 10);
  crowdReact(0.7);
  playAsTriangle();
  asComm("choke", self, vic);
}

function asTriReady(b) { return (b.asTriCd || 0) <= 0; }

// While he holds it: strikes on their trapped head, and partway in a second
// look at the tap with the damage he's done since.
function runAsTriangle(self, cfg, dt) {
  var c = self.armbar, vic = balls[c.vicId], tri = asTriNums(self);
  tickElbowAnim(self, vic, dt); // (updateElbows isn't reached while he holds it)
  if (c.phase !== "squeeze" || !vic || !vic.alive || !self.alive) return;
  if (tri.reroll && !c.asRe && c.t >= c.dur * tri.reroll) {
    c.asRe = true;
    if (!c.taps && (self.asClock || 0) >= tri.tapAfter) {
      var now = asTapChance(self, vic);
      if (now > c.tapChance) {
        var p = (now - c.tapChance) / Math.max(1, 100 - c.tapChance);
        c.tapChance = now;
        if (Math.random() < p) {
          c.taps = true; // the bar swings back over to the tap (armbar.js)
          floater(vic.x, vic.y - vic.r - 50, "SINKING IN", "note");
          asStat(self, "sinking");
        }
      }
    }
  }
  var st = tri.strikes;
  if (!st) return;
  if (c.asNext == null) c.asNext = st.first != null ? st.first : 0.5;
  c.asNext -= dt;
  if (c.asNext > 0 || c.asN >= (st.max || 5) || self.elbowAnim || c.t > c.dur - 0.25) return;
  c.asNext = st.gap || 0.42;
  c.asN++;
  if (Math.random() * 100 < (st.elbows != null ? st.elbows : 60)) {
    throwElbow(self, vic, { damage: st.damage, critChance: st.critChance, critMult: st.critMult, source: "finisher", always: true, knockback: 0, speed: 0.24, cut: null,
      onLand: function (dealt, crit) {
        if (dealt > 0) asStat(self, "triHit");
        if (dealt > 0 && crit && !c.asCalled) { c.asCalled = true; asComm("elbows", self, vic); }
      } });
    return;
  }
  // A short punch down on their head.
  var f = asFace(vic), dx = f.x - self.x, dy = f.y - self.y, d = Math.sqrt(dx * dx + dy * dy) || 1;
  self.jabAnim = { t: 0, dur: 0.2, sign: c.asN % 2 ? 1 : -1, big: false, dx: dx / d, dy: dy / d };
  var crit = Math.random() * 100 < (st.critChance || 0);
  var dealt = hurt(vic, st.damage * (crit ? st.critMult || 2 : 1), "finisher", self.id);
  if (dealt > 0) {
    asStat(self, "triHit");
    if (crit) floater(vic.x, vic.y - vic.r - 30, "CRIT!", "crit");
    playPunch(dealt + 6);
    igbbSparks(f.x, f.y, -dx / d, -dy / d, AS_YELLOW, crit ? 10 : 5, 260);
    if (!reduceMotion) shake = Math.max(shake, crit ? 9 : 4);
  }
  checkEnd();
}

// Ground and pound on him (a passed guard, Jon Jones's): maybe he throws his
// legs up for the triangle between punches. True if it started.
function asGnpTriangle(self, cfg) {
  var g = self.guillo, tri = cfg.triangle, cb = asCbOn(self);
  if (!tri || !tri.fromGnp || !g || (g.phase !== "mount" && g.phase !== "pound")) return false;
  if (!g.asRolled) {
    g.asRolled = true;
    var after = tri.gnpAfter || [1, 2];
    g.asAt = asTriReady(self) && Math.random() * 100 < tri.fromGnp + (cb ? cb.fromGnp || 0 : 0) ? Math.round(asRand([after[0] - 0.49, after[1] + 0.49])) : -1;
  }
  // As they wind up the punch after that many, he traps the arm and throws his legs up.
  if (g.asAt < 0 || g.phase !== "pound" || g.thrown <= g.asAt || !g.gp || g.gp.hit) return false;
  var atk = balls[g.atkId];
  if (!self.alive || !atk || !atk.alive) return false;
  endGuillotine(self);
  beginSpiderTriangle(self, atk, "gnp");
  return true;
}

// ---------------------------------------------------------------- comeback

// Every frame: losing late, the finish gets likelier.
function asComeback(b, other, cb) {
  if (!cb || !b.alive || !other.alive || !started || over) return;
  var gap = other.hp - b.hp;
  if (!b.asCb) {
    if (gap < cb.behind || (b.hp > cb.lowHp * MAX_HP && b.asClock < cb.after)) return;
    b.asCb = true;
    asStat(b, "comeback");
    if (b.asCbN === 0) {
      floater(b.x, b.y - b.r - 30, "COMEBACK", "crit");
      crowdReact(0.5);
      playAsComeback();
      var tk = asCfg(b).talk || {}; // "I back. Trust me, I back.", `talk.comebackChance`% of the time
      if (Math.random() * 100 < (tk.comebackChance != null ? tk.comebackChance : 75)) b.asPend = { key: "comeback", until: b.asClock + 5 };
    }
    b.asCbN++;
  } else if (gap < cb.behind * 0.4) b.asCb = false;
}

// From hurt (match.js), with the other damage multipliers: in comeback mode
// some of what he lands are critical hits.
function andersonDamageMult(b, source, attackerId) {
  var a = attackerId != null ? balls[attackerId] : null;
  if (!a || a === b || !a.asCb || !AS_CRIT_SOURCES[source]) return 1;
  var cb = asCbOn(a);
  if (!cb || Math.random() * 100 >= (cb.crit || 0)) return 1;
  floater(b.x, b.y - b.r - 30, "CRIT!", "crit");
  asStat(a, "crit");
  hitStop = Math.max(hitStop, 0.05);
  return cb.critMult || 1.5;
}

// ---------------------------------------------------------------- Spider Code

// From updateSpecial (special.js) for special.move "mranderson".
function updateMrAnderson(self, other, dt) {
  var sp = asNeoSp(self);
  if (!sp) return false;
  if (!self.igbb) {
    if (sp.again === false && self.asNeoN > 0) { self.specialT = 0; return false; }
    if (self.specialT < sp.chargeTime || !started || over || self.asNeo || (self.asClock || 0) < (sp.delay || 0) || andersonBusy(self) ||
        !canStartIgbb(self, other) || swordDuelActive()) return false;
    clearActions(self);
    self.igbb = { move: "mranderson", phase: "suit", t: 0, frame: asFrame };
    self.vx = 0; self.vy = 0;
    self.asNeoN++;
    floater(self.x, self.y - self.r - 84, "SPIDER CODE", "crit"); // (over the speech bubble)
    asRainOn(sp);
    playAsNeoOn();
    crowdReact(0.8);
    asStat(self, "neo");
  }
  var m = self.igbb;
  if (m.move !== "mranderson") return false;
  m.frame = asFrame;
  m.t += dt;
  self.vx = 0; self.vy = 0;
  if (!m.suited && m.t >= (sp.suit || 1) * 0.5) { m.suited = true; asNeoSuit(self, true); asGlyphBurst(self, 22); }
  if (m.t >= (sp.suit || 1)) { asSuited(self); return false; }
  return true;
}

// The change is done: the mode runs for `time` seconds on its own.
function asSuited(b) {
  var sp = asNeoSp(b);
  b.igbb = null;
  b.specialT = 0;
  if (!b.alive || !sp) { asRainCheck(); return; }
  asNeoSuit(b, true);
  b.asNeo = { t: 0, dur: sp.time || 12 };
  setSpeed(b, b.baseSpeed || SPEED);
}

function endNeo(b) {
  b.asNeo = null;
  if (b.alive) { asGlyphBurst(b, 18); playAsNeoOff(); }
  asNeoSuit(b, false);
  asRainCheck();
}

// The coat and glasses on (or off), on his own copy of the character
// (Hokit's Dark Side does the same, hokit-darkside.js).
function asNeoSuit(b, on) {
  if (on) {
    if (!b.char.look || (b.asLookOff && b.char.look.neoCoat)) return;
    if (!b.asLookOff) b.asLookOff = b.char.look;
    b.char = Object.assign({}, b.char, { look: Object.assign({}, b.asLookOff, { neoCoat: true }) });
  } else if (b.asLookOff) {
    b.char = Object.assign({}, b.char, { look: b.asLookOff });
    b.asLookOff = null;
  }
}

// A burst of green code bits off him (the coat going on or coming off).
function asGlyphBurst(b, n) {
  for (var i = 0; i < n && !reduceMotion; i++) {
    var a = Math.random() * Math.PI * 2, s = 60 + Math.random() * 200;
    particles.push({ x: b.x + Math.cos(a) * b.r * 0.7, y: b.y + Math.sin(a) * b.r * 0.7, vx: Math.cos(a) * s, vy: Math.sin(a) * s,
      life: 0.4 + Math.random() * 0.35, max: 0.75, size: 2 + Math.random() * 3, color: i % 3 ? AS_GREEN : "#d8ffd8" });
  }
}

// Bullet time off a weave in Spider Code.
function asTryBullet(b, atk, bt, proj) {
  if (asBullet || (b.asBulletCd || 0) > 0 || over) return;
  if (!proj && Math.random() * 100 >= bt.chance) return;
  b.asBulletCd = bt.cooldown || 1;
  asBullet = { t: 0, dur: bt.time || 0.6, scale: bt.scale || 0.3, x0: atk ? atk.x : b.x, y0: atk ? atk.y : b.y - 120, x1: b.x, y1: b.y };
  asStat(b, "bullet");
  playAsBullet();
}

// From the game loop (main.js): how fast the whole fight runs. Slowed right
// down for a moment of bullet time, easing in and out.
function andersonTimeScale() {
  var bt = asBullet;
  if (!bt) return 1;
  var k = bt.t / bt.dur, ramp = k < 0.15 ? k / 0.15 : k > 0.7 ? Math.max(0, (1 - k) / 0.3) : 1;
  return 1 - (1 - bt.scale) * ramp;
}

// The code rain: on while anyone's in Spider Code, fading in and out.
function asRainOn(sp) {
  if (!asRain) asRain = { k: 0, want: 1, dark: sp && sp.rain != null ? sp.rain : 0.55, cols: [] };
  asRain.want = 1;
  if (!asRain.cols.length) for (var x = AS_CELL / 2; x < W; x += AS_CELL) asRain.cols.push(asRainCol(x, true));
}
function asRainCheck() {
  if (asRain && !balls.some(function (b) { return b.asNeo || (b.igbb && b.igbb.move === "mranderson"); })) asRain.want = 0;
}
function asRainCol(x, first) {
  var g = [];
  for (var i = 0; i < 16; i++) g.push(Math.floor(Math.random() * AS_GLYPHS.length));
  return { x: x, y: first ? Math.random() * H * 1.2 - H * 0.3 : -Math.random() * 160, v: 120 + Math.random() * 190, len: 6 + Math.floor(Math.random() * 10), g: g };
}
function tickAsRain(dt) {
  var R = asRain;
  if (!R) return;
  R.k = R.want ? Math.min(1, R.k + dt * 2.2) : Math.max(0, R.k - dt * 1.4);
  if (!R.want && R.k <= 0) { asRain = null; return; }
  if (reduceMotion) return;
  R.cols.forEach(function (c, i) {
    c.y += c.v * dt;
    if (Math.random() < dt * 6) c.g[Math.floor(Math.random() * c.g.length)] = Math.floor(Math.random() * AS_GLYPHS.length); // a glyph flickers to another
    if (c.y - c.len * AS_CELL > H) R.cols[i] = asRainCol(c.x, false);
  });
}

// ---------------------------------------------------------------- every frame

// From update(), after the abilities loop.
function tickAnderson(dt) {
  asNow += dt;
  if (asBullet) {
    asBullet.t += dt / Math.max(0.05, andersonTimeScale()); // (in real seconds)
    if (asBullet.t >= asBullet.dur || over) asBullet = null;
  }
  tickAsRain(dt);
  balls.forEach(function (b) {
    var cfg = asCfg(b), other = balls[1 - b.id];
    if (b.asLean) {
      var L = b.asLean;
      L.t += dt;
      if (L.neo) {
        // The bullet dodge: a trail of ghosts along the lean.
        var q = Math.min(3, Math.floor(L.t / L.dur * 4));
        while (L.qn < q) { L.qn++; var kq = asLeanK(b) * b.r * 0.75; b.asGhosts.push({ x: b.x + L.ux * kq, y: b.y + L.uy * kq, t: 0, neo: true }); }
      } else if (!L.ghost && L.t >= L.dur * 0.5) {
        L.ghost = true;
        var k = asLeanK(b) * b.r * 0.75;
        b.asGhosts.push({ x: b.x + L.ux * k * 0.5, y: b.y + L.uy * k * 0.5, t: 0.08 });
      }
      if (L.t >= L.dur) b.asLean = null;
    }
    if (b.asGhosts && b.asGhosts.length) b.asGhosts = b.asGhosts.filter(function (g) { g.t += dt; return g.t < (g.neo ? AS_NEO_GHOST : AS_GHOST); });
    if (b.asBulletCd > 0) b.asBulletCd -= dt;
    if (started && !over) b.asClock += dt;
    // Spider Code: the change, then the mode running down.
    var nm = b.igbb;
    if (nm && nm.move === "mranderson" && (nm.frame !== asFrame || !b.alive)) asSuited(b); // (something else took him over: the change is done)
    if (b.asNeo) {
      b.asNeo.t += dt;
      if (b.asNeo.t >= b.asNeo.dur || !b.alive) endNeo(b);
    }
    if (!cfg) return;
    var f = b.asKick;
    if (f && f.phase === "ko") {
      f.t += dt;
      if (other.koOut) { var damp = Math.exp(-5 * dt); other.vx *= damp; other.vy *= damp; }
      if (f.t >= AS_KO_HOLD || !other.koOut || !b.alive) { endFrontKick(b); finishKnockedOut(other); checkEnd(); }
    } else if (f && f.frame !== asFrame) endFrontKick(b);
    if (b.asTaunt && b.asTaunt.frame !== asFrame) endHandsDown(b);
    if (b.asTauntCd > 0) b.asTauntCd -= dt;
    if (b.asTriCd > 0 && !b.armbar) b.asTriCd -= dt;
    if (b.asRunT > 0) { b.asRunT -= dt; if (b.asRunT <= 0) b.asRun = 0; }
    if (b.hp < b.asHp - 0.001) b.asRun = 0; // a hit on him ends the run
    b.asHp = b.hp;
    if (b.guard && !b.asWasGuard) asStat(b, "guard");
    b.asWasGuard = !!b.guard;
    // A takedown that slammed him: maybe he locks the triangle up as they come down.
    var og = other.grapple;
    if (b.grappled && og && og.targetId === b.id && !og.finisher) b.asTd = { atkId: other.id };
    else if (b.asTd && !b.grappled) {
      b.asTd = null;
      var tri = cfg.triangle;
      if (tri && tri.fromTakedown && b.alive && other.alive && !over && !b.koOut && !other.koOut && !subLocked(b) && !subLocked(other) &&
          !other.grapple && !other.grappled && !other.igbb && !b.igbb && !b.slam && asTriReady(b) && Math.random() * 100 < tri.fromTakedown) {
        tossSkipBounce(b);
        beginSpiderTriangle(b, other, "takedown");
      }
    }
    // The tap.
    var c = b.armbar;
    if (c && c.tri && c.phase === "tap" && !c.asTapped) { c.asTapped = true; asStat(b, "triTap"); }
    asComeback(b, other, cfg.comeback);
    // His lines: one at a time, never over another.
    if (b.asPend) {
      if (asTalkFree(b)) { asSay(b, b.asPend.key); b.asPend = null; }
      else if (b.asClock > b.asPend.until || over) b.asPend = null;
    }
    if (b.cmb && b.cmb.hits >= 2 && b.asCmbSeen !== b.cmb) { b.asCmbSeen = b.cmb; asComboLine(b, cfg); }
    if (b.plum && b.plum.vicId === other.id && b.plum.landed >= 2 && b.asPlumSeen !== b.plum) { b.asPlumSeen = b.plum; asComboLine(b, cfg); }
    if (b.clin && b.clin.vicId === other.id && b.clin.landed >= 2 && b.asClinSeen !== b.clin) { b.asClinSeen = b.clin; asComboLine(b, cfg); } // the same in his clinch (clinch.js)
    // After a win, every time: it waits as long as it takes for its turn
    // (the knockout call, their last line), never dropped.
    if (over && !b.asSaid.win && b.alive && !other.alive) {
      b.asWinT = (b.asWinT || 0) + dt;
      if (b.asWinT > 0.8 && asTalkFree(b)) { b.asSaid.win = true; asSay(b, "win"); }
    }
  });
  asFrame++;
}

// ---------------------------------------------------------------- drawing

// From draw.js with the other offsets: the lean back out of a strike, and a
// little sway with his hands down.
function andersonOffset(b) {
  var o = { x: 0, y: 0 };
  if (b.asLean) {
    var k = asLeanK(b) * b.r * 0.75;
    o.x += b.asLean.ux * k; o.y += b.asLean.uy * k;
  }
  if (b.asTaunt) o.x += Math.sin(b.asTaunt.t * 7 + b.asTaunt.sway) * b.r * 0.1;
  return o;
}

// From draw.js, inside the fighter's transform: bent back in the lean,
// crouched to load the front kick, up in the air for it.
function applyAndersonPose(b) {
  if (b.asLean) {
    var k = asLeanK(b), ang = Math.atan2(b.asLean.uy, b.asLean.ux), bend = b.asLean.neo ? 0.75 : 0.5;
    ctx.translate(b.x, b.y);
    ctx.rotate(b.asLean.ux * bend * k); // the top of him goes back, away from the shot
    ctx.rotate(ang); ctx.scale(1 - 0.12 * k, 1 + 0.03 * k); ctx.rotate(-ang);
    ctx.translate(-b.x, -b.y);
  }
  if (b.asTaunt) {
    ctx.translate(b.x, b.y + b.r); ctx.rotate(Math.sin(b.asTaunt.t * 7 + b.asTaunt.sway) * 0.12); ctx.translate(-b.x, -(b.y + b.r));
  }
  var m = b.asKick;
  if (!m) return;
  if (m.phase === "load") {
    var fk = asCfg(b).frontKick, l = Math.min(1, m.t / fk.load);
    ctx.translate(b.x, b.y + b.r); ctx.scale(1 + 0.06 * l, 1 - 0.1 * l); ctx.translate(-b.x, -(b.y + b.r));
  } else if (m.phase === "air") {
    var s = 1 + 0.14 * Math.sin(Math.min(1, m.t / (m.airMax || 0.3)) * Math.PI);
    ctx.translate(b.x, b.y); ctx.scale(s, s); ctx.rotate(-(m.ux >= 0 ? 1 : -1) * 0.18); ctx.translate(-b.x, -b.y);
  } else if (m.phase === "open") {
    var fk2 = asCfg(b).frontKick;
    ctx.translate(b.x, b.y); ctx.rotate(Math.sin(m.t * 16) * 0.2 * (1 - m.t / fk2.open)); ctx.translate(-b.x, -b.y);
  }
}

// The code glyphs, drawn once into a strip (green, and the bright head of a
// column), mirrored like the film's.
function asGlyphAtlas() {
  if (asAtlas) return asAtlas;
  var n = AS_GLYPHS.length, cw = AS_CELL, ch = 24, cv = document.createElement("canvas");
  cv.width = cw * n; cv.height = ch * 2;
  var c = cv.getContext("2d");
  c.font = "700 18px \"Hiragino Kaku Gothic ProN\", \"Hiragino Sans\", \"Noto Sans JP\", \"MS Gothic\", monospace";
  c.textAlign = "center"; c.textBaseline = "middle";
  for (var i = 0; i < n; i++) {
    [AS_GREEN, "#e4ffe6"].forEach(function (col, row) {
      c.save();
      c.translate(i * cw + cw / 2, row * ch + ch / 2); c.scale(-1, 1);
      c.fillStyle = col; c.fillText(AS_GLYPHS[i], 0, 0);
      c.restore();
    });
  }
  asAtlas = { cv: cv, cw: cw, ch: ch };
  return asAtlas;
}

// The cage gone dark with green code falling down it.
function drawAsRain() {
  var R = asRain;
  if (!R || R.k <= 0.01) return;
  ctx.save();
  ctx.globalAlpha = R.k * R.dark;
  ctx.fillStyle = "#010a03";
  ctx.fillRect(0, 0, W, H);
  var at = asGlyphAtlas();
  R.cols.forEach(function (c) {
    for (var i = 0; i < c.len; i++) {
      var y = c.y - i * AS_CELL;
      if (y < -AS_CELL || y > H + AS_CELL) continue;
      ctx.globalAlpha = R.k * (i === 0 ? 0.9 : 0.7 * (1 - i / c.len));
      ctx.drawImage(at.cv, c.g[i % c.g.length] * at.cw, i === 0 ? at.ch : 0, at.cw, at.ch, c.x - at.cw / 2, y - at.ch / 2, at.cw, at.ch);
    }
  });
  ctx.restore();
}

// The skirt of the long black coat, flaring out behind him (under him): it
// hangs down when he's still and streams back the faster he goes, split up
// the back, its hem rippling.
function drawNeoTails(b) {
  var r = b.r, sp = Math.sqrt(b.vx * b.vx + b.vy * b.vy), bx = 0, by = 1;
  var hang = Math.max(0, 1 - sp / 260);
  if (sp > 1) { bx = -b.vx / sp * (1 - hang); by = -b.vy / sp * (1 - hang) + hang; }
  var bl = Math.sqrt(bx * bx + by * by) || 1; bx /= bl; by /= bl;
  var o = andersonOffset(b), x = b.x + o.x, y = b.y + o.y, px = -by, py = bx;
  var L = r * (0.55 + 0.6 * Math.min(1, sp / 320)), w = asNow * 11, fl = 0.08 + 0.1 * Math.min(1, sp / 320);
  function at(side, back) { return { x: x + px * side + bx * back, y: y + py * side + by * back }; } // `side` across him, `back` behind his middle
  var wl = Math.sin(w) * r * fl, wr = Math.sin(w + 1.7) * r * fl, wm = Math.sin(w + 0.8) * r * fl;
  var rootL = at(-r * 0.86, r * 0.3), rootR = at(r * 0.86, r * 0.3);
  var hemL = at(-r * 1.08 + wl, r + L), hemR = at(r * 1.08 - wr, r + L);
  var midL = at(-r * 0.2, r + L * 0.97 + wm), midR = at(r * 0.2, r + L * 0.97 - wm), vent = at(0, r + L * 0.62);
  ctx.save();
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(rootL.x, rootL.y);
  var cL = at(-r * 1.12 - wl * 0.5, r * 0.5 + L * 0.5), cR = at(r * 1.12 + wr * 0.5, r * 0.5 + L * 0.5);
  ctx.quadraticCurveTo(cL.x, cL.y, hemL.x, hemL.y);
  var hL = at(-r * 0.65, r + L * 1.06 + wl * 0.6);
  ctx.quadraticCurveTo(hL.x, hL.y, midL.x, midL.y);
  ctx.lineTo(vent.x, vent.y); // the split up the back
  ctx.lineTo(midR.x, midR.y);
  var hR = at(r * 0.65, r + L * 1.06 - wr * 0.6);
  ctx.quadraticCurveTo(hR.x, hR.y, hemR.x, hemR.y);
  ctx.quadraticCurveTo(cR.x, cR.y, rootR.x, rootR.y);
  ctx.closePath();
  var g = ctx.createLinearGradient(x, y, x + bx * (r + L), y + by * (r + L));
  g.addColorStop(0, "#2a2c31"); g.addColorStop(0.6, "#111215"); g.addColorStop(1, "#050506");
  ctx.fillStyle = g; ctx.fill();
  ctx.strokeStyle = theme.wall; ctx.lineWidth = 3; ctx.stroke();
  // Light catching the folds of the leather.
  ctx.strokeStyle = "rgba(255,255,255,0.16)"; ctx.lineWidth = 2.5; ctx.lineCap = "round";
  [-0.55, 0.55].forEach(function (k) {
    var a = at(r * k * 1.1, r * 0.75), e = at(r * k * 1.25 + (k < 0 ? wl : -wr) * 0.5, r + L * 0.85);
    ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(e.x, e.y); ctx.stroke();
  });
  ctx.restore();
}

// From draw.js, under the fighters: the code rain, the coat's tails, ghosts
// of him where he leaned out of a shot, the front kick's yellow line, and his
// shadow in the air.
function drawAndersonUnder() {
  drawAsRain();
  balls.forEach(function (b) {
    if (!b.alive) return;
    (b.asGhosts || []).forEach(function (g) {
      if (g.t < 0) return;
      ctx.save();
      ctx.globalAlpha = (g.neo ? 0.5 : 0.45) * (1 - g.t / (g.neo ? AS_NEO_GHOST : AS_GHOST));
      if (b.char.look) drawFighterArt(ctx, g.x, g.y, b.r, b.char.look, theme.wall, { layout: "contained", name: b.char.name });
      else { ctx.fillStyle = b.char.color; ctx.beginPath(); ctx.arc(g.x, g.y, b.r, 0, Math.PI * 2); ctx.fill(); }
      if (g.neo) { ctx.strokeStyle = AS_GREEN; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(g.x, g.y, b.r + 2, 0, Math.PI * 2); ctx.stroke(); }
      ctx.restore();
    });
    if (b.char.look && b.char.look.neoCoat) drawNeoTails(b);
    var m = b.asKick;
    if (!m) return;
    ctx.save();
    if (m.phase === "load") {
      var fk = asCfg(b).frontKick, k = Math.min(1, m.t / fk.load);
      ctx.globalAlpha = 0.4 + 0.5 * k;
      ctx.strokeStyle = AS_YELLOW; ctx.lineWidth = 4; ctx.setLineDash([12, 9]); ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(b.x, b.y); ctx.lineTo(m.tx, m.ty); ctx.stroke();
      ctx.setLineDash([]);
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(m.tx, m.ty, b.r * (0.42 + 0.14 * Math.sin(m.t * 30)), 0, Math.PI * 2); ctx.stroke();
    } else if (m.phase === "air") {
      ctx.globalAlpha = 0.22; ctx.fillStyle = "#000000";
      ctx.beginPath(); ctx.ellipse(b.x, b.y + b.r * 0.9, b.r * 0.85, b.r * 0.28, 0, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  });
}

// The straight leg of the front kick: from the hip (where knees.js puts it)
// out to `foot`, the knee barely bent, the sole of the foot first.
function drawAsKickLeg(b, foot, side) {
  var limb = kneeLimb(b), skin = kneeSkin(b), r = b.r;
  var ang = Math.atan2(foot.y - b.y, foot.x - b.x), ux = Math.cos(ang), uy = Math.sin(ang);
  var hip = { x: b.x + ux * r * 0.28 + side * r * 0.14, y: b.y + uy * r * 0.28 + r * 0.42 };
  var knee = { x: (hip.x + foot.x) / 2 - uy * side * r * 0.08, y: (hip.y + foot.y) / 2 + ux * side * r * 0.08 - r * 0.06 };
  ctx.save();
  strokeLimb(limb * 1.05, skin, function () { ctx.moveTo(knee.x, knee.y); ctx.lineTo(foot.x, foot.y); });
  strokeLimb(limb * 1.4, skin, function () { ctx.moveTo(hip.x, hip.y); ctx.lineTo(knee.x, knee.y); });
  strokeLimb(limb * 1.5, kneeShorts(b), function () { ctx.moveTo(hip.x, hip.y); ctx.lineTo(hip.x + (knee.x - hip.x) * 0.14, hip.y + (knee.y - hip.y) * 0.14); });
  var fa = Math.atan2(foot.y - knee.y, foot.x - knee.x);
  ctx.translate(foot.x, foot.y);
  ctx.rotate(fa);
  drawKickFoot(limb * 1.15, skin, fa > -Math.PI / 2 && fa < Math.PI / 2 ? -1 : 1); // toes up
  ctx.restore();
}

// Bullet time: the cage tinted green, rings in the air along the shot he
// leaned out of.
function drawAsBullet() {
  var bt = asBullet;
  if (!bt) return;
  var k = Math.min(1, bt.t / bt.dur), ramp = k < 0.15 ? k / 0.15 : k > 0.7 ? Math.max(0, (1 - k) / 0.3) : 1;
  ctx.save();
  ctx.globalAlpha = 0.1 * ramp; ctx.fillStyle = AS_GREEN; ctx.fillRect(0, 0, W, H);
  if (!reduceMotion) {
    var dx = bt.x1 - bt.x0, dy = bt.y1 - bt.y0, ang = Math.atan2(dy, dx);
    ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 2.5;
    for (var i = 0; i < 4; i++) {
      var f = 0.22 + i * 0.17, rr = 8 + 24 * Math.min(1, k * 1.5 + i * 0.12);
      ctx.globalAlpha = 0.6 * (1 - k) * ramp;
      ctx.beginPath(); ctx.ellipse(bt.x0 + dx * f, bt.y0 + dy * f, rr * 0.4, rr, ang, 0, Math.PI * 2); ctx.stroke();
    }
  }
  ctx.restore();
}

// From draw.js, over both fighters (so the foot shows on their face): the
// knee chambered for the tell, then the leg straight out in the air, the
// foot on their face as it lands, and back down. Bullet time over everything,
// and a green scan line down him as the coat goes on.
function drawAndersonOver() {
  drawAsBullet();
  balls.forEach(function (b) {
    var sm = b.igbb;
    if (b.alive && sm && sm.move === "mranderson") {
      var sk = Math.min(1, sm.t / ((asNeoSp(b) && asNeoSp(b).suit) || 1)), sy = b.y - b.r * 1.2 + b.r * 2.4 * sk;
      ctx.save();
      ctx.globalAlpha = 0.85 * (1 - sk * 0.5); ctx.fillStyle = AS_GREEN;
      ctx.fillRect(b.x - b.r * 1.25, sy - 2, b.r * 2.5, 4);
      ctx.globalAlpha = 0.25 * (1 - sk * 0.5);
      ctx.fillRect(b.x - b.r * 1.25, sy - 12, b.r * 2.5, 10);
      ctx.restore();
    }
    var m = b.asKick, cfg = asCfg(b);
    if (!b.alive || !m || !cfg || !cfg.frontKick) return;
    var fk = cfg.frontKick, r = b.r;
    if (m.phase === "load") {
      var k = Math.min(1, m.t / fk.load), a0 = Math.atan2(m.ty - b.y, m.tx - b.x);
      drawKneeLeg(b, kneePose(b, a0, m.side, 0.3 * k, r * 1.15), 0.35 * k * (0.5 + 0.5 * Math.sin(m.t * 40)));
      return;
    }
    var ux = m.ux, uy = m.uy, px = -uy, py = ux, foot;
    if (m.phase === "air") {
      var e = Math.min(1, 0.45 + m.t / 0.1), len = r + fk.reach * e;
      foot = { x: b.x + ux * len, y: b.y + uy * len };
      if (!reduceMotion) {
        // Speed lines off the back of him.
        ctx.save();
        ctx.strokeStyle = "#ffffff"; ctx.lineCap = "round"; ctx.lineWidth = 4; ctx.globalAlpha = 0.7;
        [-0.55, -0.18, 0.18, 0.55].forEach(function (o, i) {
          var back = r * (1.15 + (i % 2) * 0.35), ln = r * (0.8 + (i % 2) * 0.4);
          ctx.beginPath();
          ctx.moveTo(b.x - ux * back + px * o * r, b.y - uy * back + py * o * r);
          ctx.lineTo(b.x - ux * (back + ln) + px * o * r, b.y - uy * (back + ln) + py * o * r);
          ctx.stroke();
        });
        ctx.restore();
      }
    } else if (m.phase === "land" || m.phase === "ko") {
      // Planted on their face, then pulled back.
      var back = m.phase === "ko" ? Math.min(1, m.t / 0.45) : Math.min(1, m.t / AS_LAND), hx = m.hx != null ? m.hx : b.x + ux * (r + fk.reach), hy = m.hy != null ? m.hy : b.y + uy * (r + fk.reach);
      var rest = { x: b.x + ux * r * 0.9, y: b.y + uy * r * 0.9 + r * 0.3 };
      if (back >= 1) return;
      foot = { x: hx + (rest.x - hx) * easeOut(back), y: hy + (rest.y - hy) * easeOut(back) };
    } else {
      var d2 = Math.min(1, m.t / fk.open);
      if (d2 >= 1) return;
      var lo = r + fk.reach * (1 - d2);
      foot = { x: b.x + ux * lo, y: b.y + uy * lo + r * 0.4 * d2 };
    }
    drawAsKickLeg(b, foot, m.side);
  });
}

// From draw.js with the other attacks, on his body: his hands down by his
// sides, swinging a little ("come on").
function drawAnderson(b) {
  if (!b.alive || !b.asTaunt) return;
  var t = b.asTaunt.t, r = b.r;
  ctx.save();
  [-1, 1].forEach(function (s) {
    var swing = Math.sin(t * 7 + b.asTaunt.sway + (s > 0 ? 1.2 : 0)) * r * 0.08;
    var sh = { x: b.x + s * r * 0.72, y: b.y - r * 0.05 };
    var hand = { x: b.x + s * r * 1.02, y: b.y + r * 0.55 + swing };
    strokeLimb(r * 0.2, armColor(b.char, s), function () { ctx.moveTo(sh.x, sh.y); ctx.quadraticCurveTo(b.x + s * r * 1.08, b.y + r * 0.2, hand.x, hand.y); });
    drawGloveAt(hand.x, hand.y, r * 0.26, b.char, Math.PI / 2);
  });
  ctx.restore();
}

// From drawArmbars (armbar.js): the triangle. He's flat on his back (onBack,
// guard.js); their head and one arm are trapped in a ring of his legs, one
// leg over the top of their head with the shin across the back of the neck,
// the other across their throat with its knee locked over the first foot,
// while their face goes red.
function drawSpiderTriangle(self, c) {
  var vic = balls[c.vicId], s = c.side, r = self.r, ar = vic.r;
  var sx = self.x, sy = self.y, vx = vic.x, vy = vic.y;
  var squeeze = c.phase === "tap" ? 1 : Math.max(0, c.bar);
  var la = -s * (0.3 + 0.15 * squeeze), lc = Math.cos(la), ls = Math.sin(la); // their lean (applyArmbarPose)
  function onVic(lx, ly) { return { x: vx + lx * lc - ly * ls, y: vy + lx * ls + ly * lc }; }
  var limb = r * 0.22, skin = self.char.look ? self.char.look.skin : self.char.color;
  ctx.save();

  // Their face going red as it sinks in.
  if (squeeze > 0) {
    ctx.save();
    ctx.beginPath(); ctx.arc(vx, vy, ar, 0, Math.PI * 2); ctx.clip();
    ctx.globalAlpha = 0.55 * squeeze;
    ctx.fillStyle = "#d62020";
    var face = onVic(0, -ar * 0.52);
    ctx.beginPath(); ctx.arc(face.x, face.y, ar * 0.46, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  // Their trapped arm, pinned up beside their head inside his legs.
  var tsh = onVic(-s * ar * 0.55, ar * 0.2), tel = onVic(-s * ar * 0.05, -ar * 0.05), twr = onVic(s * ar * 0.22, -ar * 0.62);
  strokeLimb(ar * 0.17, armColor(vic.char), function () { ctx.moveTo(tsh.x, tsh.y); ctx.quadraticCurveTo(tel.x, tel.y, twr.x, twr.y); });
  drawGloveAt(twr.x, twr.y, ar * 0.17, vic.char);

  // Leg one: up and over the top of their head, the shin coming down across
  // the back of the neck on the far side.
  var hipA = { x: sx + s * r * 0.66, y: sy - r * 0.22 }, hipB = { x: sx + s * r * 0.66, y: sy + r * 0.24 };
  var footA = onVic(s * ar * 1.0, -ar * 0.12);
  drawBjjLeg(self.char, hipA, onVic(-s * ar * 0.25, -ar * 1.65), footA, limb, s * 1.2, r * 0.2, true);
  // Leg two: straight across their throat, its knee hooked over the first
  // foot (the lock), the shin folded back up beside their head.
  var kneeB = onVic(s * ar * 1.02, -ar * 0.05), footB = onVic(s * ar * 0.62, -ar * 0.92);
  drawBjjLeg(self.char, hipB, onVic(-s * ar * 0.3, ar * 0.12), kneeB, limb, 0, 0, true);
  strokeLimb(limb * 1.15, skin, function () { ctx.moveTo(kneeB.x, kneeB.y); ctx.lineTo(footB.x, footB.y); });
  ctx.save(); ctx.translate(footB.x, footB.y); ctx.rotate(Math.atan2(footB.y - kneeB.y, footB.x - kneeB.x)); drawKickFoot(limb * 0.9, skin, s); ctx.restore();
  ctx.fillStyle = shadeHex(skin, 0.12); ctx.strokeStyle = theme.wall; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(kneeB.x, kneeB.y, limb * 0.85, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); // the knee on the lock

  // Tapping: their free hand pats his leg three times.
  if (c.phase === "tap") {
    var pat = Math.abs(Math.sin(c.tapT / ARMBAR_TAP_TIME * Math.PI * 3));
    var p = onVic(-s * ar * 0.55, ar * 0.62);
    drawGloveAt(p.x, p.y - pat * ar * 0.22, ar * 0.22, vic.char);
  }

  // Tug-of-war bar: his colour is the choke, theirs the escape.
  var bw = 150, bh = 12;
  var bx = Math.min(W - bw - 6, Math.max(6, (sx + vx) / 2 - bw / 2));
  var by = Math.min(sy, vy) - Math.max(r, ar) - 64;
  if (by < 8) by = Math.max(sy, vy) + Math.max(r, ar) + 30;
  var split = bw * (c.bar + 1) / 2;
  ctx.fillStyle = self.char.color; ctx.fillRect(bx, by, split, bh);
  ctx.fillStyle = vic.char.color; ctx.fillRect(bx + split, by, bw - split, bh);
  ctx.lineWidth = 2.5; ctx.strokeStyle = theme.wall; ctx.strokeRect(bx, by, bw, bh);
  ctx.fillStyle = theme.ink;
  ctx.fillRect(bx + split - 2, by - 4, 4, bh + 8);
  ctx.restore();
}

// From drawArtBody (fighter-art.js), after the leg patch: a small yellow
// spider on the left leg of his shorts.
function drawSpiderLogo(c, r, look, sTop, band) {
  var x = -r * 0.48, y = sTop + band + r * 0.17, u = r * 0.075, col = look.spiderLogo || AS_YELLOW;
  c.save();
  c.translate(x, y);
  c.strokeStyle = col; c.fillStyle = col; c.lineWidth = Math.max(1, r * 0.022); c.lineCap = "round";
  [-1, 1].forEach(function (s) {
    for (var i = 0; i < 4; i++) { // four legs a side, bent at the knee, the front pair reaching up
      var ky = u * (-0.8 + i * 0.55);
      c.beginPath(); c.moveTo(0, u * (i - 1.5) * 0.25);
      c.quadraticCurveTo(s * u * 0.9, ky - u * 0.55, s * u * 1.5, ky + u * (i < 2 ? -0.1 : 0.45));
      c.stroke();
    }
  });
  c.beginPath(); c.ellipse(0, -u * 0.32, u * 0.36, u * 0.32, 0, 0, Math.PI * 2); c.fill(); // head
  c.beginPath(); c.ellipse(0, u * 0.42, u * 0.5, u * 0.62, 0, 0, Math.PI * 2); c.fill(); // body
  c.restore();
}

// From drawFighterArt (fighter-art.js), contained layout, with look.neoCoat:
// Spider Code's long black leather coat, open down the chest, its collar up
// round his neck, and small dark oval glasses with green code glinting in
// them. `c` is at the ball's centre.
function drawNeoKit(c, r, look, ink) {
  var lw = function (k) { return Math.max(1, r * k); };
  c.save();
  c.beginPath(); c.arc(0, 0, r, 0, Math.PI * 2); c.clip();
  [-1, 1].forEach(function (s) {
    // One side of the open coat: over the shoulder, down the side to the hem.
    c.beginPath();
    c.moveTo(s * r * 0.36, -r * 0.3);
    c.quadraticCurveTo(s * r * 0.72, -r * 0.44, s * r * 1.05, -r * 0.34);
    c.lineTo(s * r * 1.05, r * 1.05);
    c.lineTo(s * r * 0.42, r * 1.05);
    c.lineTo(s * r * 0.36, r * 0.28);
    c.lineTo(s * r * 0.25, -r * 0.02);
    c.closePath();
    var g = c.createLinearGradient(s * r * 0.3, -r * 0.4, s * r * 0.95, r * 0.9);
    g.addColorStop(0, "#2c2e33"); g.addColorStop(0.45, "#101114"); g.addColorStop(1, "#050506");
    c.fillStyle = g; c.fill();
    c.strokeStyle = ink; c.lineWidth = lw(0.035); c.stroke();
    // The lapel folded back.
    c.beginPath(); c.moveTo(s * r * 0.36, -r * 0.3); c.lineTo(s * r * 0.25, -r * 0.02); c.lineTo(s * r * 0.54, -r * 0.13); c.closePath();
    c.fillStyle = "#24262b"; c.fill(); c.stroke();
    // Light along the leather.
    c.strokeStyle = "rgba(255,255,255,0.2)"; c.lineWidth = lw(0.04); c.lineCap = "round";
    c.beginPath(); c.moveTo(s * r * 0.64, -r * 0.18); c.quadraticCurveTo(s * r * 0.72, r * 0.3, s * r * 0.64, r * 0.92); c.stroke();
  });
  // The collar turned up at both sides of his neck (clear of the goatee).
  c.fillStyle = "#17181b"; c.strokeStyle = ink; c.lineWidth = lw(0.03);
  [-1, 1].forEach(function (s) {
    c.beginPath();
    c.moveTo(s * r * 0.36, -r * 0.3);
    c.quadraticCurveTo(s * r * 0.4, -r * 0.44, s * r * 0.5, -r * 0.52);
    c.lineTo(s * r * 0.66, -r * 0.42);
    c.quadraticCurveTo(s * r * 0.62, -r * 0.36, s * r * 0.6, -r * 0.31);
    c.closePath(); c.fill(); c.stroke();
  });
  c.restore();
  // The glasses: two small dark ovals, a thin bridge, arms back to the ears.
  var y = -r * 0.6;
  c.strokeStyle = "#08090a"; c.lineWidth = lw(0.03);
  c.beginPath(); c.moveTo(-r * 0.68, y - r * 0.03); c.lineTo(-r * 0.36, y - r * 0.01); c.stroke();
  c.beginPath(); c.moveTo(r * 0.68, y - r * 0.03); c.lineTo(r * 0.36, y - r * 0.01); c.stroke();
  [-1, 1].forEach(function (s) {
    c.fillStyle = "#060708";
    c.beginPath(); c.ellipse(s * r * 0.2, y, r * 0.16, r * 0.075, 0, 0, Math.PI * 2); c.fill();
    c.strokeStyle = "#000000"; c.lineWidth = lw(0.022); c.stroke();
    c.fillStyle = "rgba(61,255,110,0.6)";
    c.beginPath(); c.ellipse(s * r * 0.2 - r * 0.05, y - r * 0.02, r * 0.05, r * 0.016, -0.25, 0, Math.PI * 2); c.fill();
  });
  c.strokeStyle = "#08090a"; c.lineWidth = lw(0.024);
  c.beginPath(); c.moveTo(-r * 0.04, y - r * 0.01); c.quadraticCurveTo(0, y - r * 0.05, r * 0.04, y - r * 0.01); c.stroke();
}

// ---------------------------------------------------------------- sound

function asAudio(fn) {
  try {
    var ac = getAudioCtx();
    if (!ac) return;
    if (ac.state === "suspended") ac.resume();
    fn(ac, ac.currentTime);
  } catch (e) { /* never let audio break the game */ }
}
// Leaning out of it: a quick swish of air past his face.
function playAsWeave() { asAudio(function (ac, t) { caneBurst(ac, t, 2600, 1.1, 0.16, 0.09); caneBurst(ac, t + 0.03, 1400, 0.9, 0.1, 0.1); }); }
// Hands down: a low, cocky two-note hum and the crowd.
function playAsTaunt() { asAudio(function (ac, t) { caneTone(ac, t, "triangle", 196, 220, 0.18, 0.22); caneTone(ac, t + 0.2, "triangle", 247, 233, 0.16, 0.3); }); }
// Chambering the knee: a short scrape and a rising whistle (the tell).
function playAsKickLoad() { asAudio(function (ac, t) { caneBurst(ac, t, 500, 0.8, 0.25, 0.18); caneTone(ac, t, "sine", 330, 660, 0.12, 0.4); }); }
// Hopping in, the leg snapping straight.
function playAsKickWhoosh() { asAudio(function (ac, t) { caneBurst(ac, t, 900, 0.7, 0.4, 0.14); caneBurst(ac, t + 0.03, 2200, 1.2, 0.22, 0.1); }); }
// The sole on the face: a flat slap over a deep thud (bigger for the knockout).
function playAsKickHit(dealt, ko) {
  playPunch(dealt);
  asAudio(function (ac, t) {
    var v = ko ? 1 : Math.min(1, 0.55 + (dealt || 0) / 60);
    caneTone(ac, t, "sine", ko ? 110 : 140, 45, 0.6 * v, ko ? 0.32 : 0.22);
    caneBurst(ac, t, 3000, 1.4, 0.55 * v, 0.05);
    caneBurst(ac, t + 0.004, 600, 0.9, 0.5 * v, 0.12);
  });
}
// The triangle locking up: legs slapping shut, then a tightening creak.
function playAsTriangle() {
  asAudio(function (ac, t) {
    caneBurst(ac, t, 1800, 1.3, 0.35, 0.05);
    caneBurst(ac, t + 0.07, 1500, 1.3, 0.3, 0.05);
    caneTone(ac, t + 0.1, "sawtooth", 90, 70, 0.08, 0.45);
  });
}
// Spider Code: a run of digital blips tumbling down, then a low hum.
function playAsNeoOn() {
  asAudio(function (ac, t) {
    [880, 660, 990, 520, 740, 440, 590].forEach(function (f, i) { caneTone(ac, t + i * 0.045, "square", f, f * 0.98, 0.05, 0.04); });
    caneTone(ac, t + 0.3, "sawtooth", 55, 49, 0.1, 1.0);
    caneTone(ac, t + 0.3, "sine", 110, 98, 0.16, 1.0);
  });
}
// The coat coming off: three quick blips going up.
function playAsNeoOff() { asAudio(function (ac, t) { [440, 660, 880].forEach(function (f, i) { caneTone(ac, t + i * 0.04, "square", f, f, 0.04, 0.035); }); }); }
// Bullet time: a deep, slowed-down whoosh.
function playAsBullet() { asAudio(function (ac, t) { caneTone(ac, t, "sine", 260, 48, 0.3, 0.75); caneBurst(ac, t, 320, 0.7, 0.22, 0.6); }); }
// Comeback mode coming on: two notes climbing.
function playAsComeback() { asAudio(function (ac, t) { caneTone(ac, t, "triangle", 220, 440, 0.16, 0.35); caneTone(ac, t + 0.12, "triangle", 330, 660, 0.14, 0.4); }); }

// ---------------------------------------------------------------- gallery

// Spider Code on the fighter card (gallery.js SPECIAL_INFO).
function andersonSpecialInfo(raw) {
  var sp = asNeoNums(raw), bt = sp.bullet;
  return (sp.atStart !== false ? "Goes off at the start of the fight" : "Goes off when the bar fills") + ": the cage goes dark, green code rains down it and he's in a long black coat and small dark glasses. For " +
    secs(sp.time) + " he leans out of " + sp.dodge + "% of strikes and " + sp.projDodge + "% of anything thrown, counters " + sp.counter + "% of them, and " + bt.chance +
    "% of his weaves (every one off something thrown) go into bullet time: everything slows right down while he bends back, ghosts of him trailing." +
    (sp.again !== false ? " When the bar fills again it comes back." : "");
}

// The fighter card's move list (gallery.js).
function andersonGalleryMoves(ch, add) {
  var a = ch.anderson, w = a.weave, cc = a.counter, hd = a.handsDown, fk = a.frontKick, tri = a.triangle, cb = a.comeback;
  if (w) add("🕷️", "Matrix weave", "Leans back out of " + w.chance + "% of strikes and " + w.projChance + "% of anything thrown, leaving a ghost of himself behind.");
  if (cc) add("🥊", "Counter", cc.chance + "% of the strikes he leans out of, he fires straight back for " + cc.damage + ".");
  if (hd) add("🙌", "Hands down", "After " + hd.after + " weaves in a row he drops his hands and taunts them for " + secs(hd.time) + ", leaning out of " + hd.dodge + "% of strikes while he does.");
  if (fk) add("🦶", "Front kick", "Every " + fk.every[0] + "-" + fk.every[1] + "s from " + fk.minGap + "-" + fk.maxGap + " away he chambers his knee (a yellow line shows where it's going) and hops in with a front kick to the face for " +
    fk.damage + ". After " + secs(fk.koAfter || 0) + " a clean one knocks them out " + fk.koBase + "% of the time at full health, up to " + (fk.koBase + fk.koLow) + "% the more hurt they are (the Belfort knockout).");
  if (tri) add("🔺", "Triangle", "Off his back: when they step into his guard and get caught (the armbar " + (tri.guardArmbar || 0) + "% of the time), when they pound on him (" + tri.fromGnp + "%), or when they slam him with a takedown (" + tri.fromTakedown +
    "%), he locks a triangle choke round their head and arm. They tap " + tri.tapBase + "% of the time at full health, up to " + (tri.tapBase + tri.tapLowHp) + "% when hurt, never in the first " + secs(tri.tapAfter || 0) + " (the Sonnen finish)." +
    (tri.strikes ? " While he holds it he hits them with up to " + tri.strikes.max + " elbows and short punches (" + tri.strikes.damage + " each, " + tri.strikes.critChance + "% crits), and the damage can make them tap after all." : ""));
  if (cb) add("🔥", "Comeback", "Losing late (" + cb.behind + " health behind, under " + Math.round(cb.lowHp * 100) + "% health or after " + secs(cb.after) + "): " + cb.crit + "% of his strikes crit for " + cb.critMult +
    "x, his triangle taps " + cb.triTap + "% more often and his front kick knocks out " + cb.kickKo + "% more often. \"I back. Trust me, I back.\"");
}
