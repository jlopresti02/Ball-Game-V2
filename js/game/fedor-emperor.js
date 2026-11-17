// Fedor Emelianenko crowns himself the Emperor (Christian, 2026-11-17), off
// his nickname, "The Last Emperor". An extra ability, not his special: The
// Unmoving Man (Joe, fedor-unmoving.js) is still his special, on its own bar,
// exactly as it was. Everything here is tuned from `fedor.emperor` in
// characters/fedor-emelianenko.json; leave the block out and it's off.
//
// When      (trigger) once a fight: the first time he drops under `hpBelow`%
//           health, or `at` seconds into the fight, whichever comes first. If
//           he's busy (a throw, his ground and pound, a hold, his special, or
//           they're in the middle of a move) it waits till he's free.
// The cut   (cut) `len` seconds: he steps back `stepBack` px, a gold hand
//           mirror appears in one glove (`mirrorAt`), he lifts it and looks
//           into it (`lookAt`), the other glove brings a little gold crown up
//           (`crownAt`) and sets it on his head (`setAt`): "THE EMPEROR".
//           Solid through it, like every special (Joe's rule, special-solid.js):
//           what they start on him is BLOCKED! or DODGED!, nothing already on
//           its way lands (fedorCrownGuard, hurt() in match.js), nobody takes
//           him down (attemptGrab, grapple-duel.js) and no special starts on
//           him (specialBusy, special.js).
// The reign (buff) for `len` seconds after the cut:
//           crit   `crit.chance`% of his strikes (`crit.sources`, and his
//                  ground and pound punches with `crit.gnp`) are "CRIT!" for
//                  `crit.mult`x. The Unmoving Man and the throw keep their
//                  numbers.
//           shook  they deal `shook.take` of their damage to him ("SHOOK" as
//                  it starts, sweat flying off them with `sweat`, a nervous
//                  tremble with `wobble`). Scripted finishes keep their numbers.
//           The crown stays on all reign, then fades over `crownFade` seconds.
// Voice     (voice) `clip`: a clip id from voice-clips.js, said as the crown
//           goes on; or `line`: a line's exact text, heard once a clip is keyed
//           to it (SPEECH_CLIPS). Both empty, or no clip cut yet: silent.
//           It goes through say() (speech.js), so it's on the talk channel.
//
// Runs on b.fd.act (phase "emperor"), so his throw, his punches and his
// special wait while he crowns himself (updateFedor, fedor.js), and on b.fdEmp.
"use strict";

var EM_GOLD = "#f2c230", EM_GOLD_DARK = "#b98a12", EM_GLASS = "#cfe7f5", EM_SWEAT = "#a8dcff";
var EM_SOLID = { phases: "all" }; // special-solid.js: what they start on him is BLOCKED! or DODGED!
var EM_CRIT_SOURCES = ["punch", "jab", "combo", "elbow", "knee", "kick"];

function emCfg(b) { var c = fdCfg(b); return c && c.emperor; }
function emVal(o, k, d) { return o && o[k] != null ? o[k] : d; }

// From initFedor (every fighter).
function initFedorEmperor(b) {
  b.fdEmp = null;
  if (!emCfg(b)) return;
  b.fdEmp = { due: false, done: false, reign: 0, fadeT: 0, crown: 0, flash: 0, sweatT: 0, sparkT: 0, sayLeft: 0, clock: 0 };
}

// Crowning himself right now (the cut).
function fedorCrowning(b) { return !!(b && b.alive && b.fd && b.fd.act && b.fd.act.phase === "emperor"); }
// Reigning: the crits and them shook.
function emReign(b) { return b && b.alive && b.fdEmp && b.fdEmp.reign > 0 ? b.fdEmp : null; }
// The one facing a reigning Emperor.
function emShookBy(o) { var e = o && balls && balls[1 - o.id]; return e && e !== o ? emReign(e) : null; }

// Free to crown himself: nothing holding him, nothing of his own or theirs going on.
function emFree(self, other) {
  if (fdHeld(self) || self.choked || self.fd.gnp || self.armbar || !inOrdinaryMovement(self)) return false;
  if (self.punch || self.kick || self.koPunch || self.cmb || specialBusy(self) || specialBusy(other) || swordDuelActive()) return false;
  return true;
}

// ---------------------------------------------------------------- running it

