// Islam Makhachev's Leviathan-style frost axe (Joe, 2026-11-22): a rune axe
// for weapon against weapon, drawn in code from Joe's reference (a bearded
// steel head with runes and a frost glow, a curved wooden haft with a leather
// wrap and a carved pommel).
//
// It runs on Ilia's rapier code (rapier.js, which runs on sword.js): his
// character file has a `rapier` block with style "axe". So it comes out
// whenever they have a weapon out (Gane's bat, Gaethje's club, Tony's katanas,
// Jiří's samurai swords, Hokit's saber), he blocks their swings with it
// (parries), every few blocks it locks into a sword duel, he charges with an
// overhead cleave (the rapier's lunge with his own words), and against Dustin's
// diamond sword the two draw on each other and duel. It's put away for his
// specials. Rapier or cutlass against the axe never draws on its own.
//
// What's his own here (his `axe` block):
//   look     while it's out he looks like the god of war: ash-pale skin, a red
//            stripe over his head and chest, bald, a red war skirt
//            (islamKratosLook, drawn through islam-beard.js)
//   throw    he winds it back while a red line shows where it's going, hurls
//            it spinning down the line (`throw.damage`), then holds out his
//            hand and calls it back, and it can hit them again on its way home
//            (`throw.returnDamage`)
//   spin     the axe leaves his hand and whirls round him like a saw blade
//            (`spin.radius` of his size out, spinning on itself as it goes),
//            chewing them up (`spin.damage` a hit, every `spin.gap`, at most
//            `spin.hits`) while he walks them down
//   frost    every axe hit frosts their gloves, exactly like Chuck Liddell's
//            ice hands (liddell.js frostGloves, with `frost`)
//   ice      ice fighters never frost each other (iceImmune: Chuck, Islam, and
//            any fighter with `iceImmune` or Chuck's `iceman` block)
//   recall   disarmed in a duel, he calls the axe back to his hand after
//            `recall` seconds
//   Gane     the first swing of Ciryl Gane's bat he blocks is cut clean in
//            half ("BAT CUT IN HALF!", the bat is gone for the fight). Justin
//            Gaethje's golf club is just blocked as usual.
// While it's out he fights only with the axe (no punches, kicks, combos,
// knees or shots: axeFistsOff), like Bisping with his cutlass.
"use strict";

var AXE_LEN = 1.9;
var AXE_C = { W: "#ffffff", L: "#bfe9ff", m: "#7fc8ff", o: "#2b333b", d: "#a9b6c2" };
var axeHalves = [];   // Gane's bat, in two pieces (visual only, timed off the draw clock)
var axeRecalls = [];  // the axe flying back in from the crowd after a disarm (visual only)

function axeRand(r) { return r[0] + Math.random() * (r[1] - r[0]); }
function axeStyle(b) { return !!(b && b.rapier && b.char.rapier && b.char.rapier.style === "axe"); }
function axeCfg(b) { return b && b.char && b.char.axe; }
function axeHeld(b) { return !!(axeStyle(b) && b.rapier.sword && b.alive); }
function axeMove(b) { var m = b && b.igbb; return m && m.move === "lunge" && m.axe ? m : null; }
// The axe is out of his hand: thrown, coming back, or whirling round him.
function axeAway(b) { var m = axeMove(b); return !!(m && m.phase !== "wind" && m.phase !== "catch"); }
// From the abilities loop: while it's out, no punch or kick (one he was
// throwing when it came out is dropped). Holds already on finish first.
function axeFistsOff(b) {
  if (!axeHeld(b) || b.grapple || b.rnc || b.suplex || b.darce || b.clin) return false;
  b.punch = null; b.kick = null;
  return true;
}
// Rapier or cutlass against the axe: neither one starts it (sword.js bladeRivals).
function axeNoRival(b, o) { return !!(b && o && b.rapier && o.rapier && (axeStyle(b) || axeStyle(o))); }
// Ice fighters shrug off each other's frost (liddell.js frostGloves).
function iceImmune(b) { return !!(b && b.char && (b.char.iceImmune || b.char.iceman || (b.char.axe && b.char.axe.frost))); }

// ---------------------------------------------------------------- the look

var KRATOS_LOOK = { skin: "#d9d3ca", hair: "none", bodyHair: "none", beardColor: "#3b2416", shorts: "#7a1d14", trim: "#c9a646",
  pattern: "plain", waistText: "", gloves: "#4b2f1c", kratosPaint: true };
