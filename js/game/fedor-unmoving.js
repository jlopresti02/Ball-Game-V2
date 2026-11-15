// Fedor Emelianenko's special: THE UNMOVING MAN (Joe, 2026-11-15).
//
// The opponent throws everything they have at him and he slips all of it
// without trying, hands down, feet still. When they've punched themselves
// out he catches their last punch in one glove and puts them through the
// cage with one overhand right. Baki / Kengan Ashura style: a cinematic camera
// (push-ins, cuts, a slow orbit, a dutch angle), muted colours with black
// letterbox bars, a white impact frame with black silhouettes and a crimson
// burst, then the opponent flies off on the game's own physics (a wall slam)
// and the fight carries on.
//
// It starts when his special bar is full, they're within `special.range` of
// him (edge to edge) and they're throwing something at him (or he's waited
// `special.waitMax` seconds with them close). Numbers in `special`:
//   damage      the overhand right, 150 (an IGBB-type hit: no block, no weave)
//   launch      how fast it sends them into the cage (the wall slam's speed);
//               they lie there dazed against it until the move ends
//   slamDamage  what the cage does to them when they hit it
//
// Timeline (seconds into the move, UM below):
//   0.00 set       both slide into place, side by side, a punch apart
//   0.35 switch    his gloves drop to his hips, his head dips; the camera
//                  pushes in on him and the crowd fades under a heartbeat
//   1.90 dodges    six punches (hook, hook, uppercut, straight, hook,
//                  straight), each slipped at the last moment by a head tilt,
//                  a shoulder roll, a lean back or a slip; the camera orbits
//   4.80 slow      one last straight in slow motion past his eye, close up,
//                  and the sound cuts out
//   6.10 realize   cut to them: shaking, panting, a sweat drop, shock lines
//   6.85 look      cut to him: his eyes come up out of the shadow, "..."
//   7.50 catch     their desperate punch, caught in his glove: a clang and a
//                  bass hit, everything stops
//   7.95 windup    low dutch angle on his right arm drawing back
//   8.95 strike    the overhand, then the impact frame (a freeze), the launch
//   9.60 shake     he shakes out his right hand, not looking at them
//  10.45 guard     and back to his stance; the move ends at 10.8
//
// Only ever his own two arms and gloves, and theirs (Joe's rule); fighters
// are faceless, so the "expression" is his posture, a shadow over his eyes
// with two cold glints, and manga marks (sweat drop, shock lines, "...").
// Sounds are made in code (no recordings). Hooks: special.js (updateSpecial),
// fedor.js (applyFedorPose, drawFedorOver), draw-attacks.js (drawHands) and
// draw.js (fedorScreenCam, the camera).
"use strict";

SPECIAL_MOVES.unmoving = "The Unmoving Man";

var UM = {
  set: 0.35, switchEnd: 1.9, slow0: 4.8, slowEnd: 6.1, realEnd: 6.85, lookEnd: 7.5,
  punch: 7.5, catchAt: 7.72, windup: 7.95, strike: 8.95, hit: 9.03, shake: 9.6, guard: 10.45, end: 10.8
};
var UM_FREEZE = 0.3;      // the impact frame holds this long (hitStop)
var UM_CRIMSON = "#b3001b";
// Their punches: hand h (-1 the upper glove, 1 the lower), when the glove
// reaches him (hit), wind-up and travel times, and how he slips it.
var UM_STRIKES = [
  { k: "hook", h: -1, hit: 2.42, tw: 0.2, tt: 0.2, dodge: "tilt" },
  { k: "hook", h: 1, hit: 3.02, tw: 0.16, tt: 0.17, dodge: "roll" },
  { k: "upper", h: -1, hit: 3.55, tw: 0.15, tt: 0.15, dodge: "lean" },
  { k: "straight", h: 1, hit: 3.98, tw: 0.1, tt: 0.11, dodge: "slip" },
  { k: "hook", h: -1, hit: 4.3, tw: 0.08, tt: 0.12, dodge: "roll" },
  { k: "straight", h: 1, hit: 4.55, tw: 0.07, tt: 0.1, dodge: "slip" },
  { k: "straight", h: -1, hit: 5.75, tw: 0.15, tt: 0.8, dodge: "eye", slow: true }
];

function umOn(b) { return !!(b && b.igbb && b.igbb.move === "unmoving"); }
function umOwner() { for (var i = 0; i < balls.length; i++) if (umOn(balls[i]) && balls[i].alive) return balls[i]; return null; }
function umClamp01(k) { return Math.max(0, Math.min(1, k)); }
function umEase(k) { k = umClamp01(k); return k * k * (3 - 2 * k); }
function umLerp(a, b, k) { return a + (b - a) * k; }
function umLerpP(a, b, k) { return { x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k }; }
function umBez(a, c, b, k) { var j = 1 - k; return { x: j * j * a.x + 2 * j * k * c.x + k * k * b.x, y: j * j * a.y + 2 * j * k * c.y + k * k * b.y }; }

// ---------------------------------------------------------------- the move

// From updateSpecial (special.js) for Fedor. True while it's running.
function updateUnmoving(self, other, dt) {
  var sp = self.char.special, m = self.igbb;
  if (!m) {
    if (self.specialT < sp.chargeTime || !canStartIgbb(self, other) || swordDuelActive()) { self.umWait = 0; return false; }
    var gap = Math.hypot(other.x - self.x, other.y - self.y) - self.r - other.r;
    if (gap > (sp.range || 140)) return false;
    self.umWait = (self.umWait || 0) + dt;
    var attacking = other.punch || other.kick || other.koPunch || other.jabAnim;
    if (!attacking && self.umWait < (sp.waitMax || 2.5)) return false;
    umStart(self, other);
    m = self.igbb;
  }
  if (!self.alive || !other.alive || over) { umEnd(self, other); return false; }
  if (m.impact && !m.frameDone) m.frameDone = true; // the impact frame's freeze is over
  var prev = m.t;
  m.t += dt;
  self.vx = 0; self.vy = 0;
  if (!m.launched) { other.vx = 0; other.vy = 0; }
  umPlace(self, other, m);
  umSounds(self, other, m, prev);
  if (m.t >= UM.hit && !m.impact) umImpact(self, other, m);
  if (m.launched) umWatchLanding(self, other, m);
  if (m.t >= UM.end) { umEnd(self, other); return false; }
  return true;
}

function umStart(self, other) {
  clearActions(self); clearActions(other);
  self.punch = null; self.koPunch = null; other.koPunch = null;
  other.shelled = true; // frozen (abilities.js) and out of the physics (igbbLocked)
  var r = self.r, ro = other.r, D = r + ro + Math.min(r, ro) * 0.62;
  var s = other.x >= self.x ? 1 : -1;
  var fx = Math.max(r + 40, Math.min(W - r - 40, self.x));
  if (fx + s * D > W - ro - 30 || fx + s * D < ro + 30) s = -s;
  fx = Math.max(s > 0 ? r + 30 : D + ro + 30, Math.min(s > 0 ? W - D - ro - 30 : W - r - 30, fx));
  var fy = Math.max(Math.max(r, ro) + 70, Math.min(H - Math.max(r, ro) - 70, self.y));
  self.igbb = {
    move: "unmoving", phase: "cine", t: 0, s: s, D: D,
    from: { fx: self.x, fy: self.y, ox: other.x, oy: other.y },
    F: { x: fx, y: fy }, O: { x: fx + s * D, y: fy },
    vicId: other.id, impact: false, frameDone: false, launched: false, landed: false, beat: 0
  };
  self.umWait = 0;
  umCrowdDown(0.18, 1.2);
  if (typeof holdMusicOff === "function") holdMusicOff();
  crowdReact(0.15);
}

