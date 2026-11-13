// Josh Hokit's Dark Side (Joe, 2026-11-12). A form change: he throws on a
// black hooded robe (open down the chest, the lion tattoo showing, the
// bandana and shades still on under the hood) and ignites a red lightsaber.
//
// When: the moment his opponent pulls out a weapon (Gane's bat, Gaethje's
// golf club, Dustin's diamond sword, Ilia's rapier), or once at a random
// time in the match (char.darkSide.first). It lasts `duration` seconds, and
// stays on as long as they've still got a weapon out.
//
// In the form his wrestler moves are off (armbar shot, thumbs down, Top
// Rope, Helmet Charge, and his Chair Shot waits until it's over). For now
// he just swings the saber: it runs on the same swing code as Gane's bat
// (cheater.js), with b.cheater.saber set.
//
// Clashes:
//   vs a sword (Dustin, Ilia): their own parries and sword duel (sword.js),
//      and the duel can end three ways: they slash him (he's hurt), he
//      wins and slashes them, or they disarm him.
//   vs a bat or club (Gane, Gaethje): clash.chance% of swings either way are
//      met blade on bat (CLASH!, both knocked apart). Every lockAfter-th
//      clash they lock up, grinding blade on bat, and it ends the same three
//      ways.
//   Disarmed: the saber goes spinning off out of his hand, he reaches out
//      and pulls it back with the Force, catches it, and Force pushes them
//      across the ring. The push does no damage.
"use strict";

var DS_RISE = 1.05, DS_SUIT_AT = 0.4, DS_IGNITE_AT = 0.62, DS_IGNITE = 0.22; // putting it on
var DS_FALL = 0.7, DS_RETRACT = 0.28;                                           // taking it off
var LOCK_IN = 0.25, LOCK_TIME = 1.35;                                           // a saber lock
var FORCE_PULL_AT = 0.42, FORCE_CATCH_AT = 0.72, FORCE_PUSH_AT = 0.95, FORCE_END = 1.3;
var SABER_LEN = 2.05;

var saberLock = null;   // blade on bat, while it's on
var forceWaves = [];    // the Force push rippling out
var saberCuts = [];     // a red line where he cut through (his duel win)

function resetDarkSide() {
  saberLock = null; forceWaves = []; saberCuts = [];
  stopSaberHum();
}
function dsRand(r) { return r[0] + Math.random() * (r[1] - r[0]); }

// From makeBall.
function initDarkSide(b) {
  var cfg = b.char.darkSide;
  b.sith = null; b.sithLookOff = null; b.sithCd = 0; b.sithClashes = 0;
  b.sithRandT = cfg ? dsRand(cfg.first) : Infinity; b.sithRandUsed = false;
}

function darkSideOn(b) { return !!(b && b.sith); }
// Saber lit and in his hand.
function sithArmed(b) { return !!(b && b.sith && b.sith.phase === "on" && !b.sith.force && b.cheater && b.cheater.saber && b.alive); }
// His wrestler moves are off for the whole form (abilities.js).
function darkSideBlocks(b) { return !!(b && b.sith && !b.igbb); }
// How lit the blade is (0..1), for drawing it.
function saberIgnite(b) { var s = b && b.sith; return s ? (s.ignite == null ? 1 : s.ignite) : 1; }

// Their weapon is out (what pulls his out).
function dsOppWeapon(o) {
  if (!o || !o.alive) return false;
  if (o.cheater && o.cheater.mode === "bat" && !o.cheater.saber) return true;
  if (o.cheater && o.cheater.saber && o.sith && o.sith.phase === "on") return true; // Hokit vs Hokit
  if (katanaOn(o)) return true; // Tony Ferguson's katanas (ferguson-katanas.js)
  var h = bladeHost(o);
  return !!(h && h.sword && h.sword.out);
}

function dsSuit(b, on) {
  var cfg = b.char.darkSide;
  if (on) {
    if (!b.sithLookOff) b.sithLookOff = b.char.look;
    b.char = Object.assign({}, b.char, { look: Object.assign({}, b.sithLookOff, cfg.look) });
  } else if (b.sithLookOff) {
    b.char = Object.assign({}, b.char, { look: b.sithLookOff });
    b.sithLookOff = null;
  }
}

// Black smoke billowing round him (putting it on or taking it off).
function dsSmoke(b, n) {
  for (var i = 0; i < n && !reduceMotion; i++) {
    var a = Math.random() * Math.PI * 2, s = 40 + Math.random() * 160;
    particles.push({ x: b.x + Math.cos(a) * b.r * 0.6, y: b.y + Math.sin(a) * b.r * 0.6, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 40,
      life: 0.6 + Math.random() * 0.3, max: 0.9, size: b.r * (0.18 + Math.random() * 0.2), color: i % 4 ? "#121216" : "#3a0d12" });
  }
}

function startDarkSide(self, why) {
  clearActions(self); self.chAct = null;
  self.vx = 0; self.vy = 0;
  self.sith = { phase: "rise", t: 0, why: why, left: self.char.darkSide.duration, ignite: 0, suited: false };
  // His Death Star strike, once a form (send-location.js runs it).
  var dsc = self.char.darkSide.deathStar;
  self.dsStrikeT = dsc && (self.sendLocN || 0) < dsc.max ? dsRand(dsc.first) : null;
  floater(self.x, self.y - self.r - 30, "DARK SIDE", "crit");
  crowdReact(0.7);
  playDarkSideRise();
}

