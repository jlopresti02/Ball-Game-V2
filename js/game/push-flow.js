// Push flow (Joe, 2026-11-21): "When momentum from a push starts to get too
// crazy we need an interaction that makes sense to keep the fight flowing
// smoothly. Same when someone is trapped in a corner."
//
// Two things went wrong when fighters pushed into each other:
//   - Runaway momentum: a fighter chasing someone down (the BMF's critical
//     weave combo above all) kept matching their speed while shoving them,
//     so each bump added a little more, and within half a second both were
//     flying round the cage at thousands of px/s (seen at up to 6,800 in
//     headless fights, Hokit vs Jiří). weave.js now matches only the speed
//     they're moving away at, which stops the feedback at its source, and
//     this file is the safety net for anything else that builds up.
//   - The cage: one pinned on the cage or in a corner with the other walking
//     into him rattled between the wall and the pusher.
//
// So, in ordinary fighting (never in a hold, a grab, a special, a cutscene or
// a clash, and never while either one is in a scripted move):
//
// TIE-UP     touching and moving the same way fast (the pusher driving them
//            back faster than `over` px/s), or one walking into the other for
//            `pushTime` seconds in open space: they tie up. Both stop dead,
//            pummel for the underhooks for `tie` seconds (each with his own
//            two arms, swapping over and under), then "BREAK!" and both step
//            back off at `breakSpeed`. A weave combo or combination that was
//            running is over (it was the runaway).
// PIVOT      pinned on the cage (within `wall` px of it) with the other
//            walking into him for `cageTime` seconds (`cornerTime` in a
//            corner): he frames on them with his lead glove and pivots round
//            them toward the open side of the ring ("PIVOT!"), then slides out
//            along the cage, and the pusher is left facing the fence.
//
// Each pair gets `cooldown` seconds before the next one. No damage, no new
// random rolls unless one of these fires, so fights that never push play
// the same as before (until one does).
"use strict";

var PUSH_FLOW = {
  on: true,
  over: 560,          // px/s: pushed back faster than this while touching = out of hand
  overTicks: 3,       // ...for this many frames in a row
  pushTime: 0.9,      // s of one walking into the other in open space before they tie up
  tie: [0.5, 0.7],    // s pummelling in the tie-up
  breakSpeed: 380,    // px/s each steps back on the break
  wall: 6,            // px: this close to the cage counts as pinned on it
  cageTime: 0.7,      // s pinned on the cage before he pivots off
  cornerTime: 0.4,    // s pinned in a corner
  pivot: 0.36,        // s the pivot takes
  pivotAngle: 1.9,    // radians he swings round them (about 110 degrees)
  exitSpeed: 400,     // px/s he slides out at
  cooldown: 1.4,      // s before the same pair can do it again
  // A runaway push (Joe, 2026-11-21, round 2): relative odds of what happens.
  // `punches`: the pusher was throwing (a combination, a weave combo, a punch
  // out); `walk`: he was just walking them back. dirty only for a weaver
  // (the BMF base) or one mid combination.
  punches: { plant: 35, duck: 25, dirty: 25, tie: 15 },
  walk: { plant: 35, duck: 25, tie: 40 },
  plant: { shell: 0.32, end: 0.55, knockback: 300 }, // shells up, eats the shots on the gloves, swings back
  duck: { dur: 0.34, slide: 72 },                    // ducks the punch and slides out under it
  // Dirty boxing: collar tie, then `shots` short shots (each `cycle` s: chamber,
  // drive, back), the kinds in turn from `mix`, the last one shoves them off.
  dirty: { shots: 4, cycle: 0.17, start: 0.1, mult: 0.6, shove: 340, pull: 7, mix: ["uppercut", "uppercut", "hook", "uppercut"] },
  // Kicked while trapped on the cage (Joe, round 3): he checks it and gets out
  // of there. % of the kicks that land on him within `near` px of the cage
  // (`corner` with two walls that close).
  kickCheck: { cage: 40, corner: 70, near: 30, shin: 0.22, move: 0.34, slide: 80 }
};

var pfPair = null; // { a, b, kind: "tie"|"pivot", t, dur, ... } the one running now
var pfWatch = null; // { balls, touchT, overN, pinT, cd }

function pushFlowHeld(b) { return !!(pfPair && b && ((pfPair.a === b && !pfPair.loose) || pfPair.b === b)); }
// While tied up both his hands are on them; while pivoting the one getting out frames with his.
function pushFlowHandsBusy(b) {
  var m = pfPair;
  if (!m || !b || !b.alive) return false;
  if (m.kind === "tie") return m.a === b || m.b === b;
  if (m.kind === "pivot") return m.b === b;                       // framing on them
  if (m.kind === "plant") return m.b === b && m.t < PUSH_FLOW.plant.shell; // shelled up (then the counter is a normal punch)
  if (m.kind === "dirty") return true;                            // his collar tie and uppercuts; them covering up (their guard would reach in among his arms)
  if (m.kind === "check") return m.b === b && m.t < PUSH_FLOW.kickCheck.shin + 0.05; // guard tight while the shin's up
  return false;
}

// Walking about in a weapon form (Tony's katanas, Jiří's samurai run): he
// can still be pivoted off, though he's never stopped or held for it.
function pfForm(b) {
  if (!b || !b.alive || !b.igbb || (b.igbb.move !== "katana" && b.igbb.move !== "samurai")) return false;
  if (typeof specialSolidOn === "function" && specialSolidOn(b)) return false; // drawing, sheathing, suiting up (special-solid.js)
  return !(b.grappled || b.slam || b.dazed || subLocked(b) || (typeof katanaDuelHeld === "function" && katanaDuelHeld(b)) || (typeof swordDuelLocked === "function" && swordDuelLocked(b)));
}

