// Character editor: form, toggles, sliders, save/delete.
"use strict";

// ---------------------------------------------------------------
// Editor screen
// ---------------------------------------------------------------
var editingId = null;
var editState = null;

function blankChar() {
  return {
    id: "c" + Date.now() + Math.floor(Math.random() * 1000),
    builtin: false,
    name: "New Fighter",
    color: "#e5483b",
    label: "",
    imgData: null,
    hasProjectile: false,
    proj: defaultProj(),
    hasPunch: false,
    punch: defaultPunch(),
    hasKick: false,
    kick: defaultKick(),
    hasGrapple: false,
    grapple: defaultGrapple(),
    hasPowerPunch: false,
    powerPunch: defaultPowerPunch(),
    hasRage: false,
    rage: defaultRage(),
    hasWatcher: false,
    watcher: defaultWatcher(),
    hasWeave: false,
    weave: defaultWeave(),
    hasSwing: false,
    swing: defaultSwing(),
    hasForget: false,
    forget: defaultForget(),
    blockChance: 0
  };
}

function openEditor(id) {
  editingId = id;
  var ch = id ? findChar(id) : null;
  editState = ch ? JSON.parse(JSON.stringify(ch)) : blankChar();
  document.getElementById("editorTitle").textContent = id ? "Edit character" : "New character";
  document.getElementById("editorDelete").hidden = !id;
  fillEditorForm(editState);
  showScreen("editor");
}

