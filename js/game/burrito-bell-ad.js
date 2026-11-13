// Burrito Bell (Christian, 2026-11-13): a fast-food parody ad that runs on
// the jumbotron (a banner in the test arena) the first time Tony Ferguson's
// Kaioken burns out in a fight: he's running on empty, and here's dinner.
//   - A retro roadside sign on a sunset, a sunburst turning behind it, the
//     BURRITO BELL sign buzzing on in neon over a giant foil-wrapped burrito.
//   - Tony rises in on the left holding a burrito as big as his head.
//   - "THE BOOGEYMAN'S BURRITO", then "LIVE MÁS BURRITO." stamps in, then
//     the small print: open late, drive-thru, extra elbow room.
//   - Sound: a two-note door chime, a sizzle, a crunch and a little jingle.
// Parody name and art only: no real logo, no bell shape, and not the real
// slogan (it's "Live Más Burrito"). It goes through queueJumboAd like every
// ad, so it never overlaps another. Plus a silent still for the random
// rotation (drawBurritoBellStill): a drive-thru menu board.
"use strict";

var BB_SHOW = 6.5;
var BB = { orange: "#f26b1d", deep: "#3a1f12", cream: "#fff3d6", teal: "#138a8a", gold: "#ffc93c", red: "#c8102e" };
var bbShow = 0, bbId = 0, bbOut = null;

function resetBurritoBell() { bbShow = 0; stopBurritoBellSound(); }
function tickBurritoBell(dt) { if (bbShow > 0) bbShow = Math.max(0, bbShow - dt); }
// From tickKaioken (ferguson.js) the first time his Kaioken burns out.
function startBurritoBellAd(b) {
  if (typeof galleryDemo !== "undefined" && galleryDemo) return;
  queueJumboAd(BB_SHOW, function () { bbShow = BB_SHOW; bbId = b.id; playBurritoBellSound(); }, b);
}
function bbSans() { return "'Helvetica Neue', Helvetica, Arial, sans-serif"; }

