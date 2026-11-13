// Max Holloway, "Blessed" (Christian, 2026-11-13). Featherweight, on the
// Brawler base. Everything below is set in his character file under
// "holloway" (and his special); leave a block out and that part is off.
//
// Volume     (holloway.volume) the most strikes in the game: he throws combos
//            instead of single punches, off alternating hands, stepping in
//            behind them. How long the combos are (`combo`), what each punch
//            does (`damage`) and the gap between combos (`cooldown`) all go
//            from the first number to the second as his Blessed meter fills.
// Blessed meter  (holloway.blessed) the longer the fight goes and the more he
//            hits you, the better he gets: a bar under his health fills with
//            fight time (`timeFill` a second) and every punch he lands
//            (`hitFill`). "BLESSED!" and "MAX VOLUME!" at the `announce` marks.
// Takedown defense  char.tdd (the sprawl from ilia.js): he stuffs most shots.
// Chin       (holloway.chin) a big single strike (`over` damage or more, from
//            `sources`) does `mult` of its damage (hollowayChin, from hurt).
// Unbothered (holloway.unbothered) `chance`% of the time Conor McGregor's
//            trash talk doesn't make him angry (hollowayShrugs, from conor.js),
//            and against Conor he answers "I support it 100 percent. Keep talking."
// vs Ilia    (holloway.ilia) Ilia Topuria gave him the only knockout loss of
//            his career (UFC 308): no chin against him, and Ilia's shots do
//            `hurt` times as much.
// Guard      (holloway.guardRespect) `chance`% of the times they pull guard he
//            won't follow them down: he stays out of the circle until they
//            stand back up.
// The booth  (holloway.booth) the Calvin Kattar fight (Jan 2021): against a
//            striker he's beating (`lead` health up, the meter past
//            `minMeter`), he turns to the commentators and points: "Count it
//            up!" (his strikes landed come up), then "I'm the best boxer in
//            the UFC, baby!" Meanwhile he slips `slip`% of what they throw
//            without looking and counters each slip (`counter`).
// Flashback  (holloway.flashback) once a fight he thinks back: both fighters
//            hold, the arena goes sepia and a TV comes up over the cage. He's
//            playing an old fighting game, ULTIMATE BALL FIGHTING 2009 (a
//            made-up parody: two balls in a pixel cage, so it's this game
//            too), mashing buttons for a big combo. Then back in the cage it's
//            Button Mash (holloway.mash) for `time` seconds: wild combos, the
//            controller button for each strike popping over his head, a
//            spinning back fist in there now and then, "N HIT COMBO!".
// The Middle  his special (special.move "middle"), "MEET ME IN THE MIDDLE": his real point
//            down, from the Ricardo Lamas fight (2016) to the last-second
//            knockout of Justin Gaethje at UFC 300 (2024). His rule is that
//            only the one winning can call it (onlyWhenWinning), so the full
//            bar waits until he's ahead. He points down at the middle of the
//            cage (the tell), a clock comes up at 0:10, and they walk out to
//            the middle (acceptChance%, Gaethje always) and trade: his fastest
//            punches in the game against their answers. At 0:01 the big right
//            hand: a knockout koBase% of the time, plus koLow% the more hurt
//            they are and koMeter% at a full meter (gaethje.koBonus more
//            against Gaethje, who also has the BMF belt held up over him);
//            otherwise finalDamage and the bell. If they turn it down the
//            crowd boos and he gets declineRefund of his bar back.
// Voice lines  speech bubbles (speech.js). Every one is a real quote (sources
//            next to HW_LINES). A knockout in the middle brings up Joe Rogan's
//            UFC 300 call as the commentator's lower-third (announce).
// The booth and the flashback run on b.hwAct, Button Mash on b.hwMash, the
// special on b.igbb (move "middle"), like every special.
"use strict";

// Registered here rather than in special.js's table (gsp.js does the same).
SPECIAL_MOVES.middle = "The Middle"; // (the call over his head says MEET ME IN THE MIDDLE; the full name runs off the jumbotron)

// Everything he says is something he really said.
var HW_LINES = {
  // To the broadcast booth in the 5th round vs Calvin Kattar, UFC Fight Island 7,
  // Jan 16 2021 (sportskeeda.com; video: twitter.com/espn/status/1350577511957209089)
  count: "Count it up!",
  boxer: "I'm the best boxer in the UFC, baby!",
  // The point down's "official rules", UFC video (Yahoo Sports, Mar 5 2026)
  rules: "The guy who's winning is the one that needs to give you that blessing.",
  noShoot: "If you do call it, please do not step back, guys, or do not shoot or clinch.",
  // How it started, the Ricardo Lamas fight, on the Freestyle Bender podcast (Yahoo Sports / Sherdog, Feb 28 2026)
  bro: "Ten seconds, bro. If you want to be about it, let's see if you about it.",
  // Post-fight news conference after Kattar (ESPN, Jan 16 2021)
  zone: "I was in the zone.",
  // UFC 300 octagon interview, Apr 13 2024 (ESPN; CBS Sports)
  him: "I'm him! I'm him, guys!",
  // His sign-off (YouTube interview, voice-clips manifest hollowayBestIsBlessed)
  blessed: "The best is blessed.",
  // Same interview, about Ilia Topuria (ESPN; Bleacher Report)
  matador: "El Matador, he is running away!",
  // On Conor McGregor's trash talk before UFC 329, MMA Junkie video (Middle Easy, Jul 2026), trimmed
  conor: "I support it 100 percent. Keep talking."
};
// Joe Rogan on the UFC 300 broadcast (MMA Junkie, on Yahoo Sports, Apr 16 2024).
var HW_ROGAN = "I say it's the greatest knockout of all time.";
// The booth on his record night against Calvin Kattar (UFC Fight Island 7, ESPN full fight): goes up at MAX VOLUME!
var HW_VOLUME_CALL = "No fighter in UFC history, guys, in any fight has attempted as many strikes as Max Holloway has tonight.";

var HW_GAETHJE = "c-justin-gaethje", HW_ILIA = "c-ilia-topuria", HW_CONOR = "c-conor-mcgregor";
// Things nobody slips (the same list the weave leaves alone, match.js).
var HW_NO_SLIP = { laser: true, slam: true, grapple: true, finisher: true, flow: true, kickback: true, slugfest: true, kofinal: true, igbb: true, kopunch: true };
// Controller buttons, in the usual colours (generic letters, no logos).
var HW_BTN = { X: "#2f6fe0", Y: "#e8b51f", A: "#2fae4f", B: "#d8352a", RB: "#454b57" };
// Button Mash strikes: what each one is, its button, how often it comes up.
var HW_MOVES = [
  { k: "jab", btn: "X", w: 3, dur: 0.13, hitAt: 0.05 },
  { k: "cross", btn: "Y", w: 3, dur: 0.14, hitAt: 0.055 },
  { k: "hook", btn: "B", w: 3, hook: true, sweep: 0.13 },
  { k: "upper", btn: "A", w: 2, dur: 0.16, hitAt: 0.07 },
  { k: "backfist", btn: "RB", w: 0.7, hook: true, sweep: 0.15, spin: true }
];
var HW_GOLD = "#e8b923";

var hwFlash = null;   // the flashback (one at a time): { id, t, phase, presses, combo, pressT }
var hwClockFx = null; // the 0:10 clock over the cage: { id, n, t, out, flash }
var hwBooth = null;   // the commentary desk while he talks to it: { id, x, t, out }
var hwRing = null;    // the gold ring in the middle of the cage: { id, t, out }
var hwBoo = null;     // the crowd booing a turned-down call: { t }
var hwClock = 0;      // drawing clock
var hwPix = null;     // the flashback TV's pixel screen (an offscreen canvas)

function hwCfg(b) { return b && b.char && b.char.holloway; }
function hwRand(r) { return r[0] + Math.random() * (r[1] - r[0]); }
function hwLerp(a, b, k) { return a + (b - a) * Math.max(0, Math.min(1, k)); }
function hwIs(ch, id) { return !!(ch && String(ch.id).indexOf(id) === 0); }
function hwDist(a, b) { var dx = b.x - a.x, dy = b.y - a.y; return Math.sqrt(dx * dx + dy * dy) || 1; }
// The Blessed meter (0 to 1); with the meter switched off he fights at half.
function hwM(b) { var c = hwCfg(b); return c && c.blessed ? (b.hwM || 0) : 0.5; }
function hwLine(b, key) { var c = hwCfg(b); return !!(c && c.lines && c.lines[key]); }
function middleOn(b) { return !!(b && b.igbb && b.igbb.move === "middle"); }
// At the booth or in the flashback: the speed regulator leaves him alone (physics.js).
function hollowayBusy(b) { return !!(b && b.hwAct); }
// His hands are drawn by drawHolloway (drawHands skips them, draw-attacks.js).
function hollowayHandsBusy(b) {
  if (!b) return false;
  if (b.hwAct) return true;
  var m = middleOn(b) ? b.igbb : null;
  return !!(m && (m.phase === "point" || m.phase === "ko"));
}
function hwKnockable(o) { return o.alive && !o.grappled && !o.grapple && !o.slam && !subLocked(o) && !o.igbb && !o.koOut && !o.dazed; }

// From startMatchSeeded.
function resetHolloway() { hwFlash = null; hwClockFx = null; hwBooth = null; hwRing = null; hwBoo = null; hwClock = 0; }
// From makeBall.
function initHolloway(b) {
  b.hwAct = null; b.hwMash = null; b.hwBtns = []; b.hwSpin = null; b.hwCounter = null;
  var cfg = hwCfg(b);
  if (!cfg) return;
  b.hwM = 0; b.hwT = 0; b.hwLanded = 0;
  b.hwBoothN = 0; b.hwBoothCd = 0;
  b.hwFlashT = cfg.flashback ? hwRand(cfg.flashback.first) : Infinity; b.hwFlashDone = false;
  b.hwSaid = {};
  b.hwGuardSeen = null; b.hwGuardAvoid = false;
}

function hwInterrupted(b) {
  return !b.alive || b.slam || b.grappled || b.grapple || b.sprawl || b.sprawled || subLocked(b) || b.guard || b.koOut ||
    b.shocked || b.dazed || b.dizzy || b.shelled || b.checkStun > 0 || (b.igbb && !middleOn(b));
}

// ---------------------------------------------------------------- Blessed meter

function hwFill(b, amt) {
  var cfg = hwCfg(b), bl = cfg && cfg.blessed;
  if (!bl || !(amt > 0)) return;
  var was = b.hwM;
  b.hwM = Math.min(1, b.hwM + amt);
  var marks = bl.announce || [0.5, 1];
  marks.forEach(function (mk, i) {
    if (was < mk && b.hwM >= mk) {
      floater(b.x, b.y - b.r - 34, i === marks.length - 1 ? "MAX VOLUME!" : "BLESSED!", "crit");
      crowdReact(0.5);
      playHwBlessed(i);
      if (i === 0 && hwLine(b, "blessed") && canSay(b)) say(b, HW_LINES.blessed); // the first BLESSED! mark
      if (i === marks.length - 1 && hwLine(b, "rogan") && !announcer) announce(HW_VOLUME_CALL, { who: "UFC BROADCAST" }); // MAX VOLUME!
    }
  });
}
// One of his punches landed: the meter goes up.
function hwLanded(b, n) {
  var cfg = hwCfg(b);
  if (!cfg) return;
  b.hwLanded += n;
  if (cfg.blessed) hwFill(b, cfg.blessed.hitFill * n);
}

// ---------------------------------------------------------------- abilities loop

// From the abilities loop, before the special: the booth and the flashback,
// and staying out of the guard. True while one of them holds him.
function updateHolloway(self, other, dt) {
  var cfg = hwCfg(self);
  if (!cfg) return false;
  var a = self.hwAct;
  if (a) {
    if (hwInterrupted(self) || over) { endHwAct(self, other); return false; }
    if (a.kind === "booth") return runBooth(self, other, a, cfg.booth, dt);
    if (a.kind === "flash") return runFlashback(self, other, a, cfg, dt);
  }
  if (!started || over || self.igbb) return false;
  hwGuardRespect(self, other, cfg.guardRespect);
  if (self.punch || self.koPunch || hwInterrupted(self) || !inOrdinaryMovement(self)) return false;
  if (hwFlashReady(self, other, cfg)) { startFlashback(self, other); return true; }
  if (hwBoothReady(self, other, cfg.booth)) { startBooth(self, other); return true; }
  return false;
}

