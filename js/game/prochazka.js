// Jiří Procházka, "BJP" / "Denisa", the Czech samurai (Christian, 2026-11-13,
// reworked to his direction 2026-11-14). Light Heavyweight. Everything is set
// under `prochazka` in his character file (leave a block out and that part is
// off), plus his `weave`, `elbow`, `knee` and `combos` blocks.
//
// Hands low  (handsLow) his gloves hang down by his hips instead of up in a
//            guard, and he weaves a lot of what comes at him (weave: lots of
//            WEAVEs, and a critical weave turns into a chase combo).
// Chin       (chin) but with his hands that low, `critChance`% of the strikes
//            that do land on him (any of `sources`) are critical hits for
//            `critMult`x: "CRIT!", a crack across his chin and a freeze.
// Hands      heavy punches, elbows and knees up close (elbows.js, knees.js:
//            the clinch and the flying knee) and combinations (combos.js),
//            the spinning back elbow among them (the one that put Dominick
//            Reyes out in 2021): when his lands, the commentator's call goes
//            up (commentaryCall "spinElbow", commentary-calls.js).
// Samurai    his special (special.move "samurai", numbers in `samurai`). The
//            bar charges over the fight, so now and then it just goes off,
//            faster the more hurt he is (`lowBoost`). And once a fight it's
//            guaranteed: the first time HE drops under `lowHp` of his health
//            or THEY drop under `oppLowHp` of theirs, the bar fills right up.
//            If a samurai is already running then, that one counts; if one
//            has just ended, the forced one waits until `minGap` seconds after
//            it. At most `max` a fight, one of them always kept back for the
//            forced one.
//              The dream (`dream` seconds): the whole screen turns to rice
//              paper and ink, a gong, a shakuhachi note, and he sees Miyamoto
//              Musashi with his two swords in front of a red sun inside an
//              ensō. The world stops while he dreams: nobody moves.
//              The outfit (`outfit` seconds): ink bursts off him and he's in a
//              dark kimono over grey hakama, winged shoulders, a red obi, a
//              white headband and two swords in his belt ("SAMURAI!"), and
//              cherry blossom starts blowing across the screen (`petals`).
//              The draw (`draw` seconds): both katanas out of his belt,
//              Musashi's two-sword style. That's the tell: some back off
//              (`readChance`%, more for a weaver).
//              The run (`time` seconds) at `speed`x: every cut has its own
//              tell, the blade going up over his shoulder with a glint while a
//              red arc shows where it'll land (`tell` seconds, locking on for
//              the last part, so they can get out of it), then it whips
//              through (`swing`): `damage`, `critChance`% crits for `critMult`x
//              that can open a `cut`. Every `xEvery`-th cut is both swords at
//              once, an X for `xMult`x. The katanas hit very hard: a samurai
//              at the end of a fight usually ends it.
//              Cut down (iai): against someone under `ko.below` of their
//              health a clean cut is the end `ko.chance`% of the time. He's
//              through them and past in a blink, stands with his back to them
//              (`iai.hold`), slides both swords back into his belt
//              (`iai.sheathe`) and only at the click does the cut open: a
//              brush stroke of ink and red across the whole screen, a white
//              flash, "CUT DOWN!", and they fall. Getting out of the red arc
//              is the way out.
//              The finisher (finisher): both swords up behind his head while a
//              red line shows his path ("NITEN ICHI-RYU!", it locks `lock`
//              seconds before he goes), then a dash down it and both blades
//              through them: `damage` (nothing slips it, only getting off the
//              line) and into the cage, and against someone under `ko.below`
//              it's the cut down.
//              Then the swords go back in his belt and the kimono melts back
//              into ink (`keepOutfit` keeps it on).
// Clashes    (samurai.clash) his katanas meet Tony Ferguson's katanas, Ilia's
//            rapier, Dustin's diamond sword, Hokit's saber and Gane's bat
//            (sword.js counts his katanas as a weapon out, so Ilia's and
//            Dustin's swords come out against him). `parry`% of the cuts
//            either way clash instead of landing, and the `lockAfter`-th clash
//            of a run is a BLADE LOCK (KATANA LOCK against Tony): side by
//            side, shoving and sparking, then he wins (`winDamage`, into the
//            cage), gets cut (`hurtDamage`) or knocks their weapon away for
//            the rest of the fight (never Tony's: they're part of him).
//            Against Tony (vsTony) his katanas come out to meet the samurai
//            `answerChance`% of the time (one line in ferguson-katanas.js).
// Lines      (lines, when in `talk`) his real lines, read with say() only
//            (the talk channel). Every time: `start` 1-3 seconds in,
//            `samurai` as the kimono comes on, `win` after a win and `loss`
//            after a loss (each waits up to `talk.wait` seconds for quiet
//            rather than being dropped). Now and then: `hurt` after he eats a critical hit
//            (`talk.hurtChance`%, at most one every `talk.hurtGap` seconds),
//            `comeback` when he's `talk.comebackBehind` behind and puts a
//            burst on them (`talk.comebackRun` damage in a couple of seconds,
//            `comebackChance`%, up to
//            `comebackMax` a fight), never with a samurai about to go off.
//            One line at a time, never over another one; a line with no clip
//            yet is silent (speech.js).
"use strict";

// Registered here rather than in special.js's table, so fighters built in
// parallel don't all edit the same line.
SPECIAL_MOVES.samurai = "Samurai";
// And his own combination (combos.js): a lone spinning back elbow out of nowhere.
COMBOS["spin-back-elbow"] = ["spin"];

var JP_INK = "#15120f", JP_RED = "#b3202a";
var JP_STEEL = { W: "#ffffff", L: "#cfe3f2" }; // clash flash colours (clashFx, sword.js)
var JP_LONG = 1.75, JP_SHORT = 1.3;           // blade lengths, in ball radii
var JP_LOCK_IN = 0.25, JP_LOCK_TIME = 1.35;   // the blade lock: coming together, then the whole of it
var JP_SHEATHE = 0.6, JP_FIN_AFTER = 0.6;     // putting the swords away; the finisher after the cut
var JP_IAI_DASH = 0.12, JP_IAI_FALL = 0.9;     // cut down: through them; after the click, before he lets go
var jpLock = null;  // a blade lock, while it's on
var jpCuts = [];    // cut lines over whoever his katanas caught
var jpPetals = [];  // cherry blossom blowing across the screen while he's a samurai
var jpSlash = null; // the brush stroke across the whole screen when he cuts someone down
var jpClock = 0;

function jpCfg(b) { return b && b.char && b.char.prochazka; }
function jpSam(b) { var c = jpCfg(b); return c && c.samurai; }
function samuraiOn(b) { return !!(b && b.igbb && b.igbb.move === "samurai"); }
function jpPhase(b) { return samuraiOn(b) ? b.igbb.phase : null; }
function jpClamp(u) { return Math.max(0, Math.min(1, u)); }
function jpEase(u) { u = jpClamp(u); return u * u * (3 - 2 * u); }
function jpEaseOut(u) { u = jpClamp(u); return 1 - (1 - u) * (1 - u); }
function jpClashCfg(b) { var s = jpSam(b); return (s && s.clash) || { parry: { blade: 55, katana: 50, saber: 45, bat: 40 }, lockAfter: 2, win: 45, hurt: 30, disarm: 25, winDamage: 24, hurtDamage: 16 }; }
// His blades can meet a weapon (the run, not the draw or the finisher).
function jpParryLive(b) { return samuraiOn(b) && b.alive && b.igbb.phase === "close" && !jpLock && !swordDuelActive() && !katanaLock; }

// ---------------------------------------------------------------- hooks other files call

// From swordWeaponOut (sword.js): his katanas out count as a weapon, so
// Ilia's rapier and Dustin's diamond sword come out against him.
function samuraiWeaponOut(o) {
  var p = jpPhase(o);
  return o && o.alive && (p === "draw" || p === "close" || p === "final") ? "bat" : null;
}
// From swordDuelLocked (sword.js): both of them held in a blade lock.
function samuraiLockHeld(b) { return !!(jpLock && b && (b === jpLock.tRef || b === jpLock.oRef)); }
// From Tony Ferguson's katanas starting (ferguson-katanas.js): with the
// samurai's swords out, Tony's come out to meet them.
function samuraiCallsKatanas(self, other) {
  return !!(other && other.alive && jpPhase(other) === "close" && !jpLock && !specialBusy(self) &&
    !(self.punch || self.kick || self.swing || self.throwAnim || self.powerState || self.rageState || self.watcherState));
}
// From drawHands (draw-attacks.js): his hands are drawn here, down by his
// hips, or on his swords.
function prochazkaHandsBusy(b) {
  var c = jpCfg(b);
  if (!c || !b.alive) return false;
  if (samuraiOn(b)) return true;
  if (typeof jpPhantomBusy === "function" && jpPhantomBusy(b)) return true; // both hands on a sword that isn't there (jiri-phantom.js)
  return !!c.handsLow && jpHandsFree(b);
}
function jpHandsFree(b) {
  return !(b.punch || b.kick || b.taunt || b.combo || b.flow || b.koRush || b.koPunch || b.throwAnim || b.jabAnim || b.shelled ||
    b.igbb || b.swing || b.mock || b.elbowAnim || b.kneeAnim || b.cmb || b.plum || b.fknee || b.chAct || b.cheater || clinchBusy(b)); // (his arms are on them in the clinch, clinch.js)
}

// ---------------------------------------------------------------- setup

// From startMatchSeeded.
function resetProchazka() { jpLock = null; jpCuts = []; jpPetals = []; jpSlash = null; jpClock = 0; if (typeof resetJiriReact === "function") resetJiriReact(); if (typeof resetJiriPhantom === "function") resetJiriPhantom(); } // (and the halves: jiri-react.js, jiri-phantom.js)
// From makeBall.
function initProchazka(b) {
  b.jpN = 0; b.jpLowDone = false; b.jpLowDue = false; b.jpLastEnd = -999; b.jpCrit = 0; b.jpLookOff = null;
  // his lines: when the opening one goes, the one he owes, the gaps, the comeback
  var T = jpCfg(b) && jpCfg(b).talk;
  b.jpTalkT = 0; b.jpStartAt = T ? jpRand(T.start || [1, 3]) : 0; b.jpStartSaid = false; b.jpEndSaid = false; b.jpEndT = 0;
  b.jpOwed = []; b.jpHurtGap = 0; b.jpOppHp = null; b.jpComebacks = 0; b.jpSpinSeen = null;
}
function jpRand(r) { return r[0] + Math.random() * (r[1] - r[0]); }

// ---------------------------------------------------------------- every frame

// From update(), after the abilities loop.
function tickProchazka(dt) {
  jpClock += dt;
  tickSamuraiLock(dt);
  jpCuts.forEach(function (f) { f.t += dt; });
  jpCuts = jpCuts.filter(function (f) { return f.t < f.max; });
  if (jpSlash && (jpSlash.t += dt) >= jpSlash.max) jpSlash = null;
  jpTickPetals(dt);
  if (typeof tickJiriPhantom === "function") tickJiriPhantom(dt); // the imaginary cut: the ghosts, and them shaking in pain (jiri-phantom.js)
  if (typeof tickJiriReact === "function") tickJiriReact(dt); // the samurai's animals cut in half, leprechauns scared off (jiri-react.js)
  balls.forEach(function (b) {
    var cfg = jpCfg(b);
    if (!cfg) return;
    b.jpCrit = Math.max(0, (b.jpCrit || 0) - dt);
    var sam = cfg.samurai;
    if (sam && b.char.hasSpecial && b.alive && started && !over) jpCharge(b, sam, dt);
    jpSpinCall(b);
    jpTalk(b, cfg, dt);
  });
}

// His spinning back elbow (the "jab-spin-elbow" combination, combos.js): the
// commentator's call the moment it lands.
function jpSpinCall(b) {
  var s = b.cmb && b.cmb.cur;
  if (!s || s.k !== "spin" || !s.landed || b.jpSpinSeen === s) return;
  b.jpSpinSeen = s;
  if (typeof commentaryCall === "function") commentaryCall("spinElbow", b, balls[1 - b.id]);
}

// The samurai's bar: charges faster the more hurt he is, and fills right up
// the first time he or they get low (one samurai is always kept back for it).
function jpCharge(b, sam, dt) {
  var full = b.char.special.chargeTime, o = balls[1 - b.id];
  var low = b.hp <= (sam.lowHp || 0) * MAX_HP || (o && o.alive && o.hp <= (sam.oppLowHp || 0) * MAX_HP);
  if (low && !b.jpLowDone) { b.jpLowDone = true; if (!samuraiOn(b)) b.jpLowDue = true; } // (already going: that's this one)
  if (samuraiOn(b)) return;
  var cap = (sam.max || 1) - (b.jpLowDone ? 0 : 1);
  if ((b.jpN || 0) >= cap) { b.specialT = 0; return; } // none left to charge for (yet)
  if (b.jpLowDue && jpClock - b.jpLastEnd >= (sam.minGap || 0)) { b.jpLowDue = false; b.jpForced = true; b.specialT = full; return; }
  if (sam.lowBoost) b.specialT = Math.min(full, (b.specialT || 0) + dt * sam.lowBoost * (1 - b.hp / MAX_HP));
}

// ---------------------------------------------------------------- his lines