// From updateFedor (abilities.js): starts the cut once it's due and he's
// free; true while it runs, so nothing else of his starts.
function updateFedorEmperor(self, other, dt) {
  var e = self.fdEmp, m = self.fd, ec = emCfg(self);
  if (!e || !m || !ec) return false;
  if (m.act) return m.act.phase === "emperor";
  if (e.done || !started || over || !self.alive || !other.alive) return false;
  if (!e.due) {
    var tr = ec.trigger || {}, hpPct = self.hp / (self.maxHp || MAX_HP) * 100;
    e.due = hpPct < emVal(tr, "hpBelow", 50) || m.t >= emVal(tr, "at", 30);
  }
  if (!e.due || !emFree(self, other)) return false;
  e.done = true;
  var ang = Math.atan2(other.y - self.y, other.x - self.x);
  m.act = { phase: "emperor", t: 0, ang: ang, fx: Math.cos(ang) >= 0 ? 1 : -1, mirror: false, crown: false, set: false };
  self.punch = null; self.jabAnim = null;
  self.vx = 0; self.vy = 0;
  playWhoosh();
  return true;
}

// From tickFedor (update.js), every frame: the cut's clock, the reign, the
// crown, sweat off them and the voice line.
function tickFedorEmperor(b, other, dt) {
  var e = b.fdEmp, ec = emCfg(b);
  if (!e || !ec) return;
  e.clock += dt;
  if (e.flash > 0) e.flash = Math.max(0, e.flash - dt);
  if (b.fd && b.fd.act && b.fd.act.phase === "emperor") emTickCut(b, other, b.fd, e, ec, dt);
  var bf = ec.buff || {};
  if (e.reign > 0) {
    if (!b.alive || over) { e.reign = 0; e.fadeT = 0; }
    else {
      e.reign = Math.max(0, e.reign - dt);
      if (e.reign === 0) e.fadeT = emVal(bf, "crownFade", 0.6);
    }
  } else if (e.fadeT > 0) e.fadeT = Math.max(0, e.fadeT - dt);
  // The crown: on from the moment it's set, all reign, then fading off.
  var cutOn = fedorCrowning(b) && b.fd.act.set;
  e.crown = !b.alive ? 0 : (cutOn || e.reign > 0 ? 1 : e.fadeT / emVal(bf, "crownFade", 0.6));
  if (e.sayLeft > 0) {
    e.sayLeft -= dt;
    if (!emVoiceReady(ec) || emSpeak(b, ec)) e.sayLeft = 0;
  }
  if (reduceMotion || !e.reign) return;
  // A glint off the crown now and then.
  e.sparkT -= dt;
  if (e.sparkT <= 0) {
    e.sparkT = 0.3 + Math.random() * 0.25;
    var sx = b.x + (Math.random() * 2 - 1) * b.r * 0.28, sy = b.y - b.r * (1.02 + Math.random() * 0.18);
    particles.push({ x: sx, y: sy, vx: (Math.random() - 0.5) * 30, vy: -30 - Math.random() * 30, life: 0.5, max: 0.5, size: 1.6 + Math.random() * 1.4, color: Math.random() < 0.5 ? EM_GOLD : "#fff6d0" });
  }
  // Sweat flying off them.
  var sh = ec.shook || {};
  if (sh.sweat && other.alive) {
    e.sweatT -= dt;
    if (e.sweatT <= 0) {
      e.sweatT = 0.14 + Math.random() * 0.1;
      var s = Math.random() < 0.5 ? -1 : 1;
      particles.push({ x: other.x + s * other.r * (0.3 + Math.random() * 0.4), y: other.y - other.r * (0.6 + Math.random() * 0.3), vx: s * (40 + Math.random() * 70), vy: -60 - Math.random() * 60,
        life: 0.45, max: 0.45, size: 2 + Math.random() * 1.6, color: EM_SWEAT });
    }
  }
}

