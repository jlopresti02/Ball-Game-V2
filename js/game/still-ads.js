// Still ads (Joe, 2026-11-06): second versions of the fighters' jumbotron
// ads, as silent still posters that play in the random ad breaks
// (ad-breaks.js). Each one has the same theme as the ad it's based on but
// looks different:
//   Truck-ee's  Gaethje's sunset/eagle hero spot -> a yellow highway
//               billboard: CLEAN RESTROOMS. DIRTY FIGHTS.
//   67'ers      Hokit charging across the field -> a season-ticket poster
//               with his trading card
//   Chaels      Dustin dancing in Diamond Guard -> a black-velvet jewelry
//               print ad with an open ring box: THE DIAMOND STANDARD
//   Poorbet     the animated casino-marquee ad -> a lost bet slip on a
//               poker table: THE ONLY SURE BET IS NOT BETTING
// Plus Dagestan World, a theme park with Khabib on a roller coaster, and
// GANE-PROOF (Gane's baby-proofing ad -> a boxed safety kit on a shelf, with
// the ref napping in the gear: FOR WHEN THE REF IS NAPPING),
// Who's Joe & Arman T? (Ilia's cologne: a black-and-white magazine photo and
// the bottle on satin: EVERY ROSE HAS ITS THORN), and GoatGoatGo (Jon's
// search-engine ad -> a bold orange poster: the GOAT of search engines, with
// Jon and his duck).
// Nothing moves and there's no sound; they just fade in, hold and fade out.
// The fighters don't have to be in the fight: their looks come from the
// roster.
"use strict";

var STILL_SHOW = 5.0;
var stillShow = 0, stillAd = null;

function startStillAd(ad) {
  queueJumboAd(STILL_SHOW, function () { stillAd = ad; stillShow = STILL_SHOW; });
}
function tickStillAds(dt) { if (stillShow > 0) stillShow = Math.max(0, stillShow - dt); }

// The fighter as he is in this fight if he's in it, otherwise from the roster.
function stillAdChar(name) {
  var inFight = balls && balls.filter(function (b) { return b && b.baseChar && b.baseChar.name === name; })[0];
  if (inFight) return inFight.baseChar;
  var lists = [typeof customChars !== "undefined" ? customChars : [], typeof SAVED_ROSTER !== "undefined" ? SAVED_ROSTER : []];
  for (var i = 0; i < lists.length; i++) {
    var c = (lists[i] || []).filter(function (ch) { return ch && ch.name === name && ch.look; })[0];
    if (c) return c;
  }
  return null;
}
// Only fighters on the roster get their ad in the rotation.
function stillAdReady(ad) { return !ad.fighter || !!stillAdChar(ad.fighter); }

function drawStillJumbo(x, y, w, h) {
  if (stillShow <= 0 || !stillAd) return;
  var ch = stillAd.fighter ? stillAdChar(stillAd.fighter) : null;
  if (stillAd.fighter && !ch) return;
  var t = STILL_SHOW - stillShow, a = Math.min(1, t / 0.3, stillShow / 0.3), k = h / 250;
  ctx.save();
  ctx.globalAlpha = a;
  ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
  stillAd.draw(x, y, w, h, k, ch);
  ctx.restore();
}
function drawStillBanner() {
  if (stillShow <= 0 || stadiumOn()) return;
  drawStillJumbo(10, 10, W - 20, 110);
}

// The Poorbet logo in any ink color (the art is white), made once per color.
var stillTints = {};
function stillTintedLogo(img, color) {
  if (!img.complete || !img.naturalWidth) return null;
  var key = img.src.length + color;
  if (stillTints[key]) return stillTints[key];
  var cv = document.createElement("canvas"); cv.width = img.naturalWidth; cv.height = img.naturalHeight;
  var g = cv.getContext("2d");
  g.drawImage(img, 0, 0); g.globalCompositeOperation = "source-in"; g.fillStyle = color; g.fillRect(0, 0, cv.width, cv.height);
  stillTints[key] = cv;
  return cv;
}