// Lets go of everything: the camera, the crowd and music come back.
function umEnd(self, other) {
  var m = self.igbb;
  self.igbb = null;
  self.specialT = 0;
  self.umWait = 0;
  if (other && other.shelled) other.shelled = false;
  if (other && m && m.dazed && other.dazed === true) { other.dazed = false; setSpeed(other, (other.baseSpeed || SPEED) * 0.6); }
  if (m && !m.landed) { umCrowdBack(); if (typeof releaseMusic === "function") releaseMusic(); }
}

// Both fighters' positions: sliding into place, then held where the move
// wants them (their bodies' slips and leans are drawn by applyUnmovingPose).
function umPlace(self, other, m) {
  if (m.launched) { self.x = m.F.x; self.y = m.F.y; return; }
  var k = umEase(m.t / UM.set);
  self.x = umLerp(m.from.fx, m.F.x, k); self.y = umLerp(m.from.fy, m.F.y, k);
  other.x = umLerp(m.from.ox, m.O.x, k); other.y = umLerp(m.from.oy, m.O.y, k);
}

// The overhand lands: the freeze, the damage, and the launch on the game's
// own physics (a one-bounce wall slam).
function umImpact(self, other, m) {
  m.impact = true;
  var sp = self.char.special, s = m.s;
  var J = umJaw(self, other, m);
  other.shelled = false;
  var dealt = hurt(other, sp.damage || 150, "igbb", self.id);
  if (!reduceMotion) { hitStop = Math.max(hitStop, UM_FREEZE); shake = Math.max(shake, 34); }
  other.flash = 0.2;
  other.squash = { t: 0.22, max: 0.22, nx: s, ny: 0 };
  impacts.push({ x: J.x, y: J.y, nx: s, ny: 0, life: 0.7, max: 0.7, color: UM_CRIMSON });
  impacts.push({ x: J.x, y: J.y, nx: s, ny: 0, life: 0.95, max: 0.95, color: "#ffffff" });
  for (var i = 0; i < 30; i++) {
    var a = (s > 0 ? 0 : Math.PI) + (Math.random() - 0.5) * 2.2, v = 200 + Math.random() * 520;
    particles.push({ x: J.x, y: J.y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 0.3 + Math.random() * 0.4, max: 0.7, size: 2 + Math.random() * 4, color: i % 3 ? UM_CRIMSON : theme.wall });
  }
  playUmImpact();
  crowdReact(1);
  if (other.alive) {
    var ang = -0.22; // up and away, so the flight shows on the screen
    beginWallSlam(other, Math.cos(ang) * s, Math.sin(ang), { wallSlams: 1, slamDamage: sp.slamDamage != null ? sp.slamDamage : 10, knockback: sp.launch || 1700 });
    other.knockFly = 0.35;
    m.launched = true;
  }
  checkEnd();
  return dealt;
}

// They hit the cage and drop: a cloud of dust, and the arena comes back.
function umWatchLanding(self, other, m) {
  if (m.landed) return;
  if (other.slam && m.t < UM.end - 0.3) return;
  m.landed = true;
  if (other.alive && !over) { other.dazed = true; other.vx = 0; other.vy = 0; m.dazed = true; } // stars, down against the cage until he's back in his stance
  if (!reduceMotion) {
    for (var i = 0; i < 26; i++) {
      var a = Math.random() * Math.PI * 2, v = 40 + Math.random() * 130;
      particles.push({ x: other.x + Math.cos(a) * other.r * 0.6, y: other.y + other.r * 0.5 + Math.sin(a) * other.r * 0.3, vx: Math.cos(a) * v, vy: Math.sin(a) * v * 0.5 - 30,
        life: 0.6 + Math.random() * 0.6, max: 1.2, size: other.r * (0.25 + Math.random() * 0.3), color: "rgba(196,180,150,0.55)" });
    }
  }
  umCrowdBack();
  if (typeof releaseMusic === "function") releaseMusic();
  crowdReact(1);
}

// ---------------------------------------------------------------- poses

// Where a strike's glove is, and how far into it (0..1 extension), at time t.
function umStrikeAt(st, t, F, O, r, ro, s) {
  var ts = st.hit - st.tt - st.tw, ft = st.slow ? 0.3 : 0.12, tr = st.slow ? 0.28 : 0.18;
  if (t < ts || t > st.hit + ft + tr) return null;
  var u = { x: s, y: 0 }, gr = ro * 0.3;
  var G = { x: O.x - u.x * ro * 0.8, y: O.y + st.h * ro * 0.4 };
  var Wp;
  if (st.k === "hook") Wp = { x: G.x + u.x * ro * 0.15, y: G.y + st.h * ro * 0.38 };
  else if (st.k === "upper") Wp = { x: G.x + u.x * ro * 0.1, y: O.y + ro * 0.75 };
  else Wp = { x: G.x + u.x * ro * 0.22, y: G.y };
  var dv = umDodgeVec(st, r, s), Fd = { x: F.x + dv.x, y: F.y + dv.y };
  var H;
  if (st.k === "hook") H = { x: F.x + u.x * r * 0.35, y: F.y + st.h * r * 0.45 };
  else if (st.k === "upper") H = { x: F.x + u.x * r * 0.5, y: F.y + r * 0.15 };
  else H = { x: F.x + u.x * r * 0.3, y: F.y + st.h * r * (st.slow ? 0.28 : 0.2) };
  var hx = H.x - Fd.x, hy = H.y - Fd.y, hl = Math.hypot(hx, hy) || 1, R = r + gr + (st.slow ? 1 : 2);
  var E = { x: Fd.x + hx / hl * R, y: Fd.y + hy / hl * R };
  var aE = Math.atan2(E.y - Fd.y, E.x - Fd.x), aO = s > 0 ? 0 : Math.PI, d = st.slow ? 0.35 : 0.55;
  var away = Math.abs(Math.atan2(Math.sin(aE + d - aO), Math.cos(aE + d - aO))) > Math.abs(Math.atan2(Math.sin(aE - aO), Math.cos(aE - aO))) ? d : -d;
  if (t < ts + st.tw) return { p: umLerpP(G, Wp, umEase((t - ts) / st.tw)), ext: 0, scale: 1 };
  if (t < st.hit) {
    var k = (t - (st.hit - st.tt)) / st.tt, kk = st.slow ? k : 1 - Math.pow(1 - k, 2);
    var mid = umLerpP(Wp, E, 0.5), C = st.k === "hook" ? { x: mid.x, y: mid.y + st.h * ro * 1.1 } : st.k === "upper" ? { x: mid.x, y: mid.y + ro * 0.9 } : mid;
    return { p: umBez(Wp, C, E, kk), ext: kk, scale: st.k === "upper" ? 1 + 0.15 * kk : 1, moving: true, slow: st.slow };
  }
  if (t < st.hit + ft) {
    var a = aE + away * umEase((t - st.hit) / ft);
    return { p: { x: Fd.x + Math.cos(a) * R, y: Fd.y + Math.sin(a) * R }, ext: 1, scale: st.k === "upper" ? 1.15 : 1 };
  }
  var a2 = aE + away, E2 = { x: Fd.x + Math.cos(a2) * R, y: Fd.y + Math.sin(a2) * R };
  var kr = umEase((t - st.hit - ft) / tr);
  return { p: umLerpP(E2, G, kr), ext: 1 - kr, scale: 1 };
}

