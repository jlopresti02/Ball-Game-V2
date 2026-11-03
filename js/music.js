// Background music: six loops built in code, picked with the Music button
// on the game screen (the choice is remembered per device). Each loop is
// rendered once into a buffer the first time it's needed, then loops quietly
// under the crowd for the whole fight and dips under the talking clips
// (duckMusic, called from the talk channel in audio.js).
"use strict";

var MUSIC_KEY = "ballbrawl_music_v1";
var MUSIC_GAIN = 0.16;       // under the crowd
var MUSIC_DUCK = 0.35;       // share of that while someone's talking
var MUSIC_LIST = ["D", "E", "F", "A", "B", "C", "off"];
var MUSIC_NAMES = { D: "Aggressive: War drums", E: "Aggressive: Metal", F: "Aggressive: Drill", A: "Playful bounce", B: "Fight night hype", C: "Arcade", off: "Off" };
var musicChoice = "D";
try { var savedMusic = localStorage.getItem(MUSIC_KEY); if (MUSIC_NAMES[savedMusic]) musicChoice = savedMusic; } catch (e) {}

// ---------------------------------------------------------------- instruments
// Each one schedules a note into `out` at time t on `ctx` (an offline context
// while the loop is being rendered).
var musicNoise = null;
function mNoise(ctx) {
  if (!musicNoise || musicNoise.sampleRate !== ctx.sampleRate) {
    var b = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate), d = b.getChannelData(0);
    for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    musicNoise = b;
  }
  return musicNoise;
}
function mEnv(ctx, t, a, peak, dec) {
  var g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(peak, t + a);
  g.gain.exponentialRampToValueAtTime(0.0001, t + a + dec);
  return g;
}
function mOsc(ctx, out, type, f, t, a, peak, dec) {
  var o = ctx.createOscillator(); o.type = type; o.frequency.value = f;
  var g = mEnv(ctx, t, a, peak, dec); o.connect(g); g.connect(out);
  o.start(t); o.stop(t + a + dec + 0.05);
}
function mtof(m) { return 440 * Math.pow(2, (m - 69) / 12); }
function mMarimba(ctx, out, m, t, v) {
  var f = mtof(m);
  mOsc(ctx, out, "sine", f, t, 0.003, 0.35 * v, 0.35);
  mOsc(ctx, out, "sine", f * 4, t, 0.002, 0.08 * v, 0.06);
  mOsc(ctx, out, "triangle", f * 2, t, 0.002, 0.05 * v, 0.12);
}
function mPluckBass(ctx, out, m, t, v, len) {
  var o = ctx.createOscillator(); o.type = "triangle"; o.frequency.value = mtof(m);
  var lp = ctx.createBiquadFilter(); lp.type = "lowpass";
  lp.frequency.setValueAtTime(1200, t); lp.frequency.exponentialRampToValueAtTime(200, t + 0.2);
  var g = mEnv(ctx, t, 0.005, 0.5 * v, len);
  o.connect(lp); lp.connect(g); g.connect(out); o.start(t); o.stop(t + 0.6);
}
function mSawBass(ctx, out, m, t, v, len) {
  [-8, 8].forEach(function (dt) {
    var o = ctx.createOscillator(); o.type = "sawtooth"; o.frequency.value = mtof(m); o.detune.value = dt;
    var lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.Q.value = 4;
    lp.frequency.setValueAtTime(900, t); lp.frequency.exponentialRampToValueAtTime(180, t + len);
    var g = mEnv(ctx, t, 0.005, 0.22 * v, len);
    o.connect(lp); lp.connect(g); g.connect(out); o.start(t); o.stop(t + len + 0.1);
  });
  mOsc(ctx, out, "sine", mtof(m - 12), t, 0.005, 0.35 * v, len);
}
function mKick(ctx, out, t, v) {
  var o = ctx.createOscillator();
  o.frequency.setValueAtTime(150, t); o.frequency.exponentialRampToValueAtTime(45, t + 0.12);
  var g = mEnv(ctx, t, 0.002, 0.9 * v, 0.28); o.connect(g); g.connect(out); o.start(t); o.stop(t + 0.35);
}
function mNz(ctx, out, t, type, f, q, peak, dec) {
  var s = ctx.createBufferSource(); s.buffer = mNoise(ctx);
  var fl = ctx.createBiquadFilter(); fl.type = type; fl.frequency.value = f; fl.Q.value = q;
  var g = mEnv(ctx, t, 0.001, peak, dec);
  s.connect(fl); fl.connect(g); g.connect(out); s.start(t, Math.random() * 0.5); s.stop(t + dec + 0.05);
}
function mSnare(ctx, out, t, v) { mNz(ctx, out, t, "bandpass", 1800, 0.8, 0.5 * v, 0.16); mOsc(ctx, out, "triangle", 200, t, 0.002, 0.25 * v, 0.08); }
function mClap(ctx, out, t, v) {
  [0, 0.012, 0.024].forEach(function (d) { mNz(ctx, out, t + d, "bandpass", 1500, 1.2, 0.35 * v, 0.06); });
  mNz(ctx, out, t + 0.03, "bandpass", 1400, 1, 0.25 * v, 0.15);
}
function mHat(ctx, out, t, v, open) { mNz(ctx, out, t, "highpass", 7000, 0.7, 0.18 * v, open ? 0.18 : 0.04); }
function mShaker(ctx, out, t, v) { mNz(ctx, out, t, "bandpass", 6000, 1.5, 0.08 * v, 0.05); }
function mSquare(ctx, out, m, t, v, len) {
  var o = ctx.createOscillator(); o.type = "square"; o.frequency.value = mtof(m);
  var g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.09 * v, t + 0.005);
  g.gain.setValueAtTime(0.09 * v, t + len * 0.8); g.gain.exponentialRampToValueAtTime(0.0001, t + len);
  o.connect(g); g.connect(out); o.start(t); o.stop(t + len + 0.02);
}
function mStab(ctx, out, notes, t, v, len) {
  notes.forEach(function (m) {
    [-10, 10].forEach(function (dt) {
      var o = ctx.createOscillator(); o.type = "sawtooth"; o.frequency.value = mtof(m); o.detune.value = dt;
      var lp = ctx.createBiquadFilter(); lp.type = "lowpass";
      lp.frequency.setValueAtTime(3000, t); lp.frequency.exponentialRampToValueAtTime(600, t + len);
      var g = mEnv(ctx, t, 0.004, 0.05 * v, len);
      o.connect(lp); lp.connect(g); g.connect(out); o.start(t); o.stop(t + len + 0.05);
    });
  });
}

