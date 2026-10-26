// Weight classes. Every fighter is in one of the nine UFC classes
// (`weightClass` on the character, Middleweight if it hasn't got one).
// Middleweight is the baseline: heavier fighters are bigger, slower, swing a
// little slower and block a little more; lighter ones are smaller, quicker and
// throw faster. When the two fighters are in different classes, each class
// between them counts:
//   the lighter one takes +6% damage from the heavier one,
//   the heavier one takes -5% damage from the lighter one,
//   the lighter one slips 4% of the heavier one's strikes ("WHIFF"),
//   the heavier one wins grappling exchanges (who grabs first, sprawls,
//   scrambles, grab escapes) 50% + 5% of the time, up to 85%.
"use strict";

var WEIGHT_CLASSES = [
  { id: "strawweight", name: "Strawweight", lb: 115 },
  { id: "flyweight", name: "Flyweight", lb: 125 },
  { id: "bantamweight", name: "Bantamweight", lb: 135 },
  { id: "featherweight", name: "Featherweight", lb: 145 },
  { id: "lightweight", name: "Lightweight", lb: 155 },
  { id: "welterweight", name: "Welterweight", lb: 170 },
  { id: "middleweight", name: "Middleweight", lb: 185 },
  { id: "lightheavyweight", name: "Light Heavyweight", lb: 205 },
  { id: "heavyweight", name: "Heavyweight", lb: 265 }
];
var WEIGHT_BASE_LB = 185;
var WEIGHT_HURT_UP = 0.06;    // extra damage per class the attacker is heavier
var WEIGHT_HURT_DOWN = 0.05;  // less damage per class the attacker is lighter
var WEIGHT_WHIFF = 4;         // % per class a lighter fighter slips a heavier one's strikes
var WEIGHT_GRAPPLE = 0.05;    // heavier fighter's edge in grappling, per class
var WEIGHT_GRAPPLE_MAX = 0.85;

// The class's index in WEIGHT_CLASSES (0 Strawweight .. 8 Heavyweight).
function weightIndex(ch) {
  var id = ch && ch.weightClass;
  for (var i = 0; i < WEIGHT_CLASSES.length; i++) if (WEIGHT_CLASSES[i].id === id) return i;
  return 6; // Middleweight
}
function weightClassName(ch) { return WEIGHT_CLASSES[weightIndex(ch)].name; }

// Set on a ball when it's made: its size, top speed and how quickly its
// attack cooldowns tick down.
function applyWeight(b) {
  var wc = weightIndex(b.char), size = Math.sqrt(WEIGHT_CLASSES[wc].lb / WEIGHT_BASE_LB);
  b.wc = wc;
  b.r = Math.round(RADIUS * size);
  b.baseSpeed = SPEED / size;
  b.atkRate = 1 / Math.pow(size, 0.25);
  b.blockBonus = wc; // +0% Strawweight up to +8% Heavyweight
}

// Classes the attacker is above the defender (negative if it's lighter).
function weightGap(b, attackerId) {
  if (attackerId == null || attackerId === b.id || !balls[attackerId]) return 0;
  return (balls[attackerId].wc || 0) - (b.wc || 0);
}

function weightDamageMult(b, attackerId) {
  var g = weightGap(b, attackerId);
  if (g > 0) return 1 + WEIGHT_HURT_UP * g;
  if (g < 0) return Math.max(0, 1 + WEIGHT_HURT_DOWN * g);
  return 1;
}

// A lighter fighter slipping a heavier one's strike.
function tryWeightWhiff(b, attackerId) {
  var g = weightGap(b, attackerId);
  if (g <= 0 || Math.random() >= WEIGHT_WHIFF * g / 100) return false;
  floater(b.x, b.y - b.r - 8, "WHIFF", "dodge");
  return true;
}

// Chance `a` wins a grappling exchange against `b` on weight alone.
function grappleOdds(a, b) {
  var g = (a.wc || 0) - (b.wc || 0);
  var edge = Math.min(WEIGHT_GRAPPLE_MAX, 0.5 + WEIGHT_GRAPPLE * Math.abs(g));
  return g >= 0 ? (g === 0 ? 0.5 : edge) : 1 - edge;
}
// Scales a grappling roll for `a` against `b`: 1 when they're the same
// class, up to 1.7x for a much heavier fighter, down to 0.3x for a much
// lighter one.
function grappleScale(a, b) { return grappleOdds(a, b) / 0.5; }
