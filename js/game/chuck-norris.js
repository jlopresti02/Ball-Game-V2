// Chuck Norris, guest star in Sean Strickland's America (Christian,
// 2026-11-13). Everything is set in Strickland's character file under
// special.norris; leave the block out (or "on": false) and America plays
// exactly as before.
//
// Rappel     when America hits ("AMERICA!", strickland.js) Chuck Norris slides
//            down a rope from the rafters in `rappel` seconds, a stars and
//            stripes streaming over him, and lands at Strickland's side:
//            "CHUCK NORRIS!", a thud, the crowd pops, and he plants the flag
//            in the mat next to him (`flag`). Cowboy hat, reddish-brown hair
//            and a full beard, the denim shirt with a Ranger's star, a flag
//            bandana, jeans with a big buckle: Walker, Texas Ranger. A name
//            tag over his head. `chance`% of Americas.
// Stand      arms crossed while Strickland revs the bike and rides it.
// Roundhouse once the bike's done (Strickland hopping off into his
//            overhands), he walks them down at `speed`, coming round to their
//            far side from Strickland. Within `reach` (edge to edge) he
//            plants and winds up for `windup` seconds (a red, white and blue
//            ring: the tell), edging in, then spins a full turn, the spin
//            carrying him in, and the boot comes round: `roundhouseDamage`
//            (with `unblockable` it can't be slipped or blocked, like the
//            bike; the only way out is to get away during the wind-up;
//            false makes it a plain kick that slips and blocks) and a
//            `roundhouseKnock` that sends them flying back into Strickland's
//            overhands ("ROUNDHOUSE!", and "TAG TEAM!" over Strickland). Out
//            of reach it's a "WHIFF". One kick. With him there Strickland
//            throws `overhandsCut` fewer overhands, so it's the same special
//            with a big kick in it, not a longer one. He gives up after
//            `time` seconds of walking them down.
// Exit       he salutes, then walks off toward the camera and never looks back
//            while something explodes behind him (`boom`, no damage), and
//            hops the fence on his way out.
// Voice      `lines.arrive` (on landing), `lines.roundhouse` (after the kick,
//            `kickLine`% of the time) and `lines.leave` (walking off, when he
//            didn't speak after the kick), plus CN_LINES below: say()-style
//            speech (speech.js), so a line is heard only once it has a real
//            clip in SPEECH_CLIPS (voice-clips.js), on the talk channel.
//            Lines without a clip are silent by design.
// Chuck runs on his own (chuckNorris), like Nick Diaz: nothing hits him and
// he isn't one of the two fighters. Hooks: strickland.js (America start, its
// tick, its drawing, its overhand count and gallery), index.html.
"use strict";

// What he says, by moment. Real quotes only, exact text of the clip, source
// by each (lines in the character file's special.norris.lines are added to
// these). After a kick that lands it's the roundhouse line OR the walk-off
// line (`kickLine`% the roundhouse one): both are long, and the talk channel
// drops a line that would have to wait on another.
var CN_LINES = {
  arrive: [       // landing at Strickland's side
    "Hi, I'm Chuck Norris."                                            // his 2012 election video ("a dire warning for America")
  ],
  roundhouse: [   // right after the kick lands
    "There's no chin behind Chuck Norris's beard, only another fist.", // Mike Huckabee's 2008 campaign ad, "Chuck Norris Approved"
    "When Chuck Norris does a pushup, he isn't lifting himself up, he's pushing the Earth down." // same ad
  ],
  leave: [        // walking off
    "And may God continue to bless the United States of America.",   // the 2012 election video, his sign-off
    "Chuck Norris doesn't endorse, he tells America how it's going to be." // the Huckabee ad
  ]
};

var CN_R = 36;
var CN_SPIN = 0.2;     // the full turn before the boot lands
var CN_HOLD = 0.3;     // the leg out, the hero frame
var CN_LUNGE = 650;    // how fast the spin carries him in
var CN_SALUTE = 0.75;
var CN_WALK = 200;     // walking off, nice and slow
var CN_HOP = 0.45;     // over the fence
var CN_BOOM_T = 1.5;
var CN_HAT = "#cdb68a", CN_BAND = "#4a3020", CN_DENIM = "#5a83b4", CN_JEANS = "#2e4670", CN_BOOT = "#6b4226";
var CN_USA = { red: "#b22234", white: "#ffffff", blue: "#3c3b6e" };

var CN_LOOK = {
  skin: "#e7b48e", build: "muscular", bodyHair: "light", hair: "short", hairColor: "#8a4a2a",
  beard: "full", beardColor: "#8a4a2a", ears: "normal", tattoos: {},
  outfit: "polo", shirt: CN_DENIM, sleeves: CN_DENIM,      // the denim shirt (the polo's collar and placket)
  shorts: CN_JEANS, trim: "#5a3a22", shortsStyle: "plain", legPatch: false, // jeans and a belt
  gloves: "#e7b48e"
};
var CN_CH = { name: "Chuck Norris", color: CN_USA.red, look: CN_LOOK };

var chuckNorris = null; // Chuck while he's in the building
var cnFlag = null;      // the flag he planted
var cnBoom = null;      // the explosion he walks away from
var cnStar = null;      // the roundhouse's impact star
var cnSpeech = null;    // his speech bubble
var cnClock = 0;

function cnCfg(b) {
  var sp = b && b.char && b.char.special, c = sp && sp.move === "america" && sp.norris;
  return c && c.on !== false ? c : null;
}
function cnNum(v, d) { return typeof v === "number" ? v : d; }
function cnGap(n, o) { var dx = o.x - n.x, dy = o.y - n.y; return Math.sqrt(dx * dx + dy * dy) - CN_R - o.r; }
function cnFenceY() { return stadiumOn() ? H + ST.CAGE / 2 * W / ST.A : H; }

// From resetStrickland (strickland.js).
function resetChuckNorris() { chuckNorris = null; cnFlag = null; cnBoom = null; cnStar = null; cnSpeech = null; cnClock = 0; }

