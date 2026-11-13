// Voice lines as speech bubbles (Christian, 2026-11-12; bigger and clearer
// 2026-11-13), for fighters whose famous lines don't have a recorded clip yet.
//
// say(b, text)   a bubble under fighter b (over him when he's near the bottom),
//                with his name on a tab in his colour: it pops in, the words
//                come in one at a time, it holds long enough to read, then
//                fades. One bubble per fighter; a new line replaces the old
//                one. Long lines wrap. Under the fighter keeps it clear of the
//                health bar and the hit numbers, which float upward; it's
//                drawn under the hit numbers and move names so those always show.
// [BLEEP]        anywhere in the text it's drawn as a black censor bar with
//                BLEEP in it, and a bleep tone plays when that word comes in.
// Clips          when a recorded clip exists for a line, it plays with the
//                bubble: pass { clip: "name" } to say(), or add the line to
//                SPEECH_CLIPS (exact text -> SOUND_CLIPS name) so no fighter
//                code changes. A line with a clip doesn't bleep (the clip has
//                its own).
// canSay(b)      false while a bubble is up or for `SPEECH_GAP` seconds after,
//                so a talker doesn't bury the fight in text.
// pickLine(b, lines, key)  a random line from `lines`, never the same one
//                twice in a row for that key.
// announce(text, { who })  the commentator's call, as a TV lower-third
//                across the bottom of the cage with his name on a gold tab
//                (who: "ROGAN", "ANIK", "DC", "BUFFER"...). For a fighter's
//                famous finish, call it the moment he lands that exact move.
//                One at a time; it keeps going through a knockout. Takes
//                { clip } like say().
"use strict";

var SPEECH_WORD = 0.11;  // seconds per word as the line comes in
var SPEECH_READ = 1.6;   // holding once it's all in, plus a bit per word
var SPEECH_FADE = 0.25;
var SPEECH_POP = 0.14;   // the pop-in
var SPEECH_GAP = 2.5;    // quiet time after a bubble before canSay
var SPEECH_MAX_W = 290;  // wrap width
var SPEECH_SIZE = 23;
var SPEECH_FONT = "800 " + SPEECH_SIZE + "px \"Barlow Condensed\", \"Arial Narrow\", sans-serif";
var SPEECH_LINE_H = 27;
var SPEECH_CLIPS = {};   // "exact line text": "soundClipName"
var speech = [];         // by fighter id: { words, t, dur, said, quietT, clip }

var announcer = null;     // { words, t, dur, who, clip }

function resetSpeech() { speech = []; announcer = null; }

function speechOf(b) { return speech[b.id] || (speech[b.id] = { words: null, t: 0, dur: 0, said: 0, quietT: 0, last: {} }); }

function say(b, text, opts) {
  if (!b || !text) return;
  var s = speechOf(b), words = splitSpeech(text);
  s.words = words; s.t = 0; s.said = 0;
  s.dur = words.length * SPEECH_WORD + SPEECH_READ + words.length * 0.12 + ((opts && opts.hold) || 0);
  s.clip = (opts && opts.clip) || SPEECH_CLIPS[text] || null;
  if (s.clip) playSpeechClip(s.clip);
}

function canSay(b) {
  var s = speechOf(b);
  return !s.words && s.quietT <= 0;
}

function speaking(b) { var s = speech[b && b.id]; return !!(s && s.words); }

function pickLine(b, lines, key) {
  if (!lines || !lines.length) return null;
  var s = speechOf(b), k = key || "_", i = Math.floor(Math.random() * lines.length);
  if (lines.length > 1 && i === s.last[k]) i = (i + 1) % lines.length;
  s.last[k] = i;
  return lines[i];
}

// "Sorry I'm late, I just don't give a [BLEEP]." -> words, with the bleeps
// marked (punctuation stuck to a bleep stays with it).
function splitSpeech(text) {
  return text.split(/\s+/).filter(Boolean).map(function (w) {
    var m = w.match(/^(.*)\[BLEEP\](.*)$/i);
    return m ? { text: w, bleep: true, pre: m[1], post: m[2] } : { text: w, bleep: false };
  });
}

