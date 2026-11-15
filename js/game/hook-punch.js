// Hooks (Christian, 2026-11-14): what a hook is, for every fighter. A hook
// COMES ROUND: the glove is cocked out wide to the side (the tell, a dashed
// arc showing the path), sweeps round into them in a curve (the right hand
// from the right, the left from the left), carries through past them and
// comes back to guard. A bold swoosh trails it along the curve, so it reads
// at phone size the way the KO Rush hook does (korush.js). It hits harder
// than a straight punch and shoves them sideways, the way the glove was going.
//
// A fighter opts in with a "hooks" block in its character file (every key
// can be left out; the defaults are in HOOK_DEFAULTS):
//
//   "hooks": { "finisherChance": 80, "chance": 0, "damageMult": 1.25,
//              "knockback": 420, "coil": 0.1, "sweep": 0.2, "recover": 0.12,
//              "arc": 1.8, "follow": 0.5, "size": 1.15, "width": 1.1,
//              "color": "#e0281c" }
//
// finisherChance  % of combo finishers (the last punch of a combo) thrown as a hook.
// chance          % of every other punch thrown as a hook.
// damageMult      a hook does this many times the punch's damage.
// knockback       the sideways shove of a hook. Left out, the hook uses the
//                 knockback the punch would have had (Ilia's finisher: 560).
// coil            seconds cocking it out wide before it swings (the tell).
// sweep           seconds of the swing, from out wide to the follow-through.
// recover         seconds back to guard.
// arc, follow     how far round to the side it starts, and how far it
//                 carries on past them (radians).
// size            the glove is this much bigger in a hook.
// width, color    the swoosh: times the glove, and its colour.
// over            true: it always comes round over the top (the side that
//                 starts higher up on screen), a looping overhand (Ciryl Gane's).
// afterSetup      % of the punches he throws into a setup (a body shot or an
//                 uppercut of his that just landed, body-shots-uppercuts.js)
//                 that come as a hook (Dustin: body, then the left hook).
// side            1 or -1: every hook is off that hand (Dustin's left: -1).
//                 Left out, the punch's own hand.
//
// Joe's plain punch (abilities.js) is wired in: a fighter with a plain punch
// and a "hooks" block throws `chance`% of its punches as hooks. A fighter
// with no "hooks" block punches exactly as before (no extra random rolls).
//
// Uppercuts and body shots (body-shots-uppercuts.js) are the same family:
// rollPunchType there picks hook, uppercut, body shot or straight in one
// roll, and punchHitAt, punchEndAt and hookShove below cover all of them.
//
// The API, for any punch routine (the plain punch and Ilia's combos in
// ilia-combos.js use it):
//   rollHook(b, p, last)       when a punch object `p` starts: rolls
//                              finisherChance (last = true) or chance, and if
//                              it hits sets p.hook = true. Returns p.hook.
//   punchHitAt(b, p)           seconds into `p` when it lands (a straight
//                              punch: punch.speed * 0.35).
//   punchEndAt(b, p)           seconds into `p` when it's over (punch.speed).
//   hookDamage(b, p, dmg)      dmg, times damageMult if it's a hook.
//   hookShove(b, o, p, kb)     knockback kb: sideways along the sweep for a
//                              hook, straight back for a straight punch.
//   hookGlove(b, o)            where a hook's glove is right now:
//                              { x, y, r, phase: "coil" | "sweep" | "recover", k }.
// Fields on the punch: p.hook (true when it's a hook), p.side (which hand,
// 1 or -1, the same field drawFist uses), and optional p.hookHeat (0 to 1:
// the glove glows white-hot and swells, for a fighter's big one).
// Drawing needs nothing from the routine: drawFist (draw-attacks.js) hands
// any punch with p.hook to drawHookFist. The fighter card gets a "Hooks"
// line from hookGalleryMoves (gallery.js).
"use strict";