// One line at a time (Christian, 2026-11-14). The defining moments (the
// start, going samurai, a win, a loss) get their line EVERY time: it waits in
// line, as long as `talk.wait` seconds, for him and the talk channel to be
// quiet, rather than being dropped. The frequent moments (eating a shot, a
// comeback) are chances with gaps, only when nothing else is waiting, and not
// while a samurai is about to go off. Through say() only (speech.js).
var JP_DEFINING = { start: true, samurai: true, win: true, loss: true };
function jpOwe(b, lines, key, wait) {
  if (!lines || !lines.length) return;
  var q = b.jpOwed || (b.jpOwed = []), line = { key: key, line: pickLine(b, lines, key), t: wait };
  if (JP_DEFINING[key]) { b.jpOwed = q.filter(function (x) { return JP_DEFINING[x.key]; }); b.jpOwed.push(line); }
  else if (!q.length) q.push(line);
}
// Nobody on the talk channel (audio.js), or nearly done: a clip said now is heard.
function jpTalkFree() {
  try { return !(typeof audioCtx !== "undefined" && audioCtx && (talkQueued || talkEnd - audioCtx.currentTime > TALK_WAIT)); } catch (e) { return true; }
}
// A samurai's about to go off: no small talk in its way.
function jpSamuraiDue(b) {
  var sp = b.char.special;
  return samuraiOn(b) || b.jpLowDue || b.jpForced || !!(sp && b.specialT >= sp.chargeTime - 2);
}
function jpTalk(b, cfg, dt) {
  var L = cfg.lines, T = cfg.talk;
  if (!L || !T || !started) return;
  var o = balls[1 - b.id], q = b.jpOwed || (b.jpOwed = []);
  q.forEach(function (x) { x.t -= dt; });
  b.jpOwed = q = q.filter(function (x) { return x.t > 0 && (!over || x.key === "win" || x.key === "loss"); });
  b.jpHurtGap = Math.max(0, b.jpHurtGap - dt);
  if (!over) {
    b.jpTalkT += dt;
    if (!b.jpStartSaid && b.jpTalkT >= b.jpStartAt) { b.jpStartSaid = true; jpOwe(b, L.start, "start", T.wait || 12); }
    // A comeback: well behind (`comebackBehind`), he puts a burst on them
    // (`comebackRun` damage in the last couple of seconds) and he's fighting
    // back (not around the samurai, which has its own line).
    if (b.alive && o && o.alive) {
      b.jpBurst = (b.jpBurst || 0) * Math.exp(-dt / 2) + (b.jpOppHp != null ? Math.max(0, b.jpOppHp - o.hp) : 0);
      b.jpOppHp = o.hp;
      if (b.jpBurst >= (T.comebackRun || 40) && b.jpComebacks < (T.comebackMax || 1) && !jpSamuraiDue(b) && o.hp + b.jpBurst - b.hp >= (T.comebackBehind || 60)) {
        b.jpBurst = 0;
        if (Math.random() * 100 < (T.comebackChance != null ? T.comebackChance : 100)) { b.jpComebacks++; jpOwe(b, L.comeback, "comeback", 3); }
      }
    }
  } else if (!b.jpEndSaid && o) {
    // After the fight: his win line, or (knocked out) his loss line, every time.
    b.jpEndSaid = true;
    if (b.alive && !o.alive) jpOwe(b, L.win, "win", T.wait || 12);
    else if (!b.alive && o.alive) { b.jpEndT = T.lossDelay || 1.5; jpOwe(b, L.loss, "loss", (T.wait || 12) + b.jpEndT); }
  }
  if (b.jpEndT > 0) { b.jpEndT -= dt; return; } // (the loss line lets the winner go first)
  q = b.jpOwed;
  var x = q[0];
  if (!x || !jpTalkFree() || (over && announcer)) return;
  if (b.alive ? !canSay(b) : !(o && canSay(o))) return;
  if (!JP_DEFINING[x.key] && jpSamuraiDue(b)) { q.shift(); return; } // (the samurai's coming: dropped)
  q.shift();
  say(b, x.line);
}

// ---------------------------------------------------------------- the chin

// From hurt() (match.js), with the damage multipliers: hands that low, a
// strike that lands is often a critical hit.
function prochazkaChin(b, source, attackerId) {
  var c = jpCfg(b), ch = c && c.chin;
  if (!ch || attackerId == null || attackerId === b.id || !b.alive) return 1;
  if ((ch.sources || []).indexOf(source) < 0) return 1;
  if (Math.random() * 100 >= ch.critChance) return 1;
  var a = balls[attackerId], dx = b.x - a.x, dy = b.y - a.y, d = Math.sqrt(dx * dx + dy * dy) || 1, ux = dx / d, uy = dy / d;
  floater(b.x, b.y - b.r - 34, "CRIT!", "crit");
  impacts.push({ x: b.x - ux * b.r, y: b.y - uy * b.r, nx: -ux, ny: -uy, life: 0.3, max: 0.3, color: "#ffffff" });
  b.jpCrit = 0.4; // the crack across his chin (drawProchazka)
  b.squash = { t: 0.12, max: 0.12, nx: -ux, ny: -uy };
  hitStop = Math.max(hitStop, 0.05);
  if (!reduceMotion) shake = Math.max(shake, 10);
  crowdReact(0.3);
  playChinCrack();
  // Sometimes he needs to catch some punches: his line after he eats one.
  var T = c.talk;
  if (T && c.lines && !jpSamuraiDue(b) && b.jpHurtGap <= 0 && Math.random() * 100 < (T.hurtChance || 0)) { b.jpHurtGap = T.hurtGap || 15; jpOwe(b, c.lines.hurt, "hurt", 1.5); }
  return ch.critMult;
}

// ---------------------------------------------------------------- the samurai

// From updateSpecial (special.js) for special.move "samurai".
function updateSamurai(self, other, dt) {
  var cfg = jpSam(self), sp = self.char.special;
  if (!cfg) return false;
  if (!self.igbb) {
    if (self.specialT < sp.chargeTime) return false;
    // Tony Ferguson's katanas out don't stop him: the samurai answers them.
    var vsKatanas = katanaOn(other) && other.igbb.phase === "close" && other.alive && !specialBusy(self) && !self.punch && !self.kick;
    var vsBus = typeof jpBusAnswer === "function" && jpBusAnswer(self, other); // Conor's lads out for him: the samurai answers the bus (jiri-react.js)
    if (!(canStartIgbb(self, other) || vsKatanas || vsBus) || swordDuelActive() || jpLock || katanaLock) return false;
    jpStart(self, other, cfg);
  }
  var m = self.igbb;
  if (m.move !== "samurai") return false;
  self.combo = null; self.flow = null; self.taunt = null; // (a critical weave mid special waits for nothing)
  if (samuraiLockHeld(self)) { self.vx = 0; self.vy = 0; return true; }
  if (self.slam || (self.checkStun || 0) > 0) return true; // knocked into the cage: the special waits
  m.t += dt;
  var dx = other.x - self.x, dy = other.y - self.y, d = Math.sqrt(dx * dx + dy * dy) || 1, ux = dx / d, uy = dy / d, gap = d - self.r - other.r;
  if (m.phase === "iai") return jpIaiTick(self, other, cfg, m);
  if (!(m.phase === "close" && m.sl && m.sl.t >= cfg.tell * 0.7)) m.ang = Math.atan2(uy, ux);
  if (over && m.phase !== "sheathe") { m.phase = "sheathe"; m.t = 0; m.sl = null; }
  if (m.phase === "dream") {
    self.vx = 0; self.vy = 0;
    if (m.t >= cfg.dream) jpSuitUp(self, other, cfg, m);
    return true;
  }
  if (m.phase === "outfit") {
    self.vx = 0; self.vy = 0;
    if (m.t >= cfg.outfit) {
      m.phase = "draw"; m.t = 0;
      m.read = Math.random() * 100 < (cfg.readChance || 0) + (other.char.hasWeave ? 15 : 0);
      if (m.read) floater(other.x, other.y - other.r - 30, "!", "crit");
      playKatanaDraw(); // (ferguson.js)
    }
    return true;
  }
  if (m.phase === "draw") {
    self.vx = 0; self.vy = 0;
    if (m.read && other.alive && inOrdinaryMovement(other)) { var bs = Math.max(Math.sqrt(other.vx * other.vx + other.vy * other.vy), 220); other.vx = ux * bs; other.vy = uy * bs; }
    if (!m.drew2 && m.t >= cfg.draw * 0.3) { m.drew2 = true; playKatanaDraw(); }
    if (m.t >= cfg.draw) {
      m.phase = "close"; m.t = 0; m.next = 0.05;
      // Tony Ferguson's katanas come out to meet him.
      var vt = cfg.vsTony;
      if (vt && other.char.hasSpecial && other.char.special.move === "katana" && !other.igbb && Math.random() * 100 < (vt.answerChance || 0)) other.specialT = other.char.special.chargeTime;
    }
    return true;
  }
  if (m.phase === "close") {
    if (m.sl) { jpRunSlash(self, other, cfg, m, dt, gap); if (m.phase !== "close") return true; } // (cut down: the iai took over)
    else {
      var spd = (self.baseSpeed || SPEED) * cfg.speed * (gap < 6 ? 0.2 : 1);
      if (other.alive) { self.vx = ux * spd; self.vy = uy * spd; }
      m.next -= dt;
      if (m.next <= 0 && other.alive && gap < cfg.reach + 40 && m.t < cfg.time) jpStartSlash(self, other, cfg, m);
    }
    if ((m.t >= cfg.time && !m.sl) || !other.alive) {
      m.sl = null; m.t = 0;
      if (other.alive && cfg.finisher) {
        m.phase = "final"; m.fAng = m.ang; m.fLocked = false; m.fHit = false; m.fRun = 0; m.ghosts = [];
        floater(self.x, self.y - self.r - 30, "NITEN ICHI-RYU!", "crit");
        playSamuraiGlint(true);
        crowdReact(0.7);
      } else m.phase = "sheathe";
    }
    return true;
  }
  if (m.phase === "final") return jpFinisher(self, other, cfg, m, dt, gap);
  // Sheathing: the swords back in his belt, the kimono melting back to ink.
  self.vx = 0; self.vy = 0;
  if (m.t >= JP_SHEATHE) {
    self.igbb = null;
    self.jpLastEnd = jpClock;
    if (!cfg.keepOutfit && !(m.keep && over)) jpSuit(self, false, cfg); // (he won it as a samurai: the kimono stays on)
    if (self.alive) setSpeed(self, self.baseSpeed || SPEED);
    return false;
  }
  return true;
}

function jpStart(self, other, cfg) {
  clearActions(self);
  self.igbb = { move: "samurai", phase: "dream", t: 0, n: 0, next: 0, clashes: 0, sl: null, ang: 0, critSaid: false, forced: !!self.jpForced };
  self.jpForced = false;
  self.specialT = 0;
  self.jpN = (self.jpN || 0) + 1;
  self.vx = 0; self.vy = 0;
  // The world stops while he dreams (released as the swords come out).
  if (other.alive) {
    var dx = other.x - self.x, dy = other.y - self.y, d = Math.sqrt(dx * dx + dy * dy) || 1;
    if (inOrdinaryMovement(other) && d < self.r + other.r + 90) { other.x += dx / d * 30; other.y += dy / d * 30; }
    other.checkStun = Math.max(other.checkStun || 0, cfg.dream + cfg.outfit * 0.8);
  }
  playSamuraiDream();
  crowdReact(0.5);
}

// The outfit: ink bursting off him, and he's a samurai.
function jpSuitUp(self, other, cfg, m) {
  m.phase = "outfit"; m.t = 0;
  jpSuit(self, true, cfg);
  jpInk(self, 26, 1);
  floater(self.x, self.y - self.r - 30, "SAMURAI!", "crit");
  impacts.push({ x: self.x, y: self.y + self.r, nx: 0, ny: -1, life: 0.4, max: 0.4, color: JP_INK });
  if (!reduceMotion) shake = Math.max(shake, 10);
  crowdReact(1);
  playSamuraiTaiko();
  var L = jpCfg(self).lines;
  if (L) jpOwe(self, L.samurai, "samurai", (jpCfg(self).talk || {}).wait || 12); // (every time he goes samurai)
}

// Puts the samurai's kimono on (or back off): his own copy of his look,
// like Hokit's robe (hokit-darkside.js).
function jpSuit(b, on, cfg) {
  if (on) {
    if (!b.jpLookOff) b.jpLookOff = b.char.look;
    b.char = Object.assign({}, b.char, { look: Object.assign({}, b.jpLookOff, cfg.look || {}) });
  } else if (b.jpLookOff) {
    b.char = Object.assign({}, b.char, { look: b.jpLookOff });
    b.jpLookOff = null;
    jpInk(b, 14, 0.6);
  }
}

// Ink splashing off him.
function jpInk(b, n, big) {
  for (var i = 0; i < n && !reduceMotion; i++) {
    var a = nativeRandom() * Math.PI * 2, s = (90 + nativeRandom() * 260) * big;
    particles.push({ x: b.x + Math.cos(a) * b.r * 0.5, y: b.y + Math.sin(a) * b.r * 0.5, vx: Math.cos(a) * s, vy: Math.sin(a) * s,
      life: 0.45 + nativeRandom() * 0.3, max: 0.75, size: b.r * (0.08 + nativeRandom() * 0.14) * (0.6 + big * 0.4), color: i % 5 ? JP_INK : JP_RED });
  }
}

// ---- the cuts

function jpStartSlash(self, other, cfg, m) {
  m.n++;
  var both = cfg.xEvery && m.n % cfg.xEvery === 0;
  m.side = -(m.side || -1);
  m.sl = { t: 0, side: m.side, both: both, hit: false, glint: false };
  if (typeof jpSpinMaybe === "function") jpSpinMaybe(self, other, cfg, m); // now and then a whirlwind instead (jiri-spin.js)
  playSamuraiGlint(false);
}

