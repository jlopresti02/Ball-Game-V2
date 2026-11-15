// Uppercuts and body shots (Christian, 2026-11-14): two more punch types
// next to the hook (hook-punch.js), for any fighter, and what they're for:
// setting up the bigger shot.
//
// Uppercut   the glove drops low by his hip (the tell: he dips his level
//            and a dashed arrow shows the line it will come up), scoops in
//            under them and comes STRAIGHT UP through their chin, with a
//            swoosh and speed lines rising behind it, then back to guard.
//            Only thrown up close (`close`). Their chin snaps up.
// Body shot  he dips, the glove drops low out wide on his punching side
//            (the tell: a dashed line curving in to their belly), then it
//            hooks in under their guard and digs into their midsection, a
//            thud and sweat flying. They fold over it.
// The setup  a body shot or uppercut that LANDS sets them up: for
//            `setupTime` seconds they're open (a ring in the punch's
//            colour round them, running down), and his next head shot (any
//            punch that isn't a body shot: a straight, a hook or an
//            uppercut) does `setupMult` times its damage, with `guardDrop`
//            points off their block chance. The big one flashes `text`
//            ("SET UP!") over them, a ring in the colour, a freeze frame
//            and a heavier sound. Inside a combo that's the next punch, or,
//            with `beforeFinisher`, the finisher. With the shared hook's
//            `afterSetup`, the punch he throws into a setup is a hook that
//            often (Dustin: body, then the left hook).
//
// A fighter opts in with an "uppercuts" and/or a "bodyShots" block in its
// character file (every key can be left out; the defaults are in
// PT_DEFAULTS):
//
//   "uppercuts": { "chance": 12, "close": 26, "damageMult": 1.2,
//                  "setupMult": 1.4, "setupTime": 1.2, "guardDrop": 10 },
//   "bodyShots": { "chance": 25, "beforeFinisher": 60, "setupMult": 1.4 }
//
// chance          % of his punches thrown as one (a plain punch, or any punch
//                 of a combo but the last).
// finisherChance  % of the last punches of his combos thrown as one.
// beforeFinisher  % of the punches right before a combo's last one thrown as
//                 one (left out: `chance`). A body shot there sets up the
//                 finisher.
// close           an uppercut only comes when the gap between them is this
//                 many pixels or less (left out on body shots: any range).
// damageMult      it does this many times the punch's damage.
// knockback       its shove (straight back); left out, the punch's own.
// dip, drive, recover  seconds dropping the glove low (the tell), driving
//                 it in (it lands most of the way through), and back to guard.
// size, width, color  the glove is `size` times bigger; the swoosh is
//                 `width` times the glove, in `color`.
// setupMult, setupTime, guardDrop, text  the setup it leaves on them (above).
// tell            seconds they show it (bent over, or chin up).
// critChance, critMult, critText  % of them that crit, for critMult times the
//                 damage, with critText over them ("UPPERCUT!", "TO THE BODY!").
// onGrab          (uppercuts) % of the times someone grabs him, shoots on
//                 him, ties him up in the clinch or pulls him into guard that
//                 he answers with a short uppercut (uppercutCounter below); if
//                 it lands the grab is stuffed (counterText "STUFFED!") and
//                 they're shoved off (counterKnockback). At most one every
//                 counterGap seconds. Justin Gaethje's clinch uppercuts.
// counterMult     (uppercuts) the uppercut that answers a grab does this many
//                 times the usual uppercut damage (1: the same).
//
// One roll picks the punch type: rollPunchType(b, p, last) in place of
// rollHook, when punch `p` starts (hook first, then uppercut, then body
// shot; a fighter with none of the three blocks makes no roll at all). It
// sets p.hook, p.upper or p.body. The rest of the hook's API covers these
// too: punchHitAt and punchEndAt (hook-punch.js) give their timing,
// hookShove their shove. In place of hurt(o, hookDamage(...)) a routine
// calls punchHurt(b, o, p, dmg): it does the hook, uppercut and body shot
// damage, the setup bonus and guard drop, hurt() itself, and leaves the
// setup when one lands. Drawing needs nothing: drawFist skips an uppercut
// or a body shot (drawPunchTypeFist) and drawPunchTypesOver draws it after
// both fighters, so up close it isn't hidden under them. punchTypeGlove(b, o)
// is where the glove is right now. Counters per fight on b.ptN (hooks, uppers, bodies
// thrown and landed, setups, bigShots), for the test harness.
//
// Used by: the plain punch (abilities.js: Dustin Poirier, Alex Pereira,
// Justin Gaethje),
// Max Holloway's volume (holloway.js), Ilia Topuria's combos
// (ilia-combos.js) and Joshua Van's chain (van.js).
"use strict";

