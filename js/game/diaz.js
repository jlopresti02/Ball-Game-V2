// Nate Diaz (Christian, 2026-11-13). Welterweight, on the Brawler base:
// long, quick, light punches (his boxing). Everything else is set in his
// character file under "diaz" (and his special); leave a block out and that
// part is switched off.
//
// Durability  (diaz.durability) he takes `take` of the damage from
//             everything (the scripted finishes, KO punches and slugfest
//             shots keep their exact numbers, from hurt, match.js).
// Iron chin   (diaz.chin) a one-punch knockout (the KO Rush, Conor's counter
//             left, Pereira's CHAMA hook, Ngannou's rage punch) only drops
//             him 100 - `chance`% of the time. Otherwise "IRON CHIN!": it
//             does `damage` (Ngannou's punch does its own), it can't finish
//             him, and he shakes it off with the Diaz arms-out taunt for
//             `taunt` seconds (open to anything).
// Sub defense (diaz.subDefense) a Gracie black belt: `save`% of the
//             submissions that would make him tap turn into escapes.
// Stockton Slap  (diaz.slap) every few seconds, within `range` of them, he
//             drops his hands with his arms out wide (the tell) and cocks one
//             open glove back for `windup` seconds, then dashes in and slaps
//             them across the head (a miss if they got out of `reach`). `damage` only, and it can be slipped or blocked, but if
//             it lands they're dizzy for `dizzy` seconds (gaethje.js) and a
//             red handprint comes up on them. `tauntAfter`% of the time he
//             holds the arms-out taunt after it.
// Sub hunt    (diaz.subHunt) he keeps trying to submit them. Every few
//             seconds when he's within `range` of them (and `onDizzy`% of the
//             times a slap or anything else leaves them dizzy) he sinks down
//             with both arms out for `reach` seconds (the tell), then shoots
//             in for the neck (a miss if they got away). They
//             fight it off `escape`% of the time (more for a Grappler or a
//             weaver, `escapeDizzy`% if they're dizzy): "DEFENDED". Otherwise
//             it's one of `subs` (rear naked choke, armbar or guillotine,
//             rnc.js / armbar.js / bjj.js). They tap `tapBase`% plus up to
//             `tapLowHp`% the more hurt they are, plus `persist`% for every
//             try that didn't finish (up to `persistMax` tries): each time
//             they get out he comes back sooner (`retry`) and sinks it deeper.
// Stockton surge  (diaz.stockton) late in the fight (`after` seconds, or
//             under `orBelow` of his health once `minT` seconds are gone),
//             once: he stops, arms out, and says one of his lines (`call`
//             seconds, the tell), walks them down and lands a big Stockton
//             Slap that can't be slipped or blocked (`slapDamage`, dizzy for
//             `slapDizzy`). "STOCKTON!": for the rest of the fight he hits
//             `damage` times as hard, rolls `speed` times faster, attacks
//             `attack` times faster, slaps more often and his chokes sink
//             `tapBonus`% deeper. A 209 tag sits by his health bar.
// Nick Diaz   his special (special.move "nickdiaz"). The jumbotron (a banner
//             over the test arena) announces NICK DIAZ, and his big brother
//             barges up through the crowd, hops the fence ("Don't be scared,
//             homie.") and hunts the opponent for `time` seconds at `speed`,
//             cutting them off. Within `lunge` of them he dashes in (`dash`,
//             for up to `dashTime`): first his own charged-up Stockton Slap
//             (wound up for `slapWind`, the tell; `slapDamage`, dizzy
//             `slapDizzy`), then pitter-patter flurries (`flurry` punches of
//             `punch`, one flurry every `flurryEvery`, at most `maxDamage` in
//             all). His shots slip and block like anything thrown, and he
//             misses if they got out of `reach`. Nate keeps fighting.
//             Then Nick hops back out. NICK DIAZ name tag, long hair, full
//             beard, white shorts: he reads as Nick, not a second Nate.
// Iconic finish  (diaz.iconic) a win by rear naked choke gets Bruce Buffer's
//             UFC 196 call on the lower-third (speech.js announce), and
//             against Conor, Joe Rogan's question and "I'm not surprised".
// vs Conor    (diaz.vsConor) UFC 196 and 202 again. He opens with his real
//             callout, answers Conor's trash talk (`lines.answer`%), slaps
//             him more often (`slapEvery`), and `chain196`% of his sub hunts
//             are the real finish: a guillotine that Conor rolls out of into
//             the back take and the rear naked choke (`chainBonus`% deeper).
//             When Conor throws water bottles at his press conference, Nate
//             throws `bottlesBack` right back (the UFC 202 presser). Conor
//             says his real Nate lines more often (CM_LINES.vs, conor.js).
// The slap, the sub hunt's lunge, the surge call and the taunts run on b.nd
// and don't make him untouchable; Nick runs on his own (nickDiaz), so Nate
// is never stuck in his special.
"use strict";

// Registered here rather than in special.js's table, so fighters built in
// parallel don't all edit the same line.
SPECIAL_MOVES.nickdiaz = "Nick Diaz";

var ND_ID = "c-nate-diaz", ND_CONOR = "c-conor-mcgregor";
// His real lines. Swear words are bleeped (speech.js).
var ND_LINES = {
  start: ["I train to kill."],                                              // UFC 196 press conference, 2016
  vsConorStart: ["Conor McGregor, you're taking everything I worked for, [BLEEP]!"], // UFC on Fox 17 octagon interview, Dec 2015
  vsConor: [
    "No one knows what a gazelle is anyway. It's America, [BLEEP]. Get it right.", // Fox Sports, UFC 196 fight week, 2016
    "[BLEEP] you, and [BLEEP] your belt."                                    // UFC 196 press conference, 2016
  ],
  congrats: "Conor, congratulations to you, [BLEEP]. I'm the show.",         // his answer to "you're rich now", UFC 196 presser
  surge: [
    "I'll be here in forty years fighting, still killing.",                  // UFC 241 post-fight press conference, 2019
    "Now we're fighting for the baddest [BLEEP] in the game belt. And that's mine." // same presser
  ],
  win: "I'm not surprised, [BLEEP].",                                        // UFC 196 octagon interview, 2016
  trash: []                                                                  // more real trash talk, no names (filled in as clips are cut)
};
var NICK_LINE = "Don't be scared, homie."; // Nick Diaz to K.J. Noons, EliteXC: Return of the King, 2008
// The commentators' calls on the real UFC 196 finish (diaz.iconic).
var ND_BUFFER = "Ladies and gentlemen... declaring the winner by submission, due to a rear naked choke... Nate Diaz!"; // Bruce Buffer, UFC 196 (trimmed: the time of the stoppage)
var ND_ROGAN = "You just shook up the world. How's that feel?"; // Joe Rogan's first question to him, UFC 196
// Conor's real lines about Nate (UFC 196 press conference, 2016) come out more against him.
if (typeof CM_LINES !== "undefined") CM_LINES.vs[ND_ID] = ["Congratulations. You're rich now.", "He makes gang signs with his right hand and animal balloons with his left."];

var NICK_LOOK = {
  skin: "#e8c0a0", build: "lean", bodyHair: "light", hair: "long", hairColor: "#1f1712",
  beard: "full", beardColor: "#2a1e17", ears: "normal", tattoos: {},
  shorts: "#f2f2f2", trim: "#151515", shortsStyle: "stripe", waistText: "209", waistTextColor: "#151515", gloves: "#151515"
};
var NICK_CH = { name: "Nick", color: "#d9622b", look: NICK_LOOK };
var NICK_R = 36;
var NICK_RUN = 420;      // up through the stands, and back out
var NICK_CLIMB = 0.5;    // over the fence
var NICK_CELEBRATE = 1.6;
var ND_SLAP_SWING = 0.2, ND_SLAP_HIT = 0.06, ND_DASH = 950, ND_DASH_MAX = 0.16; // the slap: dash in after the wind-up, then the swing
var ND_SHOOT = 800, ND_SHOOT_MAX = 0.22; // the sub hunt's shot
var ND_DURABLE_SKIP = { finisher: true, kopunch: true, kofinal: true, slugfest: true }; // scripted finishes keep their numbers
var ND_ORANGE = "#ff8a3d";

var nickDiaz = null;  // Nick while he's in the building
var nickShow = 0;     // the jumbotron announcement
var nickSpeech = null; // his speech bubble
var ndClock = 0;      // drawing clock (game time)

function ndRand(r) { return r[0] + Math.random() * (r[1] - r[0]); }
function ndCfg(b) { return b && b.char && b.char.diaz; }
function ndIs(b, id) { return String(b && b.char && b.char.id || "").indexOf(id) === 0; }
function ndDist(a, b) { var dx = b.x - a.x, dy = b.y - a.y; return Math.sqrt(dx * dx + dy * dy) || 1; }
function ndGap(a, b) { return ndDist(a, b) - a.r - b.r; }
// Against Conor McGregor with his kit (conor.js).
function ndVsConor(self, other) { return !!(other && other.cm && ndIs(other, ND_CONOR) && ndCfg(self) && ndCfg(self).vsConor); }