// Free to be tied up or to pivot: nothing scripted on him.
function pfFree(b) {
  if (!b.alive || b.koOut || b.koRush || b.koDuel || b.shocked || b.dazed || b.dizzy || b.beamPin) return false;
  if (b.grapple || b.grappled || b.sprawl || b.sprawled || subLocked(b) || b.slam || b.choked || b.igbb || b.shelled) return false;
  if (b.taunt || b.mock || b.watcherState || b.powerState || b.rageState || b.checkStun > 0 || b.checkAnim || b.swing) return false;
  if (b.hokitShot || b.armbar || b.guillo || b.rnc || b.suplex || b.guard || b.fenceGrab || b.chAct || b.throwAnim) return false;
  if (typeof swordDuelLocked === "function" && swordDuelLocked(b)) return false;
  if (typeof clinchBusy === "function" && clinchBusy(b)) return false;
  if (typeof kneesBusy === "function" && kneesBusy(b)) return false;
  if (typeof jonClinchBusy === "function" && jonClinchBusy(b)) return false;
  if (typeof fedorBusy === "function" && fedorBusy(b)) return false;
  if (typeof cormierBusy === "function" && cormierBusy(b)) return false;
  if (typeof ganeShotBusy === "function" && ganeShotBusy(b)) return false;
  if (typeof pratesPartyBusy === "function" && pratesPartyBusy(b)) return false;
  if (typeof fedorCrowning === "function" && fedorCrowning(b)) return false;
  if (typeof darkSideOn === "function" && darkSideOn(b)) return false; // saber work has its own clashes and locks
  if (typeof katanaDuelHeld === "function" && katanaDuelHeld(b)) return false;
  return true;
}
// In a timed move of his own (a weave combo, a combination, a flow counter):
// left to finish unless the momentum's run away.
function pfInMove(b) { return !!(b.combo || b.cmb || b.flow || b.knockFly > 0); }

function pfWalls(b, m) {
  var n = 0;
  if (b.x < b.r + m) n++; if (b.x > W - b.r - m) n++;
  if (b.y < b.r + m) n++; if (b.y > H - b.r - m) n++;
  return n;
}

// From update.js, every frame after the abilities have moved everyone.
function tickPushFlow(dt) {
  if (!PUSH_FLOW.on || !balls || balls.length < 2) return;
  if (!pfWatch || pfWatch.balls !== balls) { pfWatch = { balls: balls, touchT: 0, overN: 0, pinT: [0, 0], cd: 0 }; pfPair = null; }
  var w = pfWatch, a = balls[0], c = balls[1], P = PUSH_FLOW;
  if (pfPair) { pfRun(dt); return; }
  w.cd = Math.max(0, w.cd - dt);
  var fa = pfFree(a), fc = pfFree(c);
  var formOk = (fa && pfForm(c)) || (fc && pfForm(a)); // pinned by a fighter walking him down in a weapon form
  if (!started || over || w.cd > 0 || sceneLocked() || (!(fa && fc) && !formOk)) { pfCool(w, dt); w.touchT = 0; w.overN = 0; return; }
  var dx = c.x - a.x, dy = c.y - a.y, d = Math.sqrt(dx * dx + dy * dy) || 1, gap = d - a.r - c.r;
  if (gap > 3) { pfCool(w, dt); w.touchT = 0; w.overN = 0; return; }
  var nx = dx / d, ny = dy / d;
  var aIn = a.vx * nx + a.vy * ny;      // a walking into c
  var cIn = -(c.vx * nx + c.vy * ny);   // c walking into a
  // Runaway: one driving the other back, both going the same way too fast.
  var sa = Math.sqrt(a.vx * a.vx + a.vy * a.vy), sc = Math.sqrt(c.vx * c.vx + c.vy * c.vy);
  var drive = Math.max(Math.min(aIn, -cIn), Math.min(cIn, -aIn)); // the slower of pusher-in and pushed-back
  if (Math.max(sa, sc) > P.over && drive > P.over * 0.5) w.overN++; else w.overN = 0;
  if (w.overN >= P.overTicks && fa && fc) { if (aIn >= cIn) pfStartRunaway(a, c); else pfStartRunaway(c, a); return; }
  if (pfInMove(a) || pfInMove(c)) { w.touchT = 0; pfCool(w, dt); return; }
  // Pinned on the cage with the other walking in: he pivots off.
  for (var i = 0; i < 2; i++) {
    var v = balls[i], p = balls[1 - i], pIn = i === 0 ? cIn : aIn;
    var walls = pfWalls(v, P.wall);
    if (walls && pIn > 20 && (i === 0 ? fa : fc)) {
      w.pinT[i] += dt * (walls >= 2 ? P.cageTime / P.cornerTime : 1); // a corner fills it faster
      if (w.pinT[i] >= P.cageTime) { pfStartPivot(p, v); return; }
    } else w.pinT[i] = Math.max(0, w.pinT[i] - dt * 0.5); // bouncing in and out of it still counts
  }
  if (!(fa && fc)) return;
  // Walking into each other in the open for too long: tie-up.
  if (aIn > 20 || cIn > 20) w.touchT += dt; else w.touchT = 0;
  if (w.touchT >= P.pushTime && !pfWalls(a, P.wall) && !pfWalls(c, P.wall)) { if (aIn >= cIn) pfStartRunaway(a, c); else pfStartRunaway(c, a); }
}

