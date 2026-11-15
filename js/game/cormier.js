// Daniel Cormier (Christian, 2026-11-13). "DC", Heavyweight on the Brawler
// base: heavy, quick hands (his punch and jab-cross-hook combinations), a
// body lock (his grab, `grapple.shotName`) and a suplex from behind
// (suplex.js), and he rolls faster than the other heavyweights (`speedMult`).
// A big round belly (look.belly, drawn by drawDcBelly below). Everything
// else is set in his character file under "cormier" (and his special);
// leave a block out and that part is switched off.
//
// Double leg   (cormier.doubleLeg) every `every` seconds (first after
//              `first`), once they're within `range`: the tell, he plants and
//              drops his level for `tell` seconds while a red lane comes up
//              toward them ("DOUBLE LEG!"); `readChance`% of the time they see
//              it and back off. Then he shoots down it at `shootSpeed`
//              (steering `turn`) for up to `shootTime`: miss and he stumbles
//              ("WHIFF!", open for `whiffStun`). Get there and it's their
//              takedown defence: a guillotine (bjj.js) or the cheater's fence
//              grab still work, and they sprawl on their own sprawl chance x
//              `sprawlScale` (at least `minStuff`%), scaled by weight
//              (grappleScale, weight.js), the normal sprawl and scramble
//              (grapple-duel.js). After a miss or a sprawl he goes again
//              sooner (`retry`).
// Super slam   when the shot gets through: he scoops them up over his head
//              ("PICKED UP!", a takedown), and a target comes up on the middle
//              of the mat ("TO THE MIDDLE!") with gold arrows from him to it.
//              He carries them there at up to `carrySpeed`, never in under
//              `minCarry` seconds, their legs kicking, while the crowd comes up
//              out of its seats (`crowd`). In the middle he presses them up
//              high (`hoist` seconds) and throws them down on the target:
//              "SUPER SLAM!", `damage` (can't be slipped or blocked), a
//              shockwave, cracks in the mat, dust, a big shake and the cameras
//              going off. They lie there `downTime` seconds while he flexes
//              over them. Runs on b.igbb (move "dcslam"), so nothing else
//              starts while it's on and he can't be touched; whoever he's
//              carrying is held (b.dcHeld).
// Body lock    (cormier.bodyLock) his grab: `through`% of them go straight
//              through, no weave, block or sprawl (cormierBodyLock, called
//              from attemptGrab in grapple-duel.js).
// Suplex       the shared back suplex (suplex.js, his `suplex` block): when he
//              throws one, the commentators get a "suplex" call.
// All About That Cake  his special (special.move "cake"), after his 2015
//              "All About That Cake" video: when the bar's full he stops
//              ("SNACK TIME!"), pulls out a plate and eats (`eatTime`, `bites`
//              bites), the next thing on the `menu` (a slice of chocolate cake
//              with a cherry on top, or a fried chicken drumstick). He's wide
//              open while he eats (they can hit him; he doesn't drop it). Then
//              his belly swells (`belly` bigger, `grow` wider) and for the
//              rest of the fight everything he lands does `damage` times as
//              much and he takes `take` times as much, stacking with every
//              serving, up to `max`. Grabbed or slammed mid-bite, he swallows
//              it in one gulp ("GULP!") and still gets the boost. Cake slices
//              by his health bar count the servings.
// vs Jon Jones (cormier.vsJon) his rival: he hits him `damage` times as hard
//              and shoots the double leg more often (`every`). Jon's own code
//              is untouched; this is all DC's side.
// Voice lines  (cormier.lines, timing in cormier.lineTiming), read with say()
//              only. Every time (they wait their turn rather than drop, up to
//              `wait` seconds): `start` (every fight), `food` (every time he
//              eats), `win` (`winVsJon` when it's Jon), and both `vsJon` lines
//              in every Jon fight, in order (`jonFirst`, then `jonGap`).
//              Sometimes (a chance, `gap` seconds apart, skipped if someone's
//              talking): `slam` on the carry (`slamChance`), `clinch` on the
//              body lock (`clinchChance`), `taunt` (`tauntEvery`, `tauntChance`).
// Commentary   commentaryCall (commentary-calls.js, guarded): "shot" when he
//              shoots the double leg, "takedown" when he picks them up,
//              "suplex" when he throws his suplex.
"use strict";

// Registered here rather than in special.js's table, so fighters built in
// parallel don't all edit the same line.
SPECIAL_MOVES.cake = "All About That Cake";

var DC_ID = "c-daniel-cormier", DC_JON = "c-jon-jones";
var DC_CONTACT = 10;     // gap at which the shot gets to their legs
var DC_LIFT = 0.45;      // scooping them up over his head
var DC_SLAM_T = 0.15;    // bringing them down
var DC_PLATE = 0.4;      // pulling out the plate
var DC_SWELL = 0.75;     // the belly swelling up after he eats
var DC_STEP = 0.2;       // footfalls while he carries them
var DC_CAKE = { sponge: "#5b301c", sponge2: "#7a4428", cream: "#f6e6c4", frost: "#fff2f5", frost2: "#f3c6d6", cherry: "#d0142c", plate: "#f4f4f2" };
var DC_GOLD = "#ffd24a";

var dcClock = 0;     // drawing clock (game time)
var dcCraters = [];  // dents in the mat from super slams
var dcStamp = null;  // the SUPER SLAM! lettering

function dcRand(r) { return r[0] + Math.random() * (r[1] - r[0]); }
function dcCfg(b) { return b && b.char && b.char.cormier; }
function dcIs(b, id) { return String(b && b.char && b.char.id || "").indexOf(id) === 0; }
function dcDist(a, b) { var dx = b.x - a.x, dy = b.y - a.y; return Math.sqrt(dx * dx + dy * dy) || 1; }
function dcGap(a, b) { return dcDist(a, b) - a.r - b.r; }
function dcVsJon(self, other) { return !!(other && dcIs(other, DC_JON) && dcCfg(self) && dcCfg(self).vsJon); }
function dcSlamOn(b) { return !!(b && b.igbb && b.igbb.move === "dcslam"); }
function dcFoodOn(b) { return !!(b && b.igbb && b.igbb.move === "dcfood"); }
function dcLerp(a, b, k) { return a + (b - a) * k; }
function dcWrap(a) { while (a > Math.PI) a -= Math.PI * 2; while (a < -Math.PI) a += Math.PI * 2; return a; }
// A shared commentator call (commentary-calls.js), if that file is in the game yet.
function dcCall(kind, self, other) { if (typeof commentaryCall === "function") commentaryCall(kind, self, other); }

// From startMatchSeeded.
function resetCormier() { dcClock = 0; dcCraters = []; dcStamp = null; }

// From makeBall (after applyWeight, so his size and speed are set).
function initCormier(b) {
  b.dc = null; b.dcHeld = null;
  var cfg = dcCfg(b);
  if (!cfg) return;
  b.char = JSON.parse(JSON.stringify(b.char)); // his own copy, so his belly can grow
  var dl = cfg.doubleLeg;
  b.dc = {
    t: 0, shot: null, shotT: dl ? dcRand(dl.first) : Infinity, servings: 0, eating: false,
    baseR: b.r, belly0: b.char.look && b.char.look.belly || 1, bellyShown: 0, opened: false, won: false,
    must: [], lineGap: 0, tauntT: dcRand((cfg.lineTiming && cfg.lineTiming.tauntEvery) || [12, 20]), jonLeft: null, jonT: 0, lastLock: null
  };
  b.dc.bellyShown = b.dc.belly0;
}

// ---------------------------------------------------------------- his lines
// Read through say() only (Joe's rule: clips go on the talk channel).

