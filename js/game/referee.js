// The referee: a ball in a black shirt with REF on it who works inside the
// cage. He's only there when Ciryl Gane is fighting (or with the Dev Corner
// switch on). He's see-through to the fight: nothing hits him and he never
// blocks anyone. He keeps to whichever spot round the edge of the cage is
// furthest from both fighters, shuffling out of their way, and when a
// fighter is knocked out or taps he runs in over them and waves it off.
"use strict";

var REF_R = 30;          // a bit smaller than a fighter (39 at Middleweight)
var REF_WALK = 170;      // units/second keeping out of the way
var REF_RUN = 420;       // units/second rushing in for the stoppage
var REF_RETHINK = 0.4;   // seconds between picking a new spot
var REF_SWITCH = 30;     // a new spot has to be this much further from the fight
var REF_GAP = 14;        // how close he lets a fighter get before stepping away

var referee = null;

function refereeWanted(ch) {
  return !!ch && (ch.hasReferee || String(ch.id || "").indexOf("c-ciryl-gane") === 0);
}
function refereeOn() {
  if (typeof devForceRef !== "undefined" && devForceRef && menuScreen === "dev") return true;
  return balls.some(function (b) { return refereeWanted(b.char); });
}

// Called from startMatchWith.
function resetReferee() {
  if (!refereeOn()) { referee = null; return; }
  // Starts at the bottom middle of the cage, out of both corners.
  referee = { x: W / 2, y: H - REF_R - 10, vx: 0, vy: 0, tx: W / 2, ty: H - REF_R - 10, think: 0, stop: null, wave: 0, look: null };
  var look = defaultLook();
  look.skin = "#c99172"; look.hair = "bald"; look.beard = "none"; look.build = "lean";
  referee.fan = { look: look, shirt: "#151515", style: "tee", team: null, shirtless: false, cap: null, phase: 0 };
}

// The spots round the cage he can stand in: corners and edge middles.
function refereeSpots() {
  var m = REF_R + 12, spots = [];
  [m, W / 2, W - m].forEach(function (x) {
    [m, H / 2, H - m].forEach(function (y) { if (x !== W / 2 || y !== H / 2) spots.push({ x: x, y: y }); });
  });
  return spots;
}
function distToFight(x, y) {
  var d = 1e9;
  balls.forEach(function (b) {
    if (!b.alive) return;
    d = Math.min(d, Math.sqrt((b.x - x) * (b.x - x) + (b.y - y) * (b.y - y)) - b.r);
  });
  return d;
}

// The fighter the fight's been stopped on, if it has: knocked out, or out.
function refereeStoppage() {
  for (var i = 0; i < balls.length; i++) if (!balls[i].alive || balls[i].koOut) return balls[i];
  return null;
}

function updateReferee(dt) {
  var rf = referee;
  if (!rf) return;
  var down = refereeStoppage(), speed = REF_WALK;
  if (down && !rf.stop) {
    // Rushes in over the downed fighter, on the far side from the winner.
    var win = balls[1 - down.id];
    var dx = down.x - win.x, dy = down.y - win.y, d = Math.sqrt(dx * dx + dy * dy) || 1;
    var off = down.alive ? down.r + REF_R * 0.6 : 0;
    rf.stop = { x: down.x + dx / d * off, y: down.y + dy / d * off, called: false };
  }
  if (rf.stop) {
    rf.tx = rf.stop.x; rf.ty = rf.stop.y; speed = REF_RUN;
  } else {
    // Keep to the spot furthest from the action.
    rf.think -= dt;
    // Someone's right on top of him: find somewhere else now.
    if (distToFight(rf.x, rf.y) < REF_R + REF_GAP) { rf.think = Math.min(rf.think, 0); speed = REF_RUN; }
    if (rf.think <= 0) {
      rf.think = REF_RETHINK;
      var cur = distToFight(rf.tx, rf.ty), best = null, bestD = cur + REF_SWITCH;
      refereeSpots().forEach(function (s) {
        var sd = distToFight(s.x, s.y);
        if (sd > bestD) { bestD = sd; best = s; }
      });
      if (best) { rf.tx = best.x; rf.ty = best.y; }
    }
  }
  // Ease toward the target.
  var tx = rf.tx - rf.x, ty = rf.ty - rf.y, td = Math.sqrt(tx * tx + ty * ty);
  var wantVx = 0, wantVy = 0;
  if (td > 2) { var sp = Math.min(speed, td * 4); wantVx = tx / td * sp; wantVy = ty / td * sp; }
  var k = Math.min(1, dt * 8);
  rf.vx += (wantVx - rf.vx) * k; rf.vy += (wantVy - rf.vy) * k;
  rf.x += rf.vx * dt; rf.y += rf.vy * dt;
  // Steps back from anyone who comes at him (not once he's waving it off).
  if (!rf.stop) {
    balls.forEach(function (b) {
      if (!b.alive) return;
      var ex = rf.x - b.x, ey = rf.y - b.y, ed = Math.sqrt(ex * ex + ey * ey) || 1, min = b.r + REF_R + REF_GAP;
      if (ed < min) { var push = Math.min(min - ed, REF_RUN * dt); rf.x += ex / ed * push; rf.y += ey / ed * push; }
    });
  }
  rf.x = Math.min(W - REF_R, Math.max(REF_R, rf.x));
  rf.y = Math.min(H - REF_R, Math.max(REF_R, rf.y));
  if (rf.stop) {
    rf.wave += dt;
    if (!rf.stop.called && td < REF_R) {
      rf.stop.called = true;
      floater(rf.x, rf.y - REF_R - 20, "STOP!", "note");
    }
  }
}

// Drawn under the fighters, so they pass over him.
function drawReferee() {
  var rf = referee;
  if (!rf) return;
  var r = REF_R, skin = rf.fan.look.skin;
  ctx.save();
  ctx.translate(rf.x, rf.y);
  // Shadow
  ctx.fillStyle = "rgba(0,0,0,0.12)";
  ctx.beginPath(); ctx.ellipse(r * 0.15, r * 0.9, r * 0.9, r * 0.28, 0, 0, Math.PI * 2); ctx.fill();
  drawFanBall(ctx, r, rf.fan);
  ctx.fillStyle = "#ffffff"; ctx.font = "900 " + Math.round(r * 0.42) + "px Impact, 'Arial Black', sans-serif";
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillText("REF", 0, r * 0.4);
  // Hands: at his sides, or waving it off over his head.
  var hands;
  if (rf.stop && rf.stop.called) {
    var sw = Math.sin(rf.wave * 14);
    hands = [{ x: -r * 0.55 * sw, y: -r * 1.15 }, { x: r * 0.55 * sw, y: -r * 1.05 }];
  } else {
    var bob = Math.sin(performance.now() / 160) * r * 0.06;
    hands = [{ x: -r * 1.02, y: r * 0.25 + bob }, { x: r * 1.02, y: r * 0.25 - bob }];
  }
  hands.forEach(function (h) {
    ctx.fillStyle = skin; ctx.strokeStyle = STAGE_INK; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(h.x, h.y, r * 0.24, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  });
  ctx.restore();
}
