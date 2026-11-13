// Georges St-Pierre, "GSP" (Christian, 2026-11-12). Welterweight, on the
// Grappler base. Everything below is set in his character file under "gsp"
// (and his special); leave a block out and that part is switched off.
//
// Walkout   (gsp.walkout) he comes out in his karate gi (he trained Kyokushin)
//           and a white hachimaki headband with a red sun, and throws them
//           off `keep` seconds into the fight. Drawn by drawGspGi and
//           drawGspHachimaki (look.gi, look.hachimaki, fighter-art.js).
//           Small Japanese characters on his left chest (tattoos.kanji).
// Crowd meter  his special bar is the crowd. It fills over time and with
//           every clean hit like any special, and more for each slip
//           (crowd.dodge), Superman punch (crowd.superman), takedown
//           (crowd.takedown) and "not impressed" (crowd.taunt). Past
//           `chantAt` of the bar the crowd turns into a Montreal crowd
//           (the Do Bronx crowd swap, stadium.js): the cameras flash and the
//           fans come back in red, white and blue waving Quebec and Canada
//           flags, chanting "GSP! GSP!". While they chant (gsp.chant) he
//           does `damage` times the damage, rolls `speed` times faster and
//           attacks `attack` times faster, and his Superman punch hits harder.
// Superman Dive  his special (special.move "supermandive"): when the bar
//           fills it goes off by itself. He rises up off the mat while a red
//           lane shows where he'll fly (it follows them, then locks for
//           `lock` seconds), then he flies down it with both arms out and a
//           red cape. Catch them and it's `damage` (can't be slipped or
//           blocked); he pins them and drives them round the cage, the
//           Power Puncher's pinball (beginWallSlam, abilities.js): `walls`
//           wall slams of `wallDamage`. Miss and he crashes into the cage
//           and is dazed for `crashTime` seconds. Then the bar starts over
//           and the crowd chants on for crowd.hold seconds.
// Superman punch  (gsp.superman) a regular move: every few seconds, when
//           they're a step or two away, he loads up (the tell, "SUPERMAN
//           PUNCH!") and leaps at them with one fist out, a red cape
//           appearing mid-air. `damage`, or `chantDamage` while the crowd
//           chants. Can be slipped or blocked like any punch.
// Slips     (gsp.dodge) very good defense: he slips `chance`% of strikes and
//           `projChance`% of anything thrown at him (from hurt, match.js).
// Not impressed  (gsp.notImpressed) after `after` slips in a run (`window`
//           seconds without a slip ends it; each hit he takes knocks
//           `hitCost` off it) he drops his hands for `handsDown` seconds,
//           open to anything, and says "I'm not
//           impressed by your performance." (his line to Matt Hughes, UFC 63).
// Double leg  (gsp.doubleLeg) the best takedown in the game: `through`% of
//           his shots go straight through, with no slip, block, sprawl or
//           guillotine (attemptGrab, grapple-duel.js). A cheating Gane still
//           grabs the cage.
// The Superman punch runs on b.gspSp and the taunt on b.gspTaunt; the dive
// runs on b.igbb (move "supermandive"), like every special.
"use strict";

// Registered here rather than in special.js's table, so fighters built in
// parallel don't all edit the same line.
SPECIAL_MOVES.supermandive = "Superman Dive";

var GSP_LAND = 0.16;      // settling after the Superman punch
var GSP_DIVE_LAND = 0.9;  // arms up after the pinball
var GSP_CRASH = 0.3;      // squashed against the cage after a missed dive
var GSP_ECHO = 1.25;      // how long a "GSP! GSP!" bubble stays up
var GSP_LINE = "I'm not impressed by your performance."; // to Matt Hughes, UFC 63, 2006
// Things nobody slips (the same list the weave leaves alone, match.js).
var GSP_NO_SLIP = { laser: true, slam: true, grapple: true, finisher: true, flow: true, kickback: true, slugfest: true, kofinal: true, igbb: true };
var MTL = { red: "#d52b1e", white: "#f4f4f2", blue: "#0b4ea2", navy: "#0a3577" };
var MTL_SIGNS = [["GSP!", MTL.white, MTL.red], ["GSP! GSP!", MTL.red, MTL.white], ["RUSH", MTL.blue, MTL.white],
  ["QUÉBEC", MTL.blue, MTL.white], ["CANADA", MTL.white, MTL.red], ["ALLEZ GSP!", MTL.blue, MTL.white]];
// The maple leaf off the Canadian flag (its official outline, arcs straightened), in a -1..1 box.
var MAPLE_LEAF = [-0.045, 1, -0.022, 0.572, -0.077, 0.523, -0.504, 0.598, -0.446, 0.439, -0.456, 0.403, -0.923, 0.025, -0.818, -0.024,
  -0.801, -0.064, -0.893, -0.347, -0.624, -0.29, -0.588, -0.309, -0.536, -0.432, -0.326, -0.206, -0.271, -0.235, -0.372, -0.757,
  -0.21, -0.663, -0.165, -0.676, 0, -1, 0.165, -0.676, 0.21, -0.663, 0.372, -0.757, 0.271, -0.235, 0.326, -0.206, 0.536, -0.432,
  0.588, -0.309, 0.624, -0.29, 0.893, -0.347, 0.801, -0.064, 0.818, -0.024, 0.923, 0.025, 0.456, 0.403, 0.446, 0.439, 0.504, 0.598,
  0.077, 0.523, 0.022, 0.572, 0.045, 1];

var montrealMode = false; // the crowd is a Montreal crowd chanting GSP right now
var gspCrowdBuilt = false;
var gspBeatT = 0;         // to the next "GSP! GSP!"
var gspEchoes = [];       // chant bubbles over the stands
var gspCloth = [];        // the gi and headband flying off at the walkout
var gspClock = 0;

function gspRand(r) { return r[0] + Math.random() * (r[1] - r[0]); }
function gspCfg(b) { return b && b.char && b.char.gsp; }
function montrealOn() { return !!montrealMode; }
function gspDiveOn(b) { return !!(b && b.igbb && b.igbb.move === "supermandive"); }
function gspPunchOn(b) { return !!(b && b.gspSp); }
// Busy with one of his own moves: the speed regulator leaves him alone (physics.js).
function gspBusy(b) { return !!(b && (b.gspSp || b.gspTaunt || b.gspStun > 0 || b.gspThrow || b.gspBrace)); }
// His hands are drawn by drawGsp (drawHands skips them, draw-attacks.js).
function gspHandsBusy(b) { return gspBusy(b) || gspDiveOn(b) || gspShieldHandsBusy(b); } // (the Maple Shield, gsp-shield.js)
function gspTurn(a, want, maxStep) {
  var diff = Math.atan2(Math.sin(want - a), Math.cos(want - a));
  return a + Math.max(-maxStep, Math.min(maxStep, diff));
}

// From startMatchSeeded.
function resetGsp() {
  montrealMode = false; gspBeatT = 0; gspEchoes = []; gspCloth = []; gspClock = 0;
}
// From makeBall (after its weight class is applied).
function initGsp(b) {
  var cfg = gspCfg(b);
  b.gspSp = null; b.gspTaunt = null; b.gspStun = 0; b.gspChant = false;
  initGspShield(b); // the Maple Shield (gsp-shield.js)
  if (!cfg) return;
  b.gspBase = { char: b.char, speed: b.baseSpeed, atk: b.atkRate };
  b.gspGi = !!cfg.walkout; b.gspGiT = 0;
  b.gspSpT = cfg.superman ? gspRand(cfg.superman.first) : Infinity;
  b.gspRun = 0; b.gspRunT = 0; b.gspTauntWant = false; b.gspTauntN = 0; b.gspTauntCd = 0;
  b.gspHp = b.hp; b.gspChantHold = 0;
  gspApplyChar(b);
}

// His character for right now, built from the one he came in with: the gi
// on for the walkout, and harder hits while the crowd chants.
function gspApplyChar(b) {
  var base = b.gspBase.char, cfg = base.gsp, ch = Object.assign({}, base);
  if (b.gspGi && cfg.walkout) {
    var w = cfg.walkout;
    ch.look = Object.assign({}, base.look, { gi: { color: w.gi, belt: w.belt }, hachimaki: { color: w.headband, sun: w.sun } });
  }
  if (b.gspChant && cfg.chant) {
    var k = cfg.chant.damage || 1;
    if (base.punch) ch.punch = Object.assign({}, base.punch, { damage: base.punch.damage * k });
    if (base.grapple) ch.grapple = Object.assign({}, base.grapple, { damage: base.grapple.damage * k,
      finSlamDamage: base.grapple.finSlamDamage * k, finPunchDamage: base.grapple.finPunchDamage * k });
  }
  b.char = ch;
}

// The crowd getting louder: time off his special bar.
function gspCrowd(b, secs) {
  if (!secs || !b.char.hasSpecial || b.igbb || !b.alive) return;
  b.specialT = Math.min(b.char.special.chargeTime, (b.specialT || 0) + secs);
}

// ---------------------------------------------------------------- walkout

// Throws the gi and the headband off over the cage.
function gspGiOff(b) {
  if (!b.gspGi) return;
  b.gspGi = false;
  gspApplyChar(b);
  // Sideways over the nearer side of the cage, into the crowd (the start-of-
  // fight banner covers the top of the screen).
  var side = b.x < W / 2 ? -1 : 1, ang = side < 0 ? Math.PI + 0.3 : -0.3;
  gspCloth.push({ kind: "gi", x: b.x, y: b.y, vx: Math.cos(ang) * 560, vy: Math.sin(ang) * 560, rot: 0, spin: 6 * side, t: 0, dur: 1.6, r: b.r * 1.2 });
  gspCloth.push({ kind: "band", x: b.x, y: b.y - b.r * 0.6, vx: Math.cos(ang - side * 0.35) * 470, vy: Math.sin(ang - side * 0.35) * 470, rot: 0, spin: -10 * side, t: 0, dur: 1.5, r: b.r * 1.1 });
  playGiToss();
}

