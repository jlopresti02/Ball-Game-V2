// Carlos Prates, "The Nightmare" (Christian, 2026-11-13; footwork and the
// Cigarette redone to Christian's notes, 2026-11-14). Welterweight, on the
// Kicker base: the long, lanky Brazilian kickboxer from Taubate who smokes on
// fight day. Everything below is set in his character file under "prates"
// (and his special, teep, elbow, knee and combos blocks); leave a block out
// and that part is switched off.
//
// Lanky      (prates.lanky) he's drawn a little narrower (`wide`) and taller
//            (`tall`) than a round ball: the tallest-looking welterweight.
// In and out (prates.range) he fights at the end of his long straight (punch
//            reach 52) and his kicks (reach 84, the longest in the game), and
//            he never walks a straight line. He backs out to the end of his
//            kick (`outGap`, for up to `outTime` seconds) at an angle off
//            straight back (`outAngle`, a fresh side each time), bounces
//            there for a beat (`set`), then comes back in on a different
//            entrance every time (`entries`, relative odds, never the same one
//            twice in a row): curving in from his left or his right, straight
//            down the middle, wide round the outside before cutting in, or a
//            switch (starts one way, cuts back the other). With `fireIn` the
//            kick (or the straight) goes off the moment he's in range, and he's
//            straight back out. Inside `keep` he backs out now; past `press` he
//            comes in whatever he was doing; after `inTime` seconds coming in
//            he resets. When they come charging faster than `closing` he
//            steps off the line at an angle and fires as they arrive (at most
//            every `counterCd` seconds, if the kick or the straight is ready
//            within `counterReady`). Never backs into the cage: inside `wall`
//            of it he slides along it. With `squaredUp` he backs off facing
//            them, so a shot while he backs up isn't a grab from behind.
// Teep       the "teep" block (teep.js): the front push kick that shoves them
//            back out when they come in.
// Backs off shots (prates.backOff) a takedown shot or a grab on him (a
//            Grappler's grab, a double leg, Tony Ferguson's or Mighty Mouse's
//            shot, a counter-grab): `chance`% of the time he steps back out of
//            it ("STEPS OUT") at `step`, and for `window` seconds answers with a
//            kick, the straight or a teep (`counter`, relative odds) as they
//            come after him.
// Guard      (prates.guardAvoid) `chance`% of the times they pull guard he
//            won't follow them down (like Max Holloway): he circles `margin`
//            outside the circle until they stand back up.
// Low sub defense (prates.subDefense) once a choke or an armbar is on him
//            he's in trouble: `extraTap`% of the holds that wouldn't have made
//            him tap now do ("CAUGHT!"), and a guillotine's re-sink odds go up
//            as much. (Three of his seven losses were submissions.)
// Elbows and knees  the "elbow" and "knee" blocks (elbows.js, knees.js): sharp
//            elbows and knees up close with lots of crits, and the clinch
//            knees. In the clinch (prates.clinchCrit) his knees crit too,
//            `chance`% of them for `mult` times ("CRIT KNEE!"), and when the
//            clinch breaks he comes off it with an elbow `partingElbow`% of the
//            time. His "combos" block (combos.js) strings them together.
// Rubber Pistol (prates.rubber) a One Piece homage, under our own name: his
//            arms are rubber. Every `every` seconds (`partyEvery` while he's
//            Super Saiyan), when they're `minGap` to `maxGap` away, he plants
//            and his arm stretches way back behind him, wobbling, with a creak
//            (the tell, `windup` seconds) while a dashed red line shows where
//            it's going: it follows them, then locks for the last `lock`
//            seconds, and `readChance`% of the time they see it and sidestep
//            ("!"). Then the fist shoots out across the ring at `speed`, up to
//            `range`, for `damage` and a big knockback ("BOING!"), and snaps
//            back (`snap`). `whip.chance`% of the time it's his leg instead
//            (Rubber Whip): it stretches out to them and whips round `arc`
//            either side of the line (`whip.damage`). Both hurt as the source
//            "rubber": slipped or blocked like anything thrown, never countered
//            (nobody counter-grabs him from across the ring), and he can be
//            hit while he winds it up.
// The Cigarette  his special (special.move "cigarette"). Not before
//            `notBefore` seconds. He stops, the cigarette comes out and he
//            lights it (`light` seconds: the lighter, the flick, the flame, a
//            long drag; with look.cigarette he flicks the one he had away
//            first). From the moment he stops NOTHING touches him: every
//            strike, shot, grab, beam and thrown thing misses ("CAN'T TOUCH
//            HIM!" on the first miss and every `missFloat`th, "MISS"
//            otherwise), and no special, clinch, combo or submission can start
//            on him; with `theyCome` they storm in anyway. The party music
//            kicks in and he smokes to it for `smoke` seconds (disco lights,
//            music notes). Then SUPER SAIYAN: a gold aura bursts on, his hair
//            stands up gold, and for `party` seconds everyone still misses him,
//            only now he fights: `speed` and `attack` times as fast, `damage`
//            times as hard, combos coming every `comboEvery` seconds, and
//            `critChance`% of his punches, kicks and rubber shots crit for
//            `critMult` ("CRIT!"). Every miss on him sets up a counter
//            (`counter`): for `window` seconds he goes straight back at them,
//            and the next strike he lands is a crit for `mult` ("COUNTER
//            CRIT!"), at most one every `cd` seconds. The bar drains as it
//            runs. Then he blows out a big cloud, flicks the butt onto the mat
//            ("PARTY'S OVER"), the music fades and the aura dies down over
//            `out` seconds. The music is his real walkout song, "Purple
//            Lamborghini" (SOUND_CLIPS.pratesParty, prates-song.js, like
//            Volkanovski's "Down Under"); with `song` false, or without that
//            file, a baile funk built in code from music.js's instruments at
//            `musicLevel`. Either way the background music drops out, and it
//            dips under anyone talking.
// Cigarette look (look.cigarette, default on) a cigarette in his mouth all
//            fight, a faint wisp of smoke off the tip (`look.cigWisp`). Off,
//            it only comes out for the special.
// Voice lines (prates.lines, read through say(), speech.js; odds in
//            `lineOdds`, at most one every `gap` seconds; timing in
//            `lineTiming`): `start` (the walkout, a second into the fight),
//            `taunt` (after a clean combo, or now and then at range, every
//            `tauntEvery` seconds), `punches` (once he's landed `punchRun`
//            punches inside `punchWin` seconds), `smoke` (every time he lights
//            up), `party` (every time the music starts) and `win`. The big
//            moments (start, smoke, party, win) play every time: if someone's
//            talking they wait their turn, up to `bigWait` seconds, in order.
//            The rest roll their odds and hold off while a big one waits.
// His state is b.pr, the footwork b.pr.ft, the Rubber Pistol b.prRub, the
// cigarette b.pr.smoke.
"use strict";

SPECIAL_MOVES.cigarette = "The Cigarette"; // (registered here, so fighters built in parallel don't all edit special.js's table)
PROJECTILE_SOURCES.rubber = true; // the Rubber Pistol lands from across the ring: slipped or blocked like anything thrown, never countered (match.js)

var PR_LIGHT_UP = 0.3;      // into the light: the cigarette comes up to his mouth
var PR_LIGHT_FLICK = 0.42;  // the lighter flicks
var PR_LIGHT_DRAG = 0.66;   // the flame on the tip, and the long drag
var PR_DRAG_EVERY = 1.3;    // a drag every so often while he parties
var PR_RUB_BACK = 1.7;      // how far the arm stretches back behind him in the wind-up (ball radii)
var PR_BPM = 130;           // the baile funk's tempo (he bounces on it)
var PR_PUFF_MAX = 90;

var PR_STRIKES = { punch: true, kick: true, kickback: true, rubber: true, teep: true, elbow: true, knee: true, kopunch: true }; // what a counter crit can land on
var PR_SAIYAN_CRITS = { punch: true, kick: true, kickback: true, rubber: true, teep: true, kopunch: true }; // (elbows and knees roll their own crits)
var PR_ENTRIES = ["left", "right", "straight", "wide", "switch"];

var prClock = 0;            // drawing clock (game time)
var prPuffs = [];           // smoke: { x, y, vx, vy, t, dur, r0, r1 }
var prButts = [];           // cigarette butts flicked onto the mat
var prNotes = [];           // music notes floating up off him while he parties
var prGhosts = [];          // gold afterimages where he was when something missed him
var prLights = { k: 0, want: 0 }; // the disco lights fading in and out
var prMusic = null;         // the baile funk playing: { gain, src, level, ducked }

function prCfg(b) { return b && b.char && b.char.prates; }
function prRand(r) { return r[0] + Math.random() * (r[1] - r[0]); }
function prTurn(a, want, maxStep) { var d = Math.atan2(Math.sin(want - a), Math.cos(want - a)); return a + Math.max(-maxStep, Math.min(maxStep, d)); }
function prDist(a, b) { var dx = b.x - a.x, dy = b.y - a.y; return Math.sqrt(dx * dx + dy * dy) || 1; }
function prDemo() { return typeof galleryDemo !== "undefined" && galleryDemo && galleryDemo.kind === "special"; }
function prSmoke(b) { return b && b.pr ? b.pr.smoke : null; }
function prLighting(b) { var sm = prSmoke(b); return !!(sm && sm.phase === "light"); }
// Stopped to light up and smoke: planted, nothing touches him.
function prPlanted(b) { var sm = prSmoke(b); return !!(sm && (sm.phase === "light" || sm.phase === "smoke")); }
// Super Saiyan.
function prPartyOn(b) { var sm = prSmoke(b); return !!(sm && sm.phase === "party" && b.alive); }
// The whole show, from the moment he stops to the end of Super Saiyan: everything misses.
function prUntouchable(b) { var sm = prSmoke(b); return !!(sm && b.alive && (sm.phase === "light" || sm.phase === "smoke" || sm.phase === "party")); }
// The party's on (the music, the lights): smoking or Super Saiyan.
function prMusicOn(b) { var sm = prSmoke(b); return !!(sm && b.alive && (sm.phase === "smoke" || sm.phase === "party")); }
function prCigLook(b) { return !!(b && b.char && b.char.look && b.char.look.cigarette); }
function prCall(kind, a, d) { if (typeof commentaryCall === "function") commentaryCall(kind, a, d); } // the shared commentator calls (commentary-calls.js), when that branch is in
function prSegDist(px, py, ax, ay, bx, by) {
  var vx = bx - ax, vy = by - ay, l2 = vx * vx + vy * vy, k = l2 > 0 ? ((px - ax) * vx + (py - ay) * vy) / l2 : 0;
  k = Math.max(0, Math.min(1, k));
  var qx = ax + vx * k - px, qy = ay + vy * k - py;
  return Math.sqrt(qx * qx + qy * qy);
}
function prPick(odds) {
  var keys = Object.keys(odds || {}), tot = 0;
  keys.forEach(function (k) { tot += odds[k]; });
  var x = Math.random() * tot;
  for (var i = 0; i < keys.length; i++) { x -= odds[keys[i]]; if (x < 0) return keys[i]; }
  return keys[0] || null;
}

// ---------------------------------------------------------------- hooks into shared files

// From the physics' speed regulator (physics.js): planted for the Rubber
// Pistol, or stopped to light up and smoke.
function pratesBusy(b) { return !!(b && (b.prRub || prPlanted(b))); }
// From specialBusy (special.js): from the moment he stops to smoke until
// Super Saiyan ends, no special, clinch, combo or submission starts on him.
function pratesPartyBusy(b) { return prUntouchable(b); }
// From drawHands (draw-attacks.js): drawn by drawPrates instead.
function pratesHandsBusy(b) { return !!(b && b.alive && (b.prRub || prLighting(b))); }
// From facingOf (grapple-duel.js): he backs off facing them.
function pratesSquaredUp(b) {
  var rc = prCfg(b) && prCfg(b).range;
  return !!(rc && rc.squaredUp && b.pr && b.alive && !b.angry && !prPlanted(b));
}

// From startMatchSeeded.
function resetPrates() {
  prClock = 0; prPuffs = []; prButts = []; prNotes = []; prGhosts = []; prLights = { k: 0, want: 0 };
  prMusicStop(0.05);
}

