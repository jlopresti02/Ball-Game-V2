// Ilia Topuria's combos (Christian, 2026-11-14). In place of the punches
// that built up as he got hurt (Joe's ramp in ilia.js), he throws 3 and 4
// punch combos all fight, off alternating hands, and every punch that lands
// sets up the next one. Land the whole combo and the last punch is the
// finisher. Everything is under "chain" in his ramp block:
//
//   "ramp": { "dmgStart": 8, ..., "chain": { "size": [3, 4], "build": 0.3,
//             "finisher": [4, 5], "cooldown": [1.0, 0.6], "knockback": 560,
//             "text": "{n}-PIECE!" } }
//
// dmgStart   (ramp) the first punch of every combo (8).
// size       how many punches in a combo, a whole number picked at random
//            in the range.
// build      every punch that lands makes the next one hit this share of
//            dmgStart harder: 8, 10.4, 12.8 ...
// finisher   land every punch and the last one hits this many times
//            dmgStart (4x is 32). The first number at full health, the
//            second at zero: the more hurt he is, the harder it lands (the
//            flavor of the old ramp). It reads big: the glove swells in a
//            red and white-hot flare, the frame freezes, a gold ring goes
//            out from the hit, they're shoved off (`knockback`) and `text`
//            ({n} is the number of punches) goes up over them.
// cooldown   seconds between combos, at full health and at zero: the more
//            hurt he is, the faster they come.
// A punch that misses (they're out of reach), or is slipped, blocked or
// parried, breaks the chain: the rest of that combo is off.
// The last punch is a hook most of the time (his "hooks" block, the shared
// hook in hook-punch.js: finisherChance 80): it's cocked out wide, comes
// round from the side and hits damageMult (1.25) times the finisher, with
// the glove glowing white-hot (p.hookHeat). He keeps walking in while it
// swings so it reaches.
// ramp.comboKnockback, ramp.comboSlack and ramp.chase still do what they
// did (the small shove of the punches before the last, the extra reach,
// and walking in behind the combo). Take "chain" out and Joe's ramp is back
// exactly as it was.
//
// A finished combo calls commentaryCall("combo") if commentary-calls.js is in
// the build (not when the finisher is the knockout: that gets its own call).
"use strict";

var ILC_GOLD = "#ffcc33", ILC_RED = "#e0281c";
var ilcFx = []; // finisher rings and their text: { x, y, tx, ty, t, max, text, balls }

function ilcCfg(b) { var r = b && b.char && b.char.ramp; return r && r.chain ? r.chain : null; }
// From ilia.js's updateRampPunch: true when his ramp has a chain block.
function iliaChainOn(b) { return !!ilcCfg(b); }
// 0 at full health, 1 at zero health.
function ilcLost(b) { return 1 - Math.max(0, Math.min(1, b.hp / MAX_HP)); }
// A [full health, zero health] pair read at k (a plain number is both).
function ilcAt(v, k) { return Array.isArray(v) ? v[0] + (v[1] - v[0]) * Math.max(0, Math.min(1, k)) : v; }
function ilcSize(c) {
  var s = c.size;
  if (!Array.isArray(s)) return Math.max(1, Math.round(s || 1));
  return Math.max(1, Math.round(s[0]) + Math.floor(Math.random() * (Math.round(s[1]) - Math.round(s[0]) + 1)));
}
function ilcFinishing(p) { return !!(p && p.ilc && p.n > 1 && p.idx === p.n - 1); }

// How hard punch `idx` of an `n`-punch combo hits, with every one before it landed.
function ilcDamage(self, c, idx, n) {
  var base = self.char.ramp.dmgStart;
  if (n > 1 && idx === n - 1) return base * ilcAt(c.finisher, ilcLost(self));
  return base * (1 + (c.build || 0) * idx);
}

