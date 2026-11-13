// Conor McGregor, "The Notorious" (Christian, 2026-11-12). Lightweight.
//
// Trash talk  he talks the whole fight (notorious.trashTalk). Every few
//             seconds, when there's room between them, he does the
//             billionaire strut (chest out, rocking, arms swinging out wide)
//             for `strut` seconds and says one of his real lines in a speech
//             bubble (speech.js). EVERY line is a taunt: it gets to them the
//             way Josh Hokit's thumbs down does (b.angry, hokit.js): they
//             glow red and storm straight at him, 25% faster, for `anger`
//             seconds. He opens every fight with a line, and a punch he
//             blocks or slips can get the "overhand right" line (`slipLine`%).
//             Lines marked for one opponent only come out against them.
// Counter left  an angry opponent coming in (notorious.counter): he plants,
//             cocks the left by his chin (it glows: the tell) and fires it as
//             they arrive. It whiffs `whiff`% of the time (or they got out of
//             range): then he's left open for `openTime` seconds, taking
//             `openVuln` times the damage. If it lands it's a knockout koBase%
//             of the time at full health, up to koBase + koLow% the more hurt
//             they are (times the gas tank's `koMult`), otherwise `damage` and
//             a big knockback. A counter knockout gets "Precision beats power,
//             and timing beats speed." and a strut round them.
// Gas tank    (notorious.gasTank) the bar under his health. For the first
//             `fresh` seconds he's the fastest, hardest-hitting fighter in the
//             game (speed, damage and attack rate at their first value) while
//             the bar drains to `floor`; over the next `fade` seconds it runs
//             dry and they drop to the second value, and he taps to
//             submissions more (tapExtra: armbar.js and rnc.js call
//             conorTapChance). "GASSED!" and sweat when it's nearly empty.
// 13 SECONDS  a knockout inside `thirteen.within` seconds puts the time up on
//             the jumbotron (a banner over the test arena), like his
//             13-second knockout of José Aldo at UFC 194.
// Press Conference  his special (special.move "presser"). NOT CONFIRMED by
//             Christian yet: hasSpecial false switches it off. A podium rises
//             out of the mat, the mic squeals, he says a press-conference line
//             and they get FURIOUS (`anger` seconds), he throws `bottles`
//             water bottles at them as they come (the UFC 202 presser), then
//             steps out into the counter left with `koBonus`% more knockout
//             chance, waiting up to `wait` seconds for them.
// Rivals      (notorious.rivals) vs Khabib: Khabib's grabs come round
//             `grappleBoost` times as fast, `rncChance`% of his takedowns go
//             to the back for a choke and `gnpChance`% into ground and pound
//             (grapple-duel.js calls tryKhabibOnConor), his Send Me Location
//             comes early (`sendLocFirst`), and he says "Let's talk now."
//             whenever he's pounding on him. vs Dustin: Dustin throws calf
//             kicks at him (and nobody else): `damage` and a limp
//             (slowdown.js). Calf kicks (Dustin's, and Alex Pereira's) do
//             `calfKicksHurt` times the damage to him.
// The taunt and the counter run on b.cm and don't make him untouchable; the
// press conference runs on b.igbb (move "presser") like other specials.
"use strict";

// His real lines (backlog, round 3). Swear words are bleeped (speech.js).
var CM_LINES = {
  opener: [
    "Who the [BLEEP] is that guy?",
    "Sorry I'm late, I just don't give a [BLEEP].",
    "We're not here to take part. We're here to take over."
  ],
  taunt: [
    "He's a snake in the grass.",
    "I own this town!",
    "I predict I rearrange his face. He's too easily hit.",
    "I built this event. This is the McGregor Show.",
    "Congratulations. You're rich now.",
    "All I care about is my checks, and my checks are super heavy.",
    "He makes gang signs with his right hand and animal balloons with his left.",
    "He's in a [BLEEP] tracksuit. He can't even afford a suit anymore.",
    "He will be unconscious inside four rounds.",
    "I'd like to take this chance to apologize... to absolutely nobody.",
    "You ring your wife: Baby, we done it. We're rich, baby. Conor McGregor made us rich. Break out the red panties!"
  ],
  slip: ["He throws an overhand right, looks at the floor, and hopes for the best."],
  presser: [
    "I built this event. This is the McGregor Show.",
    "All I care about is my checks, and my checks are super heavy.",
    "Congratulations. You're rich now."
  ],
  vs: {
    "c-khabib-nurmagomedov": ["Somebody's 0 has got to go.", "I'm going to truly love putting a beating on this little glass-jaw rat."],
    "c-dustin-poirier": ["A gust of wind and he does the chicken dance."]
  },
  win: "The double champ does what the [BLEEP] he wants!",
  counterKo: "Precision beats power, and timing beats speed.",
  khabibGnp: "Let's talk now."
};
var CM_KHABIB = "c-khabib-nurmagomedov", CM_DUSTIN = "c-dustin-poirier";
var CM_KO_BEAT = 0.45;   // watching them drop before the strut
var CM_KO_TIME = 2.3;    // then strutting round them before the result
var CM_STRUT_RATE = 3.1; // strut steps a second
var CM_HIT_AT = 0.05;    // the counter left: out and landing this fast
var CM_RISE = 0.45, CM_SINK = 0.4, CM_BOTTLE_GAP = 0.22; // the press conference
var cm13 = null;         // the "13 SECONDS" show: { t, secs, id, show }
var cmPodium = null;     // the press conference podium: { id, x, y, t, sink }
var cmClock = 0;         // drawing clock (game time, never Math.random)
var cmBottleSrc = null;

function cmRand(r) { return r[0] + Math.random() * (r[1] - r[0]); }
function cmCfg(b) { return b && b.char && b.char.notorious; }
// A [fresh, gassed] pair at power k (1 fresh, 0 empty).
function cmLerp(pair, k) { return pair[1] + (pair[0] - pair[1]) * k; }
function cmIs(b, id) { return String(b && b.char && b.char.id || "").indexOf(id) === 0; }
function cmDist(a, b) { var dx = b.x - a.x, dy = b.y - a.y; return Math.sqrt(dx * dx + dy * dy) || 1; }
// The rival settings for `other` in a fight with Conor (null if he isn't one).
function cmRival(conor, other) {
  var rv = cmCfg(conor) && cmCfg(conor).rivals;
  if (!rv || !other || cmCfg(other)) return null;
  if (cmIs(other, CM_KHABIB)) return rv.khabib || null;
  if (cmIs(other, CM_DUSTIN)) return rv.dustin || null;
  return null;
}
function presserOn(b) { return !!(b && b.igbb && b.igbb.move === "presser"); }
// Strutting, planted for the counter, or celebrating: the speed regulator
// leaves him alone (physics.js).
function conorBusy(b) { var m = b && b.cm; return !!(m && (m.taunt || m.counter)); }
function cmStrutting(b) {
  var m = b && b.cm;
  return !!(m && (m.taunt || (m.counter && m.counter.phase === "ko" && m.counter.t > CM_KO_BEAT)));
}
// Both hands are drawn by drawConor (drawHands skips them, draw-attacks.js).
function conorHandsBusy(b) {
  var m = b && b.cm;
  if (presserOn(b)) return true;
  if (!m) return false;
  if (cmStrutting(b)) return true;
  return !!(m.counter && (m.counter.phase === "plant" || m.counter.phase === "open"));
}
// Held by something else: grabbed, slammed, choked, knocked out...
function cmHeld(b) {
  return !b.alive || b.grappled || b.grapple || b.slam || b.sprawl || b.sprawled || subLocked(b) || b.koOut || b.koRush ||
    b.shocked || b.dazed || b.dizzy || b.shelled || b.checkStun > 0 || b.koDuel || (b.igbb && !presserOn(b));
}
function cmKnockable(o) { return o.alive && !o.grappled && !o.grapple && !o.slam && !subLocked(o) && !o.igbb && !o.koOut; }

