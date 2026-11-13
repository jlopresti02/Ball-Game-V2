// Maxx Energy (Joe, 2026-11-13): an energy-drink parody for Max Holloway,
// the man with the most strikes in the game. It runs on the jumbotron (a
// banner in the test arena) as his Button Mash kicks in after the Flashback
// (holloway.js), so once a fight at most.
//   - A black can with his teal, a red-and-blue hibiscus wrap (Waianae,
//     Hawaii) and the MAXX logo, slammed down, cracked open: PSSHT.
//   - Max on the left throwing a flurry while a strike counter races up to
//     445 (his real UFC record for significant strikes in one fight,
//     against Calvin Kattar in 2021).
//   - MAXX ENERGY. MAX VOLUME. "Zero sugar. Zero breaks."
//   - Sound: the can cracking, fizz, a bass hit, a riser and the counter
//     ticking.
// It goes through queueJumboAd like every ad, so it never overlaps another.
// Plus a silent still for the random rotation (drawMaxxStill), and
// drawMaxxCan for anywhere else a can is wanted.
"use strict";

var MAXX_SHOW = 7.0;
var MAXX_TEAL = "#16c2b0", MAXX_RED = "#e3173d", MAXX_BLUE = "#1a4fd6";
var maxxShow = 0, maxxId = 0, maxxDone = false, maxxOut = null;

function resetMaxxAd() { maxxShow = 0; maxxDone = false; stopMaxxSound(); }
// From startMash (holloway.js): his Button Mash, right after the Flashback.
function maxxOnMash(b) {
  if (maxxDone || (typeof galleryDemo !== "undefined" && galleryDemo)) return;
  maxxDone = true;
  queueJumboAd(MAXX_SHOW, function () { maxxShow = MAXX_SHOW; maxxId = b.id; playMaxxSound(); }, b);
}
// Every frame, from tickAdBreaks (ad-breaks.js).
function tickMaxxAd(dt) { if (maxxShow > 0) maxxShow = Math.max(0, maxxShow - dt); }

// The MAXX wordmark: heavy italic letters, the two Xs crossed like lightning.
function maxxLogo(cx, cy, size, k, glow) {
  ctx.save();
  ctx.translate(cx, cy); ctx.transform(1, 0, -0.18, 1, 0, 0);
  ctx.font = "900 " + size + "px Impact, 'Arial Black', sans-serif";
  ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.lineJoin = "round";
  if (glow) { ctx.shadowColor = glow; ctx.shadowBlur = size * 0.35; }
  ctx.lineWidth = size * 0.14; ctx.strokeStyle = "#05070a"; ctx.strokeText("MA", -size * 0.5, 0);
  ctx.fillStyle = "#ffffff"; ctx.fillText("MA", -size * 0.5, 0);
  ctx.shadowBlur = 0;
  // XX in teal and red, overlapping.
  ctx.lineWidth = size * 0.14;
  ctx.strokeText("X", size * 0.5, 0); ctx.fillStyle = MAXX_TEAL; ctx.fillText("X", size * 0.5, 0);
  ctx.strokeText("X", size * 0.98, 0); ctx.fillStyle = MAXX_RED; ctx.fillText("X", size * 0.98, 0);
  ctx.restore();
}