function dcLines(b) { return (dcCfg(b) && dcCfg(b).lines) || {}; }
function dcTiming(b) { return (dcCfg(b) && dcCfg(b).lineTiming) || {}; }
// Nobody on the talk channel, or they're nearly done (audio.js playTalk).
function dcTalkFree() {
  try {
    if (typeof audioCtx === "undefined" || !audioCtx || typeof talkEnd === "undefined") return true;
    return !talkQueued && audioCtx.currentTime >= talkEnd - 1;
  } catch (e) { return true; }
}
// A defining moment (the start, his special, a win, the Jon lines): the line
// always plays. It waits its turn (up to lineTiming.wait seconds) if someone
// else is talking, instead of being dropped.
function dcMustSay(b, key, text) {
  var m = b.dc;
  text = text || pickLine(b, dcLines(b)[key], "dc" + key);
  if (!m || !text) return;
  m.must.push({ text: text, t: dcTiming(b).wait || 8 });
}
// A frequent moment (a slam, the clinch, a taunt): only `chance`% of the
// time, never within lineTiming.gap seconds of his last line, and skipped if
// someone's talking or a must-play line is waiting.
function dcMaybeSay(b, key, chance) {
  var m = b.dc, L = dcLines(b)[key];
  if (!m || !L || !L.length || m.must.length || m.lineGap > 0 || !canSay(b) || !dcTalkFree()) return false;
  if (Math.random() * 100 >= chance) return false;
  say(b, pickLine(b, L, "dc" + key));
  m.lineGap = dcTiming(b).gap || 8;
  return true;
}
// Every frame: the waiting must-play lines, the taunts and the Jon lines.
function dcTickLines(b, o, dt) {
  var m = b.dc, tm = dcTiming(b), L = dcLines(b);
  if (m.lineGap > 0) m.lineGap -= dt;
  for (var i = m.must.length - 1; i >= 0; i--) { m.must[i].t -= dt; if (m.must[i].t <= 0) m.must.splice(i, 1); }
  if (m.must.length && b.alive && !speaking(b) && dcTalkFree()) {
    say(b, m.must.shift().text);
    m.lineGap = tm.gap || 8;
  }
  if (!started || over || !b.alive || !o || !o.alive) return;
  // Against Jon Jones: both his Jon lines, every fight, in order.
  if (m.jonLeft == null) { m.jonLeft = dcVsJon(b, o) && L.vsJon ? L.vsJon.slice() : []; m.jonT = dcRand(tm.jonFirst || [8, 14]); }
  if (m.jonLeft.length && (m.jonT -= dt) <= 0) { dcMustSay(b, "vsJon", m.jonLeft.shift()); m.jonT = dcRand(tm.jonGap || [12, 18]); }
  // A taunt now and then, when he isn't busy.
  if ((m.tauntT -= dt) <= 0) {
    if (b.igbb || m.shot || b.grapple || b.suplex) { m.tauntT = 1.5; return; }
    dcMaybeSay(b, "taunt", tm.tauntChance != null ? tm.tauntChance : 60);
    m.tauntT = dcRand(tm.tauntEvery || [12, 20]);
  }
  // The body lock (his grab): sometimes a line.
  if (b.grapple && b.grapple !== m.lastLock) { m.lastLock = b.grapple; dcMaybeSay(b, "clinch", tm.clinchChance != null ? tm.clinchChance : 40); }
  if (!b.grapple) m.lastLock = null;
}

// He's held by something else: grabbed, slammed, choked, knocked out, dizzy...
function dcHeldUp(b) {
  return !b.alive || b.grappled || b.grapple || b.slam || b.sprawl || b.sprawled || subLocked(b) || b.koOut || b.koRush ||
    b.shocked || b.dazed || b.dizzy || b.shelled || b.checkStun > 0 || b.koDuel || (b.igbb && !dcSlamOn(b) && !dcFoodOn(b));
}
// Someone he can shoot on right now.
function dcTakeable(o) {
  if (!o.alive || o.koOut || o.invincible || o.grappled || o.grapple || o.slam || o.sprawl || o.sprawled || subLocked(o) || o.igbb ||
      o.slamSafe > 0 || o.shelled || o.dazed || o.dcHeld) return false;
  if (specialBusy(o) || o.bearHeld || o.torHeld) return false;
  return inOrdinaryMovement(o) || !!o.dizzy;
}
// The shot's tell and the dash: the speed regulator leaves him alone (physics.js).
function cormierBusy(b) { return !!(b && b.dc && b.dc.shot); }
// His hands (and the hands of whoever he's carrying) are drawn by drawCormier (draw-attacks.js skips them).
function cormierHandsBusy(b) {
  if (!b || !b.alive) return false;
  if (b.dcHeld) return true;
  return !!(b.dc && (b.dc.shot || dcSlamOn(b) || dcFoodOn(b)));
}
// He can be hit while he eats (special.js specialGuarding).
function cormierOpen(b) { return dcFoodOn(b); }

// ---------------------------------------------------------------- hurt (match.js)

// The food makes everything he lands hit harder and everything that lands
// on him a little softer; and he hits Jon Jones harder.
function cormierDamageMult(b, source, attackerId) {
  if (source === "laser") return 1;
  var mult = 1, atk = attackerId != null ? balls[attackerId] : null;
  if (atk && atk !== b && atk.dc) {
    var fd = dcCfg(atk).food;
    if (fd && atk.dc.servings) mult *= Math.pow(fd.damage, atk.dc.servings);
    if (dcVsJon(atk, b)) mult *= dcCfg(atk).vsJon.damage;
  }
  if (b.dc) {
    var fd2 = dcCfg(b).food;
    if (fd2 && b.dc.servings) mult *= Math.pow(fd2.take, b.dc.servings);
  }
  return mult;
}

// ---------------------------------------------------------------- the double leg

// From the abilities loop, before the special. True while he's busy with it.
function updateCormier(self, other, dt) {
  var m = self.dc;
  if (!m) return false;
  if (dcSlamOn(self)) return updateSuperSlam(self, other, dt);
  if (self.igbb) return false; // eating (the special) or held in someone else's move
  var dl = dcCfg(self).doubleLeg;
  if (!dl) return false;
  if (m.shot) return dcUpdateShot(self, other, dt, m, dl);
  if (!started || over) return false;
  m.shotT -= dt;
  if (m.shotT > 0 || dcGap(self, other) > dl.range || swordDuelActive()) return false;
  if (!inOrdinaryMovement(self) || self.punch || self.kick || self.koPunch || self.swing || specialBusy(self) || !dcTakeable(other)) return false;
  clearActions(self);
  self.vx = 0; self.vy = 0;
  m.shot = { phase: "tell", t: 0, aim: Math.atan2(other.y - self.y, other.x - self.x), read: Math.random() * 100 < (dl.readChance || 0) };
  floater(self.x, self.y - self.r - 30, "DOUBLE LEG!", "crit");
  if (m.shot.read) floater(other.x, other.y - other.r - 30, "!", "crit");
  playDcTell();
  crowdReact(0.25);
  return true;
}

// Backing off from a shot they saw coming (only while rolling about on their own).
function dcBackOff(self, other) {
  if (!other.alive || !inOrdinaryMovement(other) || other.angry) return;
  var dx = other.x - self.x, dy = other.y - self.y, d = Math.sqrt(dx * dx + dy * dy) || 1;
  var sp = Math.max(Math.sqrt(other.vx * other.vx + other.vy * other.vy), 260);
  other.vx = dx / d * sp; other.vy = dy / d * sp;
}

function dcShotOver(self, m, dl, retry) {
  m.shot = null;
  m.shotT = dcRand(retry ? dl.retry : dcEvery(self));
  if (self.alive && inOrdinaryMovement(self)) setSpeed(self, (self.baseSpeed || SPEED) * 0.6);
}
function dcEvery(self) {
  var cfg = dcCfg(self), o = balls[1 - self.id];
  return dcVsJon(self, o) && cfg.vsJon.every ? cfg.vsJon.every : cfg.doubleLeg.every;
}

function dcUpdateShot(self, other, dt, m, dl) {
  var s = m.shot;
  if (dcHeldUp(self) || self.igbb) { m.shot = null; m.shotT = dcRand(dl.retry); return false; }
  s.t += dt;
  var dx = other.x - self.x, dy = other.y - self.y;
  if (s.phase === "tell") {
    self.vx = 0; self.vy = 0;
    s.aim = Math.atan2(dy, dx); // keeps them lined up until he goes
    if (s.read) dcBackOff(self, other);
    if (!other.alive || other.dcHeld) { dcShotOver(self, m, dl, true); return false; }
    if (s.t >= dl.tell) { s.phase = "shoot"; s.t = 0; playDcShoot(); dcCall("shot", self, other); }
    return true;
  }
  if (s.phase === "shoot") {
    var want = Math.atan2(dy, dx), turn = (dl.turn || 0) * dt;
    s.aim += Math.max(-turn, Math.min(turn, dcWrap(want - s.aim)));
    self.vx = Math.cos(s.aim) * dl.shootSpeed; self.vy = Math.sin(s.aim) * dl.shootSpeed;
    if (s.read) dcBackOff(self, other);
    if (!reduceMotion && Math.random() < 0.6) particles.push({ x: self.x - Math.cos(s.aim) * self.r * 0.6, y: self.y + self.r * 0.7, vx: -self.vx * 0.15, vy: -30 - Math.random() * 40, life: 0.3, max: 0.3, size: 3 + Math.random() * 3, color: "#d8cdb5" });
    if (other.alive && dcGap(self, other) <= DC_CONTACT) return dcContact(self, other, m, dl);
    if (s.t >= dl.shootTime) {
      s.phase = "whiff"; s.t = 0;
      floater(self.x, self.y - self.r - 30, "WHIFF!", "dodge");
      playDcStep(0.8);
    }
    return true;
  }
  // Whiffed: stumbles to a stop, open to anything.
  var damp = Math.exp(-8 * dt);
  self.vx *= damp; self.vy *= damp;
  if (s.t >= dl.whiffStun) { dcShotOver(self, m, dl, true); return false; }
  return true;
}

