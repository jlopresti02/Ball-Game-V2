// Tale of the tape: an optional UFC-style intro before the start whistle.
// Tapping Start (with the Tape button On) holds the fight for TAPE_LEN
// seconds while the tale of the tape theme plays and the announcer says
// "Our tale of the tape!": both fighters slide in side by side, then their
// stats drop in one row per beat. In the stadium the jumbotron reads TALE
// OF THE TAPE, and hands over to FIRST TO KNOCKOUT WINS! (intro-msg.js) the
// moment the fight starts. Everything sits inside the reels safe zone.
// Not in gallery demos. Saved per device, Off by default.
"use strict";

var TAPE_KEY = "ballbrawl_tape_v1";
var tapeOn = false;
try { tapeOn = localStorage.getItem(TAPE_KEY) === "on"; } catch (e) {}

// The theme is about 110 bpm and its phrase is 8.7s long, so the whole intro
// is one phrase and every reveal lands on a beat (seconds from the start).
var TAPE_LEN = 8.7;
var TAPE_HIT = { card: 0.07, voice: 0.12, left: 0.72, right: 1.29, vs: 1.87, rows: [2.39, 2.93, 3.46, 3.99, 4.55, 5.09, 5.63], flash: 6.2, out: 8.05 };
var TAPE_THEME_GAIN = 1, TAPE_THEME_UNDER = 0.5; // the theme, and under the announcer
var tape = null; // { t0, voiced } while the intro is running
var tapeTheme = null; // { src, gain } the theme playing

// Real-world tape for the roster fighters (UFC listings). Anyone not here
// (the base fighters, new custom ones) shows a dash on those rows.
var TAPE_FACTS = {
  "c-alex-pereira": { from: "BRAZIL", ht: "6'4\"", reach: "79\"" },
  "c-alexander-volkanovski": { from: "AUSTRALIA", ht: "5'6\"", reach: "71.5\"" },
  "c-charles-oliveira": { from: "BRAZIL", ht: "5'10\"", reach: "74\"" },
  "c-chuck-liddell": { from: "USA", ht: "6'2\"", reach: "76.5\"" },
  "c-ciryl-gane": { from: "FRANCE", ht: "6'4\"", reach: "81\"" },
  "c-conor-mcgregor": { from: "IRELAND", ht: "5'9\"", reach: "74\"" },
  "c-demetrious-johnson": { from: "USA", ht: "5'3\"", reach: "66\"" },
  "c-dustin-poirier": { from: "USA", ht: "5'9\"", reach: "72\"" },
  "c-francis-ngannou": { from: "CAMEROON", ht: "6'4\"", reach: "83\"" },
  "c-georges-st-pierre": { from: "CANADA", ht: "5'11\"", reach: "76\"" },
  "c-ilia-topuria": { from: "SPAIN", ht: "5'7\"", reach: "69\"" },
  "c-jon-jones": { from: "USA", ht: "6'4\"", reach: "84.5\"" },
  "c-josh-hokit": { from: "USA", ht: "6'0\"", reach: "74\"" },
  "c-justin-gaethje": { from: "USA", ht: "5'11\"", reach: "70\"" },
  "c-khabib-nurmagomedov": { from: "RUSSIA", ht: "5'10\"", reach: "70\"" },
  "c-max-holloway": { from: "USA", ht: "5'11\"", reach: "69\"" },
  "c-nate-diaz": { from: "USA", ht: "6'0\"", reach: "76\"" },
  "c-sean-omalley": { from: "USA", ht: "5'11\"", reach: "72\"" },
  "c-sean-strickland": { from: "USA", ht: "6'1\"", reach: "76\"", nick: "Tarzan" },
  "c-tony-ferguson": { from: "USA", ht: "5'11\"", reach: "76.5\"" }
};

function setTapeOn(on) {
  tapeOn = !!on;
  try { localStorage.setItem(TAPE_KEY, tapeOn ? "on" : "off"); } catch (e) {}
  updateTapeButtons();
}
function updateTapeButtons() {
  Array.prototype.forEach.call(document.querySelectorAll(".tapeBtn"), function (btn) {
    btn.textContent = "Tale of the tape: " + (tapeOn ? "On" : "Off");
  });
}
Array.prototype.forEach.call(document.querySelectorAll(".tapeBtn"), function (btn) {
  btn.addEventListener("click", function () { setTapeOn(!tapeOn); });
});
updateTapeButtons();

