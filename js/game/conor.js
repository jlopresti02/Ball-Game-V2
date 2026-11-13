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
// Gas tank    (notorious.gasTank) the bar under his health, and it goes
//             FAST (v2, Christian 2026-11-13). For the first `fresh` seconds
//             he's the fastest, hardest-hitting fighter in the game (speed,
//             damage and attack rate at their first value) while the bar
//             drains to `floor`; over the next `fade` seconds it runs dry and
//             they drop to the second value, and he taps to submissions more
//             (tapExtra: armbar.js and rnc.js call conorTapChance). "GASSED!"
//             and sweat when it's nearly empty. It runs on its own clock
//             (m.gt): kicks burn it (`cost`), a swig of root beer winds it back.
// Kicks       (notorious.kicks, v2) while he's fresh he kicks as well as
//             throwing the left: from `range` out he plants and throws a front
//             kick to the body (`front`: a push that spaces them out) or, now
//             and then (`spin.chance`%), a spinning kick to the body (`spin`:
//             he whips round for `spinTime` first, the tell). A kick that lands
//             SETS THEM UP (`setup`): for `time` seconds, coming back in at him
//             sets off the counter left even if they aren't angry, with
//             `koBonus`% more knockout chance. The kicks come less often as the
//             tank drains (`tire`) and stop altogether below `until` power.
// Drink       (notorious.drink, v2) once the tank's under `below`, up to `max`
//             times a fight (`every` seconds apart, and only with `gap` room
//             between them), he stops and swigs from a bottle of Proper No. 12
//             Irish root beer: glug, glug, for `time` seconds, stood still with
//             his hands full. The tell is the bottle coming up, and the
//             opponent heads straight for him (`theyCome`). Get through it and
//             the tank winds back `refill` seconds ("SECOND WIND!"). Get hit
//             during it and he spills it (no refill) and takes `vuln` times the
//             damage. His first swig of the fight runs the Proper No. 12 ad on
//             the jumbotron (proper12-ad.js; `ad` false switches it off).
// 13 SECONDS  a knockout inside `thirteen.within` seconds puts the time up on
//             the jumbotron (a banner over the test arena), like his
//             13-second knockout of José Aldo at UFC 194.
// Bus Crew    his special (special.move "buscrew", v2). His UFC 223 bus
//             attack: he calls it in (`call` seconds) while a red lane flashes
//             along the wall furthest from them and a horn honks, then a coach
//             pulls up in that lane (anyone still in it gets bumped out,
//             `laneBump`). `crew` lads pile out, green hats, orange beards and
//             shamrocks, and run them down at `crewSpeed` for up to `chase`
//             seconds each: keep moving and they can be outrun. Catch them and
//             it's a cartoon brawl cloud (`brawlTime`, `hitDamage` every
//             `hitGap` from each lad in it; more piling on add `pileOn`). Then
//             a dolly comes flying out of the bus door to Conor: he lifts it
//             over his head while a red line shows where it's going (it follows
//             them, then locks), waits for them to come out of any brawl
//             (`holdMax`), and throws it: `dollyDamage` and a knockback if it
//             hits, and it can be slipped or blocked like anything thrown.
//             The lads pile back on and the bus drives off. vs Khabib (it was
//             his bus): `rivals.khabib.busCrew` extra lads, the sign says
//             BROOKLYN, and his answer is Send Me Location, `answerBus`
//             seconds after the bus leaves (send-location.js).
// Press Conference  (notorious.pressConference, v2: no longer the special)
//             `chance`% of fights, once, at `at` seconds, when there's room. A
//             podium rises out of the mat, the mic squeals, he says a
//             press-conference line and they get FURIOUS (`anger` seconds), he
//             throws `bottles` water bottles at them as they come (the UFC 202
//             presser), then steps out into the counter left with `koBonus`%
//             more knockout chance, waiting up to `wait` seconds for them.
//             `on` false switches it off. (It still works as a special for a
//             created fighter: special.move "presser" in the editor.)
// Rivals      (notorious.rivals) vs Khabib: Khabib's grabs come round
//             `grappleBoost` times as fast, `rncChance`% of his takedowns go
//             to the back for a choke and `gnpChance`% into ground and pound
//             (grapple-duel.js calls tryKhabibOnConor), his Send Me Location
//             comes early (`sendLocFirst`), and he says "Let's talk now."
//             whenever he's pounding on him. vs Dustin: Dustin throws calf
//             kicks at him (and nobody else): `damage` and a limp
//             (slowdown.js). Calf kicks (Dustin's, and Alex Pereira's) do
//             `calfKicksHurt` times the damage to him.
// The taunt, the counter, the kicks and the drink run on b.cm and don't make
// him untouchable; the press conference (move "presser") and his part of
// the Bus Crew (move "buscrew") run on b.igbb like other specials. The bus,
// the lads and the dolly are their own things in the ring (cmBus, cmDolly)
// and keep going after his part is done; someone caught by the lads is held
// with dazed "held" like the other specials' pins (abilities.js skips them).
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
// The commentator's real call (announce, speech.js) when he lands the move
// one of his famous finishes was made of. Word for word from the broadcast
// captions (sources in the README). `who` is the commentator.
var CM_CALLS = {
  // UFC 194, the 13-second counter left on José Aldo: his counter left knockout.
  aldo: { who: "ROGAN", text: "Oh my God! Unbelievable! The first punch he threw. Slept him." },
  // UFC 178, the left hand on Dustin Poirier: his counter left knocking out Dustin.
  poirier: { who: "GOLDBERG", text: "Wow. That's the real deal, ladies and gentlemen. Make no mistake about it, Conor McGregor is for real." },
  // UFC 205, the combination on Eddie Alvarez: a fight he finishes with punches.
  alvarez: { who: "GOLDBERG", text: "And it's all over! History has been made! Conor McGregor is the UFC lightweight champion!" },
  // UFC 246, Cerrone in 40 seconds (the head kick): a fight he finishes with a kick inside a minute.
  cerrone: { who: "ANIK", text: "Less than a minute in, Conor McGregor announces his return with about as many style points as you could produce." }
};
var CM_KHABIB = "c-khabib-nurmagomedov", CM_DUSTIN = "c-dustin-poirier";
var CM_KO_BEAT = 0.45;   // watching them drop before the strut
var CM_KO_TIME = 2.3;    // then strutting round them before the result
var CM_STRUT_RATE = 3.1; // strut steps a second
var CM_HIT_AT = 0.05;    // the counter left: out and landing this fast
var CM_RISE = 0.45, CM_SINK = 0.4, CM_BOTTLE_GAP = 0.22; // the press conference
var CM_DRINK_UP = 0.28, CM_DRINK_DOWN = 0.16; // the bottle coming up to his mouth, and back down
var CM_BUS_L = 300, CM_BUS_H = 84;  // the coach, in arena units
var CM_BUS_ARRIVE = 0.85, CM_BUS_LEAVE = 1.1, CM_DOOR = 0.22, CM_CREW_GAP = 0.2, CM_CREW_R = 17;
var CM_DOLLY_R = 20, CM_TOSS = 0.4;  // the dolly, and its flight from the bus door to his hands
var cm13 = null;         // the "13 SECONDS" show: { t, secs, id, show }
var cmPodium = null;     // the press conference podium: { id, x, y, t, sink }
var cmBus = null;        // the Bus Crew: the coach and the lads (see startBusCrew)
var cmDolly = null;      // the dolly: { phase "toss" | "held" | "fly" | "drop", ... }
var cmCrewHit = false;   // set while a lad's punch goes through hurt() (conorDamageMult leaves it alone)
var cmClock = 0;         // drawing clock (game time, never Math.random)
var cmBottleSrc = null, cmRootBeerSrc = null, cmDollySrc = null;

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
function busOn(b) { return !!(b && b.igbb && b.igbb.move === "buscrew"); }
// Strutting, planted for the counter or a kick, drinking, or celebrating:
// the speed regulator leaves him alone (physics.js). Someone the lads have
// got hold of is left alone too.
function conorBusy(b) { var m = b && b.cm; return !!((m && (m.taunt || m.counter || m.kick || m.drink)) || (b && b.cmBrawl)); }
function cmStrutting(b) {
  var m = b && b.cm;
  return !!(m && (m.taunt || (m.counter && m.counter.phase === "ko" && m.counter.t > CM_KO_BEAT)));
}
// Both hands are drawn by drawConor (drawHands skips them, draw-attacks.js).
function conorHandsBusy(b) {
  var m = b && b.cm;
  if (presserOn(b) || busOn(b)) return true;
  if (!m) return false;
  if (cmStrutting(b) || m.drink) return true;
  return !!(m.counter && (m.counter.phase === "plant" || m.counter.phase === "open"));
}
// Held by something else: grabbed, slammed, choked, knocked out...
function cmHeld(b) {
  return !b.alive || b.grappled || b.grapple || b.slam || b.sprawl || b.sprawled || subLocked(b) || b.koOut || b.koRush ||
    b.shocked || b.dazed || b.dizzy || b.shelled || b.checkStun > 0 || b.koDuel || (b.igbb && !presserOn(b));
}
function cmKnockable(o) { return o.alive && !o.grappled && !o.grapple && !o.slam && !subLocked(o) && !o.igbb && !o.koOut; }

