// Francis Ngannou, "The Predator" (Christian, 2026-11-13). Heavyweight.
// Built on top of Joe's Ngannou: his look, his Power Puncher spin and his CTE
// hook are untouched. Everything here is extra, tuned from the `ngannou` key
// (and `special`) in characters/francis-ngannou.json.
//
// Slow         char.speedMult: the slowest fighter on the roster.
// Rage meter   (ngannou.rage) a green bar under his health. It fills every
//              time he's hit (hitFill a hit, plus dmgFill a point of damage)
//              and when he's frustrated: a CTE hook or a spin that comes up
//              empty (missFill), or Dana White showing up.
// Rage punch   when it's full he turns green, grows (grow) and says "I'm going
//              to connect, and you know what happen when I connect." He stalks
//              in, then plants and cocks his right hand back for `windup`
//              seconds while a green line shows where it's going. The line
//              follows them, then locks for the last `lock` seconds. That's
//              the tell: some read it and back off (readChance, plus readWeave
//              for a weaver). Then he lunges down the line. It can miss
//              ("MISSED!", and he's gassed for a moment) or land: `damage` and
//              a pinball off the walls, and a knockout koBase% of the time at
//              full health, up to koBase + koLow% the more hurt they are
//              (always if it would finish them). Once it lands it can't be
//              slipped or blocked: the dodge is reading the wind-up.
// Smash        his special (special.move "smash"): "In this fight, I'm just
//              looking to smash." He crouches and leaps, a red circle showing
//              where he'll come down (where they're heading), and smashes the
//              mat: shockwave rings, cracks in the floor. Anyone inside takes
//              `damage` (can't be slipped or blocked) and is knocked down for
//              `downTime`.
// Dana White   (ngannou.dana) once a fight a bald man in a black suit waves a
//              contract at him from the jumbotron (cage-side in the test
//              arena): "Who really is scared? Jon, me... or you?" Ngannou
//              rips the contract up ("You didn't release me."), or in the
//              stadium punches the screen. It fills his rage meter by `fill`.
// Punch power  (ngannou.koReading) on his knockout the jumbotron (a banner in
//              the test arena) shows his punch-power reading: 129,161 units,
//              his real record on the punch-power machine.
// Voice lines  (ngannou.lines) speech bubbles (speech.js): the rage line; a
//              taunt after a big shot lands; "Of course, he's really
//              intimidated." when they back off and he misses; vs Jon Jones
//              only, at the start: "This time I am the champ. He is coming up
//              and looking for me."
// The rage punch runs on b.ngSt, the walk over to Dana on b.ngAct, and the
// Smash on b.igbb (move "smash"). He goes green on his own copy of the
// character, so the roster fighter (or the other one in a mirror match)
// never changes.
"use strict";

var NG_GREEN = "#3f9a36";        // his skin when the rage takes over
var NG_FIST = 20;                // the rage punch's glove, at normal size
var NG_GROW_T = 0.7;             // turning green and growing
var NG_KO_HOLD = 1.8;            // flexing over them after a knockout
var NG_DANA_LEN = 7.0;           // Dana's whole visit
var NG_KO_SHOW = 4.4;            // the punch-power reading
var NG_FIST_FLY = 0.24;          // the uppercut flying up to the jumbotron
var NG_LINES = {
  rage: "I'm going to connect, and you know what happen when I connect.",
  taunt: "Leave your chin in the way and you're gonna find out if I have power.",
  backOff: "Of course, he's really intimidated.",
  jon: "This time I am the champ. He is coming up and looking for me.",
  dana: "Who really is scared? Jon, me... or you?",
  rip: "You didn't release me.",
  smash: "In this fight, I'm just looking to smash."
};
var NG_DANA_LOOK = { skin: "#e8b796", hair: "bald", hairColor: "#2b2019", beard: "none", ears: "normal", tattoos: {} };
var ngDana = null;      // Dana White's visit (one at a time)
var ngScraps = [];      // bits of torn-up contract
var ngKoShow = null;    // the punch-power reading after his knockout
var ngCrater = null;    // the cracked mat after a Smash
var ngDebris = [];      // chunks of mat thrown up by it
var ngFist = null;      // the uppercut flying up at the jumbotron
var ngClock = 0;

function ngCfg(b) { return b && b.char && b.char.ngannou; }
function ngRand(r) { return r[0] + Math.random() * (r[1] - r[0]); }
function smashOn(b) { return !!(b && b.igbb && b.igbb.move === "smash"); }
// Throwing the rage punch, or walking over to rip up Dana's contract: the
// speed regulator leaves him alone (physics.js), and no special starts on
// either fighter meanwhile (special.js).
function ngannouBusy(b) { return !!(b && (b.ngSt || b.ngAct)); }
// Both hands are drawn by drawNgannou (drawHands skips them, draw-attacks.js).
function ngannouHandsBusy(b) {
  return !!(b && ((b.ngSt && b.ngSt.phase !== "stalk") || (b.ngAct && b.ngAct.phase !== "go") || smashOn(b)));
}
// A blend of two #rrggbb colours, kept as #rrggbb (the fighter art shades hex).
function ngHex(a, c, t) {
  var x = parseInt(a.slice(1), 16), y = parseInt(c.slice(1), 16), out = 0;
  for (var sh = 16; sh >= 0; sh -= 8) { var u = (x >> sh) & 255, v = (y >> sh) & 255; out = out * 256 + Math.round(u + (v - u) * t); }
  return "#" + ("000000" + out.toString(16)).slice(-6);
}
function ngTurn(a, want, maxStep) {
  var diff = Math.atan2(Math.sin(want - a), Math.cos(want - a));
  return a + Math.max(-maxStep, Math.min(maxStep, diff));
}
// Arena units to the 1080 x 1920 stadium stage (stadium.js).
function ngStage(x, y) { return { x: ST.AX + x * ST.A / W, y: ST.AY + y * ST.A / W }; }

// From startMatchSeeded.
function resetNgannou() { ngDana = null; ngScraps = []; ngKoShow = null; ngCrater = null; ngDebris = []; ngFist = null; ngClock = 0; }
// From makeBall.
function initNgannou(b) {
  b.ngSt = null; b.ngAct = null; b.ngMeter = 0; b.ngGreen = 0; b.ngDown = null;
  var cfg = ngCfg(b);
  if (!cfg) return;
  b.char = JSON.parse(JSON.stringify(b.char)); // his own copy to turn green
  b.ngLookBase = b.char.look;
  b.ngLookGreen = JSON.parse(JSON.stringify(b.char.look));
  b.ngBaseR = b.r;
  b.ngT = 0; b.ngRetry = 0; b.ngJon = undefined;
  b.ngTauntCd = cfg.lines ? ngRand(cfg.lines.tauntEvery) * 0.5 : Infinity;
  b.ngDanaT = cfg.dana ? ngRand(cfg.dana.first) : Infinity; b.ngDanaN = 0;
  b.ngSwW = null; b.ngPwW = null;
}

// ---------------------------------------------------------------- rage meter

function addRage(b, amt) {
  var rc = ngCfg(b) && ngCfg(b).rage;
  if (!rc || !b.alive || b.ngSt || !(amt > 0) || b.ngMeter >= 100) return;
  b.ngMeter = Math.min(100, b.ngMeter + amt);
  if (b.ngMeter >= 100) floater(b.x, b.y - b.r - 44, "RAGE FULL", "crit");
}

// From hurt() (match.js), with the HP actually taken off.
function ngannouHurt(b, dealt, source, attackerId) {
  if (!(dealt > 0) || attackerId == null || attackerId === b.id) return;
  var rc = ngCfg(b) && ngCfg(b).rage;
  if (rc) addRage(b, (source === "laser" ? 0 : rc.hitFill) + dealt * rc.dmgFill);
  var atk = balls[attackerId], ac = ngCfg(atk);
  if (!ac) return;
  if (b.hp <= 0) { startKoReading(atk); return; }
  var lc = ac.lines;
  if (lc && (source === "power" || source === "swing") && b.alive && atk.ngTauntCd <= 0 && canSay(atk) && Math.random() * 100 < lc.tauntChance) {
    say(atk, NG_LINES.taunt);
    atk.ngTauntCd = ngRand(lc.tauntEvery);
  }
}

// Frustration: one of Joe's big shots (the CTE hook, the power spin) ending
// without taking anything off them. From tickNgannou.
function watchFrustration(b, other, rc) {
  if (b.swing && !b.ngSwW) b.ngSwW = { hp: other.hp };
  if (!b.swing && b.ngSwW) { if (other.alive && other.hp >= b.ngSwW.hp) addRage(b, rc.missFill); b.ngSwW = null; }
  var spin = b.powerState && b.powerState.phase === "attack";
  if (spin && !b.ngPwW) b.ngPwW = { hp: other.hp };
  if (!spin && b.ngPwW) { if (other.alive && other.hp >= b.ngPwW.hp) addRage(b, rc.missFill); b.ngPwW = null; }
}

function ngInterrupted(b) {
  return !b.alive || b.slam || b.grappled || b.grapple || b.sprawl || b.sprawled || subLocked(b) || b.guard || b.koOut ||
    b.shocked || b.dazed || b.dizzy || b.shelled || b.checkStun > 0 || !!b.igbb;
}

// ---------------------------------------------------------------- rage punch

