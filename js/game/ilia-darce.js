// Ilia Topuria's D'Arce choke (Christian, 2026-11-15: "Topuria, at a low
// frequency or when health is low, should go for a D'Arce").
//
// An arm-in front headlock choke. Two ways into it:
//   - Off a shot (the clean one): they shoot, he sprawls on it (his `tdd`
//     sprawl, or a shot that gets stuffed) and instead of breaking off with
//     punches ("STUFFED") he snaps their head down, threads his arm under
//     their neck and out through their armpit, grips his other bicep and
//     squeezes ("D'ARCE!"). From endTddSprawl (ilia.js).
//   - Up close: every `lunge.every` seconds while they're within
//     `lunge.range` of him he looks for it, and on the roll he dips and
//     lunges in (`lunge.speed`) for a front headlock. If he hasn't reached
//     them in `lunge.time` seconds it comes to nothing.
// Every look rolls `chance`% (rare), or `lowHpChance`% once his own health is
// under `lowHpAt`% of MAX_HP. After any go at it (a lunge that misses too) he
// waits `cooldown` seconds before the next.
//
// The hold is the same tug-of-war bar as the other chokes (rnc.js): `hold`
// seconds plus up to `holdExtra` more, then they tap (a win by submission) or
// pop their head out ("ESCAPE", pushed apart at `escapeSpeed`). Tap odds as
// for the rear naked choke: `tapBase`% at full health, plus up to `tapLowHp`%
// more the more damage the one caught has taken (and Conor McGregor taps
// easier once he's gassed, conor.js). Never more than 95%.
//
// Everything is under `darce` in his character file. Leave it out and none of
// this happens. While he's in it he counts as locked in a submission
// (subLocked, bjj.js), so nothing else starts on either of them.
"use strict";

var DARCE_TAP_TIME = 0.75;  // three pats, then the fight's called
var DARCE_GAP = 0.9;        // how close they're held at his side (1 = just touching)
var DARCE_TELL = 0.1;       // the dip before the lunge

function darceCfg(b) { return b && b.char && b.char.darce; }

// The chance of each look, by how hurt he is.
function darceChance(self, dc) {
  return self.hp < MAX_HP * (dc.lowHpAt || 0) / 100 ? (dc.lowHpChance || 0) : (dc.chance || 0);
}

// Nothing else going on that a front headlock would cut into.
function darceOpen(self, other) {
  if (!self.alive || !other.alive || other.invincible || other.slamSafe > 0) return false;
  if (specialBusy(self) || specialBusy(other) || swordDuelActive()) return false;
  if (other.x < 0 || other.x > W || other.y < 0 || other.y > H) return false; // (up in the air, off the screen)
  if (americaUngrabbable(other) || bispingAboard(other) || golfSwinging(other) || other.bearHeld || other.torHeld) return false;
  if (clinchBusy(self) || clinchBusy(other) || jonClinchBusy(other) || kneesBusy(other)) return false;
  return true;
}

// From endTddSprawl (ilia.js): he's sprawled on their shot. True if he
// snaps on the D'Arce instead of breaking off.
function tryDarceOffSprawl(self, atk) {
  var dc = darceCfg(self);
  if (!dc || self.darce || (self.darceCd || 0) > 0 || !darceOpen(self, atk)) return false;
  if (Math.random() * 100 >= darceChance(self, dc)) return false;
  beginDarce(self, atk);
  return true;
}

// From updateAbilities (abilities.js), every frame for a fighter with a
// `darce` block: runs the hold, the lunge in, or the up-close look. True
// while he's busy with it.
function updateIliaDarce(self, other, dt) {
  var dc = darceCfg(self);
  if (!dc) return false;
  if (self.darce) { updateDarce(self, dt); return true; }
  if (self.darceCd > 0) self.darceCd = Math.max(0, self.darceCd - dt);
  var lg = dc.lunge || {};
  if (self.darceLunge) return updateDarceLunge(self, other, dt, lg);
  if (!lg.every || !started || over) return false;
  if (self.darceLookT == null) self.darceLookT = lg.every;
  var gap = Math.sqrt((other.x - self.x) * (other.x - self.x) + (other.y - self.y) * (other.y - self.y)) - self.r - other.r;
  if (gap > (lg.range || 0)) return false;
  if (self.darceLookT > 0) self.darceLookT -= dt;
  if (self.darceLookT > 0) return false;
  // (a look that comes due mid-punch waits for a free moment up close)
  if (self.darceCd > 0 || self.punch || self.kick || self.swing || self.throwAnim || !darceOpen(self, other)) return false;
  self.darceLookT = lg.every;
  if (Math.random() * 100 >= darceChance(self, dc)) return false;
  // Dips, then lunges in for the front headlock.
  clearActions(self);
  self.darceCd = dc.cooldown || 0;
  self.darceLunge = { t: 0, vicId: other.id };
  self.vx = 0; self.vy = 0;
  return true;
}