function jpRunSlash(self, other, cfg, m, dt, gap) {
  if (m.sl.kind === "spin") return jpSpinRun(self, other, cfg, m, dt, gap); // the whirlwind (jiri-spin.js)
  var sl = m.sl, T = cfg.tell, S = cfg.swing, R = cfg.recover;
  sl.t += dt;
  var ux = Math.cos(m.ang), uy = Math.sin(m.ang), spd = (self.baseSpeed || SPEED) * cfg.speed;
  if (sl.t < T) { self.vx = ux * spd * 0.35; self.vy = uy * spd * 0.35; } // creeping in, blade up
  else if (sl.t < T + S) {
    if (!sl.whoosh) { sl.whoosh = true; playElbowSwish(true); }
    self.vx = ux * 300; self.vy = uy * 300; // lunging into it
  } else { self.vx = ux * spd * 0.2; self.vy = uy * spd * 0.2; }
  if (!sl.hit && sl.t >= T + S * 0.6) {
    sl.hit = true;
    if (other.alive && jpInArc(self, other, m.ang, cfg)) {
      jpCut(self, other, cfg, m, sl.both ? cfg.xMult : 1, sl.both ? "x" : "line", m.ang + (sl.both ? 0 : sl.side * 0.9));
    } else if (other.alive) floater(other.x, other.y - other.r - 8, "WHIFF", "dodge");
  }
  if (sl.t >= T + S + R) { m.sl = null; m.next = 0.06; }
}
// Still inside the red arc when the blade comes through?
function jpInArc(self, other, ang, cfg) {
  var dx = other.x - self.x, dy = other.y - self.y, d = Math.sqrt(dx * dx + dy * dy) || 1;
  if (d - self.r - other.r > cfg.reach + 8) return false;
  var off = Math.abs(Math.atan2(Math.sin(Math.atan2(dy, dx) - ang), Math.cos(Math.atan2(dy, dx) - ang)));
  return off < (cfg.arc || 1.2) / 2 + Math.asin(Math.min(1, other.r / d));
}

// The weapon in their hands his blades meet: Tony's katanas, a sword, a
// saber or a bat.
function jpOppWeapon(o) {
  if (!o || !o.alive) return null;
  if (katanaOn(o) && o.igbb.phase === "close") return "katana";
  if (jpParryLive(o)) return "katana"; // another samurai (a mirror match)
  return katOppWeapon(o); // (ferguson-katanas.js)
}

// One cut landing (or meeting their weapon).
function jpCut(self, other, cfg, m, mult, fxKind, fxAng) {
  if (!other.alive || other.koOut) return 0;
  var w = jpOppWeapon(other), cc = jpClashCfg(self);
  // Once the blades have met, nothing gets through until the lock is decided.
  if (w && jpParryLive(self) && ((m.clashes > 0 && !m.lockDone) || Math.random() * 100 < (cc.parry[w] || 0))) { jpClash(self, other, w, true); return 0; }
  var dx = other.x - self.x, dy = other.y - self.y, d = Math.sqrt(dx * dx + dy * dy) || 1, ux = dx / d, uy = dy / d;
  if (jpKoRange(other, cfg) && Math.random() * 100 < cfg.ko.chance) {
    if (cfg.iai) { jpIai(self, other, cfg, m, m.ang); return 1; }
    return jpKoCut(self, other, ux, uy, fxAng, "elbow");
  }
  var crit = Math.random() * 100 < cfg.critChance;
  var dealt = hurt(other, cfg.damage * (crit ? cfg.critMult : 1) * mult, "elbow", self.id);
  if (dealt > 0) {
    if (!other.justDodged && elbowKnockable(other)) { other.vx += ux * (crit ? 220 : 120); other.vy += uy * (crit ? 220 : 120); }
    elbowSpark(self, other, ux, uy, crit, true);
    jpCuts.push({ id: other.id, ang: fxAng, t: 0, max: fxKind === "x" ? 0.9 : 0.5, kind: fxKind });
    if (crit) {
      if (!m.critSaid) { m.critSaid = true; floater(other.x, other.y - other.r - 30, "CRIT SLASH!", "crit"); } // (only the first: the run stays readable)
      if (cfg.cut && Math.random() * 100 < cfg.cut.chance) openCut(other, Math.atan2(-uy, -ux), cfg.cut, self.id, true);
      hitStop = Math.max(hitStop, 0.06);
    }
    playElbowHit(dealt, crit, true);
    if (!reduceMotion) shake = Math.max(shake, crit ? 12 : 6);
  }
  checkEnd();
  return dealt;
}

// They're hurt enough for a cut to finish it.
function jpKoRange(o, cfg) { return !!(cfg.ko && o.alive && !o.koOut && o.hp <= cfg.ko.below * MAX_HP); }
// A cut that ends it: everything they have left (and then some, for a
// fighter with a chin), "CUT DOWN!", a big X and a freeze. As a strike
// ("elbow") it can still be slipped or blocked; the finisher's can't.
function jpKoCut(self, other, ux, uy, fxAng, source) {
  var dealt = hurt(other, Math.ceil(other.hp / incomingMultiplier(other) * 1.6) + 5, source, self.id);
  if (dealt > 0) {
    jpCuts.push({ id: other.id, ang: fxAng, t: 0, max: 1.1, kind: "x" });
    elbowSpark(self, other, ux, uy, true, true);
    if (!other.alive) floater(other.x, other.y - other.r - 44, "CUT DOWN!", "crit");
    if (!other.justDodged && elbowKnockable(other)) { other.vx += ux * 320; other.vy += uy * 320; }
    playElbowHit(dealt, true, true);
    playSamuraiTaiko();
    hitStop = Math.max(hitStop, 0.22);
    if (!reduceMotion) shake = Math.max(shake, 20);
    crowdReact(1);
  }
  checkEnd();
  return dealt;
}

// ---- cut down (iai)

// The cut that ends it: he's through them and past in a blink, they're frozen
// with a white hairline across them, he stands with his back to them and
// slides both swords home, and only at the click does the cut open.
function jpIai(self, other, cfg, m, ang) {
  var C = cfg.iai, D = self.r + other.r + 56, best = null;
  // the far side of them along the cut, or the nearest angle that's in the cage
  for (var k = 0; k < 14 && !best; k++) {
    var a = ang + (k % 2 ? 1 : -1) * Math.ceil(k / 2) * 0.3, tx = other.x + Math.cos(a) * D, ty = other.y + Math.sin(a) * D;
    if (tx > self.r + 4 && tx < W - self.r - 4 && ty > self.r + 4 && ty < H - self.r - 4) best = { x: tx, y: ty };
  }
  if (!best) best = { x: Math.min(W - self.r - 4, Math.max(self.r + 4, other.x + Math.cos(ang) * D)), y: Math.min(H - self.r - 4, Math.max(self.r + 4, other.y + Math.sin(ang) * D)) };
  m.phase = "iai"; m.t = 0; m.sl = null;
  m.iai = { cutAng: ang, ang: Math.atan2(best.y - self.y, best.x - self.x), fx: self.x, fy: self.y, tx: best.x, ty: best.y, ghosts: [{ x: self.x, y: self.y }], clicked: false };
  clearActions(other);
  other.vx = 0; other.vy = 0;
  other.checkStun = Math.max(other.checkStun || 0, JP_IAI_DASH + C.hold + C.sheathe + 0.3);
  jpCuts.push({ id: other.id, ang: ang, t: 0, max: JP_IAI_DASH + C.hold + C.sheathe, kind: "hair" });
  hitStop = Math.max(hitStop, 0.04);
  if (!reduceMotion) shake = Math.max(shake, 8);
  playElbowSwish(true);
  playSamuraiGlint(true);
  crowdReact(0.6);
}
function jpIaiTick(self, other, cfg, m) {
  var I = m.iai, C = cfg.iai, click = JP_IAI_DASH + C.hold + C.sheathe;
  self.vx = 0; self.vy = 0;
  if (other.alive && !I.clicked) { other.vx = 0; other.vy = 0; }
  if (m.t < JP_IAI_DASH) {
    var u = jpEaseOut(m.t / JP_IAI_DASH);
    self.x = I.fx + (I.tx - I.fx) * u; self.y = I.fy + (I.ty - I.fy) * u;
    I.ghosts.push({ x: self.x, y: self.y });
    return true;
  }
  self.x = I.tx; self.y = I.ty;
  if (!I.clicked && m.t >= click) { I.clicked = true; jpIaiCut(self, other, m); }
  if (I.clicked && m.t >= click + (other.alive ? 0.3 : JP_IAI_FALL)) { m.phase = "sheathe"; m.t = JP_SHEATHE; m.keep = true; } // (already home)
  return true;
}
// The click of the guard on the scabbard, and the cut opens.
function jpIaiCut(self, other, m) {
  var I = m.iai, ux = Math.cos(I.cutAng), uy = Math.sin(I.cutAng);
  playSheatheClick();
  if (!other.alive || other.koOut) return;
  other.checkStun = 0;
  var dealt = hurt(other, Math.ceil(other.hp / incomingMultiplier(other) * 1.6) + 5, "igbb", self.id);
  jpSlash = { x: other.x, y: other.y, ang: I.cutAng, t: 0, max: 1.2 };
  jpCuts.push({ id: other.id, ang: I.cutAng, t: 0, max: 1.2, kind: "x" });
  if (dealt > 0) {
    elbowSpark(self, other, -ux, -uy, true, true);
    if (!other.alive) floater(other.x, other.y - other.r - 44, "CUT DOWN!", "crit");
    playElbowHit(dealt, true, true);
    playSamuraiTaiko();
    hitStop = Math.max(hitStop, 0.25);
    if (!reduceMotion) shake = Math.max(shake, 22);
    crowdReact(1);
  }
  checkEnd();
}

// The finisher: both swords up behind his head while the red line shows his
// path, then a dash down it and both blades through them.
function jpFinisher(self, other, cfg, m, dt, gap) {
  var F = cfg.finisher;
  self.vx = 0; self.vy = 0;
  if (m.t < F.tell - F.lock) m.fAng = m.ang; // tracking them
  else if (!m.fLocked) {
    m.fLocked = true;
    var ux0 = Math.cos(m.fAng), uy0 = Math.sin(m.fAng), dd = Math.sqrt((other.x - self.x) * (other.x - self.x) + (other.y - self.y) * (other.y - self.y));
    m.fLen = Math.min(dd + other.r + 20, jpRayToWall(self.x, self.y, ux0, uy0, self.r));
    playSamuraiGlint(true);
  }
  if (m.t >= F.tell && !m.fHit && m.fRun < (m.fLen || 0)) {
    // The dash: straight down the line, as far as it goes or until he meets them.
    var ux = Math.cos(m.fAng), uy = Math.sin(m.fAng), st = Math.min(m.fLen - m.fRun, F.dash * dt);
    self.x += ux * st; self.y += uy * st; m.fRun += st;
    m.ghosts.push({ x: self.x, y: self.y });
    var g2 = Math.sqrt((other.x - self.x) * (other.x - self.x) + (other.y - self.y) * (other.y - self.y)) - self.r - other.r;
    if (other.alive && g2 < F.reach) jpFinisherHit(self, other, cfg, m);
    else if (m.fRun >= m.fLen - 0.5) { m.fHit = true; m.fMiss = true; m.fT = m.t; if (other.alive) floater(other.x, other.y - other.r - 8, "WHIFF", "dodge"); }
  }
  if (m.fHit && m.t >= m.fT + JP_FIN_AFTER) { m.phase = "sheathe"; m.t = 0; }
  if (!m.fHit && m.t > F.tell + 1.2) { m.phase = "sheathe"; m.t = 0; } // (never got going)
  return true;
}
function jpFinisherHit(self, other, cfg, m) {
  var F = cfg.finisher, ux = Math.cos(m.fAng), uy = Math.sin(m.fAng);
  m.fHit = true; m.fT = m.t;
  var w = jpOppWeapon(other), cc = jpClashCfg(self);
  if (w && Math.random() * 100 < (cc.parry[w] || 0)) { jpClashFx(self, other, w, true); floater((self.x + other.x) / 2, Math.min(self.y, other.y) - self.r - 34, "PARRIED!", "crit"); return; }
  if (jpKoRange(other, cfg)) { if (cfg.iai) jpIai(self, other, cfg, m, m.fAng); else jpKoCut(self, other, ux, uy, m.fAng, "igbb"); return; }
  var dealt = hurt(other, F.damage, "igbb", self.id); // only getting off the line saves them
  if (dealt > 0) {
    jpCuts.push({ id: other.id, ang: m.fAng, t: 0, max: 1, kind: "x" });
    elbowSpark(self, other, ux, uy, true, true);
    playElbowHit(dealt, true, true);
    playSamuraiTaiko();
    if (!other.justDodged && !other.grappled && !other.slam && !other.koOut && other.alive) beginWallSlam(other, ux, uy, { knockback: F.knockback, wallSlams: F.wallSlams, slamDamage: F.slamDamage });
    hitStop = Math.max(hitStop, 0.14);
    if (!reduceMotion) shake = Math.max(shake, 18);
    crowdReact(1);
  }
  checkEnd();
}
// How far he can dash from (x, y) along (ux, uy) before the cage.
function jpRayToWall(x, y, ux, uy, r) {
  var t = 1e9;
  if (ux > 0.001) t = Math.min(t, (W - r - x) / ux); else if (ux < -0.001) t = Math.min(t, (r - x) / ux);
  if (uy > 0.001) t = Math.min(t, (H - r - y) / uy); else if (uy < -0.001) t = Math.min(t, (r - y) / uy);
  return Math.max(0, t);
}