// From the abilities loop, before the special. True while it's running.
function updateNgannou(self, other, dt) {
  var cfg = ngCfg(self);
  if (!cfg) return false;
  if (self.ngAct) return runDanaAct(self, cfg, dt);
  var rc = cfg.rage, st = self.ngSt;
  if (!st) {
    // Dana White waving the contract: he drops a hook or a spin he's only
    // winding up, but lets one that's already swinging finish.
    var swinging = (self.swing && self.swing.phase === "strike") || (self.powerState && self.powerState.phase === "attack");
    if (ngDana && ngDana.owner === self.id && ngDana.want && started && !over && !self.igbb && !self.punch && !swinging && !specialBusy(self)) {
      startDanaAct(self);
      return true;
    }
    if (!rc || self.ngMeter < 100 || !started || over || self.ngRetry > 0 || self.ngT < rc.first) return false;
    if (!canStartIgbb(self, other) || swordDuelActive()) return false;
    startRage(self, other);
    st = self.ngSt;
  }
  st.t += dt;
  var dx = other.x - self.x, dy = other.y - self.y, d = Math.sqrt(dx * dx + dy * dy) || 1;
  if (st.phase === "grow") {
    self.vx = 0; self.vy = 0;
    if (st.t >= NG_GROW_T) { st.phase = "stalk"; st.t = 0; }
    return true;
  }
  if (st.phase === "stalk") {
    var sp = (self.baseSpeed || SPEED) * rc.stalkSpeed;
    self.vx = dx / d * sp; self.vy = dy / d * sp;
    var open = other.alive && !other.invincible && !specialBusy(other);
    if (open && (d - self.r - other.r <= rc.range || st.t >= rc.stalk)) beginRageWindup(self, other, rc, dx, dy);
    else if (st.t >= rc.stalk + 2) { cancelRage(self); return false; }
    return true;
  }
  if (st.phase === "windup") {
    self.vx = 0; self.vy = 0;
    if (st.t < rc.windup - rc.lock) st.aim = ngTurn(st.aim, Math.atan2(dy, dx), dt * 6);
    else if (!st.locked) { st.locked = true; playNgLock(); }
    if (st.read) ngBackOff(self, other);
    if (st.t >= rc.windup) { st.phase = "lunge"; st.t = 0; st.went = 0; playWhoosh(); playNgSwing(); }
    return true;
  }
  if (st.phase === "lunge") {
    var ux = Math.cos(st.aim), uy = Math.sin(st.aim);
    self.vx = ux * rc.lunge; self.vy = uy * rc.lunge;
    st.went += rc.lunge * dt;
    if (st.read) ngBackOff(self, other);
    var fr = ngFistR(self), reach = self.r + fr * 0.6;
    var ox = other.x - (self.x + ux * reach), oy = other.y - (self.y + uy * reach);
    if (other.alive && !other.koOut && ox * ox + oy * oy < (other.r + fr) * (other.r + fr)) { landRage(self, other, rc, ux, uy); return !!self.ngSt; }
    if (st.went >= rc.lungeDist) { rageMiss(self, rc); return false; }
    if (!reduceMotion) particles.push({ x: self.x, y: self.y, vx: -self.vx * 0.1, vy: -self.vy * 0.1, life: 0.22, max: 0.22, size: self.r * 0.6, color: "#58c94a" });
    return true;
  }
  // "ko": flexing over them while they're out cold.
  self.vx = 0; self.vy = 0;
  if (other.koOut) { var damp = Math.exp(-5 * dt); other.vx *= damp; other.vy *= damp; }
  if (st.t >= NG_KO_HOLD) { endRage(self); finishKnockedOut(other); checkEnd(); return false; }
  return true;
}

function ngFistR(b) { return NG_FIST * (b.r / (b.ngBaseR || b.r)); }

function startRage(self, other) {
  clearActions(self);
  self.vx = 0; self.vy = 0;
  self.ngSt = { phase: "grow", t: 0, aim: Math.atan2(other.y - self.y, other.x - self.x) };
  floater(self.x, self.y - self.r - 40, "RAGE!", "crit");
  if (ngCfg(self).lines) say(self, NG_LINES.rage);
  playNgRoar();
  crowdReact(0.7);
  if (!reduceMotion) shake = Math.max(shake, 8);
}

function beginRageWindup(self, other, rc, dx, dy) {
  var st = self.ngSt;
  st.phase = "windup"; st.t = 0; st.aim = Math.atan2(dy, dx); st.locked = false;
  st.read = Math.random() * 100 < rc.readChance + (other.char.hasWeave ? rc.readWeave : 0);
  if (st.read) floater(other.x, other.y - other.r - 30, "!", "crit");
  playNgWindup(rc.windup);
}

// Backing off from a punch they saw coming (only while they're rolling about
// on their own).
function ngBackOff(self, other) {
  if (!other.alive || !inOrdinaryMovement(other) || other.angry) return;
  var dx = other.x - self.x, dy = other.y - self.y, d = Math.sqrt(dx * dx + dy * dy) || 1;
  var sp = Math.max(Math.sqrt(other.vx * other.vx + other.vy * other.vy), 260);
  other.vx = dx / d * sp; other.vy = dy / d * sp;
}

function ngKnockable(o) { return o.alive && !o.grappled && !o.grapple && !o.slam && !subLocked(o) && !o.igbb && !o.koOut; }

function landRage(self, other, rc, ux, uy) {
  var ko = wouldKill(other, rc.damage) || Math.random() * 100 < rc.koBase + rc.koLow * (1 - other.hp / MAX_HP);
  self.vx = ux * 60; self.vy = uy * 60;
  if (ko && !other.holdAtOne) {
    if (ngKnockout(self, other)) {
      ngPunchFx(self, other, ux, uy);
      self.ngSt.phase = "ko"; self.ngSt.t = 0;
      floater(self.x, self.y - self.r - 30, "THE PREDATOR!", "crit");
      startKoReading(self);
      crowdReact(1);
      return;
    }
    if (other.justDodged) { rageMiss(self, rc); return; }
  }
  var dealt = hurt(other, rc.damage, "igbb", self.id); // can't be slipped or blocked once it lands
  if (other.justDodged) { rageMiss(self, rc); return; }
  if (dealt > 0) {
    ngPunchFx(self, other, ux, uy);
    floater(other.x, other.y - other.r - 34, "CONNECTED!", "crit");
    if (other.alive && ngKnockable(other)) beginWallSlam(other, ux, uy, { knockback: rc.knockback, wallSlams: rc.wallSlams, slamDamage: rc.slamDamage });
  }
  checkEnd();
  endRage(self);
}

// Out cold, like the KO Rush's knockout (korush.js), but it can't be slipped.
function ngKnockout(self, other) {
  var amount = Math.ceil(other.hp / incomingMultiplier(other));
  var was = other.holdAtOne;
  other.holdAtOne = true;
  var dealt = hurt(other, amount, "igbb", self.id);
  other.holdAtOne = was;
  if (!(dealt > 0)) return false;
  other.hp = 0; other.koOut = true;
  other.punch = null; other.kick = null; other.swing = null; other.throwAnim = null; other.jabAnim = null;
  var dx = other.x - self.x, dy = other.y - self.y, d = Math.sqrt(dx * dx + dy * dy) || 1;
  other.vx = dx / d * 420; other.vy = dy / d * 420;
  knockoutFx(self, other);
  return true;
}

function ngPunchFx(self, other, ux, uy) {
  var cx = other.x - ux * other.r, cy = other.y - uy * other.r;
  other.flash = 0.16;
  other.squash = { t: 0.2, max: 0.2, nx: -ux, ny: -uy };
  impacts.push({ x: cx, y: cy, nx: -ux, ny: -uy, life: 0.55, max: 0.55, color: "#58c94a" });
  hitStop = Math.max(hitStop, 0.12);
  if (!reduceMotion) {
    shake = Math.max(shake, 20);
    for (var i = 0; i < 22; i++) {
      var a = Math.atan2(-uy, -ux) + (Math.random() - 0.5) * 2.8, s = 160 + Math.random() * 360;
      particles.push({ x: cx, y: cy, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 0.3 + Math.random() * 0.3, max: 0.6, size: 2 + Math.random() * 3.5, color: i % 3 ? "#7be06a" : "#ffffff" });
    }
  }
  playNgConnect();
  crowdReact(0.9);
}

function rageMiss(self, rc) {
  var st = self.ngSt;
  floater(self.x + Math.cos(st.aim) * self.r * 1.6, self.y + Math.sin(st.aim) * self.r * 1.6 - 20, "MISSED!", "dodge");
  playNgWhiff();
  addSlow(self, rc.gasSlow, rc.gasTime, "gassed");
  if (st.read && ngCfg(self).lines) say(self, NG_LINES.backOff); // they saw it coming and backed off
  endRage(self);
}

function endRage(self) {
  var rc = ngCfg(self).rage;
  self.ngSt = null;
  self.ngMeter = rc.keep || 0;
  if (self.alive && inOrdinaryMovement(self)) setSpeed(self, (self.baseSpeed || SPEED) * slowMult(self));
}
// Grabbed, slammed or the like before it went off: stays full, tries again soon.
function cancelRage(self) {
  self.ngSt = null;
  self.ngRetry = 1.5;
}

// ---------------------------------------------------------------- Smash

// From updateSpecial (special.js) for special.move "smash".
function updateSmash(self, other, dt) {
  var sp = self.char.special;
  if (!self.igbb) {
    if (self.specialT < sp.chargeTime || !started || over || !canStartIgbb(self, other) || swordDuelActive()) return false;
    clearActions(self);
    self.igbb = { move: "smash", phase: "crouch", t: 0, from: { x: self.x, y: self.y }, to: { x: other.x, y: other.y }, R: sp.radius, h: 0 };
    floater(self.x, self.y - self.r - 30, "SMASH!", "crit");
    if (ngCfg(self) && ngCfg(self).lines) say(self, NG_LINES.smash);
    playNgCrouch();
    crowdReact(0.6);
  }
  var m = self.igbb;
  if (m.move !== "smash") return false;
  m.t += dt;
  self.vx = 0; self.vy = 0;
  if (over && m.phase !== "pose") { endSmash(self); return false; }
  if (m.phase === "crouch") {
    // Picks his spot: where they're heading by the time he comes down.
    var lead = (sp.crouch - m.t + sp.air) * sp.lead;
    m.to.x = Math.min(W - self.r, Math.max(self.r, other.x + other.vx * lead));
    m.to.y = Math.min(H - self.r, Math.max(self.r, other.y + other.vy * lead));
    if (m.t >= sp.crouch) { m.phase = "air"; m.t = 0; m.from = { x: self.x, y: self.y }; playNgLeap(); }
    return true;
  }
  if (m.phase === "air") {
    var k = Math.min(1, m.t / sp.air), e = k * k * (3 - 2 * k);
    self.x = m.from.x + (m.to.x - m.from.x) * e; self.y = m.from.y + (m.to.y - m.from.y) * e;
    m.h = Math.sin(k * Math.PI);
    self.invincible = true; self.immuneCd = 1; // up in the air: nothing reaches him
    if (k >= 1) { m.phase = "pose"; m.t = 0; m.h = 0; smashLand(self, other, sp, m); }
    return true;
  }
  if (m.t >= sp.pose) { endSmash(self); return false; }
  return true;
}