function emTickCut(self, other, m, e, ec, dt) {
  var a = m.act, c = ec.cut || {}, len = emVal(c, "len", 2.5);
  if (!self.alive || over) { m.act = null; return; }
  // Something got hold of him anyway: the crown goes straight on and he reigns.
  if (fdHeld(self) || self.bearHeld || self.torHeld) { m.act = null; if (!a.set) emSetCrown(self, other, e, ec); emReignStart(self, other, e, ec); return; }
  a.t += dt;
  self.vx = 0; self.vy = 0;
  // He steps back, away from them, easing to a stop.
  var stepT = emVal(c, "mirrorAt", 0.35);
  if (a.t < stepT) {
    var back = emVal(c, "stepBack", 46) * 2 * (1 - a.t / stepT) / stepT * dt;
    self.x = Math.max(self.r, Math.min(W - self.r, self.x - Math.cos(a.ang) * back));
    self.y = Math.max(self.r, Math.min(H - self.r, self.y - Math.sin(a.ang) * back));
  }
  if (!a.mirror && a.t >= stepT) { a.mirror = true; playEmMirror(); }
  if (!a.crown && a.t >= emVal(c, "crownAt", 1.35)) { a.crown = true; playEmGlint(); }
  if (!a.set && a.t >= emVal(c, "setAt", 1.95)) emSetCrown(self, other, e, ec);
  if (a.t >= len) { m.act = null; emReignStart(self, other, e, ec); }
}

// The crown goes on.
function emSetCrown(self, other, e, ec) {
  if (self.fd.act && self.fd.act.phase === "emperor") self.fd.act.set = true;
  e.flash = 0.5;
  floater(self.x, self.y - self.r - 84, "THE EMPEROR", "crit");
  igbbSparks(self.x, self.y - self.r * 0.9, 0, -1, EM_GOLD, 22, 380);
  crowdReact(0.8);
  if (!reduceMotion) shake = Math.max(shake, 6);
  playEmCrown();
  e.sayLeft = 2; // his line, if there's a clip: tried for a couple of seconds if someone's talking
}

function emReignStart(self, other, e, ec) {
  e.reign = emVal(ec.buff, "len", 10);
  e.fadeT = 0;
  if (other.alive) floater(other.x, other.y - other.r - 30, "SHOOK", "note");
}

// ---------------------------------------------------------------- hurt (match.js)

// From hurt(): while he's crowning himself nothing lands on him.
function fedorCrownGuard(b, source, attackerId) {
  if (!fedorCrowning(b)) return false;
  if (source !== "laser" && b.immuneCd <= 0) {
    floater(b.x, b.y - b.r - 30, "BLOCKED!", "dodge");
    b.immuneCd = 0.3;
  }
  b.justDodged = true;
  return true;
}

// From fedorDamageMult (hurt()): his crits while he reigns, and them, shook,
// hitting him.
function fedorEmperorMult(b, source, attackerId) {
  if (attackerId == null || attackerId === b.id || !balls || !balls[attackerId]) return 1;
  var a = balls[attackerId], mult = 1;
  if (emReign(a) && emCritSource(a, b, source)) {
    var cr = emCfg(a).crit;
    if (Math.random() * 100 < emVal(cr, "chance", 35)) {
      mult *= emVal(cr, "mult", 1.8);
      var dx = b.x - a.x, dy = b.y - a.y, d = Math.sqrt(dx * dx + dy * dy) || 1, ux = dx / d, uy = dy / d;
      floater(b.x, b.y - b.r - 34, "CRIT!", "crit");
      impacts.push({ x: b.x - ux * b.r, y: b.y - uy * b.r, nx: -ux, ny: -uy, life: 0.3, max: 0.3, color: EM_GOLD });
      hitStop = Math.max(hitStop, 0.05);
      if (!reduceMotion) shake = Math.max(shake, 9);
    }
  }
  if (emReign(b) && !FD_DURABLE_SKIP[source]) mult *= emVal(emCfg(b).shook, "take", 1);
  return mult;
}

// One of his strikes: his punches and combos, and his ground and pound
// punches (the guillotine's ground and pound he runs on, bjj.js).
function emCritSource(a, b, source) {
  var cr = emCfg(a).crit;
  if (!cr) return false;
  if (cr.gnp && source === "finisher" && b.guillo && b.guillo.fedor && b.guillo.atkId === a.id) return true;
  return (cr.sources || EM_CRIT_SOURCES).indexOf(source) >= 0;
}

// ---------------------------------------------------------------- the voice

