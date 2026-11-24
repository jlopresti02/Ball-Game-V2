// Suga Smiles Dental (Joe, 2026-11-24): Sean O'Malley's dental parody ad on
// the jumbotron (a banner in the test arena), the first time he does his
// Sugar Rush in a fight. It's queued the moment he calls it and goes up as
// the candies come down (the call is a special, so it waits for it).
//   - SUGA SMILES pops on, a happy cartoon tooth: "ATE TOO MUCH SUGA?"
//   - His Sugar Rush candies rain down on the tooth, BONK, a cavity per
//     candy, the tooth goes from happy to crying: CAVITIES!
//   - Sean slides in with a giant toothbrush in his own two gloves:
//     "DR. SUGA IS IN." BZZZZ, foam, the cavities scrub away, SPARKLE CLEAN.
//   - NEW! RAINBOW VENEERS: the tooth turns his hair colors. MATCH YOUR HAIR.
//     50% OFF, code SUGASHOW.
//   - End card: SUGA SMILES DENTAL. "Eat the candy. We'll handle the rest."
// Sound (code-made): a chime, a bonk per candy, an uh-oh, the electric
// toothbrush buzz, a sparkle twinkle and a closing jingle, all cues on the
// ad's own clock.
// Like Mighty Mouse's Poorbet ad, if a special, clash, lock or cutscene
// starts while it's playing it pauses (off the jumbotron, sound stopped,
// clock held) and finishes after. suga.dentalAd false in his character file
// switches it off. Plus a silent still for the random rotation
// (drawSugaSmilesStill, still-ads.js).
"use strict";

var SSD_SHOW = 9.5;
var SSD_PINK = "#ff5fa8", SSD_MINT = "#3fd6b8", SSD_DEEP = "#7a1f5c";
var SSD_DROPS = [0.7, 1.05, 1.4, 1.75, 2.1, 2.45]; // when each candy lands on the tooth
var SSD_SCRUB = [3.7, 5.6], SSD_VENEER = 6.3, SSD_END = 7.9;
var SSD_CUES = [["chime", 0.05]].concat(SSD_DROPS.map(function (d) { return ["bonk", d]; }),
  [["uhoh", 2.75], ["swoosh", 3.25], ["buzz", SSD_SCRUB[0]], ["sparkle", 5.75], ["ding", SSD_VENEER + 0.1], ["jingle", SSD_END + 0.05]]);
var SSD = { show: 0, t: 0, id: 0, done: false, queued: false, paused: false, cue: 0, out: null };

// From startMatchWith (through resetAdBreaks).
function resetSugaSmiles() { SSD.show = 0; SSD.t = 0; SSD.done = false; SSD.queued = false; SSD.paused = false; SSD.cue = 0; stopSugaSmilesSound(); }
// From updateSugarRush (omalley.js): he's just called his Sugar Rush.
function sugaSmilesOnRush(b) {
  var c = b && b.char && b.char.suga;
  if (SSD.done || (c && c.dentalAd === false) || (typeof galleryDemo !== "undefined" && galleryDemo)) return;
  SSD.done = true; SSD.id = b.id;
  queueJumboAd(SSD_SHOW, function () {
    if (over) { jumboAdLeft = 0; return; }
    SSD.show = SSD_SHOW; SSD.t = 0; SSD.cue = 0; SSD.paused = false;
  });
}
// A special, a clash, a lock or a cutscene on: the ad holds.
function sugaSmilesHold() {
  return (typeof jumboHold === "function" && jumboHold(null)) || (typeof sceneLocked === "function" && sceneLocked());
}
// Every frame, from tickAdBreaks (ad-breaks.js).
function tickSugaSmiles(dt) {
  if (SSD.show <= 0) return;
  if (sugaSmilesHold()) { // paused: off the jumbotron, quiet, and nothing else takes its slot
    if (!SSD.paused) { SSD.paused = true; stopSugaSmilesSound(); }
    if (typeof jumboAdLeft !== "undefined" && jumboAdLeft > 0) jumboAdLeft += dt;
    return;
  }
  if (SSD.paused) { // back on: pick the buzz back up if it was mid scrub
    SSD.paused = false;
    if (SSD.t > SSD_SCRUB[0] + 0.1 && SSD.t < SSD_SCRUB[1] - 0.2) playSugaSmilesCue("buzz", SSD_SCRUB[1] - SSD.t);
  }
  SSD.show = Math.max(0, SSD.show - dt);
  SSD.t = SSD_SHOW - SSD.show;
  while (SSD.cue < SSD_CUES.length && SSD.t >= SSD_CUES[SSD.cue][1]) {
    if (SSD.t - SSD_CUES[SSD.cue][1] < 0.25) playSugaSmilesCue(SSD_CUES[SSD.cue][0]); // (not if it was long missed)
    SSD.cue++;
  }
}