// From makeBall (after its weight class is applied).
function initPrates(b) {
  b.pr = null; b.prRub = null;
  var cfg = prCfg(b);
  if (!cfg) return;
  b.pr = {
    fightT: 0, side: Math.random() < 0.5 ? -1 : 1, counterCd: 0, rubT: cfg.rubber ? prRand(cfg.rubber.first) : 0,
    ft: { mode: "set", t: 0, dur: 0.6, side: Math.random() < 0.5 ? -1 : 1, last: null, outSide: 0, struck: false },
    smoke: null, subSeen: null, inPlum: false, said: {}, lineCd: 0, guardSeen: null, guardAvoid: false,
    counterWant: null, counterT: 0, dragT: 0, saved: null, partyN: 0,
    cc: null, ccCd: 0, landed: [], tauntT: prRand((cfg.lineTiming && cfg.lineTiming.tauntEvery) || [16, 26]), pend: [], cmbRef: null
  };
  var sp = b.char.special;
  if (b.char.hasSpecial && sp && sp.move === "cigarette" && sp.music !== false) {
    if (sp.song !== false && typeof SOUND_CLIPS !== "undefined" && SOUND_CLIPS.pratesParty) withClip("pratesParty"); // decode the real song early
    else try { renderMusic("prBaile", function () {}); } catch (e) { /* the song gets built ahead of the party (music.js) */ }
  }
}

// ---------------------------------------------------------------- every frame

// From update(): the cigarette's clock, his footwork, his lines, the holds on
// him, the clinch, Super Saiyan's counters, the smoke, the butts and the music.
function tickPrates(dt) {
  prClock += dt;
  tickPrFx(dt);
  prMusicDuck();
  if (!balls) return;
  balls.forEach(function (b) {
    var s = b.pr;
    if (!s) return;
    var cfg = prCfg(b), other = balls[1 - b.id];
    if (s.lineCd > 0) s.lineCd -= dt;
    prLines(b, other, dt);
    prSmokeTick(b, other, dt);
    prWisp(b, dt);
    if (!started || over || !b.alive) return;
    s.fightT += dt;
    if (s.counterCd > 0) s.counterCd -= dt;
    if (s.rubT > 0) s.rubT -= dt;
    if (s.ccCd > 0) s.ccCd -= dt;
    prSubDefense(b, other, cfg);
    prClinch(b, other, cfg);
    prCounter(b, other, cfg, dt);
    prSaiyan(b, other, dt);
    if (!prGuardAvoid(b, other, cfg, dt)) prSteer(b, other, cfg, dt);
  });
}

// From the abilities loop, before the teep: stopped to light up and smoke (he
// does nothing else) and the Rubber Pistol. True while one of them has him.
function updatePrates(self, other, dt) {
  var s = self.pr, cfg = prCfg(self);
  if (!s || !cfg) return false;
  if (prPlanted(self)) {
    var k = Math.exp(-12 * dt); self.vx *= k; self.vy *= k;
    return true;
  }
  if (self.prRub) return prRunRubber(self, other, cfg.rubber, dt);
  if (!started || over) return false;
  var rb = cfg.rubber;
  if (rb && s.rubT <= 0 && prRubReady(self, other, rb)) { prStartRubber(self, other, rb); return true; }
  return false;
}

// ---------------------------------------------------------------- voice lines

// One of his lines from prates.lines[key] (Christian's picks, exact game
// text), `lineOdds[key]`% of the time, when he's free to talk. The moments'
// lines (punches, taunts) roll their odds and wait out the gaps; they also
// hold off while one of the big lines (below) is waiting its turn.
function prSay(b, key, force) {
  var cfg = prCfg(b), pool = cfg && cfg.lines && cfg.lines[key], odds = (cfg && cfg.lineOdds) || {}, s = b.pr;
  if (!pool || !pool.length || !s) return false;
  if (!force && (s.lineCd > 0 || !canSay(b) || s.pend.length)) return false;
  if (Math.random() * 100 >= (odds[key] != null ? odds[key] : 100)) return false;
  var text = pickLine(b, pool, "pr" + key);
  if (!text) return false;
  say(b, text);
  s.lineCd = odds.gap || 5;
  return true;
}

// Someone still talking: the talk channel's busy (audio.js: any fighter,
// the commentator), or a line's still up on screen.
function prVoiceBusy(b) {
  if (typeof talkEnd !== "undefined" && typeof audioCtx !== "undefined" && audioCtx && audioCtx.currentTime < talkEnd - 0.1) return true;
  return balls.some(function (o) { return speaking(o) && !speechOf(o).hidden; });
}
// The big moments' lines (the walkout, lighting up, the party music starting,
// the win) play EVERY time (Christian, 2026-11-14): if someone's talking the
// line waits its turn, up to `wait` seconds, rather than being dropped. In
// order, one at a time.
function prQueue(b, key, wait) {
  var cfg = prCfg(b), pool = cfg && cfg.lines && cfg.lines[key];
  if (!pool || !pool.length) return;
  b.pr.pend.push({ key: key, t: wait });
}
function prPendTick(b, dt) {
  var s = b.pr, q = s.pend[0];
  if (s.pendHold > 0) s.pendHold -= dt;
  if (!q) return;
  q.t -= dt;
  if (!b.alive && q.key !== "win") { s.pend = []; return; }
  if (q.t <= 0) { s.pend.shift(); return; }
  if (s.pendHold > 0 || prVoiceBusy(b)) return;
  s.pend.shift();
  prSay(b, q.key, true);
  s.pendHold = 0.5; // (the clip's still decoding for a moment before the talk channel knows it's playing)
}

function prLines(b, other, dt) {
  var s = b.pr, lt = prCfg(b).lineTiming || {};
  if (!started) return;
  var big = lt.bigWait || 8;
  if (!s.said.start && !over && s.fightT > 1.2) { s.said.start = true; prQueue(b, "start", big); }
  if (over && b.alive && !other.alive && !s.said.win) {
    s.winT = (s.winT || 0) + dt;
    if (s.winT > 0.9) { s.said.win = true; s.pend = []; prQueue(b, "win", big); }
  }
  prPendTick(b, dt);
  if (over || !b.alive) return;
  // Landing punches: "I'm not here to play."
  var run = lt.punchRun || 3, win = lt.punchWin || 4;
  s.landed = s.landed.filter(function (t) { return s.fightT - t < win; });
  if (s.landed.length >= run && !prUntouchable(b) && prSay(b, "punches", false)) s.landed = [];
  // Now and then at range, a taunt.
  s.tauntT -= dt;
  if (s.tauntT <= 0) {
    var gap = prDist(b, other) - b.r - other.r;
    if (gap > 60 && !prUntouchable(b) && !b.prRub && inOrdinaryMovement(b)) {
      prSay(b, "taunt", false);
      s.tauntT = prRand(lt.tauntEvery || [16, 26]);
    }
  }
  // After a clean combo (every strike landed): he punches, knees, kicks.
  if (b.cmb) s.cmbRef = b.cmb;
  else if (s.cmbRef) {
    var m = s.cmbRef; s.cmbRef = null;
    if (m.n >= 3 && m.hits >= m.n && !prPartyOn(b)) prSay(b, "taunt", false);
  }
}

// ---------------------------------------------------------------- footwork

// How much room there is a little way along heading `a` before the cage.
function prRoom(x, y, a, look) {
  var px = x + Math.cos(a) * look, py = y + Math.sin(a) * look;
  return Math.min(px, W - px, py, H - py);
}
// Backing up into the cage: slide along it instead, whichever way has more room.
function prWallSafe(b, want, side, rc, to) {
  if (prRoom(b.x, b.y, want, rc.wall || 70) > b.r) return want;
  var best = want, bestRoom = -1e9;
  [to + Math.PI - side * (rc.angle || 0.5), to + Math.PI + side * (rc.angle || 0.5), to + Math.PI / 2, to - Math.PI / 2, to + Math.PI * 0.7, to - Math.PI * 0.7].forEach(function (a) {
    var room = prRoom(b.x, b.y, a, rc.wall || 70);
    if (room > bestRoom) { bestRoom = room; best = a; }
  });
  return best;
}

// Backing out: to the end of his kick, at an angle off straight back, a
// fresh side each time (`charge`: they're coming hard, so wider off the line).
function prFootOut(b, f, rc, charge) {
  var ang = prRand(rc.outAngle || [0.35, 0.9]);
  if (charge) ang = Math.max(ang, 0.6) + 0.25;
  // Mostly the other side from last time, now and then the same one.
  var side = f.outSide ? (Math.random() < 0.72 ? -f.outSide : f.outSide) : (Math.random() < 0.5 ? -1 : 1);
  f.mode = "out"; f.t = 0; f.dur = prRand(rc.outTime || [0.45, 0.9]); f.goal = prRand(rc.outGap || [70, 95]);
  f.ang = ang; f.side = side; f.outSide = side; f.struck = false;
}
// A beat at range: a bounce sideways before he comes back in.
function prFootSet(b, f, rc) {
  f.mode = "set"; f.t = 0; f.dur = prRand(rc.set || [0.15, 0.45]); f.side = Math.random() < 0.5 ? -1 : 1;
}
// Coming back in, on a different entrance from last time.
function prFootIn(b, f, rc, gap) {
  var odds = rc.entries || {}, pool = {}, any = false;
  PR_ENTRIES.forEach(function (e) {
    var w = odds[e] != null ? +odds[e] : 1;
    if (w > 0 && e !== f.last) { pool[e] = w; any = true; }
  });
  var e = any ? prPick(pool) : (f.last || "straight");
  f.mode = "in"; f.t = 0; f.entry = e; f.last = e; f.gap0 = Math.max(gap, 40); f.struck = false;
  f.arc = prRand([0.6, 0.95]);
  f.side = e === "left" ? 1 : (e === "right" ? -1 : (Math.random() < 0.5 ? -1 : 1));
}
// How far off the straight line to them he's heading, coming in on entrance
// f.entry, `p` from 1 (just set off) down to 0 (in range).
function prEntryOff(f, p) {
  if (f.entry === "straight") return Math.sin(f.t * 9) * 0.1;                         // straight down the middle, a little bob
  if (f.entry === "wide") return f.side * (p > 0.45 ? 1.3 : 1.3 * p / 0.45);          // round the outside, then cuts in
  if (f.entry === "switch") return f.side * f.arc * 1.15 * Math.sin(Math.PI * 2 * p); // one way, then cuts back the other
  return f.side * f.arc * Math.min(1, p * 1.3);                                        // curving in from the left or the right
}

// In and out, never on rails: he backs out to the end of his kick at an
// angle, bounces there a beat, then comes back in on a different entrance
// and fires as he arrives; when they come charging he steps off the line and
// fires as they arrive.
function prSteer(b, other, cfg, dt) {
  var rc = cfg.range, s = b.pr, f = s.ft;
  if (!rc || !f || !inOrdinaryMovement(b) || b.dizzy || b.angry || b.cmb || !other.alive || other.koOut) return;
  f.t += dt;
  var dx = other.x - b.x, dy = other.y - b.y, d = Math.sqrt(dx * dx + dy * dy) || 1, gap = d - b.r - other.r;
  var ux = dx / d, uy = dy / d, to = Math.atan2(dy, dx), want, rate = rc.rate || 5;
  var closing = -(other.vx * ux + other.vy * uy); // their speed toward him
  var charging = closing > rc.closing && gap < (rc.keep || 30) * 2.4;
  var ki = b.char.hasKick ? b.char.kick : null, pu = b.char.hasPunch ? b.char.punch : null;
  var busy = b.punch || b.kick || b.teep || b.elbowAnim || b.kneeAnim || b.koPunch;
  // Switching modes.
  if (charging && (f.mode !== "out" || f.t > 0.5)) prFootOut(b, f, rc, true);
  else if (f.mode === "in") {
    if (busy) f.struck = true;
    else if (f.struck || gap < (rc.keep || 30) || f.t > (rc.inTime || 1.4)) prFootOut(b, f, rc, false);
  } else if (gap > (rc.press || 150)) prFootIn(b, f, rc, gap);
  else if (f.mode === "out" && (gap >= f.goal || f.t >= f.dur)) prFootSet(b, f, rc);
  else if (f.mode === "set" && f.t >= f.dur) prFootIn(b, f, rc, gap);
  if (f.mode === "in") {
    // Where he wants to get to: the end of his kick, or closer for a combination that's due.
    var reach = ki ? ki.reach : (pu ? pu.reach : 40);
    var comboDue = b.char.combos && !b.cmb && b.cmbT != null && b.cmbT <= 0.4;
    if (comboDue || (ki && b.kickCd > 0.6 && pu)) reach = pu ? pu.reach : reach;
    var p = Math.max(0, Math.min(1, (gap - reach) / Math.max(1, f.gap0 - reach)));
    want = to + prEntryOff(f, p);
    if (prRoom(b.x, b.y, want, rc.wall || 70) <= b.r) want = to; // the cage is in the way: straight at them
    // Fires as he arrives: the long kick, or the straight.
    if (rc.fireIn && !busy && !comboDue && !b.cmb) {
      if (ki && gap < ki.reach && b.kickCd <= (rc.counterReady || 0.5)) b.kickCd = 0;
      else if (pu && gap < pu.reach && b.punchCd <= (rc.counterReady || 0.5)) b.punchCd = 0;
    }
  } else if (f.mode === "out") {
    want = prWallSafe(b, to + Math.PI - f.side * f.ang, f.side, rc, to);
  } else {
    want = prWallSafe(b, to + f.side * (Math.PI / 2 - 0.15), f.side, rc, to); rate *= 0.7; // a bounce sideways at range
  }
  var sp = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
  if (sp >= 1) {
    var nu = prTurn(Math.atan2(b.vy, b.vx), want, rate * dt);
    b.vx = Math.cos(nu) * sp; b.vy = Math.sin(nu) * sp;
  }
  // They came charging: fires as they arrive, the long kick or the straight.
  if (charging && s.counterCd <= 0 && !busy && !b.cmb) {
    if (ki && gap < ki.reach && b.kickCd <= (rc.counterReady || 0.5)) { b.kickCd = 0; s.counterCd = rc.counterCd; }
    else if (pu && gap < pu.reach && b.punchCd <= (rc.counterReady || 0.5)) { b.punchCd = 0; s.counterCd = rc.counterCd; }
  }
}

