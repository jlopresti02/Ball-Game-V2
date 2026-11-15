// More health than a normal fighter (Christian, 2026-11-15: Josh Hokit
// should "just have a lot, a lot of health").
//
// Every fighter starts on MAX_HP (500, config.js). Put `"maxHp": 800` in a
// character file and that fighter starts on 800 instead. Leave it out (or
// at 500 or less) and nothing changes.
//
// The health bars keep one scale for everyone, so a 50 damage punch takes
// the same bite out of anyone's bar. The first MAX_HP fills the bar as
// normal; the health above it is a second, paler layer drawn over the bar
// from the same end (up to one more full bar), and it goes first. The
// number by the bar is the real total. All three bars do it: the HUD bar,
// the small bar over the ball and the stadium jumbotron's.
//
// Anything that asks "how hurt is he" (tap odds, knockout odds, low health
// lines) still measures against MAX_HP, so while the extra layer is still
// there he counts as not hurt at all.
"use strict";

// From makeBall (match.js).
function initMaxHp(b) {
  var m = +b.char.maxHp;
  if (!(m > MAX_HP)) return;
  b.maxHp = m; b.hp = m; b.shown = m;
}

// How much of the extra layer is left: 0 to 1 of a full bar.
function extraHpFrac(b) {
  return b && b.maxHp > MAX_HP ? Math.max(0, Math.min(1, (b.hp - MAX_HP) / MAX_HP)) : 0;
}

// The extra layer's color: the fighter's own color, much paler.
function extraHpColor(hex) {
  var c = String(hex || "#888888").replace("#", "");
  if (c.length === 3) c = c[0] + c[0] + c[1] + c[1] + c[2] + c[2];
  var n = parseInt(c, 16), k = 0.42;
  if (isNaN(n)) return "#f2d0d0";
  var r = (n >> 16) & 255, g = (n >> 8) & 255, bl = n & 255;
  return "rgb(" + Math.round(r + (255 - r) * k) + "," + Math.round(g + (255 - g) * k) + "," + Math.round(bl + (255 - bl) * k) + ")";
}

// From updateHud (update.js): the extra layer on the HUD bar. The div is
// made the first time a fighter with extra health needs it.
function maxHpHud(i, b) {
  var ex = document.getElementById("extra" + i), bar = document.getElementById("bar" + i);
  if (!(b.maxHp > MAX_HP)) {
    if (ex) { ex.style.width = "0%"; bar.setAttribute("aria-valuemax", MAX_HP); } // (a fighter with extra health had this side last fight)
    return;
  }
  if (!bar) return;
  if (!ex) {
    ex = document.createElement("div");
    ex.id = "extra" + i;
    ex.style.cssText = "position:absolute;top:0;bottom:0;" + (i ? "right:0;" : "left:0;") +
      "width:0;box-shadow:inset " + (i ? "2px" : "-2px") + " 0 0 #ffffff;";
    bar.appendChild(ex);
  }
  ex.style.background = extraHpColor(b.char.color);
  ex.style.width = extraHpFrac(b) * 100 + "%";
  bar.setAttribute("aria-valuemax", b.maxHp);
}

// From draw.js (the small bar over the ball) and stadium.js (the
// jumbotron's): the extra layer over a canvas health bar. `right` fills it
// from the right-hand end, like the jumbotron's right-side bar.
function drawExtraHp(b, x, y, w, h, right) {
  var f = extraHpFrac(b);
  if (f <= 0) return;
  var ew = w * f, ex = right ? x + w - ew : x;
  ctx.save();
  ctx.fillStyle = extraHpColor(b.char.color);
  ctx.fillRect(ex, y, ew, h);
  ctx.fillStyle = "#ffffff"; // a bright edge where the extra health ends
  ctx.fillRect(right ? ex : ex + ew - 2, y, 2, h);
  ctx.restore();
}

// The fighter card's move list (gallery.js).
function maxHpGalleryMoves(ch, add) {
  if (!(+ch.maxHp > MAX_HP)) return;
  add("❤️", "A lot of health", "Starts on " + ch.maxHp + " health, not " + MAX_HP + ". The extra " + (ch.maxHp - MAX_HP) +
    " is the pale layer over his health bar, and it goes first.");
}
