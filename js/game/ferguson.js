// Tony Ferguson, "El Cucuy" (Christian, 2026-11-13). Lightweight.
// Everything is set under `ferguson` in his character file (leave a block out
// and that part is off), plus his `elbow` block (elbows.js) and `guard`.
//
// Elbows     (elbow, elbows.js) low base damage up close, but a lot of them
//            are critical hits, and a crit can open a cut that bleeds.
// Chin       (durability) he takes `damageTaken` of the damage (a hard man to
//            hurt). Won't tap (wontTap): when a choke or armbar on him is about
//            to end in a tap, he refuses (`chances`, the first refusal then the
//            next), the bar swings back and he rips out ("WON'T TAP!"), at a
//            cost of `cost` health. The first armbar Charles Oliveira puts on
//            him he always survives (`vsCharlesArmbar`, UFC 256).
// Guard      (guard, guard.js) knocked down, he's at home on his back: step
//            into his circle and he catches you most of the time, into a buggy
//            choke, his D'Arce, or elbows from the bottom.
// The slide  (slide) his side-to-side shuffle: every few seconds at mid range
//            (and `react`% of the times they wind up something big) he slides
//            left-right-left, slipping `dodge`% of strikes ("SLIDE"). Then he
//            often shoots (`shoot`%): a level change and a dash in. The shot
//            goes through every takedown defence (sprawls, guillotines, ...).
//            A takedown that lands (takedown) slams them down for `damage`
//            and goes into one of `finish`: the buggy choke (buggy), his D'Arce
//            (darce) or ground-and-pound elbows (groundElbows). The chokes use
//            the tug-of-war bar: they tap `tapBase`% plus up to `tapLowHp`% more
//            the more hurt they are.
// Shell      (shell) the ninja turtle: when he's taking a beating (`burst`
//            damage in `window` seconds), or every so often up close, he pulls
//            into a green turtle shell for `time` seconds. Strikes and anything
//            thrown CLANK off it; a special move cracks it. Then (spin) he
//            often comes out of it spinning like a shell across the mat into
//            them. "This is a rat race. But I'm no rat..."
// Kaioken    (kaioken) up to `max` times a fight (first after `first`
//            seconds, or when he drops under `lowHp` of his health) he plants,
//            a red aura bursts on ("KAIOKEN!", x2 then x3) and for `time`
//            seconds he hits `damage` times harder, rolls `speed` times faster
//            and attacks `attack` times faster. The first time it burns out,
//            the Burrito Bell ad runs (burrito-bell-ad.js).
// Katanas    his special (special.move "katana"): crosses his arms and steel
//            blades slide out of both elbows (the tell: some opponents back
//            off), then for `time` seconds he hunts them down slashing with
//            blade elbows: low damage, but `critChance`% are crits for
//            `critMult`x that can cut. It ends with an X-slash (`finisher`).
// Death      (death) no blast on the spot: he gets dizzy, wanders to the middle
//            of the cage, trips over a TV cable, falls flat and then blows up
//            (his real cable trip before UFC 223, 2018).
// Rivals     (rivals) against Khabib, five CANCELLED stamps slam down at the
//            start (their fight fell through five times); against Justin
//            Gaethje and Charles Oliveira, both of whom beat him, it's a
//            REMATCH and his first Kaioken comes early.
// Lines      (lines) real quotes as speech bubbles, each sourced in the
//            README. calls: commentator calls for his famous finishes
//            (announce(), speech.js), only once a call's wording is verified.
"use strict";

// Registered here rather than in special.js's table, so fighters built in
// parallel don't all edit the same line.
SPECIAL_MOVES.katana = "Katanas";
// His guard's finishes (guard.js): "caught" picks one of these.
GUARD_SUBS.buggy = function (self, atk) { beginTfSub(self, atk, "buggy", true); };
GUARD_SUBS.darce = function (self, atk) { beginTfSub(self, atk, "darce", true); };
GUARD_SUBS.elbows = function (self, atk) { beginTfSub(self, atk, "guardElbows", true); };

var TF_NO_SLIP = { laser: true, slam: true, grapple: true, finisher: true, flow: true, kickback: true, slugfest: true, kofinal: true, igbb: true };
var TF_TAP_TIME = 0.75;
var TF_POWER = 0.55;      // planted while the Kaioken bursts on
var TF_RED = "#d81b25", TF_BAND = "#c41e1e";
var TF_SHELL = { dark: "#1f5d27", mid: "#2f7d32", light: "#5fae4f", rim: "#d8c46a" };
var TF_RIVAL = { khabib: "c-khabib-nurmagomedov", gaethje: "c-justin-gaethje", charles: "c-charles-oliveira", conor: "c-conor-mcgregor" };
var tfClock = 0;
var tfGhosts = [];        // afterimages of his slide
var tfStamps = [];        // CANCELLED and REMATCH stamps at the start
var tfFlash = 0;          // the red flash as a Kaioken bursts on

function tfRand(r) { return r[0] + Math.random() * (r[1] - r[0]); }
function tfCfg(b) { return b && b.char && b.char.ferguson; }
function tfIs(b, id) { return !!(b && b.char && String(b.char.id || "").indexOf(id) === 0); }
function katanaOn(b) { return !!(b && b.igbb && b.igbb.move === "katana"); }
function tfShellUp(b) { return !!(b && b.tfShell && b.tfShell.phase !== "out"); }
// Busy with one of his own moves: the speed regulator leaves him alone (physics.js).
function fergusonBusy(b) { return !!(b && (b.tfSlide || b.tfShot || b.tfTd || b.tfSub || b.tfShell || b.tfPower)); }
// His hands are drawn by drawFerguson (drawHands skips them, draw-attacks.js).
function fergusonHandsBusy(b) { return fergusonBusy(b) || katanaOn(b); }
function tfClamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

// From startMatchSeeded.
function resetFerguson() { tfClock = 0; tfGhosts = []; tfStamps = []; tfFlash = 0; resetBurritoBell(); }
// From makeBall (after its weight class is applied).
function initFerguson(b) {
  b.tfSlide = null; b.tfShot = null; b.tfTd = null; b.tfSub = null; b.tfShell = null; b.tfPower = null; b.tfKaio = null; b.tfWontTap = null;
  var cfg = tfCfg(b);
  if (!cfg) return;
  b.tfBase = { speed: b.baseSpeed, atk: b.atkRate };
  b.tfSlideT = cfg.slide ? tfRand(cfg.slide.first) : Infinity; b.tfReactCd = 0;
  b.tfShellT = cfg.shell ? tfRand(cfg.shell.first) : Infinity; b.tfShellN = 0; b.tfShellCd = 0; b.tfHurtLog = []; b.tfHp = b.hp;
  b.tfKaioT = cfg.kaioken ? tfRand(cfg.kaioken.first) : Infinity; b.tfKaioN = 0;
  b.tfRefusals = 0; b.tfStarted = false; b.tfSays = []; b.tfTauntT = cfg.lines && cfg.lines.tauntEvery ? tfRand(cfg.lines.tauntEvery) : Infinity;
  b.tfLateSaid = false; b.tfBearSaid = false; b.tfWinSaid = false; b.tfAdDone = false; b.tfShellLines = 0;
}

// ---------------------------------------------------------------- every frame

// From update().
function tickFerguson(dt) {
  tfClock += dt;
  tfFlash = Math.max(0, tfFlash - dt);
  balls.forEach(function (b) {
    var cfg = tfCfg(b);
    if (!cfg) return;
    if (started && !b.tfStarted) { b.tfStarted = true; tfFightStart(b, cfg); }
    tfInterrupt(b);
    tfHurtTrack(b, cfg);
    tfWatchSubs(b, cfg);
    tickKaioken(b, cfg, dt);
    tfLines(b, cfg, dt);
    if (b.tfWontTap) { b.tfWontTap.t += dt; if (b.tfWontTap.t > 1.6) b.tfWontTap = null; }
  });
  tfGhosts.forEach(function (g) { g.t += dt; });
  tfGhosts = tfGhosts.filter(function (g) { return g.t < g.max; });
  tfStamps.forEach(function (s) {
    var was = s.t; s.t += dt;
    if (was < 0 && s.t >= 0) { playTfStamp(s.kind); if (!reduceMotion) shake = Math.max(shake, s.kind === "final" ? 10 : 6); crowdReact(0.35); }
  });
  tfStamps = tfStamps.filter(function (s) { return s.t < s.max; });
  tickBurritoBell(dt);
}

// Anything that takes hold of him (a grab, a slam, a guard, a special) ends
// whatever move of his own was running.
function tfInterrupt(b) {
  if (!b.tfSlide && !b.tfShot && !b.tfShell && !b.tfPower && !b.tfTd && !b.tfSub) return;
  var gone = !b.alive || b.grappled || b.grapple || b.slam || b.sprawl || b.sprawled || b.choked || b.guard || b.guillo || b.rnc || b.armbar || b.suplex ||
    b.koOut || b.shocked || b.dazed || b.dizzy || b.shelled || b.checkStun > 0 || (b.igbb && !katanaOn(b));
  if (!gone) return;
  b.tfSlide = null; b.tfShot = null; b.tfPower = null;
  if (b.tfShell) b.tfShell = null;
  if (b.tfTd) { var v = balls[b.tfTd.vicId]; if (v) v.choked = false; b.tfTd = null; }
  if (b.tfSub) endTfSub(b);
}

// How much he's been hit lately (for the shell).
function tfHurtTrack(b, cfg) {
  var lost = (b.tfHp || 0) - b.hp;
  b.tfHp = b.hp;
  if (lost > 0) b.tfHurtLog.push({ t: tfClock, d: lost });
  var win = cfg.shell ? cfg.shell.window : 2.5;
  b.tfHurtLog = b.tfHurtLog.filter(function (h) { return tfClock - h.t <= win; });
}
function tfRecentHurt(b) { var s = 0; b.tfHurtLog.forEach(function (h) { s += h.d; }); return s; }

// ---------------------------------------------------------------- the abilities loop

// From the abilities loop, before the special. True while one of his moves
// is running (he does nothing else).
function updateFerguson(self, other, dt) {
  var cfg = tfCfg(self);
  if (!cfg) return false;
  if (self.tfSub) return runTfSub(self, other, cfg, dt);
  if (self.tfTd) return runTfTakedown(self, other, cfg, dt);
  if (self.tfPower) return runKaiokenPower(self, other, cfg, dt);
  if (self.tfShot) return runTfShot(self, other, cfg, dt);
  if (self.tfShell) return runTfShell(self, other, cfg, dt);
  if (self.tfSlide) return runTfSlide(self, other, cfg, dt);
  if (self.tfSlideT > 0) self.tfSlideT -= dt;
  if (self.tfShellT > 0) self.tfShellT -= dt;
  if (self.tfShellCd > 0) self.tfShellCd -= dt;
  if (self.tfReactCd > 0) self.tfReactCd -= dt;
  if (!self.tfKaio && self.tfKaioT > 0) self.tfKaioT -= dt;
  if (!started || over || !other.alive || self.igbb || self.koRush || self.elbowAnim) return false;
  if (subLocked(self) || self.sprawl || self.slam || self.checkStun > 0 || swordDuelLocked(self)) return false; // (down in guard, in a hold, ...)
  if (self.punch || self.kick || self.swing || self.throwAnim || self.combo || self.taunt) return false; // lets his own strike finish
  if (other.choked || other.grappled || subLocked(other) || other.invincible || other.koOut || swordDuelActive()) return false;
  var dx = other.x - self.x, dy = other.y - self.y, d = Math.sqrt(dx * dx + dy * dy) || 1, gap = d - self.r - other.r;
  if (tfWantKaioken(self, cfg)) { startKaiokenPower(self, cfg); return true; }
  if (tfWantShell(self, other, cfg, gap)) { startTfShell(self, other, cfg); return true; }
  var react = tfTelegraphing(other) && gap < 240;
  if (tfWantSlide(self, cfg, gap, react)) { startTfSlide(self, other, cfg, react); return true; }
  return false;
}

