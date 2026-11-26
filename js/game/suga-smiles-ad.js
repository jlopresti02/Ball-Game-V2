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
// Sound: Joe's song looped under it (sugaSmilesMusic, sound-clips.js), with
// code-made effects on top: a bonk per candy, an uh-oh, the electric
// toothbrush buzz, a sparkle and a ding, all cues on the ad's own clock.
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
var SSD_CUES = SSD_DROPS.map(function (d) { return ["bonk", d]; }).concat(
  [["uhoh", 2.75], ["swoosh", 3.25], ["buzz", SSD_SCRUB[0]], ["sparkle", 5.75], ["ding", SSD_VENEER + 0.1]]);
var SSD_MUSIC_GAIN = 0.95;
var SSD = { show: 0, t: 0, id: 0, done: false, queued: false, paused: false, cue: 0, out: null, music: null };

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
    sugaSmilesMusic();
  });
}
// Joe's song (sugaSmilesMusic, sound-clips.js), looped under the ad from
// where the ad's clock is, to the end. Through SSD.out, so it stops with the
// ad's sound when it pauses, and picks back up in place after.
function sugaSmilesMusic() {
  if (typeof withClip !== "function") return;
  withClip("sugaSmilesMusic", function (buf) {
    try {
      if (SSD.show <= 0 || SSD.paused || SSD.music) return;
      var ac = getAudioCtx(); if (!ac) return;
      if (!SSD.out) { SSD.out = ac.createGain(); SSD.out.gain.value = 0.6; SSD.out.connect(ac.destination); }
      var now = ac.currentTime + 0.02, left = SSD.show;
      var src = ac.createBufferSource(), g = ac.createGain();
      src.buffer = buf; src.loop = true;
      g.gain.setValueAtTime(0.0001, now); g.gain.exponentialRampToValueAtTime(SSD_MUSIC_GAIN, now + 0.08);
      g.gain.setValueAtTime(SSD_MUSIC_GAIN, now + Math.max(0.1, left - 0.45)); g.gain.exponentialRampToValueAtTime(0.0001, now + left);
      src.connect(g); g.connect(SSD.out);
      src.start(now, SSD.t % buf.duration); src.stop(now + left + 0.05);
      SSD.music = src;
      if (typeof duckMusic === "function") duckMusic(now, now + left);
    } catch (e) { /* no audio */ }
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
  if (SSD.paused) { // back on: the song picks up where it was, and the buzz if it was mid scrub
    SSD.paused = false;
    sugaSmilesMusic();
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
    var vTop = 1.3 * s - o.veneer * 2.7 * s; // it wipes up from the roots
    ctx.beginPath(); ctx.rect(-1.5 * s, vTop, 3 * s, 3 * s); ctx.clip();
    var cols = [o.hair[0], "#ff5fa8", o.hair[1] || o.hair[0], "#3fd6b8", o.hair[0]];
    for (var i = 0; i < 9; i++) {
      ctx.fillStyle = cols[i % cols.length];
      ctx.beginPath(); ctx.moveTo(-2 * s + i * 0.5 * s, -1.4 * s); ctx.lineTo(-1.5 * s + i * 0.5 * s, -1.4 * s); ctx.lineTo(-2.4 * s + i * 0.5 * s + 1.6 * s, 1.4 * s); ctx.lineTo(-2.9 * s + i * 0.5 * s + 1.6 * s, 1.4 * s); ctx.closePath(); ctx.fill();
    }
    ctx.fillStyle = "rgba(255,255,255,0.3)"; ctx.fillRect(-s, -1.3 * s, 2 * s, 0.5 * s);
    ctx.restore();
    if (o.veneer < 1) { // the glowing edge of the wipe
      ctx.save(); ssdToothPath(s); ctx.clip();
      var eg = ctx.createLinearGradient(0, vTop - 0.12 * s, 0, vTop + 0.12 * s);
      eg.addColorStop(0, "rgba(255,255,255,0)"); eg.addColorStop(0.5, "rgba(255,255,255,0.95)"); eg.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = eg; ctx.fillRect(-1.5 * s, vTop - 0.12 * s, 3 * s, 0.24 * s);
      ctx.restore();
    }
  }
  // cavities
  var arr = Array.isArray(o.spots), dirt0 = Math.max(0, 1 - (o.clean || 0));
  for (var c = 0; c < (arr ? o.spots.length : Math.min(o.spots || 0, SSD_SPOTS.length)); c++) {
    var sp = SSD_SPOTS[c], dirt = arr ? o.spots[c] : dirt0;
    if (dirt <= 0.01) continue;
    var grow = arr ? Math.min(1, 0.4 + dirt * 0.6) : 1;
    sp = [sp[0], sp[1], sp[2] * grow];
    ctx.fillStyle = "rgba(92,58,30," + (0.85 * dirt) + ")";
    ctx.beginPath(); ctx.ellipse(sp[0] * s, sp[1] * s, sp[2] * s, sp[2] * s * 0.8, c, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "rgba(50,30,14," + (0.8 * dirt) + ")";
    ctx.beginPath(); ctx.arc(sp[0] * s + sp[2] * s * 0.2, sp[1] * s, sp[2] * s * 0.4, 0, Math.PI * 2); ctx.fill();
  }
  if (o.gleam > 0 && o.gleam < 1) { // a shine sweeping across, corner to corner
    ctx.save(); ssdToothPath(s); ctx.clip();
    var gx = -2.2 * s + o.gleam * 4.4 * s;
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    ctx.beginPath(); ctx.moveTo(gx, -1.4 * s); ctx.lineTo(gx + 0.35 * s, -1.4 * s); ctx.lineTo(gx - 0.45 * s, 1.4 * s); ctx.lineTo(gx - 0.8 * s, 1.4 * s); ctx.closePath(); ctx.fill();
    ctx.restore();
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
    if (o.wink && ex > 0) { // a wink
      ctx.strokeStyle = "#1b2a33"; ctx.lineWidth = s * 0.07;
      ctx.beginPath(); ctx.moveTo(ex * s - eyeR * 1.1, eyeY); ctx.lineTo(ex * s + eyeR * 1.1, eyeY - eyeR * 0.3); ctx.stroke();
      return;
    }
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
  if (mood < 0.4 && mood > -0.7) { // a nervous sweat drop
    var sw = ((o.tearT || 0) % 0.9) / 0.9;
    ctx.fillStyle = "rgba(120,200,255,0.9)"; ctx.strokeStyle = "#1b2a33"; ctx.lineWidth = s * 0.025;
    ctx.beginPath(); ctx.ellipse(0.78 * s, -0.75 * s + sw * 0.25 * s, s * 0.07, s * 0.1, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  }
  if (mood < -0.6) { // tears
    ctx.fillStyle = "rgba(80,170,255,0.9)";
    var ty = ((o.tearT || 0) % 0.6) / 0.6;
    [-0.32, 0.32].forEach(function (ex) {
      for (var d = 0; d < 3; d++) {
        var u = (ty + d / 3) % 1, dx = ex * s + Math.sign(ex) * u * 0.35 * s;
        ctx.beginPath(); ctx.ellipse(dx, eyeY + s * (0.12 + u * 0.55) - u * u * 0.1 * s, s * 0.05, s * 0.08, 0, 0, Math.PI * 2); ctx.fill();
      }
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
// A real toothbrush (big, cartoon size). Head at the origin with the bristles
// pointing down onto whatever it's brushing, the handle running off along +x
// for L, turned by ang.
function ssdBrush(hx, hy, ang, L, k) {
  ctx.save();
  ctx.translate(hx, hy); ctx.rotate(ang);
  ctx.lineJoin = "round"; ctx.lineCap = "round";
  var ink = "#1b2a33", lw = Math.max(1.5, L * 0.018);
  // bristle tufts, in rows, pointing down
  var hw = L * 0.27, tufts = 7;
  for (var i = 0; i < tufts; i++) {
    var bx = -L * 0.02 + (i + 0.5) * hw / tufts, tw = hw / tufts * 0.72;
    ctx.fillStyle = i % 2 ? "#ffffff" : "#7fd4ff"; ctx.strokeStyle = ink; ctx.lineWidth = lw * 0.6;
    stillRoundRect(bx - tw / 2, L * 0.01, tw, L * 0.1, tw * 0.35); ctx.fill(); ctx.stroke();
  }
  // the head
  ctx.fillStyle = SSD_PINK; ctx.strokeStyle = ink; ctx.lineWidth = lw;
  stillRoundRect(-L * 0.04, -L * 0.06, L * 0.31, L * 0.08, L * 0.035); ctx.fill(); ctx.stroke();
  // neck, narrowing, then the handle with a white rubber grip
  ctx.beginPath();
  ctx.moveTo(L * 0.26, -L * 0.045); ctx.quadraticCurveTo(L * 0.36, -L * 0.03, L * 0.45, -L * 0.045);
  ctx.lineTo(L * 0.97, -L * 0.06); ctx.quadraticCurveTo(L * 1.02, -L * 0.03, L * 0.97, L * 0.005);
  ctx.lineTo(L * 0.45, L * 0.0); ctx.quadraticCurveTo(L * 0.36, -L * 0.012, L * 0.26, L * 0.015); ctx.closePath();
  ctx.fillStyle = SSD_PINK; ctx.fill(); ctx.stroke();
  ctx.fillStyle = "#ffffff"; stillRoundRect(L * 0.55, -L * 0.05, L * 0.36, L * 0.022, L * 0.011); ctx.fill();
  ctx.fillStyle = SSD_MINT; for (var r = 0; r < 4; r++) { ctx.beginPath(); ctx.arc(L * (0.6 + r * 0.08), -L * 0.016, L * 0.011, 0, Math.PI * 2); ctx.fill(); }
  // a shine down the handle
  ctx.strokeStyle = "rgba(255,255,255,0.7)"; ctx.lineWidth = lw * 0.8;
  ctx.beginPath(); ctx.moveTo(L * 0.5, -L * 0.035); ctx.lineTo(L * 0.92, -L * 0.045); ctx.stroke();
  ctx.restore();
}
// Where his glove holds the brush whose bristles touch (cx, cy).
function ssdBrushGrip(cx, cy, ang, L) {
  var ox = cx, oy = cy - L * 0.11, gx = L * 0.78, gy = -L * 0.02;
  return { x: ox + Math.cos(ang) * gx - Math.sin(ang) * gy, y: oy + Math.sin(ang) * gx + Math.cos(ang) * gy };
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
// Confetti for the veneers, laid out by a fixed pattern (replays).
function ssdConfetti(cx, cy, s, u, cols) {
  if (u <= 0 || u >= 1) return;
  for (var i = 0; i < 34; i++) {
    var a = -Math.PI / 2 + Math.sin(i * 7.31) * 1.3, sp = s * (2.2 + 1.6 * Math.abs(Math.sin(i * 3.7)));
    var px = cx + Math.cos(a) * sp * u, py = cy + Math.sin(a) * sp * u + u * u * s * 3.2;
    ctx.save(); ctx.globalAlpha *= 1 - u * u; ctx.translate(px, py); ctx.rotate(i + u * 12 * (i % 2 ? 1 : -1));
    ctx.fillStyle = cols[i % cols.length]; ctx.fillRect(-s * 0.06, -s * 0.03, s * 0.12, s * 0.06);
    ctx.restore();
  }
}
// A cartoon impact burst.
function ssdBurst(x, y, r, u, col) {
  if (u <= 0 || u >= 1) return;
  ctx.save(); ctx.globalAlpha *= 1 - u; ctx.translate(x, y); ctx.scale(0.5 + u, 0.5 + u);
  ctx.fillStyle = col || "#ffde3b"; ctx.strokeStyle = "#1b2a33"; ctx.lineWidth = Math.max(1.5, r * 0.08);
  ctx.beginPath();
  for (var p = 0; p < 16; p++) { var ra = p % 2 ? r * 0.45 : r, an = p / 16 * Math.PI * 2 + 0.2; ctx.lineTo(Math.cos(an) * ra, Math.sin(an) * ra); }
  ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.restore();
}

// Where the brush is at time t: head position (contact point), its angle.
// In: raised, coming in with him. Scrub: fast strokes side to side, working
// down the tooth row by row. Out: lifted away with a twirl.
function ssdBrushAt(t, tx, ty, ts) {
  var up = { x: tx + ts * 0.85, y: ty - ts * 1.5, a: 1.1 }; // held up out in front of him, bristles out
  if (t < SSD_SCRUB[0]) return up;
  if (t < SSD_SCRUB[1]) {
    var u = (t - SSD_SCRUB[0]) / (SSD_SCRUB[1] - SSD_SCRUB[0]);
    var lead = ssdEase(Math.min(1, u / 0.08)); // into contact
    var stroke = Math.sin((t - SSD_SCRUB[0]) * 21);
    var sx = tx - ts * 0.1 + stroke * ts * 0.48, sy = ty - ts * 0.98 + u * ts * 1.0;
    return { x: up.x + (sx - up.x) * lead, y: up.y + (sy - up.y) * lead, a: up.a + (-0.12 + stroke * 0.06 - up.a) * lead, stroke: stroke };
  }
  var o = ssdEase((t - SSD_SCRUB[1]) / 0.35);
  var end = { x: tx - ts * 0.1, y: ty + ts * 0.02, a: -0.12 };
  return { x: end.x + (up.x - end.x) * o, y: end.y + (up.y - end.y) * o, a: end.a + (up.a - end.a) * o };
}

function drawSugaSmilesJumbo(x, y, w, h) {
  if (SSD.show <= 0 || SSD.paused || !balls || !balls[SSD.id]) return;
  var t = SSD.t, k = h / 250, sans = "'Helvetica Neue', Helvetica, Arial, sans-serif";
  var sean = balls[SSD.id], ch = sean.baseChar || sean.char, look = ch.look || {};
  var hair = look.hairColors || [look.hairColor || "#8a3ffc", "#2d7ff9"];
  ctx.save();
  ctx.globalAlpha = Math.min(1, t / 0.2, SSD.show / 0.4);
  ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
  ssdBackdrop(x, y, w, h, k);
  // A candy-stripe swipe opens it.
  if (t < 0.45) {
    var sw = ssdEase(t / 0.45);
    ctx.save(); ctx.fillStyle = SSD_PINK;
    ctx.beginPath(); ctx.moveTo(x + w * (sw * 1.6 - 0.3), y); ctx.lineTo(x + w * (sw * 1.6 - 0.1), y); ctx.lineTo(x + w * (sw * 1.6 - 0.4), y + h); ctx.lineTo(x + w * (sw * 1.6 - 0.6), y + h); ctx.closePath(); ctx.fill();
    ctx.restore();
  }

  // Camera: a shake on every bonk and on the CAVITIES! stamp.
  var shake = 0;
  SSD_DROPS.forEach(function (d) { if (t > d && t < d + 0.18) shake += (1 - (t - d) / 0.18) * 5 * k; });
  if (t > 2.75 && t < 3.0) shake += (1 - (t - 2.75) / 0.25) * 9 * k;
  ctx.save();
  if (shake) ctx.translate(Math.sin(t * 97) * shake, Math.cos(t * 83) * shake * 0.6);

  // The logo, top left, bouncing in.
  var lp = Math.max(0, Math.min(1, (t - 0.1) / 0.45)), lb = lp >= 1 ? 1 : 1 + Math.sin(lp * Math.PI * 1.5) * (1 - lp) * 0.6 - (1 - lp) * 0.5;
  ctx.save(); ctx.translate(x + w * 0.2, y + h * 0.17); ctx.scale(lb, lb); ctx.globalAlpha *= Math.min(1, lp * 3);
  ssdLogo(0, 0, 34 * k, "FAMILY DENTISTRY");
  ctx.restore();

  // The tooth.
  var tx = x + w * 0.46, ty = y + h * 0.6, ts = h * 0.24;
  var brush = ssdBrushAt(t, tx, ty, ts);
  var landed = SSD_DROPS.filter(function (d) { return t >= d; }).length;
  var lastHit = landed ? t - SSD_DROPS[landed - 1] : 9;
  var scrubU = Math.max(0, Math.min(1, (t - SSD_SCRUB[0]) / (SSD_SCRUB[1] - SSD_SCRUB[0])));
  // each cavity grows in with a splat, and goes when the brush's row passes it
  var spots = SSD_SPOTS.map(function (sp, i) {
    if (t < SSD_DROPS[i]) return 0;
    var g = Math.min(1, (t - SSD_DROPS[i]) / 0.2);
    if (t > SSD_SCRUB[1]) g = 0; else if (t > SSD_SCRUB[0]) { var by = (brush.y - ty) / ts; g *= Math.max(0, Math.min(1, (sp[1] + 0.1 - by) / 0.22)); }
    return g;
  });
  var mood = 1 - landed / 3; if (mood < -1) mood = -1;
  if (t > SSD_SCRUB[0]) mood = Math.min(1, -1 + scrubU * 2.4);
  var pop = Math.max(0, Math.min(1, (t - 0.15) / 0.35)); // pops up at the start
  var pS = pop >= 1 ? 1 : ssdEase(pop) * (1 + Math.sin(pop * Math.PI) * 0.2);
  var wob = lastHit < 0.35 ? Math.sin(lastHit * 40) * 0.14 * (1 - lastHit / 0.35) : 0;
  if (t > SSD_SCRUB[0] && t < SSD_SCRUB[1]) wob = (brush.stroke || 0) * 0.04; // rocked by the strokes
  if (mood < -0.6 && t < SSD_SCRUB[0]) wob += Math.sin(t * 60) * 0.015; // trembling
  var squash = lastHit < 0.25 ? 1 - 0.16 * (1 - lastHit / 0.25) : 1;
  var hop = t > SSD_VENEER + 0.55 && t < SSD_VENEER + 1.0 ? Math.sin((t - SSD_VENEER - 0.55) / 0.45 * Math.PI) * ts * 0.35 : 0;
  var ven = ssdEase((t - SSD_VENEER) / 0.55);
  var gleam = t > SSD_SCRUB[1] + 0.15 ? (t - SSD_SCRUB[1] - 0.15) / 0.45 : 0;
  ctx.save(); ctx.translate(tx, ty + ts * 1.2 - hop); ctx.scale(pS / squash, pS * squash); ctx.translate(-tx, -ty - ts * 1.2);
  ssdTooth(tx, ty, ts, { mood: mood, spots: spots, veneer: ven, hair: hair, wobble: wob, gleam: gleam,
    shine: t > SSD_SCRUB[1] + 0.3 ? Math.min(1, (t - SSD_SCRUB[1] - 0.3) / 0.3) : 0, t: t, tearT: t, wink: t > SSD_VENEER + 1.0 });
  ctx.restore();

  // His Sugar Rush candies raining onto it, spinning, with trails.
  var kinds = [{ kind: "lollipop" }, { kind: "wrapped", color: "#ff5fa8" }, { kind: "candyCane" }, { kind: "gumball", color: "#2d7ff9" }, { kind: "donut" }, { kind: "cottonCandy" }];
  SSD_DROPS.forEach(function (d, i) {
    var size = ts * 0.42, sx = tx + SSD_SPOTS[i][0] * ts, hitY = ty + SSD_SPOTS[i][1] * ts - size * 0.4;
    var fall = function (u) { return { x: sx - (1 - u) * ts * 0.6 * (i % 2 ? -1 : 1), y: y - size + (hitY - y + size) * u * u }; };
    var u = (t - (d - 0.45)) / 0.45;
    if (u < 0) return;
    if (u < 1) {
      if (typeof drawSweet !== "function") return;
      for (var g = 3; g >= 1; g--) { // motion trail
        var gu = Math.max(0, u - g * 0.07), gp = fall(gu);
        ctx.save(); ctx.globalAlpha *= 0.18 * (4 - g) / 3; drawSweet(kinds[i], gp.x, gp.y, size, gu * 9); ctx.restore();
      }
      var fp = fall(u); drawSweet(kinds[i], fp.x, fp.y, size, u * 9);
      return;
    }
    var v = t - d, dir = i % 2 ? 1 : -1;
    ssdBurst(sx, hitY + size * 0.4, ts * 0.38, v / 0.3);
    if (v < 0.8) { // bounced off: tumble away
      ctx.save(); ctx.globalAlpha *= 1 - v / 0.8;
      if (typeof drawSweet === "function") drawSweet(kinds[i], sx + dir * v * ts * 2.4, hitY - v * ts * 2.2 + v * v * ts * 5.5, size, v * 14 * dir);
      ctx.restore();
    }
    if (v < 0.35) {
      var bs = v < 0.08 ? 0.6 + v / 0.08 * 0.7 : 1.3 - (v - 0.08) * 0.8;
      stillText(["BONK!", "TONK!", "CLUNK!", "BONK!", "THUNK!", "BONK!"][i], sx + dir * ts * 0.7, hitY - ts * 0.35, 20 * k * bs, "#ffde3b", w * 0.12, { stroke: "#1b2a33", strokeW: 0.22 });
    }
  });

  // The copy on the left, punching in.
  var cx = x + w * 0.17, sansO = { face: sans, weight: "900" };
  function copy(at, until, a, b, col) {
    if (t < at || t > until) return;
    var pu = Math.min(1, (t - at) / 0.3), ps = pu >= 1 ? 1 : 1.35 - 0.35 * ssdEase(pu) + Math.sin(pu * Math.PI) * 0.08;
    var a2 = Math.min(ssdFade(t, at, 0.12), 1 - ssdFade(t, until - 0.2, 0.2));
    ctx.save(); ctx.globalAlpha *= a2;
    ctx.translate(cx, y + h * 0.52); ctx.scale(ps, ps); ctx.rotate(-0.03);
    stillText(a, 0, 0, 28 * k, col || SSD_DEEP, w * 0.3, { stroke: "#ffffff", strokeW: 0.2 });
    ctx.restore();
    if (b) {
      ctx.save(); ctx.globalAlpha *= a2 * ssdFade(t, at + 0.2, 0.2);
      stillText(b, cx + (1 - ssdEase((t - at - 0.2) / 0.25)) * -30 * k, y + h * 0.68, 15 * k, "#1b2a33", w * 0.3, sansO);
      ctx.restore();
    }
  }
  copy(0.5, 2.7, "ATE TOO MUCH SUGA?", "It happens to the best of us.");
  copy(3.3, 5.6, "DR. SUGA IS IN.", "Gentle. Fast. Undefeated on plaque.");
  copy(5.7, SSD_VENEER, "SPARKLE CLEAN!", "");
  copy(SSD_VENEER, SSD_END, "NEW! RAINBOW VENEERS", "MATCH YOUR HAIR.", SSD_PINK);
  if (t > 2.75 && t < 3.3) { // CAVITIES! slammed on, with a red flash
    var su = ssdEase((t - 2.75) / 0.12);
    ctx.save(); ctx.fillStyle = "rgba(227,23,61," + (0.25 * (1 - ssdFade(t, 2.75, 0.4))) + ")"; ctx.fillRect(x - 20 * k, y - 20 * k, w + 40 * k, h + 40 * k); ctx.restore();
    ctx.save(); ctx.translate(tx, ty - ts * 0.2); ctx.rotate(-0.18); ctx.scale(2.4 - 1.4 * su, 2.4 - 1.4 * su); ctx.globalAlpha *= Math.min(1, su) * (1 - ssdFade(t, 3.05, 0.2));
    ctx.fillStyle = "rgba(255,255,255,0.85)"; stillRoundRect(-90 * k, -22 * k, 180 * k, 44 * k, 6 * k); ctx.fill();
    ctx.strokeStyle = "#e3173d"; ctx.lineWidth = 4 * k; ctx.stroke();
    stillText("CAVITIES!", 0, 0, 30 * k, "#e3173d", 170 * k);
    ctx.restore();
  }

  // Dr. Suga with the toothbrush in his front glove, the other in his guard.
  if (t > 3.15 && t < SSD_END + 0.3) {
    var inU = Math.max(0, Math.min(1, (t - 3.15) / 0.45));
    var slide = inU >= 1 ? 0 : (1 - ssdEase(inU)) * w * 0.35 - Math.sin(inU * Math.PI) * 14 * k;
    var sr = h * 0.27, sx0 = tx + ts * 2.75 + slide, sy0 = y + h * 0.62;
    var bob = brush.stroke ? brush.stroke * 3 * k : Math.sin(t * 5) * 2 * k;
    sx0 += bob; sy0 += Math.abs(bob) * 0.4;
    if (slide > 4 * k) { // speed lines on the way in
      ctx.strokeStyle = "rgba(27,42,51,0.35)"; ctx.lineWidth = 3 * k;
      for (var sl = 0; sl < 4; sl++) { var ly = sy0 + (sl - 1.5) * sr * 0.45; ctx.beginPath(); ctx.moveTo(sx0 + sr * 1.1, ly); ctx.lineTo(sx0 + sr * 1.1 + slide * 0.5, ly); ctx.stroke(); }
    }
    var bx = brush.x + (slide > 0 ? slide : 0);
    var L = ts * 2.0, skin = look.skin || "#f3d0b5", arm = sr * 0.2;
    var gr = sr * 0.28;
    // the ball, then his back hand in its guard, then the brush arm
    ctx.save(); ctx.translate(sx0, sy0 + sr); ctx.rotate((brush.stroke || 0) * 0.035 - (slide > 0 ? 0.12 : 0)); ctx.translate(-sx0, -sy0 - sr);
    stillFighter(sx0, sy0, sr, look, ch.name);
    // the dentist's head mirror, with a glint as he arrives
    ctx.fillStyle = "#cfd8dc"; ctx.strokeStyle = "#1b2a33"; ctx.lineWidth = 2 * k;
    ctx.beginPath(); ctx.arc(sx0 - sr * 0.15, sy0 - sr * 0.72, sr * 0.2, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "rgba(255,255,255,0.85)"; ctx.beginPath(); ctx.arc(sx0 - sr * 0.2, sy0 - sr * 0.77, sr * 0.07, 0, Math.PI * 2); ctx.fill();
    if (t > 3.5 && t < 3.9) ssdStar(sx0 - sr * 0.15, sy0 - sr * 0.72, sr * 0.45 * Math.sin((t - 3.5) / 0.4 * Math.PI), 1);
    ctx.restore();
    drawGlove(ctx, sx0 - sr * 1.0, sy0 + sr * 0.32, gr, look, "#0b0f12", Math.PI + 0.15); // guard glove at his side, like in the fight
    var twirl = t > SSD_SCRUB[1] && t < SSD_SCRUB[1] + 0.5 ? Math.sin((t - SSD_SCRUB[1]) / 0.5 * Math.PI) * 0.5 : 0;
    var grip = ssdBrushGrip(bx, brush.y, brush.a + twirl, L);
    // one arm from his shoulder, bending at the elbow (down and out) to the grip
    var sh = { x: sx0 - sr * 0.86, y: sy0 - sr * 0.22 };
    var ddx = grip.x - sh.x, ddy = grip.y - sh.y, dd = Math.sqrt(ddx * ddx + ddy * ddy) || 1, reach = sr * 1.3;
    var bend = Math.sqrt(Math.max(0, reach * reach / 4 - dd * dd / 4));
    var nx = -ddy / dd, ny = ddx / dd; if (ny < 0) { nx = -nx; ny = -ny; } // the elbow drops below the line
    var elbow = { x: (sh.x + grip.x) / 2 + nx * bend, y: (sh.y + grip.y) / 2 + ny * bend };
    strokeLimb(arm, skin, function () { ctx.moveTo(sh.x, sh.y); ctx.lineTo(elbow.x, elbow.y); ctx.lineTo(grip.x, grip.y); });
    if (brush.stroke) { // motion arcs behind the head
      ctx.strokeStyle = "rgba(255,255,255,0.8)"; ctx.lineWidth = 3 * k;
      ctx.beginPath(); ctx.moveTo(bx - brush.stroke * ts * 0.25, brush.y - ts * 0.08); ctx.quadraticCurveTo(bx - brush.stroke * ts * 0.5, brush.y - ts * 0.2, bx - brush.stroke * ts * 0.8, brush.y - ts * 0.05); ctx.stroke();
    }
    ssdBrush(bx, brush.y - L * 0.11, brush.a + twirl, L, k);
    drawGlove(ctx, grip.x, grip.y, gr, look, "#0b0f12", Math.atan2(grip.y - elbow.y, grip.x - elbow.x)); // knuckles out along his forearm, round the handle
    if (t > SSD_SCRUB[0] && t < SSD_SCRUB[1] + 0.3) {
      ssdFoam(tx, ty - ts * 0.35 + scrubU * ts * 0.3, ts * 0.9, Math.min(1, (t - SSD_SCRUB[0]) / 0.3) * (1 - ssdFade(t, SSD_SCRUB[1], 0.3)), t);
      var sc = Math.floor((t - SSD_SCRUB[0]) / 0.45);
      if (t < SSD_SCRUB[1]) {
        var su2 = ((t - SSD_SCRUB[0]) % 0.45) / 0.45;
        stillText(sc % 2 ? "SCRUB!" : "SCRUB!", tx + (sc % 2 ? -1 : 1) * ts * 1.15, ty - ts * (0.9 + su2 * 0.4), 17 * k * (0.8 + 0.4 * Math.min(1, su2 * 4)), "#ffffff", w * 0.1, { stroke: SSD_MINT, strokeW: 0.25 });
        stillText("BZZZZZ", tx + ts * 0.2 + Math.sin(t * 60) * 2.5 * k, y + h * 0.1, 20 * k, SSD_MINT, w * 0.14, { stroke: "#1b2a33", strokeW: 0.18 });
      }
    }
    if (t > SSD_SCRUB[1] + 0.1 && t < SSD_SCRUB[1] + 0.6) stillText("TING!", tx + ts * 0.9, ty - ts * 1.35, 22 * k * (1 + 0.3 * Math.sin((t - SSD_SCRUB[1]) * 12)), "#ffffff", w * 0.1, { stroke: "#1b2a33", strokeW: 0.2, glow: "rgba(255,255,255,0.9)" });
  }
  // The veneers: confetti and the 50% OFF badge spinning in.
  ssdConfetti(tx, ty - ts * 0.2, ts, (t - SSD_VENEER - 0.45) / 1.1, [hair[0], hair[1] || hair[0], SSD_PINK, SSD_MINT, "#ffde3b"]);
  if (t > SSD_VENEER + 0.3 && t < SSD_END) {
    var bp = Math.min(1, (t - SSD_VENEER - 0.3) / 0.35), bsc = bp >= 1 ? 1 : ssdEase(bp) * (1 + Math.sin(bp * Math.PI) * 0.3);
    ctx.save(); ctx.translate(tx - ts * 1.35, y + h * 0.32); ctx.rotate(0.15 + Math.sin(t * 5) * 0.06 - (1 - ssdEase(bp)) * 3); ctx.scale(bsc, bsc);
    ctx.fillStyle = "#ffde3b"; ctx.strokeStyle = "#1b2a33"; ctx.lineWidth = 2.5 * k;
    ctx.beginPath();
    for (var p = 0; p < 24; p++) { var ra = p % 2 ? 40 * k : 48 * k, an = p / 24 * Math.PI * 2; ctx.lineTo(Math.cos(an) * ra, Math.sin(an) * ra); }
    ctx.closePath(); ctx.fill(); ctx.stroke();
    stillText("50% OFF", 0, -8 * k, 17 * k, "#e3173d", 70 * k);
    stillText("CODE: SUGASHOW", 0, 12 * k, 8 * k, "#1b2a33", 72 * k, sansO);
    ctx.restore();
  }
  ctx.restore(); // (the shake)

  // The end card: a pink wipe, the logo drops in, the tooth winks.
  if (t > SSD_END) {
    var e = ssdEase((t - SSD_END) / 0.35);
    ctx.save();
    var eg = ctx.createLinearGradient(x, y, x + w, y + h);
    eg.addColorStop(0, "#ffe3f1"); eg.addColorStop(1, "#d7fff4");
    ctx.fillStyle = eg; ctx.beginPath(); ctx.rect(x, y, w * e * 1.05, h); ctx.fill();
    ctx.fillStyle = SSD_PINK; if (e < 1) ctx.fillRect(x + w * e * 1.05 - 8 * k, y, 8 * k, h);
    ctx.restore();
    var dp = Math.max(0, Math.min(1, (t - SSD_END - 0.2) / 0.45)), db = dp >= 1 ? 0 : (1 - dp) * (1 - dp) * -h * 0.6 + Math.sin(dp * Math.PI * 2) * (1 - dp) * 10 * k;
    if (dp > 0) {
      ctx.save(); ctx.translate(x + w * 0.5, y + h * 0.36 + db);
      ssdLogo(0, 0, 54 * k, "DENTAL");
      ctx.restore();
    }
    ctx.save(); ctx.globalAlpha *= ssdFade(t, SSD_END + 0.55, 0.3);
    var tag = "Eat the candy. We'll handle the rest.", n = Math.min(tag.length, Math.floor((t - SSD_END - 0.55) * 45));
    if (n > 0) stillText(tag.slice(0, n), x + w * 0.5, y + h * 0.7, 24 * k, "#1b2a33", w * 0.8, { face: sans, weight: "italic 800" });
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
  if (SSD.music) { try { SSD.music.stop(); } catch (e) { /* already stopped */ } SSD.music = null; }
  if (!SSD.out) return;
  try { SSD.out.disconnect(); } catch (e) { /* already gone */ }
  SSD.out = null;
}