// How far he slips each kind of punch.
function umDodgeVec(st, r, s) {
  var h = st.h;
  if (st.dodge === "tilt") return { x: -s * r * 0.06, y: -h * r * 0.2, rot: h * s * 0.1 };
  if (st.dodge === "roll") return { x: -s * r * 0.1, y: -h * r * 0.16 + r * 0.05, rot: -h * s * 0.22 };
  if (st.dodge === "lean") return { x: -s * r * 0.3, y: -r * 0.04, rot: -s * 0.08 };
  if (st.dodge === "eye") return { x: 0, y: -h * r * 0.13, rot: 0 };
  return { x: 0, y: -h * r * 0.24, rot: h * s * 0.05 };
}

// His body's slip, lean or turn right now (added to his spot).
function umFedorOff(m, r) {
  var t = m.t, s = m.s, o = { x: 0, y: 0, rot: 0 };
  // Head dips as the switch happens, and a small neck adjustment.
  var dip = umEase((t - 0.5) / 0.6) * (1 - umEase((t - 6.9) / 0.4));
  o.y += dip * r * 0.05;
  if (t > 1.55 && t < 1.85) o.rot += Math.sin((t - 1.55) / 0.3 * Math.PI) * 0.09 * s;
  UM_STRIKES.forEach(function (st) {
    var react = st.slow ? 0.35 : Math.min(0.1, st.tt * 0.7), ft = st.slow ? 0.3 : 0.12;
    var k = t < st.hit - react ? 0 : t < st.hit ? umEase((t - st.hit + react) / react) : t < st.hit + ft ? 1 : 1 - umEase((t - st.hit - ft) / 0.22);
    if (k <= 0) return;
    var dv = umDodgeVec(st, r, s);
    o.x += dv.x * k; o.y += dv.y * k; o.rot += dv.rot * k;
  });
  // The overhand: coiling back, then the hips snapping through.
  if (t > UM.windup && t < UM.shake) {
    var coil = umEase((t - UM.windup) / 0.8) * (1 - umEase((t - UM.strike) / 0.06));
    var snap = umEase((t - UM.strike) / 0.08) * (1 - umEase((t - UM.hit - 0.15) / 0.4));
    o.x += -s * r * 0.08 * coil + s * r * 0.16 * snap;
    o.rot += -s * 0.16 * coil + s * 0.12 * snap;
  }
  return o;
}

// Their body leaning into each punch, shaking once they realise.
function umVicOff(m, ro) {
  var t = m.t, s = m.s, o = { x: 0, y: 0, rot: 0, sc: 1 };
  UM_STRIKES.forEach(function (st) {
    var g = umStrikeAt(st, t, m.F, m.O, 1, 1, s);
    if (g) o.x += -s * ro * 0.14 * g.ext;
  });
  if (t > UM.slowEnd && t < UM.punch) {
    o.x += Math.sin(t * 71) * 1.2; o.y += Math.cos(t * 63) * 1.0; // trembling
    o.sc = 1 + Math.max(0, Math.sin((t - UM.slowEnd) * 8)) * 0.035; // heaving breaths
  }
  if (t > UM.punch && t < UM.hit) {
    var lunge = umEase((t - UM.punch) / 0.2);
    o.x += -s * ro * 0.18 * lunge;
    if (t > UM.catchAt) { o.x += Math.sin(t * 90) * 0.8; o.rot += s * 0.06; }
  }
  return o;
}

// From applyFedorPose (fedor.js), with the canvas set up for b: his slips
// and their lean, drawn on the body.
function applyUnmovingPose(b) {
  var f = umOwner();
  if (!f) return;
  var m = f.igbb, o;
  if (b === f) o = umFedorOff(m, b.r);
  else if (b.id === m.vicId && !m.launched) o = umVicOff(m, b.r);
  else return;
  ctx.translate(b.x + o.x, b.y + o.y);
  if (o.rot) ctx.rotate(o.rot);
  if (o.sc && o.sc !== 1) ctx.scale(o.sc, o.sc);
  ctx.translate(-b.x, -b.y);
}

// drawHands leaves both fighters' hands to drawUnmovingOver.
function unmovingHandsBusy(b) {
  var f = umOwner();
  if (!f || !b.alive) return false;
  if (b === f) return true;
  return b.id === f.igbb.vicId && !f.igbb.launched;
}

// Where his overhand lands on them: low on the side of their head.
function umJaw(self, other, m) {
  return { x: other.x - m.s * other.r * 0.45, y: other.y + other.r * 0.18 };
}

// ---------------------------------------------------------------- drawing

// Over both fighters (from drawFedorOver): every arm and glove in the move,
// the shadow over his eyes, the manga marks.
function drawUnmovingOver() {
  var f = umOwner();
  if (!f) return;
  var m = f.igbb, v = balls[m.vicId], t = m.t, s = m.s, r = f.r, ro = v.r;
  var fo = umFedorOff(m, r), F = { x: f.x + fo.x, y: f.y + fo.y };
  var vo = m.launched ? { x: 0, y: 0 } : umVicOff(m, ro), O = { x: v.x + vo.x, y: v.y + vo.y };
  ctx.save();
  umDrawFace(f, F, m);
  if (!m.launched) umDrawVicMarks(v, O, m);
  if (!m.launched) umDrawVicArms(f, v, F, O, m);
  umDrawFedorArms(f, v, F, O, m);
  umDrawBubble(f, F, m);
  ctx.restore();
}