// They pulled guard: he stays out of the circle and circles it until they're
// back up. True while he's doing that (his normal steering is off).
function prGuardAvoid(b, other, cfg, dt) {
  var ga = cfg.guardAvoid, g = other.guard, s = b.pr;
  if (!ga || !g) { s.guardSeen = null; return false; }
  if (s.guardSeen !== g) { s.guardSeen = g; s.guardAvoid = Math.random() * 100 < ga.chance; }
  if (!s.guardAvoid || g.getup >= 0 || !inOrdinaryMovement(b)) return false;
  var dx = b.x - other.x, dy = b.y - other.y, d = Math.sqrt(dx * dx + dy * dy) || 1, ux = dx / d, uy = dy / d;
  var edge = g.radius + ga.margin;
  if (d > edge + 40) return false;
  var sp = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
  if (sp >= 1) {
    var round = Math.atan2(uy, ux) + s.side * Math.PI / 2;
    var nu = prTurn(Math.atan2(b.vy, b.vx), round, 6 * dt);
    b.vx = Math.cos(nu) * sp; b.vy = Math.sin(nu) * sp;
  }
  var in0 = b.vx * ux + b.vy * uy;
  if (d < edge && in0 < 0) { b.vx -= 2 * in0 * ux; b.vy -= 2 * in0 * uy; } // heading in: off the edge of the circle
  if (d < edge) { b.x = other.x + ux * edge; b.y = other.y + uy * edge; }
  return true;
}

// ---------------------------------------------------------------- backing out of shots

// From attemptGrab (grapple-duel.js): a shot or a grab on him. From the
// moment he stops to smoke until Super Saiyan ends it always misses;
// otherwise `backOff.chance`% of the time he steps back out of it and answers
// with a strike. True if the grab's off.
function pratesBackOff(attacker, target) {
  var cfg = prCfg(target), s = target.pr;
  if (!cfg || !s || !target.alive || attacker === target) return false;
  var party = prUntouchable(target), bo = cfg.backOff;
  if (party && prPlanted(target)) {
    // Smoking: it just slides off him, he doesn't move.
    attacker.vx *= 0.3; attacker.vy *= 0.3;
    if (attacker.char.grapple) attacker.grappleCd = Math.max(attacker.grappleCd || 0, attacker.char.grapple.cooldown);
    prMissed(target, attacker);
    return true;
  }
  if (!party) {
    if (!bo || over || target.prRub || target.koOut || target.dizzy || target.dazed || target.shocked || target.shelled ||
        target.slam || subLocked(target) || target.plum || target.grapple) return false;
    if (Math.random() * 100 >= bo.chance) return false;
  }
  var dx = target.x - attacker.x, dy = target.y - attacker.y, d = Math.sqrt(dx * dx + dy * dy) || 1;
  var rc = cfg.range || { wall: 70, angle: 0.5 };
  var a = prWallSafe(target, Math.atan2(dy, dx), s.side, rc, Math.atan2(-dy, -dx));
  var step = bo ? bo.step : 460;
  target.vx = Math.cos(a) * step; target.vy = Math.sin(a) * step;
  target.knockFly = Math.max(target.knockFly || 0, 0.14);
  target.weaveAnim = { t: 0, dur: 0.22, sign: Math.random() < 0.5 ? -1 : 1 };
  attacker.vx *= 0.3; attacker.vy *= 0.3;
  if (attacker.char.grapple) attacker.grappleCd = Math.max(attacker.grappleCd || 0, attacker.char.grapple.cooldown);
  if (party) prMissed(target, attacker);
  else {
    floater((attacker.x + target.x) / 2, Math.min(attacker.y, target.y) - target.r - 30, "STEPS OUT", "dodge");
    if (bo && bo.counter) { s.counterWant = prPick(bo.counter); s.counterT = bo.window || 1; }
  }
  playPrBackOff();
  return true;
}

// The answer after he steps out of a shot: a kick, the straight or a teep
// as they come after him.
function prCounter(b, other, cfg, dt) {
  var s = b.pr, want = s.counterWant;
  if (!want) return;
  s.counterT -= dt;
  if (s.counterT <= 0 || !other.alive || other.koOut) { s.counterWant = null; return; }
  if (prPlanted(b) || b.prRub || b.punch || b.kick || b.teep || b.elbowAnim || b.kneeAnim || b.plum || b.cmb || !inOrdinaryMovement(b) || b.dizzy) return;
  var gap = prDist(b, other) - b.r - other.r;
  if (want === "kick" && b.char.hasKick) {
    if (gap > b.char.kick.reach) return;
    b.kick = { t: 0, hit: false }; b.kickCd = b.char.kick.cooldown;
  } else if (want === "teep" && b.char.hasTeep) {
    if (gap > b.char.teep.range * 1.5) return;
    forceTeep(b);
  } else if (b.char.hasPunch) {
    if (gap > b.char.punch.reach) return;
    b.punch = { t: 0, hit: false }; b.punchCd = b.char.punch.cooldown;
  }
  s.counterWant = null;
}

// ---------------------------------------------------------------- low submission defense

// A choke or an armbar on him: once it's on, he's in trouble.
function prSubDefense(b, other, cfg) {
  var sd = cfg.subDefense, s = b.pr;
  if (!sd || !b.alive) return;
  var hold = null;
  if (other.rnc && other.rnc.vicId === b.id) hold = other.rnc;
  else if (other.armbar && other.armbar.vicId === b.id) hold = other.armbar;
  else if (other.guillo && other.guillo.atkId === b.id && other.guillo.phase === "squeeze") hold = other.guillo;
  else if (other.tfSub && other.tfSub.vicId === b.id && other.tfSub.phase === "squeeze") hold = other.tfSub; // Tony Ferguson's chokes (ferguson.js)
  if (!hold || hold === s.subSeen) return;
  s.subSeen = hold;
  if (hold.tapChance != null) hold.tapChance = Math.min(95, hold.tapChance + sd.extraTap); // (a guillotine's re-sink rolls again)
  if (!hold.taps && Math.random() * 100 < sd.extraTap) {
    hold.taps = true;
    floater(b.x, b.y - b.r - 70, "CAUGHT!", "crit");
  }
}

// ---------------------------------------------------------------- the clinch

// When the clinch breaks he comes off it with an elbow.
function prClinch(b, other, cfg) {
  var cc = cfg.clinchCrit, s = b.pr;
  if (!cc) return;
  if (b.plum && b.plum.phase === "hold") { s.inPlum = true; return; }
  if (!s.inPlum) return;
  s.inPlum = false;
  if (!b.char.elbow || !other.alive || other.koOut || b.elbowAnim || b.punch || b.kick || !inOrdinaryMovement(b)) return;
  if (prDist(b, other) - b.r - other.r > b.char.elbow.reach + 30) return;
  if (Math.random() * 100 >= cc.partingElbow) return;
  throwElbow(b, other, { reach: b.char.elbow.reach + 50 });
}

// From hurt (match.js): what he lands in Super Saiyan (harder, crits, the
// counter crit), his knees critting in the clinch, and the punches he lands
// (for his "landing punches" line).
function pratesDamageMult(b, source, attackerId) {
  if (source === "kofinal") return 1;
  var atk = attackerId != null ? balls[attackerId] : null;
  if (!atk || atk === b || !atk.pr) return 1;
  var m = 1, s = atk.pr, cfg = prCfg(atk), sp = atk.char.special;
  var mine = source !== "kopunch" || !!(atk.koPunch && atk.koPunch.cb); // (a hook in his combination; any other knockout punch is left alone)
  if (source === "punch") s.landed.push(s.fightT);
  if (prPartyOn(atk) && sp && mine && source !== "laser") {
    m *= sp.damage || 1; // powered up
    var cc = s.cc, co = sp.counter || {};
    if (cc && PR_STRIKES[source]) {
      // The counter after a miss: it crits.
      s.cc = null;
      m *= co.mult || 2.2;
      prCritFx(atk, b, "COUNTER CRIT!");
      if (source === "punch" || source === "kopunch") prCall("rightHand", atk, b);
    } else if (PR_SAIYAN_CRITS[source] && Math.random() * 100 < (sp.critChance || 0)) {
      m *= sp.critMult || 2;
      prCritFx(atk, b, "CRIT!");
    }
  }
  var cc2 = cfg && cfg.clinchCrit;
  if (cc2 && source === "finisher" && atk.plum && atk.plum.phase === "hold" && atk.plum.vicId === b.id && Math.random() * 100 < cc2.chance) {
    m *= cc2.mult;
    prCritFx(atk, b, "CRIT KNEE!");
  }
  return m;
}
function prCritFx(atk, b, text) {
  floater(b.x, b.y - b.r - 34, text, "crit");
  hitStop = Math.max(hitStop, 0.05);
  if (!reduceMotion) shake = Math.max(shake, 11);
  impacts.push({ x: b.x, y: b.y, nx: 0, ny: -1, life: 0.3, max: 0.3, color: prPartyOn(atk) ? "#ffd21f" : atk.char.color });
}

// ---------------------------------------------------------------- nothing touches him

// From hurt (match.js), before the weave: from the moment he stops to smoke
// until Super Saiyan ends, everything misses.
function pratesDodge(b, source, attackerId) {
  if (!prUntouchable(b) || over) return false;
  b.justDodged = true;
  if (source === "laser") return true;
  if (b.immuneCd <= 0) {
    b.immuneCd = 0.22;
    prMissed(b, attackerId != null ? balls[attackerId] : null);
  }
  return true;
}

// Something just missed him: the floater, a slip, and in Super Saiyan a gold
// afterimage and the counter it sets up.
function prMissed(b, atk) {
  var sm = b.pr.smoke, sp = b.char.special || {};
  sm.missN = (sm.missN || 0) + 1;
  var every = sp.missFloat || 3, big = sm.missN === 1 || sm.missN % every === 0;
  floater(b.x, b.y - b.r - 8, big ? "CAN'T TOUCH HIM!" : "MISS", big ? "crit" : "dodge");
  b.weaveAnim = { t: 0, dur: 0.22, sign: Math.random() < 0.5 ? -1 : 1 };
  playPrMiss();
  if (sm.phase !== "party" || !atk || atk === b) return;
  // Super Saiyan: he's already somewhere else, and he's coming back.
  if (prGhosts.length < 8 && !reduceMotion) prGhosts.push({ x: b.x, y: b.y, r: b.r, t: 0, dur: 0.35 });
  var co = sp.counter;
  if (co && b.pr.ccCd <= 0) { b.pr.cc = { t: co.window || 0.9, on: atk.id }; b.pr.ccCd = co.cd || 0.35; }
}

