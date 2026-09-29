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
