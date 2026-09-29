// Screen switching, the main select screen (your roster) and The Dev Corner
// (the character bases).
"use strict";

// ---------------------------------------------------------------
// Screen switching
// ---------------------------------------------------------------
var screens = {
  select: document.getElementById("screenSelect"),
  dev: document.getElementById("screenDev"),
  editor: document.getElementById("screenEditor"),
  game: document.getElementById("screenGame")
};
// The menu you were last on ("select" or "dev"), so the editor and the
// game's "Change fighters" button take you back to the right place.
var menuScreen = "select";

function showScreen(name) {
  stopAllChargeSounds(); // leaving mid-charge shouldn't leave a hum playing
  if (name === "select" || name === "dev") menuScreen = name;
  Object.keys(screens).forEach(function (k) { screens[k].hidden = k !== name; });
  if (name === "select" || name === "dev") renderMenu(name);
  if (name === "game") { resize(); }
  window.scrollTo(0, 0);
}
function showMenu() { showScreen(menuScreen); }

// ---------------------------------------------------------------
// Menus: each keeps its own pair of chosen fighters
// ---------------------------------------------------------------
var menus = {
  select: {
    picks: [null, null],
    slotIds: ["slot0", "slot1"],
    fightId: "fightBtn",
    // Your roster: only the fighters you've built.
    lists: [{ id: "roster", emptyId: "rosterEmpty", chars: function () { return customChars; } }]
  },
  dev: {
    picks: [null, null],
    slotIds: ["devSlot0", "devSlot1"],
    fightId: "devFightBtn",
    lists: [
      { id: "basesList", chars: function () { return builtins; } },
      { id: "devRoster", emptyId: "devRosterEmpty", chars: function () { return customChars; } }
    ]
  }
};

function abilitySummary(ch) {
  var parts = [];
  if (ch.hasProjectile) parts.push("🎯 " + ch.proj.damage + " dmg / " + ch.proj.cooldown.toFixed(1) + "s");
  if (ch.hasPunch) parts.push("👊 " + ch.punch.damage + " dmg");
  if (ch.hasKick) parts.push("🦵 " + ch.kick.damage + " dmg");
  if (ch.hasGrapple) parts.push("🤼 " + ch.grapple.damage + " dmg");
  if (ch.hasPowerPunch) {
    var pp = ch.powerPunch;
    var ppText = "💥 " + (pp.damageMin === pp.damageMax ? pp.damageMin : pp.damageMin + "-" + pp.damageMax) + " dmg";
    if (pp.wallSlams > 0) ppText += " + " + pp.wallSlams + "×" + pp.slamDamage + " wall";
    parts.push(ppText);
  }
  if (ch.hasRage) parts.push("😡 " + ch.rage.punchCount + "×" + ch.rage.punchDamage + " dmg");
  if (ch.hasWatcher) parts.push("👁️ " + ch.watcher.lasers + "×" + ch.watcher.tickDamage + "/" + ch.watcher.tickInterval + "s");
  if (ch.hasWeave) parts.push("\uD83C\uDF00 " + ch.weave.dodgeChance + "% weave \u00B7 " + ch.weave.critChance + "% crit");
  if (ch.hasSwing) parts.push("\uD83E\uDD74 " + ch.swing.damage + " dmg swing");
  if (ch.hasForget) parts.push("\uD83E\uDDE0 +" + ch.forget.heal + " / " + ch.forget.every + "s");
  if (ch.blockChance > 0) parts.push("🛡️ " + ch.blockChance + "% block");
  return parts.length ? parts.join(" · ") : "No attacks yet";
}

function avatarStyle(ch) {
  var img = getImg(ch.imgData);
  if (img) return "background-image:url(" + ch.imgData + ");background-color:" + ch.color + ";";
  return "background-color:" + ch.color + ";";
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
  });
}

function renderSlot(menu, side) {
  var el = document.getElementById(menu.slotIds[side]);
  var ch = menu.picks[side];
  if (!ch) {
    el.className = "slot empty";
    el.innerHTML = '<div class="sname">Choose fighter</div>';
    return;
  }
  el.className = "slot";
  el.innerHTML =
    '<div class="avatar" style="' + avatarStyle(ch) + '"></div>' +
    '<div class="sname">' + escapeHtml(ch.name) + "</div>" +
    '<div class="sabilities">' + escapeHtml(abilitySummary(ch)) + "</div>";
}

function isPicked(menu, ch) {
  return (menu.picks[0] && menu.picks[0].id === ch.id) || (menu.picks[1] && menu.picks[1].id === ch.id);
}

function togglePick(name, ch) {
  var menu = menus[name];
  if (menu.picks[0] && menu.picks[0].id === ch.id) menu.picks[0] = null;
  else if (menu.picks[1] && menu.picks[1].id === ch.id) menu.picks[1] = null;
  else menu.picks[!menu.picks[0] ? 0 : (!menu.picks[1] ? 1 : 0)] = ch;
  renderMenu(name);
}

function renderCard(name, ch) {
  var menu = menus[name];
  var card = document.createElement("div");
  card.className = "rcard";
  card.innerHTML =
    '<div class="top"><div class="avatar" style="' + avatarStyle(ch) + '"></div>' +
    '<div class="rname">' + escapeHtml(ch.name) + "</div></div>" +
    '<div class="rabilities">' + escapeHtml(abilitySummary(ch)) + "</div>" +
    '<div class="rbtns"></div>';
  var btns = card.querySelector(".rbtns");

  var pick = document.createElement("button");
  pick.className = "small";
  pick.textContent = isPicked(menu, ch) ? "Remove" : "Select";
  pick.addEventListener("click", function () { togglePick(name, ch); });
  btns.appendChild(pick);

  if (!ch.builtin) {
    var editBtn = document.createElement("button");
    editBtn.className = "small secondary";
    editBtn.textContent = "Edit";
    editBtn.addEventListener("click", function () { openEditor(ch.id); });
    btns.appendChild(editBtn);
  }
  return card;
}

function renderMenu(name) {
  var menu = menus[name];
  // Drop picks for fighters that were deleted, and pick up any edits.
  menu.picks = menu.picks.map(function (ch) { return ch ? findChar(ch.id) : null; });
  renderSlot(menu, 0); renderSlot(menu, 1);
  document.getElementById(menu.fightId).disabled = !(menu.picks[0] && menu.picks[1]);

  menu.lists.forEach(function (list) {
    var el = document.getElementById(list.id);
    var chars = list.chars();
    el.innerHTML = "";
    chars.forEach(function (ch) { el.appendChild(renderCard(name, ch)); });
    el.hidden = chars.length === 0;
    if (list.emptyId) document.getElementById(list.emptyId).hidden = chars.length > 0;
  });
}

function fightFrom(name) {
  var picks = menus[name].picks;
  if (!picks[0] || !picks[1]) return;
  // A real click, so this is a safe place to unlock audio playback.
  var ctx = getAudioCtx();
  if (ctx && ctx.state === "suspended") ctx.resume();
  startMatchWith(picks[0], picks[1]);
}

document.getElementById("newCharBtn").addEventListener("click", function () { openEditor(null); });
document.getElementById("fightBtn").addEventListener("click", function () { fightFrom("select"); });
document.getElementById("devFightBtn").addEventListener("click", function () { fightFrom("dev"); });
document.getElementById("devCornerBtn").addEventListener("click", function () { showScreen("dev"); });
document.getElementById("devBackBtn").addEventListener("click", function () { showScreen("select"); });
