// Dustin Poirier's Hot Sauce Fire Breath (Joe, 2026-11-10 to 2026-11-12).
// Once a fight, at random (char.hotSauce):
//   pull    his right glove reaches down to his shorts and flips a bottle of
//           Louisiana hot sauce up, spinning, and catches it
//   uncap   his left glove knocks the cap off (it flies away)
//   chug    head tipped back, both gloves on the bottle, 6 big gulps (his body
//           bulges with each one and the sauce level drops)
//   beat    tosses the empty, "AHHH!", then a beat ("...?") and a shiver
//   heat    red fills him from the bottom up, he swells and shakes, gloves on
//           his head, steam out the top (Joe's steam clip), "TOO HOT!!"
//   panic   "AAAAHHH!": he runs round the ring in a zig-zag fanning his mouth,
//           fire spraying out of him in coughing bursts that whip around but
//           mostly at the opponent (Joe's flamethrower clip). Every burst knocks
//           him back. Anyone in the flames takes small hits and catches fire:
//           they run around in a panic, burning, for a couple of seconds.
//   end     panting and fanning, steam
// Only ever his own two arms and gloves (Joe: never draw extra ones).
// While he's setting it up (pull to heat) anything thrown at him is dodged (a
// slip to the side and back) or, if he has a glove free, blocked (the attacker
// is knocked back a step). Walking into him just eases them out of the way;
// nobody bounces off him (Joe, 2026-11-12). He can't be hurt or grabbed for the
// whole move. Runs on b.igbb (move "hotsauce").
"use strict";

var HS_PULL = 0.75, HS_UNCAP = 0.4, HS_CHUG = 1.7, HS_GULPS = 6, HS_BEAT = 0.75, HS_HEAT = 1.2, HS_PANIC = 3.0, HS_END = 1.0;
var HS_RUN = 300;            // how fast he runs around in the panic
var HS_STARTUP = { pull: 1, uncap: 1, chug: 1, beat: 1, heat: 1 };
var hs = null;               // the move going on now (one at a time)
var hsFire = [], hsSteam = [], hsSweat = [], hsCap = null, hsTossed = null, hsClock = 0;

function hsRand(r) { return r[0] + Math.random() * (r[1] - r[0]); }
function hsR(a, b) { return a + Math.random() * (b - a); }
function hotSauceOn(b) { return !!(b && b.igbb && b.igbb.move === "hotsauce"); }
// His own hands are drawn by drawHotSauce while it's on (draw-attacks.js skips them).
function hotSauceHandsBusy(b) { return hotSauceOn(b); }

// From startMatchSeeded.
function resetHotSauce() {
  hs = null; hsFire = []; hsSteam = []; hsSweat = []; hsCap = null; hsTossed = null; hsClock = 0;
  stopHotSauceFlame();
}
// From makeBall.
function initHotSauce(b) {
  var cfg = b.char.hotSauce;
  b.hotSauceN = 0;
  b.hotSauceT = cfg ? hsRand(cfg.first) : Infinity;
}

// From the abilities loop, before the special. True while it's running.
function updateHotSauce(self, other, dt) {
  var cfg = self.char.hotSauce;
  if (!cfg) return false;
  if (!self.igbb) {
    if (!started || over || self.hotSauceN >= cfg.max) return false;
    self.hotSauceT -= dt;
    if (self.hotSauceT > 0 || !canStartIgbb(self, other) || swordDuelActive()) return false;
    startHotSauce(self, other);
  }
  if (!hotSauceOn(self) || !hs || hs.id !== self.id) return false;
  if (over) { endHotSauce(self); return false; }
  runHotSauce(self, other, cfg, dt);
  return hotSauceOn(self);
}

function startHotSauce(self, other) {
  clearActions(self);
  self.hotSauceN++;
  self.igbb = { move: "hotsauce", phase: "pull", t: 0 };
  self.invincible = true;
  hs = { id: self.id, oid: other.id, t: 0, phase: "pull", aim: Math.atan2(other.y - self.y, other.x - self.x),
         tickT: 0, burn: 0, burnTick: 0, gulp: -1, heading: 0, turnT: 0, burstT: 0, on: false, kick: { x: 0, y: 0 },
         bt: 0, aimBase: 0, whip: 1.6, def: null, dodge: null, prevAtk: false, bumpCd: 0 };
  floater(self.x, self.y - self.r - 36, "HOT SAUCE TIME!", "crit");
  crowdReact(0.8);
  playHotSauce("pull");
}

