// Ciryl Gane's Cheater mode (hasCheater). In his fights the referee nods
// off: he's awake for `cheater.awake` seconds, then asleep for
// `cheater.asleep` with cartoon Z's coming off him, over and over. The
// moment he's asleep Gane drops Fighter mode and cheats, picking one trick
// (an equal chance of each) for the whole nap:
//
//   poke:  eye pokes. A poke that lands does a little damage and leaves them
//          stunned on the spot, and he follows up with a combo they can't
//          slip or block.
//   throw: throws random objects at them (CHEATER_OBJECTS).
//   bat:   pulls out a baseball bat that hits hard on a very fast cooldown.
//
// While he's cheating, any takedown shot on him fails every time: he backs
// onto the side of the cage, grabs it, stands back up and gets away with no
// damage. When the ref wakes up he's straight back in Fighter mode.
"use strict";

// What he throws. Placeholders until Joe sends the real list: name, damage,
// and how it's drawn (drawCheaterObject).
var CHEATER_OBJECTS = [
  { name: "WATER BOTTLE", damage: 8, shape: "bottle" },
  { name: "SHOE", damage: 10, shape: "shoe" },
  { name: "STOOL", damage: 20, shape: "stool" }
];
var CHEATER_MODES = ["poke", "throw", "bat"];
var CHEATER_LABELS = { poke: "EYE POKES", throw: "THROWING STUFF", bat: "BAT" };

var FENCE_DRIVE = 420;    // how fast he's driven back into the cage
var FENCE_DRIVE_MAX = 0.9; // the most time the drive can take
var FENCE_HOLD = 0.55;    // hanging on to the cage before standing back up
var POKE_REACH = 26;      // how close he has to be to get a finger in
var POKE_AT = 0.12;       // into the poke when it lands

var cheaterObjs = []; // things he's thrown, in flight

function resetCheater() { cheaterObjs = []; }

function cheaterFight() { return balls.some(function (b) { return b.char.hasCheater; }); }
function refAsleep() { return !!(referee && referee.asleep); }

// The ref's nap cycle, from update() after updateReferee. A stoppage wakes
// him up for good.
function tickRefNap(dt) {
  var rf = referee;
  if (!rf || !cheaterFight()) return;
  var ch = balls.filter(function (b) { return b.char.hasCheater; })[0].char.cheater;
  if (rf.stop || over) { if (rf.asleep) wakeRef(rf); return; }
  // Out cold for the whole of Gane's special (herbdean.js wakes him after).
  if (herbDeanActive()) { rf.asleep = true; rf.napT = 0; return; }
  rf.napT = (rf.napT || 0) + dt;
  if (!rf.asleep && rf.napT >= ch.awake) {
    rf.asleep = true; rf.napT = 0;
    balls.forEach(function (b) { if (b.char.hasCheater && b.alive) startCheater(b); });
  } else if (rf.asleep && rf.napT >= ch.asleep) {
    wakeRef(rf);
  }
}
function wakeRef(rf) {
  rf.asleep = false; rf.napT = 0;
  rf.wakeT = REF_WAKE; rf.gest = null; // the startled jolt (referee.js)
  floater(rf.x, refTop(rf), "!?", "note");
  balls.forEach(function (b) {
    if (!b.cheater) return;
    b.cheater = null;
    if (b.alive) floater(b.x, b.y - b.r - 30, "FIGHTER MODE", "note");
  });
}

function startCheater(b) {
  var mode = CHEATER_MODES[Math.floor(Math.random() * CHEATER_MODES.length)];
  b.cheater = { mode: mode, cd: 0.3 };
  b.punch = null; b.kick = null;
  floater(b.x, b.y - b.r - 30, "CHEATER MODE", "crit");
  floater(b.x, b.y - b.r - 8, CHEATER_LABELS[mode], "note");
}

// From updateAbilities. Returns true while Cheater mode has him (his
// Fighter mode punches and kicks are off).
function updateCheater(self, other, dt, d) {
  if (self.fenceGrab) { updateFenceGrab(self, dt); return true; }
  if (self.chAct) { updateCheaterAct(self, other, dt); return true; }
  var c = self.cheater;
  if (!c) return false;
  if (!other.alive || over) return true;
  c.cd = Math.max(0, c.cd - dt * self.atkRate);
  if (c.cd > 0 || specialBusy(self) || specialBusy(other) || other.invincible) return true;
  var cfg = self.char.cheater;
  if (c.mode === "poke" && d < self.r + other.r + POKE_REACH) {
    self.chAct = { kind: "poke", t: 0, hit: false, side: Math.random() < 0.5 ? 1 : -1 };
  } else if (c.mode === "throw") {
    var obj = CHEATER_OBJECTS[Math.floor(Math.random() * CHEATER_OBJECTS.length)];
    self.chAct = { kind: "throw", t: 0, fired: false, obj: obj };
    c.cd = cfg.throw.cooldown;
  } else if (c.mode === "bat" && d < self.r + other.r + cfg.bat.reach) {
    self.chAct = { kind: "bat", t: 0, hit: false, dir: Math.random() < 0.5 ? 1 : -1 };
    c.cd = cfg.bat.cooldown;
  }
  return true;
}