// A burrito lying at `ang`, `len` long: a toasted tortilla, the back half in
// crinkled foil, the open end full of rice, beans, lettuce and salsa.
function drawBurrito(cx, cy, len, ang, k) {
  var w = len * 0.42;
  ctx.save();
  ctx.translate(cx, cy); ctx.rotate(ang);
  ctx.fillStyle = "rgba(0,0,0,0.22)"; ctx.beginPath(); ctx.ellipse(len * 0.04, w * 0.62, len * 0.5, w * 0.16, 0, 0, Math.PI * 2); ctx.fill();
  // the tortilla
  stillRoundRect(-len / 2, -w / 2, len, w, w / 2);
  var tg = ctx.createLinearGradient(0, -w / 2, 0, w / 2);
  tg.addColorStop(0, "#f7dfa8"); tg.addColorStop(0.6, "#eac17a"); tg.addColorStop(1, "#c99a52");
  ctx.fillStyle = tg; ctx.fill();
  ctx.strokeStyle = "#7a4d1e"; ctx.lineWidth = 2 * k; ctx.stroke();
  ctx.save(); stillRoundRect(-len / 2, -w / 2, len, w, w / 2); ctx.clip();
  ctx.fillStyle = "rgba(140,80,20,0.35)"; // toasted spots
  for (var i = 0; i < 9; i++) { ctx.beginPath(); ctx.ellipse(-len * 0.1 + ((i * 37) % 11) / 11 * len * 0.5, -w * 0.3 + ((i * 53) % 7) / 7 * w * 0.6, 3 * k, 2 * k, i, 0, Math.PI * 2); ctx.fill(); }
  // the foil on the back half
  var fg = ctx.createLinearGradient(0, -w / 2, 0, w / 2);
  fg.addColorStop(0, "#f4f6f8"); fg.addColorStop(0.35, "#aeb6bd"); fg.addColorStop(0.6, "#e9edf0"); fg.addColorStop(1, "#8d969e");
  ctx.fillStyle = fg;
  ctx.beginPath(); ctx.moveTo(-len / 2 - 2, -w / 2 - 2); ctx.lineTo(-len * 0.05, -w / 2 - 2);
  for (var z = 0; z <= 6; z++) ctx.lineTo(-len * 0.05 + (z % 2 ? 4 : -3) * k, -w / 2 + w * z / 6);
  ctx.lineTo(-len / 2 - 2, w / 2 + 2); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = "rgba(90,100,110,0.5)"; ctx.lineWidth = 1 * k;
  for (var c = 0; c < 5; c++) { ctx.beginPath(); ctx.moveTo(-len * 0.45 + c * len * 0.08, -w * 0.45); ctx.lineTo(-len * 0.42 + c * len * 0.08, w * 0.4); ctx.stroke(); }
  ctx.restore();
  // the open end, full of filling
  var ex = len / 2 - w * 0.36;
  ctx.fillStyle = "#e8c98d"; ctx.beginPath(); ctx.ellipse(ex, 0, w * 0.28, w * 0.44, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = "#7a4d1e"; ctx.lineWidth = 1.5 * k; ctx.stroke();
  ctx.save(); ctx.beginPath(); ctx.ellipse(ex, 0, w * 0.22, w * 0.36, 0, 0, Math.PI * 2); ctx.clip();
  ctx.fillStyle = "#5a2d14"; ctx.fillRect(ex - w * 0.3, -w * 0.4, w * 0.6, w * 0.8);
  [["#fbf7ec", 6], ["#7cc142", 4], ["#e8432a", 4], ["#3b1c0d", 4]].forEach(function (f, j) {
    ctx.fillStyle = f[0];
    for (var q = 0; q < f[1]; q++) { ctx.beginPath(); ctx.arc(ex - w * 0.16 + ((q * 7 + j * 3) % 9) / 9 * w * 0.32, -w * 0.28 + ((q * 5 + j * 11) % 9) / 9 * w * 0.56, (2.2 + (q % 2)) * k, 0, Math.PI * 2); ctx.fill(); }
  });
  ctx.restore();
  ctx.restore();
}

// The BURRITO BELL sign: a cream panel with an orange border, the name in
// chunky lettering over a little burrito. `on` 0..1 is the neon buzzing on.
function drawBurritoBellSign(cx, cy, w, h, k, on, t) {
  ctx.save();
  var flick = on >= 1 ? 1 : (Math.sin(t * 60) > 0 ? on : on * 0.3);
  ctx.fillStyle = BB.deep; stillRoundRect(cx - w / 2 - 6 * k, cy - h / 2 - 6 * k, w + 12 * k, h + 12 * k, 14 * k); ctx.fill();
  ctx.fillStyle = BB.cream; stillRoundRect(cx - w / 2, cy - h / 2, w, h, 10 * k); ctx.fill();
  ctx.strokeStyle = BB.orange; ctx.lineWidth = 5 * k; stillRoundRect(cx - w / 2 + 5 * k, cy - h / 2 + 5 * k, w - 10 * k, h - 10 * k, 8 * k); ctx.stroke();
  // light bulbs round the edge, chasing
  for (var i = 0; i < 14; i++) {
    var u = i / 14, bx = cx - w / 2 + 10 * k + u * (w - 20 * k), lit = Math.floor(t * 8 + i) % 3 === 0;
    [cy - h / 2 + 2 * k, cy + h / 2 - 2 * k].forEach(function (by) {
      ctx.fillStyle = lit && on > 0.5 ? "#fff6b0" : "#9a7a4a";
      ctx.beginPath(); ctx.arc(bx, by, 2.6 * k, 0, Math.PI * 2); ctx.fill();
    });
  }
  ctx.save(); ctx.globalAlpha = 0.35 + 0.65 * flick;
  stillText("BURRITO", cx, cy - h * 0.18, h * 0.3, BB.orange, w * 0.84, { weight: "900", stroke: BB.deep, strokeW: 0.14, glow: flick > 0.8 ? "#ff9b4a" : null });
  stillText("BELL", cx, cy + h * 0.17, h * 0.3, BB.teal, w * 0.6, { weight: "900", stroke: BB.deep, strokeW: 0.14, glow: flick > 0.8 ? "#5fe0e0" : null });
  ctx.restore();
  drawBurrito(cx + w * 0.34, cy + h * 0.3, h * 0.42, -0.25, k * 0.6);
  ctx.restore();
}

function drawBurritoBellJumbo(x, y, w, h) {
  if (bbShow <= 0 || !balls || !balls[bbId]) return;
  var b = balls[bbId], chr = b.baseChar || b.char;
  var t = BB_SHOW - bbShow, a = Math.min(1, t / 0.3, bbShow / 0.4), k = h / 250, sans = bbSans();
  ctx.save();
  ctx.globalAlpha = a;
  ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
  // Sunset, with a sunburst turning slowly behind everything.
  var bg = ctx.createLinearGradient(0, y, 0, y + h);
  bg.addColorStop(0, "#ffb347"); bg.addColorStop(0.55, BB.orange); bg.addColorStop(1, "#8a2a12");
  ctx.fillStyle = bg; ctx.fillRect(x, y, w, h);
  ctx.save(); ctx.translate(x + w * 0.46, y + h * 0.62); ctx.rotate(t * 0.2);
  ctx.fillStyle = "rgba(255,240,200,0.16)";
  for (var r = 0; r < 16; r++) { ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, w, r * Math.PI / 8, r * Math.PI / 8 + Math.PI / 16); ctx.closePath(); ctx.fill(); }
  ctx.restore();
  ctx.fillStyle = "rgba(58,31,18,0.85)"; ctx.fillRect(x, y + h * 0.86, w, h * 0.14); // the road
  ctx.fillStyle = BB.gold;
  for (var d = 0; d < 8; d++) ctx.fillRect(x + ((d * w / 7 - t * 120 * k) % (w + 40 * k)) - 20 * k, y + h * 0.92, 26 * k, 4 * k);

  // Tony rises in on the left with a burrito as big as his head.
  var tr = easeOut(Math.min(1, t / 0.6)), tx = x + w * 0.12, ty = y + h * 0.56 + (1 - tr) * h * 0.6, rr = h * 0.27;
  stillFighter(tx, ty, rr, chr.look, chr.name);
  var munch = t > 1.6 && t < 2.6 ? Math.abs(Math.sin((t - 1.6) * 9)) * rr * 0.06 : 0;
  drawBurrito(tx + rr * 0.95, ty + rr * 0.2 - munch, rr * 1.15, -0.55, k);
  drawGlove(ctx, tx + rr * 0.72, ty + rr * 0.48 - munch, rr * 0.24, chr.look, "#0b0f12", -0.6);
  if (t > 1.6 && t < 3.0) { // crunch!
    var cr = (t - 1.6) / 1.4;
    ctx.save(); ctx.globalAlpha *= 1 - cr; ctx.translate(tx + rr * 1.3, ty - rr * 0.6 - cr * 10 * k); ctx.rotate(-0.15);
    stillText("CRUNCH!", 0, 0, 22 * k, "#ffffff", 120 * k, { weight: "900", stroke: BB.deep, strokeW: 0.22 });
    ctx.restore();
  }

  // The sign in the middle, buzzing on.
  var on = Math.min(1, Math.max(0, (t - 0.35) / 0.5));
  if (t > 0.3) drawBurritoBellSign(x + w * 0.46, y + h * 0.42, w * 0.3, h * 0.56, k, on, t);

  // The copy on the right.
  var cx = x + w * 0.8, cw = w * 0.36;
  var c1 = Math.min(1, Math.max(0, (t - 0.9) / 0.35));
  ctx.save(); ctx.globalAlpha *= c1;
  stillText("THE BOOGEYMAN'S BURRITO", cx, y + h * 0.17, 20 * k, BB.cream, cw, { weight: "900", stroke: BB.deep, strokeW: 0.18 });
  stillText("Fuel for El Cucuy, after the Kaioken.", cx, y + h * 0.29, 13 * k, "#ffe8c4", cw, { face: sans, weight: "700" });
  ctx.restore();
  var c2 = Math.min(1, Math.max(0, (t - 2.4) / 0.25));
  if (c2 > 0) {
    ctx.save(); ctx.globalAlpha *= c2;
    var pop = 1 + 0.6 * (1 - easeOut(c2));
    ctx.translate(cx, y + h * 0.52); ctx.rotate(-0.06); ctx.scale(pop, pop);
    stillText("LIVE MÁS BURRITO.", 0, 0, 34 * k, BB.gold, cw, { face: "Georgia, 'Times New Roman', serif", weight: "italic 900", stroke: BB.deep, strokeW: 0.16 });
    ctx.restore();
  }
  var c3 = Math.min(1, Math.max(0, (t - 3.9) / 0.4));
  if (c3 > 0) {
    ctx.save(); ctx.globalAlpha *= c3;
    ctx.fillStyle = "rgba(255,243,214,0.92)"; stillRoundRect(cx - cw * 0.46, y + h * 0.68, cw * 0.92, h * 0.15, 8 * k); ctx.fill();
    stillText("OPEN LATE • DRIVE-THRU • EXTRA ELBOW ROOM", cx, y + h * 0.755, 12 * k, BB.deep, cw * 0.86, { face: sans, weight: "900" });
    ctx.restore();
  }
  ctx.strokeStyle = BB.cream; ctx.lineWidth = 3 * k; stillRoundRect(x + 4 * k, y + 4 * k, w - 8 * k, h - 8 * k, 12 * k); ctx.stroke();
  ctx.restore();
}
function drawBurritoBellBanner() {
  if (bbShow <= 0 || stadiumOn()) return;
  drawBurritoBellJumbo(10, 10, W - 20, 110);
}