// Something big coming that he can see: a KO Rush, a CHAMA, a haymaker or a
// power punch winding up, a Superman punch loading, a crane kick.
function tfTelegraphing(o) {
  return !!((o.koRush && o.koRush.phase === "run") || (o.chama && o.chama.phase === "call") || (o.swing && o.swing.phase === "windup") ||
    (o.powerState && o.powerState.phase === "charge") || (o.rageState && o.rageState.phase === "charge") ||
    (o.gspSp && o.gspSp.phase === "load") || (o.craneKick && o.craneKick.phase === "pose"));
}

// ---------------------------------------------------------------- the slide

function tfWantSlide(self, cfg, gap, react) {
  var sl = cfg.slide;
  if (!sl) return false;
  if (react && self.tfReactCd <= 0) {
    self.tfReactCd = 2.5;
    return Math.random() * 100 < sl.react;
  }
  return self.tfSlideT <= 0 && gap >= sl.minGap && gap <= sl.maxGap;
}
function startTfSlide(self, other, cfg, react) {
  var sl = cfg.slide;
  clearActions(self);
  self.tfSlide = { t: 0, hops: sl.hops, dir: Math.random() < 0.5 ? -1 : 1, react: react, ghostT: 0,
    shoot: Math.random() * 100 < sl.shoot * (react ? 0.5 : 1) };
  self.tfSlideT = tfRand(sl.every);
  if (react) floater(self.x, self.y - self.r - 30, "SLIDES OUT", "note");
  playTfSlide();
}
function runTfSlide(self, other, cfg, dt) {
  var s = self.tfSlide, sl = cfg.slide;
  s.t += dt;
  var dx = other.x - self.x, dy = other.y - self.y, d = Math.sqrt(dx * dx + dy * dy) || 1, ux = dx / d, uy = dy / d;
  var hop = Math.floor(s.t / sl.hopTime);
  if (hop >= s.hops || !other.alive || over) {
    self.tfSlide = null;
    var gap = d - self.r - other.r;
    if (s.shoot && other.alive && !over && gap < sl.shootRange && !other.choked && !subLocked(other) && !other.invincible && !other.igbb) {
      startTfShot(self);
      return true;
    }
    setSpeed(self, self.baseSpeed || SPEED);
    return false;
  }
  if (hop !== s.hop) { s.hop = hop; if (hop) playTfSlide(); }
  var p = (s.t % sl.hopTime) / sl.hopTime, dir = s.dir * (hop % 2 ? -1 : 1);
  var spd = sl.speed * (0.3 + 0.7 * Math.sin(p * Math.PI));
  var drift = s.react ? -0.45 : 0.28; // backing out of a big shot, or edging in
  self.vx = (-uy * dir + ux * drift) * spd; self.vy = (ux * dir + uy * drift) * spd;
  s.lean = dir;
  s.ghostT -= dt;
  if (s.ghostT <= 0) { s.ghostT = 0.05; tfGhosts.push({ x: self.x, y: self.y, r: self.r, t: 0, max: 0.3, color: self.char.color }); }
  return true;
}

// From hurt (match.js): slipping a strike on the slide, or clanking it off
// the shell. True if it doesn't land.
function fergusonDodge(b, source, attackerId) {
  var cfg = tfCfg(b);
  if (!cfg || !b.alive || attackerId == null || attackerId === b.id) return false;
  if (tfShellUp(b)) {
    if (source === "igbb") { // a special move cracks it
      b.tfShell = null;
      floater(b.x, b.y - b.r - 30, "SHELL CRACKED!", "crit");
      playShellClank(true);
      return false;
    }
    b.justDodged = true;
    if (source !== "laser" && b.immuneCd <= 0) { floater(b.x, b.y - b.r - 8, "SHELL", "dodge"); b.immuneCd = 0.3; playShellClank(false); }
    b.flash = Math.max(b.flash, 0.06);
    return true;
  }
  if (b.tfSlide && cfg.slide && !TF_NO_SLIP[source] && Math.random() * 100 < cfg.slide.dodge) {
    floater(b.x, b.y - b.r - 8, "SLIDE", "dodge");
    b.justDodged = true;
    playTfSlip();
    return true;
  }
  return false;
}

// From hurt (match.js): his chin, and the Kaioken's extra power.
function fergusonDamageMult(b, source, attackerId) {
  if (source === "laser" || source === "kopunch" || source === "kofinal") return 1;
  var m = 1, atk = attackerId != null ? balls[attackerId] : null, cfg = tfCfg(b);
  if (cfg && cfg.durability) m *= cfg.durability.damageTaken;
  if (atk && atk !== b && atk.tfKaio && tfCfg(atk) && tfCfg(atk).kaioken) m *= tfCfg(atk).kaioken.damage * (atk.tfKaio.x > 2 ? 1.08 : 1);
  return m;
}

// ---------------------------------------------------------------- the shot

function startTfShot(self) {
  clearActions(self);
  self.tfShot = { t: 0, phase: "level" };
  self.vx = 0; self.vy = 0;
}
function runTfShot(self, other, cfg, dt) {
  var s = self.tfShot, sl = cfg.slide;
  s.t += dt;
  var dx = other.x - self.x, dy = other.y - self.y, d = Math.sqrt(dx * dx + dy * dy) || 1;
  if (!other.alive || over || other.choked || subLocked(other) || other.invincible || other.igbb) { self.tfShot = null; setSpeed(self, self.baseSpeed || SPEED); return false; }
  if (s.phase === "level") { // the level change: the tell
    self.vx = 0; self.vy = 0;
    if (s.t >= sl.level) { s.phase = "drive"; s.t = 0; playWhoosh(); }
    return true;
  }
  self.vx = dx / d * sl.shotSpeed; self.vy = dy / d * sl.shotSpeed;
  if (d < self.r + other.r + 6) {
    self.tfShot = null;
    self.vx = 0; self.vy = 0;
    self.tfShooting = true;
    var ok = attemptGrab(self, other); // every takedown defence (grapple-duel.js); a clean one comes back to tryFergusonTakedown
    self.tfShooting = false;
    if (!ok && !self.sprawled && !self.choked && !self.grappled) setSpeed(self, self.baseSpeed || SPEED);
    return !!self.tfTd;
  }
  if (s.t > sl.shotMax) {
    floater(self.x, self.y - self.r - 8, "WHIFF", "dodge");
    self.tfShot = null;
    setSpeed(self, self.baseSpeed || SPEED);
    return false;
  }
  return true;
}

// From attemptGrab (grapple-duel.js) when the shot got through: he drives
// them down himself.
function tryFergusonTakedown(atk, tgt) {
  if (!tfCfg(atk) || !atk.tfShooting || !tgt.alive) return false;
  var dx = tgt.x - atk.x, dy = tgt.y - atk.y, d = Math.sqrt(dx * dx + dy * dy) || 1, ux = dx / d, uy = dy / d;
  var reachX = tfClamp(tgt.x + ux * 60, tgt.r + atk.r, W - tgt.r - atk.r), reachY = tfClamp(tgt.y + uy * 60, tgt.r + atk.r, H - tgt.r - atk.r);
  clearActions(tgt);
  atk.tfTd = { vicId: tgt.id, t: 0, sx: tgt.x, sy: tgt.y, ex: reachX, ey: reachY, ux: ux, uy: uy, slammed: false };
  tgt.choked = true; tgt.vx = 0; tgt.vy = 0;
  atk.vx = 0; atk.vy = 0;
  floater(atk.x, atk.y - atk.r - 44, "TAKEDOWN!", "crit");
  return true;
}
function runTfTakedown(self, other, cfg, dt) {
  var m = self.tfTd, vic = balls[m.vicId], td = cfg.takedown || {};
  m.t += dt;
  if (!vic.alive || !self.alive) { vic.choked = false; self.tfTd = null; return false; }
  var k = easeOut(Math.min(1, m.t / 0.3));
  vic.x = m.sx + (m.ex - m.sx) * k; vic.y = m.sy + (m.ey - m.sy) * k; vic.vx = 0; vic.vy = 0;
  self.x = vic.x - m.ux * (self.r + vic.r - 8); self.y = vic.y - m.uy * (self.r + vic.r - 8); self.vx = 0; self.vy = 0;
  if (!m.slammed && m.t >= 0.3) {
    m.slammed = true;
    var dealt = hurt(vic, td.damage || 12, "grapple", self.id); // (counts as a takedown on the jumbotron)
    impacts.push({ x: vic.x, y: vic.y + vic.r, nx: 0, ny: -1, life: 0.4, max: 0.4, color: self.char.color });
    vic.squash = { t: 0.16, max: 0.16, nx: m.ux, ny: m.uy };
    if (!reduceMotion) shake = Math.max(shake, 12);
    hitStop = Math.max(hitStop, 0.05);
    if (dealt > 0) playSlam();
    checkEnd();
    if (!vic.alive) { self.tfTd = null; return false; }
  }
  if (m.t >= 0.42) {
    self.tfTd = null;
    var fin = td.finish || { buggy: 1 }, total = 0, kinds = Object.keys(fin);
    kinds.forEach(function (k2) { total += fin[k2]; });
    var roll = Math.random() * total, pick = kinds[0];
    for (var i = 0; i < kinds.length; i++) { roll -= fin[kinds[i]]; if (roll < 0) { pick = kinds[i]; break; } }
    beginTfSub(self, vic, pick === "elbows" ? "groundElbows" : pick, false);
  }
  return true;
}

// ---------------------------------------------------------------- his holds

var TF_HOLD_NAMES = { buggy: "BUGGY CHOKE!", darce: "D'ARCE CHOKE!", groundElbows: "GROUND AND POUND ELBOWS", guardElbows: "ELBOWS FROM THE BOTTOM!" };
function tfIsChoke(kind) { return kind === "buggy" || kind === "darce"; }