function tickSpeech(dt) {
  if (announcer) {
    announcer.t += dt;
    var an = Math.min(announcer.words.length, Math.floor(announcer.t / SPEECH_WORD) + 1);
    while (announcer.said < an) { if (announcer.words[announcer.said].bleep && !announcer.clip) playBleep(); announcer.said++; }
    if (announcer.t >= announcer.dur) announcer = null;
  }
  for (var i = 0; i < speech.length; i++) {
    var s = speech[i];
    if (!s) continue;
    if (!s.words) { if (s.quietT > 0) s.quietT -= dt; continue; }
    var b = balls[i];
    if (!b || !b.alive) { s.words = null; continue; }
    s.t += dt;
    var n = Math.min(s.words.length, Math.floor(s.t / SPEECH_WORD) + 1);
    while (s.said < n) { if (s.words[s.said].bleep && !s.clip) playBleep(); s.said++; }
    if (s.t >= s.dur) { s.words = null; s.quietT = SPEECH_GAP; }
  }
}

var BLEEP_W = 58;
function speechWordW(w) {
  if (!w.bleep) return ctx.measureText(w.text).width;
  return ctx.measureText(w.pre).width + BLEEP_W + ctx.measureText(w.post).width;
}

// The bubble's size, and its two possible spots: under the fighter, or over
// him (above his health bar).
function speechLayout(b, all) {
  ctx.font = SPEECH_FONT;
  var space = ctx.measureText(" ").width;
  var lines = [[]], lw = 0, widest = 0;
  all.forEach(function (w, k) {
    var ww = speechWordW(w);
    if (lines[lines.length - 1].length && lw + space + ww > SPEECH_MAX_W) { lines.push([]); lw = 0; }
    lw += (lines[lines.length - 1].length ? space : 0) + ww;
    lines[lines.length - 1].push({ w: w, k: k, ww: ww });
    widest = Math.max(widest, lw);
  });
  var w = widest + 28, h = lines.length * SPEECH_LINE_H + 16;
  var below = { y: b.y + b.r + 20, ok: b.y + b.r + 20 + h <= H - 4 };
  var above = { y: b.y - b.r - 38 - h, ok: b.y - b.r - 38 - h >= 4 };
  return { lines: lines, space: space, w: w, h: h, x: Math.max(4, Math.min(W - w - 4, b.x - w / 2)), below: below, above: above };
}

// From draw.js, over the fighters in the arena. Each bubble goes under its
// fighter or over him, whichever covers least of the other bubble and the
// other fighter (under wins a tie: the hit numbers float upward).
function drawSpeech() {
  drawAnnouncer();
  var placed = null;
  for (var i = 0; i < speech.length; i++) {
    var s = speech[i], b = balls[i];
    if (!s || !s.words || !b) continue;
    var L = speechLayout(b, s.words), other = balls[1 - i];
    var best = null;
    [{ under: true, spot: L.below }, { under: false, spot: L.above }].forEach(function (c, k) {
      var rect = { x: L.x, y: c.spot.y, w: L.w, h: L.h };
      var cost = (c.spot.ok ? 0 : 1e6) + overlapArea(rect, placed) * 2 + k;
      if (other && other.alive) cost += overlapArea(rect, { x: other.x - other.r, y: other.y - other.r, w: other.r * 2, h: other.r * 2 });
      if (!best || cost < best.cost) best = { cost: cost, rect: rect, under: c.under };
    });
    placed = best.rect;
    var shown = Math.min(s.words.length, Math.floor(s.t / SPEECH_WORD) + 1);
    var alpha = Math.min(1, (s.dur - s.t) / SPEECH_FADE);
    var pop = Math.min(1, s.t / SPEECH_POP), scale = 0.82 + 0.18 * (1 - Math.pow(1 - pop, 3));
    drawSpeechBubble(b, L, best.rect, best.under, shown, alpha, scale);
  }
}

function overlapArea(a, c) {
  if (!a || !c) return 0;
  var w = Math.min(a.x + a.w, c.x + c.w) - Math.max(a.x, c.x), h = Math.min(a.y + a.h, c.y + c.h) - Math.max(a.y, c.y);
  return w > 0 && h > 0 ? w * h : 0;
}

