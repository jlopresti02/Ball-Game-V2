// Ciryl Gane, "Bon Gamin" (Christian, 2026-11-15): a back-foot kickboxer
// with his hands down. Everything is in the "gane" block of his character
// file (leave a key out and that part is off), plus the shared blocks he
// opts into: a fast, light `punch` (the jab, his main weapon), `hooks` with
// `over` (one punch in a few is a looping overhand, hook-punch.js), `kick`
// (the Kicker's kick, coming round often), `legKick` (calf kicks,
// leg-kick.js) and the weave (`hasWeave`, weave.js: he slips shots at range).
//
// Hands down  (handsDown) his gloves hang by his hips, even while he jabs:
//             no guard (blockChance 0).
// Chin        (chin) with them that low, `critChance`% of the strikes in
//             `sources` that land on him are critical hits for `critMult`x
//             ("CRIT!").
// Up close    inside `close` (edge to edge) his weave works `closeWeave` times
//             as often, and strikes do `closeHurt` times the damage: pressure
//             fighters and combinations are his bad nights.
// Shots in    (shotsIn) a Grappler's grabs come round `shotsIn` times as fast
//             against him: takedowns get in on him easily.
// Footwork    (footwork) he fights going backwards. When they come inside
//             `keep` (or come charging faster than `closing`), he backs off at
//             an angle off straight back (`angle`, a fresh side each time) for
//             `outTime` seconds or until he's `outGap` away, then circles off
//             to the side at range. Out past `press` he steps back in to the
//             end of his kick, fires as he arrives (`fireIn`: the kick or the
//             jab, whichever's ready within `ready` seconds) and backs out
//             again. As they come charging in, a kick or a calf kick that's
//             nearly ready goes off as they arrive. Never backs into the cage:
//             inside `wall` of it he slides along it.
// The footwork runs on b.gn: { mode: "out" | "set" | "in", t, dur, goal, ang, side }.
"use strict";

var GN_STRIKES = { punch: true, jab: true, kick: true, kickback: true, elbow: true, knee: true, combo: true, swing: true, teep: true, kopunch: true, hook: true };
var ganeClock = 0;

function ganeCfg(b) { return b && b.char && b.char.gane; }
function gnRand(r) { return typeof r === "number" ? r : r[0] + Math.random() * (r[1] - r[0]); }
function gnGap(a, b) { var dx = b.x - a.x, dy = b.y - a.y; return (Math.sqrt(dx * dx + dy * dy) || 1) - a.r - b.r; }
function gnTurn(a, want, maxStep) { var d = Math.atan2(Math.sin(want - a), Math.cos(want - a)); return a + Math.max(-maxStep, Math.min(maxStep, d)); }

// ---------------------------------------------------------------- footwork

function gnRoom(x, y, a, look) {
  var px = x + Math.cos(a) * look, py = y + Math.sin(a) * look;
  return Math.min(px, W - px, py, H - py);
}
// Backing up into the cage: slide along it instead, whichever way has more room.
function gnWallSafe(b, want, to, f) {
  var look = f.wall || 70;
  if (gnRoom(b.x, b.y, want, look) > b.r) return want;
  var best = want, bestRoom = -1e9;
  [to + Math.PI - 0.6, to + Math.PI + 0.6, to + Math.PI / 2, to - Math.PI / 2, to + Math.PI * 0.7, to - Math.PI * 0.7].forEach(function (a) {
    var room = gnRoom(b.x, b.y, a, look);
    if (room > bestRoom) { bestRoom = room; best = a; }
  });
  return best;
}
function gnOut(s, f, charge) {
  s.mode = "out"; s.t = 0; s.dur = gnRand(f.outTime || [0.5, 1]); s.goal = gnRand(f.outGap || [90, 120]);
  s.ang = gnRand(f.angle || [0.35, 0.9]) + (charge ? 0.25 : 0);
  s.side = s.side ? (Math.random() < 0.7 ? -s.side : s.side) : (Math.random() < 0.5 ? -1 : 1);
}
// Kick (or jab) now if it's nearly ready and they're in range.
function gnFire(b, gap, f) {
  var ready = f.ready || 0.6, ki = b.char.hasKick ? b.char.kick : null, pu = b.char.hasPunch ? b.char.punch : null;
  if (b.punch || b.kick || b.cmb || b.lk) return false;
  if (ki && gap < ki.reach && b.kickCd <= ready) { b.kickCd = 0; return true; }
  var lc = legKickCfg(b, balls[1 - b.id]);
  if (lc && !lc.onKick && gap < lc.range && b.lkT != null && b.lkT <= ready) { b.lkT = 0; return true; }
  if (pu && gap < pu.reach && b.punchCd <= ready) { b.punchCd = 0; return true; }
  return false;
}