function updateCheaterAct(self, other, dt) {
  var a = self.chAct, cfg = self.char.cheater;
  a.t += dt;
  var dx = other.x - self.x, dy = other.y - self.y, dd = Math.sqrt(dx * dx + dy * dy) || 1;
  a.nx = dx / dd; a.ny = dy / dd;
  if (a.kind === "poke") {
    self.vx = 0; self.vy = 0;
    if (!a.hit && a.t >= POKE_AT) {
      a.hit = true;
      if (!other.alive || specialBusy(other)) { self.chAct = null; return; }
      hurt(other, cfg.poke.damage, "poke", self.id);
      if (other.justDodged || !other.alive) {
        self.chAct = null; if (self.cheater) self.cheater.cd = 0.5;
        checkEnd();
        return;
      }
      floater(other.x, other.y - other.r - 30, "EYE POKE", "crit");
      playPunch(10);
      // The first eye poke of the match (and only that one): the
      // commentators lose it. If someone else is talking and the line gets
      // skipped, it waits for the next poke that lands.
      if (!self.pokeCalled) self.pokeCalled = playGaneCall("ganePokeCall");
      clearActions(other);
      other.dazed = "poke"; other.vx = 0; other.vy = 0;
      // Straight into the combo while they can't see.
      self.chAct = { kind: "combo", t: 0, n: 0, side: a.side, nx: a.nx, ny: a.ny };
      checkEnd();
    } else if (a.t >= POKE_AT + 0.15) self.chAct = null;
    return;
  }
  if (a.kind === "combo") {
    // Stays right on them through it.
    self.vx = 0; self.vy = 0;
    var gap = self.r + other.r + 4;
    self.x += (other.x - a.nx * gap - self.x) * Math.min(1, dt * 12);
    self.y += (other.y - a.ny * gap - self.y) * Math.min(1, dt * 12);
    var hits = cfg.poke.combo, gapT = cfg.poke.comboGap;
    if (a.n < hits.length && a.t >= cfg.poke.stun + a.n * gapT) {
      var last = a.n === hits.length - 1;
      if (other.alive) {
        hurt(other, hits[a.n], "igbb", self.id); // stunned: can't slip or block it
        playPunch(hits[a.n]);
        impacts.push({ x: other.x - a.nx * other.r, y: other.y - a.ny * other.r, nx: a.nx, ny: a.ny, life: 0.3, max: 0.3, color: self.char.color });
        if (!reduceMotion) shake = Math.max(shake, last ? 16 : 6);
        if (last) { floater(other.x, other.y - other.r - 30, "COMBO", "crit"); if (!reduceMotion) hitStop = Math.max(hitStop, 0.06); }
      }
      a.n++;
      checkEnd();
    }
    if (a.n >= hits.length && a.t >= cfg.poke.stun + hits.length * gapT) {
      endPokeStun(other);
      if (other.alive) { other.vx = a.nx * 380; other.vy = a.ny * 380; }
      self.chAct = null;
      if (self.cheater) self.cheater.cd = cfg.poke.cooldown;
    }
    return;
  }
  if (a.kind === "throw") {
    if (!a.fired && a.t >= 0.22) {
      a.fired = true;
      var sp = cfg.throw.speed;
      cheaterObjs.push({
        x: self.x + a.nx * (self.r + 10), y: self.y + a.ny * (self.r + 10),
        vx: a.nx * sp, vy: a.ny * sp, rot: 0, spin: (Math.random() < 0.5 ? -1 : 1) * 12,
        size: self.r * 0.55, obj: a.obj, ownerId: self.id
      });
      floater(self.x, self.y - self.r - 30, a.obj.name, "note");
      playWhoosh();
    }
    if (a.t >= 0.36) self.chAct = null;
    return;
  }
  if (a.kind === "bat") {
    var swing = cfg.bat.swing;
    if (!a.hit && a.t >= swing * 0.45) {
      a.hit = true;
      var dist = Math.sqrt((other.x - self.x) * (other.x - self.x) + (other.y - self.y) * (other.y - self.y));
      if (other.alive && dist < self.r + other.r + cfg.bat.reach + 6) {
        var dealt = hurt(other, cfg.bat.damage, "bat", self.id);
        if (!other.justDodged) {
          other.vx += a.nx * cfg.bat.knockback; other.vy += a.ny * cfg.bat.knockback;
          playBatHit(false); crowdReact(0.5);
          impacts.push({ x: other.x - a.nx * other.r, y: other.y - a.ny * other.r, nx: a.nx, ny: a.ny, life: 0.35, max: 0.35, color: "#c98a4b" });
          if (!reduceMotion) shake = Math.max(shake, 12);
          if (dealt > 0) floater(other.x, other.y - other.r - 30, "BAT", "crit");
          // The first bat shot of the match (and only that one): the
          // commentators lose it. If someone else is talking and the line
          // gets skipped, it waits for the next bat shot that lands.
          if (dealt > 0 && !self.batCalled) self.batCalled = playGaneCall("ganeBatCall");
        }
        checkEnd();
      }
    }
    if (a.t >= swing) self.chAct = null;
  }
}