// From the abilities loop, before his other moves. True while it has him
// busy (suiting up, the Force pull and push, a saber lock, taking it off);
// the swings themselves run in updateCheater.
function updateDarkSide(self, other, dt) {
  var cfg = self.char.darkSide;
  if (!cfg) return false;
  var s = self.sith;
  if (!s) {
    self.sithCd = Math.max(0, self.sithCd - dt);
    if (!started || over || !other.alive) return false;
    if (!self.sithRandUsed) self.sithRandT -= dt;
    var why = dsOppWeapon(other) ? "weapon" : (!self.sithRandUsed && self.sithRandT <= 0 ? "random" : null);
    if (!why || self.sithCd > 0 || self.igbb || self.doBronx || self.hokitShot || self.mock || self.fenceGrab || swordDuelActive() || !(canStartIgbb(self, other) || canSuitUpVsKatanas(self, other))) return false; // (he can suit up mid katana special, ferguson-katanas.js)
    if (why === "random") self.sithRandUsed = true;
    startDarkSide(self, why);
    s = self.sith;
  }
  s.t += dt;
  if (s.phase === "rise") {
    self.vx = 0; self.vy = 0;
    self.slamSafe = Math.max(self.slamSafe || 0, 0.1);
    if (!s.suited && s.t >= DS_SUIT_AT) {
      s.suited = true; dsSuit(self, true); dsSmoke(self, 26);
      if (!reduceMotion) shake = Math.max(shake, 6);
    }
    if (!self.cheater && s.t >= DS_IGNITE_AT) {
      self.cheater = { mode: "bat", saber: true, cd: 0.35, cfg: { bat: cfg.saber } };
      playSaberIgnite(); startSaberHum();
      self.flash = 0.12;
    }
    s.ignite = Math.max(0, Math.min(1, (s.t - DS_IGNITE_AT) / DS_IGNITE));
    if (s.t >= DS_RISE) { s.phase = "on"; s.t = 0; s.ignite = 1; }
    return true;
  }
  if (s.phase === "on") {
    if (s.force) { updateForce(self, dt); return true; }
    if (saberLock && saberLock.hId === self.id) { updateSaberLock(self, dt); return true; }
    if (!self.cheater || !self.cheater.saber) self.cheater = { mode: "bat", saber: true, cd: 0.35, cfg: { bat: cfg.saber } };
    s.left -= dt;
    // A bat or club still out keeps it on (not a sword drawn back at his saber, or it'd never end).
    if (other.alive && other.cheater && other.cheater.mode === "bat" && !other.cheater.saber) s.left = Math.max(s.left, cfg.linger);
    if ((s.left <= 0 || over) && !self.chAct && !swordDuelLocked(self) && !specialBusy(self)) {
      s.phase = "fall"; s.t = 0;
      self.chAct = null;
      playSaberRetract();
    }
    return false;
  }
  // Taking it off: the blade sucks back into the hilt, then a puff of smoke
  // and he's back in his fight kit.
  self.vx *= 0.8; self.vy *= 0.8;
  s.ignite = Math.max(0, 1 - s.t / DS_RETRACT);
  if (self.cheater && s.t >= DS_RETRACT + 0.08) {
    self.cheater = null; stopSaberHum();
    dsSuit(self, false); dsSmoke(self, 20);
  }
  if (s.t >= DS_FALL) {
    self.sith = null; self.cheater = null;
    self.sithCd = cfg.cooldown;
    self.sithClashes = 0;
    return false;
  }
  return true;
}

// ---------------------------------------------------------------- clashes

// Called by a bat swing right before it lands (cheater.js), either way
// round: his saber swung at a bat or club, or one swung at him. True when
// it was met blade on bat (the swing skips its damage).
function sithClash(def, atk) {
  var h = sithArmed(atk) ? atk : sithArmed(def) ? def : null;
  if (!h || saberLock || swordDuel) return false;
  var o = h === atk ? def : atk;
  if (!o.alive || !o.cheater || o.cheater.mode !== "bat") return false; // (swords: sword.js; another saber is fine)
  var cc = h.char.darkSide.clash;
  if (Math.random() * 100 >= cc.chance) return false;
  atk.chAct = null; // knocked away
  var nx = def.x - atk.x, ny = def.y - atk.y, nd = Math.sqrt(nx * nx + ny * ny) || 1;
  nx /= nd; ny /= nd;
  var cx = (atk.x + def.x) / 2, cy = (atk.y + def.y) / 2 - h.r * 0.35;
  h.sithClashes++;
  if (h.sithClashes >= cc.lockAfter) { h.sithClashes = 0; startSaberLock(h, o); return true; }
  atk.vx = -nx * cc.knockback; atk.vy = -ny * cc.knockback;
  def.vx += nx * cc.knockback * 0.5; def.vy += ny * cc.knockback * 0.5;
  atk.squash = { t: 0.14, max: 0.14, nx: nx, ny: ny };
  if (atk.cheater) atk.cheater.cd = Math.max(atk.cheater.cd, cc.recover);
  if (def.cheater) def.cheater.cd = Math.max(def.cheater.cd, cc.recover * 0.6);
  saberClashFx(cx, cy, -nx, -ny, 1.2);
  floater(cx, Math.min(def.y, atk.y) - def.r - 34, "CLASH!", "crit");
  crowdReact(0.6);
  playSaberClash(1);
  return true;
}

// Red and white sparks off the blade, a flash and a jolt.
function saberClashFx(x, y, nx, ny, big) {
  clashFx(x, y, nx, ny, big, SABER_C);
  for (var i = 0; i < Math.round(10 * big) && !reduceMotion; i++) {
    var a = Math.random() * Math.PI * 2, s = 120 + Math.random() * 300;
    particles.push({ x: x, y: y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 0.3, max: 0.3, size: 2 + Math.random() * 2, color: i % 2 ? "#ff3b3b" : "#ffe1e1" });
  }
}
var SABER_C = { W: "#ffffff", L: "#ff2a2a", m: "#ff4646" };

// How a lock or a sword duel against him ends, from his clash odds.
function sithOutcome(h) {
  var cc = h.char.darkSide.clash, tot = cc.win + cc.hurt + cc.disarm, r = Math.random() * tot;
  return r < cc.win ? "win" : r < cc.win + cc.hurt ? "hurt" : "disarm";
}