function fillEditorForm(s) {
  // Always open every ability section so its sliders are immediately
  // visible and reachable, regardless of any prior collapsed state.
  Array.prototype.forEach.call(document.querySelectorAll(".abilityBlock"), function (block) { block.open = true; });

  document.getElementById("fName").value = s.name;
  document.getElementById("fColor").value = s.color;
  document.getElementById("fLabel").value = s.label || "";
  document.getElementById("fBlockChance").value = s.blockChance || 0;
  document.getElementById("fBlockChanceVal").textContent = (s.blockChance || 0) + "%";
  document.getElementById("fThumb").style.backgroundImage = s.imgData ? "url(" + s.imgData + ")" : "";
  document.getElementById("fImg").value = "";
  resetCropper();

  document.getElementById("projOn").setAttribute("aria-checked", String(s.hasProjectile));
  document.getElementById("projBlock").setAttribute("data-on", String(s.hasProjectile));
  document.getElementById("projSize").value = s.proj.size;
  document.getElementById("projSizeVal").textContent = s.proj.size;
  document.getElementById("projSpeed").value = s.proj.speed;
  document.getElementById("projSpeedVal").textContent = s.proj.speed;
  document.getElementById("projDamage").value = s.proj.damage;
  document.getElementById("projDamageVal").textContent = s.proj.damage;
  document.getElementById("projCooldown").value = s.proj.cooldown;
  document.getElementById("projCooldownVal").textContent = s.proj.cooldown.toFixed(1) + "s";
  document.getElementById("projThumb").style.backgroundImage = s.proj.imgData ? "url(" + s.proj.imgData + ")" : "";

  document.getElementById("punchOn").setAttribute("aria-checked", String(s.hasPunch));
  document.getElementById("punchBlock").setAttribute("data-on", String(s.hasPunch));
  document.getElementById("punchDamage").value = s.punch.damage;
  document.getElementById("punchDamageVal").textContent = s.punch.damage;
  document.getElementById("punchCooldown").value = s.punch.cooldown;
  document.getElementById("punchCooldownVal").textContent = s.punch.cooldown.toFixed(1) + "s";
  document.getElementById("punchSpeed").value = s.punch.speed;
  document.getElementById("punchSpeedVal").textContent = s.punch.speed.toFixed(2) + "s";
  document.getElementById("punchSize").value = s.punch.size;
  document.getElementById("punchSizeVal").textContent = s.punch.size;
  document.getElementById("punchKnockback").value = s.punch.knockback;
  document.getElementById("punchKnockbackVal").textContent = s.punch.knockback;
  document.getElementById("punchReach").value = s.punch.reach;
  document.getElementById("punchReachVal").textContent = s.punch.reach;

  document.getElementById("kickOn").setAttribute("aria-checked", String(s.hasKick));
  document.getElementById("kickBlock").setAttribute("data-on", String(s.hasKick));
  document.getElementById("kickDamage").value = s.kick.damage;
  document.getElementById("kickDamageVal").textContent = s.kick.damage;
  document.getElementById("kickCooldown").value = s.kick.cooldown;
  document.getElementById("kickCooldownVal").textContent = s.kick.cooldown.toFixed(1) + "s";
  document.getElementById("kickSpeed").value = s.kick.speed;
  document.getElementById("kickSpeedVal").textContent = s.kick.speed.toFixed(2) + "s";
  document.getElementById("kickSize").value = s.kick.size;
  document.getElementById("kickSizeVal").textContent = s.kick.size;
  document.getElementById("kickKnockback").value = s.kick.knockback;
  document.getElementById("kickKnockbackVal").textContent = s.kick.knockback;
  document.getElementById("kickReach").value = s.kick.reach;
  document.getElementById("kickReachVal").textContent = s.kick.reach;

  document.getElementById("grappleOn").setAttribute("aria-checked", String(s.hasGrapple));
  document.getElementById("grappleBlock").setAttribute("data-on", String(s.hasGrapple));
  document.getElementById("grappleDamage").value = s.grapple.damage;
  document.getElementById("grappleDamageVal").textContent = s.grapple.damage;
  document.getElementById("grappleCooldown").value = s.grapple.cooldown;
  document.getElementById("grappleCooldownVal").textContent = s.grapple.cooldown.toFixed(1) + "s";
  document.getElementById("grappleSpeed").value = s.grapple.speed;
  document.getElementById("grappleSpeedVal").textContent = s.grapple.speed.toFixed(2) + "s";
  document.getElementById("grappleReach").value = s.grapple.reach;
  document.getElementById("grappleReachVal").textContent = s.grapple.reach;
  document.getElementById("grappleCounter").value = s.grapple.counterChance;
  document.getElementById("grappleCounterVal").textContent = s.grapple.counterChance + "%";
  [["grappleFinSlam", "finSlamDamage"], ["grappleFinPunches", "finPunches"], ["grappleFinPunchDmg", "finPunchDamage"]].forEach(function (row) {
    document.getElementById(row[0]).value = s.grapple[row[1]];
    document.getElementById(row[0] + "Val").textContent = s.grapple[row[1]];
  });

  document.getElementById("powerOn").setAttribute("aria-checked", String(s.hasPowerPunch));
  document.getElementById("powerBlock").setAttribute("data-on", String(s.hasPowerPunch));
  document.getElementById("powerDamageMin").value = s.powerPunch.damageMin;
  document.getElementById("powerDamageMinVal").textContent = s.powerPunch.damageMin;
  document.getElementById("powerDamageMax").value = s.powerPunch.damageMax;
  document.getElementById("powerDamageMaxVal").textContent = s.powerPunch.damageMax;
  document.getElementById("powerInterval").value = s.powerPunch.cooldown;
  document.getElementById("powerIntervalVal").textContent = s.powerPunch.cooldown.toFixed(1) + "s";
  document.getElementById("powerCharge").value = s.powerPunch.chargeDur;
  document.getElementById("powerChargeVal").textContent = s.powerPunch.chargeDur.toFixed(1) + "s";
  document.getElementById("powerSpin").value = s.powerPunch.spinDur;
  document.getElementById("powerSpinVal").textContent = s.powerPunch.spinDur.toFixed(1) + "s";
  document.getElementById("powerKnockback").value = s.powerPunch.knockback;
  document.getElementById("powerKnockbackVal").textContent = s.powerPunch.knockback;
  document.getElementById("powerWallSlams").value = s.powerPunch.wallSlams;
  document.getElementById("powerWallSlamsVal").textContent = s.powerPunch.wallSlams;
  document.getElementById("powerSlamDamage").value = s.powerPunch.slamDamage;
  document.getElementById("powerSlamDamageVal").textContent = s.powerPunch.slamDamage;

  document.getElementById("rageOn").setAttribute("aria-checked", String(s.hasRage));
  document.getElementById("rageBlock").setAttribute("data-on", String(s.hasRage));
  document.getElementById("ragePunchDamage").value = s.rage.punchDamage;
  document.getElementById("ragePunchDamageVal").textContent = s.rage.punchDamage;
  document.getElementById("ragePunchCount").value = s.rage.punchCount;
  document.getElementById("ragePunchCountVal").textContent = s.rage.punchCount;
  document.getElementById("rageInterval").value = s.rage.cooldown;
  document.getElementById("rageIntervalVal").textContent = s.rage.cooldown.toFixed(1) + "s";
  document.getElementById("rageCharge").value = s.rage.chargeDur;
  document.getElementById("rageChargeVal").textContent = s.rage.chargeDur.toFixed(1) + "s";
  document.getElementById("rageSpeed").value = s.rage.speed;
  document.getElementById("rageSpeedVal").textContent = s.rage.speed;
  document.getElementById("rageReach").value = s.rage.reach;
  document.getElementById("rageReachVal").textContent = s.rage.reach;
  document.getElementById("rageVuln").value = s.rage.vulnMult;
  document.getElementById("rageVulnVal").textContent = s.rage.vulnMult + "x";

  document.getElementById("watcherOn").setAttribute("aria-checked", String(s.hasWatcher));
  document.getElementById("watcherBlock").setAttribute("data-on", String(s.hasWatcher));
  document.getElementById("watcherDelay").value = s.watcher.preDelay;
  document.getElementById("watcherDelayVal").textContent = s.watcher.preDelay.toFixed(1) + "s";
  document.getElementById("watcherCharge").value = s.watcher.chargeDur;
  document.getElementById("watcherChargeVal").textContent = s.watcher.chargeDur.toFixed(1) + "s";
  document.getElementById("watcherDuration").value = s.watcher.fireDur;
  document.getElementById("watcherDurationVal").textContent = s.watcher.fireDur.toFixed(1) + "s";
  document.getElementById("watcherTickDamage").value = s.watcher.tickDamage;
  document.getElementById("watcherTickDamageVal").textContent = s.watcher.tickDamage;
  document.getElementById("watcherTickInterval").value = s.watcher.tickInterval;
  document.getElementById("watcherTickIntervalVal").textContent = s.watcher.tickInterval.toFixed(2) + "s";
  document.getElementById("watcherRest").value = s.watcher.restDur;
  document.getElementById("watcherRestVal").textContent = s.watcher.restDur.toFixed(1) + "s";
  document.getElementById("watcherSpeed").value = s.watcher.approachSpeed;
  document.getElementById("watcherSpeedVal").textContent = s.watcher.approachSpeed;
  document.getElementById("watcherLasers").value = s.watcher.lasers;
  document.getElementById("watcherLasersVal").textContent = s.watcher.lasers;

  [["swing", "hasSwing", swingSliders], ["forget", "hasForget", forgetSliders]].forEach(function (grp) {
    document.getElementById(grp[0] + "On").setAttribute("aria-checked", String(s[grp[1]]));
    document.getElementById(grp[0] + "Block").setAttribute("data-on", String(s[grp[1]]));
    grp[2].forEach(function (row) {
      var v = s[grp[0]][row[1]];
      document.getElementById(row[0]).value = v;
      document.getElementById(row[0] + "Val").textContent = row[2](v);
    });
  });

  document.getElementById("weaveOn").setAttribute("aria-checked", String(s.hasWeave));
  document.getElementById("weaveBlock").setAttribute("data-on", String(s.hasWeave));
  weaveSliders.forEach(function (row) {
    var v = s.weave[row[1]];
    document.getElementById(row[0]).value = v;
    document.getElementById(row[0] + "Val").textContent = row[2](v);
  });
}