// Heavier kit for the aggressive loops: distortion, big drums, 808s, guitars.
var musicCurves = {};
function mDrive(ctx, amt) {
  var sh = ctx.createWaveShaper();
  if (!musicCurves[amt]) {
    var c = new Float32Array(1024);
    for (var i = 0; i < 1024; i++) { var x = i / 511.5 - 1; c[i] = Math.tanh(x * amt) / Math.tanh(amt); }
    musicCurves[amt] = c;
  }
  sh.curve = musicCurves[amt];
  return sh;
}
function mBigKick(ctx, out, t, v) {
  var o = ctx.createOscillator();
  o.frequency.setValueAtTime(180, t); o.frequency.exponentialRampToValueAtTime(42, t + 0.09);
  var d = mDrive(ctx, 3), g = mEnv(ctx, t, 0.002, 1.0 * v, 0.32);
  o.connect(d); d.connect(g); g.connect(out); o.start(t); o.stop(t + 0.4);
  mNz(ctx, out, t, "highpass", 3000, 0.7, 0.25 * v, 0.012); // beater click
}
function mBigSnare(ctx, out, t, v) {
  mNz(ctx, out, t, "bandpass", 2200, 0.6, 0.75 * v, 0.22);
  mNz(ctx, out, t, "highpass", 5000, 0.5, 0.3 * v, 0.12);
  var o = ctx.createOscillator(); o.frequency.setValueAtTime(260, t); o.frequency.exponentialRampToValueAtTime(160, t + 0.08);
  var g = mEnv(ctx, t, 0.002, 0.45 * v, 0.1); o.connect(g); g.connect(out); o.start(t); o.stop(t + 0.15);
}
function mTom(ctx, out, t, f, v) {
  var o = ctx.createOscillator();
  o.frequency.setValueAtTime(f * 1.6, t); o.frequency.exponentialRampToValueAtTime(f, t + 0.06);
  var d = mDrive(ctx, 2), g = mEnv(ctx, t, 0.002, 0.9 * v, 0.5);
  o.connect(d); d.connect(g); g.connect(out); o.start(t); o.stop(t + 0.6);
  mNz(ctx, out, t, "bandpass", f * 4, 1, 0.3 * v, 0.08);
}
function mCrash(ctx, out, t, v) { mNz(ctx, out, t, "highpass", 4500, 0.4, 0.3 * v, 1.4); mNz(ctx, out, t, "bandpass", 3000, 0.5, 0.12 * v, 0.6); }
function m808(ctx, out, m, t, v, len, glideFrom) {
  var o = ctx.createOscillator(), f = mtof(m);
  o.frequency.setValueAtTime(glideFrom ? mtof(glideFrom) : f * 1.5, t);
  o.frequency.exponentialRampToValueAtTime(f, t + (glideFrom ? 0.12 : 0.03));
  var d = mDrive(ctx, 2.5), g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.75 * v, t + 0.005);
  g.gain.setValueAtTime(0.75 * v, t + len * 0.7); g.gain.exponentialRampToValueAtTime(0.0001, t + len);
  o.connect(d); d.connect(g); g.connect(out); o.start(t); o.stop(t + len + 0.05);
}
// A distorted power chord (root, fifth, octave). Short = palm-muted chug.
function mGuitar(ctx, out, m, t, v, len) {
  var bus = ctx.createGain(); bus.gain.value = 0.12;
  [0, 7, 12].forEach(function (iv) {
    [-7, 7].forEach(function (dt) {
      var o = ctx.createOscillator(); o.type = "sawtooth"; o.frequency.value = mtof(m + iv); o.detune.value = dt;
      o.connect(bus); o.start(t); o.stop(t + len + 0.08);
    });
  });
  var d = mDrive(ctx, 8), lp = ctx.createBiquadFilter(); lp.type = "lowpass";
  lp.frequency.value = len < 0.2 ? 1400 : 3200; lp.Q.value = 1;
  var g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.28 * v, t + 0.004);
  g.gain.setValueAtTime(0.28 * v, t + len * 0.75); g.gain.exponentialRampToValueAtTime(0.0001, t + len);
  bus.connect(d); d.connect(lp); lp.connect(g); g.connect(out);
}
function mBrass(ctx, out, notes, t, v, len) {
  notes.forEach(function (m) {
    [-12, 0, 12].forEach(function (dt) {
      var o = ctx.createOscillator(); o.type = "sawtooth"; o.frequency.value = mtof(m); o.detune.value = dt;
      var lp = ctx.createBiquadFilter(); lp.type = "lowpass";
      lp.frequency.setValueAtTime(600, t); lp.frequency.exponentialRampToValueAtTime(3500, t + 0.06);
      lp.frequency.exponentialRampToValueAtTime(900, t + len);
      var g = mEnv(ctx, t, 0.02, 0.06 * v, len);
      o.connect(lp); lp.connect(g); g.connect(out); o.start(t); o.stop(t + len + 0.1);
    });
  });
}
function mBell(ctx, out, m, t, v) {
  var f = mtof(m);
  mOsc(ctx, out, "sine", f, t, 0.002, 0.18 * v, 0.6);
  mOsc(ctx, out, "sine", f * 2.76, t, 0.002, 0.06 * v, 0.25);
  mOsc(ctx, out, "sine", f * 5.4, t, 0.001, 0.03 * v, 0.1);
}