// Starts one of his holds on `vic`: a choke on the tug-of-war bar, or a run
// of elbows while they're pinned.
function beginTfSub(self, vic, kind, fromGuard) {
  var cfg = tfCfg(self) || {};
  clearActions(self); clearActions(vic);
  self.tfTd = null; self.tfShot = null; self.tfSlide = null; self.guard = null;
  var R = self.r, V = vic.r, side = vic.x >= self.x ? 1 : -1;
  var m = { kind: kind, vicId: vic.id, t: 0, phase: tfIsChoke(kind) ? "squeeze" : "pound", side: side, wob: Math.random() * 10, fromGuard: !!fromGuard,
    ax: tfClamp((self.x + vic.x) / 2, R + V, W - R - V), ay: tfClamp((self.y + vic.y) / 2, (R + V) * 0.95, H - (R + V) * 0.95), bar: 0, n: 0, next: 0.25, tapT: 0 };
  if (tfIsChoke(kind)) {
    var odds = cfg[kind] || { tapBase: 15, tapLowHp: 55 }, hurtFrac = 1 - Math.max(0, Math.min(1, vic.hp / MAX_HP));
    var tapChance = Math.min(95, odds.tapBase + odds.tapLowHp * hurtFrac);
    tapChance = conorTapChance(vic, tapChance, odds); // Conor McGregor taps easier once he's gassed (conor.js)
    m.taps = Math.random() < tapChance / 100;
    m.dur = 2.5 + Math.random() * 1.1;
  } else {
    var ge = cfg.groundElbows || {};
    m.count = ge.count || 4;
  }
  self.tfSub = m;
  vic.choked = true;
  vic.vx = 0; vic.vy = 0; self.vx = 0; self.vy = 0;
  floater((self.x + vic.x) / 2, Math.min(self.y, vic.y) - V - 50, TF_HOLD_NAMES[kind] || "SUBMISSION", "crit");
  playPunch(20);
  if (!reduceMotion) shake = Math.max(shake, 8);
  if (tfIsChoke(kind) && cfg.lines && cfg.lines.subCaught && canSay(self) && Math.random() < 0.5) say(self, cfg.lines.subCaught);
}
function endTfSub(self) {
  var m = self.tfSub;
  if (!m) return;
  var v = balls[m.vicId];
  if (v) v.choked = false;
  self.tfSub = null;
}

// Where the two of them are while he has them.
function tfSubPlace(self, vic, m) {
  var R = self.r, V = vic.r, s = m.side, jit = m.phase === "squeeze" && !reduceMotion ? 1.4 : 0;
  var jx = (Math.random() - 0.5) * jit, jy = (Math.random() - 0.5) * jit;
  if (m.kind === "buggy" || m.kind === "guardElbows") {
    // He's flat on his back underneath, they're on top.
    self.x = m.ax; self.y = m.ay + (R + V) * 0.47;
    vic.x = m.ax + s * V * 0.06 + jx; vic.y = m.ay - (R + V) * 0.47 + jy;
  } else if (m.kind === "darce") {
    // Front headlock: him over their head and shoulder from the side.
    self.x = m.ax + s * (R + V) * 0.45 + jx; self.y = m.ay - R * 0.2 + jy;
    vic.x = m.ax - s * (R + V) * 0.45; vic.y = m.ay + V * 0.16;
  } else {
    // On top: they're on their back, he's mounted.
    vic.x = m.ax; vic.y = m.ay + (R + V) * 0.45;
    self.x = m.ax + jx; self.y = m.ay - (R + V) * 0.45 + jy;
  }
  self.vx = 0; self.vy = 0; vic.vx = 0; vic.vy = 0;
}

function runTfSub(self, other, cfg, dt) {
  var m = self.tfSub, vic = balls[m.vicId];
  if (!self.alive || !vic.alive) { endTfSub(self); if (self.alive) setSpeed(self, self.baseSpeed || SPEED); return false; }
  m.t += dt;
  tfSubPlace(self, vic, m);
  if (m.phase === "pound") {
    // A run of elbows on them, pinned: they can't slip or block these.
    var ge = cfg.groundElbows || {};
    tickElbowAnim(self, vic, dt);
    m.next -= dt;
    if (m.next <= 0 && m.n < m.count && !self.elbowAnim) {
      m.n++;
      m.next = ge.gap || 0.32;
      throwElbow(self, vic, { damage: ge.damage || 6, critChance: ge.critChance || 50, critMult: ge.critMult || 3, source: "finisher", always: true, knockback: 0, speed: 0.24 });
    }
    if (m.n >= m.count && !self.elbowAnim && m.next <= -0.15) tfLetGo(self, vic, m, "GETS UP");
    return true;
  }
  if (m.phase === "squeeze") {
    var p = Math.min(1, m.t / m.dur), sgn = m.taps ? 1 : -1;
    var swing = Math.sin(m.t * 4.4 + m.wob) * Math.sin(m.t * 1.8 + m.wob * 0.5) * 0.55 * (1 - p);
    m.bar = Math.max(-1, Math.min(1, sgn * Math.pow(p, 2.2) + swing));
    if (p < 1) return true;
    m.bar = sgn;
    if (m.taps) { m.phase = "tap"; floater(vic.x, vic.y - vic.r - 30, "TAP", "crit"); playPunch(10); tfCall(self, m.kind); return true; }
    tfLetGo(self, vic, m, "ESCAPE");
    return true;
  }
  m.tapT += dt;
  if (m.tapT >= TF_TAP_TIME) {
    endTfSub(self);
    submit(vic);
  }
  return true;
}
function tfLetGo(self, vic, m, text) {
  floater(vic.x, vic.y - vic.r - 30, text, "note");
  endTfSub(self);
  var dx = vic.x - self.x, dy = vic.y - self.y, d = Math.sqrt(dx * dx + dy * dy) || 1, a = Math.atan2(dy, dx) + (Math.random() - 0.5) * 0.7;
  vic.vx = Math.cos(a) * 340; vic.vy = Math.sin(a) * 340;
  self.vx = -Math.cos(a) * 260; self.vy = -Math.sin(a) * 260;
}

// ---------------------------------------------------------------- won't tap

// Every frame: a choke or armbar on him that's heading for the tap. Partway
// in he decides whether he's tapping; if he refuses, the bar swings back and
// he rips out of it.
function tfWatchSubs(b, cfg) {
  var wt = cfg.wontTap;
  if (!wt || !b.alive) return;
  var o = balls[1 - b.id], hold = null, kind = null;
  if (o.rnc && o.rnc.vicId === b.id) { hold = o.rnc; kind = "rnc"; }
  else if (o.armbar && o.armbar.vicId === b.id) { hold = o.armbar; kind = "armbar"; }
  else if (o.guillo && o.guillo.atkId === b.id && guilloHolding(o.guillo)) { hold = o.guillo; kind = "guillotine"; }
  if (!hold || hold.phase !== "squeeze") return;
  if (hold.tfRolled && hold.t < hold.tfRolledT) hold.tfRolled = false; // re-sunk: a fresh go at it
  if (!hold.taps || hold.tfRolled || hold.t < hold.dur * 0.72) return;
  hold.tfRolled = true; hold.tfRolledT = hold.t;
  var chances = wt.chances || [], chance = b.tfRefusals < chances.length ? chances[b.tfRefusals] : 0;
  if (kind === "armbar" && wt.vsCharlesArmbar && tfIs(o, TF_RIVAL.charles) && !b.tfCharlesArmbar) { chance = 100; b.tfCharlesArmbar = true; }
  if (Math.random() * 100 >= chance) return;
  hold.taps = false; // the bar swings back to the escape (rnc.js, armbar.js, bjj.js)
  b.tfRefusals++;
  b.tfWontTap = { t: 0 };
  floater(b.x, b.y - b.r - 56, "WON'T TAP!", "crit");
  b.flash = 0.16;
  if (!reduceMotion) shake = Math.max(shake, 10);
  crowdReact(1);
  playWontTap();
  if (wt.cost > 0 && b.hp > 1) { // the arm (or the neck) pays for it: a flat cost, no multipliers
    var cost = Math.min(wt.cost, b.hp - 1);
    b.hp -= cost;
    floater(b.x, b.y - b.r - 8, "-" + dmgText(cost), "hit");
  }
  var ln = cfg.lines && cfg.lines.wontTap;
  if (ln) b.tfSays.push({ at: 1.3, text: ln });
}

// ---------------------------------------------------------------- the shell

function tfWantShell(self, other, cfg, gap) {
  var sc = cfg.shell;
  if (!sc || self.tfShellN >= sc.max || self.tfShellCd > 0) return false;
  if (tfRecentHurt(self) >= sc.burst) return true;
  if (other.combo && other.combo.targetId === self.id) return true; // a flurry coming
  return self.tfShellT <= 0 && gap < 70;
}
function startTfShell(self, other, cfg) {
  var sc = cfg.shell;
  clearActions(self);
  self.vx = 0; self.vy = 0;
  self.tfShell = { phase: "in", t: 0, hit: false };
  self.tfShellN++; self.tfShellCd = sc.cooldown || 8; self.tfShellT = tfRand(sc.every);
  self.tfHurtLog = [];
  floater(self.x, self.y - self.r - 30, "TURTLE SHELL!", "crit");
  playShellIn();
  crowdReact(0.5);
  var ln = cfg.lines && cfg.lines.shell;
  if (ln && ln.length && (self.tfShellLines === 0 || Math.random() < 0.5)) {
    say(self, ln[0]);
    if (ln[1] && self.tfShellLines === 0) self.tfSays.push({ at: 3.4, text: ln[1] });
    self.tfShellLines++;
  }
}
function runTfShell(self, other, cfg, dt) {
  var s = self.tfShell, sc = cfg.shell, sp = sc.spin;
  s.t += dt;
  if (s.phase === "in") { self.vx = 0; self.vy = 0; if (s.t >= 0.18) { s.phase = "hold"; s.t = 0; } return true; }
  if (s.phase === "hold") {
    self.vx = 0; self.vy = 0;
    if (s.t >= sc.time) {
      if (sp && other.alive && !over && Math.random() * 100 < sp.chance) {
        var dx = other.x - self.x, dy = other.y - self.y, d = Math.sqrt(dx * dx + dy * dy) || 1;
        s.phase = "spin"; s.t = 0;
        self.vx = dx / d * sp.speed; self.vy = dy / d * sp.speed;
        floater(self.x, self.y - self.r - 30, "SHELL SPIN!", "crit");
        playShellSpin();
      } else { s.phase = "out"; s.t = 0; }
    }
    return true;
  }
  if (s.phase === "spin") {
    // Spinning across the mat like a shell, bouncing off the cage.
    var spd = Math.sqrt(self.vx * self.vx + self.vy * self.vy) || 1, k = Math.max(0.35, 1 - s.t / sp.time * 0.6);
    self.vx = self.vx / spd * sp.speed * k; self.vy = self.vy / spd * sp.speed * k;
    var ox = other.x - self.x, oy = other.y - self.y, od = Math.sqrt(ox * ox + oy * oy) || 1;
    if (!s.hit && other.alive && od < self.r + other.r + 4 && !other.choked && !subLocked(other)) {
      s.hit = true;
      var dealt = hurt(other, sp.damage, "proj", self.id); // like something thrown: it can be slipped or blocked
      if (dealt > 0 && !other.justDodged) {
        playPunch(dealt * 1.4); playShellClank(false);
        floater(other.x, other.y - other.r - 30, "COWABUNGA!", "crit"); // (a Ninja Turtles call-out, not one of his quotes)
        if (!other.grappled && !other.grapple && !other.slam && !other.igbb && !other.koOut) beginWallSlam(other, ox / od, oy / od, { knockback: sp.knockback, wallSlams: sp.wallSlams, slamDamage: sp.slamDamage });
        if (!reduceMotion) shake = Math.max(shake, 12);
        hitStop = Math.max(hitStop, 0.05);
      }
      self.vx = -self.vx * 0.5; self.vy = -self.vy * 0.5;
      checkEnd();
    }
    if (s.t >= sp.time) { s.phase = "out"; s.t = 0; }
    return true;
  }
  // Out of the shell.
  self.vx *= 0.8; self.vy *= 0.8;
  if (s.t >= 0.22) { self.tfShell = null; setSpeed(self, self.baseSpeed || SPEED); return false; }
  return true;
}

