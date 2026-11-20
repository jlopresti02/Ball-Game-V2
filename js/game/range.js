// Fighting range (Joe, 2026-11-19): fighters stop at striking range instead
// of rolling right into each other and ending up on top of each other.
//
// In ordinary movement a fighter never closes the gap (edge to edge) past
// his own fighting range: once he's there, the part of his heading that
// would take him further in turns into a step round them (same speed), and
// if he's well inside it he drifts back out. Rush-down fighters (Hokit,
// Ilia, anyone walking them down) hold it too; their punches and kicks
// still land, because his range sits inside his punch's reach.
//
// Up close is for grappling and the clinch. He's let in, all the way, when
// a close-range move of his is ready and due:
//   - a takedown shot (grapple.reach, once his grapple cooldown is up),
//   - the clinch (clinch.js, or the plum in knees.js; Jon's clinch steps
//     him in itself, jon-clinch.js),
//   - an elbow or a knee that's ready (elbows.js, knees.js),
//   - the first strike of a combination he's lined up (combos.js),
//   - anything a fighter's own code asks for with b.mvIn (movement.js).
// If he's been held at range for RG_STALL seconds he steps in once for
// RG_STEP seconds anyway, so close moves that live in a fighter's own file
// (Diaz's slap, Fedor reaching for the clinch, Hokit's stuff, Gane's shot)
// still get their moment.
//
// Everything that takes hold of him (grabs, clinches, slams, combos once
// they're running, specials, dashes, being sent flying) isn't ordinary
// movement, so none of this touches it: those still close right in.
//
// Opt-in tuning per fighter, in his character file:
//   "range": { "gap": 22 }   his own fighting range in px (default: half his
//                            punch reach, kept between RG_MIN and RG_MAX)
//   "range": { "off": true } he doesn't hold range at all
//
// Space (Joe, 2026-11-20): it isn't standing and trading the whole time.
// Once they've been in each other's range for RG_ENGAGE seconds, both back
// off to a wide gap (RG_WIDE px) and circle for RG_SPACE seconds, nobody
// stepping in, then they come back together. Only in ordinary movement, so
// a grab, clinch, combo or special that's already going keeps going.
"use strict";

var RG_MIN = 14;     // closest fighting range (px between the two bodies)
var RG_MAX = 26;     // furthest
var RG_PUNCH = 0.5;  // default range = this much of his punch's reach
var RG_BACK = 0.55;  // well inside his range (this much of it): drifts back out
var RG_STALL = 2.4;  // seconds held at range before he steps in once anyway
var RG_STEP = 0.55;  // how long that step in lasts
var RG_NEAR = 70;            // in each other's range: gap under this (px)
var RG_ENGAGE = [3.5, 6];    // seconds in range before they take some space
var RG_SPACE = [1.8, 3.0];   // how long the space lasts
var RG_WIDE = [100, 150];    // how far apart they back off to (px, edge to edge)
function rgRand(r) { return r[0] + Math.random() * (r[1] - r[0]); }

// The pair's clock (kept on the first fighter): fighting, or taking space.
function rangeSpaceTick(a, o, gap, dt) {
  var s = a.rgSp || (a.rgSp = { on: false, t: rgRand(RG_ENGAGE), wide: 0 });
  if (s.on) {
    s.t -= dt;
    if (s.t <= 0) { s.on = false; s.t = rgRand(RG_ENGAGE); }
    return;
  }
  if (gap > RG_NEAR) return;
  s.t -= dt;
  if (s.t > 0) return;
  // Not while either is tied up in something (it waits for the next free moment).
  if (!inOrdinaryMovement(a) || !inOrdinaryMovement(o)) { s.t = 0; return; }
  s.on = true; s.t = rgRand(RG_SPACE); s.wide = rgRand(RG_WIDE);
}
// Taking space right now: how wide, or 0.
function rangeSpace() {
  var s = balls[0] && balls[0].rgSp;
  return s && s.on ? s.wide : 0;
}

function rgCfg(b) { return (b.char && b.char.range) || null; }

// The gap he stops at.
function rangeGap(b) {
  var c = rgCfg(b);
  if (c && c.gap != null) return c.gap;
  var pu = b.char && b.char.hasPunch && b.char.punch;
  var g = pu && pu.reach ? pu.reach * RG_PUNCH : RG_MAX;
  return Math.max(RG_MIN, Math.min(RG_MAX, g));
}

// A close-range move of his that's ready: how far in it starts (px), or -1.
function rangeCloseReady(b, o) {
  var ch = b.char, r = -1;
  function take(x) { if (x != null && x >= 0 && (r < 0 || x < r)) r = x; }
  if (b.mvIn || b.rgIn > 0) return 0; // asked to step in (movement.js), or the stall step-in
  if (ch.hasGrapple && ch.grapple && b.grappleCd === 0 && !o.grappled && !o.sprawl && !o.sprawled) take(ch.grapple.reach);
  if (typeof clinchCfg === "function" && clinchCfg(b) && b.clinT != null && b.clinT <= 0) take(clN(b).range);
  if (typeof kneeCfg === "function" && kneeCfg(b)) {
    var kc = kneeCfg(b);
    if (kc.clinch && b.plumT != null && b.plumT <= 0) take(plumNums(b).range);
    if (b.kneeCd === 0) take(kneeNum(b, "reach"));
  }
  if (typeof elbowCfg === "function" && elbowCfg(b) && b.elbowCd === 0) take(elbowCfg(b).reach);
  if (ch.combos && b.cmbT != null && b.cmbT <= 0 && b.cmbNext && typeof COMBOS !== "undefined" && COMBOS[b.cmbNext]) {
    take(cbReach(b, COMBOS[b.cmbNext][0]));
  }
  return r;
}