// From startMatchSeeded(): a new match, no intro running; get the clips ready.
function resetTaleTape() {
  tape = null;
  stopTapeTheme(0);
  withClip("taleOfTheTape"); withClip("tapeTheme");
}

// From the Start button. Returns true if the intro is starting (start()
// then runs when it ends), false to start the fight straight away.
function startTaleTape() {
  if (!tapeOn || tape || started || (typeof galleryDemo !== "undefined" && galleryDemo)) return false;
  tape = { t0: performance.now(), voiced: false };
  banner.hidden = true;
  setGamePhase("fight"); // the buttons under the arena go, as for the fight
  playTapeTheme();
  return true;
}

function playTapeTheme() {
  try {
    var ac = getAudioCtx();
    if (!ac) return;
    if (ac.state === "suspended") ac.resume();
    withClip("tapeTheme", function (buf) {
      if (!tape) return;
      var now = ac.currentTime, el = (performance.now() - tape.t0) / 1000;
      var src = ac.createBufferSource(), g = ac.createGain();
      src.buffer = buf;
      // Down under the announcer, up once he's said it, out at the end
      var t0 = now - el;
      g.gain.setValueAtTime(TAPE_THEME_UNDER, now);
      g.gain.setValueAtTime(TAPE_THEME_UNDER, Math.max(now, t0 + 1.45));
      g.gain.linearRampToValueAtTime(TAPE_THEME_GAIN, Math.max(now, t0 + 1.85));
      g.gain.setValueAtTime(TAPE_THEME_GAIN, Math.max(now, t0 + TAPE_HIT.out));
      g.gain.linearRampToValueAtTime(0.0001, t0 + TAPE_LEN + 0.15);
      src.connect(g); g.connect(ac.destination);
      src.start(now, Math.max(0, el));
      src.stop(t0 + TAPE_LEN + 0.2);
      tapeTheme = { src: src, gain: g };
    });
  } catch (e) { /* never let audio break the game */ }
}
function stopTapeTheme(fade) {
  var tt = tapeTheme;
  tapeTheme = null;
  if (!tt) return;
  try {
    var now = audioCtx.currentTime;
    tt.gain.gain.cancelScheduledValues(now);
    tt.gain.gain.setTargetAtTime(0.0001, now, fade || 0.01);
    tt.src.stop(now + (fade || 0.01) * 5);
  } catch (e) { /* already stopped */ }
}

function tapeNick(ch) {
  var f = TAPE_FACTS[ch.id];
  if (f && f.nick) return f.nick;
  var m = /^"([^"]+)"/.exec(ch.bio || "");
  return m ? m[1] : "";
}
function tapeRows(a, b) {
  function fact(ch, k) { var f = TAPE_FACTS[ch.id]; return f && f[k] ? f[k] : "-"; }
  function wc(ch) { return weightClassName(ch).toUpperCase(); }
  function lb(ch) { return WEIGHT_CLASSES[weightIndex(ch)].lb + " LB"; }
  function sp(ch) { return ch.hasSpecial ? specialName(ch).toUpperCase() : "-"; }
  function style(ch) { return (ch.base || ch.name || "-").toUpperCase(); }
  return [
    ["FROM", fact(a, "from"), fact(b, "from")],
    ["DIVISION", wc(a), wc(b)],
    ["WEIGHT", lb(a), lb(b)],
    ["HEIGHT", fact(a, "ht"), fact(b, "ht")],
    ["REACH", fact(a, "reach"), fact(b, "reach")],
    ["STYLE", style(a), style(b)],
    ["SPECIAL", sp(a), sp(b)]
  ];
}

