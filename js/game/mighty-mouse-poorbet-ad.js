// Fight Analysis, sponsored by Poorbet (Joe, 2026-11-24): Mighty Mouse's
// jumbotron ad (a banner in the test arena). Three seconds after he cracks
// the code on his opponent (his GAME PLAN, setGamePlan in mighty-mouse.js),
// once a fight, one of three versions picked at random:
//   A  Analysis desk: a broadcast replay, a yellow marker circles their weak
//      spot (the real one he read, mm.note), CODE CRACKED: <plan> stamps on,
//      then Poorbet's LIVE ODDS slide in (Mighty Mouse -900, YOU WIN YOUR
//      BET: LOL). "He studies film. You study your losses."
//   B  Win probability: his win chance climbs the moment he cracks the code,
//      then YOUR BANK ACCOUNT crashes to $0.00 on the same chart. "His odds:
//      UP. Yours: NEVER."
//   C  Chalkboard: the X's and O's of his game plan in chalk, then
//      POORBET'S PLAY: YOUR $1,000, rubbed out with the eraser. "= GONE."
// Sound (code-made): a news stinger, blips on the beats, a sad trombone on
// the punchline. Every sound is a cue on the ad's own clock.
//
// Joe's rule for ads and specials: it goes through queueJumboAd, so it never
// starts while a special or another ad is on; and if a special (or a clash,
// lock or cutscene, sceneLocked) starts while it's playing, the ad pauses:
// it's off the jumbotron, its sound stops, its clock and cues hold, and
// nothing else takes the jumbotron until it has played out after the special.
// mightyMouse.poorbetAd false in his character file switches it off.
"use strict";

var MPB_SHOW = 8.0, MPB_DELAY = 3.0;
var MPB_CUES = {
  A: [["stinger", 0.02], ["blip", 1.9], ["blip", 2.4], ["blip", 4.0], ["blip", 4.4], ["tb0", 5.2], ["tb1", 5.54], ["tb2", 5.88], ["tb3", 6.22]],
  B: [["stinger", 0.02], ["blip", 1.0], ["blip", 1.4], ["blip", 4.4], ["tb0", 5.3], ["tb1", 5.64], ["tb2", 5.98], ["tb3", 6.32]],
  C: [["stinger", 0.02], ["blip", 2.6], ["blip", 4.0], ["blip", 5.5], ["tb0", 5.6], ["tb1", 5.94], ["tb2", 6.28], ["tb3", 6.62]]
};
var MPB = { show: 0, t: 0, wait: -1, id: 0, opt: "A", plan: "", note: "", done: false, paused: false, cue: 0, out: null };

// From startMatchWith (through resetAdBreaks).
function resetMmPoorbet() { MPB.show = 0; MPB.t = 0; MPB.wait = -1; MPB.done = false; MPB.paused = false; MPB.cue = 0; stopMmPoorbetSound(); }
// From setGamePlan (mighty-mouse.js): he's cracked the code.
function mmPoorbetOnPlan(b) {
  var c = b && b.char && b.char.mightyMouse;
  if (MPB.done || (c && c.poorbetAd === false) || (typeof galleryDemo !== "undefined" && galleryDemo)) return;
  MPB.done = true; MPB.wait = MPB_DELAY; MPB.id = b.id;
  MPB.plan = (typeof MM_PLAN_NAMES !== "undefined" && MM_PLAN_NAMES[b.mm.plan]) || "STRIKES"; MPB.note = b.mm.note || "";
}
// A special, a clash, a lock or a cutscene on: the ad holds.
function mmPoorbetHold() {
  return (typeof jumboHold === "function" && jumboHold(null)) || (typeof sceneLocked === "function" && sceneLocked());
}
// Every frame, from tickAdBreaks (ad-breaks.js).
function tickMmPoorbet(dt) {
  if (MPB.wait > 0) {
    MPB.wait -= dt;
    if (MPB.wait <= 0) {
      if (over) return;
      queueJumboAd(MPB_SHOW, function () {
        var opts = ["A", "B", "C"];
        MPB.opt = opts[(Math.random() * opts.length) | 0];
        MPB.show = MPB_SHOW; MPB.t = 0; MPB.cue = 0; MPB.paused = false;
      });
    }
  }
  if (MPB.show <= 0) return;
  if (mmPoorbetHold()) { // paused: off the jumbotron, quiet, and nothing else takes its slot
    if (!MPB.paused) { MPB.paused = true; stopMmPoorbetSound(); }
    if (typeof jumboAdLeft !== "undefined" && jumboAdLeft > 0) jumboAdLeft += dt;
    return;
  }
  MPB.paused = false;
  MPB.show = Math.max(0, MPB.show - dt);
  MPB.t = MPB_SHOW - MPB.show;
  var cues = MPB_CUES[MPB.opt];
  while (MPB.cue < cues.length && MPB.t >= cues[MPB.cue][1]) {
    if (MPB.t - cues[MPB.cue][1] < 0.25) playMmPoorbetCue(cues[MPB.cue][0]); // (not if it was long missed)
    MPB.cue++;
  }
}