function hsNext(p) { hs.phase = p; hs.t = 0; }

function endHotSauce(self) {
  self.igbb = null;
  self.invincible = false;
  self.immuneCd = 0;
  self.vx = 0; self.vy = 0;
  stopHotSauceFlame();
  if (hs) { hs.phase = "over"; hs.on = false; }
}

// Dodging or blocking while he sets it up.
function hsAttacking(o) { return !!(o.punch || o.kick || o.swing || o.jabAnim || o.throwAnim || o.combo || o.flow || o.grapple); }
function hsFreeGlove() { return hs.phase === "pull" || hs.phase === "beat" || hs.phase === "heat"; }
function hsDefend(self, other, dt) {
  if (hs.def) { hs.def.t += dt; if (hs.def.t > 0.35) hs.def = null; }
  if (hs.dodge) {
    var dg = hs.dodge; dg.t += dt;
    var k = Math.min(1, dg.t / 0.4), cur = Math.sin(k * Math.PI), step = (cur - dg.done) * 55; // slips out, then sways back
    dg.done = cur;
    self.x = Math.min(W - self.r, Math.max(self.r, self.x + dg.x * step));
    self.y = Math.min(H - self.r, Math.max(self.r, self.y + dg.y * step));
    if (dg.t > 0.4) hs.dodge = null;
  }
  var atk = hsAttacking(other);
  var dx = other.x - self.x, dy = other.y - self.y, d = Math.sqrt(dx * dx + dy * dy) || 1, ux = dx / d, uy = dy / d;
  if (!HS_STARTUP[hs.phase] || !other.alive) { hs.prevAtk = atk; return; }
  if (d < self.r + other.r + 4) { // they just walk into him: eased out of his space, no bounce
    var push = self.r + other.r + 4 - d;
    other.x = Math.min(W - other.r, Math.max(other.r, other.x + ux * push));
    other.y = Math.min(H - other.r, Math.max(other.r, other.y + uy * push));
  }
  if (atk && !hs.prevAtk && d < self.r + other.r + 70 && !hs.dodge && !hs.def) {
    if (hsFreeGlove() && Math.random() < 0.6) {
      hs.def = { t: 0, x: ux, y: uy };
      other.punch = null; other.kick = null; other.swing = null; other.jabAnim = null; other.combo = null; other.flow = null;
      other.vx = ux * 380; other.vy = uy * 380;
      floater(self.x + ux * self.r, self.y - self.r - 30, "BLOCKED!", "dodge");
      playHotSauce("block");
      for (var i = 0; i < 10 && !reduceMotion; i++) {
        var a = Math.atan2(uy, ux) + hsR(-0.9, 0.9), v = hsR(160, 320);
        particles.push({ x: self.x + ux * self.r * 1.25, y: self.y + uy * self.r * 1.25, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 0.25, max: 0.25, size: hsR(2, 4), color: "#ffffff" });
      }
    } else {
      // a slip out to the side, away from the cage if he's up against it
      var sd = Math.random() < 0.5 ? 1 : -1, px = -uy * sd, py = ux * sd;
      if (self.x + px * 70 < self.r || self.x + px * 70 > W - self.r || self.y + py * 70 < self.r || self.y + py * 70 > H - self.r) { px = -px; py = -py; }
      px -= ux * 0.4; py -= uy * 0.4;
      var pl = Math.sqrt(px * px + py * py) || 1;
      hs.dodge = { t: 0, done: 0, x: px / pl, y: py / pl };
      floater(self.x, self.y - self.r - 30, "DODGED!", "dodge");
      playHotSauce("dodge");
    }
  }
  hs.prevAtk = atk;
}

