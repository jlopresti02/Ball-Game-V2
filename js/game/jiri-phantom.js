// Jiří Procházka's imaginary cut (Joe, 2026-11-17), after Musashi in Baki:
// he cuts with a sword that isn't there so perfectly that they feel
// themselves cut in half. Only outside his samurai special. Numbers under
// `prochazka.phantom` in his character file (leave it out and it's off).
//
//   first, every  [min, max] seconds until the first one, then between them
//   range         [min, max] gap to them it goes off from
//   stance        seconds in the stance: both gloves on a hilt at his hip
//                 and a see-through katana in them (the tell: "!")
//   cut           seconds for the cut: one two-handed sweep, the ghost blade
//                 reaching all the way across to them
//   after         seconds holding the follow-through before the ghost blade
//                 fades, and a sheathe click
//   stun          seconds they're frozen in pain afterwards ("STUNNED!"),
//                 while he comes in with a combination (combos.js)
//
// It does no damage. They see the see-through blade go through them and
// their own two halves slide apart (see-through, no blood, nothing inside),
// then snap back together: they're whole, but they can't move for `stun`.
// Hit him during the stance and it's off. Only his own two arms.
"use strict";

var jpPhantoms = []; // the ghost halves over whoever felt it: { id, ang, t }
var JP_PH_GHOST = 0.95;

function jpPhCfg(b) { var c = jpCfg(b); return c && c.phantom; }
function resetJiriPhantom() { jpPhantoms = []; }

// From the abilities loop (abilities.js): true while the imaginary cut has him.
function updateJiriPhantom(self, other, dt) {
  var c = jpPhCfg(self);
  if (!c || !self.alive) return false;
  var P = self.jpPh;
  if (!P) {
    if (samuraiOn(self) || self.igbb || !(self.jpPhT <= 0)) return false; // (never in samurai mode; the clock runs in tickJiriPhantom)
    var gap = Math.hypot(other.x - self.x, other.y - self.y) - self.r - other.r, rg = c.range || [20, 230];
    if (gap < rg[0] - 10 || gap > rg[1] || !jpHandsFree(self) || !inOrdinaryMovement(self) || specialBusy(self) || self.checkStun > 0 ||
        !other.alive || other.koOut || other.igbb || specialBusy(other) || !inOrdinaryMovement(other) || swordDuelActive() || over) { self.jpPhT = 0.4; return false; }
    self.jpPhT = jpRand(c.every || [14, 22]);
    self.jpPh = P = { phase: "stance", t: 0, hp: self.hp, ang: Math.atan2(other.y - self.y, other.x - self.x) };
    floater(self.x, self.y - self.r - 30, "!", "crit");
    playSamuraiGlint(false);
  }
  P.t += dt;
  self.vx = 0; self.vy = 0;
  if (!other.alive || over || self.slam || self.grappled || subLocked(self)) { self.jpPh = null; return false; }
  if (P.phase === "stance") {
    P.ang = Math.atan2(other.y - self.y, other.x - self.x); // tracking them
    if (self.hp < P.hp - 0.5) { self.jpPh = null; return false; } // hit out of it
    if (P.t >= (c.stance || 0.55)) { P.phase = "cut"; P.t = 0; playElbowSwish(true); }
    return true;
  }
  if (P.phase === "cut") {
    P.len = Math.hypot(other.x - self.x, other.y - self.y) + other.r * 1.2;
    if (!P.hit && P.t >= (c.cut || 0.14) * 0.5) { P.hit = true; jpPhantomLands(self, other, c, P); }
    if (P.t >= (c.cut || 0.14)) { P.phase = "after"; P.t = 0; }
    return true;
  }
  if (P.t >= (c.after || 0.5)) {
    playSheatheClick();
    self.jpPh = null;
    if (self.char.combos) self.cmbT = 0.05; // straight in after it (combos.js)
    return false;
  }
  return true;
}

// Through them: they feel it.
function jpPhantomLands(self, other, c, P) {
  if (!other.alive || other.koOut || other.igbb) return;
  clearActions(other);
  other.vx = 0; other.vy = 0;
  other.checkStun = Math.max(other.checkStun || 0, c.stun || 1.6);
  other.jpPainT = c.stun || 1.6;
  other.flash = 0.2;
  jpPhantoms.push({ id: other.id, ang: P.ang + Math.PI / 2 + 0.35, t: 0, done: false });
  floater(other.x, other.y - other.r - 34, "CUT IN HALF?!", "crit");
  playSamuraiTaiko();
  hitStop = Math.max(hitStop, 0.12);
  if (!reduceMotion) shake = Math.max(shake, 12);
  crowdReact(1);
}