// ---------------------------------------------------------------- the loops
// Each is `bars` bars long at `bpm`; play(ctx, out, t0) schedules one pass.
var MUSIC_SONGS = {
  // Playful bounce: marimba arpeggios, plucky bass, claps and a shaker.
  A: { bpm: 116, bars: 8, play: function (ctx, out, t0) {
    var b = 60 / 116, prog = [[60, 64, 67, 72], [55, 59, 62, 67], [57, 60, 64, 69], [53, 57, 60, 65]], bass = [48, 43, 45, 41];
    var arp = [0, 1, 2, 3, 2, 1, 2, 0];
    for (var bar = 0; bar < 8; bar++) {
      var ch = prog[bar % 4], bt = t0 + bar * 4 * b, root = bass[bar % 4];
      for (var i = 0; i < 8; i++) mMarimba(ctx, out, ch[arp[i]] + 12, bt + i * b / 2, i % 2 ? 0.6 : 0.9);
      [0, 1.5, 2, 3].forEach(function (x) { mPluckBass(ctx, out, root - 12 + (x === 1.5 ? 12 : 0), bt + x * b, 0.9, 0.22); });
      mClap(ctx, out, bt + b, 0.8); mClap(ctx, out, bt + 3 * b, 0.8);
      for (var s = 0; s < 16; s++) mShaker(ctx, out, bt + s * b / 4, s % 2 ? 0.6 : 1);
      mKick(ctx, out, bt, 0.6); mKick(ctx, out, bt + 2 * b, 0.6);
    }
  } },
  // Fight night hype: punchy drums, growling bass and synth stabs, minor key.
  B: { bpm: 128, bars: 8, play: function (ctx, out, t0) {
    var b = 60 / 128, roots = [45, 41, 48, 43], chords = [[69, 72, 76], [65, 69, 72], [67, 72, 76], [67, 71, 74]];
    for (var bar = 0; bar < 8; bar++) {
      var bt = t0 + bar * 4 * b, r = roots[bar % 4], ch = chords[bar % 4];
      [0, 0.75, 1.5, 2, 2.75, 3.5].forEach(function (x) { mKick(ctx, out, bt + x * b, x % 1 ? 0.7 : 1); });
      [1, 3].forEach(function (x) { mSnare(ctx, out, bt + x * b, 1); mClap(ctx, out, bt + x * b, 0.5); });
      for (var s = 0; s < 8; s++) mHat(ctx, out, bt + s * b / 2, s % 2 ? 0.6 : 1, s === 7);
      [0, 0.5, 1.5, 2, 2.5, 3.5].forEach(function (x) { mSawBass(ctx, out, r - 12, bt + x * b, 0.8, 0.22); });
      [0, 1.75, 3].forEach(function (x) { mStab(ctx, out, ch, bt + x * b, 1, 0.18); });
    }
  } },
  // Arcade: a chiptune square lead, bouncing bass and crunchy noise drums.
  C: { bpm: 140, bars: 8, play: function (ctx, out, t0) {
    var b = 60 / 140, bass = [48, 45, 41, 43];
    var mel = [[72, 0, 0.5], [76, 0.5, 0.5], [79, 1, 0.5], [76, 1.5, 0.5], [84, 2, 1], [79, 3, 0.5], [76, 3.5, 0.5],
               [72, 4, 0.5], [76, 4.5, 0.5], [81, 5, 0.5], [79, 5.5, 0.5], [77, 6, 1], [74, 7, 1],
               [72, 8, 0.5], [77, 8.5, 0.5], [81, 9, 0.5], [77, 9.5, 0.5], [84, 10, 1], [81, 11, 1],
               [79, 12, 0.5], [77, 12.5, 0.5], [76, 13, 0.5], [74, 13.5, 0.5], [72, 14, 2]];
    for (var bar = 0; bar < 8; bar++) {
      var bt = t0 + bar * 4 * b;
      for (var i = 0; i < 8; i++) {
        var nt = bt + i * b / 2, o = ctx.createOscillator(); o.type = "triangle";
        o.frequency.value = mtof(bass[bar % 4] - 12 + (i % 2 ? 12 : 0));
        var g = mEnv(ctx, nt, 0.004, 0.35, 0.18); o.connect(g); g.connect(out); o.start(nt); o.stop(nt + 0.25);
      }
      mKick(ctx, out, bt, 0.8); mKick(ctx, out, bt + 2 * b, 0.8);
      [1, 3].forEach(function (x) { mNz(ctx, out, bt + x * b, "highpass", 1500, 0.5, 0.35, 0.1); });
      for (var s = 0; s < 8; s++) mNz(ctx, out, bt + s * b / 2, "highpass", 8000, 0.5, 0.08, 0.03);
    }
    [0, 16].forEach(function (rep) { mel.forEach(function (n) { mSquare(ctx, out, n[0], t0 + (rep + n[1]) * b, 1, n[2] * b * 0.9); }); });
  } },
  // War drums: slow and huge. Pounding toms, a driven sub, brass hits.
  D: { bpm: 96, bars: 8, level: 1.5, play: function (ctx, out, t0) {
    var b = 60 / 96, roots = [38, 38, 41, 36], brass = [[62, 65, 69], [62, 65, 69], [65, 69, 72], [60, 64, 67]];
    for (var bar = 0; bar < 8; bar++) {
      var bt = t0 + bar * 4 * b, r = roots[bar % 4];
      [0, 1.5, 2, 3.5].forEach(function (x) { mBigKick(ctx, out, bt + x * b, 1); });
      [1, 3].forEach(function (x) { mBigSnare(ctx, out, bt + x * b, 1); });
      [0.5, 0.75, 2.5, 2.75, 3.25].forEach(function (x, k) { mTom(ctx, out, bt + x * b, k < 2 ? 110 : 82, 0.8); });
      if (bar % 2 === 1) [3, 3.25, 3.5, 3.75].forEach(function (x, k) { mTom(ctx, out, bt + x * b, [150, 120, 95, 75][k], 0.9); });
      [0, 0.75, 1.5, 2, 2.75, 3.5].forEach(function (x) { m808(ctx, out, r - 12, bt + x * b, 0.9, 0.3 * b * 2); });
      mBrass(ctx, out, brass[bar % 4], bt, 1.2, 0.6);
      mBrass(ctx, out, brass[bar % 4], bt + 2.5 * b, 0.9, 0.3);
      for (var s = 0; s < 8; s++) mHat(ctx, out, bt + s * b / 2, s % 2 ? 0.5 : 0.9, false);
      if (bar % 4 === 0) mCrash(ctx, out, bt, 1);
    }
  } },
  // Metal: chugging distorted guitars, double kick, crashes.
  E: { bpm: 150, bars: 8, level: 1.4, play: function (ctx, out, t0) {
    var b = 60 / 150, riff = [[40, 0, 1], [40, 0.5, 0], [40, 0.75, 0], [40, 1, 0], [43, 1.5, 1], [40, 2, 0], [40, 2.5, 0], [46, 2.75, 1], [45, 3.5, 1]];
    var lift = [0, 0, 3, -2];
    for (var bar = 0; bar < 8; bar++) {
      var bt = t0 + bar * 4 * b, up = lift[bar % 4];
      riff.forEach(function (n) { mGuitar(ctx, out, n[0] + up, bt + n[1] * b, 1, n[2] ? 0.42 * b * 2 : 0.11); });
      for (var k = 0; k < 16; k++) mBigKick(ctx, out, bt + k * b / 4, k % 4 ? 0.55 : 0.9);
      [1, 3].forEach(function (x) { mBigSnare(ctx, out, bt + x * b, 1.1); });
      for (var s = 0; s < 4; s++) mNz(ctx, out, bt + s * b, "highpass", 6000, 0.5, 0.15, 0.25); // ride
      if (bar % 2 === 0) mCrash(ctx, out, bt, 1);
    }
  } },
  // Drill: dark bells, gliding 808s, hard snare, rolling hats.
  F: { bpm: 142, bars: 8, level: 1.5, play: function (ctx, out, t0) {
    var b = 60 / 142, bells = [[69, 72, 76, 72], [68, 71, 76, 71], [65, 69, 72, 69], [64, 68, 71, 74]];
    var bass = [[33, 0, 1.5], [33, 1.5, 0.5], [40, 2, 1, 33], [36, 3, 1]];
    for (var bar = 0; bar < 8; bar++) {
      var bt = t0 + bar * 4 * b, ch = bells[(bar >> 1) % 4], dn = [0, -1, -4, -5][(bar >> 1) % 4];
      for (var i = 0; i < 8; i++) mBell(ctx, out, ch[i % 4] + (i > 3 ? 12 : 0), bt + i * b / 2, i % 2 ? 0.6 : 1);
      bass.forEach(function (n) { m808(ctx, out, n[0] + dn, bt + n[1] * b, 1, n[2] * b * 0.95, n[3] !== undefined ? n[3] + dn : 0); });
      [0, 2.5].forEach(function (x) { mBigKick(ctx, out, bt + x * b, 0.9); });
      mBigSnare(ctx, out, bt + 2 * b, 1.2); mClap(ctx, out, bt + 2 * b, 0.6);
      if (bar % 2) mBigSnare(ctx, out, bt + 3.75 * b, 0.6);
      for (var s = 0; s < 16; s++) {
        var ht = bt + s * b / 4;
        if (s === 11 || s === 15) { for (var r = 0; r < 3; r++) mHat(ctx, out, ht + r * b / 12, 0.7, false); }
        else mHat(ctx, out, ht, s % 2 ? 0.55 : 0.9, false);
      }
    }
  } }
};