function startSaberLock(h, o) {
  clearActions(h); clearActions(o); h.chAct = null; o.chAct = null;
  // Always side by side: the lock pose angles both weapons up and in toward
  // each other across the screen, so lined up top to bottom they'd miss.
  var nx = o.x >= h.x ? 1 : -1, ny = 0;
  var gap = h.r + o.r + 36, mx = (h.x + o.x) / 2, my = (h.y + o.y) / 2;
  mx = Math.min(W - gap / 2 - h.r - 10, Math.max(gap / 2 + h.r + 10, mx)); // (wall to wall room for both)
  my = Math.min(H - gap / 2 - h.r - 10, Math.max(gap / 2 + h.r + 10, my));
  saberLock = { hId: h.id, oId: o.id, t: 0, nx: nx, ny: ny, mx: mx, my: my, gap: gap,
    fromH: { x: h.x, y: h.y }, fromO: { x: o.x, y: o.y }, outcome: sithOutcome(h), sparkT: 0, done: false };
  h.vx = h.vy = o.vx = o.vy = 0;
  floater(mx, my - h.r - 50, "SABER LOCK!", "crit");
  crowdReact(1);
  playSaberClash(1.6); playSaberLockBuzz(LOCK_TIME - LOCK_IN);
  if (!reduceMotion) shake = Math.max(shake, 12);
}
// The one locked up with him is held too (abilities.js).
function saberLockHeld(b) { return !!(saberLock && b && (b.id === saberLock.oId || b.id === saberLock.hId)); }
// Where their blades cross.
function saberLockPoint() {
  var L = saberLock, h = balls[L.hId], o = balls[L.oId];
  return { x: (h.x + o.x) / 2, y: (h.y + o.y) / 2 - h.r * 1.1 }; // (both lock poses rise into each other over the middle)
}

function updateSaberLock(h, dt) {
  var L = saberLock, o = balls[L.oId];
  L.t += dt;
  if (!o.alive || !h.alive || !o.cheater || o.cheater.mode !== "bat") { saberLock = null; return; } // (their weapon went away: the ref woke up, golf's over)
  // Slid in together, then shoving back and forth over the crossed blades.
  var k = ease(L.t / LOCK_IN), push = L.t > LOCK_IN ? Math.sin((L.t - LOCK_IN) * 7) * h.r * 0.14 : 0;
  var half = L.gap / 2;
  var hx = L.mx - L.nx * (half - push), hy = L.my - L.ny * (half - push);
  var ox = L.mx + L.nx * (half + push), oy = L.my + L.ny * (half + push);
  h.x = L.fromH.x + (hx - L.fromH.x) * k; h.y = L.fromH.y + (hy - L.fromH.y) * k;
  o.x = L.fromO.x + (ox - L.fromO.x) * k; o.y = L.fromO.y + (oy - L.fromO.y) * k;
  h.vx = h.vy = o.vx = o.vy = 0;
  if (L.t > LOCK_IN) {
    L.sparkT -= dt;
    if (L.sparkT <= 0) {
      L.sparkT = 0.07;
      var p = saberLockPoint();
      for (var i = 0; i < 4 && !reduceMotion; i++) {
        var a = -Math.PI / 2 + (Math.random() - 0.5) * 2.6, s = 120 + Math.random() * 260;
        particles.push({ x: p.x, y: p.y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 0.3, max: 0.3, size: 2 + Math.random() * 2.5, color: i % 2 ? "#ff3b3b" : "#fff2c2" });
      }
      if (!reduceMotion) shake = Math.max(shake, 3);
    }
  }
  if (L.t < LOCK_TIME) return;
  // Broken apart: how it ends.
  saberLock = null;
  var cc = h.char.darkSide.clash, nx = L.nx, ny = L.ny, p2 = { x: (h.x + o.x) / 2, y: (h.y + o.y) / 2 - h.r * 0.5 };
  var bat = cheaterCfg(o).bat, wind = function (b) { return (cheaterCfg(b).bat.windup || 0); };
  saberClashFx(p2.x, p2.y, nx, ny, 2);
  if (L.outcome === "win") {
    // He shoves the bat off and cuts straight across them.
    h.chAct = { kind: "bat", t: wind(h), hit: true, dir: 1 };
    var dealt = hurt(o, cc.winDamage, "igbb", h.id);
    o.flash = 0.16;
    floater(o.x, o.y - o.r - 34, "SABER SLASH!", "crit");
    playSaberHit(true);
    if (dealt > 0 && o.alive) beginWallSlam(o, nx, ny, { knockback: cc.winKnockback, wallSlams: 1, slamDamage: 4 });
    if (!reduceMotion) { shake = Math.max(shake, 22); hitStop = Math.max(hitStop, 0.1); }
    crowdReact(1);
    if (o.cheater) o.cheater.cd = Math.max(o.cheater.cd, 0.8);
    checkEnd();
  } else if (L.outcome === "hurt") {
    // They muscle through it and hit him.
    o.chAct = { kind: "bat", t: wind(o), hit: true, dir: 1 };
    var dealt2 = hurt(h, Math.round(bat.damage * cc.hurtMult), "igbb", o.id);
    h.flash = 0.16;
    var oSaber = !!(o.cheater && o.cheater.saber), oClub = !!(o.cheater && o.cheater.club);
    floater(h.x, h.y - h.r - 34, oSaber ? "SABER SLASH!" : oClub ? "WHACK!" : "CRACK!", "crit");
    if (oSaber) playSaberHit(true); else if (oClub) playClubHit(); else playBatHit(true);
    if (dealt2 > 0 && h.alive) beginWallSlam(h, -nx, -ny, { knockback: 1100, wallSlams: 1, slamDamage: 4 });
    if (!reduceMotion) { shake = Math.max(shake, 20); hitStop = Math.max(hitStop, 0.08); }
    crowdReact(1);
    if (h.cheater) h.cheater.cd = Math.max(h.cheater.cd, 0.8);
    checkEnd();
  } else {
    // They rip it out of his hand.
    o.chAct = { kind: "bat", t: wind(o), hit: true, dir: 1 };
    floater(h.x, h.y - h.r - 34, "DISARMED!", "crit");
    playSwordClash(1.4);
    startForce(h, o, -nx, -ny);
  }
}

// ---------------------------------------------------------------- the Force

