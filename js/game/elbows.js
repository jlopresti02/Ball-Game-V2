// Elbows (Christian, 2026-11-13): a strike any fighter can switch on with an
// `elbow` block in its character file. Built for Tony Ferguson first; knees
// and real combinations will come the same way.
//
//   "elbow": { "damage": 6, "cooldown": 1.15, "speed": 0.26, "reach": 14,
//              "critChance": 40, "critMult": 3, "knockback": 150,
//              "cut": { "chance": 45, "time": 4, "dps": 2 } }
//
// damage      what a normal elbow does. Elbows are short and sharp: low base
//             damage, but `critChance`% of them are critical hits for
//             `critMult` times the damage ("CRIT!", a white slash).
// cooldown    seconds between elbows (lighter classes throw them a little
//             quicker, like punches, weight.js). Throwing one also holds the
//             fighter's next punch back, so it's one arm at a time.
// speed       how long one elbow takes: the arm comes up folded, the point of
//             the elbow sweeps across in a short arc and lands at 45% of it.
// reach       how close they have to be (the gap between the two balls). It's
//             shorter than a punch: elbows are an up-close weapon.
// knockback   the shove on a clean one.
// cut         a critical elbow opens a cut `chance`% of the time: a red gash
//             where it landed, and they bleed `dps` a second for `time`
//             seconds (unblockable ticks, like the Watcher's lasers). A new
//             cut refreshes the clock rather than stacking.
//
// Elbows hit with source "elbow": they can be slipped, blocked and countered
// like any strike, and they can knock a guard player onto its back.
// throwElbow(self, other, opts) lets a fighter's own moves throw one with
// their own numbers (Tony's katanas and his elbows from the guard), and
// drawElbowArm draws the folded arm, with a blade on it when opts.blade is
// set.
"use strict";

GUARD_SOURCES.elbow = true; // an elbow can knock a guard player onto its back (guard.js)

var ELBOW_HIT = 0.45; // share of the elbow's time when it lands

function elbowCfg(b) { return b && b.char && b.char.elbow; }
function elbowOn(b) { return !!(b && b.elbowAnim); }
// The elbow's arm (and the other hand) are drawn here (drawHands skips them).
function elbowHandsBusy(b) { return elbowOn(b) && !b.elbowAnim.ownDraw; }

// From the abilities loop, after the punch. Starts an elbow when they're
// close enough and the arms are free, and lands it.
function updateElbows(self, other, dt, d) {
  var cfg = elbowCfg(self);
  if (!cfg) return;
  if (self.elbowCd == null) self.elbowCd = cfg.cooldown * stagger();
  self.elbowCd = Math.max(0, self.elbowCd - dt * (self.atkRate || 1));
  var busy = self.punch || self.kick || self.swing || self.throwAnim || self.combo || self.taunt || self.koPunch || self.elbowAnim;
  if (!busy && self.elbowCd === 0 && other.alive && d < self.r + other.r + cfg.reach) {
    self.elbowCd = cfg.cooldown;
    startElbow(self, other, {});
    // The punch waits for the elbow to come back.
    if (self.char.hasPunch) self.punchCd = Math.max(self.punchCd || 0, cfg.speed + 0.05);
  }
  tickElbowAnim(self, other, dt);
}

// Starts one elbow. opts (all optional): damage, critChance, critMult,
// knockback, cut, reach, speed, side, blade (a katana on the elbow), ownDraw
// (the caller draws the arm), source (default "elbow"), quietCrit (no "CRIT!"
// call-out, for a flurry), always (lands whatever the gap), onLand(dealt, crit).
function startElbow(self, other, opts) {
  var cfg = elbowCfg(self) || {};
  var side = opts.side || (self.elbowSide = -(self.elbowSide || 1));
  self.elbowAnim = {
    t: 0, dur: opts.speed || cfg.speed || 0.26, hit: false, side: side, targetId: other.id,
    blade: !!opts.blade, ownDraw: !!opts.ownDraw, opts: opts, crit: false
  };
  playElbowSwish(!!opts.blade);
}

function tickElbowAnim(self, other, dt) {
  var e = self.elbowAnim;
  if (!e) return;
  e.t += dt;
  if (!e.hit && e.t >= e.dur * ELBOW_HIT) {
    e.hit = true;
    landElbow(self, balls[e.targetId], e);
  }
  if (self.elbowAnim && e.t >= e.dur) self.elbowAnim = null;
}

