// Incredible Bulk (Joe, 2026-11-27): Francis Ngannou's protein powder
// commercial on the jumbotron (a banner in the test arena), a parody of the
// old green-giant comics, with the logo from incredible-bulk-art.js. It plays
// once a match, right after his first rage punch (his Hulk mode, ngannou.js
// endRage), hit or miss. Shot like a movie trailer, letterboxed with grain:
//   1. A dark gym at night, one lamp swinging over a tub of Incredible Bulk
//      on the bench in the fog. THEY TRAIN. HE BULKS.
//   2. Francis shakes the shaker (SHAKE SHAKE) and chugs it (GLUG GLUG).
//      CHIEF BULK OFFICER.
//   3. The change: he goes green and grows, the shaker crushes in his glove,
//      the lamp bursts, the floor cracks, lightning, RAAAGH! and both fists
//      up. SIDE EFFECTS MAY INCLUDE: RAGE.
//   4. The flavours slam down in front of him: VANILLA, CHOCOLATE, then the
//      new Salkilld Bakery collab, CAKE BATTER (DC's bakery logo on the tub,
//      salkilld-art.js), in a shower of sprinkles.
//   5. He shakes up the cake batter and it bursts in his glove: SPLAT, pink
//      batter on the lens. TOO STRONG.
//   6. The logo on green rays, the three tubs, "Don't make him hungry."
// Only his own two arms and gloves. Code-made sound: a trailer pulse and
// heartbeat, shaker rattles, glugs, the crunch, a roar and braams, the slams,
// a drumroll, the splat, the sting. Like the Salkilld Bakery ad, if a special,
// clash, lock or cutscene starts while it plays it pauses (off the jumbotron,
// sound stopped, clock held) and finishes after. ngannou.bulkAd false in his
// character file switches it off. Plus a silent still for the random rotation
// (drawBulkStill, still-ads.js). Helpers shared with samurai-sushi-ad.js
// (ssuEase, ssuOut, ssuFade, ssuR, ssuStar), salkilld-ad.js (skbPop) and
// ngannou.js (ngHex, NG_GREEN) are global.
"use strict";

var IBK_SHOW = 13.6;
var IBK_CUTS = [0, 2.2, 4.6, 7.0, 9.6, 11.4, IBK_SHOW];
var IBK_INK = "#140c18";
var IBK_CUES = [["thump", 0.1], ["thump", 0.9], ["thump", 1.7],
  ["rattle", 2.35], ["rattle", 2.65], ["rattle", 2.95], ["rattle", 3.25], ["glug", 3.75], ["glug", 4.05], ["glug", 4.35],
  ["braam", 4.6], ["crunch", 5.6], ["roar", 5.95], ["glass", 6.0], ["braam2", 6.0],
  ["slam", 7.15], ["slam", 7.65], ["roll", 8.05], ["bigslam", 8.5], ["sparkle", 8.6],
  ["rattle", 9.75], ["rattle", 9.95], ["squeeze", 10.2], ["splat", 10.32],
  ["whoosh", 11.4], ["sting", 11.5], ["sparkle", 11.9]];
var IBK = { show: 0, t: 0, id: 0, done: false, paused: false, cue: 0, out: null, nb: null };

// From startMatchWith (through resetAdBreaks).
function resetBulkAd() { IBK.show = 0; IBK.t = 0; IBK.done = false; IBK.paused = false; IBK.cue = 0; stopBulkSound(); }
// From endRage (ngannou.js): his first rage punch is done.
function bulkOnRage(b) {
  var c = b && b.char && b.char.ngannou;
  if (IBK.done || (c && c.bulkAd === false) || (typeof galleryDemo !== "undefined" && galleryDemo)) return;
  IBK.done = true; IBK.id = b.id; // (once a match)
  queueJumboAd(IBK_SHOW, function () {
    if (over) { jumboAdLeft = 0; return; }
    IBK.show = IBK_SHOW; IBK.t = 0; IBK.cue = 0; IBK.paused = false;
    ibkDuck(); ibkScoreFrom(0);
  });
}
function ibkDuck() {
  try { var ac = getAudioCtx(); if (ac && typeof duckMusic === "function") duckMusic(ac.currentTime, ac.currentTime + IBK.show); } catch (e) { /* no audio */ }
}
// A special, a clash, a lock or a cutscene on: the ad holds.
function bulkHold() {
  return (typeof jumboHold === "function" && jumboHold(null)) || (typeof sceneLocked === "function" && sceneLocked());
}
// Every frame, from tickAdBreaks (ad-breaks.js).
function tickBulkAd(dt) {
  if (IBK.show <= 0) return;
  if (bulkHold()) {
    if (!IBK.paused) { IBK.paused = true; stopBulkSound(); }
    if (typeof jumboAdLeft !== "undefined" && jumboAdLeft > 0) jumboAdLeft += dt;
    return;
  }
  if (IBK.paused) { IBK.paused = false; ibkDuck(); ibkScoreFrom(IBK.t); }
  IBK.show = Math.max(0, IBK.show - dt);
  IBK.t = IBK_SHOW - IBK.show;
  while (IBK.cue < IBK_CUES.length && IBK.t >= IBK_CUES[IBK.cue][1]) {
    if (IBK.t - IBK_CUES[IBK.cue][1] < 0.25) playBulkCue(IBK_CUES[IBK.cue][0]);
    IBK.cue++;
  }
}

