// Getting back up (Christian, 2026-11-14): a striker who gets taken down or
// pinned under ground and pound doesn't always have to lie there and take
// it. Bigger, stronger men and good wrestlers get back to their feet: a
// scramble on the mat (or a wall walk up the cage, or a big man heaving the
// guy off), then a big "BACK UP!", and the fight's back on the feet.
//
// A fighter opts in with a "getUp" block in its character file (every key
// can be left out; the defaults are in GETUP_DEFAULTS). Fighters without
// one are untouched: nothing here runs for them and no dice are rolled.
//
//   "getUp": { "size": 20, "wrestling": 85, "cut": 0.7, "reset": 2, "shot": 8 }
//
// size        0-100: how big and strong he is (Ngannou 95).
// wrestling   0-100: how good his wrestling and scrambles are (Ilia 85).
// chance      extra % added on top of the ratings (default 0).
//               The chance to get up from each takedown or pin is the
//               better of size and wrestling plus a quarter of the other
//               (big OR a good wrestler is enough), plus `chance`, then:
// weight      true (default): scaled by the weight classes, the same way
//               every grappling exchange is (weight.js): up to 1.7x against
//               a much smaller man, down to 0.3x against a much bigger one.
// vsGrappler  times this when the man on top is a Grappler (Khabib, GSP,
//               DC, Jon): they're hard to get out from under. Default 0.8.
// max         the chance never goes over this % (default 85).
// cut         how much of the time he'd spend on the ground a get-up saves
//               (0.7: he's up after 30% of it). Default 0.6.
// scramble    seconds of visible scrambling before he's up (the end of that
//               30%, not extra time). Default 0.35.
// cooldown    seconds after a get-up before the next one can happen (3).
// limit       most get-ups in one fight (0 = no limit, the default).
// reset       seconds after a get-up the man who had him down can't grab
//               him again (the Iowa Style impunity, grapple-duel.js). 1.5.
// shot        a parting shot on the way up: this much damage to the man on
//               top, if he's still in reach (0 = none, the default).
// push        how fast he springs up and away (default 340).
// shove       how hard the man on top is thrown off him (default 220).
// style       "auto" (default): the bigger rating picks the look. Size:
//               "explode" (POWER UP!). Wrestling: "wallwalk" (WALL WALK!)
//               when he's pinned against the cage, otherwise "scramble"
//               (SCRAMBLE!). Or set one of the three.
// text        the big word when he's up (default "BACK UP!").
// covers      which ground situations it works in (default: all of them):
//   "takedown"        the regular takedown, the ragdoll throw (toss.js):
//                     instead of bouncing twice on the mat he pops straight
//                     up, and the reset stops the grappler chaining another
//                     one straight away
//   "fathersPlan"     Khabib's Father's Plan, on the mat (special.js)
//   "groundAndPound"  any ground and pound built on the guillotine's
//                     (bjj.js): Jon Jones's, Fedor's after his throw (and
//                     then no armbar), a passed guard, a failed guillotine
//   "elbows"          Tony Ferguson's ground elbows after his takedown
//   "slam"            lying under Daniel Cormier after his Super Slam
//   "knockdown"       knocked flat (Ngannou's Smash, Joshua Van's hook)
//   "throw"           the moment on the mat after a suplex, Fedor's Sambo
//                     throw or Jon's inside trip
//
// Not covered on purpose: the Grappler's finisher (the last punch is the
// kill), submissions (they have their own escapes), and wall slams (he's
// flying, not down).
//
// The dice: ONE roll when a hold starts (seeded with the fight, like every
// roll in update). If it says yes, he's up `cut` of the way through it.
//
// API: tickGetUp(dt) from update(), drawGetUp() from draw(), resetGetUp()
// from startMatchSeeded(), getUpHold(b) (the hold he's in right now, or
// null), getUpChance(b, top, cfg, kind), getUpGalleryMoves(ch, add).
// getUpStats counts holds, rolls and get-ups by kind (for the test harness).
"use strict";

var GETUP_DEFAULTS = {
  size: 0, wrestling: 0, chance: 0, weight: true, vsGrappler: 0.8, max: 85,
  cut: 0.6, scramble: 0.35, cooldown: 3, limit: 0, reset: 1.5, shot: 0,
  push: 340, shove: 220, style: "auto", text: "BACK UP!",
  covers: ["takedown", "fathersPlan", "groundAndPound", "elbows", "slam", "knockdown", "throw"]
};
var GETUP_STYLE_TEXT = { scramble: "SCRAMBLE!", wallwalk: "WALL WALK!", explode: "POWER UP!" };
var GETUP_QUICK = { takedown: true, throw: true }; // over in a blink: no call before BACK UP!, just the meter and the dust
var GETUP_WALL = 10;       // px from the cage that counts as pinned against it
var GETUP_REACH = 50;      // the parting shot lands if he's this close (past touching)
var getUpStats = { holds: {}, rolls: 0, ups: {}, saved: 0 };
var getUpFx = [];

