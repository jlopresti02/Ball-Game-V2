// Drawing the arena, fighters, projectiles and damage numbers.
"use strict";

function draw() {
  readTheme();
  var s = canvas.width / W;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = theme.floor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  var sx = 0, sy = 0;
  if (shake > 0) { sx = (Math.random() - 0.5) * shake * 2 * s; sy = (Math.random() - 0.5) * shake * 2 * s; }
  ctx.setTransform(s, 0, 0, s, sx, sy);

  ctx.strokeStyle = theme.grid; ctx.lineWidth = 1.5; ctx.beginPath();
  for (var gx = 50; gx < W; gx += 50) { ctx.moveTo(gx, 0); ctx.lineTo(gx, H); }
  for (var gy = 50; gy < H; gy += 50) { ctx.moveTo(0, gy); ctx.lineTo(W, gy); }
  ctx.stroke();
  ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(W / 2, 0); ctx.lineTo(W / 2, H); ctx.stroke();
  ctx.beginPath(); ctx.arc(W / 2, H / 2, W * 0.15, 0, Math.PI * 2); ctx.stroke();

  drawSitSpots();

  particles.forEach(function (p) {
    ctx.globalAlpha = Math.max(0, p.life / p.max);
    ctx.fillStyle = p.color;
    ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
  });
  ctx.globalAlpha = 1;

  // Wall-slam shockwaves: a ring blasting out from the point of impact and
  // jagged crack lines spiking off the wall.
  impacts.forEach(function (im) {
    var k = Math.max(0, im.life / im.max), grow = 1 - k;
    var base = Math.atan2(im.ny, im.nx);
    ctx.save();
    ctx.lineCap = "round";
    ctx.globalAlpha = k;
    ctx.strokeStyle = im.color;
    ctx.lineWidth = 7 * k + 1;
    ctx.beginPath(); ctx.arc(im.x, im.y, 12 + 78 * grow, base - Math.PI / 2, base + Math.PI / 2); ctx.stroke();
    ctx.strokeStyle = theme.wall;
    ctx.lineWidth = 3;
    for (var ci = 0; ci < 6; ci++) {
      var ca = base + (ci / 5 - 0.5) * 2.6 + Math.sin(ci * 12.9 + im.x) * 0.12;
      var len = (22 + (ci % 3) * 12) * Math.min(1, grow * 4);
      var midA = ca + 0.25 * (ci % 2 ? 1 : -1);
      ctx.beginPath();
      ctx.moveTo(im.x, im.y);
      ctx.lineTo(im.x + Math.cos(midA) * len * 0.5, im.y + Math.sin(midA) * len * 0.5);
      ctx.lineTo(im.x + Math.cos(ca) * len, im.y + Math.sin(ca) * len);
      ctx.stroke();
    }
    // White-hot flash right at the contact point.
    ctx.globalAlpha = k * k;
    ctx.fillStyle = "#ffffff";
    ctx.beginPath(); ctx.arc(im.x, im.y, 18 * k + 4, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  });

  balls.forEach(function (b) {
    if (!b.alive) return;
    var other = balls[1 - b.id];

    // Weaving slips the whole fighter sideways for a moment, and a taunting
    // fighter bounces on the spot. Everything below draws at the shifted spot.
    var wox = 0, woy = 0;
    if (b.weaveAnim) {
      var wa = b.weaveAnim, wk = Math.sin(Math.PI * wa.t / wa.dur);
      var wsp = Math.sqrt(b.vx * b.vx + b.vy * b.vy), wfx = 1, wfy = 0;
      if (wsp > 1) { wfx = b.vx / wsp; wfy = b.vy / wsp; }
      wox = -wfy * wa.sign * b.r * 0.75 * wk;
      woy = wfx * wa.sign * b.r * 0.75 * wk;
    }
    if (b.taunt && b.taunt.t > 0) woy -= Math.abs(Math.sin(b.taunt.t * 11)) * 6;
    b.x += wox; b.y += woy;

    // While charging a power punch or rage attack, the ball jitters with
    // rising intensity; while throwing the power punch specifically, the
    // whole body spins through the same 3 turns as the windmilling fist.
    var jx = 0, jy = 0, spinAngle = 0, spinning = false;
    if (b.powerState) {
      if (b.powerState.phase === "charge") {
        var prog = b.powerState.t / b.char.powerPunch.chargeDur;
        var mag = 1 + 5 * prog;
        jx = (Math.random() - 0.5) * mag;
        jy = (Math.random() - 0.5) * mag;
      } else if (b.powerState.phase === "attack") {
        spinning = true;
        spinAngle = (b.powerState.t / b.char.powerPunch.spinDur) * Math.PI * 2 * 3;
      }
    } else if (b.rageState && b.rageState.phase === "charge") {
      var rprog = b.rageState.t / b.char.rage.chargeDur;
      var rmag = 1 + 5 * rprog;
      jx = (Math.random() - 0.5) * rmag;
      jy = (Math.random() - 0.5) * rmag;
    }

    ctx.save();
    ctx.translate(b.x + jx, b.y + jy);
    if (spinning) ctx.rotate(spinAngle);
    ctx.translate(-b.x, -b.y);
    if (b.watcherState && (b.watcherState.phase === "charge" || b.watcherState.phase === "laser")) {
      // Sitting: squashed down toward the ground, a little wider.
      ctx.translate(b.x, b.y + b.r);
      ctx.scale(1.08, 0.88);
      ctx.translate(-b.x, -(b.y + b.r));
    }
    if (b.squash) {
      // Just slammed into a wall: flattened against it, bulging sideways.
      var sq = b.squash, k = sq.t / sq.max;
      var ax = b.x - sq.nx * b.r, ay = b.y - sq.ny * b.r;
      ctx.translate(ax, ay);
      ctx.rotate(Math.atan2(sq.ny, sq.nx));
      ctx.scale(1 - 0.38 * k, 1 + 0.28 * k);
      ctx.rotate(-Math.atan2(sq.ny, sq.nx));
      ctx.translate(-ax, -ay);
    }

    var img = getImg(b.char.imgData);
    if (img) {
      ctx.save();
      ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2); ctx.closePath(); ctx.clip();
      ctx.drawImage(img, b.x - b.r, b.y - b.r, b.r * 2, b.r * 2);
      ctx.restore();
    } else {
      ctx.fillStyle = b.char.color;
      ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.28)";
      ctx.beginPath(); ctx.ellipse(b.x - b.r * 0.35, b.y - b.r * 0.4, b.r * 0.32, b.r * 0.2, -0.6, 0, Math.PI * 2); ctx.fill();
    }
    if (b.flash > 0) {
      ctx.fillStyle = "rgba(255,255,255," + (b.flash / 0.16) * 0.85 + ")";
      ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2); ctx.fill();
    }
    ctx.lineWidth = 3; ctx.strokeStyle = theme.wall;
    ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2); ctx.stroke();

    if (b.char.label) {
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.font = "700 13px \"Barlow Condensed\", \"Arial Narrow\", sans-serif";
      ctx.lineWidth = 3; ctx.lineJoin = "round";
      ctx.strokeStyle = "rgba(0,0,0,0.55)"; ctx.strokeText(b.char.label, b.x, b.y);
      ctx.fillStyle = "#fff"; ctx.fillText(b.char.label, b.x, b.y);
    }

    if (b.powerState && b.powerState.phase === "charge") {
      var prog2 = b.powerState.t / b.char.powerPunch.chargeDur;
      ctx.lineCap = "round";
      ctx.strokeStyle = b.char.color;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r + 9, -Math.PI / 2, -Math.PI / 2 + prog2 * Math.PI * 2);
      ctx.stroke();
    } else if (b.rageState && b.rageState.phase === "charge") {
      var rprog2 = b.rageState.t / b.char.rage.chargeDur;
      ctx.lineCap = "round";
      ctx.strokeStyle = b.char.color;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r + 9, -Math.PI / 2, -Math.PI / 2 + rprog2 * Math.PI * 2);
      ctx.stroke();
    } else if (b.watcherState && b.watcherState.phase === "charge") {
      // The charge itself only begins once the sit delay has passed.
      var wch = b.char.watcher;
      var wprog2 = Math.max(0, Math.min(1, (b.watcherState.t - wch.preDelay) / wch.chargeDur));
      if (wprog2 > 0) {
        ctx.lineCap = "round";
        ctx.strokeStyle = b.char.color;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r + 9, -Math.PI / 2, -Math.PI / 2 + wprog2 * Math.PI * 2);
        ctx.stroke();
      }
    } else if (b.watcherState && b.watcherState.phase === "laser") {
      // A ring that drains as the lasers' time runs out.
      var wleft = Math.max(0, 1 - b.watcherState.t / b.char.watcher.fireDur);
      ctx.lineCap = "round";
      ctx.strokeStyle = b.char.color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r + 9, -Math.PI / 2, -Math.PI / 2 + wleft * Math.PI * 2);
      ctx.stroke();
    }

    // A soft glow when CTE forgets some damage and heals.
    if (b.healGlow > 0) {
      ctx.save();
      ctx.globalAlpha = Math.min(1, b.healGlow / 0.7);
      ctx.strokeStyle = theme.dodge;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r + 6 + (0.7 - b.healGlow) * 20, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // A fading ring while a Grappler is untouchable right after a slam.
    if (b.slamSafe > 0) {
      ctx.save();
      ctx.globalAlpha = Math.min(1, b.slamSafe / SLAM_SAFE_TIME) * 0.8;
      ctx.lineWidth = 3;
      ctx.strokeStyle = b.char.color;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r + 6, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // A bright pulsing ring whenever a fighter is invincible (the Watcher,
    // sitting in its corner), so it's obvious hits won't land.
    if (b.invincible) {
      var pulse = 0.55 + 0.35 * Math.sin(performance.now() / 140);
      ctx.save();
      ctx.setLineDash([5, 5]);
      ctx.lineWidth = 3;
      ctx.strokeStyle = "rgba(255,255,255," + pulse + ")";
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r + 5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    ctx.restore();

    // Small health bar over the ball (hidden while pinned by a finisher,
    // where it would sit on top of the Grappler).
    var pinned = balls[1 - b.id].grapple && balls[1 - b.id].grapple.finisher && balls[1 - b.id].grapple.phase !== "carry";
    if (!pinned) {
      var bw = 64, bh = 8, bx = b.x - bw / 2, by = b.y - b.r - 18;
      if (by < 4) by = b.y + b.r + 10;
      ctx.fillStyle = theme.grid; ctx.fillRect(bx, by, bw, bh);
      ctx.fillStyle = b.char.color; ctx.fillRect(bx, by, bw * (b.hp / MAX_HP), bh);
      ctx.lineWidth = 2; ctx.strokeStyle = theme.wall; ctx.strokeRect(bx, by, bw, bh);
    }

    drawFist(b, other);
    drawKoPunch(b);
    drawShock(b);
    drawKoOut(b);
    drawSwing(b);
    drawCheck(b);
    drawKick(b, other);
    drawGrapple(b);
    drawThrow(b, other);
    drawPowerSpin(b);
    drawJab(b);
    drawHands(b, other);
    b.x -= wox; b.y -= woy;
  });

  drawWatcherLasers();
  drawFinishers();
  balls.forEach(drawSpecial); // the IGBB grab hand goes over the opponent
  drawSprawls();

  projectiles.forEach(function (p) {
    var pimg = getImg(p.imgData);
    if (pimg) {
      ctx.drawImage(pimg, p.x - p.r, p.y - p.r, p.r * 2, p.r * 2);
    } else {
      ctx.fillStyle = p.color; ctx.strokeStyle = theme.wall; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    }
  });

  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  floaters.forEach(function (f) {
    var t = f.life / f.max;
    ctx.globalAlpha = Math.min(1, t * 2);
    var size = f.kind === "hit" ? 34 : (f.kind === "tick" ? 15 : (f.kind === "crit" ? 32 : (f.kind === "note" ? 17 : 28)));
    ctx.font = "800 " + size + 'px "Barlow Condensed", "Arial Narrow", sans-serif';
    var halfW = ctx.measureText(f.text).width / 2 + 6; // keeps wide text fully inside the arena
    var fx = Math.min(W - halfW, Math.max(halfW, f.x)), fy = Math.max(18, f.y);
    ctx.lineWidth = f.kind === "tick" ? 3 : 6; ctx.lineJoin = "round";
    ctx.strokeStyle = theme.floor; ctx.strokeText(f.text, fx, fy);
    ctx.fillStyle = f.kind === "note" ? theme.ink : ((f.kind === "dodge" || f.kind === "crit" || f.kind === "heal") ? theme.dodge : theme.hit); ctx.fillText(f.text, fx, fy);
  });
  ctx.globalAlpha = 1;
}