// From startMatchSeeded.
function resetDiaz() { nickDiaz = null; nickShow = 0; nickSpeech = null; ndClock = 0; }
// From makeBall (after applyWeight, so his normal speed is set).
function initDiaz(b) {
  b.nd = null; b.ndPrint = null;
  var cfg = ndCfg(b);
  if (!cfg) return;
  b.nd = {
    t: 0, slapT: cfg.slap ? ndRand(cfg.slap.first) : Infinity, huntT: cfg.subHunt ? ndRand(cfg.subHunt.first) : Infinity, persist: 0,
    slap: null, reach: null, taunt: null, call: null, throwArm: null, mode: false, modeT: 0,
    opened: false, won: false, winLine: false, iconic: null, conorSeen: null, answerFor: null, answerWait: 0,
    inSub: false, lastSub: null, subSeen: null, dizzySeen: null, bottles: null, bottleFor: null, chinBusy: false
  };
}

// Held by something else: grabbed, slammed, choked, knocked out, dizzy...
function ndHeld(b) {
  return !b.alive || b.grappled || b.grapple || b.slam || b.sprawl || b.sprawled || subLocked(b) || b.koOut || b.koRush ||
    b.shocked || b.dazed || b.dizzy || b.shelled || b.checkStun > 0 || b.koDuel || b.igbb;
}
// The slap, the lunge, the surge call or a taunt: the speed regulator leaves
// him alone (physics.js).
function diazBusy(b) { var m = b && b.nd; return !!(m && (m.slap || m.reach || m.call || m.taunt)); }
// His hands are drawn by drawDiaz (drawHands skips them, draw-attacks.js).
function diazHandsBusy(b) { var m = b && b.nd; return !!(m && b.alive && (m.slap || m.reach || m.call || m.taunt || m.throwArm)); }

function ndCancel(self, m) {
  if (m.slap || m.reach || m.call || m.taunt) { m.slap = null; m.reach = null; m.call = null; m.taunt = null; }
}

// Free to start something, against someone who can be reached.
function ndCanAct(self, other) {
  if (!inOrdinaryMovement(self) || self.punch || self.kick || self.koPunch || specialBusy(self) || swordDuelActive()) return false;
  return other.alive && !other.koOut && !other.invincible && !specialBusy(other);
}
// Someone he can dive on for a submission right now.
function ndSubbable(o) {
  if (!o.alive || o.koOut || o.invincible || o.grappled || o.grapple || o.slam || o.sprawl || o.sprawled || subLocked(o) || o.igbb || o.slamSafe > 0 || o.cheater) return false;
  if (specialBusy(o) || duckDropOn(o) || bearOn(o) || o.bearHeld || tornadoOn(o) || o.torHeld || sendLocOn(o) || hotSauceOn(o) || kameOn(o) || doBronxPosing(o)) return false;
  return inOrdinaryMovement(o) || !!o.dizzy;
}

// ---------------------------------------------------------------- hurt (match.js)

// What his durability takes off what he's hit with, and what his Stockton
// surge adds to what he hits with.
function diazDamageMult(b, source, attackerId) {
  if (source === "laser") return 1;
  var mult = 1, atk = attackerId != null ? balls[attackerId] : null;
  if (atk && atk !== b && atk.nd && atk.nd.mode && !ND_DURABLE_SKIP[source]) mult *= ndCfg(atk).stockton.damage || 1;
  var cfg = ndCfg(b);
  if (b.nd && cfg && cfg.durability && !ND_DURABLE_SKIP[source]) mult *= cfg.durability.take;
  return mult;
}

// A one-punch knockout landing on him: true if his chin eats it (hurt
// returns 0, so the knockout never happens).
function diazIronChin(b, amount, source, attackerId) {
  var m = b.nd, cfg = ndCfg(b), ch = cfg && cfg.chin;
  if (!m || !ch || m.chinBusy || !b.alive || !b.holdAtOne || attackerId == null || attackerId === b.id) return false;
  var atk = balls[attackerId];
  var koShot = source === "kopunch" || source === "kofinal" || (source === "igbb" && atk && atk.char.ngannou);
  if (!koShot || amount * incomingMultiplier(b) < b.hp - 0.01) return false;
  if (Math.random() * 100 >= ch.chance) return false;
  floater(b.x, b.y - b.r - 44, "IRON CHIN!", "crit");
  b.flash = 0.16;
  var dx = b.x - atk.x, dy = b.y - atk.y, d = Math.sqrt(dx * dx + dy * dy) || 1;
  b.squash = { t: 0.16, max: 0.16, nx: -dx / d, ny: -dy / d };
  impacts.push({ x: b.x - dx / d * b.r, y: b.y - dy / d * b.r, nx: -dx / d, ny: -dy / d, life: 0.45, max: 0.45, color: ND_ORANGE });
  hitStop = Math.max(hitStop, 0.12);
  if (!reduceMotion) shake = Math.max(shake, 16);
  playIronChin();
  crowdReact(0.8);
  // It still hurts (never the finish: whoever threw it is holding him at 1).
  // Ngannou's rage punch does its own damage right after.
  if (!atk.char.ngannou && ch.damage > 0) { m.chinBusy = true; hurt(b, ch.damage, "igbb", attackerId); m.chinBusy = false; }
  // Shakes it off: arms out, come on.
  m.slap = null; m.reach = null; m.call = null;
  if (ch.taunt > 0) m.taunt = { t: 0, dur: ch.taunt, kind: "chin" };
  return true;
}

// ---------------------------------------------------------------- every frame

// From update(): the fight clock, the surge's faster hands, lines, the
// rivalry with Conor, and Nick.
function tickDiaz(dt) {
  ndClock += dt;
  if (nickShow > 0) nickShow = Math.max(0, nickShow - dt);
  balls.forEach(function (b) {
    if (b.ndPrint) { b.ndPrint.t -= dt; if (b.ndPrint.t <= 0 || !b.alive) b.ndPrint = null; }
    var m = b.nd, other = balls[1 - b.id], cfg = ndCfg(b);
    if (!m) return;
    if (started && !over && b.alive) m.t += dt;
    if (m.mode) {
      m.modeT += dt;
      // Faster hands, without touching atkRate (frost and cardio rewrite it).
      var st = cfg.stockton;
      if (st.attack > 1 && b.punchCd > 0) b.punchCd = Math.max(0, b.punchCd - dt * (b.atkRate || 1) * (st.attack - 1));
    }
    if (m.throwArm) { m.throwArm.t += dt; if (m.throwArm.t > 0.28) m.throwArm = null; }
    ndSubDefense(b, other, m, cfg);
    ndSubWatch(b, other, m, cfg);
    ndChain196(b, other, m, cfg);
    ndLines(b, other, m, cfg, dt);
    ndBottlesBack(b, other, m, cfg, dt);
  });
  tickNick(dt);
  tickNickSpeech(dt);
}

// A Gracie black belt: `save`% of the holds that would make him tap don't.
function ndSubDefense(b, other, m, cfg) {
  var sd = cfg.subDefense;
  if (!sd || !b.alive) return;
  var hold = null;
  if (other.rnc && other.rnc.vicId === b.id) hold = other.rnc;
  else if (other.armbar && other.armbar.vicId === b.id) hold = other.armbar;
  else if (other.guillo && other.guillo.atkId === b.id && other.guillo.phase === "squeeze") hold = other.guillo;
  if (!hold || hold === m.subSeen) return;
  m.subSeen = hold;
  if (hold.tapChance != null) hold.tapChance *= 1 - sd.save / 100; // (a guillotine's re-sink rolls again)
  if (hold.taps && Math.random() * 100 < sd.save) hold.taps = false;
}

// His own submissions: when one ends without the tap he goes again sooner,
// and deeper.
function ndSubWatch(b, other, m, cfg) {
  var on = !!(b.rnc || b.armbar || (b.guillo && b.guillo.atkId === other.id));
  if (on) { m.inSub = true; m.lastSub = b.rnc ? "rnc" : b.armbar ? "armbar" : "guillotine"; return; }
  if (!m.inSub) return;
  m.inSub = false;
  var sh = cfg.subHunt;
  if (sh && other.alive && b.alive && !over) {
    m.persist = Math.min(sh.persistMax || 0, m.persist + 1);
    m.huntT = Math.min(m.huntT, ndRand(sh.retry));
  }
}

// UFC 196: the guillotine Conor rolls out of, straight into the back take.
function ndChain196(b, other, m, cfg) {
  var g = b.guillo;
  if (!g || !g.ndChain || g.phase !== "squeeze" || g.t < g.dur * 0.88 || !other.alive) return;
  endGuillotine(b);
  b.guilloCd = b.char.guillotine ? b.char.guillotine.cooldown : 0;
  floater(other.x, other.y - other.r - 30, "ROLLS OUT", "note");
  beginRnc(b, other);
  floater(other.x, other.y + other.r + 30, "TAKES THE BACK", "note"); // (under them: REAR NAKED CHOKE goes over)
  b.rnc.taps = Math.random() * 100 < ndTapChance(b, other, m, cfg, cfg.vsConor.chainBonus || 0);
  m.lastSub = "rnc";
  playWhoosh();
}

// "Stockton!" as the slap lands (his real takes, voice-clips.js), unless
// he's in the middle of a line.
var ND_STOCKTON_CLIPS = ["diazStockton", "diazStockton2", "diazStockton3"];
function ndStocktonShout(b) {
  if (typeof SOUND_CLIPS === "undefined" || speaking(b)) return;
  var have = ND_STOCKTON_CLIPS.filter(function (n) { return SOUND_CLIPS[n]; });
  if (have.length) playSpeechClip(have[Math.floor(Math.random() * have.length)]);
}

