// Shared movement styles (Christian, 2026-11-15). Any fighter can opt in
// with a "movement" block in his character file; a fighter without one
// moves exactly as before (nothing here runs for him, and nothing here draws
// a random number for him). Ilia Topuria and Khabib Nurmagomedov use it.
//
// Every part is its own block; take a block out and that part is off.
// It only steers which way he's heading, never how fast (the speed
// regulator in physics.js still owns that), and only in ordinary movement:
// anything that takes hold of him, sends him flying, winds him up or runs a
// special leaves him alone.
//
//   "movement": {
//     "after": 0.6,          seconds into the fight before any of it starts
//     "press": {             WALKS THEM DOWN: always turning back toward them
//       "turn": 7,           how hard he turns toward them (radians a second;
//                            Fedor's stalk is 3.5, Volk's circling 9)
//       "lead": 0.2,         aims where they'll be this many seconds from now
//       "range": 600         only when they're this close (center to center)
//     },
//     "reset": {             a short reset after a combination: he stops
//       "combo": 3,          pressing for `time` seconds once a combo of at
//       "time": [0.15, 0.3]  least `combo` punches ends, then walks back in
//     },
//     "cutCage": {           CUTS THE CAGE: comes in from the middle of the
//       "weight": 0.9,       ring side so contact pushes them back toward the
//       "fade": 80           cage. `weight` is how hard he works round to that
//                            side (0 = straight at them); it fades out when
//                            they're within `fade` px of the middle
//     },
//     "sideStep": {          A SMALL SIDE STEP now and then: every `every`
//       "every": [6, 10],    seconds (at the next free moment with the gap
//                            between them inside `gap`) he
//       "time": [0.2, 0.3],  steps `angle` degrees off the line to them, to
//       "angle": 55,         a random side, for `time` seconds (turning at
//       "turn": 14,          `turn`), with a scuff of dust, then straight back
//       "gap": [0, 150]      in
//     },
//     "cageShots": {         TAKEDOWNS ON THE CAGE: with them within `near` px
//       "near": 30,          of the cage and him within `within` px of them,
//       "within": 40,        his takedown cooldown (grapple.cooldown) runs
//       "rate": 2            `rate` times as fast, so he shoots more often
//     }
//   }
//
// State is on b.mv: { t, step, stepT, reset, lastPunch, cutSide }.
// The fighter card lists each part (movementGalleryMoves, gallery.js).
"use strict";

function mvCfg(b) { return b && b.char && b.char.movement; }
function mvRand(r) { return Array.isArray(r) ? r[0] + Math.random() * (r[1] - r[0]) : (r || 0); }
// How far a fighter's edge is from the nearest cage wall.
function mvWall(b) { return Math.min(b.x - b.r, W - b.r - b.x, b.y - b.r, H - b.r - b.y); }

// From update(), after the abilities and before the speed regulator.
function tickMovement(dt) {
  balls.forEach(function (b) {
    var cfg = mvCfg(b);
    if (!cfg || !started || over || !b.alive) return;
    var other = balls[1 - b.id];
    if (!b.mv) b.mv = { t: 0, step: null, stepT: cfg.sideStep ? mvRand(cfg.sideStep.every) : 0, reset: null, lastPunch: null, cutSide: Math.random() < 0.5 ? 1 : -1 };
    var mv = b.mv;
    mv.t += dt;
    if (cfg.sideStep && !mv.step) mv.stepT -= dt; // (the next step waits for a free moment)
    mvResetTick(b, mv, cfg, dt);
    mvCageShots(b, other, cfg, dt);
    mvSteer(b, other, mv, cfg, dt);
  });
}

// A combo just ended: a short reset before he walks back in.
function mvResetTick(b, mv, cfg, dt) {
  var rc = cfg.reset, p = b.punch || null;
  if (rc && mv.lastPunch && !p && (mv.lastPunch.n || 1) >= (rc.combo || 2)) mv.reset = { t: 0, dur: mvRand(rc.time) };
  mv.lastPunch = p;
  if (mv.reset) { mv.reset.t += dt; if (mv.reset.t >= mv.reset.dur) mv.reset = null; }
}

// With them on the cage his takedown clock runs faster.
function mvCageShots(b, other, cfg, dt) {
  var cs = cfg.cageShots;
  if (!cs || !b.char.hasGrapple || !(b.grappleCd > 0) || !other.alive) return;
  var dx = other.x - b.x, dy = other.y - b.y, gap = Math.sqrt(dx * dx + dy * dy) - b.r - other.r;
  if (mvWall(other) >= (cs.near || 30) || gap >= (cs.within || 40)) return;
  b.grappleCd = Math.max(0, b.grappleCd - dt * (b.atkRate || 1) * ((cs.rate || 1) - 1));
}