// Super Saiyan, every frame: combinations come quick, and after a miss he goes
// straight back at them with a strike that crits.
function prSaiyan(b, other, dt) {
  var s = b.pr, sp = b.char.special;
  if (!prPartyOn(b) || !sp) { s.cc = null; return; }
  if (b.char.combos && sp.comboEvery && !b.cmb && b.cmbT != null && b.cmbT > sp.comboEvery[1]) b.cmbT = prRand(sp.comboEvery);
  var cc = s.cc;
  if (!cc) return;
  cc.t -= dt;
  if (cc.t <= 0 || !other.alive || other.koOut) { s.cc = null; return; }
  if (b.cmb || b.punch || b.kick || b.koPunch || b.elbowAnim || b.kneeAnim || b.teep || b.prRub || !inOrdinaryMovement(b) || b.dizzy) return; // (the next one he lands crits)
  var gap = prDist(b, other) - b.r - other.r, pu = b.char.hasPunch ? b.char.punch : null, ki = b.char.hasKick ? b.char.kick : null;
  if (pu && gap < pu.reach) { b.punch = { t: 0, hit: false }; b.punchCd = pu.cooldown; }
  else if (ki && gap < ki.reach) { b.kick = { t: 0, hit: false }; b.kickCd = ki.cooldown; }
  else {
    // Out of reach: straight back at them.
    var d = prDist(b, other), v = Math.max(Math.sqrt(b.vx * b.vx + b.vy * b.vy), (b.baseSpeed || SPEED) * ((sp.counter && sp.counter.lunge) || 1.3));
    b.vx = (other.x - b.x) / d * v; b.vy = (other.y - b.y) / d * v;
  }
}

// ---------------------------------------------------------------- the Rubber Pistol

function prRubCut(b) {
  return !b.alive || b.koOut || b.grappled || b.grapple || b.slam || b.sprawl || b.sprawled || subLocked(b) || b.shocked || b.dazed ||
    b.dizzy || b.shelled || !!b.igbb || b.checkStun > 0 || swordDuelLocked(b) || b.plum || b.fknee || prPlanted(b);
}

function prRubReady(self, other, rb) {
  if (!other.alive || other.koOut || other.igbb || other.invincible || other.grappled || other.slam || subLocked(other) || specialBusy(other) || swordDuelActive()) return false;
  if (!inOrdinaryMovement(self) || self.dizzy || self.angry || self.punch || self.kick || self.koPunch || self.elbowAnim || self.kneeAnim ||
      self.teep || self.plum || self.fknee || self.cmb || prPlanted(self)) return false;
  var gap = prDist(self, other) - self.r - other.r;
  return gap >= rb.minGap && gap <= rb.maxGap;
}

function prStartRubber(self, other, rb) {
  var whip = !!(rb.whip && Math.random() * 100 < rb.whip.chance);
  var readP = (rb.readChance || 0) + (other.char.hasWeave ? 10 : 0);
  self.prRub = {
    phase: "wind", t: 0, ang: Math.atan2(other.y - self.y, other.x - self.x), kind: whip ? "whip" : "pistol",
    len: 0, side: Math.random() < 0.5 ? -1 : 1, read: Math.random() * 100 < readP, locked: false, tried: false
  };
  self.vx *= 0.25; self.vy *= 0.25;
  self.pr.rubT = prRand(prPartyOn(self) ? rb.partyEvery : rb.every);
  floater(self.x, self.y - self.r - 30, whip ? "RUBBER WHIP!" : "RUBBER PISTOL!", "crit");
  playRubberStretch(rb.windup);
}

// Where the arm (or the leg) comes out of him.
function prShoulder(b, m) {
  var ux = Math.cos(m.ang), uy = Math.sin(m.ang), px = -uy, py = ux;
  if (m.kind === "whip") return { x: b.x + ux * (b.r - 6) + px * b.r * 0.25 * m.side, y: b.y + uy * (b.r - 6) + py * b.r * 0.25 * m.side + b.r * 0.15 };
  return { x: b.x + ux * (b.r - 4) + px * b.r * 0.38 * m.side, y: b.y + uy * (b.r - 4) + py * b.r * 0.38 * m.side };
}
// How far it can stretch along the line before it would go through the cage.
function prRubMax(b, m, rb) {
  var sh = prShoulder(b, m), ux = Math.cos(m.ang), uy = Math.sin(m.ang), lim = rb.range;
  if (ux > 1e-3) lim = Math.min(lim, (W - 6 - sh.x) / ux); else if (ux < -1e-3) lim = Math.min(lim, (6 - sh.x) / ux);
  if (uy > 1e-3) lim = Math.min(lim, (H - 6 - sh.y) / uy); else if (uy < -1e-3) lim = Math.min(lim, (6 - sh.y) / uy);
  return Math.max(12, lim);
}

function prRunRubber(self, other, rb, dt) {
  var m = self.prRub;
  if (!rb || prRubCut(self) || over) { self.prRub = null; return false; }
  m.t += dt;
  var k = Math.exp(-14 * dt); self.vx *= k; self.vy *= k; // planted
  var dx = other.x - self.x, dy = other.y - self.y, d = Math.sqrt(dx * dx + dy * dy) || 1;
  if (m.phase === "wind") {
    if (m.t < rb.windup - rb.lock) m.ang = prTurn(m.ang, Math.atan2(dy, dx), dt * 7);
    else if (!m.locked) {
      m.locked = true;
      playRubberLock();
      if (m.read && other.alive && !other.koOut && inOrdinaryMovement(other)) {
        // They see it coming: a quick sidestep off the line.
        var px = -Math.sin(m.ang), py = Math.cos(m.ang), sgn = px * dx + py * dy >= 0 ? 1 : -1;
        other.vx = px * sgn * 460; other.vy = py * sgn * 460;
        other.knockFly = Math.max(other.knockFly || 0, 0.18);
        floater(other.x, other.y - other.r - 30, "!", "crit");
      }
    }
    if (m.t >= rb.windup) {
      m.phase = "shoot"; m.t = 0; m.len = 0;
      m.max = prRubMax(self, m, rb);
      if (m.kind === "whip") m.L = Math.min(m.max, Math.max(self.r, d - self.r * 0.6));
      playRubberShoot(m.kind);
    }
    return true;
  }
  if (m.phase === "shoot") {
    var sh = prShoulder(self, m);
    if (m.kind === "pistol") {
      var ux = Math.cos(m.ang), uy = Math.sin(m.ang), prev = m.len;
      m.len = Math.min(m.max, m.len + rb.speed * dt);
      if (!m.tried && other.alive && prSegDist(other.x, other.y, sh.x + ux * prev, sh.y + uy * prev, sh.x + ux * m.len, sh.y + uy * m.len) < other.r + rb.fist) {
        if (prRubContact(self, other, m, rb, ux, uy) !== "slipped") { prRubSnap(m); return true; }
      }
      if (m.len >= m.max) {
        if (!m.tried) floater(sh.x + ux * m.len, sh.y + uy * m.len - 18, "WHIFF", "dodge");
        prRubSnap(m);
      }
      return true;
    }
    // The whip: the leg stretches out to them, then sweeps round through them.
    var w = rb.whip, ext = Math.min(1, m.t / w.extend), sw = Math.max(0, Math.min(1, (m.t - w.extend) / w.sweep));
    m.len = m.L * (1 - (1 - ext) * (1 - ext));
    m.wa = m.ang - w.arc * m.side + 2 * w.arc * m.side * sw;
    var wx = Math.cos(m.wa), wy = Math.sin(m.wa);
    if (!m.tried && ext >= 1 && other.alive &&
        prSegDist(other.x, other.y, sh.x + wx * m.len * 0.45, sh.y + wy * m.len * 0.45, sh.x + wx * m.len, sh.y + wy * m.len) < other.r + rb.fist) {
      // Knocked the way the leg's sweeping, and away from him.
      var tx = -wy * m.side, ty = wx * m.side, kx = wx * 0.55 + tx * 0.45, ky = wy * 0.55 + ty * 0.45, kl = Math.sqrt(kx * kx + ky * ky) || 1;
      if (prRubContact(self, other, m, rb, kx / kl, ky / kl) !== "slipped") { prRubSnap(m); return true; }
    }
    if (sw >= 1) {
      if (!m.tried) floater(sh.x + wx * m.len, sh.y + wy * m.len - 18, "WHIFF", "dodge");
      prRubSnap(m);
    }
    return true;
  }
  if (m.t >= rb.snap) {
    self.prRub = null;
    if (self.alive && inOrdinaryMovement(self)) setSpeed(self, self.baseSpeed || SPEED);
    return false;
  }
  return true;
}

function prRubSnap(m) {
  m.phase = "snap"; m.t = 0; m.snapFrom = m.len;
  playRubberSnap();
}

// The fist (or the foot) gets to them: "slipped", "blocked" or "hit".
function prRubContact(self, other, m, rb, ux, uy) {
  m.tried = true;
  var whip = m.kind === "whip", dmg = whip ? rb.whip.damage : rb.damage, kb = whip ? rb.whip.knockback : rb.knockback;
  var dealt = hurt(other, dmg, "rubber", self.id);
  if (other.justDodged) return "slipped"; // it flies on past
  if (!(dealt > 0)) { checkEnd(); return "blocked"; }
  if (teepPushable(other)) {
    other.vx = ux * kb; other.vy = uy * kb;
    other.knockFly = Math.max(other.knockFly || 0, 0.2);
  }
  other.squash = { t: 0.18, max: 0.18, nx: -ux, ny: -uy };
  impacts.push({ x: other.x - ux * other.r, y: other.y - uy * other.r, nx: -ux, ny: -uy, life: 0.4, max: 0.4, color: self.char.color });
  floater(other.x, other.y - other.r - 34, "BOING!", "note");
  hitStop = Math.max(hitStop, 0.05);
  if (!reduceMotion) shake = Math.max(shake, 11);
  playRubberHit(dealt);
  crowdReact(0.5);
  if (!whip) prCall("rightHand", self, other); // the fist landing from across the ring: a big right hand
  checkEnd();
  return "hit";
}

// ---------------------------------------------------------------- the Cigarette

// From updateSpecial (special.js). Starts lighting up when the bar's full;
// the light, the smoke, Super Saiyan and the end run on their own clock
// (prSmokeTick).
function updateCigarette(self, other, dt) {
  var sp = self.char.special, s = self.pr;
  if (!s) return false;
  if (s.smoke) return prPlanted(self);
  if (self.specialT < sp.chargeTime) return false;
  if (!prDemo() && s.fightT < (sp.notBefore || 0)) return false;
  if (!started || over || !other.alive || other.koOut || other.igbb || specialBusy(self) || specialBusy(other) || swordDuelActive()) return false;
  if (!inOrdinaryMovement(self) || self.prRub || self.punch || self.kick || self.koPunch || self.elbowAnim || self.kneeAnim || self.teep ||
      self.plum || self.fknee || self.cmb || self.dizzy) return false;
  prStartLight(self, other, sp);
  return true;
}

// He stops and the cigarette comes out (with look.cigarette he flicks the
// one he had away first): from here on nothing touches him.
function prStartLight(self, other, sp) {
  var s = self.pr;
  if (prCigLook(self)) {
    var m = prMouth(self), dir = Math.random() < 0.5 ? -1 : 1;
    prButts.push({ x: m.x + dir * self.r * 0.3, y: m.y, vx: dir * (140 + Math.random() * 80), vy: -40, z: 16, vz: 210, rot: 0, spin: dir * 16, t: 0, lit: 0.6 });
  }
  s.smoke = { phase: "light", t: 0, flicked: false, dragged: false, glow: 0, missN: 0 };
  self.vx *= 0.3; self.vy *= 0.3;
  s.counterWant = null; s.cc = null;
  floater(self.x, self.y - self.r - 30, "SMOKE BREAK!", "crit");
  prQueue(self, "smoke", (prCfg(self).lineTiming || {}).bigWait || 8); // every time he lights up
  // They see him light up and storm in to stop him (it all misses).
  if (sp.theyCome && other.alive && !other.koOut && !other.angry && inOrdinaryMovement(other)) other.angry = { t: 0, dur: sp.light + 0.3, atId: self.id };
  playCigPack();
}

