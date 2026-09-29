// Screen switching and the character select screen.
"use strict";

// ---------------------------------------------------------------
// Screen switching
// ---------------------------------------------------------------
var screens = {
  select: document.getElementById("screenSelect"),
  editor: document.getElementById("screenEditor"),
  game: document.getElementById("screenGame")
};
function showScreen(name) {
  Object.keys(screens).forEach(function (k) { screens[k].hidden = k !== name; });
  if (name === "select") renderSelect();
  if (name === "game") { resize(); }
}

// ---------------------------------------------------------------
// Select screen
// ---------------------------------------------------------------
var slotChar = [null, null];

function abilitySummary(ch) {
  var parts = [];
  if (ch.hasProjectile) parts.push("\uD83C\uDFAF " + ch.proj.damage + " dmg / " + ch.proj.cooldown.toFixed(1) + "s");
  if (ch.hasPunch) parts.push("\uD83D\uDC4A " + ch.punch.damage + " dmg");
  if (ch.hasKick) parts.push("\uD83E\uDDB5 " + ch.kick.damage + " dmg");
  if (ch.hasGrapple) parts.push("\uD83E\uDD3C " + ch.grapple.damage + " dmg");
  if (ch.hasPowerPunch) {
    var pp = ch.powerPunch;
    var ppText = "\uD83D\uDCA5 " + (pp.damageMin === pp.damageMax ? pp.damageMin : pp.damageMin + "-" + pp.damageMax) + " dmg";
    if (pp.wallSlams > 0) ppText += " + " + pp.wallSlams + "\u00D7" + pp.slamDamage + " wall";
    parts.push(ppText);
  }
  if (ch.hasRage) parts.push("\uD83D\uDE21 " + ch.rage.punchCount + "\u00D7" + ch.rage.punchDamage + " dmg");
  if (ch.hasWatcher) parts.push("\uD83D\uDC41\uFE0F " + ch.watcher.lasers + "\u00D7" + ch.watcher.tickDamage + "/" + ch.watcher.tickInterval + "s");
  if (ch.blockChance > 0) parts.push("\uD83D\uDEE1\uFE0F " + ch.blockChance + "% block");
  return parts.length ? parts.join(" \u00B7 ") : "No attacks yet";
}

function avatarStyle(ch) {
  var img = getImg(ch.imgData);
  if (img) return "background-image:url(" + ch.imgData + ");background-color:" + ch.color + ";";
  return "background-color:" + ch.color + ";";
}

function renderSlot(side) {
  var el = document.getElementById("slot" + side);
  var ch = slotChar[side];
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

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
  });
}

function assignSlot(ch) {
  if (slotChar[0] && slotChar[0].id === ch.id) { slotChar[0] = null; renderSlot(0); updateFightBtn(); return; }
  if (slotChar[1] && slotChar[1].id === ch.id) { slotChar[1] = null; renderSlot(1); updateFightBtn(); return; }
  var side = !slotChar[0] ? 0 : (!slotChar[1] ? 1 : 0);
  slotChar[side] = ch;
  renderSlot(side);
  updateFightBtn();
}

function updateFightBtn() {
  document.getElementById("fightBtn").disabled = !(slotChar[0] && slotChar[1]);
}

function renderSelect() {
  // keep slot selections valid if a character was deleted
  slotChar = slotChar.map(function (ch) { return ch && findChar(ch.id) ? findChar(ch.id) : null; });
  renderSlot(0); renderSlot(1); updateFightBtn();

  var roster = document.getElementById("roster");
  roster.innerHTML = "";
  allChars().forEach(function (ch) {
    var card = document.createElement("div");
    card.className = "rcard";
    var inSlot = (slotChar[0] && slotChar[0].id === ch.id) || (slotChar[1] && slotChar[1].id === ch.id);
    card.innerHTML =
      '<div class="top"><div class="avatar" style="' + avatarStyle(ch) + '"></div>' +
      '<div class="rname">' + escapeHtml(ch.name) + "</div></div>" +
      '<div class="rabilities">' + escapeHtml(abilitySummary(ch)) + "</div>" +
      '<div class="rbtns"></div>';
    var btns = card.querySelector(".rbtns");

    var pick = document.createElement("button");
    pick.className = "small";
    pick.textContent = inSlot ? "Remove" : "Select";
    pick.addEventListener("click", function () { assignSlot(ch); });
    btns.appendChild(pick);

    if (!ch.builtin) {
      var editBtn = document.createElement("button");
      editBtn.className = "small secondary";
      editBtn.textContent = "Edit";
      editBtn.addEventListener("click", function () { openEditor(ch.id); });
      btns.appendChild(editBtn);
    }

    roster.appendChild(card);
  });
}

document.getElementById("newCharBtn").addEventListener("click", function () { openEditor(null); });
document.getElementById("fightBtn").addEventListener("click", function () {
  if (!slotChar[0] || !slotChar[1]) return;
  // A real click, so this is a safe place to unlock audio playback.
  var ctx = getAudioCtx();
  if (ctx && ctx.state === "suspended") ctx.resume();
  startMatchWith(slotChar[0], slotChar[1]);
});