// Off the cage and apart, the pin wears off (slowly, so rattling in and out of a corner adds up).
function pfCool(w, dt) { w.pinT[0] = Math.max(0, w.pinT[0] - dt * 0.5); w.pinT[1] = Math.max(0, w.pinT[1] - dt * 0.5); }

function pfStop(b) {
  pfQuiet(b);
  b.jabAnim = null; b.knockFly = 0; b.speedEase = null;
  b.vx = 0; b.vy = 0;
}
// Held in one of these, nothing of his own can be going: a strike a timer
// somewhere else starts (a combination's queued elbow, say) would draw a
// third arm over the move's own two.
function pfQuiet(b) {
  if (b.cmb && typeof endCombo === "function") endCombo(b, false);
  b.combo = null; b.flow = null; b.punch = null; b.kick = null; b.swing = null; b.throwAnim = null;
  b.elbowAnim = null; b.kneeAnim = null; b.koPunch = null;
}

function pfStartTie(a, c, why) {
  pfStop(a); pfStop(c);
  var dx = c.x - a.x, dy = c.y - a.y, d = Math.sqrt(dx * dx + dy * dy) || 1;
  var half = (a.r + c.r) * 0.47;
  var mx = (a.x + c.x) / 2, my = (a.y + c.y) / 2;
  var ux = dx / d, uy = dy / d;
  // Keep the pair inside the cage.
  var ex = Math.abs(ux) * half, ey = Math.abs(uy) * half, R = Math.max(a.r, c.r);
  mx = Math.min(W - R - ex, Math.max(R + ex, mx));
  my = Math.min(H - R - ey, Math.max(R + ey, my));
  pfPair = { kind: "tie", why: why, a: a, b: c, t: 0, dur: PUSH_FLOW.tie[0] + Math.random() * (PUSH_FLOW.tie[1] - PUSH_FLOW.tie[0]),
    mx: mx, my: my, ux: ux, uy: uy, half: half, swap: Math.random() < 0.5 ? 1 : -1 };
  pfPlaceTie(0);
  floater(mx, my - R - 30, "TIE-UP", "note");
  if (typeof playClinchGrab === "function") playClinchGrab(); else playPunch(4);
  if (!reduceMotion) shake = Math.max(shake, 4);
  crowdReact(0.15);
}

// A runaway push: `atk` driving `def` back. What happens depends on whether he
// was punching his way in or just walking them back.
function pfStartRunaway(atk, def) {
  var punching = !!(atk.combo || atk.cmb || atk.flow || atk.punch || atk.jabAnim);
  var odds = punching ? PUSH_FLOW.punches : PUSH_FLOW.walk, pick = {}, tot = 0, k;
  for (k in odds) {
    if (k === "dirty" && !(atk.char.hasWeave || atk.combo || atk.cmb)) continue;
    pick[k] = odds[k]; tot += odds[k];
  }
  var r = Math.random() * tot, kind = "tie";
  for (k in pick) { r -= pick[k]; if (r < 0) { kind = k; break; } }
  if (kind === "plant") pfStartPlant(atk, def);
  else if (kind === "duck") pfStartDuck(atk, def);
  else if (kind === "dirty") pfStartDirty(atk, def);
  else pfStartTie(atk, def, punching ? "punches" : "walk");
}

function pfDir(a, b) { var dx = b.x - a.x, dy = b.y - a.y, d = Math.sqrt(dx * dx + dy * dy) || 1; return { x: dx / d, y: dy / d, d: d }; }

// PLANTS: he digs in, shells up and takes the next shots on the gloves, then
// swings back. The swing is his own punch: it lands, or they weave, block or
// slip it the way they always would (hurt runs their defense). After that the
// fight carries on from right there, clinch and takedowns at their normal rates.
function pfStartPlant(atk, def) {
  pfStop(atk); pfStop(def);
  var u = pfDir(atk, def);
  pfPair = { kind: "plant", a: atk, b: def, t: 0, ux: u.x, uy: u.y, ax: atk.x, ay: atk.y, bx: def.x, by: def.y, shots: 0, swung: false };
  floater(def.x, def.y - def.r - 30, "PLANTS!", "note");
  playPunch(3);
  if (!reduceMotion) shake = Math.max(shake, 3);
}

// DUCKED!: the next punch goes over his head and he slides out under it, away
// along the open side; the puncher's left reaching where he was.
function pfStartDuck(atk, def) {
  pfStop(atk); pfStop(def);
  var u = pfDir(atk, def), qx = -u.y, qy = u.x;
  // Duck out toward the more open side.
  var room = function (s) { var x = def.x + qx * s * 80, y = def.y + qy * s * 80; return Math.min(x - def.r, W - def.r - x, y - def.r, H - def.r - y); };
  var side = room(1) >= room(-1) ? 1 : -1;
  atk.jabAnim = { t: 0, dur: 0.26, sign: 1, big: true, dx: u.x, dy: u.y };
  pfPair = { kind: "duck", a: atk, b: def, t: 0, ux: u.x, uy: u.y, qx: qx * side, qy: qy * side, ax: atk.x, ay: atk.y, bx: def.x, by: def.y };
  def.squash = { t: 0.22, max: 0.22, nx: 0, ny: 1 };
  playWhoosh();
}