// Renders one pass of a loop into a buffer. Notes ringing past the end are
// folded back onto the start, so the loop joins up without a click or gap.
var musicBuffers = {}, musicRendering = {};
function renderMusic(id, done) {
  if (musicBuffers[id]) { done(musicBuffers[id]); return; }
  (musicRendering[id] = musicRendering[id] || []).push(done);
  if (musicRendering[id].length > 1) return;
  try {
    var song = MUSIC_SONGS[id], sr = 44100, len = song.bars * 4 * 60 / song.bpm, tail = 1;
    var OAC = window.OfflineAudioContext || window.webkitOfflineAudioContext;
    var off = new OAC(2, Math.ceil(sr * (len + tail)), sr);
    song.play(off, off.destination, 0);
    off.oncomplete = function (e) {
      var full = e.renderedBuffer, n = Math.round(sr * len);
      var ctx = getAudioCtx(), buf = ctx.createBuffer(2, n, sr);
      for (var c = 0; c < 2; c++) {
        var src = full.getChannelData(c), dst = buf.getChannelData(c);
        for (var i = 0; i < n; i++) dst[i] = src[i];
        for (var j = n; j < src.length; j++) dst[j - n] += src[j];
      }
      musicBuffers[id] = buf;
      var waiting = musicRendering[id]; musicRendering[id] = null;
      waiting.forEach(function (cb) { cb(buf); });
    };
    off.startRendering();
  } catch (e) { musicRendering[id] = null; /* no music is fine */ }
}