var HOOK_DEFAULTS = { finisherChance: 0, chance: 0, damageMult: 1.3, knockback: null, coil: 0.1, sweep: 0.2, recover: 0.12,
  arc: 1.7, follow: 0.5, size: 1.15, width: 1, color: "#ffd21f", over: false, afterSetup: 0, side: 0 };

function hookCfg(b) { return b && b.char && b.char.hooks ? b.char.hooks : null; }
function hookVal(c, k) { return c && c[k] != null ? c[k] : HOOK_DEFAULTS[k]; }
// How far through the sweep it reaches them (the glove straight at them).
function hookKHit(c) { var o = hookVal(c, "arc"), f = hookVal(c, "follow"); return o / Math.max(0.01, o + f); }

function rollHook(b, p, last) {
  var c = hookCfg(b);
  if (!c || !p) return false;
  var pct = hookPct(b, last);
  if (pct > 0 && Math.random() * 100 < pct) makeHook(b, p);
  return !!p.hook;
}

// The % chance a punch is a hook: finisherChance (last) or chance, or
// afterSetup if that's higher and they're set up (body-shots-uppercuts.js).
function hookPct(b, last) {
  var c = hookCfg(b);
  if (!c) return 0;
  var pct = last ? hookVal(c, "finisherChance") : hookVal(c, "chance"), as = hookVal(c, "afterSetup");
  if (as > pct && typeof punchSetUp === "function" && punchSetUp(b)) pct = as;
  return pct;
}

function makeHook(b, p) {
  p.hook = true;
  if (p.side == null) p.side = 1;
  var sd = hookVal(hookCfg(b), "side");
  if (sd) p.side = sd; // always off that hand
  if (hookVal(hookCfg(b), "over")) p.side = hookOverSide(b, hookCfg(b)); // over the top (Ciryl Gane's overhand)
}

function punchHitAt(b, p) {
  if (p && (p.upper || p.body)) return ptHitAt(b, p); // an uppercut or a body shot (body-shots-uppercuts.js)
  if (p && p.hook) { var c = hookCfg(b); return hookVal(c, "coil") + hookVal(c, "sweep") * hookKHit(c); }
  return b.char.punch.speed * 0.35;
}

function punchEndAt(b, p) {
  if (p && (p.upper || p.body)) return ptEndAt(b, p); // (body-shots-uppercuts.js)
  if (p && p.hook) { var c = hookCfg(b); return hookVal(c, "coil") + hookVal(c, "sweep") + hookVal(c, "recover"); }
  return b.char.punch.speed;
}

function hookDamage(b, p, dmg) { return p && p.hook ? dmg * hookVal(hookCfg(b), "damageMult") : dmg; }

function hookShove(b, o, p, kb) {
  if (p && p.hook) { var hk = hookVal(hookCfg(b), "knockback"); if (hk != null) kb = hk; }
  if (p && (p.upper || p.body)) kb = ptKnockback(b, p, kb); // its own, straight back (body-shots-uppercuts.js)
  if (!(kb > 0)) return;
  var dx = o.x - b.x, dy = o.y - b.y, d = Math.sqrt(dx * dx + dy * dy) || 1, nx = dx / d, ny = dy / d;
  if (p && p.hook) {
    var s = p.side || 1; // the way the glove is travelling as it lands, and a little back
    o.vx += (s * ny * 0.8 + nx * 0.6) * kb; o.vy += (-s * nx * 0.8 + ny * 0.6) * kb;
  } else { o.vx += nx * kb; o.vy += ny * kb; }
}