function emVoiceReady(ec) {
  var v = ec.voice;
  if (!v) return false;
  if (v.clip && typeof SOUND_CLIPS !== "undefined" && SOUND_CLIPS[v.clip]) return true;
  return !!(v.line && typeof SPEECH_CLIPS !== "undefined" && SPEECH_CLIPS[v.line]);
}
// True once it's said (false: nothing to say yet, or he's mid sentence).
function emSpeak(b, ec) {
  if (!emVoiceReady(ec) || !canSay(b)) return false;
  var v = ec.voice, clip = v.clip && SOUND_CLIPS[v.clip] ? v.clip : null;
  say(b, v.line || "The Emperor", clip ? { clip: clip } : null);
  return true;
}

// ---------------------------------------------------------------- drawing

// From applyFedorPose (draw.js), with the canvas set up for b: he leans back
// stepping away and tilts toward the mirror; whoever's shook trembles.
function applyEmperorPose(b) {
  if (fedorCrowning(b)) {
    var a = b.fd.act, c = emCfg(b).cut || {}, stepT = emVal(c, "mirrorAt", 0.35), lookAt = emVal(c, "lookAt", 0.6), setAt = emVal(c, "setAt", 1.95);
    var tilt = a.t < stepT ? -a.fx * 0.07 * Math.sin(Math.PI * a.t / stepT) :
      a.fx * 0.07 * Math.min(1, Math.max(0, (a.t - lookAt) / 0.25)) * Math.max(0, Math.min(1, 1 - (a.t - setAt) / 0.3));
    if (tilt) { ctx.translate(b.x, b.y + b.r); ctx.rotate(tilt); ctx.translate(-b.x, -(b.y + b.r)); }
    return;
  }
  var e = emShookBy(b), sh = e && emCfg(balls[1 - b.id]).shook;
  if (!sh || !sh.wobble || !inOrdinaryMovement(b)) return;
  var wob = Math.sin(e.clock * 26) * 0.035 + Math.sin(e.clock * 41) * 0.015;
  ctx.translate(b.x, b.y + b.r); ctx.rotate(wob); ctx.translate(-b.x, -(b.y + b.r));
}