// From draw.js: the god of war's look while the axe is out.
function islamKratosLook(b) {
  if (!axeHeld(b) || !b.rapier.sword.out || !b.char.look) return null;
  if (!b.kratosLook || b.kratosLook.src !== b.char.look) {
    b.kratosLook = Object.assign({}, b.char.look, KRATOS_LOOK, { src: b.char.look });
  }
  return b.kratosLook;
}
// From drawIslamBeard (islam-beard.js), under the beard: the red stripe down
// over his head and round his chest.
function drawKratosPaint(c, r) {
  c.save();
  c.beginPath(); c.arc(0, 0, r * 0.985, 0, Math.PI * 2); c.clip();
  c.fillStyle = "#b3201b";
  c.beginPath(); // over the crown and down the side of his face
  c.moveTo(r * 0.02, -r * 1.02); c.quadraticCurveTo(r * 0.26, -r * 0.8, r * 0.3, -r * 0.42);
  c.lineTo(r * 0.24, -r * 0.3); c.quadraticCurveTo(r * 0.14, -r * 0.72, -r * 0.14, -r * 1.0); c.closePath(); c.fill();
  c.beginPath(); // round his shoulder and across his chest
  c.moveTo(r * 0.78, -r * 0.3); c.bezierCurveTo(r * 0.55, r * 0.05, r * 0.05, r * 0.05, -r * 0.42, r * 0.42);
  c.lineTo(-r * 0.5, r * 0.32); c.bezierCurveTo(-r * 0.02, -r * 0.08, r * 0.45, -r * 0.1, r * 0.66, -r * 0.4); c.closePath(); c.fill();
  c.fillStyle = "rgba(255,255,255,0.12)";
  c.beginPath(); c.moveTo(r * 0.02, -r * 1.0); c.quadraticCurveTo(r * 0.2, -r * 0.8, r * 0.26, -r * 0.5); c.lineTo(r * 0.22, -r * 0.5); c.quadraticCurveTo(r * 0.14, -r * 0.8, -r * 0.04, -r * 0.98); c.closePath(); c.fill();
  c.restore();
}

// ---------------------------------------------------------------- poses

// Same slots as swordTarget: hand x/y (x toward them), blade angle (0 points
// at them, -PI/2 straight up), free hand x/y, lean toward them.
function axeTarget(b, sw, other) {
  var t = sw.t + b.id * 1.3, sp = Math.sqrt(b.vx * b.vx + b.vy * b.vy), m = b.igbb;
  var sg = sw.side >= 0 ? 1 : -1;
  if (m && m.move === "lunge") {
    var th = Math.atan2(m.dy || 0, m.dx || 1);
    if (m.axe && m.phase !== "wind" && m.phase !== "catch" && m.ax != null) th = Math.atan2(m.ay - b.y, m.ax - b.x); // reaching for the axe
    var a = sg > 0 ? th : Math.PI - th, cx = Math.cos(th) * sg, cy = Math.sin(th);
    if (m.axe === "throw" && m.phase === "wind") return { key: "wind", rate: 16, p: [-0.35, -0.8, a - 2.7, cx * 0.85, cy * 0.85 - 0.15, -0.16] }; // cocked back over his shoulder
    if (m.axe === "spin" && m.phase === "spin") return { key: "conduct", rate: 14, p: [cx * 0.7, -0.55, a, -0.6, -0.1, 0.05] };              // hand up, steering it round him
    if (m.axe && m.phase !== "catch") return { key: "reach", rate: 22, p: [cx * 1.15, cy * 1.15 - 0.08, a, -0.6, -0.35, 0.16] };          // open hand out toward it
    if (m.axe) return { key: "catch", rate: 24, p: [0.85, -0.25, -0.6, -0.62, -0.1, 0.06] };
    if (m.phase === "coil") return { key: "raise", rate: 16, p: [-0.05, -0.9, -Math.PI / 2 - 0.85, cx * 0.7, cy * 0.7 - 0.1, -0.18] };   // up over his head
    if (m.phase === "lunge") return { key: "cleave", rate: 30, p: [cx * 1.15, cy * 1.15 + 0.05, a + 0.55, -0.7, -0.05, 0.38] };          // brought down through them
    return { key: "follow", rate: 14, p: [0.85, 0.3, 1.0, -0.6, 0.0, 0.1] };
  }
  if (sw.parry >= 0) {
    var p = sw.parry / SWORD_SLASH;
    if (p < 0.4) return { key: "block", rate: 30, p: [0.72, -0.5, -1.45, -0.55, -0.15, 0.0] }; // haft across, the head up: takes it on the axe
    return { key: "chop", rate: 20, p: [1.05, 0.15, 0.7, -0.6, 0.05, 0.3] };                  // and a chop straight back at them
  }
  var swingIn = other && other.chAct && other.chAct.kind === "bat" && sw.actRef === other.chAct && sw.willParry;
  if (swingIn) return { key: "guard", rate: 18, p: [0.7, -0.45, -1.35, -0.55, -0.15, -0.05] };
  if (sp > 70) { // on the move: carried low at his side, head forward
    var step = Math.abs(Math.sin(t * 9)), lean = Math.min(1, sp / 300);
    return { key: "walk", rate: 7, p: [0.6, 0.28 - step * 0.04, 0.85 + step * 0.06, -0.62, 0.05, 0.06 * lean] };
  }
  // Ready: up in front of him, angled at them, frost breathing off it.
  var sway = Math.sin(t * 1.5), breath = Math.sin(t * 2.7);
  return { key: "ready", rate: 8, p: [0.62 + sway * 0.03, -0.12 + breath * 0.02, -0.95 + sway * 0.08, -0.65, -0.05 + breath * 0.02, sway * 0.02] };
}