// From startMatchSeeded.
function resetConor() { cm13 = null; cmPodium = null; cmClock = 0; }
// From makeBall (after applyWeight, so his normal speed and attack rate are set).
function initConor(b) {
  b.cmCalf = null; b.cmCalfT = null; b.cmTalkFor = null;
  b.cm = null;
  var cfg = cmCfg(b);
  if (!cfg) return;
  b.cm = {
    t: 0, gas: 1, power: 1, dmg: 1, baseSpeed: b.baseSpeed, atkRate: b.atkRate,
    talkT: cfg.trashTalk ? cmRand(cfg.trashTalk.first) : Infinity, opened: false,
    taunt: null, counter: null, counterCd: 0, gassed: false, won: false, winLine: false, koSeen: false, koCounter: false,
    rivals: false, sweatT: 0, strutPh: 0, seen: { hp: b.hp, flash: 0, dodged: false }
  };
}

// ---------------------------------------------------------------- every frame

// From update(): the fight clock, his gas tank, sweat, the rivalries, the
// lines after a block or a win, and the 13 SECONDS show.
function tickConor(dt) {
  cmClock += dt;
  if (cm13) cm13.t += dt;
  if (cmPodium) {
    cmPodium.t += dt;
    var owner = balls[cmPodium.id];
    if (!cmPodium.sink && !presserOn(owner) && !(owner.cm && owner.cm.counter && owner.cm.counter.presser)) cmPodium.sink = cmPodium.t;
    if (cmPodium.sink != null && cmPodium.t - cmPodium.sink > CM_SINK) cmPodium = null;
  }
  balls.forEach(function (b) {
    var m = b.cm, cfg = cmCfg(b), other = balls[1 - b.id];
    if (!m) return;
    if (started && !over && b.alive) m.t += dt;
    if (started && !m.rivals) { m.rivals = true; cmSetupRivals(b, other); }
    if (cmHeld(b) && !(m.counter && m.counter.phase === "ko")) { if (m.taunt) endTaunt(b); if (m.counter) endCounter(b, m, false); }
    cmGas(b, m, cfg, dt);
    if (m.counterCd > 0) m.counterCd -= dt;
    if (m.taunt || (m.counter && m.counter.phase === "ko")) m.strutPh += dt * CM_STRUT_RATE * Math.PI;
    cmLetsTalk(b, other);
    cmSlipWatch(b, other, m, cfg);
    cmWinWatch(b, other, m, cfg);
  });
}

// The gas tank: drains to `floor` over the fresh stretch at full power,
// then runs dry over `fade` seconds and takes his speed, power and attack
// rate down with it.
function cmGas(b, m, cfg, dt) {
  var gt = cfg.gasTank;
  if (!gt) return;
  if (m.t < gt.fresh) { m.gas = 1 - (1 - gt.floor) * m.t / gt.fresh; m.power = 1; }
  else { m.power = Math.max(0, 1 - (m.t - gt.fresh) / gt.fade); m.gas = gt.floor * m.power; }
  m.dmg = cmLerp(gt.damage, m.power);
  b.baseSpeed = m.baseSpeed * cmLerp(gt.speed, m.power);
  b.atkRate = m.atkRate * cmLerp(gt.attack, m.power);
  if (!b.alive || over || !started) return;
  if (!m.gassed && m.power < gt.gassedAt) {
    m.gassed = true;
    floater(b.x, b.y - b.r - 30, "GASSED!", "note");
    playGassed();
  }
  // Sweat flying off him as the tank runs down.
  if (m.power < 0.65 && !reduceMotion) {
    m.sweatT -= dt;
    if (m.sweatT <= 0) {
      m.sweatT = 0.1 + 0.3 * m.power;
      var s = Math.random() < 0.5 ? -1 : 1;
      particles.push({ x: b.x + s * b.r * (0.3 + Math.random() * 0.4), y: b.y - b.r * (0.6 + Math.random() * 0.3), vx: s * (40 + Math.random() * 70), vy: -60 - Math.random() * 60,
        life: 0.45, max: 0.45, size: 2 + Math.random() * 1.6, color: "#a8dcff" });
    }
  }
}

// From hurt() (match.js): what his gas tank does to the damage he deals,
// the extra he takes when he's left open after a whiff, and calf kicks.
function conorDamageMult(b, source, attackerId) {
  if (source === "kopunch" || source === "kofinal" || source === "laser") return 1;
  var mult = 1, atk = attackerId != null ? balls[attackerId] : null;
  if (atk && atk !== b && atk.cm) mult *= atk.cm.dmg;
  var m = b.cm, cfg = cmCfg(b);
  if (m && cfg) {
    if (m.counter && m.counter.phase === "open") mult *= cfg.counter.openVuln || 1;
    if (atk && atk !== b && cfg.calfKicksHurt && (source === "kick" || source === "kickback") &&
        (atk.cmCalf || (atk.char.poatan && atk.char.poatan.calfKick))) mult *= cfg.calfKicksHurt;
  }
  return mult;
}

// From beginArmbar (armbar.js) and beginRnc (rnc.js): he taps more often,
// more still once he's gassed. Holds that are never finished (Hokit's armbar)
// stay that way.
function conorTapChance(vic, tapChance, odds) {
  var cfg = cmCfg(vic), gt = cfg && cfg.gasTank;
  if (!vic.cm || !gt || !gt.tapExtra || !odds || !(odds.tapBase > 0 || odds.tapLowHp > 0)) return tapChance;
  return Math.min(95, tapChance + cmLerp(gt.tapExtra, vic.cm.power));
}

// A punch he blocks or slips: "He throws an overhand right..."
function cmSlipWatch(b, other, m, cfg) {
  var s = m.seen, dodged = !!b.justDodged;
  var blocked = b.flash === 0.1 && s.flash !== 0.1 && b.hp === s.hp; // (a block sets flash 0.1 and takes nothing)
  var tt = cfg.trashTalk;
  if (tt && ((dodged && !s.dodged) || blocked) && started && !over && other.alive && !m.taunt && !m.counter && canSay(b) && Math.random() * 100 < (tt.slipLine || 0)) {
    say(b, pickLine(b, CM_LINES.slip, "slip"));
    angerThem(b, other, tt.anger, false);
  }
  s.dodged = dodged; s.flash = b.flash; s.hp = b.hp;
}

// The knockout (13 SECONDS) and the win.
function cmWinWatch(b, other, m, cfg) {
  if (!b.alive) return;
  var ko = other.koOut || (!other.alive && over && winBy !== "submission");
  if (ko && !m.koSeen) {
    m.koSeen = true;
    var th = cfg.thirteen;
    if (th && m.t <= th.within) {
      cm13 = { t: 0, secs: Math.max(1, Math.ceil(m.t - 1e-6)), id: b.id, show: th.show || 4 };
      play13Seconds();
      crowdReact(1);
    }
  }
  if (over && !other.alive && !m.won) {
    m.won = true;
    m.winLine = true;
  }
  // After a counter knockout it waits for "Precision beats power..." to finish.
  if (m.winLine && !speaking(b)) { m.winLine = false; say(b, CM_LINES.win); }
}

// ---------------------------------------------------------------- the abilities loop

// From the abilities loop, before the special. True while it's running.
// Also runs for his rivals (Dustin's calf kicks, Khabib's extra grappling).
function updateConor(self, other, dt) {
  if (!self.cm) return cmRivalUpdate(self, other, dt);
  var m = self.cm, cfg = cmCfg(self);
  if (cmHeld(self) && !(m.counter && m.counter.phase === "ko")) return false;
  if (m.counter) return runCounter(self, other, m, cfg, dt);
  if (!started || over || self.igbb || !other.alive) { if (m.taunt) endTaunt(self); return false; }
  if (counterReady(self, other, m, cfg.counter)) {
    startCounter(self, other, m, false, cfg.counter.maxPlant);
    return runCounter(self, other, m, cfg, dt);
  }
  if (m.taunt) return runTaunt(self, other, m, cfg, dt);
  var tt = cfg.trashTalk;
  if (!tt) return false;
  m.talkT -= dt;
  if (m.talkT > 0 || !canSay(self) || !canTaunt(self, other, tt)) return false;
  startTaunt(self, other, m, tt);
  return true;
}

