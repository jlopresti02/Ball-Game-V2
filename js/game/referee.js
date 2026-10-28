// The referee: a ball in a black shirt with REF on it who works inside the
// cage. He's only there when Ciryl Gane is fighting (or with the Dev Corner
// switch on). He's see-through to the fight: nothing hits him and he never
// blocks anyone. He keeps to whichever spot round the edge of the cage is
// furthest from both fighters, shuffling out of their way, and when a
// fighter is knocked out or taps he runs in over them and waves it off.
// In the WWIT stadium he works from ringside instead: the column of fans
// left of the cage is cleared for him, and he jogs up and down it keeping
// level with the fight, pointing, clapping and leaning in, then hops the
// cage for the stoppage. (The test arena has no room outside the cage, so
// there he still works inside it.)
"use strict";

var REF_R = 30;          // a bit smaller than a fighter (39 at Middleweight)
var REF_WALK = 170;      // units/second keeping out of the way
var REF_RUN = 420;       // units/second rushing in for the stoppage
var REF_RETHINK = 0.4;   // seconds between picking a new spot
var REF_SWITCH = 30;     // a new spot has to be this much further from the fight
var REF_GAP = 14;        // how close he lets a fighter get before stepping away
var REF_RINGSIDE = true; // in the stadium, work from ringside (left of the cage)
var RINGSIDE_X = 62;     // stage x of his lane, the middle of the left fan column
var RINGSIDE_R = 34;     // he's drawn a little bigger out there, to stand out
var REF_HOP = 0.5;       // seconds to vault the cage for the stoppage

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
  referee = { x: W / 2, y: H - REF_R - 10, vx: 0, vy: 0, tx: W / 2, ty: H - REF_R - 10, think: 0, stop: null, wave: 0, look: null, asleep: false, napT: 0, z: 0, hop: 0, r: REF_R, gest: null, walk: 0 };
  if (REF_RINGSIDE && stadiumOn()) {
    var k = W / ST.A;
    referee.ringside = { x: (RINGSIDE_X - ST.AX) * k, y0: (ST.IN.y0 - ST.AY) * k + RINGSIDE_R + 10, y1: (ST.IN.y1 - ST.AY) * k - RINGSIDE_R - 10 };
    referee.r = RINGSIDE_R;
    referee.x = referee.tx = referee.ringside.x;
    referee.y = referee.ty = H / 2;
  }
  var look = defaultLook();
  look.skin = "#c99172"; look.hair = "bald"; look.beard = "none"; look.build = "lean";
  referee.fan = { look: look, shirt: "#151515", style: "tee", team: null, shirtless: false, cap: null, phase: 0 };
}

// Where floating text over his head goes.
function refTop(rf) { return rf.y - rf.z - rf.r - 20; }
// The fans the ref's ringside lane takes the place of (stadium.js skips them).
function refClearsFan(f) { return !!(referee && referee.ringside) && f.side === "left"; }