// When he's stood still and nothing's coming (u = 0..1).
var AXE_FLOURISHES = {
  twirl: { dur: 1.0, f: function (u) { // spun round off his wrist and caught
    var w = u < 0.15 ? ease(u / 0.15) : u < 0.85 ? 1 : 1 - ease((u - 0.85) / 0.15);
    return { w: w, hx: 0.75, hy: -0.05, a: -0.6, spin: ease((u - 0.08) / 0.8) * Math.PI * 4 };
  } },
  rest: { dur: 1.8, f: function (u) { // the head rested on his shoulder
    var w = u < 0.2 ? ease(u / 0.2) : u < 0.82 ? 1 : 1 - ease((u - 0.82) / 0.18);
    return { w: w, hx: 0.35, hy: -0.2, a: -Math.PI + 0.7, fx: -0.62, fy: 0.15, lean: -0.08 * w };
  } },
  frost: { dur: 1.6, f: function (u) { // held up, frost pouring off the blade
    var w = u < 0.25 ? ease(u / 0.25) : u < 0.8 ? 1 : 1 - ease((u - 0.8) / 0.2);
    return { w: w, hx: 0.5, hy: -0.75 + Math.sin(u * 20) * 0.01 * w, a: -Math.PI / 2 - 0.2, lean: -0.05 * w };
  } }
};

// ---------------------------------------------------------------- moves

// From the abilities loop, before the rapier lunge. True while one of his
// own moves holds him (the axe throw or spin, the kangaroo lift).
function updateIslamMoves(self, other, dt) {
  tickAxeRecall(self, dt);
  if (typeof islamVoiceWarm === "function" && islamCfg(self)) islamVoiceWarm(); // decode his lines (islam-voice.js)
  if (typeof islamReleaseHeld === "function" && islamCfg(self)) islamReleaseHeld(self); // (islam-specials.js)
  if (typeof islamRooHeld === "function" && islamRooHeld(self, dt)) return true; // lifting Volk's kangaroo (islam-specials.js)
  return updateLeviathan(self, other, dt);
}

function tickAxeRecall(self, dt) {
  var ac = axeCfg(self);
  if (!ac || !ac.recall || !axeStyle(self) || !self.rapier.disarmed || over) return;
  self.axeRecallT = (self.axeRecallT || 0) + dt;
  if (self.axeRecallT < ac.recall) return;
  self.axeRecallT = 0;
  self.rapier.disarmed = false;
  floater(self.x, self.y - self.r - 50, "AXE RECALLED!", "crit");
  // It flies back from wherever it went (still tumbling, or off in the crowd).
  var fb = null, from = { x: self.x > W / 2 ? -60 : W + 60, y: -80 };
  if (typeof flyingBats !== "undefined") flyingBats.forEach(function (f) { if (f.blade === "axe") fb = f; });
  if (fb) { from = { x: fb.x, y: fb.y }; flyingBats.splice(flyingBats.indexOf(fb), 1); }
  axeRecalls.push({ id: self.id, t0: performance.now() / 1000, sx: from.x, sy: from.y });
  playWhoosh();
}

