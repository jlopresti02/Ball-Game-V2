// Tony Ferguson's Katanas special (special.move "katana"). Steel blades
// slide out of both elbows, he hunts them down slashing, and it ends with an
// X-slash. Only his own two arms: each katana comes out of the point of an
// elbow (Joe, 2026-11-13, picked from the slash-options demo).
//
// Mostly A, now and then B or C, just for variety:
//   A  sweeping slash  he twists back, rips one blade through a wide arc in
//                      front with a swoosh, lunging into it. Every 4th one is
//                      both blades at once (`damage`, x1.5 for both).
//   B  blade cyclone   `cycloneChance`% of slashes: a quick spin like a
//                      blender, both blades out, `cycloneTime` seconds, at
//                      most `cycloneHits` cuts and no knockback. Never starts
//                      when they're near the cage and stops drifting into
//                      them if they get there, so nobody gets stun-locked in
//                      a corner (Joe's rule).
//   C  flash-step      `flashChance`% of slashes: a crouch, he streaks past
//                      them in a blur, freezes on the far side... and the cut
//                      opens up on them (x1.3).
// Neither B nor C comes twice in a row: two A slashes in between.
// The X-slash: blades crossed high with a glint, he dashes in and both rip
// down through them (`finisher`), a big X on them and a wall slam.
//
// Clashes (`clash` in his special, Joe 2026-11-13): Ilia's rapier and
// Dustin's diamond sword come out against the katanas, Hokit's Dark Side
// counts them as a weapon. A cut into a sword, saber or bat is parried or
// clashes (`parry`% by weapon), and his blades knock a bat or saber swing
// away the same way. The `lockAfter`-th clash of a special is a KATANA LOCK:
// side by side, blades crossed, shoving and sparking, nothing lands. Then
// `win` (an X cut and a wall slam), `hurt` (their weapon gets through, he's
// slammed back) or `disarm` (their weapon goes flying, gone for the fight;
// Hokit Force-pulls his saber back and Force-pushes Tony). Tony is never
// disarmed: the blades are part of him.
//
// Every cut is hurt(..., "elbow"), so slips, blocks, GSP's Maple Shield
// (gsp-shield.js) and the rest work as before. `critChance`% are crits for
// `critMult`x that can open a `cut`.
"use strict";

var KAT_A_DUR = 0.42, KAT_A_HIT = 0.5;
var KAT_LEN = 1.5; // blade length, in ball radii

function katClamp(u) { return Math.max(0, Math.min(1, u)); }
function katEaseInOut(u) { u = katClamp(u); return u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2; }
function katWallGap(b) { return Math.min(b.x - b.r, W - b.r - b.x, b.y - b.r, H - b.r - b.y); }

// From updateSpecial (special.js) for special.move "katana".
function updateKatanas(self, other, dt) {
  var sp = self.char.special;
  if (!self.igbb) {
    if (self.specialT < sp.chargeTime || !canStartIgbb(self, other) || fergusonBusy(self) || self.elbowAnim || swordDuelActive()) return false;
    clearActions(self);
    self.igbb = { move: "katana", phase: "draw", t: 0, n: 0, next: 0, side: 1, crits: 0, plain: 1, fx: [],
      read: Math.random() * 100 < sp.readChance + (other.char.hasWeave ? 15 : 0) };
    self.specialT = 0;
    floater(self.x, self.y - self.r - 30, "KATANAS!", "crit");
    if (self.igbb.read) floater(other.x, other.y - other.r - 30, "!", "crit");
    playKatanaDraw();
    crowdReact(0.8);
  }
  var m = self.igbb;
  if (m.move !== "katana") return false;
  // Held in a katana lock (his special runs before the lock hold in the
  // abilities loop), or stunned / thrown by a Force push or a wall slam:
  // the special waits instead of steering him.
  if (katanaLockHeld(self) || self.slam || (self.checkStun || 0) > 0) { if (katanaLockHeld(self)) { self.vx = 0; self.vy = 0; } return true; }
  m.t += dt;
  m.fx.forEach(function (f) { f.t += dt; });
  m.fx = m.fx.filter(function (f) { return f.t < f.max; });
  var dx = other.x - self.x, dy = other.y - self.y, d = Math.sqrt(dx * dx + dy * dy) || 1, ux = dx / d, uy = dy / d, gap = d - self.r - other.r;
  m.ang = Math.atan2(uy, ux);
  if (over && m.phase !== "sheathe") { m.phase = "sheathe"; m.t = 0; m.sl = null; }
  if (m.phase === "draw") {
    // The blades sliding out of his elbows: the tell.
    self.vx = 0; self.vy = 0;
    if (m.read && other.alive && inOrdinaryMovement(other)) { var bs = Math.max(Math.sqrt(other.vx * other.vx + other.vy * other.vy), 220); other.vx = ux * bs; other.vy = uy * bs; }
    if (m.t >= sp.draw) { m.phase = "close"; m.t = 0; }
    return true;
  }
  if (m.phase === "close") {
    if (m.sl) katRunSlash(self, other, sp, m, dt, ux, uy, gap);
    else {
      var spd = (self.baseSpeed || SPEED) * sp.speed * (gap < 6 ? 0.2 : 1);
      if (other.alive) { self.vx = ux * spd; self.vy = uy * spd; }
      m.next -= dt;
      if (m.next <= 0 && other.alive && gap < sp.reach + 40 && m.t < sp.time) katStartSlash(self, other, sp, m, gap);
    }
    if ((m.t >= sp.time && !m.sl) || !other.alive) {
      m.phase = "x"; m.t = 0; m.sl = null; m.xGhost = null;
      if (other.alive) floater(self.x, self.y - self.r - 30, "X SLASH!", "crit");
      playKatanaDraw();
    }
    return true;
  }
  if (m.phase === "x") {
    // Crossed high with a glint, then a dash in and both blades rip down.
    self.vx = 0; self.vy = 0;
    if (m.t >= 0.36 && m.t < 0.5 && gap > 2 && other.alive) {
      var st = Math.min(gap - 2, 2600 * dt);
      self.x += ux * st; self.y += uy * st;
      (m.xGhost = m.xGhost || []).push({ x: self.x, y: self.y });
    }
    if (!m.xHit && m.t >= 0.5) {
      m.xHit = true;
      if (other.alive && gap < sp.reach + 40) {
        var crit = Math.random() * 100 < sp.critChance, dealt = hurt(other, sp.finisher * (crit ? sp.critMult : 1), "elbow", self.id);
        if (dealt > 0) {
          if (crit) floater(other.x, other.y - other.r - 44, "CRIT SLASH!", "crit");
          if (sp.cut) openCut(other, Math.atan2(-uy, -ux), sp.cut, self.id);
          m.fx.push({ id: other.id, ang: m.ang, t: 0, max: 0.9, kind: "x" });
          elbowSpark(self, other, ux, uy, true, true);
          playElbowHit(dealt, true, true);
          if (!other.justDodged && !other.grappled && !other.slam && !other.koOut) beginWallSlam(other, ux, uy, { knockback: 1100, wallSlams: 1, slamDamage: 4 });
          hitStop = Math.max(hitStop, 0.14);
          if (!reduceMotion) shake = Math.max(shake, 18);
        }
        checkEnd();
      } else if (other.alive) floater(other.x, other.y - other.r - 8, "WHIFF", "dodge");
    }
    if (m.t >= 0.95) { m.phase = "sheathe"; m.t = 0; }
    return true;
  }
  self.vx = 0; self.vy = 0;
  if (m.t >= 0.5) { self.igbb = null; self.elbowAnim = null; if (self.alive) setSpeed(self, self.baseSpeed || SPEED); return false; }
  return true;
}