// From ilia.js's updateRampPunch, in place of the ramp.
function iliaChainPunch(self, other, dt, d) {
  var pu = self.char.punch, r = self.char.ramp, c = r.chain, reach = self.r + other.r + pu.reach;
  self.punchCd = Math.max(0, self.punchCd - dt * self.atkRate);
  if (!self.punch && !self.kick && !self.swing && self.punchCd === 0 && other.alive && d < reach) {
    var n = ilcSize(c);
    self.punch = ilcPunch(self, { t: 0, hit: false, side: 1, left: n - 1, n: n, idx: 0, ilc: true });
    self.punchCd = ilcAt(c.cooldown, ilcLost(self));
  }
  var p = self.punch;
  if (!p) return;
  p.t += dt;
  // Mid combo (and while a hook swings in) he keeps walking into range so it reaches.
  if ((p.left > 0 || (p.hook && !p.hit)) && other.alive) {
    var gap = d - self.r - other.r;
    if (gap > pu.reach * 0.5) {
      var sp = Math.min(r.chase, (gap - pu.reach * 0.5) * 20);
      self.vx = (other.x - self.x) / d * sp; self.vy = (other.y - self.y) / d * sp;
    }
  }
  if (!p.hit && p.t >= punchHitAt(self, p)) {
    p.hit = true;
    var fin = ilcFinishing(p), landed = false;
    if (other.alive && d < reach + r.comboSlack) {
      var dealt = hurt(other, hookDamage(self, p, ilcDamage(self, c, p.idx, p.n)), "punch", self.id); // (a hook hits harder, hook-punch.js)
      landed = dealt > 0;
      if (landed) { playPunch(dealt); if (!fin) violentHit(self, other, p.left === 0 ? 0.5 : 0.25); }
      var kb = fin ? (c.knockback != null ? c.knockback : pu.knockback) : (p.left === 0 ? pu.knockback : r.comboKnockback);
      if (!other.justDodged && ilcKnockable(other)) hookShove(self, other, p, kb); // (a hook shoves them sideways)
      if (landed && fin) ilcFinisher(self, other, p.n);
      else if (!reduceMotion) shake = Math.max(shake, Math.min(8, 2 + dealt * 0.3));
      checkEnd();
    }
    if (!landed) p.broke = true; // missed, slipped, blocked or parried: the chain breaks
  }
  if (self.punch === p && p.t >= punchEndAt(self, p)) {
    if (!p.broke && p.left > 0 && other.alive && self.alive && d < reach + r.comboSlack * 2) {
      // The next punch, off the other hand.
      self.punch = ilcPunch(self, { t: 0, hit: false, side: -p.side, left: p.left - 1, n: p.n, idx: p.idx + 1, ilc: true });
    } else {
      self.punch = null;
    }
  }
}

// A new punch of the combo: the last one is a hook finisherChance% of the
// time (his "hooks" block, hook-punch.js), glowing white-hot.
function ilcPunch(self, p) {
  if (rollHook(self, p, p.left === 0 && p.n > 1) && p.n > 1) p.hookHeat = p.idx / (p.n - 1);
  return p;
}

function ilcKnockable(o) { return o.alive && !o.grappled && !o.grapple && !o.slam && !subLocked(o) && !o.koOut; }

// The whole combo landed: the finisher's freeze frame, ring, text and sound.
function ilcFinisher(self, other, n) {
  var c = ilcCfg(self), nx = other.x - self.x, ny = other.y - self.y, nd = Math.sqrt(nx * nx + ny * ny) || 1;
  nx /= nd; ny /= nd;
  var hx = other.x - nx * other.r * 0.7, hy = other.y - ny * other.r * 0.7;
  // The text goes over them, or under them if that's further from him (or
  // they're against the top of the cage), so it doesn't cover his hook.
  var above = other.y - other.r - 62, below = other.y + other.r + 46;
  var up = above > 34 && (below > H - 30 || Math.abs(above - self.y) >= Math.abs(below - self.y));
  ilcFx.push({ x: hx, y: hy, tx: other.x, ty: up ? above : below, t: 0, max: 1.2,
    text: String((c && c.text) || "{n}-PIECE!").replace("{n}", n), balls: balls });
  impacts.push({ x: hx, y: hy, nx: nx, ny: ny, life: 0.5, max: 0.5, color: ILC_GOLD });
  if (other.alive) { other.squash = { t: 0.26, max: 0.26, nx: nx, ny: ny }; other.flash = 0.2; }
  playIliaFinisher();
  crowdReact(0.45);
  if (!reduceMotion) {
    shake = Math.max(shake, 16);
    hitStop = Math.max(hitStop, 0.09);
    for (var i = 0; i < 14; i++) {
      var a = Math.atan2(ny, nx) + (Math.random() - 0.5) * 2, s = 220 + Math.random() * 320;
      particles.push({ x: hx, y: hy, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 40, life: 0.4, max: 0.4, size: 3 + Math.random() * 3, color: i % 3 ? ILC_GOLD : ILC_RED });
    }
  }
  if (other.alive && typeof commentaryCall === "function") commentaryCall("combo", self, other); // (commentary-calls.js, when it's merged)
}

// ---------------------------------------------------------------- every frame

// From update.js.
function tickIliaCombos(dt) {
  if (!ilcFx.length) return;
  ilcFx = ilcFx.filter(function (f) { f.t += dt; return f.balls === balls && f.t < f.max; });
}

// ---------------------------------------------------------------- drawing