// ---------------------------------------------------------------- clashes

// From hurt() (match.js), with the other dodges: a blade, a saber or a bat
// coming at him while his katanas are out can meet them instead.
function prochazkaParry(b, source, attackerId) {
  if (!samuraiOn(b) || attackerId == null || attackerId === b.id) return false;
  if (samuraiLockHeld(b)) { b.justDodged = true; return true; } // in the lock nothing lands on him
  if (!jpParryLive(b)) return false;
  var a = balls[attackerId], w = null;
  if (source === "elbow" && (katanaOn(a) || samuraiOn(a))) w = "katana"; // Tony Ferguson's katanas (ferguson-katanas.js), or another samurai's
  else if (source === "bat" && a.cheater) w = a.cheater.saber ? "saber" : "bat"; // Gane's bat, Hokit's saber (cheater.js)
  if (!w) return false;
  var m = b.igbb, cc = jpClashCfg(b);
  if (!((m.clashes > 0 && !m.lockDone) || Math.random() * 100 < (cc.parry[w] || 0))) return false;
  jpClash(b, a, w, false);
  b.justDodged = true;
  return true;
}

function jpClash(t, o, w, jiriAttacking) {
  var m = t.igbb, cc = jpClashCfg(t);
  m.clashes = (m.clashes || 0) + 1;
  if (m.sl) m.sl.hit = true; // the cut's done
  if (m.clashes >= cc.lockAfter && !m.locked) { m.locked = true; startSamuraiLock(t, o, w); return; }
  jpClashFx(t, o, w, jiriAttacking);
  floater((t.x + o.x) / 2, Math.min(t.y, o.y) - t.r - 34, w === "blade" && jiriAttacking ? "PARRY!" : "CLASH!", "crit");
}
function jpClashFx(t, o, w, jiriAttacking) {
  var nx = o.x - t.x, ny = o.y - t.y, nd = Math.sqrt(nx * nx + ny * ny) || 1;
  nx /= nd; ny /= nd;
  var cx = (t.x + o.x) / 2, cy = (t.y + o.y) / 2 - t.r * 0.3, h = bladeHost(o);
  if (w === "blade" && h && h.sword && h.sword.pose) { var p = swordPoint(o, h.sword, 0.45); cx = p.x; cy = p.y; }
  if (w === "saber") saberClashFx(cx, cy, -nx, -ny, 1.2); else clashFx(cx, cy, -nx, -ny, 1.2, w === "blade" ? bladeColors(o) : JP_STEEL);
  if (h && h.sword) { h.sword.parry = 0; h.sword.parries = 0; } // their sword twisting into it (sword.js)
  var kb = 420; // whoever swung gets knocked back off it
  if (jiriAttacking) { t.vx = -nx * kb; t.vy = -ny * kb; o.vx += nx * kb * 0.3; o.vy += ny * kb * 0.3; t.squash = { t: 0.14, max: 0.14, nx: nx, ny: ny }; }
  else { o.vx = nx * kb; o.vy = ny * kb; t.vx -= nx * kb * 0.3; t.vy -= ny * kb * 0.3; o.squash = { t: 0.14, max: 0.14, nx: -nx, ny: -ny }; if (o.cheater) o.cheater.cd = Math.max(o.cheater.cd || 0, 0.6); }
  crowdReact(0.6);
  if (w === "saber") playSaberClash(1); else playSwordClash(1);
}

function startSamuraiLock(t, o, w) {
  clearActions(o); o.chAct = null;
  var m = t.igbb, cc = jpClashCfg(t);
  m.sl = null; m.next = 0.35;
  var nx = o.x >= t.x ? 1 : -1, gap = t.r + o.r + 40;
  var mx = Math.min(W - gap / 2 - t.r - 10, Math.max(gap / 2 + t.r + 10, (t.x + o.x) / 2));
  var my = Math.min(H - t.r - 10, Math.max(t.r * 2.4, (t.y + o.y) / 2));
  var r = Math.random() * (cc.win + cc.hurt + cc.disarm), out = r < cc.win ? "win" : r < cc.win + cc.hurt ? "hurt" : "disarm";
  if (out === "disarm" && w === "katana") out = "win"; // Tony's blades are part of him
  jpLock = { tId: t.id, oId: o.id, tRef: t, oRef: o, w: w, t: 0, nx: nx, mx: mx, my: my, gap: gap,
    fromT: { x: t.x, y: t.y }, fromO: { x: o.x, y: o.y }, outcome: out, sparkT: 0 };
  t.vx = t.vy = o.vx = o.vy = 0;
  floater(mx, my - t.r - 56, w === "katana" ? "KATANA LOCK!" : "BLADE LOCK!", "crit");
  crowdReact(1);
  if (w === "saber") { playSaberClash(1.6); playSaberLockBuzz(JP_LOCK_TIME - JP_LOCK_IN); } else playSwordClash(1.6);
  if (!reduceMotion) shake = Math.max(shake, 12);
}
function jpLockPoint() { var L = jpLock, t = L.tRef, o = L.oRef; return { x: (t.x + o.x) / 2, y: (t.y + o.y) / 2 - t.r * 1.1 }; }
// Their weapon still in their hands (a bat can go if the ref wakes up).
function jpLockWeapon(L) {
  var o = L.oRef;
  if (L.w === "katana") return katanaOn(o) || samuraiOn(o);
  if (L.w === "saber") return !!(o.cheater && o.cheater.saber);
  if (L.w === "bat") return !!o.cheater;
  var h = bladeHost(o);
  return !!(h && h.sword);
}

function tickSamuraiLock(dt) {
  var L = jpLock;
  if (!L) return;
  var t = L.tRef, o = L.oRef;
  if (balls[L.tId] !== t || balls[L.oId] !== o || !t.alive || !o.alive || over || !samuraiOn(t) || !jpLockWeapon(L)) {
    jpLock = null;
    if (samuraiOn(t)) t.igbb.lockDone = true;
    return;
  }
  L.t += dt;
  var k = jpEase(L.t / JP_LOCK_IN), push = L.t > JP_LOCK_IN ? Math.sin((L.t - JP_LOCK_IN) * 7) * t.r * 0.14 : 0, half = L.gap / 2;
  var tx = L.mx - L.nx * (half - push), ox = L.mx + L.nx * (half + push);
  t.x = L.fromT.x + (tx - L.fromT.x) * k; t.y = L.fromT.y + (L.my - L.fromT.y) * k;
  o.x = L.fromO.x + (ox - L.fromO.x) * k; o.y = L.fromO.y + (L.my - L.fromO.y) * k;
  t.vx = t.vy = o.vx = o.vy = 0;
  var h = bladeHost(o);
  if (h && h.sword) h.sword.parry = 0.12; // their sword held up against his
  if (L.t > JP_LOCK_IN) {
    L.sparkT -= dt;
    if (L.sparkT <= 0) {
      L.sparkT = 0.07;
      var p = jpLockPoint();
      for (var i = 0; i < 4 && !reduceMotion; i++) {
        var a = -Math.PI / 2 + (nativeRandom() - 0.5) * 2.6, s = 120 + nativeRandom() * 260;
        particles.push({ x: p.x, y: p.y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 0.3, max: 0.3, size: 2 + nativeRandom() * 2.5, color: i % 2 ? (L.w === "saber" ? "#ff3b3b" : "#ffffff") : "#fff2c2" });
      }
      if (!reduceMotion) shake = Math.max(shake, 3);
    }
  }
  if (L.t < JP_LOCK_TIME) return;
  // Broken apart: how it ends.
  jpLock = null;
  var m = t.igbb, cc = jpClashCfg(t), nx = L.nx, p2 = { x: (t.x + o.x) / 2, y: (t.y + o.y) / 2 - t.r * 0.5 };
  m.lockDone = true;
  if (L.w === "saber") saberClashFx(p2.x, p2.y, nx, 0, 2); else clashFx(p2.x, p2.y, nx, 0, 2, L.w === "blade" ? bladeColors(o) : JP_STEEL);
  if (L.outcome === "win") {
    // He shoves their weapon up and both his swords come down through them.
    var dealt = hurt(o, cc.winDamage, "igbb", t.id);
    floater(o.x, o.y - o.r - 34, "SAMURAI SLASH!", "crit");
    jpCuts.push({ id: o.id, ang: Math.atan2(o.y - t.y, o.x - t.x), t: 0, max: 0.9, kind: "x" });
    playElbowHit(cc.winDamage, true, true);
    if (dealt > 0 && o.alive) beginWallSlam(o, nx, 0, { knockback: 1100, wallSlams: 1, slamDamage: 4 });
    if (!reduceMotion) { shake = Math.max(shake, 22); hitStop = Math.max(hitStop, 0.1); }
  } else if (L.outcome === "hurt") {
    // They muscle through it and get him.
    var dealt2 = hurt(t, cc.hurtDamage, "igbb", o.id);
    t.flash = 0.16;
    floater(t.x, t.y - t.r - 34, L.w === "saber" ? "SABER SLASH!" : L.w === "katana" ? "KATANA SLASH!" : L.w === "blade" ? (o.rapier ? "RAPIER SLASH!" : "DIAMOND SLASH!") : (o.cheater && o.cheater.club ? "WHACK!" : "CRACK!"), "crit");
    if (L.w === "saber") playSaberHit(true); else if (L.w === "bat") playBatHit(true); else playSwordClash(1.4);
    if (dealt2 > 0 && t.alive) beginWallSlam(t, -nx, 0, { knockback: 1100, wallSlams: 1, slamDamage: 4 });
    if (!reduceMotion) { shake = Math.max(shake, 20); hitStop = Math.max(hitStop, 0.08); }
  } else {
    // He twists their weapon out of their hands.
    floater(o.x, o.y - o.r - 34, "DISARMED!", "crit");
    playSwordClash(1.6);
    if (L.w === "saber") startForce(o, t, nx, 0); // Hokit pulls it back with the Force and pushes him away (hokit-darkside.js)
    else {
      var oh = bladeHost(o), blade = oh && oh.sword ? (o.rapier ? "rapier" : "longsword") : null;
      flyingBats.push({ x: o.x + nx * o.r * 0.5, y: o.y - o.r * 0.4, vx: nx * 380, vy: -820, rot: 0, spin: 19, t: 0, len: blade ? o.r * bladeLen(o) : weaponLen(o), trail: [], club: !!(o.cheater && o.cheater.club), blade: blade });
      if (o.cheater) { o.cheater = null; o.weaponLost = true; } // the bat or club is gone for the fight
      if (blade) { oh.sword = null; oh.disarmed = true; } // and so is a sword
      o.vx = nx * 380;
    }
  }
  crowdReact(1);
  checkEnd();
}

// ---------------------------------------------------------------- drawing

// From the fighter's transform in draw(): his body twisting into a cut,
// leaning into the finisher's dash.
function applyProchazkaPose(b) {
  var m = samuraiOn(b) ? b.igbb : null, cfg = jpSam(b), rot = 0, sx = 1, sy = 1;
  if (!m || !cfg) return;
  if (m.phase === "close" && m.sl && m.sl.kind === "spin") rot = jpSpinPose(m.sl); // turning with the whirlwind (jiri-spin.js)
  else if (m.phase === "close" && m.sl) {
    var sl = m.sl, T = cfg.tell, S = cfg.swing;
    if (sl.t < T) rot = sl.side * 0.28 * jpEase(sl.t / T);
    else if (sl.t < T + S) rot = sl.side * (0.28 - 0.62 * jpEaseOut((sl.t - T) / S));
    else rot = sl.side * -0.34 * (1 - jpEase((sl.t - T - S) / cfg.recover));
    if (sl.both) rot *= 0.4;
  } else if (m.phase === "final") {
    var F = cfg.finisher;
    if (m.t < F.tell) { var k = jpEase(m.t / 0.25); sx = 1 + 0.05 * k; sy = 1 - 0.08 * k; }
    else if (!m.fHit) { sx = 1.2; sy = 0.84; }
  }
  if (rot || sx !== 1) { ctx.translate(b.x, b.y); ctx.rotate(rot); ctx.scale(sx, sy); ctx.translate(-b.x, -b.y); }
}

