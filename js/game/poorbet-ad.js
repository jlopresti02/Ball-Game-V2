// The Poorbet ad (Joe, 2026-11-06): a parody sportsbook ad that makes it
// clear gambling is just throwing your money away. It isn't tied to a
// fighter: it's one of the sponsor ads that come up at random during a
// match (ad-breaks.js), through queueJumboAd like every other ad, so it
// never overlaps one and waits out any special (truckees-ad.js).
//
// On a flashing casino marquee: the Poorbet logo ("Losses happen here"),
// a fan tossing his cash straight into a trash can while his balance
// counts down from $1,000 to $0.00, three slogans in turn
//   BET IT ALL ON THE BALL FIGHT!  ->  ODDS OF WINNING: LOL  ->
//   GAMBLING IS THROWING MONEY AWAY
// then his pockets come out empty and a moth flies out. Fine print scrolls
// along the bottom. The sound is a casino jingle, coins and a sad trombone.
"use strict";

var POORBET_SHOW = 7.5;
var POORBET_BROKE = 5.0; // when the balance hits $0.00 (and the trombone plays)
var poorbetShow = 0;
var poorbetLogoImg = new Image(); poorbetLogoImg.src = POORBET_LOGO_SRC;
var POORBET_FAN = null; // built on first draw (fighter-art.js loads after this file)
function poorbetFan() {
  if (POORBET_FAN) return POORBET_FAN;
  var look = defaultLook();
  look.skin = "#e0ac84"; look.hair = "short"; look.hairColor = "#3a2618"; look.beard = "stubble"; look.build = "stocky";
  return (POORBET_FAN = { look: look, shirt: "#2e7d32", style: "jersey", cap: "#1b1410", team: null, shirtless: false, phase: 0 });
}
var POORBET_LINES = [
  ["BET IT ALL ON", "THE BALL FIGHT!"],
  ["ODDS OF WINNING:", "LOL"],
  ["GAMBLING IS", "THROWING MONEY AWAY"]
];
var POORBET_FINE = "*Poorbet is a parody. The house always wins. Every bet you place is money thrown away. " +
  "Average Poorbet customer: broke. Past losses guarantee future losses. Gambling problem? Call 1-800-GAMBLER.";

function startPoorbetAd() {
  queueJumboAd(POORBET_SHOW, function () {
    poorbetShow = POORBET_SHOW;
    playPoorbetAd();
  });
}
function tickPoorbetAd(dt) { if (poorbetShow > 0) poorbetShow = Math.max(0, poorbetShow - dt); }

