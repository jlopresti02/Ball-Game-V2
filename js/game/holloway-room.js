// Max Holloway's Flashback as a cutscene (Joe, 2026-11-14), drawn over the
// fight from holloway.js (drawFlashback, tickHwFlash, drawFlashPose,
// startFlashback hand off to the functions here). The timing is his
// holloway.flashback block: zone, tv, back.
//   zone  the fight picture goes grainy, like an old TV (grain, scanlines,
//         a rolling bar, washed-out colour), with TV static under it.
//   tv    the camera pulls back out of the TV into his living room at night.
//         The fight is the game on the screen. Max is on the couch: he cracks
//         a Maxx Energy can (maxx-energy-ad.js), chugs it (GLUG!), flicks the
//         empty onto the pile on the rug, then grabs the controller with both
//         hands and plays like a sweat (headphones, hunched in, shaking, sweat
//         flying, mashing; on the TV his fighter jabs on every press and the
//         combo counts up). Then he stops dead and a lightbulb pops on: ding.
//   back  the camera dives back into the TV and it's the fight again. Button
//         Mash starts and his Maxx Energy ad plays (runFlashback).
// Only his own two arms and gloves. Sounds are code-made: static, the can
// crack and fizz, gulps, the toss and clank, the button blips, the ding.
// The room is drawn in 1080x1920 units and fitted to the canvas.
"use strict";

var RM = { zoomOut: 1.1, crack: 0.55, lift: [0.6, 1.0], chugTo: 2.25, tossTo: 2.6, playTo: 4.4, bulbAt: 4.5 }; // seconds into "tv" (needs flashback.tv >= 5)
var RM_PILE = { x: 330, y: 1640 }; // where he tosses the empty
var RM_T = { x: 150, y: 400, w: 560, h: 420 }; // the TV screen in the room
var RM_MAX = { x: 760, y: 1330, r: 140 };
var rmSnap = null, rmNoise = null, rmStatic = null, rmSweat = [], rmSweatT = null;

function rmEase(k) { k = Math.max(0, Math.min(1, k)); return k * k * (3 - 2 * k); }

// From resetHolloway.
function hwRoomReset() { rmSweat = []; rmSweatT = null; hwRoomStop(); }
// From startFlashback.
function hwRoomStart() { rmStaticStart(); }
// From tickHwFlash (and when the flashback is cut off or ends).
function hwRoomStop() { rmStaticStop(); }

// From tickHwFlash: the can, his button presses, the lightbulb.
function hwRoomTick(f, owner, dt) {
  var a = owner.hwAct;
  if (f.phase === "tv") rmCanSounds(f, a.t);
  if (f.phase === "tv" && a.t > RM.tossTo + 0.05 && a.t < RM.playTo) {
    f.pressT -= dt;
    if (f.pressT <= 0) {
      f.pressT += 0.075;
      var keys = ["X", "Y", "A", "B"], k = keys[Math.floor(Math.random() * 4)];
      f.presses.push({ k: k, t: 0 });
      f.combo++;
      playHwChip(k);
    }
  }
  if (f.phase === "tv" && a.t >= RM.bulbAt && !f.bulb) { f.bulb = true; playRmDing(); }
  if (f.phase === "back" && !f.zip) { f.zip = true; rmStaticStop(); }
}

// From drawFlashPose: Max in the fight on the TV, gloves up, a jab out for
// every button press.
function hwRoomPose(b) {
  var o = balls[1 - b.id], ang = Math.atan2(o.y - b.y, o.x - b.x);
  var f = hwFlash, last = f && f.presses.length ? f.presses[f.presses.length - 1] : null;
  var jab = last && last.t < 0.1 ? Math.sin(last.t / 0.1 * Math.PI) : 0, side = f ? (f.combo % 2 ? 1 : -1) : 1;
  [-1, 1].forEach(function (sd) {
    if (jab > 0 && sd === side) {
      var r = b.r, px = -Math.sin(ang), py = Math.cos(ang), d = r * (0.8 + 0.9 * jab);
      var hx = b.x + Math.cos(ang) * d + px * sd * r * 0.3, hy = b.y + Math.sin(ang) * d + py * sd * r * 0.3;
      hwArm(b, b.x + px * sd * r * 0.5, b.y + py * sd * r * 0.5, hx, hy, r * 0.3, ang);
    } else hwGuardHand(b, ang, sd);
  });
}

// From drawFlashback, over everything (s, ox, oy place the arena).
function drawHwRoom(s, ox, oy) {
  var f = hwFlash, owner = balls[f.id], fb = hwCfg(owner) && hwCfg(owner).flashback, a = owner.hwAct;
  if (!fb || !a) return;
  var CW = canvas.width, CH = canvas.height;
  // the frame as drawn so far: that's the game on his TV
  if (!rmSnap) rmSnap = document.createElement("canvas");
  if (rmSnap.width !== CW || rmSnap.height !== CH) { rmSnap.width = CW; rmSnap.height = CH; }
  var sg = rmSnap.getContext("2d");
  sg.setTransform(1, 0, 0, 1, 0, 0); sg.drawImage(canvas, 0, 0);
  // the part of the frame that fits a 4:3 TV: the cage, full height
  var ah = H * s, cw = ah * 4 / 3, crop = { x: ox + W * s / 2 - cw / 2, y: oy, w: cw, h: ah };
  // how far out the camera is (0: the TV fills the frame, 1: the whole room)
  var p = 0, grain = 0;
  if (a.phase === "zone") { grain = rmEase(a.t / fb.zone); }
  else if (a.phase === "tv") { grain = 1; p = rmEase(a.t / RM.zoomOut); }
  else { grain = 1 - rmEase((a.t - fb.back * 0.55) / (fb.back * 0.45)); p = 1 - rmEase(a.t / (fb.back * 0.75)); }
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  if (p <= 0.001) { // just the frame, going grainy
    rmTvLook(0, 0, CW, CH, grain, f, true);
    ctx.restore();
    return;
  }
  // camera: room units -> canvas px. At p=0 the TV screen sits exactly on
  // the crop; at p=1 the room is fitted to the canvas.
  var u = Math.min(CW / 1080, CH / 1920), offX = (CW - 1080 * u) / 2, offY = (CH - 1920 * u) / 2;
  var tcx = RM_T.x + RM_T.w / 2, tcy = RM_T.y + RM_T.h / 2;
  var m0 = crop.w / RM_T.w, m = Math.exp(Math.log(m0) + (Math.log(u) - Math.log(m0)) * p);
  var c0x = crop.x + crop.w / 2, c0y = crop.y + crop.h / 2, c1x = tcx * u + offX, c1y = tcy * u + offY;
  var cx = c0x + (c1x - c0x) * p, cy = c0y + (c1y - c0y) * p;
  ctx.setTransform(m, 0, 0, m, cx - tcx * m, cy - tcy * m);
  drawRoom(f, owner, a, fb);
  // the screen: the game, grainy
  ctx.save();
  ctx.beginPath(); ctx.roundRect(RM_T.x, RM_T.y, RM_T.w, RM_T.h, 26); ctx.clip();
  ctx.drawImage(rmSnap, crop.x, crop.y, crop.w, crop.h, RM_T.x, RM_T.y, RM_T.w, RM_T.h);
  rmScreenFx(f, owner, s, ox, oy, crop);
  rmTvLook(RM_T.x, RM_T.y, RM_T.w, RM_T.h, Math.max(grain, 0.85), f, false);
  ctx.restore();
  // fading the rest of the frame out (and back in) round the screen
  var full = 1 - rmEase(p / 0.3);
  if (full > 0) {
    ctx.globalAlpha = full;
    var kx = RM_T.w / crop.w, ky = RM_T.h / crop.h;
    ctx.drawImage(rmSnap, 0, 0, CW, CH, RM_T.x - crop.x * kx, RM_T.y - crop.y * ky, CW * kx, CH * ky);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    rmTvLook(0, 0, CW, CH, grain * full, f, true);
    ctx.globalAlpha = 1;
  }
  ctx.restore();
}