// ---------------------------------------------------------------- trash talk

function canTaunt(self, other, tt) {
  if (!other.alive || other.invincible || other.koOut || other.igbb || specialBusy(self) || specialBusy(other)) return false;
  if (self.punch || self.kick || self.koPunch || !inOrdinaryMovement(self) || swordDuelActive()) return false;
  return cmDist(self, other) > self.r + other.r + tt.gap;
}

function cmPickTaunt(self, other) {
  var vs = null;
  Object.keys(CM_LINES.vs).forEach(function (id) { if (cmIs(other, id) && !cmCfg(other)) vs = CM_LINES.vs[id]; });
  if (vs && Math.random() < 0.45) return pickLine(self, vs, "vs");
  return pickLine(self, CM_LINES.taunt, "taunt");
}

// The line, then the strut: off sideways across them, slowly, rocking.
function startTaunt(self, other, m, tt) {
  var line = m.opened ? cmPickTaunt(self, other) : pickLine(self, CM_LINES.opener, "open");
  m.opened = true;
  m.talkT = cmRand(tt.every);
  say(self, line);
  if (!(tt.strut > 0)) { angerThem(self, other, tt.anger, false); return; } // (no strut: straight to them)
  m.taunt = { t: 0, angered: false };
  var a = Math.atan2(other.y - self.y, other.x - self.x) + (Math.random() < 0.5 ? 1 : -1) * Math.PI / 2;
  self.vx = Math.cos(a); self.vy = Math.sin(a);
  setSpeed(self, (self.baseSpeed || SPEED) * tt.strutSpeed);
}
function runTaunt(self, other, m, cfg, dt) {
  var ta = m.taunt, tt = cfg.trashTalk;
  ta.t += dt;
  setSpeed(self, (self.baseSpeed || SPEED) * tt.strutSpeed);
  if (!ta.angered && ta.t >= tt.angerAt) { ta.angered = true; angerThem(self, other, tt.anger, false); }
  if (ta.t >= tt.strut) { endTaunt(self); return false; }
  return true;
}
function endTaunt(self) {
  var m = self.cm;
  if (!m || !m.taunt) return;
  var cfg = cmCfg(self);
  if (!m.taunt.angered && cfg.trashTalk && self.alive) angerThem(self, balls[1 - self.id], cfg.trashTalk.anger, false); // (the line still landed)
  m.taunt = null;
  if (self.alive && inOrdinaryMovement(self)) setSpeed(self, self.baseSpeed || SPEED);
}

// It gets to them: the same anger as Josh Hokit's thumbs down (hokit.js).
function angerThem(self, other, dur, furious) {
  if (!other || !other.alive || other.koOut || !(dur > 0)) return;
  other.angry = { t: 0, dur: dur, atId: self.id };
  floater(other.x, other.y - other.r - 26, furious ? "FURIOUS!" : "ANGRY", "note");
  playTauntOoh();
  crowdReact(0.3);
}

// ---------------------------------------------------------------- the counter left

// An angry opponent closing in on him.
function counterReady(self, other, m, cc) {
  if (!cc || m.counterCd > 0 || !other.alive || other.koOut || other.invincible || other.igbb) return false;
  var a = other.angry;
  if (!a || a.atId !== self.id || !inOrdinaryMovement(other)) return false;
  if (self.punch || self.kick || self.koPunch || specialBusy(self) || swordDuelActive()) return false;
  var dx = other.x - self.x, dy = other.y - self.y, d = Math.sqrt(dx * dx + dy * dy) || 1;
  if (d - self.r - other.r > cc.plantRange) return false;
  var closing = -((other.vx - self.vx) * dx + (other.vy - self.vy) * dy) / d;
  return closing > 60;
}

function startCounter(self, other, m, presser, maxPlant) {
  if (m.taunt) m.taunt = null;
  self.punch = null; self.jabAnim = null;
  m.counter = { phase: "plant", t: 0, presser: !!presser, maxPlant: maxPlant, ang: Math.atan2(other.y - self.y, other.x - self.x), whiffed: false };
  self.vx = 0; self.vy = 0;
  playCounterPlant();
}

function runCounter(self, other, m, cfg, dt) {
  var c = m.counter, cc = cfg.counter;
  c.t += dt;
  if (c.phase === "ko") return counterKo(self, other, m, dt);
  if (over || !other.alive || other.koOut || other.igbb) { endCounter(self, m, false); return false; }
  var dx = other.x - self.x, dy = other.y - self.y, d = Math.sqrt(dx * dx + dy * dy) || 1, gap = d - self.r - other.r;
  self.vx = 0; self.vy = 0;
  if (c.phase === "plant") {
    c.ang = Math.atan2(dy, dx);
    // Timed to land as they arrive: fired early by however far they'll
    // close in before it lands (an angry charger is quick).
    var closing = Math.max(0, -((other.vx - self.vx) * dx + (other.vy - self.vy) * dy) / d);
    var timeUp = c.t >= c.maxPlant;
    if (gap - closing * (CM_HIT_AT + 0.02) <= cc.reach || timeUp) {
      if (timeUp && gap > cc.reach * 2) { endCounter(self, m, false); return false; } // they never came
      throwCounter(self, other, c);
    }
    return true;
  }
  if (c.phase === "throw") {
    if (gap > 4) { self.vx = dx / d * cc.step; self.vy = dy / d * cc.step; } // steps in behind it
    var kp = self.koPunch;
    if (kp) {
      kp.t += dt;
      if (!kp.hit && kp.t >= kp.hitAt) {
        kp.hit = true;
        if (landCounter(self, other, m, cfg, c)) return true; // a knockout: the strut takes over
      }
      if (self.koPunch && kp.t >= kp.dur) self.koPunch = null;
    }
    if (!self.koPunch) {
      if (!c.whiffed) { endCounter(self, m, true); return false; }
      c.phase = "open"; c.t = 0;
      floater(self.x, self.y - self.r - 30, "OPEN!", "note");
    }
    return true;
  }
  // Open: overcommitted to it and off balance.
  if (c.t >= cc.openTime) { endCounter(self, m, true); return false; }
  return true;
}

function throwCounter(self, other, c) {
  c.phase = "throw"; c.t = 0;
  var size = self.char.punch.size || 15;
  // An angry opponent running onto it can't slip or block it (angryCantSlip).
  c.onto = !!(cmCfg(self).counter.angryCantSlip && other.angry && other.angry.atId === self.id);
  self.koPunch = { t: 0, dur: 0.2, hitAt: CM_HIT_AT, hit: false, targetId: other.id, size: size * 1.5, kind: "jab", side: -1, cmCounter: true };
  playWhoosh();
}