// Ringside: jog up and down the lane keeping level with the fight, and keep
// busy watching it: point at the action, clap, wave them on, lean in.
var REF_GESTURES = ["point", "point", "clap", "work", "lean", "lean"];
function updateRingside(rf, dt) {
  var sum = 0, n = 0;
  balls.forEach(function (b) { if (b.alive) { sum += b.y; n++; } });
  var want = n ? sum / n : H / 2;
  rf.ty = Math.min(rf.ringside.y1, Math.max(rf.ringside.y0, want));
  rf.tx = rf.ringside.x;
  var dy = rf.ty - rf.y, sp = Math.min(REF_WALK * 1.4, Math.abs(dy) * 3);
  rf.vy += ((dy > 0 ? sp : -sp) - rf.vy) * Math.min(1, dt * 6);
  rf.vx = 0;
  rf.y += rf.vy * dt;
  rf.walk += Math.abs(rf.vy) * dt;
  // A new bit of business every second or so.
  if (!rf.gest || (rf.gest.t += dt) > rf.gest.dur) {
    rf.gest = { kind: REF_GESTURES[(Math.random() * REF_GESTURES.length) | 0], t: 0, dur: 0.8 + Math.random() * 1.2 };
  }
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
  if (rf.asleep && !down) { rf.vx = 0; rf.vy = 0; return; } // dozing where he stands (cheater.js)
  if (rf.ringside && !rf.stop && !down) { updateRingside(rf, dt); return; }
  if (down && !rf.stop) {
    // Rushes in over the downed fighter, on the far side from the winner.
    var win = balls[1 - down.id];
    var dx = down.x - win.x, dy = down.y - win.y, d = Math.sqrt(dx * dx + dy * dy) || 1;
    var off = down.alive ? down.r + REF_R * 0.6 : 0;
    rf.stop = { x: down.x + dx / d * off, y: down.y + dy / d * off, called: false };
  }
  if (rf.stop && rf.ringside && rf.hop < REF_HOP) {
    // Vaulting the cage on the way in.
    rf.hop += dt;
    var hk = Math.min(1, rf.hop / REF_HOP);
    rf.z = hk >= 1 ? 0 : Math.sin(Math.PI * hk) * 60;
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
  if (rf.z <= 0) { // (mid-vault he's still coming over the cage)
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

// Drawn under the fighters, so they pass over him. He's dressed the part:
// the black-and-white striped shirt, a REF patch and a whistle.
function drawReferee() {
  var rf = referee;
  if (!rf) return;
  var r = rf.r, skin = rf.fan.look.skin, now = performance.now();
  // Jogging bounce while he moves along the lane.
  var moving = Math.abs(rf.vy) > 15 || Math.abs(rf.vx) > 15;
  var jog = moving && !rf.asleep && rf.z <= 0 ? Math.abs(Math.sin(rf.walk * 0.09)) * r * 0.14 : 0;
  // His shadow stays on the floor while he's in the air.
  ctx.fillStyle = "rgba(0,0,0,0.14)";
  ctx.beginPath(); ctx.ellipse(rf.x + r * 0.15, rf.y + r * 0.9, r * 0.9 * (1 - Math.min(0.4, rf.z / 150)), r * 0.28, 0, 0, Math.PI * 2); ctx.fill();
  ctx.save();
  ctx.translate(rf.x, rf.y - rf.z - jog);
  // Asleep: slumped over to one side, breathing slow. Leaning in to watch:
  // tipped toward the fight.
  var g = rf.gest && !rf.stop && !rf.asleep ? rf.gest : null;
  var slump = rf.asleep ? 0.35 + Math.sin(now / 700) * 0.06 : g && g.kind === "lean" ? 0.22 * Math.min(1, g.t * 5) : 0;
  ctx.rotate(slump);
  drawFanBall(ctx, r, rf.fan);
  drawRefStripes(r);
  // REF patch on the chest
  ctx.fillStyle = "#ffffff"; ctx.strokeStyle = STAGE_INK; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.roundRect(-r * 0.42, r * 0.2, r * 0.84, r * 0.4, r * 0.08); ctx.fill(); ctx.stroke();
  ctx.fillStyle = "#111111"; ctx.font = "900 " + Math.round(r * 0.34) + "px Impact, 'Arial Black', sans-serif";
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillText("REF", 0, r * 0.41);
  // Whistle on a lanyard
  ctx.strokeStyle = "#e53935"; ctx.lineWidth = 1.6;
  ctx.beginPath(); ctx.moveTo(-r * 0.32, -r * 0.18); ctx.quadraticCurveTo(-r * 0.05, r * 0.08, r * 0.2, r * 0.02); ctx.stroke();
  ctx.fillStyle = "#c9ccd1"; ctx.strokeStyle = STAGE_INK; ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.roundRect(r * 0.14, -r * 0.04, r * 0.26, r * 0.14, r * 0.05); ctx.fill(); ctx.stroke();
  // Hands: waving it off, hanging limp asleep, or busy with whatever
  // he's doing at ringside (the fight is off to his right).
  var hands, sw;
  if (rf.stop && rf.stop.called) {
    sw = Math.sin(rf.wave * 14);
    hands = [{ x: -r * 0.55 * sw, y: -r * 1.15 }, { x: r * 0.55 * sw, y: -r * 1.05 }];
  } else if (rf.stop) {
    hands = [{ x: -r * 0.9, y: -r * 0.6 }, { x: r * 1.2, y: -r * 0.5 }]; // charging in, arm out
  } else if (rf.asleep) {
    hands = [{ x: -r * 0.95, y: r * 0.55 }, { x: r * 0.95, y: r * 0.55 }];
  } else if (g && g.kind === "point") {
    var jab = Math.sin(g.t * 9) * r * 0.08;
    hands = [{ x: -r * 1.0, y: r * 0.25 }, { x: r * 1.45 + jab, y: -r * 0.2 }];
  } else if (g && g.kind === "clap") {
    sw = Math.abs(Math.sin(g.t * 11));
    hands = [{ x: -r * (0.2 + 0.5 * sw), y: -r * 0.05 }, { x: r * (0.2 + 0.5 * sw), y: -r * 0.05 }];
  } else if (g && g.kind === "work") {
    // "Work!" both hands up, rolling over and over
    sw = g.t * 10;
    hands = [{ x: -r * 0.85 + Math.cos(sw) * r * 0.2, y: -r * 0.7 + Math.sin(sw) * r * 0.2 }, { x: r * 0.85 + Math.cos(sw + Math.PI) * r * 0.2, y: -r * 0.7 + Math.sin(sw + Math.PI) * r * 0.2 }];
  } else if (g && g.kind === "lean") {
    hands = [{ x: -r * 0.7, y: r * 0.75 }, { x: r * 0.75, y: r * 0.75 }]; // hands on his knees
  } else {
    var bob = Math.sin(now / 160) * r * 0.06;
    hands = [{ x: -r * 1.02, y: r * 0.25 + bob }, { x: r * 1.02, y: r * 0.25 - bob }];
  }
  hands.forEach(function (h) {
    ctx.fillStyle = skin; ctx.strokeStyle = STAGE_INK; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(h.x, h.y, r * 0.24, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  });
  ctx.rotate(-slump);
  drawRefZs(rf);
  ctx.restore();
}

// White vertical stripes over the black shirt, below the collar line.
function drawRefStripes(r) {
  ctx.save();
  ctx.beginPath(); ctx.arc(0, 0, r - 1, 0, Math.PI * 2); ctx.clip();
  ctx.beginPath();
  ctx.moveTo(-r, -r * 0.38);
  ctx.quadraticCurveTo(-r * 0.55, -r * 0.3, -r * 0.3, -r * 0.24);
  ctx.quadraticCurveTo(0, -r * 0.08, r * 0.3, -r * 0.24);
  ctx.quadraticCurveTo(r * 0.55, -r * 0.3, r, -r * 0.38);
  ctx.lineTo(r, r); ctx.lineTo(-r, r); ctx.closePath(); ctx.clip();
  ctx.fillStyle = "#f4f4f4";
  var sw = r * 0.2;
  for (var x = -r + sw * 0.5; x < r; x += sw * 2) ctx.fillRect(x, -r, sw, r * 2);
  var sh = ctx.createLinearGradient(0, -r * 0.3, 0, r);
  sh.addColorStop(0, "rgba(255,255,255,0.05)"); sh.addColorStop(1, "rgba(0,0,0,0.3)");
  ctx.fillStyle = sh; ctx.fillRect(-r, -r, r * 2, r * 2);
  ctx.restore();
}