// ---------------------------------------------------------------- Kaioken

function tfWantKaioken(self, cfg) {
  var kc = cfg.kaioken;
  if (!kc || self.tfKaio || self.tfKaioN >= kc.max) return false;
  return self.tfKaioT <= 0 || (self.tfKaioN === 0 && self.hp < MAX_HP * kc.lowHp);
}
function startKaiokenPower(self, cfg) {
  var kc = cfg.kaioken;
  clearActions(self);
  self.vx = 0; self.vy = 0;
  self.tfKaioN++;
  self.tfPower = { t: 0, x: kc.x[Math.min(self.tfKaioN - 1, kc.x.length - 1)] };
  floater(self.x, self.y - self.r - 30, "KAIOKEN!", "crit"); // (Goku's power-up from Dragon Ball, not a quote of his)
  tfFlash = 0.35;
  if (!reduceMotion) shake = Math.max(shake, 8);
  crowdReact(0.8);
  playKaiokenUp();
}
function runKaiokenPower(self, other, cfg, dt) {
  var p = self.tfPower, kc = cfg.kaioken;
  p.t += dt;
  self.vx = 0; self.vy = 0;
  if (p.t < TF_POWER) return true;
  self.tfPower = null;
  self.tfKaio = { t: kc.time, x: p.x, max: kc.time };
  self.baseSpeed = self.tfBase.speed * kc.speed;
  self.atkRate = self.tfBase.atk * kc.attack;
  floater(self.x, self.y - self.r - 44, "x" + p.x, "crit");
  setSpeed(self, self.baseSpeed);
  return false;
}
// Every frame: the Kaioken burning down.
function tickKaioken(b, cfg, dt) {
  var k = b.tfKaio;
  if (!k) return;
  k.t -= dt;
  if (k.t > 0 && b.alive && !over) return;
  b.tfKaio = null;
  b.baseSpeed = b.tfBase.speed; b.atkRate = b.tfBase.atk;
  if (b.alive && inOrdinaryMovement(b)) setSpeed(b, b.baseSpeed);
  b.tfKaioT = cfg.kaioken.every ? tfRand(cfg.kaioken.every) : Infinity;
  if (!b.alive || over) return;
  playKaiokenDown();
  // The first time it burns out he's starving: the Burrito Bell ad.
  if (!b.tfAdDone) {
    b.tfAdDone = true;
    var bl = cfg.lines && cfg.lines.bell;
    if (bl && bl.on && bl.text) say(b, bl.text);
    if (cfg.bellAd) startBurritoBellAd(b);
  }
}

// ---------------------------------------------------------------- Katanas (his special)

// From updateSpecial (special.js) for special.move "katana".
function updateKatanas(self, other, dt) {
  var sp = self.char.special;
  if (!self.igbb) {
    if (self.specialT < sp.chargeTime || !canStartIgbb(self, other) || fergusonBusy(self) || self.elbowAnim || swordDuelActive()) return false;
    clearActions(self);
    self.igbb = { move: "katana", phase: "draw", t: 0, n: 0, next: 0, side: 1, crits: 0,
      read: Math.random() * 100 < sp.readChance + (other.char.hasWeave ? 15 : 0) };
    self.specialT = 0;
    floater(self.x, self.y - self.r - 30, "KATANAS!", "crit");
    if (self.igbb.read) floater(other.x, other.y - other.r - 30, "!", "crit");
    playKatanaDraw();
    crowdReact(0.8);
  }
  var m = self.igbb;
  if (m.move !== "katana") return false;
  m.t += dt;
  var dx = other.x - self.x, dy = other.y - self.y, d = Math.sqrt(dx * dx + dy * dy) || 1, ux = dx / d, uy = dy / d, gap = d - self.r - other.r;
  if (over && m.phase !== "sheathe") { m.phase = "sheathe"; m.t = 0; }
  if (m.phase === "draw") {
    // Arms crossed, the blades sliding out of his elbows: the tell.
    self.vx = 0; self.vy = 0;
    if (m.read && other.alive && inOrdinaryMovement(other)) { var bs = Math.max(Math.sqrt(other.vx * other.vx + other.vy * other.vy), 220); other.vx = ux * bs; other.vy = uy * bs; }
    if (m.t >= sp.draw) { m.phase = "close"; m.t = 0; }
    return true;
  }
  if (m.phase === "close") {
    // Hunting them down, slashing with the elbows (he can be hit).
    var spd = (self.baseSpeed || SPEED) * sp.speed * (gap < 6 ? 0.25 : 1);
    if (other.alive) { self.vx = ux * spd; self.vy = uy * spd; }
    tickElbowAnim(self, other, dt);
    m.next -= dt;
    if (m.next <= 0 && !self.elbowAnim && other.alive && gap < sp.reach + 16) {
      m.side = -m.side; m.n++;
      m.next = sp.gap;
      throwElbow(self, other, { damage: sp.damage, critChance: sp.critChance, critMult: sp.critMult, blade: true, side: m.side, ownDraw: true,
        knockback: 110, cut: sp.cut, speed: 0.22, reach: sp.reach + 10, quietCrit: m.crits > 0, // (only the first crit gets its call-out, so the flurry stays readable)
        onLand: function (dealt, crit) { if (crit) m.crits++; } });
    }
    if (m.t >= sp.time || !other.alive) { m.phase = "x"; m.t = 0; if (other.alive) floater(self.x, self.y - self.r - 30, "X SLASH!", "crit"); playKatanaDraw(); }
    return true;
  }
  if (m.phase === "x") {
    // Both blades up crossed, then slashed down through them.
    self.vx = ux * 120; self.vy = uy * 120;
    if (!m.xHit && m.t >= 0.36) {
      m.xHit = true;
      if (other.alive && gap < sp.reach + 24) {
        var crit = Math.random() * 100 < sp.critChance, dealt = hurt(other, sp.finisher * (crit ? sp.critMult : 1), "elbow", self.id);
        if (dealt > 0) {
          if (crit) floater(other.x, other.y - other.r - 44, "CRIT SLASH!", "crit");
          if (sp.cut) openCut(other, Math.atan2(-uy, -ux), sp.cut, self.id);
          elbowSpark(self, other, ux, uy, true, true);
          playElbowHit(dealt, true, true);
          if (!other.justDodged && !other.grappled && !other.slam && !other.koOut) beginWallSlam(other, ux, uy, { knockback: 1100, wallSlams: 1, slamDamage: 4 });
          hitStop = Math.max(hitStop, 0.1);
          if (!reduceMotion) shake = Math.max(shake, 16);
        }
        checkEnd();
      } else if (other.alive) floater(other.x, other.y - other.r - 8, "WHIFF", "dodge");
    }
    if (m.t >= 0.62) { m.phase = "sheathe"; m.t = 0; }
    return true;
  }
  self.vx = 0; self.vy = 0;
  if (m.t >= 0.45) { self.igbb = null; self.elbowAnim = null; if (self.alive) setSpeed(self, self.baseSpeed || SPEED); return false; }
  return true;
}

// ---------------------------------------------------------------- rivals and lines

function tfFightStart(b, cfg) {
  var o = balls[1 - b.id], rv = cfg.rivals || {}, ln = cfg.lines || {}, vs = ln.vs || {};
  if (rv.khabib && tfIs(o, TF_RIVAL.khabib)) {
    // Five times it fell through (theScore's timeline): each one a stamp.
    var reasons = rv.khabib.stamps || [];
    reasons.forEach(function (r, i) { tfStamps.push({ kind: "cancel", text: "CANCELLED", sub: r, t: -0.35 - i * 0.55, max: 4, i: i }); });
    tfStamps.push({ kind: "final", text: rv.khabib.final || "FINALLY!", sub: "", t: -0.35 - reasons.length * 0.55 - 0.1, max: 1.5, i: reasons.length });
  } else if (rv.gaethje && tfIs(o, TF_RIVAL.gaethje)) {
    tfStamps.push({ kind: "rematch", text: "REMATCH", sub: rv.gaethje.label || "", t: -0.3, max: 1.8, i: 0 });
    if (cfg.kaioken) b.tfKaioT = tfRand(rv.gaethje.kaioken || [5, 8]);
  } else if (rv.charles && tfIs(o, TF_RIVAL.charles)) {
    tfStamps.push({ kind: "rematch", text: "REMATCH", sub: rv.charles.label || "", t: -0.3, max: 1.8, i: 0 });
    if (cfg.kaioken) b.tfKaioT = tfRand(rv.charles.kaioken || [5, 8]);
  }
  for (var id in vs) {
    if (tfIs(o, id) && vs[id].start) b.tfSays.push({ at: tfIs(o, TF_RIVAL.khabib) ? 3.6 : 1.2, text: vs[id].start });
  }
}

// Speech bubbles: lines waiting for their moment, rival taunts, the late
// taunt, a line for Khabib's bear, and the win.
function tfLines(b, cfg, dt) {
  var ln = cfg.lines || {}, o = balls[1 - b.id], mine = null;
  for (var id in (ln.vs || {})) if (tfIs(o, id)) mine = ln.vs[id];
  b.tfSays.forEach(function (s) { s.at -= dt; });
  if (b.tfSays.length && b.tfSays[0].at <= 0 && b.alive) {
    if (canSay(b)) say(b, b.tfSays.shift().text); else if (b.tfSays[0].at < -4) b.tfSays.shift();
  }
  if (over) {
    if (!b.tfWinSaid && b.alive && !o.alive && mine && mine.win) { b.tfWinSaid = true; b.tfSays = []; say(b, mine.win); }
    return;
  }
  if (!started || !b.alive) return;
  if (mine && mine.bear && !b.tfBearSaid && typeof ringBear !== "undefined" && ringBear && canSay(b)) { b.tfBearSaid = true; say(b, mine.bear); return; }
  b.tfT = (b.tfT || 0) + dt;
  if (ln.late && !b.tfLateSaid && b.tfT >= ln.late.after && canSay(b) && !fergusonBusy(b)) { b.tfLateSaid = true; say(b, ln.late.text); return; }
  if (mine && mine.taunts && mine.taunts.length) {
    b.tfTauntT -= dt;
    if (b.tfTauntT <= 0 && canSay(b) && !fergusonBusy(b)) { b.tfTauntT = tfRand(ln.tauntEvery || [12, 18]); say(b, pickLine(b, mine.taunts, "tf")); }
  }
}

// The commentator's real call as they tap: calls.<kind> ({ text, who }) for
// that hold, or calls.any for the rest.
function tfCall(b, kind) {
  var cs = tfCfg(b) && tfCfg(b).calls, c = cs && (cs[kind] || cs.any);
  if (c && c.text && typeof announce === "function") announce(c.text, { who: c.who || "COMMENTARY" });
}

// ---------------------------------------------------------------- his death

