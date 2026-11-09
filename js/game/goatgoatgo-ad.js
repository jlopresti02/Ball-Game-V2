// GoatGoatGo (Joe, 2026-11-09): a DuckDuckGo parody search engine ad that
// runs on the jumbotron (a banner in the test arena) the first time Jon
// Jones does his Duck Drop or his GOAT Stampede in a fight, and never again
// that fight, whichever comes first.
//   - Joe's goat logo and the GoatGoatGo wordmark on the left.
//   - Someone types "Who's the GOAT?" into the search bar and hits search.
//   - About 1 result: Jon "Bones" Jones, with his ball, at goat.gov.
//   - "Search no further." Sound: key clicks, a whoosh, a ding and a chime.
// It goes through queueJumboAd like every ad, so it never overlaps another
// one; Jon's own move doesn't hold it up (igbb.adOwn), so it plays while the
// move is happening.
"use strict";

var GGG_SHOW = 7.0;
var GGG_QUERY = "Who's the GOAT?";
var GGG_TYPE0 = 0.7, GGG_KEY = 0.11, GGG_SEARCH = GGG_TYPE0 + GGG_QUERY.length * GGG_KEY + 0.25, GGG_RESULTS = GGG_SEARCH + 0.3;
var gggShow = 0, gggId = 0, gggDone = false, gggOut = null;
var gggLogoImg = new Image();
gggLogoImg.src = GGG_LOGO_SRC;

// From startMatchWith (through resetAdBreaks).
function resetGoatGoatGo() { gggShow = 0; gggDone = false; stopGoatGoatGoSound(); }
// From jon-duck.js and jon.js as the Duck Drop or GOAT Stampede starts.
function goatGoatGoOnMove(b) {
  if (gggDone || (typeof galleryDemo !== "undefined" && galleryDemo)) return;
  gggDone = true;
  if (b.igbb) b.igbb.adOwn = true;
  queueJumboAd(GGG_SHOW, function () {
    gggShow = GGG_SHOW; gggId = b.id;
    playGoatGoatGoSound();
  }, b);
}
// Every frame, from tickAdBreaks (ad-breaks.js).
function tickGoatGoatGo(dt) { if (gggShow > 0) gggShow = Math.max(0, gggShow - dt); }

