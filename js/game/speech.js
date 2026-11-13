// Voice lines as speech bubbles (Christian, 2026-11-12), for fighters whose
// famous lines don't have a recorded clip yet.
//
// say(b, text)   a bubble over fighter b: the words come in one at a time,
//                it holds long enough to read, then fades. One bubble per
//                fighter; a new line replaces the old one. Long lines wrap.
// [BLEEP]        anywhere in the text it's drawn as a black censor bar with
//                BLEEP in it, and a bleep tone plays when that word comes in.
// canSay(b)      false while a bubble is up or for `SPEECH_GAP` seconds after,
//                so a talker doesn't bury the fight in text.
// pickLine(b, lines, key)  a random line from `lines`, never the same one
//                twice in a row for that key.
"use strict";

var SPEECH_WORD = 0.11;  // seconds per word as the line comes in
var SPEECH_READ = 1.5;   // holding once it's all in, plus a bit per word
var SPEECH_FADE = 0.25;
var SPEECH_GAP = 2.5;    // quiet time after a bubble before canSay
var SPEECH_MAX_W = 250;  // wrap width
var SPEECH_FONT = "800 19px \"Barlow Condensed\", \"Arial Narrow\", sans-serif";
var speech = [];         // by fighter id: { words, t, dur, said, quietT }

function resetSpeech() { speech = []; }

function speechOf(b) { return speech[b.id] || (speech[b.id] = { words: null, t: 0, dur: 0, said: 0, quietT: 0, last: {} }); }

function say(b, text, opts) {
  if (!b || !text) return;
  var s = speechOf(b), words = splitSpeech(text);
  s.words = words; s.t = 0; s.said = 0;
  s.dur = words.length * SPEECH_WORD + SPEECH_READ + words.length * 0.12 + ((opts && opts.hold) || 0);
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
  for (var i = 0; i < speech.length; i++) {
    var s = speech[i];
    if (!s) continue;
    if (!s.words) { if (s.quietT > 0) s.quietT -= dt; continue; }
    var b = balls[i];
    if (!b || !b.alive) { s.words = null; continue; }
    s.t += dt;
    var n = Math.min(s.words.length, Math.floor(s.t / SPEECH_WORD) + 1);
    while (s.said < n) { if (s.words[s.said].bleep) playBleep(); s.said++; }
    if (s.t >= s.dur) { s.words = null; s.quietT = SPEECH_GAP; }
  }
}

var BLEEP_W = 50;
function speechWordW(w) {
  if (!w.bleep) return ctx.measureText(w.text).width;
  return ctx.measureText(w.pre).width + BLEEP_W + ctx.measureText(w.post).width;
}

// From draw.js, over the fighters in the arena.
function drawSpeech() {
  for (var i = 0; i < speech.length; i++) {
    var s = speech[i], b = balls[i];
    if (!s || !s.words || !b) continue;
    var shown = s.words.slice(0, Math.min(s.words.length, Math.floor(s.t / SPEECH_WORD) + 1));
    var alpha = Math.min(1, (s.dur - s.t) / SPEECH_FADE);
    drawSpeechBubble(b, shown, s.words, alpha);
  }
}

function drawSpeechBubble(b, shown, all, alpha) {
  ctx.save(); ctx.globalAlpha = Math.max(0, alpha);
  ctx.font = SPEECH_FONT;
  var space = ctx.measureText(" ").width, lineH = 22;
  // Wrap the whole line, so the bubble doesn't grow sideways as words come in.
  var lines = [[]], lw = 0, widest = 0;
  all.forEach(function (w, k) {
    var ww = speechWordW(w);
    if (lines[lines.length - 1].length && lw + space + ww > SPEECH_MAX_W) { lines.push([]); lw = 0; }
    lw += (lines[lines.length - 1].length ? space : 0) + ww;
    lines[lines.length - 1].push({ w: w, k: k, ww: ww });
    widest = Math.max(widest, lw);
  });
  var w = widest + 22, h = lines.length * lineH + 12;
  var above = b.y - b.r - 34 - h > 6;
  var bx = Math.max(4, Math.min(W - w - 4, b.x - w / 2));
  var by = above ? b.y - b.r - 32 - h : b.y + b.r + 16;
  var tx = Math.max(bx + 16, Math.min(bx + w - 16, b.x));
  ctx.fillStyle = "#ffffff"; ctx.strokeStyle = "#151515"; ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.roundRect(bx, by, w, h, 10); ctx.fill(); ctx.stroke();
  // the tail, pointing at whoever's talking
  var ty = above ? by + h : by, td = above ? 12 : -12;
  ctx.beginPath(); ctx.moveTo(tx - 7, ty); ctx.lineTo(tx + 2, ty + td); ctx.lineTo(tx + 7, ty); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(tx - 7, ty); ctx.lineTo(tx + 2, ty + td); ctx.lineTo(tx + 7, ty); ctx.stroke();
  ctx.fillStyle = "#ffffff"; ctx.fillRect(tx - 6, above ? ty - 2 : ty, 12, 2.5);
  ctx.textBaseline = "middle"; ctx.textAlign = "left";
  lines.forEach(function (ln, li) {
    var x = bx + 11, y = by + 6 + lineH * li + lineH / 2 + 1;
    ln.forEach(function (it) {
      if (it.k < shown.length) {
        var wd = it.w;
        if (!wd.bleep) { ctx.fillStyle = "#151515"; ctx.fillText(wd.text, x, y); }
        else {
          var pw = ctx.measureText(wd.pre).width;
          ctx.fillStyle = "#151515"; ctx.fillText(wd.pre, x, y);
          ctx.beginPath(); ctx.roundRect(x + pw, y - 9, BLEEP_W, 18, 3); ctx.fill();
          ctx.save(); ctx.font = "800 12px \"Barlow Condensed\", \"Arial Narrow\", sans-serif";
          ctx.fillStyle = "#ffffff"; ctx.textAlign = "center"; ctx.fillText("BLEEP", x + pw + BLEEP_W / 2, y + 1); ctx.restore();
          ctx.fillStyle = "#151515"; ctx.fillText(wd.post, x + pw + BLEEP_W, y);
        }
      }
      x += it.ww + space;
    });
  });
  ctx.restore();
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