// DIRTY BOXING (the BMF, or one mid combination): he plants his last few shots:
// lead hand behind their head, short uppercuts with the other, then shoves off.
function pfStartDirty(atk, def) {
  pfStop(atk); pfStop(def);
  var u = pfDir(atk, def);
  pfPair = { kind: "dirty", a: atk, b: def, t: 0, ux: u.x, uy: u.y, ax: atk.x, ay: atk.y, bx: def.x, by: def.y, shots: 0, hitT: -1 };
  floater(atk.x, atk.y - atk.r - 30, "DIRTY BOXING!", "crit");
  if (typeof playClinchGrab === "function") playClinchGrab(); else playPunch(4);
  crowdReact(0.25);
}

// From hurt (match.js). Mid pivot, duck or check-and-move he's on his way
// out: nothing lands. Otherwise a kick about to land on him while he's trapped
// on the cage: he checks it with his shin (no damage) and moves out along the
// cage toward open space. True if it didn't land.
function pushFlowDodge(v, source, attackerId) {
  var P = PUSH_FLOW, kc = P.kickCheck;
  if (pfPair && pfPair.b === v && (pfPair.kind === "pivot" || pfPair.kind === "duck" || pfPair.kind === "check") && attackerId != null && attackerId !== v.id) { v.justDodged = true; return true; }
  if (!P.on || !kc || pfPair || attackerId == null || attackerId === v.id || !started || over) return false;
  if (typeof SMOTHER_KICKS === "undefined" || SMOTHER_KICKS.indexOf(source) < 0) return false;
  var p = balls[attackerId];
  if (!p || !p.alive || p.igbb || p.grapple || p.grappled || sceneLocked() || (pfWatch && pfWatch.cd > 0)) return false;
  if (!pfFree(v) || pfInMove(v)) return false;
  var walls = pfWalls(v, kc.near);
  if (!walls || Math.random() * 100 >= (walls >= 2 ? kc.corner : kc.cage)) return false;
  pfStartCheck(p, v);
  v.justDodged = true;
  return true;
}

// The check: shin up to take it, then out along the cage, away from the kicker
// and toward the middle. The kicker finishes his kick where he is.
function pfStartCheck(p, v) {
  pfStop(v);
  var u = pfDir(p, v), kc = PUSH_FLOW.kickCheck;
  // Out toward the middle, and sideways off the kicker's line, whichever side is more open.
  var cx = W / 2 - v.x, cy = H / 2 - v.y, cl = Math.sqrt(cx * cx + cy * cy) || 1;
  cx /= cl; cy /= cl;
  var qx = -u.y, qy = u.x;
  if (qx * cx + qy * cy < 0) { qx = -qx; qy = -qy; }
  var ox = qx * 0.75 + cx * 0.65, oy = qy * 0.75 + cy * 0.65, ol = Math.sqrt(ox * ox + oy * oy) || 1;
  pfPair = { kind: "check", loose: true, a: p, b: v, t: 0, ux: u.x, uy: u.y, bx: v.x, by: v.y, ox: ox / ol, oy: oy / ol, dur: kc.shin + kc.move };
  floater(v.x, v.y - v.r - 8, "CHECKED", "dodge");
  playPunch(12);
  if (!reduceMotion) shake = Math.max(shake, 5);
}

function pfStartPivot(p, v, offKick) {
  var form = pfForm(p);
  if (!form && !offKick) pfStop(p);
  pfStop(v);
  var ox = v.x - p.x, oy = v.y - p.y, d = Math.sqrt(ox * ox + oy * oy) || 1;
  // Round toward the middle of the ring.
  var cx = W / 2 - p.x, cy = H / 2 - p.y;
  var dir = (ox * cy - oy * cx) >= 0 ? 1 : -1;
  if (Math.abs(ox * cy - oy * cx) < 1) dir = Math.random() < 0.5 ? 1 : -1;
  pfPair = { kind: "pivot", formA: form, loose: form || !!offKick, kick: !!offKick, a: p, b: v, t: 0, dur: PUSH_FLOW.pivot, px: p.x, py: p.y, a0: Math.atan2(oy, ox), dir: dir, dist: Math.max(d, p.r + v.r) };
  floater(v.x, v.y - v.r - 30, offKick ? "PIVOTS OFF THE KICK!" : "PIVOT!", "dodge");
  playWhoosh();
  crowdReact(0.15);
}

function pfEase(k) { k = Math.max(0, Math.min(1, k)); return k * k * (3 - 2 * k); }

function pfPlaceTie(t) {
  var m = pfPair, a = m.a, c = m.b;
  // A little sway as they fight for the underhooks.
  var sw = Math.sin(t * 18) * 2.2, px = -m.uy * sw, py = m.ux * sw;
  a.x = m.mx - m.ux * m.half + px; a.y = m.my - m.uy * m.half + py;
  c.x = m.mx + m.ux * m.half + px; c.y = m.my + m.uy * m.half + py;
  a.vx = a.vy = c.vx = c.vy = 0;
}