function prSmokeTick(b, other, dt) {
  var s = b.pr, sm = s.smoke, sp = b.char.special;
  if (!sm || !sp) return;
  sm.t += dt;
  if (sm.glow > 0) sm.glow = Math.max(0, sm.glow - dt * 1.6);
  if (sm.phase === "light" || sm.phase === "smoke") {
    if (!b.alive || over) { prEndParty(b, false); return; }
    b.specialT = sp.chargeTime * 0.999; // (the bar stays full until he's Super Saiyan)
    if (sm.phase === "light") {
      var L = sp.light;
      if (!sm.flicked && sm.t >= L * PR_LIGHT_FLICK) { sm.flicked = true; playLighterFlick(); prSparks(prCigTip(b), 6); }
      if (!sm.dragged && sm.t >= L * PR_LIGHT_DRAG) { sm.dragged = true; sm.glow = 1.4; playDrag(); }
      if (sm.dragged && Math.random() < dt * 14) prPuffAt(prCigTip(b), false);
      if (sm.t >= L) prStartSmoke(b, other, sp);
      return;
    }
    // Smoking to the music.
    s.dragT -= dt;
    if (s.dragT <= 0) { s.dragT = PR_DRAG_EVERY; sm.glow = 1; prPuffAt(prMouth(b), true); }
    if (Math.random() < dt * 8) prPuffAt(prCigTip(b), false);
    prNoteUp(b, dt);
    if (sm.t >= (sp.smoke || 0)) prStartParty(b, other, sp);
    return;
  }
  if (sm.phase === "party") {
    if (!b.alive || over) { prEndParty(b, false); return; }
    // The bar drains as it runs (and anything that lands can't refill it).
    b.specialT = sp.chargeTime * Math.max(0, 1 - sm.t / sp.party) * 0.999;
    s.dragT -= dt;
    if (s.dragT <= 0) { s.dragT = PR_DRAG_EVERY; sm.glow = 1; }
    if (Math.random() < dt * 9) prPuffAt(prCigTip(b), false);
    prNoteUp(b, dt);
    if (sm.t >= sp.party) prEndParty(b, true);
    return;
  }
  if (sm.t >= (sp.out || 0.7)) s.smoke = null; // "out": the aura dying down
}
function prNoteUp(b, dt) {
  if (Math.random() < dt * 2.2 && prNotes.length < 12) prNotes.push({ x: b.x + (Math.random() - 0.5) * b.r * 2, y: b.y - b.r * 0.6, t: 0, dur: 1.3, s: Math.random() < 0.5 ? "♪" : "♫", wob: Math.random() * 6 });
}

// Lit: the party music kicks in and he smokes to it.
function prStartSmoke(b, other, sp) {
  var s = b.pr, sm = s.smoke;
  sm.phase = "smoke"; sm.t = 0; sm.glow = 1.2;
  s.dragT = PR_DRAG_EVERY * 0.6;
  floater(b.x, b.y - b.r - 44, "PARTY TIME!", "crit");
  prLights.want = 1;
  if (sp.music !== false) prMusicStart(sp.musicLevel || 0.22, sp.song);
  crowdReact(0.6);
  // "Time to party, let's go!" every time the music starts (right after his smoke line if that's still going).
  prQueue(b, "party", (prCfg(b).lineTiming || {}).bigWait || 8);
}

// SUPER SAIYAN: the aura bursts on and he fights, with everything still missing him.
function prStartParty(b, other, sp) {
  var s = b.pr, sm = s.smoke;
  sm.phase = "party"; sm.t = 0; sm.glow = 1.2; sm.missN = 0;
  s.dragT = PR_DRAG_EVERY;
  s.partyN++;
  s.cc = null; s.ccCd = 0;
  b.specialT = sp.chargeTime * 0.999;
  s.saved = { speed: b.baseSpeed, atk: b.atkRate };
  b.baseSpeed = (b.baseSpeed || SPEED) * (sp.speed || 1);
  b.atkRate = (b.atkRate || 1) * (sp.attack || 1);
  if (b.char.combos && sp.comboEvery) b.cmbT = Math.min(b.cmbT != null ? b.cmbT : 9, 0.3);
  floater(b.x, b.y - b.r - 44, "SUPER SAIYAN!", "crit");
  prLights.want = 1;
  if (sp.music !== false && !prMusic) prMusicStart(sp.musicLevel || 0.22, sp.song);
  playPartyBurst();
  crowdReact(0.8);
  impacts.push({ x: b.x, y: b.y + b.r, nx: 0, ny: -1, life: 0.45, max: 0.45, color: "#ffd21f" });
  for (var i = 0; i < 18; i++) {
    var a = Math.random() * Math.PI * 2, v = 160 + Math.random() * 220;
    particles.push({ x: b.x, y: b.y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 0.5, max: 0.5, size: 2.5 + Math.random() * 3, color: i % 2 ? "#ffd21f" : "#fff6b0" });
  }
  prPuffAt(prMouth(b), true);
}

// The end of the party: a big cloud of smoke, the butt flicked onto the mat.
function prEndParty(b, normal) {
  var s = b.pr, sp = b.char.special;
  if (s.saved) { b.baseSpeed = s.saved.speed; b.atkRate = s.saved.atk; s.saved = null; }
  b.specialT = 0;
  s.cc = null;
  s.smoke = normal && b.alive && !over ? { phase: "out", t: 0, glow: 0, missN: 0 } : null;
  var anyone = balls.some(function (o) { return o !== b && prMusicOn(o); });
  if (!anyone) { prLights.want = 0; prMusicStop(over ? 2.5 : 0.9); }
  if (!normal || !b.alive) return;
  floater(b.x, b.y - b.r - 44, "PARTY'S OVER", "note");
  var m = prMouth(b);
  for (var i = 0; i < 6; i++) prPuffs.push({ x: m.x, y: m.y, vx: (Math.random() - 0.5) * 90, vy: -40 - Math.random() * 50, t: 0, dur: 1.6 + Math.random() * 0.4, r0: 5, r1: 20 + Math.random() * 8 });
  var dir = Math.random() < 0.5 ? -1 : 1;
  prButts.push({ x: m.x + dir * b.r * 0.3, y: m.y, vx: dir * (160 + Math.random() * 90), vy: -40, z: 18, vz: 230, rot: 0, spin: dir * 18, t: 0, lit: 1 });
  if (prCigLook(b)) s.freshT = 1.4; // (and a fresh one's in his mouth a moment later)
  playExhale();
}

// ---------------------------------------------------------------- smoke, butts, notes, lights

// Where his mouth is (no face is drawn: just above the jaw, middle of the head).
function prPose(b) {
  var lk = prCfg(b) && prCfg(b).lanky;
  var wide = lk ? lk.wide : 1, tall = lk ? lk.tall : 1, bob = 0;
  if (prMusicOn(b) && !reduceMotion) bob = -Math.abs(Math.sin(prClock * Math.PI * PR_BPM / 60)) * b.r * (prPlanted(b) ? 0.05 : 0.08);
  return { wide: wide, tall: tall, bob: bob };
}
function prMouth(b) { var p = prPose(b); return { x: b.x + b.r * 0.06 * p.wide, y: b.y + p.bob - b.r * 0.42 * p.tall }; }
var PR_CIG_ANG = 0.38, PR_CIG_LEN = 0.52;
function prCigTip(b, len) {
  var m = prMouth(b), L = b.r * PR_CIG_LEN * (len || 1);
  return { x: m.x + Math.cos(PR_CIG_ANG) * L, y: m.y + Math.sin(PR_CIG_ANG) * L };
}
function prPuffAt(p, big, faint) {
  if (reduceMotion || prPuffs.length >= PR_PUFF_MAX) return;
  prPuffs.push({ x: p.x, y: p.y, vx: (Math.random() - 0.5) * 24, vy: -26 - Math.random() * 22, t: 0, dur: big ? 1.4 : (faint ? 1.2 : 0.9), r0: big ? 6 : 2.5, r1: big ? 24 : (faint ? 7 : 9), a: faint || 1 });
}
// The cigarette he keeps in his mouth all fight (look.cigarette): a faint wisp
// off the tip, and a fresh one a moment after the special's over.
function prWisp(b, dt) {
  var s = b.pr;
  if (!prCigLook(b) || !b.alive || s.smoke) return;
  if (s.freshT > 0) {
    s.freshT -= dt;
    if (s.freshT <= 0) { prSparks(prCigTip(b, 0.85), 4); prPuffAt(prCigTip(b, 0.85), false); }
    return;
  }
  var w = b.char.look.cigWisp != null ? b.char.look.cigWisp : 0.35;
  s.wispT = (s.wispT || 0) - dt;
  if (w <= 0 || s.wispT > 0 || reduceMotion || prPuffs.length >= PR_PUFF_MAX) return;
  // (its own little random, so switching the look on or off never changes how a fight plays out)
  s.wispN = ((s.wispN || 7) * 1103515245 + 12345) % 2147483648;
  var r = s.wispN / 2147483648, p = prCigTip(b, 0.85);
  s.wispT = 0.22 + r * 0.25;
  prPuffs.push({ x: p.x, y: p.y, vx: (r - 0.5) * 20, vy: -24 - r * 16, t: 0, dur: 1.2, r0: 2.5, r1: 7, a: w });
}
function prSparks(p, n) {
  for (var i = 0; i < n; i++) {
    var a = -Math.PI / 2 + (Math.random() - 0.5) * 2.2, v = 60 + Math.random() * 140;
    particles.push({ x: p.x, y: p.y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 0.25, max: 0.25, size: 1.6 + Math.random() * 1.4, color: i % 2 ? "#ffb02e" : "#fff1a8" });
  }
}

function tickPrFx(dt) {
  prPuffs = prPuffs.filter(function (p) { p.t += dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= Math.exp(-1.5 * dt); return p.t < p.dur; });
  prGhosts = prGhosts.filter(function (g) { g.t += dt; return g.t < g.dur; });
  prNotes = prNotes.filter(function (n) { n.t += dt; n.y -= 46 * dt; return n.t < n.dur; });
  prButts = prButts.filter(function (c) {
    c.t += dt;
    if (c.z > 0 || c.vz > 0) {
      c.x += c.vx * dt; c.y += c.vy * dt; c.z += c.vz * dt; c.vz -= 700 * dt; c.rot += c.spin * dt;
      c.x = Math.max(6, Math.min(W - 6, c.x)); c.y = Math.max(6, Math.min(H - 6, c.y));
      if (c.z <= 0) {
        c.z = 0; c.vz = 0; c.vx = 0; c.vy = 0; c.spin = 0;
        if (c.lit > 0) { prSparks(c, 7); playButtLand(); }
      }
    }
    if (c.lit > 0) c.lit = Math.max(0, c.lit - dt / 4);
    return c.t < 9;
  });
  var L = prLights;
  L.k += Math.max(-dt * 2.5, Math.min(dt * 3, L.want - L.k));
}

// ---------------------------------------------------------------- music (baile funk)

// The party's song: a baile funk loop made from music.js's instruments (the
// tamborzão drum pattern, an 808, claps, horn stabs, a cowbell, the "tuin"
// laser blip and a whistle), rendered once and looped (renderMusic).
MUSIC_SONGS.prBaile = { bpm: PR_BPM, bars: 8, level: 1, play: function (ctx, out, t0) {
  var st = 60 / PR_BPM / 4; // a sixteenth
  var roots = [41, 41, 44, 39], stabs = [[65, 68, 72], [65, 68, 72], [68, 72, 75], [63, 67, 70]];
  for (var bar = 0; bar < 8; bar++) {
    var bt = t0 + bar * 16 * st, r = roots[bar % 4];
    [0, 3, 8, 11].forEach(function (x) { mKick(ctx, out, bt + x * st, 1); });                          // boom... ba-boom
    [2, 6, 7, 10, 14].forEach(function (x, i) { mTom(ctx, out, bt + x * st, i % 2 ? 140 : 105, 0.3); }); // the tamborzão rolling round it
    [4, 12].forEach(function (x) { mClap(ctx, out, bt + x * st, 1); mSnare(ctx, out, bt + x * st, 0.35); });
    if (bar % 2) mClap(ctx, out, bt + 15 * st, 0.6);
    for (var s = 0; s < 16; s++) {
      mShaker(ctx, out, bt + s * st, s % 2 ? 0.5 : 1);
      if (s % 2 === 0) mHat(ctx, out, bt + s * st, 0.45, s === 14);
    }
    m808(ctx, out, r - 12, bt, 0.9, 3 * st);
    m808(ctx, out, r - 12, bt + 8 * st, 0.9, 3 * st);
    m808(ctx, out, r - 5, bt + 11 * st, 0.8, 4 * st, r - 12);
    [7, 15].forEach(function (x) { mBrass(ctx, out, stabs[bar % 4], bt + x * st, 1.3, 0.14); });     // horn stabs
    [3, 9, 13].forEach(function (x) { mCowbell(ctx, out, 84, bt + x * st, 0.45); });
    if (bar % 2 === 0) [6, 14].forEach(function (x) { prTuin(ctx, out, bt + x * st); });
    if (bar % 4 === 0) prApito(ctx, out, bt);
  }
} };
// The "tuin": a laser blip dropping in pitch.
function prTuin(ctx, out, t) {
  var o = ctx.createOscillator(), g = mEnv(ctx, t, 0.003, 0.12, 0.14);
  o.type = "sine"; o.frequency.setValueAtTime(1800, t); o.frequency.exponentialRampToValueAtTime(620, t + 0.11);
  o.connect(g); g.connect(out); o.start(t); o.stop(t + 0.2);
}
// The whistle (apito): a trilling high pea whistle.
function prApito(ctx, out, t) {
  var o = ctx.createOscillator(), lfo = ctx.createOscillator(), dep = ctx.createGain(), g = ctx.createGain();
  o.type = "sine"; o.frequency.value = 2900; lfo.frequency.value = 23; dep.gain.value = 190;
  lfo.connect(dep); dep.connect(o.frequency);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.07, t + 0.02);
  g.gain.setValueAtTime(0.07, t + 0.36); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.42);
  o.connect(g); g.connect(out); o.start(t); o.stop(t + 0.45); lfo.start(t); lfo.stop(t + 0.45);
}

