// Alex Pereira, "Poatan" (Christian, 2026-11-12). Light Heavyweight.
//
// Step       he stalks slowly (char.speedMult) on a bouncing 1-2, 1-2 step
//            that dips his level (applyPoatanStep). Stone fists
//            (look.stoneFists, fighter-art.js): "Poatan" means "stone hands".
// CHAMA      every few seconds when he's close (poatan.chama): he plants and
//            shouts "CHAMA!", and the crowd shouts it back. The shout is the
//            tell: some opponents read it and back off (readChance, more for
//            a weaver). Then he steps in behind left-right-left, the last one
//            the left hook. A clean hook is a knockout koBase% of the time at
//            full health, up to koBase + koLow% the more hurt they are; then
//            he shoots an arrow into the sky. Otherwise it's a big shot.
// Calf kicks his kicks land low (poatan.calfKick): they limp at `slow` speed
//            for `time` seconds (slowdown.js).
// Bow and Arrow  his special (special.move "bow"): he draws a big red bow,
//            the ricochet path lights up red, and he fires a big red arrow
//            that bings off the cage up to `bounces` times. It hits them up to
//            `hits` times (damage, then secondHit), unblockable (Charles can
//            still teleport out of its way), then thunks into the cage.
// Duck season  against Jon Jones (poatan.duckHunt): when Jon turns into a duck
//            and flies off, `chance`% of the time Pereira shoots it out of the
//            sky. Jon still drops into the circle, but harmlessly, and takes
//            `damage` himself ("SHOT DOWN!", jon-duck.js).
// The bow moves run on b.igbb (moves "bow" and "duckhunt"); CHAMA runs on
// b.chama and doesn't make him untouchable.
"use strict";

var PO_DRAW = 0.55, PO_AIM = 0.85, PO_LOCK = 0.3, PO_LOOSE = 0.12, PO_HOLD = 0.7; // the bow
var PO_KO_BEAT = 0.45;   // watching them drop before the celebration
var PO_ECHO = 1.2;       // how long the crowd's "CHAMA!" stays up
var CHAMA_SEQ = [{ kind: "jab", side: -1, hit: "jab" }, { kind: "jab", side: 1, hit: "cross" }, { kind: "qhook", side: -1, hit: "hook" }];
var poArrow = null;      // the arrow flying round the cage (one at a time)
var poSkyArrows = [];    // arrows shot straight up (the KO celebration, duck season)
var poFeathers = [];     // the duck's feathers when he shoots it down
var poEcho = null;       // the crowd shouting CHAMA back
var poClock = 0;

function poRand(r) { return r[0] + Math.random() * (r[1] - r[0]); }
function poCfg(b) { return b && b.char && b.char.poatan; }
function bowOn(b) { return !!(b && b.igbb && (b.igbb.move === "bow" || b.igbb.move === "duckhunt")); }
function chamaOn(b) { return !!(b && b.chama); }
// Planted for the shout or lunging behind the combo: the speed regulator
// leaves him alone (physics.js).
function pereiraBusy(b) { return chamaOn(b); }
// Both hands are drawn by drawPereira (drawHands skips them, draw-attacks.js).
function pereiraHandsBusy(b) { return bowOn(b) || (chamaOn(b) && b.chama.phase !== "combo"); }

// From startMatchSeeded.
function resetPereira() { poArrow = null; poSkyArrows = []; poFeathers = []; poEcho = null; poClock = 0; }
// From makeBall.
function initPereira(b) {
  var cfg = poCfg(b);
  b.chama = null; b.stepPhase = 0;
  b.chamaT = cfg && cfg.chama ? poRand(cfg.chama.first) : Infinity;
}

// ---------------------------------------------------------------- CHAMA

function chamaInterrupted(b) {
  return !b.alive || b.slam || b.grappled || b.grapple || b.sprawl || b.sprawled || subLocked(b) || b.guard || b.koOut ||
    b.shocked || b.dazed || b.dizzy || b.shelled || b.checkStun > 0 || (b.igbb && !bowOn(b));
}
// Backing off from a CHAMA they saw coming (only while they're rolling about
// on their own: the speed regulator keeps them at their normal speed).
function chamaBackOff(self, other) {
  if (!other.alive || !inOrdinaryMovement(other) || other.angry) return;
  var dx = other.x - self.x, dy = other.y - self.y, d = Math.sqrt(dx * dx + dy * dy) || 1;
  var sp = Math.max(Math.sqrt(other.vx * other.vx + other.vy * other.vy), 200);
  other.vx = dx / d * sp; other.vy = dy / d * sp;
}