function tapeEase(x) { x = Math.max(0, Math.min(1, x)); return 1 - Math.pow(1 - x, 3); }
function tapePop(x) { // overshoots a little, then settles
  x = Math.max(0, Math.min(1, x));
  return x < 1 ? 1 + Math.sin(x * Math.PI) * 0.18 - (1 - x) * 0.6 : 1;
}
function tapeFont(txt, size, maxW, weight, fam) {
  ctx.font = weight + " " + size + "px " + fam;
  var w = ctx.measureText(txt).width;
  if (w > maxW) ctx.font = weight + " " + Math.floor(size * maxW / w) + "px " + fam;
}
var TAPE_IMPACT = "Impact, 'Arial Black', sans-serif";
var TAPE_BARLOW = "\"Barlow Condensed\", \"Arial Narrow\", sans-serif";

// From the end of draw(). Also starts the fight when the intro is over.
function drawTaleTape() {
  if (!tape) return;
  var t = (performance.now() - tape.t0) / 1000;
  if (t >= TAPE_LEN) { tape = null; tapeTheme = null; start(); return; }
  // "Our tale of the tape!" on the talk channel (tried until it plays)
  if (!tape.voiced && t >= TAPE_HIT.voice && t < 1.2 && clipBuffers.taleOfTheTape && audioCtx) {
    tape.voiced = !!cutInTalk("taleOfTheTape", 1);
  }
  var stadium = stadiumOn(), k, box;
  if (stadium) {
    k = canvas.width / STAGE_W;
    box = { x: 110, y: 540, w: 860, h: 910 }; // over the cage, clear of the reels buttons
    drawTapeJumbo(k, t);
  } else {
    k = canvas.width / 1080;
    box = { x: 40, y: 40, w: 1000, h: 1000 };
  }
  ctx.save();
  ctx.setTransform(k, 0, 0, k, 0, 0);
  drawTapeCard(box, t, !stadium);
  ctx.restore();
}

function drawTapeJumbo(k, t) {
  var jt = ST.JT, al = Math.min(1, t / 0.15) * Math.min(1, Math.max(0, (TAPE_LEN - t) / 0.4));
  ctx.save();
  ctx.setTransform(k, 0, 0, k, 0, 0);
  ctx.globalAlpha = al;
  ctx.fillStyle = "#5a0f18"; ctx.strokeStyle = "#e3cd9a"; ctx.lineWidth = 8;
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(jt.x, jt.y, jt.w, jt.h, 18); else ctx.rect(jt.x, jt.y, jt.w, jt.h);
  ctx.fill(); ctx.stroke();
  var cx = jt.x + jt.w / 2, cy = jt.y + jt.h / 2;
  // A gold sweep across the screen on the card hit and the flash hit
  [TAPE_HIT.card, TAPE_HIT.flash].forEach(function (h) {
    var p = (t - h) / 0.6;
    if (p < 0 || p > 1) return;
    var sx = jt.x - 200 + p * (jt.w + 400);
    var gr = ctx.createLinearGradient(sx - 120, 0, sx + 120, 0);
    gr.addColorStop(0, "rgba(227,205,154,0)"); gr.addColorStop(0.5, "rgba(227,205,154,0.35)"); gr.addColorStop(1, "rgba(227,205,154,0)");
    ctx.save(); ctx.beginPath(); ctx.rect(jt.x, jt.y, jt.w, jt.h); ctx.clip();
    ctx.fillStyle = gr; ctx.fillRect(sx - 120, jt.y, 240, jt.h); ctx.restore();
  });
  ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.lineJoin = "round";
  ctx.font = '800 40px ' + TAPE_BARLOW;
  ctx.fillStyle = "#e3cd9a"; ctx.fillText(WWIT.name + " " + WWIT.sub + " PRESENTS", cx, cy - 78);
  var sc = tapePop(t / 0.25);
  ctx.save(); ctx.translate(cx, cy + 22); ctx.scale(sc, sc);
  tapeFont("TALE OF THE TAPE", 112, jt.w - 80, "900", TAPE_IMPACT);
  ctx.lineWidth = 12; ctx.strokeStyle = "#16211f"; ctx.strokeText("TALE OF THE TAPE", 0, 0);
  ctx.fillStyle = "#ffffff"; ctx.fillText("TALE OF THE TAPE", 0, 0);
  ctx.restore();
  if (wwitBadge.complete && wwitBadge.naturalWidth) {
    ctx.drawImage(wwitBadge, jt.x + 26, jt.y + 22, 60, 60);
    ctx.drawImage(wwitBadge, jt.x + jt.w - 86, jt.y + 22, 60, 60);
  }
  ctx.restore();
}