// The glove on the curve, `k` of the way through the sweep (0 out wide, at
// hookKHit straight at them and touching, 1 the end of the follow-through).
function hookPath(b, o, c, k, s) {
  var dx = o.x - b.x, dy = o.y - b.y, qd = Math.sqrt(dx * dx + dy * dy) || 1, a = Math.atan2(dy, dx);
  var open = hookVal(c, "arc"), fol = hookVal(c, "follow"), kHit = hookKHit(c);
  var reachR = Math.max(b.r + 6, qd - o.r + 4), r0 = b.r * 1.3;
  var ang = a + s * (open - (open + fol) * k);
  var kk = Math.min(1, k / kHit);
  // (k < 0: back where it was cocked) it swings out wide on the way, even up close
  var rr = k <= 0 ? r0 : r0 + (reachR - r0) * Math.sin(kk * Math.PI / 2) + b.r * 0.22 * Math.sin(kk * Math.PI);
  return { x: b.x + Math.cos(ang) * rr, y: b.y + Math.sin(ang) * rr };
}

function hookGlove(b, o) {
  var p = b.punch;
  if (!p || !p.hook || !o) return null;
  var c = hookCfg(b), s = p.side || 1, coil = hookVal(c, "coil"), sweep = hookVal(c, "sweep"), rec = hookVal(c, "recover");
  var a = Math.atan2(o.y - b.y, o.x - b.x), r = b.r;
  var gr = b.char.punch.size * hookVal(c, "size") * (1 + 0.12 * (p.hookHeat || 0));
  // the guard slot the hand comes from and goes back to (drawHands' spot)
  var gx = b.x + Math.cos(a) * r * 0.8 - Math.sin(a) * r * 0.4 * s, gy = b.y + Math.sin(a) * r * 0.8 + Math.cos(a) * r * 0.4 * s;
  if (p.t < coil) {
    var w = p.t / coil, e = w * (2 - w), ca = a + s * (hookVal(c, "arc") + 0.3 * w);
    var cx = b.x + Math.cos(ca) * r * 1.3, cy = b.y + Math.sin(ca) * r * 1.3;
    return { x: gx + (cx - gx) * e, y: gy + (cy - gy) * e, r: gr, phase: "coil", k: 0, w: w };
  }
  var k = sweep > 0 ? (p.t - coil) / sweep : 1;
  if (k < 1) { var h = hookPath(b, o, c, k, s); return { x: h.x, y: h.y, r: gr, phase: "sweep", k: k, w: 1 }; }
  var end = hookPath(b, o, c, 1, s), q = Math.min(1, (p.t - coil - sweep) / Math.max(0.01, rec));
  return { x: end.x + (gx - end.x) * q, y: end.y + (gy - end.y) * q, r: gr, phase: "recover", k: 1, q: q, w: 1 };
}

// ---------------------------------------------------------------- drawing