// The left hand arriving (or not). True on a knockout.
function landCounter(self, other, m, cfg, c) {
  var cc = cfg.counter;
  if (!other.alive || other.koOut) return false;
  var dx = other.x - self.x, dy = other.y - self.y, d = Math.sqrt(dx * dx + dy * dy) || 1;
  if (d - self.r - other.r > cc.reach + 8 || Math.random() * 100 < cc.whiff) {
    c.whiffed = true;
    floater(other.x, other.y - other.r - 8, "WHIFF", "dodge");
    return false;
  }
  var gt = cfg.gasTank, sp = self.char.special;
  var koP = (cc.koBase + cc.koLow * (1 - other.hp / MAX_HP)) * (gt ? cmLerp(gt.koMult, m.power) : 1);
  if (c.presser && sp && sp.move === "presser") koP += sp.koBonus || 0;
  if (m.t < (cc.koAfter || 0)) koP = 0; // never a knockout in the first few seconds
  if (!other.holdAtOne && Math.random() * 100 < koP) {
    // Goes through every normal defence (weave, block, ...) like the KO
    // Rush, unless they ran onto it.
    if (c.onto ? counterKoPunch(self, other) : throwKoPunch(self, other)) { beginCounterKo(self, other, m, c); return true; }
    if (other.justDodged) c.whiffed = true;
    return false;
  }
  // ("kofinal", like the Slugfest's last punch: no slip, no block. The gas
  // tank is applied here since conorDamageMult leaves that source alone.)
  var dealt = c.onto ? hurt(other, cc.damage * m.dmg, "kofinal", self.id) : hurt(other, cc.damage, "punch", self.id);
  if (dealt > 0) {
    playCounterCrack(dealt);
    floater(other.x, other.y - other.r - 34, "COUNTER LEFT!", "crit");
    counterImpact(self, other);
    other.angry = null; // snapped out of it
    if (!other.justDodged && cmKnockable(other)) { other.vx += dx / d * cc.knockback; other.vy += dy / d * cc.knockback; }
  } else if (other.justDodged) c.whiffed = true;
  checkEnd();
  return false;
}

// throwKoPunch (korush.js) for an opponent who ran onto it: the same
// knockout, but it can't be slipped or blocked.
function counterKoPunch(self, target) {
  var amount = Math.ceil(target.hp / incomingMultiplier(target));
  var wasHolding = target.holdAtOne;
  target.holdAtOne = true;
  var dealt = hurt(target, amount, "kofinal", self.id);
  target.holdAtOne = wasHolding;
  if (!(dealt > 0)) return false;
  playPunch(dealt);
  target.hp = 0;
  target.koOut = true;
  target.punch = null; target.kick = null; target.swing = null; target.throwAnim = null; target.jabAnim = null;
  var dx = target.x - self.x, dy = target.y - self.y, d = Math.sqrt(dx * dx + dy * dy) || 1;
  target.vx = dx / d * 260; target.vy = dy / d * 260;
  knockoutFx(self, target);
  return true;
}

// A flash, a freeze and green sparks off the chin.
function counterImpact(self, other) {
  var dx = other.x - self.x, dy = other.y - self.y, d = Math.sqrt(dx * dx + dy * dy) || 1, ux = dx / d, uy = dy / d;
  var cx = other.x - ux * other.r, cy = other.y - uy * other.r;
  other.flash = 0.16;
  other.squash = { t: 0.16, max: 0.16, nx: -ux, ny: -uy };
  impacts.push({ x: cx, y: cy, nx: -ux, ny: -uy, life: 0.45, max: 0.45, color: "#169b62" });
  hitStop = Math.max(hitStop, 0.09);
  if (!reduceMotion) shake = Math.max(shake, 14);
  for (var i = 0; i < 16 && !reduceMotion; i++) {
    var a = Math.atan2(uy, ux) + (Math.random() - 0.5) * 2.2, s = 140 + Math.random() * 300;
    particles.push({ x: cx, y: cy, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 0.3 + Math.random() * 0.3, max: 0.6, size: 2 + Math.random() * 3, color: i % 3 ? "#7dffb0" : "#ffffff" });
  }
}

// Out cold: a beat watching them drop, then the billionaire strut round them.
function beginCounterKo(self, other, m, c) {
  self.koPunch = null;
  c.phase = "ko"; c.t = 0;
  m.koCounter = true;
  say(self, CM_LINES.counterKo); // ("KNOCKOUT!" is already up, from throwKoPunch)
  crowdReact(1);
  playCounterCrack(60);
}
function counterKo(self, other, m, dt) {
  var c = m.counter;
  if (other.koOut) { var damp = Math.exp(-5 * dt); other.vx *= damp; other.vy *= damp; }
  if (c.t < CM_KO_BEAT) { self.vx = 0; self.vy = 0; }
  else {
    if (!c.dir) {
      var a = Math.atan2(self.y - other.y, self.x - other.x) + (Math.random() < 0.5 ? 1 : -1) * 0.9;
      c.dir = { x: Math.cos(a), y: Math.sin(a) };
      self.vx = c.dir.x; self.vy = c.dir.y;
    }
    setSpeed(self, (self.baseSpeed || SPEED) * 0.42);
  }
  if (c.t >= CM_KO_TIME) {
    m.counter = null;
    finishKnockedOut(other);
    checkEnd();
    if (self.alive) setSpeed(self, self.baseSpeed || SPEED);
    return false;
  }
  return true;
}

function endCounter(self, m, cooldown) {
  var c = m.counter;
  m.counter = null;
  if (self.koPunch && self.koPunch.cmCounter) self.koPunch = null;
  if (cooldown) m.counterCd = cmCfg(self).counter.cooldown;
  if (c && c.presser && cmPodium && cmPodium.id === self.id && cmPodium.sink == null) cmPodium.sink = cmPodium.t;
  if (self.alive && inOrdinaryMovement(self)) setSpeed(self, self.baseSpeed || SPEED);
}

// ---------------------------------------------------------------- Press Conference

// From updateSpecial (special.js) for special.move "presser".
function updatePresser(self, other, dt) {
  var sp = self.char.special, m = self.cm;
  if (!m) return false; // (the move without the rest of his kit)
  if (!self.igbb) {
    if (self.specialT < sp.chargeTime || m.counter || m.taunt || !canStartIgbb(self, other) || swordDuelActive()) return false;
    if (cmDist(self, other) < self.r + other.r + (sp.room || 0)) return false; // waits for some room, so they have to come at him
    clearActions(self);
    self.igbb = { move: "presser", phase: "rise", t: 0, thrown: 0, next: 0, throwT: 9, angered: false };
    self.vx = 0; self.vy = 0;
    cmPodium = { id: self.id, x: self.x, y: self.y, t: 0, sink: null };
    floater(self.x, self.y - self.r - 30, "PRESS CONFERENCE!", "crit");
    playMicFeedback();
    crowdReact(0.7);
  }
  var g = self.igbb;
  if (g.move !== "presser") return false;
  g.t += dt; g.throwT += dt;
  self.vx = 0; self.vy = 0;
  if (over || !other.alive) { endPresser(self, false); return false; }
  if (cmPodium && cmPodium.id === self.id) { cmPodium.x = self.x; cmPodium.y = self.y; }
  var gap = cmDist(self, other) - self.r - other.r, cc = cmCfg(self).counter;
  // They got to him: straight into the counter.
  if (g.angered && cc && gap < cc.plantRange * 0.7) { endPresser(self, true); return false; }
  if (g.phase === "rise") {
    if (g.t >= CM_RISE) { g.phase = "talk"; g.t = 0; say(self, cmPresserLine(self, other)); }
    return true;
  }
  // Talking: the line gets to them, then the bottles (the UFC 202 presser)
  // fly one after another as they come for him.
  if (!g.angered && g.t >= 0.4) { g.angered = true; angerThem(self, other, sp.anger, true); }
  if (g.angered && g.t >= 0.55) {
    g.next -= dt;
    if (g.thrown < sp.bottles && g.next <= 0) { throwBottle(self, other, sp); g.thrown++; g.next = CM_BOTTLE_GAP; g.throwT = 0; }
  }
  if (g.thrown >= sp.bottles && g.t >= sp.talk && g.next <= 0) { endPresser(self, true); return false; }
  return true;
}
function cmPresserLine(self, other) {
  var vs = null;
  Object.keys(CM_LINES.vs).forEach(function (id) { if (cmIs(other, id) && !cmCfg(other)) vs = CM_LINES.vs[id]; });
  if (vs && Math.random() < 0.35) return pickLine(self, vs, "vs");
  return pickLine(self, CM_LINES.presser, "presser");
}
function endPresser(self, toCounter) {
  self.igbb = null; self.specialT = 0;
  var m = self.cm;
  if (toCounter && m && cmCfg(self).counter && self.alive && !over) { startCounter(self, balls[1 - self.id], m, true, self.char.special.wait); return; }
  if (cmPodium && cmPodium.id === self.id && cmPodium.sink == null) cmPodium.sink = cmPodium.t;
  if (self.alive) setSpeed(self, self.baseSpeed || SPEED);
}