function drawTapeCard(box, t, withTitle) {
  var A = balls[0].char, B = balls[1].char;
  var ca = A.color || "#c8102e", cb = B.color || "#2e64f0";
  // In with a slam, out shrinking away at the end
  var inP = (t - TAPE_HIT.card) / 0.3, outP = (t - TAPE_HIT.out) / (TAPE_LEN - TAPE_HIT.out);
  var sc = outP > 0 ? 1 - 0.25 * tapeEase(outP) : (inP < 1 ? 0.7 + 0.3 * tapePop(inP) : 1);
  var al = Math.min(1, Math.max(0, inP * 3)) * (outP > 0 ? 1 - tapeEase(outP) : 1);
  if (al <= 0) return;
  var w = box.w, h = box.h;
  ctx.globalAlpha = al;
  ctx.translate(box.x + w / 2, box.y + h / 2);
  ctx.scale(sc, sc);
  ctx.translate(-w / 2, -h / 2);

  // Panel: dark, each half washed in its fighter's colour, gold rim
  ctx.save();
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(0, 0, w, h, 24); else ctx.rect(0, 0, w, h);
  ctx.fillStyle = "#0d1016"; ctx.fill();
  ctx.clip();
  var gl = ctx.createLinearGradient(0, 0, w / 2, 0);
  gl.addColorStop(0, shadeHex(ca, -0.25)); gl.addColorStop(1, "rgba(13,16,22,0)");
  ctx.globalAlpha = al * 0.75; ctx.fillStyle = gl; ctx.fillRect(0, 0, w / 2, h);
  var gr = ctx.createLinearGradient(w, 0, w / 2, 0);
  gr.addColorStop(0, shadeHex(cb, -0.25)); gr.addColorStop(1, "rgba(13,16,22,0)");
  ctx.fillStyle = gr; ctx.fillRect(w / 2, 0, w / 2, h);
  ctx.globalAlpha = al;
  // A light sweep on the flash hit
  var fp = (t - TAPE_HIT.flash) / 0.7;
  if (fp > 0 && fp < 1) {
    var sx = -200 + fp * (w + 400);
    var sg = ctx.createLinearGradient(sx - 140, 0, sx + 140, 0);
    sg.addColorStop(0, "rgba(255,255,255,0)"); sg.addColorStop(0.5, "rgba(255,240,200,0.22)"); sg.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = sg; ctx.fillRect(sx - 140, 0, 280, h);
  }

  var top = withTitle ? 90 : 0;
  if (withTitle) { // the test arena has no jumbotron: the title goes on the card
    ctx.fillStyle = "#5a0f18"; ctx.fillRect(0, 0, w, 80);
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    tapeFont("TALE OF THE TAPE", 62, w - 60, "900", TAPE_IMPACT);
    ctx.fillStyle = "#ffffff"; ctx.fillText("TALE OF THE TAPE", w / 2, 44);
  }

  // Portraits slide in from their sides
  var pr = 108, py = top + 136, lx = 180, rx = w - 180;
  [[A, ca, lx, -1, TAPE_HIT.left], [B, cb, rx, 1, TAPE_HIT.right]].forEach(function (f) {
    var p = tapeEase((t - f[4]) / 0.3);
    if (p <= 0) return;
    var x = f[2] + f[3] * (1 - p) * 420;
    ctx.save();
    ctx.shadowColor = shadeHex(f[1], 0.35); ctx.shadowBlur = 30;
    ctx.fillStyle = f[1]; ctx.beginPath(); ctx.arc(x, py, pr, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.lineWidth = 6; ctx.strokeStyle = "#e3cd9a"; ctx.stroke();
    if (f[0].look) drawFighterArt(ctx, x, py, pr - 12, f[0].look, "#0b0f12", { layout: "contained", name: f[0].name });
    else { ctx.fillStyle = "#fff"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.font = "900 110px " + TAPE_IMPACT; ctx.fillText((f[0].name || "?").charAt(0).toUpperCase(), x, py + 4); }
    // Name and nickname under the portrait
    ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.lineJoin = "round";
    var parts = (f[0].name || "").toUpperCase().trim().split(/\s+/), last = parts.pop(), first = parts.join(" ");
    if (first) {
      tapeFont(first, 32, 340, "800", TAPE_BARLOW);
      ctx.fillStyle = "#ffffff"; ctx.fillText(first, x, py + pr + 30);
    }
    tapeFont(last, 58, 350, "900", TAPE_IMPACT);
    ctx.lineWidth = 8; ctx.strokeStyle = "#000"; ctx.strokeText(last, x, py + pr + 72);
    ctx.fillStyle = "#ffffff"; ctx.fillText(last, x, py + pr + 72);
    var nick = tapeNick(f[0]);
    if (nick) {
      tapeFont("“" + nick.toUpperCase() + "”", 34, 340, "800", TAPE_BARLOW);
      ctx.fillStyle = "#e3cd9a"; ctx.fillText("“" + nick.toUpperCase() + "”", x, py + pr + 114);
    }
    ctx.restore();
  });

  // VS slams down between them
  var vp = (t - TAPE_HIT.vs) / 0.25;
  if (vp > 0) {
    var vs = tapePop(vp) * (1 + Math.max(0, 1 - (t - TAPE_HIT.rows[6]) / 0.3) * (t > TAPE_HIT.rows[6] ? 0.12 : 0));
    ctx.save(); ctx.translate(w / 2, py); ctx.scale(vs, vs);
    ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.lineJoin = "round";
    ctx.font = "900 120px " + TAPE_IMPACT;
    ctx.lineWidth = 14; ctx.strokeStyle = "#16211f"; ctx.strokeText("VS", 0, 0);
    ctx.fillStyle = "#e3cd9a"; ctx.shadowColor = "#b8862f"; ctx.shadowBlur = 24; ctx.fillText("VS", 0, 0);
    ctx.restore();
  }

  // Stat rows, one per beat: a band opens from the middle, values pop in
  var rows = tapeRows(A, B), ry0 = top + 410, rh = Math.min(70, (h - ry0 - 20) / rows.length);
  ctx.strokeStyle = "rgba(227,205,154,0.7)"; ctx.lineWidth = 3;
  var lineP = tapeEase((t - TAPE_HIT.vs) / 0.4);
  if (lineP > 0) { ctx.beginPath(); ctx.moveTo(w / 2 - lineP * (w / 2 - 30), ry0 - 12); ctx.lineTo(w / 2 + lineP * (w / 2 - 30), ry0 - 12); ctx.stroke(); }
  rows.forEach(function (row, j) {
    var p = (t - TAPE_HIT.rows[j]) / 0.22;
    if (p <= 0) return;
    var y = ry0 + j * rh + rh / 2, bw = (w - 60) * tapeEase(p);
    ctx.fillStyle = j % 2 ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.11)";
    ctx.fillRect(w / 2 - bw / 2, y - rh / 2 + 4, bw, rh - 8);
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    // Label in the middle, on a gold tab
    ctx.fillStyle = "#e3cd9a";
    ctx.fillRect(w / 2 - 82, y - rh / 2 + 10, 164, rh - 20);
    tapeFont(row[0], 32, 150, "800", TAPE_BARLOW);
    ctx.fillStyle = "#2a0710"; ctx.fillText(row[0], w / 2, y + 1);
    var ps = tapePop(p);
    [[row[1], lx], [row[2], rx]].forEach(function (v) {
      ctx.save(); ctx.translate(v[1], y + 1); ctx.scale(ps, ps);
      tapeFont(v[0], 42, 290, "900", TAPE_IMPACT);
      ctx.lineWidth = 6; ctx.strokeStyle = "#000"; ctx.strokeText(v[0], 0, 0);
      ctx.fillStyle = "#ffffff"; ctx.fillText(v[0], 0, 0);
      ctx.restore();
    });
  });
  ctx.restore();

  // Gold rim on top
  ctx.lineWidth = 8; ctx.strokeStyle = "#e3cd9a";
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(0, 0, w, h, 24); else ctx.rect(0, 0, w, h);
  ctx.stroke();
  ctx.globalAlpha = 1;
}
