// Head kick (Christian, 2026-11-15): Alex Pereira's knockout head kick, set
// up by his calf kicks. "It should be set up after landing repeated calf
// kicks. Every once in a while he throws it, and he should miss it a decent
// amount of the time, because it's basically a one-hit KO or half their
// health."
//
// A fighter opts in with a "headKick" block in its character file (every key
// can be left out; the defaults are in HEAD_KICK_DEFAULTS). It needs a leg
// kick ("legKick", leg-kick.js) to set it up:
//
//  - Setup: once he's landed `setup` calf kicks (counted since his last head
//    kick, or since the bell), every calf kick that lands is a chance:
//    `chance`% of the time he goes high next. Not within `cooldown` seconds
//    of his last head kick.
//  - Then, within `window` seconds (while they're still limping), as soon as
//    they're inside `range` (edge to edge) and he's free: he plants and loads
//    up (`chamber` seconds: the tell, a red dashed arc up to their head),
//    whips the leg up and round high (`sweep`, a big red swoosh) into their
//    head. If the window runs out first, the chance is gone; the next calf
//    kick is a new one.
//  - It lands `landChance`% of the time. Otherwise they duck under it
//    ("DUCKED!": they drop, the leg sails over their head and carries him
//    round) or get a glove up ("BLOCKED!"); `blockShare`% of the misses are
//    blocks. If they're further than `reach` away when the foot gets there:
//    "WHIFF". A miss leaves him off balance and open for `missRecover`
//    seconds. That one roll is the only defence: no weave, block or kick
//    check on top (it hurts as a "finisher").
//  - The punish (Christian, 2026-11-15: "half the time it misses and he's
//    open to a takedown shot"): after any miss he's "OFF BALANCE!" for
//    `missOpen` seconds. His guard drops by `missGuard`% (blocking strikes
//    and grabs), their punch and kick are ready at once, and from up to
//    `missReach` away (edge to edge) they come straight at him. One with a
//    takedown (a Grappler) shoots on him `missShot`% of the time: the shot
//    goes through attemptGrab (grapple-duel.js), the same shot and the same
//    defences as any other. Everyone else gets a free shot at him:
//    "PUNISHED!" on the first thing that lands. `missOpen` 0 (the
//    default): a miss is as it always was.
//  - When it lands: "HEAD KICK!", a big star on their head, a freeze-frame.
//    `koChance`% of the time they're out cold (the knockout, then the fight's
//    called); otherwise it takes `damagePct`% of their full health.
//
// The API: headKickSetup(self, v) from legKickLimp (leg-kick.js), every calf
// kick that lands; updateHeadKick from the abilities loop; headKickBusy from
// physics.js (planted while it's out); tickHeadKicks from update();
// drawHeadKicksOver from draw.js (over both fighters); headKickGalleryMoves.
// A fighter with no "headKick" block is untouched (no extra random rolls).
// The kick runs on b.hkk: { t, out, hit, res, side, vicId, frame }; the
// knockout on b.hkKo.
"use strict";

var HEAD_KICK_DEFAULTS = { setup: 2, chance: 40, window: 2.5, cooldown: 12, range: 60, reach: 95,
  landChance: 50, blockShare: 40, koChance: 60, damagePct: 50,
  chamber: 0.26, sweep: 0.13, recover: 0.3, missRecover: 0.6,
  missOpen: 0, missGuard: 100, missShot: 85, missReach: 110,
  text: "HEAD KICK!", color: "#ff3b30", size: 1.35 };
var HK_KO_HOLD = 1.5;  // standing over them, out cold, before it's called
var HK_STAR = 0.42;    // how long the star stays on their head
var HK_RUSH = 560;     // how fast they come at him when he's off balance
var hkFrame = 0, hkClock = 0;

function headKickCfg(b) {
  var c = b && b.char && b.char.headKick;
  if (!c) return null;
  if (b.hkc && b.hkc.src === c) return b.hkc.cfg;
  var out = {}, k;
  for (k in HEAD_KICK_DEFAULTS) out[k] = HEAD_KICK_DEFAULTS[k];
  for (k in c) out[k] = c[k];
  b.hkc = { src: c, cfg: out };
  return out;
}
function headKickBusy(b) { return !!(b && (b.hkk || b.hkKo)); }