// A hibiscus flower (his shorts' print) for the can wrap.
function maxxHibiscus(x, y, r, col, rot) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot || 0);
  ctx.fillStyle = col;
  for (var i = 0; i < 5; i++) {
    ctx.rotate(Math.PI * 2 / 5);
    ctx.beginPath(); ctx.ellipse(0, -r * 0.55, r * 0.42, r * 0.6, 0, 0, Math.PI * 2); ctx.fill();
  }
  ctx.fillStyle = "#ffd23f"; ctx.beginPath(); ctx.arc(0, 0, r * 0.18, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

// The can, standing on (cx, base), h tall. opts.open pops the tab.
function drawMaxxCan(cx, base, h, k, opts) {
  opts = opts || {};
  var w = h * 0.42, top = base - h, rimH = h * 0.06;
  ctx.save();
  if (opts.tilt) { ctx.translate(cx, base); ctx.rotate(opts.tilt); ctx.translate(-cx, -base); }
  ctx.fillStyle = "rgba(0,0,0,0.35)"; ctx.beginPath(); ctx.ellipse(cx, base, w * 0.6, h * 0.04, 0, 0, Math.PI * 2); ctx.fill();
  // Body.
  ctx.beginPath();
  ctx.moveTo(cx - w / 2, top + rimH * 1.4);
  ctx.lineTo(cx - w / 2, base - rimH);
  ctx.quadraticCurveTo(cx - w / 2, base, cx - w * 0.38, base);
  ctx.lineTo(cx + w * 0.38, base);
  ctx.quadraticCurveTo(cx + w / 2, base, cx + w / 2, base - rimH);
  ctx.lineTo(cx + w / 2, top + rimH * 1.4);
  ctx.quadraticCurveTo(cx + w / 2, top + rimH * 0.6, cx + w * 0.4, top + rimH * 0.5);
  ctx.lineTo(cx - w * 0.4, top + rimH * 0.5);
  ctx.quadraticCurveTo(cx - w / 2, top + rimH * 0.6, cx - w / 2, top + rimH * 1.4);
  ctx.closePath();
  ctx.fillStyle = "#0b0d12"; ctx.fill();
  ctx.save(); ctx.clip();
  // Hibiscus wrap and a teal lightning stripe.
  var fl = [[-0.3, 0.3, MAXX_RED, 0.3], [0.32, 0.22, MAXX_BLUE, 1.1], [0.18, 0.8, MAXX_RED, 2.0], [-0.28, 0.9, MAXX_BLUE, 0.6]];
  fl.forEach(function (f) { ctx.globalAlpha = 0.55; maxxHibiscus(cx + f[0] * w, top + f[1] * h, w * 0.32, f[2], f[3]); });
  ctx.globalAlpha = 1;
  ctx.fillStyle = MAXX_TEAL;
  ctx.beginPath();
  ctx.moveTo(cx - w * 0.6, top + h * 0.62); ctx.lineTo(cx + w * 0.1, top + h * 0.5); ctx.lineTo(cx - w * 0.02, top + h * 0.58);
  ctx.lineTo(cx + w * 0.6, top + h * 0.46); ctx.lineTo(cx + w * 0.6, top + h * 0.52); ctx.lineTo(cx + w * 0.06, top + h * 0.64);
  ctx.lineTo(cx + w * 0.16, top + h * 0.56); ctx.lineTo(cx - w * 0.6, top + h * 0.68); ctx.closePath(); ctx.fill();
  // Shading: dark edges, a bright stripe of shine.
  var sh = ctx.createLinearGradient(cx - w / 2, 0, cx + w / 2, 0);
  sh.addColorStop(0, "rgba(0,0,0,0.55)"); sh.addColorStop(0.28, "rgba(255,255,255,0.18)"); sh.addColorStop(0.36, "rgba(255,255,255,0.02)");
  sh.addColorStop(0.75, "rgba(0,0,0,0.1)"); sh.addColorStop(1, "rgba(0,0,0,0.6)");
  ctx.fillStyle = sh; ctx.fillRect(cx - w, top, w * 2, h);
  ctx.restore();
  // Logo, standing up the can.
  ctx.save(); ctx.translate(cx, top + h * 0.33); ctx.rotate(-Math.PI / 2);
  maxxLogo(-w * 0.18, 0, w * 0.55, k);
  ctx.restore();
  ctx.save(); ctx.translate(cx + w * 0.3, top + h * 0.33); ctx.rotate(-Math.PI / 2);
  stillText("ENERGY", 0, 0, w * 0.15, MAXX_TEAL, h * 0.4, { weight: "900" });
  ctx.restore();
  stillText("MAX VOLUME", cx, top + h * 0.78, w * 0.14, "#ffffff", w * 0.85, { weight: "900" });
  stillText("ZERO SUGAR", cx, top + h * 0.86, w * 0.1, "#9aa3ad", w * 0.8, { face: "'Helvetica Neue', Helvetica, Arial, sans-serif", weight: "800" });
  // Top rim and lid.
  var lid = ctx.createLinearGradient(cx - w / 2, 0, cx + w / 2, 0);
  lid.addColorStop(0, "#7c858f"); lid.addColorStop(0.4, "#eef2f6"); lid.addColorStop(1, "#6b737c");
  ctx.fillStyle = lid; ctx.strokeStyle = "#3d444c"; ctx.lineWidth = 1.2 * k;
  ctx.beginPath(); ctx.ellipse(cx, top + rimH * 0.6, w * 0.42, rimH * 0.6, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = "#aab2bb";
  if (opts.open) { ctx.fillStyle = "#1a1d22"; ctx.beginPath(); ctx.ellipse(cx + w * 0.08, top + rimH * 0.6, w * 0.1, rimH * 0.28, 0, 0, Math.PI * 2); ctx.fill(); }
  ctx.fillStyle = "#c9d0d8"; ctx.strokeStyle = "#4b525a";
  stillRoundRect(cx - w * 0.14, top + rimH * 0.35 - (opts.open ? rimH * 0.5 : 0), w * 0.16, rimH * 0.45, rimH * 0.2); ctx.fill(); ctx.stroke(); // the tab
  // Bottom rim.
  ctx.fillStyle = lid; ctx.beginPath(); ctx.ellipse(cx, base - rimH * 0.3, w * 0.38, rimH * 0.35, 0, 0, Math.PI); ctx.fill();
  ctx.restore();
}

function maxxBg(x, y, w, h, t, k) {
  var bg = ctx.createRadialGradient(x + w * 0.45, y + h * 0.5, h * 0.1, x + w * 0.45, y + h * 0.5, w * 0.6);
  bg.addColorStop(0, "#14303a"); bg.addColorStop(0.6, "#0a1218"); bg.addColorStop(1, "#05070a");
  ctx.fillStyle = bg; ctx.fillRect(x, y, w, h);
  // Speed lines rushing out from the can.
  ctx.save(); ctx.translate(x + w * 0.45, y + h * 0.55);
  for (var i = 0; i < 26; i++) {
    var a = i / 26 * Math.PI * 2 + 0.1, p = (t * 1.8 + i * 0.37) % 1;
    ctx.strokeStyle = i % 3 ? "rgba(22,194,176," + (0.35 * (1 - p)) + ")" : "rgba(227,23,61," + (0.35 * (1 - p)) + ")";
    ctx.lineWidth = 3 * k;
    ctx.beginPath(); ctx.moveTo(Math.cos(a) * (h * 0.4 + p * w * 0.4), Math.sin(a) * (h * 0.4 + p * w * 0.4));
    ctx.lineTo(Math.cos(a) * (h * 0.4 + p * w * 0.4 + 40 * k), Math.sin(a) * (h * 0.4 + p * w * 0.4 + 40 * k)); ctx.stroke();
  }
  ctx.restore();
}

function drawMaxxJumbo(x, y, w, h) {
  if (maxxShow <= 0 || !balls || !balls[maxxId]) return;
  var b = balls[maxxId], t = MAXX_SHOW - maxxShow, a = Math.min(1, t / 0.2, maxxShow / 0.4), k = h / 250;
  var sans = "'Helvetica Neue', Helvetica, Arial, sans-serif";
  ctx.save();
  ctx.globalAlpha = a;
  ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
  maxxBg(x, y, w, h, t, k);

  // The can slams down (0.2s), then cracks open at 0.7s with a spray.
  var slam = Math.min(1, t / 0.25), cx = x + w * 0.45, base = y + h * 0.95;
  var shake = t > 0.25 && t < 0.45 ? Math.sin(t * 90) * 4 * k : 0;
  drawMaxxCan(cx + shake, base - (1 - slam) * h, h * 0.86, k, { open: t > 0.7 });
  if (t > 0.7 && t < 1.6) {
    var sp = (t - 0.7) / 0.9;
    ctx.save(); ctx.globalAlpha *= 1 - sp;
    for (var d = 0; d < 16; d++) {
      var da = -Math.PI / 2 + (d / 15 - 0.5) * 1.6, dr = sp * h * 0.45;
      ctx.fillStyle = d % 2 ? "#bff7ef" : "#ffffff";
      ctx.beginPath(); ctx.arc(cx + h * 0.03 + Math.cos(da) * dr, base - h * 0.86 + Math.sin(da) * dr + sp * sp * h * 0.25, (4 - sp * 2.5) * k, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
    ctx.save(); ctx.globalAlpha *= Math.min(1, (1 - sp) * 2);
    ctx.translate(cx + h * 0.32, y + h * 0.16); ctx.rotate(0.12);
    stillText("PSSHT!", 0, 0, 26 * k, "#ffffff", 120 * k, { weight: "900", stroke: "#05070a", strokeW: 0.22 });
    ctx.restore();
  }

  // Max on the left throwing a flurry, the counter racing up to 445.
  var mx = x + w * 0.13, my = y + h * 0.58, mr = h * 0.27;
  var go = Math.min(1, Math.max(0, (t - 0.9) / 3.2));
  var count = Math.floor(445 * (go < 1 ? go * go * (3 - 2 * go) : 1));
  var flurry = t > 0.9 && t < 4.3;
  stillFighter(mx, my, mr, b.char.look, b.char.name);
  if (flurry) {
    var ph = (t * 14) % 2, side = ph < 1 ? -1 : 1, ext = Math.sin((ph % 1) * Math.PI);
    drawGlove(ctx, mx + mr * (0.95 + ext * 0.55), my + side * mr * 0.32, mr * 0.34, b.char.look, "#0b0f12", 0);
    drawGlove(ctx, mx + mr * 0.95, my - side * mr * 0.32, mr * 0.34, b.char.look, "#0b0f12", 0);
    ctx.strokeStyle = "rgba(255,255,255,0.6)"; ctx.lineWidth = 2 * k;
    for (var s = 0; s < 3; s++) { var sy2 = my + (s - 1) * mr * 0.35; ctx.beginPath(); ctx.moveTo(mx + mr * 1.5, sy2); ctx.lineTo(mx + mr * 1.9, sy2); ctx.stroke(); }
  } else {
    drawGlove(ctx, mx + mr * 0.95, my - mr * 0.32, mr * 0.34, b.char.look, "#0b0f12", -0.5);
    drawGlove(ctx, mx + mr * 0.95, my + mr * 0.32, mr * 0.34, b.char.look, "#0b0f12", 0.3);
  }
  if (t > 0.9) {
    var bump = flurry ? 1 + 0.06 * Math.sin(t * 40) : 1;
    stillText(String(count), mx, y + h * 0.13, 30 * k * bump, count >= 445 ? "#ffd23f" : "#ffffff", w * 0.2, { weight: "900", stroke: "#05070a", strokeW: 0.2, glow: count >= 445 ? "rgba(255,210,63,0.8)" : null });
    stillText(count >= 445 ? "STRIKES. ONE NIGHT." : "STRIKES", mx, y + h * 0.24, 11 * k, MAXX_TEAL, w * 0.22, { face: sans, weight: "900" });
  }

  // The copy on the right.
  var tx = x + w * 0.77, tw = w * 0.38;
  var c1 = Math.min(1, Math.max(0, (t - 0.35) / 0.3));
  if (c1 > 0) {
    ctx.save(); ctx.globalAlpha *= c1;
    var punch = 1 + 0.25 * Math.max(0, 1 - (t - 0.35) * 5);
    ctx.translate(tx, y + h * 0.24); ctx.scale(punch, punch);
    maxxLogo(-29 * k, 0, 58 * k, k, "rgba(22,194,176,0.9)");
    ctx.restore();
    ctx.save(); ctx.globalAlpha *= c1;
    stillText("E N E R G Y", tx, y + h * 0.41, 18 * k, MAXX_TEAL, tw, { weight: "900" });
    ctx.restore();
  }
  var c2 = Math.min(1, Math.max(0, (t - 4.3) / 0.3));
  if (c2 > 0) {
    ctx.save(); ctx.globalAlpha *= c2;
    ctx.translate(tx, y + h * 0.6); var sc = 1 + 0.3 * Math.max(0, 1 - (t - 4.3) * 5); ctx.scale(sc, sc);
    stillText("MAX VOLUME.", 0, 0, 38 * k, "#ffffff", tw, { weight: "900", stroke: MAXX_RED, strokeW: 0.12, glow: "rgba(227,23,61,0.6)" });
    ctx.restore();
  }
  var c3 = Math.min(1, Math.max(0, (t - 5.0) / 0.3));
  if (c3 > 0) {
    ctx.save(); ctx.globalAlpha *= c3;
    stillText("Zero sugar. Zero breaks.", tx, y + h * 0.76, 16 * k, "#cfd6dd", tw, { face: sans, weight: "italic 700" });
    stillText("BLESSED BY MAX HOLLOWAY • WAIANAE, HAWAII", tx, y + h * 0.88, 11 * k, MAXX_TEAL, tw, { face: sans, weight: "800" });
    ctx.restore();
  }
  ctx.strokeStyle = MAXX_TEAL; ctx.lineWidth = 3 * k; ctx.strokeRect(x + 2 * k, y + 2 * k, w - 4 * k, h - 4 * k);
  ctx.restore();
}
function drawMaxxBanner() {
  if (maxxShow <= 0 || stadiumOn()) return;
  drawMaxxJumbo(10, 10, W - 20, 110);
}

// ---------------------------------------------------------------- still version
// The silent still (in the still-ad rotation, still-ads.js): game night.
// An old CRT TV glowing teal on the left, a controller and the can on the
// rug, and Max on the right. GAME ON. MAXX ON.
function drawMaxxStill(x, y, w, h, k, ch) {
  var sans = "'Helvetica Neue', Helvetica, Arial, sans-serif";
  ctx.fillStyle = "#0b0f16"; ctx.fillRect(x, y, w, h);
  var glow = ctx.createRadialGradient(x + w * 0.14, y + h * 0.45, 10 * k, x + w * 0.14, y + h * 0.45, w * 0.35);
  glow.addColorStop(0, "rgba(22,194,176,0.35)"); glow.addColorStop(1, "rgba(22,194,176,0)");
  ctx.fillStyle = glow; ctx.fillRect(x, y, w, h);
  // The rug.
  ctx.fillStyle = "#2a1c3a"; ctx.fillRect(x, y + h * 0.82, w, h * 0.18);
  ctx.strokeStyle = "rgba(255,255,255,0.08)"; ctx.lineWidth = 2 * k;
  for (var r = 0; r < 4; r++) { ctx.beginPath(); ctx.moveTo(x, y + h * (0.86 + r * 0.04)); ctx.lineTo(x + w, y + h * (0.86 + r * 0.04)); ctx.stroke(); }
  // The CRT.
  var tvx = x + w * 0.03, tvy = y + h * 0.12, tvw = w * 0.22, tvh = h * 0.68;
  ctx.fillStyle = "#3a3d44"; ctx.strokeStyle = "#16181c"; ctx.lineWidth = 2 * k;
  stillRoundRect(tvx, tvy, tvw, tvh, 10 * k); ctx.fill(); ctx.stroke();
  var sx = tvx + tvw * 0.08, sy = tvy + tvh * 0.08, sw = tvw * 0.7, shh = tvh * 0.72;
  var scr = ctx.createLinearGradient(sx, sy, sx, sy + shh);
  scr.addColorStop(0, "#1b6f69"); scr.addColorStop(1, "#0a2f33");
  ctx.fillStyle = scr; stillRoundRect(sx, sy, sw, shh, 12 * k); ctx.fill();
  stillText("PRESS", sx + sw / 2, sy + shh * 0.38, 13 * k, "#bff7ef", sw * 0.8, { face: "'Courier New', monospace", weight: "900" });
  stillText("START", sx + sw / 2, sy + shh * 0.58, 13 * k, "#bff7ef", sw * 0.8, { face: "'Courier New', monospace", weight: "900" });
  ctx.fillStyle = "rgba(0,0,0,0.25)"; for (var l = 0; l < shh; l += 3 * k) ctx.fillRect(sx, sy + l, sw, 1 * k); // scanlines
  ctx.fillStyle = "#1f2126"; ctx.beginPath(); ctx.arc(tvx + tvw * 0.9, tvy + tvh * 0.3, tvw * 0.04, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(tvx + tvw * 0.9, tvy + tvh * 0.45, tvw * 0.04, 0, Math.PI * 2); ctx.fill();
  // The controller and the can on the rug.
  var gx = x + w * 0.3, gy = y + h * 0.86;
  ctx.fillStyle = "#6b6f78"; ctx.strokeStyle = "#16181c"; ctx.lineWidth = 1.5 * k;
  stillRoundRect(gx - 34 * k, gy - 13 * k, 68 * k, 26 * k, 12 * k); ctx.fill(); ctx.stroke();
  ctx.fillStyle = "#1f2126"; ctx.fillRect(gx - 24 * k, gy - 3 * k, 12 * k, 4 * k); ctx.fillRect(gx - 20 * k, gy - 7 * k, 4 * k, 12 * k);
  ctx.fillStyle = MAXX_RED; ctx.beginPath(); ctx.arc(gx + 16 * k, gy - 2 * k, 4 * k, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = MAXX_BLUE; ctx.beginPath(); ctx.arc(gx + 25 * k, gy - 5 * k, 4 * k, 0, Math.PI * 2); ctx.fill();
  drawMaxxCan(x + w * 0.4, y + h * 0.92, h * 0.72, k, { open: true });
  // The copy.
  var tx = x + w * 0.64, tw = w * 0.3;
  stillText("GAME ON.", tx, y + h * 0.2, 34 * k, "#ffffff", tw, { weight: "900" });
  maxxLogo(tx - 46 * k, y + h * 0.42, 50 * k, k, "rgba(22,194,176,0.9)");
  stillText("ON.", tx + 40 * k, y + h * 0.42, 34 * k, "#ffffff", tw, { weight: "900", align: "left" });
  stillText("MAXX ENERGY • MAX VOLUME • ZERO SUGAR", tx, y + h * 0.6, 12 * k, MAXX_TEAL, tw, { face: sans, weight: "900" });
  stillText("445 strikes in one night. Zero breaks.", tx, y + h * 0.72, 14 * k, "#cfd6dd", tw, { face: sans, weight: "italic 700" });
  // Max on the right.
  stillFighter(x + w * 0.89, y + h * 0.56, h * 0.3, ch.look, ch.name);
  ctx.strokeStyle = MAXX_TEAL; ctx.lineWidth = 3 * k; ctx.strokeRect(x + 2 * k, y + 2 * k, w - 4 * k, h - 4 * k);
}

// Synth sound: the can slamming down, cracking open (PSSHT) and fizzing, a
// deep bass hit with the logo, the counter ticking up through the flurry
// on a rising riser, and a big hit on MAX VOLUME.
function playMaxxSound() {
  try {
    var ac = getAudioCtx();
    if (!ac) return;
    if (ac.state === "suspended") ac.resume();
    stopMaxxSound();
    var out = maxxOut = ac.createGain(), now = ac.currentTime + 0.03;
    out.gain.value = 0.7; out.connect(ac.destination);
    if (typeof duckMusic === "function") duckMusic(now, now + MAXX_SHOW);
    var nb = ac.createBuffer(1, Math.floor(ac.sampleRate * 1.5), ac.sampleRate), nd = nb.getChannelData(0);
    for (var i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
    function noise(at, len, f, q, vol, type, f2) {
      var s = ac.createBufferSource(), fl = ac.createBiquadFilter(), g = ac.createGain();
      s.buffer = nb; fl.type = type || "bandpass"; fl.frequency.setValueAtTime(f, at); fl.Q.value = q;
      if (f2) fl.frequency.exponentialRampToValueAtTime(f2, at + len);
      g.gain.setValueAtTime(0.0001, at); g.gain.exponentialRampToValueAtTime(vol, at + Math.min(0.01, len / 5));
      g.gain.exponentialRampToValueAtTime(0.0001, at + len);
      s.connect(fl); fl.connect(g); g.connect(out); s.start(at); s.stop(at + len + 0.02);
    }
    function boom(at, f, len, vol) {
      var o = ac.createOscillator(), g = ac.createGain();
      o.frequency.setValueAtTime(f, at); o.frequency.exponentialRampToValueAtTime(f * 0.35, at + len);
      g.gain.setValueAtTime(0.0001, at); g.gain.exponentialRampToValueAtTime(vol, at + 0.006); g.gain.exponentialRampToValueAtTime(0.0001, at + len);
      o.connect(g); g.connect(out); o.start(at); o.stop(at + len + 0.05);
    }
    boom(now + 0.25, 140, 0.3, 0.6); noise(now + 0.25, 0.12, 2500, 1, 0.4); // the can slams down (a metal clunk)
    noise(now + 0.7, 0.05, 3000, 2, 0.6); // the tab cracks
    noise(now + 0.72, 0.6, 5000, 0.6, 0.45, "highpass"); // PSSHT
    noise(now + 0.9, 1.2, 7000, 0.8, 0.08, "highpass"); // fizz
    boom(now + 0.35, 60, 0.8, 0.5); // bass hit with the logo
    // Riser through the flurry, with the counter ticking.
    var o = ac.createOscillator(), g = ac.createGain(), lp = ac.createBiquadFilter();
    o.type = "sawtooth"; o.frequency.setValueAtTime(110, now + 0.9); o.frequency.exponentialRampToValueAtTime(880, now + 4.2);
    lp.type = "lowpass"; lp.frequency.setValueAtTime(400, now + 0.9); lp.frequency.exponentialRampToValueAtTime(5000, now + 4.2);
    g.gain.setValueAtTime(0.0001, now + 0.9); g.gain.exponentialRampToValueAtTime(0.07, now + 3.8); g.gain.exponentialRampToValueAtTime(0.0001, now + 4.3);
    o.connect(lp); lp.connect(g); g.connect(out); o.start(now + 0.9); o.stop(now + 4.4);
    for (var tk = 0; tk < 40; tk++) {
      var at = now + 0.9 + 3.3 * Math.sqrt(tk / 40);
      noise(at, 0.03, 1800 + tk * 40, 3, 0.18);
    }
    // MAX VOLUME: a big hit.
    boom(now + 4.3, 90, 0.9, 0.75); noise(now + 4.3, 0.5, 1200, 0.5, 0.35);
    [523.25, 659.25, 783.99].forEach(function (f) { var oo = ac.createOscillator(), gg = ac.createGain(); oo.type = "square"; oo.frequency.value = f;
      gg.gain.setValueAtTime(0.0001, now + 4.3); gg.gain.exponentialRampToValueAtTime(0.04, now + 4.31); gg.gain.exponentialRampToValueAtTime(0.0001, now + 5.2);
      oo.connect(gg); gg.connect(out); oo.start(now + 4.3); oo.stop(now + 5.3); });
  } catch (e) { /* never let audio break the game */ }
}
function stopMaxxSound() {
  if (!maxxOut) return;
  try { maxxOut.disconnect(); } catch (e) { /* already gone */ }
  maxxOut = null;
}
