// Sean Strickland, "Tarzan" (Christian, 2026-11-13). Middleweight, on the
// Brawler base. Everything below is set in his character file under
// "strickland" (and his teep and special); leave a block out and that part
// is switched off.
//
// Jab and teep  his offense is mostly a stiff, long jab (the base punch) and
//           the teep, a front push kick that shoves them back when they come
//           in (teep.js, the "teep" block: a reusable piece any fighter can
//           have).
// One-two   (strickland.oneTwo) `chance`% of the jabs that land get the right
//           hand behind them, straight down the middle: the punch that dropped
//           Israel Adesanya at UFC 293 (2023), and the jab-then-right that
//           knocked out Alex Garcia (2016). The right is cocked by his chin
//           for `windup` (it glows: the tell), then thrown for `damage` and a
//           `knockback`. After `koAfter` seconds it's a knockout `koBase`% of
//           the time, up to koBase + koLow% the more hurt they are. One every
//           `cooldown` seconds at most.
// Range     (strickland.range) he fights at the end of his jab: inside `keep`
//           (edge to edge) he backs out at an angle, past `press` he walks
//           them down, and in between he circles, switching direction every
//           `switch` seconds. With `squaredUp` he does it facing them, so a
//           shot while he's backing off isn't a grab from behind.
// Philly shell  (strickland.shell) lead hand low across his stomach, rear
//           glove up by his chin. He rolls `chance`% of punches off his
//           shoulder ("SHOULDER ROLL"), `kickChance`% of kicks and
//           `projChance`% of anything thrown, and `counter`% of the time he
//           comes straight back with the jab. Not while he's triggered and storming
//           in (`angryOff`). Takedown defense is the plain "tdd" block:
//           he sprawls `tdd.sprawlChance`% of shots ("STUFFED").
// Cardio    (strickland.cardio) every `every` seconds, up to `max` times, his
//           pace goes up ("PACE"): he moves `speed` and attacks `rate` faster
//           and rolls `shell` more, and from `tiredAt` they're dripping
//           sweat and `tire` slower each step, down to `tireMin`. At step
//           `callAt` the commentary notices (SK_CALLS.cardio).
// Trauma    (strickland.trauma) the bar under his health. It fills as he gets
//           hurt (`hitFill` a hit plus `dmgFill` a point of damage) and when
//           they taunt him (`tauntFill`, "TRIGGERED"): any voice line of
//           theirs, a thumbs down, a celebration, "not impressed". The fuller
//           it is, the faster his special charges: up to `boost` extra
//           seconds of charge a second, shown as the "x" number by the bar.
//           America takes it back down to `keep` of where it was.
// America   his special (special.move "america"). Not before `notBefore`
//           seconds; once the bar is full he waits until he sees weakness
//           (them under `weakHp` of their health, limping, tired, dizzy, or
//           `weakWait` seconds anyway): "SEES WEAKNESS". A bald eagle swoops
//           in to his side (Gaethje's eagle, Joe's picture and screech,
//           allamerican.js), the cameras flash and it gets very America: the
//           U-S-A chant (Joe's clip), flags all over the stands and the mat,
//           fireworks. He gets on a motorcycle and revs it while a red lane
//           shows where he'll ride (it follows them, then locks for `lock`
//           seconds), then rides down it at `speed`: run them over for
//           `bikeDamage` (can't be slipped or blocked) and a knockback into
//           the cage (`walls` wall slams of `wallDamage`), or crash it into
//           the cage. Then he hops off and chases them throwing up to
//           `overhands` overhand rights (`overhandDamage` each, they can be
//           slipped and blocked), each one knocking them toward the nearest
//           corner (`overhandKnock`). Caught in a corner, the punch does
//           `cornerBonus` times the damage ("CORNERED!"). Up to `time`
//           seconds of it, then arms up while the crowd chants.
// Rivals    (strickland.rivals) vs Alex Pereira, who knocked him out with a
//           left hook at UFC 276 (2022): his trauma starts at `trauma`, he
//           can't roll anything thrown in Pereira's CHAMA combo, and
//           Pereira's CHAMA hook gets an extra `hookKo`% knockout roll
//           (pereira.js calls stricklandRematchKo).
// Voice lines (strickland.lines) speech bubbles (speech.js), real quotes
//           only (sources by each line below).
// The calls (SK_CALLS) the real commentary on his real finishes, as the TV
//           lower-third (announce, speech.js), when he lands that move: a
//           one-two knockout, the first one-two, the overhands against the
//           cage, his pace maxing out, and the win.
// His regular moves run on b.sk, the one-two on b.skTwo, America on b.igbb
// (move "america").
"use strict";

// Registered here rather than in special.js's table, so fighters built in
// parallel don't all edit the same line.
SPECIAL_MOVES.america = "America";

// Voice lines. Every one is a real quote (source by each; "1 source" where
// only one outlet has it); swear words are bleeped (speech.js).
var SK_LINES = {
  start: [
    "Here's the [BLEEP] thing, you guys.", // his catchphrase (1 source: sportskeeda.com, Oct 2023)
    "I know a lot of you hate me, a lot of you like me." // to Helen Yee before UFC 293, 2023 (1 source: sports.yahoo.com)
  ],
  // After a shoulder roll and the counter jab.
  roll: [
    "I'm also left-handed, so that's why my jab's so good.", // after Uriah Hall, 2021 (1 source: mmamania.com)
    "I just think I'm one of the best strikers in the world." // UFC 293 presser, 2023 (sherdog.com, sports.yahoo.com)
  ],
  // When he stuffs a takedown.
  stuffed: [
    "Am I fighting an amateur right now?" // UFC 293 presser, 2023 (clutchpoints.com, sherdog.com)
  ],
  // Taunted.
  triggered: [
    "I think I run my mouth a lot and people forget I could fight.", // UFC 293 presser (sherdog.com, clutchpoints.com)
    "I don't crumble. I don't break. You'll see." // before UFC 328, 2026, opening "Everybody he fights crumbles, but" trimmed (1 source: ufc.com)
  ],
  // Rocked by a big shot.
  hurt: [
    "What the [BLEEP] just happened?" // on getting knocked out, UFC.com feature, Dec 2022 (1 source: ufc.com)
  ],
  // His pace going up, late in the fight.
  pace: [
    "The TKO will come in the fourth or fifth round.", // before UFC 328, 2026 (1 source: ufc.com)
    "We got five rounds of fun, you guys. I ain't slowing down, ain't stopping." // UFC Vegas 76 octagon interview, 2023 (youtube.com/watch?v=uKVbYmEZq-U @0:29)
  ],
  america: [
    "Small moments like those bring me the most pride and love for OUR country." // his X post, May 8 2026 (x.com/SStricklandMMA)
  ],
  win: [
    "Am I [BLEEP] dreaming? Am I gonna wake up? Somebody hit me.", // UFC 293 octagon interview, 2023 (fightersonly.com, sports.yahoo.com)
    "I think I might prove myself wrong, you know?" // UFC 293 presser (sports.yahoo.com, sherdog.com)
  ],
  // Against Alex Pereira, who knocked him out at UFC 276 (2022).
  pereira: [
    "UFC, I applaud you, but I might [BLEEP] wrestle." // UFC 276 media day, 2022 (cagesidepress.com, mmamania.com, sports.yahoo.com)
  ],
  pereiraHurt: [
    "Hat's off to Alex, he's a [BLEEP] killer.", // after UFC 276, opening "So" dropped (sports.yahoo.com, sherdog.com)
    "He just touches you and you [BLEEP] fall asleep." // to The Schmo, Nov 2022 (1 source: sportskeeda.com)
  ],
  pereiraAmerica: [
    "As an American, you know, Alex is the American Dream." // MMA Junkie, Feb 2025 (essentiallysports.com, lowkickmma.com)
  ],
  // Alex Pereira's own words about him (translated from Portuguese), said by Pereira.
  byPereiraJab: [
    "He has a really good jab." // after UFC 276, 2022 (1 source: essentiallysports.com)
  ],
  byPereiraHook: [
    "He lowered his hand. When I realized that, boom." // after UFC 276, 2022 (1 source: essentiallysports.com)
  ]
};

// The commentary on his real finishes and wins, word for word from the UFC's
// own uploads (video and time by each). The captions don't say which
// commentator is talking, so those show as COMMENTARY.
var SK_CALLS = {
  // The jab, then the right hand: knockout of Alex Garcia, UFC Fight Night, Feb 21 2016
  // (youtube.com/watch?v=-cgqTKFopEI @20:34; also youtube.com/watch?v=xHiwI04xlSY @0:04).
  ko: { text: "Sean Strickland with a massive KO.", who: "COMMENTARY" },
  // The replay of the one-two that dropped Israel Adesanya, UFC 293, Sept 9 2023 (youtube.com/watch?v=yOuTpiocY3w @5:46).
  oneTwo: { text: "It's the one two and it's the way that he throws it.", who: "COMMENTARY" },
  // Punches until the stop: TKO of Abus Magomedov, UFC Vegas 76, July 1 2023 (youtube.com/watch?v=-cgqTKFopEI @1:34:53-1:35:22).
  hammer: { text: "It's gone. Continuing to hammer away.", who: "COMMENTARY" },
  food: { text: "It almost feels like Sean is playing with his food a little bit.", who: "COMMENTARY" },
  // Round 5 of UFC 293 (youtube.com/watch?v=yOuTpiocY3w @25:47; his name, at the start, left off).
  cardio: { text: "Doesn't even look like he's breathing hard.", who: "COMMENTARY" },
  // The final bell at UFC 293 (youtube.com/watch?v=yOuTpiocY3w @26:57-27:18): for a win in America.
  americaWin: { text: "Sean Strickland in all likelihood is heading back to the United States of America as the undisputed middleweight champion of the world.", who: "COMMENTARY" },
  // The octagon announcer at UFC 328, May 9 2026 (youtube.com/watch?v=gmfZZyXAYXo @8:12-8:39).
  // (The captions don't name him; Bruce Buffer announces the numbered UFC events.)
  win: { text: "And new... and undisputed UFC middleweight champion of the world, Sean Strickland!", who: "BUFFER" }
};

var SK_USA = { red: "#b22234", white: "#ffffff", blue: "#3c3b6e", navy: "#26254f" };
var SK_NO_ROLL = { laser: true, slam: true, grapple: true, finisher: true, flow: true, kickback: true, slugfest: true, kofinal: true, igbb: true };
var SK_KICKS = { kick: true, teep: true };
var SK_HOP = 0.32;        // hopping off the bike
var SK_END = 0.9;         // arms up at the end
var SK_FADE = 2.4;        // the flags and the chant fading out after
var SK_OH_WIND = 0.2, SK_OH_STRIKE = 0.1, SK_OH_FOLLOW = 0.12, SK_OH_REACH = 30; // the overhand right
var SK_PEREIRA = "c-alex-pereira";
var SK_TWO_STRIKE = 0.09, SK_TWO_FOLLOW = 0.14, SK_TWO_KO = 1.4; // the right hand, and standing over them after a knockout
var skClock = 0;
var amShow = null;        // the America show: flags, fireworks, the chant
var amEagle = null;       // the bald eagle at his side
var amWreck = null;       // the bike, rolling away riderless or tumbling off the cage
var amTrail = [];         // exhaust puffs

function skCfg(b) { return b && b.char && b.char.strickland; }
function skRand(r) { return r[0] + Math.random() * (r[1] - r[0]); }
function americaOn(b) { return !!(b && b.igbb && b.igbb.move === "america"); }
function americaOwner() {
  if (!balls) return null;
  for (var i = 0; i < balls.length; i++) if (americaOn(balls[i])) return balls[i];
  return null;
}
function skTurn(a, want, maxStep) {
  var diff = Math.atan2(Math.sin(want - a), Math.cos(want - a));
  return a + Math.max(-maxStep, Math.min(maxStep, diff));
}
function skDemo() { return typeof galleryDemo !== "undefined" && galleryDemo && galleryDemo.kind === "special"; }