function prTalking() { return typeof talkEnd !== "undefined" && typeof audioCtx !== "undefined" && !!audioCtx && audioCtx.currentTime < talkEnd; }

// The party music: his walkout song, "Purple Lamborghini", from
// SOUND_CLIPS.pratesParty (prates-song.js, like volkanovski-song.js for "Down
// Under"), or the baile funk if that file's missing or special.song is false.
// `level` is the baile funk's; the song plays at PR_SONG_LEVEL.
var PR_SONG_LEVEL = 0.8;
function prMusicStart(level, useSong) {
  prAudio(function (ac, now) {
    if (prMusic) return;
    var song = useSong !== false && typeof SOUND_CLIPS !== "undefined" && !!SOUND_CLIPS.pratesParty;
    var token = prMusic = { gain: ac.createGain(), src: null, level: song ? PR_SONG_LEVEL : level, ducked: false };
    token.gain.gain.setValueAtTime(0.0001, now);
    token.gain.connect(ac.destination);
    try { holdMusicOff(now); } catch (e) { /* (music.js) */ }
    var play = function (buf, loop) {
      if (prMusic !== token) return; // over before it was ready
      try {
        var t = ac.currentTime;
        token.src = ac.createBufferSource(); token.src.buffer = buf; token.src.loop = loop;
        token.src.connect(token.gain); token.src.start(t);
        token.ducked = prTalking();
        token.gain.gain.cancelScheduledValues(t);
        token.gain.gain.setValueAtTime(0.0001, t);
        token.gain.gain.exponentialRampToValueAtTime(token.level * (token.ducked ? MUSIC_DUCK : 1), t + 0.08);
      } catch (e) { /* never let audio break the game */ }
    };
    if (song) withClip("pratesParty", function (buf) { play(buf, false); });
    else renderMusic("prBaile", function (buf) { play(buf, true); });
  });
}
// Every frame: it dips while someone's talking, like the background music.
function prMusicDuck() {
  var m = prMusic;
  if (!m || !m.src) return;
  var talk = prTalking();
  if (talk === m.ducked) return;
  m.ducked = talk;
  try {
    var g = m.gain.gain, now = audioCtx.currentTime;
    g.cancelScheduledValues(now);
    g.setValueAtTime(Math.max(0.0001, g.value), now);
    g.setTargetAtTime(m.level * (talk ? MUSIC_DUCK : 1), now, talk ? 0.08 : 0.3);
  } catch (e) { /* never let audio break the game */ }
}
function prMusicStop(fade) {
  var m = prMusic;
  prMusic = null;
  if (!m) return;
  try {
    var now = audioCtx.currentTime, f = fade == null ? 0.8 : fade, g = m.gain.gain;
    g.cancelScheduledValues(now);
    g.setValueAtTime(Math.max(0.0001, g.value), now);
    g.setTargetAtTime(0.0001, now, Math.max(0.02, f / 3));
    if (m.src) m.src.stop(now + f + 0.1);
  } catch (e) { /* already stopped */ }
  try { releaseMusic(); } catch (e) { /* (music.js) */ }
}

// ---------------------------------------------------------------- drawing

// From draw.js with the other poses: narrower and taller (lanky), bouncing
// on the beat while he parties.
function applyPratesPose(b) {
  if (!b.pr || !b.alive) return;
  var p = prPose(b);
  ctx.translate(b.x, b.y + p.bob);
  ctx.scale(p.wide, p.tall);
  ctx.translate(-b.x, -b.y);
}

// How bright the aura is: on in the party, dying down after, flickering at
// the end of the drag.
function prAuraK(b) {
  var sm = prSmoke(b), sp = b.char.special;
  if (!sm || !b.alive || !sp) return 0;
  if (sm.phase === "party") return Math.min(1, sm.t / 0.25);
  if (sm.phase === "out") return Math.max(0, 1 - sm.t / (sp.out || 0.7));
  if (sm.phase === "smoke" && sm.t > (sp.smoke || 0) - 0.5) return 0.25 + 0.25 * Math.sin(sm.t * 40); // powering up
  return 0;
}