// ---------------------------------------------------------------- the chant

function gspChantWanted(b, cfg) {
  if (!cfg.crowd || !b.char.hasSpecial || !b.alive) return false;
  if (over) return b.gspChant && !balls[1 - b.id].alive; // they keep chanting for a GSP win
  if (!started) return false;
  if (gspDiveOn(b) || b.gspChantHold > 0) return true;
  return b.specialT >= b.char.special.chargeTime * cfg.crowd.chantAt;
}

function gspSetChant(b, on, cfg) {
  b.gspChant = on;
  gspApplyChar(b);
  var cc = cfg.chant || {};
  b.baseSpeed = b.gspBase.speed * (on ? cc.speed || 1 : 1);
  b.atkRate = b.gspBase.atk * (on ? cc.attack || 1 : 1);
  var was = montrealMode;
  montrealMode = balls.some(function (o) { return o.gspChant; });
  if (montrealMode && !was) {
    buildMontrealCrowd();
    // The cameras flash and the crowd comes back a Montreal crowd (dobronx.js).
    cameraFlash();
    if (b.specialT < b.char.special.chargeTime) floater(b.x, b.y - b.r - 30, "GSP! GSP!", "crit"); // (full: the dive's call goes up instead)
    gspBeatT = 0.45;
    crowdReact(1);
    gspGiOff(b);
  } else if (!montrealMode && was && !over) {
    screenFlash = Math.max(screenFlash, 0.55); // a quick flash to swap the crowd back
  }
}

// "GSP! GSP!" from the stands: bubbles, the chant, the crowd up.
function gspChantBeat() {
  var spots = [];
  for (var i = 0; i < 5; i++) {
    if (stadiumOn()) {
      if (i < 3) spots.push({ x: 180 + i * 360 + (Math.random() - 0.5) * 140, y: 1450 + Math.random() * 110, d: i * 0.08 });
      else spots.push({ x: i === 3 ? 122 : STAGE_W - 122, y: 700 + Math.random() * 560, d: 0.12 + Math.random() * 0.1 }); // (in far enough that the bubble isn't cut off)
    } else {
      spots.push({ x: 60 + i * 95 + (Math.random() - 0.5) * 30, y: i % 2 ? H - 22 : 22, d: i * 0.06 });
    }
  }
  gspEchoes.push({ t: 0, spots: spots });
  playGspChant();
  crowdReact(0.35);
}

// ---------------------------------------------------------------- Montreal crowd

// Each fan's Montreal version: same face and seat, a red, white or blue
// shirt, and maybe a Quebec or Canada flag, a phone or a sign. Its own random
// stream, so the regular crowd stays as it was (like the Brazil crowd).
function buildMontrealCrowd() {
  if (gspCrowdBuilt || typeof stadiumFans === "undefined") return;
  gspCrowdBuilt = true;
  var seed = 47, signs = 0;
  function rand() { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }
  stadiumFans.forEach(function (f) {
    var r = rand(), m = Object.create(f);
    m.shirt = r < 0.45 ? MTL.red : r < 0.72 ? MTL.white : MTL.blue;
    m.style = rand() < 0.45 ? "jersey" : "tee";
    m.team = null; m.shirtless = false; m.flag = false;
    m.cap = rand() < 0.1 ? (rand() < 0.5 ? MTL.red : MTL.blue) : null;
    m.sign = f.sign ? MTL_SIGNS[signs++ % MTL_SIGNS.length] : null;
    m.mtlFlag = !m.sign && rand() < 0.2 ? (rand() < 0.5 ? "qc" : "ca") : null;
    m.phone = !m.sign && !m.mtlFlag && rand() < 0.25;
    f.mtl = m;
  });
}

// A fan's flag, over the stands (stadium.js).
function drawMontrealFlag(f, t) {
  if (f.mtlFlag === "qc") drawQuebecFlag(f.x + f.r * 0.3, f.y - f.r * 1.55, f.r * 1.3, t, f.phase);
  else drawCanadaFlag(f.x + f.r * 0.3, f.y - f.r * 1.55, f.r * 1.4, t, f.phase);
}

function flagPole(w, h) {
  ctx.strokeStyle = "#5b4630"; ctx.lineWidth = Math.max(2, w * 0.06);
  ctx.beginPath(); ctx.moveTo(-w * 0.5, -h * 0.5); ctx.lineTo(-w * 0.5, h * 1.3); ctx.stroke();
}

// Quebec's flag (the Fleurdelisé): a white cross on blue, a fleur-de-lis in
// each corner, centred at (x, y), waving.
function drawQuebecFlag(x, y, w, t, phase) {
  var h = w * 0.66, wave = Math.sin(t * 9 + phase) * w * 0.06;
  ctx.save();
  ctx.translate(x, y);
  flagPole(w, h);
  ctx.transform(1, wave / w, 0, 1, 0, 0);
  ctx.fillStyle = MTL.blue; ctx.fillRect(-w * 0.5, -h * 0.5, w, h);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(-w * 0.07, -h * 0.5, w * 0.14, h);
  ctx.fillRect(-w * 0.5, -h * 0.1, w, h * 0.2);
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (q) { drawFleurDeLis(q[0] * w * 0.27, q[1] * h * 0.29, h * 0.15, "#ffffff"); });
  ctx.strokeStyle = STAGE_INK; ctx.lineWidth = 1.5; ctx.strokeRect(-w * 0.5, -h * 0.5, w, h);
  ctx.restore();
}

// A fleur-de-lis `s` tall either side of its middle: the centre petal, the
// two side petals curling out and the band across them.
function drawFleurDeLis(x, y, s, col) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = col;
  ctx.beginPath();
  ctx.moveTo(0, -s);
  ctx.quadraticCurveTo(s * 0.42, -s * 0.45, s * 0.12, s * 0.15);
  ctx.lineTo(-s * 0.12, s * 0.15);
  ctx.quadraticCurveTo(-s * 0.42, -s * 0.45, 0, -s);
  ctx.fill();
  [-1, 1].forEach(function (k) {
    ctx.beginPath();
    ctx.moveTo(k * s * 0.1, s * 0.12);
    ctx.bezierCurveTo(k * s * 0.35, -s * 0.55, k * s * 1.0, -s * 0.4, k * s * 0.82, s * 0.05);
    ctx.quadraticCurveTo(k * s * 0.7, -s * 0.15, k * s * 0.42, s * 0.2);
    ctx.closePath(); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(k * s * 0.08, s * 0.42); ctx.quadraticCurveTo(k * s * 0.45, s * 0.5, k * s * 0.5, s * 0.85);
    ctx.quadraticCurveTo(k * s * 0.28, s * 0.62, k * s * 0.05, s * 0.6); ctx.closePath(); ctx.fill();
  });
  ctx.fillRect(-s * 0.48, s * 0.18, s * 0.96, s * 0.2);
  ctx.beginPath(); ctx.moveTo(-s * 0.1, s * 0.38); ctx.lineTo(s * 0.1, s * 0.38); ctx.lineTo(0, s * 0.95); ctx.closePath(); ctx.fill();
  ctx.restore();
}

// The maple leaf, `s` from its middle to its tip.
function drawMapleLeaf(c, x, y, s, col) {
  c.save();
  c.translate(x, y);
  c.fillStyle = col;
  c.beginPath();
  for (var i = 0; i < MAPLE_LEAF.length; i += 2) {
    if (i) c.lineTo(MAPLE_LEAF[i] * s, MAPLE_LEAF[i + 1] * s); else c.moveTo(MAPLE_LEAF[i] * s, MAPLE_LEAF[i + 1] * s);
  }
  c.closePath(); c.fill();
  c.restore();
}

// Canada's flag: red, white with a red maple leaf, red.
function drawCanadaFlag(x, y, w, t, phase) {
  var h = w * 0.55, wave = Math.sin(t * 9 + phase) * w * 0.06;
  ctx.save();
  ctx.translate(x, y);
  flagPole(w, h);
  ctx.transform(1, wave / w, 0, 1, 0, 0);
  ctx.fillStyle = "#ffffff"; ctx.fillRect(-w * 0.5, -h * 0.5, w, h);
  ctx.fillStyle = MTL.red;
  ctx.fillRect(-w * 0.5, -h * 0.5, w * 0.25, h); ctx.fillRect(w * 0.25, -h * 0.5, w * 0.25, h);
  drawMapleLeaf(ctx, 0, 0, h * 0.36, MTL.red);
  ctx.strokeStyle = STAGE_INK; ctx.lineWidth = 1.5; ctx.strokeRect(-w * 0.5, -h * 0.5, w, h);
  ctx.restore();
}

// The walkway in Montreal blue with GSP on it (stadium.js, after the walkway
// is laid down, before the corner pads and the cage).
function drawMontrealWalkway(g) {
  var IN = ST.IN;
  g.fillStyle = MTL.navy;
  g.fillRect(IN.x0, IN.y0, IN.x1 - IN.x0, IN.y1 - IN.y0);
  g.fillStyle = "#ffffff"; g.textAlign = "center"; g.textBaseline = "middle";
  [IN.y0 + ST.APRON / 2 + 1, IN.y1 - ST.APRON / 2 + 1].forEach(function (ay) {
    for (var k = -1; k <= 1; k++) {
      g.globalAlpha = k === 0 ? 1 : 0.6;
      g.font = "900 " + (k === 0 ? 30 : 21) + "px Impact, 'Arial Black', sans-serif";
      g.fillText(k === 0 ? "GSP" : "MONTRÉAL", STAGE_W / 2 + k * 290, ay);
    }
    g.globalAlpha = 1;
  });
}