function resetGetUp() { getUpFx = []; }
function getUpCfg(b) { return (b && b.char && b.char.getUp) || null; }
function getUpVal(c, k) { return c[k] != null ? c[k] : GETUP_DEFAULTS[k]; }
function guRand() { return typeof nativeRandom === "function" ? nativeRandom() : Math.random(); } // looks only

// How long a run of ground and pound punches has left (Father's Plan and the
// guillotine's ground and pound share the punch timing, special.js/bjj.js).
function guPunchesLeft(mountLeft, gp, notThrown, lastWind) {
  var left = Math.max(0, mountLeft);
  if (gp) left += Math.max(0, gp.wind + FP_STRIKE + FP_RECOIL - gp.t);
  if (notThrown > 0) left += notThrown * (FP_WIND + FP_STRIKE + FP_RECOIL) + (lastWind - FP_WIND);
  return left;
}

// The hold `b` is in right now, if it's one a get-up works on:
// { kind, sub, ref (the hold's own state object), top (the other fighter),
//   left (about how many seconds of it are left) }, or null.
function getUpHold(b) {
  var o = balls[1 - b.id];
  if (!o || !b.alive) return null;
  var m = o.igbb, g = b.guillo, t;
  if (m && m.move === "fathersplan" && b.shelled && (m.phase === "mount" || m.phase === "pound")) {
    var sp = o.char.special || {};
    return { kind: "fathersPlan", ref: m, top: o,
      left: guPunchesLeft(m.phase === "mount" ? FP_MOUNT_TIME - m.t : 0, m.gp, (sp.punches || 5) - (m.phase === "pound" ? m.thrown || 0 : 0), FP_WIND_LAST) };
  }
  if (g && g.hits && (g.phase === "mount" || g.phase === "pound") && balls[g.atkId] === o) {
    return { kind: "groundAndPound", ref: g, top: o,
      left: guPunchesLeft(g.phase === "mount" ? GNP_MOUNT_TIME - g.t : 0, g.gp, g.hits.length - (g.phase === "pound" ? g.thrown || 0 : 0), FP_WIND_LAST * 0.8) };
  }
  t = o.tfSub;
  if (t && t.kind === "elbows" && t.phase === "pound" && t.vicId === b.id) {
    var ge = (o.char.ferguson && o.char.ferguson.groundElbows) || {};
    return { kind: "elbows", ref: t, top: o, left: Math.max(0, (t.count || 4) - (t.n || 0)) * (ge.gap || 0.32) + 0.3 };
  }
  if (m && m.move === "dcslam" && m.phase === "down" && m.vic === b.id && b.dcHeld) {
    var dl = (o.char.cormier && o.char.cormier.doubleLeg) || {};
    return { kind: "slam", ref: m, top: o, left: Math.max(0, (dl.downTime || 1.2) - m.t) };
  }
  if (b.ngDown && b.dazed === true) return { kind: "knockdown", ref: b.ngDown, top: o, left: Math.max(0, b.ngDown.t) };
  if (o.suplex && o.suplex.vicId === b.id && o.suplex.phase === "down") {
    return { kind: "throw", sub: "suplex", ref: o.suplex, top: o, left: Math.max(0, SUPLEX_DOWN_TIME - o.suplex.t) };
  }
  var fa = o.fd && o.fd.act;
  if (fa && fa.vicId === b.id && fa.phase === "down") {
    return { kind: "throw", sub: "fedor", ref: fa, top: o, left: Math.max(0, FD_DOWN - fa.t) };
  }
  t = o.jcl;
  if (t && t.vicId === b.id && t.phase === "down") {
    var tc = (o.char.jonClinch && o.char.jonClinch.trip) || {};
    return { kind: "throw", sub: "jon", ref: t, top: o, left: Math.max(0, (tc.down || 0.5) - t.t) };
  }
  if (!b.grappled && !b.choked && !b.shelled) {
    for (var i = 0; i < tossFx.length; i++) { // bouncing on the mat after the regular takedown (toss.js)
      var f = tossFx[i];
      if (f.kind === "bounce" && f.id === b.id) return { kind: "takedown", ref: f, top: o, left: Math.max(0, f.dur - f.t) };
    }
  }
  return null;
}

