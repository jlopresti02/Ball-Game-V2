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

// Punches, kicks and other strikes all go through one bus, turned up well
// over everything else and held under a limiter so a flurry can't clip, so
// strikes pop out over the music (Joe). The music itself stays put.
var STRIKE_GAIN = 1.8;
var strikeBus = null;
function strikeOut(ctx) {
  if (strikeBus && strikeBus.context === ctx) return strikeBus;
  var lim = ctx.createDynamicsCompressor();
  lim.threshold.value = -4; lim.knee.value = 2; lim.ratio.value = 16;
  lim.attack.value = 0.002; lim.release.value = 0.12;
  strikeBus = ctx.createGain();
  strikeBus.gain.value = STRIKE_GAIN;
  strikeBus.connect(lim); lim.connect(ctx.destination);
  return strikeBus;
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
    synthPunch(ctx, strikeOut(ctx), now, punchWeight(damage), punchNoise);
  } catch (e) { /* never let audio break the game */ }
}

// BMF jab: a quick swish of air into a tight, bright leather pop, so his
// rapid 5-damage jabs cut through the crowd and sound as fast as they are.
// Used for the BMF and every fighter built on its base (bmfJabs).
var BMF_WHOOSH = 0.045; // the swish leads, the pop lands this much later
function bmfJabs(ch) { return !!ch && (ch.id === "builtin-bmf" || ch.base === "BMF"); }
function synthBmfJab(ctx, out, now, noise) {
  var vary = 0.9 + Math.random() * 0.2;
  var hit = now + BMF_WHOOSH;

  // Whoosh: noise through a band-pass sweeping up as the fist comes in.
  var w = ctx.createBufferSource();
  w.buffer = noise;
  var wf = ctx.createBiquadFilter();
  wf.type = "bandpass";
  wf.Q.value = 2;
  wf.frequency.setValueAtTime(800, now);
  wf.frequency.exponentialRampToValueAtTime(4000, hit);
  var wg = ctx.createGain();
  wg.gain.setValueAtTime(0.0001, now);
  wg.gain.exponentialRampToValueAtTime(0.35, hit - 0.005);
  wg.gain.exponentialRampToValueAtTime(0.0001, hit + 0.01);
  w.connect(wf); wf.connect(wg); wg.connect(out);
  w.start(now); w.stop(hit + 0.02);

  // Pop: a short, bright crack of filtered noise for the glove.
  var s = ctx.createBufferSource();
  s.buffer = noise;
  var bp = ctx.createBiquadFilter();
  bp.type = "bandpass";
  bp.Q.value = 1.2;
  bp.frequency.setValueAtTime(2600 * vary, hit);
  bp.frequency.exponentialRampToValueAtTime(900, hit + 0.04);
  var sg = ctx.createGain();
  sg.gain.setValueAtTime(0.0001, hit);
  sg.gain.exponentialRampToValueAtTime(1.1, hit + 0.001);
  sg.gain.exponentialRampToValueAtTime(0.0001, hit + 0.05);
  s.connect(bp); bp.connect(sg); sg.connect(out);
  s.start(hit); s.stop(hit + 0.07);

  // A small low thud under it so it still lands on something.
  var o = ctx.createOscillator();
  o.type = "sine";
  o.frequency.setValueAtTime(240 * vary, hit);
  o.frequency.exponentialRampToValueAtTime(110, hit + 0.05);
  var og = ctx.createGain();
  og.gain.setValueAtTime(0.0001, hit);
  og.gain.exponentialRampToValueAtTime(0.45, hit + 0.003);
  og.gain.exponentialRampToValueAtTime(0.0001, hit + 0.07);
  o.connect(og); og.connect(out);
  o.start(hit); o.stop(hit + 0.09);
}
function playBmfJab() {
  try {
    var ctx = getAudioCtx();
    if (!ctx) return;
    if (ctx.state === "suspended") ctx.resume();
    var now = ctx.currentTime;
    if (now - lastPunchSound < 0.05) return;
    lastPunchSound = now;
    if (!punchNoise) punchNoise = makeNoiseBuffer(ctx, 0.2);
    synthBmfJab(ctx, strikeOut(ctx), now, punchNoise);
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
    crowdReact(0.5); // slams get the crowd up on top of the hit itself
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

// ---------------------------------------------------------------
// Watcher laser sound: a sharp zap when the beams lock on, then a buzzing
// beam hum for as long as they fire. Each laser adds its own high tone, so
// more lasers sound thicker. A faint sizzle and a fast flicker match the
// beams' shimmer, and the whole thing powers down when the lasers finish.
// ---------------------------------------------------------------
var laserNoise = null;

function playLaserZap(ctx, dest, when) {
  var z = ctx.createOscillator();
  z.type = "sawtooth";
  z.frequency.setValueAtTime(2600, when);
  z.frequency.exponentialRampToValueAtTime(260, when + 0.2);
  var zf = ctx.createBiquadFilter();
  zf.type = "lowpass"; zf.frequency.value = 5000;
  var zg = ctx.createGain();
  zg.gain.setValueAtTime(0.0001, when);
  zg.gain.exponentialRampToValueAtTime(0.2, when + 0.005);
  zg.gain.exponentialRampToValueAtTime(0.0001, when + 0.22);
  z.connect(zf); zf.connect(zg); zg.connect(dest);
  z.start(when); z.stop(when + 0.25);
}

function makeLaserVoice(ctx, dest, lasers, when) {
  playLaserZap(ctx, dest, when);
  var out = ctx.createGain();
  out.gain.setValueAtTime(0.0001, when);
  out.connect(dest);
  // Flicker: a fast wobble in volume, like the beams' shimmer on screen.
  var flick = ctx.createGain();
  flick.gain.value = 0.85;
  flick.connect(out);
  var flickLfo = ctx.createOscillator();
  flickLfo.frequency.value = 23;
  var flickDepth = ctx.createGain();
  flickDepth.gain.value = 0.15;
  flickLfo.connect(flickDepth); flickDepth.connect(flick.gain);

  // Core: a low electric buzz.
  var buzz = ctx.createOscillator();
  buzz.type = "sawtooth";
  buzz.frequency.value = 98;
  var buzzF = ctx.createBiquadFilter();
  buzzF.type = "lowpass"; buzzF.frequency.value = 1200; buzzF.Q.value = 2;
  var buzzG = ctx.createGain();
  buzzG.gain.value = 0.55;
  buzz.connect(buzzF); buzzF.connect(buzzG); buzzG.connect(flick);

  // Beams: one high tone per laser (up to 4), gently warbling.
  var vib = ctx.createOscillator();
  vib.frequency.value = 6.5;
  var vibDepth = ctx.createGain();
  vibDepth.gain.value = 9;
  vib.connect(vibDepth);
  var n = Math.max(1, Math.min(4, Math.round(lasers || 1)));
  var ratios = [1, 1.5, 2.01, 1.26];
  var beams = [];
  for (var i = 0; i < n; i++) {
    var o = ctx.createOscillator();
    o.type = "sine";
    o.frequency.value = 880 * ratios[i];
    vibDepth.connect(o.frequency);
    var g = ctx.createGain();
    g.gain.value = 0.2 / Math.sqrt(n);
    o.connect(g); g.connect(flick);
    beams.push(o);
  }

  // Sizzle: soft high noise, the beam burning where it lands.
  if (!laserNoise) laserNoise = makeNoiseBuffer(ctx, 1);
  var hiss = ctx.createBufferSource();
  hiss.buffer = laserNoise; hiss.loop = true;
  var hissF = ctx.createBiquadFilter();
  hissF.type = "bandpass"; hissF.frequency.value = 3600; hissF.Q.value = 1.4;
  var hissG = ctx.createGain();
  hissG.gain.value = 0.22;
  hiss.connect(hissF); hissF.connect(hissG); hissG.connect(flick);

  var sources = [flickLfo, buzz, vib, hiss].concat(beams);
  sources.forEach(function (src) { src.start(when); });
  return {
    kind: "laser", out: out, sources: sources,
    beams: beams, beamFreqs: beams.map(function (o, i) { return 880 * ratios[i]; }),
    buzz: buzz, buzzF: buzzF, flickLfo: flickLfo, vibDepth: vibDepth
  };
}

// p is how much of the laser time has passed, from 0 to 1. The beam holds
// full strength right to the end; the power-down below handles the finish.
function setLaserVoice(v, p, when) {
  v.out.gain.setTargetAtTime(0.085, when, 0.03);
}

// Power-down when the lasers finish: everything winds down together like a
// machine switching off. The beam tones sag, the buzz drops to a low
// grumble, the flicker slows to a stutter, a falling "whooo" sweeps down
// underneath, and it ends in a soft thunk.
var LASER_POWER_DOWN = 0.9; // seconds

function powerDownLaserVoice(ctx, dest, v, when) {
  var D = LASER_POWER_DOWN;
  v.beams.forEach(function (o, i) {
    o.frequency.cancelScheduledValues(when);
    o.frequency.setValueAtTime(v.beamFreqs[i], when);
    o.frequency.exponentialRampToValueAtTime(v.beamFreqs[i] * 0.2, when + D);
  });
  v.vibDepth.gain.setTargetAtTime(2, when, D / 3);
  v.buzz.frequency.setValueAtTime(98, when);
  v.buzz.frequency.exponentialRampToValueAtTime(32, when + D);
  v.buzzF.frequency.setValueAtTime(1200, when);
  v.buzzF.frequency.exponentialRampToValueAtTime(140, when + D);
  v.flickLfo.frequency.setValueAtTime(23, when);
  v.flickLfo.frequency.exponentialRampToValueAtTime(3, when + D);
  // Holds for a moment, then drains away as it winds down.
  v.out.gain.setTargetAtTime(0.0001, when + D * 0.3, D * 0.22);
  v.sources.forEach(function (src) { try { src.stop(when + D + 0.3); } catch (e) {} });

  // The falling sweep underneath.
  var sw = ctx.createOscillator();
  sw.type = "triangle";
  sw.frequency.setValueAtTime(900, when);
  sw.frequency.exponentialRampToValueAtTime(55, when + D);
  var sg = ctx.createGain();
  sg.gain.setValueAtTime(0.0001, when);
  sg.gain.exponentialRampToValueAtTime(0.09, when + 0.05);
  sg.gain.exponentialRampToValueAtTime(0.0001, when + D);
  sw.connect(sg); sg.connect(dest);
  sw.start(when); sw.stop(when + D + 0.05);

  // The final thunk as it shuts off.
  var t = when + D * 0.82;
  var th = ctx.createOscillator();
  th.type = "sine";
  th.frequency.setValueAtTime(95, t);
  th.frequency.exponentialRampToValueAtTime(38, t + 0.16);
  var tg = ctx.createGain();
  tg.gain.setValueAtTime(0.0001, t);
  tg.gain.exponentialRampToValueAtTime(0.16, t + 0.004);
  tg.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
  th.connect(tg); tg.connect(dest);
  th.start(t); th.stop(t + 0.25);
}

function stopLaserVoice(v, when) {
  v.out.gain.setTargetAtTime(0.0001, when, 0.02);
  v.sources.forEach(function (src) { try { src.stop(when + 0.15); } catch (e) {} });
}

var chargeVoices = [null, null];

// Called every frame for each fighter: kind is "power", "rage", "watcher"
// (charging), "laser" (the Watcher's lasers firing) or null when neither.
// extra is the number of lasers.
function updateChargeSound(id, kind, p, extra) {
  try {
    var v = chargeVoices[id];
    if (v && v.kind !== kind) {
      // Lasers that finish (or win the match) power down; a charge that
      // ends just cuts off, since its attack's own sound takes over.
      if (v.kind === "laser") powerDownLaserVoice(audioCtx, audioCtx.destination, v, audioCtx.currentTime);
      else stopChargeVoice(v, audioCtx.currentTime);
      chargeVoices[id] = v = null;
    }
    if (!kind) return;
    var ctx = getAudioCtx();
    if (!ctx) return;
    var now = ctx.currentTime;
    if (!v) {
      v = chargeVoices[id] = kind === "laser"
        ? makeLaserVoice(ctx, ctx.destination, extra, now)
        : makeChargeVoice(ctx, ctx.destination, kind, now);
    }
    if (kind === "laser") setLaserVoice(v, p, now);
    else setChargeVoice(v, p, now);
  } catch (e) { /* never let audio break the game */ }
}

// Leaving the game screen or restarting the match cuts every looping sound
// off at once, with no power-down.
function stopAllChargeSounds() {
  try {
    for (var i = 0; i < chargeVoices.length; i++) {
      var v = chargeVoices[i];
      if (!v) continue;
      if (v.kind === "laser") stopLaserVoice(v, audioCtx.currentTime);
      else stopChargeVoice(v, audioCtx.currentTime);
      chargeVoices[i] = null;
    }
  } catch (e) { /* never let audio break the game */ }
}

// ---------------------------------------------------------------
// CTE sounds: a big air whoosh as each wild swing is thrown (it plays
// whether it lands or not; a hit adds the punch sound on top), and a soft
// rising shimmer when CTE forgets some damage and heals.
// ---------------------------------------------------------------
var whooshNoise = null;
function synthWhoosh(ctx, dest, now) {
  if (!whooshNoise) whooshNoise = makeNoiseBuffer(ctx, 0.4);
  var src = ctx.createBufferSource();
  src.buffer = whooshNoise;
  var bp = ctx.createBiquadFilter();
  bp.type = "bandpass"; bp.Q.value = 1.2;
  bp.frequency.setValueAtTime(500, now);
  bp.frequency.exponentialRampToValueAtTime(1900, now + 0.16);
  var g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, now);
  g.gain.exponentialRampToValueAtTime(0.32, now + 0.07);
  g.gain.exponentialRampToValueAtTime(0.0001, now + 0.24);
  src.connect(bp); bp.connect(g); g.connect(dest);
  src.start(now); src.stop(now + 0.3);
}
function playWhoosh() {
  try {
    var ctx = getAudioCtx();
    if (!ctx) return;
    if (ctx.state === "suspended") ctx.resume();
    synthWhoosh(ctx, ctx.destination, ctx.currentTime);
  } catch (e) { /* never let audio break the game */ }
}

function synthForget(ctx, dest, now) {
  [0, 0.09, 0.18].forEach(function (off, i) {
    var o = ctx.createOscillator();
    o.type = "sine";
    var f = [523, 659, 880][i];
    o.frequency.setValueAtTime(f, now + off);
    o.frequency.exponentialRampToValueAtTime(f * 1.02, now + off + 0.3);
    var g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, now + off);
    g.gain.exponentialRampToValueAtTime(0.09, now + off + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, now + off + 0.45);
    o.connect(g); g.connect(dest);
    o.start(now + off); o.stop(now + off + 0.5);
  });
}
function playForget() {
  try {
    var ctx = getAudioCtx();
    if (!ctx) return;
    if (ctx.state === "suspended") ctx.resume();
    synthForget(ctx, ctx.destination, ctx.currentTime);
  } catch (e) { /* never let audio break the game */ }
}