function pfRun(dt) {
  var m = pfPair, a = m.a, c = m.b;
  // Something else took over (a KO, a special landing on them): let go.
  if (m.kind === "check" && (over || !c.alive || c.grappled || c.slam || c.igbb || c.koOut)) { pfDone(m); return; }
  var gone = over || !a.alive || !c.alive || a.grappled || c.grappled || a.grapple || c.grapple || a.slam || c.slam || (a.igbb && !m.formA) || c.igbb || a.koOut || c.koOut || sceneLocked() || (m.formA && !pfForm(a)) || (m.kick && a.igbb);
  m.t += dt;
  if (gone) { pfPair = null; pfWatch.cd = PUSH_FLOW.cooldown; return; }
  if (!m.loose) pfQuiet(a);
  pfQuiet(c);
  if (m.kind === "tie") {
    pfPlaceTie(m.t);
    var k = Math.floor(m.t / 0.17);
    if (k !== m.lastSwap) { if (m.lastSwap != null) { m.swap = -m.swap; if (typeof playPunch === "function" && k % 2) playPunch(2); } m.lastSwap = k; }
    if (m.t >= m.dur) pfBreak();
    return;
  }
  if (m.kind === "plant") { pfRunPlant(m, a, c); return; }
  if (m.kind === "duck") { pfRunDuck(m, a, c); return; }
  if (m.kind === "dirty") { pfRunDirty(m, a, c); return; }
  if (m.kind === "check") { pfRunCheck(m, a, c); return; }
  // The pivot: the pusher plants, the pinned one swings round him.
  var e = pfEase(m.t / m.dur), ang = m.a0 + m.dir * PUSH_FLOW.pivotAngle * e;
  if (m.loose) { m.px = a.x; m.py = a.y; } // still walking in his form, or finishing his kick: swing round wherever he is
  else { a.x = m.px; a.y = m.py; a.vx = a.vy = 0; }
  c.x = Math.min(W - c.r, Math.max(c.r, m.px + Math.cos(ang) * m.dist));
  c.y = Math.min(H - c.r, Math.max(c.r, m.py + Math.sin(ang) * m.dist));
  c.vx = c.vy = 0;
  if (m.t >= m.dur) {
    // Out: he slides off along his swing, away from them; they're left facing the cage.
    var tx = -Math.sin(ang) * m.dir, ty = Math.cos(ang) * m.dir;     // the way he was swinging
    var ox = Math.cos(ang), oy = Math.sin(ang);                       // away from them
    var vx = tx * 0.75 + ox * 0.66, vy = ty * 0.75 + oy * 0.66, vl = Math.sqrt(vx * vx + vy * vy) || 1;
    c.vx = vx / vl * PUSH_FLOW.exitSpeed; c.vy = vy / vl * PUSH_FLOW.exitSpeed;
    if (!m.loose) { a.vx = -Math.cos(m.a0) * 120; a.vy = -Math.sin(m.a0) * 120; } // a half step toward where he was
    pfPair = null; pfWatch.cd = PUSH_FLOW.cooldown; pfWatch.pinT = [0, 0]; pfWatch.touchT = 0;
  }
}

function pfDone(m) { pfPair = null; pfWatch.cd = PUSH_FLOW.cooldown; pfWatch.touchT = 0; pfWatch.overN = 0; pfWatch.pinT = [0, 0]; }
function pfHold(m, a, c) { a.x = m.ax; a.y = m.ay; c.x = m.bx; c.y = m.by; a.vx = a.vy = c.vx = c.vy = 0; }

function pfRunPlant(m, a, c) {
  var P = PUSH_FLOW.plant;
  pfHold(m, a, c);
  // Two of his punches thud into the shell.
  if (m.shots < 2 && m.t >= 0.04 + m.shots * 0.14) {
    m.shots++;
    a.jabAnim = { t: 0, dur: 0.12, sign: m.shots % 2 ? 1 : -1, big: false, dx: m.ux, dy: m.uy };
    if (m.shots === 1) floater(c.x, c.y - c.r - 8, "BLOCKED", "dodge");
    playPunch(2);
  }
  if (!m.swung && m.t >= P.shell) {
    m.swung = true;
    var dmg = (c.char.hasPunch && c.char.punch) ? c.char.punch.damage : 10;
    c.jabAnim = { t: 0, dur: 0.22, sign: 1, big: true, dx: -m.ux, dy: -m.uy };
    var dealt = hurt(a, dmg, "punch", c.id);
    if (dealt > 0) {
      playPunch(dealt);
      m.knock = true;
      if (!reduceMotion) shake = Math.max(shake, 6);
    } else if (!a.justDodged) floater(a.x, a.y - a.r - 8, "MISS", "dodge");
    else playWhoosh();
    if (typeof checkEnd === "function") checkEnd();
  }
  if (m.t >= P.end) {
    if (m.knock && a.alive) { a.vx = -m.ux * P.knockback; a.vy = -m.uy * P.knockback; }
    pfDone(m);
  }
}

function pfRunDuck(m, a, c) {
  var P = PUSH_FLOW.duck, k = pfEase(m.t / P.dur);
  a.x = m.ax; a.y = m.ay; a.vx = a.vy = 0;
  c.x = Math.min(W - c.r, Math.max(c.r, m.bx + m.qx * P.slide * k + m.ux * P.slide * 0.3 * k));
  c.y = Math.min(H - c.r, Math.max(c.r, m.by + m.qy * P.slide * k + m.uy * P.slide * 0.3 * k));
  c.vx = c.vy = 0;
  if (!m.called && m.t >= 0.1) { m.called = true; floater(m.bx, m.by - c.r - 30, "DUCKED!", "dodge"); crowdReact(0.15); }
  if (m.t >= P.dur) {
    var vx = m.qx * 0.8 + m.ux * 0.6, vy = m.qy * 0.8 + m.uy * 0.6, vl = Math.sqrt(vx * vx + vy * vy) || 1;
    c.vx = vx / vl * PUSH_FLOW.exitSpeed; c.vy = vy / vl * PUSH_FLOW.exitSpeed;
    a.vx = m.ux * 160; a.vy = m.uy * 160; // carried on into where he was
    pfDone(m);
  }
}