var PT_KEYS = { upper: "uppercuts", body: "bodyShots" };
var PT_CRIT_TEXT = { upper: "UPPERCUT!", body: "TO THE BODY!" };
var PT_DEFAULTS = {
  upper: { chance: 0, finisherChance: 0, beforeFinisher: null, close: 32, damageMult: 1.2, knockback: null,
    dip: 0.09, drive: 0.16, recover: 0.1, size: 1.12, width: 1, color: "#3fd0ff",
    setupMult: 1.4, setupTime: 1.2, guardDrop: 10, text: "SET UP!", tell: 0.45,
    critChance: 0, critMult: 1.6, critText: null, onGrab: 0, counterGap: 0.6, counterKnockback: 260, counterText: "STUFFED!", counterMult: 1 },
  body: { chance: 0, finisherChance: 0, beforeFinisher: null, close: null, damageMult: 1, knockback: null,
    dip: 0.07, drive: 0.13, recover: 0.1, size: 1.08, width: 1, color: "#ff7a1a",
    setupMult: 1.4, setupTime: 1.2, guardDrop: 10, text: "SET UP!", tell: 0.45,
    critChance: 0, critMult: 1.6, critText: null, onGrab: 0, counterGap: 0.6, counterKnockback: 260, counterText: "STUFFED!", counterMult: 1 }
};
// The uppercut: the first PT_UP_SPLIT of the drive scoops in under them
// (to their radius below their chin, on his side of them), the rest goes
// straight up, touching their chin PT_UP_CHIN of the way up. A body shot
// lands PT_BODY_HIT of the way in.
var PT_UP_SPLIT = 0.42, PT_UP_CHIN = 0.6, PT_BODY_HIT = 0.8;

function ptCfg(b, kind) { var k = PT_KEYS[kind]; return k && b && b.char && b.char[k] ? b.char[k] : null; }
function ptVal(c, kind, k) { return c && c[k] != null ? c[k] : PT_DEFAULTS[kind][k]; }
function ptKind(p) { return p ? (p.upper ? "upper" : (p.body ? "body" : null)) : null; }
function ptKHit(kind) { return kind === "upper" ? PT_UP_SPLIT + (1 - PT_UP_SPLIT) * PT_UP_CHIN : PT_BODY_HIT; }
function ptGap(b, o) { var dx = o.x - b.x, dy = o.y - b.y; return Math.sqrt(dx * dx + dy * dy) - b.r - o.r; }

// The fight's counters, only for a fighter with one of the punch blocks.
function ptStats(b) {
  if (!b || !b.char || !(b.char.hooks || b.char.uppercuts || b.char.bodyShots)) return null;
  return b.ptN || (b.ptN = { hooks: 0, hooksLanded: 0, uppers: 0, uppersLanded: 0, bodies: 0, bodiesLanded: 0, setups: 0, bigShots: 0, crits: 0, counters: 0, stuffed: 0 });
}

// The setup b has on the other fighter right now, or null (hook-punch.js's
// afterSetup reads this).
function punchSetUp(b) {
  var o = balls[1 - b.id], s = o && o.ptSetup;
  return s && s.by === b.id && s.t > 0 ? s : null;
}

// ---------------------------------------------------------------- the roll

// When punch `p` starts (last: it's the last punch of a combo). One roll:
// a hook (hook-punch.js), an uppercut (up close), a body shot, or a
// straight punch. Returns "hook", "upper", "body" or null.
function rollPunchType(b, p, last) {
  if (!p || !b || !b.char) return null;
  var ch = b.char;
  if (!ch.uppercuts && !ch.bodyShots) return rollHook(b, p, last) ? ptCount(b, "hook") : null; // (just the hook, as before)
  var pk = ch.hooks ? hookPct(b, last) : 0, pu = ptPct(b, p, "upper", last), pb = ptPct(b, p, "body", last);
  if (!(pk > 0 || pu > 0 || pb > 0)) return null;
  var x = Math.random() * 100;
  if (x < pk) { makeHook(b, p); return ptCount(b, "hook"); }
  x -= Math.max(0, pk);
  if (x < pu) { p.upper = true; if (p.side == null) p.side = 1; return ptCount(b, "upper"); }
  x -= Math.max(0, pu);
  if (x < pb) { p.body = true; if (p.side == null) p.side = 1; return ptCount(b, "body"); }
  return null;
}

function ptCount(b, kind) {
  var n = ptStats(b);
  if (n) n[kind === "hook" ? "hooks" : (kind === "upper" ? "uppers" : "bodies")]++;
  return kind;
}

// The % chance punch p is this kind.
function ptPct(b, p, kind, last) {
  var c = ptCfg(b, kind);
  if (!c) return 0;
  var bf = ptVal(c, kind, "beforeFinisher");
  var pct = last ? ptVal(c, kind, "finisherChance") : (bf != null && p.left === 1 && p.n > 1 ? bf : ptVal(c, kind, "chance"));
  if (!(pct > 0)) return 0;
  var close = ptVal(c, kind, "close"), o = balls[1 - b.id];
  if (close != null && (!o || ptGap(b, o) > close)) return 0; // (an uppercut is only thrown up close)
  return pct;
}

// ---------------------------------------------------------------- timing