function gnFootwork(b, o, f, dt) {
  if (!started || over || !o || !o.alive || o.koOut || !inOrdinaryMovement(b) || b.dizzy || b.angry || b.cmb || b.cheater) return;
  var s = b.gn || (b.gn = { mode: "set", t: 0, dur: 0.3, side: 0 });
  s.t += dt;
  var dx = o.x - b.x, dy = o.y - b.y, d = Math.sqrt(dx * dx + dy * dy) || 1, gap = d - b.r - o.r;
  var ux = dx / d, uy = dy / d, to = Math.atan2(dy, dx), rate = f.rate || 6, want;
  var closing = -(o.vx * ux + o.vy * uy) + (b.vx * ux + b.vy * uy);
  var keep = f.keep || 60, charging = closing > (f.closing || 120) && gap < keep * 2;
  var ki = b.char.hasKick ? b.char.kick : null, reach = ki ? ki.reach * 0.85 : 50;
  if ((gap < keep || charging) && (s.mode !== "out" || (charging && s.t > 0.5))) { if (charging) gnFire(b, gap, f); gnOut(s, f, charging); }
  else if (s.mode === "out" && (gap >= s.goal || s.t >= s.dur)) { s.mode = "set"; s.t = 0; s.dur = gnRand(f.set || [0.3, 0.7]); }
  else if (s.mode === "set" && s.t >= s.dur && gap > (f.press || 150)) { s.mode = "in"; s.t = 0; }
  else if (s.mode === "in" && (gap < reach || s.t > (f.inTime || 1.6))) { if (f.fireIn) gnFire(b, gap, f); gnOut(s, f, false); }
  if (s.mode === "out") want = gnWallSafe(b, to + Math.PI - s.side * s.ang, to, f);
  else if (s.mode === "set") { want = gnWallSafe(b, to + (s.side || 1) * (Math.PI / 2 + 0.2), to, f); rate *= 0.7; } // circling off at range
  else want = to;
  var sp = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
  if (sp >= 1) { var nu = gnTurn(Math.atan2(b.vy, b.vx), want, rate * dt); b.vx = Math.cos(nu) * sp; b.vy = Math.sin(nu) * sp; }
}

// From update(), every frame: his footwork, and the grabs coming round
// faster on him.
function tickGane(dt) {
  ganeClock += dt;
  balls.forEach(function (b) {
    var c = ganeCfg(b);
    if (!c || !b.alive) return;
    var o = balls[1 - b.id];
    if (c.shotsIn > 1 && o && o.alive && started && !over && o.char.hasGrapple && o.grappleCd > 0)
      o.grappleCd = Math.max(0, o.grappleCd - dt * (o.atkRate || 1) * (c.shotsIn - 1));
    if (c.footwork) gnFootwork(b, o, c.footwork, dt);
  });
}

// ---------------------------------------------------------------- hands down, the chin, up close

// From hurt() (match.js), with the weave: up close his weave works
// `closeWeave` times as often. 1 for anyone else.
function ganeWeaveMult(b, attackerId) {
  var c = ganeCfg(b);
  if (!c || c.closeWeave == null || attackerId == null || attackerId === b.id) return 1;
  return gnGap(b, balls[attackerId]) < (c.close || 30) ? c.closeWeave : 1;
}

// From hurt() (match.js), with the damage multipliers: up close strikes hurt
// more. (With his hands down a strike that lands is often a crit: his
// `chin` runs through the shared chin, chin.js, right after this.)
function ganeDamageMult(b, source, attackerId) {
  var c = ganeCfg(b);
  if (!c || attackerId == null || attackerId === b.id || !b.alive) return 1;
  var a = balls[attackerId], m = 1;
  if (c.closeHurt && GN_STRIKES[source] && gnGap(b, a) < (c.close || 30)) m *= c.closeHurt;
  return m;
}

function gnHandsFree(b) {
  return !(b.taunt || b.combo || b.flow || b.koRush || b.koPunch || b.throwAnim || b.jabAnim || b.shelled || b.igbb || b.swing || b.mock ||
    b.elbowAnim || b.kneeAnim || b.cmb || b.plum || b.fknee || b.chAct || b.cheater || b.weaveAnim);
}
// From drawHands (draw-attacks.js): his hands are down (drawGane draws them).
function ganeHandsBusy(b) {
  var c = ganeCfg(b);
  return !!(c && c.handsDown && b.alive && gnHandsFree(b));
}

// From draw(), per fighter, after the hands: his gloves hanging by his hips,
// swaying; while he jabs, the other one stays down.
function drawGane(b, other) {
  if (!ganeHandsBusy(b)) return;
  var r = b.r, size = ((b.char.punch && b.char.punch.size) || 14) * 0.72;
  var rear = other && other.x < b.x ? 1 : -1; // (while he jabs, the hand away from them stays down)
  [-1, 1].forEach(function (s) {
    if (b.punch && s !== rear) return;
    var sw = Math.sin(ganeClock * 3.6 + s * 1.2 + b.id) * 0.06;
    drawGloveAt(b.x + s * r * (1.02 + sw), b.y + r * (0.5 + Math.abs(sw) * 0.6), size, b.char, Math.PI / 2 - s * 0.3);
  });
}

// ---------------------------------------------------------------- the fighter card

function ganeGalleryMoves(ch, add) {
  var c = ch.gane;
  if (!c) return;
  if (c.handsDown) add("🙌", "Hands down", "Fights with his gloves down by his hips, even while he jabs. No guard at all." + (c.chin ? " " + c.chin.critChance + "% of what lands is a crit (x" + c.chin.critMult + ")." : ""));
  if (c.footwork) add("🔙", "Back foot", "Fights going backwards: backs off at an angle as they come in, circles at range, steps in to kick and backs straight out. Kicks them as they come charging in.");
  if (c.closeHurt || c.closeWeave != null) add("⚠️", "Up close", "Inside " + (c.close || 30) + " his weave works x" + (c.closeWeave != null ? c.closeWeave : 1) + " as often and strikes do x" + (c.closeHurt || 1) + " damage. Pressure and combinations are his bad nights.");
  if (c.shotsIn > 1) add("🤼", "Shots get in", "A Grappler's grabs come round " + c.shotsIn + "x as fast against him.");
}