function pfRunDirty(m, a, c) {
  var P = PUSH_FLOW.dirty;
  // He pulls their head in on the tie, and each shot rocks it back.
  var pull = P.pull * Math.min(1, m.t / 0.1), rock = m.hitT >= 0 ? Math.max(0, 1 - (m.t - m.hitT) / 0.1) * 5 : 0;
  a.x = m.ax; a.y = m.ay; a.vx = a.vy = 0;
  c.x = m.bx - m.ux * (pull - rock); c.y = m.by - m.uy * (pull - rock); c.vx = c.vy = 0;
  var hitAt = P.start + m.shots * P.cycle + P.cycle * 0.7;
  if (m.shots < P.shots && m.t >= hitAt) {
    m.shots++; m.hitT = m.t;
    var kind = P.mix[(m.shots - 1) % P.mix.length], last = m.shots === P.shots;
    var base = a.char.hasWeave ? a.char.weave.comboDamage : ((a.char.hasPunch && a.char.punch) ? a.char.punch.damage * P.mult : 6);
    var dealt = hurt(c, base * (last ? 1.4 : 1), "combo", a.id);
    if (dealt > 0) {
      playCritPunch(last);
      if (!reduceMotion) shake = Math.max(shake, last ? 9 : 5);
      var hp = pfDirtyTarget(a, c, kind);
      impacts.push({ x: hp.x, y: hp.y, nx: kind === "hook" ? pfSide(a, c) : 0, ny: kind === "hook" ? 0 : -1, life: 0.2, max: 0.2, color: "#ffffff" });
      c.squash = kind === "hook" ? { t: 0.1, max: 0.1, nx: pfSide(a, c), ny: 0 } : { t: 0.1, max: 0.1, nx: 0, ny: -1 }; // head snapped up, or round
    }
    if (typeof checkEnd === "function") checkEnd();
  }
  if (m.t >= P.start + P.shots * P.cycle + 0.06) {
    if (c.alive) { c.vx = m.ux * P.shove; c.vy = m.uy * P.shove; }
    pfDone(m);
  }
}

function pfRunCheck(m, a, c) {
  var kc = PUSH_FLOW.kickCheck;
  if (m.t < kc.shin) { c.x = m.bx; c.y = m.by; c.vx = c.vy = 0; return; }
  var k = pfEase((m.t - kc.shin) / kc.move);
  c.x = Math.min(W - c.r, Math.max(c.r, m.bx + m.ox * kc.slide * k));
  c.y = Math.min(H - c.r, Math.max(c.r, m.by + m.oy * kc.slide * k));
  c.vx = c.vy = 0;
  if (!m.out && k > 0.2) { m.out = true; floater(c.x, c.y - c.r - 30, "OFF THE CAGE!", "note"); playWhoosh(); }
  if (m.t >= m.dur) { c.vx = m.ox * PUSH_FLOW.exitSpeed; c.vy = m.oy * PUSH_FLOW.exitSpeed; pfDone(m); }
}

function pfBreak() {
  var m = pfPair, a = m.a, c = m.b, s = PUSH_FLOW.breakSpeed;
  a.vx = -m.ux * s; a.vy = -m.uy * s;
  c.vx = m.ux * s; c.vy = m.uy * s;
  floater(m.mx, m.my - Math.max(a.r, c.r) - 30, "BREAK!", "dodge");
  playBounce();
  pfPair = null; pfWatch.cd = PUSH_FLOW.cooldown; pfWatch.touchT = 0; pfWatch.overN = 0; pfWatch.pinT = [0, 0];
}

// ---------------------------------------------------------------
// Drawing (from draw(), over both fighters): only each fighter's own two arms.
// ---------------------------------------------------------------
function drawPushFlowOver() {
  var m = pfPair;
  if (!m) return;
  ctx.save();
  if (m.kind === "tie") {
    pfTieArms(m.a, m.b, m.swap, m.t);
    pfTieArms(m.b, m.a, -m.swap, m.t);
  } else if (m.kind === "pivot") {
    pfFrameArms(m.b, m.a, m.t / m.dur);
  } else if (m.kind === "plant" && m.t < PUSH_FLOW.plant.shell) {
    pfShellArms(m.b, m.a);
  } else if (m.kind === "dirty") {
    pfCoverArms(m.b);
    pfDirtyArms(m.a, m.b, m);
  } else if (m.kind === "check" && m.t < PUSH_FLOW.kickCheck.shin + 0.05) {
    pfCheckShin(m.b, m.a, m.t / PUSH_FLOW.kickCheck.shin);
    pfShellArms(m.b, m.a);
  }
  ctx.restore();
}

// Over-under: one arm over their shoulder to the back of the neck, the other
// under their armpit, swapping each pummel (`over` says which side is on top).
function pfTieArms(b, v, over, t) {
  var dx = v.x - b.x, dy = v.y - b.y, d = Math.sqrt(dx * dx + dy * dy) || 1;
  var ux = dx / d, uy = dy / d, qx = -uy, qy = ux, r = b.r, R = v.r, limb = r * 0.2;
  var k = (t % 0.17) / 0.17, slide = Math.sin(k * Math.PI) * 0.18; // the hand fighting for position
  [-1, 1].forEach(function (side) {
    var top = side === over;
    var sh = { x: b.x + ux * r * 0.35 + qx * side * r * 0.62, y: b.y + uy * r * 0.35 + qy * side * r * 0.62 };
    var reach = top ? 0.55 : 0.2, wide = top ? 0.55 : 0.95 - slide;
    var hd = { x: v.x + ux * R * reach + qx * side * R * wide, y: v.y + uy * R * reach + qy * side * R * wide };
    var cp = { x: (sh.x + hd.x) / 2 + qx * side * r * 0.35, y: (sh.y + hd.y) / 2 + qy * side * r * 0.35 };
    strokeLimb(limb, armColor(b.char, side), function () { ctx.moveTo(sh.x, sh.y); ctx.quadraticCurveTo(cp.x, cp.y, hd.x, hd.y); });
    drawGloveAt(hd.x, hd.y, r * 0.24, b.char, Math.atan2(uy, ux));
  });
}