// From punchHitAt / punchEndAt (hook-punch.js).
function ptHitAt(b, p) { var k = ptKind(p), c = ptCfg(b, k); return ptVal(c, k, "dip") + ptVal(c, k, "drive") * ptKHit(k); }
function ptEndAt(b, p) { var k = ptKind(p), c = ptCfg(b, k); return ptVal(c, k, "dip") + ptVal(c, k, "drive") + ptVal(c, k, "recover"); }
// From hookShove: its own knockback, if it has one.
function ptKnockback(b, p, kb) { var k = ptKind(p), v = k ? ptVal(ptCfg(b, k), k, "knockback") : null; return v != null ? v : kb; }

// ---------------------------------------------------------------- landing

// In place of hurt(o, hookDamage(b, p, dmg), "punch", b.id). With no
// setup on them and no uppercut or body shot, it's exactly that.
function punchHurt(b, o, p, dmg) {
  var kind = ptKind(p), s = o.ptSetup, big = !!(s && s.by === b.id && s.t > 0 && kind !== "body"); // a head shot into a setup
  if (kind) {
    var pc = ptCfg(b, kind), cc = ptVal(pc, kind, "critChance");
    dmg *= ptVal(pc, kind, "damageMult");
    if (cc > 0 && Math.random() * 100 < cc) { p.crit = true; dmg *= ptVal(pc, kind, "critMult"); } // (only a block with critChance rolls)
  }
  if (big) dmg *= s.mult;
  dmg = hookDamage(b, p, dmg);
  var drop = big ? (s.guardDrop || 0) : 0, bb = o.blockBonus, dealt = 0;
  if (drop) o.blockBonus = (bb || 0) - drop; // their guard is down
  try { dealt = hurt(o, dmg, "punch", b.id); } finally { if (drop) o.blockBonus = bb; }
  if (kind || big || b.ptN) ptLanded(b, o, p, kind, dealt, big ? s : null);
  return dealt;
}

function ptLanded(b, o, p, kind, dealt, used) {
  var n = ptStats(b), ok = dealt > 0;
  if (n && ok) {
    if (p && p.hook) n.hooksLanded++;
    if (kind) n[kind === "upper" ? "uppersLanded" : "bodiesLanded"]++;
    if (p && p.crit) n.crits++;
  }
  var dx = o.x - b.x, dy = o.y - b.y, d = Math.sqrt(dx * dx + dy * dy) || 1, ux = dx / d, uy = dy / d;
  if (used) {
    o.ptSetup = null; // used up, landed or not
    if (ok) { if (n) n.bigShots++; ptBigShot(b, o, used, ux, uy); }
  }
  if (kind && ok && p.crit) ptCrit(b, o, kind, ux, uy);
  if (!kind || !ok || !o.alive || o.koOut) return;
  var c = ptCfg(b, kind), st = ptVal(c, kind, "setupTime");
  if (st > 0) {
    o.ptSetup = { by: b.id, kind: kind, t: st, max: st, mult: ptVal(c, kind, "setupMult"), guardDrop: ptVal(c, kind, "guardDrop"),
      text: ptVal(c, kind, "text"), color: ptVal(c, kind, "color") };
    if (n) n.setups++;
  }
  o.ptPose = { kind: kind, t: 0, max: Math.max(0.05, ptVal(c, kind, "tell")), ux: ux, uy: uy };
  var col = ptVal(c, kind, "color");
  if (kind === "body") {
    var bx = o.x - ux * o.r * 0.55, by = o.y + o.r * 0.35;
    impacts.push({ x: bx, y: by, nx: -ux, ny: -uy, life: 0.3, max: 0.3, color: col });
    if (!reduceMotion) {
      for (var i = 0; i < 6; i++) { // sweat off their back
        var a = Math.atan2(uy, ux) + (nativeRandom() - 0.5) * 1.6, sp = 120 + nativeRandom() * 160;
        particles.push({ x: o.x + ux * o.r * 0.5, y: o.y - o.r * 0.1, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 60, life: 0.4, max: 0.4, size: 2 + nativeRandom() * 2, color: i % 2 ? "#e8f6ff" : "#9fd8ff" });
      }
      shake = Math.max(shake, 5);
    }
    playPtBody();
  } else {
    var cx = o.x - ux * o.r * 0.6, cy = o.y - o.r * 0.35;
    impacts.push({ x: cx, y: cy, nx: 0, ny: 1, life: 0.32, max: 0.32, color: col });
    if (!reduceMotion) {
      for (var j = 0; j < 7; j++) { // sparks going up off the chin
        var a2 = -Math.PI / 2 + (nativeRandom() - 0.5) * 1.1, sp2 = 180 + nativeRandom() * 200;
        particles.push({ x: cx, y: cy, vx: Math.cos(a2) * sp2, vy: Math.sin(a2) * sp2, life: 0.35, max: 0.35, size: 2 + nativeRandom() * 2.5, color: j % 2 ? "#ffffff" : col });
      }
      shake = Math.max(shake, 6);
    }
    playPtUpper();
  }
}