// ---------------------------------------------------------------
// Recorded clips: unlike the synthesized sounds above, these are real
// recordings inlined as MP3 data URLs (sound-clips.js). Each is decoded once
// into a buffer; decoding starts when the match screen opens so the clips
// are ready by the time Start is tapped.
// ---------------------------------------------------------------
var clipBuffers = {}, clipLoading = {}, clipWaiting = {};
// Calls cb(buffer) once the clip named `name` (from SOUND_CLIPS) is decoded.
function withClip(name, cb) {
  try {
    var ctx = getAudioCtx();
    if (!ctx || typeof SOUND_CLIPS === "undefined" || !SOUND_CLIPS[name]) return;
    if (clipBuffers[name]) { if (cb) cb(clipBuffers[name]); return; }
    if (cb) (clipWaiting[name] = clipWaiting[name] || []).push(cb);
    if (clipLoading[name]) return;
    clipLoading[name] = true;
    var src = SOUND_CLIPS[name];
    var bin = atob(src.slice(src.indexOf(",") + 1)), bytes = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    var done = function (buf) {
      clipBuffers[name] = buf; clipLoading[name] = false;
      var waiting = clipWaiting[name] || [];
      clipWaiting[name] = [];
      waiting.forEach(function (f) { f(buf); });
    };
    var fail = function () { clipLoading[name] = false; clipWaiting[name] = []; };
    // Older Safari only supports the callback form of decodeAudioData.
    var p = ctx.decodeAudioData(bytes.buffer, done, fail);
    if (p && p.catch) p.catch(fail);
  } catch (e) { clipLoading[name] = false; }
}
function loadSoundClips() { ["hereWeGo", "crowd", "knockout", "doBronx", "cameraFlash", "igbb", "smashYourBoy", "chairShot", "ganeBatCall", "ganePokeCall", "ganeHerbDean", "eagleScreech", "truckHorn", "freeBird", "usaChant", "gaethjeCommentary", "refWhistle", "charlesTakedown", "auraFarm", "bullThrown", "bullCharge", "batCrack", "impactPunch1", "impactPunch2", "goatBaa1", "goatBaa2", "jonBaa"].concat(HOKIT_TAUNTS).forEach(function (n) { withClip(n); }); }

// "Here we go!": the announcer call that opens every fight.
// The referee's whistle as the fight starts (with "Here we go!").
function playStartWhistle() {
  try {
    var ctx = getAudioCtx();
    if (!ctx) return;
    if (ctx.state === "suspended") ctx.resume();
    withClip("refWhistle", function () { playClip("refWhistle", 0.55); });
  } catch (e) { /* never let audio break the game */ }
}
// "Here we go!" opens Justin Gaethje's All American special: it plays as the
// special starts, and Free Bird kicks in 1 second after it (Joe's call; they
// overlap). It cuts in on the talk channel so it's never skipped.
var HERE_WE_GO_LEAD = 1;
var hereWeGoAt = -10;
function playHereWeGo() {
  try {
    var ctx = getAudioCtx();
    if (!ctx) return;
    if (ctx.state === "suspended") ctx.resume();
    if (!clipBuffers.hereWeGo) { withClip("hereWeGo"); return; }
    if (cutInTalk("hereWeGo", 0.8)) hereWeGoAt = talkCutAt || ctx.currentTime;
  } catch (e) { /* never let audio break the game */ }
}

// Knockout: the arena erupting, for every win that isn't a submission. The
// clip has its own crowd in it, so the looping crowd ducks under it.
function playKnockout() {
  crowdReact(1); // the stands go up (the looping crowd itself ducks under the clip)
  try {
    var ctx = getAudioCtx();
    if (!ctx) return;
    withClip("knockout", function (buf) {
      if (!cutInTalk("knockout", 0.85)) return;
      var at = talkCutAt; // later than now if Gane's Herb Dean line is still going
      var c = crowd;
      if (c && c.gain) {
        c.duckUntil = at + buf.duration - 1;
        c.gain.gain.cancelScheduledValues(ctx.currentTime);
        c.gain.gain.setTargetAtTime(CROWD_FLOOR * 0.4, at, 0.1);
      }
    });
  } catch (e) { /* never let audio break the game */ }
}

// Plays a decoded clip once at `when` (default now). Returns the source, or
// null if it isn't decoded yet.
function playClip(name, gain, when, rate) {
  var ctx = audioCtx, buf = clipBuffers[name];
  if (!ctx || !buf) return null;
  var src = ctx.createBufferSource();
  src.buffer = buf;
  if (rate) src.playbackRate.value = rate;
  var g = ctx.createGain();
  g.gain.value = gain;
  src.connect(g); g.connect(ctx.destination);
  src.start(when || ctx.currentTime);
  return src;
}