// The pivot: lead glove framed on their shoulder, the rear hand up by his chin.
function pfFrameArms(b, v, k) {
  var dx = v.x - b.x, dy = v.y - b.y, d = Math.sqrt(dx * dx + dy * dy) || 1;
  var ux = dx / d, uy = dy / d, qx = -uy, qy = ux, r = b.r, R = v.r, limb = r * 0.2;
  var push = Math.sin(Math.min(1, k) * Math.PI);
  var shL = { x: b.x + ux * r * 0.3 + qx * r * 0.62, y: b.y + uy * r * 0.3 + qy * r * 0.62 };
  var hdL = { x: v.x - ux * R * (0.15 + 0.2 * push) + qx * R * 0.55, y: v.y - uy * R * (0.15 + 0.2 * push) + qy * R * 0.55 };
  strokeLimb(limb, armColor(b.char, 1), function () { ctx.moveTo(shL.x, shL.y); ctx.lineTo(hdL.x, hdL.y); });
  drawGloveAt(hdL.x, hdL.y, r * 0.24, b.char, Math.atan2(uy, ux));
  var shR = { x: b.x + ux * r * 0.3 - qx * r * 0.62, y: b.y + uy * r * 0.3 - qy * r * 0.62 };
  var hdR = { x: b.x + ux * r * 0.95 - qx * r * 0.35, y: b.y + uy * r * 0.95 - qy * r * 0.35 };
  strokeLimb(limb, armColor(b.char, -1), function () { ctx.moveTo(shR.x, shR.y); ctx.lineTo(hdR.x, hdR.y); });
  drawGloveAt(hdR.x, hdR.y, r * 0.24, b.char, Math.atan2(uy, ux));
}

// Shelled up: both gloves high in front of his face, elbows tight.
function pfShellArms(b, v) {
  var u = pfDir(b, v), qx = -u.y, qy = u.x, r = b.r, limb = r * 0.2;
  [-1, 1].forEach(function (side) {
    var sh = { x: b.x + u.x * r * 0.25 + qx * side * r * 0.62, y: b.y + u.y * r * 0.25 + qy * side * r * 0.62 };
    var hd = { x: b.x + u.x * r * 0.92 + qx * side * r * 0.22, y: b.y + u.y * r * 0.92 + qy * side * r * 0.22 };
    var el = { x: b.x + u.x * r * 0.55 + qx * side * r * 0.75, y: b.y + u.y * r * 0.55 + qy * side * r * 0.75 };
    strokeLimb(limb, armColor(b.char, side), function () { ctx.moveTo(sh.x, sh.y); ctx.quadraticCurveTo(el.x, el.y, hd.x, hd.y); });
    drawGloveAt(hd.x, hd.y, r * 0.27, b.char, Math.atan2(u.y, u.x));
  });
}

// Dirty boxing is drawn the way the fighters are: faces front on, so "up"
// on screen is up their body. `sx` is the side they're on (left or right).
function pfSide(b, v) { return v.x >= b.x ? 1 : -1; }
// Where each shot lands: an uppercut up under the chin, a hook round onto the cheek.
function pfDirtyTarget(b, v, kind) {
  var sx = pfSide(b, v), R = v.r;
  if (kind === "hook") return { x: v.x - sx * R * 0.3, y: v.y - R * 0.32 };
  return { x: v.x - sx * R * 0.22, y: v.y + R * 0.02 };
}