// From startMatchSeeded.
function resetConor() { cm13 = null; cmPodium = null; cmBus = null; cmDolly = null; cmCrewHit = false; cmClock = 0; }
// From makeBall (after applyWeight, so his normal speed and attack rate are set).
function initConor(b) {
  b.cmCalf = null; b.cmCalfT = null; b.cmTalkFor = null; b.cmSetup = null; b.cmBrawl = null; b.cmBumped = false; b.cmLastHit = null;
  b.cm = null;
  var cfg = cmCfg(b);
  if (!cfg) return;
  var pc = cfg.pressConference;
  b.cm = {
    t: 0, gt: 0, gas: 1, power: 1, dmg: 1, baseSpeed: b.baseSpeed, atkRate: b.atkRate,
    talkT: cfg.trashTalk ? cmRand(cfg.trashTalk.first) : Infinity, opened: false,
    taunt: null, counter: null, counterCd: 0, gassed: false, won: false, winLine: false, koSeen: false, koCounter: false,
    rivals: false, sweatT: 0, strutPh: 0, seen: { hp: b.hp, flash: 0, dodged: false },
    kick: null, kickCd: cfg.kicks ? cmRand(cfg.kicks.every) * 0.5 : Infinity,
    drink: null, drinkCd: 0, swigs: 0, sipFx: 0,
    presserT: pc && pc.on && Math.random() * 100 < (pc.chance != null ? pc.chance : 100) ? cmRand(pc.at) : Infinity,
    called: {}
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
  tickBus(dt);
  tickDolly(dt);
  balls.forEach(function (b) {
    if (b.cmSetup) { b.cmSetup.t -= dt; if (b.cmSetup.t <= 0 || !b.alive) b.cmSetup = null; }
    var m = b.cm, cfg = cmCfg(b), other = balls[1 - b.id];
    if (!m) return;
    if (started && !over && b.alive) { m.t += dt; m.gt += dt; }
    if (started && !m.rivals) { m.rivals = true; cmSetupRivals(b, other); }
    if (cmHeld(b) && !(m.counter && m.counter.phase === "ko")) {
      if (m.taunt) endTaunt(b);
      if (m.counter) endCounter(b, m, false);
      if (m.kick) m.kick = null;
      if (m.drink) { m.drink.spilled = true; endDrink(b, m, cfg.drink, false); }
    }
    cmGas(b, m, cfg, dt);
    if (m.counterCd > 0) m.counterCd -= dt;
    if (m.kickCd > 0) m.kickCd -= dt;
    if (m.drinkCd > 0) m.drinkCd -= dt;
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
  if (m.gt < gt.fresh) { m.gas = 1 - (1 - gt.floor) * m.gt / gt.fresh; m.power = 1; }
  else { m.power = Math.max(0, 1 - (m.gt - gt.fresh) / gt.fade); m.gas = gt.floor * m.power; }
  m.dmg = cmLerp(gt.damage, m.power);
  b.baseSpeed = m.baseSpeed * cmLerp(gt.speed, m.power);
  b.atkRate = m.atkRate * cmLerp(gt.attack, m.power);
  if (m.sipFx > 0) m.sipFx = Math.max(0, m.sipFx - dt);
  if (!b.alive || over || !started) return;
  if (m.gassed && m.power > gt.gassedAt + 0.15) m.gassed = false; // a swig brought him back: it can run dry again
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
  if (cmCrewHit) { b.cmLastHit = "crew"; return 1; } // the lads are fresh whatever his tank says
  var m = b.cm, cfg = cmCfg(b), atk = attackerId != null ? balls[attackerId] : null;
  // Caught with the bottle up: he spills it, and it hurts more.
  var spill = m && m.drink && !m.drink.spilled && atk !== b;
  if (spill) m.drink.spilled = true;
  if (atk && atk !== b && atk.cm) b.cmLastHit = source;
  if (source === "kopunch" || source === "kofinal" || source === "laser") return 1;
  var mult = 1;
  if (atk && atk !== b && atk.cm) mult *= atk.cm.dmg;
  if (m && cfg) {
    if (spill) mult *= cfg.drink.vuln || 1;
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
    if (winBy !== "submission" && !m.koCounter) {
      var last = other.cmLastHit;
      if (last === "counter") cmCall(b, cmIs(other, CM_DUSTIN) && !cmCfg(other) ? "poirier" : "aldo");
      else if (last === "punch") cmCall(b, "alvarez");
      else if (last === "kick" && m.t < 60) cmCall(b, "cerrone");
    }
  }
  // After a counter knockout it waits for "Precision beats power..." to finish.
  if (m.winLine && !speaking(b)) { m.winLine = false; say(b, CM_LINES.win); }
}

// The commentator's call, once a fight, if the calls are on (`calls`).
function cmCall(b, key) {
  var c = CM_CALLS[key], m = b.cm, cfg = cmCfg(b);
  if (!c || !m || m.called.any || (cfg && cfg.calls === false) || typeof announce !== "function") return;
  m.called.any = key;
  announce(c.text, { who: c.who });
}

// ---------------------------------------------------------------- the abilities loop

// From the abilities loop, before the special. True while it's running.
// Also runs for his rivals (Dustin's calf kicks, Khabib's extra grappling).
function updateConor(self, other, dt) {
  if (!self.cm) return cmRivalUpdate(self, other, dt);
  var m = self.cm, cfg = cmCfg(self);
  if (presserOn(self)) return runPresser(self, other, dt); // (the press conference, as a regular move or a special)
  if (cmHeld(self) && !(m.counter && m.counter.phase === "ko")) return false;
  if (m.counter) return runCounter(self, other, m, cfg, dt);
  if (m.kick) return runKick(self, other, m, cfg, dt);
  if (m.drink) return runDrink(self, other, m, cfg, dt);
  if (!started || over || self.igbb || !other.alive) { if (m.taunt) endTaunt(self); return false; }
  if (counterReady(self, other, m, cfg.counter)) {
    startCounter(self, other, m, false, cfg.counter.maxPlant);
    return runCounter(self, other, m, cfg, dt);
  }
  if (m.taunt) return runTaunt(self, other, m, cfg, dt);
  if (presserDue(self, other, m, cfg.pressConference)) { m.presserT = Infinity; startPresser(self, other); return true; }
  if (drinkReady(self, other, m, cfg.drink)) { startDrink(self, other, m, cfg.drink); return true; }
  if (kickReady(self, other, m, cfg.kicks)) { startKick(self, other, m, cfg.kicks); return runKick(self, other, m, cfg, dt); }
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
  if (hollowayShrugs(other, self, furious)) return; // Max Holloway doesn't take the bait: "Keep talking." (holloway.js)
  other.angry = { t: 0, dur: dur, atId: self.id };
  floater(other.x, other.y - other.r - 26, furious ? "FURIOUS!" : "ANGRY", "note");
  playTauntOoh();
  crowdReact(0.3);
}

// ---------------------------------------------------------------- the counter left

// An angry opponent closing in on him.
function counterReady(self, other, m, cc) {
  if (!cc || m.counterCd > 0 || !other.alive || other.koOut || other.invincible || other.igbb) return false;
  var a = other.angry, set = other.cmSetup && other.cmSetup.id === self.id; // (set up by a kick, kicks below)
  if (!((a && a.atId === self.id) || set) || !inOrdinaryMovement(other)) return false;
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
  var gt = cfg.gasTank, pc = cmPresserCfg(self), ks = cfg.kicks && cfg.kicks.setup;
  var koP = (cc.koBase + cc.koLow * (1 - other.hp / MAX_HP)) * (gt ? cmLerp(gt.koMult, m.power) : 1);
  if (c.presser && pc) koP += pc.koBonus || 0;
  if (ks && other.cmSetup && other.cmSetup.id === self.id) koP += ks.koBonus || 0; // set up by a kick
  other.cmSetup = null;
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
  if (dealt > 0) other.cmLastHit = "counter";
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
  cmCall(self, cmIs(other, CM_DUSTIN) && !cmCfg(other) ? "poirier" : "aldo");
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

// Its settings: the special's when it's a created fighter's special, his
// notorious.pressConference when it's his regular move.
function cmPresserCfg(b) {
  var sp = b.char.special;
  if (b.char.hasSpecial && sp && sp.move === "presser") return sp;
  var n = cmCfg(b);
  return (n && n.pressConference) || null;
}
function cmPresserIsSpecial(b) { var sp = b.char.special; return !!(b.char.hasSpecial && sp && sp.move === "presser"); }

// From updateSpecial (special.js) for special.move "presser": starts it when
// the bar's full (updateConor runs it from then on).
function updatePresser(self, other, dt) {
  var sp = self.char.special, m = self.cm;
  if (!m) return false; // (the move without the rest of his kit)
  if (!self.igbb) {
    if (self.specialT < sp.chargeTime || m.counter || m.taunt || m.kick || m.drink || !canStartIgbb(self, other) || swordDuelActive()) return false;
    if (cmDist(self, other) < self.r + other.r + (sp.room || 0)) return false; // waits for some room, so they have to come at him
    startPresser(self, other);
  }
  return runPresser(self, other, dt);
}
// His regular move: once, at `at` seconds, when there's room.
function presserDue(self, other, m, pc) {
  if (!pc || !pc.on || cmPresserIsSpecial(self) || m.t < m.presserT) return false;
  if (m.counter || m.taunt || m.kick || m.drink || !canStartIgbb(self, other) || swordDuelActive() || cmBus) return false;
  return cmDist(self, other) >= self.r + other.r + (pc.room || 0);
}
function startPresser(self, other) {
  clearActions(self);
  self.igbb = { move: "presser", phase: "rise", t: 0, thrown: 0, next: 0, throwT: 9, angered: false };
  self.vx = 0; self.vy = 0;
  cmPodium = { id: self.id, x: self.x, y: self.y, t: 0, sink: null };
  floater(self.x, self.y - self.r - 30, "PRESS CONFERENCE!", "crit");
  playMicFeedback();
  crowdReact(0.7);
}
function runPresser(self, other, dt) {
  var sp = cmPresserCfg(self), g = self.igbb;
  if (!g || g.move !== "presser" || !sp) return false;
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
  self.igbb = null;
  if (cmPresserIsSpecial(self)) self.specialT = 0;
  var m = self.cm, pc = cmPresserCfg(self);
  if (toCounter && m && cmCfg(self).counter && self.alive && !over) { startCounter(self, balls[1 - self.id], m, true, pc ? pc.wait : 2); return; }
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

// ---------------------------------------------------------------- kicks

// Fresh, and they're coming into kicking range: a front kick to the body,
// or now and then a spinning one.
function kickReady(self, other, m, kc) {
  if (!kc || m.kickCd > 0 || m.power < kc.until || !other.alive || other.koOut || other.igbb || other.invincible) return false;
  if (self.punch || self.kick || self.koPunch || specialBusy(self) || specialBusy(other) || !inOrdinaryMovement(self) || swordDuelActive()) return false;
  var gap = cmDist(self, other) - self.r - other.r;
  return gap <= kc.range && gap > 4;
}
function startKick(self, other, m, kc) {
  var kind = kc.spin && Math.random() * 100 < (kc.spin.chance || 0) ? "spin" : "front", spec = kc[kind] || kc.front;
  self.punch = null; self.jabAnim = null;
  m.kick = { kind: kind, t: 0, hit: false, landed: false, ang: Math.atan2(other.y - self.y, other.x - self.x), side: Math.random() < 0.5 ? -1 : 1 };
  m.gt += spec.cost || 0; // kicking burns gas
  m.kickCd = cmRand(kc.every) * (1 + (1 - m.power) * (kc.tire || 0)); // and they come less often as he tires
  self.vx = 0; self.vy = 0;
  if (kind === "spin") playSpinWhoosh();
}
function runKick(self, other, m, cfg, dt) {
  var k = m.kick, kc = cfg.kicks, spec = kc[k.kind] || kc.front;
  k.t += dt;
  self.vx = 0; self.vy = 0;
  if (over || !other.alive) { m.kick = null; return false; }
  if (k.t < spec.hitAt - 0.05) k.ang = Math.atan2(other.y - self.y, other.x - self.x); // follows them until the leg goes out
  if (!k.hit && k.t >= spec.hitAt) { k.hit = true; landKick(self, other, m, kc, spec, k); }
  if (k.t >= spec.dur) {
    m.kick = null;
    if (self.alive && inOrdinaryMovement(self)) setSpeed(self, self.baseSpeed || SPEED);
    return false;
  }
  return true;
}
// The kick arriving: a push back out to range, and it sets them up for the left.
function landKick(self, other, m, kc, spec, k) {
  var dx = other.x - self.x, dy = other.y - self.y, d = Math.sqrt(dx * dx + dy * dy) || 1;
  playWhoosh();
  if (!other.alive || other.koOut || other.igbb || d - self.r - other.r > kc.range + 14) return; // they were gone
  var dealt = hurt(other, spec.damage, "kick", self.id);
  if (dealt > 0) {
    k.landed = true;
    playKick();
    if (!other.justDodged && cmKnockable(other)) { other.vx += dx / d * spec.knockback; other.vy += dy / d * spec.knockback; }
    if (kc.setup) other.cmSetup = { id: self.id, t: kc.setup.time };
    if (k.kind === "spin") {
      floater(other.x, other.y - other.r - 30, "SPINNING KICK!", "crit");
      playPunch(dealt * 1.5);
      crowdReact(0.45);
      if (!reduceMotion) shake = Math.max(shake, 10);
    } else if (!reduceMotion) shake = Math.max(shake, 6);
  }
  checkEnd();
}

// ---------------------------------------------------------------- the drink

// Running low, with some room: time for a swig.
function drinkReady(self, other, m, dk) {
  if (!dk || m.swigs >= dk.max || m.drinkCd > 0 || m.gas >= dk.below || m.t < (dk.first || 0)) return false;
  if (!other.alive || other.koOut || other.igbb || specialBusy(self) || specialBusy(other) || cmBus) return false;
  if (self.punch || self.kick || self.koPunch || !inOrdinaryMovement(self) || swordDuelActive()) return false;
  return cmDist(self, other) - self.r - other.r > (dk.gap || 0);
}
function startDrink(self, other, m, dk) {
  self.punch = null; self.jabAnim = null;
  m.drink = { t: 0, spilled: false, glugT: CM_DRINK_UP };
  self.vx = 0; self.vy = 0;
  floater(self.x, self.y - self.r - 30, "SWIG!", "note");
  playBottleOpen();
  // The tell: the bottle comes up, they see a free shot and come for him.
  if (dk.theyCome && inOrdinaryMovement(other) && !(other.angry && other.angry.atId === self.id)) {
    var dx = self.x - other.x, dy = self.y - other.y, d = Math.sqrt(dx * dx + dy * dy) || 1;
    var sp = Math.max(other.baseSpeed || SPEED, Math.sqrt(other.vx * other.vx + other.vy * other.vy));
    other.vx = dx / d * sp; other.vy = dy / d * sp;
  }
}
function runDrink(self, other, m, cfg, dt) {
  var dk = cfg.drink, k = m.drink;
  k.t += dt;
  self.vx = 0; self.vy = 0;
  if (k.spilled || over) { endDrink(self, m, dk, false); return false; }
  if (k.t > CM_DRINK_UP && k.t < dk.time - CM_DRINK_DOWN) {
    k.glugT -= dt;
    if (k.glugT <= 0) {
      k.glugT = 0.3;
      playGlug();
      if (!reduceMotion) {
        var mx = cmMouth(self);
        for (var i = 0; i < 3; i++) particles.push({ x: mx.x + (Math.random() - 0.5) * 6, y: mx.y - 4, vx: (Math.random() - 0.5) * 30, vy: -40 - Math.random() * 40, life: 0.4, max: 0.4, size: 1.6 + Math.random() * 1.4, color: "#f3e3c3" });
      }
    }
  }
  if (k.t >= dk.time) { endDrink(self, m, dk, true); return false; }
  return true;
}
function endDrink(self, m, dk, drank) {
  if (!m.drink) return;
  m.drink = null;
  m.swigs++;
  m.drinkCd = cmRand(dk.every);
  if (drank) {
    m.gt = Math.max(0, m.gt - (dk.refill || 0)); // the tank winds back
    m.sipFx = 0.9;
    floater(self.x, self.y - self.r - 30, "SECOND WIND!", "heal");
    playSecondWind();
    if (typeof proper12OnSwig === "function") proper12OnSwig(self); // the Proper No. 12 ad, his first swig (proper12-ad.js)
  } else {
    floater(self.x, self.y - self.r - 30, "SPILLED!", "note");
    playSpill();
    if (!reduceMotion) {
      var mx = cmMouth(self);
      for (var i = 0; i < 12; i++) {
        var a = Math.random() * Math.PI * 2, s = 60 + Math.random() * 140;
        particles.push({ x: mx.x, y: mx.y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 40, life: 0.45, max: 0.45, size: 2 + Math.random() * 2.5, color: i % 3 ? "#5a2e12" : "#f3e3c3" });
      }
    }
  }
  if (self.alive && inOrdinaryMovement(self)) setSpeed(self, self.baseSpeed || SPEED);
}
// Where the bottle meets him: top of the ball, on the side he's facing.
function cmMouth(b) {
  var o = balls[1 - b.id], s = o && o.x < b.x ? -1 : 1;
  return { x: b.x + s * b.r * 0.22, y: b.y - b.r * 0.42, s: s };
}

// ---------------------------------------------------------------- Bus Crew

// (registered as SPECIAL_MOVES.buscrew in special.js: this file loads before it)
var CM_LAD_BEARDS = ["#e0702a", "#c9561c", "#f08a3a", "#d4622a", "#b8481a"];
var CM_LAD_COATS = ["#1f8a45", "#177a3b", "#23964c", "#126b33", "#1c8240"];
var CM_POW = ["POW!", "WHACK!", "BIFF!", "THUMP!", "BAM!"];
var CM_BUS_LINE = "We're not here to take part. We're here to take over."; // Dublin, 2014 (CM_LINES.opener)

// The coach's lane: along the top (-1) or bottom (1) wall.
function busLaneY(lane) { return lane > 0 ? H - CM_BUS_H / 2 - 2 : CM_BUS_H / 2 + 2; }
function busRect(bus) { return { x0: bus.x - CM_BUS_L / 2, x1: bus.x + CM_BUS_L / 2, y0: bus.y - CM_BUS_H / 2, y1: bus.y + CM_BUS_H / 2 }; }
// The door: up front, just behind the nose.
function busDoor(bus) { return { x: bus.x + bus.dir * (CM_BUS_L / 2 - 35), y: bus.y }; }
function busParkX() { return W / 2; }
function busOffX(bus, ahead) { return W / 2 + (ahead ? 1 : -1) * bus.dir * (W / 2 + CM_BUS_L / 2 + 30); }

// From updateSpecial (special.js) for special.move "buscrew": his part.
// He calls it in, waits for the lads to pile out, catches the dolly and
// throws it. The bus and the lads carry on after (tickBus).
function updateBusCrew(self, other, dt) {
  var sp = self.char.special, m = self.cm;
  if (!self.igbb) {
    if (self.specialT < sp.chargeTime || cmBus || cmDolly || !canStartIgbb(self, other) || swordDuelActive()) return false;
    if (m && (m.counter || m.taunt || m.kick || m.drink)) return false;
    startBusCrew(self, other, sp);
  }
  var g = self.igbb;
  if (!g || g.move !== "buscrew") return false;
  g.t += dt;
  self.vx = 0; self.vy = 0;
  if (over || !other.alive || !cmBus) { endBusIgbb(self); return false; }
  if (g.phase === "call") {
    if (cmBus.phase !== "warn") { g.phase = "lads"; g.t = 0; }
    return true;
  }
  if (g.phase === "lads") {
    if (cmBus.phase === "parked" && cmBus.out >= cmBus.crew.length) {
      // The dolly comes flying out of the door to him.
      var door = busDoor(cmBus);
      cmDolly = { phase: "toss", t: 0, ownerId: self.id, x: door.x, y: door.y, fx: door.x, fy: door.y, ang: 0, spin: 0, dir: self.x > door.x ? 1 : -1 };
      g.phase = "catch"; g.t = 0;
      playWhoosh();
    } else if (g.t > 5) { endBusIgbb(self); return false; } // (never stuck waiting)
    return true;
  }
  if (g.phase === "catch") {
    if (!cmDolly || cmDolly.ownerId !== self.id) { endBusIgbb(self); return false; }
    if (cmDolly.phase === "held") { g.phase = "lift"; g.t = 0; g.wait = 0; g.aim = Math.atan2(other.y - self.y, other.x - self.x); playDollyCatch(); }
    return true;
  }
  // Lift: over his head, a red line following them, locking for the last
  // moment, then he lets it go. He waits for them to come out of a brawl.
  if (other.cmBrawl && g.wait < (sp.holdMax || 0)) { g.wait += dt; g.t = Math.min(g.t, sp.windup - 0.3); }
  if (g.t < sp.windup - 0.28) {
    var tx = other.x + other.vx * 0.15, ty = other.y + other.vy * 0.15;
    g.aim = Math.atan2(ty - self.y, tx - self.x);
  }
  if (g.t >= sp.windup) { throwDolly(self, g, sp); endBusIgbb(self); return false; }
  return true;
}

function startBusCrew(self, other, sp) {
  clearActions(self);
  self.igbb = { move: "buscrew", phase: "call", t: 0 };
  self.specialT = 0;
  self.vx = 0; self.vy = 0;
  var rv = cmRival(self, other), n = Math.max(1, Math.round((sp.crew || 4) + ((rv && rv.busCrew) || 0)));
  // Along the wall furthest from them, so the lads have to run them down.
  var lane = Math.abs(other.y - busLaneY(1)) >= Math.abs(other.y - busLaneY(-1)) ? 1 : -1;
  var crew = [];
  for (var i = 0; i < n; i++) {
    crew.push({ i: i, st: "in", t: 0, x: 0, y: 0, ph: Math.random() * 6, face: 1, hat: 0.9 + Math.random() * 0.35,
      beard: CM_LAD_BEARDS[i % CM_LAD_BEARDS.length], coat: CM_LAD_COATS[(i * 3) % CM_LAD_COATS.length], dizzy: 0, puff: 0, hitT: 0 });
  }
  cmBus = { id: self.id, oppId: other.id, lane: lane, dir: Math.random() < 0.5 ? 1 : -1, phase: "warn", t: 0, warn: sp.call || 0.9,
    x: 0, y: busLaneY(lane), crew: crew, out: 0, door: 0, scene: 0, wheel: 0, brooklyn: !!(rv && cmIs(other, CM_KHABIB)) };
  cmBus.x = busOffX(cmBus, false);
  floater(self.x, self.y - self.r - 30, "THE BUS!", "crit");
  playBusHorn(1);
  crowdReact(0.8);
}
function throwDolly(self, g, sp) {
  var d = cmDolly;
  if (!d || d.ownerId !== self.id) return;
  d.phase = "fly"; d.t = 0;
  d.x = self.x + Math.cos(g.aim) * (self.r + 8); d.y = self.y + Math.sin(g.aim) * (self.r + 8) - self.r * 0.4;
  d.vx = Math.cos(g.aim) * sp.dollySpeed; d.vy = Math.sin(g.aim) * sp.dollySpeed;
  d.spin = (Math.cos(g.aim) >= 0 ? 1 : -1) * 12;
  d.damage = sp.dollyDamage; d.kb = sp.dollyKnockback; d.weaved = false;
  playDollyThrow();
}
function endBusIgbb(self) {
  if (busOn(self)) self.igbb = null;
  if (cmDolly && cmDolly.ownerId === self.id && (cmDolly.phase === "toss" || cmDolly.phase === "held")) { cmDolly.phase = "drop"; cmDolly.t = 0; cmDolly.vx = 0; cmDolly.vy = 60; cmDolly.spin = 3; }
  if (self.alive && inOrdinaryMovement(self)) setSpeed(self, self.baseSpeed || SPEED);
}

// Every frame (tickConor): the bus pulling up, the lads, driving off.
function tickBus(dt) {
  var bus = cmBus;
  if (!bus) return;
  var owner = balls[bus.id], opp = balls[bus.oppId], sp = owner.char.special;
  bus.t += dt;
  var x0 = bus.x;
  if (bus.phase === "warn") {
    if (bus.t >= bus.warn) { bus.phase = "arrive"; bus.t = 0; playBusEngine(CM_BUS_ARRIVE, true); }
  } else if (bus.phase === "arrive") {
    var k = Math.min(1, bus.t / CM_BUS_ARRIVE), e = 1 - Math.pow(1 - k, 3), from = busOffX(bus, false);
    bus.x = from + (busParkX() - from) * e;
    bumpLane(bus, owner, opp, sp);
    if (k >= 1) { bus.phase = "parked"; bus.t = 0; playAirBrake(); }
  } else if (bus.phase === "parked") {
    bus.scene += dt;
    bus.door = Math.min(1, bus.door + dt / CM_DOOR);
    if (bus.door >= 1) {
      var due = Math.floor((bus.t - CM_DOOR) / CM_CREW_GAP) + 1;
      while (bus.out < bus.crew.length && bus.out < due) {
        crewOut(bus, bus.crew[bus.out]);
        bus.out++;
        if (bus.out === 1 && owner.alive) { say(owner, CM_BUS_LINE); playLadsCheer(); }
      }
    }
    tickCrew(bus, owner, opp, sp, dt);
    if (bus.out >= bus.crew.length && bus.crew.every(function (c) { return c.st === "aboard"; }) && !(cmDolly && cmDolly.phase === "toss")) {
      bus.phase = "leave"; bus.t = 0;
      playBusEngine(CM_BUS_LEAVE, false);
    }
  } else if (bus.phase === "leave") {
    bus.door = Math.max(0, bus.door - dt / CM_DOOR);
    var lk = Math.min(1, bus.t / CM_BUS_LEAVE), to = busOffX(bus, true);
    bus.x = busParkX() + (to - busParkX()) * lk * lk;
    if (lk >= 1) { busGone(bus, owner, opp); cmBus = null; return; }
  }
  bus.wheel += (bus.x - x0) / 13; // wheels turning as it rolls
  if (bus.phase !== "warn") busSolid(bus);
}

// Pulling in: anyone in the lane gets bumped out of it (HONK!).
function bumpLane(bus, owner, opp, sp) {
  var r = busRect(bus);
  [owner, opp].forEach(function (b) {
    if (!b.alive || b.cmBumped === bus) return;
    var cx = Math.max(r.x0, Math.min(b.x, r.x1)), cy = Math.max(r.y0, Math.min(b.y, r.y1));
    if ((b.x - cx) * (b.x - cx) + (b.y - cy) * (b.y - cy) >= b.r * b.r) return;
    b.cmBumped = bus;
    b.y = bus.lane > 0 ? Math.min(b.y, r.y0 - b.r) : Math.max(b.y, r.y1 + b.r);
    if (b === opp) {
      floater(b.x, b.y - b.r - 30, "HONK!", "note");
      if (sp.laneBump > 0) { cmCrewHit = true; try { hurt(b, sp.laneBump, "igbb", owner.id); } finally { cmCrewHit = false; } checkEnd(); }
    }
    if (inOrdinaryMovement(b)) { b.vy = -bus.lane * 520; b.vx += bus.dir * 220; }
    playBusHorn(0.4);
  });
}
// Parked or moving, it's solid: fighters bounce off it.
function busSolid(bus) {
  var r = busRect(bus);
  balls.forEach(function (b) {
    if (!b.alive || !inOrdinaryMovement(b)) return;
    var cx = Math.max(r.x0, Math.min(b.x, r.x1)), cy = Math.max(r.y0, Math.min(b.y, r.y1));
    var dx = b.x - cx, dy = b.y - cy, d2 = dx * dx + dy * dy;
    if (d2 >= b.r * b.r) return;
    if (d2 > 0.01) {
      var d = Math.sqrt(d2), nx = dx / d, ny = dy / d;
      b.x = cx + nx * b.r; b.y = cy + ny * b.r;
      var vn = b.vx * nx + b.vy * ny;
      if (vn < 0) { b.vx -= 2 * vn * nx; b.vy -= 2 * vn * ny; }
    } else {
      b.y = bus.lane > 0 ? r.y0 - b.r : r.y1 + b.r;
      b.vy = -bus.lane * Math.max(120, Math.abs(b.vy));
    }
  });
}
// Off down the road: Khabib's answer (it was his bus), and the ad if the
// drink hasn't run it yet.
function busGone(bus, owner, opp) {
  balls.forEach(function (b) { if (b.cmBumped === bus) b.cmBumped = false; });
  var rv = cmRival(owner, opp), slc = opp && opp.char.sendLocation;
  if (rv && rv.answerBus && slc && opp.alive && !over) {
    if (opp.sendLocN >= slc.max) opp.sendLocN = slc.max - 1; // one more call: his answer to the bus
    opp.sendLocT = cmRand(rv.answerBus);
  }
  if (typeof proper12OnSwig === "function" && owner.alive && !over) proper12OnSwig(owner); // (proper12-ad.js)
}

function crewOut(bus, c) {
  c.st = "out"; c.t = 0;
  var door = busDoor(bus);
  c.x = door.x; c.y = door.y;
  c.tx = door.x + (c.i % 2 ? 1 : -1) * (6 + (c.i % 3) * 8); c.ty = bus.y - bus.lane * (CM_BUS_H / 2 + CM_CREW_R + 6);
  c.face = -bus.dir;
}
function crewCanGrab(o) {
  return o.alive && !o.koOut && !o.igbb && !o.invincible && !o.dazed && !o.dizzy && !o.shelled && !o.shocked && !o.cmBrawl &&
    inOrdinaryMovement(o) && !specialBusy(o) && !swordDuelLocked(o);
}
function crewRun(c, tx, ty, speed, dt) {
  var dx = tx - c.x, dy = ty - c.y, d = Math.sqrt(dx * dx + dy * dy) || 1, step = Math.min(d, speed * dt);
  c.x += dx / d * step; c.y += dy / d * step;
  if (Math.abs(dx) > 2) c.face = dx > 0 ? 1 : -1;
  c.x = Math.max(CM_CREW_R, Math.min(W - CM_CREW_R, c.x)); c.y = Math.max(CM_CREW_R, Math.min(H - CM_CREW_R, c.y));
  return d;
}
function tickCrew(bus, owner, opp, sp, dt) {
  var door = busDoor(bus), wrap = bus.scene > (sp.scene || 9) || over || !opp.alive || !owner.alive;
  bus.crew.forEach(function (c) {
    c.ph += dt;
    if (c.dizzy > 0) c.dizzy = Math.max(0, c.dizzy - dt);
    if (c.st === "in" || c.st === "aboard") return;
    c.t += dt;
    if (wrap && (c.st === "chase" || c.st === "out")) { c.st = "back"; c.t = 0; }
    if (c.st === "out") {
      var ek = Math.min(1, dt * 12);
      c.x += (c.tx - c.x) * ek; c.y += (c.ty - c.y) * ek;
      if (c.t >= 0.2) { c.st = "chase"; c.t = 0; }
    } else if (c.st === "chase") {
      crewRun(c, opp.x + opp.vx * 0.12, opp.y + opp.vy * 0.12, sp.crewSpeed, dt);
      var dd = Math.sqrt((opp.x - c.x) * (opp.x - c.x) + (opp.y - c.y) * (opp.y - c.y));
      if (dd < opp.r + CM_CREW_R + 2 && (opp.cmBrawl || crewCanGrab(opp))) joinBrawl(c, opp, sp);
      else if (c.t >= sp.chase) { c.st = "back"; c.t = 0; c.puff = 1; } // out of puff
    } else if (c.st === "brawl") {
      if (!opp.cmBrawl) { c.st = "back"; c.t = 0; c.dizzy = 1; }
      else { var a = c.i * 2.1 + c.ph * 5; c.x = opp.x + Math.cos(a) * opp.r * 0.75; c.y = opp.y + Math.sin(a) * opp.r * 0.6; }
    } else if (c.st === "back") {
      if (crewRun(c, door.x, door.y, sp.crewSpeed * (c.dizzy > 0 || c.puff ? 0.6 : 0.95), dt) < 8 || c.t > 6) c.st = "aboard";
    }
  });
  tickBrawl(bus, owner, opp, sp, dt);
}
function joinBrawl(c, opp, sp) {
  c.st = "brawl"; c.t = 0; c.hitT = sp.hitGap * Math.random();
  if (!opp.cmBrawl) {
    clearActions(opp);
    opp.cmBrawl = { t: 0, dur: sp.brawlTime, n: 1, x: opp.x, y: opp.y, pow: [] };
    opp.dazed = "held"; opp.vx = 0; opp.vy = 0; opp.angry = null;
    floater(opp.x, opp.y - opp.r - 34, "BRAWL!", "crit");
    playBrawlStart();
    crowdReact(0.7);
    if (!reduceMotion) shake = Math.max(shake, 8);
  } else {
    opp.cmBrawl.n++;
    opp.cmBrawl.dur = Math.min(opp.cmBrawl.dur + (sp.pileOn || 0), sp.brawlTime * 2.2);
    floater(opp.x, opp.y - opp.r - 34, "PILE ON!", "note");
  }
}
// The cloud: every lad in it lands a punch every `hitGap` seconds.
function tickBrawl(bus, owner, opp, sp, dt) {
  var br = opp.cmBrawl;
  if (!br) return;
  br.t += dt;
  br.pow = br.pow.filter(function (p) { p.t += dt; return p.t < 0.45; });
  var moved = Math.abs(opp.x - br.x) + Math.abs(opp.y - br.y) > 40; // (taken out of it by something else)
  if (!opp.alive || opp.koOut || over || br.t >= br.dur || opp.dazed !== "held" || moved) { endBrawl(bus, opp); return; }
  opp.vx = 0; opp.vy = 0;
  bus.crew.forEach(function (c) {
    if (c.st !== "brawl" || !opp.cmBrawl) return;
    c.hitT -= dt;
    if (c.hitT > 0) return;
    c.hitT = sp.hitGap * (0.8 + Math.random() * 0.4);
    var dealt;
    cmCrewHit = true;
    try { dealt = hurt(opp, sp.hitDamage, "igbb", owner.id); } finally { cmCrewHit = false; }
    if (dealt > 0) {
      playBrawlHit();
      opp.flash = 0.06;
      br.pow.push({ t: 0, word: CM_POW[(br.pow.length + c.i + Math.floor(br.t * 7)) % CM_POW.length], a: c.i * 2.1 + br.t * 9 });
    }
    checkEnd();
  });
}
function endBrawl(bus, opp) {
  var br = opp.cmBrawl;
  opp.cmBrawl = null;
  if (opp.dazed === "held") opp.dazed = false;
  bus.crew.forEach(function (c) {
    if (c.st !== "brawl") return;
    c.st = "back"; c.t = 0; c.dizzy = 1;
    var a = c.i * 2.1 + 0.6;
    c.x = opp.x + Math.cos(a) * (opp.r + CM_CREW_R); c.y = opp.y + Math.sin(a) * (opp.r + CM_CREW_R);
  });
  if (opp.alive && !opp.koOut && inOrdinaryMovement(opp)) setSpeed(opp, (opp.baseSpeed || SPEED) * 0.7);
  if (br && !reduceMotion) {
    for (var i = 0; i < 14; i++) {
      var pa = i / 14 * Math.PI * 2, s = 90 + Math.random() * 120;
      particles.push({ x: opp.x + Math.cos(pa) * opp.r, y: opp.y + Math.sin(pa) * opp.r, vx: Math.cos(pa) * s, vy: Math.sin(pa) * s, life: 0.4, max: 0.4, size: 4 + Math.random() * 4, color: i % 4 ? "#e9e4d8" : "#1f8a45" });
    }
  }
}

// The dolly: flying out of the door to him, held over his head, thrown.
function tickDolly(dt) {
  var d = cmDolly;
  if (!d) return;
  d.t += dt;
  var owner = balls[d.ownerId], opp = balls[1 - d.ownerId];
  if (d.phase === "toss") {
    var k = Math.min(1, d.t / CM_TOSS), hx = owner.x, hy = owner.y - owner.r * 1.15;
    d.x = d.fx + (hx - d.fx) * k; d.y = d.fy + (hy - d.fy) * k - Math.sin(k * Math.PI) * 70;
    d.ang = k * Math.PI * 3 * d.dir;
    if (k >= 1) { d.phase = "held"; d.t = 0; d.ang = 0; }
    if (!busOn(owner)) { d.phase = "drop"; d.t = 0; d.vx = 0; d.vy = 40; d.spin = 2; }
  } else if (d.phase === "held") {
    d.x = owner.x; d.y = owner.y - owner.r * 1.15;
    if (!busOn(owner)) { d.phase = "drop"; d.t = 0; d.vx = 0; d.vy = 40; d.spin = 2; }
  } else if (d.phase === "fly") {
    d.x += d.vx * dt; d.y += d.vy * dt; d.ang += d.spin * dt;
    // Off the cage: a clang, and it clatters down.
    if (d.x < CM_DOLLY_R || d.x > W - CM_DOLLY_R || d.y < CM_DOLLY_R || d.y > H - CM_DOLLY_R) {
      d.x = Math.max(CM_DOLLY_R, Math.min(W - CM_DOLLY_R, d.x)); d.y = Math.max(CM_DOLLY_R, Math.min(H - CM_DOLLY_R, d.y));
      d.phase = "drop"; d.t = 0; d.vx *= -0.2; d.vy *= -0.2; d.spin *= 0.4;
      playDollyClang(0.6);
      return;
    }
    if (opp && opp.alive && !opp.koOut && !d.weaved) {
      var dx = d.x - opp.x, dy = d.y - opp.y;
      if (dx * dx + dy * dy < (opp.r + CM_DOLLY_R) * (opp.r + CM_DOLLY_R)) {
        var dealt = hurt(opp, d.damage, "proj", d.ownerId);
        if (opp.justDodged) { d.weaved = true; return; } // slipped: it flies on past
        if (dealt > 0) {
          var sp = Math.sqrt(d.vx * d.vx + d.vy * d.vy) || 1;
          if (cmKnockable(opp)) { opp.vx += d.vx / sp * d.kb; opp.vy += d.vy / sp * d.kb; }
          floater(opp.x, opp.y - opp.r - 34, "DOLLY!", "crit");
          playDollyClang(1);
          crowdReact(0.6);
          opp.flash = 0.14;
          if (!reduceMotion) shake = Math.max(shake, 12);
        } else playDollyClang(0.5); // (blocked)
        d.phase = "drop"; d.t = 0; d.vx *= -0.22; d.vy *= -0.22; d.spin *= -0.5;
        checkEnd();
      }
    }
  } else if (d.phase === "drop") {
    var damp = Math.exp(-4 * dt);
    d.x += d.vx * dt; d.y += d.vy * dt; d.vx *= damp; d.vy *= damp; d.ang += d.spin * dt;
    if (d.t > 0.8) cmDolly = null;
  }
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
  // The spinning kick: he whips all the way round before the leg comes out.
  var kk = m.kick, ks = kk && kk.kind === "spin" && cmCfg(b).kicks.spin;
  if (ks && kk.t < ks.spinTime) {
    var turn = easeOut(kk.t / ks.spinTime) * Math.PI * 2 * (Math.cos(kk.ang) >= 0 ? 1 : -1);
    ctx.translate(b.x, b.y); ctx.rotate(turn); ctx.translate(-b.x, -b.y);
    return;
  }
  // The swig: head tipped back with the bottle up.
  if (m.drink) {
    var dk = cmCfg(b).drink, dt0 = m.drink.t, tip = Math.min(1, dt0 / CM_DRINK_UP) * Math.min(1, Math.max(0, (dk.time - dt0) / CM_DRINK_DOWN));
    var lean = -cmMouth(b).s * 0.16 * tip;
    ctx.translate(b.x, ay); ctx.rotate(lean); ctx.translate(-b.x, -ay);
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
  else if (busOn(b)) drawBusArms(b, other);
  else if (m.drink) drawDrinkArms(b, m);
  else if (cmStrutting(b)) drawStrutArms(b);
  else if (m.counter) drawCounterStance(b, other, m.counter);
  if (m.kick) drawConorKick(b, other, m.kick);
  drawGasBar(b, other, m);
}

// A kick: the front kick chambers the knee then drives the sole into their
// body; the spinning kick comes out heel first after the turn (applyConorPose),
// with a whirl round him while he spins.
function drawConorKick(b, o, k) {
  var kc = cmCfg(b).kicks, spec = kc[k.kind] || kc.front, r = b.r, ux = Math.cos(k.ang), uy = Math.sin(k.ang), px = -uy, py = ux;
  var spin = k.kind === "spin", start = spin ? spec.spinTime : spec.hitAt * 0.4, ext;
  if (k.t < start) ext = 0;
  else if (k.t < spec.hitAt) ext = easeOut((k.t - start) / Math.max(0.01, spec.hitAt - start));
  else ext = Math.max(0, 1 - (k.t - spec.hitAt) / Math.max(0.01, spec.dur - spec.hitAt) * 0.9);
  ctx.save();
  if (spin && k.t < spec.spinTime + 0.05) {
    // the whirl: green arcs sweeping round him
    var sk = Math.min(1, k.t / spec.spinTime), dir = ux >= 0 ? 1 : -1;
    ctx.lineCap = "round";
    [1.25, 1.45].forEach(function (f, i) {
      ctx.globalAlpha = 0.7 - i * 0.25; ctx.strokeStyle = i ? "#ffffff" : "#7dffb0"; ctx.lineWidth = 4 - i;
      var a0 = k.ang + Math.PI + dir * sk * Math.PI * 2;
      ctx.beginPath(); ctx.arc(b.x, b.y, r * f, a0 - dir * 1.6, a0, dir < 0); ctx.stroke();
    });
    ctx.globalAlpha = 1;
  }
  if (ext <= 0.02 && !(k.kind === "front" && k.t < start)) { ctx.restore(); return; }
  // Aimed at their body, under their guard.
  var hip = { x: b.x + ux * r * 0.3 + px * r * 0.25 * k.side, y: b.y + uy * r * 0.3 + r * 0.42 };
  var bx = o.x - ux * o.r * 0.85, by = o.y + o.r * 0.55, tdx = bx - hip.x, tdy = by - hip.y, td = Math.sqrt(tdx * tdx + tdy * tdy) || 1;
  var len = Math.min(td, r * 0.4 + kc.range + 12), lx = tdx / td, ly = tdy / td;
  var foot, knee;
  if (k.kind === "front" && k.t < start) {
    // the chamber: knee up toward them
    var ch = Math.min(1, k.t / Math.max(0.01, start));
    knee = { x: hip.x + lx * r * 0.55 * ch, y: hip.y - r * 0.3 * ch };
    foot = { x: knee.x + lx * r * 0.1, y: knee.y + r * 0.45 };
  } else {
    var dist = r * 0.35 + (len - r * 0.35) * ext;
    foot = { x: hip.x + lx * dist, y: hip.y + ly * dist };
    knee = { x: (hip.x + foot.x) / 2 - ly * r * 0.3 * (1 - ext) * k.side, y: (hip.y + foot.y) / 2 - r * 0.28 * (1 - ext) };
  }
  drawBjjLeg(b.char, hip, knee, foot, r * 0.19, 0, 0.01);
  // The foot goes on in drawConorOver, over the both of them, so their
  // gloves never hide it.
  k.foot = { x: foot.x, y: foot.y, a: Math.atan2(foot.y - knee.y, foot.x - knee.x), size: r * 0.36, skin: armColor(b.char), at: cmClock };
  ctx.restore();
}
// The bare foot: sole into them on the front kick (toes up), heel first on
// the spin, and a burst where it lands.
function drawConorFoot(b) {
  var k = b.cm && b.cm.kick, f = k && k.foot;
  if (!f || f.at !== cmClock || !b.alive) return;
  var spec = cmCfg(b).kicks[k.kind], spin = k.kind === "spin", fs = Math.cos(f.a) >= 0 ? 1 : -1;
  ctx.save();
  ctx.translate(f.x, f.y); ctx.rotate(f.a);
  drawKickFoot(f.size, f.skin, spin ? fs : -fs);
  ctx.restore();
  if (k.landed && spec && k.t - spec.hitAt < 0.12) {
    ctx.save();
    ctx.globalAlpha = 1 - (k.t - spec.hitAt) / 0.12;
    ctx.strokeStyle = spin ? "#7dffb0" : "#ffe066"; ctx.lineWidth = 3; ctx.lineCap = "round";
    for (var i = 0; i < 7; i++) {
      var a = i / 7 * Math.PI * 2, r0 = spin ? 10 : 9, r1 = spin ? 26 : 20;
      ctx.beginPath(); ctx.moveTo(f.x + Math.cos(a) * r0, f.y + Math.sin(a) * r0); ctx.lineTo(f.x + Math.cos(a) * r1, f.y + Math.sin(a) * r1); ctx.stroke();
    }
    ctx.restore();
  }
}

// The swig: the bottle tipped up to his mouth in the hand on the side he's
// facing, held near the base, the other hand down at his hip. The bottle
// starts out level and the base comes up as he drinks.
function drawDrinkArms(b, m) {
  var dk = cmCfg(b).drink, k = m.drink, r = b.r, size = b.char.punch.size || 14, mo = cmMouth(b), s = mo.s;
  var up = Math.min(1, k.t / CM_DRINK_UP) * Math.min(1, Math.max(0, (dk.time - k.t) / CM_DRINK_DOWN));
  var e = up * up * (3 - 2 * up);
  var tilt = Math.min(1, Math.max(0, (k.t - CM_DRINK_UP) / 0.55)); // tipping further as he drinks
  var h = r * 1.45;
  ctx.save();
  // the free hand, down at his side
  var low = { x: b.x - s * r * 0.95, y: b.y + r * 0.5 };
  strokeLimb(size * 0.66, armColor(b.char, -s), function () { ctx.moveTo(b.x - s * r * 0.55, b.y - r * 0.05); ctx.lineTo(low.x, low.y); });
  drawGloveAt(low.x, low.y, size * 0.82, b.char, Math.PI / 2);
  // the way the base points: out in front and level, then up
  var lift = 1.35 - 0.95 * tilt, ang = -Math.PI / 2 + s * lift;
  var neck = { x: mo.x + s * r * 0.08, y: mo.y - r * 0.05 };
  var dx = Math.cos(ang), dy = Math.sin(ang);
  var held = { x: neck.x + dx * h * 0.55, y: neck.y + dy * h * 0.55 };   // the bottle's middle
  var rest = { x: b.x + s * r * 1.2, y: b.y + r * 0.35 };                 // down by his side before it comes up
  var cx = rest.x + (held.x - rest.x) * e, cy = rest.y + (held.y - rest.y) * e;
  var bang = e > 0.05 ? ang : Math.PI / 2;
  var gx = cx + Math.cos(bang) * h * 0.36, gy = cy + Math.sin(bang) * h * 0.36; // his glove near the base
  strokeLimb(size * 0.66, armColor(b.char, s), function () { ctx.moveTo(b.x + s * r * 0.55, b.y - r * 0.02); ctx.quadraticCurveTo(b.x + s * r * 1.3, b.y + r * 0.25, gx, gy); });
  drawRootBeerBottle(cx, cy, bang, h);
  drawGloveAt(gx, gy, size * 0.78, b.char, bang + s * Math.PI / 2);
  // fizz at his mouth while he glugs
  if (e > 0.9 && tilt > 0.1) {
    for (var i = 0; i < 3; i++) {
      var ph = (cmClock * 3 + i / 3) % 1;
      ctx.globalAlpha = 1 - ph; ctx.fillStyle = "#f3e3c3"; ctx.strokeStyle = theme.wall; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(neck.x - s * (4 + i * 3), neck.y - ph * 18, 2.2, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }
  ctx.restore();
}
// A bottle of Proper No. 12 Irish root beer: brown glass, a cream label
// with a green band, a gold cap. (x, y) is where it's held, `ang` the way
// the base points (the neck points the other way), `h` its length.
function drawRootBeerBottle(x, y, ang, h) {
  ctx.save();
  ctx.translate(x, y); ctx.rotate(ang + Math.PI / 2); // +y toward the base, -y toward the neck
  var w = h * 0.3, top = -h * 0.55, base = h * 0.45, sh = -h * 0.08;
  ctx.fillStyle = "#4a240c"; ctx.strokeStyle = theme.wall; ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-w / 2, base); ctx.lineTo(w / 2, base); ctx.lineTo(w / 2, sh);
  ctx.quadraticCurveTo(w / 2, sh - h * 0.12, w * 0.18, sh - h * 0.2); ctx.lineTo(w * 0.17, top);
  ctx.lineTo(-w * 0.17, top); ctx.lineTo(-w * 0.18, sh - h * 0.2);
  ctx.quadraticCurveTo(-w / 2, sh - h * 0.12, -w / 2, sh); ctx.closePath();
  ctx.fill(); ctx.stroke();
  ctx.fillStyle = "#f3e7c9"; ctx.fillRect(-w / 2 + 1, sh + h * 0.08, w - 2, h * 0.24);   // label
  ctx.fillStyle = "#169b62"; ctx.fillRect(-w / 2 + 1, sh + h * 0.16, w - 2, h * 0.07);  // green band
  ctx.fillStyle = "#d4af37"; ctx.fillRect(-w * 0.2, top - h * 0.05, w * 0.4, h * 0.07);  // cap
  ctx.fillStyle = "rgba(255,255,255,0.35)"; ctx.fillRect(-w * 0.33, sh - h * 0.02, w * 0.1, h * 0.4); // shine
  ctx.restore();
}

// His part of the Bus Crew: calling it in (a fist pumping, the other arm
// pointing at the lane), then the dolly over his head.
function drawBusArms(b, o) {
  var g = b.igbb, r = b.r, size = b.char.punch.size || 14;
  ctx.save();
  if (g.phase === "lift" || (g.phase === "catch" && cmDolly && cmDolly.phase === "held")) {
    var shake = g.t > (b.char.special.windup || 0.75) - 0.28 ? Math.sin(cmClock * 60) * 1.5 : 0;
    var hy = b.y - r * 1.05;
    [-1, 1].forEach(function (s) {
      var hx = b.x + s * r * 0.5 + shake;
      strokeLimb(size * 0.66, armColor(b.char, s), function () { ctx.moveTo(b.x + s * r * 0.6, b.y - r * 0.1); ctx.quadraticCurveTo(b.x + s * r * 0.95, b.y - r * 0.6, hx, hy); });
      drawGloveAt(hx, hy, size * 0.8, b.char, -Math.PI / 2);
    });
  } else {
    var lane = cmBus ? cmBus.lane : -1, pump = Math.abs(Math.sin(cmClock * 9));
    var s1 = o.x >= b.x ? 1 : -1;
    var fist = { x: b.x - s1 * r * 0.75, y: b.y - r * (1.1 + 0.35 * pump) };
    strokeLimb(size * 0.66, armColor(b.char, -s1), function () { ctx.moveTo(b.x - s1 * r * 0.55, b.y - r * 0.1); ctx.lineTo(fist.x, fist.y); });
    drawGloveAt(fist.x, fist.y, size * 0.85, b.char, -Math.PI / 2);
    var pt = { x: b.x + s1 * r * 1.35, y: b.y + lane * r * 0.7 };
    strokeLimb(size * 0.66, armColor(b.char, s1), function () { ctx.moveTo(b.x + s1 * r * 0.55, b.y); ctx.lineTo(pt.x, pt.y); });
    drawGloveAt(pt.x, pt.y, size * 0.8, b.char, Math.atan2(pt.y - b.y, pt.x - b.x));
  }
  ctx.restore();
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
  if (m.sipFx > 0) { // a swig just topped it up: it glows gold
    ctx.globalAlpha = Math.min(1, m.sipFx / 0.4);
    ctx.shadowColor = "#ffd23f"; ctx.shadowBlur = 10; ctx.strokeStyle = "#ffd23f"; ctx.lineWidth = 3;
    ctx.strokeRect(bx - 2, gy - 2, bw + 4, gh + 4);
    ctx.shadowBlur = 0; ctx.globalAlpha = 1;
  }
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
    if (g.thrown < (cmPresserCfg(b) || {}).bottles && cock) drawBottleInHand(right.x, right.y - size * 0.4, r);
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

// ---------------------------------------------------------------- the bus, the lads, the dolly

// A steady pseudo-random number from a seed (drawing never calls
// Math.random, so replays stay in step).
function cmHash(n) { var x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }

// From draw(), under the fighters: the red lane where the bus will pull in,
// the bus's shadow, and the dolly's aim line.
function drawConorUnder() {
  var bus = cmBus;
  if (bus) {
    var r = busRect(bus);
    if (bus.phase === "warn" || bus.phase === "arrive") {
      var k = bus.phase === "warn" ? Math.min(1, bus.t / 0.25) : Math.max(0, 1 - bus.t / CM_BUS_ARRIVE);
      var flash = 0.5 + 0.5 * Math.sin(cmClock * 22);
      ctx.save();
      ctx.globalAlpha = k * (0.18 + 0.14 * flash);
      ctx.fillStyle = "#e53935"; ctx.fillRect(0, r.y0, W, CM_BUS_H);
      ctx.globalAlpha = k * (0.55 + 0.35 * flash);
      ctx.strokeStyle = "#e53935"; ctx.lineWidth = 5; ctx.lineJoin = "round"; ctx.lineCap = "round";
      var step = 46, off = (cmClock * 160) % step;
      for (var x = -step; x < W + step; x += step) {
        var cx = bus.dir > 0 ? x + off : W - x - off, cy = bus.y;
        ctx.beginPath(); ctx.moveTo(cx - bus.dir * 10, cy - 16); ctx.lineTo(cx + bus.dir * 6, cy); ctx.lineTo(cx - bus.dir * 10, cy + 16); ctx.stroke();
      }
      // headlights glowing where it's coming in
      var ex = bus.dir > 0 ? 0 : W, hg = ctx.createRadialGradient(ex, bus.y + 12, 4, ex, bus.y + 12, 90);
      hg.addColorStop(0, "rgba(255,240,170," + (0.75 * k) + ")"); hg.addColorStop(1, "rgba(255,240,170,0)");
      ctx.globalAlpha = 1; ctx.fillStyle = hg; ctx.fillRect(ex - 90, bus.y - 80, 180, 180);
      ctx.restore();
    }
    if (bus.phase !== "warn") {
      ctx.save();
      ctx.fillStyle = "rgba(0,0,0,0.22)";
      ctx.beginPath(); ctx.ellipse(bus.x, r.y1 - 2, CM_BUS_L * 0.52, 9, 0, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }
  }
  // The dolly's aim line while he holds it up: dashed, then solid and
  // flashing once it locks.
  var owner = cmDolly && balls[cmDolly.ownerId], g = owner && owner.igbb;
  if (g && g.move === "buscrew" && g.phase === "lift") {
    var locked = g.t >= (owner.char.special.windup || 0.75) - 0.28;
    var ux = Math.cos(g.aim), uy = Math.sin(g.aim), len = Math.max(W, H) * 1.5;
    ctx.save();
    ctx.globalAlpha = locked ? 0.55 + 0.4 * Math.sin(cmClock * 40) : 0.45;
    ctx.strokeStyle = "#e53935"; ctx.lineWidth = locked ? 7 : 4; ctx.lineCap = "round";
    if (!locked) ctx.setLineDash([12, 10]);
    ctx.beginPath(); ctx.moveTo(owner.x + ux * owner.r, owner.y + uy * owner.r); ctx.lineTo(owner.x + ux * len, owner.y + uy * len); ctx.stroke();
    ctx.restore();
  }
}

// From draw(), over the fighters: the bus, the lads, the brawl cloud, the
// dolly, and his foot on a kick.
function drawConorOver() {
  var bus = cmBus;
  if (bus && bus.phase !== "warn") {
    ctx.save();
    ctx.beginPath(); ctx.rect(0, -60, W, H + 120); ctx.clip(); // it drives in out of the cage wall
    drawBus(bus);
    ctx.restore();
  }
  if (bus) {
    var opp = balls[bus.oppId];
    bus.crew.forEach(function (c) { if (c.st === "out" || c.st === "chase" || c.st === "back") drawLad(c, bus); });
    if (opp && opp.cmBrawl) drawBrawlCloud(opp, bus);
  }
  if (cmDolly) drawDolly(cmDolly.x, cmDolly.y, cmDolly.ang, 1);
  balls.forEach(drawConorFoot);
}

// The coach, side on: cream with the tricolour stripes, a row of windows
// with the lads' green hats in them, the Proper No. 12 wrap, the door up
// front and a destination sign (DUBLIN, or BROOKLYN against Khabib).
function drawBus(bus) {
  var L = CM_BUS_L, Hh = CM_BUS_H, hl = L / 2, top = -Hh / 2, bodyB = Hh / 2 - 12, ink = theme.wall;
  var moving = bus.phase === "arrive" || bus.phase === "leave", bob = moving ? Math.sin(cmClock * 30) * 1.2 : 0;
  ctx.save();
  ctx.translate(bus.x, bus.y + bob);
  ctx.scale(bus.dir, 1); // front at +x
  ctx.lineJoin = "round"; ctx.lineCap = "round";
  // body
  ctx.fillStyle = "#f4efe2"; ctx.strokeStyle = ink; ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.moveTo(-hl + 8, top); ctx.lineTo(hl - 24, top); ctx.quadraticCurveTo(hl - 2, top + 2, hl, top + 22);
  ctx.lineTo(hl, bodyB - 6); ctx.quadraticCurveTo(hl, bodyB, hl - 6, bodyB); ctx.lineTo(-hl + 6, bodyB);
  ctx.quadraticCurveTo(-hl, bodyB, -hl, bodyB - 6); ctx.lineTo(-hl, top + 8); ctx.quadraticCurveTo(-hl, top, -hl + 8, top);
  ctx.closePath(); ctx.fill(); ctx.stroke();
  // roof strip and the tricolour stripes along it
  ctx.save(); ctx.clip();
  ctx.fillStyle = "#d9d2bf"; ctx.fillRect(-hl, top, L, 6);
  ctx.fillStyle = "#169b62"; ctx.fillRect(-hl, 4, L, 6);
  ctx.fillStyle = "#ffffff"; ctx.fillRect(-hl, 10, L, 3);
  ctx.fillStyle = "#ff883e"; ctx.fillRect(-hl, 13, L, 5);
  ctx.restore();
  // windows, with the lads still on board in them
  var winTop = top + 9, winH = 20, inside = bus.crew.filter(function (c) { return c.st === "in" || c.st === "aboard"; }).length;
  for (var i = 0; i < 5; i++) {
    var wx = 64 - (i + 1) * 36;
    ctx.fillStyle = "#243a52"; ctx.strokeStyle = ink; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.roundRect(wx, winTop, 30, winH, 4); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "rgba(255,255,255,0.18)"; ctx.fillRect(wx + 3, winTop + 2, 5, winH - 4);
    if (i < inside) {
      var hx = wx + 15, bobh = Math.sin(cmClock * 8 + i) * 1.2;
      ctx.fillStyle = "#e0702a"; ctx.beginPath(); ctx.arc(hx, winTop + winH + 1, 8, Math.PI, 0); ctx.fill(); // a beard
      ctx.fillStyle = "#1f8a45"; ctx.strokeStyle = ink; ctx.lineWidth = 1.5;
      ctx.fillRect(hx - 6, winTop + 3 + bobh, 12, 10); ctx.strokeRect(hx - 6, winTop + 3 + bobh, 12, 10);
      ctx.fillRect(hx - 9, winTop + 12 + bobh, 18, 3); ctx.strokeRect(hx - 9, winTop + 12 + bobh, 18, 3);
      ctx.fillStyle = "#111111"; ctx.fillRect(hx - 6, winTop + 9 + bobh, 12, 2);
    }
  }
  // the destination sign in the first window
  var sx = 70, sgW = 30;
  ctx.fillStyle = "#151515"; ctx.strokeStyle = ink; ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.roundRect(sx, winTop, sgW, winH, 4); ctx.fill(); ctx.stroke();
  // windscreen
  ctx.fillStyle = "#2c4a66"; ctx.strokeStyle = ink; ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.moveTo(hl - 22, top + 5); ctx.quadraticCurveTo(hl - 5, top + 6, hl - 3, top + 24); ctx.lineTo(hl - 3, 2); ctx.lineTo(hl - 22, 2); ctx.closePath(); ctx.fill(); ctx.stroke();
  // the door, sliding open
  var dx = hl - 35, dw = 22, dTop = top + 8, dBot = bodyB - 1, op = bus.door;
  ctx.fillStyle = "#101820"; ctx.fillRect(dx - dw / 2, dTop, dw, dBot - dTop);
  ctx.fillStyle = "#3d6585"; ctx.strokeStyle = ink; ctx.lineWidth = 2;
  [-1, 1].forEach(function (s) {
    var pw = dw / 2 * (1 - op * 0.85), px = s < 0 ? dx - dw / 2 : dx + dw / 2 - pw;
    ctx.fillRect(px, dTop, pw, dBot - dTop); ctx.strokeRect(px, dTop, pw, dBot - dTop);
  });
  ctx.strokeStyle = ink; ctx.lineWidth = 2.5; ctx.strokeRect(dx - dw / 2, dTop, dw, dBot - dTop);
  // headlight and tail light
  var lit = moving || bus.phase === "parked";
  ctx.fillStyle = lit ? "#fff3b0" : "#e8e1c8"; ctx.strokeStyle = ink; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(hl - 4, bodyB - 10, 4, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = "#d32f2f"; ctx.fillRect(-hl + 1, bodyB - 16, 4, 9);
  // wheels
  [-hl + 52, hl - 62].forEach(function (wx) {
    ctx.fillStyle = "#1a1a1a"; ctx.strokeStyle = ink; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.arc(wx, bodyB, 14, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#9aa0a6"; ctx.beginPath(); ctx.arc(wx, bodyB, 7, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "#3a3a3a"; ctx.lineWidth = 2;
    for (var q = 0; q < 3; q++) { var wa = bus.wheel + q * Math.PI * 2 / 3; ctx.beginPath(); ctx.moveTo(wx, bodyB); ctx.lineTo(wx + Math.cos(wa) * 7, bodyB + Math.sin(wa) * 7); ctx.stroke(); }
  });
  ctx.restore();
  // Words, never mirrored: the wrap and the sign.
  var dirx = bus.dir, cy = bus.y + bob;
  var wrapX = bus.x - dirx * 6, wrapY = cy + 24;
  ctx.save();
  ctx.fillStyle = "#f3e7c9"; ctx.strokeStyle = "#0b3d24"; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.roundRect(wrapX - 62, wrapY - 9, 124, 15, 7); ctx.fill(); ctx.stroke();
  stillText("PROPER No.12  ROOT BEER", wrapX, wrapY - 1, 11, "#0b3d24", 116, { face: "Georgia, 'Times New Roman', serif", weight: "900" });
  var signX = bus.x + dirx * (70 + 15), signY = cy + winTop + winH / 2;
  stillText(bus.brooklyn ? "BROOKLYN" : "DUBLIN", signX, signY + 1, 9, "#ffb020", 26, { face: "'Courier New', Courier, monospace", weight: "900", glow: "#ff8a00" });
  ctx.restore();
}

// One of the lads: a small round fella in a green coat, a big orange
// beard, a tall green hat with a buckle and a shamrock, little boots and
// fists pumping as he runs. Stars when he's been in the brawl, a sweat drop
// when he's out of puff.
function drawLad(c, bus) {
  var R = CM_CREW_R, run = c.st === "chase" || c.st === "back", ph = c.ph * (c.st === "chase" ? 16 : 11);
  var hop = run ? Math.abs(Math.sin(ph)) * 3 : 0, x = c.x, y = c.y - hop, ink = theme.wall, f = c.face || 1;
  ctx.save();
  ctx.lineJoin = "round"; ctx.lineCap = "round";
  // shadow
  ctx.fillStyle = "rgba(0,0,0,0.22)"; ctx.beginPath(); ctx.ellipse(c.x, c.y + R * 0.95, R * 0.85, R * 0.25, 0, 0, Math.PI * 2); ctx.fill();
  // boots
  [-1, 1].forEach(function (s) {
    var kick = run ? Math.sin(ph + (s > 0 ? Math.PI : 0)) * R * 0.35 : 0;
    ctx.fillStyle = "#1b1410"; ctx.strokeStyle = ink; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.ellipse(x + s * R * 0.42 + kick * f, y + R * 0.9, R * 0.32, R * 0.2, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  });
  // body: green coat, skin up top
  ctx.fillStyle = c.coat; ctx.strokeStyle = ink; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(x, y, R, 0, Math.PI * 2); ctx.fill();
  ctx.save(); ctx.beginPath(); ctx.arc(x, y, R, 0, Math.PI * 2); ctx.clip();
  ctx.fillStyle = "#f1c9a8"; ctx.fillRect(x - R, y - R, R * 2, R * 0.85);
  ctx.fillStyle = "#151515"; ctx.fillRect(x - R, y + R * 0.28, R * 2, R * 0.2); // belt
  ctx.fillStyle = "#d4af37"; ctx.fillRect(x - R * 0.17, y + R * 0.25, R * 0.34, R * 0.26); // buckle
  ctx.restore();
  ctx.beginPath(); ctx.arc(x, y, R, 0, Math.PI * 2); ctx.stroke();
  // the beard, bushy, down over his chest
  ctx.fillStyle = c.beard; ctx.strokeStyle = ink; ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x - R * 0.72, y - R * 0.25);
  ctx.quadraticCurveTo(x - R * 0.85, y + R * 0.45, x - R * 0.2, y + R * 0.62);
  ctx.quadraticCurveTo(x, y + R * 0.8, x + R * 0.2, y + R * 0.62);
  ctx.quadraticCurveTo(x + R * 0.85, y + R * 0.45, x + R * 0.72, y - R * 0.25);
  ctx.quadraticCurveTo(x, y - R * 0.02, x - R * 0.72, y - R * 0.25);
  ctx.closePath(); ctx.fill(); ctx.stroke();
  // fists pumping
  [-1, 1].forEach(function (s) {
    var sw = run ? Math.sin(ph + (s > 0 ? 0 : Math.PI)) : 0;
    var fx = x + s * R * 1.05 + (c.st === "chase" ? f * R * 0.25 * (1 + sw) : 0), fy = y - R * (c.st === "chase" ? 0.25 + 0.3 * sw : -0.1);
    ctx.fillStyle = "#f1c9a8"; ctx.strokeStyle = ink; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(fx, fy, R * 0.3, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  });
  // the hat: a tall green crown, a black band with a gold buckle, a wide brim, a shamrock
  var hh = R * 1.05 * c.hat, by = y - R * 0.62, tilt = run ? Math.sin(ph * 0.5) * 0.08 : 0;
  ctx.save();
  ctx.translate(x, by); ctx.rotate(tilt - f * 0.12);
  ctx.fillStyle = "#178a3e"; ctx.strokeStyle = ink; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(-R * 0.55, 0); ctx.lineTo(-R * 0.45, -hh); ctx.lineTo(R * 0.45, -hh); ctx.lineTo(R * 0.55, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = "#111111"; ctx.fillRect(-R * 0.53, -R * 0.36, R * 1.06, R * 0.24);
  ctx.strokeStyle = "#e3c24a"; ctx.lineWidth = 1.8; ctx.strokeRect(-R * 0.15, -R * 0.38, R * 0.3, R * 0.28);
  ctx.fillStyle = "#178a3e"; ctx.strokeStyle = ink; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.ellipse(0, 0, R * 0.98, R * 0.2, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  drawShamrock(R * 0.32, -hh * 0.62, R * 0.15, "#7dff9a");
  ctx.restore();
  // stars or sweat
  if (c.dizzy > 0) {
    for (var k = 0; k < 3; k++) {
      var sa = cmClock * 7 + k * Math.PI * 2 / 3;
      drawStarAt(x + Math.cos(sa) * R * 0.9, by - hh - 4 + Math.sin(sa) * R * 0.25, 3.2, "#ffe066");
    }
  } else if (c.puff) {
    ctx.fillStyle = "#a8dcff"; ctx.strokeStyle = ink; ctx.lineWidth = 1;
    var sd = (cmClock * 2 + c.i) % 1;
    ctx.beginPath(); ctx.ellipse(x - f * R * 0.95, y - R * 0.6 + sd * 6, 2.4, 3.4, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  }
  ctx.restore();
}
function drawShamrock(x, y, s, col) {
  ctx.save();
  ctx.fillStyle = col; ctx.strokeStyle = "#0b3d24"; ctx.lineWidth = 1;
  [[-1, 0.2], [1, 0.2], [0, -1]].forEach(function (q) { ctx.beginPath(); ctx.arc(x + q[0] * s * 0.9, y + q[1] * s * 0.9, s, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); });
  ctx.restore();
}
function drawStarAt(x, y, r, col) {
  ctx.save();
  ctx.fillStyle = col; ctx.strokeStyle = theme.wall; ctx.lineWidth = 1;
  ctx.beginPath();
  for (var i = 0; i < 10; i++) { var a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r; ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
  ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.restore();
}

// The cartoon fight cloud: dust puffs rolling round them, with fists, boots,
// green hats and shamrocks popping out of it, stars, and POW! WHACK! on the
// hits.
function drawBrawlCloud(o, bus) {
  var br = o.cmBrawl, R = o.r * 1.35 + br.n * 4, x = br.x, y = br.y, t = br.t, ink = theme.wall;
  var grow = Math.min(1, t / 0.15), shrink = Math.min(1, (br.dur - t) / 0.15), k = Math.min(grow, shrink);
  R *= 0.6 + 0.4 * k;
  ctx.save();
  ctx.lineJoin = "round"; ctx.lineCap = "round";
  // things flying out of it (behind the puffs)
  for (var i = 0; i < 6; i++) {
    var slot = Math.floor(t * 9 + i * 0.37), a = cmHash(slot * 7 + i) * Math.PI * 2, out = R * (0.9 + 0.35 * ((t * 9 + i * 0.37) % 1));
    var px = x + Math.cos(a) * out, py = y + Math.sin(a) * out, kind = (slot + i) % 4;
    if (kind === 0) { ctx.fillStyle = "#f1c9a8"; ctx.strokeStyle = ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(px, py, 6, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); }
    else if (kind === 1) { ctx.fillStyle = "#1b1410"; ctx.strokeStyle = ink; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.ellipse(px, py, 7, 4.5, a, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); }
    else if (kind === 2) {
      ctx.save(); ctx.translate(px, py); ctx.rotate(a + Math.PI / 2);
      ctx.fillStyle = "#178a3e"; ctx.strokeStyle = ink; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(-6, 0); ctx.lineTo(-5, -11); ctx.lineTo(5, -11); ctx.lineTo(6, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillRect(-9, -1, 18, 3); ctx.strokeRect(-9, -1, 18, 3);
      ctx.restore();
    } else drawShamrock(px, py, 3.5, "#3fbf6a");
  }
  // the puffs
  var puffs = 10;
  for (var j = 0; j < puffs; j++) {
    var pa = j / puffs * Math.PI * 2 + t * 2.2, wob = 1 + 0.12 * Math.sin(t * 13 + j * 2.1);
    var pxx = x + Math.cos(pa) * R * 0.62, pyy = y + Math.sin(pa) * R * 0.55, pr = R * 0.42 * wob;
    ctx.fillStyle = j % 2 ? "#f2eee4" : "#e4ddcd"; ctx.strokeStyle = ink; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.arc(pxx, pyy, pr, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  }
  ctx.fillStyle = "#efe9dc"; ctx.beginPath(); ctx.arc(x, y, R * 0.68, 0, Math.PI * 2); ctx.fill();
  // a green hat and a glove bobbing in and out at the top
  var hb = Math.sin(t * 17) * 4;
  ctx.fillStyle = "#178a3e"; ctx.strokeStyle = ink; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(x - R * 0.3 - 7, y - R * 0.55 + hb); ctx.lineTo(x - R * 0.3 - 6, y - R * 0.55 - 14 + hb); ctx.lineTo(x - R * 0.3 + 6, y - R * 0.55 - 14 + hb); ctx.lineTo(x - R * 0.3 + 7, y - R * 0.55 + hb); ctx.closePath(); ctx.fill(); ctx.stroke();
  drawGloveAt(x + R * 0.35, y - R * 0.45 - hb, 9, o.char, -Math.PI / 2 + Math.sin(t * 11) * 0.6);
  // stars
  for (var s = 0; s < 4; s++) {
    var sa = t * 6 + s * Math.PI / 2;
    drawStarAt(x + Math.cos(sa) * R * 0.4, y + Math.sin(sa) * R * 0.3 - R * 0.05, 4.5, s % 2 ? "#ffe066" : "#ffffff");
  }
  // POW! on the hits
  br.pow.forEach(function (p) {
    var pk = p.t / 0.45, px = x + Math.cos(p.a) * R * 0.95, py = y + Math.sin(p.a) * R * 0.7 - pk * 10;
    ctx.save(); ctx.globalAlpha = 1 - pk; ctx.translate(px, py); ctx.rotate(Math.sin(p.a) * 0.3);
    var sz = 15 * (1 + 0.4 * Math.max(0, 1 - pk * 5));
    stillText(p.word, 0, 0, sz, "#ffe066", 80, { stroke: "#151515", strokeW: 0.3 });
    ctx.restore();
  });
  ctx.restore();
}

// The dolly (a hand truck): two steel rails with a handle at the top, a
// nose plate at the bottom, two wheels. `s` scales it.
function drawDolly(x, y, ang, s) {
  var hgt = 46 * s, w = 18 * s, ink = theme.wall;
  ctx.save();
  ctx.translate(x, y); ctx.rotate(ang);
  ctx.lineCap = "round"; ctx.lineJoin = "round";
  // rails
  [-1, 1].forEach(function (q) {
    ctx.strokeStyle = ink; ctx.lineWidth = 6 * s;
    ctx.beginPath(); ctx.moveTo(q * w / 2, -hgt / 2); ctx.lineTo(q * w / 2, hgt / 2 - 4 * s); ctx.stroke();
    ctx.strokeStyle = "#c62828"; ctx.lineWidth = 3.4 * s;
    ctx.beginPath(); ctx.moveTo(q * w / 2, -hgt / 2); ctx.lineTo(q * w / 2, hgt / 2 - 4 * s); ctx.stroke();
  });
  // handle loop and cross bars
  ctx.strokeStyle = ink; ctx.lineWidth = 6 * s;
  ctx.beginPath(); ctx.moveTo(-w / 2, -hgt / 2); ctx.quadraticCurveTo(0, -hgt / 2 - 9 * s, w / 2, -hgt / 2); ctx.stroke();
  ctx.strokeStyle = "#c62828"; ctx.lineWidth = 3.4 * s; ctx.stroke();
  ctx.strokeStyle = "#8d99a6"; ctx.lineWidth = 2.5 * s;
  [-0.15, 0.15].forEach(function (f) { ctx.beginPath(); ctx.moveTo(-w / 2, hgt * f); ctx.lineTo(w / 2, hgt * f); ctx.stroke(); });
  // nose plate
  ctx.fillStyle = "#b0b8c0"; ctx.strokeStyle = ink; ctx.lineWidth = 2 * s;
  ctx.fillRect(-w / 2 - 3 * s, hgt / 2 - 6 * s, w + 6 * s, 5 * s); ctx.strokeRect(-w / 2 - 3 * s, hgt / 2 - 6 * s, w + 6 * s, 5 * s);
  // wheels
  [-1, 1].forEach(function (q) {
    ctx.fillStyle = "#1a1a1a"; ctx.strokeStyle = ink; ctx.lineWidth = 2 * s;
    ctx.beginPath(); ctx.arc(q * (w / 2 + 2 * s), hgt / 2 - 10 * s, 6 * s, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#9aa0a6"; ctx.beginPath(); ctx.arc(q * (w / 2 + 2 * s), hgt / 2 - 10 * s, 2.4 * s, 0, Math.PI * 2); ctx.fill();
  });
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

// ---------------------------------------------------------------- gallery

// His fighter card's move list (galleryMoves, gallery.js).
function conorGalleryMoves(ch, add) {
  var cn = ch.notorious, ct = cn.trashTalk, cc = cn.counter, cg = cn.gasTank, ck = cn.kicks, dk = cn.drink, pc = cn.pressConference, cr = cn.rivals || {};
  if (ct) add("🗣️", "Trash talk", "He never stops talking: every few seconds he does the billionaire strut and says one of his real lines. Every line is a taunt: they see red for " + secs(ct.anger) + " and storm straight at him.");
  if (cc) add("🥊", "Counter left", "When they come at him angry he plants (the left hand glows) and fires it as they arrive" + (cc.angryCantSlip ? ": they run onto it, so it can't be slipped or blocked" : "") + ". It whiffs " + cc.whiff + "% of the time and leaves him open for " + secs(cc.openTime) + ". If it lands: " + cc.damage + " damage, or a knockout: " + (cc.koBase > 0 ? cc.koBase + "% of the time at full health, " : "never at full health, ") + "up to " + (cc.koBase + cc.koLow) + "% the more hurt they are" + (cc.koAfter ? ", and never in the first " + cc.koAfter + "s" : "") + ".");
  if (ck) add("🦵", "Kicks", "While he's fresh he kicks to the body from " + ck.range + " out: a front kick (" + ck.front.damage + ") that pushes them away, and " + ck.spin.chance + "% of the time a spinning kick (" + ck.spin.damage + ", he whips round first). A kick that lands sets them up: coming back in fires the counter left with " + ck.setup.koBonus + "% more knockout chance. The kicks dry up as he tires.");
  if (cg) add("⛽", "Gas tank", "The fastest, hardest-hitting fighter in the game for " + secs(cg.fresh) + " (x" + cg.speed[0] + " speed, x" + cg.damage[0] + " damage). Then over " + secs(cg.fade) + " it runs dry: x" + cg.speed[1] + " speed, x" + cg.damage[1] + " damage, and up to " + cg.tapExtra[1] + "% more likely to tap to a submission. Kicks burn it.");
  if (dk) add("🍺", "Proper No. 12", "When he's running low (up to " + dk.max + " times) he stops for a swig of root beer: " + secs(dk.time) + " stood still, and they come for him. Get through it and his tank winds back " + secs(dk.refill) + ". Get hit and he spills it and takes x" + dk.vuln + " damage.");
  if (pc && pc.on) add("🎤", "Press conference", pc.chance + "% of fights, once: a podium rises, he says a line and they get FURIOUS, he throws " + pc.bottles + " water bottles (" + pc.bottleDamage + " each), then steps out into the counter left with " + pc.koBonus + "% more knockout chance.");
  if (ch.tdd) add("🧱", "Takedown defense", "Stuffs " + ch.tdd.sprawlChance + "% of takedown shots and punches straight back.");
  if (cn.thirteen) add("⏱️", "13 seconds", "Knock someone out inside " + cn.thirteen.within + " seconds and the jumbotron shows the time, like his knockout of José Aldo.");
  if (cn.calls !== false) add("🎙️", "Commentary", "Land a finish like one of his real ones and the commentator's real call comes up: Rogan on the counter left (Aldo), Goldberg against Dustin and on a punch finish (Alvarez), Anik on a kick finish inside a minute (Cerrone).");
  if (cr.khabib) add("🦅", "vs Khabib", "Khabib's grabs come round " + cr.khabib.grappleBoost + "x as fast, " + cr.khabib.rncChance + "% of his takedowns take the back for a choke and " + cr.khabib.gnpChance + "% go to ground and pound (\"Let's talk now.\"), and Send Me Location comes early" + (cr.khabib.answerBus ? ", and again right after the bus leaves (his answer to it)" : "") + ".");
  if (cr.dustin && cr.dustin.calfKicks) add("🦵", "vs Dustin", "Dustin throws calf kicks at him (" + cr.dustin.calfKicks.damage + ", and a limp). Calf kicks do x" + (cn.calfKicksHurt || 1) + " damage to him.");
}
// The special's description (SPECIAL_INFO.buscrew, gallery.js).
function busCrewInfo(sp) {
  return "His UFC 223 bus. A horn and a red lane along the far wall, then a coach pulls up and " + sp.crew + " lads pile out (green hats, orange beards, shamrocks) and run them down for up to " + secs(sp.chase) + " each. Catch them and it's a brawl cloud: " + sp.hitDamage + " a punch from every lad in it, more piling on. Then a dolly flies out of the door to him: he lifts it while a red line shows where it's going and throws it (" + sp.dollyDamage + ", can be slipped or blocked). The lads pile back on and the bus drives off.";
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
// The spinning kick: a rising whirl as he turns.
function playSpinWhoosh() {
  cmAudio(function (ac, t) {
    var s = ac.createBufferSource(); s.buffer = caneNoise(ac); s.loop = true;
    var f = ac.createBiquadFilter(); f.type = "bandpass"; f.Q.value = 2.4;
    f.frequency.setValueAtTime(500, t); f.frequency.exponentialRampToValueAtTime(2600, t + 0.28);
    var g = ac.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.3, t + 0.12); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.34);
    s.connect(f); f.connect(g); g.connect(strikeOut(ac)); s.start(t); s.stop(t + 0.36);
  });
}
// The cap coming off: a pop and a fizz.
function playBottleOpen() {
  cmAudio(function (ac, t) {
    caneTone(ac, t, "sine", 900, 420, 0.22, 0.06);
    caneBurst(ac, t + 0.01, 5200, 0.7, 0.16, 0.25);
  });
}
// A glug: a low hollow bloop.
function playGlug() {
  cmAudio(function (ac, t) { caneTone(ac, t, "sine", 210, 120, 0.3, 0.12); caneTone(ac, t + 0.02, "triangle", 330, 180, 0.08, 0.1); });
}
// Done: a satisfied fizz up into a bright chime.
function playSecondWind() {
  cmAudio(function (ac, t) {
    caneBurst(ac, t, 4200, 0.8, 0.12, 0.3);
    [784, 988, 1319].forEach(function (f, i) { caneTone(ac, t + 0.06 + i * 0.07, "triangle", f, f, 0.12, 0.28); });
  });
}
// Knocked out of his hand: a splash and a clunk.
function playSpill() {
  cmAudio(function (ac, t) { caneBurst(ac, t, 1100, 0.6, 0.35, 0.3); caneTone(ac, t + 0.12, "sine", 260, 140, 0.25, 0.1); });
}
// The coach's horn: two low notes together (vol 0..1).
function playBusHorn(vol) {
  var v = vol == null ? 1 : vol;
  cmAudio(function (ac, t) {
    [233, 277].forEach(function (f) {
      var o = ac.createOscillator(); o.type = "sawtooth"; o.frequency.value = f;
      var lp = ac.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 1500;
      var g = ac.createGain();
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.09 * v, t + 0.02);
      g.gain.setValueAtTime(0.09 * v, t + 0.5 * v + 0.1); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.62 * v + 0.12);
      o.connect(lp); lp.connect(g); g.connect(strikeOut(ac)); o.start(t); o.stop(t + 0.8);
    });
  });
}
// The engine: a diesel rumble rising (pulling in) or revving off (leaving).
function playBusEngine(dur, arriving) {
  cmAudio(function (ac, t) {
    var o = ac.createOscillator(); o.type = "sawtooth";
    o.frequency.setValueAtTime(arriving ? 70 : 48, t); o.frequency.linearRampToValueAtTime(arriving ? 42 : 95, t + dur);
    var lp = ac.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 380;
    var g = ac.createGain();
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.16, t + 0.1);
    g.gain.setValueAtTime(0.16, t + dur * 0.7); g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.15);
    o.connect(lp); lp.connect(g); g.connect(strikeOut(ac)); o.start(t); o.stop(t + dur + 0.2);
  });
}
// Pulling up: the air brakes hiss, and the door goes.
function playAirBrake() {
  cmAudio(function (ac, t) { caneBurst(ac, t, 3800, 0.5, 0.25, 0.45); caneBurst(ac, t + 0.25, 2600, 0.7, 0.18, 0.2); });
}
// The lads piling out: a quick tin-whistle run up and a whoop.
function playLadsCheer() {
  cmAudio(function (ac, t) {
    [587, 659, 740, 880, 988, 1175].forEach(function (f, i) {
      var o = ac.createOscillator(); o.type = "triangle"; o.frequency.value = f;
      var vib = ac.createOscillator(), vg = ac.createGain(); vib.frequency.value = 6; vg.gain.value = f * 0.012;
      vib.connect(vg); vg.connect(o.frequency);
      var g = ac.createGain(), at = t + i * 0.065;
      g.gain.setValueAtTime(0.0001, at); g.gain.exponentialRampToValueAtTime(0.09, at + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, at + 0.12);
      o.connect(g); g.connect(ac.destination); o.start(at); vib.start(at); o.stop(at + 0.14); vib.stop(at + 0.14);
    });
    caneBurst(ac, t + 0.1, 700, 0.8, 0.22, 0.4); // the crowd of them
  });
}
// The brawl starting: a scuffle of thumps.
function playBrawlStart() {
  cmAudio(function (ac, t) { for (var i = 0; i < 4; i++) caneBurst(ac, t + i * 0.05, 400 + i * 140, 1, 0.3, 0.06); });
}
// A punch in the cloud: a cartoon thwack.
function playBrawlHit() {
  cmAudio(function (ac, t) { caneBurst(ac, t, 1500 + Math.random() * 900, 1.2, 0.24, 0.04); caneTone(ac, t, "sine", 180, 90, 0.18, 0.06); });
}
// The dolly landing in his hands, then being heaved up.
function playDollyCatch() {
  cmAudio(function (ac, t) { cmMetal(ac, t, 0.25); caneBurst(ac, t, 600, 0.9, 0.2, 0.08); });
}
function playDollyThrow() { playWhoosh(); cmAudio(function (ac, t) { cmMetal(ac, t + 0.02, 0.12); }); }
// Steel on something: the clang.
function playDollyClang(vol) {
  cmAudio(function (ac, t) { cmMetal(ac, t, 0.5 * (vol || 1)); caneBurst(ac, t, 2400, 0.9, 0.4 * (vol || 1), 0.06); });
}
function cmMetal(ac, t, peak) {
  [523, 1187, 1873, 2641].forEach(function (f, i) { caneTone(ac, t, "triangle", f, f * 0.995, peak / (i + 1.5), 0.5 - i * 0.08); });
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