function updateLeviathan(self, other, dt) {
  var ac = axeCfg(self);
  if (!ac || !axeStyle(self)) return false;
  var sw = self.rapier.sword, m = axeMove(self);
  var dx = other.x - self.x, dy = other.y - self.y, d = Math.sqrt(dx * dx + dy * dy) || 1;
  if (!m) {
    if (self.axeThrowT == null) { self.axeThrowT = ac.throw ? axeRand(ac.throw.first) : Infinity; self.axeSpinT = ac.spin ? axeRand(ac.spin.first) : Infinity; }
    if (!started || over || !sw || !sw.out || sw.t < SWORD_DRAW + 0.3 || sw.parry >= 0 || swordDuelActive() || bladeRivals(self, other)) return false;
    self.axeThrowT -= dt; self.axeSpinT -= dt;
    var kind = null;
    if (ac.spin && self.axeSpinT <= 0 && d < ac.spin.range) kind = "spin";
    else if (ac.throw && self.axeThrowT <= 0 && d > ac.throw.range[0] && d < ac.throw.range[1]) kind = "throw";
    if (!kind || other.chAct || !canStartIgbb(self, other)) return false;
    clearActions(self);
    sw.fl = null; sw.feint = -1;
    if (kind === "throw") {
      self.axeThrowT = axeRand(ac.throw.every);
      self.axeSpinT = Math.max(self.axeSpinT, 1.5);
      self.igbb = { move: "lunge", axe: "throw", phase: "wind", t: 0, dx: dx / d, dy: dy / d, len: 0, sx: self.x, sy: self.y, aa: 0, hit: false, rhit: false };
      self.igbb.len = Math.min(ac.throw.maxDist, hcRayToWall(self.x, self.y, dx / d, dy / d, 10));
    } else {
      self.axeSpinT = axeRand(ac.spin.every);
      self.axeThrowT = Math.max(self.axeThrowT, 1.5);
      self.igbb = { move: "lunge", axe: "spin", phase: "spin", t: 0, dx: dx / d, dy: dy / d, orb: Math.atan2(dy, dx) + Math.PI, aa: 0, hitCd: 0, hits: 0, ax: self.x, ay: self.y };
      floater(self.x, self.y - self.r - 40, "AXE SPIN!", "crit");
      playWhoosh();
    }
  }
  m = self.igbb;
  m.t += dt;
  self.vx = 0; self.vy = 0;
  if (over || !self.alive) { endAxeMove(self); return false; }
  var r = self.r, tc = ac.throw, sc = ac.spin;
  if (m.phase === "wind") { // the red line follows them for most of the wind-up, then locks
    if (m.t < tc.warn * 0.65 && other.alive) {
      m.dx = dx / d; m.dy = dy / d;
      m.len = Math.min(tc.maxDist, hcRayToWall(self.x, self.y, m.dx, m.dy, 10));
    }
    if (m.t >= tc.warn) {
      m.phase = "fly"; m.t = 0; m.run = r * 0.6;
      m.ax = self.x + m.dx * m.run; m.ay = self.y + m.dy * m.run;
      playWhoosh();
      floater(self.x, self.y - r - 30, "THROW!", "crit");
    }
    return true;
  }
  if (m.phase === "fly") {
    m.run += tc.speed * dt; m.aa += 26 * dt;
    m.ax = self.x + m.dx * m.run; m.ay = self.y + m.dy * m.run;
    axeTrailFx(m);
    if (!m.hit && other.alive && !other.invincible && axeTouch(m, other, r)) {
      m.hit = true;
      axeHit(self, other, tc.damage, m.dx, m.dy, "AXE THROW!", tc.knockback);
      m.phase = "hang"; m.t = 0;
    } else if (m.run >= m.len) { m.phase = "hang"; m.t = 0; if (m.run < tc.maxDist - 4) axeThunk(m); } // buried in the cage
    return true;
  }
  if (m.phase === "hang") { // stuck a beat, quivering, before he calls it
    if (m.t >= 0.22) { m.phase = "recall"; m.t = 0; m.rx = m.ax; m.ry = m.ay; m.rd = Math.max(0.35, Math.min(0.7, Math.hypot(m.ax - self.x, m.ay - self.y) / 1300)); floater(self.x, self.y - r - 30, "RECALL!", "note"); }
    return true;
  }
  if (m.phase === "recall") {
    var u = Math.min(1, m.t / m.rd), e = u * u;
    var hx = self.x + m.dx * r * 0.7, hy = self.y + m.dy * r * 0.7;
    var px = -(hy - m.ry), py = hx - m.rx, pl = Math.hypot(px, py) || 1, bow = Math.sin(Math.PI * e) * Math.min(90, pl * 0.25);
    m.ax = m.rx + (hx - m.rx) * e + px / pl * bow; m.ay = m.ry + (hy - m.ry) * e + py / pl * bow;
    m.aa -= 30 * dt;
    axeTrailFx(m);
    if (!m.rhit && m.t > 0.06 && other.alive && !other.invincible && axeTouch(m, other, r)) {
      m.rhit = true;
      var nx = hx - m.rx, ny = hy - m.ry, nl = Math.hypot(nx, ny) || 1;
      axeHit(self, other, tc.returnDamage, nx / nl, ny / nl, "RECALL HIT!", tc.knockback * 0.6);
    }
    if (u >= 1) { m.phase = "catch"; m.t = 0; axeCatchFx(self, m.ax, m.ay); }
    return true;
  }
  if (m.phase === "spin") {
    m.orb += sc.turn * dt; m.aa += 32 * dt; m.hitCd -= dt;
    var R = r * sc.radius * Math.min(1, m.t / 0.18) * (m.t > sc.time - 0.15 ? Math.max(0, (sc.time - m.t) / 0.15) : 1);
    m.ax = self.x + Math.cos(m.orb) * R; m.ay = self.y + Math.sin(m.orb) * R;
    // He walks them down while it whirls.
    if (d > self.r + other.r + 20) {
      var st = sc.walk * dt;
      self.x = Math.max(r, Math.min(W - r, self.x + dx / d * st)); self.y = Math.max(r, Math.min(H - r, self.y + dy / d * st));
    }
    axeTrailFx(m);
    if (m.hits < sc.hits && m.hitCd <= 0 && other.alive && !other.invincible && axeTouch(m, other, r)) {
      m.hits++; m.hitCd = sc.gap;
      var tx = -Math.sin(m.orb), ty = Math.cos(m.orb);
      axeHit(self, other, sc.damage, (other.x - self.x) / d * 0.6 + tx * 0.4, (other.y - self.y) / d * 0.6 + ty * 0.4, m.hits === 1 ? "SAW BLADE!" : null, sc.knockback);
    }
    if (m.t >= sc.time) { m.phase = "catch"; m.t = 0; axeCatchFx(self, self.x, self.y); }
    return true;
  }
  if (m.t >= 0.28) { endAxeMove(self); return false; }
  return true;
}

