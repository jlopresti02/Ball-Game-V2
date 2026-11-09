// GANE-PROOF Baby Proofing (Joe, 2026-11-09): the first time Ciryl Gane
// goes into Cheater mode in a fight, the jumbotron (a banner in the test
// arena) runs a baby-proofing ad, to a music-box lullaby with a full
// little arrangement (harp, strings, flute, bass, celesta).
//   - If he pulls the bat or goes for eye pokes, his call for it ("bat" /
//     "poke" line, on his first landed hit) comes first: the ad waits for it
//     to play and finish. If nothing lands, it waits for the ref to wake up
//     (the call can't come after that), so the line never plays over it. It also
//     waits for anyone else who's talking, then goes through queueJumboAd
//     like every ad, so it never overlaps another one and waits out specials.
//   - The model is a referee (in the ref's striped shirt), kitted out
//     against him: safety goggles over his eyes (for the eye pokes) and a
//     pillow strapped behind the head (for the shots to the back of the
//     head), then AND MORE!
//   - Near the end Gane sneaks in from the side for a poke, and his finger
//     goes TINK off the goggles.
"use strict";

var GANE_AD_SHOW = 8.0;
var GANE_AD_DELAY = 0.8;  // after Cheater mode starts, at the soonest
var GANE_AD_WAIT = 12.0;  // failsafe: the ref's nap (5s) always ends well before this
var ganeAdShow = 0, ganeAdIds = null, ganeAdPending = null, ganeAdOut = null;

// From startCheater (cheater.js), every time he goes into Cheater mode.
function ganeAdOnCheater(b) {
  if (!b.char.hasCheater || b.babyAdDone || (typeof galleryDemo !== "undefined" && galleryDemo)) return;
  b.babyAdDone = true;
  ganeAdPending = { t: GANE_AD_DELAY, waited: 0, id: b.id, mode: b.cheater && b.cheater.mode };
}
function resetGaneAd() { ganeAdShow = 0; ganeAdIds = null; ganeAdPending = null; stopGaneAdMusic(); }
// Is someone talking right now (audio.js's talk channel)?
function ganeAdTalking() {
  return typeof audioCtx !== "undefined" && audioCtx && typeof talkEnd !== "undefined" && audioCtx.currentTime < talkEnd + 0.1;
}
// Every frame, from tickAdBreaks (ad-breaks.js).
function tickGaneAd(dt) {
  if (ganeAdShow > 0) ganeAdShow = Math.max(0, ganeAdShow - dt);
  var p = ganeAdPending;
  if (!p || over) return;
  p.t -= dt; p.waited += dt;
  var gane = balls[p.id];
  // His call for this trick: already played (it's once a fight), or not coming.
  var called = p.mode === "bat" ? gane.batCalled : p.mode === "poke" ? gane.pokeCalled : true;
  var callDone = called || !gane.cheater || !gane.alive || p.waited >= GANE_AD_WAIT;
  if (p.t > 0 || !callDone || ganeAdTalking()) return;
  ganeAdPending = null;
  queueJumboAd(GANE_AD_SHOW, function () {
    ganeAdShow = GANE_AD_SHOW; ganeAdIds = { gane: p.id };
    playGaneAdMusic(GANE_AD_SHOW);
  }, gane);
}