function announce(text, opts) {
  if (!text) return;
  var words = splitSpeech(text);
  announcer = { words: words, t: 0, said: 0, who: ((opts && opts.who) || "COMMENTARY").toUpperCase(),
    dur: words.length * SPEECH_WORD + SPEECH_READ + 0.6 + words.length * 0.12 + ((opts && opts.hold) || 0),
    clip: (opts && opts.clip) || SPEECH_CLIPS[text] || null };
  if (announcer.clip) playSpeechClip(announcer.clip);
}

// From draw.js with the speech bubbles: the lower-third across the bottom of
// the cage, sliding up into place.
function drawAnnouncer() {
  var a = announcer;
  if (!a) return;
  ctx.save();
  ctx.font = SPEECH_FONT;
  var space = ctx.measureText(" ").width, maxW = W - 24 - 28;
  var lines = [[]], lw = 0;
  a.words.forEach(function (w, k) {
    var ww = speechWordW(w);
    if (lines[lines.length - 1].length && lw + space + ww > maxW) { lines.push([]); lw = 0; }
    lw += (lines[lines.length - 1].length ? space : 0) + ww;
    lines[lines.length - 1].push({ w: w, k: k, ww: ww });
  });
  var h = lines.length * SPEECH_LINE_H + 16, x = 12, w = W - 24;
  var slide = Math.min(1, a.t / 0.18), out = Math.min(1, (a.dur - a.t) / SPEECH_FADE);
  var y = H - 12 - h + (1 - slide) * (h + 12);
  ctx.globalAlpha = Math.max(0, out);
  ctx.fillStyle = "rgba(14,14,16,0.9)"; ctx.strokeStyle = "#d4af37"; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.roundRect(x, y, w, h, 8); ctx.fill(); ctx.stroke();
  ctx.fillStyle = "#d4af37"; ctx.fillRect(x, y, 5, h);
  // the commentator's name on a gold tab
  ctx.font = "800 13px \"Barlow Condensed\", \"Arial Narrow\", sans-serif";
  var nw = ctx.measureText(a.who).width + 16;
  ctx.fillStyle = "#d4af37"; ctx.strokeStyle = "#151515"; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.roundRect(x + 14, y - 10, nw, 18, 4); ctx.fill(); ctx.stroke();
  ctx.fillStyle = "#151515"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillText(a.who, x + 14 + nw / 2, y - 0.5);
  // the call, word by word
  var shown = Math.min(a.words.length, Math.floor(a.t / SPEECH_WORD) + 1);
  ctx.font = SPEECH_FONT; ctx.textAlign = "left";
  lines.forEach(function (ln, li) {
    var lx = x + 16, ly = y + 9 + SPEECH_LINE_H * li + SPEECH_LINE_H / 2 + 1;
    ln.forEach(function (it) {
      if (it.k < shown) {
        var wd = it.w;
        if (!wd.bleep) { ctx.fillStyle = "#ffffff"; ctx.fillText(wd.text, lx, ly); }
        else {
          var pw = ctx.measureText(wd.pre).width;
          ctx.fillStyle = "#ffffff"; ctx.fillText(wd.pre, lx, ly);
          ctx.fillStyle = "#000000"; ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 1.5;
          ctx.beginPath(); ctx.roundRect(lx + pw, ly - 11, BLEEP_W, 22, 4); ctx.fill(); ctx.stroke();
          ctx.save(); ctx.font = "800 14px \"Barlow Condensed\", \"Arial Narrow\", sans-serif";
          ctx.fillStyle = "#ffffff"; ctx.textAlign = "center"; ctx.fillText("BLEEP", lx + pw + BLEEP_W / 2, ly + 1); ctx.restore();
          ctx.fillStyle = "#ffffff"; ctx.fillText(wd.post, lx + pw + BLEEP_W, ly);
        }
      }
      lx += it.ww + space;
    });
  });
  ctx.restore();
}

function speechName(b) {
  var n = (b.char && b.char.name) || "";
  var parts = n.split(" ");
  return (parts.length > 1 ? parts[parts.length - 1] : n).toUpperCase();
}