function axeTouch(m, o, r) { return Math.hypot(o.x - m.ax, o.y - m.ay) < o.r + r * 0.45; }
function endAxeMove(self) { self.igbb = null; self.invincible = false; self.immuneCd = 0; }

// An axe hit: damage (a weapon: can't be slipped), frost on their gloves, a shove.
function axeHit(self, other, dmg, nx, ny, text, kb) {
  var nl = Math.hypot(nx, ny) || 1; nx /= nl; ny /= nl;
  var dealt = hurt(other, dmg, "igbb", self.id);
  if (!(dealt > 0)) return;
  if (text) floater(other.x, other.y - other.r - 30, text, "crit");
  other.flash = 0.14;
  other.squash = { t: 0.14, max: 0.14, nx: nx, ny: ny };
  if (kb && other.alive && !other.grappled && !other.igbb) { other.vx = nx * kb; other.vy = ny * kb; }
  if (!reduceMotion) { shake = Math.max(shake, 12); hitStop = Math.max(hitStop, 0.06); }
  impacts.push({ x: other.x - nx * other.r * 0.5, y: other.y - ny * other.r * 0.5, nx: nx, ny: ny, life: 0.3, max: 0.3, color: AXE_C.L });
  for (var i = 0; i < 14 && !reduceMotion; i++) {
    var a = Math.atan2(ny, nx) + (Math.random() - 0.5) * 1.8, s = 140 + Math.random() * 300;
    particles.push({ x: other.x, y: other.y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 0.45, max: 0.45, size: 2 + Math.random() * 3, color: i % 3 ? AXE_C.L : AXE_C.W });
  }
  playRapierSlice();
  crowdReact(0.6);
  var fc = axeCfg(self) && axeCfg(self).frost;
  if (fc && other.alive && !iceImmune(other)) frostGloves(other, self, dealt, fc); // like Chuck's ice hands (liddell.js)
  checkEnd();
}

function axeTrailFx(m) {
  if (reduceMotion || Math.random() > 0.6) return;
  particles.push({ x: m.ax + (Math.random() - 0.5) * 14, y: m.ay + (Math.random() - 0.5) * 14, vx: (Math.random() - 0.5) * 40, vy: (Math.random() - 0.5) * 40 - 10,
    life: 0.35, max: 0.35, size: 1.5 + Math.random() * 2.5, color: Math.random() < 0.5 ? AXE_C.L : AXE_C.W });
}
function axeThunk(m) {
  if (!reduceMotion) shake = Math.max(shake, 6);
  playSwordClash(0.6);
  for (var i = 0; i < 10 && !reduceMotion; i++) {
    var a = Math.random() * Math.PI * 2, s = 80 + Math.random() * 160;
    particles.push({ x: m.ax, y: m.ay, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 0.35, max: 0.35, size: 2 + Math.random() * 2, color: i % 2 ? "#d8cdb5" : AXE_C.L });
  }
}
function axeCatchFx(self, x, y) {
  playSwordDraw();
  if (!reduceMotion) shake = Math.max(shake, 5);
  for (var i = 0; i < 12 && !reduceMotion; i++) {
    var a = Math.random() * Math.PI * 2, s = 60 + Math.random() * 140;
    particles.push({ x: x, y: y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 0.4, max: 0.4, size: 2 + Math.random() * 2.5, color: i % 2 ? AXE_C.W : AXE_C.L });
  }
}

