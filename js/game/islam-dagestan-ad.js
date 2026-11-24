// Dagestan World: THE VAN (Joe, 2026-11-24): Islam Makhachev's two ads,
// for the newest ride at the same Dagestan World theme park as Khabib's
// coaster ad (dagestan-ad.js), with its sign, bulbs, Ferris wheel and
// striped ride station.
//
// The animated one runs on the jumbotron (a banner in the test arena) when
// the van comes in his "2-3 years Dagestan" special, the first time in a
// fight (islDagestan, islam-specials.js):
//   - The DAGESTAN WORLD sign on the left: NEW RIDE: THE VAN. The park
//     behind it: the Ferris wheel, a coaster loop, a striped big top,
//     pennant bunting, balloons drifting up.
//   - The white van rolls into its ride station on rails, BEEP BEEP!, the
//     door slides open and Islam pops out beside it, the ride operator,
//     next to a "you must be this tall to ride" sign.
//   - The queue's WAIT TIME board ticks up: 5 MIN, 30 MIN, 2 HOURS, 1 DAY,
//     1 YEAR, 2-3 YEARS.
//   - "2-3 YEARS DAGESTAN AND FORGET" stamps in. Small print: free pickup
//     from the cage, no return trip, exit by catapult.
//   - Sound (code-made): the engine, the horn, the door, the board ticking,
//     a drum roll and a stamp with an accordion chord.
// The fight's cut to Dagestan covers the whole screen, so the ad's clock
// (and its sound cues) stops while the cut is on and picks up again when
// they're catapulted back. It goes through queueJumboAd like every ad, so
// it never overlaps another; his own special doesn't hold it up (adOwn).
//
// Plus a silent still for the random rotation (drawIslamDagStill, listed in
// still-ads.js): the park poster, the van parked in its station with Islam
// beside it, the board on 2-3 YEARS and the slogan on the sign's ribbon.
"use strict";

var ISD_SHOW = 8.5;
var ISD_PAGES = ["5 MIN", "30 MIN", "2 HOURS", "1 DAY", "1 YEAR", "2-3 YEARS"];
var ISD_FLIP0 = 2.7, ISD_FLIP = 0.42, ISD_STAMP = 5.05;
var isdShow = 0, isdT = 0, isdId = 0, isdDone = false, isdOut = null, isdCues = {};
var isdCache = { key: null, cv: null };
var ISD_SANS = "'Helvetica Neue', Helvetica, Arial, sans-serif";

// From startMatchWith (through resetAdBreaks).
function resetIslamDagAd() { isdShow = 0; isdT = 0; isdDone = false; isdCues = {}; stopIslamDagSound(); }
// From islDagestan (islam-specials.js) as the van comes in.
function islamDagAdOnVan(b, m) {
  if (isdDone || (typeof galleryDemo !== "undefined" && galleryDemo)) return;
  isdDone = true;
  if (m) m.adOwn = true; // (his own special doesn't hold it up)
  queueJumboAd(ISD_SHOW, function () { isdShow = ISD_SHOW; isdT = 0; isdId = b.id; isdCues = {}; }, b);
}
// Every frame, from tickAdBreaks (ad-breaks.js).
function tickIslamDagAd(dt) {
  if (isdShow <= 0) return;
  if (typeof islamTripOn === "function" && islamTripOn()) { // the cut to Dagestan covers the screen: hold here
    if (typeof jumboAdLeft !== "undefined" && jumboAdLeft > 0) jumboAdLeft += dt; // (and nothing else takes the jumbotron meanwhile)
    return;
  }
  isdShow = Math.max(0, isdShow - dt);
  isdT = ISD_SHOW - isdShow;
  isdCue("engine", 0.02); isdCue("horn", 1.4); isdCue("door", 1.7);
  for (var i = 1; i < ISD_PAGES.length; i++) isdCue("flip" + i, ISD_FLIP0 + (i - 1) * ISD_FLIP);
  isdCue("roll", ISD_STAMP - 0.45); isdCue("stamp", ISD_STAMP);
}
function isdCue(name, at) {
  if (isdCues[name] || isdT < at) return;
  isdCues[name] = true;
  if (isdT - at < 0.25) playIslamDagCue(name); // (not if it was long missed)
}

// Where things sit, as fractions of the ad's width and height.
var ISD_L = { rail: 0.9, st0: 0.41, st1: 0.6, van: 0.505, board: 0.875 };

// ---------------------------------------------------------------- the animated ad