function drawGaneAdJumbo(x, y, w, h) {
  if (ganeAdShow <= 0 || !ganeAdIds || !balls) return;
  var gane = balls[ganeAdIds.gane];
  if (!gane) return;
  var t = GANE_AD_SHOW - ganeAdShow, a = Math.min(1, t / 0.3, ganeAdShow / 0.4), k = h / 250;
  ctx.save();
  ctx.globalAlpha = a;
  ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();

  // A soft nursery: pastel sky, polka dots, twinkling stars and a moon.
  var bg = ctx.createLinearGradient(0, y, 0, y + h);
  bg.addColorStop(0, "#cfe8ff"); bg.addColorStop(1, "#fde3ef");
  ctx.fillStyle = bg; ctx.fillRect(x, y, w, h);
  ctx.fillStyle = "rgba(255,255,255,0.55)";
  for (var dx = 0; dx < 26; dx++) for (var dy = 0; dy < 6; dy++) {
    ctx.beginPath(); ctx.arc(x + (dx + (dy % 2) * 0.5) * w / 25, y + (dy + 0.5) * h / 6, 3 * k, 0, Math.PI * 2); ctx.fill();
  }
  for (var s = 0; s < 9; s++) {
    var tw = 0.5 + 0.5 * Math.sin(t * 2.4 + s * 1.9);
    ganeAdStar(x + w * (0.34 + s * 0.08) % (x + w) + (s % 2) * 12 * k, y + h * (0.1 + (s % 3) * 0.07), (5 + (s % 3) * 2) * k, "rgba(255,214,90," + (0.4 + 0.6 * tw) + ")");
  }
  ctx.fillStyle = "#fff5c2"; ctx.beginPath(); ctx.arc(x + w * 0.955, y + h * 0.18, h * 0.08, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#d6eaff"; ctx.beginPath(); ctx.arc(x + w * 0.97, y + h * 0.15, h * 0.075, 0, Math.PI * 2); ctx.fill();

  // The brand on the left: baby blocks, BABY PROOFING, the tagline.
  var bx = x + w * 0.18;
  var letters = "GANE", cols = ["#7cc6fe", "#ffb3c7", "#b5e48c", "#ffd166"];
  var bs = h * 0.24, pop = Math.min(1, t / 0.5);
  for (var i = 0; i < 4; i++) {
    var lp = Math.max(0, Math.min(1, (t - i * 0.12) / 0.35)), bounce = Math.sin(lp * Math.PI) * h * 0.06;
    var cx = bx + (i - 1.5) * bs * 1.08, cy = y + h * 0.22 - bounce;
    ctx.save();
    ctx.translate(cx, cy); ctx.rotate((i % 2 ? 1 : -1) * 0.06); ctx.globalAlpha *= lp;
    ctx.fillStyle = cols[i]; ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 3 * k;
    stillRoundRect(-bs / 2, -bs / 2, bs, bs, 7 * k); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = "rgba(0,0,0,0.12)"; ctx.lineWidth = 2 * k; stillRoundRect(-bs / 2 + 5 * k, -bs / 2 + 5 * k, bs - 10 * k, bs - 10 * k, 5 * k); ctx.stroke();
    stillText(letters[i], 0, 2 * k, bs * 0.72, "#ffffff", bs * 0.8, { face: "'Arial Rounded MT Bold', 'Trebuchet MS', Arial, sans-serif", weight: "900", stroke: "#3b4a6b", strokeW: 0.14 });
    ctx.restore();
  }
  stillText("-PROOF", bx, y + h * 0.43, 34 * k * pop, "#3b4a6b", w * 0.3, { face: "'Arial Rounded MT Bold', 'Trebuchet MS', Arial, sans-serif", weight: "900" });
  stillText("BABY PROOFING", bx, y + h * 0.58, 24 * k, "#ff6f91", w * 0.3, { face: "'Arial Rounded MT Bold', 'Trebuchet MS', Arial, sans-serif", weight: "900", stroke: "#ffffff", strokeW: 0.2 });
  stillText("Protect your little fighter.", bx, y + h * 0.71, 17 * k, "#3b4a6b", w * 0.3, { face: "Georgia, 'Times New Roman', serif", weight: "italic 600" });
  ctx.fillStyle = "rgba(255,255,255,0.75)"; stillRoundRect(bx - w * 0.13, y + h * 0.79, w * 0.26, h * 0.12, 10 * k); ctx.fill();
  stillText("CALL 1-800-NO-POKE", bx, y + h * 0.852, 17 * k, "#3b4a6b", w * 0.24, { face: "'Arial Rounded MT Bold', 'Trebuchet MS', Arial, sans-serif", weight: "900" });

  // The model in the middle, under a slowly turning crib mobile.
  var mx = x + w * 0.5, my = y + h * 0.58, r = h * 0.25;
  ganeAdMobile(mx, y, h, t, k);
  ganeAdModel(mx, my, r, t, k);
  // Gane peeking up from below, left of the model, for a poke at the
  // goggles, and TINK.
  var sneak = Math.max(0, Math.min(1, (t - 5.0) / 0.6)), back = Math.max(0, Math.min(1, (t - 6.5) / 0.5));
  if (sneak > 0) {
    var gr = r * 0.7, gx = mx - r * 1.78;
    var gy = my + r * 0.35 + (1 - easeOut(sneak)) * (y + h - my + gr) + easeOut(back) * (y + h - my + gr);
    drawFighterArt(ctx, gx, gy, gr, gane.char.look, "#0b0f12", { layout: "contained", name: gane.char.name });
    ctx.lineWidth = 2 * k; ctx.strokeStyle = "#0b0f12"; ctx.beginPath(); ctx.arc(gx, gy, gr, 0, Math.PI * 2); ctx.stroke();
    // His poking hand: a glove with one finger out, jabbing at the goggles.
    var tx = mx - r * 0.24, ty = my - r * 0.6, dx = tx - gx, dy = ty - gy, dd = Math.hypot(dx, dy) || 1;
    dx /= dd; dy /= dd;
    var jab = t > 5.55 && t < 6.45 ? Math.max(0, Math.sin((t - 5.55) * 10)) : 0;
    var reach = gr * 1.0 + jab * Math.max(0, dd - gr * 1.0 - gr * 0.62);
    var hx = gx + dx * reach, hy = gy + dy * reach;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#0b0f12"; ctx.lineWidth = gr * 0.17;
    ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(hx + dx * gr * 0.6, hy + dy * gr * 0.6); ctx.stroke();
    ctx.strokeStyle = gane.char.look.skin; ctx.lineWidth = gr * 0.11;
    ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(hx + dx * gr * 0.57, hy + dy * gr * 0.57); ctx.stroke();
    drawGlove(ctx, hx, hy, gr * 0.34, gane.char.look, "#0b0f12", Math.atan2(dy, dx));
    // Sparks off the lens on each poke that lands.
    if (jab > 0.85) {
      ctx.strokeStyle = "#ffd23f"; ctx.lineWidth = 2.5 * k;
      for (var si = 0; si < 6; si++) {
        var sa = si / 6 * Math.PI * 2 + 0.3;
        ctx.beginPath(); ctx.moveTo(tx + Math.cos(sa) * r * 0.12, ty + Math.sin(sa) * r * 0.12); ctx.lineTo(tx + Math.cos(sa) * r * 0.26, ty + Math.sin(sa) * r * 0.26); ctx.stroke();
      }
    }
    if (t > 5.65 && t < 6.8) {
      var tp = (t - 5.65) / 1.15;
      ctx.save(); ctx.globalAlpha *= Math.min(1, (1 - tp) * 3);
      ctx.translate(mx - r * 1.1, my - r * 1.15 - tp * 10 * k); ctx.rotate(-0.15);
      stillText("TINK!", 0, 0, 28 * k * (1 + 0.25 * Math.max(0, 1 - tp * 6)), "#ffe066", w * 0.12, { face: "'Arial Rounded MT Bold', 'Trebuchet MS', Arial, sans-serif", weight: "900", stroke: "#3b4a6b", strokeW: 0.22 });
      ctx.restore();
    }
  }

  // The features, one at a time, then AND MORE!
  var fx = x + w * 0.79, fw = w * 0.36;
  ganeAdFeature(fx, y + h * 0.17, fw, k, t - 1.0, "SAFETY GOGGLES", "for surprise eye pokes");
  ganeAdFeature(fx, y + h * 0.43, fw, k, t - 2.4, "BACK-OF-HEAD PILLOW", "for those \"accidental\" shots");
  var mp = Math.max(0, Math.min(1, (t - 3.8) / 0.35));
  if (mp > 0) {
    ctx.save();
    ctx.translate(fx, y + h * 0.69); ctx.scale(0.4 + 0.6 * mp + Math.sin(mp * Math.PI) * 0.25, 0.4 + 0.6 * mp + Math.sin(mp * Math.PI) * 0.25);
    ctx.rotate(-0.05 + Math.sin(t * 3) * 0.02);
    stillText("AND MORE!", 0, 0, 48 * k, "#ff6f91", fw, { face: "'Arial Rounded MT Bold', 'Trebuchet MS', Arial, sans-serif", weight: "900", stroke: "#ffffff", strokeW: 0.22 });
    ctx.restore();
    ctx.save(); ctx.globalAlpha *= Math.max(0, Math.min(1, (t - 4.3) / 0.4));
    stillText("Corner bumpers • Bat-proof helmets • Cage outlet covers", fx, y + h * 0.86, 13 * k, "#3b4a6b", fw, { face: "'Helvetica Neue', Helvetica, Arial, sans-serif", weight: "800" });
    ctx.restore();
  }
  ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 6 * k; stillRoundRect(x + 4 * k, y + 4 * k, w - 8 * k, h - 8 * k, 14 * k); ctx.stroke();
  ctx.restore();
}

function ganeAdStar(x, y, s, col) {
  ctx.fillStyle = col; ctx.beginPath();
  for (var i = 0; i < 10; i++) { var an = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? s * 0.45 : s; ctx.lineTo(x + Math.cos(an) * rr, y + Math.sin(an) * rr); }
  ctx.closePath(); ctx.fill();
}
// A crib mobile: a little bar with a moon, a star and a cloud swinging round.
function ganeAdMobile(cx, top, h, t, k) {
  var hy = top + h * 0.1;
  ctx.strokeStyle = "#b8c4dc"; ctx.lineWidth = 2 * k;
  ctx.beginPath(); ctx.moveTo(cx, top); ctx.lineTo(cx, hy); ctx.stroke();
  var spin = t * 0.9;
  [["moon", 0], ["star", 2.1], ["cloud", 4.2]].forEach(function (it) {
    var an = spin + it[1], ox = Math.cos(an) * h * 0.22, depth = 0.75 + 0.25 * Math.sin(an);
    var ix = cx + ox, iy = hy + h * 0.1;
    ctx.beginPath(); ctx.moveTo(cx + ox * 0.9, hy); ctx.lineTo(ix, iy - 6 * k); ctx.stroke();
    ctx.save(); ctx.globalAlpha *= depth;
    if (it[0] === "star") ganeAdStar(ix, iy, 9 * k * depth, "#ffd166");
    else if (it[0] === "moon") {
      ctx.fillStyle = "#fff1a8"; ctx.beginPath(); ctx.arc(ix, iy, 8 * k * depth, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#cfe8ff"; ctx.beginPath(); ctx.arc(ix + 4 * k, iy - 3 * k, 7 * k * depth, 0, Math.PI * 2); ctx.fill();
    } else {
      ctx.fillStyle = "#ffffff";
      [[0, 0, 7], [7, 2, 5], [-7, 2, 5]].forEach(function (c) { ctx.beginPath(); ctx.arc(ix + c[0] * k, iy + c[1] * k, c[2] * k * depth, 0, Math.PI * 2); ctx.fill(); });
    }
    ctx.restore();
  });
  ctx.strokeStyle = "#b8c4dc"; ctx.lineWidth = 3 * k;
  ctx.beginPath(); ctx.ellipse(cx, hy, h * 0.22, h * 0.03, 0, 0, Math.PI * 2); ctx.stroke();
}
// The model: a referee (the ring ref's look, striped shirt, REF patch and
// whistle), in a puffy pillow strapped behind the head and big safety
// goggles right over his eyes.
var GANE_AD_REF = null;
function ganeAdRefFan() {
  if (typeof referee !== "undefined" && referee && referee.fan) return referee.fan;
  if (!GANE_AD_REF) {
    var look = defaultLook();
    look.skin = "#c99172"; look.hair = "bald"; look.beard = "none"; look.build = "lean";
    GANE_AD_REF = { look: look, shirt: "#151515", style: "tee", team: null, shirtless: false, cap: null, phase: 0 };
  }
  return GANE_AD_REF;
}
function ganeAdModel(cx, cy, r, t, k) {
  var bob = Math.sin(t * 1.6) * r * 0.03, fan = ganeAdRefFan(), skin = fan.look.skin;
  cy += bob;
  var eyeY = cy - r * 0.6, strapY = cy - r * 0.86;
  // The pillow peeking out behind the head.
  var pw = r * 2.75, ph = r * 1.15, py = cy - r * 0.6;
  ctx.save();
  ctx.translate(cx, py); ctx.rotate(Math.sin(t * 1.6) * 0.03);
  var pg = ctx.createLinearGradient(0, -ph / 2, 0, ph / 2);
  pg.addColorStop(0, "#fff3c4"); pg.addColorStop(1, "#ffd98a");
  ctx.fillStyle = pg; ctx.strokeStyle = "#c98f2e"; ctx.lineWidth = 2 * k;
  ctx.beginPath();
  ctx.moveTo(-pw / 2, -ph * 0.3);
  ctx.quadraticCurveTo(-pw / 2 - r * 0.12, -ph / 2 - r * 0.1, -pw * 0.3, -ph / 2);
  ctx.quadraticCurveTo(0, -ph / 2 - r * 0.15, pw * 0.3, -ph / 2);
  ctx.quadraticCurveTo(pw / 2 + r * 0.12, -ph / 2 - r * 0.1, pw / 2, -ph * 0.3);
  ctx.quadraticCurveTo(pw / 2 + r * 0.1, 0, pw / 2, ph * 0.3);
  ctx.quadraticCurveTo(pw / 2 + r * 0.12, ph / 2 + r * 0.1, pw * 0.3, ph / 2);
  ctx.quadraticCurveTo(0, ph / 2 + r * 0.12, -pw * 0.3, ph / 2);
  ctx.quadraticCurveTo(-pw / 2 - r * 0.12, ph / 2 + r * 0.1, -pw / 2, ph * 0.3);
  ctx.quadraticCurveTo(-pw / 2 - r * 0.1, 0, -pw / 2, -ph * 0.3);
  ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.setLineDash([3 * k, 3 * k]); ctx.strokeStyle = "#e0ad55";
  stillRoundRect(-pw * 0.44, -ph * 0.38, pw * 0.88, ph * 0.76, r * 0.2); ctx.stroke(); ctx.setLineDash([]);
  // The pillow's strap, running across it to the head.
  ctx.fillStyle = "#7cc6fe";
  ctx.fillRect(-pw / 2 - r * 0.04, strapY - py - r * 0.065, pw + r * 0.08, r * 0.13);
  ctx.restore();
  // The ref.
  ctx.fillStyle = "rgba(59,74,107,0.18)"; ctx.beginPath(); ctx.ellipse(cx, cy + r * 1.05, r * 0.9, r * 0.14, 0, 0, Math.PI * 2); ctx.fill();
  ctx.save();
  ctx.translate(cx, cy);
  drawFanBall(ctx, r, fan);
  drawRefStripes(r);
  ctx.fillStyle = "#ffffff"; ctx.strokeStyle = "#0b0f12"; ctx.lineWidth = 1.5 * k;
  stillRoundRect(-r * 0.42, r * 0.2, r * 0.84, r * 0.4, r * 0.08); ctx.fill(); ctx.stroke();
  stillText("REF", 0, r * 0.41, r * 0.34, "#111111", r * 0.76, { face: "Impact, 'Arial Black', sans-serif", weight: "900" });
  ctx.strokeStyle = "#e53935"; ctx.lineWidth = 1.6 * k;
  ctx.beginPath(); ctx.moveTo(-r * 0.32, -r * 0.18); ctx.quadraticCurveTo(-r * 0.05, r * 0.08, r * 0.2, r * 0.02); ctx.stroke();
  ctx.fillStyle = "#c9ccd1"; ctx.strokeStyle = "#0b0f12"; ctx.lineWidth = 1.2 * k;
  stillRoundRect(r * 0.14, -r * 0.04, r * 0.26, r * 0.14, r * 0.05); ctx.fill(); ctx.stroke();
  // Hands: a proud thumbs-up pose, one each side.
  [-1, 1].forEach(function (s) {
    ctx.fillStyle = skin; ctx.strokeStyle = "#0b0f12"; ctx.lineWidth = 2 * k;
    ctx.beginPath(); ctx.arc(s * r * 1.02, r * 0.3, r * 0.24, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  });
  ctx.restore();
  // The pillow's strap round the top of his head, buckled at the front.
  ctx.save();
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.clip();
  ctx.fillStyle = "#7cc6fe"; ctx.fillRect(cx - r, strapY - r * 0.065, r * 2, r * 0.13);
  ctx.restore();
  ctx.fillStyle = "#ffffff"; ctx.strokeStyle = "#3b4a6b"; ctx.lineWidth = 1.5 * k;
  stillRoundRect(cx - r * 0.1, strapY - r * 0.095, r * 0.2, r * 0.19, r * 0.04); ctx.fill(); ctx.stroke();
  // Safety goggles right over his eyes: a band round the head at eye level
  // and two big lenses.
  ctx.save();
  ctx.beginPath(); ctx.arc(cx, cy, r * 1.02, 0, Math.PI * 2); ctx.clip();
  ctx.fillStyle = "#3b4a6b"; ctx.fillRect(cx - r * 1.05, eyeY - r * 0.05, r * 2.1, r * 0.1);
  ctx.restore();
  [-1, 1].forEach(function (s) {
    var lx = cx + s * r * 0.26, ly = eyeY;
    ctx.fillStyle = "#3b4a6b"; stillRoundRect(lx - r * 0.25, ly - r * 0.17, r * 0.5, r * 0.34, r * 0.13); ctx.fill();
    var lg = ctx.createLinearGradient(lx - r * 0.2, ly - r * 0.12, lx + r * 0.2, ly + r * 0.12);
    lg.addColorStop(0, "rgba(220,240,255,0.92)"); lg.addColorStop(1, "rgba(120,190,255,0.6)");
    ctx.fillStyle = lg; stillRoundRect(lx - r * 0.2, ly - r * 0.12, r * 0.4, r * 0.24, r * 0.09); ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.9)"; ctx.lineWidth = 2 * k; // glint
    ctx.beginPath(); ctx.moveTo(lx - r * 0.12, ly - r * 0.04); ctx.lineTo(lx - r * 0.03, ly - r * 0.08); ctx.stroke();
  });
  ctx.fillStyle = "#3b4a6b"; ctx.fillRect(cx - r * 0.06, eyeY - r * 0.04, r * 0.12, r * 0.08); // the bridge
}

function ganeAdFeature(x, y, w, k, t, name, sub) {
  if (t <= 0) return;
  var p = Math.min(1, t / 0.35);
  ctx.save();
  ctx.globalAlpha *= p;
  ctx.translate((1 - easeOut(p)) * 30 * k, 0);
  ctx.fillStyle = "rgba(255,255,255,0.8)"; stillRoundRect(x - w / 2, y - 26 * k, w, 52 * k, 14 * k); ctx.fill();
  ctx.fillStyle = "#5cc98b"; ctx.beginPath(); ctx.arc(x - w / 2 + 26 * k, y, 15 * k, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 3.5 * k; ctx.lineCap = "round";
  ctx.beginPath(); ctx.moveTo(x - w / 2 + 19 * k, y + 1 * k); ctx.lineTo(x - w / 2 + 24 * k, y + 6 * k); ctx.lineTo(x - w / 2 + 33 * k, y - 6 * k); ctx.stroke();
  var tx = x - w / 2 + 50 * k, tw = w - 60 * k;
  stillText(name, tx, y - 8 * k, 22 * k, "#3b4a6b", tw, { face: "'Arial Rounded MT Bold', 'Trebuchet MS', Arial, sans-serif", weight: "900", align: "left" });
  stillText(sub, tx, y + 13 * k, 14 * k, "#6b7a99", tw, { face: "Georgia, 'Times New Roman', serif", weight: "italic 600", align: "left" });
  ctx.restore();
}

// ---------------------------------------------------------------- still version
// The still, silent second version (in the still-ad rotation, still-ads.js):
// the GANE-PROOF Safety Kit in its box, a REF APPROVED sticker, and the ref
// fast asleep in the gear. FOR WHEN THE REF IS NAPPING.
function drawGaneProofStill(x, y, w, h, k) {
  var round = "'Arial Rounded MT Bold', 'Trebuchet MS', Arial, sans-serif";
  // Soft mint with candy stripes.
  var bg = ctx.createLinearGradient(x, y, x + w, y + h);
  bg.addColorStop(0, "#d9f5ec"); bg.addColorStop(1, "#fdf1d6");
  ctx.fillStyle = bg; ctx.fillRect(x, y, w, h);
  ctx.save();
  ctx.globalAlpha *= 0.35; ctx.fillStyle = "#ffffff";
  for (var sx = x - h; sx < x + w; sx += 46 * k) {
    ctx.beginPath(); ctx.moveTo(sx, y + h); ctx.lineTo(sx + 20 * k, y + h); ctx.lineTo(sx + 20 * k + h, y); ctx.lineTo(sx + h, y); ctx.closePath(); ctx.fill();
  }
  ctx.restore();

  // The product box, standing a little tilted.
  var bx = x + w * 0.17, by = y + h * 0.53, bw = w * 0.25, bh = h * 0.84;
  ctx.save();
  ctx.translate(bx, by); ctx.rotate(-0.04);
  ctx.fillStyle = "rgba(59,74,107,0.2)"; stillRoundRect(-bw / 2 + 6 * k, -bh / 2 + 7 * k, bw, bh, 12 * k); ctx.fill();
  ctx.fillStyle = "#8fd3ff"; ctx.strokeStyle = "#3b4a6b"; ctx.lineWidth = 2.5 * k;
  stillRoundRect(-bw / 2, -bh / 2, bw, bh, 12 * k); ctx.fill(); ctx.stroke();
  ctx.fillStyle = "#ffffff"; stillRoundRect(-bw / 2 + 6 * k, -bh / 2 + 6 * k, bw - 12 * k, bh * 0.25, 8 * k); ctx.fill();
  // Header: the block letters and the product name.
  var letters = ["G", "A", "N", "E"], cols = ["#7cc6fe", "#ff9ec4", "#9be37c", "#ffd36b"], bs = bh * 0.13;
  for (var i = 0; i < 4; i++) {
    var lx = -bs * 1.6 + i * bs * 1.07, ly = -bh / 2 + bh * 0.1;
    ctx.fillStyle = cols[i]; ctx.strokeStyle = "#3b4a6b"; ctx.lineWidth = 1.5 * k;
    stillRoundRect(lx - bs / 2, ly - bs / 2, bs, bs, 4 * k); ctx.fill(); ctx.stroke();
    stillText(letters[i], lx, ly + 1 * k, bs * 0.7, "#ffffff", bs * 0.8, { face: round, weight: "900", stroke: "#3b4a6b", strokeW: 0.14 });
  }
  stillText("-PROOF SAFETY KIT", 0, -bh / 2 + bh * 0.22, 15 * k, "#3b4a6b", bw * 0.86, { face: round, weight: "900" });
  // The clear window with the goggles and the head pillow inside.
  var wy = -bh * 0.015, ww = bw * 0.82, wh = bh * 0.37;
  ctx.fillStyle = "#eaf6ff"; ctx.strokeStyle = "#3b4a6b"; ctx.lineWidth = 2 * k;
  stillRoundRect(-ww / 2, wy - wh / 2, ww, wh, 10 * k); ctx.fill(); ctx.stroke();
  ganeProofPillow(0, wy + wh * 0.18, ww * 0.6, wh * 0.36, k);
  ganeProofGoggles(0, wy - wh * 0.17, ww * 0.34, k);
  ctx.save(); ctx.globalAlpha *= 0.55; ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 3 * k; // shine on the plastic
  ctx.beginPath(); ctx.moveTo(-ww * 0.38, wy - wh * 0.25); ctx.lineTo(-ww * 0.2, wy - wh * 0.42); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-ww * 0.38, wy - wh * 0.08); ctx.lineTo(-ww * 0.08, wy - wh * 0.42); ctx.stroke();
  ctx.restore();
  // Footer.
  stillText("POKE-RESISTANT • BACK-OF-HEAD PADDED", 0, bh * 0.25, 9 * k, "#3b4a6b", bw * 0.86, { face: round, weight: "900" });
  ctx.fillStyle = "#3b4a6b"; stillRoundRect(-bw / 2 + 6 * k, bh * 0.32, bw - 12 * k, bh * 0.13, 6 * k); ctx.fill();
  stillText("AGES: ALL FIGHTERS", 0, bh * 0.385, 12 * k, "#ffffff", bw * 0.8, { face: round, weight: "900" });
  ctx.restore();
  // REF APPROVED sticker on the box's corner.
  var stx = bx + bw * 0.45, sty = y + h * 0.2, sr = h * 0.13;
  ctx.save(); ctx.translate(stx, sty); ctx.rotate(0.25);
  ctx.fillStyle = "#ff6f91"; ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 2 * k;
  ctx.beginPath();
  for (var p = 0; p < 24; p++) { var pa = p / 24 * Math.PI * 2, pr = p % 2 ? sr * 0.84 : sr; ctx.lineTo(Math.cos(pa) * pr, Math.sin(pa) * pr); }
  ctx.closePath(); ctx.fill(); ctx.stroke();
  stillText("REF", 0, -sr * 0.22, sr * 0.55, "#ffffff", sr * 1.3, { face: round, weight: "900" });
  stillText("APPROVED", 0, sr * 0.28, sr * 0.3, "#ffffff", sr * 1.4, { face: round, weight: "900" });
  ctx.restore();

  // The copy.
  var tx = x + w * 0.535, tw = w * 0.32;
  stillText("FOR WHEN THE", tx, y + h * 0.2, 30 * k, "#3b4a6b", tw, { face: round, weight: "900" });
  stillText("REF IS NAPPING.", tx, y + h * 0.38, 42 * k, "#ff6f91", tw, { face: round, weight: "900", stroke: "#ffffff", strokeW: 0.18 });
  ctx.fillStyle = "#3b4a6b"; ctx.fillRect(tx - tw * 0.3, y + h * 0.5, tw * 0.6, Math.max(1, 2 * k));
  stillText("Safety goggles • Head pillow • Corner bumpers", tx, y + h * 0.6, 14 * k, "#3b4a6b", tw, { face: "Georgia, 'Times New Roman', serif", weight: "italic 600" });
  stillText("AND MORE!", tx, y + h * 0.73, 22 * k, "#ff6f91", tw, { face: round, weight: "900" });
  ctx.fillStyle = "rgba(255,255,255,0.8)"; stillRoundRect(tx - tw * 0.36, y + h * 0.81, tw * 0.72, h * 0.12, 10 * k); ctx.fill();
  stillText("GANE-PROOF  •  CALL 1-800-NO-POKE", tx, y + h * 0.872, 14 * k, "#3b4a6b", tw * 0.68, { face: round, weight: "900" });

  // The ref, fast asleep in the gear, Zs floating up.
  var rx = x + w * 0.83, ry = y + h * 0.6, rr = h * 0.25;
  ctx.save();
  ctx.translate(rx, ry); ctx.rotate(0.28); ctx.translate(-rx, -ry);
  ganeAdModel(rx, ry, rr, 0, k);
  ctx.restore();
  [[1.05, -1.1, 15], [1.45, -1.45, 20], [1.9, -1.8, 27]].forEach(function (z) {
    stillText("Z", rx + rr * z[0], ry + rr * z[1], z[2] * k, "#ffffff", 60 * k, { face: round, weight: "900", stroke: "#3b4a6b", strokeW: 0.25 });
  });
  ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 3 * k; stillRoundRect(x + 4 * k, y + 4 * k, w - 8 * k, h - 8 * k, 14 * k); ctx.stroke();
}
function ganeProofGoggles(cx, cy, gw, k) {
  ctx.fillStyle = "#3b4a6b"; ctx.fillRect(cx - gw * 0.95, cy - gw * 0.05, gw * 1.9, gw * 0.1);
  [-1, 1].forEach(function (s) {
    var lx = cx + s * gw * 0.3;
    ctx.fillStyle = "#3b4a6b"; stillRoundRect(lx - gw * 0.28, cy - gw * 0.2, gw * 0.56, gw * 0.4, gw * 0.14); ctx.fill();
    var lg = ctx.createLinearGradient(lx - gw * 0.2, cy - gw * 0.14, lx + gw * 0.2, cy + gw * 0.14);
    lg.addColorStop(0, "rgba(220,240,255,0.95)"); lg.addColorStop(1, "rgba(120,190,255,0.7)");
    ctx.fillStyle = lg; stillRoundRect(lx - gw * 0.22, cy - gw * 0.14, gw * 0.44, gw * 0.28, gw * 0.1); ctx.fill();
    ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 2 * k;
    ctx.beginPath(); ctx.moveTo(lx - gw * 0.13, cy - gw * 0.04); ctx.lineTo(lx - gw * 0.03, cy - gw * 0.09); ctx.stroke();
  });
}
function ganeProofPillow(cx, cy, pw, ph, k) {
  var pg = ctx.createLinearGradient(0, cy - ph / 2, 0, cy + ph / 2);
  pg.addColorStop(0, "#fff3c4"); pg.addColorStop(1, "#ffd98a");
  ctx.fillStyle = pg; ctx.strokeStyle = "#c98f2e"; ctx.lineWidth = 2 * k;
  stillRoundRect(cx - pw / 2, cy - ph / 2, pw, ph, ph * 0.4); ctx.fill(); ctx.stroke();
  ctx.fillStyle = "#7cc6fe"; ctx.fillRect(cx - pw / 2 - 4 * k, cy - ph * 0.1, pw + 8 * k, ph * 0.2);
  ctx.fillStyle = "#ffffff"; ctx.strokeStyle = "#3b4a6b"; ctx.lineWidth = 1.2 * k;
  stillRoundRect(cx - ph * 0.14, cy - ph * 0.16, ph * 0.28, ph * 0.32, 2 * k); ctx.fill(); ctx.stroke();
}

function drawGaneAdBanner() {
  if (ganeAdShow <= 0 || stadiumOn()) return;
  drawGaneAdJumbo(10, 10, W - 20, 110);
}

// ---------------------------------------------------------------- the lullaby

// Brahms' Lullaby (public domain) on a music box: soft bell tones with a
// little shimmer, and a quiet bass note on each bar. The background music
// dips under it.
var GANE_LULLABY = [
  // [note (semitones from C5), beats]
  [-8, 0.5], [-8, 0.5], [-5, 1.5], [-8, 0.5], [-8, 0.5], [-5, 2],
  [-8, 0.5], [-5, 0.5], [0, 1], [-1, 1.5], [-3, 0.5], [-3, 1], [-5, 1],
  [-10, 0.5], [-8, 0.5], [-7, 1], [-10, 1], [-10, 0.5], [-8, 0.5], [-7, 2],
  [-10, 0.5], [-7, 0.5], [-1, 0.5], [-3, 0.5], [-5, 1], [-1, 1], [0, 2]
];
function playGaneAdMusic(dur) {
  try {
    var ac = getAudioCtx();
    if (!ac) return;
    if (ac.state === "suspended") ac.resume();
    stopGaneAdMusic();
    var out = ganeAdOut = ac.createGain(), now = ac.currentTime + 0.05, beat = 0.504;
    out.gain.setValueAtTime(0.0001, now); out.gain.exponentialRampToValueAtTime(0.65, now + 0.3);
    out.gain.setValueAtTime(0.65, now + dur - 0.6); out.gain.exponentialRampToValueAtTime(0.0001, now + dur);
    out.connect(ac.destination);
    if (typeof duckMusic === "function") duckMusic(now, now + dur);
    // A full little arrangement under the music-box tune, at the original
    // gentle tempo: a harmony voice under the melody, a soft flute an octave
    // down, harp arpeggios, a warm string pad, a bass, celesta sparkles on
    // the bar lines, and a bit of reverb to tie it together.
    function mf(m) { return 440 * Math.pow(2, (m - 69) / 12); }
    var verb = ac.createConvolver(), ir = ac.createBuffer(2, Math.floor(ac.sampleRate * 2.2), ac.sampleRate);
    for (var chn = 0; chn < 2; chn++) {
      var irD = ir.getChannelData(chn);
      for (var ii = 0; ii < irD.length; ii++) irD[ii] = (Math.random() * 2 - 1) * Math.pow(1 - ii / irD.length, 3);
    }
    verb.buffer = ir;
    var wet = ac.createGain(); wet.gain.value = 0.32; verb.connect(wet); wet.connect(out);
    function voice(type, f, at, len, vol, atk, cutoff, detune) {
      var o = ac.createOscillator(), g = ac.createGain(), dest = g;
      o.type = type; o.frequency.value = f; if (detune) o.detune.value = detune;
      if (cutoff) { var lp = ac.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = cutoff; o.connect(lp); lp.connect(g); } else o.connect(g);
      g.gain.setValueAtTime(0.0001, at); g.gain.exponentialRampToValueAtTime(vol, at + atk);
      g.gain.setValueAtTime(vol, at + Math.max(atk, len * 0.6)); g.gain.exponentialRampToValueAtTime(0.0001, at + len);
      dest.connect(out); dest.connect(verb);
      o.start(at); o.stop(at + len + 0.05);
    }
    function chime(f, at, len, vol) { // bell partials, into the reverb too
      [[1, 1], [2, 0.3], [3.01, 0.1], [4.2, 0.05]].forEach(function (hm) {
        var o = ac.createOscillator(), g = ac.createGain();
        o.type = "sine"; o.frequency.value = f * hm[0];
        g.gain.setValueAtTime(0.0001, at); g.gain.exponentialRampToValueAtTime(vol * hm[1], at + 0.006);
        g.gain.exponentialRampToValueAtTime(0.0001, at + len / hm[0]);
        o.connect(g); g.connect(out); g.connect(verb); o.start(at); o.stop(at + len + 0.05);
      });
    }
    // Chords (MIDI notes) by melody beat: C, then G7, Dm7, G7 and home to C.
    var CH = { C: [48, 60, 64, 67, 72, 76], G7: [43, 59, 62, 65, 67, 71], Dm7: [38, 57, 60, 62, 65, 69] };
    var CHANGES = [[0, "C"], [7.5, "G7"], [11.5, "Dm7"], [14.5, "G7"], [22.5, "C"]];
    function chordAt(bt) { var c = "C"; CHANGES.forEach(function (x) { if (bt >= x[0] - 0.01) c = x[1]; }); return CH[c]; }
    var end = now + dur - 0.3, bt = 0;
    // Melody (music box), its flute double and a harmony voice under it.
    GANE_LULLABY.forEach(function (n) {
      var at = now + bt * beat;
      if (at >= end) return;
      var m = 72 + n[0], len = n[1] * beat;
      chime(mf(m + 12), at, 1.8, 0.16);
      voice("sine", mf(m), at, Math.max(0.25, len * 0.95), 0.05, 0.05);
      // The nearest chord tone 3-9 semitones under the melody.
      var ch = chordAt(bt), under = null;
      for (var d = 3; d <= 9 && under === null; d++) if (ch.some(function (c) { return (c - (m - d)) % 12 === 0; })) under = m - d;
      if (under !== null && n[1] >= 0.5) chime(mf(under + 12), at, 1.2, 0.06);
      bt += n[1];
    });
    // Accompaniment on a 3/4 grid after the one-beat pickup.
    for (var bar = 0, b0 = 1; now + b0 * beat < end; bar++, b0 += 3) {
      var ch = chordAt(b0), at0 = now + b0 * beat;
      // Bass: root on 1, fifth on 3.
      voice("triangle", mf(ch[0]), at0, beat * 2, 0.16, 0.02, 900);
      if (at0 + beat * 2 < end) voice("triangle", mf(ch[0] + 7), at0 + beat * 2, beat, 0.09, 0.02, 900);
      // String pad: the chord held across the bar, two detuned layers.
      [ch[1], ch[2], ch[3]].forEach(function (m) {
        voice("sawtooth", mf(m), at0, beat * 3.1, 0.012, 0.35, 1400, -7);
        voice("sawtooth", mf(m), at0, beat * 3.1, 0.012, 0.35, 1400, 7);
      });
      // Harp: broken chord in eighths, up and back down.
      var arp = [ch[1], ch[2], ch[3], ch[4], ch[3], ch[2]];
      arp.forEach(function (m, i) {
        var at = at0 + i * beat / 2;
        if (at < end) voice("triangle", mf(m), at, 0.7, 0.05, 0.006);
      });
      // Celesta sparkle on the bar line, every other bar.
      if (bar % 2 === 0) chime(mf(ch[5] + 12), at0, 1.4, 0.05);
    }
  } catch (e) { /* never let audio break the game */ }
}
function stopGaneAdMusic() {
  if (!ganeAdOut) return;
  try { ganeAdOut.disconnect(); } catch (e) { /* already gone */ }
  ganeAdOut = null;
}
