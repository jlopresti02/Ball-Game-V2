// The WWIT stadium arena: a 9:16 frame for reels with the fight cage in the
// middle, stands of cheering fans (drawn like the fighters) around it, and a
// jumbotron showing both fighters' health, special meters and fight stats.
// The fight itself is unchanged: the arena floor is still W x H, just drawn
// smaller inside the stadium. Toggle with the Arena button on the game
// screen; the choice is remembered per device.
"use strict";

var ARENA_KEY = "ballbrawl_arena_v1";
var arenaMode = "test"; // "test" | "stadium"
try { if (localStorage.getItem(ARENA_KEY) === "stadium") arenaMode = "stadium"; } catch (e) {}

function stadiumOn() { return arenaMode === "stadium"; }

// The stadium is laid out on a 1080 x 1920 stage. Reels and TikTok cover
// roughly the top 220 and bottom 420 of that (plus the like/comment buttons
// down the lower right), so the cage and jumbotron stay inside those lines.
var STAGE_W = 1080, STAGE_H = 1920;
var ST = { A: 760, CAGE: 26, APRON: 44, SAPRON: 14 };
ST.AX = (STAGE_W - ST.A) / 2;
ST.AY = (STAGE_H - ST.A) / 2;
ST.IN = { x0: ST.AX - ST.CAGE - ST.SAPRON, y0: ST.AY - ST.CAGE - ST.APRON, x1: ST.AX + ST.A + ST.CAGE + ST.SAPRON, y1: ST.AY + ST.A + ST.CAGE + ST.APRON };
ST.JT = { x: 30, y: 224, w: STAGE_W - 60, h: 278 };

var WWIT = { name: "WWIT", sub: "MMA", motto: "WHAT WOULD IT TAKE", dark: "#1b1718", maroon: "#5a0f18", gold: "#e3cd9a", mat: "#f3ede0" };
var STAGE_INK = "#16211f";
var wwitBadge = new Image();
wwitBadge.src = WWIT_BADGE_SRC;

function setArenaMode(mode) {
  arenaMode = mode;
  try { localStorage.setItem(ARENA_KEY, mode); } catch (e) {}
  applyArenaLayout();
}

// Stadium mode swaps the square canvas for a 9:16 one and lets the jumbotron
// stand in for the health bars above the arena.
function applyArenaLayout() {
  var on = stadiumOn();
  document.getElementById("screenGame").classList.toggle("stadium", on);
  Array.prototype.forEach.call(document.querySelectorAll(".arenaBtn"), function (btn) {
    btn.textContent = on ? "Arena: WWIT stadium" : "Arena: test";
  });
  stadiumCache.key = null;
  resize();
}

// ---------------------------------------------------------------- crowd

var stadiumSeed = 7;
function stadiumRand() { stadiumSeed = (stadiumSeed * 16807) % 2147483647; return stadiumSeed / 2147483647; }
function pickFrom(list) { return list[(stadiumRand() * list.length) | 0]; }

var FAN_SKIN = ["#f1c9a5", "#e0ac84", "#c48f68", "#a8714f", "#8a5636", "#5f3a24"];
var FAN_HAIR_COLORS = ["#1b1410", "#3a2618", "#6b4a2b", "#c9a24f", "#2a2a2a", "#8c3b1f"];
var FAN_HAIRS = ["short", "short", "buzz", "buzz", "bald", "long", "dreads", "mohawk"];
var FAN_BEARDS = ["none", "none", "none", "stubble", "full"];
var FAN_NEUTRAL = ["#222222", "#f2f2f2", "#3b3b3b", "#5a0f18", "#5a0f18", "#2e7d32", "#f9a825", "#455a64"];
var FAN_SIGNS = [["WWIT MMA", "#5a0f18", "#e3cd9a"], ["KO!!", "#ffffff", "#c62828"], ["SMASH HIM", "#e53935", "#ffffff"],
  ["WHAT WOULD IT TAKE?", "#e3cd9a", "#5a0f18"], ["GOAT", "#1e46a8", "#ffffff"]];