// One elbow landing (or missing).
function landElbow(self, other, e) {
  var cfg = elbowCfg(self) || {}, o = e.opts || {};
  if (!other || !other.alive || other.koOut) return 0;
  var dx = other.x - self.x, dy = other.y - self.y, d = Math.sqrt(dx * dx + dy * dy) || 1;
  var reach = o.reach != null ? o.reach : (cfg.reach || 14);
  if (!o.always && d > self.r + other.r + reach + 6) {
    floater(other.x, other.y - other.r - 8, "WHIFF", "dodge");
    return 0;
  }
  var critChance = o.critChance != null ? o.critChance : (cfg.critChance || 0);
  var crit = Math.random() * 100 < critChance;
  var base = o.damage != null ? o.damage : (cfg.damage || 6);
  var mult = crit ? (o.critMult != null ? o.critMult : (cfg.critMult || 2)) : 1;
  var dealt = hurt(other, base * mult, o.source || "elbow", self.id);
  if (dealt > 0) {
    e.crit = crit;
    var ux = dx / d, uy = dy / d, kb = o.knockback != null ? o.knockback : (cfg.knockback || 0);
    if (!other.justDodged && kb && elbowKnockable(other)) { other.vx += ux * kb * (crit ? 1.6 : 1); other.vy += uy * kb * (crit ? 1.6 : 1); }
    elbowSpark(self, other, ux, uy, crit, e.blade);
    if (crit) {
      if (!o.quietCrit) floater(other.x, other.y - other.r - 30, e.blade ? "CRIT SLASH!" : "CRIT!", "crit");
      var cut = o.cut !== undefined ? o.cut : cfg.cut;
      if (cut && Math.random() * 100 < cut.chance) openCut(other, Math.atan2(-uy, -ux), cut, self.id, !o.quietCrit); // (no "CUT!" on top of "CRIT!")
    }
    playElbowHit(dealt, crit, e.blade);
    if (!reduceMotion) shake = Math.max(shake, crit ? 12 : 5);
    if (crit) hitStop = Math.max(hitStop, 0.06);
  }
  if (o.onLand) o.onLand(dealt, crit);
  checkEnd();
  return dealt;
}
function elbowKnockable(o) { return o.alive && !o.grappled && !o.grapple && !o.slam && !subLocked(o) && !o.igbb && !o.koOut; }

// Throws one elbow right now with a fighter's own numbers (from its moves).
function throwElbow(self, other, opts) { startElbow(self, other, opts || {}); }

// ---------------------------------------------------------------- cuts

// A gash at angle `ang` round the ball (where the elbow landed), bleeding.
function openCut(b, ang, cut, byId, quiet) {
  if (!b.alive) return;
  var fresh = !b.cut;
  b.cut = { t: cut.time, max: cut.time, dps: cut.dps, ang: ang, by: byId, acc: 0, drip: 0 };
  if (fresh && !quiet) floater(b.x, b.y - b.r - 48, "CUT!", "note");
}

// From update(), every frame: cuts bleed and close up.
function tickElbows(dt) {
  balls.forEach(function (b) {
    var c = b.cut;
    if (!c) return;
    if (!b.alive || over) { b.cut = null; return; }
    c.t -= dt;
    c.acc += c.dps * dt;
    c.drip -= dt;
    if (c.drip <= 0 && !reduceMotion) {
      c.drip = 0.12;
      var px = b.x + Math.cos(c.ang) * b.r * 0.8, py = b.y + Math.sin(c.ang) * b.r * 0.8;
      particles.push({ x: px, y: py, vx: (Math.random() - 0.5) * 30, vy: 40 + Math.random() * 60, life: 0.45, max: 0.45, size: 2 + Math.random() * 1.8, color: "#c3121b" });
    }
    c.tickT = (c.tickT || 0) - dt;
    if (c.acc >= 1 && (c.tickT <= 0 || c.t <= 0)) {
      // Bleeding ticks, like the Watcher's lasers: nothing slips or blocks
      // them. Once a second, so the numbers don't pile up.
      c.tickT = 1;
      var tick = Math.floor(c.acc);
      c.acc -= tick;
      var dealt = hurt(b, tick, "laser", c.by);
      if (dealt > 0) floater(b.x + (Math.random() - 0.5) * b.r, b.y - b.r - 6, "-" + dmgText(dealt), "tick");
      checkEnd();
    }
    if (c.t <= 0) b.cut = null;
  });
}

