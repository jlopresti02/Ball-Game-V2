// Jumbotron ads, and the Truck-ee's ad.
//
// Ads on the jumbotron never overlap: if one comes up while another is on
// (or while Herb Dean's announcement is up), it waits and plays, sound and
// all, as soon as the first one finishes. Dustin's Diamond Guard show
// (diamond.js) and Gaethje's Truck-ee's ad both go through queueJumboAd.
//
// The Truck-ee's ad (a Buc-ee's parody) plays when Gaethje lands from the
// eagle in golf mode: him as the everyday American hero, club on his
// shoulder in his TRUCK-EE'S trucker hat, his red pickup parked behind him,
// the flag waving, an eagle overhead, and a cut of Joe's song.
// ---------------------------------------------------------------
"use strict";

var jumboAds = [], jumboAdLeft = 0; // waiting ads, and time left on the one playing
function resetJumboAds() { jumboAds = []; jumboAdLeft = 0; truckeesShow = 0; }
// `start` sets the ad's show going (and plays its sound); `dur` is how long it runs.
function queueJumboAd(dur, start) {
  if (jumboAdLeft > 0 || (typeof herbShow !== "undefined" && herbShow > 0)) { jumboAds.push({ dur: dur, start: start }); return; }
  jumboAdLeft = dur; start();
}
// Every frame from update().
function tickJumboAds(dt) {
  if (truckeesShow > 0) truckeesShow = Math.max(0, truckeesShow - dt);
  if (jumboAdLeft > 0) jumboAdLeft = Math.max(0, jumboAdLeft - dt);
  if (jumboAdLeft > 0 || !jumboAds.length || (typeof herbShow !== "undefined" && herbShow > 0)) return;
  var next = jumboAds.shift();
  jumboAdLeft = next.dur; next.start();
}

var TRUCKEES_SHOW = 6.0; // as long as the song cut
var truckeesShow = 0, truckeesId = 0;
var truckeesLogoImg = new Image(), truckeesTruckImg = new Image();
truckeesLogoImg.src = TRUCKEES_LOGO_SRC; truckeesTruckImg.src = TRUCKEES_TRUCK_SRC;
function startTruckeesAd(b) {
  queueJumboAd(TRUCKEES_SHOW, function () {
    truckeesShow = TRUCKEES_SHOW; truckeesId = b.id;
    playTruckeesAd();
  });
}