// From legKickLimp (leg-kick.js): a calf kick of his landed on v.
function headKickSetup(self, v) {
  var c = headKickCfg(self);
  if (!c || !v || v === self || self.hkk || self.hkKo) return;
  self.hkSet = (self.hkSet || 0) + 1;
  if (self.hkArm > 0 || self.hkSet < c.setup || self.hkCd > 0) return;
  if (Math.random() * 100 < c.chance) self.hkArm = c.window; // going high next
}

// From the abilities loop. True while the kick's out, he's off balance
// after a miss, or standing over them out cold (he throws nothing else).
function updateHeadKick(self, other, dt) {
  var c = headKickCfg(self);
  if (!c) return false;
  var k = self.hkk;
  if (!k && !self.hkKo) {
    if (!(self.hkArm > 0) || !started || over) return false;
    if (lkGap(self, other) > c.range || !lkCanStart(self, other)) return false;
    k = self.hkk = { t: 0, out: null, hit: false, res: null, side: Math.random() < 0.5 ? -1 : 1, vicId: other.id, frame: hkFrame };
    self.hkArm = 0; self.hkSet = 0; self.hkCd = c.cooldown;
    playWhoosh();
  }
  if (k) {
    if (!self.hkKo && (over || !self.alive || self.koOut || self.grappled || self.slam || self.shocked || self.dazed || self.dizzy || self.checkStun > 0)) {
      endHeadKick(self);
      return false;
    }
    k.frame = hkFrame;
    k.t += dt;
    if (!k.hit) {
      var damp = Math.exp(-14 * dt); self.vx *= damp; self.vy *= damp; // planted on the standing leg
      if (!k.out && k.t >= c.chamber) hkSwing(self, other, c, k);
      if (k.t >= c.chamber + c.sweep) { k.hit = true; hkResolve(self, other, c, k); }
    } else if (!self.hkKo) {
      var d2 = Math.exp(-(hkLanded(k) ? 10 : 3) * dt); self.vx *= d2; self.vy *= d2; // a miss carries him round
    }
    if (k.hit && k.t >= c.chamber + c.sweep + (hkLanded(k) ? c.recover : c.missRecover)) {
      self.hkk = null;
      if (!self.hkKo) { endHeadKick(self); return false; }
    }
  }
  if (self.hkKo) { var d3 = Math.exp(-6 * dt); self.vx *= d3; self.vy *= d3; return true; }
  return true;
}
function hkLanded(k) { return k.res === "hit" || k.res === "ko"; }
function endHeadKick(b) {
  b.hkk = null;
  if (b.alive && !b.koOut && inOrdinaryMovement(b)) setSpeed(b, (b.baseSpeed || SPEED) * slowMult(b)); // rolling again
}

// The leg comes up: whether it lands, or they duck it or block it, is
// decided now (so they can be seen dropping under it).
function hkSwing(self, other, c, k) {
  k.out = Math.random() * 100 < c.landChance ? "land" : (Math.random() * 100 < c.blockShare ? "block" : "duck");
  if (k.out === "duck" && other.alive && !other.koOut) other.squash = { t: 0.42, max: 0.42, nx: 0, ny: -1 }; // dropping under it
  playWhoosh();
}

// The foot gets there. Returns what happened: "ko", "hit", "duck", "block",
// "whiff", "slipped" (some fighter's own dodge took it) or "gone".
function hkResolve(self, other, c, k) {
  var res;
  if (!other.alive || other.koOut || other.igbb || specialBusy(other)) res = "gone";
  else if (lkGap(self, other) > c.reach) res = "whiff";
  else res = k.out;
  var L = hkLegAt(self, other, c, k, res);
  if (res === "land") res = hkLand(self, other, c, L);
  else if (res === "duck") {
    floater(other.x, other.y - other.r - 30, "DUCKED!", "dodge");
    self.vx = L.ex * 170 + L.qx * 60; self.vy = L.ey * 170 + L.qy * 60; // the kick carries him round
  } else if (res === "block") {
    floater(other.x, other.y - other.r - 30, "BLOCKED!", "dodge");
    other.flash = 0.1;
    impacts.push({ x: L.foot.x, y: L.foot.y, nx: -L.ex, ny: -L.ey, life: 0.3, max: 0.3, color: "#ffffff" });
    playKick();
    if (!reduceMotion) shake = Math.max(shake, 6);
  } else if (res === "whiff") floater(other.x, other.y - other.r - 8, "WHIFF", "dodge");
  k.res = res;
  if (res === "duck" || res === "block" || res === "whiff") hkMissOpen(self, other, c);
  return res;
}