// Talking clips (fighters and announcers) never overlap. One plays at a
// time: if another line comes up while one is going and it's due to end
// within TALK_WAIT seconds, the new line waits and plays right after it.
// Otherwise the new line is skipped. The big moments (the knockout call and
// Do Bronx) cut in instead: they stop whatever line is going. A priority line
// (Gane's Herb Dean special) outranks all of them: it cuts in, and nothing
// cuts it off; a cut-in waits for it to finish instead.
var TALK_WAIT = 1.5;  // how long a line will wait for the current one to finish
var TALK_GAP = 0.15;  // breath between two lines
var talkSrcs = [], talkEnd = 0, talkQueued = false;
var talkPriorityEnd = 0; // a priority line is playing until then
var talkCutAt = 0;       // when the last cut-in actually starts
// Plays `name` on the talk channel. Returns false if it was skipped.
function playTalk(name, gain) {
  var ctx = audioCtx, buf = clipBuffers[name];
  if (!ctx || !buf) return false;
  var now = ctx.currentTime, at = now;
  if (now < talkEnd) {
    if (talkQueued || talkEnd - now > TALK_WAIT) return false;
    at = talkEnd + TALK_GAP;
    talkQueued = true;
  } else {
    talkQueued = false;
    talkSrcs = [];
  }
  var src = playClip(name, gain, at);
  if (!src) return false;
  talkSrcs.push(src);
  talkEnd = at + buf.duration;
  talkDuck(name, at, talkEnd);
  return true;
}
// Clips on the talk channel that are the crowd cheering, not someone talking:
// the music plays straight through them (Joe: cheers must never mute it).
var TALK_CHEERS = { knockout: true, doBronx: true };
function talkDuck(name, at, until) {
  if (TALK_CHEERS[name]) unduckMusic(at); // and back up if a cut-off line had it down
  else duckMusic(at, until);
}
// Cuts in on the talk channel: whatever line is going (or waiting) stops.
// While a priority line is going, it plays right after it instead.
function cutInTalk(name, gain) {
  var now = audioCtx.currentTime;
  if (now < talkPriorityEnd) {
    var at = talkEnd + TALK_GAP, later = playClip(name, gain, at);
    if (!later) return null;
    talkSrcs.push(later); talkQueued = true;
    talkEnd = at + clipBuffers[name].duration;
    talkCutAt = at;
    talkDuck(name, at, talkEnd);
    return later;
  }
  stopTalk();
  var src = playClip(name, gain);
  if (!src) return null;
  talkSrcs = [src];
  talkEnd = now + clipBuffers[name].duration;
  talkCutAt = now;
  talkDuck(name, now, talkEnd);
  return src;
}
// A priority line: cuts in on everything, and nothing cuts it off.
function playPriorityTalk(name, gain) {
  stopTalk();
  var src = playClip(name, gain);
  if (!src) return null;
  talkSrcs = [src];
  talkEnd = talkPriorityEnd = audioCtx.currentTime + clipBuffers[name].duration;
  duckMusic(audioCtx.currentTime, talkEnd);
  return src;
}
function stopTalk() {
  talkSrcs.forEach(function (src) { try { src.stop(); } catch (e) { /* already stopped */ } });
  talkSrcs = []; talkEnd = 0; talkQueued = false; talkPriorityEnd = 0;
}

// Do Bronx (dobronx.js): "Charrrles... Do... BRONX!" from the start of the
// opening pose, timed so "Bronx" lands on the camera flash DO_BRONX_HIT
// seconds in. The clip's own crowd fades out after a few seconds, and the
// looping crowd takes over going wild for as long as the Do Bronx state lasts.
var DO_BRONX_HIT = 3.0;
var doBronxSrc = null, doBronxMusicTimer = 0;
function playDoBronx() {
  try {
    var ctx = getAudioCtx();
    if (!ctx) return;
    if (ctx.state === "suspended") ctx.resume();
    stopDoBronx();
    doBronxSrc = cutInTalk("doBronx", 0.85);
    var buf = clipBuffers.doBronx;
    // The background music goes off for the clip and comes back as soon as
    // it's finished (Joe; music.js).
    holdMusicOff();
    var token = doBronxSrc;
    clearTimeout(doBronxMusicTimer);
    doBronxMusicTimer = setTimeout(function () { if (doBronxSrc === token) releaseMusic(); }, (buf ? buf.duration : DO_BRONX_HIT) * 1000);
    // Take over just as the clip starts fading.
    crowdHold(buf ? buf.duration - 1.4 : DO_BRONX_HIT);
  } catch (e) { /* never let audio break the game */ }
}
function stopDoBronx() {
  clearTimeout(doBronxMusicTimer);
  if (!doBronxSrc) return;
  try { doBronxSrc.stop(); } catch (e) { /* already stopped */ }
  doBronxSrc = null;
}

// "It's gonna be bad": the IGBB special going off. If the move gets called
// off and restarted, the line doesn't repeat right away.
var lastIgbbLine = -10;
function playIgbbLine() {
  try {
    var ctx = getAudioCtx();
    if (!ctx) return;
    if (ctx.state === "suspended") ctx.resume();
    if (ctx.currentTime - lastIgbbLine < 5) return;
    lastIgbbLine = ctx.currentTime;
    playTalk("igbb", 0.9);
  } catch (e) { /* never let audio break the game */ }
}

// "I'm gonna smash your boy": Father's Plan (Khabib) as the ground and
// pound starts.
function playSmashLine() {
  try {
    var ctx = getAudioCtx();
    if (!ctx) return;
    if (ctx.state === "suspended") ctx.resume();
    playTalk("smashYourBoy", 0.9);
  } catch (e) { /* never let audio break the game */ }
}

// The chair shot's CLANG (Josh Hokit's Chair Shot), the moment it lands.
function playChairShot() {
  try {
    var ctx = getAudioCtx();
    if (!ctx) return;
    if (ctx.state === "suspended") ctx.resume();
    playClip("chairShot", 1);
  } catch (e) { /* never let audio break the game */ }
}

// Charles Oliveira's call, the first time in a fight he shoots a takedown
// that isn't going into a submission attempt (so not in Do Bronx). It's a
// talking clip: if another line is going it waits for the next shot.
function playCharlesTakedownCall() {
  if (!audioCtx || !clipBuffers.charlesTakedown) { withClip("charlesTakedown"); return false; }
  return playTalk("charlesTakedown", 0.85);
}

// The commentators going off the first time Gane lands the bat
// ("ganeBatCall") or an eye poke ("ganePokeCall") in Cheater mode
// (cheater.js). The fades are in the clips themselves. Returns false if the
// line got skipped, so it can be tried again on the next one.
// Herb Dean's white cane (herbdean.js): a cheap, rickety plastic one. A
// quick swish as he brings it down (playCaneSwish, at the start of the
// strike), then on contact a dull hollow plastic pok with the cane's loose
// folding joints rattling a few times after it (playCaneWhack).
function caneNoise(ctx) { if (!punchNoise) punchNoise = makeNoiseBuffer(ctx, 0.2); return punchNoise; }
function caneBurst(ctx, t, freq, q, peak, dur) {
  var s = ctx.createBufferSource();
  s.buffer = caneNoise(ctx);
  var f = ctx.createBiquadFilter();
  f.type = "bandpass"; f.Q.value = q; f.frequency.value = freq;
  var g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(peak, t + 0.001);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  s.connect(f); f.connect(g); g.connect(strikeOut(ctx));
  s.start(t); s.stop(t + dur + 0.02);
}
function caneTone(ctx, t, type, f0, f1, peak, dur) {
  var o = ctx.createOscillator();
  o.type = type;
  o.frequency.setValueAtTime(f0, t);
  o.frequency.exponentialRampToValueAtTime(f1, t + dur);
  var g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(peak, t + 0.002);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g); g.connect(strikeOut(ctx));
  o.start(t); o.stop(t + dur + 0.02);
}
// One plastic pok: the dull hollow tube plus a papery top end.
function canePok(ctx, t, v, peak) {
  caneBurst(ctx, t, 2300 * v, 0.9, peak, 0.035);
  caneBurst(ctx, t, 5200 * v, 1.2, peak * 0.35, 0.02);
  caneTone(ctx, t, "triangle", 1350 * v, 1100 * v, peak * 0.28, 0.05);
}
function playCaneSwish() {
  try {
    var ctx = getAudioCtx();
    if (!ctx) return;
    if (ctx.state === "suspended") ctx.resume();
    var now = ctx.currentTime, end = now + 0.08;
    var w = ctx.createBufferSource();
    w.buffer = caneNoise(ctx);
    var f = ctx.createBiquadFilter();
    f.type = "bandpass"; f.Q.value = 3;
    f.frequency.setValueAtTime(600, now);
    f.frequency.exponentialRampToValueAtTime(3000, end);
    var g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(0.22, end - 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, end + 0.01);
    w.connect(f); f.connect(g); g.connect(strikeOut(ctx));
    w.start(now); w.stop(end + 0.03);
  } catch (e) { /* never let audio break the game */ }
}
function playCaneWhack() {
  try {
    var ctx = getAudioCtx();
    if (!ctx) return;
    if (ctx.state === "suspended") ctx.resume();
    var now = ctx.currentTime, v = 0.94 + Math.random() * 0.12;
    canePok(ctx, now, v, 0.9);
    caneTone(ctx, now, "sine", 210 * v, 120, 0.25, 0.06); // light, not much behind it
    // The rattle: a few smaller poks, quieter and quicker each time.
    var dt = 0.022, pk = 0.42;
    for (var k = 0; k < 4; k++) {
      dt *= 0.85 + Math.random() * 0.4; pk *= 0.62;
      canePok(ctx, now + 0.03 + k * dt * 1.6, v * (1.15 + Math.random() * 0.2), pk);
    }
  } catch (e) { /* never let audio break the game */ }
}

