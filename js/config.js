// Arena size, physics constants and the Watcher's corner seats.
"use strict";

var STORAGE_KEY = "ballbrawl_roster_v1";
// W and H are the play area in game units (the canvas scales it to fit the screen).
var W = 500, H = 500, RADIUS = 30, SPEED = 340, MAX_HP = 100, SUBSTEPS = 4;
// Shared by the power punch's hit detection and its drawing, so the fist
// you see is exactly the fist that can land a hit.
var POWER_ARM_LEN_MULT = 2.9, POWER_FIST_R_MULT = 0.62;
// The four corner seats the Watcher can sit in.
var SIT_INSET = RADIUS + 4;
var SIT_SPOTS = [
  { x: SIT_INSET, y: SIT_INSET },
  { x: W - SIT_INSET, y: SIT_INSET },
  { x: SIT_INSET, y: H - SIT_INSET },
  { x: W - SIT_INSET, y: H - SIT_INSET }
];

var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