// Disarmed (a saber lock, or a sword duel in sword.js): the saber spins off
// out of his hand toward (ax, ay). He pulls it back and pushes `o` away.
function startForce(h, o, ax, ay) {
  var s = h.sith;
  if (!s) return;
  clearActions(h); h.chAct = null;
  var px = -ay, py = ax, side = Math.random() < 0.5 ? 1 : -1;
  var vx = ax * 360 + px * side * 260, vy = ay * 360 + py * side * 260 - 120;
  s.force = { t: 0, oId: o.id, x: h.x + ax * h.r * 0.8, y: h.y - h.r * 0.3, vx: vx, vy: vy, rot: Math.atan2(vy, vx), spin: 20 * side,
    pulled: false, caught: false, pushed: false, hand: null };
  // They're stunned in place till the push throws them.
  o.checkStun = Math.max(o.checkStun || 0, FORCE_PUSH_AT + 0.05);
  h.vx = h.vy = 0;
  if (h.cheater) h.cheater.cd = 0.5;
  crowdReact(0.8);
  playWhoosh();
}

function updateForce(h, dt) {
  var f = h.sith.force, o = balls[f.oId];
  f.t += dt;
  h.vx = 0; h.vy = 0;
  h.slamSafe = Math.max(h.slamSafe || 0, 0.1); // nothing touches him through it
  var hand = forceHand(h, f);
  if (f.t < FORCE_PULL_AT) {
    // Spinning away, slowing.
    var drag = Math.exp(-dt * 3.2);
    f.vx *= drag; f.vy *= drag;
    f.x += f.vx * dt; f.y += f.vy * dt; f.rot += f.spin * dt;
    f.x = Math.min(W - 20, Math.max(20, f.x)); f.y = Math.min(H - 20, Math.max(20, f.y));
    f.spin *= Math.exp(-dt * 1.5);
  } else if (f.t < FORCE_CATCH_AT) {
    if (!f.pulled) {
      f.pulled = true; f.px = f.x; f.py = f.y; f.prot = f.rot;
      floater(h.x, h.y - h.r - 30, "FORCE PULL", "note");
      playForcePull();
    }
    // Hangs in the air for a beat, shaking, then whips back to his hand.
    var u = (f.t - FORCE_PULL_AT) / (FORCE_CATCH_AT - FORCE_PULL_AT);
    var hold = 0.25, k = u < hold ? 0 : Math.pow((u - hold) / (1 - hold), 2.2);
    var jit = u < hold && !reduceMotion ? Math.sin(f.t * 90) * 3 : 0;
    f.x = f.px + (hand.x - f.px) * k + jit; f.y = f.py + (hand.y - f.py) * k;
    f.rot = f.prot + f.spin * 0.05 * (1 - k) + k * 6;
  } else {
    if (!f.caught) {
      f.caught = true;
      playSaberIgnite(0.6);
      h.flash = 0.08;
      for (var i = 0; i < 8 && !reduceMotion; i++) {
        var a = Math.random() * Math.PI * 2;
        particles.push({ x: hand.x, y: hand.y, vx: Math.cos(a) * 160, vy: Math.sin(a) * 160, life: 0.25, max: 0.25, size: 2.5, color: "#ff3b3b" });
      }
    }
    if (!f.pushed && f.t >= FORCE_PUSH_AT) {
      f.pushed = true;
      var nx = o.x - h.x, ny = o.y - h.y, nd = Math.sqrt(nx * nx + ny * ny) || 1;
      nx /= nd; ny /= nd;
      f.nx = nx; f.ny = ny;
      forceWaves.push({ x: h.x + nx * h.r, y: h.y + ny * h.r, nx: nx, ny: ny, t: 0, max: 0.5, r: h.r });
      floater(h.x, h.y - h.r - 30, "FORCE PUSH!", "crit");
      playForcePush();
      if (o.alive) {
        o.checkStun = 0; clearActions(o); o.chAct = null;
        // Thrown across the ring, no damage (Joe).
        beginWallSlam(o, nx, ny, { knockback: h.char.darkSide.push.knockback, wallSlams: 1, slamDamage: 0 });
        o.squash = { t: 0.2, max: 0.2, nx: nx, ny: ny };
      }
      if (!reduceMotion) { shake = Math.max(shake, 18); hitStop = Math.max(hitStop, 0.06); }
      crowdReact(1);
    }
  }
  if (f.t >= FORCE_END) {
    h.sith.force = null;
    if (h.cheater) h.cheater.cd = Math.max(h.cheater.cd, 0.3);
  }
}

// His saber hand, out toward the saber (front on, like the bat: shoulders
// at the top corners of the ball).
function forceHand(h, f) {
  var o = balls[f.oId], s = o.x > h.x ? -1 : 1; // the saber hand is on the side away from them
  if (f.t < FORCE_PULL_AT - 0.15) return { x: h.x + s * h.r * 0.55, y: h.y };
  var dx = f.x - h.x, dy = f.y - h.y, d = Math.sqrt(dx * dx + dy * dy) || 1;
  return { x: h.x + dx / d * h.r * 1.05, y: h.y - h.r * 0.15 + dy / d * h.r * 0.8 };
}

// ---------------------------------------------------------------- the hum