function mvSteer(b, other, mv, cfg, dt) {
  var pr = cfg.press, ss = cfg.sideStep;
  if (!pr && !ss) return;
  if (!inOrdinaryMovement(b) || b.dizzy || b.angry || b.speedEase || b.knockFly > 0) { mv.step = null; return; }
  if (!other.alive || other.invincible || mv.t < (cfg.after || 0) || mv.reset) return;
  if (other.x < 0 || other.x > W || other.y < 0 || other.y > H) return; // (up in the air, off the screen)
  var s = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
  if (s < 1 || s > (b.baseSpeed || SPEED) * 1.3) return; // launched or knocked back: let it play out
  var dx = other.x - b.x, dy = other.y - b.y, d = Math.sqrt(dx * dx + dy * dy) || 1, gap = d - b.r - other.r;
  if (pr && d > (pr.range || 9999)) return;
  // Where he's heading: at them (where they'll be), worked round to the
  // middle-of-the-ring side if he cuts the cage.
  var lead = (pr && pr.lead) || 0;
  var tx = Math.min(W - other.r, Math.max(other.r, other.x + other.vx * lead));
  var ty = Math.min(H - other.r, Math.max(other.r, other.y + other.vy * lead));
  var ax = tx - b.x, ay = ty - b.y, al = Math.sqrt(ax * ax + ay * ay) || 1;
  ax /= al; ay /= al;
  if (cfg.cutCage) { var c = mvCut(b, other, mv, cfg.cutCage, ax, ay); ax = c[0]; ay = c[1]; }
  var want = Math.atan2(ay, ax), turn = (pr && pr.turn) || 0;
  // The side step.
  if (ss) {
    if (mv.step) {
      mv.step.t += dt;
      if (mv.step.t >= mv.step.dur) mv.step = null;
    } else {
      var g = ss.gap || [0, 9999];
      if (mv.stepT <= 0 && gap >= g[0] && gap <= g[1]) {
        mv.step = { t: 0, dur: mvRand(ss.time || 0.25), dir: Math.random() < 0.5 ? 1 : -1 };
        mv.stepT = mvRand(ss.every);
        mvStepDust(b);
        playMvStep();
      }
    }
    if (mv.step) { want = Math.atan2(dy, dx) + mv.step.dir * (ss.angle || 55) * Math.PI / 180; turn = ss.turn || 14; }
  }
  if (!turn) return;
  var cur = Math.atan2(b.vy, b.vx), diff = Math.atan2(Math.sin(want - cur), Math.cos(want - cur));
  var st = Math.max(-turn * dt, Math.min(turn * dt, diff));
  b.vx = Math.cos(cur + st) * s; b.vy = Math.sin(cur + st) * s;
}

// Cutting the cage: the heading at them, bent round toward the side of them
// that faces the middle of the ring. From there, running into them shoves
// them back toward the cage.
function mvCut(b, other, mv, cc, ux, uy) {
  var cx = other.x - W / 2, cy = other.y - H / 2, cd = Math.sqrt(cx * cx + cy * cy);
  if (cd < 1) return [ux, uy];
  var wx = cx / cd, wy = cy / cd;          // from the middle out through them
  var dot = ux * wx + uy * wy;             // 1: he's on the middle side already
  var qx = -wx + dot * ux, qy = -wy + dot * uy; // across the line to them, toward the middle side
  if (dot < -0.85) { qx = -uy * mv.cutSide; qy = ux * mv.cutSide; } // right behind them: pick a way round
  var k = (cc.weight || 0) * Math.min(1, cd / (cc.fade || 80));
  return [ux + qx * k, uy + qy * k];
}

function mvStepDust(b) {
  if (reduceMotion) return;
  for (var i = 0; i < 6; i++) {
    var a = Math.PI * (0.15 + 0.7 * Math.random());
    particles.push({ x: b.x + (Math.random() - 0.5) * b.r, y: b.y + b.r * 0.9, vx: Math.cos(a) * 90 * (Math.random() < 0.5 ? -1 : 1), vy: -Math.sin(a) * 40,
      life: 0.3, max: 0.3, size: 3, color: "rgba(170,150,120,0.65)" });
  }
}

// A soft scuff of the feet on the mat.
function playMvStep() {
  try {
    var ac = getAudioCtx();
    if (!ac) return;
    if (ac.state === "suspended") ac.resume();
    caneBurst(ac, ac.currentTime, 2400, 1.4, 0.04, 0.05);
  } catch (e) { /* never let audio break the game */ }
}

// The fighter card's move list (gallery.js).
function movementGalleryMoves(ch, add) {
  var m = ch.movement, pr = m.press, rc = m.reset, cc = m.cutCage, ss = m.sideStep, cs = m.cageShots;
  if (pr) add("👣", "Walks them down", "Keeps turning back toward them, aiming where they're going, so he's always coming forward." +
    (rc ? " After a combination he takes a short reset (" + rc.time[0] + "-" + rc.time[1] + "s), then walks straight back in." : ""));
  if (cc) add("🧱", "Cuts the cage", "Works round to the middle-of-the-ring side of them before he comes in, so every collision pushes them back toward the cage.");
  if (ss) add("↔️", "Side step", "Every " + ss.every[0] + "-" + ss.every[1] + "s a small step to one side, then straight back in.");
  if (cs) add("🤼", "Against the cage", "With them on the cage and him right on them, his takedown attempts come " + cs.rate + "x as often.");
}