// He missed: off balance, and they come for him (the punish, above).
function hkMissOpen(self, other, c) {
  if (!(c.missOpen > 0) || self.hkOpen || !other.alive || other.koOut || over) return;
  var gr = other.char.hasGrapple && other.char.grapple;
  var op = self.hkOpen = { t: c.missOpen, by: other.id, hp: self.hp, guard: c.missGuard || 0,
    shoot: !!gr && Math.random() * 100 < c.missShot, shot: false, hit: false };
  self.blockBonus = (self.blockBonus || 0) - op.guard; // (given back when it's over)
  floater(self.x, self.y - self.r - 54, "OFF BALANCE!", "note");
  if (other.punchCd > 0) other.punchCd = 0;
  if (other.kickCd > 0) other.kickCd = 0;
  if (op.shoot) other.grappleCd = 0;
}

// Every frame he's off balance (tickHeadKicks): they rush him, a wrestler
// shoots once he's in reach, and the first thing that lands is called.
function hkTickOpen(b, dt) {
  var op = b.hkOpen, o = balls[op.by], c = headKickCfg(b);
  op.t -= dt;
  if (b.grappled || b.slam) op.hit = true; // taken down: that's the punish
  else if (!op.hit && b.hp < op.hp - 0.01) {
    op.hit = true;
    if (b.alive && !b.koOut) floater(b.x, b.y - b.r - 30, "PUNISHED!", "crit");
  }
  if (op.t <= 0 || !c || !b.alive || !o || !o.alive || o.koOut || over) {
    b.blockBonus = (b.blockBonus || 0) + op.guard;
    b.hkOpen = null;
    return;
  }
  if (op.hit || !inOrdinaryMovement(o)) return;
  var gap = lkGap(o, b);
  if (op.shoot && !op.shot && gap <= (o.char.grapple.reach || 0) + 8) {
    if (hkCanShoot(o, b)) { op.shot = true; attemptGrab(o, b); } // (grapple-duel.js)
    return;
  }
  if (gap > c.missReach || gap < 4) return;
  var dx = b.x - o.x, dy = b.y - o.y, d = Math.sqrt(dx * dx + dy * dy) || 1;
  var sp = Math.max(Math.sqrt(o.vx * o.vx + o.vy * o.vy), HK_RUSH);
  o.vx = dx / d * sp; o.vy = dy / d * sp;
}
function hkCanShoot(o, b) {
  if (o.grapple || o.grabHold || o.swing || o.grappled || o.sprawl || o.sprawled || specialBusy(o)) return false;
  if (b.grappled || b.grapple || b.sprawl || b.sprawled || b.slam || b.invincible || b.koOut || subLocked(b) || specialBusy(b)) return false;
  if (typeof clinchBusy === "function" && (clinchBusy(o) || clinchBusy(b))) return false;
  return !grabBlockedByImpunity(o, b);
}