// From updateAmerica (strickland.js), the moment it turns into America.
function chuckNorrisArrives(self, other) {
  var cfg = cnCfg(self);
  if (!cfg || chuckNorris || Math.random() * 100 >= cnNum(cfg.chance, 100)) return;
  // At his side, square to the way the bike will go, on whichever side has more room.
  var dx = other.x - self.x, dy = other.y - self.y, d = Math.sqrt(dx * dx + dy * dy) || 1;
  var px = -dy / d, py = dx / d, off = self.r + CN_R + 18, best = null;
  [1, -1].forEach(function (s) {
    var x = self.x + px * off * s, y = self.y + py * off * s;
    var cx = Math.min(W - CN_R - 6, Math.max(CN_R + 6, x)), cy = Math.min(H - CN_R - 6, Math.max(CN_R + 30, y));
    var cost = Math.abs(cx - x) + Math.abs(cy - y);
    if (!best || cost < best.cost) best = { x: cx, y: cy, cost: cost };
  });
  chuckNorris = { ownerId: self.id, phase: "rappel", t: 0, x: best.x, y0: stadiumOn() ? -420 : -CN_R * 4, y: -CN_R * 4, landY: best.y,
    rode: false, huntT: 0, aim: Math.atan2(other.y - best.y, other.x - best.x), say: 0, sayKey: null, landed: false, hop: 0, alpha: 1 };
  chuckNorris.y = chuckNorris.y0;
  playCnZip(cnNum(cfg.rappel, 0.9));
}

// From overhandsAmerica (strickland.js): his roundhouse takes the place of
// `overhandsCut` of Strickland's overhands.
function chuckNorrisOverhandCut(self) {
  var cfg = cnCfg(self);
  return chuckNorris && chuckNorris.ownerId === self.id && cfg ? cnNum(cfg.overhandsCut, 0) : 0;
}

function cnCanHit(o) {
  return o.alive && !o.koOut && !o.invincible && !o.grappled && !o.grapple && !subLocked(o) && !o.slam && !o.igbb && !specialBusy(o) &&
    !duckDropOn(o) && !bearOn(o) && !tornadoOn(o) && !sendLocOn(o) && !swordDuelActive();
}

// ---------------------------------------------------------------- every frame

// From tickStrickland (strickland.js).
function tickChuckNorris(dt) {
  cnClock += dt;
  if (cnBoom) { cnBoom.t += dt; if (cnBoom.t >= CN_BOOM_T) cnBoom = null; }
  if (cnStar) { cnStar.t += dt; if (cnStar.t >= 0.4) cnStar = null; }
  if (cnFlag) { cnFlag.t += dt; if (!chuckNorris) { cnFlag.fade += dt; if (cnFlag.fade >= 1) cnFlag = null; } }
  tickCnSpeech(dt);
  var n = chuckNorris;
  if (!n) return;
  var owner = balls && balls[n.ownerId], vic = balls && balls[1 - n.ownerId], cfg = cnCfg(owner);
  if (!owner || !vic || !cfg) { chuckNorris = null; return; }
  n.t += dt;
  if (n.sayKey && (n.say -= dt) <= 0) { cnLine(cfg, n.sayKey); n.sayKey = null; }
  if (n.tagT > 0 && (n.tagT -= dt) <= 0 && owner.alive) floater(owner.x, owner.y - owner.r - 30, "TAG TEAM!", "crit");
  var am = americaOn(owner) ? owner.igbb : null;
  if (am && (am.phase === "ride" || am.phase === "hop" || am.phase === "overhands" || am.phase === "end")) n.rode = true;
  var bikeDone = n.rode && (!am || am.phase !== "ride");
  if (n.phase !== "rappel" && n.phase !== "walk" && n.phase !== "hop") n.aim = skTurn(n.aim, Math.atan2(vic.y - n.y, vic.x - n.x), dt * 8);

  if (n.phase === "rappel") {
    var k = Math.min(1, n.t / cnNum(cfg.rappel, 0.9)), e = 1 - Math.pow(1 - k, 2.4); // fast, braking at the bottom
    n.y = n.y0 + (n.landY - n.y0) * e;
    if (k >= 1) cnLand(n, cfg);
    return;
  }
  if (n.phase === "stand") {
    // Arms crossed while the bike goes. Called off before the ride: he leaves.
    if (over || !owner.alive || (!am && !n.rode)) return cnPhase(n, "salute");
    if (bikeDone || n.t > 4) { cnPhase(n, "hunt"); n.huntT = 0; return; }
    if (am && (am.phase === "rev" || am.phase === "ride")) cnClearLane(n, owner, am, dt);
    return;
  }
  if (n.phase === "hunt") {
    n.huntT += dt;
    if (over || !owner.alive || n.huntT > cnNum(cfg.time, 4.5)) return cnPhase(n, "salute");
    if (!cnCanHit(vic)) return;
    // Round to their far side from Strickland, so the kick sends them back into him.
    var sx = vic.x - owner.x, sy = vic.y - owner.y, sl = Math.sqrt(sx * sx + sy * sy) || 1;
    var want = CN_R + vic.r + cnNum(cfg.reach, 30) * 0.5;
    var tx = Math.min(W - CN_R - 2, Math.max(CN_R + 2, vic.x + sx / sl * want)), ty = Math.min(H - CN_R - 2, Math.max(CN_R + 2, vic.y + sy / sl * want));
    var mx = tx - n.x, my = ty - n.y, ml = Math.sqrt(mx * mx + my * my) || 1, step = Math.min(ml, cnNum(cfg.speed, 560) * dt);
    n.x += mx / ml * step; n.y += my / ml * step;
    cnClamp(n);
    if (cnGap(n, vic) <= cnNum(cfg.reach, 30)) { cnPhase(n, "wind"); playCnWind(cnNum(cfg.windup, 0.3)); }
    return;
  }
  if (n.phase === "wind") {
    if (!cnCanHit(vic) && !over) { cnPhase(n, "hunt"); return; }
    cnStepIn(n, vic, cnNum(cfg.speed, 560) * 0.45 * dt, cnNum(cfg.reach, 30) * 0.4); // edging in while he winds up
    if (n.t >= cnNum(cfg.windup, 0.3)) { cnPhase(n, "spin"); playCnSpin(); }
    return;
  }
  if (n.phase === "spin") {
    cnStepIn(n, vic, CN_LUNGE * dt, 4); // the spin carries him in
    if (n.t >= CN_SPIN) {
      cnPhase(n, "hold");
      if (!over && cnCanHit(vic) && cnGap(n, vic) <= cnNum(cfg.reach, 30) + 10) cnRoundhouse(n, owner, vic, cfg);
      else if (!over) floater(vic.x, vic.y - vic.r - 8, "WHIFF", "dodge");
    }
    return;
  }
  if (n.phase === "hold") { if (n.t >= CN_HOLD) cnPhase(n, "salute"); return; }
  if (n.phase === "salute") {
    if (n.t >= CN_SALUTE) {
      cnPhase(n, "walk"); n.from = { x: n.x, y: n.y }; n.boomed = false; n.walkT = 0;
      if (!n.talked) { n.sayKey = "leave"; n.say = 0.1; }
    }
    return;
  }
  if (n.phase === "walk" || n.phase === "hop") {
    // Something blows up behind him; he doesn't look.
    n.walkT += dt;
    if (!n.boomed && n.walkT >= 0.3 && cfg.boom !== false) { n.boomed = true; cnExplode(n.from.x, Math.max(36, n.from.y - 34)); }
  }
  if (n.phase === "walk") {
    // Toward the camera, slow.
    var down = cnFenceY() - CN_R - 4 - n.from.y;
    n.y += Math.max(CN_WALK, down / 1.8) * dt;
    if (n.y >= cnFenceY() - CN_R - 4) { n.y = cnFenceY() - CN_R - 4; cnPhase(n, "hop"); n.hopY = n.y; }
    return;
  }
  if (n.phase === "hop") {
    n.hop = Math.min(1, n.t / CN_HOP);
    n.y = n.hopY + n.hop * CN_R * 3.2;
    n.alpha = Math.max(0, 1 - Math.max(0, n.hop - 0.45) / 0.55);
    if (n.hop >= 1) chuckNorris = null;
  }
}

