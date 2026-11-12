// Khabib Nurmagomedov's "Send Me Location" (Joe, 2026-11-12).
// Once a fight, at random (char.sendLocation):
//   pull    his right glove drops to his hip and brings a military phone up
//           to his ear (bent arm, the back of the phone against his head)
//   talk    "send me location" (Joe's clip), a speech bubble builds word by
//           word; then he brings the phone down to look at it and hits SEND
//           ("LOCATION SENT ✓")
//   space   the fight HOLDS while the view cuts up to a Russian space station
//           (ОРБИТА-1): the cannon deploys and charges (Joe's laser charge +
//           shot), fires, and the beam punches down through the atmosphere
//   target  back in the arena a red circle locks on the middle of the ring;
//           if Khabib is standing in it he dashes out ("GET OUT THE CIRCLE!")
//   beam    the beam lands (Joe's laser blast hit): direct hit inside the
//           circle = big damage + thrown into the cage twice; caught by the
//           blast wave = less damage + one cage slam. A scorched crater is
//           left on the mat (under the fighters) and fades after ~9s.
//   after   the beam area is a solid wall until the move ends, and once
//           they've been hit they sit outside it, dazed, until it's over.
// While he's on the phone (pull, talk, target) anything thrown at him is
// dodged (slip to the side and back) or, with his left glove free, blocked
// (the attacker is knocked back). He can't be hurt or grabbed for the whole
// move. Only ever his own two arms and gloves. Runs on b.igbb (move "sendloc").
"use strict";

var SL_KH = { pull: 0.7, talk: 3.1, space: 4.2, target: 0.9, beam: 1.4, after: 1.4, R: 120, fire: 2.6, atmo: 3.3 };
// Josh Hokit's Death Star strike (Joe, 2026-11-12) runs on the same move
// (sl.ds): in his Dark Side form he raises a hand to the sky ("FIRE WHEN
// READY"), the view cuts up to the Death Star, its superlaser charges (eight
// green beams meeting in front of the dish) and fires down into the ring.
// The space cut is timed to Joe's recording: the shot lands 4.7s in.
var SL_DS = { pull: 0.5, talk: 1.5, space: 6.3, target: 0.9, beam: 1.4, after: 1.4, R: 120, fire: 4.7, atmo: 5.45 };
var SL = SL_KH, SL_FIRE_AT = SL.fire, SL_ATMO_AT = SL.atmo, SL_CR_LIFE = 9;
// Beam colours: Khabib's orange-gold, the Death Star's green.
var SL_PAL = {
  kh: { outer: "rgba(255,110,30,0.35)", mid: "rgba(255,190,80,0.85)", core: "rgba(255,255,240,1)", edge: "rgba(255,150,50,0)", wrap: "rgba(255,240,200,0.8)",
    gOuter: "rgba(255,120,40,0.35)", gMid: "rgba(255,200,90,0.75)", glowMid: "rgba(255,170,60,0.6)", glowEdge: "rgba(255,120,40,0)", flash: "#fff8e0" },
  ds: { outer: "rgba(40,255,90,0.35)", mid: "rgba(110,255,120,0.85)", core: "rgba(240,255,240,1)", edge: "rgba(60,255,100,0)", wrap: "rgba(210,255,210,0.8)",
    gOuter: "rgba(40,255,90,0.35)", gMid: "rgba(120,255,130,0.75)", glowMid: "rgba(80,255,110,0.6)", glowEdge: "rgba(40,255,90,0)", flash: "#eaffea" }
};
function slPal() { return sl && sl.ds ? SL_PAL.ds : SL_PAL.kh; }
var sl = null, slFx = [], slCrater = null, slClock = 0;
// Background for the space cut (drawing only, never touches the fight's numbers).
var slStars = [], slClouds = [];
(function () {
  for (var i = 0; i < 220; i++) slStars.push([Math.random(), Math.random(), Math.random() * 1.8 + 0.4, Math.random() * 6]);
  for (var j = 0; j < 26; j++) slClouds.push([Math.random(), Math.random(), 0.6 + Math.random() * 0.8]);
})();

function slR(a, b) { return a + Math.random() * (b - a); }
function sendLocOn(b) { return !!(b && b.igbb && b.igbb.move === "sendloc"); }
// His hands are drawn here from the phone call until the beam is gone (draw-attacks.js skips them).
function sendLocHandsBusy(b) { return sendLocOn(b) && sl && sl.id === b.id && sl.phase !== "after"; }
// The fight holds while we're up with the space station (main.js multiplies it in).
function sendLocTimeScale() { return sl && sl.phase === "space" ? 0 : 1; }

// From startMatchSeeded.
function resetSendLocation() {
  sl = null; slFx = []; slCrater = null; slClock = 0;
  stopSendLocationCharge(); stopDsMusic();
}
// From makeBall.
function initSendLocation(b) {
  var cfg = b.char.sendLocation;
  b.sendLocN = 0;
  b.sendLocT = cfg ? slR(cfg.first[0], cfg.first[1]) : Infinity;
}

// From the abilities loop, before the special. True while it's running.
function updateSendLocation(self, other, dt) {
  var cfg = self.char.sendLocation, ds = false;
  // Hokit's Death Star strike: only in his Dark Side form, saber lit (hokit-darkside.js).
  if (!cfg && self.char.darkSide && self.char.darkSide.deathStar) { cfg = self.char.darkSide.deathStar; ds = true; }
  if (!cfg) return false;
  if (!sendLocOn(self)) {
    if (self.igbb || !started || over || self.sendLocN >= cfg.max) return false;
    if (ds && (!sithArmed(self) || saberLock || self.dsStrikeT == null)) return false;
    if (ds) self.dsStrikeT -= dt; else self.sendLocT -= dt;
    if ((ds ? self.dsStrikeT : self.sendLocT) > 0 || !canStartIgbb(self, other) || swordDuelActive() || ringBear || (sl && sl.phase !== "over")) return false; // (never with the bear in the ring)
    if (ds) self.dsStrikeT = null; // once a form
    startSendLocation(self, other, ds);
  }
  if (over) { endSendLocation(self, other); return false; }
  runSendLocation(self, other, cfg, dt);
  return sendLocOn(self);
}

function startSendLocation(self, other, ds) {
  clearActions(self);
  self.sendLocN++;
  self.igbb = { move: "sendloc", phase: "pull", t: 0 };
  self.invincible = true;
  SL = ds ? SL_DS : SL_KH; SL_FIRE_AT = SL.fire; SL_ATMO_AT = SL.atmo;
  sl = { id: self.id, oid: other.id, t: 0, u: 0, phase: "pull", def: null, dodge: null, prevAtk: false, ds: !!ds };
  if (ds) { floater(self.x, self.y - self.r - 30, "DEATH STAR", "crit"); playSendLocation("music"); }
  playSendLocation("pull");
}
function slNext(p) {
  sl.phase = p; sl.t = 0;
  var me = balls[sl.id]; if (me && me.igbb) { me.igbb.phase = p; me.igbb.t = 0; }
}
function endSendLocation(self, other) {
  if (sl && sl.held && other) other.dazed = false;
  self.igbb = null; self.invincible = false; self.immuneCd = 0;
  self.vx = 0; self.vy = 0;
  stopSendLocationCharge();
  if (over && sl && sl.ds) stopDsMusic(1.0); // the fight's over: the knockout call takes it
  if (sl) { sl.phase = "over"; sl.held = false; }
}

// While he's on the phone he still fights back: swats strikes away with his
// free (left) glove, or slips them and sways back (like Dustin's hot sauce).
function slAttacking(o) { return !!(o.punch || o.kick || o.swing || o.jabAnim || o.throwAnim || o.combo || o.flow || o.grapple); }
function slFreeGlove() { return sl.phase === "pull" || sl.phase === "talk" || sl.phase === "target"; }
function slDefend(self, other, dt) {
  if (sl.def) { sl.def.t += dt; if (sl.def.t > 0.35) sl.def = null; }
  if (sl.dodge) {
    var dg = sl.dodge; dg.t += dt;
    var k = Math.min(1, dg.t / 0.4), cur = Math.sin(k * Math.PI), step = (cur - dg.done) * 55; // slips out, then sways back
    dg.done = cur;
    self.x = Math.min(W - self.r, Math.max(self.r, self.x + dg.x * step));
    self.y = Math.min(H - self.r, Math.max(self.r, self.y + dg.y * step));
    if (dg.t > 0.4) sl.dodge = null;
  }
  var atk = slAttacking(other);
  var calling = sl.phase === "pull" || sl.phase === "talk" || (sl.phase === "target" && !sl.dash);
  if (!calling || !other.alive) { sl.prevAtk = atk; return; }
  var dx = other.x - self.x, dy = other.y - self.y, d = Math.sqrt(dx * dx + dy * dy) || 1, ux = dx / d, uy = dy / d;
  if (d < self.r + other.r + 4) { // they just walk into him: eased out of his space, no bounce
    var push = self.r + other.r + 4 - d;
    other.x = Math.min(W - other.r, Math.max(other.r, other.x + ux * push));
    other.y = Math.min(H - other.r, Math.max(other.r, other.y + uy * push));
  }
  if (atk && !sl.prevAtk && d < self.r + other.r + 70 && !sl.dodge && !sl.def) {
    if (slFreeGlove() && Math.random() < 0.6) {
      sl.def = { t: 0, x: ux, y: uy };
      other.punch = null; other.kick = null; other.swing = null; other.jabAnim = null; other.combo = null; other.flow = null;
      other.vx = ux * 380; other.vy = uy * 380;
      floater(self.x + ux * self.r, self.y - self.r - 30, "BLOCKED!", "dodge");
      playHotSauce("block");
      for (var i = 0; i < 10 && !reduceMotion; i++) {
        var a = Math.atan2(uy, ux) + slR(-0.9, 0.9), v = slR(160, 320);
        particles.push({ x: self.x + ux * self.r * 1.25, y: self.y + uy * self.r * 1.25, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 0.25, max: 0.25, size: slR(2, 4), color: "#ffffff" });
      }
    } else {
      // a slip out to the side, away from the cage if he's up against it
      var sd = Math.random() < 0.5 ? 1 : -1, px = -uy * sd, py = ux * sd;
      if (self.x + px * 70 < self.r || self.x + px * 70 > W - self.r || self.y + py * 70 < self.r || self.y + py * 70 > H - self.r) { px = -px; py = -py; }
      px -= ux * 0.4; py -= uy * 0.4;
      var pl = Math.sqrt(px * px + py * py) || 1;
      sl.dodge = { t: 0, done: 0, x: px / pl, y: py / pl };
      floater(self.x, self.y - self.r - 30, "DODGED!", "dodge");
      playHotSauce("dodge");
    }
  }
  sl.prevAtk = atk;
}

