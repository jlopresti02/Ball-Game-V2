// Synthesized wall-bounce sound (no audio files).
"use strict";

// A bright "ding" for every wall bounce — a little casino sparkle without
// turning into a melody. Pitch is randomized per hit rather than climbing
// a scale, and the shimmer is short and subtle. No audio file needed, it's
// all synthesized. Browsers require a user gesture before audio can play,
// so the context is created lazily and resumed on the next tap.
var audioCtx = null;
var echoBus = null;
var lastBounceSound = 0;
function getAudioCtx() {
  if (audioCtx) return audioCtx;
  var Ctor = window.AudioContext || window.webkitAudioContext;
  if (!Ctor) return null;
  try {
    audioCtx = new Ctor();
    // A brief, low-feedback echo every ding feeds into, for a touch of
    // sparkle without a ringing, musical tail.
    var delay = audioCtx.createDelay();
    delay.delayTime.value = 0.055;
    var feedback = audioCtx.createGain();
    feedback.gain.value = 0.14;
    var echoOut = audioCtx.createGain();
    echoOut.gain.value = 0.4;
    delay.connect(feedback); feedback.connect(delay);
    delay.connect(echoOut); echoOut.connect(audioCtx.destination);
    echoBus = delay;
  } catch (e) { audioCtx = null; echoBus = null; }
  return audioCtx;
}
function playBounce() {
  try {
    var ctx = getAudioCtx();
    if (!ctx) return;
    if (ctx.state === "suspended") ctx.resume();
    // Throttle so many simultaneous/near-simultaneous bounces (e.g. both
    // balls hitting walls the same frame) don't stack into a harsh spike.
    var now = ctx.currentTime;
    if (now - lastBounceSound < 0.03) return;
    lastBounceSound = now;

    var freq = 300 + Math.random() * 220;

    var master = ctx.createGain();
    master.gain.setValueAtTime(0.0001, now);
    master.gain.exponentialRampToValueAtTime(0.22, now + 0.005);
    master.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);
    master.connect(ctx.destination);
    if (echoBus) master.connect(echoBus);

    // Fundamental + one octave above: enough for a bright "ding" without
    // the fuller bell chord.
    [
      { mult: 1, type: "sine", peak: 1, dur: 0.16 },
      { mult: 2, type: "sine", peak: 0.3, dur: 0.1 }
    ].forEach(function (p) {
      var osc = ctx.createOscillator();
      osc.type = p.type;
      osc.frequency.setValueAtTime(freq * p.mult, now);
      var g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, now);
      g.gain.exponentialRampToValueAtTime(p.peak, now + 0.005);
      g.gain.exponentialRampToValueAtTime(0.0001, now + p.dur);
      osc.connect(g); g.connect(master);
      osc.start(now); osc.stop(now + p.dur + 0.02);
    });
  } catch (e) { /* audio is a nice-to-have, never let it break the game */ }
}

// ---------------------------------------------------------------
// Punch sound: a landed punch (the Brawler base's punch ability, and every
// fighter built with it). It's three layers: a sharp slap of filtered
// noise for the glove, a low thump for the body hit, and a tiny click at the
// very start for the snap. Heavier punches sound deeper and louder; light,
// rapid jabs (like the BMF's) come out as quicker, higher taps.
// ---------------------------------------------------------------
var lastPunchSound = 0;

function punchWeight(damage) {
  return Math.min(1, Math.max(0.2, damage / 30));
}

function makeNoiseBuffer(ctx, seconds) {
  var buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * seconds), ctx.sampleRate);
  var data = buf.getChannelData(0);
  for (var i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  return buf;
}

