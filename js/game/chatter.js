// Chatter (Christian, 2026-11-13): extra real voice lines for any fighter, by
// id, on top of whatever the fighter's own file says. A line is only picked
// when it has a real clip (SPEECH_CLIPS, voice-clips.js), so it's heard out
// loud or not at all, and it goes through say(), so it never talks over
// anyone (the talk channel, audio.js).
//
//   CHATTER["c-ilia-topuria"] = {
//     start: ["..."],          // one of these 1 to 3 seconds into the fight
//     taunt: ["..."],          // one every `every` seconds while it's on
//     every: [9, 14],
//     win:   ["..."],          // after he wins
//     calls: ["..."],          // the commentator's real call after he wins,
//     koCalls: ["..."],        //   any way, by knockout,
//     subCalls: ["..."],       //   or by submission (announce, the TV
//                              //   lower-third), before his own win line
//     vs: { "c-max-holloway": { start: [...], taunt: [...], win: [...], calls: [...] } },
//                              // `vs` lines only play against that fighter:
//                              // every vs start line plays every fight, right
//                              // after his start line, and a vs win or call
//                              // line is picked over his usual ones
//     moments: { evilMode: { lines: ["..."], chance: 100, gap: 0 } }
//   };                         // a line the moment something happens (below)
//
// Defining moments play every time: his start line every fight (one of
// `start`), every vs start line in that matchup, a win line every win (one of
// `win`). The rest (taunts, most moments) come and go with chances and gaps.
//
// Moments are watched from here, so the fighter's own file isn't touched:
// goatMode / evilMode (Jon Jones swapping modes, jon.js), eyePoke (his eye
// poke, or Gane's), kick (he throws a kick or one comes at him). A moment's
// line plays `chance`% of the times it happens (100), at most one every `gap`
// seconds (0). If he's talking when it happens, it waits up to `wait` seconds
// (CHATTER_WAIT; 0 = only if he's quiet right then) for him to finish, and
// nothing else of his starts while it waits. A `must` moment (Jon's mode
// swaps) is never dropped: like the opener, it waits for as long as it takes
// until he's free, the opponent isn't talking and no fighter's commentator
// call is up, so it's heard every time; only a newer `must` line replaces it
// (back in GOAT mode, the EVIL line is no longer due). His taunts hold off while a mode
// swap is coming (CHATTER_DUE), so they don't talk over the swap's line.
//
// Fighters whose own file already calls their finishes (Conor, Strickland,
// Tony, Nate) get no calls here, so a finish never gets two; Max's own call
// is only for a knockout in The Middle, the call here is for the rest.
//
// Each line is heard once a fight before any line repeats. Every line here is
// something the fighter really said: the source is in the voice-clips
// manifest under the clip's name.
"use strict";

