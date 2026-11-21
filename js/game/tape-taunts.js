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
  if (ch.id === "c-ilia-topuria") return "rose";
  if (ch.id === "c-joshua-van") return "fire";
  if (ch.id === "c-jiri-prochazka") return "katana";
  if (ch.id === "c-tony-ferguson") return "burrito";
  if (ch.id === "c-nate-diaz") return "stockton";
  if (ch.id === "c-khabib-nurmagomedov") return "sendloc";
  return null;
}
function tapeSigLen(kind) {
  if (kind === "presser") return tapePresserLen();
  if (kind === "saiyan") return TAPE_SAIYAN_LEN;
  if (kind === "rose") return TAPE_ROSE_LEN;
  return tapeOwnLen(kind) || TAPE_SIG_LEN;
}
// When the taunts go (Joe, 2026-11-21): the first one starts as the first
// stat pops up, right after the announcer's "Our tale of the tape!", and the
// other fighter answers once it's done. Who goes first: a thumbs down (the
// order in sg, tale-tape.js), the press conference, Ilia's rose against an
// eye poke (Gane's poke lands mid-sniff), then Khabib's call (his strike lands
// on the other fighter); otherwise left then right. Everything is over before
// the card goes.
var TAPE_TAUNT_AT = TAPE_HIT.rows[0], TAPE_TAUNT_GAP = 0.15;
function tapeTauntFirst(k) {
  var p = k.map(function (kind, i) {
    if (kind === "presser" || kind === "thumbs") return 3;
    if (kind === "rose" && k[1 - i] === "poke") return 2;
    return kind === "sendloc" ? 1 : 0;
  });
  return p[1] > p[0] ? 1 : p[0] > p[1] ? 0 : -1;
}
function tapeTauntTimes(A, B, sg) {
  var k = [tapeSigKind(A), tapeSigKind(B)], len = [tapeSigLen(k[0]), tapeSigLen(k[1])];
  var first = tapeTauntFirst(k);
  if (first < 0) first = sg[1] < sg[0] ? 1 : 0;
  var s = [0, 0], t0 = TAPE_TAUNT_AT, other = 1 - first;
  s[first] = t0;
  var next = t0 + len[first] + TAPE_TAUNT_GAP;
  if (k[first] === "presser") next = t0 + len[first] - 0.85; // answers as the line finishes
  if (k[first] === "rose" && k[other] === "poke") next = t0 + TAPE_ROSE_POKE;
  s[other] = Math.max(t0 + 0.4, Math.min(next, TAPE_HIT.out + 0.05 - len[other]));
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
    } else if (tapeOwnLen(kind)) tickTapeOwn(kind, st, i, snd); // Van's fire, Jiri's katana, Tony's burrito
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