// Ciryl Gane's bat (the Herb Dean special and Cheater mode): a heavy swing
// whoosh into a deep, meaty thud of the bat sinking in. A big one (the HOME
// RUN) gets a sharp crack on top. Joe picked this one (option C).
var BAT_GAIN = 0.5;
function playBatHit(big) {
  try {
    var ctx = getAudioCtx();
    if (!ctx) return;
    if (ctx.state === "suspended") ctx.resume();
    var now = ctx.currentTime, hit = now + 0.06; // the whoosh leads in
    var v = 0.9 + Math.random() * 0.2, k = (big ? 1.3 : 1) * BAT_GAIN;
    var w = ctx.createBufferSource();
    w.buffer = caneNoise(ctx);
    var f = ctx.createBiquadFilter();
    f.type = "bandpass"; f.Q.value = 2;
    f.frequency.setValueAtTime(300, now);
    f.frequency.exponentialRampToValueAtTime(1600, hit);
    var g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(0.35 * k, hit - 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, hit + 0.015);
    w.connect(f); f.connect(g); g.connect(strikeOut(ctx));
    w.start(now); w.stop(hit + 0.03);
    caneBurst(ctx, hit, 900 * v, 0.8, 0.8 * k, 0.08);              // the slap of it landing
    caneTone(ctx, hit, "sine", 95 * v, 42, 0.9 * k, big ? 0.35 : 0.2); // the weight
    caneTone(ctx, hit, "triangle", 240 * v, 120, 0.3 * k, 0.1);
    if (big) {
      caneBurst(ctx, hit, 2600, 1.2, 0.9 * BAT_GAIN, 0.08);
      caneTone(ctx, hit, "triangle", 600, 420, 0.35 * BAT_GAIN, 0.14);
    }
  } catch (e) { /* never let audio break the game */ }
}

// The critical weave combo (weave.js): an anime flurry. Each quick punch is
// a sharp slap riding a short whoosh; the last, launching one comes in on a
// bigger whoosh and lands with a deep boom and a short echo. Joe picked this
// one (option B).
var CRIT_GAIN = 0.68;
function playCritPunch(last) {
  try {
    var ctx = getAudioCtx();
    if (!ctx) return;
    if (ctx.state === "suspended") ctx.resume();
    var now = ctx.currentTime, lead = last ? 0.06 : 0.03, hit = now + lead;
    var v = 0.95 + Math.random() * 0.1, k = CRIT_GAIN;
    var w = ctx.createBufferSource();
    w.buffer = caneNoise(ctx);
    var f = ctx.createBiquadFilter();
    f.type = "bandpass"; f.Q.value = 2;
    f.frequency.setValueAtTime(700, now);
    f.frequency.exponentialRampToValueAtTime(last ? 2000 : 4500, hit);
    var g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime((last ? 0.4 : 0.28) * k, hit - 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, hit + 0.012);
    w.connect(f); f.connect(g); g.connect(strikeOut(ctx));
    w.start(now); w.stop(hit + 0.03);
    if (!last) {
      caneBurst(ctx, hit, 3800 * v, 1.0, 0.7 * k, 0.03);
      caneBurst(ctx, hit, 1200 * v, 1.0, 0.35 * k, 0.04);
    } else {
      caneBurst(ctx, hit, 1600, 0.7, 1.0 * k, 0.12);
      caneTone(ctx, hit, "sine", 90, 34, 1.0 * k, 0.6); // the boom
      [0.11, 0.22, 0.33].forEach(function (d, i) { caneBurst(ctx, hit + d, 1400, 0.8, 0.28 / (i + 1) * k, 0.1); }); // echo
    }
  } catch (e) { /* never let audio break the game */ }
}

// Random fight commentary, only when Justin Gaethje is fighting: the UFC
// call from his Michael Johnson fight comes in once per fight, at a random
// moment between COMMENTARY_AT seconds in. It's a talking clip, so it follows
// the same rule as the other lines (waits for one about to finish, else is
// skipped); a skipped call isn't used up, it tries again a moment later.
var COMMENTARY_AT = [6, 18];
var commentary = { t: 0, next: 0, done: false };
function resetCommentary() {
  commentary.t = 0; commentary.done = false;
  commentary.next = COMMENTARY_AT[0] + Math.random() * (COMMENTARY_AT[1] - COMMENTARY_AT[0]);
}
function gaethjeFighting() {
  return balls.some(function (b) { return b.char && String(b.char.id).indexOf("c-justin-gaethje") === 0; });
}
function tickCommentary(dt) {
  if (commentary.done || !started || over || !gaethjeFighting()) return;
  commentary.t += dt;
  if (commentary.t < commentary.next) return;
  if (playTalk("gaethjeCommentary", 0.8)) commentary.done = true;
  else commentary.next = commentary.t + 2;
}

// A short band-passed whoosh into `hit` (the big swings below).
function swingWhoosh(ctx, now, hit, f0, f1, gain) {
  var w = ctx.createBufferSource();
  w.buffer = caneNoise(ctx);
  var f = ctx.createBiquadFilter();
  f.type = "bandpass"; f.Q.value = 2;
  f.frequency.setValueAtTime(f0, now);
  f.frequency.exponentialRampToValueAtTime(f1, hit);
  var g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, now);
  g.gain.exponentialRampToValueAtTime(gain, hit - 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, hit + 0.012);
  w.connect(f); f.connect(g); g.connect(strikeOut(ctx));
  w.start(now); w.stop(hit + 0.03);
}
// The CTE haymaker landing (cte.js; Gaethje's dizzying one too): a bone
// rattler, a huge low crunch with a short boom after it. Joe picked this
// one (option B). The swing's own whoosh already plays at the strike.
var HAYMAKER_GAIN = 0.68;
function playHaymaker() {
  try {
    var ctx = getAudioCtx();
    if (!ctx) return;
    if (ctx.state === "suspended") ctx.resume();
    var t = ctx.currentTime, k = HAYMAKER_GAIN;
    caneBurst(ctx, t, 900, 0.7, 1.0 * k, 0.12);
    caneBurst(ctx, t + 0.008, 2800, 1.4, 0.6 * k, 0.05);
    caneTone(ctx, t, "sine", 95, 35, 1.0 * k, 0.5);
    [0.09, 0.18].forEach(function (d, i) { caneBurst(ctx, t + d, 700, 0.8, 0.3 / (i + 1) * k, 0.12); });
  } catch (e) { /* never let audio break the game */ }
}
// A landed kick (abilities.js): a leg kick slap, a quick whoosh into a sharp,
// stinging shin-on-skin slap. Joe picked this one (option A).
var KICK_GAIN = 0.9;
function playKick() {
  try {
    var ctx = getAudioCtx();
    if (!ctx) return;
    if (ctx.state === "suspended") ctx.resume();
    var now = ctx.currentTime, hit = now + 0.05, v = 0.94 + Math.random() * 0.12, k = KICK_GAIN;
    swingWhoosh(ctx, now, hit, 500, 2600, 0.25 * k);
    caneBurst(ctx, hit, 3000 * v, 0.9, 1.0 * k, 0.05);
    caneBurst(ctx, hit, 1400 * v, 1.0, 0.5 * k, 0.07);
    caneTone(ctx, hit, "sine", 170 * v, 80, 0.45 * k, 0.12);
  } catch (e) { /* never let audio break the game */ }
}

// Gane's Herb Dean special: Joe's clip as the special starts, as a priority
// line, so no other talking clip cuts it off or plays over it. The looping
// crowd sits down under it, then swells back up as the clip fades out
// (HERB_LINE_BLEND seconds before its end), so one hands over to the other.
var HERB_LINE_BLEND = 1.6;
function playHerbDeanLine() {
  try {
    var ctx = getAudioCtx();
    if (!ctx) return;
    if (ctx.state === "suspended") ctx.resume();
    withClip("ganeHerbDean", function (buf) {
      var src = playPriorityTalk("ganeHerbDean", 0.9);
      if (!src) return;
      var now = ctx.currentTime, c = crowd;
      if (c && c.gain) {
        c.duckUntil = now + buf.duration - HERB_LINE_BLEND;
        c.gain.gain.cancelScheduledValues(now);
        c.gain.gain.setTargetAtTime(CROWD_FLOOR * 0.6, now, 0.3);
      }
      setTimeout(function () {
        if (talkSrcs[0] === src) crowdReact(0.6); // still ours: the stands come back up
      }, (buf.duration - HERB_LINE_BLEND) * 1000);
    });
  } catch (e) { /* never let audio break the game */ }
}
function playGaneCall(name) {
  try {
    var ctx = getAudioCtx();
    if (!ctx) return false;
    if (ctx.state === "suspended") ctx.resume();
    return playTalk(name, 0.9);
  } catch (e) { return false; /* never let audio break the game */ }
}

// Josh Hokit's trash talk: each thumbs down plays one of these at random,
// never the same one twice in a row (on the talk channel, so it waits or
// stays quiet while someone else is talking).
var HOKIT_TAUNTS = ["hokitKnee", "hokitDog", "hokitDivision", "hokitWeights", "hokitPlan"];
var lastHokitLine = -1;
function playHokitTaunt() {
  try {
    var ctx = getAudioCtx();
    if (!ctx) return;
    if (ctx.state === "suspended") ctx.resume();
    var pick = Math.floor(Math.random() * (HOKIT_TAUNTS.length - (lastHokitLine < 0 ? 0 : 1)));
    if (lastHokitLine >= 0 && pick >= lastHokitLine) pick++;
    var name = HOKIT_TAUNTS[pick], buf = clipBuffers[name];
    if (!buf) { withClip(name); return; }
    if (playTalk(name, 0.9)) lastHokitLine = pick;
  } catch (e) { /* never let audio break the game */ }
}