// % chance `b` gets up from this hold.
function getUpChance(b, top, c, kind) {
  var p = guRating(c) + getUpVal(c, "chance");
  if (kind !== "knockdown") { // (a knockdown has nobody holding him down)
    if (getUpVal(c, "weight")) p *= grappleScale(b, top);
    if (top.char.hasGrapple) p *= getUpVal(c, "vsGrappler");
  }
  return Math.max(0, Math.min(getUpVal(c, "max"), p));
}

// The better of size and wrestling, plus a quarter of the other.
function guRating(c) {
  var sz = getUpVal(c, "size"), wr = getUpVal(c, "wrestling");
  return Math.max(sz, wr) + Math.min(sz, wr) / 4;
}

function getUpByWall(b) {
  return b.x - b.r < GETUP_WALL || W - b.x - b.r < GETUP_WALL || b.y - b.r < GETUP_WALL || H - b.y - b.r < GETUP_WALL;
}

function getUpStyle(b, c) {
  var st = getUpVal(c, "style");
  if (st !== "auto") return st;
  if (getUpVal(c, "size") > getUpVal(c, "wrestling")) return "explode";
  return getUpByWall(b) ? "wallwalk" : "scramble";
}

// From update(), after everyone's moves: rolls when a hold starts, runs the
// scramble, and gets him up.
function tickGetUp(dt) {
  for (var i = 0; i < getUpFx.length; i++) getUpFx[i].t += dt;
  if (getUpFx.length) getUpFx = getUpFx.filter(function (f) { return f.t < f.dur; });
  balls.forEach(function (b) {
    var c = getUpCfg(b);
    if (!c) return;
    if (b.getUpCd > 0) b.getUpCd -= dt;
    var h = started && !over && !b.koOut ? getUpHold(b) : null;
    if (!h || !h.top.alive) { b.getUp = null; return; } // the hold's over: whatever he had planned is off
    var s = b.getUp;
    if (s && s.ref !== h.ref) s = b.getUp = null;
    if (!s) {
      if (b.getUpRef === h.ref) return; // already rolled for this one
      b.getUpRef = h.ref;
      getUpStats.holds[h.kind] = (getUpStats.holds[h.kind] || 0) + 1;
      var lim = getUpVal(c, "limit");
      if (getUpVal(c, "covers").indexOf(h.kind) < 0 || b.getUpCd > 0 || (lim > 0 && (b.getUpN || 0) >= lim)) return;
      getUpStats.rolls++;
      if (Math.random() * 100 >= getUpChance(b, h.top, c, h.kind)) return;
      var upIn = h.left * (1 - Math.max(0, Math.min(1, getUpVal(c, "cut"))));
      b.getUp = { ref: h.ref, kind: h.kind, t: 0, upAt: upIn, scrAt: Math.max(0, upIn - getUpVal(c, "scramble")),
        phase: "wait", style: null, dust: 0, saved: h.left - upIn };
      return;
    }
    s.t += dt;
    if (s.phase === "wait" && s.t >= s.scrAt) {
      s.phase = "scramble";
      s.style = getUpStyle(b, c);
      if (!GETUP_QUICK[s.kind]) {
        floater(b.x, b.y - b.r - 22, GETUP_STYLE_TEXT[s.style] || "SCRAMBLE!", "dodge");
        playWhoosh();
      }
    }
    if (s.phase === "scramble" && !reduceMotion) {
      s.dust -= dt;
      if (s.dust <= 0) { // feet and hands scrabbling: dust kicked out to the sides
        s.dust = 0.06;
        var side = guRand() < 0.5 ? -1 : 1, sp = 90 + guRand() * 140;
        particles.push({ x: b.x + side * b.r * 0.8, y: b.y + b.r * 0.6, vx: side * sp, vy: -40 - guRand() * 80,
          life: 0.3, max: 0.3, size: 2.5 + guRand() * 3, color: guRand() < 0.4 ? "#ffffff" : "#cfc4ae" });
      }
    }
    if (s.t >= s.upAt) getUpNow(b, h, c, s);
  });
}