function endPokeStun(b) { if (b.dazed === "poke") b.dazed = false; }

// Cheating, so a takedown can't get him: whoever shoots drives him back
// into the cage, and once he's up against it he grabs hold, stands back up
// and gets away with no damage. Called before any takedown on `target`
// lands (attemptGrab, Hokit's double leg). True when it stopped it.
function cheaterFenceGrab(attacker, target) {
  if (!target.cheater || target.fenceGrab || !target.alive) return false;
  clearActions(target); target.chAct = null;
  clearActions(attacker);
  // Driven straight back the way he's being pushed, to where that meets the cage.
  var nx = target.x - attacker.x, ny = target.y - attacker.y, nd = Math.sqrt(nx * nx + ny * ny) || 1;
  nx /= nd; ny /= nd;
  var r = target.r, run = 1e9;
  if (nx > 0.001) run = Math.min(run, (W - r - target.x) / nx); else if (nx < -0.001) run = Math.min(run, (r - target.x) / nx);
  if (ny > 0.001) run = Math.min(run, (H - r - target.y) / ny); else if (ny < -0.001) run = Math.min(run, (r - target.y) / ny);
  run = Math.max(0, run);
  target.fenceGrab = { t: 0, phase: "drive", sx: target.x, sy: target.y, nx: nx, ny: ny, run: run, atkId: attacker.id, side: Math.random() < 0.5 ? 1 : -1 };
  target.vx = 0; target.vy = 0; attacker.vx = 0; attacker.vy = 0;
  if (attacker.char.hasGrapple) attacker.grappleCd = attacker.char.grapple.cooldown;
  attacker.checkStun = 5; // held to him until it's over (updateFenceGrab lets go)
  playWhoosh();
  return true;
}

function updateFenceGrab(self, dt) {
  var f = self.fenceGrab, atk = balls[f.atkId];
  f.t += dt;
  self.vx = 0; self.vy = 0; atk.vx = 0; atk.vy = 0;
  if (f.phase === "drive") {
    var dist = Math.min(f.run, f.t * FENCE_DRIVE);
    self.x = f.sx + f.nx * dist; self.y = f.sy + f.ny * dist;
    if (dist >= f.run - 0.5 || f.t >= FENCE_DRIVE_MAX) {
      f.phase = "grab"; f.t = 0;
      floater(self.x, self.y - self.r - 30, "FENCE GRAB", "crit");
      playPunch(15);
      if (!reduceMotion) shake = Math.max(shake, 6);
    }
  } else if (f.t >= FENCE_HOLD) {
    self.fenceGrab = null;
    atk.checkStun = 0.3;
    floater(self.x, self.y - self.r - 30, "STANDS UP", "note");
    // Pushes off the cage and away from them.
    self.vx = -f.nx; self.vy = -f.ny;
    var px = -f.ny * f.side, py = f.nx * f.side;
    self.vx = px; self.vy = py; // slides out along the fence
    setSpeed(self, self.baseSpeed || SPEED);
    atk.vx = -f.nx; atk.vy = -f.ny; setSpeed(atk, atk.baseSpeed || SPEED);
    self.slamSafe = Math.max(self.slamSafe || 0, 0.4);
    return;
  }
  // The one shooting stays wrapped round him, chest to chest.
  var gap = self.r + atk.r - 6;
  atk.x = self.x - f.nx * gap; atk.y = self.y - f.ny * gap;
}