// A water bottle, thrown where they're headed. Slips and blocks like any
// thrown thing.
function throwBottle(self, other, sp) {
  var tx = other.x + other.vx * 0.12, ty = other.y + other.vy * 0.12;
  var dx = tx - self.x, dy = ty - self.y, d = Math.sqrt(dx * dx + dy * dy) || 1;
  projectiles.push({
    x: self.x + dx / d * (self.r + 8), y: self.y + dy / d * (self.r + 8),
    vx: dx / d * sp.bottleSpeed, vy: dy / d * sp.bottleSpeed,
    r: 15, damage: sp.bottleDamage, color: "#bfe6ff", imgData: cmBottleImg(), aspect: 20 / 48,
    spin: (Math.random() < 0.5 ? -1 : 1) * (9 + Math.random() * 5), angle: Math.random() * 6, gem: false, ownerId: self.id
  });
  playBottleThrow();
}

// The bottle picture, drawn once in code (and loaded up front, below):
// blue cap, clear plastic, a label.
function cmBottleImg() {
  if (cmBottleSrc) return cmBottleSrc;
  try {
    var cv = document.createElement("canvas"); cv.width = 20; cv.height = 48;
    var g = cv.getContext("2d");
    g.fillStyle = "#16211f";
    g.fillRect(6, 0, 8, 6); g.fillRect(5, 5, 10, 6); g.fillRect(2, 10, 16, 38);
    g.fillStyle = "#1e6fd9"; g.fillRect(7, 1, 6, 4);
    g.fillStyle = "#d8f0ff"; g.fillRect(6, 6, 8, 4); g.fillRect(3, 11, 14, 36);
    g.fillStyle = "#9fd4f7"; g.fillRect(3, 20, 14, 27);              // the water
    g.fillStyle = "#ffffff"; g.fillRect(3, 25, 14, 9);               // label
    g.fillStyle = "#169b62"; g.fillRect(3, 28, 14, 3);
    g.fillStyle = "rgba(255,255,255,0.7)"; g.fillRect(5, 12, 2, 32); // shine
    cmBottleSrc = cv.toDataURL("image/png");
  } catch (e) { cmBottleSrc = null; }
  return cmBottleSrc;
}

// ---------------------------------------------------------------- rivals

// First frame of the fight: Khabib's Send Me Location comes early.
function cmSetupRivals(conor, other) {
  var rv = cmRival(conor, other);
  if (!rv) return;
  if (rv.sendLocFirst && other.char.sendLocation && !other.sendLocN) other.sendLocT = cmRand(rv.sendLocFirst);
  if (rv.calfKicks) other.cmCalfT = cmRand(rv.calfKicks.first || rv.calfKicks.every);
}

// The abilities loop for his rivals: Khabib's grabs come round faster,
// Dustin throws calf kicks. True while Dustin's kick is out.
function cmRivalUpdate(self, other, dt) {
  var rv = cmRival(other, self);
  if (!rv || !other.cm) return false;
  if (rv.grappleBoost > 1 && self.char.hasGrapple && self.grappleCd > 0) self.grappleCd = Math.max(0, self.grappleCd - dt * (self.atkRate || 1) * (rv.grappleBoost - 1));
  if (rv.calfKicks) return calfKick(self, other, rv.calfKicks, dt);
  return false;
}

// Dustin's calf kick (only against Conor): a low kick at his lead leg.
function calfKick(self, other, ck, dt) {
  var k = self.cmCalf, gap = cmDist(self, other) - self.r - other.r;
  if (!k) {
    if (self.cmCalfT == null) self.cmCalfT = cmRand(ck.every);
    self.cmCalfT -= dt;
    if (self.cmCalfT > 0 || !started || over || !other.alive || other.koOut || gap > ck.range) return false;
    if (self.punch || self.koPunch || self.igbb || specialBusy(self) || specialBusy(other) || !inOrdinaryMovement(self) || swordDuelActive()) return false;
    self.cmCalf = k = { t: 0, hit: false, dur: 0.4, side: Math.random() < 0.5 ? -1 : 1 };
    playWhoosh();
  }
  k.t += dt;
  if (!k.hit && k.t >= 0.15) {
    k.hit = true;
    if (other.alive && !other.koOut && gap <= ck.range + 12) {
      var dealt = hurt(other, ck.damage, "kick", self.id);
      if (dealt > 0) {
        playKick();
        if (!slowedBy(other, "limp")) floater(other.x, other.y - other.r - 30, "CALF KICK!", "note");
        addSlow(other, ck.slow, ck.time, "limp");
        if (!reduceMotion) shake = Math.max(shake, 8);
      }
      checkEnd();
    }
  }
  if (k.t >= k.dur) { self.cmCalf = null; self.cmCalfT = cmRand(ck.every); return false; }
  return true;
}

// From attemptGrab (grapple-duel.js) once the shot can't be stopped: Khabib
// takes Conor's back for the choke, or drives him down and pounds on him.
// True if one of them happened.
function tryKhabibOnConor(atk, tgt) {
  if (!tgt.cm || !tgt.alive || tgt.igbb || !cmIs(atk, CM_KHABIB)) return false; // (mid press conference: the normal grab breaks it up)
  var rv = cmRival(tgt, atk);
  if (!rv) return false;
  var roll = Math.random() * 100, rnc = rv.rncChance || 0, gnp = rv.gnpChance || 0;
  if (roll >= rnc + gnp) return false;
  atk.grappleCd = atk.char.grapple ? atk.char.grapple.cooldown : 0;
  if (tgt.cm.taunt) tgt.cm.taunt = null;
  if (tgt.cm.counter) endCounter(tgt, tgt.cm, false);
  if (roll < rnc) {
    floater(atk.x, atk.y - atk.r - 44, "TAKES THE BACK", "note");
    beginRnc(atk, tgt);
    return true;
  }
  // Jon's ground and pound (beginJonGnp, jon.js), with Khabib on top.
  var side = atk.x >= tgt.x ? 1 : -1;
  var g = { atkId: atk.id, t: 0, nx: side, ny: 0, bar: 0, phase: "drive" };
  tgt.guillo = g;
  atk.choked = true;
  [atk, tgt].forEach(function (b) {
    b.vx = 0; b.vy = 0;
    b.punch = null; b.kick = null; b.throwAnim = null; b.swing = null; b.checkAnim = null;
  });
  beginGuilloGnp(tgt, atk, g);
  floater(atk.x, atk.y - atk.r - 44, "GROUND AND POUND", "crit");
  return true;
}

// Khabib pounding on him (Father's Plan, the finisher, the ground and pound
// above): "Let's talk now." (picked up by the cage mics at UFC 229).
function cmLetsTalk(conor, kh) {
  if (!kh.alive || !cmIs(kh, CM_KHABIB) || !cmRival(conor, kh)) return;
  var seq = null;
  if (kh.igbb && kh.igbb.move === "fathersplan" && kh.igbb.phase === "pound") seq = kh.igbb;
  else if (kh.grapple && kh.grapple.finisher && kh.grapple.phase === "pin") seq = kh.grapple;
  else if (conor.guillo && conor.guillo.atkId === kh.id && conor.guillo.phase === "pound") seq = conor.guillo;
  if (seq && kh.cmTalkFor !== seq) { kh.cmTalkFor = seq; say(kh, CM_LINES.khabibGnp); }
}

