// Dagestan World Van Tours (Joe, 2026-11-24): Islam Makhachev's two ads,
// from the same Dagestan World park as Khabib's coaster ad (dagestan-ad.js).
//
// The animated one runs on the jumbotron (a banner in the test arena) when
// the van comes in his "2-3 years Dagestan" special, the first time in a
// fight (islDagestan, islam-specials.js):
//   - The DAGESTAN WORLD sign on the left, VAN TOURS under it.
//   - The white van drives in along the mountain road, BEEP BEEP!, the
//     door slides open and Islam pops out beside it, the tour guide.
//   - A tear-off calendar flips: DAY 1, WEEK 2, MONTH 6, YEAR 1, YEAR 2,
//     YEAR 3...
//   - "2-3 YEARS DAGESTAN AND FORGET" stamps in. Small print: free pickup
//     from the cage, one way only, return trip by catapult.
//   - Sound (code-made): the engine, the horn, the door, page flips, a dhol
//     roll and a stamp with an accordion chord.
// The fight's cut to Dagestan covers the whole screen, so the ad's clock
// (and its sound cues) stops while the cut is on and picks up again when
// they're catapulted back. It goes through queueJumboAd like every ad, so
// it never overlaps another; his own special doesn't hold it up (adOwn).
//
// Plus a silent still for the random rotation (drawIslamDagStill, listed in
// still-ads.js): a vintage travel poster, the van parked on a switchback
// under the peaks with Islam beside it.
"use strict";

var ISD_SHOW = 8.5;
var ISD_PAGES = ["DAY 1", "WEEK 2", "MONTH 6", "YEAR 1", "YEAR 2", "YEAR 3"];
var ISD_FLIP0 = 2.7, ISD_FLIP = 0.42, ISD_STAMP = 5.05;
var isdShow = 0, isdT = 0, isdId = 0, isdDone = false, isdOut = null, isdCues = {};
var isdCache = { key: null, cv: null };

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

// ---------------------------------------------------------------- the animated ad