// Every frame from update(): thrown objects fly, and a stun can't outlive
// the combo that caused it.
function tickCheater(dt) {
  balls.forEach(function (b) {
    if (b.dazed === "poke") {
      var owner = balls[1 - b.id];
      if (!owner.chAct || owner.chAct.kind !== "combo" || !owner.alive) endPokeStun(b);
    }
  });
  cheaterObjs.forEach(function (o) {
    o.x += o.vx * dt; o.y += o.vy * dt; o.rot += o.spin * dt;
    var tgt = balls[1 - o.ownerId];
    if (!o.done && tgt.alive) {
      var dx = tgt.x - o.x, dy = tgt.y - o.y;
      if (dx * dx + dy * dy < (tgt.r + o.size * 0.6) * (tgt.r + o.size * 0.6)) {
        hurt(tgt, o.obj.damage, "throw", o.ownerId);
        if (tgt.justDodged) return; // slipped it: it flies on past
        o.done = true;
        var sp = Math.sqrt(o.vx * o.vx + o.vy * o.vy) || 1;
        tgt.vx += o.vx / sp * 140; tgt.vy += o.vy / sp * 140;
        playPunch(o.obj.damage);
        impacts.push({ x: o.x, y: o.y, nx: o.vx / sp, ny: o.vy / sp, life: 0.3, max: 0.3, color: "#ffffff" });
        if (!reduceMotion) shake = Math.max(shake, 6 + o.obj.damage * 0.3);
        checkEnd();
      }
    }
  });
  cheaterObjs = cheaterObjs.filter(function (o) {
    return !o.done && o.x > -40 && o.x < W + 40 && o.y > -40 && o.y < H + 40;
  });
}

// He's got his hands full (drawHands leaves them out).
function cheaterHandsBusy(b) {
  var o = balls[1 - b.id];
  return !!(b.fenceGrab || b.chAct || (b.cheater && b.cheater.mode === "bat") || (o && o.fenceGrab && o.fenceGrab.atkId === b.id));
}
// Held still on the spot (physics leaves him alone).
function cheaterHolding(b) {
  return !!(b.fenceGrab || (b.chAct && (b.chAct.kind === "poke" || b.chAct.kind === "combo")));
}

// ---------------------------------------------------------------- drawing