// From startMatchSeeded.
function resetStrickland() { skClock = 0; amShow = null; amEagle = null; amWreck = null; amTrail = []; resetChuckNorris(); } // (and Chuck Norris, chuck-norris.js)
// From makeBall (after its weight class is applied).
function initStrickland(b) {
  b.sk = null; b.skRoll = 0; b.skTwo = null;
  var cfg = skCfg(b);
  if (!cfg) return;
  b.sk = {
    trauma: 0, tauntCd: 0, hp: b.hp, saw: {}, fx: 0, mult: 1, fightT: 0,
    pace: 0, paceT: 0, speed0: b.baseSpeed, atk0: b.atkRate,
    side: Math.random() < 0.5 ? -1 : 1, sideT: 2, weakT: 0, rival: null, said: {}, lineCd: 0,
    twoCd: 0, twoWant: false, callAt: null, americaWin: false
  };
  b.skTwo = null;
}

// ---------------------------------------------------------------- every frame

// From update(): rivals, voice lines, the trauma meter, his pace, his range,
// and the America show.
function tickStrickland(dt) {
  skClock += dt;
  tickAmericaShow(dt);
  tickChuckNorris(dt); // Chuck Norris in America (chuck-norris.js)
  if (!balls) return;
  balls.forEach(function (b) {
    var s = b.sk;
    if (!s) return;
    var cfg = skCfg(b), other = balls[1 - b.id];
    if (b.skRoll > 0) b.skRoll = Math.max(0, b.skRoll - dt);
    if (s.fx > 0) s.fx = Math.max(0, s.fx - dt);
    if (s.rival === null) skMeetRival(b, other, cfg);
    skLines(b, other, cfg, dt);
    if (!started || over || !b.alive) { s.hp = b.hp; return; }
    s.fightT += dt;
    skTrauma(b, other, cfg, dt);
    skPace(b, other, cfg, dt);
    skSteer(b, other, cfg, dt);
  });
}

// Who he's fighting, once both are in the cage.
function skMeetRival(b, other, cfg) {
  var id = String(other.char && other.char.id || "");
  b.sk.rival = id.indexOf(SK_PEREIRA) === 0 ? "pereira" : "";
  var rv = cfg.rivals && cfg.rivals[b.sk.rival];
  if (rv && rv.trauma) b.sk.trauma = Math.min(100, rv.trauma); // he remembers UFC 276
}

// One of his lines from SK_LINES[key], `chance`% of the time, when he's free
// to talk. True if he said it.
function skSay(b, key, chance, force) {
  var lc = skCfg(b) && skCfg(b).lines, s = b.sk, pool = SK_LINES[key];
  if (!lc || !s || !pool || !pool.length || !b.alive || !(chance > 0)) return false;
  if (!force && (s.lineCd > 0 || !canSay(b) || b.igbb)) return false;
  if (Math.random() * 100 >= chance) return false;
  say(b, pickLine(b, pool, key));
  s.lineCd = lc.gap || 6;
  return true;
}

// The commentator's call for one of his finishes (SK_CALLS), on the TV
// lower-third (announce, speech.js).
function skCall(b, key) {
  var c = SK_CALLS[key];
  if (!c || !b.sk || typeof announce !== "function") return;
  announce(c.text, { who: c.who });
  b.sk.callAt = skClock;
}

function skLines(b, other, cfg, dt) {
  var lc = cfg.lines, s = b.sk;
  if (!lc) return;
  if (s.lineCd > 0) s.lineCd -= dt;
  if (!started) return;
  if (!s.said.start && !over) {
    s.said.start = true;
    if (s.rival === "pereira") skSay(b, "pereira", 100, true); else skSay(b, "start", lc.start, true);
  }
  if (over && b.alive && !other.alive && !s.said.win) {
    s.winT = (s.winT || 0) + dt;
    if (s.winT > 0.9) {
      s.said.win = true;
      skSay(b, "win", lc.win, true);
      if (s.callAt == null || skClock - s.callAt > 4) skCall(b, s.americaWin ? "americaWin" : "win");
    }
  }
  if (over || !b.alive) return;
  // A takedown he just stuffed.
  if (s.wasSprawl && !b.sprawl && !b.grappled) skSay(b, "stuffed", lc.stuffed);
  s.wasSprawl = !!b.sprawl;
  // A jab that just landed: maybe the right hand behind it, and against
  // Pereira, Pereira's own words about it.
  var ohit = s.ohp != null && other.hp < s.ohp - 0.01, jab = false;
  if (b.punch && b.punch.hit && !b.punch.skSeen) { b.punch.skSeen = true; jab = ohit; }
  if (jab) {
    var ot = cfg.oneTwo;
    if (ot && s.twoCd <= 0 && !b.skTwo && Math.random() * 100 < ot.chance) s.twoWant = true;
  }
  if (s.rival === "pereira" && other.alive) {
    if (jab) s.jabRun = (s.jabRun || 0) + 1; else if (ohit) s.jabRun = 0;
    if (s.jabRun >= 3 && !s.said.byJab && canSay(other) && !other.igbb) { s.said.byJab = true; say(other, pickLine(other, SK_LINES.byPereiraJab, "skJab")); s.saw.talk = true; } // (a compliment, not a taunt)
  }
  s.ohp = other.hp;
}

// ---------------------------------------------------------------- the one-two

function skTwoCut(b) {
  return !b.alive || b.grappled || b.grapple || b.slam || b.sprawl || b.sprawled || subLocked(b) || b.guard || b.koOut || b.shocked ||
    b.dazed || b.dizzy || b.shelled || b.checkStun > 0 || !!b.igbb || swordDuelLocked(b);
}
// Throwing the right (or standing over them after it): the speed regulator
// leaves him alone (physics.js).
function stricklandBusy(b) { return !!(b && b.skTwo); }

// From the abilities loop, before the special: the right hand behind a jab
// that landed. True while it's running.
function updateStrickland(self, other, dt) {
  var s = self.sk, ot = s && skCfg(self).oneTwo;
  if (!ot) return false;
  if (s.twoCd > 0) s.twoCd -= dt;
  var m = self.skTwo;
  if (m && m.phase !== "ko" && (skTwoCut(self) || over || !other.alive)) { self.skTwo = null; return false; }
  if (!m) {
    if (!s.twoWant || self.punch) return false; // (the jab comes back first)
    s.twoWant = false;
    if (!started || over || !other.alive || other.koOut || other.igbb || other.invincible || skTwoCut(self) || self.teep) return false;
    self.skTwo = m = { phase: "wind", t: 0, ang: Math.atan2(other.y - self.y, other.x - self.x) };
    s.twoCd = ot.cooldown;
    playSkWindup();
  }
  m.t += dt;
  var dx = other.x - self.x, dy = other.y - self.y, d = Math.sqrt(dx * dx + dy * dy) || 1, gap = d - self.r - other.r;
  if (m.phase === "ko") {
    self.vx = 0; self.vy = 0;
    if (other.koOut) { var damp = Math.exp(-5 * dt); other.vx *= damp; other.vy *= damp; }
    if (m.t >= SK_TWO_KO) { self.skTwo = null; finishKnockedOut(other); checkEnd(); return false; }
    return true;
  }
  if (m.phase === "wind") {
    var k = Math.exp(-12 * dt); self.vx *= k; self.vy *= k;
    m.ang = skTurn(m.ang, Math.atan2(dy, dx), dt * 8);
    if (m.t >= ot.windup) { m.phase = "strike"; m.t = 0; playWhoosh(); }
    return true;
  }
  if (m.phase === "strike") {
    var step = gap > 4 ? 320 : 0; // a step in behind it
    self.vx = Math.cos(m.ang) * step; self.vy = Math.sin(m.ang) * step;
    if (m.t >= SK_TWO_STRIKE) {
      m.phase = "follow"; m.t = 0;
      if (gap <= ot.reach) landOneTwo(self, other, m, ot); else floater(other.x, other.y - other.r - 8, "WHIFF", "dodge");
    }
    return true;
  }
  var k2 = Math.exp(-10 * dt); self.vx *= k2; self.vy *= k2;
  if (m.t >= SK_TWO_FOLLOW) { self.skTwo = null; if (self.alive && inOrdinaryMovement(self)) setSpeed(self, self.baseSpeed || SPEED); return false; }
  return true;
}

function landOneTwo(self, other, m, ot) {
  if (!other.alive || other.koOut) return;
  var s = self.sk, dx = other.x - self.x, dy = other.y - self.y, d = Math.sqrt(dx * dx + dy * dy) || 1, ux = dx / d, uy = dy / d;
  var ko = s.fightT >= ot.koAfter && !other.holdAtOne && Math.random() * 100 < ot.koBase + ot.koLow * (1 - other.hp / MAX_HP);
  if (ko) {
    // Goes through every normal defence (weave, block, roll...) like the KO Rush.
    if (throwKoPunch(self, other)) {
      m.phase = "ko"; m.t = 0;
      floater(self.x, self.y - self.r - 30, "ONE-TWO!", "crit");
      skCall(self, "ko");
      crowdReact(1);
    }
    return;
  }
  var dealt = hurt(other, ot.damage, "punch", self.id);
  if (dealt > 0) {
    if (!other.justDodged && teepPushable(other)) { other.vx += ux * ot.knockback; other.vy += uy * ot.knockback; }
    other.squash = { t: 0.18, max: 0.18, nx: -ux, ny: -uy };
    impacts.push({ x: other.x - ux * other.r, y: other.y - uy * other.r, nx: -ux, ny: -uy, life: 0.4, max: 0.4, color: self.char.color });
    floater(other.x, other.y - other.r - 34, "ONE-TWO!", "note");
    hitStop = Math.max(hitStop, 0.06);
    if (!reduceMotion) shake = Math.max(shake, 12);
    playPunch(dealt * 1.4);
    crowdReact(0.5);
    checkEnd();
    if (!other.alive) skCall(self, "ko");
    else if (!s.said.callTwo) { s.said.callTwo = true; skCall(self, "oneTwo"); }
    return;
  }
  checkEnd();
}

// ---------------------------------------------------------------- trauma

function addTrauma(b, amt, taunt) {
  var s = b.sk, tc = skCfg(b).trauma;
  if (!tc || !(amt > 0) || !b.alive) return;
  var was = s.trauma;
  s.trauma = Math.min(100, s.trauma + amt);
  if (taunt) {
    floater(b.x, b.y - b.r - 44, "TRIGGERED", "crit");
    s.fx = 0.6;
    playSkTriggered();
    var lc = skCfg(b).lines;
    if (lc) skSay(b, "triggered", lc.triggered);
  }
  if (was < 100 && s.trauma >= 100) floater(b.x, b.y - b.r - 70, "TRAUMA MAXED", "note");
}