// From draw(), for each fighter: his hands down by his hips, the crack of a
// critical hit on his chin, and through the samurai the ink, the swords in
// his belt and the two katanas.
function drawProchazka(b, other) {
  var cfg = jpCfg(b);
  if (!cfg || !b.alive) return;
  if (b.jpCrit > 0) jpDrawChinCrack(b);
  if (typeof jpDrawPhantom === "function" && jpDrawPhantom(b)) return; // the imaginary cut (jiri-phantom.js)
  if (!samuraiOn(b)) {
    if (b.jpLookOff) jpDrawBelt(b, true); // (won it as a samurai: the kimono and the swords stay on)
    if (cfg.handsLow && jpHandsFree(b)) jpDrawHandsLow(b, other);
    return;
  }
  var m = b.igbb, sam = jpSam(b), ang = m.ang || 0;
  if (m.phase === "dream") { jpDrawGassho(b); return; }
  jpDrawBelt(b, m.phase === "outfit" || (m.phase === "iai" && m.iai.clicked));
  if (m.phase === "outfit") { jpDrawHandsLow(b, other); jpDrawInkWipe(b, m.t / sam.outfit); return; }
  if (m.phase === "iai") { jpDrawIai(b, sam, m); return; }
  if (samuraiLockHeld(b)) { jpDrawLockArms(b, ang); return; }
  if (m.phase === "draw" || m.phase === "sheathe") {
    var k = m.phase === "draw" ? m.t / sam.draw : 1 - m.t / JP_SHEATHE;
    [1, -1].forEach(function (s) {
      var u = jpEase((k - (s > 0 ? 0 : 0.25)) / 0.75), g = jpGuard(b, ang, s), h = jpHilt(b, s);
      var hand = { x: h.x + (g.hand.x - h.x) * u, y: h.y + (g.hand.y - h.y) * u };
      var ba = jpLerpA(-Math.PI * 0.8, g.ba, u);
      jpArm(b, ang, s, hand, ba, b.r * (s > 0 ? JP_LONG : JP_SHORT) * u, m.phase === "draw" && u > 0.9 ? 0.6 : 0);
    });
    return;
  }
  if (m.phase === "final") { jpDrawFinal(b, other, sam, m, ang); return; }
  // The run.
  var sl = m.sl;
  if (sl && sl.kind === "spin") { jpDrawSpin(b, sam, m); return; } // the whirlwind (jiri-spin.js)
  if (sl && sl.t < sam.tell) jpDrawTell(b, other, sam, m);
  [1, -1].forEach(function (s) {
    var len = b.r * (s > 0 ? JP_LONG : JP_SHORT);
    if (sl && (sl.both || sl.side === s)) {
      var P = jpSwingPose(b, ang, s, sl, sam);
      if (P.trail) {
        var pts = [];
        for (var i = 0; i <= 10; i++) {
          var Q = jpSwingPose(b, ang, s, { t: Math.max(sam.tell, sl.t - 0.09 + i * 0.009), side: sl.side, both: sl.both }, sam);
          pts.push({ m: { x: Q.hand.x + Math.cos(Q.ba) * len * 0.3, y: Q.hand.y + Math.sin(Q.ba) * len * 0.3 }, t: { x: Q.hand.x + Math.cos(Q.ba) * len, y: Q.hand.y + Math.sin(Q.ba) * len } });
        }
        katTrail(pts, P.trail); // (ferguson-katanas.js)
      }
      jpArm(b, ang, s, P.hand, P.ba, len, P.glow);
    } else {
      var g = jpGuard(b, ang, s);
      jpArm(b, ang, s, g.hand, g.ba, len, 0);
    }
  });
}

// Where things sit, round him: a point at angle `a`, `k` radii out.
function jpAt(b, a, k) { return { x: b.x + Math.cos(a) * b.r * k, y: b.y + Math.sin(a) * b.r * k }; }
function jpLerpA(a, c, u) { var d = Math.atan2(Math.sin(c - a), Math.cos(c - a)); return a + d * u; }
// The guard: both swords out in front, crossing at the tips (Niten Ichi-ryu),
// swaying a little.
function jpGuard(b, ang, s) {
  var sway = Math.sin(jpClock * 3.1 + s) * 0.05;
  return { hand: jpAt(b, ang + s * 0.62 + sway, 1.0), ba: ang - s * (s > 0 ? 0.38 : 0.46) + sway };
}
// Where the hilts sit in his belt (his left hip, screen left).
function jpHilt(b, s) { return { x: b.x - b.r * (0.22 + (s > 0 ? 0 : 0.1)), y: b.y + b.r * (0.22 + (s > 0 ? 0 : 0.06)) }; }
// One cut: the blade up over his shoulder (tell), ripped through (swing),
// then back to guard (recover). Returns the hand, blade angle, glow and how
// much trail to draw.
function jpSwingPose(b, ang, s, sl, sam) {
  var T = sam.tell, S = sam.swing, R = sam.recover, g = jpGuard(b, ang, s), out = { trail: 0, glow: 0 };
  var upTh = ang + s * 1.35, upBa = ang + s * 2.55, endTh = ang - s * 0.8, endBa = ang - s * 1.55;
  if (sl.t < T) {
    var u = jpEase(sl.t / (T * 0.6));
    out.hand = jpAt(b, jpLerpA(ang + s * 0.62, upTh, u), 1.0 - 0.12 * u);
    out.ba = jpLerpA(g.ba, upBa, u);
    out.glow = sl.t > T * 0.6 ? 0.5 + 0.5 * Math.sin(jpClock * 40) : 0;
  } else if (sl.t < T + S) {
    var v = jpEaseOut((sl.t - T) / S);
    out.hand = jpAt(b, jpLerpA(upTh, endTh, v), 0.88 + Math.sin(v * Math.PI) * 0.5);
    out.ba = jpLerpA(upBa, endBa, v);
    out.trail = 1;
  } else {
    var w = jpEase((sl.t - T - S) / R);
    out.hand = jpAt(b, jpLerpA(endTh, ang + s * 0.62, w), 1.0);
    out.ba = jpLerpA(endBa, g.ba, w);
    out.trail = Math.max(0, 1 - w * 2);
  }
  return out;
}

