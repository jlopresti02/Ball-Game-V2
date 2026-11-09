// GANE-PROOF Baby Proofing (Joe, 2026-11-09): the first time Ciryl Gane
// goes into Cheater mode in a fight, the jumbotron (a banner in the test
// arena) runs a baby-proofing ad, to a music-box lullaby.
//   - If he pulls the bat or goes for eye pokes, his call for it ("bat" /
//     "poke" line, on his first landed hit) comes first: the ad waits for it
//     to play and finish. If nothing lands, it waits for the ref to wake up
//     (the call can't come after that), so the line never plays over it. It also
//     waits for anyone else who's talking, then goes through queueJumboAd
//     like every ad, so it never overlaps another one and waits out specials.
//   - The model is his opponent in this fight, kitted out against him:
//     safety goggles (for the eye pokes) and a pillow strapped behind the
//     head (for the shots to the back of the head), then AND MORE!
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
    ganeAdShow = GANE_AD_SHOW; ganeAdIds = { gane: p.id, model: 1 - p.id };
    playGaneAdMusic(GANE_AD_SHOW);
  }, gane);
}

function drawGaneAdJumbo(x, y, w, h) {
  if (ganeAdShow <= 0 || !ganeAdIds || !balls) return;
  var gane = balls[ganeAdIds.gane], model = balls[ganeAdIds.model];
  if (!gane || !model) return;
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
  ganeAdModel(mx, my, r, model, t, k);
  // Gane peeking up from below, left of the model, for a poke at the
  // goggles, and TINK.
  var sneak = Math.max(0, Math.min(1, (t - 5.0) / 0.6)), back = Math.max(0, Math.min(1, (t - 6.5) / 0.5));
  if (sneak > 0) {
    var gr = r * 0.7, gx = mx - r * 1.78;
    var gy = my + r * 0.35 + (1 - easeOut(sneak)) * (y + h - my + gr) + easeOut(back) * (y + h - my + gr);
    drawFighterArt(ctx, gx, gy, gr, gane.char.look, "#0b0f12", { layout: "contained", name: gane.char.name });
    ctx.lineWidth = 2 * k; ctx.strokeStyle = "#0b0f12"; ctx.beginPath(); ctx.arc(gx, gy, gr, 0, Math.PI * 2); ctx.stroke();
    // His poking hand: a glove with one finger out, jabbing at the goggles.
    var tx = mx - r * 0.38, ty = my - r * 0.27, dx = tx - gx, dy = ty - gy, dd = Math.hypot(dx, dy) || 1;
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
      ctx.translate(mx - r * 1.05, my - r * 1.0 - tp * 10 * k); ctx.rotate(-0.15);
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
// The opponent, modelling the gear: a puffy pillow strapped behind the head
// and big safety goggles.
function ganeAdModel(cx, cy, r, b, t, k) {
  var bob = Math.sin(t * 1.6) * r * 0.03, look = b.char.look;
  cy += bob;
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
  // The strap, running across the pillow to the head.
  ctx.fillStyle = "#7cc6fe"; ctx.strokeStyle = "#3b82c4"; ctx.lineWidth = 1.2 * k;
  ctx.fillRect(-pw / 2 - r * 0.04, (cy - r * 0.66) - py, pw + r * 0.08, r * 0.13);
  ctx.setLineDash([3 * k, 3 * k]); ctx.strokeStyle = "#e0ad55";
  stillRoundRect(-pw * 0.44, -ph * 0.38, pw * 0.88, ph * 0.76, r * 0.2); ctx.stroke(); ctx.setLineDash([]);
  ctx.restore();
  // The fighter.
  ctx.fillStyle = "rgba(59,74,107,0.18)"; ctx.beginPath(); ctx.ellipse(cx, cy + r * 1.05, r * 0.9, r * 0.14, 0, 0, Math.PI * 2); ctx.fill();
  drawFighterArt(ctx, cx, cy, r, look, "#0b0f12", { layout: "contained", name: b.char.name });
  ctx.lineWidth = 2.5 * k; ctx.strokeStyle = "#0b0f12"; ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
  // The pillow's strap across the forehead, buckled.
  ctx.save();
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.clip();
  ctx.fillStyle = "#7cc6fe"; ctx.fillRect(cx - r, cy - r * 0.66, r * 2, r * 0.13);
  ctx.restore();
  ctx.fillStyle = "#ffffff"; ctx.strokeStyle = "#3b4a6b"; ctx.lineWidth = 1.5 * k;
  stillRoundRect(cx - r * 0.1, cy - r * 0.69, r * 0.2, r * 0.19, r * 0.04); ctx.fill(); ctx.stroke();
  // Safety goggles: a band round the head and two big lenses.
  ctx.save();
  ctx.beginPath(); ctx.arc(cx, cy, r * 1.02, 0, Math.PI * 2); ctx.clip();
  ctx.fillStyle = "#3b4a6b"; ctx.fillRect(cx - r * 1.05, cy - r * 0.32, r * 2.1, r * 0.1);
  ctx.restore();
  [-1, 1].forEach(function (s) {
    var lx = cx + s * r * 0.33, ly = cy - r * 0.27;
    ctx.fillStyle = "#3b4a6b"; stillRoundRect(lx - r * 0.3, ly - r * 0.2, r * 0.6, r * 0.4, r * 0.15); ctx.fill();
    var lg = ctx.createLinearGradient(lx - r * 0.25, ly - r * 0.15, lx + r * 0.25, ly + r * 0.15);
    lg.addColorStop(0, "rgba(220,240,255,0.9)"); lg.addColorStop(1, "rgba(120,190,255,0.55)");
    ctx.fillStyle = lg; stillRoundRect(lx - r * 0.24, ly - r * 0.14, r * 0.48, r * 0.28, r * 0.11); ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.9)"; ctx.lineWidth = 2 * k; // glint
    ctx.beginPath(); ctx.moveTo(lx - r * 0.14, ly - r * 0.06); ctx.lineTo(lx - r * 0.04, ly - r * 0.1); ctx.stroke();
  });
  ctx.fillStyle = "#3b4a6b"; ctx.fillRect(cx - r * 0.06, cy - r * 0.3, r * 0.12, r * 0.08); // the bridge
}
// A feature callout: a check in a circle, the name and a line under it.
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
    var out = ganeAdOut = ac.createGain(), now = ac.currentTime + 0.05, beat = 0.36;
    out.gain.setValueAtTime(0.0001, now); out.gain.exponentialRampToValueAtTime(0.5, now + 0.3);
    out.gain.setValueAtTime(0.5, now + dur - 0.6); out.gain.exponentialRampToValueAtTime(0.0001, now + dur);
    out.connect(ac.destination);
    if (typeof duckMusic === "function") duckMusic(now, now + dur);
    function bell(f, at, len, vol) {
      [[1, 1], [2, 0.35], [3.01, 0.12]].forEach(function (hm) {
        var o = ac.createOscillator(), g = ac.createGain();
        o.type = "sine"; o.frequency.value = f * hm[0];
        g.gain.setValueAtTime(0.0001, at); g.gain.exponentialRampToValueAtTime(vol * hm[1], at + 0.008);
        g.gain.exponentialRampToValueAtTime(0.0001, at + len);
        o.connect(g); g.connect(out); o.start(at); o.stop(at + len + 0.05);
      });
    }
    var t = now, bar = 0;
    GANE_LULLABY.forEach(function (n) {
      if (t > now + dur - 0.3) return;
      var f = 523.25 * Math.pow(2, n[0] / 12) * 2; // up an octave, music-box high
      bell(f, t, 1.6, 0.18);
      if (Math.floor((t - now) / (beat * 3)) !== bar - 1) { bell(f / 4, t, 1.2, 0.08); bar = Math.floor((t - now) / (beat * 3)) + 1; }
      t += n[1] * beat * 1.4;
    });
  } catch (e) { /* never let audio break the game */ }
}
function stopGaneAdMusic() {
  if (!ganeAdOut) return;
  try { ganeAdOut.disconnect(); } catch (e) { /* already gone */ }
  ganeAdOut = null;
}
