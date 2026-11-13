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
//     vs: { "c-max-holloway": { start: [...], taunt: [...], win: [...], calls: [...] } }
//   };                         // `vs` lines only play against that fighter
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
    taunt: ["Change the angles, then different things come available.", "You got to use every part.", "He's way more intelligent. So you don't have to put on the size."],
    calls: ["He's the best. I'm telling you, that kid is the best.", "Who's better? Who's better? Who's better? Nobody!"],
    subCalls: ["It's all over! Unbelievable! All over! Johnson by submission!"]
  },
  // Max Holloway: hype on top of his own lines (holloway.js); UFC's own uploads.
  "c-max-holloway": {
    start: ["What's up, UFC? Hawaii!", "Let's get it!"],
    taunt: ["Let's get it!", "Take me home, Dana, it's about time, let's go!"],
    win: ["The only thing on my mind is Lahaina, Maui. This one is for you guys."],
    koCalls: ["Oh my God. All night long. Look at this right hand that ends it."]
  },
  "c-alexander-volkanovski": {
    calls: ["Championship mettle from Volkanovski.", "Huge ground strikes from Volkanovski, one of the best title rounds."],
    koCalls: ["Volkanovski's teeing off on him.", "That is picture perfect. And he just sits him down."]
  }
};
var CHATTER_EVERY = [9, 14];

function chatterCfg(b) { return b && b.char && CHATTER[b.char.id]; }

// From initBall (match.js).
function initChatter(b) {
  b.chat = chatterCfg(b) ? { t: 0, start: 1 + Math.random() * 2, next: 0, opened: false, won: false, used: {} } : null;
  if (b.chat) b.chat.next = b.chat.start + chatterRand(chatterCfg(b).every || CHATTER_EVERY);
}

function chatterRand(r) { return r[0] + Math.random() * (r[1] - r[0]); }

// The lines of one kind for b against o, with clips, not heard yet this fight
// (all of them again once every one has been heard).
function chatterPick(b, o, kind) {
  var cfg = chatterCfg(b), vs = cfg.vs && o && cfg.vs[o.char.id];
  var all = (cfg[kind] || []).concat((vs && vs[kind]) || []).filter(function (t) { return SPEECH_CLIPS[t]; });
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
      if (!c.won && o && !o.alive && !announcer && canSay(b)) { c.won = true; line = chatterPick(b, o, "win"); }
    } else {
      c.t += dt;
      if (!c.opened && c.t >= c.start && canSay(b)) { c.opened = true; line = chatterPick(b, o, "start"); }
      else if (c.opened && c.t >= c.next && canSay(b)) { c.next = c.t + chatterRand(cfg.every || CHATTER_EVERY); line = chatterPick(b, o, "taunt"); }
    }
    if (line) say(b, line);
  }
}