// ---------------------------------------------------------------
// Ilia ("rose", Joe 2026-11-17): he lifts a red rose to his nose with his
// outside glove, breathes it in (eyes on the camera, scent curling up, a few
// petals and hearts drifting off) and lowers it. Against Gane, Gane's eye
// poke lands mid-sniff and the rose drops out of his glove and falls away.
// ---------------------------------------------------------------
var TAPE_ROSE_LEN = 1.6;
var TAPE_ROSE_POKE = 0.55; // vs Gane: Ilia goes first and Gane's poke starts this far into his sniff
var TAPE_ROSE_HIT = 0.17;  // Gane's first jab lands this far into the poke
function tapeRoseUp(sig, ost) {
  var up = Math.min(1, sig / 0.3), down = Math.min(1, Math.max(0, (TAPE_ROSE_LEN - sig) / 0.35));
  var k = tapeEase(up) * down;
  if (ost >= TAPE_ROSE_HIT) k *= Math.max(0, 1 - (ost - TAPE_ROSE_HIT) / 0.2); // poked: his glove drops back
  return k;
}
// His outside glove brings the rose up under his nose.
function tapeRoseGloves(g, pr, sig, side, ost) {
  var out = side < 0 ? 0 : 1, k = tapeRoseUp(sig, ost);
  var sniff = sig > 0.35 && ost < TAPE_ROSE_HIT ? Math.sin((sig - 0.35) * 9) * 0.5 + 0.5 : 0;
  var gl = g[out];
  gl.x += (-side * pr * 0.45 - side * pr * 0.03 * sniff) * k;
  gl.y -= pr * (0.1 + 0.04 * sniff) * k;
  if (ost >= TAPE_ROSE_HIT) { var sh = Math.max(0, 1 - (ost - TAPE_ROSE_HIT) / 0.5); g.forEach(function (o, j) { o.x += Math.sin(ost * 60 + j) * 5 * sh; o.y -= pr * 0.08 * sh; }); }
}
// Where the bloom sits while he holds it (his glove grips the stem).
var TAPE_ROSE_S = 0.05; // the rose's size, in portrait radii per unit
function tapeRoseHeld(gl, pr, side) {
  return { x: gl.x - side * pr * 0.08, y: gl.y - pr * TAPE_ROSE_S * 7, rot: side * 0.25 };
}
// The rose itself, behind his glove so the glove grips the stem. Vs Gane,
// once the poke lands it falls, tumbling, out of the bottom of the card.
function drawTapeRose(g, gr, pr, sig, side, ost, x, y) {
  var gl = g[side < 0 ? 0 : 1], s = pr * TAPE_ROSE_S;
  if (ost >= TAPE_ROSE_HIT) {
    var ft = ost - TAPE_ROSE_HIT;
    if (ft > 1.1) return;
    // Where it was held at the moment of the poke (full lift, his guard at rest).
    var hx = x + side * pr * 0.6 - side * pr * 0.45, hy = y + pr * 0.3 - pr * 0.1;
    var p = tapeRoseHeld({ x: hx, y: hy }, pr, side);
    var fx = p.x + side * 160 * ft, fy = p.y + 1600 * ft * ft;
    drawRose(fx, fy, p.rot + side * 7 * ft, s);
    // a couple of petals knocked loose
    for (var i = 0; i < 4; i++) {
      var a = i * 1.7, px = p.x + Math.cos(a) * 140 * ft * (1 + i * 0.3), py = p.y - 90 * ft + 500 * ft * ft;
      ctx.fillStyle = "rgba(181,18,27," + Math.max(0, 1 - ft) + ")";
      ctx.beginPath(); ctx.ellipse(px, py, s * 1.8, s * 1.1, a + ft * 8, 0, Math.PI * 2); ctx.fill();
    }
    return;
  }
  if (sig < 0) return;
  var k = tapeRoseUp(sig, ost);
  if (k <= 0.02) return;
  var p2 = tapeRoseHeld(gl, pr, side);
  ctx.save(); ctx.globalAlpha = Math.min(1, k * 3);
  drawRose(p2.x, p2.y, p2.rot * k, s);
  ctx.restore();
}
// Over everything: the scent curling up off the bloom, petals and hearts.
function drawTapeRoseScent(g, gr, pr, sig, side, ost) {
  if (sig < 0.35 || ost >= TAPE_ROSE_HIT) return;
  var k = tapeRoseUp(sig, ost); if (k < 0.5) return;
  var p = tapeRoseHeld(g[side < 0 ? 0 : 1], pr, side), st = sig - 0.35, a = Math.min(1, st / 0.2) * k;
  ctx.save(); ctx.lineCap = "round";
  for (var w = 0; w < 3; w++) { // three wisps rising and curling
    ctx.strokeStyle = "rgba(255,190,210," + (0.75 * a) + ")"; ctx.lineWidth = 4 - w;
    ctx.beginPath();
    for (var q = 0; q <= 14; q++) {
      var u = q / 14, yy = p.y - pr * 0.15 - u * pr * 0.5, xx = p.x + Math.sin(u * 7 + st * 6 + w * 2) * pr * 0.07 * (0.4 + u) + (w - 1) * pr * 0.06;
      if (q === 0) ctx.moveTo(xx, yy); else ctx.lineTo(xx, yy);
    }
    ctx.stroke();
  }
  for (var h = 0; h < 3; h++) { // little hearts floating off
    var ht = (st * 0.9 + h * 0.33) % 1, hx = p.x + side * pr * (0.15 + 0.35 * ht) + Math.sin(ht * 9 + h) * 8, hy = p.y - pr * (0.2 + 0.6 * ht);
    ctx.globalAlpha = a * (1 - ht);
    tapeHeart(hx, hy, pr * 0.11 * (0.8 + 0.4 * ht), "#e0303a");
  }
  ctx.restore();
}
function tapeHeart(x, y, r, c) {
  ctx.fillStyle = c; ctx.strokeStyle = "#5c0a0e"; ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x, y + r * 0.9);
  ctx.bezierCurveTo(x - r * 1.6, y - r * 0.2, x - r * 0.8, y - r * 1.3, x, y - r * 0.45);
  ctx.bezierCurveTo(x + r * 0.8, y - r * 1.3, x + r * 1.6, y - r * 0.2, x, y + r * 0.9);
  ctx.fill(); ctx.stroke();
}

// ---------------------------------------------------------------
// Joe, 2026-11-19: three more.
// Joshua Van ("fire"): he clenches both gloves up by his chin and they catch
// fire (his fire hands, van.js), burn for a beat and go out.
// Jiří Procházka ("katana"): his outside glove drops to his hip and draws a
// katana up in one sweep, holds it up with a glint off the blade, then slides
// it home (click).
// Tony Ferguson ("burrito"): he brings a burrito up from his hip and takes
// three big bites (CHOMP!, Joe's eating noise), crumbs falling.
// Only ever the fighter's own two gloves.
// ---------------------------------------------------------------
var TAPE_FIRE_LEN = 1.5, TAPE_FIRE_LIT = 0.22;
var TAPE_KATANA_LEN = 1.5, TAPE_KATANA_DRAW = [0.2, 0.42], TAPE_KATANA_HOME = 1.15;
var TAPE_BURRITO_LEN = 1.6, TAPE_BURRITO_BITES = [0.45, 0.78, 1.11];
function tapeOwnLen(kind) {
  return kind === "fire" ? TAPE_FIRE_LEN : kind === "katana" ? TAPE_KATANA_LEN : kind === "burrito" ? TAPE_BURRITO_LEN :
    kind === "stockton" ? TAPE_NATE_LEN : kind === "sendloc" ? TAPE_SL_LEN : 0;
}
function tapeSmooth(u) { u = Math.max(0, Math.min(1, u)); return u * u * (3 - 2 * u); }