function runHotSauce(self, other, cfg, dt) {
  var m = self.igbb;
  m.t += dt; hs.t += dt;
  m.phase = hs.phase;
  self.immuneCd = 1; // no IMMUNE popping up through all of it
  var toOpp = Math.atan2(other.y - self.y, other.x - self.x);
  if (hs.phase !== "panic") { self.vx = 0; self.vy = 0; }
  hsDefend(self, other, dt);
  if (hs.phase === "pull") {
    hs.aim = toOpp;
    if (hs.t >= HS_PULL) hsNext("uncap");
  } else if (hs.phase === "uncap") {
    if (!hsCap && hs.t > 0.18) { hsCap = { x: self.x + self.r * 0.6, y: self.y - self.r * 1.4, vx: hsR(80, 160), vy: -380, t: 0, rot: 0 }; playHotSauce("cap"); }
    if (hs.t >= HS_UNCAP) hsNext("chug");
  } else if (hs.phase === "chug") {
    var g = Math.floor(hs.t / (HS_CHUG / HS_GULPS));
    if (g !== hs.gulp && g < HS_GULPS) { hs.gulp = g; playHotSauce("gulp"); }
    if (hs.t >= HS_CHUG) {
      hsNext("beat");
      floater(self.x, self.y - self.r - 40, "AHHH!", "note");
      hsTossed = { x: self.x - self.r * 0.3, y: self.y - self.r * 1.6, vx: -260, vy: -420, t: 0 };
    }
  } else if (hs.phase === "beat") {
    if (hs.t > 0.45 && !hs.q) { hs.q = 1; floater(self.x, self.y - self.r - 40, "...?", "note"); }
    if (hs.t >= HS_BEAT) { hsNext("heat"); playHotSauce("steam"); }
  } else if (hs.phase === "heat") {
    if (hs.t > 0.35 && !hs.hot) { hs.hot = 1; floater(self.x, self.y - self.r - 46, "TOO HOT!!", "crit"); crowdReact(0.7); }
    if (hs.t >= HS_HEAT) {
      hsNext("panic");
      hs.heading = toOpp + hsR(-0.8, 0.8); hs.turnT = 0.3;
      hs.on = true; hs.burstT = 0.55; hs.aimBase = toOpp; hs.whip = 1.6; hs.bt = 0;
      floater(self.x, self.y + self.r + 44, "AAAAHHH!", "crit");
      if (!reduceMotion) shake = Math.max(shake, 16);
      crowdReact(1);
      startHotSauceFlame();
    }
  } else if (hs.phase === "panic") {
    // a zig-zag run, turning back off the cage
    hs.turnT -= dt;
    if (hs.turnT <= 0) { hs.turnT = hsR(0.22, 0.4); hs.heading += hsR(1.2, 2.4) * (Math.random() < 0.5 ? -1 : 1); }
    var sp = HS_RUN * (hs.on ? 0.55 : 1.1);
    self.vx = Math.cos(hs.heading) * sp + hs.kick.x; self.vy = Math.sin(hs.heading) * sp + hs.kick.y;
    hs.kick.x *= 0.88; hs.kick.y *= 0.88;
    if (self.x < self.r + 4 || self.x > W - self.r - 4) hs.heading = Math.PI - hs.heading;
    if (self.y < self.r + 4 || self.y > H - self.r - 4) hs.heading = -hs.heading;
    // coughing bursts: on about half a second, off a moment
    hs.burstT -= dt;
    if (hs.burstT <= 0) {
      hs.on = !hs.on;
      hs.burstT = hs.on ? hsR(0.42, 0.6) : hsR(0.12, 0.2);
      if (hs.on) { if (!reduceMotion) shake = Math.max(shake, 10); hs.aimBase = toOpp + hsR(-0.6, 0.6); hs.whip = hsR(1.5, 2.5) * (Math.random() < 0.5 ? -1 : 1); hs.bt = 0; }
      else playHotSauce("cough");
      setHotSauceFlame(hs.on ? 1 : 0.3);
    }
    var dx = other.x - self.x, dy = other.y - self.y, d = Math.sqrt(dx * dx + dy * dy) || 1;
    if (hs.on) {
      hs.bt += dt;
      // the flame whips across while he flails, pulled toward them
      hs.aim = hs.aimBase + Math.sin(hs.bt * 9) * 0.5 + hs.whip * (hs.bt - 0.25) * 0.8 + hsR(-0.12, 0.12);
      var mx = self.x + Math.cos(hs.aim) * self.r * 0.95, my = self.y + Math.sin(hs.aim) * self.r * 0.95;
      for (var i = 0; i < (reduceMotion ? 4 : 11); i++) {
        var a = hs.aim + hsR(-cfg.half, cfg.half) * hsR(0.3, 1), v = hsR(430, 650);
        hsFire.push({ x: mx, y: my, vx: Math.cos(a) * v + self.vx * 0.5, vy: Math.sin(a) * v + self.vy * 0.5, t: 0, dur: cfg.len / v * hsR(0.8, 1.1), s: hsR(10, 19) });
      }
      hs.kick.x -= Math.cos(hs.aim) * 40; hs.kick.y -= Math.sin(hs.aim) * 40; // knocked back by it
      if (!reduceMotion) shake = Math.max(shake, 5);
      var ang = Math.atan2(dy, dx), off = Math.abs(Math.atan2(Math.sin(ang - hs.aim), Math.cos(ang - hs.aim)));
      hs.tickT -= dt;
      if (other.alive && d < cfg.len + other.r && off < cfg.half + Math.asin(Math.min(1, other.r / Math.max(d, other.r))) && hs.tickT <= 0) {
        hs.tickT = 0.12;
        var got = hurt(other, cfg.tickDmg, "igbb", self.id); // fire: can't be slipped or blocked
        if (got > 0) other.flash = 0.08;
        if (!hs.burn) { floater(other.x, other.y - other.r - 30, "ON FIRE!", "crit"); playHotSauce("ignite"); }
        hs.burn = cfg.burn;
        other.vx += Math.cos(hs.aim) * 60; other.vy += Math.sin(hs.aim) * 60;
        checkEnd();
      }
    }
    // running into them barges them out of the way
    hs.bumpCd = Math.max(0, hs.bumpCd - dt);
    if (other.alive && d < self.r + other.r + 4 && hs.bumpCd <= 0) {
      hs.bumpCd = 0.5;
      other.vx = dx / d * 750; other.vy = dy / d * 750;
      hs.heading = Math.atan2(-dy, -dx) + hsR(-0.6, 0.6);
      floater(other.x, other.y - other.r - 30, "BUMPED!", "note");
      if (!reduceMotion) shake = Math.max(shake, 8);
    }
    if (Math.random() < 0.5 && !reduceMotion) { // sweat flying off
      var sa = hsR(0, 6.28);
      hsSweat.push({ x: self.x + Math.cos(sa) * self.r, y: self.y + Math.sin(sa) * self.r, vx: Math.cos(sa) * hsR(120, 240), vy: Math.sin(sa) * hsR(120, 240) - 60, t: 0, dur: hsR(0.3, 0.5) });
    }
    if (hs.t >= HS_PANIC) {
      hsNext("end"); hs.on = false; self.vx = 0; self.vy = 0;
      stopHotSauceFlame();
      floater(self.x, self.y - self.r - 40, "*pant pant*", "note");
      playHotSauce("steamSoft");
    }
  } else if (hs.phase === "end") {
    if (hs.t >= HS_END) endHotSauce(self);
  }
}