// A crit (critChance): its own text, a freeze frame and the big sound.
function ptCrit(b, o, kind, ux, uy) {
  var c = ptCfg(b, kind), txt = ptVal(c, kind, "critText") || PT_CRIT_TEXT[kind];
  if (o.alive && txt) floater(o.x, o.y - o.r - 62, txt, "crit");
  impacts.push({ x: o.x - ux * o.r * 0.6, y: o.y - o.r * 0.3, nx: 0, ny: -1, life: 0.45, max: 0.45, color: ptVal(c, kind, "color") });
  hitStop = Math.max(hitStop, 0.06);
  if (!reduceMotion) shake = Math.max(shake, 12);
  crowdReact(0.35);
  playPtBig();
}

// The head shot it set up, landing: the bigger shot.
function ptBigShot(b, o, s, ux, uy) {
  var hx = o.x - ux * o.r * 0.7, hy = o.y - uy * o.r * 0.7;
  impacts.push({ x: hx, y: hy, nx: ux, ny: uy, life: 0.5, max: 0.5, color: s.color });
  o.ptBoom = { t: 0, max: 0.55, color: s.color };
  if (o.alive && s.text) floater(o.x, o.y - o.r - 40, s.text, "crit");
  if (o.alive) o.flash = Math.max(o.flash || 0, 0.15);
  hitStop = Math.max(hitStop, 0.05);
  if (!reduceMotion) shake = Math.max(shake, 11);
  crowdReact(0.3);
  playPtBig();
}

// ---------------------------------------------------------------- the counter

// An uppercut as they come in (uppercuts.onGrab): from attemptGrab
// (grapple-duel.js: a grab or a takedown shot), startPlum (knees.js: the
// clinch), startJonClinch (jon-clinch.js) and updateGuard (guard.js: being
// pulled into the guard). `b` is the one being grabbed, `atk` the one
// grabbing. onGrab% of the time he answers with a short uppercut (no dip:
// it's a reflex) that can crit; if it lands, the grab is stuffed
// (counterText), they're shoved off (counterKnockback) and he steps back
// (`back`, px/s). True when it's stuffed. At most one every counterGap
// seconds, and a fighter without onGrab rolls nothing.
function uppercutCounter(b, atk, back) {
  var c = ptCfg(b, "upper"), pct = c ? ptVal(c, "upper", "onGrab") : 0;
  if (!(pct > 0) || !atk || !b.alive || !atk.alive || over || !b.char.hasPunch) return false;
  if (b.koOut || b.dazed || b.dizzy || b.grappled || b.grapple || b.sprawl || b.sprawled || b.slam || b.guard || b.igbb || subLocked(b) || specialBusy(b)) return false;
  if ((b.ptCounterT || 0) > 0) return false;
  b.ptCounterT = ptVal(c, "upper", "counterGap");
  if (Math.random() * 100 >= pct) return false;
  var n = ptStats(b), p = { t: 0, hit: true, upper: true, side: 1, counter: true };
  p.t = Math.max(ptVal(c, "upper", "dip"), ptHitAt(b, p) - 0.05); // (already coming up)
  b.punch = p; b.kick = null; b.swing = null; b.throwAnim = null;
  b.punchCd = Math.max(b.punchCd || 0, b.char.punch.cooldown * 0.5);
  if (n) { n.counters++; n.uppers++; }
  var dealt = punchHurt(b, atk, p, b.char.punch.damage * ptVal(c, "upper", "counterMult"));
  if (!(dealt > 0)) return false; // blocked or slipped: the grab goes on
  if (n) n.stuffed++;
  var dx = atk.x - b.x, dy = atk.y - b.y, d = Math.sqrt(dx * dx + dy * dy) || 1, kb = ptVal(c, "upper", "counterKnockback");
  if (atk.alive && !atk.koOut) { atk.vx = dx / d * kb; atk.vy = dy / d * kb; }
  if (back) { b.vx = -dx / d * back; b.vy = -dy / d * back; }
  if (atk.char.hasGrapple && atk.char.grapple) atk.grappleCd = Math.max(atk.grappleCd || 0, atk.char.grapple.cooldown);
  var txt = ptVal(c, "upper", "counterText");
  if (txt && atk.alive) floater((b.x + atk.x) / 2, Math.min(b.y, atk.y) - b.r - 30, txt, "dodge");
  return true;
}

// ---------------------------------------------------------------- every frame

// From update.js: setups wearing off, the tell, the ring.
function tickPunchTypes(dt) {
  balls.forEach(function (b) {
    if (b.ptCounterT > 0) b.ptCounterT -= dt;
    if (b.ptSetup) { b.ptSetup.t -= dt; if (b.ptSetup.t <= 0 || !b.alive) b.ptSetup = null; }
    if (b.ptPose) { b.ptPose.t += dt; if (b.ptPose.t >= b.ptPose.max) b.ptPose = null; }
    if (b.ptBoom) { b.ptBoom.t += dt; if (b.ptBoom.t >= b.ptBoom.max) b.ptBoom = null; }
  });
}

// ---------------------------------------------------------------- the glove