function drawCheater(b) {
  if (!b.alive) return;
  var other = balls[1 - b.id], ch = b.char, gr = b.r * 0.22, arm = (ch.punch.size || 13) * 0.75;
  var nx = other.x - b.x, ny = other.y - b.y, nd = Math.sqrt(nx * nx + ny * ny) || 1;
  nx /= nd; ny /= nd;
  var px = -ny, py = nx;
  if (b.fenceGrab) {
    // Pressed against the cage: one hand back on it, fingers through.
    var f = b.fenceGrab;
    if (f.phase !== "grab") return;
    var k = Math.min(1, f.t / 0.1), qx = -f.ny * f.side, qy = f.nx * f.side;
    var shx = b.x + qx * b.r * 0.6 + f.nx * b.r * 0.2, shy = b.y + qy * b.r * 0.6 + f.ny * b.r * 0.2;
    var hx = b.x + f.nx * b.r * (0.4 + 0.6 * k) + qx * b.r * (0.6 + 0.3 * k), hy = b.y + f.ny * b.r * (0.4 + 0.6 * k) + qy * b.r * (0.6 + 0.3 * k);
    strokeLimb(arm, armColor(ch), function () { ctx.moveTo(shx, shy); ctx.lineTo(hx, hy); });
    drawGloveAt(hx, hy, gr, ch);
    return;
  }
  // Driving him into the cage: both arms wrapped round him.
  if (other.fenceGrab && other.fenceGrab.atkId === b.id) {
    var g = other.fenceGrab;
    [-1, 1].forEach(function (s2) {
      var qx2 = -g.ny * s2, qy2 = g.nx * s2;
      var sh2 = { x: b.x + g.nx * b.r * 0.6 + qx2 * b.r * 0.55, y: b.y + g.ny * b.r * 0.6 + qy2 * b.r * 0.55 };
      var hd2 = { x: other.x - g.nx * other.r * 0.3 + qx2 * other.r * 0.82, y: other.y - g.ny * other.r * 0.3 + qy2 * other.r * 0.82 };
      strokeLimb(arm, armColor(ch), function () {
        ctx.moveTo(sh2.x, sh2.y);
        ctx.lineTo(hd2.x, hd2.y);
      });
      drawGloveAt(hd2.x, hd2.y, b.r * 0.22, ch);
    });
    return;
  }
  var a = b.chAct;
  if (a && a.kind === "poke") {
    // Two fingers stuck straight out at their eyes.
    var k = Math.min(1, a.t / POKE_AT);
    var sh = { x: b.x + px * a.side * b.r * 0.5, y: b.y + py * a.side * b.r * 0.5 };
    var reach = b.r * 0.6 + (nd - b.r - other.r * 0.6) * k;
    var hx2 = b.x + nx * reach + px * a.side * b.r * 0.2, hy2 = b.y + ny * reach + py * a.side * b.r * 0.2;
    strokeLimb(arm, armColor(ch), function () { ctx.moveTo(sh.x, sh.y); ctx.lineTo(hx2, hy2); });
    [-1, 1].forEach(function (s) {
      strokeLimb(arm * 0.4, armColor(ch), function () {
        ctx.moveTo(hx2, hy2);
        ctx.lineTo(hx2 + nx * gr * 2.2 + px * s * gr * 0.5, hy2 + ny * gr * 2.2 + py * s * gr * 0.5);
      });
    });
    drawGloveAt(hx2, hy2, gr * 0.85, ch);
    return;
  }
  if (a && a.kind === "combo") {
    // Both hands firing in turn; the last one comes from way back.
    var cfg = ch.cheater.poke, n = cfg.combo.length;
    for (var s = -1; s <= 1; s += 2) {
      var idx = Math.floor((a.t - cfg.stun) / cfg.comboGap);
      var mine = idx >= 0 && ((idx % 2 === 0) === (s === 1));
      var ph = mine ? ((a.t - cfg.stun) % cfg.comboGap) / cfg.comboGap : 0;
      var ext = mine ? Math.sin(Math.PI * Math.min(1, ph * 1.6)) : 0;
      if (idx >= n - 1 && s === 1) ext = Math.max(ext, 0.2);
      var base = { x: b.x + px * s * b.r * 0.55, y: b.y + py * s * b.r * 0.55 };
      var hand = { x: base.x + nx * (b.r * 0.5 + ext * b.r * 0.75), y: base.y + ny * (b.r * 0.5 + ext * b.r * 0.75) };
      strokeLimb(arm, armColor(ch), function () { ctx.moveTo(base.x, base.y); ctx.lineTo(hand.x, hand.y); });
      drawGloveAt(hand.x, hand.y, gr * (idx === n - 1 && mine ? 1.25 : 1), ch);
    }
    return;
  }
  if (a && a.kind === "throw") {
    // Arm cocked back, then whipped through toward them.
    var tk = Math.min(1, a.t / 0.22), back = tk < 1 ? -0.6 + 0.2 * tk : 0.9;
    var shx = b.x + px * b.r * 0.6, shy = b.y + py * b.r * 0.6;
    var hx3 = shx + nx * b.r * back + px * b.r * 0.25, hy3 = shy + ny * b.r * back + py * b.r * 0.25;
    strokeLimb(arm, armColor(ch), function () { ctx.moveTo(shx, shy); ctx.lineTo(hx3, hy3); });
    if (!a.fired) drawCheaterObject(a.obj.shape, hx3, hy3, b.r * 0.55, 0.4);
    drawGloveAt(hx3, hy3, gr, ch);
    return;
  }
  if (b.cheater && b.cheater.mode === "bat") {
    // The bat: up on his shoulder, or swung through in a flat arc.
    var base0 = Math.atan2(ny, nx), ang, dir = a && a.kind === "bat" ? a.dir : 1;
    if (a && a.kind === "bat") {
      var sk = Math.min(1, a.t / ch.cheater.bat.swing); sk = sk * sk * (3 - 2 * sk);
      ang = base0 - dir * 1.5 + dir * 2.9 * sk;
    } else { drawBatIdle(b); return; }
    var hx4 = b.x + Math.cos(ang) * b.r * 0.85, hy4 = b.y + Math.sin(ang) * b.r * 0.85;
    var shx4 = b.x + Math.cos(ang) * b.r * 0.4, shy4 = b.y + Math.sin(ang) * b.r * 0.4;
    drawBatGuardHand(b);
    drawBat(hx4, hy4, ang, b.r * 1.6);
    strokeLimb(arm, armColor(ch), function () { ctx.moveTo(shx4, shy4); ctx.lineTo(hx4, hy4); });
    drawGloveAt(hx4, hy4, gr, ch);
  }
}