// ---------------------------------------------------------------- playing it
var music = null; // { src, gain }
function startMusic() {
  stopMusic();
  if (musicChoice === "off") return;
  try {
    var ctx = getAudioCtx();
    if (!ctx) return;
    var id = musicChoice, token = music = { src: null, gain: null };
    renderMusic(id, function (buf) {
      if (music !== token || musicChoice !== id) return; // stopped or changed while rendering
      var now = ctx.currentTime;
      token.level = MUSIC_GAIN * (MUSIC_SONGS[id].level || 1);
      token.src = ctx.createBufferSource(); token.src.buffer = buf; token.src.loop = true;
      token.gain = ctx.createGain();
      token.gain.gain.setValueAtTime(0.0001, now);
      token.gain.gain.exponentialRampToValueAtTime(token.level, now + 0.03); // in right away (Joe)
      token.src.connect(token.gain); token.gain.connect(ctx.destination);
      token.src.start(now);
    });
  } catch (e) { /* never let audio break the game */ }
}
function stopMusic() {
  var m = music; music = null;
  if (!m || !m.src) return;
  try {
    var now = audioCtx.currentTime;
    m.gain.gain.cancelScheduledValues(now);
    m.gain.gain.setTargetAtTime(0.0001, now, 0.15);
    m.src.stop(now + 0.8);
  } catch (e) { /* already stopped */ }
}
// The music dips while a talking clip plays from `at` until `until`.
function duckMusic(at, until) {
  var m = music;
  if (!m || !m.gain) return;
  try {
    var g = m.gain.gain;
    g.cancelScheduledValues(at);
    g.setTargetAtTime(m.level * MUSIC_DUCK, at, 0.08);
    g.setTargetAtTime(m.level, until, 0.3);
  } catch (e) { /* never let audio break the game */ }
}

function setMusicChoice(id) {
  musicChoice = id;
  try { localStorage.setItem(MUSIC_KEY, id); } catch (e) {}
  updateMusicButtons();
  if (music || (started && !over)) startMusic(); // mid-fight: switch right away
  else if (id !== "off") renderMusic(id, function () {}); // ready for the next fight
}
function updateMusicButtons() {
  Array.prototype.forEach.call(document.querySelectorAll(".musicBtn"), function (btn) {
    btn.textContent = "Music: " + MUSIC_NAMES[musicChoice];
  });
}

// Get the chosen loop ready ahead of the first fight, so it starts on time.
setTimeout(function () { if (musicChoice !== "off") renderMusic(musicChoice, function () {}); }, 800);