// ---------------------------------------------------------------- drawing

// Where an elbow is right now: the arm folded with the point of the elbow
// sweeping round in front of him. `p` 0..1 through the elbow (-1 for the
// raised guard he holds between them), `ang` toward the opponent, `side`
// which arm (-1 / 1). Returns the shoulder, the elbow point, the hand.
function elbowPose(b, ang, side, p, reachExtra) {
  var r = b.r, ux = Math.cos(ang), uy = Math.sin(ang), px = -uy, py = ux;
  var th, ext;
  if (p < 0) { th = ang + side * 0.95; ext = 0; } // the guard: elbow up and out
  else {
    // Out to the side, then round through the front and across.
    var hit = ELBOW_HIT;
    th = p < hit ? ang + side * (1.25 - 1.2 * easeOut(p / hit)) : ang + side * (0.05 - 0.6 * ((p - hit) / (1 - hit)));
    ext = p < hit ? Math.pow(p / hit, 1.4) : 1 - (p - hit) / (1 - hit);
  }
  var sh = { x: b.x + px * side * r * 0.5 + ux * r * 0.1, y: b.y + py * side * r * 0.5 + uy * r * 0.1 };
  var reach = r * 0.95 + ext * (reachExtra || r * 0.4);
  var el = { x: b.x + Math.cos(th) * reach, y: b.y + Math.sin(th) * reach };
  // The hand folds back by his chin.
  var hd = { x: b.x + ux * r * 0.55 + px * side * r * 0.12, y: b.y + uy * r * 0.55 + py * side * r * 0.12 };
  return { sh: sh, el: el, hd: hd, th: th, ext: ext };
}