// From the abilities loop, before the special. True while it's running.
function updateChama(self, other, dt) {
  var cfg = poCfg(self), cc = cfg && cfg.chama;
  if (!cc) return false;
  var m = self.chama;
  if (m && m.phase !== "ko" && (chamaInterrupted(self) || other.igbb)) { endChama(self); return false; } // (their special took over)
  var dx = other.x - self.x, dy = other.y - self.y, d = Math.sqrt(dx * dx + dy * dy) || 1;
  if (!m) {
    if (!started || over || self.igbb) return false;
    self.chamaT -= dt;
    if (self.chamaT > 0 || d > self.r + other.r + cc.range || !canStartIgbb(self, other) || swordDuelActive()) return false;
    startChama(self, other, cc);
    m = self.chama;
  }
  m.t += dt;
  if (m.phase === "ko") return chamaKo(self, other, m, dt);
  if (m.phase === "call") {
    self.vx = 0; self.vy = 0;
    if (m.read) chamaBackOff(self, other);
    if (m.t >= cc.call) { m.phase = "combo"; m.t = 0; m.n = 0; m.next = 0; }
    return true;
  }
  // The combo: steps in behind the punches.
  if (!other.alive) { endChama(self); return false; }
  var reach = self.r + other.r + cc.reach;
  var lunge = d > reach - 8 ? cc.lunge : 40;
  self.vx = dx / d * lunge; self.vy = dy / d * lunge;
  if (m.read) chamaBackOff(self, other);
  var kp = self.koPunch;
  if (kp) {
    kp.t += dt;
    if (!kp.hit && kp.t >= kp.hitAt) {
      kp.hit = true;
      if (landChamaPunch(self, other, m, cc, kp)) return true; // a knockout: the celebration takes over
    }
    if (self.koPunch && kp.t >= kp.dur) self.koPunch = null;
  }
  if (!self.koPunch) {
    if (m.n >= CHAMA_SEQ.length) { endChama(self); return false; }
    m.next -= dt; m.chase = (m.chase || 0) + dt;
    // Each punch waits until he's stepped into range. If they keep backing
    // off he throws it anyway after a moment, and it whiffs.
    if (m.next <= 0 && (d <= reach + 6 || m.chase > 0.55)) { m.chase = 0; throwChamaPunch(self, other, m); }
  }
  return true;
}

function startChama(self, other, cc) {
  clearActions(self);
  self.vx = 0; self.vy = 0;
  var readP = cc.readChance + (other.char.hasWeave ? cc.readWeave : 0);
  self.chama = { phase: "call", t: 0, read: Math.random() * 100 < readP, n: 0, next: 0 };
  floater(self.x, self.y - self.r - 30, "CHAMA!", "crit");
  if (self.chama.read) floater(other.x, other.y - other.r - 30, "!", "crit");
  poEcho = { t: -cc.echo, spots: chamaEchoSpots() };
  crowdReact(0.5);
  playChamaStomp();
  if (!reduceMotion) shake = Math.max(shake, 6);
}

function throwChamaPunch(self, other, m) {
  var p = CHAMA_SEQ[m.n], size = self.char.punch.size;
  if (p.kind === "qhook") {
    // The left hook: coiled back first so it reads, then swung round hard.
    var coil = 0.12, sweep = 0.17;
    self.koPunch = { t: 0, coil: coil, sweep: sweep, dur: coil + sweep + 0.12, hitAt: coil + sweep * QHOOK_OPEN / (QHOOK_OPEN + QHOOK_FOLLOW),
      hit: false, targetId: other.id, size: size * 1.35, kind: "qhook", side: p.side, heavy: true, last: true, chama: p.hit };
  } else {
    self.koPunch = { t: 0, dur: 0.15, hitAt: 0.07, hit: false, targetId: other.id, size: size * 1.1, kind: "jab", side: p.side, chama: p.hit };
  }
  m.n++;
  m.next = 0.03;
  playWhoosh();
}

// One punch of the combo landing (or missing). True on a knockout.
function landChamaPunch(self, other, m, cc, kp) {
  if (!other.alive || other.koOut) return false;
  var dx = other.x - self.x, dy = other.y - self.y, d = Math.sqrt(dx * dx + dy * dy) || 1;
  if (d > self.r + other.r + cc.reach) {
    floater(other.x, other.y - other.r - 8, "WHIFF", "dodge"); // they read it and got out of range
    return false;
  }
  if (kp.chama === "hook") {
    var ko = Math.random() * 100 < cc.koBase + cc.koLow * (1 - other.hp / MAX_HP);
    if (!ko) ko = stricklandRematchKo(self, other); // UFC 276: the left hook that knocked out Sean Strickland (strickland.js)
    if (ko && !other.holdAtOne) {
      // Goes through every normal defence (weave, block, ...) like the KO Rush.
      if (throwKoPunch(self, other)) { beginChamaKo(self, other, m); return true; }
      return false;
    }
    var dealt = hurt(other, cc.hook, "punch", self.id);
    if (dealt > 0) {
      playPunch(dealt * 1.6);
      stoneHit(self, other, true);
      floater(other.x, other.y - other.r - 34, "LEFT HOOK!", "note");
      if (!other.justDodged && poKnockable(other)) { other.vx += dx / d * cc.hookKnockback; other.vy += dy / d * cc.hookKnockback; }
    }
    checkEnd();
    return false;
  }
  var got = hurt(other, kp.chama === "jab" ? cc.jab : cc.cross, "punch", self.id);
  if (got > 0) {
    playPunch(got);
    stoneHit(self, other, false);
    if (!other.justDodged && poKnockable(other)) { other.vx += dx / d * 120; other.vy += dy / d * 120; }
  }
  checkEnd();
  return false;
}
function poKnockable(o) { return o.alive && !o.grappled && !o.grapple && !o.slam && !subLocked(o) && !o.igbb && !o.koOut; }

// Chips of stone and dust off the fist.
function stoneHit(self, other, big) {
  var dx = other.x - self.x, dy = other.y - self.y, d = Math.sqrt(dx * dx + dy * dy) || 1, ux = dx / d, uy = dy / d;
  var cx = other.x - ux * other.r, cy = other.y - uy * other.r;
  other.flash = 0.16;
  if (big) {
    impacts.push({ x: cx, y: cy, nx: -ux, ny: -uy, life: 0.4, max: 0.4, color: "#8d877c" });
    hitStop = Math.max(hitStop, 0.07);
    if (!reduceMotion) shake = Math.max(shake, 14);
  }
  for (var i = 0; i < (big ? 16 : 7) && !reduceMotion; i++) {
    var a = Math.atan2(-uy, -ux) + (Math.random() - 0.5) * 2.6, s = 120 + Math.random() * (big ? 320 : 180);
    particles.push({ x: cx, y: cy, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 0.3 + Math.random() * 0.3, max: 0.6, size: 1.8 + Math.random() * 3, color: i % 3 ? "#9a948a" : "#d9d3c7" });
  }
}

