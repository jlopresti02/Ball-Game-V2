// Proper No. 12 Irish Root Beer (Christian, 2026-11-13): a root beer parody
// of Conor McGregor's whiskey, on the jumbotron (a banner in the test arena)
// the first time he takes a swig in a fight (his drink, conor.js), or as his
// bus drives off if he hasn't had one yet. Once a fight.
//   - Deep green with gold rays turning behind, shamrocks drifting down and
//     root beer bubbles rising.
//   - Conor on the left raising a bottle, rocking on the billionaire strut.
//   - The bottle rises up in the middle; the cap pops off and it fizzes over.
//   - PROPER No.12, IRISH ROOT BEER. "Double champ. Double fizz."
//     "0% whiskey. 100% notorious." and the small print: "Gas tank sold
//     separately."
//   - Sound: the cap popping, a fizz, a pour, and a little tin-whistle jig.
// It goes through queueJumboAd like every ad, so it never overlaps another.
// Plus a silent still for the random rotation (drawProper12Still): a frosty
// mug on a pub bar. Everything is drawn in code; no real logos.
// notorious.ad false in his character file switches it off.
"use strict";

var P12_SHOW = 7.0;
var P12_POP = 1.25;                     // when the cap comes off
var P12_GREEN = "#0b3d24", P12_GOLD = "#d4af37", P12_CREAM = "#f3e7c9";
var p12Show = 0, p12Id = 0, p12Done = false, p12Out = null;

// From startMatchWith (through resetAdBreaks).
function resetProper12() { p12Show = 0; p12Done = false; stopProper12Sound(); }
// From conor.js: his first swig, or the bus driving off.
function proper12OnSwig(b) {
  var n = b && b.char && b.char.notorious;
  if (p12Done || !n || n.ad === false || (typeof galleryDemo !== "undefined" && galleryDemo)) return;
  p12Done = true;
  queueJumboAd(P12_SHOW, function () {
    p12Show = P12_SHOW; p12Id = b.id;
    playProper12Sound();
  }, b);
}
// Every frame, from tickAdBreaks (ad-breaks.js).
function tickProper12(dt) { if (p12Show > 0) p12Show = Math.max(0, p12Show - dt); }

function p12Serif() { return "Georgia, 'Times New Roman', serif"; }
function p12Sans() { return "'Helvetica Neue', Helvetica, Arial, sans-serif"; }

// A shamrock: three round leaves and a stem.
function p12Shamrock(x, y, s, col, rot) {
  ctx.save();
  ctx.translate(x, y); ctx.rotate(rot || 0);
  ctx.fillStyle = col;
  [[-0.9, 0.15], [0.9, 0.15], [0, -0.85]].forEach(function (q) { ctx.beginPath(); ctx.arc(q[0] * s, q[1] * s, s, 0, Math.PI * 2); ctx.fill(); });
  ctx.strokeStyle = col; ctx.lineWidth = s * 0.45; ctx.lineCap = "round";
  ctx.beginPath(); ctx.moveTo(0, s * 0.4); ctx.quadraticCurveTo(s * 0.3, s * 1.4, s * 0.9, s * 1.9); ctx.stroke();
  ctx.restore();
}

