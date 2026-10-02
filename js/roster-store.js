// Where created characters are saved.
//
// Every roster fighter is kept in three places, so a fighter that's been
// built is never lost:
//   1. This browser's storage (instant, works everywhere, including GitHub Pages).
//   2. The Ball Brawl artifact's database on claude.ai, when the game is
//      opened there. That copy survives cleared browser data, other devices
//      and new versions of the game, and Claude can read it to build on
//      your fighters.
//   3. js/roster-data.js in the repo: fighters Claude has copied out of the
//      database, so the GitHub Pages version has them too.
// Fighters found in one place but not another are copied across on load.
"use strict";

var rosterDb = null;               // the artifact database, once connected
var rosterStatus = "local";        // "local" | "syncing" | "cloud" | "error"
var DELETED_KEY = "ballbrawl_deleted_v1";

function loadDeletedIds() {
  try { return JSON.parse(localStorage.getItem(DELETED_KEY) || "[]"); } catch (e) { return []; }
}
function rememberDeleted(id) {
  var ids = loadDeletedIds();
  if (ids.indexOf(id) < 0) ids.push(id);
  try { localStorage.setItem(DELETED_KEY, JSON.stringify(ids)); } catch (e) {}
}

// Fighters committed to the repo come in on top of this browser's roster.
function mergeSavedRoster() {
  if (typeof SAVED_ROSTER === "undefined" || !SAVED_ROSTER.length) return;
  var deleted = loadDeletedIds(), changed = false;
  SAVED_ROSTER.forEach(function (ch) {
    if (deleted.indexOf(ch.id) >= 0) return;
    if (customChars.some(function (c) { return c.id === ch.id; })) return;
    customChars.push(normalizeChar(JSON.parse(JSON.stringify(ch))));
    changed = true;
  });
  if (changed) saveLocal(customChars);
}

function saveLocal(list) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); return true; } catch (e) { return false; }
}

// Database layout: roster/<id> holds the fighter (without pictures),
// rosterImg/<id>-ball and rosterImg/<id>-proj hold its pictures (kept
// apart so a big picture can't push a fighter over the size limit), and
// rosterDeleted/<id> remembers deletions.
function statsOnly(ch) {
  var c = JSON.parse(JSON.stringify(ch));
  c.imgData = null;
  if (c.proj) c.proj.imgData = null;
  c.savedAt = Date.now();
  return c;
}

function pushChar(ch) {
  if (!rosterDb) return Promise.resolve();
  var db = rosterDb;
  return db.doc("roster/" + ch.id).set(statsOnly(ch))
    .then(function () { return db.doc("rosterImg/" + ch.id + "-ball").set({ data: ch.imgData || "" }); })
    .then(function () { return db.doc("rosterImg/" + ch.id + "-proj").set({ data: (ch.proj && ch.proj.imgData) || "" }); })
    .then(function () { return db.doc("rosterDeleted/" + ch.id).delete(); });
}

function dropChar(id) {
  if (!rosterDb) return Promise.resolve();
  var db = rosterDb;
  return db.doc("roster/" + id).delete()
    .then(function () { return db.doc("rosterImg/" + id + "-ball").delete(); })
    .then(function () { return db.doc("rosterImg/" + id + "-proj").delete(); })
    .then(function () { return db.doc("rosterDeleted/" + id).set({ at: Date.now() }); });
}

// Saving one fighter from the editor.
function saveFighter(ch) {
  var idx = customChars.findIndex(function (c) { return c.id === ch.id; });
  if (idx >= 0) customChars[idx] = ch; else customChars.push(ch);
  var ok = saveLocal(customChars);
  if (!rosterDb) {
    setRosterStatus(ok ? "local" : "error", ok ? null : "Couldn't save in this browser. Use Export to keep a copy.");
    return;
  }
  setRosterStatus("syncing");
  pushChar(ch).then(function () { setRosterStatus("cloud"); }, function (e) {
    setRosterStatus("error", "Couldn't save " + ch.name + " to your cloud roster (" + (e && e.code || "error") + "). It's still saved in this browser.");
  });
}