// The opener, answering Conor, the win line and the iconic call.
function ndLines(b, other, m, cfg, dt) {
  var ln = cfg.lines || {};
  var vsConor = ndVsConor(b, other);
  // He never stops talking: a line of trash talk every `trash` seconds
  // (lines.trash), from ND_LINES.trash plus the opener and the surge lines.
  if (ln.trash && started && !over && b.alive && other.alive && m.opened) {
    if (m.trashT == null) m.trashT = ndRand(ln.trash);
    m.trashT -= dt;
    if (m.trashT <= 0 && canSay(b) && !diazBusy(b)) {
      say(b, pickLine(b, ND_LINES.trash.concat(ND_LINES.start, ND_LINES.surge), "trash"));
      m.trashT = ndRand(ln.trash);
    }
  }
  if (started && !over && b.alive && !m.opened && m.t > 0.5 && canSay(b)) {
    m.opened = true;
    if (vsConor) say(b, pickLine(b, ND_LINES.vsConorStart, "start"));
    else if (Math.random() * 100 < (ln.start || 0)) say(b, pickLine(b, ND_LINES.start, "start"));
  }
  // Conor talks, Nate talks back (after Conor's bubble is done).
  if (vsConor && b.alive && !over) {
    var s = speech[other.id];
    if (s && s.words && s.words !== m.conorSeen) {
      m.conorSeen = s.words;
      if (Math.random() * 100 < (ln.answer || 0)) { m.answerFor = s.words.map(function (w) { return w.text; }).join(" "); m.answerWait = 0; }
    }
    if (m.answerFor) {
      m.answerWait += dt;
      if (!speaking(other) && canSay(b)) {
        say(b, /^Congratulations/.test(m.answerFor) ? ND_LINES.congrats : pickLine(b, ND_LINES.vsConor, "vs"));
        m.answerFor = null;
      } else if (m.answerWait > 4) m.answerFor = null;
    }
  }
  if (over && b.alive && !other.alive && !m.won) {
    m.won = true;
    m.winLine = true;
    var ic = cfg.iconic;
    if (ic && winBy === "submission" && m.lastSub === "rnc") {
      if (ic.buffer) announce(ND_BUFFER, { who: "BUFFER" });
      m.iconic = { rogan: !!(ic.rogan && vsConor), t: 0 };
    }
  }
  // The real order: Buffer reads the result, Rogan asks, Nate answers.
  var iq = m.iconic;
  if (iq) iq.t += dt;
  if (iq && iq.rogan) {
    if (iq.t > 1.2 && !announcer) { announce(ND_ROGAN, { who: "ROGAN" }); iq.rogan = false; iq.asked = true; iq.t = 0; }
    return;
  }
  if (m.winLine && b.alive && !speaking(b) && (!iq || !iq.asked || iq.t > 1.3)) { m.winLine = false; say(b, ND_LINES.win); }
}

// UFC 202 presser: Conor's water bottles come at him, he throws them back.
function ndBottlesBack(b, other, m, cfg, dt) {
  var vc = cfg.vsConor;
  if (!vc || !(vc.bottlesBack > 0) || !ndVsConor(b, other) || !b.alive || over) return;
  if (presserOn(other) && other.igbb.thrown >= 1 && m.bottleFor !== other.igbb) {
    m.bottleFor = other.igbb;
    m.bottles = { left: vc.bottlesBack, next: 0.3 };
    floater(b.x, b.y - b.r - 30, "BOTTLES BACK!", "note");
  }
  var bt = m.bottles;
  if (!bt) return;
  bt.next -= dt;
  if (bt.next > 0) return;
  if (ndHeld(b) || diazBusy(b) || !other.alive) { bt.next = 0.15; return; }
  var tx = other.x, ty = other.y, dx = tx - b.x, dy = ty - b.y, d = Math.sqrt(dx * dx + dy * dy) || 1;
  projectiles.push({
    x: b.x + dx / d * (b.r + 8), y: b.y + dy / d * (b.r + 8), vx: dx / d * vc.bottleSpeed, vy: dy / d * vc.bottleSpeed,
    r: 15, damage: vc.bottleDamage, color: "#bfe6ff", imgData: cmBottleImg(), aspect: 20 / 48,
    spin: (Math.random() < 0.5 ? -1 : 1) * (9 + Math.random() * 5), angle: Math.random() * 6, gem: false, ownerId: b.id
  });
  m.throwArm = { t: 0, ang: Math.atan2(dy, dx) };
  playBottleThrow();
  bt.left--;
  bt.next = 0.32;
  if (bt.left <= 0) m.bottles = null;
}

// ---------------------------------------------------------------- the abilities loop

// From the abilities loop, before the special. True while the slap, the
// lunge, the surge call or a taunt is running.
function updateDiaz(self, other, dt) {
  var m = self.nd;
  if (!m) return false;
  var cfg = ndCfg(self);
  if (ndHeld(self)) { ndCancel(self, m); return false; }
  if (!started || over || !other.alive) { ndCancel(self, m); return false; }
  if (m.call) return ndRunCall(self, other, m, cfg, dt);
  if (m.slap) return ndRunSlap(self, other, m, cfg, dt);
  if (m.reach) return ndRunReach(self, other, m, cfg, dt);
  if (m.taunt) return ndRunTaunt(self, other, m, dt);
  m.slapT -= dt; m.huntT -= dt;
  if (!ndCanAct(self, other)) return false;
  var gap = ndGap(self, other);
  // The surge, late in the fight.
  var st = cfg.stockton;
  if (st && !m.mode && canSay(self) && (m.t >= st.after || (m.t >= st.minT && self.hp < MAX_HP * st.orBelow))) {
    m.call = { t: 0, phase: "call" };
    self.vx = 0; self.vy = 0;
    say(self, pickLine(self, ND_LINES.surge, "surge"));
    playSurgeCall();
    return true;
  }
  var sh = cfg.subHunt;
  if (sh) {
    // Dizzy in front of him: the back is right there.
    if (other.dizzy && other.dizzy !== m.dizzySeen) {
      m.dizzySeen = other.dizzy;
      if (gap <= sh.range * 3 && ndSubbable(other) && Math.random() * 100 < sh.onDizzy) { startReach(self, other, m); return true; }
    }
    if (m.huntT <= 0 && gap <= sh.range && ndSubbable(other)) { startReach(self, other, m); return true; }
  }
  if (cfg.slap && m.slapT <= 0 && gap <= cfg.slap.range) { startSlap(self, other, m, false); return true; }
  return false;
}

// ---------------------------------------------------------------- the Stockton Slap

function startSlap(self, other, m, power) {
  self.punch = null; self.jabAnim = null;
  m.slap = { phase: "wind", t: 0, power: !!power, ang: Math.atan2(other.y - self.y, other.x - self.x), side: Math.random() < 0.5 ? -1 : 1, landed: false };
  self.vx = 0; self.vy = 0;
}

function ndRunSlap(self, other, m, cfg, dt) {
  var s = m.slap, sc = cfg.slap;
  s.t += dt;
  var dx = other.x - self.x, dy = other.y - self.y, d = Math.sqrt(dx * dx + dy * dy) || 1;
  if (s.phase === "wind") {
    s.ang = Math.atan2(dy, dx);
    self.vx = 0; self.vy = 0;
    if (s.t < sc.windup * (s.power ? 1.35 : 1)) return true;
    s.phase = "dash"; s.t = 0;
    playWhoosh();
  }
  if (s.phase === "dash") {
    // Steps in behind it: closes the gap fast, then the glove comes round.
    s.ang = Math.atan2(dy, dx);
    if (d - self.r - other.r > 6 && s.t < ND_DASH_MAX) { self.vx = dx / d * ND_DASH; self.vy = dy / d * ND_DASH; return true; }
    s.phase = "swing"; s.t = 0;
    self.vx *= 0.25; self.vy *= 0.25; // plants to swing (doesn't bowl them out of reach)
  }
  if (!s.hit && s.t >= ND_SLAP_HIT) {
    s.hit = true;
    self.vx *= 0.3; self.vy *= 0.3;
    if (d - self.r - other.r > sc.reach || !other.alive || other.koOut) floater(other.x, other.y - other.r - 8, "WHIFF", "dodge");
    else {
      var st = cfg.stockton;
      var dealt = hurt(other, s.power ? st.slapDamage : sc.damage, s.power ? "igbb" : "punch", self.id); // the surge's slap can't be slipped or blocked
      if (dealt > 0) { s.landed = true; slapLanded(self, other, s.power ? st.slapDizzy : sc.dizzy, s.power, sc.knockback, s.side); ndStocktonShout(self); }
      checkEnd();
    }
  }
  if (s.t < ND_SLAP_SWING) return true;
  m.slap = null;
  var vsC = ndVsConor(self, other);
  m.slapT = ndRand(m.mode ? cfg.stockton.slapEvery : vsC ? cfg.vsConor.slapEvery : sc.every);
  if (s.power) startSurge(self, m, cfg);
  else if (s.landed && Math.random() * 100 < (sc.tauntAfter || 0)) { m.taunt = { t: 0, dur: sc.taunt, kind: "slap" }; return true; }
  if (self.alive && inOrdinaryMovement(self)) setSpeed(self, self.baseSpeed || SPEED);
  return false;
}

