// The referee: a ball in a black shirt with REF on it who works inside the
// cage. He's only there when Ciryl Gane is fighting (or with the Dev Corner
// switch on). He's see-through to the fight: nothing hits him and he never
// blocks anyone. He keeps to whichever spot round the edge of the cage is
// furthest from both fighters, shuffling out of their way, and when a
// fighter is knocked out or taps he runs in over them and waves it off.
// With REF_TOWER on, in the WWIT stadium he sits up in a lifeguard tower
// outside the cage on the left (in place of a few fans) all fight instead,
// and jumps down over the cage for the stoppage. The test arena has no room
// outside the cage, so there he still roams.
"use strict";

var REF_R = 30;          // a bit smaller than a fighter (39 at Middleweight)
var REF_WALK = 170;      // units/second keeping out of the way
var REF_RUN = 420;       // units/second rushing in for the stoppage
var REF_RETHINK = 0.4;   // seconds between picking a new spot
var REF_SWITCH = 30;     // a new spot has to be this much further from the fight
var REF_GAP = 14;        // how close he lets a fighter get before stepping away
var REF_TOWER = true;    // experiment: watch from a lifeguard tower instead of roaming
var TOWER_W = 70, TOWER_H = 72; // the tower's footprint width and seat height
var REF_HOP = 0.4;       // seconds to jump down off the tower
var REF_SEAT = TOWER_H + REF_R * 0.55; // how high he sits, down in the seat box

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
  referee = { x: W / 2, y: H - REF_R - 10, vx: 0, vy: 0, tx: W / 2, ty: H - REF_R - 10, think: 0, stop: null, wave: 0, look: null, asleep: false, napT: 0, z: 0, hop: 0 };
  if (REF_TOWER && stadiumOn()) {
    var t = towerSpot();
    referee.tower = t;
    referee.x = referee.tx = t.x; referee.y = referee.ty = t.y; referee.z = REF_SEAT;
  }
  var look = defaultLook();
  look.skin = "#c99172"; look.hair = "bald"; look.beard = "none"; look.build = "lean";
  referee.fan = { look: look, shirt: "#151515", style: "tee", team: null, shirtless: false, cap: null, phase: 0 };
}

// Where the tower stands, in arena units: the middle of its base, in the
// column of fans left of the cage, a little below halfway down.
var TOWER_STAGE = { x: 62, y: 1062 }; // the same spot on the 1080x1920 stage
function towerSpot() {
  var k = W / ST.A;
  return { x: (TOWER_STAGE.x - ST.AX) * k, y: (TOWER_STAGE.y - ST.AY) * k };
}
// The fans the tower stands in place of (stadium.js skips drawing them).
function towerHidesFan(f) {
  return !!(referee && referee.tower) && f.side === "left" && f.y > TOWER_STAGE.y - 300 && f.y < TOWER_STAGE.y + 20;
}
// Where floating text over his head goes (he's up high on the tower).
function refTop(rf) { return rf.y - rf.z - REF_R - 20; }

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
  if (rf.asleep && !down) { rf.vx = 0; rf.vy = 0; return; } // dozing where he stands (cheater.js)
  if (down && !rf.stop) {
    // Rushes in over the downed fighter, on the far side from the winner.
    var win = balls[1 - down.id];
    var dx = down.x - win.x, dy = down.y - win.y, d = Math.sqrt(dx * dx + dy * dy) || 1;
    var off = down.alive ? down.r + REF_R * 0.6 : 0;
    rf.stop = { x: down.x + dx / d * off, y: down.y + dy / d * off, called: false };
  }
  if (rf.tower && !rf.stop) {
    // Up in the tower: he sits and watches, and never has to move.
    rf.vx = 0; rf.vy = 0;
    return;
  }
  if (rf.stop && rf.z > 0) {
    // Jumping down off the tower: drops in a short hop while heading in.
    rf.hop += dt;
    var hk = Math.min(1, rf.hop / REF_HOP);
    rf.z = REF_SEAT * (1 - hk) + Math.sin(Math.PI * hk) * 40; // up and over the cage
    if (hk >= 1) rf.z = 0;
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
  if (rf.z <= 0) { // (mid-jump he's still coming over the cage)
    rf.x = Math.min(W - REF_R, Math.max(REF_R, rf.x));
    rf.y = Math.min(H - REF_R, Math.max(REF_R, rf.y));
  }
  if (rf.stop) {
    rf.wave += dt;
    if (!rf.stop.called && td < REF_R && rf.z <= 0) {
      rf.stop.called = true;
      floater(rf.x, refTop(rf), "STOP!", "note");
    }
  }
}