// A fighter's ball with its outline, for the posters.
function stillFighter(cx, cy, r, look, name) {
  ctx.fillStyle = "rgba(0,0,0,0.3)"; ctx.beginPath(); ctx.ellipse(cx, cy + r * 1.02, r * 0.95, r * 0.16, 0, 0, Math.PI * 2); ctx.fill();
  drawFighterArt(ctx, cx, cy, r, look, "#0b0f12", { layout: "contained", name: name });
  ctx.lineWidth = Math.max(2, r * 0.05); ctx.strokeStyle = "#0b0f12"; ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
}
// Plain heavy poster type (no slant), sized down to fit maxW.
function stillText(txt, x, y, size, col, maxW, opts) {
  opts = opts || {};
  ctx.save();
  var face = opts.face || "Impact, 'Arial Black', 'Helvetica Neue', Helvetica, Arial, sans-serif";
  ctx.font = (opts.weight || "900") + " " + size + "px " + face;
  var tw = ctx.measureText(txt).width, sz = maxW && tw > maxW ? size * maxW / tw : size;
  ctx.font = (opts.weight || "900") + " " + sz + "px " + face;
  ctx.textAlign = opts.align || "center"; ctx.textBaseline = "middle"; ctx.lineJoin = "round";
  if (opts.stroke) { ctx.lineWidth = sz * (opts.strokeW || 0.16); ctx.strokeStyle = opts.stroke; ctx.strokeText(txt, x, y); }
  if (opts.glow) { ctx.shadowColor = opts.glow; ctx.shadowBlur = sz * 0.35; }
  ctx.fillStyle = col; ctx.fillText(txt, x, y);
  ctx.restore();
}
function stillLogo(img, size, cx, cy, maxW, maxH, glow) {
  if (!img || !img.complete || !img.naturalWidth) return;
  var lw = Math.min(maxW, maxH * size[0] / size[1]), lh = lw * size[1] / size[0];
  ctx.save();
  if (glow) { ctx.shadowColor = glow; ctx.shadowBlur = lh * 0.15; }
  ctx.drawImage(img, cx - lw / 2, cy - lh / 2, lw, lh);
  ctx.restore();
}
function stillRoundRect(x, y, w, h, r) {
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(x, y, w, h, r); else ctx.rect(x, y, w, h);
}

