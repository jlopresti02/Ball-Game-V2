// Saved fights: the post-fight menu can save the fight that just ended (its
// seed, both fighters as they were, and the arena), replay it, and the
// Saved fights list (main screen or the post-fight menu) brings any saved
// fight back to watch again. Seeds: seed.js.
"use strict";

var SAVED_KEY = "ballbrawl_fights_v1";
var SAVED_MAX = 100;

function loadSavedFights() {
  try { var v = JSON.parse(localStorage.getItem(SAVED_KEY) || "[]"); return Array.isArray(v) ? v : []; } catch (e) { return []; }
}
function storeSavedFights(list) {
  try { localStorage.setItem(SAVED_KEY, JSON.stringify(list.slice(0, SAVED_MAX))); return true; } catch (e) { return false; }
}

// A copy of the fighter exactly as it fought, so later tweaks to the roster
// don't change how a saved fight plays out (too big a copy keeps just the id).
function fighterSnapshot(ch) {
  try { var s = JSON.stringify(ch); return s.length < 150000 ? JSON.parse(s) : null; } catch (e) { return null; }
}
function fighterFor(rec, side) {
  var snap = rec[side], id = rec[side + "Id"];
  if (snap) return JSON.parse(JSON.stringify(snap));
  return id ? findChar(id) : null;
}

function saveCurrentFight() {
  var f = currentFight;
  if (!f || f.saved) return null;
  var rec = {
    when: new Date().toISOString(), seed: f.seed, code: seedCode(f.seed), arena: f.arena,
    aId: f.a.id, bId: f.b.id, aName: f.a.name, bName: f.b.name, aColor: f.a.color, bColor: f.b.color,
    result: bannerText.hidden ? "" : bannerText.textContent,
    a: fighterSnapshot(f.a), b: fighterSnapshot(f.b)
  };
  var list = loadSavedFights();
  list.unshift(rec);
  if (!storeSavedFights(list)) { rec.a = rec.b = null; list[0] = rec; if (!storeSavedFights(list)) return null; }
  f.saved = true;
  return rec;
}

// Back into that fight, from the start, waiting on Start match.
function replayFight(rec) {
  var a = fighterFor(rec, "a"), b = fighterFor(rec, "b");
  if (!a || !b) { alert("One of the fighters in that fight isn't on this phone anymore."); return; }
  if (rec.arena && rec.arena !== (stadiumOn() ? "stadium" : "test")) setArenaMode(rec.arena);
  closeSavedFights();
  startMatchWith(a, b, rec.seed);
}

// --------------------------------------------------------- post-fight menu
function updatePostSeed() {
  var f = currentFight, el = document.getElementById("postSeed"), btn = document.getElementById("menuSave");
  if (!f) return;
  el.textContent = "Fight #" + seedCode(f.seed);
  btn.textContent = f.saved ? "Saved ✓" : "Save fight";
  btn.disabled = !!f.saved;
}
function onFightStarted() { updatePostSeed(); }

document.getElementById("menuSave").addEventListener("click", function () {
  if (saveCurrentFight()) updatePostSeed();
  else alert("Couldn't save. The phone's storage for the game may be full.");
});
document.getElementById("menuReplay").addEventListener("click", function () {
  var f = currentFight;
  if (f) startMatchWith(f.a, f.b, f.seed);
});

// ------------------------------------------------------- saved fights list
var savedPanel = document.getElementById("savedPanel");
function openSavedFights() { renderSavedFights(); savedPanel.hidden = false; }
function closeSavedFights() { savedPanel.hidden = true; }

function renderSavedFights() {
  var list = loadSavedFights(), box = document.getElementById("savedList");
  box.innerHTML = "";
  if (!list.length) {
    var empty = document.createElement("p");
    empty.className = "savedEmpty";
    empty.textContent = "No saved fights yet. After a fight, tap the result and pick Save fight.";
    box.appendChild(empty);
    return;
  }
  list.forEach(function (rec, i) {
    var row = document.createElement("div"); row.className = "savedRow";
    var info = document.createElement("div"); info.className = "savedInfo";
    var names = document.createElement("div"); names.className = "savedNames";
    var a = document.createElement("span"); a.textContent = rec.aName; a.style.color = rec.aColor || "";
    var vs = document.createElement("span"); vs.textContent = " vs "; vs.className = "savedVs";
    var b = document.createElement("span"); b.textContent = rec.bName; b.style.color = rec.bColor || "";
    names.appendChild(a); names.appendChild(vs); names.appendChild(b);
    var meta = document.createElement("div"); meta.className = "savedMeta";
    var d = new Date(rec.when);
    meta.textContent = [rec.result, (rec.arena === "stadium" ? "WWIT stadium" : "Test arena"),
      isNaN(d) ? "" : d.toLocaleDateString(undefined, { month: "short", day: "numeric" }) + " " + d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" }),
      "#" + rec.code].filter(Boolean).join(" · ");
    info.appendChild(names); info.appendChild(meta);
    var play = document.createElement("button"); play.type = "button"; play.textContent = "Replay";
    play.addEventListener("click", function () { replayFight(rec); });
    var del = document.createElement("button"); del.type = "button"; del.className = "secondary"; del.textContent = "Delete";
    del.addEventListener("click", function () {
      if (!confirm("Delete this saved fight?")) return;
      var l = loadSavedFights(); l.splice(i, 1); storeSavedFights(l); renderSavedFights();
    });
    var btns = document.createElement("div"); btns.className = "savedBtns";
    btns.appendChild(play); btns.appendChild(del);
    row.appendChild(info); row.appendChild(btns);
    box.appendChild(row);
  });
}

document.getElementById("savedBtn").addEventListener("click", openSavedFights);
document.getElementById("menuSaved").addEventListener("click", openSavedFights);
document.getElementById("savedClose").addEventListener("click", closeSavedFights);
savedPanel.addEventListener("click", function (e) { if (e.target === savedPanel) closeSavedFights(); });
