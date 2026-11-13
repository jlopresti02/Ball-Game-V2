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
//     vs: { "c-max-holloway": { start: [...], taunt: [...], win: [...] } }
//   };                         // `vs` lines only play against that fighter
//
// Each line is heard once a fight before any line repeats. Every line here is
// something the fighter really said: the source is in the voice-clips
// manifest under the clip's name.
"use strict";

var CHATTER = {};
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
  if (!fresh.length) { all.forEach(function (t) { b.chat.used[t] = false; }); fresh = all; }
  var line = fresh[Math.floor(Math.random() * fresh.length)];
  b.chat.used[line] = true;
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
      if (!c.won && o && !o.alive && canSay(b)) { c.won = true; line = chatterPick(b, o, "win"); }
    } else {
      c.t += dt;
      if (!c.opened && c.t >= c.start && canSay(b)) { c.opened = true; line = chatterPick(b, o, "start"); }
      else if (c.opened && c.t >= c.next && canSay(b)) { c.next = c.t + chatterRand(cfg.every || CHATTER_EVERY); line = chatterPick(b, o, "taunt"); }
    }
    if (line) say(b, line);
  }
}