function drawGoatGoatGoJumbo(x, y, w, h) {
  if (gggShow <= 0 || !balls || !balls[gggId]) return;
  var b = balls[gggId], jon = b.char.jon, look = (jon && jon.goatLook) || b.char.look;
  var t = GGG_SHOW - gggShow, a = Math.min(1, t / 0.3, gggShow / 0.4), k = h / 250;
  var sans = "'Helvetica Neue', Helvetica, Arial, sans-serif";
  ctx.save();
  ctx.globalAlpha = a;
  ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();

  // A clean white search page.
  ctx.fillStyle = "#ffffff"; ctx.fillRect(x, y, w, h);
  ctx.fillStyle = "#f4f4f6"; ctx.fillRect(x, y, w * 0.28, h);
  ctx.fillStyle = "#de5833"; ctx.fillRect(x, y, w, 5 * k);

  // The logo pops in, with the wordmark under it.
  var lp = Math.min(1, t / 0.45), pop = lp < 1 ? 0.6 + 0.4 * easeOut(lp) + Math.sin(lp * Math.PI) * 0.12 : 1;
  var lx = x + w * 0.14, ly = y + h * 0.4, lr = h * 0.29 * pop;
  if (gggLogoImg.complete && gggLogoImg.naturalWidth) {
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.18)"; ctx.shadowBlur = 10 * k; ctx.shadowOffsetY = 3 * k;
    ctx.drawImage(gggLogoImg, lx - lr, ly - lr, lr * 2, lr * 2);
    ctx.restore();
  }
  stillText("GoatGoatGo", lx, y + h * 0.83, 36 * k, "#333333", w * 0.24, { face: sans, weight: "500" });
  if (t > GGG_RESULTS + 1.8) {
    var tp = Math.min(1, (t - GGG_RESULTS - 1.8) / 0.4);
    ctx.save(); ctx.globalAlpha *= tp;
    stillText("Search no further.", lx, y + h * 0.94, 15 * k, "#de5833", w * 0.24, { face: sans, weight: "italic 700" });
    ctx.restore();
  }

  // The search bar, the query typing out, and the search button.
  var px = x + w * 0.31, pw = w * 0.65, sy = y + h * 0.1, sh = h * 0.2;
  ctx.fillStyle = "#ffffff"; ctx.strokeStyle = t > GGG_TYPE0 - 0.2 && t < GGG_SEARCH ? "#de5833" : "#c9c9cf"; ctx.lineWidth = 2.5 * k;
  stillRoundRect(px, sy, pw, sh, sh / 2); ctx.fill(); ctx.stroke();
  var n = Math.max(0, Math.min(GGG_QUERY.length, Math.floor((t - GGG_TYPE0) / GGG_KEY) + 1));
  if (t < GGG_TYPE0) n = 0;
  var typed = GGG_QUERY.slice(0, n), fs = 26 * k;
  ctx.font = "600 " + fs + "px " + sans;
  var tx = px + sh * 0.55, tw = ctx.measureText(typed).width;
  stillText(typed || (t < GGG_TYPE0 ? "Search the web without being tracked" : ""), tx, sy + sh / 2, typed ? fs : 18 * k, typed ? "#222222" : "#9a9aa2", pw * 0.8, { face: sans, weight: "600", align: "left" });
  if (t < GGG_SEARCH && Math.floor(t * 2.5) % 2 === 0) { ctx.fillStyle = "#222222"; ctx.fillRect(tx + tw + 2 * k, sy + sh * 0.25, 2 * k, sh * 0.5); }
  // The button, pressed when the search goes.
  var press = t > GGG_SEARCH && t < GGG_SEARCH + 0.18, bw = sh * 1.5, bx = px + pw - bw - sh * 0.12;
  ctx.fillStyle = press ? "#b8411f" : "#de5833";
  stillRoundRect(bx, sy + sh * 0.12, bw, sh * 0.76, sh * 0.38); ctx.fill();
  var gx = bx + bw / 2 - 2 * k, gy = sy + sh / 2 - 2 * k, gr = sh * 0.17; // magnifying glass
  ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 3 * k; ctx.lineCap = "round";
  ctx.beginPath(); ctx.arc(gx, gy, gr, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(gx + gr * 0.7, gy + gr * 0.7); ctx.lineTo(gx + gr * 1.6, gy + gr * 1.6); ctx.stroke();

  // The results.
  if (t > GGG_RESULTS) {
    var rp = Math.min(1, (t - GGG_RESULTS) / 0.35), slide = (1 - easeOut(rp)) * 18 * k;
    ctx.save(); ctx.globalAlpha *= rp; ctx.translate(0, slide);
    stillText("About 1 result (0.00 seconds). There's only one.", px + sh * 0.3, y + h * 0.39, 14 * k, "#777780", pw, { face: sans, weight: "500", align: "left" });
    // Top result: Jon, with his ball.
    var cy = y + h * 0.66, cr = h * 0.17, cx = px + sh * 0.3 + cr;
    ctx.fillStyle = "#fff7e0"; ctx.strokeStyle = "#f0d58a"; ctx.lineWidth = 1.5 * k;
    stillRoundRect(px, y + h * 0.45, pw, h * 0.43, 12 * k); ctx.fill(); ctx.stroke();
    stillFighter(cx, cy, cr, look, b.char.name);
    var rx = cx + cr + 16 * k, rw = px + pw - rx - 12 * k;
    stillText("goat.gov › greatest-of-all-time", rx, y + h * 0.53, 13 * k, "#2e7d32", rw, { face: sans, weight: "500", align: "left" });
    stillText("Jon “Bones” Jones", rx, y + h * 0.64, 30 * k, "#1a4fd6", rw, { face: sans, weight: "700", align: "left" });
    stillText("The Greatest Of All Time. Light heavyweight and heavyweight champ.", rx, y + h * 0.75, 13 * k, "#444450", rw, { face: sans, weight: "400", align: "left" });
    stillText("Accept no substitutes. (Ducks not included.)", rx, y + h * 0.83, 13 * k, "#444450", rw, { face: sans, weight: "italic 400", align: "left" });
    // A gold crown badge on the card.
    var bt = Math.min(1, Math.max(0, (t - GGG_RESULTS - 0.6) / 0.3));
    if (bt > 0) {
      ctx.save();
      ctx.translate(px + pw - 40 * k, y + h * 0.53); ctx.scale(0.6 + 0.4 * easeOut(bt), 0.6 + 0.4 * easeOut(bt)); ctx.rotate(0.15);
      ctx.fillStyle = "#e3b52a"; ctx.strokeStyle = "#7a5a00"; ctx.lineWidth = 1.5 * k;
      stillRoundRect(-30 * k, -11 * k, 60 * k, 22 * k, 11 * k); ctx.fill(); ctx.stroke();
      stillText("#1 GOAT", 0, 1 * k, 12 * k, "#3d2c00", 54 * k, { face: sans, weight: "900" });
      ctx.restore();
    }
    ctx.restore();
  }
  ctx.strokeStyle = "rgba(0,0,0,0.12)"; ctx.lineWidth = 2 * k; ctx.strokeRect(x + 1, y + 1, w - 2, h - 2);
  ctx.restore();
}
function drawGoatGoatGoBanner() {
  if (gggShow <= 0 || stadiumOn()) return;
  drawGoatGoatGoJumbo(10, 10, W - 20, 110);
}