// A bald eagle's scream: Joe's recording, a touch higher or lower each time.
// Until it's decoded, a synthesized cry stands in.
function playEagleScreech() {
  try {
    var ctx = getAudioCtx();
    if (!ctx) return;
    if (ctx.state === "suspended") ctx.resume();
    var now = ctx.currentTime;
    if (playClip("eagleScreech", 0.8, now, 0.92 + Math.random() * 0.16)) return; // Joe's recording (the synth below is the stand-in)
    [[0, 0.42, 1], [0.48, 0.24, 0.8]].forEach(function (c) {
      var t0 = now + c[0], len = c[1];
      var o = ctx.createOscillator(), o2 = ctx.createOscillator(), lfo = ctx.createOscillator(), lg = ctx.createGain();
      o.type = "sawtooth"; o2.type = "square";
      o.frequency.setValueAtTime(2300, t0); o.frequency.exponentialRampToValueAtTime(1500, t0 + len);
      o2.frequency.setValueAtTime(2330, t0); o2.frequency.exponentialRampToValueAtTime(1480, t0 + len);
      lfo.frequency.value = 38; lg.gain.value = 120;
      lfo.connect(lg); lg.connect(o.frequency); lg.connect(o2.frequency);
      var bp = ctx.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = 2600; bp.Q.value = 2;
      var g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(0.16 * c[2], t0 + 0.04);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + len);
      o.connect(bp); o2.connect(bp); bp.connect(g); g.connect(ctx.destination);
      [o, o2, lfo].forEach(function (n) { n.start(t0); n.stop(t0 + len + 0.05); });
    });
  } catch (e) { /* never let audio break the game */ }
}

// The Free Bird solo, out on the highway in All American: the crowd drops
// away to nothing and the solo comes in; back in the cage it fades out and
// the crowd comes back up.
var freeBirdPlaying = null; // { src, gain }
function playFreeBird() {
  try {
    var ctx = getAudioCtx();
    if (!ctx) return;
    if (ctx.state === "suspended") ctx.resume();
    stopFreeBird(0);
    var buf = clipBuffers.freeBird;
    if (!buf) { withClip("freeBird"); return; }
    var now = ctx.currentTime, c = crowd;
    // 1s after "Here we go!" if that just played (it opens the special).
    if (now - hereWeGoAt < 4) now = Math.max(now, hereWeGoAt + HERE_WE_GO_LEAD);
    if (c && c.gain) {
      c.duckUntil = now + 60; // held down until the solo stops
      c.gain.gain.cancelScheduledValues(now);
      c.gain.gain.setTargetAtTime(0.0001, now, 0.08);
    }
    var src = ctx.createBufferSource(), g = ctx.createGain();
    src.buffer = buf;
    g.gain.setValueAtTime(0.0001, now); g.gain.exponentialRampToValueAtTime(0.9, now + 0.12);
    src.connect(g); g.connect(ctx.destination);
    src.start(now);
    freeBirdPlaying = { src: src, gain: g, at: now };
  } catch (e) { /* never let audio break the game */ }
}
// Seconds until the solo actually starts (it can be waiting on "Here we go!").
function freeBirdWait() {
  var fb = freeBirdPlaying;
  return fb && audioCtx ? Math.max(0, fb.at - audioCtx.currentTime) : 0;
}
function stopFreeBird(fade) {
  try {
    var fb = freeBirdPlaying;
    if (!fb || !audioCtx) return;
    freeBirdPlaying = null;
    var now = audioCtx.currentTime, f = fade == null ? 0.6 : fade;
    fb.gain.gain.cancelScheduledValues(now);
    fb.gain.gain.setValueAtTime(fb.gain.gain.value || 0.9, now);
    fb.gain.gain.linearRampToValueAtTime(0, now + f + 0.01);
    fb.src.stop(now + f + 0.05);
    if (crowd) { crowd.duckUntil = now; crowdReact(0.8); } // the arena's back
  } catch (e) { /* never let audio break the game */ }
}

// "U-S-A! U-S-A!": the chant comes straight in loud the moment the truck
// hits, holds for a couple of chants, and fades away.
function playUsaChant() {
  try {
    var ctx = getAudioCtx();
    if (!ctx) return;
    if (ctx.state === "suspended") ctx.resume();
    var buf = clipBuffers.usaChant;
    if (!buf) { withClip("usaChant"); return; }
    var now = ctx.currentTime, g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(1.0, now + 0.08);
    g.gain.setValueAtTime(1.0, now + 1.6);
    g.gain.exponentialRampToValueAtTime(0.0001, now + buf.duration);
    g.connect(ctx.destination);
    var src = ctx.createBufferSource();
    src.buffer = buf; src.connect(g);
    src.start(now);
  } catch (e) { /* never let audio break the game */ }
}

// The truck hitting them: a deep boom you feel more than hear, a crunch of
// metal on body, a ringing clang off the grille, and glass shattering and
// skittering across the road after it.
function playTruckImpact() {
  try {
    var ctx = getAudioCtx();
    if (!ctx) return;
    if (ctx.state === "suspended") ctx.resume();
    var now = ctx.currentTime, out = ctx.createDynamicsCompressor();
    out.threshold.value = -10; out.ratio.value = 6;
    var master = ctx.createGain(); master.gain.value = 1.1;
    out.connect(master); master.connect(ctx.destination);
    var noise = makeNoiseBuffer(ctx, 1.6);
    // Boom: a sub thump dropping in pitch.
    var b = ctx.createOscillator(), bg = ctx.createGain();
    b.type = "sine"; b.frequency.setValueAtTime(95, now); b.frequency.exponentialRampToValueAtTime(28, now + 0.6);
    bg.gain.setValueAtTime(0.0001, now); bg.gain.exponentialRampToValueAtTime(1.0, now + 0.01); bg.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);
    b.connect(bg); bg.connect(out); b.start(now); b.stop(now + 0.85);
    // Crunch: a hard burst of low, distorted noise.
    var cn = ctx.createBufferSource(), clp = ctx.createBiquadFilter(), cg = ctx.createGain(), sh = ctx.createWaveShaper();
    var curve = new Float32Array(256);
    for (var i = 0; i < 256; i++) { var x = i / 128 - 1; curve[i] = Math.tanh(x * 6); }
    sh.curve = curve;
    cn.buffer = noise; clp.type = "lowpass"; clp.frequency.setValueAtTime(2600, now); clp.frequency.exponentialRampToValueAtTime(300, now + 0.45);
    cg.gain.setValueAtTime(0.0001, now); cg.gain.exponentialRampToValueAtTime(0.9, now + 0.005); cg.gain.exponentialRampToValueAtTime(0.0001, now + 0.55);
    cn.connect(sh); sh.connect(clp); clp.connect(cg); cg.connect(out); cn.start(now); cn.stop(now + 0.6);
    // Clang: inharmonic metal partials ringing off.
    [182, 431, 697, 1123, 1580].forEach(function (f, k) {
      var o = ctx.createOscillator(), g = ctx.createGain();
      o.type = k % 2 ? "square" : "triangle"; o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, now); g.gain.exponentialRampToValueAtTime(0.12 / (k + 1) + 0.04, now + 0.004);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.5 + 0.25 * (5 - k) / 5);
      o.connect(g); g.connect(out); o.start(now); o.stop(now + 0.8);
    });
    // Glass: bright noise bursts and tinkling bits scattering for a second.
    for (var j = 0; j < 22; j++) {
      var t0 = now + 0.02 + (j < 4 ? j * 0.015 : Math.pow(Math.random(), 1.6) * 1.1);
      var gs = ctx.createBufferSource(), hp = ctx.createBiquadFilter(), gg = ctx.createGain();
      gs.buffer = noise; hp.type = "bandpass"; hp.frequency.value = 3500 + Math.random() * 5000; hp.Q.value = 6 + Math.random() * 10;
      var len = j < 4 ? 0.18 : 0.03 + Math.random() * 0.06, vol = j < 4 ? 0.7 : 0.15 + Math.random() * 0.25;
      gg.gain.setValueAtTime(0.0001, t0); gg.gain.exponentialRampToValueAtTime(vol, t0 + 0.003); gg.gain.exponentialRampToValueAtTime(0.0001, t0 + len);
      gs.connect(hp); hp.connect(gg); gg.connect(out); gs.start(t0, Math.random() * 1.2); gs.stop(t0 + len + 0.02);
    }
  } catch (e) { /* never let audio break the game */ }
}

// The truck bearing down: Joe's air horn (two blasts) over a diesel engine
// roaring up as it gets closer, peaking as it hits (about 1.9s in).
function playTruckHorn() {
  try {
    var ctx = getAudioCtx();
    if (!ctx) return;
    if (ctx.state === "suspended") ctx.resume();
    var now = ctx.currentTime;
    if (!playClip("truckHorn", 0.9, now)) { // Joe's air horn (the synth is the stand-in)
      var hg = ctx.createGain(), lp = ctx.createBiquadFilter();
      lp.type = "lowpass"; lp.frequency.value = 2200;
      hg.gain.setValueAtTime(0.0001, now);
      hg.gain.exponentialRampToValueAtTime(0.22, now + 0.05);
      hg.gain.setValueAtTime(0.22, now + 0.85);
      hg.gain.exponentialRampToValueAtTime(0.0001, now + 1.0);
      [311, 392].forEach(function (f) {
        var o = ctx.createOscillator(); o.type = "sawtooth"; o.frequency.value = f;
        o.connect(lp); o.start(now); o.stop(now + 1.05);
      });
      lp.connect(hg); hg.connect(ctx.destination);
    }
    // The engine: low rumble rising in pitch and volume.
    var e = ctx.createOscillator(), eg = ctx.createGain(), elp = ctx.createBiquadFilter();
    e.type = "sawtooth";
    e.frequency.setValueAtTime(40, now); e.frequency.exponentialRampToValueAtTime(100, now + 1.9);
    elp.type = "lowpass"; elp.frequency.value = 400;
    eg.gain.setValueAtTime(0.0001, now);
    eg.gain.exponentialRampToValueAtTime(0.28, now + 1.9);
    eg.gain.exponentialRampToValueAtTime(0.0001, now + 2.6);
    e.connect(elp); elp.connect(eg); eg.connect(ctx.destination);
    e.start(now); e.stop(now + 2.65);
  } catch (e2) { /* never let audio break the game */ }
}