// Their two arms: guard, the punches, the one he catches.
function umDrawVicArms(f, v, F, O, m) {
  var t = m.t, s = m.s, ro = v.r, gr = ro * 0.3;
  [-1, 1].forEach(function (h) {
    var sh = { x: O.x + (h < 0 ? -s : s) * ro * 0.66, y: O.y - ro * 0.3 };
    var G = { x: O.x - s * ro * 0.8, y: O.y + h * ro * 0.4 }, p = G, sc = 1, moving = false, slow = false;
    if (t > UM.slowEnd && t < UM.punch) G = p = { x: G.x + s * ro * 0.12, y: G.y + Math.sin(t * 50 + h) * 1.2 }; // gloves sagging, shaking
    UM_STRIKES.forEach(function (st) {
      if (st.h !== h) return;
      var g = umStrikeAt(st, t, m.F, m.O, f.r, ro, s);
      if (g) { p = { x: g.p.x + (O.x - m.O.x), y: g.p.y + (O.y - m.O.y) }; sc = g.scale; moving = g.moving; slow = g.slow; }
    });
    if (h === 1 && t >= UM.punch) { // the desperate last one, and caught
      var K = umCatchPoint(f, F, m, gr);
      p = t < UM.catchAt ? umLerpP(G, K, Math.pow(umClamp01((t - UM.punch) / (UM.catchAt - UM.punch)), 1.6)) : K;
      moving = t < UM.catchAt;
    }
    if (moving) umSpeedLines(p, G, gr, slow ? 0.35 : 0.8);
    drawBentArm(v, sh, p, sh.x < O.x ? -1 : 1);
    drawGloveAt(p.x, p.y, gr * sc, v.char, Math.atan2(F.y - p.y, F.x - p.x));
  });
}

// Just in front of his face, where he takes hold of their glove.
function umCatchPoint(f, F, m, gr) { return { x: F.x + m.s * (f.r + gr * 0.9), y: F.y - f.r * 0.05 }; }

// His arms: gloves down by his hips, the catch, the overhand, the shake.
function umDrawFedorArms(f, v, F, O, m) {
  var t = m.t, s = m.s, r = f.r, gr = r * 0.3, vgr = v.r * 0.3;
  var shL = { x: F.x + s * r * 0.66, y: F.y - r * 0.3 }, shR = { x: F.x - s * r * 0.66, y: F.y - r * 0.3 };
  var guardL = { x: F.x + s * r * 0.8, y: F.y - r * 0.12 }, guardR = { x: F.x + s * r * 0.8, y: F.y + r * 0.28 };
  var sway = Math.sin(t * 2.2) * r * 0.03;
  var lowL = { x: F.x + s * r * 0.86, y: F.y + r * 0.62 + sway }, lowR = { x: F.x - s * r * 0.92, y: F.y + r * 0.58 - sway };
  var drop = umEase((t - 0.4) / 0.6), back = umEase((t - UM.guard) / (UM.end - UM.guard));
  // Lead hand: down, up to catch, lets go on the hit.
  var L = umLerpP(umLerpP(guardL, lowL, drop), guardL, back), armL = false;
  if (t > UM.catchAt - 0.1 && t < UM.hit + 0.35) {
    var K = umCatchPoint(f, F, m, vgr), Kg = { x: K.x - s * vgr * 0.15, y: K.y - vgr * 0.25 };
    L = t < UM.catchAt ? umLerpP(lowL, Kg, umEase((t - UM.catchAt + 0.1) / 0.1)) : t < UM.hit ? Kg : umLerpP(Kg, lowL, umEase((t - UM.hit) / 0.35));
    armL = true;
  }
  // Rear (right) hand: down, drawn back, the overhand, the shake out.
  var R = umLerpP(umLerpP(guardR, lowR, drop), guardR, back), armR = false, streak = null;
  var R0 = { x: F.x - s * r * 1.1, y: F.y - r * 0.72 };
  if (t > UM.windup && t < UM.shake) {
    armR = true;
    var J = umJaw(f, v, m);
    if (t < UM.strike) R = umLerpP(lowR, R0, umEase((t - UM.windup) / 0.85));
    else if (t < UM.hit) {
      var kk = umClamp01((t - UM.strike) / (UM.hit - UM.strike));
      R = umBez(R0, { x: F.x + s * r * 0.3, y: F.y - r * 1.45 }, J, kk * kk);
      streak = true;
    } else {
      var J2 = { x: F.x + s * r * 1.15, y: F.y + r * 0.1 };
      R = umLerpP(m.launched ? J2 : J, lowR, umEase((t - UM.hit - 0.15) / 0.45));
    }
    if (t > UM.strike - 0.15 && t < UM.strike) R = { x: R.x + Math.sin(t * 95) * 0.8, y: R.y }; // loaded
  } else if (t >= UM.shake && t < UM.guard) {
    var dk = 1 - umClamp01((t - UM.shake) / (UM.guard - UM.shake - 0.1));
    R = { x: lowR.x, y: lowR.y + Math.sin((t - UM.shake) * 38) * r * 0.12 * dk };
  }
  if (streak) umSpeedLines(R, R0, gr, 1.2);
  // Crimson rim light on him while he winds up.
  if (t > UM.windup && t < UM.hit) {
    ctx.save();
    ctx.globalAlpha = 0.55 * umEase((t - UM.windup) / 0.5);
    ctx.strokeStyle = UM_CRIMSON; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.arc(F.x, F.y, r + 3, s > 0 ? Math.PI * 0.55 : -Math.PI * 0.45, s > 0 ? Math.PI * 1.45 : Math.PI * 0.45); ctx.stroke();
    ctx.restore();
  }
  if (armR) drawBentArm(f, shR, R, shR.x < F.x ? -1 : 1);
  drawGloveAt(R.x, R.y, gr * (streak ? 1.12 : 1), f.char, armR ? Math.atan2(O.y - R.y, O.x - R.x) : Math.PI / 2 + s * 0.3);
  if (armL) drawBentArm(f, shL, L, shL.x < F.x ? -1 : 1);
  drawGloveAt(L.x, L.y, gr, f.char, armL ? Math.atan2(O.y - L.y, O.x - L.x) : Math.PI / 2 - s * 0.3);
}

// Streaks of air behind a glove on its way through.
function umSpeedLines(p, from, gr, alpha) {
  var dx = p.x - from.x, dy = p.y - from.y, d = Math.hypot(dx, dy);
  if (d < 4) return;
  var nx = dx / d, ny = dy / d, len = Math.min(d, gr * 4);
  ctx.save();
  ctx.lineCap = "round"; ctx.strokeStyle = theme.wall; ctx.lineWidth = 2.5;
  [-1, 0, 1].forEach(function (k) {
    var ox = -ny * k * gr * 0.6, oy = nx * k * gr * 0.6;
    ctx.globalAlpha = alpha * (k ? 0.45 : 0.7);
    ctx.beginPath(); ctx.moveTo(p.x - nx * gr * 1.1 + ox, p.y - ny * gr * 1.1 + oy);
    ctx.lineTo(p.x - nx * (gr * 1.1 + len * (k ? 0.6 : 1)) + ox, p.y - ny * (gr * 1.1 + len * (k ? 0.6 : 1)) + oy); ctx.stroke();
  });
  ctx.restore();
}