// Holding the bat between swings. The fighters are drawn front on, so the
// poses are too: shoulders at the top corners of the ball, the bat in the
// hand away from the opponent, each arm bent at the elbow. On the move it
// rides on his shoulder, bouncing with his stride, free glove at his chest.
// Hands stay low by his body, below his face.
// Stood still he loops through a batter's stance with the bat waggling, three
// smacks of the bat into his free palm, and a twirl of it out to the side.
var BAT_IDLE_LOOP = 4.6;
function batSide(b) { var o = balls[1 - b.id]; return o.x > b.x ? -1 : 1; } // 1 = his bat out on screen right
function drawBatIdle(b) {
  var ch = b.char, r = b.r, len = r * 1.6, s = batSide(b);
  function P(x, y) { return { x: b.x + x * r, y: b.y + y * r }; } // x measured toward the bat side
  function Q(x, y) { return P(x * s, y); }
  function A(a) { return s > 0 ? a : Math.PI - a; } // mirrors an angle drawn for s = 1
  var t = performance.now() / 1000 + b.id * 1.7;
  var sp = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
  var bSh = Q(0.66, -0.3), fSh = Q(-0.66, -0.3);
  var bH, fH, batA, bEl = null, fEl = null, key;
  if (sp > 60) {
    key = "walk";
    // Resting on his shoulder, barrel up behind his head, bouncing.
    var st = t * 10, bob = Math.abs(Math.sin(st)) * 0.08;
    bH = Q(0.72, -0.42 - bob);
    batA = A(-Math.PI / 2 - 0.55 + Math.sin(st) * 0.1);
    fH = Q(-0.38, 0.0 + Math.sin(st + Math.PI) * 0.06);
  } else {
    var c = t % BAT_IDLE_LOOP;
    key = c < 1.8 ? "stance" : c < 3.9 ? "tap" : "twirl";
    if (c < 1.8) {
      // Batter's stance: hands stacked on the handle by his shoulder, the
      // barrel up and leaning back, waggling.
      // Bat hand at the knob, elbow tucked down at his side; the free hand
      // reaches across his belly to grip just above it.
      bH = Q(0.5, 0.0);
      batA = A(-Math.PI / 2 + 0.45 + Math.sin(t * 6) * 0.25);
      fH = { x: bH.x + Math.cos(batA) * len * 0.18, y: bH.y + Math.sin(batA) * len * 0.18 };
      bEl = Q(0.85, 0.2); fEl = Q(-0.05, 0.02);
    } else if (c < 3.9) {
      // Three smacks into his open palm in front of his belly.
      var k = (c - 1.8) / 2.1 * 3, f = k % 1;
      var tap = f < 0.55 ? Math.pow(f / 0.55, 2) : 1 - (f - 0.55) / 0.45;
      bH = Q(0.62, 0.0);
      var down = Math.atan2(0.2, -1.0) - Math.PI * 2; // to the palm (s = 1), up and over the top
      batA = A(-Math.PI / 2 + 0.25 + (down + Math.PI / 2 - 0.25) * tap);
      var hit = f > 0.5 && f < 0.72 ? 0.06 : 0;
      fH = Q(-0.38 - hit, 0.2 + hit);
    } else {
      // Spins it once round in his hand, out to the side.
      var tw = (c - 3.9) / (BAT_IDLE_LOOP - 3.9); tw = tw * tw * (3 - 2 * tw);
      bH = Q(0.95, 0.05);
      batA = A(-Math.PI / 2 + 0.3) + s * tw * Math.PI * 2;
      fH = Q(-0.38, 0.0);
    }
  }
  bEl = bEl || armElbow(b, bSh, bH, s);
  fEl = fEl || armElbow(b, fSh, fH, -s);
  // Eases from wherever the last pose left off into this one.
  var pose = batBlend(b, key + s, [bH.x - b.x, bH.y - b.y, fH.x - b.x, fH.y - b.y, bEl.x - b.x, bEl.y - b.y, fEl.x - b.x, fEl.y - b.y, batA]);
  bH = { x: b.x + pose[0], y: b.y + pose[1] }; fH = { x: b.x + pose[2], y: b.y + pose[3] };
  bEl = { x: b.x + pose[4], y: b.y + pose[5] }; fEl = { x: b.x + pose[6], y: b.y + pose[7] };
  drawBentArm(b, fSh, fH, -s, fEl);
  drawBat(bH.x, bH.y, pose[8], len);
  drawBentArm(b, bSh, bH, s, bEl);
  drawGloveAt(fH.x, fH.y, r * 0.22, ch);
  drawGloveAt(bH.x, bH.y, r * 0.22, ch);
}