function smashLand(self, other, sp, m) {
  self.invincible = false; self.immuneCd = 0;
  self.squash = { t: 0.3, max: 0.3, nx: 0, ny: 1 };
  ngCrater = { x: m.to.x, y: m.to.y, R: m.R, t: 0, seed: Math.random() * 10 };
  if (!reduceMotion) { shake = Math.max(shake, 30); hitStop = Math.max(hitStop, 0.14); }
  impacts.push({ x: m.to.x, y: m.to.y + self.r * 0.6, nx: 0, ny: -1, life: 0.5, max: 0.5, color: "#e0221b" });
  if (!reduceMotion) {
    for (var i = 0; i < 30; i++) {
      var a = i / 30 * Math.PI * 2, s = 240 + Math.random() * 220;
      particles.push({ x: m.to.x + Math.cos(a) * self.r, y: m.to.y + Math.sin(a) * self.r * 0.6, vx: Math.cos(a) * s, vy: Math.sin(a) * s * 0.6, life: 0.6, max: 0.6, size: 3 + Math.random() * 4, color: i % 3 ? "#d8cdb5" : "#9a8f78" });
    }
    for (var j = 0; j < 14; j++) {
      var ja = Math.random() * Math.PI * 2, js = 120 + Math.random() * 240;
      ngDebris.push({ x: m.to.x + Math.cos(ja) * self.r * 0.6, y: m.to.y + Math.sin(ja) * self.r * 0.4, z: 0, vx: Math.cos(ja) * js, vy: Math.sin(ja) * js * 0.6, vz: 380 + Math.random() * 420,
        rot: Math.random() * 6, spin: (Math.random() - 0.5) * 16, size: 5 + Math.random() * 7, col: j % 4 ? "#d8cdb5" : "#8b5a3c", t: 0 });
    }
  }
  playNgSmash();
  crowdReact(1);
  var dx = other.x - m.to.x, dy = other.y - m.to.y, d = Math.sqrt(dx * dx + dy * dy);
  if (other.alive && !other.koOut && d <= m.R + other.r * 0.3) {
    if (d < 1) { var ra = Math.random() * Math.PI * 2; dx = Math.cos(ra); dy = Math.sin(ra); d = 1; }
    var downable = ngKnockable(other);
    var dealt = hurt(other, sp.damage, "igbb", self.id); // an area hit: can't be slipped or blocked
    if (dealt > 0) {
      floater(other.x, other.y - other.r - 30, "SMASHED!", "crit");
      if (other.alive && downable && !other.justDodged) knockDown(other, sp.downTime, dx / d, dy / d);
      checkEnd();
    }
  } else if (other.alive) {
    floater(other.x, other.y - other.r - 30, "MISSED!", "dodge");
    if (ngCfg(self) && ngCfg(self).lines) say(self, NG_LINES.backOff);
  }
}

// Knocked flat on the mat: can't do anything for `secs`, sliding out a little
// from the shockwave (they're frozen, so tickNgannou slides them).
function knockDown(b, secs, nx, ny) {
  b.punch = null; b.kick = null; b.swing = null; b.throwAnim = null; b.jabAnim = null; b.combo = null; b.taunt = null;
  b.dazed = true; b.vx = 0; b.vy = 0;
  b.ngDown = { t: secs, max: secs, vx: nx * 320, vy: ny * 320 };
  floater(b.x, b.y - b.r - 50, "KNOCKED DOWN", "note");
}

function endSmash(self) {
  self.igbb = null;
  self.specialT = 0;
  self.invincible = false; self.immuneCd = 0;
  if (self.alive) setSpeed(self, (self.baseSpeed || SPEED) * slowMult(self));
}

// ---------------------------------------------------------------- Dana White

function startDana(b) {
  if (over || !b.alive) return;
  ngDana = { owner: b.id, t: 0, x: 90 + Math.random() * (W - 180), said: false, want: false, acting: false, torn: null, cracked: null, fallen: false };
  playNgDanaSting();
  crowdReact(0.5);
}

function startDanaAct(self) {
  clearActions(self);
  self.ngAct = { phase: stadiumOn() ? "punch" : "go", t: 0, done: false };
  ngDana.want = false; ngDana.acting = true;
}

// Walking over to the cage-side seat and ripping the contract up (test
// arena), or an uppercut at the jumbotron (stadium). True while it's running.
function runDanaAct(self, cfg, dt) {
  var a = self.ngAct;
  a.t += dt;
  if (!ngDana || over || ngInterrupted(self)) { endDanaAct(self); return false; }
  if (a.phase === "go") {
    var tx = ngDana.x, ty = H - 46 - self.r * 0.85, dx = tx - self.x, dy = ty - self.y, d = Math.sqrt(dx * dx + dy * dy) || 1; // right over him at the cage
    if (d < 26 || a.t >= 1.7) { a.phase = "rip"; a.t = 0; self.vx = 0; self.vy = 0; return true; }
    var sp = (self.baseSpeed || SPEED) * 1.6;
    self.vx = dx / d * sp; self.vy = dy / d * sp;
    return true;
  }
  self.vx = 0; self.vy = 0;
  if (a.phase === "rip") {
    if (!a.done && a.t >= 0.3) { a.done = true; ripContract(self, cfg); }
    if (a.t >= 0.8) { endDanaAct(self); return false; }
    return true;
  }
  if (!a.done && a.t >= 0.32) { a.done = true; launchNgFist(self); }
  if (a.t >= 0.95) { endDanaAct(self); return false; }
  return true;
}
function endDanaAct(self) {
  self.ngAct = null;
  if (ngDana) ngDana.acting = false;
  if (self.alive && inOrdinaryMovement(self)) setSpeed(self, (self.baseSpeed || SPEED) * slowMult(self));
}

function ripContract(self, cfg) {
  if (!ngDana) return;
  ngDana.torn = { t: 0 };
  var cx = self.x, cy = self.y - self.r * 0.45;
  for (var i = 0; i < 26 && !reduceMotion; i++) {
    var a = -Math.PI / 2 + (Math.random() - 0.5) * 2.6, s = 90 + Math.random() * 260;
    ngScraps.push({ x: cx + (Math.random() - 0.5) * 20, y: cy, vx: Math.cos(a) * s, vy: Math.sin(a) * s, t: 0, dur: 1.4 + Math.random() * 0.8, rot: Math.random() * 6, spin: (Math.random() - 0.5) * 10, w: 5 + Math.random() * 7, h: 4 + Math.random() * 5 });
  }
  floater(self.x, self.y - self.r - 56, "RIPPED UP!", "crit");
  if (cfg.lines) say(self, NG_LINES.rip);
  addRage(self, cfg.dana.fill * 0.5);
  playNgPaperRip();
  crowdReact(0.9);
}

// The uppercut: a green shock flying off the top of the ring into the screen.
function launchNgFist(self) {
  var s = ngStage(self.x, self.y - self.r), jt = ST.JT;
  ngFist = { t: 0, owner: self.id, x0: s.x, y0: s.y, x1: Math.max(jt.x + 120, Math.min(jt.x + jt.w - 120, s.x)), y1: jt.y + jt.h * 0.62, hit: false };
  playNgUppercut();
  if (!reduceMotion) shake = Math.max(shake, 6);
}
function ngFistHits() {
  var f = ngFist, owner = balls[f.owner], cfg = ngCfg(owner);
  f.hit = true;
  if (ngDana) { ngDana.cracked = { x: f.x1, y: f.y1, t: 0 }; ngDana.torn = { t: 0 }; }
  floater(owner.x, owner.y - owner.r - 56, "SCREEN SMASHED!", "crit");
  if (cfg && cfg.lines) say(owner, NG_LINES.rip);
  if (cfg && cfg.dana) addRage(owner, cfg.dana.fill * 0.5);
  playNgScreenSmash();
  if (!reduceMotion) shake = Math.max(shake, 16);
  crowdReact(1);
}

function tickDana(dt) {
  balls.forEach(function (b) {
    var c = ngCfg(b);
    if (!c || !c.dana || !started || over || !b.alive || b.ngDanaN >= c.dana.max || ngDana) return;
    b.ngDanaT -= dt;
    if (b.ngDanaT > 0) return;
    if (jumboAdLeft > 0 || jumboAds.length || jumboHold()) { b.ngDanaT = 2; return; } // something's on the jumbotron: try again shortly
    b.ngDanaN++;
    b.ngDanaT = ngRand(c.dana.every);
    queueJumboAd(NG_DANA_LEN, function () { startDana(b); }, b);
  });
  if (ngFist) {
    ngFist.t += dt;
    if (!ngFist.hit && ngFist.t >= NG_FIST_FLY) ngFistHits();
    if (ngFist.t > NG_FIST_FLY + 0.35) ngFist = null;
  }
  var D = ngDana;
  if (!D) return;
  var owner = balls[D.owner], cfg = ngCfg(owner);
  D.t += dt;
  if (!D.said && D.t >= 0.45) {
    D.said = true;
    if (owner.alive && cfg.lines && isJon(balls[1 - D.owner])) say(owner, NG_LINES.dana); // it names Jon: only when he's the one in there
    addRage(owner, cfg.dana.fill * 0.5);
  }
  D.want = !D.torn && !D.acting && D.t >= 2.4 && D.t < (stadiumOn() ? 5.6 : 4.8) && owner.alive; // (in the test arena he has to walk over first)
  if (D.torn) D.torn.t += dt;
  if (D.cracked) D.cracked.t += dt;
  if (D.t >= NG_DANA_LEN) ngDana = null;
}