var stadiumFans = [];
var ROWS_TB = 0;
(function buildCrowd() {
  var ROW = 124, SEAT = 116, SIZE = 108, IN = ST.IN;
  function addFan(x, y, size, side, row) {
    var r = stadiumRand(), shirt, team = null;
    if (r < 0.36) { shirt = pickFrom(["#c62828", "#e53935", "#b71c1c"]); team = "red"; }
    else if (r < 0.72) { shirt = pickFrom(["#1e46a8", "#1565c0", "#283593"]); team = "blue"; }
    else shirt = pickFrom(FAN_NEUTRAL);
    var look = defaultLook();
    look.skin = pickFrom(FAN_SKIN);
    look.hair = pickFrom(FAN_HAIRS);
    look.hairColor = pickFrom(FAN_HAIR_COLORS);
    look.beard = pickFrom(FAN_BEARDS);
    look.build = pickFrom(["muscular", "lean", "stocky"]);
    look.ears = stadiumRand() < 0.08 ? "cauliflower" : "normal";
    var shirtless = stadiumRand() < 0.06;
    if (shirtless) { look.shorts = team === "blue" ? "#1e46a8" : "#c62828"; look.trim = "#f2f2f2"; look.shortsStyle = "stripe"; }
    var fan = {
      x: x + (stadiumRand() - 0.5) * size * 0.2, y: y + (stadiumRand() - 0.5) * size * 0.12,
      r: size * 0.5 * (0.9 + stadiumRand() * 0.16),
      look: look, shirt: shirt, team: team, shirtless: shirtless,
      style: stadiumRand() < 0.2 ? "hoodie" : stadiumRand() < 0.25 ? "jersey" : "tee",
      side: side, row: row, phase: stadiumRand() * Math.PI * 2, rate: 4 + stadiumRand() * 5,
      hype: stadiumRand(), phone: stadiumRand() < 0.07,
      cap: stadiumRand() < 0.14 ? pickFrom(FAN_NEUTRAL) : null, sign: null
    };
    // Fans that would sit behind the jumbotron aren't drawn.
    if (fan.y > ST.JT.y - fan.r * 0.1 && fan.y + fan.r * 0.2 < ST.JT.y + ST.JT.h + 6) return;
    stadiumFans.push(fan);
  }
  ROWS_TB = Math.floor((IN.y0 - 6) / ROW);
  for (var r = 0; r < ROWS_TB; r++) {
    var yTop = IN.y0 - ROW * (r + 0.6), yBot = IN.y1 + ROW * (r + 0.6);
    for (var x = SEAT / 2 + 2 + (r % 2) * 18; x < STAGE_W - SEAT / 2 + 20; x += SEAT) {
      addFan(x, yTop, SIZE, "top", r);
      addFan(x, yBot, SIZE, "bottom", r);
    }
  }
  // One column of fans fits beside the cage on each side.
  for (var y = IN.y0 + 60; y < IN.y1 - 40; y += SEAT) {
    addFan(IN.x0 / 2, y, IN.x0 - 8, "left", 0);
    addFan(STAGE_W - IN.x0 / 2, y, IN.x0 - 8, "right", 0);
  }
  [[180, "top", 2], [820, "top", 1], [520, "top", 3], [300, "bottom", 1], [760, "bottom", 3], [960, "bottom", 2]].forEach(function (p, i) {
    var best = null, bd = 1e9;
    stadiumFans.forEach(function (f) { if (f.side === p[1] && f.row === p[2]) { var d = Math.abs(f.x - p[0]); if (d < bd) { bd = d; best = f; } } });
    if (best) { best.sign = FAN_SIGNS[i % FAN_SIGNS.length]; best.phone = false; }
  });
  // Lower fans overlap the ones above them.
  stadiumFans.sort(function (a, b) { return a.y - b.y; });
})();

// ---------------------------------------------------------------- Brazil theme

// Charles Oliveira's special (Do Bronx, dobronx.js) turns the stadium into a
// Brazil-themed arena for a while: the same fans in Brazil shirts, waving
// flags and signs and going crazy, a green walkway and a Brazil mat.
var BR = { green: "#009c3b", yellow: "#ffdf00", blue: "#002776", white: "#ffffff" };
var BR_SIGNS = [["DO BRONX!", BR.yellow, BR.blue], ["CHARLES!", BR.green, BR.yellow], ["BRASIL!", BR.blue, BR.yellow],
  ["OLIVEIRA", BR.yellow, BR.green], ["VAI CHARLES", BR.white, BR.green], ["DO BRONX!", BR.green, BR.white]];

function brazilOn() { return typeof brazilMode !== "undefined" && brazilMode; }

// Each fan's Brazil version: same face and seat, new shirt, maybe a flag or
// a sign. A separate random stream keeps the regular crowd as it was.
function buildBrazilCrowd() {
  var seed = 31;
  function rand() { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }
  var signs = 0;
  stadiumFans.forEach(function (f) {
    var r = rand(), br = Object.create(f);
    br.shirt = r < 0.55 ? BR.yellow : r < 0.85 ? BR.green : BR.blue;
    br.style = rand() < 0.4 ? "jersey" : "tee";
    br.team = null; br.cap = rand() < 0.1 ? BR.green : null;
    br.sign = f.sign ? BR_SIGNS[signs++ % BR_SIGNS.length] : null;
    br.flag = !br.sign && rand() < 0.16;
    br.phone = !br.sign && !br.flag && rand() < 0.3;
    f.br = br;
  });
}
buildBrazilCrowd();