// ---------------------------------------------------------------- Gane's bat

// From diamondSwordClash (sword.js), once the swing's been blocked: the first
// time it's Ciryl Gane's bat, the axe cuts it clean in half.
function axeCutsBat(d, a, cx, cy) {
  if (!axeStyle(d) || !axeCfg(d) || !axeCfg(d).cutsBat || !a || !a.cheater || a.cheater.mode !== "bat" || a.cheater.club || a.cheater.saber) return false;
  if (String(a.char.id || "").indexOf("c-ciryl-gane") !== 0) return false;
  var len = weaponLen(a), side = a.x < d.x ? -1 : 1, t0 = performance.now() / 1000;
  a.cheater = null; a.weaponLost = true; // the bat's gone for the fight
  axeHalves.push({ t0: t0, x: cx, y: cy, vx: side * 140, vy: -700, rot: -1.2, spin: -11, len: len, part: 0 });
  axeHalves.push({ t0: t0, x: cx, y: cy, vx: -side * 240, vy: -880, rot: 0.6, spin: 15, len: len, part: 1 });
  var nx = a.x - d.x, ny = a.y - d.y, nl = Math.hypot(nx, ny) || 1;
  a.vx = nx / nl * 420; a.vy = ny / nl * 420;
  a.squash = { t: 0.16, max: 0.16, nx: -nx / nl, ny: -ny / nl };
  if (d.rapier.sword) { d.rapier.sword.parry = 0; }
  clashFx(cx, cy, nx / nl, ny / nl, 1.8, AXE_C);
  floater(cx, Math.min(d.y, a.y) - d.r - 40, "BAT CUT IN HALF!", "crit");
  playRapierSlice();
  crowdReact(1);
  return true;
}

// ---------------------------------------------------------------- drawing

// Under the fighters: the red line he's about to throw down.
function drawLeviathanUnder() {
  balls.forEach(function (b) {
    var m = axeMove(b);
    if (!m || m.axe !== "throw" || m.phase !== "wind" || !b.alive) return;
    var now = performance.now() / 1000, pulse = 0.7 + 0.3 * Math.sin(now * 20), w = b.r * 0.5, len = m.len;
    ctx.save();
    ctx.translate(m.sx, m.sy); ctx.rotate(Math.atan2(m.dy, m.dx));
    ctx.globalAlpha = Math.min(1, m.t / 0.12);
    ctx.fillStyle = "rgba(220,20,20," + (0.2 * pulse) + ")";
    ctx.fillRect(0, -w / 2, len, w);
    ctx.strokeStyle = "rgba(220,20,20," + (0.85 * pulse) + ")"; ctx.lineWidth = 2.5; ctx.setLineDash([10, 8]);
    ctx.strokeRect(0, -w / 2, len, w);
    ctx.setLineDash([]);
    ctx.fillStyle = "rgba(235,30,30," + (0.8 * pulse) + ")";
    for (var x = (now * 260) % 34; x < len - 8; x += 34) { ctx.beginPath(); ctx.moveTo(x, -w * 0.28); ctx.lineTo(x + 10, 0); ctx.lineTo(x, w * 0.28); ctx.lineTo(x + 4, 0); ctx.closePath(); ctx.fill(); }
    ctx.restore();
  });
}

// From drawRapierArms (rapier.js): how the axe in his hand is drawn (nothing
// while it's out of his hand).
function axeDrawFn(b) {
  return function (x, y, a, l, k, al) { if (!axeAway(b)) drawLeviathan(x, y, a, l, k, al); };
}

