// Fight seeds: every fight runs on its own seeded random numbers, so a saved
// fight (its seed, both fighters and the arena) plays out exactly the same
// again. The fight logic draws from the seeded generator; drawing, sound and
// everything else keep the browser's own Math.random, so they can't knock a
// replay off course. The game also steps in fixed 1/60s ticks (main.js), so
// a 60Hz and a 120Hz phone run the same fight.
"use strict";

var NATIVE_RANDOM = Math.random;
function nativeRandom() { return NATIVE_RANDOM(); }

var fightSeed = 0, seedState = 0;
function seededRandom() { // mulberry32
  seedState = (seedState + 0x6D2B79F5) | 0;
  var t = seedState;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
function setFightSeed(seed) { fightSeed = seed >>> 0; seedState = fightSeed; }
function newFightSeed() { return Math.floor(NATIVE_RANDOM() * 4294967296) >>> 0; }
// Runs fight logic on the seeded numbers.
function withFightRandom(fn) {
  var prev = Math.random;
  Math.random = seededRandom;
  try { return fn(); } finally { Math.random = prev; }
}
function seedCode(seed) {
  var s = (seed >>> 0).toString(36).toUpperCase();
  while (s.length < 7) s = "0" + s;
  return s;
}
function parseSeedCode(code) {
  var n = parseInt(String(code).replace(/[^0-9a-z]/gi, ""), 36);
  return isFinite(n) ? (n >>> 0) : null;
}