var saberHum = null;
function startSaberHum() {
  try {
    if (saberHum) return;
    var ctx = getAudioCtx();
    if (!ctx) return;
    var now = ctx.currentTime, out = ctx.createGain(), lp = ctx.createBiquadFilter();
    lp.type = "lowpass"; lp.frequency.value = 420; lp.Q.value = 2;
    out.gain.setValueAtTime(0.0001, now); out.gain.exponentialRampToValueAtTime(0.07, now + 0.3);
    lp.connect(out); out.connect(ctx.destination);
    var oscs = [[88, "sawtooth"], [90.5, "sawtooth"], [176, "triangle"]].map(function (p) {
      var o = ctx.createOscillator(); o.type = p[1]; o.frequency.value = p[0]; o.connect(lp); o.start(now); return o;
    });
    var lfo = ctx.createOscillator(), lg = ctx.createGain();
    lfo.frequency.value = 0.7; lg.gain.value = 90; lfo.connect(lg); lg.connect(lp.frequency); lfo.start(now);
    saberHum = { out: out, oscs: oscs.concat([lfo]) };
  } catch (e) { /* never let audio break the game */ }
}
function stopSaberHum() {
  if (!saberHum) return;
  try {
    var ctx = getAudioCtx(), now = ctx.currentTime, h = saberHum;
    h.out.gain.cancelScheduledValues(now); h.out.gain.setValueAtTime(Math.max(0.0001, h.out.gain.value), now);
    h.out.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);
    h.oscs.forEach(function (o) { o.stop(now + 0.3); });
  } catch (e) { /* */ }
  saberHum = null;
}
// Every frame: no saber lit, no hum (match over, reset, knocked out).
function tickDarkSide(dt) {
  forceWaves = forceWaves.filter(function (w) { w.t += dt; return w.t < w.max; });
  saberCuts = saberCuts.filter(function (c) { c.t += dt; return c.t < 0.9; });
  var lit = balls.some(function (b) { return b.alive && b.sith && b.cheater && b.cheater.saber; });
  if (!lit || over) stopSaberHum();
  if (saberLock && (!balls[saberLock.hId] || !balls[saberLock.hId].alive || !balls[saberLock.oId].alive)) saberLock = null;
}

// ---------------------------------------------------------------- drawing

// The saber, held at the grip at (x, y) and pointing along `a`. `lit` 0..1
// is how far the blade's out.
function drawSaber(x, y, a, len, lit) {
  ctx.save();
  ctx.translate(x, y); ctx.rotate(a);
  var hw = len * 0.045, h0 = -len * 0.13, h1 = len * 0.1;
  if (lit > 0) {
    var bl = h1 + (len * 1.0 - h1) * lit, bw = len * 0.034;
    ctx.lineCap = "round";
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.strokeStyle = "rgba(255,30,40,0.35)"; ctx.lineWidth = bw * 5;
    if (!reduceMotion) { ctx.shadowColor = "#ff1a1a"; ctx.shadowBlur = len * 0.25; }
    ctx.beginPath(); ctx.moveTo(h1, 0); ctx.lineTo(bl, 0); ctx.stroke();
    ctx.restore();
    ctx.strokeStyle = "#ff2b2b"; ctx.lineWidth = bw * 2.4;
    ctx.beginPath(); ctx.moveTo(h1, 0); ctx.lineTo(bl, 0); ctx.stroke();
    ctx.strokeStyle = "#ffe9e9"; ctx.lineWidth = bw * 1.1;
    ctx.beginPath(); ctx.moveTo(h1, 0); ctx.lineTo(bl, 0); ctx.stroke();
  }
  // Hilt: black grip with ridges, silver emitter and pommel.
  ctx.lineWidth = 2; ctx.strokeStyle = "#0b0b0d";
  ctx.fillStyle = "#24252a"; ctx.fillRect(h0, -hw, h1 - h0, hw * 2); ctx.strokeRect(h0, -hw, h1 - h0, hw * 2);
  ctx.fillStyle = "#c9ccd2";
  ctx.fillRect(h1 - len * 0.045, -hw * 1.25, len * 0.045, hw * 2.5); ctx.strokeRect(h1 - len * 0.045, -hw * 1.25, len * 0.045, hw * 2.5);
  ctx.fillRect(h0 - len * 0.025, -hw * 0.9, len * 0.025, hw * 1.8);
  ctx.fillStyle = "#5a5d64";
  for (var i = 0; i < 4; i++) ctx.fillRect(h0 + len * (0.03 + i * 0.035), -hw, len * 0.012, hw * 2);
  ctx.fillStyle = "#c8202c"; ctx.fillRect(h0 + len * 0.17, -hw * 0.45, len * 0.02, hw * 0.9); // the button
  ctx.restore();
}

// His arms through the Force pull and push (drawCheater hands him over).
// True when it drew him.
function drawSithArms(b) {
  var s = b.sith;
  if (!s || !s.force) return false;
  var f = s.force, o = balls[f.oId], ch = b.char, r = b.r;
  var sd = o.x > b.x ? -1 : 1; // saber side, away from them
  var sh = { x: b.x + sd * r * 0.66, y: b.y - r * 0.3 }, fsh = { x: b.x - sd * r * 0.66, y: b.y - r * 0.3 };
  var hand = forceHand(b, f), jit = !f.caught && f.t > FORCE_PULL_AT - 0.15 && !reduceMotion ? Math.sin(f.t * 70) * 1.5 : 0;
  hand = { x: hand.x + jit, y: hand.y };
  // Free hand: in guard, then shoved out flat at them for the push.
  var nx = o.x - b.x, ny = o.y - b.y, nd = Math.sqrt(nx * nx + ny * ny) || 1;
  nx /= nd; ny /= nd;
  var pk = f.t < FORCE_PUSH_AT - 0.15 ? 0 : f.t < FORCE_PUSH_AT ? -0.3 * (f.t - FORCE_PUSH_AT + 0.15) / 0.15 : Math.min(1, (f.t - FORCE_PUSH_AT) / 0.07) * (f.t > FORCE_END - 0.2 ? Math.max(0, (FORCE_END - f.t) / 0.2) : 1);
  var guard = { x: b.x - sd * r * 0.4, y: b.y + r * 0.05 };
  var free = pk >= 0 ? { x: guard.x + (b.x + nx * r * 1.1 - guard.x) * pk, y: guard.y + (b.y + ny * r * 0.9 - r * 0.1 - guard.y) * pk }
    : { x: guard.x - nx * r * 0.2 * -pk / 0.3, y: guard.y - ny * r * 0.2 * -pk / 0.3 };
  drawBentArm(b, fsh, free, -sd);
  if (f.caught) {
    // Back in his hand, held up lit.
    var ha = { x: b.x + sd * r * 0.62, y: b.y - r * 0.05 };
    drawBentArm(b, sh, ha, sd);
    drawSaber(ha.x, ha.y, sd > 0 ? -Math.PI / 2 + 0.35 : -Math.PI / 2 - 0.35, r * SABER_LEN, 1);
    drawGloveAt(ha.x, ha.y, r * 0.22, ch);
  } else {
    drawBentArm(b, sh, hand, sd);
    // Fingers spread, reaching for it.
    if (f.t > FORCE_PULL_AT - 0.15) {
      var ra = Math.atan2(f.y - hand.y, f.x - hand.x);
      strokeLimb(r * 0.07, armColor(ch), function () {
        for (var i = -2; i <= 2; i++) {
          var fa = ra + i * 0.32;
          ctx.moveTo(hand.x, hand.y); ctx.lineTo(hand.x + Math.cos(fa) * r * 0.3, hand.y + Math.sin(fa) * r * 0.3);
        }
      });
    }
    drawGloveAt(hand.x, hand.y, r * 0.22, ch);
  }
  drawGloveAt(free.x, free.y, r * 0.22 * (1 + 0.15 * Math.max(0, pk)), ch);
  return true;
}