// Dirty boxing, his own two arms: the lead arm up over their head in a collar
// tie (glove cupped on the back of their head, yanking it in on each shot),
// the other hand chambering low by his hip and ripping up into the chin, or
// out wide and round for the hook, with a swoosh along it.
function pfDirtyArms(b, v, m) {
  var P = PUSH_FLOW.dirty, sx = pfSide(b, v), r = b.r, R = v.r, limb = r * 0.21;
  var idx = Math.floor((m.t - P.start) / P.cycle), p = (m.t - P.start) / P.cycle - idx;
  var active = m.t >= P.start && idx < P.shots;
  var kind = P.mix[Math.max(0, idx) % P.mix.length];
  var hitK = m.hitT >= 0 ? Math.max(0, 1 - (m.t - m.hitT) / 0.1) : 0;
  var tie = Math.min(1, m.t / 0.1);
  // Lead arm: over the top to the back of their head.
  var shL = { x: b.x + sx * r * 0.55, y: b.y - r * 0.3 };
  var grip = { x: v.x - sx * R * 0.05 - sx * 4 * hitK, y: v.y - R * 0.78 + 3 * hitK };
  var guardL = { x: b.x + sx * r * 0.85, y: b.y - r * 0.35 };
  var hdL = { x: guardL.x + (grip.x - guardL.x) * tie, y: guardL.y + (grip.y - guardL.y) * tie };
  var elL = { x: (shL.x + hdL.x) / 2, y: Math.min(shL.y, hdL.y) - r * 0.45 * tie };
  strokeLimb(limb, armColor(b.char, 1), function () { ctx.moveTo(shL.x, shL.y); ctx.quadraticCurveTo(elL.x, elL.y, hdL.x, hdL.y); });
  drawGloveAt(hdL.x, hdL.y, r * 0.24, b.char, sx > 0 ? Math.PI * 0.35 : Math.PI * 0.65);
  // Rear arm.
  var shR = { x: b.x + sx * r * 0.2, y: b.y + r * 0.05 };
  var rest = { x: b.x + sx * r * 0.7, y: b.y - r * 0.05 };
  var tgt = pfDirtyTarget(b, v, kind), chamber, ctl;
  if (kind === "hook") {
    chamber = { x: b.x + sx * r * 0.25, y: b.y - r * 0.55 };
    ctl = { x: (b.x + v.x) / 2, y: Math.min(chamber.y, tgt.y) - r * 0.55 };
  } else {
    chamber = { x: b.x + sx * r * 0.45, y: b.y + r * 0.62 };
    ctl = { x: tgt.x - sx * r * 0.1, y: Math.max(chamber.y, tgt.y) + r * 0.35 };
  }
  var drive = function (k) { var a1 = 1 - k; return { x: a1 * a1 * chamber.x + 2 * a1 * k * ctl.x + k * k * tgt.x, y: a1 * a1 * chamber.y + 2 * a1 * k * ctl.y + k * k * tgt.y }; };
  var hd;
  if (!active) hd = rest;
  else if (p < 0.35) { var k1 = pfEase(p / 0.35); hd = { x: rest.x + (chamber.x - rest.x) * k1, y: rest.y + (chamber.y - rest.y) * k1 }; }
  else if (p < 0.7) hd = drive(pfEase((p - 0.35) / 0.35));
  else { var k3 = pfEase((p - 0.7) / 0.3); hd = { x: tgt.x + (rest.x - tgt.x) * k3, y: tgt.y + (rest.y - tgt.y) * k3 }; }
  if (active && p > 0.38 && p < 0.95) {
    var upto = Math.min(1, (p - 0.35) / 0.35), from = Math.max(0, upto - 0.7), fade = p < 0.7 ? 1 : 1 - (p - 0.7) / 0.25;
    ctx.save(); ctx.lineCap = "round";
    [[theme.wall, limb * 0.8 + 4, 0.3], ["#ffffff", limb * 0.8, 0.9]].forEach(function (pass) {
      ctx.globalAlpha = pass[2] * fade; ctx.strokeStyle = pass[0]; ctx.lineWidth = pass[1];
      ctx.beginPath();
      for (var i = 0; i <= 10; i++) { var q = drive(from + (upto - from) * i / 10); if (i) ctx.lineTo(q.x, q.y); else ctx.moveTo(q.x, q.y); }
      ctx.stroke();
    });
    ctx.restore();
  }
  // Elbow: tucked under for the uppercut, up and out for the hook.
  var elR = kind === "hook" && active ? { x: (shR.x + hd.x) / 2 - sx * r * 0.1, y: Math.min(shR.y, hd.y) - r * 0.25 }
    : { x: (shR.x + hd.x) / 2 - sx * r * 0.15, y: Math.max(shR.y, hd.y) + r * 0.22 };
  strokeLimb(limb, armColor(b.char, -1), function () { ctx.moveTo(shR.x, shR.y); ctx.quadraticCurveTo(elR.x, elR.y, hd.x, hd.y); });
  var punching = active && p > 0.45 && p < 0.8;
  drawGloveAt(hd.x, hd.y, r * (punching ? 0.29 : 0.25), b.char, kind === "hook" ? (sx > 0 ? 0 : Math.PI) : -Math.PI / 2 + sx * 0.5);
}

// Covering up while he's dirty boxing them: gloves tight on the sides of his own head.
function pfCoverArms(b) {
  var r = b.r, limb = r * 0.2;
  [-1, 1].forEach(function (side) {
    var sh = { x: b.x + side * r * 0.62, y: b.y + r * 0.05 };
    var hd = { x: b.x + side * r * 0.5, y: b.y - r * 0.42 };
    var el = { x: b.x + side * r * 0.85, y: b.y - r * 0.12 };
    strokeLimb(limb, armColor(b.char, side), function () { ctx.moveTo(sh.x, sh.y); ctx.quadraticCurveTo(el.x, el.y, hd.x, hd.y); });
    drawGloveAt(hd.x, hd.y, r * 0.25, b.char, -Math.PI / 2);
  });
}

// Checking the kick: his lead leg comes up, knee turned out toward the kicker.
function pfCheckShin(b, atk, k) {
  var u = pfDir(b, atk), qx = -u.y, qy = u.x, r = b.r, e = Math.sin(Math.PI * Math.min(1, k));
  var hip = { x: b.x + u.x * r * 0.35 + qx * r * 0.35, y: b.y + u.y * r * 0.35 + qy * r * 0.35 + r * 0.25 };
  var knee = { x: hip.x + (u.x * 0.75 + qx * 0.55) * r * (0.45 + 0.4 * e), y: hip.y + (u.y * 0.75 + qy * 0.55) * r * (0.45 + 0.4 * e) - r * 0.2 * e };
  var foot = { x: knee.x - u.x * r * 0.15 + qx * r * 0.35, y: knee.y - u.y * r * 0.15 + qy * r * 0.35 + r * 0.45 };
  drawBjjLeg(b.char, hip, knee, foot, r * 0.17, 0, r * 0.3);
  if (k < 0.45) {
    ctx.save(); ctx.globalAlpha = 1 - k / 0.45; ctx.fillStyle = "#ffffff";
    ctx.beginPath(); ctx.arc(knee.x, knee.y, r * 0.28, 0, Math.PI * 2); ctx.fill(); ctx.restore();
  }
}