// Every frame from update(): the flames, steam, sweat, and whoever's burning.
function tickHotSauce(dt) {
  hsClock += dt;
  if (hs) {
    var self = balls[hs.id], other = balls[hs.oid];
    var kettle = hs.phase === "heat" ? 1 : (hs.phase === "panic" ? 0.5 : (hs.phase === "end" ? 0.8 : 0));
    if (self && kettle && Math.random() < kettle && !reduceMotion) {
      [-1, 1].forEach(function (sd) {
        hsSteam.push({ x: self.x + sd * self.r * 0.7, y: self.y - self.r * 0.75, vx: sd * hsR(30, 90), vy: hsR(-220, -120), t: 0, dur: hsR(0.45, 0.85), s: hsR(6, 12) });
      });
      if (hs.phase === "heat") hsSteam.push({ x: self.x, y: self.y - self.r, vx: hsR(-20, 20), vy: hsR(-320, -240), t: 0, dur: hsR(0.3, 0.5), s: hsR(5, 9) });
    }
    if (hs.burn > 0 && other && other.alive && !over) {
      hs.burn -= dt; hs.burnTick -= dt;
      for (var i = 0; i < (reduceMotion ? 1 : 5); i++) hsFire.push({ x: other.x + hsR(-0.7, 0.7) * other.r, y: other.y + hsR(-0.5, 0.8) * other.r, vx: hsR(-20, 20), vy: hsR(-180, -90), t: 0, dur: hsR(0.25, 0.5), s: hsR(11, 19), body: true });
      if (hs.burnTick <= 0 && !hs.on) { hs.burnTick = 0.25; hurt(other, self.char.hotSauce.burnDmg, "igbb", hs.id); checkEnd(); }
      // running around in a panic while they burn (not while held or flying)
      if (!other.grapple && !other.grappled && !other.slam && !subLocked(other) && Math.random() < dt * 4) {
        var pa = Math.random() * Math.PI * 2; other.vx = Math.cos(pa) * 520; other.vy = Math.sin(pa) * 520;
      }
      if (hs.burn <= 0) floater(other.x, other.y - other.r - 30, "PUT IT OUT!", "note");
    } else if (over) hs.burn = 0;
    if (over && hs.on) { hs.on = false; stopHotSauceFlame(); }
    if (hs.phase === "over" && hs.burn <= 0 && !hsFire.length && !hsSteam.length) hs = null;
  }
  if (hsCap) { hsCap.t += dt; hsCap.x += hsCap.vx * dt; hsCap.y += hsCap.vy * dt; hsCap.vy += 900 * dt; hsCap.rot += 20 * dt; if (hsCap.t > 0.9) hsCap = null; }
  if (hsTossed) { hsTossed.t += dt; hsTossed.x += hsTossed.vx * dt; hsTossed.y += hsTossed.vy * dt; hsTossed.vy += 700 * dt; if (hsTossed.t > 1.1) hsTossed = null; }
  [hsFire, hsSteam, hsSweat].forEach(function (L) {
    L.forEach(function (f) { f.t += dt; f.x += f.vx * dt; f.y += f.vy * dt; if (L === hsFire && !f.body) { f.vx *= 0.985; f.vy *= 0.985; } });
  });
  hsFire = hsFire.filter(function (f) { return f.t < f.dur; });
  hsSteam = hsSteam.filter(function (f) { return f.t < f.dur; });
  hsSweat = hsSweat.filter(function (f) { return f.t < f.dur; });
}

