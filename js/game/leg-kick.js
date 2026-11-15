// Leg kicks (Christian, 2026-11-14): a low kick into the calf that leaves
// them limping. One kick for any fighter, not just one: Dustin's calf kicks
// (they used to live in conor.js, for his fights with Conor only), Alex
// Pereira's kicks and Jon Jones's oblique kick all share it.
//
// A fighter opts in with a "legKick" block in its character file. Every key
// can be left out (the defaults are in LEG_KICK_DEFAULTS). Two ways to throw it:
//
//  - Its own kick, on its own clock (Dustin Poirier): every `every` seconds
//    (the first after `first`), once they're inside `range` (edge to edge)
//    and he's free, he plants, draws the leg back (`chamber` seconds: the
//    tell, a dashed line shows the path), whips it down and round low into
//    their calf (`sweep`, with a swoosh behind the foot) and brings it back
//    (`recover`, rolling and punching again meanwhile). If they've got
//    further than `reach` away (edge to edge) by the time the foot gets
//    there: "WHIFF".
//  - `onKick` true (Alex Pereira): the fighter's regular kick (the kick
//    ability, abilities.js) IS the leg kick. It's drawn low into the calf and
//    every one that lands leaves the limp. No clock of its own, so `every`,
//    `range`, `damage`, the timings and `checkable` don't apply (the regular
//    kick's own numbers and check do).
//
// When it lands: `damage` (it hurts as a "kick", so it can be slipped,
// blocked or side stepped like any kick), "CALF KICK!" (`text`), a hit mark
// on the calf, and the limp: they roll at `slow` times their speed for
// `time` seconds (slowdown.js, kind "limp"). With `stack` set, a kick that
// lands while they're still limping slows them `stack` more, down to
// `minSlow`, with at most `maxStacks` kicks piled up ("CALF KICK x2!"). With
// `stack` 0 a fresh kick just starts the limp over. With `buckle`, the kick
// that piles up the `buckle.at`th makes the leg give out: "LEG'S GONE!"
// (`buckle.text`), and for `buckle.time` seconds they sag onto it and
// hobble at `buckle.slow` (kind "buckle").
//
// Kick checks: with `checkable` on, a fighter that checks kicks (the
// Kicker's `kick.checkChance`, or `kickCheck`, e.g. Ilia) checks it like any
// kick (tryCheckKick, abilities.js): no damage, no limp, the kicker is stuck
// planted on that leg and they answer.
//
// The limp look, on whoever's limping (from any leg kick, and Jon Jones's
// oblique kick): on every bad step they dip and lean onto the kicked leg,
// harder the more kicks are piled up (`limpDip` sets how hard, 0 = no dip),
// and the kicked leg hangs out under them with a throbbing bruise on the
// calf (`bruise`, its colour), bigger the more kicks are piled up.
//
// `vs` holds overrides by opponent id, for rivalries: any key above, only
// against that fighter. Dustin's block:
//   "legKick": { "first": [2, 4], "every": [3, 5], "range": 56, "reach": 90, "damage": 7,
//     "slow": 0.8, "time": 4.5, "stack": 0.1, "maxStacks": 3, "minSlow": 0.6,
//     "vs": { "c-conor-mcgregor": { "every": [1.5, 3], "damage": 12,
//       "slow": 0.65, "time": 7, "minSlow": 0.45,
//       "buckle": { "at": 3, "slow": 0.2, "time": 1.2 } } } }
// and Alex Pereira's: "legKick": { "onKick": true, "slow": 0.6, "time": 3 }.
//
// The API, for a fighter's own kick:
//   legKickLimp(v, c, from, shout)  the limp on v. c has `slow` and `time`
//                         (or Jon's `slowTime`) and any of stack, maxStacks,
//                         minSlow, buckle, limpDip, bruise, text; `from` is
//                         the kicker (the bruise goes on the side nearest
//                         him); `shout` puts up the CALF KICK text. Returns
//                         how many kicks are piled up. Jon's oblique kick
//                         (jon-clinch.js) uses it.
//   legKickOnKick(self, o)  from the regular kick landing (abilities.js).
//   isLegKick(atk, source)  true while atk's hit is a leg kick (Conor takes
//                         `calfKicksHurt` times the damage from them, conor.js).
//   drawLegKickOnKick(self, o)  from drawKick (draw-attacks.js): true if
//                         it's a leg kick (then drawLegKicksOver draws it).
// A fighter with no "legKick" block kicks exactly as before (no extra
// random rolls). The kick runs on b.lk: { t, hit, landed, checked, side, vicId }.
"use strict";