// The shadow over his eyes: it falls as he switches off, and two cold glints
// show in it when he looks at them. No face, just the light.
function umDrawFace(f, F, m) {
  var t = m.t, s = m.s, r = f.r;
  var shade = umEase((t - 0.6) / 0.8) * (1 - umEase((t - UM.shake) / 0.6));
  if (shade <= 0.01) return;
  ctx.save();
  ctx.beginPath(); ctx.arc(F.x, F.y, r - 1.5, 0, Math.PI * 2); ctx.clip();
  var g = ctx.createLinearGradient(F.x, F.y - r, F.x, F.y + r * 0.1);
  g.addColorStop(0, "rgba(8,6,12," + 0.72 * shade + ")"); g.addColorStop(0.55, "rgba(8,6,12," + 0.5 * shade + ")"); g.addColorStop(1, "rgba(8,6,12,0)");
  ctx.fillStyle = g; ctx.fillRect(F.x - r, F.y - r, r * 2, r * 1.2);
  // Hatching down the shadowed side, like a manga panel.
  ctx.strokeStyle = "rgba(0,0,0," + 0.35 * shade + ")"; ctx.lineWidth = 1.2;
  for (var i = 0; i < 7; i++) {
    var hx = F.x - s * r * (0.95 - i * 0.09);
    ctx.beginPath(); ctx.moveTo(hx, F.y - r); ctx.lineTo(hx - s * r * 0.25, F.y - r * 0.15); ctx.stroke();
  }
  // The glints: low and looking down at first, then up and straight at them.
  var glint = umEase((t - 1.2) / 0.3) * (1 - umEase((t - 2.2) / 0.3)) * 0.7 + umEase((t - 6.95) / 0.35) * (1 - umEase((t - UM.hit) / 0.2));
  if (t > UM.slow0 + 0.4 && t < UM.slowEnd) glint = Math.max(glint, 0.8); // he doesn't blink
  if (glint > 0.01) {
    var up = t < 3 ? umEase((t - 1.55) / 0.3) : umEase((t - 7.0) / 0.4), ey = F.y - r * (0.36 + 0.1 * up), look = s * r * 0.06 * up;
    var open = 0.25 + 0.75 * up;
    [-1, 1].forEach(function (k) {
      var ex = F.x + k * r * 0.27 + look;
      ctx.globalAlpha = glint;
      ctx.fillStyle = "rgba(200,225,255,0.35)";
      ctx.beginPath(); ctx.ellipse(ex, ey, r * 0.16, r * 0.06 * open + 1, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#eef5ff";
      ctx.beginPath(); ctx.ellipse(ex, ey, r * 0.1, r * 0.022 * open + 0.8, 0, 0, Math.PI * 2); ctx.fill();
    });
  }
  ctx.restore();
}

// Them realising: a sweat drop running down, shock lines, panting.
function umDrawVicMarks(v, O, m) {
  var t = m.t, s = m.s, ro = v.r;
  if (t > UM.slowEnd - 0.05 && t < UM.hit) {
    var k = umEase((t - UM.slowEnd) / 0.15);
    // Shock lines over their head.
    ctx.save();
    ctx.strokeStyle = theme.wall; ctx.lineWidth = 3; ctx.lineCap = "round";
    ctx.globalAlpha = k * (t < UM.punch ? 1 : 0.6);
    [-0.5, 0, 0.5].forEach(function (a) {
      var ang = -Math.PI / 2 + a, r0 = ro * 1.12, r1 = ro * (1.4 + (a === 0 ? 0.12 : 0));
      ctx.beginPath(); ctx.moveTo(O.x + Math.cos(ang) * r0, O.y + Math.sin(ang) * r0); ctx.lineTo(O.x + Math.cos(ang) * r1, O.y + Math.sin(ang) * r1); ctx.stroke();
    });
    // The sweat drop, sliding down the side away from him.
    var slide = umClamp01((t - UM.slowEnd) / 0.9);
    var dx = O.x + s * ro * 0.78, dy = O.y - ro * 0.55 + slide * ro * 0.35, dr = ro * 0.13;
    ctx.globalAlpha = k;
    ctx.fillStyle = "#bfe3ff"; ctx.strokeStyle = "#2a5d86"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(dx, dy - dr * 1.9);
    ctx.quadraticCurveTo(dx + dr * 1.1, dy - dr * 0.2, dx, dy + dr);
    ctx.quadraticCurveTo(dx - dr * 1.1, dy - dr * 0.2, dx, dy - dr * 1.9);
    ctx.fill(); ctx.stroke();
    ctx.restore();
  }
  // Panting: puffs of breath off them, more and more as the punches miss.
  var pant = t > 3.0 && t < UM.catchAt ? (t > UM.slowEnd ? 1 : 0.5) : 0;
  if (pant > 0) {
    ctx.save();
    for (var i = 0; i < 3; i++) {
      var ph = ((t * (t > UM.slowEnd ? 2.4 : 1.6)) + i / 3) % 1;
      ctx.globalAlpha = pant * 0.5 * (1 - ph);
      ctx.fillStyle = "#ffffff"; ctx.strokeStyle = "rgba(0,0,0,0.25)"; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(O.x + s * ro * (0.3 + ph * 0.5), O.y - ro * (0.55 + ph * 0.6), ro * (0.08 + ph * 0.12), 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    }
    ctx.restore();
  }
}

// "..." over him: not angry, not impressed. Disappointed.
function umDrawBubble(f, F, m) {
  var t = m.t;
  if (t < 7.0 || t > UM.punch + 0.05) return;
  var k = umEase((t - 7.0) / 0.15) * (1 - umEase((t - UM.punch + 0.05) / 0.1)), r = f.r;
  var bx = F.x - m.s * r * 0.9, by = F.y - r * 1.55, w = r * 0.95, hgt = r * 0.5;
  ctx.save();
  ctx.globalAlpha = k;
  ctx.fillStyle = "#ffffff"; ctx.strokeStyle = theme.wall; ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.ellipse(bx, by, w / 2, hgt / 2, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.arc(bx + m.s * w * 0.32, by + hgt * 0.62, r * 0.07, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = theme.wall;
  var n = Math.min(3, Math.floor((t - 7.0) / 0.12) + 1);
  for (var i = 0; i < n; i++) { ctx.beginPath(); ctx.arc(bx + (i - 1) * w * 0.22, by, r * 0.055, 0, Math.PI * 2); ctx.fill(); }
  ctx.restore();
}

// ---------------------------------------------------------------- the camera

// The camera for this moment: zoom, the point it's on (arena units), its
// roll, and how far in the colour grade and letterbox are (0..1).
function umCam(f, m) {
  var v = balls[m.vicId], t = m.t, s = m.s, r = f.r, ro = v.r;
  var F = { x: f.x, y: f.y }, O = { x: v.x, y: v.y }, Mid = { x: (F.x + O.x) / 2, y: (F.y + O.y) / 2 };
  var face = { x: F.x, y: F.y - r * 0.3 };
  var grade = umEase(t / 0.8) * (1 - umEase((t - UM.hit - 0.4) / 0.7));
  var c = { z: 1, x: F.x, y: F.y, rot: 0, grade: grade, bars: grade, lines: 0 };
  if (t < UM.set) { c.z = 1 + 0.12 * umEase(t / UM.set); }
  else if (t < UM.switchEnd) { c.z = umLerp(1.12, 2.5, umEase((t - UM.set) / (UM.switchEnd - UM.set))); c.x = face.x; c.y = umLerp(F.y, face.y, umEase((t - UM.set) / 1.2)); }
  else if (t < UM.slow0) {
    // A slow orbit round them both (the roll swings across), the first
    // hook tracked as it goes past.
    var k = (t - UM.switchEnd) / (UM.slow0 - UM.switchEnd);
    c.z = 1.95 + 0.15 * Math.sin(k * Math.PI); c.rot = umLerp(-0.13, 0.13, umEase(k)) * s;
    c.x = Mid.x + Math.sin(k * Math.PI * 1.5) * r * 0.25; c.y = Mid.y - r * 0.1;
    if (t < 2.75) {
      var g = umStrikeAt(UM_STRIKES[0], t, m.F, m.O, r, ro, s), tk = umEase((t - UM.switchEnd) / 0.3) * (1 - umEase((t - 2.55) / 0.2));
      if (g) { c.x = umLerp(c.x, g.p.x, 0.45 * tk); c.y = umLerp(c.y, g.p.y, 0.45 * tk); c.z += 0.35 * tk; }
    }
  }
  else if (t < UM.slowEnd) { c.z = 3.2 + 0.25 * umEase((t - UM.slow0) / 1.3); c.x = face.x + s * r * 0.25; c.y = face.y; c.rot = 0.04 * s; }
  else if (t < UM.realEnd) { c.z = 3.0; c.x = O.x + Math.sin(t * 47) * 0.6; c.y = O.y - ro * 0.25 + Math.cos(t * 41) * 0.6; c.rot = -0.03 * s; }
  else if (t < UM.lookEnd) { c.z = 3.2 + 0.35 * umEase((t - UM.realEnd) / 0.65); c.x = face.x; c.y = face.y; }
  else if (t < UM.catchAt) { c.z = 2.1; c.x = Mid.x; c.y = Mid.y; }
  else if (t < UM.windup) { var K = umCatchPoint(f, F, m, ro * 0.3); c.z = 3.8 - 0.3 * umEase((t - UM.catchAt) / 0.23); c.x = K.x; c.y = K.y; c.lines = 1; }
  else if (t < UM.strike) {
    // Low and tilted: from his shoulder, down the arm, to the fist.
    var p = umEase((t - UM.windup) / (UM.strike - UM.windup)), sh = { x: F.x - s * r * 0.66, y: F.y - r * 0.3 }, fist = { x: F.x - s * r * 1.1, y: F.y - r * 0.72 };
    var at = p < 0.5 ? umLerpP(sh, { x: F.x - s * r * 0.95, y: F.y }, p * 2) : umLerpP({ x: F.x - s * r * 0.95, y: F.y }, fist, (p - 0.5) * 2);
    c.z = 2.9 - 0.45 * p; c.x = at.x; c.y = at.y + r * 0.35; c.rot = -0.14 * s; c.lines = 0.7 + 0.3 * p;
  }
  else if (t < UM.hit + 0.02 || !m.frameDone) { c.z = 2.3; c.x = Mid.x; c.y = Mid.y; c.lines = 1; }
  else {
    // Pulling back out over him to the whole arena as they fly.
    var q = umEase((t - UM.hit) / 0.45);
    c.z = umLerp(2.3, 1, q); c.x = umLerp(F.x, W / 2, q); c.y = umLerp(F.y, H / 2, q); c.rot = 0;
  }
  return c;
}

// End of draw(): the whole finished frame put through the camera, then the
// grade, the letterbox, speed lines, the title, and the impact frame.
// ox/oy/sc place the arena on the canvas.
var umBuf = null;
function fedorScreenCam(ox, oy, sc) {
  var f = umOwner();
  if (!f) return;
  var m = f.igbb, c = umCam(f, m), v = balls[m.vicId];
  var cw = canvas.width, ch = canvas.height;
  if (!umBuf) umBuf = document.createElement("canvas");
  if (umBuf.width !== cw || umBuf.height !== ch) { umBuf.width = cw; umBuf.height = ch; }
  var bx = umBuf.getContext("2d");
  bx.setTransform(1, 0, 0, 1, 0, 0); bx.clearRect(0, 0, cw, ch); bx.drawImage(canvas, 0, 0);
  // The point it's on, eased toward the middle of the screen as it zooms
  // out (so z = 1 is the normal frame), and never looking past the edge.
  var z = Math.max(1, c.z), toward = umClamp01((z - 1) / 0.3);
  var fx = umLerp(cw / 2, ox + sc * c.x, toward), fy = umLerp(ch / 2, oy + sc * c.y, toward);
  var vw = cw / z, vh = ch / z;
  fx = Math.min(cw - vw / 2, Math.max(vw / 2, fx)); fy = Math.min(ch - vh / 2, Math.max(vh / 2, fy));
  var rot = reduceMotion ? 0 : c.rot;
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = "#050507"; ctx.fillRect(0, 0, cw, ch);
  ctx.translate(cw / 2, ch / 2); ctx.rotate(rot); ctx.scale(z * (1 + Math.abs(rot) * 0.6), z * (1 + Math.abs(rot) * 0.6)); ctx.translate(-fx, -fy);
  ctx.drawImage(umBuf, 0, 0);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  // Muted colours, dark edges.
  if (c.grade > 0.01) {
    ctx.globalCompositeOperation = "saturation";
    ctx.fillStyle = "rgba(128,128,128," + 0.62 * c.grade + ")"; ctx.fillRect(0, 0, cw, ch);
    ctx.globalCompositeOperation = "source-over";
    var vg = ctx.createRadialGradient(cw / 2, ch / 2, Math.min(cw, ch) * 0.25, cw / 2, ch / 2, Math.max(cw, ch) * 0.62);
    var dark = m.t > UM.windup && m.t < UM.hit ? 0.8 : 0.55;
    vg.addColorStop(0, "rgba(0,0,0,0)"); vg.addColorStop(1, "rgba(0,0,0," + dark * c.grade + ")");
    ctx.fillStyle = vg; ctx.fillRect(0, 0, cw, ch);
  }
  if (c.lines > 0.01 && !reduceMotion) umFocusLines(cw, ch, c.lines, m.t);
  // Black bars top and bottom.
  var bar = ch * 0.085 * c.bars;
  if (bar > 0.5) { ctx.fillStyle = "#000"; ctx.fillRect(0, 0, cw, bar); ctx.fillRect(0, ch - bar, cw, bar); }
  umTitle(cw, ch, bar, m.t);
  // The impact frame: white, both of them black silhouettes, a crimson burst.
  if (m.impact && !m.frameDone && hitStop > 0) umImpactFrame(f, v, m, ox, oy, sc, z, rot, fx, fy, cw, ch);
  else if (m.impact && m.t < UM.hit + 0.25) { ctx.fillStyle = "rgba(255,255,255," + 0.7 * (1 - (m.t - UM.hit) / 0.25) + ")"; ctx.fillRect(0, 0, cw, ch); }
  ctx.restore();
}

// Manga focus lines rushing in from the edges toward the middle.
function umFocusLines(cw, ch, k, t) {
  var cx = cw / 2, cy = ch / 2, R = Math.hypot(cw, ch) / 2, n = 64;
  ctx.save();
  ctx.fillStyle = "rgba(0,0,0," + 0.55 * k + ")";
  for (var i = 0; i < n; i++) {
    var seed = Math.sin(i * 91.7 + Math.floor(t * 24) * 13.1) * 43758.5453; seed -= Math.floor(seed);
    var a = i / n * Math.PI * 2 + seed * 0.08, inner = R * (0.55 + seed * 0.25), w = 0.006 + seed * 0.01;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a - w) * R * 1.1, cy + Math.sin(a - w) * R * 1.1);
    ctx.lineTo(cx + Math.cos(a) * inner, cy + Math.sin(a) * inner);
    ctx.lineTo(cx + Math.cos(a + w) * R * 1.1, cy + Math.sin(a + w) * R * 1.1);
    ctx.fill();
  }
  ctx.restore();
}

// THE UNMOVING MAN in the bottom bar as the switch happens.
function umTitle(cw, ch, bar, t) {
  var k = umEase((t - 0.7) / 0.4) * (1 - umEase((t - 2.6) / 0.5));
  if (k <= 0.01 || bar < 10) return;
  ctx.save();
  ctx.globalAlpha = k;
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.font = "800 " + Math.round(bar * 0.42) + 'px "Barlow Condensed", "Arial Narrow", sans-serif';
  ctx.fillStyle = "#f2efe8";
  var txt = "THE UNMOVING MAN", sp = bar * 0.06, x = cw / 2 - (ctx.measureText(txt).width + sp * (txt.length - 1)) / 2;
  ctx.textAlign = "left";
  for (var i = 0; i < txt.length; i++) { ctx.fillText(txt[i], x, ch - bar / 2); x += ctx.measureText(txt[i]).width + sp; }
  ctx.fillStyle = UM_CRIMSON; ctx.fillRect(cw / 2 - bar * 0.5, ch - bar * 0.16, bar, 3);
  ctx.restore();
}

function umImpactFrame(f, v, m, ox, oy, sc, z, rot, fx, fy, cw, ch) {
  var p = 1 - hitStop / UM_FREEZE, s = m.s;
  ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, cw, ch);
  ctx.save();
  ctx.translate(cw / 2, ch / 2); ctx.rotate(rot); ctx.scale(z, z); ctx.translate(-fx, -fy);
  ctx.transform(sc, 0, 0, sc, ox, oy);
  var J = { x: v.x - s * v.r * 0.45 + (v.squash ? s * v.r * 0.1 : 0), y: v.y + v.r * 0.18 };
  // Crimson burst behind the hit.
  ctx.fillStyle = UM_CRIMSON;
  ctx.beginPath();
  for (var i = 0; i < 28; i++) {
    var a = i / 28 * Math.PI * 2, rr = (i % 2 ? 0.35 : 1) * v.r * (2.3 + 0.8 * Math.sin(i * 7.3)) * (0.75 + 0.35 * p);
    if (i) ctx.lineTo(J.x + Math.cos(a) * rr, J.y + Math.sin(a) * rr); else ctx.moveTo(J.x + Math.cos(a) * rr, J.y + Math.sin(a) * rr);
  }
  ctx.closePath(); ctx.fill();
  // The two of them, black.
  var fo = umFedorOff(m, f.r), F = { x: f.x + fo.x, y: f.y + fo.y }, r = f.r;
  ctx.fillStyle = "#000"; ctx.strokeStyle = "#000"; ctx.lineCap = "round"; ctx.lineJoin = "round";
  ctx.beginPath(); ctx.arc(F.x, F.y, r, 0, Math.PI * 2); ctx.fill();
  ctx.save(); ctx.translate(v.x, v.y); ctx.scale(0.72, 1.18); ctx.beginPath(); ctx.arc(0, 0, v.r, 0, Math.PI * 2); ctx.fill(); ctx.restore();
  ctx.lineWidth = r * 0.34;
  var sh = { x: F.x - s * r * 0.66, y: F.y - r * 0.3 };
  ctx.beginPath(); ctx.moveTo(sh.x, sh.y); ctx.lineTo(F.x + s * r * 0.4, F.y - r * 0.9); ctx.lineTo(J.x, J.y); ctx.stroke();
  ctx.beginPath(); ctx.arc(J.x, J.y, r * 0.36, 0, Math.PI * 2); ctx.fill();
  // His other hand still holding their fist.
  var K = umCatchPoint(f, F, m, v.r * 0.3);
  ctx.lineWidth = r * 0.3;
  ctx.beginPath(); ctx.moveTo(F.x + s * r * 0.66, F.y - r * 0.3); ctx.lineTo(K.x, K.y); ctx.stroke();
  ctx.beginPath(); ctx.arc(K.x, K.y, r * 0.32, 0, Math.PI * 2); ctx.fill();
  // Shockwave rings from the point of contact.
  ctx.strokeStyle = "#000";
  [0, 0.35].forEach(function (d, j) {
    var k = umClamp01(p * 1.3 - d);
    if (k <= 0) return;
    ctx.globalAlpha = 1 - k * 0.6; ctx.lineWidth = (j ? 3 : 6) * (1 - k) + 1.5;
    ctx.beginPath(); ctx.arc(J.x, J.y, v.r * (0.6 + 3.2 * k), 0, Math.PI * 2); ctx.stroke();
  });
  ctx.restore();
}

// ---------------------------------------------------------------- sound
// All made in code (fdAudio and the strike bus from fedor.js / audio.js).

// The arena's crowd sinks away (or comes back) under the move.
function umCrowdDown(level, tc) {
  try {
    var c = typeof crowd !== "undefined" ? crowd : null;
    if (!c || !c.gain) return;
    var now = audioCtx.currentTime;
    c.duckUntil = now + 30;
    c.gain.gain.cancelScheduledValues(now);
    c.gain.gain.setTargetAtTime(Math.max(0.0001, level * CROWD_FLOOR), now, tc);
  } catch (e) { /* never let audio break the game */ }
}
function umCrowdBack() {
  try {
    var c = typeof crowd !== "undefined" ? crowd : null;
    if (c) c.duckUntil = audioCtx.currentTime; // tickCrowd takes it back up, slowly
  } catch (e) { /* never let audio break the game */ }
}

// Everything the move does with sound, as its moments pass.
function umSounds(self, other, m, prev) {
  var t = m.t;
  function at(x) { return prev < x && t >= x; }
  // A heartbeat under it: slow while he dodges, gone in the slow motion,
  // racing while they realise (theirs).
  var beatGap = t < UM.slow0 + 0.3 ? 0.82 : 0.52;
  var beating = (t > 0.5 && t < UM.slow0 + 0.3) || (t > UM.slowEnd && t < UM.catchAt);
  if (beating && t >= m.beat) { playUmHeart(t > UM.slowEnd ? 0.8 : 0.55); m.beat = t + beatGap; }
  if (!beating && m.beat < t) m.beat = t;
  if (at(1.6)) playUmNeck();
  if (at(UM.slow0)) umCrowdDown(0.02, 0.25);
  UM_STRIKES.forEach(function (st) {
    var go = st.hit - st.tt;
    if (at(go)) { if (st.slow) playUmSlowAir(st.tt + 0.3); else { playUmAir(st.k === "hook" ? 0.9 : 0.75); playUmBreath(0.35 + 0.5 * (st.hit - 2) / 3, false); } }
    if (at(st.hit - 0.05) && !st.slow) playUmCloth();
  });
  if (at(UM.slowEnd)) { umCrowdDown(0.08, 0.3); playUmBreath(1, true); }
  if (at(UM.slowEnd + 0.38)) playUmBreath(0.9, true);
  if (at(UM.punch)) { playUmAir(1); playUmBreath(1, false); }
  if (at(UM.catchAt)) { playUmCatch(); umCrowdDown(0.005, 0.05); if (!reduceMotion) shake = Math.max(shake, 7); }
  if (at(UM.windup)) playUmRiser(UM.strike - UM.windup - 0.32);
  if (at(UM.strike)) playUmAir(1.2);
  if (at(UM.shake + 0.05)) playUmStep(0.5);
  if (at(UM.guard - 0.1)) playUmStep(0.4);
}

function umNoise(ac) { if (!umNoise.buf || umNoise.buf.sampleRate !== ac.sampleRate) umNoise.buf = makeNoiseBuffer(ac, 1.5); return umNoise.buf; }
// A filtered noise sweep (from f0 to f1 Hz) with a quick swell.
function umSweep(ac, t, f0, f1, q, peak, att, dur, out) {
  var s = ac.createBufferSource(); s.buffer = umNoise(ac);
  var f = ac.createBiquadFilter(); f.type = "bandpass"; f.Q.value = q;
  f.frequency.setValueAtTime(f0, t); f.frequency.exponentialRampToValueAtTime(f1, t + dur);
  var g = ac.createGain();
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + att); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  s.connect(f); f.connect(g); g.connect(out || strikeOut(ac));
  s.start(t, nativeRandom() * 0.3); s.stop(t + dur + 0.05);
}
function umTone(ac, t, type, f0, f1, peak, att, dur, out) {
  var o = ac.createOscillator(), g = ac.createGain();
  o.type = type; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + dur);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + att); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g); g.connect(out || strikeOut(ac)); o.start(t); o.stop(t + dur + 0.05);
}
// Lub-dub.
function playUmHeart(v) {
  fdAudio(function (ac, t) {
    umTone(ac, t, "sine", 62, 38, 0.3 * v, 0.012, 0.2);
    umTone(ac, t + 0.17, "sine", 56, 34, 0.21 * v, 0.012, 0.18);
  });
}
// The small neck adjustment: a dry click.
function playUmNeck() { fdAudio(function (ac, t) { umSweep(ac, t, 2400, 1600, 6, 0.25, 0.002, 0.04); umSweep(ac, t + 0.06, 2000, 1400, 6, 0.18, 0.002, 0.04); }); }
// A punch cutting the air past his head.
function playUmAir(v) { fdAudio(function (ac, t) { umSweep(ac, t, 1500, 5200, 2.2, 0.32 * v, 0.07, 0.22); }); }
// The same in slow motion: long and low.
function playUmSlowAir(dur) { fdAudio(function (ac, t) { umSweep(ac, t, 400, 1300, 1.6, 0.22, dur * 0.6, dur); }); }
// His shirtless shoulders: a soft brush of movement as he slips.
function playUmCloth() { fdAudio(function (ac, t) { umSweep(ac, t, 700, 1100, 0.9, 0.08, 0.03, 0.12); }); }
// Their breathing: a short exhale, or (heavy) a ragged in-and-out.
function playUmBreath(v, heavy) {
  fdAudio(function (ac, t) {
    if (heavy) { umSweep(ac, t, 900, 1300, 1.1, 0.13 * v, 0.22, 0.42); umSweep(ac, t + 0.42, 1300, 700, 1.1, 0.17 * v, 0.05, 0.35); }
    else umSweep(ac, t, 1400, 800, 1.2, 0.11 * v, 0.02, 0.2);
  });
}
// The catch: a hard, almost metallic clap and a deep bass ring.
function playUmCatch() {
  fdAudio(function (ac, t) {
    umSweep(ac, t, 2600, 1800, 3, 0.7, 0.001, 0.09);
    [[880, 0.16, 0.7], [1327, 0.1, 0.55], [2210, 0.06, 0.4], [3170, 0.035, 0.3]].forEach(function (p) { umTone(ac, t, "triangle", p[0], p[0] * 0.985, p[1], 0.002, p[2]); });
    umTone(ac, t, "sine", 72, 34, 0.9, 0.004, 1.4);
    umTone(ac, t, "sine", 144, 70, 0.25, 0.004, 0.6);
  });
}
// Drawing the right hand back: a low swell that cuts dead before the hit.
function playUmRiser(dur) {
  fdAudio(function (ac, t) {
    var o = ac.createOscillator(), g = ac.createGain();
    o.type = "sawtooth"; o.frequency.setValueAtTime(41, t); o.frequency.linearRampToValueAtTime(55, t + dur);
    var f = ac.createBiquadFilter(); f.type = "lowpass"; f.frequency.setValueAtTime(120, t); f.frequency.linearRampToValueAtTime(420, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.18, t + dur * 0.9); g.gain.setValueAtTime(0.18, t + dur); g.gain.linearRampToValueAtTime(0.0001, t + dur + 0.02);
    o.connect(f); f.connect(g); g.connect(strikeOut(ac)); o.start(t); o.stop(t + dur + 0.05);
    umSweep(ac, t, 300, 900, 1, 0.1, dur * 0.9, dur);
  });
}
// The overhand landing: an enormous sub hit, a distorted crack and the
// shockwave rolling out.
function playUmImpact() {
  fdAudio(function (ac, t) {
    var out = strikeOut(ac);
    var ws = ac.createWaveShaper(), curve = new Float32Array(1024);
    for (var i = 0; i < 1024; i++) { var x = i / 511.5 - 1; curve[i] = Math.tanh(x * 6); }
    ws.curve = curve;
    var dg = ac.createGain(); dg.gain.value = 0.55; ws.connect(dg); dg.connect(out);
    umTone(ac, t, "sine", 95, 26, 1.0, 0.003, 2.0);
    umTone(ac, t, "sine", 190, 45, 0.5, 0.003, 0.7);
    umTone(ac, t, "square", 70, 30, 0.35, 0.003, 0.5, ws);
    umSweep(ac, t, 3000, 300, 0.7, 0.9, 0.002, 0.5, ws);
    umSweep(ac, t + 0.02, 6000, 180, 0.6, 0.45, 0.01, 1.3);
    if (typeof playSlam === "function") playSlam();
  });
}
// A foot set down on the mat.
function playUmStep(v) { fdAudio(function (ac, t) { umTone(ac, t, "sine", 90, 50, 0.22 * v, 0.004, 0.12); umSweep(ac, t, 500, 300, 1, 0.06 * v, 0.004, 0.08); }); }

// ---------------------------------------------------------------- the card

function unmovingSpecialInfo(sp) {
  return "Hands down, feet still, he slips everything they throw: a hook, another hook, an uppercut, straights, the last one in slow motion past his eye. Then he catches their final punch in one glove and puts them through the cage with one overhand right for " +
    (sp.damage || 150) + " (and " + (sp.slamDamage != null ? sp.slamDamage : 10) + " off the cage). Goes off when the bar's full and they're in front of him throwing.";
}
