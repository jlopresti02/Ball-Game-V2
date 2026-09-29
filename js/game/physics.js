// Movement, wall bounces and ball-vs-ball collisions.
"use strict";

function step(dt) {
  var i, b;
  for (i = 0; i < balls.length; i++) {
    b = balls[i];
    var spinning = b.powerState && b.powerState.phase === "attack";
    var sitting = b.watcherState && (b.watcherState.phase === "charge" || b.watcherState.phase === "laser");
    if (!b.alive || b.grappled || b.grapple || spinning || sitting) continue;
    b.x += b.vx * dt; b.y += b.vy * dt;
    var hitWall = false, wnx = 0, wny = 0;
    if (b.x < b.r) { b.x = b.r; b.vx = Math.abs(b.vx); hitWall = true; wnx = 1; }
    else if (b.x > W - b.r) { b.x = W - b.r; b.vx = -Math.abs(b.vx); hitWall = true; wnx = -1; }
    if (b.y < b.r) { b.y = b.r; b.vy = Math.abs(b.vy); hitWall = true; wny = 1; }
    else if (b.y > H - b.r) { b.y = H - b.r; b.vy = -Math.abs(b.vy); hitWall = true; wny = -1; }
    if (hitWall) {
      // A corner (two walls in the same instant) counts as one impact.
      if (b.slam) onWallImpact(b, wnx, wny);
      else playBounce();
    }
  }
  var a = balls[0], c = balls[1];
  var aSpin = a.powerState && a.powerState.phase === "attack";
  var cSpin = c.powerState && c.powerState.phase === "attack";
  var aSit = a.watcherState && (a.watcherState.phase === "charge" || a.watcherState.phase === "laser");
  var cSit = c.watcherState && (c.watcherState.phase === "charge" || c.watcherState.phase === "laser");
  // Sees Red keeps a normal collision box even mid-charge-dash, so it
  // still bounces off the opponent on contact like any other pair of
  // balls; only its punch damage is handled separately, on a timer.
  if (!a.alive || !c.alive || a.grappled || c.grappled || a.grapple || c.grapple || aSpin || cSpin) return;
  // A seated Watcher is an immovable, solid object: whoever runs into it
  // just bounces off, the way they would off a wall.
  if (aSit || cSit) {
    if (aSit && cSit) return;
    var fixedB = aSit ? a : c, mover = aSit ? c : a;
    var fdx = mover.x - fixedB.x, fdy = mover.y - fixedB.y, fdist = Math.sqrt(fdx * fdx + fdy * fdy);
    var fmin = fixedB.r + mover.r;
    if (fdist >= fmin || fdist === 0) return;
    var fnx = fdx / fdist, fny = fdy / fdist;
    mover.x = fixedB.x + fnx * fmin; mover.y = fixedB.y + fny * fmin;
    var fvn = mover.vx * fnx + mover.vy * fny;
    if (fvn < 0) {
      mover.vx -= 2 * fvn * fnx; mover.vy -= 2 * fvn * fny;
      if (!reduceMotion) shake = Math.max(shake, 2);
    }
    return;
  }
  var dx = c.x - a.x, dy = c.y - a.y, dist = Math.sqrt(dx * dx + dy * dy), minDist = a.r + c.r;
  if (dist >= minDist || dist === 0) return;
  var nx = dx / dist, ny = dy / dist, push = (minDist - dist) / 2;
  a.x -= nx * push; a.y -= ny * push; c.x += nx * push; c.y += ny * push;
  var vn = (c.vx - a.vx) * nx + (c.vy - a.vy) * ny;
  if (vn < 0) {
    a.vx += nx * vn; a.vy += ny * vn; c.vx -= nx * vn; c.vy -= ny * vn;
    if (!reduceMotion) shake = Math.max(shake, 2);
  }
}