// The open glove landing: the crack, the handprint, the stars.
function slapLanded(by, vic, dizzy, power, knockback, side) {
  var dx = vic.x - by.x, dy = vic.y - by.y, d = Math.sqrt(dx * dx + dy * dy) || 1, ux = dx / d, uy = dy / d;
  // Over "DIZZY" (makeDizzy puts it at -44), or under them up by the top edge.
  var fy = vic.y - vic.r - 70;
  floater(vic.x, fy < 40 ? vic.y + vic.r + 36 : fy, power ? "STOCKTON SLAP!!" : "STOCKTON SLAP!", "crit");
  vic.ndPrint = { t: 1.8, max: 1.8, ang: Math.atan2(uy, ux), side: side || 1 };
  vic.flash = 0.16;
  vic.squash = { t: 0.12, max: 0.12, nx: -ux, ny: -uy };
  var cx = vic.x - ux * vic.r * 0.85, cy = vic.y - uy * vic.r * 0.85 - vic.r * 0.3;
  impacts.push({ x: cx, y: cy, nx: -ux, ny: -uy, life: 0.4, max: 0.4, color: "#ff5a4a" });
  hitStop = Math.max(hitStop, power ? 0.1 : 0.05);
  if (!reduceMotion) {
    shake = Math.max(shake, power ? 16 : 9);
    for (var i = 0; i < (power ? 18 : 10); i++) {
      var a = Math.atan2(-uy, -ux) + (Math.random() - 0.5) * 2.4, sp = 120 + Math.random() * 260;
      particles.push({ x: cx, y: cy, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 0.3, max: 0.3, size: 2 + Math.random() * 2.5, color: i % 2 ? "#ffffff" : "#ffb3a8" });
    }
  }
  playStocktonSlap(power);
  crowdReact(power ? 0.9 : 0.4);
  if (vic.alive && !vic.koOut && (inOrdinaryMovement(vic) || vic.dizzy)) {
    makeDizzy(vic, dizzy);
    if (knockback > 0 && !vic.justDodged) { vic.vx += ux * knockback * 0.4; vic.vy += uy * knockback * 0.4; }
  }
}

// ---------------------------------------------------------------- the sub hunt

function startReach(self, other, m) {
  self.punch = null; self.jabAnim = null;
  m.reach = { phase: "set", t: 0, ang: Math.atan2(other.y - self.y, other.x - self.x) };
  self.vx = 0; self.vy = 0;
}

function ndRunReach(self, other, m, cfg, dt) {
  var r = m.reach, sh = cfg.subHunt;
  r.t += dt;
  var dx = other.x - self.x, dy = other.y - self.y, d = Math.sqrt(dx * dx + dy * dy) || 1, ux = dx / d, uy = dy / d;
  var gap = d - self.r - other.r;
  r.ang = Math.atan2(dy, dx);
  if (r.phase === "set") {
    // The level change: he sinks down, arms out (the tell).
    self.vx = 0; self.vy = 0;
    if (r.t < sh.reach) return true;
    r.phase = "shoot"; r.t = 0;
    playSubReach();
  }
  if (gap > 4 && r.t < ND_SHOOT_MAX) { self.vx = ux * ND_SHOOT; self.vy = uy * ND_SHOOT; return true; }
  self.vx = 0; self.vy = 0;
  m.reach = null;
  m.huntT = ndRand(sh.every);
  if (!ndSubbable(other) || gap > 12) { if (gap > 12) floater(other.x, other.y - other.r - 8, "WHIFF", "dodge"); endReach(self); return false; }
  if (Math.random() * 100 < ndEscape(self, other, m, sh)) {
    floater(other.x, other.y - other.r - 30, "DEFENDED", "note");
    other.vx += ux * 260; other.vy += uy * 260;
    self.vx = -ux * 220; self.vy = -uy * 220;
    m.persist = Math.min(sh.persistMax || 0, m.persist + 1);
    m.huntT = ndRand(sh.retry);
    playWhoosh();
    return false;
  }
  beginNdSub(self, other, m, cfg);
  return false;
}
function endReach(self) { if (self.alive && inOrdinaryMovement(self)) setSpeed(self, self.baseSpeed || SPEED); }

// How often they fight it off.
function ndEscape(self, other, m, sh) {
  if (other.dizzy) return sh.escapeDizzy;
  var esc = sh.escape;
  if (other.char.hasGrapple) esc += sh.grapplerEscape || 0;
  if (other.char.hasWeave) esc += sh.weaveEscape || 0;
  if (other.char.tdd && other.char.tdd.sprawlChance) esc += other.char.tdd.sprawlChance * 0.25;
  if (m.mode) esc -= 10;
  return Math.max(5, Math.min(90, esc));
}

// How likely the hold he gets is to make them tap.
function ndTapChance(self, other, m, cfg, extra) {
  var sh = cfg.subHunt, hurtFrac = 1 - Math.max(0, Math.min(1, other.hp / MAX_HP));
  var c = sh.tapBase + sh.tapLowHp * hurtFrac + m.persist * (sh.persist || 0) + (m.mode ? cfg.stockton.tapBonus || 0 : 0) + (extra || 0);
  return conorTapChance(other, Math.min(95, c), sh); // Conor taps easier, more once he's gassed (conor.js)
}

function beginNdSub(self, other, m, cfg) {
  var sh = cfg.subHunt, vc = cfg.vsConor;
  var kind = null;
  if (ndVsConor(self, other) && Math.random() * 100 < (vc.chain196 || 0)) kind = "chain";
  else {
    var w = sh.subs || { rnc: 1 }, keys = Object.keys(w), tot = 0, roll;
    keys.forEach(function (k) { tot += w[k]; });
    roll = Math.random() * tot;
    for (var i = 0; i < keys.length; i++) { roll -= w[keys[i]]; if (roll < 0) { kind = keys[i]; break; } }
    kind = kind || keys[0];
  }
  var tap = Math.random() * 100 < ndTapChance(self, other, m, cfg, 0);
  if (kind === "rnc") {
    beginRnc(self, other);
    self.rnc.taps = tap;
    m.lastSub = "rnc";
  } else if (kind === "armbar") {
    beginArmbar(self, other);
    self.armbar.taps = tap;
    m.lastSub = "armbar";
  } else {
    beginGuillotine(self, other);
    var g = self.guillo;
    g.tapChance = ndTapChance(self, other, m, cfg, 0);
    g.taps = kind === "chain" ? false : tap;
    if (kind === "chain") g.ndChain = true;
    m.lastSub = "guillotine";
  }
  m.inSub = true;
  crowdReact(0.5);
}

// ---------------------------------------------------------------- the Stockton surge

// The line: he stops, arms out, while it comes in (the tell). Then he walks
// them down into a big slap.
function ndRunCall(self, other, m, cfg, dt) {
  var c = m.call, st = cfg.stockton;
  c.t += dt;
  if (c.phase === "call") {
    self.vx = 0; self.vy = 0;
    if (c.t >= st.call) { c.phase = "stalk"; c.t = 0; }
    return true;
  }
  var dx = other.x - self.x, dy = other.y - self.y, d = Math.sqrt(dx * dx + dy * dy) || 1;
  if (d - self.r - other.r <= cfg.slap.range) { m.call = null; startSlap(self, other, m, true); return true; }
  if (c.t >= st.approach || !ndCanReach(other)) { m.call = null; startSurge(self, m, cfg); endReach(self); return false; }
  var sp = (self.baseSpeed || SPEED) * 1.25;
  self.vx = dx / d * sp; self.vy = dy / d * sp;
  return true;
}
function ndCanReach(o) { return o.alive && !o.koOut && !o.invincible && !specialBusy(o); }

function startSurge(self, m, cfg) {
  if (m.mode) return;
  var st = cfg.stockton;
  m.mode = true; m.modeT = 0;
  self.baseSpeed = (self.baseSpeed || SPEED) * (st.speed || 1);
  floater(self.x, self.y - self.r - 50, "STOCKTON!", "crit");
  playStocktonSurge();
  crowdReact(1);
  if (self.alive && inOrdinaryMovement(self)) setSpeed(self, self.baseSpeed);
}

// Arms out, come on: after eating a bomb, or now and then after a slap.
function ndRunTaunt(self, other, m, dt) {
  m.taunt.t += dt;
  self.vx = 0; self.vy = 0;
  if (m.taunt.t < m.taunt.dur) return true;
  m.taunt = null;
  endReach(self);
  return false;
}

// ---------------------------------------------------------------- Nick Diaz (the special)

// From updateSpecial (special.js) for special.move "nickdiaz". Never holds
// Nate: he keeps fighting while his brother's in.
function updateNickDiaz(self, other, dt) {
  var sp = self.char.special;
  if (nickDiaz) { if (nickDiaz.ownerId === self.id) self.specialT = 0; return false; }
  if (self.specialT < sp.chargeTime || !started || over || !other.alive || !canStartIgbb(self, other) || swordDuelActive()) return false;
  self.specialT = 0;
  var stadium = stadiumOn();
  var x0 = Math.min(W - 70, Math.max(70, other.x + (Math.random() - 0.5) * 120));
  nickDiaz = { ownerId: self.id, x: x0, y: ndFenceY() + (stadium ? 160 : NICK_R * 2.4), phase: "run", t: 0, climb: 0,
    fightT: 0, atk: null, atkCd: 0, punchSide: 1, punchAnim: 0, slapDone: false, dealt: 0, flip: 1, celebrate: 0 };
  nickShow = sp.announce;
  floater(self.x, self.y - self.r - 30, "NICK DIAZ!", "crit");
  playNickEntrance();
  crowdReact(0.9);
  return false;
}

// The fence along the bottom of the cage, and either side of it.
function ndFenceY() { return stadiumOn() ? H + ST.CAGE / 2 * W / ST.A : H; }
function ndOutY() { return ndFenceY() + NICK_R + 6; }
function ndInY() { return H - NICK_R - 4; }