// The fan's balance: $1,000 draining to nothing by POORBET_BROKE.
function poorbetBalance(t) {
  var u = Math.max(0, Math.min(1, (t - 0.5) / (POORBET_BROKE - 0.5)));
  return u >= 1 ? 0 : 1000 * (1 - u) * (1 - u * 0.35) + Math.sin(t * 23) * 6 * (1 - u);
}
function poorbetMoney(v) {
  var d = Math.max(0, v).toFixed(2).split(".");
  return "$" + d[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") + "." + d[1];
}

function drawPoorbetJumbo(x, y, w, h) {
  if (poorbetShow <= 0) return;
  var t = POORBET_SHOW - poorbetShow, a = Math.min(1, t / 0.25, poorbetShow / 0.3), k = h / 250;
  var broke = t >= POORBET_BROKE;
  ctx.save();
  ctx.globalAlpha = a;
  ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();

  // A night-at-the-casino backdrop with spotlights sweeping.
  var bg = ctx.createRadialGradient(x + w * 0.45, y + h * 0.5, h * 0.1, x + w * 0.45, y + h * 0.5, w * 0.6);
  bg.addColorStop(0, "#3d1257"); bg.addColorStop(0.6, "#1c0730"); bg.addColorStop(1, "#0a0312");
  ctx.fillStyle = bg; ctx.fillRect(x, y, w, h);
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  [[0.18, 1], [0.78, -1]].forEach(function (s) {
    var ang = Math.PI / 2 + Math.sin(t * 1.3 * s[1] + s[0] * 9) * 0.5;
    ctx.save();
    ctx.translate(x + w * s[0], y + h * 1.05); ctx.rotate(ang + Math.PI);
    var g = ctx.createLinearGradient(0, 0, h * 1.6, 0);
    g.addColorStop(0, "rgba(255,215,120,0.22)"); g.addColorStop(1, "rgba(255,215,120,0)");
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(h * 1.6, -h * 0.28); ctx.lineTo(h * 1.6, h * 0.28); ctx.closePath(); ctx.fill();
    ctx.restore();
  });
  ctx.restore();
  // Playing-card suits drifting up in the background.
  ctx.font = "900 " + (34 * k) + "px Georgia, serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ["♠", "♥", "♣", "♦", "♠", "♥", "♣", "♦"].forEach(function (s, i) {
    var px = x + w * (0.05 + i * 0.125), py = y + h - ((t * 30 * k + i * 61 * k) % (h * 1.2));
    ctx.fillStyle = i % 2 ? "rgba(255,80,110,0.12)" : "rgba(255,255,255,0.08)";
    ctx.fillText(s, px, py);
  });

  drawPoorbetLogo(x, y, w, h, t, k);
  drawPoorbetFan(x, y, w, h, t, k);
  drawPoorbetWords(x, y, w, h, t, k, broke);

  // Fine print crawling along the bottom.
  var fy = y + h * 0.9, fh = h * 0.1;
  ctx.fillStyle = "rgba(0,0,0,0.75)"; ctx.fillRect(x, fy, w, fh);
  ctx.font = "600 " + Math.max(7, 13 * k) + "px Helvetica, Arial, sans-serif"; ctx.textAlign = "left"; ctx.textBaseline = "middle";
  ctx.fillStyle = "#d8cfe6";
  var fw = ctx.measureText(POORBET_FINE + "     ").width, fx = x + w * 0.5 - ((t * 120 * k) % fw);
  for (var f = fx - fw; f < x + w; f += fw) ctx.fillText(POORBET_FINE, f, fy + fh / 2);

  // Marquee bulbs chasing around the edge (they all flash red once he's broke).
  var n = Math.round((w + h) * 2 / (22 * k)), per = (w + h) * 2 / n, step = Math.floor(t * 12);
  for (var i = 0; i < n; i++) {
    var d = i * per, bx, by;
    if (d < w) { bx = x + d; by = y + 5 * k; }
    else if (d < w + h) { bx = x + w - 5 * k; by = y + d - w; }
    else if (d < 2 * w + h) { bx = x + w - (d - w - h); by = y + h - 5 * k; }
    else { bx = x + 5 * k; by = y + h - (d - 2 * w - h); }
    var on = broke ? Math.sin(t * 14) > 0 : (i + step) % 3 === 0;
    ctx.fillStyle = on ? (broke ? "#ff3b3b" : "#ffe27a") : "rgba(120,90,40,0.6)";
    if (on) { ctx.shadowColor = broke ? "#ff0000" : "#ffc400"; ctx.shadowBlur = 8 * k; }
    ctx.beginPath(); ctx.arc(bx, by, 3.2 * k + 0.8, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
  }
  ctx.restore();
}