// ---------------------------------------------------------------- punch power

function startKoReading(b) {
  var cfg = ngCfg(b);
  if (!cfg || !cfg.koReading || ngKoShow) return;
  ngKoShow = { t: 0, owner: b.id, units: cfg.koReading.units };
}

// ---------------------------------------------------------------- every frame

// From update(): the meter, going green, frustration, knockdowns, Dana, the
// crater and the scraps.
function tickNgannou(dt) {
  ngClock += dt;
  balls.forEach(function (b) {
    var cfg = ngCfg(b), other = balls[1 - b.id];
    if (b.ngDown) {
      var nd = b.ngDown;
      nd.t -= dt;
      var damp = Math.exp(-5 * dt);
      nd.vx *= damp; nd.vy *= damp;
      if (b.dazed === true && b.alive) {
        b.x = Math.min(W - b.r, Math.max(b.r, b.x + nd.vx * dt));
        b.y = Math.min(H - b.r, Math.max(b.r, b.y + nd.vy * dt));
      }
      if (nd.t <= 0 || !b.alive) {
        b.ngDown = null;
        if (b.dazed === true) { b.dazed = false; if (b.alive) setSpeed(b, (b.baseSpeed || SPEED) * 0.6); }
      }
    }
    if (!cfg) return;
    if (started && !over) b.ngT += dt;
    b.ngRetry = Math.max(0, b.ngRetry - dt);
    b.ngTauntCd -= dt;
    // vs Jon Jones only, right at the start.
    if (b.ngJon === undefined) b.ngJon = cfg.lines && isJon(other) ? 1.2 : null;
    if (b.ngJon != null && started && b.alive) { b.ngJon -= dt; if (b.ngJon <= 0) { b.ngJon = null; say(b, NG_LINES.jon); } }
    if (b.ngSt && b.ngSt.phase !== "ko" && ngInterrupted(b)) cancelRage(b);
    if (b.ngSt && b.ngSt.phase === "ko" && !b.alive) { b.ngSt = null; finishKnockedOut(other); checkEnd(); }
    if (cfg.rage && b.alive && !b.ngSt) watchFrustration(b, other, cfg.rage);
    // Green and bigger while the rage is on (and while it's full, waiting to go).
    var want = b.alive && (b.ngSt || (cfg.rage && b.ngMeter >= 100)) ? 1 : 0;
    b.ngGreen += (want - b.ngGreen) * Math.min(1, dt * (want ? 4.5 : 2.5));
    if (Math.abs(want - b.ngGreen) < 0.002) b.ngGreen = want;
    var grow = cfg.rage ? cfg.rage.grow : 1;
    b.r = b.ngBaseR * (1 + (grow - 1) * b.ngGreen);
    if (b.ngGreen > 0) { b.ngLookGreen.skin = ngHex(b.ngLookBase.skin, NG_GREEN, b.ngGreen); b.char.look = b.ngLookGreen; }
    else b.char.look = b.ngLookBase;
    // Steam off his head as it builds.
    if (cfg.rage && b.alive && !reduceMotion && (b.ngMeter >= 70 || b.ngSt) && Math.random() < dt * (b.ngSt ? 14 : 5)) {
      particles.push({ x: b.x + (Math.random() - 0.5) * b.r * 0.8, y: b.y - b.r * 1.05, vx: (Math.random() - 0.5) * 30, vy: -60 - Math.random() * 50, life: 0.6, max: 0.6, size: 3 + Math.random() * 4, color: b.ngSt ? "rgba(140,230,120,0.7)" : "rgba(230,230,230,0.7)" });
    }
    if (slowedBy(b, "gassed") && b.alive && !reduceMotion && Math.random() < dt * 6) { // sweating, gassed after a miss
      particles.push({ x: b.x + (Math.random() - 0.5) * b.r, y: b.y - b.r * 0.8, vx: (Math.random() - 0.5) * 60, vy: 40 + Math.random() * 40, life: 0.5, max: 0.5, size: 2.5, color: "#8fd3ff" });
    }
  });
  tickDana(dt);
  if (ngKoShow) { ngKoShow.t += dt; if (ngKoShow.t > NG_KO_SHOW) ngKoShow = null; }
  if (ngCrater) { ngCrater.t += dt; if (ngCrater.t > 3) ngCrater = null; }
  ngDebris = ngDebris.filter(function (c) {
    c.t += dt; c.x += c.vx * dt; c.y += c.vy * dt; c.rot += c.spin * dt;
    c.z += c.vz * dt; c.vz -= 1500 * dt;
    if (c.z < 0) { c.z = 0; c.vz = Math.abs(c.vz) * 0.3; c.vx *= 0.5; c.vy *= 0.5; c.spin *= 0.5; }
    return c.t < 1.6;
  });
  ngScraps = ngScraps.filter(function (p) {
    p.t += dt; p.x += p.vx * dt; p.y += p.vy * dt;
    p.vx *= 1 - dt * 1.6; p.vy += (60 - p.vy) * dt * 1.8; p.rot += p.spin * dt; // fluttering down
    return p.t < p.dur;
  });
}

// ---------------------------------------------------------------- drawing

// Up in the air for the Smash (draw.js adds it to his spot).
function ngannouOffset(b) {
  var m = b.igbb;
  if (smashOn(b) && m.phase === "air") return { x: 0, y: -m.h * b.r * 2.4 };
  var st = b.ngSt;
  if (st && st.phase === "windup") { var k = Math.min(1, st.t / 0.3); return { x: -Math.cos(st.aim) * b.r * 0.12 * k, y: -Math.sin(st.aim) * b.r * 0.12 * k }; } // leaning back
  return { x: 0, y: 0 };
}

// From draw(), with the other body poses.
function applyNgannouPose(b) {
  var ay = b.y + b.r;
  if (b.ngDown && b.alive) { // flat on the mat
    var k = Math.min(1, (b.ngDown.max - b.ngDown.t) / 0.12) * Math.min(1, b.ngDown.t / 0.25);
    ctx.translate(b.x, ay); ctx.rotate(0.35 * k); ctx.scale(1 + 0.2 * k, 1 - 0.3 * k); ctx.translate(-b.x, -ay);
  }
  var m = b.igbb;
  if (smashOn(b)) {
    var sp = b.char.special;
    if (m.phase === "crouch") { var c = Math.min(1, m.t / (sp.crouch * 0.6)); ctx.translate(b.x, ay); ctx.scale(1 + 0.12 * c, 1 - 0.18 * c); ctx.translate(-b.x, -ay); }
    else if (m.phase === "air") { var s = 1 + 0.3 * m.h; ctx.translate(b.x, b.y); ctx.scale(s * 0.95, s * 1.05); ctx.translate(-b.x, -b.y); }
  }
  var st = b.ngSt;
  if (st && (st.phase === "grow" || st.phase === "windup")) { // trembling with it
    var j = (st.phase === "grow" ? 1.6 : 1 + 2.5 * Math.min(1, st.t / 0.8)) * Math.sin(ngClock * 70);
    ctx.translate(j, -j * 0.5);
  }
}

function ngArm(b, sx, sy, hx, hy, gr, ang) {
  if (hasArmMuscle(b.char)) drawArmMuscle(ctx, b.char, sx, sy, hx, hy, b.r * 0.2, theme.wall);
  else strokeLimb(gr * 0.7, armColor(b.char), function () { ctx.moveTo(sx, sy); ctx.lineTo(hx, hy); });
  drawGloveAt(hx, hy, gr, b.char, ang);
}