// Out cold: a beat watching them drop, then his bow and arrow into the sky.
function beginChamaKo(self, other, m) {
  self.koPunch = null;
  m.phase = "ko"; m.t = 0; m.shot = false;
  self.vx = 0; self.vy = 0;
  floater(self.x, self.y - self.r - 30, "POATAN!", "crit");
  crowdReact(1);
}
function chamaKo(self, other, m, dt) {
  self.vx = 0; self.vy = 0;
  if (other.koOut) { var damp = Math.exp(-5 * dt); other.vx *= damp; other.vy *= damp; }
  if (!m.shot && m.t >= PO_KO_BEAT + PO_DRAW) {
    m.shot = true;
    poSkyArrows.push({ x: self.x + self.r * 0.2, y: self.y - self.r * 1.6, t: 0 });
    playBowLoose();
    crowdReact(1);
  }
  if (m.t >= PO_KO_BEAT + PO_DRAW + PO_HOLD + 0.4) {
    endChama(self);
    finishKnockedOut(other);
    checkEnd();
    return false;
  }
  return true;
}

function endChama(self) {
  var cc = poCfg(self).chama;
  self.chama = null; self.koPunch = null;
  self.chamaT = poRand(cc.every);
  if (self.alive && inOrdinaryMovement(self)) setSpeed(self, self.baseSpeed || SPEED);
}

// Where the crowd shouts it back from: stage spots over the stands in the
// stadium, arena spots along the edges in the test arena.
function chamaEchoSpots() {
  var s = [];
  for (var i = 0; i < 5; i++) {
    if (stadiumOn()) {
      if (i < 3) s.push({ x: 200 + i * 340 + (Math.random() - 0.5) * 120, y: 1480 + Math.random() * 180, d: i * 0.07 });
      else s.push({ x: i === 3 ? 62 : STAGE_W - 62, y: 760 + Math.random() * 520, d: 0.1 + Math.random() * 0.1 });
    } else {
      s.push({ x: 60 + i * 95 + (Math.random() - 0.5) * 30, y: i % 2 ? H - 22 : 22, d: i * 0.06 });
    }
  }
  return s;
}

// ---------------------------------------------------------------- calf kick

// From the kick landing in abilities.js.
function calfKickLanded(self, other) {
  var ck = poCfg(self) && poCfg(self).calfKick;
  if (!ck || !other.alive || other.justDodged) return;
  if (!slowedBy(other, "limp")) floater(other.x, other.y - other.r - 30, "CALF KICK!", "note");
  addSlow(other, ck.slow, ck.time, "limp");
}

// ---------------------------------------------------------------- Bow and Arrow

function turnToward(a, want, maxStep) {
  var diff = Math.atan2(Math.sin(want - a), Math.cos(want - a));
  return a + Math.max(-maxStep, Math.min(maxStep, diff));
}

// From updateSpecial (special.js) for special.move "bow".
function updatePoatanBow(self, other, dt) {
  var sp = self.char.special;
  if (!self.igbb) {
    if (self.specialT < sp.chargeTime || !canStartIgbb(self, other) || chamaOn(self) || poArrow || swordDuelActive()) return false;
    clearActions(self);
    self.igbb = { move: "bow", phase: "draw", t: 0, aim: Math.atan2(other.y - self.y, other.x - self.x) };
    floater(self.x, self.y - self.r - 30, "BOW AND ARROW!", "crit");
    playBowDraw();
    crowdReact(0.7);
  }
  var m = self.igbb;
  if (m.move !== "bow") return false;
  m.t += dt;
  self.vx = 0; self.vy = 0;
  if (over && m.phase !== "hold") { endBow(self, true); return false; }
  var want = Math.atan2(other.y - self.y, other.x - self.x);
  if (m.phase === "draw" || (m.phase === "aim" && m.t < PO_AIM - PO_LOCK)) m.aim = turnToward(m.aim, want, dt * 7);
  if (m.phase === "draw") {
    if (m.t >= PO_DRAW) { m.phase = "aim"; m.t = 0; }
  } else if (m.phase === "aim") {
    if (m.t >= PO_AIM - PO_LOCK && !m.locked) { m.locked = true; playBowCreak(1.4); }
    if (m.t >= PO_AIM) { m.phase = "loose"; m.t = 0; looseArrow(self, m, sp); }
  } else if (m.phase === "loose") {
    if (m.t >= PO_LOOSE) { m.phase = "hold"; m.t = 0; }
  } else if (m.t >= PO_HOLD) {
    endBow(self, true);
    return false;
  }
  return true;
}
function endBow(self, special) {
  self.igbb = null;
  if (special) self.specialT = 0;
  if (self.alive) setSpeed(self, self.baseSpeed || SPEED);
}

function bowTip(self, ang) { return { x: self.x + Math.cos(ang) * self.r * 1.3, y: self.y + Math.sin(ang) * self.r * 1.3 }; }

function looseArrow(self, m, sp) {
  var p = bowTip(self, m.aim);
  poArrow = { x: p.x, y: p.y, vx: Math.cos(m.aim) * sp.speed, vy: Math.sin(m.aim) * sp.speed, owner: self.id,
    bounces: 0, hits: 0, hitCd: 0, t: 0, stuck: null, trail: [] };
  playBowLoose();
  if (!reduceMotion) shake = Math.max(shake, 6);
}