// ---------------------------------------------------------------- still version
// The silent still (in the still-ad rotation, still-ads.js): a drive-thru
// menu board, Tony on the right.
var BB_MENU = [["EL CUCUY BURRITO", "6.66"], ["D'ARCE-DILLA", "4.49"], ["WON'T-TAP TACO", "2.49"], ["NINJA TURTLE GUAC", "1.99"], ["KAIOKEN SAUCE x3", "0.99"]];
function drawBurritoBellStill(x, y, w, h, k, ch) {
  var sans = bbSans();
  var bg = ctx.createLinearGradient(0, y, 0, y + h);
  bg.addColorStop(0, "#4a2817"); bg.addColorStop(1, "#24120a");
  ctx.fillStyle = bg; ctx.fillRect(x, y, w, h);
  // the board's header strip and its sign
  ctx.fillStyle = BB.orange; ctx.fillRect(x, y, w, h * 0.2);
  ctx.fillStyle = BB.gold; ctx.fillRect(x, y + h * 0.2, w, h * 0.02);
  stillText("BURRITO BELL", x + w * 0.36, y + h * 0.1, 30 * k, BB.cream, w * 0.5, { weight: "900", stroke: BB.deep, strokeW: 0.14 });
  stillText("DRIVE-THRU MENU", x + w * 0.36, y + h * 0.28, 12 * k, BB.gold, w * 0.4, { face: sans, weight: "900" });
  // the menu
  BB_MENU.forEach(function (it, i) {
    var yy = y + h * (0.38 + i * 0.1);
    stillText(it[0], x + w * 0.06, yy, 15 * k, BB.cream, w * 0.42, { face: sans, weight: "900", align: "left" });
    ctx.strokeStyle = "rgba(255,243,214,0.25)"; ctx.setLineDash([2 * k, 4 * k]); ctx.lineWidth = 1.5 * k;
    ctx.beginPath(); ctx.moveTo(x + w * 0.44, yy + 2 * k); ctx.lineTo(x + w * 0.56, yy + 2 * k); ctx.stroke(); ctx.setLineDash([]);
    stillText(it[1], x + w * 0.62, yy, 15 * k, BB.gold, w * 0.1, { face: sans, weight: "900" });
  });
  drawBurrito(x + w * 0.62, y + h * 0.1, h * 0.26, -0.15, k * 0.7);
  stillText("LIVE MÁS BURRITO.", x + w * 0.36, y + h * 0.9, 20 * k, BB.gold, w * 0.6, { face: "Georgia, 'Times New Roman', serif", weight: "italic 900" });
  // Tony on the right with his burrito
  var jx = x + w * 0.86, jr = h * 0.3;
  stillFighter(jx, y + h * 0.58, jr, ch.look, ch.name);
  drawBurrito(jx - jr * 0.85, y + h * 0.58 + jr * 0.25, jr * 1.0, 0.5, k * 0.9);
  ctx.strokeStyle = BB.orange; ctx.lineWidth = 3 * k; stillRoundRect(x + 5 * k, y + 5 * k, w - 10 * k, h - 10 * k, 12 * k); ctx.stroke();
}

