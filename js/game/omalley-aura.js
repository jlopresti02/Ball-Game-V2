// Sean O'Malley's Sugar Rush aura (Joe, 2026-11-17). Christian's fighter;
// this file only draws, it changes nothing in the fight.
//
// While he calls the Sugar Rush, hunts the candy after it, and through the
// sugar high that follows (omalley.js: sugarRushCalling, b.sgHuntT,
// sugaHigh), he's buzzing on sugar:
//   - a candy burst and a white shockwave ring the moment it starts
//   - a spinning rainbow lollipop swirl and a soft glow behind him
//   - cotton-candy flames rising off him, rainbow heartbeat rings on the mat
//   - pink and blue ghost outlines, 8 candies orbiting him (behind and in
//     front), twinkling sugar crystals and a trail of sugar dust
//   - the jitter: a fast shake with sudden twitches and a buzzing squash
// It fades in over 0.3s and out over 0.7s. No randomness, so replays match.
// Hooks (one line each) in draw.js: applyOmalleyAuraPose(b) after
// applyOmalleyPose, drawOmalleyAuraUnder() after drawOmalleyUnder,
// drawOmalleyAuraOver(b) after drawOmalley(b).
var OA_COLS = ["#ff5fa8", "#5fd3ff", "#ffd34d", "#b98cff", "#6fe8a0", "#ff9d5c"];
var OA_PUFF = ["#ff7fbf", "#6fcfff", "#c39bff", "#ffd36b", "#ff9ad2"];
var OA_KINDS = ["lollipop", "gummy", "wrapped", "donut", "candyCane", "gumball", "wrapped", "lollipop"];
function oaOn(b) { return sgCfg(b) && b.alive && (sugarRushCalling(b) || b.sgHuntT > 0 || sugaHigh(b)); }
function oaHsl(h, s, l, a) { return "hsla(" + (((h % 360) + 360) % 360) + "," + s + "%," + l + "%," + a + ")"; }
function oaTick(b) {
  var now = sgClock;
  if (b.oaauT == null || now < b.oaauT) { // first look, or a new fight (sgClock starts again)
    b.oaauT = now; b.oaau = 0; b.oatrail = []; b.oaburst = null; b.oawas = false;
  }
  var dt = Math.max(0, Math.min(0.1, now - b.oaauT)); b.oaauT = now;
  var on = oaOn(b);
  if (on && !b.oawas) oaBurst(b);
  b.oawas = on;
  b.oaau = Math.max(0, Math.min(1, b.oaau + (on ? dt / 0.3 : -dt / 0.7)));
  if (b.oaburst) { b.oaburst.t += dt; if (b.oaburst.t > 1.4) b.oaburst = null; }
  // sugar-dust trail where he's been
  if (b.oaau > 0 && dt > 0) {
    b.oatrail.push({ x: b.x + (Math.sin(now * 37) * b.r * 0.5), y: b.y + b.r * 0.55 + Math.cos(now * 29) * b.r * 0.3, t: 0, c: OA_COLS[Math.floor(now * 30) % OA_COLS.length] });
  }
  for (var i = b.oatrail.length - 1; i >= 0; i--) { b.oatrail[i].t += dt; if (b.oatrail[i].t > 1.1) b.oatrail.splice(i, 1); }
  return b.oaau;
}
function oaBurst(b) {
  var parts = [];
  for (var i = 0; i < 26; i++) {
    var a = i / 26 * Math.PI * 2 + ((i * 7) % 5) * 0.04, sp = 220 + ((i * 11) % 13) * 20;
    parts.push({ a: a, sp: sp, kind: i % 3 === 0 ? OA_KINDS[i % OA_KINDS.length] : null, c: OA_COLS[i % OA_COLS.length], rot: i * 0.9 });
  }
  b.oaburst = { t: 0, parts: parts };
}
// ---- JITTER: a sugar shake with sharp twitches every so often.
// From draw(), right after applyOmalleyPose.
function applyOmalleyAuraPose(b) {
  if (!sgCfg(b)) return;
  var k = b.oaau || 0;
  if (!k || !b.alive || sgLift(b)) return;
  var t = sgClock, amp = (sugarRushCalling(b) ? 4.5 : 3.0) * k;
  var twitch = Math.pow(Math.max(0, Math.sin(t * 5.3)), 18) * 5 * k; // a sudden jolt
  var jx = (Math.sin(t * 83) + Math.sin(t * 131) * 0.6) * amp * 0.62 + Math.sin(t * 211) * twitch;
  var jy = (Math.cos(t * 97) + Math.sin(t * 149) * 0.6) * amp * 0.5 + Math.cos(t * 193) * twitch;
  ctx.translate(jx, jy);
  var sq = 1 + Math.sin(t * 26) * 0.025 * k; // buzzing squash
  ctx.translate(b.x, b.y); ctx.rotate(Math.sin(t * 71) * 0.05 * k); ctx.scale(sq, 2 - sq); ctx.translate(-b.x, -b.y);
}
function oaOrbit(b, t, front) {
  var R = b.r, x = b.x, y = b.y - sgLift(b), n = 8;
  for (var i = 0; i < n; i++) {
    var a = t * 1.9 + i * Math.PI * 2 / n;
    var isFront = Math.sin(a) > 0;
    if (isFront !== front) continue;
    var rx = R + 34, ry = (R + 34) * 0.42;
    var cx = x + Math.cos(a) * rx, cy = y + Math.sin(a) * ry - 6 + Math.sin(t * 4 + i) * 4;
    var depth = 0.75 + 0.25 * Math.sin(a); // nearer = bigger
    ctx.save(); ctx.globalAlpha *= front ? 1 : 0.75;
    drawSweet({ kind: OA_KINDS[i], color: OA_COLS[i % OA_COLS.length] }, cx, cy, 10 * depth, a * 2 + t * 2);
    ctx.restore();
  }
}
// ---- UNDER him
// From draw(), right after drawOmalleyUnder (under the fighters).
function drawOmalleyAuraUnder() {
  balls.forEach(function (b) {
    if (!sgCfg(b)) return;
    var k = oaTick(b); if (!k && !b.oaburst && !(b.oatrail && b.oatrail.length)) return;
    var t = sgClock, R = b.r, x = b.x, y = b.y - sgLift(b);
    ctx.save();
    // sugar-dust trail
    b.oatrail.forEach(function (p) {
      var f = 1 - p.t / 1.1;
      ctx.globalAlpha = 0.85 * f; ctx.fillStyle = p.c;
      ctx.beginPath(); ctx.arc(p.x, p.y, 2.2 + 2.5 * f, 0, Math.PI * 2); ctx.fill();
    });
    if (k) {
      // heartbeat rings rippling out across the mat
      for (var r = 0; r < 3; r++) {
        var ph = (t * 1.4 + r / 3) % 1;
        ctx.globalAlpha = k * 0.55 * (1 - ph);
        ctx.strokeStyle = oaHsl(t * 120 + r * 120, 95, 65, 1); ctx.lineWidth = 5 * (1 - ph) + 1;
        ctx.beginPath(); ctx.arc(x, y, R + 10 + ph * R * 2.2, 0, Math.PI * 2); ctx.stroke();
      }
      // lollipop swirl disc spinning behind him
      ctx.globalAlpha = k * 0.78;
      var D = R * 2.05, arms = 6;
      ctx.save(); ctx.translate(x, y); ctx.rotate(-t * 3.2);
      ctx.beginPath(); ctx.arc(0, 0, D, 0, Math.PI * 2); ctx.clip();
      ctx.fillStyle = "#ffffff"; ctx.fill();
      for (var s = 0; s < arms; s++) {
        ctx.fillStyle = OA_COLS[s % OA_COLS.length];
        ctx.beginPath(); ctx.moveTo(0, 0);
        for (var q = 0; q <= 24; q++) { var rr = D * 1.1 * q / 24, aa = s * Math.PI * 2 / arms + q * 0.16; ctx.lineTo(Math.cos(aa) * rr, Math.sin(aa) * rr); }
        for (var q2 = 24; q2 >= 0; q2--) { var rr2 = D * 1.1 * q2 / 24, aa2 = s * Math.PI * 2 / arms + q2 * 0.16 + 0.5; ctx.lineTo(Math.cos(aa2) * rr2, Math.sin(aa2) * rr2); }
        ctx.closePath(); ctx.fill();
      }
      ctx.restore();
      // soft outer glow
      var pulse = 1 + 0.07 * Math.sin(t * 9);
      var g = ctx.createRadialGradient(x, y, D * 0.9, x, y, D * 1.5 * pulse);
      g.addColorStop(0, oaHsl(t * 140, 95, 72, 0.5 * k)); g.addColorStop(1, oaHsl(t * 140 + 120, 95, 75, 0));
      ctx.globalAlpha = 1; ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(x, y, D * 1.5 * pulse, 0, Math.PI * 2); ctx.fill();
      // cotton-candy flames licking up around him
      for (var f = 0; f < 22; f++) {
        var fp = (t * 1.3 + f * 0.137) % 1;
        var fa = f * 2.4 + 0.3;
        var bx = x + Math.cos(fa) * R * 0.95, by = y + Math.sin(fa) * R * 0.75;
        var px = bx + Math.sin(t * 6 + f) * 6, py = by - fp * R * 1.9;
        var pr = R * (0.42 * (1 - fp) + 0.12);
        ctx.globalAlpha = k * 0.95 * Math.sin(Math.min(1, fp * 1.4) * Math.PI);
        ctx.fillStyle = OA_PUFF[f % OA_PUFF.length];
        ctx.beginPath(); ctx.arc(px, py, pr, 0, Math.PI * 2); ctx.arc(px + pr * 0.6, py + pr * 0.2, pr * 0.7, 0, Math.PI * 2); ctx.arc(px - pr * 0.55, py + pr * 0.25, pr * 0.65, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = k;
      oaOrbit(b, t, false);
    }
    ctx.restore();
  });
}
// ---- OVER him
// From draw(), right after drawOmalley(b) (over him).
function drawOmalleyAuraOver(b) {
  if (!sgCfg(b) || b.oaau == null) return;
  var k = b.oaau || 0, t = sgClock, R = b.r, x = b.x, y = b.y - sgLift(b);
  ctx.save();
  if (k && b.alive) {
    ctx.globalAlpha = k;
    // chromatic sugar-rush ghost rims (pink left, cyan right)
    var off = 3 + 2 * Math.sin(t * 17);
    ctx.lineWidth = 2.5;
    ctx.globalAlpha = k * 0.78; ctx.strokeStyle = "#ff3d9a";
    ctx.beginPath(); ctx.arc(x - off, y, R + 1, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = "#2fd0ff";
    ctx.beginPath(); ctx.arc(x + off, y, R + 1, 0, Math.PI * 2); ctx.stroke();
    ctx.globalAlpha = k;
    oaOrbit(b, t, true);
    // sugar crystals twinkling
    ctx.fillStyle = "#ffffff";
    for (var s = 0; s < 6; s++) {
      var sa = t * 2.3 + s * 1.05, sr = R + 14 + 10 * Math.sin(t * 3 + s);
      ctx.globalAlpha = k * Math.max(0, Math.sin(t * 7 + s * 1.7));
      sparkle(x + Math.cos(sa) * sr, y + Math.sin(sa) * sr, 3 + 3 * Math.max(0, Math.sin(t * 9 + s)));
    }
  }
  // the opening candy burst
  var bu = b.oaburst;
  if (bu) {
    var e = bu.t, fade = Math.max(0, 1 - e / 1.4);
    ctx.globalAlpha = Math.max(0, 1 - e / 0.35);
    ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 10 * (1 - e / 0.35) + 1;
    ctx.beginPath(); ctx.arc(x, y, R + e * 520, 0, Math.PI * 2); ctx.stroke();
    bu.parts.forEach(function (p) {
      var d = R + p.sp * e * (1 - e * 0.35), px = x + Math.cos(p.a) * d, py = y + Math.sin(p.a) * d + 60 * e * e;
      ctx.globalAlpha = fade;
      if (p.kind) drawSweet({ kind: p.kind, color: p.c }, px, py, 9, p.rot + e * 8);
      else { ctx.fillStyle = p.c; ctx.save(); ctx.translate(px, py); ctx.rotate(p.rot + e * 12); ctx.fillRect(-5, -2, 10, 4); ctx.restore(); }
    });
  }
  ctx.restore();
}