// The shot gets to their legs: their takedown defence, or he picks them up.
function dcContact(self, other, m, dl) {
  m.shot = null;
  self.vx = 0; self.vy = 0;
  m.shotT = dcRand(dl.retry);
  if (!dcTakeable(other)) return false;
  if (cheaterFenceGrab(self, other)) return true; // grabs the cage while the ref's asleep (cheater.js)
  if (tryGuillotine(self, other)) return true; // catches his head (bjj.js)
  var tc = other.char, base = tc.hasGrapple && tc.grapple ? tc.grapple.sprawlChance : (tc.tdd ? tc.tdd.sprawlChance : 0);
  var chance = Math.max(dl.minStuff || 0, (base || 0) * dl.sprawlScale) * grappleScale(other, self);
  if (Math.random() * 100 < chance) { beginSprawl(self, other); return true; } // SPRAWL (grapple-duel.js)
  startSuperSlam(self, other, dl);
  return true;
}

// ---------------------------------------------------------------- the body lock

// His grab (attemptGrab, grapple-duel.js): `bodyLock.through`% of his body
// locks go straight through, no weave, block or sprawl (like GSP's double
// leg). From behind it can still be his suplex.
function cormierBodyLock(attacker, target) {
  var bl = dcCfg(attacker) && dcCfg(attacker).bodyLock;
  if (!bl || !target.alive || target.cheater || target.fenceGrab) return false; // (a cheating Gane still grabs the cage, cheater.js)
  if (Math.random() * 100 >= bl.through) return false;
  if (trySuplex(attacker, target)) return true;
  crowdReact(0.2);
  beginGrapple(attacker, target);
  return true;
}

// ---------------------------------------------------------------- the super slam

function startSuperSlam(self, other, dl) {
  clearActions(self); clearActions(other);
  other.slam = null; other.sprawl = null; other.sprawled = false; other.dizzy = null; other.speedEase = null;
  other.shelled = true; other.vx = 0; other.vy = 0;
  self.vx = 0; self.vy = 0;
  var side = other.x >= self.x ? 1 : -1;
  other.dcHeld = { by: self.id, z: 0, rot: 0, side: side, phase: "lift", kick: Math.random() * 10 };
  self.igbb = { move: "dcslam", phase: "lift", t: 0, vic: other.id, side: side, stepT: 0, face: side };
  recordTakedown(self.id);
  floater(self.x, self.y - self.r - 30, "PICKED UP!", "crit");
  dcCall("takedown", self, other);
  playDcLift();
  crowdReact(0.35);
  if (!reduceMotion) shake = Math.max(shake, 8);
}

// How high over his head he holds them.
function dcLiftZ(self, vic) { return self.r * 1.2 + vic.r * 0.55; }

// Picked up: he sets off for the middle of the cage. He stops just short of
// it, facing it, so the slam puts them down right on the middle.
function dcStartCarry(self, vic, dl, m) {
  var cx = W / 2, cy = H / 2, dx = cx - self.x;
  if (Math.abs(dx) > 14) m.face = dx > 0 ? 1 : -1;
  var off = self.r + vic.r - 8;
  m.cx = cx; m.cy = cy;
  m.gx = cx - m.face * off; m.gy = cy - 6;
  m.fx = self.x; m.fy = self.y;
  var d = Math.sqrt((m.gx - m.fx) * (m.gx - m.fx) + (m.gy - m.fy) * (m.gy - m.fy));
  m.dur = Math.max(dl.minCarry || 0.9, d / (dl.carrySpeed || 320));
  m.phase = "carry"; m.t = 0;
  floater(cx, cy + 60, "TO THE MIDDLE!", "crit"); // on the target (drawDcTarget)
  crowdReact(0.3);
  var tm = dcTiming(self);
  dcMaybeSay(self, "slam", tm.slamChance != null ? tm.slamChance : 60); // "Take a seat right here, champ." on the way
}

function updateSuperSlam(self, other, dt) {
  var m = self.igbb, dl = dcCfg(self).doubleLeg, vic = balls[m.vic], h = vic.dcHeld;
  m.t += dt;
  self.vx = 0; self.vy = 0;
  if (!h && m.phase !== "down") { dcEndSlam(self, vic); return false; }
  if (m.phase !== "down" && (!vic.alive || over)) { dcEndSlam(self, vic); return false; }
  var top = dcLiftZ(self, vic), k;
  if (h) { h.phase = m.phase; vic.vx = 0; vic.vy = 0; }
  if (m.phase === "lift") {
    k = ease(m.t / DC_LIFT);
    h.z = top * k; h.rot = m.side * Math.PI / 2 * k;
    vic.x = self.x; vic.y = self.y - 1;
    if (m.t >= DC_LIFT) dcStartCarry(self, vic, dl, m);
    return true;
  }
  if (m.phase === "carry") {
    // A heavy walk to the middle with them up over his head, speeding up
    // and slowing down at the ends.
    k = Math.min(1, m.t / m.dur);
    var e = 0.5 - 0.5 * Math.cos(Math.PI * k);
    self.x = dcLerp(m.fx, m.gx, e); self.y = dcLerp(m.fy, m.gy, e);
    vic.x = self.x; vic.y = self.y - 1;
    h.z = top + Math.abs(Math.sin(dcClock * 13)) * 4;
    h.kick += dt;
    m.stepT -= dt;
    if (m.stepT <= 0) { m.stepT = DC_STEP; playDcStep(0.6); dcDust(self, 4); }
    crowdReact(dt * (dl.crowd || 0.5)); // the crowd coming up out of its seats
    if (k >= 1) {
      m.phase = "hoist"; m.t = 0;
      floater(self.x, self.y - self.r - top - vic.r - 24, "SUPER...", "crit");
      playDcHoist();
    }
    return true;
  }
  if (m.phase === "hoist") {
    k = ease(m.t / dl.hoist);
    h.z = top * (1 + 0.35 * k) + (Math.random() - 0.5) * 2 * k;
    vic.x = self.x; vic.y = self.y - 1;
    crowdReact(dt);
    if (m.t >= dl.hoist) {
      m.phase = "slam"; m.t = 0;
      m.sx = self.x; m.sy = self.y; m.z0 = h.z;
      var lx = m.cx != null ? m.cx : self.x + m.face * (self.r + vic.r - 8);
      var ly = m.cy != null ? m.cy : self.y + 6;
      m.lx = Math.max(vic.r, Math.min(W - vic.r, lx));
      m.ly = Math.max(vic.r, Math.min(H - vic.r, ly));
      playWhoosh();
    }
    return true;
  }
  if (m.phase === "slam") {
    k = Math.min(1, m.t / DC_SLAM_T);
    var e2 = k * k;
    h.z = m.z0 * (1 - e2);
    h.rot = m.side * Math.PI / 2 * (1 + 0.15 * e2);
    vic.x = dcLerp(m.sx, m.lx, e2); vic.y = dcLerp(m.sy - 1, m.ly, e2);
    if (k >= 1) dcSlamLands(self, vic, dl, m);
    return true;
  }
  // Down: they lie there, he flexes over them.
  if (h) { h.z = 0; vic.x = m.lx; vic.y = m.ly; }
  if (m.t >= dl.downTime || (h && !vic.alive)) { dcEndSlam(self, vic); return false; }
  return true;
}

function dcSlamLands(self, vic, dl, m) {
  m.phase = "down"; m.t = 0;
  vic.x = m.lx; vic.y = m.ly;
  var dealt = hurt(vic, dl.damage, "igbb", self.id); // can't be slipped or blocked
  dcCraters.push({ x: m.lx, y: m.ly + vic.r * 0.4, R: vic.r * 2.6, t: 0, seed: Math.random() * 1000 });
  dcStamp = { x: m.lx, y: m.ly - vic.r - 40, t: 0 };
  impacts.push({ x: m.lx, y: m.ly + vic.r * 0.5, nx: 0, ny: -1, life: 0.6, max: 0.6, color: "#ffffff" });
  impacts.push({ x: m.lx, y: m.ly + vic.r * 0.5, nx: 0, ny: -1, life: 0.8, max: 0.8, color: self.char.color });
  igbbSparks(m.lx, m.ly + vic.r * 0.5, 0, -1, self.char.color, 24, 560);
  dcDust(vic, 26);
  vic.squash = { t: 0.32, max: 0.32, nx: 0, ny: -1 };
  vic.flash = 0.2;
  if (!reduceMotion) shake = Math.max(shake, 34);
  hitStop = Math.max(hitStop, 0.2);
  playDcSuperSlam();
  crowdRoar();
  if (stadiumOn() && typeof cameraFlash === "function") { cameraFlash(); screenFlash = 0.35; } // the cameras going off (dobronx.js)
  if (!vic.alive) { vic.shelled = false; vic.dcHeld = null; }
  checkEnd();
  return dealt;
}