// ---------------------------------------------------------------- helpers
function ibkText(txt, x, y, size, col, maxW, o) {
  o = o || {};
  stillText(txt, x, y, size, col, maxW, { face: IBK_FONT, weight: o.weight || "900", stroke: o.stroke, strokeW: o.strokeW || 0.2, glow: o.glow, align: o.align });
}
// Trailer title: wide-spaced, fades in and out.
function ibkTitle(txt, x, y, size, col, a, maxW) {
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha *= a;
  stillText(txt.split("").join(" "), x, y, size, col, maxW, { face: IBK_FONT, weight: "900", glow: "rgba(0,0,0,0.9)" });
  ctx.restore();
}
// His look, `g` of the way to green (0 normal, 1 full Bulk).
function ibkChar(ch, g) {
  var base = (ch && (ch.ngLookBaseAd || ch.look)) || {}, look = Object.assign({}, base);
  if (g > 0 && base.skin && typeof ngHex === "function") look.skin = ngHex(base.skin, typeof NG_GREEN === "string" ? NG_GREEN : "#3f9a36", Math.min(1, g));
  return { look: look, name: (ch && ch.name) || "", color: (ch && ch.color) || "#4b5563" };
}
// One of his own arms, shoulder -> elbow -> glove. Returns the forearm angle.
function ibkArm(ch, sx, sy, ex, ey, hx, hy, r, side) {
  if (typeof hasArmMuscle === "function" && hasArmMuscle(ch)) {
    drawArmMuscle(ctx, ch, sx, sy, ex, ey, r * 0.2, "#0b0f12");
    drawArmMuscle(ctx, ch, ex, ey, hx, hy, r * 0.2, "#0b0f12");
    return Math.atan2(hy - ey, hx - ex);
  }
  return dccArm({ char: ch }, sx, sy, ex, ey, hx, hy, r, side);
}
function ibkGlove(ch, hx, hy, r, ang) { drawGlove(ctx, hx, hy, r * 0.23, ch.look, "#0b0f12", ang); }
// Francis, the ball with his two arms. o.pose: "side" (fists down), "shake"
// / "hold" (the far glove at o.hand with o.item drawn in it), "chug" (the far
// glove up at his mouth), "flex" (both fists up). o.shiver shakes the near fist.
function ibkFrancis(cx, cy, r, ch, o) {
  o = o || {};
  stillFighter(cx, cy, r, ch.look, ch.name);
  var sv = o.shiver || 0, jx = (ssuR(Math.floor((o.t || 0) * 40)) - 0.5) * sv * r * 0.08;
  if (o.pose === "flex") {
    [-1, 1].forEach(function (s) {
      var sx = cx + s * r * 0.62, sy = cy - r * 0.15, ex = sx + s * r * 0.5, ey = sy - r * 0.02, hx = cx + s * r * 1.02 + jx, hy = cy - r * 0.88;
      var a = ibkArm(ch, sx, sy, ex, ey, hx, hy, r, s);
      ibkGlove(ch, hx, hy, r, -Math.PI / 2 + s * 0.1 + a * 0);
    });
    return;
  }
  // near (left) arm: a fist down at his side, shaking as the rage builds
  var nh = { x: cx - r * 1.05 + jx, y: cy + r * 0.55 };
  var na = ibkArm(ch, cx - r * 0.8, cy + r * 0.05, cx - r * 1.12, cy + r * 0.3, nh.x, nh.y, r, -1);
  ibkGlove(ch, nh.x, nh.y, r, na);
  // far (right) arm
  var h = o.hand || { x: cx + r * 1.1, y: cy + r * 0.2 }, e;
  if (o.pose === "chug") e = { x: cx + r * 1.2, y: cy - r * 0.05 };
  else e = { x: Math.max(h.x, cx + r * 1.15), y: Math.max(h.y, cy + r * 0.25) + r * 0.2 };
  var fa = ibkArm(ch, cx + r * 0.8, cy + r * 0.05, e.x, e.y, h.x, h.y, r, 1);
  if (o.item) o.item(h.x, h.y, fa);
  ibkGlove(ch, h.x, h.y, r, fa);
}
// A shaker bottle, (x, y) where the glove holds it, s scale, `fill` 0..1 how
// full, `liq` the colour, `rot` its tilt, `crush` 0..1 crushed in the glove.
function ibkShaker(x, y, s, fill, liq, rot, crush) {
  crush = crush || 0;
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot || 0); ctx.scale(s * (1 + crush * 0.25), s * (1 - crush * 0.45));
  var w = 22, h = 44, top = -h * 0.7;
  ctx.lineJoin = "round";
  // the cup
  ctx.beginPath(); ctx.moveTo(-w / 2, top); ctx.lineTo(w / 2, top); ctx.lineTo(w / 2 - 2 - crush * 6, top + h); ctx.lineTo(-w / 2 + 2 + crush * 4, top + h); ctx.closePath();
  ctx.fillStyle = "rgba(220,240,255,0.35)"; ctx.fill();
  if (fill > 0) {
    ctx.save(); ctx.clip();
    ctx.fillStyle = liq; ctx.fillRect(-w, top + h * (1 - fill), w * 2, h * fill + 2);
    ctx.fillStyle = "rgba(255,255,255,0.35)"; ctx.fillRect(-w, top + h * (1 - fill), w * 2, 2);
    ctx.restore();
  }
  ctx.lineWidth = 2.2; ctx.strokeStyle = IBK_INK; ctx.stroke();
  ctx.fillStyle = "rgba(255,255,255,0.45)"; ctx.fillRect(-w / 2 + 3, top + 4, 3, h - 10);
  // the lid and spout
  ctx.fillStyle = "#1a1a1a"; stillRoundRect(-w / 2 - 2, top - 8, w + 4, 9, 3); ctx.fill();
  ctx.fillStyle = IBK_GREEN; ctx.fillRect(-w / 2 - 2, top - 3, w + 4, 2);
  ctx.fillStyle = "#1a1a1a"; ctx.fillRect(-3, top - 14, 6, 7);
  // a little green label
  ctx.fillStyle = IBK_GREEN; ctx.fillRect(-w / 2 + 1, top + h * 0.35, w - 2 - crush * 4, 9);
  ctx.fillStyle = "#ffffff"; ctx.font = "900 6px " + IBK_FONT; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("BULK", 0, top + h * 0.35 + 4.8);
  ctx.restore();
}
// A tub of Incredible Bulk standing on (x, y), s scale. kind: "vanilla",
// "chocolate" or "cake" (the Salkilld Bakery collab).
var IBK_FLAVOURS = {
  vanilla: { body: ["#fff8e4", "#efe0b8", "#c9b37e"], lid: "#2a2a2a", band: "#f2d27a", bandInk: "#5a3d0a", name: "VANILLA" },
  chocolate: { body: ["#7a4a2a", "#5a321c", "#2e170a"], lid: "#1a1a1a", band: "#3a1e0e", bandInk: "#ffe2b8", name: "CHOCOLATE" },
  cake: { body: ["#ffe1ee", "#ffb6d2", "#e07fa8"], lid: "#ffffff", band: "#3fb0ec", bandInk: "#ffffff", name: "CAKE BATTER" }
};
function ibkTub(x, y, s, kind) {
  var f = IBK_FLAVOURS[kind] || IBK_FLAVOURS.vanilla, w = 72, h = 96;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = "rgba(0,0,0,0.35)"; ctx.beginPath(); ctx.ellipse(0, 2, w * 0.62, 7, 0, 0, Math.PI * 2); ctx.fill();
  // the body, shaded like a cylinder
  var g = ctx.createLinearGradient(-w / 2, 0, w / 2, 0);
  g.addColorStop(0, f.body[2]); g.addColorStop(0.3, f.body[0]); g.addColorStop(0.65, f.body[1]); g.addColorStop(1, f.body[2]);
  ctx.fillStyle = g; ctx.strokeStyle = IBK_INK; ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.moveTo(-w / 2, -h + 10); ctx.lineTo(w / 2, -h + 10); ctx.lineTo(w / 2 - 2, -4); ctx.quadraticCurveTo(0, 4, -w / 2 + 2, -4); ctx.closePath(); ctx.fill(); ctx.stroke();
  if (kind === "cake") { // sprinkles on the tub
    ctx.save(); ctx.clip();
    var sc = ["#ff4d6d", "#ffd23a", "#4dc3ff", "#7bdc5a", "#b56bff", "#ffffff"];
    for (var i = 0; i < 26; i++) {
      ctx.save(); ctx.translate(-w / 2 + ssuR(i + 3) * w, -h + 14 + ssuR(i + 30) * (h - 18)); ctx.rotate(ssuR(i + 60) * 3);
      ctx.fillStyle = sc[i % sc.length]; stillRoundRect(-3, -1, 6, 2.2, 1); ctx.fill(); ctx.restore();
    }
    ctx.restore();
  }
  // the lid
  ctx.fillStyle = f.lid; stillRoundRect(-w / 2 - 3, -h, w + 6, 13, 4); ctx.fill(); ctx.stroke();
  ctx.fillStyle = "rgba(255,255,255,0.25)"; ctx.fillRect(-w / 2, -h + 2, w, 2.5);
  if (kind === "cake") {
    ctx.fillStyle = "rgba(255,255,255,0.88)"; stillRoundRect(-w / 2 + 4, -82, w - 8, 56, 6); ctx.fill();
    drawBulkLogo(ctx, 0, -70, 60);
    ctx.fillStyle = IBK_INK; ctx.font = "900 9px " + IBK_FONT; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("×", 0, -54);
    drawSalkilldLogo(ctx, 0, -40, 54);
  } else drawBulkLogo(ctx, 0, -64, 66);
  // the flavour band
  ctx.fillStyle = f.band; ctx.fillRect(-w / 2 + 1, -24, w - 2, 13);
  ctx.strokeStyle = IBK_INK; ctx.lineWidth = 1.5; ctx.strokeRect(-w / 2 + 1, -24, w - 2, 13);
  ctx.fillStyle = f.bandInk; ctx.font = "900 9px " + IBK_FONT; ctx.textAlign = "center"; ctx.textBaseline = "middle";
  var tw = ctx.measureText(f.name).width; if (tw > w - 8) { ctx.save(); ctx.scale((w - 8) / tw, 1); ctx.fillText(f.name, 0, -17); ctx.restore(); } else ctx.fillText(f.name, 0, -17);
  ctx.fillStyle = kind === "chocolate" ? "rgba(255,230,200,0.7)" : "rgba(40,20,10,0.6)"; ctx.font = "800 5.5px " + IBK_FONT;
  ctx.fillText("5 LBS · 50G PROTEIN", 0, -6);
  // a gloss down the side
  ctx.fillStyle = "rgba(255,255,255,0.18)"; ctx.fillRect(-w / 2 + 8, -h + 14, 5, h - 22);
  ctx.restore();
}
// A green lightning bolt from (x0, y0) to (x1, y1).
function ibkBolt(x0, y0, x1, y1, seed, a) {
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha *= a; ctx.globalCompositeOperation = "lighter";
  var pts = [[x0, y0]], n = 7;
  for (var i = 1; i < n; i++) { var u = i / n; pts.push([x0 + (x1 - x0) * u + (ssuR(seed + i) - 0.5) * 34, y0 + (y1 - y0) * u + (ssuR(seed + i + 9) - 0.5) * 20]); }
  pts.push([x1, y1]);
  [[7, "rgba(90,255,80,0.35)"], [2.5, "rgba(220,255,210,0.95)"]].forEach(function (p) {
    ctx.lineWidth = p[0]; ctx.strokeStyle = p[1]; ctx.lineJoin = "miter";
    ctx.beginPath(); pts.forEach(function (q, k) { if (k) ctx.lineTo(q[0], q[1]); else ctx.moveTo(q[0], q[1]); }); ctx.stroke();
  });
  ctx.restore();
}
// The gym: dark walls, a rack, a heavy bag, the floor, fog.
function ibkGym(ww, t, lamp) {
  var bg = ctx.createLinearGradient(0, 0, 0, 250); bg.addColorStop(0, "#07080b"); bg.addColorStop(1, "#15161c");
  ctx.fillStyle = bg; ctx.fillRect(-ww, -250, ww * 3, 750);
  // brick hints on the back wall
  ctx.strokeStyle = "rgba(255,255,255,0.035)"; ctx.lineWidth = 1;
  for (var by = 30; by < 190; by += 16) { ctx.beginPath(); ctx.moveTo(-ww, by); ctx.lineTo(ww * 2, by); ctx.stroke(); for (var bx = (by / 16) % 2 * 20; bx < ww; bx += 40) { ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx, by + 16); ctx.stroke(); } }
  // a heavy bag on a chain, a plate rack
  ctx.strokeStyle = "#2b2b30"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(ww * 0.12, -10); ctx.lineTo(ww * 0.12, 60); ctx.stroke();
  ctx.fillStyle = "#1c1214"; stillRoundRect(ww * 0.12 - 18, 58, 36, 110, 14); ctx.fill();
  ctx.fillStyle = "#18181d"; ctx.fillRect(ww * 0.84, 90, 8, 110); ctx.fillRect(ww * 0.92, 90, 8, 110);
  for (var p = 0; p < 4; p++) { ctx.fillStyle = "#101014"; ctx.beginPath(); ctx.ellipse(ww * 0.88 + 4, 112 + p * 22, 6, 18 - p * 2, 0, 0, Math.PI * 2); ctx.fill(); }
  // the floor
  ctx.fillStyle = "#0c0c10"; ctx.fillRect(-ww, 200, ww * 3, 300);
  // the lamp's cone
  var lx = lamp.x, ly = lamp.y, lw = lamp.k || 1;
  if (lw > 0) {
    ctx.save(); ctx.globalCompositeOperation = "lighter";
    var cg = ctx.createLinearGradient(0, ly, 0, 215);
    cg.addColorStop(0, "rgba(255,240,200," + (0.35 * lw).toFixed(3) + ")"); cg.addColorStop(1, "rgba(255,230,180," + (0.08 * lw).toFixed(3) + ")");
    ctx.fillStyle = cg; ctx.beginPath(); ctx.moveTo(lx - 10, ly); ctx.lineTo(lx + 10, ly); ctx.lineTo(lamp.fx + 150, 214); ctx.lineTo(lamp.fx - 150, 214); ctx.closePath(); ctx.fill();
    var pool = ctx.createRadialGradient(lamp.fx, 210, 5, lamp.fx, 210, 170);
    pool.addColorStop(0, "rgba(255,236,190," + (0.3 * lw).toFixed(3) + ")"); pool.addColorStop(1, "rgba(255,236,190,0)");
    ctx.fillStyle = pool; ctx.beginPath(); ctx.ellipse(lamp.fx, 210, 170, 22, 0, 0, Math.PI * 2); ctx.fill();
    // dust motes in the light
    for (var m = 0; m < 26; m++) {
      var u = ssuR(m + 7), my = ly + 20 + ((ssuR(m + 40) * 180 + t * (6 + u * 8)) % 180), spread = (my - ly) / (214 - ly);
      var mx = lx + (lamp.fx - lx) * spread + (ssuR(m + 80) - 0.5) * 260 * spread + Math.sin(t * 0.8 + m) * 4;
      ctx.fillStyle = "rgba(255,240,210," + (0.35 * lw * (0.4 + u * 0.6)).toFixed(3) + ")"; ctx.beginPath(); ctx.arc(mx, my, 0.8 + u, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  }
  // the lamp itself
  ctx.strokeStyle = "#333"; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(lamp.px, -5); ctx.lineTo(lx, ly - 8); ctx.stroke();
  ctx.fillStyle = "#2a2a2e"; ctx.beginPath(); ctx.moveTo(lx - 14, ly); ctx.lineTo(lx + 14, ly); ctx.lineTo(lx + 6, ly - 10); ctx.lineTo(lx - 6, ly - 10); ctx.closePath(); ctx.fill();
  if (lw > 0) { ctx.fillStyle = "rgba(255,246,220," + lw.toFixed(3) + ")"; ctx.beginPath(); ctx.arc(lx, ly + 1, 5, 0, Math.PI); ctx.fill(); }
}
function ibkFog(ww, t, a, tint) {
  ctx.save(); ctx.globalAlpha *= a;
  for (var i = 0; i < 7; i++) {
    var fx = ((ssuR(i + 2) * ww * 1.4 + t * (10 + i * 3)) % (ww * 1.4)) - ww * 0.2, fy = 196 + ssuR(i + 20) * 26;
    var fg = ctx.createRadialGradient(fx, fy, 4, fx, fy, 110);
    fg.addColorStop(0, tint || "rgba(170,175,190,0.22)"); fg.addColorStop(1, "rgba(170,175,190,0)");
    ctx.fillStyle = fg; ctx.beginPath(); ctx.ellipse(fx, fy, 160, 26, 0, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}
function ibkLampAt(ww, t, cx) {
  var sw = Math.sin(t * 1.7) * 0.12;
  return { px: cx, x: cx + Math.sin(sw) * 70, y: 6 + Math.cos(sw) * 50, fx: cx + Math.sin(sw) * 150, k: 1 };
}
// Sprinkles bursting out from (x, y), `u` seconds after.
function ibkSprinkles(x, y, u, seed, n, spd) {
  if (u < 0 || u > 1.6) return;
  var sc = ["#ff4d6d", "#ffd23a", "#4dc3ff", "#7bdc5a", "#b56bff", "#ffffff"];
  for (var i = 0; i < n; i++) {
    var a = ssuR(seed + i) * Math.PI * 2, sp = (60 + ssuR(seed + i + 50) * 160) * (spd || 1);
    var px = x + Math.cos(a) * sp * u, py = y + Math.sin(a) * sp * u - 60 * u + 140 * u * u;
    ctx.save(); ctx.globalAlpha *= Math.max(0, 1 - u / 1.6); ctx.translate(px, py); ctx.rotate(a + u * 8);
    ctx.fillStyle = sc[i % sc.length]; stillRoundRect(-3.5, -1.2, 7, 2.6, 1.2); ctx.fill(); ctx.restore();
  }
}
// A splat of cake batter (pink, with sprinkles), radius r.
function ibkSplat(x, y, r, seed, a) {
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y);
  ctx.beginPath();
  var n = 14;
  for (var i = 0; i <= n; i++) {
    var ang = i / n * Math.PI * 2, k = 0.75 + ssuR(seed + i) * 0.45 + (i % 3 === 0 ? 0.35 : 0);
    var px = Math.cos(ang) * r * k, py = Math.sin(ang) * r * k;
    if (i === 0) ctx.moveTo(px, py); else ctx.quadraticCurveTo(Math.cos(ang - 0.2) * r * 1.15, Math.sin(ang - 0.2) * r * 1.15, px, py);
  }
  var g = ctx.createRadialGradient(-r * 0.3, -r * 0.3, 2, 0, 0, r * 1.2); g.addColorStop(0, "#ffe6f0"); g.addColorStop(0.6, "#ffb3cf"); g.addColorStop(1, "#e8789f");
  ctx.fillStyle = g; ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.6)"; ctx.beginPath(); ctx.ellipse(-r * 0.3, -r * 0.35, r * 0.28, r * 0.12, -0.5, 0, Math.PI * 2); ctx.fill();
  var sc = ["#ff4d6d", "#ffd23a", "#4dc3ff", "#7bdc5a", "#b56bff"];
  for (var s = 0; s < Math.round(r / 4); s++) {
    ctx.save(); ctx.translate((ssuR(seed + s + 30) - 0.5) * r * 1.2, (ssuR(seed + s + 60) - 0.5) * r * 1.2); ctx.rotate(ssuR(seed + s) * 3);
    ctx.fillStyle = sc[s % sc.length]; stillRoundRect(-r * 0.06, -r * 0.02, r * 0.12, r * 0.045, 1); ctx.fill(); ctx.restore();
  }
  ctx.restore();
}

// ---------------------------------------------------------------- the shots
// Each draws in world units: 250 tall, ww wide.
function ibkShot0(ww, t, lt) { // the gym, the tub in the light
  var z = 1 + lt / 2.2 * 0.12;
  ctx.translate(ww / 2, 180); ctx.scale(z, z); ctx.translate(-ww / 2, -180);
  var lamp = ibkLampAt(ww, t, ww / 2);
  ibkGym(ww, t, lamp);
  // the bench
  ctx.fillStyle = "#1d1d22"; ctx.fillRect(ww / 2 - 110, 178, 220, 14);
  ctx.fillStyle = "#2c2c33"; ctx.fillRect(ww / 2 - 110, 176, 220, 4);
  ctx.fillStyle = "#121216"; ctx.fillRect(ww / 2 - 96, 192, 10, 22); ctx.fillRect(ww / 2 + 86, 192, 10, 22);
  ibkTub(ww / 2, 178, 1.05, "vanilla");
  // a rim light on the tub from the lamp
  ctx.save(); ctx.globalCompositeOperation = "lighter";
  var rg = ctx.createRadialGradient(lamp.fx, 120, 4, lamp.fx, 140, 90); rg.addColorStop(0, "rgba(255,240,200,0.18)"); rg.addColorStop(1, "rgba(255,240,200,0)");
  ctx.fillStyle = rg; ctx.fillRect(ww / 2 - 100, 60, 200, 130); ctx.restore();
  ibkFog(ww, t, 1);
}
function ibkShot1(ww, t, lt, ch) { // SHAKE SHAKE, GLUG GLUG
  var lamp = ibkLampAt(ww, t, ww * 0.45);
  ibkGym(ww, t, lamp);
  var z = 1 + lt * 0.02;
  ctx.save(); ctx.translate(ww * 0.42, 170); ctx.scale(z, z); ctx.translate(-ww * 0.42, -170);
  var r = 70, cx = ww * 0.42, cy = 212 - r, c = ibkChar(ch, 0);
  var chug = lt > 1.25, sh = !chug ? Math.sin(lt * 34) : 0, cu = ssuEase((lt - 1.25) / 0.25);
  var hand = chug ? { x: cx + r * (1.1 - 0.62 * cu), y: cy + r * (0.15 - 0.95 * cu) } : { x: cx + r * 1.2, y: cy + r * 0.05 + sh * r * 0.22 };
  var fill = chug ? Math.max(0, 0.85 - (lt - 1.5) / 0.9 * 0.85) : 0.85;
  ibkFrancis(cx, cy, r, c, { pose: chug ? "chug" : "hold", hand: hand, t: t, shiver: chug ? 0.5 : 0, item: function (hx, hy) {
    ibkShaker(hx, hy - 8, 1.4, fill, "#efe3c4", chug ? -2.4 * cu : sh * 0.25, 0);
  } });
  ctx.restore();
  ibkFog(ww, t, 0.8);
  if (!chug) {
    [[0.15, "SHAKE"], [0.6, "SHAKE"]].forEach(function (w, k) {
      var p = skbPop(lt, w[0], 0.25); if (p <= 0 || lt > 1.25) return;
      ctx.save(); ctx.translate(ww * (0.66 + k * 0.14), 70 + k * 26); ctx.scale(p, p); ctx.rotate(-0.1 + k * 0.15);
      ibkText(w[1], 0, 0, 26, "#ffffff", 200, { stroke: IBK_INK, strokeW: 0.24 }); ctx.restore();
    });
  } else {
    [[1.55, "GLUG"], [1.85, "GLUG"], [2.15, "GLUG"]].forEach(function (w, k) {
      var p = skbPop(lt, w[0], 0.2); if (p <= 0) return;
      ctx.save(); ctx.translate(ww * (0.62 + k * 0.1), 60 + k * 30); ctx.scale(p, p); ctx.rotate(-0.08 + k * 0.08);
      ibkText(w[1], 0, 0, 22, "#ffe9a8", 200, { stroke: IBK_INK, strokeW: 0.24 }); ctx.restore();
    });
  }
  // the lower third
  var la = ssuFade(lt, 0.2, 0.3) * (1 - ssuFade(lt, 1.2, 0.2));
  if (la > 0) {
    ctx.save(); ctx.globalAlpha *= la;
    ctx.fillStyle = IBK_PURPLE; stillRoundRect(ww * 0.64, 150, ww * 0.3, 40, 6); ctx.fill();
    ctx.fillStyle = IBK_GREEN; stillRoundRect(ww * 0.64, 184, ww * 0.3, 16, 5); ctx.fill();
    ibkText((ch.name || "FRANCIS NGANNOU").toUpperCase(), ww * 0.79, 167, 16, "#ffffff", ww * 0.28, {});
    ibkText("CHIEF BULK OFFICER", ww * 0.79, 192, 10, "#ffffff", ww * 0.27, {});
    ctx.restore();
  }
}
function ibkShot2(ww, t, lt, ch) { // the change
  var g = ssuEase((lt - 0.3) / 1.1), burst = lt >= 1.4;
  var shk = Math.min(1, lt / 1.4) * (burst ? 1.6 - Math.min(0.9, (lt - 1.4) * 0.8) : 1);
  ctx.translate((ssuR(Math.floor(t * 30)) - 0.5) * 10 * shk, (ssuR(Math.floor(t * 30) + 77) - 0.5) * 8 * shk);
  var lamp = ibkLampAt(ww, t, ww / 2); lamp.k = burst ? 0 : 1 - 0.5 * ssuR(Math.floor(t * 20)) * g; // flickering, then it bursts
  ibkGym(ww, t, lamp);
  // green light swelling from him
  ctx.save(); ctx.globalCompositeOperation = "lighter";
  var gl = ctx.createRadialGradient(ww / 2, 160, 10, ww / 2, 160, 260 + 80 * g);
  gl.addColorStop(0, "rgba(90,255,70," + (0.45 * g).toFixed(3) + ")"); gl.addColorStop(1, "rgba(40,160,30,0)");
  ctx.fillStyle = gl; ctx.fillRect(-ww, -250, ww * 3, 750); ctx.restore();
  // cracks spreading over the floor
  if (burst) {
    var cu = ssuOut((lt - 1.4) / 0.3);
    ctx.strokeStyle = "#000"; ctx.lineWidth = 2.5;
    for (var k = 0; k < 9; k++) {
      var a = Math.PI * (0.05 + k / 8 * 0.9), L = (120 + ssuR(k) * 220) * cu;
      ctx.beginPath(); ctx.moveTo(ww / 2, 214); var px = ww / 2, py = 214;
      for (var sg = 1; sg <= 4; sg++) { px = ww / 2 + Math.cos(a) * L * sg / 4 * (k % 2 ? 1 : -1) * 1.6 + (ssuR(k * 9 + sg) - 0.5) * 16; py = 214 + Math.sin(a) * L * sg / 4 * 0.12; ctx.lineTo(px, py); }
      ctx.stroke();
    }
  }
  var r = 72 * (1 + 0.14 * g), cx = ww / 2, cy = 214 - r * 1.02, c = ibkChar(ch, g);
  // the aura
  if (g > 0.05) {
    ctx.save(); ctx.globalCompositeOperation = "lighter";
    for (var ring = 0; ring < 3; ring++) {
      var rr = r * (1.1 + ring * 0.12 + 0.05 * Math.sin(t * 14 + ring));
      ctx.strokeStyle = "rgba(120,255,90," + (0.35 * g / (ring + 1)).toFixed(3) + ")"; ctx.lineWidth = 6 - ring * 1.5;
      ctx.beginPath(); ctx.arc(cx, cy, rr, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.restore();
  }
  var crush = ssuOut((lt - 1.0) / 0.15);
  if (!burst) {
    ibkFrancis(cx, cy, r, c, { pose: "hold", hand: { x: cx + r * 1.12, y: cy + r * 0.1 }, t: t, shiver: 0.6 + g * 1.4, item: function (hx, hy) {
      ibkShaker(hx, hy - 8, 1.6 * r / 82, 0.08, "#efe3c4", 0.15, crush);
    } });
  } else {
    var up = ssuOut((lt - 1.4) / 0.2);
    ctx.save(); ctx.translate(cx, cy); ctx.scale(1, 1 + 0.04 * Math.sin(lt * 30) * (1 - up * 0.5)); ctx.translate(-cx, -cy);
    ibkFrancis(cx, cy, r, c, { pose: "flex", t: t, shiver: 1 });
    ctx.restore();
    // the crushed shaker falling
    var fu = lt - 1.4;
    ibkShaker(cx + r * 1.2 + fu * 30, cy + r * 0.2 + fu * fu * 300, 1.6 * r / 82, 0, "#efe3c4", fu * 6, 1);
    // glass shards from the lamp
    for (var s = 0; s < 14; s++) {
      var sa = ssuR(s + 200) * Math.PI, sp = 60 + ssuR(s + 220) * 160;
      var sx = lamp.x + Math.cos(sa) * sp * fu * (s % 2 ? 1 : -1), sy = lamp.y + Math.sin(sa) * sp * fu * 0.4 + 260 * fu * fu;
      ctx.fillStyle = "rgba(230,240,255," + Math.max(0, 1 - fu).toFixed(3) + ")"; ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(sx + 4, sy + 2); ctx.lineTo(sx + 1, sy + 6); ctx.closePath(); ctx.fill();
    }
    // steam off his head
    for (var p = 0; p < 10; p++) {
      var pu = ((fu * 1.4 + ssuR(p + 300)) % 1);
      ctx.fillStyle = "rgba(200,255,190," + (0.5 * (1 - pu)).toFixed(3) + ")";
      ctx.beginPath(); ctx.arc(cx + (ssuR(p + 310) - 0.5) * r * 0.9 + Math.sin(pu * 6 + p) * 6, cy - r * 1.05 - pu * 70, 4 + pu * 10, 0, Math.PI * 2); ctx.fill();
    }
  }
  // lightning
  if (g > 0.3) {
    var fl = Math.floor(t * 12);
    for (var b = 0; b < 3; b++) if (ssuR(fl * 3 + b) > 0.45) {
      var bx = ww * (0.1 + ssuR(fl + b * 11) * 0.8);
      ibkBolt(bx, 24, cx + (ssuR(fl + b) - 0.5) * r * 1.4, cy - r * 0.6, fl * 7 + b, g);
    }
  }
  if (burst) {
    var fla = Math.max(0, 1 - (lt - 1.4) / 0.25);
    if (fla > 0) { ctx.fillStyle = "rgba(220,255,210," + fla.toFixed(3) + ")"; ctx.fillRect(-ww, -250, ww * 3, 750); }
    var rp = skbPop(lt, 1.45, 0.3);
    if (rp > 0) { ctx.save(); ctx.translate(ww * 0.8, 92); ctx.scale(rp, rp); ctx.rotate(0.08); ibkText("RAAAGH!", 0, 0, 40, IBK_GREEN, 300, { stroke: IBK_INK, strokeW: 0.26 }); ctx.restore(); }
  }
  ibkFog(ww, t, 0.9, "rgba(120,220,110,0.2)");
}
function ibkShot3(ww, t, lt, ch) { // the flavours slam down
  var bg = ctx.createRadialGradient(ww * 0.52, 120, 10, ww * 0.52, 120, ww * 0.7);
  bg.addColorStop(0, "#2e5a24"); bg.addColorStop(0.5, "#14240f"); bg.addColorStop(1, "#06080a");
  ctx.fillStyle = bg; ctx.fillRect(-ww, -250, ww * 3, 750);
  ctx.save(); ctx.globalCompositeOperation = "lighter";
  ctx.translate(ww * 0.52, 110); ctx.rotate(t * 0.2);
  for (var i = 0; i < 14; i++) { ctx.rotate(Math.PI / 7); ctx.fillStyle = "rgba(120,255,90,0.05)"; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(ww, -60); ctx.lineTo(ww, 60); ctx.closePath(); ctx.fill(); }
  ctx.restore();
  // the concrete floor
  ctx.fillStyle = "#1a1c1f"; ctx.fillRect(-ww, 205, ww * 3, 300);
  ctx.fillStyle = "rgba(120,255,90,0.12)"; ctx.fillRect(-ww, 205, ww * 3, 2);
  // the slams shake the camera
  var hits = [[0.15, 0.17, "vanilla", 1.0], [0.65, 0.33, "chocolate", 1.0], [1.5, 0.8, "cake", 1.28]], shk = 0;
  hits.forEach(function (h) { var u = lt - h[0]; if (u >= 0 && u < 0.3) shk = Math.max(shk, (1 - u / 0.3) * (h[2] === "cake" ? 1.6 : 1)); });
  ctx.translate((ssuR(Math.floor(t * 30)) - 0.5) * 12 * shk, (ssuR(Math.floor(t * 30) + 5) - 0.5) * 10 * shk);
  // Bulk Francis behind them, fists up
  var r = 70, cx = ww * 0.53, cy = 205 - r * 1.02, c = ibkChar(ch, 1);
  ctx.save(); ctx.globalCompositeOperation = "lighter";
  var gl = ctx.createRadialGradient(cx, cy, 10, cx, cy, 160); gl.addColorStop(0, "rgba(90,255,70,0.35)"); gl.addColorStop(1, "rgba(90,255,70,0)");
  ctx.fillStyle = gl; ctx.fillRect(cx - 160, cy - 160, 320, 320); ctx.restore();
  ibkFrancis(cx, cy + Math.sin(lt * 4) * 2, r, c, { pose: "flex", t: t });
  hits.forEach(function (h, k) {
    var u = lt - h[0]; if (u < -0.18) return;
    var x = ww * h[1], s = h[3], fall = u < 0 ? (1 - (-u / 0.18)) : 1;
    var y = u < 0 ? -40 + 245 * fall : 205;
    var sq = u >= 0 && u < 0.15 ? 1 - Math.sin(u / 0.15 * Math.PI) * 0.12 : 1;
    ctx.save(); ctx.translate(x, y); ctx.scale(1 + (1 - sq) * 0.6, sq); ibkTub(0, 0, s, h[2]); ctx.restore();
    if (u >= 0) {
      // the dust puff and the crack
      var du = Math.min(1, u / 0.6);
      ctx.fillStyle = "rgba(200,200,190," + (0.5 * (1 - du)).toFixed(3) + ")";
      [-1, 1].forEach(function (d) { ctx.beginPath(); ctx.ellipse(x + d * (40 + 60 * du) * s, 200, 26 * s * (0.6 + du), 10 * s, 0, 0, Math.PI * 2); ctx.fill(); });
      ctx.strokeStyle = "#000"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(x - 50 * s, 208); ctx.lineTo(x - 20 * s, 214); ctx.lineTo(x + 10 * s, 209); ctx.lineTo(x + 46 * s, 216); ctx.stroke();
      var lp = skbPop(lt, h[0] + 0.08, 0.25);
      if (h[2] !== "cake" && lp > 0) { ctx.save(); ctx.translate(x, 54); ctx.scale(lp, lp); ibkText(IBK_FLAVOURS[h[2]].name, 0, 0, 22, "#ffffff", 200, { stroke: IBK_INK }); ctx.restore(); }
    }
  });
  // AND INTRODUCING... then the collab banner
  var ai = ssuFade(lt, 1.0, 0.15) * (1 - ssuFade(lt, 1.45, 0.08));
  if (ai > 0) { ctx.save(); ctx.globalAlpha *= ai; ibkText("AND INTRODUCING...", ww * 0.8, 70, 20, IBK_GOLD, 300, { stroke: IBK_INK }); ctx.restore(); }
  if (lt > 1.5) {
    ibkSprinkles(ww * 0.8, 150, lt - 1.5, 500, 60, 1.2);
    var bp = skbPop(lt, 1.6, 0.35);
    if (bp > 0) {
      ctx.save(); ctx.translate(ww * 0.8, 44); ctx.scale(bp, bp); ctx.rotate(-0.04);
      ctx.fillStyle = "#ff6fa8"; stillRoundRect(-150, -18, 300, 34, 8); ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = "#ffffff"; ctx.stroke();
      ibkText("NEW! CAKE BATTER", 0, -1, 22, "#ffffff", 280, { stroke: "#a0154f", strokeW: 0.18 });
      ctx.restore();
      ctx.save(); ctx.globalAlpha *= ssuFade(lt, 1.85, 0.25);
      ibkText("WITH SALKILLD BAKERY", ww * 0.8, 74, 12, "#ffffff", 260, { stroke: IBK_INK, strokeW: 0.3 });
      ctx.restore();
    }
    for (var st = 0; st < 5; st++) ssuStar(ww * 0.8 + Math.cos(st * 1.3 + t * 2) * 70, 130 + Math.sin(st * 1.7 + t * 2) * 50, 4 + 3 * Math.abs(Math.sin(t * 7 + st)), ssuFade(lt, 1.6, 0.2));
  }
}
function ibkShot4(ww, t, lt, ch) { // too strong
  var bg = ctx.createLinearGradient(0, 0, 0, 250); bg.addColorStop(0, "#ffd9ea"); bg.addColorStop(1, "#ff9cc4");
  ctx.fillStyle = bg; ctx.fillRect(-ww, -250, ww * 3, 750);
  ctx.save(); ctx.translate(ww * 0.4, 120); ctx.rotate(t * 0.3); ctx.fillStyle = "rgba(255,255,255,0.22)";
  for (var i = 0; i < 16; i++) { ctx.rotate(Math.PI / 8); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(ww, -70); ctx.lineTo(ww, 70); ctx.closePath(); ctx.fill(); }
  ctx.restore();
  ctx.fillStyle = "#e07fa8"; ctx.fillRect(-ww, 212, ww * 3, 50);
  var r = 76, cx = ww * 0.4, cy = 212 - r * 1.02, c = ibkChar(ch, 1), pop = lt >= 0.72;
  var shake = lt < 0.55 ? Math.sin(lt * 34) : 0, sq = ssuOut((lt - 0.55) / 0.17);
  ibkFrancis(cx, cy, r, c, { pose: "hold", hand: { x: cx + r * 1.18, y: cy - r * 0.05 + shake * r * 0.2 }, t: t, shiver: pop ? 0 : sq, item: function (hx, hy) {
    if (!pop) ibkShaker(hx, hy - 8, 1.6, 0.8, "#ffb3cf", shake * 0.25, sq * 0.8);
  } });
  if (pop) {
    var u = lt - 0.72, hx = cx + r * 1.18, hy = cy - r * 0.05 - 14;
    // the batter bursts out of his glove
    for (var b = 0; b < 9; b++) {
      var a = -Math.PI / 2 + (ssuR(b + 70) - 0.5) * 2.6, sp = 120 + ssuR(b + 80) * 200;
      ibkSplat(hx + Math.cos(a) * sp * u, hy + Math.sin(a) * sp * u + 300 * u * u, 7 + ssuR(b) * 8, b * 13, Math.max(0, 1 - u / 1.2));
    }
    ibkSprinkles(hx, hy, u, 800, 50, 1.4);
    // batter dripping off him
    [[-0.3, -0.7, 22], [0.25, -0.85, 18], [0.55, -0.4, 14], [-0.1, -0.2, 12]].forEach(function (d, k) {
      ibkSplat(cx + d[0] * r, cy + d[1] * r + Math.min(1, u * 1.5) * (6 + k * 3), d[2] * Math.min(1, u * 6), 400 + k * 17, 1);
    });
    var tp = skbPop(lt, 1.0, 0.3);
    if (tp > 0) { ctx.save(); ctx.translate(ww * 0.78, 110); ctx.scale(tp, tp); ctx.rotate(-0.06); ibkText("TOO STRONG.", 0, 0, 40, "#ffffff", 360, { stroke: "#a0154f", strokeW: 0.24 }); ctx.restore(); }
    var sp2 = skbPop(lt, 0.74, 0.2);
    if (sp2 > 0 && lt < 1.0) { ctx.save(); ctx.translate(hx + 60, hy - 50); ctx.scale(sp2, sp2); ctx.rotate(0.12); ibkText("SPLAT!", 0, 0, 30, "#ffffff", 220, { stroke: "#a0154f" }); ctx.restore(); }
  }
}
function ibkShot5(ww, t, lt) { // the end card
  var bg = ctx.createRadialGradient(ww / 2, 100, 10, ww / 2, 100, ww * 0.7);
  bg.addColorStop(0, "#7ee05a"); bg.addColorStop(0.55, "#2f8a22"); bg.addColorStop(1, "#123d0c");
  ctx.fillStyle = bg; ctx.fillRect(-ww, -250, ww * 3, 750);
  ctx.save(); ctx.translate(ww / 2, 96); ctx.rotate(t * 0.25); ctx.fillStyle = "rgba(255,255,255,0.12)";
  for (var i = 0; i < 16; i++) { ctx.rotate(Math.PI / 8); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(ww, -ww * 0.11); ctx.lineTo(ww, ww * 0.11); ctx.closePath(); ctx.fill(); }
  ctx.restore();
  var p = skbPop(lt, 0.05, 0.45);
  if (p > 0) {
    ctx.save(); ctx.translate(ww / 2, 96); ctx.scale(p, p); ctx.rotate(Math.sin(lt * 3) * 0.015);
    drawBulkLogo(ctx, 0, 0, Math.min(360, ww * 0.5));
    ctx.restore();
  }
  var gx = (lt - 0.5) / 0.6;
  if (gx > 0 && gx < 1) ssuStar(ww / 2 - 160 + gx * 320, 70 - Math.sin(gx * Math.PI) * 10, 10 + 8 * Math.sin(gx * Math.PI), 1);
  [[0.13, "vanilla", 0.2], [0.25, "chocolate", 0.35], [0.82, "cake", 0.5]].forEach(function (tb) {
    var tp = skbPop(lt, tb[2], 0.3); if (tp <= 0) return;
    ctx.save(); ctx.translate(ww * tb[0], 214); ctx.scale(tp, tp); ibkTub(0, 0, tb[1] === "cake" ? 1.05 : 0.9, tb[1]); ctx.restore();
  });
  var ta = ssuFade(lt, 0.65, 0.3);
  if (ta > 0) {
    ctx.save(); ctx.globalAlpha *= ta; ctx.translate(0, (1 - ssuOut((lt - 0.65) / 0.35)) * 12);
    stillText("Don't make him hungry.", ww / 2, 196, 25, "#ffffff", ww * 0.42, { face: IBK_FONT, weight: "italic 900", stroke: IBK_INK, strokeW: 0.24 });
    ctx.restore();
  }
}
function ibkShot(i, ww, t, lt, ch) {
  if (i === 0) ibkShot0(ww, t, lt);
  else if (i === 1) ibkShot1(ww, t, lt, ch);
  else if (i === 2) ibkShot2(ww, t, lt, ch);
  else if (i === 3) ibkShot3(ww, t, lt, ch);
  else if (i === 4) ibkShot4(ww, t, lt, ch);
  else ibkShot5(ww, t, lt);
}

function drawBulkJumbo(x, y, w, h) {
  if (IBK.show <= 0 || IBK.paused || !balls || !balls[IBK.id]) return;
  var b = balls[IBK.id], ch = b.baseChar || b.char;
  if (b.ngLookBase) ch = Object.assign({}, ch, { ngLookBaseAd: b.ngLookBase }); // his own colours, even while he's green in the cage
  ibkFrame(x, y, w, h, IBK.t, ch, Math.min(1, IBK.t / 0.15, IBK.show / 0.4));
}
// One frame of the ad at time t.
function ibkFrame(x, y, w, h, t, ch, alpha) {
  var s = h / 250, ww = w / s;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
  ctx.fillStyle = "#000000"; ctx.fillRect(x, y, w, h);
  ctx.translate(x, y); ctx.scale(s, s);
  var i = 0; while (i < IBK_CUTS.length - 2 && t >= IBK_CUTS[i + 1]) i++;
  var lt = t - IBK_CUTS[i];
  ctx.save(); ibkShot(i, ww, t, lt, ch); ctx.restore();
  // a dip to black on the moody cuts, a hard cut into the bright ones
  var into = lt, outOf = IBK_CUTS[i + 1] - t, dip = 0;
  if (i > 0 && i < 3) dip = Math.max(dip, 1 - into / 0.08);
  if (i < 2) dip = Math.max(dip, 1 - outOf / 0.08);
  if (dip > 0) { ctx.fillStyle = "rgba(0,0,0," + Math.min(1, dip).toFixed(3) + ")"; ctx.fillRect(0, 0, ww, 250); }
  if (i >= 3) { var wf = Math.max(0, 1 - into / 0.12); if (wf > 0) { ctx.fillStyle = "rgba(255,255,255," + (0.8 * wf).toFixed(3) + ")"; ctx.fillRect(0, 0, ww, 250); } }
  // the pink batter on the lens, sliding down
  if (i === 4 && lt > 0.8) {
    var u = lt - 0.8;
    [[0.12, 60, 34], [0.9, 40, 28], [0.7, 190, 20]].forEach(function (d, k) {
      var a = Math.min(1, u * 8);
      ibkSplat(ww * d[0], d[1] + u * 14, d[2] * (0.6 + 0.4 * a), 900 + k * 21, 0.92);
      ctx.fillStyle = "rgba(255,170,205,0.9)"; ctx.fillRect(ww * d[0] - 3, d[1] + u * 14, 6, d[2] * 0.6 + u * 40);
    });
  }
  // film grain, a vignette and the letterbox
  var fr = Math.floor(t * 24);
  ctx.fillStyle = "rgba(255,255,255,0.06)";
  for (var g = 0; g < 90; g++) ctx.fillRect(ssuR(fr * 131 + g) * ww, ssuR(fr * 71 + g + 500) * 250, 1.4, 1.4);
  ctx.fillStyle = "rgba(0,0,0,0.08)";
  for (var g2 = 0; g2 < 60; g2++) ctx.fillRect(ssuR(fr * 37 + g2 + 900) * ww, ssuR(fr * 53 + g2 + 1300) * 250, 1.6, 1.6);
  var vg = ctx.createRadialGradient(ww / 2, 125, 90, ww / 2, 125, ww * 0.62);
  vg.addColorStop(0, "rgba(0,0,0,0)"); vg.addColorStop(1, "rgba(0,0,0," + (i >= 4 ? 0.35 : 0.6) + ")");
  ctx.fillStyle = vg; ctx.fillRect(0, 0, ww, 250);
  var bar = 20 * Math.min(1, t / 0.4);
  ctx.fillStyle = "#000000"; ctx.fillRect(0, 0, ww, bar); ctx.fillRect(0, 250 - bar, ww, bar);
  if (i === 0) {
    ibkTitle("THEY TRAIN.", ww * 0.2, 90, 22, "#e8e8e8", ssuFade(lt, 0.35, 0.4) * (1 - ssuFade(lt, 1.95, 0.2)), 260);
    ibkTitle("HE BULKS.", ww * 0.8, 90, 22, "#8cf060", ssuFade(lt, 1.05, 0.4) * (1 - ssuFade(lt, 1.95, 0.2)), 260);
  }
  if (i === 2 && lt > 1.6) ibkTitle("SIDE EFFECTS MAY INCLUDE: RAGE.", ww / 2, 240, 9, "#c8ffb8", ssuFade(lt, 1.6, 0.3), ww * 0.6);
  if (i === 5) {
    ctx.save(); ctx.globalAlpha *= ssuFade(lt, 1.0, 0.4);
    stillText("*Parody. Not a real supplement. Cake Batter made with Salkilld Bakery, also not real.", ww / 2, 240, 8, "#9aa79a", ww * 0.9, { face: "'Helvetica Neue', Helvetica, Arial, sans-serif", weight: "600" });
    ctx.restore();
  }
  ctx.restore();
}
function drawBulkBanner() {
  if (IBK.show <= 0 || stadiumOn()) return;
  drawBulkJumbo(10, 10, W - 20, 110);
}

// The still for the random rotation: a supplement store poster. The logo,
// the three tubs, Bulk Francis with his fists up, and the line.
function drawBulkStill(x, y, w, h, k, ch) {
  var s = h / 250, ww = w / s;
  ch = ch || { look: {}, name: "" };
  ctx.save();
  ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
  ctx.translate(x, y); ctx.scale(s, s);
  var bg = ctx.createRadialGradient(ww * 0.32, 100, 10, ww * 0.32, 100, ww * 0.8);
  bg.addColorStop(0, "#7ee05a"); bg.addColorStop(0.55, "#2f8a22"); bg.addColorStop(1, "#123d0c");
  ctx.fillStyle = bg; ctx.fillRect(0, 0, ww, 250);
  ctx.save(); ctx.translate(ww * 0.32, 90); ctx.fillStyle = "rgba(255,255,255,0.1)";
  for (var i = 0; i < 16; i++) { ctx.rotate(Math.PI / 8); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(ww, -ww * 0.11); ctx.lineTo(ww, ww * 0.11); ctx.closePath(); ctx.fill(); }
  ctx.restore();
  drawBulkLogo(ctx, ww * 0.3, 84, Math.min(320, ww * 0.48));
  stillText("Don't make him hungry.", ww * 0.3, 168, 20, "#ffffff", ww * 0.46, { face: IBK_FONT, weight: "italic 900", stroke: IBK_INK, strokeW: 0.24 });
  ibkText("VANILLA · CHOCOLATE · NEW! CAKE BATTER", ww * 0.3, 196, 10, IBK_GOLD, ww * 0.46, { stroke: IBK_INK, strokeW: 0.3 });
  var c = ibkChar(ch, 1), r = 58;
  ibkFrancis(ww * 0.74, 214 - r * 1.02, r, c, { pose: "flex", t: 0 });
  ibkTub(ww * 0.585, 216, 0.75, "vanilla");
  ibkTub(ww * 0.665, 220, 0.7, "chocolate");
  ibkTub(ww * 0.9, 218, 0.85, "cake");
  ctx.restore();
}

// ---------------------------------------------------------------- sound
// The score: a trailer pulse (a low drone and a heartbeat), braams on the
// change, war drums under the flavours, then a bright brass sting on the logo.
var IBK_SCORE = (function () {
  var n = [];
  for (var hb = 0; hb < 6; hb++) { n.push(["beat", 0.1 + hb * 0.8]); }
  for (var d = 0; d < 7; d++) { var at = 7.0 + d * 0.375; if (at < 9.5) n.push(["drum", at]); }
  n.push(["drone", 0]); n.push(["drone2", 4.6]); n.push(["hype", 7.0]); n.push(["bounce", 9.6]); n.push(["fanfare", 11.45]);
  return n.sort(function (a, b) { return a[1] - b[1]; });
})();
function ibkScoreFrom(t) { playBulkCue("score", 0, t); }

function playBulkCue(name, len, from) {
  try {
    var ac = getAudioCtx(); if (!ac) return;
    if (ac.state === "suspended") ac.resume();
    if (!IBK.out) { IBK.out = ac.createGain(); IBK.out.gain.value = 0.7; IBK.out.connect(ac.destination); }
    if (!IBK.nb || IBK.nb.sampleRate !== ac.sampleRate) IBK.nb = makeNoiseBuffer(ac, 2);
    var out = IBK.out, now = ac.currentTime + 0.02;
    var tone = function (f0, f1, at, dur, vol, type, lp) {
      var o = ac.createOscillator(), g = ac.createGain(), dst = g;
      o.type = type || "sine"; o.frequency.setValueAtTime(f0, at); if (f1 && f1 !== f0) o.frequency.exponentialRampToValueAtTime(f1, at + dur);
      g.gain.setValueAtTime(0.0001, at); g.gain.exponentialRampToValueAtTime(vol, at + Math.min(0.08, dur * 0.2)); g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
      if (lp) { var f = ac.createBiquadFilter(); f.type = "lowpass"; f.frequency.value = lp; o.connect(f); f.connect(g); } else o.connect(g);
      dst.connect(out); o.start(at); o.stop(at + dur + 0.05);
    };
    var noise = function (at, dur, vol, freq, q, type, f1) {
      var n = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain();
      n.buffer = IBK.nb; n.loop = true; f.type = type || "bandpass"; f.frequency.setValueAtTime(freq, at); if (f1) f.frequency.exponentialRampToValueAtTime(f1, at + dur); f.Q.value = q || 1;
      g.gain.setValueAtTime(0.0001, at); g.gain.exponentialRampToValueAtTime(vol, at + 0.004); g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
      n.connect(f); f.connect(g); g.connect(out); n.start(at); n.stop(at + dur + 0.05);
    };
    var braam = function (at, root, dur, vol) {
      [1, 1.5, 2, 1.005].forEach(function (k, j) { tone(root * k, root * k * 0.98, at, dur, vol / (j + 1), "sawtooth", 600); });
      tone(root / 2, root / 2, at, dur, vol * 0.8, "sine");
    };
    if (name === "score") {
      var t0 = from || 0;
      IBK_SCORE.forEach(function (e) {
        var at = e[1]; if (at < t0 - 0.01 && e[0] !== "drone" && e[0] !== "drone2" && e[0] !== "hype" && e[0] !== "bounce") return;
        var when = now + Math.max(0, at - t0);
        if (e[0] === "beat") { tone(60, 40, when, 0.18, 0.4); tone(55, 38, when + 0.22, 0.16, 0.3); }
        if (e[0] === "drone" && t0 < 4.6) tone(55, 55, when, 4.6 - Math.max(t0, at), 0.12, "sawtooth", 220);
        if (e[0] === "drone2" && t0 < 7.0) tone(41.2, 41.2, when, 7.0 - Math.max(t0, at), 0.16, "sawtooth", 300);
        if (e[0] === "drum") { tone(90, 45, when, 0.3, 0.45); noise(when, 0.12, 0.2, 300, 1.2, "lowpass"); }
        if (e[0] === "hype" && t0 < 9.6) { // a pumping bass under the flavours
          for (var b = 0; b < 13; b++) { var bt = 7.0 + b * 0.1875; if (bt < t0 || bt >= 9.6) continue; tone(b % 2 ? 110 : 82.4, b % 2 ? 110 : 82.4, now + bt - t0, 0.16, 0.12, "square", 500); }
        }
        if (e[0] === "bounce" && t0 < 11.4) { // a silly oom-pah under the splat
          [[9.6, 196], [9.9, 247], [10.2, 196], [10.5, 293.7], [10.8, 261.6], [11.1, 196]].forEach(function (nn) { if (nn[0] >= t0) tone(nn[1], nn[1], now + nn[0] - t0, 0.22, 0.1, "triangle"); });
        }
        if (e[0] === "fanfare") { // the sting: a bright brass chord, then the low hit
          [261.6, 329.6, 392, 523.3].forEach(function (f, j) { tone(f, f, when + j * 0.05, 1.6, 0.09, "sawtooth", 2200); });
          tone(65.4, 65.4, when, 1.8, 0.3);
        }
      });
    }
    if (name === "thump") { tone(70, 40, now, 0.35, 0.35); noise(now, 0.1, 0.08, 200, 1, "lowpass"); }
    if (name === "rattle") { for (var r = 0; r < 4; r++) noise(now + r * 0.04, 0.05, 0.14, 2400 + r * 300, 3); }
    if (name === "glug") { tone(220, 120, now, 0.14, 0.25, "sine"); noise(now, 0.1, 0.1, 500, 4); }
    if (name === "braam") braam(now, 55, 2.2, 0.18);
    if (name === "braam2") braam(now, 41.2, 2.6, 0.24);
    if (name === "crunch") { noise(now, 0.18, 0.4, 1800, 0.7, "bandpass", 500); for (var c = 0; c < 5; c++) noise(now + c * 0.03, 0.04, 0.2, 3500, 2); }
    if (name === "roar") {
      tone(150, 70, now, 1.2, 0.3, "sawtooth", 700); tone(110, 55, now, 1.3, 0.25, "sawtooth", 500);
      noise(now, 1.2, 0.35, 400, 0.8, "bandpass", 180);
    }
    if (name === "glass") { for (var g = 0; g < 10; g++) tone(3000 + g * 420, 2600 + g * 300, now + g * 0.025, 0.25, 0.05, "triangle"); noise(now, 0.3, 0.2, 5000, 1, "highpass"); }
    if (name === "slam") { tone(80, 35, now, 0.45, 0.6); noise(now, 0.3, 0.4, 260, 0.8, "lowpass"); noise(now + 0.02, 0.4, 0.12, 1200, 1, "bandpass", 300); }
    if (name === "bigslam") { tone(70, 28, now, 0.8, 0.7); noise(now, 0.5, 0.5, 220, 0.8, "lowpass"); [523.3, 659.3, 784, 1046.5].forEach(function (f, j) { tone(f, f, now + 0.05 + j * 0.05, 0.6, 0.06, "triangle"); }); }
    if (name === "roll") { for (var d = 0; d < 16; d++) noise(now + d * 0.028, 0.04, 0.08 + d * 0.012, 260, 1.4, "bandpass"); }
    if (name === "sparkle") { for (var s = 0; s < 8; s++) tone(2000 + s * 260, 2200 + s * 260, now + s * 0.04, 0.25, 0.04); }
    if (name === "squeeze") { tone(500, 1400, now, 0.14, 0.1, "triangle"); }
    if (name === "splat") { noise(now, 0.35, 0.5, 900, 0.7, "bandpass", 200); tone(200, 70, now, 0.25, 0.3); for (var p = 0; p < 4; p++) noise(now + 0.12 + p * 0.07, 0.06, 0.12, 1400 - p * 200, 2); }
    if (name === "whoosh") noise(now, 0.35, 0.18, 500, 1, "bandpass", 3500);
    if (name === "sting") { noise(now, 0.6, 0.12, 6000, 0.5, "highpass"); }
  } catch (e) { /* no audio */ }
}
function stopBulkSound() {
  if (!IBK.out) return;
  try { IBK.out.disconnect(); } catch (e) { /* already gone */ }
  IBK.out = null;
}
