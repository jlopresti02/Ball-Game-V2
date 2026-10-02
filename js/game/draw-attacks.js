// Drawing each attack: fists, kicks, hands, throws, lasers, spins, grabs.
"use strict";

function drawFist(self, other) {
  if (!self.punch || !other.alive || self.taunt || self.flow || self.combo) return;
  var pu = self.char.punch;
  var qx = other.x - self.x, qy = other.y - self.y, qd = Math.sqrt(qx * qx + qy * qy) || 1;
  var qnx = qx / qd, qny = qy / qd;
  var windup = pu.speed * 0.35;
  var pt = self.punch.t < windup ? self.punch.t / windup : 1 - (self.punch.t - windup) / (pu.speed - windup);
  pt = Math.max(0, Math.min(1, pt));
  var restDist = self.r + 4;
  var fullDist = Math.max(restDist, qd - other.r + 4);
  var fistDist = restDist + (fullDist - restDist) * pt;
  // Punch always launches from the same shoulder slot the guard hand rests
  // in (drawHands hides that one hand while this animates), so it reads as
  // one hand throwing the punch while the other stays up.
  var perpx = -qny, perpy = qnx, gap = self.r * 0.4;
  var fistX = self.x + qnx * fistDist + perpx * gap, fistY = self.y + qny * fistDist + perpy * gap;
  var armX = self.x + qnx * (self.r - 2) + perpx * gap, armY = self.y + qny * (self.r - 2) + perpy * gap;
  ctx.save();
  ctx.lineCap = "round";
  ctx.strokeStyle = theme.wall;
  ctx.lineWidth = pu.size * 0.9 + 6;
  ctx.beginPath(); ctx.moveTo(armX, armY); ctx.lineTo(fistX, fistY); ctx.stroke();
  ctx.strokeStyle = self.char.color;
  ctx.lineWidth = pu.size * 0.6;
  ctx.beginPath(); ctx.moveTo(armX, armY); ctx.lineTo(fistX, fistY); ctx.stroke();
  ctx.fillStyle = self.char.color;
  ctx.strokeStyle = theme.wall;
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(fistX, fistY, pu.size, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.restore();
}

function drawKick(self, other) {
  if (!self.kick || !other.alive || self.taunt || self.flow || self.combo) return;
  var ki = self.char.kick;
  var qx = other.x - self.x, qy = other.y - self.y, qd = Math.sqrt(qx * qx + qy * qy) || 1;
  var baseAngle = Math.atan2(qy, qx);
  var dur = ki.speed;
  var pt = Math.max(0, Math.min(1, self.kick.t / dur));
  // Quick roundhouse: the leg sweeps through a 180-degree arc, passing
  // through the opponent's direction around the midpoint of the swing.
  var dir = self.id === 0 ? 1 : -1;
  var angle = baseAngle - dir * (Math.PI / 2) + dir * Math.PI * pt;
  var restDist = self.r + 4;
  var fullDist = Math.max(restDist, Math.min(qd - other.r + 4, ki.reach * 1.15), ki.reach * 0.9);
  var extT = Math.min(1, self.kick.t / (dur * 0.22));
  var legDist = restDist + (fullDist - restDist) * extT;
  var tipX = self.x + Math.cos(angle) * legDist, tipY = self.y + Math.sin(angle) * legDist;
  var hipX = self.x + Math.cos(angle) * (self.r - 4), hipY = self.y + Math.sin(angle) * (self.r - 4);

  ctx.save();
  ctx.lineCap = "round";
  ctx.strokeStyle = theme.wall;
  ctx.lineWidth = ki.size * 0.9 + 7;
  ctx.beginPath(); ctx.moveTo(hipX, hipY); ctx.lineTo(tipX, tipY); ctx.stroke();
  ctx.strokeStyle = self.char.color;
  ctx.lineWidth = ki.size * 0.62;
  ctx.beginPath(); ctx.moveTo(hipX, hipY); ctx.lineTo(tipX, tipY); ctx.stroke();

  // Foot: a rectangle oriented with the swing, planted at the tip of the leg.
  var fw = ki.size * 1.9, fh = ki.size * 1.15;
  ctx.translate(tipX, tipY);
  ctx.rotate(angle);
  ctx.fillStyle = self.char.color;
  ctx.strokeStyle = theme.wall;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.rect(-fw * 0.25, -fh / 2, fw, fh);
  ctx.fill(); ctx.stroke();
  ctx.restore();
}

// Every fighter keeps a pair of hands up in front of it, facing whichever
// way it's currently moving (or the opponent, if it's holding still).
// A projectile-thrower's hands always track its opponent instead, since
// it's constantly aiming. During a punch or a throw, only the off-side
// hand stays up here; drawFist/drawThrow animates the other one. During a
// kick, grab, being grabbed, a power-punch throw, or a rage charge dash,
// both are replaced by that attack's own visual.
function drawHands(b, other) {
  var spinning = b.powerState && b.powerState.phase === "attack";
  var raging = b.rageState && b.rageState.phase === "attack";
  var sitting = b.watcherState && (b.watcherState.phase === "charge" || b.watcherState.phase === "laser");
  if (!b.alive || b.koOut || b.kick || b.grappled || b.grapple || b.sprawl || spinning || raging || b.combo || b.swing) return;
  if (b.taunt && b.taunt.t < 0) return; // the punch is still finishing
  if (b.koRush && b.koRush.phase === "celebrate") return; // hands up (drawn by drawKoCelebrate)
  if (b.taunt) {
    // Celebrating: both hands thrown up in the air, pumping in turn.
    var tt = b.taunt.t;
    ctx.save();
    ctx.lineCap = "round";
    [-1, 1].forEach(function (sgn, i) {
      var pump = Math.max(0, Math.sin(tt * 11 + i * Math.PI)) * b.r * 0.4;
      var hx = b.x + sgn * b.r * 0.85, hy = b.y - b.r * 1.05 - pump;
      var sx = b.x + sgn * b.r * 0.62, sy = b.y - b.r * 0.55;
      ctx.strokeStyle = theme.wall; ctx.lineWidth = b.r * 0.34;
      ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(hx, hy); ctx.stroke();
      ctx.strokeStyle = b.char.color; ctx.lineWidth = b.r * 0.2;
      ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(hx, hy); ctx.stroke();
      ctx.fillStyle = b.char.color; ctx.strokeStyle = theme.wall; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.arc(hx, hy, b.r * 0.32, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    });
    ctx.restore();
    return;
  }
  if (sitting) {
    // Seated: both hands rest down at the sides instead of guarding.
    ctx.save();
    ctx.fillStyle = b.char.color; ctx.strokeStyle = theme.wall; ctx.lineWidth = 2.5;
    [-1, 1].forEach(function (sgn) {
      ctx.beginPath();
      ctx.arc(b.x + sgn * b.r * 0.95, b.y + b.r * 0.62, b.r * 0.3, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();
    });
    ctx.restore();
    return;
  }
  var fx, fy;
  // Shelled up (or guarding while backing off after IGBB): faces the opponent.
  var shell = b.shelled || (b.igbb && b.igbb.phase !== "close");
  if ((b.char.hasProjectile || shell) && other && other.alive) {
    var dx2 = other.x - b.x, dy2 = other.y - b.y, dd2 = Math.sqrt(dx2 * dx2 + dy2 * dy2) || 1;
    fx = dx2 / dd2; fy = dy2 / dd2;
  } else {
    var spd = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
    if (spd > 1) {
      fx = b.vx / spd; fy = b.vy / spd;
    } else if (other && other.alive) {
      var dx = other.x - b.x, dy = other.y - b.y, dd = Math.sqrt(dx * dx + dy * dy) || 1;
      fx = dx / dd; fy = dy / dd;
    } else {
      fx = b.id === 0 ? 1 : -1; fy = 0;
    }
  }
  var perpx = -fy, perpy = fx;
  var fwd = b.r * 0.8, gap = b.r * 0.4, hr = b.r * 0.3;
  if (b.shelled) { fwd = b.r * 0.9; gap = b.r * 0.22; hr = b.r * 0.34; } // tight shell, gloves together
  var koHook = b.koRush && (b.koRush.phase === "run" || b.koRush.phase === "throw");
  var igbbGrab = b.igbb && (b.igbb.phase === "grab" || b.igbb.phase === "throw");
  var sides = (b.punch || b.throwAnim || koHook || igbbGrab) ? [-1] : (b.koPunch ? [-(b.koPunch.side || 1)] : [1, -1]);
  ctx.save();
  ctx.fillStyle = b.char.color;
  ctx.strokeStyle = theme.wall;
  ctx.lineWidth = 2.5;
  sides.forEach(function (sgn) {
    var hx = b.x + fx * fwd + perpx * gap * sgn, hy = b.y + fy * fwd + perpy * gap * sgn;
    ctx.beginPath(); ctx.arc(hx, hy, hr, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  });
  ctx.restore();
}

// A telegraphed throw: the hand pulls back to wind up, whips forward hard
// right as the projectile releases, then eases back to guard. The other
// hand stays up per drawHands above.
function drawThrow(self, other) {
  if (!self.throwAnim || !other) return;
  var ta = self.throwAnim;
  var pt = Math.min(1, ta.t / ta.dur);
  var dx = other.x - self.x, dy = other.y - self.y, dd = Math.sqrt(dx * dx + dy * dy) || 1;
  var fx = dx / dd, fy = dy / dd, perpx = -fy, perpy = fx;

  var restFwd = self.r * 0.8, cockFwd = -self.r * 0.35, throwFwd = self.r * 1.85;
  var gapRest = self.r * 0.4, gapCock = self.r * 0.85, gapThrow = self.r * 0.15;
  var fwd, gap, trail = false;
  if (pt < ta.wEnd) {
    // Windup: pull the hand back and out wide.
    var t1 = pt / ta.wEnd;
    var e1 = t1 * t1 * (3 - 2 * t1); // smoothstep
    fwd = restFwd + (cockFwd - restFwd) * e1;
    gap = gapRest + (gapCock - gapRest) * e1;
  } else if (pt < ta.relEnd) {
    // Whip forward hard — this is the release.
    var t2 = (pt - ta.wEnd) / (ta.relEnd - ta.wEnd);
    var e2 = 1 - Math.pow(1 - t2, 2);
    fwd = cockFwd + (throwFwd - cockFwd) * e2;
    gap = gapCock + (gapThrow - gapCock) * e2;
    trail = true;
  } else {
    // Follow-through back to guard.
    var t3 = (pt - ta.relEnd) / (1 - ta.relEnd);
    var e3 = t3 * t3 * (3 - 2 * t3);
    fwd = throwFwd + (restFwd - throwFwd) * e3;
    gap = gapThrow + (gapRest - gapThrow) * e3;
  }

  var hx = self.x + fx * fwd + perpx * gap, hy = self.y + fy * fwd + perpy * gap;
  var shx = self.x + fx * (self.r * 0.25) + perpx * gap * 0.6, shy = self.y + fy * (self.r * 0.25) + perpy * gap * 0.6;

  if (trail) {
    ctx.save();
    ctx.lineCap = "round";
    ctx.strokeStyle = self.char.color;
    for (var k = 1; k <= 2; k++) {
      ctx.globalAlpha = 0.3 - k * 0.1;
      var back = k * 9;
      ctx.beginPath();
      ctx.moveTo(hx - fx * back, hy - fy * back);
      ctx.lineTo(hx - fx * (back + 7), hy - fy * (back + 7));
      ctx.lineWidth = self.r * 0.22;
      ctx.stroke();
    }
    ctx.restore();
  }

  ctx.save();
  ctx.lineCap = "round";
  ctx.strokeStyle = self.char.color;
  ctx.lineWidth = self.r * 0.28;
  ctx.beginPath(); ctx.moveTo(shx, shy); ctx.lineTo(hx, hy); ctx.stroke();
  ctx.fillStyle = self.char.color;
  ctx.strokeStyle = theme.wall;
  ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.arc(hx, hy, self.r * 0.3, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.restore();
}

// Marks the four corner seats the Watcher can sit in (only shown when a
// Watcher is in the match); a seat lights up while it's in use.
function drawSitSpots() {
  var watchers = balls.filter(function (b) { return b.char.hasWatcher; });
  if (!watchers.length) return;
  ctx.save();
  ctx.lineWidth = 2.5;
  ctx.setLineDash([5, 5]);
  SIT_SPOTS.forEach(function (sp) {
    var owner = null;
    watchers.forEach(function (w) { if (w.watcherState && w.watcherState.spot === sp) owner = w; });
    var col = (owner || watchers[0]).char.color;
    ctx.strokeStyle = col;
    ctx.globalAlpha = owner ? 0.9 : 0.4;
    ctx.beginPath(); ctx.arc(sp.x, sp.y, RADIUS + 3, 0, Math.PI * 2); ctx.stroke();
    if (owner) {
      ctx.globalAlpha = 0.14; ctx.fillStyle = col;
      ctx.beginPath(); ctx.arc(sp.x, sp.y, RADIUS + 3, 0, Math.PI * 2); ctx.fill();
    }
  });
  ctx.restore();
}

// The Watcher's weapon: a fan of beams from the middle of its body that
// lock onto the opponent and follow them (they're redrawn from wherever
// the opponent is, every frame). While it's still charging, a glowing orb
// swells at its center and faint aim lines hint at where they'll go.
function drawWatcherLasers() {
  var now = performance.now();
  balls.forEach(function (w) {
    var ws = w.watcherState;
    if (!w.alive || !w.char.hasWatcher || !ws) return;
    if (ws.phase !== "charge" && ws.phase !== "laser") return;
    var wc = w.char.watcher;
    var tgt = balls[1 - w.id];
    var n = Math.max(1, Math.round(wc.lasers));
    var firing = ws.phase === "laser";
    var p = firing ? 1 : Math.max(0, Math.min(1, (ws.t - wc.preDelay) / wc.chargeDur));
    if (p <= 0) return;
    ctx.save();
    ctx.lineCap = "round";
    if (tgt.alive) {
      var dx = tgt.x - w.x, dy = tgt.y - w.y, dd = Math.sqrt(dx * dx + dy * dy) || 1;
      var px = -dy / dd, py = dx / dd;
      var spread = tgt.r * 1.3;
      for (var i = 0; i < n; i++) {
        var off = n === 1 ? 0 : (i / (n - 1) - 0.5) * spread;
        var ex = tgt.x + px * off, ey = tgt.y + py * off;
        ctx.beginPath(); ctx.moveTo(w.x, w.y); ctx.lineTo(ex, ey);
        if (firing) {
          var flick = 0.85 + 0.15 * Math.sin(now / 45 + i * 1.7);
          ctx.strokeStyle = w.char.color;
          ctx.globalAlpha = 0.28 * flick; ctx.lineWidth = 13; ctx.stroke();
          ctx.globalAlpha = 0.85 * flick; ctx.lineWidth = 5; ctx.stroke();
          ctx.strokeStyle = "#ffffff";
          ctx.globalAlpha = 1; ctx.lineWidth = 1.8; ctx.stroke();
          ctx.fillStyle = w.char.color; ctx.globalAlpha = 0.65 * flick;
          ctx.beginPath(); ctx.arc(ex, ey, 6 + 2 * Math.sin(now / 60 + i), 0, Math.PI * 2); ctx.fill();
        } else {
          ctx.strokeStyle = w.char.color;
          ctx.globalAlpha = 0.08 + 0.3 * p; ctx.lineWidth = 1.5; ctx.stroke();
        }
      }
    }
    // The emitter at the fighter's center, swelling as it charges.
    var orbR = 3 + 10 * p;
    ctx.globalAlpha = 0.35 + 0.35 * p; ctx.fillStyle = w.char.color;
    ctx.beginPath(); ctx.arc(w.x, w.y, orbR + 4, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1; ctx.fillStyle = "#ffffff";
    ctx.beginPath(); ctx.arc(w.x, w.y, orbR * 0.55, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  });
}

// A quick single-hand jab flash, one per punch thrown during Sees Red's
// charge dash — fast enough to read as a flurry rather than one big swing.
function drawJab(self) {
  if (!self.jabAnim) return;
  var ja = self.jabAnim;
  var pt = Math.min(1, ja.t / ja.dur);
  var ease = pt < 0.5 ? pt / 0.5 : 1 - (pt - 0.5) / 0.5;
  var spd = Math.sqrt(self.vx * self.vx + self.vy * self.vy);
  var fx = 1, fy = 0;
  if (ja.dx != null) { fx = ja.dx; fy = ja.dy; } // aimed at a target (combo punches)
  else if (spd > 1) { fx = self.vx / spd; fy = self.vy / spd; }
  var perpx = -fy, perpy = fx, gap = self.r * 0.4 * ja.sign;
  // The combo's finishing blow reaches much further with a bigger fist.
  var restFwd = self.r * 0.8, jabFwd = self.r * (ja.big ? 2.3 : 1.5);
  var fwd = restFwd + (jabFwd - restFwd) * ease;
  var hx = self.x + fx * fwd + perpx * gap, hy = self.y + fy * fwd + perpy * gap;
  var fistR = self.r * (ja.big ? 0.48 : 0.3);
  ctx.save();
  if (ja.big) {
    ctx.lineCap = "round";
    var sx = self.x + fx * self.r * 0.6 + perpx * gap, sy = self.y + fy * self.r * 0.6 + perpy * gap;
    ctx.strokeStyle = theme.wall; ctx.lineWidth = self.r * 0.38;
    ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(hx, hy); ctx.stroke();
    ctx.strokeStyle = self.char.color; ctx.lineWidth = self.r * 0.24;
    ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(hx, hy); ctx.stroke();
  }
  ctx.fillStyle = self.char.color;
  ctx.strokeStyle = theme.wall;
  ctx.lineWidth = ja.big ? 3.5 : 2.5;
  ctx.beginPath(); ctx.arc(hx, hy, fistR, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.restore();
}

// A wild windmill haymaker: one arm spins around the fighter through the
// full 3 turns of the throw, with a couple of trailing ghost-fists behind
// it to sell the force. No hand is left up guarding during this.
function drawPowerSpin(self) {
  if (!self.powerState || self.powerState.phase !== "attack") return;
  var pp = self.char.powerPunch;
  var angle = (self.powerState.t / pp.spinDur) * Math.PI * 2 * 3;
  var armLen = self.r * POWER_ARM_LEN_MULT;
  var fistR = self.r * POWER_FIST_R_MULT;
  ctx.save();
  ctx.lineCap = "round";
  for (var k = 2; k >= 0; k--) {
    var a = angle - k * 0.3;
    var hx = self.x + Math.cos(a) * (self.r + armLen), hy = self.y + Math.sin(a) * (self.r + armLen);
    if (k === 0) {
      var sx = self.x + Math.cos(a) * (self.r - 2), sy = self.y + Math.sin(a) * (self.r - 2);
      ctx.globalAlpha = 1;
      ctx.strokeStyle = theme.wall;
      ctx.lineWidth = self.r * 0.5;
      ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(hx, hy); ctx.stroke();
      ctx.strokeStyle = self.char.color;
      ctx.lineWidth = self.r * 0.34;
      ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(hx, hy); ctx.stroke();
      ctx.fillStyle = self.char.color;
      ctx.strokeStyle = theme.wall;
      ctx.lineWidth = 4;
      ctx.beginPath(); ctx.arc(hx, hy, fistR, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    } else {
      ctx.globalAlpha = 0.3 - k * 0.09;
      ctx.fillStyle = self.char.color;
      ctx.beginPath(); ctx.arc(hx, hy, self.r * 0.42, 0, Math.PI * 2); ctx.fill();
    }
  }
  ctx.restore();
}

function drawGrapple(self) {
  var g = self.grapple;
  if (!g) return;
  if (g.finisher && g.phase !== "carry") return; // the pin is drawn by drawFinishers
  if (g.phase === "iowa") {
    // Iowa Style: both hands shoving the opponent flat into the wall.
    var tg = balls[g.targetId];
    var px = -g.ny, py = g.nx, hr0 = tg.r * 0.36;
    ctx.save();
    ctx.fillStyle = self.char.color; ctx.strokeStyle = theme.wall; ctx.lineWidth = 2.5;
    [1, -1].forEach(function (sgn) {
      var hx = tg.x + g.nx * tg.r * 0.55 + px * tg.r * 0.62 * sgn, hy = tg.y + g.ny * tg.r * 0.55 + py * tg.r * 0.62 * sgn;
      ctx.beginPath(); ctx.arc(hx, hy, hr0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    });
    ctx.restore();
    return;
  }
  var tgt = balls[g.targetId];
  if (!tgt) return;
  var pt = g.pt || 0;
  var dx = g.endX - g.startX, dy = g.endY - g.startY, dlen = Math.sqrt(dx * dx + dy * dy) || 1;
  var dirx = dx / dlen, diry = dy / dlen, perpx = -diry, perpy = dirx;

  // Speed streaks trailing behind the ball once the throw is under way.
  if (pt > 0.18) {
    ctx.save();
    ctx.strokeStyle = self.char.color;
    ctx.lineCap = "round";
    ctx.lineWidth = 3;
    for (var k = 1; k <= 3; k++) {
      var back = tgt.r + k * 13;
      ctx.globalAlpha = 0.45 - k * 0.1;
      ctx.beginPath();
      ctx.moveTo(tgt.x - dirx * back, tgt.y - diry * back);
      ctx.lineTo(tgt.x - dirx * (back + 11), tgt.y - diry * (back + 11));
      ctx.stroke();
    }
    ctx.restore();
  }

  // Two hands gripping the ball while it's held, released just before impact.
  if (pt < 0.82) {
    var hr = tgt.r * 0.34, ho = tgt.r * 0.82;
    ctx.save();
    ctx.fillStyle = self.char.color;
    ctx.strokeStyle = theme.wall;
    ctx.lineWidth = 2.5;
    [1, -1].forEach(function (sgn) {
      var hx = tgt.x + perpx * ho * sgn, hy = tgt.y + perpy * ho * sgn;
      ctx.beginPath(); ctx.arc(hx, hy, hr, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    });
    ctx.restore();
  }
}

// A checked kick: the shin raised and turned out toward the kicker.
function drawCheck(b) {
  var ca = b.checkAnim;
  if (!ca || !b.alive) return;
  var atk = balls[ca.towardId];
  var dx = atk.x - b.x, dy = atk.y - b.y, d = Math.sqrt(dx * dx + dy * dy) || 1;
  var nx = dx / d, ny = dy / d, px = -ny, py = nx;
  var k = Math.sin(Math.PI * Math.min(1, ca.t / CHECK_TIME)); // up, then back down
  var hipX = b.x + nx * b.r * 0.6 + px * b.r * 0.35, hipY = b.y + ny * b.r * 0.6 + py * b.r * 0.35;
  var len = b.r * (0.5 + 0.55 * k);
  var kx = hipX + (nx * 0.8 + px * 0.6) * len, ky = hipY + (ny * 0.8 + py * 0.6) * len;
  var size = b.char.kick.size;
  ctx.save();
  ctx.lineCap = "round";
  ctx.strokeStyle = theme.wall; ctx.lineWidth = size * 0.9 + 7;
  ctx.beginPath(); ctx.moveTo(hipX, hipY); ctx.lineTo(kx, ky); ctx.stroke();
  ctx.strokeStyle = b.char.color; ctx.lineWidth = size * 0.62;
  ctx.beginPath(); ctx.moveTo(hipX, hipY); ctx.lineTo(kx, ky); ctx.stroke();
  // A small impact flash on the shin.
  if (ca.t < 0.1) {
    ctx.globalAlpha = 1 - ca.t / 0.1;
    ctx.fillStyle = "#ffffff";
    ctx.beginPath(); ctx.arc(kx, ky, size * 0.9, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}