// Picks the next slash: mostly A, sometimes a quick B or C.
function katStartSlash(self, other, sp, m, gap) {
  m.n++; m.side = -m.side;
  var kind = "A", roll = Math.random() * 100;
  if (m.plain >= 2) {
    // The cyclone never starts with them up against the cage (it's a C then).
    if (roll < (sp.cycloneChance || 0) && katWallGap(other) > 20) kind = "B";
    else if (roll < (sp.cycloneChance || 0) + (sp.flashChance || 0) && gap < (sp.flashRange || 150)) kind = "C";
  }
  m.plain = kind === "A" ? m.plain + 1 : 0;
  m.sl = { kind: kind, t: 0, side: m.side, hit: false, both: kind === "A" && m.n % 4 === 0, spin: 0, spinV: 0, hits: 0, cd: 0, whoosh: 0, phase: "crouch" };
  if (kind === "A") playElbowSwish(true);
  if (kind === "B") floater(self.x, self.y - self.r - 30, "CYCLONE!", "crit");
}

function katRunSlash(self, other, sp, m, dt, ux, uy, gap) {
  var sl = m.sl;
  sl.t += dt;
  if (sl.kind === "A") {
    var p = sl.t / KAT_A_DUR;
    var spd = (self.baseSpeed || SPEED) * sp.speed;
    if (p > 0.35 && p < 0.6) { self.vx = ux * 260; self.vy = uy * 260; } // lunging into it
    else { self.vx = ux * spd * 0.3; self.vy = uy * spd * 0.3; }
    if (!sl.hit && p >= KAT_A_HIT) {
      sl.hit = true;
      if (other.alive && gap < sp.reach + 34) katCut(self, other, sp, m, sl.both ? 1.5 : 1, sl.both ? "x" : "line", m.ang + (sl.both ? 0 : sl.side * 0.9), true);
      else if (other.alive) floater(other.x, other.y - other.r - 8, "WHIFF", "dodge");
    }
    if (sl.t >= KAT_A_DUR) { m.sl = null; m.next = 0.12; }
    return;
  }
  if (sl.kind === "B") {
    // A short spin: up to speed, round twice, wind down.
    var T = sp.cycloneTime || 0.65, k = katClamp(sl.t / 0.12) * katClamp((T - sl.t) / 0.12 + 0.15);
    sl.spinV = 2 * Math.PI * 3.2 * k;
    sl.spin += sl.spinV * dt;
    // Drifts in, but never pins them: stops if they're near the cage.
    var drift = katWallGap(other) > other.r + 25 && gap > 4 ? (self.baseSpeed || SPEED) * 0.5 : 0;
    self.vx = ux * drift; self.vy = uy * drift;
    sl.cd -= dt; sl.whoosh -= dt;
    if (sl.whoosh <= 0 && k > 0.4) { sl.whoosh = 0.16; playElbowSwish(true); }
    for (var s = -1; s <= 1; s += 2) {
      var ba = sl.spin + (s > 0 ? 0 : Math.PI), diff = Math.atan2(Math.sin(ba - m.ang), Math.cos(ba - m.ang));
      if (sl.cd <= 0 && sl.hits < (sp.cycloneHits || 2) && Math.abs(diff) < 0.35 && k > 0.5 && other.alive && gap < self.r * 1.25) {
        sl.cd = 0.25; sl.hits++;
        katCut(self, other, sp, m, 0.8, "line", m.ang + Math.PI / 2 + 0.3, false); // (no knockback: no bouncing them off the cage)
      }
    }
    if (sl.t >= T) { m.sl = null; m.next = 0.2; }
    return;
  }
  // C: crouch, streak past them, freeze, the cut opens.
  if (sl.phase === "crouch") {
    self.vx = 0; self.vy = 0;
    if (sl.t >= 0.2) {
      sl.phase = "go"; sl.t = 0;
      var px = -uy, py = ux, off = (self.r + other.r + 8) * sl.side, pad = self.r + 4;
      var tx = other.x + ux * (other.r + self.r + 40) + px * off, ty = other.y + uy * (other.r + self.r + 40) + py * off;
      sl.x0 = self.x; sl.y0 = self.y;
      sl.x1 = Math.max(pad, Math.min(W - pad, tx)); sl.y1 = Math.max(pad, Math.min(H - pad, ty));
      sl.mx = Math.max(pad, Math.min(W - pad, other.x + px * off)); sl.my = Math.max(pad, Math.min(H - pad, other.y + py * off)); // the graze point
      sl.dir = Math.atan2(sl.y1 - sl.y0, sl.x1 - sl.x0);
      sl.ghosts = [];
      sl.willHit = gap < (sp.flashRange || 150) && other.alive;
      playKatanaDraw();
    }
    return;
  }
  if (sl.phase === "go") {
    var u = Math.min(1, sl.t / 0.08), a = u < 0.5 ? u * 2 : (u - 0.5) * 2;
    sl.ghosts.push({ x: self.x, y: self.y });
    self.x = u < 0.5 ? sl.x0 + (sl.mx - sl.x0) * a : sl.mx + (sl.x1 - sl.mx) * a;
    self.y = u < 0.5 ? sl.y0 + (sl.my - sl.y0) * a : sl.my + (sl.y1 - sl.my) * a;
    self.vx = 0; self.vy = 0;
    if (u >= 1) { sl.phase = "freeze"; sl.t = 0; }
    return;
  }
  self.vx = 0; self.vy = 0;
  if (!sl.hit && sl.t >= 0.16) {
    sl.hit = true;
    if (sl.willHit) katCut(self, other, sp, m, 1.3, "line", sl.dir, true);
    else if (other.alive) floater(other.x, other.y - other.r - 8, "WHIFF", "dodge");
  }
  if (sl.t >= 0.34) { m.sl = null; m.next = 0.15; }
}