function runSendLocation(self, other, cfg, dt) {
  var m = self.igbb;
  m.t += dt; sl.t += dt;
  self.vx = 0; self.vy = 0; self.immuneCd = 1; // no IMMUNE popping up through all of it
  slDefend(self, other, dt);
  if (sl.phase === "pull") {
    if (sl.t >= SL.pull) { slNext("talk"); playSendLocation("voice"); }
  } else if (sl.phase === "talk") {
    if (sl.t >= SL.talk) { slNext("space"); sl.u = 0; playSendLocation("charge"); }
  } else if (sl.phase === "target") {
    // he knows where it's landing: if he's standing in the circle he dashes out first
    if (!sl.dashDone) slStartDash(self);
    if (sl.dash) slRunDash(self, dt);
    if (sl.t >= SL.target) { slClearCenter(self); slNext("beam"); slFire(self, other, cfg); }
  } else if (sl.phase === "beam") {
    slKeepOut(other);
    if (sl.t >= SL.beam) slNext("after");
  } else if (sl.phase === "after") {
    slKeepOut(other);
    if (sl.t >= SL.after) endSendLocation(self, other);
  }
}

// From main.js every frame (real time, not fight time): the space cut plays
// out while the fight is held, then drops back into the arena.
function advanceSendLocSpace(dt) {
  if (!sl || sl.phase !== "space") return;
  sl.u += dt;
  if (sl.u >= SL.space) { slNext("target"); playSendLocation("back"); playSendLocation("target"); }
}

var SL_SAFE = function (b) { return SL.R + b.r + 30; };
function slSafeSpot(b) {
  var cx = W / 2, cy = H / 2, dx = b.x - cx, dy = b.y - cy, d = Math.sqrt(dx * dx + dy * dy);
  if (d < 1) { dx = b.x < W / 2 ? -1 : 1; dy = 0.3; d = Math.sqrt(dx * dx + dy * dy); }
  var ux = dx / d, uy = dy / d, m = SL_SAFE(b);
  return { x: Math.max(b.r + 6, Math.min(W - b.r - 6, cx + ux * m)), y: Math.max(b.r + 6, Math.min(H - b.r - 6, cy + uy * m)) };
}
function slStartDash(self) {
  sl.dashDone = true;
  if (Math.hypot(self.x - W / 2, self.y - H / 2) >= SL_SAFE(self) - 2) return;
  var to = slSafeSpot(self);
  sl.dash = { fx: self.x, fy: self.y, tx: to.x, ty: to.y, t: 0, dur: 0.38 };
  floater(self.x, self.y - self.r - 40, "GET OUT THE CIRCLE!", "note");
  playHotSauce("dodge");
}
function slRunDash(self, dt) {
  var d = sl.dash; d.t += dt;
  var k = Math.min(1, d.t / d.dur), e = 1 - Math.pow(1 - k, 3);
  self.x = d.fx + (d.tx - d.fx) * e; self.y = d.fy + (d.ty - d.fy) * e;
  if (!reduceMotion && Math.random() < 0.6) particles.push({ x: self.x + slR(-10, 10), y: self.y + self.r * 0.8, vx: slR(-40, 40), vy: slR(-30, 10), life: 0.4, max: 0.4, size: slR(3, 6), color: "#d8cdb5" });
  if (k >= 1) sl.dash = null;
}
function slClearCenter(self) { // never let him be in the circle when it lands
  if (Math.hypot(self.x - W / 2, self.y - H / 2) < SL_SAFE(self) - 2) { var to = slSafeSpot(self); self.x = to.x; self.y = to.y; }
  sl.dash = null;
}

// While the laser is on, the beam is a solid wall: nobody gets through it.
// Once they've been hit they're held dazed outside it until the move is over.
function slKeepOut(o) {
  if (!o.alive) return;
  var cx = W / 2, cy = H / 2, dx = o.x - cx, dy = o.y - cy, d = Math.sqrt(dx * dx + dy * dy), m = SL.R + o.r + 6;
  if (d < 1) { dx = 1; dy = 0; d = 1; }
  var nx = dx / d, ny = dy / d;
  if (d < m) {
    o.x = cx + nx * m; o.y = cy + ny * m;
    var vn = o.vx * nx + o.vy * ny;
    if (vn < 0) { o.vx -= 1.6 * vn * nx; o.vy -= 1.6 * vn * ny; } // bounce off the beam
    if (!sl.wallFx || slClock - sl.wallFx > 0.25) { sl.wallFx = slClock; slFx.push({ kind: "wave", x: cx + nx * SL.R, y: cy + ny * SL.R, t: 0, dur: 0.3, R: 40 }); }
  }
  if (sl.hit && !o.slam) { // thrown clear and done bouncing: sit there dazed
    if (!sl.held) { sl.held = true; o.dazed = true; clearActions(o); floater(o.x, o.y - o.r - 30, "DAZED", "note"); }
    o.vx = 0; o.vy = 0;
  }
}

function slFire(self, other, cfg) {
  var cx = W / 2, cy = H / 2;
  slCrater = slMakeCrater(cx, cy);
  shake = Math.max(shake, 45); hitStop = Math.max(hitStop, 0.08);
  playSendLocation("impact");
  for (var i = 0; i < 3; i++) slFx.push({ kind: "wave", x: cx, y: cy, t: -i * 0.1, dur: 0.8, R: SL.R * 2.4 });
  for (var j = 0; j < 60; j++) { var a = Math.random() * 6.28, v = slR(200, 700); slFx.push({ kind: "spark", x: cx, y: cy, vx: Math.cos(a) * v, vy: Math.sin(a) * v, t: 0, dur: slR(0.4, 0.9), s: slR(3, 7) }); }
  for (var k = 0; k < 30 && !reduceMotion; k++) { var b = Math.random() * 6.28, w = slR(80, 260); particles.push({ x: cx, y: cy, vx: Math.cos(b) * w, vy: Math.sin(b) * w * 0.6, life: 0.8, max: 0.8, size: slR(4, 8), color: k % 3 ? "#d8cdb5" : "#ffffff" }); }
  var dx = other.x - cx, dy = other.y - cy, d = Math.sqrt(dx * dx + dy * dy);
  if (d < 1) { dx = 1; dy = 0; d = 1; }
  if (other.alive && d <= SL.R + other.r * 0.5) {
    var got = hurt(other, cfg.dmg, "igbb", self.id);
    if (got > 0) {
      floater(other.x, other.y - other.r - 34, sl.ds ? "DEATH STAR!" : "ORBITAL STRIKE!", "crit"); sl.hit = true;
      other.flash = 0.2;
      if (other.alive) beginWallSlam(other, dx / d, dy / d, { knockback: 1400, wallSlams: 2, slamDamage: 10 });
      checkEnd();
    }
  } else if (other.alive && d <= SL.R * 2.6) {
    // the blast wave catches them anyway: less damage, thrown into the cage
    var got2 = hurt(other, cfg.waveDmg, "igbb", self.id);
    if (got2 > 0) {
      floater(other.x, other.y - other.r - 30, "SHOCKWAVE!", "crit"); sl.hit = true;
      if (other.alive) beginWallSlam(other, dx / d, dy / d, { knockback: 900, wallSlams: 1, slamDamage: 4 });
      checkEnd();
    }
  } else if (other.alive) floater(other.x, other.y - other.r - 30, "JUST MISSED!", "dodge");
}

// From update.js every tick: sparks, rings and the crater cooling.
function tickSendLocation(dt) {
  slClock += dt;
  if (slFx.length) {
    slFx.forEach(function (f) { f.t += dt; if (f.kind === "spark") { f.x += f.vx * dt; f.y += f.vy * dt; f.vx *= 0.95; f.vy *= 0.95; } });
    slFx = slFx.filter(function (f) { return f.t < f.dur; });
  }
  if (slCrater) { slCrater.t += dt; if (slCrater.t > SL_CR_LIFE) slCrater = null; }
}