// The crowd's cameras going off: one loud shutter for the big white-out, then
// quieter ones scattered over the next 1.4 seconds as flashes pop in the stands.
function playCameraFlashes() {
  try {
    var ctx = getAudioCtx();
    if (!ctx) return;
    var now = ctx.currentTime;
    playClip("cameraFlash", 0.7, now);
    for (var i = 0; i < 10; i++) playClip("cameraFlash", 0.15 + Math.random() * 0.1, now + 0.1 + Math.random() * 1.4, 0.9 + Math.random() * 0.25);
  } catch (e) { /* never let audio break the game */ }
}

// ---------------------------------------------------------------
// Crowd: a looping arena crowd under the whole fight. It sits at a low
// murmur during lulls. Big moments raise the crowd's "heat", and the crowd
// doesn't jump straight to it: it takes about a second to build up to full
// excitement, stays there a few seconds while the action keeps coming, then
// takes a few seconds to die back down once things slow. The same mood drives
// the fans in the stands (crowdExcitement, stadium.js). The win brings one
// last roar.
// ---------------------------------------------------------------
var CROWD_FLOOR = 0.06, CROWD_PEAK = 0.3; // background noise under the music and hits (Joe)
var CROWD_RISE = 1.0;   // seconds to build from calm to fully excited
var CROWD_KEEP = 3.0;   // seconds it stays up after the last big moment
var CROWD_FADE = 4.0;   // seconds to die all the way back down
var crowd = null; // { src, gain, filter, held, holdTimer, duckUntil }
var crowdMood = { heat: 0, level: 0, keep: 0 }; // heat: where it's headed; level: where it is
var CROWD_HOLD = 0.3, CROWD_HOLD_FREQ = 9000; // the crowd going wild through Do Bronx
function crowdLevel(h) { return CROWD_FLOOR + (CROWD_PEAK - CROWD_FLOOR) * h; }
// How excited the crowd is right now, 0 (murmur) to 1 (on its feet).
function crowdExcitement() { return crowd && crowd.held ? Math.max(0.9, crowdMood.level) : crowdMood.level; }
function resetCrowdMood() { crowdMood.heat = 0; crowdMood.level = 0; crowdMood.keep = 0; }
function startCrowd() {
  resetCrowdMood();
  try {
    var ctx = getAudioCtx();
    if (!ctx) return;
    if (ctx.state === "suspended") ctx.resume();
    stopCrowdLoop();
    var c = crowd = { src: null, gain: null, filter: null, ready: 0 };
    withClip("crowd", function (buf) {
      if (crowd !== c) return; // stopped (or restarted) while decoding
      var now = ctx.currentTime;
      c.src = ctx.createBufferSource();
      c.src.buffer = buf;
      c.src.loop = true;
      // Skip the MP3's encoder padding at either end so the loop has no gap.
      c.src.loopStart = 0.06; c.src.loopEnd = buf.duration - 0.06;
      // Lulls sound muffled and distant; excitement opens the crowd up.
      c.filter = ctx.createBiquadFilter();
      c.filter.type = "lowpass";
      c.filter.frequency.value = 1800;
      c.gain = ctx.createGain();
      c.gain.gain.setValueAtTime(0.0001, now);
      c.gain.gain.exponentialRampToValueAtTime(CROWD_FLOOR, now + 1.5);
      c.ready = now + 1.5; // fading in; the mood takes over after
      c.src.connect(c.filter); c.filter.connect(c.gain); c.gain.connect(ctx.destination);
      c.src.start(now, Math.random() * (buf.duration - 1));
    });
  } catch (e) { /* never let audio break the game */ }
}
// amount: how big the moment was, 0 (nothing) to 1 (huge). Heat stacks, so
// a flurry builds the crowd up further than a single shot. A real moment
// (CROWD_BIG or more) keeps it up for another CROWD_KEEP seconds; little
// jabs only nudge it.
var CROWD_BIG = 0.1;
function crowdReact(amount) {
  if (!(amount > 0)) return;
  crowdMood.heat = Math.min(1, Math.max(crowdMood.heat, crowdMood.level) + amount);
  if (amount >= CROWD_BIG) crowdMood.keep = CROWD_KEEP;
}
function crowdRoar() { crowdReact(1); }
// Runs every frame (update.js): eases the crowd toward its heat and plays it.
function tickCrowd(dt) {
  var m = crowdMood;
  if (m.keep > 0) m.keep = Math.max(0, m.keep - dt);
  else m.heat = Math.max(0, m.heat - dt / CROWD_FADE);
  if (m.level < m.heat) m.level = Math.min(m.heat, m.level + dt / CROWD_RISE);
  else m.level = m.heat;
  try {
    var c = crowd;
    if (!c || !c.gain) return;
    var now = audioCtx.currentTime;
    if (now < c.ready || now < (c.duckUntil || 0)) return; // fading in, or ducked under the knockout
    var gain = crowdLevel(m.level), freq = 1800 + 9000 * m.level;
    if (c.held) { gain = Math.max(gain, CROWD_HOLD); freq = Math.max(freq, CROWD_HOLD_FREQ); }
    c.gain.gain.cancelScheduledValues(now);
    // Slow after a hold or coming back up from under the knockout clip.
    var slow = c.held || now < (c.duckUntil || 0) + 1.5;
    c.gain.gain.setTargetAtTime(gain, now, slow ? 0.5 : 0.08);
    c.filter.frequency.cancelScheduledValues(now);
    c.filter.frequency.setTargetAtTime(freq, now, 0.08);
  } catch (e) { /* never let audio break the game */ }
}
// Keeps the crowd going wild (instead of settling to the murmur) from `delay`
// seconds from now until crowdRelease().
function crowdHold(delay) {
  var c = crowd;
  if (!c) return;
  clearTimeout(c.holdTimer);
  c.holdTimer = setTimeout(function () {
    if (crowd !== c) return;
    c.held = true;
  }, Math.max(0, delay) * 1000);
}
// Back to normal: the crowd dies down to its murmur.
function crowdRelease() {
  var c = crowd;
  if (!c) return;
  clearTimeout(c.holdTimer);
  if (!c.held) return;
  c.held = false;
  crowdMood.heat = crowdMood.level = Math.max(crowdMood.level, 0.6);
  crowdMood.keep = 0;
}
// Leaving or restarting a match: the crowd, the music and anyone talking go quiet.
function stopCrowd() {
  stopDoBronx();
  stopTalk();
  stopCrowdLoop();
  stopMusic();
}
// Just the looping crowd. startCrowd uses this, so it doesn't cut off the
// "Here we go!" that starts the same moment.
function stopCrowdLoop() {
  var c = crowd;
  crowd = null;
  if (c) clearTimeout(c.holdTimer);
  if (!c || !c.src) return;
  try {
    var now = audioCtx.currentTime;
    c.gain.gain.cancelScheduledValues(now);
    c.gain.gain.setTargetAtTime(0.0001, now, 0.15);
    c.src.stop(now + 0.8);
  } catch (e) { /* never let audio break the game */ }
}