// The mat: still light so the fighters read, a faded maple leaf in the
// middle, a blue octagon line and MONTRÉAL in the corners (stadium.js).
function drawMontrealMat(g) {
  g.fillStyle = "#f4f2ec"; g.fillRect(0, 0, W, H);
  var cx = W / 2, cy = H / 2, R = W * 0.47;
  g.globalAlpha = 0.18;
  g.fillStyle = MTL.red; g.fillRect(cx - W * 0.4, cy - H * 0.2, W * 0.13, H * 0.4); g.fillRect(cx + W * 0.27, cy - H * 0.2, W * 0.13, H * 0.4);
  drawMapleLeaf(g, cx, cy, H * 0.15, MTL.red);
  g.globalAlpha = 0.55; g.strokeStyle = MTL.blue; g.lineWidth = 4;
  g.beginPath();
  for (var k = 0; k <= 8; k++) { var an = Math.PI / 8 + k * Math.PI / 4; g[k ? "lineTo" : "moveTo"](cx + Math.cos(an) * R, cy + Math.sin(an) * R); }
  g.stroke();
  g.globalAlpha = 0.3; g.fillStyle = MTL.blue;
  g.font = "900 17px Impact, 'Arial Black', sans-serif"; g.textAlign = "center"; g.textBaseline = "middle";
  [[1, 1], [-1, 1], [1, -1], [-1, -1]].forEach(function (d) {
    g.save(); g.translate(cx + d[0] * W * 0.385, cy + d[1] * H * 0.385); g.rotate(-d[0] * d[1] * Math.PI / 4);
    g.fillText("MONTRÉAL", 0, 0); g.restore();
  });
  g.globalAlpha = 1;
}

// The test arena gets a faded Canada flag on the floor (draw.js).
function drawGspFloor() {
  if (!montrealMode || brazilMode) return;
  ctx.save();
  ctx.globalAlpha = 0.16;
  ctx.fillStyle = MTL.red;
  ctx.fillRect(0, 0, W * 0.22, H); ctx.fillRect(W * 0.78, 0, W * 0.22, H);
  drawMapleLeaf(ctx, W / 2, H / 2, H * 0.2, MTL.red);
  ctx.restore();
}

// ---------------------------------------------------------------- slips and "not impressed"

// From hurt (match.js): slipping a strike. True if it's slipped.
function gspDodge(b, source, attackerId) {
  var cfg = gspCfg(b), dc = cfg && cfg.dodge;
  if (gspShieldSpecial(b, source, attackerId)) return true; // weapon swings blocked, beams deflected (gsp-shield.js)
  if (!dc || !b.alive || attackerId == null || attackerId === b.id || GSP_NO_SLIP[source]) return false;
  if (b.grappled || b.grapple || b.slam || b.sprawl || b.sprawled || subLocked(b) || b.igbb || b.koOut || b.shocked || b.dazed ||
      b.dizzy || b.shelled || b.gspStun > 0 || b.gspTaunt || (b.gspSp && b.gspSp.phase === "leap")) return false;
  var proj = !!PROJECTILE_SOURCES[source];
  if (Math.random() * 100 >= (proj ? dc.projChance : dc.chance)) return gspShieldBlock(b, source, attackerId); // not slipped: the shield might take it (gsp-shield.js)
  b.weaveAnim = { t: 0, dur: 0.26, sign: Math.random() < 0.5 ? -1 : 1 };
  floater(b.x, b.y - b.r - 8, "SLIP", "dodge");
  b.justDodged = true;
  playSlip();
  b.gspRun++;
  var ni = cfg.notImpressed;
  if (ni) {
    b.gspRunT = ni.window;
    if (b.gspRun >= ni.after && b.gspTauntCd <= 0 && b.gspTauntN < ni.max) b.gspTauntWant = true;
  }
  gspCrowd(b, cfg.crowd && cfg.crowd.dodge);
  return true;
}

function startNotImpressed(self, cfg) {
  var ni = cfg.notImpressed;
  self.gspTauntWant = false; self.gspRun = 0; self.gspTauntN++; self.gspTauntCd = ni.cooldown;
  clearActions(self);
  self.gspTaunt = { t: 0, dur: ni.handsDown };
  say(self, GSP_LINE);
  gspCrowd(self, cfg.crowd && cfg.crowd.taunt);
  crowdReact(0.6);
}
function runNotImpressed(self, dt) {
  var m = self.gspTaunt;
  m.t += dt;
  var damp = Math.exp(-8 * dt); self.vx *= damp; self.vy *= damp; // stands there, hands down
  if (m.t >= m.dur) { self.gspTaunt = null; setSpeed(self, self.baseSpeed || SPEED); return false; }
  return true;
}

// ---------------------------------------------------------------- double leg

// From attemptGrab (grapple-duel.js), after the shot is called: his elite
// double leg goes straight through `through`% of the time.
function gspDoubleLeg(attacker, target) {
  var dl = gspCfg(attacker) && gspCfg(attacker).doubleLeg;
  if (!dl || !target.alive || target.cheater || target.fenceGrab) return false; // (a cheating Gane still grabs the cage, cheater.js)
  if (Math.random() * 100 >= dl.through) return false;
  crowdReact(0.3);
  beginGrapple(attacker, target);
  return true;
}

// ---------------------------------------------------------------- his turn

function gspInterrupted(b) {
  return !b.alive || b.grappled || b.grapple || b.slam || b.sprawl || b.sprawled || subLocked(b) || b.koOut || b.shocked ||
    b.dazed || b.dizzy || b.shelled || b.checkStun > 0 || (b.igbb && !gspDiveOn(b));
}

// From the abilities loop, before the special: the Superman punch, the
// taunt, and lying dazed after a missed dive. True while one's running.
function updateGsp(self, other, dt) {
  var cfg = gspCfg(self);
  if (!cfg) return false;
  if (self.gspStun > 0) {
    self.gspStun -= dt;
    self.vx = 0; self.vy = 0;
    if (self.gspStun <= 0 || gspInterrupted(self)) { self.gspStun = 0; if (self.alive) setSpeed(self, self.baseSpeed || SPEED); return false; }
    return true;
  }
  if (self.gspBrace) return runGspBrace(self, other, dt); // deflecting a beam (gsp-shield.js)
  if (self.gspSp) {
    if (gspInterrupted(self) || other.igbb || over) { endSupermanPunch(self); return false; }
    return runSupermanPunch(self, other, cfg.superman, dt);
  }
  if (self.gspTaunt) {
    if (gspInterrupted(self) || over) { self.gspTaunt = null; return false; }
    return runNotImpressed(self, dt);
  }
  if (self.gspThrow) return updateGspShield(self, other, cfg, dt, false); // mid-throw (gsp-shield.js)
  if (!started || over || self.igbb || !other.alive) return false;
  var sp = self.char.special, full = self.char.hasSpecial && sp.move === "supermandive" && self.specialT >= sp.chargeTime;
  if (self.gspTauntWant && cfg.notImpressed && self.gspRun < cfg.notImpressed.after) self.gspTauntWant = false; // got hit since
  if (self.gspTauntWant && !full && canStartIgbb(self, other) && canSay(self)) { startNotImpressed(self, cfg); return true; }
  if (updateGspShield(self, other, cfg, dt, full)) return true; // throwing the Maple Shield (gsp-shield.js)
  var sc = cfg.superman;
  if (!sc) return false;
  self.gspSpT -= dt;
  if (self.gspSpT > 0 || full || !canStartIgbb(self, other) || swordDuelActive()) return false;
  var dx = other.x - self.x, dy = other.y - self.y, gap = Math.sqrt(dx * dx + dy * dy) - self.r - other.r;
  if (gap < sc.minGap || gap > sc.maxGap) return false;
  startSupermanPunch(self, other, sc);
  return true;
}

// ---------------------------------------------------------------- Superman punch

function startSupermanPunch(self, other, sc) {
  clearActions(self);
  gspGiOff(self);
  self.vx = 0; self.vy = 0;
  self.gspSp = { phase: "load", t: 0, aim: Math.atan2(other.y - self.y, other.x - self.x), hit: false, chant: self.gspChant };
  floater(self.x, self.y - self.r - 30, "SUPERMAN PUNCH!", "crit");
  playSupermanLoad();
}

function runSupermanPunch(self, other, sc, dt) {
  var m = self.gspSp;
  m.t += dt;
  var dx = other.x - self.x, dy = other.y - self.y, d = Math.sqrt(dx * dx + dy * dy) || 1, want = Math.atan2(dy, dx);
  if (m.phase === "load") {
    self.vx = 0; self.vy = 0;
    m.aim = gspTurn(m.aim, want, dt * 10);
    if (m.t >= sc.load) {
      m.phase = "leap"; m.t = 0;
      m.dur = Math.max(0.16, Math.min(0.36, (d - self.r - other.r + sc.reach) / sc.speed + 0.04));
      playWhoosh();
    }
    return true;
  }
  if (m.phase === "leap") {
    m.aim = gspTurn(m.aim, want, dt * sc.turn); // leans after them a little in the air
    self.vx = Math.cos(m.aim) * sc.speed; self.vy = Math.sin(m.aim) * sc.speed;
    if (!m.hit && other.alive && !other.koOut) {
      var fx = self.x + Math.cos(m.aim) * (self.r + sc.reach * 0.75), fy = self.y + Math.sin(m.aim) * (self.r + sc.reach * 0.75);
      var fd = Math.sqrt((other.x - fx) * (other.x - fx) + (other.y - fy) * (other.y - fy));
      if (fd < other.r + 12 || d < self.r + other.r + 4) { m.hit = true; landSupermanPunch(self, other, sc, m); }
    }
    if (m.t >= m.dur || m.hit) { m.phase = "land"; m.t = 0; }
    return true;
  }
  var damp = Math.exp(-12 * dt); self.vx *= damp; self.vy *= damp;
  if (m.t >= GSP_LAND) { endSupermanPunch(self); return false; }
  return true;
}