// One arm with its sword: shoulder, a slight bend at the elbow, the glove on
// the grip, the guard and the blade (Tony's katana, katBlade, ferguson-katanas.js).
function jpArm(b, ang, s, hand, ba, len, glow) {
  var r = b.r, limb = ((b.char.punch && b.char.punch.size) || 14) * 0.7;
  var sh = jpAt(b, ang + s * 1.2, 0.62);
  var mx = (sh.x + hand.x) / 2, my = (sh.y + hand.y) / 2, ex = hand.x - sh.x, ey = hand.y - sh.y, el = Math.sqrt(ex * ex + ey * ey) || 1;
  var elb = { x: mx - ey / el * s * r * 0.16, y: my + ex / el * s * r * 0.16 };
  var cx = Math.cos(ba), cy = Math.sin(ba);
  // the grip, wrapped white with dark diamonds, behind the hand
  ctx.save(); ctx.lineCap = "round";
  ctx.strokeStyle = "#1a1714"; ctx.lineWidth = limb * 0.7;
  ctx.beginPath(); ctx.moveTo(hand.x - cx * r * 0.42, hand.y - cy * r * 0.42); ctx.lineTo(hand.x, hand.y); ctx.stroke();
  ctx.strokeStyle = "#ece6d8"; ctx.lineWidth = limb * 0.45;
  ctx.beginPath(); ctx.moveTo(hand.x - cx * r * 0.4, hand.y - cy * r * 0.4); ctx.lineTo(hand.x, hand.y); ctx.stroke();
  ctx.restore();
  if (len > 1) katBlade(hand, ba, len, s, glow);
  // the round guard (tsuba)
  ctx.fillStyle = "#2a2622"; ctx.strokeStyle = "#c8a24a"; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.ellipse(hand.x + cx * 2, hand.y + cy * 2, limb * 0.3, limb * 0.62, ba, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  strokeLimb(limb, armColor(b.char, s), function () { ctx.moveTo(sh.x, sh.y); ctx.quadraticCurveTo(elb.x, elb.y, hand.x, hand.y); });
  drawGloveAt(hand.x, hand.y, limb * 0.72, b.char, ba);
}

// Cut down: swept back behind him through the dash, then out to the sides
// with his back to them (zanshin), then slid home one after the other, and
// his hands resting on the hilts at the click.
function jpDrawIai(b, sam, m) {
  var I = m.iai, C = sam.iai, t = m.t, ang = I.ang, hold = JP_IAI_DASH + C.hold;
  if (I.ghosts.length > 1 && t < JP_IAI_DASH + 0.3) katGhosts(b, I.ghosts, t < JP_IAI_DASH ? 1 : Math.max(0, 1 - (t - JP_IAI_DASH) / 0.3)); // (ferguson-katanas.js)
  if (I.clicked) { jpDrawHandsOnHilts(b); return; }
  [1, -1].forEach(function (s) {
    var len = b.r * (s > 0 ? JP_LONG : JP_SHORT);
    var dH = jpAt(b, ang + s * 0.55, 0.9), dBa = ang + Math.PI - s * 0.35; // swept back behind him
    var zH = jpAt(b, ang + s * 1.35, 1.0), zBa = ang + s * 1.95;          // out to the sides, a little back
    var k = jpEase((t - JP_IAI_DASH) / 0.12), glow = 0, L = len;
    var hand = { x: dH.x + (zH.x - dH.x) * k, y: dH.y + (zH.y - dH.y) * k }, ba = jpLerpA(dBa, zBa, k);
    if (t >= hold) {
      var u = 1 - jpEase((t - hold - (s > 0 ? 0 : 0.1)) / Math.max(0.05, C.sheathe - 0.1)), h = jpHilt(b, s);
      hand = { x: h.x + (hand.x - h.x) * u, y: h.y + (hand.y - h.y) * u };
      ba = jpLerpA(Math.PI * 0.8, ba, u); L = len * u;
    } else if (t > JP_IAI_DASH + 0.1 && t < JP_IAI_DASH + 0.32) glow = 0.8; // a glint off both blades
    jpArm(b, ang, s, hand, ba, L, glow);
  });
}
function jpDrawHandsOnHilts(b) {
  var r = b.r, size = ((b.char.punch && b.char.punch.size) || 14) * 0.7;
  [[1, -0.16], [-1, 0.08]].forEach(function (q) {
    var h = jpHilt(b, q[0]), ha = Math.PI * 1.8 + q[1];
    drawGloveAt(h.x + Math.cos(ha) * r * 0.3, h.y + Math.sin(ha) * r * 0.3, size * 0.85, b.char, ha);
  });
}

// His gloves down by his hips, swaying (hands low).
function jpDrawHandsLow(b, other) {
  var r = b.r, size = ((b.char.punch && b.char.punch.size) || 14) * 0.7;
  [-1, 1].forEach(function (s) {
    var sw = Math.sin(jpClock * 4.2 + s * 1.3 + b.id) * 0.05;
    var hx = b.x + s * r * (1.0 + sw), hy = b.y + r * (0.42 + Math.abs(sw) * 0.6);
    drawGloveAt(hx, hy, size * 0.95, b.char, Math.PI / 2 - s * 0.35);
  });
}
// Palms together in front of his chest, eyes shut: dreaming.
function jpDrawGassho(b) {
  var r = b.r, size = ((b.char.punch && b.char.punch.size) || 14) * 0.7;
  [-1, 1].forEach(function (s) { drawGloveAt(b.x + s * r * 0.18, b.y + r * 0.05, size * 0.85, b.char, -Math.PI / 2); });
}
// The crack of a critical hit across his chin: white lines from the jaw, fading.
function jpDrawChinCrack(b) {
  var k = b.jpCrit / 0.4, r = b.r;
  ctx.save();
  ctx.globalAlpha = Math.min(1, k * 1.5);
  ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 2.5; ctx.lineCap = "round"; ctx.lineJoin = "round";
  var cx = b.x + r * 0.05, cy = b.y - r * 0.32;
  [[-0.5, -0.15, -0.3, 0.05], [0.45, -0.2, 0.25, 0.1], [0.05, -0.5, -0.05, -0.25]].forEach(function (q) {
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + q[2] * r, cy + q[3] * r); ctx.lineTo(cx + q[0] * r, cy + q[1] * r); ctx.stroke();
  });
  ctx.fillStyle = "#ffffff"; ctx.beginPath(); ctx.arc(cx, cy, r * 0.09 * (1 + (1 - k)), 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

// The two swords in his belt: black lacquered scabbards out past his left hip
// with red cords, and (before the draw) the white-wrapped hilts.
function jpDrawBelt(b, hilts) {
  var r = b.r;
  ctx.save(); ctx.lineCap = "round";
  [[1, 1.45, -0.16], [-1, 1.0, 0.08]].forEach(function (q) {
    var s = q[0], h = jpHilt(b, s), a = Math.PI * 0.8 + q[2], len = r * q[1];
    var ex = h.x + Math.cos(a) * len, ey = h.y + Math.sin(a) * len;
    ctx.strokeStyle = theme.wall; ctx.lineWidth = r * 0.2;
    ctx.beginPath(); ctx.moveTo(h.x, h.y); ctx.lineTo(ex, ey); ctx.stroke();
    ctx.strokeStyle = "#1b1a1f"; ctx.lineWidth = r * 0.13;
    ctx.beginPath(); ctx.moveTo(h.x, h.y); ctx.lineTo(ex, ey); ctx.stroke();
    ctx.strokeStyle = "rgba(255,255,255,0.25)"; ctx.lineWidth = r * 0.03;
    ctx.beginPath(); ctx.moveTo(h.x + Math.cos(a) * r * 0.2, h.y + Math.sin(a) * r * 0.2 - r * 0.03); ctx.lineTo(ex, ey - r * 0.03); ctx.stroke();
    ctx.strokeStyle = JP_RED; ctx.lineWidth = r * 0.05; // the cord
    ctx.beginPath(); ctx.moveTo(h.x + Math.cos(a) * r * 0.22, h.y + Math.sin(a) * r * 0.22); ctx.quadraticCurveTo(h.x + Math.cos(a) * r * 0.35, h.y + r * 0.2, h.x + Math.cos(a) * r * 0.5, h.y + Math.sin(a) * r * 0.5); ctx.stroke();
    if (hilts) {
      var ha = a + Math.PI, hx = h.x + Math.cos(ha) * r * 0.48, hy = h.y + Math.sin(ha) * r * 0.48;
      ctx.strokeStyle = theme.wall; ctx.lineWidth = r * 0.17;
      ctx.beginPath(); ctx.moveTo(h.x, h.y); ctx.lineTo(hx, hy); ctx.stroke();
      ctx.strokeStyle = "#ece6d8"; ctx.lineWidth = r * 0.1;
      ctx.beginPath(); ctx.moveTo(h.x, h.y); ctx.lineTo(hx, hy); ctx.stroke();
      ctx.fillStyle = "#c8a24a";
      ctx.beginPath(); ctx.arc(h.x, h.y, r * 0.09, 0, Math.PI * 2); ctx.fill();
    }
  });
  ctx.restore();
}

// The outfit coming on: a blot of ink over him that breaks up and drips away.
function jpDrawInkWipe(b, u) {
  if (u >= 1) return;
  var r = b.r, k = jpEaseOut(u);
  ctx.save();
  ctx.globalAlpha = Math.max(0, 1 - k * 1.15);
  ctx.fillStyle = JP_INK;
  var rnd = artRand(7 + b.id);
  for (var i = 0; i < 9; i++) {
    var a = rnd() * Math.PI * 2, dd = r * (0.15 + rnd() * 0.5) * (1 + k * 1.6), rr = r * (0.45 + rnd() * 0.35) * (1 - k * 0.7);
    ctx.beginPath(); ctx.arc(b.x + Math.cos(a) * dd, b.y + Math.sin(a) * dd, Math.max(0.5, rr), 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

// The red arc of a cut coming (follows them, then locks on).
function jpDrawTell(b, other, sam, m) {
  var sl = m.sl, k = sl.t / sam.tell, locked = sl.t >= sam.tell * 0.7, arc = sam.arc || 1.2;
  var R = b.r + other.r * 0.9 + sam.reach + 8, a0 = m.ang - arc / 2, a1 = m.ang + arc / 2;
  ctx.save();
  ctx.globalAlpha = (locked ? 0.9 : 0.5) * Math.min(1, k * 3);
  ctx.fillStyle = "rgba(200,16,46,0.2)";
  ctx.beginPath(); ctx.moveTo(b.x, b.y); ctx.arc(b.x, b.y, R, a0, a1); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = locked ? "#ff2a3a" : "rgba(200,16,46,0.85)"; ctx.lineWidth = locked ? 4 : 3; ctx.lineCap = "round";
  ctx.beginPath(); ctx.arc(b.x, b.y, R, a0, a1); ctx.stroke();
  if (locked && !reduceMotion) { ctx.globalAlpha = 0.4 + 0.4 * Math.sin(jpClock * 50); ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(b.x, b.y, R, a0, a1); ctx.stroke(); }
  ctx.restore();
}

// The finisher: both swords up behind his head, the red line, the dash and
// the cut through.
function jpDrawFinal(b, other, sam, m, ang) {
  var F = sam.finisher, t = m.t;
  var fa = m.fAng != null ? m.fAng : ang;
  if (!m.fHit || m.fMiss) {
    // the line
    var len = m.fLocked ? m.fLen : Math.sqrt((other.x - b.x) * (other.x - b.x) + (other.y - b.y) * (other.y - b.y)) + other.r;
    var x0 = m.fLocked && m.fRun > 0 ? b.x - Math.cos(fa) * m.fRun : b.x, y0 = m.fLocked && m.fRun > 0 ? b.y - Math.sin(fa) * m.fRun : b.y;
    if (t < F.tell + 0.2) {
      ctx.save(); ctx.lineCap = "round";
      ctx.globalAlpha = Math.min(1, t / 0.2) * (m.fLocked ? 0.9 : 0.55);
      ctx.strokeStyle = "rgba(200,16,46,0.35)"; ctx.lineWidth = b.r * 1.3;
      ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x0 + Math.cos(fa) * len, y0 + Math.sin(fa) * len); ctx.stroke();
      ctx.strokeStyle = m.fLocked && !reduceMotion && Math.sin(jpClock * 45) > 0 ? "#ffffff" : "#ff2a3a"; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x0 + Math.cos(fa) * len, y0 + Math.sin(fa) * len); ctx.stroke();
      ctx.restore();
    }
  }
  if (m.ghosts && m.ghosts.length > 1 && (!m.fHit || t < m.fT + 0.3)) katGhosts(b, m.ghosts, m.fHit ? Math.max(0, 1 - (t - m.fT) / 0.3) : 1); // (ferguson-katanas.js)
  [1, -1].forEach(function (s) {
    var len2 = b.r * (s > 0 ? JP_LONG : JP_SHORT), hand, ba, glow = 0, g = jpGuard(b, fa, s);
    if (!m.fHit && t < F.tell + 0.02) {
      // raised up behind his head, glinting
      var u = jpEase(t / 0.3);
      hand = jpAt(b, jpLerpA(fa + s * 0.62, fa + s * 1.9, u), 1.0 - 0.25 * u);
      ba = jpLerpA(g.ba, fa + s * 2.85, u);
      glow = t > 0.3 ? 0.5 + 0.5 * Math.sin(jpClock * 30) : 0;
    } else if (!m.fHit) {
      hand = jpAt(b, fa + s * 1.9, 0.75); ba = fa + s * 2.85; glow = 0.8;
    } else {
      // ripped down through them, crossing, then held out
      var v = jpEaseOut((t - m.fT) / 0.12);
      hand = jpAt(b, jpLerpA(fa + s * 1.9, fa - s * 0.75, v), 0.75 + Math.sin(v * Math.PI) * 0.4);
      ba = jpLerpA(fa + s * 2.85, fa - s * 1.7, v);
      if (v < 1) {
        var pts = [];
        for (var i = 0; i <= 8; i++) {
          var q = jpEaseOut(Math.max(0, (t - m.fT) / 0.12 - 0.5 + i * 0.06));
          var hh = jpAt(b, jpLerpA(fa + s * 1.9, fa - s * 0.75, q), 0.75 + Math.sin(q * Math.PI) * 0.4), bb = jpLerpA(fa + s * 2.85, fa - s * 1.7, q);
          pts.push({ m: { x: hh.x + Math.cos(bb) * len2 * 0.3, y: hh.y + Math.sin(bb) * len2 * 0.3 }, t: { x: hh.x + Math.cos(bb) * len2, y: hh.y + Math.sin(bb) * len2 } });
        }
        katTrail(pts, 1);
      }
    }
    jpArm(b, fa, s, hand, ba, len2, glow);
  });
}

// In the lock: both arms forward, the blades angled up into theirs, straining.
function jpDrawLockArms(b, ang) {
  var lp = jpLockPoint(), jt = !reduceMotion ? Math.sin(jpClock * 47) * 0.04 : 0;
  var lang = Math.atan2(lp.y - b.y, lp.x - b.x);
  [1, -1].forEach(function (s) {
    var hand = jpAt(b, lang + s * 0.45, 1.05);
    jpArm(b, lang, s, hand, Math.atan2(lp.y - hand.y, lp.x - hand.x) + jt + s * 0.05, b.r * (s > 0 ? JP_LONG : JP_SHORT) * 0.92, 0.35 + 0.25 * Math.sin(jpClock * 25));
  });
}

// From draw(), over both fighters: a slash line across whoever got cut
// (white, then red, fading) and the big X.
function drawProchazkaOver() {
  jpCuts.forEach(function (f) {
    var o = balls[f.id];
    if (!o) return;
    if (f.kind === "hair") { jpDrawHairline(o, f); return; }
    var k = f.t / f.max, R = o.r * 1.5, lines = f.kind === "x" ? [f.ang + Math.PI / 4, f.ang - Math.PI / 4] : [f.ang];
    ctx.save(); ctx.lineCap = "round";
    lines.forEach(function (a, i) {
      var grow = jpClamp((f.t - i * 0.05) / 0.06), cx = Math.cos(a), cy = Math.sin(a);
      var x0 = o.x - cx * R, y0 = o.y - cy * R, x1 = x0 + cx * 2 * R * grow, y1 = y0 + cy * 2 * R * grow;
      var w = (f.kind === "x" ? 12 : 8) * (1 - k * 0.6);
      ctx.globalAlpha = Math.max(0, 1 - k);
      ctx.strokeStyle = JP_INK; ctx.lineWidth = w + 8; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke(); // an ink edge, brush-like
      ctx.strokeStyle = "rgba(224,32,42,0.95)"; ctx.lineWidth = w + 3; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
      ctx.strokeStyle = "#ffffff"; ctx.lineWidth = w * (k < 0.3 ? 0.8 : 0.4); ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
    });
    ctx.restore();
  });
}

// The cut that hasn't opened yet: a thin white line across them, flickering.
function jpDrawHairline(o, f) {
  var grow = jpClamp(f.t / 0.08), cx = Math.cos(f.ang), cy = Math.sin(f.ang), R = o.r * 1.35;
  ctx.save(); ctx.lineCap = "round";
  ctx.globalAlpha = 0.75 + (reduceMotion ? 0 : 0.25 * Math.sin(jpClock * 38));
  ctx.strokeStyle = "rgba(200,16,46,0.6)"; ctx.lineWidth = 5;
  ctx.beginPath(); ctx.moveTo(o.x - cx * R, o.y - cy * R); ctx.lineTo(o.x - cx * R + cx * 2 * R * grow, o.y - cy * R + cy * 2 * R * grow); ctx.stroke();
  ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(o.x - cx * R, o.y - cy * R); ctx.lineTo(o.x - cx * R + cx * 2 * R * grow, o.y - cy * R + cy * 2 * R * grow); ctx.stroke();
  ctx.restore();
}

// ---------------------------------------------------------------- the dream

// From draw(), over the whole screen (stands and jumbotron too): rice paper
// and ink, an ensō, a red sun and Miyamoto Musashi with his two swords.
function drawProchazkaSky(s, ox, oy) {
  balls.forEach(function (b) {
    var p = jpPhase(b);
    if (p === "dream" || p === "outfit") jpDrawDream(b, s, ox, oy);
  });
  if (jpPetals.length) jpDrawPetals();
  if (jpSlash) jpDrawSlash(s, ox, oy);
}

// Cherry blossom blowing across the whole screen while he's a samurai
// (samurai.petals a second, screen space, visual only: nativeRandom).
function jpTickPetals(dt) {
  var rate = 0;
  balls.forEach(function (b) {
    var p = jpPhase(b), sam = jpSam(b);
    if (sam && sam.petals && p && p !== "dream" && b.alive) rate = Math.max(rate, sam.petals);
  });
  if (reduceMotion) rate = 0;
  if (rate > 0 && jpPetals.length < 70 && nativeRandom() < rate * dt) {
    var fromTop = nativeRandom() < 0.7;
    jpPetals.push({ u: fromTop ? nativeRandom() * 1.1 - 0.15 : -0.05, v: fromTop ? -0.04 : nativeRandom() * 0.7, vu: 0.11 + nativeRandom() * 0.1, vv: 0.13 + nativeRandom() * 0.12,
      rot: nativeRandom() * 6.28, spin: (nativeRandom() - 0.5) * 7, flut: nativeRandom() * 6.28, size: 0.55 + nativeRandom() * 0.6, pink: nativeRandom() < 0.5 });
  }
  jpPetals.forEach(function (q) { q.flut += dt * 5; q.u += (q.vu + Math.sin(q.flut * 0.6) * 0.05) * dt; q.v += q.vv * dt; q.rot += q.spin * dt; });
  jpPetals = jpPetals.filter(function (q) { return q.u < 1.08 && q.v < 1.05; });
}
function jpDrawPetals() {
  var cw = canvas.width, chh = canvas.height, base = Math.min(cw, chh) * 0.018;
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  jpPetals.forEach(function (q) {
    var sz = base * q.size, x = q.u * cw, y = q.v * chh;
    ctx.save(); ctx.translate(x, y); ctx.rotate(q.rot); ctx.scale(1, 0.45 + 0.55 * Math.abs(Math.cos(q.flut)));
    ctx.globalAlpha = 0.92;
    ctx.fillStyle = q.pink ? "#f6b3c6" : "#fbd6df";
    ctx.beginPath(); ctx.moveTo(-sz, 0); ctx.quadraticCurveTo(-sz * 0.2, -sz * 0.9, sz, -sz * 0.15); ctx.lineTo(sz * 0.7, 0); ctx.lineTo(sz, sz * 0.15); ctx.quadraticCurveTo(-sz * 0.2, sz * 0.9, -sz, 0); ctx.fill();
    ctx.fillStyle = "rgba(200,60,100,0.35)";
    ctx.beginPath(); ctx.ellipse(-sz * 0.55, 0, sz * 0.3, sz * 0.18, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  });
  ctx.restore();
}
// The cut opening: one brush stroke of ink and red right across the screen
// through them, and a white flash.
function jpDrawSlash(s, ox, oy) {
  var f = jpSlash, k = f.t / f.max, grow = jpEaseOut(f.t / 0.1), cx = Math.cos(f.ang), cy = Math.sin(f.ang), R = 900;
  ctx.save();
  if (f.t < 0.16 && !reduceMotion) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = 0.85 * (1 - f.t / 0.16); ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  ctx.setTransform(s, 0, 0, s, ox, oy);
  var x0 = f.x - cx * R, y0 = f.y - cy * R, x1 = x0 + cx * 2 * R * grow, y1 = y0 + cy * 2 * R * grow;
  var fade = k < 0.6 ? 1 : 1 - (k - 0.6) / 0.4, w = 16 * (1 - k * 0.5);
  ctx.lineCap = "round"; ctx.globalAlpha = fade;
  ctx.strokeStyle = JP_INK; ctx.lineWidth = w + 12; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
  ctx.strokeStyle = "rgba(224,32,42,0.95)"; ctx.lineWidth = w + 3; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
  ctx.strokeStyle = "#ffffff"; ctx.lineWidth = Math.max(1.5, w * 0.35); ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
  // ink spattered off the stroke
  ctx.fillStyle = JP_INK;
  for (var i = 0; i < 9; i++) {
    var a = (i * 0.37) % 1, along = (a - 0.5) * 2 * 240, off = ((i * 0.61) % 1 - 0.5) * 34, rr = 2 + (i % 3) * 1.6;
    ctx.globalAlpha = fade * 0.85;
    ctx.beginPath(); ctx.arc(f.x + cx * along - cy * off, f.y + cy * along + cx * off, rr, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}
function jpDrawDream(b, s, ox, oy) {
  var m = b.igbb, sam = jpSam(b), D = sam.dream;
  var a = m.phase === "dream" ? jpClamp(m.t / 0.25) : 1 - jpClamp(m.t / 0.35);
  if (a <= 0) return;
  var u = m.phase === "dream" ? m.t : D + m.t; // seconds into the vision
  ctx.save();
  // Rice paper over everything, darker at the edges.
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  var cw = canvas.width, chh = canvas.height, g = ctx.createRadialGradient(cw / 2, chh / 2, Math.min(cw, chh) * 0.15, cw / 2, chh / 2, Math.max(cw, chh) * 0.75);
  g.addColorStop(0, "#f3ebd9"); g.addColorStop(0.65, "#e6d9bd"); g.addColorStop(1, "#bfae8b");
  ctx.globalAlpha = 0.96 * a; ctx.fillStyle = g; ctx.fillRect(0, 0, cw, chh);
  ctx.setTransform(s, 0, 0, s, ox, oy);
  var cx = W / 2;
  // Mountains in the mist.
  ctx.globalAlpha = a * jpClamp((u - 0.05) / 0.4) * 0.55;
  jpMountains(H * 0.6, "#a59c8c", 0); jpMountains(H * 0.72, "#7f786c", 1.7);
  // The red sun.
  var sunK = jpEaseOut((u - 0.1) / 0.35);
  ctx.globalAlpha = a * sunK * 0.9; ctx.fillStyle = "#c22a26";
  ctx.beginPath(); ctx.arc(cx, H * 0.46, 70 * (0.85 + 0.15 * sunK), 0, Math.PI * 2); ctx.fill();
  ctx.globalAlpha = a * sunK * 0.35; ctx.beginPath(); ctx.arc(cx + 3, H * 0.46 - 2, 76, 0, Math.PI * 2); ctx.fill();
  // The ensō, brushed round in one stroke.
  jpEnso(cx, H * 0.535, 150, jpClamp((u - 0.25) / 0.6), a);
  // Musashi.
  ctx.globalAlpha = a * jpClamp((u - 0.2) / 0.45);
  jpMusashi(cx, H * 0.81, 255);
  // A brush stroke for the ground under him.
  jpBrushLine(cx - 120, H * 0.815, cx + 125, H * 0.81, 9, jpClamp((u - 0.5) / 0.35), a);
  // His name, and a red seal.
  var tk = jpClamp((u - 0.55) / 0.35);
  ctx.globalAlpha = a * tk;
  ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillStyle = JP_INK;
  ctx.font = '700 20px Georgia, "Times New Roman", serif';
  jpSpaced("MIYAMOTO", cx, 24, 7);
  ctx.font = '900 48px Georgia, "Times New Roman", serif';
  jpSpaced("MUSASHI", cx, 60, 9);
  ctx.globalAlpha = a * jpClamp((u - 0.9) / 0.2);
  jpSeal(W - 58, H - 52, 32);
  ctx.restore();
}
// Text with its letters spread out (letterSpacing where the browser has it).
function jpSpaced(text, x, y, px) {
  if ("letterSpacing" in ctx) { ctx.letterSpacing = px + "px"; ctx.fillText(text, x + px / 2, y); ctx.letterSpacing = "0px"; }
  else ctx.fillText(text, x, y);
}
function jpMountains(y0, col, ph) {
  ctx.fillStyle = col;
  ctx.beginPath(); ctx.moveTo(-20, H + 20); ctx.lineTo(-20, y0 + 40);
  for (var x = -20; x <= W + 40; x += 60) {
    var top = y0 - 40 - 50 * Math.abs(Math.sin(x * 0.011 + ph)) - 25 * Math.sin(x * 0.031 + ph * 2);
    ctx.quadraticCurveTo(x + 15, top, x + 30, y0 - 10 + 20 * Math.sin(x * 0.05 + ph));
  }
  ctx.lineTo(W + 40, H + 20); ctx.closePath(); ctx.fill();
}
// An ensō: one brush stroke round, thick to thin, with dry streaks in it.
function jpEnso(cx, cy, R, k, a) {
  if (k <= 0) return;
  var a0 = Math.PI * 0.62, sweep = Math.PI * 1.85 * jpEaseOut(k), n = 48;
  ctx.save(); ctx.lineCap = "round"; ctx.strokeStyle = JP_INK;
  for (var i = 0; i < n; i++) {
    var u0 = i / n, u1 = (i + 1) / n;
    if (u0 * Math.PI * 1.85 > sweep) break;
    ctx.globalAlpha = a * (0.92 - 0.25 * u0);
    ctx.lineWidth = 22 * (1 - 0.72 * u0) + 3 * Math.sin(u0 * 23);
    ctx.beginPath(); ctx.arc(cx, cy, R + 4 * Math.sin(u0 * 9), a0 + u0 * Math.PI * 1.85, a0 + Math.min(sweep, u1 * Math.PI * 1.85)); ctx.stroke();
  }
  // the dry brush: paper showing through in streaks
  ctx.strokeStyle = "#ecdfc4"; ctx.lineWidth = 1.6; ctx.globalAlpha = a * 0.7;
  [-6, 0, 5].forEach(function (o, j) {
    ctx.beginPath(); ctx.arc(cx, cy, R + o, a0 + Math.PI * (0.9 + j * 0.15), a0 + Math.min(sweep, Math.PI * (1.7 - j * 0.1))); ctx.stroke();
  });
  ctx.restore();
}
function jpBrushLine(x0, y0, x1, y1, w, k, a) {
  if (k <= 0) return;
  ctx.save(); ctx.lineCap = "round"; ctx.strokeStyle = JP_INK;
  var xe = x0 + (x1 - x0) * jpEaseOut(k), ye = y0 + (y1 - y0) * jpEaseOut(k);
  for (var i = 0; i < 4; i++) {
    ctx.globalAlpha = a * (0.55 - i * 0.1); ctx.lineWidth = w - i * 2;
    ctx.beginPath(); ctx.moveTo(x0, y0 + i * 1.5 - 2); ctx.quadraticCurveTo((x0 + xe) / 2, y0 - 6 + i, xe, ye + i * 1.2 - 2); ctx.stroke();
  }
  ctx.restore();
}
// Miyamoto Musashi in ink, after his self-portrait: wide hakama, a kimono
// with long sleeves, a topknot, and a sword held low out from each hand.
function jpMusashi(cx, feet, h) {
  var u = h / 100, ink = JP_INK;
  ctx.save(); ctx.translate(cx, feet); ctx.scale(u, u);
  ctx.fillStyle = ink; ctx.strokeStyle = ink; ctx.lineJoin = "round"; ctx.lineCap = "round";
  // the swords, out and down from each hand
  [[-1, -50, 46], [1, -46, 33]].forEach(function (q) {
    var s = q[0], hx = s * 25, hy = -52;
    ctx.lineWidth = 2.6;
    ctx.beginPath(); ctx.moveTo(hx - s * 4, hy - 4); ctx.lineTo(hx + s * (q[2] * 0.52), hy + q[2] * 0.85); ctx.stroke();
    ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.moveTo(hx + s * (q[2] * 0.52), hy + q[2] * 0.85); ctx.lineTo(hx + s * (q[2] * 0.56), hy + q[2] * 0.93); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(hx + s * 1.5, hy + 2.5, 1.6, 3.2, s * 0.55, 0, Math.PI * 2); ctx.fill(); // the guard
  });
  // hakama: wide, split between the legs
  ctx.beginPath();
  ctx.moveTo(-14, -50); ctx.lineTo(14, -50); ctx.quadraticCurveTo(20, -24, 25, 0); ctx.lineTo(3, 0); ctx.lineTo(0, -18); ctx.lineTo(-3, 0); ctx.lineTo(-25, 0); ctx.quadraticCurveTo(-20, -24, -14, -50);
  ctx.closePath(); ctx.fill();
  // the kimono, shoulders to belt, and its long hanging sleeves
  ctx.beginPath(); ctx.moveTo(-16, -78); ctx.quadraticCurveTo(0, -82, 16, -78); ctx.lineTo(13, -50); ctx.lineTo(-13, -50); ctx.closePath(); ctx.fill();
  [-1, 1].forEach(function (s) {
    ctx.beginPath(); ctx.moveTo(s * 13, -79); ctx.quadraticCurveTo(s * 25, -76, s * 27, -60); ctx.lineTo(s * 26, -50); ctx.lineTo(s * 17, -52); ctx.lineTo(s * 14, -66); ctx.closePath(); ctx.fill();
  });
  // hands
  [-1, 1].forEach(function (s) { ctx.beginPath(); ctx.arc(s * 25, -52, 2.6, 0, Math.PI * 2); ctx.fill(); });
  // head, and the topknot
  ctx.beginPath(); ctx.ellipse(0, -88, 5.6, 6.6, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-1.5, -94); ctx.quadraticCurveTo(0, -101, 5, -99); ctx.quadraticCurveTo(1.5, -97, 1.5, -93.5); ctx.closePath(); ctx.fill();
  // brush texture: paper showing through the hakama and sleeves
  ctx.strokeStyle = "rgba(236,223,196,0.55)"; ctx.lineWidth = 0.6;
  [[-20, -4, -12, -40], [-9, -3, -7, -36], [9, -3, 8, -38], [20, -5, 12, -42], [-22, -55, -17, -72], [22, -56, 17, -73]].forEach(function (q) {
    ctx.beginPath(); ctx.moveTo(q[0], q[1]); ctx.lineTo(q[2], q[3]); ctx.stroke();
  });
  // a few ink spatters at his feet
  ctx.fillStyle = ink;
  [[-31, -3, 1.4], [33, -2, 1.1], [-36, 1, 0.8], [28, 2, 0.9], [38, -6, 0.6]].forEach(function (q) { ctx.beginPath(); ctx.arc(q[0], q[1], q[2], 0, Math.PI * 2); ctx.fill(); });
  ctx.restore();
}
// A red seal stamped in the corner, a brushed mark in it (drawn, no font).
function jpSeal(x, y, w) {
  ctx.save();
  ctx.fillStyle = "#b8231f"; ctx.fillRect(x - w / 2, y - w / 2, w, w);
  ctx.strokeStyle = "#f3ebd9"; ctx.lineWidth = 2.5; ctx.lineCap = "round";
  var q = w * 0.3;
  ctx.beginPath();
  ctx.moveTo(x - q, y - q * 0.6); ctx.lineTo(x + q, y - q * 0.6);
  ctx.moveTo(x, y - q * 1.1); ctx.lineTo(x, y + q * 1.1);
  ctx.moveTo(x - q * 0.8, y + q * 0.2); ctx.lineTo(x - q * 0.2, y + q * 0.9);
  ctx.moveTo(x + q * 0.8, y + q * 0.2); ctx.lineTo(x + q * 0.25, y + q * 0.9);
  ctx.stroke();
  ctx.strokeStyle = "#b8231f"; ctx.lineWidth = 2; ctx.strokeRect(x - w / 2 - 3, y - w / 2 - 3, w + 6, w + 6);
  ctx.restore();
}

// ---------------------------------------------------------------- fighter art

// His war hair (fighter-art.js): the sides short, the top gathered up and
// tied off with a band so it stands straight up like an antenna.
function drawWarHair(c, r, look, ink) {
  var wh = look.warHair || {}, hc = look.hairColor, top = -r * (0.86 + (wh.height || 0.42));
  var lw = Math.max(1.2, r * 0.035);
  c.save(); c.lineJoin = "round"; c.lineCap = "round";
  // the stem, from the crown up to the tie
  var stem = function () {
    c.beginPath();
    c.moveTo(-r * 0.13, -r * 0.8); c.quadraticCurveTo(-r * 0.08, -r * 0.92, -r * 0.07, -r * 1.0);
    c.lineTo(r * 0.07, -r * 1.0); c.quadraticCurveTo(r * 0.08, -r * 0.92, r * 0.13, -r * 0.8); c.closePath();
  };
  // the tuft fanning out above the tie
  var tuft = function () {
    c.beginPath();
    c.moveTo(-r * 0.06, -r * 1.02);
    c.quadraticCurveTo(-r * 0.24, top + r * 0.1, -r * 0.2, top + r * 0.04);
    c.lineTo(-r * 0.09, top + r * 0.1);
    c.lineTo(-r * 0.06, top - r * 0.02);
    c.lineTo(r * 0.01, top + r * 0.07);
    c.lineTo(r * 0.07, top - r * 0.03);
    c.lineTo(r * 0.11, top + r * 0.1);
    c.lineTo(r * 0.22, top + r * 0.06);
    c.quadraticCurveTo(r * 0.22, top + r * 0.16, r * 0.06, -r * 1.02);
    c.closePath();
  };
  var g = c.createLinearGradient(0, top, 0, -r * 0.8);
  g.addColorStop(0, shadeHex(hc, 0.3)); g.addColorStop(1, shadeHex(hc, -0.1));
  c.fillStyle = g;
  tuft(); c.fill(); c.strokeStyle = ink; c.lineWidth = lw; c.stroke();
  stem(); c.fill(); c.stroke();
  c.strokeStyle = shadeHex(hc, 0.45); c.lineWidth = Math.max(1, r * 0.016); c.globalAlpha = 0.7;
  [[-0.04, -0.12], [0.02, 0.0], [0.06, 0.13]].forEach(function (q) {
    c.beginPath(); c.moveTo(q[0] * r, -r * 1.04); c.quadraticCurveTo(q[0] * r, top + r * 0.2, q[1] * r, top + r * 0.08); c.stroke();
  });
  c.globalAlpha = 1;
  // the tie
  c.fillStyle = wh.tie || "#c8102e";
  c.beginPath(); c.roundRect(-r * 0.1, -r * 1.03, r * 0.2, r * 0.09, r * 0.03); c.fill();
  c.strokeStyle = ink; c.lineWidth = Math.max(1, r * 0.025); c.stroke();
  c.restore();
}

// The samurai's kit, over his body (fighter-art.js, before the head): grey
// hakama with its pleats, a dark kimono crossed left over right with the
// white under-collar showing, winged shoulders, white crests and a red obi.
function drawSamuraiKit(c, r, look, ink, lw) {
  var k = look.samurai, kim = k.kimono || "#1c2232", hak = k.hakama || "#3b3f4a";
  c.save(); c.lineJoin = "round"; c.lineCap = "round";
  // hakama
  c.fillStyle = hak; c.fillRect(-r, r * 0.28, r * 2, r * 0.8);
  c.strokeStyle = "rgba(0,0,0,0.38)"; c.lineWidth = lw(0.03);
  [-0.55, -0.27, 0, 0.27, 0.55].forEach(function (x) { c.beginPath(); c.moveTo(x * r, r * 0.36); c.lineTo(x * r * 1.12, r); c.stroke(); });
  c.strokeStyle = "rgba(255,255,255,0.12)";
  [-0.41, -0.13, 0.13, 0.41].forEach(function (x) { c.beginPath(); c.moveTo(x * r, r * 0.36); c.lineTo(x * r * 1.12, r); c.stroke(); });
  // kimono, open in a V down to where the collar crosses
  c.fillStyle = kim;
  c.beginPath();
  c.moveTo(-r, -r * 0.27);
  c.quadraticCurveTo(-r * 0.55, -r * 0.2, -r * 0.22, -r * 0.24);
  c.lineTo(-r * 0.06, r * 0.04);
  c.lineTo(r * 0.22, -r * 0.24);
  c.quadraticCurveTo(r * 0.55, -r * 0.2, r, -r * 0.27);
  c.lineTo(r, r * 0.34); c.lineTo(-r, r * 0.34); c.closePath(); c.fill();
  // winged shoulders (kataginu), stiff and squared off
  c.fillStyle = hak;
  [-1, 1].forEach(function (s) {
    c.beginPath(); c.moveTo(s * r * 0.3, -r * 0.27); c.lineTo(s * r * 1.05, -r * 0.46); c.lineTo(s * r * 1.05, -r * 0.18); c.lineTo(s * r * 0.36, -r * 0.08); c.closePath(); c.fill();
    c.strokeStyle = "rgba(0,0,0,0.45)"; c.lineWidth = lw(0.025); c.stroke();
  });
  // the collar: dark band, white under-collar inside it; his left side over his right
  var collar = function (x0, y0, x1, y1) {
    c.strokeStyle = "#0d0f16"; c.lineWidth = lw(0.15); c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke();
    c.strokeStyle = k.under || "#efe9dc"; c.lineWidth = lw(0.06); c.beginPath(); c.moveTo(x0 - r * 0.02, y0); c.lineTo(x1 - r * 0.02, y1); c.stroke();
  };
  collar(-r * 0.24, -r * 0.27, -r * 0.05, r * 0.05);
  collar(r * 0.24, -r * 0.27, -r * 0.36, r * 0.27);
  // crests on the chest
  c.fillStyle = k.mon || "#efe9dc";
  [-1, 1].forEach(function (s) {
    var x = s * r * 0.55, y = -r * 0.02;
    c.beginPath(); c.arc(x, y, r * 0.075, 0, Math.PI * 2); c.fill();
    c.fillStyle = kim; c.beginPath(); c.arc(x, y, r * 0.035, 0, Math.PI * 2); c.fill();
    c.fillStyle = k.mon || "#efe9dc";
  });
  // the obi and its knot
  c.fillStyle = k.obi || JP_RED; c.fillRect(-r, r * 0.22, r * 2, r * 0.13);
  c.fillStyle = "rgba(0,0,0,0.25)"; c.fillRect(-r, r * 0.32, r * 2, r * 0.03);
  c.fillStyle = k.obi || JP_RED;
  c.beginPath(); c.ellipse(r * 0.18, r * 0.285, r * 0.09, r * 0.06, 0, 0, Math.PI * 2); c.fill();
  // light from the top left
  var sg = c.createLinearGradient(-r, -r * 0.3, r, r);
  sg.addColorStop(0, "rgba(255,255,255,0.12)"); sg.addColorStop(1, "rgba(0,0,0,0.2)");
  c.fillStyle = sg; c.fillRect(-r, -r * 0.46, r * 2, r * 1.5);
  c.restore();
}

// ---------------------------------------------------------------- gallery

// The special's card (gallery.js): its numbers live under prochazka.samurai.
function samuraiSpecialInfo(sp) {
  var ch = (typeof customChars !== "undefined" ? customChars : []).filter(function (c) { return c.special === sp; })[0] || findChar("c-jiri-prochazka");
  var s = jpSam({ char: ch });
  if (!s) return "";
  var F = s.finisher || {}, ko = s.ko || {};
  return "It charges over the fight, so now and then it just goes off (faster the more hurt he is), and once every fight it's guaranteed: the first time he drops under " + Math.round(s.lowHp * 100) + "% health, or they drop under " + Math.round(s.oppLowHp * 100) + "%. He dreams of Miyamoto Musashi: the screen turns to rice paper and ink, a gong, a shakuhachi, Musashi with his two swords in front of a red sun. The world stops while he dreams. Ink bursts off him and he's a samurai: kimono, hakama, a white headband and two swords in his belt, with cherry blossom blowing across the screen. He draws both (the tell) and for " + secs(s.time) + " hunts them down: every cut shows a red arc first, then " + s.damage + " damage, " + s.critChance + "% crits for " + s.critMult + "x that can open a cut, and one cut in " + s.xEvery + " is both swords at once (" + s.xMult + "x)." + (ko.below ? " Under " + Math.round(ko.below * 100) + "% health, a clean cut cuts them down " + ko.chance + "% of the time: he's through them in a blink, stands with his back to them, slides both swords home, and at the click the cut opens across the whole screen and they fall." : "") + " It ends with NITEN ICHI-RYU: both swords up, a red line, a dash down it for " + F.damage + " into the cage. His katanas clash with Tony's katanas, swords, sabers and bats, and the " + (s.clash && s.clash.lockAfter === 2 ? "second" : "next") + " clash is a blade lock.";
}

// The fighter card's move list (gallery.js).
function prochazkaGalleryMoves(ch, add) {
  var p = ch.prochazka;
  if (!p) return;
  if (p.handsLow) add("🙌", "Hands low", "Fights with his gloves down by his hips. No block at all: he weaves instead.");
  if (p.chin) add("💥", "Chin", "With his hands that low, " + p.chin.critChance + "% of the strikes that land on him are critical hits for " + p.chin.critMult + "x.");
  if (typeof jpSpinGalleryMove === "function") jpSpinGalleryMove(p, add); // the whirlwind (jiri-spin.js)
  if (typeof jpPhantomGalleryMove === "function") jpPhantomGalleryMove(p, add); // the imaginary cut (jiri-phantom.js)
  if (typeof jpReactGalleryMoves === "function") jpReactGalleryMoves(p, add); // the quick draw and the leprechauns (jiri-react.js)
  if (p.samurai && p.samurai.vsTony) add("⚔️", "Katanas vs katanas", "Against Tony Ferguson, Tony's katanas come out to meet the samurai " + p.samurai.vsTony.answerChance + "% of the time.");
}

function prochazkaGallerySounds(groups, synth) {
  groups.push({ title: "Jiří Procházka", items: [
    synth("The dream", "A gong and a shakuhachi as he dreams of Musashi.", function () { playSamuraiDream(); }),
    synth("Samurai", "The taiko as the kimono comes on (and on the finisher).", function () { playSamuraiTaiko(); }),
    synth("Glint", "A blade going up, the tell before a cut.", function () { playSamuraiGlint(false); }),
    synth("Click", "The sword going home before the cut opens.", function () { playSheatheClick(); }),
    synth("Chin", "A critical hit cracking off his chin.", function () { playChinCrack(); })
  ] });
}

// ---------------------------------------------------------------- sound
// Synth stand-ins: no audio files.

function jpAudio(fn) {
  try {
    var ac = getAudioCtx();
    if (!ac) return;
    if (ac.state === "suspended") ac.resume();
    fn(ac, ac.currentTime);
  } catch (e) { /* never let audio break the game */ }
}
// The dream: a big temple gong (inharmonic partials swelling and ringing
// out) and a breathy shakuhachi note that bends up into its pitch.
function playSamuraiDream() {
  jpAudio(function (ac, t) {
    var out = ac.createGain(); out.gain.value = 0.55; out.connect(ac.destination);
    [[98, 0.5, 4.2], [149, 0.32, 3.4], [199, 0.26, 3.0], [268, 0.18, 2.4], [323, 0.14, 2.0], [404, 0.1, 1.6], [517, 0.06, 1.2]].forEach(function (p, i) {
      var o = ac.createOscillator(), g = ac.createGain();
      o.type = "sine"; o.frequency.setValueAtTime(p[0] * 0.985, t); o.frequency.linearRampToValueAtTime(p[0], t + 0.6);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(p[1], t + 0.02 + i * 0.03); g.gain.exponentialRampToValueAtTime(0.0001, t + p[2]);
      o.connect(g); g.connect(out); o.start(t); o.stop(t + p[2] + 0.05);
    });
    caneBurst(ac, t, 300, 0.8, 0.5, 0.25); // the mallet
    // the shakuhachi
    var t0 = t + 0.35, dur = 1.7, f = 587;
    var fl = ac.createGain(); fl.gain.value = 0.0001; fl.connect(ac.destination);
    fl.gain.setValueAtTime(0.0001, t0); fl.gain.exponentialRampToValueAtTime(0.16, t0 + 0.2); fl.gain.setValueAtTime(0.16, t0 + dur - 0.45); fl.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    var lfo = ac.createOscillator(), lg = ac.createGain();
    lfo.frequency.value = 5.2; lg.gain.setValueAtTime(0, t0); lg.gain.linearRampToValueAtTime(7, t0 + 0.9); lfo.connect(lg);
    [[1, 1], [2, 0.18], [3, 0.06]].forEach(function (h) {
      var o = ac.createOscillator(), g = ac.createGain();
      o.type = "sine"; o.frequency.setValueAtTime(f * 0.94 * h[0], t0); o.frequency.exponentialRampToValueAtTime(f * h[0], t0 + 0.3);
      lg.connect(o.frequency);
      g.gain.value = h[1]; o.connect(g); g.connect(fl); o.start(t0); o.stop(t0 + dur + 0.05);
    });
    lfo.start(t0); lfo.stop(t0 + dur + 0.05);
    // breath through the bamboo, strongest as the note starts
    var nb = ac.createBufferSource(), bp = ac.createBiquadFilter(), ng = ac.createGain();
    nb.buffer = caneNoise(ac); nb.loop = true; bp.type = "bandpass"; bp.frequency.value = 1500; bp.Q.value = 1.4;
    ng.gain.setValueAtTime(0.0001, t0); ng.gain.exponentialRampToValueAtTime(0.09, t0 + 0.08); ng.gain.exponentialRampToValueAtTime(0.025, t0 + 0.4); ng.gain.setValueAtTime(0.025, t0 + dur - 0.4); ng.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    nb.connect(bp); bp.connect(ng); ng.connect(ac.destination); nb.start(t0); nb.stop(t0 + dur + 0.05);
  });
}
// A taiko drum: a deep boom and the skin's slap.
function playSamuraiTaiko() {
  jpAudio(function (ac, t) {
    caneTone(ac, t, "sine", 110, 42, 0.9, 0.55);
    caneTone(ac, t, "triangle", 180, 70, 0.35, 0.18);
    caneBurst(ac, t, 260, 0.9, 0.6, 0.12);
    caneBurst(ac, t, 2400, 1.2, 0.18, 0.05);
  });
}
// A blade going up: a glint of steel (higher and longer for the finisher).
function playSamuraiGlint(big) {
  jpAudio(function (ac, t) {
    caneTone(ac, t, "sine", big ? 3600 : 3900, big ? 3750 : 4050, big ? 0.16 : 0.08, big ? 0.35 : 0.12);
    if (big) caneTone(ac, t + 0.06, "sine", 5400, 5500, 0.08, 0.3);
  });
}
// The guard meeting the scabbard as the sword goes home: a small hard click.
function playSheatheClick() {
  jpAudio(function (ac, t) {
    caneBurst(ac, t, 5200, 3, 0.45, 0.025);
    caneTone(ac, t, "triangle", 2600, 2300, 0.22, 0.05);
    caneTone(ac, t + 0.012, "sine", 1700, 1650, 0.12, 0.08);
  });
}
// A critical hit off his chin: a sharp crack and a thud.
function playChinCrack() {
  jpAudio(function (ac, t) {
    caneBurst(ac, t, 3200, 2, 0.55, 0.05);
    caneTone(ac, t, "triangle", 900, 260, 0.3, 0.09);
    caneTone(ac, t, "sine", 140, 60, 0.4, 0.16);
  });
}