// From the abilities loop in place of the normal punch: his volume, or
// Button Mash. True for him (the base punch is skipped), false for anyone else.
function updateHollowayHands(self, other, dt, d) {
  var cfg = hwCfg(self);
  if (!cfg || !cfg.volume || !self.char.hasPunch) return false;
  if (self.hwMash && cfg.mash) hwMashPunch(self, other, dt, d, cfg);
  else hwVolumePunch(self, other, dt, d, cfg.volume);
  return true;
}

// ---------------------------------------------------------------- volume

function hwChase(self, other, d, reach, speed) {
  var gap = d - self.r - other.r;
  if (gap > reach * 0.45) {
    var sp = Math.min(speed, (gap - reach * 0.45) * 20);
    self.vx = (other.x - self.x) / d * sp; self.vy = (other.y - self.y) / d * sp;
  }
}

function hwVolumePunch(self, other, dt, d, v) {
  var pu = self.char.punch, m = hwM(self), reach = self.r + other.r + pu.reach;
  self.punchCd = Math.max(0, self.punchCd - dt * self.atkRate);
  if (!self.punch && !self.koPunch && self.punchCd === 0 && other.alive && d < reach) {
    var n = Math.max(1, Math.round(hwLerp(v.combo[0], v.combo[1], m) + (Math.random() - 0.5) * 1.6));
    self.punch = { t: 0, hit: false, side: Math.random() < 0.5 ? 1 : -1, left: n - 1, n: n, hw: true };
    self.punchCd = hwLerp(v.cooldown[0], v.cooldown[1], m);
  }
  var p = self.punch;
  if (!p) return;
  p.t += dt;
  if (p.left > 0 && other.alive) hwChase(self, other, d, pu.reach, v.chase); // walks into range behind the combo
  if (!p.hit && p.t >= pu.speed * 0.35) {
    p.hit = true;
    if (other.alive && d < reach + v.slack) {
      var last = p.left === 0;
      var dealt = hurt(other, hwLerp(v.damage[0], v.damage[1], m), "punch", self.id);
      if (dealt > 0) { playPunch(dealt); hwLanded(self, 1); }
      var kb = last ? pu.knockback : v.comboKnockback;
      if (kb > 0 && !other.justDodged && hwKnockable(other)) {
        var kx = other.x - self.x, ky = other.y - self.y, kd = Math.sqrt(kx * kx + ky * ky) || 1;
        other.vx += kx / kd * kb; other.vy += ky / kd * kb;
      }
      if (!reduceMotion) shake = Math.max(shake, last ? 5 : 3);
      checkEnd();
    }
  }
  if (self.punch && p.t >= pu.speed) {
    if (p.left > 0 && other.alive && self.alive && d < reach + v.slack * 2) {
      self.punch = { t: 0, hit: false, side: -p.side, left: p.left - 1, n: p.n, hw: true }; // next one, off the other hand
    } else {
      self.punch = null;
    }
  }
}

// ---------------------------------------------------------------- guard

// He doesn't follow them down: while they're on their back in guard he
// turns away from the circle instead of stepping in.
function hwGuardRespect(self, other, gr) {
  var g = other.guard;
  if (!gr || !g) { self.hwGuardSeen = null; return; }
  if (self.hwGuardSeen !== g) { self.hwGuardSeen = g; self.hwGuardAvoid = Math.random() * 100 < gr.chance; }
  if (!self.hwGuardAvoid || g.getup >= 0 || !inOrdinaryMovement(self)) return;
  var dx = self.x - other.x, dy = self.y - other.y, d = Math.sqrt(dx * dx + dy * dy) || 1;
  if (d >= g.radius + gr.margin) return;
  var ux = dx / d, uy = dy / d, in0 = self.vx * ux + self.vy * uy;
  if (in0 < 0) { self.vx -= 2 * in0 * ux; self.vy -= 2 * in0 * uy; } // heading in: bounce off the edge of the circle
  if (d < g.radius + 2) { self.x = other.x + ux * (g.radius + 2); self.y = other.y + uy * (g.radius + 2); }
}

// ---------------------------------------------------------------- the booth

function hwBoothReady(self, other, bc) {
  if (!bc || self.hwBoothN >= bc.max || self.hwBoothCd > 0 || self.hwT < bc.after || self.hwMash || hwBooth) return false;
  if (!other.alive || other.koOut || other.char.base === "Grappler") return false; // strikers only
  if (self.hp - other.hp < bc.lead || hwM(self) < bc.minMeter || !canSay(self)) return false;
  return hwDist(self, other) <= bc.range;
}

function startBooth(self, other) {
  clearActions(self);
  self.vx = 0; self.vy = 0; self.hwCounter = null;
  self.hwAct = { kind: "booth", phase: "count", t: 0 };
  self.hwBoothN++;
  hwBooth = { id: self.id, x: Math.max(80, Math.min(W - 80, self.x)), t: 0, out: 0 };
  if (hwLine(self, "booth")) say(self, HW_LINES.count);
  floater(self.x, self.y - self.r - 34, statsFor(self.id).strikes + " STRIKES", "crit");
  crowdReact(0.5);
  playHwBooth();
}

function hwJab(self, tgt, dur, hitAt, sizeK, side) {
  return { t: 0, dur: dur, hitAt: hitAt, hit: false, targetId: tgt.id, size: (self.char.punch.size || 13) * sizeK, kind: "jab", side: side, hw: true, live: true };
}

function runBooth(self, other, a, bc, dt) {
  a.t += dt;
  self.vx = 0; self.vy = 0;
  // Every slip comes back as a counter (hollowayDodge sets hwCounter).
  var kp = self.koPunch;
  if (kp && kp.hw) {
    kp.live = true; kp.t += dt;
    if (!kp.hit && kp.t >= kp.hitAt) {
      kp.hit = true;
      var tgt = balls[kp.targetId];
      if (tgt && tgt.alive && !tgt.koOut && hwDist(self, tgt) < self.r + tgt.r + self.char.punch.reach + 24) {
        var dealt = hurt(tgt, bc.counter, "punch", self.id);
        if (dealt > 0) { playPunch(dealt); hwLanded(self, 1); }
        checkEnd();
      }
    }
    if (kp.t >= kp.dur) self.koPunch = null;
  } else if (self.hwCounter != null) {
    var ct = balls[self.hwCounter];
    self.hwCounter = null;
    if (ct && ct.alive) self.koPunch = hwJab(self, ct, 0.15, 0.06, 1.05, Math.random() < 0.5 ? 1 : -1);
  }
  if (a.phase === "count" && a.t >= bc.count) {
    a.phase = "boxer"; a.t = 0;
    if (hwLine(self, "booth")) say(self, HW_LINES.boxer);
    crowdReact(0.6);
  } else if (a.phase === "boxer" && a.t >= bc.boxer && !self.koPunch) {
    endHwAct(self, other);
    return false;
  }
  return true;
}

// From hurt (match.js): at the booth he slips what they throw without
// looking, and comes back with a counter.
function hollowayDodge(b, source, attackerId) {
  var a = b.hwAct, cfg = hwCfg(b);
  if (!a || a.kind !== "booth" || !cfg || !cfg.booth || !b.alive) return false;
  if (HW_NO_SLIP[source] || attackerId == null || attackerId === b.id || b.grappled || b.slam) return false;
  if (Math.random() * 100 >= cfg.booth.slip) return false;
  b.weaveAnim = { t: 0, dur: 0.24, sign: Math.random() < 0.5 ? -1 : 1 };
  floater(b.x, b.y - b.r - 8, "SLIP", "dodge");
  b.justDodged = true;
  if (!PROJECTILE_SOURCES[source]) b.hwCounter = attackerId;
  playHwSlip();
  return true;
}

function endHwAct(self, other) {
  var a = self.hwAct;
  self.hwAct = null;
  if (!a) return;
  if (a.kind === "booth") {
    self.hwBoothCd = hwCfg(self).booth.every;
    if (hwBooth && hwBooth.id === self.id && !hwBooth.out) hwBooth.out = 0.001;
  }
  if (a.kind === "flash") {
    if (other.dazed === "held") other.dazed = false;
    if (hwFlash && hwFlash.id === self.id) hwFlash = null;
    if (other.alive && !other.koOut) setSpeed(other, other.baseSpeed || SPEED);
  }
  if (self.koPunch && self.koPunch.hw) self.koPunch = null;
  self.hwCounter = null;
  if (self.alive && inOrdinaryMovement(self)) setSpeed(self, self.baseSpeed || SPEED);
}

// ---------------------------------------------------------------- flashback

function hwFlashReady(self, other, cfg) {
  var fb = cfg.flashback;
  if (!fb || self.hwFlashDone || self.hwT < self.hwFlashT || hwFlash || self.hwMash) return false;
  if (!other.alive || specialBusy(other) || other.guard || other.koOut || other.invincible || other.dazed || other.dizzy) return false;
  if (other.hwAct || other.watcherState || swordDuelActive()) return false;
  return true;
}

function startFlashback(self, other) {
  self.hwFlashDone = true;
  clearActions(self); clearActions(other);
  self.vx = 0; self.vy = 0; other.vx = 0; other.vy = 0;
  other.dazed = "held"; // the whole fight holds while he thinks back
  self.hwAct = { kind: "flash", phase: "zone", t: 0 };
  hwFlash = { id: self.id, t: 0, phase: "zone", presses: [], combo: 0, pressT: 0 };
  floater(self.x, self.y - self.r - 34, "FLASHBACK...", "note");
  playHwFlashIn();
}

function runFlashback(self, other, a, cfg, dt) {
  var fb = cfg.flashback;
  a.t += dt;
  self.vx = 0; self.vy = 0; other.vx = 0; other.vy = 0;
  if (hwFlash) hwFlash.phase = a.phase;
  if (a.phase === "zone" && a.t >= fb.zone) { a.phase = "tv"; a.t = 0; }
  else if (a.phase === "tv" && a.t >= fb.tv) { a.phase = "back"; a.t = 0; playHwFlashOut(); }
  else if (a.phase === "back" && a.t >= fb.back) {
    endHwAct(self, other);
    if (cfg.mash) startMash(self);
    return false;
  }
  return true;
}

// ---------------------------------------------------------------- Button Mash

function startMash(self) {
  self.hwMash = { t: 0, left: 0, n: 0, hits: 0, gap: 0, chase: 0, side: 1, spun: false };
  floater(self.x, self.y - self.r - 34, "BUTTON MASH!", "crit");
  maxxOnMash(self); // his Maxx Energy ad on the jumbotron (maxx-energy-ad.js)
  crowdReact(0.7);
  if (hwLine(self, "zone")) say(self, HW_LINES.zone);
}

function hwPickMove(ms) {
  var list = HW_MOVES.filter(function (mv) { return !(mv.spin && ms.spun); }); // one spinning back fist a combo at most
  var tot = list.reduce(function (s, mv) { return s + mv.w; }, 0), x = Math.random() * tot;
  for (var i = 0; i < list.length; i++) { x -= list[i].w; if (x <= 0) return list[i]; }
  return list[0];
}

function hwMashPunch(self, other, dt, d, cfg) {
  var mc = cfg.mash, ms = self.hwMash, pu = self.char.punch, reach = self.r + other.r + pu.reach;
  ms.t += dt;
  var kp = self.koPunch;
  if (kp && kp.hw) {
    kp.live = true; kp.t += dt;
    hwChase(self, other, d, pu.reach, mc.chase);
    if (!kp.hit && kp.t >= kp.hitAt) { kp.hit = true; hwMashLand(self, other, kp, cfg); }
    if (kp.t >= kp.dur) { self.koPunch = null; if (ms.left <= 0) hwComboDone(self, ms, mc); }
    return;
  }
  if (!other.alive) { self.hwMash = null; return; }
  if (ms.left > 0) {
    if (d < reach + 30) { hwMashStrike(self, other, ms); return; }
    ms.chase += dt;
    hwChase(self, other, d, pu.reach, mc.chase);
    if (ms.chase > 0.7) { ms.left = 0; hwComboDone(self, ms, mc); } // they got away
    return;
  }
  if (ms.t >= mc.time) { self.hwMash = null; return; }
  ms.gap -= dt * self.atkRate;
  if (ms.gap <= 0 && d < reach + 10) {
    ms.left = Math.round(hwRand(mc.combo)); ms.n = ms.left; ms.hits = 0; ms.spun = false;
    hwMashStrike(self, other, ms);
  }
}