function landSupermanPunch(self, other, sc, m) {
  var ux = Math.cos(m.aim), uy = Math.sin(m.aim);
  var chant = self.gspChant;
  var dealt = hurt(other, chant ? sc.chantDamage : sc.damage, "punch", self.id);
  if (dealt > 0) {
    var kb = chant ? sc.chantKnockback : sc.knockback;
    if (!other.justDodged && other.alive && !other.grappled && !other.grapple && !other.slam && !subLocked(other) && !other.igbb) { other.vx += ux * kb; other.vy += uy * kb; other.knockFly = 0.3; }
    var cx = other.x - ux * other.r, cy = other.y - uy * other.r;
    other.squash = { t: 0.16, max: 0.16, nx: -ux, ny: -uy };
    impacts.push({ x: cx, y: cy, nx: -ux, ny: -uy, life: 0.45, max: 0.45, color: "#d6202a" });
    igbbSparks(cx, cy, -ux, -uy, "#d6202a", chant ? 18 : 10, chant ? 480 : 360);
    hitStop = Math.max(hitStop, chant ? 0.1 : 0.06);
    if (!reduceMotion) shake = Math.max(shake, chant ? 18 : 12);
    playSupermanHit(dealt);
    crowdReact(chant ? 0.8 : 0.5);
    gspCrowd(self, gspCfg(self).crowd && gspCfg(self).crowd.superman);
  }
  checkEnd();
}

function endSupermanPunch(self) {
  var sc = gspCfg(self).superman;
  self.gspSp = null;
  self.gspSpT = gspRand(self.gspChant && sc.chantEvery ? sc.chantEvery : sc.every);
  if (self.alive && inOrdinaryMovement(self)) setSpeed(self, self.baseSpeed || SPEED);
}

// ---------------------------------------------------------------- Superman Dive

// From updateSpecial (special.js) for special.move "supermandive".
function updateSupermanDive(self, other, dt) {
  var sp = self.char.special, m = self.igbb;
  if (!m) {
    if (self.specialT < sp.chargeTime || !canStartIgbb(self, other) || gspBusy(self) || swordDuelActive()) return false;
    clearActions(self);
    gspGiOff(self);
    m = self.igbb = { move: "supermandive", phase: "rise", t: 0, aim: Math.atan2(other.y - self.y, other.x - self.x), locked: false };
    floater(self.x, self.y - self.r - 30, "SUPERMAN DIVE!", "crit");
    playDiveRise();
    crowdReact(1);
  }
  if (m.move !== "supermandive") return false;
  if (self.sprawl || self.sprawled || self.grappled || self.grapple || subLocked(self)) {
    // Caught on the way up (a shot on him he sprawled, say): the scramble
    // plays out instead. Before he's off the ground the bar stays full.
    if (m.phase === "rise" || m.phase === "aim") { self.igbb = null; self.koPunch = null; } else endDive(self);
    return false;
  }
  m.t += dt;
  if (over && m.phase !== "land") { endDive(self); return false; }
  var dx = other.x - self.x, dy = other.y - self.y, want = Math.atan2(dy, dx);
  if (m.phase === "rise" || m.phase === "aim") {
    self.vx = 0; self.vy = 0;
    if (m.phase === "rise" || m.t < sp.aim - sp.lock) m.aim = gspTurn(m.aim, want, dt * 6);
    if (m.phase === "rise" && m.t >= sp.rise) { m.phase = "aim"; m.t = 0; }
    else if (m.phase === "aim" && !m.locked && m.t >= sp.aim - sp.lock) { m.locked = true; playDiveLock(); }
    if (m.phase === "aim" && m.t >= sp.aim) { m.phase = "fly"; m.t = 0; m.skip = 0; playDiveFly(); }
    return true;
  }
  if (m.phase === "fly") return flyDive(self, other, m, sp, dt);
  if (m.phase === "pin") {
    // Riding them round the cage, both arms out, until the pinball's done.
    if (!other.alive || !other.slam) { m.phase = "land"; m.t = 0; m.lx = self.x; m.ly = self.y; return true; }
    var vl = Math.sqrt(other.vx * other.vx + other.vy * other.vy) || 1, k = Math.min(1, dt * 16);
    m.dx += (other.vx / vl - m.dx) * k; m.dy += (other.vy / vl - m.dy) * k;
    var dl = Math.sqrt(m.dx * m.dx + m.dy * m.dy) || 1, gap = (self.r + other.r) * 0.8; // (far enough back that they show)
    self.x = other.x - m.dx / dl * gap; self.y = other.y - m.dy / dl * gap;
    m.aim = Math.atan2(m.dy, m.dx);
    if (!reduceMotion && Math.random() < 0.5) particles.push({ x: self.x, y: self.y, vx: -m.dx * 120, vy: -m.dy * 120, life: 0.25, max: 0.25, size: self.r * 0.45, color: "#d6202a" });
    return true;
  }
  if (m.phase === "land") {
    // Pops up off them and throws both arms up while the crowd chants.
    self.vx = 0; self.vy = 0;
    if (m.t < 0.2 && other.alive) {
      var ax = self.x - other.x, ay = self.y - other.y, al = Math.sqrt(ax * ax + ay * ay) || 1, step = 260 * dt;
      if (al < self.r + other.r + 6) { self.x += ax / al * step; self.y += ay / al * step; }
    }
    if (m.t >= GSP_DIVE_LAND) { endDive(self); return false; }
    return true;
  }
  if (m.phase === "crash") {
    self.vx = 0; self.vy = 0;
    if (m.t >= GSP_CRASH) { endDive(self); self.gspStun = sp.crashTime; }
    return true;
  }
  return false;
}

// Flying down the lane in small steps (so he can't skip through them).
function flyDive(self, other, m, sp, dt) {
  var ux = Math.cos(m.aim), uy = Math.sin(m.aim), dist = sp.speed * dt, n = Math.max(1, Math.ceil(dist / 8)), h = dist / n;
  self.vx = 0; self.vy = 0;
  m.skip = Math.max(0, m.skip - dt);
  for (var i = 0; i < n; i++) {
    self.x += ux * h; self.y += uy * h;
    var nx = 0, ny = 0;
    if (self.x < self.r) { self.x = self.r; nx = 1; } else if (self.x > W - self.r) { self.x = W - self.r; nx = -1; }
    if (self.y < self.r) { self.y = self.r; ny = 1; } else if (self.y > H - self.r) { self.y = H - self.r; ny = -1; }
    if (nx || ny) { crashDive(self, m, nx, ny); return true; }
    var ox = other.x - self.x, oy = other.y - self.y;
    // (A little before they touch, so a Grappler can't grab him out of the air first.)
    if (m.skip <= 0 && other.alive && !other.koOut && ox * ox + oy * oy < (self.r + other.r + 12) * (self.r + other.r + 12)) {
      if (pinDive(self, other, m, sp, ux, uy)) return true;
      m.skip = 0.3; // they got out of it (teleported, or untouchable): flies on past
    }
  }
  if (!reduceMotion) {
    particles.push({ x: self.x - ux * self.r, y: self.y - uy * self.r, vx: -ux * 200, vy: -uy * 200, life: 0.3, max: 0.3, size: self.r * 0.5, color: "#d6202a" });
    particles.push({ x: self.x + (Math.random() - 0.5) * self.r * 2, y: self.y + (Math.random() - 0.5) * self.r * 2, vx: -ux * 520, vy: -uy * 520, life: 0.16, max: 0.16, size: 2.5, color: theme.ink });
  }
  if (m.t > 1.4) crashDive(self, m, -ux, -uy); // (never flies forever)
  return true;
}

// Caught them: the hit, then he pins them and drives them round the cage.
function pinDive(self, other, m, sp, ux, uy) {
  var dealt = hurt(other, sp.damage, "igbb", self.id);
  if (other.justDodged) return false;
  var cx = other.x - ux * other.r, cy = other.y - uy * other.r;
  impacts.push({ x: cx, y: cy, nx: -ux, ny: -uy, life: 0.6, max: 0.6, color: "#d6202a" });
  impacts.push({ x: cx, y: cy, nx: -ux, ny: -uy, life: 0.8, max: 0.8, color: theme.hit });
  igbbSparks(cx, cy, -ux, -uy, "#d6202a", 26, 560);
  other.flash = 0.16;
  hitStop = Math.max(hitStop, 0.16);
  if (!reduceMotion) shake = Math.max(shake, 24);
  playDivePin(dealt);
  crowdReact(1);
  checkEnd();
  if (!other.alive) { m.phase = "land"; m.t = 0; return true; }
  floater(other.x, other.y - other.r - 30, "PINNED!", "crit");
  recordTakedown(self.id);
  clearActions(other);
  beginWallSlam(other, ux, uy, { wallSlams: sp.walls, slamDamage: sp.wallDamage, knockback: sp.pinSpeed });
  other.slam.gspPin = self.id;
  m.phase = "pin"; m.t = 0; m.dx = ux; m.dy = uy;
  return true;
}

// Missed: straight into the cage.
function crashDive(self, m, nx, ny) {
  m.phase = "crash"; m.t = 0;
  self.squash = { t: 0.3, max: 0.3, nx: nx, ny: ny };
  var cx = self.x - nx * self.r, cy = self.y - ny * self.r;
  impacts.push({ x: cx, y: cy, nx: nx, ny: ny, life: 0.5, max: 0.5, color: theme.wall });
  floater(self.x, self.y - self.r - 30, "THUD!", "note");
  hitStop = Math.max(hitStop, 0.1);
  if (!reduceMotion) shake = Math.max(shake, 18);
  playDiveCrash();
  crowdReact(0.6);
}

function endDive(self) {
  var cfg = gspCfg(self);
  self.igbb = null; self.koPunch = null;
  self.specialT = 0;
  self.gspChantHold = cfg && cfg.crowd ? cfg.crowd.hold || 0 : 0; // the crowd chants on a moment
  if (self.alive) setSpeed(self, self.baseSpeed || SPEED);
}

// ---------------------------------------------------------------- every frame