// ---------------------------------------------------------------- still version
// The silent still (in the still-ad rotation, still-ads.js): a bold orange
// poster. The logo, the search for "Who's the GOAT?", the one answer, and
// Jon himself (GOAT tattoo) with his duck: THE GOAT OF SEARCH ENGINES.
function drawGoatGoatGoStill(x, y, w, h, k, ch) {
  var sans = "'Helvetica Neue', Helvetica, Arial, sans-serif";
  var look = (ch.jon && ch.jon.goatLook) || ch.look;
  var bg = ctx.createLinearGradient(x, y, x, y + h);
  bg.addColorStop(0, "#e8653f"); bg.addColorStop(1, "#c9461f");
  ctx.fillStyle = bg; ctx.fillRect(x, y, w, h);
  // Big soft rings behind the logo, like ripples from a search.
  ctx.strokeStyle = "rgba(255,255,255,0.09)"; ctx.lineWidth = 14 * k;
  for (var i = 1; i <= 4; i++) { ctx.beginPath(); ctx.arc(x + w * 0.13, y + h * 0.5, h * 0.3 + i * 34 * k, 0, Math.PI * 2); ctx.stroke(); }
  // The logo on a white disc.
  var lx = x + w * 0.13, ly = y + h * 0.5, lr = h * 0.36;
  ctx.fillStyle = "#ffffff"; ctx.beginPath(); ctx.arc(lx, ly, lr + 5 * k, 0, Math.PI * 2); ctx.fill();
  if (gggLogoImg.complete && gggLogoImg.naturalWidth) ctx.drawImage(gggLogoImg, lx - lr, ly - lr, lr * 2, lr * 2);
  // The copy in the middle.
  var cx = x + w * 0.5, cw = w * 0.4;
  stillText("GoatGoatGo", cx, y + h * 0.16, 30 * k, "#ffffff", cw, { face: sans, weight: "600" });
  var sw = cw, sh = h * 0.2, sx = cx - sw / 2, sy = y + h * 0.27;
  ctx.fillStyle = "#ffffff"; stillRoundRect(sx, sy, sw, sh, sh / 2); ctx.fill();
  stillText("Who's the GOAT?", sx + sh * 0.5, sy + sh / 2, 24 * k, "#222222", sw * 0.7, { face: sans, weight: "600", align: "left" });
  ctx.fillStyle = "#de5833"; ctx.beginPath(); ctx.arc(sx + sw - sh / 2, sy + sh / 2, sh * 0.38, 0, Math.PI * 2); ctx.fill();
  var gx = sx + sw - sh / 2 - 2 * k, gy = sy + sh / 2 - 2 * k, gr = sh * 0.15;
  ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 3 * k; ctx.lineCap = "round";
  ctx.beginPath(); ctx.arc(gx, gy, gr, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(gx + gr * 0.7, gy + gr * 0.7); ctx.lineTo(gx + gr * 1.6, gy + gr * 1.6); ctx.stroke();
  stillText("1 result:", cx, y + h * 0.6, 16 * k, "rgba(255,255,255,0.85)", cw, { face: sans, weight: "600" });
  stillText("JON “BONES” JONES", cx, y + h * 0.73, 34 * k, "#ffffff", cw, { stroke: "rgba(90,20,0,0.35)", strokeW: 0.12 });
  stillText("THE GOAT OF SEARCH ENGINES.", cx, y + h * 0.88, 15 * k, "#ffe3a1", cw, { face: sans, weight: "800" });
  // Jon, with his duck tucked in beside him.
  var jx = x + w * 0.84, jy = y + h * 0.56, jr = h * 0.3;
  stillFighter(jx, jy, jr, look, ch.name);
  if (typeof drawDuckImg === "function" && typeof JON_DUCK_STAND_SRC !== "undefined") drawDuckImg(JON_DUCK_STAND_SRC, JON_DUCK_STAND_ASPECT, jx + jr * 1.15, jy + jr * 0.45, jr * 1.0, true);
  // A gold #1 ribbon.
  ctx.save(); ctx.translate(jx - jr * 1.0, jy - jr * 0.9); ctx.rotate(-0.2);
  ctx.fillStyle = "#e3b52a"; ctx.strokeStyle = "#7a5a00"; ctx.lineWidth = 1.5 * k;
  stillRoundRect(-28 * k, -11 * k, 56 * k, 22 * k, 11 * k); ctx.fill(); ctx.stroke();
  stillText("#1 GOAT", 0, 1 * k, 12 * k, "#3d2c00", 50 * k, { face: sans, weight: "900" });
  ctx.restore();
  ctx.strokeStyle = "rgba(255,255,255,0.85)"; ctx.lineWidth = 3 * k; stillRoundRect(x + 5 * k, y + 5 * k, w - 10 * k, h - 10 * k, 12 * k); ctx.stroke();
}

// Synth sound: a key click for every letter, a whoosh on search, a ding when
// the result comes up and a bright little chime for "Search no further."
function playGoatGoatGoSound() {
  try {
    var ac = getAudioCtx();
    if (!ac) return;
    if (ac.state === "suspended") ac.resume();
    stopGoatGoatGoSound();
    var out = gggOut = ac.createGain(), now = ac.currentTime + 0.03;
    out.gain.value = 0.7; out.connect(ac.destination);
    if (typeof duckMusic === "function") duckMusic(now, now + GGG_SHOW);
    var nb = ac.createBuffer(1, Math.floor(ac.sampleRate * 0.6), ac.sampleRate), nd = nb.getChannelData(0);
    for (var i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
    function noise(at, len, f, q, vol, type, f2) {
      var s = ac.createBufferSource(), bp = ac.createBiquadFilter(), g = ac.createGain();
      s.buffer = nb; bp.type = type || "bandpass"; bp.frequency.setValueAtTime(f, at); bp.Q.value = q;
      if (f2) bp.frequency.exponentialRampToValueAtTime(f2, at + len);
      g.gain.setValueAtTime(0.0001, at); g.gain.exponentialRampToValueAtTime(vol, at + Math.min(0.01, len / 3));
      g.gain.exponentialRampToValueAtTime(0.0001, at + len);
      s.connect(bp); bp.connect(g); g.connect(out); s.start(at); s.stop(at + len + 0.02);
    }
    function tone(f, at, len, vol, type) {
      var o = ac.createOscillator(), g = ac.createGain();
      o.type = type || "sine"; o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, at); g.gain.exponentialRampToValueAtTime(vol, at + 0.008);
      g.gain.exponentialRampToValueAtTime(0.0001, at + len);
      o.connect(g); g.connect(out); o.start(at); o.stop(at + len + 0.05);
    }
    for (var c = 0; c < GGG_QUERY.length; c++) {
      var at = now + GGG_TYPE0 + c * GGG_KEY + (Math.random() - 0.5) * 0.02;
      noise(at, 0.04, 2600 + Math.random() * 1400, 3, GGG_QUERY[c] === " " ? 0.35 : 0.5);
      tone(180 + Math.random() * 40, at, 0.03, 0.12, "triangle");
    }
    noise(now + GGG_SEARCH - 0.02, 0.05, 1800, 2, 0.6); // the enter key
    noise(now + GGG_SEARCH, 0.32, 600, 1.2, 0.35, "bandpass", 5000); // whoosh
    [[1568, 0], [2093, 0.09]].forEach(function (d) { tone(d[0], now + GGG_RESULTS + d[1], 0.8, 0.22); tone(d[0] * 2, now + GGG_RESULTS + d[1], 0.4, 0.05); }); // ding
    [[1047, 0], [1319, 0.12], [1568, 0.24], [2093, 0.36]].forEach(function (d) { tone(d[0], now + GGG_RESULTS + 1.8 + d[1], 0.9, 0.12); });
  } catch (e) { /* never let audio break the game */ }
}
function stopGoatGoatGoSound() {
  if (!gggOut) return;
  try { gggOut.disconnect(); } catch (e) { /* already gone */ }
  gggOut = null;
}
