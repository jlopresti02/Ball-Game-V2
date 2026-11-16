// Tale of the tape taunts for Conor McGregor and Charles Oliveira (Joe,
// 2026-11-15), on top of the tale of the tape intro (tale-tape.js).
//
// Conor ("presser"): his press conference in his portrait. His podium rises
// in front of him, the mic squeals, and he talks trash to the other fighter
// with his real line "He's a snake in the grass." while his outside glove
// points across at them, word by word. The other fighter fumes, then does
// their own taunt once he's said it.
// Charles ("saiyan"): he powers up into Super Saiyan once (blond hair, the
// golden aura and lightning round his portrait, with the power-up burst),
// holds the form, then powers down.
// Only ever the fighter's own two gloves. The line goes through the talk
// channel (playTalk), so it never talks over the announcer.
"use strict";

var TAPE_PRESSER_AT = 4.9;   // the podium comes up (a beat before the last row)
var TAPE_PRESSER_LEN = 2.5;  // up, the line, down again
var TAPE_PRESSER_RISE = 0.3;
var TAPE_PRESSER_LINE = "He's a snake in the grass.";

// His line: his own line for that opponent if he has one with a clip (vs
// Dustin: "A gust of wind and he does the chicken dance.", conor.js), else
// the snake in the grass.
function tapePresserLine() {
  var b = balls && balls[0] && balls[1] ? (tapeSigKind(balls[0].char) === "presser" ? balls[1] : balls[0]) : null;
  var vs = b && typeof CM_LINES !== "undefined" && CM_LINES.vs && CM_LINES.vs[b.char.id];
  return vs && vs[0] && SPEECH_CLIPS[vs[0]] ? vs[0] : TAPE_PRESSER_LINE;
}
// How long his part runs: long enough for the line (Joe, 2026-11-16).
function tapePresserLen() {
  var name = SPEECH_CLIPS[tapePresserLine()], d = name && clipBuffers[name] ? clipBuffers[name].duration : 1.5;
  return Math.max(TAPE_PRESSER_LEN, TAPE_PRESSER_RISE + 0.1 + d + 0.55);
}
var TAPE_SAIYAN_LEN = 1.45;
// When he's blond (seconds into his taunt): one power-up, he holds the form,
// then powers down (Joe, 2026-11-15: no flickering).
var TAPE_SAIYAN_ON = [[0, 1.3]];

function tapeTauntKind(ch) {
  if (ch.id === "c-conor-mcgregor") return "presser";
  if (ch.id === "c-charles-oliveira") return "saiyan";
  return null;
}
function tapeSigLen(kind) {
  if (kind === "presser") return tapePresserLen();
  if (kind === "saiyan") return TAPE_SAIYAN_LEN;
  return TAPE_SIG_LEN;
}
// The press conference goes first and the other fighter answers once the
// line is out (sg: the usual [left, right] times).
function tapeTauntTimes(A, B, sg) {
  var s = [sg[0], sg[1]], k = [tapeSigKind(A), tapeSigKind(B)];
  for (var i = 0; i < 2; i++) {
    if (k[i] !== "presser" || k[1 - i] === "presser") continue;
    s[i] = TAPE_PRESSER_AT;
    s[1 - i] = TAPE_PRESSER_AT + tapePresserLen() - 0.85;
    if (k[1 - i] === "saiyan") s[1 - i] = Math.min(s[1 - i], TAPE_HIT.out - TAPE_SAIYAN_LEN + 0.05);
  }
  return s;
}
function tapeSaiyanOn(sig) {
  if (sig < 0) return false;
  for (var i = 0; i < TAPE_SAIYAN_ON.length; i++) if (sig >= TAPE_SAIYAN_ON[i][0] && sig < TAPE_SAIYAN_ON[i][1]) return true;
  return false;
}

// From drawTaleTape: the mic, the line and the aura sounds, once each.
function tickTapeTaunts(t) {
  if (!tape || !balls || !balls[0] || !balls[1]) return;
  var A = balls[0].char, B = balls[1].char, sg = tapeSigTimes(A, B), snd = tape.snd || (tape.snd = {});
  [A, B].forEach(function (ch, i) {
    var kind = tapeSigKind(ch), st = t - sg[i];
    if (kind === "presser") {
      if (!snd.mic && st >= 0) { snd.mic = true; if (typeof playMicFeedback === "function") playMicFeedback(); }
      if (!snd.line && st >= TAPE_PRESSER_RISE + 0.1 && st < tapePresserLen() - 0.6) {
        tape.line = tapePresserLine();
        var name = SPEECH_CLIPS[tape.line];
        if (!name || !clipBuffers[name]) { snd.line = true; tape.lineAt = t; tape.lineLen = 1.5; }
        else if (playTalk(name, 1)) { snd.line = true; tape.lineAt = t; tape.lineLen = clipBuffers[name].duration; }
      }
    } else if (kind === "saiyan") {
      if (!snd["up" + i] && st >= 0 && st < 0.2) { snd["up" + i] = true; playClipOnce("saiyanUp", 0.9); }
      var end = TAPE_SAIYAN_ON[TAPE_SAIYAN_ON.length - 1][1];
      if (!snd["down" + i] && st >= end && st < end + 0.3) { snd["down" + i] = true; playClipOnce("saiyanDown", AURA_VOL * 1.1); }
    }
  });
}