// ---------------------------------------------------------------- drawing
function slArm(d, sx, sy, hx, hy) {
  var size = d.char.punch.size || 13;
  strokeLimb(size * 0.75, armColor(d.char), function () { ctx.moveTo(sx, sy); ctx.lineTo(hx, hy); });
  drawGloveAt(hx, hy, size * 0.85, d.char, Math.atan2(hy - sy, hx - sx));
}
function slLeftGloveBlock(d, shL) { // the free glove snaps out at the attacker, then back
  if (!sl.def) return false;
  var k = Math.sin(Math.min(1, sl.def.t / 0.35) * Math.PI), r = d.r;
  var bx = d.x - r * 0.85 + (d.x + sl.def.x * r * 1.35 - (d.x - r * 0.85)) * k, by = d.y - r * 0.6 + (d.y + sl.def.y * r * 1.35 - (d.y - r * 0.6)) * k;
  slArm(d, shL[0], shL[1], bx, by); return true;
}
// From draw.js, at the very end: the whole screen while we're up in orbit.
function drawSendLocSpace() {
  if (sl && sl.phase === "space") slDrawSpace(sl.u);
}

// ---- the burn mark: drawn on the mat, UNDER the fighters (draw.js, after drawSitSpots) ----
function slMakeCrater(x, y) {
  var c = { x: x, y: y, t: 0, outer: [], inner: [], cracks: [], streaks: [], embers: [], chunks: [], smoke: [] }, i, n = 30;
  for (i = 0; i < n; i++) c.outer.push(slR(0.82, 1.12));
  for (i = 0; i < 22; i++) c.inner.push(slR(0.8, 1.15));
  for (i = 0; i < 9; i++) { // jagged glowing cracks running out of the hole
    var an = i / 9 * 6.28 + slR(-0.25, 0.25), pts = [[0.32, an]], cur = an;
    for (var j = 1; j <= 4; j++) { cur += slR(-0.28, 0.28); pts.push([0.32 + j * slR(0.15, 0.22), cur]); }
    c.cracks.push({ pts: pts, w: slR(2, 3.6) });
  }
  for (i = 0; i < 26; i++) c.streaks.push({ a: i / 26 * 6.28 + slR(-0.1, 0.1), len: slR(1.05, 1.55), w: slR(0.05, 0.11) });
  for (i = 0; i < 26; i++) { var ea = slR(0, 6.28), er = Math.sqrt(Math.random()) * 0.95; c.embers.push({ x: Math.cos(ea) * er, y: Math.sin(ea) * er * 0.92, s: slR(1.4, 3.2), ph: slR(0, 6.28), sp: slR(6, 14), life: slR(2.5, 6) }); }
  for (i = 0; i < 14; i++) { var ka = slR(0, 6.28), kr = slR(0.9, 1.45); c.chunks.push({ x: Math.cos(ka) * kr, y: Math.sin(ka) * kr * 0.92, s: slR(3, 7), rot: slR(0, 6.28) }); }
  for (i = 0; i < 6; i++) c.smoke.push({ x: slR(-0.35, 0.35), y: slR(-0.3, 0.3), ph: slR(0, 1), s: slR(0.35, 0.6) });
  return c;
}
function slBlob(cx, cy, rad, arr, sy) {
  ctx.beginPath();
  for (var i = 0; i <= arr.length; i++) {
    var k = i % arr.length, a = k / arr.length * 6.28, r = rad * arr[k];
    var x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r * sy;
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.closePath();
}
function slMix(c1, c2, k) { return [0, 1, 2].map(function (i) { return Math.round(c1[i] + (c2[i] - c1[i]) * k); }); }
function drawSendLocCrater() {
  var c = slCrater; if (!c) return;
  var t = c.t, Rr = SL.R, x = c.x, y = c.y, sy = 0.92;
  var fade = Math.min(1, (SL_CR_LIFE - t) / 2); // only fades out right at the end
  var heat = Math.max(0, 1 - t / 3.5);       // glow cools over ~3.5s
  ctx.save(); ctx.globalAlpha = fade;
  ctx.beginPath(); ctx.rect(0, 0, W, H); ctx.clip();
  // 1. soot scorch streaks blasted out over the mat
  c.streaks.forEach(function (st2) {
    var l = Rr * st2.len, a0 = st2.a - st2.w, a1 = st2.a + st2.w;
    var g = ctx.createRadialGradient(x, y, Rr * 0.4, x, y, l);
    g.addColorStop(0, "rgba(28,20,16,0.55)"); g.addColorStop(1, "rgba(28,20,16,0)");
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x + Math.cos(a0) * Rr * 0.5, y + Math.sin(a0) * Rr * 0.5 * sy);
    ctx.lineTo(x + Math.cos(st2.a) * l, y + Math.sin(st2.a) * l * sy); ctx.lineTo(x + Math.cos(a1) * Rr * 0.5, y + Math.sin(a1) * Rr * 0.5 * sy); ctx.fill();
  });
  // 2. big soft soot burn, ragged edge
  slBlob(x, y, Rr * 1.0, c.outer, sy);
  var g1 = ctx.createRadialGradient(x, y, 0, x, y, Rr * 1.1);
  g1.addColorStop(0, "rgba(20,14,11,0.95)"); g1.addColorStop(0.55, "rgba(40,28,20,0.8)"); g1.addColorStop(0.85, "rgba(70,48,32,0.45)"); g1.addColorStop(1, "rgba(90,60,40,0)");
  ctx.fillStyle = g1; ctx.fill();
  // brown singed rim
  ctx.lineWidth = 6; ctx.strokeStyle = "rgba(120,72,36,0.35)"; ctx.stroke();
  // 3. the hole: dark charred bowl with a raised lip
  slBlob(x, y, Rr * 0.45, c.inner, sy);
  var g2 = ctx.createRadialGradient(x - Rr * 0.08, y - Rr * 0.1, 0, x, y, Rr * 0.5);
  g2.addColorStop(0, "#0c0907"); g2.addColorStop(0.7, "#1d1510"); g2.addColorStop(1, "#3a2a1e");
  ctx.fillStyle = g2; ctx.fill();
  ctx.lineWidth = 4; ctx.strokeStyle = "rgba(160,120,90,0.55)"; ctx.stroke(); // lit lip
  // 4. molten glow in the bottom of the hole + glowing cracks, cooling over time
  var hot = slMix([255, 214, 120], [255, 80, 20], Math.min(1, t / 1.6));
  var glowA = 0.15 + 0.85 * heat;
  var g3 = ctx.createRadialGradient(x, y, 0, x, y, Rr * 0.42);
  g3.addColorStop(0, "rgba(" + hot + "," + (0.95 * glowA) + ")"); g3.addColorStop(0.5, "rgba(255,90,20," + (0.6 * glowA) + ")"); g3.addColorStop(1, "rgba(120,20,0,0)");
  ctx.fillStyle = g3; ctx.beginPath(); ctx.ellipse(x, y, Rr * 0.42, Rr * 0.42 * sy, 0, 0, 6.28); ctx.fill();
  ctx.lineCap = "round"; ctx.lineJoin = "round";
  c.cracks.forEach(function (cr) {
    ctx.beginPath();
    cr.pts.forEach(function (p, i) { var px = x + Math.cos(p[1]) * Rr * p[0], py = y + Math.sin(p[1]) * Rr * p[0] * sy; if (i) ctx.lineTo(px, py); else ctx.moveTo(px, py); });
    ctx.strokeStyle = "rgba(30,20,14," + (0.35 + 0.4 * heat) + ")"; ctx.lineWidth = cr.w * 0.7 + 1.5 * heat; ctx.stroke(); // charred groove
    if (glowA > 0.16) {
      ctx.strokeStyle = "rgba(255,90,20," + (0.45 * glowA) + ")"; ctx.lineWidth = cr.w + 4; ctx.stroke();
      ctx.strokeStyle = "rgba(" + hot + "," + glowA + ")"; ctx.lineWidth = cr.w * 0.6; ctx.stroke();
    }
  });
  // 5. blown-out chunks of mat
  c.chunks.forEach(function (k) {
    ctx.save(); ctx.translate(x + k.x * Rr, y + k.y * Rr); ctx.rotate(k.rot);
    ctx.fillStyle = "#2a1f18"; ctx.fillRect(-k.s / 2, -k.s / 2, k.s, k.s * 0.7);
    ctx.fillStyle = "rgba(220,200,170,0.5)"; ctx.fillRect(-k.s / 2, -k.s / 2, k.s, 1.5);
    ctx.restore();
  });
  // 6. flickering embers that die out one by one
  c.embers.forEach(function (e) {
    var life = Math.max(0, 1 - t / e.life); if (life <= 0) return;
    var fl = 0.55 + 0.45 * Math.sin(t * e.sp + e.ph);
    ctx.fillStyle = "rgba(255," + Math.round(120 + 100 * fl) + ",40," + (life * fl) + ")";
    ctx.beginPath(); ctx.arc(x + e.x * Rr, y + e.y * Rr, e.s, 0, 6.28); ctx.fill();
  });
  // 7. thin smoke curling up out of it (still under the fighters)
  c.smoke.forEach(function (m) {
    for (var q = 0; q < 3; q++) {
      var u = ((t * 0.35 + m.ph + q / 3) % 1), sa = (1 - u) * u * 4 * 0.22 * Math.max(0.25, 1 - t / SL_CR_LIFE);
      var sx = x + m.x * Rr + Math.sin(u * 5 + m.ph * 6) * 10, syy = y + m.y * Rr - u * Rr * 0.9, sr = Rr * m.s * (0.4 + u * 0.8);
      var g4 = ctx.createRadialGradient(sx, syy, 0, sx, syy, sr);
      g4.addColorStop(0, "rgba(90,85,80," + sa + ")"); g4.addColorStop(1, "rgba(90,85,80,0)");
      ctx.fillStyle = g4; ctx.beginPath(); ctx.arc(sx, syy, sr, 0, 6.28); ctx.fill();
    }
  });
  ctx.restore();
}