var CHATTER = {
  "c-charles-oliveira": {
    calls: ["Surprise, surprise. Charles Oliveira is the champion!", "Who can stop Charles Oliveira? Eleven in a row, and still the best lightweight on planet Earth."],
    vs: { "c-dustin-poirier": { calls: ["He gets the signature win over Dustin Poirier."] } }
  },
  "c-sean-omalley": { koCalls: ["Out of nowhere, and didn't even bother following up!", "If you don't know, now you know. It's time to buy stock in Sugar Sean O'Malley."] },
  "c-khabib-nurmagomedov": { calls: ["The Eagle rises again!", "Incredible. Absolutely incredible the way he dominates people in the grappling. Never seen anything like it."] },
  "c-dustin-poirier": {
    calls: ["Dustin Poirier has produced the biggest win of his career by a mile."],
    vs: { "c-conor-mcgregor": { koCalls: ["A stunner on Fight Island as they attend to Conor."] } }
  },
  "c-justin-gaethje": { koCalls: ["That is the most amazing performance of Justin Gaethje's career. Spectacular!", "Justin Gaethje has done it!"] },
  "c-georges-st-pierre": { calls: ["Unbelievably dominant victory for Georges St-Pierre!", "What a fight! What a night! And Georges St-Pierre is a two-division UFC champion!"] },
  // Ilia Topuria: supremely confident (UFC 308 and 317 pressers, ESPN, Bisping, Helwani).
  "c-ilia-topuria": {
    start: ["I am the best fighter in the world.", "I'm El Matador, you all know what El Matador is.", "Yeah, I will finish him."],
    taunt: ["No one can match my level of skills inside the octagon", "Gonna get that huge knockout, you will see.", "I am the best fighter in the world.", "I'm El Matador, you all know what El Matador is."],
    win: ["I'm the world champion.", "No one can match my level of skills inside the octagon"],
    koCalls: ["No one's ever done it like that. The left hook, man.", "Oh my goodness! He called it!"],
    vs: {
      "c-max-holloway": { start: ["Going to be the first person to knock out Max Holloway."] },
      "c-charles-oliveira": { koCalls: ["No one has ever done it like that to Charles Oliveira. Not like that."] }
    }
  },
  // Mighty Mouse breaking it down, from his own channel's VOID breakdowns.
  "c-demetrious-johnson": {
    start: ["Let's break down the void, boys.", "We have a banger void breakdown for you."],
    taunt: ["Change the angles, then different things come available.", "You got to use every part.", "He's way more intelligent. So you don't have to put on the size.",
      "Watch his feet, look at his feet.", "Watch how he moves his feet closer and closer to get to his opponent right here.",
      "He has to lift this shoulder above his head like this, it's a term we use in wrestling."],
    calls: ["He's the best. I'm telling you, that kid is the best.", "Who's better? Who's better? Who's better? Nobody!"],
    subCalls: ["It's all over! Unbelievable! All over! Johnson by submission!"]
  },
  // Max Holloway: hype on top of his own lines (holloway.js); UFC's own uploads.
  // Round 5 picks (Christian, 2026-11-14): MX7 opens every fight; MX12 every fight
  // vs Daniel Cormier and MX14 every fight vs Charles Oliveira, right after it;
  // MX10 one of his two win lines (mixed in, not every win); MX5 a taunt; MX1 low
  // health, MX2 landing combos, MX3 after a knockdown (chances and gaps).
  "c-max-holloway": {
    start: ["To be the best, you got to beat the best."],
    taunt: ["What's up, UFC? Hawaii!", "Let's get it!", "Take me home, Dana, it's about time, let's go!", "If you want a tough fight, then they know who to call up."],
    win: ["The only thing on my mind is Lahaina, Maui. This one is for you guys.", "I don't care whoever's next in line. Let's get it."],
    koCalls: ["Oh my God. All night long. Look at this right hand that ends it."],
    vs: {
      "c-daniel-cormier": { start: ["There's only one money fight. That's me, DC."] },
      "c-charles-oliveira": { start: ["I'm going to see Mr. Oliveira again, bro, that's for sure."] }
    },
    moments: {
      lowHealth: { lines: ["I ain't done yet. I ain't done yet."], chance: 75, gap: 999, wait: 4 },
      combo: { lines: ["I keep getting better, baby."], chance: 35, gap: 20, wait: 1 },
      knockdown: { lines: ["What can I say? I had him weak in the knees, I guess."], chance: 80, gap: 15, wait: 2 }
    }
  },
  // Tony Ferguson talking trash on top of his own lines (ferguson.js); UFC 216 media day and others.
  "c-tony-ferguson": {
    taunt: ["I'm so far ahead of the curve.", "I'm a different animal than these guys.", "I'm one of the most ruthless vatos out there, man.",
      "I don't have to be fake. I'm probably one of the most real.", "I'm not afraid, I'm a [BLEEP] Ultimate Fighter and a champion."],
    every: [8, 12]
  },
  // Volkanovski: on top of his own lines (volkanovski.js); UFC 333 presser, Bisping, JRE MMA Show, Helwani.
  "c-alexander-volkanovski": {
    start: ["I'm going to put the pressure on."],
    taunt: ["I'm a problem solver.", "I'm gonna figure it out.", "That's just how I am.", "Making him adjust.", "That's it. One more, you're done."],
    win: ["That's how it should be done.", "That's the champion I want to be."],
    calls: ["Championship mettle from Volkanovski.", "Huge ground strikes from Volkanovski, one of the best title rounds."],
    koCalls: ["Volkanovski's teeing off on him.", "That is picture perfect. And he just sits him down."]
  },
  // Jon Jones (Joe's fighter, chatter only): the Fox hot mic and FOX Sports Live
  // before UFC 178 (2014), VICE Fight School on the oblique kick, ESPN before UFC 285.
  "c-jon-jones": {
    start: ["You know I would absolutely kill you if you ever did something like that, right?"],
    taunt: ["I believe in my fight experience, I put that up against any fighter on this planet.",
      "You know I would absolutely kill you if you ever did something like that, right?"],
    every: [14, 22],
    moments: {
      evilMode: { lines: ["Stop me from coming at you round after round with the most malicious techniques I know."], must: true },
      goatMode: { lines: ["I just feel it in my whole being that I'm the best fighter on the planet."], must: true },
      eyePoke: { lines: ["It's a great technique. It keeps my opponents at bay."] },
      kick: { lines: ["If he keeps his body back, there's no way I can reach him with a punch."], chance: 25, gap: 20, wait: 1 }
    }
  }
};
var CHATTER_EVERY = [9, 14];