// From startDeathFx (death.js): instead of blowing up on the spot, he gets
// dizzy, wanders to the middle of the cage, trips over a TV cable, falls flat
// on his face and then blows up. Only for him.
var TF_TRIP = 0.32, TF_FALL = 0.42, TF_LIE = 0.45, TF_BOOM = 1.7;
function fergusonDeathFx(b) {
  var cfg = tfCfg(b);
  if (!cfg || !cfg.death || deathFx || !lastArenaXf) return false;
  var cx = W / 2, cy = H / 2, dist = Math.sqrt((b.x - cx) * (b.x - cx) + (b.y - cy) * (b.y - cy));
  var walk = tfClamp(dist / 230, 0.9, 1.8);
  DEATH_LEN.cabletrip = walk + TF_TRIP + TF_FALL + TF_LIE + TF_BOOM;
  var camLeft = b.x > cx; // the TV camera sits on the far side from where he starts
  deathFx = {
    style: "cabletrip", t: 0, id: b.id, x: b.x, y: b.y, r: b.r, color: b.char.color, look: b.char.look, name: b.char.name,
    sx: b.x, sy: b.y, cx: cx, cy: cy + b.r * 0.25, walk: walk, camLeft: camLeft, dirX: camLeft ? -1 : 1, dirY: 0,
    snap: snapFighter(b), after: null, boomed: false, shards: null, sound: {}
  };
  deathFx.last = performance.now();
  playTripWobble();
  return true;
}
// From drawDeathFx (death.js) for his style. dt has already been added to f.t.
function drawCableTrip(f, dt) {
  var t = f.t, r = f.r;
  drawTvCable(f, t);
  var walkEnd = f.walk, tripEnd = walkEnd + TF_TRIP, fallEnd = tripEnd + TF_FALL, lieEnd = fallEnd + TF_LIE;
  if (t < walkEnd) {
    // Staggering about on wobbly legs, seeing stars, toward the middle.
    var k = t / f.walk, e = k * k * (3 - 2 * k), wob = Math.sin(t * 9) * r * 0.35 * (1 - k * 0.5);
    var x = f.sx + (f.cx - f.sx) * e + Math.cos(t * 5.3) * wob * 0.6, y = f.sy + (f.cy - f.sy) * e + Math.sin(t * 9) * r * 0.12;
    f.x = x; f.y = y;
    tfDeathFighter(f, x, y, Math.sin(t * 9) * 0.22, 1);
    tfDeathStars(f, x, y, t);
    if (!f.sound.step || t - f.sound.step > 0.28) { f.sound.step = t; playTripStep(); }
    return;
  }
  if (t < tripEnd) {
    // The foot catches the cable: he pitches forward, arms flailing.
    var u = (t - walkEnd) / TF_TRIP;
    if (!f.sound.trip) { f.sound.trip = true; playTripCatch(); floater(f.x, f.y - r - 30, "TRIPPED!", "crit"); }
    tfDeathFighter(f, f.x + f.dirX * u * r * 0.3, f.y - Math.sin(u * Math.PI) * r * 0.25, f.dirX * u * 0.6, 1);
    tfDeathStars(f, f.x, f.y, t);
    return;
  }
  if (t < lieEnd) {
    // Down he goes, flat on his face (we see his back), and lies there.
    var v = Math.min(1, (t - tripEnd) / TF_FALL), ex = f.x + f.dirX * r * (0.3 + 0.5 * v);
    if (v >= 1 && !f.sound.thud) { f.sound.thud = true; playTripThud(); if (!reduceMotion) shake = Math.max(shake, 9); }
    var rot = f.dirX * (0.6 + v * 0.97), sq = v >= 1 ? 1 - 0.12 * Math.max(0, 1 - (t - fallEnd) / 0.2) : 1;
    tfDeathFighter(f, ex, f.y + v * r * 0.15, rot, sq, v > 0.5);
    f.lx = ex; f.ly = f.y + v * r * 0.15;
    if (t > fallEnd) { var b2 = (t - fallEnd) / TF_LIE; ctx.save(); ctx.globalAlpha = 0.6 * b2; ctx.fillStyle = "#ffffff"; ctx.beginPath(); ctx.arc(f.lx, f.ly, r * (1 + 0.1 * b2), 0, Math.PI * 2); ctx.fill(); ctx.restore(); }
    return;
  }
  // Then he blows up, the normal blast, right where he lies.
  if (!f.boom) {
    f.boom = { style: "instant", t: 0, id: f.id, x: f.lx, y: f.ly, r: r, color: f.color, dirX: f.dirX, dirY: 0, snap: f.snap, boomed: false, shards: null };
    playDeathBoom("instant");
  }
  f.boom.t += dt;
  drawExplode(f.boom, dt);
}
// Him, drawn live (not the snapshot) so he can stagger, pitch and fall.
function tfDeathFighter(f, x, y, rot, sq, back) {
  ctx.save();
  ctx.translate(x, y + f.r); ctx.rotate(rot); ctx.scale(1, sq || 1); ctx.translate(-x, -(y + f.r));
  if (f.look) {
    drawFighterArt(ctx, x, y, f.r, back ? Object.assign({}, f.look, { backView: true }) : f.look, theme.wall, { layout: "contained", name: f.name });
    if (back) drawCucuyBack(x, y, f.r, f.look); // face down: the cross and wings on his back
  } else { ctx.fillStyle = f.color; ctx.beginPath(); ctx.arc(x, y, f.r, 0, Math.PI * 2); ctx.fill(); }
  ctx.lineWidth = 3; ctx.strokeStyle = theme.wall; ctx.beginPath(); ctx.arc(x, y, f.r, 0, Math.PI * 2); ctx.stroke();
  ctx.restore();
}
function tfDeathStars(f, x, y, t) {
  for (var i = 0; i < 4; i++) {
    var a = t * 6 + i * Math.PI / 2;
    drawStar(x + Math.cos(a) * f.r * 0.8, y - f.r * 1.08 + Math.sin(a) * f.r * 0.24, f.r * 0.16, i % 2 ? "#ffd23f" : "#ffffff");
  }
}
// The TV camera on its tripod at the cage, and its cable snaking across the
// middle of the mat.
function drawTvCable(f, t) {
  var a = Math.min(1, t / 0.3), camX = f.camLeft ? 26 : W - 26, camY = f.cy + 6, farX = f.camLeft ? W - 6 : 6;
  ctx.save();
  ctx.globalAlpha = a;
  ctx.lineCap = "round"; ctx.lineJoin = "round";
  var pts = [];
  for (var i = 0; i <= 24; i++) {
    var u = i / 24, x = camX + (farX - camX) * u;
    pts.push({ x: x, y: camY + 8 + Math.sin(u * 7 + 1) * 12 * (1 - Math.abs(u - 0.5)) + Math.sin(u * 19) * 3 });
  }
  [["#0b0b0b", 7], ["#2b2b2b", 4]].forEach(function (pass) {
    ctx.strokeStyle = pass[0]; ctx.lineWidth = pass[1];
    ctx.beginPath(); pts.forEach(function (p, k) { if (k) ctx.lineTo(p.x, p.y); else ctx.moveTo(p.x, p.y); }); ctx.stroke();
  });
  // tripod legs and the camera
  ctx.strokeStyle = "#1b1b1b"; ctx.lineWidth = 3;
  [-1, 0, 1].forEach(function (s) { ctx.beginPath(); ctx.moveTo(camX, camY - 18); ctx.lineTo(camX + s * 13, camY + 12); ctx.stroke(); });
  var face = f.camLeft ? 1 : -1;
  ctx.fillStyle = "#2a2d31"; ctx.strokeStyle = "#0b0b0b"; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.roundRect(camX - 15, camY - 34, 30, 18, 3); ctx.fill(); ctx.stroke();
  ctx.fillStyle = "#4a5058"; ctx.beginPath(); ctx.roundRect(camX + face * 13, camY - 31, face * 10, 12, 2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = Math.floor(tfClock * 3) % 2 ? "#ff2a2a" : "#7a1010"; // the tally light: it's live
  ctx.beginPath(); ctx.arc(camX - face * 9, camY - 30, 2.4, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

// ---------------------------------------------------------------- drawing

// Under the fighters: the slide's afterimages. From draw().
function drawFergusonUnder() {
  tfGhosts.forEach(function (g) {
    var k = g.t / g.max;
    ctx.save();
    ctx.globalAlpha = 0.32 * (1 - k);
    ctx.fillStyle = g.color;
    ctx.beginPath(); ctx.arc(g.x, g.y, g.r * (1 - 0.15 * k), 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  });
}

// Behind him: the Kaioken's red aura. From draw().
function drawFergusonBehind(b) {
  if (!b.alive || !(b.tfKaio || b.tfPower)) return;
  var r = b.r, t = performance.now() / 1000, burst = b.tfPower ? Math.min(1, b.tfPower.t / TF_POWER) : 1;
  var fade = b.tfKaio ? Math.min(1, b.tfKaio.t / 0.5) : burst, sc = b.tfPower ? 0.7 + 0.5 * easeOut(burst) : 1;
  var pulse = 0.5 + 0.5 * Math.sin(t * 15);
  ctx.save();
  ctx.globalAlpha = fade;
  [[1.0 * sc, 0.0], [0.78 * sc, 1.1], [0.58 * sc, 2.0]].forEach(function (L, li) {
    ctx.beginPath();
    saiyanFlamePath(b.x, b.y, r * L[0], t, L[1], li); // the same flame shape as Charles's aura (dobronx.js)
    var g = ctx.createLinearGradient(0, b.y + r * 1.3, 0, b.y - r * 2.8);
    if (li === 0) {
      g.addColorStop(0, "rgba(200,10,10,0.6)"); g.addColorStop(0.5, "rgba(235,30,30,0.5)"); g.addColorStop(1, "rgba(255,90,70,0.25)");
      ctx.fillStyle = g; ctx.shadowColor = "rgba(255,20,20,0.9)"; ctx.shadowBlur = 18 + 10 * pulse; ctx.fill(); ctx.shadowBlur = 0;
      ctx.lineWidth = 2.5; ctx.lineJoin = "round"; ctx.strokeStyle = "rgba(150,0,0," + (0.65 + 0.25 * pulse) + ")"; ctx.stroke();
    } else if (li === 1) {
      g.addColorStop(0, "rgba(255,60,40,0.6)"); g.addColorStop(1, "rgba(255,120,90,0.3)"); ctx.fillStyle = g; ctx.fill();
    } else {
      g.addColorStop(0, "rgba(255,220,210,0.75)"); g.addColorStop(1, "rgba(255,200,190,0)"); ctx.fillStyle = g; ctx.fill();
    }
  });
  ctx.lineCap = "round";
  for (var k = 0; k < 10; k++) {
    var p = (t * 1.7 + k * 0.137 + (k % 3) * 0.29) % 1, sx = b.x + Math.sin(k * 2.39) * r * 1.05, sy = b.y + r * 0.9 - p * r * 4.0;
    ctx.strokeStyle = "rgba(255,210,200," + (0.85 * Math.sin(p * Math.PI)) + ")"; ctx.lineWidth = 2 + (k % 2);
    ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(sx, sy - r * 0.4); ctx.stroke();
  }
  ctx.restore();
}

// From draw(), with the other body poses: flat on his back in his holds,
// leaning into the slide, crouched for the shot; and whoever he's got.
function applyFergusonPose(b) {
  var m = b.tfSub, s;
  if (m && (m.kind === "buggy" || m.kind === "guardElbows")) {
    ctx.translate(b.x, b.y); ctx.rotate(m.kind === "guardElbows" ? Math.PI : -m.side * Math.PI / 2); ctx.translate(-b.x, -b.y);
    return;
  }
  var tony = balls[1 - b.id];
  if (tony && tony.tfSub && tony.tfSub.vicId === b.id) {
    var tm = tony.tfSub;
    if (tm.kind === "groundElbows") { ctx.translate(b.x, b.y); ctx.rotate(tm.side * Math.PI / 2); ctx.translate(-b.x, -b.y); }
    else if (tm.kind === "darce") { ctx.translate(b.x, b.y + b.r); ctx.rotate(tm.side * 0.55); ctx.scale(1, 0.92); ctx.translate(-b.x, -(b.y + b.r)); }
    return;
  }
  if (tony && tony.tfTd && tony.tfTd.vicId === b.id) {
    var tk = Math.min(1, tony.tfTd.t / 0.3);
    ctx.translate(b.x, b.y + b.r); ctx.rotate(Math.atan2(tony.tfTd.uy, tony.tfTd.ux) > 0 ? tk * 0.9 : -tk * 0.9); ctx.translate(-b.x, -(b.y + b.r));
    return;
  }
  if (b.tfSlide && (s = b.tfSlide.lean)) {
    ctx.translate(b.x, b.y + b.r); ctx.rotate(s * 0.16); ctx.translate(-b.x, -(b.y + b.r));
  } else if (b.tfShot) {
    var lv = b.tfShot.phase === "level" ? Math.min(1, b.tfShot.t / 0.12) : 1;
    ctx.translate(b.x, b.y + b.r); ctx.scale(1 + 0.08 * lv, 1 - 0.16 * lv); ctx.translate(-b.x, -(b.y + b.r));
  } else if (b.tfShell) {
    ctx.translate(b.x, b.y + b.r); ctx.scale(1.04, 0.94); ctx.translate(-b.x, -(b.y + b.r));
  }
}

// From draw(), per fighter after its hands: his arms in every move of his,
// the shell, the Kaioken's red glow over him, a cut.
function drawFerguson(b, other) {
  if (!b.alive) return;
  var cfg = tfCfg(b);
  if (!cfg && !katanaOn(b)) return;
  var ang = Math.atan2(other.y - b.y, other.x - b.x), r = b.r, size = (b.char.punch && b.char.punch.size) || 14;
  if (b.tfKaio || b.tfPower) {
    // Red all over, throbbing.
    ctx.save();
    ctx.globalAlpha = 0.18 + 0.1 * Math.sin(performance.now() / 70);
    ctx.fillStyle = "#ff1a1a"; ctx.beginPath(); ctx.arc(b.x, b.y, r, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
  if (b.tfShell) { drawTfShell(b); return; }
  if (katanaOn(b)) { drawTfKatanas(b, other, ang); return; }
  if (b.tfPower) {
    // Fists clenched down at his sides, trembling, as it bursts on.
    var tr = Math.sin(performance.now() / 22) * 1.6;
    [-1, 1].forEach(function (s) {
      var sx = b.x + s * r * 0.62, sy = b.y - r * 0.1, hx = b.x + s * r * 1.02 + tr, hy = b.y + r * 0.62;
      strokeLimb(size * 0.66, armColor(b.char, s), function () { ctx.moveTo(sx, sy); ctx.lineTo(hx, hy); });
      drawGloveAt(hx, hy, size * 0.82, b.char);
    });
    return;
  }
  if (b.tfSlide) {
    // His walkout shuffle: arms hanging loose, swinging as he slides.
    var sw = Math.sin(b.tfSlide.t * 22) * 0.5;
    [-1, 1].forEach(function (s, i) {
      var sx = b.x + s * r * 0.6, sy = b.y - r * 0.05, a = Math.PI / 2 + s * 0.35 + (i ? sw : -sw) + b.tfSlide.lean * 0.4;
      var hx = b.x + s * r * 0.55 + Math.cos(a) * r * 0.75, hy = b.y + Math.sin(a) * r * 0.95;
      strokeLimb(size * 0.6, armColor(b.char, s), function () { ctx.moveTo(sx, sy); ctx.lineTo(hx, hy); });
      drawGloveAt(hx, hy, size * 0.72, b.char);
    });
    return;
  }
  if (b.tfShot || b.tfTd) {
    // Shooting low with both arms out for the legs, then wrapped round them.
    var ux = Math.cos(ang), uy = Math.sin(ang), px = -uy, py = ux, wrap = !!b.tfTd;
    [-1, 1].forEach(function (s) {
      var sx = b.x + px * s * r * 0.5 + ux * r * 0.2, sy = b.y + py * s * r * 0.5 + uy * r * 0.2;
      var hx = b.x + ux * r * (wrap ? 1.55 : 1.35) + px * s * r * (wrap ? 0.55 : 0.4), hy = b.y + uy * r * (wrap ? 1.55 : 1.35) + py * s * r * (wrap ? 0.55 : 0.4) + r * 0.25;
      strokeLimb(size * 0.62, armColor(b.char, s), function () { ctx.moveTo(sx, sy); ctx.lineTo(hx, hy); });
      drawGloveAt(hx, hy, size * 0.72, b.char, ang);
    });
    return;
  }
  if (b.tfWontTap) {
    var wk = b.tfWontTap.t;
    ctx.save();
    ctx.globalAlpha = Math.max(0, 1 - wk / 1.6);
    ctx.strokeStyle = TF_RED; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.arc(b.x, b.y, r + 8 + wk * 30, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
  }
}

// The turtle shell: a green domed shell over him, scutes and a pale rim, his
// headband's tails sticking out the back. Spinning, it whirls round.
function drawTfShell(b) {
  var s = b.tfShell, r = b.r, k = s.phase === "in" ? Math.min(1, s.t / 0.18) : s.phase === "out" ? Math.max(0, 1 - s.t / 0.22) : 1;
  var spin = s.phase === "spin" ? performance.now() / 40 : 0;
  ctx.save();
  ctx.translate(b.x, b.y); ctx.rotate(spin); ctx.scale(0.6 + 0.4 * k, 0.6 + 0.4 * k);
  ctx.globalAlpha = Math.min(1, k * 1.5);
  // headband tails
  if (!spin) {
    ctx.strokeStyle = TF_BAND; ctx.lineWidth = 5; ctx.lineCap = "round";
    var fl = Math.sin(performance.now() / 90) * 4;
    ctx.beginPath(); ctx.moveTo(r * 0.5, -r * 0.8); ctx.quadraticCurveTo(r * 0.95, -r * 1.05 + fl, r * 1.25, -r * 0.9 + fl); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(r * 0.45, -r * 0.8); ctx.quadraticCurveTo(r * 0.85, -r * 0.85 - fl, r * 1.15, -r * 0.62 - fl); ctx.stroke();
  }
  var g = ctx.createRadialGradient(-r * 0.3, -r * 0.4, r * 0.1, 0, 0, r * 1.15);
  g.addColorStop(0, TF_SHELL.light); g.addColorStop(0.55, TF_SHELL.mid); g.addColorStop(1, TF_SHELL.dark);
  ctx.fillStyle = TF_SHELL.rim; ctx.strokeStyle = theme.wall; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.ellipse(0, 0, r * 1.14, r * 1.08, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.ellipse(0, -r * 0.02, r * 1.0, r * 0.94, 0, 0, Math.PI * 2); ctx.fill();
  // the scutes: a hexagon in the middle, a ring of plates round it
  ctx.strokeStyle = "rgba(10,40,12,0.75)"; ctx.lineWidth = 2.2; ctx.lineJoin = "round";
  ctx.beginPath();
  for (var i = 0; i < 6; i++) { var a = i / 6 * Math.PI * 2 + Math.PI / 6; ctx.lineTo(Math.cos(a) * r * 0.36, Math.sin(a) * r * 0.36 - r * 0.02); }
  ctx.closePath(); ctx.stroke();
  for (var j = 0; j < 6; j++) {
    var a2 = j / 6 * Math.PI * 2 + Math.PI / 6;
    ctx.beginPath(); ctx.moveTo(Math.cos(a2) * r * 0.36, Math.sin(a2) * r * 0.36 - r * 0.02); ctx.lineTo(Math.cos(a2) * r * 0.92, Math.sin(a2) * r * 0.86); ctx.stroke();
  }
  ctx.fillStyle = "rgba(255,255,255,0.22)";
  ctx.beginPath(); ctx.ellipse(-r * 0.32, -r * 0.45, r * 0.3, r * 0.14, -0.5, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  if (s.phase === "spin" && !reduceMotion) {
    // whirl lines
    ctx.save(); ctx.strokeStyle = "rgba(255,255,255,0.7)"; ctx.lineWidth = 2.5; ctx.lineCap = "round";
    for (var q = 0; q < 3; q++) { var a3 = spin * 1.3 + q * 2.1; ctx.beginPath(); ctx.arc(b.x, b.y, r * 1.3, a3, a3 + 0.9); ctx.stroke(); }
    ctx.restore();
  }
}

// Both elbows with a katana coming out of each: crossed on the draw, then in
// guard with one slashing, then crossed high for the X-slash.
function drawTfKatanas(b, other, ang) {
  var m = b.igbb, len = m.phase === "draw" ? easeOut(m.t / b.char.special.draw) * 1.15 : m.phase === "sheathe" ? Math.max(0, 1 - m.t / 0.4) * 1.15 : 1.15;
  if (m.phase === "draw" || m.phase === "x") {
    // Arms crossed in front of his face, elbows out, blades out to the sides.
    var lift = m.phase === "x" ? (m.t < 0.36 ? -0.4 * easeOut(m.t / 0.36) : -0.4 + 1.1 * Math.min(1, (m.t - 0.36) / 0.12)) : 0;
    [-1, 1].forEach(function (s) { drawElbowArm(b, ang + lift * s, s, -1, true, m.phase === "x" && m.t < 0.36 ? 0.5 + 0.5 * Math.sin(performance.now() / 40) : 0, len); });
    if (m.phase === "draw" && m.t < 0.5) { // the glint as they slide out
      ctx.save(); ctx.globalAlpha = 1 - m.t / 0.5; ctx.fillStyle = "#ffffff";
      [-1, 1].forEach(function (s) { var p = elbowPose(b, ang, s, -1); ctx.beginPath(); ctx.arc(p.el.x, p.el.y, 7 + m.t * 20, 0, Math.PI * 2); ctx.fill(); });
      ctx.restore();
    }
    return;
  }
  var e = b.elbowAnim, slashing = e && e.ownDraw ? e : null;
  [-1, 1].forEach(function (s) {
    if (slashing && slashing.side === s) {
      var p = Math.min(1, slashing.t / slashing.dur);
      drawElbowTrail(b, ang, s, p, true);
      drawElbowArm(b, ang, s, p, true, slashing.hit && slashing.crit ? Math.max(0, 1 - (slashing.t - slashing.dur * ELBOW_HIT) / 0.15) : 0, len);
    } else drawElbowArm(b, ang, s, -1, true, 0, len);
  });
}

// Over both fighters: his holds (arms, legs, the tug-of-war bar), and the
// stamps at the start. From draw().
function drawFergusonOver() {
  balls.forEach(function (b) {
    var m = b.tfSub;
    if (!m || !b.alive) return;
    var vic = balls[m.vicId];
    if (m.kind === "buggy") drawTfBuggy(b, vic, m);
    else if (m.kind === "darce") drawTfDarce(b, vic, m);
    else if (m.kind === "groundElbows") drawTfMountLegs(b, vic, m);
    else if (m.kind === "guardElbows") drawTfGuardLegs(b, vic, m);
    if (tfIsChoke(m.kind)) drawTfBar(b, vic, m);
  });
  if (tfFlash > 0) {
    ctx.save(); ctx.globalAlpha = tfFlash / 0.35 * 0.35; ctx.fillStyle = "#ff1a1a"; ctx.fillRect(0, 0, W, H); ctx.restore();
  }
  drawTfStamps();
}

function tfSkin(b) { return b.char.look ? b.char.look.skin : b.char.color; } // plain skin for his holds (no sleeve texture)
function tfSqueeze(m) { return m.phase === "tap" ? 1 : Math.max(0, m.bar); }
function tfRedFace(vic, squeeze) {
  if (squeeze <= 0) return;
  ctx.save();
  ctx.beginPath(); ctx.arc(vic.x, vic.y, vic.r, 0, Math.PI * 2); ctx.clip();
  ctx.globalAlpha = 0.55 * squeeze; ctx.fillStyle = "#d62020";
  ctx.beginPath(); ctx.arc(vic.x, vic.y - vic.r * 0.66, vic.r * 0.38, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}
// Their glove pawing at his arm, patting it three times when they tap.
function tfVicHand(vic, m, x, y) {
  var pat = m.phase === "tap" ? Math.abs(Math.sin(m.tapT / TF_TAP_TIME * Math.PI * 3)) * vic.r * 0.25 : Math.sin(m.t * 9 + m.wob) * vic.r * 0.04;
  drawGloveAt(x, y - pat, vic.r * 0.22, vic.char);
}

// The buggy choke: flat on his back underneath them, one arm wrapped over
// the back of their neck, hands clasped, and a leg swung up over his own
// wrist to tighten it.
function drawTfBuggy(b, vic, m) {
  var V = vic.r, R = b.r, s = m.side, sq = tfSqueeze(m), limb = R * 0.2, skin = tfSkin(b);
  var nx = vic.x, ny = vic.y - V * 0.32, rx = V * (0.92 - 0.08 * sq), ry = V * (0.42 - 0.05 * sq);
  tfRedFace(vic, sq);
  ctx.save();
  // the arm: up from his shoulder, over the back of their neck and round
  var sh = { x: b.x - s * R * 0.5, y: b.y - R * 0.42 };
  var clasp = { x: nx + s * rx * 0.25, y: ny + ry * 0.95 };
  strokeLimb(limb, skin, function () {
    ctx.moveTo(sh.x, sh.y);
    ctx.quadraticCurveTo(nx - s * rx * 1.15, ny + ry * 0.6, nx - s * rx, ny);
    ctx.quadraticCurveTo(nx - s * rx, ny - ry * 1.1, nx, ny - ry * 1.1);
    ctx.quadraticCurveTo(nx + s * rx, ny - ry * 1.1, nx + s * rx, ny);
    ctx.quadraticCurveTo(nx + s * rx, ny + ry * 0.9, clasp.x, clasp.y);
  });
  drawGloveAt(clasp.x, clasp.y, R * 0.24, b.char);
  // the leg up over his own wrist
  drawBjjLeg(b.char, { x: b.x + s * R * 0.55, y: b.y - R * 0.05 }, { x: b.x + s * R * 1.35, y: vic.y - V * 0.45 }, { x: clasp.x + s * V * 0.05, y: clasp.y - V * 0.08 }, limb, s * 1.1, R * 0.2);
  tfVicHand(vic, m, vic.x - s * V * 0.55, vic.y + V * 0.2);
  ctx.restore();
}
// The D'Arce: from the front headlock, one arm threaded under their neck and
// out through their armpit, gripping his other arm across the back of it.
function drawTfDarce(b, vic, m) {
  var V = vic.r, R = b.r, s = m.side, sq = tfSqueeze(m), limb = R * 0.2, skin = tfSkin(b);
  var tilt = s * 0.55, hx = vic.x + Math.sin(tilt) * V * 0.62, hy = vic.y - Math.cos(tilt) * V * 0.62;
  tfRedFace(vic, sq);
  ctx.save();
  var c = 1 - 0.08 * sq;
  // threaded arm: under the chin, round the far side, out by the armpit
  strokeLimb(limb, skin, function () {
    ctx.moveTo(b.x - s * R * 0.35, b.y + R * 0.35);
    ctx.quadraticCurveTo(hx + s * V * 0.1, hy + V * 0.55 * c, hx - s * V * 0.5 * c, hy + V * 0.25);
    ctx.quadraticCurveTo(hx - s * V * 0.72 * c, hy - V * 0.1, hx - s * V * 0.38, hy - V * 0.48 * c);
  });
  var grip = { x: hx - s * V * 0.25, y: hy - V * 0.52 * c };
  // the other arm over the top of their head to meet it
  strokeLimb(limb, skin, function () {
    ctx.moveTo(b.x - s * R * 0.2, b.y - R * 0.45);
    ctx.quadraticCurveTo(hx + s * V * 0.2, hy - V * 0.75 * c, grip.x, grip.y);
  });
  drawGloveAt(grip.x, grip.y, R * 0.23, b.char);
  drawGloveAt(hx - s * V * 0.4, hy - V * 0.46 * c, R * 0.2, b.char);
  tfVicHand(vic, m, vic.x - s * V * 0.7, vic.y + V * 0.35);
  ctx.restore();
}
// Mounted: his knees down either side of them.
function drawTfMountLegs(b, vic, m) {
  var R = b.r, V = vic.r, limb = R * 0.2;
  [-1, 1].forEach(function (s) {
    drawBjjLeg(b.char, { x: b.x + s * R * 0.45, y: b.y + R * 0.55 }, { x: vic.x + s * V * 1.12, y: vic.y - V * 0.15 }, { x: vic.x + s * V * 0.85, y: vic.y + V * 0.55 }, limb, -s * 0.9, R * 0.2);
  });
}
// On his back with them in his guard: legs wrapped round their waist,
// crossed behind them.
function drawTfGuardLegs(b, vic, m) {
  var R = b.r, V = vic.r, limb = R * 0.2;
  [-1, 1].forEach(function (s) {
    drawBjjLeg(b.char, { x: b.x + s * R * 0.48, y: b.y - R * 0.55 }, { x: vic.x + s * V * 1.12, y: vic.y + V * 0.1 }, { x: vic.x - s * V * 0.25, y: vic.y - V * 0.55 }, limb, s * 0.8, R * 0.2);
  });
}
// The tug-of-war bar: his colour is the choke, theirs the escape.
function drawTfBar(b, vic, m) {
  var bw = 150, bh = 12, bx = Math.min(W - bw - 6, Math.max(6, vic.x - bw / 2)), by = Math.min(b.y, vic.y) - Math.max(b.r, vic.r) - 64;
  if (by < 8) by = Math.max(b.y, vic.y) + Math.max(b.r, vic.r) + 30;
  var split = bw * (m.bar + 1) / 2;
  ctx.save();
  ctx.fillStyle = b.char.color; ctx.fillRect(bx, by, split, bh);
  ctx.fillStyle = vic.char.color; ctx.fillRect(bx + split, by, bw - split, bh);
  ctx.lineWidth = 2.5; ctx.strokeStyle = theme.wall; ctx.strokeRect(bx, by, bw, bh);
  ctx.fillStyle = theme.ink; ctx.fillRect(bx + split - 2, by - 4, 4, bh + 8);
  ctx.restore();
}

// Rubber stamps slamming onto the middle of the cage at the start: five
// CANCELLED against Khabib, REMATCH against Gaethje and Charles.
function drawTfStamps() {
  tfStamps.forEach(function (s) {
    if (s.t < 0) return;
    var pop = Math.min(1, s.t / 0.12), sc = 1.9 - 0.9 * easeOut(pop), fade = Math.max(0, Math.min(1, (s.max - s.t) / 0.35));
    var col = s.kind === "cancel" ? "#d81b25" : s.kind === "final" ? "#f2c200" : "#e8eef2";
    var y = H * 0.4, rot = s.kind === "cancel" ? (s.i % 2 ? 0.1 : -0.14) : -0.08;
    // One stamp on screen at a time: each one goes as the next slams down.
    if (tfStamps.some(function (o) { return o !== s && o.i > s.i && o.t >= 0; })) return;
    ctx.save();
    ctx.globalAlpha = fade;
    ctx.translate(W / 2, y); ctx.rotate(rot); ctx.scale(sc, sc);
    ctx.font = "900 38px Impact, 'Arial Black', sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    var w = ctx.measureText(s.text).width + 26;
    ctx.lineWidth = 5; ctx.strokeStyle = col; ctx.lineJoin = "round";
    ctx.strokeRect(-w / 2, -27, w, s.sub ? 74 : 54);
    ctx.lineWidth = 7; ctx.strokeStyle = "#16211f"; ctx.strokeText(s.text, 0, 0);
    ctx.fillStyle = col; ctx.fillText(s.text, 0, 0);
    if (s.sub) {
      ctx.font = "800 20px \"Barlow Condensed\", \"Arial Narrow\", sans-serif";
      ctx.lineWidth = 4; ctx.strokeText(s.sub, 0, 31); ctx.fillStyle = "#ffffff"; ctx.fillText(s.sub, 0, 31);
    }
    ctx.restore();
  });
}

// ---------------------------------------------------------------- his look

// From the head layer (fighter-art.js): his thick moustache and his red
// karate-style headband with the knot's tails flying out by his ear.
function drawCucuyHead(c, r, look, line, lw) {
  var mc = look.beardColor || look.hairColor || "#141010";
  if (look.cucuy.moustache) {
    c.save();
    c.fillStyle = mc;
    c.beginPath();
    c.moveTo(-r * 0.24, -r * 0.34);
    c.quadraticCurveTo(-r * 0.2, -r * 0.46, 0, -r * 0.45);
    c.quadraticCurveTo(r * 0.2, -r * 0.46, r * 0.24, -r * 0.34);
    c.quadraticCurveTo(r * 0.26, -r * 0.28, r * 0.22, -r * 0.24); // the ends drooping down past the corners of the mouth
    c.quadraticCurveTo(r * 0.14, -r * 0.36, 0, -r * 0.37);
    c.quadraticCurveTo(-r * 0.14, -r * 0.36, -r * 0.22, -r * 0.24);
    c.quadraticCurveTo(-r * 0.26, -r * 0.28, -r * 0.24, -r * 0.34);
    c.closePath(); c.fill();
    c.strokeStyle = shadeHex(mc.charAt(0) === "#" ? mc : "#141010", 0.25); c.lineWidth = lw(0.01); c.globalAlpha = 0.6;
    for (var i = -4; i <= 4; i++) { c.beginPath(); c.moveTo(i * r * 0.045, -r * 0.44); c.lineTo(i * r * 0.05, -r * 0.38); c.stroke(); }
    c.restore();
  }
  var hb = look.cucuy.headband;
  if (hb) {
    var col = hb.color || TF_BAND;
    var band = function () {
      c.beginPath();
      c.moveTo(-r, -r * 0.66); c.quadraticCurveTo(0, -r * 0.92, r, -r * 0.66);
      c.lineTo(r, -r * 0.55); c.quadraticCurveTo(0, -r * 0.8, -r, -r * 0.55);
      c.closePath();
    };
    c.save();
    c.fillStyle = col; band(); c.fill();
    c.save(); band(); c.clip();
    c.fillStyle = "rgba(0,0,0,0.18)"; c.fillRect(-r, -r * 0.66, r * 2, r * 0.035);
    c.fillStyle = "rgba(255,255,255,0.18)"; c.fillRect(-r, -r * 0.86, r * 2, r * 0.05);
    c.restore();
    c.strokeStyle = line; c.lineWidth = lw(0.025); band(); c.stroke();
    // the knot and its two tails, by his left ear
    c.fillStyle = col; c.strokeStyle = line; c.lineWidth = lw(0.02);
    c.beginPath(); c.ellipse(-r * 0.86, -r * 0.6, r * 0.07, r * 0.06, 0, 0, Math.PI * 2); c.fill(); c.stroke();
    c.beginPath(); c.moveTo(-r * 0.88, -r * 0.62); c.quadraticCurveTo(-r * 1.08, -r * 0.6, -r * 1.2, -r * 0.42); c.lineTo(-r * 1.1, -r * 0.38); c.quadraticCurveTo(-r * 1.0, -r * 0.52, -r * 0.84, -r * 0.55); c.closePath(); c.fill(); c.stroke();
    c.beginPath(); c.moveTo(-r * 0.86, -r * 0.57); c.quadraticCurveTo(-r * 1.0, -r * 0.44, -r * 1.02, -r * 0.26); c.lineTo(-r * 0.93, -r * 0.27); c.quadraticCurveTo(-r * 0.92, -r * 0.42, -r * 0.8, -r * 0.52); c.closePath(); c.fill(); c.stroke();
    c.restore();
  }
}

// His back (face down after the cable trip): the big cross with wings
// across it (bodyartguru.com/tony-ferguson-tattoos), and the back of his
// headband with the knot.
function drawCucuyBack(x, y, r, look) {
  var ink = "rgba(22,24,34,0.72)";
  ctx.save();
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.clip();
  ctx.translate(x, y - r * 0.08);
  ctx.fillStyle = ink; ctx.strokeStyle = ink; ctx.lineCap = "round"; ctx.lineJoin = "round";
  // the wings, feathered, sweeping out and up from the cross
  [-1, 1].forEach(function (s) {
    for (var i = 0; i < 4; i++) {
      var y0 = -r * 0.2 + i * r * 0.07, len = r * (0.62 - i * 0.1);
      ctx.lineWidth = Math.max(1.5, r * 0.06);
      ctx.beginPath(); ctx.moveTo(s * r * 0.08, y0); ctx.quadraticCurveTo(s * len * 0.6, y0 - r * 0.16, s * len, y0 - r * 0.02 + i * r * 0.02); ctx.stroke();
    }
  });
  // the cross
  ctx.fillRect(-r * 0.045, -r * 0.36, r * 0.09, r * 0.62);
  ctx.fillRect(-r * 0.17, -r * 0.24, r * 0.34, r * 0.08);
  ctx.restore();
  if (look.cucuy && look.cucuy.headband) {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = look.cucuy.headband.color || TF_BAND;
    ctx.beginPath(); ctx.moveTo(-r * 0.96, -r * 0.62); ctx.quadraticCurveTo(0, -r * 0.5, r * 0.96, -r * 0.62); ctx.lineTo(r * 0.94, -r * 0.52); ctx.quadraticCurveTo(0, -r * 0.4, -r * 0.94, -r * 0.52); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.ellipse(0, -r * 0.5, r * 0.08, r * 0.06, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
}

// ---------------------------------------------------------------- gallery

// The fighter card's move list (gallery.js).
function fergusonGalleryMoves(ch, add) {
  var f = ch.ferguson;
  if (!f) return;
  if (f.durability) add("🧱", "Chin", "Takes " + Math.round(f.durability.damageTaken * 100) + "% of the damage of every hit.");
  if (f.wontTap) add("😤", "Won't tap", "When a choke or armbar on him is about to end in a tap, " + (f.wontTap.chances || []).join("% then ") + "% of the time he refuses: the bar swings back and he rips out (it costs him " + f.wontTap.cost + ")." + (f.wontTap.vsCharlesArmbar ? " Charles Oliveira's first armbar never finishes him (UFC 256)." : ""));
  if (f.slide) {
    var sl = f.slide;
    add("↔️", "The slide", "His side-to-side walkout shuffle, every " + sl.every[0] + "-" + sl.every[1] + "s at mid range (and " + sl.react + "% of the times they wind up something big): " + sl.hops + " slides, slipping " + sl.dodge + "% of strikes. Then " + sl.shoot + "% of the time he changes levels and shoots.");
  }
  if (f.takedown) {
    var fin = f.takedown.finish || {}, names = { buggy: "the buggy choke", darce: "his D'Arce", elbows: "ground-and-pound elbows" };
    add("🤼", "Takedown", "A shot that gets through every defence slams them down for " + f.takedown.damage + ", then " + Object.keys(fin).map(function (k) { return names[k] || k; }).join(", ").replace(/, ([^,]*)$/, " or $1") + "." + (f.buggy ? " The chokes: they tap " + f.buggy.tapBase + "% of the time at full health, up to " + (f.buggy.tapBase + f.buggy.tapLowHp) + "% when hurt." : ""));
  }
  if (f.shell) {
    var sh = f.shell;
    add("🐢", "Turtle shell", "Up to " + sh.max + " times a fight, when he's taking a beating (" + sh.burst + " damage in " + secs(sh.window) + ") or up close, he pulls into a turtle shell for " + secs(sh.time) + ": every strike and anything thrown clanks off it, but a special move cracks it." + (sh.spin ? " Then " + sh.spin.chance + "% of the time he spins out of it across the mat into them (" + sh.spin.damage + ", into the cage)." : ""));
  }
  if (f.kaioken) {
    var kc = f.kaioken;
    add("🔴", "Kaioken", "Up to " + kc.max + " times a fight a red aura bursts on: " + secs(kc.time) + " of hitting " + Math.round((kc.damage - 1) * 100) + "% harder, rolling " + Math.round((kc.speed - 1) * 100) + "% faster and attacking " + Math.round((kc.attack - 1) * 100) + "% faster." + (f.bellAd ? " The first time it burns out, the Burrito Bell ad runs." : ""));
  }
  if (f.death) add("🎥", "Cable trip", "When he loses he doesn't blow up on the spot: he wanders dizzy to the middle of the cage, trips over a TV cable, falls flat and then blows up (his real cable trip before UFC 223, 2018).");
  if (f.rivals) add("🗂️", "Rivals", "Khabib: five CANCELLED stamps before the fight (it fell through five times). Gaethje and Charles: a REMATCH, and his first Kaioken comes early.");
}
function fergusonKatanaInfo(sp) {
  return "Crosses his arms and steel blades slide out of both elbows (the tell: some back off). Then for " + secs(sp.time) + " he hunts them down slashing with blade elbows, " + sp.damage + " a slash but " + sp.critChance + "% are crits for " + sp.critMult + "x" + (sp.cut ? " that can open a cut" : "") + ". It ends with an X-slash (" + sp.finisher + ", " + Math.round(sp.finisher * sp.critMult) + " on a crit) into the cage.";
}

// ---------------------------------------------------------------- sound
// Synth stand-ins until Joe records the real ones.

function tfAudio(fn) {
  try {
    var ac = getAudioCtx();
    if (!ac) return;
    if (ac.state === "suspended") ac.resume();
    fn(ac, ac.currentTime);
  } catch (e) { /* never let audio break the game */ }
}
// Sneakers squeaking on the mat as he slides.
function playTfSlide() { tfAudio(function (ac, t) { caneTone(ac, t, "triangle", 1700, 2400, 0.08, 0.09); caneBurst(ac, t, 900, 1.4, 0.12, 0.08); }); }
function playTfSlip() { tfAudio(function (ac, t) { caneBurst(ac, t, 2400, 1.2, 0.2, 0.08); }); }
// Into the shell: a hollow clunk; strikes clank off it.
function playShellIn() { tfAudio(function (ac, t) { caneTone(ac, t, "sine", 260, 120, 0.5, 0.18); caneBurst(ac, t, 700, 2, 0.35, 0.1); }); }
function playShellClank(crack) {
  tfAudio(function (ac, t) {
    caneTone(ac, t, "square", crack ? 340 : 520, crack ? 180 : 480, 0.12, crack ? 0.3 : 0.14);
    caneBurst(ac, t, crack ? 1500 : 3200, 3, crack ? 0.6 : 0.3, crack ? 0.25 : 0.07);
  });
}
function playShellSpin() { tfAudio(function (ac, t) { for (var i = 0; i < 6; i++) caneBurst(ac, t + i * 0.09, 1200 + i * 120, 2, 0.18, 0.07); }); }
// Kaioken bursting on: Joe's Super Saiyan burst slowed down and deeper, over
// a low roar; and dying away.
function playKaiokenUp() {
  tfAudio(function (ac, t) {
    withClip("saiyanUp", function () { playClip("saiyanUp", 0.9, null, 0.82); });
    caneTone(ac, t, "sawtooth", 70, 140, 0.22, 0.7);
    caneBurst(ac, t, 300, 0.8, 0.5, 0.6);
  });
}
function playKaiokenDown() { tfAudio(function (ac, t) { caneTone(ac, t, "sawtooth", 160, 55, 0.14, 0.6); }); }
// The blades sliding out: a long steel shing.
function playKatanaDraw() {
  tfAudio(function (ac, t) {
    caneBurst(ac, t, 5200, 1.5, 0.35, 0.35);
    caneTone(ac, t + 0.05, "sine", 2900, 3300, 0.16, 0.6);
    caneTone(ac, t + 0.05, "sine", 4400, 4700, 0.07, 0.5);
  });
}
// Ripping out of a hold he won't tap to: a crack and a roar of the crowd.
function playWontTap() { tfAudio(function (ac, t) { caneBurst(ac, t, 1800, 2, 0.6, 0.08); caneTone(ac, t, "triangle", 220, 90, 0.4, 0.25); }); }
// A rubber stamp slamming down.
function playTfStamp(kind) { tfAudio(function (ac, t) { caneTone(ac, t, "sine", kind === "final" ? 160 : 110, 50, 0.6, 0.2); caneBurst(ac, t, 500, 1, 0.5, 0.08); }); }
// His death: wobbly steps, the cable snagging his foot with a slide whistle
// down, and the thud.
function playTripWobble() { tfAudio(function (ac, t) { caneTone(ac, t, "sine", 700, 300, 0.12, 0.9); }); }
function playTripStep() { tfAudio(function (ac, t) { caneTone(ac, t, "sine", 120, 70, 0.25, 0.08); }); }
function playTripCatch() {
  tfAudio(function (ac, t) {
    caneTone(ac, t, "triangle", 180, 140, 0.3, 0.12);
    caneTone(ac, t + 0.05, "sine", 1600, 220, 0.18, 0.6);
  });
}
function playTripThud() { tfAudio(function (ac, t) { caneTone(ac, t, "sine", 90, 40, 0.8, 0.3); caneBurst(ac, t, 300, 0.8, 0.6, 0.15); }); }