// Grain, scanlines, a rolling bar and a dark edge.
function rmTvLook(x, y, w, h, k, f, wholeFrame) {
  if (k <= 0) return;
  if (!rmNoise) { rmNoise = document.createElement("canvas"); rmNoise.width = 180; rmNoise.height = 320; }
  var g = rmNoise.getContext("2d"), id = g.createImageData(180, 320), d = id.data;
  for (var i = 0; i < d.length; i += 4) { var v = Math.random() * 255; d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = 255; }
  g.putImageData(id, 0, 0);
  ctx.save();
  // wash the colour out a bit
  ctx.globalCompositeOperation = "saturation";
  ctx.fillStyle = "rgba(128,128,128," + (0.55 * k) + ")"; ctx.fillRect(x, y, w, h);
  ctx.globalCompositeOperation = "source-over";
  ctx.globalAlpha = 0.2 * k;
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(rmNoise, x, y, w, h);
  ctx.globalAlpha = 1;
  var step = h / 160;
  ctx.fillStyle = "rgba(0,0,0," + (0.22 * k) + ")";
  for (var yy = y; yy < y + h; yy += step * 2) ctx.fillRect(x, yy, w, step * 0.8);
  // the rolling bar
  var by = y + ((hwClock * 0.45) % 1.2 - 0.1) * h;
  var bg = ctx.createLinearGradient(0, by - h * 0.06, 0, by + h * 0.06);
  bg.addColorStop(0, "rgba(255,255,255,0)"); bg.addColorStop(0.5, "rgba(255,255,255," + 0.1 * k + ")"); bg.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = bg; ctx.fillRect(x, by - h * 0.06, w, h * 0.12);
  // dark corners of the tube
  var vg = ctx.createRadialGradient(x + w / 2, y + h / 2, Math.min(w, h) * 0.35, x + w / 2, y + h / 2, Math.max(w, h) * 0.75);
  vg.addColorStop(0, "rgba(0,0,0,0)"); vg.addColorStop(1, "rgba(0,0,0," + (wholeFrame ? 0.6 : 0.5) * k + ")");
  ctx.fillStyle = vg; ctx.fillRect(x, y, w, h);
  ctx.restore();
}

// On the TV while he plays: a hit spark on the opponent and the combo count.
function rmScreenFx(f, owner, s, ox, oy, crop) {
  var o = balls[1 - owner.id], kx = RM_T.w / crop.w;
  var map = function (b) { return { x: RM_T.x + (b.x * s + ox - crop.x) * kx, y: RM_T.y + (b.y * s + oy - crop.y) * kx }; };
  var last = f.presses.length ? f.presses[f.presses.length - 1] : null;
  if (last && last.t < 0.09) {
    var q = map(o), rr = o.r * s * kx;
    ctx.save();
    ctx.strokeStyle = "#fff3b0"; ctx.lineWidth = 4;
    for (var i = 0; i < 8; i++) {
      var an = i / 8 * Math.PI * 2 + f.combo;
      ctx.beginPath(); ctx.moveTo(q.x + Math.cos(an) * rr * 0.5, q.y + Math.sin(an) * rr * 0.5); ctx.lineTo(q.x + Math.cos(an) * rr * 1.1, q.y + Math.sin(an) * rr * 1.1); ctx.stroke();
    }
    ctx.restore();
  }
  if (f.combo > 1) {
    ctx.save();
    ctx.font = '900 34px "Courier New", Courier, monospace';
    ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.lineJoin = "round";
    ctx.lineWidth = 7; ctx.strokeStyle = "#05070f";
    var txt = f.combo + " HIT COMBO!";
    ctx.strokeText(txt, RM_T.x + RM_T.w / 2, RM_T.y + 42);
    ctx.fillStyle = f.bulb ? "#ffd23f" : "#ffffff"; ctx.fillText(txt, RM_T.x + RM_T.w / 2, RM_T.y + 42);
    ctx.restore();
  }
}

// ---------------------------------------------------------------- the living room