// From drawFist (draw-attacks.js), in place of the straight punch: the tell,
// the swoosh with speed lines and ghost gloves, the arm from the shoulder and
// the glove.
function drawHookFist(self, other) {
  var p = self.punch;
  if (!p || !p.hook || !other.alive) return false;
  var f = hookGlove(self, other);
  if (!f) return false;
  var c = hookCfg(self), s = p.side || 1, pu = self.char.punch, col = hookVal(c, "color"), heat = p.hookHeat || 0;
  var open = hookVal(c, "arc"), fol = hookVal(c, "follow");
  var a = Math.atan2(other.y - self.y, other.x - self.x), qd = Math.sqrt(Math.pow(other.x - self.x, 2) + Math.pow(other.y - self.y, 2)) || 1;
  var shA = a + s * Math.PI / 2, sx = self.x + Math.cos(shA) * self.r * 0.55, sy = self.y + Math.sin(shA) * self.r * 0.55;
  ctx.save();
  ctx.lineCap = "round"; ctx.lineJoin = "round";
  if (heat > 0) {
    // a hot glove (p.hookHeat): a glow under everything else
    var R = f.r * (1.3 + 0.5 * heat), g = ctx.createRadialGradient(f.x, f.y, f.r * 0.5, f.x, f.y, R);
    g.addColorStop(0, "rgba(255,240,200," + (0.8 * heat) + ")");
    g.addColorStop(0.5, "rgba(255,110,40," + (0.45 * heat) + ")");
    g.addColorStop(1, "rgba(224,40,28,0)");
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(f.x, f.y, R, 0, Math.PI * 2); ctx.fill();
  }
  if (f.phase === "coil") {
    // the tell: the arc it's about to sweep through
    var reachR = Math.max(self.r + 6, qd - other.r + 4), a0 = a + s * open, a1 = a - s * fol;
    ctx.setLineDash([8, 6]);
    ctx.globalAlpha = 0.3 + 0.55 * f.w;
    ctx.strokeStyle = "#1a1208"; ctx.lineWidth = 6;
    ctx.beginPath(); ctx.arc(self.x, self.y, reachR, Math.min(a0, a1), Math.max(a0, a1)); ctx.stroke();
    ctx.strokeStyle = col; ctx.lineWidth = 3.5;
    ctx.beginPath(); ctx.arc(self.x, self.y, reachR, Math.min(a0, a1), Math.max(a0, a1)); ctx.stroke();
    ctx.setLineDash([]);
  } else {
    // the swoosh along the curve behind the glove, from where it was cocked
    // (fading on the way back to guard), and speed lines either side of it
    var al = f.phase === "recover" ? 1 - f.q : 1, k1 = f.phase === "sweep" ? f.k : 1;
    var k0 = Math.max(-0.3 / (open + fol), k1 - 0.75), w = f.r * 1.2 * hookVal(c, "width");
    if (al > 0.02 && k1 - k0 > 0.03) {
      ctx.globalAlpha = al;
      hookSwoosh(self, other, c, s, k0, k1, w + 6, "#1a1208");
      hookSwoosh(self, other, c, s, k0, k1, w, col);
      hookSwoosh(self, other, c, s, k0 + (k1 - k0) * 0.35, k1, w * 0.4, "#fff6cf");
      [1, -1].forEach(function (side) {
        var u0 = Math.max(k0, k1 - 0.45), u1 = k1 - 0.12;
        if (u1 - u0 < 0.05) return;
        hookLine(self, other, c, s, u0, u1, side * (w * 0.5 + 7), "#1a1208", 6);
        hookLine(self, other, c, s, u0, u1, side * (w * 0.5 + 7), col, 3);
      });
    }
    if (f.phase === "sweep") {
      // ghost gloves along the path, like the KO Rush hook
      [0.12, 0.24].forEach(function (back, i) {
        if (f.k - back <= k0) return;
        var gh = hookPath(self, other, c, f.k - back, s);
        ctx.globalAlpha = 0.45 - i * 0.15; ctx.fillStyle = gloveColor(self.char);
        ctx.beginPath(); ctx.arc(gh.x, gh.y, f.r * 0.92, 0, Math.PI * 2); ctx.fill();
      });
    }
  }
  ctx.globalAlpha = 1;
  // the arm, from the shoulder on that side
  if (hasArmMuscle(self.char)) drawArmMuscle(ctx, self.char, sx, sy, f.x, f.y, pu.size * 0.6, theme.wall);
  else {
    ctx.strokeStyle = theme.wall; ctx.lineWidth = pu.size * 0.9 + 6;
    ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(f.x, f.y); ctx.stroke();
    ctx.strokeStyle = armColor(self.char); ctx.lineWidth = pu.size * 0.6;
    ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(f.x, f.y); ctx.stroke();
  }
  if (s === 1) drawTracedArm(ctx, self.char, sx, sy, f.x, f.y, pu.size * 0.6); // sleeve on one arm only (as drawFist)
  ctx.fillStyle = gloveColor(self.char); ctx.strokeStyle = heat > 0 ? "#e0281c" : theme.wall; ctx.lineWidth = heat > 0 ? 4 : 3;
  ctx.beginPath(); ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  if (f.phase === "coil") {
    // the cocked glove flickers: it's coming
    ctx.globalAlpha = 0.45 + 0.3 * Math.sin(performance.now() / 45);
    ctx.strokeStyle = col; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(f.x, f.y, f.r + 5, 0, Math.PI * 2); ctx.stroke();
  }
  ctx.restore();
  return true;
}