// The logo popping in on the left, glowing gold, the broken crown wobbling.
function drawPoorbetLogo(x, y, w, h, t, k) {
  if (!poorbetLogoImg.complete || !poorbetLogoImg.naturalWidth) return;
  var lw = Math.min(w * 0.3, h * 0.6 * POORBET_LOGO_SIZE[0] / POORBET_LOGO_SIZE[1]), lh = lw * POORBET_LOGO_SIZE[1] / POORBET_LOGO_SIZE[0];
  var p = Math.min(1, t / 0.45), s = 0.4 + 0.6 * easeOut(p) + Math.sin(p * Math.PI) * 0.18;
  var cx = x + w * 0.175, cy = y + h * 0.39;
  ctx.save();
  ctx.translate(cx, cy); ctx.rotate(Math.sin(t * 2.2) * 0.025); ctx.scale(s, s);
  ctx.shadowColor = "#ffb800"; ctx.shadowBlur = (14 + 6 * Math.sin(t * 6)) * k;
  ctx.drawImage(poorbetLogoImg, -lw / 2, -lh / 2, lw, lh);
  ctx.shadowBlur = 0;
  ctx.restore();
  var flash = Math.sin(t * 8) > 0;
  jtText("OFFICIAL SPORTSBOOK OF", cx, y + h * 0.7, Math.max(7, 15 * k), "#e3cd9a", "center", "#000000", w * 0.3);
  jtText("YOUR EMPTY WALLET", cx, y + h * 0.79, Math.max(8, 20 * k), flash ? "#ffe27a" : "#ffffff", "center", "#000000", w * 0.3);
}