// It lands: a knockout, or half their health.
function hkLand(self, other, c, L) {
  var free = !other.holdAtOne && !other.guard && !other.sprawl && !other.sprawled && !other.grappled && !other.grapple && !other.slam && !subLocked(other);
  if (free && Math.random() * 100 < c.koChance) {
    // Out cold (as throwKoPunch, korush.js, but no slip or block: the land roll was that).
    var was = other.holdAtOne;
    other.holdAtOne = true;
    var got = hurt(other, Math.ceil(other.hp / incomingMultiplier(other)), "finisher", self.id);
    other.holdAtOne = was;
    if (!(got > 0)) return "slipped";
    other.hp = 0; other.koOut = true;
    other.punch = null; other.kick = null; other.swing = null; other.throwAnim = null; other.jabAnim = null;
    other.vx = L.ex * 320; other.vy = L.ey * 320;
    hkImpact(self, other, c, L, true);
    knockoutFx(self, other); // (the commentators call a one-shot knockout off koOut, commentary-calls.js)
    self.hkKo = { t: 0, vicId: other.id };
    self.vx = 0; self.vy = 0;
    return "ko";
  }
  var dealt = hurt(other, MAX_HP * c.damagePct / 100, "finisher", self.id);
  if (!(dealt > 0)) { checkEnd(); return "slipped"; }
  hkImpact(self, other, c, L, false);
  if (other.alive && !other.grappled && !other.grapple && !other.slam && !subLocked(other)) {
    other.vx += L.ex * 520; other.vy += L.ey * 520;
    other.knockFly = Math.max(other.knockFly || 0, 0.2);
  }
  checkEnd();
  return "hit";
}

function hkImpact(self, other, c, L, ko) {
  var x = L.foot.x, y = L.foot.y;
  floater(other.x, other.y - other.r - (ko ? 74 : 34), c.text, "crit");
  other.flash = 0.2;
  other.squash = { t: 0.24, max: 0.24, nx: -L.ex, ny: -L.ey };
  impacts.push({ x: x, y: y, nx: -L.ex, ny: -L.ey, life: 0.55, max: 0.55, color: c.color });
  igbbSparks(x, y, L.ex, L.ey, c.color, ko ? 28 : 20, ko ? 640 : 500);
  if (self.hkk) self.hkk.star = { x: x, y: y, t: self.hkk.t, ang: Math.random() * Math.PI };
  hitStop = Math.max(hitStop, 0.16);
  if (!reduceMotion) shake = Math.max(shake, 20);
  playKick();
  playImpactClip(2, 1.3, 60);
  crowdReact(1);
}

// From update(), every frame: the window and cooldown running down, a kick
// the abilities loop didn't get to this frame dropped, the knockout called.
function tickHeadKicks(dt) {
  hkClock += dt;
  balls.forEach(function (b) {
    if (!b.char || !b.char.headKick) return;
    if (b.hkCd > 0) b.hkCd -= dt;
    if (b.hkArm > 0) b.hkArm -= dt;
    if (b.hkOpen) hkTickOpen(b, dt);
    var m = b.hkKo;
    if (m) {
      var o = balls[m.vicId];
      m.t += dt;
      if (o.koOut) { var damp = Math.exp(-5 * dt); o.vx *= damp; o.vy *= damp; }
      if (m.t >= HK_KO_HOLD || !o.koOut || !b.alive) { b.hkKo = null; b.hkk = null; finishKnockedOut(o); checkEnd(); }
    } else if (b.hkk && b.hkk.frame !== hkFrame) endHeadKick(b);
  });
  hkFrame++;
}

// ---------------------------------------------------------------- drawing