// Over both fighters: the saber flying loose, the Force rippling, the lock.
function drawDarkSideTop() {
  balls.forEach(function (b) {
    var f = b.sith && b.sith.force;
    if (!f || f.caught || !b.alive) return;
    var len = b.r * SABER_LEN;
    // A faint pull line from his hand while it's coming back.
    if (f.t > FORCE_PULL_AT) {
      var hd = forceHand(b, f), u = Math.min(1, (f.t - FORCE_PULL_AT) / 0.15);
      ctx.save();
      ctx.globalAlpha = 0.35 * u; ctx.strokeStyle = "#9fb4ff"; ctx.lineWidth = 2; ctx.setLineDash([4, 7]);
      ctx.lineDashOffset = -f.t * 120;
      ctx.beginPath(); ctx.moveTo(hd.x, hd.y); ctx.lineTo(f.x, f.y); ctx.stroke();
      ctx.restore();
    }
    // The hilt leads it back; the blade stays lit the whole time.
    drawSaber(f.x - Math.cos(f.rot) * len * 0.45, f.y - Math.sin(f.rot) * len * 0.45, f.rot, len, 1);
  });
  forceWaves.forEach(function (w) {
    var u = w.t / w.max, a = Math.atan2(w.ny, w.nx);
    ctx.save();
    ctx.lineCap = "round";
    for (var i = 0; i < 3; i++) {
      var uu = u - i * 0.12;
      if (uu <= 0) continue;
      var rr = w.r * (0.6 + uu * 4.5);
      ctx.globalAlpha = Math.max(0, (1 - uu)) * 0.9;
      ctx.strokeStyle = i ? "#8fa8ff" : "#e8eeff"; ctx.lineWidth = w.r * (0.26 - i * 0.06) * (1 - uu * 0.5);
      if (!reduceMotion) { ctx.shadowColor = "#6f8cff"; ctx.shadowBlur = 16; }
      ctx.beginPath(); ctx.arc(w.x - w.nx * w.r, w.y - w.ny * w.r, rr, a - 0.6, a + 0.6); ctx.stroke();
    }
    ctx.restore();
  });
  if (saberLock && saberLock.t > LOCK_IN) {
    // A hot glow where the blades grind.
    var p = saberLockPoint(), fl = 0.6 + 0.4 * Math.sin(saberLock.t * 50);
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    var g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 34);
    g.addColorStop(0, "rgba(255,240,200," + 0.9 * fl + ")"); g.addColorStop(0.4, "rgba(255,60,40," + 0.5 * fl + ")"); g.addColorStop(1, "rgba(255,0,0,0)");
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, 34, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
  saberCuts.forEach(function (c) {
    var grow = easeOut(Math.min(1, c.t / 0.14)), fade = c.t < 0.45 ? 1 : Math.max(0, 1 - (c.t - 0.45) / 0.45);
    var x1 = c.x0 + (c.x1 - c.x0) * grow, y1 = c.y0 + (c.y1 - c.y0) * grow;
    ctx.save();
    ctx.globalAlpha = fade; ctx.lineCap = "round";
    if (!reduceMotion) { ctx.shadowColor = "#ff1a1a"; ctx.shadowBlur = 24; }
    ctx.strokeStyle = "#ff2b2b"; ctx.lineWidth = c.r * 0.16;
    ctx.beginPath(); ctx.moveTo(c.x0, c.y0); ctx.lineTo(x1, y1); ctx.stroke();
    ctx.strokeStyle = "#ffffff"; ctx.lineWidth = c.r * 0.06;
    ctx.beginPath(); ctx.moveTo(c.x0, c.y0); ctx.lineTo(x1, y1); ctx.stroke();
    ctx.restore();
  });
}