// A line along the hook's curve from k0 to k1, `off` out from it (a speed line).
function hookLine(b, o, c, s, k0, k1, off, color, width) {
  var N = 10, pts = [], i;
  for (i = 0; i <= N; i++) pts.push(hookPath(b, o, c, k0 + (k1 - k0) * i / N, s));
  ctx.strokeStyle = color; ctx.lineWidth = width;
  ctx.beginPath();
  for (i = 0; i <= N; i++) {
    var p0 = pts[Math.max(0, i - 1)], p1 = pts[Math.min(N, i + 1)], tx = p1.x - p0.x, ty = p1.y - p0.y, tl = Math.sqrt(tx * tx + ty * ty) || 1;
    var x = pts[i].x - ty / tl * off, y = pts[i].y + tx / tl * off;
    if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y);
  }
  ctx.stroke();
}

// A crescent along the hook's curve from k0 (a point) to k1 (wMax wide,
// rounded off at the glove end).
function hookSwoosh(b, o, c, s, k0, k1, wMax, color) {
  var N = 16, pts = [], i;
  for (i = 0; i <= N; i++) pts.push(hookPath(b, o, c, k0 + (k1 - k0) * i / N, s));
  var side1 = [], side2 = [];
  for (i = 0; i <= N; i++) {
    var p0 = pts[Math.max(0, i - 1)], p1 = pts[Math.min(N, i + 1)], tx = p1.x - p0.x, ty = p1.y - p0.y, tl = Math.sqrt(tx * tx + ty * ty) || 1;
    var f = i / N, h = wMax * (0.06 + 0.94 * f * (2 - f)) / 2;
    side1.push([pts[i].x - ty / tl * h, pts[i].y + tx / tl * h]);
    side2.push([pts[i].x + ty / tl * h, pts[i].y - tx / tl * h]);
  }
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(side1[0][0], side1[0][1]);
  for (i = 1; i <= N; i++) ctx.lineTo(side1[i][0], side1[i][1]);
  for (i = N; i >= 0; i--) ctx.lineTo(side2[i][0], side2[i][1]);
  ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.arc(pts[N].x, pts[N].y, wMax / 2, 0, Math.PI * 2); ctx.fill();
}

// ---------------------------------------------------------------- gallery

// The fighter card's move list (gallery.js).
// An overhand (`over`): the side whose sweep starts higher up, so it loops
// over the top.
function hookOverSide(b, c) {
  var o = balls[1 - b.id], a = o ? Math.atan2(o.y - b.y, o.x - b.x) : 0, arc = hookVal(c, "arc");
  return Math.sin(a + arc) < Math.sin(a - arc) ? 1 : -1;
}

function hookGalleryMoves(ch, add) {
  var c = ch.hooks, fin = hookVal(c, "finisherChance"), any = hookVal(c, "chance"), parts = [];
  if (fin > 0) parts.push(fin + "% of his combos end in one");
  if (any > 0) parts.push(any + "% of his other punches are one");
  if (hookVal(c, "afterSetup") > 0) parts.push(hookVal(c, "afterSetup") + "% of the punches he throws once a body shot or uppercut has set them up are one");
  if (hookVal(c, "over")) add("⤵️", "Overhands", "The glove loops over the top in a wide arc instead of straight, hits " + hookVal(c, "damageMult") +
    "x as hard and knocks them sideways." + (parts.length ? " " + parts.join(", and ") + "." : ""));
  else add("↪️", "Hooks", "The glove comes round from the side in a wide sweep instead of straight, hits " + hookVal(c, "damageMult") +
    "x as hard and knocks them sideways." + (parts.length ? " " + parts.join(", and ") + "." : ""));
}