// From draw.js, behind him: the gold aura and its party sparkles.
function drawPratesBehind(b) {
  var k = prAuraK(b);
  if (k <= 0) return;
  var p = prPose(b), r = b.r * p.tall, t = performance.now() / 1000, pulse = 0.5 + 0.5 * Math.sin(t * 14), cy = b.y + p.bob;
  ctx.save();
  ctx.globalAlpha = k;
  [[1.0, 0.0], [0.8, 0.9], [0.6, 1.7]].forEach(function (L, li) {
    ctx.beginPath();
    saiyanFlamePath(b.x, cy, r * L[0], t, L[1], li); // Charles's flame outline (dobronx.js)
    var g = ctx.createLinearGradient(0, cy + r * 1.3, 0, cy - r * 2.8);
    if (li === 0) {
      g.addColorStop(0, "rgba(255,170,0,0.6)"); g.addColorStop(0.5, "rgba(255,206,30,0.5)"); g.addColorStop(1, "rgba(255,236,120,0.28)");
      ctx.fillStyle = g;
      ctx.shadowColor = "rgba(255,200,0,0.9)"; ctx.shadowBlur = 18 + 10 * pulse;
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.lineWidth = 2.5; ctx.lineJoin = "round"; ctx.strokeStyle = "rgba(255,150,0," + (0.65 + 0.25 * pulse) + ")"; ctx.stroke();
    } else if (li === 1) {
      g.addColorStop(0, "rgba(255,226,60,0.65)"); g.addColorStop(1, "rgba(255,240,140,0.3)");
      ctx.fillStyle = g; ctx.fill();
    } else {
      g.addColorStop(0, "rgba(255,255,235,0.8)"); g.addColorStop(1, "rgba(255,250,200,0.0)");
      ctx.fillStyle = g; ctx.fill();
    }
  });
  // Party sparkles orbiting him in the disco colours.
  var cols = ["#ff2bd6", "#26e0ff", "#9cff2e", "#fff27a"];
  for (var i = 0; i < 8; i++) {
    var a = prClock * 2.4 + i * Math.PI / 4, rr = b.r * (1.55 + 0.12 * Math.sin(prClock * 5 + i));
    ctx.fillStyle = cols[i % 4];
    ctx.globalAlpha = k * (0.6 + 0.4 * Math.sin(prClock * 9 + i * 2));
    prStar(b.x + Math.cos(a) * rr, cy + Math.sin(a) * rr * 0.8, 3.5);
  }
  ctx.restore();
}
function prStar(x, y, s) {
  ctx.beginPath();
  for (var i = 0; i < 8; i++) { var a = i * Math.PI / 4, rr = i % 2 ? s * 0.4 : s; ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
  ctx.closePath(); ctx.fill();
}

// From draw.js with the other attacks: his gold hair in the party, the
// cigarette, lighting up, and the rubber arm or leg.
function drawPrates(b, other) {
  if (!b.pr || !b.alive) return;
  var sm = b.pr.smoke, p = prPose(b);
  var ak = prAuraK(b);
  if (ak > 0 && sm && (sm.phase === "party" || sm.phase === "out")) drawPrSpikes(b, p, ak);
  if (sm && sm.phase === "light") drawPrLighting(b, sm);
  else if (sm && (sm.phase === "smoke" || sm.phase === "party")) drawPrCig(b, sm.glow);
  else if (!sm && prCigLook(b) && !(b.pr.freshT > 0)) drawPrCig(b, 0.05, 0.85); // the one he keeps in all fight, barely burning
  if (b.prRub) drawPrRubber(b, other, b.prRub);
}

// Super Saiyan style hair: gold spikes standing straight up off his head.
function drawPrSpikes(b, p, k) {
  var r = b.r, cx = b.x, cy = b.y + p.bob, w = p.wide, h = p.tall;
  // [base x, tip x, tip y] in ball radii; the bases sit on the top of the head.
  var spikes = [[-0.82, -1.06, -0.92], [-0.56, -0.76, -1.36], [-0.28, -0.34, -1.55], [0, 0.02, -1.66], [0.28, 0.36, -1.53], [0.56, 0.78, -1.34], [0.82, 1.06, -0.9]];
  var top = function (x) { return -Math.sqrt(Math.max(0, 1 - x * x)) * 0.97; };
  ctx.save();
  ctx.globalAlpha = Math.min(1, k * 1.2);
  var g = ctx.createLinearGradient(0, cy - r * 1.6 * h, 0, cy - r * 0.45 * h);
  g.addColorStop(0, "#fff8b0"); g.addColorStop(0.45, "#ffd21f"); g.addColorStop(1, "#e89a00");
  ctx.fillStyle = g; ctx.strokeStyle = theme.wall; ctx.lineWidth = 2.2; ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(cx - r * 0.96 * w, cy - r * 0.42 * h);
  spikes.forEach(function (s, i) {
    var x0 = s[0] - 0.14, x1 = s[0] + 0.14, tx = cx + s[1] * r * w + Math.sin(prClock * 9 + i) * r * 0.03, ty = cy + s[2] * r * h;
    ctx.lineTo(cx + x0 * r * w, cy + top(x0) * r * h);
    ctx.lineTo(tx, ty);
    ctx.lineTo(cx + x1 * r * w, cy + top(x1) * r * h);
  });
  ctx.lineTo(cx + r * 0.96 * w, cy - r * 0.42 * h);
  ctx.quadraticCurveTo(cx, cy - r * 1.15 * h, cx - r * 0.96 * w, cy - r * 0.42 * h); // down along the hairline
  ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.restore();
}

// The cigarette hanging out of the corner of his mouth, the ember glowing.
function drawPrCig(b, glow, len) {
  var m = prMouth(b), L = b.r * PR_CIG_LEN * (len || 1), wd = Math.max(3, b.r * 0.1), ca = Math.cos(PR_CIG_ANG), sa = Math.sin(PR_CIG_ANG);
  var tx = m.x + ca * L, ty = m.y + sa * L, fx = m.x + ca * L * 0.3, fy = m.y + sa * L * 0.3;
  ctx.save();
  ctx.lineCap = "butt";
  ctx.strokeStyle = theme.wall; ctx.lineWidth = wd + 2.5;
  ctx.beginPath(); ctx.moveTo(m.x, m.y); ctx.lineTo(tx, ty); ctx.stroke();
  ctx.strokeStyle = "#d9a066"; ctx.lineWidth = wd;
  ctx.beginPath(); ctx.moveTo(m.x, m.y); ctx.lineTo(fx, fy); ctx.stroke();
  ctx.strokeStyle = "#f7f4ee";
  ctx.beginPath(); ctx.moveTo(fx, fy); ctx.lineTo(tx - ca * wd * 0.5, ty - sa * wd * 0.5); ctx.stroke();
  if (glow == null || glow < 0) { ctx.restore(); return; } // not lit yet
  // The ember, brighter on a drag.
  var e = Math.min(1, 0.45 + glow * 0.55 + 0.1 * Math.sin(prClock * 11));
  ctx.shadowColor = "rgba(255,90,20,0.9)"; ctx.shadowBlur = 6 + 10 * e;
  ctx.fillStyle = "rgba(255," + Math.round(70 + 90 * e) + ",20,1)";
  ctx.beginPath(); ctx.arc(tx, ty, wd * 0.62, 0, Math.PI * 2); ctx.fill();
  ctx.shadowBlur = 0;
  ctx.restore();
}

function prGlove(x, y, size, ch) {
  ctx.fillStyle = gloveColor(ch); ctx.strokeStyle = theme.wall; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(x, y, size, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
}
function prArm(x0, y0, x1, y1, size, ch, bend) {
  var mx = (x0 + x1) / 2 + (bend ? bend.x : 0), my = (y0 + y1) / 2 + (bend ? bend.y : 0);
  ctx.lineCap = "round";
  ctx.strokeStyle = theme.wall; ctx.lineWidth = size * 0.9 + 6;
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.quadraticCurveTo(mx, my, x1, y1); ctx.stroke();
  ctx.strokeStyle = armColor(ch); ctx.lineWidth = size * 0.6;
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.quadraticCurveTo(mx, my, x1, y1); ctx.stroke();
}

// Lighting up: one glove brings the cigarette to his mouth, the other comes
// up with a lighter, flick, a flame, then the long drag.
function drawPrLighting(b, sm) {
  var sp = b.char.special, L = sp.light, t = sm.t, r = b.r, m = prMouth(b), size = (b.char.punch && b.char.punch.size) || 13;
  var tip = prCigTip(b), pz = prPose(b);
  var guardL = { x: b.x - r * 0.62 * pz.wide, y: b.y + pz.bob - r * 0.05 }, guardR = { x: b.x + r * 0.62 * pz.wide, y: b.y + pz.bob - r * 0.05 };
  ctx.save();
  // The cigarette: in his mouth once it's come up.
  var up = Math.min(1, t / (L * PR_LIGHT_UP));
  if (up >= 1) drawPrCig(b, sm.dragged ? Math.max(sm.glow, 0.6) : (sm.flicked ? 0.3 : -1));
  // The hand that brings it up: from his side to his mouth, then back down
  // out of the way so the cigarette shows.
  var down = Math.max(0, Math.min(1, (t - L * PR_LIGHT_UP) / (L * 0.12))), hk = up * (1 - down);
  var hx = guardL.x + (m.x - r * 0.04 - guardL.x) * hk, hy = guardL.y + (m.y + r * 0.12 - guardL.y) * hk;
  prArm(b.x - r * 0.55 * pz.wide, b.y + pz.bob + r * 0.1, hx, hy, size, b.char, { x: -r * 0.3, y: r * 0.15 });
  if (up < 1) { // the cigarette between his fingers on the way up
    ctx.strokeStyle = "#f7f4ee"; ctx.lineWidth = Math.max(2.4, r * 0.08); ctx.lineCap = "butt";
    ctx.beginPath(); ctx.moveTo(hx + size * 0.2, hy - size * 0.9); ctx.lineTo(hx + size * 1.1, hy - size * 1.2); ctx.stroke();
  }
  prGlove(hx, hy, size * 0.85, b.char);
  // The other hand (on the cigarette's side) with the lighter, cupped at the tip.
  var lk = t < L * 0.2 ? 0 : Math.min(1, (t - L * 0.2) / (L * (PR_LIGHT_FLICK - 0.2)));
  if (t > L * 0.88) lk = Math.max(0, 1 - (t - L * 0.88) / (L * 0.12));
  var lx = guardR.x + (tip.x + size * 0.15 - guardR.x) * lk, ly = guardR.y + (tip.y + size * 1.15 - guardR.y) * lk;
  prArm(b.x + r * 0.55 * pz.wide, b.y + pz.bob + r * 0.1, lx, ly, size, b.char, { x: r * 0.35, y: r * 0.2 });
  if (lk > 0.2) {
    // A red disposable lighter sticking up out of the glove, and the flame.
    ctx.fillStyle = "#d8282b"; ctx.strokeStyle = theme.wall; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.rect(lx - size * 0.32, ly - size * 1.25, size * 0.64, size * 0.8); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#bfc4c9"; ctx.fillRect(lx - size * 0.32, ly - size * 1.45, size * 0.64, size * 0.22);
    if (sm.flicked && t < L * 0.9) {
      var fl = 0.8 + 0.2 * Math.sin(prClock * 40);
      ctx.fillStyle = "rgba(255,160,40,0.95)"; ctx.shadowColor = "rgba(255,170,40,0.9)"; ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.moveTo(lx, ly - size * 1.5 - size * 1.1 * fl);
      ctx.quadraticCurveTo(lx + size * 0.38, ly - size * 1.7, lx, ly - size * 1.45);
      ctx.quadraticCurveTo(lx - size * 0.38, ly - size * 1.7, lx, ly - size * 1.5 - size * 1.1 * fl);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = "rgba(255,245,200,0.9)";
      ctx.beginPath(); ctx.ellipse(lx, ly - size * 1.75, size * 0.12, size * 0.28, 0, 0, Math.PI * 2); ctx.fill();
    }
  }
  prGlove(lx, ly, size * 0.85, b.char);
  ctx.restore();
}

// The rubber arm (or leg): stretched way back in the wind-up, shooting out
// across the ring, then snapping back with a wobble.
function drawPrRubber(b, other, m) {
  var rb = prCfg(b) && prCfg(b).rubber;
  if (!rb) return;
  var sh = prShoulder(b, m), ux = Math.cos(m.ang), uy = Math.sin(m.ang), px = -uy, py = ux, r = b.r;
  var size = (m.kind === "whip" ? (b.char.kick && b.char.kick.size) : (b.char.punch && b.char.punch.size)) || 13;
  var tipX, tipY, bend = { x: 0, y: 0 }, a = m.ang;
  if (m.phase === "wind") {
    var k = Math.min(1, m.t / rb.windup), e = 1 - (1 - k) * (1 - k), back = r * 0.35 + r * PR_RUB_BACK * e;
    // Round the outside of his body, not across it.
    tipX = sh.x - ux * back + px * m.side * r * 0.95 * e; tipY = sh.y - uy * back + py * m.side * r * 0.95 * e;
    var wob = Math.sin(m.t * 42) * r * 0.16 * e + r * 0.45 * e;
    bend = { x: px * m.side * wob, y: py * m.side * wob };
    a = m.ang + Math.PI;
  } else {
    var len = m.len;
    if (m.phase === "snap") {
      var sk = Math.min(1, m.t / rb.snap);
      len = (m.snapFrom || 0) * (1 - sk) + Math.sin(sk * Math.PI * 3) * (1 - sk) * r * 0.25;
      var sw = Math.sin(m.t * 70) * (1 - sk) * r * 0.35;
      bend = { x: px * sw, y: py * sw };
    }
    if (m.kind === "whip" && m.wa != null) a = m.wa;
    len = Math.max(4, len);
    tipX = sh.x + Math.cos(a) * len; tipY = sh.y + Math.sin(a) * len;
  }
  ctx.save();
  if (m.kind === "whip") {
    prArm(sh.x, sh.y, tipX, tipY, size * 1.05, b.char, bend);
    // Stretch rings along the rubber leg, and DANGER down the shin (his real tattoo).
    prStretchRings(sh, tipX, tipY, bend, size);
    if (m.phase !== "wind" && Math.sqrt((tipX - sh.x) * (tipX - sh.x) + (tipY - sh.y) * (tipY - sh.y)) > r * 1.6) {
      var mx = (sh.x + tipX) / 2 + bend.x, my = (sh.y + tipY) / 2 + bend.y, ta = Math.atan2(tipY - sh.y, tipX - sh.x);
      ctx.save(); ctx.translate(mx, my); ctx.rotate(Math.cos(ta) < 0 ? ta + Math.PI : ta);
      ctx.font = "900 " + Math.max(7, size * 0.62) + "px \"Barlow Condensed\", \"Arial Narrow\", sans-serif";
      ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillStyle = "rgba(20,20,26,0.75)";
      ctx.fillText("DANGER", 0, 0.5);
      ctx.restore();
    }
    ctx.translate(tipX, tipY); ctx.rotate(a);
    drawKickFoot(size, armColor(b.char), m.side); // (draw-attacks.js)
    ctx.strokeStyle = armColor(b.char); ctx.lineWidth = size * 0.62; ctx.lineCap = "butt";
    ctx.beginPath(); ctx.moveTo(-size * 1.1, 0); ctx.lineTo(-size * 0.55, 0); ctx.stroke();
    ctx.restore();
    return;
  }
  prArm(sh.x, sh.y, tipX, tipY, size, b.char, bend);
  prStretchRings(sh, tipX, tipY, bend, size);
  // Speed lines behind the fist as it flies.
  if (m.phase === "shoot") {
    ctx.strokeStyle = theme.ink; ctx.globalAlpha = 0.45; ctx.lineWidth = 2.5;
    for (var i = -1; i <= 1; i++) {
      var ox = px * i * size * 0.6, oy = py * i * size * 0.6;
      ctx.beginPath(); ctx.moveTo(tipX - ux * size * 1.4 + ox, tipY - uy * size * 1.4 + oy); ctx.lineTo(tipX - ux * size * 3.6 + ox, tipY - uy * size * 3.6 + oy); ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }
  prGlove(tipX, tipY, size * 1.15, b.char);
  // The other glove stays up by his chin.
  prGlove(b.x + ux * r * 0.5 - px * m.side * r * 0.42, b.y + uy * r * 0.5 - py * m.side * r * 0.42, size * 0.85, b.char);
  ctx.restore();
}
function prStretchRings(sh, tx, ty, bend, size) {
  var dx = tx - sh.x, dy = ty - sh.y, len = Math.sqrt(dx * dx + dy * dy);
  if (len < 40) return;
  var n = Math.min(12, Math.floor(len / 26));
  ctx.strokeStyle = "rgba(0,0,0,0.28)"; ctx.lineWidth = 1.6; ctx.lineCap = "round";
  for (var i = 1; i < n; i++) {
    var k = i / n, mx = (sh.x + tx) / 2 + bend.x, my = (sh.y + ty) / 2 + bend.y;
    var x = (1 - k) * (1 - k) * sh.x + 2 * (1 - k) * k * mx + k * k * tx, y = (1 - k) * (1 - k) * sh.y + 2 * (1 - k) * k * my + k * k * ty;
    var nx = -dy / len, ny = dx / len;
    ctx.beginPath(); ctx.moveTo(x - nx * size * 0.28, y - ny * size * 0.28); ctx.lineTo(x + nx * size * 0.28, y + ny * size * 0.28); ctx.stroke();
  }
}

// From draw.js, under the fighters: the Rubber Pistol's aim line, butts on the mat.
function drawPratesUnder() {
  if (!balls) return;
  // Gold afterimages where he was when something missed him in Super Saiyan.
  prGhosts.forEach(function (g) {
    var k = g.t / g.dur;
    ctx.save();
    ctx.globalAlpha = 0.5 * (1 - k);
    ctx.fillStyle = "rgba(255,214,40,0.35)"; ctx.strokeStyle = "#ffcc00"; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(g.x, g.y, g.r * (1 + 0.15 * k), 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.restore();
  });
  prButts.forEach(function (c) {
    var fade = Math.min(1, (9 - c.t) / 1.5);
    ctx.save();
    ctx.globalAlpha = fade;
    if (c.z > 0) { ctx.fillStyle = "rgba(0,0,0,0.18)"; ctx.beginPath(); ctx.ellipse(c.x, c.y + 4, 4, 2, 0, 0, Math.PI * 2); ctx.fill(); }
    ctx.translate(c.x, c.y - c.z); ctx.rotate(c.rot);
    ctx.fillStyle = "#d9a066"; ctx.fillRect(-4, -1.6, 4, 3.2);
    ctx.fillStyle = "#f2efe8"; ctx.fillRect(0, -1.6, 3.5, 3.2);
    if (c.lit > 0) { ctx.fillStyle = "rgba(255,90,20," + c.lit + ")"; ctx.beginPath(); ctx.arc(4, 0, 1.8, 0, Math.PI * 2); ctx.fill(); }
    ctx.restore();
  });
  balls.forEach(function (b) {
    var m = b.prRub, rb = prCfg(b) && prCfg(b).rubber;
    if (!m || !rb || m.phase !== "wind" || !b.alive) return;
    var sh = prShoulder(b, m), len = prRubMax(b, m, rb), ux = Math.cos(m.ang), uy = Math.sin(m.ang);
    if (m.kind === "whip") {
      // The whip's reach: an arc where the foot will sweep.
      var other = balls[1 - b.id], reach = Math.min(len, Math.max(b.r, prDist(b, other) - b.r * 0.6)), arc = rb.whip.arc;
      ctx.save();
      ctx.strokeStyle = "#ff3b3b"; ctx.globalAlpha = m.locked ? 0.55 + 0.35 * Math.sin(prClock * 40) : 0.35; ctx.lineWidth = 5; ctx.setLineDash([10, 8]);
      ctx.beginPath(); ctx.arc(sh.x, sh.y, reach, m.ang - arc, m.ang + arc); ctx.stroke();
      ctx.restore();
      return;
    }
    ctx.save();
    ctx.strokeStyle = "#ff3b3b"; ctx.lineWidth = 5; ctx.setLineDash([12, 9]); ctx.lineCap = "round";
    ctx.globalAlpha = m.locked ? 0.6 + 0.35 * Math.sin(prClock * 40) : 0.25 + 0.25 * Math.min(1, m.t / rb.windup);
    ctx.beginPath(); ctx.moveTo(sh.x + ux * b.r * 0.4, sh.y + uy * b.r * 0.4); ctx.lineTo(sh.x + ux * len, sh.y + uy * len); ctx.stroke();
    ctx.restore();
  });
}

// From draw.js, over the fighters: smoke, music notes, and the disco lights
// sweeping the arena (the whole stage in the stadium) while he parties.
function drawPratesOver() {
  prPuffs.forEach(function (p) {
    var k = p.t / p.dur;
    ctx.fillStyle = "rgba(222,222,228," + (0.55 * (p.a || 1) * (1 - k)) + ")";
    ctx.beginPath(); ctx.arc(p.x, p.y, p.r0 + (p.r1 - p.r0) * k, 0, Math.PI * 2); ctx.fill();
  });
  if (prNotes.length) {
    ctx.save();
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.font = "800 20px \"Barlow Condensed\", \"Arial Narrow\", sans-serif";
    prNotes.forEach(function (n, i) {
      var k = n.t / n.dur;
      ctx.globalAlpha = Math.min(1, (1 - k) * 2);
      ctx.lineWidth = 4; ctx.strokeStyle = theme.floor; ctx.fillStyle = ["#ff2bd6", "#1cc8e8", "#6fbf1a", "#e0a800"][i % 4];
      var x = n.x + Math.sin(n.t * 5 + n.wob) * 6;
      ctx.strokeText(n.s, x, n.y); ctx.fillText(n.s, x, n.y);
    });
    ctx.restore();
  }
  var L = prLights;
  if (L.k <= 0.01) return;
  var stadium = stadiumOn(), wd = W, ht = H;
  ctx.save();
  if (stadium) { var px = canvas.width / STAGE_W; ctx.setTransform(px, 0, 0, px, 0, 0); wd = STAGE_W; ht = STAGE_H; }
  var cols = ["#ff2bd6", "#26e0ff", "#9cff2e", "#ffd400"];
  for (var i = 0; i < 4; i++) {
    var x0 = wd * (0.12 + 0.253 * i), a = Math.PI / 2 + Math.sin(prClock * 1.25 + i * 1.7) * 0.62, len = ht * 1.15, half = 0.11;
    ctx.globalAlpha = 0.12 * L.k;
    ctx.fillStyle = cols[i];
    ctx.beginPath();
    ctx.moveTo(x0, -10);
    ctx.lineTo(x0 + Math.cos(a - half) * len, -10 + Math.sin(a - half) * len);
    ctx.lineTo(x0 + Math.cos(a + half) * len, -10 + Math.sin(a + half) * len);
    ctx.closePath(); ctx.fill();
  }
  ctx.restore();
}

// From fighter-art.js (look.nightmare), in the head layer: the script on the
// side of his head ("PREDESTINADO", "THE NIGHTMARE CARLOS PRATES"), the line
// round his neck ("NOTHING CAN STOP ME") and MUAY THAI across his chest.
// Brush strokes stand in for the lettering at fight size; it reads up close.
function drawPratesInk(c, r, look, lw) {
  c.save();
  c.strokeStyle = "rgba(18,22,30,0.55)"; c.fillStyle = "rgba(18,22,30,0.6)"; c.lineCap = "round";
  c.lineWidth = lw(0.016);
  [[-0.76, 0.0], [-0.69, 0.04]].forEach(function (ln) {
    c.beginPath();
    for (var u = 0; u <= 22; u++) {
      var x = -r * (0.66 - ln[1]) + u * r * 0.018, y = r * ln[0] + Math.sin(u * 1.9) * r * 0.016 + u * r * 0.004;
      if (u === 0) c.moveTo(x, y); else c.lineTo(x, y);
    }
    c.stroke();
  });
  c.lineWidth = lw(0.014);
  c.beginPath();
  for (var v = 0; v <= 30; v++) {
    var nx = -r * 0.34 + v * r * 0.0227, ny = -r * 0.2 + Math.sin(v * 2.1) * r * 0.012 + Math.abs(v - 15) * r * 0.0016;
    if (v === 0) c.moveTo(nx, ny); else c.lineTo(nx, ny);
  }
  c.stroke();
  c.textAlign = "center"; c.textBaseline = "middle";
  c.font = "900 " + (r * 0.15).toFixed(2) + "px \"Barlow Condensed\", \"Arial Narrow\", sans-serif";
  c.globalAlpha = 0.62;
  c.fillText("MUAY THAI", 0, -r * 0.08);
  c.restore();
}

// ---------------------------------------------------------------- gallery

function pratesCigaretteInfo(sp) {
  var co = sp.counter || {};
  return "Not before " + sp.notBefore + "s. He stops and the cigarette comes out: the lighter, the flick, the flame, a long drag (" + secs(sp.light) +
    "). From that moment NOTHING touches him: every strike, shot, grab and thrown thing misses (\"CAN'T TOUCH HIM!\") and nothing new can start on him. " +
    "The party music kicks in and he smokes to it for " + secs(sp.smoke) + ". Then SUPER SAIYAN: a gold aura, gold hair, and for " + secs(sp.party) +
    " everyone still misses him while he fights " + Math.round(((sp.speed || 1) - 1) * 100) + "% faster and " + Math.round(((sp.damage || 1) - 1) * 100) +
    "% harder, throwing combinations back to back. " + (sp.critChance || 0) + "% of his punches and kicks crit for " + (sp.critMult || 2) +
    "x, and every miss on him sets up a counter that crits for " + (co.mult || 2.2) + "x. Then he blows out the smoke and flicks the butt onto the mat.";
}

function pratesGalleryMoves(ch, add) {
  var p = ch.prates;
  if (!p) return;
  if (p.range) add("🦒", "In and out", "Fights at the end of the longest straight (" + ch.punch.reach + ") and the longest kick (" + ch.kick.reach + ") in the game. He backs out at an angle, bounces a beat, then comes back in on a different entrance every time (from the left, the right, straight down the middle, wide round the outside, or a switch) and fires as he arrives. Never backs into the cage.");
  if (p.backOff) add("↩️", "Steps out of shots", p.backOff.chance + "% of the takedown shots and grabs on him catch nothing but air: he steps back out of them (\"STEPS OUT\") and answers with a kick, the straight or a teep.");
  if (p.guardAvoid) add("🚫", "Stays out of the guard", p.guardAvoid.chance + "% of the times they pull guard he won't follow them down.");
  if (p.subDefense) add("😵", "Weak once caught", "Once a choke or an armbar is on him he's in trouble: " + p.subDefense.extraTap + "% of the holds that wouldn't have made him tap do (\"CAUGHT!\").");
  if (p.clinchCrit) add("🥊", "Clinch crits", "In the clinch " + p.clinchCrit.chance + "% of his knees are critical hits for " + p.clinchCrit.mult + "x, and " + p.clinchCrit.partingElbow + "% of the time he comes off it with an elbow.");
  var rb = p.rubber;
  if (rb) add("🫳", "Rubber Pistol", "Every " + rb.every[0] + "-" + rb.every[1] + "s (" + rb.partyEvery[0] + "-" + rb.partyEvery[1] + "s in Super Saiyan), from " + rb.minGap + " to " + rb.maxGap + " away, his arm stretches way back (the tell, a red line shows where it's going) and the fist shoots across the ring for " + rb.damage +
    " and a big knockback, then snaps back." + (rb.whip ? " " + rb.whip.chance + "% of the time it's the Rubber Whip: his leg stretches out and whips round for " + rb.whip.damage + "." : "") + " It can be slipped or blocked like anything thrown.");
}

function pratesGallerySounds(groups, synth) {
  groups.push({ title: "Carlos Prates", items: [
    synth("Rubber stretch", "His arm stretching back for the Rubber Pistol.", function () { playRubberStretch(0.5); }),
    synth("Rubber Pistol", "The fist shooting out and landing.", function () { playRubberShoot("pistol"); setTimeout(function () { lastPunchSound = 0; playRubberHit(22); }, 160); }),
    synth("Rubber snap", "The arm snapping back.", function () { playRubberSnap(); }),
    synth("Steps out", "Stepping back out of a shot.", function () { playPrBackOff(); }),
    synth("Lighter", "Lighting up for the Cigarette.", function () { playCigPack(); setTimeout(playLighterFlick, 300); setTimeout(playDrag, 700); }),
    synth("Super Saiyan", "The aura bursting on.", function () { playPartyBurst(); }),
    synth("Party music", "His walkout song, Purple Lamborghini (8 seconds).", function () { prMusicStart(0.22, true); setTimeout(function () { prMusicStop(0.6); }, 8000); }),
    synth("Baile funk", "The party track built in code, with special.song off (8 seconds).", function () { prMusicStart(0.22, false); setTimeout(function () { prMusicStop(0.6); }, 8000); }),
    synth("Can't touch him", "Everything missing while he parties.", function () { playPrMiss(); }),
    synth("Exhale", "Blowing out the smoke at the end.", function () { playExhale(); })
  ] });
}

// ---------------------------------------------------------------- sound
// Synth stand-ins (Web Audio), like the other fighters'.

function prAudio(fn) {
  try {
    var ac = getAudioCtx();
    if (!ac) return;
    if (ac.state === "suspended") ac.resume();
    fn(ac, ac.currentTime);
  } catch (e) { /* never let audio break the game */ }
}
// The arm stretching back: a rubbery creak rising in pitch.
function playRubberStretch(dur) {
  prAudio(function (ac, t) {
    var d = Math.max(0.2, dur || 0.5);
    caneTone(ac, t, "triangle", 120, 420, 0.16, d);
    caneTone(ac, t, "sawtooth", 90, 260, 0.05, d);
  });
}
function playRubberLock() { prAudio(function (ac, t) { caneTone(ac, t, "square", 990, 990, 0.05, 0.06); }); }
// Letting go: a fwip.
function playRubberShoot(kind) {
  prAudio(function (ac, t) {
    caneBurst(ac, t, kind === "whip" ? 900 : 1600, 1.1, 0.4, 0.14);
    caneTone(ac, t, "sine", 520, 1400, 0.12, 0.1);
  });
}
// Landing: a thud and a boing.
function playRubberHit(dealt) {
  prAudio(function (ac, t) {
    var v = Math.min(1, 0.55 + (dealt || 0) / 50);
    caneTone(ac, t, "sine", 200, 55, 0.6 * v, 0.2);
    caneBurst(ac, t, 1800, 1.2, 0.5 * v, 0.06);
    caneTone(ac, t + 0.03, "sine", 260, 640, 0.22 * v, 0.12);
    caneTone(ac, t + 0.15, "sine", 640, 300, 0.18 * v, 0.2);
  });
}
// Snapping back: a rubber-band twang.
function playRubberSnap() {
  prAudio(function (ac, t) {
    caneTone(ac, t, "sine", 760, 170, 0.22, 0.14);
    caneBurst(ac, t, 4200, 3, 0.16, 0.04);
  });
}
function playPrBackOff() { prAudio(function (ac, t) { caneBurst(ac, t, 1200, 0.9, 0.3, 0.12); caneTone(ac, t, "sine", 300, 180, 0.12, 0.08); }); }
function playPrMiss() { prAudio(function (ac, t) { caneBurst(ac, t, 2600, 1.3, 0.22, 0.08); caneTone(ac, t, "sine", 1300, 1700, 0.05, 0.05); }); }
// The pack, the lighter's flick and the flame, the long drag.
function playCigPack() { prAudio(function (ac, t) { caneBurst(ac, t, 3200, 2, 0.18, 0.05); caneBurst(ac, t + 0.08, 2600, 2, 0.14, 0.05); }); }
function playLighterFlick() {
  prAudio(function (ac, t) {
    caneBurst(ac, t, 5200, 3, 0.4, 0.03);
    caneTone(ac, t, "square", 2200, 1500, 0.05, 0.03);
    caneBurst(ac, t + 0.04, 500, 0.6, 0.28, 0.25);
  });
}
function playDrag() {
  prAudio(function (ac, t) {
    caneBurst(ac, t, 4500, 0.7, 0.12, 0.5);
    for (var i = 0; i < 5; i++) caneBurst(ac, t + 0.05 + i * 0.08, 6000 + i * 300, 4, 0.08, 0.02); // the crackle
  });
}
// The aura bursting on: Joe's Super Saiyan burst over a quick riser.
function playPartyBurst() {
  prAudio(function (ac, t) {
    withClip("saiyanUp", function () { playClip("saiyanUp", 0.8, null, 1.05); });
    caneTone(ac, t, "sawtooth", 110, 440, 0.16, 0.35);
    caneBurst(ac, t, 700, 0.7, 0.4, 0.4);
  });
}
function playExhale() { prAudio(function (ac, t) { caneBurst(ac, t, 900, 0.5, 0.25, 0.9); caneBurst(ac, t, 2400, 0.6, 0.1, 0.7); }); }
function playButtLand() { prAudio(function (ac, t) { caneBurst(ac, t, 3800, 2, 0.12, 0.05); }); }