document.getElementById("fName").addEventListener("input", function (e) { editState.name = e.target.value || "Fighter"; });
document.getElementById("fColor").addEventListener("input", function (e) { editState.color = e.target.value; });
document.getElementById("fLabel").addEventListener("input", function (e) { editState.label = e.target.value; });
document.getElementById("fBlockChance").addEventListener("input", function (e) {
  var v = parseFloat(e.target.value) || 0;
  editState.blockChance = v;
  document.getElementById("fBlockChanceVal").textContent = v + "%";
});

// The ball's own picture is picked and cropped in cropper.js. Projectile
// pictures take any image type too, shrunk so saved characters stay small.
function shrinkImage(img, maxSize, keepsTransparency) {
  var k = Math.min(1, maxSize / Math.max(img.naturalWidth, img.naturalHeight));
  var c = document.createElement("canvas");
  c.width = Math.max(1, Math.round(img.naturalWidth * k));
  c.height = Math.max(1, Math.round(img.naturalHeight * k));
  c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
  return keepsTransparency ? c.toDataURL("image/png") : c.toDataURL("image/jpeg", 0.9);
}

document.getElementById("projImg").addEventListener("change", function (e) {
  readImageFile(e.target.files && e.target.files[0], function (img, type) {
    var dataUrl = shrinkImage(img, 160, /png|webp|gif/.test(type));
    editState.proj.imgData = dataUrl;
    document.getElementById("projThumb").style.backgroundImage = "url(" + dataUrl + ")";
  });
});
document.getElementById("projImgClear").addEventListener("click", function () {
  editState.proj.imgData = null;
  document.getElementById("projThumb").style.backgroundImage = "";
  document.getElementById("projImg").value = "";
});