// Sounds, once each (from tickTapeTaunts).
function tickTapeOwn(kind, st, i, snd) {
  if (kind === "fire") {
    if (!snd["fire" + i] && st >= TAPE_FIRE_LIT && st < TAPE_FIRE_LIT + 0.3) { snd["fire" + i] = true; if (typeof playVnIgnite === "function") playVnIgnite(); }
  } else if (kind === "katana") {
    if (!snd["draw" + i] && st >= TAPE_KATANA_DRAW[0] && st < TAPE_KATANA_DRAW[1]) { snd["draw" + i] = true; if (typeof playKatanaDraw === "function") playKatanaDraw(); }
    if (!snd["home" + i] && st >= TAPE_KATANA_HOME + 0.2 && st < TAPE_KATANA_LEN) { snd["home" + i] = true; if (typeof playSheatheClick === "function") playSheatheClick(); }
  } else if (kind === "burrito") {
    if (!snd["chew" + i] && st >= TAPE_BURRITO_BITES[0] - 0.05 && st < TAPE_BURRITO_LEN) { snd["chew" + i] = true; withClip("burritoEat", function () { playClip("burritoEat", 0.95); }); } // a sound effect, not a voice line
  } else if (kind === "stockton" || kind === "sendloc") tickTapeNateKhabib(kind, st, i, snd); // (below)
}

// Van: how far his gloves are lit (0..1).
function tapeFireK(sig) {
  if (sig < TAPE_FIRE_LIT) return 0;
  return tapeSmooth((sig - TAPE_FIRE_LIT) / 0.12) * tapeSmooth((TAPE_FIRE_LEN - sig) / 0.3);
}
// Both gloves clench up by his chin, shaking with the heat.
function tapeFireGloves(g, pr, sig) {
  var k = tapeSmooth(sig / 0.2) * tapeSmooth((TAPE_FIRE_LEN - sig) / 0.25), f = tapeFireK(sig);
  g.forEach(function (gl, j) {
    gl.x += (j ? -1 : 1) * pr * 0.08 * k + Math.sin(sig * 55 + j * 2) * 2.5 * f;
    gl.y -= pr * 0.12 * k + Math.cos(sig * 47 + j) * 2 * f;
    gl.s = 1 + 0.12 * k;
  });
}
// Behind the gloves (front false) or a lick over them (front true).
function drawTapeFire(g, gr, sig, front) {
  var f = tapeFireK(sig);
  if (f <= 0 || typeof drawVnFlame !== "function") return;
  var keep = vnClock; vnClock = performance.now() / 1000;
  g.forEach(function (gl, j) { drawVnFlame(gl.x, gl.y, gr * gl.s * 0.9, f, j, front); });
  if (!front) { // the burst as they catch
    var bt = sig - TAPE_FIRE_LIT;
    if (bt < 0.35) g.forEach(function (gl, j) {
      for (var q = 0; q < 9; q++) {
        var a = -Math.PI / 2 + (q / 8 - 0.5) * 2.6, d = gr * (0.8 + 4.5 * bt);
        ctx.fillStyle = q % 3 ? "rgba(255,122,26," + (1 - bt / 0.35) + ")" : "rgba(255,211,77," + (1 - bt / 0.35) + ")";
        ctx.beginPath(); ctx.arc(gl.x + Math.cos(a + j) * d, gl.y + Math.sin(a + j) * d, 4, 0, Math.PI * 2); ctx.fill();
      }
    });
  }
  vnClock = keep;
}