// From drawFedor (after his ball): his hands with the mirror and the crown
// through the cut, the crown on his head through the reign, and the gold flash.
function drawEmperor(b, other) {
  var e = b.fdEmp;
  if (!e || !b.alive) return;
  var r = b.r;
  if (e.flash > 0) {
    var k = 1 - e.flash / 0.5;
    ctx.save();
    ctx.globalAlpha = e.flash / 0.5 * 0.8;
    ctx.strokeStyle = EM_GOLD; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.arc(b.x, b.y, r + 6 + k * 34, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
  }
  if (fedorCrowning(b)) { emDrawCut(b, b.fd.act); return; }
  if (e.crown > 0) drawEmCrown(b.x, b.y - r * 0.84, r * 0.28, e.crown);
}

function emDrawCut(b, a) {
  var c = emCfg(b).cut || {}, r = b.r, fx = a.fx, t = a.t;
  var mirrorAt = emVal(c, "mirrorAt", 0.35), lookAt = emVal(c, "lookAt", 0.6), crownAt = emVal(c, "crownAt", 1.35), setAt = emVal(c, "setAt", 1.95), len = emVal(c, "len", 2.5);
  var limb = r * 0.2, glove = r * 0.27;
  // The mirror hand (their side): guard, then up by his face, then back down.
  var up = easeOut((t - lookAt) / 0.3) * (1 - easeOut((t - setAt) / 0.35));
  var mh = { x: b.x + fx * r * (0.85 + 0.15 * up), y: b.y + r * (-0.05 - 0.5 * up) };
  var sh1 = { x: b.x + fx * r * 0.62, y: b.y - r * 0.1 };
  strokeLimb(limb, armColor(b.char, fx), function () { ctx.moveTo(sh1.x, sh1.y); ctx.lineTo(mh.x, mh.y); });
  drawGloveAt(mh.x, mh.y, glove, b.char, -Math.PI / 2);
  if (t >= mirrorAt) {
    var pop = easeOut((t - mirrorAt) / 0.15), fade = 1 - Math.max(0, Math.min(1, (t - setAt) / Math.max(0.05, len - setAt)));
    emDrawMirror(mh.x - fx * r * 0.04, mh.y - r * 0.42 * pop, r * 0.21 * pop, fade, t >= lookAt ? (t - lookAt) / Math.max(0.1, crownAt - lookAt) : -1);
  }
  // The crown hand (the far side): down by his hip, then the crown comes up
  // over his head in an arc and down onto it, then the hand drops back.
  var sh2 = { x: b.x - fx * r * 0.62, y: b.y - r * 0.1 }, rest = { x: b.x - fx * r * 0.9, y: b.y + r * 0.2 }, ch;
  if (t < crownAt) ch = rest;
  else if (t < setAt) {
    var k = easeOut((t - crownAt) / (setAt - crownAt)), u = 1 - k;
    var p0 = { x: b.x - fx * r * 0.95, y: b.y + r * 0.05 }, p1 = { x: b.x - fx * r * 0.7, y: b.y - r * 1.7 }, p2 = { x: b.x, y: b.y - r * 0.84 };
    var cx = u * u * p0.x + 2 * u * k * p1.x + k * k * p2.x, cy = u * u * p0.y + 2 * u * k * p1.y + k * k * p2.y;
    drawEmCrown(cx, cy, r * 0.28, Math.min(1, (t - crownAt) / 0.12));
    ch = { x: cx - fx * r * 0.3, y: cy - r * 0.18 };
  } else {
    var back = easeOut((t - setAt) / 0.35), top = { x: b.x - fx * r * 0.3, y: b.y - r * 1.02 };
    ch = { x: top.x + (rest.x - top.x) * back, y: top.y + (rest.y - top.y) * back };
  }
  strokeLimb(limb, armColor(b.char, -fx), function () { ctx.moveTo(sh2.x, sh2.y); ctx.lineTo(ch.x, ch.y); });
  drawGloveAt(ch.x, ch.y, glove, b.char, t >= crownAt && t < setAt ? fx * 0.4 - Math.PI / 2 : Math.PI / 2);
  if (t >= setAt) drawEmCrown(b.x, b.y - r * 0.84, r * 0.28, 1);
}

// A gold hand mirror on a short handle, `s` the glass's half-width. `look`
// (0-1) sweeps a glint across the glass while he looks into it.
function emDrawMirror(x, y, s, alpha, look) {
  if (s <= 0.5 || alpha <= 0) return;
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.lineCap = "round";
  // The handle down into his glove.
  ctx.strokeStyle = theme.wall; ctx.lineWidth = s * 0.5 + 3;
  ctx.beginPath(); ctx.moveTo(x, y + s * 1.2); ctx.lineTo(x, y + s * 2.1); ctx.stroke();
  ctx.strokeStyle = EM_GOLD_DARK; ctx.lineWidth = s * 0.5;
  ctx.beginPath(); ctx.moveTo(x, y + s * 1.2); ctx.lineTo(x, y + s * 2.1); ctx.stroke();
  // The frame and the glass.
  ctx.fillStyle = EM_GOLD; ctx.strokeStyle = theme.wall; ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.ellipse(x, y, s * 1.0, s * 1.3, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = EM_GLASS;
  ctx.beginPath(); ctx.ellipse(x, y, s * 0.74, s * 1.02, 0, 0, Math.PI * 2); ctx.fill();
  if (look >= 0 && look <= 1.2) {
    ctx.save();
    ctx.beginPath(); ctx.ellipse(x, y, s * 0.74, s * 1.02, 0, 0, Math.PI * 2); ctx.clip();
    var gx = x - s * 1.2 + s * 2.4 * Math.min(1, look);
    ctx.strokeStyle = "#ffffff"; ctx.globalAlpha *= 0.85; ctx.lineWidth = s * 0.28;
    ctx.beginPath(); ctx.moveTo(gx - s * 0.5, y + s * 1.1); ctx.lineTo(gx + s * 0.5, y - s * 1.1); ctx.stroke();
    ctx.restore();
  }
  // A little gold bead on top of the frame.
  ctx.fillStyle = EM_GOLD; ctx.strokeStyle = theme.wall; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.arc(x, y - s * 1.34, s * 0.18, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.restore();
}

// A little gold crown sitting on his head: `y` is the bottom of its band,
// `s` its half-width. Five points tipped with pearls, a red stone in the
// middle of the band and a blue one each side.
function drawEmCrown(x, y, s, alpha) {
  if (alpha <= 0 || s <= 0) return;
  ctx.save();
  ctx.globalAlpha *= Math.min(1, alpha);
  ctx.translate(x, y);
  ctx.lineJoin = "round";
  ctx.strokeStyle = theme.wall; ctx.lineWidth = Math.max(1.5, s * 0.14);
  ctx.fillStyle = EM_GOLD;
  ctx.beginPath();
  ctx.moveTo(-s, 0); ctx.lineTo(-s, -s * 1.0);
  ctx.lineTo(-s * 0.75, -s * 0.55); ctx.lineTo(-s * 0.5, -s * 1.0);
  ctx.lineTo(-s * 0.25, -s * 0.55); ctx.lineTo(0, -s * 1.25);
  ctx.lineTo(s * 0.25, -s * 0.55); ctx.lineTo(s * 0.5, -s * 1.0);
  ctx.lineTo(s * 0.75, -s * 0.55); ctx.lineTo(s, -s * 1.0);
  ctx.lineTo(s, 0); ctx.closePath();
  ctx.fill(); ctx.stroke();
  // The band.
  ctx.fillStyle = EM_GOLD_DARK;
  ctx.beginPath(); ctx.rect(-s, -s * 0.38, s * 2, s * 0.38); ctx.fill(); ctx.stroke();
  // The stones.
  [[0, "#d0263a", 0.14], [-0.58, "#2f5fd0", 0.1], [0.58, "#2f5fd0", 0.1]].forEach(function (g) {
    ctx.fillStyle = g[1]; ctx.beginPath(); ctx.arc(g[0] * s, -s * 0.19, g[2] * s, 0, Math.PI * 2); ctx.fill();
  });
  // Pearls on the points.
  ctx.fillStyle = "#fff4d6"; ctx.lineWidth = Math.max(1, s * 0.08);
  [[-1, -1.0], [-0.5, -1.0], [0, -1.25], [0.5, -1.0], [1, -1.0]].forEach(function (p) {
    ctx.beginPath(); ctx.arc(p[0] * s, p[1] * s, s * 0.11, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  });
  // The light catching it.
  ctx.strokeStyle = "rgba(255,255,255,0.7)"; ctx.lineWidth = Math.max(1, s * 0.08); ctx.lineCap = "round";
  ctx.beginPath(); ctx.moveTo(-s * 0.82, -s * 0.48); ctx.lineTo(-s * 0.82, -s * 0.8); ctx.stroke();
  ctx.restore();
}

// ---------------------------------------------------------------- the fighter card

// From fedorGalleryMoves (fedor.js).
function emperorGalleryMove(f, add) {
  var ec = f.emperor;
  if (!ec) return;
  var tr = ec.trigger || {}, bf = ec.buff || {}, cr = ec.crit || {}, sh = ec.shook || {};
  add("👑", "The Emperor", "Once a fight, the first time he drops under " + emVal(tr, "hpBelow", 50) + "% health or " + emVal(tr, "at", 30) +
    "s in, he steps back, looks into a hand mirror and sets a little gold crown on his head (nothing gets through to him while he does). For " +
    emVal(bf, "len", 10) + "s after, " + emVal(cr, "chance", 35) + "% of his strikes are critical hits for " + emVal(cr, "mult", 1.8) +
    "x, and they're shook: they do " + Math.round(emVal(sh, "take", 1) * 100) + "% of their damage to him. Separate from The Unmoving Man.");
}

// ---------------------------------------------------------------- sound
// Synth stand-ins, not recordings (his voice line is the `voice` hook above).

// The mirror catching the light: a small glassy ting.
function playEmMirror() {
  fdAudio(function (ac, t) {
    caneTone(ac, t, "sine", 2637, 2637, 0.05, 0.45);
    caneTone(ac, t + 0.05, "sine", 3951, 3951, 0.03, 0.5);
  });
}
// The crown coming out: a soft shimmer.
function playEmGlint() {
  fdAudio(function (ac, t) { caneBurst(ac, t, 7000, 0.8, 0.05, 0.3); caneTone(ac, t, "sine", 1760, 2349, 0.03, 0.35); });
}
// The crown going on: rising bells over his low church bell.
function playEmCrown() {
  fdAudio(function (ac, t) {
    [587.33, 739.99, 880, 1174.66].forEach(function (f, i) {
      caneTone(ac, t + i * 0.07, "triangle", f, f, 0.08, 1.1);
      caneTone(ac, t + i * 0.07, "sine", f * 2, f * 2, 0.025, 0.6);
    });
    caneBurst(ac, t, 6500, 0.7, 0.06, 0.3);
  });
  playFdBell();
}