function drawMmPoorbetJumbo(x, y, w, h) {
  if (MPB.show <= 0 || MPB.paused || !balls || !balls[MPB.id] || !balls[1 - MPB.id]) return;
  var t = MPB.t, k = h / 250;
  ctx.save();
  ctx.globalAlpha = Math.min(1, t / 0.3, MPB.show / 0.4);
  ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
  var mm = balls[MPB.id], op = balls[1 - MPB.id];
  var L = { mm: (mm.baseChar || mm.char).look, op: (op.baseChar || op.char).look, opName: (op.baseChar || op.char).name };
  MPB_DRAW[MPB.opt](x, y, w, h, k, t, L);
  ctx.restore();
}
function drawMmPoorbetBanner() {
  if (MPB.show <= 0 || stadiumOn()) return;
  drawMmPoorbetJumbo(10, 10, W - 20, 110);
}

// ---------------------------------------------------------------- the three versions
var MPB_DRAW = (function () {
  var A = MPB;
  var SANS = "'Helvetica Neue', Helvetica, Arial, sans-serif";
  var PB_PURPLE = "#3d1257", PB_GOLD = "#ffd54f";
  function pbLogo(cx, cy, maxW, maxH, color) {
    var img = color ? stillTintedLogo(poorbetLogoImg, color) : poorbetLogoImg;
    if (!img) return;
    var s = POORBET_LOGO_SIZE, lw = Math.min(maxW, maxH * s[0] / s[1]), lh = lw * s[1] / s[0];
    ctx.drawImage(img, cx - lw / 2, cy - lh / 2, lw, lh);
  }
  function ease(u) { u = Math.max(0, Math.min(1, u)); return u * u * (3 - 2 * u); }
  function fade(t, at, len) { return Math.max(0, Math.min(1, (t - at) / (len || 0.3))); }
  // The header strip: FIGHT ANALYSIS | sponsored by [Poorbet].
  function header(x, y, w, h, k, dark) {
    ctx.fillStyle = dark ? "rgba(0,0,0,0.55)" : "rgba(255,255,255,0.9)"; ctx.fillRect(x, y, w, h * 0.17);
    ctx.fillStyle = PB_GOLD; ctx.fillRect(x, y + h * 0.17, w, 3 * k);
    stillText("FIGHT ANALYSIS", x + w * 0.02, y + h * 0.088, 30 * k, dark ? "#ffffff" : "#1a1d21", w * 0.3, { align: "left" });
    stillText("sponsored by", x + w * 0.72, y + h * 0.088, 15 * k, dark ? "#d8c9e8" : "#5d6670", w * 0.12, { face: SANS, weight: "italic 600", align: "right" });
    pbLogo(x + w * 0.83, y + h * 0.088, w * 0.16, h * 0.14, dark ? null : PB_PURPLE);
  }
  function fine(x, y, w, h, k, t, at, dark) {
    if (t < at) return;
    ctx.save(); ctx.globalAlpha *= fade(t, at, 0.4);
    stillText("*Poorbet is a parody. Mighty Mouse doesn't gamble, he studies. Gambling problem? Call 1-800-GAMBLER.", x + w / 2, y + h * 0.955, 11 * k, dark ? "rgba(255,255,255,0.75)" : "#5d6670", w * 0.95, { face: SANS, weight: "600" });
    ctx.restore();
  }

  // ---------------------------------------------------------------- A: analysis desk
  function drawA(x, y, w, h, k, t, L) {
    var bg = ctx.createLinearGradient(x, y, x + w, y + h);
    bg.addColorStop(0, "#0d1b3d"); bg.addColorStop(1, "#1c0730");
    ctx.fillStyle = bg; ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = "rgba(120,160,255,0.08)"; ctx.lineWidth = 1;
    for (var gx = 0; gx < 40; gx++) { ctx.beginPath(); ctx.moveTo(x + gx * w / 40, y); ctx.lineTo(x + gx * w / 40, y + h); ctx.stroke(); }
    header(x, y, w, h, k, true);
    // Mighty Mouse on the left, the analyst's pick.
    var mx = x + w * 0.11, my = y + h * 0.55, mr = h * 0.22 * ease(t / 0.4);
    stillFighter(mx, my, mr, L.mm, "");
    ctx.fillStyle = "#6a1b9a"; stillRoundRect(mx - h * 0.25, my + h * 0.25, h * 0.5, h * 0.09, 4 * k); ctx.fill();
    stillText("MIGHTY MOUSE", mx, my + h * 0.295, 14 * k, "#ffffff", h * 0.46);
    // The telestrator: the opponent, circled, the weak spot called out.
    var ox = x + w * 0.36, oy = y + h * 0.55, orr = h * 0.2;
    ctx.fillStyle = "rgba(255,255,255,0.06)"; stillRoundRect(x + w * 0.22, y + h * 0.22, w * 0.3, h * 0.7, 8 * k); ctx.fill();
    stillText("REPLAY", x + w * 0.235, y + h * 0.27, 11 * k, "#ff5252", w * 0.06, { face: SANS, weight: "900", align: "left" });
    if (t > 0.3) stillFighter(ox, oy, orr, L.op, "");
    if (t > 0.9) { // the yellow marker circle being drawn
      var cu = ease((t - 0.9) / 0.6);
      ctx.strokeStyle = "#ffeb3b"; ctx.lineWidth = 4 * k; ctx.lineCap = "round";
      ctx.beginPath();
      for (var i = 0; i <= 40 * cu; i++) { var a = -2.2 + i / 40 * Math.PI * 2.15, rr = orr * (1.22 + 0.06 * Math.sin(i * 0.7)); ctx.lineTo(ox + Math.cos(a) * rr, oy + Math.sin(a) * rr * 0.95); }
      ctx.stroke();
    }
    if (t > 1.6) { // arrow and the weak spot
      var au = ease((t - 1.6) / 0.35), ax0 = ox + orr * 1.3, ay0 = oy - orr * 0.4, ax1 = ax0 + w * 0.045 * au, ay1 = ay0 - h * 0.12 * au;
      ctx.beginPath(); ctx.moveTo(ax0, ay0); ctx.lineTo(ax1, ay1); ctx.stroke();
      ctx.save(); ctx.globalAlpha *= fade(t, 1.9, 0.25);
      stillText("WEAK SPOT", x + w * 0.455, y + h * 0.34, 13 * k, "#ffeb3b", w * 0.12, { face: SANS, weight: "900" });
      stillText(A.note || "BLOCK 0%", x + w * 0.455, y + h * 0.44, 20 * k, "#ffffff", w * 0.12);
      ctx.restore();
    }
    if (t > 2.4) { // the game plan stamp
      var su = ease((t - 2.4) / 0.2), sc = 1.5 - 0.5 * su;
      ctx.save(); ctx.globalAlpha *= su; ctx.translate(x + w * 0.37, y + h * 0.86); ctx.scale(sc, sc); ctx.rotate(-0.04);
      ctx.strokeStyle = "#ff5252"; ctx.lineWidth = 3 * k; ctx.strokeRect(-w * 0.12, -h * 0.06, w * 0.24, h * 0.12);
      stillText("CODE CRACKED: " + A.plan, 0, 0, 18 * k, "#ff5252", w * 0.22);
      ctx.restore();
    }
    // Poorbet's live odds slide in from the right.
    if (t > 3.6) {
      var pu = ease((t - 3.6) / 0.45), px = x + w * 0.56 + (1 - pu) * w * 0.5, pw = w * 0.42, py = y + h * 0.22, ph = h * 0.7;
      var pg = ctx.createLinearGradient(0, py, 0, py + ph);
      pg.addColorStop(0, PB_PURPLE); pg.addColorStop(1, "#1c0730");
      ctx.fillStyle = pg; stillRoundRect(px, py, pw, ph, 10 * k); ctx.fill();
      ctx.strokeStyle = PB_GOLD; ctx.lineWidth = 2.5 * k; stillRoundRect(px, py, pw, ph, 10 * k); ctx.stroke();
      ctx.fillStyle = "#ff3b3b"; stillRoundRect(px + pw * 0.04, py + ph * 0.07, pw * 0.2, ph * 0.13, 4 * k); ctx.fill();
      stillText("● LIVE", px + pw * 0.14, py + ph * 0.135, 12 * k, "#ffffff", pw * 0.18, { face: SANS, weight: "900" });
      stillText("POORBET ODDS", px + pw * 0.6, py + ph * 0.135, 20 * k, PB_GOLD, pw * 0.6);
      var rows = [["MIGHTY MOUSE WINS", "-900"], ["YOU WIN YOUR BET", "LOL"]];
      rows.forEach(function (r, i) {
        var ry = py + ph * (0.34 + i * 0.2);
        if (t < 4.0 + i * 0.4) return;
        ctx.save(); ctx.globalAlpha *= fade(t, 4.0 + i * 0.4, 0.2);
        ctx.fillStyle = "rgba(255,255,255,0.08)"; ctx.fillRect(px + pw * 0.04, ry - ph * 0.08, pw * 0.92, ph * 0.16);
        stillText(r[0], px + pw * 0.07, ry, 15 * k, "#ffffff", pw * 0.6, { face: SANS, weight: "800", align: "left" });
        stillText(r[1], px + pw * 0.92, ry, 20 * k, i ? "#ff3b3b" : "#7CFC9A", pw * 0.25, { align: "right" });
        ctx.restore();
      });
      if (t > 5.2) {
        ctx.save(); ctx.globalAlpha *= fade(t, 5.2, 0.35);
        stillText("HE STUDIES FILM.", px + pw / 2, py + ph * 0.76, 18 * k, "#ffffff", pw * 0.9);
        stillText("YOU STUDY YOUR LOSSES.", px + pw / 2, py + ph * 0.9, 18 * k, PB_GOLD, pw * 0.9);
        ctx.restore();
      }
    }
    fine(x, y, w, h, k, t, 5.6, true);
  }

  // ---------------------------------------------------------------- B: win probability
  function drawB(x, y, w, h, k, t, L) {
    ctx.fillStyle = "#0b0f1a"; ctx.fillRect(x, y, w, h);
    header(x, y, w, h, k, true);
    var gx = x + w * 0.2, gy = y + h * 0.25, gw = w * 0.56, gh = h * 0.6;
    ctx.fillStyle = "rgba(255,255,255,0.04)"; ctx.fillRect(gx, gy, gw, gh);
    ctx.strokeStyle = "rgba(255,255,255,0.12)"; ctx.lineWidth = 1;
    for (var i = 0; i <= 4; i++) { var ly = gy + gh * i / 4; ctx.beginPath(); ctx.moveTo(gx, ly); ctx.lineTo(gx + gw, ly); ctx.stroke(); stillText((100 - i * 25) + "%", gx - 6 * k, ly, 10 * k, "rgba(255,255,255,0.6)", 40 * k, { face: SANS, weight: "700", align: "right" }); }
    stillText("WIN PROBABILITY", gx + gw / 2, gy - h * 0.035, 12 * k, "#b0bec5", gw, { face: SANS, weight: "900" });
    // The film-study flat, the code cracked, the climb.
    var crack = 0.42, prog = ease(t / 2.4);
    function mmP(u) { return u < crack ? 0.5 + 0.02 * Math.sin(u * 40) : 0.5 + 0.38 * ease((u - crack) / 0.45); }
    ctx.strokeStyle = "#b388ff"; ctx.lineWidth = 3.5 * k; ctx.lineJoin = "round";
    ctx.beginPath();
    for (var s = 0; s <= 100 * prog; s++) { var u = s / 100; ctx.lineTo(gx + gw * u, gy + gh * (1 - mmP(u))); }
    ctx.stroke();
    if (prog > crack) {
      var cx = gx + gw * crack, cy = gy + gh * 0.5;
      ctx.setLineDash([4 * k, 4 * k]); ctx.strokeStyle = "rgba(255,235,59,0.7)"; ctx.lineWidth = 1.5 * k;
      ctx.beginPath(); ctx.moveTo(cx, gy); ctx.lineTo(cx, gy + gh); ctx.stroke(); ctx.setLineDash([]);
      stillText("💡 CODE CRACKED", cx, gy + gh * 0.1, 12 * k, "#ffeb3b", gw * 0.3, { face: SANS, weight: "900" });
    }
    var endU = Math.min(prog, 1), ex = gx + gw * endU, ey = gy + gh * (1 - mmP(endU));
    stillFighter(ex, ey, h * 0.06, L.mm, "");
    if (prog >= 1) stillText("88%", ex - h * 0.1, ey - h * 0.02, 18 * k, "#b388ff", 60 * k, { align: "right" });
    // Then YOUR BANK ACCOUNT, in red, straight down.
    if (t > 3.2) {
      var bu = ease((t - 3.2) / 1.2);
      ctx.strokeStyle = "#ff3b3b"; ctx.lineWidth = 3.5 * k;
      ctx.beginPath();
      for (var q = 0; q <= 100 * bu; q++) { var v = q / 100, val = 0.75 * (1 - Math.pow(v, 0.6)) + 0.03 * Math.sin(v * 50) * (1 - v); ctx.lineTo(gx + gw * v, gy + gh * (1 - Math.max(0, val))); }
      ctx.stroke();
      stillText("YOUR BANK ACCOUNT", gx + gw * 0.18, gy + gh * 0.17, 12 * k, "#ff3b3b", gw * 0.3, { face: SANS, weight: "900" });
      if (bu >= 1) stillText("$0.00", gx + gw - 6 * k, gy + gh - 12 * k, 18 * k, "#ff3b3b", 80 * k, { align: "right" });
    }
    // The legend on the right, then the punchline.
    var rx = x + w * 0.88;
    stillFighter(x + w * 0.1, y + h * 0.55, h * 0.18, L.mm, "");
    stillText("MIGHTY MOUSE", x + w * 0.1, y + h * 0.82, 13 * k, "#b388ff", w * 0.16);
    if (t > 4.7) {
      ctx.save(); ctx.globalAlpha *= fade(t, 4.7, 0.35);
      stillText("HIS ODDS:", rx, y + h * 0.32, 16 * k, "#ffffff", w * 0.2);
      stillText("UP", rx, y + h * 0.44, 34 * k, "#7CFC9A", w * 0.2);
      ctx.restore();
    }
    if (t > 5.3) {
      ctx.save(); ctx.globalAlpha *= fade(t, 5.3, 0.35);
      stillText("YOURS:", rx, y + h * 0.6, 16 * k, "#ffffff", w * 0.2);
      stillText("NEVER", rx, y + h * 0.72, 34 * k, "#ff3b3b", w * 0.2);
      ctx.restore();
    }
    fine(x, y, w, h, k, t, 5.8, true);
  }

  // ---------------------------------------------------------------- C: chalkboard
  function chalk(txt, cx, cy, size, t, at, dur, maxW, col) { // written out left to right
    if (t < at) return;
    var u = Math.min(1, (t - at) / dur);
    ctx.save();
    ctx.font = "700 " + size + "px 'Comic Sans MS', 'Chalkboard SE', 'Marker Felt', cursive";
    var tw = Math.min(maxW || 1e9, ctx.measureText(txt).width);
    ctx.beginPath(); ctx.rect(cx - tw / 2 - 4, cy - size, tw * u + 8, size * 2); ctx.clip();
    ctx.globalAlpha *= 0.92;
    stillText(txt, cx, cy, size, col || "#f4f1e8", maxW, { face: "'Comic Sans MS', 'Chalkboard SE', 'Marker Felt', cursive", weight: "700" });
    ctx.restore();
  }
  function drawC(x, y, w, h, k, t, L) {
    ctx.fillStyle = "#6d4c41"; ctx.fillRect(x, y, w, h);
    var bx = x + 10 * k, by = y + h * 0.19, bw = w - 20 * k, bh = h * 0.78;
    var g = ctx.createLinearGradient(bx, by, bx + bw, by + bh);
    g.addColorStop(0, "#2f4f3a"); g.addColorStop(1, "#24402f");
    ctx.fillStyle = g; ctx.fillRect(bx, by, bw, bh);
    ctx.fillStyle = "rgba(255,255,255,0.03)"; for (var sm = 0; sm < 12; sm++) ctx.fillRect(bx + bw * ((sm * 0.37) % 1), by + bh * ((sm * 0.53) % 1), bw * 0.15, 6 * k); // old smudges
    header(x, y, w, h, k, false);
    var sans = SANS;
    // The play: O is Mighty Mouse, X is them, the route in chalk.
    var ox = bx + bw * 0.1, oy = by + bh * 0.6, xx = bx + bw * 0.34, xy = by + bh * 0.45;
    chalk("O", ox, oy, 40 * k, t, 0.2, 0.2);
    chalk("X", xx, xy, 40 * k, t, 0.5, 0.2);
    chalk("MIGHTY MOUSE", ox, oy + bh * 0.22, 13 * k, t, 0.4, 0.4, bw * 0.16);
    chalk((L.opName || "THEM").toUpperCase(), xx, xy + bh * 0.22, 13 * k, t, 0.7, 0.4, bw * 0.16);
    if (t > 1.0) { // the route: out wide, round and in
      var ru = ease((t - 1.0) / 1.0);
      ctx.strokeStyle = "rgba(244,241,232,0.9)"; ctx.lineWidth = 2.5 * k; ctx.setLineDash([7 * k, 5 * k]); ctx.lineCap = "round";
      ctx.beginPath();
      var P = function (u) { return { x: ox + (xx - ox) * u + Math.sin(u * Math.PI) * 0, y: oy - Math.sin(u * Math.PI) * bh * 0.26 + (xy - oy) * u }; };
      for (var i = 0; i <= 30 * ru; i++) { var p = P(i / 30 * 0.92); if (i) ctx.lineTo(p.x, p.y); else ctx.moveTo(p.x, p.y); }
      ctx.stroke(); ctx.setLineDash([]);
      if (ru >= 1) { var e = P(0.92), d = P(0.88), an = Math.atan2(e.y - d.y, e.x - d.x); ctx.beginPath(); ctx.moveTo(e.x, e.y); ctx.lineTo(e.x - Math.cos(an - 0.5) * 12 * k, e.y - Math.sin(an - 0.5) * 12 * k); ctx.moveTo(e.x, e.y); ctx.lineTo(e.x - Math.cos(an + 0.5) * 12 * k, e.y - Math.sin(an + 0.5) * 12 * k); ctx.stroke(); }
    }
    chalk("THE CODE: " + A.plan, bx + bw * 0.22, by + bh * 0.13, 20 * k, t, 2.0, 0.6, bw * 0.38, "#ffeb3b");
    chalk("(" + A.note + ")", bx + bw * 0.22, by + bh * 0.88, 14 * k, t, 2.5, 0.4, bw * 0.3);
    if (t > 2.6) { // circled twice
      var cu = ease((t - 2.6) / 0.4);
      ctx.strokeStyle = "#ffeb3b"; ctx.lineWidth = 2.5 * k;
      ctx.beginPath(); for (var c = 0; c <= 40 * cu; c++) { var a = c / 40 * Math.PI * 2.1; ctx.lineTo(xx + Math.cos(a) * 30 * k, xy - 4 * k + Math.sin(a) * 26 * k); } ctx.stroke();
    }
    // Poorbet's side of the board: $1,000 written, then rubbed out.
    var rx = bx + bw * 0.72;
    ctx.strokeStyle = "rgba(244,241,232,0.35)"; ctx.lineWidth = 2 * k; ctx.beginPath(); ctx.moveTo(bx + bw * 0.5, by + bh * 0.08); ctx.lineTo(bx + bw * 0.5, by + bh * 0.92); ctx.stroke();
    chalk("POORBET'S PLAY:", rx, by + bh * 0.16, 20 * k, t, 3.4, 0.5, bw * 0.4, "#ffb3c1");
    chalk("YOUR $1,000", rx, by + bh * 0.42, 30 * k, t, 4.0, 0.5, bw * 0.4);
    if (t > 4.8) { // the eraser wipes it
      var eu = ease((t - 4.8) / 0.6), ex = rx - bw * 0.2 + eu * bw * 0.4;
      ctx.fillStyle = "#2a4734"; ctx.fillRect(rx - bw * 0.21, by + bh * 0.3, eu * bw * 0.42, bh * 0.24);
      ctx.fillStyle = "rgba(244,241,232,0.08)"; for (var sw = 0; sw < 5; sw++) ctx.fillRect(rx - bw * 0.21, by + bh * (0.31 + sw * 0.045), eu * bw * 0.42, 3 * k);
      if (eu < 1) { ctx.fillStyle = "#8d6e63"; ctx.fillRect(ex - 22 * k, by + bh * 0.33, 44 * k, 22 * k); ctx.fillStyle = "#f5f5f5"; ctx.fillRect(ex - 22 * k, by + bh * 0.33 + 16 * k, 44 * k, 6 * k); }
    }
    chalk("= GONE.", rx, by + bh * 0.66, 30 * k, t, 5.5, 0.4, bw * 0.4, "#ff8a80");
    chalk("He cracked the code. Poorbet cracked your wallet.", rx, by + bh * 0.86, 13 * k, t, 6.0, 0.7, bw * 0.44);
    fine(x, y, w, h, k, t, 99, false);
  }

  return { A: drawA, B: drawB, C: drawC };
})();