// Jiří: where the hand and the blade are (blade angle, how much is out).
function tapeKatanaPose(x, y, pr, sig, side) {
  var hip = { x: x + side * pr * 0.2, y: y + pr * 0.85 }, up = { x: x + side * pr * 0.5, y: y - pr * 0.02 };
  var rest = { x: x + side * pr * 0.6, y: y + pr * 0.3 };
  var downA = Math.PI / 2 + side * 0.9, upA = -Math.PI / 2 - side * 0.55; // along his hip, then held up
  var t0 = TAPE_KATANA_DRAW[0], t1 = TAPE_KATANA_DRAW[1], h = TAPE_KATANA_HOME;
  if (sig < t0) { var a = tapeSmooth(sig / t0); return { x: rest.x + (hip.x - rest.x) * a, y: rest.y + (hip.y - rest.y) * a, ang: downA, out: 0 }; }
  if (sig < t1) { // the draw: one sweep up and out
    var u = tapeSmooth((sig - t0) / (t1 - t0));
    return { x: hip.x + (up.x - hip.x) * u + side * pr * 0.25 * Math.sin(u * Math.PI), y: hip.y + (up.y - hip.y) * u, ang: downA + (upA - downA) * u, out: Math.min(1, u * 2.5), trail: u };
  }
  if (sig < h) return { x: up.x, y: up.y + Math.sin((sig - t1) * 6) * 2, ang: upA, out: 1, glint: (sig - t1) / (h - t1) };
  var v = tapeSmooth((sig - h) / 0.25), w = tapeSmooth((sig - h - 0.25) / 0.1);
  if (sig < h + 0.25) return { x: up.x + (hip.x - up.x) * v, y: up.y + (hip.y - up.y) * v, ang: upA + (downA - upA) * v, out: 1 - v * 0.85 };
  return { x: hip.x + (rest.x - hip.x) * w, y: hip.y + (rest.y - hip.y) * w, ang: downA, out: 0 };
}
function tapeKatanaGloves(g, x, y, pr, sig, side) {
  var gl = g[side < 0 ? 0 : 1], p = tapeKatanaPose(x, y, pr, sig, side);
  gl.x = p.x; gl.y = p.y;
}
// The sword itself, behind his glove: the grip, the guard and the blade
// (Tony's katana blade, katBlade, ferguson-katanas.js), drawn bigger for the card.
function drawTapeKatana(g, x, y, pr, sig, side) {
  var p = tapeKatanaPose(x, y, pr, sig, side);
  var S = pr / 42, L = 1.0 * 60, ca = Math.cos(p.ang), sa = Math.sin(p.ang);
  ctx.save();
  ctx.translate(p.x, p.y); ctx.scale(S, S);
  // the scabbard at his hip while it's in (dark lacquer)
  if (p.out < 1) {
    var hb = { x: (x + side * pr * 0.2 - p.x) / S, y: (y + pr * 0.85 - p.y) / S }, da = Math.PI / 2 + side * 0.9;
    ctx.lineCap = "round"; ctx.strokeStyle = "#1a1714"; ctx.lineWidth = 11;
    ctx.beginPath(); ctx.moveTo(hb.x, hb.y); ctx.lineTo(hb.x + Math.cos(da) * L * 0.9, hb.y + Math.sin(da) * L * 0.9); ctx.stroke();
    ctx.strokeStyle = "#5a1a14"; ctx.lineWidth = 7;
    ctx.beginPath(); ctx.moveTo(hb.x, hb.y); ctx.lineTo(hb.x + Math.cos(da) * L * 0.9, hb.y + Math.sin(da) * L * 0.9); ctx.stroke();
  }
  if (p.trail && p.trail < 1 && typeof katTrail !== "function") {} // (no trail needed off the mat)
  // the grip, wrapped white with dark diamonds
  ctx.lineCap = "round"; ctx.strokeStyle = "#1a1714"; ctx.lineWidth = 7;
  ctx.beginPath(); ctx.moveTo(-ca * 20, -sa * 20); ctx.lineTo(0, 0); ctx.stroke();
  ctx.strokeStyle = "#ece6d8"; ctx.lineWidth = 4.5;
  ctx.beginPath(); ctx.moveTo(-ca * 19, -sa * 19); ctx.lineTo(0, 0); ctx.stroke();
  if (p.out > 0.02 && typeof katBlade === "function") katBlade({ x: 0, y: 0 }, p.ang, L * p.out, -side, p.glint != null ? Math.max(0, Math.sin(p.glint * Math.PI)) * 0.8 : 0);
  ctx.fillStyle = "#2a2622"; ctx.strokeStyle = "#c8a24a"; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.ellipse(ca * 2, sa * 2, 3.5, 7.5, p.ang, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.restore();
}
// Over everything: a star glint running up the blade while he holds it up.
function drawTapeKatanaGlint(x, y, pr, sig, side) {
  var p = tapeKatanaPose(x, y, pr, sig, side);
  if (p.glint == null) return;
  var u = Math.min(1, p.glint * 1.6); if (u >= 1) return;
  var L = 60 * pr / 42 * u, gx = p.x + Math.cos(p.ang) * L, gy = p.y + Math.sin(p.ang) * L, s = pr * 0.16 * Math.sin(u * Math.PI);
  ctx.save(); ctx.fillStyle = "rgba(255,255,255,0.95)";
  ctx.beginPath(); ctx.moveTo(gx, gy - s); ctx.lineTo(gx + s * 0.2, gy - s * 0.2); ctx.lineTo(gx + s, gy); ctx.lineTo(gx + s * 0.2, gy + s * 0.2);
  ctx.lineTo(gx, gy + s); ctx.lineTo(gx - s * 0.2, gy + s * 0.2); ctx.lineTo(gx - s, gy); ctx.lineTo(gx - s * 0.2, gy - s * 0.2); ctx.closePath(); ctx.fill();
  ctx.restore();
}

// Tony: the burrito's open end at his mouth for each bite, back to chew.
function tapeBurritoState(x, y, pr, sig, side) {
  var mouth = { x: x - side * pr * 0.05, y: y - pr * 0.1 }, low = { x: x + side * pr * 0.7, y: y + pr * 0.75 };
  var hold = { x: x + side * pr * 0.62, y: y + pr * 0.12 }, b0 = TAPE_BURRITO_BITES;
  var eaten = 0; for (var i = 0; i < b0.length; i++) if (sig >= b0[i]) eaten++;
  var near = 0, P;
  if (sig < 0.3) { var a = tapeSmooth(sig / 0.3); P = { x: low.x + (hold.x - low.x) * a, y: low.y + (hold.y - low.y) * a }; }
  else if (sig < b0[2] + 0.2) {
    for (var j = 0; j < b0.length; j++) { var d = sig - b0[j]; if (d > -0.12 && d < 0.18) near = d < 0 ? tapeSmooth((d + 0.12) / 0.12) : 1 - tapeSmooth(d / 0.18); }
    P = { x: hold.x + (mouth.x - hold.x) * near * 0.3, y: hold.y + (mouth.y - hold.y) * near * 0.5 };
  } else { var v = tapeSmooth((sig - b0[2] - 0.2) / 0.28); P = { x: hold.x + (low.x - hold.x) * v, y: hold.y + (low.y - hold.y) * v }; }
  return { glove: P, mouth: mouth, eaten: eaten, near: near };
}
function tapeBurritoGloves(g, x, y, pr, sig, side) {
  var gl = g[side < 0 ? 0 : 1], s = tapeBurritoState(x, y, pr, sig, side);
  gl.x = s.glove.x; gl.y = s.glove.y;
  var o = g[side < 0 ? 1 : 0]; o.y += Math.sin(sig * 18) * 2; // the other glove stays up in guard
}
// The burrito, behind his glove (it grips the foil end), shorter after each bite.
function drawTapeBurrito(g, x, y, pr, sig, side) {
  if (typeof drawBurrito !== "function") return;
  var s = tapeBurritoState(x, y, pr, sig, side), gl = g[side < 0 ? 0 : 1];
  var len = pr * 1.25, w = len * 0.42, cut = s.eaten * 0.17 * len;
  var dir = -side, ang = side < 0 ? -0.35 : Math.PI + 0.35; // the open end points at his mouth
  var ux = Math.cos(ang), uy = Math.sin(ang);
  // the glove holds it a third of the way from the foil end
  var cx = gl.x + ux * len * 0.25, cy = gl.y + uy * len * 0.25;
  ctx.save();
  ctx.translate(cx, cy); ctx.rotate(ang);
  ctx.beginPath(); ctx.rect(-len, -len, len * 1.5 - cut, len * 2); ctx.clip();
  drawBurrito(0, 0, len, 0, pr / 45);
  if (cut > 0) { // the bitten end: filling, with a scalloped edge
    var ex = len / 2 - cut;
    ctx.fillStyle = "#e8c98d"; ctx.beginPath(); ctx.ellipse(ex, 0, w * 0.22, w * 0.5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#5a2d14"; ctx.beginPath(); ctx.ellipse(ex, 0, w * 0.16, w * 0.4, 0, 0, Math.PI * 2); ctx.fill();
    [["#fbf7ec", 0], ["#7cc142", 1], ["#e8432a", 2]].forEach(function (f) {
      ctx.fillStyle = f[0];
      for (var q = 0; q < 3; q++) { ctx.beginPath(); ctx.arc(ex - w * 0.04 + (q % 2) * w * 0.08, -w * 0.28 + (q + f[1] * 0.33) * w * 0.2, 2.6 * pr / 60, 0, Math.PI * 2); ctx.fill(); }
    });
  }
  ctx.restore();
  void dir;
}
// Over everything: CHOMP! on each bite, crumbs falling.
function drawTapeBurritoChomp(x, y, pr, sig, side) {
  var b0 = TAPE_BURRITO_BITES, s = tapeBurritoState(x, y, pr, sig, side);
  ctx.save(); ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.lineJoin = "round";
  for (var i = 0; i < b0.length; i++) {
    var d = sig - b0[i];
    if (d < 0 || d > 0.45) continue;
    for (var q = 0; q < 6; q++) { // crumbs
      var cx = s.mouth.x + side * pr * (0.15 + 0.06 * q) + Math.sin(q * 2.1 + i) * 10, cy = s.mouth.y + 10 + 520 * d * d + q * 3;
      ctx.fillStyle = q % 2 ? "#eac17a" : "#7cc142"; ctx.globalAlpha = Math.max(0, 1 - d / 0.45);
      ctx.beginPath(); ctx.arc(cx, cy, 3.5, 0, Math.PI * 2); ctx.fill();
    }
    if (d < 0.32) {
      ctx.globalAlpha = Math.min(1, (0.32 - d) / 0.1);
      var pop = tapePop(Math.min(1, d / 0.12)), tx = x - side * pr * 0.9, ty = y - pr * 0.75 - i * 6;
      ctx.save(); ctx.translate(tx, ty); ctx.rotate(-side * 0.18); ctx.scale(pop, pop);
      ctx.font = "900 40px " + TAPE_IMPACT;
      ctx.lineWidth = 7; ctx.strokeStyle = "#000"; ctx.strokeText("CHOMP!", 0, 0);
      ctx.fillStyle = "#ffb627"; ctx.fillText("CHOMP!", 0, 0);
      ctx.restore();
    }
  }
  ctx.restore();
}

// ---------------------------------------------------------------
// Nate Diaz ("stockton", Joe 2026-11-21): two Stockton slaps across at the
// other fighter with his inside glove (SLAP!, they see stars), then he throws
// his arms out wide ("what?"). No lion (Joe).
// Khabib ("sendloc", Joe 2026-11-21): his Send Me Location call (send-location.js).
// The outside glove brings the sat-phone to his ear, "SEND ME LOCATION" word by
// word (Joe's clip, on the talk channel), then he looks at the screen
// (LOCATION SENT), a red target locks onto the other fighter's portrait and
// the beam comes down on them from orbit (they're left seeing stars).
// Only ever the fighter's own two gloves.
// ---------------------------------------------------------------
var TAPE_NATE_LEN = 1.75, TAPE_NATE_SLAPS = [0.3, 0.66], TAPE_NATE_WIDE = 0.95;
var TAPE_SL_LEN = 3.5, TAPE_SL_UP = 0.35, TAPE_SL_TALK = 1.75, TAPE_SL_TARGET = 2.45, TAPE_SL_BEAM = 2.95;
var TAPE_SL_SENT = TAPE_SL_UP + TAPE_SL_TALK; // he looks at the screen

// Sounds (from tickTapeOwn).
function tickTapeNateKhabib(kind, st, i, snd) {
  if (kind === "stockton") {
    TAPE_NATE_SLAPS.forEach(function (at, j) {
      if (!snd["slap" + i + j] && st >= at && st < at + 0.2) { snd["slap" + i + j] = true; if (typeof playStocktonSlap === "function") playStocktonSlap(j === 1); }
    });
    return;
  }
  // Khabib: his line through the talk channel (tried again until it gets a turn), the beeps, the hit
  if (!snd["slv" + i] && st >= TAPE_SL_UP && st < TAPE_SL_SENT - 0.4) { withClip("sendMeLocation"); if (clipBuffers.sendMeLocation && playTalk("sendMeLocation", 1)) snd["slv" + i] = true; }
  if (!snd["sls" + i] && st >= TAPE_SL_SENT + 0.15 && st < TAPE_SL_TARGET) { snd["sls" + i] = true; if (typeof playSendLocation === "function") playSendLocation("send"); }
  if (!snd["slt" + i] && st >= TAPE_SL_TARGET && st < TAPE_SL_BEAM) { snd["slt" + i] = true; if (typeof playSendLocation === "function") playSendLocation("lock"); }
  if (!snd["slb" + i] && st >= TAPE_SL_BEAM && st < TAPE_SL_LEN) { snd["slb" + i] = true; withClip("slImpact", function () { playClip("slImpact", 0.6); }); }
}

// How much a fighter's portrait is rocked by the other one's taunt (Nate's
// slaps, Khabib's strike), added to his bob in drawTapeFighter.
function tapeHitShake(oppKind, ost) {
  if (ost < 0) return 0;
  var hits = oppKind === "stockton" ? TAPE_NATE_SLAPS.map(function (a) { return a + 0.06; }) : oppKind === "sendloc" ? [TAPE_SL_BEAM] : [];
  var y = 0;
  hits.forEach(function (h) { var d = ost - h; if (d > 0 && d < 0.5) y += Math.sin(d * 45) * 7 * (1 - d / 0.5); });
  return y;
}

// Nate: how far into each slap (0 at rest, 1 at the hit).
function tapeNateSlap(sig) {
  var k = 0;
  TAPE_NATE_SLAPS.forEach(function (at) { var d = sig - at; if (d > -0.16 && d < 0.2) k = Math.max(k, d < 0 ? tapeSmooth((d + 0.16) / 0.16) : 1 - tapeSmooth(d / 0.2)); });
  return k;
}
function tapeNateWide(sig) {
  return tapeSmooth((sig - TAPE_NATE_WIDE) / 0.25) * tapeSmooth((TAPE_NATE_LEN - sig) / 0.3);
}
function tapeStocktonGloves(g, x, pr, sig, side) {
  var out = side < 0 ? 0 : 1, inn = 1 - out, sl = tapeNateSlap(sig), wide = tapeNateWide(sig);
  var cock = sig < TAPE_NATE_SLAPS[1] + 0.2 ? tapeSmooth(sig / 0.15) * (1 - sl) : 0; // the glove drawn back between slaps
  g[inn].x += side * pr * 0.25 * cock - side * pr * 0.95 * sl; g[inn].y -= pr * 0.2 * sl; g[inn].s = 1 + 0.35 * sl;
  [0, 1].forEach(function (j) { var d = j === out ? side : -side; g[j].x += d * pr * 0.38 * wide; g[j].y -= pr * 0.28 * wide; }); // arms out: "what?"
}
// Over everything: SLAP! on each hit.
function drawTapeNateFront(x, y, pr, sig, side) {
  ctx.save(); ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.lineJoin = "round";
  TAPE_NATE_SLAPS.forEach(function (at, j) {
    var d = sig - at;
    if (d < 0 || d > 0.32) return;
    var pop = tapePop(Math.min(1, d / 0.12)), tx = x - side * pr * 1.25, ty = y - pr * (0.55 + 0.22 * j);
    ctx.save(); ctx.globalAlpha *= Math.min(1, (0.32 - d) / 0.1);
    ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 5; ctx.lineCap = "round"; // the crack of it
    for (var q = 0; q < 7; q++) { var an = q / 7 * Math.PI * 2; ctx.beginPath(); ctx.moveTo(tx + Math.cos(an) * 34, ty + 40 + Math.sin(an) * 34); ctx.lineTo(tx + Math.cos(an) * 52, ty + 40 + Math.sin(an) * 52); ctx.stroke(); }
    ctx.translate(tx, ty); ctx.rotate(-side * 0.14); ctx.scale(pop, pop);
    ctx.font = "900 " + (j ? 48 : 40) + "px " + TAPE_IMPACT;
    ctx.lineWidth = 8; ctx.strokeStyle = "#000"; ctx.strokeText("SLAP!", 0, 0);
    ctx.fillStyle = "#ffffff"; ctx.fillText("SLAP!", 0, 0);
    ctx.restore();
  });
  ctx.restore();
}

// Khabib: where his outside glove is (at his ear, then the screen in front,
// then pointing up at the sky).
function tapeSlPose(x, y, pr, sig, side) {
  var guard = { x: x + side * pr * 0.6, y: y + pr * 0.3 };
  var ear = { x: x + side * pr * 0.8, y: y + pr * 0.02 }, look = { x: x + side * pr * 0.32, y: y + pr * 0.42 };
  var sky = { x: x + side * pr * 0.62, y: y - pr * 0.72 };
  var lerp = function (a, b, k) { return { x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k }; };
  if (sig < TAPE_SL_UP) return { p: lerp(guard, ear, tapeSmooth(sig / TAPE_SL_UP)), phone: "ear" };
  if (sig < TAPE_SL_SENT) { var w = Math.sin((sig - TAPE_SL_UP) * 7.5); return { p: { x: ear.x, y: ear.y + w * 1.5 }, phone: "ear", rock: w }; }
  if (sig < TAPE_SL_TARGET) return { p: lerp(ear, look, tapeSmooth((sig - TAPE_SL_SENT) / 0.22)), phone: "look" };
  if (sig < TAPE_SL_LEN - 0.3) return { p: lerp(look, sky, tapeSmooth((sig - TAPE_SL_TARGET) / 0.2)), phone: null };
  return { p: lerp(sky, guard, tapeSmooth((sig - (TAPE_SL_LEN - 0.3)) / 0.3)), phone: null };
}
function tapeSendLocGloves(g, x, y, pr, sig, side) {
  var gl = g[side < 0 ? 0 : 1], s = tapeSlPose(x, y, pr, sig, side);
  gl.x = s.p.x; gl.y = s.p.y;
}
// The sat-phone in his glove (send-location.js draws it): its back pressed to
// his ear while he talks, then the screen as he looks at it.
function drawTapeSendLocPhone(g, pr, sig, side) {
  if (typeof slPhoneBack !== "function") return;
  var s = tapeSlPose(0, 0, pr, sig, side), gl = g[side < 0 ? 0 : 1];
  if (!s.phone) return;
  var sc = pr / 52, ang = s.phone === "ear" ? -0.12 * side + (s.rock || 0) * 0.05 : -0.35 * side;
  var px = gl.x + Math.sin(ang) * 14 * sc, py = gl.y - Math.cos(ang) * 14 * sc;
  if (s.phone === "ear") slPhoneBack(px, py, ang, sc, true, sig);
  else {
    var ls = sig - TAPE_SL_SENT;
    slPhone(px, py, ang, sc, 1, { on: true, flash: ls > 0.12 && ls < 0.3, sweep: null, pin: ls < 0.15, sent: ls >= 0.15, press: ls > 0.1 && ls < 0.25, led: Math.floor(sig * 4) % 2 === 0 }, sig);
  }
}
// His speech bubble, toward the middle of the card, word by word.
function drawTapeSendLocBubble(x, y, pr, sig, side) {
  var tk = sig - TAPE_SL_UP;
  if (tk < 0 || sig > TAPE_SL_TARGET + 0.35) return;
  var sent = sig >= TAPE_SL_SENT + 0.15;
  var text = sent ? "LOCATION SENT ✓" : tk < 0.55 ? "SEND" : tk < 1.0 ? "SEND ME" : "SEND ME LOCATION";
  var a = Math.min(1, tk / 0.1) * Math.min(1, (TAPE_SL_TARGET + 0.35 - sig) / 0.2);
  ctx.save(); ctx.globalAlpha *= a;
  ctx.font = "900 34px " + TAPE_IMPACT;
  var tw = ctx.measureText(text).width, bw = tw + 40, bh = 54;
  var bx = x - side * (pr * 0.2 + bw / 2), by = y - pr * 0.82; // by his head, toward the middle (inside the card)
  ctx.fillStyle = sent ? "#eaffdf" : "#ffffff"; ctx.strokeStyle = "#0b0f12"; ctx.lineWidth = 6; ctx.lineJoin = "round";
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(bx - bw / 2, by - bh / 2, bw, bh, 22); else ctx.rect(bx - bw / 2, by - bh / 2, bw, bh);
  var tx = x - side * pr * 0.05;
  ctx.moveTo(tx - side * 26, by + bh / 2 - 3); ctx.lineTo(tx + side * 6, by + bh / 2 + 30); ctx.lineTo(tx + side * 4, by + bh / 2 - 3);
  ctx.fill(); ctx.stroke();
  ctx.fillRect(Math.min(tx - side * 24, tx + side * 2) + 2, by + bh / 2 - 9, 22, 12); // (no line where the tail meets it)
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillStyle = sent ? "#1f7a1a" : "#0b0f12"; ctx.fillText(text, bx, by + 2);
  ctx.restore();
}
// On the other fighter's portrait: the red target locking on, the beam
// coming down from orbit, the flash, and stars after.
function drawTapeOrbitalHit(x, y, pr, ost) {
  if (ost < TAPE_SL_TARGET) return;
  ctx.save(); ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.lineJoin = "round";
  var tt = ost - TAPE_SL_TARGET;
  if (ost < TAPE_SL_BEAM) { // the target: rings closing in, crosshair, pulsing
    var k = tapeSmooth(tt / (TAPE_SL_BEAM - TAPE_SL_TARGET)), pulse = 0.5 + 0.5 * Math.sin(tt * 28);
    ctx.strokeStyle = "rgba(255,40,40," + (0.65 + 0.35 * pulse) + ")"; ctx.lineWidth = 6;
    var R = pr * (1.6 - 0.45 * k);
    ctx.beginPath(); ctx.arc(x, y, R, 0, Math.PI * 2); ctx.stroke();
    ctx.setLineDash([14, 10]); ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(x, y, R * 0.72, tt * 3, tt * 3 + Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
    [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function (q) { ctx.beginPath(); ctx.moveTo(x + q[0] * R * 0.85, y + q[1] * R * 0.85); ctx.lineTo(x + q[0] * R * 1.15, y + q[1] * R * 1.15); ctx.stroke(); });
    if (tt > 0.12) { ctx.font = "900 30px " + TAPE_IMPACT; ctx.lineWidth = 6; ctx.strokeStyle = "#000"; ctx.strokeText("TARGET LOCKED", x, y + pr * 0.62); ctx.fillStyle = "#ff3b2f"; ctx.fillText("TARGET LOCKED", x, y + pr * 0.62); }
  }
  var bt = ost - TAPE_SL_BEAM;
  if (bt >= 0 && bt < 0.45) { // the beam, from the top of the card down onto him
    var bw = pr * 0.8 * (1 - bt / 0.45) + pr * 0.15, top = y - pr * 4;
    var gr = ctx.createLinearGradient(x - bw, 0, x + bw, 0);
    gr.addColorStop(0, "rgba(120,200,255,0)"); gr.addColorStop(0.3, "rgba(120,200,255,0.8)"); gr.addColorStop(0.5, "rgba(255,255,255,1)");
    gr.addColorStop(0.7, "rgba(120,200,255,0.8)"); gr.addColorStop(1, "rgba(120,200,255,0)");
    ctx.fillStyle = gr; ctx.fillRect(x - bw, top, bw * 2, y - top);
    ctx.fillStyle = "rgba(255,255,255," + (0.85 * (1 - bt / 0.45)) + ")"; // the flash on him
    ctx.beginPath(); ctx.arc(x, y, pr * (1.05 + bt * 1.2), 0, Math.PI * 2); ctx.fill();
  }
  if (bt > 0.05 && bt < 1.05) { // the call
    var p = tapePop(Math.min(1, (bt - 0.05) / 0.15));
    ctx.save(); ctx.globalAlpha *= Math.min(1, (1.05 - bt) / 0.2);
    ctx.translate(x, y + pr * 0.6); ctx.scale(p, p);
    ctx.font = "900 40px " + TAPE_IMPACT; ctx.lineWidth = 8; ctx.strokeStyle = "#000"; ctx.strokeText("ORBITAL STRIKE!", 0, 0);
    ctx.fillStyle = "#ffffff"; ctx.fillText("ORBITAL STRIKE!", 0, 0);
    ctx.restore();
  }
  ctx.restore();
  if (bt > 0.2) drawTapeStars(x, y - pr * 0.82, pr, bt); // (tale-tape.js)
}
// The other fighter's portrait answering Nate's slaps (stars) or Khabib's strike.
function drawTapeTauntReact(x, y, pr, oppKind, ost) {
  if (ost < 0) return;
  if (oppKind === "stockton" && ost > TAPE_NATE_SLAPS[0] + 0.08) drawTapeStars(x, y - pr * 0.82, pr, ost); // (tale-tape.js)
  if (oppKind === "sendloc") drawTapeOrbitalHit(x, y, pr, ost);
}
