// Roster fighters saved into the repo, so every version of the game has
// them. Generated from characters/*.json by tools/build_roster.py: edit
// the character files (or the fighter in the game), not this file.
"use strict";

var SAVED_ROSTER = [
  {
    "id": "c-alex-pereira",
    "rev": 4,
    "builtin": false,
    "weightClass": "lightheavyweight",
    "name": "Alex Pereira",
    "base": "Brawler",
    "bio": "\"Poatan\" (stone hands). Built on the Brawler base, with fists of stone and red war paint. He stalks slowly on a bouncing 1-2, 1-2 step, but his hands are fast. Every few seconds up close he plants and shouts \"CHAMA!\", the crowd shouts it back, and he throws left-right-left, ending in the left hook. The shout is the tell: back off and it whiffs. Let the hook land clean and it's often a knockout, and he shoots an arrow into the sky. His kicks go for the calf: you limp for a few seconds. Against Jon Jones, he shoots Jon's duck out of the sky. Special move: Bow and Arrow, a big red arrow that bings off the cage and hits whoever's in its path. He mixes in body shots and uppercuts up close, and one that lands sets up a bigger punch upstairs.",
    "color": "#c8102e",
    "label": "",
    "imgData": null,
    "speedMult": 0.85,
    "look": {
      "skin": "#a86b4c",
      "build": "muscular",
      "bodyHair": "none",
      "hair": "bald",
      "hairColor": "#1c1612",
      "beard": "none",
      "ears": "normal",
      "tattoos": {
        "chest": true,
        "leftArm": true,
        "rightArm": true,
        "script": true
      },
      "shorts": "#c8102e",
      "trim": "#161616",
      "shortsStyle": "slash",
      "gloves": "#918b81",
      "stoneFists": true,
      "warPaint": {
        "color": "#c8102e"
      }
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
      "damage": 25,
      "cooldown": 1.0,
      "speed": 0.3,
      "size": 15,
      "knockback": 260,
      "reach": 42,
      "koChance": 0
    },
    "bodyShots": {
      "chance": 15,
      "knockback": 110,
      "setupMult": 1.35,
      "setupTime": 1.6,
      "guardDrop": 10
    },
    "uppercuts": {
      "chance": 12,
      "close": 34,
      "setupMult": 1.35,
      "setupTime": 1.6,
      "guardDrop": 10
    },
    "hasKick": true,
    "kick": {
      "damage": 16,
      "cooldown": 3.4,
      "speed": 0.42,
      "size": 15,
      "knockback": 140,
      "reach": 60,
      "checkChance": 25
    },
    "hasGrapple": false,
    "hasPowerPunch": false,
    "hasRage": false,
    "hasWatcher": false,
    "hasWeave": false,
    "hasSwing": false,
    "hasForget": false,
    "blockChance": 15,
    "knee": {
      "damage": 14,
      "cooldown": 3.6,
      "speed": 0.32,
      "reach": 12,
      "knockback": 240,
      "flying": {
        "first": [
          6,
          10
        ],
        "every": [
          12,
          17
        ],
        "minGap": 70,
        "maxGap": 220,
        "load": 0.4,
        "speed": 950,
        "damage": 24,
        "knockback": 600,
        "koBase": 4,
        "koLow": 16,
        "readChance": 20,
        "open": 0.8
      }
    },
    "poatan": {
      "step": {
        "rate": 1.15,
        "dip": 0.07
      },
      "chama": {
        "first": [
          6,
          9
        ],
        "every": [
          6,
          9
        ],
        "range": 120,
        "reach": 48,
        "call": 0.7,
        "echo": 0.25,
        "readChance": 30,
        "readWeave": 25,
        "lunge": 430,
        "jab": 12,
        "cross": 16,
        "hook": 32,
        "hookKnockback": 560,
        "koBase": 15,
        "koLow": 48
      },
      "duckHunt": {
        "chance": 75,
        "damage": 25
      }
    },
    "legKick": {
      "onKick": true,
      "slow": 0.6,
      "time": 3
    },
    "hasSpecial": true,
    "special": {
      "move": "bow",
      "chargeTime": 78,
      "hitCut": 4,
      "punchCut": 3,
      "damage": 35,
      "secondHit": 25,
      "hits": 2,
      "bounces": 5,
      "speed": 900,
      "flight": 3.2,
      "knockback": 900
    }
  },
  {
    "id": "c-alexander-volkanovski",
    "rev": 2,
    "builtin": false,
    "weightClass": "featherweight",
    "name": "Alexander Volkanovski",
    "base": "Brawler",
    "bio": "\"The Great\". The Australian Featherweight, built on the Brawler base with kicks and wrestling: the most well-rounded fighter in the game, and tough to hurt. A couple of seconds in he reads your numbers onto a FIGHT IQ card. If you're the submission threat he kicks you from outside and stays off the mat; if you're the striker he wrestles you; and if it isn't working he adapts. He never stands still: he circles you, switching between clockwise and counter-clockwise. Special move: Kangaroo. \"Down Under\" starts, the whole arena goes green and gold, a big red kangaroo bounds in over the cage, he hops into its pouch, and it kicks you into the cage while he punches you out of the pouch.",
    "color": "#00843d",
    "label": "",
    "imgData": null,
    "look": {
      "skin": "#e0b394",
      "build": "stocky",
      "bodyHair": "none",
      "hair": "bald",
      "hairColor": "#2a1e17",
      "beard": "short",
      "beardColor": "#2a1e17",
      "ears": "cauliflower",
      "tattoos": {
        "tribalShoulder": true
      },
      "shorts": "#0b5d3b",
      "trim": "#c9a44c",
      "shortsStyle": "meander",
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
      "damage": 14,
      "cooldown": 0.75,
      "speed": 0.2,
      "size": 13,
      "knockback": 110,
      "reach": 34,
      "koChance": 0
    },
    "hasKick": true,
    "kick": {
      "damage": 24,
      "cooldown": 2.2,
      "speed": 0.36,
      "size": 13,
      "knockback": 240,
      "reach": 66,
      "checkChance": 30
    },
    "hasGrapple": true,
    "grapple": {
      "damage": 36,
      "cooldown": 1.5,
      "speed": 0.42,
      "reach": 8,
      "counterChance": 20,
      "finSlamDamage": 20,
      "finPunches": 3,
      "finPunchDamage": 10,
      "sprawlChance": 55,
      "reattackChance": 55,
      "vsGrapplerChance": 100,
      "shotChance": 25,
      "shotName": "DOUBLE LEG"
    },
    "hasPowerPunch": false,
    "hasRage": false,
    "hasWatcher": false,
    "hasWeave": false,
    "hasSwing": false,
    "hasForget": false,
    "blockChance": 15,
    "combos": {
      "first": [
        4,
        7
      ],
      "every": [
        7,
        11
      ],
      "list": {
        "one-two-kick": 3,
        "jab-cross-hook": 2,
        "cross-hook-knee": 1
      }
    },
    "volk": {
      "durability": {
        "damageTaken": 0.88
      },
      "gamePlan": {
        "readAt": 2.5,
        "card": 2.8,
        "mixedWithin": 12,
        "plans": {
          "kicks": {
            "kickCooldown": 0.55,
            "kickDamage": 1.1,
            "shotChance": 0,
            "sprawlBonus": 20,
            "gap": 50
          },
          "wrestle": {
            "kickCooldown": 1.6,
            "shotChance": 50,
            "reachBonus": 6,
            "grappleCooldown": 0.8,
            "gap": 12
          },
          "mixed": {
            "kickCooldown": 1,
            "shotChance": 25,
            "gap": 30
          }
        },
        "adapt": {
          "max": 2,
          "after": 8,
          "stuffed": 2,
          "takenDown": 2,
          "checked": 3,
          "damageLead": 80
        }
      },
      "circle": {
        "after": 0.6,
        "switchEvery": [
          1.0,
          2.2
        ],
        "turn": 9,
        "sway": 15,
        "swayEvery": 1.7,
        "pivot": 0.7,
        "range": 330
      },
      "rivals": {
        "ilia": {
          "damageTaken": 1.3
        },
        "max": {
          "damage": 1.1
        }
      },
      "walkout": {
        "keep": 1.6
      },
      "lines": {
        "start": true,
        "plan": 70,
        "adapt": true,
        "rival": true,
        "nail": 30,
        "win": true,
        "gap": 8
      }
    },
    "hasSpecial": true,
    "special": {
      "move": "kangaroo",
      "chargeTime": 55,
      "hitCut": 3,
      "punchCut": 1.5,
      "rounds": 2,
      "hops": 4,
      "pouchPunches": [
        6,
        4
      ],
      "pouchDamage": 7,
      "kickDamage": [
        30,
        40
      ],
      "walls": [
        2,
        3
      ],
      "wallDamage": 6,
      "knockback": 1100,
      "readChance": 20,
      "tune": true
    }
  },
  {
    "id": "c-anderson-silva",
    "rev": 3,
    "builtin": false,
    "weightClass": "middleweight",
    "name": "Anderson Silva",
    "base": "Brawler",
    "bio": "\"The Spider\". Built on the Brawler base, with one of the widest move sets in the game: sharp punches, long kicks, elbows, knees, the Thai plum, a flying knee, combinations and a dangerous game off his back. He leans back out of nearly everything, Matrix style, leaving a ghost of himself behind, and often fires a counter straight back; after a few in a row he drops his hands and dares them to try again. Every few seconds he chambers his knee (a yellow line shows where it's going) and hops in with a front kick to the face, the one that knocked out Vitor Belfort. Put him on his back and he throws his legs up for the triangle choke that beat Chael Sonnen, and hits them while he holds it. Losing late, he gets more dangerous: crits, and triangles that finish. His special, Spider Code, goes off at the start of the fight: the cage goes dark, green code rains down and he's in a long black coat and dark glasses, bending back out of shots in bullet time. Shaved head, goatee, black shorts with yellow stripes and a yellow spider.",
    "color": "#f5c400",
    "label": "",
    "imgData": null,
    "look": {
      "skin": "#8a5636",
      "build": "lean",
      "bodyHair": "none",
      "hair": "bald",
      "hairColor": "#15100c",
      "beard": "none",
      "goatee": true,
      "beardColor": "#15100c",
      "ears": "normal",
      "tattoos": {},
      "shorts": "#151515",
      "trim": "#f5c400",
      "shortsStyle": "stripe",
      "legPatch": false,
      "spiderLogo": "#f5c400",
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
      "damage": 16,
      "cooldown": 0.75,
      "speed": 0.24,
      "size": 14,
      "knockback": 200,
      "reach": 42,
      "koChance": 0
    },
    "hasKick": true,
    "kick": {
      "damage": 26,
      "cooldown": 3.0,
      "speed": 0.42,
      "size": 15,
      "knockback": 300,
      "reach": 68,
      "checkChance": 30
    },
    "hasGrapple": false,
    "hasPowerPunch": false,
    "hasRage": false,
    "hasWatcher": false,
    "hasWeave": false,
    "hasSwing": false,
    "hasForget": false,
    "blockChance": 12,
    "tdd": {
      "sprawlChance": 25
    },
    "hasGuard": true,
    "guard": {
      "chance": 18,
      "time": 5,
      "radius": 130,
      "passChance": 35,
      "passPunches": 4,
      "passDamage": 7,
      "subs": [
        "triangle"
      ],
      "cooldown": 6
    },
    "armbar": {
      "tapBase": 8,
      "tapLowHp": 40
    },
    "knee": {
      "damage": 10,
      "cooldown": 3.2,
      "speed": 0.3,
      "reach": 12,
      "critChance": 30,
      "critMult": 2,
      "knockback": 200,
      "flying": {
        "first": [
          12,
          16
        ],
        "every": [
          16,
          22
        ],
        "minGap": 80,
        "maxGap": 220,
        "load": 0.4,
        "speed": 950,
        "damage": 22,
        "knockback": 560,
        "koBase": 2,
        "koLow": 12,
        "readChance": 20,
        "open": 0.8
      }
    },
    "clinch": {
      "first": [
        6,
        9
      ],
      "every": [
        10,
        14
      ],
      "range": 14,
      "tie": "plum",
      "reach": 0.26,
      "evade": 10,
      "weaverEvade": 10,
      "strikes": [
        3,
        4
      ],
      "gap": 0.34,
      "mix": {
        "headKnee": 5,
        "bodyKnee": 2
      },
      "knee": {
        "damage": 6,
        "headDamage": 7,
        "critChance": 15,
        "critMult": 2
      },
      "ramp": 15,
      "escape": 18,
      "grapplerEscape": 10,
      "knockback": 380,
      "open": 0.6,
      "parting": {
        "chance": 35,
        "mix": {
          "knee": 1,
          "elbow": 1
        }
      }
    },
    "anderson": {
      "weave": {
        "chance": 47,
        "projChance": 22,
        "lean": 0.3
      },
      "counter": {
        "chance": 45,
        "delay": 0.1,
        "damage": 18,
        "reach": 20
      },
      "handsDown": {
        "after": 3,
        "window": 8,
        "time": 1.6,
        "dodge": 60,
        "cooldown": 10,
        "max": 3
      },
      "frontKick": {
        "first": [
          3,
          5
        ],
        "every": [
          5,
          8
        ],
        "minGap": 30,
        "maxGap": 170,
        "load": 0.45,
        "speed": 880,
        "reach": 30,
        "damage": 40,
        "knockback": 620,
        "koBase": 4,
        "koLow": 22,
        "koAfter": 12,
        "readChance": 15,
        "open": 0.55
      },
      "triangle": {
        "tapBase": 30,
        "tapLowHp": 45,
        "tapAfter": 15,
        "guardArmbar": 25,
        "time": [
          2.8,
          3.8
        ],
        "fromGnp": 60,
        "gnpAfter": [
          1,
          2
        ],
        "fromTakedown": 50,
        "cooldown": 4,
        "reroll": 0.62,
        "strikes": {
          "first": 0.45,
          "gap": 0.42,
          "max": 5,
          "damage": 5,
          "critChance": 30,
          "critMult": 2.5,
          "elbows": 60
        }
      },
      "lines": {
        "handsDown": [
          "Relax, take it easy. Trust me, I'm Jedi."
        ],
        "comeback": [
          "I back. Trust me, I back."
        ],
        "win": [
          "Because fight is my life, fight is my heart. This is me."
        ],
        "combo": [
          "I love my job."
        ]
      },
      "comeback": {
        "behind": 60,
        "lowHp": 0.45,
        "after": 35,
        "crit": 40,
        "critMult": 2,
        "triTap": 35,
        "kickKo": 20,
        "fromGnp": 30
      },
      "talk": {
        "handsDownChance": 50,
        "comebackChance": 75,
        "comboChance": 60,
        "comboGap": 12
      }
    },
    "elbow": {
      "damage": 7,
      "cooldown": 1.8,
      "speed": 0.26,
      "reach": 14,
      "critChance": 30,
      "critMult": 2.5,
      "knockback": 140,
      "cut": {
        "chance": 30,
        "time": 3,
        "dps": 2
      }
    },
    "combos": {
      "first": [
        5,
        8
      ],
      "every": [
        8,
        12
      ],
      "list": {
        "jab-cross-elbow": 2,
        "cross-hook-knee": 2,
        "punch-clinch": 2,
        "one-two-kick": 1,
        "elbow-elbow-knee": 1
      }
    },
    "hasSpecial": true,
    "special": {
      "move": "mranderson",
      "chargeTime": 50,
      "hitCut": 1.5,
      "punchCut": 1,
      "atStart": true,
      "delay": 0.6,
      "suit": 1.1,
      "time": 12,
      "again": true,
      "dodge": 85,
      "projDodge": 75,
      "counter": 70,
      "lean": 0.45,
      "rain": 0.78,
      "bullet": {
        "chance": 60,
        "scale": 0.3,
        "time": 0.6,
        "cooldown": 1.4
      }
    }
  },
  {
    "id": "c-carlos-prates",
    "rev": 2,
    "builtin": false,
    "weightClass": "welterweight",
    "name": "Carlos Prates",
    "base": "Kicker",
    "bio": "\"The Nightmare\". A long, lanky Brazilian kickboxer who smokes on fight day. He fights at the end of the longest punch and the longest kick in the game, in and out: he backs off at an angle, then comes back in on a different entrance every time and fires as he arrives, with a teep to shove them back out. His arms are rubber: now and then his fist shoots across the whole ring (Rubber Pistol) or his leg stretches out and whips round (Rubber Whip). Shots on him mostly catch nothing but air: he steps back out of them and kicks. Up close his elbows and knees crit a lot, and in the clinch his long knees crit too and he comes off it with an elbow. But once a choke or an armbar is on him he's in trouble. His special is the Cigarette: he stops and lights one, and nothing can touch him while the party music plays. Then he goes Super Saiyan: a gold aura, everyone misses him, every miss sets up a counter that crits, and his combinations come back to back.",
    "color": "#86c232",
    "label": "",
    "imgData": null,
    "look": {
      "skin": "#b47f5a",
      "build": "lean",
      "bodyHair": "none",
      "hair": "buzz",
      "hairColor": "#1b1512",
      "beard": "stubble",
      "beardColor": "#1b1512",
      "beardAlpha": 0.45,
      "ears": "normal",
      "tattoos": {
        "leftArm": true,
        "rightArm": true,
        "armInk": true
      },
      "nightmare": true,
      "cigarette": true,
      "cigWisp": 0.35,
      "shorts": "#141414",
      "trim": "#86c232",
      "shortsStyle": "stripe",
      "gloves": "#141414"
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
      "damage": 15,
      "cooldown": 0.65,
      "speed": 0.24,
      "size": 13,
      "knockback": 220,
      "reach": 52,
      "koChance": 0
    },
    "hasKick": true,
    "kick": {
      "damage": 25,
      "cooldown": 1.35,
      "speed": 0.42,
      "size": 14,
      "knockback": 420,
      "reach": 84,
      "checkChance": 35
    },
    "hasGrapple": false,
    "hasPowerPunch": false,
    "hasRage": false,
    "hasWatcher": false,
    "hasWeave": false,
    "hasSwing": false,
    "hasForget": false,
    "blockChance": 12,
    "hasTeep": true,
    "teep": {
      "cooldown": 3.2,
      "range": 30,
      "reach": 58,
      "chamber": 0.13,
      "extend": 0.08,
      "hold": 0.12,
      "recover": 0.16,
      "damage": 9,
      "push": 660,
      "blockPush": 0.5,
      "stuff": true,
      "onlyClosing": true,
      "size": 14
    },
    "elbow": {
      "damage": 7,
      "cooldown": 1.3,
      "speed": 0.24,
      "reach": 14,
      "critChance": 45,
      "critMult": 2.6,
      "knockback": 180,
      "cut": {
        "chance": 35,
        "time": 4,
        "dps": 2
      }
    },
    "knee": {
      "damage": 10,
      "cooldown": 2.4,
      "speed": 0.3,
      "reach": 12,
      "critChance": 40,
      "critMult": 2.4,
      "knockback": 280
    },
    "clinch": {
      "first": [
        4,
        7
      ],
      "every": [
        6,
        9
      ],
      "range": 22,
      "tie": "plum",
      "reach": 0.26,
      "evade": 12,
      "weaverEvade": 10,
      "strikes": [
        2,
        4
      ],
      "gap": 0.36,
      "mix": {
        "bodyKnee": 3,
        "headKnee": 3,
        "elbow": 1
      },
      "knee": {
        "damage": 7,
        "headDamage": 10,
        "critChance": 40,
        "critMult": 2.2
      },
      "escape": 18,
      "grapplerEscape": 10,
      "knockback": 420,
      "open": 0.6,
      "parting": {
        "chance": 60,
        "mix": {
          "elbow": 1
        }
      }
    },
    "prates": {
      "lanky": {
        "wide": 0.93,
        "tall": 1.07
      },
      "range": {
        "keep": 30,
        "outGap": [
          70,
          95
        ],
        "outTime": [
          0.45,
          0.85
        ],
        "outAngle": [
          0.35,
          0.9
        ],
        "set": [
          0.15,
          0.45
        ],
        "inTime": 1.4,
        "press": 150,
        "entries": {
          "left": 1,
          "right": 1,
          "straight": 1,
          "wide": 1,
          "switch": 1
        },
        "fireIn": true,
        "rate": 5.5,
        "wall": 70,
        "closing": 140,
        "counterCd": 1.1,
        "counterReady": 0.3,
        "squaredUp": true
      },
      "backOff": {
        "chance": 68,
        "step": 460,
        "window": 1.0,
        "counter": {
          "kick": 50,
          "punch": 30,
          "teep": 20
        }
      },
      "guardAvoid": {
        "chance": 85,
        "margin": 8
      },
      "subDefense": {
        "extraTap": 25
      },
      "rubber": {
        "first": [
          4,
          7
        ],
        "every": [
          7,
          10.5
        ],
        "partyEvery": [
          3.3,
          5.4
        ],
        "minGap": 70,
        "maxGap": 320,
        "range": 340,
        "windup": 0.42,
        "lock": 0.08,
        "speed": 2600,
        "fist": 15,
        "damage": 22,
        "knockback": 560,
        "snap": 0.22,
        "readChance": 12,
        "whip": {
          "chance": 35,
          "damage": 24,
          "knockback": 640,
          "extend": 0.1,
          "sweep": 0.2,
          "arc": 0.9
        }
      },
      "lines": {
        "start": [
          "I'm fighter. I like to fight, I like to make money, and that's it.",
          "Brazil never had the champion the welterweight division. I will be the first.",
          "I can punch, I can knee, I can kick, so I'm better now."
        ],
        "taunt": [
          "I can punch, I can knee, I can kick, so I'm better now."
        ],
        "punches": [
          "I'm not here to play, you know."
        ],
        "smoke": [
          "I can be a champ still smoking, still party, still drinking whiskey."
        ],
        "party": [
          "Time to party, let's go!"
        ],
        "win": []
      },
      "lineOdds": {
        "gap": 6,
        "start": 100,
        "taunt": 45,
        "punches": 30,
        "smoke": 100,
        "party": 100,
        "win": 100
      },
      "lineTiming": {
        "tauntEvery": [
          16,
          26
        ],
        "punchRun": 3,
        "punchWin": 4,
        "bigWait": 8
      }
    },
    "combos": {
      "first": [
        6,
        9
      ],
      "every": [
        8,
        12
      ],
      "list": {
        "one-two-kick": 3,
        "jab-cross-knee": 2,
        "jab-cross-elbow": 2,
        "cross-hook-knee": 1,
        "elbow-elbow-knee": 1,
        "punch-clinch": 1
      }
    },
    "hasSpecial": true,
    "special": {
      "move": "cigarette",
      "chargeTime": 44,
      "hitCut": 2,
      "punchCut": 1,
      "notBefore": 10,
      "light": 1.4,
      "smoke": 2.2,
      "theyCome": true,
      "party": 5,
      "speed": 1.15,
      "attack": 1.2,
      "damage": 1.1,
      "critChance": 25,
      "critMult": 1.8,
      "counter": {
        "window": 0.8,
        "mult": 1.9,
        "lunge": 1.3,
        "cd": 0.6
      },
      "comboEvery": [
        0.9,
        1.6
      ],
      "out": 0.7,
      "missFloat": 3,
      "music": true,
      "song": true,
      "musicLevel": 0.22
    }
  },
  {
    "id": "c-charles-oliveira",
    "rev": 16,
    "builtin": false,
    "weightClass": "lightweight",
    "name": "Charles Oliveira",
    "base": "Grappler",
    "bio": "\"Do Bronx\". Built on the Grappler base, with Khabib's quick 5-damage punches. Against another Grappler he only shoots for the takedown half the time on contact. When he's hit he has a 25% chance to fall into guard: planted on his back for 6 seconds with a circle around him. Step in and it's a coin flip: pass the guard for free ground and pound, or get caught in one of his BJJ submissions, a rear naked choke or an armbar. Special move: Do Bronx.",
    "color": "#d9a514",
    "label": "",
    "imgData": null,
    "look": {
      "skin": "#c48f68",
      "build": "lean",
      "bodyHair": "none",
      "hair": "short",
      "hairColor": "#17130f",
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
      "time": 5,
      "radius": 130,
      "passChance": 50,
      "passPunches": 4,
      "passDamage": 10,
      "subs": [
        "bjj"
      ],
      "cooldown": 3
    },
    "hasSpecial": true,
    "special": {
      "move": "dobronx",
      "chargeTime": 45,
      "hitCut": 3,
      "punchCut": 3,
      "duration": 15,
      "damageMult": 4,
      "hairColor": "#f4edd2"
    },
    "blockChance": 10,
    "knee": {
      "damage": 9,
      "cooldown": 3.4,
      "speed": 0.3,
      "reach": 12,
      "knockback": 180,
      "clinch": {
        "first": [
          4,
          7
        ],
        "every": [
          8,
          12
        ],
        "range": 16,
        "knees": [
          2,
          4
        ],
        "damage": 8,
        "gap": 0.4,
        "escape": 15,
        "grapplerEscape": 10,
        "knockback": 380
      }
    },
    "kamehameha": {
      "first": [
        10,
        25
      ],
      "charge": 3.0,
      "beamTime": 1.5,
      "width": 56,
      "damage": 35,
      "knockback": 1500,
      "wallSlams": 2,
      "slamDamage": 6
    },
    "instantTransmission": {
      "every": [
        2.5,
        4.5
      ],
      "dodgeChance": 40,
      "dodgeCd": 0.8,
      "projDodgeChance": 60,
      "projDodgeCd": 0.3,
      "comboAt": 3,
      "damage": 12,
      "knockback": 1300,
      "wallSlams": 1,
      "slamDamage": 4
    }
  },
  {
    "id": "c-chuck-liddell",
    "rev": 1,
    "builtin": false,
    "weightClass": "lightheavyweight",
    "name": "Chuck Liddell",
    "base": "CTE",
    "bio": "\"The Iceman\". Built on the CTE base: big looping hooks he telegraphs from a mile away. He's slow, and early in the fight he's easy to hit and usually behind. That's the trap. Every punch that lands on him frosts the puncher's gloves: they ice over, and the more frost there is the slower they move and the softer they hit, while he hits harder. A few times a fight it snows in the arena, and in the snow he speeds up. As he gets hurt, blue ice flames come up round him. Special move: Snow Day. The snow falls, he scoops up a double handful off the mat, packs it like a snowball (\"I'm gonna knock his head off.\") and it turns into a blue flare on his gloves. Then he goes all out, hunting them down with looping overhand rights.",
    "color": "#3f8fd2",
    "label": "",
    "imgData": null,
    "speedMult": 0.82,
    "look": {
      "skin": "#edc0a0",
      "build": "stocky",
      "bodyHair": "light",
      "hair": "mohawk",
      "hairColor": "#6b4e37",
      "beard": "none",
      "beardColor": "#7a5a40",
      "ears": "normal",
      "tattoos": {
        "leftArm": true
      },
      "shorts": "#5b9bd5",
      "trim": "#eef6fc",
      "shortsStyle": "icicles",
      "gloves": "#141414",
      "icehawk": true,
      "goatee": true,
      "scalpInk": "koeikan"
    },
    "hasProjectile": false,
    "proj": {
      "size": 7,
      "speed": 460,
      "damage": 10,
      "cooldown": 1.6,
      "imgData": null
    },
    "hasPunch": false,
    "punch": {
      "damage": 25,
      "cooldown": 1.2,
      "speed": 0.32,
      "size": 15,
      "knockback": 300,
      "reach": 40,
      "koChance": 0
    },
    "hasKick": false,
    "hasGrapple": false,
    "hasPowerPunch": false,
    "hasRage": false,
    "hasWatcher": false,
    "hasWeave": false,
    "hasSwing": true,
    "swing": {
      "damage": 28,
      "windup": 0.5,
      "extend": 0.42,
      "recover": 0.22,
      "reach": 55,
      "vicinity": 90,
      "aimError": 16,
      "blockMult": 2,
      "weaveMult": 1.15
    },
    "hasForget": false,
    "blockChance": 0,
    "tdd": {
      "sprawlChance": 65
    },
    "iceman": {
      "warmup": {
        "windup": 0.78,
        "damage": 0.72,
        "at": 0.7
      },
      "frost": {
        "perHit": 0.04,
        "perDamage": 0.004,
        "hold": 2,
        "thaw": 0.015,
        "soften": 0.15,
        "slow": 0.25,
        "atkSlow": 0.15,
        "stiff": 0.3,
        "chargeSlow": 0.15,
        "hitChargeSlow": 0.4,
        "power": 0.7,
        "sources": [
          "punch",
          "jab",
          "combo",
          "flow",
          "swing",
          "kopunch",
          "kofinal",
          "slugfest",
          "power",
          "finisher",
          "poke",
          "kick",
          "kickback",
          "grapple"
        ]
      },
      "snow": {
        "first": [
          10,
          15
        ],
        "every": [
          14,
          20
        ],
        "time": 7,
        "speed": 1.35,
        "windup": 0.8
      },
      "flames": {
        "below": 0.6
      },
      "taunt": {
        "behind": 40,
        "first": [
          2,
          4
        ],
        "every": [
          25,
          40
        ]
      }
    },
    "hasSpecial": true,
    "special": {
      "move": "snow",
      "chargeTime": 60,
      "hitCut": 2,
      "punchCut": 2,
      "hurtCut": 2.5,
      "readChance": 35,
      "rampage": {
        "time": 6,
        "speed": 1.6,
        "windup": 0.26,
        "extend": 0.18,
        "recover": 0.12,
        "vicinity": 150,
        "aimError": 10,
        "blockMult": 1,
        "weaveMult": 1,
        "damage": 1.25
      }
    }
  },
  {
    "id": "c-ciryl-gane",
    "rev": 8,
    "builtin": false,
    "weightClass": "heavyweight",
    "name": "Ciryl Gane",
    "base": "Kicker",
    "bio": "\"Bon Gamin\". Fighter mode: a back-foot kickboxer on the Kicker base with his hands down. He fights going backwards, jabbing fast (7 damage, one every 0.42s), looping an overhand over the top now and then, and kicking a lot: long 34-damage kicks every 2.6s that can be checked, and calf kicks that leave them limping. He slips shots at range (a 30% weave), but with his hands down what lands often crits, up close his weave drops and strikes hurt more, and takedowns get in on him easily. Cheater mode: in his fights the referee falls asleep for 5 seconds out of every 15, and Gane cheats the whole time, with eye pokes into a combo, throwing objects, or a bat. While he's cheating, every takedown on him fails: he grabs the cage and stands back up. Special move: Herb Dean.",
    "color": "#1f4fa8",
    "label": "",
    "imgData": null,
    "look": {
      "skin": "#a8724c",
      "build": "muscular",
      "bodyHair": "none",
      "hair": "stubble",
      "hairColor": "#151110",
      "beard": "chinstrap",
      "ears": "normal",
      "tattoos": {
        "medallion": true
      },
      "shorts": "#eceeef",
      "trim": "#141414",
      "shortsStyle": "slash",
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
      "damage": 7,
      "cooldown": 0.42,
      "speed": 0.2,
      "size": 13,
      "knockback": 70,
      "reach": 44,
      "koChance": 0
    },
    "hooks": {
      "chance": 18,
      "over": true,
      "damageMult": 2.8,
      "knockback": 360,
      "coil": 0.14,
      "sweep": 0.22,
      "recover": 0.14,
      "arc": 2.2,
      "follow": 0.45,
      "size": 1.25,
      "width": 1.2,
      "color": "#ffffff"
    },
    "hasKick": true,
    "kick": {
      "damage": 34,
      "cooldown": 2.6,
      "speed": 0.5,
      "size": 17,
      "knockback": 450,
      "reach": 78,
      "checkChance": 25
    },
    "legKick": {
      "first": [
        3,
        5
      ],
      "every": [
        4,
        6
      ],
      "range": 60,
      "reach": 95,
      "damage": 8,
      "slow": 0.8,
      "time": 3
    },
    "hasGrapple": false,
    "hasPowerPunch": false,
    "hasRage": false,
    "hasWatcher": false,
    "hasWeave": true,
    "weave": {
      "dodgeChance": 30,
      "critChance": 6,
      "comboHits": 4,
      "comboDamage": 4,
      "finalDamage": 10,
      "finalKnockback": 700,
      "tauntDur": 1,
      "tauntVuln": 1.25,
      "flowChance": 0,
      "flowDamage": 0
    },
    "hasSwing": false,
    "hasForget": false,
    "blockChance": 0,
    "gane": {
      "handsDown": true,
      "chin": {
        "critChance": 22,
        "critMult": 1.5,
        "sources": [
          "punch",
          "jab",
          "kick",
          "kickback",
          "elbow",
          "knee",
          "combo",
          "swing",
          "teep",
          "flow",
          "bat",
          "poke"
        ]
      },
      "close": 28,
      "closeWeave": 0.3,
      "closeHurt": 1.25,
      "shotsIn": 1.6,
      "footwork": {
        "keep": 62,
        "press": 150,
        "closing": 120,
        "angle": [
          0.35,
          0.9
        ],
        "outTime": [
          0.5,
          1.0
        ],
        "outGap": [
          95,
          125
        ],
        "set": [
          0.3,
          0.7
        ],
        "inTime": 1.6,
        "rate": 6,
        "wall": 70,
        "fireIn": true,
        "ready": 0.6
      }
    },
    "combos": {
      "first": [
        4,
        7
      ],
      "every": [
        6,
        9
      ],
      "list": {
        "jab-cross-knee": 2,
        "one-two-kick": 2
      }
    },
    "hasCheater": true,
    "cheater": {
      "awake": 10,
      "asleep": 5,
      "poke": {
        "damage": 6,
        "stun": 0.25,
        "combo": [
          10,
          10,
          10,
          10,
          30
        ],
        "comboGap": 0.16,
        "cooldown": 0.8
      },
      "throw": {
        "cooldown": 0.75,
        "speed": 560
      },
      "bat": {
        "damage": 22,
        "cooldown": 0.25,
        "windup": 0.32,
        "swing": 0.2,
        "follow": 0.2,
        "reach": 55,
        "knockback": 260
      }
    },
    "hasSpecial": true,
    "special": {
      "move": "herbdean",
      "chargeTime": 37,
      "hitCut": 3,
      "punchCut": 1,
      "batDamage": 12,
      "batGap": 0.42,
      "finisher": 40,
      "caneDamage": 8
    }
  },
  {
    "id": "c-conor-mcgregor",
    "rev": 5,
    "builtin": false,
    "weightClass": "lightweight",
    "name": "Conor McGregor",
    "base": "Brawler",
    "bio": "\"The Notorious\". A counter-puncher built on the Brawler base, in green shorts, with a slicked-back ginger undercut, a thick beard and the gorilla and tiger tattoos. He never stops talking: every few seconds he does the billionaire strut and says one of his real lines, and every line is a taunt. They see red and storm straight at him, and he plants and fires the left hand as they come in. It can whiff and leave him wide open, but when it lands clean it's often a knockout. Early on he kicks too: front kicks and spinning kicks to the body that push them back out and set them up for the left. He's the fastest, hardest-hitting fighter in the game for about 10 seconds, then his gas tank runs dry fast: slower, softer, no more kicks, easier to submit. When he's running low he stops for a swig of Proper No. 12 Irish root beer, which winds the tank back unless they catch him with the bottle up. Knock someone out inside 13 seconds and the jumbotron shows the time, and his famous finishes get the commentator's real call. Against Khabib, Khabib wrestles him harder, takes his back and says \"Let's talk now.\" Against Dustin, the calf kicks come out. Once a fight he pulls a pot of gold up out of the mat, grabs it by the handles and tips it over at them: a huge rainbow beam pours out across the ring (Pot o' Gold, his Kamehameha). Against Charles, whoever fires first gets the other one charging too, and the beams meet in a beam clash. Special move: Bus Crew, his UFC 223 bus: a coach pulls up, a crew of lads in green hats piles out and brawls the opponent, and he throws a dolly at them.",
    "color": "#169b62",
    "label": "",
    "imgData": null,
    "look": {
      "skin": "#f1c9a8",
      "build": "lean",
      "bodyHair": "none",
      "hair": "slick",
      "hairColor": "#8b4a2b",
      "beard": "full",
      "beardColor": "#a0522d",
      "ears": "normal",
      "tattoos": {
        "gorilla": true,
        "tiger": true,
        "leftArm": true
      },
      "shorts": "#169b62",
      "trim": "#f2f2f2",
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
      "damage": 22,
      "cooldown": 1.0,
      "speed": 0.28,
      "size": 15,
      "knockback": 260,
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
    "blockChance": 10,
    "tdd": {
      "sprawlChance": 25
    },
    "notorious": {
      "trashTalk": {
        "first": [
          0.4,
          0.9
        ],
        "every": [
          2.5,
          4.5
        ],
        "gap": 70,
        "strut": 1.3,
        "strutSpeed": 0.5,
        "angerAt": 0.45,
        "anger": 3,
        "slipLine": 60
      },
      "counter": {
        "plantRange": 160,
        "reach": 46,
        "maxPlant": 0.7,
        "step": 260,
        "whiff": 35,
        "angryCantSlip": true,
        "damage": 30,
        "knockback": 520,
        "koBase": 0,
        "koLow": 55,
        "koAfter": 6,
        "cooldown": 1.0,
        "openTime": 0.6,
        "openVuln": 1.25
      },
      "gasTank": {
        "fresh": 9,
        "fade": 12,
        "floor": 0.55,
        "speed": [
          1.25,
          0.82
        ],
        "damage": [
          1.3,
          0.75
        ],
        "attack": [
          1.3,
          0.8
        ],
        "koMult": [
          1,
          0.5
        ],
        "tapExtra": [
          8,
          32
        ],
        "gassedAt": 0.35
      },
      "kicks": {
        "until": 0.4,
        "range": 64,
        "every": [
          1.2,
          2.0
        ],
        "tire": 1.6,
        "front": {
          "damage": 12,
          "knockback": 460,
          "dur": 0.34,
          "hitAt": 0.15,
          "cost": 0.25
        },
        "spin": {
          "chance": 30,
          "damage": 22,
          "knockback": 600,
          "spinTime": 0.3,
          "dur": 0.62,
          "hitAt": 0.4,
          "cost": 0.5
        },
        "setup": {
          "time": 3,
          "koBonus": 12
        }
      },
      "drink": {
        "below": 0.5,
        "max": 2,
        "first": 0,
        "every": [
          3,
          5
        ],
        "gap": 150,
        "time": 1.05,
        "refill": 4,
        "vuln": 1.3,
        "theyCome": true
      },
      "ad": true,
      "calls": true,
      "calfKicksHurt": 1.4,
      "thirteen": {
        "within": 13,
        "show": 4
      },
      "rivals": {
        "khabib": {
          "grappleBoost": 1.8,
          "rncChance": 15,
          "gnpChance": 25,
          "sendLocFirst": [
            6,
            11
          ],
          "busCrew": 1,
          "answerBus": [
            1,
            2
          ]
        }
      },
      "pressConference": {
        "on": true,
        "chance": 40,
        "at": [
          7,
          14
        ],
        "room": 140,
        "talk": 1.5,
        "anger": 5,
        "bottles": 3,
        "bottleDamage": 6,
        "bottleSpeed": 560,
        "wait": 2.5,
        "koBonus": 20
      }
    },
    "potOfGold": {
      "first": [
        10,
        25
      ],
      "charge": 3.0,
      "beamTime": 1.5,
      "width": 60,
      "lock": 1.0,
      "lead": 1.2,
      "damage": 35,
      "knockback": 1500,
      "wallSlams": 2,
      "slamDamage": 6,
      "endPot": {
        "on": true,
        "damage": 15,
        "radius": 64,
        "hold": 1.1,
        "size": 2.0,
        "label": "JACKPOT!"
      }
    },
    "hasSpecial": true,
    "special": {
      "move": "buscrew",
      "chargeTime": 30,
      "hitCut": 3,
      "punchCut": 2,
      "call": 0.9,
      "crew": 4,
      "crewSpeed": 330,
      "chase": 3.2,
      "scene": 9,
      "brawlTime": 1.0,
      "pileOn": 0.35,
      "hitGap": 0.2,
      "hitDamage": 4,
      "laneBump": 8,
      "windup": 0.75,
      "holdMax": 1.5,
      "dollyDamage": 24,
      "dollySpeed": 640,
      "dollyKnockback": 420
    }
  },
  {
    "id": "c-daniel-cormier",
    "rev": 1,
    "builtin": false,
    "weightClass": "heavyweight",
    "speedMult": 1.12,
    "name": "Daniel Cormier",
    "base": "Brawler",
    "bio": "\"DC\". Olympic wrestler, two-division UFC champion, and a man who loves his food. A heavyweight with a big round belly who still rolls faster than the other big men. He mostly punches: heavy 20-damage hands every 0.75 seconds and jab-cross-hook combinations, plus a body lock that slams them into the cage (a quarter of them can't be stopped) and a suplex if he gets behind them. Every few seconds up close he drops his level while a red lane shows where he's going, then shoots a double leg. Sprawl on it or get out of the way; if it gets through he picks you up over his head, carries you to the middle of the cage while the crowd gets to its feet, and SUPER SLAMS you into the mat there. Special move: All About That Cake, after his 2015 video. When the bar fills he stops for a snack, a slice of chocolate cake or a fried chicken drumstick, wide open while he eats, then his belly gets bigger and he hits harder for the rest of the fight. Jon Jones is his rival: he hits Jon harder and shoots on him more.",
    "color": "#b0703c",
    "label": "",
    "imgData": null,
    "look": {
      "skin": "#5a3826",
      "build": "stocky",
      "core": "solid",
      "belly": 1,
      "bodyHair": "none",
      "hair": "bald",
      "hairColor": "#141010",
      "beard": "boxed",
      "beardColor": "#1a1412",
      "beardChin": 0.04,
      "ears": "cauliflower",
      "tattoos": {},
      "shorts": "#151515",
      "trim": "#c9a13b",
      "shortsStyle": "stripe",
      "gloves": "#151515",
      "legPatch": false
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
      "damage": 20,
      "cooldown": 0.75,
      "speed": 0.26,
      "size": 15,
      "knockback": 160,
      "reach": 40,
      "koChance": 3
    },
    "hasKick": false,
    "hasGrapple": true,
    "grapple": {
      "damage": 32,
      "cooldown": 1.6,
      "speed": 0.45,
      "reach": 6,
      "counterChance": 15,
      "finSlamDamage": 20,
      "finPunches": 3,
      "finPunchDamage": 10,
      "sprawlChance": 55,
      "reattackChance": 70,
      "vsGrapplerChance": 100,
      "shotChance": 20,
      "shotName": "BODY LOCK"
    },
    "hasSuplex": true,
    "suplex": {
      "chance": 35,
      "damage": 45,
      "cooldown": 4
    },
    "combos": {
      "first": [
        4,
        6
      ],
      "every": [
        5,
        8
      ],
      "list": {
        "jab-cross-hook": 3
      }
    },
    "hasPowerPunch": false,
    "hasRage": false,
    "hasWatcher": false,
    "hasWeave": false,
    "hasSwing": false,
    "hasForget": false,
    "blockChance": 10,
    "cormier": {
      "doubleLeg": {
        "first": [
          5,
          9
        ],
        "every": [
          11,
          16
        ],
        "retry": [
          4,
          7
        ],
        "range": 170,
        "tell": 0.5,
        "readChance": 15,
        "shootSpeed": 950,
        "shootTime": 0.34,
        "turn": 6,
        "whiffStun": 0.5,
        "sprawlScale": 0.45,
        "minStuff": 8,
        "carrySpeed": 320,
        "minCarry": 0.9,
        "crowd": 0.5,
        "hoist": 0.35,
        "damage": 62,
        "downTime": 1.2
      },
      "bodyLock": {
        "through": 25
      },
      "food": {
        "menu": [
          "cake",
          "chicken",
          "cake"
        ],
        "max": 3,
        "eatTime": 1.5,
        "bites": 3,
        "damage": 1.17,
        "take": 0.94,
        "belly": 0.28,
        "grow": 0.035
      },
      "vsJon": {
        "damage": 1.12,
        "every": [
          9,
          14
        ]
      },
      "lines": {
        "start": [
          "Good thing about our job is we get to punch each other in the face. So I'm gonna keep talking, and it's his job to shut me up."
        ],
        "food": [
          "I'm all about that cake, 'bout that cake, and chicken!"
        ],
        "slam": [
          "Take a seat right here, champ.",
          "Sit down, young man. Sit down."
        ],
        "clinch": [
          "I know nobody can wrestle me."
        ],
        "taunt": [
          "You can't beat me, you know it. Don't lie to yourself.",
          "I could give two [BLEEP] about his feelings, you know."
        ],
        "win": [
          "This is my octagon. I'm the man."
        ],
        "winVsJon": [
          "Two belts, one on each shoulder, baby!"
        ],
        "vsJon": [
          "I wish they would let me next door so I could spit in your [BLEEP] face.",
          "Then you should try, Jon. You really should try, Jon."
        ]
      },
      "lineTiming": {
        "slamChance": 60,
        "clinchChance": 40,
        "tauntEvery": [
          12,
          20
        ],
        "tauntChance": 60,
        "gap": 8,
        "jonFirst": [
          8,
          14
        ],
        "jonGap": [
          12,
          18
        ],
        "wait": 8
      }
    },
    "hasSpecial": true,
    "special": {
      "move": "cake",
      "chargeTime": 32,
      "hitCut": 2.5,
      "punchCut": 1.2
    }
  },
  {
    "id": "c-demetrious-johnson",
    "rev": 2,
    "builtin": false,
    "weightClass": "flyweight",
    "name": "Demetrious Johnson",
    "base": "Grappler",
    "bio": "\"Mighty Mouse\". The smallest fighter in the game, a giant mouse head on a shredded Flyweight body, built on the Grappler base. For the first 10 seconds he studies game film: a SCOUTING notepad fills up while he keeps his distance. Then he reads your numbers and goes after your worst defence: takedowns if you can't sprawl, kicks from outside if you're a Grappler, punches if your block is weak. A moment later he copies your normal attacks. His cardio never quits: every 15 seconds he gets faster while you slow down and sweat. Once you're hurt, his next takedown is the suplex he turns into an armbar in mid-air, his finish on Ray Borg. Special move: Mimic, your own special at half power (IGBB, Father's Plan or Chair Shot); against anyone else, a shot straight into the suplex and the mid-air armbar.",
    "color": "#7b3fc4",
    "label": "",
    "imgData": null,
    "look": {
      "skin": "#6b4430",
      "build": "lean",
      "bodyHair": "none",
      "hair": "buzz",
      "hairColor": "#121010",
      "beard": "stubble",
      "ears": "normal",
      "tattoos": {
        "leftArm": "bands",
        "back": "\u5922"
      },
      "shorts": "#141414",
      "trim": "#d4af37",
      "shortsStyle": "stripe",
      "gloves": "#151515",
      "headwear": "mouse",
      "mouseFur": "#8e8a94",
      "mouseEar": "#f2a2b5"
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
      "damage": 12,
      "cooldown": 0.55,
      "speed": 0.2,
      "size": 12,
      "knockback": 90,
      "reach": 32,
      "koChance": 0
    },
    "hasKick": false,
    "hasGrapple": true,
    "grapple": {
      "damage": 62,
      "cooldown": 1.5,
      "speed": 0.4,
      "reach": 8,
      "counterChance": 30,
      "finSlamDamage": 20,
      "finPunches": 3,
      "finPunchDamage": 10,
      "sprawlChance": 45,
      "reattackChance": 60,
      "vsGrapplerChance": 100
    },
    "hasPowerPunch": false,
    "hasRage": false,
    "hasWatcher": false,
    "hasWeave": true,
    "weave": {
      "dodgeChance": 20,
      "critChance": 0,
      "comboHits": 5,
      "comboDamage": 3,
      "finalDamage": 8,
      "finalKnockback": 950,
      "tauntDur": 2,
      "tauntVuln": 2,
      "flowChance": 25,
      "flowDamage": 15
    },
    "hasSwing": false,
    "hasForget": false,
    "blockChance": 15,
    "knee": {
      "damage": 9,
      "cooldown": 3.2,
      "speed": 0.26,
      "reach": 12,
      "knockback": 160,
      "clinch": {
        "first": [
          5,
          8
        ],
        "every": [
          9,
          13
        ],
        "range": 16,
        "knees": [
          2,
          4
        ],
        "damage": 7,
        "gap": 0.36,
        "escape": 15,
        "grapplerEscape": 10,
        "knockback": 360
      },
      "flying": {
        "first": [
          9,
          13
        ],
        "every": [
          14,
          20
        ],
        "minGap": 60,
        "maxGap": 200,
        "load": 0.34,
        "speed": 1050,
        "damage": 20,
        "knockback": 520,
        "koBase": 3,
        "koLow": 14,
        "readChance": 15,
        "open": 0.7
      }
    },
    "mightyMouse": {
      "gameFilm": {
        "time": 10,
        "takedowns": {
          "reach": 6,
          "cooldown": 0.85
        },
        "strikes": {
          "cooldown": 0.7,
          "damage": 1.5,
          "shotChance": 30
        },
        "kicks": {
          "sprawl": 35,
          "kick": {
            "damage": 32,
            "cooldown": 1.3,
            "speed": 0.38,
            "size": 13,
            "knockback": 260,
            "reach": 62,
            "checkChance": 25
          }
        }
      },
      "copycat": {
        "delay": 1.5,
        "scale": 0.8
      },
      "cardio": {
        "every": 15,
        "max": 6,
        "speed": 0.06,
        "rate": 0.12,
        "tire": 0.05,
        "tireAttack": 0.06,
        "tireMin": 0.7
      },
      "finisher": {
        "at": 0.4,
        "slamDamage": 30,
        "tapBase": 70,
        "tapLowHp": 30,
        "cooldown": 6
      },
      "lines": {
        "start": true,
        "dodge": 45,
        "miss": 45,
        "borg": 15,
        "finisher": true,
        "win": true,
        "gap": 7
      }
    },
    "hasSpecial": true,
    "special": {
      "move": "mimic",
      "chargeTime": 42,
      "hitCut": 3,
      "punchCut": 1,
      "power": 0.5,
      "copies": [
        "igbb",
        "fathersplan",
        "chairshot"
      ],
      "tapBase": 25,
      "tapLowHp": 60,
      "slamDamage": 40
    }
  },
  {
    "id": "c-dustin-poirier",
    "rev": 17,
    "builtin": false,
    "weightClass": "lightweight",
    "name": "Dustin Poirier",
    "base": "Brawler",
    "bio": "\"The Diamond\". A pressure boxer built on the Brawler base: faster, higher-volume hands than the stock Brawler with a little less on each shot, a tighter guard, and the Brawler's opening KO Rush. Special move: IGBB. Catches shots in his trademark guillotine. Below half health he turns into Diamond Guard: diamond armor, 5% more blocks, and an occasional diamond thrown at you for a punch's worth of damage. If you pull a bat on him, he pulls out a diamond sword and parries 9 of every 10 swings. Every third parry locks you into a sword duel that ends with him disarming you or cutting straight through. Once a fight he chugs a bottle of hot sauce (dodging or blocking anything you throw while he does), turns red with steam pouring out, and runs around the ring breathing fire in a panic: get caught in it and you burn. He goes to the body and comes up with uppercuts, and his famous left hook comes round from the side; once a body shot or uppercut lands, the next one is usually that left hook.",
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
    "hooks": {
      "chance": 35,
      "afterSetup": 80,
      "side": -1,
      "damageMult": 1.3,
      "width": 1.1
    },
    "bodyShots": {
      "chance": 25,
      "knockback": 110,
      "setupMult": 1.4,
      "setupTime": 1.6,
      "guardDrop": 10
    },
    "uppercuts": {
      "chance": 10,
      "close": 34,
      "setupMult": 1.4,
      "setupTime": 1.6,
      "guardDrop": 10
    },
    "hasKick": false,
    "legKick": {
      "first": [
        2,
        4
      ],
      "every": [
        3,
        5
      ],
      "range": 56,
      "reach": 90,
      "damage": 7,
      "slow": 0.8,
      "time": 4.5,
      "stack": 0.1,
      "maxStacks": 3,
      "minSlow": 0.6,
      "vs": {
        "c-conor-mcgregor": {
          "every": [
            1.5,
            3
          ],
          "damage": 12,
          "slow": 0.65,
          "time": 7,
          "minSlow": 0.45,
          "buckle": {
            "at": 3,
            "slow": 0.2,
            "time": 1.2
          }
        }
      }
    },
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
      "chargeTime": 58,
      "hitCut": 5,
      "punches": 7,
      "damage": 20,
      "shellTime": 5
    },
    "hasGuillotine": true,
    "guillotine": {
      "chance": 35,
      "tapBase": 10,
      "tapLowHp": 60,
      "cooldown": 5,
      "outcomes": {
        "escape": 26,
        "gnp": 56,
        "resink": 4,
        "slam": 4
      },
      "slamDamage": 75
    },
    "blockChance": 15,
    "diamond": {
      "triggerHp": 0.5,
      "firstThrow": 1.2,
      "throwEvery": [
        3.5,
        5.5
      ],
      "gemSize": 14,
      "gemSpeed": 560,
      "swordClash": {
        "enabled": true,
        "weapons": [
          "bat"
        ],
        "parryChance": 92,
        "knockback": 420,
        "recover": 0.6,
        "duel": {
          "after": 3,
          "clashes": 6,
          "gap": 80,
          "disarmChance": 50,
          "slashDamage": 40,
          "slashKnockback": 1500
        }
      },
      "blockBonus": 5
    },
    "hotSauce": {
      "first": [
        14,
        24
      ],
      "max": 1,
      "len": 270,
      "half": 0.34,
      "tickDmg": 2,
      "burn": 2.2,
      "burnDmg": 1
    }
  },
  {
    "id": "c-fedor-emelianenko",
    "rev": 1,
    "builtin": false,
    "weightClass": "heavyweight",
    "name": "Fedor Emelianenko",
    "base": "Brawler",
    "bio": "\"The Last Emperor\". The PRIDE heavyweight champion, a Combat Sambo world champion from Stary Oskol, Russia, with a soft, everyman heavyweight build and no expression on his face. Slow on his feet, but his hands are the fastest heavy hands in the game: hard punches off alternating hands, strung into jab, cross, hook. Shoot on him and he sprawls on almost everything. Every so often he drops his level, reaches out with both arms and clinches: break free or he throws you over his hip, follows you down and rains punches from on top, the PRIDE flurry, sometimes switching to the armbar that finished Mark Coleman twice. He barely reacts to being hit: big shots barely move him, a dizzy wears off fast, and a low church bell rings when he walks through one. A quiet Russian Orthodox-style choir hums under every fight he's in. Special move: not picked yet.",
    "color": "#7d93b2",
    "label": "",
    "imgData": null,
    "speedMult": 0.9,
    "look": {
      "skin": "#e8c3a4",
      "build": "stocky",
      "bodyHair": "light",
      "hair": "short",
      "hairColor": "#5b4330",
      "beard": "none",
      "ears": "normal",
      "tattoos": {},
      "shorts": "#1f3c96",
      "trim": "#c8202c",
      "shortsStyle": "tricolor",
      "gloves": "#151515",
      "legPatch": false
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
      "damage": 20,
      "cooldown": 0.38,
      "speed": 0.16,
      "size": 14,
      "knockback": 50,
      "reach": 44,
      "koChance": 0
    },
    "hasKick": false,
    "hasGrapple": false,
    "hasPowerPunch": false,
    "hasRage": false,
    "hasWatcher": false,
    "hasWeave": false,
    "hasSwing": false,
    "hasForget": false,
    "blockChance": 12,
    "tdd": {
      "sprawlChance": 78
    },
    "combos": {
      "first": [
        3,
        5
      ],
      "every": [
        4,
        6.5
      ],
      "list": {
        "jab-cross-hook": 1
      }
    },
    "fedor": {
      "hands": {
        "alternate": true,
        "streaks": true,
        "whip": true
      },
      "stalk": {
        "turn": 3.5,
        "minGap": 8
      },
      "durability": {
        "take": 0.82
      },
      "throw": {
        "first": [
          6,
          9
        ],
        "every": [
          8,
          12
        ],
        "range": 24,
        "reach": 0.3,
        "escape": 25,
        "escapeDizzy": 5,
        "grapplerEscape": 10,
        "weaveEscape": 10,
        "tddScale": 0.3,
        "lift": 0.55,
        "damage": 14,
        "gnpChance": 75
      },
      "gnp": {
        "punches": 6,
        "damage": 5,
        "lastDamage": 10,
        "wind": 0.07,
        "lastWind": 0.22,
        "armbarChance": 30
      },
      "armbar": {
        "tapBase": 15,
        "tapLowHp": 55
      },
      "stoic": {
        "knockback": 0.45,
        "dizzy": 0.4,
        "slamCut": 1,
        "squash": 0.35,
        "taunts": 100,
        "furious": 60,
        "noteAt": 20,
        "noteGap": 9,
        "bell": true
      },
      "mantra": {
        "on": true,
        "level": 0.8,
        "duck": 0.35,
        "fadeIn": 2.5,
        "fadeOut": 3,
        "followKey": true
      },
      "lines": {
        "start": [],
        "win": [],
        "unfazed": [],
        "armbar": [],
        "startAt": [
          0.8,
          2
        ],
        "startChance": 100
      }
    },
    "hasSpecial": false
  },
  {
    "id": "c-francis-ngannou",
    "rev": 4,
    "builtin": false,
    "weightClass": "heavyweight",
    "name": "Francis Ngannou",
    "base": "Power Puncher",
    "bio": "\"The Predator\". A heavyweight: big, slow on his feet, and every class lighter than him takes extra damage. Built on the Power Puncher base: he plants, charges up and unloads a spinning haymaker that pinballs them off the walls. In between, every few seconds he loads up a CTE-style hook at anyone close, and if it lands it knocks them flying back across the ring. Getting hit fills his rage meter, and so does being frustrated: when it's full he turns green, grows and throws the knockout punch. He winds it up with a green line showing where it's going, so it can be dodged, and it can miss. Special move: Smash, a leap that cracks the mat and knocks them down. He's the slowest fighter in the game, and he hates Dana White.",
    "color": "#4b5563",
    "label": "",
    "imgData": null,
    "speedMult": 0.85,
    "look": {
      "skin": "#4e3022",
      "build": "muscular",
      "bodyHair": "none",
      "hair": "coils",
      "hairColor": "#100b09",
      "beard": "stubble",
      "beardColor": "#0a0706",
      "ears": "normal",
      "tattoos": {},
      "shorts": "#b4b7ba",
      "trim": "#151515",
      "shortsStyle": "marble",
      "waistText": "UFC",
      "gloves": "#151515",
      "gloveStrap": "#2f63d6",
      "legPatch": false,
      "hairHigh": 0.1,
      "beardAlpha": 0.22,
      "beardGrain": 0.5,
      "armMuscle": 1
    },
    "hasProjectile": false,
    "proj": {
      "size": 7,
      "speed": 460,
      "damage": 10,
      "cooldown": 1.6,
      "imgData": null
    },
    "hasPunch": false,
    "punch": {
      "damage": 5,
      "cooldown": 0.7,
      "speed": 0.2,
      "size": 12,
      "knockback": 0,
      "reach": 20,
      "koChance": 0
    },
    "hasKick": false,
    "hasGrapple": false,
    "hasPowerPunch": true,
    "powerPunch": {
      "damageMin": 40,
      "damageMax": 50,
      "cooldown": 2,
      "chargeDur": 2.2,
      "spinDur": 0.9,
      "knockback": 1300,
      "wallSlams": 4,
      "slamDamage": 5
    },
    "hasRage": false,
    "hasWatcher": false,
    "hasWeave": false,
    "hasSwing": true,
    "swing": {
      "damage": 35,
      "windup": 0.55,
      "extend": 0.45,
      "recover": 0.25,
      "reach": 55,
      "vicinity": 90,
      "aimError": 18,
      "blockMult": 2,
      "weaveMult": 1.15,
      "cooldown": 3.5,
      "knockback": 900
    },
    "hasForget": false,
    "blockChance": 10,
    "getUp": {
      "size": 95,
      "wrestling": 25,
      "max": 60,
      "cut": 0.5,
      "shove": 420
    },
    "ngannou": {
      "rage": {
        "hitFill": 8,
        "dmgFill": 0.18,
        "missFill": 16,
        "first": 8,
        "grow": 1.22,
        "stalk": 3,
        "stalkSpeed": 1.3,
        "range": 120,
        "windup": 1.0,
        "lock": 0.35,
        "readChance": 30,
        "readWeave": 20,
        "lunge": 1250,
        "lungeDist": 280,
        "damage": 75,
        "knockback": 1100,
        "wallSlams": 3,
        "slamDamage": 8,
        "koBase": 45,
        "koLow": 50,
        "gasSlow": 0.55,
        "gasTime": 1.6,
        "keep": 0
      },
      "dana": {
        "first": [
          14,
          26
        ],
        "every": [
          45,
          60
        ],
        "max": 1,
        "fill": 30
      },
      "koReading": {
        "units": 129161
      },
      "lines": {
        "tauntChance": 35,
        "tauntEvery": [
          14,
          22
        ]
      }
    },
    "hasSpecial": true,
    "special": {
      "move": "smash",
      "chargeTime": 35,
      "hitCut": 4,
      "punchCut": 4,
      "radius": 140,
      "damage": 70,
      "downTime": 1.3,
      "crouch": 0.5,
      "air": 0.75,
      "pose": 0.7,
      "lead": 0.5
    }
  },
  {
    "id": "c-georges-st-pierre",
    "rev": 1,
    "builtin": false,
    "weightClass": "welterweight",
    "name": "Georges St-Pierre",
    "base": "Grappler",
    "bio": "\"GSP\". Built on the Grappler base, with a stiff jab and the best double leg in the game: nearly half his shots go straight through, no sprawl. He walks out in his karate gi and a white headband with a red sun, and throws them off when the fight starts. Very hard to hit: he slips a lot of what comes at him, and after a good run of slips he drops his hands and tells you \"I'm not impressed by your performance.\" Every few seconds he leaps in with a Superman punch, a red cape appearing mid-air. His special bar is the crowd: slips, Superman punches and takedowns get them going, and past halfway it turns into a Montreal crowd waving Quebec and Canada flags and chanting \"GSP! GSP!\". While they chant he hits harder and moves faster. When it fills he goes into the Superman Dive: he rises up, flies down a red lane with both arms out, pins you and drives you round the cage.",
    "color": "#1f4fa3",
    "label": "",
    "imgData": null,
    "look": {
      "skin": "#e9bf9c",
      "build": "muscular",
      "bodyHair": "none",
      "hair": "buzz",
      "hairColor": "#3b2a20",
      "beard": "none",
      "ears": "normal",
      "tattoos": {
        "kanji": true
      },
      "shorts": "#161616",
      "trim": "#e8e8e8",
      "shortsStyle": "plain",
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
      "damage": 7,
      "cooldown": 0.6,
      "speed": 0.22,
      "size": 13,
      "knockback": 100,
      "reach": 34,
      "koChance": 0
    },
    "hasKick": false,
    "hasGrapple": true,
    "grapple": {
      "damage": 36,
      "cooldown": 1.6,
      "speed": 0.45,
      "reach": 6,
      "counterChance": 15,
      "finSlamDamage": 20,
      "finPunches": 3,
      "finPunchDamage": 10,
      "sprawlChance": 55,
      "reattackChance": 55,
      "vsGrapplerChance": 100,
      "shotChance": 35,
      "shotName": "DOUBLE LEG"
    },
    "hasPowerPunch": false,
    "hasRage": false,
    "hasWatcher": false,
    "hasWeave": false,
    "hasSwing": false,
    "hasForget": false,
    "blockChance": 15,
    "gsp": {
      "walkout": {
        "keep": 1.8,
        "gi": "#f6f4ee",
        "belt": "#161616",
        "headband": "#f6f4ee",
        "sun": "#c8102e"
      },
      "dodge": {
        "chance": 32,
        "projChance": 24
      },
      "notImpressed": {
        "after": 3,
        "window": 10,
        "hitCost": 0,
        "cooldown": 12,
        "max": 3,
        "handsDown": 1.0
      },
      "superman": {
        "first": [
          3,
          5
        ],
        "every": [
          4,
          7
        ],
        "chantEvery": [
          2.5,
          4.5
        ],
        "minGap": 25,
        "maxGap": 190,
        "load": 0.34,
        "speed": 950,
        "turn": 2.5,
        "reach": 30,
        "damage": 18,
        "chantDamage": 30,
        "knockback": 380,
        "chantKnockback": 620
      },
      "doubleLeg": {
        "through": 45
      },
      "shield": {
        "throws": 1,
        "linger": 1.5,
        "first": [
          8,
          16
        ],
        "every": [
          8,
          12
        ],
        "chantEvery": [
          6,
          9
        ],
        "minGap": 110,
        "maxGap": 600,
        "wind": 0.32,
        "speed": 820,
        "size": 0.62,
        "damage": 14,
        "chantDamage": 20,
        "knockback": 420,
        "hits": 2,
        "bounces": 4,
        "block": 25,
        "blockKnockback": 380
      },
      "crowd": {
        "chantAt": 0.5,
        "dodge": 2,
        "taunt": 5,
        "superman": 5,
        "takedown": 3,
        "shield": 3,
        "beat": 1.7,
        "hold": 2.5
      },
      "chant": {
        "damage": 1.35,
        "speed": 1.15,
        "attack": 1.25
      }
    },
    "hasSpecial": true,
    "special": {
      "move": "supermandive",
      "chargeTime": 60,
      "hitCut": 3,
      "punchCut": 1,
      "rise": 0.55,
      "aim": 0.65,
      "lock": 0.3,
      "speed": 1500,
      "damage": 30,
      "walls": 4,
      "wallDamage": 12,
      "pinSpeed": 1150,
      "crashTime": 1.0
    }
  },
  {
    "id": "c-ilia-topuria",
    "rev": 14,
    "builtin": false,
    "weightClass": "lightweight",
    "name": "Ilia Topuria",
    "base": "Brawler",
    "bio": "\"El Matador\". Built on the Brawler base with takedown and kick defense added. He throws 3 and 4 punch combos all fight, off both hands, and every punch that lands sets up a harder one. Land the whole combo and the last punch hits 4 times as hard, up to 5 times the more he's hurt (4-PIECE!), and most of the time it's a hook that comes round from the side. A miss, a slip or a block breaks the chain. The more he's hurt, the faster the combos come. He sprawls on shots and checks kicks, and answers both with punches. When his opponent is armed he draws a Spanish rapier: it parries 9 of 10 swings like Dustin's diamond sword, every 3rd parry starts a sword duel, and every few seconds he lunges down a red line at them (ESTOCADA!). Every so often he walks to the middle of the ring and spins into a Rose Tornado, throwing roses all over the mat: it can't be attacked, and anyone who touches it is sucked in, whipped round and spat out into the cage walls. Special move: Aura Farm. He goes to the body right before the finisher, so the hook that ends the combo lands bigger, and comes up with uppercuts up close.",
    "color": "#b3121b",
    "label": "",
    "imgData": null,
    "look": {
      "skin": "#c48d66",
      "build": "muscular",
      "bodyHair": "none",
      "hair": "short",
      "hairColor": "#17120f",
      "beard": "boxed",
      "beardColor": "#1b1512",
      "beardChin": 0.08,
      "ears": "normal",
      "tattoos": {
        "leftArm": false,
        "rightArm": false,
        "armInk": true,
        "decals": [
          {
            "img": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAANwAAACbCAYAAAAJB/VVAAEAAElEQVR42uz9eZhd5XUnCq+13mHvfU5NmpGEhGZVlUqzxIwlzAxidjFjPKTJ0O3cTj/3u91Jd76iOre7c7/cJO12QmI5BmNmitngeaAMxoAtQBIqjQjEJEBTqeqcs/d+h7W+P04VUWgPseN0utPez3P+qHpO1Tn73e9611q/9Vu/hfDr6x98bVi9uhIs/W5kyLyPMTAgA0EIDCO1BhQhQFtbB2hr4eDBw9Bo1GDqxInQ1tYGjdoIjIyMABFASyWFlkoKSZKhJgLnCnDOgXMOQghAWoPWFoAIAvPYpxMEBuAQgIjAphaICCAwGKNEpxY0MwAzaE1A2kIAADf290QaCAAYAAgASIMkxlhL5vUcw51f//rXy2Nudfytv75+yYt+vQSAH3r9va++vj4CAFDWrlCIHQAQAACBAEhrIE3AzBBCAB7b4CiCKII+RvS+xBgjKaUoM4YSkxCRBmYOLrgYYoyAErVSURsTCVUEkcgxRokSRSQSYkTEKNL8GZAiIURAiAjISoREkFCQiAiUUWiMQk0EiIhEAKQJtNZjL4uIygny3BTUTVdeeOFVV5x74Zlj9/prY/sHXvrXSwDyEwxQfiGLVcqAMAEIAAFo0IBKoUSBKBF86bH0HrS1URkdERV4X2JZSIjCbIyCSqUKWZYIgiRFWbbGWAoBgTUKbGrBR4YQIjADCDDEyKBQAyoCQoYYI4ggoEjzq4AgIwQkNQLAEFnEEKWVJAsRAASd9jEGVKg0aSAi0ERAzRdyCGWMfrZzcQ4J2s0/+OGC3vPO+/4DX//6LkSEX3SNfn392uAQAOTcM86YZayYEtNDWuviQyHU3+tSWhcxhMjMQKBBGYVAOrgQAAAiA3P0pYSQtAJhSholOBfqwgsIVXuW2WhTi0qr4F3ZwTHMFpZAClBpDQgE7DwwR0BSQECgNAKRAq0ViAdARAAUQFKgFEFwgVAkR6C9QIzCgQjTvcropwEkIU9dCAwoKkdE0FqL1c3w0gUG772UZelj9KiJGpgkC7VJ2q666qr/CgDx16bza4P7pQxOEU1zpb+SeLSmjOUNG9Z94YknBg/+ff5Bf38/AwDU0/RlU3PrAKCqFHqljPgQO3wIARFPSBM7FQQKVxazJYYORRSFWZglMQYVAYorHXrvgEOIKOATm2hjDSAgFGUBeSMHIIRK1YK2Bpwfy8GUBhUBlEIgpcBYAwoAPIBEjlVAXg1MDIQpc3hNIs8TFI4xTgbAixTg/UT0NgpWmYEZGEJwULiiyiEcFZYoiJq0DtqowfsGBmJfXx+N3/uvr18b3N/H0D4IiSzAHiAdmKEDEUfVKLQAwMHzzjhjeqbk2prOv/jtb286+rNCzdbWVglFQ2vvRUQsMHc6X57inQualGENGkTAOedZOCIIAQooRKe1EgSAoiwgeg/CjElqMEsTsVpDjBE4NENGQgJCAKMMIDIwACAoCBCASINNEkhtIsIRmCOCIKNIHQlJk2YRmOm9f40RDSp0FEELyNnC8q0o8QCiaGYQDqyF8coY5Q0iBKXVm1rrzTFJthx70PyUNcG+vj4ce5/8OvT8NWgix7zwscHBozbDL5ose6DDJH/62ODg6wAAHUSJQlWdoDP7wUb6CeslItjd3R2UMvustcAIPUVZfLTIixCCRyL0xqgGgDQ4+gDCoLQSpbQordAaS9ooEmYqipJK59CXHlzw4GOEyAykENLUgjUJABCwMBhtwGoLgM0bIUWQGAuJtUYbUogAIAyAYI02hTEmEuLS0ru5zJxYbd822jyISJYDX8vMa2KMHgWVVtoZbXYZY1cppdcAqEkKVKi8/z79hLXEMSOjcQPs7+/nMaOUY36Pvza3/w0XoffccydCWbqBwcHar8JDjm+yy885ZyqKfOro0eFrhkfrE0sXojQTK4gsEAKDjwxECIgEwBGM1tDW1gpGKWjkDaiPjkIIEZQCSK2FNLGgtAKtNSTWQhSA4Jt5XFJJAVFB4TyURQlRRFpaqrqjrWOPc8W0w4cOtAAITGjryCuV7F6JYbbz/iwWSYxN7q+2to+KQD5ar18QvD8BiYyx6nua9GalVMbMwRX57Bh5PRK+3pJlT0BL8hcDAwNx/J6vvvTSWfc/9tibxy7OdWddNC8qXivIh1qS5PnbHn989ANUF/qoH/739nr/nDzcuAfCnwXhs8hJrPXCY3/3oRP6Qx6s+bves8+effVZpy8a947HeDvp7e1Vj3zrW+8bxM3MMqNeqwXvHBISEClQiKAIwRoN1iRgtQJFBEo1UUFjE6hkFai0tECWNh1q3ihhdLQOeV4AAkCWZdBSqXxQagBGQBBAbn5BgyRWG6uM2kWkXjPaWGss2cTuTxPDaZLuRsQ3QwwECIuNVg9po/YZpd5ERBLmAiIuR8SqSRKfJIlUqi27rLYvEODCGHlS5mnOsSEjW/vOTb29x11z8cXTrr/o0vW951/0KQ/hU967ld6Fc0Zq+W/3nnvu1defed7iT516SWs/NL3er3O4fyahYv/fPsy/UzPqA6CxfAIe+ta3vvZh0ONn5Ru33DKWp1Cc4h3e9LH1pz7fblu+1v/Nbx7ugz66BfrlqrH3BlEuhBhDiKiNBmsNAAN4QFAaAYkAAUEEQKwBrRQgIDBHIEVQzTJga8CVOTQaOQQXoShKsMZAJXNgkxQSa8ErBgSAGBhEGJAQlNJAipAAhRSxTRJBRFRG70OdvI/oqoSoOTIIy1SrTRG4+LY25kQVQl2YqwDSSqQmKsBXk5TuK3JzY7ThdS7j2ii83HP8CAC82t/fDwAAaQ4zSwy/DUzRMyuJjCHGRoyhJAAAoiqxWlEALy+TMNr70XN/DNT+wgPfemAEAAAR/7czPvXPJSy+6KQVFy6YM3POR5evfnfTrl3uWG81+HfDv1/oGhxs/t2CJTNGwdP04MOqPIbOFZ0L4S9f/dK+fgDo7e3FmS0tHTGEK0drtRVFkUOSJFCtVEHrpmGZxEKiDSitwSQGsjQDa1NARBAJQCiQaANZJYU0saA1gWCEGBiYYzNPIwXWGtDGAAtAiAyAzd8rq8FYK1qZdgSZLCKJtXo0Syqbjap8nsS1OFecVZZlRkpppUyiTGUYUeYQ4bsI0gaA7SJglaJ3BG0VBCYzC8XIywRlGpE6sHbpyjc3b3/lEADAkq7Oj3CQ47wPoxyD48A5g2gEJEBAAWKB4JklhMBGCHqMkYm9N97w8rjR/trg/hc1uMULZh4JjXDtodGjq3rmz5Vdb7z1Rt+6dRrmzKETFy8+a8mCBdOGXn31zd7eXjU0NPR3DPC6iy6a0LlwYcfQ7t0/La/DnTvfLC9Yc9K2RvAtDFSVKMt7Fi2YtKKzO/+LL3zh8Iqurp5Gkf9m3sinBJaQJglmWSbGWjDWQGIsGGvQKAVGKVCkQWkCRABSCqzSoK0GQwTaaEhsAlZrIkIJIUpeFMgxgjUWjLbAwsAMoMf+TiuNWmkmpdoBwBCCyqzZlrVUHrvz4Xte7Fmw4MS8yM8s8kKHKBaRjrM28daoRwjNWygy2QW/sHRllYN0AkhAhPdDiAtFuAtFRrXWe1Hh3q07tr31qUs+1VpKflbRyM/wzq2KQeYzcA8wHkaFo4qUUkoBAKGwoIgIkTRQ2WnLlvS0dC1b+u7Q0FAJACgA2P9rg/tf69q1b39jzozps0ZGRqdrpZesWbrs/Vu/+9395513nqofPHhjiHH+2tNP/9F9991XHgt2XHfddRNcvf4HAHDC0J49z4+Foz8p1MHnhob80N7Xt16w9sSXjjby85xzn1BIbWuWLt2Tl+X5jXp9Xem9MlpDmlixSWKSNDHWGm2NNkor0UoLKgUgDMICxjaNKxmruYUYgEXAGENpltYTm1iUqIuiCMEHRKWASIEAAiGBNgaUUkBKARIioQpEoJSmepImP0SVfGXL0JbhJQsXfKws/fqiLBreRyFULalNDk+dO/O2jbdvHFrWvay7KIpljUZDmGMKiDMBYBYI9IBIgoSsSO00NoWT55+ys27qs4IrL8jzxnrnXAezTBCAyaTIaqV2a6uU0QoABAQEAAEVGSJjAqGep1H3rF100pZLrrnEnzk4+L9NaPnPAjQZBzyqWcuOlvb2CgM1XIxnXXfRRfNGDx6cL8r4wID19w/+i2s3XHZKb29v1kT0BQ8fPtxArZ8VxD1jhsY/o5wAfX199OcDA7kyZggRQ5ToCxd+t16v//ZIrdbmQ4jWWs4q1UqaZgeSJHkwNcl9RpnnjFK5TQymSQJplkKSppAYA0Y3DUYpBUQGFKEQgLLKvNDa0nLXxImTDk6dMqWapqnkRQGjtVEIwQMqgMhNnuYYJYuFI4oIGkXPIeBwKPOzb7zssk8RadBKvZ3YtGKMjkikmHnZobffWwsAkBi1OzHmSJqkBgFKiaEdBDqMVl/VWm8WwNZGXlxQq9U+Vk/qJ06eOfk1QlUwg4+RyyhcIGJJCr3WCpVSgkQy9r0AERE0AQKgiNRZsOraJnB/fz/3buidffPNN5tfe7j/Ra7BwUEREfz2Y48dpUQdQbQn+ODJRziTAJdaY44gEdTq+frCubMTrWnl2rmvXnnljW7Pnj1haPfuHdv37Nl19aWXnrrmuOMObN63L/YB0OAxdaZjPgsAAE/v6tou2uxHUh2jjfrFR44Mt9drjSIx2ra1t7dUKi0vpIn9jkL0keMyjn6SiCQIkCgiIaUBqQmYBB+AIwOKACEAMIP3TmKMMwkJqq3Vb2dpxStjZhV5wT541CYBIALvHAgLJDZFrZVl5kQR7k2y7AUQUa4oF0eGKVrhKCGOIMIsa22SZpkzyn4PkDpWLV3eDiBVRKoT0hwkzJAwGGO1sen3o/AJrnDT8kYdWWR+Yi3cduftjy/rXLa0LIrTfQiRCFEZpbU2B5XSe5GoAgjCzBxiJJYYldIIpACbXGpBbsxZ2rN0JYKsO1Q9/NyuTbvCr6BUhX19fTT4P6nX1P8cvFt/f7+MIV6jAPD0hes/emZt1J2O5Oei0j9M26r3kkqwdOFM5/0qX/qjab392b6+vp0AoPbv348bN24MxLzKt3UsAoAvHYN4yk/ydBufeKIBAA/1nnvu5xu1+vTa6OiIUiptaWs72NJS/W+ptVvywv1fjXr9lKLIdWQQ0iooQkalQQDBB4HIDBwCADMQSNMIo0dXFkKEprW17TQWqVRbW59slZgG59aO1vOaiFDwDrxnqGQatVbBGPu6wjBFadphjHlGfFgeFM0lpCPa0ACyWR1sOEkEtU3sV7RW7yHyBAn4ESIsRJiZo2KOIALi0VFkvib4MNEH7wBRECkXAf+b1/7mwkPDB84IMY6zTZBFgIHbtVJaKXpVhCey4hYMwZFgOwDUCFGJiAgH4QhzJCACR9d+oL0dABq9vb1qrNb3y6PVY4j0h/J8+bWH+xUAJuMn2RgYAtdf0ts9Mlr/VFEWJ5JWkFUqh201eeaehwdeWr1ipSCqIwByGJHoL7/w15sHBwd506ZNDABw0pzle5z2e1csXnzq0s5Os3XnzkPXbtgweU1Pz8xLr7pqeOrUqXQM4EJ9APjWrBN6jwwPLyyLIp8wYcLESZMn/ZcHv/GNv1mzeCUcOXrotw4fPtwxMjKSl2UZQwjsfMC81oCjI6NQr9fBhwASIzhXculyca6UoiikLHL2zkMIsdBGzSUiZZN0izZ6JpKqhsjsvEcAkCSzupJlo6lNBoDwVa1sAFLfg5i/YBJjrIJHvvTww7uXL+kqY4gngSBbm7xgVSKi8RsJqaec9wsbjcZleZ5PDCF4ImVEBL33VVc4DsGL0VolWeqSNH3ZBXdybXT0I7V6HTlGAELkGKMi6jCJfeneJx79s+ULu0YicI9zZRcDnGK03kaKHDebF0iabQwBQAiEe5YvWfnqfQ/dN/JLejkEAFi3bl26as6izqUnrj40NDQ0vi/41x7uV4NOyrUbrug0mRr98sDA2wCAmiAjUgqVccokdWWS1zBaAwBw36MP3XXdlVeP+jI/FUEmXH9J72JBlynExp2PPrrri98cOAwAcM3FF7+nQC0AgJ2JtRMY4Pj+/v7dH/pshr4+Hb77vXnBeZfYNK1Wq69OrE4c7Ovro6HnXrgkzxsL80bjkNJKJUlirTFYhuAbRc6NwiEqBa3GQlbJFKBY5EhaKRVjhOgdOudyInQSxQNiNMb+CIiiC+HjZemJfRTQABIlhsiZj3ycIL6LwFZppe8YePQQAHx5vBYJy5fv2fnCpm9E4QUg3BLY74MCDoRU5sYYlnrnpjjnysQmOkuTo4CU5UVhffQSImNgjsrY1uD8alLqDRd8JS+LEkGQmSHGwACSpUkWAADISA4OQJgXxhhnlALnKZYdgmSRaB/4mAMqUgTA0WcS3b+49qJLn7/3yce++ct6pWqk3lGfn4Rvub8GgFfef//9KR856SMnOnTfeu6554p/ak+n/icxnF+oRjYeo191zsWnOfbX+DL2LO3qmbBt1/YdS5esmh2ET0SiGYm1h7S1O8hQx/Ily4+u7Foyk0XWMot4V87z0Z2qCOcgwLatO3ceGP+/r+za9d7WnTt2AwC8vH374ZPOOOPtJXPmdK3sWtGxsKer1tvbK4ODgzJn6tSVtdHazXlR+Eolq7a1tj5999ce/+K/nDqVXjo68olabbQbCYsJHR1JR3v729Vq+p4m1eJjSJz3USmDHR3tNHHChKPtrW0HKtWWH7dUq3/d0pJ9p5JVh7NKNi21SXtWyQ5XKtkDdz/+2J1LFy6eGaI/y3kPPgYAECSlxWhjEGE+SJyPAO8Q8JGlq1a8N3HixPiJT3wCYHAQ+gcHeXl3Z10hrUCAgAjtiHiycJxVlP6kvCzaOEbOsgq2tLU9mth0JzPPCCG0uuBjUZYoIpBVssKm6a48r3eOjIygsAARQelKFMTYWq1MWXf6qd8YZd5PwS8M3p8cQrTMsQ0AOwFgPoDME4FpIDKKJDlIhOg9kKLuZUu6R1/ZsePNXzAXQwCArvlz59TqxUxEWtw9f+lbSVtykBguj8gvvvHGGwX8E9MZ/2fwcMfmSj/3VBtvDbn+/OvbChleVxaF9hGuSJm7rrvs6lIFtb2l2vJtkyTvCMdDgpKXRTkdBf6zcAwhhOnMsR2EJ1utB0WpP7370Ud3jf/fmzdsqIyg+nTwodtqtYts4hsHDlXL0q0AKTrIpv9vf3//d3t7e5WPsapJU5okwVgTlVLtN/f2tl81MHD0yjPPXphaq6qVzLS2tT2TWfuqAnjWmGQFA37KedHOhaiUMklaea3aUvnPc7oW/Li/vz+M3eptN1x0UY/z8TdQU8Nn2V19fX2068UX5yGqYKzV1kcovYPgHZZlGQHEakUnsGatNZWq4WcNDg5+fnBw8IM8a8HRo7teb+34WiSajYjziOFAEcJc58vjnXMFR0YEVAZpT9qqv+lDOsEFd54PAcqiZGFJAenlE2bM+pORkeGT0zRZKAh5qjUJCChFgkQdMUYcGBhwN1x88WtZmm0WhpMFYguABBB2IpiBxNWAooTNEyJQAQAUDqy8jAIA3HLLLfILFMgFAODx733v8fNPX18HgJMjlNfC0dhQymStSesUADjyT21w6p/as51/5mXzF3Uu+M2FizrN7t07X/s5C4KDg4Ny/fnnt3l0/yKEaELkE1j4dBA8nGbVsrTlt5n4hcy0ThWJHb5w66L3J5fOzXFlOafI84llkVsQNolN3jphQvud506YIEONBgwNDcnKtWun5Y3ylhDCFVF4MpF6g5ROi7z8SF4WyxTie9v37P7u0NCQXDF16tsHjD05Mi8AgIaxZgqgevuUJd0HA8hMo6itkmVPpVl2FzBPYpE3F5188p1H3z9Qcc59pN7IC5skpqVa0SpJ7/3crZ97b926dfrEE0/EoaEh3LJ793vnrlo56AGev+fhh48ODg7CskWdy4VlEiHNigBljJFEGBQpVKiYCJVSar8xeh8Z2L15aGjH30FZ9+3jzbt2vrZl546Xl3et2YLi5hXOn164cop3PioitKkVbexeBBUApMoii5k5iTGwTWza2tKy7fN3fX6gp6un1zk3M7HWZ1mKigiM0ZQktp6m9lsvvfLKu1t27dqzrHNJgxQ5RVgnIhSESShAiPQeEWyxCkeVwhaN5EnRs/c8+eQPAAB+GTZKH/TRF9+4Y+/yBZ1H8zJf3chzFKSolVq+eMHct3fv3XvonxLFVP+Exibrete1WKdvDpErSLi4e1Fn3PnTjQ4BAG5at66jVOqT3oepMUodRKYiqdnKJJvTJH07DemWex6+J1+5fI3KG7WbyrJYJiBEABSjC64svXMlB+ciIc71wDv/8lvfGhoaGpK+vj5qmzhxdPjw8A5A+KY29IzO8aG0I305z8uV9VpjeohxxYrOnmlrV60eqbW0LXDerfUxnMAxOgRIkGAegGkFFGUT/chxre23bnzkkd3d8+fPBoDlf/HFLw6uXNRVNori+uHRES+AMUuTianR772yc/tzJ554Io6hdNLX10d/fOutfvPOnUVfXx/Nbmu7iCMvAqK3lDJTRWBSYB9EAJuME4PWapck9gfGmKfvfPCBR/v6+mj9+vU4Vs5obsp1fXpw3yAvX7p4CgdeVxbFGu99SkSQZRVjrCUQaQfEGFimxhi7QowCAKC1oSRNylUr1nTWaqOr8rzIrDGcJAkCIYKIMMc0+rhy1ZKeljOWLd3hJU5AwB4R3ibIbxDiCCHs1oTPGk1HFaHSRM9n1cqDX3700S3/EC80FabSlHVTVIuhtCz96tK5UmmDIhEB1drO+QvjF27/4mvr1q3Tn/jEJ2BsbeR/i5AyG80Im51bJYAIIi4HgO/9pLCyr0n/4VqazmTnjg8MhxBVqo19g1B9SaV2FAmzUAkMAFDmtfaiyBd7XxaVSiWk1u7zjo5TCJOLQmJZFHmtNuIR5U96L7ggmz1p0mP9/f31vr4+uufhB37w4c+/6pKPfcPY/MyRo6MN5/xv+hguzCrZM0F4IrNwECaKwWvnukqgt61Ve1nBrj8fGMj7+vpoz3PPvSXMUwAAI4SSiCIiQJkXUm8UppLk8cP33d/fz2MwOe/btGlFFDmTRY6S1qyNfiJIvDgNyXGlBE9EoAiV1rpuTbLjzofufwwA8FiC9nh3RH9/f7zuoosmcOEuDd5XQwyJiGClkvqs2vo5EGjxwX+iyIuPAaL13lPkGElrQsKykTeW5Hm+bLQ2KqUrvVKEVhgQCQQE8kYhMfiViG3JqFE/1pC+KdTYrIi6OXADibZogEQpVUHE18jaB+989NFD4+BO/z9ArGgABiIMAvSee8ECRODUpqiIEITZlXkpSbLuoosuevvJJ5/cfewh9M/d4MYbE2svv7z1JQnxVCXiUeni5/2hjdEFpTwp6CBlPGnbIFQajU4RRJHXqwHgeyJyYVmUipmN0fr7bdXKZwuLHcbQlYnV88vEdpalKxt5bnyMf+p9+OT1l175x/39/d8BAOzt7aUJEybQ9OnTBQB4z57DD7VzXOV9uGK0VjsAAO0sfF4MkbzzTqIgY4QYYxFjWBadvKNAz+3r69t2yy23CCI+vWHDhk0AIFVj3jui9bvVrDq5UZRFCF5+WqzR3d0tACCByYTonSBGjWgAqaGV2mdNcjxHcUSIYxkwMvJ4Hig3XX75yZF5JiI+1d/ff+iDB080K0o83nnfE7xrBQCyOnnyvq88/Kcfv+aaZW44nBSiXyUCeVmW7MoSBRFEK4jMHKKPuctBmMcQygiE2NRTQQBmKQWhyKx9feND9x4EgDtuuHTDxYBwIjJ2kML9BuDxRrW6deBvZRvkFzG2PgCCvr7xro+xCOjS9hFT/0it3jiRBYosy4i0BucCutBgdE4rhddceOY5gyI+xki+/elJmwZgIP7z9nD9/dAPwNddd90zUC9XM4NSitRP08sYexAYJkzYa0dH/zKSLAel39Ttra+aBk8LzGfFyHME4imf/cxnn336tadnC7MFjojAI1984J4fAAA80Nv79a9YM79M07WuKP/Po6Mjk44OD9e986sA1L+78Yqr0Cp5cQTg6MaNG/0xX2H009d8+v/2MSyKMSwFJC8ArRw4Dz7GyAERNbARFIC2wNIiLiwY634GAMAnmsVySDtUqDYq77S0tExxYxpawupnhjVKiUZGgyipIkoEmYlor9F6ZTRGRY4SOYgLwRgXl9/Ye+3pBKEWfbzYl14T8JIbLrzwBZkw4dm77757xIu8g4jvA0ISog+IKmPm7/cB0OHhKTtH4fWDEiP5yOydU857QKUBEEErFGAABEJAgMARytKBNU2moNWarTWZUfpb0995Z/jm1avNxk2b4l2PPfGV6y7ZsIACxLKafeGegYF8PF34BTVSEABk79lnHx9+8IMEAHb39vbSwMBAbGTljHLEnVt4/16lkmplNDMAEAFo0ggAIfpIEcOFHKMGxBr0wsswAPF/RIH8nww0GWw2brYUBV8RWCbH4BxJnDB84P13tu3YcfCnJbZDQ0Oydc+ekVd2v7r7lV273tu8eXO47JqPHVmyYOkbRLIeIL6VzWnZdGj/gQuKor6AY4yJMe+vW73q2dWnn178uzvvDFt27Di0bffurat6lgbn/Pm1es1570ut9DRUtIqBZmnUs1d1r2hfsWzZ/EXdnQeGhobCS6+8VOte3PMugdyYJHZvW0vr85GlJc/rrUWRM4pgmiZcqVSfSIzeQwTTli9c2L545cpXh4aG4pjnVCfc+3B+tLOnFkK4tNZolABgWyoVuva1GwambJsCx973U089Bf39/dCzZIkowE5NuBcVPS8Cs1BIM0MXC6sQPAQfRQQyIpxkCCMA9cTg2Xvf4kO4JMY4h5yb0LVy5Uv3P/ro6InLl++MIazwpevhGCRJE/vXe199eEHPCSvKsvw3zjmOkcHHgIIIWhtIrAVEVFFYRAAFmAUEmCPyGPEaETlJbTVJ7I/+8pvffGrT/v0fGNPyRQuXJdT60F2PPDD8oc6NX/havHp17d3R0eF9+/bx0NAQAAAsmTcvklIz0zQ1qU2C855GR0fZx4DWWrTWImkFEWIJIM5oU6aVygtDQ0Phf8S+/x9OXhYRBAC4+OLzlvj66L/hUCzwZek5MEQRWzr3i9TuPmhivPeJew+SUs8qomf6+/sDURxQqGL0viyKfNWRkZH/1Hj77W4AwL5163Rvb69qb60+XMnSndVqSwuRgqIsQqPemJcX+SXeu8U+uDO9c+fpgNf39vZqAABjzBvVasuLLe1t/+Xexx/6eFbN7s4qlQxQ2AcvkUUpTSPz167+HBhzO4hMtUeP3nLDWWddCQDS3d0t/QB8XIv9vkmSt5FUlhdF3fti5atXDK3v7+/nYzrRP7i/ux955K0J4YQ/ufOJJ+60adyNiCkQjiijdiCqJEZh5x34sogxshaCw8h4G5F+SmmlYwgT6/Xa6tHa6GfUyMg5AABfHBg4bIx+IE3TnVpbCywzPnHl1WfE4K8N3iXBB2GJiEhgjYGsklJWrUhWrZatLS2mo71dtbe1VxJrNYcoeZFD4UpBwhSR9ocYW66//PKLbu7tbQcAEQCsTJ95+xe/ct/7AID/QAoXDAwMxMHBwXBsWWDgm988vOz0U289XuOfGmO/gYgTFWIVmDUAg7ZNdeo0taiTJFGpeWdgYCAHBDjnnHOqvb296p+bh6PBwUFZsmD+au+h0wWuISEYbVqMVs8sf+IrP3xKBM4880z5WeHENZdcMmPpnAWnLu3sXrxyyQq9Zce2g1u2b92+efsrBwEAuud3H18UxcfyRsMzRIWEC5Uiv23Pq98d3LdPlixZgnM6O4vhg4edVvpkEbDeeRFhr7RONaqpQWJHiHFGDOEUElq4fNmKhkFaY4z+8cSZUx/LsgynT+zYw1HOjDFO4RCDArJaqWm1d98/ePeTTzy9Zc+eH69cuPBABPBb9+59c3BwUHp7e9Xx3d3Fgf3vdhV5vqosikZrS+uESjXbvXXn9h9+iEL2wX2/sOeFAADQM7/ndOa4CAhLIhqJMS4oy0KXZRCtCKvVat7ekv6n2x+6f8/WndtfW7a4c3Yjb6w/OjLSKBp5Rkqdd1JPz9bLr79+3+c2bty7anH3W8ro6UqblwnxeO99p3N+TozsUAhJExhjIUvTmGWVb2WV9Fs2yf6qJcseSLP0gELs9CFk3pVBKdIt1Wq9Uknv9c4t9mV5vRMZ7b3uupefWr8e/+zP/uwfO1fCwcFBvuD66+XdN9+8VCt6KUnSbTZJJjhXVEofWEBQmAFQQJFOuju70nmzZp3BMX6sbDQOv/r66/v/sUoH/8M93DixtDpx6tNa6xGllNWkVZKYo1lL9nQ/AN9yyy0/Exbu7e1VUJaX50XjvzTq9c95737jpiuu7QQAuHn1zRoAADVeJAQ2goiPEjhKIgzTxk5CGRgYiP39/RxTc29LW/vdWbU6RiiOxFFiYJkWQ1wZPPeEEGa6vLipqOX/AVhMOrH13s997nPl4OBg+OJ9973X2tb+V22tbY60VqVzRZ7nx5fef+r6Cy+5CADgy1//+pZ7vvWtH3wYgbRKfS+1VilEEfaMIRz5eYXd3t5eG2I4SQBKRDSk6TCi7CBFCSEEVJQS0LMzOzv3jrW8YKaqj5HWbwtgtfQhr9XqSSMv//0bQ0OTAADu+caT3662p39mkgSBVC4IkZRCRQRIAIQEiogQoNSajlSy9Bv3P3T3d+5+6O6n73/k/j9q6+j4s/b21qNplqJRSimiYRBpiTGuapTllBjD2ldf3TL5WHDj5z3fvl9yb47rrQy9+OI8gDgX2qrPPPytr34/zbJnIoOt1WpQNAoIIWCMwgRUjYHP9aVfGJ0jLVr/c/NwAAC4ZcsWt2LRkgOk1VJltDLGvH/f/fc+DdBstxk7YX4ipevEzs4FRVH+ZlmGzhAFgOh4bc3w2Uu7t/7lt+90vb29FiN8unTlrMjijTWYpJmyWbJv9cqVW1bPnx9WLFvWvnzJso9YTBYK0syiKDqL0iUCINpYBBAOgX3kGAHQMwhpoqPKJn/ypbu+dOSB3gdUskSduXhJ1+FMt7yTN2qnN+qNmQIcEpMEpdRU0hhWL+453DN/zujWPXs+iJV7h4ZwEEBWdi0ui0ZxRZ7XLQGg1jqsO+/cb955553+p23MJUuWgOGYo9IzQaFlRh1CWBu9yyJEIVKcpOn0/Ojod2+76453e3t7lW7LHPo4xSiz0tjEAGEUkekEmK085eTntmzZ4pct7uphhmkgXBdGDQALIjPGGAG4mZeBSALMUxlk15lnn7nnjEWL0jUzZtAXH3/khdVLV1sAPi+4so6ILQCyTDiiIoyJ0buTqL6xeefOvxe1amhoSI5pjfoFit5AQ1OnYu/QEN66a9fhpQsWLJCyPHHBCfOO896vDyEAIgRFRFZb0MaAUUaEuYwhBKW0tTbZvnPv7rf/sepz/6R1uPb3pu4ZnnXYBWbLgduu7b12XQXC1jJJyv7+/vpP8Y5YV+p9RebHpHkpM6sQ4wTnwvrDurUBALe1qtZlo1hrQ2WiSRJQhIBKi6CuOu8vyxEngAsZAlsgtsGFHhGsKmMDIKIggg+M3nlUCsEmqUmNLW2W/GjSzEnvAoBs675KZHPvhSlALlhrMMuy4ENhjCaltQii9mU8nVW+KDH2yfPPP/8LH5ZRtzilzJKjZaZ15vI8+rLszsrSAkDjp222Bx54gBHx+RuuvFoR8AYBVkDQQUazYo0iwM6VlcLZT910001/1Gg0RhuNhq/UJ/0/dkr2livdyjxvfMSX5fQY+QwRUddcfM206MvTvHdLo7AiUm0ogCIiIYSm6FGTtoUc4wm+kf/B27v33SgcMm3SPddffn3/gmUL/mL7ppeOA+HfdHl+tGCOxiilra4BSu4w9ty8evXzGzdt+rngxFUfXXdZatXeL3/9u1t+EeSwH4BhYOCDQ10pdV9Rr//h8NGj/4YFdZZVh7Ik+07ggChIlqwQELAEstoyEoIi8v+Y9K9/ko7vcbc/MuNQlw++4pwr86J+XN5oXDHccL/ljoz+1rWXXnrl1ZdePetYoGWsfocDAwNHbaV1QGsTAzOGyBiZJwbgGTf33twmShqImCMhCwD4wFT64Arnl7kynO09X1L6eFUR/IV5XpxXODc3AAadpJgmKZgmEgciAoGFAcAqTa8r0qOH3z0855O9N6579eWrP84sgkAd3kNPjMEDIjEARBaMUXxkmRZiXOKZV02yrXM+4IKO1SE16+E0sc+3trYmmsgHH9qH3x3uOHaN/rvQAFF6e3vVXQ/d/2yw+s+UVjuUoi1KK1JEACgcJdoY40LO81MHBgbiwMBArE6t6rseHvjipPbqH1arLU+mWeVtre3WarWaV9LYEWJY6kI4qSzd8jzP5+R5wWVRgi9LiNELISWVNH2nWsn+KyLUyiI/udFoLA3BXYDgp/b398f7v/LY77dWqrfaJNGRIzALC0vWKN15RV7+67Ln+Cr8hKbeY4Gw6y66aEI9L/7vwyONuz9+/vnzYUyG8OdR/gAArl532vqrP3pK77Ub1k0GALznySePWLJfAxHnvStY4gKO8SoJYkPg4EtPrnAQXIDoPTJLAJZF/5ilgX8Kg8NbbrlFbt6woSIE53Lk3Mew1LlwdZ7n55euOM05PzEGPlWJu+RYpG4s3EAAACIiUppAAJnZichsFp7ltV9x+923D2ltNhMpJyAUQ4CxHjNTOrfS+zCBQ4zsRYUYwcdYAjMaJFBKg0ICEYEYGYIPEGMQADKKaA+ynN3I89/xoTxZBA4IwKrgwwXAgKSUAAJEZgBAJMQCiYwITjII9th8bGhoCDc+sbGRGP1skti60loApKMRXevfB537ZG/vFOPcWmCpAsAoM2NgAY4RY4whhjgvOFl24xVXXXjdlVdvGI4Hf/OG3qtvPlrABKVod5qmD6Iyb7iDw+c38vDbrvRLy8KNFnlRFI3C5UUJzpUQOACHCIYIUmNuvfuxgf9stb5LmF0Ioc6Rc62FAUAQETuOn/H/04ndLwC2qQqNuizK1rwo1pQ1ngkAuG7dOvXhTd3b20tNywk9zrn2eiOf0XBuFQDgwFjx/+etC4uU3ss5scFXwlgBvX16dXtrS8vuNE01x+hD8FOE5RKOIXWu8GVZYggBAjO6sixdcD2XnX1h18/IN/F/JYPDvr4+RETZ+MQTDWTzrkKDhHrSmFVZEVwDiJMY4D3mOOOGSz52zU3rbkpl7FQcZyWgxFZujoRBAOEYYxadmxdAUgBArc2WJEmPWJNoUhBFGJz34l3ZcL4MIUZAhKZIK0hzABMKMAcoigKKvIDSFRyCk+A9SwyZBj1CKA0QHonC04TDcT54jD4mqClNkoSNMjB2PAgqZZH0UUR5VQTOHAdLjl0QH2lG8NzqfOTIEMHH/Oc91E/39k5suPBbeVle0ygal5TOrfLOCXsPzIwxhFj6si3PG1cVrrzOFcVFzhfHsY/TlZIbgOX44OOppSvOOzpS+7f1Wu2yelGg8w4jRxIQBBBQSKBJAyKKoIhHeQ0ASGs1pJU6jADG+dLWG+Xv/sb11x8PABxCYIkSIwuh0k5pMxxCcM6H1uj4NACQwcHBcNOll3b0AZCM1Sbff/99BAB0pT83Mmhj7ahNkncAQG7etCm9ecOGys8DlAa+/+wPU43/CRHlyjM/8qkN6874jcPvjV6WVCrfq1ayLUSYIWCutJ5MRJcwQCooXkQ+sAMXXIgSr+89//zusX+NP+mz/lcxOOnv7+ff6+3NrrviuhNIQQsqFVBpTaRYKaOI1Fvamre0MhkpI4g8EmdFBSIAANh7bu/EPS++8rGiLP8PEUlIaWYA8t4H7/0UCPGkvnXrVFTum2mafrOlUolpWkmM1kwIEkIg7zxG54CjBxRo5ngIICLgnYOyKECEpZJmLYm1qXB0riyPG81rn+EgC7TWW1BQQuBPBO+vYOC5SukyTRNUWgGLAAsDIAICBkDlA/JLfX199EGdZyzX0Fa/BgrrLEyRgwENqwFA9u/fr35CKE4AAB70AkJpD5Fneh9XBx9amMUrRFSopamtxzH4MK0syzOC9xdGF64simJlUc+rpQ9nhhjWeu8XFWUxt3AOYghBRIBQCRGJUQqU0UBNfqQE7yviwiUAwO0zpz2fZsk30zQBiUxFI7/g6JGR/3TjldesbBw68onSucnCjFqbd7RJnkLUqfOhiIEX/s5NNx13zQUXnFMWjd/bc/75M3AMMR6rp0lgWYpKKWMMkVUTf6e3t+VwY+S/Hilqa+FvFbJ/MroJoO753g/32cx+vSiL32qMjn6uUa//BhKViUn2Nwd5EaKiAggnEeAlKJIRYokKkTQhAETnHJQRzmsaF8q6dev0+CG4evXqyj8VSom/6Huvu+iiCUvmdV4y6nE9g6yPLLqI/qTIcSmzlISoSVPDaD1kjLFEUJuQ1+/9m4cfzsfqd7y6Z/FvRI4LnQvrBKFFQCKzYGRmUrqqtXnVT5jx4y/d86UjS1ec9qJRnCmESYQwGQUQRFhYIMSIMQYQEUAiAATg2JxWigDQUm0xrW0tg1mWOWCe6kLwzDIzcJzLwCcIcGeI7ESkBQVbNWEAQAwhgvMeAAm10hERW5EoGE1b/tvn/3rXeH1taCw3iUZvtyyzfQir8rL01tpF567+yGN/fffttQ8zMcZRs8t6r9xfP1x7EwzVmONUFpmsCFlrg2lidVMQViERBUG0hOQA0QlzT2DfKQwTiVQhgJGZAyKQ1tqSUogEpJoSzizMwMDAISKIhNTamSevXP7tjXfc8f6aFcu3kODMEEN3XuSl877Ll+XZpfdnNhq5JSLMKtVDRpv9jbLoKQvnbGIXR+b5MYRFzBKS1IS1XUtkwQknXN69aNHqkz/ykd2+VjvFObe40cjZuXBa4YpeRJURmce27d37/s9CD3sBcH0f4PA7c6oxwmwRnkqkIgkc9c6v9DFUhJCb0u4QQoxtADALCd9QpJwihTFEFBHWVqerepbsWjB73ukJ0tqdr726pVnfXXTW7LlzXt+3bx//MuHlP7Qs8Pf6wHE4v3PBgjMkyrkRUBigKHw8yUV3ko9cNlM1IEUqGqW3g1Z1AKjG1L738tDQ+wCg9u3bx0t7liQguIBFprLgBGZhz4zMIopIKW0m6Ix+/PKWl9/s7Jzrq676I2VxnyI1kZBSQmxDRIo+xLIsUQRAaQXAzXBSmGOWpm1tHW0DDz/56KfXn3zaC0VZrssb+aTSFQVHyRThVACIAgwIyADAiE2CYVGWULgmGNksXUkAxBmKiE9ctjos6Vw+umXHlvo4/D00NBSXLe5aX28Ua2q1+igSzghKVp96ykk/vPv++39iXW5wcFBeHtp6YGlnzzTn3RXBeYOIYpOErEmOKq2NiCAiGqXU28aaH1htnwCABovMaCaYqrnkiKSNLRKbHLCJiUar3GhdKKWqRKhQhJiZEYWN0ok2yTtXXHv1i5+99dbRtatXbvZluLTIi9ZGo5EXRdnqgxcBjEmaUJpVG4zQ0SjKyaV3EYA0gCyQyF0AIhKlWvryChfCJ5BwmonxHRCsNIp8RS3PxXmXEqkZqU3eqrRmP1y0dPn7U7Ztg/Wf+AT8JKMbBJDBQYDNu18bufrEk77bMPBVa+x2FpgZIi8XgAoqRQAYIwtxAIeIk0lRYYx5XRFZZpYYoxitFCk9L4S4SICnLujqHNq9e3dt0Qnz17u8WHLSaW+9MsYmk39MgxsXatFds2ZN2vPGG3X46cKpH1zjp9KKxYsnCOl5qEwBqCsu+vNy7zwzIxAikWIEyBh5LgeeAsIlA8xZsbRn31e++tXDvb29arhW219NKvM5SjUKL2hK+UdkZgQk1kp1INDwiaesffHuu+8uXtr5ktuy/ZXdJy5f8T4Q5obUIVJIAjLTOVcCgBhjAAGROYiI6CxNDlZb2/7PrUNbj2za+vL7PZ1d811ZnliWrkAQVIq8UoTYjMiRgXEMTYW8yKEsSmgqn6qmQrJEAMSZgHC8Mar9IyfMfPmFPXv4hot7Fyw6Ye7vD4+MXDcyMtKIAkRalaTUrODD5cu7eyaeu3zpj58bGgp9ALS+rw8HBwfhuuuum7C0s/uaeq32b0ZHRibnec4AgFoZ0sYMC4oT5ioKKGP0M2mSfqNl6oR7KTXfRpZ3WOAU73wSYghIlNkk2VWtVB5LTPItZcz3kyR5QWvT0EZ7o1SqiFqUUkopisaoockzZ/zgqaeegpcfeCA/EuN858qljTznsnQMpCCrVCirVglJtRalm5LnRfA+ooylySgSY4wzy7LsDpHn2iTZbLPs2RDjvKIsL3elrxIpTpJEBMWVpZtUlu5My+xu/e53N40Z28887AeHhuIru/ce3vbq3u1rurvfQ1IFaXUUSYmgmizQJINSUyJ6nzH6bRG0Ifhm5wMpJlLVwMGHwMYITN6xd8/L99119/zShdPef6ud9x98f9eYDck/lsHR+eefb2EkvwqRLu6cs/D13W+8dvjn3vxYAfuK66577/B7h1cLkomMs5zEEwIzCWJzkiciNtMfaYkcp4UQlkiUyUSquqpz6Vv3PvzAoZUrV4Ih6vEhLvchzgzBB+aIIgBACKSUIqIpxBiXLVl2eMvQlmEAwJeHXnn9pGU9r6jUPGs0bQNETURd2uhUay3CUUJTI0QZa/Ks0nLflqEthwAAli3uOTdKPIUESlIkSmvS2oAmBSzjLEEBEYbggwRmsE35cRABjCEKC2aIeDwijLisum/L9lf2L+1c8lEf/Y3O+wna2kqlpSWpVltSbawGoHZUVFTL/KEX9uyJzdO7eaqv6OxZU+T13xkdHe0cHamVzUGriq21qdb6CIiUMfoJzDEqrY4asvfcfveXD2zevLk4cdXKo3mj+Fgjb7R4H5gIRWtT0Vq/pazaNGHGlG/+zZdv37Ru9SkvadRfAU1PW61JKzVZExwio4b+4gtfePaWW27B/ltvjUu7lkz03m9o5HnpQ0SbJKajo3242tL2I+f89NFaDQrvIDaBWyAkRBSMIcSiLIWIytbWjiey1uqXvOMZzpens6DSWrM2FgEJQgg2Mk9RiItWdC1WJ69ctfeloaH877tpt+ze/d5ZF134vK81JmhF7wKqgABzEcCTIktava20eQtYxAUfvXMKgFCQWCRS5OgV0bQH7r1nATNMiRyj82HGhLZJbx04fODQLxJaql/Qu8msKVOOR4YNErjUWpYvWTD/zR2vv/4zjW48pJw+efIK5+Xk0oWzfIyrI4igIkCloOkvEBAAWTjGEGJowoOTQXCq0sosX7LseMV4ZlG485zzK70PMQpgjABCAoiEABgRYIIIdBgFM5Z2L+crrrrijfXr1+Of33pr4+Vt20a2bN++94y1a35IpIa1tkcU4qQQfOK9Qw4xKKWmaKTkgpPWPGMnTJDWNFsNgFVtjEoS29JsHiUkRGAZQ6wRAJFAKUpsYlWSVshYowGEAzOKSAQAJQgtmlS6vHvVK3c/dt+PTlqz6mvGpo9klWygrbVjm03STUlqX0hT++VsYtsfb3zoISci+NrmHfOXLV2+oWfF0jcVmrTMi/ML7ybHGKLSmitplmWVyns2Sb4Gws573xUCMyDMRaJpq7qXq2WLFy8erTc+kzcai4rShxi52TEKkDDHGRzjqeVoPueUVcu3/PV9d7734o6tI1t3bX/zoxee912u568gAAFg45U9u58fnza0srOrqyiLU/K8tDFwrFRb0vb29u+1Teh48OhIffXIaH1C4XwEJFSKABEBmUFiRBCMxiYVkyQadMtziZUXSZn2KLDYOU++dKI06WpL67vWmFpRFsfVRkfXu7yxYeWixd//2GuvHRnz+vK3ew1ocBCk98zTVy86Yda/Wtm1OO1auXrv7bff7lct6ToKpE81ym6PIgkgzgYgVEivk+AbMYQe58qZriz3oyJFJMAMABBRAD2zTGSBBBG9jzEDDsfNPGHWS/v37/97h5a/MNOEmVGDDhHFcYAENX18w7oNn3ti8ImDP48VgJHaWOLxLvKsENmBUggK/3u8lQU5CkSJCCyFIz+THF2ltHqbI8/zpW8vS1dG5iYxkgAQqBnbcsQQQiCE1SVTzaTJkaGhoafHBwn2AeBY0+JBAPiLf3njv5x06Mib/x9X4scRoAAQFZyvFUX9yjcOx/bpbRNfYpA0sfbrhGR98KtK59cycyEE1DQ2FEJCUiRam9eJCInUS8x8givVKpY85xjJRe8xqNnah7NSG7fefO3N395478Y3AWB8qOEPf9JhdcsttwAbOpdjXE6kMuZSifB0QopZWgFjdSVL0/cqWfY1svQ1rWkeIs7yIUwlwveA+PsMoYMREhCYqY2tVFFjCOxYopRl4Z0rpmiiqYmxc4Kz9revu+6//NU99xwBAPzc5z7nAGDw+gs2rBYROzQ01EQL+4FfhZcyYZiIgKPaaLTWotbqUAjSFplbfAjN0A0RAJv1axYATVrS1NokTQsAGGFXXuBR6gzYQaQFgbCMkZG1Mda8SWDanCunl5Gjj7ySFV7SD/D/9g4NqWOpXf39IB+/6KKZR2vDnyuL4pQo8lQb6C0A8NaXH3301euuuOrrHOJFAJCIIIiIi8xdzDKHOU7nyAaQRkIIezRRxRhi0loAkETEASCIiLJaN6Kxx3PdnwcAT8CHRqT9qgwOM2PqxNpZiG1K2YhIe0MaRgUEEX72vC9W5EnJflKqBohZEBGITQ8h2Aw5UARAZOybK4iIGIW9j3EiM0xm4ehjzANHCpE/qG4gNckLzT9nYY4QEWZbjvtSVMsA4KW+vr5mo+NYQ+jNN9+s/3LjXx664ZLLX9ZGX6YUVRAwkkaMIUZXFpcqbU8wxnyLtKoooqNlGTgGjwICWhsgJFRICkilRLjJWjuoSL9FimzkcICjzFI2TOASAoAQRy5K7yfHUfnDXOWXfWzDFa9aY99rq+r7/vquuw7cfPPN+siRIzzW6f1B3e4zn/nMbaPvvz+VNFZqo66/LMuJErlI00RnafpGJU2+bZX98m33370TAJ795Cc/+Q3vPVpr89tuu2103Hjf2rnz4dzFs2KgBZH5zLIsphZ5PiHPG0UZg+SUU9Wl18QYFn/8siv/smXGtGdvvfXWGgCgJhmMghcc21ZzTbiYuekGwBqDipQPERbWavXOEOJEFikRCZst7QgCCKBQtNYqq2QjaZY8QtoOF2VxSaPROJ6ZU6NNmVQyEULyzueHD4+cmCaGskr1zZZK5XFCOWKMdjdcfPHcuwYGXhvf7GNq2ZJXKoeTov6nVKFuQpxexviJGzds+PKdTzzxhsb4/mhenNIoiwUcpS7ARIDtIjJBJJYMwEhwMgAcEJTCJEZZY0xkDiGEwNzM15VSyhqd5yGuWdG1YufL21/e/fehof3CoMmeN96od8+dx0Sm0Ep1KKS3H//2N7YAAA3CT4Zrx0GTnu6eHs9wDjPMEYEYRTCGCCFEkLFpMvAB7weBEIAQm1gaIEsT/ZfITF4EJPL4bBYgomYRW2uxRhtr7OEkMU8pND+iaDdt3rm5+DCytWnTJunr66PywHsHiyDHhxCWsHDQSqFCAlKKFakaEO0UgGpZFCcWRbm6zAvnnKMoIlob0sa8oAifBsRXtdYVsmqbAI+yl1Mi8xwG0c0cvSmYyiyKOabex/k+hFNijGf4iPNOWXPqj77wpS8ML1myhKZMmQL9/f18Q+8Nc7cMbRl+4YUX4svbto28tHXroa6FXb0xxC6lSKqVlh9UWip/hip5ytf5wNbdWwsAgJdffrmxZcuW+ksvveSORTdfeuWV+tbtQ1u37dw2uPaU059PSB9EpBkIMBlBNBFaYQGOfHzw7sxy+OjSZYu7R1/Zs+v1RStWvGeD37Ny0aLjlsybN2XNklXTQvAfLb3rAUHOKplOswpEluPr9caMvCwdR8HYrKGCUgo0NYeWaE2ktfKk9QggTYscl3OENgEEUjoiKBERbJQNrI3WHBJVWltavvbQN77++0Ov7n1h2aLFM4Mrru5ZPO+Nbbv3HjgW1BsaGgrbXnt9+47X3/j+2p5lr7PIiSAy8aSVK4+M1vPfqtfzjxZlMRpCVJEZOEZm5sgihCARiSYSEuvE7KmkGVqrvoZIE0LglhiZm88RAECYWVIQnDphyoTNBw4ckF+1wQEAwM59r72xc9/ercvnLTzCCBcsn338S3+x7476T+PIDQ4Oyid7e6fkMfaWLp4WoyQyNs1XBCAKA3NzmAUijhsZIAhIkzkLgoAC0nyxNIvLkZs5lDTnZpMi0EpTkqY+y+xjmbW3f+nBuwc379z8U7VSpk6dSnc+9NDIsoWLTiiDO8eXriAkak4UVZoU/VBrOuRKd3Ge5z1lWeQ+eMyLQoJzaBLNWbXyXU3mcIx8KiHWFdHUMvfnlK48hQGqCiiyCAYfwfkAAVi0NmCTZMQYMyIA5DnODTEsW71i9dZ7H7j3/cHBQbnx2htPCWX43e6u7uq2HdteGf/Oq3qWLQGA1izNtrS0V/7jHffd89yyRcsUKPebPV3di89Zet7254aeCzevXm027d8vV11+ec+SuQt/r3vRgotXLlk2bcXyZW7F6tXJl79822uLlyx+sSPt+KG16mCapZIkSamUctG7tChy7Z1bQojLT1nW88O7H3nk/c27d48umjv3T4vS/WGMvoeUOiIC3drapNLa+q00SbaP1uqLDh8dcTEwASEEZogiQEqBURp0UxZdYgiJ82GRiHRbm77S2tbyXyuVlu8CwvRGo5hZq486VzpERLQ2Ea1Vx/LOzoU9Cxec63yx1jt3Bvtw6rLOBenHjp+9ZfCY2th4t8nmXbveX7548SZGXDs8MvJ79UZxuguhKWYyNkRFRFCAEYCBSCEpKgFxhiGyaZY9P32e/9bwQVlXlIVqgnPQ3HeISEiOWaZKFPPewfd2/jzU/pcyuHGI2m99+VBIs8Oto0dfP7aN/icBJgsXLz7bez4/sswPjE5EUHDMwKAJsKsxY6OmP4Ox+LD5MzWNEMZCTxAAARoLJ5vGpsbQTq1Iaa132TT7wYtbXhz+WTXDJUuW0NDQEKzoXrK+KIrTvfOlUoTGGKu1fssa9UwIcW5RlGvq9UadYwRttE6TpJpW0iRNq0fTRP/I+7iqdMX6oiim1/N8nnNFtwsBvHcxxCYkDogSOSIIQpZVkqxa+aYxdp+ALImRixhjpwisX7V01ejypctjDPGj3vvLhKV71fJV765ZuVSt7Fo+3cdwglbmnSRLHvzSvXf/qA+ARk5aGfKR2u+VZXHdaBxecPLaNdu++M1vHgIAXN655IpGo/6v86JcHSOfxBHXQoDly5etOXjfwD1vvrTtpYN/+B+7X8gPTPqGKPsj4NjKEhfGGGyMvgEgkwWkY01Pz5vLursnhrw823nXFSN3iMBsH6IFQrImPcQiM0dGa5NH66PcLPfpZvEcAJpT7cbirhghhCAhhBLJ6Kxa2XXvg/f8/tZtm19cunRlq3fu7EajUQAAJUmKSqsYgm93wZ8oMa4E5rkAYgWQUKByxJoJXaumbt829FboP3bmBIC6f/fuRtfcub3DwyMXNPLCkVIgQMjCoFRzXJhSCghVkwQhAMJRAWBLktpX8xGzynnfWhRFBBBURBBBIIYIwkJR2McYp7d2tL50+PDhn9mC9EsZ3DhEvWn/fn7ltVffHje23t5etXL27Jlb9+wZH8iAg4OD0nv5xR/NC/cvGHBFs7bI6D0DEIAmAq0VaKVAadUMxrnp8VgEFCGosYmhRGMLgk28rGmICmhsSD0CgEiUEALG4DujcxesXLLUdy5d8vrQ0NBPXIje3l4cHByUZZ2LbXDhIwJcNVpHY6w22jytUb3tOa5xpZ8RQvTW2va21pbDHe0T/p9qW9tfVavZc96FFfVG44xGo+5Hjo6oWr3ewoFLRIG8KCAvCjHGYJZVDKnmvDRtDSPScZ7DbA5RIyIhUs6RJ/jgzwzBny8cawppOyK9FtkvK3N3ZVEWHwkhnCOImVX6K5f2XnEQ1q8H3rmTGsp0lXmxqlarLWiM1q9c3bO82LZ754trFy1/J4/FeWVZpjEKhMgzQgwLQeSc5T3LW09bu+r1f/cf7j06Yfp0pYJcEYMXRBhVRDOJMImRfQxhWXDhUhTuUto8j6SLKHxCo8iTvCjY+8gh8AnOlZPywrkQGYkIlNZAWgEIgsQIMQQABNCEoLQCYwyaJEWlNa1csfbwiqVLU1J2HgMvFwHdjFoUAAuWZRHZhxyJcq0UkVZHEqvv00o9RQpnYWHOeGJx167Ldu9urAfAQQCYsm4d7du3TxbPnT2jKN2FZYx1pYwSJFBKgU0MpFkG1hgg1XRNkRnL0kUQSUirYWVMwzuHLoQm+EMEMEZuL10JzpWMRGk1rU5a2LlwaN++fb9aD/d3yMjNOWoAALhtaEgeXDjvnK4FCw8O7dlTBwC4qbf3uNwVVwcX1wtQBUFFAUBFiIRNZLE5tG+c2CkAzADCYzmZAkVjBoXNpBsRQJDGGiMBSOtxjBKEGb134J2HGOMEYTnHgmpZ2b345S07dvx3fWbjNcIVXV2jLHweCBwHiBEIGKJMZ5B2QJqsiFKTWK5k2U5jK//+/icefuBf/evfffvVHbtPq9VrN4fgSWujtTGZSQy3VKsVaxJiZq1I0pbWNq5WWwYlxjYffBURIwhUgvcpM7M2GozRFEVicB4EZJomhUliN5FWVBblBY1G3umcmxFCTETkOEVq9198/tYXAUA98J3v+BOXr343hHBWrVZrqdVrGSlcsW7Nyc8kFeLReuM651yriMQQfPDeS1m6Koe4niPPXrli9Z4K6dMkxkUhhNki8URNtK05rRUmla6sM8cEAGciUkMpVY/Mi3yImgGtNKn6rnSOA3Mz60YEAWnqVYoAxwASGRQCaKNAaQKbWNTasAC0heDPCpGvYJaWyDzVu1LFGAEZgLmJWhMAGa2VNtpZY5+2Wu2n1A6B5xMYZDIRw3/bvXdofK77J8ZYKSs6u5PIfJkgIaCSMZYNWGMhSSxorQCIQBggBAfOlRCFjVa6YrTeHkUoxtg81McC1+gDFGUJ0UdERV5rOzuU+Obb775x4KeFlv/gju9jB9b3A8gre17dMWXmzHLfvn3c19dH7+x/6zeAwYpQPUaeFUNAYyykaQpEBBwjcLN3CiBGAGFARNCKQGsNivR4BAkReIzD3HT7PgaILGPIPH0AEQnA+MP1IEwkPMkoLYuXL9304dFFY/OlsWf+qsQYqDDHKd6HaWXpQgwhRcI51trvJ2nyZJZUH9ATqn985qSz9rTMTP/wlZc3//uRoyNXl670aVbxbR2tn21ra3+4taXltmpL9YnE2teUMROzrLIzq1T/MGlv+V5er13QqNfbPIcoIMwcGEBQKw1KKUBEVEqBVqphtH4GlPISowneLw0hoLD4EJlFokXAzlXLVr39la8/uau3t1fdPXDf+6uXrXidRc6LITIiVhhhaSPPz8qLfG6MMYIABo4YfMDSldF75zjyHI1wqtb6x0Rms/fFmXleLGbhqVbrHyJiigiTiZQDBCy9X+icW0CoXKWS7UnS7A2jTSYiWQwBWD6I+oFFmmCYMAgKKNV8ts1pr82UoOkxgEOMKsSofYyz67UajIyOSlE0AxMiBN0EXUQp0lrpQ2linwKRxBWNK0OMqLR+z/swf9Hsmdf3LFj40aXLuvb95ef/5iAA4OoVC0OMaikAzo8C3kdBHsMHmvtg/HsKxBjBhwAgTFpbbxO7XUQQxnJR4dhMZ1DA+wCRYxO4AwXW6Ikn7z/ppSHYJgD9vxoPNz4EfcOGDZUl02f/y6UnLK4P7dvz3vjU0DFiJ6xfvx4PvfPOKaiUNdoedKVbVpalTUySV6rVOyXGLIRwfAjBcQjIYyeI0gqs1mCsGgNQmhzjyGEMk0QQFvDBQ+SmgSpUzRwPALjp6UCYSSQGAJiIgElF4Qubd+w4cqxATP/Y/Xxs99b89NWrdnkfJ/sYur1zWgCjNVYnSfrd1ulTP3f7PV/eunXr1jI7jj599Mjwvzt06OCkRr0xatO02lJp2TzwxKO/u2Xola1bt297Y+3JJ9WC99MTa2qtbR1/9uX7v/yjk05ac7BsFKf5ELp88AWHSDEyUrNgPtZdAIKIRhG9iErtIgJhZsWRu4Q5hcgiKAgCLnjfKjGcv2bl8ufue/DBN9etW6e/8vWv7lnds2wiIJwWI+chxFmR4/EiQogoHEXGijDgvMMiL7B0jhH4eK10vZKmr5auWJHnjekAoBNrdhOpfQDYpZA4xoj1ej1478kkSdnR3vH7nbOm//moD8eJyGoXfAmIoJQWpcZa3FBEGBChmY9rNV41RRBCIEEQIgRAQQEJIYQiL7GRNyB6D2osrCSN0MSsJZKiFkXYEoKb5pxfJwKpIny7KMvL87xcG0PssaSmn7ZqzXc2DQ2Vm4d211Z0dU2PDMtDYBtC4BhjE0GVv0XHBQQiRwjBobBEa5IWpegQER0QZhOil8jSTG/GPHcIDDFEZMCQJelkmCfv7Xnjxvd+kpf7pdpzbhkLy9RofuLRoyOzamXtY7/T29tyy4d0KPr7+0VEphDK06hwkBALYGb2zoB3k4FjCwFHQkCF0kyqRZogChFobdEYo5SmhBAFgZo4CjcXRZpHaNP7IQATQBxDNlkEYpMSjiEEH2JYHkJYc6yQUR8A9fX1EQJIL4D6q3vuOZJUs7+x2oymNqMszchY8zIibN64cWMDAOCai6+8Nq83+kdrIw2JXM+qlaySZaAUvXfd5b3/8mMXXfLxS8/bcO/+vW8+ffjQoT+q1eunF0XtBACAjRs3+okTW/+4o739ucRYU7pSnHcQOYAPHlxZgi8L9K4MzpVrfFFcHkp3HEf2EFkTCBIBGlLGal1lYV+v19sa9eK6Y8N8o5OXrbV1IrDCsdRKx0pWfSNLM09GWaMMZEmCmpS4ooDayAgdHR6pNRr1Sxtl4ywR8Ym1mTF2tzJ2Lyk1jIg1BiYfAvgQ0YcQRaTVxzC5f+PG3NjkAWuTd9M0m9iSVbL21kq1mmWqpZpJa1ZR1dSKIWx6OmYYQyaaPwsDSBwzTkSlNVlrIE1SMEkKpDVEFihLBz44CFHQB8/1PF/pXDyFBRuR4/RGI7/OOd/GMR4uXNGoNeqnHK0dPmN80zPDBAFOkYCR4IMwNzYBHPAcIDI3v5aMEz0CcogrIAoKSilREHhMWFZrsFqDpnEzYkCNyBoXAvRRX1/fr0bTZNxRatIHYgztpcd1h0fKFxDgyXHJ6g+ePsFXo371eaXmT9AEO61SH+HoR4va6KVMCkjAa0IUIQAa81bNh0ESY0MRfkeRWgwaugG0c+MLFJv9ZqTUGDklAsfmaSVjdTwkAoUgWuuEFO47xqEjAMBrvb3TcdPWVgDYAb29AAMDCAAzBZBIkU2M2Z1Y+z1SesUne3ufjTF2jYzWfreRNyIRxfYJHS3VluqRJEm+TkofbhT5Z+q1+qTa6CiWpWtoa7ljAncC4n+44vyLb0BSNhTxTxJrH0uMPXmUa8OAokQYoo/AyBCaYCYoQhZjZgvolEA9iggNRYrQIBLhO0TqsAgvqRf14Ao3b6w7IAKAZFn7D0rX2JSkyRoCFSrVyr06Sb/i8nIBEPUJsyJSnkGyssydK53E4HG0XvMicnGSGJMkybesTfYAgcEAGpEMR5CxiAIBib0P4Jz7vRt6e1+4c+C+l67bcOUfQCv9axRoIFGMHLoZoB2QDnjvpw4Ps2vkjbF236bQsUSGAL5JeMDYzNmVaXpCbZsHLxEwB/BlAAYASgCcADjm3BgFidYUYtRlWQICBK2MDq4MjUZjkrV2NQA8ccPll08drdW7vY8ps4wKkGruEoEoAsAR0DGAAITYbNECRGQRx8JTI4TlIlAnor3MrAlImk5BN79nCEBAoEiJIhUB+vmWWwQ/PAFI/5IhpSAAzpk55fWiLA76EN4uYpn8hOZAuf+xJ59uooFDB1O7YTN4meF8OCHP81xpjVqP6YcQfgCboDBAJBYMFQE1RRE9qYwqQGBFZPKOPTJzs1RA2Mzbxk/NsZxOGQMaRazRWWL07tTapzWqV8aRyYGBAZ7b3b3/qaeeeg+gqeHf19tnto+++H8UeT4VCL0lElTKIEjFef5E8HFejHGO1hqyStVkWeXJNMs2VqptB0dHDv9WKJ2p12u1eqPOIkBKE7qyKEB4gXehCwF05NCapOmrAlJqrYjGwCCACCLUPO2b1BtWhAykkAwKKfVd1JoAQBHBQaXUaPBuEiLNE5DjBwYGCAAi9PVRdWioXrP2OxXCt5TW709pb/2rz95xxzAA/PC6K67Yz4HPRsRCgNciTDjJl56FJQTvipHRUJlAbVRp6fiuVnZnQH8yGQYM+B6DzI4MTmmDQEilc2W9ns/WWp8GAK/f88RDX7vpppt+2DEMQLZRHoz2d4Lw21qbt5wPS4Mr/7+hLIqxuLBZY2Ueq9N5iCzNorhJmptHYvMA1grARxjPLZpKzwIcIiEKaK0gMEtwHpQiRGMAQNCVvohRzhKRP7r20gtnB+/WuNI3mJqYNmoFECNIjOBFxgCRsdovNvNGbArjBPB8igBEEXxPa90AAiIgIK3BphpcsEBEhIglKuq54KMX1y+44ILvA4A7Nqz8pULKsXwY/vSuu+qTp3T8cbW18hSBrHhraKjjw1oQfX19JCI4YcLNpImGKqn9ttX0upJYVSKJQsgMUUWTbqKR2DQ4iV44RC1R5hFCRmSeVVq9S4QWm9ktEBJobQAAIHIE731zZvbYYMAkTXWaZruyrPJEaisb0+mTdo0Pbe/t7c3GUMrwQG+v6u/v553FltMbRf7Rep6X3gcSYQFSOSraCoipCIAx9qXWlrYfdrS23Dzx+Gm/VVLcMnz4vT8YHTn6sUajgcGHsdoiCMcI9TyHI8PD5ZEjh0dHRoaH87y+1LviIkF22ijUVoEhBEUKtELWSmMThDOtSun9WqlnjEKniL6KVj9oFT6W6PQOlahnjVFHjVFWKXx927ZtAgDYOzSEfz4wkCPSO9qYwx1Gfe6zd9wxvK6pNm3vefjhb6OmLxGwStPkmQltbV+dMnnKNyZOnDCUJGnFOVeEwIaF37zjsfufIoEtShmNxrwhQIpBBJQCUgZciNIoChtCPBkAZN26dfqOO+4Y/uxjdwz/+cBAPm9p15/f+8iD9905cO8zncu7v9iSJU9VK2mqCJpxGzRfTf2YANF5cGUTIXTeQ1MxjMcipaY3IdVsFkZAIKUEBZl9aCLWRCCEEJkhftBx39zivuQ8hKAiB+Qo44pMY9xOAfbNKCPG2OyLBABEBQwAYyJVUURSpdUSVMqJCAUOYyUeCza1YG1TjiJy1EHCWd77FvhQmvUPkViQ3t5edcdjjw0bm4wKUDJSr9ufIG3HiCgbN24Mdz/++IM6UXe2pOl3WrL0pSyxmxOFz2uCHxpEUogEgM0gGSIisEfhqgRupch+rPT2QfFbaRofSQbeBwghQuAIzAxApJQx9SS1P9bWPHXbw/fsO3LkCA8MDMQbL7lkjS3Lvt0vDy0BALiqaYCWvf/NoihNjJFjjD4wz5AYj375oYG7YjRftIl9pVqtfru12vpv7378kcc3btzopZ7/X4cOHb740OFDUJQ5aE2mUqm0pVmaCQi4okTXKECEQSuDCKQ4xgw5CpKAJgRtNFhDYI3KslTHLLFvp2kymCXpd4xJ9xpRj9/92EPfuefhB35wx2MPfee2h+/ZJ14sCqI2Wmmkd8Y5lw8MDIyhsOFFRBUOl6rt93p7s8HvD4aBgQEHAIglOO9CFZkrU9Pk9x78xpM3VtuqN7a2VDe3trRMAYUBDJ5w7YZrJxPpRaTUsNZ2jyiqi6D6OycvighLYwyICsfIIIwP6MC+vj7d39/vKm36D1oq2WGrSUuMMo5IEyIQqSZ5QY+VE4QhxgDBe+AYmiwVY8AYA4galDGSZam2ic14LLxJ0hS0MuCch+ibRW1SILfccotWGk8QxABjUhofTO5oKrNBFIHAESIzsHwgSgQcIsTggYUBCZ1StJwAOpg5cAjAzKCJwFoNpAkYGEJw0XvPUNpTxnV8fiVlgaGhIfnMZz6T1A8PLw8hHCcCuGPvnqGfJRO9ZceOQ6d0LnrVpNUfGzDfQAXvIlEpwMMgPAeleeIRoSASEVFFQEaj8LIoPJuZgwAgNTl3wAIQYoQQPARhQGjOmzbGYKJ1aY3eRUSvbRl6Zd/Q0Da44dKXLxaJZ4UgrAhmLevuemPtqacK1fnEsixucN4nhCgAxEqpzJqkseaUk56++4G7DyxeuuTFRT3dz332r//iUF9fXzpj4rSra6Mj//bo0eEckdK21pakpbXlQCWrfLdSqbhqVplurQ1plmaVaqXS2lKFSiXdAUCFK4sJ3jvWmiAxptlhTOolY/X3jNFD1up9hHqXbs/uuOP+e97p6+ujMQl0uHnDhoojdbF3fq4wzzbGvHHKqhVPvTQ0VAz19tLQ0JCcuHSpZoYzFcqSI85d3rmo85oV3csOXnl171sHDrw7wZflH3CU4TSxT2/asaO2dceO2toVy9/RxrQYozcTGjIG1hHRoKj0aZZwpnNuoSu9anaza1CEnCWVlixLN9/6xY3fuHnDzZVNuzf5waf+boPo4OAg9/b2qnsfeOTIw/ctnMGBT/MhNoCQsClS1EQirYEkycAkFggBYgzALE1DVKoZ4jVDSkmMNpUsO2C02gEAc5UiMcaIIECMzJEFjNEmzSqHz7rgwtu3/XhTh2fuDZFJhCSKIHMTC+AxWB+bCtMgTS0OYOFmCUAYjLZorAUkPMCRKzHIazEGC4hCY4Xw8ZCURZBZ2BgztWd510sbN24sx9fjlxWCRQCQq88999S3d+45pXRFjzDPTnVy6OrzzpvT39//+oeY0zjmEW1ytLZu4xNPfAsA3gAAuPnmm4ca7xy62QDsZOE5wHEJITYIKSOAERAJDHJKjKBZxDEwjEtwszD4OIZyjVOeEcYgW2ERbgkc2xTSqhuvuCIN7jIbQjhVOBzwUda4EJZonc2S4dp+ZDECWE/SZIoOGkrv0DnHriyXVxpk+gAIurtlz5Y9066//GOXD/3o5bPzoj7buVK1trVWsyTdVW2p3m2Ttq98eeDLb/f19elXX9m52nHJEvijKHEVEv3YGvO90rlPiMDsGAKz0SQiwMAaEWsgdEgjTRGAV72BryRHlAGAYtxb3LRuXVKY9GoOsRUR9hHSChZe7EvZAABfHmh6OORoOlh8vSzLZbV67SNFWahKJTtzx6aXPq9QDhDJM8Jx5GiR/86V55+/xyh1ZP6yZU/09/d/97cuv3zqcJBPR+ZMkQWAuDoEXiQAFSEqJERSCiXNqkklyw4YY0c/ftmVFxwp3v70FWefG9s76F/dPvD1A8cOV+zu7hZEkBsuTm4PFT6VEbtcjHURVAJNozImAZOkoI2ConAQQgDAphAtRwaisbqZsCCSMsZuMQqfN0a/7r3/aPSuTSklWZZVAKHgv2UTycDtt+ckiGNtKc2OlNBki0gMQNqMkSsAiAUYmpGS8x6sNlKpYqa1/kGM4dXIfE2IcRuK1CF6BTSGgo5BoRy4GY5awSRJ5FemvExKLWjU62tj4PONUU+iglRIt/+090/Ic90IYdG6deueXr9+vXvqqado48aN/qYNV3zHK3UDhlAjxCNEGABxOyD8WIRPYYZuES6CCAkAIGkgQPBjLj0KABKCAgKi5mmJqBgAdfRhZRnDUWJZIBIkMo9I5FXMsiowdIi4DQjwFVH4plIqAhrFLBIDk/fOKaVnp+nw70JfX39/f3/4xFXXH1+v+w150TgtRi6qleqOLE3uzaZMeuj2228/MJ63vv766/ruh+9/Xpr48o/+Dp3skkuWIfLH4jjVCQQkSkTiJaL87hCoTqQX2Ci/5/GIvf7yy5+8+5FHngcACR0dpxHzUkTMtdLDnsLhEHh2URRXffzy3tFcw+MDAwMxIE9k8ZO8d8tred2PHh2t5/U8EY6fbKlWvmKM2RG9b2/k9avK0k23Jqnt2rz5wLp1637014888v7VGy4pQwDUBrpD9BOd95NiZAZAZBERALJJUqZZ9qTWVDTyxr+qjY6uidEnyC1/c8MNN1wH8+fnff391A/A/f39PIak7rn6wkv/PWn9+3np1zbyohFDIBYFgg6UNs0B0R9qkhSOzWZQ5qarICABGM4Q75p14sn1bc//8BZXFL+tEI8kWeVHInFRI8+n8ZiIMBJRs67dRLFFmvVaHisvETb3ECkE8fIB6u2dB2qSdhvG6J0hhsUxhCrHOA2QdgOzksDN3IzHstLmsEMQEfKHfQIA9V+FwWGrUg/WlJovIsdrY14FpF3v1WrbxsfkfljLb2NzIOFfHkOp4r6+PhoaGtpdaYTtrNFSoB9JU2wyCEghIA1o6i40WwtwjAAmAjyGcAkLoFagAcEoBdYYMFoZUCgRZQYHvkqiZ4h+7P+A5YgsgDUmaRWANq11wkTPhJw7mtLpZfDBYyNvuEqlcv3erdsHb7rpph/zaHEqIu231m4zSn+n2pr91W333ffO+I1ed9llq7dv2rTB+7DuivPOi4T4NaX1fkCsC2L9/sce+05rpfL1o0cO3QzAs1DENaU+QCLHVgyYosIGxaiYwAXmqEhv6O3tfWVgYKDGDCeJ8GFF6klFep4mOrn0cboPbqFydGYGibrp0pu+zbGYyQEzAa5KZC8ipvS+CD5OQsQwJcTPH9R2OZbl6UXemOidz9JKumZwcPCHn7rmmhnDR2rXCnBiQhiNgeeFEI/3UUoea32myIRAubV2L3BohBA6vCu9c2XdEnWlhw+v77/rrifHiRJjBX0BALz/q489e3Nv7w2HsXGH835t6coyuEDgPAQfwdgEogj40AQxlFLNnEsYRCIoQiEkiwjFbY8/PgqPP46Xnf3RUJSlstaGjkr6cuHzGdAojpemQNWYhxCJ0qRSy3gYqZqSJB/EvzLe8DUGFrMIRyERKRHRi8TpMUZhgQWGcGdzSmgAOGYGCBEBaYoKsZojnwYAj4+Xy37pHK6vr4/+7AtfcKuWLatF5sUh+NO0grdPOv0jz9x66608/p7169fjh4e6f5jLODQ0JItWLN2WeJlAhMchMIIgBwkzReAU/oCw1exwFUSIHMG5ANEHwLEipFEaksRCkliyiR3RiurAgsxBx+DROYcxOAyRY4iRfQiIpJRN7KtJWnmNEGNRlnPr9dpE531UyqDWRhSpFBDnK4aZLGKNgXutSh+85ysPPfDSK6+Mjmn+q8TFS0VgBccwr16vrz86cnRC4fwZAHIeAi4wio7OnDv3JcV8TaMszgvOc5KmaK0VQgyEsNlodZiUfp8QIiB2CAMplNG2EJ7btGuXX7Zo8UpCaL/rK4/cs7KrJ2HmbpbYRkRvouDbgeM8Fn8qczwORCYw8zzvg4QYuVrNsra2tverifmPX3jyybde2b377VOX9DzrOJxQFmUXM89f1dPj6qONi+qN/EwkhSaxP4o+LCidn+W994EjOu8RWCRJbWq0OoxajUTnur3302IMJXBMAGTlmgUL3163ePGbF+7ZE9atW6c/se8TMAiD0Nvbq+4cGMhXLe05xALncxQbY4w+NMs9ImPP13tAaD5bEIHoPXCMYpSiSiULaZb81bYdO3Z/urd3/ujo6B8dHR0FRKlqY4+EEKZyjMdZY5647lOf/ubSrq45jaK4qtEoIURuMjyxWVJCagI3ihCAm4c5YpPq5b0HIjQtra2HW6rV5/Ki6HLOdxitNSnzOgcuQgyqGaoSEAIopcFYi4rQA+IJC+d1Hvni7Rv39/X10S9tcIODg9DX10e1sjyUj9Q+kuf5OSIytTg6MrTq5M6RZXO7qv/t859vDA4Oyt9nCsnQ0BBs2bPzlZWdi/YDyArmUMYo5zDz8QAgQIRjAQWKAAQfwXsHzAKoCIzWoIyGzCYqSZPhJLUDSqkfIUstclwUg2dXlhhCBGFGVwYsCy9KGZ1mlb26LfnTBNTbRVl8PC8aKQKElmoV0yQBJBAEmKYI31JWfeGuBx98ZcuObQf7+vpo/dSpZu7inlWbnn/u37sQPqm0/W8tWTJQFu6KI0ePVoq80RAAUYomKaVG2qpppSzcaWVZdrOwS2ySpKl9Rmv9Q631W8qYvfc/9vhfr58378clUUTCCQbxmdueeGIvAMCqRZ0toKC2eNmyHdMUDOchHkcIr5NW2xGxGkK8MUS/iEUWiEi3CMYoDASoqy2tjWrHhGvvfezhl3sB1JLeXrr70UcPn7RyyVB03Js3Gu3O+3NGa7XleV40tNUmscmIIBhf+rk+hjKEph4/C7M1JkmsAWPU+yBiEHGCSDQxMgfvO6LwGY5wzmlrFjz/8Fe/l483KG/btg1u6e/H+5YufS9BqhJRNyIkIBIFEJvtM82nTajAGAXCDM45iMyQJIlpbW15a1JL9U9Wn5r44QP6j4ZHRlbnjdyBSCSF8zhyBkjKpum9O197/aVVixZ1FM5dlhdFWgYvgIRKG6AmVDkGf4+BHuOEaxDwziMiSmtrS5ok6UhRuuk+hjZjTGa0Ae/K130ImggBNAGRAkMGbGqAkCRGzhjg0N7Xd++eOnUq/YNQyvXr1+NnP/tZ3724c5VzfjkzWNQ4OTb45KJonNU1/4Q5K7oWTO854fjFXfMWvju0d2/588SGPvuFLxxYMm/eOyRxFZDkqNQ+JNpGqCoCOFFAmtI4IABNbcUP0KXEWLHWoFI0SgIHkXlC5HhScL7qXeAYGXmMAF16DyFETtOkrVKtfP/eB+9//OTlp0UfG2uQYYax2iTWRKUJFRJqQ1+1OnvSafjxkiVLKMsyfe+998bpCxacPzx85LajoyMrEMEmmX3izocf3r68qzOEyGcKCyokjswowvMZcJqIzPchtghLTBKrrUleIqR3QaBKLGF5Z+cJJdHwXU888dLWXbt+sHnXrjfH123NnGVHv/TVhzdt27ZNzr/qKr984eKJkWMXiFQAsCCQd5HUuwIyJ0qEGBkQAUyS6KxSHc1S+4MtQ6/s7QXAW4eG+NPXXDNtItn3vciLqNR5o6OjXK/XS0QibRSQ0rO10tsBZVIMIWs0cs4bDWQAbqm2VFpaqj8mm3zBGvOc0sZGkSV5WWDhXGTEVkFa3Cjiuu6586ev6OysnbNy5cj5V13lbxHBq666yp26cMGP2OqpBDAfAFMA4MgRZYzYoI0Go3WTBB0ZUJFklSypVlqeSjravlMcbT2jNlq7eXR01HjnBIlQkwJEEE3KpDZ9+oyzz9582733vrts0aJZMcTTitI1AICMUUCkmkDHGB2QxzhdhASC2JQ4JAKbZAoRFxelq/rSRSKllMKCCHdobUxqU9BKN7m/Y4gnEAkSWFD06t69u/YuWbIEf2mDExE888wz5ZqLr5lGSlYEllkC0OZCmF143+Wc70TBi2LkMzjGUxF8fcmakzdv27ZNPkx3OVYCoK+vj/7ittsOrJ03fydanRtN75A2OQK8I0CzBLDaFJZQaJMEtDEgzIACkCQJpjbRHGJLiLGThbuj91VXuMjsm92rQjAmISCktKpUq7W2turDW7YPvXzRFRe5YuTo05rMW6RgKscwFYR1mthn2irZLV9+9KEfDQ0NwdDQkOzfv58/dcklrSP12n86fPjwvKJRHK1kWVZNske27tr5+tCePS+uXrZipdFmDrOIc05ijKiNPc5Y62OIlkXAaKO0VUPC0hBmjFFahONMQjx1zfz5/3/W/jtMrus684XXWjucc6qqAwIBMIABRM5gFIMYREnMBIOaokhKlCUP545nbH+2x9/M+I4NtT3j688ej3OirUAxs8UcREmURCgHQsxNAgQDmEAidqiqc3Za6/5xToOQLHss6evn6T+Ahyx016m999prve/vfeLJ7dv7B3d8n3ipxsONjo4SAMj69evKWPZPiSF8FBHeNnn+gjH2jcQ8N6Z0aEjJCyIZY5II5CH489cvX7Hrb7Ztffays874tX273v7HrnfuC1/7+h0nrV31unfhwhAZrDUCgglR2lmW7cqL7AfOuVWTU5PgnJMsszQ8exYPDc/6w5vHbv7eU+PPvH38cSe9mkDeXzk/q/KRUVGKAtjruyNL585ioisiYmfF+vWPX3nllX5kZETddO+9fu2yZYAIOaE6KjFr7xxwYtDagDG6ETbU3WdrLGR5BrktOhq1d86d1yvLVf1+GVJk1MZAnhegQAEykzGqNT8v7v3u00/H45Yu/UES2BCCX8QsXpFqFAp1AEvdwIJ6I69vnSB8YPEJM6cYI3JiQQBRRFlmsjdaRaufF5nSSoNw3TlvCN5iyGaWzLZtL7/wyqpVq+jnHnzPKPOVhveGJMcA0KwgEn1IiYXE5i3QWetLytibUZt7yKgf/VsynWfa35959NG3bnr4S3ff9NAjnzGIX7JGdYnQgzBBbYsHTbWrQBGBIgSrDWqlvkqI+xBAQQIvjLHuSs2g+OpPrtIaiiLHIs+iMvTYTDLPp2+//Z3MZI8ppNeAOQPAfcaaRxeuWfN6kwsgTdKLlEyrg/MnpBTLdisfyvPse7awTzd3TVo8a+GvGW3HmaVggaRsliuyLxKphxDJgAAk5piCnAYCwwgqEqInREaR75rduyeaqC75KbRr3rRpE31+bOxNhfhDBHiFmQ1C0ixxXkzpCBBgo3UOANjt93FyeipVpTtEAJcAAEiSVgppkfd+4cjIiDJktmlFrkk7BU6ROEVG4v3G5D9gZoghgDEKBgY6lGV2Gkm3PnnVJ+d/7GMfO9wO2FezVvvTrYEhbYs2JFTY9wkmS9eb8nFfEFRMumOtpYN+DzRav0FAE4okqPpKBQgJhCPUes0AKTbCYkRk0TEwL+z2yv/Q61cnVy4kZkEiDUYZIKUACSUl5lD5o97atWsVAMgtjzwylWt6yyqlVc3vAImpEVHHpoNJB8hi3FjBGAhYAJIAZibDTruTW5sJKtVWSuVZblnrevANRM1oINZKGZCICuZ84APXtleuXCm/cJhH0pBCimtL7zJfRQZSVOTtMDAwfMf8o4/8d/d86SufuvvRx37/zi9980cNW/vfwu87kCE2MjKiPv/AA08nxFcI+TUEEWk8SbEZCygkMdZaa/SrVtundZY9aBTtVoRGNZo4wlqzyM1GobWRvMiVtublEGofydjYGH/siivOr2L/k85XqyIzaK13Zbrz1dHRUZ7pvI6NjfGmTZsocbWBCPuzB4d6Q0NDLxdF8fnPjo3tbkYy8lr1zqDz1dFlVTprs3ygM/BGnttvpJBOEqmfZ4yJQwxHSuI1SlE0WmfGZPtcp/PADVu2hJmN7aelt8wEVCqArxlrvkBEr3HgVFXV6hD8XFK0o91qfx0B/MTEBE5OToIARAT4AQDAvBUr/nRgYPAPOu2BF8bGxlKvLI+NLBZQktTKCrBaIzDewZD2gHALgLndKnBgoCNKaTvdnfydXVN7Hpza272/u6976aVXXPK5gcHBhwaGhrUiIyExIBFZW1BWtDKyxRO33HLL1MjICDUbsBy9Zs02RbCPmacQGbPMsDZWODIE58B7D877xi2QIKaIlfOu2+/N6fZ6naqqOLIAEAEZDUQEAkIhJee8P9S76jev27hxuOZxYEsbXduhpLZxzUi5Ztz473oqBWIjLSMkyEyG7c5A6HQ63yuKotJKozAXIQT20QPHei5AVC88ESTvY+V8PE7L5C99//vfNz/3gpvJ84IqvMSJh2PixCKilMlNlr2s2wt+/4Ybbpg8/vjjzc8Z9SObmniqj27ceC4mOSoJdgDqkHdChBQ9RO9AOIoiIgGcFgIkYGBm4WbOxakRpB5o+wKQUqi19VrpN7OD/k0k2pWE56SY5gqzAsCHF65Z8nojV5KZkQQAgGH40UC78xfDw7P/KLP2sarf/8DI+Rf+7kcvvfQUABBMcl5MabaIxDy30C7aj3Hiec77tSDstTIAIuid74WUljPzoEL0iLIvD2Hg37gxwc1f+cqupPUt1uoKteo0XNoBrWnz/EPn/A6S2ut90N4HAwhvtQrzxIxdaM3ZZ/++HRh46KPnn38Ri1xhtLGZtYRKidYatLE9a23Fhp4wxr7darVtnreEtBZO0VT9/mHTExPzu9NTi5xzF91///150ck+NdAqHjPG5CDMiARaKZTInoM7+fqPfGTuyrExmZGBjY6Oiij1DCqKxhhTFB3barW1NuqAo/jAfBUap3VZYrfbjb2yzy54qNXitXtENfzLlJKqKldWZXWKm57+nTtHRpCU2m6NnjZKaxGWlAKkBrdIRM0drPZbRq43dKmJY5JZY4w1z2qjv4WI/RgTVcFv6PXK3JWBo/cwgwyEA6iQiDFEFyIPbt/+C2gpx8bG0q+e96sZIL+XmUsSoPooJwECZf3bWYOiC9duvODUkXPP+bWrznvf2oNjl/5PoKJRALn2wgtXp5ROSyJDwnA4ErHRBpAIWBh89JCa+QxIUsycYginxhQP88GFEAJyYqivwyiqZiKy0koTwgSheqHKZKop3TDTegciZcxSJGZEgf7o6CjPBEFuAiBElNHRUfYDAz+87Ytf/OtbH37wphjj/Ole72O97tS/jyFd/rGNl/1yVVXnckreZibTWu8ikHeqqnyPq8oKECnPrAEQCK4SH7yNMby3irHtQjgief8frr3gglP/De+XbNq0icYefvhtbczfGDS3Zdb80Fr7tFL61VXXH7/TWq2KPBdrLSAKMsDhAACbzjxTj46ORgFQAeA9oNR4XrS+1hkYjO2ipfO8GNTGPK8hPnPrrbfuz4ti60BnwCqlJPoALjjxwfuqrGK3Pz3poz+5Ra0Fn/vc5163uf1iltuaSUIEKUXsTk357tTUyNTU1CdG65L4QLKtQdxutP6ezYpdrXb7jXa7mMjzgrQ1YowBay1kWQZKK4gpgnMVuLJEV3ngmA4ojNRBPFZEgcSRvfeZC/6EB3q9qzWRUspUSisUZoiRa9pAbehqHAJ40KxXZhKWEJECp7SiLMuPuao6pCqrflVW811VHuJ9FV2oxxpwEDakFmYIA3Nx5KFq3c8MggUAuf6ii1qT0V24U16a7Us+lTkNA0pURFhjE0AcmCs/9uGPPRJD93Bf9c/lJMOk5QUAePrfigaDURAUWQrAkhhnsfBsZqzqX54PdK7qUgBRQIg5GgEZ5CQVsBASiNaEhJQhCoBoAMCEREYplQGIbomoT33qUwgA7EU2pJiGQ0qYODEj/9j9aRSA77zzTnX3Zz7zqzw5Ofv664//g61bO5JEvsEpXQZa70SiF0DwZeY4nyEpRPAgrH1wx8XgD0kxYtEq9llt9vb7sNI55xHRa6JjOabDAGWXEi60NepXzztvy+joqP/XIKMzwuUb77tvAgAmrr7k8scsxQyIWt/8o69+BIjc0NAAVi44EDii7PtzAODJnd1urXPyfrGv3DpSeker1X4s4+L7ieMGFvI6M+M33nfPRM2VRCStxLsI3nvQYiBxxJgiJp+47PaGJuy+cwHgbztDnYe6k1MfKfL8BO99KTFR31UCyUWNg9deffHF458aHX3oymbTjyItQtVVSh7Q2kwi4SnWxFN8jP2YBAHrco8AIAhDapwhAAlQKdAI74qeG6mfUgYkJYqcXAxpgfN+pTJmWmkjSL5RnNRj+XrBEpBC4INSyGdUgzUOQqSqqsJVZduVVYjRY+IkWqmYYQFGISjVzOMOwjCjJElChghn/0wn3KbmojsZpudVVXlGtzv90SbwTzXyGAKBkJiPqJx/T1l1fy94P5IioDHmmTzjHzQq8v9zaTl6oDnzfQGSlHgZMzNzhBDqeYwAAmkNWitUpKJCnEIRhyIvE2GLiJLVJi+KTIo8e9Ha4uWiKMbb7fZdeWYeIlI7hKBIIraGrl71gX7fXVIFvyLEwCkmlSIPAgA0CZ1y3caNR3/h0/84Ojk5+WtT3e71+1+dc87mzZujRvNqq2iZLM+33frAfZ/+/P13f52U2YqAFLyPwYehEMLpLBwUEVmj3lJGPw3C6GOAGCKmEFxIUYcYjqx8mOcrf94+kZOaUwz/tUSjj15wweXXXnjhuk0AFDL1I23Mfo68tDfd+3eQ5NCBgUFsD7R0SimG4NcAAO5ftKiOChY5AZAO10rtVSR3Lu1O/g2Zwd9ptwa+NKjyR37p6qsXXTMycmFZuZUuOJc4EAMDIh/4AWIK0Ov2pF/2P3r9NdccesMNN0wWRfatTlFkmdYiwhBCoLJyvuz35/iy/O2PXnDBKWO1ExUQYBgJ2gxQgkgAASJF9TyMEzCHRln0rqMfEECRBqsNaKUBGkFESgmAG/Cs0oAMnFIcDt6fEBMfRQAGDuJ71/TFppxE1eRE1AsYaaa7IxCYwTnHvV4/OOfQhwQpJooxLZOYeIbKPOPDoRk7Tu0glxCi+/n8cJnxnHgoBLek9C6FEJm5Pn5jihx9aDnn31/58L6Q+GwyaohMNn7jfZsnmg/O/2nB4XhT3yuATOrx5ACzQAgJgvcQvAdoOpVKKSJERwgvKoQ2iXpRE72htcq1UeOZtV/Mc/tokZkHMqO+llm9O8vzF/PcPkFaPfu5O+54/eqrr17U7/X+c7/b+5B3vpOiJGERJDpx08iInSntemX5n6emuv9pYnIy9no9qarqtz5y0UXLs0zNzjL7Ja31zqsvvvw0AIBWbm8kInFlSd5VjCJMipQ2ihTpVxGREgtwjJA4QgJBFhFm8Ym5ZJFliXnDgdTUf6HiuG7jxqOTyFkMoEcBeGxsrNtq5bckTkuD9ytReKqVZ59u58VuBIoxplM+esUV62fyFhTRF1ud1h9nuf2zG++7b2J08+Zos4TBlyfuK6d/b2rv1D9O7Zv+s+50Nw8usEKq0QLKgKa6SQEM1O93y6rXWzLZK68AALCZ+XKe211ak0FgMZpAUV0SBu8tAAwe0BgqxXW1yxRSWCsiSxDQK0JiZog+QvQOmGvtqSIESwR1UqsC0nVTLHGdy84goJQBpQ0wIYaUXEi8MqV0iYjYGsuPM8buA/Oz+tibEcLXJSYg1tSwGCCkBCKMM/YwrTVopToHYefg3aVWdzhr4hd7QTj+Z1pwjfIbB9/cv1tl5ju1VSGqxEFY6lo4pQgheo4xlClyBME2ar1nOMt+dDBP5P8Q8ChjAGl0dJRF64BEAgBeBCBxrOnFIYKkVOPQ6yBZREAtIqgUThnC+5VWd1qtHtNW/wCB9gHwAIuwcEJCGFSkxj2ke37lV36lE6bLT/W6vdW9br+KMTERISrtEPHIfQtsvnnz5rhz27bZKcls70MipVpKK/Yxruv3+3+fRNYqY74XvFtf9qd+75MjI7MXrVv3XWJ5IUXOmKNGlCeM0pNGKaeUqkAkx4aShM0AXyOCqrECGgDeAKWOmAXQ+VdC3iFWlRMAh1gLTTdt2kQwOTmpjXrMaN0DgOEYwjGEREWWRQIacD33H665aOM5AAA3PvjgCzfff//tTUkKH7300tPL6f7nJ6emPzw5OXHWxOTE0unpqTxUDhAAjLJgjAVrLWijRBstSAghBOj2u6nq98+77rrr8ptuv+1Jq/WDubUdo4kLm0Ge6caYz0EZE2ae+2C/eAYI9iuiPLG8LzEPEAmTqk+ZxBFiqp85IgCpeqGjQtDNWEjRDO+Gm8bWu3kTnBg5RZ9SLJlFZlKPsJF0If4EOQDhILIY1ObmEEEYwGgLNssgsxnkWQ7W2jRzksXaMgDMMyVlDcEVEU6JB3/mE24TAN6wZUvoUPZoltnnFCDNYNBqwemMZZ4pScKYGCXhgqmUzv7kxRfP/0kH7E/ruo2MjBTXX3bZoVdvPH9NFDmbRSwiDtZd/aadi+92HmuEMyALs0LURuMwGTJG4y4kGkay30kSfigptX1VrXRVNZCYkQS/v3LlSpl6e++Hq8qdXFVVSpxEk1J5kWdZlgELp4k33LkjIyPFDbfdtsdY+0hncOCZ4eHZ24aHhsazzL6ZQtjgfLVMRDrO+eVV2d/Qn5pa9vu///teW0vWGlFIWoRfV4i7lNZ9ZdQriPi20bpvbE7K1PYQ0ko0KVRaD5JSezTi81CW4V94z2QTAN3ypS/tVEp9TyH2Z+aJNzz4YF/r7KFWq/37qHB/v6zOjSEeZvPsq1lhv5pSOiamePJ1GzcONbl/GQDAVRdecsnUdPmZicnpJdP9aer2yn6/cj4mjsooyLMMatIDAAFKZq0tilxlxgqAqH6vV/bL/io/NfURAITM5J/LrHkl09ZqTYK1cSoxwDAjF5s2baIRAHq6fKNPSvWYaRGnpCSlQKTAGAtaGVCk6tEONaUeHmyfPnBbaqjOMy6Ad9UjSRqfWmJiSQec5E3tONPArpskM69FtTEWAYGZ66qKE5AmMFaDtQbJaI9EC0XkkBhjSClgPa6KTZeylqg1nZT4MytNNjdO72XHHbd/94431iSAU2KSClFTE7gHShGoRtWPIAoRD1MoZURcvWbxomWnDA49/RNodAQAuOa8961cfezij0JZnehiPFESnBSTtFPilSKwIgl7kSaip0Z5gtLEVuuWNnqrNfoVRLUHFTyDTG8jyEIA6huKL3NKZ7mqOjHEeJ5ImqVIPQVKLd2/d+9KV/nrqrJc4ENwJjN5q2hN2cy8oZSag4S5QnQto7/35Ph4+aFrrn4m7qMvLJzfufXI+Qtum3auQoBjEWkXAtiY0jGkaUrlxRfGX3xx55qlS05HhLVa655W5nAhXKCVfqaVZ/cCw4SP4VSW1DHGJGusKCKNiqaI6Flj1KtK6R997qGH/kVT7wwXdNm6ddtuu+eed2aMwQCAz7zw3M6nrxp58o43dl46NTU1V4Cx3Wl9yyjzgKAwIQ0hqsFntm19evv27enqSy/d2O32/mZqumtDCB5AwBhT2MzmpgamstIaub4nidZaW6t3ECCmFFs+BE4piAIsMmMWnXPaqfcesXzp6/t273Yc47khhhCDp8QpZiabp3X+tb/5p398ehxAjv740TT0TvukENPJIcbZLMBECgVrFQhC3ZBAUvU9q1YN1Eh8hIOCX2pPm2rqw5gScEo1UErXJWYCgBAjhBDqtdDcFQEBksws3+ZcQASpt4n636k3GlCNrDAxCye2LLKNE3eRQdXMygOk/rrrqRQgAeqfcyTAACAf+uAHX1EpvaOVDCTCpIUQVP2GoNYzp15MIi0v0CFOpVJq/v5FixC2bIFNADQ+MoIrV65EAODtP/zeOo4y16dwIjAuEVSTVBf2gwxS1fdYAmM0KMUgSKKV1krRTqvUFgW0cwDczX97+1i3OSkfyxiXs3M7mGEwpbQAQfYqZZ8AhSbGqEKV1jrvFqbEVZZltsiyfp4XXyWCd3wIz0uMF4aYFugAKwFg886dO/Vn7q/jn5qvf7r2sotfTp5zAEgdpb6uELeGVmtcRCBvtf6cAIZ8CGs5xTmI+m2V6a0+xpcUwXuMMZRnORCgENIAKXqREL9ERKAAWoZo17/lmSyYntbXXnjhipsfeujZg6sFHB3lS95/7hveueNFogQ3sPf2h+975JrLrnkWpLwyBH/yyHkXvo+Fy317Jj44NT0NiVPZKlq23ekYY8yLSDTNLIenlOYG72PjFmDOsgypGDdWbJHnH/S+CmWfwZWV6/f7C/ZP9Jb/zejot68575q7s6y8uix7a51zfWFAZ50P3l3xsYuveEpyNy1P2Qt9iEtDDEf74AKAQkYB4XoT10pB4oauPcOxm2meJKkx+aTrAJhmkD3je4N3B6gHUHIH5qkiB7xxDXXxoIHxjK7ygJwRYlN2cqh9ecwJOCVhZpkx6ik8UE9CXZE2HVaiX8yAqjRGoxQHAxpqC2VzVjU5YPVvgIgYCbUHQk+KustWrowH7oRjYwde75rLLnuM0C9TAM8k4AIYjor14DE1pXF9kZUarwBEorWyStFb2qg9nOGtf3vLWPf66683N9xwQ2h5P8ioZ7PoxcyVApFZRuvncmvuJGv3VVW4xnt/hqu8IIEqbB6KonjUGPMsirQU4it9TuPCfDyLX75p06Zvjo6Oztw74NoPfKBthodbnx0b+9q/9B7det99z/zKyMjHd09O/qmrqo3CaZhTmCORrg4iBgmrrJE6KaVeNNo8rgg8Er2qmbd97sEHtxzEB/mpgu/R0VHeq/F9hHQaAPx3AIBrL7vsPIr0VntgsPv2nneWKQWuFujEy35p5JqHP/eFW8evuuTSdrdbftB5N5c5SVX6XgLmVqcza7AzuLc90PrLTrsY40Szp6en/0e3313gQgh1BrZGqBtVJSC9Y6xJgwODmdYay+502e+Xg51295evu+66LTfeeOPU1Zdc8o+97vRfcIwISBhidC6EE7Wv/qsGMx45DLoQ3ueDxxBTcw9KTYgjQxP/BzUJMTWLp0bdQ6N3NFrVINeY6pYIKdC6XqB4UOGpZ07JAy8j744Imt6lzECFWQCAm2H6u5BhjVgbWGMASAwCgLq5V5KuFxdDfafTup5F/sILjoTQWPOdnPSZVeQiSBSODAIJxNc7hEJBQWJSajeHdGhVVUduf+KJVwHg/qsvv+CoWMFRQFwaNApTWqqUMWTM3pDSPb50IyGGhQAU6hQPOEBwmim9EVAQQAuLwTJefu3IyOYbbrjhlU9cfvlRPsJ1kaNRRE6SEAu3AdQ+VOqHnx8b2/uRSy8/CYDz4P2UyUyeZXa8sOZW64a2uDmOsdu/WiG97aI7jkv4lW1bnvaXfuADbxLAh0jrSbH2lV6vt/LSc85pEyJpY3aSMfcs27Bhy8zzHR8fx78dG+tevXHjX6fgN5TeHR5TOrNS7kylNAOCVoq80fbLxpjHAeWHBuDVmQbGvyXkr9lXs8T4/IHLHVEvQrx2z/5ds1nS/KHhYQ0iHhIvnO5O/cmlH7hg1+TE5CnT3amO92FCWwutdtsU7VaZZfa2LC++YgdbT5dT7uQYyw9UVTWvqqrovQNFGtqtYtBa+zQRvBRDeo8hCsXQ4JdamV38TnDLJicnukVuz2y1WscAwAu33n//2CVnnjlStFpnJ+YpYzJEwSyxzNdEzyBIFBbFMQlwQ2GT2ICFNBhjIPgIKdWD7lpj3HQWkzQc0sZE0pwo1mpIum6scOTmXlaHv2giYKyj0jAiIEVAarqRggCK6hwL4HfffSJQB5buzEkLzcxPBWtzsNaCMQYiA3CMwPpdSCz/vI7vTU2OgGjeYoGOSgzfI+BzWaAMnAiCgGlMfEAEiYEiw8nMsjK4MEsSz7/ywotOrbr+fTHyakX0Q8rlW6q+pfYE0RKCRlJeKaYYk2KuR5CIeIB0m1gIYvBMdGzw4UdaqWVKYOFHP/zhO5yPVwdfmpTCsVEpTtEvFE4GRU/fdO+9e+vCAicAAGvLIyki9bqQHuybvb/CE6AEwALgfkTcF1M8pNfv/p5z1TCnNGxyOyGM96TkT/DOrYgxlUrRhFHmime/850vmjz/p9sfeODpM888U5955pm6M3/+C77qf42r8hNV2cuUMZhnLVJGZwpxHwjmBGhvvu/eJ2eSiFauXCn/ppll/WFoa6IdB/6c50+xn74kxHiG1ur5lmndhormlL3yk93p6ZPKqpSyLEsWDtoYyrMiHxoe2jZn3pxfveFzn3vm16/79eF39r3xB975Uyvn5ofowTnvQVB3Om1oD7S+r5T6hvN+QwrhbIU4sWB48H/s69kPdnpTf1z2epMpxXkxhHMA4HkAwFaef8F3Oqf7EEhbA0LgSdHTqJXWEUERJSICpepg3MQRkPUBvD0qAIl1QwQAQWkNmhAAuTGR1tQspCbCbAZHngSYwrvrpklfkgaxoGYacfxuHgKk9GONmBkliiIEAlVreKVOlSMNpJQ5zGRmr80sKGUAmMHPMBeaxUZAPx+1q4kCklUr1wxyjCf5GE70Pg3ExCx1SF2tR2smHUQKCeCouraWEgTmAuAyQXhNKXpVW/MyktoNRCkJt3rd/vne+/dam38vz/JvOe+X9nr9LKbEShGqxsaXuGYIaq3AKDVOCkpEfBVj/pRAmMMpHR68Py94v8yHMIQCU1mef/pD11zzwllnnaXefPXVj1WuWq2IoMjz0lrzVAhuyXS3e3m/3zslxrBOa7U9L1rfQIDhxOkQZfQPtbGfy60JnNLZWus7lDKfQ8JDvfNDAjLLWOMVot+wdq2//4tffGvHjh28ZcsW2bByade5eH6MUWltVV7kfWPtM5JkVq/XXV6WvfeuW7Hq2PdfsPirn/3s/aFxyctMuOBP+3rsscdgdHQU1q5cLEpoz1Nbt05sAqC3ly8PFuDtTNvvtLF1w+cf+ML3T1y1UlwIl3R7PT09NVXGmNBkFq3NwRhNWhkXfTpqxZIlV+6b3Pt/OVe9N8RQsEhEkERClBcZDgwO3LZwyaLf2rdrz5X96d4FMfqoFXYDs5aUhgBgdqcohvJW/tU8y//+6W3bJgFA1q9c2Y8pnRVTmp0SJ0A0qM1gpu3LqMiFyDkzHw0Avg7faTLBUz3MrqVWCTjVK4OQQBEAKg3W6nom1pSLgvV/G0OscXuxFkooU6fk9EsH/X6dIaq1gXqmgCCkQODdkJmZZgs2qU7NvL3+M8wMx8kopZLWequIGGaRxAwpCXjvAYEgzwuyWYa/UElpYwy9JIdXzi/0PnlEQk265kQgNfMWAe8DoHBpFBCSrvGcpJ6wmfmKNjZDkSymNABIPVf23zfd6x0BwtZm+SvLjlv/N49/87sXcIodEp0EQCIziiTgyIkUtUDkeaPUPkToVPvw7rHNN3Wv3XjFywhyfEyxLPslg7C0W+1CKfXy6OgoX3355QurqrzIVT4ODgz41kDnHov0WrfnP+Kq6tCy35vI8mLQZnb/oQNH//Vb0688KSD/vT3Q/uPP33nnN6655ppBv2f/LYr0d25/5P6Hrrzggh0EdBsqfKSV558JIZzRn5z40w+fe+6DQ7Nnf/6G227bM5QPPNsz1duJeUmRF91W0fpMlttv7983+WcTE/sHyrIM8w5JV5lX5uz8jd/4jT/98z//8/L3fu/36KD72z8rL2fcFzffc6BZcvDd+KnmG666+OL5LqQzFNGTWZZflBWuFMRU2BxQKUyJQ7fXW1CW/ctijBJTckrrMsssaqqHXFoZtMb4zNjn9rz85olVv3/K9PRUMkYHrWjAT0z+EgLoVl58Y87w0B8NDA5+489vvHHy5mZ88bJSU8bqp7EPy/tV6XXioEy2yDu3WFn7I6yHYgCMoJQGrRBcDFD2HbAwaKOauVntAMfGmW2NBkUGVD2PrTfjAOCchxTige4J1lURSKjd4yEl0M1MMQFARAYFBKgEQmAIIUCuavsXcwIfI2gAkGaATzO59DWAKNQDegaRAKAJYmTwPoImC8YYtlk+9gudcBtWrJjlKnde5cNRMcUESEhkmjsWHogsak5wrLVfWGdWAs2OiWfHmJbVcbS0VykFMcajvXNzhCXmrRb6srfHVf40BDwkL6xXSlnnquSqigGRbGalyO1zSqu9CBBNi49ctXTpLEnp9Mr5c7xzc533USvdyotsW2HM55968cXp1ccee3m3170YEdLA4OBdcw5f8Iet3QPfd1mXOMb1LKCstcba7OFP333jd9YsX7HUu/Laqqpg/cqVaETNUZq6AGJWL1l8GBItzWz27cFZQ3964913P7168dILJyYmziqdOydFf9KJK1Y+9k/33rt3xaJFixjwLGvtLcMLj/gD1rrnprvXT0xOZr1enwWkIqQTJ3bvPmPFMcd8aM9bb75/zfIV/rSzz35ty5YtXLNBdhwcE3ZA7L25MQaPjo7CtZdccvKqZcveu2bx8iNXL1+xAVkuEJTMaPOmVmpSZ9kh1mYtUoqFWUIdesIxxQoRvbGZtdaoJq8AZ8p5FkBXledM96Y+NDU9ZYL3HlAocSJXVhhitEQ4K4Ywa//ExIfvOfbYxeeddtoW+/TT8S9feKG/dvGS6dK5y7r9KgEQ2MxqrXSFSHtDSmfFGCjGONNPh9TMv4RTk1LaCAO0AWs1ZFkGRtsawyAAKTKkxJBigsQJoL4sNMNyakCyBKWroHKuBsxaW9/WZgCwqQmLaTDrROrATI9QgOhdKRjVowMNgPsQYTsgGkISQajBxD5AluXU6nSqopXu/3kTUAEAcPUxx3AAOTFGXp2YkwBhnbWt63kI0YFcrzoFU0CEkRCABWyIYaF34TAAOAqJ9gJIjxNXgLgUESMAzI0+HoOIh+dZNtXpdD6vCDzHuJxTslmW6U6r/b3CZg8mBV/aW/a/2FbmnJh4XVWV53gfFjnnXOJERWap6HRuv+3hhx8GAFi+aMkq79wFxmTTrYH2b3/2ppve+MH2H6RTzzzj1VS6Y5XSa7Is21YUxTOnLD79uajK9/gYjiyr8oPOhY1K0fxD5s7+4+np7pX9qvyfKJANdNqjn77zzj0AACuOWfQfut3pI6amp/YDwDLSZsGJa9dWIcSzhHmxsfmPxOhv5qUM9l15hvf+kMSRCZFCSuKdP8o7f7QPYQkCvA+cq57dtu3xHTt28Oaf0kQ56O9o8+bNsnrJktO9c//JeffLMYSLBHHSavvt1oJDPtvhWV9WRQoINCgih9Zpswlrlr9SrVYLO53Ot7TRjhPPS8xJuElA4Ej9bpe63amEAFy0ik6e5bWlE6HNMfVZOA8hrOiX/WOJ6PBWUYz9r/HxaQDADStXmsqFK10IVmktRd5iY82AEC5JMbS89xJCnRfIwMCJoQ5CrHPlsKE0a60gyzLIswxMU/KFkCBEDz4EYJE6T7ymNbPWRpQ2YLRBQQDnHMToAYhAKwO1qateVDHFGtuh1IGY63oOSM1iawTN0KTxomgReVsAX7bWGmONxFQDiDgx2FZBrVa7H1P5xC/CNMFntm93a5Ytm51iOiUwW5YmfKLZFZRu8gKayyu821gFrmPKAgAGIq0EYDknPjYxH0FKzSVC7bxPvvILASHPsuwbdrjz/7SGBu+BmF7PMktFln+n3co+Uxr15Tvuumv39u3b04aVK0of/HpXueO9D+zr+a0qWp3uwPDQ/+/p559/5/qLrm/10/4LU0qnGmO+1TH69qVr14bx8XFZuXDRuuDLi0XgMKPz7xCpOz/3wE1vXf7hK5/q7p14hVNcFAMfSoT7QWkKzp0YfDiKlNqhrNm7etmyRcsXLToxxnheTKkdY8LSuTKEsDTGcC4CLCRjfqRIvSXeHZ8kLZDEgyJpOaIKJrOoa6ahT5E9C0cRzmOU41YtWbxyzeLFwyesX4lPPb9t109mOMybN492796N4+PjsmHNMohRjubEcwnwLaPN5kLBrf90663lsuOWmVD69yROswjkWGX0fq0VMYNKKYm1VhmbPS8pDsXg5wlD0oZQKQWklFijprK8CO1WS3Xa7R+22oOfarXyMa0UIcBqRNSAEDhGZ42esAODtzw5Pt4fGRlRt91zz747Fy89WQSXaWOrVqsojM2eVooeTZxWBR9NSqlu1EvtS0upLguR3k27UURgjQVr6oSdOtMtgPcBRLiG+Vhd23pslhujLZJi0iTMjJVzEHy9sEzzGszNCckMpAxQ48cTTo1XjprmCb+L228WZArpm4jUL7KCtNEQgwdXBQgpcacz0G7lre8++PDdW3/uO9wm2ISjMAoG8dvKqO3kaR2AxJkPQa1DU/VRjnV3JokAJzywYyEhEWkIzBJdDCAypJXSeZ49KlYHYT631+1NA0qW59kqrKr8MzfdtBcAbmy+/9k86nP33PPEh8499zc48WCMvgsiokl3iOjrN91115MAIG6OY3lL3qdI6cyYF268776JTZs20W9de2379f2T54UYjwPAvaR4D3bsDgCY6RY+du2lI0sJp5ciITjv24DqDW3tBCCsmp7u/hrHeCinOE8A+8ba0Gl3sFf2pN/vB++9mT083Grn+VaWZJOL7weLDyPRPmvt/oJlAEEiIGKKkWrOfQLnQ0xJ2mUFVyLhdR1uP4qAl/7ept87EA32k3O6z9/1wHPXX3/9r/V37jwLAFRLDv3GDffXGXcy1Tsr+LA2cTpTK/WoteZZTrySGc6JMYboA0fjzk8xSYjBkzJIpIQIFSL2bZ4/ao3ZhwAtEfrsTffesa0ZDD92xbnnDoCIkpSyEvA9AmBK58zBkqIrsuytLDIBEZHWFSn9VBOgxKiaE0UOtszU2DStqPaXhQipkVsJJ2CkuoRMCYRTsxDqfMEsy1Ar810ALon5OOE02KhoEJrPZp3CVBtqUp1TV59miiAIgwQG0A37oelkznALpMHpJUmiQDWTbg3McIBIgKjY6Kz/C4FgR2GUmw/5jis+cP4TWoVTA6cKRWhmNlFne9XlJIIABgHPsd65QCBFgcRVw29HoBpHNt0ZGPydz9zymVc+fOnInwLIRyLHmBJTdHzpJ0dGbvv02Ni+mec3Y9U/SNwrAAQsXEfK1p0psVm2b6bhkKamloFAppV60yjzNQDA8fFxXLlyZakef3yfQpoAwC2k9aT1fsN1l13pskOGt9xwww0hcTxaQDoKKRoiFYj2cZJ+jHFARFYiSgCAqbpEAzS5xSFr2q5yMabkE0sZQzyNjP62Mepuo7Rj4j4CdEXSUIw1oJQbwK0IAyqFpCgx81SM3I2R13700o3Hjo6OvnTmmWfqzZs3x6suuWQDMi8CgD23PfjgZgDAG264IQDAVw5+bh+5cOO5KfnTlYLXlTYPicgOZCRC2E6EJyqlOgycQvSekwBiHebMkpAjMCfOSikv16R2tYr8iTzL115zyWVrfYzmygsu6mQ2f6LotG5xU1MXd6emTvcuLjB6cjYAvDU2Npauueyy46qeey8pVbIgpCSGU1pESr3ILFpmkm0Iax5lYyRtcA/gXADvuhACQIoBolEAUmcEpFhXT4QIqJUYrbXW+hGj7bOEmJOk3cG7DwpAh5vZAjYu8XqMXoueZYbCjAoQGtS6ABjEpssvB+QnM0DiH1OW0LuTNxFUCDLtJXviF03POaD8J6P2EtJ+BDENRLiO/IV3zX0zPyBC43EShMh1JyiGCBwjSA0lTIqUIKIMr5/93/OivdVqA5zS7KqqPtHt+1/76MbLz/34lVeeCAAyNjaWfmVkpHP99debAwqeGnwCwiKklDLGVGTUnQc4LJ4XCAgYrZ41Bl+b+f9GR0fZar05M2ZMafWCxBjLyr+vdOUnpt56+z997LKRS5yvVnJKBIiGgDwRASB2EidMzKUyOpksI6xnNaSVqQYGBh4YHhp+cWhgUGutYxJZBoKHWZO/efP99/wZkHqDBQrvAzvnIPpQGx9VnWGmtAab5dhudVSrXQgS5aULv/nRSy9dunnz5vixkZHDgflDMcZTBeC9B3NhNgHQSB3agtecd94HQ9X9RIoxWWuft0X2BaVpIKVqoXPuUiJoW6sFCdB5h5EjItTIuRgYvPNQlRX2pqe51+seVZbluf2q9x97ve7/Lvu9m2IMv60Yv/2Z229/y2r9TRGciDFlSqkV7773cU1I8ZAYWEIM6GPgkOKpMYVLErMVYZ4Rpdd3tToxJzP1fS2zBhTp+jRihhASxNBkwwM1Dbs6K50FIwscy8DHABHkJtumlHoGES1zXbVic+URgMZj2SzYJqZJGGc+te+iE+Rd/X2TYS4zLu+ZfAFolCWNDEbgsP8/ZAvMnDIWZRIRuwg0S5pDlyUBs4IIEeqElJmh/EzLEkEDgbK2WZSIwpxSikPTbvp9n/jEJ+7sjU+dzcIaEbUIx8RwqPh4tXfyQe109+qLLx81lN7cPdX9HzI9/eL1F130J3DYYWH3Kzts836CJgRjDGW1FRd/9bzz7C5JaxBFa8ItADABNTuFNwHQ6H33PXnNeRcZkPhxV8XlLJwnlmOI1FnO+zdT4qOR0IeYlkz3+5nR6rva2EeY+bQQ4yAnSUBQd78QUWuTUOs3KeIcZcAAQCKUVznFE6uynLr2kg8FkDRXAAKSQm0RrLag7buGSkIEa23tZq6YQigdCowg0Zxfuvzq3xHfC0BUolJKKbX54BHCaNOSBwARxEWCEjTintYhh9wJWwCmDtu5yvtwiQ9hjtG2n+d5LMt+1i8rUcqAKTQRIrGkmDgyIFC701HW2HcUoYoxLVKKniRNdxilMFh8Z9OmTbRv376XWvsntyhFFyHA0hm5nSX7eAmhCsmZVAOGOEYNwjI3cUqpUfpTE8g4k1LajKkBEcBmGoRVfZpILf9CINEGhBIgCKIIQ0yBKdIaVKptlPxnWxSvVr46D0AOLGqNdSUmIUGMzb/XJPo0xdKPddxZ5MAMEAlBEgszK0AkIgMQGbjJMK/DNkG0Vma438df+ISb2UkTQEIQrIeQ9U82g1QLPoBzHrwPEBvLBCICqloJoIwBmxeQFy3IsxyEmX0ZfrO7v/tnoQqnoLAlVLuU0oSILqVkemX/yG6vuyaE8qNVCP+lX/beX/X7vzSZ0vvc/v2rFMEgIjpSiDUsSJfN05OpgYEVSdJqEZgNAN9q7m8/lvTjB/j1GNJa792aGNIiRJyu0f9xrVL0mjHmByJinauWuxDON4beMdbsMMYoQMV1K1ohKRVj4lbVrz4RIZ4EhF2j9TeJ6LWU0iwfwgnAcSWDzELCZJRBazPIixyKogVFUYBppEIzvqwYAzjnpApeUkoZqDD9ufvue10hfldp/fVb7rvvm/+SHMwCfDuz+RbU+pEbbrghwNLpIQHImBMzp4QIpTXmOWY2VdmXlAJqRT1r7V5rDBttMpsZ0261X5g7Z/an8iL/fGbzrw4UnT+5+0tf+m2b508ZxGJ0dBT+8q/+yme5fTzPMkjAsH//fj0yMqL0IUOvkVHfJMICCBnqFgRIA8hqTgzgNJP154ETQwweqspBSrEeDSgNjTcUlCLMrM2KIi+KVpEZawGRIHAC73wVQwyiVXHDTTe8hoi7hdE0bKBa6oUKBBi4UZfoGuL2LhDooPLxXScQAgEKC1gWeZtI7UMELSgSuQmbJBJlVAZRtjrnqk2bNtEvFOYBAPKJyy84amIqrGNOAwCYqCGwMEvtYpYIKREYpQGp1qCR0kAA4GOA6CPkpEBbC6ARJXJIzHNV5KWK4MUiyx9k4ehTXCYxfCD6xNH5KJoUS1EooV2cUikguYicEmP8O0XmUWuzoxNzi7TWoPRTgmivGxlZUJbu8sr50wyCcJ7v+ik+M2n7aPZxmBNTkrywO4u89T9B8PXE4T+hMc8Ykzso+0W/l1ZWzg+lmD5OdQs6ASDVXqwEKbEqXRkRAAfaHZ/n2a0hxaUhpJORpVRW7wNNpWIgAhJFCAkYEidQB/LGABIw6GYupZQGZiZF2pOmbQ2WD2+5776v/kvD8Rnj8Oe++MVnAOCZ66+/3nxk48YLur3qGK30bGvMdgA4Wyn8GghXMQRdlWU/y7LCWPtc0W7dmlxYoZU6OTGvRIA8eLeoyIrNPlZfZE17rr3ksquST/NR40oAePaXLr98Sdg7camPwbfzzp6xsbFy5cqVdnx8fPrDF13aszYjjgHIaDBKIymliEMiRQChSbmJjcQr1oiF+phphF7IwGJAA4DWim2WfYtATTDz7KDje4IPHBML1wGns1G4VV83EEUaMBDOdB5nct0YUOgARIg5AbA0C7K549UlYqPjBQBgQsQp0tRDxHaNAZkBCSkhAh0S72pSd9UvdML96nnnZeW0uzAGt0iELSGywgPRkhBCHcgQQ71byQwdqR7Nv2v4mzn1UNVMLAAvIEykLWoVAAlJYDsCPqq02V8URVUUrVesMd/RWr+cFcVz1th3iAhuueeeN6iwDxRZvs1Yq0kRIbADZc/gCP8uBH969GFYBFKWkvlpJ0EJqBSpKWv0q0VW/PFtD953120P3fsDXWSfzYwRReCVUm9rY2ztlMIcEfta6UlgoVTPcVAb00Og3IeQQowmMZwrLMchgJBWgAg6pYSBIxJChoQMUSA2ISXMCequCcpMoIlSSqzNyGZ6Siv1rU2bNtFBvJN/TegsDaoBy7feOlQiXyiQNIF8ulUUf5xn2RcAcH5VVSc4V1UAAJnNlLX6kVvuGru5NW/2H5ExOxKzVL462vl0EgDtu/mee57SzomwnOBc+V7fd1dddcHFv9qb6v2Xbr+/2PvgJfKhjZA7bNq0iUgbZYwGTRoUKlJaV9qo7VobragOq58p45rtu+FEMngfwFUVeOcgxiRIaLTSu6zKHs+KbEdeZD+0JttsMyvWWNFKIxFMI2gvIChS3/1gBkcOACwJUpMNP7P9sjAc3PY94COlxt0jTRBIjWfINGr6SUMsEYHVWvI8079QXNVM0N6u0D2KIx6WEhwBjIwKUJpZhTRqamlsFFSjjwRphgQroIwG0hqMqZOKU0wQYkAUiUy0NMUwQCA9YSYUmasU3jPQbj+eCvtlo3X4/L33vnT1hRcuauc5R5E5ClFfdfHF82+7++4Xr9248SbPcXmMaVaDN+ckEEAwSI3ZVerHobQ4M17YuWXLrm7b/iOK4OIHN9w5MpKplStXyvYnxt9yEq6OybUSp+OUom6edbaTUs+RoklXVWt7/d4pPgYZGhz6/uzZQ19QWl/b7U4f55yfBoSjiqy11xb2Xu/9e4L3q4L3bSKFwDBXkwqJEgIIMAkYpQmRMgaJKPVnQmktmpCUpr0R4PXR0VE+iHnyUxfb1RdeOEsBHH/T2NijTUbba1dfeumDyPzyTffeuw0A4OqNG4/0/f4fllVZcOJ+p9MZbLeK52YfkX0GACBO9o+p+v3Tp6enUp7ljC0IieOh142MTE4D7NE+fU0Ezpienj4KAE6rUcapT4joXPXLI2ef89Yhc2ffOjo62r3y4g/FukMdARlROAkIRULCOnq4nn9prYBUvYdgBGBkSKnp4B5IJ0WYubVh/bsZY83jArCEKB1Rv4yZIM2TCCgjaSQkrqf4WuO7JlVJTSb4zD0ND2TJzUQTMwIoJCCoh+QICAo1s+ZtSILAdY9lZqEqIjBZhjaz+mDayc/9xczIIiScmIUP+Pve1fnVxkFjDegsk8xm1pCu+5hcd4MyU1svBLCODvYBYgjoQnSuquaXZX9xVfaPca4aSCmcCZD2tuYXuz5/770vAQDc+tBDL9/y4IP/YIi+F1OaqwA+MjIyUliZ82Wt9DOElEvjpydLbaVsqY3JgfAV1sybAKhhTspMcOANDz5YAvPXEVFGoZ5vjY6Ocgzlhd1e71JXlmcKi8ls9qV2q/NHQ8Ptv85s/gQgdkrnUlVWIiyzbrzztlvmzBr4+MDA4CuIVDgXPCC6vNX5rlHq6Rgil2V1qHPucCCY1tokQMAozMBiSKk3TWFv10o/l1KyznlhZgKQIAyLDOJRAIArV678Vx0Ftz700IR4//QM+fr6iy5qEfO+W+6/f+uMeZ6IXkgxYlVVlbVWzZkzZ3e7M7DF77TDn7zqqvkhupN88LO8C0lYHCG8FFM4Lfj4m60ezJ51+IJvxJhCr+zHyanJae9dyPI8FXkeyrLi6X73D3dPTv/HT4xcsyyEcEoVnQshYYoppSQFCCyvRRCNWokQlFJgtQGl1AHVRx0HhWCMleZuGxPz7Mq7jb1e/4Jur39BWVUfAuZ5WqnXrcnGtDU/PHLpou984tpPrI4pHh9jqogISenaVBpDHXPddEY4cXOmHkiJA+AZ89wMJ6VmpwAhGW2matoQ/9iJiISESD1Q+VONcfvny4d7rKHYbVi+qOCEK12IaxJzwUIi1OT+NpZ4bTQUeYF5kevMmJ0I0hJmYq5lO/W9pM5vjjEAx1R3gAAwpZh88ImZYw3/4QXO+zXlpLtu2aJjFq9dsXTF8ctW7Hxq27apuxYvHiqr6ndjZLnrwQfueGLrE371kmUjIcWlitS2LDNvKK1uVYgTnPhoa9QrrcFZX/6zZ56ZHB8flw+fffaxK4856qrjli6bePqll/atWXrMounp7p+sWnxsa/XxJ3znmOHhI7pV9f9UlbNKKSnarS/OmjXwP7vse77nfityms0sA867o50re9ZkR5503IlHlch35yZ7GSAej4DzjdETxqonCSgxp1nO+0EQoaIoXlSZfbpybkVVVV5rkxVZ9lqrGPhWTHFOr99f0u31PdbAGyRSlc3MWyvWrP3OTB7fv/b19Msv9xq9paxYdvRRIYb/smrp0sNPWLlq12Vbt06sXbNmwPf7l1beHzowMLBzwWGH/F/C8spkf+rP+v3+JxPLWcIASms21haIdERKvBsFJsXgIf39+0d6/f5JripFACQv8qLdaT+jrdkaY1wcY0rG2nmAMKvvypPL0mFKDEoptNaA1koEmkZbqD2+xiggVQ+1navAVRWAiOR5ge12O8+zTJRWLMymctXcsiyHy35/OMY4jEjGaP1m1sq/q5VWE3umFrvKf6zX764vy35VV3x1JFVMdcOEZ84zgQNWHBA44DBHgEY1hcAxAjCT0aoyWj8PiA6BiLSq8+1SAmEGpZUkHnp0x46n4s99ws1okm95ZPMbgvA6KfKkKCfd6JIhNaITAU0oRiuyRn1PKbyHQCJyQokeOHpIvgLnSghVWbtnRd41uAsgEoEymcnyApXJXk4Mh05NT8+bnu5e50r/qcB8RpNkUjAIxhhOvm7jxnN++bJrjgBIXQTpC/AKEdh94x13vJpF/fUss3cJgJveu/uaqy+/4KhNm87UlKszGGF1mcJ//PD57/+dysffEeZBRHrv1NRUVqb0XolpyCpVFFn+ep5lj/zD5z//pnFwflW5c8tu7wqOaWmn1ZbZs+YMxeh7ExP7r4XS/8Hi1cs3t1qdTxVF9kJiv6Dsdc9GhN2tVuexLMsEEYUBOszSAQTGeqtNLDLIIQ1wklmNHxAQySKSFpYBjnLknXfe+ZOLDX+C1PzP4EOawFWlO9H3q4+FGE8EALh5bGx7lmV/M2tw4K2Wzf/4M7eNfTcFKaMPy8t+tdCXvlCKuNUqSGkKMfFcZh5JIGtjSCf5GM9TWg+1OwNqcHAoz4sWKZ2NE5p9pDQqpYBBnDAKNWEPkVM9h63zAurmSGNKk5kegKt7ACkycGLRyqhOu2067c6DRuvXECTjxBx9cN555310IUQnzEYQMSWZFSMfioAdVPgUIlXMQnVqshxUiUuzGOTdbxEAqRcOiADJQbxKpYRIWVBqlyjYxcw61UnMAPU8TgBAW5t1583r4wEF1i/YpYRVi47cIKA0GWW11haITGKGFGr8OCkQq7XVhC9AjBi9XxN8lZKPgiCAwpiCB1dWEGKSxjaPNfGIRWlj2q3WnsGhwduHhw/5b4ypi4DvDTFNGq2VNub7K9evf2qWMXt94i4IHx9iPM6HagOATAHAEcA8SwHd9Oz2bS8/se3Z3nvWrQ1T09PXT05NXRC8v3hyT2cqt8X9onQsy/6/m5icuEiE1dDQ0K8Pm+x//c3nP1+uX7LkfUrpKtP2m1neepCEDlu9YuWalNKhKfJRzofZMaXhdrv9rcHBobtcVS6bnJwApXF51e8/duvdX/j2uhXLM1eVp4fgjiCDX+4smH9L7JdrfIxHpJQGIqejBcQbY4iUYhEY8iEsTikdhYSctwpsF+23tTF7RPAwRer1D19z9V0/LfbrJ3IgOhs2bMj/8pln3CgArFu+enZVlh8nkP1tpL988qWXpgCAxrdvf/y8M8+85bN33/X4dRs/fDRQHNSKniNSeUzpsDpJlZHq0ERWSikEPEwQjgUkb6zd2mrl39I6d0rpQQSxzrk1/bJvRYBarVav1W7fjVqZwGlRv+yL8x5ncHTBhwO+N2CEFCPE4OtyjxCssTjQbnOrlT+iQPreheNiSqBrMTNqZTDPc2i12tba/Alt9M6q9Of5EI8jpM8tWXPsjft3TZze7XWPrVzliBopcr29Nf2pBoeAjf+N644EATXOgRplaIwFYy1p1DtCTG9UzisWgSzPAJHAew82y+3AUPHIfffd89oMBOoXnsMRaqsU7tHK3KqMfoUUGaWQyQCQAtEKjQIW5LRLop8LKRbEKTMkmSVUGlEgMkBKokGs1kohoCSemcOICJGlLH/zn275pze+8MB9f9weGLyx3RkoEkMMKZ3farXob8fGuq1W6+uk6WXv3XFl1T/X+3ABMGcC0geC0z/xiU8MAADQrFlPC+LubtWXienuYWX07z96/fqp2x966H7R9IQPMQehMG/u/O/c8OCD/V8971czUmbamPYfHjrY+v2b7hu7FSBtQ+bjNVHfKPVSikFNTU6V/V73SBBut/JsemCgPYcQe+zcWgBAW8gDIukN710nBT5RynKZycyUMlq74GNZ9h2nVIupUEGMiStXHeJ9EGOsGWh3Xh4eHv6HVmfg/iLLv66VfvO6664bPvhUu+qqq+Zf9+EPH32gYbJx45rcp8tgb38Qm4ZXrCqXG/2o1epPP/flL7/RbJ585pln6r+48caJj15wwYp+b+J/e+eOvP2hh/4xb+V/rwgphYgxBmER0qRKrcw9Spk7EdWYUeb+Ii++nOWdV0xmnmEBLF1YXbpqrvMhKqULrbOv3Hj3nXfprPh7Y3TFIJQ4iUCNrUucIDSn2QxXUhJACgmEQbTWZIxxqNSrIaXjna8GvfMcYgCONQOFkJQxZqIo8m9rZXawiAo+KAE8enR0lEmpdxBQxVhHYdWJE3JAoqVRQKsmo6BRcBmiurwlAoLaWT5DhWaB7ZxmMgrqziYDQ0hCpFVfqQXjB6uyfv6M7+Y+sObYxSgIywPz8Un4OEYIiERGa8jzrMiybK/R9mGFMEmQ3pEU+woRrNH7tTKglOporSSz1mZ59mZmM1FatzhJCjGiD55j5JwTv2ftmnVrNqxdf7SxWRlSOLwse3OFeSgn+uplL7ywe+8xxyzxKWxAgApE8uCcScyFUeZHSuGbYbq3bslRq7be8oVbuutWrJkMHN9fpRAymy3q9yZ/9Oz4CzvWr1qzRRs6zNrsgQu1+fas00/Xe/Zt/0MBmbz1ofu+/L3x8QgAsHTNqldm5fZbgO1ejO7sqW73sIn9E256amowpXh2u9N6fqAz/FGbqR+IyIpnt279xsmnL0tuOq6KMR2HikCRcilFJcyLASAPwZP3jmOMjTKfgEWS1AJsZayZsNrcYSB9lYzVimgQWPip55558bHHHoPx8fEOVf43ovcXbVi3bvzp8fF9J27YoPsEP7z9/rv2b9q0iUY3b+ZnXnqpe9Ky5S/f/JVHv3XwM92xY4cAACw/6qjfcmV1DZDKTj7h+Od9Gc4NIW5gFDHagDFWGW1Kk+lvkdY9RRRFoJ84He2DX145d4ZzVeG9DylGZkm6aLWnBweK/3rZCx/ev3v57uFe2bu6Kp1SWkmn1cbMZMBQG0OrfgmAAK2iBcYa8M5DjAFRIGmlc0RcwRxbvnIYUgKOCbrdHk93p8FVTgDVgNF2smi1XkSiaQBaqLXedcK6k5Z0e93zuv1eO4bALHXiokDtoROuXQi66Smgqr13pN492VQdQyUxJZtifCuJPAWISikFqCxorSEEBudKbLfbMn+++eEzzzxzIPn35z7hZoapO0N4Eoh2MaejYkgktVxHbGZVbrNv53l+lzFml1IGAdFqZcfzVn5Xu93+06ywj2RZdlerKO7uDHTGOp32I612+06TZa8ZaywSSowRe70eT05N2l6v/FAI6TgUvLfdyv4sL4pdRHSI937dKAAHgP2ZsdvyzN6ltNoKCJaFEyBYiSzCaV27wEUAACtP3PDVwcGhV/OsMJV3Wa/b/eVrr722Pfbgg689+LVvXH3vo1/76/snJvLdL2773/1+99/7EE7/7fqExI9u3HhuEeGSspc63vfOcDHMJsCkjaayrMKevXv39XvVPIXkbrvvvodB5Pu1mPjBfrtj/qDTat1IAEf0utMXxhT7eW7vHOq0vzzQbu8jAOW9l9o8yYCSEIRRUISQvhY0jH92bGy3UeYJ7/3cst+/9urLL38/IsICa4lTOgRYQGLsAQB85vbb3xobG/Mz5K+Pb9y48MMfOOe3PaQjfiKZBwFArr7ggrOd95cyQFchVBLCaZL41JREExAjEsaUkvO+U5VhJISwBIBt4nSc8+7iXq9/RlW5gZhqlToigq7TVHrMRo/CKIukK4RlkIiS0QaJZrqStaQqxggpMWSZhSIvaqe3oJDSGYtICL7tnGuHGEWYa90/QSEMNtURUexjWFO5aj0AGm2MQ9IQmQkEFqBgJKqjT5m5yXWrz6YZErMiAkMKjFKg1bvULVSqPsGCx6qqnK+CExHUVkNua0HHuy4BxCzL5MdhT7/g1+bNmyNp+zwQ7WORWuAuDIkFGaHDwEk4YRQOIsj1nVLrz99/zz3WZLdba/Zpo/copXcjqgoZIwJZVEqssZDZOlYYEZMITyNi75jlv7Tj1i98YWx4YPi/tYriM8K86JpLLrvkjocffh5J/yUytpj5SGOtz7LMichaJDwyaxX/oKcHn7n++usNPPZYtNZ+uWXzgn0sg48n5NKb1TgQLACgHhg4LMR4/nSv13XOHb1/enpuLUrAtd75D3RdefvU9PR/LMvyKGVMmDt7Dh2+8Ih8aGgIJicnj9i5683HLn3/B//htvvv/+oMm+Tme76ya87wnN81Rj3AKR6HIofZVucfOoce+muzhjq/Pzg4UObWKGCWGAIE5xkSW0tqRycrbr/11lv3AwD0pyc3TE1NXDA9MXmB7/srAUDe9r7X0vbWIrd/dMs99+w8ONQSAOSq888/Yc/ePfdNT03/31W/XD5DFYMfQzemDUjUN1m2z9j8a0evW3cDo+wKMSofPQTnoSxLmJqewsnpyUN73e553W7/8spVZ5aVkxRjXymKWWbzLLeZNhqV0p4TL6hC+bvXXDZyGQB4rc2E1kqlFMW5ClyIQFLLqrTWNdin8X9opaTdaecDgwOv50U2wSliWZYpBA9EhO1WJ8w75JAX5h+64I15C+bZdqedmHl2d7p74fTU1IUxpGGr8WuzFrT+IcvMvVpRmzkwAkP9DaAQm7tgbTw1DQkbfyy+amYGKCBJJLFsS5KImQ/g8QAIgIUzm+Wg5NmFCxf2Ds4W/EWaJjBzEVy1bNmslOJxzHA0IyZgJK7Ns4dKlJXCPCgpHQkipwGjJ6WnT1i9RgvAsAAcLVKPPlNMh4YUzgkpHc4x+WY+VIfs1VYfQsI5E/ueHnzPulXbb/zCnU+cetLq56am3YecK68+YfXqt2578MEnVi055owY+Uwi9TYiFSC0N8vs9xcft+H2v7jxL/yWLVt4844dfMLatV6Y1zCnw0DQiqi4at36b4+NjUUAgPUrVszp9rpXl/0SrDFzKcueOun443u+cqcxoBfBtS6ElvPOEZEqigKGhoY228wW05OT7XfeeackwJMeuvfu1aesWvWVN2+4Ia4aGTE3jY3116xa8gIk2SAiTiGEm26/84cXvO+ctyemp06OIR4pkmJKCZkT5EWm253OLTffM3YvAMAvXXnluqnu9H/vdaeHvfeVtmrwfetPu/fzd93efXLr8689+fzz+w5WnaxatYrGx8fl2IWH/n+nJqfO5BirVtH65viOHT9YtWoVjYyM4ObNm+Wqc89dRSAnANI2Y+xWFf3fubIc7HbLT/b6/dm+8omBsY47A2DmxClyStyKMTjvPDIzZtboLC9e1qT2E+LsZjVHJDwGCSsk3YucljnnWr7yLMJ1MoQcYDnMCH8hpSRKkWm12q8NDQ7fBwhve1etKvt9ERFutzutgU7nnnmHLfhtawxYWzxP2uxLKS1xzvcSizbGvjo4v/jvf/d3f+dXLVk17EJ1WVV2uwhIWqu6hEQErQmakrkBETV3yebDHOvEVGEBCwp3Ici3AcTUw3o6EAoChGKtzYrWwIuf/czfv3jWWWfhTCPrF+pSbt68Ga6+8MJZwuEyH2UWCy4VxBhZar565MQiFoEOBYH5LGAFZKkIt4VxrgDMSwyBBVSM4Ryf4qkuxIEYok/CtbG9eeNZBGNMEp3veFee44VbF6xf982/vf2ufSuOPfaCylWncYrL1i5feiwg9VlkXgjxSGbRNjMvmFb+2b/6+79/Y9OmTXTE7CMWnHLGKe4zN930+okbNryEgEeAyHwAXpShvLxo2YpdW7du9RtWr1ZV2TvDe3c4kAJrTBKGOcw8bIx5tjVY/DEwrgspHVU55wQhz/Jsa17kW0JM68uyT73p7rQIrydrFtz18ssPjo+Pp5ERUCvWXDs5vXf/y66qrnaVu3jV4mNOnJiYPD04ty5EX4QQhYXFaJ21W+2Xi4H2H65cvDhfeswxfzK5f/K/Ru9nC0MUSGxtNkBWf+3prc+/vmnTJv3Y5s0yOnNiAeCV4+P8qyMjh0xMTv2XqiqHWq3W7jlDw5ueePHFyefGx+Hs5sOwbtmyywFwuCZRYcA8P7Zy6dJur3/2dK/nIkfUSkGW55DnOaJSEFNCqa0c5KoKRJJkeW6LIv+6sfpbIrwYEAeV1koZ9aQx9iUiQu/j6spVefCBhaWZvNbxU4oUSErgvQNgliIv8la79W2bmTe9c0u9r45OKSZlrCmKYn/eaj0UPPdDCsfFlBamyHNZZD6SkswWKm/lLyjJs/XrNmTB+ZHgy8UpBo8IpEiD0bpG7mkNWtvaHycCSRJIqhVTMdZBIpwEgEQrRVsJ1GssjVoLGywfEWitsdVqhXbRenDbtmd7BxPXflF7jiTvNzqOg8IyF4hkZlCYIkMSRhZIGlVSSjd6uBgC83IHbiER9VErhQCKQQZCjN4HBmHBd/OadZ1Kkhg4BHAxxBD93lk89Es7jX0cAG7Ls3w8xZD6VXlECOGXrM2eRgDHLEyEuVJUSYKTPnLRJWdt/dEzqLXqHXro4r8DALxpbOxbv37ddc++uXfvrwfnPlY5f01b6w4A3P3ZsbHdl7//fd/P8uxkAKxEZJmk9CoqikLEZZeHtNU/yot8fWIuQgx+ujt9dmbtjoF2pzRHLGz1utOYUii7k1Pvv/TMM//aGnPzHWOPfh9hVK7/yEeen5rYZyYmJjQivT/LLAFSlVJKKfiaTpNlyVr1g5vHxraPnH/+3+zZvfu6Xq+3c/bwrNRu5+KDahGA88nNEKEZf4rEawpAkUIz0OmEvN3a9JmHH97R6OAPzsi9bQ4A7NX6IgBY7kNcGkI6wwcf69a8Am0zKIo22yxj550BAEkpIXBqAjJraQYLZJLSXGbIayqxmsiy/HFt9fbKpw+E6GdJSkFRnXsEgJBiAlB1c0KgRswxK2yLxJTiUVOT1aLgw1IA8DbPkZQia/SEIpqTOIz0ev0PhhAOZdFORLwylrJcs8nsy0AygZFWkYLcGF3mWUbB1Z47Ywww4kzS6bvm0WZUkBo034xcUYsVo9SrrBAl1EPuxssBKSGbLGtnrdb3Hnjg9ndmSAQHaOW/QIcSPnz22af2XHmO83xuAjwWECKAwhr/UuvRlFaojUWtNAIAppoOFUIMKsTUksSZIBgQilJLxbCRxYDSBoxqbOvMnFLCmCJyZASQZLRau27tcd/JZw18A72XlNJxrnQeAA5DornaGKWN2QqoXnKuurBfujNFZI1R9HezD53/5llnnaXmzZuHn7n11nLVunVP6hiVCLMiWrBi/Ybnx8fHp1cvXXJBYl6PpFgbszfLi61ECsqquqIse/+fyLwsy/KdxtguMwxPTU1wWZaH561ix5ELDr903tyhvxSBIycmJ9bt37dvvbXmks2nnnb/luee23/8ihVzu93pj0xNT+Zlv1+llBwQCojgjNqiyDLIi/xHp6zf8MrU5L5L9uzZe0jwPg4ODoWBTvsBJHJaqx1tax97auvWtw8uX2bu6WcB4J4jjxxShIdnmf3fY1/52gPNM/yxofkz27e7H2zf7n533brx8RjXhRA/EHw6xnvvEIBslkOr3aa8yCtFpivMnRpFSkBYb7SkCG1mk9bq8ODDWuerVowRtdH7W0X7NjvY+U7Vnb6s2+sf4b2LRAozm4HWuna4x9Q0MiKklEARoTY6xRAWdLvdud47r7Q2xlrWSlmtzata0ytlVa0p++Wy6enedFmWXFYOY4yc5XmryPI7P3fbDbc+8ezjTxy/7nhMoVofg5slwlFrjcbWiD0UqMnKDUgopVhrNkFqXzWhKKUskXqLlHoC68jIWi1lam4Ps2BeFJzPmfeFbc9u6f8kT1T/PIttFIAvP/vsoypXXlz6eFoEPIzE9giRgAQAFCgFIFQnUJJqwj1iqJXWSATEmCIHhoSZQlCaBJUGBQmBGUA3OkyjRQGiRioI0REhJK2RCKLz4fA8d/8+2zv8X258+OHfHznvvENSjB+qnOuRUqZVdB5VWm3t98qRsl8eGQUqa7IcUE81uw7PUI7HxsYmrx8Z+duuc1dyjE8DwO6PXHrRKb7vDgVUQSmMRHoCCV5EpAXe+yMnp3uxMzCQtwfNw6j0Sij7x7gYHIfYK7L8qL123wcOnz93bHBw+O6y3/0AARRI+H0gmgQA2g/7J41V3261iitT4sTCiMyAmuoLOxKgUsKRod/vX5UY1hZFIZ1OZ06W2W8Yq94iov1I8lzf2vGD0mVn7m/YdJPhGiXH6ET/981f/koPmmf4064JmzZtwuceewxhcDCCYBcAEymFmgjyLAdjLKfEhXO9VoghMXNtcTEGMhBAAjCZIQEqWBIFH2KIKRljjo7BD7XMMAKDAgFMSUArhMxa0EaDrxy4ykMMtRUnyy0o0uCcx+ArH0LgdrvI8yx70uZ2vCrLi1xZren3q2N8ii1XuSqmpGrhP0Kqczo0A/oZgfeNd95415XnX/IeregqJkKkegRwwOomAsyxPt04AiKCIQ2i69ekWkv1JACHlCRDrcSCBm0tcIzgowdmlmIAwk9bPz9zxvcogIy8//gh3+tfWPo4WwAXMECfUyQChDpsmQBB10F5quaxEwIwIZAylCnDIBKcrwpOySMpRVpnwOAJIDIBEipRSmXK6Fcz0o8lY04xWi2qtJYUPAiwECLHyEuHFtSxW62Bgf8ZQljrQ1wGgL5lshuCosHI0/+5imHK2tyiMRUZs+TjV17Tlhgss3/hprGxvSMjI+qGsbFJRPhHEYAPb9y4MPrwcefc8SwcNRkUJdujyOEpumWMgCYzrIwKzDxYueooH3zIsoKYIk5MTcr09PTv7nr7nd8cHGi/MmvOnN+YMzh7on3U4d++4YYbwgiAGht7dPKai8+7iROvQFKLfeWT0oRKGRDLQKhZEQ2wpPf1y9AjUsNz5s59Uym1zRizPTIOIIlbctyJ9/4kRGhmY7z2A9e2Qe86T4Tn3vyVr3yz6Uzzv6QcmtmIrrp4o0WkhagkKWuQmIE0AUuEquelV1YsIqi1AmsMKE2grBFD2lpjf6SVfp6TuhQVZRxCct4HF+NF5cTUXG3sm9bY1Qh9FWMdqG2VBTEAvgoQQwCtDRR5CxAAer1pcM6Jza3tdAbK2bOHfzPPsvRGWZ4yOT09VJb9VgIUay3YLAdSBpTSok2mjdG7iVQ1dvtYmiElm0zvVKWuiLxFSAJQp+4QIrDMUOW4aYLUwmlQJEhokfQbzPJqWblMkMWAAW0taGvBAwNXDJISt5z7qRmIP2tJSQAgixccc3Tw7pyQ+G3Q6khEHI5JkghhTWBpInoQDwwNaSZoAVGstV+y1nyPAOeSojlam0lj9OMAkINARwQZaoQ0aK2VItyuFD0vDMeAyEASTggCipQ2RvcqSS9tOPHEt1S320qIxwDAIqVUJopMjGlFDH4JIoE2FkhTEpBFIYRzvI/nAdJha0847ok77rijf+aZZ+rrXt0BZ23ahPt2vzGv7Ja/5apytoB4pY1GokOSxNkhxfciYKZ1lhBJ+RSWp8BzhDnWTm8URSoTlsHu1HTiFBYbpV8Z++qXb9yyZUsd8tEsir/atv31k45b/4p37v0+hBaDMCGhUkayPLc2s08C0GHOhYVEyg8ODv7FnQ8//DvHrVrFyLyakN56euvWJ2aG1lddcMHJ65YuPf6vXnzxhU9ccsmAg6lrQ4wnkqhvP/PSSzs2NRDff+kBf+Kqqw5buXjxRh/jCZxkmaBA4nfjm2JKUFUOnHNYp9vM5KgBECEYo4w1+eNa6xcBZJCFj2Jmp5XSWZ5Za/UXjLbPxhTO7ffLLIbAtqZrgSKCGCN450ApBYOdDhAR9Mu+KFJmeNZw6LTbDzvvT5+e7n4wcjrSeVf0nY8ijMbmzTPWYEwmRV7kNstfzPJ88rh1J1drN6zct3HdOr2vSu+NrlwbvDfQ3E1RETeGTal18oz156/mqmhSoKxWWptvisB+H4JmAdBGg21GVzEmDikWWqknHnro3qcANhHAj8vsftYFhwAgqw4//NwqhkOSQEnGeBFcEllSBMG6jm0cu4B1hUkzgQhCinSltfmBscoTqe2K6G1l1JNa03gSXAgsCxJzSMCEAlwjAGRlDLw2cmg578S5ElNMohRardVODdSXyp0RWM4WBF+Y7HEBmNPt907zzi8yNosms5xYMARvUkqHRx8PSSkuQJYsA+isXbn8pQceeWQazjxT3Xjjjbzq2GXvr6rynBBjRkoLEDIDDqXERwdOopROyhj0MUBVVYq0TnmWofeemVMxa2j203Nmz/ljRFk5OblfJR9O3bB8xYeOW7rcnnry8le2PLutfxYAnrUJcPcbS7r9snddr9vPnQuMisDa3BR5vjPPi3sSs3XBL2Rh1ErtXrVhw+Zp798qlDoFUb9x/5ceeWpkZESNj4/LqsWLT08iJ65fufKNGOMHy7K8EkDmGGX+6fJrr+2Nb96M4++OdGZIzXjdyMiCFccce0W/3/utyoVrYkwrRYBYOKXEGFOAEBOkxoalla61hUhNtBSD1OY0IaTDEGEfEr4OIosQIddKS5Znj3bmvvp3Bo4uS1+eUvX7h4cQo1LqgJ4ypQQhxMZLZgFEJMZArXYrzZ0z5/YQ/LF79uy+oO/KY/KiQJvnfQQ0ymgw2kDkuqOIgGJsZm2e7dIm28YgazHKGZNRgKJ7w/lqpXfVYSASjNaKkHIgNDU6HDQApBmsuiYlSMoC4ZsI9P2YkgUWIQAwmanvnyAQgheNZItWa+err24f37Tpn92nf74Ft+yII46LwnNEAID0/pDS4SHKEDMkqccpNUlMpKEXNYmRAokQBgBhSpPeQRrbSun9ShELiwLhoxLD/JRS4JQoJsaUmBMzMifDzDUazUdgYMm0sUabt7TCHagURKFHDEpPGdt23g1Vzh0JRO2iaH1FK7PPBXdsVXrHIhEAI4CIJqW1Vq9qxNUblq3k+770xR0AABuWLesn4NMVYUcZLSmx9S6EGFNARYiokBsbRmQGIkQBBF85RoC83SqenD//kIeqqjyVIx9rjO5arUsEPNG7tPy4FSvKpw47bMeNN+5I65YsOal07kLnfM4srJUCk2XKGttDoj0xpVNDCFYYiLSel6GCTmaOYYYBAVhw4rL1W2+5584pAIB1y5cfiahWC8jhzvv3phhPVlo93y5aX/7zG26YGm8Oq4M+CHrevHlIMS4Kwf+mC/FMRNxvdDZOWleJZY73ITnvMaQEBAqUtWCz+t4FjbIihlijxWtAT4aEawnxNRAZiiHO5sSglXIg859MMR7ufTg5+HBETCkKCx5sbKiJazWTM6UEyihqF8VklmcvlmV1yuTUJBqj9eDw0L1a6Vecc6sTc1REyCKQIgOiAptZUdpaQIzC8o5wGgbGZ4D7b7iquriq+ocgIGdZ5kjpLVqpHUrTDkR8G5EOnSGX1PdBVinGb7nI+5hF62Y4brIcGBic8+BcAJvl1Gq1v/nSSy+889MCWH6+BXf0wrUMcEgSSD5xcpF94rgEACPhu23eGsgpoFAB0gHUOYBIDpyiUmov1XBPDcyYAHsCsIiBsySSUmJIIijcSLah7obVMiACowg0KW20eiGX9Jc3P3Dv9me2bXtu+dHHfLys3Pu00b2iyL9ls+zFENOJlXOtlJi10WS0AqWUtVo/lWXZC4JoY0pL169cNfv4Nav3pJQ6qi53nyJtXvchHN2vKgsIqG0GAgAxRam7sAa8D9Dt9mpki8LgK3fMxP79H4sxzh4a6IwfMnv2f/vQ9Z/8b8//6Mk5ZeX+A6MctWDu3IdXL1vWYYALYozLRGAQlUqkDSpSCQiHWGSFD9GmKAKADFrlArAgMR/BLAYAykQy65Qlx27bsm1bOGXp0rfY6L0hhLXRh3OEcDKz2de1MWbN4sULVi9adNLqxYvXrlu+uHjvug1T/+tv/7YaHx+X45Yts8ywHAB2Fq3WNzoDQ3+jjR2PMazvV9WQq3wSATTWgjUGtNWglG1QGvWC41RHGbIIMwsjwuKU4mCvV7L3TojocAQ4JcT0nhjDUqkZpsiNrEr43Qo1xABVWQIAQKfVtsqYdlmWK73zedHKs4HBwa/On7/gDyf3TVy/b//+uWXlojUWlapV88YYNCZjUqpFiEuI8CWDtLeSI8daZuKQsj99TlW6BURkrLGP2yL7pla0R2m7k7TawSzTILAYAFIStinGt7zz3w8xWECQzGaQFQVoY6ByHnq9HkQfqN3phMMPH37o6aef/qm57D/zgtsEm3DnwpeOF4BZCVTgIIZB9qIyC7VSw0rpKILIzcCw7vFzo8hmTBIZEg+yyNKU4hHCMg2Ekwp1UFrv10o9h0RHEqlBANQikhIzCtevgTST0YXInJIkHhAAsrn9/lPPP78XAHDlsYsXsfDZRttgc/tFATUrxnRijIlJKbTWglFaFKGgYJlSOiJ4f7QP7ogYw3pmXgwsx4mkDIn6SuGexLAaAIZIK690nQCESNpoK0qpmrXh6+6aAoCqLKHX7TpNZDvtgbfancGbHcTJiXd2HQ0Ac0jrVzGzjyfm02KMJwYflviYdAgJ6jEkoSClEAJ6H+o5ZKNqj4kXhMof5jmuBMEBa82uEuHFuQsW9O/+ylfc8UvXdPq+/E0f4hxE0Cww1/lwgovh7BDjBxPzGhTU/RjPWbFo0cK1y5cficbMBlQFEr6NSEORUxFiODGkdJz3nmNMKFITtZWu1T+IjR5xJrCX69KmGd8AC1OKsXZUAwApnQBhXozx0JQSYn3XPWDyrAMz6ruirzxM97pirclmz5nzjNK4Z//+/fN7vW6w1hpr7N5e2T++1+2ump7uEiBCVrRAaQ3E9UhJW4uktChUpdH2NZvZL99y2/96ecUxiz9Q9bvnhBA6iCRaZ6IMvolIhhAzEQ4x8jwBWcwCEUAygfRNZtgPAkoZAzbLweraMd6vKuh2u2ysLdrtzvfvv/8L4/XY5Z9nsquf9XSbdWpYBALvZwHHgARKgTaZWJPttDZbikhKAJklgaSEnFLDiGAQFEABrO8FMcYQhjnxEqP07qxjb77pztvuffaF575xwoYT9ilSgEq1SXjQh8ApeKw5k00DhpmD9yYEDwhytDF68uxzz/3BD37wg3ji6lVbkXQniRySGE4CwA0iQACSlNZotBWtdQYCOnE62jt3eAhxPqd0OHOal2Jc7lNYE3xYFVKYk0SO1kbvtSYjROokAVZaY5a3JpUiE2JCaHj3KAIxCQgIWKWJlIopxYX9Xu/KPa+/cZnWaiJr5X9k8/ZrKYVLmNNhlYvvrZw7pCzLUFYekwhoa0BAofMeKucgxAgznBvnfej1Swk+RDJmjrVFv523f3Tvww/sBABYuWzFFZX3l/kYeoikQojzKufmx8SHKK3b1ppnyZg3er3+5b1+byQlOVMprYyxLjLYsuxf3O32LnLOLU91JppE5tqfxnwAMwCNE1qRaqRYNXYgplDP0UIEAQGtNGSZBW0MIkiIiaMkQFJ1ss278dt1UmlMEZz3EKNPAwMDds7sWc8R4tTE5OSi6e50isFz5HiY926pi4FYONk8x6LIAAQhcU2Gs1nOxthcafOyzfPvtwfmPbBs4WEXV/3pK8uqvxxEIgCJItUiwnEBiByZg0/DMYWzE4tBwIyIniRST2llMtRatDGgyUBqFChlWYJ3DtudARkcnHXP9u1X9jbDT8/zUz/DYoMLTz99FqdwbYhRhyjMzCh1908bY6e0MohKHYuqJkgTIhMhzHDcZ2YcKUaMwWOKIQoIIcFcSTJ31fI1s9evXHsMaVRKaUGS/THxaud94phQEYKxBgwp0EoVStGU0aqntekZZV+eduV3R0ZG4l/8wz+UJ61f9xSA6ghgRkjjAKAFcU5d9qLVxjxrtXmOEL+lEC1paimtp5HIpRQHQwjBBy8hxnkppUNRoENKVYm5nVIEY0yyWf6YgCwMIeR1R0jVl/4Y6hATpQABMQXv+70esfAia4s35iw45EuTU1OX9HrlxWVVneK8y733KUTGJNyIZ+sPj3MOSufre0kjHWIG9DFgSgKKtChNxwrQ7HWr1nTWr1xznAvx4hjjfKMM5nnhlNYeECtjzP6i07mtnWd/YVT+WunKC6enpjWL5NZmkufZVhbueBfWTPf65H30DHXARUyxxonLTBgiHvBG6yboguvTDVIKtd0FEhDUyHKjdJ0RcADbVsN6ONWoDWlyzWIM4MsKlCKZM3vuQKfTkSTxsH7ZXxxjDJqU0VaL1loDoYhIZBZEwAP53jE172GWidZWGW16Nivu+Md//OOta1auubQ/PXV+Cl414Z4FKTWlFD1HqJAFXEj+hJh4CbA4JIqE9FUiFUmrem7XkJlZBHyM9XdI2Ol0uN0e+u6LLz5T/bRy8medw4krywGFMKvyrh8iE2gL1uraHiCcodJPaKQJA2o9G2058ewkCSVFz1JLthIn4RQBhEFrRZJi6vf7s13lLiNtrjU2e6mDnUeVgWlJMpgaeAsh1SF9pEFpIoP0mGl3niWUgCKDpNSjN47d0Z35YT87Nrbnk1dd9Wkf5UVJvKj0YQGmpCJHScxoje0Wrc6ffPbOzz71iauuOsxP82wyvhWCXOw9rAZIJ8YEEmMoYwgYQiiU920GiIAIKSUVfbig3v85iQikVAtdsUEAygyLQikirSUx7q18OPPtN96+tefKhb1e2XLJV4iIihRYa0Eb03APFaTkwacIIdQR51oQFJk6s7oWD6MPQSanuqFfufNzk12iNIowO0SiLM9+WLSKP9WopqtQrVZA6eZ77rxjRtR8xbnnfynLs3+fBFxKKTEjGWPesnn+fJHi8ZXzGENt1IwNBrye+AhESaBTzf4IXOOAG1ZTM7CvKcZ1Ik2CRAkEBYg0kFZ1vraPEHwd6TQTQyUg4IKXocGhbP4h8x5BhDk7d+08vt/v9ecMz9KzZg3vAkjDqNSPQKTT6/dXVpXzlfOIvglKVLZuusQIUQcwbIDrxowIYJmYowDkRpv9itQ2JLVNG+MBlZGUMmL6HqQ0BxEXCeNjqHEKgHIA5APxwURAXM/JUCRprVshxNseeujW/f8arvBnVpokYYnMEJlBN7YESxqgZgkao/VLitSrSIghxqNTDOtZqQWJQ0yJEyexjAQoSpRCBgGI3gUvIkS6RIAjU54dqrR6OwS/PPiIIALGaDBGgyIEBJQkaQGFam8CdJLYKpAzPnLRxgEy9PjsI8p9f/VXj7hP3377O9ddccU+F+UcTml5Eq4QhEAkJk4bXHBLrx+5/tW+7k8eOt9O70opmG7/WNLgBaVLpN/jg+uEGENInFLyCQiQjIHoA7CUIoh1jkJqWrMwA1M8mPrEAISYUoJ+WRof3LKQ2IcUS+8DARK0CwN53qqbMZIgBQbnE3hfx+VqXb8uqZpWLYgQvYeUGPtlCdAvfU8pZzMNRlvOMlsQ0vhNY7d9CwDg+uuvH68muqd89NKPnHHTvbdtBgBQRiEqhex9YJaFLGzas2d9mmWq50JY5Xy0IboUU0JuDiZ1UJx0FAYVsf79pJZ1kELQrGsn9YGuI0OMAQwaEJIDe78AAwtDkAgodS+eGySyNlq1BvK/6nV7ZwXvT0/MPmvlWwY6gz+Y6u7/eAxhvrHaKUUJAVG4DkExxkKe52BtVgdLJYaYmAEiAADGGI+KMXWYQRHiNmXp28h6EFBZQeTGbl+SUvuSQFuSbGHmQinFQk0mXKNRYgIQRAagFpG8sWXL/PH/Axv037zgBABwljG7p2J8RyszD5BLZazSVAuMGxuNKKKsjqlCIQ0vJeLtIcpJxHqdUZyL0E5SuSIAiinlyYcMSIlGMohaE9IeJPWWgHS8DyZUpQgzoKoTeIQZYorCKS7rBb8YWFgrYKWUIqI9Wpsde1/RX7n2ksv2Cgn3K7/BuXB6TEkhYVKNVjrGZPr97u861f911VfuTe3HFcFLjEBIOitaredSSDtMNKt88Kt8DHmMHOvKh1A4gXcVABAIUm3Jr1P6AFLDyQBsNKUCIdZRSiElyfKstHlOhVEqJpaQ6vwFZQ1IYvBVAudqtHcIoQbXqGazaUi7B4LhUyPs5oSR65I0aUEQrIwJ77925OqXAWliYuf/296bBlt2VWeC31p7OOfc+97LlJSahQQSaJYQCIEAQYINZpAxLsppyjZVcvXgiOoId7Sjo6OjIyoqnd3R9a87uttdk6u6HDKUbJOFmQxmximEEAhZA5KQQUJoTCTl+N4dztl7r7X6xz73KVEJm2KwweX7S3op3bzv3LPOWvtb33DoTWlYXmOK8Mtvf+e/PPPUnX/0xNOHXCnFhpyLQE+H4eHf/d3fXfzqu375L4goiNSYTVAlFG+fLsbsbVOgjHoy3vZi9KBAgFRHLNr25ufx2CeokX2VkcTewakhlwIrCWZADB6imo4c2fp3BqEQ42Y3nUxCbPqt+earjh49ulEkr02mUzZg8L5OB2BG13WYrq/BkYeCYKqG6sodAVhOaW0Yhs4kzZomvtAb/7nAeoiyGqKZKcG3ILqTnH4NpNGqydN2WAePKTnVot0YQDKzTwH75XuNkj9Qh9t/223Ln3/1qz/Jwb9HlLqsukyp55QKregt3nvzkeCJwYwIZSi5LzvGQwDvZIfHYhOOe/aHl8vldb3aO8EYvAuHDHya935w3h3RIi+UnM8a0pCY6w1eMupBXAVS8rKkbMzwaGJLBFLRs8zsdCb6JjucrrCT+5TfmFLeqWrJN3GMXlJSVRmynMSGXY49vOcXBs8PesdfJUe9g+uct4GpuRmMu5ndrxSWHQpLoqqpCFIutev4CDi/fa1X2q7Vk0pGz3wtAmVFQHRt2xRjh37oQ5oXrQidIpWMxXKB+XyBNAwQM8QmIEQP8lzjcHOPYUjIJVWvqXHsltpIkVGIeCi8pBeY2X8PkOWUzlgu5kVFeG1t+k+fOkKvGNJwUREdCMwEFuNqfc8UTWVuqiMqDAKNudpVQEzwroITogqYQOHgqxlXVWgH4NlTXrVMRJVZoUhFLb2L8D5ASj0XFlmFdbSUcipPfefJk7tJ6zZ27nymbcIDOZfrjm9u8Xw2G5TUqpo80HbuN1Wjn+iqz2kuwiAaAL0g59L+1n/9Wyc/+Og3z1kOfU8m0onuoiJvUxNmkUeI6S6Q68AMVh0M6AVwNGKx0NFcmaszF4mIqq2xxxfuv/vOB/8S2twPdoYDQH/ypS898Pde97p/kZ271Prytq1+ayF5kUOZUKtKiLH+rZ7BzGZkILKOTI+BcTgE33rFjS95+VXH77/j9l2huAuJ+VD04Y4k8g8BcxAFREm1wEoBvKt26SmPgXsGJnDThKYNcSs2/mPMtKVib1HVRwE6jupTsctUd6nKDMTOjdbWUgpUQcRUiiCnMsAVcl0bXg7z33KgR0AK1RJLKRfDbOmZH6DAZ5mhLZJ3pFS0JIEREGwVZsTVF+OEJe4ImFffDDaQwYgo+hgfYO+fcM69reTSpzQQ94x+MWA2m2OxXMJM0bYt2razpmnhvScxQ0oDFsslRArCSDtiX6eMceSGqtEwpMFETjYQypAWwzBQkWKAsZm8TUoxAhXvAxNYyeg4AOSSYy4pFJXkvB+dtGsAIsTgfLVDMC31YVIUxAZwAHuH6D28H9FH0e3vDAYIDCXn+qCgUjPYVqDnaEHH3iEtejqyuTmc7k/bNZm0H+7a5u6DTx58w9bm8bkLgT2BitRo4u2cNlNIFmTJABwkFXORGwMe9OxPf2a2+e6+zxf0KYsnoyJilvl8q7kNLyImBE/3sPeNr5A/U0VlsBLtMDPAgCPSYjYh0GNA+tQIQMpfVUT/uWc4A8Af/MIXDgI4eP11u0/amG6cA8KZRk6ZaGCwQRVaAOVSrcZqYjM7wgaMPnfTx//06O7ZzJ+1vn6beHeSKTazlpfkIW0YFXWBX9A23RPB8zMhhlNULYskTmmAFUWMAZP1KTam0w+HLv6Lq+P5D74Aj6cPL5ePqJQzAWvA7pFI1KjS5cq2A46K846KarW2ViBQICOlkguMWdVCJu9a14TOUrKU8uuk5EsBKs654yH495riApHy80Q0r20BlWFReDtTYdQjjndR/bmAoavoJXbkPX+dmMXULOcBQ8+AEfqhR04DzATRR0ymU9u5seFijF5VhzQkyoYap4uIpqnZaTXemSsSPAIYJEal5FKpdkrEBM9MooLlos9MQPSRwEzsaACG2wGQSn75MKQ1zfKMb70HKqNGKxEBfhR80Or8ajWxFKh57j54RO/r5XBakWnREaWu92TRAs2Ag0BUq2GPjZ+/KArUfAg+xDCfhO7TW5vHXjKbbfki2Xau7yRmoq3ZlqaSwOwhOrpuhYSSC8CVLBGcd8GHg8y01i+HS1IaGhFRdkRFDRAbzNTUjJx31zHrk05xVEHeyJmqjAAV4P1opQBG1STx0Hr6xJe+ckf+q0bJH1gtAECvvfba7iQKr/7YLQf+IwDsuf76s6F6shb/i6rqyKyuQ0uB6spQxcwRL50n7N27N+7bty/t3bPnjnvz8npl9TmVlyyWvTMjdt69vInNB2KIT03XpmeXXND3S9EiZiIW42RtbTL54q5dJ/0v/+qmm47eNH6297znPTfy5ubPMbD13o985DP/8Bd/8boIO0lMrjeqWZ4whUg9eQT4VRCfVXs/dyw24bPM7c3C8mqo7clDXoKpEOgUcnqSqO6EqQZ2QNtaLoWy6RjEPvY2HsEFx3AGqHkwCWScNwSKonaygxwVEZSckLYhf4HzhEloMW0ntuOkHXF9fWMWfDyU83AuCGow69AhxoAQQ7UD967qyVQhkiBZoU5gJqRqRuRD20ZnJiJJs5oQsRv3fWxqaM34CgCPF5HLhmWfRIRW8L+OFDYiGv1RK0gCxrhorgXP9Ky0aKVuJatjKRxBRu9HQw16qeN39X3k4KG5kpeZHU455WQ3mU6PL4b+v1r06fXDkOdN07mN9Y1BNOfN2eZ6Skmdq0VvAKxode/2ZJ59bGJzcBK7A1oEy8Xy0lySJ3K9Y8fPHjCdkqEx4IiaSVYlXYmeqz/qqr9BwXCOBeCdnv3nP3Prpx6qJOV9+v0UEP8ABYdpKWeK5Xe/7XWve/f11/3s+WU2I52bZ1U4R1ajhp91OoIq8jDQ1mx2xdFjx2647ZMf+edvffXV//O9xw/dwI4PBw5ORSGlcMlpWXI5t6R0QYjxwNpkcvf6dPrMtJtoTY1p0LXtomu7f/Ovbrrp6NVXXx0qaRZwW48FKnby+R/5yOcA4Pc/+KEvOkfPEJGqaKUQjapeogpoZMnI9aIyMfU8af/0vfvf+2hsw63O+YfYucaRmzDTnQTelCKX5JSLY6ZJN4ldN4HnyjjQIuO4Oppmc00vrXpArshiEZSSzVQuJBiPsDJM6mPUMaNrWqyvrdnGjh28vra2NekmH59OJn/cNu1tk66jSddaDMHApDTm5GqpgYK51J1dNdRlOPbWxCasdd0za2tr31xfW3umm3Y++GDOeUQXwAQrqfiUy6X/92/+ZpOHcvGQhwyAHLvViArPjOhrXHfKNe+PiOGCR3BVikWjgNPq9wmRjLL6PKhyl7rsrmCeiKKUyn/UUXwqqvDe09r6usTYTBfL+Vv6vvdN0+YdOzambdPcbYbDUPiK6lQGjHexGvmMII0Pgbz3N2+cEn6/SOFhSKfnVFJwnnzwcOyMg3fOh84HP2cfvgjw4VLUZ8lWStr2m1wFBpiZmGAC7z+Qbf7JOkp+f8X2g3Q4BUDh2LEn0sknf6b06dWk5cqB2Tu3NM7chxAs+lpsYA9GgTJMoaQ5X9gv0+nD0LP3PrDzt+46aef/WBzvbGP74tzKuVKkMZOmlLLWNI5C237KwX3DB/dmZn6n5rzWNs3XT3rhOZ8f5evlt3/7twmApqF7Hbty2UNvfnOHT396/uu/fkOjdoxzzpSLwI9fu2cHG/10a45dRhZIKbJm8/IGAB/4vT/8w8d/7R3v/CSs6UV1HoN/kInZ1IoUNR/ImqZ7zLl8eiqFxdREq0+946qS8FSXwhY8iowFp/XJLqXkJoTsHVfmvaOaa0315um61iZt23jv7nVMj6qUHezoyzGE01XkAmCAqkUppUguRbVIGScKphqgwlRz60NwQ9M1n43eHzQxb7r4FYieAqJMzIwslEoa8tDsuf3xZ85KeThLiubYBPIhQFPtRM0IjJWSkVIBQeGChyeuejhXx0gpUv1ATMf9nMGIarcfDxg0/p7MhpIEWQsgdQIh7+BDnRZKHiyXoXfe0Y6dOzba1n9TyZ5WkVcDmqq0p4VzAewYztcwRgKMiRsjueN3fud3nvmld/za+cOwXCtFjvkQnQ/OyHFg5oMMd7sRHQXpIotMRIuWUlkkWlbxwatNBgdhS63PDxw4cKD85zatH8RigR48cqQ8/MQTXz9312knpSKn5ZznJlJq8LpApCCXhFyyqogqrPGeOAT3UPD+kVAD9J5uuu5z3k/uvOlPPn7Pyy+55KgLYdMH17Ljhoi+5l1MzO4j7/3gH938mle+4h4yOsM7F0IIXyvzrXv/n3/zb47sxV7ed2Cfmhl98Kabftkgn3nxta958MCBA/b6M890M9gbl8vl5X1KvGrqRACHgBCb6qUhSjAIO5qwo5defcVLj3zwj/4gmNpLATzBzEccu+iIKJf8UhPd8LHJXdP8gRF5FT3PDFkAEqmL0frE9eDA49hqkHpNyDHrZNJ1jjksF/OTUxpAvOoQNeYohoac8wLTjZzTRVryRSWll+aSzmBibbvuodiE98YQNpiJybSrDlqFVjdzjeMyz85tNs7dqarTIQ9XQuQ8cs4F5wMxWS5ZS8pCjneI2csX83le9gNi01DbdhCpD5JuUlNZSxGkYQkiQgx1WR+cr6sKVOhfpUC0QEVG4KQuzFUrEisAXKiGPaUo8pCR0gACoYkNggvIOSPnAu8ddW3LXdd+tmniAahxKfkKVbXgA7pJh6ZpQOSfnV5UCWBtYnzslde8gWaLrbdsbW6dVnIW7x2xc8aOArM76Ly/3bFnA5yKWsmKPKpSVj4n7D2YHMBGBXbjZz7ziYPfDyr5oyi4bSHqRS964ZNEfI1jDmRWz+lS009KyhArLTO64P0zvvGf2wjTj5950q5Pn/GCk246+ZST3n/BVa/+9P/7b//tEQD42je/+cjrLrnkdhebx+EwK4KXqtrJTQxP/ewVlz38L//wD49cc+kVj3jHHRFlUjr1issuefx3HvjXW6NSma66/PJ7/8NHP3b/KD2ht519Ng43zWXD0F+XS6lqA65dzgWPEGPtciIQERKRYqo7VOTNEH0RyI4QaIMAIrMiSgNMMjv2zvsWoJeo6C41DTZGGKlWkjETw/kK5YOrkrjkOp7UuCXvoXJGToNIqVJ+mKGGOdq27D+nIeZh2MglT5epn/bzXoNz/tRdp/wPf/CB979v98+84WZL+UKAXgytSP7KX5HBZCbFEZ1CTPOU+otS31+ragg+zn0MXyLQmWZoDYhVaVNSP/RciqBpWjRNRJYKenSTFl0zQaqxx3Ds0XRtJST41ULcYFaD7kUKZJTZrOJ6iyqSCAw0Rik7qBQMQ4ZIBjmHSdfCzDCbzwymbmNtvZ9Mph+Sks8vJZ8DhsHsFAMmPkaLsamq7DE00VShVbLtfYiNZ4fFfPHGra1NbyrGrqZ+KswD/E1iOsyOWcGmoshSO/h2Trz38M4JO9oBpltvvuUzX/lBiu2HKTgDwA89/vjionPP+TaTu5wdB8dMwTnyzlEIgYKj+5rgH/XM7//A5w98655vfWt++wMPLL9891/0t9/zwPLAgQP2y29782svP//F+KWHHpr9n9/4RrrnG9/41hUvvvDMlNLP5WG4UlV29uz56jNe9Rc3fvKmJ6+69LIz2OxJNXkhcnnFlS++4IpXv+xlf3HH/ff39zzwwPLEYMV9N94oL7vyUqdCrwFhFzEnYiIzQhbDsk9IKVUEzhSmhaSUwoTWB+9jiF9wxN8wYCoqpyKXU30M3+i6yaekyKnLPl1WVHg8CwAgFNURiTO44BBDhHMBpkAeo4iJrIavSxHTih46ZpjWJ6uIjl6cBFWxUY+mfT9oqUCDH9Jw9uUXXfLy2dHNtw5DvzvngXJKdaRkRhNCHe+ksHe0jD7eDbO1IuUcx34ztt2fBhcfJsLTPoYQYjxCoG5IKfT9MLI26vkzp4xSMpqmhY+xkpjHlUTTNGia2pG4ft7VA6ya8Iy7tVWqqKhAYNuuADW2bIz25bpH8+wguSANybqunezYueNWJqwfP3b89bPZfBdgF6laUBUlqs5bGJUUMFj1KXEuBN/GEB9kdo/MZ7PL57N5a6bqnIeZtjmXm0Xkq/W2DZXLKYKcE3KuCDsHhxCdOh/Xwe72A7d85iMr8PAHKZwfxiZPAdAnv/zlb//Ca17zfyV2bTs0io36h+sA3vvZzx5+jseGnZDowvv371cUeQE596J9wPt2797tDxw4IGz2qHd2txXdUVLfFkcv4/Uc/9H11/9pGcq9N/3ph7/2j6+//vws8usKbRbHjpVnKezQE8MTGo4PSKOfBuH6InpqMStajFLfY6sfoFYJ0Q4Gqg9hUpgQs4Ym3Hbj/v13/er1v/Dfquh7RMspE8R/tzY96QuLxZNvHfqlgLl004mrDcsQmVFGh14tFQAIzoEcIbADmgaaKxteEyhEjxhjXWiLwmyVHlsTpaXY6P34bETg5myWZvP5a5h5NzsWNiyJYCLjvigCYh4EMmYKTPxUDO5R8Tho1oKYHokuPOmYxfvwKfLNn6jZ+Vuy9d8VmXeqVkbwEKVUGl9RRcoFXjIMhuBDlcD4UDPTaqwjVuturPgnbNvFoKoQYGTLAKWkSocTQ3DVVlytoqxqiiYGTLrOAvvc98vzNjeP9f1yOZSyQSF6tpFaCIxgDcic986HyI7dzAf/5ej9PdAcS0mqkkYXBdeKyoFlv7wzhGbqyStzAkdfAZJVKTHDwSmRm4DszgO3fHr/X0Xd+nEW3PYy/CO33roFYOt7uUDt27fPnusStX9/NXWJcB+dPHMkrWzTx0jcW37trW8qGfgTYtpyQEcp3UddN3fL5XXveeMb13/vYx+79Tfe9Kb/o/G+/51PfGL4Xk+dp5bLfso0I2DuQKdXqpVsnz/KmAwmqDerMkGNrYh1wyDves873nWdWFpTQzBClzSde3zzmV8Wk5cRrBAbw8QgIGgBkYLJIKbIfV8D/0KoFCjHmIQJhDMWfUJfBjjvqssvSh11nQcxAewxJEU/9CAQJmtrIGYsFnP0fU8MWnBFhMk7Zs88QkIAMjDQAB8cGh+89/4BqDo2bITgbpUkVw95eW7btv/uvR/8wEcAYM/bf+EPF8P85FJyr2Zczy2uenoUh0K8rcAuaqPI08M5j1QKck5jaKGN5N7656aKlHtolpELSjAxgLWy7seEUbWKslY+JiMwwwdPjlxSlRer2BlElEHkck5Vd8gEdlUIO5rXto7dZvTN53xoDvvAczLy/TKtWU6d5qRq1qREB0zlTiKakJkWVfR9Dy6+UpMZiDHCyBRgr6r9pCw+dcJD/QcuOMKP5kV/SUH+SF979sA1h954+fs+//l7Vu//W3v2dEeOH7r0xk99/o6VW9WIYNoNb3/nS+dl+c/7QV5OkHkSc70KjD3gGogBfcrIJYNUER2hCcG66F0bfI7sniayJ8kka5HGzC43VVJVb4ARMYHMi1oZRDDkjD5lpFygRqh6QVdvjDErwUrG8SOHUZZzTLoOXdtCxJBKrtxLAogjUsqYL+YIbYvTTz8dzIxDhw5jsZyjazs0MUDVwCeECRKqUDc4Z9OuiZNu8kATw+c8Yyrgu7yZpKJvL7CXNc3a3le85LWfuf2hL9xw+PDxf7Y5myUyWDEQmLG2toambbHsByzmS/jo0cQGuShUDevrEzQhYraYYTGfVxMhxzCtspy2bQBTzLa2kPKAJkS46KAqdfGtY6BvUeSUkUv1MunaCZrYVIctH9E00QGQPg1YLntkSTAiNG2DrunQdJ155giirzLcrTFE56N7+OTWfezI8eFXjm9u/tKRo8cu29zcMjX9govtnewwIefUs6+rhDFqij1XRYpzKiZBVSXb8Ht33HHHoz9ssf0oC+6H+gx794L27Xu2O50QEg8AuPTSS201Ij7nF6bVD3599+7mxgMH+u1Kr53S/sHb3/4ry+Xyf0o5n2qKkkqhvgjgI7idooCQhoIsCSgKx4ZmLLo2eI7Bt433TwXP7zezrCntVJErQPagY+7BQCm6u4i+IOWS+5wpS8GQ6himBLDzYO/hfEQMEVYy+tkW0nIO73zlSoYIAaoURiplTIohFUHTttjYuQMEwvHN4xiGhKap0igyA6mN5KsxFrcmz+qka9rpdPqxpmm+6IHbf/+jH70PAH71He94rSpeK4qTROTSrfn8mmPHNweDUdNM6mhIjLbrEGKDfugxXyxhI4IKAD4ETKdTBB+wNdvEfHMThNq1KggEdF0HhmE+n6FkwXTa2mTaEROw7HtsHT9us8VgREaBHTnvreta2pisI8YIMUMaMoZhMBc8NV2HlAuOz7YguaDtWrRdh6ZprGkaz879uRXdJNNpbOPXGva3z2fzNx49cuQXN7c2J1LkAPtwp2+aCbmgXF3hUL/DcaXCHqFp1BEFhYpl+b0v3vHFR39QkORHPVL+UK9VN9q3D7Z3924PAP/rzTeX1bj5XLX58/y7bVfdCcW2d+9eJiL9R9dff/ag5RrU0BAtUqhIRdBMM2A9zHmoycjKMkjOGAoAFWKL6h0LmJ+pQkRb9xwXpPiCmgRTZSPL3tGn1ezXiMk7dqaqiIHA6mBcZTVGFRRJqQekjLZyHqVUkKNtK7ReygI5JRQYgvOYTKdwIWA+X4yMnertX71EFDF4UACgBbDKtB2DTwB2CuAFTNT//kc+ch8A3rNnD920f/8X/5t3v/uZZw4d/dDhw0dOnS8Xm857jk0Lv3K65hrVripVcMpVDJsBeK6C0moDXkZ7vFD3cyWjX8xhUvO6g/dIqcARLHjn29AoOVhFjRFgGs3Q+8bp2nQap5NJaUI0Il9XCyVj6AdyIoixqQRoGcMbSwEPqd4CRNLE8MqSC+U8hJLTydRN89bW5luOHT+6c+iHT7bt5O4YmkkIQTFKylaJN97XS0iO1ESCMgtp++9vueNTj/3nMEl+UguOAFg1Kn3zdDmbXXvnfOvlJsLvuPplfeP5rrIevn7qkXT0zPOXtG///en5zo6/+da3xvH89l2v3/7t37aDd9wxWYj8LBRKzIWYnZEDyBAiQYghVK0f/EhBEleJ96KCbApHoOA5eecucBTvDY4eh1kH4paUCMwmIq6IvV7UopkVQs0lZwKiW9GBRikHFBhBERpTNKXUJBpmhxAjOPUQM5SSwc5j2rQgIiz6HpILukkH5wLy0KOowoVqdq0r8euqUMxYRSXlfJFz7pJfvf76k17yilccXz2kUtPMS0qYz2YzMcN0bZ18CJUeZgKIg1JVIWAkFVftYkahUulrg0PTVoQSbYOcCDYikysnLzd+XW3bhPWNte90sX1oczG7TlTKrlNPOXjKLjxGhiuZXYxN/DYb70pD3w1poUVq4PtkOuHQNHA+oOSEEMIoBapgFFWHGZihFy2ac248nM8iOZd8bLns7yTgvtjUYiu6IiKfgABWga2qavBEQqB//4Wvfuqx2tl+NMX2Q8dV/TDF9htXXx3OO/v0n1kuF39v2Q+XzWczN1/0XjS/yDn3oiB0Wc+45qnj9IYrzn0B7nv8yUdWqaursVNmT59298OPb/0n7tD79tnLLrronKT6VgBFDFfCwAqC88F8G50LsXaeqvkfMS7FCg2s+eM2HuyNYHqBaVk35aOiQqZaYJqTyFu0yMVZSlJVMgWIKi9ytYQ9cW6vLAgDRCEmIDCqY3ADYjfeqBlFBOw9mqYFACz7JUQFMUY4xxhSgqnABw8yIGeFasao3Kp7PDUz1eCAC2LTHPqd3/3du94AuPNf+cpTZLG4drlY7BbTjY31He2OnRtCIOv7JeVcvtv+GwZRqaRvqT9xjuCo2g247StWIX7RAqjVsbeJIDJrmtisr208zJ6fms1mFxPRZNfJp/yzj372c//0Z97w6o86F8mB+yEPL97a2qLlcjCqHo/NdLpWQgjIKWPIA8xQuZuuuj7H2Kw8LUmKwNS8D/7BwO7gfLF4ZD6bfSd6306mawYQFimhaIHZKkdAILloMQlkEMny72+7+7bHflRj5N/kGY4AYPfu85qNI+0/UPAVRbElZipiTrWYY06TtQkH7z1UqY5cvouT8K/2f+Er337uOW7Pnj3u0ksv/a6D7J/92Z/xgQMHyq9ef/2eonpNKvKLUrQpoupjCBzCIqv5+XLgPKZt1oVpgUmpaJsZHGNMwPSI3lPwHB3znB0xgw4ClIvIxbnkRSnCMIGRA9yKq4kxvrwy5hWV2Ctq6PslLBXE6BGbDszV/7BoqSBFP4CI0U3WQI6wWMygqui6DkSMIWUQGaZdBwYw9AOsJDhPaHxEDLwS7Nq0a8P6dPqJ2PobreBiET1XVF+ZilwKsq2mbf9g2q09cOjwkf/94FNPtVJU2smEXIj1YlMl8pZUqj7PBzRtHDVyVunYpbL+pSTkYYB3jOm0QwgBy36JkjK6ttWmjcrMIcRwuInx96SUb8LsmiGlt/SL/rz5Yi5Dn8v6dK3Z2Njx7abrDg/DcNXxzU2azWemAJq2g3MeYEMMDZq2hUhGvxxMVTg6F7u2+xQDf3Hk6NF47MgRCiHo2toGiioWKUFRkUhmD8emotKoIonzv3fffV/9sRTbX/tIuXcMl+gOhdcPZbhC4Q7Hbhqi99kxL6WoZ8Y0ep+M2YokE0UxE1X11wB4+Ln7vOc57wGA7tmzx1la5jLIOWoWlSA++Gls4j2xbT+/6NPPMeeLTG0JM8bI+2MAcGPPUxsl+glSipXAyxhCCOZg7F8IGNRsUR3BCHBVkwZa9UyrS+7RMAckIONKlJBqCdA2HWLbYNkPSCnDxYCmaZGLIZeMIfdwwpUIDVcFn7ARwfOjwW5dLo+OIlXq4gIgBUUFORdLuVwrYmep5LUicpZzfkcbm/8vTtr3ve+DH7z3N9797gtySXEYeq3jLgFUldgqOurOqMYAdy2iD8iiSKVHLgO0SFUqmIAcwYeApm3hHSPnhEVeYLmcYWN9Y+2UU3bduzadfOLo8WP/ZDmfn6JqIaXUD8t+EDXuuslJGxvrR3adtutDJcv68ePHrzp89Ajm82UV4jqH1rlqc0CAmqBfDnp881hw7JUmk5tDyQ+UnBoRseCCMRgp9dBxjqz7O63GtaDGiDbFpT+47767fmzF9tddcLQP0D3XntMdPW6vUMMmETPAEx+aj18Z4533z8KU2vmvmeEsNUlFRDXnHcn0Yuf9/Nde+daNfV/5xNYKbPmVN73+JWWwCwvK0ofgHDyoC6xERbeOvXBe7D2llPPMiFyM0blwd9N1N3vn5kQpQZW0FFStgYCqtTxIqe5wDRAziAGkBcSeidQAgmekioc4Jgc4JwBcPevQWKxWzZJMC7RIpXi5MmbXVgJvtcoOKGWOlBK6GFFNahlDBjRlqKtrBThApC7EVzsoED1rLW82Qu2VsWEwaMqUipSU8oZpelnJgxiTTjp/OIZ4+/s++MF79+7dy3fddtu757PZeinlWNt2LjaxWvINgqFPMACxaRC8AwHbdC8iIIYG8KNEKWWkYUCvA/yCEHyAqiJ4bzE4ik00g+5c9v3Pq8jGkIb50CcDGN1kEqbTtaGJzWea0Bzd3Dz+6mWfLsgirgmxDC6RmVUxshe46EGAlSy2HBZrfT98x3P5eBu7zQVSk4fBSkngyECpS3yOvLJjMCISH/yGKb6yftL0wyMZmX5cxfY3Apo83TiLoGLkokDQKMCqw74DBwTA8Xdfd92jQxleWEoecs4uiyzMsJWlvBB8ZAPA5v179jD274eKvUghbywiIYmm4EwdlJScpZLfNKTyAjWb+9BwID7axO6AgvN86K9OQzrLpCRHoMrsYxhXMyDbpgnZtqCUwVADihqo0lGIgxt5j6jye1eJ0dvq6Lz9EK3vI9UUt3o51sJU8ChwtG0ZCK00aKZV2HnC4d5W5pTEtajVUFQhaijjTq5q8jzIozqOFKNUREpOZRh6xOCdNp0p8xk3vOtdF9/9pdv2Hj18+NVHjx3dAuBi29SQQtERva1elCskt+Rcr88oRHXeV/a/ELQUGBQ5C5ZLwFqDI0cbG+tN2zaFHB3OuZy5XC7IQEMMHUNZQwyTHRsbT+/Y2LnvfR/+4w/8ytt/4Z89c/jQO7fmc3UcUmxa6qSMpkoFYoLAjYIQcslOin3VDHeCMRcdmjKQpn4BqMKzB3xVate9m7fqyoSTnaMvfemuL33ge6DhP/KX+2seKfnGR47n83ed7I3pSik2Y/ZtCP6hB5544vE91157cl/Kz5QhhTRkEylE1ZjoyaZtl9J2dzzw6KOz+++/HwDovm8/+tBVV770z52pkg+TGrrhlgSkoci1OWVRg4UYuhibr7jgj/TL5Zs2Z7Nr+n7ZEEHYeWJQZWOP0Z1qK1W4PqvgJl7xOKA6GnNVASNkjDpiduPPam2JrjwX60jGrsLrNBZZ9dF1ENGa9mkEHyMMhL4fUEqpAfMuVMs9HUWfqIVYYfsqqC05Q0fnqhgjurYFQEhDqg5aBCq5UEqZYGQ+8ITIzur79K6jR49c852nnklpyGjaBtPpFDE0MFNkEZjVbkrjQ8JxtUGo1K/qQ5lH41fRGkLjg6+GPpMJukmrXds93rbxkwR0wzCcvpgvlyu7mslkEqfT6SMxhps9+PHLL7zshaJ67rLvL0opIQ2JlssBKQvUAPJsTdPYpOvWnHOHUil/pip3Ejtz7IKBrOSMNCQYCNF7hBARYgAxqxKCGrIL9NHb7rjt0z8KBslPZMGNCCO94LIrHretrfWU5aJcZEkczr7k3HNOzkXf0A+L05b9kKQUAhOYWZu23dm07bf/+JYvfuG5SOUffehD8/sefuSBV1xyqZmjlxhxyTlfmoq8MIsAVFNUfIgPwvORvu/fduzYsSGnrLFpqGniNsWIjKDVC6WGU8gYqu5opF9RBQ+qjXcFRmQ15o21SXUM1dHLQ7QaVBKPRUn1vVaNqhSp6oqaHlpNdVSx7JfQogixQYgBorZNBGZirPi/NPIuqzVofSR0TYOum4BAkJKr3QKPaoYRllVVKbmculgudhw9emw+myV2PAIdTVuBklJds2v+dQVIqiI9bHfAYRgwpAElD5AiVWTqHIIPaLvOuskktm17MMb4aVW8pB+GK4aht35YUuoH896Hten0qbXp+n+QVM4ccnmTQjXncqGKXpBT0cWwpNFG3tgx2HFo2ja23eTPHfPNpeiTZDbxLhARLOeMnNKo2iAE59DGBk0TtUAnfcrZRN97x9fuuO+vq9D+Rvdw46z8H68+55xHVMvPmR3fOUnNa4pqTnnoASZmWDCnzgUXmk7gwp0A8FzA5J27d+/0zK/cnM3ekEq5qoicnlXPHFJKolYZHGZmRK0UuUhEio72v44rYXZFfwUBThl5/GcbkzTVCGW0a5esECvIWn2F3ahq50Ig7+BWfjmmUDGM3qjbWrFtZy9HlZic09j9GC7GerxbqYwZ8J4RgoeKIq8cwRyBx5DL1XtTCKg4h4FWybMeGJoIUAVZXGS0I4jRLwfq+z4R12QY7wlxEhGaFljla4+RY8F7gBgiPXLOlXg92i7o9t1a1yA6Hn6LKhaLngzIou0Zwbkbci5xOV+kZT+Y5FILX1SGvt9hwC96cgJ2D6roOWkY3jibzYZF3xMRYzqZqPPBFy0uiTxppncr6YNMPjDThJxToiqBSqWgpFI3oD6iKEwZJIp1UbsrLdLnH3j0gYPfr/HPT22Hey6IcnBz84nTJjsfy5LOXS5SzDkngsL7gBCb2LZd07SNp9a9/4M333LXSoe3YpOcHsLPlVLesVz2Pzdf9n9/0S9PWy6Xk8Uw5FwKKTE4eCL2hZjPVrUXFVExGHlXn9ogqrnSZtWIRrC9mCYm0JjGouNyOWvetr2rXh+1I8q4PM2jzYLoiOxZhc0NFdAopYwelYaign7Zox8GqCkce3jnIVY5mSaGpo119zYazK7OiCsjn1pMdX1B1YcRsQmYTibVMi+nZ0nBXMEXU0PKA0SFrJYpQvSYTCZouhZEbty52TZLZmVJUZ3ObRxvRw4nVQ+T4GvAh4ggp4S+X9Z94nj+XS4WZb6YYxh6wKzKenyEiDoozmDmdSIe0pAvm89mzWw20yIFITbcTSZtbGKC8VdKKZ8z4mNNDI2rkbEmquiXy+rz3/cQraOwc6TBB0/EpGp3fOXeO95/6Pih2Y8TifxJLTgA4Kfmx48+Ndv6yo5m56mAXdC0Da+vrVm3NnnaxXCrQ/vZD3/xlgee2/oPHDhgl17woneK6HoW6VMuu1JKk1xEVUzZVXsA9mOGmQhyzqJm5JwHu6rdKqkKZnMpKFJHsm0vEh/hxn2aWX2PVegEVq5Vq3IaJSwlF6TtcVRWYkiUYsh5wGKxwDCk0YzH0PcD5n1fibtEiNGDCXWxLVLh9Vg1Z+wYIhmaBTwu0M2qF5jnKqQd0gDPjK5poKZYLJZYLhcQGS3jeeUoVq9m9Yd0iG1E23XVsdjxmNFW7dtXQtJKwA51Zzh2UnJ1r4iR+EuOxjNpHetAjEk3QfAey7Sk2WyGMmR456qCfNJVnxTiZGbcL5bnbR3fiovlMhMxhRAbdjwY8dcU+jmR8m0hNGZVft1NJ5hMJgCAY8ePYrY1Q5EVsETSNs0k+ChJ5ff//IG7bv3rPK/9xHEpV5o6APKNo4+9/6XnnPNw17aXTCbtgQ9/+cvf/l5cyj3XXtvR+uRNCm5CExREx4l5vxKuoVxepqCuik2dmBkXqQttApN3AT5UKwMtNeBRt+F0AnyAZwLYwRmQieFyhpKBvR+p9PU/NQG0NkmIreK5RuBFFMLVHJWohpikLMi5chOLKzCi+r5McKPFnmh1K/aeQOa234+Y4MfEUUauD2gDVArIeVTLdakdULXyDImqzYEaHK/OepXD2bSVgFxH10rijbGBd752cweIJVgqyGWlQq+GtEJVplMRV95GdUUMfgy6qIRtqYEmRNBxNAcIPjr4GKvg1DE8eRQR3i6PGAAADuVJREFUHvoB89l8Np/NiYiabjKBC/HJIuXzeRieIVAjZI0jMvarKOvK7i+poO97pKLwntWDmR3vJHZ3+BA/f+f9t3/nb6qr/aSpBf6yz/ZdJOXV0nvPG99yYdL+nxi5I957IjJSMJKWYVgOG4shXZ5zukQMUyNKzjmpqaW8jbEzqN4ctgI86moA4w1jqOijqEGyjmrtimDqaBNXKU5YhcHARrifUG96K2W0jwNgMiZz0uiwLJARXq/K8BGKr87Q25QwJh79TiqBajWurjqUSqnGpM6NMkxFiBHTblKtuSWjFFkZIMMRjd4i44jhqP6/3o/K6coqSTlhSBX9TKWup7zztbhlFe4xdsnV/nIVJTYm2cCqcr2JVa+W+iWkJLTBIwZf/xwExx4qxfohIQ0pSl1HPE7s7wHRt+sBmwOzNxktGNtJi7W1DfgY0fc9Dh15GkcOHVEoeDrtOjJbWLaPPXTwoT/H9m//N9PVfpI63H8yYp5wUey5F2jf+PNk5fJcdF5vf1CM0YL3YIot2C+E6Iuqcm/O6XIVusSMpp5IwJRNC0pR8kzwsQEHX91cgVFVNp7N1MabBiNI4Sq4QQDUUGjcTynDedoO8qgpMDzq2lxdqo9K6BCAtmmgEGxuziCmaGKDtbV1dGtTAIrZ1hwpKWJTYeySM1LOSP1y7E4E9r66ogEAhzHPpaoEmjhGAZOCidF0TY2SWgE5ppBcoKwg9oixKrdpFPeICCB5+8sAV5czMaCoVIaMVaaM2LPZbsQAqwK+nn2DD3WNYIYh5dFINqPxlYESPGFYLtEPSZ0rHmZeRMw590TTNHeR4ZE+ZRUtDcPDhaB1HK6noLadILYRfZ9w6NDTOHLkmOSsXdfFFGL8Cie79f6D93/nb3qE/EkvOP0rOp6+/fWvv0RVrgJRyiVxloxUEryPYO8VZs776JsWC2P+Ykrl3iJ6hZqdzSSngpico0RMMFXSMt5q48F/tWR2BJAoCo9RuNVJaPTjXsHwBUKuFt0JJGW1ukrHaCWgZmDDaCZU7bm9Y1DTVgflxqMJDgqHGFwVkPr6npWqKDAp1S8EQLAI17YIMW47La8W5jzKgMbHBQi1u3jHINR8gEKEXHTbtJVXhzobw5jGNCDVKg6V1TrBng1MIDAcVQPWFV2qmr4aWLV6goxLc1VFzhkiCeYDmuCNyVm14eSJYz5uoENc8HWwPux9UBg1QQE2b+x9BZxU4ZnRTiaIY2fb2tzS2WzGQ9YpEX3HUv74A0/e980THuD6k3SDe/x0vBiA/vxrX3uuZPnHg+kMUKiCVAu0FAB1Sey9NxejtW3rAPZAv8jL5Rf7ITsGnRdjuMr75iwCU8mlALkwuxrwQjIif1TPRCf0WTaFjUkBTJUtr3DboIVbWWBjtP6m6sBcF9O1UNjqiLdSabtYQxuhBVZyHfnYoDwmxkoGTOBgUBq9TkQBL/CO0QRXqwqujruV90mWDMIE8QwTgfNuZIPUB4CUal1XSGDJ4Fi294dSqo3dSrVQDZYE27Ex2yzR0e58+yfAyi1I1QCtRGfTVU6cQrJYgiKlEJgDE9Gc2N3jnL/XiI6rEZtIhBEcOXMh1FQiZpQ6mYC9R9u2ECLd3JzxoaNHpos+LVV5//Hjj96FZz+p/aQV209TwQEApWEwMXp8KOkMdm5wLugqOEhXkn0exy1mMzPrU+/MxGlKKMC3iPBY8GEXwc4ruVxuoh07VhByXVDXSrEVJ9KenUXc9j3F8IFhfjz7kY0jVHWbKpLBVPdjKoIsAgeCkSCpgkzgvUNgBqHmEmjJABMs19HLjaY8DgZ1BgZByRt5IDQRrScKDpHJaZ1ylQpUShbNJZEVA3tGGdcfjvnZpbw9Sw8jXmV112FatCBnHb1LCrSMNDeiSjOjVaMb+aDjOqJySE8gIo7j5Lb3kTiHEH1wMBA9QYqvidohNTnChSIIneRiRGQ0RnExxh0ne7CO7BxmEyLrF4t2c/NY6mfL2/qhfHE2+84zJ05CP8nAxE9NwY1PLb724ouvotD8QtM0DbPvs2QVMV49/WKMYO9RSsKs77GYLbBY9DATCqGxpgnFE4sUOUmL7CLClWZ2pqrxyJ5KNuZw8MhDIedATNtxsyskTooApqOpKSEPoz8KVeZKHoZqcEpcPRhL7VpNdIg1YQgueLQxAkSahp5yUUTvtoWWqkJWHbhccJF8cOScy965I96HJ4j5YVW5IKV0yXy5aPrFMpUspGTG1YKPV76ZpeQxuJ5HY9O6SB/DbSprZmVntwqY5JX2jbfDJtVqh+NRIeHo2TWJEVXlqCmbWqwgpixV5d7I7ttNEw47R0mHZSginsFGRFa5pCtycXXQYjB8ddOyXMyMKQqhHfr+nmeObP7pwYPfOPSTOj7+tBfcd72uufiaU9bW7LVZ+WWllE5Vl8ROQwwUYyQfa/NOqRJeU0k1XcVHOOcoVhPFAmgWsViKnCw5n5+lnC2qp6sZj0SLxHU+NHLMzo3++Ks93AiJ87iTKjkjD9XTg0DIJSMPCeQY7FyN3zJF8ATvAQ+yED1iiMTswop5EpuIEII6ZhujsBw7OtzE9kveuwI1R47uohCemBB9JaueNxR903K5fHPfLy7pU8qi4mBqaigiopILkoppAZnVsM/a5VB1LlwRRxl3cNtjo3PwjsHksU1vAWpYCQc4z8bsjSpEyWYWa6iOzUz1oBkeAvA0QY6B4JomeBKhlHpIzjUgdoUee4/oIwCG1rwh5aYFSJucxaWSHi8l3XrP1++5Z2SJ8PMBbH9XcD+GMx0AXHvptScXDNcp5CoYJt5xCU0zOOfIV0Z4ZeM/azZYnZnACK7GiYoMWrKWXLJIliaXdJKonq+qZynsDBqNC4wpuTGpCCA1KI2s+eorN3ItZYTh67K8jHu0WpBsNbgqOLLgPQVHPkZnoWmKJ3dQVR3MEGNQ7+PXiLlnMxJV9s71k0n8Q9etPzTv+3BqzsdOtJi44YYb2nLo0DUp9W/JfXpZVjlVREoRObWU3JaSORehXFSkSMKo3AOB1Kr1s6lZ5X9qPbGRq5/d1w7tmEFMZsTGzETs4R0H54IjIlXYXNQOquq3VO07pnKMQM6MnFrx7Nma4AxakEYjXmDMzAbgfZ1QCKRShMHc+eBNzB4fit76onvOuWc/tjWQ9NNSaD/1HQ7PMX69+OKLT+nMvcYY5zCH87zj4kIYPDOIHK+C9DCe+qJnRN+CuRqSShZSLSQiWkyKFi1q1qrqToJeqMCECOcwcTQilVyaLKIAzDF7FRsUqmoYicZCKuOOvH6G6ssIgXdsk9aHLkbzDveGGL7pfbjXO/c4w4id80ThSd8sv6kz79baVo8Ny79PgL/pM5/71ydehJUd4ErcCwC/+Zu/2ZTD35psbslFkspppciVRcppOacXicgpRTA1sXOsJm2QmvaipibKRZRVhUQ1yygzGNcDqwIzZgrEzhNzZnZEjp/wxHM1PFqMDprKMSniRMypqQfURs2e1WvvAY8aep/KdqqoB5vzwZq2YwJ1JZeZMR5kF/7i9K+efmKh/VSMj3/bCu55C283dvvZxUeuNOZXE+EcYiImXhKcElO1GkH1i2+9H0eZMsLhtROaGTFQY+7ICgAhIjWzXY5pzWCcc3lRynI6iJgJ3xHRlxSxOOp2KKcsuZTCLpBnPy68rfp7RNesT7tvTdt4Y4z+XvLtAzd97GNH/7Jf8t0/e92FKHjV8W7t/a961avyvn37nm9XuTLe/a6b8YYbbmjzoUNd61wZ0uKyUuSsUmxdV/GhjEtULEopp2WRi6TIUqScI6pepGZSEcxZzckLIH4SRlvM7jHzdIhBM4JbqKkXNacGX0qxUgpsXFSP24ZqsnpCQur4BWqFhyx69sHHuPAu3MW0vOVTt9125Pkmm5/mm/Vvy+u7Cm8P4B64+IqXOpMLUi4Xw2yNyWXveXDeI3B1K+btBa+OYekVhvb87JhjjsgTR3K8IIf7yGwQoZ2mejkxiXNusx/SuaXIVVXFTnkYykm5yCnOueJDGIWmAgZcE8PB6ST+b3/8uc999LnF8uyWf993KSN2797tzrLyqyXJ/v233dafQA74nt/rXoCwdy+eW4DPff3Gz//8BH0fFsynppwvzKWcZKpXiwirShAzp2otgKdFNRjZMTVbgpxnI4Jz3swYCiuqEDNT1WfNXleBhmPBsWd4Hy2wM/KOnXInWqBk33ZKj8W4fttnb9+2yefvY0f7dwX3k3LGA4ALzzxzl3F8JZk7LzThvBA9HNCTiDoyZTNaZYB5Zjhmco7YBWfE7BvvWnb+o+sc77nxwIFjQNXiTZ5+er10nZpzLi+XZ4LkXBXKPgSXUnlNEpk655S9gyoDSsYM79nuaQJ/6MWfeNXsfuyj/ThB5fK9iuLqq3ccm9KF77/5q7evLCZ+kO95717Q/ffv+a7v/bm+MHv27HFxa2uqujxLB3lxVtpl0BdATIRBOaW2z1kcOR3xewBMK8V60WenhRWFDAqMXtRGzMze+xCa6L2fmcjXs5Rv8VpzzyjdwugF+VMDhvyXXnB4vqfjbuz2Ry546srYhPMj8cWah45VAzuyFcuSPJEnKsyYs3M+MB2P0d/ygVvv/OrqPfd+H11jz+49ayetL3UxDDRpmu2bxncd/8v9+2c/wKGf3vrWF8dPfOLB4cd5HzzfSLpnzx4XDh7coLU10eUyLlN6V5Z8fqWfEkwoFTMhIiUTVTDEjOtenGFmVFXy5AQIYprAdLAJzcPB445P3HLLM8/5zv7WFdp/KQX3vOMmAOy+9NI1VXchkZ3hHbJzjojEnCfPxodTtvtcu3DL7uzFCeYyzx3jnr1Rx/HthHFQv4/rbj/p98bzFeDevXv5rk9/+kq2cjaYUil4MZGdJoqgZs34iyV2LpkZGZDVyBvRM6blIWW+65Rzzz10Qmf9WzU2/l3B/SVd7/t5/QAj3F91be2n/F75rs+/d/du/1A82hyZNy9xwqcWAMZ8iEs5SM45yvno1nLJp1122fLE8XWFsP5t7WZ/V3DP0/X2PPca7AEu3Q/b9903geHvXv/JQ+j+PfUs+D28QZ9/1N6zx+3fv1//S72m/z8RRNnSKT+WcAAAAABJRU5ErkJggg==",
            "x": -0.64,
            "y": -0.29,
            "w": 1.28,
            "h": 0.52,
            "alpha": 0.95
          }
        ],
        "armDecal": "data:image/png;base64,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"
      },
      "shorts": "#c41a1e",
      "trim": "#a3121a",
      "accent": "#e06a1c",
      "shortsStyle": "flame",
      "gloves": "#d9a63a",
      "gloveStrap": "#c41a1e",
      "accent2": "#f0a63c"
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
      "damage": 8,
      "cooldown": 1.0,
      "speed": 0.22,
      "size": 15,
      "knockback": 300,
      "reach": 40,
      "koChance": 0
    },
    "ramp": {
      "fullComboAt": 25,
      "maxCombo": 5,
      "cdStart": 2.6,
      "cdFullCombo": 1.5,
      "cdMin": 0.5,
      "dmgStart": 8,
      "dmgMax": 9,
      "comboKnockback": 40,
      "comboSlack": 16,
      "chase": 420,
      "chain": {
        "size": [
          3,
          4
        ],
        "build": 0.3,
        "finisher": [
          4,
          5
        ],
        "cooldown": [
          1.0,
          0.6
        ],
        "knockback": 560,
        "text": "{n}-PIECE!"
      }
    },
    "hooks": {
      "finisherChance": 80,
      "chance": 0,
      "damageMult": 1.25,
      "coil": 0.1,
      "sweep": 0.2,
      "recover": 0.12,
      "arc": 1.8,
      "follow": 0.5,
      "size": 1.15,
      "width": 1.1,
      "color": "#e0281c"
    },
    "bodyShots": {
      "chance": 15,
      "beforeFinisher": 60,
      "setupMult": 1.3,
      "setupTime": 1.2,
      "guardDrop": 15
    },
    "uppercuts": {
      "chance": 15,
      "close": 32,
      "setupMult": 1.3,
      "setupTime": 1.2,
      "guardDrop": 15
    },
    "tdd": {
      "sprawlChance": 60
    },
    "kickCheck": 40,
    "hasKick": false,
    "hasGrapple": false,
    "hasPowerPunch": false,
    "hasRage": false,
    "hasWatcher": false,
    "hasWeave": false,
    "hasSwing": false,
    "hasForget": false,
    "movement": {
      "after": 0.6,
      "press": {
        "turn": 7,
        "lead": 0.2
      },
      "reset": {
        "combo": 3,
        "time": [
          0.15,
          0.3
        ]
      }
    },
    "blockChance": 10,
    "getUp": {
      "size": 20,
      "wrestling": 85,
      "cut": 0.7,
      "reset": 2,
      "shot": 8
    },
    "hasSpecial": true,
    "special": {
      "move": "aurafarm",
      "chargeTime": 85,
      "hitCut": 4,
      "bullDamage": 70,
      "throwDamage": 70
    },
    "rapier": {
      "enabled": true,
      "weapons": [
        "bat"
      ],
      "parryChance": 92,
      "knockback": 420,
      "recover": 0.6,
      "drawText": "RAPIER",
      "duel": {
        "after": 3,
        "clashes": 6,
        "gap": 80,
        "disarmChance": 50,
        "slashDamage": 40,
        "slashKnockback": 1500,
        "slashText": "RAPIER SLASH!"
      },
      "lunge": {
        "first": [
          1.2,
          2.5
        ],
        "every": [
          3,
          5
        ],
        "warn": 0.5,
        "range": 330,
        "speed": 1500,
        "damage": 24,
        "knockback": 1000,
        "wallSlams": 1,
        "slamDamage": 3
      }
    },
    "tornado": {
      "first": [
        16,
        24
      ],
      "every": [
        28,
        40
      ],
      "max": 2,
      "walkSpeed": 520,
      "spin": 4.5,
      "spinSpeed": 34,
      "radius": 1.8,
      "pull": 520,
      "orbit": 1.1,
      "damage": 10,
      "spitSpeed": 1700,
      "wallSlams": 3,
      "slamDamage": 6,
      "roseEvery": 0.05
    }
  },
  {
    "id": "c-jiri-prochazka",
    "rev": 3,
    "builtin": false,
    "weightClass": "lightheavyweight",
    "name": "Ji\u0159\u00ed Proch\u00e1zka",
    "base": "Brawler",
    "bio": "\"BJP\", \"Denisa\". The Czech samurai. A long, lean Light Heavyweight with his war hair tied up in a topknot and his hands down by his hips. He weaves a lot of what comes at him, but with his hands that low, what does land is often a critical hit. He throws a lot of punches, and hard ones, with elbows and knees up close, wild elbows in the clinch, and the spinning back elbow he knocked Dominick Reyes out with. He reads Miyamoto Musashi's Book of Five Rings: now and then, and always once a fight when he or they get low, he dreams of Musashi, comes back in a samurai's kimono and draws two katanas, and the samurai usually ends it.",
    "color": "#6b8e23",
    "label": "",
    "imgData": null,
    "look": {
      "skin": "#e2b493",
      "build": "lean",
      "bodyHair": "none",
      "hair": "buzz",
      "hairColor": "#2a1d15",
      "beard": "short",
      "beardColor": "#2a1d15",
      "ears": "normal",
      "tattoos": {},
      "shorts": "#151515",
      "trim": "#c8102e",
      "shortsStyle": "stripe",
      "gloves": "#141414",
      "warHair": {
        "tie": "#c8102e",
        "height": 0.42
      }
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
      "damage": 16,
      "cooldown": 0.72,
      "speed": 0.26,
      "size": 15,
      "knockback": 220,
      "reach": 40,
      "koChance": 0
    },
    "hasKick": false,
    "hasGrapple": false,
    "hasPowerPunch": false,
    "hasRage": false,
    "hasWatcher": false,
    "hasWeave": true,
    "weave": {
      "dodgeChance": 52,
      "critChance": 22,
      "comboHits": 5,
      "comboDamage": 5,
      "finalDamage": 12,
      "finalKnockback": 950,
      "tauntDur": 1.3,
      "tauntVuln": 1.25,
      "flowChance": 25,
      "flowDamage": 15
    },
    "hasSwing": false,
    "hasForget": false,
    "blockChance": 0,
    "getUp": {
      "size": 55,
      "wrestling": 30,
      "cut": 0.55,
      "shot": 12,
      "style": "scramble"
    },
    "elbow": {
      "damage": 8,
      "cooldown": 1.6,
      "speed": 0.26,
      "reach": 14,
      "critChance": 35,
      "critMult": 2.5,
      "knockback": 160,
      "cut": {
        "chance": 35,
        "time": 3.5,
        "dps": 2
      }
    },
    "knee": {
      "damage": 11,
      "cooldown": 2.4,
      "speed": 0.3,
      "reach": 12,
      "critChance": 30,
      "critMult": 2,
      "knockback": 220,
      "flying": {
        "first": [
          8,
          12
        ],
        "every": [
          12,
          18
        ],
        "minGap": 70,
        "maxGap": 210,
        "load": 0.4,
        "speed": 950,
        "damage": 22,
        "knockback": 560,
        "koBase": 3,
        "koLow": 12,
        "readChance": 15,
        "open": 0.8
      }
    },
    "clinch": {
      "first": [
        5,
        8
      ],
      "every": [
        7,
        11
      ],
      "range": 16,
      "tie": "overUnder",
      "reach": 0.26,
      "evade": 12,
      "weaverEvade": 10,
      "strikes": [
        2,
        4
      ],
      "gap": 0.3,
      "mix": {
        "elbow": 4,
        "headKnee": 1,
        "bodyKnee": 1
      },
      "knee": {
        "damage": 7,
        "headDamage": 9,
        "critChance": 25,
        "critMult": 2
      },
      "elbow": {
        "damage": 6
      },
      "escape": 15,
      "grapplerEscape": 10,
      "knockback": 380,
      "open": 0.6,
      "parting": {
        "chance": 55,
        "mix": {
          "spinElbow": 3,
          "elbow": 1
        }
      }
    },
    "combos": {
      "first": [
        3,
        5
      ],
      "every": [
        4,
        6.5
      ],
      "list": {
        "jab-cross-hook": 3,
        "cross-hook-knee": 3,
        "jab-spin-elbow": 5,
        "spin-back-elbow": 3,
        "elbow-elbow-knee": 2,
        "punch-clinch": 1
      }
    },
    "prochazka": {
      "handsLow": true,
      "chin": {
        "critChance": 48,
        "critMult": 1.6,
        "sources": [
          "punch",
          "jab",
          "kick",
          "kickback",
          "elbow",
          "knee",
          "combo",
          "swing",
          "teep",
          "flow",
          "bat",
          "poke"
        ]
      },
      "samurai": {
        "lowHp": 0.4,
        "oppLowHp": 0.4,
        "lowBoost": 1.5,
        "max": 2,
        "minGap": 8,
        "dream": 2.0,
        "outfit": 0.7,
        "draw": 0.6,
        "time": 5,
        "speed": 1.3,
        "reach": 34,
        "tell": 0.32,
        "swing": 0.13,
        "recover": 0.12,
        "damage": 24,
        "critChance": 30,
        "critMult": 2,
        "xEvery": 3,
        "xMult": 1.5,
        "arc": 1.25,
        "readChance": 20,
        "cut": {
          "chance": 50,
          "time": 3.5,
          "dps": 2.5
        },
        "ko": {
          "below": 0.5,
          "chance": 60
        },
        "iai": {
          "hold": 0.45,
          "sheathe": 0.45
        },
        "petals": 26,
        "finisher": {
          "damage": 45,
          "tell": 0.6,
          "lock": 0.2,
          "dash": 2400,
          "reach": 46,
          "knockback": 1100,
          "wallSlams": 1,
          "slamDamage": 4
        },
        "keepOutfit": false,
        "look": {
          "sleeves": "#1c2232",
          "samurai": {
            "kimono": "#1c2232",
            "under": "#efe9dc",
            "obi": "#b3202a",
            "hakama": "#3b3f4a",
            "mon": "#efe9dc"
          },
          "hachimaki": {
            "color": "#f6f4ee",
            "sun": "#c8102e"
          }
        },
        "clash": {
          "parry": {
            "blade": 55,
            "katana": 50,
            "saber": 45,
            "bat": 40
          },
          "lockAfter": 2,
          "win": 45,
          "hurt": 30,
          "disarm": 25,
          "winDamage": 24,
          "hurtDamage": 16
        },
        "vsTony": {
          "answerChance": 100
        }
      },
      "lines": {
        "start": [
          "I just want to show the beauty of the art."
        ],
        "samurai": [
          "I am samurai, and you will die for the, for what you say, man."
        ],
        "hurt": [
          "Sometimes I need to catch some punches to release, to release the true Jirka."
        ],
        "comeback": [
          "I will never stop, I will never stop. If I will be die, my body will still work."
        ],
        "win": [
          "It was not the perfect, but it was a storm."
        ],
        "loss": [
          "I'll be back. I'll be back."
        ]
      },
      "talk": {
        "start": [
          1,
          3
        ],
        "hurtChance": 35,
        "hurtGap": 15,
        "comebackBehind": 60,
        "comebackRun": 40,
        "comebackChance": 70,
        "comebackMax": 1,
        "lossDelay": 1.5,
        "wait": 12
      }
    },
    "hasSpecial": true,
    "special": {
      "move": "samurai",
      "chargeTime": 50,
      "hitCut": 2,
      "punchCut": 1
    }
  },
  {
    "id": "c-jon-jones",
    "rev": 9,
    "builtin": false,
    "weightClass": "lightheavyweight",
    "name": "Jon Jones",
    "base": "Kicker",
    "bio": "\"Bones\". Built on the Kicker base, and fights in two modes, swapping every 15 seconds. GOAT mode (tattoo glowing gold): kicks, normal punches and wrestling, a suplex from behind, and 5% of his takedowns go to the back for a rear naked choke while another 5% go into ground and pound. Every defense except the guard pull and the weaves: blocks, kick checks, sprawls and reattacks, grab counters and the guillotine. EVIL mode (tattoo glowing red): switches from kicks to punches, with grappling defense and the BMF's weave, but a critical weave is an eye poke into a brutal combination. A few times a fight, at random, his tattoo flashes gold and red, he poofs into a duck and flies off the top of the screen, a red circle comes up in the middle of the ring, and he crashes down into it with his tattoo blazing red (Duck Drop: 40 damage and a big knockback, only to whoever's in the circle). Special move: GOAT Stampede.",
    "color": "#c9a227",
    "label": "",
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
      "damage": 16,
      "cooldown": 1.2,
      "speed": 0.32,
      "size": 15,
      "knockback": 300,
      "reach": 40,
      "koChance": 0
    },
    "hasKick": true,
    "kick": {
      "damage": 35,
      "cooldown": 3.0,
      "speed": 0.5,
      "size": 17,
      "knockback": 450,
      "reach": 75,
      "checkChance": 35
    },
    "hasGrapple": true,
    "grapple": {
      "damage": 35,
      "cooldown": 1.5,
      "speed": 0.45,
      "reach": 6,
      "counterChance": 20,
      "finSlamDamage": 20,
      "finPunches": 3,
      "finPunchDamage": 10,
      "sprawlChance": 40,
      "reattackChance": 50,
      "vsGrapplerChance": 100,
      "shotChance": 20
    },
    "hasSuplex": true,
    "suplex": {
      "chance": 30,
      "damage": 45,
      "cooldown": 4
    },
    "hasGuillotine": true,
    "guillotine": {
      "chance": 10,
      "tapBase": 10,
      "tapLowHp": 50,
      "cooldown": 6,
      "outcomes": {
        "escape": 26,
        "gnp": 56,
        "resink": 4,
        "slam": 4
      },
      "slamDamage": 60
    },
    "rnc": {
      "tapBase": 20,
      "tapLowHp": 50
    },
    "hasWeave": false,
    "weave": {
      "dodgeChance": 75,
      "critChance": 20,
      "comboHits": 5,
      "comboDamage": 3,
      "finalDamage": 8,
      "finalKnockback": 950,
      "tauntDur": 2,
      "tauntVuln": 2,
      "flowChance": 25,
      "flowDamage": 15,
      "critPoke": true
    },
    "cheater": {
      "poke": {
        "damage": 6,
        "stun": 0.25,
        "combo": [
          6,
          6,
          8,
          8,
          10,
          30
        ],
        "comboGap": 0.15,
        "cooldown": 0.6
      }
    },
    "blockChance": 10,
    "elbow": {
      "damage": 6,
      "cooldown": 1.6,
      "speed": 0.26,
      "reach": 18,
      "critChance": 45,
      "critMult": 2.5,
      "knockback": 170,
      "cut": {
        "chance": 35,
        "time": 4,
        "dps": 2
      }
    },
    "combos": {
      "first": [
        6,
        9
      ],
      "every": [
        9,
        13
      ],
      "list": {
        "jab-spin-elbow": 3,
        "jab-cross-elbow": 1
      }
    },
    "jonClinch": {
      "first": [
        3,
        5
      ],
      "every": [
        5.5,
        8
      ],
      "range": 22,
      "reach": 0.26,
      "evade": 18,
      "weaverEvade": 12,
      "strikes": [
        1,
        2
      ],
      "gap": 0.32,
      "escape": 25,
      "grapplerEscape": 10,
      "knockback": 360,
      "open": 0.7,
      "knee": {
        "damage": 5,
        "critChance": 25,
        "critMult": 2
      },
      "elbow": {
        "critChance": 20,
        "critMult": 2
      },
      "goat": {
        "on": true,
        "knees": 55,
        "trip": 55,
        "spinElbow": true,
        "oblique": false
      },
      "evil": {
        "on": true,
        "knees": 35,
        "trip": 35,
        "spinElbow": true,
        "oblique": true,
        "elbowCooldown": 1.6
      },
      "trip": {
        "tell": 0.34,
        "defend": 28,
        "grapplerDefend": 15,
        "tddMult": 0.5,
        "damage": 12,
        "fall": 0.36,
        "down": 0.5
      },
      "guillotine": {
        "lowHp": 40,
        "bonus": 35,
        "clinch": 40,
        "outcomes": {
          "escape": 60,
          "gnp": 5,
          "resink": 25,
          "slam": 10
        }
      },
      "spinElbow": {
        "first": [
          5,
          9
        ],
        "every": [
          10,
          15
        ],
        "range": 26,
        "afterClinch": 30,
        "breakShove": 80,
        "turn": 0.22,
        "step": 380,
        "speed": 0.24,
        "damage": 8,
        "critChance": 25,
        "critMult": 2,
        "knockback": 380
      },
      "oblique": {
        "first": [
          1.5,
          3
        ],
        "every": [
          5,
          8
        ],
        "range": 46,
        "chamber": 0.2,
        "dur": 0.42,
        "damage": 5,
        "knockback": 200,
        "slow": 0.85,
        "slowTime": 1.5
      }
    },
    "jon": {
      "swapEvery": 15,
      "rncChance": 5,
      "gnpChance": 5,
      "gnp": [
        8,
        8,
        8,
        8,
        8,
        20
      ],
      "goat": {
        "hasPunch": true,
        "hasGrapple": true,
        "hasSuplex": true,
        "hasGuillotine": true,
        "hasWeave": false,
        "blockChance": 10,
        "tdd": null,
        "hasKick": true
      },
      "evil": {
        "hasPunch": true,
        "hasGrapple": false,
        "hasSuplex": false,
        "hasGuillotine": false,
        "hasWeave": true,
        "blockChance": 0,
        "tdd": {
          "sprawlChance": 60
        },
        "hasKick": false
      },
      "evilLook": {
        "skin": "#5c3a28",
        "build": "stocky",
        "core": "solid",
        "bodyHair": "none",
        "hair": "buzz",
        "hairColor": "#141010",
        "beard": "boxed",
        "beardColor": "#171212",
        "ears": "normal",
        "tattoos": {
          "decals": [
            {
              "img": "data:image/png;base64,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tdijVmiv1cSHrwNGb9U1rmPAOo4/l6D1mvLwNRkXa6OUXvIZsufmA7fx29zUwO9MDht9HIla/Y633y6OAtMmQN3OzHfTjusycifG+tFJ6p+GXdNjwDqO42zrtedDP03c6HGRTYP7srHPvlYgVXTvu+7wY9/OSPhi8NXtRzOkzcfq4076+aMv+GsUY8+urOteTxv/T01GdQxYx3EMWLc57m+Tca29Dnvz3U3Z6JVN3Ya5xmYmtgksm9nZQ3BHj787GT0cbZS/FpyOgpJ/AwDwp0rB4xiwjuMYwN7YeSCv+f7xUm49vglkvZb8bYDgTj/rb397KduO6uk/+XW18f/MAtQxYB3HcfzxQesbOX9ur376cV7fmfyOT++bOsn/LNncHcdxHMc3CVzf6Dnn34IT+8+kWOMxYB3HcXx7AewYnI4B6ziO49sPbm/EbPjYDu84juM4juM4juM4juM4juM4juM4juM4juM4juM4juM4juM4juM4juM4juM4juM4juM4juM4juM4juM4juM4juM4juM4juM4juM4juM4juM4juM4juM4juM4juM4juM4juM4juM4juM4joP/Pzu/n4N9J6cFAAAAAElFTkSuQmCC",
              "x": -0.7799999999999999,
              "y": -0.22,
              "w": 0.8,
              "h": 0.36800000000000005,
              "alpha": 1
            }
          ]
        },
        "shorts": "#45484e",
        "trim": "#18191c",
        "shortsStyle": "chevron",
        "gloves": "#151515",
        "beardChin": 0.12
      },
      "duck": {
        "first": [
          12,
          20
        ],
        "every": [
          20,
          32
        ],
        "max": 3,
        "radius": 130,
        "warn": 1.6,
        "damage": 40,
        "knockback": 1700,
        "wallSlams": 2,
        "slamDamage": 5
      }
    },
    "look": {
      "skin": "#5c3a28",
      "build": "stocky",
      "core": "solid",
      "bodyHair": "none",
      "hair": "buzz",
      "hairColor": "#141010",
      "beard": "boxed",
      "beardColor": "#171212",
      "ears": "normal",
      "tattoos": {
        "decals": [
          {
            "img": "data:image/png;base64,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",
            "x": -0.7799999999999999,
            "y": -0.22,
            "w": 0.8,
            "h": 0.36800000000000005,
            "alpha": 1
          }
        ]
      },
      "shorts": "#45484e",
      "trim": "#18191c",
      "shortsStyle": "chevron",
      "gloves": "#151515",
      "beardChin": 0.12
    },
    "hasSpecial": true,
    "special": {
      "move": "goatstampede",
      "chargeTime": 45,
      "hitCut": 4,
      "goats": 8,
      "goatGap": 0.7,
      "goatDamage": 20,
      "ramSpeed": 1900,
      "ramWalls": 3,
      "ramWallDamage": 4
    }
  },
  {
    "id": "c-josh-hokit",
    "rev": 16,
    "builtin": false,
    "weightClass": "heavyweight",
    "name": "Josh Hokit",
    "base": "BMF",
    "bio": "\"The Fresno Freight Train\". Built on the BMF base: he comes forward all fight, walking straight in with combinations of rapid 5-damage punches instead of slipping and celebrating, and he stuffs almost every takedown shot. He has a lot of health (800 to everyone else's 500), but walking forward he eats crits. Now and then, up close, he shoots a double leg that always lands, straight into an armbar, then lets them escape every time. Every few seconds he gives his opponent a thumbs down, and they come storming straight at him. A few times a fight he runs to a corner, climbs the top rope and comes flying off it in a body slam onto a red circle wherever they are: 35 damage and a slam into the cage if they're still inside it when he lands. Now and then he straps on his football helmet, gets down in a three-point stance and charges a red path across the ring, running over whoever is still in it, while the jumbotron plays an ad for the San Francisco 67'ers. When his opponent pulls out a weapon, or once at random, he turns to the Dark Side: a black hooded robe and a red lightsaber, no wrestling moves. His saber clashes with bats, clubs and swords, and if anyone knocks it out of his hand he pulls it straight back with the Force and Force pushes them across the ring. Once in the form he can call in the Death Star, whose green superlaser blasts the middle of the ring. Special move: Chair Shot, then a ladder: he stands one up in the middle of the ring, climbs it and dives off it in a body slam and throws the ladder at them.",
    "color": "#c8202c",
    "label": "",
    "imgData": null,
    "look": {
      "skin": "#c9956d",
      "build": "stocky",
      "bodyHair": "none",
      "hair": "bald",
      "hairColor": "#1d1611",
      "beard": "full",
      "ears": "normal",
      "headwear": "bandana",
      "glasses": "shades",
      "tattoos": {
        "lionCrown": true,
        "rightArm": "sun",
        "armInk": false
      },
      "shorts": "#f3f5f8",
      "trim": "#1f3a7a",
      "accent": "#8fb4e0",
      "shortsStyle": "pinstripe",
      "gloves": "#c8202c"
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
      "cooldown": 0.12,
      "speed": 0.11,
      "size": 11,
      "knockback": 0,
      "reach": 40,
      "koChance": 0
    },
    "hasKick": false,
    "hasGrapple": false,
    "hasPowerPunch": false,
    "hasRage": false,
    "hasWatcher": false,
    "hasWeave": true,
    "weave": {
      "dodgeChance": 12,
      "critChance": 0,
      "comboHits": 5,
      "comboDamage": 3,
      "finalDamage": 8,
      "finalKnockback": 950,
      "tauntDur": 2,
      "tauntVuln": 2,
      "flowChance": 25,
      "flowDamage": 15,
      "tauntDodge": 50
    },
    "hasSwing": false,
    "hasForget": false,
    "hasArmbarShot": true,
    "armbarShot": {
      "chance": 5
    },
    "armbar": {
      "tapBase": 0,
      "tapLowHp": 0
    },
    "hasThumbsDown": true,
    "thumbsDown": {
      "cooldown": 8,
      "anger": 3
    },
    "maxHp": 800,
    "tdd": {
      "sprawlChance": 85
    },
    "pressure": {
      "turn": 12,
      "speed": 1.15,
      "pocket": 18,
      "shotChance": 35,
      "shotWait": 2.5,
      "chin": {
        "critChance": 60,
        "critMult": 1.8,
        "sources": [
          "punch",
          "jab",
          "kick",
          "kickback",
          "elbow",
          "knee",
          "combo",
          "swing",
          "teep",
          "flow",
          "bat",
          "poke"
        ]
      }
    },
    "combos": {
      "first": [
        0.5,
        1
      ],
      "every": [
        0.4,
        0.9
      ],
      "list": {
        "jab-jab-cross": 3,
        "jab-cross-jab-cross": 3,
        "jab-cross-hook": 2,
        "jab-cross-jab-cross-hook": 2
      }
    },
    "hasSpecial": true,
    "helmetCharge": {
      "first": [
        18,
        26
      ],
      "every": [
        22,
        32
      ],
      "max": 2,
      "warn": 1.1,
      "speed": 1250,
      "width": 60,
      "damage": 30,
      "knockback": 1200,
      "wallSlams": 1,
      "slamDamage": 4,
      "helmet": {
        "headwear": "football",
        "helmetLogoText": "67"
      }
    },
    "topRope": {
      "first": [
        12,
        18
      ],
      "every": [
        18,
        28
      ],
      "max": 2,
      "radius": 120,
      "warn": 1.4,
      "damage": 35,
      "knockback": 1300,
      "wallSlams": 1,
      "slamDamage": 4
    },
    "darkSide": {
      "first": [
        20,
        34
      ],
      "duration": 18,
      "linger": 3,
      "cooldown": 8,
      "look": {
        "robe": true,
        "sleeves": "#1d1d22",
        "gloves": "#1b1b1f"
      },
      "saber": {
        "damage": 14,
        "cooldown": 0.55,
        "windup": 0.22,
        "swing": 0.15,
        "follow": 0.2,
        "reach": 70,
        "knockback": 480
      },
      "clash": {
        "chance": 85,
        "knockback": 520,
        "recover": 0.5,
        "lockAfter": 2,
        "win": 40,
        "hurt": 30,
        "disarm": 30,
        "winDamage": 30,
        "winKnockback": 1300,
        "hurtMult": 1.5
      },
      "push": {
        "knockback": 1700
      },
      "deathStar": {
        "first": [
          3,
          7
        ],
        "max": 1,
        "dmg": 100,
        "waveDmg": 40
      }
    },
    "special": {
      "move": "chairshot",
      "chargeTime": 82,
      "hitCut": 3,
      "punchCut": 1,
      "damage": 80,
      "dazeTime": 1.5,
      "celebrateTime": 2,
      "ladder": {
        "slamDamage": 25,
        "throwDamage": 15
      }
    },
    "blockChance": 0
  },
  {
    "id": "c-joshua-van",
    "rev": 3,
    "builtin": false,
    "weightClass": "flyweight",
    "name": "Joshua Van",
    "base": "Brawler",
    "bio": "\"The Fearless\". UFC flyweight champion, born in Myanmar, fights out of Houston. Built on the Brawler base: a flyweight, but not as quick on his feet as the other small guys, with his hands always up in a high guard and long combinations of punches off both hands instead of single shots, and no opening KO Rush. Hot hands: every punch that lands in a combo makes the next one hit harder and crit more often, and the count goes up under him (x5, x7...) until one gets blocked or misses. Most of his combos end in a left hook that comes round from the side and hits harder, and a big left hook can drop them. His hands get better through the fight, most of all with clean combos. Sprawls 70% of takedown shots and is hard to hurt. Special move Hands on Fire: his gloves catch fire, and while they burn he keeps the chain he built at the end of each combo for a moment instead of losing it. Holds the Myanmar flag up when he wins. Flyweight. He mixes body shots and uppercuts into his combos, often a body shot right before the left hook, and one that lands sets up a bigger punch upstairs.",
    "color": "#fecb00",
    "label": "",
    "imgData": null,
    "speedMult": 0.85,
    "look": {
      "skin": "#c08460",
      "build": "lean",
      "bodyHair": "none",
      "hair": "crop",
      "hairColor": "#141110",
      "beard": "stubble",
      "beardAlpha": 0.16,
      "beardColor": "#161210",
      "vanGoatee": true,
      "ears": "normal",
      "tattoos": {
        "blessed": true,
        "rightArm": true,
        "armInk": true,
        "armInkSide": "right"
      },
      "shorts": "#b3132a",
      "trim": "#7a0c1c",
      "accent": "#e8b923",
      "shortsStyle": "acheik",
      "legPatch": false,
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
      "damage": 9,
      "cooldown": 0.8,
      "speed": 0.13,
      "size": 12,
      "knockback": 130,
      "reach": 36,
      "koChance": 0
    },
    "hasKick": false,
    "hasGrapple": false,
    "hasPowerPunch": false,
    "hasRage": false,
    "hasWatcher": false,
    "hasWeave": false,
    "hasSwing": false,
    "hasForget": false,
    "blockChance": 25,
    "hooks": {
      "finisherChance": 80,
      "chance": 0,
      "damageMult": 1.25,
      "coil": 0.1,
      "sweep": 0.2,
      "recover": 0.12,
      "arc": 1.8,
      "follow": 0.5,
      "size": 1.15,
      "width": 1.1,
      "color": "#ffd21f"
    },
    "bodyShots": {
      "chance": 18,
      "beforeFinisher": 50,
      "knockback": 20,
      "dip": 0.05,
      "drive": 0.1,
      "recover": 0.07,
      "setupMult": 1.4,
      "setupTime": 1.0,
      "guardDrop": 10
    },
    "uppercuts": {
      "chance": 12,
      "close": 30,
      "dip": 0.06,
      "drive": 0.12,
      "recover": 0.07,
      "setupMult": 1.4,
      "setupTime": 1.0,
      "guardDrop": 10
    },
    "tdd": {
      "sprawlChance": 70
    },
    "van": {
      "highGuard": true,
      "combos": {
        "punches": [
          5,
          8.5
        ],
        "spread": 1.6,
        "cooldown": [
          0.6,
          0.4
        ],
        "chase": 250,
        "slack": [
          12,
          22
        ],
        "comboKnockback": 25
      },
      "hotHands": {
        "step": [
          0.13,
          0.2
        ],
        "maxMult": 2.5,
        "critBase": 3,
        "critStep": [
          4,
          6
        ],
        "critMax": 50,
        "critMult": 1.8
      },
      "hook": {
        "down": 30,
        "downTime": 1.0,
        "knockback": 90,
        "callGap": 25
      },
      "level": {
        "hitFill": 0.012,
        "cleanFill": 0.035,
        "cleanMin": 3,
        "pierce": [
          0,
          10
        ],
        "marks": [
          0.5,
          1
        ]
      },
      "durable": {
        "over": 10,
        "mult": 0.74,
        "sources": [
          "punch",
          "kick",
          "kickback",
          "swing",
          "power",
          "combo",
          "flow"
        ]
      },
      "winFlag": true,
      "voice": {
        "minGap": 6,
        "start": {
          "at": 1.2,
          "wait": 12,
          "always": true
        },
        "combo": {
          "landed": 5,
          "chance": 50,
          "gap": 15,
          "wait": 1
        },
        "knockdown": {
          "chance": 75,
          "gap": 15,
          "wait": 3.5
        },
        "shot": {
          "chance": 75,
          "gap": 20,
          "wait": 1.5
        },
        "trading": {
          "after": 5,
          "window": 2.5,
          "took": 2,
          "landed": 3,
          "chance": 45,
          "gap": 30,
          "wait": 0.5
        },
        "win": {
          "chance": 50,
          "otherwise": "knockdown",
          "wait": 10,
          "always": true
        }
      },
      "lines": {
        "start": [
          "I know my, my striking will stand out.",
          "Whoever y'all got in front of me, I'll fight."
        ],
        "combo": [
          "What can I say, man? I'm just that good, you know.",
          "Doubt me now!"
        ],
        "knockdown": [
          "Doubt me now!"
        ],
        "shot": [
          "This is MMA fight, you know. This is not a jiu-jitsu match."
        ],
        "trading": [
          "We knew we was in here for a war."
        ],
        "win": [
          "Look at me, Joe, I'm so blessed."
        ]
      }
    },
    "hasSpecial": true,
    "special": {
      "move": "vanfire",
      "chargeTime": 32,
      "hitCut": 1,
      "punchCut": 0.3,
      "range": 240,
      "call": 0.45,
      "time": 8,
      "keep": 2.5,
      "keepMin": 2,
      "maxMult": 3,
      "pierce": 20,
      "chase": 1.3
    }
  },
  {
    "id": "c-justin-gaethje",
    "rev": 15,
    "builtin": false,
    "weightClass": "lightweight",
    "name": "Justin Gaethje",
    "base": "Brawler",
    "bio": "\"The Highlight\". Built on the Brawler base with the Brawler's heavy hands and opening KO Rush. Every few seconds he loads up one CTE-style haymaker; if it lands, the opponent is left dizzy, staggering about unable to fight back. The old wrestler in him shoots a double leg now and then for a slam into the cage, sprawls on takedowns and reattacks. Everything he lands looks like it hurts. A few times a fight a bald eagle screams, a red path cuts across the ring and the eagle swoops through it, raking anyone but him caught in it (Eagle Strike). If it catches him instead, it carries him off the screen and he drops back into the middle of the ring (knocking them back) in his trucker hat with a golf club: he swings it like a bat and stops to drive golf balls at them. An eagle also comes for him when Dustin goes Diamond Guard or Gane pulls his bat. Special move: All American. Up close he comes up with short uppercuts that crit hard, and when someone grabs him, shoots on him, ties him up or tries to pull him into guard, he usually answers with one: land it and the grab is stuffed.",
    "color": "#1c2f6e",
    "label": "",
    "imgData": null,
    "look": {
      "skin": "#e3b394",
      "build": "muscular",
      "bodyHair": "none",
      "hair": "crop",
      "hairColor": "#4e3524",
      "beard": "boxed",
      "beardColor": "#b06c3c",
      "ears": "normal",
      "tattoos": {
        "decals": [
          {
            "img": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAKAAAADcCAYAAAD3L6qXAADxTElEQVR42uz9aZRl5XEtis4Z8a21d2ZWC1TRU1BUQ/UdjZCQCgk1SEISAiUgeiMdfOz3PM7xfe++M+67P5Icd7wx7rjvPPsc6xjb2EJCtCKFeslqbJlUYwkJBFUFSd/3RVNNdnuv9UXE+7H2LkoW6pGOZbOhRlVlVu7MvXas+CJmzDkD+Lf34NatWxMAnH7i6fPed8rb1u//Obz++Nf1Zv1bfWHvWP+OodY8fASIQ1IhD2Uvv/jl8S+/OIxhHcOYvf7Wvx6Ar+ljZGRERkdH/QNb33W0R708Qo4FeHRKsgcu8yXJnpDq45/75jd3AkGA8frb/z//If9WbqTR0dF4+5a3z6/NLq4qe1c2PwzAFDUt1FJyQIaErYvPeu97l0fvvhvBiIyMjMj+Qdy7KV8/ql/PgL/y64h3vuGdB4j4n9Z1t5vKxHarPVim1mcocZgF3hhms5p0PhDfx9zWF8fGxqr9s+fr4fC7f6R/Sy9m/jxguiOhUCU1RBKKokA2A8VJT+6M3QrdyOl65YfPOPNb2WJqdHR0BwCc/+4PrCtKPLkbwBe+8IXd/cB+PUxeD8BfKgu2IrrdVMABJBFSOJvdzw1h9owZEAojAlaFsnDnmSqMc9/zvvvgKB1+TKfCZIv8LoDvjIyMcHR09PUAfL0G/IUNCAFEl0NroKIAAiJwgAafrHN0ANDhABwG0CzCzaYs27Q7VwS4JBwzARlMEW/aunWrvn4s//Yf+vv+AgLBU289Fc9++dmiMzQ9nM0GgpGFwub+CgLO6J2kASAcIAEgGM0xWzPCICLByITMmddqy90P3v/wyMiIjI+Pv54FXz+Cf1b3wRg+Z1ixyC8yw4ER0dVQ8QAA/8lEv3++d3/l8wKhS9ORKSBCQtB+PTxez4A/N/YighMTE6VP1hebx0p3mwmQAD2ETXYjEEIAdBVxEBCIA04HGYgGEWz+DURERdipB4rrJiYm8uvZ7/Ua8GdHIBmYtnMdWGnmk1SyVRRlq9Wa1yqLIqUUkhJEEspWOacsy3mtsjW3LIt5RVGUKUmIJAikuRQCCEmB7t25c2f9eni8HoA/v/wDKIJFQnY0kapFWaT0SFEUX2u1WjvbA+2yKFrebpVSlmm8KIuvtov23xdJvpqK4uEylS1V9SZIARExCgfd87fHx8fz/iD164/Xa8BXDUKCXSCUYJ2K1KbI3Td+/sYfDo+MfLfc/tB/EViSlHDDZ6/76v6IXkSMX/jB8//UgQXhngFARJQiM8I0hdenIa/XgD8HdpHx8fH48BlnHWdmJ3m4gSQhXijmrlu17kg++/ISC1vo5k7KwKb1G4tNx296etu2bRkAnn322aKa7G4JxBApHtDQJG1R3nX9F8a+Ozw8rFdeeWXgtziaGxkZkVNPPZX/nuvM38sMODExQQCwyEdk9zmweFk0lCHdTqc+1IkVubYjI3wGIh3N9ePu7bekLBsuPOfCr0ddDUy9uPftgZAgM8KZlKCoS6t4GADGxn77jJnXccbf8yM4AchuIUnbQmlTItxs92ynPiXcTyRYa0rJGF+uq+5dFjJXa72AZAhj1hDRwDFApkQBqNV2/CXnXDJIdp6oVKcG6gHuxd5qbGxs6tcsVHlFA5T/RMCNbB1JjyyY+LC75+u/dMtN/ZoW/85Gf/+zArBf3P9aGWD16tUBAJb5UCrTqRG4V6V8BmpDCcUJRbYfG7EXQBZhi+Qk6AoXC9hkiCBA+ReYjtTZZ0RiUXi8QyI5C0iVOwMlykcA/M2vQloYGRmRiYkJcmzMsN84LxoMPCYWT0i74ysiYs5F7x+e32nhmtWrV3dHR0fx7ykI+T/pe75mF3j47cPzx/5hbG//Oc898+x3W21bw+JFAErVCGeCoEXSI0gBSKXvF30Sjpnw2BKIhUHuFcGDCp2kcDAJf3DdZ2/80q/Dmrns/ecdZoyyKJ1/Nzb2aK8BIkle+N4Prqams+h83nJx4/Vfu37vv7cs+DsNwP4beNrJp52QipS+/u2vf7/3ZsRvGsynn35662tf+1r3/Pef9dZsPM3DOhFsaUoeAMxsFkAJolZqgBgAEKRGMBgR2S0vjogzIrBAyO1J09eLVMzlEP8/11133fQvExwRwVNPPVWPWXDIyR5+sCPWBGRA4CDlIRf84LrP3XxP/3nOe/95h930xZueeb0L/h0E+6233opbb701JfB80dR+6LGHtgH4TWetBICHHnrILn7feWvqwOlV7h4dkFpUdouKBFEjcHREvInBOYEYFMpOJiJRRVWAoAq42xHHMmKOUJ/UUh5qp/Ytx6w85rlftludmJgoDyrm/q85bKNHHJ4tZt1zFRFddxwEYP2GlevXr9m87qGzzz6785dX/eXef8+QT/odZtogqW896ZSLmIqDC/L21wQIjMBFF1005JPd5Rn1h+q6Zs72ZqF7IN0DYptbrLPwreFRk1wqlOz0ZzT0+654gcGkiqgtCgYKB7rBWImMHxy1/qj7rhi9IvhLUPh72by+4APnfofkSQBTEj8IKCwIUhHhMUNgTzkzk6+44ooA8O+aDPs7CcCRkRHeeuutWnRwEYSrikJfOnTvkd/5TaGIkZERIekXve/sdwF4i3s8aVV+U7gN1IFKA8e7+UYQ6h4z7g6SFUkoiqVBRBH8XDAlNiWhhUeYeUBRQtKyB+998GSC37v88suLXbt2eb8J6vEEfyIo+6XE9V/49HcAfOeys85fkt1WMlD1Pl9Ikgeu/uwNjwPANT1KzuswzG85+42Ojvppp5yyjCxXiHBGRV7GFgB3vDYFtwHmER3PdRke88w8wsPC3SlKEXYjkBqeAhAkwvMet3RoZl4h7g+LiEXECQAWAzFtZqylXqlevOlPLviTHR+76mN7X+219biIP4VTjo2NWS/QHv95N1DvJoxXe55XwQ3j31rA/tYDcATgKBDqxVYIctLUSklvveqqq+peU/IbX9BIHIja3YEDSK4i0A1SIgAGKNRBKKdFxaN5C4NEi8AcQBJJd6IA8BTAPQBKAOFu7TCbu3dqr1wyfMmW3O0eE1F3VJN2Cv/O2NjYyz/r5x8ZGZG9ExOtlwcHI091TgAS0pz0IwCYmZnxhQsXxujoaP0vguvf3YO/gwCUUcDfc8pbLwJ1Y0rFttZBc65fPbY6RvGb1T79Dvq895+9CeD7rarn1e4fMvPIlgEQKaWciuKJVlHcA5VZABoeM9n8GEbMF5XbRAQg2nDsra0+Oud8jrtXqrqnlYobUlkagLKenVlsZm8XyngqiicYfrsU+mTyxCwSQIWUEnPO4SEni/vBbm4hMUgyEJxujmJQqLVRbi3CXqqHdE85y2NcLEuWyCKC5tRuskRKHijKarZ6/MYv3/jivyWo5ncGRIsqwgVKlGNjYzaC145potpuGSpxoiJJUqLQ5CTbqSh3twdaX27pwFdQoFPXdQA4JcE7nj2EkoKcT+HTjGgFmQXy+ez5DaTeKUweEW0JTJtH2y0KiK/Nnl8sWLzLjUUWb2jWEFRdA8kIz1Vt1gFSJwKiFikUAxHBpqExquAjgEynWdtVg4fSMevwkoEOoOzj9Dm7E/UcKWR869atn1+8eHH8LkaF/0YCcATAKCSkUGUJibsBYBSjv/EzX3HFFQQQjvpoCTKAJREUAjlEk6q8pGX6coC3XD129f612A0fvfCjx3R99hKI1IH4mg4u/U6Rnz4I7Kxy4TES8iwcs1QthBARDLUHBp7w7Fcr2SbxsoX/KCWFkIGcUTfZDUIRD0cqW0czsD6I2yTzeRenUwJoRkGkhYeSkKXi/iQoh4fgsYCvZbCiKOG9Vh/uSWL+4sWLi7Gxsc6/lSz4Ww/AUTS1TWb6asFQeWbOj/sn6GuWXSEzZnnAPNb1JqohwiLI5yB67w2fveHxpuzbV3HE3133d49eePaFLwBx6MJDFn77Yx8b7QJ4GsBTl5132fFVrpZERAKZQvyOXMStqknm2Ryv6oo6q52rvnzVzC/o0r/z8PaHD7r+c9ft/AXFxLeHh8+RcjINXf+16/dedOZFB1ptjvkA9gBFKqMarFLOtquX+V4/gn+VUg0Avjr+1ecA/O1+decvuoDsySJ/UZ1IceZO9hVhcRDgsyIqgagi/EhkO+GC4ctu5xjv349gygcffHwNKl8YbnnX87v+l/PO+8jVN9308ecBoEbdNNeKEIF2UH1z7IafJiMMDw/r6tWrY2Jigqt3rubE4onowzQTExMcHR01ADv/5b/duXMnFy9eHP2/j43RxsZgAPYCwLWfv/alX+aavt6E/IrfawQj/E0bj/27zNHRUT//rPOX0Os/mZrpvM/d2gFxVU2MyOaeirLlAwNzL7z+lk9+Z3h4WMfGxuyPh/94zh6b/E/dunOSRZRlKv45icxqqV+H48BAvMuzzwSjTCLPzWLeJ1evXjTzKkSBX4bB8qtkK+73nP+mA++V0+t39/ilut6eTBIXvu99yy484/1/MDw8rD8LExsZGZFibvG8e9wjQomAqUqhSfdSJAJArutJIm+67LLL5o6NjTkATHLmTd1cre/W9ZZc15tyzhs9vDCPizz8nZ59xtwcgFqOfx4bu3Kqx0H0XhAEgOhl1Pij8/9o4aUfuvgPLz7r4rf0u/OfFTQXvuPCoYvPvuCd+2X5/f1pYr/fX+0XXg/A335KDgCoTc7MjmULFy6Un5ERAgCuueaajrbaT4nINko6UFSfLVLxKVG9FSKFB+GBg+dPzi/6X8PgokAsbL4f6wAXkszMMRUeMw1UEi06n7n+c9f/GPgpgiq3bt2aRkdHfXh4+ICpmb1/4ojVdaueaL72p3/c3o1EmSsnhuPMi8686CwAMTo66v+eR3G/8wD8F3f8z8mENoNg0X3+pTftl21+Ilb7b5wiSlGd0SRPaCruKYrWUFG2nkkp7SzLFAD/ad7qebtHto4kADC1ikAWEEKhkBkhhPZEcRAIEpAggXjV4B8fH8/nn3/+wgEvThJBlQLXrlix4uV+VvyZ0KVGx+GTTj/pojMvOuv8s85fcuHwhcf8Nq4zfg9IDr/zAPxl73hRHTAid3OceMl7hg+54oorYr9gIID40+HhgT85/U9aAQyo6jNFKq4ry/L+JPL5otQftcrWP7Ta7e8WSab633NkZEQ8e+Hh6uGwcLg7gb5xBwDtD0toPRIC939TLzznwrUXnnPhmazinCDfO6Tpk1ffcu3t/df3aol9586dHB4enk/zE1V1JhgveeRNAlxOiz++4NwLTt3ve/zGB0nv54h/zwHI/rGz/wfPPe3dK85/x3s2/hwgujEooDwCd6tzPVhJPotk7BcM8eGzPnzczlr+04vtnf+3blUdax67U0pzSHn4kzd/8scFi6fLotyrKf3DY88/dvvw8LCOjo/mR+57aqXnONlqW+ZmlbuLw8OAn+BnU5gRPveiiy46EEAMDw/r6Oio/9H55y9A9g/PTs2c253tvM3dH5mF2MjIiPTYLa+WieKohUctLyr93wGateLP91Z7/weV2bMbiFpdH+zXtq9FvX3x2Revuez9l839n9Bs/qsIQALoo/XRD8QL3vX+lQz+Zzf5wLOXP9sPzv4vAcBhDEsATDl9n5SWef3eOteHX3LJJe1+drjkA+cenWc7fzo5M/2h6enpc7udzgettg9VOR9idX3C+WefP9rN9YdItlj5rePj43nnzp3s1WcCQQmwhQbmJYBSgg4BqEVIIxJ2Dxmy2bj8wx/+8EF9/M3qOW4eu3NlJ7nFqYh46BNjn3hhYmLiVYm1o6OjsXXr1gSxTe5ees4/uv766/d++UtfmqXqN1JKlUrxT8esPubZX3B8/7LHLs4fPn9jHfXlVVF99PLLLy/+NWfC9BoFse9fbI+Njdm57/zAke71eiT/4djY2AsA8FRnz8OHFXNvaKeB+/cjI/j+TcXNuNkJxqWFFKijjpBDQDnG9/jxo6Oj3wWAbuJQNZvfXHWrAzwik0IRo4gc3CVNRAYlpR2tVvs77XY6AcDX+m/QEw8/lyTLHoo8I5EOF7KbUnqUiYMqhQAQdxjcLYBumA0lpP9wyfAlnzh69dE7R0dH95x/1vn/rKWeRcrTRdHOANjXqbxKUHB0dDRfdPZF9zLF21RkAACHzzlHrh0b+z6A779Wb2ZfLVhIcWDtdQTi6R6F7F8tcJ1eg0y3f83DsbExO+s971lSTXf+AMI5yWXLee94/0RZ2vc/9ZWvPA3gu/1AHR0dtfPe8cG3mXXeIVJIMdT+7h8e/Idf+8je8w6Yna7ebR6HBqIGOIsC+7rQSFGTyIGo6mw5vG54ViQinKRMttrtNYgQ1aHi0vM+Yp+86ePfHB8fx3nnXZyV6CTVuyhYJpR/LLS8TzSeM21/YUCqA+scFwRlyCufBMUC8nJrYWtv/w2WJFOpSP8oEJuO6e/1utl95cF+LJ99b7qGTkHwHcyRH+x3OhCvoRpuX6fexve0o2/UOt95/diYvVaso9/GQ3/TY/a040/e9OgzTz3fD6o1Bx5+dK780ipXUptPWW3JPQ4k0/Gbjl3z4vZH7ts5vHp1OTY+ni9+z1lvmZmZ/uPpmZkzK6tPcLeDbLabOt38x52q+966rjeYO1SkXWrxT9vvu/sJAFh33LpD6ioP59oGzD3cjO7B8GA0fCsBpILIYRHRhmi5Ye2GAzeu27SSwRXusSA8XqLIgSJyV0pSashN13364zvv3H7ny1vWbn7Q4Q7yWA3OCcXOT177iduGh4c5Pj4e2+/Z/vz6NevXlalMmflbExMTPxFE+1P3+3++6967Xt5+7/ZtfWH8b/Oxbdu2vG71upNcuGjHxI47x8fH/9U2IfobBB+2LN0yX0tecNyyFYdf+AeXTFx55ZV+7LHH/tHs7Ew7m1eeI9W5iqrqLnWzealVHL5h5YaXPv398WcvfPcH39GZ7fzx1PTUydOzs1VV1d0IHGo5b+3W9ZKqruZ2c+64RaIIW63Wns0rj9++Yv2Kuozy/DpXx1n2+e5m7kEKIaKQIkE1QUi6Rw1gUQRWUWRe8zGfn7PNBP39ERCGfE8SFwy2B25funLp1PDwsP63v/xve7bfs/3+TWs3Vg7fq+TD2ye2P3HrrbeiNw3BhjWbTialnVF/pxeA2DqyNb150dYLN6/aNPTmt7955w9/+EPfvwHoOTr8xvDKz9KmjIyMyMDA+vKNm44727MfQeiiDVvWP759+/aX/7U2Iuk3yX46FOtrs3kDOdbf+b07xz9w2ntXdDszc6oqd9ygWrByw1y4v7PDWnWm++32kMx++PQPrq/r+tjZbmdlNqd7ABHsVh03D4IIR3QBCDTCzNyyzR0aaMVjO4/mEYsfSkKFqjZAiTQ9DFWgSjCavsbD2a3qDEpB4Ynu+YgICCJa5nYoya4kboLL09Odes7Y2Jj1phh9pvK393/RffbN8PCwBpgigvPmz5sPYNfF5128mvfG6XX4wpqxce/ze48BcH2/Jv6D8/9g6SPbHtkD4KVfQQnYh3/6wvbo1cyvdmRzdHTUL7nkPw3ErKynagvEtGZdCeChf612w79uAPrw6uFyZ/uZN1VVNVvDvbTuHzoi5TqqQIgoTShzwHiPIWqz3KmsejM6zIXosjrXa7L5Agdr1UQIQEl09qTbEOmVR5miiwyx9tDVh84euhr+yL3iPYvTn5hTKQLhPdp9OAwAI+hu2XKWgCwFgDB4uHUgUhBxKimfKtXPuPDCSw+54oorvj06OrrvmNxfCzI6OmqXX3550d3Tvbi2mEeiVU/HKQC+KFlOqSIfnOu8l2QXKS2/5NxLjr7m09c8BoBHLT/qiSceemJFRLz8apOSnwbi+7zBn4RmLhi+bOX1Y1ff/2pf0qv1dl9wwQV/DUsbnK3brrnxqhd7Af+vctrya6fl4eHhctezL/xv9WzNolVESgkORO5UNKtZSOqIcJkHzqpre5kITamQpAxS3N0H3KxDsJewGn8+qPQCsLnJCXjZKgcGBoe2lYODf1Z5+7YWO388MzN9Zmemc8Rsd7bKtTUAoTQ2a5CmIWEAKoqiLFGogqIhJMwNYcZAhCZJZSofKpJ+k6lYJORtJCs42l6W/3T99Vc923/Nl5576ZEg3mbmq91iLwRzKXIXwm5n6EerupqOCCGYJcmCVir+4ZM3f/LrIyMj8tjEY4td8SeAfu7am66+Hf9CT9LPbCMjI+xrSi4858K1Euk0Lfglgtbt5pUBvEvL9JlOnvzhzTff7CRften5fXn8WgEYEbziiiv4g/HvvduqfIo7ZiUJ+z4rcEAEIZAE8p3hcayZTbt7sPc9iXARFU0FVAiq9gRDaA5BD3oz+/CyKAbLsvWD9mDr62Q56JGHOjOdd8/Mzi6Z7nS6XtcEBBRtvrkqVAVJElKRUKQUFIGwSapuTvMMR0CASCkNakoTKvotoVATEz3KEFYavIOJdwdkswY25AAsWzcYoqrBYIKgCIsZCxPPGRCxskjzlPzsNTdf84MRjMjDFz58EGv9Q4TulgG7dmZmZqa/p6Sfaa+66qp9GpFLPnzJcXWOS7w2imqIANncEZ6LVNi1Y9f8H692DPe76uHhYemRL/5VB+Wv24TI6OiorzlmubjK8WHRbY6MBhYUVahQJGktoo9SRCnF/IZxYm4IkkLRhKQCTQlaFEipDFFpi0oD7DHIBp8WEB2IPguPORHsuNmaOud5VmdzRzPBpQIqENKTpmgVbRSpEE2pVNVEMlGQQObwANEvFr1GYBEk1gIId99lkXczYB44KgIrPWJpeHQ8aFQIIxrWAeFw1BEhgQAhEAIiKTElOfPs90+Mjo/mTccdf3oQx0RE6TVOSGydsHnNxtm1azYtXr9m0yF15RduXr3lgA0btgxuXLXu6Kq2y+qqfp+FrxTIXUB04XQIQUEcv3HLk3ftuGs3AFx23mWbVm9YPbNjx47u1q0j6fHHx2NiYuL3guDwawXg4sWLZXh4mE898+wKeKzM2auwTEBQFIqiSIAqIqgUQVGU95LcGxErzN0BMolAUkIIQRIiGqLSZsEvC2Qv4EebReVuEkET6iERMVdE7g9BeGBJznaAuVmIsEgJRUrQlKIoyoFWWbTKVGoqir1J09dE+ICo3E1iN8FlJIGAAQS1cTSPoCJ8RUQcFOGE+1uy5WPc/XB43Eulgi4MgSOaZidAJGn+EIRQQlQLSXwpCvnHiLzn3QPv5t55k6dZRCtg5pkK8RLCjQDXA1jvbnRwCRkbzOOIus4b62zLAggVzgbxPJUpIlxE5iNJtW3HXfcC4Pq1Wz6kKE5446o37PjMV/9r5/fpCP5VA5D9ru7UU0/lzmd2XuQWUVsNz825W7ZKFKlEoDlSVYSiUqgmB7DR3ZwgGltcaZYoWKCBUYQU3evhC8zigGzZzJwewYioROQwkPNJfUQgLzt8tVuASpRlibLdklbZ1rIotxepuF8KDaG0IfyWFJgm0iTJZ0i8DGJIRRZSqCSJoPciqgNwLjyW5vB5kX2eOQ4N+nxQHhGheAQbd61gSDCi53YOgEqIioI6ee0Nf/f3P/zhD2388XFfv3bjYe480i1nd2cEERFdBqqAd92dJCpAKSA8zDziKAFUNI1TJOiIiDBSXFnISW88/oGlS5fWN9x83Q82rNpcVVKfuWHtpvlbNmzKd+64c8/vw4qJX6sG/OC7Pnioi7/R4Zvq2brqdDrMOSOVCYPtQbTbbbg7clVBRFAUBUnNdbe7obL6lDCvRAQeHjkbwgypKNBqtTyVaaF51NnyZFXVGu4IBEhB0oR2e4BFq/wkycG6qs6drSqne6SyVZZl+Y9Fq3xaRaciUNe5knCcAeD7krhHiMIdYHDWw4twPzrC14bHEMIP8IguAk04AvAwWDYAdE1pXiqK76uk7wAYiIgOAToEwiAEpVBERBqvaWorGP8sniaIfIIFTsxW7TULCbeukAFhSVL6A/mUykJEH3H3iMitqtvdkgPrk+g3ApwE7AQ3HJsSv1C0W3OS4K8+ccMnHunXfhedd9l/jPCVCLwUxdy/uP76j03uP+b8fcYBCSDe/va3z1fT0zo5ry+UZQg7EKEkgUCgqkwpRUqCcET2BBGhqoZIUqH8SHMBCzuBgdrcklmnaTYAUnVQRL5BiQPcZYOqTFvTrwARiAgGogLYdA8kCIIUUISi6eWkxS4RzrEwRcWD3O1wEqeHpZuDsCSkCwZo6knTIwa7H+7z3e0MuB+EQAaaLSN0UkTg5oKImYg4zsPvJmRhhK0NYDbCkxOzCP4YlGnAi/BImjyH881OPzEixOqYdrgiggi8xcJLBG5LkioDQwsdAOPbn7zpb/8eAC455yNvSi0cRbNbQAzBQnLtLUesDJPlyePB2lKgIcfq+Pi4mfn3BFhCaGu+eIGfT+///QvAuuPvM8bxKclLgMwqtNlwAAGpBCRDREUSXDyVIlBnlqRUahNgRdoG9wfcfbaq83uLwpeQ6BRFoYXqeNFq3Q5HGdEpCC4zyXXORndvfog+d88F8EBE0ymIR7jlI9zT8xFk9ugCsTgQQxFoA7FGGNuDqRTSJQnIKMKjBDAL+E0BXQH4WxHSQgQgzDQ6KXTA4TEnYGcQvicQazzQYbiQdBIrAWz3iPsJ2WXOFOQM3FYB8nyQu2BRAX5yMN7gHtMMrK0jf74o0iNCzq+oTwDg5Zdfnnbt2vWDUoaOT8HF5phxxIHOWGfZXgSwJTyebSXvAojFixfLyMiIP7jjyb0swxn24p7Y08G/JULqsmXLWlWnGux268mcK1iY9HkIJIWIWQpWhUVhEVQpJstU7tGyaLkD7o3UX1VbFJ0kuJiIwyRpVZQtKcoiUqucUHAuGtDwdlGqUCFJIGQPcBZAggSY3VF1K3SrLnNVVTnbm6tutTK7TwORGDEtYCblJYVPiyQKABGBFgwRcQUNwAAC8wTxEMHdpDxF4rNCeYHCAipBBOHehccCjzjGPXbBvevuM9msaxZFDjvFIt6Xw87MOX8gV/UH65xPz7l+n+X6Aw4/xxlrHJgkkan6FRG+AGBOwJ8sitZzIyMjvOqqq+rVq1eHRCQL8V4GIBAaEYiwZGHh5gdefvnlxdjYWDU6Ouo3fPbqx0vIX1iqP3HddddN93fo7Q9u97BG+X1qQgSAH3bQkjUW9VsjMCOJoqJNUDiQc7Yq13M9eKpITJZla28SuXXFuuVju17YvcbMWlVdHQPBLqF03bNUdXVKnfOiiKiLohjQlB4WyiNgVB7hnvPxHlgcEY5wWtM8MxWFt1N5Byja7cyun5mZCcuNDUehCarahvAxgAxwFwUvJNF/puhLqloKaRQROgtnFDnnvZbr1eb2Pvc4VIi5JO6lYMI9Vnj4QjezHsrUTBQCHhESEQw3hgd7jr/diBiMwAGebV6dqwU55665D4A8AOQCIgqCSpHHVPU2FWWALsQBnvOj/+PK//788PBIuXf3E5dYHYeY1d1o5nbtcF/rbkGhaSruCJVN1sVBG9ZvPGDLqk0zd03cNXPn3XdO79ixo9snQoyMjMjixYtlzZo1cs7EOf4vyRK/DwEYW7duTTPTnXNytgKC3rBfEQjUVc2qznW2epF7nCgpHSmQPUW7xb0vTikYR3a63RPqnN8VHiLklGd7c7eujquzTaekrVQUD6jK3wdiIGc72N3We8QJ4TEbEWLucHMQYBIN1fQCwg+out2ju93KIwJJE4qi8FTIYQTvS6pTAS8S8WJTFgSVUgjwjGm6AY4Xxf1ACA+w7PPcbRGCh4NCBJZ5cIUDC9wM0dSoEDQqkob31bhxeDgQ+9IMmw+5eTarw80AesCFMCgNFBPIAES/S+XLFGmh0QPUqrJyw9pN8wrZs9Gzram63bcZYjOpD0nIbroPOng4VUxEH43wF83y8V7bG0P1yM0nbNixbdu2ziXnXX76urUbztu0ekv136/88ycnJiZiYmIiLr/g8kPXrNnwtuPXbJb1x6+f6jFz+FpPyV5zGOaggw5qe8ap7i4qRVCacZllQ50zzeucc5wAcIGKUjQtEqRHwVidqzy3W1XvrOu6ZsRhIDd4xEJ3n1WVwSIVURTll3ojsve4+5sQsUiokyRb4Y1uI7xnawWXcFtj5kvdMlRZtstSBtqtsixTl+Q/MPCChIcSIEQ9O8PqwrKZCBen8Ns/9emr79l0/IY7S9eXIemfyqJ4GkDt7geaByN8AAE255ZAJEEozUJN9j3eAPOAR8DR1KMeYATpzSSQbLw6KKKkSMOcoASFg2R6qplVQwORomn3l3hgsdU+HYjNAIeS6t0gZoNYTGIpRQzAUXAeVrudnM2OjohjwhSbNhx/QMBOcY9Ecvmm9ccfsHHd8Ss3rttyXPb8XjiOgfKNqH3Htnu27f6XUM3w8LCedtpp5Q9/+MP8uwjAXxDlIwKM+pa1J77XAm/2iGkRSr/rbZgjrC3sQAHP0iKxVZbeKltRFqWpSgSCni25BVUZKaUgRUi0k8iTono3Ve6xun5XrusNZra3SNrWxJsQsriq6rdmy9kt0yNgbrDaLKlKq93uDrRbd2hKnxGVZO6FGI7JXitTYpKkBLt1VZ1Y5XwCyV2tVvtLkuSvbuiZRPYfNw/frF+Vr560d6ZzfbczAwRMpFCKNBoVFYg1/Jxmv2HUZsFsjhx1M4XszaFFUsOlAPr+cM3dLk0tSyqETAh0paFPhIAtUO5WwXcBKZv6WpQRDDI3NZxFWLzNEMd5oBPwlpvNBhAUDCTRp1TTY0o+GcBLqlJQONCUDw44p5WkFPrVT17/t7dHxD5TzT6+e+nZl77RIt7v1G8uW3vkP11xxRXxG3h4/+ZNyNatWxOFc0UFRQ88hgM5O3J2WPYgZB01tZVqJBnuki2XtVnL3EsIqYUEVYNkKSrdVKYvpqL4ckrpYQkmAi1GmJBtAI8IuCtgz0dYB2EiJArVEHcPNyX8gFaR7jhowSH/95u+OPa5Gz736bH5By8cE2k65ahrMqyj8D1CTBCYFaKgxnzGoA0PD+sll1yyoP86zxk7x8jSVOQeajFXtZgDofbSG8IApVCZJgtJLydoIaqhqhApesmyuaddBEgClgnsT4VEYAByryswj9rdU/YoLaLlAcBjPcADIugiCQWYJaU6NdgiRBMipW+I6n0UaTs4HU1WFY/o1jkf0q2rrbXl9zlijpm5B2YcMRWBSQDCQuOT1//tj9BYJv9UYGXBkAcWIuwdt912W/HbDL5fBMMIMOpTU286gsGNJKcDsS9gqSQ9Msn5pKwU4SwEQvZPGQkRQiWFkEnIAkSQMpXILyfqCyAKguGRHYH7pUiHw0yJOLyu8rs87NjwXLt7qDCEou12q90qy5e1SF9K7YH/7a9u+KtdW7duTYsXL5ZDDz00P/b0S98z4ftAmZWQez71hU+PXXTG8FFold9koNJUDMwtZqanuu1L6sn6oAs+cMH3i7IoBg4auHNmd/eYpPJgu91yOCqzOK5r3fm5yqaaQlutsi3FuCAeqmnvKCI2R2AmkQgS1t8C0vs7IEAzvtgHyAmAHIDA2QM2QRIu4UIp3GMzGd8AOchUuKJZLAtxiImoRmEm36BkJEmrPDyHe0RE5RYZiDqHDxahbQpnmsQrzoiCRMvDb7/88suLv/mbv8kkMDx8zk8kIS/kATpuIXxq7ty5zcLGUeC1slT5lQvNN2x800ey29GOxn2sCU0BIwhBpugSeJxOERPpjcSKFooyoUxFiIgKZQ+IXQw8Q5W7FQw0K7IOiToX5nYwhULwRXd7Y7ZqYa5quuUqAIrQk8hAUbTuLxO/iSLduWLjum/0eHv7Qw0cHh5uFx07X8CVx25e+//en9vXf/zR+X+0cPf07v91ttN5W0Qs1lRoSmlcUnqGKruVJEQ73ZnqQ5PTU0s7s7MdFcHcwbmtwXbrMyr6jJnXHnhjpp+Y3XP2TIuA960dtN+rRJ9C1Lt00oDn/b8HICQSxRN1gCL3JJFvQmQwUXz/M6pxajM2qJabeZwa7vMjUET4ER5WhUfVzAbk5iTcI6lUAVQSdwX1lmuvverJX2cy8tuifOkv4Pzp1J6ZrYYYiAhv5pXNhe0tFu+E460evhDhOTwovQyoos3FJlWAKUTsomIXEQcCUVnObzDLJ1d1tamu68Pd7UhELPewsup2vepWlnOmCDwlbScpHinL1q1l2br++i985ofjt44HRn+KGcyJiYn6uA1r79Fadu7a+dwJG5etndz24MTkyNaRtHhocTrlqFNkcH5uTefOxm5db8x1PqCq6w4CawI4VChPSdJMANnyurqq59SWM0GWSUWkEECeAeINYJQgD4SQwd4MrxdYQfSmN3jF8IY/edszAoKGjEEySCmEfEHIR0AWQoY0jdQ+0gZEm6YGFAofUtV7SHkCgp2CmKLwSCAyhA+QWpHhpM4pVL91zbVX7RgeHta+tuXS8y9ft2HV5rdtXrf5uA3rNw9s2/HjZ/uwzfCiYR1/fNwvPvsP3r1xxYY5//1v/vuzv7MjuF+QvvjU7jcJuViVU3Bov7COCHoge8RBkW3Q3XKzdLx3+0eADoQ5i6TZhQcJ9XAYuj2yckXEkFmuqqqatpwpJLxIgAfrqouq0yGEKFNiksKKIj2YJB5tPzn/iZGRkTTKUXuVuzEAoMez+/GF7zv7Axm+6YL3n7dj9Iujn9n3+pYOVy0thgbK9vdqyRtrz0s8fJZmC2pWF9SW7wQAy3aYKLvtVrughzlY57peGeLHQjCpKoZgi4wu2RSB+2SCHvtqwp+qtONnOneA4f6TSlfp/w+HQJrmBC4AyVZEUMRrcd5jgrsjmxFxAhznOfNXIcWENuSOV7fqYKzP7nMb2hvu6F0/GxkZEYwDAVWkuPCyMy8bsLB7r/nCNXtey/ly+vnEUxhIlRBEYpP4m7EGXVAxeEgQhwDcG+7qCLhkZBNIrtBYL4NUycGo6RAGEERB99k6m5hn8ZzhjaQScEPV6cCyQQt1UZmjot8oVB8vJf3zVXdcVf8y7vrDw8MDMW1Vt64WFcmOv/B9w/M1pQ5DWu6Y9cSrEoo6DRYbtJvfmuv8xux+RO5a9ogt4QERdlMqW2Upu2EYNDOp67p2NdFUzCMcLuwGo+lAPBAeeOW/HmXQmwhqJtf7K/F72a/5JBARTrYZFuoSrg1AKL5fuyj9N65hoEMRZIS7HSgmFOQfmsVjnv0tFjiJZk+5SofBOT229T77kE/ecNWOS877yFs9KMnZCOh7kd+XASyVw7/xWDx2TGb+iJF/B+AHr6XM89WOYE5MTMSWLWcMljK7VYB5jUSxZ1zVu7MpDE26MVEXNGA+KL2jV5NAe2RTofZMudmgEdyXAZoGy9E0LRGAGdwMOWcgIsqUilar/fxAq32XpvTg0Zt3jp966qW/EMmPCI6NjblmP8Bqe2fttiGI53O2zTXq+ULtXPfZG76x474de3dM7HjwxM0nPOruS632lbVl73Yrq7rdTEjZHmg9MzQ4+HlV2WN1Xl53K0MAqhqhEk7Q4A0O6AGPhkXTB6jRXJjendgLwOhb+RJk6n2cBJBJLgrEgAQfckTRw78jomlsIryRG6AZvggZgWgJcEcotylxSAQmA/5SBN4YEYdDOKGUI/ZOxZ033HD1bHP6B0dHr+C6tV9ZKMAxYBxz4PwF9z/9/NN71qxZI31C6/jEuG+b2HbbujWbXkTkx3bct2PqtZR56s8iHqxYcWiLxg8G2QWEwh7y7wBhBtGDk8opZdIcbHYiCBueXxKFJkVKCaLaW88Rzc1L9vVEIBT9kR6FIOAIFwBMmqLdag2UZflo2SofYeIdf/E3X31s8eLF0pdB/rwO/sorr/SNK9fNKOUgizzfzd9c53y01Xk5ianjV5/0vZPmJFt6yimpaBeT3sFRDtuSLUtV18yWQ1Xb7YH2ve258qeCwizbmyxbm4SJqlClx0ntkSICcHfUYbDeMUsCbGrhfZ1En0yt7IHbvZORzfzQSB4V9FYADwYkA64RAJqddhIOOpzWdNdBRBuhP77uU3/97fXrjz+AgaPDY06EH4vAHAAzKsULRD1v244f3zMyMiJvfetbI+IKnj38/oc2rd0YEKrk+PH1Y9dP7adz3vfYfu9dT+64b8fUa10Dys/qjDnDkxpYqMFUG54bQA1xoNbw9QgXM/PINcJ7V7aRWAIecHd4ruF1htUZVVXD6gpmuZlsRENnEZEoqFEWxUC73c5D7YHOwEC7Llvl7qR8MNxbYSgBYPXOnY2p48/BMPsCn2u/PPbEQKHXDrTaf62ij4V7mau6nWt7b2i96ao77qjHxsaqa665pkPhCyLycJHSvELFejdGMFCYyUqETKeUtrXKgmVZtkXTqwIKgWZqExYwd3h4c236dWE01yUsAHhz43H/TjcY7rNu3AiL90W2t+WMtrmVZhYWPhNhsxGYjbBsVnvt3oXEu26++WbtdtM/hUbuHTMRQBWBoexZwzB/eHhY16xZ059rNx6Ln776Hz9148f/hw/65MUXfPRDl19++SBescTbn8DA13pUx59FPtj6hq0fJbmU4GwwpCn9HLWZWLYpIE5zYAPcZ81cwgMQoKAiFQXKIkGL1OP3BsIAQfThiUgiob13kRFQEaRCnk6U7QLsCiAxwpF0r4Jzk6evfuJrY+M/Q4Tzc2lkAHDee4ZP73am//dOVS1T0b2Dc+d+cWBw6CaldTsmR8KqjbXFEvN8UlXnRVVdV5K0NdAeeGRoYM4/KTWb5ZblGHS39RFxbCCYgfBwRDhqc9SWUVuGW9ORSJKmLNHUNCie4e5QJrRaBZImMHpHa3Ng9++sINjqnc5TIAqoPIqIR6ksmn8gz/de53MpcY6yuI/Mc3P2ZbnKL7vbezywWUTGE+S7ZaELPZVXX3/9X9+/P7wyMTrB1SOr45FHXlwoVv8f4fHgHCv+9sqxK6d+0XX9rTUhrVTQ4U3dYQGII4JU0UoSD8uWl4VbZeYSOfcwLkVTBwqoGioCQa/wsea4QABJpFRNSSgvCVEoOVUk3S4FxgZr3lW3yuTmbmEpAe9ixEE5rB0ALzzjzHfQeLi4vfSpr3/xi7/gYsTI1pE0Oj5qC1nc9oJQiPCc64HOTOcDBBdo0jq7d8x9i5CPpKR/DfJigscEMRseS7tVZ3vZaj2jmnYWEsw5PVnnal2O/C4Eug3oEv/ijo4+BQr7CLVNfQqLAGEwT0hs2hUP7x09+xINA9GNhuxfNunRV4BcDWsIsw7f1fvGU57xQFF4QWLGPV4mUYjo7Qy/n+SzEBRGdNT9vZde+NHDS5Pth644dHcfSx2eGJaFCxfurafis05544zU//HS8z76Y5rtKBYWu3uKvX0G8+eff/7C5Tcs3/ObAtQ/lQFHMCKjGPV3veVdJwv9vQ50zUIcDosgsncsuCTcPlhbPeu10aORpakKyqJAWZZRlGVRpATp0Yt7vi3NSF7kwaRpT1mkxxL1tkx/QkXraz9/46s6RV34nrNPqov0fLv2Tm31f6k6nVUquDuVA/+/67/+uWe3bt2aTj31VN/v+N33+i7fsiVddccd9R+cPrxoKk9/dmqmu6y2PJNSUbQGWiGpcHMDKYNJ01MUvd/pK93iYEPUQh1Kqk+2W+3rrx/75J+dcfnlgwfs9v/S6XY35mzHO3LlIMMDGQHLGV3LCMtNs5YUhSj6R3aYIYchUVCkFgqVffdQUyv3ZsX9tqR/tPclq0D0g9kRKRp4Wnuc8GdJPqREKxh3KzkTQRdISZIi4sEolQySicAjIvrDT1z3N9t6qAdJxKXn/tGRjup/ybneC0AlpYe0bTc99thjeXx8PF985sUnGmxYIP9nz9H/186IP5UBRzHqPRzw++877T2Lzf3NDtstIQpHREIhzuObrUSAU2DuoAiSKsqyjFZZplZZvlQU6Z8EknvT1MGIOFGIH2nSF5X6tbLI9+vCeZP762H3N67s7xi57qu33AYA57/nrCUwq62qVtfwo4ZEun/43uEr/+YrY0//i86sf0HiqjvuqP90eHjg+Rk/07rRAmFkCOBmZoho7AccMQ1gMWFHgtoFkbUZ8j8qlB+KcM7w8LAOvcjDjZHNbHmua4+eCHpf7UJBIpH3IXd92KWBXJyNgwPQg7V6cAykJ8PnK/mvf3js6wii6V4bCUPAw61h4ZhJ8zyLRHhYiLZEZa5HfF1VhwCxgEf23JsEiomgA+Ex6jjykvM+8nYkeQy86rMAWadWVstP5MpWZc9vKEv/lrDYMz4+/rmRrSPpMX3sDeLiRlsP4J9+E9uPV52ETEw0Xtur1q9+jpWtEmo7Ai49HayKbiY5hIgcEaRIw/QQgaqiSEmKlCaTpu1J0l4VMRXuFfJeVZ1JlGpg8bzP/N21107fcccdvj86P45Xfu0Lyq0jafzx8Thp7XFzrPLju93uMXVdLwjHsRCWm1euKTcsXb1+84rVx9z10L0P9b/u0vd+ePmGlavfMtnNb6i7nf+Qsx3h4RVFhCJUFVK0x+4D3cMNXkVTkCWlvlSU6bOpSJUof3Tjp294YMP6ze+t6uoNVbc6prYaObz58gZqaZ4HPfmAvMKAEdFGGN/XTjdN7T5scF/HvA+ukX1/3gccokf7asIPEc5Ao8prThh3d69JdIWyUKhPqWISkEIQbIQLMRuIOeEsG0N2RpCDEjjm8xv/fu627bdP7Njxg6nVqzctqnN1UV3VhzBwsIIvbFp3/ILd7ZdPBbGM4EwMxC07duzo/iawjP6sScjExIRvXr58Tu2yMTwKUUYERLTwJHwagSPdve1ubmEMa2CYPmtYKAsBHIPwRwOYdbcWIgqEhYjMs5lqcNt9d98/MjIiV155pf88bG/88XEfHh7Wa2+5Ze8tS5Yd6ubDlvNMRAy4xxI3O8YZSwActHH56oVbVq94csMxay8077656nSP71Sdd+balnhEhyKq2oN/JEGFQZFEUj3cGvMBhKq0U1HcllrFgzlaV9/46U9s//CHLz8o3Dd0O91NVdVdUue6ggehAlEJFUmNVrNBR9gHonsBqOzls2hilX3ZfT/zsT+Wa4CZ/tjzJ4pa9jMisf/zo1fmNHgrg40RJqjygAciGF2EDYVhKQiLwFZEPNz7eiPoQbS377jj+8PDwyqhGz37+bmu9xCYo6IPiuBIqHQVvKcWfvuGm6596jeVfv4sINq3bt2aSg6cAJUTheyISq/BQBHClzziQCAOi4gKDvH+lKQZsJPCmpQhBJYzrB0Rz4CEBBBgStAH77r/7odOPfVU/jIvYGJiAqNAbF69fCeRSg8/LDzmWM6lmR0b5kcw8LiIznVPawO2uNutD+7m7hmW8/wgZykcUk2mqbFvo9BBGdBCHwSxi+QSNCPFdlEWjxZl+fXWYPr4DTd8YhIAN65ev5zw4zvd7gG5zkda9hrKnhJQy0JkD1WLiNAebb/hxLzCAdwH1hDsAQK9j/GVnezsHb99Fs3+k5V+qiQIEQmIUCj95wrpRSCDORCLw3CUh60I95XhsSbAzQDnkFCKPNCMmgUkRQKzCw6ce/tXv/pV27xu85HucQiJJSASG+LJkwzu+NQtn/zcjom7dr4W9P5XzYDvfcvb3txOg6f1DBynknK3SjFfFA4nHeEMrBCVQ5WaG8y1mQQ0xxGhIlQRI1gSXAr6k4S+rCqtlGT6sY3PXff4+OP+q7yAiOAHL7xw6sT1b75NpRrIlo+u6zw31/VMAKUoj6ZzGxlz3Gwqhx8djmNBdkgd0qSPlkW6VURetsBSs1yDKEX0qaJI3wLpFD5dtlrPlwPlZ+d15n786rGrZ0dGRuTUU0/lx678b8+tW73+YDM/sbZ8SMBzw5MsyrIsnimL4maB7A3EseZm7sb+pEeaJYZN5osed1XYnBr7BRt6uwD2D72m9eA+EJ/aTFdEJFEZ0giSKWRJwgCGuzclReSFbnmBWSwAYwDgLIUHC1lH4O5+vHpTN8xfOO/gJVs2nzDfg8tI2S3kTgrmA5ijSe9n0hdXrl72wJo1V8jExNhvDMXI/m/u1q1b2+84eeuHsvkH3eqjAvk4ET7/ma9+4W9E8GNF0Q6GCdAS4feKovz7siy9LIt9EEx/1m4ejQNVWPbwCr4/cixYPLH4V95jQTJGMCJXf/HqyUUc/Lt2u/2gahI2lK8igrMOP9I9Oh5QhdQpJRZF0SlS2tYuy6+URfl8SvpjhG9zy23L2cK9oGguy/KfBwcGvjegA/+PgyYP+tveMsKf2FeXUhI0PSdENJKqJuWepOnLWqSiKNN9KrwtUeYmiDXUK0ADzRjJDQjf1/E2c0oEBcHo0WIcEhbwHnAdaFhefEV6AgIhIjPC9ICkdI0m+ZwmfUQkQcDUoDYWuc6dnG3WPXfNvY4IQaAbERlAFWRERDQwm88E7OCqstMQODQlkaJVPiSavgJyZ3iIiPjY2M0OjL2mbBgh6acdf8phJnFyGF8UUF1kyqQ+4uz3nPkBODZ45FqDEiSorIi4M4gVBI9Sshuq7N+3OdeoECh7VxUqaApmo7vowoULfy1u2ShGfWTr1jQxH1PtPa3PDQzEQe7FKlK+V5Tlo0llbyMhDoSFRHhbKDtYFj/SVMxT1VoiWrXW0+6pCKAboNMiWMgBibr9U5+/9t6fCbhan0gQ8AbDo7PxryY1RF1SkR4Lj6UADha3zECQTVPRFzD17zwRCQqLHh4/Q4IREaC0GgQfTmCA0tDyQanZNBRFIP5JVF4kdIYiFSJ/wTTWOLGVxhDBYM4CAE6is49LF/AQzie40iIeC0QJo8F9IOd8QoAvCOWelHrsG2IXwANz2CHqOQOM3nLF1xaIzt2qYqndABQCsVqN5LwQeWMV9WwwqiQCFVU4xCy/w7IdFrBZCPWVLg/wCFR1g67oQAFSHUTlEQ6z9uxzuy4aGR6+7oqbb657RXTsj0P+3CAcH88AcPHpZ97eGhokzQwqg0KU0cK3UlVMS1X9vzo+u8k9aqjOaSWllHrNTOFPDlXprQOtwblkvcA8n4SIAo2dZTUrA1/fj7DyL38OGgzu2Rs4zumG2s0PdPcTGHH9jB1xS7t48sIEnVV2D7csb3eP8H3JS14JvsYCRIXclVTvp3LCAwXgVTiPcsTbAJQI3AuRg3pJc3GAM2zIhpvp+mkt0GpmAZwjiIdIPuZJDkgo16fEKjzaASxnIDeHU6Dx2fLTAHStOd/DzcXdhhxxrILH56zPCeNej1CEHwiL5VbbxgvOvrgbrfyjG264YddvOhX5iQDUAczzGsjRTEBKycwZ2eHZzGoGNlureKZIaYrC6WCsB6MktSxK6fYIwYzwsDrD3RvMKgKgl9liY3hsJOyHbJd8uErnk7xm/ze4H3wB8AqMECM/CS4PDw+XQzP+4QqdL37qK59/GMDDAHD5GWcM7uWcuWk6TbW0854K3E3IXDCe1ZQeSJIevObzn364R0T5+qUfvNBLSlVXfDjoU9msXaTkRdHNP4fvFk4PBAa8P+ToZ1pYOyL72NhoFRGfuGT4Dy5PqajC42mEH0mgdo+GCP0KshKCaKnEPUj8rkLniMAtxIX+cACJlEk4Hwf8AEJqQyxD+EmNzigSxMrG7yYCRIRHEhFX1Z0S8vcgI8KLnPPd8HiDRywKIvfeKwTQAppT2OAwt5lwZ0ZI4XokhUtJuCIc4HT2bAnFO1NdvPmCC/7k/9vzn/mNgejebnh5Z8P5jsZsMjvqMAHqXGdfBGCjhp8SKb8kSR/RIj1XFPJ4UUARsSYCAyTN3IsMWjbPIiIBq+qMd4aFmpsI5Z0CfKts8Xm8YqioY2NjdsH7h1de/8Wx+5t6ZzT6i9X7O0UWzs6m2gZ+pGlwzUfe86E1FnzQ3KSqfV7yzhY3r6Yt1rnbIEVfLjV9pVWWeTDSeB9qA4BPfu66b170gQvWpJZ1LUf0/BdQttt93dD+S2MIAB857yMHz+bumkAcJ0DXVaTXUMxKxBNReQsAPvLhjxyKwFy4Q4C7AlgC8x5c4j02mvZNJRAhR6OOZzLyMme4h9cROIrkURDZLoJnVIvpiCDcfuAhCxGxJYCX4V6BKoCXiKbhiSAlIoFe9NOuijxozTz0LABZgqA2UjuENOo9E6qqNHySCA+vxaSiwKCyEJTnkyopeEkEP9y1p5vxG/rP/EQXvOywI09EYMgjvAGUFAEIgt1stiK7rbK6nrKItogclzTd12qXX09JXiD1CVW9V1PanrSAqC5U1SERySQR2VBnM7Oce/jEsRTUW9ZveGnbvfc8PjExEee/75w3afjwxuWr1m44bvXUxlXrhzYcs/bAbQ/ds6vfLd/xwAP1XQ9NvLBp2Zp3GOI4t3yUux1W1/beXNVv6lTVimz1sggs01Q+0i7Lfx7U4urFU8snxx8fb9asYkTGMY6Na9dMRsYJiDAIQIp65Ye84c0n33PHHXdY39V+eHhYrrzySl+7Zu1R5nhntnpJD0lxJYuU9LGUirtU09T2e++6c/WqjUfS7RREzFi248P9wB71h31qpVBAFRHyWQCHuvuyOuelZnZENj/a4UMRUZM4VJieJDHrgIIoPbAaiCEA7QAHAewhuSfcMzyyCNV7naVFhFvMAJjnwFwyVpAwNu03hNRAY9fYVxI00lIAIaQwVGSuaLqnTGl7KlQHWsX1n7jxEz9+4IE76teUD7j8iKNPgmCIhGsj9wMYJFBn9/lutqxPv1eyI6pzqLqHlBBNu1TSbFEkS2V6KIk+rqI1lQchPMydtTvdjBbNwUxgWXgcvHHlamxZvf7ocD8tArUj5iJiNczXC+PEdctXHblp5apjT9qw9pk3HnUUVq/YcEZ4HG7uVue8sK7qk7LbcXVt7ZzzgLvVFPFC095Wu3X3Ycev+OfRa0ZtH/tjfIITmIjjl62lMd4QYN1LRU7wcJutDjtp2Rsf+LO//bOqj0Fu3bo1zRuY97ba88EesQaAC1Cqsig0fUOZcqGcvmti2x07Ju56YePqjc/AfQPcp+GxNuC5T1DtC9x7RfNu9xg0s6K23LWca7Nch4UHGCIspcFwtkNQWbalEXFyuHeaf8EjgFgGYAECK8E4LMDn4W4kwxuy5sZwvIWIQ0C2Yl87JAWFLwbwLBGTJBeGN1/S6KrEJaXBpHJfIfr1VKSWKa6+5vqPP9YbVsRrGoDLDj/qJAWHguJAsPmsAgh6jjURsSgCLkkYlGg0vFwewdUR0RKVSU1SMTiYUpplKY8j8EhErHU0DlcRzUqGCA93dws/2oGTzeyQoD8NwN29a+5H1WaHWXgdwRTBo3KOzRVab3BwWSCSm9fmfmIENnig4whvxmiEJi1F0zOi8sjeZ15++6Zj1/GNm97y0n+98r92J9BcuPVr129E2HIPz81pSYuw2QAOyFq9acPqde1NK459adv993ffcvwpl1aWj6/dTkXEgJIqoi+J8gcq+oSqtIR6x7Z7tz06PDysN37mxudPXLvpBQDHurPDwFKAocJCqQWVCYBF4ICGzOUebj3zy1cmwapCEB2CQrPDPXCiuzf+d+FEo1ZMCBweiEUAD0FwGcEDI7AE4SdF4DiALSCG8IpbPqMx3ikADLlzjrlpRCOCboJf24XK/SnJ11TTAZr4wHU3fHy8P716zRnRK488+iQoh0ToIkKgR8p0toM8jYRJUlK0sWWEu5vTEYnkUhBHKOUBVQKi9wNsK8FwLz1iiUd0QUrzIkGzQK5ry5bLgK9oXP90p4evz+bvNItjPeIoQxwVERL0Z4AY9IhOo72FBaLjgeUADGyGaikpRMQJmePuR1jgSVEsy3l25caV6zeeuGLTC6uPW70cZmd7YAbhzX64sAXNeM8Lj5hExBposXLdqvUbM3xxt66XW87rANSk7CL4WRV9lkSrSBo+EJ/evn17PTExgRGMyJ/f+xc7Nx237kUKBsOilohDKbpDye+QfAwRR3ug36aBTfA1Nr8gRIUitIAsYHCVRyx192Ru4bU1IxSJhluBqBCoG+YlWgAWB7EIYNmsOwvvs7568hX0jIk1EAU8NMLD3GDNJhJJSatU6DelKILCRwfmyHVnnHEGXst9Iz/JhqGGCBHwxukeAheHBWpxdNEsP4kgQQ9YBo01knsEMAnggE7EB5PrF1stLlVhy6k1k05oFCtKYp5lmwGCljOzZXidGRUiZ5vxAW4sg+vdXWqzTniYkqWoHgnVJaASyrskUDZvmQCQUlVaDk/C6JIpCKbwyBbetuyraD4H0DtF1FTY6jA+ynBBYNrDBR4Vwzdmj1OIyAEYBBMu3JYitUKknbMdk60+KVtMJtVBFZlU0VkVzhXA4III0/3xypuHb9Zzxs7ZcemZ5y+HykEG395s4oQ5UNa1h8MZpKqqING0CQyNZlDcbbxhI1tY3ehOTHJuThI16dkcOxgivYEUAuEisCa0G+wv+h7CsV/LGr3/PaJpjhxm3hslJKXIpKqGQKR78NAN1/35n9d4jRcfav8sP2PLmzeDfANUOiKUhhokYIQbeCAQq6U3uxTIPk/8fW2iUBBRBzhIcj3AWao+FcBQOKeAeCrI+UIuEEKa/THOnDOa7UhBiJijyavZnR4mjU8+654Go1DqBCmJIhFCZcQkwEqBLkSoSb8qlCeDWOUe2dwqBOeBXIvg4+bxHBGJwRzsHXeGHPQ3ucdcc68snOF+DCIORcROjzgyu729qmvPnkFRakpZyCcZXvcGYwngg9sntu/qX9yxibEYGRmR2ZeffxqmSwJcKEonJEV4mR1rIyKp6FSR0oOS9Fuqeg9TEhFmisztDYYjCHijeAo2Tk1s9PN9MgL/paKRsT+TgT/NAI2fEIQ2SKVZTzAmNBU9UIUPqOrk3I48dse2H+56rWq/fTOxsbExf8f6dwwZ/I1AGIP74OQwk+xR030DwYFgs1ULCCiJVCSURYFUNInUzCXnnKs6p7qu11dVNT/nvNfCnMRLkvRzRVF8KRXli0WZUioKl6IAKcgeqHPNbq7RqWvWOSObwyMQInSSQQVSQipLSCqRNEkqiiyqk6EySUoL0Lc0yaB3/UmJiBqBjkdsIqLdoF5B91eg5giGu6Nh9mSG1ZNuttA9znHzt7l7drOAgRHRRfhhHnaEOyp3r9yty9rf3tNS/EQ0XDU2tsdyfE0pVHBQRFsCMYmoSQ4I+UBRyFdbrfKlcrD9QrtsfatIxadV9QdCbRMcYHBApPmlKQ0klZDUJ3Ttx9h69Rlmb47cZ9o0v8s+sTtBaPOx1IwZCdDDunW21VbnmMndCy+55A+PHhsbs1dbRP4b1YDLDlw8FwVPV5GuiBIR/Z0zDEcd8KODsRgh2XsEThFFKguksgmgJpP3vobMFM5H4LDwqB1+eJCd3gV4DiJKyMrG+Zbep//uq036ikYhJDU74VJSlaT3iOqzCpZBCQE8xGfCeaIHTopAF+5zPfyYiPCGlNN4VzcUJc6h6D1CGKl944zGTsl9IRCHuYX19n0RgImIgaQ3kIYHGdL8PBRENxwPwm2pW31YBH3TivXFX/zt/3iokT2OYnx8HCMjI9J5ancrCi5LIvcKMInAvOyeBVieiuKeolU+OIuj/2bRwXZbPWMrQ3g4wh4iWQHsqvA5oexM1Oco8pJSDhZprJj67BjsR8/qCz33p2w1pIhmRQtJ6+FBrzBsKFARFxElAXfzQBwexByhPIaIzRs2Hv/IjTdeu7uPKPyybKafS8l/77pTFmaJ/1wU6lKWABzZHRYhlm3GwXdQsSZCZrO7gEBRlmgPDEBFUHuNumrENtLj2mlKoYkqlFJUSiDGlPoYiAGSNdwPrM1OqurqmG63O5uz0c327X1rcDJFs/9Do0hFKlI5USQdl5BagNKBeWZ5ged4a5gV4YFo+HxU6UEeQjDoFA5AeL+C/0BhYjO2blwePJu5t8Lj3Nrq0j0cYVBJA1LIbEB3G+MAgw0Y4EmSaKGVgC/C7H54nAzDUKLcURbp263MKz/+jbGX958nX/KBSxao1vOv7tnCXfye8y6szbY4KalsvSQDuOnaT1/7AACcd95H12jYBTnnyt0rgKaqAbAUkQLudTY7KDxONPejPLxu+Kv6U/zBvpdP8xvZzJRZRVNWTQN9hvU+kV4rAnvccivnGu7hRSFzi1TeXpT67YRUiuLetsu3rrrxqhf3ddQNMBq/VhMyWLZ9T55hn6vr/eGI75OxNqle2NDH2aMRweABWHZkMwQcCgW1+YJweKhPATIglNh3MSgppbRTEf9I4bsCcii1W3tW9k/FhkXcfE8XoXvk7PXGqH2AIc8xYi6CaxsH34gI9/Do/cDN0pik0qjflS0EdzP4HIgigs5XWEARkETGVBD3FJLe6BIziJREeB9F7g7BY0o5roYsErIWainEXrrvCOAD7mgzvDbgQLco6oJbAXxu/43w13zhmt0AdvdXconKZELMmmOPEHNe2PPC4/1pS+Vxeu31TJPdJElDGWtR08NKPBzua7XQ6Harb9NwvmWnKAHtrdwL9HTJ3I/0gB7tHxTyXoIlwHUBhNLRGCAzU3gbEVMZ/u4wmfXIknPMqNgyq3lPSL1LXddO01ZecO5lt5Ue3U+MfWKcPS/PXzUIFQAOWXjQ+0V5eEqpFk39/VP0QGXuh5M8WSgmotTU7GEDBRGBOmd0qy4sG0iiKAoURdFj/yIgUkgSJ+TuIKcAzIrK3ELTDiofJMKzx9EE25rUtSgkpQRJKUSVvXoEAOgWlbkvMrOlZnawudXWaCIj+uymntsUVSAUF1ElOQvEl4V8EEDBPge/N8tlRBBUj9hF8h4KJ4QykVTuhsqkiAxJmfYmTc+lIu1MKT2q5EvesKim4D5fg7uVeE4oT4vI1FuOPe3+gSMG9uc7cgQj8md3/JkBwOrj1+0sKjkJwURVzC/nP3fihhMHK7fzzW2+uR/iZicK5FlJKVTT3qeePeyvvvjlP3tk3YY33ZfMT3T3uTn7ao9e59Cv5dAY8ESf7tX7XBMhLEAualiFGHqFaM1SiK+JyO0IDjmwlO6pWWciQbAEuQzmq7LlrpklmK9x+GEbV29YsG7zG3afveP9k7/qTmQFgKUHLH4DhQemVNSpSL2hQNAa9sQBJNdISll6e0Ca2w3IZuhWFbpVBTODJkXZbjYlNStTG5VV0uJLLPQJt7zc3d8i5LSm8s7q7O4/6kTaWue8IoQDKaVIZStrkZQiTZdHIkB4BCwb6zpbdqtytuzmjRaiV1qLCNjXYYiGiAxKM2P7olB3kpizb21p9Hz73HpuGSKKqEV0RiFdJsykpt2lFiLK4kee8CNReUpFjvXwJIAKOJkg2wjcq8STCmklphWB6Xv+7ON/+XJv7NdsUu/9HhH80Ic+NLt+xbo2gKUAaig31VYf75HrusonmNnbEXEoyRdTKnaq4IUvfvnPb9+6dSR96Uv/1+z6tZtPcs/z3O24ZmjS3zTVnGCvsKhfyYLNhIPekLFjfoAGNKPBhkaMgMjzIvIy4AsAPYxE3QgZxRGRImLQLY4xq9flnA+rc11E+KDkvGHDqg0vfOyvP/b8r0xIdY/8U8SjvnCmb+JCIiWVlIpWUSQQhJmhqqrml+WebYdCtKnAPBoJTQNpswhgTTZbm91XiQTHzhmzHLbR3Re5R8UkrdRKX09l+XVtFSm1kouqNwN2R3ZDDmfOJtldLHoQVnPGBCnerGxNEIoy5B6QD0twjrtLRNTRDB36x68j2Amw26zoEiCigEJTaCGpaCfReS3XK6/9/A1fvumWm+68cezG7x4wecD/lZLsSiKaRAZU9cBUFAuLorWoSPq4BG5Fkj0AcAWu+Kkjqbf4GmJ4SpSDAMzMujnnvZ1OPiW7nejue6PxsgyS4qE9/cVovuz8P17ijDYCRnBAyZJk6kdfo92UV7wWeiYUjZtR0JsOrWpWnzS0soioA1gb7qcB0KB8n8pp0aTaUPZJwgLe9bBOZJ92s5blvKXTrc+ame2s6lp9xjlnnfOWy95/2dxebPGXqQHpZrLPPqIfltYQeOFRQYFm9MQ9UPkOPd4OYauXTZoRmzdpn40v4KyZtMwqD8RgFb4pgWHZlna71YsQLqkq33Lhhy9ZOD09FdlqNqFaBkRUgxNGzCPldMKmAlG5JYE4wm2fJIfNVkpoklDRQkUKAacZHCDxgyLxhwiZRsAK6BFEJCfq8OiGW7bwgxH+JlhkF3YU+C6VHSGTqmoKvwVF+fyeZ6u9fbEWAHxs7GPd84fPzyQL0fTtQnkPAGS3VCye/8T+MtOfVRONjIzICxMvPDo7u3dbKFYF8JKbb3K3LRYxReEAhS9KSo+TLMsCL46OjvpF519+Vh3dVbm2woGaIp8uWCwKckMQ9IgB9uxnXsH4Gp9C6ckBGslUsOf73mOWBoOcaebzPgygItBABUqwMVFpaSBBwl3YDYMHYiY8awROcXNrt4oDumV3LYArf5kAVAA48oBD1lF1cVmWtaaSCMBrYxU5cs4bQB6iqiGaapJzs9li97Dm6gayNR1w2SpjaGgotcrWeJ3rozrdbvJsWUXmBWJVXVV1XWcVolMW6WEVndPJswdXdX2UI+qiKAtJ6V6o7mXEjBCTFFZCHIJAFSDhPUFPXwJalFGmVBZF8TxT2gaPwwkkFbmvLMr7h2LujVd/9RPfPn7V5k5SfzzAvaJ6KBG1Iea7403ZcxsWhwGYVpUnRGUAqjd+4ss3b1t77Ka5rfm4aN1xm4qs+amxsTE799xzj2bwDcKEUjh+9S03PHznvTv2bLvvnl19menExERfXfjTKr/x8RgfH48fTfyo+sCGlROT1jrcPQ7O4S9ExIogCyq00PKOoiyeSsovfPL6v/3xRy/46BEWOKPOleRufhccU1row60yvZxaxY/DIwdinUVUpHvDrYi+rW3fkms/cmNDf+klGvTM13M0ZJCFjRSg4WYRLEX4MMl7SO4S4SEAJNzLcA+z6IJxLBzbqWxvXr32+e333fNCH476mQG4ddHqOaFxgkqam8qUk0qzfiAcda5hbm8BUIioCaXtEQe6Ww2C2sxcm22XDBRFgYHBIaYiTXY71eLO7Ky4A6lIIMKrqma3qlxEhlLZqpLIS3WV3z3b7Wa3EIo4A4cDsZ7OaYrco8IHAVmIwGEksopSRZk0sUiFp0K1SEVHVL/SkJR9mXsoVXamVvrq333h7+4bHh7W6z53w+M/vn/HI8s3HHdfKxfrGsf9fFSYH+HuAYQqeQiAe0XSS6Jp0caVqwaJONOBg0JsSWvOwD+vP279h91xGs0jHAMSUm+7d/u9l19+eXHGHWfg1JFTeeWVVwaA+FkTg8vPGD5qy9xTZu549g4fn5iwtWs3l3RbZWEtBNdAOKia7pIi/aBIST5149+NAcCadce/290X56o+IiI2iPChskh7tWjfT+GSiHjZ3RiMBQDmgMw94zs2kgDuc+zv24TsK716E2kSJcjCI3I0az0RwVIozwnliyLpKVE+TegDJJ4RkRYDGeRBzTw+dgjERXT+5kO2TNz12F0/V3imhx94wHqSb9aimBIVJbVXGTYKjvBYi4hWIBrZdrgFSVFpul1t4BIRQVGWLFIKNz+80+lEXVWQpBhot0y0KDqdDrqz3VBN5eDAwJ6i1dpRVfnwTrd7YFVX5tkRHu2IKAVYT3BGKI8i+CSFCwrKAhGtChVLZYqkMiQiTiLD/XDP+WTzuoOIUsBHVNh905ZTHrzm09fMXHb2JadtWLlmvdR4c67r5VWu3ugR60EMpCSPi+j3oPJMqCz3nI+rcz7Bww8FsSeATNWOZznOEcs9e7d2KwGGUltb1m556OPXfnxy8fDifSyR4XcOH3DSmk3vXX7kcU9PPDJR9Y+j4eFhLer0xzYvb9q0ZsPshlWbjmHU66raD3Pz9ztRUkVE5BEVfVaA1sb1m+etW71pFRybPLwW6t6k6QmldJh0WgKLHKiCoRB9UFUfJ1mryCIQhTR7RYj9NcjN9Ge/ER1DRYuU5KGk+l1S5oTHQZatC7AUykuifEDIuVSRlNJskXRX0uJBEX2JxJMkjOSLQb5M6BGygPd97MqP7fp52uFUtDXTNCNAZAdSBrxsAipSRIFn6lyvrKsuahJaFCzabSRoo/aiYqDdQpEKRAC5rtHtdOqq26Wbe7tdDLXK1j2i8tI0+aaccw4zV+qcA+ct+vzs5OwJdKyoO3XXxBhuObwEW9jLkht7opwHCuGXoDInEUoWDvhAeGzOdX1U5d4Os8GwmKRAlTpbR31y7uRjZzozG859z7DMdGbmWPbC6mpjztkRGKRqLovi4aIs/5FJPcymqk51WVXXB9VulUCOLNqth9uD7VuT6IAh5mWPSbN4hzmODfgkCvscoZdd/uHLP37VjVe9eMEHLziCzuPDbZ0FFwzMKdsArvuT0/+k9Rd//xfVZR+8+OQq2SAdJQ1nB+qyyrakU1UbAxgUpWvoZIJuR6BweG1dfy+C84OyXZMMpjI9TOhdiDi6rrrLO14vCKIukj5SFsUcRuypVX5gFtsjbGu4LyFQx34wdezHKqAgCCZR7inL1reKInXr2p+ponNGdixpzBPQCoOHcFZBqlLAsgX6w0y8J1VpaV3Xj+Zch8OLILNbr7EY/TldcERiUAm3Zsdvb0CqTeWbi5TuF7LllsPqLjzXoBsYgcgVImcIBGVKIKIfgKy6XcBDk8h0SuWPFMUDhGZ4CEKAwPV7u0NPF0U5R6nGnvOO52YnR1ggcm5Zrt/mdf6AVfVZbnZQT91Vq+gkBF8jMeu5Zl11q5yrHtTqrYjs3e7sITOzM++bnpk6Y6Yzc8psd+bEme4sO91O6uZq0mGlJD6VSv4gtcu/S5rmQRjdsJmqsk6Va/fw4wAucBEPYrdZvCWbrzUzM7cFZr6+dis7ufORC8+95FKSlzr8+DqsXTF3QmTppcOXrvvY1z7WJRk1Y8AD82u3do56urZcZLO3efhAIGpSNAm+BxXRhAVhQTNXy/YuRixJFKRU7Ljmxr/6vFKfNPdju93qPXVVvSebrwM45YJ2I1KP54F4nESK/R3T++hGzxlYeh2LgsaQGTiLlASair9PSb+WUtpF8LZgHORmJ5rluTm7hENQlNuvv+kTn+NA8emiXWoqSlctfd+inkZp9nO64BpA6psQe99hG4wUcBYqMinEs6QcEOGZJBmB7A3s0txBTX2Re/a6VtfNbjdlhLt6tvlMsquxq2g8Ukg+dM01o50Pn3WRqCrKVgtJRMpWWahorYCFOcJ8KoADDTxIiaND/P4ixTedELi397lKCYhgzx1AHvHwpe5WVXVdqxDqCdGYARHNgpl5mtIuqj4PpkXIONqJGoJHkhYbUYRDNES1Atg182nzONSyHWtmM24BJFTmcVKuM1kU36XHKnPMeETLyYs9cDvdvwPKORefc9lBgVrryj6U6/qdiCgV6atBvkSJSkSSqDBp+nsty6eLJE+K4yErZB2hL1a5/gzA57O7scof+IMP/9GQZTs8mx3kOe8JkpLyKq06DwQ5HRYbDDYUEWsD6PR8khqNUgNI073RMnmvm8hAK6LzFrO0p1C9v52SmqaH3OtHzfKkm73XLNbSsIX0ZzTZV4oi3n3JuZfPRwZctEIJ0vNgorQs8Rd3wUsWHHwoBWvJqElSpZkiUAQQpgB2hfvBEX4YIXXSRFVtHMzNYObIllFnQ+M21YNBAyAkUpmkKMpjw+zo2U63zDl7WZbF4NDcQ95y4lu3TXWmTsl1PkZU8sDA4Oxge/CpoihaJNruMHMXq2tzM3OzHMBBQa4hMQnHlLttYiARYpp0SJPe2yrSF8MxaOGH9KYEvRk8oZpYFElbZevpoiy+LUl3UvRgD18T8En3cJIbNBVVkVJbNXmEvGCwOdnyuy3boLmbw8kQCGkQLgyPF0P4YnhMgnE0AotIPgTGCyFUhK01i0NyrlflnI8OAFQmgWwXkUdFOC8lvb0sBx5Pqk/PxNQnrh+7/tEVq0+eaBdcRKGRoQx4dp92tw11XZ1lboebe2azCXvIPZab2XE58ioPOwIRVYMc9O57YdmwhhBEQ8BHQz+DhxXZfEm4HyuUSZX0zVa7dUtElBFxdM75iPBYbGYdD59Hj42wmESKhSCWByMJUZP6tKR0+zPHHbX9sVtvjbe+9a0/swlJkSrSCzgDjT9D4/Hi7iio4ZAkTdfpiNyIZXueZg03sOmkco9PRhIqCUjRy01hOdcEsMDdjATdvc51XrV3Zs9/rqpqafbc0ZRaA+32g+2B1hc9x9JOp3NGjm5p2bzZE+cQCkogi3Aoh2wlOUVgyCldKpKI7E1J76amgRT4UeG62iwx3BoJpBKaUlmk4rtl2dqugieFKVtglVve7Y4WgD1J5JEQHgrwdhBr3PM7reN0RGWe6542HQYjjYFAERpnSbaHCE4T/I6IPECiiIg2zcLBvQ6fDY9ZkF2CMyS3N1MJ7hboF1NKbS34VGt++tQ1VzW0p7HGpfSaPzjnDzdUyB/0qIfMsTW7zYngoW4+yx6DztyqiGgHMQjBbM9Za7DBYjgFSCki2yPiySC3MHAwAnUvJyLckN2mQnxIRFOrbB/98Y//2Zcuvvg/PisimiRlM6sg0Q14EYzp0Hgmgl0QbRB3mOCHN3z6E4+8orMd/flAdJN5e5i59zGhXqGq4eIoVeVH4noM3MtoJv8giJQSQMAckN5a033cs+i7QAmzG+CRm926YJ3NZjudgez2rk63q1VVVWXZKpsn1rYzPxcR0+E+EJZ7KEkAEvAIunvVIP88INyraKAuFfg0ND0twJzGoVVfaJXFUblm1WwPS1oU+t2iLHekhC9e85kbd5xzzjnFUB74f1ZEK9wqgt0QfF2CHuSRln1j7dZ1bxZxGfYj4DVQDsIJdZkN1WNFhCp4HIGnm+FYn3wcFMdAUr1XRR4KhJMyjUAREtCkZWLqPvbcI9eMf3o8A+DY2Jj1/Jn58m0v3/fyUDZzLjfLG83yTAQ6CAgFjRATKPAKBWtAhE7wflKmKOnHDXsaHRFmIB53+LKk8g53wsIdLlkZQrKD8HWVdZ649II/OgUhi+CmhcoPlPwxoBbuy6HyXBLNqqzp8Y/X3Hj11/bbM+O/DHM6JSvmNrZxjWY15wxJCY0pdFMaKtTFrVTXyDmD7oA2PD2hNPa9vQimNpSMstk92lDGLeBuPVE2EXRWddfMjLXV2T003LvmtrSuOkdZ9kXudqCH171Eu0/N3V885BEBz7kJvgAi6nAegNpOyoVsJyha6FcQOF0KzgtQVPWeVmrt0MQvfOqWm7Z/ijdheHgYDgMyOuG2ESJ7CD7gAYX7iWZZGhe2ICVBC+3zjnq+QY1bPdwl3GagaYhJl4noQyKY5wiDA8LGSVGpk0llxgPi4QsbAxgBhR6JPPLII1todhqip5eW0dFRv/TcPzwd2dUjr8g5T4W7RYSwsYVTkmWIvMjeBJ7Ej4ScEklPQQSCKKkyGJABIizCpyFyvyBecMYmgRwW7nM8vA00a+xyNqHiXTCgcRdLWii7CNsVEc9CZQiuP55Tyw+vHLty6o+H/3jOotWLZkZHR39p2w5dcsAhH43eHjhrPLsaZqwKkggoJCLM3RdG4CBHmDdm0UjaEGMtAmE9fXNvRVdDDJB9wKdHNIC1NLcstE8zALWHIwJIZr4qW70kW3Y3e6VjQ5/h0neUanqlPpgQbGxGSRwN8H4Q00okUb1fRO5OqvcUZfGSQz5z/edvunvr1q3p8ccf9zVr1qiGnOzZJSLmhmMNGdNBnOaWF1dVXedcMxBISSOlIolqJJFSSEXAGlKEo0+J04Zt/DjBqQYcjxwBU9EFWuq3rr3lurGV61bemdh6Q4SnRv2WQshSrFi5dtPqe/tbz/tg9obVm06usq2pq3qZZZPsmQ2VSpImnVKVHyXVb6mk7SK8J2l6UZJMJuU8FS1TSonA95KmCYmYFtUjFWgRqSuKp4Ryu4hOqspLFHkYwCDc3xbZjZCHCqVqSqrQWz514998afs9d96+fceP/3n73bc/unLzlgVr155QWtSrX3hh8sA16zfF3XffOfNLzYJJepD9DUj76r8+JFOYCikzQn1E6KsIVI3AOpDdoUK4OdytIfVIU+1KalzhzQLWa0w0aWMb2txhcDbu+JQCEY5ut7aICiSgqo36RKQ3UI99nskRDlpjrNLbj9VobsThWcy9PlMo26h6G5QDUmgqkApDvvGmL950T4+nlwFgcnKS7YEDW1BREo8w4iGEnBHuK818l1nWsIAmjaRFuyzTU9T0A4RtzOZtCg+J8GwZdHeKRQ7RQ8ywKhBPw70MDyG4SwTTtIaoMTY2Vl9w9gXfAeX9YOwJmJpZBmVx6qb/cOHwH9QB/EMSn8mZR5rng82qZW55bvY8E/CGL6QIIf6hLIvHQB7ao5blIDOIwUT9eiXl7VSRa6/9y5f6b/xFF13+PZF0mhjghCTV5eH2lLF4mGEzOfsDbvU7Qc4HQoFYQPVbPnndX+0AgAsvvHCIdfvwQv//zP15lFzVle6LfnPOtfaOyFQvEAgketS3iM5NWeCm3AGmqQCBOhqX6pTP8T2j3n1jvPfXS/LdMd6497xTdlXhosoqDEhIdFkYsF3u7SLdYkCAGhIBohONhAB12UTE3mvO+f7YEUJQ4KbKdcYLDwYMWUpl7lgx11pzft/vs3ZZlPMD01nKelicTmT4NwG88fskKskpk4+7gLqKsG68FHcEoSJgYXJQgul0g51m5qXDqRsw40xwNZg5iBkSAkKIEAnddgu06weuLBoVZ6yzh7EwWARmiqIoqSzb5O4UqguDV5MWBgu/k9RU2XQ6tg/uhvzlcIi5KtxyM5vhbseJ+UGRUOTid298YGBHo9GQ7rTC3WnXrl12cO/bNRY+gavzg5pj1MxnqKmklODkHmOQLK/tref1zSHH3SL5qAR5GW4ZDCeZW+lmVeQgoQT8ZFNdaGazUtJ5ZnYywONjjIOzFsx6tTHUwN4Few9GhLnOVEOqbNJJS1bTcZ5sPNzOVsMSOE4vUvGhlHRBmcqmVkhoCLOHGGIIYWsIkYjxzwJ7DsKHAdSF/Dcb7r7th9u3P9batu3RZuecxYODg75t25ZDW7dteXLrji1Pbtv++BNLli7ZB447BXAmzCK4SwiPBuGhECgDh9eaLf/J2UvP+vSihUvnI4WPwf1j5r4M5CdadcadCNjrUvOfPvnkk+0LL7zw91BEM1c3D668/kffglWVRAQU3ik1xIAclaMnRHBmUBc5gS48sbN5+pGwgiOeBZiju712vSBqVmVouCMQnFgQRKIIs5upmSWjishfQRwJgYJT4MhMexi0z9zHudmZlrSlZnDmuRQwgcz+eTinlzoHezuaN9g5KH/vy5/5zE8P9U47g0ArYGmvoezcE9gEREFCmdfizzmrPbDhnq+/tG7dul3NA3Q2Z4ieDKqyhMxbAMTggFphcDIzaEotBo+D29wQ+bKe8T2P9KO/jQEcWnPlmkehdpGSva2pnJnMPlW5XOHMIbDgWYKcqKZTVFPhbp1mOzkTIhG/GUJQhj+/4e5bn1jTWHMiFKcSjNFDD3cCZtDf3+9H/bzoXm6q/+9G37iRtnV+/Yk1V6+bEGN4I+vBT3bvzvXMM4GbbrqpaDQaDB1/biotmmlhquOYaS8xBRFyJ0kWyk13bLjz4IYNG34v+2ZFgGOAzWDcvQ1Xiy+Yl04eKjMzg6DVOu1cdgMJmAXWCVepWjAMEQJx6HqhqxFd1YsCw+BaSfjNDWwKlUrFy9Wi0zzP8zyLHmPcF5h/pabLNOmpmlLTzLrnbIcgE+EDIcYfROaUUkIqbcRhy8y0mVI67PCpQeO8jvDnA0E6N33/+20AT1175cr7DbyKEo8ANJlYLDD1xJDtINAj2Nva27e8L/Sv7y8B/Pq6K64zjSGa6zw17XXCGBFl5DA3Uy1LSqpCTgWx96SyWBCG5aMAfty3vC/039v/r6suW5UT+VIzW6Sq4x0+UlVzIEAWgiw5vOikfsGMwUwuEkiYd4QgowQcXNX44qlA+ku4tuDoLcdoZn9///bOIvw3yaLvbI/96C5UAPzyc3sO3b7p699BR0r2/e+/s2O6Yz9Mez2lmQZfDsMPGbLXmQOReVnW6Q8JM+R3pKfd81ZHDZ28ULeTLOl4OCc60pt5p5KxCCQExGrhIEqVCCTER+SQ3hU9qsGSVVZLU5gpUlmi2WxibGwMZSoRskDjxo2f1DN+3IF6vefnWS3/tsRsn8TwfSe8zECEwV0VcBATWZCwqxayJ0PAz4PER7NYeziIbCFHsCr8MHO3CTPw24GK7k6NRkP2t/LnmMKzEBriIBKEYwxyOOTyLDPv3zC4oYULqofRaNwrt91322+yIM9mMf6rxLgjxtArxHuIcVCAjNwMqjBXMjM31cI9HQcA3a+z6f5N3wfxKIAXKh0e1QgUiRBAUIIHeAUWZCaEQCZBcgmyP4SwW01/PJoOf5dQftRUSy3LlmlqiemZjUZDbrzxxt+5GPr7+63jXzE1m3TtVV+a0cF3UPf5DAwMlB6LTRKkkBDeCix3BZGDIpQxIICHPG+3+/v7rdFo8O+1ADtO/XdnXRjIoaWbzUzqNYIlosrIczS5nTqCQqbKidCNH4U7qmAb7VxOrKKAIcFdj5wH4V5lyLULuDvleZ56esfdPG78uP9vrV77bhbjTg7yvRizUkReBVH0jo2oQ5X3KPIMgvx6w333/GTzt+7+lzzLvi8hviwSMgZbp+/DE3rm+XsFoUd96kFEPm/ePP/Wt24dFvdtgcOuQHIgj5lJlj0gzG86dPqXP/PlfGhoiKqLxJXW19fHyf0HeZSnann8ZYzZXTHG70uQ7zHLmJBkwmwVoJwZRJGM+D3ORJKAA0HCM0H4x8K8L4TwQgzyM2H5JQs9y4ySmIlYXKpXM4j8mgO90bbRxwYGBpSByVY1TkVVSzacPTw8HLqZcL8Xgba/3xnoTbEMAPzGG2+Uo48rmzZt2tfG5L/rCdn/rCH8DdX9K8jtbyxLX6UcX6E2Tb3mitUXzZs37/fyDYcj8nu2alx4RK4OcjMF2RmueMGBOlFlK6j2gSoVqKsr807fDynBEaqwPleYdgzGzEf6ikyErNPCSdUIyDhILc9qu489ceL/dfPN784oW9VYdUCYzicmPaLgcBgz95jjlc0DG19rNBrZvIGB1H//5kevubjx8ZDim24+iYj3s/Dze8aGcgDt7hbcdasdvV10/k2jWfs3Nc8+5uYPO9PhyLKfnHIA80d6Rk4cGBh4oet464gt96y7+uoNhnhdhI+qmZBx2dLiQYvhCw6ru1MZQxgV4pcixye6f18n5MUs0Y9F6Mug+CzAT5NQjUDByVtmtsWdrhDCycZoMnGNWXZIFl6JiI9uHhgoAcBK+z47vmROB0AICv/ZeeedV37ve9+jP2ARursFLuhP+/r6/qm/vz8d9Yy8Okd/tQmg+b6pVldccx3A01/Y8cJeAI+5+2/9u/l9f4WPfDSdgVcByxw+s/K1MBETzIGiSGi32ijaBcqyIhmUqfKJlEUbqSyr9g4BsTJzd9KUAmr1mvf01L1e70EtryGPGWIWeGREJ3aqU2igcuBPwIS9Wch2MPF+Zo5V06Wqhd2Uv3379lk/uulYcVsW41NZltWyGI2Z3hif512YogHwL156zbIvNlad2lmI/p5/BIx9oRbezEI2ykGmsIA9+Uiy4orrGtcd203k7L4p6++6662WFF8Zk/KmdtS/Jg4P51GGYxbuDzGOZTFOiCHszvLsV+HYnmeO/iD09fXx5vs37wnCj4QQJscox4aAtyTKzsBhIoG4KvtwAgkxjXCgIWFpvrj3hEc67lI67cBpL7Djm0LYH4JMZeZX+vv7retBee8O4B0c4PuQFFSRZj8/9NKa6xvXzz7qGR0d3PR+/wDuo6olmdnMo/0vH9yGmXrCBV1gMR2haDsRURlCmCkhvs2Bhwn0ksNPMvfx7q6uStbxgXQrYHU54CMxA+b+TrgydaCMzIgx8zyvxRgCVy4tQox5qNdrBydJfcP//Nr/bE6bNo0Ghgasr6+PXn7zZWdwZmqfSJpyrQAhJMweJL55zqJzn3/w+w++1Q3YWTZr/hjApzvhORa8yBAba1vvgjMX7z1r3sI5i+cu+DNV/5iqzVk8Z+GcJQsWj//4gk++MXf+3MnnnnYu7njgjtbshXOeCkV8oZbXHifnR8A+1ZIfa27jSdkvXXHpc+/JLqahoSEbGhpKQ0NDOvOMk/fkHpc76wiDXiKWXTGLr+QSHv7G5g0vdBvhAHDBBRfQjPqM8ZTZbKYwjUO4j3rkBxvv3PjE0vlLjytLPU8tLUxJDXBiphRC2ElE3/72d//2tW6VGXx50LY+s/3lTyyeu73ttad6ZezVR4eGivcTgw4ODnr/e4R6XeHokrnLSjc9I5VpihIWn7XgrFPPW3zuK1t2bBn7beLStWvX1qyZzjdDIPi4+UsX7Pr7v//7kd/2Z44c/I5kAnd+iSpbaXD3KtQKVDBxs5NNXWWCuHYM5NxRRcsRHIT7O5YYYqqa0JUnwVk4izG8FrPszZCFyMTuakip1KamuZ1GrXZk7TQwMFBIJm8HCU9yJ3jdVKkoSivK1ufKcuy/r7509azu7JRF2IWDCL1GFPaYWtNUF5GV/70si8u1nY4rtXgzWVJNNr1olVftHX19c7to/rcxGflvKy5ecdzAwECx6dubdt0ycMuLt37z1pfd+VeAFZ70IFAsfe655yZ2/773aDwJAMZjfA8xiJyikxzmILuFeD+YXuksAD36AkB1XW0J5zn057ffe/ujY2NjVYV17HXXSe2iXW8XLWu320hJ4cZsY+3d760yfX19/NWBgebt37z9uZsHBkbe77IFANdfcf3ZNzRWndH9M+/6PWPFXgaLKzW1KNupTLOaqf3FVatWTXtPGCSONmulkfQRczrZtBw1sxOChp7feQY0AGzvXELAjKABxizkdJBABWACpsLV3f1IGwQSq3wQHFmAlcIxHanVFUKNj/JndSaoAsIIgWtExA5jtbJIRTppNIx+6ZoVa+ezcbvtI9+cN2/eWAOQ017f/ejTE457VZhzdy+SGXkqU1nIxHZoT6kxr1n7hatu2fDgPS81UU6r8IGcs5urluPKhI87vFa5I/gAMe2HK5kXM829BvCxlHi0J6/viRJP63Tyw0MPPYQLLrjA+vv7n1lz6QpRonFmRPW3SnpfyFRnEda53i58eBiGCUJoE6Gu7ns2ffPOrlLEuymfu57c+REzPZOIzYEZnX5lAQCllyeo6ryUUktTCQ/RVY0JZllPdgaAt2688UbvGn+6R4OjAgT96MVJRHbVF9aeUlr558FpAMCu7qXqyKLIQ0gwSCBSZ1HosKv3SFv+y5rGmiHqoe/cfvvt7W66QfeDGMaFX5bDrZmCsMyAB1/Z98ornepsv/USYqhaJN3/DhIshpCHIDtZmNx9rBJ42jSACmYm6uatxYqq1JFg4EhqkjvMFURV/4OPRKw4m1kzaZrtTs6OtoiQu3uraAsYHzHNT8jyfKgWxm/v7+9/EgDWHH/yKRgbm1SaplITaVkCEsnMkoOcCTvFet9efelVc1H6FWberKCWaJra2ap6srmPVrwinkDAqereCeXgUoTKmIVjONBgb113dg7eCsAHBwexfPnywJEHpDSOmWBGPY10qf3dhzl58mTv5ure+q1bh1dfuvqW4LhOU9lj7sbvWK29UwXT4OAgVlyy4nkR2kzwJjvPXnv5quvd/U2DTWq3i8tSSj0MlIhZDCFKDDxakU943Aec4/z9+nD9/f2+fPnykIn9iScdK4ja77cokqXgIh44ZEJeohLXebWYsKzVaj1GRC+9t9+3YcOGVqPRuDMP+ROb7t209cjg4bc2oplhZihSglmlhMkyRp4LhZgrgHoq0rJkep65R2JKQYSYGZDQIS4xIB1qnXacfMkqPgklSAhHoZAYZkqtVrskEDmcsiBIqpQ0WbPlMPN5LLRfanH4yCfYw0nmNk5TSqpasfLYwMJZYEkbH7x7Exy49gtXn9TSIprpSBAex5Cogdk1ubkbg8XM3EwLVTciUAgxC5F35Vn2Xeulu/5h0+bR7gO6/orrl956361PDA4OpkFg+3u2nqy3nf23Qsuc4HlRHHoWwJ3d6nPHA3e83Wg0vtrTzC5Oph8113cd5m9o3DBFi+aJtz9453YArwPAysbK0or0pbJM55ZlebKqFQ6kmOU5BzkUo+wIMT5NQgL2kwjkfTf2cfc2/btuuNOmTWMp9WQjlBCh9/YCAUCDf5q8JCAcjKX8k4/LjyVrTyy0OFib3PPqqdNP1aN//9E7Qadyb/19QZYhWXLrjDICB4SQQaIQKLQr9a6eXaY0VTU1WSjFGCmGAJZ45LYsVWheYHck9xLqDDKwOdQBTQmIoTMvcXjSytRfHdhAIhAHkik0JZTMRZHivKypH1vb+NLIhoGb9zrjYKUzkiAkBQkoZFkQCa+HGHZ9+dNfzm/6/k2FEQ6wcAbmCcL0BjPUPXsSDnZgLnP4ibnNL9vFNCDVHGiJBAohDPLB8E+nPHhK0dfXFzAEfkmfv7jU8sI1l638STMU/7Jv3z47Ohh7eHiY8jhpYqV3BJhw6rVfuHZmf3//q+5OA1deyVcODOjqS66J5HqkHdFoNHhgYEBTa3iWMj4LYPtnPvOZvNlsap4ojiTNWu3WjKIo2kTkMdbzPGYHYszuD7XQIoiDUAPstGuvuvbD/f39v/pDcBhq3mbiYPDs/e7ArBAHIgV7sVUrwp133vrCH0Jc+z0/DNUCbLWLGGIos6xGtVrmMebuqrFsFzrWak4uiva0dlEeFEao1XJi5iOyezhVMAv3KMDbRlwyY2Y0GoN4B6Kt78yEO7cTB6CdXxDTo9s+AIjMXMsyTWhJ87p6jlNWX3XdI246LogcrOX5W0w+NZVmMUgeQthLTiNhfGAAvvGBux5ZdckKyplqtz5w588I5F+8bOWMMgtnpJQ0sJiC8yDh6jIVs9wwh0PcLhxf3DC4odWZTNmqK1ctNuCjmtLLWQifqFntpcHBwScuuOAC7u/vN3enK6+8MlHiHZnxYmcKJnhl44O3vXpy38ndc49VZyp6qhzD+QTO37UQAppuFK/9wlUzb3/wnlcA4KRLr1KqKFOJCWCWGAO/FWP4Vsi4JFCyoriNsnguET6SHJ+75qo1E8V8uIXWr38fIShTqBnbYVbeBQDz5r2rSe9etTmaSJglKmevvXztyxA8smFgw1bvjkF/S5X9QxjSdPZJ8/5rlmXHjBs/PhvfO+6lINQabTbnDx8afvvwoYMfbhWt8829mYeMe3rq6O3tQVbLEaQCU1JgSDWy+iZzfNOA2aWmC9VUCzO3TkhVF+lrHZClH0XulC6ts3IuVDpqFspi4DyL94cQh7PAvW7+eFEUp1tZXl4U5RgRcRbDIzHLX978wF3/87ckHP2b13WXrVpcWvmpsigXmNFsyeL9WQxjDP0BS31uqeVCc2M4Tyb2X7al/e158+aloz/ZnQM21l56zV8Q8cSE0ds23X//vvfbftZ+4apr1ewXm749sKsPfYw+YM+ePTL6xsE/Z6bpiXhzptYypouLUme0i2JFmUoNwj0xrz1Zy2s/BvMkAMNEPEyESSD0qHrTUzkOjt6M+IHb79/0076+vtCVm73fe95oNCaPb48vb/3WrcNHX1A6+sPxtTJbp6bjk9pMEL/OwilImIBg39h076YdR2Pn/sOE1DNPPKWUEM6p5bUREZ7UTjp1dGRE281WarfbM5wwM4RY1vJItVreoRx0gvc67CVmIRLeIRyaFLAHxMMgOrWiFnYyRoHKlVYFEhzp03RzcDkIsph7lsdaJa3wEu61KihFnhOhrXfce8ddZy86e2cIvCPGbDgwD7HwKBONXzx/wf5tT+/Y09fXx9OmTeNuAnv3oS9fvjxce8opPPjyy7Zu2bqYxo9lZVFeqKV+PJkeZ0lPcvfoLDPc/RSHB6ZQZhzu2/DNDT8dGhrS9+ll8eDgoC9euPR8Mt+x8f57t3d7ke9907c+89ST254d2t+lZF1wwQX0la98RRfPmz/XFceTpvlqel5y1JOlBaZ6opslEomB436R+FI1NPWcwb0M/Iszxnny41X1sJoVgE2bP2vhrr9f//fDvw2JMTQ01HzimSeKo8nRg4ODGBwc9HMXnHuBExam5E1XzADsMBG3AvEBUvr51qe3tn4fmdXvD6iMPQdrEW+XKdXGmqNatAoq221OST3mWahLoJhF1GKoAGZEcDOkEhVPmMzhFpjCh4n4W0w+HkzbiXAsgHNhOJzUxLq35PSONMtTpxUWK4hPzGOUIM+oao+Ap8NSctAEwCa6B+tb3hf6B/r3Avje6tWrH5ER+itNmszNg8pH1i5f+3R/f3/rqN4U9fX1UaeXmAYBrLl4zaIWjS0r2umsVrv4XFEWucKbgcMJ6j49EH6QRX+amacS8dZb77v1iW6fq7tVdacX/f39vuqyVZ+xlI4n82Nu+NPGlm8MDOx/nwrofX19fGN/v1/ZaPDRWx6rSLJSU1m2zemTxnacqYUyJTVTiiqwUImFVZzg7CRU3H7PbY+vW7duZ/Ng+wYyOg6GMVOvCWPFmotX/CvREXnVB5Jxj74QNRpfGldDc5kmO8/hI0TEEugxRwgxyBSK9IuN9258+7QbT+P3CXH8d78IAD734Y+vao60Fhw4uH90bGyMAzPqWWYhr43rzfMvxBh7grCqOlk38Kdzxc5ihpBnEvNsMIvZ0ywSjdhUy56k9vnSbKqatktNpKooU+rQO48SpsXg9Xo99ozrfSOT2oNmaVlK6Tw3HWGWCTHIv2RSe67O4a522T6cxczblD5mZbkUKR02+AQGQZiGQNmPp43z1l9v2jR69A96zeXXnBZK/bTBTyxTmtBqtT9dlkW9SJpQXaFSFmu1vJa/JUH+RVjanMcnj8+P/clfb/rr0fdODPr7++2iiy7qmSLj/h/Jzdi56Gnqzet/PHDoA26A9N6eXH9/v639wlXXFkVxeqssLjT1M4y55e6uqYACloWsJ8/zJ0PMfypC4yBMMcS38gnxlvXr14+tbaxdlpJdURYluRYfd/IdUXhURAbbmf+bY8MHbMkTeqxnrVo5PZkdEJKaOZiEPBCPZ+Ef3X7v7T/o5vnhj/gSAJh10hlLW83mMYcOHyrLsiQmQp7VKI/ZWMzDXALVUzJTLalzCO1IxQhM4iwchchZwk4WxEqowmMOexGgE90xDlUqEplWozvrLOBO7BeFGIxFasR0tgHTzbyooLOeDH6CeQqFFycz6KySyg9Z0mmpTNM16fykeralcpKbn+Gezhxr0+yz5yzqWTx/QVy6YPHxC06fv4Q0XViYHq9WHrKEzxr5dAAls7hEYZGQizAzo+aE+WouSdO5I8VIY/78JcOLz1hw7KKFi05fNGfR8Tf9402vrL509dRejn/hoF4mmeDEP779e3c/80FbcFVlGnLu7EWfXHTmgnF/t/7v9wLAkjkLliTYManUZR2GYTcnIe8QwJiZM2J6nkFtYZ6ooG/ffsetrwDA1qGte5bOXXKqanlJqelMU51F5m+HELLc4/6//frXXv+gUVj318+Zc85nSy3ntIs0DW7zjfAGC7dDyHo80A823nP7j/+Y6UjvejCfOffj85LaisOHDqbDhw9TSgVqWYaeWg+yEJyYG3CfZJqSu5OIIAsRHDpU9RA8xhCzPHsry2rfoVwKQiB3D8ntkCX9bHKbX6Q0VqaSi5RQaup4PKrZsMSIEAJCjKAQQCSQjjWgGgsaObwG+FvkpFQ1ENUNE+A23lVbZBYBqMPfFA49IciLeZZ9nwjjSrNJVqbg5nPB9BhRONnJeuA4BsKPEPhUAGe4+7ATxqnZVDUTdSc3BYOaIlHrWf7zkMmzonIXBVvsqtOduM1EY6PS+tbAwEDz/cZUAwMDtm7dutDcd3i1q833Kg389o3fvnvbmsuuvK6d9LSiXV5gls70RC0IsYi8JUEOAXTQgWUAnohZ/nAWsrqRbETe3pO38+kevSyb9vlWe7TRbrfOdFPKY3iyVh/3zXZW3vHeCvgeZQsA0MpLV69JluaVZfl5wGawhJ0cww/ymOfEcsfGu295qnvh+mOG1ABAGG2O1ZJqrmZlCIGYUfl9zVCm5N2Lg2sH92ERiQkhBXDVHycAbTecaElnBuIhiPaAoeJUc6LnCTKb2aohWMdW651BZ3dMp2bQogCnEhIyeGAIBbADZuaqOmpuE9Bp6HH1tdTdD8OMYZUnw9yPSUiuKme62TgOYZt5ehFO14JQZ9DDImGIIyJxfBnAo65uksl5ZnZ8WZbBgSvU0xRLaJdlSW6GLPPewHSShNqQB/9vqWb/782b7zz8uz7g3VyN5r7Dq9X1TIUdDB5apdPrnd+TCQvlGf1rUVIA20lC8vOsXn+ESH4ihDNaWr6oSY8FeByInt408I1dq1asO0+5XOkljVjQw9byZGoEwFgC12o9P990zy3FexVP3cX4V42/qj89nOyYcYcvM9OZlnwa4NPc8YaZnUHJXjKkhyXSlWtW3HAfEW1/jyLmj7MFT6yNm15qWgBCwUwkIYBRSei1KDyVab6p1qjKiiF37vDQvTIeCYOZqcN9GAHzKyRcRcTBhZn3O2Gau082MzNTMnO4a0Xb75qbAJSpRGHaMb0LWLri164F1xVuVlE2iIiIO8anQNQB0MITwY2Yc2auE9GYgN8k8p1EvI2zoJGDBOL7mrH48d333f3G9me2v3lp49IdB/cfzAh0usHbRDQHYCLhmoRQZxEV5uOJsDcQvdHjvY+eNv+0NH/+/PfeuN/1Wn3pVbMypYvUfbY72sIySSAPbf72XUMAaOncpZPBmC3Eu0TkEEt4Ksbs6SntY2++5Tu3vDb95BNeGJeNW2KGPUKcTbLxmz6383Ptw/MOXFNB2k0BaqeimGWWTmCSw7V6/Y78mNpPLrroIgwODlr3RvyZz3w5/9Di2UsXzF08r0nNK3qzYpknm6amU90wy4HJHadsAcNx6kZq1sOOE5YsWLpg1vwPDw0NPVr8NnXLH7wAJ9QnTTa3uQR4iJEEDDWFlQlqyeE+nyXUYggmEgidyCimiowgEiDCRBSMmI4j5heYqEkAGREHQtscwR1zzbWl7mxqqPrPnZSezjiwtKpFwx3PsYhUtk2ARLiHhbLIIQTmgxy4JSxtJs6EcZhYJgpzxsS5sJiIjIrIDoL8DEF6hFhJJEmQTIT3bXjgzu8MDQ15X18fz549O3zlK19JS+ctnaXwM6H2Koh3Z1ncG7PsiRjDr2MIuyF4DuavknCdYNj8z3c922g03tv1p26c1crLVp7PTNcaYTwRJSJ5JcDv2vitu5/sVpInd257YcHcRc8WIf2qRnkvs0wl8R//07dvfaWvr497XuuRdtY+RzWdyyxvDGfyq78f+uv2/fMfuDClJEziQjIeTG0mOinLs521Wv3Wb9zxjT0A5Nprr8WFF16IvuV9oZi055pSdXlZFF8sVeeklBaq2anudrYTToR7wWAipswcVJ2pfXZSGyGidmCd86HTZmz/yj/90x9tEYZde3cNnX7imbtgPpdTGmMDW0WRAoeAGAJlkiEGgaNSQacywZSr/h13ELBuBqfMTZeo0g9ZQq+QuXGMRPY2mx8kopyoc4aDoTI6oTK1d5LzqDstsSqtKQQmZi6Z6HHyUKUXEbYhQSuTjM4E5GWYLwGrQAIT6BCDhoyQMdEkIlcSNmHOADKrgJtHMi3Wr19frlpx3Xla6IeTFYeNmEXo9SyrfT8P8uQtm2959fqV189ujrWvLMv2KSmlPRLprLWNxhP9/f173zsJeMd0HQ4Gat+mqDWNW/WN99217agGtq+4ZMUJkWP7jm/e8TL6wOjHAzc01rxu6vsbjYY89NBDNDg42L7mC9dMVPWlIjgweTLKgXsHmAa4HTj0oOqM/TzjbNgC7owSD99+7+3bO729NDg4CCLC88e9dFXZTueklE5X8xkMiDpKJ2dyKx3eZBKBwIToBRBOTUkLK90kyJ+o0ivMfExRP+bPr7/++lv7+/uH3+c8+e/oAwKIrKRqKFp6xB4iUSiGoHmMj0YJnxailJLCOt5e7trjlOAMmBlDuSD2M5xtp7u9TuAM1ZhujzGeI9BiAimBQM6VoZ2rKHtnQmCCdaYj5gZ1d3fPWOL3Ywg7mZExDGboARm7urrjeYfmYHoEyBCZHAZx85zJnUDqRBkz1wV4xRknqPsLBPJGoyH9/f269uq1c1K7uKzZbi0ozc5gohZT/dda4u5b7rnl1Xnz5mW3br71mRVXrPgmiDar6U718BvT7JprLl81UoWLu5HTJAC/2jSw6VedRbbzvWfCo94pyvPcvGx/AsC9jaEGDWCA2mbkRCcODAy8UE1Q1k4aK5oLNOk0ZT25GNYLrrzyyu9ee9UNz5PTbOHsp7fdvf4373Px0dVXrL6o1HK5qraaY2Pnm2N6qBBovwAwwdUXm+mYWhI4AUJZDPGJGLJB9XS8wy9w16kd3MCcZPoLIJzAI1i99qq13+3v73/pP96I7nRjqje2q4bJECUiRHF2GktJUWqCajXXDZ2wGgZBTUHWiXg3c3eruzE4VhowJjKAMoLuEObFRxT/1GlnmsFF3nHacUVNKFVBKSEFNhE5jYK/xiQBBgj7WElG5toL9xzwJjnViYkc5BwYXA00DYyMwU+A6CV4fB7cPjGMy59/T5OkZmpTyiItbmsJAU1w90/09LCvXbvu7zZsWL9z1ar/vZfKtxdr2fxXED5aFOVkh0d3YrhW52DwYyELF6+6YpUS0SONRkOObjr39/cbAei78UYG4JTSCQY6/7rLr3nstoE7XwTgxtIWTZetvXztVAhaZaGLNelZqjqsZi0t09xVl12/m9zGNWn0rwfuvr04ulH+ne/skYGB9eXVl1298tDoyP+9bLePc0BEhGKWvxJitpElHGcpNZ3SBC1xqrk3HV6loIJaFISEaI+DtjD4YhCeIsIjRKiZ66gnO56I/2LNn133NJL+cuMDG59/v17n770Azci0UrUgZBlqPT2IFAFStJptLltNL9oFAEMt1hB76ggdNYxZBTQKMQLuYIc6fDpgewIFcyExJ5HAiZT2MeEYvKNZ7RiVKmEDqGPYsNShazmYyQPzjNSWwkPl/9AizdZUjnO1JTCPwvaMUPgZk+VV3B4AotKZ6g4/uOHBu+476mc+2P2Pe++914iIaqW/2YQfVBiVqSgK9ZTUcnN8oSja8xqXXr0rtd54g5KPwfCWg8xNlyVNJRwChxFrJhIDu/2EjGYC+M3kyZMZgL63Edw1I72w9dkL3D0Zy4cajcbLAwMDJu02GYso9Cwr0yllkeYkU4Dc3H1ZKtLOLPI1Dhnsila7zeHly5eHLVsGy9WrV08deWv08pHRkZOKVnEwBLFarVbPmV6XEMdz4IeJeWZI/rSpTU9VQyIRKIApI7gTx3EhymvG5S1EaFXcHQLMiMxTSVoSaC4Es9b82ZrnT6VTN/cP9Bd/aAXs4sjrzNVorQMJ6hAS1FNK0i6K2NbCk1VpHtT1jyhgZQWmTEkry6WpkWO+K5MTZQC1iLCfObxFjheIkHVBCVRBpo+Mi4m7BKzKa2SdIMGUtKe0cplqiq12+/yiKC4q2sVH2u12VqYkSelkYh7PIoed5U0wvWlkToEOpYDvd9+czmjuSIAKEXmj0eCvD2x8jUm2MchSMiqKglpFy5qjo8XoyNgZo82xy5pjzUvbWn7G4VcAPt3go0Q0zMyvici+EOMhyWgXgdpEdOYXG188df369eV7F1+nWvkLQy+cp+bTSvODrrZ4nNU+C8ApZgUJtct2e2az2fxUmcoThAV5lu8JQtvUbXJpWrr72euuXnfM2rVrJ1133ZeP7Qpc+9b21YoxfLRQPV9TOkhELhLHhZgVMWTPUEYPewxPUsBUJnqBWJoSs54syydxjHuEZIeDMnK3IGwxZq0QMmKGcCf3xJnIyVmtHPOkbU065/ni+Wuu+fw1kzvP+Q8bxZ1x4pzz2dPFYLQzZgocINShYiXtSSl9jkynMEvKYk55Hqs8to4/MnAAZwExRg9ZFrIs7o9Z/s2YhbG2ZBvv/vbdb6y+qHHNWKu9utUaW9xsFa0iJQasajwzAYHhJOgKuBgAiyCPGbIYKYsiDLJUJi7bZZlS6QT3LMbeWp7/pCfLH2pFvXdgYOAQANzQWHWGTO55+ejQmN+mX8OWPbUn0xt3HTh8+LyiXYyJBK7VckiMHkVMQsiYWMjcQFBmbjPzt2KIw2AU5P4LcpoEwnma1ElojJR+IXU5tPHuje+ay65rNCY2NX6xXaSJrlpS4JBLaBrxhs33b95z3ZXXLR4ePvQ/RkfHForIaE/P+F/XerL7tdTZZdL/4k6/zOv509HpJWM+TT3lZrYtQV9lyPmtdvOaot06VlVdQuyJMduVx+yJLK+9QeTmhFpSTVamlhk+CsYkJn6TOTxL7oecPAsSjJycqtA/Ife2wYScgqVUqCpZB2haHd0liyCOU/P/MTw8PIYBYAC/e2wXAGDUerf18MjnxJyKlFAggQ1O5DFKeDvL4h4J+XEBXAJEaorSCcLdEqoIxhXqruOQY/LooD13f/vuNzqn74LZIzExCUDWiZPqmphIKrQbusEqBAF37snkZlR6SqQpqaaSXJWq8zR7JrE1aeaxG2+66aau79e/MbBp1+97LulUqbHLPnsZZSJk1e3fY4gcYyQRITiSlim5KSRKCODv12rZnozLTblOGb35nysv8zV/trpGIguLdnEswb8qY/Lday695sNRBA4aibH40VgRLjJLdXd1J1sMx7Nmtp+achgATvKTnn5adhwmJgkhjM/q4bsbBzbev/ry1Z90aBvuooW2OdL8sl00i7L8dDJdYW4O19Lh40KM3tvT84sQ4iOS569mdfyQhim23C5WS6eVpX7U3U9k5oeDhMfymL1l7pMK00TqlpJlgT1nz0oHDjv7ieQ0CqK3WWQGEZJahSsgqhDz6uT8tk4deHBg+A86A4o0a3CDdccSBhgSCOJEHoJIIBavMG4OSwo3gxI6brfKeKTkCFCoB6rWL+oAsOrixqmqeoaDn5IgpwUNrGpepkRuCg8B7IZAAUSEogNH8o6VM4BBVV8KmpS6Y7wsC57H/CdZVr9jypQp5dHD8j70cT/6f6s4093pxhtvpJd2vnRyarfPHWuOIY+xlcWMhCVn4TESItckmpTKVFbWU0Rz5uSq4bXDBw82m3t01apVvSllE8VtZkVo4xE3f65UNTG7sEw2A+5ls21/CS9LdR8jxwnM/HAm2Qix/GTTjzaN9vX18UsvvcQxxTt767URiEzz5LZu3brYfrudhPh7JlaAkSW1VqcttZvgxzohMHGvBEHM46/qtezrG+/c+LOjf+YvNr74s6b7ySVSj5tPVOinPfkbZvYUc9jtqfxTd3qd2J/iILsd9OMa41DpcnpyPVw3eb0d6QwYl2xGXJYgJiaQqurSEuXaq79w9Q5m3r35/s2P/S4BKwHAjBnzpmSe/m9MXPKRmwFA7iygMRZ8WljmMlHTzbjq01WI/CCEPK+hlucVli0Gy2Ks12q1X9Zq+RPEYVvyNLdUneRuB838M62ymDPWbLda7RYnVRAzsjxHXusBmNEuSxRFgSgRveN6Uc8yh4M0FWgXJUzNYgj1ep5vG9/Ts3HD/Zs2/0daASsuuryv1WyvckItz7LvBQmPmeCgqZ+iRVreLppntYqi6WYQYYlZrOd57aUsZPeLiKtTyQKAQmDimjtZZRe0skg6ZmVxkSY7SzWNmqkzUSDGuMDyRC3LH5LAP7vjm3f++L1qk9WrV0/lUf+TZDoHBnF2EnDdid3NnYSSG3nH61Av3LYENkWQGCS+esddt/2iexM/msKwpnHDqiK1Ptwuyi+klJrmXq+ibblFjknE/Fa9XvuBSPjhHfd+47u/73Ncc9Wa07VZ/LmZBycKzv439zx4z0tHFYP3r4BZ1lJvZ6PuniOKhw5Gw11h5uSGMa1ouZVIgI4kKQHOiORV+mzgDlrAyGHBiQ3wPzXz/YC3hEMPMX4cYOOlKE8kopa7sVsnzdG9khOUBiu1alQ7IMQZyEvtNNIEhEhCIYQmU/w1AFzz+WsmO7mkejpwlF/3Az95XTnUys9fdcHoyOErm0VzfJ7Xns5j+PnFGe68cmBAV162coal4qOmRrBEgalHmPYH5mFy36qaUkrl/OS+zI1GOHBOIT6Vx/z5yNJ0iBF0loNOUvhBcwOIa2B+k5gPEOEACVEMQd+P2nXHHXe8DeCBlV+46saiXSBmMZda7U5nH/akl5nZJBKGi3yvHuOrmzff8ur7zaKPOmp0lc93v7jz5alJdbsqlmppreSlEjgjokMhhEllmc6UEH+87up1xwwDiKn8lIPG1SeHzevXrx97b4tpaGiINt6z8fnrLlm5seDiEjLaKQfre38XmiMAkBdeeOHQKTPm/ApOn3fzwwnUbcwZyDM3fxzwOUQeCezUSYc2NxB35PbUjYAygCOqYGTsd6aHXfFREIkzU2BAjbdJoONYmMTkSKiyWbVjmiVAHRQAcSIGvVD5ZSsBl8EqO6b6DPPyojWXr3kSqbhQTXtqpTyzvG/5xsH+wdTtj72fT6LrhWWyE0A+mUEeiEcuzhp3XjlwpS5fvjz0Htv7hr/eHNAg44WzU5j48ayW7xQJBwlwBeeW9CAp6mppamlkkny6l76gCGkXkQd1LHIgYxINOSWR7NE8hqdNdVTLslT1iW1up/f7sPT19fGePXtk7I2D22MIH2am7aMYHRq4Z0BXXbbqp8RyDbGX7HTaLZtvebivry90SQ2dqmfvM6Wh/v7+tObqG36d1fLpBDrInGZp0ulm1k7JQpnKFkosJPI/sywuZoCTemRHbB/2L36p8aVbbx64eeR9pPl027c2DwE4ktC4gTb8Tj0gA/BJPcecAvIzHV6YGVfI3i56xQXkiwDirp7ZulJ6YsQYkMUIFnEJHJnD21kWfymM3Ru/c9+3z5o7/6NgBOFgRBCDHSpTmm+dRG6RUOVFWaevWFbrJQ/R6/V6LWbhux188KlqqW1mTG5KxJOZaI+rnaJaqqm1iGj65Dcmnjhr0dyhgYGB9EGBgV0BwZJ5C2doWZ5EhBl5ng3ty5/9waNDQ+XLL7+MLVu26OVXX7nj8NtvIcbMa7Xaw2D7h3x48k94nC1y8CSA97rjDAemmltT1Ut17U0pnZ5KnWnuWp3TKGYx/nxcz7i/ph69mylMNtPZqSzPI8i2K46fuuvYc87xo+erg4ODvmXLFtv2zFNPL15w1pOnL57165tvvtkajUamrAeEZKYnTDTYsYsXnbPn7/7+q/sajQbdfPPNHxgQODg4SAB81twL9uehnBFi2BVCNiosbxDjJFWlVCpMEznRaW4+XTUdUE2fsiog4XASW3D+R87d9pWvfKXo6+vjCy644F32h/f8+/dbgON7jpnl5GcSqOlu7J0waKvYL8JEc6liSnc2t0omLiAEFoQYIUGIiVxEMmF6K0gYXjxv7kwnHGcGCkEAh6t5nsq0wNSki608QhM0h1YB4MhqET21GscQnyPwa6Z6uqkFN3MCUxAxJt5G8EMGF68gXG0mOSlPNG3p7Pkzl85buGzJ7EX05DPb9x09QO8+tKWz589NKR0LIGYhezTX2mOPPbe92b2kXHjhhX754kVDI5CXE+me6DyvqBUnwf0Ec2bAAhEOgxlwTBWi3IDg7k04WlW308FMLMIGor2BsglWpOlluzjfoKeL8Futib1PfPXmmz8Q7L1t57bR7vc+NDSkQ0NDadn8JXPN9Vh3RAr23GVXXLZ3aGiIPuhD133I69ati3fc8fftrTueeHzpskVP556/BWG4+ilJdaqmpNX3DGOSaTA/y9x7nHAy4C04DXuh8+Yvmf/s1772teZ7Ft8fPAlxAGCxV8x8RMXCOwKyavE5aBTuWwT0ccDH4GA3rbTKbMgsVJWysr8p4OPVfUrpVpfE5yfHKBPZEScBeXoHhoQjQoRuT4YJECYLFOpgfooZr5uTMtMwE44RloqP39HEgiFsAERMWCay+HfTSPiN1NONnjxnwY7fcglThx8D+AR1p0PvgkR1zi7z5qUN/f1bVn3+ssUl9BNqfsANycWswoXJKzHw6zFkJzp8UTIfc8MpZjbe3EsQyNRSgfJMS7a21Wy9SG5z3fU4AMPeIXz9tld3u1u3bl1sH2gvcvPS3SeQkymsGTRc2N/f/9jv6Pn6ypVfntEeHrt+zVXXP1wQbd2w4Rv7ADyyesX1pYgsCSIzigp/jsCxxoJdBD4A98kMzEKVQtjkgo5h5b9ac+k1v1aiN84IxY7+zmTmD12ABgAv73l250nHnf4mnKYboQCMuvHvDAWYUzUtq6YWpg7V6vKQ1GCaKlIWWNy85WZnaEpbjcIbBA/KnDPDncjdUK/cTV0g2lF8Qa/mysICEq5i1M3bBv2QmU1x89IqoEGF/4WPETiRMzlJrwT619u/eddPAeC6S6/+TgIO3/7gndsdTtT/DqOkcwa0ZN6CY5w7TQDsAxunjUZDqCwLtGnUkwUnlG5wYkKIXOOQjYFlBwGPG6gnaTpFS5vlsNNUvQ14r7vVSk1zzGwuwUeEOY/Cv4xCaVKetX8XOLLRaNRbbw6vIOeFxCi0ClFpCggppdrKP7v2L7KMfnTbnbe9cPThv2u53PfcvkmjOrquLM050EUZpNZoNP5l3rx5/urzbw6bjR3mtrRDDJkQS8zi03le+wUDFWrYfas4v+LuuULbliAC+hMihOfasmflZSt/XYTi0Q84f/42MUJH+e5cI3N/N86jKlzkzh083ZEtU7uCGLUjGPJKQ0oK0CQ3nOakLSPqFdi2lKjuQi13nE1MdRJukXaE9/6OVbOCmjrDvQ3XU1Kiy9T05FJLlFqSqYOZkJRNUjqXBUNO2McG84Knrlu2Lk6/aLr29/cPHilmRwlR+tDH/QP9ev0ll4xvpzQHsN3ENAJCVpYlvV+juvOGPr3q81dulrx9jLucq+Y9RGGMJUwTyL9uGNjwkMPp2sa1x4UsX5kII876BNxa5nqcqZ9hZi1TnUzqc4mwlxjPwTjb19ZFAH59FFTo36hbxrfj+S3TRXDfFyJnHPgZN8wGAFMQIZ2uJfcA+Op7b579/f22dsUN5yVNntRa4vQGZ3J2jMf8vL+//wCAXauvuuE3Ijw7i3EZEQ/XsvxhlrBFCMNOfH4Nuted6mZJkoJdtZkMo3BzYZnEbpdjFM/29/fv/323Y373Dcn3WjWkQPcfIjKqzjXPGbAbQF4lzPAR2mOHlwtmhrAQM0nVrfULzexTcOtxVzdyhyFj8i1CrCEECiF4ZAZzR4AqDGHyIGLC5G6uqulUTSklTabdaqsJZmbudo6qHgOHumnbwQuaMw+d2rVOvq8bDf227qKLegqLa5LpMQ5+Lgbeziyj42vjy/c7h3Xf0E3/cu/Wzd958Cc9PXJ3FkMZRKYKeOsYj/2m++c2DGzYm4/IP4SAn8RQe6JO8ebJ+YT/V33imZf1jhvX39PTc0etlt8Wsuy77KFpbtESFv2uN6vk0uDeNk+ioHqZ2Q8Q7GdM3OvsZm4HyuRTrr56zblH43/7+/tt9TV//smk5YVFUc4w008k18zs3UWKnavYG+EsZLJVWB6+455bHrz97lt+iqz9tXrIb7as/lUO4eEYs+eDZFGCTGIJE4mkF+C3Puj5/a4KyACsmbf/ta7ZgoosWX2RTvUjAjU7hA3+N51s6hLu2TlGE5YmEf0IwDR3/wiD9qMK8XIwBJADwr4tC/EcImqlMqWurpWcDIRYpXcHEKOomFuewVHAjan7HVXfpzqj5q5MzkiuZXT6EwDPvg8pgfr7q8U3muK1KbUWJtO5YHqdJT4eMtx66wO3Dv+2T29fXx8/9NBDfMvAwIvXXX7NJgMuPOXtVzb1D1b5bt0J+frvrB8D8ND7fIknATy5prHmRFa/wdyjwZ0hzd/JziXJiDTAoALPC7MMno0CYGF3B41joUmkPLnRaEie57V2u90ah3EfbZXtz5TtcomZLiQmF4TnANo98T0ucU54EU5nkmImop++cuWXJ5xxxpSx/v7+o/0v365AStfPDtB6WZQKQiYIL/2u5/fbtmCEgnKXo3B+RzZhgN3FnfYAmH4E84cjVDaAmEhCCln8Z3YqmOmQmr9FwDgA+5iEncjZCWCOWeRflqpNEM0VDsfAoSRszFwzxz4CvR5Eeplpt4OSAIuCyLGU54W7ORMjsGRCvIMcNTAyJyRHGmcp4w+a+qz61KreYR25rt0eW1mW6XginpTlIY+c/WTjA//89u/Ce3RJ8gDotor198L73AA/qPUjADD5hcm8fmD9a9c21rQ1ea0DBZUPqhzdhq8QvaKgYSaqO/yVE0MY2acuBIJwDO7YAkYEwot19F6nbUzjRNmwts/SlOaaewYyFcjTEuRNMB57q3zrcF+jL+sf6C8MVrhhOtxzNZtamp8YrL2ov7//F0ej2N7JF+l/5oM+K39oBawABdEKVzS7W7Md3SBhZzN6CoEWWzUDOXKH6GJ4QQQmKSRQSU4TzdKYg74P4UyIKulCh8YKkpyYHiGh5zRhKjGVIpIL87C77yGW/STEXF1qphhhH5OfoBoWElBnpqaQPBpYXiOm5IRxIC8F8npS/kn34P4uFcqyZaGZNa/RdrqkLNPJZUrNGOQwITvMIs9Ug5ZuFuHvfL2Xmezd1s3/9tn/LTs0fvTTTDSd2b8dKBTtrD2yYUMHfgTo9ddfP748UGZu7kZGmXuJD8gx6R7oN3zzrp2rLlrxFrGfCDD2jtYmZ1yeZVUbYXDjfRuOVNyVV1372bIsphal/qmmNM00NRlccuBATKMQZmGMDdw9oJ3jPDxZ7rDMAIJZKMvWKQH06dUrrh/t7+9/4igwu78fWfXfI88PRxe5V1999bWZJ5yxxcg+SkYjXXgqwaowGkLucHYi7WpWvBJCd3btbpeFGI7C3cmYsujO6Kieuzs+ExsC93KiMRY9xDHGmId9p9bDhv4NG1pH3+LWNtYuU9KJIrWzHPw0YA8B0AioA5m7EIsRMUZvu+/u37wXidF9MLuPPZaPJZ7uoOeIeK4w94C4JUSPl5oyALhx+QWCQejv+SDfVfE6BFJfdeX1Z5LZJwqzg0j4c2bPWMPulVd8cSiglATSdCDNK60MBBRQKpXS9HWXrZx+44037u3v7/+gLYycPZBRIvcpgVrLzWgKQTxQeLOvr4+HhobCwMBAyeZjKaVzLOmxlvSwu4uL9xBxm0WeACCqdObaq26IlrFrYSeq2ckObjFTBkfmjmNKqImHKUdPj977wfgjSPLf9Uzr1s0FrGQxcJATPKj7WxloOxxL3anZCfhCMkPSpKbWk8zOCkwPle7HmvtnSdNzHrMt7p4Rkbs6qSvAcDhbhf8FEWgiOT3av2FDq4uSPTLOGdiwpbOFbTkmCv/Dnfcc+D25J++NYyiu/ULj/lot+whgJ5YlncTMIxRDQGlDALxzlvuPvJyRjk0J+4uyvUzdZ7lTi+A5EeVU6dUAwNj9ZRb7GUPabnTCCBXHENGe35Y0REZO5OTmbXebB/O2iyIhhU5AzJEPD4ECgb2iVXCNRd4IMTzBJIW5BXY7Q+Hz0Da4IpmlJgFDIjLZ3CYR6C24tQA9v9FY99jAwPpDf2xfcHjvp5mCPErJ57h5hcJ510WQkrsnIoiiG2rrUHUkTUiaKKU0QYXNTRea6QwQjQ9OO+HeVoCdKIm7q2qsui3u7sSqfoiTLbj+khXbhoaG3vryl79Me/fudQAYZ/nS8jB2bBrYdKi7mIaGhmjevHn+0EMP8eA7i6YDDIF3nfyrLm580gm7+/v7n+m8sdsBbF9zyWVvhCIuNHhbmHuZhK+75JJ5pWZnUw89dMfAwO7fNUh/v0bx9Y3rP5RS8bGUynNK1XNSqW2HjYOTAe7klaWVmDwQlhLJ6wYdEqLRqLxk+fLlT39A3i4BcCY3MyeQs8NaZmiBuZfc3tVSUyAT5qcRcZw5N5noZxz4xSxENUMNhEJd267eOpKGRMTE3mKXH3AFVRZmyhhMMQrjP+H1bxbg7peffenEE05PDs8BduOuNAvO7sGAtwgYBYy9A2gzN7iBVa0N9xllqX/pZqymBxmSa7Dz2MMPAKt7mSZr4EAs+2BlrDIvfYysmJ5KCc6yJleh/a/uo5zETU0LlD08jv/0kkuu/5ulS2eOdqqDdUZr6foVK04oW3TyaYtnPUr9/Wn58uWBiNKaK1YssiKtYKOH1i5f+/LQ0FDZh05437f67191cePJzDXH8PiXdKaKHdLLzNPp3OaTGo3G/yCi4g9ZfNddseq8IhWfabXaZ6dky8qURq16c5XNQVIlEXRchcxE+5wwjolzYkpM4dT3O8R3v/7qS1dPhZbjHZZMtXT16OSLgbA7q2UfbzQa27s+EQZEQniJzO4AWDigRRRaDGpSRgy1k1ytnVwLU5CzExNDKLAz5QwnByURHidGP77jzn84+J8GJ3rXjWtgXtZu2WIn73mnM1wZdhkUIrCPiOeZe83NzAHKmBHzDHnMkWWRmDk6wG5OEKKYZb8JMbK5FQ4PVd4qtcid3b3QMn1c1T5kZie72aibj7pblpKFlNLUlJK7O/eK8999/WvP9vX18UODD+HCwQt97ReuOqUsbY2nNPfAnrfmL563mL/1g+/s7uvr45dee2U0p5gx0SyaHn9+5513loMYpEEMGgBse3bo4NZnn35r68tbddu2bcWCM2YVIPoQO/1w1uIFz79nyP7bK98Vq5e2i/TlsWbxJ0nTaapemDsTQAIiESIWIWahwIyK6UnfIpGnRSR2NEHFpLps2/rMM62jq9ng4KD/10tXTy1U1znQY+amZr1m9hEn/AmYt2chG43jznxk69bBtHrF9UvdfXHSlFd6EToUOExCzO+TvPypo9wKCbuF+XiCTDIYMyExCVFn1iAsJuDA7Adykwe3DG1pDQ0N/dErIL1PY9pmzJizwKxcbaYj9k6AAwKAjFlZwodSKheXZVm6gfIQMX58LyaNn4AJ48chxszgTqophBh257X610OML5jaJ8uydDJzE49E1Fa16ap2icOMwHVhPiAh3EEAm3qmpisBB4n8oJ7HXZJh0+333vsGEfk1l19zGhWtq4tSTzfTqUz0YhayMQrxwU3furvbGPZrv3DVn5RmM1hqP7zjgTveXr58eTg6p+PoirP6oks/GurxmdsGBt78HVsw9S1fLv2Dg+mLjWuWHR4tvtxstZerWuaEQhCIOrsWHUkPqYDGQTgT5mdDkB+FCh/i5GruGEeEX2948K77+vr6+MYbb3QiwvWXrJhemq8xtV4lb7t5DvOV5shBVIYs3J/X63tHMfnvBga+2lx51doLinZxeVmWHyewhRCeCCG+FrO4c+Ndt2x8l4j06hvOheFcMz1Rk495pSehwMEYiA68sfGeb3wN/0mv993XVZE7eQD4yBmwMrISgUJyopdAlBHBhQEJjFAxYpxYmFmeJyIVligh7IoSDoZYe0aEnmEGnLwF4kNOFM39805q1aGNDxHTT9FJxAWj7e4td0wktxMdPMUQTu0uighMV/UzUiovSKofV9UFyZMCel637XJEw+r2JymNXr/60tVTO2fGd3WSjohAv/PAL24bGHjzXWKED7hs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",
            "x": -0.6,
            "y": 0.03,
            "w": 0.36,
            "h": 0.31
          },
          {
            "img": "data:image/png;base64,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",
            "x": 0.24,
            "y": 0.02,
            "w": 0.27,
            "h": 0.13
          }
        ]
      },
      "shorts": "#f2f3f5",
      "trim": "#1c2f6e",
      "shortsStyle": "usa",
      "gloves": "#2a55c4",
      "core": "solid"
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
      "damage": 25,
      "cooldown": 1.2,
      "speed": 0.32,
      "size": 15,
      "knockback": 300,
      "reach": 40,
      "koChance": 5
    },
    "uppercuts": {
      "chance": 20,
      "close": 34,
      "damageMult": 1.2,
      "critChance": 40,
      "critMult": 1.8,
      "onGrab": 75,
      "counterGap": 0.6,
      "counterKnockback": 260,
      "setupMult": 1.3,
      "setupTime": 1.6,
      "guardDrop": 10
    },
    "hasKick": false,
    "hasGrapple": true,
    "grapple": {
      "damage": 35,
      "cooldown": 1.5,
      "speed": 0.45,
      "reach": 6,
      "counterChance": 15,
      "finSlamDamage": 20,
      "finPunches": 3,
      "finPunchDamage": 10,
      "sprawlChance": 40,
      "reattackChance": 50,
      "vsGrapplerChance": 100,
      "shotChance": 15,
      "shotName": "DOUBLE LEG"
    },
    "hasPowerPunch": false,
    "hasRage": false,
    "hasWatcher": false,
    "hasWeave": false,
    "hasSwing": true,
    "swing": {
      "damage": 30,
      "windup": 0.5,
      "extend": 0.35,
      "recover": 0.25,
      "reach": 55,
      "vicinity": 90,
      "aimError": 12,
      "blockMult": 2,
      "weaveMult": 1.15,
      "cooldown": 6,
      "dizzy": 2.2
    },
    "hasForget": false,
    "violent": true,
    "blockChance": 10,
    "hasSpecial": true,
    "special": {
      "move": "allamerican",
      "chargeTime": 35,
      "hitCut": 4,
      "punchDamage": 25,
      "eagleDamage": 6,
      "truckDamage": 100,
      "dazeTime": 1.5,
      "thunderDamage": 20
    },
    "gaethje": {
      "eagle": {
        "first": [
          8,
          14
        ],
        "every": [
          14,
          22
        ],
        "max": 3,
        "warn": 1.4,
        "swoop": 1.2,
        "width": 34,
        "damage": 15,
        "knockback": 1100,
        "wallSlams": 1,
        "slamDamage": 4
      },
      "golf": {
        "duration": 15,
        "club": {
          "damage": 16,
          "cooldown": 0.6,
          "windup": 0.3,
          "swing": 0.2,
          "follow": 0.2,
          "reach": 60,
          "knockback": 300
        },
        "ball": {
          "every": [
            3,
            5
          ],
          "damage": 14,
          "speed": 1700,
          "minDist": 150,
          "cone": 35,
          "grace": 0.5
        },
        "land": {
          "damage": 10,
          "radius": 110,
          "knockback": 900
        },
        "hat": {
          "headwear": "trucker",
          "hatColor": "#1d3f94",
          "hatLift": 0.17,
          "hatWidth": 0.78,
          "hatLogo": "data:image/png;base64,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"
        }
      }
    }
  },
  {
    "id": "c-khabib-nurmagomedov",
    "rev": 10,
    "builtin": false,
    "weightClass": "lightweight",
    "name": "Khabib Nurmagomedov",
    "base": "Grappler",
    "bio": "\"The Eagle\". Built on the Grappler base: grabs on contact and slams into the wall, plus quick 5-damage punches that charge his special move extra fast. Grab someone from behind and 60% of the time he suplexes them over his head instead. Every so often a bear climbs into the cage and wanders round: bump into it and you get mauled in a cartoon dust cloud, unless you're Khabib, who knocks it out and throws it at you. Once a fight he pulls out a military phone and says \"send me location\": he blocks or slips anything you throw while he's on the call, then the view cuts up to a Russian space station that fires an orbital laser into the middle of the ring. Get caught in the circle and you take 100 and get thrown into the cage; the blast wave still catches you for 40. Special move: Father's Plan. Future look ideas: a papakha and a cauliflower-ear mockup.",
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
    "hasSuplex": true,
    "suplex": {
      "chance": 60,
      "damage": 60,
      "cooldown": 3
    },
    "hasPowerPunch": false,
    "hasRage": false,
    "hasWatcher": false,
    "hasWeave": false,
    "hasSwing": false,
    "hasForget": false,
    "movement": {
      "after": 0.6,
      "press": {
        "turn": 4,
        "lead": 0.1
      },
      "cutCage": {
        "weight": 0.9,
        "fade": 80
      },
      "sideStep": {
        "every": [
          6,
          10
        ],
        "time": [
          0.2,
          0.3
        ],
        "angle": 55,
        "turn": 14,
        "gap": [
          0,
          150
        ]
      },
      "cageShots": {
        "near": 30,
        "within": 40,
        "rate": 2
      }
    },
    "hasSpecial": true,
    "groundElbows": {
      "on": [
        2,
        4,
        5
      ]
    },
    "special": {
      "move": "fathersplan",
      "chargeTime": 82,
      "hitCut": 4,
      "punchCut": 7,
      "walls": 4,
      "wallDamage": 12,
      "slamDamage": 24,
      "punches": 5,
      "damage": 24,
      "shellTime": 5
    },
    "blockChance": 10,
    "knee": {
      "clinch": {
        "first": [
          8,
          12
        ],
        "every": [
          14,
          20
        ],
        "range": 16,
        "knees": [
          2,
          3
        ],
        "damage": 6,
        "gap": 0.42,
        "escape": 20,
        "grapplerEscape": 8,
        "knockback": 340
      }
    },
    "bear": {
      "first": [
        14,
        22
      ],
      "every": [
        26,
        38
      ],
      "max": 2,
      "wander": [
        9,
        13
      ],
      "speed": 95,
      "maulDamage": 30,
      "maulTime": 2.0,
      "scrapTime": 1.4,
      "throwDamage": 32,
      "throwSpeed": 1100,
      "knockback": 1100,
      "wallSlams": 1,
      "slamDamage": 4
    },
    "sendLocation": {
      "first": [
        14,
        26
      ],
      "max": 1,
      "dmg": 100,
      "waveDmg": 40
    }
  },
  {
    "id": "c-max-holloway",
    "rev": 4,
    "builtin": false,
    "weightClass": "featherweight",
    "name": "Max Holloway",
    "base": "Brawler",
    "bio": "\"Blessed\". Built on the Brawler base, with the most strikes in the game: combos of quick punches off both hands instead of single shots, and no opening KO Rush. He gets better the longer it goes: his Blessed meter fills with fight time and every punch he lands, and his combos get longer, faster and heavier with it. Sprawls 70% of takedown shots and won't follow anyone down into the guard. Against a striker he's beating he turns to the commentators (\"Count it up!\", \"I'm the best boxer in the UFC, baby!\") and slips what they throw. Once a fight he has a flashback to playing an old fighting game and comes back button mashing. Special move The Middle (\"MEET ME IN THE MIDDLE\"): his real point down, from the Ricardo Lamas fight to the last-second knockout of Justin Gaethje at UFC 300. Featherweight. Inside his combos he digs to the body and comes up with uppercuts, and one that lands sets up the next punch upstairs.",
    "color": "#0f9b8e",
    "label": "",
    "imgData": null,
    "look": {
      "skin": "#c48d68",
      "build": "lean",
      "bodyHair": "none",
      "hair": "coils",
      "hairColor": "#17110d",
      "beard": "chinstrap",
      "beardColor": "#1b140f",
      "ears": "normal",
      "tattoos": {
        "armInk": true,
        "armInkSide": "left",
        "decalNeck": true,
        "decals": [
          {
            "img": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAlgAAAD2CAYAAAAK7/lrAADT1klEQVR4nOydd3idR5m3b1u2Zbn3bsVWqhM5vTfSSUhCAiH03gl1KUtZYNllgaV99N47AUIKJQkhISG9N6cnsiP33quKvz/umZ33HB1J59hyGvO7rnNJ5z1vnXfmeX7ztIGMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjKce/Z7uG3g2obGp+Sm7VmvLnKfsWhkZGRkZz15k3fTMRP+n+wYyKuOpHDAZGRkZGc9OZF3xzEUmWM9g5IGTkZGRkdEdso54ZiMTrIyMjIyMjIyMPkYmWM9w5BlKRkZGRkY5sm545iMTrGce3gx8F/hI3JAHUkZGRkZGRNYJzw5kgvXMwLnA+4EvAJOBe4HRwCfjDnlAZWRkZGRkXfDsQS7TUAP6oGPvD4wEJgFDgEH4DjqA5eHTHxgOHB72GwC8NZ4gp8hmZGRk/GvimUCusg6qHgOe7hv4F8A+aI2KpAqgDdgQ/kYr4hBgGtAJXAQ8hG7C5cCvgVc+dbeckZGRkZGRsTPIBGvX4BRgILAdCVM7MB9YF/5vAKYDE8LfkeFvGxCnB08C/wReAtwC/AF4SWNTc55BZGRkZPyL4ZlgvcqoDTkGq+9wGHA8cBq6/DYAi9ECtR7J7ChgTPhMA/YGDgRmAeOBJmAZEjSA3wAPhPNeCPwWuCAPtIyMjIx/HWSZ/+xEjsGqARU6+R5APcZStQObwt/+aKXaBiwNv+8VPsPD7/2RaM0CBof9B4fzLQQ+DDwSrvNP4C7gRiRfm4H3ZUtWRkZGxnMbzzRylfVO9cgEqwaEjj4MSVADugE3oWtvGzA0bJ8MjAu/bwS2AiuRGPVDIrUBLVtb0fq1P3Am0BrOtQ14b7j0K8L/PwFWAc3ADOB1ubNnZGRkPDfxTCNXkAlWLcgEqwY0NjXXIWnqB9Qh0RqBxGoAkqh1wFoMap+MbsChwBbgTqAFyVN3eD6WbTgVOAN4LGz/JlrMvg6sBk4CDgBemjt8RkZGxnMLz0RyBZlg1YIc5F4btoe/DZj1F116g8NnIGYMLgaWhM+96NbbHXhV2PY48HeM1ToC2BcJ2DzgUIzHArg0/AbwI+AK4DzgTehiHIBFSd/e94+akZGRkZGRsaPIQe61oT9artrQ9beBRLpAa1YjcAy68AZiFuF9wP1hn5nAWcD7wj63outvCZKpTcDlwPUYr3VROO5udCmeF85/Yzjv9Mam5s/07WNmZGRkZDxd2AHr1Wt2xX1k7Byyi7AGNDY1DyBZrRqQbHUi8arHuKuRpHpXa5EobQ3fzwOOIlm9ViPx+kWFy00E7gjXGRe2HQ38FQPp47b/AF4HXNraMudDffCYGRkZGRlPE3aAXH0IQ0tWAi/r8xsqQ3YRVo9MsGpAY1NztPh1drNLPcZbTUPr1FC0dD2B5ReWY+HRvYHT0ULVAVwF/LLC+WYCt5NKPIwFLsaA+N8Dbwn7/Qk4DmhpbZlz8A4+XkZGRkbG04gdIFcfwBCRrZhEtRXDTU7p6aCdQSZY1SPHYNWG7dhmDeHvdnQTRsK1ldTBBwFTsIDoRHQB/gl4OHw2A69Fa9fLkEDdiK7AiLnoQjwG+Arwbxgkvz9wPlrIPojkbSnQ0tjUvKC1Zc60vn7wjIyMjIxdhx0gVx8G3gVcB3wO9dBmTIY6FzgS9cpC4NN9dJsZNSBbsGpAcBHWo0uwH5KpbegqHIHuwaFoaZpMaUmHwVg09O8YSzUTeDkwGy1ZDRh/9Wfgb+G4WAdrdbjeW7H6+9vRSnYH8O9oJfskZiluBd7c2jLnoF3SCBkZGRkZfYoaydUC4Fr0kqwAPoq6ZiupmHUD6o06nMSvD/vesbP3mi1Y1SMTrBoQXIRFwlT+N/5WX2Fb/H8VDpAtYftsDG4fGfbZCjyIFqk7MHMQYE34exBawqKV6j+AbwH7hW1tGER/VGvLnKP6tAEyMjIyMvoUNZKrNejpGIQy/8ywbRJasPphctXM8HcLTtxHhr8bMe63dUfvNxOs6pEJVg0IdbDqKS3NEInTIJwtDMJ2HYAzh0lo3Yr71WFHJ/w/AQPWx1JKyBZgOYe1SKLOAX6G8VofAv6CJGxPdENGDAfehlau1a0tcw7r00bIyMjIyOgT7AC5ugX4I/AJXEKtE0v7jEJX4BOk2olxObaBWPpnO+qWWKvxCnYAmWBVj0ywakBjU3M/dA929LLrYOzQQ5FwDQ+fIWjKHR5+G4fxWSPD9nKL161Iwi4Dfo0lG07GwfQS4PXADbhO4VxSUP1s4Afoi1/b2jJn95178oyMjIyMvkQN5Or7wEsxPvcbwP/DjPJFmD34LuC/Mc53ftmxdTjZH406ZS9SDcdOTLz6Ry33nQlW9chB7rVhO3bKgdh20XI1IHxibFY/JGFtYf9NOLvoRF/45sJvDYVzjQYeDdf6CpKoTwAnIIE6DxeA/nTYfgQSs7nhmI3Awbhu4WXAO4CxjU3Na4A7W1vmnNyXjZGRkZGRURtqtFpdhUup3YMZg5dgrcWIz6JOuD18PwI9JvuR9NBCdAluRxLWD/XNMNRfz8MSD5k59TGyBasGhBisATgrqKO0/drD3610X8aBcPwUkpWqDolZGw6GzrD9Pgx23x84GzMNW3EW8zFcSgesGn8NVokHY7TacLBcguRsCw6ofq0tc0bV9tQZGRkZGX2BGsnVHHTzzQHegHK+GA5yH07WjwMORFL1aiRSm4GHcCWRm9Cy1Y66ZTJ6O4aS9E07Jmzd2dtNZQtW9cgWrNrQHxn/ILRidSChascOHdGAQYaDsLNHYjaI0mV1BpPWNRyEs4uB6DrcG9cbfBDXIXw9lmR4L/riv4wzmji7+XfgC2jNWoOxX99Ci9nZGFy/rLGpeU0mWRkZGRlPLXYg3grgSYynvZpScvV+nKifhrK+GTgWJ9Jbwj4PoGVrbuG4LZhdGI0A/XBC3g911SzUGQtqudmMysgEqzZ0oLtvA8nMOpgUT1WPBClatzqQXG3FAbMFgws30RX1GLB+IBKt2Vgna99w7G+QYJ2NMVtvxGDG7+Ks5bdIsNaEe1mC1qwYzDgmXH99Y1PzQ60tc2btdGtkZGRkZPSKGsjVbRgnBZZi+A3G3j6vsM+JWJbntxgOMhPrIo4jrRoC1kd8lK5YF/62k8JdBpKWgmuo9mYzekYmWLVhOykTI1Ztj5mB0c23MvxdXeO5t6IpONpf/4J1r16BQe1rcL2pa7BKbz8kdyCBelfY5wy0Vq3ANQ0fxjop4zAYfhhwcmNT8y2tLXOOrPEeMzIyMjJqQA3kah6JILXi6h6vBt5MaVmFi8Pf94S/H0XrVtGLcgvJClaOTkpDWaJhIC4F1w8TpDZhIH3GDiIv9lw7Boa/kUy1ohn3SayyvozayVV3+AOagV+EJOvMcM2V4ffX4dqG4GC8GdcqPB3NxaB5+K3AF9Ht+CjwKeCmxqbmhxqbmq/uo3vNyMjIyAhobGqullxdjTJ9BWaVXwq8E0vzfBrXs42Z618Pf5dhzBQknVTECnqudRWX1YmxV5vQNbgGPTTbkGiNreYBMiojE6zaEE2oMVuwk9RBt/Rw3I5iFQ6uNqyFNQqD3ReG32cCFxT2fyUOlNehde3wcMyRwJVoVv4HBkX+Ga1daxqbmh8jIyMjI6NPUIPVaiGGhjyJVqM/42T4I1iapxh0fhSGjYDFRsEQkuLFngB+AnyPpCca0XNRjhj/O4TkiYmFSTehXtsefs/YAWSCVTs6sONFhr+rcVu45o+Br2Fc1f44QwFjsiaE/1djMPxSJF97ogXsLOA/C/f7PRw4L0XC9oJsycrIyMjYeVRJru5Fa9EytCRNRWJ1GcZd/RBDPIr4euH/N2Bc7XCcREfsTldCtDeGlexOIlqTkNA1IbHaiDqljVRCqAP1RD9MwsqoEZlg1Y5YC6ud0oDCXYnLcZbyXhx4o7BmVsRlhf/7h/3rgV9h7NV8JFmXklyKizAovh0tXB9qbGo+ubGp+cu77CkyMjIynqOo0iV4IxKr3TCIfSpOiN8L/BP4EpbiubjsuB/hhBksNjoDPRyvr3CNYrbhYZgUNRYJ1mRSxvoG1BcNqNdA1+HG8NmKZCtjB5EJVm3YXvZ5KnEVrpB+MpqNx5JisfbBrEPQFXgUZpXsh4N2HpKt44HfYzbiQlxsGuAXmI2yL/BAY1NzDn7PyMjIqBJVEKt5SKj2w1jZX+MSNxdivOwmnCg/DLyv7Nh9SeTqavRYzAvfp5btuxRDQUAL135IqsDSC0+SYrf6YyjJBLq6ELeG/dpJVqy63h4yoxSZYNWGWKX9qSBYlQIXL8GA9Tcj4ZqNSx2AAfERD6GZ+Es4yK7EgfUtNAO/G8s7PIp1T8Dgym+gK3JCY1Pzh/ruUTIyMjKem+iFXF2C1qKb0B33MyQ6p2Mg+7txwvvzsN+X0DJVxLswLASs1P6tHq43kSTT16L1alz4xPAW0AsyAgnWiPB7OWLh606eeoPCcwKZYNWOXcHkG3CWcRhaqPZC02yl9/N9DF7/KpKhc7Ae1kQcpOC6VA+jJevPYVsTDtwlmIq7BxYw/SQGyheD9FcDX2xsaj68san5833xgBkZGRnPJfTiEnwIXYEbURbviyEZHeh9OBhDNt4LfDwc82tcvaOIfpi8tCx8/ycSp4ih4e9SLOHzRcwGJFzrEZT79YV9QVK1Gb0gG5GI7RbuLeqdGArTTiZZO4RMsGpDZPOD0DI0gdJYKKi+Tafjgp1nYNbf6zAYcRgpaL27JXe+h8GNP0FydAGusP5CrPAOuhHbSIVKv4wV3/8N3YT74CBrx/paP8QyEGDm4nQMsP9wjRWIMzIyMp7T6EUmrsEJ84dwYrsNi4Lug7GvLw77vB/4r3DMBlzEuRxnoryOOmEjeiNAt2GMkZqI7sCppCrsY8M+DeG4IYXzLMJl1uaRvCAzUe5PJNXILJKsTLBqRF6LsAYUBlV/7KyD0JoVO18dzhLiWoWRkMV2HoCdfWD4tOFA68BA9FjrpFqcjwGRLwXux4FyBfC/4fNzJF2gS/F8tHz9CP3/n0ZC91i4j8FovboeA+Vj0dOj0cSd16HKyMj4l0UPxOo64IDw/xqUqTPRg3Av6owfFfY/F5c3ixPgP6MrsBLWFP7/EvA/4f8PYIX3vUjLta1E92PEq5HkNYT7uDPcW0Qslj0M3YQDw3keo7Rw6f8h64DqkSu57xg6ccYBkqdYF6sfzlaKC0G3YUetljzV4dpTewCfKFynEn6Pgev34kB5NfrW56F16u242PMIXBz6dAyg/F+0fn0S031nY5zWsTj7eR1mHV6BM599wrG3NTY1D2ltmfO7Kp8lIyMj4zmBbsjVXCQ3HeH/wcAdSGg+jO7B+aTlaSJOwkDySGa6I1f/Wfh/E5KliDaMqZ1MWt5mGK5PGF2Nj6L7by9cOHo1pQQrZgyuIy3/NgDJ1loMHWkjW692CJlg7Ty2U0qedjat9XKsXTUYeAnOeh5GE3Ml/DP8fS0Sp19hCu/tWCPr10i0QF/+EAxm/xAGxn8fCeNLSNa3wWhqfinOaKbhIDwKeLKxqfl84I7Wljk5PisjI+M5jQrEKsrYgUhkFqB8XInZ2Pf3csq9MRb2ALR8/W83+z0PyVLEEErXCYyrhowilQy6jRRP24DyPC6LMwTJWBO6BzdTWqJhJcnLEguQ9g/PFgPeM2pAJli1Ia7VNIiUuroNO2A1DD/6xA/CATqVtGB0Q/i7Cvgs+so/gDObAUiAfhf2P4Suqbw/xyVwXoVV31+OVrALcWY1Eyv6/hEtVbdhtsk/0OT8+3DOn+MsaCMO1AnoehyPQfgHoP9+QWNT85nAX7LJOCMj47mGCsTqDrQIrUCvwVqMa90aPg9VeepHUI7uh1mF93Sz33WU1rSC0iD4zeFclG1bVPh/MeqdSWFbJFkbwu/RDdifRMzWkco2bA+/FUNdsjWrSmSCVRtix+qHHXUwEp4GzNzYSAowBF1vh6C5tbhvJFVgp34IidXtWIjuVOA+jJc6BwfhKeET8XrMPvlmYdunMK7qE2htmoKzm/nh9wOBn4Zjj8eSDxPQ/78R04W/h/Fa78X4rdU4wMaHcwxCk/MjuCA1jU3N2S+fkZHxnEEgV39Aj8RQlM2/QutPJ8rvTpww1wGPIymZFfYdQVe3YMRncLL6S8z8ixhHWqEDlNFFzMPQjoj7SLUMIzpIHpVpqJfuJOmCUTixjxavmJ1YtE51ouGgf+F8UfdlclUDMsGqDR3I/DcgwRpCWgxzHGZf7I4ZfsNJAYQbkKjMR3dfcRHOuNzBRCRQH0Fr02B0D34OB8W/IUE6p3Dsx9B1WByUnwjb/gdJ0FtxFvRXDFY/F4nb+3Ddqg+jy/CzSORuR6L2OBK9E0mZLhGrsVTEd+OGONvLRCsjI+PZisam5nvCv/MxXGMyyvkX4uT4SrT6PIyyfyp6A9qBzyORuRp4AL0DldCEcVDXkAqGjqFUjoMZ6iMK38trI0ZL2kqSxelx9FiAJGo0kqLHcDI9HAnhKCSPA9FDEZd+i2vsFglWJlU7iEywakMddsjtpAUxywdFTxiGptrjkZDtgWbiMSQXYX1h/wvQTfhlJFr7YdDjWUiYXlq4/kk44H+Ps5pfIolqAb4NvAB4BfAdtGC9Dgffw7jG4X+Hz4FY1G47FsGbgjEDpyH5Ozjc4wys2VWyhmEmWhkZGc82NDY1r0EycT16FJbhZPTwsMsjWEahSIomowsuZms/hCtkzEDyUolgzUAvQCulS5yVFxetx9jZm0nLm21EQhcXcV4f/m8hFSJ9Oeqpm7Gcw2D0PqwLx9ej3pmK5G1D2BYXdo4xuO2koqQZO4hcpqEGNDY1xxis6Oor/h9LMxC+RxdiA6lqbrmLsPz/uM7hDaRFmhtIRPhnaHUqLvpZxLUoID4Rvn8KCdVSrCj8QZzhrCkcMwp4EVYI/mnY5zAUDh/EgXYizrouwqzEzyI5+zKmDZfjJRhjcEBry5wXVvg9IyMj42lHIFYb0XK/FIlHXLMv4lqS7CziMJSvT6DFawgSqCUoS/9JV/wYJ8KfQBdfRJE4gcRuFLoT4zI5j+Ck+snCfnXogdgLQze2ogUrejAglYJYFP6Py+d0YJmfRUj4optwQPh0UCFpK0+eq0e2YNWGdrRadZAqukeL00BKCVSRgHW3EvkWDJTswMG9HLP6Ih4irSt1O1qdQEvTBTj7GI2uyPVoCXs3xn6diwQrFiE9FwnRIzhwH0G35Bq0qG1E9+MPkQyeh6bwJ4EHSTVcJpGyaMpXbY/oj4O9rbGp+UfA4taWOR/vZt+MjIyMpxSNTc3vRkvOa1COjsRJ5EMoR+9E2fpLtC69EeXiNiQza5Co/B6XrjkSycu4sH8lcnUuyuYWSsnVvqgnigTrNtQFexa23UWKnYo4Gt2E69CjQLiHUYV9VpOqvz9IygycgDqgH+q21aTCotl61QfIFqwa0Ev13v7hU48DM6bTbsYOG1NdN+3Apb+F2YGr6Vo5vjt8EMkSGEN1J5qkz8B6Wa8CPooxWKCg2YIxWw+iWXof4AdI/GJM2afDc3wS3YZXhm0RjehGPB0tcn/BGdKBwKmtLXNeUe1DZ2RkZPQlGpua96S0DlQ5xmJM07swa/CdGBtbLI+wCbg4/BYxDJfC6Y9lF56kNHZpOHognhd+/2LYPhlJ0q2UJkgR7qO4LNtlqAs6ccINBrLvjXG2r0ejyRb0LFwR9hkTPptIGYYjkBQORnm+Bifp68LfDWi96lKaIVuwqke2YPUdYtX2SKb6Eu/EelavxjiqavB6EsGajxan8Ri4uRBjDCbgoH8Q/f3fQavXGVi5fSMuLH0nDvQJOCD7hWOeQEvXegycB2dEBwHNOEubgebnucD0YJKntWXOqCqfIyMjI2On0NjU/Fmc/K4Ln2tRJq0p23UlyrhfYq3AdTixjQTr6ySvQhHHIrmaS+XCnK/DONm/kcgVmNC0la7k6id0XXatE2OsPlzYthVDPKaFe4yFrQeRshIbwnMW3X3rUC5PwYnzSPTCxFCXgeHc66h9hZGMgEywnj24MXw+h/Ww9ull/6Jb8ocYoP4mtCjdh1amR7FEwyiML/gwcBySorOQYD2EsQYx8/ENGBg/GQfwdhzgjyB5ux0F0gyM13oQB+9haJIHoLGpeQnwhdaWOZXW38rIyMjYaQRitTta5DvRerUACccwlFvLyg7bEj6/wUntFJRpL6K0ZtU7SGu2fgytQ/3pusTM/hjWsRjrEkZMQxlaqX5WQ7iviYVtZ6DsbkAX3jT0HhxAKQlqQPn+BBKshRjOUU76Hg7Pvw9auPqTaj3G/zvR8hUXe87FRmtAdhHWgKdw0eND0TzdEybjAO9EMrRH4bf7cCb2cpLPfjhmC9ZhoOV1YftizDL8NMYZ7INrZA1AQnYwEqWJWKF4Ibop+6E7cGzY91d0Xe7hKhRil4W/Z+GK7UV8E/h4NjtnZGT0FYKsno6W9NeTFj3egLLsAXShDUKCdDeldavqkJh9C4nTdWHfNlyAeXeUZfPCcUPQkv8D9DZEvABl3BiUsV8u/PaycPytFR7ha+j624AyeVrYvhYD6NtR3s4F3ha2T0YSdDTqkK04Kb8ByVR/lNmxqGh0F4JB9mPDM3YgSYyZ8tvCc7cBHa0tc3LZhiqRCVYN2AUEawx26hnY8fdEN94ROIv4FvCVGs53PPB84O8kklXEKzHQcikGw0c8gAP06PD9IBQ44GBeiLEDsQHuQYEyHH35Q8P276KlrIircYb1GxQYh9MVH0GT+NZMtDIyMnYUjU3NM5F0HAYcg5ar5xd22YTkYS1ady5GS89anECWx8h+Cd1/5R6DZcActOyvx4noUpykFnEryr3rcemyiINR5m/DkjvleDnWM/wMpbFeYHzXbhje8V6skdgUnucK9BrsicH4+6Mu2YjWqvlhv63hGTaTiqkOQW9GtJBtCs+2FQldO9CZZXT1yASrBjQ2NceFnSFlEQ5A1j+w8L2e5NcehiRqPCn4vbsyDZVKQGxFt9z1ffQYv8Psl/8K/4OD9fbwHKPCtiEkYfNGrPMyBAlSB5K30aTlFqIp+8uUBr2DwZ9742zqMCxgCg76SM7WYpzCtfGgPJAzMjJ6Q2NT8xvR1daBcuoAJDugnN6E8aPFrOc7kFjcjRb2Wyqc+oPoFtyvbPu9GEd1N8q9dyIReV/Zfh8hTThfB1wa/p+Nk9mhKPcuREtVJbTgRLwcx+DE+CKcTC8jlfoZhJPiX4ZtJ6AOii6+ZeH3JXSNQQOtZTHEZD22XxuZYNWMTLBqQC91sMqXwunt9+4I1kNIXpbjgC3WwXojllzYGZwazjsUB14RD+Ig2p+uOBmtWMNRkPVHM/lxOPhiuYp2LA3xu7LjP4r97WdYA+blaKaehObpi8Pfi4D3FA/MAzojI6McjU3N5yFReRFp0jcWSUFTYdf1OLn7M5KMc9FK34IW9s9TeWmb/0JyVVyi7AtYBzDia1hm4acYJhHxGqxPBan+VMRBWFtwG8rcB0iEsIgvoJtzFKnYKOjhmIauxx9S6nYEM7gnoYy+g9KSEBPDsSNw8h4zBqNlry3cVz3K6wEk61UbmWDVhEywakBjU3OschuJUndkqlqCBcnEPAdde+X4Bg7WIr6Ms6GVlNZOqQbDMS7gGJy1FeMFhpGyWfYAzscZzm/CtpOQZB2N1rmvYZzVqzEAcxJpcdJXYNB7xAHAi3HAfgWrIr8QA+0/geUezkWhMg8J2Z3lN58Hd0bGvy4am5o/hlbw3XGSOBi9B4OQJEQr1TWY0BPr952Lk8QXk6zmf0ELU1yrtYi4gsXF4fuDpBAKUD6+H8Mu3o7uvIgXY3hHzDw8Dt2PETORJPVD+ToXrfnl93EKTnZj1uIfMKv726SaWuVhILWgEdsu1sVqJ5GtIuqQmG4HtmcZXD1yFmHt2NkAvxacKd1H6cyiO7wbZ0fvwArp4PI5H0ACci1dXXI9YRrO2m6i64DegKTnMswqHIWWpsdRoFyDg35ZOPYdOPuLs8OfI3n7N1I8ViRnywjFR1F4fRVnU0egVe1KrDZ/CQZvfhnN55+mEPCfl+LJyPjXQyzvEhBLzER0IsH5MqnG1SQMIn8crUNz0FL0AZzsHYwW9PXdXHIRlqAhHHts2e+vQHJ1Ecq/iKMxiaiI8mro41C2DUGr0QzUCUV53A9jXj8Znu9EdE0+gARxCvBalLmH4yR3G67AsRHl+/YK1y6iFYnpYJTFHaTJf8ykHEgqQZSD22tEtmDVgB5chPXY+dpJMVn9cNBsJi2+ubMYhBl+H6zw21q0KD2M8VTLK+xzMJK614R7u6jCPsegi+/M8D26Jb+N6yAuD7+9CgfkzzHocihms4zASsataBa/i9KlfX4e9r0EZ0rnoOCYF36fhkLk7+F6/xbO/07MhumCTLYyMp57KCNVRVyLlvNvFbadgAU8h6JV/y6c/K0t7LMnypGzcXL6OVIyTznejKEKC9AlWJQ9X8G4WCitmE649tDC9++jF6JInvZBgtQU/u5G8iRcTWlg+4cwM/HLmNX9QHj23VGOvwnJ1TzUORNQRrciSdyCBHMdTu6LmYPlqCfVwepHWionLvjcCVne1oJMsGpAIci9P6ntepsl1IpDkAhtpNR9V47iIK+ErRjEuAFddc1oTu6HMy8wZuDzpBpXEVNwBjQqfH8hLv3wRxykH8RZ2MdxFvYkxlYVi+W9DU3ng4E/ITEEXYnRKvUlnJmdiWb1TpwxvQVN5/H5o5v0bsw2/Hl3D50Hf0bGsxeNTc33kQoaR9yKsupGzPgD5UEsRzAQicxP6FqDCpTXJyMJG4UE6BEMVG+vsP8L0XL/gvD9lzjB3EDyOmzDWKpiiMa1uGJFEd/DEg/FTMFmjKmagZl+C5DcNGKIxW4oUw8I+9+IsWB/QVm5NuzzFZygHklpLa/xSLKGYPuMDNu2IeFagpmEi0iuv/bwtyP8H/XbIBK56iC7CGtCJlg1oA/LNAzHWUxcdHMaDqwxONBuwFnWShy0H654FjEKzd6vD+etBRfgYLumwm9xrUJI62L9AYPw16CAOBRnd6PCvd6EJveNOGO6DYXGLCRk/xPO91ZctHQRCobDcRD/EPgFCpE3YQzEF9FFChK8k9BC9j7SavSxYnEJsiDIyHjmI8jVfmi1HhE+t+EkbROGSRyJMUdt6Pb7GZXLG5yKpOVGlEHb0YNwBpKyg3FC+RG0cpXjZSifDgnft2OW3ywS4VmKq158NXw/I9xPpTVnr0BS+Mtw3eMx3KIDSV89ujOLdQzPQh1wGoZY1IVnmIny96VI+I5C+bopXLu39QMnhv0mI4nqwIn4FiSm20jlGaI7MMZoFQlWdhVWiUywasBOEKzBOBAmYSB5NL924CyjPxKUf6IQ2R8LgM7CTJYBOFO5rvzEFfDWcJ1j0Iw8rvDbSiQwe+OSDT/p5hzHYQDniTgAr8SBdinGOtwZnimmL78KBdcMJE33kWp8NSB5nI1Wq5eFY36MVqvPhOc9G+MnPouBpaeiWbwxnPMxFAoHk9ZjXIfm8biwarG0RAky2crIeOaggiwdg5PO96CsWISy61G0AlWaBJ6KsnQbyoZROP63kLLl6tE1eDTKoQ6UY99AUvFw2Tl/i1l43eEWnNh9O3z/L5zcjuxm/ydQBn4O5dVepJqDu6EsjoH5H0Xi1oAuv3q0RI0I/1+PZPNP4VnOAG7G7OtX48TzLtQni8M5l1GZeA3HNhqN7dyOk9RNSCBjcdEOyqq3Z1laPTLBqgG7oNDoeBwoe+JsZlrYFuO7/oAuvH+G/W5E99iFlU7WC04I56l2qYN3Y3bfHRgXsBpN21fgoP4IKRYCtIYdiEJuHWk5ihHhee7EGeB+SKxAgXIiDuwJaBG7uXDd12FcWTmeDNc9AdvsZkzVjtgfhcNcFF4zcOb3f+6DLCQyMp46VCk7+2PpgVfimD4jbJ+MsuOKsM+ROK63IBFpQ8v2kWG/rShPZla4xjKM1bqXrlnKb8Cwhbqy7ctR5mxDAvPxwm/X4KSvJ1yLrsR2nCj2x4lmnKBeggVD1+JasO8L29eiO3MATq7/G12lk9A9ORezur8Rzt+C3oOVSLY2kNbHXYLyb3k4b3lJiuHhMxbbcx2278bw3P9ntcqys3pkglUDQpmG/vRtzFUjxjxNRFIVydMRSLA2Iwl5Ic6CIr4F/Ecf3kc5voECbgAO4ieR+ExD0z1oyv5z4Zhz0b13Llq8FpN8+gvw+cbiwD8uHHM6Wt2W4cw1Cp1v4/peYLbiW1CoXo5E8w8V7jkKie4COZvQhdmBAgjIAiMjY1egsan5j0iALsXxXWnNvSLeiVap7TiGb8MJ283hf9B1dwhabYahvJiJFrBt4Tqj6Rp8HvEFlCHlwe0votSivxWt/OtQ/k7ByW2xRt8L6DlOthzXIsF5IVqklqIFq/xc25EsTUB59g+caF+Mk9VRYb83I9m7GCfASzCYfjlOWmNc16DwWU+qYh/rXa0If7eSyl0MDvcwgNJlctrIMVg1IROsGlDIIgQ76q5aZTz6/++kdKmFC8LnHYV978VMvydw5tUX93RCOOf+aP15J86cDsJZ1G0YqH5E2OcHhWNfj0tTnEzlmATCPcYKyl8P+78GBUobujcjihWQq8EdpHiGy7EOTqwvFmMJekQWIBkZtaOxqfkkVPKTUJk/H8nPCpQfPZWlacQJ0OtIK160otybgPL2JMxMHo2urNVhe/+wzyh6Lj10DxKSG5CQxUlWE6XxWNvCvntRStSK/58K/L7s/N/FifJ60tJnU8NvW0nFmDtx0hprY30tPDc4GV1Jin/9Jk4oY7mbY3Cy+gZS2EULytqZaHHagNmG68K9bKe0Yvu4cF9DSQaDDfie1oTnjyuVxCD3WGg0E6wakOtg1YZYD2QQDtBoQu2LFcabcdCNxYE8Cwf9EeH3NTgg34FB4XFGdwASsReF338f7uevOEB+QfLH94bnkwI5X1jYfigKyLtxRvoiNE//EgngAUj0wDZZjaUiojAsR10453ScoX0GCeJLUWhcjeb+oRg8CsZKfBozacoxEOvUvBYFxfpw3jOwHfuh8PtO703Q1Z2RBUpGRlc0NjX/FK1IG9Bl/xAq9b3R+nxo2PXrpCXGukMrjtUH0Kq9P4YcnI8kagOlLqvB4TMNFf+wXs6/AGtKbQnfV6Ec/zpmDEZsC/dwCMlVeA+lq16cRypgClqeLkD5eWXY9iq0UE1BK9v5KC+vIIVVzAjniRPqtSirIrn6FuqASK7eEu75RagPvkYirbOROI3BeLA6lMOrw32sKdzvitAOY0lW/0HhuEimYnZlLNGwPdxbDnCvAdmCVQOCi3AAuqqGYifeih14V3S83+JM40wUXO/CTLx1aFV6GAlIXIbh/Rg8fg8O3iJ+h8RjPMZijcHBfz+SuAPRvH4AaWYTcQVJCB0V7uth0iKqB2FfirPAd2NR1Ak4my32s5U4O42BnS3h/NEd+DaczW0O91QeDxFxPbb9bRjg2Vj2++VI+gYhORwY7mk2EtIvdHPeXpEJV8a/Ihqbmj+Lyn88Ep228P8SVMRNOOanFQ67Gcfh/9D9enug9eVsHMszSNbvleHcdUgI5pNWi6Cwz1gsCPpRlA3Tw7k+jBPMf6LMGUtKLIpLgr0nHLsoPMsbcSK7J8qX14btoLw9p3Dt/ela5qYS4pIzESehPN8Nk5GK67KCNQo3hmuDk8OhKHe3hmeKWZTTMUFgL3wHGzHjOk5698VY2CHYrsuRYK0guf5iQdF+lBYWjdmG8XtnziKsHplg1YDgIoxFRYeTMgJXs3NLFvSGO3BAxGrCv0LSNQddaytIhexi7NIhaAkqYgO9z/TA2c5CfLZxaI4/IWw/ATP9FmBMwp9xUB9K6fqD30Kr3AwqZ9h0Ukrivk5aEuJUzBwagWRuHbZxLP/wy7DfZ8N9rsfYtRjgGgVL7N8jUaDdHK67NwqufcP5/kRp0cKakAlXxnMRjU3Np+ESMSuRAO2FCSoTcHLWgAp4fdhnASrrs3DsRnwBZcPjvVzyCyhf9uphnyvQynQdpVakiFlY7qV8gebFKCN/iXLrKJQHlTAf5fuj+CyxxtTvSQvVg+7Gb/Zwrz1hEpK4F9OVMH4T5XsM0m/FCWQ7EsVt6EnYHv4uQVk3Db0fa/B5V+FEdX7YtyE8V2P4vik84xrUL21hnyg3Y4B8Z3FbJljVI7sIa0M0k9Zh5+yPgmQ8dtJdEZP1SiQv78fZy01ofgYF2t0YgD4KCccFOPM6P2w7C1OJd0dy9U00Lc/GQfwQCsuTSe7BURinEAVQAwqky9GM/SA+8yPh9xacyRVN5DeiqT+Sq3XYbpvDcUNxljYh3NubwjnORRP6vhij9Qq0jE1AIfB3jMlagcJ2CNaW2R8FyTiMA7sBXQh1mFq9ODz/1nC9vyCp2wtds3eF81+LyQTdLaHRBZUypDLpyng2oawPvxmV8CNo8VmAY349WjpeE/5uQQX9fRz3jSh/Po5Zcg04CVxL7+Tq46TCm+B4vBatzdfTNesNlFln43iP2IYy4jcoP1rDvZYnJlUiVx8kZQgWk2zAWoORXC3Did+T2BaDMRB9Ez1XSi9id2zbW8O9NZGKKx9GaQZktM4PwIniNrREXYbvYAhOnqNXYD5OPNtQzu4X/t+MhGluOH5rOOdo0hqEW1BmDiQFvbeRyFZGDcgWrBoQhFA9dtrtSLCGhs9aqh9cteBMFFafQzL0mbDto6TFlNeEv5dj8bvzUUjegAQr4k9Ivm7CrJQn0IQel6aZjfFdp5NWb1+CQur/oTtxIRb/PBfJ3UvDfqdjAOY9pCV4vo7ZMbEQ6OOYphwXD12LLodlKFxn4eB/G2nW+GmMPYjJBRtQKHw23O8yNOPvgQLrcRQUI9G9ugkJ5PEoKPakejyBiuMnpDXOesJYerFkZuKV8XSih3IJw3BsvB6V+1AkNX9HxRzHzv6okLdhX78FidA9aEE5EieFJ4XztpESY27t5tofwDH9erRcfzVsPxwtPf8Zvm8M118U7utiJDa9YQyGLTyCcnEDln6Yh3JhK6UB7E+Q4qL2wAnd1MLvt+OEr1+4pxvRKj4p3NdgtLhPQhL2DySnxSzK08J1T8eM6mUoY05FWdhbzNpCbIeN4ZqbSCVxngjX3YzEaGi41np8p+vCd5BE1WP79yORqfK44ugi7GhtmdMXMcf/EsgEqwYUhFMMCoxZFsOxgz5GCqLsS5yGmXodWKBuCQqjNyHRKCdaTyKBmkLKmvksEitQCF4R/u8guRivwYE9BAnWQWGfxVj3KmbzvQAtSxMpjU94Kc5A/46C91PhPvujAOhEEhKzaXrCZ5DIRRyHBHFn0IlCpwWF0VAUenH2ORjf51WkNO5RpOKv9ThjL5am6A3xeWNBxOXlO2TSlbErUEXtqck49g9BOXEIKugVaC1/EMf2PJz8HIiTqH44phdQus7qaBIxiWgJ57s07Bvjho5EeXkgTmBGoLVrIxKxbeF8n0LZurqbZ9gr3M9HkdCAY66nidRSJBjDkdhMIa2CcSWpGPJ/4FqARcR4MFCW3ILtWB/OMRJJy0aS5W8kktG/hLaI6xo2IBl9EmX383Ey+4ZwvtHh3iI2h2NA99+IcI0v4vuYFI5biCRrCcqr7hDJ1cDwvT8pqzCGcEQyFWOx2jLBqh6ZYNWAgsDqh8p5OCngPQqcLku29CHiUjErSKUI/h0tWt8lZZusCX8XYXDpKJwF1qPZO1YhPooUIN+JzzIYY6d2R+HVhgP2TWjpAoXsj7AdPkayWJ0fzt2OgmdjuM99dvB5LyMFeUZcii49MOB0Yrjfq8J1r0Ch9CTGK0xEovgQqdhfrTgWBfZSfK69MYB2OLbB76id/EX3fCTrcR2w9RQqL2fyldET+qj48f7Y73pblP4IDMregpbiVUhQBobtZyIBaCCRnHuQGMQJTbSM/RTJ1bzweyQnc9A6PgqJzAIcy8sxLOEhHM/noXw7OWxvQ3Kye7jXhWh1in9Bt+AaJD2fDtu+F87VH+OzYp2riST5EbE+HD8g3NcilJfDw/PFlxFDSUBr2SIkjXfiJLcn0jMW5U0DWt6OQeI0EGXp4HAPY1CW3YsxudNQXm9Fi+LtdK1SX0SsDh9rXsWlcKIlqyO0yf8Rq/DZ2toyZ1eVJ3rOIROsGlAmzOKMYRgSkzZSYOGuxCuw2vBQnKWciTOVD2Js1q/C76AQiEHtXwy//ZyUPTMvnKMdheY2HMTRchXP8Z8oHOaFbedirEUDWn9icPoxSPKKAa49oRMD+EegW2B+OOdDGJMQ3YCjyo6bhdmSQ8Oz/rzK61WLZpw5x9TnWHSvnWS678mE/1sM2G3ZweuPIlkJYtxaxXIgmYA9t7ELVo+oFmOxQvmBaLHeilaYv5Mqe4/A8VuP7rcVOHZGIgEYhDJyDMqhKdivh6HcaQrnmonhB5MxkPxAnJTFEjU3oxvutySrSk8xXScj2Sp368fA9mkYcnF22P5kOPefkOCBsapnk2JI5yKxiaRvJYY4xDilQ0nJTmPRSjUjtM8ylK/34yStGjSinHsxukq3IXmMVviRKI/uDOccQrKOPYDkanOXs4oY2lKP76I/iQtEuRMzCLeS1ihsA7ZlglU9cpB7bYgKL6atriEFBA4Ln11NsH6DJOSNKMwextnR+Ug2Po3C4AekdOlvo6n7Q5gtdzzOzmIh0QewnspxlKZYg7PNISRyBcYJjAi/FZft6Y+Zi8Vla8rxOxQ2D6EA/Hs3+w0M9zMV2/m+cN+EY2OM2GVIzs7C2eG5aPW6DmemW7F9jgz7b8Qq8L/o4R7noHvg8yg4h6GgvAGJVzmGo0IYgO7c43AG2R8VybfR/Tqvh2sWsabK/apSwJmEPTPxNJKniDNw3EQ31D04zlai8n0JBkhPRcKyBCccY9Gy04AWoj+hJWQykqVpSJ72RvLRiWP+SVymZmk4vkg2YvxiDE2I5OpOHMv/G74PQ+IxI+zfiWM6Yg+Su27PsN8oJG43YxjD80g1usDwgG0kcnUoTq4iHiWVhdkUPsvQqrYeycpfcMwPRwJWRJSVtaAVZdkAbIOzSPq6WMC5ndSWS8O91eN7WkmqzF6H5GkBttk2fH9FfTaUVOuqPfw2IPwet+cMwhqQLVg1oFDJfQB20A4cvGNQQCylumDovsDXMdtkVmHbkzjb2YpL3byG0limn+KgBcnItzEG4BQkD//EWVuMo3gQycybCteYisJuT5yRvaXwW8xiLMdd6NprR0G3rMI+veG9mA0JEqQ3l/1+Fql8A/hu7sT3MjD8HUpXbEIF8Um6n11+FkllB1oBv9HNfsOxX4xBwjUKFU2sQ7MnCtor8b0845DJ2M7hGUCaQMVZTyLqz8Paci9AhXszLgPzI1JtqhNRDsSYwclIrrahHLgYx8cCVLzjsb8fhFaqbWgx2Y5uq9vQNfYhtGwPRCvURpQF3VV13xvlTawLdSdOwlbixOVkJHCPoCw+PVxnTTj2MQwd2I7EYw+0LF0TfjsECeV/kEIXLsX1AC8O39+HnoHD0Ap9XTg+uu9jkHhchibGwJZjeLiH3jIou8Oe4TMRQz0GkeKlIBUQXYty+uHwacPJXSy9sJEUAzuKlFEZY0MjeYquwWi5Kv++CdicZUT1yASrBhQIVsy6iOs3jcaskrWk5Q+eCnwahef+Zdu34+Bfj/FRJ6OQ+BDOxr5LKhx6H5ZtmEDpWoegEH4HpZlxB6BlaDjOaL9BymD5DgomsC0uQ+FyNWl2WA1eh+bwIUgIx3WzXyda5P5Eqmwf8Xg47tpwj4uwTaZjuwwI13gBpTFic1FA/5HKBQTPRGvhnii4b8A23IhtHFGPwnxC+G01KrNDMPB/t/DbYiRtMTHgOYFnmxCukRjFOKNdba3uDaOxn83C+JsXkOITt+JE5u9offkTKtZTsUjxEaSA6dVIEhZiX92C5GYUkqfJ4bf/xfFxMpKZYUg2VuBYHY99+MYK9zobx8xmTCBZUmEfkPwsodQd/jEcr5tQ3s7HScxinLBNQ1faKAxZuB7J2F5IGO8Mx8TYp39HK/c0JCY3YogFOC5PQVI4FieHkVyuwjbfLTzLo2jZLqKBtOj9Mmy37p61FlwUzju2sG0rtv9clEFR/gxE+dxOqua+EvX9CFKJhk2kdQojIdtGquTeL/zdRlqh41k3tp9OZIJVA8oI1mDsdNvRHz4FO+CDT/FtfQhN+Xt38/t+OMi/j+bxdhJh+TLJOnUnWokmkoLWryVZvECXwgvDOZ5AoT2PVEtqdjj+XhQ83c3syvEqUsD8lF727Q0bUMg/gLPONeGeJqPyWITKIGbQnIqEcXCFcxXxBJaq+FXZ9hFI0KaFe99EWrE+lqIAZ/1jwn5j8b0cjAqsofSULEPi+LVqHvhZiMMoVRQrsc3mPS138+zAMCQ9J6ELqxH70whSHxqAfXwgjtF1JBIWsRaVcSu2+2QMNdgrHHs3kpZ2tIYPxMlGLIfwCsx260B5dz2+u2HhXhpxfP0Gx8yO4jCcBPZDYhdXmXgZythord4LM5xvQRlHuJdYO2pwuL/54ftuSK7OQBJ0NZZwiJiF8mBvJFD3I5GLpQ5mYbv/A9twLBLMolU+1hMcRyr2PB4nd1tI5R1Wo0dgHV3dikUcgDJ+j3DfEe0o7x5FGf9AuMcYE7yJVJohxmO1kcoxrEFiVR/+FslVLEO0OdzzpnCeTLBqQCZYNaCMYMUqxivDtunYGXvLxNkVOBtnZbF6caUA7O+goHoTKSj9sxiMPRoH6UC0/JyBsRDnYkzRz9Ck/s3w/Vc4sytmzh2G7bINBXhv5SrehEJjT7q3UD0d+B0K734opOtw5no+KSi2HJvwva9HQTkS+8JiFGKrkHxNQkE9LZx7ANUnBGxDRfIzqi9oOz0cV21g7VOJadjvYhu3keqk/aujP8qUQ9A6PQrfZYw/mkAqKxCxBvvT46jsl4XjRuP4GoxkIGZAg2N0MY779UiubkGlfyz2nU+RVkb4CFpfYzmE36H152fh+0FIBqL1px2JzVaMUZqPpGI7PS+bMwsng6NRztyN5OI6ktWwASd7xRjQk0gxS93Vo2vCsfhJlFM/IBVMbsSQiWPQ6hQzBaO7MlrAI0F5ECdd5XgtWsZux8ndbmiRW02K440TMMIzbet6mi54DYZ7DCCVbFiHoSFrw9846d+GpCsWJY2B7BvxXUfX31pSWQZInKCNZLnaQEGGZIJVPTLBqgFhLcIY31CPnXx12NaInX3x03Br01HwvYdSHz0oIObhoIulHZbjwF+IgvgKFICfwPIDoND5OA7CD6DAXYrxGz9Cl1wsVlctBmLs0Vt72Gc9Ko/LMdbqOLSkXVLjtWpBEyqgWq2P5yMR3R2FcgxCXUdX4tRO3yeVXIWWgj/28XmfSsxAK8oQVAIrUeHMe/pu6SnDvkg0dydl2I1EZb4XqeBnxBJUeDfhmFiCcZPV4DCUUbGQZUz62IDW5r9jm7+EZLU+HCdeh2H4QDEwHIz3+TbGMK0tbD8a5chEUiXwkSQr5cZwLzNwXDxEWqN0MpKzFhyPR4d9/0gqL7Mz6I8yaA1auG8P22Mx0hcjgYwW+IFomd8t7HcnyqViSMLLUY7WoUUvTi6nIRleg1auqdgOK0hxWUOQCFdbpPrrpP6xd7jWVmyvDUiUikWZYwbgFhxXq1A+RVK1Mey3OTxrtGRtDdti3cD/QyZY1SMTrBrQ2NTcH4VADHRfj9aLIUhyVrBr1yTsDUeTCvlFXIxWqn5IVp6PAa33ozBdhhmJ/0NaagEUmNejgP3vsG00xif8voZ7GoMzy9eT1lIs4go0o/+gl/McSootOB4JzABUUrNIqcrt4f9vozCsJsD0eCR941AALkXlFasrb0AFeAppoeoZYZ/1Yb/f03dEZxAStofQwrcBiVxsv9NIWUGV8BGMs3u2YCi2+0TsL/XYxjFF/k7McHs2YU+0EhyEfXccvq81qLRmo4JsQAW7ERVbjGeM5QzaUcEtR+vFtTt5XxMw3mha+GwK19gPx9cd2I9j6ZM3YszVmYVz3IPW8Lvp3jo6Da3eh+Ok84tIrqZhu8TA7DeiUr8Cx/JsUqD9QUgIHsJM4BiWMY4UB7cJ4zsX0rv3YArKvMnYjlcWfnsXWq/GouUqloNoQ/lULHp8FlrYHiPV0yqiDmVKlEXbsT+sCM+yPlznrNAO11KaOVxP95PXE5FcnYBkObrwloRztJHaZVE4/zrsX8XYqw3YttvD/fYnxRVH0lYeXwZkglULMsGqAYFgDcYO3B87bawIPAk7eF8ENO4MvkTKsFuGgvJ/wvf3oICLtVmuDds/gyTlpMJ5HsNFU3/EjhXnnITC9c0obGIF5F+Ha3+Z6tb7+yQSm20o+NpJrsi7UClvQwVUj4piBQqhmIETY5zmYezEpeH5BqI5//0VrvtdFKwjw/kfIK0/OQWV422oBI7FGLTGCucpx4Zw3YuwgvXtPe/+L4eDkHAMR0HfiWPsUZ5Zrs7xqODOxolHrBc0FEnMNuzvM6i8csH30Er847LtLyEtALwC45i+SN89+6mYefemsu2/QDkQ5deZ4R6HFfa5Fd10l1Fd0sr+qGOOx3b4B72vgvBmJFmno3x4MFzvXhyzIzEJZjopCH87uinvxPG1optzH40EvvweLkZ3bLQ6z8f2uJZkqRqAtbJOQcJ7cIXzj0QZOg5l1SqcKAwgkdlV2Mf3RNlaTGw5OBz7t27uv/gcvyCFImzBtlqMcnBN+H8RtkXMdh9L0l2bSItz90Py1V44XyZYfYBcB6t2dJIIx3aSy7AOyVesJTIeBzPYkZ8q5fBB0pqCt+IAPgw4B+Mj2lC53xr2H4uC8LjwfQ2axu9CV8SOkCswGPZ14fzz0bR9K92nZ1fCe0lZfrE2y/fQTbmSrgu41oJz0LRfzCDcjISu3Jo2jNKYkYUkYvQopXEg1WIqPtthaJE6gWQNLcdd6MIZjtaFrdiOz0OF905SXNdGVBTLSfETMXB1ZvhtNlr27iOt8/ZMQVyiaDqOoeXh+3Acax3YR6sh57sSY0gTrGEkl1vEYuxjj5ZtH4YK9n2YFfYpfE8DUR7XYd9eT7LsbKQyTg3XHYqK+yJ6Dyx/H1pHwXb8CimZYgKuTfrRsmP+iiRvMbVNIO8jLWWzEvv6K9HS9CjKzcWk+LDhGMZwAok0xPIDMTZvLcoSsETMYdh25yAxvYzux+NNFbbdRlpgug3b47OF3y8J9xMR6+gdROqrhGc8CfvDTSRL0mHhWW7GPr03jr0vhOMORPfjTCSIvZGreJ8xxi1iCckFuBJl1GpSRfah2L7DSdaxidjGMag9nq9SFmjGDiATrNoRCVYnySqzHTttB86oZoa/MSB+OQ6cNU/RPf4QZ0MHoOJ9HpKJcahwt4R7eydaro4rHPsHFKg3030l4J5wNAqfPdA0/UnSYqe1YhCJAH0fhf/OYF8U7pvRinUvuijeE36/Lfz2UXyv0fIXyVV0UUQMIGVbvQzf8y9QuPWGdeH6s7BvLML3FevPzCRVsD8YBeMNmOF0NcZ/rUfrwFWoaK/EmfECJMnNaGmYSWX3yR7hWbeh8D8kPP8kJGsxrqRotS3HQ6FN6sM170bLzM4Gq88Pn0Gkdq4mEPipQCO2xUPYhuNR8Q9DK+ndqJSvp9R61YKu+V+Q1o8bge9wMLoSR6GC3BTOdSK66L5IaVmIUUjGlyPZOwytK49gH7qT5GYbj2Q+4pP4rkYh4VlT+G0FyoBf4iSiO3LXE6agbOmPE4DvhXvaN/y2H8rPR0mLEh+IpSMOLjxT9LB0ZzL5AbbniUg2B2I8ZTV4I6UB6jdjItBl4ftbKHULRrTjhHQgvu8FKP8nhPss9vtJmBgUsQIJ80gcx0fiO3gMJ58PV3nvE8q+zyEt4rwZ9dDI8NmOfWscacIVJ6aDwjNsIcn6npIPMmpEdhHWgBDkXkepoB+OLoJYXXckmsNjrFY9dvJf89QRrP4YlBrv95Bwj/NR6H8O4xD+Hwr3oSR3xY3UVrOqiL3D+SI5eBAzjYopzKOw0vv+KFC+18s514S/FwJvKzvPGrrHB1H5HUBalPZunPkdjsL8IRSqc4F/Q6vbk0jkrkDl9GZMx74LiUwljAufQ9BqF5e2uCR8xqJL5sBujp+DFs4vhXvsLQPzIJytt+GseQMK8yXhHpYjCdiGiqCacf4EXbPTVoX7+V9UtmPQbVJ0hV4cjt2dVMH/SkyYKFpvPo0z9c3YjrfgWHktKvl43ZjVNoCuSyRtwL70MBKatdi/Y8xWHINbw2cjKbbkhaRiioPC/nUV2uEuHCPXhc8ROEFpQ2JwX2iLGwrHnIp97T3YD+aEc8wLnz1wgrMp3Nei8JxXIRnfgopuD7QqjEeiPDlsHxyO+zG27Zqye46hC52ouPchWcBWhG11SLiXojKPGXo3U32gfHc4F/v3fhif9Q204pTHEe1DkkXbSQtJ31nYZ08sVnwgTng+Te9K/xwkjZtw7FayVEW8N+xbfPdXomX4QrQsf4ZUlHUzyu6L8X2ch6R4EbolV+Mk9opurjcdyW8HkssD8PmX4rufj9bpdhzDbeGc3bk5QRn7C2zfpSifBoTnXx3OORDl+nYct7HO1SJszxHh2WLM1WZSeZ4ekV2E1SMTrBoQYrAGkQIDY6DxgLB9FA7CMZQSrBXsmBtpZzAy3McRGEw5EZX91SigP4+CaS4K5k9R+4LFRYxHpT8WBccNKEDjDHgEusI+TOlK93/E2WR3mB32GYmZSdWY0EFBeBopS+o33ew3DePBYu2ePXEWPTh8/ym23cfCcz1E13aaheTyi/iccdYYcT1mZB6M7+J7vTzHG/F9VFvCoTt0oPK6kWR5HUqarS5EBT4drScrUOl+vnCO/4eWkW8iIZiL5OlUzML6VNhvFL6nGJvyfSwdUsR/o3vqkMK2X6A1ZTnGstXisnwN6V18Gi09dXRfE64ci5As/QPfc8Te4VyfpPQ9LsHneoDSAGlQof03jrkYrL0a++ydqMQOIfX9Ufg+YhxNdH9OJq0Ttwb70tGk2kZfwvcU61JVi4NQFuyFZHYVKuKVSEhi6v8YJGdPVnHOQ5C4nohk+jKSBai347YjoViJJKsB2+wQ7I9/xMzmavBNbJNr6T4J4EAcc4PKtrcgmVqCE4SXh33nY5D+rYV9X4Xj6BactJ2C7XYHEuaxKFMnkJaeiQH7ddgf7gnHDkRy8wSphtjI8L0ka68CPolkeQK24xpsv36kDMC2cI1Inrb28v8ve7nm/yETrOqRCVYNKAS5DwyfNlJ6cgMKr+mkOlmDScGEOztL3FHsHj67oTDbDwXiTBzQv8YMmp3FABRUMUumPFbjXJIS+yeSkvHh+7+TigR2hxHouhiMQvSTZb+tq3DMHmjqn49uz0qCa0DY7/347uZiFt46bKeXoxC6Ba05r8GZ+EIUvoehUpiEZG4+KtRmVKaxBs5NOMt/OgK1y2PIwJT0QUisJiMR3p1U4+gnaH28GRMlDsZMyf9C6+OZlLpsf4Tk7N0kt+7FqCgjCfoKus7GYr9biK7O/cPvV4Xvh4a/b6BUIS4N+1ZTHmQEFuE9FMlFkShtD/f6dkpdOsdTShD+icRvW3j+idhOD2JfKMbqRMwK+8Z6S5PRKrKAtEhvJ8qHteiqXhqeczpmpx1Yds4OHFMrwn6xHMyFSIR6SpSI7tWIqfh+mvBdNGFbrcA+ciu+83n07OZ9A/bxiaRK4tVmFx+O7rEYWN4WrjeH6hduH4mZvydjP7qEyhPE81AGlMfIge34OiSrA7BvzUa5tBrfyy2UWpNm4DvdivL+PuxbLwjbH0CL0kGksiPrkTjVoYVzNPajJ5BwDcGxNzMccxs9lyl5B05mY3/sJHlKtpKWz9mObdtOzwRrFTVkQGeCVT0ywaoBwUVYjAnZjG04AWekU0izzwYUzIvCp7dZya7GIShM34WCYDsqwI+U7VdH9YUsq8VX0TqxR2HbqMJvrw//v4XqhPTZaAlqQkW5jFS35TdIaouYgQLwMZKbrxhPdTDGob2T0viGe0lL3HQgeVyOQnACvvtIrKObuJXSujn3oHL9EbVbHWrBifhedwv3ORcVyEq0XAzD/jg6bI+VmTvDcxSV9Hicnc9EgjmelIn5eXQxj0RL3OlheysSqMOxFMgYJJvXUUrg3x6+34CWtZglt1/Z89yGBOYYdCNO7OX5o+sjvodtJAIf8SSSpncXts1Gd/I5PZx7FfazpTjGR2DfiYkglxf23QdJ1gHY7xaFexmLirYB22xy2TXa0eW0EbPcYoB3xP7oOjubVBtrI47jTeHYWFrl3h6eJaIxPMs5pFUIZob7uA3HygM4qSliAKncS3R7fg3f5yP0nBQzhFQccwr2yfegzHmctKBzbzgLXePrsd9eTmWZ9WOc2BVjB5eFfedgv7ut7JiPk5bZuQn7x3Dsq5ORVD6MY2YuaeLyAKV1umaFcxxMinV6Eon5DZROEp6H7bkQCVt/JPHLqYyv4zgbSioUGp9xHbbLlvCc0S3eHcH6VjfX6BaZYFWPTLBqQGNTc3QHDsG2i2bgMaQsp8GkoolbcdA8Sc8+9V2NmSjUB6OyWofFQ1vY9eupnReuVYez7sNJmXKL0O//CyQBXyElXpyPgii6s6aTlrtooGsA/kR0zQxA99ULSdaYHUF0kzwUrjUT3/WG8Ftn+P3jO3GNUWgJaiS5iIajVeP6HTznDCSyE0jFGitZ98oxDGfFR4Z7uQkV/eLCPjEbaTCS4TPRIrIRlesCnKEXA6rbURnG7NGhaMlsDPsvQSU2M9xDlEm3YruvQ+tjK77PD+J7rhbRwnMBKXZyDGlR8+2kBXyHh+9vKztHB7bjPaggR6HlZDdU0Nejxa+Il6ACHx2+z8f+/m90X9D2BJIbeRKly0ZFRbkCyW15QeH4+wYk1duwzdaRlvBaQmmJggHY9uegtXUaksf14Xn+SGkB0YiPoxt1Wvi7DsnMw6QYr2rwHbT03IruwN7c/y9BuRAtVpW8AnvjShSfKtv+13BcPb7/uejau47SmLaPY1s0YduU42KUV9egK38+XWMzLwj3Ohv7zMVY9qWzbL8DsR9NQcIXE6Xuonvr4fGYUDMbx+MyJFjbw7ONCufoyS24CNt+h5AJVvXIBKsGFBaEHUAiVdGq1RC+D0Hhtw4F2taw70icxdahEHqERBh2NfZEpbENFc5cVL6Pl+03BgfqWBQwY1BBLmbHUndPxNnZC1DY/x3b6q0onIuYiwL9tyhczsUMt2I8zRXYvhtRONYhCbsJTey9pagTrn8ICptp+JztWMhzAgrh28Lfxyi1IpyBwvBFpODqtvBct5Iq/G9CYXptL/dS7r6pD9d4LyrvtUhmfoFxJtUQpXLEFPDjkDyNRyE7JZw7Bpe3YZ9oQwXbhu2zFt0Va8LvdSQr7VBSPbEt2J+Xo4t0OClFvTzo+Lcky9cC7Icx+zZm3X2IVC7jg2hRW4r9OFoe/w3j7I4qO/8qVGofKGwbjhaX05CAg8r1cSQkL8S+UB6jU8RtpOKhgzGD7XIkcOVK9lTsvxOwfVYiMVwXvkeL4BZUwm8iZZ/2w/apR8K6Ft/bEnwHMXaqL3A89ovTSBmMt+I7v4aurqp6nAztEY4Zj1ad+N6uQqI1j5QkUX4O0DL5DrRcXoju6HIr/xEY11YXfntrL8/ylvDZq7Dt1yTL43443haGe1uCAe3lOBWtRPXY1ttwDPbkvnwHxmg1F7bdjgH/a1FuXY7E6BXYH0eRCqUuCX+L8qYSzgv3N5YUa9Uf9ctgUuxVG90TrE/0co0ekQlW9cgEqwYEC9b28HUEaWXyASgwx5FiK9aSFlbeHwdTdB3OQ2Jwz1N172jZOBAFS3HmF61BM1DY9iMFTbbQ1YReC76MiqKVFCB9GgqhSrPD7vAYKraLMM7iYZyJH1vYZwFdSVtEDGa+mJ6X3KlHQTQD22omWmgakBDvgdaAy3DmGAnyTBR8hyDpiHEsHahI1qEynotCbhn2mdORfHaggB0bzrUs3O/j6Go4IVxnTXjO6MY8CAV3MTW9M9zjP0jFL1tJMTZ/pWsM0zR8HyegG2RduNY/MCliHMYG7UeK1/kbyTU2INxLY9h3BqlSeD+SNfAikpv0mPB7Zzh3JD3l+CQqu7PQYvaKsP2W8FxPUBqUX8QP0VU3iZRxFWPkFlG6cPdAHKNjcLwuC8dtIsWw1IdnKWYQ9oZ6JLn7IKGLig58t6eR4iS3YHs/hO10JCl78chwPyvCM9xK9QkfPeFEtApNxTZYge/qUuyzleLdBoZnGoITguhKLkcrWpbrsN9Nxbi9BRi4/x/ht0U4NsajpXodtsEnqL68y4XoZotow0SEB/H9Rdf4yPDMdeji3kSKqYsoxiyegONpNk7sZuH7eAjfSVEGFbEFCVMnTlC34PhYijI4xvI9gnqg3LrVHd6KE+ZIaAfhpOYubOvZOCntyYKVCdZThEywakAZwapDRTcsfG8I/2/GwTecFOg8gtJFou9EAVoeCN6XGI+DuDweKcZvjEMB+QJ0S6wjWbaWoaC7B2MLdhQ/QSvGD5AUDcJ4q+MoXTMLFIKPo/L4H0rjSKajIhpGWupiMxKS6G78HEnRXhWueyPOgGMw+v8jEbu/ItG8CxVBfBejSJluU3CM3ITWqBE4w19U5fO/GBVQBwr7iwu/fYQU/7YSle9NSCYXIHF4MSqKa1HR7ItE4+XhmA+H++8O54bnWEpaimU/JBHRZft3KrtaYiDu7tjuo0l133bDfjMGhfbd6HKoJvNsFrrnojXhKrRoge/mNfh+B5HqO0EqrhrrO51KItQbsT8MJo3HFRj3dhNaOzeG809FxTg5PNsoHKsDse23kcjDttA2W7H/Xo7v5uU4gdqC/XQ5SS4UMYNkvZmOpCKS1E1I1P7aW4MF/BEnQANQQd+IbVdtUHglHIzWvwNJxXxvxnaOcVg94RCcdMQSGbdj/9gTrUhzw37H4xj7c/i7HyaVPIlj4pqdeIbXkQqlgjLkKozFjKUP9kLCNBKtYgPwWWdjW34cyU501RUxLTzf8eHvEByXg1H+D8a+8TjKteWF73vj+18Wrt+C47WD7q3RRR1TjuNwPIzF/noQkr8rcEIU4+pmoJ4pJ1jzMAt1p5AJVvXIBKsGFFyEoFl2LBKWDhzMdaQOvTsO4FGk2Kx+KLTuofqictUgWl6GoQCIdaemkqwjMcB0Cmlh4nokOp2kNPv7+/C+Po/WlT+hIjgC4z0uKNvv71gLqVhfbP9wn0egMNqAz3cNKs9+qDTfhjEJ7ai4b8Yg5vNQcXyRUjfAw5TGZrWj1eA7lLr0fk1pLFEteBSf+buUBqq+CZVPO7bzp0nWqDegsokC/OiwzyAk6gvC/0chIbiCVBC2GhyL8W97hPvrwHe+HcnGACRK3w37Dwr3tqCX804K9zoBydNuSO7n4zvbFK63JFxvPCqKaOm9HonQmnC+4eF80fo1B61V++OYOjPc72DSotCXhv3iOUAS83pUclPDuVajgr+IngPBo/I6nhRrNTbc7yokrLfhRKohtMHEcM7NpHiYmeHY/uG439EzIe4OX8A+MS58X4oTilvYcTkSLaOvQ/JXh3LjIQx8vh/bK+IAHGvH4nu8GSeJY8L3JtLk7b/pvl++CRMdluA4nVfFvR6A72IhWo93w/HyUtL4acGA/LvRKrQvEo74bDFuchyplMr92JZ74Tt8FJNupoVnjyVm9mTnC+dWg/70bMl6OWkR8L2wL/8B+1YsL1OMAy4SrLf01U1mglU9MsGqAcGCNZBU/6qOtEBm0VJ0KBKZaGGJnb4dBc91u+D2JpLW4OtAYTERBdFoFJ6DSKm8/UhF7lZXOF9f4FTMblqO1pY5WJLhMBTwYNbg1RjkOhSF7+k4C9uA7d2B7Tue0srYnXStLn4VKp/ZpJntXzA+IuIOSjMab0PXYZxlR9xIaXbbEmy/9UgExtI1ZicGqNbhjHkuWl0upDJOx1ii+agsv4RKYxC+y1GkpXC2YPtUS6p6Q/9w/hn4bNVa5qrBC/D9T8V2/S3drG3WDfZAQjgVFUc/JEbX0n12FdieJyC53h0tfQ8hSekpvmUKkqlTsW9uw3fyPWrL/twf47nasd/OQ/IxLTzL10lEfjDdF5WN1t7nh/uK+EM4vuq6Rd3g5TgOD8D2bUfSfi3KpxjPOAP733AkL3fRtSzEWCTNb0VZshAtOMvQArgK3XLfxP72MFqNeurHw5HoHYVj8uNIeD6Ck7RZhX1vRVIVrbKb8F23oUyZTMoG3B7OsyTca38cz7eidTj2mTH4zvbEiWJraKe7Q5vcR1pHsDyWEtIKCBvpG0zHeNb9kWDeixbQpWhJvIA00S53Cz6AMrFPkAlW9cgEqwaEMg31pHbrTyrXELEvKoc6nCkNQ4LVhtaAq+nbiu79wvVWkQJfD0JhMAxnZsNxQK5A4biOHQuY3hF8BAX0fWh9IPzfiBaBX6EA3YzBzHtTSn5i7At4/2ux3bdh2+9F14yq7vDvWG9rX3RfFgPorwn3clFh2/+QZsm/wUBWUIm/D4V5OyqqGYXjNmLK9t34zl+DSvLycM7yDMh+WF9qD7To3EjKuouZXYeF88WYku5wPL73JWgJGhuOGY9tvhgV/VDsE22okK4mWTQXdzlr3+F4JPyNSEC3IgmdFz5bUCGejEplf1Te69CqeC9di8YehC7kI5BcRdL9W3yf5QHo5TgYydBydoxkziKVDugM1/tq4fePkgp83ogW7O5I24nowjyf0ti636JC3VliFfFqtKDGLMeN6E69mmTFjBiNzxbDDh5AAlUuQ2ah1fkwHKsbw3GHYp/9LWYKR/I2iq6y8DS09IHPe1bhtzl0jbO8L+x3b/i9HsnpONL6e9NIxT6jC24TEqtVOImKoRwd4X5BcnhDOPZ00mTrSZRD00PbPInEcwrK+tvD9wspHasjSesV3k1t4+w0HM9N2O6/CdfdAy33z6drrNUWnNR0F6O4Q8gEq3pkglUDCgQrFnAbSFqioh4HcyNdK7n3wxlS+cxvZzE6fOIMKsZUTQ3f90SF/QjGAFUKWH0q8B20DDyGQcujsP7NIBRg94e/I1CInI1KZmSFc21FRdBBqn30BMkl8Ifw28nhfHNx9lluCegOf0CyEwPYP0ciVj/G2BFQCJ9FqsI8NmwbiQp0Triv7aTM0c2hHY4O93gkXd/Ju1Dh746Wrx9SOa1/NCqzZlTeQ8L1BoXrVxNDUwmDcIY8Btu0HyqTx9Ai0Rdxg7ujdXUJjo8ObIeYjTsQld+j3Rw/FdtwD1Kma/9w3F7YNtsw9u8vVC41sLPYE9//bFS0C9Bl+/vCPoOwzx0d7nMJjoUVZecagoTqhaRixRF/Q0V9EX2DvdGauz+2X5Gw/B77zvUkgh+tItXgw0gEDgnfVyHZvJDu46xmYNmOAwvbvoM1sdZi//4hpYuyL0B5+l0cGxvDc4xGYjUVJ0XtKKd/R2nW5TgkgUOQNJ1DyvLehm3+Why7h2BW7wvRurcybJuB4+1RUp245aQ+V8QklGlTkQjeQu2TmA9j32gP17wkPO/J+E4PpyvBOrvGa1SFTLCqx4Ded8kooF/4xJir7SQL1WDSmk/liFlsfY3V4TMTB9kUJHkx9ioO5ut34hoj2XkF9Q6MifoUCtz1KADmoPDbiAHoJ2DM1E9Qmb8mHL8JrT9XoxWjiPNR+f8IXW1fC+euJwXARzyOym0J9v2zyn5fj+/xTSjEf4jWhwcx8+b4wr53YBufhW6WjnD8SFQWB5LqUJ1Iik9ZTbJWRSvGcBSKT6B14PeUFq98Ewr/vcI5p4XzL0Y3yv/Sd9hGIma3IoH4TyRb25BEfKyXcwwgLXlyFAr/idg2g0jr8V2K72QuaaZ/OmlZmCdRaT2K/WElye09Dtv7p6REjFcimd2DRDZ3x3fQnStuRzAN22MffO//ReXMwg9iSY8p2L9/SSm5GoYk4RiSJakNrV830TdZgmCfnhU+k8I1tiEBKhKs88P2OtK6k9WQq5PR0rsBx0xPE5mJ2BZnlm1fhOP9zsK2czDEoIiHwz7fw0nLOLRcNpHqSNXhpPd+7D/liT4rSONrKI7lQ7G/fZ/kzv8WTsxaUL40YH8eiBPFFiwfsjjc05xwf4fiJHI3UvHpFTiellBZR/SEV+H43xju8e/YjnuSAvfLA+PLreQZTwOyBasGNDY1x8DwKKDAARQL/zWgshxJIl1rUFDuSpfcnjjTO5HkelmBQv9RVJij6Z7kDaGrEILKsQU7i0+Q6hM9gKQoloL4Ei6uXI6P0NVtMRuDZF9atv02jAWZV8W9RKUznVS8cigq8xH4rqfiu56KQu1mSqt+j8TZ7qEo7LeS1gkDBd0+4bwfRUF5abjGKagY7kSh+0qcGX8JLWnlAczjw+eccL3Hw/d9w70NxPiX/0BBvqHKdihiEim4//xw7+tQObTi7PzusmP2xNnyEFQs07G96sIzXErP5TF6wsHYrgfj+2ila1HPiM+H/UaTLIiPYD/bmWzYIhoxM/RcUv2tdTjG12IQ+GDsMw+jYr62cPwxSDBioP7j+Ex34uSir3E0TgDA93ZL4bcvIoFoLDtmY9h3GRKZ9SQr6jTSOnyjcDwspGd8Eicie3Xz+4dINc+Ow2D68slPJP6PovttBansxmrs/y/F8bgdx107vpsYGL+C1Hfrw/7H4/hZgpNASFmOsdTCYmyno8I9zAnnm0VaAmkzjrfBpNivgTiuN4VztIXj/0iqPF+NjH03jqe1OBmZi7p7Krbpqdjn20kWrLvouhZonyBbsKpHJlg1oBuCNRE7dwMqmOGkQowrcAA+iAPtYLQ2gQK1vLDejuJkVIZTcOC344C+BRXjBtIiv4+R3JZ14b43oZBs66P76Q3jUdDFlPqPYwDsu3DGf0jZ/g8j+Shvr30wMHcUCpbD6Voq4CC09jThTG8IzpYXY1sdh+1wLSq+f6LgvAAV+71IduaG32IcxpmUFl+dgcRqZvj/TWH7fZhR+EUsMfEDbPslSGbWYZ+5BgX3YFKZjFNR2f0QYy5iTaCxGLT9OFqUesqIA5XVNGz3/fFdLw3XO4FUHHU6WhiLQc694V0YVxaxEhXmH6s8vhzDkcA0k4qiRsXxT2ynjrJjIun5T5LV8i603F6PM/6+wgBSOYjl2FdmhHu9Gp+/UmDzEWhpPKiwbS5OCL5E32apTcP+uTdO8GKM0soK+x6BMmACJlBEGRfjSNchYVmKbboKLXGV3NYRdRjj9Tl8V7ejLDqaVNPtfiTExaSSd+K4KcaegRamK7GduithcDyOzX2RUMaJ0r1IsmNA+xh8f8ei3GzHLONvhvO8INzH3HCPe4d9xyNZXopW0ckoj54I++2G46o93P++SLCWY39YSGksYAPVWZneGO6hH8qtB0llgEaH+zgW+2O0cq1E/bIzJTy6RSZY1SMTrBpQWItwG0nIjyKRqjEky8dCFJrRPH8UKaOwHgfCRfSN6/AUtAQdHc67ijRzn4tCcnO47zYUusvD/5upbL16KrA7WiP2D9/fhwL+PLpW576OyuvF7YZKdyy2Qbl147Uo7Gdg219LWqJlDAqsC1FBv5G0rMvHkUA9H61n0YWznTRurkJiG3EQvuPBKBTfTql14CtIiG5H0nMWKrhIui9G5XQwKsnvhn37kepBbUS3WAO2094o9H+F1qq12BfLlfwRqLx2R2J2A7oid8Z1NggJbUP4/mt0ly3t4ZgJ2JYr8Zki8R2JpPdKbP9I8A4InzPQnXwxXbEPktFXkda43I5tsY20QDukOnXrSYvvDsI+0UmK29mAbTMJLUwxAP4OuirGBrQmbKarNedouta62owZgldWeJadwWuxLbYgYVjVR+cdiJOXtUjcFmB7bKC0Sv8p2OdPCb9fh/3jLFJCyY04DiLpHYbv7pOkcRDxGbq36p2CJHwPHHNrcEK7PtznQ6SEhSH4Hm7GfvF9lHnXU+pevwD74wMoH14d7jvuuxjlUhtayYtlZXYFTkLCNxKf71G0IK/DdhuG5GoEjvlOnIg8SSoU3OfIBKt6ZIJVA8oKjUYMRgFdT7IStSPpmkyqxRID3htQ+S1FwTtvJ29rb1K9nj1wMN6Nyn8bqTZPvO5afO89KcGnCnEWN5LShYPX4wxsJKUz/m+GTzHQug7jrl5d2PYpUhbXZCRw41GoVwrSHoeWmPZwzSEouCZRWhZiK7okZobrEu77wxXOOQuV3VvRyjmdpOT/gSRiLilYfzYqiHNQ4SxEi83VaNEbhe2yhGQ9mBTufTaSpWgNmIGugwmF896D5HUhKYC5iL+hEiVc54N0X1oiYhDJXXMzKsOo1CeS+ti+SERHYfs2Y9+8jNRXizgea5sdgEpkPSqMtvA8I7HdbgvXWByuO5cU4Dsw3MMEfIdr0YqxHsfBTFRMw8O25aGNYmmQI3E87YP9J9ZS2h7u+05UuuWTkxeH540B60U8gnFG3QXv14Jp2KdiDae12C8qFY3tDSPQcryGlGCyFp91DbbH3iTy+hDGVd5TOMdX8Z3dhZbRhUi2o475HU5+bi679l+R/JTjs+F5BuDzNZAWL94d+95AJBXRBfcQ9oPFVPYOHIIktAOJXkwceCmOubvCcSNwgjUl3PPvcBJwFo6/j9O7W7Qc1VqsIvbCPnQI9unFODG6jrQUV3+02o0kJQStwTaIMrTPkQlW9cgEqwaEQqP9cXB3YPsNIWVvQFpyY3e0royjNKOwAQfypfRNjZTnoVCPAbd34QzzLnZumZu+xDhso+6edx9SJXdQgJ2IQmMEtvm4wv4bcI2v8vTjozB2on84fjm6EL9KqiodMRtnh69ES9Zfsb1+hMr0RzhLBq0WY0iWtnLMQ8UUMw9HoXCei/FJ+6FLb3j4fQW6Lx5BpbAUyUwTKpU9QltMRMvNeeH5R6FyHoqEcbfQFl9Goboq/D6YVEvslvB9JQrdotVkOBKN9eFeTw3XPhiVWszQi9l9/UllIoajYhyISmlDeI4F4d4fRGX0UDdtBo6fmeEzJjzj6HC945CEbcAZe//QZpvCvo34DgeGfRbi7H5uaIfNpFicnu6hiLchqdszPP92HNebkZxNxvcaSd8yLOAYi4f+L1o8yy0xl2Dxzb4ICTg0XH8kKt5HqDxJm40xOHXYz1eHY3oKsF6K4+o+fH8DKa0KXnSJvwCtcKeF7wvQ4jQXicEFhX0vQDf5+sK2o1AGDiq7hxjPdhtpSSOQTB5IKqC5Gvv/SSg/Yr97BAnRUhwv85GMnhTu9W5ScsWrcGwNQzf8RnRhPh/f7TzsA0eG+/g1XYPuR2JcXTv2576wSo5FMvd8HLvrwnPchERrXbifLSiTYlJT9EhEInpHH9xLF2SCVT0ywaoBjU3NMRV8MMmSNYBSU3wjKr9JqCyKAe/16Pq4jL4x309FhfgGFAJrUMlcjQJmEU9fNsl/ogBcisUVl6AQi4Gkl6M1qii0D0cB14nPEANSjyVl6x1G1+zXDehi+PEO3Ge0YByOinERCv1ocTqcVCTycZxZTqt4JpX8foXvM/D9TEFBeC6JKP4OY1nGoJVlD3QpX4kuqXejQn8YLQJ3IWk6MtzXtWj5GYkWn/FISs4mtc9yVGwP4cx3GCqZ/cNnALbdCJJ76/ZwXCzJsJzeCcpL0CrVPzxXX0vgYahET0drQ9Htuilc77toHVkctu9Nqm90EMk1P4KU0FDE2nB8K5LUB1GhjULC+RlKi1tuw/b/ACkz7JSw356F/R5EK8gP2DHshu+sHd/D/XSdqJwa7uPIbs6xEWX9OlIA9hIS4R8dti1EUrEc++QUVNbLsM0r9fs54dpPIun6f2F7Oyan/LDCvX4TJw8Ri5GE/oPuMyf3RRd+I06GHsXxWI/jZCLK5NtR5oxEa+HpSDavxvcQM6o/j2R1LcrMSaSEl0UkcrVveMZfUxp3NjOce2Zon+sx3nVn0Q+tbM8L97IVyWMLEqZWlFdLwzPvFvaJY35QOEcn9tG76GNkglU9MsGqAYFgDUChE2Owihl4sf7KMFSkY0lWq8Ho27+CviE9k8JnGpr3TyItcPoXHPQDKc0AeqpxIaULsMaYpQOQEBXTuX+BboGoIN+JxGoyCrprMXZiceGYibj478sprZMDPvf3KA3A3hE040x3HcY5taLyjsK0FZXV4YVj3oyB8REjw3O8AK1z/cMxtyPRHIyEezckEEuxFtAgJGlT0Oq1KPzWgrPXlyG5rsM+dycS1mtISx6dgaS1DvvqeBTcjSQLz3KSVSYmRkTr1mxKy1N8CJVmpWDjmWg1mUHKRLuQZJmsBWPCeSKpmoFj7mFUrrdhG5VjMmmNuBhTNZfei/sOCtfaBwnjNFLAfAeOqa/QNYOyiAPRlfQ8tNA0hHu9gZ5LWzSgct8LrSH9kNxdROUyCeeE+x2O72YKvs/laAWtRzkV3aKPIXnqj+0zjGQJepTk7m5DMjEEJzIjUI4ND/uOJq0/eQu6hNfjeHgFyiCQnBxYds/7YX99T9n2S7E/XY9Edp9wziew3QfjuDky3M8cDHu4ltSvdkdZV8y6PQPlxyx8dz8q/PYdbOMnwr02ozV2OMrKVeF829Ei9ji+o0GhDeIEehsSy1U4NlehpXhB2TN2l6Vdjhkoy4/DMbqJtK7hdeEaxXPvRmkZinGkhaD7he3rqN6CWxUywaoemWDVgBDkPoBSoTc2/B2Ig2IipaSqPux/Jz0L51owFZXZNCQrM3GWvg1n4ZfiQBxV2BYxLGzb1QGaYFmCt5CE8vXYXgeH37+Ns8pRGEM0EOM2vt/N+Y5Gobkbvoc2NJ0/gW1/MykNvTlc9/UonDuQnMzDd/F7uhZ8LGIwKoWjcaZ7eLi/GN8xIDxH/3C/VyNJnB6OXxuOWx6+zwjXflFokxh38hFUcgeG+xyPBGcN9p1VSMKiMjkQ41+aSdayXyEhLeKTqJjGkapvryIFpK8hrT23EvvQEHSZHoik4O+UViQ/g1QS4kzshxELMBau3FITiVq0ED4PrWaxDw4Mn5h5u5lUKftBJMk7i+ehhXA89v8J4b4GkVzXF2L/6KtyDkchiT4Iyc9CJCLbUGmvQgXYW5xMfyTo47B/TMN2Gof9PWaGjsCxsC5cI8aEFi1X27GtIxEYjuSsHdskuoWX48RhNY7NfcOnkxTe8Dvsw68hJXo8jkSrPCPyZBwbQwrb4ti9jzR2IqYiUX0+KWj7ibB9HL7DBzEGrFymziItFh6tXZGUnI7yYEM4bjyO4d1CO91ICpSfE84/E8f03qRi0u0oz9aQYr+WhjaLaMS2rieFBPSE/cL9nUFaJixOmO4N55lH9ysNTML33UCqudeJ46gvYv7+D5lgVY9MsGpAIYuwg0RQppLMsiPCZzyJYG3F2Wi1ae+9oR9aFaILZA+SwliGQuGWcN1O0npnUWkNJM1YY42WLfRNJuHpKGDjoF6FAuq0cK/9ULDGWi7TSHFND+Ms8wfYfi9HAX5G2TUewDircnP8aJxBnxKusy++g3X4ftpR4d2LwugRbIt9wt/4PkehQhuNincZttPWcM74Tr+D1sh90cLysnB8J7oTYtB9eRD8SFS+J9N1Adafhudbiu9jE6VZWl/GeLvRqAR+XXbuY9BCMAXb/n6Sq6A+PP8aFNL/wLZ9KVq4tqH185skgXwoLqcyBd/plaE9DiIVV+0Mn7pwjejyBBV6Oyqe/0LXeF+jP77PQ8J1p4bvu5NilQZiH1+KROcWtPTEbLNV4bkW0fdV38eFe5pXdu5DkETsju03HicfkfQMwX4cExseRmV+Lyrg9nC/V+K7mI+kvzzWsCccj2PjCJQja8J1o8uzEcn0ZGyjWCajGcne2eE8G7C/X1t2/vFIwD5Z2LYEJwR/pDoyOxr7dROpxtWm8HchaVmdYShPzsVJ2CZSjbxxWI19CsrH6M6cjW22gmTlXILlDWqtW1hPWgGhDd91O76/SuUxyvEWbKv9sT/chwR6I76jxeG+yzNSI8aT+no9KaFmA9mC9bQhE6waULYWYT9S9uAAUmzWaFLg+2YUjDsbzH4ICtUrwnUOwZnaQeF6a3HwrcCZ1x3h3kaRskoI5xhIyshpJy37sy0cX8klUS0mIUmIsSBfRFfOOpzlno6C7BvhHmdjrZw2dL8sCNt/jUr/tvD9dlQkcXb2fiw5UI/Vlv9jB+51JBK4QSgAB6OCvpVUWuMWfLfzduD8oOXkUmznn5OW2YFUuPR9GBQMvt+1+C6eQGvBQJK7YxwSgW1IfK4Oxx2JLp3jUTEuJymIOAG4mlSs9WUky9CXwjPHTL7Tw+91pPUzYzmD3bE9BpHcJcXkg4i/oIXhMxV+ewEpxX43SmNxdgbL8D1uwH68Eond8diOc9HyeB+VFzefiWNoFvbjiaRK2VNQ8b6EVLsNkoVgazh/tC4MCvvFxII/YtudiERmGRKia5A4nEKyaN6LfWYWvtM60rp18Z1MIrn57g/P2xjuty084xKSDJgejl8atneE/e+mcip/Q7j2+Thh3BTuaytODM4q7PsDdBuX48V0jYn8Hbo97wr30IDypyO0z/7Y1suxP0Yr23CcEG2pcJ1mnGyeFv5fjbGNvw3P/lHsZ5E870YqOfEYtuOB2M9vxvFQDSGKGIdytQ3HXDspkWBpN/dcjneiDDgifG9B8rkWdceGcP9z6DnOawY+z1DSaggbKM323GlkglU9MsGqAYFgxWyqOtKyOQ0oBOpRYMQZfScpjmAKKvDtqLCvp/uieUUMQmvOdBx0t6MgPQOFdT8kItdQXdZgtGj1C8cPJi0Muo6dqzg/CgNe313Y9gecncVn/V9SPatoWfgtxkqNwDiUBdh2a8L9vQ8tYM9HAbaSVLxzNRKOE8Lv+6MCGh/OV8R20js7ieQGKcfLMWamscJvRTyMSmQLKYsuBu3PJFkTzkHL0GaMUbqF0nIRb0Hl8LrCtjuwnyxDcrU/KribcWa+Ddvmy9g3NlBaTXoU9p3bsM80odKO8Ts/o5SYno5tH7Pu1qPyaETldzCSjhlh/2gF7UAC8S4SOR+CyQwx+D260cuxEBXn5nC+ofiOlmEf2IrKvT/2hyFhvzj+6khlUhrDdcbiWOsrbC3c52/RbbMArZAt7Fi5kwOQsLwDy2HEmlxLcfw1Yh9+LFy3H8blxOfagONgcPjtYiSH05BQTsb+cQtOXOrDZz90/bagDHkxTgKGIuGOWa/vQUW9NPz/aDj2PHRxg33q1ArPdgxasV9dtv0aJPk3YN8vb7ep4blnYl8djX19frh++Th9c2ij/uGeN+IkJlp84/1OIrk6Z6Cc3kayMj2KRPM2ai+90Bc4H8f9sYVtD+P4X4L9YiNOuK6j++So8Tg+4uQnytt1dI0J2ylkglU9MsGqAYVK7nWoWKKpehgK9gYUfh0o5EbiAJ9KaZmGlWhOv5nqcDzO/DejQBiJJKAfCuHb6D5uqTuMoHTtxAFIFFq7PaJ6/I6Uvg3Onj9LirM4Hy1Q0dK1FAnIEBSWV6AVJCYDzEarymUkErk/KTZqNr6HEaiIH8O2+S2lweaD0Qw/CF2Dr8HZf39UUHejItsTyWx7eJZbUPl8Bd9rDGhfEj6bSYVRH0BBuBQJbEs4jvB895HchMXg76FIJF9B5WytDSh4Tylsez8qjX7hPoaGthiCM95foCI/DxXpiaE9Liico5kUWB8tPROQsB4W2mI3UuwWoT0+SGm24ClIeGdWuPf54bwbUamtwPZ+EJXfcHwfe4T/n8CZ+mYcV4PDMw3EsbUR+2pMNBlLsqYNJ8XBtaOCeZDk7u1EojIuHHMAKWNudNl9bwnX7ktsRTlwP1qPtmP818PY967r4dihmEl3IsqQyfg8B5HKWbSS6kONC9tWIKGI8UNxQjgifF+Lzz4C2/R+HDtL8L2cgGQ54jU4wSnHu+iaVHIJkvlKlrJyNOK4eDfKpujSnY/k7O9hv73DfR1MKvfwrfDbeTh52hfl7ibse4/h2FxJyrB+OghVEa/BCefQwrYVJCvrNrTmPYxjrqcyH6OxHw8lBehvD+fZkSSTbpEJVvXIBKsGBAtWnDG3o9CKQbogSZlAWtg2mmuHUkqwFqCwqLan7o9CbhIKwONQsW5CS9jlVL/W20hSdmMMioym+rWo1NaGc29k5zIe98eZ5msL28oz7H6Oz/JtFCAzSAv0HozPezemb0cLyUkoUB6jtGjmO7FPx/ijxfiu+iOZG4WkZAoKnRH4jraTYl4gzRjX4MxwPVp3RlV4xnsxNf3S8P0CnJHGwPKp2N7z0ErwOAaDx9iyt6MyA9/xRrRafIa02DXh+DNIWZRvRBI7CpfRmUaqkbQF3TYPI+l5bWiTf6dUMZ6GhVAHIPnoR3KV7kFXy9Mn0L0b0YhB8R+p0C4xVuaTGFs3NNzjQUgMNiMZiDFy00kWhkXhE93YHZQu3h0txP3CvY8Iv0eX2MGkwosbKc0g7AjnXhk+K0LbjMN+0o5kJVoEYzxlEykIvA37YpxUbQ/7307qdyNQ+a8O+7yCrpmutWAZvpffYSzUYMy+m06qv1bE5HAf0ZL6buwb+yJh7iBZeaOl90mM6VuC7+JllMZA/geJyESMQPfWNyvcw83oEiwv1XAO9r09SXWdHsF3MZsU8rCaVEh0MKl0wR6kIrEj8f3OJcUubiCFFsSA+xHs2vVga8XZKDfGl21fi/phJT7/rSTCFbNoK6ER+/AYHAsxiSR6JfoqBjgTrBqQCVYNCJXco7l9Gwrgodipx5BmhXGfYXTNKJyHs5Fqs5WakFDti0KzDclFv3D9PyO5qjVIfRqpTld0b4KDeDOSihU4OGNc0M7iNLRcNaAl7oNh+54YHzQfhc7QsG08KpVfkYjUidjGl5LQHwnJNJwpl8d+RJwYzteApO1hEmnbC8nQBlSSW8I9jEF3w95o7TkQCfWgCud/KamOz/uwonzEjdjGj2Af2IZKbxwqk5+RagjtEdpgYrivaBWYj0p7Q3iW9+P7m0sq4rgUi5puRSJ6Jiq0G0kuyOlIRl8UztWC/ayJRFDHFO693GJxFgYTH0pyGUb8Ctt1BpLaSTgJ+B3OxgciCSq6gAeHexpFigncjIp+GaW1nyIZi8ka9ahE1yPhOQoJ5VCSxSy6xAeEYxaQJkjtpMrvg8Ix68Pf1ThGYoxltJ7FbLbppPXfNob7HUYqmjo/fOK9HRqeYSVOiqYh2duA47uORBhmk7JEd6c23BOu/0G0BlfCXhhPdRi2/4fQojMQ458OLOz7TbSsXVV6Cl6PBH4glXFfuJfrSJPRRiSaK0jLv9xL1zjHg7HdNpMWE38etkWMNX2E5EV4AmXV30mTwtFUDgGohIG41FaMbx2N/eZy7F93UppwsrN4nMrxi0vxnregjGrAsbwCZdsNFY4ZipPGydj/YoxtnChEK26fIBOs6pEJVg0IdbAGo8DtDJuHktKoozWonFTF/1txZlVLZ29GK8FBSCwi0VmDiqcFA8vBAfa/KCRuQytHT4iEcQiJeMRA8o2ofDaicFyNiqGz4pmqx95YmmHf8P1XSC7movXnbCQYN2Eg9xwUtC9AwTeflDkEKvG3Y4Do71GoFy1k1aARn/9YUoboEyi4r8d310jK7JuBsSavxXdS7lpqJsU9vBYDZysRsnK8h8oLtO6NVoJ3k6wNmzCj6CZsk2HopluDVoMV4bhPoiL/ChZ8jXg3KfOxH5KFBmzrbUgSFqMFo5ga/iK0xJU/TwuSsPux3+yF7po1aPkqxgcej236t8K2Y5HILcW2LwaZbycFSPeGM7AfNSBRfJjSLLZqMBPbZCBpuauZqMSOJMUORivvaJLl5M84eWpBQnAuTqjuomuWXcQEjId6Hale1VLsi/F9x0nPQHw3Y3EsDkXZsJFSV1NvWIQWnveTgrp/hYQ84lYcS+WlN46n+4zQK9FaF+XEbHQdjsR30R/lyeTweYwU+nAVqZzBCRjjdTb2x/vCfV5PKjsR4x1rQQMSy2Oxj44jWUObSBazhdifv4vvtTvsTlqLdj2Vl6Eqx++pHL+2mbTqwiMolztwHN5JacmUcsQJ6Si6Eqxoxa1k6awZmWBVjwFP9w08y9A/fLaRskNicPMTONAmkDIJ42yiLuy/ktpcblNJmVYTwzkXh89cnF0V47gWowvuEyh0/4PKmVwR28N9bUFlNJlU2byNVMIhZk3WF47ZUTyCGVOPhGd6FVodPo6p/P+FZOqL4fkIzxhn+osL5zoQBcfrC9vOxhIKA7D9HsV3cwmVBUwDEt9WkttkJMlaOINUjHF1+CxBpbktXG83FLAxwyxKoP9Gq9TPwzN+hZ7dROVELeIRbI8vooL/GbbdS8LnOnwvo3AGPx/f0TFIZBeSMg5B4noEtuUyUoD0KaRA6nn4Lork6gSs0F+JLC5FBRrJ7WBss8Zw7iLBWo/v7snwbODMfEQ4999Q0b0XJwsHkjIae8qiive9FRVnPfbridQWjD638P8jSOBjCYilSApa0AqxJvwWPwcgWX0Uyebl2AYfQPfqoPAcMSYsZhuvR8trdAmBYzFaEp8su8e3Y7+fHu4jTob2xn78KMnNNgIJ3EDss2/AGMeIH5FWWAAngL/DwPQiYXhe2LeS5eVh7B9bsN1PwrGzEPvnACSp68Jzt4f2eSL89lqM04yu3Sdx3H+NFIv1MLXJz5HoAj+VZPVcEq57P8nSegxazOpwYnILukJ7ipHdHcno3igz4mTs8PBbO77n75Ud9w0qkytIcY5t2MbR9Ry9E9HtW44m7Hv9sf0jue0gLaHT3sOzZOwiZAtWDQhB7oOx42/sZfciGnBwjw7/b6G61P+pqJBfgQp6eDjuQZzRXE4fZ4gEjCDVVIkzumiu7yucjwRwRtn2H6EyIvz2OVSwd6Cr4h6c6b8SFcuP6dl0/2okQAuQmIxEIX8QCvZ9wu8xK24jCqXorpuNQjcKtmHoShhLqkUUU+DPQjdoeZD671DQg669V5Bq9BTxEFpg1vTwPOD7eTUK3BeVXe/3aC2pQ/J3RDjvUYV93o/WwKvQPbMnktrjSAHi36Jr+YuvoHIuYj626RMYa9OOBOcSSoOeP4/KZlV4xiPQAlHudjqAVEjzw+F7xDLM7vwz3ZP8jyGBHxf2WYBtcj21LU91FJLZfbCvRBd6O7pqFoX72YryYAaSlzWYVVlu9TgKrSYHhH3W4DuahhOvGHe2G1pwm0kuH8K5W9E6Ngff21DMICzHoWid+RCO21E4Vu5BYvgkTtY+RenyP1djPODvy87XgO93CF3RHo67CBV5PZLiA5B4rMOJwZ/Ljjsc+8FumMHaiRa1h3G8RMvLdiqTinJEK+9JpL7+IFp97kFZNgtlybFIXDeQ3uO9SL424nvZFravQeLSQCrofFA4z8TC9ZeTJh7rkZi/idKx/AGc/HaHbSjXY8bsIHRx34vjJE6su+v7jeGeYnxaJ/bPddjHHu3h2lUjW7CqRyZYNSDEYMWYkVhjZEcwjhSA2B1mYpD4UTg7acJBtxoH29+ozhy9o+iPBK+etOTIEnZNBfixqAzeXtj2eSRXESeTluMYgOTyHiovlxIxFGfGMdD3TlRYy0lLyVTCG1CgNpIseZvCsdfhbDpaOYZjRmcnKsVZaDUqLxEBWj6+hFljoDvliMLvF6FQrgUTkAi8s+xcMUh7AJKLK9EFFO93cniG4Wi1OgLjcQjH/SdmIUZSPRWV7+zCNWIfXoTuygsptf78N7b/HHx3MU5sTyRz96NSjTgN48UODvtUsrBfiApnPirAcovW0SQCNxnf28/w3d9H75OEF6JSHtPDPlfju4wEaxCpZMIKumb0noeWxt1J62w+GY5tQ+I3HMnGdIy9irFhbSTLeSeS/zXh+MnhmOML13ocS3ccTVrW5XqsDTUv7PMetKIcF77/HS1aPym777fRdUH1iBtwzD5GSpYZjkTnICTd0ULXQVqf8QBS9fgHkYjPRQtnI9UVSj0S+/35+J4Hh2e7CNvysfDs55JiJh/GfnBl2bmaUc5Gd/TD4b7uwr5zIFq4jg7PNTE8z3qSdX9yONfqcP9XozWuiP2QDE/o5pnuJy3OHK3cT+IEYTFpwfFb6X6iMBDH53hS8evN4TlW00dxWJlgVY9MsGpAY1MzpEDUftRWkK5WnIbWjmNxUG7AwfsoZhF1F7zalxhEaT2pNVQ3m9xZTEfrxghU3heg4phNqtQ8D2fzI0nLW1xJWjrjBZjdtpqkxG9FAdpdLML4cI1xpFIHk/E9dGBMxj3h2v2RCNxROP5gdNuMwpnnOCQt5S6VL6ObDgwC/wYSx68WtpdjDCrqyeiq+T6JqEVMQXJxGqVrQIJkNSrL2ahY1qOia0Tr24HY5muxf72tcPwxWAB2JKW4GcdBPyRgV6HiGYfWtdnY7r8qHHMeKqzbyp7hHUgUK5WpKMdiJG5/RuJ0d+G352M77B++P4jxT93F5v1neL7ZJDfNBlIiykjSenfgOIju/uhGX4X98Akco41oSToEFeYi7HePhL8PYTsvCn9PwDaZjYRlG6kMxQrsewvDeQ/DcRDdi/OR1BddzB3hma9HsjADXcAnkaxiDyK5+ialS7l8Cic0RTId0YL9qLzvgYRnHFpOp9DVOh1Jwq+wf91Z4RyV8GIkZm8gyaI/Ifm4BInnq0hJFXXYJ36JGbYRZ+Bk7jASUdqMz74YiftyJLWjkIQeQkow6odjZgClZUsIx/4V5cHVZb+dR+laiOV4EGX75nD/W/BdR7fwIuxTd/VwDrBtZoZ7rSMVcY2B7j1NKqtGJljVI8dg1Y7O8BmIg6wv3WYRI1FYTkFBUEcqQngTfVzXpAdsw4G+iVTaYSKpRsuuwnx0LZ2GSuGScM0vovvlTtJCyHvjTPwuFO7/ie22HsnKVSjgjgv7N2G/nxj2WY4z3rvC/9cU7uMr4VwL0GL2AJKQQ3C2HMnVOFRKu6H7aDGpj1yGJOYNOANuQFfBB0guzkFIDstdM0VsprQY6ffC56PYJ+5FQfyj8BmLBOflqOg/igr8e+F5tiORGU9aYy0qry10zb6K/bCITfguzg+/R+V0BSnI/rXhMwmJZTxuL0rd7CORtMSYnEll12pBIvprbM9Z4ZneF551K6m8xRNILIag0p2KiueA0E5gX3hlaKNoXbkGlfI/6bpO5WH4/qaFe987nH87qXDlZGzrKUhi6lBJXo0ErD7sO5dSl9ksJD6vDN/vJ7k0G8N534797S7MDvxJeNbZ4fdiJt92JCAXYn9/L6ULq/8DyXA5SfosWoQOoTLuxvd9FJKPo3CycS9awK4Pz9BCWt5lbbjvK6i+LM1x4Z5PKWy7D8fgV7BtTw2fk7E//xH7QsREjEe9CNt9OcnNen843xDSot6N2P9XYt/fHdu2CS1ki0iLZRexCSdtc8KnErn6bg/PGttoBCnIfgnK//7hXu4grWnaGzaRaq0NQIIVg/i7i+HK2EXIFqwaEFyE/XFADg3/xxTtvgwijCnUx2I8RjvOeG9FM3O58H86MBCVyq7ELCoHmn4FZ4sr0TpwBrpJdgu/X47ZlP1QUB2Gs7irkEwdiBaubSh8HkKBOy8cfyYSj+NR4C1EobUaFczDSHZfgQrpXowbOYO02Gy/sP9DKOROQaW+J5KZSriQUqtROX5IacHHIuZieYbfVPjtmPAsp5IW2oYUL7QKrWKHFX67AslZEZWyn+7D/nhS+P6/4QNa8z6Igv6dJOXzvnDurxXu9xTs9/vh2BqPCgdUiBeR3lM5ouVnIo6XqaRZ/M1odXwQ3+9EzKDcjWT5+naFc/Y0eZqO1fenk7KK61AeLESi8WckdYciWVxF14DnK5HM9MN+eTUpc3EWKtXLsM8VkwS+jladYZTifiT6tyOZfDNp1QQwePtddJ2gfZOuldcj1uD7ugOJ2wSc+DRiX96HRMxXoYy6GfvP4/SedTwO38eZ+O4ibsNSLHOwXV+FsVrD8L28l9Js4kMwKWMGyuOl+G4XkRJ5hoVr7E+qa7aVFGP5JI6jB8P/RYvRqMJ5QLI9Fvvq1rD92rJnOw4zvMeG750oO2JJkLUoR4rxnzEgvTM8913Yb5+gtBxLOcaSsp2Hk9Yj7CCVHuktQaQqZAtW9cgEqwaEMg0DcHDEIMQYFxHNzbUEv3eHU5FcNaNraAUKzaup3qz+VGAwO5dRWC3GYdzIHkiMIn5LadwWaJH4OLbb3SicfkFyIZ1KWtx2OL7HtSjU7g7bp6CSfoS02Gqc7UKy8KzBNtiA/aABLTEx6xOcUT6I1pcbsP+8F92eUfBGvJhSC1o5rqZ760I5fo4WiSWFbQ3YLiejG62Ykt+Bs/sRhfv6CQb0l5/3hYXvMQ6rAxXshaR08pmo0BeQqtmDJPEEJMLFbLbJ+J6PCue6AUnGoajMt5JqiLWjEr6L5PJ9Ab6jsUisJyHxmkIKUl+CAfy3IGGLcZSDsJ8NxXd6WjjHRFSuM/Edzwv3HeOVBmC5iwPC9dYgsbiTymUEXooEf/ew7zyUw8PCPaxBK11L2XGHoKXwJCSiERvRZXd3uPfDKV3zknAvJ5dtOwnJ/FFUjhdsQbfU3/AdtKCr7Ai0CjaH/RYimbqDyuS+Ev4jPM9JhW0PIcn8PRKDiThWj8Z3dAmpbh5Itj6IbRHjKx8m1R88Ba2M5SS0iEjEnsB+dDPdl9IAidmM8P8g7IOr6bq+5Rn4riK5XR8+I7GtF6BbcjvJSrUi3M8wnFwMw77aiv17XnjOh3u4vxE4QRlMsmgOxHGzMVy3u/CIqpEJVvXIBKsGBIJVT6oaHWcHkJbUaKN0GY9aMRGFQzGj6wlUNjdQmjb/TEE9O7dI9I7go5hlFvFtzCCLeCsK2Beg4o7ZOFNIy2c8iop8PRKrv6CgqybQtlpMQcV7LmmdvHE49maQFMAtSBbndXOe8Tibry/bvhqV4GNIAAag4B6HFow6JD3fRaJXfE/1GF/2fLpmB0Z8ndI6Uk1oeTqubL8Y43EJKtpIXH6AiuZW7L+fR9LzeezLb65wzVkYIH9IeK4r0CrUQVpvsD++0xgHOQDf62YkkjED9/V0jelqRZK2HRXQXFLm2FZSNtcD6H4t79uvwjE6GpXr39GtCGmJoUHhvL8uHHcoErd/L2xbhe3/WIV2iKhHi1jRwvg4tvMDKIM+TWlx0O1IQsqtFqdjmxxH5bpZi8Kz3IOkrRmJwTk4IemP5ODPqOz/1sN9R7wIx+H5hW1/Iy3mPgvf9QtwIrMVXedfIcWGnUKKobsbid1fcdw2hd+LZOpuTEi5C2PCYqmZ6KodRioZsRCtYX0R7hHH0unhe0xk2IJtuwT73Ejss2tQLnWEe5pGIm8xkzL2y00oAy4pu2Y9jolN4bxDcAz0C8d2kvp3TwStKmSCVT0ywaoBgWA1kGr8bKBrBfU4E92Mg6I3E3k5ZmPAcTNp0NyB7q3bezgu49mJ2Sjkl/ay35noItxEim8C+9gdYds2UjHae1BpnI7uuUnYF1chWfkYXeOsRpLcredQqoDvI2WrzcDszaMoxQ1I5NbgGFmBWZGvQUV3Bboxh5Jcob+m1MoGxpkdQorDipaG+5GAziOtI7cXWpdirNIg0gSoDttrXXjuBajodgvtVEdK3PgT3WMAKr53oLt1fHi2O/E97E8Ker4Y3XqR6Dai+20aKtq7kUgvKLvG0ahkHyeRxiPRghgTFh7GGLEfhuf4DywmXLSE/gldfuXEaia+ixgvV45tSPKWIjEdR2m9s5tRsd9NdYvKf4PSpZ5AcvDf2OdnheeqR6L8XZxk3EhapSCS+CfQsjsfn/UUJFUN2M/n4mSrGKjfHQ5C2ToOLZMd4dlupPfVMCbgGFpP5QnlB7HfjgrP1YZ9b3Vh/4GoI2KIxUJSqEIdiUhFErYbWp3XIpm+jFS7Lt7TMCRk/Sld+ouwfTtprdmdZkeZYFWPTLBqQKFMQwOp4GjswD3NfoZQ3VI2+6KgPQQFwAaS+fqvO3zjGbsC0/HdTySZ84eSFs6NAc2DULhFd9H2sK3WJIFvoeVkNSqfi8P2iRj8fxgK6xhsOyr8NhCV5s2k+JnzcOzfhHV5unM7j0R33uGkqu8gIfk7SVmV40cYgL0a447OQIvEhaRU8Y+G+7mM0oWAT0aCNQNdUzHJAiSSMdljHWmhbXDsnIYKahkqwploUVqGpOA+JFrNoW3GkQqEHknXDMml4fx1SPKuQJI3k+RCq0bbFC28o5BAvBnJSrxmRzjngUjYYjzSPUhsfhue9/1Itouu4hYk0z+kND5zatjvWFIdtkrYSGVr1ifRCnRvhd/K8R7M2h1S2PZPjDO7BsnUpwq/XYCu1kjyv4wu8oVh/zlIqI5BwnckKV7yu1RnOauE3VHG7kMat4/h5KCc6FeDV+GzHUpaLDu64p4kJQRtx34YA9qjZXsYEp814T5aw77jsQ/sQSpyvI6UgfokqVI7SMQmh3P3D9vaSbHBg5HQxaSDHUYmWNUjE6waEMo0NKAQiYGJg9F0PhCFd+sOnv4AFISNpMVYH0Fhc8MO33TGjmIYCq8RpBlpA2lx36gwV4ffR6KSKgas9kNBOTn8HjN6BiJ5uIHeU6/BuJff0rXS+zaMWXlnYdvbUIFvR2X7JBK6WFjxVlTsE5CUvB6VF0i4vkDPcShvxLiqph72Aa2tv0Hy1E7X2I/vovXnu5Rms32CtB7c46iEbwv3+nwcazH+bTPJFT8IFdQDOA4nkLID55JinaJiKyq6PcL568O9rieRuqiwFmFb1pHcUjGzNpZVKFp8KqEN30kDqSjpUlTsx5MsSyuRNP827DMLLVe7l53vMowvLC/WCsqSS6g+U3wDkvC3Ut36faei6+21hW23kBYZfxFpmSZQjn0VSdfhSKZehe/kl9i+SzEJ4/Rw3Hpsr+uxzEi5heoCnCzsi+3UD0n0A0hyHqY0Dm4oWs8isbkf+2V3daV6wjQcO2eE63eQkilWhvvejP1ofvgMxD45i+TKi5PzogVrfbjH/tg3VuF7jN8XY19aj/24Dsf3KOyPRb3eQSor1I4k7Z/sBDLBqh6ZYNWAYMGKSjb69EejEB5MUsIx8+wJKhcjHYiKYh1phnE4WgT2QEHdhgTrSnactGXsHKajIJ5Mer+bSRao4eH/dajAF5AE6HSSBWQMiWy1oTKI7qJKWZLluAxn3Q+F61YKdN+OpOYfKOQvxVIX7wrXugitAsuRVAxE4RwLZj6KLo4YH/QYWrZ+SWWCPw0tOa9EK1F5+npEeXHViB+jkp2L1q4/YBt/grSu2iZs17vROgMqybORQMU09BhoPzjc1+6kGT1IjO4jFSjdk5TMEF36G0PbLMbx1oLtPAXH6MqwTyxtMYa02kEH6b2uIcWGxYSYoWH/WWiZiyQ9kvGbSEHWD+Jk62yM2ysvjfFXTJKolLb/XbpmfvaEBdiuN5CsGqNI2WxFTEWSU0xw6AzPtBndxV8juXUfwuzDW9GN+zJ0GU5A4vMjbOs6bJ9TsD9EzEPy+GVKEZMK2tEK1Q/fyUvKjv0nibiVu2N3BqciqXse9q9omforPk9M+NiKxOjRcK+7Y59rCN87kDCNRx0yiETqx4W/K5BQtaMuaQ3n7yQVth0b7mMjaeHr+nDu7eHYOEmIBKu8lERNyASremSCVQMCwYoptrEO1mi6Luxcj4K2FQd3uftwBCrnDlTCDUiu9kUBtQkFw8Ph+GproGT0DWaSlGcDyfLUjgpoKEmBjw+fO3GGPhqJytn43heFTxSqS5BUrMb3OxcVciUcjNapqdhnHkSCsAmtP9PCb5MorYMUcX24D9BC8nwU9M0opK8lLeUxHsnQ/ysc/3IkXNFa9Wcqp/M3IBk5BCcKR1N5XcU70JX0ILqL3hu2vQ0JzZ5IKqJFKCZ8rMWYnrlIXObStSzKx9C1th0nJvfiJGdvVMSzwnPE+Kknwn0sDr9PJ43lzaikL0b3TRzfbUjUNpIyMsciaTiatGB2JOB3hntYQlKo55IyvR5B4vmL8AwvQQvimMJzbcNs0EuonADxXlT2J1X4rRyP4zv/FtUlcryI0uruS9ES9WnsR+9Ccl2P7+XrmGUaLWCfxj48AN9zCxKvMaQiytEFFnETWj5/Qe84B2Ov9g3fO7FNLwnXexT7d3elDWrBMGy3w0hlWNaG691BIkfbSGM7JpVMwWeuD/cYXbJ7YJ+fQLJg9UPCtgz7TD0StR/TeyLR7uFcA0mW8jq0lMUSE+vCfT+6Y82QCVYtyASrBgQX4Y6gvJzBaFTg/bHDj0GCtScOvKUonK/f0Qtm7BSGkpYumRa+DyVZI8aSaqHtQ2nafMQ8VPKtSLBWIYF5lOqWWDoOZ8v7ogVnPlqgoktxd3Tt7YaCdzEK91NIrrT1JKIT3YP/i5auZgx6PgQJx02oJPdFhTAl3P/3UVEcjdalGNi+HeOovlvh3k9F5fxiUnZtEY8hWZmLhCLG+IzEGKRHkJTsicTpReGY95IyBDtw4rGB5Fq5i1Li9fbQPn8Kx8eJyo8oXdz4yXCNzfg+j8H2P4je3X4gcRmP8rQt/I2W7iLWYzt/MZx7BhKU/cr2+ztaRH5c4VqHh2NOw7ifnvAYvusbKa2k3x3ei/Fdhxe2fQtdlfcjiTsHLVGdGEd2K/a90eH3FyPZ+AvGb0Wy9UkkW7sjcS626yokQkuQAF5H9zWbXkRaIqdfuNbdKCuXIdnpwD7dF3X6RmHc23sK21aQSifcSbJaEe7hIZLVbDr241HYNx9BgjOYVE6hAV2No0gTuYHh763Y/tViMFrAYljCaCS47UjsNoT7f7C7E/SGTLCqRyZYNaCwVM6A8BlIinHYQu1rE45BQTUFFV0jCoVH0V3QW2ZZxlOHmaR3vQcSrAFItuZRWjH5TnYsYDbilTjDr0Olv5zkJlhJWnx2DArwhUjiBpKKW8aaOJWKmm5Bl9xfMG5mA5Ky76KAXoxxLC2owAYjebubtETT6Whxia6Zi5C8lZcb2B8tVC+g1Kr1VSytUYyrmRrueTlaACagRe3k8Pu30U1VbpE4F4lhLLLYFs5xO5KnByscAwbTH4vWicewLMAGVOBnIZlsQzf9V7H9Iy5A0hCtL+tIVeSXoCIFXVxHkeLBIm5GJb0cFd+PqBwLNAv7wvF0rWVVjovQRfwXepdF5yBZKdZCuwEJzs0Y9/YOlEsnht9vCb/9ApX4UUj2OsN1r8W+U4+xTh/BdxpdXutIyR1RjrYVtm0Lx65DArYC31t0p3aG31dgH34SycoSkjs+Hjs27B+31RpnFTNdP0LSk9FVvABjA5eRioyuwwnDwsI5DsH+PwHH7L3h2AVl93MCTgQacbI2AcfzVejOW0fPSVRDcbwPJWXQ1pPigyPB2oJ9bRU7Ua4hE6zqkQlWDWhsaq4juQK7+7uargOoHINIaeJjUQhNCdu2oHC+kR2vpZXx7MM+qPROIFljbkOBfSz2kQ2owGL24uHosojEbw1aSGIG1omoeDYg+ZqEQnwqqep9xBa0VlwarvnvqBx2C8evRGVXh311Gc7sVyDZiK7MFRj79dPCuevQsnECBjZHfBstWGvC94loWZuPlr9DKQ3U7q4EQUQ/JGgx3uV4UpbgCFKc1FwkyMNJCzQ/gJlpa1FRTSUtQTMXSfP+SDIfDccNpPts0Mnoujsk3MtKfJ830/OacIPDcS9HK1ol12/Er8L93E739dMi3o6WxaLV67+RaK9FEnQGkrhxpJpJc0i1vA4O52gL14wW9t3Dc56N1r86JOet+P6im7QRJwCxbafjO1iB7dmCfbsFZV+0BE4kubo2ksp2xDCKmLAQCUUk2NWUbaiEU0N7xbaKLrstKN/vDdeMpXjWFZ63iIPRAj4uHLuWFJy+HftZI+qAhrDPEhJJLy82W47hJGv6mHC+AaTs9s5wHQp/oyFgPTsYm5YJVvXIBKsGBIJVTymhKv8Mxo79AAqBfmiqXVM8FQ6I7Sj8Y/2e/iiIH6PykiAZzy1Mwayr08P3taT4rJg1FF0G45CEFXEbEpl/lG0fjJaJQ1Gh/Q2F9bVl+70UleJ0SmsjrQrH/ACV2Ehc4/EsVCgLw70OwWDiL4bjGpAAnYdK8P9RGqQ8E+PTIsm6CgOh46z/zeHZn0Dl9HJ0GRbdSX/CWLDfU7nG3Ci0lp2GFpYnMW7or3Q/phoxePt/uvm9J7Tiu1ob7v1BknJfjIpyPtUtDD8crUof7eb3n6EV6XZ6XzHiP9ENuRfKoMX4ni4v7DMbSdzLUfG3oiUtJjWchORpJMqzB7E/HIhE9hCUX2PCcy5H8lkk40NIlv7oLtxWuP9ICqZhv41WmPWkpWXaw/X7ITkYju851pJqx345NvweLWODSWOqGrwCXY/PL2zbHI6PlsblpEy+pUhs13RzvjE4QZlKStjYQJpUTycttRMnMZG4Dcb2ipby/mGfVVT2bAxFl/MIbKft4dOPFOAe22ljuM6OZE9mglUDMsGqAcFFWHQNRgU4gLQWGTjgigJwAs7IopAdFo4ZjlaI6aSZ2RKM6ciZg8997IYWm5jRNp5S18Y2Umr/wehi+xsuBRRxFroyppSdO6aNX0bpwsJFTEBryfNRGVfC7khQvoeuMjCL6+OoeK/EWfEKtH7dE/aJAdCtlC5VdCZaBzrRglU8555IGIdgPFDR2hWxCJXtLUgsK5W5OAFJ1kAkZNdU2GdKuJeT8NnbUOk0UVrLqRwbSa6uf6DybcC2nIlEIRYMvQ3ddgsrninhU+E+hpZtjxmct/dy/AAMMJ9JigVbgZayL6JCnonZiQfiO41xOA9gmzag9SmWVViO7+ZxJFNvQTk1Muy7jmRRjZPCTaR4rP7hE+MTG0jZlRtR0T+KcvPxXp4PUsbd0PB8ceIxiJTFuRXJWQdpnb9qsB9a7w4p3O82bJe14X6HkwLU5yJZv5nKRHc2tvEkJNrxPsYgAYqJUpFUbUKyE0t9DMJ2bicRoa2kmlpFq2k9EqtRoX0awvlHhHuLLuxIrNaH8+xwSaFMsKpHtTVSMhJiNlAn1S8PsykcE33hMT5iNKW1T2KwZ3dZZRnPLTxJqsjcHaaii/BSJBVFHIrujFHYxzpJJB9SvZ3TSNWdB6BrYAxaxKJ16AGcYcf4lt1JbrSTSFlqD2Km2DFIiF4f7m8ZzronoVtpICrzU9A6dg1aR/5C6fqDgzGAeDhm1C1AAnZa+L0Flf1QJKNTSDFhi+hKsI4L97UAi28uKfvtKFSmdTgO1yEpHBXaZBkqrZj1VcTKcD9zwvNch21+ICYBTEMlthnjue6kd4zDcIAbw7FrkKT0VItqFFo+90FiB7bFDRgHFvF8tBjuje831oW6MVz3UOwjsSzFzWHfWDLmqPDMMXHg5nBfy7FvbAvPfxy6qmMGdEc430IkT9f38jzliH0yxhMVY4ti/24jxSh2hmvGGKnu3LaVcDSS8eeF7zEbcCW+i62kgHFwbIxBMhMnzS0oy4dif1pAqRu4H/bJolxfQioK20lKihiAbdtGylieQSrnUI9jMMZlRc/JAFIbjQznjDpqG6UriwykcmHZjD5GtmDVgEKZhugKHEQiSHF2AbZr/L2DygGnDThwD0SrxUIUdHPpmwWjM57b2AcV5HrS0h1bUfhu6uG4meHYGeETJ1mrUeCvI7m1R+OsPpYeaSItL/IAqbDiQUj0VqISX4ouuemo5B9ApX5thfs5Ey0rN4XfjyGtQ3gzWgqmosLpCPc0LnxGkmIe1+PYnBC2x+DpmAG6DZX9/TjWYr2sWAtrLWZ//T203wwkGseHZwatNBeilS0qx/PQrdSI7T8fM9n+TNdSEjuDPZBgHkUimfF5LkMZMzLc77vCMQuRDN5PInsvR/IaMxxjzNO1+I4nh2sNDb8tQbm0DAl4dPvdgaQ9xvvsLMo9ApAIVZwYdJLchG2kdfp2FEdhmYditud6fOb14Rr1hWvVkVyf0WNRh+2wHvvQQuwnw3EsTUb5vjk8Q7zncUhI4/+jkbzVh2OHh/PGv5tJC1OvCd+346R8Y2ijkdiXR4RniaRza+ETydYKeresVkS2YFWPTLBqQFiLcFCFTzT5dpKW8YiduTtMwsE3kRR7tYAd7PTdIMYoZDw3Ed0++9F7yv4q7GOxz0YyNB8F9RxKrQyDkBwdQapa3khpQdHVSEjGkixc30B3YhwHPWEcWq/GYTD0YszgiyUxJpGCdkchMRxZ4Tzl2IDB23dhQPLjqISi1e580rpy0QU0kNK15urC970oXSz6IkwGiJazA9ECsoJk3dqZDNKISGj3RffwPihT7kbX5B2FfV+MAfgzUMFGt9AWEgkaSCo+Ga2Z5WhHkvkXbLctFfZ5qjEQn2cQqXBmTxl11WAfJKFTy7bHjN1FpIlLTBJZg/1kJPbJ0UhyR4X7GxY+40khJNF1GcsjdJKsUtFa1Rn26QzniVbTNhxfa0nkaF24p2WoJxZgm+yJfTQGu0Mqdrot/N1c+Bufc4c8JZlgVY9MsGpAgWAN7OHvJpJpuVJqeMRMUuZgByrAJfRt1WFI1cbj7C/64jOeexhLEqjdkftzkZSV1+7aSCpsWHSNnYnCfDEpm24ukqKJpOKac9FKVZ6q3hM+T1r0+R6MyWrBTLZzUVktQ+V0eNfD+T2msc8hrfPWk9t+djjPLJKrfhsquglI6GaTCo3eG+5nO1p1zkKlXHSv/AXH1k/RFbYzFpWIZiSBU7Ft20jFU/9atu+BWA9tFqkcws0oT9aS3GcjSZaNzeji7Asi+GzD2yltq4hYBDiWMliB7vuFSEY2k6xBMdQjWkcnIskZQ3LxRfQj6dn+qB+2kaxTMfsv6o4omyMRjhaySPpWULqu5XZSvy96ViKZjrJgC/ajLWHbCjLB2uXIBKsG7ESh0XLEIpaTcCDEWi2L2LVV2+tIs6dcYyujJ0wnzchbMc5qOwrwR9n5Irg/xBpa23Epna+gsjkNSV0jWtlasc8egWPlISQQ1WT8NYT7Pghji8aT1ixcQsqiGosEazwpI/BJdK3dhuMy4gMYwxUthr8v/PZjqlv6qDtMQyvUHqSSFw+Q1yKNiNlxO4rjsS+UJzJ0Yl9bRwo4X47W3WWULqDdE0agTK9HAjcAJzIN2O+2YB+ObsCOsC2S/GH4jJHARb2whETct5ISX2LA/VZS8eph4dmK8WqE46PLcEM4ttivq0YmWNUjB7nXhjgbqZQeXguGkwI0owl/E9UHze8oOqjOdZORMT/8fSj8ndcH55yAxOEdpAKl/UhL/jyGCmMJKqVFaDmbHO7nPnTN/anK621BBfkIWpWHk6wOE0hp8tGdsypc77JwH7Fg5UTShGQepfXpivFua6q8r+6wIHwyoaqMnSFXkDK1y2MUY5zs2sJnNWlR5Xqqk83lsrUeM0DXYD+qQ+tZ9CLshX1vHMmVuDbsHzM1R4R7WxqOm0Pl+ogNYd8R4f9o+YqxiO0kV2QkcaOpLfkgo0ZkglUbYsfsR5oN9IQ6ug6GiaRskDYkWetxED0TYh4yMvoKk0glJzpJBRs/jn39tWG/V+Cs+80YX7QYCVhM4W9Hd3rMXKu2fs92UgzWbLRijcWst+guWxOu9wRarO6ndBmRlWit+jiuw1i0+j+K6+bdT3a7PxuwGt/n7lQmWbFW1DqUzeMpDfUokqwYLxVjsoaSZP08UtmIeEws0VMsftpTwdlyjMC+Ow37YCzrMCRsm0JaeDzqp3gPUU9Fi1ZMKMjkahcjE6wdQx1praieSFGlmUZMn+0If7eQAg/7In4jI+OZgu5ifJZhcPt7cMLxdaxifyQGp9+I1qp1GGcyGcsArEGX3UyqLx4Jkp8WHLPrMGMx1tOqZJkYhrFaLwufcpxAqveV8ezAFIyTmkzlLNs2JC3rSQuzxwD0GCBejnrsU7GuYV0490RSYHxvGIQuYZAsRU/GJtJqH9GdGWPA2kgLvDeSEhsG4KSig1RDr+gmjJODDvIqIU8JMsGqDZ2kJQj6sePpye2kYOQNOJhytl/GvyKWIon5DlqyzkOXyU04Plaiy2wTBn8fFo77E7UFaUfrWW+YCHwaq9xHXIMxY8UA81h/akeXY8nYOTSQiEQ12EoKYG8o+y2Sq82kxbqHkEjLRlJNqcHhmLhix/pwXHTLxUDyNVXe1zaSxXQwejcmYjxiJEnzwzk3heuMxonHFCRQa0ixXbEmVrSqxefbQgp0Ly9WmrGLkAlW7YgWqB3BYFJqbhzM0SzdQXI/tpPiDWLA4nryrCPjuYuvYhByMXV+II6Z60lLpCwmBfj2NV6GFeT3Dd9vx+WCrkHlOpzkLsrEqm/RUwB7rAo/iNL4okgYqonNirFV66hcoiKePwadrwv7DwjX7E8iaRT+zgjn60ciMjtSRiLWV+wgZQxGEjQASddEdFvGotUxC7YzfB9MaZbj5rBPjC8r1x8jyPG4uxSZYD11iMIhdv5ild1YRLEStpOK7cUqyTubTZOR8UzDI6R1CvdHZfFXDHwfhenyGzGDbwaOmT/3wXWPwGrez0cXZRGn9sH5M6pDJXkW619BiieKgdq1TjbbSTWoyl2EkVBtQUtWLJcQC3xurXBM/3C+GDw+MHxiIkUkN72VQoj1vdrK9h1KWppoLMkdGZfrKU7K4/1Ez0h0a8ZswS2oMwaR4q+iXilOGjL6GJlgPTUorlcY65tEM220YHWHGKwY02zrSL70nbGmZWQ803A5jpMvY/HOxzDm6hGMu9qAFqwBpPUDr9zBa80C3o/1psrxT+ALO3jejL5DlHXFpcl21Io/DEsvDCIlOBQRswsjcYFE+qLFqBjGEYtKt4XjhuCkINZErDbko+iqG46T8JHhXLGuVZyQx1CSzsK9xXaJLsT4DJFAdZCKtfYvHFNcDDpjFyETrKcOcdYQi8wV14rqCeX+8uwmzHguoxUXtD4fa1j9CWOy1mMV9WPRwrUPKfX9amorcfIh4AKMZSle98vAz3bu9jP6EH0ZKxRLHUTSMbjwW3GiG+VrfyQf26i81Blh/7hEU0SM74oT6t4wAslfJFaxCnxRN8eg9GKZheiS3ECKH+tHymyM4Sj9w37Fcg0xgL+aTPiMnUAmWE8NouWqs/A3mnNzB8/ISLgX1/urB16IGYYfwQKekzDzL5ZpGIxFIxfRe1bfWKzEfmr4G1EpgD3juYlidfOi5T/WoIpV1mN2eIzHilaeohszrjc7gBQrGAuDRitSd4jrBUYrVYwri8Qpkr0YCtJJqcdjA8maF8niqMLzxRjfeN8xBKVo+YrWq8wBdiFy4+56RNNsNM9uL/tkZGSU4np0ueyLqfUXoAK8D4nUbFx/cXH49JZNeCzwMYy1ijgVg9gz/nWwgRTzNKzC71sotfBEwlNHKTmBFJ9VDfqhFTYSqn6F7duxb0dXaP+yY2O2eYz1ilmLESPCOQcV9u+gdJkdSBa5qHeK5YIGkbMKdwkywdq1KCdWcdYUZx6ZYGVkVMaVwNlIpA7H7ML7sBDpZlxPcTxmVk2jK8k6BonZmWXbH0KLVSZX/3qIbra4ZE1ErEcY60y1k9x0Re9DPV0nyIMoJUz9KbVGxfixuH8sAxH3iTqh6LJrRytYXP+wiP4ki1nULxvK7iEWQS0nVPE6xU/WQbsQmWDtOhTNysXCopAIVnYPZmSUYgIqlw1YumE4aY2+CRhfshtWV98N42qKFakHYU2t8wrb7gc+ieQs418XnaTYq0rFRgdTGptVRJTf5W62+Dd+ups8x+Mi8eqgqzVpQ+G4uvAZRmXrUwx8j9a1iGJAfjHbvPxv/D8SsoxdgJxBUAN6Wey5X+ETB0HR7FvM4Mizh4yM6jAVY7KmYLzUeLRejcIipD/FQoujMLPwOFLQ8ePAZ4CLn7rbzXgGI8Y7lS+EXI6eQjgquQq3kybLlbLzYq2qnmR+tJbFDMTybMGIGMg+iGRdK7o1y/eNuqd4P8VY4OKzVpX5mBd7rh6ZYNWAKglW+UwhdvJyi1YmVxkZ1eMJDFSP2IiKa3TZflcC3waue4ruK+PZg5ihVyx1U7Q8lZOOnZHT8fxR9lfStVFfFHVHd8vYFCfq3Z2vUnxvvwr7l1veiv/3WvYnE6zqkV2EfYfuZjzlnTYTq4yM2jELXXz7he9DSUuB3An8FriUXGE9o3sUg9cjunOh7aycjsf3VlannChVum6RDJbX6Co/R6X7786QUn6trJv6GJlgPTXIHTcjY8dQR1pz7lPAR3GdtjVYsuEfuEB0RkZveCYWZa5GN+xsxnnWP08TMsHKyMh4JqNoAbgqfDIyMjKe8egp0C8jIyMjIyMjIyMj45mExqbm7lKeMzIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMp4ryIVGM3YYjU3N5wMfIBV7HBf+LgHmAT9tbZnz+6fh1jIyMjIyMp5WZIKVURMam5oHAC/GpUveCDQWfn4S6xVNxFXeNwF3AQ8Dv2ltmXPnU3u3GRkZGRkZTw8ywcqoGY1Nzf1xsd1TgIORbI0Gfg08hlW39wQmA5Nw7awVwNXAI8AlrS1z1jzlN56RkZGRkfEUIRcazagZrS1zOoHbgNsam5qbgLOAt+EivEORuM8HLgLOBJ4H7AUsxTXkBlY4bUZGRkZGxnMGmWBllKCxqXk28DFgX2C3sLkdCdVStETdBtzS2jJnfmvLnBbg641NzUcBp6NVaz66Bq8DpqG1ayzGaA1sbZmz/Kl7ooyMjIyMjKcemWBl/B8am5qnAV9Dt18RAzCmqh54EfCWsP9vcemS5bgu3Blh/+noMnw7Eqy4BthYUkB88brDW1vmrO/LZ8nIyMjIyHg6kQlWRhHTgfFl29qBm4BvAluB1wNnoxvwSGA4WrV2KztuAGYTPgwsAv4NmACc1NjU3NjaMqc17pjJVUZGRkbGcw2ZYP2LISxfs7W1ZU6lFdbXArcg0YpYhySrH2YJfg64HbMHhwGbgUEY2F7EKuDB1pY5N4XrHgEcgxatc4Bv9NEjZWRkZGRkPOOQF3t+jqOxqbkkoLy1Zc6WbsgVrS1zHmxtmfMWdO19B3gcLVRHYVzWh4CFrS1zvg18BfgdcDkwF2goO90GYEzh+08L/5/f2NTcyHMIjU3N9U/3PWRkZGRkPHOQyzQ8x9HY1LxP4etWtEh1Av1bW+asrOL4cegK/DwwNRz7Zwx4nw8cBMwG9igc9gQSqgtbW+YsC+c5DQlZxC+AP7a2zPnHDj3Y04RApMZjPFk7WgMf72H/scDIkAxQ/tsEtCKvam2Zs2UX3XJGRkZGxtOA7CL810Ak0gOwRMJgoH9jUzPAutaWOW2httWgckXf2jJnRWNT86PA/WjxnAzMxIKi/wRagBuBVwMHhsPqgRkYl7UsbHus7J7GImF7WtHY1Lw/Esjx6PZswVpdl7e2zNla4ZCx2I4tMXassal5OnA4JgL0Q+vdVmzr7cC2QKZWAotbW+ZsAIjks5v7akAL4Loco5aRkZHx7EMmWM99rAXqwqcNFf5wjJuqB4Y2NjWvR/I0qLGpeXtry5wlxRO0tsx5tLGpeR6SpslAM1rClrW2zLkVoLGpeSHwBYzfmoa1sZY3NjXfGepmvbTsvpZh5uHThsam5jcgWZyN8WSxhlcnsLaxqXkDsKi1Zc7CeExry5xFFU7178BrKmzfgO00H6vadwLtjU3NC9ACeA+2wdLWljntxQNbW+ZsBhY2NjUPamxqHgIMaG2Zs24nHjcjIyMj4ylEJljPcbS2zFnc2NQ8DK0p25BItZEIVxuwHslWHTAkuLXWtbbMaSucqgFJCEhC2tEiE3EH0EoKkJ+IRGwUBrwvLru144EtjU3Ny1tb5izY+SetDY1NzecgsZoAdGCpiXtwDcUNeN/90GK1sNI5ChjTzfYtSK5uxjYeA+yOlr464LVIRmlsav4JWs3+VjxBa8ucbfjeMjIyMjKeRcgxWP+CaGxqHoUKfmO5SzDEGHWiG7EdSfgB/P/2zjzKjrO804+61VJrb6m1LyW5ZNmSXbZlY+Pd2GADhjAx4JhlIIRlCCEQOJM5SSCZSUIgh5wJyQQCAyEZEggBA7Ex2GDwbrxieZFVWixLJbkka22p1ep91fzxez9X6bq71ZJaUkt6n3Pu6e57q77vq7q3+/v1u8IX7CvAs8CdeZZ+qeLcrwM3IFECcC/w7mCdieLk71DM1hKbowVoRO60JmArsmw9CaxH1rbxwGaz6BztdU9AlqbFKOuxF4nEVcjld0cUJ7OAs4HzbS07gceC2IziZBIwodLKF8XJe5Gb8HdKT3ch1+gP7ZoOICE7Ed3fGGVWzrZHJ8ri/BHwVOUcFfONtnP2DMe9cRzHcYYXF1jOgERxcg4qOnoBVlzU+EvgjsrA7ShOvgRch4QDqDfh14CGfgTJpUjI3IhitZYgMdeD6mY1IqvbFFQKohkFz++mqCQ/oADp51rOAD5g6wtjrkCZkvcjV+CeKE6mIDfoMtRjsRrYh+KytgzgIizPUwd8Ct23ayh+x/aiNkFbUNblfmTVexkJpT+ydZX5AfDZPEsbSuMvoyiJsQGJT3cdOo7jjDDcRegMxgTgWtTqJpACv+ovKw59nsaUfl6KipLuiOJkRZ6lq0qvtSOLzgEkqjowqxqyZm1E1qMgQGaieKllqLfhmihO1gH/OEAw+itEcXI1En1TbNxeZJ3agKxoU4HpUZxMBdblWboGWBfFyVttvtfa/M8h8Vce+xpU12sKirPqAc5FrtLyPzDT7LEAuKJiie12bjcH92m8GgXg32lz1doYE+3Y3S6uHMdxRiYusJzBqEHWpXLNqhXAmgGOn4zFFBkXoYD6RuCaKE52IkE12cadhMRNyLYbhVxnM5GAqEVuw3uQcInsvDcg0XcGEkrf6W8xZk26BJWQGIeqyufIehQyIuuRiKqx9bSF68uz9K4oTvYiN+U0m688/hdQjbDQWihcQydFe6DwfLe9NlCj691IUE604/cB9yERGOi1Y9qAjjxLK+PaHMdxnBGCCyxnMHqQqAgFaRuAFXmWtg1w/GPIkvN6+3mX/bwIWYECfchVthP4GRI8B2yuqUikTbfHYuSe22Zfd6FK8pegQPT3RnEyBrkMX8lKjOLkFmQBmo9EWhtyLa5GFrLFyAU4D4mnbjuuMoPy8ShO5qKsyKVmDeu1cS+puP6yO3CHXWPIJAzWqbORmzLwACp3sRcJvO12XqN9P9riwoL7sBtYVZl16DiO44wsXGA5g9GGrDGB6cjt1y95ln4T+Gb42coLTLPzZlNkIb6cZ+njQ1lAFCfXo/ikq9DndRNwG/ANG/NS4M3AFVGcPGyvTUKutcSG2Y7cj2cjETfezh2L3HNPApvyLL2nYu56ZJ26EYnGIHK6UNugJ5BlbJaNF6ixOf8ZeK7SjRfFyY12TRcCrwGezrP070uvv43CWvYyElu7kTCttvW7a9BxHGcE4wLLGYxmYCWyFE2w584Z6slm6WpDlqEjIs/Se6M42Y6y+pZQBMFvsXG3orimaSio/N0oDiyUpdiJioduscc85BqMkSWqGWUsPl2eN4qTBLUMOhcJoVeWhOK47kFir9pev5Si0v0X8yz94SDX9HOzuv0bcpf+jyhO8jxLv22H7LTrbAU2DmStiuKkpqKUhuM4jjNC8CxCZ1CiOPkECiq/wZ56HPjg4WTwHWuiOJmPrFXXI+E0EbnwqpAIuhtYCzyDxNgZKC5rE7A2z9K0YrylKBPw9Ui4HUDxWzuRi3E7avOzu3TOJcjt2Jdnabkl0EBrvgr4MkXG5b3Af+RZetsAx9djFrc8SxsPNb7jOI5zYnELlnMoViA3WBBYi4DzozjZN4L6541HaxyFYp8moHXWIXG0FImTA8iyNQ653FblWbquPFAUJ+9G1rLLUQB8B8oe/Dly17VS1O16hTxLn0KxYYfEBOEkZDkLlrQNKLC9X4bSN9JxHMcZObgFyzkkZtF5ovTUHagQ5j+eoPVMRq67OuAsVJF9OnLRtSLL1UIO7g3YhCxP2+yYDchqFALgFwMfQrFekygqvG9DhUK/h0TZbGTVasizdOMRrP0MVMl9BhKB9chN+aM8S58Y+EzHcRznZMItWM4hybN0XRQn/4asWHNR3affjOLkfcAvUWzTOhTrtNvauwwrUZzMtnnnocKn85AQClXR+5BlqYui/U8rsmZNseNmY42akcBaT5EpGSGh9byNFcopNNv1TUWCrhbFeB32704UJ+ei8hLVtvY6W2MDFRYxx3Ec5+TGLVjOYRHFyV8AH+TgquPB0vMsyq77JYpX6kSWntajmO8S4F3IlbYUCZtRSDCNKx3agARTm70+CrkEO5AgmkCRMbgyz9Jf2PhjgTchN+MW1Isw1KvqsGsYj4TleGQVCyUdtgJteZZ2WozUTGSZasQqw9sco1Gm4yJb63YUI3YlatOzKs/SHx/pPXIcx3FGHm7Bcg6X/4PinGYjwXMREhYLKBo9L0Fi50VgXxQnLUhwvHA4E0VxMg14D8oMHG9PdyALVDMqjzABCbx2W1cD+lyPtec3I5E0yZ7/dZ6lD5amuQyJn1rgZ3mWPtrPUvZaD8JQjR0Ki1hPFCe9SOzV2JpmAdWW/dhma19ia9iBBNpSlHm4lVc3wsZqbwXXZx+qk/UisN17DzqO44x83ILlHBVRnFyHMvJuRGJrCgd/rjqR6FmFSj7sQGUOauzRA+wst9Gx9jMfQhXWz0Ziao997bPva5E1aSqKsdqNrFN7kettAbJcrUOB+k15llaWYvg0soxVIYvbk8CDg7k4rTp8LRJYoZr8GGT9mmb3YDRyVbbaNZb7B1ayCRVP7UWuwz4kxCYjq9loJB5Xozi4LbbGwxKrjuM4zvHFBZYzbERxEiPBcSkSOTOQgOpFIqQOCY6xyKpTZV/7kKWnC4mXZRz82VyNCmuOtUcbilkK8VahEOcL9vpE+9qH2t48WemmtIrsN9lxT6IyDivLdaXMinQV8F9trJeRSNyYZ+n9dsxMW+82JIRmIsvTXBQrFlrszChNvxG5Up9HorHe7tkEm6OFoohqoBn4KqpY/yCO4zjOiMYFlnPciOLkIiQcxlP0HbwEWakurTi8D1m+XqQIVp+NBNoWJHT2IGHVal83oGD10XmWPjLAGpbYfFci8bMP+E5lLSw79kLgHcAnS09vBx7Is/Tjg1znnyHX41Wlp/cj69o6W2cTEoqT7drGIaH4kH09C/gssg4GOpAY/AdgzUiqReY4juMcjMdgOceNPEufKf8cxckyZO3pT+ivQlXTVyAhMgmJp2pkbXqKomnzRKAxz9JtUZy0VLamKc13CxI9odfhVmBLf+LKGNfPc3OA34ri5AXUR3EccjPOQQLwWmS5qqQLBd3Pp2iIPQFlQ45BomorsvLttLFmVoxRi4q+vg64P4qT9x9NAoHjOI5z7HCB5ZwQoji5FBXzvAoFhQeakZXnKRSb9BJym1Uj0dWDrDc7bZyzkYttLLBhEHG1FNW6monEWi+ygDUMssxpNm8TB2dN1gA3U7j1piKr3BQOdgVuo7CstSAhGVyjIbMxZDkesHOWUyQNDGZhrnJx5TiOM3JxgeUcd6I4+RjwCQpLDkjwbEGWnJVIYHWhIPm1eZa2DDDcGShDb18UJyvzLG3uZ77rUL/AyyjcjD1I4EwaZKkTkcj5NRJ3O5CYCgJtGooBO4CsbW1IsK1FWZP3DXYfKta42MZ7HfAR+hdXK1FV+f9AcVyO4zjOCMUFlnNcMHfgB5DVqj8XWjWqExUe41GG3cMDiSsLMJ+GxE4XEjiVx0wH3oBckRdTNK0GuQkXRnGyIs/SB/qZYjqySu0Bvp1n6ebBr/LIsarwG4Gnojj5EfBW4E8oBODDwB/mWfrisVqD4ziOM3y4wHKOKVGcvBdl693AwFaZ3Si+KELWoPuBLwY3YMV485H7bAr6/HajQPgteZb2lo57HbJsXYyy/OpRTawNSJAtQO680cA5UZzszbN0Zen8WcjCNgtZ0Y5bQogJua9GcfIT1MS6C3g2z9K9x2sNjuM4ztHhAss5JkRxEoprvhu4ZoDDOpBLbQ9FMc0m4OsDiKupSBjNR0KsD4mzPM/SrHTcbOAW4BxkhWpB7r2HgB8jUfZa4HoUpD4eCbAyU5EQa7M5Xj6Myx8W8izdgtymjuM4zkmGCyxn2Ini5EzgClTeYEnFyztREPt2JLDakVjajyq0b0eWpleRZ2kj8Pgg885EomoesjhtBu4Dbq10rUVxEpotT6co+VDmFuRabAfuORb9FR3HcZxTFxdYzrBS6rt3OQeLqxRlBe5FxT9DYc5eJIZCNfamPEs7DzHHBJR5B3ItTkdZhLMp2vV8C3gpz9JdAwzTi7L5xqFA+fOQ0AoFUxfZ+tuR69JxHMdxhowLLGdYsPY270XWoxhl4IGqq68A7kWCphsJqXaKsgVlaqI4qQ7xVBYLVQW0hAzBPEtbTchVIaG0C+jJs3TFYSx5N3K/jUKuxtrwQp6lWRQn7SjwfiKQRHFSH5o3O47jOM6hcIHlDBdvR/FWgVbgNuBRZLUKVqkaZGkClUo4gIK4m+2c1nKwen+xWPZ809EsNs/SF6M4eQLFgI0CpkZxcl6pJ+J3gDeiQPgalM3nAstxHMcZEi6wnKMmipMFFBarMs1InNQjC1GoZt5OEX/ViNrVbB+oSOgxZBWygi1H7XMO2HPkWfpEFCcZRTB99XFem+M4jnMS4wLLGQ4WcnDRUFC9qYuRlWorcsntR1aqTeWsvxNFnqX3R3HSALwGXcOcKE5WocD4GMWFhT6I8/Hino7jOM4QcYHlDAfjUdPiMo0oK/Bx4PE8S497mYOhkGfp81GctKBrmARchGpsBetaMwpyf0sUJ5PyLL3zhC3WcUYgVsw3RvGXdRQW615U3mRrnqX393Peh4DfzrP02uO2WMc5jrjAco6KKE6moD+kz6A/pvuAB4EX8yx96sSt7LAYhWKtpqLswU15lv40ipMxyOr2ZuBMVKPLBZbjAFGcjEKW3QkoRCBk9/Yiy28byhbeNsAQ43DXu3MK4wLLOSryLG2K4uRJFADeCew8CSuOL0TiCuQWXG/fv4g2kC4UpzXPip1uQ8Hx25EYc9ehczpSj6y9E1CZlFHod6UaxS52UCSv9Md4jmOHBMc53rjAco4a6xX43Ilex5EQxcktwFn2Yzeq17Xafp6PNo4mZNmqB5baa50oQ3JtFCefO1TtLsc5lYjiZA5yqdcjgTUbWaRAgmobcrE/P8jvRhWyEDvOKYkLLOe0JYqTyei/6PB7UIN6/90UxcleVKZhOmo6/QiyWuXov/KteZauOe6LdpzDwLobdAJdeZa2l56vzbO04yiGHo1+X6rt0WnP9SDLVZhzsH88xg3ymuOc9LjAck5nzgEWc3CA/oeBy5A16zz7+jPgX0ZC5qMzMFGcXIQsjeejzbsFFZNtRlms3UgMTEXWl+AaHoesMAeAl1CA9jQb9k5khcmPwXonAHNtrl15lm4a5vGrkTUptKN6haMUVyAhBdpDem2OHuQibEXxmI2DrG0Sits6MNAxjnOy4wLLOZ1pQ5twJeeWvq9GLXMmHJcVOcAr/SzPR2K3Cgmk+1DyRJO5qOpR1lpotzQVWVV2o/dtPypyW4XE9FJgDhJhoW7bLuQC3kQRmL0IuYdHoQzStYe59guAC9DnaJTN0YDqqdUjQR/Z91XI2rMmipP1eZZ+93Dm6mfuqajrQbcV7G0tvVYHNJcL+R4l3TZ+sFxVIaG1BzVgH6x/53x0HzzI3TllcYHlnLZYiYZ5yGqxcJBD29Hm4QwjUZxMQ9mZM5HgGYMEznjgPci60wjsQMLojUBtFCdjUYJBE6qx1oWCrc9EgmYFEkwNNmYodjvXHotQbB322kS00XfbYz/wNCoxcvdQGn2bqJqFaqpdgCxknTZWGxJ/M5FgnGqv/Rhl3+4DrgGutD6Yzchq9qrSBgPM/XuoRMJU9DndF8XJI8DGPEvX2TFjkaWsj+GJe+pFomo/hZuwF/3DsmsI9+zM0nod55TEBZZzWpNn6c+jOOkClqF4qwNoU56KNo0G4M48S1eeuFWePFhV/3nApUhwLEJiaDcSPe1ok5+FBMc56N5PQCIoNPHOgc3A3eg9mIyEywQkuFYg60mYbw4SJntQ/8sGG+8i+3oWElK9wK+RcNuExFmNjTsVNf5uRq7Fuwaz9lj9p3NL1zAHBXu32mMTsNMeIQi8CX3GWm2e3jxL74ri5Beom8B1dm8ujeKkCliZZ+nuinmrgbegzNaFNneNjYeNfzbQEsXJBuAJJNiGxcUdxUmNXUuI6aqy+dtQs/ZBBVwUJ7PR/ajDBZZzCuMpso7jHDVRnIwDbgEuRDFMjUjsPJZn6WMVx9YBNyErRoKsT9VIeAVBc8CeG03Rr7IFWUzuyrP0VhtrObL+/CaK+3k6z9J/sNcWoB6Zs5F7cBYScHuQSLs7z9LvH8G1Xoe6FCy29U6w8Wfaep9G4nAdEiGT7PgZyDVWhYRWLRImTwJ/nWfpSzb+YuByuy878yz9UcX8bwU+gVzXICvePuSK3GLPnYksgbsoWlbtRRaz/Xbc9jxLuw/3+m0N0ymsgAD7QzP2IZ5/LfBxYF6epVceyRocZ6TjAstxnKPC3GPXogSByJ7eQrHpb0cusT4kNpYgATAOCZSX0Ob/MhJVjcCX8izdZuPXIrFQC4ytDAaP4uRdwMfsvA3A/UiQXQlchSxXk5AQGm9z7kHWsZ/avAeQBepsW/OKPEt39XOt1wB/gixd45ElaiyF+GuyebqRsAl9LOvR39sdNt9jwEo75krkOmxH8V4TKVyJ24Av51n6gs3/drumd9o8DahESo/9vM3mjik6EoQg/n12bxrsfregWm9NKOPvcATSJIr9o+twg+atiO/fAUvzLL3+cM51nJMFdxE6zmlIFCfLUJbkdORmq7WXtiIB8ECepTuHMM5s4L1IEJTF1ZeQSEmtVMA8O2aWzbkVbdCtyH3YQiHAqoO4glcy3jqiOLkYmBzFyb48SxtLr98axckaYH0oC2BWsv+ChMZYJEBCrFBwb3UhQbIfuAFZmW5E9c26gXtK1zkWWd0+y8HxejXAGuCrKKZqCvD3yDIXgty7bc4qJLRmUXQP6ASuAN6EhN9WW+NMJHx6KN4b8iy9PYqTB4E77J41odiqJci9OIqD46yqKWKlViHXagcSuPOQoOwAWqM42QI0HKr8SBQnEzl0CYZBybO0K4qTXbYOxzklcYHlOKcB5pI5A8XrTEMioQfFzYSA8SZkPVkO3GxuvybgF8CGPEsfrRw3z9IdUZw0c/DfkhBfNdqO2WXZbdVIAIQYpBAYPdnmHY8ESE8UJ+/Is/Q2W/sc5H58PRIqjwCfq1jHqoql1SGxE9yL+2w9fUgU9QKNIS4pipPQiWAMhSWszPts/rK4akTi6l/zLL3dnttnAmQyhSWrnSK2bJ495iOBNAa9HyGbbmnp+2okOEPGY7jWRuDh0lMbTQC2ove0HVmpggAK781mewSLXr3dn7C+NrsX1YfINJxq5xxtcd1q9J47zimJCyzHOcWI4uRq4F3IotRL4TaahKxWU9Dv/gtIXP0ABVM3lcaYA1yCSiW8B+iL4uQ5FFe0M8/SX4Rj8yz9fBQndyDrzvVos/5tYHEUJ3+MRMn5yMoSUvP3IeEDsjCNtjW22Ne5UZxclmfpE0ioLETCD+RS7O+6a1AM2MeQBems0su7kTsuCJ49QLsFjNcgwTMVCcrNZTdkFCdXIQvXBRVTNtn9e6B07A22zhn2VLdd63iKwpotwFPIHRhKQYSsugWl8afYvRm0IGcUJ29G7+scmyvErnUiERjclPuR8Jxmj9HIWtlkx+wG9g6hjEONzTvN5qg6HPdiiSlIiDvOKYkLLMc5hYji5PeBq1GD6sATSBiFzLXRSFBcYY/3Ab1RnOTIIrMTxeqsQ2Jgpj0uBT4IjIviZDOKIfpMnqXbzIL0ngHWNIoiJqgeiY8OZD3ptudHIctKKGEwGwlC8izdEMXJ80hEjKUI5C7PUQV8xo65joP/tgVrWag4vheJiVDzarTNvx+Jt4Oy9pC4S5Brs0wHsCfP0obScyGQvnxMcEdW2/gp8IU8SzfY2muBP0fWxVB/CySMN6Csx8rrHYcEcIRisqYjIRpioUJ824vImlWLXJR19v1OZO3ahN7jTooem4ciCPEuG5MoTsYMpZxFBa14HLBzCuMCy3FOcqI4mYXcf6GuVKhiniHBtNaer6NwP7Uh60UDijnagjbzUIjz8/YVFBfUglxbwZqyCNWUaoji5E8PEeR8JRIPERIgYymCrEP5hm7096jOztlGsZEDPIusSLNQ0+2FIevOuAQJqzORdWofFhRPIQRCxf5OtLH32Jy1yILTavdqPQfTRZHxV2Yt8KuK565BgjEwzs7rsmvcDKwN4goUYxbFyU4Ki2P4u9xr57wiQsyathxlTZ5hrzXbNXWj9zVYvTrsmruQ6Asu2QPIstWOAvoB2ocSc2fr3RPFyag8Sw9EcTI+z9K2oZzX31AUpR4c55TDBZbjnPy8D7nggnhqR8IltIPZiQKce5CFqA4JnkVIsFyBXF3V9vVl4EEkFuYgq0p/jEGZg3EUJz/Ps/SfwgtRnIwG3opS8YMbKIiaJltjd8XPk5F1ax7K8FtXmitHwqfPzqsUO132emiJ04usWfVIfLyMMviCuNgGZHmWvhDFST0KYF8IpHmWPl+6joUcXPMJJFzWI/FarpT+elt7yNwLxThnULTeuQG4NoqTm+y6Q4bfBPS+lMXVz1GyQZON/2bgD1Gc1iS7jhabr40iOzC4WvuQsJxOUeYi9A8MJRZG2zGH5eLLs/SAfT1ScQVwKyoe6zinJC6wHOcEYanuIeZm45FkZUVx8gbkuluCxEMfhQuwFYmBMfZ9qNnUhqxbrRRtWxYjqwh2zkZgNco6q0Xuu0XI1VfJcqA5ipOf5Fm6AyDP0p4oTnbbuLUU9Zh6S49RSCjU2LrHUwQ9/zfgbVGcfB25uWYhi9l0ZCG6MIqTvhCknmfps8Dvlu7LDUg0nW9zhKDzYCHqABZGcbIfCaCZSIwdJCbzLH3J3JOhOnwHhYAL1r7ADmTt205hGRttcy+yr8EStoRXi0TsPrSgIPaf5Fn6SMVrzUgwv4wE3gG7J30UlrsguHopymOEOKwJSNTVlq4lRZa1IRHFyYI8S1/lpj1c8izdF8XJjqMdx3FGKi6wHOc4YbFIN6HNNWTMRVi2WRQnjajo5A/yLN0+hPFC4Pg8tHl3UgSPb0ciaj2yXs1A1qt6ipIBXSjuqBmLdzJ2AP+eZ+n/Lc01AwXO34xS+8uB11NRcPmNwLdKz49FVpZQDqHLzqunyIyroiijEJoGNyOBsCHP0lAqYbMV+JyJxMG+gSqTR3HyTuC1KMi9zuYKbrpeJEhqkMC72n5+A/p7ODWKkw8g8bICueFm2T0JVqw++36/jYm1XLrB7sUL6L0I/RKrkTtxNypCutfmOhPFml2GBFgvhRVuDRWiJ8/SX5ogvADFhNVSuDdDI+sJNnYozxCSB8L97bU1h2NqUMHRw2m63B3FSVWepX2Hcc5ADCXmy3FOSlxgOc4xJoqT1wKfQhv+EixbC1khpiOBVGeHXwZMieLkwTxLH371aAcxz86vphAmwTLVA/w4CJQoTj6KXGAhW20qEj8daNNtQBvvDuSa+2F5ojxLd0dx8lMkODqR1azMGGB6FCdjgyUuz9IHojj5ol1vK0Um4Q1IfGD3oYnChdWO3IEZsNOaPk9EFdnfj1xt21GW4fw8S7eWF2FC8CrkHhxvY4U6UPtt7SFmKWTPjUPxZ1OQlexzFHFUnTbfeiRGakv3qg9YHsXJ/0RCqRMVLl1jrwfL1RxkkXo0z9LvlNb6GZt7LhJ724HvoPphT9EPeZY+EcVJAxJY56H3LrznQUiNQUKrLIBC+YbQnHmU3fu1h2pt0w/7hklcgSyljnNK4gLLcY499SgAO7i/MiSuViMLzjRkFQqVt0cxtPT1EHNVQ+FqC5toM6Vg6zxL/ymKk4uAt9lcy5FlpgMJg14kQILr64+jOMnQxjwHCcAlSDBM6Gcts5A4fDaKk0fzLG23ef+zdMzTUZz8FspwDBasUFy0yq6nAwmOOruGa+26eoDb7biZwCeBL1jNqVYUM/aneZZutgzHOorYqbHIgjebomxCGwrsz5F79pcAUZz8AYVoXQn8O/C4BXQvBP4ACbiEom/lbLuWF4BvB2EcxUmoHB+y+2qiOLnC3pe3oLpak5EAvRf1C/x//dxbbLxQGDQ0wU4pAtd7kIuwjcIqWGtzjaNoPdRDEXOVV/bYjOJkEUCepZsrnq9D1tZa+/mFclmPo+DZYRjDcUYkniLrOMNAFCcxcv9NQxvmemskPRa5n76ArD9ltqD4otBSpcbOH4tEwFPIwnDHAHPehETN+3m16OkE7kPi4Culcy5E1qcbkFiqRgIluLxCBto8JJoO2FihOGhu6+1AwugcCuvbQ6j8wKvKCtjc1yFx9VGKvz2rkCVpNBIjXSiOqdfuxxibf60d24Hiui6nKNDZjixvLUiwXEhhvVpt6w0lCIIFZzISmcvt++AibUSlFF4G7s2z9KF+ruNDqEr7ZRSxTHts/oeA5+3evR8lE8xF73UjshzOoeix+Bzwv/Is/VVp/BnA65CbMwikcD9G2ferkaCbi1yzVUhw7aLImgwCayJFtmEoQbENWFMu0Gq1z5ah0hMrS8/PQ4H1C22sDhR8/2LlvXEcp8AFluMcJVGcXIlEw2spXF+gTf9vkSUkBJPPBu7Ps/RJO/fjKKZmMXLZrELCZwlyqTUDf5ln6T/3M+9Y4DeA30HB5zVoAw/B0wdszH/Ns/SvSudNR5mH5yBr0LX20mYk+MYiV2KNXcP3kHtrpZ2/DPgbu95aZBVaDXwjz9LvDXCP6oCPIGHyFg5uFLwGCYNdFNaXfRSWuCokml5HYbXbg4TYJiTAZlHEMd2NhMtthyqaaYkGC+1ejAVeGEgg9nPuFCSybkHu33D/Z9khXRTu2nHo7+0mdI+/m2fpvaWxrgBegwq0hibOgXb0Xm4Bvg3cl2fpuihO3mjnXIEE+tM29ih0nybbo8rWEJpBV6O4q+fLk0RxMqm/gqFmdTwDfbZDiY3bkPj3MguOMwAusBxniJgwqUOxL7ORWJhMkb03wx5L0KbWCzyDLCKPAc/lWfqMjTUD+O821kQ7L2S77UebWGbjzkYb81N5ln65n3W9A4msMzi4EnigCfiRnf/90nkfQUJqCkW9pWnIGjbd1rELbaa/Cv3/TGD9LXAREg6b0eb+F/1ll0VxcgsSAe+gqEW1FYmBu4GfDSUrLYqT1yDLWj1Fb8Hp6L4ttkcT8LU8S39yqPGOBXZvatD93I/EUQvQl2dpzwDnvBP4F/uxh6I/48PI0hTKa1yMBG0juudV6L2bZ+eGptnB6hhaArXZz5sxi2FFcdSwjsXA7sqYLMvIXIze7xl2TV/Js/RxK3gaoc/Oi0OoAu84pw0eg+U4h8AKeV6N3DGhGvgB5HJah9LmZwPvRoKlyk5ttudnoP/+b4ji5CVUCiC43x6nCMReaPPUoE10PRY8jlxi55m75n+XN8g8S2+L1HT5SvoXWCHmZ3EUJ+uDyEMb+US0eY6xczuQ9Wh7ae6bgUujOHkabfRnI4vZOLR5PwQ8NohIWmDHB3G1Afgm8OxQrUV2nU8jIfcKkRpJL6WIzWqjqGZ+3MmzdO1Qj7X6W5eg1j6B25HwvM+ut3z8FOSGnovuZT265mVI0HWi97TNvo5B/xDMpAjKX10prkwUhr6EYygaRb9yWTZOuz3GA78Rxckl6LPfijI+XVw5Tgm3YDnOAJiw+hTawBejDWwr8F1kYbgOWXwa0MZzMRJUc9CGtxcJkjFIVDQj8bQbWRu+F4KJra/b+ajw4jkUwcudNvZsJJQmoVib9chS80odoShOxgCfsLUupyhc2YJEUxXaDNcBP0NutwS5KGvRJnw7cq/1Ah9CwmgOhSWkj6K/4S5Uq6lft6CtaRHwZzbXYnv6VuATeZZ2D3TeULH36HJU8PRqe/rLqEjnrymqo9cht+LOgSxJx5soTt6C1v5m9FnZCPx1ZWbkAOcuAGrKpSqiOHk7Kg47CYnfbmTR24NE5y6bowG5QvuiOJmPBBuoD2Flk+vgvjwfxRJOR/8wBEvaD5F18/HDvgGOc4rjAstxBsCCfj+DRMhFFO6bZrS5PArchf7Dn47ioRZRuNdWIdEyC8U5zUWCZzUSKJuR4AouwtCQNxQFnYLcdWMoakfNo4hf2mJjfCPP0jsr1n4V2rzrkMhbjIRSZIeEhsehhEEjavtyO9qIr0bFPs+hiCnCXtuNyhE8l2fp3Ye4h+eizLsLKZovPwZ8Ps/SxwY7d6iYiLuZol/gZeg+96B71ImudS1ytf40z9J8OOY+WswK9Fkk1kHxbvfkWXrbEYw1H33eGsvi1cTYfGRdbUWiay0Sm4eKUbsQuZ/PRu/h2IpDUhTU/1MOrnW2rSz+Hed0xAWW4wyCFfO8GAVon2NPrwPuzrP0L/o5fgEKeD8DuXEeQZt7jARWyAYbi6xBL1Ok2degze+BskXAgow/iURSGxIo3RRFMHtRxmCKyhWA4sOWUWQFtiLX0wa7jk+jDTfQYWuZTZGReBdFP8AGVHjzOWDXIXoPVt6TjyLrx5tKT4f1/qfNXY9E7CLkKm1AwvX7lSUDBplnlp37LruO4O4MhUGfR+1xnhlojBOBxZb9Lir/EKxJG5GAb0Lu2h1HIrps/OUoLvA8ZCnbhERcm7mWO/Is3dfPeQkK4L8OCfVQDb8auWp3Ugj4cUh4b6eoQl/ZNNtxTitcYDnOIbBA3g8jK9R85DIEud6+AjySZ+mjFedciyxawZr1OLISzbAxRiNr1Dy0Ye1Am9NTyEo0EQmkGUhEnY1Ew0yKdig7kCh6FgmSeciSE9rZNABPAH9TTsfv59qmIXEX6k11Aq3DVOcozDMfuN6u/VIk8ibTf7uYVhSUvxLdtx0hwH4I84wCqk62eCDrYzgTvd/jkGhpRe/hMyiAfNB7YFmlQbxPsTHmodiqFuSW3o0soqGDQJON3VEaZwwSe1OQ6L2ZIju2HXhnsD6ahfI6ZC3tQp/NUEJiPyoFcdSuYMc5GXGB5TiHSRQnwa1XO1BLG3P9vAe5xfqQaNqLNs3gAoSi7lUtipEKGXyh9lEHcr3cj9w61Sgb7ywkVtpRkPn30OZ5AbJUXIc2xVbgW3mW3jpc13+0RHEyF4nG0LKnAwm7fRQB2uOAA3mW7jlByxzxWJHV0UjYdAchYwLpLIrSFW3os/frUiboZKCnv2bNZgm8EH1+rkIFUaeWDnkc+Dpyv85FSQzTUfB7NYoBC5XyH0MB8F6x3Tnt8CxCxzlMbCMb0JpgAesLkSVpHhJBW5AVoQVtiO3IzReysmYh0VaHrBhVyJ23HsVYbS+NX4NcbmciS8QCJKoaKWox1dtc25FAGzHkWbqNQ6+p9UjHj+IkNFnuGCkB7ceCPEtb7LM2B4n4TfZ8l4mvKUj47AWayxawgdrj2GdrEkWR0no7fyv6PHahz+s7KYrDjrHTD6B/2kPl+v0UhU1dYDmnHW7BcpxhJoqTs1Cl9A8jkdWLrE8hsH0PRUubVrQZhRYn9ah45Ay0ObajYPlQAqEJbXajkLgKoqwHbbLBItaBUv0fOYaX6hwHrEjrGApXbvi7Pdqer0Zi/SWUgDEOZZEuQiK8GQntu4NQj+IkfNY6+6l7tRBlNi5DltAG5K79bJ6lHdZb8/dQbGK5LEgHipt7BLmtQ2LBttCf0nFOJ1xgOc4xwuJqLqNIbd+PShSsROLojSjzbRISR00opgp7bhGyRk2gSLt/DPjSUAO/nVOXKE5qB0s2MEteqMvWYJbDoYw7GvgjFH91OfpcZsA99v0slESxCJVvCKxGgfl/7hXeHccFluOcMKwO0qdRwHdofnwfqm6+l8KitQBtZqNQQP3XjvdaRzJRnIzzDX34iOJkKvBB9JkLrXbqkEWrBrkCJ1O0LQJZqr6FPp9rjuNyHWfE4jFYjnMCsD5yv48sV/eh//yb0Ua2BG1gIf29HrkQt1LEtDiGi6th5wL0WUuR6/kaZHHtpIjPCuxFmapfzrP0ieO8TscZ0bjAcpzjTBQnb0NtbeYg999MVIJhFIrXehFZBH6M3IoRsNUz6pzjxBLkAgS5t5ejvSKI/PEUNd3uBR50ceU4juM4juM4juM4juM4juM4juM4juM4juM4juM4juM4juM4juM4juM4juM4juM4juM4juM4juM4juM4juM4juOckvx/fi65nnv4cvMAAAAASUVORK5CYII=",
            "x": -1.0,
            "y": -0.46,
            "w": 2.0,
            "h": 0.82,
            "alpha": 0.92
          }
        ],
        "armDecal": "data:image/png;base64,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"
      },
      "shorts": "#f4f2ec",
      "trim": "#c8102e",
      "shortsStyle": "hibiscus",
      "flowers": [
        "#c8102e",
        "#123b8c"
      ],
      "legPatch": false,
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
      "damage": 8,
      "cooldown": 0.8,
      "speed": 0.13,
      "size": 13,
      "knockback": 150,
      "reach": 38,
      "koChance": 0
    },
    "bodyShots": {
      "chance": 30,
      "damageMult": 1.2,
      "knockback": 20,
      "dip": 0.04,
      "drive": 0.09,
      "recover": 0.06,
      "setupMult": 1.7,
      "setupTime": 1.0,
      "guardDrop": 10
    },
    "uppercuts": {
      "chance": 12,
      "close": 32,
      "damageMult": 1.3,
      "dip": 0.05,
      "drive": 0.11,
      "recover": 0.07,
      "setupMult": 1.6,
      "setupTime": 1.0,
      "guardDrop": 10
    },
    "hasKick": false,
    "hasGrapple": false,
    "hasPowerPunch": false,
    "hasRage": false,
    "hasWatcher": false,
    "hasWeave": false,
    "hasSwing": false,
    "hasForget": false,
    "blockChance": 12,
    "tdd": {
      "sprawlChance": 70
    },
    "holloway": {
      "volume": {
        "combo": [
          3,
          6
        ],
        "damage": [
          8,
          12
        ],
        "cooldown": [
          0.75,
          0.4
        ],
        "comboKnockback": 30,
        "chase": 260,
        "slack": 14
      },
      "blessed": {
        "timeFill": 0.018,
        "hitFill": 0.006,
        "announce": [
          0.5,
          1
        ]
      },
      "guardRespect": {
        "chance": 85,
        "margin": 22
      },
      "chin": {
        "over": 12,
        "mult": 0.7,
        "sources": [
          "punch",
          "kick",
          "kickback",
          "swing",
          "power",
          "combo",
          "flow"
        ]
      },
      "unbothered": {
        "chance": 75
      },
      "booth": {
        "after": 14,
        "lead": 50,
        "minMeter": 0.3,
        "range": 170,
        "every": 14,
        "max": 2,
        "count": 1.1,
        "boxer": 1.7,
        "slip": 70,
        "counter": 9
      },
      "flashback": {
        "first": [
          13,
          22
        ],
        "zone": 0.6,
        "tv": 5.5,
        "back": 0.9
      },
      "mash": {
        "time": 6,
        "combo": [
          4,
          7
        ],
        "damage": 1.15,
        "backfist": 18,
        "chase": 300,
        "gap": 0.3
      },
      "gaethje": {
        "koBonus": 45,
        "belt": true
      },
      "ilia": {
        "hurt": 1.6
      },
      "lines": {
        "booth": true,
        "blessed": true,
        "middle": true,
        "zone": true,
        "win": true,
        "matador": true,
        "conor": true,
        "rogan": true
      }
    },
    "hasSpecial": true,
    "special": {
      "move": "middle",
      "chargeTime": 42,
      "hitCut": 1,
      "punchCut": 0.3,
      "trigger": "late",
      "lateHp": 40,
      "lateAfter": 45,
      "lateFreeCall": true,
      "acceptChance": 100,
      "point": 1.2,
      "walk": 1.1,
      "gap": 18,
      "fury": 2.6,
      "punchEvery": 0.09,
      "damage": 5,
      "answerEvery": 0.5,
      "answerScale": 0.6,
      "answerMax": 18,
      "finalWindup": 0.32,
      "finalDamage": 40,
      "koBase": 15,
      "koLow": 55,
      "koMeter": 15,
      "declineRefund": 0.5
    }
  },
  {
    "id": "c-michael-bisping",
    "rev": 2,
    "builtin": false,
    "weightClass": "middleweight",
    "name": "Michael Bisping",
    "base": "Brawler",
    "bio": "\"The Count\". Former UFC middleweight champion from England, now a commentator. He lost the sight in his right eye and won the title fighting with it, so here he wears a pirate's eye patch over it, with a skull and crossbones on his shorts. A volume kickboxer: quick punches, body kicks and combinations, and he never stands still, stepping back out after everything he throws and circling at the edge of his range while the 10-9 cards pile up. He moves to the side around kicks: he side-steps theirs, and steps off to an angle before he throws his own. Takedowns mostly get stuffed, and he hates grapplers: a shot he stuffs gets punished in the clinch. Every time he's in the clinch it's knees and elbows. His special is Broadside: the sea spreads over the mat, a pirate ship with a Union Jack mainsail rises out of it in the middle of the cage, and he hops on deck in a captain's hat while three cannons on the bow fire volleys across the cage at them.",
    "color": "#b3202a",
    "label": "",
    "imgData": null,
    "look": {
      "skin": "#e8b39a",
      "build": "lean",
      "bodyHair": "light",
      "hair": "short",
      "hairColor": "#2e2119",
      "beard": "short",
      "beardColor": "#2e2119",
      "ears": "normal",
      "tattoos": {},
      "eyePatch": "right",
      "shorts": "#161618",
      "trim": "#b3202a",
      "shortsStyle": "jollyroger",
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
      "damage": 14,
      "cooldown": 0.5,
      "speed": 0.18,
      "size": 13,
      "knockback": 120,
      "reach": 40,
      "koChance": 0
    },
    "hasKick": true,
    "kick": {
      "damage": 26,
      "cooldown": 2.0,
      "speed": 0.36,
      "size": 14,
      "knockback": 220,
      "reach": 64,
      "checkChance": 25
    },
    "hasGrapple": false,
    "hasPowerPunch": false,
    "hasRage": false,
    "hasWatcher": false,
    "hasWeave": false,
    "hasSwing": false,
    "hasForget": false,
    "blockChance": 15,
    "tdd": {
      "sprawlChance": 75
    },
    "knee": {
      "clinch": {
        "first": [
          3,
          5
        ],
        "every": [
          5,
          8
        ],
        "range": 16,
        "knees": [
          2,
          4
        ],
        "damage": 10,
        "gap": 0.66,
        "escape": 12,
        "grapplerEscape": 10,
        "knockback": 380
      }
    },
    "combos": {
      "first": [
        4,
        6
      ],
      "every": [
        6,
        9
      ],
      "list": {
        "one-two-kick": 3,
        "jab-cross-hook": 2,
        "punch-clinch": 1
      }
    },
    "bisping": {
      "footwork": {
        "out": 0.2,
        "angle": 1.2,
        "press": 60,
        "circle": 0.8,
        "rate": 4.2,
        "switch": [
          1.5,
          3.5
        ]
      },
      "scorecard": {
        "every": 10,
        "max": 6
      },
      "clinch": {
        "elbows": true,
        "damage": 9,
        "speed": 0.24,
        "critChance": 35,
        "critMult": 2.5,
        "cut": {
          "chance": 40,
          "time": 4,
          "dps": 2
        }
      },
      "punish": {
        "chance": 100,
        "knees": [
          2,
          3
        ]
      },
      "kickDodge": {
        "chance": 40,
        "speed": 520,
        "time": 0.22,
        "back": 0.35
      },
      "kickAngle": {
        "chance": 100,
        "speed": 400,
        "time": 0.2,
        "fwd": 0.45
      },
      "lines": {
        "start": [
          "I started fighting when I came out of my mother, really.",
          "I'm fighting myself in this fight."
        ],
        "mirror": [
          "I'm fighting myself in this fight."
        ],
        "startAt": [
          1,
          2.5
        ],
        "taunt": [
          "I think I'm a nice guy. I go through life, I'm respectful to people, I never trash talk, and everybody wants to fight me."
        ],
        "tauntEvery": [
          16,
          26
        ],
        "tauntMax": 2,
        "takedown": [
          "I can't wrestle too well, but I can stop takedowns."
        ],
        "takedownChance": 70,
        "clinch": [
          "If the guy's holding you down and he won't let you move, just, just fire away with elbows.",
          "I'm going to bring my knee up and knee him in the face."
        ],
        "clinchChance": 45,
        "combo": [
          "Very basic stuff done to a high level is what wins fights."
        ],
        "comboChance": 70,
        "blind": [
          "I can't look two places at once, guys."
        ],
        "blindChance": 10,
        "missChance": 4,
        "blindMax": 1,
        "knockdown": [
          "I've always said I had knockout power, for God's sake. Nobody believed it."
        ],
        "knockdownChance": 100,
        "win": [
          "Everybody, everybody that doubted me, kiss my [BLEEP]."
        ],
        "loss": [
          "It's back to the drawing board. I'm going nowhere, don't you forget it."
        ],
        "special": [
          "I'll knock him out, and I'll knock all you lot out, one by one."
        ],
        "vs": {
          "c-anderson-silva": {
            "once": [
              "I worship this guy. This guy is the greatest martial artist of all time."
            ]
          }
        },
        "gap": 6
      }
    },
    "hasSpecial": true,
    "special": {
      "move": "broadside",
      "chargeTime": 45,
      "hitCut": 2,
      "punchCut": 0.5,
      "ship": {
        "length": 290,
        "y": 0.6,
        "rise": 0.75,
        "board": 0.5,
        "sink": 0.7,
        "drift": 12,
        "bob": 4,
        "roll": 0.035,
        "solid": true,
        "sea": 0.34
      },
      "cannons": {
        "count": 3,
        "aim": 1,
        "reaim": 0.75,
        "lock": 0.35,
        "lead": 1,
        "spread": 12,
        "stagger": 0.14,
        "speed": 780,
        "size": 11
      },
      "volley": {
        "volleys": 2,
        "gap": 0.5,
        "hold": 0.5
      },
      "damage": 16,
      "knockback": 760,
      "shove": 0.8
    }
  },
  {
    "id": "c-nate-diaz",
    "rev": 2,
    "builtin": false,
    "weightClass": "welterweight",
    "name": "Nate Diaz",
    "base": "Brawler",
    "bio": "From Stockton, California (the 209). A rangy boxer on the Brawler base with long, quick, light punches and a jaw nobody can find: he takes less from everything, and most one-punch knockouts just bounce off him (\"IRON CHIN!\"). A Gracie black belt who never stops hunting the neck: every few seconds he dives in for a rear naked choke, an armbar or a guillotine, and every time they fight him off he comes back sooner and sinks it deeper. The Stockton Slap: he drops his hands, arms out wide, then slaps them with an open glove. It barely hurts, but it leaves them dizzy, and a dizzy opponent is one he can take the back of. Late in the fight he says a line, lands a big Stockton Slap and turns it up for the rest of the fight: faster, harder, deeper chokes. Special move: Nick Diaz. His big brother hops the fence and comes in to help for a few seconds, \"Don't be scared, homie.\" Against Conor McGregor it's UFC 196 again: he answers the trash talk, slaps him all fight, and goes for the guillotine that turns into the back take and the choke.",
    "color": "#d9622b",
    "label": "",
    "imgData": null,
    "look": {
      "skin": "#dfab88",
      "build": "lean",
      "flat": true,
      "bodyHair": "none",
      "hair": "buzz",
      "hairColor": "#1e1611",
      "beard": "none",
      "beardColor": "#1e1611",
      "diazChin": 0.15,
      "ears": "normal",
      "tattoos": {},
      "shorts": "#121212",
      "trim": "#121212",
      "shortsStyle": "stripe",
      "waistText": "209",
      "waistTextColor": "#d9622b",
      "gloves": "#151515",
      "gloveStrap": "#c8202c"
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
      "damage": 11,
      "cooldown": 0.55,
      "speed": 0.22,
      "size": 14,
      "knockback": 120,
      "reach": 46,
      "koChance": 0
    },
    "hasKick": false,
    "hasGrapple": false,
    "hasPowerPunch": false,
    "hasRage": false,
    "hasWatcher": false,
    "hasWeave": false,
    "hasSwing": false,
    "hasForget": false,
    "blockChance": 12,
    "hasGuillotine": true,
    "guillotine": {
      "chance": 30,
      "tapBase": 8,
      "tapLowHp": 45,
      "cooldown": 5,
      "outcomes": {
        "escape": 55,
        "gnp": 15,
        "resink": 25,
        "slam": 5
      },
      "slamDamage": 50
    },
    "rnc": {
      "tapBase": 8,
      "tapLowHp": 45
    },
    "armbar": {
      "tapBase": 8,
      "tapLowHp": 45
    },
    "diaz": {
      "durability": {
        "take": 0.72
      },
      "chin": {
        "chance": 65,
        "damage": 45,
        "taunt": 0.8
      },
      "subDefense": {
        "save": 50
      },
      "slap": {
        "first": [
          3,
          5
        ],
        "every": [
          5,
          8
        ],
        "range": 70,
        "reach": 44,
        "windup": 0.38,
        "damage": 6,
        "dizzy": 1.3,
        "knockback": 150,
        "tauntAfter": 20,
        "taunt": 0.7
      },
      "subHunt": {
        "first": [
          8,
          12
        ],
        "every": [
          6,
          9
        ],
        "retry": [
          3.5,
          5.5
        ],
        "range": 60,
        "reach": 0.34,
        "escape": 40,
        "escapeDizzy": 15,
        "grapplerEscape": 15,
        "weaveEscape": 15,
        "onDizzy": 40,
        "tapBase": 6,
        "tapLowHp": 50,
        "persist": 6,
        "persistMax": 4,
        "subs": {
          "rnc": 45,
          "armbar": 25,
          "guillotine": 30
        }
      },
      "stockton": {
        "after": 30,
        "orBelow": 0.45,
        "minT": 12,
        "call": 1.1,
        "approach": 1.8,
        "slapDamage": 10,
        "slapDizzy": 2.0,
        "damage": 1.2,
        "speed": 1.12,
        "attack": 1.2,
        "tapBonus": 8,
        "slapEvery": [
          3.5,
          5.5
        ]
      },
      "lines": {
        "start": 70,
        "answer": 70,
        "trash": [
          7,
          11
        ],
        "slapped": 25
      },
      "iconic": {
        "buffer": true,
        "rogan": true
      },
      "vsConor": {
        "slapEvery": [
          3.5,
          6
        ],
        "chain196": 60,
        "chainBonus": 10,
        "bottlesBack": 2,
        "bottleDamage": 6,
        "bottleSpeed": 560
      }
    },
    "hasSpecial": true,
    "special": {
      "move": "nickdiaz",
      "chargeTime": 55,
      "hitCut": 3,
      "punchCut": 0.8,
      "announce": 2.6,
      "time": 6,
      "speed": 340,
      "lunge": 80,
      "dash": 900,
      "dashTime": 0.2,
      "reach": 14,
      "slapWind": 0.6,
      "slapDamage": 7,
      "slapDizzy": 0.9,
      "punch": 4,
      "flurry": 3,
      "flurryEvery": 0.7,
      "maxDamage": 45
    }
  },
  {
    "id": "c-sean-omalley",
    "rev": 1,
    "builtin": false,
    "weightClass": "bantamweight",
    "name": "Sean O'Malley",
    "base": "Kicker",
    "bio": "\"Suga\". Built on the Kicker base: long kicks from range and a hard punch up close, a lot of them critical hits for double damage. He doesn't throw many combinations. He snipes: from a few steps away he plants, measures them with his lead hand while a laser and a scope settle on them, then fires one long straight right, the single clean shot he's known for, with a much bigger chance to crit (SNIPED!). Every few seconds up close he goes up on one leg with his arms out like wings for the crane kick, then leaps in with a front kick that knocks them into the cage. Candy rains into the ring all fight long and only he goes for it: between exchanges he drifts toward the nearest one, and anything he touches is his. Every candy is more sugar (SUGAR x4 by his health bar), and every sugar is a bigger chance to crit. A golden donut is worth three, and every candy changes his braids to another of his real fight-night hair colours. At ten he is on a sugar high, then he crashes: slow and drowsy for a moment, and most of the sugar is gone. Cotton candy is pure sugar: straight to the high, then the crash. Special move: Sugar Rush, a shower of extra candy he hunts down.",
    "color": "#e75480",
    "label": "",
    "imgData": null,
    "look": {
      "skin": "#f3d0b5",
      "build": "lean",
      "bodyHair": "none",
      "hair": "braids",
      "hairColor": "#8a3ffc",
      "hairColors": [
        "#8a3ffc",
        "#2d7ff9"
      ],
      "beard": "none",
      "ears": "normal",
      "faceInk": true,
      "tattoos": {
        "owl": true,
        "script": true,
        "leftArm": true,
        "rightArm": true,
        "color": true
      },
      "shorts": "#e75480",
      "trim": "#d4af37",
      "shortsStyle": "stripe",
      "gloves": "#161616"
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
      "damage": 25,
      "cooldown": 1.25,
      "speed": 0.26,
      "size": 13,
      "knockback": 120,
      "reach": 38,
      "koChance": 0
    },
    "hasKick": true,
    "kick": {
      "damage": 36,
      "cooldown": 2.6,
      "speed": 0.45,
      "size": 15,
      "knockback": 450,
      "reach": 76,
      "checkChance": 25
    },
    "hasGrapple": false,
    "hasPowerPunch": false,
    "hasRage": false,
    "hasWatcher": false,
    "hasWeave": false,
    "hasSwing": false,
    "hasForget": false,
    "blockChance": 12,
    "tdd": {
      "sprawlChance": 50
    },
    "combos": {
      "first": [
        9,
        13
      ],
      "every": [
        13,
        19
      ],
      "list": {
        "one-two-kick": 1
      }
    },
    "suga": {
      "crit": {
        "chance": 40,
        "mult": 2
      },
      "critKo": {
        "base": 20,
        "low": 50,
        "after": 14,
        "sugar": 6
      },
      "snipe": {
        "first": [
          3,
          5
        ],
        "every": [
          5.5,
          8.5
        ],
        "minGap": 60,
        "maxGap": 240,
        "aim": 0.6,
        "lock": 0.12,
        "track": 9,
        "speed": 1150,
        "turn": 3,
        "reach": 34,
        "damage": 30,
        "crit": 15,
        "knockback": 560,
        "miss": 0.35,
        "readChance": 20
      },
      "craneKick": {
        "first": [
          4,
          7
        ],
        "every": [
          6,
          9
        ],
        "range": 100,
        "pose": 0.6,
        "leap": 0.22,
        "lunge": 760,
        "reach": 34,
        "damage": 45,
        "knockback": 900,
        "wallSlams": 1,
        "slamDamage": 6,
        "readChance": 25
      },
      "candy": {
        "first": [
          1,
          2
        ],
        "every": [
          1,
          1.8
        ],
        "max": 6,
        "life": 12,
        "fall": 0.55,
        "gap": 70,
        "reach": 3,
        "magnet": 30,
        "kinds": {
          "lollipop": {
            "odds": 18,
            "sugar": 1
          },
          "gummy": {
            "odds": 18,
            "sugar": 1
          },
          "wrapped": {
            "odds": 16,
            "sugar": 1
          },
          "gumball": {
            "odds": 16,
            "sugar": 1
          },
          "candyCane": {
            "odds": 14,
            "sugar": 1
          },
          "cottonCandy": {
            "odds": 9,
            "sugar": 0,
            "crash": true
          },
          "donut": {
            "odds": 6,
            "sugar": 3
          }
        }
      },
      "drift": {
        "every": [
          1.5,
          3
        ],
        "time": [
          1.2,
          2
        ],
        "range": 240,
        "turn": 2.4,
        "speed": 1.08,
        "notWithin": 40
      },
      "sugar": {
        "crit": 4,
        "cap": 10,
        "drain": 7,
        "maxChance": 90,
        "floater": true
      },
      "crash": {
        "atCap": true,
        "high": 3.5,
        "time": 2.5,
        "slow": 0.6,
        "attackSlow": 0.75,
        "keep": 0.25
      },
      "hair": [
        {
          "event": "UFC 250",
          "colors": [
            "#e53935",
            "#fb8c00",
            "#fdd835",
            "#43a047",
            "#1e88e5",
            "#8e24aa"
          ]
        },
        {
          "event": "UFC 252",
          "colors": [
            "#ffdd00",
            "#ffdd00",
            "#034ea2",
            "#ed1c24"
          ]
        },
        {
          "event": "UFC 264",
          "colors": [
            "#ff4fa3",
            "#8e3fd6"
          ]
        },
        {
          "event": "UFC 276",
          "colors": [
            "#ff1f8e"
          ]
        },
        {
          "event": "UFC 280",
          "colors": [
            "#e0202b"
          ]
        },
        {
          "event": "UFC 292",
          "colors": [
            "#ff5fa8",
            "#ffe03a",
            "#39d353"
          ]
        },
        {
          "event": "UFC 299",
          "colors": [
            "#8a3ffc",
            "#2d7ff9"
          ]
        },
        {
          "event": "UFC 306",
          "colors": [
            "#ff5fa8",
            "#3ddc84",
            "#2f8fff"
          ]
        }
      ],
      "hairStart": 6,
      "hairTag": true,
      "hairTagGap": 8,
      "voice": {
        "start": 100,
        "win": true,
        "wait": 8,
        "candy": 30,
        "gap": 5,
        "snipeAim": 25,
        "snipeLand": 30,
        "rightHand": 50,
        "bigShot": 30,
        "combo": 60,
        "comeback": 75,
        "comebackDown": 100
      },
      "lines": {
        "start": [
          "Every single fight I go into, I'm looking for the knockout.",
          "Welcome to the Suga Show."
        ],
        "sniper": [
          "I'm a sniper. I'm gonna snipe his chin. I'm gonna find it."
        ],
        "rightHand": [
          "I know what I possess in this right hand, baby."
        ],
        "bigShot": [
          "I don't even know if that was a mistake. I'm just that good."
        ],
        "combo": [
          "Ah, that was sexy."
        ],
        "comeback": [
          "Championship mindset, baby!"
        ],
        "candy": [],
        "donut": [],
        "sugarHigh": [],
        "crash": [],
        "wakeUp": []
      },
      "linesVs": {
        "c-ilia-topuria": {
          "start": [
            "Dana, give me a jet to Spain, baby. I'm coming for Ilia Topuria."
          ]
        }
      }
    },
    "hasSpecial": true,
    "special": {
      "move": "sugarrush",
      "chargeTime": 40,
      "hitCut": 3,
      "punchCut": 2,
      "call": 1.0,
      "sweets": 5,
      "donuts": 1,
      "fall": 0.7,
      "hunt": 4,
      "huntSprint": 1.25,
      "huntTurn": 7
    }
  },
  {
    "id": "c-sean-strickland",
    "rev": 2,
    "builtin": false,
    "weightClass": "middleweight",
    "name": "Sean Strickland",
    "base": "Brawler",
    "bio": "Built on the Brawler base, and his offense is mostly two things: a long, stiff jab and the teep, a front push kick that shoves them back when they come in. He fights at the end of that jab, backing out at an angle when they get close and circling, in the Philly shell: lead hand low across his stomach, rear glove by his chin, rolling punches off his shoulder and jabbing straight back. Takedowns mostly get stuffed. He never gets tired: every few seconds his pace goes up, and late in the fight they're the ones sweating. The bar under his health is his trauma meter. Every hit and every taunt (any line of theirs, a thumbs down, a celebration) fills it, he gets TRIGGERED, and the fuller it is the faster his special charges. His special is America: when he's landing on them or has them cornered, a bald eagle swoops in and hits them, the crowd chants U-S-A under flags and fireworks, and Chuck Norris drops in to beat them up with him while he chases them into a corner throwing overhand rights.",
    "color": "#3c3b6e",
    "label": "",
    "imgData": null,
    "look": {
      "skin": "#e3a98f",
      "build": "lean",
      "bodyHair": "light",
      "hair": "buzz",
      "hairColor": "#7a5e4a",
      "beard": "stubble",
      "beardColor": "#7a5e4a",
      "ears": "normal",
      "tattoos": {},
      "shorts": "#2b2d5c",
      "trim": "#151515",
      "shortsStyle": "usa",
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
      "damage": 13,
      "cooldown": 0.5,
      "speed": 0.2,
      "size": 14,
      "knockback": 150,
      "reach": 46,
      "koChance": 0
    },
    "hasKick": false,
    "hasGrapple": false,
    "hasPowerPunch": false,
    "hasRage": false,
    "hasWatcher": false,
    "hasWeave": false,
    "hasSwing": false,
    "hasForget": false,
    "blockChance": 14,
    "tdd": {
      "sprawlChance": 72
    },
    "hasTeep": true,
    "teep": {
      "cooldown": 2.2,
      "range": 34,
      "reach": 52,
      "chamber": 0.14,
      "extend": 0.08,
      "hold": 0.12,
      "recover": 0.16,
      "damage": 10,
      "push": 620,
      "blockPush": 0.5,
      "stuff": true,
      "onlyClosing": true,
      "size": 15
    },
    "strickland": {
      "oneTwo": {
        "chance": 22,
        "cooldown": 3.5,
        "windup": 0.16,
        "reach": 50,
        "damage": 24,
        "knockback": 360,
        "koBase": 3,
        "koLow": 30,
        "koAfter": 10
      },
      "range": {
        "keep": 26,
        "press": 55,
        "angle": 0.7,
        "rate": 4.2,
        "switch": [
          1.5,
          3.5
        ],
        "squaredUp": true
      },
      "shell": {
        "chance": 32,
        "kickChance": 14,
        "projChance": 8,
        "counter": 50,
        "angryOff": true
      },
      "cardio": {
        "every": 15,
        "max": 6,
        "speed": 0.035,
        "rate": 0.05,
        "shell": 2,
        "tiredAt": 2,
        "tire": 0.04,
        "tireMin": 0.82,
        "callAt": 4
      },
      "trauma": {
        "hitFill": 2,
        "dmgFill": 0.12,
        "tauntFill": 14,
        "tauntGap": 1.5,
        "boost": 1.5,
        "keep": 0.25
      },
      "lines": {
        "gap": 6,
        "start": 100,
        "roll": 12,
        "stuffed": 50,
        "triggered": 35,
        "hurt": 40,
        "hurtAt": 28,
        "pace": 100,
        "paceAt": 3,
        "america": 100,
        "win": 100
      },
      "rivals": {
        "pereira": {
          "trauma": 35,
          "hookKo": 6
        }
      }
    },
    "hasSpecial": true,
    "special": {
      "move": "america",
      "chargeTime": 70,
      "hitCut": 3,
      "punchCut": 1,
      "notBefore": 12,
      "trigger": {
        "landed": 3,
        "window": 4,
        "cornered": true,
        "near": 60,
        "wait": 10
      },
      "eagle": {
        "dive": 0.8,
        "damage": 18,
        "unblockable": true,
        "knockback": 300,
        "stun": 0.45,
        "after": 0.3
      },
      "flags": 0.7,
      "bike": false,
      "rev": 0.9,
      "lock": 0.3,
      "runUp": 140,
      "speed": 1250,
      "turn": 1.0,
      "bikeDamage": 48,
      "knockback": 900,
      "walls": 2,
      "wallDamage": 6,
      "overhands": 6,
      "overhandDamage": 17,
      "overhandKnock": 420,
      "cornerBonus": 1.6,
      "chase": 560,
      "time": 4.5,
      "norris": {
        "on": true,
        "chance": 100,
        "rappel": 0.55,
        "flag": true,
        "speed": 560,
        "reach": 30,
        "time": 2.6,
        "punchEvery": 0.14,
        "kickEvery": 4,
        "punchDamage": 4,
        "kickDamage": 9,
        "punchKnock": 140,
        "kickKnock": 300,
        "stun": 0.12,
        "windup": 0.3,
        "roundhouseDamage": 30,
        "unblockable": true,
        "roundhouseKnock": 700,
        "overhandsCut": 2,
        "boom": true,
        "kickLine": 50,
        "lines": {
          "arrive": [],
          "roundhouse": [],
          "leave": []
        }
      }
    }
  },
  {
    "id": "c-tony-ferguson",
    "rev": 6,
    "builtin": false,
    "weightClass": "lightweight",
    "name": "Tony Ferguson",
    "base": "Brawler",
    "bio": "\"El Cucuy\" (the boogeyman). A lean Lightweight in a red karate headband, prime Tony: blonde hair receding at the temples and a lean, angular face. Low base damage, but his elbows are sharp: lots of them are critical hits, and a crit can open a cut that bleeds. He's a hard man to hurt, and when a choke or an armbar is about to finish him, he often just won't tap. Knock him down and he's at home on his back: step into his guard and he catches you in a buggy choke, his D'Arce or elbows from the bottom. His walkout shuffle is a weapon: he slides side to side, slipping strikes, then shoots for the takedown. Under fire he pulls into a ninja turtle shell, and up to twice a fight he goes Kaioken: red aura, harder and faster. Special move: Katanas, blades out of both elbows. When he loses he trips over a TV cable before he blows up.",
    "color": "#e86a10",
    "label": "",
    "imgData": null,
    "look": {
      "skin": "#dfae8e",
      "build": "lean",
      "face": "angular",
      "bodyHair": "none",
      "hair": "receding",
      "hairColor": "#d6b05a",
      "beard": "none",
      "ears": "normal",
      "tattoos": {
        "leftArm": false,
        "armInk": true,
        "armInkSide": "left",
        "armDecal": "data:image/png;base64,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"
      },
      "shorts": "#151515",
      "trim": "#e86a10",
      "shortsStyle": "stripe",
      "gloves": "#141414",
      "cucuy": {
        "stubble": {
          "color": "#7a5a30",
          "alpha": 0.16
        },
        "headband": {
          "color": "#c41e1e",
          "drop": 0.07
        }
      }
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
      "damage": 9,
      "cooldown": 0.8,
      "speed": 0.26,
      "size": 14,
      "knockback": 160,
      "reach": 38,
      "koChance": 0
    },
    "hasKick": true,
    "kick": {
      "damage": 12,
      "cooldown": 3.4,
      "speed": 0.4,
      "size": 14,
      "knockback": 160,
      "reach": 58,
      "checkChance": 20
    },
    "hasGrapple": false,
    "tdd": {
      "sprawlChance": 40
    },
    "hasPowerPunch": false,
    "hasRage": false,
    "hasWatcher": false,
    "hasWeave": false,
    "hasSwing": false,
    "hasForget": false,
    "hasGuard": true,
    "guard": {
      "chance": 22,
      "time": 4.5,
      "radius": 130,
      "passChance": 25,
      "passPunches": 4,
      "passDamage": 10,
      "subs": [
        "buggy",
        "darce",
        "elbows"
      ],
      "cooldown": 4
    },
    "blockChance": 10,
    "elbow": {
      "damage": 6,
      "cooldown": 1.15,
      "speed": 0.26,
      "reach": 14,
      "critChance": 55,
      "critMult": 3,
      "knockback": 150,
      "cut": {
        "chance": 45,
        "time": 4,
        "dps": 2
      }
    },
    "combos": {
      "first": [
        4,
        6
      ],
      "every": [
        7,
        10
      ],
      "list": {
        "jab-cross-elbow": 3,
        "elbow-elbow-knee": 2
      }
    },
    "ferguson": {
      "durability": {
        "damageTaken": 0.82
      },
      "wontTap": {
        "chances": [
          65,
          40
        ],
        "cost": 18,
        "vsCharlesArmbar": true
      },
      "slide": {
        "first": [
          3,
          5
        ],
        "every": [
          4.5,
          7
        ],
        "minGap": 20,
        "maxGap": 200,
        "hops": 3,
        "hopTime": 0.24,
        "speed": 560,
        "dodge": 70,
        "react": 60,
        "shoot": 65,
        "shootRange": 90,
        "level": 0.16,
        "shotSpeed": 980,
        "shotMax": 0.45
      },
      "takedown": {
        "damage": 14,
        "finish": {
          "buggy": 35,
          "darce": 35,
          "elbows": 30
        }
      },
      "buggy": {
        "tapBase": 15,
        "tapLowHp": 55
      },
      "darce": {
        "tapBase": 20,
        "tapLowHp": 55
      },
      "groundElbows": {
        "count": 4,
        "gap": 0.32,
        "damage": 6,
        "critChance": 50,
        "critMult": 3
      },
      "shell": {
        "first": [
          8,
          14
        ],
        "every": [
          14,
          20
        ],
        "max": 3,
        "burst": 45,
        "window": 2.5,
        "cooldown": 8,
        "time": 2.2,
        "spin": {
          "chance": 70,
          "speed": 860,
          "time": 1.0,
          "damage": 18,
          "knockback": 900,
          "wallSlams": 1,
          "slamDamage": 4
        }
      },
      "kaioken": {
        "first": [
          14,
          22
        ],
        "every": [
          16,
          24
        ],
        "lowHp": 0.45,
        "max": 2,
        "time": 7,
        "damage": 1.2,
        "speed": 1.22,
        "attack": 1.2,
        "x": [
          2,
          3
        ]
      },
      "burrito": {
        "first": [
          42,
          52
        ],
        "after": [
          2.5,
          4
        ],
        "lowHp": 0.3,
        "time": 9,
        "x": 10,
        "damage": 1.25,
        "speed": 1.25,
        "attack": 1.2,
        "teleport": {
          "every": [
            1.6,
            2.6
          ],
          "chance": 45,
          "projChance": 65,
          "cd": 0.8,
          "projCd": 0.3
        },
        "barrage": {
          "at": 0.5,
          "max": 1,
          "range": 250,
          "time": 2.2,
          "every": 0.06,
          "spread": 0.16,
          "speed": 900,
          "damage": 1,
          "bigDamage": 14,
          "bigKnockback": 800,
          "bigSlamDamage": 4
        },
        "shellStrike": {
          "comboAt": 3,
          "at": 3.5,
          "max": 2,
          "speed": 900,
          "damage": 22,
          "knockback": 950,
          "wallSlams": 1,
          "slamDamage": 5
        },
        "beamSurf": {
          "chance": 60,
          "speed": 560,
          "leapGap": 120,
          "leapBack": 70,
          "width": 46,
          "damage": 30,
          "knockback": 950,
          "wallSlams": 1,
          "slamDamage": 5
        }
      },
      "bellAd": true,
      "death": {
        "cable": true
      },
      "rivals": {
        "khabib": {
          "stamps": [
            "DEC 2015: RIBS",
            "APR 2016: LUNGS",
            "MAR 2017: WEIGHT CUT",
            "APR 2018: KNEE",
            "APR 2020: COVID"
          ],
          "final": "FIGHT!"
        },
        "gaethje": {
          "label": "UFC 249",
          "kaioken": [
            5,
            8
          ]
        },
        "charles": {
          "label": "UFC 256",
          "kaioken": [
            5,
            8
          ]
        }
      },
      "lines": {
        "shell": [
          "This is a rat race. But I'm no rat. I'm a [BLEEP] turtle, ninja turtle.",
          "So which one's your favorite? I like Michelangelo."
        ],
        "wontTap": "The one thing they didn't take was my smile.",
        "subCaught": "This is chess, and you're in check.",
        "late": {
          "after": 40,
          "text": "I'm gonna take you in deep waters. I'm gonna leave you out there with no [BLEEP] snorkel."
        },
        "bell": {
          "on": true,
          "text": "Occasionally I'll eat at the Bell. I like to live m\u00e1s."
        },
        "tauntEvery": [
          12,
          18
        ],
        "vs": {
          "c-khabib-nurmagomedov": {
            "start": "You're gonna face the boogeyman.",
            "taunts": [
              "I'm going to make you taste nickels and dimes, son.",
              "What are you doing, Khabib, [BLEEP] stuffing your face full of tiramisu? It's not even Tuesday, dog.",
              "He's a cake eater."
            ],
            "win": "I've got the belt.",
            "bear": "You wrestle bear cubs. I'm a [BLEEP] wolverine."
          },
          "c-conor-mcgregor": {
            "start": "Where you at, McNuggets?",
            "taunts": [
              "Defend or vacate."
            ]
          }
        }
      },
      "calls": {
        "darce": {
          "text": "He's got it! Tony Ferguson has done it again! The winning streak!",
          "who": "UFC BROADCAST"
        },
        "any": {
          "text": "What a spectacular performance. Tony Ferguson, ladies and gentlemen! Yeah, baby!",
          "who": "UFC BROADCAST"
        }
      }
    },
    "hasSpecial": true,
    "special": {
      "move": "katana",
      "chargeTime": 55,
      "hitCut": 3,
      "punchCut": 2,
      "draw": 0.8,
      "time": 4.5,
      "speed": 1.35,
      "gap": 0.42,
      "reach": 16,
      "damage": 6,
      "critChance": 55,
      "critMult": 3.5,
      "finisher": 16,
      "readChance": 25,
      "cycloneChance": 15,
      "cycloneTime": 0.65,
      "cycloneHits": 2,
      "flashChance": 15,
      "flashRange": 150,
      "clash": {
        "parry": {
          "blade": 55,
          "saber": 50,
          "bat": 40
        },
        "lockAfter": 2,
        "win": 40,
        "hurt": 30,
        "disarm": 30,
        "winDamage": 26,
        "hurtDamage": 18
      },
      "cut": {
        "chance": 60,
        "time": 4,
        "dps": 2.5
      }
    }
  }
];