function dcEndSlam(self, vic) {
  if (self.igbb && self.igbb.move === "dcslam") self.igbb = null;
  if (vic && vic.dcHeld && vic.dcHeld.by === self.id) {
    vic.dcHeld = null;
    vic.shelled = false;
    if (vic.alive) {
      var a = Math.atan2(vic.y - self.y, vic.x - self.x) + (Math.random() - 0.5);
      vic.vx = Math.cos(a) * SPEED * 0.5; vic.vy = Math.sin(a) * SPEED * 0.5;
    }
  }
  if (self.dc) self.dc.shotT = dcRand(dcEvery(self));
  if (self.alive) {
    var b2 = Math.random() * Math.PI * 2;
    self.vx = Math.cos(b2) * (self.baseSpeed || SPEED); self.vy = Math.sin(b2) * (self.baseSpeed || SPEED);
  }
}

function dcDust(b, n) {
  if (reduceMotion) return;
  for (var i = 0; i < n; i++) {
    var a = Math.random() * Math.PI * 2, s = 60 + Math.random() * (n > 10 ? 300 : 90);
    particles.push({ x: b.x + Math.cos(a) * b.r * 0.6, y: b.y + b.r * 0.85, vx: Math.cos(a) * s, vy: Math.sin(a) * s * 0.4 - 20, life: 0.35 + Math.random() * 0.3, max: 0.65, size: 3 + Math.random() * 4, color: i % 3 ? "#d8cdb5" : "#ffffff" });
  }
}

// ---------------------------------------------------------------- All About That Cake

// From updateSpecial (special.js) for special.move "cake".
function updateCake(self, other, dt) {
  var cfg = dcCfg(self), fd = cfg && cfg.food, m = self.dc;
  if (!fd || !m) return false;
  if (self.igbb && !dcFoodOn(self)) return false;
  if (!self.igbb) {
    if (m.servings >= fd.max) { self.specialT = 0; return false; } // full up
    if (self.specialT < self.char.special.chargeTime || m.shot || !canStartIgbb(self, other) || swordDuelActive()) return false;
    clearActions(self);
    self.vx = 0; self.vy = 0;
    self.igbb = { move: "dcfood", phase: "plate", t: 0, kind: fd.menu[m.servings % fd.menu.length], bites: 0, side: other.x >= self.x ? 1 : -1, bite: 0 };
    m.eating = true;
    floater(self.x, self.y - self.r - 30, "SNACK TIME!", "crit");
    dcMustSay(self, "food"); // every time he eats
    playDcPlate();
    crowdReact(0.2);
  }
  var e = self.igbb;
  e.t += dt;
  self.vx = 0; self.vy = 0;
  e.bite = Math.max(0, e.bite - dt);
  if (e.phase === "plate") {
    if (e.t >= DC_PLATE) { e.phase = "eat"; e.t = 0; }
    return true;
  }
  if (e.phase === "eat") {
    if (e.bites < fd.bites && e.t >= (e.bites + 0.6) / fd.bites * fd.eatTime) {
      e.bites++; e.bite = 0.22;
      playDcChomp();
      dcCrumbs(self, e);
    }
    if (e.t >= fd.eatTime) { e.phase = "swell"; e.t = 0; dcServe(self, e.kind, false); }
    return true;
  }
  if (e.t >= DC_SWELL) { self.igbb = null; self.specialT = 0; m.eating = false; return false; }
  return true;
}

// A serving goes down: stronger for the rest of the fight, and a bigger belly.
function dcServe(self, kind, gulp) {
  var m = self.dc, fd = dcCfg(self).food;
  m.servings++;
  m.eating = false;
  self.specialT = 0;
  floater(self.x, self.y - self.r - 30, gulp ? "GULP!" : kind === "chicken" ? "FRIED CHICKEN!" : "ALL ABOUT THAT CAKE!", "crit");
  floater(self.x, self.y - self.r - 56, "STRONGER x" + (Math.round(Math.pow(fd.damage, m.servings) * 100) / 100), "note");
  playDcPowerUp();
  crowdReact(0.45);
}

function dcCrumbs(self, e) {
  if (reduceMotion) return;
  var mx = self.x + e.side * self.r * 0.12, my = self.y - self.r * 0.6;
  var cols = e.kind === "chicken" ? ["#c8742f", "#e9b06a", "#8a4a1c"] : [DC_CAKE.sponge, DC_CAKE.frost, DC_CAKE.cream, DC_CAKE.sponge2];
  for (var i = 0; i < 10; i++) {
    var a = -Math.PI / 2 + (Math.random() - 0.5) * 2.6, s = 60 + Math.random() * 140;
    particles.push({ x: mx, y: my, vx: Math.cos(a) * s + e.side * 40, vy: Math.sin(a) * s * 0.6 + 40, life: 0.4 + Math.random() * 0.3, max: 0.7, size: 2 + Math.random() * 2.5, color: cols[i % cols.length] });
  }
}

// ---------------------------------------------------------------- every frame (update.js)

function tickCormier(dt) {
  if (!balls) return;
  dcClock += dt;
  dcCraters = dcCraters.filter(function (c) { c.t += dt; return c.t < 2.6; });
  if (dcStamp) { dcStamp.t += dt; if (dcStamp.t > 1.3) dcStamp = null; }
  balls.forEach(function (b) {
    // Held by a DC who's let go (or isn't carrying any more): let them down.
    if (b.dcHeld) {
      var holder = balls[b.dcHeld.by];
      if (!holder || !dcSlamOn(holder) || holder.igbb.vic !== b.id) { b.dcHeld = null; b.shelled = false; }
    }
    var m = b.dc;
    if (!m) return;
    var cfg = dcCfg(b), fd = cfg.food;
    // Grabbed or slammed mid-bite: down it goes in one gulp.
    if (m.eating && !dcFoodOn(b)) {
      if (b.alive) dcServe(b, "cake", true);
      else m.eating = false;
    }
    if (m.shot && (dcHeldUp(b) || b.igbb)) { m.shot = null; m.shotT = dcRand(cfg.doubleLeg.retry); }
    // His back suplex (suplex.js): the commentators call it, once per suplex.
    if (b.suplex && !b.suplex.dcCalled) { b.suplex.dcCalled = true; dcCall("suplex", b, balls[b.suplex.vicId]); }
    // The belly (and his size) catching up with what he's eaten.
    var want = m.belly0 + (fd ? fd.belly * m.servings : 0);
    if (Math.abs(m.bellyShown - want) > 0.001) {
      m.bellyShown += (want - m.bellyShown) * Math.min(1, dt * 4.5);
      if (Math.abs(m.bellyShown - want) < 0.002) m.bellyShown = want;
      if (b.char.look) b.char.look.belly = m.bellyShown;
      var grown = fd ? (m.bellyShown - m.belly0) / Math.max(0.001, fd.belly) : 0;
      b.r = m.baseR * (1 + (fd ? fd.grow : 0) * grown);
    }
    if (!started) return;
    m.t += dt;
    var o = balls[1 - b.id];
    if (!m.opened && m.t > 0.6) {
      m.opened = true;
      if (dcVsJon(b, o)) floater(b.x, b.y - b.r - 30, "THE RIVALRY", "note");
      dcMustSay(b, "start"); // every fight
    }
    if (over && b.alive && !m.won && o && !o.alive) { m.won = true; m.wonT = 0.8; }
    if (m.wonT > 0) { m.wonT -= dt; if (m.wonT <= 0) dcMustSay(b, dcVsJon(b, o) && dcLines(b).winVsJon ? "winVsJon" : "win"); }
    dcTickLines(b, o, dt);
  });
}

// ---------------------------------------------------------------- drawing

// Pose (draw.js): crouching for the shot, leaning into it, bouncing with
// them overhead, chewing; and whoever he's got, lying across over his head.
function applyCormierPose(b) {
  var h = b.dcHeld;
  if (h) {
    ctx.translate(b.x, b.y);
    ctx.rotate(h.rot);
    if (h.phase === "down") ctx.scale(0.8, 1.1); // (rotated: flattened onto the mat)
    ctx.translate(-b.x, -b.y);
    return;
  }
  var m = b.dc;
  if (!m || !b.alive) return;
  var k, ax = b.x, ay = b.y + b.r;
  if (m.shot) {
    var s = m.shot, lean = Math.cos(s.aim) * 0.18;
    k = s.phase === "tell" ? ease(s.t / 0.18) : s.phase === "shoot" ? 1 : Math.max(0, 1 - s.t / 0.3);
    ctx.translate(ax, ay); ctx.rotate(lean * k); ctx.scale(1 + 0.12 * k, 1 - 0.18 * k); ctx.translate(-ax, -ay);
    return;
  }
  var g = b.igbb;
  if (dcSlamOn(b)) {
    if (g.phase === "carry") {
      ctx.translate(ax, ay); ctx.rotate(g.face * 0.1); ctx.translate(-ax, -ay);
    } else if (g.phase === "hoist") {
      k = ease(g.t / 0.2);
      ctx.translate(ax, ay); ctx.scale(1 - 0.05 * k, 1 + 0.07 * k); ctx.translate(-ax, -ay);
    } else if (g.phase === "lift") {
      k = Math.sin(Math.PI * Math.min(1, g.t / DC_LIFT));
      ctx.translate(ax, ay); ctx.scale(1 + 0.08 * k, 1 - 0.1 * k); ctx.translate(-ax, -ay);
    }
    return;
  }
  if (dcFoodOn(b)) {
    var chew = g.phase === "eat" ? Math.sin(dcClock * 22) * 0.025 : 0;
    var swell = g.phase === "swell" ? Math.sin(Math.PI * Math.min(1, g.t / DC_SWELL)) * 0.06 : 0;
    ctx.translate(ax, ay); ctx.scale(1 + chew + swell, 1 - chew + swell * 0.5); ctx.translate(-ax, -ay);
  }
}