var LEG_KICK_DEFAULTS = { onKick: false, first: null, every: [5, 8], range: 40, reach: 80, damage: 8,
  chamber: 0.1, sweep: 0.07, recover: 0.23, slow: 0.75, time: 2.5, stack: 0, maxStacks: 3, minSlow: 0.5,
  buckle: null, checkable: true, text: "CALF KICK!", size: 1, color: "#ffd21f", limpDip: 1, bruise: "#7b2d8e" };
var LK_STEP = 2.1;    // limping steps a second (every other one is the bad one)
var LK_MARK = 0.24;   // how long the hit mark stays on the calf
var lkClock = 0, lkFrame = 0;
var lkLanding = null; // the kicker, while his leg kick's damage is going in (isLegKick)

function lkRand(r) { return typeof r === "number" ? r : r[0] + Math.random() * (r[1] - r[0]); }
function lkGap(a, b) { var dx = b.x - a.x, dy = b.y - a.y; return (Math.sqrt(dx * dx + dy * dy) || 1) - a.r - b.r; }
function lkVs(c, o) {
  if (!c.vs || !o || !o.char) return null;
  var id = String(o.char.id || "");
  for (var k in c.vs) if (id.indexOf(k) === 0) return c.vs[k];
  return null;
}
// b's leg kick settings against o: the defaults, b's block, then its `vs`
// entry for o. Null if b has no "legKick" block.
function legKickCfg(b, o) {
  var c = b && b.char && b.char.legKick;
  if (!c) return null;
  var vs = lkVs(c, o);
  if (b.lkc && b.lkc.src === c && b.lkc.vs === vs) return b.lkc.cfg;
  var out = {}, k;
  for (k in LEG_KICK_DEFAULTS) out[k] = LEG_KICK_DEFAULTS[k];
  for (k in c) if (k !== "vs") out[k] = c[k];
  if (vs) for (k in vs) out[k] = vs[k];
  b.lkc = { src: c, vs: vs, cfg: out };
  return out;
}

// ---------------------------------------------------------------- the kick

function lkCanStart(self, other) {
  if (!other.alive || other.koOut || other.invincible || other.igbb || other.grappled || other.slam) return false;
  if (self.punch || self.kick || self.koPunch || self.swing || self.throwAnim || self.igbb || self.checkStun > 0 || self.checkAnim) return false;
  return !specialBusy(self) && !specialBusy(other) && inOrdinaryMovement(self) && !swordDuelActive();
}
// Planted while the leg goes out: the speed regulator leaves him alone (physics.js).
function legKickBusy(b) { return !!(b && b.lk && !b.lk.hit); }
function lkStopped(self, k) {
  return !self.alive || self.koOut || self.grappled || self.slam || self.shocked || self.dazed || self.dizzy || (self.checkStun > 0 && !k.checked);
}