function skTrauma(b, other, cfg, dt) {
  var tc = cfg.trauma, s = b.sk;
  var lost = s.hp - b.hp;
  s.hp = b.hp;
  var lc = cfg.lines;
  if (lc && lost >= lc.hurtAt && b.alive && !americaOn(b)) {
    // Rocked. Against Pereira, his CHAMA hook (Pereira has a line for it too).
    if (s.rival === "pereira" && other.chama) {
      if (!s.said.byHook && other.alive && canSay(other)) { s.said.byHook = true; say(other, pickLine(other, SK_LINES.byPereiraHook, "skHook")); s.saw.talk = true; }
      else skSay(b, "pereiraHurt", lc.hurt);
    } else skSay(b, "hurt", lc.hurt);
  }
  if (!tc) return;
  if (lost > 0.01 && !americaOn(b)) addTrauma(b, tc.hitFill + lost * tc.dmgFill, false);
  // Taunts: anything they say, a thumbs down, being wound up into storming
  // at them, a celebration, "not impressed".
  if (s.tauntCd > 0) s.tauntCd -= dt;
  var cues = { talk: speaking(other), angry: !!b.angry, mock: !!other.mock, gsp: !!other.gspTaunt, party: !!(other.taunt && other.taunt.t >= 0) };
  var taunted = false;
  Object.keys(cues).forEach(function (k) { if (cues[k] && !s.saw[k]) taunted = true; s.saw[k] = cues[k]; });
  if (taunted && s.tauntCd <= 0 && other.alive) { s.tauntCd = tc.tauntGap; addTrauma(b, tc.tauntFill, true); }
  // The fuller it is, the faster the special charges.
  s.mult = 1 + (tc.boost || 0) * s.trauma / 100;
  var sp = b.char.special;
  if (b.char.hasSpecial && sp && !b.igbb && b.specialT < sp.chargeTime) b.specialT = Math.min(sp.chargeTime, b.specialT + dt * (s.mult - 1));
}

// ---------------------------------------------------------------- cardio

function skPace(b, other, cfg, dt) {
  var pc = cfg.cardio, s = b.sk;
  if (!pc) return;
  s.paceT += dt;
  if (s.pace < pc.max && s.paceT >= pc.every) {
    s.paceT -= pc.every;
    s.pace++;
    floater(b.x, b.y - b.r - 44, "PACE " + s.pace, "crit");
    if (s.pace >= pc.tiredAt && other.alive) floater(other.x, other.y - other.r - 30, s.pace >= pc.tiredAt + 2 ? "GASSED" : "TIRED", "note");
    playSkPace(s.pace);
    var lc = cfg.lines;
    if (lc && s.pace === lc.paceAt) skSay(b, "pace", lc.pace);
    if (s.pace === (pc.callAt || pc.max) && other.alive) skCall(b, "cardio");
  }
  b.baseSpeed = s.speed0 * (1 + pc.speed * s.pace);
  b.atkRate = s.atk0 * (1 + pc.rate * s.pace);
  var steps = s.pace - pc.tiredAt + 1;
  if (steps > 0 && pc.tire && other.alive) {
    var mult = Math.max(pc.tireMin, 1 - pc.tire * steps), sl = slowedBy(other, "skTired");
    if (!sl || sl.t < 0.3 || sl.mult !== mult) addSlow(other, mult, 1, "skTired");
    // Sweat flying off them (Mighty Mouse's sweat drops, mighty-mouse.js).
    if (!reduceMotion && typeof mmSweat !== "undefined" && Math.random() < dt * (1.2 + steps * 1.4)) {
      var a = -Math.PI / 2 + (Math.random() - 0.5) * 2.2;
      mmSweat.push({ x: other.x + Math.cos(a) * other.r * 0.8, y: other.y + Math.sin(a) * other.r * 0.8, vx: Math.cos(a) * (60 + Math.random() * 70), vy: Math.sin(a) * (60 + Math.random() * 70) - 40, t: 0, dur: 0.55 + Math.random() * 0.25 });
    }
  }
}

// ---------------------------------------------------------------- range

// At the end of his jab: backs out at an angle when they get too close,
// walks them down when they're far, circles in between.
function skSteer(b, other, cfg, dt) {
  var rc = cfg.range, s = b.sk;
  if (!rc || !inOrdinaryMovement(b) || b.dizzy || b.angry || !other.alive || other.koOut) return;
  s.sideT -= dt;
  if (s.sideT <= 0) { s.side = -s.side; s.sideT = skRand(rc.switch); }
  var dx = other.x - b.x, dy = other.y - b.y, d = Math.sqrt(dx * dx + dy * dy) || 1, gap = d - b.r - other.r;
  var to = Math.atan2(dy, dx), want, rate;
  if (gap < rc.keep) { want = to + Math.PI - s.side * rc.angle; rate = rc.rate; }
  else if (gap > rc.press) { want = to + s.side * 0.3; rate = rc.rate * 0.45; }
  else { want = to + s.side * (Math.PI / 2 - 0.3); rate = rc.rate * 0.55; }
  var sp = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
  if (sp < 1) return;
  var cur = Math.atan2(b.vy, b.vx), nu = skTurn(cur, want, rate * dt);
  b.vx = Math.cos(nu) * sp; b.vy = Math.sin(nu) * sp;
}

// He backs out and circles squared up to them, never turning his back: the
// grappling code's "which way is he facing" says at them (facingOf,
// grapple-duel.js), so a shot while he's backing off isn't a grab from behind.
function stricklandSquaredUp(b) {
  var rc = skCfg(b) && skCfg(b).range;
  return !!(rc && rc.squaredUp && b.sk && b.alive && !b.angry && !b.igbb);
}

// ---------------------------------------------------------------- the Philly shell

// From hurt (match.js), before the weave: rolling it off his shoulder. True
// if it's rolled.
function stricklandShell(b, source, attackerId) {
  var cfg = skCfg(b), sc = cfg && cfg.shell;
  if (!sc || !b.sk || !b.alive || attackerId == null || attackerId === b.id || SK_NO_ROLL[source]) return false;
  if (b.grappled || b.grapple || b.slam || b.sprawl || b.sprawled || subLocked(b) || b.igbb || b.koOut || b.shocked || b.dazed ||
      b.dizzy || b.shelled || b.guard || b.teep) return false;
  if (sc.angryOff && b.angry) return false; // triggered: storming in, shell forgotten
  var atk = balls[attackerId];
  if (b.sk.rival === "pereira" && atk && atk.chama) return false; // the combo that got him at UFC 276
  var proj = !!PROJECTILE_SOURCES[source], kick = !!SK_KICKS[source];
  var chance = proj ? sc.projChance : kick ? sc.kickChance : sc.chance;
  chance += b.sk.pace * ((cfg.cardio && cfg.cardio.shell) || 0);
  if (Math.random() * 100 >= chance) return false;
  b.weaveAnim = { t: 0, dur: 0.22, sign: Math.random() < 0.5 ? -1 : 1 };
  b.skRoll = 0.3;
  floater(b.x, b.y - b.r - 8, "SHOULDER ROLL", "dodge");
  b.justDodged = true;
  playSkRoll();
  if (sc.counter && !proj && Math.random() * 100 < (sc.counter === true ? 100 : sc.counter)) b.punchCd = 0; // straight back with the jab
  if (cfg.lines) skSay(b, "roll", cfg.lines.roll);
  return true;
}

// From Alex Pereira's CHAMA hook (pereira.js): the left hook that knocked
// him out at UFC 276 gets another knockout roll.
function stricklandRematchKo(attacker, vic) {
  var cfg = skCfg(vic), rv = cfg && cfg.rivals && cfg.rivals.pereira;
  return !!(rv && vic.sk && vic.sk.rival === "pereira" && Math.random() * 100 < (rv.hookKo || 0));
}

// ---------------------------------------------------------------- America

function skWeak(self, other, sp) {
  if (skDemo()) return "demo";
  if (other.hp <= sp.weakHp * MAX_HP) return "hurt";
  if (other.dizzy || other.dazed || slowMult(other) < 0.97) return "slow";
  return self.sk && self.sk.weakT >= sp.weakWait ? "wait" : null;
}

// From updateSpecial (special.js) for special.move "america".
function updateAmerica(self, other, dt) {
  var sp = self.char.special, m = self.igbb;
  if (!m) {
    if (self.specialT < sp.chargeTime) return false;
    if (!skDemo() && (self.sk ? self.sk.fightT : 99) < sp.notBefore) return false;
    if (self.sk) self.sk.weakT += dt;
    if (!canStartIgbb(self, other) || teepBusy(self) || swordDuelActive() || !skWeak(self, other, sp)) return false;
    clearActions(self);
    self.teep = null;
    m = self.igbb = { move: "america", phase: "eagle", t: 0, aim: Math.atan2(other.y - self.y, other.x - self.x), locked: false };
    if (self.sk) self.sk.weakT = 0;
    floater(other.x, other.y - other.r - 30, "!", "crit");
    floater(self.x, self.y - self.r - 30, "SEES WEAKNESS", "crit");
    amEagle = { x: self.x + 260, y: -260, t: 0, flap: 0, mode: "in", owner: self.id, k: 1 };
    playEagleScreech(); // Joe's screech (audio.js)
    crowdReact(0.8);
  }
  if (m.move !== "america") return false;
  if (self.sprawl || self.sprawled || self.grappled || self.grapple || subLocked(self)) {
    // Caught before he's on the bike (a shot he sprawled, say): the scramble
    // plays out instead and the bar stays full. Later, it's over.
    if (m.phase === "eagle" || m.phase === "flags") { self.igbb = null; skEagleLeaves(); } else endAmerica(self);
    return false;
  }
  m.t += dt;
  if (over && m.phase !== "end") { endAmerica(self); return false; }
  var dx = other.x - self.x, dy = other.y - self.y, d = Math.sqrt(dx * dx + dy * dy) || 1, want = Math.atan2(dy, dx);
  if (m.phase === "eagle" || m.phase === "flags" || m.phase === "rev") {
    self.vx = 0; self.vy = 0;
    if (m.phase !== "rev" || m.t < sp.rev - sp.lock) m.aim = skTurn(m.aim, want, dt * 6);
    m.face = skFace(m.aim, m.face);
    if (m.phase === "eagle" && m.t >= sp.eagle) {
      m.phase = "flags"; m.t = 0;
      startAmericaShow(self);
      chuckNorrisArrives(self, other); // Chuck Norris rappels in (chuck-norris.js)
      floater(self.x, self.y - self.r - 30, "AMERICA!", "crit");
      var lc = skCfg(self) && skCfg(self).lines;
      if (lc) skSay(self, self.sk && self.sk.rival === "pereira" ? "pereiraAmerica" : "america", lc.america, true);
    } else if (m.phase === "flags" && m.t >= sp.flags) {
      m.phase = "rev"; m.t = 0; m.bikeK = 0;
      floater(self.x, self.y - self.r - 30, "VROOM VROOM!", "note");
      playSkRev(sp.rev);
    } else if (m.phase === "rev") {
      m.bikeK = Math.min(1, m.t / 0.25);
      // Rolls back for a run at them if they're right on top of him.
      if (d - self.r - other.r < sp.runUp) skRollBack(self, -dx / d, -dy / d, 220 * dt);
      if (!m.locked && m.t >= sp.rev - sp.lock) { m.locked = true; playSkLock(); }
      if (m.t >= sp.rev) { m.phase = "ride"; m.t = 0; m.skip = 0; m.spin = 0; playSkRide(); }
    }
    return true;
  }
  if (m.phase === "ride") return rideAmerica(self, other, m, sp, dt);
  if (m.phase === "hop") {
    self.vx = 0; self.vy = 0;
    if (m.t >= SK_HOP) { m.phase = "overhands"; m.t = 0; m.oh = { n: 0, state: "chase", t: 0, ang: want, landed: 0 }; m.ohT = 0; }
    return true;
  }
  if (m.phase === "overhands") return overhandsAmerica(self, other, m, sp, dt);
  if (m.phase === "end") {
    self.vx = 0; self.vy = 0;
    if (m.t >= SK_END) { endAmerica(self); return false; }
    return true;
  }
  return false;
}

// Moves him by hand (the physics leaves a fighter in a special alone),
// kept inside the cage.
function skRollBack(self, ux, uy, step) {
  self.x = Math.min(W - self.r, Math.max(self.r, self.x + ux * step));
  self.y = Math.min(H - self.r, Math.max(self.r, self.y + uy * step));
}