function drawIslamDagJumbo(x, y, w, h) {
  if (isdShow <= 0 || !balls || !balls[isdId]) return;
  if (typeof islamTripOn === "function" && islamTripOn()) return;
  var b = balls[isdId], look = (b.baseChar && b.baseChar.look) || b.char.look;
  var t = isdT, a = Math.min(1, t / 0.3, isdShow / 0.4), k = h / 250;
  ctx.save();
  ctx.globalAlpha = a;
  ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
  isdBackdrop(x, y, w, h, k);

  // The van drives in along the road and pulls up.
  var road = y + h * 0.93, s = 0.4 * k, vx1 = x + w * 0.5;
  var du = Math.min(1, t / 1.4), vx = x - 170 * s + (vx1 - x + 170 * s) * easeOut(du);
  var moving = du < 1, bounce = moving ? Math.abs(Math.sin(t * 22)) * 2 * k : 0;
  if (moving) { // dust off the back wheels
    for (var p = 0; p < 5; p++) {
      var ph = (t * 2.6 + p / 5) % 1;
      ctx.save(); ctx.globalAlpha *= (1 - ph) * 0.7; ctx.fillStyle = "#e6dcc4";
      ctx.beginPath(); ctx.arc(vx - 150 * s - ph * 60 * k, road - 8 * k - ph * 16 * k, (6 + ph * 14) * k, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    }
  }
  var door = t < 1.7 ? 0 : Math.min(1, (t - 1.7) / 0.3);
  drawIslVan(vx, road - bounce, 1, door, s); // (islam-specials.js)
  if (t > 1.4 && t < 2.3) { // BEEP BEEP!
    var bp = Math.min(1, (t - 1.4) / 0.12), wob = 1 + Math.sin((t - 1.4) * 30) * 0.04;
    ctx.save(); ctx.translate(vx + 70 * s, road - 175 * s); ctx.scale(bp * wob, bp * wob);
    stillText("BEEP BEEP!", 0, 0, 30 * k, "#ffd23f", w * 0.2, { stroke: "#1f2328", strokeW: 0.2 });
    ctx.restore();
  }

  // Islam pops out beside it, the tour guide.
  if (t > 1.9) {
    var iu = Math.min(1, (t - 1.9) / 0.35), pop = iu < 1 ? 0.5 + 0.5 * easeOut(iu) + Math.sin(iu * Math.PI) * 0.15 : 1;
    var ir = h * 0.17 * pop, ix = vx1 + 160 * s + h * 0.17 + 16 * k, iy = road - h * 0.17 - Math.abs(Math.sin(t * 4)) * 4 * k;
    stillFighter(ix, iy, ir, look, ""); // (still-ads.js)
    if (iu >= 1) {
      ctx.save(); ctx.fillStyle = "#8e1a1a"; stillRoundRect(ix - h * 0.17, iy + h * 0.2, h * 0.34, h * 0.07, 4 * k); ctx.fill(); ctx.restore();
      stillText("YOUR DRIVER", ix, iy + h * 0.235, 11 * k, "#ffffff", h * 0.32, { face: "'Helvetica Neue', Helvetica, Arial, sans-serif", weight: "800" });
    }
  }

  // The tear-off calendar.
  if (t > 2.3) isdCalendar(x + w * 0.875, y + h * 0.1, h * 0.46, h * 0.52, k, t);

  // 2-3 YEARS DAGESTAN AND FORGET.
  if (t > ISD_STAMP) {
    var su = Math.min(1, (t - ISD_STAMP) / 0.18), sc = 1.6 - 0.6 * su;
    var bx = x + w * 0.545, by = y + h * 0.2, bw = w * 0.42, bh = h * 0.2;
    ctx.save(); ctx.globalAlpha *= su; ctx.translate(bx, by); ctx.scale(sc, sc); ctx.rotate(-0.03);
    ctx.fillStyle = "rgba(0,0,0,0.3)"; ctx.fillRect(-bw / 2 + 4 * k, -bh / 2 + 5 * k, bw, bh);
    var rg = ctx.createLinearGradient(0, -bh / 2, 0, bh / 2);
    rg.addColorStop(0, "#ef5350"); rg.addColorStop(1, "#b71c1c");
    ctx.fillStyle = rg; ctx.fillRect(-bw / 2, -bh / 2, bw, bh);
    ctx.strokeStyle = "rgba(255,255,255,0.6)"; ctx.lineWidth = 1.2 * k; ctx.setLineDash([5 * k, 3 * k]);
    ctx.strokeRect(-bw / 2 + 5 * k, -bh / 2 + 4 * k, bw - 10 * k, bh - 8 * k); ctx.setLineDash([]);
    stillText("2-3 YEARS DAGESTAN AND FORGET", 0, 2 * k, 30 * k, "#ffffff", bw * 0.9, { stroke: "#6d0f0f", strokeW: 0.14 });
    ctx.restore();
    if (su >= 1 && t < ISD_STAMP + 0.3 && !reduceMotion) { // a puff where it lands
      ctx.save(); ctx.globalAlpha *= 1 - (t - ISD_STAMP - 0.18) / 0.12; ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 3 * k;
      ctx.strokeRect(bx - bw * 0.55, by - bh * 0.7, bw * 1.1, bh * 1.4); ctx.restore();
    }
  }
  if (t > ISD_STAMP + 0.8) {
    ctx.save(); ctx.globalAlpha *= Math.min(1, (t - ISD_STAMP - 0.8) / 0.4);
    ctx.fillStyle = "rgba(0,0,0,0.45)"; stillRoundRect(x + w * 0.34, y + h * 0.33, w * 0.41, h * 0.085, 6 * k); ctx.fill();
    stillText("FREE PICKUP FROM THE CAGE  •  ONE WAY ONLY  •  RETURN TRIP BY CATAPULT", x + w * 0.545, y + h * 0.373, 12 * k, "#ffffff", w * 0.39, { face: "'Helvetica Neue', Helvetica, Arial, sans-serif", weight: "800" });
    ctx.restore();
  }
  ctx.restore();
}
function drawIslamDagBanner() {
  if (isdShow <= 0 || stadiumOn()) return;
  drawIslamDagJumbo(10, 10, W - 20, 110);
}

// The scenery and the sign, painted once per size like Khabib's ad.
function isdBackdrop(x, y, w, h, k) {
  var px = (typeof canvas !== "undefined" && canvas.width && typeof STAGE_W !== "undefined" && stadiumOn()) ? canvas.width / STAGE_W : 2;
  var key = Math.round(w) + "x" + Math.round(h) + "@" + px.toFixed(2);
  if (isdCache.key !== key) {
    var cv = document.createElement("canvas");
    cv.width = Math.ceil(w * px); cv.height = Math.ceil(h * px);
    var g = cv.getContext("2d");
    g.scale(px, px);
    var saved = ctx; ctx = g; // reuse the poster helpers on the offscreen canvas
    try { isdScene(0, 0, w, h, k); } finally { ctx = saved; }
    isdCache = { key: key, cv: cv };
  }
  ctx.drawImage(isdCache.cv, x, y, w, h);
}
function isdScene(x, y, w, h, k) {
  var sky = ctx.createLinearGradient(0, y, 0, y + h);
  sky.addColorStop(0, "#1e6fd9"); sky.addColorStop(0.55, "#7cc3ff"); sky.addColorStop(1, "#ffe1b3");
  ctx.fillStyle = sky; ctx.fillRect(x, y, w, h);
  var sx = x + w * 0.7, sy = y + h * 0.16;
  var sg = ctx.createRadialGradient(sx, sy, h * 0.04, sx, sy, h * 0.42);
  sg.addColorStop(0, "rgba(255,250,215,0.95)"); sg.addColorStop(0.3, "rgba(255,236,160,0.4)"); sg.addColorStop(1, "rgba(255,236,160,0)");
  ctx.fillStyle = sg; ctx.fillRect(x, y, w, h);
  [[0.4, 0.1, 0.9], [0.62, 0.24, 0.6], [0.98, 0.12, 0.8]].forEach(function (c) { dwCloud(x + w * c[0], y + h * c[1], h * 0.09 * c[2]); });
  dwRange(x, y, w, h, 0.47, 0.22, 1.9, ["#a9bbdc", "#c9d6ee"], 0.6, 0.55); // (dagestan-ad.js)
  dwRange(x, y, w, h, 0.57, 0.25, 4.2, ["#6f86b3", "#93a8cf"], 0.58, 0.85);
  dwRange(x, y, w, h, 0.68, 0.16, 2.6, ["#4c6a8f", "#6f8db0"], 0.72, 0.95);
  var hill = ctx.createLinearGradient(0, y + h * 0.7, 0, y + h);
  hill.addColorStop(0, "#6dbb4a"); hill.addColorStop(1, "#2f7d2c");
  ctx.fillStyle = hill;
  ctx.beginPath(); ctx.moveTo(x, y + h);
  for (var i = 0; i <= 80; i++) { var u = i / 80; ctx.lineTo(x + w * u, y + h * (0.79 + 0.03 * Math.sin(u * 8 + 2) + 0.015 * Math.sin(u * 21))); }
  ctx.lineTo(x + w, y + h); ctx.closePath(); ctx.fill();
  for (var tr = 0; tr < 18; tr++) {
    var tx = x + w * (0.33 + ((tr * 0.0817) % 0.66)), ts = h * (0.05 + (tr % 3) * 0.012);
    dwPine(tx, y + h * (0.82 + (tr % 2) * 0.015), ts);
  }
  // The mountain road along the bottom: asphalt, a dashed center line.
  ctx.fillStyle = "#55595e"; ctx.fillRect(x, y + h * 0.88, w, h * 0.12);
  ctx.fillStyle = "#3d4044"; ctx.fillRect(x, y + h * 0.88, w, h * 0.012);
  ctx.fillStyle = "#f3e7b0";
  for (var d = 0; d < 30; d++) ctx.fillRect(x + w * (d / 30), y + h * 0.955, w * 0.018, h * 0.01);
  isdSign(x, y, w, h, k);
}
// The park's entrance sign, in the style of Khabib's: VAN TOURS under it.
function isdSign(x, y, w, h, k) {
  var bx = x + w * 0.02, by = y + h * 0.05, bw = w * 0.27, bh = h * 0.6, cx = bx + bw / 2;
  ctx.fillStyle = "#5d4037"; ctx.fillRect(bx + bw * 0.15, by + bh, 7 * k, h * 0.3); ctx.fillRect(bx + bw * 0.85 - 7 * k, by + bh, 7 * k, h * 0.3);
  ctx.fillStyle = "rgba(0,0,0,0.3)"; stillRoundRect(bx + 4 * k, by + 5 * k, bw, bh, 18 * k); ctx.fill();
  var g = ctx.createLinearGradient(0, by, 0, by + bh);
  g.addColorStop(0, "#22307a"); g.addColorStop(1, "#121a4a");
  ctx.fillStyle = g; stillRoundRect(bx, by, bw, bh, 18 * k); ctx.fill();
  ctx.strokeStyle = "#e3c26a"; ctx.lineWidth = 4 * k; stillRoundRect(bx, by, bw, bh, 18 * k); ctx.stroke();
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
  ctx.fillStyle = "#c62828"; stillRoundRect(cx - bw * 0.36, by + bh * 0.72, bw * 0.72, bh * 0.17, 6 * k); ctx.fill();
  stillText("VAN TOURS", cx, by + bh * 0.81, 26 * k, "#ffffff", bw * 0.66, { stroke: "#7f1010", strokeW: 0.12 });
  stillText("OPEN ALL YEAR. AND THE NEXT ONE.", cx, y + h * 0.82, 11 * k, "#ffffff", bw * 1.05, { face: "'Helvetica Neue', Helvetica, Arial, sans-serif", weight: "800", stroke: "#1b3d14", strokeW: 0.3 });
}
// A tear-off wall calendar: the pages fly off one by one.
function isdCalendar(cx, top, cw, chh, k, t) {
  var in0 = Math.min(1, (t - 2.3) / 0.25), x = cx - cw / 2;
  ctx.save(); ctx.globalAlpha *= in0;
  ctx.fillStyle = "rgba(0,0,0,0.3)"; ctx.fillRect(x + 4 * k, top + 5 * k, cw, chh);
  ctx.fillStyle = "#fbf7ee"; ctx.fillRect(x, top, cw, chh);
  ctx.strokeStyle = "#1f2328"; ctx.lineWidth = 2 * k; ctx.strokeRect(x, top, cw, chh);
  ctx.fillStyle = "#c62828"; ctx.fillRect(x, top, cw, chh * 0.26);
  stillText("DAGESTAN", cx, top + chh * 0.13, 16 * k, "#ffffff", cw * 0.85);
  ctx.fillStyle = "#1f2328"; [0.3, 0.7].forEach(function (u) { ctx.beginPath(); ctx.arc(x + cw * u, top + 3 * k, 4 * k, 0, Math.PI * 2); ctx.fill(); }); // the rings
  var n = Math.max(0, Math.min(ISD_PAGES.length - 1, Math.floor((t - ISD_FLIP0) / ISD_FLIP) + 1));
  if (t < ISD_FLIP0) n = 0;
  var last = n === ISD_PAGES.length - 1;
  stillText(ISD_PAGES[n], cx, top + chh * 0.62, 30 * k, last ? "#c62828" : "#1f2328", cw * 0.86);
  if (n > 0) { // the page before tearing away
    var fu = (t - ISD_FLIP0 - (n - 1) * ISD_FLIP) / 0.3;
    if (fu < 1) {
      ctx.save(); ctx.globalAlpha *= 1 - fu;
      ctx.translate(cx + fu * cw * 0.6, top + chh * 0.26 + fu * chh * 0.4); ctx.rotate(fu * 0.9);
      ctx.fillStyle = "#fbf7ee"; ctx.fillRect(-cw / 2, 0, cw, chh * 0.74); ctx.strokeRect(-cw / 2, 0, cw, chh * 0.74);
      stillText(ISD_PAGES[n - 1], 0, chh * 0.36, 30 * k, "#1f2328", cw * 0.86);
      ctx.restore();
    }
  }
  ctx.restore();
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
    if (name.indexOf("flip") === 0) noise(now, 0.12, 2600, 0.9, 0.22, 5200);
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
// A vintage travel poster: a cream border, flat sunset peaks, the white van
// parked on a switchback with Islam beside it, and the slogan.
function drawIslamDagStill(x, y, w, h, k, ch) {
  ctx.fillStyle = "#efe3c8"; ctx.fillRect(x, y, w, h);
  var m = 10 * k, ix = x + m, iy = y + m, iw = w - m * 2, ih = h - m * 2;
  // The picture on the right.
  var px = ix + iw * 0.44, pw = iw * 0.56;
  ctx.save(); ctx.beginPath(); ctx.rect(px, iy, pw, ih); ctx.clip();
  var sky = ctx.createLinearGradient(0, iy, 0, iy + ih);
  sky.addColorStop(0, "#f7a35c"); sky.addColorStop(0.5, "#f4c37a"); sky.addColorStop(1, "#f8e2b2");
  ctx.fillStyle = sky; ctx.fillRect(px, iy, pw, ih);
  ctx.fillStyle = "#fff3cf"; ctx.beginPath(); ctx.arc(px + pw * 0.3, iy + ih * 0.3, ih * 0.13, 0, Math.PI * 2); ctx.fill();
  [["#8c4a6b", 0.5, 0.3, 1.3, 0.62], ["#5e2f55", 0.66, 0.24, 3.7, 0.7], ["#3b2142", 0.8, 0.14, 5.9, 2]].forEach(function (r) { // flat ridges, snow on the top one
    ctx.fillStyle = r[0]; ctx.beginPath(); ctx.moveTo(px, iy + ih);
    for (var i = 0; i <= 90; i++) { var u = i / 90; ctx.lineTo(px + pw * u, iy + ih * (r[1] - r[2] * (0.45 + 0.55 * dwRidge(u, r[3])))); }
    ctx.lineTo(px + pw, iy + ih); ctx.closePath(); ctx.fill();
    if (r[4] < 1) {
      ctx.save(); ctx.clip(); ctx.fillStyle = "#fbf3ea";
      ctx.beginPath(); ctx.moveTo(px, iy);
      for (var s = 0; s <= 90; s++) { var v = s / 90; ctx.lineTo(px + pw * v, iy + ih * (r[1] - r[2] * r[4]) + ih * 0.02 * Math.sin(v * 80 + r[3])); }
      ctx.lineTo(px + pw, iy); ctx.closePath(); ctx.fill(); ctx.restore();
    }
  });
  // The switchback road climbing the front slope.
  ctx.strokeStyle = "#d9c9a3"; ctx.lineWidth = 7 * k; ctx.lineCap = "round"; ctx.lineJoin = "round";
  ctx.beginPath(); ctx.moveTo(px + pw * 0.95, iy + ih * 0.72); ctx.lineTo(px + pw * 0.5, iy + ih * 0.78); ctx.lineTo(px + pw * 0.9, iy + ih * 0.86); ctx.lineTo(px - 10, iy + ih * 0.97); ctx.stroke();
  drawIslVan(px + pw * 0.42, iy + ih * 0.95, 1, 0, 0.36 * k); // (islam-specials.js)
  if (ch && ch.look) stillFighter(px + pw * 0.78, iy + ih * 0.74, ih * 0.17, ch.look, "");
  ctx.restore();
  ctx.strokeStyle = "#3b2142"; ctx.lineWidth = 3 * k; ctx.strokeRect(px, iy, pw, ih);

  // The words on the left.
  var cx = ix + iw * 0.215, tw = iw * 0.41, serif = "Georgia, 'Times New Roman', serif";
  stillText("VISIT", cx, iy + ih * 0.1, 18 * k, "#8c4a6b", tw, { face: serif, weight: "700" });
  stillText("DAGESTAN", cx, iy + ih * 0.28, 52 * k, "#5a0f18", tw);
  stillText("WORLD", cx, iy + ih * 0.46, 34 * k, "#3b2142", tw * 0.7);
  ctx.fillStyle = "#c62828"; ctx.fillRect(ix + iw * 0.01, iy + ih * 0.56, tw, ih * 0.16);
  stillText("2-3 YEARS DAGESTAN AND FORGET", cx, iy + ih * 0.64, 22 * k, "#ffffff", tw * 0.94, { stroke: "#6d0f0f", strokeW: 0.12 });
  stillText("ONE-WAY VAN TOURS  •  FREE PICKUP FROM THE CAGE", cx, iy + ih * 0.8, 12 * k, "#3b2142", tw, { face: "'Helvetica Neue', Helvetica, Arial, sans-serif", weight: "800" });
  stillText("*Return trip by catapult.", cx, iy + ih * 0.92, 11 * k, "#8c4a6b", tw, { face: serif, weight: "italic 700" });
}