// A rugged military sat-phone: rubber bumpers, telescoping antenna, a little
// green screen that shows the GPS lock, keypad and a blinking red LED.
function slPhone(x, y, ang, sc, ant, scr, tt) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.scale(sc, sc);
  ctx.lineJoin = "round";
  // antenna (telescopes out of the top)
  var ah = 6 + 22 * ant;
  ctx.fillStyle = "#222418"; ctx.strokeStyle = "#0e0f09"; ctx.lineWidth = 1.5;
  ctx.fillRect(3, -17 - ah, 5, ah); ctx.strokeRect(3, -17 - ah, 5, ah);
  if (ant > 0.4) { ctx.fillStyle = "#3a3d2a"; ctx.fillRect(4, -17 - ah, 3, ah * 0.5); }
  ctx.fillStyle = "#16170f"; ctx.beginPath(); ctx.arc(5.5, -18 - ah, 3.2, 0, 6.28); ctx.fill();
  if (scr.led) { ctx.fillStyle = "#ff3b2f"; ctx.beginPath(); ctx.arc(5.5, -18 - ah, 2, 0, 6.28); ctx.fill(); ctx.fillStyle = "rgba(255,60,40,0.35)"; ctx.beginPath(); ctx.arc(5.5, -18 - ah, 6, 0, 6.28); ctx.fill(); }
  // body with rubber corner bumpers
  ctx.lineWidth = 2; ctx.strokeStyle = "#11130b";
  ctx.fillStyle = "#4b5320"; ctx.beginPath(); ctx.roundRect(-10, -17, 20, 36, 5); ctx.fill(); ctx.stroke();
  ctx.fillStyle = "#2a2e16"; [[-10, -17], [6, -17], [-10, 15], [6, 15]].forEach(function (c) { ctx.beginPath(); ctx.roundRect(c[0], c[1], 4, 4, 1.5); ctx.fill(); });
  ctx.fillStyle = "rgba(255,255,255,0.12)"; ctx.fillRect(-8, -15, 3, 30); // edge shine
  // screen
  ctx.fillStyle = "#0b1a0b"; ctx.beginPath(); ctx.roundRect(-7.5, -13.5, 15, 13, 2); ctx.fill();
  if (scr.on) {
    ctx.save(); ctx.beginPath(); ctx.roundRect(-7, -13, 14, 12, 2); ctx.clip();
    ctx.fillStyle = scr.flash ? "#d9ffcc" : "#1f4d1a"; ctx.fillRect(-7, -13, 14, 12);
    ctx.strokeStyle = "rgba(157,255,122,0.5)"; ctx.lineWidth = 0.5;
    for (var g = -6; g < 7; g += 3) { ctx.beginPath(); ctx.moveTo(g, -13); ctx.lineTo(g, -1); ctx.stroke(); ctx.beginPath(); ctx.moveTo(-7, g - 7); ctx.lineTo(7, g - 7); ctx.stroke(); }
    if (scr.sweep != null) { ctx.strokeStyle = "#9dff7a"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(0, -7); ctx.lineTo(Math.cos(scr.sweep) * 9, -7 + Math.sin(scr.sweep) * 9); ctx.stroke(); }
    if (scr.pin) { ctx.fillStyle = "#ff3b2f"; ctx.beginPath(); ctx.arc(0, -8.5, 2.2, 0, 6.28); ctx.fill(); ctx.beginPath(); ctx.moveTo(-1.6, -7.6); ctx.lineTo(1.6, -7.6); ctx.lineTo(0, -4.5); ctx.fill(); }
    if (scr.sent) { ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 1.8; ctx.beginPath(); ctx.moveTo(-3.5, -7); ctx.lineTo(-1, -4.5); ctx.lineTo(4, -10); ctx.stroke(); }
    ctx.restore();
  }
  // keypad + the big red SEND key
  ctx.fillStyle = "#1a1c12"; for (var i = 0; i < 3; i++) for (var j = 0; j < 3; j++) ctx.fillRect(-6.5 + i * 4.8, 2 + j * 4, 3.4, 2.6);
  ctx.fillStyle = scr.press ? "#ff8a80" : "#c62820"; ctx.beginPath(); ctx.roundRect(-4, 14 - (scr.press ? 0 : 0.6), 8, 3, 1); ctx.fill();
  ctx.restore();
}
// The back of the phone, as you'd see it pressed to his ear: ribbed battery
// cover, belt clip, antenna up, red LED blinking on top.
function slPhoneBack(x, y, ang, sc, live, tt) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.scale(sc, sc);
  ctx.lineJoin = "round"; ctx.lineWidth = 2; ctx.strokeStyle = "#11130b";
  ctx.fillStyle = "#222418"; ctx.fillRect(3, -45, 5, 28); ctx.strokeRect(3, -45, 5, 28);
  ctx.fillStyle = "#16170f"; ctx.beginPath(); ctx.arc(5.5, -46, 3.2, 0, 6.28); ctx.fill();
  if (live && Math.floor(tt * 4) % 2 === 0) { ctx.fillStyle = "#ff3b2f"; ctx.beginPath(); ctx.arc(5.5, -46, 2, 0, 6.28); ctx.fill(); }
  ctx.fillStyle = "#4b5320"; ctx.beginPath(); ctx.roundRect(-10, -17, 20, 36, 5); ctx.fill(); ctx.stroke();
  ctx.fillStyle = "#3d441a"; ctx.beginPath(); ctx.roundRect(-7, -12, 14, 24, 3); ctx.fill();
  ctx.strokeStyle = "rgba(0,0,0,0.35)"; ctx.lineWidth = 1.2;
  for (var i = -8; i <= 8; i += 4) { ctx.beginPath(); ctx.moveTo(-5, i); ctx.lineTo(5, i); ctx.stroke(); }
  ctx.fillStyle = "rgba(255,255,255,0.13)"; ctx.fillRect(-8, -15, 2.5, 30);
  ctx.restore();
}

// Clean speech bubble, sized to what he's said so far.
function slBubble(x, y, text, alpha, ok) {
  ctx.save(); ctx.globalAlpha = alpha;
  ctx.font = "800 21px \"Barlow Condensed\", \"Arial Narrow\", sans-serif";
  var tw = ctx.measureText(text).width, w = tw + 24, h = 34;
  var bx = Math.max(4, Math.min(W - w - 4, x - w * 0.7)), by = y - h;
  ctx.fillStyle = ok ? "#eaffdf" : "#ffffff"; ctx.strokeStyle = "#151515"; ctx.lineWidth = 2.5;
  var tx = Math.max(bx + 16, Math.min(bx + w - 16, x));
  ctx.beginPath();
  ctx.moveTo(bx + 10, by); ctx.lineTo(bx + w - 10, by); ctx.quadraticCurveTo(bx + w, by, bx + w, by + 10);
  ctx.lineTo(bx + w, by + h - 10); ctx.quadraticCurveTo(bx + w, by + h, bx + w - 10, by + h);
  ctx.lineTo(tx + 7, by + h); ctx.lineTo(tx + 10, by + h + 12); ctx.lineTo(tx - 6, by + h);
  ctx.lineTo(bx + 10, by + h); ctx.quadraticCurveTo(bx, by + h, bx, by + h - 10);
  ctx.lineTo(bx, by + 10); ctx.quadraticCurveTo(bx, by, bx + 10, by); ctx.closePath();
  ctx.fill(); ctx.stroke();
  ctx.fillStyle = ok ? "#1f7a1a" : "#151515"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillText(text, bx + w / 2, by + h / 2 + 1);
  ctx.restore();
}