function tickNick(dt) {
  var n = nickDiaz;
  if (!n) return;
  n.t += dt;
  var owner = balls[n.ownerId], vic = balls[1 - n.ownerId], sp = owner.char.special;
  if (owner.alive && !over) owner.specialT = 0;
  if (n.punchAnim > 0) n.punchAnim = Math.max(0, n.punchAnim - dt);
  if (n.phase === "run") {
    n.y -= NICK_RUN * dt;
    if (n.y <= ndOutY()) { n.y = ndOutY(); n.phase = "climb"; n.climb = 0; }
    return;
  }
  if (n.phase === "climb" || n.phase === "climbOut") {
    var inward = n.phase === "climb";
    n.climb = Math.max(0, Math.min(1, n.climb + (inward ? 1 : -1) * dt / NICK_CLIMB));
    var e = n.climb * n.climb * (3 - 2 * n.climb);
    n.y = ndOutY() + (ndInY() - ndOutY()) * e;
    if (inward && n.climb >= 1) {
      n.phase = "fight"; n.fightT = 0;
      nickSay(NICK_LINE);
      crowdReact(0.7);
      if (!reduceMotion) shake = Math.max(shake, 6);
    } else if (!inward && n.climb <= 0) { n.phase = "exit"; n.t = 0; }
    return;
  }
  if (n.phase === "exit") {
    n.y += NICK_RUN * dt;
    if (n.y > ndOutY() + (stadiumOn() ? 260 : NICK_R * 3)) nickDiaz = null;
    return;
  }
  if (n.phase === "celebrate") {
    n.celebrate += dt;
    if (n.celebrate >= NICK_CELEBRATE) { n.phase = "leave"; n.t = 0; }
    return;
  }
  if (n.phase === "leave") {
    // Back to the fence, then over it.
    var ly = ndInY(), lk = Math.min(1, dt * 4);
    n.y += (ly - n.y) * lk;
    if (Math.abs(n.y - ly) < 3) { n.phase = "climbOut"; n.climb = 1; }
    return;
  }
  // In the fight.
  n.fightT += dt;
  if (over) { n.atk = null; n.phase = owner.alive && !vic.alive ? "celebrate" : "leave"; n.celebrate = 0; n.t = 0; return; }
  if (n.fightT >= sp.time || !owner.alive) { n.atk = null; n.phase = "leave"; n.t = 0; return; }
  if (n.atkCd > 0) n.atkCd -= dt;
  var dx = vic.x - n.x, dy = vic.y - n.y, d = Math.sqrt(dx * dx + dy * dy) || 1, ux = dx / d, uy = dy / d;
  var gap = d - NICK_R - vic.r, hittable = nickCanHit(vic);
  n.flip = dx >= 0 ? 1 : -1;
  var a = n.atk;
  if (a && !hittable && a.phase !== "hit") { n.atk = a = null; n.atkCd = 0.3; }
  if (!a) {
    // Walking them down: cutting them off where they're heading (or hanging
    // back with his arms out while they're tied up).
    if (hittable) {
      var lx = vic.x + vic.vx * 0.3 - n.x, ly = vic.y + vic.vy * 0.3 - n.y, ld = Math.sqrt(lx * lx + ly * ly) || 1;
      if (gap > 4) { n.x += lx / ld * sp.speed * dt; n.y += ly / ld * sp.speed * dt; }
      if (gap <= sp.lunge && n.atkCd <= 0 && n.dealt < sp.maxDamage) {
        n.atk = a = { kind: n.slapDone ? "flurry" : "slap", phase: n.slapDone ? "dash" : "wind", t: 0, hits: 0 };
        if (a.phase === "dash") playWhoosh();
      }
    } else if (gap < 60) { n.x -= ux * sp.speed * 0.5 * dt; n.y -= uy * sp.speed * 0.5 * dt; }
  }
  if (a) {
    a.t += dt;
    if (a.phase === "wind") {
      // His own Stockton Slap, charged up a long time (he made Condit wait for it).
      if (a.t >= sp.slapWind) { a.phase = "dash"; a.t = 0; playWhoosh(); }
    } else if (a.phase === "dash") {
      if (gap > 4 && a.t < sp.dashTime) { n.x += ux * sp.dash * dt; n.y += uy * sp.dash * dt; }
      else { a.phase = "hit"; a.t = 0; a.whiff = gap > sp.reach; if (a.whiff) floater(vic.x, vic.y - vic.r - 8, "WHIFF", "dodge"); }
    } else {
      if (a.kind === "slap" && !a.whiff && a.hits === 0) {
        a.hits = 1;
        var dealt = hurt(vic, sp.slapDamage, "throw", owner.id); // slips and blocks like anything thrown
        if (dealt > 0) { n.dealt += dealt; floater(vic.x, vic.y - vic.r - 54, "ORIGINAL STOCKTON SLAP!", "crit"); slapLanded({ x: n.x, y: n.y }, vic, sp.slapDizzy, false, 0, n.flip); }
        checkEnd();
      } else if (a.kind === "flurry" && !a.whiff && a.hits < sp.flurry && a.t >= a.hits * 0.09) {
        a.hits++;
        n.punchSide = -n.punchSide; n.punchAnim = 0.12;
        if (gap <= sp.reach + 6) {
          var got = hurt(vic, sp.punch, "throw", owner.id);
          if (got > 0) { n.dealt += got; playPunch(got * 2); vic.flash = 0.1; if (!vic.justDodged && inOrdinaryMovement(vic)) { vic.vx += ux * 60; vic.vy += uy * 60; } }
          checkEnd();
        }
      }
      if (a.t >= (a.kind === "slap" ? 0.25 : sp.flurry * 0.09 + 0.12)) {
        if (a.kind === "slap") n.slapDone = true;
        n.atk = null; n.atkCd = a.kind === "slap" ? 0.45 : sp.flurryEvery;
      }
    }
  }
  n.x = Math.max(NICK_R + 2, Math.min(W - NICK_R - 2, n.x));
  n.y = Math.max(NICK_R + 2, Math.min(H - NICK_R - 2, n.y));
}
function nickCanHit(o) {
  return o.alive && !o.koOut && !o.invincible && !o.grappled && !o.grapple && !subLocked(o) && !o.slam && !o.igbb && !specialBusy(o) &&
    !duckDropOn(o) && !bearOn(o) && !tornadoOn(o) && !sendLocOn(o) && !swordDuelActive();
}

// Nick's speech bubble (he isn't one of the two fighters, so speech.js's
// bubbles don't track him; this draws with the same bubble).
function nickSay(text) {
  var words = splitSpeech(text);
  nickSpeech = { words: words, t: 0, said: 0, dur: words.length * SPEECH_WORD + SPEECH_READ + words.length * 0.12 };
}
function tickNickSpeech(dt) {
  var s = nickSpeech;
  if (!s) return;
  s.t += dt;
  var n = Math.min(s.words.length, Math.floor(s.t / SPEECH_WORD) + 1);
  while (s.said < n) { if (s.words[s.said].bleep) playBleep(); s.said++; }
  if (s.t >= s.dur || !nickDiaz) nickSpeech = null;
}

// ---------------------------------------------------------------- drawing

// From draw(), with the other body poses: leaning back into the slap and
// through it, the level change for the sub hunt, chest out for the taunt.
function applyDiazPose(b) {
  var m = b.nd;
  if (!m || !b.alive) return;
  var ay = b.y + b.r;
  if (m.slap) {
    var s = m.slap, dir = Math.cos(s.ang) >= 0 ? 1 : -1;
    var lean = s.phase === "wind" ? -0.14 * Math.min(1, s.t / 0.15) * dir : s.phase === "dash" ? 0.16 * dir : 0.16 * Math.max(0, 1 - s.t / ND_SLAP_SWING) * dir;
    ctx.translate(b.x, ay); ctx.rotate(lean); ctx.translate(-b.x, -ay);
    return;
  }
  if (m.reach) {
    var k = m.reach.phase === "set" ? Math.min(1, m.reach.t / 0.1) : 1;
    ctx.translate(b.x, ay); ctx.scale(1 + 0.12 * k, 1 - 0.16 * k); ctx.translate(-b.x, -ay);
    return;
  }
  if (m.taunt || (m.call && m.call.phase === "call")) {
    var t = m.taunt ? m.taunt.t : m.call.t, rock = Math.sin(t * 9) * 0.06;
    ctx.translate(b.x, ay); ctx.rotate(rock); ctx.scale(1.03, 1); ctx.translate(-b.x, -ay);
  }
}

// From draw(), per fighter, after its hands: a handprint on whoever's been
// slapped; his arms for the slap, the lunge and the taunt; the surge.
function drawDiaz(b) {
  if (!b.alive) return;
  if (b.ndPrint) drawHandprint(b);
  var m = b.nd;
  if (!m) return;
  var other = balls[1 - b.id];
  if (m.mode) drawSurge(b, other, m);
  if (m.slap) drawSlapArms(b, other, m.slap);
  else if (m.reach) drawReachArms(b, m.reach);
  else if (m.taunt || m.call) drawArmsOut(b, m.taunt ? m.taunt.t : m.call.t, !!m.call);
  else if (m.throwArm) drawThrowArms(b, m.throwArm);
}

function ndArm(b, side, sx, sy, hx, hy, ang, size) {
  strokeLimb(size * 0.68, armColor(b.char, side), function () { ctx.moveTo(sx, sy); ctx.lineTo(hx, hy); });
  drawGloveAt(hx, hy, size * 0.85, b.char, ang);
}