// Smooths the jump between two poses: when the pose changes (`key`), the gap
// from the last drawn pose is carried as an offset that fades out over about
// a third of a second. The last value is the bat's angle.
var BAT_BLEND_RATE = 8;
function batBlend(b, key, pose) {
  var now = performance.now() / 1000, st = b.batBlend;
  if (!st || now - st.t > 0.25) st = b.batBlend = { key: key, t: now, off: null, last: null };
  var dt = Math.max(0, now - st.t); st.t = now;
  if (st.key !== key && st.last) {
    st.off = pose.map(function (v, i) {
      var d = st.last[i] - v;
      if (i === pose.length - 1) d = Math.atan2(Math.sin(d), Math.cos(d)); // the short way round
      return d;
    });
  }
  st.key = key;
  var out = pose;
  if (st.off) {
    var k = Math.exp(-BAT_BLEND_RATE * dt), big = 0;
    st.off = st.off.map(function (d) { d *= k; big = Math.max(big, Math.abs(d)); return d; });
    out = pose.map(function (v, i) { return v + st.off[i]; });
    if (big < 0.01) st.off = null;
  }
  st.last = out;
  return out;
}

// Where an arm's elbow sits: dropped down and out to its own side.
function armElbow(b, sh, hand, side) {
  var seg = b.r * 0.5;
  var dx = hand.x - sh.x, dy = hand.y - sh.y, d = Math.sqrt(dx * dx + dy * dy) || 1;
  var reach = Math.min(d, seg * 2 - 0.5), bend = Math.sqrt(Math.max(0, seg * seg - reach * reach / 4));
  var mx = sh.x + dx / d * reach / 2, my = sh.y + dy / d * reach / 2;
  var nx = -dy / d, ny = dx / d;
  if (nx * side * 0.25 + ny < 0) { nx = -nx; ny = -ny; } // elbows tucked down at his sides
  return { x: mx + nx * bend, y: my + ny * bend };
}

// An arm from shoulder to hand, the elbow dropping down and out to its own
// side of the body (side 1 = screen right, -1 = screen left).
function drawBentArm(b, sh, hand, side, elbow) {
  var ch = b.char, arm = (ch.punch.size || 13) * 0.75;
  var e = elbow || armElbow(b, sh, hand, side), ex = e.x, ey = e.y; // a pose can set its own
  strokeLimb(arm, armColor(ch), function () { ctx.moveTo(sh.x, sh.y); ctx.lineTo(ex, ey); ctx.lineTo(hand.x, hand.y); });
}

// His free glove in close at his chest while he swings.
function drawBatGuardHand(b) {
  var s = batSide(b), r = b.r;
  var sh = { x: b.x - s * 0.66 * r, y: b.y - 0.3 * r }, g = { x: b.x - s * 0.38 * r, y: b.y };
  drawBentArm(b, sh, g, -s);
  drawGloveAt(g.x, g.y, r * 0.22, b.char);
}