// ---------------------------------------------------------------- drawing

// How swollen / squashed he is and his tilt. The shake comes from the clock,
// not Math.random, so drawing never uses up the fight's seeded numbers.
function hsJit(seed) { return Math.sin(hsClock * 97 + seed * 13.7) * Math.cos(hsClock * 61 + seed * 3.1); }
function hsPose() {
  var p = { sx: 1, sy: 1, rot: 0, dx: 0, dy: 0 };
  if (!hs) return p;
  var t = hs.t;
  if (hs.phase === "pull") { var k = t / HS_PULL; p.sy = 1 + 0.08 * Math.sin(k * Math.PI); p.sx = 1 - 0.05 * Math.sin(k * Math.PI); }
  if (hs.phase === "uncap") p.rot = -0.12 * Math.sin(t / HS_UNCAP * Math.PI);
  if (hs.phase === "chug") {
    var lean = Math.min(1, t / 0.2), gk = (t % (HS_CHUG / HS_GULPS)) / (HS_CHUG / HS_GULPS), bulge = Math.sin(gk * Math.PI) * 0.09;
    p.sy = 1 + 0.1 * lean - bulge * 0.4; p.sx = 1 - 0.06 * lean + bulge; p.dy = -6 * lean; p.rot = -0.18 * lean;
  }
  if (hs.phase === "beat") { var bk = t / HS_BEAT; p.sx = 1 + 0.04 * Math.sin(bk * Math.PI); p.sy = p.sx; if (t > 0.45) p.dx = Math.sin(t * 90) * 1.2; }
  if (hs.phase === "heat") {
    var hk = Math.min(1, t / HS_HEAT), wob = Math.sin(t * 38);
    p.sx = 1 + 0.18 * hk + 0.04 * wob; p.sy = 1 + 0.18 * hk - 0.04 * wob; p.dx = hsJit(1) * 4 * hk; p.dy = hsJit(2) * 4 * hk;
  }
  if (hs.phase === "panic") {
    var f = hs.on ? 1 : 0;
    p.sx = 1.06 + 0.08 * Math.sin(hsClock * 30) + f * 0.06; p.sy = 1.06 - 0.08 * Math.sin(hsClock * 30);
    p.rot = Math.sin(hsClock * 17) * 0.22;
  }
  if (hs.phase === "end") { var ek = t / HS_END, pant = Math.sin(t * 18) * 0.05 * (1 - ek); p.sx = 1 + pant; p.sy = 1 - pant; }
  if (hs.dodge) { var dk = Math.sin(Math.min(1, hs.dodge.t / 0.4) * Math.PI); p.rot += 0.25 * dk * (hs.dodge.x >= 0 ? 1 : -1); p.sx *= 1 - 0.08 * dk; p.sy *= 1 + 0.06 * dk; }
  if (hs.def) { var bk2 = Math.sin(Math.min(1, hs.def.t / 0.3) * Math.PI); p.dx -= hs.def.x * 6 * bk2; p.dy -= hs.def.y * 6 * bk2; }
  return p;
}
function hsRed() {
  if (!hs) return 0;
  if (hs.phase === "chug") return 0.15 * hs.t / HS_CHUG;
  if (hs.phase === "beat") return 0.15;
  if (hs.phase === "heat") return 0.15 + 0.85 * Math.min(1, hs.t / (HS_HEAT * 0.7));
  if (hs.phase === "panic") return 1;
  if (hs.phase === "end") return 1 - hs.t / HS_END;
  return 0;
}