// From draw.js, over the arena: the phone call, the target circle, the beam.
function drawSendLocation(scl, ox, oy) {
  ctx.save(); ctx.setTransform(scl, 0, 0, scl, ox, oy);
  if (sl && sl.phase !== "over") {
    var d = balls[sl.id], r = d.r, t = sl.t;
    var shR = [d.x + r * 0.62, d.y - r * 0.3], shL = [d.x - r * 0.62, d.y - r * 0.3];
    if (sl.ds && sl.phase !== "after") {
      slDrawSithCall(d, shR, shL, t);
    } else if (sl.phase === "pull" || sl.phase === "talk") {
      var P = SL.pull, talk = sl.phase === "talk", tp = talk ? P + t : t;
      var sm = function (k) { k = Math.max(0, Math.min(1, k)); return k * k * (3 - 2 * k); };
      var lerp = function (p0, p1, k) { return [p0[0] + (p1[0] - p0[0]) * k, p0[1] + (p1[1] - p0[1]) * k]; };
      // key poses for his right arm: [hand, elbow, phone angle]
      var GUARD = { h: [d.x + r * 0.85, d.y - r * 0.6], e: [d.x + r * 1.15, d.y - r * 0.05], a: 0 };
      var HIP   = { h: [d.x + r * 1.0,  d.y + r * 0.55], e: [d.x + r * 1.25, d.y + r * 0.05], a: 0.5 };
      var EAR   = { h: [d.x + r * 0.98, d.y - r * 0.22], e: [d.x + r * 1.5,  d.y + r * 0.35], a: -0.12 };
      var LOOK  = { h: [d.x + r * 0.55, d.y + r * 0.25], e: [d.x + r * 1.25, d.y + r * 0.55], a: -0.35 };
      var from, to, k;
      var downT = P * 0.35, lookAt = SL.talk - 0.75;
      if (!talk && tp < downT) { from = GUARD; to = HIP; k = sm(tp / downT); }
      else if (!talk) { from = HIP; to = EAR; k = sm((tp - downT) / (P - downT)); }
      else if (t < lookAt) { from = EAR; to = EAR; k = 0; }
      else { from = EAR; to = LOOK; k = sm((t - lookAt) / 0.3); }
      var hand = lerp(from.h, to.h, k), elbow = lerp(from.e, to.e, k), pa = from.a + (to.a - from.a) * k;
      // while he talks the phone stays pressed to his head, rocking a touch with the words
      if (talk && t < lookAt) { var w = Math.sin(t * 7.5) * Math.min(1, t / 0.3); pa += w * 0.05; hand[1] += w * 0.8; }
      var atEar = talk ? t < lookAt + 0.12 : tp > P * 0.85;
      var showPhone = talk || tp > downT * 0.8;
      var sent = talk && t > lookAt + 0.3;
      var size = d.char.punch.size || 13;
      // phone sits in the glove: drawn first, glove wraps over its lower half
      if (showPhone) {
        var px = hand[0] + Math.sin(pa) * 14, py = hand[1] - Math.cos(pa) * 14;
        if (atEar) slPhoneBack(px, py, pa, 1.2, talk, t);
        else slPhone(px, py, pa, 1.2, talk ? 1 : 0.2, { on: talk, flash: sent && t < lookAt + 0.42, sweep: null, pin: !sent, sent: sent, press: sent && t < lookAt + 0.45, led: Math.floor(t * 4) % 2 === 0 }, t);
      }
      strokeLimb(size * 0.75, armColor(d.char), function () { ctx.moveTo(shR[0], shR[1]); ctx.quadraticCurveTo(elbow[0], elbow[1], hand[0], hand[1]); });
      drawGloveAt(hand[0], hand[1], size * 0.85, d.char, Math.atan2(hand[1] - elbow[1], hand[0] - elbow[0]));
      // left glove stays up in his guard
      if (!slLeftGloveBlock(d, shL)) slArm(d, shL[0], shL[1], d.x - r * 0.85, d.y - r * 0.6);
      // speech bubble on the other side from the phone, word by word
      if (talk) {
        var words = ["SEND", "SEND ME", "SEND ME LOCATION"], wi = t < 0.55 ? 0 : t < 1.0 ? 1 : 2;
        slBubble(d.x - r * 0.35, d.y - r - 34, sent ? "LOCATION SENT ✓" : words[wi], Math.min(1, t / 0.12), sent);
        if (sent && !sl.up) { sl.up = 1; playSendLocation("send"); }
      }
      if (talk && t >= 1.9 && !sl.lk) { sl.lk = 1; playSendLocation("lock"); }
    } else if (sl.phase === "target" || sl.phase === "beam") {
      // pointing up at the sky
      slArm(d, shR[0], shR[1], d.x + r * 0.75, d.y - r * 1.25);
      if (!slLeftGloveBlock(d, shL)) slArm(d, shL[0], shL[1], d.x - r * 0.85, d.y - r * 0.6);
    }
    // the red target circle in the middle of the ring + thin aiming laser
    if (sl.phase === "target") {
      var k3 = Math.min(1, t / SL.target), pulse = 0.5 + 0.5 * Math.sin(slClock * 20), cx = W / 2, cy = H / 2;
      ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, H); ctx.clip();
      ctx.fillStyle = "rgba(224,34,27," + (0.15 + 0.12 * pulse) + ")"; ctx.beginPath(); ctx.arc(cx, cy, SL.R, 0, 6.28); ctx.fill();
      ctx.fillStyle = "rgba(224,34,27,0.3)"; ctx.beginPath(); ctx.arc(cx, cy, SL.R * k3, 0, 6.28); ctx.fill();
      ctx.strokeStyle = "#e0221b"; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(cx, cy, SL.R, 0, 6.28); ctx.stroke();
      ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(cx - 24, cy); ctx.lineTo(cx + 24, cy); ctx.moveTo(cx, cy - 24); ctx.lineTo(cx, cy + 24); ctx.stroke();
      ctx.restore();
    }
  }
  slFx.forEach(function (f) {
    if (f.kind === "wave" && f.t >= 0) { var k = f.t / f.dur, e2 = 1 - Math.pow(1 - k, 3); ctx.save(); ctx.globalAlpha = 1 - k; ctx.strokeStyle = "#fff4c2"; ctx.lineWidth = 16 * (1 - k) + 2; ctx.beginPath(); ctx.ellipse(f.x, f.y, 10 + f.R * e2, (10 + f.R * e2) * 0.8, 0, 0, 6.28); ctx.stroke(); ctx.restore(); }
    if (f.kind === "spark") { ctx.save(); ctx.globalAlpha = 1 - f.t / f.dur; ctx.fillStyle = f.t / f.dur < 0.4 ? "#fffbe0" : "#ffb02e"; ctx.beginPath(); ctx.arc(f.x, f.y, f.s, 0, 6.28); ctx.fill(); ctx.restore(); }
  });
  ctx.restore();
  // beams coming down from the top of the screen
  if (sl && (sl.phase === "target" || sl.phase === "beam")) {
    var cxp = ox + scl * W / 2, cyp = oy + scl * H / 2;
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
    if (sl.phase === "target") { // thin aiming laser
      ctx.globalAlpha = 0.5 + 0.5 * Math.sin(slClock * 30); ctx.strokeStyle = sl.ds ? "#3dff6a" : "#ff3b2f"; ctx.lineWidth = 3 * scl;
      ctx.beginPath(); ctx.moveTo(cxp, 0); ctx.lineTo(cxp, cyp); ctx.stroke();
    } else {
      var bk = sl.t / SL.beam, wid = scl * SL.R * 0.9 * (bk < 0.1 ? bk / 0.1 : (bk > 0.75 ? Math.max(0, (1 - bk) / 0.25) : 1)) * (1 + 0.06 * Math.sin(slClock * 60));
      var PL = slPal();
      [[1.6, PL.gOuter], [1.0, PL.gMid], [0.45, PL.core]].forEach(function (L) {
        var g = ctx.createLinearGradient(cxp - wid * L[0], 0, cxp + wid * L[0], 0);
        g.addColorStop(0, PL.edge); g.addColorStop(0.5, L[1]); g.addColorStop(1, PL.edge);
        ctx.fillStyle = g; ctx.fillRect(cxp - wid * L[0], 0, wid * L[0] * 2, cyp);
      });
      var gl2 = ctx.createRadialGradient(cxp, cyp, 0, cxp, cyp, wid * 2.2);
      gl2.addColorStop(0, PL.core); gl2.addColorStop(0.5, PL.glowMid); gl2.addColorStop(1, PL.glowEdge);
      ctx.fillStyle = gl2; ctx.beginPath(); ctx.ellipse(cxp, cyp, wid * 2.2, wid * 1.6, 0, 0, 6.28); ctx.fill();
      if (sl.t < 0.15) { ctx.globalAlpha = 0.8 * (1 - sl.t / 0.15); ctx.fillStyle = PL.flash; ctx.fillRect(0, 0, canvas.width, canvas.height); }
    }
    ctx.restore();
  }
}