// The Diaz: hands down, arms out wide, come on.
function drawArmsOut(b, t, glow) {
  var r = b.r, size = b.char.punch.size || 14;
  ctx.save();
  [-1, 1].forEach(function (s) {
    var wave = Math.sin(t * 9 + (s > 0 ? 0 : 1.4)) * 0.12;
    var sx = b.x + s * r * 0.7, sy = b.y - r * 0.05;
    var hx = b.x + s * r * 1.55, hy = b.y + r * (0.18 + wave);
    ndArm(b, s, sx, sy, hx, hy, s > 0 ? 0.25 : Math.PI - 0.25, size);
    if (glow) {
      var p = 0.5 + 0.5 * Math.sin(ndClock * 18);
      ctx.globalAlpha = 0.35 + 0.4 * p; ctx.strokeStyle = ND_ORANGE; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(hx, hy, size * (1.3 + 0.2 * p), 0, Math.PI * 2); ctx.stroke();
      ctx.globalAlpha = 1;
    }
  });
  ctx.restore();
}

// Wind-up: arms out, the slapping glove cocked back wide (trembling for the
// big one). Swing: it sweeps round into their head with a swoosh behind it.
function drawSlapArms(b, other, s) {
  var r = b.r, size = b.char.punch.size || 14, aim = s.ang, side = s.side;
  var ux = Math.cos(aim), uy = Math.sin(aim), px = -uy, py = ux;
  ctx.save();
  // the other hand, low and out (hands down)
  var ox = b.x - px * side * r * 1.2 + ux * r * 0.2, oy = b.y - py * side * r * 1.2 + uy * r * 0.2 + r * 0.25;
  ndArm(b, -side, b.x - px * side * r * 0.55, b.y - py * side * r * 0.55, ox, oy, aim, size);
  var back = aim + side * 2.2, front = aim - side * 0.55, ang, len;
  if (s.phase === "wind" || s.phase === "dash") {
    var k = s.phase === "dash" ? 1 : Math.min(1, s.t / 0.16), tr = s.power && s.phase === "wind" ? Math.sin(ndClock * 70) * 0.05 : 0;
    ang = aim + side * (0.9 + 1.3 * k) + tr; len = r * 1.45;
  } else {
    var u = Math.min(1, s.t / ND_SLAP_HIT), f = Math.max(0, (s.t - ND_SLAP_HIT) / (ND_SLAP_SWING - ND_SLAP_HIT));
    ang = u < 1 ? back + (aim - back) * u : aim + (front - aim) * f;
    len = Math.min(r * 1.75, Math.max(r * 1.2, ndDist(b, other) - other.r * 0.4));
    // the swoosh
    ctx.globalAlpha = 0.6 * (1 - f); ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 4; ctx.lineCap = "round";
    ctx.beginPath(); ctx.arc(b.x, b.y, len, Math.min(back, ang), Math.max(back, ang)); ctx.stroke();
    ctx.globalAlpha = 1;
  }
  var hx = b.x + Math.cos(ang) * len, hy = b.y + Math.sin(ang) * len;
  strokeLimb(size * 0.68, armColor(b.char, side), function () { ctx.moveTo(b.x + px * side * r * 0.55, b.y + py * side * r * 0.55); ctx.lineTo(hx, hy); });
  drawOpenGlove(hx, hy, ang, size, b.char.look ? b.char.look.gloves : b.char.color);
  if (s.phase === "dash") {
    ctx.globalAlpha = 0.5; ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 3; ctx.lineCap = "round";
    [-1, 0, 1].forEach(function (o) {
      ctx.beginPath(); ctx.moveTo(b.x - ux * r * 1.2 + px * o * 10, b.y - uy * r * 1.2 + py * o * 10); ctx.lineTo(b.x - ux * r * 2.1 + px * o * 10, b.y - uy * r * 2.1 + py * o * 10); ctx.stroke();
    });
    ctx.globalAlpha = 1;
  }
  if (s.phase === "wind") {
    var pulse = 0.5 + 0.5 * Math.sin(ndClock * 24);
    ctx.globalAlpha = 0.4 + 0.4 * pulse; ctx.strokeStyle = s.power ? ND_ORANGE : "#ffffff"; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(hx, hy, size * (1.5 + 0.2 * pulse), 0, Math.PI * 2); ctx.stroke();
  }
  ctx.restore();
}

