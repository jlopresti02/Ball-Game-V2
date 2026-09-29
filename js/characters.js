// Built-in roster, ability defaults, saving custom characters, image cache.
"use strict";

// ---------------------------------------------------------------
// Character roster: built-ins + whatever the user saved
// ---------------------------------------------------------------
var builtins = [
  {
    id: "builtin-gunner", builtin: true, name: "Gunner", color: "#e5483b", label: "", imgData: null,
    hasProjectile: true, proj: { size: 7, speed: 460, damage: 10, cooldown: 1.6, imgData: null },
    hasPunch: false, punch: defaultPunch(),
    hasKick: false, kick: defaultKick(),
    hasGrapple: false, grapple: defaultGrapple(),
    hasPowerPunch: false, powerPunch: defaultPowerPunch(),
    hasRage: false, rage: defaultRage(),
    hasWatcher: false, watcher: defaultWatcher(),
    hasWeave: false, weave: defaultWeave(),
    blockChance: 0
  },
  {
    id: "builtin-brawler", builtin: true, name: "Brawler", color: "#2e64f0", label: "", imgData: null,
    hasProjectile: false, proj: defaultProj(),
    hasPunch: true, punch: { damage: 25, cooldown: 1.2, speed: 0.32, size: 15, knockback: 300, reach: 40 },
    hasKick: false, kick: defaultKick(),
    hasGrapple: false, grapple: defaultGrapple(),
    hasPowerPunch: false, powerPunch: defaultPowerPunch(),
    hasRage: false, rage: defaultRage(),
    hasWatcher: false, watcher: defaultWatcher(),
    hasWeave: false, weave: defaultWeave(),
    blockChance: 10
  },
  {
    id: "builtin-kicker", builtin: true, name: "Kicker", color: "#8b5cf6", label: "", imgData: null,
    hasProjectile: false, proj: defaultProj(),
    hasPunch: false, punch: defaultPunch(),
    hasKick: true, kick: defaultKick(),
    hasGrapple: false, grapple: defaultGrapple(),
    hasPowerPunch: false, powerPunch: defaultPowerPunch(),
    hasRage: false, rage: defaultRage(),
    hasWatcher: false, watcher: defaultWatcher(),
    hasWeave: false, weave: defaultWeave(),
    blockChance: 0
  },
  {
    id: "builtin-grappler", builtin: true, name: "Grappler", color: "#d98c0f", label: "", imgData: null,
    hasProjectile: false, proj: defaultProj(),
    hasPunch: false, punch: defaultPunch(),
    hasKick: false, kick: defaultKick(),
    hasGrapple: true, grapple: defaultGrapple(),
    hasPowerPunch: false, powerPunch: defaultPowerPunch(),
    hasRage: false, rage: defaultRage(),
    hasWatcher: false, watcher: defaultWatcher(),
    hasWeave: false, weave: defaultWeave(),
    blockChance: 0
  },
  {
    id: "builtin-powerpuncher", builtin: true, name: "Power Puncher", color: "#16a34a", label: "", imgData: null,
    hasProjectile: false, proj: defaultProj(),
    hasPunch: false, punch: defaultPunch(),
    hasKick: false, kick: defaultKick(),
    hasGrapple: false, grapple: defaultGrapple(),
    hasPowerPunch: true, powerPunch: defaultPowerPunch(),
    hasRage: false, rage: defaultRage(),
    hasWatcher: false, watcher: defaultWatcher(),
    hasWeave: false, weave: defaultWeave(),
    blockChance: 0
  },
  {
    id: "builtin-seesred", builtin: true, name: "Sees Red", color: "#b91c1c", label: "", imgData: null,
    hasProjectile: false, proj: defaultProj(),
    hasPunch: false, punch: defaultPunch(),
    hasKick: false, kick: defaultKick(),
    hasGrapple: false, grapple: defaultGrapple(),
    hasPowerPunch: false, powerPunch: defaultPowerPunch(),
    hasRage: true, rage: defaultRage(),
    hasWatcher: false, watcher: defaultWatcher(),
    hasWeave: false, weave: defaultWeave(),
    blockChance: 0
  },
  {
    id: "builtin-watcher", builtin: true, name: "Watcher", color: "#0891b2", label: "", imgData: null,
    hasProjectile: false, proj: defaultProj(),
    hasPunch: false, punch: defaultPunch(),
    hasKick: false, kick: defaultKick(),
    hasGrapple: false, grapple: defaultGrapple(),
    hasPowerPunch: false, powerPunch: defaultPowerPunch(),
    hasRage: false, rage: defaultRage(),
    hasWatcher: true, watcher: defaultWatcher(),
    hasWeave: false, weave: defaultWeave(),
    blockChance: 0
  },
  {
    // Rapid 5-damage jabs up close, and slips three quarters of everything thrown at it.
    id: "builtin-bmf", builtin: true, name: "BMF", color: "#db2777", label: "", imgData: null,
    hasProjectile: false, proj: defaultProj(),
    hasPunch: true, punch: { damage: 5, cooldown: 0.12, speed: 0.11, size: 11, knockback: 0, reach: 40 },
    hasKick: false, kick: defaultKick(),
    hasGrapple: false, grapple: defaultGrapple(),
    hasPowerPunch: false, powerPunch: defaultPowerPunch(),
    hasRage: false, rage: defaultRage(),
    hasWatcher: false, watcher: defaultWatcher(),
    hasWeave: true, weave: defaultWeave(),
    blockChance: 0
  }
];