// From the abilities loop, with the other kicks. True while the leg's going
// out (he's planted and throws nothing else); once it lands he rolls again
// and can punch while it comes back down.
function updateLegKick(self, other, dt) {
  var c = legKickCfg(self, other);
  if (!c || c.onKick) return false;
  var k = self.lk;
  if (!k) {
    if (self.lkT == null) self.lkT = lkRand(c.first || c.every);
    if (!started || over) return false;
    if (self.lkT > 0) self.lkT -= dt * (self.atkRate || 1);
    if (self.lkT > 0 || lkGap(self, other) > c.range || !lkCanStart(self, other)) return false;
    self.lk = k = { t: 0, hit: false, landed: false, checked: false, side: Math.random() < 0.5 ? -1 : 1, vicId: other.id, frame: lkFrame };
    playWhoosh();
  }
  if (over || lkStopped(self, k)) { endLegKick(self, c); return false; }
  k.frame = lkFrame;
  k.t += dt;
  if (!k.hit) { var damp = Math.exp(-14 * dt); self.vx *= damp; self.vy *= damp; } // planted on the standing leg
  if (!k.hit && k.t >= c.chamber + c.sweep) {
    k.hit = true;
    landLegKick(self, other, c, k);
    if (self.alive && inOrdinaryMovement(self)) setSpeed(self, (self.baseSpeed || SPEED) * slowMult(self)); // rolling again
  }
  if (k.t >= c.chamber + c.sweep + c.recover) { endLegKick(self, c); return false; }
  return !k.hit;
}
function endLegKick(b, c) { b.lk = null; b.lkT = lkRand(c.every); }

// The foot gets to their calf: checked, a whiff, or it lands.
function landLegKick(self, other, c, k) {
  if (!other.alive || other.koOut || other.igbb || specialBusy(other)) return;
  if (lkGap(self, other) > c.reach) { floater(other.x, other.y - other.r - 8, "WHIFF", "dodge"); return; }
  if (c.checkable && tryCheckKick(other, self)) { k.checked = true; return; } // shin up: no damage (abilities.js)
  lkLanding = self;
  var dealt = hurt(other, c.damage, "kick", self.id);
  lkLanding = null;
  if (dealt > 0) {
    k.landed = true;
    playKick();
    var at = lkLegAt(self, other, c, k.side);
    impacts.push({ x: at.calf.x, y: at.calf.y, nx: -at.ux, ny: -at.uy, life: 0.3, max: 0.3, color: c.color });
    legKickLimp(other, c, self, true);
    if (!reduceMotion) shake = Math.max(shake, 8);
  }
  checkEnd();
}

// From the regular kick landing (abilities.js): the limp, when this
// fighter's kicks are leg kicks (`onKick`).
function legKickOnKick(self, other) {
  var c = legKickCfg(self, other);
  if (!c || !c.onKick || !other.alive || other.justDodged) return;
  if (self.kick) self.kick.lkLanded = true; // (the hit mark on the calf)
  legKickLimp(other, c, self, true);
}

// True while atk's hit is a leg kick.
function isLegKick(atk, source) {
  if (!atk) return false;
  if (lkLanding === atk) return true;
  var c = atk.char && atk.char.legKick;
  return !!(c && c.onKick && (source === "kick" || source === "kickback"));
}

// The limp: slowed, piled up, maybe the leg giving out. Returns how many
// kicks are piled up.
function legKickLimp(v, c, from, shout) {
  if (!v || !v.alive) return 0;
  var old = slowedBy(v, "limp"), had = old ? old.stacks || 1 : 0, stack = c.stack || 0, n = 1;
  if (old && stack > 0) n = Math.min(Math.max(1, c.maxStacks || LEG_KICK_DEFAULTS.maxStacks), had + 1);
  var slow = c.slow != null ? c.slow : LEG_KICK_DEFAULTS.slow;
  var mult = n > 1 ? Math.max(c.minSlow != null ? c.minSlow : 0, slow - (n - 1) * stack) : slow;
  var time = c.time != null ? c.time : (c.slowTime || 2);
  var text = c.text || LEG_KICK_DEFAULTS.text;
  if (shout && n > had) floater(v.x, v.y - v.r - 30, n > 1 ? text + " x" + n : text, "note");
  addSlow(v, mult, time, "limp");
  var s = slowedBy(v, "limp");
  if (!s) return 0;
  s.stacks = n;
  s.side = from && from.x > v.x ? 1 : -1;
  s.dip = c.limpDip != null ? c.limpDip : 1;
  s.bruise = c.bruise || LEG_KICK_DEFAULTS.bruise;
  var bk = c.buckle;
  if (bk && n >= (bk.at || 3) && had < (bk.at || 3)) {
    floater(v.x, v.y - v.r - 54, bk.text || "LEG'S GONE!", "crit");
    addSlow(v, bk.slow != null ? bk.slow : 0.25, bk.time || 1, "buckle");
    var b2 = slowedBy(v, "buckle");
    if (b2) b2.side = s.side;
    crowdReact(0.4);
    if (!reduceMotion) shake = Math.max(shake, 12);
  }
  return n;
}