// Where the kick is: his hip, the leg drawn back low (cock), the top of the
// high arc (ctrl) and where the foot ends up: the near side of their head
// ("land", "block"), over the top of it and out the far side ("duck"), or
// short of them ("whiff", capped at `reach`). The arc goes up the screen
// (with one of them above the other, out to the kick's side).
function hkLegAt(b, o, c, k, res) {
  var dx = o.x - b.x, dy = o.y - b.y, d = Math.sqrt(dx * dx + dy * dy) || 1, ux = dx / d;
  var flat = Math.abs(ux) > 0.4, sx = flat ? (ux > 0 ? 1 : -1) : k.side, r = b.r;
  // His hip on the kicking side; their head: the top of them, on the side
  // facing him (side by side) or the side it comes round (one above the other).
  var hip = { x: b.x + sx * r * (flat ? 0.55 : 0.72), y: b.y + r * (flat ? 0.45 : 0.3) };
  var head = { x: o.x + (flat ? -sx : sx) * o.r * 0.6, y: o.y - o.r * 0.5 };
  var hx = head.x - hip.x, hy = head.y - hip.y, hl = Math.sqrt(hx * hx + hy * hy) || 1;
  var ex = hx / hl, ey = hy / hl, qx = -ey, qy = ex;
  if (qx * (flat ? 0 : sx) + qy * (flat ? -1 : -0.3) < 0) { qx = -qx; qy = -qy; }
  var foot = head;
  if (res === "duck") foot = { x: o.x + (flat ? sx : -sx * 0.3) * o.r * 0.9, y: o.y - o.r * 1.3 }; // over the top of them, out the far side
  var fx = foot.x - hip.x, fy = foot.y - hip.y, fl = Math.sqrt(fx * fx + fy * fy) || 1, max = r * 0.6 + (c.reach || 95) + 14;
  if (fl > max) { foot = { x: hip.x + fx / fl * max, y: hip.y + fy / fl * max }; fl = max; }
  // Drawn back low, then a wide arc up and round (wide even up close).
  var cock = { x: hip.x - ex * r * 0.9 - qx * r * 0.35, y: hip.y - ey * r * 0.9 - qy * r * 0.35 }, bow = Math.max(fl * 1.1, r * 3.4);
  var ctrl = { x: (cock.x + foot.x) / 2 + qx * bow, y: (cock.y + foot.y) / 2 + qy * bow };
  return { hip: hip, head: head, foot: foot, cock: cock, ctrl: ctrl, rest: { x: hip.x, y: hip.y + r * 0.3 }, ex: ex, ey: ey, qx: qx, qy: qy, len: fl };
}
function hkCurve(L, u) {
  var a = 1 - u;
  return { x: a * a * L.cock.x + 2 * a * u * L.ctrl.x + u * u * L.foot.x, y: a * a * L.cock.y + 2 * a * u * L.ctrl.y + u * u * L.foot.y };
}

// From draw.js, over both fighters: every head kick that's out.
function drawHeadKicksOver() {
  balls.forEach(function (b) {
    var k = b.hkk, c = headKickCfg(b), o = k && balls[k.vicId];
    if (!k || !c || !b.alive || !o) return;
    hkDrawKick(b, o, k, c);
  });
}