// The path the arrow will fly, bouncing off the cage: what lights up red
// while he aims.
function arrowPath(x, y, ang, bounces, len) {
  var pts = [{ x: x, y: y }], vx = Math.cos(ang), vy = Math.sin(ang), left = len;
  for (var i = 0; i <= bounces && left > 0; i++) {
    var tx = vx > 0 ? (W - 2 - x) / vx : (vx < 0 ? (2 - x) / vx : Infinity);
    var ty = vy > 0 ? (H - 2 - y) / vy : (vy < 0 ? (2 - y) / vy : Infinity);
    var t = Math.min(tx, ty, left);
    x += vx * t; y += vy * t; left -= t;
    pts.push({ x: x, y: y });
    if (t === tx) vx = -vx;
    if (t === ty) vy = -vy;
  }
  return pts;
}

function tickArrow(dt) {
  var a = poArrow;
  if (!a) return;
  a.t += dt;
  if (a.stuck) { a.stuck.t += dt; if (a.stuck.t > 1.8) poArrow = null; return; }
  var owner = balls[a.owner], sp = owner.char.special, other = balls[1 - a.owner];
  a.hitCd = Math.max(0, a.hitCd - dt);
  for (var i = 0, n = 4; i < n && !a.stuck; i++) {
    var h = dt / n, ang0 = Math.atan2(a.vy, a.vx);
    a.x += a.vx * h; a.y += a.vy * h;
    var nx = 0, ny = 0;
    if (a.x < 2) { a.x = 2; a.vx = Math.abs(a.vx); nx = 1; } else if (a.x > W - 2) { a.x = W - 2; a.vx = -Math.abs(a.vx); nx = -1; }
    if (a.y < 2) { a.y = 2; a.vy = Math.abs(a.vy); ny = 1; } else if (a.y > H - 2) { a.y = H - 2; a.vy = -Math.abs(a.vy); ny = -1; }
    if (nx || ny) arrowWall(a, nx, ny, ang0, sp);
    if (!a.stuck && other.alive && !other.koOut && !over && a.hitCd <= 0 && a.hits < sp.hits) {
      var ox = other.x - a.x, oy = other.y - a.y;
      if (ox * ox + oy * oy < (other.r + 6) * (other.r + 6)) arrowHit(a, other, sp);
    }
  }
  a.trail.push({ x: a.x, y: a.y });
  if (a.trail.length > 7) a.trail.shift();
  if (!a.stuck && a.t > sp.flight) a.stuck = { t: 0, ang: Math.atan2(a.vy, a.vx), fall: true }; // ran out of steam
}

function arrowWall(a, nx, ny, ang0, sp) {
  a.bounces++;
  var fx = Math.min(W - 24, Math.max(24, a.x)), fy = Math.min(H - 20, Math.max(20, a.y));
  for (var i = 0; i < 10 && !reduceMotion; i++) {
    var sa = Math.atan2(ny, nx) + (Math.random() - 0.5) * 2.2, ss = 120 + Math.random() * 260;
    particles.push({ x: a.x, y: a.y, vx: Math.cos(sa) * ss, vy: Math.sin(sa) * ss, life: 0.25, max: 0.25, size: 1.6 + Math.random() * 2, color: i % 2 ? "#fff3b0" : "#ffffff" });
  }
  if (a.bounces > sp.bounces) {
    // Out of bounces: thunks into the cage and quivers there.
    a.stuck = { t: 0, ang: ang0 };
    a.x = Math.min(W - 1, Math.max(1, a.x)); a.y = Math.min(H - 1, Math.max(1, a.y));
    floater(fx, fy, "THUNK", "note");
    playArrowThunk();
    return;
  }
  floater(fx, fy, "BING!", "note");
  playArrowBing(a.bounces);
  crowdReact(0.12);
}

function arrowHit(a, other, sp) {
  var spd = Math.sqrt(a.vx * a.vx + a.vy * a.vy) || 1, ux = a.vx / spd, uy = a.vy / spd;
  a.hitCd = 0.35;
  // A big special-move arrow: can't be slipped or blocked, but Charles can
  // still teleport out of its way (instant-transmission.js).
  var dealt = hurtProjectile(other, a.hits === 0 ? sp.damage : sp.secondHit, a.owner, ux, uy);
  if (other.justDodged) return; // gone: it flies on past
  a.hits++;
  if (dealt > 0) {
    floater(other.x, other.y - other.r - 30, a.hits === 1 ? "BULLSEYE!" : "AGAIN!", "crit");
    if (poKnockable(other)) { other.vx += ux * sp.knockback; other.vy += uy * sp.knockback; }
    other.squash = { t: 0.16, max: 0.16, nx: -ux, ny: -uy };
    impacts.push({ x: other.x - ux * other.r, y: other.y - uy * other.r, nx: -ux, ny: -uy, life: 0.4, max: 0.4, color: "#d81b25" });
    hitStop = Math.max(hitStop, 0.08);
    if (!reduceMotion) shake = Math.max(shake, 12);
    playPunch(dealt * 1.5); playArrowThunk();
    crowdReact(0.6);
  }
  checkEnd();
}

// ---------------------------------------------------------------- duck season