// ------------- the space cut: drawn over the whole screen while the fight holds
function slEase3(x) { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); }
function slShadeRect(x, y, w, h, c1, c2, r) { // a module with a little cylinder shading
  var g = ctx.createLinearGradient(x, y, x, y + h);
  g.addColorStop(0, c2); g.addColorStop(0.35, c1); g.addColorStop(0.65, c1); g.addColorStop(1, "#5d626e");
  ctx.fillStyle = g; ctx.beginPath(); ctx.roundRect(x, y, w, h, r || 10); ctx.fill();
  ctx.strokeStyle = "#3b3f49"; ctx.lineWidth = 2.5; ctx.stroke();
  ctx.strokeStyle = "rgba(60,64,74,0.45)"; ctx.lineWidth = 1.5; // panel seams
  for (var i = 1; i < 4; i++) { ctx.beginPath(); ctx.moveTo(x + w * i / 4, y + 3); ctx.lineTo(x + w * i / 4, y + h - 3); ctx.stroke(); }
}
function slPanelWing(x, y, w, h, flip) {
  ctx.save(); ctx.translate(x, y);
  var g = ctx.createLinearGradient(0, 0, w, h);
  g.addColorStop(0, "#1b2f6e"); g.addColorStop(0.5, "#2c4fae"); g.addColorStop(1, "#16285c");
  ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = "rgba(190,210,255,0.35)"; ctx.lineWidth = 1;
  for (var i = 1; i < 10; i++) { ctx.beginPath(); ctx.moveTo(w * i / 10, 0); ctx.lineTo(w * i / 10, h); ctx.stroke(); }
  for (var j = 1; j < 4; j++) { ctx.beginPath(); ctx.moveTo(0, h * j / 4); ctx.lineTo(w, h * j / 4); ctx.stroke(); }
  ctx.strokeStyle = "#c9d3e6"; ctx.lineWidth = 3; ctx.strokeRect(0, 0, w, h);
  ctx.fillStyle = "rgba(255,255,255,0.12)"; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(w * 0.35, 0); ctx.lineTo(0, h); ctx.closePath(); ctx.fill(); // sun glint
  ctx.restore();
}
// The station, drawn at the origin, about 900 units wide. charge 0..1, recoil px.
function slDrawStation(u, charge, deploy) {
  // main truss
  ctx.fillStyle = "#9aa0ab"; ctx.fillRect(-470, -9, 940, 18);
  ctx.strokeStyle = "#5d626e"; ctx.lineWidth = 2;
  for (var x = -460; x < 460; x += 22) { ctx.beginPath(); ctx.moveTo(x, -9); ctx.lineTo(x + 11, 9); ctx.lineTo(x + 22, -9); ctx.stroke(); }
  ctx.strokeRect(-470, -9, 940, 18);
  // four solar wings
  [[-460, -150], [-460, 18], [230, -150], [230, 18]].forEach(function (p) { slPanelWing(p[0], p[1], 230, 132); });
  // radiators (white, angled)
  ctx.fillStyle = "#eef0f4"; ctx.strokeStyle = "#8d929c"; ctx.lineWidth = 2;
  [[-200, -120], [140, -120]].forEach(function (p) { ctx.beginPath(); ctx.moveTo(p[0], -9); ctx.lineTo(p[0] + 20, p[1]); ctx.lineTo(p[0] + 80, p[1]); ctx.lineTo(p[0] + 60, -9); ctx.closePath(); ctx.fill(); ctx.stroke(); });
  // pressurised modules
  slShadeRect(-130, -48, 260, 96, "#dfe2e8", "#ffffff", 30);
  slShadeRect(-38, -170, 76, 125, "#d6d9df", "#fbfbfc", 18);
  slShadeRect(-210, -34, 85, 68, "#d2d6dd", "#f4f5f7", 16);
  slShadeRect(125, -34, 85, 68, "#d2d6dd", "#f4f5f7", 16);
  // a docked capsule on top
  ctx.fillStyle = "#7c8a5a"; ctx.strokeStyle = "#3c4430"; ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.ellipse(0, -205, 30, 38, 0, 0, 6.28); ctx.fill(); ctx.stroke();
  ctx.fillStyle = "#1f3f8f"; ctx.fillRect(-70, -212, 36, 14); ctx.fillRect(34, -212, 36, 14);
  // Russian flag + name on the core module
  ctx.fillStyle = "#ffffff"; ctx.fillRect(-112, -30, 60, 13); ctx.fillStyle = "#0039a6"; ctx.fillRect(-112, -17, 60, 13); ctx.fillStyle = "#d52b1e"; ctx.fillRect(-112, -4, 60, 13);
  ctx.strokeStyle = "#3b3f49"; ctx.lineWidth = 1.5; ctx.strokeRect(-112, -30, 60, 39);
  ctx.fillStyle = "#2a2e37"; ctx.font = "900 26px Arial"; ctx.textAlign = "left"; ctx.textBaseline = "middle"; ctx.fillText("ОРБИТА-1", -40, -12);
  // portholes, lit
  for (var w = 0; w < 4; w++) { ctx.fillStyle = "#1c2a40"; ctx.beginPath(); ctx.arc(-30 + w * 34, 24, 8, 0, 6.28); ctx.fill(); ctx.fillStyle = "#ffd77a"; ctx.beginPath(); ctx.arc(-30 + w * 34, 24, 5, 0, 6.28); ctx.fill(); }
  // blinking nav lights
  var bl = (Math.sin(u * 8) > 0.3);
  ctx.fillStyle = bl ? "#ff3b2f" : "#5a1612"; ctx.beginPath(); ctx.arc(-470, 0, 6, 0, 6.28); ctx.fill();
  ctx.fillStyle = bl ? "#3bff6a" : "#14501f"; ctx.beginPath(); ctx.arc(470, 0, 6, 0, 6.28); ctx.fill();
  // the orbital cannon: drops out of the belly and its barrel slides out
  var dep = slEase3(deploy);
  ctx.save(); ctx.translate(0, 48);
  ctx.fillStyle = "#4a4f5c"; ctx.strokeStyle = "#1f2229"; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.roundRect(-70, 0, 140, 50 * dep + 10, 12); ctx.fill(); ctx.stroke(); // turret
  var bl2 = 60 + 230 * dep; // barrel length
  var bg = ctx.createLinearGradient(-30, 0, 30, 0); bg.addColorStop(0, "#3a3e48"); bg.addColorStop(0.5, "#8d93a1"); bg.addColorStop(1, "#2c2f37");
  ctx.fillStyle = bg; ctx.fillRect(-30, 40 * dep, 60, bl2); ctx.strokeRect(-30, 40 * dep, 60, bl2);
  // accelerator rings along the barrel, lighting up one by one with the charge
  for (var r = 0; r < 6; r++) {
    var ry = 40 * dep + 30 + r * (bl2 - 50) / 5, lit = charge * 6 - r;
    ctx.fillStyle = "#2a2d35"; ctx.beginPath(); ctx.roundRect(-46, ry - 9, 92, 18, 6); ctx.fill();
    if (lit > 0) {
      var a = Math.min(1, lit);
      ctx.fillStyle = "rgba(255,190,90," + a + ")"; ctx.beginPath(); ctx.roundRect(-42, ry - 5, 84, 10, 4); ctx.fill();
      ctx.save(); ctx.globalAlpha = 0.5 * a; ctx.shadowColor = "#ffb347"; ctx.shadowBlur = 30; ctx.fillRect(-42, ry - 5, 84, 10); ctx.restore();
    }
  }
  // muzzle
  ctx.fillStyle = "#1f2229"; ctx.beginPath(); ctx.moveTo(-40, 40 * dep + bl2); ctx.lineTo(40, 40 * dep + bl2); ctx.lineTo(30, 40 * dep + bl2 + 26); ctx.lineTo(-30, 40 * dep + bl2 + 26); ctx.closePath(); ctx.fill();
  ctx.restore();
  return 48 + 40 * dep + bl2 + 26; // muzzle y
}
function slBeam(x0, y0, x1, y1, w, t) { // a beam with a spiralling energy wrap
  var PL = slPal();
  [[1.8, PL.outer], [1.0, PL.mid], [0.42, PL.core]].forEach(function (L) {
    var g = ctx.createLinearGradient(x0 - w * L[0], 0, x0 + w * L[0], 0);
    g.addColorStop(0, PL.edge); g.addColorStop(0.5, L[1]); g.addColorStop(1, PL.edge);
    ctx.fillStyle = g; ctx.fillRect(x0 - w * L[0], y0, w * L[0] * 2, y1 - y0);
  });
  ctx.strokeStyle = PL.wrap; ctx.lineWidth = Math.max(2, w * 0.08);
  for (var s = 0; s < 2; s++) {
    ctx.beginPath();
    for (var y = y0; y <= y1; y += 8) { var ph = (y - y0) / (w * 2.2) - t * 18 + s * Math.PI; var xx = x0 + Math.sin(ph) * w * 0.9; if (y === y0) ctx.moveTo(xx, y); else ctx.lineTo(xx, y); }
    ctx.stroke();
  }
}
function slDrawSpace(u) { // u = seconds into the space cut
  var cw = canvas.width, chh = canvas.height, k = cw / 1080;
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  if (u < SL_ATMO_AT) {
    ctx.fillStyle = "#02030a"; ctx.fillRect(0, 0, cw, chh);
    // camera: wide, then pushing in on the muzzle while it charges, a kick when it fires
    var push = slEase3((u - 0.9) / (SL_FIRE_AT - 0.9)), zoom = 1 + 0.55 * push - (u > SL_FIRE_AT ? 0.35 * slEase3((u - SL_FIRE_AT) / 0.5) : 0);
    var shakeAmt = (u > 1.2 && u < SL_FIRE_AT ? 3 + 9 * push : 0) + (u > SL_FIRE_AT && u < SL_FIRE_AT + 0.4 ? 26 * (1 - (u - SL_FIRE_AT) / 0.4) : 0);
    var jx = Math.sin(u * 91) * shakeAmt * k, jy = Math.cos(u * 77) * shakeAmt * k;
    // stars and a nebula, a little parallax
    var neb = ctx.createRadialGradient(cw * 0.25, chh * 0.2, 0, cw * 0.25, chh * 0.2, cw * 0.8);
    neb.addColorStop(0, "rgba(120,60,160,0.35)"); neb.addColorStop(1, "rgba(120,60,160,0)");
    ctx.fillStyle = neb; ctx.fillRect(0, 0, cw, chh);
    slStars.forEach(function (s) { ctx.globalAlpha = 0.45 + 0.55 * Math.sin(u * 3 + s[3]); ctx.fillStyle = "#fff"; ctx.fillRect((s[0] * cw - cw / 2) * (1 + push * 0.15) + cw / 2 + jx * 0.3, (s[1] * chh - chh / 2) * (1 + push * 0.15) + chh / 2 + jy * 0.3, s[2] * k, s[2] * k); });
    ctx.globalAlpha = 1;
    // the Earth below
    ctx.save(); ctx.translate(cw / 2 + jx * 0.5, chh * 1.62 + jy * 0.5); var sc = 1 + push * 0.12; ctx.scale(sc, sc);
    var er = chh * 0.98;
    var atm = ctx.createRadialGradient(0, 0, er * 0.97, 0, 0, er * 1.09); atm.addColorStop(0, "rgba(110,190,255,0.95)"); atm.addColorStop(1, "rgba(110,190,255,0)");
    ctx.fillStyle = atm; ctx.beginPath(); ctx.arc(0, 0, er * 1.09, 0, 6.28); ctx.fill();
    var eg = ctx.createLinearGradient(0, -er, 0, -er * 0.55); eg.addColorStop(0, "#3a86d8"); eg.addColorStop(1, "#0f2a52");
    ctx.fillStyle = eg; ctx.beginPath(); ctx.arc(0, 0, er, 0, 6.28); ctx.fill();
    ctx.save(); ctx.beginPath(); ctx.arc(0, 0, er, 0, 6.28); ctx.clip();
    ctx.rotate(u * 0.02);
    ctx.fillStyle = "rgba(78,140,70,0.9)";
    for (var i = 0; i < 9; i++) { var an = -Math.PI / 2 + (i - 4) * 0.13; ctx.beginPath(); ctx.ellipse(Math.cos(an) * er * 0.97, Math.sin(an) * er * 0.97, 120 * k, 40 * k, an + Math.PI / 2, 0, 6.28); ctx.fill(); }
    ctx.fillStyle = "rgba(255,255,255,0.6)";
    for (var c = 0; c < 14; c++) { var an2 = -Math.PI / 2 + (c - 7) * 0.075; ctx.beginPath(); ctx.ellipse(Math.cos(an2) * er * 0.985, Math.sin(an2) * er * 0.985, 70 * k, 12 * k, an2 + Math.PI / 2, 0, 6.28); ctx.fill(); }
    ctx.restore();
    // night side shadow
    var ns = ctx.createLinearGradient(-er, 0, er, 0); ns.addColorStop(0, "rgba(0,0,10,0.65)"); ns.addColorStop(0.45, "rgba(0,0,10,0)");
    ctx.fillStyle = ns; ctx.beginPath(); ctx.arc(0, 0, er, 0, 6.28); ctx.fill();
    ctx.restore();
    if (sl.ds) slDrawDeathStar(u, cw, chh, k, jx, jy, push, zoom);
    else {
    // the station (it swings round into place, then the cannon deploys)
    var swing = 1 - slEase3(u / 0.9), recoil = u > SL_FIRE_AT ? Math.sin(Math.min(1, (u - SL_FIRE_AT) / 0.35) * Math.PI) * 40 : 0;
    var stx = cw / 2 + jx, sty = chh * 0.3 + jy - recoil * k;
    ctx.save();
    var fy = chh * 0.3 + 230 * k; ctx.translate(cw / 2, fy); ctx.scale(zoom, zoom); ctx.translate(-cw / 2, -fy); // pushes in on the barrel
    ctx.translate(stx, sty); ctx.rotate(swing * 0.5); ctx.scale(k * 1.05, k * 1.05);
    var charge = Math.max(0, Math.min(1, (u - 1.0) / (SL_FIRE_AT - 1.0)));
    var my = slDrawStation(u, u < SL_FIRE_AT ? charge : Math.max(0, 1 - (u - SL_FIRE_AT) / 0.5), Math.min(1, u / 1.0));
    // energy spiralling into the muzzle, a ball of light growing
    if (u > 1.0 && u < SL_FIRE_AT + 0.05) {
      for (var e = 0; e < 24; e++) {
        var a2 = e / 24 * 6.28 + u * 3, rr = 260 * (1 - ((u * 1.4 + e / 24) % 1));
        ctx.fillStyle = "rgba(255,210,140," + (0.9 * charge) + ")"; ctx.beginPath(); ctx.arc(Math.cos(a2) * rr, my + Math.sin(a2) * rr * 0.6, 4 + 3 * charge, 0, 6.28); ctx.fill();
      }
      var orb = 10 + 70 * charge + 6 * Math.sin(u * 45);
      var og = ctx.createRadialGradient(0, my, 0, 0, my, orb * 2.4);
      og.addColorStop(0, "rgba(255,255,245,1)"); og.addColorStop(0.3, "rgba(255,200,100,0.95)"); og.addColorStop(1, "rgba(255,120,40,0)");
      ctx.fillStyle = og; ctx.beginPath(); ctx.arc(0, my, orb * 2.4, 0, 6.28); ctx.fill();
      // lens-flare streak
      ctx.fillStyle = "rgba(255,230,180," + (0.6 * charge) + ")"; ctx.fillRect(-orb * 6, my - 2, orb * 12, 4);
    }
    if (u >= SL_FIRE_AT) {
      var fk = Math.min(1, (u - SL_FIRE_AT) / 0.1), bw = 70 * fk * (1 + 0.08 * Math.sin(u * 70));
      slBeam(0, my, 0, 4000, bw, u);
      var mk = Math.min(1, (u - SL_FIRE_AT) / 0.5); // muzzle shock ring
      ctx.strokeStyle = "rgba(255,240,200," + (1 - mk) + ")"; ctx.lineWidth = 14 * (1 - mk) + 2;
      ctx.beginPath(); ctx.ellipse(0, my, 60 + 380 * mk, 20 + 110 * mk, 0, 0, 6.28); ctx.stroke();
    }
    ctx.restore();
    }
    if (u >= SL_FIRE_AT && u - SL_FIRE_AT < 0.18) { ctx.globalAlpha = 0.85 * (1 - (u - SL_FIRE_AT) / 0.18); ctx.fillStyle = slPal().flash; ctx.fillRect(0, 0, cw, chh); ctx.globalAlpha = 1; }
  } else {
    // through the atmosphere: blue sky, the beam punching down through the clouds
    var v = (u - SL_ATMO_AT) / (SL.space - SL_ATMO_AT);
    var sky = ctx.createLinearGradient(0, 0, 0, chh); sky.addColorStop(0, "#0b1c46"); sky.addColorStop(0.5, "#2f6cc0"); sky.addColorStop(1, "#9fd2ff");
    ctx.fillStyle = sky; ctx.fillRect(0, 0, cw, chh);
    var bx = cw / 2, bw2 = 85 * k * (1 + 0.08 * Math.sin(u * 70));
    slClouds.forEach(function (c) { // rushing up past the camera, pushed out from the beam
      var cy = ((c[1] + v * 1.6 * c[2]) % 1.2 - 0.1) * chh, cx = c[0] * cw;
      var away = cx < bx ? -1 : 1, gap = Math.max(0, 1 - Math.abs(cx - bx) / (cw * 0.35)) * 140 * k * Math.min(1, v * 3);
      ctx.fillStyle = "rgba(255,255,255,0.85)"; ctx.beginPath(); ctx.ellipse(cx + away * gap, cy, 130 * k * c[2], 34 * k * c[2], 0, 0, 6.28); ctx.fill();
    });
    slBeam(bx, 0, bx, chh, bw2, u);
    // a shock cone around the beam
    ctx.strokeStyle = "rgba(255,255,255,0.5)"; ctx.lineWidth = 6 * k;
    for (var q = 0; q < 3; q++) { var qy = ((v * 2 + q / 3) % 1) * chh; ctx.beginPath(); ctx.ellipse(bx, qy, bw2 * 2.6, bw2 * 0.5, 0, 0, 6.28); ctx.stroke(); }
  }
  // caption
  ctx.font = "900 " + (58 * k) + 'px "Barlow Condensed", "Arial Narrow", sans-serif'; ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.lineWidth = 11 * k; ctx.strokeStyle = "#000";
  var cap = u < 1.0 ? (sl.ds ? "TARGET ACQUIRED" : "LOCATION RECEIVED") : (u < SL_FIRE_AT ? (sl.ds ? "PRIMARY IGNITION..." : "CHARGING...") : (u < SL_ATMO_AT ? "FIRE!" : "INCOMING!"));
  ctx.fillStyle = u < SL_FIRE_AT ? "#9dff7a" : (sl.ds ? "#7dff8f" : "#ffcf5a");
  ctx.strokeText(cap, cw / 2, chh * 0.13); ctx.fillText(cap, cw / 2, chh * 0.13);
  if (u >= 1.0 && u < SL_FIRE_AT) { // charge bar
    var bk = (u - 1.0) / (SL_FIRE_AT - 1.0);
    ctx.fillStyle = "rgba(0,0,0,0.6)"; ctx.fillRect(cw * 0.25, chh * 0.165, cw * 0.5, 22 * k);
    ctx.fillStyle = "#9dff7a"; ctx.fillRect(cw * 0.25 + 3 * k, chh * 0.165 + 3 * k, (cw * 0.5 - 6 * k) * bk, 16 * k);
  }
  // a quick white wipe in and out of the shot
  var inK = Math.max(0, 1 - u / 0.15), outK = Math.max(0, (u - (SL.space - 0.15)) / 0.15);
  if (inK > 0 || outK > 0) { ctx.globalAlpha = Math.max(inK, outK); ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, cw, chh); }
  ctx.restore();
}