// ---------------------------------------------------------------- sound
function playMmPoorbetCue(name) {
  try {
    var ac = getAudioCtx(); if (!ac) return;
    if (ac.state === "suspended") ac.resume();
    if (!MPB.out) { MPB.out = ac.createGain(); MPB.out.gain.value = 0.6; MPB.out.connect(ac.destination); }
    var out = MPB.out, now = ac.currentTime + 0.02;
    var tone = function (f, at, len, vol, type, f2) {
      var o = ac.createOscillator(), g = ac.createGain();
      o.type = type || "triangle"; o.frequency.setValueAtTime(f, at); if (f2) o.frequency.exponentialRampToValueAtTime(f2, at + len);
      g.gain.setValueAtTime(0.0001, at); g.gain.exponentialRampToValueAtTime(vol, at + 0.02); g.gain.setValueAtTime(vol, at + Math.max(0.03, len - 0.08)); g.gain.exponentialRampToValueAtTime(0.0001, at + len);
      o.connect(g); g.connect(out); o.start(at); o.stop(at + len + 0.05);
    };
    if (name === "stinger") { // the news stinger
      if (typeof duckMusic === "function") duckMusic(now, now + 1.2);
      [392, 523.3, 659.3, 784].forEach(function (f, i) { tone(f, now + i * 0.09, 0.5 - i * 0.05, 0.12, "sawtooth"); tone(f / 2, now + i * 0.09, 0.4, 0.08, "square"); });
      tone(1046.5, now + 0.4, 0.6, 0.06, "sine");
    }
    if (name === "blip") { tone(880, now, 0.08, 0.1, "square"); tone(1318, now + 0.05, 0.12, 0.07, "sine"); }
    var tb = { tb0: [311, 0.32], tb1: [294, 0.32], tb2: [277, 0.32], tb3: [262, 0.9] }[name]; // the sad trombone, a note per cue
    if (tb) { if (typeof duckMusic === "function") duckMusic(now, now + tb[1] + 0.1); tone(tb[0], now, tb[1], 0.14, "sawtooth", name === "tb3" ? tb[0] * 0.94 : 0); }
  } catch (e) { /* no audio */ }
}
function stopMmPoorbetSound() {
  if (!MPB.out) return;
  try { MPB.out.disconnect(); } catch (e) { /* already gone */ }
  MPB.out = null;
}