function hwMashStrike(self, other, ms) {
  var mv = hwPickMove(ms), size = self.char.punch.size || 13, kp;
  ms.left--; ms.side = -ms.side; ms.chase = 0;
  if (mv.hook) {
    var coil = mv.spin ? 0.16 : 0;
    kp = { t: 0, coil: coil, sweep: mv.sweep, dur: coil + mv.sweep + 0.05, hitAt: coil + mv.sweep * QHOOK_OPEN / (QHOOK_OPEN + QHOOK_FOLLOW),
      hit: false, targetId: other.id, size: size * (mv.spin ? 1.3 : 1.12), kind: "qhook", side: ms.side, heavy: !!mv.spin, hw: true, live: true, mv: mv.k };
  } else {
    kp = { t: 0, dur: mv.dur, hitAt: mv.hitAt, hit: false, targetId: other.id, size: size * 1.05, kind: "jab", side: ms.side, hw: true, live: true, mv: mv.k };
  }
  if (mv.spin) { ms.spun = true; self.hwSpin = { t: 0, dur: kp.hitAt + 0.03, dir: ms.side }; playWhoosh(); }
  self.koPunch = kp;
  self.hwBtns.push({ k: mv.btn, t: 0, x: (ms.n - ms.left - (ms.n + 1) / 2) * self.r * 0.42 });
  playHwChip(mv.btn);
}

function hwMashLand(self, other, kp, cfg) {
  if (!other.alive || other.koOut) return;
  var mc = cfg.mash, v = cfg.volume, d = hwDist(self, other);
  if (d > self.r + other.r + self.char.punch.reach + 22) { floater(other.x, other.y - other.r - 8, "WHIFF", "dodge"); return; }
  var big = kp.mv === "backfist";
  var dmg = big ? mc.backfist : hwLerp(v.damage[0], v.damage[1], hwM(self)) * mc.damage;
  var dealt = hurt(other, dmg, "punch", self.id);
  if (dealt > 0) {
    if (self.hwMash) self.hwMash.hits++;
    hwLanded(self, 1);
    playPunch(dealt * (big ? 1.8 : 1));
    var ux = (other.x - self.x) / d, uy = (other.y - self.y) / d;
    if (big) {
      floater(other.x, other.y - other.r - 34, "SPINNING BACK FIST!", "note");
      impacts.push({ x: other.x - ux * other.r, y: other.y - uy * other.r, nx: -ux, ny: -uy, life: 0.4, max: 0.4, color: self.char.color });
      hitStop = Math.max(hitStop, 0.07);
    }
    if (!other.justDodged && hwKnockable(other)) { var kb = big ? 420 : 40; other.vx += ux * kb; other.vy += uy * kb; }
  }
  if (!reduceMotion) shake = Math.max(shake, big ? 12 : 4);
  checkEnd();
}

function hwComboDone(self, ms, mc) {
  if (ms.hits >= 3) {
    floater(self.x, self.y - self.r - 34, ms.hits + " HIT COMBO!", ms.hits >= 6 ? "crit" : "note");
    playHwCombo(ms.hits);
    crowdReact(0.2 + ms.hits * 0.05);
  }
  ms.gap = mc.gap; ms.left = 0; ms.hits = 0;
}

// ---------------------------------------------------------------- The Middle

// From updateSpecial (special.js) for special.move "middle".
function updateMiddle(self, other, dt) {
  var sp = self.char.special;
  if (!self.igbb) {
    if (self.specialT < sp.chargeTime || !canStartIgbb(self, other) || self.hwAct || self.hwMash || hwFlash) return false;
    if (other.guard || other.dazed || other.koOut || other.hwAct || swordDuelActive()) return false;
    if (sp.onlyWhenWinning && self.hp < other.hp) return false; // his rule: only the one winning calls the 10 seconds
    startMiddle(self, other, sp);
  }
  var m = self.igbb;
  if (m.move !== "middle") return false;
  m.t += dt; m.clockT += dt;
  if (m.phase !== "ko" && (!other.alive || over)) { endMiddle(self, other); checkEnd(); return false; }
  self.vx = 0; self.vy = 0;
  hwClockTick(m, sp);
  if (m.phase === "point") return middlePoint(self, other, m, sp);
  if (m.phase === "walk") return middleWalk(self, other, m, sp);
  if (m.phase === "trade") return middleTrade(self, other, m, sp, dt);
  if (m.phase === "final") return middleFinal(self, other, m, sp, dt);
  if (m.phase === "ko") return middleKo(self, other, m, dt);
  if (m.t >= 0.75) { endMiddle(self, other); return false; } // "bell"
  return true;
}

function startMiddle(self, other, sp) {
  clearActions(self);
  self.koPunch = null; self.punch = null;
  var hc = hwCfg(self) || {}, gj = !!hc.gaethje && hwIs(other.char, HW_GAETHJE);
  var accept = gj || Math.random() * 100 < sp.acceptChance;
  self.igbb = { move: "middle", phase: "point", t: 0, clockT: 0, accept: accept, side: self.x <= other.x ? -1 : 1, gaethje: gj, n: 10, thrown: 0, nextAt: 0, ansAt: 0, ansSide: 1 };
  floater(self.x, self.y - self.r - 34, "MEET ME IN THE MIDDLE", "crit");
  hwRing = { id: self.id, t: 0, out: 0 };
  hwClockFx = { id: self.id, n: 10, t: 0, out: 0, flash: 0.2 };
  crowdReact(0.8);
  playHwPoint();
  if (hwLine(self, "middle")) say(self, pickLine(self, [HW_LINES.rules, HW_LINES.bro, HW_LINES.noShoot], "middle"));
  if (accept) { clearActions(other); other.dazed = "held"; other.vx = 0; other.vy = 0; } // they stop and look
}

// The clock: 0:10 while he points, down to 0:01 for the right hand, 0:00 at the bell.
function hwClockTick(m, sp) {
  var n;
  if (m.phase === "point") n = 10;
  else if (m.phase === "walk" || m.phase === "trade") n = Math.max(1, 10 - Math.floor(9 * (m.clockT - sp.point) / (sp.walk + sp.fury)));
  else if (m.phase === "final" || m.phase === "ko") n = 1;
  else n = 0;
  if (n !== m.n) { m.n = n; if (hwClockFx) { hwClockFx.n = n; hwClockFx.flash = 0.2; } playHwTick(n); }
}

function middlePoint(self, other, m, sp) {
  if (m.accept) { other.vx = 0; other.vy = 0; }
  else if (inOrdinaryMovement(other)) { // backing off
    var dx = other.x - self.x, dy = other.y - self.y, d = Math.sqrt(dx * dx + dy * dy) || 1, s = Math.max(200, Math.sqrt(other.vx * other.vx + other.vy * other.vy));
    other.vx = dx / d * s; other.vy = dy / d * s;
  }
  if (m.t < sp.point) return true;
  if (!m.accept) { declineMiddle(self, other, sp); return false; }
  m.phase = "walk"; m.t = 0;
  m.sx = self.x; m.sy = self.y; m.ox = other.x; m.oy = other.y;
  m.hx = W / 2 + m.side * (self.r + sp.gap / 2); m.hy = H / 2;
  m.tx = W / 2 - m.side * (other.r + sp.gap / 2); m.ty = H / 2;
  floater(other.x, other.y - other.r - 30, m.gaethje ? "BMF!" : "ACCEPTS!", "note");
  return true;
}

function middleWalk(self, other, m, sp) {
  var k = Math.min(1, m.t / sp.walk), e = k * k * (3 - 2 * k);
  self.x = m.sx + (m.hx - m.sx) * e; self.y = m.sy + (m.hy - m.sy) * e;
  other.x = m.ox + (m.tx - m.ox) * e; other.y = m.oy + (m.ty - m.oy) * e;
  other.vx = 0; other.vy = 0;
  if (k >= 1) { m.phase = "trade"; m.t = 0; m.nextAt = 0; m.ansAt = sp.answerEvery * 0.6; crowdReact(1); }
  return true;
}

function middleTrade(self, other, m, sp, dt) {
  var kp = self.koPunch, lean = kp && kp.hw ? Math.max(0, Math.sin(Math.PI * Math.min(1, kp.t / kp.dur))) * 5 : 0;
  self.x = m.hx - m.side * lean + Math.sin(m.t * 23) * 1.5; self.y = m.hy + Math.cos(m.t * 19) * 1.5;
  other.x = m.tx + Math.sin(m.t * 17 + 1) * 1.5; other.y = m.ty + Math.cos(m.t * 21) * 1.5;
  other.vx = 0; other.vy = 0;
  // His punches: the fastest in the game.
  if (kp && kp.hw) {
    kp.live = true; kp.t += dt;
    if (!kp.hit && kp.t >= kp.hitAt) { kp.hit = true; landFury(self, other, sp); }
    if (kp.t >= kp.dur) self.koPunch = null;
  }
  if (!other.alive) { announceMiddleKo(self); endMiddle(self, other); checkEnd(); return false; }
  if (!self.koPunch && m.t >= m.nextAt && m.t < sp.fury) { throwFury(self, other, m, sp); m.nextAt = m.t + sp.punchEvery; }
  // Theirs, coming back at him.
  var ok = other.koPunch;
  if (ok && ok.hw) {
    ok.live = true; ok.t += dt;
    if (!ok.hit && ok.t >= ok.hitAt) { ok.hit = true; landAnswer(self, other, sp); }
    if (ok.t >= ok.dur) other.koPunch = null;
  } else if (m.t >= m.ansAt && m.t < sp.fury - 0.15) {
    m.ansSide = -m.ansSide;
    other.koPunch = { t: 0, dur: 0.17, hitAt: 0.075, hit: false, targetId: self.id, size: ((other.char.punch && other.char.punch.size) || 14) * 1.05, kind: "jab", side: m.ansSide, hw: true, live: true };
    m.ansAt = m.t + sp.answerEvery * (0.8 + Math.random() * 0.4);
  }
  if (m.t >= sp.fury && !self.koPunch && !(other.koPunch && other.koPunch.hw)) {
    // 0:01: the big right hand, cocked back where they can see it.
    m.phase = "final"; m.t = 0;
    self.koPunch = { t: 0, dur: sp.finalWindup + 0.14, hitAt: sp.finalWindup, hit: false, targetId: other.id, size: (self.char.punch.size || 13) * 1.4, kind: "big", side: 1, hw: true, live: true };
    playWhoosh();
  }
  return true;
}

function throwFury(self, other, m, sp) {
  var size = self.char.punch.size || 13, side = (m.thrown++ % 2) ? 1 : -1;
  if (Math.random() < 0.4) {
    var sw = 0.07;
    self.koPunch = { t: 0, sweep: sw, dur: sw + 0.03, hitAt: sw * QHOOK_OPEN / (QHOOK_OPEN + QHOOK_FOLLOW), hit: false, targetId: other.id, size: size * 1.15, kind: "qhook", side: side, hw: true, live: true };
  } else {
    self.koPunch = { t: 0, dur: Math.max(0.06, sp.punchEvery - 0.01), hitAt: 0.035, hit: false, targetId: other.id, size: size * 1.08, kind: "jab", side: side, hw: true, live: true };
  }
}