function cnPhase(n, phase) { n.phase = phase; n.t = 0; }
// Toward them by up to `step`, stopping `keep` short (edge to edge).
function cnStepIn(n, vic, step, keep) {
  var dx = vic.x - n.x, dy = vic.y - n.y, d = Math.sqrt(dx * dx + dy * dy) || 1, gap = d - CN_R - vic.r;
  if (gap <= keep) return;
  var k = Math.min(step, gap - keep);
  n.x += dx / d * k; n.y += dy / d * k;
  cnClamp(n);
}
// Hip to boot: out to the near side of them (a long kick, the roundhouse).
function cnLegLen(d, vic) { return Math.max(CN_R * 1.4, Math.min(CN_R * 2.8, d - vic.r * 0.45)); }
// The bike's lane follows them while it revs: he steps out of it, to
// whichever side gets him clear.
function cnClearLane(n, owner, am, dt) {
  var lx = Math.cos(am.aim), ly = Math.sin(am.aim), rx = n.x - owner.x, ry = n.y - owner.y;
  var along = rx * lx + ry * ly, across = -rx * ly + ry * lx, clear = owner.r + CN_R + 12;
  if (along < -owner.r || Math.abs(across) >= clear) return;
  var step = Math.min(clear - Math.abs(across), 420 * dt), x0 = n.x, y0 = n.y, best = null;
  [across >= 0 ? 1 : -1, across >= 0 ? -1 : 1].forEach(function (sd) {
    n.x = x0 - ly * sd * step; n.y = y0 + lx * sd * step; cnClamp(n);
    var moved = Math.abs(n.x - x0) + Math.abs(n.y - y0);
    if (!best || moved > best.moved + 0.5) best = { x: n.x, y: n.y, moved: moved };
  });
  n.x = best.x; n.y = best.y;
}
function cnClamp(n) { n.x = Math.max(CN_R + 2, Math.min(W - CN_R - 2, n.x)); n.y = Math.max(CN_R + 2, Math.min(H - CN_R - 2, n.y)); }

// On the mat: the thud, his name, the flag planted next to him.
function cnLand(n, cfg) {
  n.y = n.landY; n.landed = true;
  cnPhase(n, "stand");
  floater(n.x, n.y - CN_R - 52, "CHUCK NORRIS!", "crit");
  impacts.push({ x: n.x, y: n.y + CN_R * 0.7, nx: 0, ny: -1, life: 0.5, max: 0.5, color: "#ffffff" });
  if (!reduceMotion) {
    shake = Math.max(shake, 10);
    for (var i = 0; i < 14; i++) {
      var a = Math.PI * (i / 13), s = 120 + Math.random() * 160;
      particles.push({ x: n.x + Math.cos(a) * CN_R, y: n.y + CN_R * 0.75, vx: Math.cos(a) * s, vy: -Math.abs(Math.sin(a)) * s * 0.3, life: 0.4, max: 0.5, size: 3 + Math.random() * 3, color: "#c9bda6" });
    }
  }
  if (cfg.flag !== false) {
    var owner = balls[n.ownerId], side = owner && owner.x > n.x ? -1 : 1;
    var fx = n.x + side * CN_R * 1.9;
    if (fx < 14 || fx > W - 14) { side = -side; fx = n.x + side * CN_R * 1.9; }
    cnFlag = { x: Math.max(14, Math.min(W - 14, fx)), y: n.y + CN_R * 0.55, t: 0, fade: 0, side: side };
  }
  playCnLand();
  crowdReact(1);
  n.sayKey = "arrive"; n.say = 0.25;
}