var abilityToggles = [
  ["projOn", "projBlock", "hasProjectile"],
  ["punchOn", "punchBlock", "hasPunch"],
  ["kickOn", "kickBlock", "hasKick"],
  ["grappleOn", "grappleBlock", "hasGrapple"],
  ["powerOn", "powerBlock", "hasPowerPunch"],
  ["rageOn", "rageBlock", "hasRage"],
  ["watcherOn", "watcherBlock", "hasWatcher"],
  ["weaveOn", "weaveBlock", "hasWeave"],
  ["swingOn", "swingBlock", "hasSwing"],
  ["forgetOn", "forgetBlock", "hasForget"]
];
// Each switch is a real button, not a draggable control — one press
// flips it on or off immediately, and the sliding knob is purely a
// confirmation animation of that press, not something you need to drag.
abilityToggles.forEach(function (row) {
  var el = document.getElementById(row[0]);
  var block = document.getElementById(row[1]);
  el.addEventListener("click", function (e) {
    // A click on a button inside <summary> would otherwise also fire the
    // <details>'s native open/close toggle — stop that.
    e.preventDefault();
    e.stopPropagation();
    var next = el.getAttribute("aria-checked") !== "true";
    el.setAttribute("aria-checked", String(next));
    editState[row[2]] = next;
    block.setAttribute("data-on", String(next));
    if (next) block.open = true;
  });
  el.addEventListener("pointerdown", function (e) { e.stopPropagation(); });
});

// Belt-and-suspenders: a summary's native toggle can still fire from a
// stray tap; force it back open immediately if that ability is on.
Array.prototype.forEach.call(document.querySelectorAll(".abilityBlock"), function (block) {
  block.addEventListener("toggle", function () {
    if (!block.open && block.getAttribute("data-on") === "true") block.open = true;
  });
});

var projSliders = [
  ["projSize", "size", function (v) { return v; }],
  ["projSpeed", "speed", function (v) { return v; }],
  ["projDamage", "damage", function (v) { return v; }],
  ["projCooldown", "cooldown", function (v) { return v; }]
];
projSliders.forEach(function (row) {
  var el = document.getElementById(row[0]);
  var out = document.getElementById(row[0] + "Val");
  el.addEventListener("input", function () {
    var v = parseFloat(el.value);
    editState.proj[row[1]] = row[2](v);
    out.textContent = row[1] === "cooldown" ? v.toFixed(1) + "s" : v;
  });
});