// From draw(), with the other body poses: squash, swell, tilt.
function applyHotSaucePose(b) {
  if (!hs || hs.phase === "over" || b.id !== hs.id || !hotSauceOn(b)) return;
  var p = hsPose();
  ctx.translate(b.x + p.dx, b.y + p.dy); ctx.rotate(p.rot); ctx.scale(p.sx, p.sy); ctx.rotate(-p.rot); ctx.translate(-b.x, -b.y);
}

function hsBottle(x, y, ang, sc, level, capOn) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.scale(sc, sc);
  ctx.lineWidth = 2; ctx.strokeStyle = "#2a1210";
  ctx.fillStyle = "rgba(255,235,220,0.9)"; // glass
  ctx.beginPath(); ctx.roundRect(-9, -8, 18, 34, 4); ctx.fill();
  ctx.fillStyle = "#c4161c"; // the sauce left in it
  var lv = 34 * level; ctx.fillRect(-9, 26 - lv, 18, lv);
  ctx.beginPath(); ctx.roundRect(-9, -8, 18, 34, 4); ctx.stroke();
  ctx.fillStyle = level > 0.95 ? "#c4161c" : "rgba(255,235,220,0.9)";
  ctx.beginPath(); ctx.moveTo(-9, -8); ctx.lineTo(-4, -20); ctx.lineTo(4, -20); ctx.lineTo(9, -8); ctx.closePath(); ctx.fill(); ctx.stroke();
  if (capOn) { ctx.fillStyle = "#f2e6c9"; ctx.fillRect(-4.5, -27, 9, 7); ctx.strokeRect(-4.5, -27, 9, 7); }
  ctx.fillStyle = "#f2e6c9"; ctx.fillRect(-8, 0, 16, 16);
  ctx.fillStyle = "#c4161c"; ctx.font = "800 5px Arial"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillText("HOT", 0, 4); ctx.fillText("SAUCE", 0, 9);
  ctx.fillStyle = "#2f8f2f"; ctx.beginPath(); ctx.ellipse(0, 13.5, 4, 1.6, 0.3, 0, 6.28); ctx.fill(); // a little pepper
  ctx.restore();
}
// One of his own arms and gloves, the way the game draws them (chairshot.js).
function hsArm(d, sx, sy, hx, hy) {
  var size = d.char.punch.size || 13;
  strokeLimb(size * 0.75, armColor(d.char), function () { ctx.moveTo(sx, sy); ctx.lineTo(hx, hy); });
  drawGloveAt(hx, hy, size * 0.85, d.char, Math.atan2(hy - sy, hx - sx));
}

