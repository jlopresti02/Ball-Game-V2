// Commentary calls (Christian, 2026-11-14): the commentators reacting to the
// big moments in any fight, as the TV lower-third (announce, speech.js) with
// the real broadcast clip. One shared call, so any fighter's moves can use it:
//
//   commentaryCall(kind, attacker, defender, opts)
//
// kind      what just happened, a key of COMMENTARY_CALLS below: combo,
//           leftRight, rightHand, bigElbow, elbows, spinElbow, spinKick, shot,
//           takedown, sprawl, suplex, choke, ko, instantKo, fightEnd, and the
//           fighter-only ones (khabibGroundElbow, dustinBigLeft,
//           gaethjeKnockdownRight, vanLeftHook, hollowayFight), which only
//           play when `only` is the attacker. Two more are signals with no
//           line of their own: "elbow" (any elbow that lands, opts.crit: a
//           crit is a big elbow, two close together are "elbows") and
//           "leftHand" (a right soon after it is "a left and now a right").
//           An unknown kind is ignored.
// attacker  who did it; defender  the other one. opts is optional.
// Returns true if the moment was taken (it can still wait a beat for a
// quiet spell, and lose to a bigger moment), false if it was passed over.
//
// Fighter files call it guarded, so branches merge in any order:
//   if (typeof commentaryCall === "function") commentaryCall("spinElbow", self, other);
//
// It isn't constant:
// - each kind is called `chance`% of the times it happens;
// - COMMENTARY_GAP seconds between any two calls, the same kind not again for
//   its `gap` (COMMENTARY_KIND_GAP), at most COMMENTARY_MAX a fight, nothing
//   in the first COMMENTARY_FIRST seconds;
// - a call only starts in a quiet spell: no lower-third up (theirs or another
//   call), neither fighter in the middle of a line (speaking), nothing on the
//   talk channel (audio.js) that won't be done inside TALK_WAIT, and not while
//   one of the fighters' own calls is due (COMMENTARY_HOLDS). A moment waits
//   up to its `wait` (COMMENTARY_WAIT) for one, then it's dropped. Two
//   moments at once: the bigger one (`prio`) wins;
// - a shot is called the frame after it's taken, once it's clear what
//   happened: through for a takedown, stuffed for a sprawl (only the first
//   stuffed shot of the fight: "the first takedown attempt"), a suplex, or
//   just the shot;
// - ko, instantKo and fightEnd wait until the fight is over and the knockout
//   cheer and the winner's line are done, and are skipped if a fighter's own
//   finish call came up (Conor, Strickland, the chatter calls...), so a finish
//   never gets two. Knockouts are watched from here (no hook): a fighter out
//   cold (koOut, the KO Rush, Ngannou, Conor's counter, O'Malley) or knocked
//   out from COMMENTARY_ONE_SHOT of his health in one hit is a one-shot
//   (instantKo); a winner left on COMMENTARY_CLOSE of his health or less is a
//   close fight (fightEnd);
// - only lines with a real clip are used (SPEECH_CLIPS, voice-clips.js), like
//   chatter.js, each heard once a fight before any repeats;
// - while one of our calls is talking, a fighter's line that comes up waits for
//   it rather than being skipped, and a fighter's own commentator call cuts ours
//   off (commentaryTalking, commentaryYield: speech.js), so we never cost them a line.
//
// Calls are sound and pictures only and roll the browser's own random numbers
// (nativeRandom, seed.js), and nothing in the fight reads them, so a saved
// fight still plays out exactly the same.
"use strict";