// Riding down the lane in small steps (so he can't skip through them).
function rideAmerica(self, other, m, sp, dt) {
  m.aim = skTurn(m.aim, Math.atan2(other.y - self.y, other.x - self.x), dt * (sp.turn || 0)); // leans after them a little
  m.face = skFace(m.aim, m.face);
  var ux = Math.cos(m.aim), uy = Math.sin(m.aim), dist = sp.speed * dt, n = Math.max(1, Math.ceil(dist / 8)), h = dist / n;
  self.vx = 0; self.vy = 0;
  m.skip = Math.max(0, m.skip - dt);
  m.spin += dist / (self.r * 0.42);
  for (var i = 0; i < n; i++) {
    self.x += ux * h; self.y += uy * h;
    var nx = 0, ny = 0;
    if (self.x < self.r) { self.x = self.r; nx = 1; } else if (self.x > W - self.r) { self.x = W - self.r; nx = -1; }
    if (self.y < self.r) { self.y = self.r; ny = 1; } else if (self.y > H - self.r) { self.y = H - self.r; ny = -1; }
    if (nx || ny) { crashBike(self, m, nx, ny); return true; }
    var ox = other.x - self.x, oy = other.y - self.y, reach = self.r + other.r + 14;
    if (m.skip <= 0 && other.alive && !other.koOut && ox * ox + oy * oy < reach * reach) {
      if (bikeHit(self, other, m, sp, ux, uy)) return true;
      m.skip = 0.3; // they got out of it (teleported, or untouchable): rides on past
    }
  }
  if (!reduceMotion && Math.random() < 0.8) amTrail.push({ x: self.x - ux * self.r * 1.5, y: self.y - uy * self.r * 1.5 + self.r * 0.5, vx: -ux * 90 + (Math.random() - 0.5) * 40, vy: -uy * 90 - 30, t: 0, dur: 0.5 });
  if (m.t > 1.4) crashBike(self, m, -ux, -uy); // (never rides forever)
  return true;
}

// Ran them over: the hit and a knockback into the cage, then he hops off and
// the bike rolls on without him.
function bikeHit(self, other, m, sp, ux, uy) {
  var dealt = hurt(other, sp.bikeDamage, "igbb", self.id);
  if (other.justDodged) return false;
  var cx = other.x - ux * other.r, cy = other.y - uy * other.r;
  impacts.push({ x: cx, y: cy, nx: -ux, ny: -uy, life: 0.6, max: 0.6, color: SK_USA.red });
  impacts.push({ x: cx, y: cy, nx: -ux, ny: -uy, life: 0.8, max: 0.8, color: "#ffffff" });
  igbbSparks(cx, cy, -ux, -uy, "#ffe9a8", 30, 620);
  igbbSparks(cx, cy, -ux, -uy, SK_USA.blue, 12, 420);
  other.flash = 0.2;
  other.squash = { t: 0.3, max: 0.3, nx: -ux, ny: -uy };
  hitStop = Math.max(hitStop, 0.16);
  if (!reduceMotion) shake = Math.max(shake, 26);
  playSkBikeHit(dealt);
  crowdReact(1);
  checkEnd();
  if (!other.alive && self.sk) self.sk.americaWin = true;
  floater(other.x, other.y - other.r - 30, "RUN OVER!", "crit");
  if (other.alive && !other.grappled && !other.grapple && !subLocked(other)) {
    clearActions(other);
    beginWallSlam(other, ux, uy, { wallSlams: sp.walls, slamDamage: sp.wallDamage, knockback: sp.knockback });
  }
  amWreck = { x: self.x, y: self.y, vx: ux * 520, vy: uy * 520, ang: m.aim, spin: 0, wheel: m.spin, t: 0, crash: false, face: m.face };
  m.phase = "hop"; m.t = 0;
  return true;
}

// Missed: straight into the cage. The bike bounces off it in a shower of
// sparks and he jumps clear.
function crashBike(self, m, nx, ny) {
  var cx = self.x - nx * self.r, cy = self.y - ny * self.r;
  impacts.push({ x: cx, y: cy, nx: nx, ny: ny, life: 0.5, max: 0.5, color: theme.wall });
  igbbSparks(cx, cy, nx, ny, "#ffe9a8", 26, 560);
  floater(self.x, self.y - self.r - 30, "CRASH!", "note");
  hitStop = Math.max(hitStop, 0.08);
  if (!reduceMotion) shake = Math.max(shake, 16);
  playSkCrash();
  crowdReact(0.6);
  amWreck = { x: self.x, y: self.y, vx: nx * 380 - Math.cos(m.aim) * 120, vy: ny * 380 - Math.sin(m.aim) * 120, ang: m.aim, spin: (Math.random() < 0.5 ? -1 : 1) * 7, wheel: m.spin, t: 0, crash: true, face: m.face };
  self.squash = { t: 0.24, max: 0.24, nx: nx, ny: ny };
  m.phase = "hop"; m.t = 0;
}

// Overhand rights, chasing them toward a corner.
function overhandsAmerica(self, other, m, sp, dt) {
  var o = m.oh;
  o.t += dt;
  m.ohT += dt;
  if (!other.alive) { m.phase = "end"; m.t = 0; return true; }
  var dx = other.x - self.x, dy = other.y - self.y, d = Math.sqrt(dx * dx + dy * dy) || 1, gap = d - self.r - other.r;
  var ux = dx / d, uy = dy / d;
  if (o.state === "chase") {
    if (o.n >= sp.overhands - chuckNorrisOverhandCut(self) || m.ohT > sp.time) { skFinish(self, m); return true; } // (Chuck Norris's roundhouse takes the place of some, chuck-norris.js)
    var step = (other.slam ? sp.chase * 0.6 : sp.chase) * dt;
    if (gap > SK_OH_REACH) skRollBack(self, ux, uy, Math.min(step, gap - SK_OH_REACH + 2));
    if (gap <= SK_OH_REACH + 4 && !other.slam) {
      o.state = "wind"; o.t = 0; o.ang = Math.atan2(dy, dx); o.hit = false;
      if (o.n === 0) floater(self.x, self.y - self.r - 30, "OVERHANDS!", "crit");
      playSkWindup();
    }
    return true;
  }
  if (o.state === "wind") {
    o.ang = skTurn(o.ang, Math.atan2(dy, dx), dt * 8);
    if (gap > 6) skRollBack(self, ux, uy, Math.min(90 * dt, gap - 6));
    if (o.t >= SK_OH_WIND) { o.state = "strike"; o.t = 0; playWhoosh(); }
    return true;
  }
  if (o.state === "strike") {
    if (gap > 2) skRollBack(self, ux, uy, Math.min(300 * dt, gap - 2));
    if (o.t >= SK_OH_STRIKE) {
      o.state = "follow"; o.t = 0;
      if (gap <= SK_OH_REACH + 10 && !other.koOut) landOverhand(self, other, m, sp, ux, uy);
      else floater(other.x, other.y - other.r - 8, "WHIFF", "dodge");
    }
    return true;
  }
  // follow: the arm comes back, then the next one.
  if (o.t >= SK_OH_FOLLOW) { o.n++; o.state = "chase"; o.t = 0; }
  return true;
}

// In a corner, or pinned right up against the cage.
function skCornered(b) {
  var m = b.r + 40, n = b.r + 12;
  return ((b.x < m || b.x > W - m) && (b.y < m || b.y > H - m)) || b.x < n || b.x > W - n || b.y < n || b.y > H - n;
}

function landOverhand(self, other, m, sp, ux, uy) {
  var corner = skCornered(other), dmg = sp.overhandDamage * (corner ? sp.cornerBonus : 1);
  var dealt = hurt(other, dmg, "punch", self.id);
  if (dealt <= 0) return;
  m.oh.landed++;
  if (corner) floater(other.x, other.y - other.r - 34, "CORNERED!", "crit");
  // Knocked toward the nearest corner.
  var cx = other.x < W / 2 ? 0 : W, cy = other.y < H / 2 ? 0 : H;
  var kx = cx - other.x, ky = cy - other.y, kl = Math.sqrt(kx * kx + ky * ky) || 1;
  var px = kx / kl * 0.65 + ux * 0.35, py = ky / kl * 0.65 + uy * 0.35, pl = Math.sqrt(px * px + py * py) || 1;
  if (!other.justDodged && teepPushable(other)) { other.vx = px / pl * sp.overhandKnock; other.vy = py / pl * sp.overhandKnock; other.knockFly = 0.22; }
  other.squash = { t: 0.2, max: 0.2, nx: -ux, ny: -uy };
  impacts.push({ x: other.x - ux * other.r, y: other.y - uy * other.r, nx: -ux, ny: -uy, life: 0.35, max: 0.35, color: m.oh.n % 2 ? SK_USA.red : SK_USA.blue });
  hitStop = Math.max(hitStop, corner ? 0.09 : 0.05);
  if (!reduceMotion) shake = Math.max(shake, corner ? 16 : 11);
  playPunch(dealt * 1.3);
  crowdReact(0.5);
  if (amShow) amShow.cheer = 0.5;
  checkEnd();
  if (!other.alive) { self.sk.americaWin = true; if (corner) skCall(self, "hammer"); }
  else if (m.oh.landed === 3 && !self.sk.said.food) { self.sk.said.food = true; skCall(self, "food"); }
}

// Done: arms up, the crowd chanting.
function skFinish(self, m) {
  m.phase = "end"; m.t = 0;
  floater(self.x, self.y - self.r - 30, "USA! USA!", "crit");
  if (amShow) { amShow.burst = 4; amShow.cheer = 1; }
  playUsaChant(); // Joe's U-S-A chant (audio.js)
  crowdReact(1);
}

function endAmerica(self) {
  var cfg = skCfg(self), tc = cfg && cfg.trauma;
  self.igbb = null; self.koPunch = null;
  self.specialT = 0;
  if (self.sk && balls && !balls[1 - self.id].alive) self.sk.americaWin = true;
  if (self.sk && tc) self.sk.trauma *= tc.keep != null ? tc.keep : 0;
  if (amShow) amShow.live = false;
  skEagleLeaves();
  if (self.alive) setSpeed(self, self.baseSpeed || SPEED);
}

function skEagleLeaves() { if (amEagle) { amEagle.mode = "out"; amEagle.t = 0; } }

// ---------------------------------------------------------------- the show

function startAmericaShow(self) {
  amShow = { t: 0, live: true, k: 0, beatT: 0.3, echoes: [], fireworks: [], fwT: 0, burst: 3, cheer: 1 };
  cameraFlash(); // the cameras go off (dobronx.js)
  playUsaChant(); // Joe's U-S-A chant (audio.js)
  crowdReact(1);
}