// One folded arm with the elbow out, optionally with a katana blade coming
// off the point of the elbow. `glow` (0..1) lights the elbow up white.
function drawElbowArm(b, ang, side, p, blade, glow, bladeLen) {
  var pose = elbowPose(b, ang, side, p);
  var size = (b.char.punch && b.char.punch.size) || 14, limb = size * 0.7, skin = armColor(b.char, side);
  ctx.save();
  if (blade) drawElbowBlade(pose.sh, pose.el, b.r * (bladeLen == null ? 1.15 : bladeLen), p);
  strokeLimb(limb, skin, function () { ctx.moveTo(pose.sh.x, pose.sh.y); ctx.lineTo(pose.el.x, pose.el.y); ctx.lineTo(pose.hd.x, pose.hd.y); });
  // The point of the elbow.
  var ea = Math.atan2(pose.el.y - b.y, pose.el.x - b.x);
  ctx.fillStyle = shadeHex(b.char.look ? b.char.look.skin : "#d9a27e", -0.12); ctx.strokeStyle = theme.wall; ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.arc(pose.el.x, pose.el.y, limb * 0.62, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  if (glow > 0) {
    ctx.globalAlpha = Math.min(1, glow);
    ctx.fillStyle = "#ffffff";
    ctx.beginPath(); ctx.arc(pose.el.x + Math.cos(ea) * limb * 0.2, pose.el.y + Math.sin(ea) * limb * 0.2, limb * 0.42, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;
  }
  if (blade) { // the guard where the blade comes out of his elbow
    ctx.fillStyle = "#151515"; ctx.beginPath(); ctx.arc(pose.el.x, pose.el.y, limb * 0.36, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#c8a24a"; ctx.beginPath(); ctx.arc(pose.el.x, pose.el.y, limb * 0.16, 0, Math.PI * 2); ctx.fill();
  }
  drawGloveAt(pose.hd.x, pose.hd.y, size * 0.7, b.char, ang);
  ctx.restore();
  return pose;
}

// A katana coming straight out of the point of the elbow (upper arm's
// direction), its edge curving gently back.
function drawElbowBlade(sh, el, len, p) {
  var dx = el.x - sh.x, dy = el.y - sh.y, d = Math.sqrt(dx * dx + dy * dy) || 1, ux = dx / d, uy = dy / d, nx = -uy, ny = ux;
  var tip = { x: el.x + ux * len, y: el.y + uy * len };
  var c = { x: el.x + ux * len * 0.55 + nx * len * 0.09, y: el.y + uy * len * 0.55 + ny * len * 0.09 };
  ctx.save();
  ctx.lineCap = "round";
  ctx.strokeStyle = "#1d2328"; ctx.lineWidth = 8;
  ctx.beginPath(); ctx.moveTo(el.x, el.y); ctx.quadraticCurveTo(c.x, c.y, tip.x, tip.y); ctx.stroke();
  var g = ctx.createLinearGradient(el.x, el.y, tip.x, tip.y);
  g.addColorStop(0, "#9aa7b1"); g.addColorStop(0.5, "#f4f8fb"); g.addColorStop(1, "#c4cfd7");
  ctx.strokeStyle = g; ctx.lineWidth = 5;
  ctx.beginPath(); ctx.moveTo(el.x, el.y); ctx.quadraticCurveTo(c.x, c.y, tip.x, tip.y); ctx.stroke();
  ctx.strokeStyle = "rgba(255,255,255,0.9)"; ctx.lineWidth = 1.4; // the edge's shine
  ctx.beginPath(); ctx.moveTo(el.x + nx * 1.5, el.y + ny * 1.5); ctx.quadraticCurveTo(c.x + nx * 1.5, c.y + ny * 1.5, tip.x, tip.y); ctx.stroke();
  // A gleam running along it.
  var gl = (performance.now() / 600) % 1;
  ctx.fillStyle = "rgba(255,255,255," + (0.8 * Math.sin(gl * Math.PI)).toFixed(3) + ")";
  ctx.beginPath(); ctx.arc(el.x + (tip.x - el.x) * gl, el.y + (tip.y - el.y) * gl, 3, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

// From draw(), per fighter: the elbow being thrown, and a cut if they have one.
function drawElbow(b, other) {
  drawCut(b);
  var e = b.elbowAnim;
  if (!e || e.ownDraw || !b.alive) return;
  var o = balls[e.targetId] || other, ang = Math.atan2(o.y - b.y, o.x - b.x), p = Math.min(1, e.t / e.dur);
  var glow = e.hit && e.crit ? Math.max(0, 1 - (e.t - e.dur * ELBOW_HIT) / 0.15) : 0;
  drawElbowTrail(b, ang, e.side, p, e.blade);
  drawElbowArm(b, ang, e.side, p, e.blade, glow);
  // The other hand stays up in guard.
  var px = -Math.sin(ang), py = Math.cos(ang), size = (b.char.punch && b.char.punch.size) || 14;
  drawGloveAt(b.x + Math.cos(ang) * b.r * 0.8 - px * e.side * b.r * 0.4, b.y + Math.sin(ang) * b.r * 0.8 - py * e.side * b.r * 0.4, b.r * 0.3, b.char, ang);
}

// The swoosh the elbow (or the blade's tip) leaves through the arc.
function drawElbowTrail(b, ang, side, p, blade) {
  if (p < 0.2 || p > 0.75) return;
  var pts = [];
  for (var i = 0; i <= 6; i++) {
    var q = Math.max(0, p - 0.25 + i * 0.25 / 6), pose = elbowPose(b, ang, side, q);
    var ux = pose.el.x - pose.sh.x, uy = pose.el.y - pose.sh.y, ud = Math.sqrt(ux * ux + uy * uy) || 1;
    var len = blade ? b.r * 1.15 : b.r * 0.2;
    pts.push({ x: pose.el.x + ux / ud * len, y: pose.el.y + uy / ud * len });
  }
  ctx.save();
  ctx.lineCap = "round"; ctx.lineJoin = "round";
  ctx.globalAlpha = 0.55 * Math.sin((p - 0.2) / 0.55 * Math.PI);
  ctx.strokeStyle = blade ? "#ffd9d9" : "#ffffff"; ctx.lineWidth = blade ? 7 : 5;
  ctx.beginPath(); pts.forEach(function (q2, k) { if (k) ctx.lineTo(q2.x, q2.y); else ctx.moveTo(q2.x, q2.y); }); ctx.stroke();
  if (blade) { ctx.strokeStyle = "#e0202a"; ctx.lineWidth = 2.5; ctx.stroke(); }
  ctx.restore();
}

// A cut: two red gashes where it landed, glistening, fading as it closes.
function drawCut(b) {
  var c = b.cut;
  if (!c || !b.alive) return;
  var k = Math.min(1, c.t / 0.6), r = b.r, cx = b.x + Math.cos(c.ang) * r * 0.62, cy = b.y + Math.sin(c.ang) * r * 0.62;
  var ta = c.ang + Math.PI / 2;
  ctx.save();
  ctx.beginPath(); ctx.arc(b.x, b.y, r, 0, Math.PI * 2); ctx.clip();
  ctx.globalAlpha = 0.9 * k; ctx.lineCap = "round";
  [-1, 1].forEach(function (s, i) {
    var ox = Math.cos(c.ang) * s * r * 0.1, oy = Math.sin(c.ang) * s * r * 0.1, L = r * (0.3 - i * 0.06);
    ctx.strokeStyle = "#5e0a0e"; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.moveTo(cx + ox - Math.cos(ta) * L, cy + oy - Math.sin(ta) * L); ctx.lineTo(cx + ox + Math.cos(ta) * L, cy + oy + Math.sin(ta) * L); ctx.stroke();
    ctx.strokeStyle = "#d0121c"; ctx.lineWidth = 2.6;
    ctx.beginPath(); ctx.moveTo(cx + ox - Math.cos(ta) * L, cy + oy - Math.sin(ta) * L); ctx.lineTo(cx + ox + Math.cos(ta) * L, cy + oy + Math.sin(ta) * L); ctx.stroke();
  });
  // A trickle running down from it.
  ctx.strokeStyle = "#c3121b"; ctx.lineWidth = 2.2;
  ctx.beginPath(); ctx.moveTo(cx, cy); ctx.quadraticCurveTo(cx + 2, cy + r * 0.2, cx - 1, cy + r * 0.38); ctx.stroke();
  ctx.restore();
}

// Sparks off a clean elbow; a big white slash on a crit.
function elbowSpark(self, other, ux, uy, crit, blade) {
  var cx = other.x - ux * other.r, cy = other.y - uy * other.r;
  other.flash = 0.16;
  if (crit) impacts.push({ x: cx, y: cy, nx: -ux, ny: -uy, life: 0.35, max: 0.35, color: blade ? "#e0202a" : "#ffffff" });
  for (var i = 0; i < (crit ? 14 : 6) && !reduceMotion; i++) {
    var a = Math.atan2(-uy, -ux) + (Math.random() - 0.5) * 2.2, s = 120 + Math.random() * (crit ? 300 : 160);
    particles.push({ x: cx, y: cy, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 0.25 + Math.random() * 0.2, max: 0.45, size: 1.6 + Math.random() * 2.4, color: blade ? (i % 2 ? "#e0202a" : "#f4f8fb") : (i % 3 ? "#ffffff" : "#ffd86b") });
  }
}

// ---------------------------------------------------------------- sound

function elbowAudio(fn) {
  try {
    var ac = getAudioCtx();
    if (!ac) return;
    if (ac.state === "suspended") ac.resume();
    fn(ac, ac.currentTime);
  } catch (e) { /* never let audio break the game */ }
}
// A short whip of air (a steel ring on top when there's a blade).
function playElbowSwish(blade) {
  elbowAudio(function (ac, t) {
    caneBurst(ac, t, blade ? 3800 : 1800, 1.1, 0.22, 0.09);
    if (blade) caneTone(ac, t, "sine", 2600, 3300, 0.06, 0.16);
  });
}
// A hard, bony crack; on a crit a sharper slice, on a blade a steel shing.
function playElbowHit(dealt, crit, blade) {
  playPunch(dealt);
  elbowAudio(function (ac, t) {
    caneBurst(ac, t, 2600, 2.4, crit ? 0.7 : 0.4, 0.05);
    caneTone(ac, t, "triangle", 620, 260, crit ? 0.35 : 0.2, 0.07);
    if (crit) caneBurst(ac, t + 0.02, 6200, 1.2, 0.35, 0.12);
    if (blade) { caneTone(ac, t, "sine", 3100, 2900, 0.18, 0.45); caneTone(ac, t, "sine", 4650, 4500, 0.08, 0.3); }
  });
}

// ---------------------------------------------------------------- gallery

// The fighter card's move list (gallery.js).
function elbowGalleryMoves(ch, add) {
  var e = ch.elbow;
  if (!e) return;
  var crit = e.critChance ? " " + e.critChance + "% are critical hits for " + e.critMult + "x (" + Math.round(e.damage * e.critMult) + ")" : "";
  var cut = e.cut ? ", and a crit opens a cut " + e.cut.chance + "% of the time: they bleed " + e.cut.dps + " a second for " + secs(e.cut.time) : "";
  add("💪", "Elbows", e.damage + " damage up close (" + e.reach + " reach), one every " + secs(e.cooldown) + "." + crit + cut + ".");
}