// Ends the hold he's in, the same way each move lets go on its own.
function getUpRelease(b, h) {
  var top = h.top, m = h.ref;
  if (h.kind === "fathersPlan") {
    m.gp = null; b.shelled = false;
    m.phase = "retreat"; m.t = 0; // Khabib backs off, like when they survive it
  } else if (h.kind === "groundAndPound") {
    if (m.fedor) m.fdArmbar = false; // (Fedor goes for the armbar when the punches stop, fedor.js)
    releaseGuillotine(b, top, m);
  } else if (h.kind === "elbows") {
    endTfSub(top); top.elbowAnim = null;
  } else if (h.kind === "slam") {
    dcEndSlam(top, b);
  } else if (h.kind === "knockdown") {
    b.ngDown = null; b.dazed = false;
  } else if (h.sub === "suplex") {
    endSuplex(top);
    top.suplexCd = top.char.suplex ? top.char.suplex.cooldown : 0;
    if (top.char.grapple) top.grappleCd = top.char.grapple.cooldown;
  } else if (h.sub === "fedor") {
    fdEndAct(top, b, top.fd);
  } else if (h.sub === "jon") {
    endJonClinch(top, "tripped");
  } else if (h.kind === "takedown") {
    tossSkipBounce(b); // up, no more bouncing (toss.js)
    tossFx.forEach(function (f) { if (f.kind === "word") f.t = Math.max(f.t, f.dur * 0.8); }); // THROWN! fades as BACK UP! comes in
  }
}

function getUpNow(b, h, c, s) {
  var top = h.top;
  getUpRelease(b, h);
  b.getUp = null;
  b.getUpCd = getUpVal(c, "cooldown");
  b.getUpN = (b.getUpN || 0) + 1;
  getUpStats.ups[h.kind] = (getUpStats.ups[h.kind] || 0) + 1;
  getUpStats.saved += s.saved;
  // Up and away from him, never into the cage he was pinned on.
  var dx = b.x - top.x, dy = b.y - top.y, d = Math.sqrt(dx * dx + dy * dy) || 1, ux = dx / d, uy = dy / d;
  if ((b.x - b.r < GETUP_WALL && ux < 0) || (W - b.x - b.r < GETUP_WALL && ux > 0)) ux = -ux;
  if ((b.y - b.r < GETUP_WALL && uy < 0) || (H - b.y - b.r < GETUP_WALL && uy > 0)) uy = -uy;
  if (Math.abs(ux) < 0.25 && Math.abs(uy) < 0.25) { ux = b.x < W / 2 ? 1 : -1; uy = 0; }
  var ul = Math.sqrt(ux * ux + uy * uy) || 1; ux /= ul; uy /= ul;
  var push = getUpVal(c, "push"), shove = getUpVal(c, "shove");
  b.vx = ux * push; b.vy = uy * push;
  if (top.alive && !top.koOut && h.kind !== "takedown") { top.vx = -ux * shove; top.vy = -uy * shove * 0.5; } // (after a throw he's already let go)
  var reset = getUpVal(c, "reset");
  if (reset > 0) b.iowaSafe = { from: top.id, t: reset }; // he can't grab him straight back (grapple-duel.js)
  var big = s.style === "explode";
  // BACK UP! as a big word like THROWN! (toss.js), so it reads over the hit numbers at phone size.
  getUpFx.push({ kind: "word", t: 0, dur: 1.1, x: b.x, y: b.y - b.r - 115, text: getUpVal(c, "text") }); // (above the hit numbers)
  floaters.forEach(function (f) { if (f.text === GETUP_STYLE_TEXT[s.style]) f.life = Math.min(f.life, 0.12); }); // the scramble's call clears out of its way
  tossDust(b.x, b.y + b.r * 0.5, big ? 14 : 9, big ? 1.2 : 0.9); // (toss.js)
  tossFx.push({ kind: "ring", t: 0, dur: 0.45, x: b.x, y: b.y });
  getUpFx.push({ kind: "pop", t: 0, dur: 0.5, x: b.x, y: b.y, ux: ux, uy: uy, color: b.char.color, big: big, id: b.id });
  if (!reduceMotion) shake = Math.max(shake, big ? 14 : 8);
  playGetUp(big);
  // A parting shot on the way up.
  var shot = getUpVal(c, "shot");
  if (shot > 0 && top.alive) {
    var gx = top.x - b.x, gy = top.y - b.y, gd = Math.sqrt(gx * gx + gy * gy);
    if (gd < b.r + top.r + GETUP_REACH) {
      var dealt = hurt(top, shot, "punch", b.id);
      if (dealt > 0) {
        playPunch(dealt * 2);
        var hx = top.x - gx / (gd || 1) * top.r, hy = top.y - gy / (gd || 1) * top.r;
        impacts.push({ x: hx, y: hy, nx: gx / (gd || 1), ny: gy / (gd || 1), life: 0.35, max: 0.35, color: b.char.color });
        getUpFx.push({ kind: "shot", t: 0, dur: 0.3, x: hx, y: hy, color: b.char.color, id: b.id });
      }
      checkEnd();
    }
  }
}