function chatterCfg(b) { return b && b.char && CHATTER[b.char.id]; }

// From initBall (match.js).
function initChatter(b) {
  b.chat = chatterCfg(b) ? { t: 0, start: 1 + Math.random() * 2, next: 0, opened: false, won: false, used: {}, seen: {}, gaps: {}, dt: 0, must: [] } : null;
  if (b.chat) b.chat.next = b.chat.start + chatterRand(chatterCfg(b).every || CHATTER_EVERY);
}

function chatterRand(r) { return r[0] + Math.random() * (r[1] - r[0]); }

var CHATTER_WAIT = 2.5;
var CHATTER_DUE_T = 6; // a taunt is up to ~5 seconds long

// True on the frame `v` changes (never on the first look).
function chatterSeen(c, key, v) {
  var had = key in c.seen, was = c.seen[key];
  c.seen[key] = v;
  return had && v !== was;
}
var CHATTER_MOMENTS = {
  goatMode: function (b, o, c) { return chatterSeen(c, "goat", b.jonMode) && b.jonMode === "goat"; },
  evilMode: function (b, o, c) { return chatterSeen(c, "evil", b.jonMode) && b.jonMode === "evil"; },
  eyePoke: function (b, o, c) { return chatterSeen(c, "poke", b.chAct) && !!b.chAct && b.chAct.kind === "poke"; },
  kick: function (b, o, c) {
    var mine = chatterSeen(c, "kick", b.kick) && !!b.kick, theirs = chatterSeen(c, "okick", o && o.kick) && !!(o && o.kick);
    return mine || theirs;
  },
  // His health drops under CHATTER_LOW.
  lowHealth: function (b, o, c) { var low = b.hp < MAX_HP * CHATTER_LOW; return chatterSeen(c, "low", low) && low; },
  // He lands CHATTER_BURST strikes in a row, each within CHATTER_BURST_GAP
  // seconds of the last (the jumbotron's strikes landed, stadium.js): once a burst.
  combo: function (b, o, c) {
    var n = statsFor(b.id).strikes, was = c.seen.strikes;
    c.seen.strikes = n;
    if (c.burstT != null && c.t - c.burstT > CHATTER_BURST_GAP) { c.burstN = 0; c.burstSaid = false; }
    if (was == null || n <= was) return false;
    c.burstN = (c.burstN || 0) + (n - was); c.burstT = c.t;
    if (c.burstN < CHATTER_BURST || c.burstSaid) return false;
    c.burstSaid = true;
    return true;
  },
  // He knocks them down: they go down on their back (the guard), get dizzy or
  // see stars, or take CHATTER_BIG_HIT or more in one go and stay up.
  knockdown: function (b, o, c) {
    if (!o) return false;
    var down = !!(o.alive && (o.guard || o.dizzy || o.dazed === true)), hp = o.hp, was = c.seen.ohp;
    var fell = chatterSeen(c, "odown", down) && down;
    c.seen.ohp = hp;
    return o.alive && (fell || (was != null && was - hp >= CHATTER_BIG_HIT));
  }
};
var CHATTER_LOW = 0.3;        // lowHealth: under this share of his health
var CHATTER_BURST = 3;        // combo: strikes landed in a row
var CHATTER_BURST_GAP = 0.35; // combo: at most this long between them
var CHATTER_BIG_HIT = 15;     // knockdown: one hit this big

// Moments that are about to happen (a mode swap within CHATTER_DUE_T seconds).
var CHATTER_DUE = {
  goatMode: function (b) { return b.jonMode === "evil" && !!b.char.jon && b.char.jon.swapEvery - b.jonT < CHATTER_DUE_T; },
  evilMode: function (b) { return b.jonMode === "goat" && !!b.char.jon && b.char.jon.swapEvery - b.jonT < CHATTER_DUE_T; }
};
function chatterDue(b, cfg) {
  for (var k in cfg.moments) if (CHATTER_DUE[k] && CHATTER_DUE[k](b)) return true;
  return false;
}