// The glove's spot `k` of the way through the drive (0: low, where it
// dropped to; ptKHit: on them; 1: the end of the follow-through).
function ptPath(b, o, kind, k, s) {
  var dx = o.x - b.x, dy = o.y - b.y, d = Math.sqrt(dx * dx + dy * dy) || 1, nx = dx / d, ny = dy / d, R = o.r;
  var L = ptLow(b, o, kind, s);
  if (kind === "upper") {
    // their chin, on the edge of them facing him (when they're straight above
    // or below him, on his punching hand's side, so it rises beside them)
    var cx = o.x - nx * R * 0.75 - ny * R * 0.7 * s * (1 - Math.abs(nx)), cy = o.y - R * 0.25;
    var U = { x: cx, y: cy + R }, rise = R / PT_UP_CHIN; // under it, by their bottom edge
    if (k <= PT_UP_SPLIT) {
      var u = Math.max(0, k) / PT_UP_SPLIT, mx = (L.x + U.x) / 2, my = Math.max(L.y, U.y) + b.r * 0.35;
      return ptQuad(L.x, L.y, mx, my, U.x, U.y, u);
    }
    var v = (k - PT_UP_SPLIT) / (1 - PT_UP_SPLIT);
    return { x: U.x, y: U.y - rise * v }; // straight up, past their chin
  }
  // a body shot: a short hook to the body, from out wide and low on his
  // punching side, curving in under their guard into their belly on his
  // side, digging in
  var tx = o.x - nx * R * 0.6, ty = o.y + R * 0.35, fx = tx + nx * R * 0.25, fy = ty + ny * R * 0.25;
  var qx = (L.x + tx) / 2 - ny * b.r * 0.6 * s, qy = (L.y + ty) / 2 + nx * b.r * 0.6 * s + b.r * 0.35;
  if (k <= PT_BODY_HIT) return ptQuad(L.x, L.y, qx, qy, tx, ty, Math.max(0, k) / PT_BODY_HIT);
  var w = (k - PT_BODY_HIT) / (1 - PT_BODY_HIT);
  return { x: tx + (fx - tx) * w, y: ty + (fy - ty) * w };
}

function ptQuad(x0, y0, x1, y1, x2, y2, u) {
  var a = (1 - u) * (1 - u), m = 2 * (1 - u) * u, c = u * u;
  return { x: a * x0 + m * x1 + c * x2, y: a * y0 + m * y1 + c * y2 };
}

// Where the glove drops to in the dip: by his hip (uppercut), or his waist
// on his side of them (body shot). `s` is the hand.
function ptLow(b, o, kind, s) {
  var dx = o.x - b.x, dy = o.y - b.y, d = Math.sqrt(dx * dx + dy * dy) || 1, nx = dx / d, ny = dy / d, r = b.r;
  if (kind === "upper") return { x: b.x + nx * r * 0.45 - ny * r * 0.35 * s, y: b.y + r * 1.05 };
  return { x: b.x + nx * r * 0.35 - ny * r * 0.95 * s, y: b.y + r * 0.6 + nx * r * 0.3 * s }; // (out wide on his punching side, low)
}

// Where an uppercut's or a body shot's glove is right now:
// { x, y, r, phase: "dip" | "drive" | "recover", k, w, q, kind }, or null.
function punchTypeGlove(b, o) {
  var p = b.punch, kind = ptKind(p);
  if (!kind || !o) return null;
  var c = ptCfg(b, kind), s = p.side || 1, dip = ptVal(c, kind, "dip"), drive = ptVal(c, kind, "drive"), rec = ptVal(c, kind, "recover");
  var a = Math.atan2(o.y - b.y, o.x - b.x), r = b.r, gr = b.char.punch.size * ptVal(c, kind, "size");
  var gx = b.x + Math.cos(a) * r * 0.8 - Math.sin(a) * r * 0.4 * s, gy = b.y + Math.sin(a) * r * 0.8 + Math.cos(a) * r * 0.4 * s; // the guard slot
  if (p.t < dip) {
    var w = dip > 0 ? p.t / dip : 1, e = w * (2 - w), L = ptLow(b, o, kind, s);
    return { x: gx + (L.x - gx) * e, y: gy + (L.y - gy) * e, r: gr, phase: "dip", k: 0, w: w, kind: kind };
  }
  var k = drive > 0 ? (p.t - dip) / drive : 1;
  if (k < 1) { var h = ptPath(b, o, kind, k, s); return { x: h.x, y: h.y, r: gr, phase: "drive", k: k, w: 1, kind: kind }; }
  var end = ptPath(b, o, kind, 1, s), q = Math.min(1, (p.t - dip - drive) / Math.max(0.01, rec));
  // (if it knocked them away, the glove comes back from arm's length, not from where they went)
  var ex = end.x - b.x, ey = end.y - b.y, el = Math.sqrt(ex * ex + ey * ey) || 1, arm = r + b.char.punch.reach;
  var far = el > arm;
  if (far) end = { x: b.x + ex / el * arm, y: b.y + ey / el * arm };
  return { x: end.x + (gx - end.x) * q, y: end.y + (gy - end.y) * q, r: gr, phase: "recover", k: 1, q: q, w: 1, kind: kind, far: far };
}