function tickAmericaShow(dt) {
  if (amTrail.length) { amTrail.forEach(function (p) { p.t += dt; p.x += p.vx * dt; p.y += p.vy * dt; }); amTrail = amTrail.filter(function (p) { return p.t < p.dur; }); }
  if (amWreck) {
    var w = amWreck;
    w.t += dt; w.x += w.vx * dt; w.y += w.vy * dt;
    w.vx *= Math.exp(-2.2 * dt); w.vy *= Math.exp(-2.2 * dt);
    w.ang += w.spin * dt; w.spin *= Math.exp(-1.5 * dt);
    w.wheel += Math.sqrt(w.vx * w.vx + w.vy * w.vy) * dt / 16;
    if (w.x < 0 || w.x > W) w.vx = -w.vx * 0.5;
    if (w.y < 0 || w.y > H) w.vy = -w.vy * 0.5;
    if (w.t > 1.6) amWreck = null;
  }
  tickSkEagle(dt);
  var s = amShow;
  if (!s) return;
  s.t += dt;
  s.k = s.live ? Math.min(1, s.k + dt * 3) : Math.max(0, s.k - dt / SK_FADE);
  if (!s.live && s.k <= 0) { amShow = null; return; }
  if (s.cheer > 0) s.cheer -= dt;
  // Fireworks: a steady show while it's on, a barrage on the big moments.
  s.fwT -= dt;
  if (s.live && (s.fwT <= 0 || s.burst > 0)) {
    s.fwT = 0.55;
    var n = Math.max(1, s.burst);
    s.burst = 0;
    for (var i = 0; i < n; i++) s.fireworks.push(skFirework(i * 0.15));
  }
  s.fireworks.forEach(function (f) { f.t += dt; });
  s.fireworks = s.fireworks.filter(function (f) { return f.t < 1.1; });
  // "U-S-A! U-S-A!" from the stands.
  if (s.live) {
    s.beatT -= dt;
    if (s.beatT <= 0) { s.beatT = 1.5; s.echoes.push({ t: 0, spots: skChantSpots() }); crowdReact(0.35); }
  }
  s.echoes.forEach(function (e) { e.t += dt; });
  s.echoes = s.echoes.filter(function (e) { return e.t < 1.6; });
}

// A firework over the stands (stage units) or over the top of the test arena.
function skFirework(delay) {
  var cols = [SK_USA.red, "#ffffff", "#4d7dff"], st = stadiumOn();
  return { x: st ? 120 + Math.random() * (STAGE_W - 240) : 40 + Math.random() * (W - 80), y: st ? 60 + Math.random() * 70 : 20 + Math.random() * 80,
    t: -(delay || 0), color: cols[Math.floor(Math.random() * 3)], seed: Math.random() * 6, k: st ? 1.3 : 0.9 }; // (in the stadium, over the top stands, above the jumbotron)
}

function skChantSpots() {
  var spots = [];
  for (var i = 0; i < 5; i++) {
    if (stadiumOn()) {
      if (i < 3) spots.push({ x: 180 + i * 360 + (Math.random() - 0.5) * 140, y: 1450 + Math.random() * 110, d: i * 0.08 });
      else spots.push({ x: i === 3 ? 122 : STAGE_W - 122, y: 700 + Math.random() * 560, d: 0.12 + Math.random() * 0.1 });
    } else spots.push({ x: 60 + i * 95 + (Math.random() - 0.5) * 30, y: i % 2 ? H - 22 : 22, d: i * 0.06 });
  }
  return spots;
}

// The eagle: in from the sky to his side, along beside the bike, overhead
// for the overhands, then off up into the sky.
function tickSkEagle(dt) {
  var e = amEagle;
  if (!e) return;
  e.t += dt; e.flap += dt * 14;
  var b = balls && balls[e.owner];
  if (!b) { amEagle = null; return; }
  var m = b.igbb, tx, ty, k;
  if (e.mode === "out" || !americaOn(b)) {
    e.mode = "out";
    tx = e.x + 420; ty = e.y - 700; k = Math.min(1, dt * 1.6);
    e.x += (tx - e.x) * k; e.y += (ty - e.y) * k;
    if (e.t > 2) amEagle = null;
    return;
  }
  var other = balls[1 - b.id], face = other.x >= b.x ? 1 : -1;
  var bob = Math.sin(skClock * 5) * b.r * 0.08;
  if (m.phase === "ride") {
    var ux = Math.cos(m.aim), uy = Math.sin(m.aim);
    tx = b.x + ux * b.r * 1.1 - uy * b.r * 1.3; ty = b.y + uy * b.r * 1.1 + ux * b.r * 1.3 * 0 - b.r * 1.5;
    k = Math.min(1, dt * 14);
  } else if (m.phase === "overhands" || m.phase === "end") {
    // Circling high over his shoulder, on the far side from them.
    tx = b.x - face * b.r * 1.5 + Math.cos(skClock * 2.4) * b.r * 0.5; ty = b.y - b.r * 2.5 + Math.sin(skClock * 2.4) * b.r * 0.3;
    k = Math.min(1, dt * 6);
  } else {
    tx = b.x - face * b.r * 1.35; ty = b.y - b.r * 1.35 + bob;
    k = Math.min(1, dt * (e.mode === "in" ? 3.2 : 9));
    if (e.mode === "in" && Math.abs(e.x - tx) + Math.abs(e.y - ty) < 20) e.mode = "side";
  }
  e.dx = tx - e.x; e.x += (tx - e.x) * k; e.y += (ty - e.y) * k;
}

// ---------------------------------------------------------------- drawing

function stricklandShellStance(b) {
  return !!(b.sk && b.alive && !b.koOut && !b.kick && !b.grappled && !b.grapple && !b.sprawl && !subLocked(b) && !b.combo && !b.swing &&
    !b.taunt && !b.mock && !b.punch && !b.throwAnim && !b.koRush && !b.koPunch && !b.igbb && !b.shelled && !b.angry && !b.dizzy && !b.dazed && !b.skTwo);
}
// His hands are drawn by drawStrickland: the shell, the bike, the overhands
// (drawHands skips them, draw-attacks.js).
function stricklandHandsBusy(b) {
  if (!b.sk || !b.alive) return false;
  if (americaOn(b)) return b.igbb.phase !== "eagle";
  return !!b.skTwo || stricklandShellStance(b);
}

// Under the fighters: the flag on the mat, the lane he'll ride, the bike
// under him, the wreck and the exhaust.
function drawStricklandUnder() {
  if (amShow && amShow.k > 0) drawSkMatFlag(amShow.k);
  drawChuckNorrisUnder(); // the flag Chuck Norris planted (chuck-norris.js)
  amTrail.forEach(function (p) {
    var k = p.t / p.dur;
    ctx.save(); ctx.globalAlpha = 0.35 * (1 - k); ctx.fillStyle = "#8d8d8d";
    ctx.beginPath(); ctx.arc(p.x, p.y, 6 + 16 * k, 0, Math.PI * 2); ctx.fill(); ctx.restore();
  });
  if (amWreck) drawSkBike(amWreck.x, amWreck.y, amWreck.ang, RADIUS, amWreck.wheel, Math.max(0, Math.min(1, (1.6 - amWreck.t) / 0.4)), false, amWreck.face);
  if (!balls) return;
  balls.forEach(function (b) {
    var m = b.igbb;
    if (!b.alive || !americaOn(b)) return;
    if (m.phase === "rev") drawSkLane(b, m);
    if (m.phase === "rev" || m.phase === "ride") drawSkBike(b.x, b.y, m.aim, b.r, m.phase === "ride" ? m.spin : skClock * 3, m.bikeK == null ? 1 : m.bikeK, m.phase === "ride", m.face);
  });
}

// A big faded stars and stripes across the mat.
function drawSkMatFlag(k) {
  ctx.save();
  ctx.globalAlpha = 0.17 * k;
  for (var i = 0; i < 13; i++) { ctx.fillStyle = i % 2 ? SK_USA.white : SK_USA.red; ctx.fillRect(0, i * H / 13, W, H / 13 + 0.5); }
  ctx.fillStyle = SK_USA.blue; ctx.fillRect(0, 0, W * 0.42, H * 7 / 13);
  ctx.globalAlpha = 0.3 * k; ctx.fillStyle = "#ffffff";
  for (var r = 0; r < 5; r++) for (var c = 0; c < 6; c++) skStar(ctx, W * 0.035 + c * W * 0.067 + (r % 2) * W * 0.033, H * 0.045 + r * H * 0.1, 7);
  ctx.restore();
}