// The slapping hand: an open glove, flat and wide, fingers together.
function drawOpenGlove(x, y, ang, size, col) {
  ctx.save();
  ctx.translate(x, y); ctx.rotate(ang);
  ctx.fillStyle = col; ctx.strokeStyle = theme.wall; ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.ellipse(size * 0.35, 0, size * 1.05, size * 0.72, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  // the thumb, and the lines between the fingers
  ctx.beginPath(); ctx.ellipse(-size * 0.1, -size * 0.62, size * 0.38, size * 0.2, -0.5, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.strokeStyle = "rgba(255,255,255,0.35)"; ctx.lineWidth = 1.5;
  [-0.3, 0, 0.3].forEach(function (f) { ctx.beginPath(); ctx.moveTo(size * 0.75, f * size); ctx.lineTo(size * 1.3, f * size * 1.1); ctx.stroke(); });
  ctx.restore();
}

// Diving in for the neck: both arms reaching out.
function drawReachArms(b, rch) {
  var r = b.r, size = b.char.punch.size || 14, ux = Math.cos(rch.ang), uy = Math.sin(rch.ang), px = -uy, py = ux;
  var k = rch.phase === "set" ? 0.25 * Math.min(1, rch.t / 0.1) : Math.min(1, 0.25 + rch.t / 0.12);
  ctx.save();
  [-1, 1].forEach(function (s) {
    var hx = b.x + ux * r * (1.1 + 0.55 * k) + px * s * r * (0.55 - 0.25 * k), hy = b.y + uy * r * (1.1 + 0.55 * k) + py * s * r * (0.55 - 0.25 * k);
    ndArm(b, s, b.x + px * s * r * 0.6, b.y + py * s * r * 0.6, hx, hy, rch.ang, size);
  });
  ctx.restore();
}

// Throwing a bottle back at Conor.
function drawThrowArms(b, ta) {
  var r = b.r, size = b.char.punch.size || 14, ux = Math.cos(ta.ang), uy = Math.sin(ta.ang);
  var k = Math.min(1, ta.t / 0.12), reach = r * (0.7 + 0.9 * k);
  ctx.save();
  ndArm(b, 1, b.x + r * 0.6, b.y - r * 0.1, b.x + ux * reach, b.y + uy * reach, ta.ang, size);
  ndArm(b, -1, b.x - r * 0.6, b.y - r * 0.1, b.x - r * 0.75, b.y + r * 0.35, Math.PI / 2, size);
  ctx.restore();
}

// A red handprint on the side of their head, fading.
function drawHandprint(b) {
  var p = b.ndPrint, a = Math.max(0, Math.min(1, p.t / 0.6)) * 0.62, r = b.r;
  var ux = Math.cos(p.ang), uy = Math.sin(p.ang);
  var cx = b.x - ux * r * 0.38, cy = b.y - r * 0.42 - uy * r * 0.15;
  ctx.save();
  ctx.beginPath(); ctx.arc(b.x, b.y, r, 0, Math.PI * 2); ctx.clip();
  ctx.translate(cx, cy); ctx.rotate(p.ang + Math.PI / 2 + p.side * 0.45);
  ctx.globalAlpha = a; ctx.fillStyle = "#d8262c";
  ctx.beginPath(); ctx.ellipse(0, r * 0.06, r * 0.17, r * 0.19, 0, 0, Math.PI * 2); ctx.fill();
  [-0.6, -0.2, 0.2, 0.55].forEach(function (f, i) {
    var len = r * (i === 3 ? 0.15 : 0.19);
    ctx.save(); ctx.translate(f * r * 0.24, -r * 0.1); ctx.rotate(f * 0.35);
    ctx.beginPath(); ctx.ellipse(0, -len * 0.75, r * 0.05, len, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  });
  ctx.save(); ctx.translate(r * 0.17, r * 0.12); ctx.rotate(1.0);
  ctx.beginPath(); ctx.ellipse(0, -r * 0.08, r * 0.045, r * 0.11, 0, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  ctx.restore();
}

// The surge: an orange ring round him and a 209 tag by his health bar.
function drawSurge(b, other, m) {
  var p = 0.5 + 0.5 * Math.sin(ndClock * 6);
  ctx.save();
  ctx.globalAlpha = 0.25 + 0.25 * p; ctx.strokeStyle = ND_ORANGE; ctx.lineWidth = 3.5;
  ctx.beginPath(); ctx.arc(b.x, b.y, b.r + 5 + 2 * p, 0, Math.PI * 2); ctx.stroke();
  var pinned = other.grapple && other.grapple.finisher && other.grapple.phase !== "carry" || other.rnc;
  if (!pinned) {
    var by = b.y - b.r - 18;
    if (by < 4) by = b.y + b.r + 10;
    var tx = b.x + 32 + 4, ty = by - 3;
    ctx.globalAlpha = 1;
    ctx.fillStyle = ND_ORANGE; ctx.strokeStyle = theme.wall; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.roundRect(tx, ty, 30, 14, 4); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#151515"; ctx.font = "900 12px Impact, 'Arial Black', sans-serif";
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText("209", tx + 15, ty + 7.5);
  }
  ctx.restore();
}

// From draw(), over the fighters: Nick, his bubble, and the NICK DIAZ banner
// in the test arena.
function drawDiazOver() {
  var n = nickDiaz;
  if (n) drawNick(n);
  if (n && nickSpeech) drawNickSpeech(n);
  if (nickShow > 0 && !stadiumOn()) {
    var low = (balls[0].y + balls[1].y) / 2 < H / 2;
    drawNickJumbo(10, low ? H - 120 : 10, W - 20, 110);
  }
}

function drawNick(n) {
  var vic = balls[1 - n.ownerId], sp = balls[n.ownerId].char.special, r = NICK_R;
  var running = n.phase === "run" || n.phase === "exit" || n.phase === "leave";
  var bob = Math.abs(Math.sin(ndClock * (running ? 14 : 7))) * (running ? 5 : 2);
  var lift = (n.phase === "climb" || n.phase === "climbOut") ? Math.sin(n.climb * Math.PI) : 0;
  ctx.save();
  ctx.fillStyle = "rgba(0,0,0,0.16)";
  ctx.beginPath(); ctx.ellipse(n.x + r * 0.15, n.y + r * 0.92, r * 0.9, r * 0.28, 0, 0, Math.PI * 2); ctx.fill();
  ctx.translate(n.x, n.y - bob - lift * r * 0.35);
  var sc = 1 + lift * 0.18;
  ctx.scale(sc, sc);
  // his arms, under the gloves he's throwing
  var fighting = n.phase === "fight";
  if (fighting || n.phase === "celebrate") drawNickArms(n, vic, sp, r);
  drawFighterArt(ctx, 0, 0, r, NICK_LOOK, theme.wall, { layout: "contained", name: "nick diaz" });
  ctx.lineWidth = 3; ctx.strokeStyle = theme.wall;
  ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.stroke();
  if (fighting && n.atk && n.atk.kind === "slap" && n.atk.phase !== "hit") {
    var pulse = 0.5 + 0.5 * Math.sin(ndClock * 22);
    ctx.globalAlpha = 0.45 + 0.4 * pulse; ctx.strokeStyle = ND_ORANGE; ctx.lineWidth = 3.5;
    ctx.beginPath(); ctx.arc(0, 0, r + 5 + 3 * pulse, 0, Math.PI * 2); ctx.stroke();
    ctx.globalAlpha = 1;
  }
  // climbing: hands on the rail
  if (lift > 0) {
    var ry = ndFenceY() - n.y + bob + lift * r * 0.35;
    ctx.fillStyle = NICK_LOOK.gloves; ctx.strokeStyle = theme.wall; ctx.lineWidth = 2;
    [-1, 1].forEach(function (s) { ctx.beginPath(); ctx.arc(s * r * 0.8, ry / sc, r * 0.22, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); });
  }
  ctx.restore();
  // the name tag over his head
  var ty = n.y - r - 20 - bob - lift * r * 0.35;
  ctx.save();
  ctx.font = "800 15px \"Barlow Condensed\", \"Arial Narrow\", sans-serif";
  var label = "NICK DIAZ", tw = ctx.measureText(label).width + 16;
  ctx.fillStyle = "rgba(14,14,16,0.88)"; ctx.strokeStyle = ND_ORANGE; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.roundRect(n.x - tw / 2, ty - 10, tw, 20, 5); ctx.fill(); ctx.stroke();
  ctx.fillStyle = "#ffffff"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillText(label, n.x, ty + 0.5);
  ctx.restore();
}

// Fighting: his own Stockton Slap cocked back, then pitter-patter jabs;
// arms out when he's holding off; both fists up when Nate wins.
function drawNickArms(n, vic, sp, r) {
  var size = 13;
  if (n.phase === "celebrate") {
    [-1, 1].forEach(function (s) {
      var pump = Math.max(0, Math.sin(n.celebrate * 11 + (s > 0 ? Math.PI : 0))) * r * 0.35;
      ndNickArm(s, s * r * 0.6, -r * 0.5, s * r * 0.8, -r * 1.05 - pump, -Math.PI / 2, size);
    });
    return;
  }
  var dx = vic.x - n.x, dy = vic.y - n.y, aim = Math.atan2(dy, dx), d = Math.sqrt(dx * dx + dy * dy) || 1;
  var ux = Math.cos(aim), uy = Math.sin(aim), px = -uy, py = ux;
  var a = n.atk;
  if (a && a.kind === "slap") {
    var s = n.flip, cocked = a.phase !== "hit", k = a.phase === "wind" ? Math.min(1, a.t / 0.2) : 1, tr = a.phase === "wind" ? Math.sin(ndClock * 60) * 0.05 : 0;
    var ang = cocked ? aim + s * (0.9 + 1.3 * k) + tr : aim - s * 0.4 * Math.min(1, a.t / 0.08), len = cocked ? r * 1.4 : Math.min(r * 1.8, d - vic.r * 0.4);
    ndNickArm(-s, -px * s * r * 0.55, -py * s * r * 0.55, -px * s * r * 1.15, -py * s * r * 1.15 + r * 0.25, aim, size);
    strokeLimb(size * 0.68, armColor(NICK_CH, s), function () { ctx.moveTo(px * s * r * 0.55, py * s * r * 0.55); ctx.lineTo(Math.cos(ang) * len, Math.sin(ang) * len); });
    drawOpenGlove(Math.cos(ang) * len, Math.sin(ang) * len, ang, size, NICK_LOOK.gloves);
    return;
  }
  if (a || n.punchAnim > 0 || d <= NICK_R + vic.r + sp.lunge) {
    // Gloves up, the jabs coming out in turn.
    [-1, 1].forEach(function (s) {
      var out = s === n.punchSide ? Math.sin(Math.PI * Math.min(1, 1 - n.punchAnim / 0.12)) * (n.punchAnim > 0 ? 1 : 0) : 0;
      var len = r * (0.95 + 0.85 * out);
      ndNickArm(s, px * s * r * 0.55, py * s * r * 0.55, ux * len + px * s * r * 0.35, uy * len + py * s * r * 0.35, aim, size);
    });
    return;
  }
  [-1, 1].forEach(function (s) {
    var wave = Math.sin(ndClock * 8 + (s > 0 ? 0 : 1.4)) * 0.12;
    ndNickArm(s, s * r * 0.7, -r * 0.05, s * r * 1.5, r * (0.2 + wave), s > 0 ? 0.25 : Math.PI - 0.25, size);
  });
}
function ndNickArm(side, sx, sy, hx, hy, ang, size) {
  strokeLimb(size * 0.68, armColor(NICK_CH, side), function () { ctx.moveTo(sx, sy); ctx.lineTo(hx, hy); });
  drawGloveAt(hx, hy, size * 0.85, NICK_CH, ang);
}

function drawNickSpeech(n) {
  var s = nickSpeech, who = { x: n.x, y: n.y, r: NICK_R, char: NICK_CH };
  var L = speechLayout(who, s.words);
  // Over him or under him, whichever covers least of the fighters' own
  // bubbles (either spot they might take) and the fighters.
  var busy = [];
  balls.forEach(function (b) {
    if (b.alive) busy.push({ x: b.x - b.r, y: b.y - b.r, w: b.r * 2, h: b.r * 2 });
    var bs = speech[b.id];
    if (!bs || !bs.words) return;
    var BL = speechLayout(b, bs.words);
    busy.push({ x: BL.x, y: BL.below.y, w: BL.w, h: BL.h }, { x: BL.x, y: BL.above.y, w: BL.w, h: BL.h });
  });
  var best = null;
  [[true, L.below], [false, L.above]].forEach(function (c) {
    var r = { x: L.x, y: c[1].y, w: L.w, h: L.h }, cost = c[1].ok ? 0 : 1e6;
    busy.forEach(function (o) { cost += overlapArea(r, o); });
    if (!best || cost < best.cost) best = { cost: cost, rect: r, under: c[0] };
  });
  var under = best.under, rect = best.rect;
  var shown = Math.min(s.words.length, Math.floor(s.t / SPEECH_WORD) + 1);
  var alpha = Math.min(1, (s.dur - s.t) / SPEECH_FADE);
  var pop = Math.min(1, s.t / SPEECH_POP), scale = 0.82 + 0.18 * (1 - Math.pow(1 - pop, 3));
  drawSpeechBubble(who, L, rect, under, shown, alpha, scale);
}

// NOW ENTERING THE CAGE: NICK DIAZ. Takes over the jumbotron (from
// drawJumbotron, stadium.js), or a banner over the test arena.
function drawNickJumbo(x, y, w, h) {
  if (nickShow <= 0 || !balls) return;
  var owner = nickDiaz ? balls[nickDiaz.ownerId] : null, sp = owner && owner.char.special;
  var total = (sp && sp.announce) || 2.6;
  var a = Math.min(1, nickShow / 0.3, (total - nickShow) / 0.2);
  ctx.save();
  ctx.globalAlpha = Math.max(0, a);
  ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
  ctx.fillStyle = "#0b0907"; ctx.fillRect(x, y, w, h);
  var flash = Math.sin(performance.now() / 90) > 0;
  ctx.strokeStyle = flash ? ND_ORANGE : "#ffffff"; ctx.lineWidth = Math.max(4, h * 0.03); ctx.strokeRect(x + 6, y + 6, w - 12, h - 12);
  var pr = h * 0.33, px = x + 40 + pr, py = y + h / 2;
  ctx.fillStyle = "#2a1a10"; ctx.beginPath(); ctx.arc(px, py, pr + 8, 0, Math.PI * 2); ctx.fill();
  ctx.save();
  ctx.beginPath(); ctx.arc(px, py, pr + 8, 0, Math.PI * 2); ctx.clip();
  var ar = (pr + 8) / 1.55;
  drawFighterArt(ctx, px, py + ar * 0.3, ar, NICK_LOOK, "#0b0f12", { layout: "contained", name: "nick diaz" });
  ctx.restore();
  var tx = px + pr + 30, tw = x + w - tx - 30;
  jtText("NOW ENTERING THE CAGE", tx + tw / 2, y + h * 0.24, h * 0.13, "#e9d6c4", "center", "#000000", tw);
  jtText("NICK DIAZ", tx + tw / 2, y + h * 0.55, h * 0.4, ND_ORANGE, "center", "#7a2e0d", tw);
  jtText("STOCKTON, CA  209", tx + tw / 2, y + h * 0.83, h * 0.12, flash ? "#ffffff" : "#e9d6c4", "center", "#000000", tw);
  ctx.restore();
}

// ---------------------------------------------------------------- gallery (gallery.js)

function nickDiazSpecialInfo(sp) {
  return "The jumbotron announces NICK DIAZ and his big brother barges up through the crowd, hops the fence (\"Don't be scared, homie.\") and hunts them down for " + secs(sp.time) +
    " while Nate keeps fighting: first his own Stockton Slap, charged up for " + secs(sp.slapWind) + " (" + sp.slapDamage + " and dizzy for " + secs(sp.slapDizzy) + "), then pitter-patter flurries (" + sp.flurry + " punches of " + sp.punch +
    ", " + sp.maxDamage + " at most). Every attack is a wind-up and a dash in, so they can get out of the way, and his shots slip and block like anything thrown. Then he hops back out.";
}

function diazGalleryMoves(ch, add) {
  var g = ch.diaz, sc = g.slap, sh = g.subHunt, st = g.stockton, vc = g.vsConor, pct = function (x) { return Math.round(x * 100) + "%"; };
  if (g.durability) add("🧱", "Durability", "Takes " + pct(g.durability.take) + " of the damage from everything.");
  if (g.chin) add("🗿", "Iron chin", "A one-punch knockout (KO Rush, Conor's counter left, CHAMA, Ngannou's rage punch) only drops him " + (100 - g.chin.chance) + "% of the time. Otherwise \"IRON CHIN!\": it does " + g.chin.damage + " and he shakes it off with his arms out.");
  if (g.subDefense) add("🥋", "Black belt", g.subDefense.save + "% of the submissions that would make him tap turn into escapes.");
  if (sc) add("👋", "Stockton Slap", "Every " + sc.every[0] + "-" + sc.every[1] + "s up close he drops his hands, arms out wide (the tell), and slaps them with an open glove: " + sc.damage + " damage, and dizzy for " + secs(sc.dizzy) + " if it lands. It can be slipped or blocked.");
  if (sh) add("🐍", "Sub hunt", "Every " + sh.every[0] + "-" + sh.every[1] + "s up close (and " + sh.onDizzy + "% of the times they're left dizzy) he dives in for the neck. They fight it off " + sh.escape + "% of the time (" + sh.escapeDizzy + "% if dizzy). Otherwise it's a rear naked choke, an armbar or a guillotine: they tap " + sh.tapBase + "%, up to " + (sh.tapBase + sh.tapLowHp) + "% the more hurt they are, +" + sh.persist + "% for every try that didn't finish. He keeps coming back sooner.");
  if (st) add("🔥", "Stockton surge", "Once a fight, after " + secs(st.after) + " (or when he's hurt), he says a line with his arms out, walks them down and lands a big Stockton Slap that can't be slipped or blocked. Then for the rest of the fight: x" + st.damage + " damage, x" + st.speed + " speed, x" + st.attack + " attack speed, more slaps, deeper chokes.");
  if (g.iconic) add("🎙️", "UFC 196", "A win by rear naked choke gets Bruce Buffer's call on the lower-third.");
  if (vc) add("🇮🇪", "vs Conor", "He answers the trash talk, slaps him more often, and " + vc.chain196 + "% of his sub hunts are the real UFC 196 finish: a guillotine Conor rolls out of, into the back take and the choke. Joe Rogan asks how it feels. At Conor's press conference he throws " + vc.bottlesBack + " bottles back.");
}

function diazGallerySounds(groups, synth) {
  groups.push({ title: "Nate Diaz", items: [
    synth("Stockton Slap", "The open glove landing.", function () { playStocktonSlap(false); }),
    synth("Big Stockton Slap", "The surge's slap.", function () { playStocktonSlap(true); }),
    synth("Iron chin", "Eating a knockout shot.", function () { playIronChin(); }),
    synth("Sub hunt", "Diving in for the neck.", function () { playSubReach(); }),
    synth("Surge call", "Arms out, saying his line.", function () { playSurgeCall(); }),
    synth("Stockton surge", "Turning it up for the rest of the fight.", function () { playStocktonSurge(); }),
    synth("Nick Diaz", "Nick barging in and hopping the fence.", function () { playNickEntrance(); })
  ] });
}

// ---------------------------------------------------------------- sound
// Synth stand-ins until Joe records the real ones.

function ndAudio(fn) {
  try {
    var ac = getAudioCtx();
    if (!ac) return;
    if (ac.state === "suspended") ac.resume();
    fn(ac, ac.currentTime);
  } catch (e) { /* never let audio break the game */ }
}
// The open glove: a bright crack over a smack, and the crowd going "ooh".
function playStocktonSlap(power) {
  ndAudio(function (ac, t) {
    var v = power ? 1 : 0.75;
    caneBurst(ac, t, 4200, 0.8, 0.85 * v, 0.045);
    caneBurst(ac, t, 1700, 1.3, 0.6 * v, 0.09);
    caneBurst(ac, t + 0.004, 7800, 1.6, 0.35 * v, 0.03);
    caneTone(ac, t, "sine", 240, 95, 0.22 * v, 0.12);
    if (power) { caneBurst(ac, t + 0.09, 3600, 0.9, 0.3, 0.05); caneTone(ac, t, "sine", 120, 48, 0.35, 0.3); }
  });
  playTauntOoh(); // (conor.js)
}
// A bomb bouncing off his chin: a dull thud and a hollow clank.
function playIronChin() {
  playPunch(60);
  ndAudio(function (ac, t) {
    caneTone(ac, t, "sine", 95, 38, 0.5, 0.45);
    caneTone(ac, t + 0.02, "triangle", 620, 560, 0.16, 0.35);
    caneTone(ac, t + 0.02, "triangle", 931, 880, 0.08, 0.3);
    caneBurst(ac, t, 380, 0.7, 0.4, 0.15);
  });
}
// Lunging in for the neck: a scuffle of cloth and a grunt.
function playSubReach() {
  ndAudio(function (ac, t) {
    caneBurst(ac, t, 900, 0.7, 0.35, 0.16);
    caneBurst(ac, t + 0.06, 1400, 0.9, 0.22, 0.1);
    caneTone(ac, t, "sawtooth", 150, 110, 0.06, 0.18);
  });
}
// Arms out for his line: a low drum hit and a rising hum.
function playSurgeCall() {
  ndAudio(function (ac, t) {
    caneTone(ac, t, "sine", 70, 55, 0.4, 0.5);
    var o = ac.createOscillator(), f = ac.createBiquadFilter(), g = ac.createGain();
    o.type = "sawtooth"; o.frequency.setValueAtTime(82, t); o.frequency.exponentialRampToValueAtTime(110, t + 1.0);
    f.type = "lowpass"; f.frequency.setValueAtTime(300, t); f.frequency.linearRampToValueAtTime(900, t + 1.0);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.06, t + 0.3); g.gain.exponentialRampToValueAtTime(0.0001, t + 1.1);
    o.connect(f); f.connect(g); g.connect(strikeOut(ac));
    o.start(t); o.stop(t + 1.15);
  });
}
// STOCKTON!: a power chord swelling up and two hits.
function playStocktonSurge() {
  ndAudio(function (ac, t) {
    [110, 165, 220].forEach(function (fq) {
      var o = ac.createOscillator(), f = ac.createBiquadFilter(), g = ac.createGain();
      o.type = "sawtooth"; o.frequency.setValueAtTime(fq * 0.75, t); o.frequency.exponentialRampToValueAtTime(fq, t + 0.35);
      f.type = "lowpass"; f.frequency.setValueAtTime(500, t); f.frequency.linearRampToValueAtTime(2200, t + 0.4);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.05, t + 0.25); g.gain.exponentialRampToValueAtTime(0.0001, t + 1.1);
      o.connect(f); f.connect(g); g.connect(strikeOut(ac));
      o.start(t); o.stop(t + 1.15);
    });
    caneTone(ac, t + 0.35, "sine", 90, 40, 0.5, 0.35);
    caneTone(ac, t + 0.6, "sine", 90, 40, 0.5, 0.35);
    caneBurst(ac, t + 0.35, 2000, 0.6, 0.25, 0.2);
  });
}
// Nick barging in: the chain-link fence rattling and the crowd popping.
function playNickEntrance() {
  ndAudio(function (ac, t) {
    for (var i = 0; i < 9; i++) caneBurst(ac, t + 0.15 + i * 0.035, 2600 + (i % 3) * 500, 3, 0.22, 0.03);
    caneBurst(ac, t, 700, 0.5, 0.45, 0.7);
    caneTone(ac, t, "sine", 100, 60, 0.3, 0.3);
  });
}