var COMMENTARY_ON = true;
var COMMENTARY_WHO = "UFC BROADCAST"; // the name on the lower-third's tab
var COMMENTARY_GAP = 9;          // seconds between two calls
var COMMENTARY_KIND_GAP = 25;    // the same kind again at the soonest (a kind's own `gap` overrides it)
var COMMENTARY_MAX = 6;          // calls in one fight at most (the end-of-fight call doesn't count)
var COMMENTARY_FIRST = 3;        // no calls in the first seconds (the whistle, the walkout lines)
var COMMENTARY_WAIT = 2;         // how long a moment waits for a quiet spell (a kind's own `wait` overrides it)
var COMMENTARY_SHOT_SETTLE = 0.5; // a plain shot waits this long in case it turns into a takedown
var COMMENTARY_END_DELAY = 0.8;  // after the fight's over, before the end-of-fight call
var COMMENTARY_END_WAIT = 10;    // and how long it waits for the knockout cheer and the winner's line
var COMMENTARY_CLOSE = 0.35;     // a close fight: the winner has this share of his health or less
var COMMENTARY_ONE_SHOT = 0.35;  // knocked out from at least this share of health in one hit: a one-shot
var COMMENTARY_LEFT_RIGHT = 2.5; // a right this soon after a left landed: "a left, and now a right"
var COMMENTARY_ELBOWS = 3;       // elbows landing this close together are "elbows"
var COMMENTARY_TALK_WAIT = 1.2;  // the talk channel's line ends this soon: ours goes right after it
var COMMENTARY_HOLLOWAY_AT = [5, 12]; // seconds into a Max Holloway fight for his call
var COMMENTARY_NEED_CLIP = true; // only lines with a real clip (false: text-only lines count too)

// Every line is the commentator's real words, cut from the broadcast (the
// clip, its source and timestamps are in the voice-clips manifest; codes are
// Christian's picks, round 5).
var COMMENTARY_CALLS = {
  combo: { chance: 55, prio: 2, lines: [
    "Oh my goodness! Oh my goodness! What a combination!", // CG1
    "Wow, what a combination!"] },                          // CG6
  leftRight: { chance: 60, prio: 3, lines: ["Oh! Big left! And now a right! Hurt, man!"] },        // CC2
  rightHand: { chance: 45, prio: 2, lines: ["Oh! Big right hand!"] },                              // CC9
  bigElbow: { chance: 50, prio: 3, lines: ["Whoa, whoa, whoa, whoa, whoa! What was that? He's hurt! Big elbow!"] }, // CC1
  elbows: { chance: 50, prio: 3, lines: ["Oh! Oh, he's hurt! Excellent elbows!"] },                // CC5
  spinElbow: { chance: 85, prio: 5, lines: ["Spinning elbow! Wow! Spinning elbow! Nasty! Wow!"] }, // CC7
  spinKick: { chance: 80, prio: 5, lines: ["Oh, nice spinning kick to the body!"] },               // CG12
  shot: { chance: 25, prio: 1, lines: ["There's the shot!"] },                                     // CG3
  takedown: { chance: 50, prio: 2, lines: [
    "Beautiful shot there on the double leg!",  // CG4
    "Fast double leg!"] },                      // CC3
  sprawl: { chance: 85, prio: 4, lines: ["He has successfully thwarted the first takedown attempt."] }, // CG5
  suplex: { chance: 85, prio: 5, lines: ["Did that just suplex him?"] },                           // CG13
  choke: { chance: 70, prio: 4, lines: ["There's the choke! He's got it! It's under the neck!"] }, // CG9
  ko: { chance: 40, prio: 6, end: true, lines: ["Oh! Just slept him! My goodness! Clean as can be!"] },        // CG10
  instantKo: { chance: 90, prio: 8, end: true, lines: ["Oh! Just slept him! My goodness! Clean as can be!"] }, // CG10
  fightEnd: { chance: 75, prio: 7, end: true, lines: ["What a fight!"] },                                      // CG16
  khabibGroundElbow: { chance: 80, prio: 6, gap: 40, only: "c-khabib-nurmagomedov", need: "big",
    lines: ["Oh, big elbow from Nurmagomedov!"] },                         // CG19
  dustinBigLeft: { chance: 80, prio: 6, gap: 40, only: "c-dustin-poirier", need: "last",
    lines: ["Oh, big left hand by Poirier over the top!"] },               // CG20
  gaethjeKnockdownRight: { chance: 85, prio: 6, gap: 40, only: "c-justin-gaethje",
    lines: ["Oh! Beautiful knockdown for Gaethje with a right hand!"] },  // CG21
  vanLeftHook: { chance: 60, prio: 6, gap: 30, only: "c-joshua-van",
    lines: ["Oh, nice left hook by Joshua Van!"] },                        // CG22 (Van's branch fires it)
  hollowayFight: { chance: 100, prio: 4, once: true, wait: 12, only: "c-max-holloway",
    lines: ["Max just looked at the commentary team and said, 'I'm the best boxer in the UFC.'"] } // MX-C1
};