var punchSliders = [
  ["punchDamage", "damage"],
  ["punchCooldown", "cooldown"],
  ["punchSpeed", "speed"],
  ["punchSize", "size"],
  ["punchKnockback", "knockback"],
  ["punchReach", "reach"]
];
punchSliders.forEach(function (row) {
  var el = document.getElementById(row[0]);
  var out = document.getElementById(row[0] + "Val");
  el.addEventListener("input", function () {
    var v = parseFloat(el.value);
    editState.punch[row[1]] = v;
    if (row[1] === "cooldown") out.textContent = v.toFixed(1) + "s";
    else if (row[1] === "speed") out.textContent = v.toFixed(2) + "s";
    else out.textContent = v;
  });
});

var kickSliders = [
  ["kickDamage", "damage"],
  ["kickCooldown", "cooldown"],
  ["kickSpeed", "speed"],
  ["kickSize", "size"],
  ["kickKnockback", "knockback"],
  ["kickReach", "reach"]
];
kickSliders.forEach(function (row) {
  var el = document.getElementById(row[0]);
  var out = document.getElementById(row[0] + "Val");
  el.addEventListener("input", function () {
    var v = parseFloat(el.value);
    editState.kick[row[1]] = v;
    if (row[1] === "cooldown") out.textContent = v.toFixed(1) + "s";
    else if (row[1] === "speed") out.textContent = v.toFixed(2) + "s";
    else out.textContent = v;
  });
});

var grappleSliders = [
  ["grappleDamage", "damage"],
  ["grappleCooldown", "cooldown"],
  ["grappleSpeed", "speed"],
  ["grappleReach", "reach"],
  ["grappleCounter", "counterChance"],
  ["grappleFinSlam", "finSlamDamage"],
  ["grappleFinPunches", "finPunches"],
  ["grappleFinPunchDmg", "finPunchDamage"]
];
grappleSliders.forEach(function (row) {
  var el = document.getElementById(row[0]);
  var out = document.getElementById(row[0] + "Val");
  el.addEventListener("input", function () {
    var v = parseFloat(el.value);
    editState.grapple[row[1]] = v;
    if (row[1] === "cooldown") out.textContent = v.toFixed(1) + "s";
    else if (row[1] === "speed") out.textContent = v.toFixed(2) + "s";
    else if (row[1] === "counterChance") out.textContent = v + "%";
    else out.textContent = v;
  });
});

var powerSliders = [
  ["powerDamageMin", "damageMin"],
  ["powerDamageMax", "damageMax"],
  ["powerInterval", "cooldown"],
  ["powerCharge", "chargeDur"],
  ["powerSpin", "spinDur"],
  ["powerKnockback", "knockback"],
  ["powerWallSlams", "wallSlams"],
  ["powerSlamDamage", "slamDamage"]
];
powerSliders.forEach(function (row) {
  var el = document.getElementById(row[0]);
  var out = document.getElementById(row[0] + "Val");
  el.addEventListener("input", function () {
    var v = parseFloat(el.value);
    editState.powerPunch[row[1]] = v;
    if (row[1] === "cooldown" || row[1] === "chargeDur" || row[1] === "spinDur") out.textContent = v.toFixed(1) + "s";
    else out.textContent = v;
  });
});

var rageSliders = [
  ["ragePunchDamage", "punchDamage"],
  ["ragePunchCount", "punchCount"],
  ["rageInterval", "cooldown"],
  ["rageCharge", "chargeDur"],
  ["rageSpeed", "speed"],
  ["rageReach", "reach"],
  ["rageVuln", "vulnMult"]
];
rageSliders.forEach(function (row) {
  var el = document.getElementById(row[0]);
  var out = document.getElementById(row[0] + "Val");
  el.addEventListener("input", function () {
    var v = parseFloat(el.value);
    editState.rage[row[1]] = v;
    if (row[1] === "cooldown" || row[1] === "chargeDur") out.textContent = v.toFixed(1) + "s";
    else if (row[1] === "vulnMult") out.textContent = v + "x";
    else out.textContent = v;
  });
});