// Offset (draw.js): whoever he's carrying is drawn up over his head; he
// bounces as he runs.
function cormierOffset(b) {
  var h = b.dcHeld;
  if (h) return { x: 0, y: -(h.z || 0) };
  if (dcSlamOn(b) && b.igbb.phase === "carry") return { x: 0, y: -Math.abs(Math.sin(dcClock * 13)) * 4 };
  return { x: 0, y: 0 };
}

// An arm from the shoulder to the glove.
function dcArm(ch, sx, sy, hx, hy, w, side) {
  strokeLimb(w, armColor(ch, side), function () { ctx.moveTo(sx, sy); ctx.lineTo(hx, hy); });
  drawGloveAt(hx, hy, w * 1.55, ch, Math.atan2(hy - sy, hx - sx));
}

// Per fighter (draw.js), at his drawn spot: his arms through the shot, the
// carry, the slam and the meal; the food; the cake pips by his health bar;
// and whoever he's carrying, kicking.
function drawCormier(b, other) {
  if (b.dcHeld && b.alive) { drawDcHeldLimbs(b); return; }
  var m = b.dc;
  if (!m || !b.alive) return;
  var r = b.r, ch = b.char, w = r * 0.2, g = b.igbb;
  ctx.save();
  if (m.shot) {
    // Hands low and reaching for the legs.
    var s = m.shot, ux = Math.cos(s.aim), uy = Math.sin(s.aim), px = -uy, py = ux;
    var reach = s.phase === "shoot" ? r * 1.15 : r * 0.75, low = s.phase === "shoot" ? r * 0.25 : r * 0.45;
    [-1, 1].forEach(function (sd) {
      var sx = b.x + px * sd * r * 0.55, sy = b.y - r * 0.05;
      var hx = b.x + ux * reach + px * sd * r * (s.phase === "shoot" ? 0.7 : 0.45), hy = b.y + uy * reach + low;
      dcArm(ch, sx, sy, hx, hy, w, sd);
    });
  } else if (dcSlamOn(b)) {
    drawDcCarryArms(b, g);
  } else if (dcFoodOn(b)) {
    drawDcMeal(b, g);
  }
  ctx.restore();
  drawDcPips(b);
}

function drawDcCarryArms(b, g) {
  var r = b.r, ch = b.char, w = r * 0.2, vic = balls[g.vic], h = vic && vic.dcHeld;
  if (g.phase === "down" || !h) {
    // Double biceps over them, pumping.
    var pump = Math.abs(Math.sin(dcClock * 10)) * r * 0.25;
    [-1, 1].forEach(function (sd) {
      var sx = b.x + sd * r * 0.62, sy = b.y - r * 0.4;
      var ex = b.x + sd * r * 1.15, ey = b.y - r * 0.35;
      strokeLimb(w, armColor(ch, sd), function () { ctx.moveTo(sx, sy); ctx.lineTo(ex, ey); ctx.lineTo(ex - sd * r * 0.05, ey - r * 0.55 - pump); });
      drawGloveAt(ex - sd * r * 0.05, ey - r * 0.55 - pump, w * 1.55, ch, -Math.PI / 2);
    });
    return;
  }
  // Both hands up under them, holding them overhead.
  var vx = vic.x + (cormierOffset(vic).x), vy = vic.y - h.z, vr = vic.r;
  [-1, 1].forEach(function (sd) {
    var sx = b.x + sd * r * 0.6, sy = b.y - r * 0.42;
    var hx = vx + sd * vr * 0.6, hy = vy + vr * 0.45;
    dcArm(ch, sx, sy, hx, hy, w, sd);
  });
}

// Whoever he's carrying: legs kicking off one end, arms waving off the other.
function drawDcHeldLimbs(v) {
  var h = v.dcHeld, r = v.r, ch = v.char;
  var hdx = Math.sin(h.rot), hdy = -Math.cos(h.rot), pvx = Math.cos(h.rot), pvy = Math.sin(h.rot);
  var cx = v.x, cy = v.y; // (already shifted up by cormierOffset)
  var still = h.phase === "down", t = dcClock * 14 + h.kick;
  var skin = ch.look ? ch.look.skin : ch.color, shorts = ch.look ? ch.look.shorts : ch.color, w = r * 0.19;
  ctx.save();
  [-1, 1].forEach(function (sd, i) {
    var kick = still ? 0.3 : Math.sin(t + i * 2.2);
    var hipx = cx - hdx * r * 0.6 + pvx * sd * r * 0.34, hipy = cy - hdy * r * 0.6 + pvy * sd * r * 0.34;
    var knx = hipx - hdx * r * 0.5 + pvx * sd * r * (0.22 + 0.22 * kick), kny = hipy - hdy * r * 0.5 + pvy * sd * r * (0.22 + 0.22 * kick);
    var ftx = hipx - hdx * r * 0.95 + pvx * sd * r * (0.12 + 0.42 * kick), fty = hipy - hdy * r * 0.95 + pvy * sd * r * (0.12 + 0.42 * kick);
    strokeLimb(w * 1.5, skin, function () { ctx.moveTo(hipx, hipy); ctx.quadraticCurveTo(knx, kny, ftx, fty); });
    strokeLimb(w * 1.75, shorts, function () { ctx.moveTo(hipx, hipy); ctx.lineTo(hipx + (knx - hipx) * 0.35, hipy + (kny - hipy) * 0.35); });
    // A bare foot, turned out off the end of the shin.
    var fa = Math.atan2(fty - kny, ftx - knx) + sd * 1.2;
    strokeLimb(w * 1.1, skin, function () { ctx.moveTo(ftx, fty); ctx.lineTo(ftx + Math.cos(fa) * r * 0.24, fty + Math.sin(fa) * r * 0.24); });
    var wave = still ? 0 : Math.sin(t * 1.3 + i * 1.7);
    var shx = cx + hdx * r * 0.25 + pvx * sd * r * 0.72, shy = cy + hdy * r * 0.25 + pvy * sd * r * 0.72;
    var hx = shx + pvx * sd * r * 0.4 + hdx * r * (0.15 + 0.3 * wave), hy = shy + pvy * sd * r * 0.4 + hdy * r * (0.15 + 0.3 * wave);
    strokeLimb(w, armColor(ch, sd), function () { ctx.moveTo(shx, shy); ctx.lineTo(hx, hy); });
    drawGloveAt(hx, hy, w * 1.5, ch, Math.atan2(hy - shy, hx - shx));
  });
  ctx.restore();
}