// Builds one punch into `out` starting at `now`. Kept separate from
// playPunch so it can also be rendered offline for previews.
function synthPunch(ctx, out, now, weight, noise) {
  var vary = 0.92 + Math.random() * 0.16; // no two punches sound identical

  // Slap: a short burst of noise through a falling low-pass filter.
  var slap = ctx.createBufferSource();
  slap.buffer = noise;
  var lp = ctx.createBiquadFilter();
  lp.type = "lowpass";
  lp.Q.value = 0.8;
  lp.frequency.setValueAtTime((3200 - 1400 * weight) * vary, now);
  lp.frequency.exponentialRampToValueAtTime(350, now + 0.05 + 0.05 * weight);
  var sg = ctx.createGain();
  sg.gain.setValueAtTime(0.0001, now);
  sg.gain.exponentialRampToValueAtTime(0.35 + 0.35 * weight, now + 0.002);
  sg.gain.exponentialRampToValueAtTime(0.0001, now + 0.05 + 0.07 * weight);
  slap.connect(lp); lp.connect(sg); sg.connect(out);
  slap.start(now); slap.stop(now + 0.14);

  // Thump: a low sine that drops in pitch, the weight behind the hit.
  var thump = ctx.createOscillator();
  thump.type = "sine";
  var f0 = (190 - 90 * weight) * vary;
  thump.frequency.setValueAtTime(f0, now);
  thump.frequency.exponentialRampToValueAtTime(f0 * 0.45, now + 0.08 + 0.08 * weight);
  var tg = ctx.createGain();
  tg.gain.setValueAtTime(0.0001, now);
  tg.gain.exponentialRampToValueAtTime(0.2 + 0.55 * weight, now + 0.004);
  tg.gain.exponentialRampToValueAtTime(0.0001, now + 0.08 + 0.12 * weight);
  thump.connect(tg); tg.connect(out);
  thump.start(now); thump.stop(now + 0.25);

  // Snap: a very short high click right at contact.
  var snap = ctx.createOscillator();
  snap.type = "triangle";
  snap.frequency.setValueAtTime(1800 * vary, now);
  snap.frequency.exponentialRampToValueAtTime(600, now + 0.012);
  var cg = ctx.createGain();
  cg.gain.setValueAtTime(0.0001, now);
  cg.gain.exponentialRampToValueAtTime(0.18, now + 0.001);
  cg.gain.exponentialRampToValueAtTime(0.0001, now + 0.015);
  snap.connect(cg); cg.connect(out);
  snap.start(now); snap.stop(now + 0.03);
}

var punchNoise = null;
function playPunch(damage) {
  try {
    var ctx = getAudioCtx();
    if (!ctx) return;
    if (ctx.state === "suspended") ctx.resume();
    var now = ctx.currentTime;
    if (now - lastPunchSound < 0.05) return; // rapid jabs don't pile into a buzz
    lastPunchSound = now;
    if (!punchNoise) punchNoise = makeNoiseBuffer(ctx, 0.2);
    synthPunch(ctx, ctx.destination, now, punchWeight(damage), punchNoise);
  } catch (e) { /* never let audio break the game */ }
}

// A heavy crunch for power-punch wall slams: a low body thud that drops in
// pitch plus a short burst of filtered noise for the crack of the impact.
var noiseBuffer = null;
function playSlam() {
  try {
    var ctx = getAudioCtx();
    if (!ctx) return;
    if (ctx.state === "suspended") ctx.resume();
    var now = ctx.currentTime;

    var thud = ctx.createOscillator();
    thud.type = "sine";
    thud.frequency.setValueAtTime(150, now);
    thud.frequency.exponentialRampToValueAtTime(42, now + 0.22);
    var tg = ctx.createGain();
    tg.gain.setValueAtTime(0.0001, now);
    tg.gain.exponentialRampToValueAtTime(0.7, now + 0.004);
    tg.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);
    thud.connect(tg); tg.connect(ctx.destination);
    thud.start(now); thud.stop(now + 0.3);

    if (!noiseBuffer) {
      noiseBuffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.2), ctx.sampleRate);
      var data = noiseBuffer.getChannelData(0);
      for (var i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    }
    var noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    var bp = ctx.createBiquadFilter();
    bp.type = "lowpass";
    bp.frequency.setValueAtTime(2600, now);
    bp.frequency.exponentialRampToValueAtTime(300, now + 0.12);
    var ng = ctx.createGain();
    ng.gain.setValueAtTime(0.0001, now);
    ng.gain.exponentialRampToValueAtTime(0.45, now + 0.003);
    ng.gain.exponentialRampToValueAtTime(0.0001, now + 0.13);
    noise.connect(bp); bp.connect(ng); ng.connect(ctx.destination);
    noise.start(now); noise.stop(now + 0.15);
  } catch (e) { /* never let audio break the game */ }
}