function drawBat(x, y, a, len) {
  ctx.save();
  ctx.translate(x, y); ctx.rotate(a);
  var w0 = len * 0.05, w1 = len * 0.11;
  ctx.fillStyle = "#c98a4b"; ctx.strokeStyle = theme.wall; ctx.lineWidth = 2.5; ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(-len * 0.12, -w0); ctx.lineTo(len * 0.35, -w0);
  ctx.quadraticCurveTo(len * 0.6, -w1, len * 0.9, -w1);
  ctx.arc(len * 0.9, 0, w1, -Math.PI / 2, Math.PI / 2);
  ctx.quadraticCurveTo(len * 0.6, w1, len * 0.35, w0);
  ctx.lineTo(-len * 0.12, w0); ctx.closePath(); ctx.fill(); ctx.stroke();
  // Knob and grip tape
  ctx.fillStyle = "#222222";
  ctx.fillRect(-len * 0.12, -w0, len * 0.2, w0 * 2);
  ctx.beginPath(); ctx.arc(-len * 0.13, 0, w0 * 1.4, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  // Grain
  ctx.strokeStyle = "rgba(90,50,20,0.45)"; ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.moveTo(len * 0.4, -w0 * 0.3); ctx.quadraticCurveTo(len * 0.65, -w1 * 0.5, len * 0.92, -w1 * 0.4); ctx.stroke();
  ctx.restore();
}

function drawCheaterObject(shape, x, y, s, rot) {
  ctx.save();
  ctx.translate(x, y); ctx.rotate(rot);
  ctx.strokeStyle = theme.wall; ctx.lineWidth = 2.5; ctx.lineJoin = "round";
  if (shape === "bottle") {
    ctx.fillStyle = "rgba(150,205,255,0.9)";
    ctx.beginPath();
    ctx.moveTo(-s * 0.35, s * 0.9); ctx.lineTo(-s * 0.35, -s * 0.3); ctx.quadraticCurveTo(-s * 0.35, -s * 0.55, -s * 0.15, -s * 0.65);
    ctx.lineTo(s * 0.15, -s * 0.65); ctx.quadraticCurveTo(s * 0.35, -s * 0.55, s * 0.35, -s * 0.3); ctx.lineTo(s * 0.35, s * 0.9); ctx.closePath();
    ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#1f4fa8"; ctx.fillRect(-s * 0.35, -s * 0.05, s * 0.7, s * 0.35); ctx.strokeRect(-s * 0.35, -s * 0.05, s * 0.7, s * 0.35);
    ctx.fillStyle = "#ffffff"; ctx.fillRect(-s * 0.16, -s * 0.92, s * 0.32, s * 0.27); ctx.strokeRect(-s * 0.16, -s * 0.92, s * 0.32, s * 0.27);
  } else if (shape === "shoe") {
    ctx.fillStyle = "#7a4a2a";
    ctx.beginPath();
    ctx.moveTo(-s * 0.9, -s * 0.1); ctx.lineTo(-s * 0.9, s * 0.4); ctx.lineTo(s * 0.85, s * 0.4);
    ctx.quadraticCurveTo(s * 1.0, s * 0.05, s * 0.55, -s * 0.05); ctx.lineTo(s * 0.05, -s * 0.2);
    ctx.lineTo(-s * 0.2, -s * 0.55); ctx.lineTo(-s * 0.85, -s * 0.55); ctx.closePath();
    ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#f2f2f2"; ctx.fillRect(-s * 0.9, s * 0.3, s * 1.78, s * 0.14);
  } else {
    // stool: seen from above, a round seat and the ends of its legs
    ctx.fillStyle = "#3b3b3b";
    for (var i = 0; i < 4; i++) {
      var la = i * Math.PI / 2 + Math.PI / 4;
      ctx.beginPath(); ctx.arc(Math.cos(la) * s * 0.85, Math.sin(la) * s * 0.85, s * 0.16, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    }
    ctx.fillStyle = "#b5262c";
    ctx.beginPath(); ctx.arc(0, 0, s * 0.75, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = "rgba(255,255,255,0.35)"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(0, 0, s * 0.5, -2.4, -1.2); ctx.stroke();
  }
  ctx.restore();
}

function drawCheaterObjects() {
  cheaterObjs.forEach(function (o) { drawCheaterObject(o.obj.shape, o.x, o.y, o.size, o.rot); });
}

// Stars round someone poked in the eye.
function drawPokeStun(b) {
  if (b.dazed !== "poke" || !b.alive) return;
  var t = performance.now() / 1000;
  for (var i = 0; i < 3; i++) {
    var a = t * 7 + i * Math.PI * 2 / 3;
    drawStar(b.x + Math.cos(a) * b.r * 0.7, b.y - b.r * 1.0 + Math.sin(a) * b.r * 0.2, b.r * 0.15, "#ffffff");
  }
}

// Cartoon Z's drifting up off the sleeping ref (drawReferee, in his frame).
function drawRefZs(rf) {
  if (!rf.asleep) return;
  var t = performance.now() / 1000, r = REF_R;
  for (var i = 0; i < 3; i++) {
    var p = (t * 0.55 + i / 3) % 1;
    var x = r * (0.6 + p * 1.1) + Math.sin((p + i) * 6) * r * 0.2, y = -r * (1.0 + p * 2.2);
    var size = r * (0.6 + p * 0.7);
    ctx.globalAlpha = Math.min(1, p * 4) * (1 - p * p);
    ctx.font = "900 " + Math.round(size) + "px Impact, 'Arial Black', sans-serif";
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.lineWidth = 3; ctx.strokeStyle = STAGE_INK; ctx.strokeText("Z", x, y);
    ctx.fillStyle = "#ffffff"; ctx.fillText("Z", x, y);
  }
  ctx.globalAlpha = 1;
}