// From update(), every frame: a leg kick the abilities loop didn't get to
// this frame (something else took him over) is dropped; the limp's step.
function tickLegKicks(dt) {
  lkClock += dt;
  balls.forEach(function (b) {
    if (b.lk && b.lk.frame !== lkFrame) endLegKick(b, legKickCfg(b, balls[1 - b.id]) || LEG_KICK_DEFAULTS);
  });
  lkFrame++;
}

// ---------------------------------------------------------------- drawing

function lkEaseIn(u) { u = Math.max(0, Math.min(1, u)); return u * u; }
// A point on the swing's curve, cock (u = 0) to calf (u = 1).
function lkCurve(L, u) {
  var a = 1 - u;
  return { x: a * a * L.cock.x + 2 * a * u * L.ctrl.x + u * u * L.calf.x, y: a * a * L.cock.y + 2 * a * u * L.ctrl.y + u * u * L.calf.y };
}
// Where the kick is: his hip, the leg drawn back (cock), the bend of the
// swing (ctrl) and their calf, which it never reaches past `reach`. The leg
// goes out from the side of him facing them, low, into the near side of
// their calf. Side by side, the swing bends down toward the mat; with one
// of them above the other, it bends out to the kick's side, so the leg
// comes round outside them both.
function lkLegAt(b, o, c, side, reach) {
  var dx = o.x - b.x, dy = o.y - b.y, d = Math.sqrt(dx * dx + dy * dy) || 1, ux = dx / d;
  var flat = Math.abs(ux) > 0.4, sx = flat ? (ux > 0 ? 1 : -1) : side, r = b.r;
  var hip = { x: b.x + sx * r * (flat ? 0.55 : 0.72), y: b.y + r * (flat ? 0.55 : 0.4) };
  var calf = { x: o.x + (flat ? -sx : sx) * o.r * 0.62, y: o.y + o.r * 0.58 };
  var hx = calf.x - hip.x, hy = calf.y - hip.y, hl = Math.sqrt(hx * hx + hy * hy) || 1;
  var max = reach || (r * 0.6 + (c.reach || 80) + 10);
  if (hl > max) { calf = { x: hip.x + hx / hl * max, y: hip.y + hy / hl * max }; hl = max; }
  var ex = hx / hl, ey = hy / hl, qx = -ey, qy = ex;
  if (qx * (flat ? 0 : sx) + qy * (flat ? 1 : 0.3) < 0) { qx = -qx; qy = -qy; }
  var cock = { x: hip.x - ex * r * 0.5 + qx * r * 0.3, y: hip.y - ey * r * 0.5 + qy * r * 0.3 };
  var ctrl = { x: (cock.x + calf.x) / 2 + qx * hl * 0.5, y: (cock.y + calf.y) / 2 + qy * hl * 0.5 };
  return { hip: hip, calf: calf, cock: cock, ctrl: ctrl, rest: { x: hip.x + qx * r * 0.1, y: hip.y + r * 0.3 }, ux: ex, uy: ey, qx: qx, qy: qy, len: hl };
}