function drawIslamDagJumbo(x, y, w, h) {
  if (isdShow <= 0 || !balls || !balls[isdId]) return;
  if (typeof islamTripOn === "function" && islamTripOn()) return;
  var b = balls[isdId], look = (b.baseChar && b.baseChar.look) || b.char.look;
  var t = isdT, a = Math.min(1, t / 0.3, isdShow / 0.4), k = h / 250;
  ctx.save();
  ctx.globalAlpha = a;
  ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
  isdBackdrop(x, y, w, h, k, false);
  isdBalloons(x, y, w, h, k, t);
  isdBulbs(x, y, w, h, k, t);

  // The van rolls into its station on the rails and stops.
  var rail = y + h * ISD_L.rail, s = 0.4 * k, vx1 = x + w * ISD_L.van;
  var du = Math.min(1, t / 1.4), vx = x - 170 * s + (vx1 - x + 170 * s) * easeOut(du);
  var moving = du < 1, bounce = moving ? Math.abs(Math.sin(t * 22)) * 1.5 * k : 0;
  if (moving) { // sparks off the rails
    for (var p = 0; p < 4; p++) {
      var ph = (t * 3 + p / 4) % 1;
      ctx.save(); ctx.globalAlpha *= 1 - ph; ctx.fillStyle = "#ffd54f";
      ctx.beginPath(); ctx.arc(vx - 120 * s - ph * 40 * k, rail - 2 * k - ph * 14 * k, 2.2 * k, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    }
  }
  var door = t < 1.7 ? 0 : Math.min(1, (t - 1.7) / 0.3);
  drawIslVan(vx, rail - bounce, 1, door, s); // (islam-specials.js)
  isdStationFront(x, y, w, h, k);
  if (t > 1.4 && t < 2.3) { // BEEP BEEP!
    var bp = Math.min(1, (t - 1.4) / 0.12), wob = 1 + Math.sin((t - 1.4) * 30) * 0.04;
    ctx.save(); ctx.translate(vx + 40 * s, rail - 230 * s); ctx.scale(bp * wob, bp * wob);
    stillText("BEEP BEEP!", 0, 0, 28 * k, "#ffd23f", w * 0.2, { stroke: "#1f2328", strokeW: 0.2 });
    ctx.restore();
  }

  // Islam pops out beside it, the ride operator.
  if (t > 1.9) {
    var iu = Math.min(1, (t - 1.9) / 0.35), pop = iu < 1 ? 0.5 + 0.5 * easeOut(iu) + Math.sin(iu * Math.PI) * 0.15 : 1;
    isdOperator(x + w * 0.665, rail, h * 0.15 * pop, look, k, iu >= 1, Math.abs(Math.sin(t * 4)) * 4 * k);
  }

  // The queue's wait-time board.
  if (t > 2.3) {
    var n = t < ISD_FLIP0 ? 0 : Math.min(ISD_PAGES.length - 1, Math.floor((t - ISD_FLIP0) / ISD_FLIP) + 1);
    var since = n ? t - ISD_FLIP0 - (n - 1) * ISD_FLIP : 1;
    isdBoard(x + w * ISD_L.board, y + h * 0.08, h * 0.5, h * 0.5, k, n, since, Math.min(1, (t - 2.3) / 0.25));
  }

  // 2-3 YEARS DAGESTAN AND FORGET.
  if (t > ISD_STAMP) {
    var su = Math.min(1, (t - ISD_STAMP) / 0.18);
    isdSlogan(x + w * 0.545, y + h * 0.2, w * 0.42, h * 0.2, k, su, 1.6 - 0.6 * su);
    if (su >= 1 && t < ISD_STAMP + 0.3 && !reduceMotion) { // a flash where it lands
      ctx.save(); ctx.globalAlpha *= 1 - (t - ISD_STAMP - 0.18) / 0.12; ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 3 * k;
      ctx.strokeRect(x + w * 0.545 - w * 0.23, y + h * 0.06, w * 0.46, h * 0.28); ctx.restore();
    }
  }
  if (t > ISD_STAMP + 0.8) {
    ctx.save(); ctx.globalAlpha *= Math.min(1, (t - ISD_STAMP - 0.8) / 0.4);
    ctx.fillStyle = "rgba(0,0,0,0.5)"; stillRoundRect(x + w * 0.34, y + h * 0.33, w * 0.41, h * 0.085, 6 * k); ctx.fill();
    stillText("FREE PICKUP FROM THE CAGE  •  NO RETURN TRIP  •  EXIT BY CATAPULT", x + w * 0.545, y + h * 0.373, 12 * k, "#ffffff", w * 0.39, { face: ISD_SANS, weight: "800" });
    ctx.restore();
  }
  ctx.restore();
}
function drawIslamDagBanner() {
  if (isdShow <= 0 || stadiumOn()) return;
  drawIslamDagJumbo(10, 10, W - 20, 110);
}

// The slogan on a red ribbon banner, at (cx, cy), `sc` its stamp-in scale.
function isdSlogan(cx, cy, bw, bh, k, alpha, sc) {
  ctx.save(); ctx.globalAlpha *= alpha; ctx.translate(cx, cy); ctx.scale(sc, sc); ctx.rotate(-0.03);
  ctx.fillStyle = "#8e1a1a"; // the ribbon's folded tails
  [-1, 1].forEach(function (sd) {
    ctx.beginPath(); ctx.moveTo(sd * bw * 0.44, -bh * 0.3); ctx.lineTo(sd * bw * 0.58, -bh * 0.3);
    ctx.lineTo(sd * bw * 0.53, bh * 0.2); ctx.lineTo(sd * bw * 0.58, bh * 0.7); ctx.lineTo(sd * bw * 0.44, bh * 0.7); ctx.closePath(); ctx.fill();
  });
  ctx.fillStyle = "rgba(0,0,0,0.3)"; ctx.fillRect(-bw / 2 + 4 * k, -bh / 2 + 5 * k, bw, bh);
  var rg = ctx.createLinearGradient(0, -bh / 2, 0, bh / 2);
  rg.addColorStop(0, "#ef5350"); rg.addColorStop(1, "#c62828");
  ctx.fillStyle = rg; ctx.fillRect(-bw / 2, -bh / 2, bw, bh);
  ctx.strokeStyle = "rgba(255,255,255,0.55)"; ctx.lineWidth = 1.2 * k; ctx.setLineDash([5 * k, 3 * k]);
  ctx.strokeRect(-bw / 2 + 5 * k, -bh / 2 + 4 * k, bw - 10 * k, bh - 8 * k); ctx.setLineDash([]);
  stillText("2-3 YEARS DAGESTAN AND FORGET", 0, 2 * k, 30 * k, "#ffffff", bw * 0.9, { stroke: "#7f1010", strokeW: 0.14 });
  ctx.restore();
}

// Islam the ride operator, standing on the platform by the rails.
function isdOperator(cx, rail, r, look, k, tag, bob) {
  var cy = rail - r - 6 * k - (bob || 0);
  stillFighter(cx, cy, r, look, ""); // (still-ads.js)
  if (!tag) return;
  ctx.fillStyle = "#1b1b5a"; stillRoundRect(cx - r * 1.15, rail - 3 * k, r * 2.3, 16 * k, 4 * k); ctx.fill();
  stillText("RIDE OPERATOR", cx, rail + 5 * k, 10 * k, "#ffd23f", r * 2.15, { face: ISD_SANS, weight: "900" });
}

// The queue sign: a wooden board on posts, WAIT TIME, the time rolling up.
function isdBoard(cx, top, bw, bh, k, n, since, alpha) {
  var x = cx - bw / 2;
  ctx.save(); ctx.globalAlpha *= alpha;
  ctx.fillStyle = "#5d4037"; ctx.fillRect(x + bw * 0.18, top + bh, 6 * k, bh * 0.8); ctx.fillRect(x + bw * 0.82 - 6 * k, top + bh, 6 * k, bh * 0.8);
  ctx.fillStyle = "rgba(0,0,0,0.3)"; stillRoundRect(x + 4 * k, top + 5 * k, bw, bh, 10 * k); ctx.fill();
  var g = ctx.createLinearGradient(0, top, 0, top + bh);
  g.addColorStop(0, "#2e7d32"); g.addColorStop(1, "#1b5e20");
  ctx.fillStyle = g; stillRoundRect(x, top, bw, bh, 10 * k); ctx.fill();
  ctx.strokeStyle = "#e3c26a"; ctx.lineWidth = 3 * k; stillRoundRect(x, top, bw, bh, 10 * k); ctx.stroke();
  stillText("WAIT TIME", cx, top + bh * 0.2, 17 * k, "#ffd23f", bw * 0.82);
  stillText("FROM HERE", cx, top + bh * 0.36, 9 * k, "#e8f5e9", bw * 0.8, { face: ISD_SANS, weight: "800" });
  // The readout window, the time rolling up into it.
  var wx = x + bw * 0.1, wy = top + bh * 0.46, ww = bw * 0.8, wh = bh * 0.4;
  ctx.fillStyle = "#101410"; stillRoundRect(wx, wy, ww, wh, 5 * k); ctx.fill();
  ctx.save(); ctx.beginPath(); ctx.rect(wx, wy, ww, wh); ctx.clip();
  var u = Math.min(1, since / 0.18), last = n === ISD_PAGES.length - 1, col = last ? "#ff5252" : "#ffb74d";
  if (u < 1 && n > 0) stillText(ISD_PAGES[n - 1], cx, wy + wh / 2 - u * wh, 24 * k, "#ffb74d", ww * 0.9, { glow: "#ffb74d" });
  stillText(ISD_PAGES[n], cx, wy + wh / 2 + (1 - u) * wh, 24 * k, col, ww * 0.9, { glow: col });
  ctx.restore();
  ctx.restore();
}

// Balloons drifting up behind the park.
function isdBalloons(x, y, w, h, k, t) {
  var cols = ["#e53935", "#fdd835", "#1e88e5", "#43a047", "#ec407a"];
  for (var i = 0; i < 5; i++) {
    var ph = (t * 0.12 + i * 0.21) % 1, bx = x + w * (0.33 + i * 0.075) + Math.sin(t * 1.3 + i) * 6 * k, by = y + h * (0.85 - ph * 1.05);
    ctx.save(); ctx.globalAlpha *= Math.min(1, ph * 6) * 0.9;
    ctx.strokeStyle = "rgba(60,60,60,0.6)"; ctx.lineWidth = 1 * k;
    ctx.beginPath(); ctx.moveTo(bx, by + 10 * k); ctx.quadraticCurveTo(bx + 4 * k, by + 20 * k, bx, by + 30 * k); ctx.stroke();
    ctx.fillStyle = cols[i]; ctx.beginPath(); ctx.ellipse(bx, by, 7 * k, 9 * k, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.45)"; ctx.beginPath(); ctx.ellipse(bx - 2.5 * k, by - 3 * k, 2 * k, 3 * k, -0.4, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
}
// The sign's bulbs chasing round (drawn over the painted ones).
function isdBulbs(x, y, w, h, k, t) {
  var bx = x + w * 0.02, by = y + h * 0.05, bw = w * 0.27, bh = h * 0.6;
  var per = 2 * (bw + bh), nb = Math.round(per / (17 * k)), on = Math.floor(t * 8);
  for (var i = 0; i < nb; i++) {
    if ((i + on) % 3) continue;
    var d = i * per / nb, px, py;
    if (d < bw) { px = bx + d; py = by; } else if (d < bw + bh) { px = bx + bw; py = by + d - bw; }
    else if (d < 2 * bw + bh) { px = bx + bw - (d - bw - bh); py = by + bh; } else { px = bx; py = by + bh - (d - 2 * bw - bh); }
    var g = ctx.createRadialGradient(px, py, 0, px, py, 8 * k);
    g.addColorStop(0, "rgba(255,255,240,1)"); g.addColorStop(0.4, "rgba(255,230,120,0.8)"); g.addColorStop(1, "rgba(255,213,79,0)");
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(px, py, 8 * k, 0, Math.PI * 2); ctx.fill();
  }
}

// ---------------------------------------------------------------- the park

// The scenery, the sign and the station, painted once per size (and once
// for the still, which has the slogan on the sign's ribbon).
function isdBackdrop(x, y, w, h, k, still) {
  var px = (typeof canvas !== "undefined" && canvas.width && typeof STAGE_W !== "undefined" && stadiumOn()) ? canvas.width / STAGE_W : 2;
  var key = Math.round(w) + "x" + Math.round(h) + "@" + px.toFixed(2) + (still ? "s" : "a");
  if (isdCache.key !== key) {
    var cv = document.createElement("canvas");
    cv.width = Math.ceil(w * px); cv.height = Math.ceil(h * px);
    var g = cv.getContext("2d");
    g.scale(px, px);
    var saved = ctx; ctx = g; // reuse the poster helpers on the offscreen canvas
    try { isdScene(0, 0, w, h, k, still); } finally { ctx = saved; }
    isdCache = { key: key, cv: cv };
  }
  ctx.drawImage(isdCache.cv, x, y, w, h);
}
function isdScene(x, y, w, h, k, still) {
  var sky = ctx.createLinearGradient(0, y, 0, y + h);
  sky.addColorStop(0, "#1e6fd9"); sky.addColorStop(0.55, "#7cc3ff"); sky.addColorStop(1, "#ffe1b3");
  ctx.fillStyle = sky; ctx.fillRect(x, y, w, h);
  var sx = x + w * 0.7, sy = y + h * 0.16;
  var sg = ctx.createRadialGradient(sx, sy, h * 0.04, sx, sy, h * 0.42);
  sg.addColorStop(0, "rgba(255,250,215,0.95)"); sg.addColorStop(0.3, "rgba(255,236,160,0.4)"); sg.addColorStop(1, "rgba(255,236,160,0)");
  ctx.fillStyle = sg; ctx.fillRect(x, y, w, h);
  [[0.4, 0.1, 0.9], [0.66, 0.26, 0.6], [0.98, 0.12, 0.8]].forEach(function (c) { dwCloud(x + w * c[0], y + h * c[1], h * 0.09 * c[2]); });
  dwRange(x, y, w, h, 0.45, 0.2, 1.9, ["#a9bbdc", "#c9d6ee"], 0.6, 0.55); // (dagestan-ad.js)
  dwRange(x, y, w, h, 0.55, 0.23, 4.2, ["#6f86b3", "#93a8cf"], 0.58, 0.85);
  dwRange(x, y, w, h, 0.66, 0.15, 2.6, ["#4c6a8f", "#6f8db0"], 0.72, 0.95);
  // The park behind: the Ferris wheel, a coaster loop, the big top.
  ctx.save(); ctx.globalAlpha = 0.85; dwFerrisWheel(x + w * 0.335, y + h * 0.43, h * 0.27, k); ctx.restore();
  isdCoasterLoop(x + w * 0.73, y + h * 0.8, h * 0.2, k);
  isdBigTop(x + w * 0.645, y + h * 0.8, h * 0.17, k);
  var hill = ctx.createLinearGradient(0, y + h * 0.74, 0, y + h);
  hill.addColorStop(0, "#6dbb4a"); hill.addColorStop(1, "#2f7d2c");
  ctx.fillStyle = hill;
  ctx.beginPath(); ctx.moveTo(x, y + h);
  for (var i = 0; i <= 80; i++) { var u = i / 80; ctx.lineTo(x + w * u, y + h * (0.8 + 0.02 * Math.sin(u * 8 + 2) + 0.01 * Math.sin(u * 21))); }
  ctx.lineTo(x + w, y + h); ctx.closePath(); ctx.fill();
  for (var tr = 0; tr < 10; tr++) {
    var tx = x + w * (0.3 + ((tr * 0.0917) % 0.68));
    if (tx > x + w * ISD_L.st0 - 10 * k && tx < x + w * ISD_L.st1 + 10 * k) continue;
    dwPine(tx, y + h * (0.83 + (tr % 2) * 0.012), h * (0.045 + (tr % 3) * 0.01));
  }
  isdRails(x, y, w, h, k);
  isdStationBack(x, y, w, h, k);
  isdHeightSign(x + w * 0.375, y + h * ISD_L.rail, k, h);
  isdBunting(x + w * 0.29, y + h * 0.36, x + w * ISD_L.st0 - 4 * k, y + h * 0.45, k);
  isdBunting(x + w * ISD_L.st1 + 4 * k, y + h * 0.45, x + w * 0.8, y + h * 0.4, k);
  isdSign(x, y, w, h, k, still);
}
// The ride's rails along the bottom, on ties, over a gravel bed.
function isdRails(x, y, w, h, k) {
  var r = y + h * ISD_L.rail;
  ctx.fillStyle = "#a1887f"; ctx.fillRect(x, r - 4 * k, w, y + h - r + 4 * k);
  ctx.fillStyle = "#6d4c41";
  for (var i = 0; i < 70; i++) ctx.fillRect(x + w * (i / 70), r - 3 * k, 5 * k, y + h - r + 3 * k);
  ctx.fillStyle = "#b71c1c"; ctx.fillRect(x, r - 4 * k, w, 3 * k); ctx.fillRect(x, y + h - 6 * k, w, 3 * k);
  ctx.fillStyle = "rgba(255,255,255,0.35)"; ctx.fillRect(x, r - 4 * k, w, 1 * k);
}
// The van's ride station: a platform, posts and a striped roof with the
// ride's name. The back is painted with the scenery; the posts in front
// go over the van (isdStationFront).
function isdStationBack(x, y, w, h, k) {
  var s0 = x + w * ISD_L.st0, s1 = x + w * ISD_L.st1, sw = s1 - s0, r = y + h * ISD_L.rail, roofY = y + h * 0.47;
  ctx.fillStyle = "#4e342e"; ctx.fillRect(s0, roofY, sw, r - roofY); // the shaded back wall
  ctx.fillStyle = "rgba(255,213,79,0.25)";
  for (var i = 0; i < 6; i++) ctx.fillRect(s0 + sw * (0.08 + i * 0.15), roofY + 8 * k, sw * 0.08, r - roofY - 16 * k); // light through the slats
  ctx.save();
  ctx.beginPath(); ctx.moveTo(s0 - 10 * k, roofY); ctx.lineTo(s0 + sw * 0.5, roofY - h * 0.12); ctx.lineTo(s1 + 10 * k, roofY); ctx.closePath(); ctx.clip();
  for (var st = 0; st < 14; st++) { ctx.fillStyle = st % 2 ? "#ffffff" : "#d32f2f"; ctx.fillRect(s0 - 10 * k + st * (sw + 20 * k) / 14, roofY - h * 0.13, (sw + 20 * k) / 14 + 1, h * 0.13); }
  ctx.restore();
  ctx.strokeStyle = "#7f1d1d"; ctx.lineWidth = 1.5 * k;
  ctx.beginPath(); ctx.moveTo(s0 - 10 * k, roofY); ctx.lineTo(s0 + sw * 0.5, roofY - h * 0.12); ctx.lineTo(s1 + 10 * k, roofY); ctx.closePath(); ctx.stroke();
  // Scalloped valance under the roof.
  for (var v = 0; v < 10; v++) { ctx.fillStyle = v % 2 ? "#ffd23f" : "#d32f2f"; ctx.beginPath(); ctx.arc(s0 - 6 * k + (v + 0.5) * (sw + 12 * k) / 10, roofY, (sw + 12 * k) / 20, 0, Math.PI); ctx.fill(); }
  // The ride's name board on the roof.
  var nx = s0 + sw * 0.5, ny = roofY - h * 0.17;
  ctx.fillStyle = "#1b1b5a"; stillRoundRect(nx - sw * 0.36, ny - h * 0.055, sw * 0.72, h * 0.11, 6 * k); ctx.fill();
  ctx.strokeStyle = "#e3c26a"; ctx.lineWidth = 2 * k; stillRoundRect(nx - sw * 0.36, ny - h * 0.055, sw * 0.72, h * 0.11, 6 * k); ctx.stroke();
  stillText("THE VAN", nx, ny + k, 22 * k, "#ffd23f", sw * 0.66, { stroke: "#0b0f2e", strokeW: 0.16 });
  stillText("RIDE STARTS HERE →", s0 + sw / 2, r + h * 0.05, 8 * k, "#ffffff", sw * 0.9, { face: ISD_SANS, weight: "800" });
}
function isdStationFront(x, y, w, h, k) {
  var s0 = x + w * ISD_L.st0, s1 = x + w * ISD_L.st1, sw = s1 - s0, r = y + h * ISD_L.rail, roofY = y + h * 0.47;
  ctx.fillStyle = "#ffffff"; ctx.strokeStyle = "rgba(0,0,0,0.25)"; ctx.lineWidth = 1 * k;
  [0.02, 0.98].forEach(function (f) { ctx.fillRect(s0 + sw * f - 2.5 * k, roofY, 5 * k, r - roofY); ctx.strokeRect(s0 + sw * f - 2.5 * k, roofY, 5 * k, r - roofY); });
}
// "YOU MUST BE THIS TALL TO RIDE": a post with a hand at the top.
function isdHeightSign(cx, ground, k, h) {
  var top = ground - h * 0.42;
  ctx.fillStyle = "#fdd835"; ctx.fillRect(cx - 3 * k, top, 6 * k, ground - top);
  ctx.fillStyle = "#e53935"; for (var i = 0; i < 6; i++) ctx.fillRect(cx - 3 * k, top + (ground - top) * (i / 6), 6 * k, (ground - top) / 12);
  ctx.fillStyle = "#ffffff"; ctx.strokeStyle = "#1f2328"; ctx.lineWidth = 1.5 * k;
  ctx.beginPath(); ctx.ellipse(cx + 12 * k, top + 2 * k, 13 * k, 6 * k, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); // the flat hand
  ctx.fillStyle = "#1b1b5a"; stillRoundRect(cx - 28 * k, top - 34 * k, 56 * k, 26 * k, 4 * k); ctx.fill();
  stillText("YOU MUST BE", cx, top - 26 * k, 7 * k, "#ffffff", 52 * k, { face: ISD_SANS, weight: "900" });
  stillText("THIS TALL", cx, top - 17.5 * k, 9 * k, "#ffd23f", 52 * k, { face: ISD_SANS, weight: "900" });
  stillText("TO RIDE", cx, top - 10 * k, 6.5 * k, "#ffffff", 52 * k, { face: ISD_SANS, weight: "900" });
}
// A string of pennants sagging between two points.
function isdBunting(x0, y0, x1, y1, k) {
  var cols = ["#e53935", "#fdd835", "#43a047", "#1e88e5", "#8e24aa", "#fb8c00"], n = Math.max(4, Math.round(Math.hypot(x1 - x0, y1 - y0) / (16 * k)));
  var pt = function (u) { return { x: x0 + (x1 - x0) * u, y: y0 + (y1 - y0) * u + Math.sin(Math.PI * u) * 14 * k }; };
  ctx.strokeStyle = "#444444"; ctx.lineWidth = 1 * k; ctx.beginPath();
  for (var i = 0; i <= 24; i++) { var p = pt(i / 24); if (i) ctx.lineTo(p.x, p.y); else ctx.moveTo(p.x, p.y); }
  ctx.stroke();
  for (var j = 0; j < n; j++) {
    var a = pt((j + 0.15) / n), b = pt((j + 0.85) / n), m = pt((j + 0.5) / n);
    ctx.fillStyle = cols[j % cols.length];
    ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.lineTo(m.x, m.y + 11 * k); ctx.closePath(); ctx.fill();
  }
}
// A coaster loop on its A-frame, peeking up behind the hills.
function isdCoasterLoop(cx, ground, R, k) {
  ctx.save();
  ctx.strokeStyle = "#f2f2f2"; ctx.lineWidth = 2 * k;
  ctx.beginPath(); ctx.moveTo(cx - R * 0.9, ground); ctx.lineTo(cx, ground - R * 2); ctx.lineTo(cx + R * 0.9, ground); ctx.stroke();
  ctx.strokeStyle = "#b71c1c"; ctx.lineWidth = 3 * k;
  ctx.beginPath(); ctx.arc(cx, ground - R, R, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx - R * 2.2, ground - R * 0.05); ctx.quadraticCurveTo(cx - R, ground + R * 0.05, cx, ground); ctx.quadraticCurveTo(cx + R, ground - R * 0.05, cx + R * 2.2, ground - R * 0.6); ctx.stroke();
  ctx.restore();
}
// A striped circus big top with a flag.
function isdBigTop(cx, ground, s, k) {
  var top = ground - s * 1.25, wl = s * 0.95;
  ctx.save();
  ctx.beginPath(); ctx.moveTo(cx - wl, ground); ctx.lineTo(cx - wl, ground - s * 0.45); ctx.quadraticCurveTo(cx - wl * 0.4, ground - s * 0.7, cx, top); ctx.quadraticCurveTo(cx + wl * 0.4, ground - s * 0.7, cx + wl, ground - s * 0.45); ctx.lineTo(cx + wl, ground); ctx.closePath(); ctx.clip();
  for (var i = 0; i < 8; i++) { ctx.fillStyle = i % 2 ? "#ffffff" : "#d32f2f"; ctx.beginPath(); ctx.moveTo(cx, top); ctx.lineTo(cx - wl + (i / 8) * wl * 2, ground); ctx.lineTo(cx - wl + ((i + 1) / 8) * wl * 2, ground); ctx.closePath(); ctx.fill(); }
  ctx.restore();
  ctx.strokeStyle = "#444444"; ctx.lineWidth = 1.5 * k; ctx.beginPath(); ctx.moveTo(cx, top); ctx.lineTo(cx, top - s * 0.3); ctx.stroke();
  ctx.fillStyle = "#fdd835"; ctx.beginPath(); ctx.moveTo(cx, top - s * 0.3); ctx.lineTo(cx + s * 0.25, top - s * 0.24); ctx.lineTo(cx, top - s * 0.18); ctx.closePath(); ctx.fill();
}
// The park's entrance sign, in the style of Khabib's. The animated ad says
// NEW RIDE: THE VAN under it; the still puts the slogan on a ribbon.
function isdSign(x, y, w, h, k, still) {
  var bx = x + w * 0.02, by = y + h * 0.05, bw = w * 0.27, bh = h * 0.6, cx = bx + bw / 2;
  ctx.fillStyle = "#5d4037"; ctx.fillRect(bx + bw * 0.15, by + bh, 7 * k, h * 0.3); ctx.fillRect(bx + bw * 0.85 - 7 * k, by + bh, 7 * k, h * 0.3);
  ctx.fillStyle = "rgba(0,0,0,0.3)"; stillRoundRect(bx + 4 * k, by + 5 * k, bw, bh, 18 * k); ctx.fill();
  var g = ctx.createLinearGradient(0, by, 0, by + bh);
  g.addColorStop(0, "#22307a"); g.addColorStop(1, "#121a4a");
  ctx.fillStyle = g; stillRoundRect(bx, by, bw, bh, 18 * k); ctx.fill();
  ctx.strokeStyle = "#e3c26a"; ctx.lineWidth = 4 * k; stillRoundRect(bx, by, bw, bh, 18 * k); ctx.stroke();
  ctx.strokeStyle = "rgba(227,194,106,0.5)"; ctx.lineWidth = 1.2 * k; stillRoundRect(bx + 9 * k, by + 9 * k, bw - 18 * k, bh - 18 * k, 12 * k); ctx.stroke();
  var per = 2 * (bw + bh), nb = Math.round(per / (17 * k));
  for (var i = 0; i < nb; i++) {
    var d = i * per / nb, px, py;
    if (d < bw) { px = bx + d; py = by; } else if (d < bw + bh) { px = bx + bw; py = by + d - bw; }
    else if (d < 2 * bw + bh) { px = bx + bw - (d - bw - bh); py = by + bh; } else { px = bx; py = by + bh - (d - 2 * bw - bh); }
    var bg = ctx.createRadialGradient(px, py, 0, px, py, 5 * k);
    bg.addColorStop(0, "#fffbe0"); bg.addColorStop(0.5, "#ffd54f"); bg.addColorStop(1, "rgba(255,213,79,0)");
    ctx.fillStyle = bg; ctx.beginPath(); ctx.arc(px, py, 5 * k, 0, Math.PI * 2); ctx.fill();
  }
  var word = "DAGESTAN", cols = ["#ff5252", "#ffb300", "#ffee58", "#66bb6a", "#29b6f6", "#7e57c2", "#ec407a", "#ff7043"];
  var fs = 36 * k, face = "Impact, 'Arial Black', sans-serif";
  ctx.font = "900 " + fs + "px " + face;
  var widths = word.split("").map(function (c) { return ctx.measureText(c).width + fs * 0.06; });
  var total = widths.reduce(function (s, v) { return s + v; }, 0), maxW = bw * 0.82;
  if (total > maxW) { fs *= maxW / total; widths = widths.map(function (v) { return v * maxW / total; }); total = maxW; }
  var arcR = bw * 1.4, ay = by + bh * 0.2 + arcR, run = -total / 2;
  word.split("").forEach(function (c, j) {
    var mid = run + widths[j] / 2, ang = mid / arcR;
    run += widths[j];
    ctx.save(); ctx.translate(cx + Math.sin(ang) * arcR, ay - Math.cos(ang) * arcR); ctx.rotate(ang);
    stillText(c, 0, 0, fs, cols[j], widths[j] * 1.2, { stroke: "#0b0f2e", strokeW: 0.22 });
    ctx.restore();
  });
  stillText("WORLD", cx + 3 * k, by + bh * 0.52 + 4 * k, 64 * k, "#0b0f2e", bw * 0.78);
  stillText("WORLD", cx, by + bh * 0.52, 64 * k, "#ffffff", bw * 0.78, { stroke: "#e3c26a", strokeW: 0.1 });
  [[-0.43, 0.52], [0.43, 0.52]].forEach(function (s) { dwStar(cx + bw * s[0], by + bh * s[1], 7 * k); });
  ctx.fillStyle = "#c62828"; stillRoundRect(cx - bw * 0.4, by + bh * 0.72, bw * 0.8, bh * 0.17, 6 * k); ctx.fill();
  stillText("NEW RIDE: THE VAN", cx, by + bh * 0.81, 22 * k, "#ffffff", bw * 0.74, { stroke: "#7f1010", strokeW: 0.12 });
  if (still) isdSlogan(cx, by + bh + h * 0.13, bw * 0.98, h * 0.13, k, 1, 1);
  else stillText("OPEN ALL YEAR. AND THE NEXT ONE.", cx, y + h * 0.82, 11 * k, "#ffffff", bw * 1.05, { face: ISD_SANS, weight: "800", stroke: "#1b3d14", strokeW: 0.3 });
}

// ---------------------------------------------------------------- sound

function playIslamDagCue(name) {
  try {
    var ac = getAudioCtx();
    if (!ac) return;
    if (ac.state === "suspended") ac.resume();
    if (!isdOut) { isdOut = ac.createGain(); isdOut.gain.value = 0.7; isdOut.connect(ac.destination); }
    var out = isdOut, now = ac.currentTime + 0.02;
    var nb = ac.createBuffer(1, Math.floor(ac.sampleRate * 0.6), ac.sampleRate), nd = nb.getChannelData(0);
    for (var i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
    var noise = function (at, len, f, q, vol, f2) {
      var s = ac.createBufferSource(), bp = ac.createBiquadFilter(), g = ac.createGain();
      s.buffer = nb; bp.type = "bandpass"; bp.frequency.setValueAtTime(f, at); bp.Q.value = q;
      if (f2) bp.frequency.exponentialRampToValueAtTime(f2, at + len);
      g.gain.setValueAtTime(0.0001, at); g.gain.exponentialRampToValueAtTime(vol, at + Math.min(0.01, len / 3));
      g.gain.exponentialRampToValueAtTime(0.0001, at + len);
      s.connect(bp); bp.connect(g); g.connect(out); s.start(at); s.stop(at + len + 0.02);
    };
    var tone = function (f, at, len, vol, type, f2, lp) {
      var o = ac.createOscillator(), g = ac.createGain(), node = o;
      o.type = type || "sine"; o.frequency.setValueAtTime(f, at);
      if (f2) o.frequency.exponentialRampToValueAtTime(f2, at + len);
      if (lp) { var fl = ac.createBiquadFilter(); fl.type = "lowpass"; fl.frequency.value = lp; o.connect(fl); node = fl; }
      g.gain.setValueAtTime(0.0001, at); g.gain.exponentialRampToValueAtTime(vol, at + 0.015);
      g.gain.setValueAtTime(vol, at + Math.max(0.02, len - 0.05)); g.gain.exponentialRampToValueAtTime(0.0001, at + len);
      node.connect(g); g.connect(out); o.start(at); o.stop(at + len + 0.02);
    };
    if (typeof duckMusic === "function" && name === "engine") duckMusic(now, now + 2.2);
    if (typeof duckMusic === "function" && name === "flip1") duckMusic(now, now + 5.5);
    if (name === "engine") { tone(48, now, 1.4, 0.22, "sawtooth", 70, 300); tone(96, now, 1.4, 0.08, "square", 120, 500); noise(now, 1.3, 400, 0.7, 0.08); }
    if (name === "horn") { tone(415, now, 0.16, 0.18, "square", 0, 1800); tone(349, now, 0.16, 0.12, "square", 0, 1800); tone(415, now + 0.24, 0.24, 0.18, "square", 0, 1800); tone(349, now + 0.24, 0.24, 0.12, "square", 0, 1800); }
    if (name === "door") { noise(now, 0.32, 900, 1.2, 0.18, 400); noise(now + 0.3, 0.08, 180, 1, 0.3); }
    if (name.indexOf("flip") === 0) { noise(now, 0.05, 3200, 2, 0.25); tone(name === "flip5" ? 660 : 1320, now + 0.02, 0.12, 0.07, "triangle"); } // the board ticking up
    if (name === "roll") for (var r = 0; r < 8; r++) { var at = now + r * 0.055; tone(110, at, 0.09, 0.16 + r * 0.02, "sine", 60); noise(at, 0.04, 1500, 1, 0.05); }
    if (name === "stamp") {
      tone(70, now, 0.3, 0.5, "sine", 40); noise(now, 0.12, 300, 0.8, 0.35);
      [220, 277.2, 329.6, 440].forEach(function (f) { tone(f, now + 0.05, 0.9, 0.06, "sawtooth", 0, 1600); tone(f * 1.006, now + 0.05, 0.9, 0.04, "sawtooth", 0, 1600); }); // the accordion chord
    }
  } catch (e) { /* no audio */ }
}
function stopIslamDagSound() {
  if (!isdOut) return;
  try { isdOut.disconnect(); } catch (e) { /* already gone */ }
  isdOut = null;
}


// ---------------------------------------------------------------- still version
// The park poster: the van parked in its station, Islam the ride operator
// beside it, the wait-time board on 2-3 YEARS, the slogan on the sign.
function drawIslamDagStill(x, y, w, h, k, ch) {
  isdBackdrop(x, y, w, h, k, true);
  drawIslVan(x + w * ISD_L.van, y + h * ISD_L.rail, 1, 0, 0.4 * k); // (islam-specials.js)
  isdStationFront(x, y, w, h, k);
  if (ch && ch.look) isdOperator(x + w * 0.665, y + h * ISD_L.rail, h * 0.15, ch.look, k, true, 0);
  isdBoard(x + w * ISD_L.board, y + h * 0.08, h * 0.5, h * 0.5, k, ISD_PAGES.length - 1, 1, 1);
  ctx.fillStyle = "rgba(0,0,0,0.45)"; stillRoundRect(x + w * 0.4, y + h * 0.05, w * 0.33, h * 0.1, 6 * k); ctx.fill();
  stillText("FREE PICKUP FROM THE CAGE  •  EXIT BY CATAPULT", x + w * 0.565, y + h * 0.1, 12 * k, "#ffffff", w * 0.31, { face: ISD_SANS, weight: "800" });
}