function skStar(c, x, y, s) {
  c.beginPath();
  for (var i = 0; i < 10; i++) { var a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? s * 0.42 : s; c[i ? "lineTo" : "moveTo"](x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
  c.closePath(); c.fill();
}

// The lane he'll ride, out to the cage: red, with chevrons, flashing once it locks.
function drawSkLane(b, m) {
  var sp = b.char.special, ux = Math.cos(m.aim), uy = Math.sin(m.aim), len = 2000;
  if (ux > 0.001) len = Math.min(len, (W - b.r - b.x) / ux); else if (ux < -0.001) len = Math.min(len, (b.r - b.x) / ux);
  if (uy > 0.001) len = Math.min(len, (H - b.r - b.y) / uy); else if (uy < -0.001) len = Math.min(len, (b.r - b.y) / uy);
  len = Math.max(0, len) + b.r;
  var on = Math.min(1, m.t / 0.2), flash = m.locked ? 0.55 + 0.45 * Math.sin(skClock * 40) : 1, half = b.r * 0.95;
  ctx.save();
  ctx.translate(b.x, b.y); ctx.rotate(m.aim);
  ctx.globalAlpha = 0.24 * on * flash; ctx.fillStyle = "#e0221b";
  ctx.fillRect(0, -half, len, half * 2);
  ctx.globalAlpha = 0.9 * on * flash; ctx.strokeStyle = "#e0221b"; ctx.lineWidth = m.locked ? 5 : 3.5;
  ctx.setLineDash([12, 9]); ctx.lineDashOffset = -skClock * 140;
  ctx.beginPath(); ctx.moveTo(b.r * 0.6, -half); ctx.lineTo(len, -half); ctx.moveTo(b.r * 0.6, half); ctx.lineTo(len, half); ctx.stroke();
  ctx.setLineDash([]);
  ctx.lineWidth = 4; ctx.lineJoin = "round"; ctx.lineCap = "round";
  for (var x = b.r * 1.6 + (skClock * 180) % 46; x < len - 10; x += 46) {
    ctx.beginPath(); ctx.moveTo(x - 10, -half * 0.45); ctx.lineTo(x + 6, 0); ctx.lineTo(x - 10, half * 0.45); ctx.stroke();
  }
  ctx.restore();
  void sp;
}

// Which way the bike faces (1 right, -1 left), kept until he's clearly
// heading the other way.
function skFace(ang, was) { var c = Math.cos(ang); return c > 0.15 ? 1 : c < -0.15 ? -1 : (was || 1); }
// The bike is drawn side on, facing left or right, tilted toward the way
// he's riding but never more than SK_TILT (it reads better than a bike
// seen end-on).
var SK_TILT = 0.5;
function skBikeAngle(ang, face) {
  var sn = Math.max(-Math.sin(SK_TILT), Math.min(Math.sin(SK_TILT), Math.sin(ang)));
  return Math.atan2(sn, face * Math.sqrt(1 - sn * sn));
}
// A point on the bike (lx forward, ly down, in the bike's own frame) out in the arena.
function skBikePt(x, y, phi, face, lx, ly) {
  var yy = face < 0 ? -ly : ly;
  return { x: x + Math.cos(phi) * lx - Math.sin(phi) * yy, y: y + Math.sin(phi) * lx + Math.cos(phi) * yy };
}

// The motorcycle, side on, facing `face` and tilted toward `ang`, the size
// of a fighter of radius `r`: chrome, a stars-and-stripes tank, ape hangers
// and a flag off the back. `k` grows it in (or fades the wreck); `go` lights
// it up.
function drawSkBike(x, y, ang, r, wheel, k, go, face) {
  if (k <= 0) return;
  face = face || skFace(ang);
  var left = face < 0, phi = skBikeAngle(ang, face);
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(phi);
  if (left) ctx.scale(1, -1); // wheels stay on the ground whichever way he rides
  ctx.scale(0.6 + 0.4 * Math.min(1, k * 1.4), 0.6 + 0.4 * Math.min(1, k * 1.4));
  ctx.globalAlpha = Math.min(1, k * 1.5);
  ctx.lineJoin = "round"; ctx.lineCap = "round";
  var ink = theme.wall || "#16211f", chrome = "#cfd4da", wy = r * 0.62, wr = r * 0.44;
  // Headlight beam.
  if (go) {
    var g = ctx.createLinearGradient(r * 1.1, 0, r * 4.5, 0);
    g.addColorStop(0, "rgba(255,240,170,0.55)"); g.addColorStop(1, "rgba(255,240,170,0)");
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.moveTo(r * 1.05, -r * 0.42); ctx.lineTo(r * 4.5, -r * 1.2); ctx.lineTo(r * 4.5, r * 0.6); ctx.lineTo(r * 1.05, -r * 0.22); ctx.closePath(); ctx.fill();
  }
  // Exhaust pipes, chrome, out the back.
  [[0.42, 0.06], [0.56, 0.1]].forEach(function (p) {
    ctx.strokeStyle = ink; ctx.lineWidth = r * 0.17;
    ctx.beginPath(); ctx.moveTo(r * 0.05, r * p[0]); ctx.lineTo(-r * 1.75, r * (p[0] + p[1])); ctx.stroke();
    ctx.strokeStyle = chrome; ctx.lineWidth = r * 0.1;
    ctx.beginPath(); ctx.moveTo(r * 0.05, r * p[0]); ctx.lineTo(-r * 1.75, r * (p[0] + p[1])); ctx.stroke();
  });
  // Wheels.
  [[-1.15, wheel], [1.25, wheel]].forEach(function (wv) {
    var cx = r * wv[0];
    ctx.fillStyle = "#151515"; ctx.strokeStyle = ink; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.arc(cx, wy, wr, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#3a3a3a"; ctx.beginPath(); ctx.arc(cx, wy, wr * 0.7, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = chrome; ctx.lineWidth = 2;
    for (var s = 0; s < 6; s++) {
      var a = wv[1] + s * Math.PI / 3;
      ctx.beginPath(); ctx.moveTo(cx, wy); ctx.lineTo(cx + Math.cos(a) * wr * 0.68, wy + Math.sin(a) * wr * 0.68); ctx.stroke();
    }
    ctx.fillStyle = chrome; ctx.beginPath(); ctx.arc(cx, wy, wr * 0.18, 0, Math.PI * 2); ctx.fill();
  });
  // Frame and the front fork, up to the bars.
  ctx.strokeStyle = ink; ctx.lineWidth = r * 0.15;
  ctx.beginPath(); ctx.moveTo(-r * 1.15, wy); ctx.lineTo(-r * 0.35, r * 0.05); ctx.lineTo(r * 0.85, -r * 0.35); ctx.lineTo(r * 1.25, wy); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-r * 1.15, wy); ctx.lineTo(r * 0.1, r * 0.55); ctx.lineTo(r * 0.85, -r * 0.35); ctx.stroke();
  ctx.strokeStyle = chrome; ctx.lineWidth = r * 0.08;
  ctx.beginPath(); ctx.moveTo(r * 0.85, -r * 0.35); ctx.lineTo(r * 1.25, wy); ctx.stroke();
  // Ape hanger bars and a grip.
  ctx.strokeStyle = ink; ctx.lineWidth = r * 0.11;
  ctx.beginPath(); ctx.moveTo(r * 0.82, -r * 0.4); ctx.lineTo(r * 0.78, -r * 1.05); ctx.lineTo(r * 0.55, -r * 1.12); ctx.stroke();
  ctx.strokeStyle = chrome; ctx.lineWidth = r * 0.06;
  ctx.beginPath(); ctx.moveTo(r * 0.82, -r * 0.4); ctx.lineTo(r * 0.78, -r * 1.05); ctx.lineTo(r * 0.55, -r * 1.12); ctx.stroke();
  // The engine: a chrome V-twin.
  ctx.fillStyle = "#8e959c"; ctx.strokeStyle = ink; ctx.lineWidth = 2.5;
  [[-0.05, -0.16], [0.28, 0.16]].forEach(function (c) {
    ctx.save(); ctx.translate(r * (0.1 + c[0]), r * 0.3); ctx.rotate(c[1] * 3);
    ctx.beginPath(); ctx.roundRect(-r * 0.15, -r * 0.3, r * 0.3, r * 0.42, 4); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = "rgba(0,0,0,0.3)"; ctx.lineWidth = 1.5;
    for (var f = 0; f < 3; f++) { ctx.beginPath(); ctx.moveTo(-r * 0.13, -r * 0.2 + f * r * 0.1); ctx.lineTo(r * 0.13, -r * 0.2 + f * r * 0.1); ctx.stroke(); }
    ctx.restore();
  });
  // Rear fender and the seat.
  ctx.fillStyle = "#151515"; ctx.strokeStyle = ink; ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.arc(-r * 1.15, wy, wr * 1.12, Math.PI * 1.05, Math.PI * 1.75); ctx.lineTo(-r * 1.15, wy); ctx.closePath(); ctx.fill();
  ctx.fillStyle = "#3b2a1c";
  ctx.beginPath(); ctx.moveTo(-r * 0.75, -r * 0.05); ctx.quadraticCurveTo(-r * 0.4, -r * 0.3, -r * 0.05, -r * 0.1); ctx.lineTo(-r * 0.15, r * 0.08); ctx.lineTo(-r * 0.75, r * 0.1); ctx.closePath(); ctx.fill(); ctx.stroke();
  // The tank: blue with white stars up front, red and white stripes behind.
  ctx.save();
  ctx.beginPath(); ctx.ellipse(r * 0.42, -r * 0.27, r * 0.48, r * 0.2, -0.22, 0, Math.PI * 2);
  ctx.clip();
  for (var st = 0; st < 5; st++) { ctx.fillStyle = st % 2 ? "#ffffff" : SK_USA.red; ctx.fillRect(-r * 0.1, -r * 0.5 + st * r * 0.1, r * 1.2, r * 0.1); }
  ctx.fillStyle = SK_USA.blue; ctx.fillRect(r * 0.45, -r * 0.6, r * 0.6, r * 0.7);
  ctx.fillStyle = "#ffffff"; skStar(ctx, r * 0.66, -r * 0.31, r * 0.08); skStar(ctx, r * 0.8, -r * 0.24, r * 0.06);
  ctx.restore();
  ctx.strokeStyle = ink; ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.ellipse(r * 0.42, -r * 0.27, r * 0.48, r * 0.2, -0.22, 0, Math.PI * 2); ctx.stroke();
  // Headlight.
  ctx.fillStyle = go ? "#fff4c2" : "#e8e1c8";
  ctx.beginPath(); ctx.arc(r * 1.02, -r * 0.32, r * 0.13, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.restore();
  // The flag off the back, streaming out behind (drawn level, outside the
  // turned frame, so it's never upside down).
  var base = skBikePt(x, y, phi, face, -r * 1.3, 0), top = skBikePt(x, y, phi, face, -r * 1.45, -r * 1.25);
  ctx.save();
  ctx.globalAlpha = Math.min(1, k * 1.5);
  ctx.strokeStyle = "#8a6a3c"; ctx.lineWidth = 3; ctx.lineCap = "round";
  ctx.beginPath(); ctx.moveTo(base.x, base.y); ctx.lineTo(top.x, top.y); ctx.stroke();
  ctx.translate(top.x, top.y);
  if (!left) ctx.scale(-1, 1);
  drawAaFlag(0, 0, r * 1.25, r * 0.75, skClock * (go ? 18 : 8), Math.PI / 2); // Gaethje's flag (allamerican.js)
  ctx.restore();
}

// After his body: his shell, his arms on the bars and the overhands, the
// trauma meter.
function drawStrickland(b, other) {
  if (!b.sk || !b.alive) return;
  var m = b.igbb;
  if (americaOn(b)) {
    if (m.phase === "flags") drawSkFistPump(b, m.t);
    else if (m.phase === "rev" || m.phase === "ride") drawSkOnBars(b, m);
    else if (m.phase === "hop") drawSkShell(b, other, true);
    else if (m.phase === "overhands") drawSkOverhand(b, other, m);
    else if (m.phase === "end") drawArmsUp(b, m.t); // chairshot.js
  } else if (b.skTwo) drawSkOneTwo(b, other, b.skTwo);
  else if (stricklandShellStance(b)) drawSkShell(b, other, false);
  drawTraumaBar(b, other);
}

// The Philly shell: lead glove low across his stomach, rear glove high by his
// chin, lead shoulder up. A roll flicks the shoulder up with a scuff of white.
function drawSkShell(b, other, hop) {
  var fx, fy;
  if (other && other.alive) { var dx = other.x - b.x, dy = other.y - b.y, dd = Math.sqrt(dx * dx + dy * dy) || 1; fx = dx / dd; fy = dy / dd; }
  else { fx = b.id === 0 ? 1 : -1; fy = 0; }
  var px = -fy, py = fx, r = b.r, size = r * 0.3, roll = b.skRoll > 0 ? Math.sin(Math.PI * b.skRoll / 0.3) : 0;
  var lead = { x: b.x + fx * r * 0.5 + px * r * 0.12, y: b.y + fy * r * 0.5 + py * r * 0.12 + r * 0.4 };
  var leadSh = { x: b.x + px * r * 0.62, y: b.y + py * r * 0.62 - r * (0.05 + 0.18 * roll) };
  var rear = { x: b.x + fx * r * 0.72 - px * r * 0.3, y: b.y + fy * r * 0.72 - py * r * 0.3 - r * 0.32 };
  var rearSh = { x: b.x - px * r * 0.6, y: b.y - py * r * 0.6 - r * 0.15 };
  if (hop) { lead.y -= r * 0.3; rear.y -= r * 0.1; }
  strokeLimb(size * 0.62, armColor(b.char), function () { ctx.moveTo(leadSh.x, leadSh.y); ctx.quadraticCurveTo(lead.x + px * r * 0.25, lead.y - r * 0.15, lead.x, lead.y); });
  drawGloveAt(lead.x, lead.y, size, b.char, Math.atan2(fy, fx) + 0.4 * (px >= 0 ? 1 : -1));
  strokeLimb(size * 0.62, armColor(b.char), function () { ctx.moveTo(rearSh.x, rearSh.y); ctx.lineTo(rear.x, rear.y); });
  drawGloveAt(rear.x, rear.y, size * 1.02, b.char, Math.atan2(fy, fx));
  if (roll > 0.05) {
    ctx.save();
    ctx.globalAlpha = roll; ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 4; ctx.lineCap = "round";
    var a = Math.atan2(fy, fx);
    ctx.beginPath(); ctx.arc(leadSh.x, leadSh.y, r * 0.42, a - 1.1, a + 0.4); ctx.stroke();
    ctx.restore();
  }
}

// The right hand behind the jab: cocked by his chin (glowing), then driven
// straight down the middle; the lead hand comes back to guard. Arms up over
// them after a knockout.
function drawSkOneTwo(b, other, m) {
  if (m.phase === "ko") { if (m.t > 0.45) drawArmsUp(b, m.t); else drawSkShell(b, other, false); return; } // chairshot.js
  var r = b.r, size = (b.char.punch && b.char.punch.size) || 14, ot = skCfg(b).oneTwo;
  var ux = Math.cos(m.ang), uy = Math.sin(m.ang), px = -uy, py = ux;
  var sh = { x: b.x + ux * (r - 4) - px * r * 0.4, y: b.y + uy * (r - 4) - py * r * 0.4 };
  var rest = { x: b.x + ux * r * 0.55 - px * r * 0.35, y: b.y + uy * r * 0.55 - py * r * 0.35 - r * 0.25 };
  var full = Math.min(r + ot.reach + 8, other.alive ? Math.max(r + 6, Math.sqrt((other.x - b.x) * (other.x - b.x) + (other.y - b.y) * (other.y - b.y)) - other.r + 4) : r + ot.reach);
  var hand, k = 0;
  if (m.phase === "wind") hand = rest;
  else {
    k = m.phase === "strike" ? Math.min(1, m.t / SK_TWO_STRIKE) : 1 - Math.min(1, m.t / SK_TWO_FOLLOW);
    var dist = r * 0.6 + (full - r * 0.6) * k;
    hand = { x: b.x + ux * dist - px * r * 0.3 * (1 - k), y: b.y + uy * dist - py * r * 0.3 * (1 - k) - r * 0.25 * (1 - k) };
  }
  ctx.save();
  if (m.phase === "wind") {
    ctx.globalAlpha = 0.3 + 0.25 * Math.sin(m.t * 50); ctx.fillStyle = "#ffd23f";
    ctx.beginPath(); ctx.arc(hand.x, hand.y, size * 1.6, 0, Math.PI * 2); ctx.fill();
  } else if (m.phase === "strike") {
    ctx.strokeStyle = "#ffffff"; ctx.lineCap = "round"; ctx.globalAlpha = 0.45; ctx.lineWidth = size * 1.2;
    ctx.beginPath(); ctx.moveTo(rest.x, rest.y); ctx.lineTo(hand.x, hand.y); ctx.stroke();
  }
  ctx.restore();
  strokeLimb(size * 0.6, armColor(b.char), function () { ctx.moveTo(sh.x, sh.y); ctx.lineTo(hand.x, hand.y); });
  drawGloveAt(hand.x, hand.y, size * (m.phase === "strike" ? 1.15 : 1), b.char, m.ang);
  var lead = { x: b.x + ux * r * 0.8 + px * r * 0.4, y: b.y + uy * r * 0.8 + py * r * 0.4 };
  drawGloveAt(lead.x, lead.y, r * 0.3, b.char, m.ang);
}

// Both gloves on the ape hangers, leaning into it.
function drawSkOnBars(b, m) {
  var r = b.r, size = (b.char.punch && b.char.punch.size) || 14, face = m.face || skFace(m.aim), phi = skBikeAngle(m.aim, face);
  var shake2 = m.phase === "rev" ? Math.sin(skClock * 30) * 2 : 0;
  [-1, 1].forEach(function (s) {
    var g = skBikePt(b.x, b.y, phi, face, r * (0.62 - 0.08 * s), -r * 1.08); // the grips, up high on the ape hangers
    var sh = skBikePt(b.x, b.y, phi, face, r * 0.2 * s, -r * 0.35);
    var hand = { x: g.x, y: g.y + shake2 };
    strokeLimb(size * 0.7, armColor(b.char, s), function () { ctx.moveTo(sh.x, sh.y); ctx.lineTo(hand.x, hand.y); });
    drawGloveAt(hand.x, hand.y, size * 0.85, b.char, Math.atan2(hand.y - sh.y, hand.x - sh.x));
  });
}

// One fist pumping while the flags go up.
function drawSkFistPump(b, t) {
  var r = b.r, size = (b.char.punch && b.char.punch.size) || 14;
  var pump = Math.max(0, Math.sin(t * 13)) * r * 0.45;
  var sh = { x: b.x + r * 0.6, y: b.y - r * 0.4 }, hand = { x: b.x + r * 0.85, y: b.y - r * 1.2 - pump };
  strokeLimb(size * 0.75, armColor(b.char, 1), function () { ctx.moveTo(sh.x, sh.y); ctx.lineTo(hand.x, hand.y); });
  drawGloveAt(hand.x, hand.y, size * 0.95, b.char, -Math.PI / 2);
  var sh2 = { x: b.x - r * 0.6, y: b.y - r * 0.2 }, h2 = { x: b.x - r * 0.75, y: b.y + r * 0.35 };
  strokeLimb(size * 0.75, armColor(b.char, -1), function () { ctx.moveTo(sh2.x, sh2.y); ctx.lineTo(h2.x, h2.y); });
  drawGloveAt(h2.x, h2.y, size * 0.9, b.char, Math.PI / 2);
}

// The overhand right: cocked high and back, then looping over the top and
// down onto them. The lead hand stays up.
function drawSkOverhand(b, other, m) {
  var o = m.oh, r = b.r, size = ((b.char.punch && b.char.punch.size) || 14) * 1.25;
  var ux = Math.cos(o.ang), uy = Math.sin(o.ang), px = -uy, py = ux, side = px >= 0 ? -1 : 1;
  var sh = { x: b.x + px * r * 0.55 * side, y: b.y + py * r * 0.55 * side - r * 0.3 };
  var cock = { x: b.x - ux * r * 0.7 + px * r * 0.55 * side, y: b.y - uy * r * 0.7 + py * r * 0.55 * side - r * 1.35 };
  var hit = other.alive ? { x: other.x - ux * other.r * 0.4, y: other.y - uy * other.r * 0.4 - other.r * 0.35 } : { x: b.x + ux * r * 2, y: b.y + uy * r * 2 };
  var top = { x: (cock.x + hit.x) / 2, y: Math.min(cock.y, hit.y) - r * 0.9 };
  var hand;
  if (o.state === "chase") hand = { x: b.x + ux * r * 0.75 + px * r * 0.35 * side, y: b.y + uy * r * 0.75 + py * r * 0.35 * side - r * 0.2 };
  else if (o.state === "wind") {
    var w = Math.min(1, o.t / SK_OH_WIND), e = w * w * (3 - 2 * w), rest = { x: b.x + ux * r * 0.6, y: b.y + uy * r * 0.6 - r * 0.2 };
    hand = { x: rest.x + (cock.x - rest.x) * e + Math.sin(o.t * 50) * 1.5 * w, y: rest.y + (cock.y - rest.y) * e };
  } else if (o.state === "strike") {
    var k = Math.min(1, o.t / SK_OH_STRIKE);
    hand = skBez(cock, top, hit, k);
    ctx.save(); ctx.lineCap = "round";
    [0.2, 0.4, 0.6].forEach(function (back, i) {
      if (k - back <= 0) return;
      var g = skBez(cock, top, hit, k - back);
      ctx.globalAlpha = 0.5 - i * 0.14; ctx.strokeStyle = "#ffffff"; ctx.lineWidth = size * (1.5 - i * 0.4);
      ctx.beginPath(); ctx.moveTo(g.x, g.y); ctx.lineTo(hand.x, hand.y); ctx.stroke();
    });
    ctx.restore();
  } else {
    var f = Math.min(1, o.t / SK_OH_FOLLOW);
    hand = { x: hit.x + (b.x + ux * r * 0.7 - hit.x) * f, y: hit.y + (b.y + uy * r * 0.7 - hit.y) * f };
  }
  if (o.state === "wind") {
    // The tell: a glow round the cocked fist.
    ctx.save(); ctx.globalAlpha = 0.35 + 0.25 * Math.sin(o.t * 40); ctx.fillStyle = SK_USA.red;
    ctx.beginPath(); ctx.arc(hand.x, hand.y, size * 1.8, 0, Math.PI * 2); ctx.fill(); ctx.restore();
  }
  strokeLimb(size * 0.6, armColor(b.char), function () { ctx.moveTo(sh.x, sh.y); ctx.lineTo(hand.x, hand.y); });
  drawGloveAt(hand.x, hand.y, size, b.char, Math.atan2(hand.y - sh.y, hand.x - sh.x));
  var lead = { x: b.x + ux * r * 0.85 - px * r * 0.4 * side, y: b.y + uy * r * 0.85 - py * r * 0.4 * side };
  drawGloveAt(lead.x, lead.y, size * 0.7, b.char, o.ang);
}
function skBez(a, c, b, k) {
  var u = 1 - k;
  return { x: u * u * a.x + 2 * u * k * c.x + k * k * b.x, y: u * u * a.y + 2 * u * k * c.y + k * k * b.y };
}

// The trauma meter, under his health bar over the ball, with how much
// faster his special's charging ("x1.6").
function drawTraumaBar(b, other) {
  var tc = skCfg(b).trauma;
  if (!tc) return;
  var pinned = (other.grapple && other.grapple.finisher && other.grapple.phase !== "carry") || other.rnc;
  if (pinned) return;
  var bw = 64, bh = 8, bx = b.x - bw / 2, by = b.y - b.r - 18;
  if (by < 4) by = b.y + b.r + 10;
  var y = by + bh + 2, h = 6, p = Math.max(0, Math.min(1, b.sk.trauma / 100)), hot = p >= 0.75 || b.sk.fx > 0;
  ctx.save();
  ctx.fillStyle = theme.grid; ctx.fillRect(bx, y, bw, h);
  ctx.fillStyle = hot ? (Math.sin(skClock * 16) > 0 ? "#ff5a7a" : "#a3123a") : "#b3193f";
  ctx.fillRect(bx, y, bw * p, h);
  ctx.lineWidth = 1.5; ctx.strokeStyle = theme.wall; ctx.strokeRect(bx, y, bw, h);
  if (b.sk.mult >= 1.05 && b.char.hasSpecial && !b.igbb) {
    var txt = "x" + b.sk.mult.toFixed(1);
    ctx.font = '800 15px "Barlow Condensed", "Arial Narrow", sans-serif';
    ctx.textAlign = "left"; ctx.textBaseline = "middle";
    ctx.lineWidth = 3.5; ctx.lineJoin = "round"; ctx.strokeStyle = theme.floor; ctx.strokeText(txt, bx + bw + 4, y + h / 2);
    ctx.fillStyle = "#b3193f"; ctx.fillText(txt, bx + bw + 4, y + h / 2);
  }
  ctx.restore();
}

// Over the fighters: the eagle and the fireworks over the test arena.
function drawStricklandOver() {
  if (amShow && !stadiumOn()) drawSkFireworks(amShow);
  drawChuckNorris(); // Chuck Norris, the roundhouse and the explosion (chuck-norris.js)
  var e = amEagle;
  if (!e) return;
  var b = balls && balls[e.owner], other = b && balls[1 - b.id];
  if (!b) return;
  var ang = e.mode === "out" ? -0.6 : (b.igbb && b.igbb.phase === "ride" ? b.igbb.aim : Math.atan2((other ? other.y : b.y) - e.y, (other ? other.x : b.x + 1) - e.x));
  var sc = e.mode === "in" ? 0.75 : 0.5;
  drawEagle(e.x, e.y, ang, sc, e.flap, !!(b.igbb && b.igbb.phase === "ride")); // Joe's eagle (allamerican.js)
}

function drawSkFireworks(s) {
  s.fireworks.forEach(function (f) {
    if (f.t < 0) return;
    ctx.save();
    ctx.translate(f.x, f.y); ctx.scale(f.k, f.k);
    drawAaFireworks({ fireworks: [{ x: 0, y: 0, t: f.t, color: f.color, seed: f.seed }] }); // Gaethje's fireworks (allamerican.js)
    ctx.restore();
  });
}

// Over the whole stage: flags waving all over the stands, fireworks over
// them, and "U-S-A! U-S-A!" bubbles. In the test arena, little flags along
// the top and bottom of the cage.
function drawStricklandSky(sc, ox, oy) {
  var s = amShow;
  if (!s || s.k <= 0) return;
  var stadium = stadiumOn(), now = skClock;
  ctx.save();
  if (stadium) { var px = canvas.width / STAGE_W; ctx.setTransform(px, 0, 0, px, 0, 0); } else ctx.setTransform(sc, 0, 0, sc, ox, oy);
  ctx.globalAlpha = s.k;
  if (stadium && typeof stadiumFans !== "undefined") {
    stadiumFans.forEach(function (f, i) {
      if (i % 3 || f.sign) return;
      var fx = f.x + f.r * 0.25, fy = f.y - f.r * 0.2, ty = fy - f.r * (1.25 + 0.15 * Math.sin(now * 6 + f.phase));
      ctx.strokeStyle = "#8a6a3c"; ctx.lineWidth = 4; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(fx, fy); ctx.lineTo(fx, ty); ctx.stroke();
      drawAaFlag(fx, ty, f.r * 1.3, f.r * 0.8, now * 9 + f.phase, Math.PI / 2 + Math.sin(now * 4 + f.phase) * 0.4);
    });
    drawSkFireworks(s);
  } else if (!stadium) {
    for (var i = 0; i < 6; i++) {
      [[i * 90 + 30, -2], [i * 90 + 60, H + 2]].forEach(function (p, j) {
        var top = j ? H - 26 : 4;
        ctx.strokeStyle = "#8a6a3c"; ctx.lineWidth = 2; ctx.lineCap = "round";
        ctx.beginPath(); ctx.moveTo(p[0], p[1]); ctx.lineTo(p[0], top); ctx.stroke();
        drawAaFlag(p[0], top, 28, 17, now * 9 + i, Math.PI / 2);
      });
    }
  }
  ctx.globalAlpha = 1;
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  s.echoes.forEach(function (e) {
    e.spots.forEach(function (sp, i) {
      var t = e.t - sp.d;
      if (t < 0) return;
      var pop = Math.min(1, t / 0.12), fade = Math.max(0, Math.min(1, (1.25 - t) / 0.3)) * s.k, size = stadium ? 42 : 20;
      ctx.save();
      ctx.globalAlpha = fade;
      ctx.translate(sp.x, sp.y - t * (stadium ? 30 : 10)); ctx.scale(0.6 + 0.4 * pop, 0.6 + 0.4 * pop); ctx.rotate(Math.sin(sp.x) * 0.12);
      ctx.font = '900 ' + size + 'px "Barlow Condensed", "Arial Narrow", sans-serif';
      var w = ctx.measureText("U-S-A! U-S-A!").width + size * 0.6, h = size * 1.15;
      ctx.fillStyle = "#ffffff"; ctx.strokeStyle = i % 2 ? SK_USA.blue : "#16211f"; ctx.lineWidth = stadium ? 4 : 2.5;
      ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h, h * 0.4); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-w * 0.12, h / 2 - 1); ctx.lineTo(-w * 0.2, h / 2 + size * 0.4); ctx.lineTo(w * 0.02, h / 2 - 1); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = i % 2 ? SK_USA.blue : SK_USA.red; ctx.fillText("U-S-A! U-S-A!", 0, 2);
      ctx.restore();
    });
  });
  ctx.restore();
}

// ---------------------------------------------------------------- gallery

function stricklandSpecialInfo(sp) {
  return "Once the bar is full (and not before " + sp.notBefore + "s) he waits until he sees weakness: them under " + Math.round(sp.weakHp * 100) +
    "% health, limping, tired or dizzy. A bald eagle swoops in to his side, the cameras flash and it gets very America: the U-S-A chant, flags all over the stands and the mat, fireworks. " +
    "He gets on a motorcycle and revs it while a red lane shows where he'll ride, then rides down it: " + sp.bikeDamage + " if he runs them over (can't be slipped or blocked) and a knockback into the cage (" +
    sp.walls + " wall slams of " + sp.wallDamage + "), or he crashes it into the cage. Then he hops off and chases them with up to " + sp.overhands + " overhand rights (" + sp.overhandDamage +
    " each), each one knocking them toward a corner; caught in a corner it's " + sp.cornerBonus + "x." + chuckNorrisSpecialInfo(sp); // (chuck-norris.js)
}

function teepGalleryInfo(tc) {
  return "When they come in he lifts the knee (the tell) and drives the foot into them, sole first: " + tc.damage + " damage and a shove straight back" +
    (tc.stuff ? " that knocks whatever they were winding up out of them" : "") + ". Slipped, it does nothing; blocked, it still pushes them back. One every " + secs(tc.cooldown) + ".";
}

function stricklandGalleryMoves(ch, add) {
  var g = ch.strickland, sh = g.shell, cc = g.cardio, tr = g.trauma, rv = g.rivals || {};
  if (ch.hasPunch) add("👊", "Jab", "His main weapon: a long, stiff jab (" + ch.punch.damage + " damage, " + ch.punch.reach + " reach) every " + secs(ch.punch.cooldown) + ".");
  if (g.range) add("📏", "Range", "Fights at the end of his jab: backs out at an angle when they get close, walks them down when they're far, and circles in between.");
  if (sh) add("🛡️", "Philly shell", "Lead hand low across his stomach, rear glove up by his chin. Rolls " + sh.chance + "% of punches off his shoulder (" + sh.kickChance + "% of kicks, " + sh.projChance + "% of anything thrown)" + (sh.counter ? ", and " + (sh.counter === true ? "always" : sh.counter + "% of the time") + " comes straight back with the jab" : "") + (sh.angryOff ? ". Not while he's triggered." : "."));
  if (ch.tdd) add("🧱", "Takedown defense", "Sprawls on " + ch.tdd.sprawlChance + "% of takedown shots (\"STUFFED\") and jabs straight back.");
  if (cc) add("🫁", "Cardio", "Every " + secs(cc.every) + " (up to " + cc.max + " times) his pace goes up: " + Math.round(cc.speed * 100) + "% faster, attacks " + Math.round(cc.rate * 100) + "% faster, rolls " + cc.shell + "% more. From the " + cc.tiredAt + "th step they're tired and sweating, slower each time.");
  if (tr) add("🧠", "Trauma", "The bar under his health fills as he gets hurt and whenever they taunt him (\"TRIGGERED\": any of their lines, a thumbs down, a celebration). The fuller it is, the faster his special charges, up to " + (1 + tr.boost).toFixed(1) + "x. America takes it back down.");
  chuckNorrisGalleryMove(ch, add); // Chuck Norris in America (chuck-norris.js)
  if (rv.pereira) add("🦅", "UFC 276", "Against Alex Pereira, who knocked him out with a left hook: his trauma starts at " + rv.pereira.trauma + "%, he can't roll the CHAMA combo, and the CHAMA hook gets an extra " + rv.pereira.hookKo + "% knockout chance.");
}

function stricklandGalleryAssets(list) {
  list.push({ name: "Motorcycle", info: "Sean Strickland rides it into them in America.", w: 300, h: 200, draw: function (c, w, h) {
    withCtx(c, function () { var was = skClock; skClock = 0.4; drawSkBike(w * 0.52, h * 0.5, 0, 52, 0.6, 1, true); skClock = was; });
  } });
  chuckNorrisGalleryAssets(list); // (chuck-norris.js)
}

function stricklandGallerySounds(groups, synth) {
  groups.push({ title: "Sean Strickland", items: [
    synth("Teep", "The front push kick landing (teep.js, anyone with a teep).", function () { playTeepWhoosh(); setTimeout(function () { playTeepThud(14); }, 90); }),
    synth("Shoulder roll", "Rolling a punch off his shoulder.", function () { playSkRoll(); }),
    synth("Triggered", "Taunted: his trauma meter jumps.", function () { playSkTriggered(); }),
    synth("Pace", "His pace going up.", function () { playSkPace(3); }),
    synth("Motorcycle rev", "Revving the bike in America.", function () { playSkRev(1); }),
    synth("Motorcycle ride", "Riding down the lane.", function () { playSkRide(); }),
    synth("Run over", "The bike hitting them.", function () { lastPunchSound = 0; playSkBikeHit(40); }),
    synth("Bike crash", "The bike hitting the cage.", function () { playSkCrash(); }),
    synth("Overhand wind-up", "Cocking an overhand right.", function () { playSkWindup(); })
  ] });
  chuckNorrisGallerySounds(groups, synth); // (chuck-norris.js)
}

// ---------------------------------------------------------------- sound
// Synth stand-ins until Joe records the real ones.

function skAudio(fn) {
  try {
    var ac = getAudioCtx();
    if (!ac) return;
    if (ac.state === "suspended") ac.resume();
    fn(ac, ac.currentTime);
  } catch (e) { /* never let audio break the game */ }
}
// A punch skidding off his shoulder: a leathery scuff and a swish.
function playSkRoll() {
  skAudio(function (ac, t) { caneBurst(ac, t, 700, 0.9, 0.4, 0.09); caneBurst(ac, t + 0.03, 1800, 1.1, 0.18, 0.12); });
}
// Triggered: a sour two-note stab.
function playSkTriggered() {
  skAudio(function (ac, t) { caneTone(ac, t, "square", 311, 300, 0.09, 0.12); caneTone(ac, t + 0.11, "square", 220, 207, 0.1, 0.22); });
}
// His pace going up: a sharp breath out and a rising blip.
function playSkPace(n) {
  skAudio(function (ac, t) { caneBurst(ac, t, 1400, 0.6, 0.22, 0.25); caneTone(ac, t + 0.05, "triangle", 440 + n * 40, 660 + n * 60, 0.12, 0.2); });
}
// The engine: a low sawtooth growl, revved a few times.
function skEngine(ac, t, dur, f0, f1, peak, revs) {
  var o = ac.createOscillator(), o2 = ac.createOscillator(), lp = ac.createBiquadFilter(), g = ac.createGain();
  o.type = "sawtooth"; o2.type = "square";
  o.frequency.setValueAtTime(f0, t); o2.frequency.setValueAtTime(f0 * 0.5, t);
  for (var i = 0; i < revs; i++) {
    var a = t + dur * i / revs, b = a + dur / revs * 0.45;
    o.frequency.linearRampToValueAtTime(f1, b); o.frequency.linearRampToValueAtTime(f0 * 1.1, a + dur / revs);
    o2.frequency.linearRampToValueAtTime(f1 * 0.5, b); o2.frequency.linearRampToValueAtTime(f0 * 0.55, a + dur / revs);
  }
  lp.type = "lowpass"; lp.frequency.setValueAtTime(700, t); lp.Q.value = 3;
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + 0.05);
  g.gain.setValueAtTime(peak, t + dur - 0.08); g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.05);
  o.connect(lp); o2.connect(lp); lp.connect(g); g.connect(strikeOut(ac));
  o.start(t); o2.start(t); o.stop(t + dur + 0.1); o2.stop(t + dur + 0.1);
}
function playSkRev(dur) { skAudio(function (ac, t) { skEngine(ac, t, Math.max(0.4, dur), 55, 150, 0.32, 3); }); }
function playSkLock() { skAudio(function (ac, t) { caneTone(ac, t, "square", 880, 880, 0.1, 0.07); caneTone(ac, t + 0.09, "square", 1175, 1175, 0.1, 0.09); }); }
function playSkRide() { skAudio(function (ac, t) { skEngine(ac, t, 1.0, 80, 210, 0.4, 1); caneBurst(ac, t, 500, 0.5, 0.3, 0.5); }); }
// Running them over: the slam, a crunch and a ring of metal.
function playSkBikeHit(dealt) {
  playSlam();
  playPunch(Math.max(30, dealt || 30));
  skAudio(function (ac, t) {
    caneTone(ac, t, "sine", 90, 30, 0.8, 0.6);
    caneBurst(ac, t, 1200, 0.8, 0.8, 0.25);
    [431, 697, 1123].forEach(function (f, i) { caneTone(ac, t + 0.01, i % 2 ? "square" : "triangle", f, f * 0.98, 0.07, 0.5); });
  });
}
// Into the cage: a metal scrape and a clatter.
function playSkCrash() {
  playSlam();
  skAudio(function (ac, t) {
    for (var i = 0; i < 6; i++) caneBurst(ac, t + i * 0.05, 2600 + (i % 3) * 700, 2, 0.3, 0.08);
    caneTone(ac, t, "triangle", 300, 120, 0.25, 0.4);
  });
}
function playSkWindup() { skAudio(function (ac, t) { caneTone(ac, t, "triangle", 140, 380, 0.16, SK_OH_WIND); }); }