// A fighter's own call that's about to come up: no call of ours starts while
// one of these is true, so it can't be the reason theirs gets skipped.
var COMMENTARY_HOLDS = [
  // Max Holloway's MAX VOLUME! call (holloway.js) only plays if no lower-third is up.
  function (b) { var h = b.char && b.char.holloway; return !!(h && h.blessed && h.lines && h.lines.rogan && b.hwM >= 0.88 && b.hwM < 1); },
  // A line chatter.js has to get heard (the opener, Jon's mode swaps) is waiting.
  function (b) { return !!(b.chat && b.chat.must && b.chat.must.length); }
];

var cc = null; // this fight's calls (made fresh for each fight)

function ccState() {
  if (!cc || cc.balls !== balls) {
    cc = { balls: balls, t: 0, fightT: 0, cool: 0, n: 0, kindT: {}, heard: {}, done: {}, want: null, end: null,
      overT: null, otherT: -99, mine: null, prev: [], lefts: {}, elbows: {}, stuffed: 0,
      hwAt: COMMENTARY_HOLLOWAY_AT[0] + ccRand() * (COMMENTARY_HOLLOWAY_AT[1] - COMMENTARY_HOLLOWAY_AT[0]), log: [] };
  }
  return cc;
}
function ccRand() { return typeof nativeRandom === "function" ? nativeRandom() : Math.random(); }
function ccIs(b, id) { return !!(b && b.char && String(b.char.id).indexOf(id) === 0); }
function ccLines(kind) {
  var k = COMMENTARY_CALLS[kind];
  return ((k && k.lines) || []).filter(function (t) { return !COMMENTARY_NEED_CLIP || (typeof SPEECH_CLIPS !== "undefined" && SPEECH_CLIPS[t]); });
}

function commentaryCall(kind, attacker, defender, opts) {
  try {
    if (!COMMENTARY_ON || typeof balls === "undefined" || !balls || !started) return false;
    var c = ccState();
    opts = opts || {};
    // The signals: they only decide which call it is.
    if (kind === "elbow") return ccElbow(c, attacker, defender, opts);
    if (kind === "leftHand") { if (attacker) c.lefts[attacker.id] = c.t; return false; }
    if (kind === "rightHand") kind = ccRight(c, attacker, defender);
    else if (kind === "combo") kind = ccCombo(opts);
    if (kind === "shot") return ccWant(c, ccTake(c, "shot", attacker, defender, opts, true));
    if (kind === "sprawl" && c.stuffed++ > 0) return false; // only the first stuffed shot of the fight
    return ccWant(c, ccTake(c, kind, attacker, defender, opts, false));
  } catch (e) { return false; } // never let a call break the fight
}

// A moment, if this call takes it: null if it's passed over. `later`: a shot,
// which only gets its checks once it's clear what it turned into (ccResolve).
function ccTake(c, kind, a, d, opts, later) {
  var k = COMMENTARY_CALLS[kind];
  if (!k) return null; // an unknown kind
  if (over && !k.end) return null;
  var wait = k.end ? COMMENTARY_END_WAIT : (k.wait != null ? k.wait : COMMENTARY_WAIT);
  if (!k.end && (c.n >= COMMENTARY_MAX || c.cool > wait)) return null; // it couldn't start in time anyway
  if (!later) {
    if (!ccLines(kind).length) return null; // no clip for it yet
    if (k.only && !ccIs(a, k.only)) return null;
    if (k.need && !opts[k.need]) return null;
    if (k.once && c.done[kind]) return null;
    if (!k.end && c.kindT[kind] != null && c.t - c.kindT[kind] < (k.gap != null ? k.gap : COMMENTARY_KIND_GAP)) return null;
    if (ccRand() * 100 >= k.chance) return null;
  }
  return { kind: kind, a: a, d: d, prio: k.prio, end: !!k.end, t0: c.t, at: c.t + (opts.delay || 0), until: c.t + wait, resolve: later };
}

// Waits for its quiet spell, unless a bigger moment's already waiting.
function ccWant(c, r) {
  if (!r) return false;
  if (r.end) {
    if (c.end && c.end.prio > r.prio) return false;
    c.end = r;
    return true;
  }
  if (c.want && c.want.prio > r.prio) return false;
  c.want = r;
  return true;
}

