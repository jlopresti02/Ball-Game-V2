// Roster fighters saved into the repo, so every version of the game has
// them. Generated from characters/*.json by tools/build_roster.py: edit
// the character files (or the fighter in the game), not this file.
"use strict";

var SAVED_ROSTER = [
  {
    "id": "c-charles-oliveira",
    "rev": 1,
    "builtin": false,
    "name": "Charles Oliveira",
    "base": "Grappler",
    "bio": "\"Do Bronx\". Built on the Grappler base, with Khabib's quick 5-damage punches. Against another Grappler he only shoots for the takedown half the time on contact. When he's hit he has a 25% chance to fall into guard: planted on his back for 6 seconds with a circle around him. Step in and it's a coin flip: pass the guard for free ground and pound, or get caught in a submission (the guillotine for now, more to come).",
    "color": "#d9a514",
    "label": "",
    "imgData": null,
    "look": {
      "skin": "#c48f68",
      "build": "lean",
      "bodyHair": "none",
      "hair": "short",
      "hairColor": "#f4edd2",
      "beard": "none",
      "ears": "normal",
      "tattoos": {
        "portraits": true,
        "leftArm": "dense",
        "rightArm": "lion",
        "armInk": true
      },
      "shorts": "#e9b824",
      "trim": "#141414",
      "shortsStyle": "chevron",
      "gloves": "#151515"
    },
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
      "damage": 5,
      "cooldown": 0.7,
      "speed": 0.22,
      "size": 13,
      "knockback": 80,
      "reach": 30,
      "koChance": 0
    },
    "hasKick": false,
    "hasGrapple": true,
    "grapple": {
      "damage": 50,
      "cooldown": 1.5,
      "speed": 0.45,
      "reach": 6,
      "counterChance": 25,
      "finSlamDamage": 20,
      "finPunches": 3,
      "finPunchDamage": 10,
      "sprawlChance": 30,
      "reattackChance": 50,
      "vsGrapplerChance": 50
    },
    "hasPowerPunch": false,
    "hasRage": false,
    "hasWatcher": false,
    "hasWeave": false,
    "hasSwing": false,
    "hasForget": false,
    "hasGuard": true,
    "guard": {
      "chance": 25,
      "time": 6,
      "radius": 130,
      "passChance": 50,
      "passPunches": 4,
      "passDamage": 10,
      "subs": [
        "guillotine"
      ],
      "cooldown": 3
    },
    "hasSpecial": false,
    "blockChance": 10
  },
  {
    "id": "c-dustin-poirier",
    "rev": 4,
    "builtin": false,
    "name": "Dustin Poirier",
    "base": "Brawler",
    "bio": "\"The Diamond\". A pressure boxer built on the Brawler base: faster, higher-volume hands than the stock Brawler with a little less on each shot, a tighter guard, and the Brawler's opening KO Rush. Special move: IGBB. Catches shots in his trademark guillotine.",
    "color": "#1e3a8a",
    "look": {
      "skin": "#d9a07a",
      "build": "muscular",
      "bodyHair": "none",
      "hair": "buzz",
      "hairColor": "#3a2a1e",
      "beard": "stubble",
      "ears": "normal",
      "tattoos": {
        "chest": false,
        "script": true,
        "claws": true,
        "leftArm": true,
        "rightArm": true,
        "ribs": false,
        "color": true
      },
      "shorts": "#1a1a1a",
      "trim": "#ffffff",
      "shortsStyle": "print",
      "gloves": "#151515"
    },
    "label": "",
    "imgData": "data:image/jpeg;base64,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",
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
    "hasGuillotine": true,
    "guillotine": {
      "chance": 35,
      "tapBase": 20,
      "tapLowHp": 60,
      "cooldown": 5,
      "outcomes": {
        "escape": 20,
        "gnp": 70,
        "resink": 5,
        "slam": 5
      },
      "slamDamage": 75
    },
    "blockChance": 15
  },
  {
    "id": "c-khabib-nurmagomedov",
    "rev": 1,
    "builtin": false,
    "name": "Khabib Nurmagomedov",
    "base": "Grappler",
    "bio": "\"The Eagle\". Built on the Grappler base: grabs on contact and slams into the wall, plus quick 5-damage punches that charge his special move extra fast. Special move: Father's Plan. Future look ideas: a papakha and a cauliflower-ear mockup.",
    "color": "#8b1a1a",
    "label": "",
    "imgData": null,
    "look": {
      "skin": "#d9a682",
      "build": "muscular",
      "bodyHair": "light",
      "hair": "buzz",
      "hairColor": "#1c1612",
      "beard": "full",
      "ears": "normal",
      "tattoos": {},
      "shorts": "#161616",
      "trim": "#c9a646",
      "shortsStyle": "stripe",
      "gloves": "#151515"
    },
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
      "damage": 5,
      "cooldown": 0.7,
      "speed": 0.22,
      "size": 13,
      "knockback": 80,
      "reach": 30,
      "koChance": 0
    },
    "hasKick": false,
    "hasGrapple": true,
    "grapple": {
      "damage": 50,
      "cooldown": 1.5,
      "speed": 0.45,
      "reach": 6,
      "counterChance": 25,
      "finSlamDamage": 20,
      "finPunches": 3,
      "finPunchDamage": 10,
      "sprawlChance": 30,
      "reattackChance": 50
    },
    "hasPowerPunch": false,
    "hasRage": false,
    "hasWatcher": false,
    "hasWeave": false,
    "hasSwing": false,
    "hasForget": false,
    "hasSpecial": true,
    "special": {
      "move": "fathersplan",
      "chargeTime": 40,
      "hitCut": 4,
      "punchCut": 7,
      "walls": 4,
      "wallDamage": 6,
      "slamDamage": 12,
      "punches": 5,
      "damage": 12,
      "shellTime": 5
    },
    "blockChance": 10
  }
];