function drawSpeechBubble(b, L, r, under, shown, alpha, scale) {
  ctx.save(); ctx.globalAlpha = Math.max(0, alpha);
  // the tail points at whoever's talking; scale the pop-in from there
  var tx = Math.max(r.x + 20, Math.min(r.x + r.w - 20, b.x)), ty = under ? r.y : r.y + r.h, td = under ? -14 : 14;
  ctx.translate(tx, ty); ctx.scale(scale, scale); ctx.translate(-tx, -ty);
  var ink = "#151515", col = (b.char && b.char.color) || "#c8102e";
  // drop shadow
  ctx.fillStyle = "rgba(0,0,0,0.28)";
  ctx.beginPath(); ctx.roundRect(r.x + 3, r.y + 4, r.w, r.h, 12); ctx.fill();
  // bubble and tail
  ctx.fillStyle = "#ffffff"; ctx.strokeStyle = ink; ctx.lineWidth = 3; ctx.lineJoin = "round";
  ctx.beginPath(); ctx.roundRect(r.x, r.y, r.w, r.h, 12); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(tx - 9, ty); ctx.lineTo(tx + 3, ty + td); ctx.lineTo(tx + 9, ty); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = "#ffffff"; ctx.fillRect(tx - 7.5, under ? ty - 0.5 : ty - 2.5, 15, 3);
  // his name on a tab in his colour, on the bubble's top edge
  var name = speechName(b);
  ctx.font = "800 13px \"Barlow Condensed\", \"Arial Narrow\", sans-serif";
  var nw = ctx.measureText(name).width + 14, nx = r.x + 12, ny = r.y - 10;
  ctx.fillStyle = col; ctx.strokeStyle = ink; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.roundRect(nx, ny, nw, 18, 5); ctx.fill(); ctx.stroke();
  ctx.fillStyle = speechTextOn(col); ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillText(name, nx + nw / 2, ny + 9.5);
  // the words so far
  ctx.font = SPEECH_FONT; ctx.textAlign = "left";
  L.lines.forEach(function (ln, li) {
    var x = r.x + 14, y = r.y + 9 + SPEECH_LINE_H * li + SPEECH_LINE_H / 2 + 1;
    ln.forEach(function (it) {
      if (it.k < shown) {
        var wd = it.w;
        if (!wd.bleep) { ctx.fillStyle = ink; ctx.fillText(wd.text, x, y); }
        else {
          var pw = ctx.measureText(wd.pre).width;
          ctx.fillStyle = ink; ctx.fillText(wd.pre, x, y);
          ctx.beginPath(); ctx.roundRect(x + pw, y - 11, BLEEP_W, 22, 4); ctx.fill();
          ctx.save(); ctx.font = "800 14px \"Barlow Condensed\", \"Arial Narrow\", sans-serif";
          ctx.fillStyle = "#ffffff"; ctx.textAlign = "center"; ctx.fillText("BLEEP", x + pw + BLEEP_W / 2, y + 1); ctx.restore();
          ctx.fillStyle = ink; ctx.fillText(wd.post, x + pw + BLEEP_W, y);
        }
      }
      x += it.ww + L.space;
    });
  });
  ctx.restore();
}

// White or black text, whichever reads on the fighter's colour.
function speechTextOn(hex) {
  var m = /^#?([0-9a-f]{6})$/i.exec(hex || "");
  if (!m) return "#ffffff";
  var n = parseInt(m[1], 16), lum = (0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255;
  return lum > 0.6 ? "#151515" : "#ffffff";
}

// A recorded line, when there is one (SOUND_CLIPS, decoded on first use).
function playSpeechClip(name) {
  try {
    if (typeof SOUND_CLIPS === "undefined" || !SOUND_CLIPS[name]) return;
    withClip(name, function () { playClipOnce(name, 1); });
  } catch (e) { /* never let audio break the game */ }
}

// The TV bleep: a flat 1 kHz tone.
function playBleep() {
  try {
    var ac = getAudioCtx();
    if (!ac) return;
    if (ac.state === "suspended") ac.resume();
    var t = ac.currentTime, o = ac.createOscillator(), g = ac.createGain();
    o.type = "sine"; o.frequency.value = 1000;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.16, t + 0.01);
    g.gain.setValueAtTime(0.16, t + 0.32);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.36);
    o.connect(g); g.connect(ac.destination);
    o.start(t); o.stop(t + 0.38);
  } catch (e) { /* never let audio break the game */ }
}