// A shot, a frame later: what came of it.
function ccResolve(c, r) {
  var a = r.a, d = r.d, kind = "shot", delay = COMMENTARY_SHOT_SETTLE;
  c.want = null;
  if (!a || !d) return;
  if (a.suplex) return; // suplex.js calls it as they land
  if (a.mmFin) { kind = "suplex"; delay = 0.8; } // Mighty Mouse's suplex into the armbar (mighty-mouse.js)
  else if (d.sprawl && d.sprawl.attackerId === a.id) {
    if (c.stuffed++ > 0) return;
    kind = "sprawl"; delay = 0.3;
    var t = a; a = d; d = t; // the call's about the one who stuffed it
  } else if (d.grappled || (a.grapple && a.grapple.targetId === d.id) || (d.guillo && d.guillo.atkId === a.id && d.guillo.phase === "drive") || a.hokitShot) {
    kind = "takedown"; delay = 0.2;
  }
  ccWant(c, ccTake(c, kind, a, d, { delay: delay }, false));
}

// Any elbow that lands: a crit is a big elbow, more than one close together is "elbows".
function ccElbow(c, a, d, opts) {
  if (!a || opts.blade) return false; // (Tony's katana elbows are slashes)
  var list = (c.elbows[a.id] || []).filter(function (t) { return c.t - t <= COMMENTARY_ELBOWS; });
  list.push(c.t);
  c.elbows[a.id] = list;
  if (opts.crit) return ccWant(c, ccTake(c, list.length >= 2 ? "elbows" : "bigElbow", a, d, opts, false));
  if (list.length >= 3) return ccWant(c, ccTake(c, "elbows", a, d, opts, false));
  return false;
}

// A right hand: Gaethje's that sends them reeling, a right right after a left, or just a big right.
function ccRight(c, a, d) {
  if (ccIs(a, "c-justin-gaethje") && d && d.alive && d.dizzy) return "gaethjeKnockdownRight";
  if (a && c.lefts[a.id] != null && c.t - c.lefts[a.id] <= COMMENTARY_LEFT_RIGHT) { c.lefts[a.id] = null; return "leftRight"; }
  return "rightHand";
}

// A combination that all landed (combos.js): a jab then a cross is a left and a right.
function ccCombo(opts) {
  var s = opts.steps || [];
  for (var i = 0; i + 1 < s.length; i++) if (s[i] === "jab" && s[i + 1] === "cross" && ccRand() < 0.4) return "leftRight";
  return "combo";
}

// Nobody talking, nothing due: a call can start.
function ccQuiet(c) {
  if (announcer || !balls[0] || !balls[1] || speaking(balls[0]) || speaking(balls[1]) || !ccTalkFree()) return false;
  if (typeof hwFlash !== "undefined" && hwFlash) return false; // Max's flashback cutscene (holloway.js)
  for (var i = 0; i < COMMENTARY_HOLDS.length; i++) if (balls.some(COMMENTARY_HOLDS[i])) return false;
  return true;
}

// The talk channel (audio.js) is free, or its line is nearly done (ours waits for it).
function ccTalkFree() {
  try {
    if (typeof audioCtx === "undefined" || !audioCtx || audioCtx.state !== "running") return true;
    var now = audioCtx.currentTime;
    if (now >= talkEnd) return true;
    return !talkQueued && talkEnd - now <= COMMENTARY_TALK_WAIT;
  } catch (e) { return true; }
}

function ccPick(c, kind) {
  var all = ccLines(kind);
  if (!all.length) return null;
  var fresh = all.filter(function (t) { return !c.heard[t]; });
  if (!fresh.length) { all.forEach(function (t) { c.heard[t] = false; }); fresh = all; }
  var line = fresh[Math.floor(ccRand() * fresh.length)];
  c.heard[line] = true;
  return line;
}

function ccFire(c, r) {
  var line = ccPick(c, r.kind);
  if (!line) return;
  announce(line, { who: COMMENTARY_CALLS[r.kind].who || COMMENTARY_WHO, commentary: true });
  c.mine = announcer;
  c.kindT[r.kind] = c.t; c.done[r.kind] = true;
  if (!r.end) { c.cool = COMMENTARY_GAP; c.n++; }
  c.log.push({ t: Math.round(c.fightT * 10) / 10, kind: r.kind, line: line, by: r.a && r.a.char ? r.a.char.id : null });
}