// From tickProchazka (prochazka.js): the ghosts, and them trembling in pain.
function tickJiriPhantom(dt) {
  jpPhantoms.forEach(function (g) {
    g.t += dt;
    var o = balls[g.id];
    if (!g.done && g.t >= JP_PH_GHOST * 0.6 && o && o.alive) { g.done = true; floater(o.x, o.y - o.r - 34, "STUNNED!", "crit"); }
  });
  jpPhantoms = jpPhantoms.filter(function (g) { return g.t < JP_PH_GHOST; });
  balls.forEach(function (o) {
    var c = jpPhCfg(o);
    if (c && started && !over && o.alive && !o.jpPh) { if (o.jpPhT == null) o.jpPhT = jpRand(c.first || [8, 14]); else if (o.jpPhT > 0) o.jpPhT -= dt; }
    if (!(o.jpPainT > 0)) return;
    o.jpPainT -= dt;
    if (!o.alive || o.checkStun <= 0) { o.jpPainT = 0; return; }
    o.jpPainK = (o.jpPainK || 0) + 1; // trembling with it
    if (!reduceMotion) o.x += (o.jpPainK % 2 ? 1 : -1) * 2.2;
  });
}

// ---------------------------------------------------------------- drawing

// From prochazkaHandsBusy (prochazka.js).
function jpPhantomBusy(b) { return !!b.jpPh; }