function landFury(self, other, sp) {
  if (!other.alive || other.koOut) return;
  var dealt = hurt(other, sp.damage, "igbb", self.id); // can't be slipped or blocked: they're standing there trading
  other.flash = Math.min(other.flash, 0.05); // a flicker, not a white ball for the whole trade
  if (dealt > 0) {
    playPunch(dealt * 1.4);
    hwLanded(self, 1);
    var d = hwDist(self, other), ux = (other.x - self.x) / d, uy = (other.y - self.y) / d;
    other.squash = { t: 0.08, max: 0.08, nx: -ux, ny: -uy };
    if (self.igbb.thrown % 3 === 0) igbbSparks(other.x - ux * other.r, other.y - uy * other.r, -ux, -uy, self.char.color, 6, 300);
  }
  if (!reduceMotion) shake = Math.max(shake, 4);
  checkEnd();
}

function landAnswer(self, other, sp) {
  if (!self.alive || !other.alive || other.koOut) return;
  var pd = other.char.hasPunch && other.char.punch ? other.char.punch.damage : 10;
  var got = hurt(self, Math.min(sp.answerMax, Math.max(4, pd * sp.answerScale)), "punch", other.id);
  if (got > 0) playPunch(got);
  checkEnd();
}

function middleFinal(self, other, m, sp, dt) {
  self.x = m.hx; self.y = m.hy; other.x = m.tx; other.y = m.ty; other.vx = 0; other.vy = 0;
  var kp = self.koPunch;
  if (kp && kp.hw) {
    kp.live = true; kp.t += dt;
    if (!kp.hit && kp.t >= kp.hitAt) { kp.hit = true; if (landFinal(self, other, m, sp)) return true; }
    if (self.koPunch && kp.t >= kp.dur) self.koPunch = null;
  }
  if (m.phase === "final" && !self.koPunch) {
    if (!other.alive) { announceMiddleKo(self); endMiddle(self, other); checkEnd(); return false; }
    startBell(self, other, m);
  }
  return true;
}

// The right hand at 0:01. True on a knockout (the celebration takes over).
function landFinal(self, other, m, sp) {
  if (!other.alive || other.koOut) return false;
  var hc = hwCfg(self) || {};
  var p = sp.koBase + sp.koLow * (1 - other.hp / MAX_HP) + sp.koMeter * hwM(self) + (m.gaethje ? hc.gaethje.koBonus : 0);
  if (Math.random() * 100 < p && !other.holdAtOne) {
    if (other.dazed === "held") other.dazed = false;
    // Goes through every normal defence (a weave, a block), like the KO Rush.
    if (throwKoPunch(self, other)) { beginMiddleKo(self, other, m); return true; }
    if (other.alive && !other.koOut) other.dazed = "held";
    return false;
  }
  var dealt = hurt(other, sp.finalDamage, "igbb", self.id);
  if (dealt > 0) {
    var d = hwDist(self, other), ux = (other.x - self.x) / d, uy = (other.y - self.y) / d;
    playPunch(dealt * 1.8);
    floater(other.x, other.y - other.r - 34, "RIGHT HAND!", "note");
    impacts.push({ x: other.x - ux * other.r, y: other.y - uy * other.r, nx: -ux, ny: -uy, life: 0.45, max: 0.45, color: self.char.color });
    other.squash = { t: 0.18, max: 0.18, nx: -ux, ny: -uy };
    hitStop = Math.max(hitStop, 0.1);
    if (!reduceMotion) shake = Math.max(shake, 14);
  }
  if (!other.alive) announceMiddleKo(self); // the right hand finished it
  checkEnd();
  return false;
}

function announceMiddleKo(self) { if (hwLine(self, "rogan")) announce(HW_ROGAN, { who: "ROGAN" }); }

function beginMiddleKo(self, other, m) {
  m.phase = "ko"; m.t = 0;
  self.koPunch = null;
  var hc = hwCfg(self) || {};
  m.belt = m.gaethje && hc.gaethje && hc.gaethje.belt;
  floater(self.x, self.y - self.r - 76, m.belt ? "BMF!" : "AT THE BUZZER!", "crit");
  announceMiddleKo(self);
  crowdReact(1);
}

function middleKo(self, other, m, dt) {
  if (other.koOut) { var damp = Math.exp(-5 * dt); other.vx *= damp; other.vy *= damp; }
  if (m.t >= 1.7) {
    endMiddle(self, other);
    finishKnockedOut(other);
    checkEnd();
    return false;
  }
  return true;
}

function startBell(self, other, m) {
  m.phase = "bell"; m.t = 0;
  if (other.koPunch && other.koPunch.hw) other.koPunch = null;
  if (other.dazed === "held") other.dazed = false;
  if (other.alive) { other.vx = -m.side * SPEED * 0.7; other.vy = (Math.random() - 0.5) * SPEED * 0.4; }
  playHwBell();
  crowdReact(0.8);
}

function declineMiddle(self, other, sp) {
  floater(other.x, other.y - other.r - 30, "BACKS OFF", "note");
  hwBoo = { t: 0 };
  playHwBoo();
  crowdReact(0.3);
  endMiddle(self, other);
  self.specialT = sp.chargeTime * sp.declineRefund; // some of the bar back
  hwFill(self, 0.08);
}

function endMiddle(self, other) {
  self.igbb = null;
  self.specialT = 0;
  if (self.koPunch && self.koPunch.hw) self.koPunch = null;
  if (other) {
    if (other.koPunch && other.koPunch.hw) other.koPunch = null;
    if (other.dazed === "held") other.dazed = false;
  }
  if (hwRing && hwRing.id === self.id && !hwRing.out) hwRing.out = 0.001;
  if (hwClockFx && hwClockFx.id === self.id && !hwClockFx.out) hwClockFx.out = 0.001;
  if (self.alive) setSpeed(self, self.baseSpeed || SPEED);
  if (other && other.alive && !other.koOut && inOrdinaryMovement(other) && Math.abs(other.vx) + Math.abs(other.vy) < 1) setSpeed(other, other.baseSpeed || SPEED);
}

// From conor.js when one of Conor's lines would make him angry: `chance`% of
// the time he shrugs it off (and against Conor says his real answer to
// Conor's trash talk). Conor's Press Conference special (furious) still gets
// to him. True when it doesn't get to him.
function hollowayShrugs(b, talker, furious) {
  var cfg = hwCfg(b), ub = cfg && cfg.unbothered;
  if (!ub || furious || !b.alive || Math.random() * 100 >= ub.chance) return false;
  floater(b.x, b.y - b.r - 26, "UNBOTHERED", "note");
  if (hwLine(b, "conor") && talker && hwIs(talker.char, HW_CONOR) && (b.hwSaid.conorN || 0) < 2 && canSay(b)) {
    b.hwSaid.conorN = (b.hwSaid.conorN || 0) + 1;
    say(b, HW_LINES.conor);
  }
  return true;
}

// From hurt (match.js): his chin. A big single strike (`over` damage or more,
// from `sources`) does `mult` of its damage. Against Ilia Topuria, who gave
// him the only knockout loss of his career (UFC 308, 2024), there's no chin
// and Ilia's shots do ilia.hurt times as much.
function hollowayChin(b, amount, source, attackerId) {
  var cfg = hwCfg(b);
  if (!cfg || attackerId == null || attackerId === b.id) return 1;
  var atk = balls[attackerId];
  if (cfg.ilia && atk && hwIs(atk.char, HW_ILIA)) return cfg.ilia.hurt;
  var ch = cfg.chin;
  if (!ch || amount < ch.over || ch.sources.indexOf(source) < 0) return 1;
  return ch.mult;
}

// From special.js's specialGuarding: trading in the middle he can be hit.
function middleTrading(b) { return middleOn(b) && b.igbb.phase === "trade"; }

// ---------------------------------------------------------------- every frame

// From update(): the meter, his fight clock, buttons and the flashback's
// clock, his lines, and cleaning up anything a move left behind.
function tickHolloway(dt) {
  hwClock += dt;
  if (hwBooth) { hwBooth.t += dt; if (hwBooth.out && (hwBooth.out += dt) > 0.4) hwBooth = null; }
  if (hwRing) { hwRing.t += dt; if (hwRing.out && (hwRing.out += dt) > 0.35) hwRing = null; }
  if (hwClockFx) { hwClockFx.t += dt; hwClockFx.flash = Math.max(0, hwClockFx.flash - dt); if (hwClockFx.out && (hwClockFx.out += dt) > 0.9) hwClockFx = null; }
  if (hwBoo) { hwBoo.t += dt; if (hwBoo.t > 1.4) hwBoo = null; }
  if (hwFlash) tickHwFlash(dt);
  // A move that got cut off: let the opponent go.
  if (hwRing && !hwRing.out && !middleOn(balls[hwRing.id])) {
    var ro = balls[1 - hwRing.id];
    if (ro.dazed === "held") ro.dazed = false;
    hwRing.out = 0.001;
    if (hwClockFx && !hwClockFx.out) hwClockFx.out = 0.001;
  }
  balls.forEach(function (b) {
    var kp = b.koPunch;
    if (kp && kp.hw) { if (!kp.live) b.koPunch = null; else kp.live = false; } // nobody's throwing it any more (grabbed, shelled...)
    if (b.hwBtns && b.hwBtns.length) b.hwBtns = b.hwBtns.filter(function (x) { x.t += dt; return x.t < 0.65; });
    if (b.hwSpin) { b.hwSpin.t += dt; if (b.hwSpin.t >= b.hwSpin.dur) b.hwSpin = null; }
    var cfg = hwCfg(b);
    if (!cfg) return;
    if (middleOn(b) && !b.alive) endMiddle(b, balls[1 - b.id]);
    if (started && !over && b.alive) {
      b.hwT += dt;
      if (cfg.blessed && !b.igbb && !b.hwAct) hwFill(b, cfg.blessed.timeFill * dt);
      if (b.hwBoothCd > 0) b.hwBoothCd -= dt;
    }
    if (b.hwMash && (!b.alive || over)) b.hwMash = null;
    hwLines(b);
  });
}

function hwLines(b) {
  if (!started || !b.alive) return;
  var o = balls[1 - b.id];
  if (over) {
    if (hwLine(b, "win") && !b.hwSaid.win && !o.alive) { b.hwSaid.win = true; say(b, HW_LINES.him); }
    return;
  }
  if (hwLine(b, "matador") && !b.hwSaid.matador && hwIs(o.char, HW_ILIA) && b.hwT > 1.2 && canSay(b)) {
    b.hwSaid.matador = true; say(b, HW_LINES.matador);
  } else if (hwLine(b, "blessed") && !b.hwSaid.open && !hwIs(o.char, HW_ILIA) && b.hwT > 1.2 && canSay(b)) {
    b.hwSaid.open = true; say(b, HW_LINES.blessed); // his opener
  }
}

// The flashback's own clock: the game on the TV, and his button presses.
function tickHwFlash(dt) {
  var f = hwFlash, owner = balls[f.id];
  if (!owner || !owner.hwAct || owner.hwAct.kind !== "flash") { // cut off
    var fo = balls[1 - f.id];
    if (fo && fo.dazed === "held") fo.dazed = false;
    hwFlash = null;
    return;
  }
  f.t += dt;
  f.presses.forEach(function (p) { p.t += dt; });
  f.presses = f.presses.filter(function (p) { return p.t < 0.9; });
  if (f.phase === "tv" && owner.hwAct.t > 0.6 && owner.hwAct.t < hwCfg(owner).flashback.tv - 0.45) {
    f.pressT -= dt;
    if (f.pressT <= 0) {
      f.pressT += 0.12;
      var keys = ["X", "Y", "A", "B"], k = keys[Math.floor(Math.random() * 4)];
      f.presses.push({ k: k, t: 0 });
      f.combo++;
      playHwChip(k);
    }
  }
}

// ---------------------------------------------------------------- drawing

// Under the fighters: the gold ring in the middle and the commentary desk.
function drawHollowayUnder() {
  if (hwRing) drawMiddleRing();
  if (hwBooth) drawBoothDesk();
}