// Synth sound: a two-note door chime, a sizzle as the sign buzzes on, a
// crunch, and a little four-note jingle on "LIVE MÁS BURRITO."
function playBurritoBellSound() {
  try {
    var ac = getAudioCtx();
    if (!ac) return;
    if (ac.state === "suspended") ac.resume();
    stopBurritoBellSound();
    var out = bbOut = ac.createGain(), now = ac.currentTime + 0.03;
    out.gain.value = 0.7; out.connect(ac.destination);
    if (typeof duckMusic === "function") duckMusic(now, now + BB_SHOW);
    function tone(at, f, len, vol, type) {
      var o = ac.createOscillator(), g = ac.createGain();
      o.type = type || "sine"; o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, at); g.gain.exponentialRampToValueAtTime(vol, at + 0.008); g.gain.exponentialRampToValueAtTime(0.0001, at + len);
      o.connect(g); g.connect(out); o.start(at); o.stop(at + len + 0.02);
    }
    var nb = ac.createBuffer(1, Math.floor(ac.sampleRate * 1.2), ac.sampleRate), nd = nb.getChannelData(0);
    for (var i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
    function noise(at, len, f, q, vol, type) {
      var s = ac.createBufferSource(), fl = ac.createBiquadFilter(), g = ac.createGain();
      s.buffer = nb; fl.type = type || "bandpass"; fl.frequency.value = f; fl.Q.value = q;
      g.gain.setValueAtTime(0.0001, at); g.gain.exponentialRampToValueAtTime(vol, at + Math.min(0.03, len / 4));
      g.gain.setValueAtTime(vol, at + len * 0.6); g.gain.exponentialRampToValueAtTime(0.0001, at + len);
      s.connect(fl); fl.connect(g); g.connect(out); s.start(at); s.stop(at + len + 0.02);
    }
    tone(now + 0.05, 1318, 0.9, 0.18); tone(now + 0.32, 1046, 1.1, 0.18); // ding-dong
    noise(now + 0.35, 0.6, 5000, 0.6, 0.12, "highpass");                // the sign sizzling on
    [0, 0.12, 0.26, 0.4].forEach(function (d) { noise(now + 1.62 + d, 0.06, 2200, 1.5, 0.5); }); // crunch, crunch
    [[523, 0], [659, 0.14], [784, 0.28], [1046, 0.46]].forEach(function (n) { tone(now + 2.42 + n[1], n[0], 0.3, 0.12, "square"); });
    tone(now + 2.9, 1046, 0.7, 0.1, "triangle");
  } catch (e) { /* never let audio break the game */ }
}
function stopBurritoBellSound() {
  if (!bbOut) return;
  try { bbOut.disconnect(); } catch (e) { /* already gone */ }
  bbOut = null;
}