// The ghost katana: see-through steel with a soft glow, flickering.
function jpGhostBlade(h, a, len, alpha) {
  if (alpha <= 0 || len <= 0) return;
  var tip = { x: h.x + Math.cos(a) * len, y: h.y + Math.sin(a) * len };
  ctx.save(); ctx.lineCap = "round";
  var fl = reduceMotion ? 1 : 0.85 + 0.15 * Math.sin(jpClock * 47);
  ctx.globalAlpha = 0.25 * alpha * fl; ctx.strokeStyle = "#bfe8ff"; ctx.lineWidth = 18;
  ctx.beginPath(); ctx.moveTo(h.x, h.y); ctx.lineTo(tip.x, tip.y); ctx.stroke();
  ctx.globalAlpha = 0.45 * alpha * fl; ctx.strokeStyle = "#e9f7ff"; ctx.lineWidth = 7;
  ctx.beginPath(); ctx.moveTo(h.x, h.y); ctx.lineTo(tip.x, tip.y); ctx.stroke();
  ctx.globalAlpha = 0.8 * alpha * fl; ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(h.x, h.y); ctx.lineTo(tip.x, tip.y); ctx.stroke();
  // a see-through guard and grip
  ctx.globalAlpha = 0.4 * alpha * fl; ctx.strokeStyle = "#e9f7ff"; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.ellipse(h.x, h.y, 4, 9, a, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(h.x, h.y); ctx.lineTo(h.x - Math.cos(a) * 20, h.y - Math.sin(a) * 20); ctx.stroke();
  ctx.restore();
}

// One of his own arms out to `hand` (shoulder, a slight bend, the glove).
function jpPhArm(b, ang, s, hand, gang) {
  var r = b.r, limb = ((b.char.punch && b.char.punch.size) || 14) * 0.7;
  var sh = jpAt(b, ang + s * 1.2, 0.62);
  var mx = (sh.x + hand.x) / 2, my = (sh.y + hand.y) / 2, ex = hand.x - sh.x, ey = hand.y - sh.y, el = Math.sqrt(ex * ex + ey * ey) || 1;
  var elb = { x: mx - ey / el * s * r * 0.16, y: my + ex / el * s * r * 0.16 };
  strokeLimb(limb, armColor(b.char, s), function () { ctx.moveTo(sh.x, sh.y); ctx.quadraticCurveTo(elb.x, elb.y, hand.x, hand.y); });
  drawGloveAt(hand.x, hand.y, limb * 0.72, b.char, gang);
}

// From drawProchazka (prochazka.js): both gloves on the hilt of a sword that
// isn't there, the stance, the cut and the follow-through.
function jpDrawPhantom(b) {
  var P = b.jpPh;
  if (!P || samuraiOn(b)) return false;
  var c = jpPhCfg(b) || {}, ang = P.ang, ha, ba, len = b.r * 1.9, alpha = 1, trail = 0;
  if (P.phase === "stance") {
    var u = jpEase(P.t / ((c.stance || 0.55) * 0.5));
    ha = jpLerpA(ang + 0.6, ang - 1.15, u);          // hands to his hip
    ba = jpLerpA(ang - 0.3, ang - 2.5, u);           // the blade back behind him
    alpha = Math.min(1, P.t / 0.25);
  } else if (P.phase === "cut") {
    var v = jpEaseOut(P.t / (c.cut || 0.14));
    ha = ang - 1.15 + 2.3 * v;
    ba = ang - 2.5 + 3.9 * v;
    len = Math.max(len, P.len || len);
    trail = 1;
  } else {
    var w = P.t / (c.after || 0.5);
    ha = ang + 1.15; ba = ang + 1.4;
    alpha = Math.max(0, 1 - w * 1.4);
  }
  var hand = jpAt(b, ha, 1.0), off = { x: Math.cos(ba) * b.r * 0.2, y: Math.sin(ba) * b.r * 0.2 };
  if (trail) {
    // the arc it swept, see-through
    ctx.save(); ctx.globalAlpha = 0.3; ctx.strokeStyle = "#e9f7ff"; ctx.lineWidth = 10; ctx.lineCap = "round";
    ctx.beginPath(); ctx.arc(b.x, b.y, len * 0.9, ang - 1.3, ba - 0.1); ctx.stroke(); ctx.restore();
  }
  jpGhostBlade({ x: hand.x + off.x, y: hand.y + off.y }, ba, len, alpha);
  // both hands on the one hilt, one ahead of the other
  jpPhArm(b, ang, -1, hand, ba);
  jpPhArm(b, ang, 1, { x: hand.x + off.x, y: hand.y + off.y }, ba);
  return true;
}

// From draw() over the fighters (draw.js): their two see-through halves
// sliding apart along the cut, then back together.
function drawJiriPhantomOver() {
  jpPhantoms.forEach(function (g) {
    var o = balls[g.id];
    if (!o || !o.char.look) return;
    var u = g.t / JP_PH_GHOST, open = u < 0.55 ? jpEaseOut(u / 0.3) : Math.max(0, 1 - (u - 0.55) / 0.25);
    var cx = Math.cos(g.ang), cy = Math.sin(g.ang), nx = -cy, ny = cx, R = o.r * 3;
    var alpha = (u < 0.8 ? 0.6 : 0.6 * (1 - (u - 0.8) / 0.2));
    [-1, 1].forEach(function (s) {
      var sep = o.r * 0.35 * open;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(nx * s * sep, ny * s * sep);
      ctx.beginPath();
      ctx.moveTo(o.x - cx * R, o.y - cy * R); ctx.lineTo(o.x + cx * R, o.y + cy * R);
      ctx.lineTo(o.x + cx * R + nx * s * R, o.y + cy * R + ny * s * R); ctx.lineTo(o.x - cx * R + nx * s * R, o.y - cy * R + ny * s * R);
      ctx.closePath(); ctx.clip();
      drawFighterArt(ctx, o.x, o.y, o.r, o.char.look, theme.wall, { layout: "contained", name: o.char.name });
      ctx.strokeStyle = "rgba(233,247,255,0.95)"; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(o.x - cx * o.r * 1.2, o.y - cy * o.r * 1.2); ctx.lineTo(o.x + cx * o.r * 1.2, o.y + cy * o.r * 1.2); ctx.stroke();
      ctx.restore();
    });
    // the line the blade that wasn't there left across them
    if (u < 0.4) {
      ctx.save(); ctx.globalAlpha = 1 - u / 0.4; ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 4; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(o.x - cx * o.r * 1.6, o.y - cy * o.r * 1.6); ctx.lineTo(o.x + cx * o.r * 1.6, o.y + cy * o.r * 1.6); ctx.stroke();
      ctx.restore();
    }
  });
}

// The fighter card's move list (gallery.js).
function jpPhantomGalleryMove(p, add) {
  var c = p && p.phantom;
  if (c) add("👻", "Imaginary cut", "Outside samurai mode, now and then he cuts with a see-through katana that isn't there, like Musashi in Baki. No damage, but they feel cut in half and are frozen in pain for " + c.stun + "s while he comes in.");
}