// ------------- Josh Hokit's Death Star strike (sl.ds)

// Hokit calling it in: saber held low in his right hand, his left raised
// open-handed to the sky. Only his own two arms (Joe's rule).
function slDrawSithCall(d, shR, shL, t) {
  var r = d.r, ch = d.char, size = ch.punch.size || 13;
  var tp = sl.phase === "pull" ? t : SL.pull + (sl.phase === "talk" ? t : SL.talk);
  var k = Math.min(1, tp / SL.pull); k = k * k * (3 - 2 * k);
  // saber hand at his side, blade angled down and out
  var sh = { x: d.x + r * 0.95, y: d.y + r * 0.15 };
  drawBentArm(d, { x: shR[0], y: shR[1] }, sh, 1);
  drawSaber(sh.x, sh.y, 1.15, r * SABER_LEN, 1);
  drawGloveAt(sh.x, sh.y, r * 0.22, ch);
  // free hand: guard -> straight up over his head, fingers spread
  if (!slLeftGloveBlock(d, shL)) {
    var g0 = { x: d.x - r * 0.85, y: d.y - r * 0.6 }, g1 = { x: d.x - r * 0.62, y: d.y - r * 1.45 };
    var wob = sl.phase === "talk" ? Math.sin(t * 9) * 1.5 : 0;
    var hx = g0.x + (g1.x - g0.x) * k + wob, hy = g0.y + (g1.y - g0.y) * k;
    strokeLimb(size * 0.75, armColor(ch), function () { ctx.moveTo(shL[0], shL[1]); ctx.lineTo(hx, hy); });
    if (k > 0.6) strokeLimb(r * 0.07, armColor(ch), function () {
      for (var i = -2; i <= 2; i++) { var fa = -Math.PI / 2 + i * 0.3; ctx.moveTo(hx, hy); ctx.lineTo(hx + Math.cos(fa) * r * 0.3, hy + Math.sin(fa) * r * 0.3); }
    });
    drawGloveAt(hx, hy, size * 0.85, ch, -Math.PI / 2);
  }
  if (sl.phase === "talk") slBubble(d.x - r * 0.2, d.y - r - 40, t < 0.7 ? "DON'T TALK TO ME." : "DON'T LOOK AT ME.", Math.min(1, t / 0.12), false); // his line (Joe's clip)
}