// ---------------------------------------------------------------
// Ilia Topuria's Aura Farm (aurafarm.js).
// The music: Joe's track goes in SOUND_CLIPS.auraFarm. Until it's there, a
// flamenco stand-in plays: palmas (hand claps) on the 12-beat compás with
// rasgueado guitar strums on the accents.
var auraMusic = null;
var AURA_BEAT = 0.3;
function playAuraFarmMusic() {
  try {
    var ctx = getAudioCtx();
    if (!ctx) return;
    if (ctx.state === "suspended") ctx.resume();
    stopAuraFarmMusic(0);
    var now = ctx.currentTime, out = ctx.createGain();
    out.gain.setValueAtTime(0.0001, now); out.gain.exponentialRampToValueAtTime(1, now + 0.1);
    out.connect(ctx.destination);
    auraMusic = { gain: out, srcs: [] };
    auraBgMusic(now, 0); // the background music drops out under Desperado
    if (typeof SOUND_CLIPS !== "undefined" && SOUND_CLIPS.auraFarm) {
      withClip("auraFarm", function (buf) {
        if (!auraMusic || auraMusic.gain !== out) return;
        var s = ctx.createBufferSource(); s.buffer = buf; s.connect(out); s.start(ctx.currentTime);
        auraMusic.srcs.push(s);
      });
      return;
    }
    // Stand-in: 8 bars of 12 beats.
    var accents = { 2: true, 5: true, 7: true, 9: true, 11: true };
    var chords = [[220, 261.6, 329.6, 440], [196, 246.9, 293.7, 392], [174.6, 220, 261.6, 349.2], [164.8, 207.7, 246.9, 329.6]];
    for (var bar = 0; bar < 8; bar++) {
      for (var i = 0; i < 12; i++) {
        var t = now + 0.05 + (bar * 12 + i) * AURA_BEAT, acc = !!accents[i];
        auraClap(ctx, out, t, acc ? 0.5 : 0.18, auraMusic.srcs);
        if (acc) {
          var ci = i === 2 ? 0 : (i === 5 ? 1 : (i === 11 ? 3 : 2));
          auraStrum(ctx, out, t, chords[ci], i === 11 ? 0.32 : 0.24, auraMusic.srcs);
        }
      }
    }
  } catch (e) { /* never let audio break the game */ }
}
// Fades the background music (music.js) out for Aura Farm (k 0) and back (k 1).
function auraBgMusic(at, k) {
  try {
    var m = typeof music !== "undefined" ? music : null;
    if (!m || !m.gain) return;
    var g = m.gain.gain;
    g.cancelScheduledValues(at);
    g.setTargetAtTime(k ? m.level : 0.0001, at, k ? 0.4 : 0.15);
  } catch (e) { /* never let audio break the game */ }
}
function stopAuraFarmMusic(fade) {
  try {
    var am = auraMusic;
    if (!am || !audioCtx) return;
    auraMusic = null;
    var now = audioCtx.currentTime, f = fade == null ? 0.6 : fade;
    auraBgMusic(now + f, 1);
    am.gain.gain.cancelScheduledValues(now);
    am.gain.gain.setValueAtTime(Math.max(0.0001, am.gain.gain.value || 0.9), now);
    am.gain.gain.linearRampToValueAtTime(0, now + f + 0.01);
    var end = now + f + 0.05;
    am.srcs.forEach(function (s) { try { s.stop(end); } catch (e) { /* already stopped */ } });
    // (no disconnect: the stopped sources are cleaned up on their own, and a
    // disconnect would also cut it out of offline-rendered demo recordings)
  } catch (e) { /* never let audio break the game */ }
}
function auraClap(ctx, out, t, peak, srcs) {
  if (!punchNoise) punchNoise = makeNoiseBuffer(ctx, 0.2);
  [0, 0.008, 0.017].forEach(function (d, i) {
    var s = ctx.createBufferSource(); s.buffer = punchNoise;
    var f = ctx.createBiquadFilter(); f.type = "bandpass"; f.frequency.value = 1500 + i * 300; f.Q.value = 1.4;
    var g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t + d); g.gain.exponentialRampToValueAtTime(peak * (i === 2 ? 1 : 0.6), t + d + 0.002);
    g.gain.exponentialRampToValueAtTime(0.0001, t + d + (i === 2 ? 0.09 : 0.02));
    s.connect(f); f.connect(g); g.connect(out); s.start(t + d); s.stop(t + d + 0.12); srcs.push(s);
  });
}
function auraStrum(ctx, out, t, notes, peak, srcs) {
  notes.forEach(function (fq, i) {
    var at = t + i * 0.014;
    [1, 1.004].forEach(function (det) {
      var o = ctx.createOscillator(); o.type = "sawtooth"; o.frequency.value = fq * det;
      var lp = ctx.createBiquadFilter(); lp.type = "lowpass";
      lp.frequency.setValueAtTime(3200, at); lp.frequency.exponentialRampToValueAtTime(700, at + 0.5);
      var g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, at); g.gain.exponentialRampToValueAtTime(peak * 0.25, at + 0.004);
      g.gain.exponentialRampToValueAtTime(0.0001, at + 0.7);
      o.connect(lp); lp.connect(g); g.connect(out); o.start(at); o.stop(at + 0.75); srcs.push(o);
    });
  });
}
// A heavy spotlight thunking on, with a hum.
function playSpotlightDrop() {
  try {
    var ctx = getAudioCtx();
    if (!ctx) return;
    if (ctx.state === "suspended") ctx.resume();
    var now = ctx.currentTime;
    caneTone(ctx, now, "sine", 120, 45, 0.7, 0.35);
    caneBurst(ctx, now, 900, 0.8, 0.5, 0.08);
    caneTone(ctx, now + 0.02, "square", 60, 60, 0.04, 0.9);
  } catch (e) { /* never let audio break the game */ }
}
// The bull bellowing as it's thrown (Joe's clip; a snort if it's not loaded).
// rate < 1 pitches it down (the KO punch uses it a little lower, so the two
// don't sound the same so close together).
function playBullThrown(rate) {
  try {
    var ctx = getAudioCtx();
    if (!ctx) return;
    if (ctx.state === "suspended") ctx.resume();
    if (!playClip("bullThrown", 0.9, null, rate)) { withClip("bullThrown"); playBullSnort(); }
  } catch (e) { /* never let audio break the game */ }
}
// Joe's impact punch clips for Aura Farm hits (1: bull rams the opponent,
// 2: thrown bull lands); falls back to the synth punch if not loaded.
function playImpactClip(n, gain, fallback) {
  try {
    var ctx = getAudioCtx();
    if (!ctx) return;
    if (ctx.state === "suspended") ctx.resume();
    if (!playClip("impactPunch" + n, gain)) { withClip("impactPunch" + n); playPunch(fallback); }
  } catch (e) { /* never let audio break the game */ }
}
// The bull roaring as it charges (Joe's clip; a snort if it's not loaded).
function playBullCharge(gain) {
  try {
    var ctx = getAudioCtx();
    if (!ctx) return;
    if (ctx.state === "suspended") ctx.resume();
    if (!playClip("bullCharge", gain || 0.85)) { withClip("bullCharge"); playBullSnort(); }
  } catch (e) { /* never let audio break the game */ }
}
// Jon Jones's GOAT Stampede (jon.js): a goat ramming someone is a deep, heavy
// thunder ram (Joe's pick "B3": horn crack, driven sub boom, long rumble),
// and each wall they pinball off is a heavy bass thud with the cage clanging
// and rattling ("A&B 2"). Both go through the strike bus, over the music.
var GOAT_RAM_GAIN = 0.55, GOAT_WALL_GAIN = 0.6;
function gtEnv(ctx, t, a, p, dec) { var g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(p, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + a + dec); return g; }
var gtCurves = {};
function gtDrive(ctx, amt) {
  var sh = ctx.createWaveShaper();
  if (!gtCurves[amt]) { var c = new Float32Array(1024); for (var i = 0; i < 1024; i++) { var x = i / 511.5 - 1; c[i] = Math.tanh(x * amt) / Math.tanh(amt); } gtCurves[amt] = c; }
  sh.curve = gtCurves[amt]; return sh;
}
var gtNoiseBuf = null;
function gtNoise(ctx, out, t, type, f, q, p, dec, a) {
  if (!gtNoiseBuf || gtNoiseBuf.sampleRate !== ctx.sampleRate) gtNoiseBuf = makeNoiseBuffer(ctx, 2);
  var s = ctx.createBufferSource(); s.buffer = gtNoiseBuf;
  var fl = ctx.createBiquadFilter(); fl.type = type; fl.frequency.value = f; fl.Q.value = q;
  var g = gtEnv(ctx, t, a || 0.001, p, dec);
  s.connect(fl); fl.connect(g); g.connect(out); s.start(t, Math.random()); s.stop(t + (a || 0) + dec + 0.05);
  return fl;
}
function gtSweep(ctx, out, t, type, f0, f1, glide, p, dec, drive) {
  var o = ctx.createOscillator(); o.type = type;
  o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + glide);
  var g = gtEnv(ctx, t, 0.002, p, dec);
  if (drive) { var d = gtDrive(ctx, drive); o.connect(d); d.connect(g); } else o.connect(g);
  g.connect(out); o.start(t); o.stop(t + dec + 0.05);
}
function playGoatRam() {
  try {
    var ctx = getAudioCtx();
    if (!ctx) return;
    if (ctx.state === "suspended") ctx.resume();
    var t = ctx.currentTime, k = 1, out = ctx.createGain();
    out.gain.value = GOAT_RAM_GAIN; out.connect(strikeOut(ctx));
    gtNoise(ctx, out, t, "highpass", 2500, 0.8, 0.9 * k, 0.04);          // horn crack
    gtNoise(ctx, out, t + 0.004, "bandpass", 1800, 3, 0.7 * k, 0.07);
    gtSweep(ctx, out, t, "sine", 140, 30, 0.22, 1.2 * k, 0.55, 8);         // driven body
    gtSweep(ctx, out, t, "sine", 70, 22, 0.6, 1.1 * k, 1.1, 3);
    gtSweep(ctx, out, t + 0.01, "triangle", 220, 45, 0.1, 0.6 * k, 0.18, 6);
    var f = gtNoise(ctx, out, t, "lowpass", 400, 0.8, 1.0 * k, 1.6, 0.02);  // rolling rumble
    f.frequency.setValueAtTime(900, t); f.frequency.exponentialRampToValueAtTime(70, t + 1.6);
    gtNoise(ctx, out, t + 0.12, "lowpass", 250, 0.7, 0.6 * k, 1.2, 0.15);
    gtSweep(ctx, out, t + 0.04, "sine", 50, 25, 1.0, 0.8 * k, 1.4);
    gtSweep(ctx, out, t, "sine", 90, 32, 0.3, 1.3 * k, 0.9, 4);           // heavy bass
    gtSweep(ctx, out, t + 0.02, "sine", 45, 26, 0.8, 1.2 * k, 1.5, 2);
    gtNoise(ctx, out, t, "lowpass", 120, 0.9, 1.2 * k, 0.9, 0.01);
    crowdReact(0.6);
  } catch (e) { /* never let audio break the game */ }
}
// k: 1 for the first wall, a little softer on each one after.
function playGoatWall(k) {
  try {
    var ctx = getAudioCtx();
    if (!ctx) return;
    var t = ctx.currentTime, out = ctx.createGain();
    out.gain.value = GOAT_WALL_GAIN * (k == null ? 1 : k); out.connect(strikeOut(ctx));
    gtSweep(ctx, out, t, "sine", 140, 38, 0.2, 1.0, 0.35, 3);             // thud
    gtNoise(ctx, out, t, "bandpass", 1800, 1, 0.55, 0.05);                // crack
    gtNoise(ctx, out, t, "lowpass", 400, 0.7, 0.55, 0.3);
    gtSweep(ctx, out, t, "sine", 85, 30, 0.25, 1.1, 0.45, 4);             // heavy bass
    gtNoise(ctx, out, t, "lowpass", 150, 0.8, 0.8, 0.35);
    [1, 2.32, 3.17, 4.56, 5.9].forEach(function (r, i) {                  // the cage clanging
      gtSweep(ctx, out, t, "square", 310 * r, 310 * r * 0.995, 0.5, 0.22 / (i + 1.5), 0.5 * (1 - i * 0.12));
    });
    for (var i = 0; i < 20; i++) {                                         // and rattling
      var tt = t + Math.pow(Math.random(), 1.6) * 0.45;
      gtNoise(ctx, out, tt, "bandpass", 3200 * (0.7 + Math.random() * 0.8), 3, 0.28 * (1 - (tt - t) / 0.45 * 0.8), 0.025);
    }
    crowdReact(0.4);
  } catch (e) { /* never let audio break the game */ }
}