function updateDarceLunge(self, other, dt, lg) {
  var L = self.darceLunge;
  L.t += dt;
  if (!darceOpen(self, other) || L.t > DARCE_TELL + (lg.time || 0.3)) { self.darceLunge = null; return false; }
  var dx = other.x - self.x, dy = other.y - self.y, d = Math.sqrt(dx * dx + dy * dy) || 1;
  if (L.t < DARCE_TELL) { self.vx = 0; self.vy = 0; return true; }
  if (d <= self.r + other.r + 6) { self.darceLunge = null; beginDarce(self, other); return true; }
  var sp = lg.speed || 600;
  self.vx = dx / d * sp; self.vy = dy / d * sp;
  return true;
}

function beginDarce(self, vic) {
  var dc = darceCfg(self);
  var hurtFrac = 1 - Math.max(0, Math.min(1, vic.hp / MAX_HP));
  var tapChance = Math.min(95, (dc.tapBase || 0) + (dc.tapLowHp || 0) * hurtFrac);
  tapChance = conorTapChance(vic, tapChance, dc); // Conor McGregor taps easier, more once he's gassed (conor.js)
  // They're held bent over at his side, on whichever side they came in on,
  // unless there's no room for them there before the wall.
  var side = vic.x >= self.x ? 1 : -1;
  var reach = (self.r + vic.r) * DARCE_GAP + vic.r;
  if (self.x + side * reach > W || self.x + side * reach < 0) side = -side;
  self.darce = {
    vicId: vic.id, t: 0, dur: (dc.hold || 2.4) + Math.random() * (dc.holdExtra || 0),
    taps: Math.random() < tapChance / 100, tapChance: tapChance, bar: 0, phase: "squeeze", tapT: 0,
    side: side, wob: Math.random() * 10
  };
  self.darceCd = dc.cooldown || 0;
  self.darceLunge = null;
  vic.choked = true;
  if (vic.char.hasGrapple && vic.char.grapple) vic.grappleCd = Math.max(vic.grappleCd || 0, vic.char.grapple.cooldown);
  [self, vic].forEach(function (b) {
    clearActions(b);
    b.vx = 0; b.vy = 0;
  });
  floater(self.x, Math.min(self.y, vic.y) - self.r - 30, "D'ARCE!", "crit");
  commentaryCall("choke", self, vic); // "It's under the neck!" (commentary-calls.js)
  playPunch(20);
  if (!reduceMotion) shake = Math.max(shake, 8);
}

// Runs on him; the one caught in it is held still at his side.
function updateDarce(self, dt) {
  var c = self.darce, vic = balls[c.vicId];
  // (the watchdog letting go of them, watchdog.js, lets go of this too)
  if (!self.alive || !vic.alive || !vic.choked) { endDarce(self); return; }
  c.t += dt;
  var jit = reduceMotion || c.phase !== "squeeze" ? 0 : 1.6;
  self.vx = 0; self.vy = 0; vic.vx = 0; vic.vy = 0;
  vic.x = self.x + c.side * (self.r + vic.r) * DARCE_GAP + (Math.random() - 0.5) * jit;
  vic.y = self.y + (Math.random() - 0.5) * jit;

  if (c.phase === "squeeze") {
    // The bar swings back and forth, then commits: +1 the choke, -1 the escape.
    var p = Math.min(1, c.t / c.dur), sgn = c.taps ? 1 : -1;
    var swing = Math.sin(c.t * 4.5 + c.wob) * Math.sin(c.t * 1.8 + c.wob * 0.5) * 0.55 * (1 - p);
    c.bar = Math.max(-1, Math.min(1, sgn * Math.pow(p, 2.2) + swing));
    if (p < 1) return;
    c.bar = sgn;
    if (c.taps) {
      c.phase = "tap";
      floater(vic.x, vic.y - vic.r - 30, "TAP", "crit");
      playPunch(10);
      return;
    }
    // They pull their head out and the two of them spring apart.
    floater((self.x + vic.x) / 2, Math.min(self.y, vic.y) - vic.r - 30, "ESCAPE", "note");
    var es = darceCfg(self).escapeSpeed || 340, side = c.side;
    endDarce(self);
    var a = (Math.random() - 0.5) * 0.9;
    vic.vx = side * Math.cos(a) * es; vic.vy = Math.sin(a) * es;
    self.vx = -side * Math.cos(a) * es * 0.6; self.vy = -Math.sin(a) * es * 0.6;
    return;
  }
  c.tapT += dt;
  if (c.tapT >= DARCE_TAP_TIME) {
    endDarce(self);
    submit(vic);
  }
}