// A fan in the middle tossing bills into a trash can, then turning out his
// empty pockets once he's broke.
function drawPoorbetFan(x, y, w, h, t, k) {
  var r = h * 0.2, fx = x + w * 0.41, fy = y + h * 0.53;
  var cw = w * 0.06, ch = h * 0.34, cx = x + w * 0.515, cb = y + h * 0.86; // the can: center x, bottom
  var broke = t >= POORBET_BROKE;
  // The trash can, lid knocked open, a pile of cash in the top.
  ctx.save();
  ctx.fillStyle = "rgba(0,0,0,0.35)"; ctx.beginPath(); ctx.ellipse(cx, cb, cw * 0.7, ch * 0.06, 0, 0, Math.PI * 2); ctx.fill();
  var cg = ctx.createLinearGradient(cx - cw / 2, 0, cx + cw / 2, 0);
  cg.addColorStop(0, "#5d6670"); cg.addColorStop(0.45, "#b9c3cc"); cg.addColorStop(1, "#4a525b");
  ctx.fillStyle = cg; ctx.strokeStyle = "#1a1d21"; ctx.lineWidth = Math.max(1, 2 * k);
  ctx.beginPath(); ctx.moveTo(cx - cw / 2, cb - ch); ctx.lineTo(cx + cw / 2, cb - ch); ctx.lineTo(cx + cw * 0.42, cb); ctx.lineTo(cx - cw * 0.42, cb); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.strokeStyle = "rgba(0,0,0,0.35)";
  for (var g = 1; g < 4; g++) { var gx = cx - cw * 0.45 + g * cw * 0.225; ctx.beginPath(); ctx.moveTo(gx, cb - ch * 0.92); ctx.lineTo(gx * 0.98 + cx * 0.02, cb - ch * 0.06); ctx.stroke(); }
  var pile = Math.min(1, t / POORBET_BROKE);
  for (var c = 0; c < 6; c++) {
    if (c / 6 > pile) break;
    drawPoorbetBill(cx - cw * 0.35 + (c % 3) * cw * 0.33, cb - ch - h * 0.015 - Math.floor(c / 3) * h * 0.03, (c * 0.9) % 1.6 - 0.8, k * 0.75);
  }
  ctx.save(); // the lid, knocked open and leaning against the side
  ctx.translate(cx + cw * 0.62, cb - ch * 0.62); ctx.rotate(0.22);
  var lg = ctx.createLinearGradient(-cw * 0.15, 0, cw * 0.15, 0);
  lg.addColorStop(0, "#5d6670"); lg.addColorStop(0.5, "#c3ccd4"); lg.addColorStop(1, "#4a525b");
  ctx.fillStyle = lg; ctx.strokeStyle = "#1a1d21";
  ctx.beginPath(); ctx.ellipse(0, 0, cw * 0.17, ch * 0.42, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = "#3b4249"; ctx.beginPath(); ctx.ellipse(cw * 0.12, 0, cw * 0.05, ch * 0.14, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); // handle
  ctx.restore();
  ctx.restore();

  // Bills flying from his hand into the can (until there are none left).
  var toss = (t * 1.9) % 1, throwing = !broke && t > 0.4;
  if (throwing) {
    for (var b = 0; b < 3; b++) {
      var u = ((t - 0.4) * 1.9 - b * 0.33) % 1;
      if (u < 0 || t - 0.4 < b * 0.33 / 1.9) continue;
      var sx = fx + r * 1.05, sy = fy - r * 0.55, ex = cx, ey = cb - ch - h * 0.02;
      var bx = sx + (ex - sx) * u, by = sy + (ey - sy) * u - Math.sin(u * Math.PI) * h * 0.32;
      drawPoorbetBill(bx, by, u * 7 + b, k);
    }
  }

  // The fan: bobbing while he throws, slumped once he's broke.
  var slump = broke ? Math.min(1, (t - POORBET_BROKE) / 0.4) : 0;
  var by0 = fy + Math.abs(Math.sin(t * 6)) * -r * 0.08 * (1 - slump) + slump * r * 0.1;
  ctx.save();
  ctx.translate(fx, by0); ctx.rotate(slump * -0.12);
  drawFanBall(ctx, r, poorbetFan());
  if (broke) { // pockets turned out
    ctx.fillStyle = "#f2f2f2"; ctx.strokeStyle = STAGE_INK; ctx.lineWidth = Math.max(1, r * 0.05);
    [-1, 1].forEach(function (s) {
      ctx.beginPath(); ctx.moveTo(s * r * 0.55, r * 0.5); ctx.quadraticCurveTo(s * r * 0.95, r * 0.55, s * r * 0.82, r * 1.0); ctx.lineTo(s * r * 0.4, r * 0.88); ctx.closePath(); ctx.fill(); ctx.stroke();
    });
  }
  // His fists: the throwing hand flicking out bills, or both hanging empty.
  ctx.fillStyle = poorbetFan().look.skin; ctx.strokeStyle = STAGE_INK; ctx.lineWidth = Math.max(1, r * 0.07);
  var hr = r * 0.26;
  if (!broke) {
    var fl = throwing ? Math.sin(toss * Math.PI * 2) : 0;
    ctx.beginPath(); ctx.arc(r * 1.0 + fl * r * 0.12, -r * 0.45 - fl * r * 0.2, hr, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.arc(-r * 1.0, -r * 0.2, hr, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    // A fat stack of cash in the other hand, shrinking.
    var stack = Math.max(0, 1 - t / POORBET_BROKE);
    if (stack > 0.05) drawPoorbetBill(-r * 1.0, -r * 0.55, -0.3, k * (0.7 + stack * 0.6));
  } else {
    ctx.beginPath(); ctx.arc(-r * 1.02, r * 0.6, hr, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.arc(r * 1.02, r * 0.6, hr, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  }
  ctx.restore();

  // A moth flutters out of his empty pocket.
  if (broke) {
    var m = t - POORBET_BROKE, mx = fx + r * 1.1 + m * w * 0.03 + Math.sin(m * 5) * r * 0.3, my = by0 + r * 0.7 - m * h * 0.2;
    var flap = Math.abs(Math.sin(m * 22));
    ctx.fillStyle = "#cbbfa6"; ctx.strokeStyle = "#5a4f3d"; ctx.lineWidth = Math.max(1, k);
    [-1, 1].forEach(function (s) {
      ctx.beginPath(); ctx.ellipse(mx + s * r * 0.17 * flap, my, r * 0.2 * (0.3 + flap * 0.7), r * 0.13, s * 0.4, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    });
    ctx.fillStyle = "#5a4f3d"; ctx.beginPath(); ctx.ellipse(mx, my, r * 0.045, r * 0.12, 0, 0, Math.PI * 2); ctx.fill();
    // A tumbleweed of dust where his money used to be.
    ctx.fillStyle = "rgba(220,210,190," + Math.max(0, 0.6 - m * 0.3) + ")";
    for (var p = 0; p < 5; p++) { ctx.beginPath(); ctx.arc(fx + r * (1.1 + p * 0.1), by0 + r * 0.75 - m * r * (0.2 + p * 0.15), r * (0.05 + p * 0.015), 0, Math.PI * 2); ctx.fill(); }
  }
}

// A green dollar bill (a cartoon one: no real money art).
function drawPoorbetBill(x, y, rot, k) {
  var bw = 34 * k, bh = 16 * k;
  ctx.save();
  ctx.translate(x, y); ctx.rotate(rot);
  ctx.fillStyle = "#7ac66b"; ctx.strokeStyle = "#1f4d19"; ctx.lineWidth = Math.max(1, 1.5 * k);
  ctx.fillRect(-bw / 2, -bh / 2, bw, bh); ctx.strokeRect(-bw / 2, -bh / 2, bw, bh);
  ctx.strokeRect(-bw / 2 + 2.5 * k, -bh / 2 + 2.5 * k, bw - 5 * k, bh - 5 * k);
  ctx.fillStyle = "#1f4d19"; ctx.font = "900 " + (12 * k) + "px Georgia, serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillText("$", 0, k);
  ctx.restore();
}

// The slogans on the right, and his balance draining under them.
function drawPoorbetWords(x, y, w, h, t, k, broke) {
  var tx = x + w * 0.79, tw = w * 0.36;
  var beat = broke ? 2 : t < 2.5 ? 0 : 1, bt = broke ? t - POORBET_BROKE : t - beat * 2.5;
  var line = POORBET_LINES[beat], pop = 1 + Math.max(0, 0.25 - bt) * 1.4;
  var ol = ["#14001f", "#c9a227", "#ffffff"];
  adText(line[0], tx, y + h * 0.15, 30 * k, ["#ffffff", "#e9dcff"], tw, pop, ol);
  var big = beat === 1 ? ["#ff5b5b", "#b30000"] : beat === 2 ? ["#ffe27a", "#f0a500"] : ["#ffffff", "#ffd2f0"];
  adText(line[1], tx, y + h * 0.38, (beat === 1 ? 70 : 46) * k, big, tw, pop, ol);

  // The balance board.
  var bx = x + w * 0.61, bw = w * 0.36, bh = h * 0.24, byy = y + h * 0.56;
  ctx.fillStyle = "rgba(0,0,0,0.6)"; ctx.strokeStyle = broke && Math.sin(t * 14) > 0 ? "#ff3b3b" : "#c9a227"; ctx.lineWidth = Math.max(1, 3 * k);
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(bx, byy, bw, bh, 8 * k); else ctx.rect(bx, byy, bw, bh);
  ctx.fill(); ctx.stroke();
  if (!broke) jtText("YOUR BALANCE", bx + 12 * k, byy + bh * 0.5, Math.max(7, 17 * k), "#c9b8e6", "left", "#000000", bw * 0.32);
  var bal = poorbetBalance(t), col = broke ? "#ff3b3b" : bal < 300 ? "#ff8a3b" : "#7dff8a";
  jtText(poorbetMoney(bal), bx + bw - 12 * k, byy + bh * 0.52, Math.max(10, 44 * k), col, "right", broke ? "#ff0000" : "#0a3d12", bw * 0.62);
  if (broke) {
    var bp = Math.min(1, (t - POORBET_BROKE) / 0.3);
    ctx.save();
    ctx.translate(bx + bw * 0.24, byy + bh * 0.5); ctx.rotate(-0.12); ctx.scale(2 - bp, 2 - bp);
    ctx.globalAlpha *= bp;
    ctx.strokeStyle = "#ff2a2a"; ctx.lineWidth = Math.max(1.5, 4 * k);
    ctx.strokeRect(-bw * 0.2, -bh * 0.36, bw * 0.4, bh * 0.72);
    ctx.font = "900 " + (34 * k) + "px Impact, 'Arial Black', sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillStyle = "#ff2a2a"; ctx.fillText("BROKE", 0, 1);
    ctx.restore();
  }
}

function drawPoorbetBanner() {
  if (poorbetShow <= 0 || stadiumOn()) return;
  drawPoorbetJumbo(10, 10, W - 20, 110);
}