// Over the fighters: the axe in flight or whirling round him, the halves of
// Gane's bat, the axe coming home after a disarm.
function drawLeviathanTop() {
  var now = performance.now() / 1000;
  balls.forEach(function (b) {
    var m = axeMove(b);
    if (!m || !axeAway(b) || m.ax == null) return;
    var len = b.r * AXE_LEN * 0.85;
    if (m.phase === "spin") { // the saw: a frosty blur ring round him
      var R = Math.hypot(m.ax - b.x, m.ay - b.y);
      ctx.save();
      ctx.strokeStyle = "rgba(191,233,255,0.35)"; ctx.lineWidth = b.r * 0.5;
      ctx.beginPath(); ctx.arc(b.x, b.y, R, m.orb - 1.6, m.orb, false); ctx.stroke();
      ctx.strokeStyle = "rgba(255,255,255,0.6)"; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(b.x, b.y, R + b.r * 0.22, m.orb - 1.2, m.orb, false); ctx.stroke();
      ctx.restore();
    }
    for (var g = 3; g >= 1; g--) drawSpunAxe(m.ax, m.ay, m.aa - g * 0.45 * (m.phase === "recall" ? -1 : 1), len, 0.16 * (4 - g));
    var q = m.phase === "hang" ? Math.sin(m.t * 80) * 0.08 * (1 - m.t / 0.22) : 0;
    drawSpunAxe(m.ax, m.ay, m.aa + q, len, 1);
  });
  axeHalves = axeHalves.filter(function (h) {
    var t = now - h.t0;
    if (t > 1.6 || t < 0) return false;
    var x = h.x + h.vx * t, y = h.y + h.vy * t + 450 * t * t, rot = h.rot + h.spin * t;
    ctx.save(); ctx.globalAlpha = Math.min(1, (1.6 - t) / 0.3);
    ctx.translate(x, y); ctx.rotate(rot);
    ctx.beginPath();
    if (h.part === 0) ctx.rect(-h.len * 0.4, -h.len * 0.3, h.len * 0.86, h.len * 0.6); else ctx.rect(h.len * 0.46, -h.len * 0.3, h.len, h.len * 0.6);
    ctx.clip();
    drawBat(h.part === 0 ? -h.len * 0.1 : -h.len * 0.7, 0, 0, h.len);
    ctx.restore();
    return true;
  });
  axeRecalls = axeRecalls.filter(function (f) {
    var b = balls[f.id], t = (now - f.t0) / 0.45;
    if (!b || t >= 1 || t < 0) return false;
    var e = t * t, x = f.sx + (b.x - f.sx) * e, y = f.sy + (b.y - f.sy) * e;
    drawSpunAxe(x, y, -t * 18, b.r * AXE_LEN * 0.85, 1);
    return true;
  });
}

// The axe spinning free: drawn round its middle, not the grip.
function drawSpunAxe(x, y, a, len, alpha) {
  ctx.save();
  ctx.translate(x, y); ctx.rotate(a);
  drawLeviathan(-len * 0.45, 0, 0, len, 1, alpha);
  ctx.restore();
}