// From update(), every frame, after the chatter: knockouts, the end of the
// fight, Max Holloway's call, and a waiting call starting in a quiet spell.
function tickCommentaryCalls(dt) {
  if (!COMMENTARY_ON || !started || !balls) return;
  var c = ccState();
  c.t += dt;
  if (!over) c.fightT += dt;
  if (c.cool > 0) c.cool -= dt;
  if (announcer && announcer !== c.mine) c.otherT = c.t; // someone else's call is up
  // Knocked out: out cold (koOut), or from a knockout hit.
  balls.forEach(function (b, i) {
    var p = c.prev[i], o = balls[1 - i];
    if (p) {
      if (b.koOut && !p.koOut) commentaryCall("instantKo", o, b);
      else if (!b.alive && p.alive && !p.koOut && winBy !== "submission") commentaryCall(p.hp >= MAX_HP * COMMENTARY_ONE_SHOT ? "instantKo" : "ko", o, b);
    }
    c.prev[i] = { alive: b.alive, hp: b.hp, koOut: b.koOut };
  });
  if (over && c.overT == null) {
    c.overT = c.t;
    c.want = null;
    var w = balls[0].alive ? balls[0] : (balls[1].alive ? balls[1] : null);
    if (w && w.hp <= MAX_HP * COMMENTARY_CLOSE) commentaryCall("fightEnd", w, balls[1 - w.id]);
  }
  // Once, early in a Max Holloway fight (asked again until it gets its quiet spell).
  if (!over && !c.done.hollowayFight && c.fightT >= c.hwAt && c.fightT < c.hwAt + 20 && !(c.want && c.want.kind === "hollowayFight")) {
    var mx = ccIs(balls[0], "c-max-holloway") ? balls[0] : (ccIs(balls[1], "c-max-holloway") ? balls[1] : null);
    if (mx && mx.alive) commentaryCall("hollowayFight", mx, balls[1 - mx.id]);
  }
  if (!over) {
    var r = c.want;
    if (r && r.resolve) { ccResolve(c, r); r = c.want; }
    if (r && c.t > r.until) c.want = r = null;
    if (r && c.t >= r.at && c.fightT >= COMMENTARY_FIRST && c.cool <= 0 && c.n < COMMENTARY_MAX && ccQuiet(c)) { c.want = null; ccFire(c, r); }
    if (c.end && c.t - c.end.t0 > 6) c.end = null; // (a knockout call whose fight went on)
    return;
  }
  var e = c.end;
  if (!e) return;
  if (c.otherT >= Math.min(e.t0, c.overT) - 2 || c.t > c.overT + COMMENTARY_END_WAIT) { c.end = null; return; } // their own finish call, or too late
  if (c.t - c.overT < COMMENTARY_END_DELAY || !ccQuiet(c)) return;
  c.end = null;
  ccFire(c, e);
}

// One of our calls is on the talk channel right now. A fighter's line that
// comes up meanwhile waits for it instead of being skipped (say, speech.js),
// so a call never costs a fighter his line. Sound only: the line's bubble and
// everything the fight reads run on time as before.
function commentaryTalking() {
  if (!cc || cc.balls !== balls || !cc.mine || announcer !== cc.mine) return false;
  try { return !!(typeof audioCtx !== "undefined" && audioCtx && audioCtx.state === "running" && audioCtx.currentTime < talkEnd); }
  catch (e) { return false; }
}
// The lower-third up right now is one of our calls (chatter.js never waits on
// those: nothing the fight does may depend on them).
function commentaryMine() { return !!(cc && cc.balls === balls && cc.mine && announcer === cc.mine); }
// A fighter's own commentator call (announce from his file, or chatter's)
// outranks ours: ours stops so theirs is heard (announce, speech.js).
function commentaryYield() {
  if (commentaryTalking()) stopTalk();
}

// What got called this fight (for the test harness): [{ t, kind, line, by }].
function commentaryLog() { return cc && cc.balls === balls ? cc.log.slice() : []; }