// One cut landing.
function katCut(self, other, sp, m, mult, fxKind, fxAng, knock) {
  if (!other.alive || other.koOut) return 0;
  // Their weapon in the way: parried or a clash. Once the blades have met,
  // nothing gets through until the katana lock is decided.
  var w = katOppWeapon(other);
  if (w && katClashLive(self) && ((m.clashes > 0 && !m.lockDone) || Math.random() * 100 < katClashCfg(self).parry[w])) { katClash(self, other, w, true); return 0; }
  var dx = other.x - self.x, dy = other.y - self.y, d = Math.sqrt(dx * dx + dy * dy) || 1, ux = dx / d, uy = dy / d;
  var crit = Math.random() * 100 < sp.critChance;
  var dealt = hurt(other, sp.damage * (crit ? sp.critMult : 1) * mult, "elbow", self.id);
  if (dealt > 0) {
    if (knock && !other.justDodged && elbowKnockable(other)) { other.vx += ux * (crit ? 200 : 110); other.vy += uy * (crit ? 200 : 110); }
    elbowSpark(self, other, ux, uy, crit, true);
    m.fx.push({ id: other.id, ang: fxAng, t: 0, max: fxKind === "x" ? 0.9 : 0.45, kind: fxKind });
    if (crit) {
      if (!m.crits) floater(other.x, other.y - other.r - 30, "CRIT SLASH!", "crit"); // (only the first crit's call-out, so the flurry stays readable)
      m.crits++;
      if (sp.cut && Math.random() * 100 < sp.cut.chance) openCut(other, Math.atan2(-uy, -ux), sp.cut, self.id, true);
      hitStop = Math.max(hitStop, 0.06);
    }
    playElbowHit(dealt, crit, true);
    if (!reduceMotion) shake = Math.max(shake, crit ? 12 : 6);
  }
  checkEnd();
  return dealt;
}

// ------------------------------------------------------------ clashes

var KL_IN = 0.25, KL_TIME = 1.35;
var katanaLock = null; // the lock, while it's on