// A Brazil flag on a stick, centred at (x, y), waving.
function drawBrazilFlag(x, y, w, t, phase) {
  var h = w * 0.7, wave = Math.sin(t * 9 + phase) * w * 0.06;
  ctx.save();
  ctx.translate(x, y);
  ctx.strokeStyle = "#5b4630"; ctx.lineWidth = Math.max(2, w * 0.06);
  ctx.beginPath(); ctx.moveTo(-w * 0.5, -h * 0.5); ctx.lineTo(-w * 0.5, h * 1.3); ctx.stroke();
  ctx.transform(1, wave / w, 0, 1, 0, 0);
  ctx.fillStyle = BR.green; ctx.fillRect(-w * 0.5, -h * 0.5, w, h);
  ctx.fillStyle = BR.yellow;
  ctx.beginPath(); ctx.moveTo(0, -h * 0.4); ctx.lineTo(w * 0.42, 0); ctx.lineTo(0, h * 0.4); ctx.lineTo(-w * 0.42, 0); ctx.closePath(); ctx.fill();
  ctx.fillStyle = BR.blue;
  ctx.beginPath(); ctx.arc(0, 0, h * 0.22, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = BR.white; ctx.lineWidth = Math.max(1, h * 0.04);
  ctx.beginPath(); ctx.arc(0, h * 0.12, h * 0.26, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke();
  ctx.strokeStyle = STAGE_INK; ctx.lineWidth = 1.5; ctx.strokeRect(-w * 0.5, -h * 0.5, w, h);
  ctx.restore();
}

// A fan's shirt over the bottom two thirds of the ball (inside the ball's clip).
function drawFanShirt(c, r, f) {
  var col = f.shirt, dark = shadeHex(col, -0.3);
  c.fillStyle = col;
  c.beginPath();
  c.moveTo(-r, -r * 0.38);
  c.quadraticCurveTo(-r * 0.55, -r * 0.3, -r * 0.3, -r * 0.24);
  c.quadraticCurveTo(0, -r * 0.08, r * 0.3, -r * 0.24);
  c.quadraticCurveTo(r * 0.55, -r * 0.3, r, -r * 0.38);
  c.lineTo(r, r); c.lineTo(-r, r); c.closePath(); c.fill();
  if (f.style === "jersey") {
    c.fillStyle = "rgba(255,255,255,0.85)";
    c.fillRect(-r, r * 0.05, r * 2, r * 0.14); c.fillRect(-r, r * 0.3, r * 2, r * 0.07);
  }
  // Collar
  c.strokeStyle = f.style === "hoodie" ? dark : shadeHex(col, -0.4);
  c.lineWidth = Math.max(1, r * (f.style === "hoodie" ? 0.14 : 0.07));
  c.beginPath(); c.moveTo(-r * 0.3, -r * 0.24); c.quadraticCurveTo(0, -r * 0.08, r * 0.3, -r * 0.24); c.stroke();
  if (f.style === "hoodie") {
    // Drawstrings and a front pocket
    c.strokeStyle = "rgba(255,255,255,0.8)"; c.lineWidth = Math.max(1, r * 0.04);
    c.beginPath(); c.moveTo(-r * 0.1, -r * 0.14); c.lineTo(-r * 0.12, r * 0.12); c.moveTo(r * 0.1, -r * 0.14); c.lineTo(r * 0.12, r * 0.12); c.stroke();
    c.strokeStyle = dark;
    c.beginPath(); c.moveTo(-r * 0.4, r * 0.75); c.lineTo(-r * 0.3, r * 0.4); c.lineTo(r * 0.3, r * 0.4); c.lineTo(r * 0.4, r * 0.75); c.stroke();
  }
  // Sleeve seams
  c.strokeStyle = dark; c.lineWidth = Math.max(1, r * 0.045);
  [-1, 1].forEach(function (s) { c.beginPath(); c.moveTo(s * r * 0.62, -r * 0.33); c.quadraticCurveTo(s * r * 0.55, r * 0.1, s * r * 0.66, r * 0.5); c.stroke(); });
  // Corner fans get a little glove print on the chest
  if (f.team && f.style === "tee") {
    c.fillStyle = "rgba(255,255,255,0.9)";
    c.beginPath(); c.arc(0, r * 0.18, r * 0.16, 0, Math.PI * 2); c.fill();
    c.fillRect(-r * 0.16, r * 0.18, r * 0.32, r * 0.16);
  }
  var g = c.createLinearGradient(0, -r * 0.3, 0, r);
  g.addColorStop(0, "rgba(255,255,255,0.12)"); g.addColorStop(1, "rgba(0,0,0,0.3)");
  c.fillStyle = g; c.fillRect(-r, -r * 0.4, r * 2, r * 1.4);
}

function drawFanCap(c, r, col) {
  c.fillStyle = col; c.strokeStyle = STAGE_INK; c.lineWidth = Math.max(1, r * 0.05);
  c.beginPath(); c.moveTo(-r, -r * 0.62); c.quadraticCurveTo(0, -r * 0.74, r, -r * 0.62); c.lineTo(r, -r); c.lineTo(-r, -r); c.closePath(); c.fill(); c.stroke();
  c.fillStyle = shadeHex(col, -0.25);
  c.beginPath(); c.ellipse(0, -r * 0.62, r * 0.62, r * 0.13, 0, 0, Math.PI * 2); c.fill(); c.stroke();
}

// The fan's ball, faceless and drawn like a fighter: the top third is the
// head (hair, ears, beard from the fighter art), the rest a shirt.
function drawFanBall(c, r, f) {
  var look = f.look;
  if (f.shirtless) { drawFighterArt(c, 0, 0, r, look, STAGE_INK, { layout: "contained", name: "fan" + f.phase }); return; }
  var line = shadeHex(look.skin, -0.38);
  var lw = function (k) { return Math.max(1, r * k); };
  c.save();
  c.beginPath(); c.arc(0, 0, r, 0, Math.PI * 2); c.clip();
  var g = c.createRadialGradient(-r * 0.35, -r * 0.45, r * 0.1, 0, 0, r * 1.05);
  g.addColorStop(0, shadeHex(look.skin, 0.14)); g.addColorStop(0.7, look.skin); g.addColorStop(1, shadeHex(look.skin, -0.22));
  c.fillStyle = g; c.fillRect(-r, -r, r * 2, r * 2);
  drawFanShirt(c, r, f);
  drawArtHeadLayer(c, r, look, line, lw);
  if (f.cap) drawFanCap(c, r, f.cap);
  var rg = c.createRadialGradient(-r * 0.2, -r * 0.25, r * 0.6, 0, 0, r);
  rg.addColorStop(0, "rgba(0,0,0,0)"); rg.addColorStop(1, "rgba(0,0,0,0.25)");
  c.fillStyle = rg; c.fillRect(-r, -r, r * 2, r * 2);
  c.restore();
  c.strokeStyle = STAGE_INK; c.lineWidth = Math.max(2, r * 0.077);
  c.beginPath(); c.arc(0, 0, r, 0, Math.PI * 2); c.stroke();
}

// ---------------------------------------------------------------- static layers

// Everything that doesn't move is drawn once into offscreen canvases at the
// current canvas resolution, so a frame is mostly a handful of drawImages.
var stadiumCache = { key: null };

function makeLayer(w, h) {
  var cv = document.createElement("canvas");
  cv.width = Math.max(1, Math.round(w)); cv.height = Math.max(1, Math.round(h));
  return cv;
}

function stadiumKey() { return canvas.width + ":" + (wwitBadge.complete ? 1 : 0) + (brazilOn() ? ":br" : ""); }

function buildStadiumCache(px) {
  var c = stadiumCache;
  c.key = stadiumKey();
  c.px = px;
  // Stands, walkway and cage
  c.bg = makeLayer(STAGE_W * px, STAGE_H * px);
  var g = c.bg.getContext("2d");
  g.scale(px, px);
  drawStandsLayer(g);
  // Fans, each as its own sprite
  stadiumFans.forEach(function (f) {
    var size = Math.ceil(f.r * 2.3 * px);
    f.sprite = makeLayer(size, size);
    var fg = f.sprite.getContext("2d");
    fg.translate(size / 2, size / 2); fg.scale(px, px);
    drawFanBall(fg, f.r, brazilOn() ? f.br : f);
  });
  // The branded mat, in arena units (W x H)
  var ap = px * ST.A / W;
  c.mat = makeLayer(W * ap, H * ap);
  var mg = c.mat.getContext("2d");
  mg.scale(ap, ap);
  drawMatLayer(mg);
  // Jumbotron frame and its LED overlay
  var jt = ST.JT;
  c.jtBack = makeLayer(jt.w * px + 40 * px, jt.h * px + 40 * px);
  var jb = c.jtBack.getContext("2d");
  jb.scale(px, px); jb.translate(20 - jt.x, 20 - jt.y);
  drawJumbotronFrame(jb);
  c.jtFront = makeLayer(jt.w * px, jt.h * px);
  var jf = c.jtFront.getContext("2d");
  jf.scale(px, px); jf.translate(-jt.x, -jt.y);
  drawJumbotronOverlay(jf);
}

function drawStandsLayer(g) {
  var IN = ST.IN, ROW = 124, SIDE = IN.x0;
  g.fillStyle = "#0b0d12"; g.fillRect(0, 0, STAGE_W, STAGE_H);
  // Tiered rows, darker as they climb away from the lights
  for (var r = ROWS_TB; r >= 0; r--) {
    var shade = Math.max(14, 58 - r * 4);
    g.fillStyle = "rgb(" + shade + "," + (shade + 2) + "," + (shade + 8) + ")";
    g.fillRect(0, IN.y0 - ROW * (r + 1), STAGE_W, ROW - 3);
    g.fillRect(0, IN.y1 + ROW * r + 3, STAGE_W, ROW - 3);
  }
  g.fillStyle = "rgb(58,60,66)";
  g.fillRect(0, IN.y0, SIDE - 3, IN.y1 - IN.y0);
  g.fillRect(STAGE_W - SIDE + 3, IN.y0, SIDE - 3, IN.y1 - IN.y0);

  // Walkway: maroon, wordmark in the middle and the motto either side
  var AX = ST.AX, AY = ST.AY, A = ST.A, CAGE = ST.CAGE;
  var br = brazilOn();
  g.fillStyle = br ? BR.green : WWIT.maroon;
  g.fillRect(IN.x0, IN.y0, IN.x1 - IN.x0, IN.y1 - IN.y0);
  g.fillStyle = br ? BR.yellow : WWIT.gold; g.textAlign = "center"; g.textBaseline = "middle";
  [IN.y0 + ST.APRON / 2 + 1, IN.y1 - ST.APRON / 2 + 1].forEach(function (ay) {
    for (var k = -1; k <= 1; k++) {
      g.globalAlpha = k === 0 ? 1 : 0.55;
      g.font = "900 " + (k === 0 ? 30 : 21) + "px Impact, 'Arial Black', sans-serif";
      g.fillText(br ? (k === 0 ? "DO BRONX" : "BRASIL") : (k === 0 ? WWIT.name + " " + WWIT.sub : WWIT.motto), STAGE_W / 2 + k * 290, ay);
    }
    g.globalAlpha = 1;
  });
  // Corner pads: red top left, blue bottom right
  g.fillStyle = br ? BR.yellow : "#c62828"; g.fillRect(AX - CAGE - 12, AY - CAGE - 12, 40, 40);
  g.fillStyle = br ? BR.blue : "#1e46a8"; g.fillRect(AX + A + CAGE - 28, AY + A + CAGE - 28, 40, 40);
  // Cage rail with chain-link
  g.strokeStyle = WWIT.dark; g.lineWidth = CAGE;
  g.strokeRect(AX - CAGE / 2, AY - CAGE / 2, A + CAGE, A + CAGE);
  g.save();
  g.beginPath(); g.rect(AX - CAGE, AY - CAGE, A + CAGE * 2, A + CAGE * 2); g.rect(AX, AY, A, A); g.clip("evenodd");
  g.strokeStyle = "rgba(160,175,185,0.35)"; g.lineWidth = 1;
  for (var d = -STAGE_H; d < STAGE_H * 2; d += 9) {
    g.beginPath(); g.moveTo(d, 0); g.lineTo(d + STAGE_H, STAGE_H); g.moveTo(d, STAGE_H); g.lineTo(d + STAGE_H, 0); g.stroke();
  }
  g.restore();
  // Gold trim and posts
  g.strokeStyle = br ? BR.yellow : WWIT.gold; g.lineWidth = 4; g.strokeRect(AX - 2, AY - 2, A + 4, A + 4);
  g.fillStyle = br ? BR.yellow : WWIT.gold;
  for (var i = 0; i <= 4; i++) {
    var p = AX - CAGE / 2 + (A + CAGE) * i / 4, q = AY - CAGE / 2 + (A + CAGE) * i / 4;
    [[p, AY - CAGE / 2], [p, AY + A + CAGE / 2], [AX - CAGE / 2, q], [AX + A + CAGE / 2, q]].forEach(function (pt) {
      g.beginPath(); g.arc(pt[0], pt[1], CAGE * 0.62, 0, Math.PI * 2); g.fill();
    });
  }
}

// The canvas mat in arena units: cream so the fighters stay readable, a
// faded badge in the middle, a maroon octagon line and corner wordmarks.
function drawMatLayer(g) {
  if (brazilOn()) { drawBrazilMat(g); return; }
  g.fillStyle = WWIT.mat; g.fillRect(0, 0, W, H);
  g.strokeStyle = "rgba(0,0,0,0.035)"; g.lineWidth = 0.6;
  g.beginPath();
  for (var i = 0; i < W; i += 4) { g.moveTo(i, 0); g.lineTo(i, H); g.moveTo(0, i); g.lineTo(W, i); }
  g.stroke();
  var cx = W / 2, cy = H / 2, R = W * 0.47;
  g.strokeStyle = WWIT.maroon; g.lineWidth = 4; g.globalAlpha = 0.55;
  g.beginPath();
  for (var k = 0; k <= 8; k++) { var an = Math.PI / 8 + k * Math.PI / 4; g[k ? "lineTo" : "moveTo"](cx + Math.cos(an) * R, cy + Math.sin(an) * R); }
  g.stroke();
  if (wwitBadge.complete && wwitBadge.naturalWidth) {
    g.globalAlpha = 0.24;
    var bs = W * 0.24;
    g.drawImage(wwitBadge, cx - bs, cy - bs, bs * 2, bs * 2);
  }
  g.globalAlpha = 0.28; g.fillStyle = WWIT.maroon;
  g.font = "900 17px Impact, 'Arial Black', sans-serif"; g.textAlign = "center"; g.textBaseline = "middle";
  [[1, 1], [-1, 1], [1, -1], [-1, -1]].forEach(function (d) {
    g.save(); g.translate(cx + d[0] * W * 0.385, cy + d[1] * H * 0.385); g.rotate(-d[0] * d[1] * Math.PI / 4);
    g.fillText(WWIT.name + " " + WWIT.sub, 0, 0); g.restore();
  });
  g.globalAlpha = 1;
}

// The Brazil mat: still light so the fighters read, with a faded flag in
// the middle, a green octagon line and BRASIL in the corners.
function drawBrazilMat(g) {
  g.fillStyle = "#f4f1d8"; g.fillRect(0, 0, W, H);
  var cx = W / 2, cy = H / 2, R = W * 0.47;
  g.globalAlpha = 0.22;
  g.fillStyle = BR.green; g.fillRect(cx - W * 0.33, cy - H * 0.23, W * 0.66, H * 0.46);
  g.fillStyle = BR.yellow;
  g.beginPath(); g.moveTo(cx, cy - H * 0.2); g.lineTo(cx + W * 0.29, cy); g.lineTo(cx, cy + H * 0.2); g.lineTo(cx - W * 0.29, cy); g.closePath(); g.fill();
  g.fillStyle = BR.blue; g.beginPath(); g.arc(cx, cy, H * 0.11, 0, Math.PI * 2); g.fill();
  g.globalAlpha = 0.6; g.strokeStyle = BR.green; g.lineWidth = 4;
  g.beginPath();
  for (var k = 0; k <= 8; k++) { var an = Math.PI / 8 + k * Math.PI / 4; g[k ? "lineTo" : "moveTo"](cx + Math.cos(an) * R, cy + Math.sin(an) * R); }
  g.stroke();
  g.globalAlpha = 0.35; g.fillStyle = BR.green;
  g.font = "900 17px Impact, 'Arial Black', sans-serif"; g.textAlign = "center"; g.textBaseline = "middle";
  [[1, 1], [-1, 1], [1, -1], [-1, -1]].forEach(function (d) {
    g.save(); g.translate(cx + d[0] * W * 0.385, cy + d[1] * H * 0.385); g.rotate(-d[0] * d[1] * Math.PI / 4);
    g.fillText("BRASIL", 0, 0); g.restore();
  });
  g.globalAlpha = 1;
}

function drawJumbotronFrame(g) {
  var jt = ST.JT;
  g.fillStyle = "rgba(0,0,0,0.45)"; g.fillRect(jt.x + 10, jt.y + jt.h, jt.w - 20, 18);
  g.fillStyle = "#14171c"; g.strokeStyle = "#3a404a"; g.lineWidth = 4;
  g.beginPath();
  if (g.roundRect) g.roundRect(jt.x, jt.y, jt.w, jt.h, 14); else g.rect(jt.x, jt.y, jt.w, jt.h);
  g.fill(); g.stroke();
  var sx = jt.x + 14, sy = jt.y + 14, sw = jt.w - 28, sh = jt.h - 28;
  var bg = g.createLinearGradient(0, sy, 0, sy + sh);
  bg.addColorStop(0, "#0b1330"); bg.addColorStop(1, "#05081a");
  g.fillStyle = bg; g.fillRect(sx, sy, sw, sh);
  g.fillStyle = "rgba(255,255,255,0.06)"; g.fillRect(sx, sy, sw, 44);
}

// LED pixel grid and a soft sheen over the screen.
function drawJumbotronOverlay(g) {
  var jt = ST.JT, sx = jt.x + 14, sy = jt.y + 14, sw = jt.w - 28, sh = jt.h - 28;
  g.fillStyle = "rgba(0,0,0,0.22)";
  for (var gy = sy; gy < sy + sh; gy += 4) g.fillRect(sx, gy, sw, 1);
  for (var gx = sx; gx < sx + sw; gx += 4) g.fillRect(gx, sy, 1, sh);
  var sheen = g.createLinearGradient(sx, sy, sx + sw, sy + sh);
  sheen.addColorStop(0, "rgba(255,255,255,0.07)"); sheen.addColorStop(0.5, "rgba(255,255,255,0)");
  g.fillStyle = sheen; g.fillRect(sx, sy, sw, sh);
}

// ---------------------------------------------------------------- fight stats

// Strikes landed, damage dealt and takedowns per fighter, for the jumbotron.
var fightStats = null, fightStatsFor = null, fightClock = 0, fightClockLast = null;
function statsFor(id) {
  if (fightStatsFor !== balls) {
    fightStatsFor = balls;
    fightStats = [{ strikes: 0, dmg: 0, td: 0 }, { strikes: 0, dmg: 0, td: 0 }];
    fightClock = 0;
  }
  return fightStats[id];
}
// Called from hurt() with the HP actually taken off.
function recordHit(target, dealt, source, attackerId) {
  if (attackerId == null || attackerId === target.id || dealt <= 0) return;
  var s = statsFor(attackerId);
  s.dmg += dealt;
  if (source !== "laser") s.strikes++;
  if (source === "grapple") s.td++;
}
function recordTakedown(attackerId) { statsFor(attackerId).td++; }

// ---------------------------------------------------------------- per frame

function drawStadium(px) {
  if (stadiumCache.key !== stadiumKey()) buildStadiumCache(px);
  statsFor(0);
  var now = performance.now() / 1000;
  if (fightClockLast !== null && started && !over) fightClock += Math.min(0.1, now - fightClockLast);
  fightClockLast = now;

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.drawImage(stadiumCache.bg, 0, 0);
  ctx.setTransform(px, 0, 0, px, 0, 0);
  // The crowd gets louder when the cage shakes.
  // In Brazil mode everyone's on their feet the whole time.
  var br = brazilOn();
  var roar = br ? 1 : Math.min(1, (shake || 0) / 10);
  for (var i = 0; i < stadiumFans.length; i++) drawFan(br ? stadiumFans[i].br : stadiumFans[i], now, roar, px);
  for (var j = 0; j < stadiumFans.length; j++) {
    var f = br ? stadiumFans[j].br : stadiumFans[j];
    if (f.sign) drawFanSign(f, now);
    else if (f.flag) drawBrazilFlag(f.x + f.r * 0.3, f.y - f.r * 1.55, f.r * 1.3, now, f.phase);
  }
  drawCameraFlashes(now);
}

function drawFan(f, t, roar, px) {
  var hype = 0.5 + 0.5 * Math.sin(t * f.rate * (1 + roar) + f.phase);
  var cheer = f.hype > 0.5 - roar * 0.6;
  var r = f.r, bob = (cheer ? hype : hype * 0.3) * r * 0.22;
  var x = f.x, y = f.y - bob;
  // Bare fists pumping behind the ball
  if (cheer || f.sign || f.phone) {
    var up = f.sign ? 0 : hype * r * 0.3;
    ctx.fillStyle = f.look.skin; ctx.strokeStyle = STAGE_INK; ctx.lineWidth = Math.max(1.5, r * 0.07);
    for (var s = -1; s <= 1; s += 2) {
      if (f.phone && s > 0) continue;
      ctx.beginPath(); ctx.arc(x + s * r * 0.92, y - r * 0.75 - up, r * 0.24, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    }
  }
  var size = f.sprite.width / px;
  ctx.drawImage(f.sprite, x - size / 2, y - size / 2, size, size);
  if (f.phone) {
    ctx.fillStyle = "#111111"; ctx.fillRect(x + r * 0.7, y - r * 1.45, r * 0.42, r * 0.7);
    if (Math.sin(t * 3 + f.phase * 5) > 0.1) {
      ctx.fillStyle = "rgba(255,255,255,0.85)";
      ctx.beginPath(); ctx.arc(x + r * 0.91, y - r * 1.25, r * 0.22, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.15)";
      ctx.beginPath(); ctx.arc(x + r * 0.91, y - r * 1.25, r * 0.42, 0, Math.PI * 2); ctx.fill();
    }
  }
}

function drawFanSign(f, t) {
  var r = f.r, hype = 0.5 + 0.5 * Math.sin(t * f.rate + f.phase);
  var sw = r * 2.9, sh = r * 0.9, cx = f.x, cy = f.y - hype * r * 0.15 - r * 1.35;
  ctx.fillStyle = f.sign[1]; ctx.strokeStyle = STAGE_INK; ctx.lineWidth = 2.5;
  ctx.fillRect(cx - sw / 2, cy - sh / 2, sw, sh); ctx.strokeRect(cx - sw / 2, cy - sh / 2, sw, sh);
  ctx.fillStyle = f.sign[2]; ctx.textAlign = "center"; ctx.textBaseline = "middle";
  fitFont(f.sign[0], r * 0.62, sw * 0.88);
  ctx.fillText(f.sign[0], cx, cy + 1);
}

function fitFont(text, size, maxW) {
  ctx.font = "900 " + size + "px Impact, 'Arial Black', sans-serif";
  var tw = ctx.measureText(text).width;
  if (tw > maxW) ctx.font = "900 " + (size * maxW / tw) + "px Impact, 'Arial Black', sans-serif";
}

// The mat, drawn under everything else in the arena (arena units).
function drawStadiumMat() { ctx.drawImage(stadiumCache.mat, 0, 0, W, H); }

function jtText(txt, x, y, size, col, align, glow, maxW) {
  ctx.textAlign = align || "center"; ctx.textBaseline = "middle";
  if (maxW) fitFont(txt, size, maxW); else ctx.font = "900 " + size + "px Impact, 'Arial Black', sans-serif";
  ctx.shadowColor = glow || col; ctx.shadowBlur = size * 0.35;
  ctx.fillStyle = col; ctx.fillText(txt, x, y);
  ctx.shadowBlur = 0;
}

function shortName(ch) {
  var parts = (ch.name || "").trim().split(/\s+/);
  return (parts[parts.length - 1] || "").toUpperCase();
}

function drawJumbotron(px) {
  var jt = ST.JT, c = stadiumCache;
  var sx = jt.x + 14, sy = jt.y + 14, sw = jt.w - 28;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.drawImage(c.jtBack, (jt.x - 20) * px, (jt.y - 20) * px);
  ctx.setTransform(px, 0, 0, px, 0, 0);
  // Cables up into the rafters
  ctx.strokeStyle = "#2a2f38"; ctx.lineWidth = 5;
  ctx.beginPath(); ctx.moveTo(jt.x + 80, 0); ctx.lineTo(jt.x + 80, jt.y); ctx.moveTo(jt.x + jt.w - 80, 0); ctx.lineTo(jt.x + jt.w - 80, jt.y); ctx.stroke();

  // Top strip: round, wordmark with the badge either side, clock
  jtText(WWIT.name + " " + WWIT.sub, sx + sw / 2, sy + 23, 32, WWIT.gold, "center", "#b8862f");
  if (wwitBadge.complete && wwitBadge.naturalWidth) {
    ctx.drawImage(wwitBadge, sx + sw / 2 - 108 - 19, sy + 3, 38, 38);
    ctx.drawImage(wwitBadge, sx + sw / 2 + 108 - 19, sy + 3, 38, 38);
  }
  jtText("RD 1", sx + 18, sy + 23, 24, "#e9edf5", "left", "#9fb4ff");
  var secs = Math.floor(fightClock), mm = Math.floor(secs / 60), ss = secs % 60;
  jtText(mm + ":" + (ss < 10 ? "0" : "") + ss, sx + sw - 18, sy + 23, 26, "#e9edf5", "right", "#9fb4ff");

  // Each fighter: portrait, name, health bar, special meter
  balls.forEach(function (b, i) {
    var right = i === 1, ch = b.char, col = ch.color || "#888888", glow = shadeHex(col, 0.35);
    var px0 = right ? sx + sw - 62 : sx + 62, py0 = sy + 104;
    ctx.shadowColor = glow; ctx.shadowBlur = 18;
    ctx.fillStyle = col; ctx.beginPath(); ctx.arc(px0, py0, 50, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
    if (ch.look) drawFighterArt(ctx, px0, py0, 44, ch.look, "#0b0f12", { layout: "contained", name: ch.name });
    else jtText((ch.name || "?").charAt(0).toUpperCase(), px0, py0 + 2, 52, "#ffffff", "center", "#000000");
    if (!b.alive) { ctx.fillStyle = "rgba(0,0,0,0.55)"; ctx.beginPath(); ctx.arc(px0, py0, 50, 0, Math.PI * 2); ctx.fill(); }

    var nx = right ? px0 - 64 : px0 + 64, bw = sw / 2 - 150;
    jtText(shortName(ch), nx, sy + 68, 42, "#ffffff", right ? "right" : "left", glow, bw);
    var bx = right ? nx - bw : nx, by = sy + 92, bh = 30;
    ctx.fillStyle = "#1b2238"; ctx.fillRect(bx, by, bw, bh);
    // Recent damage shows as a pale ghost, like the regular health bars
    var gw = bw * Math.max(0, b.shown) / MAX_HP, fw = bw * Math.max(0, b.hp) / MAX_HP;
    ctx.fillStyle = "rgba(255,255,255,0.35)";
    ctx.fillRect(right ? bx + bw - gw : bx, by, gw, bh);
    var hg = ctx.createLinearGradient(0, by, 0, by + bh);
    hg.addColorStop(0, shadeHex(col, 0.45)); hg.addColorStop(1, col);
    ctx.fillStyle = hg; ctx.shadowColor = glow; ctx.shadowBlur = 12;
    ctx.fillRect(right ? bx + bw - fw : bx, by, fw, bh);
    ctx.shadowBlur = 0;
    ctx.strokeStyle = "rgba(255,255,255,0.5)"; ctx.lineWidth = 2; ctx.strokeRect(bx, by, bw, bh);
    jtText(String(Math.ceil(b.hp)), right ? bx + bw - 8 : bx + 8, by + bh / 2 + 1, 27, "#ffffff", right ? "right" : "left", "#000000");

    if (ch.hasSpecial) {
      var my = by + bh + 10, mh = 10, mw = bw * 0.7, mx = right ? bx + bw - mw : bx;
      var sp = Math.max(0, Math.min(1, (b.specialT || 0) / ch.special.chargeTime));
      if (b.doBronx) sp = Math.max(0, 1 - b.doBronx.t / b.doBronx.dur); // Do Bronx running down
      ctx.fillStyle = "#1b2238"; ctx.fillRect(mx, my, mw, mh);
      ctx.fillStyle = "#ffd23f"; ctx.shadowColor = "#ffb000"; ctx.shadowBlur = sp >= 1 ? 16 : 8;
      ctx.fillRect(right ? mx + mw * (1 - sp) : mx, my, mw * sp, mh);
      ctx.shadowBlur = 0;
      ctx.font = "700 14px Impact, 'Arial Black', sans-serif"; ctx.fillStyle = sp >= 1 ? "#ffd23f" : "#c9d3ea";
      ctx.textAlign = right ? "right" : "left"; ctx.textBaseline = "middle";
      ctx.fillText((b.doBronx ? "" : sp >= 1 ? "READY: " : "") + specialName(ch).toUpperCase() + (b.doBronx ? "!" : ""), right ? mx - 8 : mx + mw + 8, my + 6);
    }
  });

  // Stats table
  var rows = [["STRIKES LANDED", "strikes"], ["DAMAGE DEALT", "dmg"], ["TAKEDOWNS", "td"]];
  rows.forEach(function (row, j) {
    var yy = sy + 176 + j * 28;
    var a = Number(dmgText(fightStats[0][row[1]])), b = Number(dmgText(fightStats[1][row[1]]));
    ctx.fillStyle = j % 2 ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.07)";
    ctx.fillRect(sx + 20, yy - 13, sw - 40, 26);
    jtText(row[0], sx + sw / 2, yy + 1, 23, "#c9d3ea", "center", "#000000");
    var tot = Math.max(1, a + b), maxW = sw / 2 - 210;
    ctx.fillStyle = shadeHex(balls[0].char.color || "#888888", 0.35);
    ctx.fillRect(sx + sw / 2 - 110 - maxW * a / tot, yy - 5, maxW * a / tot, 10);
    ctx.fillStyle = shadeHex(balls[1].char.color || "#888888", 0.35);
    ctx.fillRect(sx + sw / 2 + 110, yy - 5, maxW * b / tot, 10);
    jtText(String(a), sx + 50, yy + 1, 30, "#ffffff", "left", shadeHex(balls[0].char.color || "#888888", 0.35));
    jtText(String(b), sx + sw - 50, yy + 1, 30, "#ffffff", "right", shadeHex(balls[1].char.color || "#888888", 0.35));
  });

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.drawImage(c.jtFront, jt.x * px, jt.y * px);
}

wwitBadge.onload = function () { stadiumCache.key = null; };