// The kick lands.
function cnRoundhouse(n, owner, vic, cfg) {
  var dx = vic.x - n.x, dy = vic.y - n.y, d = Math.sqrt(dx * dx + dy * dy) || 1, ux = dx / d, uy = dy / d;
  var dealt = hurt(vic, cnNum(cfg.roundhouseDamage, 40), cfg.unblockable === false ? "kick" : "igbb", owner.id); // (like the bike: can't be slipped or blocked)
  if (dealt <= 0) return; // slipped or blocked (hurt says so)
  n.kicked = true; n.kickAng = Math.atan2(dy, dx); n.kickLen = cnLegLen(d, vic);
  // Sent back into Strickland's overhands: the tag.
  var kx = ux, ky = uy, tag = false, am = americaOn(owner) ? owner.igbb : null;
  if (owner.alive && am && (am.phase === "overhands" || am.phase === "hop")) {
    var sx = owner.x - vic.x, sy = owner.y - vic.y, sl = Math.sqrt(sx * sx + sy * sy) || 1;
    if (sl > owner.r + vic.r + 8) { kx = sx / sl * 0.75 + ux * 0.25; ky = sy / sl * 0.75 + uy * 0.25; tag = true; }
  }
  var kl = Math.sqrt(kx * kx + ky * ky) || 1;
  if (!vic.justDodged && teepPushable(vic)) { vic.vx = kx / kl * cnNum(cfg.roundhouseKnock, 700); vic.vy = ky / kl * cnNum(cfg.roundhouseKnock, 700); vic.knockFly = 0.3; }
  var cx = vic.x - ux * vic.r, cy = vic.y - uy * vic.r;
  vic.flash = 0.25;
  vic.squash = { t: 0.3, max: 0.3, nx: -ux, ny: -uy };
  impacts.push({ x: cx, y: cy, nx: -ux, ny: -uy, life: 0.6, max: 0.6, color: CN_USA.red });
  impacts.push({ x: cx, y: cy, nx: -ux, ny: -uy, life: 0.8, max: 0.8, color: "#ffffff" });
  igbbSparks(cx, cy, -ux, -uy, "#ffe9a8", 30, 680);
  igbbSparks(cx, cy, -ux, -uy, CN_USA.blue, 12, 460);
  cnStar = { x: vic.x - ux * vic.r * 0.15, y: vic.y - uy * vic.r * 0.15, t: 0, ang: Math.random() * 6 };
  hitStop = Math.max(hitStop, 0.2);
  if (!reduceMotion) shake = Math.max(shake, 26);
  playCnRoundhouse(dealt);
  crowdReact(1);
  if (amShow) { amShow.burst = 3; amShow.cheer = 1; }
  floater(vic.x, vic.y - vic.r - 34, "ROUNDHOUSE!", "crit");
  if (tag) n.tagT = 0.35; // a beat after ROUNDHOUSE!, so the two don't stack
  checkEnd();
  if (!vic.alive && owner.sk) owner.sk.americaWin = true;
  if (Math.random() * 100 < cnNum(cfg.kickLine, 50)) { n.sayKey = "roundhouse"; n.say = 0.35; n.talked = true; }
}

function cnExplode(x, y) {
  cnBoom = { x: x, y: y, t: 0, seed: Math.random() * 6 };
  if (!reduceMotion) {
    shake = Math.max(shake, 14);
    var cols = [CN_USA.red, "#ffffff", "#4d7dff", "#ffb02e"];
    for (var i = 0; i < 26; i++) {
      var a = Math.random() * Math.PI * 2, s = 140 + Math.random() * 300;
      particles.push({ x: x, y: y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 0.5 + Math.random() * 0.3, max: 0.8, size: 3 + Math.random() * 4, color: cols[i % 4] });
    }
  }
  playCnBoom();
  crowdReact(0.8);
}

// ---------------------------------------------------------------- his voice

// One of his lines for `key` (CN_LINES plus the character file's), heard
// only when it has a real clip (speech.js rules).
function cnLine(cfg, key) {
  var pool = (CN_LINES[key] || []).concat((cfg.lines && cfg.lines[key]) || []);
  if (!pool.length) return;
  cnSay(pool[Math.floor(Math.random() * pool.length)]);
}
// say() for a guest: he isn't one of the two fighters, so speech.js's
// bubbles don't track him. Same clip lookup, same talk channel.
function cnSay(text) {
  if (!text) return;
  var words = splitSpeech(text), clip = SPEECH_CLIPS[text] || null;
  cnSpeech = { words: words, t: 0, said: 0, clip: clip, hidden: clip ? !SPEECH_TEXT_WITH_CLIP : !SPEECH_TEXT_WITHOUT_CLIP,
    dur: words.length * SPEECH_WORD + SPEECH_READ + words.length * 0.12 };
  if (clip) playSpeechClip(clip); // the talk channel (playTalk), Joe's rule
}
function tickCnSpeech(dt) {
  var s = cnSpeech;
  if (!s) return;
  s.t += dt;
  var n = Math.min(s.words.length, Math.floor(s.t / SPEECH_WORD) + 1);
  while (s.said < n) { if (s.words[s.said].bleep && !s.clip && !s.hidden) playBleep(); s.said++; }
  if (s.t >= s.dur || !chuckNorris) cnSpeech = null;
}

// ---------------------------------------------------------------- drawing