function katClashCfg(t) { return t.char.special.clash || { parry: { blade: 55, saber: 50, bat: 40 }, lockAfter: 2, win: 40, hurt: 30, disarm: 30, winDamage: 26, hurtDamage: 18 }; }
// The weapon in their hands that can meet his blades.
function katOppWeapon(o) {
  if (!o || !o.alive) return null;
  var h = bladeHost(o);
  if (h && h.sword && h.sword.out && h.sword.t >= SWORD_DRAW) return "blade";
  if (sithArmed(o)) return "saber";
  if (o.cheater && o.cheater.mode === "bat") return "bat";
  return null;
}
function katClashLive(t) { return katanaOn(t) && t.igbb.phase === "close" && !katanaLock && !swordDuelActive() && !saberLock; }
// From swordWeaponOut (sword.js): his katanas pull Ilia's and Dustin's swords out like a bat does.
function katanaWeaponOut(o) { return katanaOn(o) && o.alive && o.igbb.phase !== "sheathe" ? "bat" : null; }
// From updateDarkSide (hokit-darkside.js): Hokit can suit up against the katanas mid special.
function canSuitUpVsKatanas(self, other) { return katanaOn(other) && !specialBusy(self) && !self.punch && !self.kick; }
// From the bat landing (cheater.js): a bat, club or saber swing into Tony's blades.
function katanaBatClash(def, atk) {
  if (!katClashLive(def) || !atk.cheater) return false;
  var w = atk.cheater.saber ? "saber" : "bat";
  if (Math.random() * 100 >= katClashCfg(def).parry[w]) return false;
  atk.chAct = null;
  katClash(def, atk, w, false);
  return true;
}
function katClash(t, o, w, tonyAttacking) {
  var m = t.igbb, cc = katClashCfg(t), nx = o.x - t.x, ny = o.y - t.y, nd = Math.sqrt(nx * nx + ny * ny) || 1;
  nx /= nd; ny /= nd;
  var cx = (t.x + o.x) / 2, cy = (t.y + o.y) / 2 - t.r * 0.3;
  m.clashes = (m.clashes || 0) + 1;
  if (m.clashes >= cc.lockAfter && !m.locked) { m.locked = true; startKatanaLock(t, o, w); return; }
  if (w === "saber") saberClashFx(cx, cy, -nx, -ny, 1.2); else clashFx(cx, cy, -nx, -ny, 1.2, w === "blade" ? bladeColors(o) : null);
  var h = bladeHost(o);
  if (h && h.sword) { h.sword.parry = 0; h.sword.parries = 0; }
  var kb = 420; // whoever swung gets knocked back off it
  if (tonyAttacking) { t.vx = -nx * kb; t.vy = -ny * kb; o.vx += nx * kb * 0.3; o.vy += ny * kb * 0.3; t.squash = { t: 0.14, max: 0.14, nx: nx, ny: ny }; }
  else { o.vx = nx * kb; o.vy = ny * kb; t.vx -= nx * kb * 0.3; t.vy -= ny * kb * 0.3; o.squash = { t: 0.14, max: 0.14, nx: -nx, ny: -ny }; if (o.cheater) o.cheater.cd = Math.max(o.cheater.cd, 0.6); }
  if (m.sl && m.sl.kind === "A") m.sl.hit = true;
  floater(cx, Math.min(t.y, o.y) - t.r - 34, w === "blade" && tonyAttacking ? "PARRY!" : "CLASH!", "crit");
  crowdReact(0.6);
  if (w === "saber") playSaberClash(1); else playSwordClash(1);
}

function startKatanaLock(t, o, w) {
  clearActions(o); o.chAct = null;
  var m = t.igbb, cc = katClashCfg(t);
  m.sl = null; m.next = 0.35;
  // Side by side, like Hokit's saber lock, so the blades cross over the middle.
  var nx = o.x >= t.x ? 1 : -1, gap = t.r + o.r + 40;
  var mx = Math.min(W - gap / 2 - t.r - 10, Math.max(gap / 2 + t.r + 10, (t.x + o.x) / 2));
  var my = Math.min(H - t.r - 10, Math.max(t.r * 2.4, (t.y + o.y) / 2));
  var r = Math.random() * (cc.win + cc.hurt + cc.disarm), out = r < cc.win ? "win" : r < cc.win + cc.hurt ? "hurt" : "disarm";
  katanaLock = { tId: t.id, oId: o.id, tRef: t, oRef: o, w: w, t: 0, nx: nx, mx: mx, my: my, gap: gap,
    fromT: { x: t.x, y: t.y }, fromO: { x: o.x, y: o.y }, outcome: out, sparkT: 0 };
  t.vx = t.vy = o.vx = o.vy = 0;
  floater(mx, my - t.r - 56, "KATANA LOCK!", "crit");
  crowdReact(1);
  if (w === "saber") { playSaberClash(1.6); playSaberLockBuzz(KL_TIME - KL_IN); } else playSwordClash(1.6);
  if (!reduceMotion) shake = Math.max(shake, 12);
}
// Both of them held (swordDuelLocked, sword.js); the one with the bat or
// saber drawn in its lock pose (cheater.js).
function katanaLockHeld(b) { return !!(katanaLock && b && (b === katanaLock.tRef || b === katanaLock.oRef)); }
function katanaLockOpp(b) { return !!(katanaLock && b && b === katanaLock.oRef); }
function katLockPoint() { var L = katanaLock, t = L.tRef, o = L.oRef; return { x: (t.x + o.x) / 2, y: (t.y + o.y) / 2 - t.r * 1.1 }; }