// From drawTapeFighter, behind the ring: Charles's golden aura while he's blond.
function drawTapeSaiyanAura(x, y, pr, sig) {
  if (!tapeSaiyanOn(sig)) return;
  var t = performance.now() / 1000, rr = pr * 0.78;
  ctx.save();
  [[1.0, 0.0], [0.82, 0.9]].forEach(function (L, li) {
    ctx.beginPath();
    saiyanFlamePath(x, y, rr * L[0], t, L[1], li);
    var g = ctx.createLinearGradient(0, y + pr * 1.2, 0, y - pr * 2.2);
    g.addColorStop(0, li ? "rgba(255,236,90,0.75)" : "rgba(255,170,0,0.7)");
    g.addColorStop(1, li ? "rgba(255,248,180,0.35)" : "rgba(255,226,90,0.3)");
    ctx.fillStyle = g;
    if (!li) { ctx.shadowColor = "rgba(255,200,0,0.95)"; ctx.shadowBlur = 30; }
    ctx.fill();
    ctx.shadowBlur = 0;
  });
  // Streaks of energy shooting up past the ring
  ctx.lineCap = "round";
  for (var k = 0; k < 8; k++) {
    var p = (t * 1.8 + k * 0.137) % 1, sx = x + Math.sin(k * 2.39) * pr * 1.1, sy = y + pr * 0.9 - p * pr * 2.6;
    ctx.strokeStyle = "rgba(255,252,215," + (0.9 * Math.sin(p * Math.PI)) + ")"; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(sx, sy - pr * 0.3); ctx.stroke();
  }
  ctx.restore();
}
// In front of him: a white flash each time it snaps on, and lightning over him.
function drawTapeSaiyanFront(x, y, pr, sig) {
  if (sig < 0) return;
  ctx.save();
  TAPE_SAIYAN_ON.forEach(function (on) {
    var f = (sig - on[0]) / 0.08;
    if (f >= 0 && f < 1) {
      ctx.fillStyle = "rgba(255,226,120," + (0.3 * (1 - f)) + ")";
      ctx.beginPath(); ctx.arc(x, y, pr * (1 + 0.25 * f), 0, Math.PI * 2); ctx.fill();
    }
  });
  if (tapeSaiyanOn(sig)) {
    // a gold glow over him and a gold rim while he's blond
    ctx.fillStyle = "rgba(255,200,40,0.14)";
    ctx.beginPath(); ctx.arc(x, y, pr - 3, 0, Math.PI * 2); ctx.fill();
    ctx.lineWidth = 7; ctx.strokeStyle = "#ffd23f"; ctx.shadowColor = "rgba(255,200,0,0.9)"; ctx.shadowBlur = 16;
    ctx.beginPath(); ctx.arc(x, y, pr, 0, Math.PI * 2); ctx.stroke();
    ctx.shadowBlur = 0;
    var slot = Math.floor(performance.now() / 1000 * 12);
    ctx.lineJoin = "round"; ctx.lineCap = "round";
    for (var j = 0; j < 2; j++) {
      var h = Math.sin((slot + j * 17) * 12.9898) * 43758.5453; h -= Math.floor(h);
      if (h > 0.6) continue;
      var a0 = h * 40, sx = x + Math.cos(a0) * pr * 0.9, sy = y + Math.sin(a0) * pr * 0.7, pts = [[sx, sy]];
      for (var q = 1; q <= 4; q++) {
        var hh = Math.sin((slot * 5 + q * 31 + j * 7) * 78.233) * 12345.678; hh -= Math.floor(hh);
        pts.push([sx + (hh - 0.5) * pr * 0.7, sy - q * pr * 0.25]);
      }
      [[7, "rgba(120,200,255,0.45)"], [3, "rgba(235,250,255,0.95)"]].forEach(function (s) {
        ctx.lineWidth = s[0]; ctx.strokeStyle = s[1];
        ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
        for (var q2 = 1; q2 < pts.length; q2++) ctx.lineTo(pts[q2][0], pts[q2][1]);
        ctx.stroke();
      });
    }
  }
  ctx.restore();
}
// His look in the portrait: blond while it's on (his Do Bronx hair colour).
function tapeSaiyanLook(ch, sig) {
  var hc = ch.special && ch.special.hairColor;
  if (!ch.look || !hc || !tapeSaiyanOn(sig)) return ch.look;
  return Object.assign({}, ch.look, { hairColor: hc });
}
// His gloves while he powers up: fists clenched low, shaking.
function tapeSaiyanGloves(g, pr, sig) {
  var k = Math.min(1, sig / 0.1) * Math.min(1, Math.max(0, (TAPE_SAIYAN_LEN - sig) / 0.15));
  var sh = tapeSaiyanOn(sig) ? 4 : 2;
  g.forEach(function (gl, j) {
    gl.y += pr * 0.22 * k + Math.sin(sig * 70 + j * 2) * sh * k;
    gl.x += (j ? 1 : -1) * pr * 0.12 * k + Math.cos(sig * 63 + j) * sh * k;
    gl.s = 1 + 0.1 * k;
  });
}