// ---------------------------------------------------------------- drawing

// From draw(), with the other body poses: rocking side to side on the strut,
// squatting into the plant, leaning after a whiff, heaving when gassed.
function applyConorPose(b) {
  var m = b.cm;
  if (!m || !b.alive) return;
  var ay = b.y + b.r;
  if (cmStrutting(b)) {
    var rock = Math.sin(m.strutPh) * 0.13, bob = Math.abs(Math.cos(m.strutPh)) * b.r * 0.07;
    ctx.translate(b.x, ay); ctx.rotate(rock); ctx.translate(-b.x, -ay - bob);
    return;
  }
  var c = m.counter;
  if (c && (c.phase === "plant" || c.phase === "throw")) {
    var k = c.phase === "plant" ? Math.min(1, c.t / 0.08) : Math.max(0, 1 - c.t / 0.2);
    ctx.translate(b.x, ay); ctx.scale(1 + 0.08 * k, 1 - 0.08 * k); ctx.translate(-b.x, -ay);
    return;
  }
  if (c && c.phase === "open") {
    var lean = (Math.cos(c.ang) >= 0 ? 1 : -1) * 0.2 * Math.max(0, 1 - c.t / 0.6);
    ctx.translate(b.x, ay); ctx.rotate(lean); ctx.translate(-b.x, -ay);
    return;
  }
  if (m.power < 0.5 && !b.igbb && started && !over) {
    var br = (0.5 - m.power) * 2 * (0.5 + 0.5 * Math.sin(cmClock * 4.5));
    ctx.translate(b.x, ay); ctx.scale(1 + 0.03 * br, 1 - 0.045 * br); ctx.translate(-b.x, -ay);
  }
}

// From draw(), per fighter, after its hands: the gas tank bar, his strut,
// the counter stance, the podium, and Dustin's calf kick.
function drawConor(b) {
  if (!b.alive) return;
  if (b.cmCalf) drawCalfKick(b);
  var m = b.cm;
  if (!m) return;
  var other = balls[1 - b.id];
  if (cmPodium && cmPodium.id === b.id) drawPodium(b);
  if (presserOn(b)) drawPresserHands(b, other);
  else if (cmStrutting(b)) drawStrutArms(b);
  else if (m.counter) drawCounterStance(b, other, m.counter);
  drawGasBar(b, other, m);
}

// The billionaire strut: arms bowed out wide, swinging in turn.
function drawStrutArms(b) {
  var m = b.cm, r = b.r, size = b.char.punch.size || 14;
  ctx.save();
  [-1, 1].forEach(function (s) {
    var sw = Math.sin(m.strutPh + (s > 0 ? Math.PI : 0));
    var sx = b.x + s * r * 0.72, sy = b.y - r * 0.08;
    var hx = b.x + s * r * (1.36 + 0.06 * sw), hy = b.y + r * (0.3 + 0.26 * sw);
    strokeLimb(size * 0.68, armColor(b.char, s), function () {
      ctx.moveTo(sx, sy); ctx.quadraticCurveTo(b.x + s * r * 1.36, b.y - r * 0.12, hx, hy);
    });
    drawGloveAt(hx, hy, size * 0.82, b.char, Math.PI / 2 - s * 0.5);
  });
  ctx.restore();
}

// Planted for the counter: the right hand out front measuring, the left
// cocked by his chin and glowing (the tell). Open after a whiff: the left
// still hanging out there, the right dropped.
function drawCounterStance(b, other, c) {
  var r = b.r, size = b.char.punch.size || 14, ux = Math.cos(c.ang), uy = Math.sin(c.ang), px = -uy, py = ux;
  ctx.save();
  if (c.phase === "plant") {
    var tr = Math.sin(cmClock * 70) * 1.2, k = Math.min(1, c.t / 0.12);
    var lead = { x: b.x + ux * r * (0.95 + 0.15 * Math.sin(cmClock * 9)) + px * r * 0.42, y: b.y + uy * r * (0.95 + 0.15 * Math.sin(cmClock * 9)) + py * r * 0.42 };
    var rear = { x: b.x + ux * r * (0.5 - 0.25 * k) - px * r * 0.5 + tr, y: b.y + uy * r * (0.5 - 0.25 * k) - py * r * 0.5 - r * 0.18 * k };
    strokeLimb(size * 0.68, armColor(b.char, 1), function () { ctx.moveTo(b.x + px * r * 0.5, b.y + py * r * 0.5); ctx.lineTo(lead.x, lead.y); });
    drawGloveAt(lead.x, lead.y, size * 0.85, b.char, c.ang);
    strokeLimb(size * 0.72, armColor(b.char, -1), function () { ctx.moveTo(b.x - px * r * 0.55, b.y - py * r * 0.55); ctx.lineTo(rear.x, rear.y); });
    drawGloveAt(rear.x, rear.y, size * 1.05, b.char, c.ang);
    // The glow on the left hand.
    var pulse = 0.5 + 0.5 * Math.sin(cmClock * 26);
    ctx.globalAlpha = 0.45 + 0.45 * pulse;
    ctx.strokeStyle = "#7dffb0"; ctx.lineWidth = 3.5;
    ctx.beginPath(); ctx.arc(rear.x, rear.y, size * (1.45 + 0.25 * pulse), 0, Math.PI * 2); ctx.stroke();
    ctx.globalAlpha = 0.25 * pulse; ctx.fillStyle = "#c8ffe0";
    ctx.beginPath(); ctx.arc(rear.x, rear.y, size * 1.35, 0, Math.PI * 2); ctx.fill();
  } else if (c.phase === "throw" && b.koPunch && b.koPunch.cmCounter) {
    // Speed lines behind the left hand (drawKoPunch draws the fist itself).
    var ta = Math.atan2(other.y - b.y, other.x - b.x);
    ux = Math.cos(ta); uy = Math.sin(ta); px = -uy; py = ux;
    var kp = b.koPunch, w = kp.t < kp.hitAt ? kp.t / kp.hitAt : Math.max(0, 1 - (kp.t - kp.hitAt) / (kp.dur - kp.hitAt));
    var dist = r + 4 + (Math.max(r + 4, cmDist(b, other) - other.r + 4) - r - 4) * w;
    var fx = b.x + ux * dist - px * r * 0.4, fy = b.y + uy * dist - py * r * 0.4;
    ctx.globalAlpha = 0.55 * w; ctx.strokeStyle = "#7dffb0"; ctx.lineWidth = 3; ctx.lineCap = "round";
    [-1, 0, 1].forEach(function (o) {
      ctx.beginPath(); ctx.moveTo(fx - ux * r * 1.1 + px * o * 7, fy - uy * r * 1.1 + py * o * 7); ctx.lineTo(fx - ux * r * 0.35 + px * o * 7, fy - uy * r * 0.35 + py * o * 7); ctx.stroke();
    });
  } else if (c.phase === "open") {
    var back = Math.min(1, c.t / 0.6);
    var out = { x: b.x + ux * r * (1.55 - 0.5 * back) - px * r * 0.3, y: b.y + uy * r * (1.55 - 0.5 * back) - py * r * 0.3 };
    var low = { x: b.x + px * r * 0.75, y: b.y + r * 0.55 };
    strokeLimb(size * 0.7, armColor(b.char, -1), function () { ctx.moveTo(b.x - px * r * 0.45, b.y - py * r * 0.45); ctx.lineTo(out.x, out.y); });
    drawGloveAt(out.x, out.y, size * 0.95, b.char, c.ang);
    strokeLimb(size * 0.68, armColor(b.char, 1), function () { ctx.moveTo(b.x + px * r * 0.5, b.y + py * r * 0.2); ctx.lineTo(low.x, low.y); });
    drawGloveAt(low.x, low.y, size * 0.85, b.char, Math.PI / 2);
  }
  ctx.restore();
}