// Ilia's KO punch on the bull: a full-weight punch, boosted well over a
// normal one, with a crit-punch crack and a slam under it.
function playKoPunch() {
  try {
    var ctx = getAudioCtx();
    if (!ctx) return;
    if (ctx.state === "suspended") ctx.resume();
    var now = ctx.currentTime, g = ctx.createGain();
    g.gain.value = 2.4;
    g.connect(strikeOut(ctx));
    if (!punchNoise) punchNoise = makeNoiseBuffer(ctx, 0.2);
    synthPunch(ctx, g, now, 1, punchNoise);
    synthPunch(ctx, g, now + 0.012, 1, punchNoise);
    playCritPunch(true);
    playSlam();
    // Joe's baseball bat crack; the synth crack stands in if it isn't loaded.
    playClip("impactPunch2", 1.3) || withClip("impactPunch2");
    auraCowbell(ctx, now + 0.01);
    if (!playClip("batCrack", 1.4)) { withClip("batCrack"); auraCrack(ctx, now + 0.005); }
  } catch (e) { /* never let audio break the game */ }
}
// A little cowbell clank on the bull: two detuned square waves through a
// band-pass, with a quick metallic decay.
function auraCowbell(ctx, t) {
  var bp = ctx.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = 2640; bp.Q.value = 1.4;
  var g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.9, t + 0.003);
  g.gain.exponentialRampToValueAtTime(0.25, t + 0.06);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.45);
  bp.connect(g); g.connect(ctx.destination);
  [587, 845].forEach(function (f) {
    var o = ctx.createOscillator(); o.type = "square"; o.frequency.value = f;
    o.connect(bp); o.start(t); o.stop(t + 0.5);
  });
}
// A huge, sharp CRACK, like a bat on a fastball: a near-instant broadband
// snap, a bright woody ring, and a slapback off the arena roof.
function auraCrack(ctx, t) {
  // Everything goes through one loud bus with a compressor, so it hits hard
  // without falling apart.
  var bus = ctx.createGain(); bus.gain.value = 2.2;
  var comp = ctx.createDynamicsCompressor();
  comp.threshold.value = -14; comp.ratio.value = 6; comp.attack.value = 0.001; comp.release.value = 0.2;
  bus.connect(comp); comp.connect(ctx.destination);
  var noise = makeNoiseBuffer(ctx, 0.5);
  function snap(at, peak, dur, hp, out) {
    var s = ctx.createBufferSource(); s.buffer = noise;
    var f = ctx.createBiquadFilter(); f.type = "highpass"; f.frequency.value = hp;
    var g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, at); g.gain.exponentialRampToValueAtTime(peak, at + 0.001);
    g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
    s.connect(f); f.connect(g); g.connect(out); s.start(at); s.stop(at + dur + 0.02);
  }
  // The ash bat ringing: a cluster of bright woody partials that die fast.
  function ring(at, scale, out) {
    [[620, 0.5, 0.22], [1310, 0.65, 0.18], [2240, 0.45, 0.14], [3480, 0.3, 0.1], [4900, 0.18, 0.07]].forEach(function (p) {
      var o = ctx.createOscillator(); o.type = "sine"; o.frequency.value = p[0] * (0.98 + Math.random() * 0.04);
      var g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, at); g.gain.exponentialRampToValueAtTime(p[1] * scale, at + 0.001);
      g.gain.exponentialRampToValueAtTime(0.0001, at + p[2]);
      o.connect(g); g.connect(out); o.start(at); o.stop(at + p[2] + 0.02);
    });
  }
  snap(t, 1.0, 0.05, 1500, bus);   // the CRACK itself
  snap(t, 0.5, 0.14, 3500, bus);   // splinter fizz
  ring(t, 1, bus);
  caneTone(ctx, t, "sine", 160, 70, 0.6, 0.18); // the ball's thump under it
  // The echo off the stands and the roof, as it goes out of the park.
  [[0.13, 0.4], [0.27, 0.22], [0.42, 0.11]].forEach(function (ec) {
    snap(t + ec[0], ec[1], 0.07, 1800, bus);
    ring(t + ec[0], ec[1] * 0.8, bus);
  });
}
// A heel stomp on the canvas.
function playStomp() {
  try {
    var ctx = getAudioCtx();
    if (!ctx) return;
    var now = ctx.currentTime;
    caneTone(ctx, now, "sine", 150, 60, 0.45, 0.12);
    caneBurst(ctx, now, 700, 1, 0.25, 0.05);
  } catch (e) { /* never let audio break the game */ }
}
// The bull: a snort, and hooves pounding.
function playBullSnort() {
  try {
    var ctx = getAudioCtx();
    if (!ctx) return;
    if (ctx.state === "suspended") ctx.resume();
    var now = ctx.currentTime;
    [0, 0.16].forEach(function (d) {
      if (!whooshNoise) whooshNoise = makeNoiseBuffer(ctx, 0.4);
      var s = ctx.createBufferSource(); s.buffer = whooshNoise;
      var f = ctx.createBiquadFilter(); f.type = "bandpass"; f.Q.value = 0.8;
      f.frequency.setValueAtTime(400, now + d); f.frequency.exponentialRampToValueAtTime(1200, now + d + 0.12);
      var g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, now + d); g.gain.exponentialRampToValueAtTime(0.5, now + d + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, now + d + 0.18);
      s.connect(f); f.connect(g); g.connect(ctx.destination); s.start(now + d); s.stop(now + d + 0.25);
    });
    caneTone(ctx, now, "sawtooth", 90, 70, 0.08, 0.3);
  } catch (e) { /* never let audio break the game */ }
}
function playHoof() {
  try {
    var ctx = getAudioCtx();
    if (!ctx) return;
    var now = ctx.currentTime;
    caneTone(ctx, now, "sine", 110 + Math.random() * 20, 50, 0.3, 0.09);
    caneBurst(ctx, now, 500, 1.2, 0.12, 0.04);
  } catch (e) { /* never let audio break the game */ }
}

// Jon Jones swapping modes (jon.js): GOAT is a bright rising shimmer, EVIL
// a low growling hit with a dark rumble under it.
function playJonModeSwap(mode) {
  try {
    var ctx = getAudioCtx();
    if (!ctx) return;
    if (ctx.state === "suspended") ctx.resume();
    var now = ctx.currentTime, out = ctx.createGain();
    out.gain.value = 0.5; out.connect(ctx.destination);
    if (mode === "goat") {
      [880, 1320, 1760].forEach(function (f, i) {
        var o = ctx.createOscillator(), g = ctx.createGain(), t = now + i * 0.06;
        o.type = "triangle"; o.frequency.setValueAtTime(f * 0.92, t); o.frequency.exponentialRampToValueAtTime(f, t + 0.08);
        g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.35, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
        o.connect(g); g.connect(out); o.start(t); o.stop(t + 0.55);
      });
    } else {
      var o2 = ctx.createOscillator(), g2 = ctx.createGain(), lp = ctx.createBiquadFilter();
      o2.type = "sawtooth"; o2.frequency.setValueAtTime(110, now); o2.frequency.exponentialRampToValueAtTime(48, now + 0.5);
      lp.type = "lowpass"; lp.frequency.value = 700;
      g2.gain.setValueAtTime(0.0001, now); g2.gain.exponentialRampToValueAtTime(0.7, now + 0.02); g2.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);
      o2.connect(lp); lp.connect(g2); g2.connect(out); o2.start(now); o2.stop(now + 0.65);
      if (!punchNoise) punchNoise = makeNoiseBuffer(ctx, 0.2);
      synthPunch(ctx, out, now, 0.8, punchNoise);
    }
  } catch (e) { /* never let audio break the game */ }
}

// A goat leaping into the cage (GOAT Stampede, jon.js): every one baas,
// one of the two baas from Joe's recording at random. The synth bleat
// stands in until the clips are loaded.
function playGoatBleat() {
  try {
    var ctx = getAudioCtx();
    if (!ctx) return;
    if (ctx.state === "suspended") ctx.resume();
    var clip = Math.random() < 0.5 ? "goatBaa1" : "goatBaa2";
    if (playClip(clip, 1.3, null, 0.95 + Math.random() * 0.1)) return;
    withClip(clip);
    var now = ctx.currentTime, dur = 0.5 + Math.random() * 0.2, f0 = 420 + Math.random() * 160;
    var o = ctx.createOscillator(), lfo = ctx.createOscillator(), lg = ctx.createGain();
    var bp = ctx.createBiquadFilter(), g = ctx.createGain();
    o.type = "sawtooth"; o.frequency.setValueAtTime(f0, now); o.frequency.linearRampToValueAtTime(f0 * 0.9, now + dur);
    lfo.frequency.value = 22; lg.gain.value = f0 * 0.06; lfo.connect(lg); lg.connect(o.frequency);
    bp.type = "bandpass"; bp.frequency.value = 1400; bp.Q.value = 2.2;
    g.gain.setValueAtTime(0.0001, now); g.gain.exponentialRampToValueAtTime(0.32, now + 0.04);
    g.gain.setValueAtTime(0.32, now + dur * 0.7); g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
    o.connect(bp); bp.connect(g); g.connect(ctx.destination);
    o.start(now); lfo.start(now); o.stop(now + dur + 0.05); lfo.stop(now + dur + 0.05);
  } catch (e) { /* never let audio break the game */ }
}

// Jon Jones's big baa as he floats up for GOAT Stampede (Joe's recording).
function playJonBaa() {
  try {
    var ctx = getAudioCtx();
    if (!ctx) return;
    if (ctx.state === "suspended") ctx.resume();
    withClip("jonBaa", function () { playClip("jonBaa", 1.1); });
  } catch (e) { /* never let audio break the game */ }
}