// From the abilities loop, before the special. True while it's running.
function updateDuckHunt(self, other, dt) {
  var cfg = poCfg(self), dh = cfg && cfg.duckHunt;
  if (!dh) return false;
  var m = self.igbb;
  if (m && m.move === "duckhunt") return runDuckHunt(self, other, m, dh, dt);
  if (m || self.chama || !started || over) return false;
  var jm = other.igbb;
  if (!jm || jm.move !== "duckdrop" || (jm.phase !== "fly" && jm.phase !== "warn") || jm.huntRolled) return false;
  if (specialBusy(self) || self.punch || self.kick || self.swing || self.throwAnim) return false;
  jm.huntRolled = true;
  if (Math.random() * 100 >= dh.chance) return false;
  clearActions(self);
  self.igbb = { move: "duckhunt", phase: "draw", t: 0, aim: -Math.PI / 2 };
  floater(self.x, self.y - self.r - 30, "DUCK SEASON!", "crit");
  playBowDraw();
  return true;
}
function runDuckHunt(self, other, m, dh, dt) {
  m.t += dt;
  self.vx = 0; self.vy = 0;
  if (m.phase === "draw" && m.t >= 0.45) {
    m.phase = "hold"; m.t = 0;
    poSkyArrows.push({ x: self.x, y: self.y - self.r * 1.6, t: 0, duck: other.id });
    playBowLoose();
  } else if (m.phase === "hold" && m.t >= 0.75) {
    endBow(self, false);
    return false;
  }
  return true;
}
// The arrow up off the top of the ring: Jon's duck goes down.
function duckShot(jon) {
  var jm = jon.igbb;
  if (!jm || jm.move !== "duckdrop" || jm.phase === "drop" || jm.phase === "pose") return;
  jm.shotDown = true;
  floater(W / 2, 40, "DUCK DOWN!", "crit");
  for (var i = 0; i < 24 && !reduceMotion; i++) {
    var a = Math.random() * Math.PI * 2, s = 60 + Math.random() * 200;
    poFeathers.push({ x: jm.cx + (Math.random() - 0.5) * 30, y: 14 + Math.random() * 20, vx: Math.cos(a) * s, vy: Math.sin(a) * s * 0.5 + 40, t: 0, dur: 1.2 + Math.random() * 0.8, rot: Math.random() * 6, spin: (Math.random() - 0.5) * 8 });
  }
  playDuckQuack();
  crowdReact(1);
}
// From duckLand (jon-duck.js) when Pereira shot the duck down: Jon still
// crashes into the circle, but he's the one who gets hurt.
function duckShotDownLand(jon, other, m) {
  var dh = poCfg(other) && poCfg(other).duckHunt;
  floater(jon.x, jon.y - jon.r - 30, "SHOT DOWN!", "crit");
  hurt(jon, dh ? dh.damage : 25, "igbb", other.id);
  checkEnd();
}

// ---------------------------------------------------------------- every frame

// From update(): his step, the arrow, the crowd echo, feathers.
function tickPereira(dt) {
  poClock += dt;
  balls.forEach(function (b) {
    var cfg = poCfg(b);
    if (cfg && cfg.step) b.stepPhase = (b.stepPhase || 0) + dt * cfg.step.rate;
  });
  tickArrow(dt);
  poSkyArrows.forEach(function (s) {
    s.t += dt;
    if (s.duck != null && !s.done && s.y - 1500 * s.t < -40) { s.done = true; duckShot(balls[s.duck]); }
  });
  poSkyArrows = poSkyArrows.filter(function (s) { return s.t < 1.4; });
  poFeathers.forEach(function (f) { f.t += dt; f.x += f.vx * dt; f.y += f.vy * dt; f.vx *= 0.97; f.vy = f.vy * 0.97 + 60 * dt; f.rot += f.spin * dt; });
  poFeathers = poFeathers.filter(function (f) { return f.t < f.dur; });
  if (poEcho) {
    var was = poEcho.t;
    poEcho.t += dt;
    if (was < 0 && poEcho.t >= 0) { crowdReact(1); playChamaCrowd(); }
    if (poEcho.t > PO_ECHO) poEcho = null;
  }
}

// ---------------------------------------------------------------- drawing

// His 1-2, 1-2 step: how far down he's dipping right now (0 when he's not
// stepping, e.g. mid-punch). Comes from his step clock, not Math.random, so
// drawing never touches the fight's seeded numbers.
function poatanStep(b) {
  var cfg = poCfg(b);
  if (!cfg || !cfg.step || !b.alive || !started || over || !inOrdinaryMovement(b) || b.punch || b.kick) return 0;
  var ph = (b.stepPhase || 0) % 1;
  var dip = function (c) { var u = (ph - c) / 0.17; return u > 0 && u < 1 ? Math.sin(u * Math.PI) : 0; };
  return cfg.step.dip * (dip(0) + 0.8 * dip(0.28));
}
// From draw(), with the other body poses: squashed down onto his feet on
// each step, a touch wider.
function applyPoatanStep(b) {
  var st = poatanStep(b);
  if (!st) return;
  var ay = b.y + b.r;
  ctx.translate(b.x, ay); ctx.scale(1 + st * 0.5, 1 - st); ctx.translate(-b.x, -ay);
}