// From update(): the walkout, the chant, the slip run, flying cloth.
function tickGsp(dt) {
  gspClock += dt;
  if (!balls) return;
  balls.forEach(function (b) {
    var cfg = gspCfg(b);
    if (!cfg) return;
    tickGspShield(b, dt); // the Maple Shield in the air, the block (gsp-shield.js)
    if (b.gspGi && started) { b.gspGiT += dt; if (b.gspGiT >= cfg.walkout.keep || over) gspGiOff(b); }
    var ni = cfg.notImpressed;
    if (ni && ni.hitCost && b.hp < b.gspHp - 0.01) b.gspRun = Math.max(0, b.gspRun - ni.hitCost); // a hit can break up the run
    b.gspHp = b.hp;
    if (b.gspRunT > 0) { b.gspRunT -= dt; if (b.gspRunT <= 0) b.gspRun = 0; }
    if (b.gspTauntCd > 0) b.gspTauntCd -= dt;
    if (b.gspChantHold > 0 && !b.igbb) b.gspChantHold -= dt;
    var g = b.grapple; // a takedown landing: the crowd loves it
    if (g && g.dealt && !g.gspCounted) { g.gspCounted = true; gspCrowd(b, cfg.crowd && cfg.crowd.takedown); }
    var want = gspChantWanted(b, cfg);
    if (want !== !!b.gspChant) gspSetChant(b, want, cfg);
  });
  if (montrealMode && started) { // (and on after a GSP win)
    gspBeatT -= dt;
    if (gspBeatT <= 0) {
      var c = null;
      balls.forEach(function (b) { if (b.gspChant) c = gspCfg(b); });
      gspBeatT = c && c.crowd.beat || 1.7;
      gspChantBeat();
    }
  }
  gspEchoes.forEach(function (e) { e.t += dt; });
  gspEchoes = gspEchoes.filter(function (e) { return e.t < GSP_ECHO + 0.4; });
  gspCloth.forEach(function (p) { p.t += dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= Math.exp(-1.2 * dt); p.vy = p.vy * Math.exp(-1.2 * dt) + 260 * dt; p.rot += p.spin * dt; });
  gspCloth = gspCloth.filter(function (p) { return p.t < p.dur; });
}

// ---------------------------------------------------------------- drawing

// How high he is off the mat right now: { dy, s } (lifted and scaled up).
function gspLift(b) {
  var m = b.gspSp, d = b.igbb, sp = b.char.special;
  if (m && m.phase === "leap") { var L = Math.sin(Math.PI * Math.min(1, m.t / m.dur)); return { dy: -L * b.r * 0.3, s: 1 + 0.16 * L, air: L }; }
  if (gspDiveOn(b)) {
    if (d.phase === "rise") { var e = easeOut(d.t / sp.rise); return { dy: -e * b.r * 0.45, s: 1 + 0.28 * e, air: e }; }
    if (d.phase === "aim") return { dy: -b.r * 0.45 + Math.sin(gspClock * 9) * b.r * 0.04, s: 1.28, air: 1 };
    if (d.phase === "fly") return { dy: -b.r * 0.3, s: 1.25, air: 0.85 };
    if (d.phase === "pin") return { dy: -b.r * 0.12, s: 1.12, air: 0.4 };
    if (d.phase === "land") { var k = Math.min(1, d.t / 0.25); return { dy: -b.r * 0.12 * (1 - k), s: 1.12 - 0.12 * k, air: 0.4 * (1 - k) }; }
  }
  return { dy: 0, s: 1, air: 0 };
}

// From draw(), with the other body poses: crouched to load the Superman
// punch, up in the air for the leap and the dive.
function applyGspPose(b) {
  if (!gspCfg(b)) return;
  var m = b.gspSp;
  if (m && m.phase === "load") {
    var c = Math.sin(Math.PI * Math.min(1, m.t / 0.34)) * 0.5 + 0.5 * Math.min(1, m.t / 0.1), ay = b.y + b.r;
    ctx.translate(b.x, ay); ctx.scale(1 + 0.08 * c, 1 - 0.12 * c); ctx.translate(-b.x, -ay);
    return;
  }
  var l = gspLift(b);
  if (!l.air) return;
  ctx.translate(b.x, b.y + l.dy); ctx.scale(l.s, l.s); ctx.translate(-b.x, -b.y);
}