function endDarce(self) {
  var c = self.darce;
  if (!c) return;
  balls[c.vicId].choked = false;
  self.darce = null;
}

// How far it's sunk in right now (0 to 1).
function darceSqueeze(c) { return c.phase === "tap" ? 1 : Math.max(0, c.bar); }
// He leans over them; they're bent over sideways, head first under his arm.
function darceLean(c) { return c.side * (0.22 + 0.12 * darceSqueeze(c)); }
function darceBend(c) { return -c.side * Math.PI / 2 * 0.88; }

// From draw.js, with the canvas set up for the fighter being drawn.
function applyIliaDarcePose(b) {
  var holder = b, c = b.darce;
  if (!c) {
    if (!b.choked) return;
    holder = balls[1 - b.id]; c = holder.darce;
    if (!c || c.vicId !== b.id) return;
  }
  var a = b === holder ? darceLean(c) : darceBend(c);
  ctx.translate(b.x, b.y); ctx.rotate(a); ctx.translate(-b.x, -b.y);
}

// From draw.js, over both fighters: his arm under their neck and out through
// their armpit (their own arm trapped in with their head), the hand gripping
// his other arm over the top, and the tug-of-war bar.
function drawIliaDarce() {
  balls.forEach(function (self) {
    var c = self.darce;
    if (!c) return;
    var vic = balls[c.vicId], s = c.side, R = self.r, V = vic.r;
    var sq = darceSqueeze(c), cin = 1 - 0.12 * sq;
    var la = darceLean(c), lc = Math.cos(la), ls = Math.sin(la);
    var ka = darceBend(c), hx = Math.sin(ka), hy = -Math.cos(ka), qx = Math.cos(ka) * s, qy = Math.sin(ka) * s;
    // On them: `along` toward their head, `across` their neck (+ is the top).
    function onVic(along, across) { return { x: vic.x + hx * along + qx * across, y: vic.y + hy * along + qy * across }; }
    function onHim(ox, oy) { return { x: self.x + ox * lc - oy * ls, y: self.y + ox * ls + oy * lc }; }
    var skin = armColor(self.char), vskin = armColor(vic.char), limb = R * 0.22, vlimb = V * 0.18;
    ctx.save();

    // Their face goes red as it sinks in.
    if (sq > 0) {
      ctx.save();
      ctx.beginPath(); ctx.arc(vic.x, vic.y, V, 0, Math.PI * 2); ctx.clip();
      ctx.globalAlpha = 0.55 * sq;
      ctx.fillStyle = "#d62020";
      var face = onVic(V * 0.66, 0);
      ctx.beginPath(); ctx.arc(face.x, face.y, V * 0.4, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }

    // Their trapped arm, jammed up alongside their head into his chest.
    var tSh = onVic(V * 0.05, V * 0.78), tEl = onVic(V * 0.5, V * 0.98 * cin), tHa = onVic(V * 1.02, V * 0.62 * cin);
    strokeLimb(vlimb, vskin, function () { ctx.moveTo(tSh.x, tSh.y); ctx.quadraticCurveTo(tEl.x, tEl.y, tHa.x, tHa.y); });
    drawGloveAt(tHa.x, tHa.y, V * 0.2, vic.char);

    // His other arm, over the top of their arm and down onto their back.
    var oSh = onHim(s * R * 0.3, -R * 0.78), oCtl = onVic(V * 0.6, V * 1.45 * cin), oHa = onVic(-V * 0.25, V * 0.6);
    strokeLimb(limb, skin, function () { ctx.moveTo(oSh.x, oSh.y); ctx.quadraticCurveTo(oCtl.x, oCtl.y, oHa.x, oHa.y); });
    drawGloveAt(oHa.x, oHa.y, R * 0.24, self.char);
    // (his bicep on that arm, where the threading hand grips it)
    var k = 0.42, clasp = {
      x: (1 - k) * (1 - k) * oSh.x + 2 * k * (1 - k) * oCtl.x + k * k * oHa.x,
      y: (1 - k) * (1 - k) * oSh.y + 2 * k * (1 - k) * oCtl.y + k * k * oHa.y
    };

    // The threading arm: from his low shoulder, under their throat, across
    // the neck and out past their trapped arm, round to grip the bicep.
    var tSh2 = onHim(s * R * 0.62, R * 0.4), under = onVic(V * 0.42, -V * 0.72 * cin), out = onVic(V * 0.36, V * 1.12 * cin);
    strokeLimb(limb, skin, function () {
      ctx.moveTo(tSh2.x, tSh2.y);
      ctx.quadraticCurveTo(onVic(V * 0.75, -V * 1.1).x, onVic(V * 0.75, -V * 1.1).y, under.x, under.y);
      ctx.lineTo(out.x, out.y);
      ctx.quadraticCurveTo(onVic(V * 0.3, V * 1.35).x, onVic(V * 0.3, V * 1.35).y, clasp.x, clasp.y);
    });
    drawGloveAt(clasp.x, clasp.y, R * 0.24, self.char);

    // Their free hand: pushing at his hip, or patting him three times to tap.
    var fSh = onVic(V * 0.05, -V * 0.78), fH = onHim(s * R * 0.45, R * 0.82);
    if (c.phase === "tap") {
      var pat = Math.abs(Math.sin(c.tapT / DARCE_TAP_TIME * Math.PI * 3));
      fH = { x: fH.x, y: fH.y - pat * R * 0.3 };
    } else fH = { x: fH.x + Math.sin(c.t * 9 + c.wob) * R * 0.04, y: fH.y };
    strokeLimb(vlimb, vskin, function () { ctx.moveTo(fSh.x, fSh.y); ctx.lineTo(fH.x, fH.y); });
    drawGloveAt(fH.x, fH.y, V * 0.2, vic.char);

    // Tug-of-war bar: his colour is the choke, theirs the escape.
    var bw = 150, bh = 12;
    var bx = Math.min(W - bw - 6, Math.max(6, (self.x + vic.x) / 2 - bw / 2));
    var by = Math.min(self.y, vic.y) - Math.max(R, V) - 64;
    if (by < 8) by = Math.max(self.y, vic.y) + Math.max(R, V) + 30;
    var split = bw * (c.bar + 1) / 2;
    ctx.fillStyle = self.char.color; ctx.fillRect(bx, by, split, bh);
    ctx.fillStyle = vic.char.color; ctx.fillRect(bx + split, by, bw - split, bh);
    ctx.lineWidth = 2.5; ctx.strokeStyle = theme.wall; ctx.strokeRect(bx, by, bw, bh);
    ctx.fillStyle = theme.ink;
    ctx.fillRect(bx + split - 2, by - 4, 4, bh + 8);
    ctx.restore();
  });
}

// The fighter card (gallery.js).
function iliaDarceGalleryMoves(ch, add) {
  var dc = ch.darce;
  if (!dc) return;
  add("🐍", "D'Arce choke", "Now and then, when they shoot and he sprawls on it (or up close, lunging in for a front headlock), he threads an arm under their neck and through their armpit and squeezes. " +
    dc.chance + "% each time at normal health, " + dc.lowHpChance + "% once he's under " + dc.lowHpAt + "% health, then " + dc.cooldown + "s before the next. They tap " +
    dc.tapBase + "% of the time at full health, up to " + Math.min(95, dc.tapBase + dc.tapLowHp) + "% when hurt; otherwise they pull their head out.");
}