// The red ricochet path while he aims (under the fighters). From draw().
function drawPereiraUnder() {
  balls.forEach(function (b) {
    var m = b.igbb;
    if (!b.alive || !m || m.move !== "bow" || (m.phase !== "draw" && m.phase !== "aim")) return;
    var sp = b.char.special, tip = bowTip(b, m.aim);
    var pts = arrowPath(tip.x, tip.y, m.aim, sp.bounces, sp.speed * sp.flight * 0.55);
    var on = m.phase === "aim" ? Math.min(1, m.t / 0.25) : m.t / PO_DRAW * 0.4;
    var flash = m.locked ? 0.55 + 0.45 * Math.sin(poClock * 40) : 1;
    ctx.save();
    ctx.lineCap = "round"; ctx.lineJoin = "round";
    ctx.setLineDash([12, 9]); ctx.lineDashOffset = -poClock * 90;
    ctx.globalAlpha = 0.85 * on * flash;
    ctx.strokeStyle = "#e0221b"; ctx.lineWidth = m.locked ? 5 : 3.5;
    ctx.beginPath(); ctx.moveTo(pts[0].x, pts[0].y);
    for (var i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
    ctx.stroke();
    ctx.setLineDash([]);
    for (var j = 1; j < pts.length - 1; j++) { // a ring where it'll bing off the cage
      ctx.beginPath(); ctx.arc(pts[j].x, pts[j].y, 7, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.restore();
  });
}

// A big red recurve bow held out at `ang`, its string pulled back `pull`
// (0..1), with an arrow nocked unless it's been loosed. `twang` shakes the
// string after the shot.
function drawBowRig(b, ang, pull, nocked, twang) {
  var r = b.r, ux = Math.cos(ang), uy = Math.sin(ang), px = -uy, py = ux;
  var gx = b.x + ux * r * 1.3, gy = b.y + uy * r * 1.3; // the grip, in his front hand
  var lim = r * 1.15, back = r * 0.32;
  var tA = { x: gx + px * lim - ux * back, y: gy + py * lim - uy * back }, tB = { x: gx - px * lim - ux * back, y: gy - py * lim - uy * back };
  var nockDist = r * (0.05 + 1.05 * pull);
  var nk = { x: gx - ux * (back + nockDist), y: gy - uy * (back + nockDist) };
  var size = (b.char.punch.size || 14);
  ctx.save();
  ctx.lineCap = "round"; ctx.lineJoin = "round";
  // The arms: the front one out straight to the grip, the back one drawing the string.
  var shF = { x: b.x + ux * r * 0.55 + px * r * 0.25, y: b.y + uy * r * 0.55 + py * r * 0.25 };
  var shB = { x: b.x + px * r * 0.55, y: b.y + py * r * 0.55 };
  strokeLimb(size * 0.72, armColor(b.char), function () { ctx.moveTo(shF.x, shF.y); ctx.lineTo(gx, gy); });
  // The string (vibrating after the shot).
  var wob = twang ? Math.sin(poClock * 90) * r * 0.12 * twang : 0;
  var mid = nocked || pull > 0.05 ? nk : { x: gx - ux * back + px * wob, y: gy - uy * back + py * wob };
  ctx.strokeStyle = "#f5f1e6"; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(tA.x, tA.y); ctx.lineTo(mid.x, mid.y); ctx.lineTo(tB.x, tB.y); ctx.stroke();
  // The bow: two limbs curving back from the grip, flicking forward at the tips.
  [[tA, 1], [tB, -1]].forEach(function (L) {
    var tip = L[0], s = L[1];
    var c1 = { x: gx + px * s * lim * 0.55 + ux * r * 0.18, y: gy + py * s * lim * 0.55 + uy * r * 0.18 };
    ctx.strokeStyle = theme.wall; ctx.lineWidth = 9;
    ctx.beginPath(); ctx.moveTo(gx, gy); ctx.quadraticCurveTo(c1.x, c1.y, tip.x, tip.y); ctx.stroke();
    ctx.strokeStyle = "#d81b25"; ctx.lineWidth = 5.5;
    ctx.beginPath(); ctx.moveTo(gx, gy); ctx.quadraticCurveTo(c1.x, c1.y, tip.x, tip.y); ctx.stroke();
    ctx.strokeStyle = "#ff6b62"; ctx.lineWidth = 1.6; // highlight
    ctx.beginPath(); ctx.moveTo(gx, gy); ctx.quadraticCurveTo(c1.x, c1.y, tip.x, tip.y); ctx.stroke();
  });
  // A nocked arrow lying along the string.
  if (nocked) drawArrowShape(nk.x + ux * r * 0.95, nk.y + uy * r * 0.95, ang, r * 2.0);
  // Grip wrap, then the gloves: front on the grip, back on the string.
  ctx.fillStyle = "#1b1b1b"; ctx.beginPath(); ctx.arc(gx, gy, 4, 0, Math.PI * 2); ctx.fill();
  drawGloveAt(gx, gy, size * 0.8, b.char, ang);
  var hb = nocked || pull > 0.05 ? nk : { x: b.x + px * r * 0.7 - ux * r * 0.55, y: b.y + py * r * 0.7 - uy * r * 0.55 }; // let go: hand flung back by the ear
  strokeLimb(size * 0.72, armColor(b.char), function () { ctx.moveTo(shB.x, shB.y); ctx.lineTo(hb.x, hb.y); });
  drawGloveAt(hb.x, hb.y, size * 0.8, b.char, ang + Math.PI);
  ctx.restore();
}

// A big red arrow: steel head, red shaft, white fletching. (x, y) is the tip.
function drawArrowShape(x, y, ang, len) {
  var ux = Math.cos(ang), uy = Math.sin(ang), px = -uy, py = ux;
  var tail = { x: x - ux * len, y: y - uy * len };
  ctx.save();
  ctx.lineCap = "round";
  ctx.strokeStyle = theme.wall; ctx.lineWidth = 7;
  ctx.beginPath(); ctx.moveTo(tail.x, tail.y); ctx.lineTo(x - ux * 8, y - uy * 8); ctx.stroke();
  ctx.strokeStyle = "#d81b25"; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(tail.x, tail.y); ctx.lineTo(x - ux * 8, y - uy * 8); ctx.stroke();
  // fletching
  ctx.fillStyle = "#f7f4ee"; ctx.strokeStyle = theme.wall; ctx.lineWidth = 1.5;
  [1, -1].forEach(function (s) {
    ctx.beginPath();
    ctx.moveTo(tail.x + ux * 4, tail.y + uy * 4);
    ctx.lineTo(tail.x + ux * 16 + px * s * 7, tail.y + uy * 16 + py * s * 7);
    ctx.lineTo(tail.x + ux * 22, tail.y + uy * 22);
    ctx.closePath(); ctx.fill(); ctx.stroke();
  });
  // head
  ctx.fillStyle = "#d3d8dd";
  ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - ux * 13 + px * 6, y - uy * 13 + py * 6); ctx.lineTo(x - ux * 10, y - uy * 10); ctx.lineTo(x - ux * 13 - px * 6, y - uy * 13 - py * 6); ctx.closePath();
  ctx.fill(); ctx.stroke();
  ctx.restore();
}

// From draw(), per fighter, after its hands: the CHAMA shout, the bow, the
// limp on a calf-kicked fighter.
function drawPereira(b) {
  if (!b.alive) return;
  var lp = slowedBy(b, "limp");
  if (lp) {
    // A throbbing bruise low on the ball where the calf kick landed.
    var k = Math.min(1, lp.t / 0.5), pulse = 0.5 + 0.5 * Math.sin(poClock * 12);
    ctx.save();
    ctx.globalAlpha = 0.55 * k * (0.6 + 0.4 * pulse);
    ctx.strokeStyle = "#7b2d8e"; ctx.lineWidth = 5; ctx.lineCap = "round";
    ctx.beginPath(); ctx.arc(b.x, b.y, b.r - 3, Math.PI * 0.62, Math.PI * 0.86); ctx.stroke();
    ctx.restore();
  }
  var m = b.igbb;
  if (m && m.move === "bow") {
    var pull = m.phase === "draw" ? easeOut(m.t / PO_DRAW) : (m.phase === "aim" ? 1 : 0);
    var twang = m.phase === "loose" ? 1 : (m.phase === "hold" ? Math.max(0, 1 - m.t / 0.4) : 0);
    drawBowRig(b, m.aim, pull, m.phase === "draw" || m.phase === "aim", twang);
    return;
  }
  if (m && m.move === "duckhunt") {
    drawBowRig(b, -Math.PI / 2, m.phase === "draw" ? easeOut(m.t / 0.45) : 0, m.phase === "draw", m.phase === "hold" ? Math.max(0, 1 - m.t / 0.4) : 0);
    return;
  }
  var c = b.chama;
  if (!c) return;
  if (c.phase === "ko") {
    var t = c.t - PO_KO_BEAT;
    if (t < 0) return; // drawHands is skipped, so a fist stays out from the hook
    var drawn = t < PO_DRAW;
    drawBowRig(b, -Math.PI / 2 + 0.25, drawn ? easeOut(t / PO_DRAW) : 0, drawn, drawn ? 0 : Math.max(0, 1 - (t - PO_DRAW) / 0.4));
    return;
  }
  if (c.phase === "call") {
    // Both stone fists up high, trembling, dust coming off them.
    var o = balls[1 - b.id], ang = Math.atan2(o.y - b.y, o.x - b.x), px = -Math.sin(ang), py = Math.cos(ang);
    var shake2 = Math.sin(poClock * 70) * 1.5, rise = easeOut(Math.min(1, c.t / 0.2));
    var size = (b.char.punch.size || 14);
    ctx.save();
    [-1, 1].forEach(function (s) {
      var sx = b.x + px * s * b.r * 0.5, sy = b.y + py * s * b.r * 0.5;
      var hx = b.x + Math.cos(ang) * b.r * (0.8 + 0.25 * rise) + px * s * b.r * 0.55 + shake2, hy = b.y + Math.sin(ang) * b.r * (0.8 + 0.25 * rise) + py * s * b.r * 0.55 - b.r * 0.25 * rise;
      strokeLimb(size * 0.7, armColor(b.char), function () { ctx.moveTo(sx, sy); ctx.lineTo(hx, hy); });
      drawGloveAt(hx, hy, size * 0.95, b.char, ang);
      ctx.globalAlpha = 0.35 + 0.25 * Math.sin(poClock * 30 + s);
      ctx.strokeStyle = "#fff6d0"; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(hx, hy, size * 1.25, 0, Math.PI * 2); ctx.stroke();
      ctx.globalAlpha = 1;
    });
    ctx.restore();
  }
}

// Over the fighters: the arrow in flight (or stuck in the cage), arrows
// shot into the sky, the duck's feathers. From draw().
function drawPereiraOver() {
  var a = poArrow;
  if (a) {
    var ang = a.stuck ? a.stuck.ang : Math.atan2(a.vy, a.vx);
    if (a.stuck) {
      var k = a.stuck.t, quiver = Math.sin(k * 60) * Math.exp(-k * 4) * 0.12;
      ctx.save();
      ctx.globalAlpha = Math.max(0, Math.min(1, (1.8 - k) / 0.4));
      if (a.stuck.fall) {
        drawArrowShape(a.x, a.y, ang, 52);
      } else {
        // tip buried in the cage, the shaft sticking back out and quivering
        ctx.translate(a.x, a.y); ctx.rotate(quiver); ctx.translate(-a.x, -a.y);
        drawArrowShape(a.x + Math.cos(ang) * 10, a.y + Math.sin(ang) * 10, ang, 52);
      }
      ctx.restore();
    } else {
      ctx.save();
      a.trail.forEach(function (p, i) { // speed streak behind it
        ctx.globalAlpha = (i + 1) / a.trail.length * 0.35;
        ctx.fillStyle = "#ff8a80";
        ctx.beginPath(); ctx.arc(p.x, p.y, 3 + i * 0.6, 0, Math.PI * 2); ctx.fill();
      });
      ctx.restore();
      drawArrowShape(a.x, a.y, ang, 52);
    }
  }
  poSkyArrows.forEach(function (s) {
    var y = s.y - 1500 * s.t;
    if (y < -80) return;
    drawArrowShape(s.x, y, -Math.PI / 2, 46);
  });
  poFeathers.forEach(function (f) {
    var k = f.t / f.dur;
    ctx.save();
    ctx.globalAlpha = 1 - k;
    ctx.translate(f.x, f.y); ctx.rotate(f.rot);
    ctx.fillStyle = "#f4efe2"; ctx.strokeStyle = "#7a6a52"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.ellipse(0, 0, 7, 2.6, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-7, 0); ctx.lineTo(7, 0); ctx.stroke();
    ctx.restore();
  });
}

// The crowd shouting "CHAMA!" back: speech bubbles over the stands in the
// stadium, over the edges of the ring in the test arena. From draw(), over
// the jumbotron (sc/ox/oy place the arena).
function drawChamaCrowd(sc, ox, oy) {
  if (!poEcho || poEcho.t < 0) return;
  var stadium = stadiumOn(), px = canvas.width / STAGE_W;
  ctx.save();
  if (stadium) ctx.setTransform(px, 0, 0, px, 0, 0); else ctx.setTransform(sc, 0, 0, sc, ox, oy);
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  poEcho.spots.forEach(function (s) {
    var t = poEcho.t - s.d;
    if (t < 0) return;
    var pop = Math.min(1, t / 0.12), fade = Math.max(0, Math.min(1, (PO_ECHO - t) / 0.3));
    var size = stadium ? 46 : 22;
    ctx.save();
    ctx.globalAlpha = fade;
    ctx.translate(s.x, s.y - t * (stadium ? 30 : 10)); ctx.scale(0.6 + 0.4 * pop, 0.6 + 0.4 * pop); ctx.rotate(Math.sin(s.x) * 0.12);
    ctx.font = '900 ' + size + 'px "Barlow Condensed", "Arial Narrow", sans-serif';
    var w = ctx.measureText("CHAMA!").width + size * 0.6, h = size * 1.15;
    ctx.fillStyle = "#ffffff"; ctx.strokeStyle = "#16211f"; ctx.lineWidth = stadium ? 4 : 2.5;
    ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h, h * 0.4); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-w * 0.12, h / 2 - 1); ctx.lineTo(-w * 0.2, h / 2 + size * 0.4); ctx.lineTo(w * 0.02, h / 2 - 1); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#c8102e"; ctx.fillText("CHAMA!", 0, 2);
    ctx.restore();
  });
  ctx.restore();
}