// Under the fighters: his shadow while he's in the air, and the dive's red lane.
function drawGspUnder() {
  balls.forEach(function (b) {
    if (!b.alive || !gspCfg(b)) return;
    var l = gspLift(b);
    if (l.air > 0.05) {
      ctx.save();
      ctx.globalAlpha = 0.22 * Math.min(1, l.air * 1.5);
      ctx.fillStyle = "#000000";
      ctx.beginPath(); ctx.ellipse(b.x, b.y + b.r * 0.55, b.r * (1 - 0.15 * l.air), b.r * 0.32, 0, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }
    var m = b.igbb;
    if (!gspDiveOn(b) || (m.phase !== "rise" && m.phase !== "aim")) return;
    // The lane he'll fly, out to the cage.
    var ux = Math.cos(m.aim), uy = Math.sin(m.aim), len = 2000;
    if (ux > 0.001) len = Math.min(len, (W - b.r - b.x) / ux); else if (ux < -0.001) len = Math.min(len, (b.r - b.x) / ux);
    if (uy > 0.001) len = Math.min(len, (H - b.r - b.y) / uy); else if (uy < -0.001) len = Math.min(len, (b.r - b.y) / uy);
    len = Math.max(0, len) + b.r;
    var on = m.phase === "aim" ? 1 : Math.min(1, m.t / b.char.special.rise);
    var flash = m.locked ? 0.55 + 0.45 * Math.sin(gspClock * 40) : 1, half = b.r * 0.95;
    ctx.save();
    ctx.translate(b.x, b.y); ctx.rotate(m.aim);
    ctx.globalAlpha = 0.24 * on * flash; ctx.fillStyle = "#e0221b";
    ctx.fillRect(0, -half, len, half * 2);
    ctx.globalAlpha = 0.9 * on * flash; ctx.strokeStyle = "#e0221b"; ctx.lineWidth = m.locked ? 5 : 3.5;
    ctx.setLineDash([12, 9]); ctx.lineDashOffset = -gspClock * 120;
    ctx.beginPath(); ctx.moveTo(b.r * 0.6, -half); ctx.lineTo(len, -half); ctx.moveTo(b.r * 0.6, half); ctx.lineTo(len, half); ctx.stroke();
    ctx.setLineDash([]);
    ctx.lineWidth = 4; ctx.lineJoin = "round"; ctx.lineCap = "round";
    for (var x = b.r * 1.4 + (gspClock * 160) % 46; x < len - 10; x += 46) { // chevrons running down it
      ctx.beginPath(); ctx.moveTo(x - 10, -half * 0.45); ctx.lineTo(x + 6, 0); ctx.lineTo(x - 10, half * 0.45); ctx.stroke();
    }
    ctx.restore();
  });
}

// Behind him (drawn before the body): the red cape, streaming back the way
// he came, while he's in the air.
function drawGspBehind(b) {
  if (!b.alive || !gspCfg(b)) return;
  drawGspShieldBack(b); // the Maple Shield on his back (gsp-shield.js)
  var m = b.gspSp, d = b.igbb, k = 0, ang = 0, flap = 1;
  if (m && (m.phase === "leap" || m.phase === "land")) {
    k = m.phase === "leap" ? Math.min(1, Math.max(0, (m.t / m.dur - 0.12) / 0.35)) : Math.max(0, 1 - m.t / GSP_LAND);
    ang = m.aim;
  } else if (gspDiveOn(b) && d.phase !== "crash") {
    k = d.phase === "rise" ? Math.min(1, d.t / b.char.special.rise) : d.phase === "land" ? Math.max(0, 1 - d.t / 0.4) : 1;
    ang = d.phase === "rise" || d.phase === "aim" || d.phase === "land" ? -Math.PI / 2 - 0.0001 : d.aim; // hanging down off his shoulders until he flies
    if (d.phase === "rise" || d.phase === "aim" || d.phase === "land") flap = 0.4;
  }
  if (k <= 0.01) return;
  var l = gspLift(b);
  drawGspCape(b.x, b.y + l.dy, b.r * l.s, ang, k, flap);
}

// A red cape tied at the shoulders, streaming back from `ang` (the way he's
// going), `k` (0..1) how far it's out.
function drawGspCape(x, y, r, ang, k, flap) {
  var ux = Math.cos(ang), uy = Math.sin(ang), px = -uy, py = ux;
  var L = r * (0.5 + 1.35 * k), sh = r * 0.6, tail = r * (0.7 + 0.45 * k), t = gspClock * 24;
  var wv = function (s) { return Math.sin(t + s) * r * 0.13 * k * flap; };
  var bx = x - ux * r * 0.1, by = y - uy * r * 0.1; // the shoulders, just behind his middle
  ctx.save();
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(bx + px * sh, by + py * sh);
  ctx.quadraticCurveTo(bx + px * tail - ux * L * 0.5 + px * wv(0), by + py * tail - uy * L * 0.5 + py * wv(0), bx + px * tail - ux * L, by + py * tail - uy * L);
  for (var i = 1; i <= 4; i++) { // the hem, rippling
    var s = 1 - i / 2, q = tail * s, hx = bx + px * q - ux * (L + wv(i * 1.3)), hy = by + py * q - uy * (L + wv(i * 1.3));
    var mx = bx + px * (tail * (1 - (i - 0.5) / 2)) - ux * (L - r * 0.12 * k), my = by + py * (tail * (1 - (i - 0.5) / 2)) - uy * (L - r * 0.12 * k);
    ctx.quadraticCurveTo(mx, my, hx, hy);
  }
  ctx.quadraticCurveTo(bx - px * tail - ux * L * 0.5 - px * wv(2), by - py * tail - uy * L * 0.5 - py * wv(2), bx - px * sh, by - py * sh);
  ctx.closePath();
  var g = ctx.createLinearGradient(bx, by, bx - ux * L, by - uy * L);
  g.addColorStop(0, "#b3161e"); g.addColorStop(1, "#e3262f");
  ctx.fillStyle = g; ctx.fill();
  ctx.strokeStyle = theme.wall; ctx.lineWidth = 2.5; ctx.stroke();
  ctx.strokeStyle = "rgba(90,0,10,0.45)"; ctx.lineWidth = 2; // folds
  [-0.35, 0.35].forEach(function (f) {
    ctx.beginPath(); ctx.moveTo(bx + px * sh * f * 1.4 - ux * r * 0.5, by + py * sh * f * 1.4 - uy * r * 0.5);
    ctx.quadraticCurveTo(bx + px * tail * f + px * wv(f * 4) - ux * L * 0.6, by + py * tail * f + py * wv(f * 4) - uy * L * 0.6, bx + px * tail * f * 1.2 - ux * L * 0.9, by + py * tail * f * 1.2 - uy * L * 0.9);
    ctx.stroke();
  });
  ctx.restore();
}

// After his body: his arms for the Superman punch and dive, hands down for
// "not impressed", stars after a crash.
function drawGsp(b) {
  if (!b.alive || !gspCfg(b)) return;
  var size = b.char.punch.size || 14, o = balls[1 - b.id];
  var m = b.gspSp, d = b.igbb, l = gspLift(b), cx = b.x, cy = b.y + l.dy, r = b.r * l.s;
  ctx.save();
  drawGspShieldArms(b); // throwing the Maple Shield, or blocking with it (gsp-shield.js)
  if (m) {
    var ux = Math.cos(m.aim), uy = Math.sin(m.aim), px = -uy, py = ux;
    if (m.phase === "load") {
      // Rear hand cocked back by the ear, lead hand up: the tell.
      var c = Math.min(1, m.t / 0.15), tr = Math.sin(gspClock * 70) * 1.2;
      gspArm(b, cx + px * r * 0.45, cy + py * r * 0.45, cx + ux * r * 0.85 + px * r * 0.35, cy + uy * r * 0.85 + py * r * 0.35, size, m.aim);
      gspArm(b, cx - px * r * 0.45, cy - py * r * 0.45, cx - ux * r * 0.35 * c - px * r * (0.6 + 0.3 * c) + tr, cy - uy * r * 0.35 * c - py * r * (0.6 + 0.3 * c) - r * 0.25 * c, size * 1.1, m.aim);
    } else {
      // One fist out in front, the other arm back along his side.
      var reach = gspCfg(b).superman.reach, ext = m.phase === "leap" ? Math.min(1, m.t / (m.dur * 0.5)) : Math.max(0, 1 - m.t / GSP_LAND);
      gspArm(b, cx + px * r * 0.3, cy + py * r * 0.3, cx + ux * (r + reach * 0.75 * ext) + px * r * 0.15, cy + uy * (r + reach * 0.75 * ext) + py * r * 0.15, size * (1.05 + 0.25 * ext), m.aim);
      gspArm(b, cx - px * r * 0.5, cy - py * r * 0.5, cx - ux * r * 0.6 - px * r * 0.75, cy - uy * r * 0.6 - py * r * 0.75, size * 0.9, m.aim + Math.PI);
      if (ext > 0.5 && m.chant) { // a glow on the fist while the crowd chants
        ctx.globalAlpha = 0.35; ctx.fillStyle = "#e3262f";
        ctx.beginPath(); ctx.arc(cx + ux * (r + reach * 0.75 * ext), cy + uy * (r + reach * 0.75 * ext), size * 1.9, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 1;
      }
    }
  } else if (gspDiveOn(b)) {
    var a = d.aim;
    if (d.phase === "rise" || d.phase === "aim") a = -Math.PI / 2; // fists up to the sky while he rises
    if (d.phase === "rise" || d.phase === "aim" || d.phase === "fly" || d.phase === "pin") {
      var dux = Math.cos(a), duy = Math.sin(a), dpx = -duy, dpy = dux, reachK = d.phase === "rise" ? easeOut(d.t / b.char.special.rise) : d.phase === "pin" ? 0.45 : 1; // (pinning: fists down on them)
      [-1, 1].forEach(function (s) {
        var shx = cx + dpx * s * r * 0.5 + dux * r * 0.2, shy = cy + dpy * s * r * 0.5 + duy * r * 0.2;
        var hx = cx + dux * r * (0.9 + 0.75 * reachK) + dpx * s * r * 0.38, hy = cy + duy * r * (0.9 + 0.75 * reachK) + dpy * s * r * 0.38;
        gspArm(b, shx, shy, hx, hy, size * 1.05, a);
      });
    } else if (d.phase === "land") {
      [-1, 1].forEach(function (s) { // both arms up
        var pump = Math.max(0, Math.sin(d.t * 11 + (s > 0 ? Math.PI : 0))) * r * 0.25;
        gspArm(b, cx + s * r * 0.62, cy - r * 0.55, cx + s * r * 0.9, cy - r * 1.1 - pump, size, -Math.PI / 2);
      });
    }
  } else if (b.gspTaunt) {
    // Hands dropped down by his hips: "not impressed".
    var sw = Math.sin(gspClock * 4) * r * 0.05;
    [-1, 1].forEach(function (s) { gspArm(b, cx + s * r * 0.7, cy - r * 0.05, cx + s * r * 1.02 + sw, cy + r * 0.6, size * 0.9, Math.PI / 2); });
  }
  if (b.gspStun > 0 || (gspDiveOn(b) && d.phase === "crash")) {
    for (var i = 0; i < 3; i++) {
      var sa = gspClock * 5 + i * Math.PI * 2 / 3;
      drawStar(b.x + Math.cos(sa) * b.r * 0.75, b.y - b.r * 1.05 + Math.sin(sa) * b.r * 0.22, b.r * 0.17, "#ffd23f");
    }
  }
  ctx.restore();
}
function gspArm(b, sx, sy, hx, hy, size, ang) {
  strokeLimb(size * 0.68, armColor(b.char), function () { ctx.moveTo(sx, sy); ctx.lineTo(hx, hy); });
  drawGloveAt(hx, hy, size * 0.85, b.char, ang);
}

// Over everything in the ring: the gi and headband flying off.
function drawGspOver() {
  drawGspShields(); // the Maple Shield flying round the cage (gsp-shield.js)
  gspCloth.forEach(function (p) {
    var k = p.t / p.dur, r = p.r;
    ctx.save();
    ctx.globalAlpha = Math.max(0, Math.min(1, (1 - k) * 3));
    ctx.translate(p.x, p.y); ctx.rotate(p.rot);
    ctx.lineJoin = "round"; ctx.strokeStyle = theme.wall; ctx.lineWidth = 2.5;
    if (p.kind === "gi") {
      // The jacket flung open: body, sleeves out, the black belt.
      ctx.fillStyle = "#f6f4ee";
      ctx.beginPath();
      ctx.moveTo(-r * 0.5, -r * 0.55); ctx.lineTo(-r * 1.1, -r * 0.2); ctx.lineTo(-r * 0.95, r * 0.12); ctx.lineTo(-r * 0.5, -r * 0.05);
      ctx.lineTo(-r * 0.55, r * 0.6); ctx.lineTo(r * 0.55, r * 0.6); ctx.lineTo(r * 0.5, -r * 0.05);
      ctx.lineTo(r * 0.95, r * 0.12); ctx.lineTo(r * 1.1, -r * 0.2); ctx.lineTo(r * 0.5, -r * 0.55);
      ctx.lineTo(r * 0.12, -r * 0.55); ctx.lineTo(0, -r * 0.2); ctx.lineTo(-r * 0.12, -r * 0.55); ctx.closePath();
      ctx.fill(); ctx.stroke();
      ctx.strokeStyle = "#cfcac0"; ctx.lineWidth = r * 0.1;
      ctx.beginPath(); ctx.moveTo(-r * 0.12, -r * 0.5); ctx.lineTo(0, -r * 0.15); ctx.lineTo(r * 0.12, -r * 0.5); ctx.stroke();
      ctx.fillStyle = "#161616"; ctx.fillRect(-r * 0.56, r * 0.3, r * 1.12, r * 0.14);
      ctx.fillRect(-r * 0.1, r * 0.4, r * 0.08, r * 0.35); ctx.fillRect(r * 0.04, r * 0.4, r * 0.08, r * 0.3);
    } else {
      // The headband: a white strip with the red sun.
      ctx.fillStyle = "#f6f4ee";
      ctx.beginPath(); ctx.moveTo(-r * 0.9, -r * 0.1); ctx.quadraticCurveTo(0, -r * 0.3, r * 0.9, -r * 0.1);
      ctx.lineTo(r * 0.9, r * 0.06); ctx.quadraticCurveTo(0, -r * 0.14, -r * 0.9, r * 0.06); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = "#c8102e"; ctx.beginPath(); ctx.arc(0, -r * 0.1, r * 0.08, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  });
}

// "GSP! GSP!" bubbles over the stands in the stadium, over the edges of the
// ring in the test arena. From draw(), over the jumbotron.
function drawGspCrowd(sc, ox, oy) {
  if (!gspEchoes.length) return;
  var stadium = stadiumOn();
  ctx.save();
  if (stadium) { var px = canvas.width / STAGE_W; ctx.setTransform(px, 0, 0, px, 0, 0); } else ctx.setTransform(sc, 0, 0, sc, ox, oy);
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  gspEchoes.forEach(function (e) {
    e.spots.forEach(function (s, i) {
      var t = e.t - s.d;
      if (t < 0) return;
      var pop = Math.min(1, t / 0.12), fade = Math.max(0, Math.min(1, (GSP_ECHO - t) / 0.3)), size = stadium ? 42 : 20;
      ctx.save();
      ctx.globalAlpha = fade;
      ctx.translate(s.x, s.y - t * (stadium ? 30 : 10)); ctx.scale(0.6 + 0.4 * pop, 0.6 + 0.4 * pop); ctx.rotate(Math.sin(s.x) * 0.12);
      ctx.font = '900 ' + size + 'px "Barlow Condensed", "Arial Narrow", sans-serif';
      var w = ctx.measureText("GSP! GSP!").width + size * 0.6, h = size * 1.15;
      ctx.fillStyle = "#ffffff"; ctx.strokeStyle = i % 2 ? MTL.blue : "#16211f"; ctx.lineWidth = stadium ? 4 : 2.5;
      ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h, h * 0.4); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-w * 0.12, h / 2 - 1); ctx.lineTo(-w * 0.2, h / 2 + size * 0.4); ctx.lineTo(w * 0.02, h / 2 - 1); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = i % 2 ? MTL.blue : MTL.red; ctx.fillText("GSP! GSP!", 0, 2);
      ctx.restore();
    });
  });
  ctx.restore();
}

// ---------------------------------------------------------------- his look (fighter-art.js)

// The karate gi, over the torso and the shorts (contained layout): a white
// jacket crossed left over right with thick lapels, a black belt with its
// knot and tails, white pants.
function drawGspGi(c, r, look, ink, lw) {
  var gi = look.gi.color || "#f6f4ee", belt = look.gi.belt || "#161616", fold = "rgba(60,55,45,0.28)";
  c.save();
  c.lineJoin = "round"; c.lineCap = "round";
  // Pants
  c.fillStyle = gi; c.fillRect(-r, r * 0.3, r * 2, r * 0.75);
  c.strokeStyle = fold; c.lineWidth = lw(0.03);
  c.beginPath(); c.moveTo(0, r * 0.45); c.lineTo(0, r); c.stroke();
  [-1, 1].forEach(function (s) { c.beginPath(); c.moveTo(s * r * 0.35, r * 0.5); c.quadraticCurveTo(s * r * 0.45, r * 0.72, s * r * 0.3, r * 0.95); c.stroke(); });
  // Jacket, open in a V down to where the lapels cross
  c.fillStyle = gi;
  c.beginPath();
  c.moveTo(-r, -r * 0.27);
  c.quadraticCurveTo(-r * 0.55, -r * 0.2, -r * 0.24, -r * 0.21);
  c.lineTo(-r * 0.08, r * 0.02);
  c.lineTo(r * 0.24, -r * 0.21);
  c.quadraticCurveTo(r * 0.55, -r * 0.2, r, -r * 0.27);
  c.lineTo(r, r * 0.34); c.lineTo(-r, r * 0.34); c.closePath(); c.fill();
  // Fabric folds and the sleeve seams
  c.strokeStyle = fold; c.lineWidth = lw(0.028);
  [-1, 1].forEach(function (s) {
    c.beginPath(); c.moveTo(s * r * 0.66, -r * 0.22); c.quadraticCurveTo(s * r * 0.58, r * 0.02, s * r * 0.7, r * 0.3); c.stroke();
    c.beginPath(); c.moveTo(s * r * 0.4, r * 0.0); c.quadraticCurveTo(s * r * 0.48, r * 0.14, s * r * 0.38, r * 0.27); c.stroke();
  });
  // Lapels: his right one (screen left) tucks under where they cross, his
  // left one crosses over it and runs on down to the belt
  var lapel = function (x0, y0, x1, y1) {
    c.strokeStyle = "rgba(40,36,30,0.55)"; c.lineWidth = lw(0.12);
    c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke();
    c.strokeStyle = "#ebe7dc"; c.lineWidth = lw(0.085);
    c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke();
  };
  lapel(-r * 0.26, -r * 0.25, -r * 0.07, r * 0.03);
  lapel(r * 0.26, -r * 0.25, -r * 0.42, r * 0.27);
  // Shading: lit from the top left
  var sg = c.createLinearGradient(-r, -r * 0.3, r, r);
  sg.addColorStop(0, "rgba(255,255,255,0.1)"); sg.addColorStop(1, "rgba(0,0,0,0.16)");
  c.fillStyle = sg; c.fillRect(-r, -r * 0.3, r * 2, r * 1.3);
  // Black belt: the band, the knot and two tails
  c.fillStyle = belt;
  c.fillRect(-r, r * 0.25, r * 2, r * 0.11);
  c.save(); c.translate(-r * 0.08, r * 0.3);
  c.fillRect(-r * 0.09, -r * 0.07, r * 0.18, r * 0.14);
  c.beginPath(); c.moveTo(-r * 0.06, r * 0.05); c.lineTo(-r * 0.2, r * 0.36); c.lineTo(-r * 0.1, r * 0.38); c.lineTo(r * 0.01, r * 0.06); c.closePath(); c.fill();
  c.beginPath(); c.moveTo(r * 0.02, r * 0.05); c.lineTo(r * 0.1, r * 0.34); c.lineTo(r * 0.2, r * 0.32); c.lineTo(r * 0.08, r * 0.04); c.closePath(); c.fill();
  c.restore();
  c.strokeStyle = ink; c.lineWidth = lw(0.03);
  c.beginPath(); c.moveTo(-r, r * 0.25); c.lineTo(r, r * 0.25); c.moveTo(-r, r * 0.36); c.lineTo(r, r * 0.36); c.stroke();
  c.restore();
}

// The hachimaki: a white headband round his forehead with a red sun in the
// middle and brushed characters either side, the knot's tails by his ear.
// (A plain red disc: no rays.)
function drawGspHachimaki(c, r, hb, line, lw) {
  var col = hb.color || "#f6f4ee", sun = hb.sun || "#c8102e";
  var band = function () {
    c.beginPath();
    c.moveTo(-r, -r * 0.64);
    c.quadraticCurveTo(0, -r * 0.9, r, -r * 0.64);
    c.lineTo(r, -r * 0.52);
    c.quadraticCurveTo(0, -r * 0.76, -r, -r * 0.52);
    c.closePath();
  };
  c.save();
  c.fillStyle = col; band(); c.fill();
  c.save(); band(); c.clip();
  c.fillStyle = "rgba(0,0,0,0.1)"; c.fillRect(-r, -r * 0.64, r * 2, r * 0.05); // the fold along its bottom edge
  c.restore();
  c.strokeStyle = line; c.lineWidth = lw(0.025); band(); c.stroke();
  c.fillStyle = sun;
  c.beginPath(); c.arc(0, -r * 0.715, r * 0.055, 0, Math.PI * 2); c.fill();
  // Brushed characters either side of the sun
  c.strokeStyle = "#1a1a1a"; c.lineWidth = lw(0.016);
  [-1, 1].forEach(function (s) {
    var x = s * r * 0.24, y = -r * 0.705 + r * 0.012;
    c.beginPath();
    c.moveTo(x - r * 0.04, y - r * 0.03); c.lineTo(x + r * 0.04, y - r * 0.035);
    c.moveTo(x, y - r * 0.05); c.lineTo(x - s * r * 0.01, y + r * 0.04);
    c.moveTo(x - r * 0.045, y + r * 0.01); c.lineTo(x - r * 0.02, y + r * 0.03);
    c.moveTo(x + r * 0.025, y + r * 0.0); c.lineTo(x + r * 0.045, y + r * 0.025);
    c.stroke();
  });
  // The knot's tails, by his right ear
  c.fillStyle = col; c.strokeStyle = line; c.lineWidth = lw(0.02);
  c.beginPath(); c.moveTo(r * 0.8, -r * 0.62); c.quadraticCurveTo(r * 0.92, -r * 0.56, r * 0.96, -r * 0.46); c.lineTo(r * 0.89, -r * 0.44); c.quadraticCurveTo(r * 0.85, -r * 0.52, r * 0.76, -r * 0.57); c.closePath(); c.fill(); c.stroke();
  c.beginPath(); c.moveTo(r * 0.77, -r * 0.6); c.quadraticCurveTo(r * 0.82, -r * 0.5, r * 0.83, -r * 0.4); c.lineTo(r * 0.77, -r * 0.4); c.quadraticCurveTo(r * 0.76, -r * 0.5, r * 0.72, -r * 0.56); c.closePath(); c.fill(); c.stroke();
  c.restore();
}

// Small Japanese characters on his left chest (screen right), drawn in the
// torso's own space (fighter-art.js's tattoo layer): two stacked glyphs.
var GSP_KANJI = [
  [[0.2, 0.08, 0.78, 0.08], [0.78, 0.08, 0.45, 0.33], [0.3, 0.2, 0.58, 0.4], [0.08, 0.55, 0.92, 0.55], [0.5, 0.36, 0.5, 0.98], [0.5, 0.6, 0.12, 0.92], [0.5, 0.6, 0.88, 0.92]],
  [[0.2, 0.06, 0.04, 0.3], [0.22, 0.32, 0.04, 0.55], [0.14, 0.42, 0.14, 0.98], [0.3, 0.36, 0.68, 0.36], [0.49, 0.1, 0.49, 0.98], [0.49, 0.44, 0.3, 0.76],
    [0.49, 0.44, 0.68, 0.76], [0.6, 0.14, 0.66, 0.22], [0.77, 0.18, 0.96, 0.18], [0.74, 0.4, 0.98, 0.4], [0.87, 0.4, 0.87, 0.95], [0.87, 0.95, 0.79, 0.9]]
];
function drawGspKanji(c, r, lw, contained) {
  var tall = contained ? 0.86 / 0.59 : 1, g = r * 0.1;
  c.save();
  c.translate(r * 0.3, contained ? -r * 0.48 : -r * 0.5); c.scale(1, tall);
  c.strokeStyle = "rgba(20,22,30,0.82)"; c.lineWidth = lw(0.016); c.lineCap = "round";
  GSP_KANJI.forEach(function (glyph, gi) {
    c.beginPath();
    glyph.forEach(function (s) {
      c.moveTo((s[0] - 0.5) * g, gi * g * 1.15 + s[1] * g);
      c.lineTo((s[2] - 0.5) * g, gi * g * 1.15 + s[3] * g);
    });
    c.stroke();
  });
  c.restore();
}

// ---------------------------------------------------------------- gallery

function gspGalleryMoves(ch, add) {
  var g = ch.gsp, cr = g.crowd, cc = g.chant || {}, sc = g.superman, ni = g.notImpressed;
  if (cr && ch.hasSpecial) add("📣", "Crowd meter", "His special bar is the crowd. Slips (+" + cr.dodge + "s), Superman punches (+" + cr.superman + "s), takedowns (+" + cr.takedown + "s) and \"not impressed\" (+" + cr.taunt + "s) get them going. Past " + Math.round(cr.chantAt * 100) + "% the cameras flash and it's a Montreal crowd, waving Quebec and Canada flags and chanting \"GSP! GSP!\": " + cc.damage + "x damage, " + cc.speed + "x speed, " + cc.attack + "x attack speed" + (sc ? ", and a " + sc.chantDamage + "-damage Superman punch" : "") + ". When it's full he goes into the Superman Dive.");
  if (sc) add("🦸", "Superman punch", "Every " + sc.every[0] + "-" + sc.every[1] + "s (" + sc.chantEvery[0] + "-" + sc.chantEvery[1] + "s while they chant), when they're a step or two away, he loads up and leaps at them with one fist out, a red cape appearing mid-air: " + sc.damage + " damage (" + sc.chantDamage + " while they chant). The load-up is the tell.");
  if (g.dodge) add("🌀", "Slips", "Slips " + g.dodge.chance + "% of strikes and " + g.dodge.projChance + "% of anything thrown at him.");
  if (ni) add("🗯️", "Not impressed", "After " + ni.after + " slips, each within " + secs(ni.window) + " of the last, he drops his hands for " + secs(ni.handsDown) + " and says \"I'm not impressed by your performance.\" (to Matt Hughes, UFC 63). Up to " + ni.max + " times a fight.");
  if (g.shield) gspShieldGalleryMove(g.shield, add); // the Maple Shield (gsp-shield.js)
  if (g.doubleLeg) add("🤼", "Elite double leg", g.doubleLeg.through + "% of his shots go straight through: no slip, block, sprawl or guillotine. The best takedown in the game.");
  if (g.walkout) add("🥋", "Walkout", "Comes out in his karate gi and a white hachimaki headband with a red sun, and throws them off " + secs(g.walkout.keep) + " into the fight.");
}

// The Montreal stadium and the flags, for the Assets tab.
function gspGalleryAssets(list) {
  list.push({ name: "Montreal stadium", info: "Georges St-Pierre's crowd meter turns the stadium into a Montreal crowd chanting GSP.", w: 270, h: 480, draw: gspStadiumPreview });
  list.push({ name: "Maple Shield", info: "Georges St-Pierre's shield: thrown off the cage walls, and blocks strikes.", w: 200, h: 200, draw: function (c, w, h) { drawMapleShield(c, w / 2, h / 2, w * 0.4, 0); } });
  list.push({ name: "Quebec and Canada flags", info: "Waved by the Montreal crowd.", w: 220, h: 220, draw: function (c, w, h) {
    withCtx(c, function () { drawQuebecFlag(w * 0.32, h * 0.38, w * 0.42, 0, 0); drawCanadaFlag(w * 0.7, h * 0.62, w * 0.45, 0, 1); });
  } });
}
function gspStadiumPreview(c, w, h) {
  var px = w / STAGE_W, was = montrealMode, wasBr = brazilMode;
  buildMontrealCrowd();
  montrealMode = true; brazilMode = false;
  try {
    c.save();
    c.scale(px, px);
    drawStandsLayer(c);
    c.save(); c.translate(ST.AX, ST.AY); c.scale(ST.A / W, ST.A / W); drawMatLayer(c); c.restore();
    var t = performance.now() / 1000;
    stadiumFans.forEach(function (f) { var fan = f.mtl; c.save(); c.translate(fan.x, fan.y); drawFanBall(c, fan.r, fan); c.restore(); });
    withCtx(c, function () {
      stadiumFans.forEach(function (f) {
        var fan = f.mtl;
        if (fan.sign) drawFanSign(fan, t);
        else if (fan.mtlFlag) drawMontrealFlag(fan, t);
      });
    });
    drawJumbotronFrame(c);
    c.restore();
  } finally { montrealMode = was; brazilMode = wasBr; }
}

// The sounds, for the Sounds tab.
function gspGallerySounds(groups, synth) {
  groups.push({ title: "Georges St-Pierre", items: [
    synth("GSP! GSP!", "The Montreal crowd chanting while his crowd meter is past half.", function () { playGspChant(); }),
    synth("Superman punch load", "Loading up the Superman punch.", function () { playSupermanLoad(); }),
    synth("Superman punch", "The Superman punch landing.", function () { lastPunchSound = 0; playSupermanHit(30); }),
    synth("Superman Dive rise", "Rising up for the Superman Dive.", function () { playDiveRise(); }),
    synth("Superman Dive flight", "Flying down the lane.", function () { playDiveFly(); }),
    synth("Superman Dive pin", "Catching them and pinning them.", function () { lastPunchSound = 0; playDivePin(30); }),
    synth("Cage crash", "Missing the dive and hitting the cage.", function () { playDiveCrash(); }),
    synth("Slip", "Slipping a strike.", function () { playSlip(); }),
    synth("Maple Shield throw", "Throwing the Maple Shield.", function () { playShieldWind(); playShieldSpin(); }),
    synth("Maple Shield off the cage", "The shield ringing off the cage wall.", function () { playShieldPing(); }),
    synth("Maple Shield hit", "The shield hitting them.", function () { lastPunchSound = 0; playShieldHit(14); }),
    synth("Maple Shield block", "Blocking a strike with the shield.", function () { playShieldBlock(); }),
    synth("Maple Shield catch", "Catching it when it comes back.", function () { playShieldCatch(); }),
    synth("Gi toss", "Throwing his gi off at the walkout.", function () { playGiToss(); })
  ] });
}

// ---------------------------------------------------------------- sound
// Synth stand-ins until Joe records the real ones.

function gspAudio(fn) {
  try {
    var ac = getAudioCtx();
    if (!ac) return;
    if (ac.state === "suspended") ac.resume();
    fn(ac, ac.currentTime);
  } catch (e) { /* never let audio break the game */ }
}
// A crowd shout shaped by a band of noise: one syllable.
function gspShout(ac, at, freq, q, peak, dur) {
  var s = ac.createBufferSource();
  s.buffer = caneNoise(ac); s.loop = true;
  var f = ac.createBiquadFilter();
  f.type = "bandpass"; f.Q.value = q; f.frequency.value = freq;
  var g = ac.createGain();
  g.gain.setValueAtTime(0.0001, at);
  g.gain.exponentialRampToValueAtTime(peak, at + 0.04);
  g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
  s.connect(f); f.connect(g); g.connect(strikeOut(ac));
  s.start(at); s.stop(at + dur + 0.05);
}
// The crowd: "G! S! P!" (gee, ess, pee).
function playGspChant() {
  gspAudio(function (ac, t) {
    gspShout(ac, t, 880, 1.2, 0.42, 0.2);
    gspShout(ac, t + 0.24, 3100, 0.8, 0.3, 0.2);
    gspShout(ac, t + 0.48, 720, 1.1, 0.48, 0.36);
  });
}
// Loading up the Superman punch: a quick "hup".
function playSupermanLoad() {
  gspAudio(function (ac, t) {
    caneTone(ac, t, "triangle", 210, 340, 0.3, 0.14);
    caneBurst(ac, t, 1300, 1.5, 0.25, 0.08);
  });
}
function playSupermanHit(dealt) {
  playPunch(dealt * 1.6);
  gspAudio(function (ac, t) { caneTone(ac, t, "sine", 95, 42, 0.8, 0.32); });
}
// Rising up for the dive: a tone sweeping up under a crowd swell.
function playDiveRise() {
  playWhoosh();
  gspAudio(function (ac, t) {
    var o = ac.createOscillator(), g = ac.createGain();
    o.type = "sawtooth";
    o.frequency.setValueAtTime(140, t); o.frequency.exponentialRampToValueAtTime(620, t + 1.0);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.12, t + 0.3); g.gain.exponentialRampToValueAtTime(0.0001, t + 1.15);
    var lp = ac.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 1400;
    o.connect(lp); lp.connect(g); g.connect(strikeOut(ac));
    o.start(t); o.stop(t + 1.2);
    gspShout(ac, t + 0.1, 900, 0.7, 0.3, 1.0);
  });
}
function playDiveLock() {
  gspAudio(function (ac, t) { caneTone(ac, t, "square", 880, 880, 0.12, 0.08); caneTone(ac, t + 0.1, "square", 1175, 1175, 0.12, 0.1); });
}
// Flying: a jet of air.
function playDiveFly() {
  gspAudio(function (ac, t) {
    var s = ac.createBufferSource();
    s.buffer = caneNoise(ac); s.loop = true;
    var f = ac.createBiquadFilter();
    f.type = "bandpass"; f.Q.value = 0.9;
    f.frequency.setValueAtTime(500, t); f.frequency.exponentialRampToValueAtTime(3200, t + 0.45);
    var g = ac.createGain();
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.5, t + 0.1); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.55);
    s.connect(f); f.connect(g); g.connect(strikeOut(ac));
    s.start(t); s.stop(t + 0.6);
  });
}
function playDivePin(dealt) {
  playSlam(); playPunch(Math.max(30, dealt * 1.5));
  gspAudio(function (ac, t) { caneTone(ac, t, "sine", 80, 36, 0.9, 0.45); });
}
// Into the cage: a thud and the chain-link rattling.
function playDiveCrash() {
  playSlam();
  gspAudio(function (ac, t) {
    caneTone(ac, t, "sine", 130, 48, 0.8, 0.3);
    for (var i = 0; i < 6; i++) caneBurst(ac, t + 0.03 + i * 0.045, 3200 + i * 380, 6, 0.14, 0.05);
  });
}
// A slip: a quick swish of air.
function playSlip() {
  gspAudio(function (ac, t) { caneBurst(ac, t, 2400, 1.4, 0.16, 0.09); });
}
// The gi flung off: a few flaps of cloth.
function playGiToss() {
  playWhoosh();
  gspAudio(function (ac, t) { for (var i = 0; i < 3; i++) caneBurst(ac, t + i * 0.07, 900 + i * 260, 1.2, 0.2, 0.06); });
}