function drawMiddleRing() {
  var R = hwRing, a = Math.min(1, R.t / 0.3) * (R.out ? Math.max(0, 1 - R.out / 0.35) : 1);
  if (a <= 0) return;
  var cx = W / 2, cy = H / 2, pulse = 0.5 + 0.5 * Math.sin(hwClock * 9), rr = 58 + pulse * 4;
  ctx.save();
  ctx.globalAlpha = a;
  ctx.fillStyle = "rgba(232,185,35,0.14)";
  ctx.beginPath(); ctx.arc(cx, cy, rr, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = HW_GOLD; ctx.lineWidth = 5;
  ctx.setLineDash([16, 9]); ctx.lineDashOffset = -hwClock * 40;
  ctx.beginPath(); ctx.arc(cx, cy, rr, 0, Math.PI * 2); ctx.stroke();
  ctx.setLineDash([]);
  // chevrons pointing in at the spot
  ctx.fillStyle = HW_GOLD;
  for (var i = 0; i < 4; i++) {
    var ang = i * Math.PI / 2 + Math.PI / 4, o = rr + 16 - pulse * 5;
    ctx.save(); ctx.translate(cx + Math.cos(ang) * o, cy + Math.sin(ang) * o); ctx.rotate(ang + Math.PI);
    ctx.beginPath(); ctx.moveTo(9, 0); ctx.lineTo(-5, -8); ctx.lineTo(-1, 0); ctx.lineTo(-5, 8); ctx.closePath(); ctx.fill();
    ctx.restore();
  }
  var m = balls[R.id] && balls[R.id].igbb;
  if (m && m.move === "middle" && (m.phase === "point" || m.phase === "walk")) {
    ctx.font = '900 18px "Barlow Condensed", "Arial Narrow", sans-serif';
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.lineWidth = 4; ctx.strokeStyle = theme.floor; ctx.strokeText("THE MIDDLE", cx, cy);
    ctx.fillStyle = "#9a7410"; ctx.fillText("THE MIDDLE", cx, cy);
  }
  ctx.restore();
}

// The commentary desk he talks to, at the bottom of the cage.
function drawBoothDesk() {
  var D = hwBooth, a = Math.min(1, D.t / 0.25) * (D.out ? Math.max(0, 1 - D.out / 0.4) : 1);
  if (a <= 0) return;
  var x = D.x, y = H - 4, w = 132, h = 24;
  ctx.save();
  ctx.globalAlpha = a;
  // the two commentators behind it, in headsets
  [-1, 1].forEach(function (s, i) {
    var hx = x + s * 30, hy = y - h - 9 + Math.sin(hwClock * 7 + i) * 1;
    ctx.fillStyle = i ? "#e2b28f" : "#c58f6a"; ctx.strokeStyle = STAGE_INK; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(hx, hy, 12, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = "#1b1b1b"; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(hx, hy, 13, Math.PI * 1.05, Math.PI * 1.95); ctx.stroke(); // headband
    ctx.fillStyle = "#1b1b1b";
    ctx.beginPath(); ctx.arc(hx - 12, hy, 4, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(hx + 12, hy, 4, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "#1b1b1b"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(hx - s * 12, hy + 2); ctx.quadraticCurveTo(hx - s * 10, hy + 10, hx - s * 2, hy + 9); ctx.stroke(); // mic boom
  });
  ctx.fillStyle = "#1d2230"; ctx.strokeStyle = STAGE_INK; ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.roundRect(x - w / 2, y - h, w, h, 4); ctx.fill(); ctx.stroke();
  ctx.fillStyle = HW_GOLD; ctx.fillRect(x - w / 2 + 4, y - h + 3, w - 8, 2);
  ctx.font = '800 13px "Barlow Condensed", "Arial Narrow", sans-serif';
  ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillStyle = HW_GOLD;
  ctx.fillText("COMMENTARY", x, y - h / 2 + 1);
  ctx.restore();
}

// From draw(), with the other body poses: spinning for the back fist, and
// bouncing on his toes at the booth.
function applyHollowayPose(b) {
  if (b.hwSpin) {
    var k = Math.min(1, b.hwSpin.t / b.hwSpin.dur), e = 1 - (1 - k) * (1 - k);
    ctx.translate(b.x, b.y); ctx.rotate(-(b.hwSpin.dir || 1) * e * Math.PI * 2); ctx.translate(-b.x, -b.y);
  }
  if (b.hwAct && b.hwAct.kind === "booth") ctx.translate(0, -Math.abs(Math.sin(hwClock * 10)) * 3);
}

function hwArm(b, sx, sy, hx, hy, gr, ang) {
  if (hasArmMuscle(b.char)) drawArmMuscle(ctx, b.char, sx, sy, hx, hy, b.r * 0.2, theme.wall);
  else strokeLimb(gr * 0.7, armColor(b.char), function () { ctx.moveTo(sx, sy); ctx.lineTo(hx, hy); });
  drawGloveAt(hx, hy, gr, b.char, ang);
}
// An arm out straight pointing at (tx, ty), a finger sticking out of the glove.
function hwPointArm(b, tx, ty, side) {
  var r = b.r, ang = Math.atan2(ty - b.y, tx - b.x), ux = Math.cos(ang), uy = Math.sin(ang), px = -uy, py = ux, gr = r * 0.3;
  var sx = b.x + px * side * r * 0.45, sy = b.y + py * side * r * 0.45;
  var hx = b.x + ux * r * 1.45 + px * side * r * 0.2, hy = b.y + uy * r * 1.45 + py * side * r * 0.2;
  strokeLimb(gr * 0.42, b.char.look ? b.char.look.skin : b.char.color, function () { ctx.moveTo(hx, hy); ctx.lineTo(hx + ux * gr * 1.55, hy + uy * gr * 1.55); });
  hwArm(b, sx, sy, hx, hy, gr, ang);
  return { x: hx + ux * gr * 1.7, y: hy + uy * gr * 1.7 };
}
// The other glove up by his chin, facing `ang`.
function hwGuardHand(b, ang, side) {
  var r = b.r, px = -Math.sin(ang), py = Math.cos(ang);
  var hx = b.x + Math.cos(ang) * r * 0.8 + px * side * r * 0.42, hy = b.y + Math.sin(ang) * r * 0.8 + py * side * r * 0.42;
  drawGloveAt(hx, hy, r * 0.3, b.char, ang);
}

// From draw(), per fighter, after its hands: the Blessed meter, Button Mash
// buttons, the booth, the flashback, pointing to the middle, the celebration.
function drawHolloway(b) {
  if (!b.alive) return;
  var cfg = hwCfg(b), o = balls[1 - b.id];
  if (cfg && cfg.blessed) drawBlessedBar(b, o);
  if (!cfg) return;
  var a = b.hwAct;
  if (a && a.kind === "booth") {
    var tip = hwPointArm(b, hwBooth ? hwBooth.x : b.x, H + 30, 1);
    if (!(b.koPunch && b.koPunch.hw)) hwGuardHand(b, Math.atan2(o.y - b.y, o.x - b.x), -1);
    return;
  }
  if (a && a.kind === "flash") { drawFlashPose(b, a); return; }
  var m = middleOn(b) ? b.igbb : null;
  if (!m) return;
  if (m.phase === "point") {
    var side = m.side > 0 ? -1 : 1, tp = hwPointArm(b, W / 2, H / 2, side);
    hwGuardHand(b, Math.atan2(H / 2 - b.y, W / 2 - b.x), -side);
    // a dashed gold line from his finger to the spot
    var k = Math.min(1, m.t / 0.35), ex = tp.x + (W / 2 - tp.x) * k, ey = tp.y + (H / 2 - tp.y) * k;
    ctx.save();
    ctx.strokeStyle = HW_GOLD; ctx.lineWidth = 3.5; ctx.lineCap = "round";
    ctx.setLineDash([10, 8]); ctx.lineDashOffset = -hwClock * 60;
    ctx.beginPath(); ctx.moveTo(tp.x, tp.y); ctx.lineTo(ex, ey); ctx.stroke();
    ctx.restore();
  } else if (m.phase === "ko") {
    drawKoArms(b, m);
  } else if (m.phase === "final" && b.koPunch && b.koPunch.kind === "big" && b.koPunch.t < b.koPunch.hitAt) {
    // A gold glow round the cocked right hand: the tell for the last punch.
    var kp = b.koPunch, w = kp.t / kp.hitAt, e = Math.min(1, w / 0.8); e = e * e * (3 - 2 * e);
    var ang = Math.atan2(o.y - b.y, o.x - b.x), nx = Math.cos(ang), ny = Math.sin(ang), px = -ny, py = nx;
    var dist = (b.r + 4) + (-b.r * 0.15 - (b.r + 4)) * e, gap = b.r * 0.4 + (b.r * 0.95 - b.r * 0.4) * e;
    var fx = b.x + nx * dist + px * gap, fy = b.y + ny * dist + py * gap;
    ctx.save();
    ctx.globalAlpha = 0.5 + 0.4 * Math.sin(hwClock * 40);
    ctx.strokeStyle = HW_GOLD; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.arc(fx, fy, kp.size * (1.35 + 0.3 * w), 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
  }
}

// His Blessed meter: under the health bar over the ball, teal turning gold.
function drawBlessedBar(b, other) {
  var pinned = (other.grapple && other.grapple.finisher && other.grapple.phase !== "carry") || other.rnc;
  if (pinned) return;
  var bw = 64, bh = 8, bx = b.x - bw / 2, by = b.y - b.r - 18;
  if (by < 4) by = b.y + b.r + 10;
  var y = by + bh + 2, h = 6, p = Math.max(0, Math.min(1, b.hwM || 0)), full = p >= 1;
  ctx.save();
  ctx.fillStyle = theme.grid; ctx.fillRect(bx, y, bw, h);
  ctx.fillStyle = full ? (Math.sin(hwClock * 16) > 0 ? "#fff1b0" : HW_GOLD) : mixHex("#0f9b8e", HW_GOLD, p);
  ctx.fillRect(bx, y, bw * p, h);
  ctx.lineWidth = 1.5; ctx.strokeStyle = theme.wall; ctx.strokeRect(bx, y, bw, h);
  ctx.restore();
  if (full) { // a soft gold glow round him at max volume
    ctx.save();
    ctx.globalAlpha = 0.35 + 0.2 * Math.sin(hwClock * 8);
    ctx.strokeStyle = HW_GOLD; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(b.x, b.y, b.r + 7, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
  }
}

// A controller button: a coloured disc with its letter.
function drawHwButton(x, y, rad, k, lit) {
  ctx.fillStyle = lit ? shadeHex(HW_BTN[k] || "#555555", 0.35) : (HW_BTN[k] || "#555555");
  ctx.strokeStyle = "#0e0e10"; ctx.lineWidth = Math.max(1.5, rad * 0.18);
  if (k === "RB") { ctx.beginPath(); ctx.roundRect(x - rad * 1.35, y - rad * 0.75, rad * 2.7, rad * 1.5, rad * 0.5); }
  else { ctx.beginPath(); ctx.arc(x, y, rad, 0, Math.PI * 2); }
  ctx.fill(); ctx.stroke();
  ctx.fillStyle = "#ffffff"; ctx.font = "900 " + Math.round(rad * (k === "RB" ? 1.05 : 1.25)) + "px Arial, Helvetica, sans-serif";
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillText(k, x, y + rad * 0.05);
}

// Button Mash: each strike's button pops up over his head and floats away
// (over everything, from drawHollowaySky).
function drawHwButtons(b) {
  ctx.save();
  b.hwBtns.forEach(function (bt) {
    var k = bt.t / 0.65, pop = Math.min(1, bt.t / 0.08);
    ctx.globalAlpha = Math.max(0, 1 - k * k);
    var x = b.x + bt.x, y = b.y - b.r - 46 - bt.t * 34, rad = 12 * (0.6 + 0.5 * pop - 0.1 * k);
    drawHwButton(x, y, rad, bt.k, bt.t < 0.1);
  });
  ctx.restore();
}

// In the flashback: gloves down, a thought cloud puffing up off his head.
function drawFlashPose(b, a) {
  var r = b.r, gr = r * 0.3;
  [-1, 1].forEach(function (s) { hwArm(b, b.x + s * r * 0.62, b.y + r * 0.05, b.x + s * r * 0.9, b.y + r * 0.62, gr, Math.PI / 2); });
  var grow = a.phase === "zone" ? Math.min(1, a.t / 0.4) : (a.phase === "back" ? Math.max(0, 1 - a.t / 0.25) : 1);
  ctx.save();
  ctx.fillStyle = "#ffffff"; ctx.strokeStyle = "#151515"; ctx.lineWidth = 2.5;
  [[0.55, 1.25, 0.13], [0.85, 1.65, 0.19], [1.1, 2.15, 0.27]].forEach(function (p, i) {
    var g = Math.max(0, Math.min(1, grow * 3 - i));
    if (g <= 0) return;
    ctx.beginPath(); ctx.arc(b.x + r * p[0], b.y - r * p[1], r * p[2] * g, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  });
  ctx.restore();
}

// The knockout: both arms up, or the BMF belt held up over his head.
function drawKoArms(b, m) {
  var r = b.r, gr = r * 0.3, lift = m.belt ? Math.min(1, m.t / 0.4) : 1;
  var pump = m.belt ? 0 : Math.max(0, Math.sin(m.t * 11)) * r * 0.25;
  var L = { x: b.x - r * 0.75, y: b.y - r * (0.7 + 0.55 * lift) - pump }, R = { x: b.x + r * 0.75, y: b.y - r * (0.7 + 0.55 * lift) - (m.belt ? 0 : Math.max(0, Math.sin(m.t * 11 + Math.PI)) * r * 0.25) };
  hwArm(b, b.x - r * 0.6, b.y - r * 0.45, L.x, L.y, gr, -Math.PI / 2);
  hwArm(b, b.x + r * 0.6, b.y - r * 0.45, R.x, R.y, gr, -Math.PI / 2);
  if (m.belt) drawBmfBelt(b.x, L.y - gr * 0.2, R.x - L.x + gr * 1.6);
}
// The BMF belt: a black strap with a big gold plate.
function drawBmfBelt(cx, cy, w) {
  ctx.save();
  ctx.fillStyle = "#151515"; ctx.strokeStyle = STAGE_INK; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.roundRect(cx - w / 2, cy - 7, w, 14, 4); ctx.fill(); ctx.stroke();
  var g = ctx.createLinearGradient(cx, cy - 17, cx, cy + 17);
  g.addColorStop(0, "#fff3b0"); g.addColorStop(0.5, HW_GOLD); g.addColorStop(1, "#9a7410");
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.ellipse(cx, cy, 24, 17, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  [-1, 1].forEach(function (s) { ctx.beginPath(); ctx.ellipse(cx + s * 30, cy, 7, 9, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); });
  ctx.fillStyle = "#151515"; ctx.font = '900 15px "Barlow Condensed", "Arial Narrow", sans-serif';
  ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("BMF", cx, cy + 1);
  ctx.restore();
}

// Over the jumbotron and everything else (s, ox, oy place the arena): the
// flashback and the clock. From draw().
function drawHollowaySky(s, ox, oy) {
  var btns = balls.some(function (b) { return b.alive && b.hwBtns && b.hwBtns.length; });
  if (!hwFlash && !hwClockFx && !hwBoo && !btns) return;
  ctx.save();
  if (hwFlash) drawFlashback(s, ox, oy);
  ctx.setTransform(s, 0, 0, s, ox, oy);
  balls.forEach(function (b) { if (b.alive && b.hwBtns && b.hwBtns.length) drawHwButtons(b); }); // over the bubbles and move names
  if (hwClockFx) drawMiddleClock(hwClockFx);
  if (hwBoo) drawBoo(hwBoo);
  ctx.restore();
}

// The fight clock for the last 10 seconds: red digits at the top of the cage.
function drawMiddleClock(C) {
  var a = Math.min(1, C.t / 0.2) * (C.out ? Math.max(0, 1 - Math.max(0, C.out - 0.45) / 0.45) : 1);
  if (a <= 0) return;
  var w = 132, h = 52, x = W / 2 - w / 2, y = 12, pop = 1 + C.flash * 0.6;
  ctx.globalAlpha = a;
  ctx.save();
  ctx.translate(W / 2, y + h / 2); ctx.scale(pop, pop); ctx.translate(-W / 2, -(y + h / 2));
  ctx.fillStyle = "#0b0c10"; ctx.strokeStyle = C.n <= 3 ? "#ff3b30" : "#5a5f6b"; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.roundRect(x, y, w, h, 9); ctx.fill(); ctx.stroke();
  ctx.font = '800 13px "Barlow Condensed", "Arial Narrow", sans-serif';
  ctx.fillStyle = "#c9ced8"; ctx.textAlign = "left"; ctx.textBaseline = "middle";
  ctx.fillText("R5", x + 9, y + h / 2);
  ctx.font = '900 38px "Courier New", Courier, monospace';
  ctx.textAlign = "center";
  ctx.shadowColor = "#ff3b30"; ctx.shadowBlur = 12;
  ctx.fillStyle = "#ff4d40";
  ctx.fillText("0:" + (C.n < 10 ? "0" : "") + C.n, x + w / 2 + 10, y + h / 2 + 2);
  ctx.restore();
  ctx.globalAlpha = 1;
}

// "BOOO!" from the crowd when they turn it down.
function drawBoo(B) {
  var a = Math.min(1, B.t / 0.15, (1.4 - B.t) / 0.3);
  if (a <= 0) return;
  ctx.globalAlpha = a;
  ctx.font = '900 44px "Barlow Condensed", "Arial Narrow", sans-serif';
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.lineWidth = 7; ctx.lineJoin = "round"; ctx.strokeStyle = "#151515";
  var y = 46 - B.t * 10;
  ctx.strokeText("BOOOOO!", W / 2, y); ctx.fillStyle = "#ffffff"; ctx.fillText("BOOOOO!", W / 2, y);
  ctx.globalAlpha = 1;
}

// ---------------------------------------------------------------- the flashback, drawn

function drawFlashback(s, ox, oy) {
  var f = hwFlash, owner = balls[f.id], fb = hwCfg(owner) && hwCfg(owner).flashback, a = owner.hwAct;
  if (!fb || !a) return;
  var appear = a.phase === "zone" ? Math.min(1, a.t / fb.zone) : (a.phase === "back" ? Math.max(0, 1 - a.t / fb.back) : 1);
  // Sepia over the whole screen: we're in his head.
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = "rgba(70,42,12," + (0.5 * appear) + ")";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.setTransform(s, 0, 0, s, ox, oy);
  var tvW = 312, tvH = 236, tvX = W / 2 - tvW / 2, tvY = 42;
  var k = 0.25 + 0.75 * easeOut(appear), hx = owner.x + owner.r * 1.1, hy = owner.y - owner.r * 2.2;
  var cx = hx + (W / 2 - hx) * easeOut(appear), cy = hy + (tvY + tvH / 2 + 50 - hy) * easeOut(appear);
  ctx.save();
  ctx.globalAlpha = Math.min(1, appear * 1.6);
  // the thought trail from his head
  ctx.fillStyle = "#ffffff"; ctx.strokeStyle = "#151515"; ctx.lineWidth = 2.5;
  [0.25, 0.5, 0.75].forEach(function (u, i) {
    var x = hx + (cx - hx) * u * 0.6, y = hy + (cy - hy) * u * 0.6;
    ctx.beginPath(); ctx.arc(x, y, 5 + i * 4, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  });
  ctx.translate(cx, cy); ctx.scale(k, k); ctx.translate(-W / 2, -(tvY + tvH / 2 + 50));
  // a cloud behind the TV
  ctx.fillStyle = "#fffaf0";
  [[-0.38, -0.32, 0.3], [0.05, -0.42, 0.34], [0.4, -0.3, 0.28], [-0.46, 0.1, 0.26], [0.46, 0.12, 0.27], [-0.25, 0.42, 0.28], [0.22, 0.44, 0.3], [0, 0.05, 0.42]].forEach(function (c) {
    ctx.beginPath(); ctx.arc(W / 2 + c[0] * 380, tvY + tvH / 2 + 50 + c[1] * 330, c[2] * 250, 0, Math.PI * 2); ctx.fill();
  });
  ctx.font = 'italic 900 24px "Barlow Condensed", "Arial Narrow", sans-serif';
  ctx.textAlign = "left"; ctx.textBaseline = "middle"; ctx.fillStyle = "#6b4a1e";
  ctx.fillText("FLASHBACK...", tvX - 8, tvY - 18);
  // the TV
  ctx.fillStyle = "#3b3530"; ctx.strokeStyle = "#151515"; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.roundRect(tvX, tvY, tvW, tvH, 22); ctx.fill(); ctx.stroke();
  ctx.fillStyle = "#2a2622"; ctx.beginPath(); ctx.roundRect(tvX + tvW - 46, tvY + 18, 32, tvH - 36, 8); ctx.fill();
  [0, 1].forEach(function (i) { ctx.fillStyle = "#8a8178"; ctx.beginPath(); ctx.arc(tvX + tvW - 30, tvY + 48 + i * 40, 9, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); });
  var sw = tvW - 76, sh = sw * 0.75, sx = tvX + 16, sy = tvY + (tvH - sh) / 2; // a 4:3 screen
  drawFlashScreen(f, owner, a, fb, sx, sy, sw, sh);
  // the controller under it
  drawFlashController(f, owner, W / 2, tvY + tvH + 58);
  ctx.restore();
  if (a.phase === "back") { // a white flash: back in the cage
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = "rgba(255,255,255," + Math.max(0, 1 - a.t / fb.back) * 0.85 + ")";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
}

// The game on the TV: the picture is drawn small on its own canvas and blown
// up so it's all big pixels (two balls in a pixel cage), and the words go on
// over it in a chunky monospace so they read on a phone.
function drawFlashScreen(f, owner, a, fb, sx, sy, sw, sh) {
  if (!hwPix) { hwPix = document.createElement("canvas"); hwPix.width = 80; hwPix.height = 60; }
  var g = hwPix.getContext("2d"), pw = 80, ph = 60, u = a.phase === "zone" ? 0 : (a.phase === "tv" ? a.t : fb.tv);
  var oc = balls[1 - owner.id], blink = Math.floor(hwClock * 4) % 2 === 0, words = [];
  var say2 = function (txt, x, y, size, col) { words.push([txt, x, y, size, col]); };
  g.fillStyle = "#0d1430"; g.fillRect(0, 0, pw, ph);
  if (u < 0.6) {
    g.fillStyle = "#ffd23f"; g.fillRect(14, 22, 52, 2); g.fillRect(14, 44, 52, 2); // title rules
    say2("ULTIMATE", pw / 2, 9, 8, "#ffd23f");
    say2("BALL FIGHTING", pw / 2, 17, 8, "#ffd23f");
    say2("2009", pw / 2, 33, 17, "#ff4d40");
    if (blink) say2("PRESS START", pw / 2, 52, 7, "#ffffff");
  } else {
    var t = u - 0.6, n = f.combo, fight = Math.max(0.1, fb.tv - 1.05), hp = Math.max(0.05, 1 - t / fight);
    g.fillStyle = "#2f3a55"; g.fillRect(4, 18, pw - 8, ph - 22); // the cage floor and fence
    g.strokeStyle = "#8b96b3"; g.lineWidth = 1; g.strokeRect(4.5, 18.5, pw - 9, ph - 23);
    g.fillStyle = "#3a0d10"; g.fillRect(3, 3, 32, 4); g.fillRect(pw - 35, 3, 32, 4); // health bars
    g.fillStyle = "#2fd14f"; g.fillRect(3, 3, 32, 4);
    g.fillStyle = hp < 0.3 ? "#ff4d40" : "#2fd14f"; g.fillRect(pw - 35 + 32 * (1 - hp), 3, 32 * hp, 4);
    say2("MAX", 12, 12, 6, "#ffffff");
    say2(oc.char.name.split(" ").pop().toUpperCase().slice(0, 8), pw - 19, 12, 6, "#ffffff");
    // the two balls: him darting in and out with the combo
    var dash = Math.abs(Math.sin(t * 22)) * 7, lx = 24 + dash, rx = 54 + (f.presses.length && f.presses[f.presses.length - 1].t < 0.06 ? 2 : 0);
    [[lx, owner.char.color], [rx, oc.char.color]].forEach(function (p) {
      g.fillStyle = "#151515"; g.beginPath(); g.arc(p[0], 38, 7.5, 0, Math.PI * 2); g.fill();
      g.fillStyle = p[1]; g.beginPath(); g.arc(p[0], 38, 6.5, 0, Math.PI * 2); g.fill();
      g.fillStyle = "#ffffff"; g.fillRect(p[0] - 5, 40, 10, 2);
    });
    if (dash > 5) { g.fillStyle = "#fff3b0"; g.fillRect(lx + 7, 35, 3, 2); g.fillRect(lx + 9, 32, 2, 2); g.fillRect(lx + 9, 39, 2, 2); } // POW
    if (t > fight) say2("K.O.!", pw / 2, 27, 14, blink ? "#ff4d40" : "#ffd23f");
    else if (n > 1) say2(n + " HITS", pw / 2, 25, 8, "#ffd23f");
    // the buttons going in, along the bottom
    f.presses.slice(-6).forEach(function (p, i, arr) {
      var bx = pw / 2 + (i - (arr.length - 1) / 2) * 11, by = 53;
      g.fillStyle = "#0b0b0d"; g.beginPath(); g.arc(bx, by, 5, 0, Math.PI * 2); g.fill();
      g.fillStyle = HW_BTN[p.k]; g.beginPath(); g.arc(bx, by, 4.2, 0, Math.PI * 2); g.fill();
      say2(p.k, bx, by + 0.4, 5.5, "#ffffff");
    });
  }
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(hwPix, sx, sy, sw, sh);
  var kx = sw / pw, ky = sh / ph;
  ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.lineJoin = "round";
  words.forEach(function (w) {
    ctx.font = "900 " + Math.round(w[3] * kx) + 'px "Courier New", Courier, monospace';
    ctx.lineWidth = Math.max(2, w[3] * kx * 0.18); ctx.strokeStyle = "#05070f";
    ctx.strokeText(w[0], sx + w[1] * kx, sy + w[2] * ky);
    ctx.fillStyle = w[4]; ctx.fillText(w[0], sx + w[1] * kx, sy + w[2] * ky);
  });
  // scanlines and the curve of the glass
  ctx.fillStyle = "rgba(0,0,0,0.16)";
  for (var y = sy; y < sy + sh; y += 4) ctx.fillRect(sx, y, sw, 1.5);
  var gl = ctx.createRadialGradient(sx + sw * 0.35, sy + sh * 0.3, 10, sx + sw / 2, sy + sh / 2, sw * 0.75);
  gl.addColorStop(0, "rgba(255,255,255,0.12)"); gl.addColorStop(1, "rgba(0,0,0,0.35)");
  ctx.fillStyle = gl; ctx.fillRect(sx, sy, sw, sh);
  ctx.strokeStyle = "#151515"; ctx.lineWidth = 3; ctx.strokeRect(sx, sy, sw, sh);
  ctx.restore();
}

// An old controller with his gloves on it, mashing the buttons.
function drawFlashController(f, owner, cx, cy) {
  var last = f.presses.length ? f.presses[f.presses.length - 1] : null, lit = last && last.t < 0.08 ? last.k : null;
  ctx.save();
  ctx.fillStyle = "#cfcac2"; ctx.strokeStyle = "#151515"; ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(cx - 70, cy - 22); ctx.lineTo(cx + 70, cy - 22);
  ctx.quadraticCurveTo(cx + 104, cy - 22, cx + 98, cy + 16); ctx.quadraticCurveTo(cx + 92, cy + 44, cx + 66, cy + 30);
  ctx.lineTo(cx - 66, cy + 30); ctx.quadraticCurveTo(cx - 92, cy + 44, cx - 98, cy + 16); ctx.quadraticCurveTo(cx - 104, cy - 22, cx - 70, cy - 22);
  ctx.closePath(); ctx.fill(); ctx.stroke();
  // d-pad
  ctx.fillStyle = "#2a2a2e";
  ctx.fillRect(cx - 72, cy - 4, 30, 10); ctx.fillRect(cx - 62, cy - 14, 10, 30);
  // face buttons
  var spots = { X: [-14, 0], Y: [0, -13], B: [14, 0], A: [0, 13] };
  Object.keys(spots).forEach(function (k) { drawHwButton(cx + 56 + spots[k][0], cy + 1 + spots[k][1], 7.5, k, lit === k); });
  // his gloves: the left thumb on the d-pad, the right one jumping to each button
  var gr = 15, rg = lit ? spots[lit] : [0, 0], press = lit ? 3 : 0;
  ctx.globalAlpha = 0.92;
  drawGloveAt(cx - 57, cy + 14, gr, owner.char, -Math.PI / 2);
  drawGloveAt(cx + 56 + rg[0] * 0.8, cy + 16 + rg[1] * 0.6 + press, gr, owner.char, -Math.PI / 2);
  ctx.globalAlpha = 1;
  if (lit) { // a little burst off the button
    ctx.strokeStyle = HW_BTN[lit]; ctx.lineWidth = 2.5;
    for (var i = 0; i < 6; i++) {
      var an = i / 6 * Math.PI * 2;
      ctx.beginPath(); ctx.moveTo(cx + 56 + rg[0] + Math.cos(an) * 12, cy + 1 + rg[1] + Math.sin(an) * 12); ctx.lineTo(cx + 56 + rg[0] + Math.cos(an) * 19, cy + 1 + rg[1] + Math.sin(an) * 19); ctx.stroke();
    }
  }
  ctx.restore();
}

// ---------------------------------------------------------------- his look (fighter-art.js)

// Polynesian chest piece (bands of shark teeth across both pecs, a spear down
// the sternum, a shoulder cap, the two little birds on his left pec) and
// HOLLOWAY across his stomach, his first tattoo. tattoos.polynesian.
function drawHollowayChest(c, r, lw, contained, look) {
  var ink = "rgba(16,18,26,0.82)", tall = contained ? 0.86 / 0.59 : 1;
  c.save();
  c.fillStyle = ink; c.strokeStyle = ink;
  var band = function (x0, y0, x1, y1, h, n, flip) {
    var dx = (x1 - x0) / n, dy = (y1 - y0) / n;
    c.lineWidth = lw(0.022);
    c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke();
    c.beginPath(); c.moveTo(x0, y0 + h); c.lineTo(x1, y1 + h); c.stroke();
    for (var i = 0; i < n; i++) { // shark teeth
      var ax = x0 + dx * i, ay = y0 + dy * i;
      c.beginPath();
      if ((i + (flip ? 1 : 0)) % 2) { c.moveTo(ax, ay); c.lineTo(ax + dx, ay + dy); c.lineTo(ax + dx / 2, ay + dy / 2 + h); }
      else { c.moveTo(ax, ay + h); c.lineTo(ax + dx, ay + dy + h); c.lineTo(ax + dx / 2, ay + dy / 2); }
      c.closePath(); c.fill();
    }
  };
  // the collar band, and the V under the pecs
  band(-r * 0.62, -r * 0.6, r * 0.62, -r * 0.6, r * 0.085, 12, false);
  band(-r * 0.58, -r * 0.44, -r * 0.05, -r * 0.2, r * 0.07, 6, true);
  band(r * 0.05, -r * 0.2, r * 0.58, -r * 0.44, r * 0.07, 6, true);
  // the spear down the sternum (the sword: being a warrior)
  c.beginPath(); c.moveTo(0, -r * 0.52); c.lineTo(r * 0.045, -r * 0.34); c.lineTo(0, -r * 0.1); c.lineTo(-r * 0.045, -r * 0.34); c.closePath(); c.fill();
  // a shoulder cap on his right shoulder (screen left), solid with a pattern cut in
  c.save();
  c.beginPath(); c.arc(-r * 1.02, -r * 0.3, r * 0.42, 0, Math.PI * 2); c.clip();
  c.globalAlpha = 0.9; c.fillRect(-r, -r, r * 0.42, r * 1.1);
  c.globalAlpha = 1; c.fillStyle = look.skin; // two rows of shark teeth cut out of the ink
  [0.24, 0.36].forEach(function (rad, row) {
    for (var q = 0; q < 7; q++) {
      var a0 = -0.95 + q * 0.27 + row * 0.13, a1 = a0 + 0.2, rr = r * rad, rt = rr + r * 0.06 * (row ? -1 : 1);
      var cx0 = -r * 1.02, cy0 = -r * 0.3;
      c.beginPath();
      c.moveTo(cx0 + Math.cos(a0) * rr, cy0 + Math.sin(a0) * rr);
      c.lineTo(cx0 + Math.cos(a1) * rr, cy0 + Math.sin(a1) * rr);
      c.lineTo(cx0 + Math.cos((a0 + a1) / 2) * rt, cy0 + Math.sin((a0 + a1) / 2) * rt);
      c.closePath(); c.fill();
    }
  });
  c.restore();
  c.fillStyle = ink;
  // two little birds high on his left pec (screen right): him and his son
  c.lineWidth = lw(0.02); c.strokeStyle = ink;
  [[0.3, -0.52], [0.4, -0.5]].forEach(function (p) {
    c.save(); c.translate(r * p[0], r * p[1]); c.scale(1, tall);
    c.beginPath(); c.moveTo(-r * 0.04, 0); c.quadraticCurveTo(-r * 0.02, -r * 0.025, 0, 0); c.quadraticCurveTo(r * 0.02, -r * 0.025, r * 0.04, 0); c.stroke();
    c.restore();
  });
  // HOLLOWAY across his stomach, in bold italic capitals
  c.save();
  c.translate(0, r * 0.16); c.scale(1, tall * 0.8);
  c.font = "italic 900 " + (r * 0.17) + "px Georgia, 'Times New Roman', serif";
  c.textAlign = "center"; c.textBaseline = "middle";
  c.fillStyle = "rgba(16,18,26,0.7)";
  c.fillText("HOLLOWAY", 0, 0);
  c.restore();
  c.restore();
}

// shortsStyle "hibiscus": his UFC 300 kit, white with red and blue hibiscus
// flowers in the colours of Hawaii's flag (look.flowers). Before the waistband.
function drawHibiscusShorts(c, r, look, sTop, band, name) {
  var rnd = artRand(artSeed(name + "hibiscus")), cols = look.flowers || ["#c8102e", "#123b8c"];
  var top = sTop + band, span = r - top;
  var spots = [[-0.78, 0.18], [-0.42, 0.42], [-0.08, 0.14], [0.3, 0.46], [0.68, 0.16], [-0.66, 0.78], [0.56, 0.8], [0.08, 0.74], [0.92, 0.5], [-0.98, 0.5]];
  spots.forEach(function (p, i) {
    var x = p[0] * r, y = top + p[1] * span, sz = r * (0.1 + rnd() * 0.035), col = cols[i % cols.length], rot = rnd() * Math.PI * 2;
    // a leaf behind it
    c.fillStyle = shadeHex(cols[(i + 1) % cols.length], -0.15); c.globalAlpha = 0.55;
    c.beginPath(); c.ellipse(x + Math.cos(rot + 2) * sz * 0.9, y + Math.sin(rot + 2) * sz * 0.9, sz * 0.8, sz * 0.32, rot + 2, 0, Math.PI * 2); c.fill();
    c.globalAlpha = 1;
    c.fillStyle = col;
    for (var pe = 0; pe < 5; pe++) {
      var a = rot + pe * Math.PI * 0.4;
      c.beginPath(); c.ellipse(x + Math.cos(a) * sz * 0.55, y + Math.sin(a) * sz * 0.55, sz * 0.55, sz * 0.4, a, 0, Math.PI * 2); c.fill();
    }
    c.fillStyle = shadeHex(col, -0.4);
    c.beginPath(); c.arc(x, y, sz * 0.28, 0, Math.PI * 2); c.fill();
    c.strokeStyle = "#f6e7a8"; c.lineWidth = Math.max(1, r * 0.018); // the stamen
    c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.cos(rot + 0.6) * sz * 0.9, y + Math.sin(rot + 0.6) * sz * 0.9); c.stroke();
  });
}

// A little Hawaii flag on his left leg: eight white, red and blue stripes
// with the Union Jack in the corner. After the waistband (fighter-art.js).
function drawHawaiiPatch(c, r, look, sTop, band) {
  var w = r * 0.36, h = r * 0.24, x = -r * 0.66, y = sTop + band + r * 0.06;
  c.save();
  var cols = ["#f4f4f2", "#c8102e", "#123b8c"];
  for (var i = 0; i < 8; i++) { c.fillStyle = cols[i % 3]; c.fillRect(x, y + i * h / 8, w, h / 8 + 0.3); }
  var jw = w * 0.46, jh = h * 0.5;
  c.save(); c.beginPath(); c.rect(x, y, jw, jh); c.clip();
  c.fillStyle = "#123b8c"; c.fillRect(x, y, jw, jh);
  c.strokeStyle = "#f4f4f2"; c.lineWidth = jh * 0.22;
  c.beginPath(); c.moveTo(x, y); c.lineTo(x + jw, y + jh); c.moveTo(x + jw, y); c.lineTo(x, y + jh); c.stroke();
  c.strokeStyle = "#c8102e"; c.lineWidth = jh * 0.08; c.stroke();
  c.strokeStyle = "#f4f4f2"; c.lineWidth = jh * 0.34;
  c.beginPath(); c.moveTo(x + jw / 2, y); c.lineTo(x + jw / 2, y + jh); c.moveTo(x, y + jh / 2); c.lineTo(x + jw, y + jh / 2); c.stroke();
  c.strokeStyle = "#c8102e"; c.lineWidth = jh * 0.18; c.stroke();
  c.restore();
  c.strokeStyle = "rgba(0,0,0,0.55)"; c.lineWidth = Math.max(1, r * 0.015); c.strokeRect(x, y, w, h);
  c.restore();
}

// look.waianae: the Waianae fade he brought back for UFC 300, a short strip
// down the middle of the head over the faded sides. After the hair.
function drawWaianaeFade(c, r, look, lw) {
  var hc = look.hairColor;
  c.save();
  var fr = artRand(41); c.fillStyle = shadeHex(hc, -0.1); c.globalAlpha = 0.45;
  for (var i = 0; i < 70; i++) { // fade grain on the sides
    var gx = (fr() < 0.5 ? -1 : 1) * r * (0.3 + fr() * 0.5), gy = -r * (0.8 + fr() * 0.17);
    if (Math.abs(gx) < r * 0.24) continue;
    c.fillRect(gx, gy, r * 0.016, r * 0.016);
  }
  c.globalAlpha = 1;
  var strip = function () {
    c.beginPath();
    c.moveTo(-r * 0.2, -r * 0.78);
    c.quadraticCurveTo(-r * 0.25, -r * 0.92, -r * 0.17, -r * 1.02);
    c.lineTo(r * 0.17, -r * 1.02);
    c.quadraticCurveTo(r * 0.25, -r * 0.92, r * 0.2, -r * 0.78);
    c.quadraticCurveTo(0, -r * 0.85, -r * 0.2, -r * 0.78);
    c.closePath();
  };
  c.fillStyle = hc; strip(); c.fill();
  c.save(); strip(); c.clip();
  c.lineCap = "round";
  for (var s = -4; s <= 4; s++) { // strands combed up and back
    c.strokeStyle = s % 2 ? shadeHex(hc, 0.35) : shadeHex(hc, -0.3); c.globalAlpha = 0.45; c.lineWidth = lw(0.012);
    c.beginPath(); c.moveTo(s * r * 0.045, -r * 0.8); c.quadraticCurveTo(s * r * 0.05 + r * 0.02, -r * 0.9, s * r * 0.04, -r * 1.0); c.stroke();
  }
  c.restore();
  c.globalAlpha = 1;
  c.strokeStyle = shadeHex(hc, -0.4); c.lineWidth = lw(0.016); strip(); c.stroke();
  c.restore();
}

// ---------------------------------------------------------------- gallery (gallery.js)

function hollowaySpecialInfo(sp) {
  return "His real point down (Ricardo Lamas, 2016; the last-second knockout of Justin Gaethje at UFC 300). Only when he's winning. He points down at the middle of the cage and a clock comes up at 0:10. " + sp.acceptChance +
    "% of the time they walk out to the middle with him (Gaethje always) and they trade: his fastest punches in the game (" + sp.damage + " each, one every " + secs(sp.punchEvery) + ", can't be slipped or blocked) against theirs. At 0:01 the big right hand: a knockout " + sp.koBase +
    "% of the time, up to " + (sp.koBase + sp.koLow + sp.koMeter) + "% when they're hurt and his meter is full, otherwise " + sp.finalDamage + " and the bell. A knockout brings up Joe Rogan's UFC 300 call. Turn it down and the crowd boos, and he gets " + Math.round(sp.declineRefund * 100) + "% of his bar back.";
}

function hollowayGalleryMoves(ch, add) {
  var h = ch.holloway, v = h.volume, bl = h.blessed, bo = h.booth, fb = h.flashback, ms = h.mash;
  if (v) add("👊", "Volume", "Combos of " + v.combo[0] + " to " + v.combo[1] + " quick punches off both hands (" + v.damage[0] + " to " + v.damage[1] + " each), a combo every " + secs(v.cooldown[0]) + " down to " + secs(v.cooldown[1]) + ", growing with his Blessed meter.");
  if (bl) add("🙏", "Blessed meter", "Fills with fight time and every punch he lands. The fuller it is, the longer, faster and heavier his combos: the longer it goes, the better he gets.");
  if (ch.tdd) add("🤼", "Takedown defense", "Sprawls on " + ch.tdd.sprawlChance + "% of takedown shots (\"STUFFED\") and punches straight back.");
  if (h.guardRespect) add("🚫", "Stays out of the guard", h.guardRespect.chance + "% of the times they pull guard he won't follow them down: he stays out of the circle until they stand up.");
  if (bo) add("🎙️", "The booth", "Against a striker he's beating, he turns to the commentators: \"Count it up!\", then \"I'm the best boxer in the UFC, baby!\" (Calvin Kattar fight, 2021), slipping " + bo.slip + "% of what they throw without looking and countering. Up to " + bo.max + " times a fight.");
  if (fb) add("🎮", "Flashback", "Once a fight the fight holds and he thinks back to playing an old fighting game (Ultimate Ball Fighting 2009), mashing buttons." + (ms ? " Then " + secs(ms.time) + " of Button Mash: wild " + ms.combo[0] + " to " + ms.combo[1] + " strike combos with the buttons over his head, and a spinning back fist (" + ms.backfist + ")." : ""));
  if (h.gaethje) add("🏆", "vs Justin Gaethje", "Gaethje always meets him in the middle, and the right hand at 0:01 is " + h.gaethje.koBonus + "% more likely to knock him out, like UFC 300. Then he holds up the BMF belt.");
}

function hollowayGallerySounds(groups, synth) {
  groups.push({ title: "Max Holloway", items: [
    synth("Point down", "Pointing to the middle for The Middle (MEET ME IN THE MIDDLE).", function () { playHwPoint(); }),
    synth("Clock tick", "The last 10 seconds counting down.", function () { playHwTick(5); }),
    synth("Bell", "The bell after the last 10 seconds.", function () { playHwBell(); }),
    synth("Boo", "The crowd when they won't meet him in the middle.", function () { playHwBoo(); }),
    synth("Blessed", "His Blessed meter going up a level.", function () { playHwBlessed(0); }),
    synth("Booth", "Turning to the commentators.", function () { playHwBooth(); }),
    synth("Slip", "Slipping a shot at the booth.", function () { playHwSlip(); }),
    synth("Flashback", "Thinking back to the old game.", function () { playHwFlashIn(); }),
    synth("Button press", "Mashing the controller, and Button Mash strikes.", function () { playHwChip("X"); }),
    synth("Combo", "A Button Mash combo.", function () { playHwCombo(6); })
  ] });
}

// ---------------------------------------------------------------- sound
// Synth stand-ins until Joe records the real ones.

function hwAudio(fn) {
  try {
    var ac = getAudioCtx();
    if (!ac) return;
    if (ac.state === "suspended") ac.resume();
    fn(ac, ac.currentTime);
  } catch (e) { /* never let audio break the game */ }
}
// Pointing down: a deep boom under a rising swell.
function playHwPoint() {
  hwAudio(function (ac, t) {
    caneTone(ac, t, "sine", 95, 50, 0.9, 0.5);
    caneBurst(ac, t, 300, 0.8, 0.45, 0.2);
    caneTone(ac, t + 0.05, "triangle", 220, 660, 0.22, 0.55);
  });
}
// The clock counting down: a digital beep, higher for the last three.
function playHwTick(n) {
  hwAudio(function (ac, t) { var f = n <= 3 ? 1320 : 880; caneTone(ac, t, "square", f, f, n <= 1 ? 0.2 : 0.12, n <= 1 ? 0.22 : 0.09); });
}
// The bell: three rings.
function playHwBell() {
  hwAudio(function (ac, t) {
    [0, 0.26, 0.52].forEach(function (d) {
      caneTone(ac, t + d, "sine", 1240, 1225, 0.45, 0.9);
      caneTone(ac, t + d, "sine", 2610, 2590, 0.16, 0.6);
      caneBurst(ac, t + d, 3800, 2, 0.2, 0.03);
    });
  });
}
// A crowd booing: a long low band of noise swelling and falling.
function playHwBoo() {
  hwAudio(function (ac, t) {
    var s = ac.createBufferSource();
    s.buffer = caneNoise(ac); s.loop = true;
    var f = ac.createBiquadFilter(); f.type = "bandpass"; f.Q.value = 2.5;
    f.frequency.setValueAtTime(320, t); f.frequency.linearRampToValueAtTime(240, t + 1.2);
    var g = ac.createGain();
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.55, t + 0.25); g.gain.exponentialRampToValueAtTime(0.0001, t + 1.3);
    s.connect(f); f.connect(g); g.connect(strikeOut(ac));
    s.start(t); s.stop(t + 1.35);
  });
}
// The meter going up a level: a bright little chime.
function playHwBlessed(i) {
  hwAudio(function (ac, t) {
    var base = i ? 990 : 880;
    [0, 0.07, 0.14].forEach(function (d, k) { caneTone(ac, t + d, "sine", base * [1, 1.25, 1.5][k], base * [1, 1.25, 1.5][k], 0.22, 0.35); });
  });
}
// Turning to the booth: a quick crowd "ooh".
function playHwBooth() {
  hwAudio(function (ac, t) { caneBurst(ac, t, 520, 1.4, 0.3, 0.4); caneTone(ac, t, "triangle", 330, 440, 0.12, 0.3); });
}
// A slip: a short whoosh.
function playHwSlip() {
  hwAudio(function (ac, t) { caneBurst(ac, t, 2200, 0.7, 0.32, 0.12); });
}
// Into the flashback: a dreamy wobble sweeping down.
function playHwFlashIn() {
  hwAudio(function (ac, t) {
    var o = ac.createOscillator(), lfo = ac.createOscillator(), lg = ac.createGain(), g = ac.createGain();
    o.type = "sine"; o.frequency.setValueAtTime(900, t); o.frequency.exponentialRampToValueAtTime(260, t + 0.9);
    lfo.frequency.value = 9; lg.gain.value = 40; lfo.connect(lg); lg.connect(o.frequency);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.22, t + 0.08); g.gain.exponentialRampToValueAtTime(0.0001, t + 1.0);
    o.connect(g); g.connect(strikeOut(ac));
    o.start(t); lfo.start(t); o.stop(t + 1.05); lfo.stop(t + 1.05);
  });
}
// And back out of it: a quick zip up.
function playHwFlashOut() {
  hwAudio(function (ac, t) { caneTone(ac, t, "sine", 300, 1400, 0.2, 0.22); });
}
// A button press: an 8-bit blip, a different note for each button.
function playHwChip(k) {
  hwAudio(function (ac, t) {
    var f = { X: 523, Y: 659, A: 784, B: 440, RB: 330 }[k] || 600;
    caneTone(ac, t, "square", f, f * 1.02, 0.09, 0.06);
  });
}
// A combo landing: a little square-wave fanfare.
function playHwCombo(n) {
  hwAudio(function (ac, t) {
    [523, 659, 784, 1047].slice(0, n >= 6 ? 4 : 3).forEach(function (f, i) { caneTone(ac, t + i * 0.07, "square", f, f, 0.1, 0.09); });
  });
}
