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

var FENCE_SLIDE = 0.25;   // backing onto the cage
var FENCE_HOLD = 0.55;    // hanging on to it
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
  floater(rf.x, rf.y - REF_R - 20, "!", "note");
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
          playSlam();
          impacts.push({ x: other.x - a.nx * other.r, y: other.y - a.ny * other.r, nx: a.nx, ny: a.ny, life: 0.35, max: 0.35, color: "#c98a4b" });
          if (!reduceMotion) shake = Math.max(shake, 12);
          if (dealt > 0) floater(other.x, other.y - other.r - 30, "BAT", "crit");
          // The first bat shot of the match (and only that one): the
          // commentators lose it.
          if (dealt > 0 && !self.batCalled) { self.batCalled = true; playGaneBatCall(); }
        }
        checkEnd();
      }
    }
    if (a.t >= swing) self.chAct = null;
  }
}

function endPokeStun(b) { if (b.dazed === "poke") b.dazed = false; }

// Cheating, so a takedown can't get him: he backs onto the cage, grabs it,
// stands back up and walks off. Called before any takedown on `target`
// lands (attemptGrab, Hokit's double leg). True when it stopped it.
function cheaterFenceGrab(attacker, target) {
  if (!target.cheater || target.fenceGrab || !target.alive) return false;
  clearActions(target); target.chAct = null;
  // The nearest bit of the cage.
  var walls = [
    { x: target.r, y: target.y, d: target.x },
    { x: W - target.r, y: target.y, d: W - target.x },
    { x: target.x, y: target.r, d: target.y },
    { x: target.x, y: H - target.r, d: H - target.y }
  ].sort(function (p, q) { return p.d - q.d; });
  var w = walls[0];
  var gx = w.x === target.r ? 0 : w.x === W - target.r ? W : target.x;
  var gy = w.y === target.r ? 0 : w.y === H - target.r ? H : target.y;
  target.fenceGrab = { t: 0, sx: target.x, sy: target.y, tx: w.x, ty: w.y, gx: gx, gy: gy, atkId: attacker.id };
  target.vx = 0; target.vy = 0;
  attacker.vx = 0; attacker.vy = 0;
  if (attacker.char.hasGrapple) attacker.grappleCd = attacker.char.grapple.cooldown;
  attacker.checkStun = Math.max(attacker.checkStun || 0, FENCE_SLIDE + FENCE_HOLD * 0.6); // left grabbing at air
  floater(target.x, target.y - target.r - 30, "FENCE GRAB", "crit");
  playWhoosh();
  return true;
}

function updateFenceGrab(self, dt) {
  var f = self.fenceGrab;
  f.t += dt;
  self.vx = 0; self.vy = 0;
  var k = Math.min(1, f.t / FENCE_SLIDE); k = k * (2 - k);
  self.x = f.sx + (f.tx - f.sx) * k; self.y = f.sy + (f.ty - f.sy) * k;
  if (f.t >= FENCE_SLIDE + FENCE_HOLD) {
    self.fenceGrab = null;
    floater(self.x, self.y - self.r - 30, "STANDS UP", "note");
    // Walks off along the fence, away from them.
    var atk = balls[f.atkId], ax = self.x - atk.x, ay = self.y - atk.y, ad = Math.sqrt(ax * ax + ay * ay) || 1;
    self.vx = ax / ad; self.vy = ay / ad;
    setSpeed(self, self.baseSpeed || SPEED);
    self.slamSafe = Math.max(self.slamSafe || 0, 0.4);
  }
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
  return !!(b.fenceGrab || b.chAct || (b.cheater && b.cheater.mode === "bat"));
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
    // One hand stretched back to the cage, fingers through it.
    var f = b.fenceGrab, hx = f.gx, hy = f.gy;
    var sx = b.x + (hx - b.x) / (Math.sqrt((hx - b.x) * (hx - b.x) + (hy - b.y) * (hy - b.y)) || 1) * b.r * 0.6;
    var sy = b.y + (hy - b.y) / (Math.sqrt((hx - b.x) * (hx - b.x) + (hy - b.y) * (hy - b.y)) || 1) * b.r * 0.6;
    strokeLimb(arm, armColor(ch), function () { ctx.moveTo(sx, sy); ctx.lineTo(hx, hy); });
    drawGloveAt(hx, hy, gr, ch);
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
    } else ang = base0 - 2.3;
    var hx4 = b.x + Math.cos(ang) * b.r * 0.85, hy4 = b.y + Math.sin(ang) * b.r * 0.85;
    var shx4 = b.x + Math.cos(ang) * b.r * 0.4, shy4 = b.y + Math.sin(ang) * b.r * 0.4;
    drawBat(hx4, hy4, ang, b.r * 1.6);
    strokeLimb(arm, armColor(ch), function () { ctx.moveTo(shx4, shy4); ctx.lineTo(hx4, hy4); });
    drawGloveAt(hx4, hy4, gr, ch);
  }
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