// ---------------------------------------------------------------- drawing helpers
function ssdEase(u) { u = Math.max(0, Math.min(1, u)); return u * u * (3 - 2 * u); }
function ssdFade(t, at, len) { return Math.max(0, Math.min(1, (t - at) / (len || 0.3))); }

// The tooth outline, s = half its width, centered on the crown.
function ssdToothPath(s) {
  ctx.beginPath();
  ctx.moveTo(-s, -0.55 * s);
  ctx.bezierCurveTo(-s, -1.25 * s, -0.3 * s, -1.25 * s, 0, -0.95 * s);
  ctx.bezierCurveTo(0.3 * s, -1.25 * s, s, -1.25 * s, s, -0.55 * s);
  ctx.bezierCurveTo(s, 0.15 * s, 0.78 * s, 0.4 * s, 0.68 * s, 1.0 * s);
  ctx.quadraticCurveTo(0.52 * s, 1.22 * s, 0.36 * s, 1.0 * s);
  ctx.bezierCurveTo(0.26 * s, 0.6 * s, 0.14 * s, 0.45 * s, 0, 0.45 * s);
  ctx.bezierCurveTo(-0.14 * s, 0.45 * s, -0.26 * s, 0.6 * s, -0.36 * s, 1.0 * s);
  ctx.quadraticCurveTo(-0.52 * s, 1.22 * s, -0.68 * s, 1.0 * s);
  ctx.bezierCurveTo(-0.78 * s, 0.4 * s, -s, 0.15 * s, -s, -0.55 * s);
  ctx.closePath();
}
var SSD_SPOTS = [[-0.5, -0.75, 0.16], [0.42, -0.4, 0.2], [-0.15, 0.05, 0.14], [0.55, -0.85, 0.12], [-0.6, -0.2, 0.13], [0.15, -0.72, 0.11]];
// The tooth mascot. o: { mood 1 happy .. -1 crying, spots 0..6, clean 0..1,
//   veneer 0..1, hair [c1, c2], wobble, shine }
function ssdTooth(cx, cy, s, o) {
  ctx.save();
  ctx.translate(cx, cy);
  if (o.wobble) ctx.rotate(o.wobble);
  // shadow
  ctx.fillStyle = "rgba(0,0,0,0.18)"; ctx.beginPath(); ctx.ellipse(0, 1.22 * s, s * 0.85, s * 0.12, 0, 0, Math.PI * 2); ctx.fill();
  ssdToothPath(s);
  var g = ctx.createLinearGradient(-s, -s, s, s);
  g.addColorStop(0, "#ffffff"); g.addColorStop(1, "#e4edf2");
  ctx.fillStyle = g; ctx.fill();
  if (o.veneer > 0) { // his hair colors, in stripes
    ctx.save(); ssdToothPath(s); ctx.clip();
    ctx.globalAlpha *= o.veneer;
    var cols = [o.hair[0], "#ff5fa8", o.hair[1] || o.hair[0], "#3fd6b8", o.hair[0]];
    for (var i = 0; i < 9; i++) {
      ctx.fillStyle = cols[i % cols.length];
      ctx.beginPath(); ctx.moveTo(-2 * s + i * 0.5 * s, -1.4 * s); ctx.lineTo(-1.5 * s + i * 0.5 * s, -1.4 * s); ctx.lineTo(-2.4 * s + i * 0.5 * s + 1.6 * s, 1.4 * s); ctx.lineTo(-2.9 * s + i * 0.5 * s + 1.6 * s, 1.4 * s); ctx.closePath(); ctx.fill();
    }
    ctx.fillStyle = "rgba(255,255,255,0.3)"; ctx.fillRect(-s, -1.3 * s, 2 * s, 0.5 * s);
    ctx.restore();
  }
  // cavities
  var dirt = Math.max(0, 1 - (o.clean || 0));
  for (var c = 0; c < Math.min(o.spots || 0, SSD_SPOTS.length); c++) {
    var sp = SSD_SPOTS[c];
    ctx.fillStyle = "rgba(92,58,30," + (0.85 * dirt) + ")";
    ctx.beginPath(); ctx.ellipse(sp[0] * s, sp[1] * s, sp[2] * s, sp[2] * s * 0.8, c, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "rgba(50,30,14," + (0.8 * dirt) + ")";
    ctx.beginPath(); ctx.arc(sp[0] * s + sp[2] * s * 0.2, sp[1] * s, sp[2] * s * 0.4, 0, Math.PI * 2); ctx.fill();
  }
  ssdToothPath(s);
  ctx.lineWidth = Math.max(2, s * 0.07); ctx.strokeStyle = "#1b2a33"; ctx.lineJoin = "round"; ctx.stroke();
  // shine
  ctx.strokeStyle = "rgba(255,255,255,0.9)"; ctx.lineWidth = s * 0.08; ctx.lineCap = "round";
  ctx.beginPath(); ctx.arc(-0.45 * s, -0.6 * s, 0.32 * s, Math.PI * 1.1, Math.PI * 1.55); ctx.stroke();
  // face
  var mood = o.mood == null ? 1 : o.mood;
  ctx.fillStyle = "#1b2a33";
  var eyeY = -0.35 * s, eyeR = s * 0.09;
  [-0.32, 0.32].forEach(function (ex) {
    if (mood > 0.6) { // happy: closed arcs
      ctx.strokeStyle = "#1b2a33"; ctx.lineWidth = s * 0.07;
      ctx.beginPath(); ctx.arc(ex * s, eyeY + eyeR * 0.6, eyeR * 1.2, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke();
    } else { ctx.beginPath(); ctx.ellipse(ex * s, eyeY, eyeR, eyeR * 1.3, 0, 0, Math.PI * 2); ctx.fill(); }
    if (mood < -0.2) { // worried brows
      ctx.strokeStyle = "#1b2a33"; ctx.lineWidth = s * 0.05;
      ctx.beginPath(); ctx.moveTo(ex * s - Math.sign(ex) * s * 0.12, eyeY - s * 0.2); ctx.lineTo(ex * s + Math.sign(ex) * s * 0.1, eyeY - s * 0.28); ctx.stroke();
    }
  });
  // cheeks
  ctx.fillStyle = "rgba(255,110,160,0.45)";
  ctx.beginPath(); ctx.ellipse(-0.58 * s, -0.12 * s, s * 0.12, s * 0.07, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(0.58 * s, -0.12 * s, s * 0.12, s * 0.07, 0, 0, Math.PI * 2); ctx.fill();
  // mouth: a smile that turns over as the mood drops
  ctx.strokeStyle = "#1b2a33"; ctx.lineWidth = s * 0.07; ctx.lineCap = "round";
  var my = -0.08 * s + (mood < 0 ? 0.08 * s : 0);
  ctx.beginPath(); ctx.moveTo(-0.22 * s, my); ctx.quadraticCurveTo(0, my + mood * 0.28 * s, 0.22 * s, my); ctx.stroke();
  if (mood > 0.8) { ctx.fillStyle = "#d94a7a"; ctx.beginPath(); ctx.moveTo(-0.16 * s, my + 0.04 * s); ctx.quadraticCurveTo(0, my + 0.24 * s, 0.16 * s, my + 0.04 * s); ctx.closePath(); ctx.fill(); }
  if (mood < -0.6) { // tears
    ctx.fillStyle = "rgba(80,170,255,0.9)";
    var ty = ((o.tearT || 0) % 0.6) / 0.6;
    [-0.32, 0.32].forEach(function (ex) {
      ctx.beginPath(); ctx.ellipse(ex * s, eyeY + s * (0.15 + ty * 0.35), s * 0.05, s * 0.08, 0, 0, Math.PI * 2); ctx.fill();
    });
  }
  ctx.restore();
  if (o.shine > 0) ssdSparkles(cx, cy - s * 0.3, s * 1.3, o.shine, o.t || 0);
}
// Four-point sparkles round a spot.
function ssdStar(x, y, r, a) {
  ctx.save(); ctx.globalAlpha *= a; ctx.fillStyle = "#ffffff"; ctx.shadowColor = "rgba(255,255,255,0.9)"; ctx.shadowBlur = r;
  ctx.beginPath(); ctx.moveTo(x, y - r); ctx.quadraticCurveTo(x, y, x + r, y); ctx.quadraticCurveTo(x, y, x, y + r); ctx.quadraticCurveTo(x, y, x - r, y); ctx.quadraticCurveTo(x, y, x, y - r); ctx.fill();
  ctx.restore();
}
function ssdSparkles(cx, cy, R, a, t) {
  for (var i = 0; i < 6; i++) {
    var ang = i * 1.05 + t * 0.8, rr = R * (0.75 + 0.2 * Math.sin(i * 2.3));
    ssdStar(cx + Math.cos(ang) * rr, cy + Math.sin(ang) * rr * 0.8, R * (0.08 + 0.05 * Math.abs(Math.sin(t * 6 + i))), a);
  }
}
// The SUGA SMILES logo: a little tooth with a candy-stripe smile and the name.
function ssdLogo(cx, cy, size, sub) {
  ctx.save();
  ssdTooth(cx - size * 2.05, cy, size * 0.42, { mood: 1 });
  stillText("SUGA SMILES", cx + size * 0.35, cy - size * 0.08, size, SSD_DEEP, size * 4.2, { stroke: "#ffffff", strokeW: 0.22 });
  if (sub) stillText(sub, cx + size * 0.35, cy + size * 0.62, size * 0.32, SSD_MINT, size * 4.2, { face: "'Helvetica Neue', Helvetica, Arial, sans-serif", weight: "800" });
  ctx.restore();
}
// The clinic wall: mint tiles, a pink stripe.
function ssdBackdrop(x, y, w, h, k) {
  var g = ctx.createLinearGradient(x, y, x, y + h);
  g.addColorStop(0, "#e9fff9"); g.addColorStop(1, "#c6f3e8");
  ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = "rgba(63,214,184,0.25)"; ctx.lineWidth = 1.5 * k;
  for (var tx = x; tx < x + w; tx += 34 * k) { ctx.beginPath(); ctx.moveTo(tx, y); ctx.lineTo(tx, y + h * 0.8); ctx.stroke(); }
  for (var ty = y; ty < y + h * 0.8; ty += 34 * k) { ctx.beginPath(); ctx.moveTo(x, ty); ctx.lineTo(x + w, ty); ctx.stroke(); }
  ctx.fillStyle = "#ffd6ea"; ctx.fillRect(x, y + h * 0.8, w, h * 0.2);
  ctx.fillStyle = SSD_PINK; ctx.fillRect(x, y + h * 0.8, w, 4 * k);
}
// The big toothbrush, head at (hx, hy), handle running off to the right.
function ssdBrush(hx, hy, len, k) {
  ctx.save();
  ctx.lineJoin = "round";
  // handle
  ctx.fillStyle = SSD_PINK; ctx.strokeStyle = "#1b2a33"; ctx.lineWidth = 2.5 * k;
  stillRoundRect(hx, hy - 7 * k, len, 14 * k, 7 * k); ctx.fill(); ctx.stroke();
  ctx.fillStyle = "#ffffff"; ctx.fillRect(hx + len * 0.35, hy - 3 * k, len * 0.4, 3 * k);
  // head and bristles (facing the tooth, on the left)
  ctx.fillStyle = "#ffffff"; stillRoundRect(hx - 4 * k, hy - 14 * k, 34 * k, 22 * k, 5 * k); ctx.fill(); ctx.stroke();
  for (var i = 0; i < 6; i++) {
    ctx.fillStyle = i % 2 ? SSD_MINT : "#8fd8ff";
    ctx.fillRect(hx - 2 * k + i * 5.4 * k, hy - 30 * k, 4 * k, 17 * k);
  }
  ctx.restore();
}
// Foam bubbles, placed by a fixed pattern (no Math.random in drawing: replays).
function ssdFoam(cx, cy, s, a, t) {
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha *= a;
  for (var i = 0; i < 14; i++) {
    var fx = cx + Math.sin(i * 2.7) * s * 0.8, fy = cy + Math.cos(i * 1.9) * s * 0.7 - ((t * 0.6 + i * 0.13) % 1) * s * 0.3;
    var fr = s * (0.06 + 0.06 * Math.abs(Math.sin(i * 3.1)));
    ctx.fillStyle = "rgba(255,255,255,0.92)"; ctx.strokeStyle = "rgba(120,200,230,0.8)"; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.arc(fx, fy, fr, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  }
  ctx.restore();
}

// ---------------------------------------------------------------- the ad
function drawSugaSmilesJumbo(x, y, w, h) {
  if (SSD.show <= 0 || SSD.paused || !balls || !balls[SSD.id]) return;
  var t = SSD.t, k = h / 250, sans = "'Helvetica Neue', Helvetica, Arial, sans-serif";
  var sean = balls[SSD.id], ch = sean.baseChar || sean.char, look = ch.look || {};
  var hair = look.hairColors || [look.hairColor || "#8a3ffc", "#2d7ff9"];
  ctx.save();
  ctx.globalAlpha = Math.min(1, t / 0.3, SSD.show / 0.4);
  ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
  ssdBackdrop(x, y, w, h, k);

  // The logo, top left, the whole ad.
  var lp = ssdEase((t - 0.05) / 0.35);
  ctx.save(); ctx.translate(x + w * 0.2, y + h * 0.17); ctx.scale(0.6 + 0.4 * lp, 0.6 + 0.4 * lp); ctx.globalAlpha *= lp;
  ssdLogo(0, 0, 34 * k, "FAMILY DENTISTRY");
  ctx.restore();

  // The tooth.
  var tx = x + w * 0.48, ty = y + h * 0.6, ts = h * 0.24;
  var landed = SSD_DROPS.filter(function (d) { return t >= d; }).length;
  var lastHit = landed ? t - SSD_DROPS[landed - 1] : 9;
  var scrubU = Math.max(0, Math.min(1, (t - SSD_SCRUB[0]) / (SSD_SCRUB[1] - SSD_SCRUB[0])));
  var mood = 1 - landed / 3; if (mood < -1) mood = -1;
  if (t > SSD_SCRUB[0]) mood = Math.min(1, -1 + scrubU * 2.4);
  var wob = lastHit < 0.3 ? Math.sin(lastHit * 40) * 0.12 * (1 - lastHit / 0.3) : 0;
  if (t > SSD_SCRUB[0] && t < SSD_SCRUB[1]) wob = Math.sin(t * 36) * 0.03;
  var squash = lastHit < 0.2 ? 1 - 0.08 * (1 - lastHit / 0.2) : 1;
  var ven = ssdFade(t, SSD_VENEER, 0.6);
  ctx.save(); ctx.translate(tx, ty + ts * 1.2); ctx.scale(1 / squash, squash); ctx.translate(-tx, -ty - ts * 1.2);
  ssdTooth(tx, ty, ts, { mood: mood, spots: landed, clean: scrubU, veneer: ven, hair: hair, wobble: wob, shine: t > SSD_SCRUB[1] ? Math.min(1, (t - SSD_SCRUB[1]) / 0.3) : 0, t: t, tearT: t });
  ctx.restore();

  // His Sugar Rush candies raining onto it.
  var kinds = [{ kind: "lollipop" }, { kind: "wrapped", color: "#ff5fa8" }, { kind: "candyCane" }, { kind: "gumball", color: "#2d7ff9" }, { kind: "donut" }, { kind: "cottonCandy" }];
  SSD_DROPS.forEach(function (d, i) {
    var u = (t - (d - 0.45)) / 0.45;
    if (u < 0) return;
    var sx = tx + (i % 2 ? 1 : -1) * ts * (0.1 + 0.07 * i), size = ts * 0.42;
    if (u < 1) { if (typeof drawSweet === "function") drawSweet(kinds[i], sx, y - size + (ty - ts * 0.9 - y + size) * u * u, size, u * 4); return; }
    // bounced off: tumble away
    var v = t - d; if (v > 0.8) return;
    var dir = i % 2 ? 1 : -1;
    ctx.save(); ctx.globalAlpha *= 1 - v / 0.8;
    if (typeof drawSweet === "function") drawSweet(kinds[i], sx + dir * v * ts * 2.2, ty - ts * 0.9 - v * ts * 1.6 + v * v * ts * 5, size, v * 9 * dir);
    ctx.restore();
    if (v < 0.25) stillText("BONK!", sx + dir * ts * 0.5, ty - ts * 1.25, 18 * k * (1 + v), "#ffde3b", w * 0.1, { stroke: "#1b2a33", strokeW: 0.2 });
  });

  // The copy on the left.
  var cx = x + w * 0.17, sansO = { face: sans, weight: "900" };
  function copy(at, until, a, b, col) {
    if (t < at || t > until) return;
    var a2 = Math.min(ssdFade(t, at, 0.25), 1 - ssdFade(t, until - 0.25, 0.25));
    ctx.save(); ctx.globalAlpha *= a2;
    stillText(a, cx, y + h * 0.52, 28 * k, col || SSD_DEEP, w * 0.3, { stroke: "#ffffff", strokeW: 0.2 });
    if (b) stillText(b, cx, y + h * 0.68, 15 * k, "#1b2a33", w * 0.3, sansO);
    ctx.restore();
  }
  copy(0.5, 2.7, "ATE TOO MUCH SUGA?", "It happens to the best of us.");
  copy(3.3, 5.6, "DR. SUGA IS IN.", "Gentle. Fast. Undefeated on plaque.");
  copy(5.7, SSD_VENEER, "SPARKLE CLEAN!", "");
  copy(SSD_VENEER, SSD_END, "NEW! RAINBOW VENEERS", "MATCH YOUR HAIR.", SSD_PINK);
  if (t > 2.75 && t < 3.6) { // CAVITIES! stamp
    var su = ssdEase((t - 2.75) / 0.15);
    ctx.save(); ctx.translate(tx, ty - ts * 0.2); ctx.rotate(-0.18); ctx.scale(2 - su, 2 - su); ctx.globalAlpha *= Math.min(1, su) * (1 - ssdFade(t, 3.35, 0.25));
    ctx.strokeStyle = "#e3173d"; ctx.lineWidth = 4 * k; stillRoundRect(-90 * k, -22 * k, 180 * k, 44 * k, 6 * k); ctx.stroke();
    stillText("CAVITIES!", 0, 0, 30 * k, "#e3173d", 170 * k);
    ctx.restore();
  }
  if (t > SSD_VENEER + 0.3 && t < SSD_END) { // the 50% OFF badge
    var bp = ssdEase((t - SSD_VENEER - 0.3) / 0.3), bx = tx - ts * 1.35, by = y + h * 0.32;
    ctx.save(); ctx.translate(bx, by); ctx.rotate(0.15 + Math.sin(t * 5) * 0.04); ctx.scale(bp, bp);
    ctx.fillStyle = "#ffde3b"; ctx.strokeStyle = "#1b2a33"; ctx.lineWidth = 2.5 * k;
    ctx.beginPath();
    for (var p = 0; p < 24; p++) { var ra = p % 2 ? 40 * k : 48 * k, an = p / 24 * Math.PI * 2; ctx.lineTo(Math.cos(an) * ra, Math.sin(an) * ra); }
    ctx.closePath(); ctx.fill(); ctx.stroke();
    stillText("50% OFF", 0, -8 * k, 17 * k, "#e3173d", 70 * k);
    stillText("CODE: SUGASHOW", 0, 12 * k, 8 * k, "#1b2a33", 72 * k, sansO);
    ctx.restore();
  }

  // Sean with the toothbrush, in his own two gloves.
  if (t > 3.2 && t < SSD_END + 0.3) {
    var inU = ssdEase((t - 3.2) / 0.45), outU = ssdEase((t - SSD_SCRUB[1]) / 0.4);
    var sr = h * 0.27, sx0 = x + w * 0.79 + (1 - inU) * w * 0.3, sy0 = y + h * 0.6;
    var scrub = t > SSD_SCRUB[0] && t < SSD_SCRUB[1] ? Math.sin((t - SSD_SCRUB[0]) * 22) : 0;
    var hx = tx + ts * 0.25 + outU * ts * 1.1, hy = ty - ts * 0.35 + scrub * ts * 0.35 + (scrub ? 0 : 0);
    var hx2 = sx0 - sr * 0.95; // handle end, at his gloves
    var g1 = { x: hx2 + 4 * k, y: hy }, g2 = { x: hx2 + 30 * k, y: hy + 4 * k };
    var arm = sr * 0.26, skin = look.skin || "#f3d0b5";
    // back arm, the ball, front arm, the brush, the gloves
    strokeLimb(arm, skin, function () { ctx.moveTo(sx0 - sr * 0.45, sy0 + sr * 0.2); ctx.quadraticCurveTo(sx0 - sr * 0.9, sy0 + sr * 0.3, g2.x, g2.y); });
    ctx.save(); ctx.translate(sx0, sy0); ctx.rotate(scrub * 0.03); ctx.translate(-sx0, -sy0);
    stillFighter(sx0, sy0, sr, look, ch.name);
    // the dentist's head mirror
    ctx.fillStyle = "#cfd8dc"; ctx.strokeStyle = "#1b2a33"; ctx.lineWidth = 2 * k;
    ctx.beginPath(); ctx.arc(sx0 - sr * 0.15, sy0 - sr * 0.72, sr * 0.2, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "rgba(255,255,255,0.85)"; ctx.beginPath(); ctx.arc(sx0 - sr * 0.2, sy0 - sr * 0.77, sr * 0.07, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    strokeLimb(arm, skin, function () { ctx.moveTo(sx0 - sr * 0.6, sy0 - sr * 0.05); ctx.quadraticCurveTo(sx0 - sr * 1.0, sy0 - sr * 0.1, g1.x, g1.y); });
    ssdBrush(hx, hy, hx2 + 40 * k - hx, k);
    drawGlove(ctx, g2.x, g2.y, sr * 0.3, look, "#0b0f12", Math.PI);
    drawGlove(ctx, g1.x, g1.y, sr * 0.3, look, "#0b0f12", Math.PI);
    if (scrub) {
      ssdFoam(tx, ty - ts * 0.35, ts * 0.9, Math.min(1, (t - SSD_SCRUB[0]) / 0.4), t);
      stillText("BZZZZZ", tx + ts * 0.2 + Math.sin(t * 60) * 2 * k, y + h * 0.12, 20 * k, SSD_MINT, w * 0.14, { stroke: "#1b2a33", strokeW: 0.18 });
    }
  }

  // The end card.
  if (t > SSD_END) {
    var e = ssdEase((t - SSD_END) / 0.4);
    ctx.save(); ctx.globalAlpha *= e;
    var eg = ctx.createLinearGradient(x, y, x + w, y + h);
    eg.addColorStop(0, "#ffe3f1"); eg.addColorStop(1, "#d7fff4");
    ctx.fillStyle = eg; ctx.fillRect(x, y, w, h);
    ctx.restore();
    ctx.save(); ctx.globalAlpha *= e;
    ctx.translate(x + w * 0.5, y + h * 0.36); var es = 0.85 + 0.15 * e; ctx.scale(es, es);
    ssdLogo(0, 0, 54 * k, "DENTAL");
    ctx.restore();
    ctx.save(); ctx.globalAlpha *= ssdFade(t, SSD_END + 0.35, 0.3);
    stillText("Eat the candy. We'll handle the rest.", x + w * 0.5, y + h * 0.7, 24 * k, "#1b2a33", w * 0.8, { face: sans, weight: "italic 800" });
    ssdSparkles(x + w * 0.5, y + h * 0.4, w * 0.3, 0.9, t);
    ctx.restore();
  }
  // Fine print.
  if (t > 0.6) {
    ctx.save(); ctx.globalAlpha *= ssdFade(t, 0.6, 0.4);
    stillText("*Parody. Not a real dentist. Brush twice a day, floss, and see a real one. Sean O'Malley is not licensed to drill.", x + w / 2, y + h * 0.95, 11 * k, "#4b5d66", w * 0.95, { face: sans, weight: "600" });
    ctx.restore();
  }
  ctx.restore();
}
function drawSugaSmilesBanner() {
  if (SSD.show <= 0 || stadiumOn()) return;
  drawSugaSmilesJumbo(10, 10, W - 20, 110);
}

// The still for the random rotation: a waiting-room poster. The tooth in his
// rainbow veneers, Sean in his head mirror, the lollipop jar at the desk.
function drawSugaSmilesStill(x, y, w, h, k, ch) {
  var sans = "'Helvetica Neue', Helvetica, Arial, sans-serif";
  var look = (ch && ch.look) || {}, hair = look.hairColors || [look.hairColor || "#8a3ffc", "#2d7ff9"];
  ssdBackdrop(x, y, w, h, k);
  ssdLogo(x + w * 0.22, y + h * 0.2, 30 * k, "FAMILY DENTISTRY");
  stillText("RAINBOW VENEERS", x + w * 0.2, y + h * 0.5, 28 * k, SSD_PINK, w * 0.34, { stroke: "#ffffff", strokeW: 0.2 });
  stillText("Your smile. Your hair. Finally matching.", x + w * 0.2, y + h * 0.65, 14 * k, "#1b2a33", w * 0.34, { face: sans, weight: "800" });
  ssdTooth(x + w * 0.52, y + h * 0.58, h * 0.24, { mood: 1, veneer: 1, hair: hair, shine: 0.9, t: 1.3 });
  var sr = h * 0.25, sx = x + w * 0.8, sy = y + h * 0.58;
  stillFighter(sx, sy, sr, look, (ch && ch.name) || "");
  ctx.fillStyle = "#cfd8dc"; ctx.strokeStyle = "#1b2a33"; ctx.lineWidth = 2 * k;
  ctx.beginPath(); ctx.arc(sx - sr * 0.15, sy - sr * 0.72, sr * 0.2, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  stillText("DR. SUGA", sx, y + h * 0.14, 16 * k, SSD_DEEP, w * 0.18, { stroke: "#ffffff", strokeW: 0.2 });
  // the lollipop jar
  var jx = x + w * 0.66, jy = y + h * 0.78;
  ctx.fillStyle = "rgba(220,245,255,0.6)"; ctx.strokeStyle = "#1b2a33"; ctx.lineWidth = 2 * k;
  stillRoundRect(jx - 18 * k, jy - 34 * k, 36 * k, 40 * k, 8 * k); ctx.fill(); ctx.stroke();
  if (typeof drawSweet === "function") { drawSweet({ kind: "lollipop" }, jx - 6 * k, jy - 40 * k, 12 * k, -0.3); drawSweet({ kind: "lollipop" }, jx + 7 * k, jy - 44 * k, 12 * k, 0.3); }
  stillText("Eat the candy. We'll handle the rest.", x + w * 0.5, y + h * 0.9, 13 * k, "#1b2a33", w * 0.9, { face: sans, weight: "italic 800" });
}

// ---------------------------------------------------------------- sound
function playSugaSmilesCue(name, len) {
  try {
    var ac = getAudioCtx(); if (!ac) return;
    if (ac.state === "suspended") ac.resume();
    if (!SSD.out) { SSD.out = ac.createGain(); SSD.out.gain.value = 0.6; SSD.out.connect(ac.destination); }
    var out = SSD.out, now = ac.currentTime + 0.02;
    var tone = function (f, at, dur, vol, type, f2) {
      var o = ac.createOscillator(), g = ac.createGain();
      o.type = type || "triangle"; o.frequency.setValueAtTime(f, at); if (f2) o.frequency.exponentialRampToValueAtTime(f2, at + dur);
      g.gain.setValueAtTime(0.0001, at); g.gain.exponentialRampToValueAtTime(vol, at + 0.015); g.gain.setValueAtTime(vol, at + Math.max(0.02, dur - 0.06)); g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
      o.connect(g); g.connect(out); o.start(at); o.stop(at + dur + 0.05);
    };
    if (name === "chime") { // a bright clinic chime
      if (typeof duckMusic === "function") duckMusic(now, now + 1.0);
      [1046.5, 1318.5, 1568].forEach(function (f, i) { tone(f, now + i * 0.1, 0.7, 0.09, "sine"); tone(f * 2, now + i * 0.1, 0.3, 0.025, "sine"); });
    }
    if (name === "bonk") { tone(520, now, 0.12, 0.14, "square", 180); tone(1400, now, 0.05, 0.05, "sine"); }
    if (name === "uhoh") { tone(440, now, 0.22, 0.12, "triangle"); tone(330, now + 0.24, 0.4, 0.12, "triangle", 300); }
    if (name === "swoosh") { tone(300, now, 0.3, 0.06, "sawtooth", 1200); }
    if (name === "buzz") { // the electric toothbrush, wobbling
      var d = len || (SSD_SCRUB[1] - SSD_SCRUB[0]);
      var o = ac.createOscillator(), g = ac.createGain(), lfo = ac.createOscillator(), lg = ac.createGain();
      o.type = "sawtooth"; o.frequency.value = 150;
      lfo.frequency.value = 11; lg.gain.value = 22; lfo.connect(lg); lg.connect(o.frequency);
      var f = ac.createBiquadFilter(); f.type = "bandpass"; f.frequency.value = 900; f.Q.value = 1.2;
      g.gain.setValueAtTime(0.0001, now); g.gain.exponentialRampToValueAtTime(0.08, now + 0.06); g.gain.setValueAtTime(0.08, now + d - 0.1); g.gain.exponentialRampToValueAtTime(0.0001, now + d);
      o.connect(f); f.connect(g); g.connect(out); o.start(now); lfo.start(now); o.stop(now + d + 0.05); lfo.stop(now + d + 0.05);
    }
    if (name === "sparkle") { [2093, 2637, 3136, 4186].forEach(function (fq, i) { tone(fq, now + i * 0.06, 0.25, 0.05, "sine"); }); }
    if (name === "ding") { tone(1568, now, 0.6, 0.1, "sine"); tone(2093, now + 0.12, 0.7, 0.08, "sine"); }
    if (name === "jingle") { // "Su-ga Smi-les!"
      if (typeof duckMusic === "function") duckMusic(now, now + 1.4);
      [[784, 0], [988, 0.16], [1175, 0.32], [1568, 0.5]].forEach(function (nt) { tone(nt[0], now + nt[1], nt[1] === 0.5 ? 0.8 : 0.18, 0.1, "triangle"); tone(nt[0] / 2, now + nt[1], 0.16, 0.05, "square"); });
    }
  } catch (e) { /* no audio */ }
}
function stopSugaSmilesSound() {
  if (!SSD.out) return;
  try { SSD.out.disconnect(); } catch (e) { /* already gone */ }
  SSD.out = null;
}