// Conor's podium in front of his portrait (his own podium art, conor.js).
function drawTapePodium(x, y, pr, sig) {
  if (sig < 0 || typeof drawPodium !== "function") return;
  var sink = tapePresserLen() - 0.35, keep = cmPodium;
  cmPodium = { id: -1, x: x, y: y + pr * 0.14, t: sig, sink: sig > sink ? sink : null };
  try { drawPodium({ r: pr * 0.64 }); } catch (e) {}
  cmPodium = keep;
}
// His gloves at the podium: the inside one resting on it, the outside one
// pointing across at the other fighter, jabbing on the words.
function tapePresserGloves(g, pr, sig, side) {
  var up = Math.min(1, sig / TAPE_PRESSER_RISE) * Math.min(1, Math.max(0, (tapePresserLen() - 0.3 - sig) / 0.25));
  var out = side < 0 ? 0 : 1, inn = 1 - out, talk = tape && tape.lineAt != null ? (performance.now() - tape.t0) / 1000 - tape.lineAt : -1;
  var jab = talk >= 0 && talk < (tape.lineLen || 1.5) ? Math.abs(Math.sin(talk * 9)) : 0;
  g[out].y += pr * 0.12 * up; g[out].x -= side * pr * 0.12 * up; // resting on the podium
  g[inn].x += -side * pr * (0.42 + 0.14 * jab) * up; g[inn].y -= pr * 0.12 * up; // pointing across at them
  g[inn].point = up; g[inn].pointDir = -side;
  g[inn].s = 1 + 0.12 * jab;
}

// The line, in a speech bubble over the middle of the card, its tail to him.
function drawTapePresserBubble(t, w, py, pr, px) {
  if (!tape || tape.lineAt == null || px == null) return;
  var st = t - tape.lineAt, len = (tape.lineLen || 1.5) + 0.35;
  if (st < 0 || st > len) return;
  var a = Math.min(1, st / 0.12) * Math.min(1, (len - st) / 0.2), pop = tapePop(Math.min(1, st / 0.2));
  var bw = 430, bh = 92, bx = w / 2, by = Math.max(bh / 2 + 10, py - pr * 0.95); // (kept inside the card)
  var dir = px > bx ? 1 : -1;
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.translate(bx, by); ctx.scale(pop, pop);
  ctx.fillStyle = "#ffffff"; ctx.strokeStyle = "#0b0f12"; ctx.lineWidth = 6; ctx.lineJoin = "round";
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(-bw / 2, -bh / 2, bw, bh, 26); else ctx.rect(-bw / 2, -bh / 2, bw, bh);
  ctx.moveTo(dir * (bw / 2 - 70), bh / 2 - 3);
  ctx.lineTo(dir * (bw / 2 + 10), bh / 2 + 34);
  ctx.lineTo(dir * (bw / 2 - 20), bh / 2 - 3);
  ctx.fill(); ctx.stroke();
  ctx.fillStyle = "#ffffff"; ctx.fillRect(dir > 0 ? bw / 2 - 66 : -bw / 2 + 24, bh / 2 - 9, 42, 12); // (no line where the tail meets it)
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  var words = (tape.line || TAPE_PRESSER_LINE).toUpperCase().split(" "), lines = [words.join(" ")];
  if (lines[0].length > 28) { var half = Math.ceil(words.length / 2); lines = [words.slice(0, half).join(" "), words.slice(half).join(" ")]; }
  ctx.fillStyle = "#0b0f12";
  var longest = lines.reduce(function (m, ln) { return ln.length > m.length ? ln : m; }, "");
  tapeFont(longest, lines.length > 1 ? 34 : 40, bw - 40, "900", TAPE_IMPACT); // one size for both lines
  lines.forEach(function (ln, k) { ctx.fillText(ln, 0, 2 + (k - (lines.length - 1) / 2) * 38); });
  ctx.restore();
}