// Over the fighters, the stands and the jumbotron (sc/ox/oy place the arena). From draw().
function drawHotSauce(scl, ox, oy) {
  if (!hs && !hsFire.length && !hsSteam.length && !hsCap && !hsTossed) return;
  ctx.save(); ctx.setTransform(scl, 0, 0, scl, ox, oy);
  var d = hs && hs.phase !== "over" ? balls[hs.id] : null;
  if (d && d.alive && hotSauceOn(d)) {
    var p = hsPose(), r = d.r, cx = d.x + p.dx, cy = d.y + p.dy, t = hs.t;
    // red rising from the bottom up, over his kit
    var lvl = hsRed();
    if (lvl > 0.01) {
      ctx.save();
      ctx.translate(cx, cy); ctx.rotate(p.rot); ctx.scale(p.sx, p.sy); ctx.rotate(-p.rot);
      ctx.beginPath(); ctx.arc(0, 0, r * 0.97, 0, Math.PI * 2); ctx.clip();
      var top = r - 2 * r * lvl, wave = Math.sin(hsClock * 12) * 3;
      ctx.fillStyle = "rgba(235,30,15,0.62)";
      ctx.beginPath(); ctx.moveTo(-r, r); ctx.lineTo(-r, top + wave); ctx.quadraticCurveTo(0, top - wave * 2, r, top - wave); ctx.lineTo(r, r); ctx.closePath(); ctx.fill();
      ctx.restore();
      if (lvl > 0.6) {
        var gr = ctx.createRadialGradient(cx, cy, r, cx, cy, r * 1.9);
        gr.addColorStop(0, "rgba(255,90,20," + (0.5 * lvl) + ")"); gr.addColorStop(1, "rgba(255,90,20,0)");
        ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(cx, cy, r * 1.9, 0, Math.PI * 2); ctx.fill();
      }
    }
    var shR = [cx + r * 0.62, cy - r * 0.3], shL = [cx - r * 0.62, cy - r * 0.3];
    // a block snaps one of his gloves out toward the attacker and back
    var bh = function (hx, hy) {
      if (!hs.def) return [hx, hy];
      var w = Math.sin(Math.min(1, hs.def.t / 0.3) * Math.PI), gx = cx + hs.def.x * r * 1.2, gy = cy + hs.def.y * r * 1.2;
      return [hx + (gx - hx) * w, hy + (gy - hy) * w];
    };
    var useR = hs.def && hs.def.x > 0;
    if (hs.phase === "pull") {
      // flipped up out of his shorts, spinning, caught
      var k = t / HS_PULL, h = Math.sin(Math.min(1, k * 1.15) * Math.PI) * 70;
      var bx = cx + r * 0.95, by = cy + r * 0.3 - h - k * 20, catchK = Math.max(0, (k - 0.6) / 0.4);
      if (k < 0.6) {
        hsArm(d, shR[0], shR[1], cx + r * (0.85 + 0.1 * Math.sin(k / 0.6 * Math.PI)), cy + r * (0.55 - 0.9 * k / 0.6));
        hsBottle(bx, by, k * Math.PI * 4, 1.3, 1, true);
      } else {
        bx = cx + r * 0.95; by = cy - r * 0.45 - 12 * (1 - catchK);
        hsBottle(bx, by, (1 - catchK) * 0.6 + 0.15, 1.3, 1, true);
        hsArm(d, shR[0], shR[1], bx, by + 8);
      }
      var lh = bh(cx - r * 0.85, cy - r * 0.75); // the left glove stays up (and blocks)
      hsArm(d, shL[0], shL[1], lh[0], lh[1]);
    } else if (hs.phase === "uncap") {
      var bx2 = cx + r * 0.95, by2 = cy - r * 0.45;
      hsBottle(bx2, by2, 0.15, 1.3, 1, !hsCap && t < 0.18);
      hsArm(d, shR[0], shR[1], bx2, by2 + 8);
      var hk = t < 0.18 ? easeOut(t / 0.18) : Math.max(0, 1 - (t - 0.18) / 0.22); // the left glove knocks the cap off
      hsArm(d, shL[0], shL[1], cx - r * 0.85 + (bx2 - 14 - (cx - r * 0.85)) * hk, cy - r * 0.75 + (by2 - 30 - (cy - r * 0.75)) * hk);
    } else if (hs.phase === "chug") {
      var c = Math.min(1, t / 0.2), gk = (t % (HS_CHUG / HS_GULPS)) / (HS_CHUG / HS_GULPS);
      var level = Math.max(0, 1 - t / HS_CHUG);
      var bx3 = cx + r * (0.95 - 0.75 * c), by3 = cy - r * (0.45 + 0.85 * c) - 10;
      hsBottle(bx3, by3, 0.15 + c * 2.75 + Math.sin(gk * Math.PI * 2) * 0.12, 1.3, level, false);
      hsArm(d, shR[0], shR[1], bx3 + 6, by3 + 8);
      hsArm(d, shL[0], shL[1], bx3 - 12, by3 + 2); // both gloves on it, really going for it
      for (var j = 0; j < 5; j++) { // the sauce glugging into him
        var u = ((t * 5 + j / 5) % 1);
        ctx.fillStyle = "#e0221b"; ctx.beginPath(); ctx.arc(bx3 + (cx - bx3) * u * 0.9, by3 + (cy - r * 0.6 - by3) * u, 4 * (1 - u * 0.4), 0, Math.PI * 2); ctx.fill();
      }
      if (gk < 0.2) { ctx.fillStyle = "#e0221b"; ctx.beginPath(); ctx.arc(bx3 + 18, by3 + 8 + gk * 60, 3, 0, Math.PI * 2); ctx.fill(); }
    } else if (hs.phase === "beat") {
      // arms dropping after the toss, then a shiver
      var shv = t > 0.45 ? Math.sin(t * 80) * 2 : 0, dropK = easeOut(Math.min(1, t / 0.3));
      var rr0 = [cx + r * 0.9 + shv, cy - r * (1.1 - 1.0 * dropK)], ll0 = [cx - r * 0.85 - shv, cy - r * 0.7];
      var rr = useR ? bh(rr0[0], rr0[1]) : rr0, ll = !useR ? bh(ll0[0], ll0[1]) : ll0;
      hsArm(d, shR[0], shR[1], rr[0], rr[1]);
      hsArm(d, shL[0], shL[1], ll[0], ll[1]);
    } else if (hs.phase === "heat") {
      // gripping his head, shaking
      var sh = Math.sin(t * 50) * 4;
      var rh = [cx + r * 0.9 + sh, cy - r * 0.95], lh2 = [cx - r * 0.9 - sh, cy - r * 0.95];
      if (useR) rh = bh(rh[0], rh[1]); else lh2 = bh(lh2[0], lh2[1]);
      hsArm(d, shR[0], shR[1], rh[0], rh[1]);
      hsArm(d, shL[0], shL[1], lh2[0], lh2[1]);
      ctx.save(); // "!!" over his head
      ctx.font = "900 34px Arial"; ctx.textAlign = "center"; ctx.fillStyle = "#e0221b"; ctx.strokeStyle = "#fff"; ctx.lineWidth = 5;
      var pop = easeOut(Math.min(1, t / 0.2)); ctx.translate(cx + r * 0.9, cy - r * 1.35); ctx.scale(pop, pop);
      ctx.strokeText("!!", 0, 0); ctx.fillText("!!", 0, 0); ctx.restore();
    } else if (hs.phase === "panic" || hs.phase === "end") {
      // fanning his mouth with both gloves, frantic
      var fan = hs.phase === "panic" ? 34 : 14, spd = hs.phase === "panic" ? 1 : 0.5;
      var mA = hs.phase === "panic" ? hs.aim : -Math.PI / 2;
      var mxx = cx + Math.cos(mA) * r * 1.05, myy = cy + Math.sin(mA) * r * 1.05, px = -Math.sin(mA), py = Math.cos(mA);
      [-1, 1].forEach(function (s, i) {
        var w = Math.sin(hsClock * 28 * spd + i * 2) * fan;
        hsArm(d, cx + px * s * r * 0.7, cy + py * s * r * 0.7, mxx + px * s * (r * 0.55 + w * 0.3) + Math.cos(mA) * w * 0.4, myy + py * s * (r * 0.55 + w * 0.3) + Math.sin(mA) * w * 0.4);
      });
    }
  }
  // the cap and the empty bottle flying away
  if (hsCap) { ctx.save(); ctx.translate(hsCap.x, hsCap.y); ctx.rotate(hsCap.rot); ctx.fillStyle = "#f2e6c9"; ctx.strokeStyle = "#2a1210"; ctx.lineWidth = 2; ctx.fillRect(-6, -5, 12, 10); ctx.strokeRect(-6, -5, 12, 10); ctx.restore(); }
  if (hsTossed) hsBottle(hsTossed.x, hsTossed.y, -hsTossed.t * 14, 1.3, 0, false);
  hsSweat.forEach(function (s) {
    var k = s.t / s.dur; ctx.save(); ctx.globalAlpha = 1 - k; ctx.fillStyle = "#8fd3ff"; ctx.strokeStyle = "#2b6c99"; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.ellipse(s.x, s.y, 3.5, 5.5, Math.atan2(s.vy, s.vx) + Math.PI / 2, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); ctx.restore();
  });
  hsSteam.forEach(function (s) {
    var k = s.t / s.dur; ctx.save(); ctx.globalAlpha = 0.8 * (1 - k); ctx.fillStyle = "#ffffff";
    ctx.beginPath(); ctx.arc(s.x, s.y, s.s * (1 + k * 1.4), 0, Math.PI * 2); ctx.fill(); ctx.restore();
  });
  hsFire.forEach(function (f) {
    var k = f.t / f.dur, s = f.s * (f.body ? 1 - k * 0.6 : 0.6 + k * 1.6);
    var col = k < 0.22 ? "255,245,190" : (k < 0.55 ? "255,160,40" : "230,60,20");
    var g = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, s);
    g.addColorStop(0, "rgba(" + col + "," + (0.95 * (1 - k * 0.7)) + ")"); g.addColorStop(1, "rgba(" + col + ",0)");
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(f.x, f.y, s, 0, Math.PI * 2); ctx.fill();
  });
  ctx.restore();
}