var watcherSliders = [
  ["watcherLasers", "lasers"],
  ["watcherDelay", "preDelay"],
  ["watcherCharge", "chargeDur"],
  ["watcherDuration", "fireDur"],
  ["watcherTickDamage", "tickDamage"],
  ["watcherTickInterval", "tickInterval"],
  ["watcherRest", "restDur"],
  ["watcherSpeed", "approachSpeed"]
];
watcherSliders.forEach(function (row) {
  var el = document.getElementById(row[0]);
  var out = document.getElementById(row[0] + "Val");
  el.addEventListener("input", function () {
    var v = parseFloat(el.value);
    editState.watcher[row[1]] = v;
    if (row[1] === "preDelay" || row[1] === "chargeDur" || row[1] === "fireDur" || row[1] === "restDur") out.textContent = v.toFixed(1) + "s";
    else if (row[1] === "tickInterval") out.textContent = v.toFixed(2) + "s";
    else out.textContent = v;
  });
});

// [slider id, field, how to show the value]
var swingSliders = [
  ["swingDamage", "damage", function (v) { return v; }],
  ["swingWindup", "windup", function (v) { return Number(v).toFixed(2) + "s"; }],
  ["swingExtend", "extend", function (v) { return Number(v).toFixed(2) + "s"; }],
  ["swingReach", "reach", function (v) { return v; }],
  ["swingVicinity", "vicinity", function (v) { return v; }],
  ["swingAim", "aimError", function (v) { return v + "\u00B0"; }],
  ["swingBlockMult", "blockMult", function (v) { return v + "x"; }],
  ["swingWeaveMult", "weaveMult", function (v) { return v + "x"; }]
];
var forgetSliders = [
  ["forgetHeal", "heal", function (v) { return v; }],
  ["forgetEvery", "every", function (v) { return Number(v).toFixed(1) + "s"; }]
];
[["swing", swingSliders], ["forget", forgetSliders]].forEach(function (grp) {
  grp[1].forEach(function (row) {
    var el = document.getElementById(row[0]);
    var out = document.getElementById(row[0] + "Val");
    el.addEventListener("input", function () {
      var v = parseFloat(el.value);
      editState[grp[0]][row[1]] = v;
      out.textContent = row[2](v);
    });
  });
});

// [slider id, weave field, how to show the value]
var weaveSliders = [
  ["weaveDodge", "dodgeChance", function (v) { return v + "%"; }],
  ["weaveCrit", "critChance", function (v) { return v + "%"; }],
  ["weaveHits", "comboHits", function (v) { return v; }],
  ["weaveComboDamage", "comboDamage", function (v) { return v; }],
  ["weaveFinalDamage", "finalDamage", function (v) { return v; }],
  ["weaveKnockback", "finalKnockback", function (v) { return v; }],
  ["weaveTaunt", "tauntDur", function (v) { return Number(v).toFixed(1) + "s"; }],
  ["weaveTauntVuln", "tauntVuln", function (v) { return v + "x"; }]
];
weaveSliders.forEach(function (row) {
  var el = document.getElementById(row[0]);
  var out = document.getElementById(row[0] + "Val");
  el.addEventListener("input", function () {
    var v = parseFloat(el.value);
    editState.weave[row[1]] = v;
    out.textContent = row[2](v);
  });
});

document.getElementById("editorCancel").addEventListener("click", function () { showMenu(); });
document.getElementById("editorSave").addEventListener("click", function () {
  if (!editState.name.trim()) editState.name = "Fighter";
  var idx = customChars.findIndex(function (c) { return c.id === editState.id; });
  if (idx >= 0) customChars[idx] = editState; else customChars.push(editState);
  saveCustom(customChars);
  showMenu();
});
document.getElementById("editorDelete").addEventListener("click", function () {
  customChars = customChars.filter(function (c) { return c.id !== editingId; });
  saveCustom(customChars);
  showMenu();
});