// Drawn under the fighters, so they pass over him.
function drawReferee() {
  var rf = referee;
  if (!rf) return;
  if (rf.tower) drawRefTower(rf.tower, false);
  var r = REF_R, skin = rf.fan.look.skin;
  // His shadow stays on the mat while he's up high or mid-jump.
  if (rf.z > 0) {
    ctx.fillStyle = "rgba(0,0,0,0.14)";
    ctx.beginPath(); ctx.ellipse(rf.x, rf.y + r * 0.2, r * 0.8, r * 0.25, 0, 0, Math.PI * 2); ctx.fill();
  }
  ctx.save();
  ctx.translate(rf.x, rf.y - rf.z);
  // Asleep: slumped over to one side, breathing slow.
  var slump = rf.asleep ? 0.35 + Math.sin(performance.now() / 700) * 0.06 : 0;
  ctx.rotate(slump);
  // Shadow (on the ground only; up high it's drawn on the mat above)
  if (rf.z <= 0) {
    ctx.fillStyle = "rgba(0,0,0,0.12)";
    ctx.beginPath(); ctx.ellipse(r * 0.15, r * 0.9, r * 0.9, r * 0.28, 0, 0, Math.PI * 2); ctx.fill();
  }
  drawFanBall(ctx, r, rf.fan);
  ctx.fillStyle = "#ffffff"; ctx.font = "900 " + Math.round(r * 0.42) + "px Impact, 'Arial Black', sans-serif";
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillText("REF", 0, r * 0.4);
  // A whistle on a lanyard.
  ctx.strokeStyle = "#e3cd9a"; ctx.lineWidth = 1.6;
  ctx.beginPath(); ctx.moveTo(-r * 0.45, -r * 0.05); ctx.quadraticCurveTo(0, r * 0.2, r * 0.45, -r * 0.05); ctx.stroke();
  ctx.fillStyle = "#c9ccd1"; ctx.strokeStyle = STAGE_INK; ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.roundRect(-r * 0.1, r * 0.08, r * 0.24, r * 0.13, r * 0.05); ctx.fill(); ctx.stroke();
  // Hands: at his sides, or waving it off over his head.
  var hands;
  if (rf.stop && rf.stop.called) {
    var sw = Math.sin(rf.wave * 14);
    hands = [{ x: -r * 0.55 * sw, y: -r * 1.15 }, { x: r * 0.55 * sw, y: -r * 1.05 }];
  } else if (rf.asleep) {
    hands = [{ x: -r * 0.95, y: r * 0.55 }, { x: r * 0.95, y: r * 0.55 }]; // hanging limp
  } else {
    var bob = Math.sin(performance.now() / 160) * r * 0.06;
    hands = [{ x: -r * 1.02, y: r * 0.25 + bob }, { x: r * 1.02, y: r * 0.25 - bob }];
  }
  hands.forEach(function (h) {
    ctx.fillStyle = skin; ctx.strokeStyle = STAGE_INK; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(h.x, h.y, r * 0.24, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  });
  ctx.rotate(-slump);
  drawRefZs(rf);
  ctx.restore();
  if (rf.tower) drawRefTower(rf.tower, true); // the seat box's front, over his lap
}

// The lifeguard tower, seen from the front like the fans: four white legs
// splayed out to the mat with cross braces, a ladder up the front, and a
// maroon seat box with a backrest and a little WWIT pennant on top. (x, y)
// is the middle of its base on the mat. It's drawn in two passes around the
// ref: everything behind him, then (front) the seat box's front panel.
function drawRefTower(t, front) {
  var w = TOWER_W, h = TOWER_H, x = t.x, y = t.y;
  var top = y - h, seatW = w * 0.62;
  ctx.save();
  ctx.lineJoin = "round"; ctx.lineCap = "round";
  if (front) {
    ctx.fillStyle = WWIT.maroon; ctx.strokeStyle = STAGE_INK; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.roundRect(x - seatW / 2 - 5, top - 12, seatW + 10, 20, 4); ctx.fill(); ctx.stroke();
    ctx.fillStyle = WWIT.gold; ctx.font = "900 11px Impact, 'Arial Black', sans-serif";
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText("REF", x, top - 1.5);
    ctx.restore();
    return;
  }
  // Shadow on the mat.
  ctx.fillStyle = "rgba(0,0,0,0.12)";
  ctx.beginPath(); ctx.ellipse(x + 6, y + 2, w * 0.62, 9, 0, 0, Math.PI * 2); ctx.fill();
  function post(x0, y0, x1, y1, wd) {
    ctx.strokeStyle = STAGE_INK; ctx.lineWidth = wd + 3;
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
    ctx.strokeStyle = "#f7f3ea"; ctx.lineWidth = wd;
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
  }
  // Back legs (shorter, further away), then the braces, then the front legs.
  var bl = x - w * 0.36, br = x + w * 0.36, by = y - 10;
  var fl = x - w * 0.5, fr = x + w * 0.5;
  var sl = x - seatW / 2, sr = x + seatW / 2;
  post(bl, by, sl + 4, top, 4); post(br, by, sr - 4, top, 4);
  post(fl + 4, y - h * 0.35, fr - 4, y - h * 0.72, 3);
  post(fr - 4, y - h * 0.35, fl + 4, y - h * 0.72, 3);
  post(fl, y, sl, top + 4, 6); post(fr, y, sr, top + 4, 6);
  // Ladder up the front middle.
  var lw = w * 0.2;
  post(x - lw / 2, y, x - lw / 2, top + 6, 2.5); post(x + lw / 2, y, x + lw / 2, top + 6, 2.5);
  for (var i = 1; i <= 4; i++) { var ry = y - (h - 6) * i / 5; post(x - lw / 2, ry, x + lw / 2, ry, 2); }
  // Backrest behind where he sits.
  ctx.fillStyle = WWIT.maroon; ctx.strokeStyle = STAGE_INK; ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.roundRect(x - seatW * 0.46, top - 66, seatW * 0.92, 62, 6); ctx.fill(); ctx.stroke();
  ctx.fillStyle = WWIT.gold; ctx.fillRect(x - seatW * 0.46 + 3, top - 56, seatW * 0.92 - 6, 4);
  // Pennant pole off the back corner.
  post(sr + 2, top, sr + 8, top - 84, 2.5);
  ctx.fillStyle = WWIT.gold; ctx.strokeStyle = STAGE_INK; ctx.lineWidth = 1.5;
  var wav = Math.sin(performance.now() / 260) * 3;
  ctx.beginPath(); ctx.moveTo(sr + 8, top - 84); ctx.lineTo(sr + 32, top - 77 + wav); ctx.lineTo(sr + 7, top - 70); ctx.closePath(); ctx.fill(); ctx.stroke();
  // Platform under the seat.
  ctx.fillStyle = "#f7f3ea"; ctx.strokeStyle = STAGE_INK; ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.roundRect(sl - 6, top + 2, seatW + 12, 8, 2); ctx.fill(); ctx.stroke();
  ctx.restore();
}