// The gas tank: a bar just under his health bar, green while he's fresh,
// going amber then red as it runs dry.
function drawGasBar(b, other, m) {
  if (!cmCfg(b).gasTank) return;
  var pinned = other.grapple && other.grapple.finisher && other.grapple.phase !== "carry" || other.rnc;
  if (pinned) return;
  var bw = 64, bx = b.x - bw / 2, by = b.y - b.r - 18;
  if (by < 4) by = b.y + b.r + 10;
  var gy = by + 10, gh = 6;
  var col = m.power >= 1 ? "#22c55e" : m.power > 0.5 ? mixHex("#f59e0b", "#22c55e", (m.power - 0.5) * 2) : mixHex("#ef4444", "#f59e0b", m.power * 2);
  ctx.save();
  ctx.fillStyle = "rgba(0,0,0,0.55)"; ctx.fillRect(bx, gy, bw, gh);
  if (m.gas < 0.2 && Math.sin(cmClock * 14) > 0) ctx.globalAlpha = 0.45;
  ctx.fillStyle = col; ctx.fillRect(bx, gy, bw * Math.max(0, m.gas), gh);
  ctx.globalAlpha = 1;
  ctx.lineWidth = 1.5; ctx.strokeStyle = theme.wall; ctx.strokeRect(bx, gy, bw, gh);
  ctx.restore();
}