// Every frame in the fight: a moment that happens and passes its chance and
// gap is owed its line (the newest one wins), heard as soon as he's quiet,
// within its wait. Every detector looks every frame, so none fires late.
function chatterMoment(b, o, c, cfg) {
  if (c.owed && (c.owed.t -= c.dt) < 0) c.owed = null;
  for (var k in cfg.moments) {
    var mo = cfg.moments[k], det = CHATTER_MOMENTS[k];
    if (c.gaps[k] > 0) c.gaps[k] -= c.dt;
    if (!det || !det(b, o, c) || c.gaps[k] > 0) continue;
    if (Math.random() * 100 >= (mo.chance != null ? mo.chance : 100)) continue;
    var have = (mo.lines || []).filter(function (t) { return SPEECH_CLIPS[t]; });
    if (!have.length) continue;
    var pick = have[Math.floor(Math.random() * have.length)];
    if (mo.must) { // every time: queued (tickChatter), replacing a `must` line that's no longer due
      c.must = c.must.filter(function (m) { return !(m.key && cfg.moments[m.key] && cfg.moments[m.key].must); });
      c.must.push({ key: k, line: pick });
      c.gaps[k] = mo.gap || 0;
    } else c.owed = { key: k, line: pick, t: mo.wait != null ? mo.wait : CHATTER_WAIT };
  }
  if (!c.owed || c.must.length || !canSay(b)) return null;
  var line = c.owed.line;
  c.gaps[c.owed.key] = cfg.moments[c.owed.key].gap || 0;
  c.owed = null;
  return line;
}

// The lines of one kind for b against o, with clips, not heard yet this fight
// (all of them again once every one has been heard).
function chatterPick(b, o, kind) {
  var cfg = chatterCfg(b), vs = cfg.vs && o && cfg.vs[o.char.id];
  var own = (cfg[kind] || []).filter(chatterHas), theirs = ((vs && vs[kind]) || []).filter(chatterHas);
  var all = kind === "start" ? own : (CHATTER_VS_FIRST[kind] && theirs.length ? theirs : own.concat(theirs));
  if (!all.length) return null;
  var fresh = all.filter(function (t) { return !b.chat.used[t]; });
  if (!fresh.length) {
    all.forEach(function (t) { b.chat.used[t] = false; });
    fresh = all.length > 1 ? all.filter(function (t) { return t !== b.chat.last; }) : all; // never the same line twice running
  }
  var line = fresh[Math.floor(Math.random() * fresh.length)];
  b.chat.used[line] = true; b.chat.last = line;
  return line;
}

var CHATTER_VS_FIRST = { win: true, calls: true, koCalls: true, subCalls: true }; // a vs line is picked over his usual ones
function chatterHas(t) { return !!SPEECH_CLIPS[t]; }

// The opener, every fight: one of his start lines, then every vs start line
// for this opponent (each heard once).
function chatterOpen(b, o, c) {
  var cfg = chatterCfg(b), vs = cfg.vs && o && cfg.vs[o.char.id], one = chatterPick(b, o, "start");
  if (one) c.must.push({ line: one });
  ((vs && vs.start) || []).filter(chatterHas).forEach(function (t) { c.must.push({ line: t }); c.used[t] = true; });
}

// Clear for a line that has to be heard: he's free, the opponent isn't
// talking and no fighter's commentator call is up (a shared commentary call
// doesn't count: his clip waits for it, speech.js), so the talk channel takes it.
function chatterClear(b, o) { return canSay(b) && !(o && o.alive && speaking(o)) && !chatterCallUp(); }
// A lower-third from the fight itself (a fighter's call, chatter's), not a
// commentary call (commentary-calls.js), which the fight never waits on.
function chatterCallUp() { return !!announcer && !(typeof commentaryMine === "function" && commentaryMine()); }

// From update(), every frame.
function tickChatter(dt) {
  if (!started) return;
  for (var i = 0; i < balls.length; i++) {
    var b = balls[i], c = b && b.chat, o = balls[1 - i];
    if (!c || !b.alive) continue;
    var cfg = chatterCfg(b), line = null;
    if (over) {
      if (!c.called && o && !o.alive) {
        c.called = true;
        var call = chatterPick(b, o, winBy === "submission" ? "subCalls" : "koCalls") || chatterPick(b, o, "calls");
        if (call) announce(call, { who: cfg.who || "UFC BROADCAST" });
      }
      if (!c.won && o && !o.alive && !chatterCallUp() && canSay(b)) { c.won = true; line = chatterPick(b, o, "win"); }
    } else {
      c.t += dt; c.dt = dt;
      if (cfg.moments) line = chatterMoment(b, o, c, cfg);
      if (!c.opened && c.t >= c.start) { c.opened = true; chatterOpen(b, o, c); }
      if (!line && c.must.length && chatterClear(b, o)) line = c.must.shift().line; // the opener and `must` moments, in order
      var free = !line && !c.owed && !c.must.length && canSay(b); // a moment's line comes first
      if (free && c.opened && c.t >= c.next) {
        if (cfg.moments && chatterDue(b, cfg)) c.next = c.t + CHATTER_DUE_T + 2; // after the swap's line
        else { c.next = c.t + chatterRand(cfg.every || CHATTER_EVERY); line = chatterPick(b, o, "taunt"); }
      }
    }
    if (line) say(b, line);
  }
}