function drawTruckeesJumbo(x, y, w, h) {
  if (truckeesShow <= 0 || !balls || !balls[truckeesId]) return;
  var b = balls[truckeesId], look = b.char.look;
  var t = TRUCKEES_SHOW - truckeesShow, a = Math.min(1, t / 0.25, truckeesShow / 0.3);
  ctx.save();
  ctx.globalAlpha = a;
  ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
  // Sunset over the open road
  var sky = ctx.createLinearGradient(0, y, 0, y + h);
  sky.addColorStop(0, "#14204f"); sky.addColorStop(0.45, "#b8433a"); sky.addColorStop(0.75, "#f2a13b"); sky.addColorStop(1, "#f6cf6a");
  ctx.fillStyle = sky; ctx.fillRect(x, y, w, h);
  // Sun rays turning slowly behind everything
  var sx = x + w * 0.42, sy = y + h * 0.78;
  ctx.save();
  ctx.translate(sx, sy); ctx.rotate(t * 0.15);
  ctx.fillStyle = "rgba(255,240,190,0.16)";
  for (var i = 0; i < 12; i++) {
    ctx.rotate(Math.PI / 6);
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(w, -w * 0.09); ctx.lineTo(w, w * 0.09); ctx.closePath(); ctx.fill();
  }
  ctx.restore();
  ctx.fillStyle = "#ffe9a8"; ctx.beginPath(); ctx.arc(sx, sy, h * 0.2, 0, Math.PI * 2); ctx.fill();
  // The flag waving across the top
  drawTruckeesFlag(x, y, w, h * 0.42, t);
  // The road
  ctx.fillStyle = "#2a2622"; ctx.fillRect(x, y + h * 0.84, w, h * 0.16);
  ctx.fillStyle = "#f2c53d";
  for (var d = -1; d < 9; d++) ctx.fillRect(x + ((d * w / 7 - t * 140) % (w + w / 7) + w + w / 7) % (w + w / 7) - w / 14, y + h * 0.915, w / 18, h * 0.025);
  // His pickup rolling in and parking behind him
  if (truckeesTruckImg.complete && truckeesTruckImg.naturalWidth) {
    var th = h * 0.62, tw = th * TRUCKEES_TRUCK_SIZE[0] / TRUCKEES_TRUCK_SIZE[1];
    var park = x + w * 0.2, roll = Math.min(1, t / 1.1), e = 1 - Math.pow(1 - roll, 3);
    var tx = park + (1 - e) * w * 0.9, bounce = roll < 1 ? Math.sin(t * 40) * h * 0.006 : 0;
    ctx.drawImage(truckeesTruckImg, tx, y + h * 0.96 - th + bounce, tw, th);
  }
  // An eagle soaring across
  var ek = (t / TRUCKEES_SHOW);
  drawEagle(x + w * (1.1 - ek * 1.3), y + h * 0.2 + Math.sin(t * 2) * h * 0.04, Math.PI, h / 420, t * 9, false);
  // Gaethje: the hero shot. Club resting on his shoulder, other fist on his hip.
  if (look) {
    var r = h * 0.29, cx = x + w * 0.14, cy = y + h * 0.6 + Math.sin(t * 2.2) * r * 0.03;
    var pop = Math.min(1, t / 0.35), s = 0.6 + 0.4 * (1 - Math.pow(1 - pop, 3)) + (t < 0.5 ? Math.sin(pop * Math.PI) * 0.12 : 0);
    ctx.save();
    ctx.translate(cx, cy); ctx.scale(s, s); ctx.rotate(-0.06); ctx.translate(-cx, -cy);
    ctx.fillStyle = "rgba(0,0,0,0.3)"; ctx.beginPath(); ctx.ellipse(cx, cy + r * 1.05, r * 1.1, r * 0.2, 0, 0, Math.PI * 2); ctx.fill();
    drawFighterArt(ctx, cx, cy, r, look, "#0b0f12", { layout: "contained", name: b.char.name });
    ctx.lineWidth = 3; ctx.strokeStyle = "#0b0f12"; ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
    // The club propped up on his shoulder, head up in the air
    var gr = r * 0.36, hx = cx + r * 1.0, hy = cy + r * 0.35, ca = -1.05;
    drawClub(hx, hy, ca, r * 2.0);
    drawGlove(ctx, hx, hy, gr, look, "#0b0f12", ca);
    drawGlove(ctx, cx - r * 1.0, cy + r * 0.5, gr, look, "#0b0f12", Math.PI * 0.15); // fist on his hip
    // A glint off the hat
    var gl = (t * 0.8) % 1;
    if (gl < 0.25) {
      var gx = cx - r * 0.3 + gl * 4 * r * 0.6, gy = cy - r * 0.78;
      ctx.fillStyle = "rgba(255,255,255," + (1 - gl * 4) + ")";
      ctx.beginPath(); ctx.moveTo(gx, gy - r * 0.22); ctx.lineTo(gx + r * 0.05, gy); ctx.lineTo(gx, gy + r * 0.22); ctx.lineTo(gx - r * 0.05, gy); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(gx - r * 0.22, gy); ctx.lineTo(gx, gy - r * 0.05); ctx.lineTo(gx + r * 0.22, gy); ctx.lineTo(gx, gy + r * 0.05); ctx.closePath(); ctx.fill();
    }
    ctx.restore();
  }
  // Words and the sponsor
  var lw = h * 0.62 * TRUCKEES_LOGO_SIZE[0] / TRUCKEES_LOGO_SIZE[1], lx = x + w - lw - 16;
  var tx0 = x + w * 0.31, tw0 = lx - tx0 - 10;
  var flash = Math.sin(t * 10) > 0;
  var k = h / 250; // sized for the stadium jumbotron, scaled down for the test-arena banner
  adText("JUSTIN GAETHJE", tx0 + tw0 / 2, y + h * 0.15, 34 * k, ["#fff4c2", "#f2c53d"], tw0);
  adText("EVERYDAY AMERICAN", tx0 + tw0 / 2, y + h * 0.37, 52 * k, ["#ffffff", "#dfe6f5"], tw0);
  adText("HERO", tx0 + tw0 / 2, y + h * 0.63, 84 * k, ["#ffffff", "#ffd2d2"], tw0 * 0.7, 1 + Math.max(0, 0.25 - Math.max(0, t - 0.6)) * 1.2);
  adText("FUEL UP LIKE A HERO", tx0 + tw0 / 2, y + h * 0.91, 22 * k, flash ? ["#ffe066", "#ffb400"] : ["#ffffff", "#e6e6e6"], tw0);
  jtText("SPONSORED BY", lx + lw / 2, y + h * 0.12, Math.max(12, 20 * k), "#ffffff", "center", "#000000", lw);
  if (truckeesLogoImg.complete && truckeesLogoImg.naturalWidth) {
    var lp = Math.min(1, Math.max(0, (t - 0.4) / 0.3)), ls = 0.5 + 0.5 * lp + Math.sin(lp * Math.PI) * 0.15;
    var lh = h * 0.62 * ls, lww = lw * ls;
    ctx.globalAlpha = a * lp;
    ctx.drawImage(truckeesLogoImg, lx + (lw - lww) / 2, y + h * 0.53 - lh / 2, lww, lh);
    ctx.globalAlpha = a;
  }
  ctx.strokeStyle = flash ? "#b22234" : "#ffffff"; ctx.lineWidth = 6; ctx.strokeRect(x + 3, y + 3, w - 6, h - 6);
  ctx.restore();
}
// The ad's big words: heavy black type, slanted like a sports promo, with a
// thick red-white-navy outline and a hard drop shadow so it pops off the
// sunset. `fill` is a top-to-bottom gradient; `pop` scales it (for the HERO slam).
function adText(txt, x, y, size, fill, maxW, pop) {
  ctx.save();
  ctx.translate(x, y); ctx.transform(1, 0, -0.14, 1, 0, 0);
  if (pop && pop !== 1) ctx.scale(pop, pop);
  var face = "Impact, 'Arial Black', 'Helvetica Neue', Helvetica, Arial, sans-serif";
  ctx.font = "900 " + size + "px " + face;
  var tw = ctx.measureText(txt).width, sz = tw > maxW ? size * maxW / tw : size;
  ctx.font = "900 " + sz + "px " + face;
  ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.lineJoin = "round";
  ctx.shadowColor = "rgba(0,0,0,0)";
  ctx.fillStyle = "#0b1433"; ctx.fillText(txt, sz * 0.06, sz * 0.08); // drop shadow
  ctx.lineWidth = sz * 0.3; ctx.strokeStyle = "#0b1433"; ctx.strokeText(txt, 0, 0);
  ctx.lineWidth = sz * 0.17; ctx.strokeStyle = "#b22234"; ctx.strokeText(txt, 0, 0);
  ctx.lineWidth = sz * 0.06; ctx.strokeStyle = "#ffffff"; ctx.strokeText(txt, 0, 0);
  var g = ctx.createLinearGradient(0, -sz / 2, 0, sz / 2);
  g.addColorStop(0, fill[0]); g.addColorStop(1, fill[1]);
  ctx.fillStyle = g; ctx.fillText(txt, 0, 0);
  ctx.restore();
}
// Old Glory rippling: thirteen stripes and a starry canton, faded into the sky.
function drawTruckeesFlag(x, y, w, h, t) {
  ctx.save();
  ctx.globalAlpha *= 0.35;
  var cols = 24, cw = w / cols;
  for (var c = 0; c < cols; c++) {
    var off = Math.sin(t * 3 + c * 0.5) * h * 0.05;
    for (var s = 0; s < 13; s++) {
      ctx.fillStyle = s % 2 ? "#ffffff" : "#b22234";
      ctx.fillRect(x + c * cw, y + off + s * h / 13, cw + 1, h / 13 + 1);
    }
    if (c < cols * 0.4) {
      ctx.fillStyle = "#3c3b6e"; ctx.fillRect(x + c * cw, y + off, cw + 1, h * 7 / 13);
      ctx.fillStyle = "#ffffff";
      for (var k = 0; k < 4; k++) { ctx.beginPath(); ctx.arc(x + c * cw + cw / 2, y + off + (k + 0.6) * h * 7 / 13 / 4.3, Math.min(cw, h) * 0.12, 0, Math.PI * 2); ctx.fill(); }
    }
  }
  ctx.restore();
}
function drawTruckeesBanner() {
  if (truckeesShow <= 0 || stadiumOn()) return;
  drawTruckeesJumbo(10, 10, W - 20, 110);
}