// Every frame (update.js).
function tickKatanaLock(dt) {
  var L = katanaLock;
  if (!L) return;
  var t = L.tRef, o = L.oRef;
  if (balls[L.tId] !== t || balls[L.oId] !== o || !t.alive || !o.alive || over || !katanaOn(t)) { katanaLock = null; return; }
  if (L.w === "bat" && !o.cheater) { katanaLock = null; t.igbb.lockDone = true; return; } // their bat went away (the ref woke up)
  if (L.w === "bat" && o.cheater.mode !== "bat") o.cheater.mode = "bat"; // (a new Cheater mode doesn't take it out of their hands mid lock)
  L.t += dt;
  var k = ease(L.t / KL_IN), push = L.t > KL_IN ? Math.sin((L.t - KL_IN) * 7) * t.r * 0.14 : 0, half = L.gap / 2;
  var tx = L.mx - L.nx * (half - push), ox = L.mx + L.nx * (half + push);
  t.x = L.fromT.x + (tx - L.fromT.x) * k; t.y = L.fromT.y + (L.my - L.fromT.y) * k;
  o.x = L.fromO.x + (ox - L.fromO.x) * k; o.y = L.fromO.y + (L.my - L.fromO.y) * k;
  t.vx = t.vy = o.vx = o.vy = 0;
  var h = bladeHost(o);
  if (h && h.sword) h.sword.parry = 0.12; // their sword held up against his
  if (L.t > KL_IN) {
    L.sparkT -= dt;
    if (L.sparkT <= 0) {
      L.sparkT = 0.07;
      var p = katLockPoint();
      for (var i = 0; i < 4 && !reduceMotion; i++) {
        var a = -Math.PI / 2 + (Math.random() - 0.5) * 2.6, s = 120 + Math.random() * 260;
        particles.push({ x: p.x, y: p.y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 0.3, max: 0.3, size: 2 + Math.random() * 2.5, color: i % 2 ? (L.w === "saber" ? "#ff3b3b" : "#ffffff") : "#fff2c2" });
      }
      if (!reduceMotion) shake = Math.max(shake, 3);
    }
  }
  if (L.t < KL_TIME) return;
  // Broken apart: how it ends.
  katanaLock = null;
  var m = t.igbb, cc = katClashCfg(t), nx = L.nx, p2 = { x: (t.x + o.x) / 2, y: (t.y + o.y) / 2 - t.r * 0.5 };
  m.lockDone = true;
  if (L.w === "saber") saberClashFx(p2.x, p2.y, nx, 0, 2); else clashFx(p2.x, p2.y, nx, 0, 2, L.w === "blade" ? bladeColors(o) : null);
  if (L.outcome === "win") {
    // He shoves their weapon up and rips both blades down through them.
    var dealt = hurt(o, cc.winDamage, "igbb", t.id);
    floater(o.x, o.y - o.r - 34, "KATANA SLASH!", "crit");
    m.fx.push({ id: o.id, ang: Math.atan2(o.y - t.y, o.x - t.x), t: 0, max: 0.9, kind: "x" });
    playElbowHit(cc.winDamage, true, true);
    if (dealt > 0 && o.alive) beginWallSlam(o, nx, 0, { knockback: 1100, wallSlams: 1, slamDamage: 4 });
    if (!reduceMotion) { shake = Math.max(shake, 22); hitStop = Math.max(hitStop, 0.1); }
  } else if (L.outcome === "hurt") {
    // They muscle through it and hit him.
    var dealt2 = hurt(t, cc.hurtDamage, "igbb", o.id);
    t.flash = 0.16;
    floater(t.x, t.y - t.r - 34, L.w === "saber" ? "SABER SLASH!" : L.w === "blade" ? (o.rapier ? "RAPIER SLASH!" : "DIAMOND SLASH!") : (o.cheater && o.cheater.club ? "WHACK!" : "CRACK!"), "crit");
    if (o.cheater) o.chAct = { kind: "bat", t: (cheaterCfg(o).bat.windup || 0), hit: true, dir: 1 };
    if (L.w === "saber") playSaberHit(true); else if (L.w === "bat") playBatHit(true); else playSwordClash(1.4);
    if (dealt2 > 0 && t.alive) beginWallSlam(t, -nx, 0, { knockback: 1100, wallSlams: 1, slamDamage: 4 });
    if (!reduceMotion) { shake = Math.max(shake, 20); hitStop = Math.max(hitStop, 0.08); }
  } else {
    // He twists their weapon out of their hands.
    floater(o.x, o.y - o.r - 34, "DISARMED!", "crit");
    playSwordClash(1.6);
    if (L.w === "saber") startForce(o, t, nx, 0); // Hokit: pulls it back with the Force and pushes Tony away (hokit-darkside.js)
    else {
      var oh = bladeHost(o), blade = oh && oh.sword ? (o.rapier ? "rapier" : "longsword") : null;
      flyingBats.push({ x: o.x + nx * o.r * 0.5, y: o.y - o.r * 0.4, vx: nx * 380, vy: -820, rot: 0, spin: 19, t: 0, len: blade ? o.r * bladeLen(o) : weaponLen(o), trail: [], club: !!(o.cheater && o.cheater.club), blade: blade });
      if (o.cheater) { o.cheater = null; o.weaponLost = true; } // the bat or club is gone for the fight
      if (blade) { oh.sword = null; oh.disarmed = true; } // and so is a sword
      o.vx = nx * 380;
    }
  }
  crowdReact(1);
  checkEnd();
}