// ---------------------------------------------------------------- sound
// Synth stand-ins until Joe records the real ones.

function poAudio(fn) {
  try {
    var ctx = getAudioCtx();
    if (!ctx) return;
    if (ctx.state === "suspended") ctx.resume();
    fn(ctx, ctx.currentTime);
  } catch (e) { /* never let audio break the game */ }
}
// Planting his feet for the shout: a deep stomp.
function playChamaStomp() {
  poAudio(function (ctx, t) {
    caneTone(ctx, t, "sine", 110, 42, 0.9, 0.35);
    caneBurst(ctx, t, 260, 0.8, 0.5, 0.12);
  });
}
// The crowd shouting it back: two big swells, "CHA-MA!".
function playChamaCrowd() {
  poAudio(function (ctx, t) {
    [0, 0.24].forEach(function (d, i) {
      var s = ctx.createBufferSource();
      s.buffer = caneNoise(ctx); s.loop = true;
      var f = ctx.createBiquadFilter();
      f.type = "bandpass"; f.Q.value = 1.1; f.frequency.value = i ? 620 : 820;
      var g = ctx.createGain(), at = t + d;
      g.gain.setValueAtTime(0.0001, at);
      g.gain.exponentialRampToValueAtTime(0.5, at + 0.05);
      g.gain.exponentialRampToValueAtTime(0.0001, at + (i ? 0.6 : 0.22));
      s.connect(f); f.connect(g); g.connect(strikeOut(ctx));
      s.start(at); s.stop(at + 0.65);
    });
  });
}
// Drawing the bow: the limbs creaking as the string comes back.
function playBowDraw() {
  poAudio(function (ctx, t) {
    for (var i = 0; i < 5; i++) caneBurst(ctx, t + i * 0.09, 700 + i * 160, 6, 0.12, 0.05);
  });
}
function playBowCreak(k) {
  poAudio(function (ctx, t) { caneBurst(ctx, t, 1400 * (k || 1), 7, 0.1, 0.07); });
}
// Loosing it: a thwip and the string's twang.
function playBowLoose() {
  playWhoosh();
  poAudio(function (ctx, t) {
    caneTone(ctx, t, "triangle", 240, 170, 0.35, 0.3);
    caneBurst(ctx, t, 3000, 1.2, 0.3, 0.05);
  });
}
// The arrow binging off the cage: a bright metal ping, a little higher each bounce.
function playArrowBing(n) {
  poAudio(function (ctx, t) {
    var v = 1 + (n || 0) * 0.06;
    caneTone(ctx, t, "sine", 2350 * v, 2290 * v, 0.32, 0.4);
    caneTone(ctx, t, "sine", 3720 * v, 3650 * v, 0.14, 0.22);
    caneBurst(ctx, t, 4200, 1.4, 0.3, 0.03);
  });
}
// Thunking into the cage, or into them.
function playArrowThunk() {
  poAudio(function (ctx, t) {
    caneTone(ctx, t, "sine", 160, 70, 0.6, 0.16);
    caneBurst(ctx, t, 500, 1, 0.5, 0.06);
  });
}