var STILL_ADS = [
  // ---------------------------------------------------------------- Truck-ee's
  { name: "truckees-billboard", fighter: "Justin Gaethje", draw: function (x, y, w, h, k, ch) {
    // Highway-billboard yellow, red road stripes along the bottom.
    ctx.fillStyle = "#ffd21f"; ctx.fillRect(x, y, w, h);
    ctx.fillStyle = "rgba(255,255,255,0.35)";
    for (var i = -2; i < 14; i++) { ctx.beginPath(); ctx.moveTo(x + i * w / 10, y); ctx.lineTo(x + i * w / 10 + w / 22, y); ctx.lineTo(x + i * w / 10 - h * 0.6 + w / 22, y + h); ctx.lineTo(x + i * w / 10 - h * 0.6, y + h); ctx.closePath(); ctx.fill(); }
    ctx.fillStyle = "#c8102e"; ctx.fillRect(x, y + h * 0.86, w, h * 0.14);
    ctx.fillStyle = "#1b1b1b"; ctx.fillRect(x, y + h * 0.84, w, h * 0.02);
    stillText("NEXT EXIT  •  OPEN 24/7  •  120 PUMPS  •  WORLD-FAMOUS JERKY", x + w / 2, y + h * 0.93, 20 * k, "#ffffff", w * 0.9);
    // The logo on a white badge on the left.
    var bx = x + w * 0.17, by = y + h * 0.43;
    ctx.fillStyle = "#ffffff"; ctx.strokeStyle = "#c8102e"; ctx.lineWidth = 6 * k;
    stillRoundRect(bx - w * 0.14, by - h * 0.36, w * 0.28, h * 0.72, 22 * k); ctx.fill(); ctx.stroke();
    stillLogo(truckeesLogoImg, TRUCKEES_LOGO_SIZE, bx, by, w * 0.25, h * 0.64);
    // Gaethje front and center in his trucker hat, a fist up.
    var hat = ch.gaethje && ch.gaethje.golf && ch.gaethje.golf.hat;
    var look = Object.assign({}, ch.look, hat || {});
    var r = h * 0.28, cx = x + w * 0.44, cy = y + h * 0.52;
    stillFighter(cx, cy, r, look, ch.name);
    drawGlove(ctx, cx + r * 1.08, cy - r * 0.45, r * 0.36, look, "#0b0f12", -Math.PI / 2 - 0.2);
    drawGlove(ctx, cx - r * 1.05, cy + r * 0.45, r * 0.36, look, "#0b0f12", Math.PI * 0.15);
    // The pitch, and a green exit sign.
    var tx = x + w * 0.77, tw = w * 0.4;
    stillText("CLEAN RESTROOMS.", tx, y + h * 0.3, 52 * k, "#1b1b1b", tw);
    stillText("DIRTY FIGHTS.", tx, y + h * 0.53, 62 * k, "#c8102e", tw, { stroke: "#1b1b1b", strokeW: 0.1 });
    var sx = x + w * 0.66, sw = w * 0.22, sy = y + h * 0.65, sh = h * 0.15;
    ctx.fillStyle = "#0b6b3a"; ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 3 * k;
    stillRoundRect(sx, sy, sw, sh, 8 * k); ctx.fill(); ctx.stroke();
    stillText("EXIT 67  →", sx + sw / 2, sy + sh / 2 + k, 26 * k, "#ffffff", sw * 0.85, { face: "'Helvetica Neue', Helvetica, Arial, sans-serif", weight: "700" });
    stillText("FUEL UP", x + w * 0.93, sy + sh / 2, 22 * k, "#1b1b1b", w * 0.09);
  } },

  // ---------------------------------------------------------------- 67'ers
  { name: "niners-tickets", fighter: "Josh Hokit", draw: function (x, y, w, h, k, ch) {
    // Deep team red with gold pinstripes.
    var bg = ctx.createLinearGradient(x, y, x + w, y + h);
    bg.addColorStop(0, "#8a0000"); bg.addColorStop(1, "#4a0000");
    ctx.fillStyle = bg; ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = "rgba(179,153,93,0.25)"; ctx.lineWidth = 2 * k;
    for (var i = 0; i < 40; i++) { ctx.beginPath(); ctx.moveTo(x + i * w / 26, y); ctx.lineTo(x + i * w / 26 - h, y + h); ctx.stroke(); }
    // His trading card on the left, tilted.
    var cw = h * 0.62, chh = h * 0.86, ccx = x + w * 0.13, ccy = y + h * 0.5;
    ctx.save();
    ctx.translate(ccx, ccy); ctx.rotate(-0.07);
    ctx.fillStyle = "rgba(0,0,0,0.4)"; ctx.fillRect(-cw / 2 + 6 * k, -chh / 2 + 6 * k, cw, chh);
    ctx.fillStyle = "#b3995d"; ctx.fillRect(-cw / 2, -chh / 2, cw, chh);
    ctx.fillStyle = "#f4ecd8"; ctx.fillRect(-cw / 2 + 6 * k, -chh / 2 + 6 * k, cw - 12 * k, chh - 12 * k);
    var g = ctx.createLinearGradient(0, -chh * 0.4, 0, chh * 0.2);
    g.addColorStop(0, "#2f7a33"); g.addColorStop(1, "#1f5a23");
    ctx.fillStyle = g; ctx.fillRect(-cw / 2 + 12 * k, -chh / 2 + 12 * k, cw - 24 * k, chh * 0.6);
    var look = Object.assign({}, ch.look, (ch.helmetCharge && ch.helmetCharge.helmet) || {}, { helmetLogo: SF67_LOGO_SRC });
    stillFighter(0, -chh * 0.17, cw * 0.3, look, ch.name);
    ctx.fillStyle = "#aa0000"; ctx.fillRect(-cw / 2 + 12 * k, chh * 0.16, cw - 24 * k, chh * 0.13);
    stillText("JOSH HOKIT", 0, chh * 0.225, 22 * k, "#ffffff", cw * 0.8);
    stillText("#67  •  LB  •  ROOKIE", 0, chh * 0.36, 15 * k, "#5a3a00", cw * 0.8, { face: "'Helvetica Neue', Helvetica, Arial, sans-serif", weight: "800" });
    ctx.restore();
    // A big ticket with the pitch on it.
    var tx = x + w * 0.27, ty = y + h * 0.12, tw = w * 0.56, th = h * 0.76, nr = th * 0.12;
    ctx.save();
    ctx.fillStyle = "#f4ecd8"; ctx.strokeStyle = "#b3995d"; ctx.lineWidth = 4 * k;
    ctx.beginPath();
    ctx.moveTo(tx, ty); ctx.lineTo(tx + tw, ty);
    ctx.lineTo(tx + tw, ty + th / 2 - nr); ctx.arc(tx + tw, ty + th / 2, nr, -Math.PI / 2, Math.PI / 2, true);
    ctx.lineTo(tx + tw, ty + th); ctx.lineTo(tx, ty + th);
    ctx.lineTo(tx, ty + th / 2 + nr); ctx.arc(tx, ty + th / 2, nr, Math.PI / 2, -Math.PI / 2, true);
    ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.setLineDash([8 * k, 6 * k]); ctx.strokeStyle = "#aa0000"; ctx.lineWidth = 2 * k; // the tear-off line
    ctx.beginPath(); ctx.moveTo(tx + tw * 0.78, ty + 8 * k); ctx.lineTo(tx + tw * 0.78, ty + th - 8 * k); ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
    var mx = tx + tw * 0.39, mw = tw * 0.68;
    stillText("SAN FRANCISCO 67'ERS", mx, ty + th * 0.17, 26 * k, "#aa0000", mw);
    stillText("SEASON TICKETS", mx, ty + th * 0.45, 64 * k, "#2a0000", mw);
    stillText("ON SALE NOW", mx, ty + th * 0.72, 34 * k, "#b3995d", mw, { stroke: "#2a0000", strokeW: 0.12 });
    stillText("GAME DAY IS EVERY SUNDAY", mx, ty + th * 0.9, 16 * k, "#5a3a00", mw, { face: "'Helvetica Neue', Helvetica, Arial, sans-serif", weight: "800" });
    var sx = tx + tw * 0.89; // the stub
    stillText("ADMIT", sx, ty + th * 0.2, 20 * k, "#aa0000", tw * 0.18);
    stillText("ONE", sx, ty + th * 0.36, 26 * k, "#aa0000", tw * 0.18);
    stillText("SEC 67", sx, ty + th * 0.62, 15 * k, "#2a0000", tw * 0.18, { face: "'Helvetica Neue', Helvetica, Arial, sans-serif", weight: "800" });
    stillText("ROW H", sx, ty + th * 0.76, 15 * k, "#2a0000", tw * 0.18, { face: "'Helvetica Neue', Helvetica, Arial, sans-serif", weight: "800" });
    // The team logo on the right.
    stillLogo(sf67LogoImg, SF67_LOGO_SIZE, x + w * 0.92, y + h * 0.5, w * 0.13, h * 0.6, "rgba(0,0,0,0.6)");
  } },

  // ---------------------------------------------------------------- Chaels
  { name: "chaels-velvet", fighter: "Dustin Poirier", draw: function (x, y, w, h, k, ch) {
    // Black velvet under a soft spotlight, a thin gold frame.
    ctx.fillStyle = "#07070a"; ctx.fillRect(x, y, w, h);
    var sp = ctx.createRadialGradient(x + w * 0.42, y + h * 0.35, h * 0.05, x + w * 0.42, y + h * 0.5, w * 0.45);
    sp.addColorStop(0, "rgba(120,150,170,0.35)"); sp.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = sp; ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = "#c9a85a"; ctx.lineWidth = 2 * k; ctx.strokeRect(x + 10 * k, y + 10 * k, w - 20 * k, h - 20 * k);
    ctx.strokeStyle = "rgba(201,168,90,0.45)"; ctx.lineWidth = 1; ctx.strokeRect(x + 15 * k, y + 15 * k, w - 30 * k, h - 30 * k);
    // Dustin in his diamond armor, posed like a model on the left.
    var r = h * 0.32, cx = x + w * 0.13, cy = y + h * 0.5;
    ctx.save();
    ctx.translate(cx, cy); ctx.rotate(0.08); ctx.translate(-cx, -cy);
    stillFighter(cx, cy, r, ch.look, ch.name);
    if (typeof diamondArmorImage === "function") { var im = diamondArmorImage(r); ctx.drawImage(im.cv, cx - im.half, cy - im.half, im.half * 2, im.half * 2); }
    ctx.restore();
    // The open ring box in the spotlight.
    var bx = x + w * 0.4, by = y + h * 0.62, bw = h * 0.5, bh = h * 0.24;
    ctx.fillStyle = "#3a0a14"; ctx.strokeStyle = "#1a0408"; ctx.lineWidth = 2 * k;
    stillRoundRect(bx - bw / 2, by - bh * 1.7, bw, bh * 1.35, 10 * k); ctx.fill(); ctx.stroke(); // lid, flipped open
    ctx.fillStyle = "#5a1020"; stillRoundRect(bx - bw * 0.42, by - bh * 1.6, bw * 0.84, bh, 8 * k); ctx.fill(); // lid lining
    ctx.fillStyle = "#4a0d18"; stillRoundRect(bx - bw / 2, by - bh * 0.4, bw, bh * 1.2, 10 * k); ctx.fill(); ctx.stroke(); // base
    ctx.fillStyle = "#2a050c"; ctx.beginPath(); ctx.ellipse(bx, by - bh * 0.32, bw * 0.3, bh * 0.16, 0, 0, Math.PI * 2); ctx.fill(); // slot
    ctx.strokeStyle = "#e3c26a"; ctx.lineWidth = 6 * k; // the band
    ctx.beginPath(); ctx.ellipse(bx, by - bh * 0.62, bw * 0.17, bh * 0.42, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = "#fff3c4"; ctx.lineWidth = 1.5 * k;
    ctx.beginPath(); ctx.ellipse(bx, by - bh * 0.62, bw * 0.17, bh * 0.42, 0, Math.PI * 1.1, Math.PI * 1.5); ctx.stroke();
    if (typeof drawDiamondGem === "function") drawDiamondGem(bx, by - bh * 1.12, 20 * k);
    ctx.strokeStyle = "rgba(255,255,255,0.85)"; ctx.lineWidth = 1.5 * k; // a sparkle
    var gx = bx + bw * 0.16, gy = by - bh * 1.35, gs = 12 * k;
    ctx.beginPath(); ctx.moveTo(gx - gs, gy); ctx.lineTo(gx + gs, gy); ctx.moveTo(gx, gy - gs); ctx.lineTo(gx, gy + gs); ctx.stroke();
    // The copy, set like a jewelry ad.
    var tx = x + w * 0.74, tw = w * 0.42;
    stillLogo(chaelsLogoImg, CHAELS_LOGO_SIZE, tx, y + h * 0.24, tw * 0.75, h * 0.2, "rgba(201,168,90,0.6)");
    ctx.fillStyle = "#c9a85a"; ctx.fillRect(tx - tw * 0.25, y + h * 0.39, tw * 0.5, Math.max(1, 1.5 * k));
    stillText("The Diamond Standard.", tx, y + h * 0.52, 40 * k, "#f3ead2", tw, { face: "Georgia, 'Times New Roman', serif", weight: "italic 600" });
    stillText("DUSTIN “THE DIAMOND” POIRIER WEARS CHAELS", tx, y + h * 0.67, 15 * k, "#c9a85a", tw, { face: "Georgia, 'Times New Roman', serif", weight: "600" });
    stillText("Ask about our Diamond Guard protection plan.", tx, y + h * 0.8, 15 * k, "#b8b2a6", tw, { face: "Georgia, 'Times New Roman', serif", weight: "italic 400" });
  } },

  // ---------------------------------------------------------------- Poorbet
  { name: "poorbet-slip", draw: function (x, y, w, h, k) {
    // A green poker-table felt.
    var felt = ctx.createRadialGradient(x + w * 0.5, y + h * 0.5, h * 0.2, x + w * 0.5, y + h * 0.5, w * 0.6);
    felt.addColorStop(0, "#1f7a45"); felt.addColorStop(1, "#0b3a20");
    ctx.fillStyle = felt; ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = "rgba(255,230,160,0.35)"; ctx.lineWidth = 2 * k;
    ctx.beginPath(); ctx.ellipse(x + w * 0.5, y + h * 1.6, w * 0.62, h * 1.25, 0, Math.PI * 1.08, Math.PI * 1.92); ctx.stroke();
    // The logo in black on a cream card on the left.
    var lx = x + w * 0.16, ly = y + h * 0.5, cw = w * 0.27, chh = h * 0.78;
    ctx.save();
    ctx.translate(lx, ly); ctx.rotate(-0.04);
    ctx.fillStyle = "rgba(0,0,0,0.35)"; stillRoundRect(-cw / 2 + 5 * k, -chh / 2 + 5 * k, cw, chh, 14 * k); ctx.fill();
    ctx.fillStyle = "#f6f0e2"; stillRoundRect(-cw / 2, -chh / 2, cw, chh, 14 * k); ctx.fill();
    ctx.strokeStyle = "#111111"; ctx.lineWidth = 2 * k; stillRoundRect(-cw / 2 + 7 * k, -chh / 2 + 7 * k, cw - 14 * k, chh - 14 * k, 9 * k); ctx.stroke();
    var logo = stillTintedLogo(poorbetLogoImg, "#111111");
    if (logo) { var lw = cw * 0.86, lh = lw * POORBET_LOGO_SIZE[1] / POORBET_LOGO_SIZE[0]; ctx.drawImage(logo, -lw / 2, -lh / 2 - chh * 0.06, lw, lh); }
    stillText("SPORTSBOOK", 0, chh * 0.36, 16 * k, "#111111", cw * 0.7, { face: "'Helvetica Neue', Helvetica, Arial, sans-serif", weight: "800" });
    ctx.restore();
    // The bet slip in the middle, stamped LOST.
    var sx = x + w * 0.31, sy = y + h * 0.09, sw = w * 0.3, sh = h * 0.82;
    ctx.save();
    ctx.translate(sx + sw / 2, sy + sh / 2); ctx.rotate(0.03); ctx.translate(-sx - sw / 2, -sy - sh / 2);
    ctx.fillStyle = "rgba(0,0,0,0.35)"; ctx.fillRect(sx + 5 * k, sy + 5 * k, sw, sh);
    ctx.fillStyle = "#ffffff"; ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(sx + sw, sy);
    for (var z = 0; z <= 12; z++) ctx.lineTo(sx + sw - z * sw / 12, sy + sh - (z % 2 ? 7 * k : 0)); // torn bottom
    ctx.closePath(); ctx.fill();
    var mono = "'Courier New', Courier, monospace", ix = sx + 12 * k, rx = sx + sw - 12 * k, row = sh * 0.105;
    stillText("POORBET BET SLIP #000000", sx + sw / 2, sy + row * 0.8, 15 * k, "#111111", sw * 0.9, { face: mono, weight: "700" });
    ctx.fillStyle = "#111111"; ctx.fillRect(ix, sy + row * 1.35, sw - 24 * k, 1.5 * k);
    [["PICK", "\"MY GUY\""], ["WAGER", "RENT MONEY"], ["AMOUNT", "$1,200.00"], ["ODDS", "LOL"], ["PAYOUT", "$0.00"]].forEach(function (r, i) {
      var ry = sy + row * (2.0 + i);
      stillText(r[0], ix, ry, 15 * k, "#444444", sw * 0.4, { face: mono, weight: "700", align: "left" });
      stillText(r[1], rx, ry, 15 * k, i === 4 ? "#c62828" : "#111111", sw * 0.5, { face: mono, weight: "700", align: "right" });
    });
    ctx.fillStyle = "#111111"; ctx.fillRect(ix, sy + row * 6.6, sw - 24 * k, 1.5 * k);
    stillText("THANK YOU FOR YOUR DONATION", sx + sw / 2, sy + row * 7.3, 13 * k, "#111111", sw * 0.9, { face: mono, weight: "700" });
    for (var bc = 0; bc < 34; bc++) { ctx.fillRect(sx + sw * 0.15 + bc * sw * 0.7 / 34, sy + row * 7.85, (bc % 3 ? 1.2 : 2.6) * k, row * 0.8); } // barcode
    ctx.save(); // the LOST stamp
    ctx.translate(sx + sw * 0.3, sy + sh * 0.47); ctx.rotate(-0.28);
    ctx.globalAlpha *= 0.85;
    ctx.strokeStyle = "#d32f2f"; ctx.lineWidth = 5 * k; stillRoundRect(-sw * 0.25, -sh * 0.11, sw * 0.5, sh * 0.22, 8 * k); ctx.stroke();
    stillText("LOST", 0, 2 * k, 48 * k, "#d32f2f", sw * 0.42);
    ctx.restore();
    ctx.restore();
    // The pitch on the right.
    var tx = x + w * 0.81, tw = w * 0.34;
    stillText("THE ONLY SURE BET", tx, y + h * 0.24, 40 * k, "#ffffff", tw, { stroke: "#06210f", strokeW: 0.14 });
    stillText("IS NOT BETTING.", tx, y + h * 0.45, 48 * k, "#ffd54a", tw, { stroke: "#06210f", strokeW: 0.14 });
    stillText("Gambling is throwing your money away.", tx, y + h * 0.65, 17 * k, "#e8f3ea", tw, { face: "'Helvetica Neue', Helvetica, Arial, sans-serif", weight: "700" });
    ctx.fillStyle = "rgba(0,0,0,0.45)"; stillRoundRect(tx - tw / 2, y + h * 0.75, tw, h * 0.13, 8 * k); ctx.fill();
    stillText("Gambling problem? Call 1-800-GAMBLER", tx, y + h * 0.815, 15 * k, "#ffffff", tw * 0.92, { face: "'Helvetica Neue', Helvetica, Arial, sans-serif", weight: "700" });
    stillText("*Poorbet is a parody. Losses happen here.", tx, y + h * 0.94, 11 * k, "rgba(255,255,255,0.7)", tw, { face: "'Helvetica Neue', Helvetica, Arial, sans-serif", weight: "600" });
  } },

  // ---------------------------------------------------------------- Dagestan World
  // (Joe, 2026-11-06) An amusement park ad: Khabib riding a roller coaster,
  // arms up, having the time of his life. "2-3 week vacation and forget."
  { name: "dagestan-world", fighter: "Khabib Nurmagomedov", draw: function (x, y, w, h, k, ch) { drawDagestanWorld(x, y, w, h, k, ch); } },

  // ---------------------------------------------------------------- GANE-PROOF
  // A boxed safety kit, with the ref napping in the gear (gane-babyproof-ad.js).
  { name: "ganeproof-kit", fighter: "Ciryl Gane", draw: function (x, y, w, h, k) { drawGaneProofStill(x, y, w, h, k); } },

  // ---------------------------------------------------------------- Who's Joe & Arman T?
  // Ilia's cologne ad -> a magazine page: a black-and-white photo of him
  // with only the rose in color, and the bottle on blush satin (cologne-ad.js).
  { name: "cologne-rose", fighter: "Ilia Topuria", draw: function (x, y, w, h, k, ch) { drawCologneStill(x, y, w, h, k, ch); } },

  // ---------------------------------------------------------------- GoatGoatGo
  // The search engine's orange poster, with Jon and his duck (goatgoatgo-ad.js).
  { name: "goatgoatgo-poster", fighter: "Jon Jones", draw: function (x, y, w, h, k, ch) { drawGoatGoatGoStill(x, y, w, h, k, ch); } }
];