// From draw(), per fighter, after its hands: the rage meter, the green glow,
// his hands for the rage punch, the Smash and Dana, and a knocked-down
// fighter's stars (drawDazed does those).
function drawNgannou(b, other) {
  if (!b.alive) return;
  var cfg = ngCfg(b);
  if (!cfg) return;
  var r = b.r;
  if (b.ngGreen > 0.05) { // the green glow
    ctx.save();
    var pulse = 0.5 + 0.5 * Math.sin(ngClock * 9);
    var g = ctx.createRadialGradient(b.x, b.y, r * 0.85, b.x, b.y, r * 1.7);
    g.addColorStop(0, "rgba(90,220,80," + (0.32 + 0.2 * pulse) * b.ngGreen + ")"); g.addColorStop(1, "rgba(90,220,80,0)");
    ctx.fillStyle = g; ctx.globalCompositeOperation = "lighter";
    ctx.beginPath(); ctx.arc(b.x, b.y, r * 1.7, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
  if (cfg.rage) drawRageBar(b, other);
  var st = b.ngSt, gr = r * 0.3;
  if (st) {
    var ang = st.aim, ux = Math.cos(ang), uy = Math.sin(ang), px = -uy, py = ux;
    if (st.phase === "grow") { // fists clenched down by his sides, roaring
      [-1, 1].forEach(function (s) {
        var sx = b.x + px * s * r * 0.6, sy = b.y + py * s * r * 0.6 + r * 0.05;
        var hx = b.x + px * s * r * 1.05 + ux * r * 0.25, hy = b.y + py * s * r * 1.05 + uy * r * 0.25 + r * 0.25;
        ngArm(b, sx, sy, hx, hy, gr * 1.05, ang);
      });
    } else if (st.phase === "windup") { // the right hand cocked way back, the left up in front
      var k = easeOut(Math.min(1, st.t / 0.35)), fr = ngFistR(b) * (1 + 0.15 * Math.sin(ngClock * 30) * (st.locked ? 1 : 0.4));
      var sxR = b.x - px * r * 0.55, syR = b.y - py * r * 0.55;
      var hxR = b.x - ux * r * (0.2 + 0.75 * k) - px * r * (0.75 + 0.3 * k), hyR = b.y - uy * r * (0.2 + 0.75 * k) - py * r * (0.75 + 0.3 * k);
      ngArm(b, sxR, syR, hxR, hyR, fr, ang);
      ctx.save(); // charged glow round the cocked fist
      ctx.globalAlpha = 0.35 + 0.3 * Math.sin(ngClock * 25);
      ctx.strokeStyle = "#7be06a"; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.arc(hxR, hyR, fr * (1.35 + 0.25 * k), 0, Math.PI * 2); ctx.stroke();
      ctx.restore();
      ngArm(b, b.x + px * r * 0.5, b.y + py * r * 0.5, b.x + ux * r * 0.85 + px * r * 0.4, b.y + uy * r * 0.85 + py * r * 0.4, gr, ang);
    } else if (st.phase === "lunge") { // thrown: arm out straight down the line
      var fr2 = ngFistR(b);
      ngArm(b, b.x - px * r * 0.35, b.y - py * r * 0.35, b.x + ux * (r + fr2 * 0.6), b.y + uy * (r + fr2 * 0.6), fr2, ang);
      ngArm(b, b.x + px * r * 0.5, b.y + py * r * 0.5, b.x + ux * r * 0.55 + px * r * 0.75, b.y + uy * r * 0.55 + py * r * 0.75, gr, ang);
    } else { // "ko": a double biceps flex over them
      drawNgFlex(b, gr);
    }
    return;
  }
  var a = b.ngAct;
  if (a && a.phase === "rip") { // both hands up on the contract, tearing it in two
    var tear = ngDana && ngDana.torn ? easeOut(Math.min(1, ngDana.torn.t / 0.25)) : 0;
    var cx = b.x, cy = b.y - r * 0.45, fade = Math.max(0, Math.min(1, (0.8 - a.t) / 0.25));
    if (!tear) drawContract(cx, cy, r * 1.0, Math.sin(a.t * 30) * 0.05, 0, 1);
    else [-1, 1].forEach(function (s) { drawContract(cx + s * r * (0.08 + 0.75 * tear), cy + r * 0.2 * tear, r * 1.0, s * 0.7 * tear, s, fade); });
    [-1, 1].forEach(function (s) {
      var hx = cx + s * r * (0.46 + 0.75 * tear), hy = cy + r * 0.34 + r * 0.2 * tear; // holding its bottom corners
      ngArm(b, b.x + s * r * 0.75, b.y + r * 0.25, hx, hy, gr, -Math.PI / 2);
    });
    return;
  }
  if (a && a.phase === "punch") { // an uppercut at the jumbotron
    var up = a.t < 0.32 ? 0 : easeOut(Math.min(1, (a.t - 0.32) / 0.1));
    var hx2 = b.x + r * 0.35, hy2 = b.y - r * (0.2 + 1.35 * up) + (1 - up) * r * 0.45;
    ngArm(b, b.x + r * 0.55, b.y - r * 0.2, hx2, hy2, gr * 1.15, -Math.PI / 2);
    ngArm(b, b.x - r * 0.6, b.y - r * 0.1, b.x - r * 0.75, b.y - r * 0.75, gr, -Math.PI / 2);
    return;
  }
  var m = b.igbb;
  if (smashOn(b)) {
    if (m.phase === "air") { // both fists up over his head, coming down like hammers
      [-1, 1].forEach(function (s) { ngArm(b, b.x + s * r * 0.6, b.y - r * 0.35, b.x + s * r * 0.4, b.y - r * 1.25, gr * 1.1, -Math.PI / 2); });
    } else { // crouched with his fists on the mat, then planted in it
      var dn = m.phase === "crouch" ? Math.min(1, m.t / 0.3) : 1;
      [-1, 1].forEach(function (s) { ngArm(b, b.x + s * r * 0.62, b.y + r * 0.05, b.x + s * r * (0.95 - 0.15 * dn), b.y + r * (0.55 + 0.45 * dn), gr * 1.05, Math.PI / 2); });
    }
  }
}

function drawNgFlex(b, gr) {
  var r = b.r;
  [-1, 1].forEach(function (s) {
    var sx = b.x + s * r * 0.62, sy = b.y - r * 0.15;
    var ex = sx + s * r * 0.45, ey = sy - r * 0.05, hx = b.x + s * r * 1.0, hy = b.y - r * 0.85;
    if (hasArmMuscle(b.char)) { drawArmMuscle(ctx, b.char, sx, sy, ex, ey, r * 0.2, theme.wall); drawArmMuscle(ctx, b.char, ex, ey, hx, hy, r * 0.2, theme.wall); }
    else strokeLimb(gr * 0.7, armColor(b.char), function () { ctx.moveTo(sx, sy); ctx.lineTo(ex, ey); ctx.lineTo(hx, hy); });
    drawGloveAt(hx, hy, gr, b.char, -Math.PI / 2);
  });
}

// The green rage meter, under his health bar over the ball.
function drawRageBar(b, other) {
  var pinned = (other.grapple && other.grapple.finisher && other.grapple.phase !== "carry") || other.rnc;
  if (pinned) return;
  var bw = 64, bh = 8, bx = b.x - bw / 2, by = b.y - b.r - 18;
  if (by < 4) by = b.y + b.r + 10;
  var y = by + bh + 2, h = 6, p = Math.max(0, Math.min(1, b.ngMeter / 100)), full = p >= 1 || !!b.ngSt;
  ctx.save();
  ctx.fillStyle = theme.grid; ctx.fillRect(bx, y, bw, h);
  ctx.fillStyle = full ? (Math.sin(ngClock * 18) > 0 ? "#7be06a" : "#2f8f2a") : "#3fae38";
  ctx.fillRect(bx, y, bw * (b.ngSt ? 1 : p), h);
  ctx.lineWidth = 1.5; ctx.strokeStyle = theme.wall; ctx.strokeRect(bx, y, bw, h);
  ctx.restore();
}

// Under the fighters: the rage punch's line, the Smash circle and his
// shadow, the cracked mat, and Dana at the cage in the test arena.
function drawNgannouUnder() {
  if (ngCrater) drawNgCrater(ngCrater);
  if (ngDana && !stadiumOn()) drawDanaCageside(ngDana);
  balls.forEach(function (b) {
    if (!b.alive) return;
    var st = b.ngSt, rc = ngCfg(b) && ngCfg(b).rage;
    if (st && st.phase === "windup" && rc) {
      // Where it's going: a green dashed line out to the end of the lunge,
      // with a ring on the end. Flashing once it's locked.
      var ux = Math.cos(st.aim), uy = Math.sin(st.aim), L = rc.lungeDist + b.r + ngFistR(b);
      var on = Math.min(1, st.t / 0.25), flash = st.locked ? 0.55 + 0.45 * Math.sin(ngClock * 40) : 1;
      var ex = b.x + ux * L, ey = b.y + uy * L;
      ctx.save();
      ctx.lineCap = "round";
      ctx.globalAlpha = 0.22 * on; ctx.fillStyle = "#3fae38";
      ctx.beginPath(); ctx.moveTo(b.x - uy * b.r * 0.9, b.y + ux * b.r * 0.9); ctx.lineTo(ex - uy * b.r * 0.9, ey + ux * b.r * 0.9);
      ctx.lineTo(ex + uy * b.r * 0.9, ey - ux * b.r * 0.9); ctx.lineTo(b.x + uy * b.r * 0.9, b.y - ux * b.r * 0.9); ctx.closePath(); ctx.fill();
      ctx.globalAlpha = 0.9 * on * flash;
      ctx.setLineDash([12, 9]); ctx.lineDashOffset = -ngClock * 90;
      ctx.strokeStyle = "#2f9a2a"; ctx.lineWidth = st.locked ? 5 : 3.5;
      ctx.beginPath(); ctx.moveTo(b.x + ux * b.r, b.y + uy * b.r); ctx.lineTo(ex, ey); ctx.stroke();
      ctx.setLineDash([]);
      ctx.beginPath(); ctx.arc(ex, ey, ngFistR(b) + 6, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(ex - 10, ey); ctx.lineTo(ex + 10, ey); ctx.moveTo(ex, ey - 10); ctx.lineTo(ex, ey + 10); ctx.stroke();
      ctx.restore();
    }
    var m = b.igbb;
    if (smashOn(b) && (m.phase === "crouch" || m.phase === "air")) {
      var sp = b.char.special, k = m.phase === "crouch" ? m.t / (sp.crouch + sp.air) : (sp.crouch + m.t) / (sp.crouch + sp.air);
      var pulse = 0.5 + 0.5 * Math.sin(ngClock * 16), pop = easeOut(Math.min(1, m.t / 0.2 + (m.phase === "air" ? 1 : 0)));
      ctx.save();
      ctx.beginPath(); ctx.rect(0, 0, W, H); ctx.clip(); // cut off at the cage
      ctx.translate(m.to.x, m.to.y);
      ctx.fillStyle = "rgba(224,34,27," + (0.12 + 0.1 * pulse) + ")";
      ctx.beginPath(); ctx.arc(0, 0, m.R * pop, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "rgba(224,34,27,0.26)"; // filling in: the countdown to impact
      ctx.beginPath(); ctx.arc(0, 0, m.R * pop * Math.min(1, k), 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "#e0221b"; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.arc(0, 0, m.R * pop, 0, Math.PI * 2); ctx.stroke();
      ctx.setLineDash([12, 10]); ctx.lineDashOffset = -ngClock * 60; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(0, 0, m.R * pop * 0.72, 0, Math.PI * 2); ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
      if (m.phase === "air") { // his shadow under him on the mat
        ctx.save();
        ctx.fillStyle = "rgba(0,0,0," + (0.18 + 0.12 * (1 - m.h)) + ")";
        ctx.beginPath(); ctx.ellipse(b.x, b.y + b.r * 0.85, b.r * (1 - 0.35 * m.h), b.r * 0.3 * (1 - 0.35 * m.h), 0, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }
    }
  });
}

function drawNgCrater(c) {
  var fade = Math.min(1, (3 - c.t) / 0.8);
  ctx.save();
  ctx.globalAlpha = fade;
  ctx.strokeStyle = "rgba(55,30,20,0.8)"; ctx.lineCap = "round"; ctx.lineJoin = "round";
  for (var i = 0; i < 12; i++) { // cracks out from where he came down, forking at the end
    var a = i / 12 * Math.PI * 2 + c.seed, L = c.R * (0.55 + 0.45 * ((i * 7 + Math.floor(c.seed * 3)) % 5) / 5);
    var grow = Math.min(1, c.t / 0.18);
    var mx = c.x + Math.cos(a + 0.16) * L * 0.5 * grow, my = c.y + Math.sin(a + 0.16) * L * 0.5 * grow;
    var ex = c.x + Math.cos(a - 0.06) * L * grow, ey = c.y + Math.sin(a - 0.06) * L * grow;
    ctx.lineWidth = 3.5;
    ctx.beginPath(); ctx.moveTo(c.x + Math.cos(a) * 16, c.y + Math.sin(a) * 16); ctx.lineTo(mx, my); ctx.lineTo(ex, ey); ctx.stroke();
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(mx, my); ctx.lineTo(mx + Math.cos(a + 0.7) * L * 0.25 * grow, my + Math.sin(a + 0.7) * L * 0.25 * grow); ctx.stroke();
  }
  ctx.fillStyle = "rgba(55,30,20,0.32)";
  ctx.beginPath(); ctx.ellipse(c.x, c.y + 6, 40, 24, 0, 0, Math.PI * 2); ctx.fill();
  [[0, "#ffffff", 16], [0.08, "#e0221b", 11], [0.18, "#e0221b", 7], [0.3, "#ffffff", 5]].forEach(function (w) { // shockwave rings rolling out
    var wt = c.t - w[0];
    if (wt < 0 || wt > 0.55) return;
    var k = wt / 0.55;
    ctx.globalAlpha = (1 - k) * fade; ctx.strokeStyle = w[1]; ctx.lineWidth = w[2] * (1 - k) + 2;
    ctx.beginPath(); ctx.ellipse(c.x, c.y + 8, c.R * (0.2 + 1.3 * k), c.R * (0.2 + 1.3 * k) * 0.82, 0, 0, Math.PI * 2); ctx.stroke();
  });
  ctx.restore();
}

// Over the fighters: the mat chunks, the contract scraps, the impact flash,
// and the punch-power reading as a banner in the test arena.
function drawNgannouOver() {
  ngDebris.forEach(function (c) {
    var a = Math.min(1, (1.6 - c.t) / 0.4);
    ctx.save();
    ctx.globalAlpha = a * 0.3; ctx.fillStyle = "#000";
    ctx.beginPath(); ctx.ellipse(c.x, c.y, c.size * 0.7, c.size * 0.3, 0, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = a; ctx.translate(c.x, c.y - c.z); ctx.rotate(c.rot);
    ctx.fillStyle = c.col; ctx.strokeStyle = "rgba(60,40,25,0.8)"; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(-c.size, -c.size * 0.5); ctx.lineTo(c.size * 0.7, -c.size * 0.7); ctx.lineTo(c.size, c.size * 0.4); ctx.lineTo(-c.size * 0.4, c.size * 0.7); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.restore();
  });
  ngScraps.forEach(function (p) {
    ctx.save();
    ctx.globalAlpha = Math.min(1, (p.dur - p.t) / 0.4);
    ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.scale(1, 0.55 + 0.45 * Math.cos(p.rot * 2));
    ctx.fillStyle = "#fbfaf4"; ctx.strokeStyle = "#8a8578"; ctx.lineWidth = 1;
    ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); ctx.strokeRect(-p.w / 2, -p.h / 2, p.w, p.h);
    ctx.restore();
  });
  if (ngCrater && ngCrater.t < 0.16) { // the whole ring flashing on impact
    ctx.save(); ctx.globalAlpha = 0.4 * (1 - ngCrater.t / 0.16); ctx.fillStyle = "#ffffff";
    ctx.fillRect(-W, -H, W * 3, H * 3); ctx.restore();
  }
  if (ngKoShow && !stadiumOn()) { var kb = balls[ngKoShow.owner]; drawNgKoReading(10, kb && kb.y < H / 2 ? H - 126 : 10, W - 20, 116); }
}

// A sheet of contract: `tilt` rotates it, `half` -1/1 draws just that torn
// half (0 the whole sheet). (x, y) is its middle, `h` its height.
function drawContract(x, y, h, tilt, half, alpha) {
  var w = h * 0.74;
  ctx.save();
  ctx.globalAlpha *= alpha == null ? 1 : alpha;
  ctx.translate(x, y); ctx.rotate(tilt);
  ctx.beginPath();
  if (!half) ctx.rect(-w / 2, -h / 2, w, h);
  else { // a jagged tear down the middle
    var e = half * w / 2;
    ctx.moveTo(e, -h / 2); ctx.lineTo(0, -h / 2);
    for (var i = 1; i <= 6; i++) ctx.lineTo((i % 2 ? 1 : -1) * w * 0.05, -h / 2 + h * i / 6);
    ctx.lineTo(e, h / 2); ctx.closePath();
  }
  ctx.save(); ctx.clip();
  ctx.fillStyle = "#fbfaf4"; ctx.fillRect(-w / 2, -h / 2, w, h);
  ctx.fillStyle = "#1d1d1d"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.font = "900 " + Math.max(6, h * 0.13) + "px \"Barlow Condensed\", \"Arial Narrow\", sans-serif";
  ctx.fillText("CONTRACT", 0, -h * 0.34);
  ctx.fillStyle = "#9b978c";
  for (var j = 0; j < 5; j++) ctx.fillRect(-w * 0.36, -h * 0.18 + j * h * 0.1, w * (j === 4 ? 0.45 : 0.72), Math.max(1, h * 0.025));
  ctx.strokeStyle = "#2a3c8f"; ctx.lineWidth = Math.max(1, h * 0.025); // the signature line, signed
  ctx.beginPath(); ctx.moveTo(-w * 0.36, h * 0.36); ctx.lineTo(w * 0.36, h * 0.36); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-w * 0.3, h * 0.33); ctx.bezierCurveTo(-w * 0.15, h * 0.2, -w * 0.05, h * 0.42, w * 0.08, h * 0.28); ctx.lineTo(w * 0.25, h * 0.32); ctx.stroke();
  ctx.restore();
  ctx.strokeStyle = "#3a3a3a"; ctx.lineWidth = Math.max(1, h * 0.03); ctx.stroke();
  ctx.restore();
}

// Dana White: a bald ball in a black suit, white shirt and black tie.
function drawDanaBall(x, y, r, ink) {
  var look = NG_DANA_LOOK, line = shadeHex(look.skin, -0.38);
  var lw = function (k) { return Math.max(1, r * k); };
  ctx.save();
  ctx.translate(x, y);
  ctx.save();
  ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.clip();
  var g = ctx.createRadialGradient(-r * 0.35, -r * 0.45, r * 0.1, 0, 0, r * 1.05);
  g.addColorStop(0, shadeHex(look.skin, 0.14)); g.addColorStop(0.7, look.skin); g.addColorStop(1, shadeHex(look.skin, -0.22));
  ctx.fillStyle = g; ctx.fillRect(-r, -r, r * 2, r * 2);
  // The suit jacket over the bottom two thirds.
  ctx.fillStyle = "#141518";
  ctx.beginPath(); ctx.moveTo(-r, -r * 0.36); ctx.quadraticCurveTo(-r * 0.5, -r * 0.3, -r * 0.24, -r * 0.25);
  ctx.lineTo(r * 0.24, -r * 0.25); ctx.quadraticCurveTo(r * 0.5, -r * 0.3, r, -r * 0.36); ctx.lineTo(r, r); ctx.lineTo(-r, r); ctx.closePath(); ctx.fill();
  // White shirt in a V, and the black tie.
  ctx.fillStyle = "#f4f4f2";
  ctx.beginPath(); ctx.moveTo(-r * 0.24, -r * 0.25); ctx.lineTo(r * 0.24, -r * 0.25); ctx.lineTo(0, r * 0.42); ctx.closePath(); ctx.fill();
  ctx.fillStyle = "#050505";
  ctx.beginPath(); ctx.moveTo(-r * 0.06, -r * 0.24); ctx.lineTo(r * 0.06, -r * 0.24); ctx.lineTo(r * 0.04, -r * 0.16); ctx.lineTo(r * 0.09, r * 0.3); ctx.lineTo(0, r * 0.4); ctx.lineTo(-r * 0.09, r * 0.3); ctx.lineTo(-r * 0.04, -r * 0.16); ctx.closePath(); ctx.fill();
  // Lapels.
  ctx.strokeStyle = "#3a3c42"; ctx.lineWidth = lw(0.05);
  [-1, 1].forEach(function (s) { ctx.beginPath(); ctx.moveTo(s * r * 0.24, -r * 0.25); ctx.lineTo(s * r * 0.05, r * 0.45); ctx.lineTo(s * r * 0.36, r * 0.05); ctx.stroke(); });
  drawArtHeadLayer(ctx, r, look, line, lw);
  var rg = ctx.createRadialGradient(-r * 0.2, -r * 0.25, r * 0.6, 0, 0, r);
  rg.addColorStop(0, "rgba(0,0,0,0)"); rg.addColorStop(1, "rgba(0,0,0,0.25)");
  ctx.fillStyle = rg; ctx.fillRect(-r, -r, r * 2, r * 2);
  ctx.restore();
  ctx.strokeStyle = ink; ctx.lineWidth = Math.max(2, r * 0.077);
  ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.stroke();
  ctx.restore();
}

// Dana waving the contract up over his head (x, y is his ball, r its size).
// `torn` 0..1 pulls the halves apart.
function drawDanaWaving(x, y, r, t, torn, ink) {
  var wave = Math.sin(t * 9) * 0.35;
  var hx = x + r * 0.9, hy = y - r * 0.95 + Math.sin(t * 9) * r * 0.08;
  if (!torn) drawContract(hx + r * 0.1, hy - r * 0.62, r * 1.05, wave * 0.6, 0, 1);
  else [-1, 1].forEach(function (s) {
    var k = Math.min(1, torn);
    drawContract(hx + s * r * (0.12 + 1.1 * k), hy - r * 0.62 + r * 1.6 * k * k, r * 1.05, s * (0.3 + 1.6 * k), s, 1 - 0.6 * k);
  });
  ctx.save(); // his arm up and hand
  ctx.strokeStyle = ink; ctx.lineWidth = r * 0.32; ctx.lineCap = "round";
  ctx.beginPath(); ctx.moveTo(x + r * 0.6, y - r * 0.2); ctx.lineTo(hx, hy); ctx.stroke();
  ctx.strokeStyle = "#141518"; ctx.lineWidth = r * 0.22;
  ctx.beginPath(); ctx.moveTo(x + r * 0.6, y - r * 0.2); ctx.lineTo(hx, hy); ctx.stroke();
  ctx.fillStyle = NG_DANA_LOOK.skin; ctx.strokeStyle = ink; ctx.lineWidth = Math.max(1.5, r * 0.06);
  ctx.beginPath(); ctx.arc(hx, hy, r * 0.2, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.restore();
}

// The test arena: Dana at the cage, his top half showing over the bottom edge.
function drawDanaCageside(D) {
  var r = 34, rise = easeOut(Math.min(1, D.t / 0.4)), sink = D.t > NG_DANA_LEN - 0.6 ? easeOut((D.t - (NG_DANA_LEN - 0.6)) / 0.6) : 0;
  var y = H - 12 + (1 - rise) * r * 1.8 + sink * r * 1.9;
  var owner = balls[D.owner], taken = D.torn || (owner && owner.ngAct && owner.ngAct.phase === "rip"); // in Ngannou's hands now
  if (!taken) drawDanaWaving(D.x, y, r, D.t, 0, theme.wall);
  drawDanaBall(D.x, y, r, theme.wall);
  if (rise < 0.9 || sink > 0.3) return;
  var lx = D.x < W / 2 ? D.x + r * 2.3 : D.x - r * 2.3; // his name off to the side, away from the contract
  ctx.save();
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.font = "800 16px \"Barlow Condensed\", \"Arial Narrow\", sans-serif";
  ctx.lineWidth = 4; ctx.lineJoin = "round"; ctx.strokeStyle = theme.floor;
  ctx.strokeText("DANA WHITE", lx, H - 16); ctx.fillStyle = theme.ink; ctx.fillText("DANA WHITE", lx, H - 16);
  ctx.restore();
}

// ---------------------------------------------------------------- jumbotron

// From drawJumbotron (stadium.js), in stage units: his rage meter under his
// health, Dana's visit, the cracked screen, the punch-power reading, and the
// uppercut flying up into the screen.
function drawNgannouJumbo(x, y, w, h) {
  balls.forEach(function (b, i) {
    var cfg = ngCfg(b);
    if (!cfg || !cfg.rage) return;
    var right = i === 1, px0 = right ? x + w - 62 : x + 62, nx = right ? px0 - 64 : px0 + 64, bw = w / 2 - 150;
    var bx = right ? nx - bw : nx, by = y + 92, mw = bw * 0.7, mx = right ? bx + bw - mw : bx, my = by + 30 + 26, mh = 8;
    var p = b.ngSt ? 1 : Math.max(0, Math.min(1, b.ngMeter / 100)), full = p >= 1;
    ctx.fillStyle = "#1b2238"; ctx.fillRect(mx, my, mw, mh);
    ctx.fillStyle = full && Math.sin(ngClock * 18) > 0 ? "#b6ff9e" : "#4fd23f"; ctx.shadowColor = "#3fae38"; ctx.shadowBlur = full ? 16 : 8;
    ctx.fillRect(right ? mx + mw * (1 - p) : mx, my, mw * p, mh);
    ctx.shadowBlur = 0;
    ctx.font = "700 14px Impact, 'Arial Black', sans-serif"; ctx.fillStyle = full ? "#b6ff9e" : "#c9d3ea";
    ctx.textAlign = right ? "right" : "left"; ctx.textBaseline = "middle";
    ctx.fillText(full ? "RAGE!" : "RAGE", right ? mx - 8 : mx + mw + 8, my + 5);
  });
  if (ngDana) drawDanaJumbo(ngDana, x, y, w, h);
  if (ngKoShow) drawNgKoReading(x, y, w, h);
  if (ngFist) drawNgFistFlying(ngFist);
}

function drawDanaJumbo(D, x, y, w, h) {
  var a = Math.min(1, D.t / 0.25, (NG_DANA_LEN - D.t) / 0.35);
  if (a <= 0) return;
  ctx.save();
  ctx.globalAlpha = a;
  ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
  var bg = ctx.createLinearGradient(0, y, 0, y + h);
  bg.addColorStop(0, "#2a2f3a"); bg.addColorStop(1, "#0d0f14");
  ctx.fillStyle = bg; ctx.fillRect(x, y, w, h);
  // A dim office: a window behind him and a desk in front.
  ctx.fillStyle = "rgba(160,190,230,0.12)"; ctx.fillRect(x + w * 0.08, y + h * 0.1, w * 0.36, h * 0.5);
  ctx.strokeStyle = "rgba(255,255,255,0.12)"; ctx.lineWidth = 4; ctx.strokeRect(x + w * 0.08, y + h * 0.1, w * 0.36, h * 0.5);
  var r = h * 0.3, dx = x + w * 0.26, bob = Math.abs(Math.sin(D.t * 9)) * r * 0.05, dy = y + h * 0.66 - bob;
  var torn = D.torn ? Math.min(1, D.torn.t / 0.7) : 0;
  if (D.cracked) dy += easeOut(Math.min(1, D.cracked.t / 0.5)) * r * 0.25; // knocked back in his chair
  drawDanaWaving(dx, dy, r, D.t, torn, "#0b0f12");
  drawDanaBall(dx, dy, r, "#0b0f12");
  ctx.fillStyle = "#3a2a1e"; ctx.fillRect(x, y + h * 0.86, w * 0.55, h * 0.14); // the desk
  // The lower third and the LIVE bug.
  ctx.fillStyle = Math.sin(D.t * 6) > 0 ? "#e0221b" : "#7a1410";
  ctx.beginPath(); ctx.arc(x + 26, y + 24, 9, 0, Math.PI * 2); ctx.fill();
  jtText("LIVE", x + 42, y + 25, 24, "#ffffff", "left", "#000000");
  var tx = x + w * 0.56, tw = w * 0.4;
  ctx.fillStyle = "rgba(0,0,0,0.55)"; ctx.fillRect(tx - 12, y + h * 0.3, tw + 24, h * 0.42);
  ctx.fillStyle = "#c8a24a"; ctx.fillRect(tx - 12, y + h * 0.3, 6, h * 0.42);
  jtText("DANA WHITE", tx + tw / 2, y + h * 0.42, 54, "#ffffff", "center", "#000000", tw);
  jtText("WANTS TO TALK CONTRACT", tx + tw / 2, y + h * 0.6, 26, "#c8a24a", "center", "#000000", tw);
  if (D.cracked) drawCrackedScreen(D.cracked, x, y, w, h);
  ctx.restore();
}

// Where his punch hit the screen: a white flash, spider-web cracks and the
// picture breaking up.
function drawCrackedScreen(c, x, y, w, h) {
  var t = c.t;
  ctx.save();
  if (t < 0.15) { ctx.globalAlpha *= 1 - t / 0.15; ctx.fillStyle = "#ffffff"; ctx.fillRect(x, y, w, h); ctx.globalAlpha = 1; }
  for (var s = 0; s < 6; s++) { // the picture tearing into bands
    var flick = Math.sin(t * 40 + s * 7.3) > 0.3;
    if (!flick) continue;
    var by = y + ((s * 53 + Math.floor(t * 20) * 37) % Math.max(1, Math.floor(h)));
    ctx.fillStyle = s % 2 ? "rgba(255,255,255,0.18)" : "rgba(0,0,0,0.35)"; ctx.fillRect(x, by, w, 6 + (s % 3) * 4);
  }
  ctx.strokeStyle = "rgba(255,255,255,0.92)"; ctx.lineCap = "round";
  var grow = Math.min(1, t / 0.12), L = Math.max(w, h) * 0.55;
  for (var i = 0; i < 14; i++) {
    var a = i / 14 * Math.PI * 2 + 0.3, l = L * (0.35 + 0.65 * ((i * 5) % 7) / 7) * grow;
    var mx = c.x + Math.cos(a + 0.12) * l * 0.45, my = c.y + Math.sin(a + 0.12) * l * 0.45;
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(c.x, c.y); ctx.lineTo(mx, my); ctx.lineTo(c.x + Math.cos(a) * l, c.y + Math.sin(a) * l); ctx.stroke();
  }
  ctx.lineWidth = 2;
  [0.16, 0.32].forEach(function (k) { // rings of the web
    ctx.beginPath();
    for (var j = 0; j <= 14; j++) {
      var a2 = j / 14 * Math.PI * 2 + 0.3, rr = L * k * grow * (0.85 + 0.3 * ((j * 3) % 4) / 4);
      var px = c.x + Math.cos(a2) * rr, py = c.y + Math.sin(a2) * rr;
      if (j) ctx.lineTo(px, py); else ctx.moveTo(px, py);
    }
    ctx.stroke();
  });
  ctx.fillStyle = "rgba(255,255,255,0.85)"; ctx.beginPath(); ctx.arc(c.x, c.y, 14, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

// The uppercut's shock flying up off the ring into the jumbotron.
function drawNgFistFlying(f) {
  var k = Math.min(1, f.t / NG_FIST_FLY), x = f.x0 + (f.x1 - f.x0) * k, y = f.y0 + (f.y1 - f.y0) * k;
  var fade = f.hit ? Math.max(0, 1 - (f.t - NG_FIST_FLY) / 0.35) : 1;
  ctx.save();
  ctx.globalAlpha = fade;
  var g = ctx.createLinearGradient(f.x0, f.y0, x, y);
  g.addColorStop(0, "rgba(90,220,80,0)"); g.addColorStop(1, "rgba(150,255,130,0.9)");
  ctx.strokeStyle = g; ctx.lineCap = "round"; ctx.lineWidth = 34;
  ctx.beginPath(); ctx.moveTo(f.x0, f.y0); ctx.lineTo(x, y); ctx.stroke();
  if (!f.hit) {
    var owner = balls[f.owner];
    if (owner && owner.char.look) drawGlove(ctx, x, y, 34, owner.char.look, "#0b0f12", -Math.PI / 2);
  }
  ctx.restore();
}

// The punch-power reading: the number counting up to 129,161 with a meter
// filling green to red, then WORLD RECORD.
function drawNgKoReading(x, y, w, h) {
  var K = ngKoShow, owner = balls[K.owner], t = K.t;
  var a = Math.min(1, t / 0.25, (NG_KO_SHOW - t) / 0.35);
  if (a <= 0 || !owner) return;
  var big = h > 160, k = Math.min(1, t / 1.5), e = 1 - Math.pow(1 - k, 3);
  ctx.save();
  ctx.globalAlpha = a;
  ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
  var bg = ctx.createLinearGradient(0, y, 0, y + h);
  bg.addColorStop(0, "#06210a"); bg.addColorStop(1, "#020a03");
  ctx.fillStyle = bg; ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = k >= 1 && Math.sin(t * 14) > 0 ? "#ffffff" : "#3fae38"; ctx.lineWidth = big ? 6 : 4; ctx.strokeRect(x + 5, y + 5, w - 10, h - 10);
  var pr = h * 0.3, pxc = x + 18 + pr, pyc = y + h * 0.52;
  if (owner.char.look) {
    drawFighterArt(ctx, pxc, pyc, pr, owner.char.look, "#0b0f12", { layout: "contained", name: owner.char.name });
    ctx.lineWidth = 3; ctx.strokeStyle = "#0b0f12"; ctx.beginPath(); ctx.arc(pxc, pyc, pr, 0, Math.PI * 2); ctx.stroke();
  }
  var tx = pxc + pr + 16, tw = x + w - 18 - tx;
  jtText("PUNCH POWER", tx + tw / 2, y + h * 0.17, big ? 34 : 17, "#b6ff9e", "center", "#000000", tw);
  var n = Math.round(K.units * e), str = n.toLocaleString("en-US");
  jtText(str, tx + tw * 0.42, y + h * 0.45, big ? 96 : 40, "#ffffff", "center", "#3fae38", tw * 0.8);
  jtText("UNITS", tx + tw * 0.9, y + h * 0.47, big ? 28 : 14, "#c9f7c0", "center", "#000000", tw * 0.2);
  // The meter: segments lighting up green, yellow, red.
  var segs = 24, sw2 = tw / segs, my = y + h * 0.66, mh = h * 0.1;
  for (var i = 0; i < segs; i++) {
    var lit = i < Math.round(segs * e), col = i < segs * 0.5 ? "#4fd23f" : (i < segs * 0.8 ? "#ffd23f" : "#ff3b2a");
    ctx.fillStyle = lit ? col : "rgba(255,255,255,0.08)";
    ctx.fillRect(tx + i * sw2 + 1, my, sw2 - 2, mh);
  }
  if (k >= 1) jtText("WORLD RECORD!", tx + tw / 2, y + h * 0.87, big ? 36 : 17, Math.sin(t * 10) > 0 ? "#ffd23f" : "#ffffff", "center", "#b8862f", tw);
  ctx.restore();
}

// ---------------------------------------------------------------- sound
// Synth stand-ins until Joe records the real ones.

function ngAudio(fn) {
  try {
    var ac = getAudioCtx();
    if (!ac) return;
    if (ac.state === "suspended") ac.resume();
    fn(ac, ac.currentTime);
  } catch (e) { /* never let audio break the game */ }
}
// Going green: a deep growl rising into a roar.
function playNgRoar() {
  ngAudio(function (ac, t) {
    var o = ac.createOscillator(), f = ac.createBiquadFilter(), g = ac.createGain();
    o.type = "sawtooth"; o.frequency.setValueAtTime(55, t); o.frequency.exponentialRampToValueAtTime(95, t + 0.5); o.frequency.exponentialRampToValueAtTime(60, t + 0.9);
    f.type = "lowpass"; f.frequency.setValueAtTime(300, t); f.frequency.exponentialRampToValueAtTime(1200, t + 0.45); f.frequency.exponentialRampToValueAtTime(260, t + 0.9);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.5, t + 0.08); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.95);
    o.connect(f); f.connect(g); g.connect(strikeOut(ac)); o.start(t); o.stop(t + 1);
    caneBurst(ac, t, 380, 0.8, 0.5, 0.6);
  });
}
// Cocking it back: a rising hum that builds for the whole wind-up.
function playNgWindup(dur) {
  ngAudio(function (ac, t) {
    var o = ac.createOscillator(), g = ac.createGain();
    o.type = "triangle"; o.frequency.setValueAtTime(90, t); o.frequency.exponentialRampToValueAtTime(420, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.22, t + dur * 0.8); g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.05);
    o.connect(g); g.connect(strikeOut(ac)); o.start(t); o.stop(t + dur + 0.1);
  });
}
function playNgLock() { ngAudio(function (ac, t) { caneTone(ac, t, "square", 880, 880, 0.12, 0.08); caneTone(ac, t + 0.1, "square", 1175, 1175, 0.12, 0.1); }); }
function playNgSwing() { ngAudio(function (ac, t) { caneBurst(ac, t, 600, 0.6, 0.6, 0.25); }); }
// It lands: a huge thud with a crack on top.
function playNgConnect() {
  playSlam();
  ngAudio(function (ac, t) {
    caneTone(ac, t, "sine", 70, 24, 1.0, 0.7);
    caneBurst(ac, t, 2400, 1.5, 0.8, 0.07);
    caneBurst(ac, t + 0.01, 700, 0.7, 0.9, 0.2);
  });
}
function playNgWhiff() {
  playWhoosh();
  ngAudio(function (ac, t) { caneTone(ac, t + 0.05, "sine", 160, 60, 0.3, 0.35); });
}
function playNgCrouch() { ngAudio(function (ac, t) { caneTone(ac, t, "sine", 120, 50, 0.6, 0.3); caneBurst(ac, t, 300, 0.8, 0.4, 0.15); }); }
function playNgLeap() { playWhoosh(); ngAudio(function (ac, t) { caneTone(ac, t, "triangle", 140, 520, 0.25, 0.5); }); }
// Coming down on the mat: the slam, a deep boom and a rumble.
function playNgSmash() {
  playSlam();
  ngAudio(function (ac, t) {
    caneTone(ac, t, "sine", 90, 26, 1.0, 1.1);
    var s = ac.createBufferSource(), lp = ac.createBiquadFilter(), g = ac.createGain();
    s.buffer = caneNoise(ac); s.loop = true;
    lp.type = "lowpass"; lp.frequency.setValueAtTime(1600, t); lp.frequency.exponentialRampToValueAtTime(110, t + 1.0);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.8, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + 1.1);
    s.connect(lp); lp.connect(g); g.connect(strikeOut(ac)); s.start(t); s.stop(t + 1.15);
  });
}
// Dana showing up: a sour two-note brass sting.
function playNgDanaSting() {
  ngAudio(function (ac, t) {
    caneTone(ac, t, "sawtooth", 233, 233, 0.12, 0.22);
    caneTone(ac, t + 0.24, "sawtooth", 220, 207, 0.12, 0.5);
  });
}
// Tearing paper: a quick run of dry, bright crackles.
function playNgPaperRip() {
  ngAudio(function (ac, t) { for (var i = 0; i < 9; i++) caneBurst(ac, t + i * 0.025, 2600 + (i % 3) * 900, 1.8, 0.35, 0.035); });
}
function playNgUppercut() { playWhoosh(); ngAudio(function (ac, t) { caneTone(ac, t, "triangle", 200, 900, 0.25, 0.25); }); }
// The screen breaking: glass and a blown speaker.
function playNgScreenSmash() {
  ngAudio(function (ac, t) {
    caneBurst(ac, t, 4200, 2.2, 0.7, 0.25);
    caneBurst(ac, t + 0.04, 3100, 1.6, 0.5, 0.35);
    caneTone(ac, t, "sine", 110, 40, 0.7, 0.4);
    caneTone(ac, t + 0.08, "square", 60, 58, 0.06, 0.5);
  });
}