function hkDrawKick(b, o, k, c) {
  var res = k.res || (k.out === "land" ? "land" : k.out) || "land";
  var L = hkLegAt(b, o, c, k, res), r = b.r, t = k.t, ch = c.chamber, sw = c.sweep, sc = c.size || 1;
  var rc = hkLanded(k) ? c.recover : c.missRecover, foot, s = 0, phase;
  var lerp = function (p, q, u) { return { x: p.x + (q.x - p.x) * u, y: p.y + (q.y - p.y) * u }; };
  if (t < ch) { phase = "chamber"; foot = lerp(L.rest, L.cock, easeOut(t / ch)); }
  else if (t < ch + sw) { phase = "sweep"; var u = (t - ch) / sw; s = u * u * 0.5 + u * 0.5; foot = hkCurve(L, s); }
  else {
    phase = "recover";
    var e = (t - ch - sw) / Math.max(0.01, rc);
    foot = e < 0.35 ? L.foot : lerp(L.foot, L.rest, easeOut((e - 0.35) / 0.65));
  }
  ctx.save();
  ctx.lineCap = "round"; ctx.lineJoin = "round";
  if (phase === "chamber") {
    // The tell: the high arc it's about to take, dashed red, up to their head.
    var T = hkLegAt(b, o, c, k, "land");
    ctx.globalAlpha = 0.85 * Math.min(1, t / (ch * 0.4));
    ctx.setLineDash([10, 7]); ctx.strokeStyle = c.color; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.moveTo(T.cock.x, T.cock.y); ctx.quadraticCurveTo(T.ctrl.x, T.ctrl.y, T.foot.x, T.foot.y); ctx.stroke();
    ctx.setLineDash([]);
    // and a ring on the head it's aimed at
    ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(T.head.x, T.head.y, o.r * (0.5 - 0.15 * (t / ch)), 0, Math.PI * 2); ctx.stroke();
    ctx.globalAlpha = 1;
  }
  var tail = phase === "sweep" ? s : (phase === "recover" && t - ch - sw < 0.12 ? 1 : -1);
  if (tail > 0) {
    // The swoosh behind the foot, all the way round the arc.
    var fade = phase === "recover" ? 1 - (t - ch - sw) / 0.12 : 1, s0 = Math.max(0, tail - 0.75), N = 14;
    var col = (k.out && k.out !== "land") || (k.res && !hkLanded(k)) ? "#8f99a3" : c.color; // a miss: a grey whoosh
    for (var i = 1; i <= N; i++) {
      var p0 = hkCurve(L, s0 + (tail - s0) * (i - 1) / N), p1 = hkCurve(L, s0 + (tail - s0) * i / N), kk = i / N;
      ctx.globalAlpha = (0.15 + 0.65 * kk) * fade;
      ctx.strokeStyle = col; ctx.lineWidth = (4 + 20 * kk) * sc;
      ctx.beginPath(); ctx.moveTo(p0.x, p0.y); ctx.lineTo(p1.x, p1.y); ctx.stroke();
    }
    ctx.globalAlpha = 0.9 * fade; ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 3;
    ctx.beginPath();
    for (var j = 0; j <= 6; j++) { var pw = hkCurve(L, Math.max(0, tail - 0.35) + Math.min(0.35, tail) * j / 6); if (j) ctx.lineTo(pw.x, pw.y); else ctx.moveTo(pw.x, pw.y); }
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
  // The leg: hip, the knee turned over, the foot (the shin's what lands).
  var knee = { x: (L.hip.x + foot.x) / 2 + L.qx * r * 0.32, y: (L.hip.y + foot.y) / 2 + L.qy * r * 0.32 };
  drawBjjLeg(b.char, L.hip, knee, foot, r * 0.16 * sc, 0.5 * k.side, r * 0.24 * sc);
  // The star on their head.
  var st = k.star;
  if (st && t - st.t < HK_STAR) hkDrawStar(st.x, st.y, (t - st.t) / HK_STAR, c.color, o.r / 40, st.ang);
  ctx.restore();
}

// A big star burst where the shin meets their head, and a ring going out.
function hkDrawStar(x, y, e, color, sc, ang) {
  var R = (34 + 40 * easeOut(e)) * sc;
  ctx.save();
  ctx.translate(x, y);
  ctx.globalAlpha = 1 - e * e;
  ctx.strokeStyle = color; ctx.lineWidth = 6 * (1 - e) + 1;
  ctx.beginPath(); ctx.arc(0, 0, R * 1.25, 0, Math.PI * 2); ctx.stroke();
  ctx.rotate(ang);
  ctx.beginPath();
  for (var i = 0; i < 20; i++) {
    var rr = i % 2 ? R * 0.4 : R * (i % 4 ? 0.85 : 1), a = i * Math.PI / 10;
    if (i) ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); else ctx.moveTo(rr, 0);
  }
  ctx.closePath();
  ctx.fillStyle = "#ffffff"; ctx.fill();
  ctx.lineWidth = 4; ctx.strokeStyle = color; ctx.stroke();
  ctx.fillStyle = "#ffe14d";
  ctx.beginPath(); ctx.arc(0, 0, R * 0.28, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

// ---------------------------------------------------------------- the fighter card

function headKickGalleryMoves(ch, add) {
  var c = ch.headKick;
  if (!c) return;
  var v = function (k) { return c[k] != null ? c[k] : HEAD_KICK_DEFAULTS[k]; };
  add("💥", "Head kick", "Once he's landed " + v("setup") + " calf kicks, each one that lands is a " + v("chance") + "% chance he goes high next: a head kick that lands " +
    v("landChance") + "% of the time (they duck it or block it, and he's left open). When it lands it's a knockout " + v("koChance") + "% of the time, otherwise " +
    v("damagePct") + "% of their health. At most one every " + secs(v("cooldown")) + "." +
    (v("missOpen") > 0 ? " A miss leaves him off balance for " + secs(v("missOpen")) + ": his guard drops, they rush him, and a wrestler shoots on him " + v("missShot") + "% of the time." : ""));
}