// The kick at time t: drawn back (the tell), the swing, the foot held on the
// calf, back down. ch/sw/rc are the three parts' lengths.
function lkDrawKick(b, o, t, ch, sw, rc, side, c, landed, reach, sc) {
  var L = lkLegAt(b, o, c, side, reach), r = b.r, foot, s = 0, phase;
  var lerp = function (p, q, u) { return { x: p.x + (q.x - p.x) * u, y: p.y + (q.y - p.y) * u }; };
  if (t < ch) { phase = "chamber"; foot = lerp(L.rest, L.cock, easeOut(t / ch)); }
  else if (t < ch + sw) { phase = "sweep"; s = lkEaseIn((t - ch) / sw) * 0.55 + (t - ch) / sw * 0.45; foot = lkCurve(L, s); }
  else {
    phase = "recover";
    var e = (t - ch - sw) / Math.max(0.01, rc);
    foot = e < 0.3 ? L.calf : lerp(L.calf, L.rest, easeOut((e - 0.3) / 0.7));
  }
  ctx.save();
  ctx.lineCap = "round"; ctx.lineJoin = "round";
  if (phase === "chamber") {
    // The tell: the path it's about to take, dashed.
    ctx.globalAlpha = 0.75 * Math.min(1, t / (ch * 0.5));
    ctx.setLineDash([8, 6]); ctx.strokeStyle = c.color; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(L.cock.x, L.cock.y); ctx.quadraticCurveTo(L.ctrl.x, L.ctrl.y, L.calf.x, L.calf.y); ctx.stroke();
    ctx.setLineDash([]); ctx.globalAlpha = 1;
  }
  var tail = phase === "sweep" ? s : (phase === "recover" && t - ch - sw < 0.08 ? 1 : -1);
  if (tail > 0) {
    // The swoosh behind the foot, along the swing.
    var fade = phase === "recover" ? 1 - (t - ch - sw) / 0.08 : 1, s0 = Math.max(0, tail - 0.6), N = 10;
    for (var i = 1; i <= N; i++) {
      var p0 = lkCurve(L, s0 + (tail - s0) * (i - 1) / N), p1 = lkCurve(L, s0 + (tail - s0) * i / N), k = i / N;
      ctx.globalAlpha = (0.12 + 0.6 * k) * fade;
      ctx.strokeStyle = c.color; ctx.lineWidth = (3 + 13 * k) * sc;
      ctx.beginPath(); ctx.moveTo(p0.x, p0.y); ctx.lineTo(p1.x, p1.y); ctx.stroke();
    }
    // A white streak down the middle of it, just behind the foot.
    ctx.globalAlpha = 0.8 * fade; ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 2;
    ctx.beginPath();
    for (var j = 0; j <= 5; j++) { var pw = lkCurve(L, Math.max(0, tail - 0.3) + Math.min(0.3, tail) * j / 5); if (j) ctx.lineTo(pw.x, pw.y); else ctx.moveTo(pw.x, pw.y); }
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
  // The leg: hip, a soft knee bending toward the mat, the foot.
  var knee = { x: (L.hip.x + foot.x) / 2 + L.qx * r * 0.18, y: (L.hip.y + foot.y) / 2 + L.qy * r * 0.18 };
  drawBjjLeg(b.char, L.hip, knee, foot, r * 0.16 * sc, 0.5 * side, r * 0.24 * sc);
  // The hit mark on their calf.
  var since = t - ch - sw;
  if (landed && since >= 0 && since < LK_MARK) lkDrawMark(L.calf.x, L.calf.y, since / LK_MARK, c.color, o.r / 40);
  ctx.restore();
}

// A star burst where the shin hits the calf.
function lkDrawMark(x, y, e, color, sc) {
  var a = 1 - e, R = (12 + 16 * easeOut(e)) * sc;
  ctx.save();
  ctx.globalAlpha = a;
  ctx.fillStyle = "#ffffff";
  ctx.beginPath(); ctx.arc(x, y, (10 - 5 * e) * sc, 0, Math.PI * 2); ctx.fill();
  ctx.lineCap = "round";
  for (var i = 0; i < 8; i++) {
    var ang = i / 8 * Math.PI * 2 + 0.2, len = i % 2 ? R * 0.7 : R;
    [["#ffffff", 5], [color, 2.5]].forEach(function (st) {
      ctx.strokeStyle = st[0]; ctx.lineWidth = st[1] * sc;
      ctx.beginPath(); ctx.moveTo(x + Math.cos(ang) * R * 0.38, y + Math.sin(ang) * R * 0.38); ctx.lineTo(x + Math.cos(ang) * len, y + Math.sin(ang) * len); ctx.stroke();
    });
  }
  ctx.restore();
}

// From drawKick (draw-attacks.js): a regular kick that's a leg kick isn't
// drawn there (it's drawn over both fighters, below). True if it's one.
function drawLegKickOnKick(self, other) {
  var c = legKickCfg(self, other);
  return !!(c && c.onKick && self.kick);
}

// From draw.js, over both fighters (so the leg and the hit mark show in
// front of whoever it's kicking): every leg kick that's out, on its own
// clock or a regular kick that's a leg kick (on the regular kick's timing).
function drawLegKicksOver() {
  balls.forEach(function (b) {
    var o = balls[1 - b.id];
    if (!b.alive || !o) return;
    var k = b.lk, c;
    if (k) {
      c = legKickCfg(b, balls[k.vicId]);
      if (c) lkDrawKick(b, balls[k.vicId], k.t, c.chamber, c.sweep, c.recover, k.side, c, k.landed, null, c.size || 1);
      return;
    }
    c = legKickCfg(b, o);
    if (!c || !c.onKick || !b.kick || !o.alive || b.taunt || b.flow || b.combo) return; // (as drawKick)
    var ki = b.char.kick, hitAt = ki.speed * 0.35;
    lkDrawKick(b, o, b.kick.t, hitAt * 0.55, hitAt * 0.45, ki.speed - hitAt, b.id === 0 ? 1 : -1, c,
      !!b.kick.lkLanded, b.r * 0.6 + ki.reach + 10, (ki.size || 15) / 15 * (c.size || 1));
  });
}

// From draw.js, last of the body poses (before the body is drawn): a
// limping fighter dips and leans onto the kicked leg on every bad step, and
// the leg hangs out under them, bruised. A leg that's just given out
// ("buckle") sags them right down onto it.
function applyLegKickLimp(b) {
  if (!b.alive || !b.slows || !b.slows.length) return;
  var lp = slowedBy(b, "limp"), bk = slowedBy(b, "buckle");
  if (!lp && !bk) return;
  if (b.grappled || b.grapple || b.slam || b.koOut || b.igbb || b.guard || b.sprawled || subLocked(b) || b.choked) return;
  var src = lp || bk, side = src.side || -1, stacks = (lp && lp.stacks) || 1;
  var show = Math.min(1, src.t / 0.4) * Math.min(1, (src.max - src.t) / 0.12);
  var depth = (lp && lp.dip != null ? lp.dip : 1) * (0.8 + 0.25 * (stacks - 1));
  var cyc = (lkClock * LK_STEP + b.id * 0.5) % 1;
  var amt = (cyc < 0.42 ? Math.sin(cyc / 0.42 * Math.PI) : 0) * depth * show;
  if (bk) amt = Math.max(amt, 1.8 * Math.min(1, (bk.max - bk.t) / 0.12) * Math.min(1, bk.t / 0.3));
  // Lean onto the bad leg, pivoting on the mat under them, and sink.
  var ax = b.x, ay = b.y + b.r;
  ctx.translate(ax, ay); ctx.rotate(side * 0.22 * amt); ctx.scale(1 + 0.04 * amt, 1 - 0.09 * amt); ctx.translate(-ax, -ay);
  lkDrawHurtLeg(b, side, amt, show, stacks, (lp && lp.bruise) || LEG_KICK_DEFAULTS.bruise);
}

// The kicked leg hanging out under them (drawn before the body, so the ball
// covers the top of it), dragging behind as they roll, the bruise throbbing,
// and a scuff of dust off the foot on the bad step.
function lkDrawHurtLeg(b, side, amt, show, stacks, bruise) {
  var r = b.r, sp = Math.sqrt(b.vx * b.vx + b.vy * b.vy) || 1, drag = Math.min(1, sp / 200);
  var hip = { x: b.x + side * r * 0.5, y: b.y + r * 0.78 };
  var foot = { x: hip.x + side * r * (0.42 - 0.08 * amt) - b.vx / sp * r * 0.18 * drag, y: hip.y + r * (0.62 - 0.12 * amt) };
  var knee = { x: (hip.x + foot.x) / 2 + side * r * (0.16 + 0.1 * amt), y: (hip.y + foot.y) / 2 - r * 0.02 };
  ctx.save();
  var a0 = Math.min(1, show * 1.5);
  if (amt > 0.25) {
    // dust kicked up off the dragging foot
    ctx.fillStyle = "rgba(150,140,125,0.55)";
    ctx.globalAlpha = a0 * Math.min(1, (amt - 0.25) * 2);
    for (var k = 0; k < 3; k++) {
      ctx.beginPath(); ctx.arc(foot.x + b.vx / sp * r * (0.15 + 0.17 * k), foot.y + r * (0.08 - 0.05 * k), r * (0.1 - 0.02 * k) * (0.6 + 0.6 * amt), 0, Math.PI * 2); ctx.fill();
    }
  }
  ctx.globalAlpha = a0;
  drawBjjLeg(b.char, hip, knee, foot, r * 0.16, -0.5 * side, r * 0.24);
  // The bruise on the calf: throbbing, bigger and darker with more kicks piled up.
  var cx = knee.x + (foot.x - knee.x) * 0.45, cy = knee.y + (foot.y - knee.y) * 0.45;
  var pulse = 0.5 + 0.5 * Math.sin(lkClock * 11 + b.id), br = r * (0.12 + 0.03 * Math.min(3, stacks)) * (0.9 + 0.15 * pulse);
  ctx.globalAlpha = a0 * (0.8 + 0.2 * pulse);
  ctx.fillStyle = bruise;
  ctx.beginPath(); ctx.ellipse(cx, cy, br, br * 0.8, 0.4 * side, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = "#d0203a"; ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.ellipse(cx, cy, br * 1.25, br * 1.05, 0.4 * side, 0, Math.PI * 2); ctx.stroke();
  // Throb lines off it on the bad step.
  if (amt > 0.3) {
    ctx.globalAlpha = Math.min(1, show) * Math.min(1, amt);
    ctx.strokeStyle = "#d0203a"; ctx.lineWidth = 3; ctx.lineCap = "round";
    for (var i = -1; i <= 1; i++) {
      var a = Math.PI / 2 + side * (0.9 + i * 0.55);
      ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * br * 1.6, cy + Math.sin(a) * br * 1.6); ctx.lineTo(cx + Math.cos(a) * br * 2.6, cy + Math.sin(a) * br * 2.6); ctx.stroke();
    }
  }
  ctx.restore();
}

// ---------------------------------------------------------------- the fighter card

function legKickGalleryMoves(ch, add) {
  var c = ch.legKick;
  if (!c) return;
  var v = function (o, k) { return o && o[k] != null ? o[k] : (c[k] != null ? c[k] : LEG_KICK_DEFAULTS[k]); };
  var pct = function (x) { return Math.round(x * 100) + "%"; };
  var limp = function (o) {
    var st = v(o, "stack"), s = "a limp to " + pct(v(o, "slow")) + " speed for " + secs(v(o, "time"));
    if (st > 0) s += "; each one that lands while they're still limping takes " + pct(st) + " more, down to " + pct(v(o, "minSlow"));
    var bk = v(o, "buckle");
    if (bk) s += ". Pile up " + (bk.at || 3) + " and the leg gives out (" + (bk.text || "LEG'S GONE!") + ": " + pct(bk.slow != null ? bk.slow : 0.25) + " speed for " + secs(bk.time || 1) + ")";
    return s;
  };
  if (c.onKick) add("🦵", "Calf kicks", "His kicks land low on the calf: " + limp(null) + ".");
  else {
    var ev = v(null, "every");
    add("🦵", "Calf kicks", "Every " + ev[0] + "-" + ev[1] + "s up close he whips a kick round low into their calf (" + v(null, "damage") + "): " + limp(null) + "." + (v(null, "checkable") ? " Fighters who check kicks can check it." : ""));
  }
  if (c.vs) Object.keys(c.vs).forEach(function (id) {
    var o = c.vs[id], foe = typeof findChar === "function" ? findChar(id) : null, ev2 = v(o, "every");
    add("🦵", "vs " + (foe ? foe.name : id), "Every " + ev2[0] + "-" + ev2[1] + "s, " + v(o, "damage") + " damage, " + limp(o) + ".");
  });
}