// ---------------------------------------------------------------
// Charge-up sounds: a rising hum that builds while a fighter charges an
// attack (the Power Puncher's haymaker, Sees Red's rage charge, the
// Watcher's lasers) and cuts off the moment the charge ends or is
// interrupted. Each has its own character: a deep rumble, a snarling
// growl and an electric whine. The game updates them every frame from the
// charge's progress, so they always peak exactly when the charge finishes.
// ---------------------------------------------------------------
var CHARGE_SOUNDS = {
  power:   { wave: "sawtooth", wave2: "square",   f0: 55,  f1: 220,  cut0: 180,  cut1: 2000, q: 5, trem0: 4, trem1: 18, vol0: 0.05, vol1: 0.17 },
  rage:    { wave: "sawtooth", wave2: "sawtooth", f0: 82,  f1: 247,  cut0: 350,  cut1: 3200, q: 3, trem0: 9, trem1: 32, vol0: 0.05, vol1: 0.15 },
  watcher: { wave: "sine",     wave2: "triangle", f0: 330, f1: 1320, cut0: 1500, cut1: 6000, q: 8, trem0: 6, trem1: 24, vol0: 0.03, vol1: 0.10 }
};

function makeChargeVoice(ctx, dest, kind, when) {
  var cfg = CHARGE_SOUNDS[kind];
  var out = ctx.createGain();
  out.gain.setValueAtTime(0.0001, when);
  out.connect(dest);
  // Tremolo: the wobble speeds up as the charge builds.
  var trem = ctx.createGain();
  trem.gain.value = 0.7;
  trem.connect(out);
  var filt = ctx.createBiquadFilter();
  filt.type = "lowpass";
  filt.Q.value = cfg.q;
  filt.frequency.setValueAtTime(cfg.cut0, when);
  filt.connect(trem);
  var o1 = ctx.createOscillator();
  o1.type = cfg.wave;
  o1.frequency.setValueAtTime(cfg.f0, when);
  var o2 = ctx.createOscillator(); // slightly detuned twin for thickness
  o2.type = cfg.wave2;
  o2.frequency.setValueAtTime(cfg.f0 * 1.007, when);
  var g2 = ctx.createGain();
  g2.gain.value = 0.5;
  o1.connect(filt); o2.connect(g2); g2.connect(filt);
  var lfo = ctx.createOscillator();
  lfo.type = "sine";
  lfo.frequency.setValueAtTime(cfg.trem0, when);
  var depth = ctx.createGain();
  depth.gain.value = 0.3;
  lfo.connect(depth); depth.connect(trem.gain);
  o1.start(when); o2.start(when); lfo.start(when);
  return { kind: kind, cfg: cfg, out: out, filt: filt, o1: o1, o2: o2, lfo: lfo };
}

// p is the charge's progress from 0 to 1. Pitch, brightness and wobble
// climb steadily; volume swells hardest near the end.
function setChargeVoice(v, p, when) {
  var c = v.cfg, k = Math.max(0, Math.min(1, p));
  var f = c.f0 * Math.pow(c.f1 / c.f0, k);
  v.o1.frequency.setTargetAtTime(f, when, 0.03);
  v.o2.frequency.setTargetAtTime(f * 1.007, when, 0.03);
  v.filt.frequency.setTargetAtTime(c.cut0 * Math.pow(c.cut1 / c.cut0, k), when, 0.03);
  v.lfo.frequency.setTargetAtTime(c.trem0 + (c.trem1 - c.trem0) * k, when, 0.05);
  v.out.gain.setTargetAtTime(c.vol0 + (c.vol1 - c.vol0) * k * k, when, 0.04);
}

function stopChargeVoice(v, when) {
  v.out.gain.setTargetAtTime(0.0001, when, 0.015);
  [v.o1, v.o2, v.lfo].forEach(function (o) { try { o.stop(when + 0.12); } catch (e) {} });
}

var chargeVoices = [null, null];

// Called every frame for each fighter: kind is "power", "rage", "watcher"
// or null when it isn't charging anything.
function updateChargeSound(id, kind, p) {
  try {
    var v = chargeVoices[id];
    if (v && v.kind !== kind) {
      stopChargeVoice(v, audioCtx.currentTime);
      chargeVoices[id] = v = null;
    }
    if (!kind) return;
    var ctx = getAudioCtx();
    if (!ctx) return;
    if (!v) v = chargeVoices[id] = makeChargeVoice(ctx, ctx.destination, kind, ctx.currentTime);
    setChargeVoice(v, p, ctx.currentTime);
  } catch (e) { /* never let audio break the game */ }
}

function stopAllChargeSounds() {
  for (var i = 0; i < chargeVoices.length; i++) updateChargeSound(i, null, 0);
}
