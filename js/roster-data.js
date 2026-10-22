// Roster fighters saved into the repo, so every version of the game has
// them. Generated from characters/*.json by tools/build_roster.py: edit
// the character files (or the fighter in the game), not this file.
"use strict";

var SAVED_ROSTER = [
  {
    "id": "c-dustin-poirier",
    "builtin": false,
    "name": "Dustin Poirier",
    "base": "Brawler",
    "bio": "\"The Diamond\". A pressure boxer built on the Brawler base: faster, higher-volume hands than the stock Brawler with a little less on each shot, a tighter guard, and the Brawler's opening KO Rush. Special move: IGBB.",
    "color": "#1e3a8a",
    "label": "DP",
    "imgData": null,
    "hasProjectile": false,
    "proj": {
      "size": 7,
      "speed": 460,
      "damage": 10,
      "cooldown": 1.6,
      "imgData": null
    },
    "hasPunch": true,
    "punch": {
      "damage": 22,
      "cooldown": 0.95,
      "speed": 0.28,
      "size": 15,
      "knockback": 280,
      "reach": 42,
      "koChance": 5
    },
    "hasKick": false,
    "hasGrapple": false,
    "hasPowerPunch": false,
    "hasRage": false,
    "hasWatcher": false,
    "hasWeave": false,
    "hasSwing": false,
    "hasForget": false,
    "hasSpecial": true,
    "special": {
      "move": "igbb",
      "chargeTime": 45,
      "hitCut": 5,
      "punches": 7,
      "damage": 10,
      "shellTime": 5
    },
    "blockChance": 15
  }
];