// The bottle, standing at (cx, base), h tall: amber-brown glass with a long
// neck, a cream label with a green border and gold trim. `pop` 0-1: the cap
// flying off; `fizz` 0-1: foam spilling out of the neck.
function proper12Bottle(cx, base, h, k, t, pop, fizz) {
  var bw = h * 0.34, bodyTop = base - h * 0.6, neckW = bw * 0.34, top = base - h;
  ctx.save();
  ctx.fillStyle = "rgba(0,0,0,0.3)"; ctx.beginPath(); ctx.ellipse(cx, base + 2 * k, bw * 0.62, h * 0.035, 0, 0, Math.PI * 2); ctx.fill();
  // glass
  ctx.beginPath();
  ctx.moveTo(cx - bw / 2, base - h * 0.03);
  ctx.quadraticCurveTo(cx - bw / 2, base, cx - bw / 2 + h * 0.03, base);
  ctx.lineTo(cx + bw / 2 - h * 0.03, base);
  ctx.quadraticCurveTo(cx + bw / 2, base, cx + bw / 2, base - h * 0.03);
  ctx.lineTo(cx + bw / 2, bodyTop);
  ctx.bezierCurveTo(cx + bw / 2, bodyTop - h * 0.12, cx + neckW / 2, bodyTop - h * 0.1, cx + neckW / 2, top + h * 0.1);
  ctx.lineTo(cx - neckW / 2, top + h * 0.1);
  ctx.bezierCurveTo(cx - neckW / 2, bodyTop - h * 0.1, cx - bw / 2, bodyTop - h * 0.12, cx - bw / 2, bodyTop);
  ctx.closePath();
  var gl = ctx.createLinearGradient(cx - bw / 2, 0, cx + bw / 2, 0);
  gl.addColorStop(0, "#3a1906"); gl.addColorStop(0.35, "#7a3b12"); gl.addColorStop(0.6, "#5a2a0c"); gl.addColorStop(1, "#2a1204");
  ctx.fillStyle = gl; ctx.fill();
  ctx.strokeStyle = "#1a0b02"; ctx.lineWidth = 2.5 * k; ctx.stroke();
  // bubbles rising inside
  ctx.save(); ctx.clip();
  ctx.fillStyle = "rgba(255,220,170,0.45)";
  for (var j = 0; j < 9; j++) {
    var bp = (t * 0.45 + j * 0.31) % 1;
    ctx.beginPath(); ctx.arc(cx - bw * 0.32 + ((j * 37) % 10) / 10 * bw * 0.64, base - h * 0.05 - bp * h * 0.55, (1.4 + (j % 3)) * k, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
  // shine
  ctx.strokeStyle = "rgba(255,230,190,0.55)"; ctx.lineWidth = 4 * k; ctx.lineCap = "round";
  ctx.beginPath(); ctx.moveTo(cx - bw * 0.3, base - h * 0.08); ctx.lineTo(cx - bw * 0.3, bodyTop + h * 0.02); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx - neckW * 0.2, bodyTop - h * 0.08); ctx.lineTo(cx - neckW * 0.2, top + h * 0.14); ctx.stroke();
  // the label
  var lw = bw * 0.94, lh = h * 0.3, lx = cx - lw / 2, ly = base - h * 0.48;
  ctx.fillStyle = P12_CREAM; ctx.strokeStyle = P12_GOLD; ctx.lineWidth = 2 * k;
  stillRoundRect(lx, ly, lw, lh, 6 * k); ctx.fill(); ctx.stroke();
  ctx.strokeStyle = P12_GREEN; ctx.lineWidth = 1.5 * k; stillRoundRect(lx + 4 * k, ly + 4 * k, lw - 8 * k, lh - 8 * k, 4 * k); ctx.stroke();
  stillText("PROPER", cx, ly + lh * 0.3, lh * 0.24, P12_GREEN, lw * 0.82, { face: p12Serif(), weight: "900" });
  // the gold roundel with the number
  ctx.fillStyle = P12_GOLD; ctx.strokeStyle = P12_GREEN; ctx.lineWidth = 1.5 * k;
  ctx.beginPath(); ctx.arc(cx, ly + lh * 0.58, lh * 0.15, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  stillText("No.12", cx, ly + lh * 0.585, lh * 0.12, P12_GREEN, lh * 0.26, { face: p12Serif(), weight: "900" });
  stillText("IRISH ROOT BEER", cx, ly + lh * 0.85, lh * 0.1, "#5a2a0c", lw * 0.84, { face: p12Sans(), weight: "800" });
  // a little neck label and the cap
  ctx.fillStyle = P12_GREEN; ctx.fillRect(cx - neckW / 2, top + h * 0.2, neckW, h * 0.06);
  ctx.fillStyle = P12_GOLD; ctx.fillRect(cx - neckW / 2, top + h * 0.2, neckW, h * 0.012); ctx.fillRect(cx - neckW / 2, top + h * 0.248, neckW, h * 0.012);
  if (pop < 1) {
    var cy = top + h * 0.05 - easeOut(pop) * h * 0.55, spin = pop * 9;
    ctx.save(); ctx.translate(cx + pop * bw * 0.6, cy); ctx.rotate(spin);
    ctx.globalAlpha *= 1 - Math.max(0, pop - 0.6) / 0.4;
    ctx.fillStyle = P12_GOLD; ctx.strokeStyle = "#7a5a10"; ctx.lineWidth = 1.5 * k;
    ctx.beginPath(); ctx.rect(-neckW * 0.62, -h * 0.045, neckW * 1.24, h * 0.09); ctx.fill(); ctx.stroke();
    ctx.restore();
  }
  // foam spilling out of the neck
  if (fizz > 0) {
    ctx.fillStyle = "rgba(248,238,215,0.95)"; ctx.strokeStyle = "rgba(150,110,60,0.6)"; ctx.lineWidth = 1 * k;
    for (var f = 0; f < 7; f++) {
      var fa = f / 7 * Math.PI - Math.PI, fr = (5 + (f % 3) * 3) * k * fizz;
      var fx = cx + Math.cos(fa) * neckW * 0.6 * fizz, fy = top + h * 0.08 + Math.sin(fa) * h * 0.06 * fizz - fizz * h * 0.03;
      ctx.beginPath(); ctx.arc(fx, fy, fr, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    }
    ctx.fillStyle = "rgba(248,238,215,0.9)";
    ctx.beginPath(); ctx.ellipse(cx + neckW * 0.55, top + h * 0.25, 3 * k * fizz, h * 0.13 * fizz, 0, 0, Math.PI * 2); ctx.fill(); // a drip down the neck
  }
  ctx.restore();
}

// Conor for the ad: his ball, rocking, with a bottle raised in his right hand.
function proper12Conor(cx, cy, r, chr, t, k) {
  var rock = Math.sin(t * 3.1 * Math.PI) * 0.1;
  ctx.save();
  ctx.translate(cx, cy + r); ctx.rotate(rock); ctx.translate(-cx, -cy - r);
  stillFighter(cx, cy, r, chr.look, chr.name);
  ctx.restore();
  var raise = Math.min(1, Math.max(0, (t - 0.9) / 0.4)), e = raise * raise * (3 - 2 * raise);
  var gx = cx + r * 1.05, gy = cy + r * 0.3 - e * r * 1.05;
  ctx.save();
  ctx.translate(gx, gy); ctx.rotate(0.25 - e * 0.35);
  proper12Bottle(0, r * 0.15, r * 1.05, k * 0.5, t, 1, 0);
  ctx.restore();
  drawGlove(ctx, gx, gy, r * 0.33, chr.look, "#0b0f12", -Math.PI / 2 + 0.2);
  drawGlove(ctx, cx - r * 1.02, cy + r * 0.48, r * 0.33, chr.look, "#0b0f12", Math.PI * 0.15); // other fist on his hip
}

function drawProper12Jumbo(x, y, w, h) {
  if (p12Show <= 0 || !balls || !balls[p12Id]) return;
  var b = balls[p12Id], chr = b.baseChar || b.char;
  var t = P12_SHOW - p12Show, a = Math.min(1, t / 0.3, p12Show / 0.4), k = h / 250;
  ctx.save();
  ctx.globalAlpha = a;
  ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();

  // Deep green, gold rays turning behind the bottle.
  var bg = ctx.createLinearGradient(0, y, 0, y + h);
  bg.addColorStop(0, "#0f5a35"); bg.addColorStop(1, "#03140b");
  ctx.fillStyle = bg; ctx.fillRect(x, y, w, h);
  var bx = x + w * 0.44, by = y + h * 0.62;
  ctx.save();
  ctx.translate(bx, by); ctx.rotate(t * 0.18);
  ctx.fillStyle = "rgba(212,175,55,0.12)";
  for (var i = 0; i < 14; i++) {
    ctx.rotate(Math.PI / 7);
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(w, -w * 0.07); ctx.lineTo(w, w * 0.07); ctx.closePath(); ctx.fill();
  }
  ctx.restore();
  // Shamrocks drifting down, bubbles rising.
  for (var s = 0; s < 12; s++) {
    var sp = (t * (0.08 + (s % 4) * 0.025) + s * 0.27) % 1;
    p12Shamrock(x + w * ((s * 0.618 + 0.05) % 1), y - 10 * k + sp * (h + 20 * k), (4 + (s % 3) * 2) * k, "rgba(125,255,154," + (0.18 + (s % 3) * 0.06) + ")", t * (s % 2 ? 1 : -1) + s);
  }
  ctx.strokeStyle = "rgba(255,230,180,0.35)"; ctx.lineWidth = 1.5 * k;
  for (var q = 0; q < 16; q++) {
    var qp = (t * (0.2 + (q % 4) * 0.05) + q * 0.29) % 1;
    ctx.beginPath(); ctx.arc(x + w * ((q * 0.381 + 0.1) % 1) + Math.sin(t * 2 + q) * 4 * k, y + h * (1.05 - qp * 1.15), (2 + (q % 3) * 1.5) * k, 0, Math.PI * 2); ctx.stroke();
  }

  // Conor on the left, raising a bottle.
  var cr = h * 0.28, cpop = Math.min(1, t / 0.35), cs = 0.6 + 0.4 * (1 - Math.pow(1 - cpop, 3));
  ctx.save();
  var ccx = x + w * 0.13, ccy = y + h * 0.58;
  ctx.translate(ccx, ccy); ctx.scale(cs, cs); ctx.translate(-ccx, -ccy);
  proper12Conor(ccx, ccy, cr, chr, t, k);
  ctx.restore();

  // The bottle rises up, the cap pops, it fizzes over.
  var rise = Math.min(1, Math.max(0, (t - 0.2) / 0.55)), lift = 1 - easeOut(rise);
  var pop = Math.min(1, Math.max(0, (t - P12_POP) / 0.6)), fizz = t < P12_POP ? 0 : Math.min(1, (t - P12_POP) / 0.3) * (0.7 + 0.3 * Math.sin(t * 9));
  var shake = t > P12_POP - 0.35 && t < P12_POP ? Math.sin(t * 90) * 2.5 * k : 0;
  proper12Bottle(bx + shake, y + h * 0.95 + lift * h, h * 0.86, k, t, t < P12_POP ? 0 : pop, fizz);
  if (t > P12_POP && t < P12_POP + 0.6) { // the spray
    var sk = (t - P12_POP) / 0.6;
    ctx.save(); ctx.globalAlpha *= 1 - sk; ctx.fillStyle = P12_CREAM;
    for (var d = 0; d < 12; d++) {
      var da = -Math.PI / 2 + (d / 11 - 0.5) * 1.6, dd = sk * 90 * k;
      ctx.beginPath(); ctx.arc(bx + Math.cos(da) * dd, y + h * 0.1 + Math.sin(da) * dd + sk * sk * 40 * k, (3.5 - sk * 2) * k, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  }

  // The copy on the right.
  var tx = x + w * 0.76, tw = w * 0.42;
  var c1 = Math.min(1, Math.max(0, (t - 0.5) / 0.4));
  if (c1 > 0) {
    ctx.save(); ctx.globalAlpha *= c1;
    stillText("PROPER No.12", tx, y + h * 0.17, 54 * k, P12_GOLD, tw, { face: p12Serif(), weight: "900", stroke: "#03140b", strokeW: 0.14 });
    ctx.fillStyle = P12_GOLD; ctx.fillRect(tx - tw * 0.32, y + h * 0.29, tw * 0.64, Math.max(1, 2 * k));
    stillText("IRISH ROOT BEER", tx, y + h * 0.37, 24 * k, P12_CREAM, tw, { face: p12Sans(), weight: "800" });
    ctx.restore();
  }
  var c2 = Math.min(1, Math.max(0, (t - 2.5) / 0.35));
  if (c2 > 0) {
    ctx.save(); ctx.globalAlpha *= c2;
    ctx.translate(tx, y + h * 0.56); var cz = 0.8 + 0.2 * easeOut(c2); ctx.scale(cz, cz);
    stillText("Double champ. Double fizz.", 0, 0, 34 * k, "#ffffff", tw, { face: p12Serif(), weight: "italic 700", stroke: "#03140b", strokeW: 0.14 });
    ctx.restore();
  }
  var c3 = Math.min(1, Math.max(0, (t - 4.0) / 0.4));
  if (c3 > 0) {
    ctx.save(); ctx.globalAlpha *= c3;
    ctx.fillStyle = "rgba(243,231,201,0.92)"; stillRoundRect(tx - tw * 0.36, y + h * 0.67, tw * 0.72, h * 0.13, 10 * k); ctx.fill();
    stillText("0% WHISKEY. 100% NOTORIOUS.", tx, y + h * 0.735, 15 * k, P12_GREEN, tw * 0.68, { face: p12Sans(), weight: "900" });
    ctx.restore();
  }
  var c4 = Math.min(1, Math.max(0, (t - 5.0) / 0.4));
  if (c4 > 0) {
    ctx.save(); ctx.globalAlpha *= c4 * 0.85;
    stillText("*Gas tank sold separately. Proper No.12 is a parody.", tx, y + h * 0.9, 11 * k, P12_CREAM, tw, { face: p12Sans(), weight: "600" });
    ctx.restore();
  }
  ctx.strokeStyle = P12_GOLD; ctx.lineWidth = 3 * k; stillRoundRect(x + 4 * k, y + 4 * k, w - 8 * k, h - 8 * k, 12 * k); ctx.stroke();
  ctx.strokeStyle = "rgba(212,175,55,0.45)"; ctx.lineWidth = 1.2 * k; stillRoundRect(x + 10 * k, y + 10 * k, w - 20 * k, h - 20 * k, 9 * k); ctx.stroke();
  ctx.restore();
}
function drawProper12Banner() {
  if (p12Show <= 0 || stadiumOn()) return;
  drawProper12Jumbo(10, 10, W - 20, 110);
}

// ---------------------------------------------------------------- still version
// The silent still (in the still-ad rotation, still-ads.js): a frosty mug
// with a foam head on a dark wood pub bar, the bottle beside it, Conor on the
// right. ORDER A PROPER ONE.
function drawProper12Still(x, y, w, h, k, ch) {
  var sans = p12Sans(), serif = p12Serif();
  // A pub: dark green wall with gold panelling, a wood bar along the bottom.
  ctx.fillStyle = "#0d3a24"; ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = "rgba(212,175,55,0.22)"; ctx.lineWidth = 2 * k;
  for (var p = 0; p < 6; p++) { stillRoundRect(x + w * (0.02 + p * 0.165), y + h * 0.06, w * 0.14, h * 0.6, 6 * k); ctx.stroke(); }
  var barY = y + h * 0.74;
  var wood = ctx.createLinearGradient(0, barY, 0, y + h);
  wood.addColorStop(0, "#7a4a24"); wood.addColorStop(0.18, "#5a3216"); wood.addColorStop(1, "#2e180a");
  ctx.fillStyle = wood; ctx.fillRect(x, barY, w, y + h - barY);
  ctx.fillStyle = "rgba(255,220,170,0.25)"; ctx.fillRect(x, barY, w, 3 * k);
  // The mug: thick glass, root beer, a foam head, frost.
  var mx = x + w * 0.2, mw = h * 0.36, mTop = y + h * 0.3, mBot = barY + h * 0.06;
  ctx.fillStyle = "rgba(220,240,255,0.25)"; ctx.strokeStyle = "rgba(230,245,255,0.8)"; ctx.lineWidth = 3 * k;
  ctx.beginPath(); ctx.roundRect(mx + mw / 2 - 4 * k, mTop + h * 0.1, h * 0.12, h * 0.26, 12 * k); ctx.stroke(); // handle
  ctx.beginPath(); ctx.roundRect(mx - mw / 2, mTop, mw, mBot - mTop, 6 * k); ctx.fill(); ctx.stroke();
  var rb = ctx.createLinearGradient(mx - mw / 2, 0, mx + mw / 2, 0);
  rb.addColorStop(0, "#3a1906"); rb.addColorStop(0.5, "#6e3410"); rb.addColorStop(1, "#2a1204");
  ctx.fillStyle = rb; ctx.fillRect(mx - mw / 2 + 4 * k, mTop + h * 0.08, mw - 8 * k, mBot - mTop - h * 0.08 - 4 * k);
  ctx.fillStyle = "#f8eed7"; ctx.strokeStyle = "rgba(150,110,60,0.5)"; ctx.lineWidth = 1 * k;
  for (var f = 0; f < 6; f++) { ctx.beginPath(); ctx.arc(mx - mw / 2 + mw * (f + 0.5) / 6, mTop + h * 0.04 - (f % 2) * 4 * k, mw * 0.11, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); }
  ctx.beginPath(); ctx.ellipse(mx - mw * 0.32, mTop + h * 0.16, 4 * k, h * 0.07, 0, 0, Math.PI * 2); ctx.fill(); // foam running down
  ctx.fillStyle = "rgba(255,255,255,0.45)";
  for (var d = 0; d < 9; d++) { ctx.beginPath(); ctx.arc(mx - mw * 0.35 + ((d * 37) % 10) / 10 * mw * 0.7, mTop + h * 0.15 + ((d * 53) % 10) / 10 * (mBot - mTop - h * 0.2), 1.6 * k, 0, Math.PI * 2); ctx.fill(); } // frost
  ctx.strokeStyle = "rgba(255,255,255,0.6)"; ctx.lineWidth = 3 * k;
  ctx.beginPath(); ctx.moveTo(mx - mw * 0.36, mTop + h * 0.12); ctx.lineTo(mx - mw * 0.36, mBot - h * 0.04); ctx.stroke();
  // The bottle beside it.
  proper12Bottle(x + w * 0.36, mBot, h * 0.72, k, 0.6, 1, 0);
  // The copy.
  var cx = x + w * 0.6, cw = w * 0.3;
  stillText("ORDER A", cx, y + h * 0.15, 22 * k, P12_CREAM, cw, { face: sans, weight: "800" });
  stillText("PROPER ONE.", cx, y + h * 0.31, 46 * k, P12_GOLD, cw, { face: serif, weight: "900", stroke: "#03140b", strokeW: 0.1 });
  stillText("PROPER No.12 IRISH ROOT BEER", cx, y + h * 0.46, 15 * k, "#ffffff", cw, { face: sans, weight: "900" });
  stillText("The root beer of the double champ.", cx, y + h * 0.58, 17 * k, P12_CREAM, cw, { face: serif, weight: "italic 600" });
  stillText("SERVED ICE COLD  •  FINISH IT IN 13 SECONDS", cx, y + h * 0.86, 12 * k, "#f3e7c9", cw * 1.05, { face: sans, weight: "900" });
  // Conor on the right.
  if (ch) stillFighter(x + w * 0.88, y + h * 0.5, h * 0.3, ch.look, ch.name);
  p12Shamrock(x + w * 0.94, y + h * 0.14, 6 * k, "rgba(125,255,154,0.7)", 0.3);
  ctx.strokeStyle = P12_GOLD; ctx.lineWidth = 3 * k; stillRoundRect(x + 5 * k, y + 5 * k, w - 10 * k, h - 10 * k, 12 * k); ctx.stroke();
}

// Synth sound: the cap popping, a fizz, a pour with bubbles, and a little
// tin-whistle jig with a drum under it.
function playProper12Sound() {
  try {
    var ac = getAudioCtx();
    if (!ac) return;
    if (ac.state === "suspended") ac.resume();
    stopProper12Sound();
    var out = p12Out = ac.createGain(), now = ac.currentTime + 0.03;
    out.gain.value = 0.7; out.connect(ac.destination);
    if (typeof duckMusic === "function") duckMusic(now, now + P12_SHOW);
    var nb = ac.createBuffer(1, Math.floor(ac.sampleRate * 1.2), ac.sampleRate), nd = nb.getChannelData(0);
    for (var i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
    function noise(at, len, f, q, vol, type) {
      var s = ac.createBufferSource(), fl = ac.createBiquadFilter(), g = ac.createGain();
      s.buffer = nb; fl.type = type || "bandpass"; fl.frequency.value = f; fl.Q.value = q;
      g.gain.setValueAtTime(0.0001, at); g.gain.exponentialRampToValueAtTime(vol, at + Math.min(0.05, len / 4));
      g.gain.setValueAtTime(vol, at + len * 0.7); g.gain.exponentialRampToValueAtTime(0.0001, at + len);
      s.connect(fl); fl.connect(g); g.connect(out); s.start(at); s.stop(at + len + 0.02);
    }
    function tone(at, type, f0, f1, vol, len, vib) {
      var o = ac.createOscillator(), g = ac.createGain();
      o.type = type; o.frequency.setValueAtTime(f0, at); if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(f1, at + len);
      if (vib) { var v = ac.createOscillator(), vg = ac.createGain(); v.frequency.value = 6.5; vg.gain.value = f0 * 0.01; v.connect(vg); vg.connect(o.frequency); v.start(at); v.stop(at + len + 0.02); }
      g.gain.setValueAtTime(0.0001, at); g.gain.exponentialRampToValueAtTime(vol, at + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, at + len);
      o.connect(g); g.connect(out); o.start(at); o.stop(at + len + 0.02);
    }
    // The cap: a pop, then the fizz rushing out.
    tone(now + P12_POP, "sine", 1100, 380, 0.4, 0.07);
    noise(now + P12_POP, 0.08, 2600, 1, 0.5);
    noise(now + P12_POP + 0.04, 1.1, 5200, 0.6, 0.18, "highpass");
    // A pour with bubbles in it.
    noise(now + 2.4, 0.9, 1800, 0.8, 0.14);
    for (var b = 0; b < 7; b++) tone(now + 2.45 + b * 0.12, "sine", 380 + (b * 97) % 260, 760, 0.07, 0.1);
    // A little jig on a tin whistle, with a drum on the beat.
    var beat = 0.19, start = now + 0.35;
    var notes = [74, 78, 81, 78, 74, 69, 71, 74, 78, 76, 74, 71, 69, 71, 74, 76, 78, 81, 83, 81, 78, 76, 74, 74];
    notes.forEach(function (n, j) {
      var at = start + j * beat, f = 440 * Math.pow(2, (n - 69) / 12);
      if (at > now + P12_SHOW - 0.6) return;
      tone(at, "triangle", f, f, j % 3 === 0 ? 0.11 : 0.08, beat * 0.95, true);
      if (j % 3 === 0) tone(at, "sine", 110, 55, 0.22, 0.16); // the drum
    });
  } catch (e) { /* never let audio break the game */ }
}
function stopProper12Sound() {
  if (!p12Out) return;
  try { p12Out.disconnect(); } catch (e) { /* already gone */ }
  p12Out = null;
}