function defaultProj() { return { size: 7, speed: 460, damage: 10, cooldown: 1.6, imgData: null }; }
function defaultPunch() { return { damage: 25, cooldown: 1.2, speed: 0.32, size: 15, knockback: 300, reach: 40 }; }
function defaultKick() { return { damage: 40, cooldown: 2.8, speed: 0.5, size: 17, knockback: 450, reach: 75 }; }
// When a grab would be the killing blow, the grapple becomes a finisher:
// a slam into the bottom wall for finSlamDamage, then the opponent is pinned
// and hit with finPunches heavy punches of finPunchDamage each.
function defaultGrapple() {
  return { damage: 50, cooldown: 1.5, speed: 0.45, reach: 6, counterChance: 25, finSlamDamage: 20, finPunches: 3, finPunchDamage: 10 };
}
// knockback is the speed the victim flies at during the wall slams; wallSlams
// is how many walls it smashes into (0 turns the slams off), each dealing
// slamDamage before it drops back to normal speed.
function defaultPowerPunch() {
  return { damageMin: 30, damageMax: 30, cooldown: 3, chargeDur: 3, spinDur: 0.9, knockback: 1300, wallSlams: 4, slamDamage: 5 };
}
function defaultRage() { return { punchDamage: 2, punchCount: 10, cooldown: 5, chargeDur: 1.5, speed: 520, reach: 20, vulnMult: 2 }; }
// Weave: dodgeChance% of incoming attacks are slipped entirely. critChance%
// of those weaves are critical: a comboHits-punch chase combo, the last one
// doing finalDamage and launching the opponent at finalKnockback speed,
// followed by a tauntDur-second celebration, during which hits on it do
// tauntVuln times their damage.
function defaultWeave() {
  return { dodgeChance: 75, critChance: 20, comboHits: 5, comboDamage: 3, finalDamage: 8, finalKnockback: 950, tauntDur: 2, tauntVuln: 2 };
}
function defaultWatcher() {
  return { lasers: 2, preDelay: 1, chargeDur: 2, fireDur: 10, tickDamage: 0.75, tickInterval: 0.25, restDur: 6, approachSpeed: 420 };
}

// Fills in fields for characters saved before an ability existed (e.g. kick, grapple, power punch, rage charge, corner watch).
function normalizeChar(ch) {
  if (ch.hasKick === undefined) ch.hasKick = false;
  if (!ch.kick) ch.kick = defaultKick();
  if (ch.hasGrapple === undefined) ch.hasGrapple = false;
  if (!ch.grapple) ch.grapple = defaultGrapple();
  ["finSlamDamage", "finPunches", "finPunchDamage"].forEach(function (k) {
    if (ch.grapple[k] == null) ch.grapple[k] = defaultGrapple()[k];
  });
  if (ch.hasPowerPunch === undefined) ch.hasPowerPunch = false;
  if (!ch.powerPunch) ch.powerPunch = defaultPowerPunch();
  if (ch.powerPunch.wallSlams == null) ch.powerPunch.wallSlams = defaultPowerPunch().wallSlams;
  if (ch.powerPunch.slamDamage == null) ch.powerPunch.slamDamage = defaultPowerPunch().slamDamage;
  if (ch.hasRage === undefined) ch.hasRage = false;
  if (!ch.rage) ch.rage = defaultRage();
  if (ch.hasWatcher === undefined) ch.hasWatcher = false;
  if (!ch.watcher) ch.watcher = defaultWatcher();
  else if (ch.watcher.lasers == null) ch.watcher.lasers = defaultWatcher().lasers;
  if (ch.hasWeave === undefined) ch.hasWeave = false;
  if (!ch.weave) ch.weave = defaultWeave();
  else if (ch.weave.tauntVuln == null) ch.weave.tauntVuln = defaultWeave().tauntVuln;
  if (ch.blockChance == null) ch.blockChance = 0;
  return ch;
}

function loadCustom() {
  try {
    var raw = localStorage.getItem(STORAGE_KEY);
    var list = raw ? JSON.parse(raw) : [];
    return list.map(normalizeChar);
  } catch (e) { return []; }
}
function saveCustom(list) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); } catch (e) {}
}

var customChars = loadCustom();
function allChars() { return builtins.concat(customChars); }
function findChar(id) {
  var all = allChars();
  for (var i = 0; i < all.length; i++) if (all[i].id === id) return all[i];
  return null;
}

// image cache: dataURL -> Image
var imgCache = {};
function getImg(dataURL) {
  if (!dataURL) return null;
  var cached = imgCache[dataURL];
  if (cached) return cached.complete ? cached : null;
  var im = new Image();
  im.src = dataURL;
  imgCache[dataURL] = im;
  return null;
}