// ------------------------------------------------------------ drawing

// From applyFergusonPose (ferguson.js): his body twisting into a slash,
// spinning in the cyclone, crouched before a flash-step.
function applyKatanaPose(b) {
  var m = b.igbb, sl = m.phase === "close" ? m.sl : null, rot = 0, sx = 1, sy = 1;
  if (sl && sl.kind === "A" && !sl.both) {
    var p = sl.t / KAT_A_DUR;
    rot = sl.side * (p < 0.35 ? 0.35 * katEaseInOut(p / 0.35) : 0.35 - 0.7 * katEaseInOut((p - 0.35) / 0.25) + 0.35 * katClamp((p - 0.7) / 0.3));
  } else if (sl && sl.kind === "B") rot = sl.spin;
  else if (sl && sl.kind === "C") {
    if (sl.phase === "crouch") { var k = katClamp(sl.t / 0.1); sx = 1 + 0.08 * k; sy = 1 - 0.12 * k; }
    else if (sl.phase === "go") { sx = 1.25; sy = 0.8; }
  }
  if (rot || sx !== 1) { ctx.translate(b.x, b.y); ctx.rotate(rot); ctx.scale(sx, sy); ctx.translate(-b.x, -b.y); }
}

// One of his own arms: shoulder, the elbow out at angle `th` (`ext` past his
// body), the hand folded back by his chin, and the katana out of the point
// of the elbow pointing `ba`.
function katArm(b, ang, side, th, ext, ba, len, glow) {
  var r = b.r, size = (b.char.punch && b.char.punch.size) || 14, limb = size * 0.7;
  var sh = { x: b.x + Math.cos(th - side * 0.9) * r * 0.55, y: b.y + Math.sin(th - side * 0.9) * r * 0.55 };
  var re = r * 0.95 + ext;
  var el = { x: b.x + Math.cos(th) * re, y: b.y + Math.sin(th) * re };
  var hd = { x: b.x + Math.cos(th - side * 0.75) * r * 0.85, y: b.y + Math.sin(th - side * 0.75) * r * 0.85 };
  if (len > 1) katBlade(el, ba, len, side, glow);
  strokeLimb(limb, armColor(b.char, side), function () { ctx.moveTo(sh.x, sh.y); ctx.lineTo(el.x, el.y); ctx.lineTo(hd.x, hd.y); });
  ctx.fillStyle = shadeHex(b.char.look ? b.char.look.skin : "#d9a27e", -0.12); ctx.strokeStyle = theme.wall; ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.arc(el.x, el.y, limb * 0.62, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  // the guard where the blade comes out of his elbow
  ctx.save(); ctx.translate(el.x, el.y); ctx.rotate(ba);
  ctx.fillStyle = "#151515"; ctx.beginPath(); ctx.ellipse(limb * 0.35, 0, limb * 0.22, limb * 0.62, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#c8a24a"; ctx.beginPath(); ctx.ellipse(limb * 0.35, 0, limb * 0.1, limb * 0.4, 0, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  drawGloveAt(hd.x, hd.y, size * 0.7, b.char, ang);
}
// A katana: dark spine, bright steel, a white edge, curving gently, with a
// gleam running along it.
function katBlade(el, a, len, side, glow) {
  var cx = Math.cos(a), cy = Math.sin(a), nx = -cy * side, ny = cx * side;
  var tip = { x: el.x + cx * len, y: el.y + cy * len };
  var c = { x: el.x + cx * len * 0.55 + nx * len * 0.08, y: el.y + cy * len * 0.55 + ny * len * 0.08 };
  ctx.save(); ctx.lineCap = "round";
  if (glow > 0) {
    ctx.globalAlpha = Math.min(1, glow); ctx.strokeStyle = "rgba(255,255,255,0.8)"; ctx.lineWidth = 16;
    ctx.beginPath(); ctx.moveTo(el.x, el.y); ctx.quadraticCurveTo(c.x, c.y, tip.x, tip.y); ctx.stroke(); ctx.globalAlpha = 1;
  }
  ctx.strokeStyle = "#1d2328"; ctx.lineWidth = 9;
  ctx.beginPath(); ctx.moveTo(el.x, el.y); ctx.quadraticCurveTo(c.x, c.y, tip.x, tip.y); ctx.stroke();
  var g = ctx.createLinearGradient(el.x, el.y, tip.x, tip.y);
  g.addColorStop(0, "#8b98a3"); g.addColorStop(0.5, "#f4f8fb"); g.addColorStop(1, "#cbd6de");
  ctx.strokeStyle = g; ctx.lineWidth = 6;
  ctx.beginPath(); ctx.moveTo(el.x, el.y); ctx.quadraticCurveTo(c.x, c.y, tip.x, tip.y); ctx.stroke();
  ctx.strokeStyle = "rgba(255,255,255,0.95)"; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(el.x + nx * 2.2, el.y + ny * 2.2); ctx.quadraticCurveTo(c.x + nx * 2.2, c.y + ny * 2.2, tip.x, tip.y); ctx.stroke();
  var gl = (performance.now() / 500) % 1;
  ctx.fillStyle = "rgba(255,255,255," + (0.9 * Math.sin(gl * Math.PI)).toFixed(3) + ")";
  ctx.beginPath(); ctx.arc(el.x + (tip.x - el.x) * gl, el.y + (tip.y - el.y) * gl, 3.2, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}
// The swoosh: a crescent between where the middle and the tip of the blade
// were over the last moment of the swing.
function katTrail(pts, alpha) {
  if (pts.length < 2 || alpha <= 0) return;
  ctx.save(); ctx.globalAlpha = alpha;
  for (var i = 1; i < pts.length; i++) {
    var a = pts[i - 1], b = pts[i], k = i / pts.length;
    ctx.fillStyle = "rgba(255,255,255," + (0.15 + 0.75 * k).toFixed(3) + ")";
    ctx.beginPath(); ctx.moveTo(a.m.x, a.m.y); ctx.lineTo(a.t.x, a.t.y); ctx.lineTo(b.t.x, b.t.y); ctx.lineTo(b.m.x, b.m.y); ctx.closePath(); ctx.fill();
  }
  ctx.strokeStyle = "rgba(224,32,42,0.6)"; ctx.lineWidth = 2; ctx.lineCap = "round"; ctx.lineJoin = "round";
  ctx.beginPath(); pts.forEach(function (q, i) { if (i) ctx.lineTo(q.t.x, q.t.y); else ctx.moveTo(q.t.x, q.t.y); }); ctx.stroke();
  ctx.restore();
}
function katPt(b, th, ext, ba, len) {
  var re = b.r * 0.95 + ext, ex = b.x + Math.cos(th) * re, ey = b.y + Math.sin(th) * re;
  return { m: { x: ex + Math.cos(ba) * len * 0.35, y: ey + Math.sin(ba) * len * 0.35 }, t: { x: ex + Math.cos(ba) * len, y: ey + Math.sin(ba) * len } };
}
// A's swing at `p` (0..1): pulled back, ripped across, followed through.
function katPoseA(ang, side, p) {
  var th, ext = 0;
  if (p < 0.35) th = ang + side * (0.95 + 1.0 * katEaseInOut(p / 0.35));
  else if (p < 0.6) { var v = 1 - Math.pow(1 - katClamp((p - 0.35) / 0.25), 2.2); th = ang + side * (1.95 - 3.25 * v); ext = Math.sin(v * Math.PI) * 22; }
  else th = ang + side * (-1.3 + 2.25 * katEaseInOut((p - 0.6) / 0.4));
  return { th: th, ext: ext, ba: th + side * 0.35 };
}
function katGhosts(b, pts, fade) {
  ctx.save();
  pts.forEach(function (g, i) { ctx.globalAlpha = 0.35 * fade * (i + 1) / pts.length; ctx.fillStyle = b.char.color; ctx.beginPath(); ctx.arc(g.x, g.y, b.r, 0, Math.PI * 2); ctx.fill(); });
  ctx.restore();
}

// From drawFerguson (ferguson.js) while his katanas are out.
function drawTfKatanas(b, other, ang) {
  var m = b.igbb, sp = b.char.special, L = b.r * KAT_LEN;
  if (katanaLock && katanaLock.tRef === b && m.phase === "close") {
    // In the lock: both elbows forward, the blades angled up into theirs, straining.
    var lp = katLockPoint(), jt = !reduceMotion ? Math.sin(performance.now() / 21) * 0.04 : 0;
    [-1, 1].forEach(function (s) {
      var th = ang + s * 0.55, re = b.r * 0.95 + 8, ex = b.x + Math.cos(th) * re, ey = b.y + Math.sin(th) * re;
      katArm(b, ang, s, th, 8, Math.atan2(lp.y - ey, lp.x - ex) + jt + s * 0.04, L * 0.92, 0.35 + 0.25 * Math.sin(performance.now() / 40));
    });
    return;
  }
  var len = m.phase === "draw" ? easeOut(m.t / sp.draw) * L : m.phase === "sheathe" ? Math.max(0, 1 - m.t / 0.4) * L : L;
  if (m.phase === "draw" || m.phase === "sheathe") {
    [-1, 1].forEach(function (s) { var th = ang + s * 0.5; katArm(b, ang, s, th, 0, th + s * 0.55, len, m.phase === "draw" ? Math.max(0, 1 - m.t / 0.35) : 0); });
    return;
  }
  if (m.phase === "x") {
    var t = m.t;
    if (m.xGhost && m.xGhost.length > 1 && t < 0.75) katGhosts(b, m.xGhost, Math.max(0, 1 - Math.max(0, t - 0.5) / 0.25));
    [-1, 1].forEach(function (s) {
      var th, ba, ext = 0, glow = 0;
      if (t < 0.5) { var u = easeOut(t / 0.3); th = ang + s * (0.5 - 0.15 * u); ba = ang - s * 0.6 * u; glow = t > 0.3 ? 0.5 + 0.5 * Math.sin(performance.now() / 30) : 0; }
      else { var v = 1 - Math.pow(1 - katClamp((t - 0.5) / 0.14), 2); th = ang + s * (0.35 + 1.4 * v); ba = ang + s * (-0.6 + 2.3 * v); ext = Math.sin(v * Math.PI) * 18; }
      if (t > 0.5 && t < 0.8) {
        var pts = [];
        for (var i = 0; i <= 8; i++) { var q = Math.max(0.5, t - 0.12 + i * 0.015), w = 1 - Math.pow(1 - katClamp((q - 0.5) / 0.14), 2); pts.push(katPt(b, ang + s * (0.35 + 1.4 * w), Math.sin(w * Math.PI) * 18, ang + s * (-0.6 + 2.3 * w), L)); }
        katTrail(pts, Math.max(0, 1 - (t - 0.6) / 0.2));
      }
      katArm(b, ang, s, th, ext, ba, L, glow);
    });
    return;
  }
  var sl = m.sl;
  if (sl && sl.kind === "B") {
    [-1, 1].forEach(function (s) {
      var th = sl.spin + (s > 0 ? 0 : Math.PI), ba = th + 0.45;
      if (sl.spinV > 6) {
        var pts = [];
        for (var i = 0; i <= 12; i++) { var back = (1 - i / 12) * 1.25; pts.push(katPt(b, th - back, 16, ba - back, L)); }
        katTrail(pts, Math.min(1, sl.spinV / 18) * 0.85);
      }
      katArm(b, ang, 1, th, 16, ba, L, 0); // (both arms trail the same way round)
    });
    return;
  }
  if (sl && sl.kind === "C") {
    if (sl.phase === "crouch") {
      var k = easeOut(sl.t / 0.12);
      [-1, 1].forEach(function (s) { var th = ang + s * (0.95 + 1.1 * k); katArm(b, ang, s, th, 0, th + s * 0.9 * k, L, sl.t > 0.12 ? 0.7 : 0); });
      return;
    }
    // the streak and afterimages, then the follow-through: the slashing
    // arm flung out behind him, blade trailing
    var fade = sl.phase === "freeze" ? Math.max(0, 1 - sl.t / 0.3) : 1;
    ctx.save(); ctx.lineCap = "round"; ctx.lineJoin = "round";
    ctx.globalAlpha = 0.8 * fade; ctx.strokeStyle = "#ffffff"; ctx.lineWidth = b.r * 1.2;
    ctx.beginPath(); ctx.moveTo(sl.x0, sl.y0); ctx.lineTo(sl.mx, sl.my); ctx.lineTo(b.x, b.y); ctx.stroke();
    ctx.globalAlpha = 0.9 * fade; ctx.strokeStyle = "#e0202a"; ctx.lineWidth = 3; ctx.stroke();
    ctx.restore();
    katGhosts(b, sl.ghosts, fade);
    [-1, 1].forEach(function (s) {
      if (s === sl.side) katArm(b, sl.dir, s, sl.dir - s * 1.9, 18, sl.dir - s * 2.4, L, sl.phase === "freeze" && sl.t < 0.2 ? 0.5 : 0);
      else katArm(b, sl.dir, s, sl.dir + s * 0.9, 0, sl.dir + s * 0.4, L, 0);
    });
    return;
  }
  [-1, 1].forEach(function (s) {
    if (sl && sl.kind === "A" && (sl.both || sl.side === s)) {
      var p = sl.t / KAT_A_DUR, P = katPoseA(ang, s, p);
      if (p > 0.35 && p < 0.85) {
        var pts = [];
        for (var i = 0; i <= 10; i++) { var Q = katPoseA(ang, s, Math.max(0.35, p - 0.11 + i * 0.011)); pts.push(katPt(b, Q.th, Q.ext, Q.ba, L)); }
        katTrail(pts, katClamp(1 - (p - 0.6) / 0.25));
      }
      katArm(b, ang, s, P.th, P.ext, P.ba, L, sl.hit && p < 0.7 ? 0.6 : 0);
    } else katArm(b, ang, s, ang + s * 0.95, 0, ang + s * 0.35, L, 0); // guard: blades angled out in front
  });
}

// From drawFergusonOver (ferguson.js), over both fighters: a slash line
// across whoever got cut (white, then red, fading) and the big X.
function drawKatanaFx() {
  balls.forEach(function (b) {
    if (!katanaOn(b)) return;
    b.igbb.fx.forEach(function (f) {
      var o = balls[f.id];
      if (!o) return;
      var k = f.t / f.max, R = o.r * 1.5, lines = f.kind === "x" ? [f.ang + Math.PI / 4, f.ang - Math.PI / 4] : [f.ang];
      ctx.save(); ctx.lineCap = "round";
      lines.forEach(function (a, i) {
        var grow = katClamp((f.t - i * 0.05) / 0.06), cx = Math.cos(a), cy = Math.sin(a);
        var x0 = o.x - cx * R, y0 = o.y - cy * R, x1 = x0 + cx * 2 * R * grow, y1 = y0 + cy * 2 * R * grow;
        var w = (f.kind === "x" ? 12 : 8) * (1 - k * 0.6);
        ctx.globalAlpha = Math.max(0, 1 - k);
        ctx.strokeStyle = "rgba(224,32,42,0.9)"; ctx.lineWidth = w + 6; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
        ctx.strokeStyle = "#ffffff"; ctx.lineWidth = w * (k < 0.3 ? 1 : 0.5); ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
      });
      if (f.kind === "x" && k < 0.35 && !reduceMotion) { ctx.globalAlpha = 0.3 * (1 - k / 0.35); ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, W, H); }
      ctx.restore();
    });
  });
}