// From drawFist (draw-attacks.js): the glove heats up through the combo, and
// the finisher is a bigger glove in a red and white-hot flare.
function iliaFistOver(self, x, y, size) {
  var p = self.punch;
  if (!p || !p.ilc || p.n < 2 || p.idx === 0) return;
  ctx.save();
  if (ilcFinishing(p)) {
    var R = size * 2.5, g = ctx.createRadialGradient(x, y, size * 0.4, x, y, R);
    g.addColorStop(0, "rgba(255,246,214,0.95)");
    g.addColorStop(0.45, "rgba(255,110,40,0.6)");
    g.addColorStop(1, "rgba(224,40,28,0)");
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(x, y, R, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = gloveColor(self.char); ctx.strokeStyle = ILC_RED; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.arc(x, y, size * 1.35, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  } else {
    ctx.globalAlpha = 0.3 + 0.5 * p.idx / (p.n - 1);
    ctx.strokeStyle = ILC_RED; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(x, y, size + 4, 0, Math.PI * 2); ctx.stroke();
  }
  ctx.restore();
}

// From draw.js, over the hit numbers: the ring going out from the finisher
// and its text popping in over them.
function drawIliaCombos() {
  if (!ilcFx.length) return;
  ctx.save();
  ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.lineJoin = "round";
  ilcFx.forEach(function (f) {
    if (f.balls !== balls) return;
    var rk = Math.min(1, f.t / 0.42), ease = 1 - (1 - rk) * (1 - rk);
    if (rk < 1) {
      ctx.globalAlpha = 1 - rk;
      ctx.strokeStyle = ILC_GOLD; ctx.lineWidth = 11 * (1 - rk) + 2;
      ctx.beginPath(); ctx.arc(f.x, f.y, 16 + 96 * ease, 0, Math.PI * 2); ctx.stroke();
      ctx.strokeStyle = ILC_RED; ctx.lineWidth = 6 * (1 - rk) + 1;
      ctx.beginPath(); ctx.arc(f.x, f.y, 10 + 62 * ease, 0, Math.PI * 2); ctx.stroke();
    }
    var k = f.t / f.max, pop = f.t < 0.14 ? 1.45 - 0.45 * f.t / 0.14 : 1;
    ctx.globalAlpha = k > 0.72 ? Math.max(0, (1 - k) / 0.28) : 1;
    var size = Math.round(48 * pop);
    ctx.font = "800 " + size + 'px "Barlow Condensed", "Arial Narrow", sans-serif';
    var halfW = ctx.measureText(f.text).width / 2 + 8;
    var x = Math.min(W - halfW, Math.max(halfW, f.tx)), y = Math.max(30, f.ty - 18 * k);
    ctx.lineWidth = 10; ctx.strokeStyle = "#2a0705"; ctx.strokeText(f.text, x, y);
    var gr = ctx.createLinearGradient(0, y - size / 2, 0, y + size / 2);
    gr.addColorStop(0, "#fff2b0"); gr.addColorStop(0.5, ILC_GOLD); gr.addColorStop(1, "#e8741c");
    ctx.fillStyle = gr; ctx.fillText(f.text, x, y);
  });
  ctx.restore();
}

// ---------------------------------------------------------------- sound

// The finisher: a deep thud under a sharp crack.
function playIliaFinisher() {
  try {
    var ac = getAudioCtx();
    if (!ac) return;
    if (ac.state === "suspended") ac.resume();
    var t = ac.currentTime;
    caneTone(ac, t, "sine", 150, 42, 0.55, 0.38);
    caneBurst(ac, t, 1900, 0.9, 0.42, 0.08);
    caneBurst(ac, t + 0.015, 420, 0.7, 0.4, 0.24);
  } catch (e) { /* never let audio break the game */ }
}

// ---------------------------------------------------------------- gallery

// The fighter card's move list (gallery.js).
function iliaComboGalleryMoves(ch, add) {
  var r = ch.ramp, c = r && r.chain;
  if (!c) return;
  var b = r.dmgStart, size = Array.isArray(c.size) ? c.size[0] + "-" + c.size[1] : c.size;
  var fin = Array.isArray(c.finisher) ? c.finisher : [c.finisher, c.finisher];
  var cd = Array.isArray(c.cooldown) ? c.cooldown : [c.cooldown, c.cooldown];
  var dm = function (k) { return Math.round(b * k * 10) / 10; };
  add("🥊", "Combos", size + "-punch combos off both hands, one every " + secs(cd[0]) + " at full health, down to " + secs(cd[1]) + " as he's hurt. Every punch that lands sets up the next (" +
    dm(1) + ", " + dm(1 + c.build) + ", " + dm(1 + 2 * c.build) + "...). A miss, a slip or a block breaks the chain.");
  var hk = ch.hooks && ch.hooks.finisherChance > 0 ? ch.hooks : null, hm = hk ? (hk.damageMult || 1) : 1;
  add("💥", "The finisher", "Land the whole combo and the last punch hits " + fin[0] + "x (" + dm(fin[0]) + ")" + (fin[1] !== fin[0] ? ", up to " + fin[1] + "x (" + dm(fin[1]) + ") the more hurt he is" : "") +
    (hk ? ". " + hk.finisherChance + "% of the time it's a hook that comes round from the side, " + hm + "x on top (" + dm(fin[0] * hm) + ")" : "") +
    ": a freeze frame, a gold ring and " + String(c.text || "{n}-PIECE!").replace("{n}", "4") + " over them.");
}