function drawRoom(f, owner, a, fb) {
  var flick = 0.85 + 0.15 * Math.sin(hwClock * 23) * Math.sin(hwClock * 7.3);
  var bulbK = f.bulb ? Math.max(0, 1 - (a.phase === "tv" ? a.t - RM.bulbAt : 1) / 0.9) : 0;
  // wall
  ctx.fillStyle = "#4a3a30"; ctx.fillRect(-400, -400, 1880, 1660);
  ctx.fillStyle = "rgba(255,255,255,0.035)";
  for (var x = -400; x < 1480; x += 60) ctx.fillRect(x, -400, 26, 1660);
  ctx.fillStyle = "#3a2c22"; ctx.fillRect(-400, 1225, 1880, 22); // skirting
  // floor
  ctx.fillStyle = "#6b4a2e"; ctx.fillRect(-400, 1247, 1880, 1100);
  ctx.strokeStyle = "rgba(0,0,0,0.18)"; ctx.lineWidth = 3;
  for (var fy = 1300; fy < 2400; fy += 70) { ctx.beginPath(); ctx.moveTo(-400, fy); ctx.lineTo(1480, fy); ctx.stroke(); }
  // rug
  ctx.fillStyle = "#5a0f18"; ctx.beginPath(); ctx.ellipse(520, 1520, 470, 150, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = "#e3cd9a"; ctx.lineWidth = 6; ctx.beginPath(); ctx.ellipse(520, 1520, 430, 125, 0, 0, Math.PI * 2); ctx.stroke();
  // window, night out
  ctx.fillStyle = "#1a2342"; ctx.fillRect(820, 250, 200, 280);
  ctx.fillStyle = "#f4f1d0"; ctx.beginPath(); ctx.arc(960, 300, 26, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#1a2342"; ctx.beginPath(); ctx.arc(948, 292, 24, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = "#2a1f18"; ctx.lineWidth = 12; ctx.strokeRect(820, 250, 200, 280);
  ctx.beginPath(); ctx.moveTo(920, 250); ctx.lineTo(920, 530); ctx.moveTo(820, 390); ctx.lineTo(1020, 390); ctx.stroke();
  // a framed BLESSED poster
  ctx.fillStyle = "#e3cd9a"; ctx.fillRect(845, 640, 160, 210);
  ctx.strokeStyle = "#1c1612"; ctx.lineWidth = 10; ctx.strokeRect(845, 640, 160, 210);
  ctx.fillStyle = "#5a0f18"; ctx.font = '900 40px "Barlow Condensed", "Arial Narrow", sans-serif';
  ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("BLESSED", 925, 700);
  ctx.fillStyle = "#e8b923"; ctx.beginPath(); ctx.arc(925, 785, 34, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = "#5a0f18"; ctx.lineWidth = 4; ctx.stroke();
  // TV stand + console
  ctx.fillStyle = "#3b2414"; ctx.strokeStyle = "#151515"; ctx.lineWidth = 5;
  ctx.beginPath(); ctx.roundRect(70, 905, 720, 150, 10); ctx.fill(); ctx.stroke();
  ctx.fillStyle = "#2a190d"; ctx.fillRect(100, 1055, 26, 70); ctx.fillRect(734, 1055, 26, 70);
  rmConsole();
  // the cord to his controller
  var ctl = rmController(f, a);
  ctx.strokeStyle = "#1c1c1c"; ctx.lineWidth = 5; ctx.beginPath();
  var ccx = ctl.body.x - 60, ccy = ctl.body.y + RM_MAX.r * 0.55;
  ctx.moveTo(485, 994); ctx.bezierCurveTo(485, 1240, ccx - 80, ccy + 60, ccx, ccy + 20); ctx.stroke();
  // the TV (an old tube set)
  ctx.fillStyle = "#3b3530"; ctx.strokeStyle = "#151515"; ctx.lineWidth = 8;
  ctx.beginPath(); ctx.roundRect(RM_T.x - 50, RM_T.y - 50, RM_T.w + 200, RM_T.h + 100, 40); ctx.fill(); ctx.stroke();
  ctx.fillStyle = "#2a2622"; ctx.beginPath(); ctx.roundRect(RM_T.x + RM_T.w + 30, RM_T.y + 10, 90, RM_T.h - 20, 14); ctx.fill();
  [0, 1].forEach(function (i) { ctx.fillStyle = "#8a8178"; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(RM_T.x + RM_T.w + 75, RM_T.y + 80 + i * 100, 24, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); });
  ctx.fillStyle = "#151515"; ctx.fillRect(RM_T.x + RM_T.w + 50, RM_T.y + 300, 50, 6); ctx.fillRect(RM_T.x + RM_T.w + 50, RM_T.y + 320, 50, 6); ctx.fillRect(RM_T.x + RM_T.w + 50, RM_T.y + 340, 50, 6);
  ctx.fillStyle = "#0a0a0a"; ctx.beginPath(); ctx.roundRect(RM_T.x - 8, RM_T.y - 8, RM_T.w + 16, RM_T.h + 16, 30); ctx.fill();
  // couch
  ctx.fillStyle = "#2d3a52"; ctx.strokeStyle = "#151515"; ctx.lineWidth = 6;
  ctx.beginPath(); ctx.roundRect(560, 1150, 520, 330, 50); ctx.fill(); ctx.stroke(); // back
  ctx.fillStyle = "#38486a"; ctx.beginPath(); ctx.roundRect(590, 1330, 480, 190, 30); ctx.fill(); ctx.stroke(); // seat
  ctx.fillStyle = "#2d3a52"; ctx.beginPath(); ctx.roundRect(530, 1250, 110, 300, 40); ctx.fill(); ctx.stroke(); // arm rest
  // empty Maxx Energy cans on the rug
  maxxCanAt({ x: 450, y: 1560, h: 92, rot: 0 }, 2);
  maxxCanAt({ x: 520, y: 1600, h: 92, rot: 1.5, crush: 1 }, 2);
  maxxCanAt({ x: 395, y: 1610, h: 92, rot: -1.2, crush: 1 }, 2);
  if (f.canOut) maxxCanAt({ x: RM_PILE.x, y: RM_PILE.y, h: 92, rot: 1.75, crush: 1 }, 2);
  // TV glow over the room
  ctx.save();
  ctx.globalCompositeOperation = "multiply";
  ctx.fillStyle = "rgba(60,70,110," + (0.5 - 0.35 * bulbK) + ")"; ctx.fillRect(-400, -400, 1880, 2800);
  ctx.globalCompositeOperation = "screen";
  var gl = ctx.createRadialGradient(RM_T.x + RM_T.w / 2, RM_T.y + RM_T.h / 2, 80, RM_T.x + RM_T.w / 2, RM_T.y + RM_T.h / 2, 1100);
  gl.addColorStop(0, "rgba(120,160,255," + 0.32 * flick + ")"); gl.addColorStop(1, "rgba(120,160,255,0)");
  ctx.fillStyle = gl; ctx.fillRect(-400, -400, 1880, 2800);
  if (bulbK > 0) {
    var wg = ctx.createRadialGradient(RM_MAX.x, RM_MAX.y - 280, 20, RM_MAX.x, RM_MAX.y - 280, 900);
    wg.addColorStop(0, "rgba(255,220,120," + 0.55 * bulbK + ")"); wg.addColorStop(1, "rgba(255,220,120,0)");
    ctx.fillStyle = wg; ctx.fillRect(-400, -400, 1880, 2800);
  }
  ctx.restore();
  drawRoomMax(f, owner, a, ctl);
  if (f.bulb) drawRoomBulb(a, fb);
}

// Where the controller is aimed this frame and how hard he's going.
function rmController(f, a) {
  var last = f.presses.length ? f.presses[f.presses.length - 1] : null, hit = last && last.t < 0.07 ? 1 : 0;
  var stop = f.bulb ? rmEase((a.phase === "tv" ? a.t - RM.bulbAt : 1) / 0.3) : 0;
  var go = (a.phase === "tv" ? rmEase((a.t - RM.tossTo + 0.1) / 0.2) : 0) * (1 - stop);
  var tvx = RM_T.x + RM_T.w / 2, tvy = RM_T.y + RM_T.h / 2;
  var bx = RM_MAX.x, by = RM_MAX.y, dx = tvx - bx, dy = tvy - by, dl = Math.sqrt(dx * dx + dy * dy);
  var dir = { x: dx / dl, y: dy / dl }, perp = { x: -dir.y, y: dir.x };
  // leaning right in at the TV, rocking with the combo, shaking
  var lean = go * (14 + 5 * Math.abs(Math.sin(hwClock * 17))) + hit * go * 4;
  var shx = go * (Math.sin(hwClock * 71) * 3.5), shy = go * (Math.cos(hwClock * 83) * 3);
  var body = { x: bx + dir.x * lean + shx, y: by + dir.y * lean + shy - stop * 12 };
  // jerking the controller round like it steers the punches
  var tilt = go * (0.18 * Math.sin(hwClock * 9.5) * Math.sin(hwClock * 3.3) + (hit ? (f.combo % 2 ? 0.07 : -0.07) : 0));
  return { dir: dir, perp: perp, body: body, go: go, stop: stop, tilt: tilt, lit: hit ? last.k : null, hit: hit };
}

function drawRoomMax(f, owner, a, ctl) {
  var R = RM_MAX.r, b = { x: ctl.body.x, y: ctl.body.y, r: R, char: owner.char };
  var tw = theme.wall; theme.wall = STAGE_INK;
  rmUpdateSweat(b, ctl);
  // hunched toward the TV (it's up to his left), rocking harder on every press
  var lean = -(0.2 + 0.08 * Math.abs(Math.sin(hwClock * 17))) * ctl.go - 0.04 * ctl.hit * ctl.go;
  var dk = rmDrink(a, R);
  lean += 0.16 * dk.back;
  ctx.save();
  ctx.translate(b.x, b.y); ctx.rotate(lean);
  // intensity lines flicking round his head
  if (ctl.go > 0) {
    ctx.strokeStyle = "rgba(255,255,255," + 0.55 * ctl.go + ")"; ctx.lineWidth = 5; ctx.lineCap = "round";
    for (var i = 0; i < 9; i++) {
      var an = -Math.PI / 2 + (i - 4) * 0.34 + Math.sin(hwClock * 30 + i * 2) * 0.05;
      var r0 = R * (1.2 + 0.1 * ((Math.floor(hwClock * 20) + i) % 3));
      ctx.beginPath(); ctx.moveTo(Math.cos(an) * r0, Math.sin(an) * r0); ctx.lineTo(Math.cos(an) * (r0 + 34), Math.sin(an) * (r0 + 34)); ctx.stroke();
    }
  }
  // body
  var look = owner.char.look;
  if (look) drawFighterArt(ctx, 0, 0, R, look, STAGE_INK, { layout: "contained", name: owner.char.name });
  else { ctx.fillStyle = owner.char.color; ctx.strokeStyle = STAGE_INK; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(0, 0, R, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); }
  // headphones: the band hugging the top of the ball, the cups out on its
  // edges where his ears are; nothing over his face
  rmHeadphones(R);
  // the controller, two hands on the handles, held up in front of his chest
  var cy = R * 0.42 - ctl.stop * 10 + (ctl.hit ? 4 : 0) + R * 0.2 * dk.lap, ang = ctl.tilt - 0.25 * dk.lap;
  var ca = Math.cos(ang), sa = Math.sin(ang), L2 = function (lx, ly) { return { x: lx * ca - ly * sa, y: cy + lx * sa + ly * ca }; };
  var spots = { X: [-15, 0], Y: [0, -14], B: [15, 0], A: [0, 14] }, rg = ctl.lit ? spots[ctl.lit] : [0, 0];
  var gr = R * 0.26;
  var gL = L2(-84 + Math.sin(hwClock * 40) * 3 * ctl.go, 30), gR = L2(84 + rg[0] * 0.3, 30 + rg[1] * 0.3 - (ctl.hit ? 6 : 0));
  if (dk.hand) gR = dk.back2grip > 0 ? { x: dk.hand.x + (gR.x - dk.hand.x) * dk.back2grip, y: dk.hand.y + (gR.y - dk.hand.y) * dk.back2grip } : dk.hand;
  // his own two arms: out from his sides, elbows flared, into the grips
  [[-1, gL], [1, gR]].forEach(function (s) {
    var sx = s[0] * R * 0.86, sy = R * 0.05, ex = s[0] * R * 1.22, ey = R * 0.5;
    strokeLimb(gr * 0.7, armColor(b.char), function () { ctx.moveTo(sx, sy); ctx.quadraticCurveTo(ex, ey, s[1].x, s[1].y); });
  });
  ctx.save();
  ctx.translate(0, cy); ctx.rotate(ang);
  rmControllerArt(ctl, spots, rg);
  ctx.restore();
  // gloves wrapped round the handles from below, thumbs up on the pad and buttons
  drawGloveAt(gL.x, gL.y, gr, b.char, ang - Math.PI / 2);
  if (dk.can) maxxCanAt(dk.can, 2);
  drawGloveAt(gR.x, gR.y, gr, b.char, dk.can ? dk.can.rot - Math.PI / 2 : ang - Math.PI / 2);
  var rel = dk.release ? { x: b.x + dk.release.x * Math.cos(lean) - dk.release.y * Math.sin(lean), y: b.y + dk.release.x * Math.sin(lean) + dk.release.y * Math.cos(lean) } : null;
  ctx.restore();
  if (dk.fly != null && rel) { // the empty, spinning off onto the pile
    var u = dk.fly, fx = rel.x + (RM_PILE.x - rel.x) * u, fy = rel.y + (RM_PILE.y - rel.y) * u - Math.sin(u * Math.PI) * 220;
    maxxCanAt({ x: fx, y: fy, h: 92, rot: u * 12, crush: Math.min(1, u * 3), trail: true }, 2);
  }
  if (dk.glug) { // GLUG!
    ctx.save();
    ctx.font = '900 ' + Math.round(46 * dk.glug.pop) + 'px Impact, "Arial Black", sans-serif';
    ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.lineJoin = "round"; ctx.lineWidth = 8; ctx.strokeStyle = "#05070a";
    var gx = b.x + 110 + dk.glug.n % 2 * 40, gy = b.y - R - 40 - dk.glug.n % 3 * 18;
    ctx.globalAlpha = dk.glug.a;
    ctx.strokeText("GLUG!", gx, gy); ctx.fillStyle = MAXX_TEAL; ctx.fillText("GLUG!", gx, gy);
    ctx.restore();
  }
  rmDrawSweat();
  theme.wall = tw;
}

// ---------------------------------------------------------------- props

// His gaming headphones: a padded band along the top of his outline, metal
// sliders, and round leather-padded cups on the sides where his ears are.
function rmHeadphones(R) {
  var ea = 0.62; // cups this far up from the sides (radians)
  ctx.save();
  ctx.lineCap = "round";
  // the band: dark shell, a soft pad underneath, a highlight along the top, red stitching
  ctx.strokeStyle = "#0b0b0d"; ctx.lineWidth = 19; ctx.beginPath(); ctx.arc(0, 0, R * 1.05, Math.PI + ea + 0.08, -ea - 0.08); ctx.stroke();
  ctx.strokeStyle = "#2b2d34"; ctx.lineWidth = 13; ctx.beginPath(); ctx.arc(0, 0, R * 1.05, Math.PI + ea + 0.08, -ea - 0.08); ctx.stroke();
  ctx.strokeStyle = "#3f424c"; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(0, 0, R * 1.0, Math.PI + ea + 0.25, -ea - 0.25); ctx.stroke(); // the pad
  ctx.strokeStyle = "rgba(255,255,255,0.35)"; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, 0, R * 1.085, Math.PI + ea + 0.3, -Math.PI * 0.38); ctx.stroke();
  ctx.strokeStyle = "#e23b3b"; ctx.lineWidth = 2; ctx.setLineDash([5, 5]); ctx.beginPath(); ctx.arc(0, 0, R * 1.05, Math.PI + ea + 0.3, -ea - 0.3); ctx.stroke(); ctx.setLineDash([]);
  [-1, 1].forEach(function (sd) {
    var an = sd < 0 ? Math.PI + ea : -ea, ca = Math.cos(an), sa = Math.sin(an);
    // the metal slider between the band and the cup
    var a0 = an + (sd < 0 ? 0.13 : -0.13);
    var g = ctx.createLinearGradient(Math.cos(a0) * R * 0.98, Math.sin(a0) * R * 0.98, Math.cos(a0) * R * 1.12, Math.sin(a0) * R * 1.12);
    g.addColorStop(0, "#5d636e"); g.addColorStop(0.5, "#e3e7ee"); g.addColorStop(1, "#6b717c");
    ctx.strokeStyle = g; ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(0, 0, R * 1.05, Math.min(an, a0), Math.max(an, a0)); ctx.stroke();
    // the cup
    ctx.save(); ctx.translate(ca * R, sa * R);
    var cush = ctx.createRadialGradient(-4, -4, 4, 0, 0, 26);
    cush.addColorStop(0, "#3a3b42"); cush.addColorStop(0.7, "#1c1d22"); cush.addColorStop(1, "#0d0d10");
    ctx.fillStyle = cush; ctx.strokeStyle = "#060607"; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(0, 0, 25, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    var shell = ctx.createRadialGradient(-7, -8, 2, 0, 0, 19);
    shell.addColorStop(0, "#6c707c"); shell.addColorStop(0.45, "#2c2e36"); shell.addColorStop(1, "#121317");
    ctx.fillStyle = shell; ctx.beginPath(); ctx.arc(0, 0, 18.5, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "#e23b3b"; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(0, 0, 15, 0, Math.PI * 2); ctx.stroke();
    // a glowing logo light in the middle
    ctx.save();
    ctx.shadowColor = "#3df07a"; ctx.shadowBlur = 12;
    ctx.fillStyle = "rgba(61,240,122," + (0.65 + 0.35 * Math.sin(hwClock * 9)) + ")";
    ctx.beginPath(); ctx.moveTo(0, -7); ctx.lineTo(6, 0); ctx.lineTo(0, 7); ctx.lineTo(-6, 0); ctx.closePath(); ctx.fill();
    ctx.restore();
    // the shine
    ctx.strokeStyle = "rgba(255,255,255,0.55)"; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.arc(0, 0, 21, Math.PI * 1.08, Math.PI * 1.42); ctx.stroke();
    ctx.restore();
  });
  ctx.restore();
}

// A glossy face button: coloured, a soft highlight, its letter.
function rmButton(x, y, rad, k, lit) {
  var base = HW_BTN[k] || "#555555";
  ctx.save();
  if (lit) { ctx.shadowColor = base; ctx.shadowBlur = 16; }
  var g = ctx.createRadialGradient(x - rad * 0.35, y - rad * 0.4, rad * 0.1, x, y, rad);
  g.addColorStop(0, shadeHex(base, lit ? 0.6 : 0.35)); g.addColorStop(0.6, base); g.addColorStop(1, shadeHex(base, -0.35));
  ctx.fillStyle = g; ctx.strokeStyle = "#0b0b0d"; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(x, y + (lit ? 1.5 : 0), rad, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.restore();
  ctx.fillStyle = "rgba(255,255,255,0.95)"; ctx.font = "900 " + Math.round(rad * 1.1) + "px Arial, Helvetica, sans-serif";
  ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(k, x, y + 0.5 + (lit ? 1.5 : 0));
  ctx.fillStyle = "rgba(255,255,255,0.45)"; ctx.beginPath(); ctx.ellipse(x - rad * 0.3, y - rad * 0.48, rad * 0.42, rad * 0.2, -0.4, 0, Math.PI * 2); ctx.fill();
}

// The controller (in its own frame, centred): a shaded two-tone body with
// shoulder buttons, a d-pad, two thumbsticks, start/select, a glowing
// centre button and glossy face buttons.
function rmControllerArt(ctl, spots, rg) {
  var outline = function () {
    ctx.beginPath();
    ctx.moveTo(-72, -24); ctx.lineTo(72, -24);
    ctx.quadraticCurveTo(106, -24, 102, 14); ctx.quadraticCurveTo(98, 52, 72, 38);
    ctx.quadraticCurveTo(40, 22, 0, 24); ctx.quadraticCurveTo(-40, 22, -72, 38);
    ctx.quadraticCurveTo(-98, 52, -102, 14); ctx.quadraticCurveTo(-106, -24, -72, -24);
    ctx.closePath();
  };
  // shoulder buttons peeking out the top
  [-1, 1].forEach(function (sd) {
    var g = ctx.createLinearGradient(0, -34, 0, -20);
    g.addColorStop(0, "#5a5e68"); g.addColorStop(1, "#24262c");
    ctx.fillStyle = g; ctx.strokeStyle = "#0b0b0d"; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.roundRect(sd * 82 - 22, -34, 44, 16, 7); ctx.fill(); ctx.stroke();
  });
  // body
  var bg = ctx.createLinearGradient(0, -26, 0, 50);
  bg.addColorStop(0, "#3b3e47"); bg.addColorStop(0.55, "#23252c"); bg.addColorStop(1, "#121318");
  ctx.fillStyle = bg; ctx.strokeStyle = "#060607"; ctx.lineWidth = 4.5;
  outline(); ctx.fill(); ctx.stroke();
  ctx.save(); outline(); ctx.clip();
  // the teal faceplate in the middle, and a light along the top edge
  var fp = ctx.createLinearGradient(0, -24, 0, 24);
  fp.addColorStop(0, "#1fd1bd"); fp.addColorStop(1, "#0b7d71");
  ctx.fillStyle = fp; ctx.beginPath(); ctx.roundRect(-44, -24, 88, 40, 12); ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.28)"; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(-70, -21); ctx.lineTo(70, -21); ctx.stroke();
  ctx.restore();
  // d-pad: a recessed well, a raised cross with shading
  ctx.fillStyle = "#0d0e11"; ctx.beginPath(); ctx.arc(-62, -2, 19, 0, Math.PI * 2); ctx.fill();
  var dg = ctx.createLinearGradient(-62, -17, -62, 13);
  dg.addColorStop(0, "#4b4f59"); dg.addColorStop(1, "#1b1c21");
  ctx.fillStyle = dg; ctx.strokeStyle = "#060607"; ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-67, -16); ctx.lineTo(-57, -16); ctx.lineTo(-57, -7); ctx.lineTo(-48, -7); ctx.lineTo(-48, 3); ctx.lineTo(-57, 3);
  ctx.lineTo(-57, 12); ctx.lineTo(-67, 12); ctx.lineTo(-67, 3); ctx.lineTo(-76, 3); ctx.lineTo(-76, -7); ctx.lineTo(-67, -7); ctx.closePath();
  ctx.fill(); ctx.stroke();
  ctx.fillStyle = "#101114"; ctx.beginPath(); ctx.arc(-62, -2, 3, 0, Math.PI * 2); ctx.fill();
  // thumbsticks
  [[-27, 14, ctl.go ? Math.sin(hwClock * 23) * 3 : 0], [27, 14, ctl.go ? Math.cos(hwClock * 19) * 3 : 0]].forEach(function (st) {
    ctx.fillStyle = "#0b0c0f"; ctx.beginPath(); ctx.arc(st[0], st[1], 13, 0, Math.PI * 2); ctx.fill();
    var sg = ctx.createRadialGradient(st[0] + st[2] - 3, st[1] - 4, 1, st[0] + st[2], st[1], 10);
    sg.addColorStop(0, "#6a6e79"); sg.addColorStop(1, "#202228");
    ctx.fillStyle = sg; ctx.strokeStyle = "#060607"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(st[0] + st[2], st[1], 9.5, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = "rgba(255,255,255,0.18)"; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(st[0] + st[2], st[1], 6, 0, Math.PI * 2); ctx.stroke();
  });
  // select / start, and the glowing centre button
  [-15, 15].forEach(function (x) { ctx.fillStyle = "#0d0e11"; ctx.beginPath(); ctx.roundRect(x - 6, -13, 12, 5, 2.5); ctx.fill(); });
  ctx.save();
  ctx.shadowColor = "#3df07a"; ctx.shadowBlur = 10;
  ctx.fillStyle = "#0d0e11"; ctx.beginPath(); ctx.arc(0, -1, 6.5, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = "#3df07a"; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, -1, 5, 0, Math.PI * 2); ctx.stroke();
  ctx.restore();
  // face buttons in their well
  ctx.fillStyle = "rgba(0,0,0,0.35)"; ctx.beginPath(); ctx.arc(62, -2, 25, 0, Math.PI * 2); ctx.fill();
  Object.keys(spots).forEach(function (k) { rmButton(62 + spots[k][0], -2 + spots[k][1], 7.8, k, ctl.lit === k); });
  if (ctl.lit) {
    ctx.strokeStyle = HW_BTN[ctl.lit]; ctx.lineWidth = 4;
    for (var i2 = 0; i2 < 6; i2++) {
      var an2 = i2 / 6 * Math.PI * 2, qx = 62 + rg[0], qy = -2 + rg[1];
      ctx.beginPath(); ctx.moveTo(qx + Math.cos(an2) * 15, qy + Math.sin(an2) * 15); ctx.lineTo(qx + Math.cos(an2) * 27, qy + Math.sin(an2) * 27); ctx.stroke();
    }
  }
}

// The console on the TV stand: a slim black box in 3/4 view, vents on top,
// a disc slot, two USB ports (his controller's cord plugs into one) and a
// glowing power light.
function rmConsole() {
  var x = 300, y = 958, w = 260, h = 56, dx = 30, dy = 24;
  ctx.save();
  ctx.fillStyle = "rgba(0,0,0,0.35)"; ctx.beginPath(); ctx.ellipse(x + w / 2 + 14, y + h + 2, w * 0.58, 9, 0, 0, Math.PI * 2); ctx.fill();
  ctx.lineJoin = "round"; ctx.strokeStyle = "#060607"; ctx.lineWidth = 4;
  // top
  var tg = ctx.createLinearGradient(0, y - dy, 0, y);
  tg.addColorStop(0, "#4a4e58"); tg.addColorStop(1, "#2a2c33");
  ctx.fillStyle = tg; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + dx, y - dy); ctx.lineTo(x + w + dx, y - dy); ctx.lineTo(x + w, y); ctx.closePath(); ctx.fill(); ctx.stroke();
  // side
  var sg = ctx.createLinearGradient(x + w, 0, x + w + dx, 0);
  sg.addColorStop(0, "#15161a"); sg.addColorStop(1, "#22242a");
  ctx.fillStyle = sg; ctx.beginPath(); ctx.moveTo(x + w, y); ctx.lineTo(x + w + dx, y - dy); ctx.lineTo(x + w + dx, y - dy + h); ctx.lineTo(x + w, y + h); ctx.closePath(); ctx.fill(); ctx.stroke();
  // front
  var fg = ctx.createLinearGradient(0, y, 0, y + h);
  fg.addColorStop(0, "#2d3038"); fg.addColorStop(1, "#111216");
  ctx.fillStyle = fg; ctx.beginPath(); ctx.rect(x, y, w, h); ctx.fill(); ctx.stroke();
  // a bright edge where the top meets the front
  ctx.strokeStyle = "rgba(255,255,255,0.4)"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x + 3, y + 1.5); ctx.lineTo(x + w - 2, y + 1.5); ctx.stroke();
  // vents on top
  ctx.strokeStyle = "rgba(0,0,0,0.55)"; ctx.lineWidth = 2.5;
  for (var i = 0; i < 9; i++) { var vx = x + 150 + i * 11; ctx.beginPath(); ctx.moveTo(vx + 4, y - 5); ctx.lineTo(vx + 4 + dx * 0.55, y - dy * 0.75); ctx.stroke(); }
  // teal stripe and disc slot
  ctx.fillStyle = "#16c2b0"; ctx.fillRect(x, y + h - 9, w, 3);
  ctx.fillStyle = "#050506"; ctx.beginPath(); ctx.roundRect(x + 18, y + 16, 130, 6, 3); ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.15)"; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x + 20, y + 25); ctx.lineTo(x + 146, y + 25); ctx.stroke();
  // logo: a little ball
  ctx.fillStyle = "#8a909c"; ctx.beginPath(); ctx.arc(x + 32, y + 38, 7, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#16c2b0"; ctx.beginPath(); ctx.arc(x + 32, y + 38, 3, 0, Math.PI * 2); ctx.fill();
  // USB ports
  [178, 200].forEach(function (px) { ctx.fillStyle = "#050506"; ctx.fillRect(x + px, y + 30, 14, 8); ctx.fillStyle = "#3a3d45"; ctx.fillRect(x + px + 2, y + 32, 10, 2); });
  // power light, glowing
  ctx.save();
  ctx.shadowColor = "#4fc3ff"; ctx.shadowBlur = 16;
  ctx.fillStyle = "rgba(120,210,255," + (0.75 + 0.25 * Math.sin(hwClock * 3)) + ")";
  ctx.beginPath(); ctx.arc(x + w - 22, y + 30, 6, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  ctx.restore();
}

// The Maxx Energy can: cracks it, chugs it, tosses the empty on the pile.
function rmSeg(t, a, b) { return rmEase((t - a) / (b - a)); }
function rmDrink(a, R) {
  var d = { back: 0, lap: 0, hand: null, can: null, release: null, fly: null, back2grip: 0, glug: null };
  if (a.phase !== "tv" || a.t >= RM.tossTo) return d;
  var t = a.t, H = R * 1.1;
  var rest = { x: R * 1.18, y: R * 0.5, rot: 0 }, mouth = { x: R * 0.3, y: -R * 0.72, rot: -2.2 }, flick = { x: R * 1.35, y: -R * 0.55, rot: -0.6 };
  d.lap = 1 - rmSeg(t, RM.chugTo + 0.15, RM.tossTo);
  var c;
  if (t < RM.chugTo) {
    var u = rmSeg(t, RM.lift[0], RM.lift[1]);
    c = { x: rest.x + (mouth.x - rest.x) * u, y: rest.y + (mouth.y - rest.y) * u, rot: rest.rot + (mouth.rot - rest.rot) * u };
    if (t > RM.lift[1]) { // chugging: tipping further, a bob on every gulp
      var ct = t - RM.lift[1], g = Math.abs(Math.sin(ct * Math.PI * 4));
      c.rot -= 0.35 * rmSeg(t, RM.lift[1], RM.chugTo) + 0.06 * g; c.y -= g * 7;
      d.back = rmSeg(t, RM.lift[1], RM.lift[1] + 0.2);
      var n = Math.floor(ct / 0.25), gt = ct - n * 0.25;
      d.glug = { n: n, pop: gt < 0.08 ? 0.6 + gt / 0.08 * 0.6 : 1.2 - Math.min(0.2, (gt - 0.08)), a: Math.max(0, 1 - gt / 0.25) };
    }
    if (t < RM.crack + 0.3 && t > RM.crack) c.y += Math.sin((t - RM.crack) * 60) * 2; // the PSSHT shake
  } else {
    var k = rmSeg(t, RM.chugTo, RM.chugTo + 0.12);
    var m = { x: mouth.x, y: mouth.y, rot: mouth.rot - 0.35 };
    c = { x: m.x + (flick.x - m.x) * k, y: m.y + (flick.y - m.y) * k, rot: m.rot + (flick.rot - m.rot) * k };
    d.back = 1 - k;
    if (t > RM.chugTo + 0.12) { d.release = { x: flick.x, y: flick.y }; d.fly = rmSeg(t, RM.chugTo + 0.12, RM.tossTo) ; d.back2grip = rmSeg(t, RM.chugTo + 0.15, RM.tossTo); d.hand = { x: flick.x, y: flick.y }; return d; }
  }
  var ox = H * 0.42 * 0.62, oy = H * 0.08; // his glove round the side of the can
  d.hand = { x: c.x + ox * Math.cos(c.rot) - oy * Math.sin(c.rot), y: c.y + ox * Math.sin(c.rot) + oy * Math.cos(c.rot) };
  d.can = { x: c.x, y: c.y, h: H, rot: c.rot };
  return d;
}
function rmCanSounds(f, t) {
  f.snd = f.snd || {};
  var once = function (key, at, fn) { if (t >= at && !f.snd[key]) { f.snd[key] = true; hwAudio(fn); } };
  var hiss = function (ac, at, len, freq, vol, type) {
    var s = ac.createBufferSource(), fl = ac.createBiquadFilter(), g = ac.createGain();
    s.buffer = caneNoise(ac); s.loop = true; fl.type = type || "highpass"; fl.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, at); g.gain.exponentialRampToValueAtTime(vol, at + Math.min(0.01, len / 5)); g.gain.exponentialRampToValueAtTime(0.0001, at + len);
    s.connect(fl); fl.connect(g); g.connect(strikeOut(ac)); s.start(at); s.stop(at + len + 0.02);
  };
  once("crack", RM.crack, function (ac, at) { hiss(ac, at, 0.05, 3000, 0.6, "bandpass"); hiss(ac, at + 0.02, 0.6, 5000, 0.45); hiss(ac, at + 0.2, 1.0, 7000, 0.08); });
  for (var n = 0; RM.lift[1] + 0.05 + n * 0.25 < RM.chugTo; n++) {
    once("g" + n, RM.lift[1] + 0.05 + n * 0.25, function (ac, at) {
      var o = ac.createOscillator(), g = ac.createGain();
      o.type = "sine"; o.frequency.setValueAtTime(260, at); o.frequency.exponentialRampToValueAtTime(95, at + 0.12);
      g.gain.setValueAtTime(0.0001, at); g.gain.exponentialRampToValueAtTime(0.5, at + 0.015); g.gain.exponentialRampToValueAtTime(0.0001, at + 0.16);
      o.connect(g); g.connect(strikeOut(ac)); o.start(at); o.stop(at + 0.2);
      hiss(ac, at, 0.08, 500, 0.12, "bandpass");
    });
  }
  once("toss", RM.chugTo + 0.1, function (ac, at) { hiss(ac, at, 0.3, 1200, 0.3, "bandpass"); });
  once("clank", RM.tossTo, function (ac, at) {
    f.canOut = true;
    [1480, 2210, 3170].forEach(function (fq, i) { var o = ac.createOscillator(), g = ac.createGain();
      o.type = "triangle"; o.frequency.value = fq; g.gain.setValueAtTime(0.0001, at); g.gain.exponentialRampToValueAtTime(0.12 / (i + 1), at + 0.005);
      g.gain.exponentialRampToValueAtTime(0.0001, at + 0.35); o.connect(g); g.connect(strikeOut(ac)); o.start(at); o.stop(at + 0.4); });
  });
  if (t >= RM.tossTo) f.canOut = true;
}

// Sweat flying off him while he goes.
function rmUpdateSweat(b, ctl) {
  var dt = rmSweatT == null ? 0 : Math.max(0, Math.min(0.1, hwClock - rmSweatT)); rmSweatT = hwClock;
  if (ctl.go > 0) {
    var n = Math.random() < dt * 14 ? 1 : 0;
    for (var i = 0; i < n + (Math.random() < dt * 8 ? 1 : 0); i++) {
      var an = -Math.PI / 2 + (Math.random() - 0.5) * 2.8;
      rmSweat.push({ x: b.x + Math.cos(an) * b.r * 0.9, y: b.y + Math.sin(an) * b.r * 0.9, vx: Math.cos(an) * (160 + Math.random() * 160), vy: Math.sin(an) * (160 + Math.random() * 160) - 120, t: 0 });
    }
  }
  rmSweat.forEach(function (s) { s.t += dt; s.x += s.vx * dt; s.y += s.vy * dt; s.vy += 900 * dt; });
  rmSweat = rmSweat.filter(function (s) { return s.t < 0.6; });
}
function rmDrawSweat() {
  rmSweat.forEach(function (s) {
    ctx.save();
    var an = Math.atan2(s.vy, s.vx), k = 1 - s.t / 0.6;
    ctx.globalAlpha = Math.min(1, k * 2);
    ctx.translate(s.x, s.y); ctx.rotate(an - Math.PI / 2);
    ctx.fillStyle = "#9fd8ff"; ctx.strokeStyle = "#1d4f7a"; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(0, -16); ctx.quadraticCurveTo(11, 2, 0, 8); ctx.quadraticCurveTo(-11, 2, 0, -16); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.restore();
  });
}

// The idea: a lightbulb pops on over his head.
function drawRoomBulb(a, fb) {
  var t = a.phase === "tv" ? a.t - RM.bulbAt : (fb.tv - RM.bulbAt) + a.t;
  var pop = t < 0.18 ? rmEase(t / 0.18) * 1.25 : 1.25 - 0.25 * rmEase((t - 0.18) / 0.15);
  var x = RM_MAX.x, y = RM_MAX.y - RM_MAX.r - 120;
  ctx.save();
  ctx.translate(x, y); ctx.scale(pop, pop);
  // glow + rays
  var gl = ctx.createRadialGradient(0, 0, 10, 0, 0, 150);
  gl.addColorStop(0, "rgba(255,240,150,0.85)"); gl.addColorStop(1, "rgba(255,240,150,0)");
  ctx.fillStyle = gl; ctx.beginPath(); ctx.arc(0, 0, 150, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = "#ffe066"; ctx.lineWidth = 9; ctx.lineCap = "round";
  for (var i = 0; i < 8; i++) {
    var an = -Math.PI / 2 + (i - 3.5) * 0.42, r0 = 82 + Math.sin(hwClock * 14 + i) * 5;
    if (i === 0 || i === 7) continue;
    ctx.beginPath(); ctx.moveTo(Math.cos(an) * r0, Math.sin(an) * r0); ctx.lineTo(Math.cos(an) * (r0 + 34), Math.sin(an) * (r0 + 34)); ctx.stroke();
  }
  // glass
  ctx.fillStyle = "#fff6b8"; ctx.strokeStyle = "#151515"; ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(0, -8, 52, Math.PI * 0.78, Math.PI * 2.22);
  ctx.quadraticCurveTo(26, 40, 22, 56); ctx.lineTo(-22, 56); ctx.quadraticCurveTo(-26, 40, -40, 25);
  ctx.closePath(); ctx.fill(); ctx.stroke();
  // filament
  ctx.strokeStyle = "#e08a00"; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(-12, 50); ctx.lineTo(-12, 10); ctx.lineTo(-4, 0); ctx.lineTo(4, 10); ctx.lineTo(12, 0); ctx.lineTo(12, 50); ctx.stroke();
  // shine
  ctx.strokeStyle = "rgba(255,255,255,0.9)"; ctx.lineWidth = 6;
  ctx.beginPath(); ctx.arc(0, -8, 36, Math.PI * 1.1, Math.PI * 1.45); ctx.stroke();
  // screw base
  ctx.fillStyle = "#9aa0a8"; ctx.strokeStyle = "#151515"; ctx.lineWidth = 5;
  ctx.beginPath(); ctx.roundRect(-24, 56, 48, 34, 6); ctx.fill(); ctx.stroke();
  ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-24, 67); ctx.lineTo(24, 67); ctx.moveTo(-24, 78); ctx.lineTo(24, 78); ctx.stroke();
  ctx.restore();
}

// ---------------------------------------------------------------- sound

// TV static under the cutscene.
function rmStaticStart() {
  hwAudio(function (ac, t) {
    rmStaticStop();
    var s = ac.createBufferSource(); s.buffer = caneNoise(ac); s.loop = true;
    var hp = ac.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 1800;
    var g = ac.createGain();
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.14, t + 0.5); g.gain.exponentialRampToValueAtTime(0.035, t + 1.6);
    s.connect(hp); hp.connect(g); g.connect(strikeOut(ac));
    s.start(t);
    rmStatic = { s: s, g: g };
  });
}
function rmStaticStop() {
  if (!rmStatic) return;
  var st = rmStatic; rmStatic = null;
  hwAudio(function (ac, t) {
    st.g.gain.cancelScheduledValues(t);
    st.g.gain.setValueAtTime(0.1, t); st.g.gain.exponentialRampToValueAtTime(0.0001, t + 0.7);
    st.s.stop(t + 0.75);
  });
}
// The idea: a bright two-note ding.
function playRmDing() {
  hwAudio(function (ac, t) {
    [[1318, 0], [1976, 0.09]].forEach(function (n) {
      [1, 2.76].forEach(function (h, i) {
        var o = ac.createOscillator(), g = ac.createGain();
        o.type = "sine"; o.frequency.value = n[0] * h;
        g.gain.setValueAtTime(0.0001, t + n[1]); g.gain.exponentialRampToValueAtTime(i ? 0.05 : 0.22, t + n[1] + 0.005);
        g.gain.exponentialRampToValueAtTime(0.0001, t + n[1] + 1.1);
        o.connect(g); g.connect(strikeOut(ac)); o.start(t + n[1]); o.stop(t + n[1] + 1.15);
      });
    });
  });
}