// From drawStricklandUnder (strickland.js): the flag he planted.
function drawChuckNorrisUnder() {
  var f = cnFlag;
  if (!f) return;
  var k = Math.min(1, f.t / 0.15) * (1 - f.fade), top = f.y - CN_R * 2.3 * Math.min(1, f.t / 0.15);
  ctx.save();
  ctx.globalAlpha = Math.max(0, k);
  ctx.fillStyle = "rgba(0,0,0,0.18)";
  ctx.beginPath(); ctx.ellipse(f.x, f.y, 9, 3.5, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = theme.wall; ctx.lineWidth = 5; ctx.lineCap = "round";
  ctx.beginPath(); ctx.moveTo(f.x, f.y); ctx.lineTo(f.x, top); ctx.stroke();
  ctx.strokeStyle = "#c9a24a"; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(f.x, f.y); ctx.lineTo(f.x, top); ctx.stroke();
  ctx.translate(f.x, top + 2);
  if (f.side < 0) ctx.scale(-1, 1);
  drawAaFlag(0, 0, CN_R * 1.6, CN_R * 0.95, cnClock * 9, Math.PI / 2); // Gaethje's flag (allamerican.js)
  ctx.fillStyle = "#c9a24a"; ctx.beginPath(); ctx.arc(0, -2, 4, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

// From drawStricklandOver (strickland.js): the explosion, the impact star,
// Chuck, his name tag and his bubble.
function drawChuckNorris() {
  if (cnBoom) drawCnBoom(cnBoom);
  if (cnStar) drawCnStar(cnStar); // under his boot
  var n = chuckNorris;
  if (n) drawCnChuck(n);
  if (n && cnSpeech && !cnSpeech.hidden) drawCnSpeech(n);
}

function drawCnChuck(n) {
  var r = CN_R, walking = n.phase === "walk" || n.phase === "hunt";
  var bob = walking ? Math.abs(Math.sin(cnClock * (n.phase === "walk" ? 8 : 14))) * 3 : 0;
  var lift = n.phase === "hop" ? Math.sin(n.hop * Math.PI) : 0;
  var x = n.x, y = n.y - bob - lift * r * 0.5, sc = 1 + lift * 0.15;
  var aim = n.aim, ux = Math.cos(aim), uy = Math.sin(aim);
  ctx.save();
  ctx.globalAlpha = n.alpha;
  // the rope, down from the rafters to his hand
  if (n.phase === "rappel") {
    var sway = Math.sin(cnClock * 7) * 3;
    ctx.strokeStyle = theme.wall; ctx.lineWidth = 6; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(x + r * 0.15, y - 2000); ctx.lineTo(x + r * 0.15, y - r * 1.75); ctx.moveTo(x + r * 0.1, y + r * 0.55); ctx.lineTo(x + r * 0.1 + sway, y + r * 1.7); ctx.stroke();
    ctx.strokeStyle = "#c8a46b"; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(x + r * 0.15, y - 2000); ctx.lineTo(x + r * 0.15, y - r * 1.75); ctx.moveTo(x + r * 0.1, y + r * 0.55); ctx.lineTo(x + r * 0.1 + sway, y + r * 1.7); ctx.stroke();
  }
  // shadow on the mat (still up in the air while he slides down)
  var gy = n.phase === "rappel" ? n.landY : n.y;
  var near = n.phase === "rappel" ? Math.max(0.25, 1 - (n.landY - n.y) / 400) : 1;
  ctx.fillStyle = "rgba(0,0,0," + (0.18 * near) + ")";
  ctx.beginPath(); ctx.ellipse(n.x + r * 0.15, gy + r * 0.92, r * 0.9 * near, r * 0.28 * near, 0, 0, Math.PI * 2); ctx.fill();
  ctx.translate(x, y);
  ctx.scale(sc, sc);
  // the flag streaming up over him on the way down
  if (n.phase === "rappel") {
    ctx.save(); ctx.rotate(-Math.PI / 2 + Math.sin(cnClock * 5) * 0.06);
    drawAaFlag(r * 0.1, -r * 0.95, r * 3, r * 1.9, cnClock * 16, Math.PI / 2);
    ctx.restore();
  }
  var spin = 0;
  if (n.phase === "spin") spin = -(2 * Math.PI + 0.35) * (1 - n.t / CN_SPIN) * (Math.cos(aim) >= 0 ? 1 : -1);
  if (n.phase === "wind") spin = -0.35 * Math.min(1, n.t / 0.15) * (Math.cos(aim) >= 0 ? 1 : -1);
  var kicking = n.phase === "spin" || n.phase === "hold";
  // under the body: arms that reach out from behind it
  if (n.phase === "hunt" || n.phase === "wind") cnGuardArms(r, ux, uy);
  else if (kicking) cnBalanceArms(r, n.phase === "hold" && n.kicked ? n.kickAng : aim + spin);
  if (n.phase === "wind") {
    var p = 0.5 + 0.5 * Math.sin(cnClock * 26);
    [CN_USA.red, "#ffffff", CN_USA.blue].forEach(function (c, i) {
      ctx.globalAlpha = n.alpha * (0.35 + 0.45 * p); ctx.strokeStyle = c; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.arc(0, 0, r + 6 + i * 5 + 3 * p, 0, Math.PI * 2); ctx.stroke();
    });
    ctx.globalAlpha = n.alpha;
  }
  ctx.save();
  ctx.rotate(spin);
  drawFighterArt(ctx, 0, 0, r, CN_LOOK, theme.wall, { layout: "contained", name: "chuck norris" });
  drawCnKit(r);
  drawCnHat(r);
  ctx.restore();
  // over the body (the kicking leg too, so the hat never hides it)
  if (n.phase === "spin") {
    var vic = balls[1 - n.ownerId], vd = Math.sqrt((vic.x - n.x) * (vic.x - n.x) + (vic.y - n.y) * (vic.y - n.y)) || 1;
    cnLeg(r, aim + spin, cnLegLen(vd, vic) * (0.55 + 0.45 * n.t / CN_SPIN), true);
  } else if (n.phase === "hold") cnLeg(r, n.kicked ? n.kickAng : aim, n.kicked ? n.kickLen : r * 1.6, false); // held out where they were
  if (n.phase === "rappel") cnRappelArms(r);
  else if (n.phase === "stand") cnCrossedArms(r);
  else if (n.phase === "salute") cnSalute(r, n.t);
  else if (n.phase === "walk" || n.phase === "hop") cnWalkArms(r, n.t);
  ctx.restore();
  // his name tag, over the hat
  if (n.alpha > 0.05 && n.phase !== "rappel") {
    var ty = y - r * 1.58 * sc - 14;
    ctx.save();
    ctx.globalAlpha = n.alpha;
    ctx.font = "800 15px \"Barlow Condensed\", \"Arial Narrow\", sans-serif";
    var label = "CHUCK NORRIS", tw = ctx.measureText(label).width + 16;
    var lx = Math.max(tw / 2 + 2, Math.min(W - tw / 2 - 2, x));
    ctx.fillStyle = CN_USA.blue; ctx.strokeStyle = CN_USA.red; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.roundRect(lx - tw / 2, ty - 10, tw, 20, 5); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#ffffff"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(label, lx, ty + 0.5);
    ctx.restore();
  }
}

function cnArm(sx, sy, hx, hy, size) {
  strokeLimb(size * 0.7, CN_DENIM, function () { ctx.moveTo(sx, sy); ctx.lineTo(hx, hy); });
  cnFist(hx, hy, size * 0.62);
}
function cnBentArm(sx, sy, ex, ey, hx, hy, size) {
  strokeLimb(size * 0.7, CN_DENIM, function () { ctx.moveTo(sx, sy); ctx.lineTo(ex, ey); ctx.lineTo(hx, hy); });
  cnFist(hx, hy, size * 0.62);
}
// A bare fist: no gloves on Chuck Norris.
function cnFist(x, y, s) {
  ctx.fillStyle = CN_LOOK.skin; ctx.strokeStyle = theme.wall; ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.arc(x, y, s, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.strokeStyle = "rgba(0,0,0,0.25)"; ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.arc(x, y, s * 0.55, -0.9, 0.9); ctx.stroke();
}

function cnRappelArms(r) {
  cnBentArm(r * 0.62, -r * 0.1, r * 1.0, -r * 0.95, r * 0.15, -r * 1.75, 13); // up on the rope
  cnBentArm(-r * 0.62, 0, -r * 0.4, r * 0.5, r * 0.1, r * 0.55, 13);           // feeding it below
}
function cnGuardArms(r, ux, uy) {
  var px = -uy, py = ux;
  [-1, 1].forEach(function (s) {
    cnArm(px * s * r * 0.55, py * s * r * 0.55, ux * r * 1.05 + px * s * r * 0.4, uy * r * 1.05 + py * s * r * 0.4, 13);
  });
}
function cnBalanceArms(r, ang) {
  var ux = Math.cos(ang), uy = Math.sin(ang), px = -uy, py = ux;
  [-1, 1].forEach(function (s) {
    cnArm(px * s * r * 0.5, py * s * r * 0.5, px * s * r * 1.45 - ux * r * 0.35, py * s * r * 1.45 - uy * r * 0.35, 13);
  });
}
function cnCrossedArms(r) {
  cnArm(-r * 0.82, r * 0.16, r * 0.42, r * 0.29, 13);
  cnArm(r * 0.82, r * 0.16, -r * 0.42, r * 0.23, 13);
}
// Hand up to the brim, held, then down.
function cnSalute(r, t) {
  var k = Math.min(1, t / 0.15) * Math.min(1, Math.max(0, (CN_SALUTE - t) / 0.12));
  var hx = r * (0.95 - 0.42 * k), hy = r * (0.15 - 1.0 * k);
  cnBentArm(r * 0.62, -r * 0.05, r * (1.0 + 0.2 * k), -r * (0.1 + 0.4 * k), hx, hy, 13);
  cnArm(-r * 0.7, -r * 0.02, -r * 0.95, r * 0.45, 13);
}
function cnWalkArms(r, t) {
  var sw = Math.sin(t * 8) * r * 0.12;
  cnArm(-r * 0.72, -r * 0.02, -r * 0.98, r * 0.45 + sw, 13);
  cnArm(r * 0.72, -r * 0.02, r * 0.98, r * 0.45 - sw, 13);
}

// The kicking leg: jeans out of the body and a cowboy boot on the end, `len`
// from his middle to the boot. `blur` draws the swoosh.
function cnLeg(r, ang, len, blur) {
  var ux = Math.cos(ang), uy = Math.sin(ang);
  if (blur) {
    ctx.save(); ctx.lineCap = "round";
    [0.5, 0.9, 1.3].forEach(function (back, i) {
      ctx.globalAlpha = 0.5 - i * 0.14; ctx.strokeStyle = i === 1 ? CN_USA.red : "#ffffff"; ctx.lineWidth = 6 - i;
      ctx.beginPath(); ctx.arc(0, 0, len + r * 0.25, ang - back, ang - back + 0.5); ctx.stroke();
    });
    ctx.restore();
  }
  strokeLimb(r * 0.4, CN_JEANS, function () { ctx.moveTo(ux * r * 0.45, uy * r * 0.45); ctx.lineTo(ux * len, uy * len); });
  ctx.save();
  ctx.translate(ux * len, uy * len); ctx.rotate(ang);
  if (Math.cos(ang) < 0) ctx.scale(1, -1); // the toe stays on top
  var b = r * 0.3;
  ctx.fillStyle = CN_BOOT; ctx.strokeStyle = theme.wall; ctx.lineWidth = 2.5; ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(-b * 0.6, -b * 0.75);           // the shaft
  ctx.lineTo(b * 0.35, -b * 0.75);
  ctx.quadraticCurveTo(b * 0.5, -b * 0.2, b * 0.9, -b * 0.15);
  ctx.quadraticCurveTo(b * 1.65, -b * 0.05, b * 1.75, b * 0.45); // the pointed toe
  ctx.lineTo(b * 0.1, b * 0.6);
  ctx.lineTo(-b * 0.25, b * 0.95);            // the heel
  ctx.lineTo(-b * 0.6, b * 0.95);
  ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.strokeStyle = "rgba(255,255,255,0.35)"; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(-b * 0.4, -b * 0.4); ctx.quadraticCurveTo(0, -b * 0.1, b * 0.25, -b * 0.45); ctx.stroke();
  ctx.fillStyle = "#cfd4da";
  ctx.beginPath(); ctx.arc(-b * 0.75, b * 0.55, b * 0.16, 0, Math.PI * 2); ctx.fill(); // the spur
  ctx.restore();
}

// The rest of Walker's kit over his art: a Ranger's star on the shirt, the
// flag bandana at his neck, the big buckle.
function drawCnKit(r) {
  ctx.save();
  // the Ranger's star: a silver star in a ring, on his left chest
  var bx = r * 0.43, by = r * 0.02, br = r * 0.1;
  ctx.fillStyle = "#e3e6ea"; ctx.strokeStyle = "#5b6066"; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.arc(bx, by, br, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = "#9aa1a8"; skStar(ctx, bx, by, br * 0.85);
  // the bandana: a little stars and stripes knotted under his beard
  ctx.save();
  ctx.beginPath(); ctx.moveTo(-r * 0.26, -r * 0.1); ctx.lineTo(r * 0.26, -r * 0.1); ctx.lineTo(0, r * 0.14); ctx.closePath();
  ctx.clip();
  for (var i = 0; i < 6; i++) { ctx.fillStyle = i % 2 ? "#ffffff" : CN_USA.red; ctx.fillRect(-r * 0.3, -r * 0.1 + i * r * 0.045, r * 0.6, r * 0.045); }
  ctx.fillStyle = CN_USA.blue; ctx.fillRect(-r * 0.3, -r * 0.1, r * 0.26, r * 0.12);
  ctx.fillStyle = "#ffffff"; skStar(ctx, -r * 0.14, -r * 0.045, r * 0.035);
  ctx.restore();
  ctx.strokeStyle = theme.wall; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(-r * 0.26, -r * 0.1); ctx.lineTo(r * 0.26, -r * 0.1); ctx.lineTo(0, r * 0.14); ctx.closePath(); ctx.stroke();
  // the buckle
  var ky = r * 0.36 + r * 0.065;
  ctx.fillStyle = "#d4af37"; ctx.strokeStyle = "#7a5a14"; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.ellipse(0, ky, r * 0.17, r * 0.1, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = "#fff2b0"; skStar(ctx, 0, ky, r * 0.06);
  ctx.restore();
}

// The cowboy hat: a tan cattleman, creased down the middle, brim curled up
// at the sides, a dark band.
function drawCnHat(r) {
  var ink = theme.wall, by = -r * 0.8; // on the hairline, so the beard shows under the brim
  ctx.save();
  ctx.lineJoin = "round"; ctx.lineCap = "round"; ctx.lineWidth = Math.max(2, r * 0.06); ctx.strokeStyle = ink;
  // the brim
  ctx.fillStyle = shadeHex(CN_HAT, -0.08);
  ctx.beginPath();
  ctx.moveTo(-r * 1.32, by - r * 0.2);
  ctx.quadraticCurveTo(-r * 1.05, by + r * 0.14, 0, by + r * 0.15);
  ctx.quadraticCurveTo(r * 1.05, by + r * 0.14, r * 1.32, by - r * 0.2);
  ctx.quadraticCurveTo(r * 0.95, by - r * 0.04, 0, by - r * 0.06);
  ctx.quadraticCurveTo(-r * 0.95, by - r * 0.04, -r * 1.32, by - r * 0.2);
  ctx.closePath(); ctx.fill(); ctx.stroke();
  // the crown
  var crown = function () {
    ctx.beginPath();
    ctx.moveTo(-r * 0.58, by - r * 0.02);
    ctx.bezierCurveTo(-r * 0.66, by - r * 0.42, -r * 0.58, by - r * 0.74, -r * 0.34, by - r * 0.76);
    ctx.quadraticCurveTo(-r * 0.14, by - r * 0.68, 0, by - r * 0.6);
    ctx.quadraticCurveTo(r * 0.14, by - r * 0.68, r * 0.34, by - r * 0.76);
    ctx.bezierCurveTo(r * 0.58, by - r * 0.74, r * 0.66, by - r * 0.42, r * 0.58, by - r * 0.02);
    ctx.quadraticCurveTo(0, by + r * 0.05, -r * 0.58, by - r * 0.02);
    ctx.closePath();
  };
  var g = ctx.createLinearGradient(-r * 0.6, 0, r * 0.6, 0);
  g.addColorStop(0, shadeHex(CN_HAT, -0.2)); g.addColorStop(0.4, shadeHex(CN_HAT, 0.12)); g.addColorStop(1, shadeHex(CN_HAT, -0.25));
  crown(); ctx.fillStyle = g; ctx.fill();
  ctx.save(); crown(); ctx.clip();
  ctx.fillStyle = CN_BAND; ctx.fillRect(-r, by - r * 0.2, r * 2, r * 0.16);
  ctx.fillStyle = "#cfd4da"; ctx.beginPath(); ctx.arc(r * 0.38, by - r * 0.12, r * 0.05, 0, Math.PI * 2); ctx.fill(); // the band's concho
  ctx.strokeStyle = "rgba(0,0,0,0.25)"; ctx.lineWidth = Math.max(1, r * 0.03);
  ctx.beginPath(); ctx.moveTo(0, by - r * 0.6); ctx.quadraticCurveTo(r * 0.03, by - r * 0.4, 0, by - r * 0.22); ctx.stroke(); // the crease
  ctx.restore();
  crown(); ctx.stroke();
  ctx.restore();
}

// The roundhouse's impact: a big comic star, popping in and gone.
function drawCnStar(s) {
  var pop = Math.min(1, s.t / 0.06), a = Math.max(0, 1 - Math.max(0, s.t - 0.15) / 0.25), R = 36 * (0.6 + 0.4 * pop);
  ctx.save();
  ctx.globalAlpha = a;
  ctx.translate(s.x, s.y); ctx.rotate(s.ang);
  ctx.fillStyle = "#ffffff"; ctx.strokeStyle = CN_USA.red; ctx.lineWidth = 4; ctx.lineJoin = "round";
  ctx.beginPath();
  for (var i = 0; i < 20; i++) { var ang = i * Math.PI / 10, rr = i % 2 ? R * 0.5 : R; ctx[i ? "lineTo" : "moveTo"](Math.cos(ang) * rr, Math.sin(ang) * rr); }
  ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = CN_USA.blue; skStar(ctx, 0, 0, R * 0.42);
  ctx.restore();
}

// The explosion behind him: a white flash, a cartoon fireball (red, orange,
// yellow, white-hot middle, inked edge so it reads on a light mat), then
// smoke rolling up.
function drawCnBoom(b) {
  var t = b.t, grow = 1 - Math.pow(1 - Math.min(1, t / 0.3), 3), fade = Math.max(0, 1 - Math.max(0, t - 0.5) / 0.6);
  var blob = function (R, wob) {
    ctx.beginPath();
    for (var i = 0; i < 16; i++) {
      var a = i / 16 * Math.PI * 2, rr = R * (i % 2 ? 0.8 : 1.04) * (0.92 + 0.08 * Math.sin(b.seed * 3 + i * 2.3 + t * wob));
      ctx[i ? "lineTo" : "moveTo"](b.x + Math.cos(a) * rr, b.y + Math.sin(a) * rr * 0.9);
    }
    ctx.closePath();
  };
  ctx.save();
  ctx.lineJoin = "round";
  // smoke, rising out of it
  for (var i = 0; i < 7; i++) {
    var st = t - 0.2 - i * 0.04;
    if (st <= 0) continue;
    var a = b.seed + i * 0.9, sr = 18 + st * 40, sx = b.x + Math.cos(a) * (20 + st * 26), sy = b.y + Math.sin(a) * 12 - st * 80;
    ctx.globalAlpha = Math.max(0, 0.55 * (1 - st / 1.2));
    ctx.fillStyle = i % 2 ? "#4e4e4e" : "#6e6e6e";
    ctx.beginPath(); ctx.arc(sx, sy, sr, 0, Math.PI * 2); ctx.fill();
  }
  if (fade > 0) {
    var R = 26 + 56 * grow;
    ctx.globalAlpha = fade;
    blob(R, 7); ctx.fillStyle = "#c8281e"; ctx.fill(); ctx.strokeStyle = theme.wall; ctx.lineWidth = 3; ctx.stroke();
    blob(R * 0.76, 9); ctx.fillStyle = "#f2701c"; ctx.fill();
    blob(R * 0.52, 11); ctx.fillStyle = "#ffc23a"; ctx.fill();
    blob(R * 0.28, 13); ctx.fillStyle = "#fff6d0"; ctx.fill();
  }
  if (t < 0.1) {
    ctx.globalAlpha = 1 - t / 0.1; ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 8;
    ctx.beginPath(); ctx.arc(b.x, b.y, 30 + t * 700, 0, Math.PI * 2); ctx.stroke();
  }
  ctx.restore();
}

function drawCnSpeech(n) {
  var s = cnSpeech, who = { x: n.x, y: n.y, r: CN_R, char: CN_CH };
  var L = speechLayout(who, s.words), under = L.below.ok, rect = { x: L.x, y: under ? L.below.y : L.above.y, w: L.w, h: L.h };
  var shown = Math.min(s.words.length, Math.floor(s.t / SPEECH_WORD) + 1);
  var alpha = Math.min(1, (s.dur - s.t) / SPEECH_FADE);
  var pop = Math.min(1, s.t / SPEECH_POP), scale = 0.82 + 0.18 * (1 - Math.pow(1 - pop, 3));
  drawSpeechBubble(who, L, rect, under, shown, alpha, scale);
}

// ---------------------------------------------------------------- gallery (gallery.js, through strickland.js)

function chuckNorrisSpecialInfo(sp) {
  var c = sp && sp.norris;
  if (!c || c.on === false) return "";
  return " Chuck Norris rappels down from the rafters when it turns America, plants a flag at his side and waits arms crossed while the bike goes; then he walks them down, winds up (the tell) and spins into his roundhouse kick: " +
    cnNum(c.roundhouseDamage, 40) + (c.unblockable === false ? " (it slips and blocks like any kick)" : " (it can't be slipped or blocked: get away during the wind-up)") + ", sending them flying back into Strickland's overhands (" + cnNum(c.overhandsCut, 0) +
    " fewer of those with him there). Then he salutes and walks off without looking back while something explodes behind him.";
}

function chuckNorrisGalleryMove(ch, add) {
  var c = ch.special && ch.special.move === "america" && ch.special.norris;
  if (!c || c.on === false) return;
  add("🤠", "Chuck Norris", "In America, Chuck Norris rappels in, then his spinning roundhouse kick (" + cnNum(c.roundhouseDamage, 40) + ") sends them back into Strickland's overhands. Tag team.");
}

function chuckNorrisGalleryAssets(list) {
  list.push({ name: "Chuck Norris", info: "Sean Strickland's guest in America: the hat, the beard, the denim, the roundhouse.", w: 300, h: 260, draw: function (c, w, h) {
    withCtx(c, function () {
      ctx.save(); ctx.translate(w * 0.4, h * 0.57); ctx.scale(1.6, 1.6);
      cnBalanceArms(CN_R, -0.15);
      drawFighterArt(ctx, 0, 0, CN_R, CN_LOOK, theme.wall, { layout: "contained", name: "chuck norris" });
      drawCnKit(CN_R); drawCnHat(CN_R);
      cnLeg(CN_R, -0.15, CN_R * 1.75, false);
      ctx.restore();
    });
  } });
}

function chuckNorrisGallerySounds(groups, synth) {
  groups.push({ title: "Chuck Norris (in America)", items: [
    synth("Rappel", "Sliding down the rope from the rafters.", function () { playCnZip(0.9); }),
    synth("Landing", "Hitting the mat at Strickland's side.", function () { playCnLand(); }),
    synth("Roundhouse wind-up", "The tell before the spin.", function () { playCnWind(0.3); }),
    synth("Roundhouse", "The spin and the boot landing.", function () { playCnSpin(); setTimeout(function () { lastPunchSound = 0; playCnRoundhouse(40); }, 200); }),
    synth("Explosion", "Going off behind him as he walks away.", function () { playCnBoom(); })
  ] });
}

// ---------------------------------------------------------------- sound
// Synthesized (Web Audio), like Strickland's.

// Down the rope: a rising zip and the rope hissing through his hands.
function playCnZip(dur) {
  skAudio(function (ac, t) {
    for (var i = 0; i < 6; i++) caneBurst(ac, t + i * dur / 6, 1400 + i * 380, 3, 0.09, dur / 6 + 0.06);
    caneTone(ac, t, "triangle", 900, 300, 0.05, dur);
  });
}
// The landing: a thud and a short brass sting.
function playCnLand() {
  playSlam();
  skAudio(function (ac, t) {
    caneTone(ac, t, "sine", 95, 35, 0.7, 0.4);
    caneBurst(ac, t, 320, 0.6, 0.35, 0.3);
    caneTone(ac, t + 0.06, "square", 392, 392, 0.05, 0.16);
    caneTone(ac, t + 0.06, "square", 587, 587, 0.04, 0.16);
    caneTone(ac, t + 0.24, "square", 523, 523, 0.05, 0.34);
    caneTone(ac, t + 0.24, "square", 784, 784, 0.04, 0.34);
  });
}
function playCnWind(dur) { skAudio(function (ac, t) { caneTone(ac, t, "triangle", 160, 520, 0.14, Math.max(0.15, dur)); }); }
function playCnSpin() {
  playWhoosh();
  skAudio(function (ac, t) { caneBurst(ac, t, 900, 0.7, 0.35, 0.22); caneBurst(ac, t + 0.08, 1600, 1.2, 0.2, 0.16); });
}
// The boot landing: a crack, a deep thump and a cartoon ding.
function playCnRoundhouse(dealt) {
  playPunch(Math.max(35, (dealt || 35) * 1.4));
  skAudio(function (ac, t) {
    caneBurst(ac, t, 2600, 0.9, 0.9, 0.07);
    caneTone(ac, t, "sine", 120, 32, 0.9, 0.5);
    caneTone(ac, t + 0.02, "triangle", 1320, 1300, 0.07, 0.45);
  });
}
// The explosion: a low roar and crackle.
function playCnBoom() {
  playSlam();
  skAudio(function (ac, t) {
    caneBurst(ac, t, 140, 0.5, 1.0, 1.4);
    caneBurst(ac, t, 60, 0.4, 0.9, 1.0);
    caneTone(ac, t, "sine", 70, 22, 0.9, 1.0);
    for (var i = 0; i < 8; i++) caneBurst(ac, t + 0.1 + i * 0.07, 2600 + (i % 3) * 600, 2, 0.22, 0.05);
  });
}