// The axe, (x, y) at his hand on the grip, the head out along ang: a long
// curved wooden haft with a leather wrap by the hand and a carved pommel,
// a steel head with a tall upswept beard and a short lower one, runes cut
// into it and frost breathing off the edge.
function drawLeviathan(x, y, ang, len, k, alpha) {
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.translate(x, y); ctx.rotate(ang); ctx.scale(k, k);
  var L = len, OUT = "#1f2328";
  // The haft: a gentle S curve from the pommel to the head.
  var haft = function (grow) {
    ctx.beginPath();
    ctx.moveTo(-L * 0.2, -L * 0.03 - grow);
    ctx.bezierCurveTo(L * 0.2, -L * 0.06 - grow, L * 0.55, L * 0.02 - grow, L * 0.92, -L * 0.035 - grow);
    ctx.lineTo(L * 0.92, L * 0.035 + grow);
    ctx.bezierCurveTo(L * 0.55, L * 0.08 + grow, L * 0.2, L * 0.01 + grow, -L * 0.2, L * 0.035 + grow);
    ctx.closePath();
  };
  ctx.fillStyle = OUT; haft(2.2); ctx.fill();
  var wg = ctx.createLinearGradient(0, -L * 0.05, 0, L * 0.05);
  wg.addColorStop(0, "#b07a48"); wg.addColorStop(0.5, "#8a5a32"); wg.addColorStop(1, "#5e3a1e");
  ctx.fillStyle = wg; haft(0); ctx.fill();
  ctx.strokeStyle = "rgba(60,32,14,0.5)"; ctx.lineWidth = 1; // grain
  ctx.beginPath(); ctx.moveTo(L * 0.25, -L * 0.012); ctx.bezierCurveTo(L * 0.45, -L * 0.002, L * 0.6, L * 0.03, L * 0.85, 0); ctx.stroke();
  // Leather wrap round the grip, crossed straps at each end.
  ctx.fillStyle = "#4a4038";
  ctx.fillRect(-L * 0.08, -L * 0.042, L * 0.2, L * 0.084);
  ctx.strokeStyle = "#2c241e"; ctx.lineWidth = Math.max(1, L * 0.008);
  for (var i = 0; i < 6; i++) { var gx = -L * 0.08 + L * 0.2 * (i + 0.5) / 6; ctx.beginPath(); ctx.moveTo(gx - L * 0.012, -L * 0.042); ctx.lineTo(gx + L * 0.012, L * 0.042); ctx.stroke(); }
  // Carved pommel: a beast's head curling up.
  ctx.fillStyle = OUT;
  ctx.beginPath(); ctx.ellipse(-L * 0.205, -L * 0.012, L * 0.055, L * 0.05, -0.3, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#8e5e34";
  ctx.beginPath(); ctx.ellipse(-L * 0.205, -L * 0.012, L * 0.044, L * 0.039, -0.3, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#3a2312"; ctx.beginPath(); ctx.arc(-L * 0.215, -L * 0.025, L * 0.009, 0, Math.PI * 2); ctx.fill();
  // The head (the blade toward -y, "up" when it's pointing right at them).
  var hx = L * 0.86;
  var head = function (g) {
    ctx.beginPath();
    ctx.moveTo(hx - L * 0.07, -L * 0.04 - g);                                       // top of the socket
    ctx.bezierCurveTo(hx - L * 0.02, -L * 0.18, hx - L * 0.16, -L * 0.3, hx - L * 0.26, -L * 0.42 - g); // the tall upswept beard
    ctx.quadraticCurveTo(hx + L * 0.02, -L * 0.48 - g, hx + L * 0.2 + g, -L * 0.36); // the curved edge, round the top
    ctx.quadraticCurveTo(hx + L * 0.22 + g, -L * 0.18, hx + L * 0.12 + g, -L * 0.1); // down the edge
    ctx.lineTo(hx + L * 0.12 + g, L * 0.05);                                        // the back of the socket
    ctx.quadraticCurveTo(hx + L * 0.12 + g, L * 0.16, hx + L * 0.06, L * 0.2 + g);  // the short lower beard
    ctx.lineTo(hx - L * 0.02, L * 0.12);
    ctx.lineTo(hx - L * 0.07, L * 0.04 + g);
    ctx.closePath();
  };
  ctx.fillStyle = OUT; head(2.4); ctx.fill();
  var sg = ctx.createLinearGradient(hx - L * 0.2, -L * 0.45, hx + L * 0.2, L * 0.15);
  sg.addColorStop(0, "#7c8a97"); sg.addColorStop(0.45, "#4f5b67"); sg.addColorStop(1, "#353e47");
  ctx.fillStyle = sg; head(0); ctx.fill();
  // The bright edge, frosted.
  ctx.save();
  ctx.shadowColor = "#9fdcff"; ctx.shadowBlur = 10;
  ctx.strokeStyle = "rgba(220,244,255,0.95)"; ctx.lineWidth = Math.max(1.5, L * 0.016);
  ctx.beginPath(); ctx.moveTo(hx - L * 0.24, -L * 0.42); ctx.quadraticCurveTo(hx + L * 0.02, -L * 0.47, hx + L * 0.19, -L * 0.355); ctx.quadraticCurveTo(hx + L * 0.21, -L * 0.18, hx + L * 0.115, -L * 0.1); ctx.stroke();
  ctx.restore();
  // Runes: a stem with branches, little marks.
  ctx.strokeStyle = "rgba(200,225,240,0.7)"; ctx.lineWidth = Math.max(1, L * 0.007);
  ctx.beginPath();
  ctx.moveTo(hx + L * 0.02, -L * 0.06); ctx.lineTo(hx - L * 0.02, -L * 0.3);
  ctx.moveTo(hx - L * 0.005, -L * 0.18); ctx.lineTo(hx + L * 0.08, -L * 0.28);
  ctx.moveTo(hx - L * 0.012, -L * 0.24); ctx.lineTo(hx - L * 0.1, -L * 0.33);
  ctx.moveTo(hx + L * 0.1, -L * 0.2); ctx.lineTo(hx + L * 0.13, -L * 0.24);
  ctx.moveTo(hx + L * 0.03, L * 0.06); ctx.lineTo(hx + L * 0.07, L * 0.12);
  ctx.stroke();
  // The socket band and its rivet.
  ctx.fillStyle = "#5b6672"; ctx.fillRect(hx - L * 0.2, -L * 0.04, L * 0.14, L * 0.08);
  ctx.strokeStyle = OUT; ctx.lineWidth = 1.5; ctx.strokeRect(hx - L * 0.2, -L * 0.04, L * 0.14, L * 0.08);
  ctx.fillStyle = "#c9a646"; ctx.beginPath(); ctx.arc(hx + L * 0.03, 0, L * 0.022, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}