// Eating: the food in his lead hand coming up to his mouth on every bite,
// the other glove patting his belly.
function drawDcMeal(b, e) {
  var r = b.r, ch = b.char, w = r * 0.2, sd = e.side, fd = dcCfg(b).food;
  var up = e.phase === "plate" ? ease(e.t / DC_PLATE) : 1;
  var bite = e.bite > 0 ? Math.sin(Math.PI * (1 - e.bite / 0.22)) : 0;
  var left = e.phase === "swell" ? 0 : 1 - e.bites / (fd.bites || 3);
  // Food hand: out in front at chest height, up to the mouth on a bite.
  var hx = b.x + sd * r * dcLerp(0.95, 0.42, bite), hy = b.y + dcLerp(r * 0.35, -r * 0.05, up) - bite * r * 0.42;
  var sx = b.x + sd * r * 0.6, sy = b.y - r * 0.38;
  if (e.phase !== "swell") {
    strokeLimb(w, armColor(ch, sd), function () { ctx.moveTo(sx, sy); ctx.lineTo(hx, hy); });
    if (e.kind === "chicken") { // held by the bone, the meat end toward his mouth
      drawDcDrumstick(hx, hy, r * 0.42, sd, left);
      drawGloveAt(hx, hy, w * 1.5, ch, Math.atan2(hy - sy, hx - sx));
    } else {
      drawGloveAt(hx, hy, w * 1.5, ch, Math.atan2(hy - sy, hx - sx));
      drawDcCakeSlice(hx + sd * r * 0.08, hy - r * 0.26, r * 0.42, sd, left);
    }
  } else {
    // Done: both gloves rubbing the belly, a gold glow round him.
    var k = Math.min(1, e.t / DC_SWELL);
    ctx.save();
    ctx.globalAlpha = 0.65 * (1 - k);
    ctx.strokeStyle = DC_GOLD; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.arc(b.x, b.y, r * (1.1 + 0.6 * k), 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
  }
  // The other glove on the belly.
  var rub = Math.sin(dcClock * (e.phase === "swell" ? 16 : 6)) * r * 0.12;
  var bx = b.x - sd * r * 0.25 + rub, by = b.y + r * 0.3;
  strokeLimb(w, armColor(ch, -sd), function () { ctx.moveTo(b.x - sd * r * 0.6, b.y - r * 0.38); ctx.lineTo(bx, by); });
  drawGloveAt(bx, by, w * 1.5, ch, Math.atan2(by - b.y, bx - b.x));
  if (e.phase === "swell") {
    var bx2 = b.x + sd * r * 0.3 - rub, by2 = b.y + r * 0.28;
    strokeLimb(w, armColor(ch, sd), function () { ctx.moveTo(b.x + sd * r * 0.6, b.y - r * 0.38); ctx.lineTo(bx2, by2); });
    drawGloveAt(bx2, by2, w * 1.5, ch, Math.atan2(by2 - b.y, bx2 - b.x));
  }
}

// A slice of chocolate cake on a little plate: two layers of sponge, a cream
// filling, pink and white frosting dripping off the top and a cherry. `left`
// is how much is left (it's eaten from the point).
function drawDcCakeSlice(x, y, s, side, left) {
  var L = s * 1.8 * (0.3 + 0.7 * left), H = s * 0.95;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(-side, 1); // the point toward his mouth
  ctx.lineJoin = "round"; ctx.lineCap = "round";
  // The plate.
  ctx.fillStyle = DC_CAKE.plate; ctx.strokeStyle = theme.wall; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.ellipse(0, s * 0.12, s * 1.3, s * 0.3, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = "rgba(0,0,0,0.12)";
  ctx.beginPath(); ctx.ellipse(0, s * 0.1, s * 0.9, s * 0.16, 0, 0, Math.PI * 2); ctx.fill();
  var x0 = s * 0.85 - L, x1 = s * 0.85, yb = s * 0.05, yt = yb - H;
  // Sponge with the cream filling.
  ctx.fillStyle = DC_CAKE.sponge;
  ctx.fillRect(x0, yt + H * 0.18, L, H * 0.82);
  ctx.fillStyle = DC_CAKE.sponge2;
  ctx.fillRect(x0, yt + H * 0.62, L, H * 0.2);
  ctx.fillStyle = DC_CAKE.cream;
  ctx.fillRect(x0, yt + H * 0.5, L, H * 0.13);
  // Frosting on top and down the back, with drips.
  ctx.fillStyle = DC_CAKE.frost;
  ctx.beginPath();
  ctx.moveTo(x0, yt + H * 0.22);
  ctx.quadraticCurveTo(x0, yt, x0 + s * 0.1, yt);
  ctx.lineTo(x1 - s * 0.05, yt); ctx.quadraticCurveTo(x1 + s * 0.06, yt, x1 + s * 0.06, yt + H * 0.12);
  ctx.lineTo(x1 + s * 0.06, yb - H * 0.05); ctx.lineTo(x1 - s * 0.08, yb - H * 0.05); ctx.lineTo(x1 - s * 0.08, yt + H * 0.22);
  for (var d = 0; d < 4; d++) {
    var dx0 = x1 - s * 0.08 - (d + 0.5) * (L - s * 0.1) / 4;
    ctx.lineTo(dx0 + s * 0.08, yt + H * 0.22);
    ctx.quadraticCurveTo(dx0, yt + H * (0.34 + (d % 2) * 0.1), dx0 - s * 0.08, yt + H * 0.22);
  }
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = DC_CAKE.frost2;
  ctx.fillRect(x0 + s * 0.06, yt + H * 0.04, L - s * 0.12, H * 0.07);
  // Bitten end: a scalloped edge.
  if (left < 0.99) {
    ctx.fillStyle = shadeHex(DC_CAKE.sponge, -0.25);
    for (var bt = 0; bt < 3; bt++) { ctx.beginPath(); ctx.arc(x0, yt + H * (0.3 + bt * 0.25), s * 0.11, 0, Math.PI * 2); ctx.fill(); }
  }
  ctx.strokeStyle = theme.wall; ctx.lineWidth = 2;
  ctx.strokeRect(x0, yt, L, H);
  // The cherry.
  if (left > 0.4) {
    ctx.strokeStyle = "#2e6b2a"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(x1 - s * 0.35, yt - s * 0.16); ctx.quadraticCurveTo(x1 - s * 0.3, yt - s * 0.45, x1 - s * 0.12, yt - s * 0.5); ctx.stroke();
    ctx.fillStyle = DC_CAKE.cherry; ctx.strokeStyle = theme.wall; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(x1 - s * 0.35, yt - s * 0.12, s * 0.17, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "rgba(255,255,255,0.6)";
    ctx.beginPath(); ctx.arc(x1 - s * 0.4, yt - s * 0.17, s * 0.05, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

// A fried chicken drumstick held by the bone at (x, y): the bone out past
// his glove, the crispy meat up and in toward his mouth.
function drawDcDrumstick(x, y, s, side, left) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(side, 1);
  ctx.rotate(0.6);
  ctx.translate(-s * 1.05, 0); // the end of the bone in his glove
  var mr = s * (0.5 + 0.35 * left);
  // The bone.
  ctx.fillStyle = "#f3eee2"; ctx.strokeStyle = theme.wall; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.rect(s * 0.2, -s * 0.12, s * 0.95, s * 0.24); ctx.fill(); ctx.stroke();
  [-1, 1].forEach(function (k) { ctx.beginPath(); ctx.arc(s * 1.2, k * s * 0.14, s * 0.15, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); });
  // The meat, crispy.
  var g = ctx.createRadialGradient(-s * 0.15, -mr * 0.3, mr * 0.1, 0, 0, mr * 1.2);
  g.addColorStop(0, "#e9a85a"); g.addColorStop(0.6, "#c8742f"); g.addColorStop(1, "#8a4a1c");
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.ellipse(-s * 0.1, 0, mr * 1.15, mr * 0.85, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = theme.wall; ctx.stroke();
  ctx.fillStyle = "rgba(90,40,10,0.55)";
  for (var i = 0; i < 9; i++) {
    var a = i * 2.4, rr = mr * (0.25 + (i % 3) * 0.22);
    ctx.beginPath(); ctx.arc(-s * 0.1 + Math.cos(a) * rr, Math.sin(a) * rr * 0.7, s * 0.05, 0, Math.PI * 2); ctx.fill();
  }
  if (left < 0.99) { // bite marks out of the end
    ctx.fillStyle = "#f2d9b8";
    for (var bt = 0; bt < 2; bt++) { ctx.beginPath(); ctx.arc(-s * 0.1 - mr * 1.05, (bt - 0.5) * mr * 0.6, mr * 0.28, 0, Math.PI * 2); ctx.fill(); }
  }
  ctx.restore();
}

// Little cake slices by his health bar, one for every serving.
function drawDcPips(b) {
  var m = b.dc;
  if (!m || !m.servings) return;
  var by = b.y - b.r - 18;
  if (by < 4) by = b.y + b.r + 10;
  for (var i = 0; i < m.servings; i++) {
    var x = b.x + 40 + i * 13, y = by + 4;
    ctx.save();
    ctx.fillStyle = DC_CAKE.sponge; ctx.strokeStyle = theme.wall; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(x - 5, y + 4); ctx.lineTo(x + 5, y + 4); ctx.lineTo(x + 5, y - 3); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = DC_CAKE.frost;
    ctx.beginPath(); ctx.moveTo(x - 5, y + 4); ctx.lineTo(x + 5, y - 3); ctx.lineTo(x + 5, y - 5); ctx.lineTo(x - 6, y + 3); ctx.closePath(); ctx.fill();
    ctx.fillStyle = DC_CAKE.cherry;
    ctx.beginPath(); ctx.arc(x + 3, y - 6, 2, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
}

// Under the fighters (draw.js): the shot's red lane, and the dents super slams left in the mat.
function drawCormierUnder() {
  dcCraters.forEach(function (c) {
    var fade = Math.min(1, (2.6 - c.t) / 0.8);
    ctx.save();
    ctx.globalAlpha = fade;
    ctx.fillStyle = "rgba(60,40,25,0.28)";
    ctx.beginPath(); ctx.ellipse(c.x, c.y, c.R * 0.55, c.R * 0.24, 0, 0, Math.PI * 2); ctx.fill();
    // Cracks running out from where they landed.
    ctx.strokeStyle = "rgba(35,25,18,0.75)"; ctx.lineWidth = 2.2; ctx.lineCap = "round";
    var rnd = artRand(Math.floor(c.seed));
    for (var i = 0; i < 9; i++) {
      var a = i / 9 * Math.PI * 2 + rnd() * 0.5, len = c.R * (0.45 + rnd() * 0.45), x = c.x, y = c.y;
      ctx.beginPath(); ctx.moveTo(x, y);
      for (var j = 1; j <= 3; j++) {
        var aa = a + (rnd() - 0.5) * 0.6;
        x = c.x + Math.cos(aa) * len * j / 3; y = c.y + Math.sin(aa) * len * j / 3 * 0.45;
        ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    // Shockwave rings going out.
    [[0, "#ffffff", 14], [0.08, DC_GOLD, 9], [0.16, "#e0221b", 6]].forEach(function (wv) {
      var wt = c.t - wv[0];
      if (wt < 0 || wt > 0.55) return;
      var k = wt / 0.55;
      ctx.globalAlpha = (1 - k) * fade; ctx.strokeStyle = wv[1]; ctx.lineWidth = wv[2] * (1 - k) + 2;
      ctx.beginPath(); ctx.ellipse(c.x, c.y, c.R * (0.3 + 1.5 * k), c.R * (0.3 + 1.5 * k) * 0.55, 0, 0, Math.PI * 2); ctx.stroke();
    });
    ctx.restore();
  });
  balls.forEach(function (b) { if (dcSlamOn(b)) drawDcTarget(b, b.igbb); });
  balls.forEach(function (b) {
    var m = b.dc, s = m && m.shot;
    if (!b.alive || !s || s.phase !== "tell") return;
    // The shot's lane: a red chevron path where he's about to go.
    var dl = dcCfg(b).doubleLeg, len = dl.shootSpeed * dl.shootTime * 0.75 + b.r;
    var on = Math.min(1, s.t / 0.15), flash = s.t > dl.tell - 0.2 ? 0.55 + 0.45 * Math.sin(dcClock * 40) : 1;
    var ux = Math.cos(s.aim), uy = Math.sin(s.aim), px = -uy, py = ux, w = b.r * 0.75;
    ctx.save();
    ctx.globalAlpha = 0.72 * on * flash;
    ctx.fillStyle = "#e0221b";
    ctx.beginPath();
    ctx.moveTo(b.x + px * w * 0.6, b.y + py * w * 0.6);
    ctx.lineTo(b.x + ux * len + px * w, b.y + uy * len + py * w);
    ctx.lineTo(b.x + ux * len - px * w, b.y + uy * len - py * w);
    ctx.lineTo(b.x - px * w * 0.6, b.y - py * w * 0.6);
    ctx.closePath(); ctx.fill();
    ctx.globalAlpha = on * flash; ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 4.5; ctx.lineCap = "round"; ctx.lineJoin = "round";
    for (var c = 0; c < 3; c++) {
      var k = ((dcClock * 2.2 + c / 3) % 1) * 0.75 + 0.2, cx = b.x + ux * len * k, cy = b.y + uy * len * k, cw = w * 0.55;
      ctx.beginPath(); ctx.moveTo(cx - ux * cw * 0.6 + px * cw, cy - uy * cw * 0.6 + py * cw); ctx.lineTo(cx, cy); ctx.lineTo(cx - ux * cw * 0.6 - px * cw, cy - uy * cw * 0.6 - py * cw); ctx.stroke();
    }
    ctx.restore();
  });
}

// Where the super slam is going: a red and gold target on the middle of the
// mat from the moment he picks them up, and gold arrows on the mat from him
// to it while he carries them (big enough to read on a phone).
function drawDcTarget(b, g) {
  if (g.phase === "down") return;
  var cx = W / 2, cy = H / 2, R = 46;
  var on = g.phase === "lift" ? ease(g.t / DC_LIFT) : 1;
  var hot = g.phase === "hoist" || g.phase === "slam";
  var pulse = 1 + (hot ? 0.1 : 0.06) * Math.sin(dcClock * (hot ? 26 : 9));
  ctx.save();
  ctx.globalAlpha = on;
  ctx.fillStyle = "rgba(224,34,27,0.16)";
  ctx.beginPath(); ctx.ellipse(cx, cy, R * pulse, R * pulse * 0.62, 0, 0, Math.PI * 2); ctx.fill();
  [[1, "#ffffff", 9], [1, "#e0221b", 5], [0.56, "#ffffff", 7], [0.56, DC_GOLD, 4]].forEach(function (ring) {
    ctx.strokeStyle = ring[1]; ctx.lineWidth = ring[2];
    ctx.beginPath(); ctx.ellipse(cx, cy, R * ring[0] * pulse, R * ring[0] * pulse * 0.62, 0, 0, Math.PI * 2); ctx.stroke();
  });
  ctx.fillStyle = "#e0221b";
  ctx.beginPath(); ctx.ellipse(cx, cy, R * 0.18, R * 0.18 * 0.62, 0, 0, Math.PI * 2); ctx.fill();
  // Arrows from him to it.
  var dx = cx - b.x, dy = cy - b.y, d = Math.sqrt(dx * dx + dy * dy);
  var from = b.r + 8, to = d - R - 6;
  if ((g.phase === "lift" || g.phase === "carry") && to - from > 14) {
    // Chevrons every `gap` along the way, marching toward the target.
    var ux = dx / d, uy = dy / d, px = -uy, py = ux, cw = 12, gap = 28, shift = (dcClock * 70) % gap;
    ctx.lineCap = "round"; ctx.lineJoin = "round";
    for (var s = from + shift; s <= to; s += gap) {
      var ax = b.x + ux * s, ay = b.y + uy * s;
      ctx.globalAlpha = on * Math.min(1, (s - from) / 12, (to - s) / 12 + 0.35);
      [["#3a2410", 10], [DC_GOLD, 5.5]].forEach(function (st) {
        ctx.strokeStyle = st[0]; ctx.lineWidth = st[1];
        ctx.beginPath();
        ctx.moveTo(ax - ux * cw + px * cw, ay - uy * cw + py * cw); ctx.lineTo(ax, ay); ctx.lineTo(ax - ux * cw - px * cw, ay - uy * cw - py * cw);
        ctx.stroke();
      });
    }
  }
  ctx.restore();
}

// Over everything (draw.js): the SUPER SLAM! lettering.
function drawCormierOver() {
  if (!dcStamp) return;
  var s = dcStamp, pop = s.t < 0.12 ? 1.6 - 0.6 * (s.t / 0.12) : 1, fade = s.t > 1 ? Math.max(0, 1 - (s.t - 1) / 0.3) : 1;
  var x = Math.max(110, Math.min(W - 110, s.x)), y = Math.max(40, s.y - s.t * 14);
  ctx.save();
  ctx.globalAlpha = fade;
  ctx.translate(x, y); ctx.scale(pop, pop); ctx.rotate(-0.06);
  ctx.font = "900 38px \"Barlow Condensed\", \"Arial Narrow\", sans-serif";
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.lineJoin = "round"; ctx.lineWidth = 9; ctx.strokeStyle = "#1a0d06";
  ctx.strokeText("SUPER SLAM!", 0, 0);
  var g = ctx.createLinearGradient(0, -18, 0, 18);
  g.addColorStop(0, "#fff3b0"); g.addColorStop(0.5, DC_GOLD); g.addColorStop(1, "#e07a12");
  ctx.fillStyle = g;
  ctx.fillText("SUPER SLAM!", 0, 0);
  ctx.restore();
}

// His big round belly, hanging over his waistband (fighter-art.js, look.belly
// about 1; it grows as he eats). In the ball's own units.
function drawDcBelly(c, r, look, ink, lw, contained, sTop) {
  var s = look.belly || 1, skin = look.skin, line = shadeHex(skin, -0.42);
  var g1 = s - 1;
  var cy = contained ? r * (0.22 + 0.03 * g1) : r * (0.14 + 0.05 * g1);
  var rx = r * ((contained ? 0.6 : 0.64) + 0.3 * g1), ry = r * ((contained ? 0.31 : 0.42) + 0.12 * g1);
  c.save();
  // The shadow it throws down over the shorts.
  c.fillStyle = "rgba(0,0,0,0.38)";
  c.beginPath(); c.ellipse(0, cy + ry * 0.3, rx * 0.97, ry * 0.85, 0, 0, Math.PI * 2); c.fill();
  // The belly itself, lit from the top left.
  var g = c.createRadialGradient(-rx * 0.35, cy - ry * 0.45, ry * 0.12, 0, cy, rx * 1.12);
  g.addColorStop(0, shadeHex(skin, 0.2)); g.addColorStop(0.55, skin); g.addColorStop(1, shadeHex(skin, -0.3));
  c.fillStyle = g;
  c.beginPath(); c.ellipse(0, cy, rx, ry, 0, 0, Math.PI * 2); c.fill();
  // Where it rolls over the waistband, and its sides.
  c.lineCap = "round";
  c.strokeStyle = line; c.lineWidth = lw(0.05);
  c.beginPath(); c.ellipse(0, cy, rx, ry, 0, 0.12, Math.PI - 0.12); c.stroke();
  c.globalAlpha = 0.45; c.lineWidth = lw(0.035);
  [-1, 1].forEach(function (sd) {
    c.beginPath(); c.ellipse(0, cy, rx, ry, 0, sd > 0 ? -0.55 : Math.PI + 0.05, sd > 0 ? -0.05 : Math.PI + 0.55); c.stroke();
  });
  c.globalAlpha = 1;
  // Belly button.
  c.fillStyle = shadeHex(skin, -0.55);
  c.beginPath(); c.ellipse(0, cy + ry * 0.22, rx * 0.065, ry * 0.11, 0, 0, Math.PI * 2); c.fill();
  c.strokeStyle = shadeHex(skin, -0.35); c.lineWidth = lw(0.02);
  c.beginPath(); c.arc(0, cy + ry * 0.12, rx * 0.09, Math.PI * 0.15, Math.PI * 0.85); c.stroke();
  // Shine.
  c.fillStyle = "rgba(255,255,255,0.13)";
  c.beginPath(); c.ellipse(-rx * 0.38, cy - ry * 0.4, rx * 0.3, ry * 0.2, -0.35, 0, Math.PI * 2); c.fill();
  c.restore();
}

// ---------------------------------------------------------------- gallery (gallery.js)

function cormierCakeInfo(sp) {
  return "His 2015 \"All About That Cake\" video: when the bar's full he stops (\"SNACK TIME!\") and eats a slice of chocolate cake or a fried chicken drumstick, wide open while he does. Then his belly swells and he hits harder for the rest of the fight, stacking with every serving.";
}

function cormierGalleryMoves(ch, add) {
  var g = ch.cormier, dl = g.doubleLeg, fd = g.food, vj = g.vsJon;
  if (dl) {
    add("🤼", "Double leg", "Every " + dl.every[0] + "-" + dl.every[1] + "s up close he drops his level while a red lane shows where he's going (the tell), then shoots. Miss and he stumbles. They can sprawl on it (their own sprawl chance x" + dl.sprawlScale + ", at least " + dl.minStuff + "%), or catch his head in a guillotine.");
    add("🏟️", "Super slam", "When the double leg gets through he picks them up over his head, carries them to the middle of the cage (a target comes up there) while the crowd gets up, and throws them down on it: " + dl.damage + " damage, can't be slipped or blocked.");
  }
  if (g.bodyLock) add("🔒", "Body lock", g.bodyLock.through + "% of his body locks go straight through: no weave, no block, no sprawl.");
  if (fd) add("🍰", "Comfort food", "Every serving (up to " + fd.max + "): x" + fd.damage + " damage on everything he lands, x" + fd.take + " damage taken, and a bigger belly.");
  if (vj) add("🐐", "vs Jon Jones", "His rival: he hits Jon x" + vj.damage + " as hard and shoots the double leg more often.");
}

function cormierGallerySounds(groups, synth) {
  groups.push({ title: "Daniel Cormier", items: [
    synth("Double leg", "Dropping his level for the shot.", function () { playDcTell(); }),
    synth("Picked up", "Scooping them up over his head.", function () { playDcLift(); }),
    synth("Super slam", "Slamming them into the middle of the cage.", function () { playDcSuperSlam(); }),
    synth("Snack time", "The plate coming out.", function () { playDcPlate(); }),
    synth("Chomp", "A bite of cake.", function () { playDcChomp(); }),
    synth("Stronger", "The food kicking in.", function () { playDcPowerUp(); })
  ] });
}

// ---------------------------------------------------------------- sound
// Synth stand-ins until Joe records the real ones.

function dcAudio(fn) {
  try {
    var ac = getAudioCtx();
    if (!ac) return;
    if (ac.state === "suspended") ac.resume();
    fn(ac, ac.currentTime);
  } catch (e) { /* never let audio break the game */ }
}
// Dropping his level: a grunt and his feet scuffing the mat.
function playDcTell() {
  dcAudio(function (ac, t) {
    caneTone(ac, t, "sawtooth", 150, 92, 0.08, 0.22);
    caneBurst(ac, t, 900, 0.5, 0.3, 0.14);
    caneBurst(ac, t + 0.08, 500, 0.7, 0.22, 0.1);
  });
}
// Shooting in.
function playDcShoot() {
  playWhoosh();
  dcAudio(function (ac, t) { caneBurst(ac, t, 380, 0.6, 0.35, 0.18); });
}
// One footfall carrying them.
function playDcStep(v) {
  dcAudio(function (ac, t) {
    caneTone(ac, t, "sine", 75, 40, 0.3 * (v || 1), 0.12);
    caneBurst(ac, t, 260, 0.6, 0.18 * (v || 1), 0.07);
  });
}
// Scooping them up: a big grunt rising and the crowd going "ooh".
function playDcLift() {
  dcAudio(function (ac, t) {
    caneTone(ac, t, "sawtooth", 95, 170, 0.09, 0.4);
    caneTone(ac, t, "sine", 70, 140, 0.25, 0.4);
    caneBurst(ac, t, 700, 0.6, 0.3, 0.2);
  });
  if (typeof playTauntOoh === "function") playTauntOoh(); // (conor.js)
}
// Pressing them up high for the slam: a rising strain.
function playDcHoist() {
  dcAudio(function (ac, t) {
    var o = ac.createOscillator(), f = ac.createBiquadFilter(), g = ac.createGain();
    o.type = "sawtooth"; o.frequency.setValueAtTime(90, t); o.frequency.exponentialRampToValueAtTime(190, t + 0.35);
    f.type = "lowpass"; f.frequency.setValueAtTime(400, t); f.frequency.linearRampToValueAtTime(1600, t + 0.35);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.07, t + 0.1); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.4);
    o.connect(f); f.connect(g); g.connect(strikeOut(ac));
    o.start(t); o.stop(t + 0.42);
  });
}
// The super slam: the mat booming, a deep drop and debris.
function playDcSuperSlam() {
  playSlam();
  if (typeof playDuckLand === "function") playDuckLand();
  dcAudio(function (ac, t) {
    caneTone(ac, t, "sine", 62, 26, 0.7, 0.8);
    caneTone(ac, t, "triangle", 120, 45, 0.25, 0.5);
    caneBurst(ac, t, 220, 0.5, 0.65, 0.55);
    caneBurst(ac, t + 0.01, 1300, 0.8, 0.35, 0.25);
    for (var i = 0; i < 6; i++) caneBurst(ac, t + 0.12 + i * 0.05, 1800 + (i % 3) * 700, 2, 0.12, 0.04);
  });
}
// The plate coming out: a ceramic clink.
function playDcPlate() {
  dcAudio(function (ac, t) {
    caneTone(ac, t, "triangle", 2650, 2600, 0.12, 0.3);
    caneTone(ac, t, "sine", 3980, 3950, 0.06, 0.25);
    caneTone(ac, t + 0.09, "triangle", 2650, 2600, 0.06, 0.2);
  });
}
// A big bite.
function playDcChomp() {
  dcAudio(function (ac, t) {
    caneBurst(ac, t, 2400, 1.2, 0.3, 0.05);
    caneBurst(ac, t + 0.05, 1100, 1, 0.25, 0.08);
    caneBurst(ac, t + 0.13, 1600, 1.4, 0.15, 0.05);
    caneTone(ac, t, "triangle", 300, 190, 0.06, 0.08);
  });
}
// The food kicking in: a chord swelling up and a bright ding.
function playDcPowerUp() {
  dcAudio(function (ac, t) {
    [196, 247, 294].forEach(function (fq, i) {
      var o = ac.createOscillator(), f = ac.createBiquadFilter(), g = ac.createGain();
      o.type = "sawtooth"; o.frequency.setValueAtTime(fq * 0.8, t + i * 0.04); o.frequency.exponentialRampToValueAtTime(fq * 1.5, t + 0.45);
      f.type = "lowpass"; f.frequency.setValueAtTime(600, t); f.frequency.linearRampToValueAtTime(2600, t + 0.45);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.045, t + 0.2); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.8);
      o.connect(f); f.connect(g); g.connect(strikeOut(ac));
      o.start(t); o.stop(t + 0.85);
    });
    caneTone(ac, t + 0.42, "sine", 1320, 1320, 0.16, 0.55);
    caneTone(ac, t + 0.42, "sine", 1980, 1980, 0.06, 0.4);
  });
}