// Before he moves each physics step (physics.js): keeps him at his range.
function holdRange(b, o, dt) {
  if (!b.alive || !o || !o.alive || !started || over) return;
  var c = rgCfg(b);
  if (c && c.off) return;
  if (b.rgIn > 0) b.rgIn = Math.max(0, b.rgIn - dt);
  if (b.id === 0 && !inOrdinaryMovement(b) && b.rgSp && b.rgSp.on) rangeSpaceTick(b, o, 0, dt); // (the space runs out while he's busy too)
  if (!inOrdinaryMovement(b) || b.dizzy || o.koOut) { b.rgHeld = 0; return; }
  if (typeof specialBusy === "function" && (specialBusy(b) || specialBusy(o))) { b.rgHeld = 0; return; }
  var dx = o.x - b.x, dy = o.y - b.y, d = Math.sqrt(dx * dx + dy * dy);
  if (d === 0) return;
  var gap = d - b.r - o.r, want = rangeGap(b);
  if (b.id === 0) rangeSpaceTick(b, o, gap, dt);
  var wide = rangeSpace();
  if (wide) { spaceOut(b, o, dx, dy, d, gap, wide); b.rgHeld = 0; b.rgIn = 0; return; }
  var ready = rangeCloseReady(b, o);
  if (ready >= 0) want = Math.min(want, ready * 0.5);
  if (gap > want + 6) { b.rgHeld = Math.max(0, (b.rgHeld || 0) - dt); return; }
  // Held at range a while: one step in.
  b.rgHeld = (b.rgHeld || 0) + dt;
  if (b.rgHeld >= RG_STALL && !(b.rgIn > 0)) { b.rgIn = RG_STEP; b.rgHeld = 0; return; }
  if (gap >= want) return;
  var nx = dx / d, ny = dy / d;
  var sp = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
  if (sp < 1) return;
  var vn = b.vx * nx + b.vy * ny;
  // (never backing off one stepping in for a grab or the clinch: he lets it come)
  var deep = gap < want * RG_BACK && rangeCloseReady(o, b) < 0;
  if (vn <= 0 && !deep) return; // already heading out or round them
  // Round them: the sideways part of his heading (or his side, head on).
  var tx = b.vx - vn * nx, ty = b.vy - vn * ny, tl = Math.sqrt(tx * tx + ty * ty);
  if (tl < sp * 0.05) { var s = b.id === 0 ? 1 : -1; tx = -ny * s; ty = nx * s; tl = 1; }
  tx /= tl; ty /= tl;
  // Well inside it: drift back out as he goes round.
  var out = deep ? 0.6 : 0;
  var hx = tx - nx * out, hy = ty - ny * out, hl = Math.sqrt(hx * hx + hy * hy) || 1;
  b.vx = hx / hl * sp; b.vy = hy / hl * sp;
}

// Taking space: backs out to the wide gap on an angle, then circles there.
function spaceOut(b, o, dx, dy, d, gap, wide) {
  if (gap >= wide) {
    // Out there: never heads back in, just round them.
    var nx0 = dx / d, ny0 = dy / d, vn0 = b.vx * nx0 + b.vy * ny0;
    if (vn0 <= 0) return;
    var sp0 = Math.sqrt(b.vx * b.vx + b.vy * b.vy), tx0 = b.vx - vn0 * nx0, ty0 = b.vy - vn0 * ny0, tl0 = Math.sqrt(tx0 * tx0 + ty0 * ty0);
    if (tl0 < 1) { var s0 = b.id === 0 ? 1 : -1; tx0 = -ny0 * s0; ty0 = nx0 * s0; tl0 = 1; }
    b.vx = tx0 / tl0 * sp0; b.vy = ty0 / tl0 * sp0;
    return;
  }
  var nx = dx / d, ny = dy / d;
  var sp = Math.max(Math.sqrt(b.vx * b.vx + b.vy * b.vy), MIN_SPEED);
  var vn = b.vx * nx + b.vy * ny;
  var tx = b.vx - vn * nx, ty = b.vy - vn * ny, tl = Math.sqrt(tx * tx + ty * ty);
  if (tl < sp * 0.05) { var s = b.id === 0 ? 1 : -1; tx = -ny * s; ty = nx * s; tl = 1; }
  tx /= tl; ty /= tl;
  // Mostly straight back while close, more round them as he gets out there.
  var out = gap < wide * 0.6 ? 1.6 : 0.7;
  var hx = tx - nx * out, hy = ty - ny * out, hl = Math.sqrt(hx * hx + hy * hy) || 1;
  b.vx = hx / hl * sp; b.vy = hy / hl * sp;
}