// Over the fighters (draw.js): the scramble meter round him while he
// fights his way up, his feet on the cage for a wall walk, the glow for a
// big man powering up; then the pop when he's up.
function drawGetUp() {
  balls.forEach(function (b) {
    var s = b.getUp;
    if (!s || s.phase !== "scramble" || !b.alive) return;
    var span = Math.max(0.05, s.upAt - s.scrAt), k = Math.min(1, (s.t - s.scrAt) / span);
    ctx.save();
    if (s.style === "explode") {
      var gl = ctx.createRadialGradient(b.x, b.y, b.r * 0.4, b.x, b.y, b.r * (1.5 + 0.5 * k));
      gl.addColorStop(0, "rgba(255,255,255,0)");
      gl.addColorStop(0.6, hexA(b.char.color, 0.35 + 0.35 * k));
      gl.addColorStop(1, hexA(b.char.color, 0));
      ctx.fillStyle = gl;
      ctx.beginPath(); ctx.arc(b.x, b.y, b.r * (1.5 + 0.5 * k), 0, Math.PI * 2); ctx.fill();
    } else if (s.style === "wallwalk") {
      // Chevrons climbing off the cage beside him, lighting up one by one.
      var w = guWallSide(b), steps = 3, cs = 9;
      ctx.lineCap = "round"; ctx.lineJoin = "round";
      for (var i = 0; i < steps; i++) {
        var on = k >= i / steps;
        var cx = b.x + w.px * (b.r + 16) + w.nx * b.r * (-0.45 + 0.55 * i), cy = b.y + w.py * (b.r + 16) + w.ny * b.r * (-0.45 + 0.55 * i);
        ctx.beginPath();
        ctx.moveTo(cx - w.px * cs - w.nx * cs * 0.7, cy - w.py * cs - w.ny * cs * 0.7);
        ctx.lineTo(cx, cy);
        ctx.lineTo(cx + w.px * cs - w.nx * cs * 0.7, cy + w.py * cs - w.ny * cs * 0.7);
        ctx.globalAlpha = on ? 1 : 0.25;
        ctx.strokeStyle = theme.wall; ctx.lineWidth = 7; ctx.stroke();
        ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 4; ctx.stroke();
      }
      ctx.globalAlpha = 1;
    } else {
      // Scrambling: little kick lines flicking out from both sides.
      ctx.strokeStyle = theme.ink; ctx.lineWidth = 3; ctx.lineCap = "round"; ctx.globalAlpha = 0.8;
      for (var j = 0; j < 4; j++) {
        var a = (j < 2 ? 0 : Math.PI) + (j % 2 ? -0.5 : 0.5) + Math.sin(s.t * 40 + j) * 0.25, r0 = b.r + 4, r1 = b.r + 14 + 6 * Math.sin(s.t * 33 + j * 2);
        ctx.beginPath(); ctx.moveTo(b.x + Math.cos(a) * r0, b.y + Math.sin(a) * r0); ctx.lineTo(b.x + Math.cos(a) * r1, b.y + Math.sin(a) * r1); ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }
    // The meter: fills up until he's on his feet.
    ctx.lineCap = "round";
    ctx.strokeStyle = theme.wall; ctx.lineWidth = 7; ctx.globalAlpha = 0.5;
    ctx.beginPath(); ctx.arc(b.x, b.y, b.r + 9, 0, Math.PI * 2); ctx.stroke();
    ctx.globalAlpha = 1; ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.arc(b.x, b.y, b.r + 9, -Math.PI / 2, -Math.PI / 2 + k * Math.PI * 2); ctx.stroke();
    ctx.restore();
  });
  getUpFx.forEach(function (f) {
    var k = f.t / f.dur;
    ctx.save();
    if (f.kind === "pop") {
      // A ring in his colour and speed lines the way he's springing.
      ctx.globalAlpha = 1 - k; ctx.strokeStyle = f.color; ctx.lineWidth = (f.big ? 9 : 6) * (1 - k) + 1;
      ctx.beginPath(); ctx.arc(f.x, f.y, 20 + (f.big ? 90 : 65) * (1 - Math.pow(1 - k, 3)), 0, Math.PI * 2); ctx.stroke();
      var b = balls[f.id];
      if (b) {
        ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 3; ctx.lineCap = "round";
        for (var i = -2; i <= 2; i++) {
          var px = -f.uy * i * b.r * 0.4, py = f.ux * i * b.r * 0.4, len = b.r * (0.9 + 0.3 * (2 - Math.abs(i))) * (1 - k);
          var sx = b.x - f.ux * b.r * 1.1 + px, sy = b.y - f.uy * b.r * 1.1 + py;
          ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(sx - f.ux * len, sy - f.uy * len); ctx.stroke();
        }
      }
    } else if (f.kind === "word") {
      var pop = k < 0.12 ? 1.8 - 0.8 * (k / 0.12) : 1;
      ctx.globalAlpha = k > 0.75 ? (1 - k) / 0.25 : 1;
      ctx.font = '900 44px Impact, "Arial Black", sans-serif';
      var half = ctx.measureText(f.text).width / 2 + 8;
      ctx.translate(Math.min(W - half, Math.max(half, f.x)), Math.max(30, f.y - k * 20)); ctx.rotate(0.1); ctx.scale(pop, pop);
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.lineJoin = "round"; ctx.lineWidth = 9; ctx.strokeStyle = "#1b1718"; ctx.strokeText(f.text, 0, 0);
      ctx.fillStyle = "#ffd21f"; ctx.fillText(f.text, 0, 0);
    } else if (f.kind === "shot") {
      ctx.globalAlpha = 1 - k; ctx.fillStyle = "#ffffff";
      ctx.beginPath(); ctx.arc(f.x, f.y, 6 + 18 * k, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = f.color; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(f.x, f.y, 10 + 26 * k, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.restore();
  });
}

// The cage he's against: its inward direction (nx, ny), along it (px, py),
// and "up" it, away from the man on top (ux, uy).
function guWallSide(b) {
  var o = balls[1 - b.id], d = [
    { g: b.x - b.r, nx: 1, ny: 0 }, { g: W - b.x - b.r, nx: -1, ny: 0 },
    { g: b.y - b.r, nx: 0, ny: 1 }, { g: H - b.y - b.r, nx: 0, ny: -1 }
  ].sort(function (p, q) { return p.g - q.g; })[0];
  var px = -d.ny, py = d.nx, side = o ? ((o.x - b.x) * px + (o.y - b.y) * py >= 0 ? -1 : 1) : 1;
  return { nx: d.nx, ny: d.ny, px: px * side, py: py * side, ux: px * side * 0.3 + d.nx * 0.7, uy: py * side * 0.3 + d.ny * 0.7 };
}

function hexA(hex, a) {
  var h = String(hex || "#ffffff").replace("#", "");
  if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  var n = parseInt(h, 16);
  if (isNaN(n)) return "rgba(255,255,255," + a + ")";
  return "rgba(" + ((n >> 16) & 255) + "," + ((n >> 8) & 255) + "," + (n & 255) + "," + a + ")";
}

// A rising whoosh into a thud: up off the mat.
function playGetUp(big) {
  try {
    var ac = getAudioCtx();
    if (!ac) return;
    if (ac.state === "suspended") ac.resume();
    var now = ac.currentTime, o = ac.createOscillator(), g = ac.createGain();
    o.type = "triangle";
    o.frequency.setValueAtTime(big ? 90 : 140, now);
    o.frequency.exponentialRampToValueAtTime(big ? 380 : 520, now + 0.18);
    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(big ? 0.22 : 0.16, now + 0.03);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);
    o.connect(g); g.connect(ac.destination);
    o.start(now); o.stop(now + 0.32);
    synthWhoosh(ac, ac.destination, now);
  } catch (e) { /* never let audio break the game */ }
}

// The fighter card's move list (gallery.js).
function getUpGalleryMoves(ch, add) {
  var c = ch.getUp, base = Math.round(Math.min(getUpVal(c, "max"), guRating(c) + getUpVal(c, "chance")));
  var cut = Math.round(getUpVal(c, "cut") * 100), shot = getUpVal(c, "shot");
  add("🆙", "Gets back up", "Taken down or pinned under ground and pound, he fights his way back to his feet about " + base +
    "% of the time (more against smaller men, less against real wrestlers), cutting " + cut + "% of the time on the mat." +
    (shot > 0 ? " Throws a parting shot on the way up." : "") + " Then they can't grab him straight back.");
}