// The Death Star over the planet: a grey battle station, its trench round the
// middle, panels, and the superlaser dish up and to the left. Eight green
// beams light round the dish and meet in front of it, then one beam fires
// down at the planet (the ring).
var slDsPanels = null;
function slDrawDeathStar(u, cw, chh, k, jx, jy, push, zoom) {
  if (!slDsPanels) {
    slDsPanels = [];
    for (var i = 0; i < 160; i++) slDsPanels.push([Math.random() * 2 - 1, Math.random() * 2 - 1, 0.04 + Math.random() * 0.16, 0.012 + Math.random() * 0.03, Math.random()]);
  }
  // The dish faces down and to the left, at the planet: the beam fires out
  // along the dish's own direction, never across the station (Joe).
  var R = 250, dishX = -0.3 * R, dishY = 0.42 * R, dishR = 0.27 * R;
  var dn = Math.sqrt(dishX * dishX + dishY * dishY), nx = dishX / dn, ny = dishY / dn;
  var drift = 1 - slEase3(u / 1.2), recoil = u > SL_FIRE_AT ? Math.sin(Math.min(1, (u - SL_FIRE_AT) / 0.35) * Math.PI) * 30 : 0;
  var fy = chh * 0.27;
  ctx.save();
  ctx.translate(cw * 0.66 + jx + drift * 120 * k - recoil * k * nx, fy + jy - recoil * k * ny); // kicked back off the shot
  // push in on the dish while it charges
  ctx.scale(k * zoom, k * zoom);
  ctx.translate(-dishX * (zoom - 1) / zoom, -dishY * (zoom - 1) / zoom);
  // the sphere
  var g = ctx.createRadialGradient(-R * 0.35, -R * 0.4, R * 0.1, 0, 0, R);
  g.addColorStop(0, "#b9bec6"); g.addColorStop(0.6, "#7c828c"); g.addColorStop(1, "#33363c");
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, R, 0, 6.28); ctx.fill();
  ctx.save(); ctx.beginPath(); ctx.arc(0, 0, R, 0, 6.28); ctx.clip();
  // panels: little light and dark plates, squashed toward the edges
  slDsPanels.forEach(function (p) {
    var x = p[0] * R, y = p[1] * R, edge = Math.sqrt(Math.max(0, 1 - (p[0] * p[0] + p[1] * p[1])));
    ctx.fillStyle = p[4] < 0.5 ? "rgba(40,44,52,0.35)" : "rgba(220,225,232,0.22)";
    ctx.fillRect(x, y, p[2] * R * (0.4 + 0.6 * edge), p[3] * R);
  });
  // latitude lines
  ctx.strokeStyle = "rgba(30,33,38,0.4)"; ctx.lineWidth = 2;
  for (var l = -4; l <= 4; l++) { if (!l) continue; var ly = l * R * 0.2; ctx.beginPath(); ctx.ellipse(0, ly, Math.sqrt(R * R - ly * ly), R * 0.06, 0, 0, Math.PI); ctx.stroke(); }
  // the equatorial trench
  ctx.fillStyle = "#24272c"; ctx.beginPath(); ctx.ellipse(0, R * 0.04, R, R * 0.045, 0, 0, 6.28); ctx.fill();
  ctx.strokeStyle = "rgba(230,235,240,0.55)"; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.ellipse(0, R * 0.0, R, R * 0.04, 0, 0, Math.PI); ctx.stroke();
  // shadow on the far side
  var sh = ctx.createLinearGradient(-R, -R, R, R); sh.addColorStop(0.45, "rgba(0,0,0,0)"); sh.addColorStop(1, "rgba(0,0,0,0.6)");
  ctx.fillStyle = sh; ctx.fillRect(-R, -R, R * 2, R * 2);
  ctx.restore();
  // the superlaser dish: a concave bowl with ribs and a raised rim
  var charge = Math.max(0, Math.min(1, (u - 0.9) / (SL_FIRE_AT - 0.9)));
  var dg = ctx.createRadialGradient(dishX + dishR * 0.3, dishY + dishR * 0.3, dishR * 0.1, dishX, dishY, dishR);
  dg.addColorStop(0, "#3b3f46"); dg.addColorStop(0.7, "#5f646d"); dg.addColorStop(1, "#9aa0a8");
  ctx.fillStyle = dg; ctx.beginPath(); ctx.arc(dishX, dishY, dishR, 0, 6.28); ctx.fill();
  ctx.strokeStyle = "rgba(25,27,31,0.7)"; ctx.lineWidth = 2;
  for (var rb = 0; rb < 24; rb++) { var ra = rb / 24 * 6.28; ctx.beginPath(); ctx.moveTo(dishX + Math.cos(ra) * dishR * 0.15, dishY + Math.sin(ra) * dishR * 0.15); ctx.lineTo(dishX + Math.cos(ra) * dishR * 0.95, dishY + Math.sin(ra) * dishR * 0.95); ctx.stroke(); }
  ctx.strokeStyle = "#cfd3d8"; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(dishX, dishY, dishR, 0, 6.28); ctx.stroke();
  ctx.fillStyle = "#1c1e22"; ctx.beginPath(); ctx.arc(dishX, dishY, dishR * 0.13, 0, 6.28); ctx.fill();
  // the focal point, out in front of the dish
  var fx = dishX + nx * dishR * 0.55, fyy = dishY + ny * dishR * 0.55; // the focal point, out in front of the dish
  if (u > 0.9 && u < SL_FIRE_AT + 0.05) {
    // eight beams light one by one round the rim and reach in to meet
    for (var b = 0; b < 8; b++) {
      var on = Math.max(0, Math.min(1, (charge - b * 0.07) / 0.3));
      if (on <= 0) continue;
      var ba = b / 8 * 6.28 + 0.2, sx = dishX + Math.cos(ba) * dishR * 0.82, sy = dishY + Math.sin(ba) * dishR * 0.82;
      var ex = sx + (fx - sx) * on, ey = sy + (fyy - sy) * on;
      ctx.lineCap = "round";
      ctx.strokeStyle = "rgba(60,255,100,0.35)"; ctx.lineWidth = 14; ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(ex, ey); ctx.stroke();
      ctx.strokeStyle = "rgba(225,255,225,0.95)"; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(ex, ey); ctx.stroke();
    }
    var orb = 6 + 46 * charge + 4 * Math.sin(u * 45);
    var og = ctx.createRadialGradient(fx, fyy, 0, fx, fyy, orb * 2.4);
    og.addColorStop(0, "rgba(240,255,240,1)"); og.addColorStop(0.3, "rgba(120,255,130,0.95)"); og.addColorStop(1, "rgba(40,255,90,0)");
    ctx.fillStyle = og; ctx.beginPath(); ctx.arc(fx, fyy, orb * 2.4, 0, 6.28); ctx.fill();
  }
  if (u >= SL_FIRE_AT) {
    var fk = Math.min(1, (u - SL_FIRE_AT) / 0.1), bw = 60 * fk * (1 + 0.08 * Math.sin(u * 70));
    // it stops where it meets the planet, with a flare there
    var hitY = (chh * 0.7 - fy) / (k * zoom) + dishY * (zoom - 1) / zoom, L = Math.max(200, (hitY - fyy) / ny);
    ctx.save(); ctx.translate(fx, fyy); ctx.rotate(Math.atan2(ny, nx) - Math.PI / 2);
    slBeam(0, 0, 0, L, bw, u);
    var hf = ctx.createRadialGradient(0, L, 0, 0, L, bw * 4);
    hf.addColorStop(0, "rgba(240,255,240,1)"); hf.addColorStop(0.35, "rgba(110,255,130,0.8)"); hf.addColorStop(1, "rgba(40,255,90,0)");
    ctx.fillStyle = hf; ctx.beginPath(); ctx.arc(0, L, bw * 4 * (1 + 0.1 * Math.sin(u * 60)), 0, 6.28); ctx.fill();
    ctx.restore();
    var mk = Math.min(1, (u - SL_FIRE_AT) / 0.5);
    ctx.strokeStyle = "rgba(210,255,210," + (1 - mk) + ")"; ctx.lineWidth = 14 * (1 - mk) + 2;
    ctx.beginPath(); ctx.ellipse(fx, fyy, 50 + 320 * mk, 18 + 90 * mk, Math.atan2(ny, nx) + Math.PI / 2, 0, 6.28); ctx.stroke();
  }
  ctx.restore();
}