function deleteFighter(id) {
  customChars = customChars.filter(function (c) { return c.id !== id; });
  saveLocal(customChars);
  rememberDeleted(id);
  if (rosterDb) dropChar(id).then(function () { setRosterStatus("cloud"); }, function () {
    setRosterStatus("error", "Couldn't remove that fighter from your cloud roster.");
  });
}

// Shown under the Roster heading so it's always clear where fighters live.
function setRosterStatus(state, message) {
  rosterStatus = state;
  var el = document.getElementById("rosterSave");
  if (!el) return;
  var text = {
    local: "Saved in this browser. Tap Export to keep a backup or send it to Claude.",
    syncing: "Saving to your cloud roster…",
    cloud: "Saved to your cloud roster on claude.ai.",
    error: "Not saved."
  }[state];
  el.textContent = message || text;
  el.className = "saveStatus " + state;
}

// Connects to the artifact database (only when the game is opened as the
// claude.ai artifact) and brings both copies of the roster together.
function initRosterStore() {
  mergeSavedRoster();
  setRosterStatus("local");
  if (!window.claude || typeof window.claude.use !== "function") return;
  window.claude.use("db").then(function (db) {
    if (!db) return;
    rosterDb = db;
    setRosterStatus("syncing");
    return Promise.all([db.collection("roster").get(), db.collection("rosterImg").get(), db.collection("rosterDeleted").get()])
      .then(function (res) {
        var imgs = {};
        res[1].docs.forEach(function (d) { var v = d.data(); imgs[d.id] = v && v.data ? v.data : null; });
        var gone = {};
        res[2].docs.forEach(function (d) { gone[d.id] = true; rememberDeleted(d.id); });
        var byId = {};
        res[0].docs.forEach(function (d) {
          var ch = JSON.parse(JSON.stringify(d.data()));
          ch.imgData = imgs[d.id + "-ball"] || null;
          if (ch.proj) ch.proj.imgData = imgs[d.id + "-proj"] || null;
          byId[d.id] = normalizeChar(ch);
        });
        // Fighters only this browser has (built before the cloud roster
        // existed, or saved while offline) are uploaded now.
        var toUpload = [];
        customChars.forEach(function (ch) {
          if (byId[ch.id] || gone[ch.id]) return;
          byId[ch.id] = ch;
          toUpload.push(ch);
        });
        var list = Object.keys(byId).map(function (k) { return byId[k]; });
        list.sort(function (a, b) { return String(a.id).localeCompare(String(b.id), undefined, { numeric: true }); });
        customChars = list;
        saveLocal(customChars);
        if (!screens.select.hidden) renderMenu("select");
        if (!screens.dev.hidden) renderMenu("dev");
        return toUpload.reduce(function (p, ch) { return p.then(function () { return pushChar(ch); }); }, Promise.resolve());
      })
      .then(function () { setRosterStatus("cloud"); }, function (e) {
        setRosterStatus("error", "Couldn't reach your cloud roster (" + (e && e.code || "error") + "). Fighters are still saved in this browser.");
      });
  });
}

// Backup: the whole roster as a file, and the same text on the clipboard.
function exportRoster() {
  var text = JSON.stringify({ ballBrawlRoster: 1, fighters: customChars }, null, 1);
  try {
    var a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([text], { type: "application/json" }));
    a.download = "ball-brawl-roster.json";
    document.body.appendChild(a); a.click(); a.remove();
  } catch (e) {}
  if (navigator.clipboard) navigator.clipboard.writeText(text).catch(function () {});
  setRosterStatus(rosterStatus, "Exported " + customChars.length + " fighter" + (customChars.length === 1 ? "" : "s") + " (downloaded and copied).");
}

function importRoster(file) {
  var reader = new FileReader();
  reader.onload = function () {
    try {
      var data = JSON.parse(reader.result);
      var list = Array.isArray(data) ? data : data.fighters;
      var n = 0;
      list.forEach(function (ch) {
        if (!ch || !ch.id || ch.builtin) return;
        saveFighter(normalizeChar(ch)); n++;
      });
      renderMenu(menuScreen);
      setRosterStatus(rosterStatus, "Imported " + n + " fighter" + (n === 1 ? "" : "s") + ".");
    } catch (e) {
      setRosterStatus("error", "That file isn't a Ball Brawl roster.");
    }
  };
  reader.readAsText(file);
}