// The podium (a dark wood lectern with a shamrock, a mic on a gooseneck),
// rising out of the mat in front of him and sinking back after.
function drawPodium(b) {
  var p = cmPodium, r = b.r;
  var up = p.sink != null ? Math.max(0, 1 - (p.t - p.sink) / CM_SINK) : Math.min(1, p.t / CM_RISE);
  if (up <= 0) return;
  var e = up * up * (3 - 2 * up);
  var base = p.y + r * 1.12, full = r * 1.08, top = base - full * e;
  var wt = r * 0.78, wb = r * 0.6;
  ctx.save();
  ctx.beginPath(); ctx.rect(p.x - r * 2, p.y - r * 3, r * 4, base - (p.y - r * 3)); ctx.clip();
  // the mic on its gooseneck, up to his chin
  if (e > 0.6) {
    var mk = (e - 0.6) / 0.4;
    ctx.lineCap = "round"; ctx.strokeStyle = "#1c1c1c"; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(p.x + r * 0.25, top + 2); ctx.quadraticCurveTo(p.x + r * 0.32, top - r * 0.35 * mk, p.x + r * 0.12, top - r * 0.62 * mk); ctx.stroke();
    ctx.fillStyle = "#111111"; ctx.beginPath(); ctx.ellipse(p.x + r * 0.1, top - r * 0.66 * mk, r * 0.1, r * 0.13, -0.4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#555555"; ctx.beginPath(); ctx.arc(p.x + r * 0.07, top - r * 0.7 * mk, r * 0.035, 0, Math.PI * 2); ctx.fill();
  }
  // the lectern
  ctx.fillStyle = "#3b2416"; ctx.strokeStyle = theme.wall; ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(p.x - wt, top); ctx.lineTo(p.x + wt, top); ctx.lineTo(p.x + wb, top + full); ctx.lineTo(p.x - wb, top + full); ctx.closePath();
  ctx.fill(); ctx.stroke();
  ctx.fillStyle = "#5c3a22"; ctx.fillRect(p.x - wt + 2, top + 1.5, wt * 2 - 4, r * 0.14);
  ctx.strokeStyle = "rgba(255,220,160,0.18)"; ctx.lineWidth = 1.5;
  for (var i = 1; i < 4; i++) { ctx.beginPath(); ctx.moveTo(p.x - wb * 0.85 + i * wb * 0.42, top + r * 0.2); ctx.lineTo(p.x - wb * 0.85 + i * wb * 0.42, top + full - 4); ctx.stroke(); }
  // a green shamrock on the front
  var sx = p.x, sy = top + full * 0.48, sr = r * 0.13;
  ctx.fillStyle = "#169b62"; ctx.strokeStyle = "#0b3d24"; ctx.lineWidth = 1.5;
  [[-1, 0], [1, 0], [0, -1]].forEach(function (q) {
    ctx.beginPath(); ctx.arc(sx + q[0] * sr * 0.95, sy + q[1] * sr * 0.95 - (q[1] ? 0 : sr * 0.2), sr, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  });
  ctx.strokeStyle = "#0b3d24"; ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.moveTo(sx, sy + sr * 0.4); ctx.quadraticCurveTo(sx + sr * 0.2, sy + sr * 1.4, sx + sr * 0.7, sy + sr * 1.9); ctx.stroke();
  // the name plate
  ctx.fillStyle = "#d4af37"; ctx.fillRect(p.x - wb * 0.75, top + full * 0.78, wb * 1.5, r * 0.15);
  ctx.fillStyle = "#3b2416"; ctx.font = "900 " + Math.round(r * 0.13) + "px Impact, 'Arial Black', sans-serif";
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillText("McGREGOR", p.x, top + full * 0.78 + r * 0.08);
  ctx.restore();
}

// At the podium: both hands on it while he talks; then the bottles, the
// right hand whipping each one out at them.
function drawPresserHands(b, other) {
  var g = b.igbb, r = b.r, size = b.char.punch.size || 14, p = cmPodium;
  var topY = (p ? p.y : b.y) + r * 0.04;
  ctx.save();
  var leftHand = { x: b.x - r * 0.62, y: topY };
  strokeLimb(size * 0.68, armColor(b.char, -1), function () { ctx.moveTo(b.x - r * 0.6, b.y - r * 0.1); ctx.lineTo(leftHand.x, leftHand.y); });
  drawGloveAt(leftHand.x, leftHand.y, size * 0.85, b.char, Math.PI / 2);
  var right;
  if (g.angered && g.t >= 0.45) {
    var ang = Math.atan2(other.y - b.y, other.x - b.x), k = Math.min(1, g.throwT / 0.12);
    var reach = g.throwT < 0.25 ? r * (0.6 + 0.8 * k) : r * 0.55;
    var cock = g.throwT < 0.25 ? 0 : 1;
    right = { x: b.x + Math.cos(ang) * reach + r * 0.45 * cock, y: b.y + Math.sin(ang) * reach - r * 0.55 * cock };
    if (g.thrown < b.char.special.bottles && cock) drawBottleInHand(right.x, right.y - size * 0.4, r);
  } else {
    right = { x: b.x + r * 0.62, y: topY };
  }
  strokeLimb(size * 0.68, armColor(b.char, 1), function () { ctx.moveTo(b.x + r * 0.6, b.y - r * 0.1); ctx.lineTo(right.x, right.y); });
  drawGloveAt(right.x, right.y, size * 0.85, b.char, Math.PI / 2);
  ctx.restore();
}
function drawBottleInHand(x, y, r) {
  var im = getImg(cmBottleImg());
  if (!im) return;
  var h = r * 0.62, w = h * 20 / 48;
  ctx.save(); ctx.imageSmoothingEnabled = false;
  ctx.translate(x, y); ctx.rotate(-0.4);
  ctx.drawImage(im, -w / 2, -h / 2, w, h);
  ctx.restore();
}

// Dustin's calf kick: his leg swinging out low into Conor's lead calf.
function drawCalfKick(b) {
  var k = b.cmCalf, o = balls[1 - b.id];
  var ext = k.t < 0.15 ? easeOut(k.t / 0.15) : Math.max(0, 1 - (k.t - 0.15) / (k.dur - 0.15));
  var dx = o.x - b.x, dy = o.y - b.y, d = Math.sqrt(dx * dx + dy * dy) || 1, ux = dx / d, uy = dy / d;
  var hip = { x: b.x + ux * b.r * 0.35, y: b.y + b.r * 0.55 };
  var calf = { x: o.x - ux * o.r * 0.75, y: o.y + o.r * 0.62 };
  var foot = { x: hip.x + (calf.x - hip.x) * ext, y: hip.y + (calf.y - hip.y) * ext };
  var knee = { x: (hip.x + foot.x) / 2 - uy * b.r * 0.25 * k.side, y: (hip.y + foot.y) / 2 + b.r * 0.2 };
  ctx.save();
  drawBjjLeg(b.char, hip, knee, foot, b.r * 0.13, 0.5 * k.side, b.r * 0.2);
  if (k.hit && k.t < 0.28) {
    ctx.globalAlpha = 1 - (k.t - 0.15) / 0.13;
    ctx.strokeStyle = "#ffe066"; ctx.lineWidth = 3;
    for (var i = 0; i < 6; i++) {
      var a = i / 6 * Math.PI * 2;
      ctx.beginPath(); ctx.moveTo(calf.x + Math.cos(a) * 6, calf.y + Math.sin(a) * 6); ctx.lineTo(calf.x + Math.cos(a) * 16, calf.y + Math.sin(a) * 16); ctx.stroke();
    }
  }
  ctx.restore();
}

// "13 SECONDS": takes over the jumbotron (from drawJumbotron, stadium.js),
// or a banner over the test arena (drawConorBanner). The clock counts up to
// the time, then holds and flashes.
function drawConorJumbo(x, y, w, h) {
  var s = cm13;
  if (!s || s.t > s.show || !balls || !balls[s.id]) return;
  var a = Math.max(0, Math.min(1, s.t / 0.15, (s.show - s.t) / 0.35));
  var n = Math.min(s.secs, Math.max(1, Math.ceil(s.secs * Math.min(1, s.t / 0.6))));
  var flash = s.t > 0.6 && Math.sin(s.t * 16) > 0;
  ctx.save();
  ctx.globalAlpha = a;
  ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
  var bg = ctx.createLinearGradient(0, y, 0, y + h);
  bg.addColorStop(0, "#0d4a2c"); bg.addColorStop(1, "#03140b");
  ctx.fillStyle = bg; ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = flash ? "#ffffff" : "#ff8c1a"; ctx.lineWidth = Math.max(3, h * 0.025); ctx.strokeRect(x + 4, y + 4, w - 8, h - 8);
  // the tricolour down both sides
  [["#169b62", 0], ["#ffffff", 1], ["#ff883e", 2]].forEach(function (c) {
    ctx.fillStyle = c[0]; ctx.globalAlpha = a * 0.55;
    ctx.fillRect(x + 10 + c[1] * h * 0.05, y + 10, h * 0.05, h - 20);
    ctx.fillRect(x + w - 10 - (3 - c[1]) * h * 0.05, y + 10, h * 0.05, h - 20);
  });
  ctx.globalAlpha = a;
  var inner = w - h * 0.4 - 30;
  jtText("KNOCKOUT", x + w / 2, y + h * 0.16, h * 0.13, "#c9f7d8", "center", "#000000", inner);
  jtText(n + (n === 1 ? " SECOND" : " SECONDS"), x + w / 2, y + h * 0.52, h * 0.46, flash ? "#ffffff" : "#ffd23f", "center", "#169b62", inner);
  jtText(String(balls[s.id].char.name || "").toUpperCase(), x + w / 2, y + h * 0.85, h * 0.12, "#ffffff", "center", "#000000", inner);
  ctx.restore();
}
function drawConorBanner() {
  if (!cm13 || stadiumOn()) return;
  // At whichever end of the ring the fighters aren't, so they (and his
  // speech bubble) don't cover it.
  var low = (balls[0].y + balls[1].y) / 2 < H / 2;
  drawConorJumbo(10, low ? H - 120 : 10, W - 20, 110);
}

// ---------------------------------------------------------------- sound
// Synth stand-ins until Joe records the real ones.

function cmAudio(fn) {
  try {
    var ac = getAudioCtx();
    if (!ac) return;
    if (ac.state === "suspended") ac.resume();
    fn(ac, ac.currentTime);
  } catch (e) { /* never let audio break the game */ }
}
// The crowd going "ooooh" at a line.
function playTauntOoh() {
  cmAudio(function (ac, t) {
    var s = ac.createBufferSource(); s.buffer = caneNoise(ac); s.loop = true;
    var f = ac.createBiquadFilter(); f.type = "bandpass"; f.Q.value = 3.2;
    f.frequency.setValueAtTime(360, t); f.frequency.linearRampToValueAtTime(560, t + 0.35); f.frequency.linearRampToValueAtTime(420, t + 0.95);
    var g = ac.createGain();
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.32, t + 0.2); g.gain.exponentialRampToValueAtTime(0.0001, t + 1.0);
    s.connect(f); f.connect(g); g.connect(strikeOut(ac));
    s.start(t); s.stop(t + 1.05);
  });
}
// Planting his feet for the counter.
function playCounterPlant() {
  cmAudio(function (ac, t) { caneBurst(ac, t, 320, 0.8, 0.35, 0.08); caneTone(ac, t, "sine", 95, 60, 0.3, 0.12); });
}
// The left hand landing: a sharp crack on top of a heavy punch.
function playCounterCrack(dmg) {
  playPunch((dmg || 30) * 1.6);
  cmAudio(function (ac, t) {
    caneBurst(ac, t, 5200, 1.4, 0.55, 0.03);
    caneBurst(ac, t, 1800, 1.0, 0.45, 0.06);
    caneTone(ac, t, "sine", 170, 52, 0.75, 0.24);
  });
}
// Running out of gas: a long wheeze down.
function playGassed() {
  cmAudio(function (ac, t) {
    caneTone(ac, t, "triangle", 520, 130, 0.16, 0.7);
    caneBurst(ac, t + 0.05, 900, 0.6, 0.2, 0.4);
  });
}
// The mic squealing as he grabs it, and a thump.
function playMicFeedback() {
  cmAudio(function (ac, t) {
    var o = ac.createOscillator(); o.type = "sine";
    o.frequency.setValueAtTime(2400, t); o.frequency.exponentialRampToValueAtTime(3300, t + 0.5);
    var lfo = ac.createOscillator(), lg = ac.createGain(); lfo.frequency.value = 7; lg.gain.value = 45;
    lfo.connect(lg); lg.connect(o.frequency);
    var g = ac.createGain();
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.1, t + 0.25); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.75);
    o.connect(g); g.connect(ac.destination);
    o.start(t); lfo.start(t); o.stop(t + 0.8); lfo.stop(t + 0.8);
    caneBurst(ac, t, 180, 1, 0.4, 0.1);
  });
}
// A bottle flung: a whoosh and the plastic pok of it leaving his hand.
function playBottleThrow() {
  playWhoosh();
  cmAudio(function (ac, t) { canePok(ac, t + 0.02, 1.1, 0.3); });
}
// 13 SECONDS: the arena horn, twice.
function play13Seconds() {
  cmAudio(function (ac, t) {
    [0, 0.42].forEach(function (d) {
      [233, 294, 349].forEach(function (f) {
        var o = ac.createOscillator(); o.type = "sawtooth"; o.frequency.value = f;
        var lp = ac.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 1400;
        var g = ac.createGain();
        g.gain.setValueAtTime(0.0001, t + d); g.gain.exponentialRampToValueAtTime(0.08, t + d + 0.03);
        g.gain.setValueAtTime(0.08, t + d + 0.3); g.gain.exponentialRampToValueAtTime(0.0001, t + d + 0.38);
        o.connect(lp); lp.connect(g); g.connect(strikeOut(ac));
        o.start(t + d); o.stop(t + d + 0.4);
      });
    });
  });
}

getImg(cmBottleImg()); // loaded before the first one's thrown