// ---------------------------------------------------------------- drawing

// From drawFist (draw-attacks.js): true for an uppercut or a body shot (the
// straight punch isn't drawn; drawPunchTypesOver draws it, over both
// fighters, so it isn't hidden under them up close).
function drawPunchTypeFist(self, other) { return !!(ptKind(self.punch) && other.alive); }

// From draw(), for each fighter after both are drawn: the uppercut or body
// shot, its tell, swoosh, arm and glove.
function drawPunchTypesOver(self) {
  var other = balls[1 - self.id], p = self.punch, kind = ptKind(p);
  if (!kind || !other || !other.alive || !self.alive || self.taunt || self.flow || self.combo) return;
  var f = punchTypeGlove(self, other);
  if (!f) return;
  var c = ptCfg(self, kind), s = p.side || 1, pu = self.char.punch, col = ptVal(c, kind, "color");
  var a = Math.atan2(other.y - self.y, other.x - self.x);
  var shA = a + s * Math.PI / 2, sx = self.x + Math.cos(shA) * self.r * 0.55, sy = self.y + Math.sin(shA) * self.r * 0.55;
  if (kind === "body") sy += self.r * 0.15; // (a lower shoulder: he's dipped)
  ctx.save();
  ctx.lineCap = "round"; ctx.lineJoin = "round";
  var kh = ptKHit(kind), w = f.r * 1.35 * ptVal(c, kind, "width");
  if (f.phase === "dip") {
    // the tell: a dashed line along where it's about to go, with an arrowhead
    ctx.setLineDash([8, 6]);
    ctx.globalAlpha = 0.3 + 0.6 * f.w;
    var k0 = kind === "upper" ? PT_UP_SPLIT * 0.5 : 0.15;
    ptStroke(self, other, kind, s, k0, kh + 0.04, "#1a1208", 6);
    ptStroke(self, other, kind, s, k0, kh + 0.04, col, 3.5);
    ctx.setLineDash([]);
    ptArrowHead(self, other, kind, s, kh + 0.04, col);
  } else {
    var al = f.phase === "recover" ? (f.far ? 0 : 1 - f.q) : 1, k1 = f.phase === "drive" ? f.k : 1, k0b = Math.max(0, k1 - (kind === "upper" ? 0.62 : 0.7));
    if (al > 0.02 && k1 - k0b > 0.03) {
      ctx.globalAlpha = al;
      ptSwoosh(self, other, kind, s, k0b, k1, w + 6, "#1a1208");
      ptSwoosh(self, other, kind, s, k0b, k1, w, col);
      ptSwoosh(self, other, kind, s, k0b + (k1 - k0b) * 0.35, k1, w * 0.4, "#fff6cf");
      if (kind === "upper" && k1 > PT_UP_SPLIT) {
        // rising speed lines either side of it
        var top = ptPath(self, other, kind, k1, s), bot = ptPath(self, other, kind, Math.max(PT_UP_SPLIT, k1 - 0.4), s);
        [1, -1].forEach(function (side) {
          var ox = side * (w * 0.5 + 8);
          ctx.strokeStyle = "#1a1208"; ctx.lineWidth = 6;
          ctx.beginPath(); ctx.moveTo(bot.x + ox, bot.y + 10); ctx.lineTo(top.x + ox, top.y + f.r * 0.9); ctx.stroke();
          ctx.strokeStyle = col; ctx.lineWidth = 3;
          ctx.beginPath(); ctx.moveTo(bot.x + ox, bot.y + 10); ctx.lineTo(top.x + ox, top.y + f.r * 0.9); ctx.stroke();
        });
      }
    }
    if (f.phase === "drive") {
      [0.12, 0.24].forEach(function (back, i) { // ghost gloves along the path
        if (f.k - back <= k0b) return;
        var gh = ptPath(self, other, kind, f.k - back, s);
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
  if (s === 1 || hasTwoSleeves(self.char)) drawTracedArm(ctx, self.char, sx, sy, f.x, f.y, pu.size * 0.6, s); // sleeve on one arm only (as drawFist)
  ctx.fillStyle = gloveColor(self.char); ctx.strokeStyle = theme.wall; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  if (f.phase === "dip") {
    // the dropped glove flickers: it's coming
    ctx.globalAlpha = 0.45 + 0.3 * Math.sin(performance.now() / 45);
    ctx.strokeStyle = col; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(f.x, f.y, f.r + 5, 0, Math.PI * 2); ctx.stroke();
  }
  ctx.restore();
}

function ptPoints(b, o, kind, s, k0, k1, N) {
  var pts = [];
  for (var i = 0; i <= N; i++) pts.push(ptPath(b, o, kind, k0 + (k1 - k0) * i / N, s));
  return pts;
}

function ptStroke(b, o, kind, s, k0, k1, color, width) {
  var pts = ptPoints(b, o, kind, s, k0, k1, 14);
  ctx.strokeStyle = color; ctx.lineWidth = width;
  ctx.beginPath(); ctx.moveTo(pts[0].x, pts[0].y);
  for (var i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
  ctx.stroke();
}

function ptArrowHead(b, o, kind, s, k, color) {
  var p1 = ptPath(b, o, kind, k, s), p0 = ptPath(b, o, kind, k - 0.06, s);
  var ang = Math.atan2(p1.y - p0.y, p1.x - p0.x), L = 13;
  ctx.fillStyle = color; ctx.strokeStyle = "#1a1208"; ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(p1.x + Math.cos(ang) * L * 0.6, p1.y + Math.sin(ang) * L * 0.6);
  ctx.lineTo(p1.x + Math.cos(ang + 2.5) * L, p1.y + Math.sin(ang + 2.5) * L);
  ctx.lineTo(p1.x + Math.cos(ang - 2.5) * L, p1.y + Math.sin(ang - 2.5) * L);
  ctx.closePath(); ctx.stroke(); ctx.fill();
}

// A crescent along the path from k0 (a point) to k1 (wMax wide, rounded
// off at the glove end), like the hook's swoosh.
function ptSwoosh(b, o, kind, s, k0, k1, wMax, color) {
  var N = 16, pts = ptPoints(b, o, kind, s, k0, k1, N), side1 = [], side2 = [], i;
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

// From draw.js's pose list: him dipping his level into one (and driving up
// out of the crouch on an uppercut), and them folding over a body shot or
// their chin snapping up from an uppercut.
function applyPunchTypePose(b) {
  var p = b.punch, kind = ptKind(p);
  if (kind) {
    var c = ptCfg(b, kind), dip = ptVal(c, kind, "dip"), drive = ptVal(c, kind, "drive"), hitAt = dip + drive * ptKHit(kind), cr = 0;
    if (p.t < dip) cr = dip > 0 ? p.t / dip : 1;
    else if (p.t < hitAt) cr = 1 - (p.t - dip) / Math.max(0.01, hitAt - dip);
    var up = kind === "upper" && p.t >= dip && p.t < hitAt + 0.08 ? Math.sin(Math.min(1, (p.t - dip) / Math.max(0.01, hitAt + 0.08 - dip)) * Math.PI) : 0;
    var deep = kind === "body" ? 1.3 : 1;
    ctx.translate(b.x, b.y + b.r);
    ctx.scale(1 + 0.05 * cr * deep - 0.03 * up, 1 - 0.09 * cr * deep + 0.07 * up);
    ctx.translate(-b.x, -(b.y + b.r));
  }
  var q = b.ptPose;
  if (!q || !b.alive) return;
  var k = q.t / q.max, env = k < 0.15 ? k / 0.15 : (k < 0.55 ? 1 : 1 - (k - 0.55) / 0.45);
  ctx.translate(b.x, b.y + b.r);
  if (q.kind === "body") {
    ctx.rotate(-0.38 * env * q.ux); // folds over toward him
    ctx.scale(1 + 0.08 * env, 1 - 0.15 * env);
  } else {
    ctx.translate(0, -5 * env); // lifted
    ctx.rotate(0.26 * env * q.ux); // head snapped back, away from him
    ctx.scale(1 - 0.06 * env, 1 + 0.12 * env);
  }
  ctx.translate(-b.x, -(b.y + b.r));
}

// From draw(), per fighter, after its hands: the setup on them (a ring in
// the punch's colour, running down), the fold or the snap lines, and the
// ring off the big shot.
function drawPunchSetup(b) {
  if (!b.ptSetup && !b.ptPose && !b.ptBoom) return;
  ctx.save();
  ctx.lineCap = "round";
  var s = b.ptSetup;
  if (s && b.alive) {
    var k = Math.max(0, s.t / s.max), R = b.r + 8, spin = performance.now() / 600;
    ctx.globalAlpha = 0.55 + 0.25 * Math.sin(performance.now() / 70);
    ctx.setLineDash([7, 7]); ctx.lineDashOffset = -spin * 30;
    ctx.strokeStyle = "#1a1208"; ctx.lineWidth = 6;
    ctx.beginPath(); ctx.arc(b.x, b.y, R, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = s.color; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(b.x, b.y, R, 0, Math.PI * 2); ctx.stroke();
    ctx.setLineDash([]);
    ctx.globalAlpha = 0.95; // the time left: a solid arc under them, shrinking to the middle (clear of the health bar)
    var sw = Math.PI * 0.8 * k;
    ctx.strokeStyle = "#1a1208"; ctx.lineWidth = 8;
    ctx.beginPath(); ctx.arc(b.x, b.y, R + 6, Math.PI / 2 - sw, Math.PI / 2 + sw); ctx.stroke();
    ctx.strokeStyle = s.color; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.arc(b.x, b.y, R + 6, Math.PI / 2 - sw, Math.PI / 2 + sw); ctx.stroke();
  }
  var q = b.ptPose;
  if (q && b.alive) {
    var e = q.t / q.max, al = e < 0.6 ? 1 : 1 - (e - 0.6) / 0.4;
    ctx.globalAlpha = al;
    if (q.kind === "body") {
      // the dent where it dug in, on his side of their belly
      var cx = b.x - q.ux * b.r * 0.62, cy = b.y + b.r * 0.36, ang = Math.atan2(-q.uy * 0.3, -q.ux);
      ctx.strokeStyle = "#1a1208"; ctx.lineWidth = 5;
      ctx.beginPath(); ctx.arc(cx, cy, b.r * 0.32, ang - 1.1, ang + 1.1); ctx.stroke();
      ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.arc(cx, cy, b.r * 0.32, ang - 1.1, ang + 1.1); ctx.stroke();
    } else {
      // snap lines off the top of their head (clear of the health bar)
      [-1.1, -0.55, 0.55, 1.1].forEach(function (da) {
        var an = -Math.PI / 2 + da, r0 = b.r + 4 + e * 6, r1 = r0 + 14;
        ctx.strokeStyle = "#1a1208"; ctx.lineWidth = 5;
        ctx.beginPath(); ctx.moveTo(b.x + Math.cos(an) * r0, b.y + Math.sin(an) * r0); ctx.lineTo(b.x + Math.cos(an) * r1, b.y + Math.sin(an) * r1); ctx.stroke();
        ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.moveTo(b.x + Math.cos(an) * r0, b.y + Math.sin(an) * r0); ctx.lineTo(b.x + Math.cos(an) * r1, b.y + Math.sin(an) * r1); ctx.stroke();
      });
    }
  }
  var bm = b.ptBoom;
  if (bm) {
    var k2 = bm.t / bm.max;
    ctx.globalAlpha = 1 - k2;
    ctx.strokeStyle = "#1a1208"; ctx.lineWidth = 9 * (1 - k2) + 3;
    ctx.beginPath(); ctx.arc(b.x, b.y, b.r + 8 + 60 * k2, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = bm.color; ctx.lineWidth = 6 * (1 - k2) + 2;
    ctx.beginPath(); ctx.arc(b.x, b.y, b.r + 8 + 60 * k2, 0, Math.PI * 2); ctx.stroke();
  }
  ctx.restore();
}

// ---------------------------------------------------------------- sounds

function ptAudio(fn) {
  try {
    var ac = getAudioCtx();
    if (!ac) return;
    if (ac.state === "suspended") ac.resume();
    fn(ac, ac.currentTime);
  } catch (e) { /* never let audio break the game */ }
}
function playPtBody() { ptAudio(function (ac, t) { caneTone(ac, t, "sine", 120, 48, 0.45, 0.2); caneBurst(ac, t, 320, 0.8, 0.28, 0.07); }); }
function playPtUpper() { ptAudio(function (ac, t) { caneTone(ac, t, "triangle", 190, 560, 0.24, 0.12); caneBurst(ac, t, 1600, 0.9, 0.3, 0.05); }); }
function playPtBig() { ptAudio(function (ac, t) { caneTone(ac, t, "sine", 170, 46, 0.5, 0.4); caneBurst(ac, t, 1900, 0.9, 0.38, 0.07); caneBurst(ac, t + 0.012, 480, 0.7, 0.34, 0.2); }); }

// ---------------------------------------------------------------- gallery

// The fighter card's move list (gallery.js).
function punchTypeGalleryMoves(ch, add) {
  [["upper", "⤴️", "Uppercuts", "The glove drops low by his hip, then comes straight up through their chin from underneath, up close only"],
   ["body", "🎯", "Body shots", "He dips and digs the glove in low to their belly, and they fold over it"]].forEach(function (row) {
    var kind = row[0], c = ptCfg({ char: ch }, kind);
    if (!c) return;
    var bits = [], ch1 = ptVal(c, kind, "chance"), fin = ptVal(c, kind, "finisherChance"), bf = ptVal(c, kind, "beforeFinisher");
    if (ch1 > 0) bits.push(ch1 + "% of his punches");
    if (bf != null && bf > 0) bits.push(bf + "% of the punches right before a combo's last one");
    if (fin > 0) bits.push(fin + "% of his combo finishers");
    var extra = "";
    if (ptVal(c, kind, "critChance") > 0) extra += " " + ptVal(c, kind, "critChance") + "% of them crit for " + ptVal(c, kind, "critMult") + "x.";
    if (kind === "upper" && ptVal(c, kind, "onGrab") > 0) extra += " When someone grabs him, shoots, ties him up or pulls him into guard, " + ptVal(c, kind, "onGrab") + "% of the time he answers with one, and if it lands the grab is stuffed.";
    add(row[1], row[2], row[3] + (bits.length ? " (" + bits.join(", ") + ")" : "") + ". One that lands sets them up: his next head shot within " +
      ptVal(c, kind, "setupTime") + "s does " + ptVal(c, kind, "setupMult") + "x" + (ptVal(c, kind, "guardDrop") > 0 ? " and their guard is down" : "") + "." + extra);
  });
}