// A dark swirl round him as he suits up (under him).
function drawDarkSideRise(b) {
  var s = b.sith;
  if (!s || s.phase !== "rise" || !b.alive) return;
  var u = s.t / DS_RISE, a = Math.sin(Math.min(1, u * 1.3) * Math.PI);
  ctx.save();
  var g = ctx.createRadialGradient(b.x, b.y, b.r * 0.5, b.x, b.y, b.r * 2.2);
  g.addColorStop(0, "rgba(10,0,4," + 0.55 * a + ")"); g.addColorStop(0.6, "rgba(90,0,12," + 0.25 * a + ")"); g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(b.x, b.y, b.r * 2.2, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

// ---------------------------------------------------------------- sounds

function dsAudio() {
  var ctx = getAudioCtx();
  if (!ctx) return null;
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}
function dsNoise(ctx) { if (!punchNoise) punchNoise = makeNoiseBuffer(ctx, 0.2); return punchNoise; }

// A dark rumble with a rising whoosh as he suits up.
function playDarkSideRise() {
  try {
    var ctx = dsAudio(); if (!ctx) return;
    var now = ctx.currentTime, out = ctx.createGain(); out.gain.value = 0.55; out.connect(ctx.destination);
    var o = ctx.createOscillator(), g = ctx.createGain(), lp = ctx.createBiquadFilter();
    o.type = "sawtooth"; o.frequency.setValueAtTime(42, now); o.frequency.exponentialRampToValueAtTime(70, now + 0.6);
    lp.type = "lowpass"; lp.frequency.value = 260;
    g.gain.setValueAtTime(0.0001, now); g.gain.exponentialRampToValueAtTime(0.5, now + 0.3); g.gain.exponentialRampToValueAtTime(0.0001, now + 0.9);
    o.connect(lp); lp.connect(g); g.connect(out); o.start(now); o.stop(now + 1);
    playWhoosh();
  } catch (e) { /* never let audio break the game */ }
}

// The ignition: a snap and a rising "vwoom".
function playSaberIgnite(gain) {
  try {
    var ctx = dsAudio(); if (!ctx) return;
    var now = ctx.currentTime, out = ctx.createGain(); out.gain.value = 0.6 * (gain || 1); out.connect(ctx.destination);
    var src = ctx.createBufferSource(), hp = ctx.createBiquadFilter(), ng = ctx.createGain();
    src.buffer = dsNoise(ctx); hp.type = "highpass"; hp.frequency.value = 2500;
    ng.gain.setValueAtTime(0.7, now); ng.gain.exponentialRampToValueAtTime(0.0001, now + 0.09);
    src.connect(hp); hp.connect(ng); ng.connect(out); src.start(now); src.stop(now + 0.12);
    [[70, 140], [72, 146]].forEach(function (p) {
      var o = ctx.createOscillator(), g = ctx.createGain(), lp = ctx.createBiquadFilter();
      o.type = "sawtooth"; o.frequency.setValueAtTime(p[0], now); o.frequency.exponentialRampToValueAtTime(p[1], now + 0.18); o.frequency.exponentialRampToValueAtTime(p[0] * 1.25, now + 0.5);
      lp.type = "lowpass"; lp.frequency.setValueAtTime(300, now); lp.frequency.exponentialRampToValueAtTime(1800, now + 0.15); lp.frequency.exponentialRampToValueAtTime(500, now + 0.55);
      g.gain.setValueAtTime(0.0001, now); g.gain.exponentialRampToValueAtTime(0.4, now + 0.05); g.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);
      o.connect(lp); lp.connect(g); g.connect(out); o.start(now); o.stop(now + 0.65);
    });
  } catch (e) { /* */ }
}
function playSaberRetract() {
  try {
    var ctx = dsAudio(); if (!ctx) return;
    var now = ctx.currentTime, out = ctx.createGain(); out.gain.value = 0.45; out.connect(ctx.destination);
    var o = ctx.createOscillator(), g = ctx.createGain(), lp = ctx.createBiquadFilter();
    o.type = "sawtooth"; o.frequency.setValueAtTime(150, now); o.frequency.exponentialRampToValueAtTime(45, now + 0.3);
    lp.type = "lowpass"; lp.frequency.setValueAtTime(1500, now); lp.frequency.exponentialRampToValueAtTime(200, now + 0.3);
    g.gain.setValueAtTime(0.4, now); g.gain.exponentialRampToValueAtTime(0.0001, now + 0.34);
    o.connect(lp); lp.connect(g); g.connect(out); o.start(now); o.stop(now + 0.4);
  } catch (e) { /* */ }
}
// The swing: a "vwoom" that bends up and back down (from cheater.js).
function playSaberSwing() {
  try {
    var ctx = dsAudio(); if (!ctx) return;
    var now = ctx.currentTime, out = ctx.createGain(), p = 0.92 + nativeRandom() * 0.16; out.gain.value = 0.5; out.connect(ctx.destination);
    [[95, "sawtooth"], [97, "sawtooth"], [190, "triangle"]].forEach(function (q) {
      var o = ctx.createOscillator(), g = ctx.createGain(), lp = ctx.createBiquadFilter();
      o.type = q[1]; var f = q[0] * p;
      o.frequency.setValueAtTime(f, now); o.frequency.linearRampToValueAtTime(f * 1.7, now + 0.11); o.frequency.linearRampToValueAtTime(f * 0.85, now + 0.3);
      lp.type = "lowpass"; lp.frequency.setValueAtTime(400, now); lp.frequency.linearRampToValueAtTime(1600, now + 0.11); lp.frequency.linearRampToValueAtTime(350, now + 0.3);
      g.gain.setValueAtTime(0.0001, now); g.gain.exponentialRampToValueAtTime(0.32, now + 0.08); g.gain.exponentialRampToValueAtTime(0.0001, now + 0.34);
      o.connect(lp); lp.connect(g); g.connect(out); o.start(now); o.stop(now + 0.36);
    });
  } catch (e) { /* */ }
}
// Blade meets blade or bat: a crackling zap and a crack.
function playSaberClash(big) {
  try {
    var ctx = dsAudio(); if (!ctx) return;
    big = big || 1;
    var now = ctx.currentTime, out = ctx.createGain(); out.gain.value = 0.6 * Math.min(1.6, big); out.connect(ctx.destination);
    var len = 0.14 + 0.08 * big;
    var src = ctx.createBufferSource(), bp = ctx.createBiquadFilter(), ng = ctx.createGain();
    src.buffer = dsNoise(ctx); bp.type = "bandpass"; bp.frequency.value = 1800; bp.Q.value = 0.8;
    ng.gain.setValueAtTime(0.0001, now);
    for (var t = 0; t < len; t += 0.012) ng.gain.setValueAtTime((0.3 + nativeRandom() * 0.7) * (1 - t / len), now + t); // crackle
    ng.gain.setValueAtTime(0.0001, now + len);
    src.connect(bp); bp.connect(ng); ng.connect(out); src.start(now); src.stop(now + len + 0.02);
    var o = ctx.createOscillator(), g = ctx.createGain();
    o.type = "square"; o.frequency.setValueAtTime(130, now); o.frequency.exponentialRampToValueAtTime(60, now + len);
    g.gain.setValueAtTime(0.25, now); g.gain.exponentialRampToValueAtTime(0.0001, now + len);
    o.connect(g); g.connect(out); o.start(now); o.stop(now + len + 0.02);
    playPunch(10 + 4 * big);
  } catch (e) { /* */ }
}
// Grinding blade on blade through a lock.
function playSaberLockBuzz(dur) {
  try {
    var ctx = dsAudio(); if (!ctx) return;
    var now = ctx.currentTime + 0.05, out = ctx.createGain(); out.gain.value = 0.35; out.connect(ctx.destination);
    var buf = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * dur), ctx.sampleRate), d = buf.getChannelData(0), gate = 1;
    for (var i = 0; i < d.length; i++) { if (i % 300 === 0) gate = nativeRandom() < 0.55 ? 0.3 + nativeRandom() * 0.7 : 0.1; d[i] = (nativeRandom() * 2 - 1) * gate; }
    var src = ctx.createBufferSource(), bp = ctx.createBiquadFilter(), g = ctx.createGain();
    src.buffer = buf; bp.type = "bandpass"; bp.frequency.value = 1500; bp.Q.value = 0.7;
    g.gain.setValueAtTime(0.0001, now); g.gain.exponentialRampToValueAtTime(0.8, now + 0.08); g.gain.setValueAtTime(0.8, now + dur - 0.15); g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
    src.connect(bp); bp.connect(g); g.connect(out); src.start(now); src.stop(now + dur + 0.02);
    var o = ctx.createOscillator(), og = ctx.createGain(), lp = ctx.createBiquadFilter();
    o.type = "sawtooth"; o.frequency.value = 110; lp.type = "lowpass"; lp.frequency.value = 700;
    og.gain.setValueAtTime(0.0001, now); og.gain.exponentialRampToValueAtTime(0.35, now + 0.1); og.gain.setValueAtTime(0.35, now + dur - 0.15); og.gain.exponentialRampToValueAtTime(0.0001, now + dur);
    o.connect(lp); lp.connect(og); og.connect(out); o.start(now); o.stop(now + dur + 0.02);
  } catch (e) { /* */ }
}
// The saber landing on someone: a sizzle and a hit.
function playSaberHit(big) {
  try {
    var ctx = dsAudio(); if (!ctx) return;
    var now = ctx.currentTime, out = ctx.createGain(); out.gain.value = big ? 0.7 : 0.5; out.connect(ctx.destination);
    var src = ctx.createBufferSource(), hp = ctx.createBiquadFilter(), ng = ctx.createGain();
    src.buffer = dsNoise(ctx); hp.type = "highpass"; hp.frequency.value = 3000;
    ng.gain.setValueAtTime(0.6, now); ng.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
    src.connect(hp); hp.connect(ng); ng.connect(out); src.start(now); src.stop(now + 0.2);
    var o = ctx.createOscillator(), g = ctx.createGain();
    o.type = "sawtooth"; o.frequency.setValueAtTime(220, now); o.frequency.exponentialRampToValueAtTime(70, now + 0.22);
    g.gain.setValueAtTime(0.3, now); g.gain.exponentialRampToValueAtTime(0.0001, now + 0.24);
    o.connect(g); g.connect(out); o.start(now); o.stop(now + 0.26);
    playPunch(big ? 24 : 14);
  } catch (e) { /* */ }
}
// Air rushing in toward his hand.
function playForcePull() {
  try {
    var ctx = dsAudio(); if (!ctx) return;
    var now = ctx.currentTime, out = ctx.createGain(); out.gain.value = 0.6; out.connect(ctx.destination);
    var buf = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * 0.4), ctx.sampleRate), d = buf.getChannelData(0);
    for (var i = 0; i < d.length; i++) d[i] = nativeRandom() * 2 - 1;
    var src = ctx.createBufferSource(), bp = ctx.createBiquadFilter(), g = ctx.createGain();
    src.buffer = buf; bp.type = "bandpass"; bp.Q.value = 2.5;
    bp.frequency.setValueAtTime(250, now); bp.frequency.exponentialRampToValueAtTime(2400, now + 0.32);
    g.gain.setValueAtTime(0.0001, now); g.gain.exponentialRampToValueAtTime(0.9, now + 0.3); g.gain.exponentialRampToValueAtTime(0.0001, now + 0.38);
    src.connect(bp); bp.connect(g); g.connect(out); src.start(now); src.stop(now + 0.4);
  } catch (e) { /* */ }
}
// The push: a deep "whoomp" and a rush of air.
function playForcePush() {
  try {
    var ctx = dsAudio(); if (!ctx) return;
    var now = ctx.currentTime, out = ctx.createGain(); out.gain.value = 0.8; out.connect(ctx.destination);
    var o = ctx.createOscillator(), g = ctx.createGain();
    o.type = "sine"; o.frequency.setValueAtTime(95, now); o.frequency.exponentialRampToValueAtTime(32, now + 0.45);
    g.gain.setValueAtTime(0.0001, now); g.gain.exponentialRampToValueAtTime(0.9, now + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, now + 0.55);
    o.connect(g); g.connect(out); o.start(now); o.stop(now + 0.6);
    var buf = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * 0.6), ctx.sampleRate), d = buf.getChannelData(0);
    for (var i = 0; i < d.length; i++) d[i] = nativeRandom() * 2 - 1;
    var src = ctx.createBufferSource(), bp = ctx.createBiquadFilter(), ng = ctx.createGain();
    src.buffer = buf; bp.type = "bandpass"; bp.Q.value = 1.2;
    bp.frequency.setValueAtTime(1800, now); bp.frequency.exponentialRampToValueAtTime(300, now + 0.5);
    ng.gain.setValueAtTime(0.0001, now); ng.gain.exponentialRampToValueAtTime(0.8, now + 0.03); ng.gain.exponentialRampToValueAtTime(0.0001, now + 0.55);
    src.connect(bp); bp.connect(ng); ng.connect(out); src.start(now); src.stop(now + 0.6);
  } catch (e) { /* */ }
}
