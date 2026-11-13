// Chuck Liddell, "The Iceman" (Christian, 2026-11-12). Light Heavyweight, on
// the CTE base: looping, telegraphed hooks (the CTE swing) for his overhand
// right. Everything below is tuned in his character file under "iceman" and
// "special".
//
// Slow start  he rolls slowly (char.speedMult) and his hooks start slow and
//             soft: the wind-up runs from iceman.warmup.windup down to his
//             normal swing.windup, and the damage from warmup.damage up to
//             full, as the opponent's gloves frost over (fully warm at
//             warmup.at of full frost). Early on he's easy to hit and usually
//             behind.
// Frost       every punch that lands on him frosts the puncher's gloves
//             (iceman.frost): `perHit` plus `perDamage` for every point of
//             damage, up to full frost. Their gloves turn icy, with ice
//             crystals growing on them. At full frost they hit `soften`
//             softer (their special moves too, with `softenSpecials`), roll
//             `slow` slower (slowdown.js) and attack `atkSlow`
//             slower and slip or block his hooks `stiff` less often. Their
//             special meter fills `chargeSlow` slower, and their punches charge
//             it `hitChargeSlow` less. He hits `power` harder. It melts at `thaw` a second
//             once `hold` seconds have gone by without a new hit. Only the
//             strikes in `sources` frost them. (Ilia gets stronger as he's
//             hurt; with Chuck it's the opponent who gets weaker.)
// Snowfall    a few times a fight it snows in the arena (iceman.snow): first
//             after `first` seconds, then every `every`, for `time` seconds.
//             While it snows he rolls `speed`x faster and winds his hooks up
//             `windup`x as long.
// Ice flames  below `flames.below` of his health, blue ice flames lick up round
//             him, taller the more hurt he is: the tell that his comeback is
//             on. A look only.
// Snow Day    his special (special.move "snow"). It charges over time, with
//             every hit he lands (hitCut) and most of all as he gets hurt
//             (hurtCut seconds for every 10 damage he takes). Snow starts
//             falling, he bends down and scoops a double handful of snow off
//             the mat, packs it like a snowball ("I'm gonna knock his head
//             off."), blue ice flames roar up round him and the snow turns
//             into a blue flare on both gloves. Kept friendly on purpose: the
//             snow only ever goes from the mat into his gloves, held low in
//             front of his stomach, and never goes up near his head. Some
//             opponents see it coming and back off (readChance). Then the
//             all-out attack (special.rampage) for `time` seconds: he hunts
//             them down `speed`x as fast throwing nothing but looping overhand
//             rights, wound up in `windup`, doing `damage`x.
// Voice       "I'm gonna knock his head off." at the Snow Day wind-up. "I just
//             want to prove I do it better." when he comes back from at least
//             iceman.taunt.behind health down to take the lead, and now and
//             then as a taunt (every `every` seconds) (speech.js).
// The wind-up runs on b.igbb (move "snow"), like the other specials: he can't
// be hit while he's packing the snow. The all-out attack runs on b.iceRage and
// uses his normal swing, so he can be hit the whole time.
"use strict";

var IC_DIP = 0.45, IC_SCOOP = 0.4, IC_PACK = 0.65, IC_FLARE = 0.3; // the Snow Day wind-up
var IC_OVERHAND = 1;          // the hand his overhands come from (cte.js hookSide)
var IC_LINES = {
  windup: "I'm gonna knock his head off.",
  taunt: "I just want to prove I do it better."
};
// What a frosted glove looks like, in fractions of the glove's radius:
// where the ice crystals stick out round the rim, and how far.
var IC_CRYSTALS = [[0.2, 0.55], [1.05, 0.4], [1.9, 0.6], [2.7, 0.45], [3.5, 0.6], [4.3, 0.4], [5.1, 0.55], [5.8, 0.45]];
var icSnow = null;            // the snow falling in the arena: { t, dur }
var icClock = 0;
var icTinkAt = 0;             // when the last frost tink played (rapid jabs don't buzz)

function icRand(r) { return r[0] + Math.random() * (r[1] - r[0]); }
function icCfg(b) { return b && b.char && b.char.iceman; }
function icHash(n) { var x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }
function icSnowSpecial(b) { return !!(b && b.char && b.char.hasSpecial && b.char.special && b.char.special.move === "snow"); }
function snowDayOn(b) { return !!(b && b.igbb && b.igbb.move === "snow"); }
// Both hands are drawn by drawLiddell while he packs the snow (drawHands skips them).
function liddellHandsBusy(b) { return snowDayOn(b); }

// From startMatchSeeded.
function resetLiddell() { icSnow = null; icClock = 0; }
// From makeBall, after its weight class is applied.
function initLiddell(b) {
  b.frost = null; b.iceRage = null; b.atkRate0 = b.atkRate;
  var ic = icCfg(b);
  if (!ic) return;
  // His own copy of the swing, so the wind-up can warm up, speed up in the
  // snow and turn into overhands without touching the roster fighter.
  b.char = Object.assign({}, b.char);
  b.char.swing = Object.assign({}, b.char.swing);
  b.icSwing = Object.assign({}, b.char.swing);
  b.icSpeed = b.baseSpeed;
  b.snowT = ic.snow ? icRand(ic.snow.first) : Infinity;
  b.tauntT = ic.taunt ? icRand(ic.taunt.every) : Infinity;
  b.icBehind = false; b.icComeback = false;
}

// ---------------------------------------------------------------- frost

// From hurt() (match.js), on the damage before it's taken off: frosted gloves
// hit softer (special moves too with frost.softenSpecials), and Chuck hits
// harder the more frosted the opponent is, harder again in the all-out attack.
function icemanDamageMult(b, attackerId, source) {
  if (attackerId == null || attackerId === b.id || !balls || !balls[attackerId]) return 1;
  var atk = balls[attackerId], m = 1;
  if (atk.frost && atk.frost.level > 0 && source !== "laser" && (source !== "igbb" || atk.frost.cfg.softenSpecials)) m *= 1 - atk.frost.cfg.soften * atk.frost.level;
  var ic = icCfg(atk);
  if (ic && ic.warmup && ic.warmup.damage != null) m *= ic.warmup.damage + (1 - ic.warmup.damage) * icWarm(ic, b); // cold hands early on
  if (ic && ic.frost && b.frost) m *= 1 + ic.frost.power * b.frost.level;
  if (atk.iceRage) m *= atk.char.special.rampage.damage;
  return m;
}

// From hurt() (match.js), once the damage is taken off. b took `dealt` from
// attackerId's `source`.
function icemanHit(b, dealt, source, attackerId) {
  if (!(dealt > 0) || attackerId == null || attackerId === b.id || !balls[attackerId]) return;
  var atk = balls[attackerId], ic = icCfg(b);
  if (ic && ic.frost && ic.frost.sources.indexOf(source) >= 0) frostGloves(atk, b, dealt, ic.frost);
  if (ic && icSnowSpecial(b) && !b.igbb && !b.iceRage && !over) {
    var sp = b.char.special;
    b.specialT = Math.min(sp.chargeTime, (b.specialT || 0) + (sp.hurtCut || 0) * dealt / 10); // Snow Day charges as he gets hurt
  }
  if (icCfg(atk) && source === "swing") hookLanded(atk, b, dealt);
}

// A punch landed on him: ice spreads over the puncher's gloves.
function frostGloves(atk, chuck, dealt, fc) {
  var f = atk.frost || (atk.frost = { level: 0, cfg: fc, hold: 0, full: false });
  var was = f.level;
  f.cfg = fc;
  f.level = Math.min(1, f.level + fc.perHit + fc.perDamage * dealt);
  f.hold = fc.hold;
  var dx = atk.x - chuck.x, dy = atk.y - chuck.y, d = Math.sqrt(dx * dx + dy * dy) || 1, ux = dx / d, uy = dy / d;
  var cx = chuck.x + ux * chuck.r, cy = chuck.y + uy * chuck.r; // where the glove met him
  for (var i = 0; i < 6 && !reduceMotion; i++) {
    var a = Math.atan2(uy, ux) + (Math.random() - 0.5) * 2.2, s = 90 + Math.random() * 200;
    particles.push({ x: cx, y: cy, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 0.25 + Math.random() * 0.25, max: 0.5, size: 1.5 + Math.random() * 2.2, color: i % 2 ? "#ffffff" : "#9fdcff" });
  }
  if (was === 0) floater(atk.x, atk.y - atk.r - 30, "FROSTED GLOVES!", "note");
  if (!f.full && f.level >= 1) {
    f.full = true;
    floater(atk.x, atk.y - atk.r - 34, "FROZEN!", "crit");
    crowdReact(0.5);
    playGlovesFrozen();
  } else playFrostTink(f.level);
}

// One of his hooks landed: chips of ice off them once they're frosting up, and
// in the all-out attack an overhand right that rocks them.
function hookLanded(chuck, other, dealt) {
  var dx = other.x - chuck.x, dy = other.y - chuck.y, d = Math.sqrt(dx * dx + dy * dy) || 1, ux = dx / d, uy = dy / d;
  var cx = other.x - ux * other.r, cy = other.y - uy * other.r;
  var big = !!chuck.iceRage, frosty = big || (other.frost && other.frost.level > 0.4);
  if (!frosty) return;
  for (var i = 0; i < (big ? 16 : 6) && !reduceMotion; i++) {
    var a = Math.atan2(uy, ux) + (Math.random() - 0.5) * 2.4, s = 140 + Math.random() * (big ? 360 : 180);
    particles.push({ x: cx, y: cy, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 0.3 + Math.random() * 0.3, max: 0.6, size: 2 + Math.random() * 3, color: i % 3 ? "#bfe9ff" : "#ffffff" });
  }
  if (!big) return;
  chuck.iceRage.landed++;
  floater(other.x, other.y - other.r - 34, chuck.iceRage.landed > 1 ? "AND ANOTHER!" : "OVERHAND RIGHT!", "crit");
  impacts.push({ x: cx, y: cy, nx: -ux, ny: -uy, life: 0.4, max: 0.4, color: "#3fa9ff" });
  other.squash = { t: 0.15, max: 0.15, nx: -ux, ny: -uy };
  hitStop = Math.max(hitStop, 0.07);
  if (!reduceMotion) shake = Math.max(shake, 15);
  crowdReact(0.7);
  playOverhandIce();
}

// ---------------------------------------------------------------- snow

function startSnow(dur) {
  if (icSnow && icSnow.t < icSnow.dur) { icSnow.dur = Math.max(icSnow.dur, icSnow.t + dur); return; } // already snowing: it just keeps going
  icSnow = { t: 0, dur: dur };
  floater(W / 2, 46, "SNOW!", "note");
  playSnowWind();
}
function snowing() { return !!(icSnow && icSnow.t < icSnow.dur); }
// How hard it's snowing right now (0..1): it drifts in and tails off.
function snowLevel() {
  if (!icSnow) return 0;
  return Math.max(0, Math.min(1, icSnow.t / 1.2, (icSnow.dur + 1.5 - icSnow.t) / 1.5));
}

// ---------------------------------------------------------------- Snow Day

// From updateSpecial (special.js) for special.move "snow". True while he's
// packing the snow (he does nothing else).
function updateSnowDay(self, other, dt) {
  var sp = self.char.special;
  if (self.iceRage) return false; // the all-out attack runs on his normal swing (tickLiddell)
  if (!self.igbb) {
    if (self.specialT < sp.chargeTime || !canStartIgbb(self, other) || swordDuelActive()) return false;
    clearActions(self);
    self.igbb = { move: "snow", phase: "dip", t: 0, read: Math.random() * 100 < (sp.readChance || 0) };
    floater(self.x, self.y - self.r - 30, "SNOW DAY!", "crit");
    if (self.igbb.read) floater(other.x, other.y - other.r - 30, "!", "crit");
    startSnow(IC_DIP + IC_SCOOP + IC_PACK + IC_FLARE + sp.rampage.time);
    say(self, IC_LINES.windup);
    crowdReact(0.6);
  }
  var m = self.igbb;
  if (m.move !== "snow") return false;
  if (over) { self.igbb = null; return false; }
  m.t += dt;
  self.vx = 0; self.vy = 0;
  if (m.read) icBackOff(self, other);
  if (m.phase === "dip" && m.t >= IC_DIP) { m.phase = "scoop"; m.t = 0; playSnowCrunch(1); icSnowPuff(self, 0, self.r * 1.1, 10); }
  else if (m.phase === "scoop" && m.t >= IC_SCOOP) { m.phase = "pack"; m.t = 0; m.packs = 0; }
  else if (m.phase === "pack") {
    var n = Math.floor(m.t / (IC_PACK / 3)); // three pats packing it down
    if (n > m.packs && n <= 3) { m.packs = n; playSnowCrunch(0.6); icSnowPuff(self, 0, self.r * 0.3, 6); }
    if (m.t >= IC_PACK) { m.phase = "flare"; m.t = 0; playIceFlare(); }
  } else if (m.phase === "flare" && m.t >= IC_FLARE) {
    startRampage(self, other, sp);
    return false;
  }
  return true;
}
// They saw it coming and back off (only while they're rolling about on their
// own, like reading Pereira's CHAMA).
function icBackOff(self, other) {
  if (!other.alive || !inOrdinaryMovement(other) || other.angry) return;
  var dx = other.x - self.x, dy = other.y - self.y, d = Math.sqrt(dx * dx + dy * dy) || 1;
  var s = Math.max(Math.sqrt(other.vx * other.vx + other.vy * other.vy), 200);
  other.vx = dx / d * s; other.vy = dy / d * s;
}
function icSnowPuff(b, ox, oy, n) {
  for (var i = 0; i < n && !reduceMotion; i++) {
    var a = -Math.PI / 2 + (Math.random() - 0.5) * 2.6, s = 60 + Math.random() * 150;
    particles.push({ x: b.x + ox, y: b.y + oy, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 0.3 + Math.random() * 0.3, max: 0.6, size: 2 + Math.random() * 2.5, color: i % 2 ? "#ffffff" : "#d9f2ff" });
  }
}

function startRampage(self, other, sp) {
  self.igbb = null;
  self.specialT = 0;
  self.iceRage = { t: 0, landed: 0 };
  self.hookSide = -IC_OVERHAND; // (the swing flips it before each hook: always his right)
  floater(self.x, self.y - self.r - 30, "ICEMAN!", "crit");
  for (var i = 0; i < 22 && !reduceMotion; i++) {
    var a = Math.random() * Math.PI * 2, s = 120 + Math.random() * 280;
    particles.push({ x: self.x, y: self.y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 0.4 + Math.random() * 0.3, max: 0.7, size: 2.5 + Math.random() * 3.5, color: i % 3 ? "#5cc3ff" : "#ffffff" });
  }
  if (!reduceMotion) shake = Math.max(shake, 10);
  crowdReact(1);
  var dx = other.x - self.x, dy = other.y - self.y, d = Math.sqrt(dx * dx + dy * dy) || 1;
  self.vx = dx / d * self.icSpeed * sp.rampage.speed; self.vy = dy / d * self.icSpeed * sp.rampage.speed;
}

// ---------------------------------------------------------------- every frame

// From update(): frost melting and slowing whoever has it, the snow, and
// Chuck's own wind-up, speed, all-out attack and taunts.
function tickLiddell(dt) {
  icClock += dt;
  if (icSnow) { icSnow.t += dt; if (icSnow.t > icSnow.dur + 1.6) icSnow = null; }
  balls.forEach(function (b) {
    var f = b.frost;
    if (f) {
      if (f.hold > 0) f.hold -= dt; else f.level = Math.max(0, f.level - f.cfg.thaw * dt);
      if (f.level < 0.8) f.full = false; // (melted back a good way before FROZEN! can call again)
      if (f.level <= 0 || !b.alive) { b.frost = null; b.atkRate = b.atkRate0; }
      else {
        addSlow(b, 1 - f.cfg.slow * f.level, 0.25, "frost"); // cold, stiff and slow (slowdown.js)
        b.atkRate = b.atkRate0 * (1 - f.cfg.atkSlow * f.level);
        // Their special meter fills slower too: what time adds (up to dt a
        // frame) by chargeSlow, and what their frozen punches add by hitChargeSlow.
        var st = b.specialT || 0, last = b.icSpecialT;
        if (b.char.hasSpecial && last != null && st > last) {
          var timeGain = Math.min(st - last, dt), hitGain = st - last - timeGain;
          b.specialT = last + timeGain * (1 - (f.cfg.chargeSlow || 0) * f.level) + hitGain * (1 - (f.cfg.hitChargeSlow || 0) * f.level);
        }
      }
    }
    b.icSpecialT = b.specialT || 0;
    var ic = icCfg(b);
    if (ic) tickIceman(b, balls[1 - b.id], ic, dt);
  });
}

// How warmed up he is (0..1): as their gloves frost over (warmup.at of full
// frost is fully warm).
function icWarm(ic, other) { return other && other.frost ? Math.min(1, other.frost.level / (ic.warmup && ic.warmup.at || 1)) : 0; }

function tickIceman(b, other, ic, dt) {
  var sw = b.char.swing, base = b.icSwing, sp = b.char.special;
  // Warming up: his hooks come quicker as their gloves frost over.
  var warm = icWarm(ic, other);
  var windup = ic.warmup ? ic.warmup.windup + (base.windup - ic.warmup.windup) * warm : base.windup;
  var speed = b.icSpeed;
  if (ic.snow && snowing()) { windup *= ic.snow.windup; speed *= ic.snow.speed; }
  // Frozen stiff: the more frost on them, the less they slip or block his hooks.
  var stiff = other.frost && ic.frost ? 1 - (ic.frost.stiff || 0) * other.frost.level : 1;
  sw.blockMult = base.blockMult * stiff; sw.weaveMult = base.weaveMult * stiff;
  var rg = b.iceRage;
  if (rg) {
    var rp = sp.rampage;
    rg.t += dt;
    b.specialT = 0;
    if (rg.t >= rp.time || !b.alive || over) { endRampage(b); rg = null; }
    else {
      windup = rp.windup; speed = b.icSpeed * rp.speed;
      sw.extend = rp.extend; sw.recover = rp.recover; sw.vicinity = rp.vicinity; sw.aimError = rp.aimError;
      sw.blockMult = rp.blockMult * stiff; sw.weaveMult = rp.weaveMult * stiff;
      if (!b.swing) b.hookSide = -IC_OVERHAND; // the next one's his right hand again
      if (other.alive && inOrdinaryMovement(b)) icHunt(b, other, speed, dt);
      if (!reduceMotion && Math.random() < dt * 30) {
        particles.push({ x: b.x + (Math.random() - 0.5) * b.r, y: b.y + (Math.random() - 0.5) * b.r, vx: -b.vx * 0.15, vy: -b.vy * 0.15 - 60, life: 0.35, max: 0.35, size: b.r * (0.12 + Math.random() * 0.12), color: Math.random() < 0.5 ? "#7fd0ff" : "#e6f7ff" });
      }
    }
  }
  sw.windup = windup;
  b.baseSpeed = speed;
  // The snow.
  if (ic.snow && started && !over && !b.iceRage && !b.igbb) {
    b.snowT -= dt;
    if (b.snowT <= 0) { startSnow(ic.snow.time); b.snowT = ic.snow.time + icRand(ic.snow.every); }
  }
  if (snowing() && b.alive && inOrdinaryMovement(b) && !reduceMotion && Math.random() < dt * 8) {
    // kicking up snow as he goes
    particles.push({ x: b.x - b.vx * 0.06, y: b.y + b.r * 0.8, vx: -b.vx * 0.1 + (Math.random() - 0.5) * 40, vy: -40 - Math.random() * 40, life: 0.4, max: 0.4, size: 2 + Math.random() * 2, color: "#ffffff" });
  }
  // The taunt.
  if (!ic.taunt || !started || over || !b.alive || !other.alive) return;
  if (b.hp < other.hp - ic.taunt.behind) b.icBehind = true;
  if (b.icBehind && !b.icComeback && b.hp > other.hp && canSay(b)) {
    b.icComeback = true;
    say(b, IC_LINES.taunt);
    floater(b.x, b.y - b.r - 30, "COMEBACK!", "note");
    crowdReact(0.6);
    b.tauntT = icRand(ic.taunt.every);
    return;
  }
  b.tauntT -= dt;
  var dx = other.x - b.x, dy = other.y - b.y;
  if (b.tauntT <= 0 && dx * dx + dy * dy > 170 * 170 && canSay(b) && !b.igbb) {
    say(b, IC_LINES.taunt);
    b.tauntT = icRand(ic.taunt.every);
  }
}

// The all-out attack: steers hard at them between hooks.
function icHunt(b, other, speed, dt) {
  var s = Math.max(Math.sqrt(b.vx * b.vx + b.vy * b.vy), speed * 0.6);
  var cur = Math.atan2(b.vy, b.vx), want = Math.atan2(other.y - b.y, other.x - b.x);
  var diff = Math.atan2(Math.sin(want - cur), Math.cos(want - cur));
  var turn = Math.max(-9 * dt, Math.min(9 * dt, diff));
  b.vx = Math.cos(cur + turn) * s; b.vy = Math.sin(cur + turn) * s;
}

function endRampage(b) {
  b.iceRage = null;
  var sw = b.char.swing, base = b.icSwing;
  sw.extend = base.extend; sw.recover = base.recover; sw.vicinity = base.vicinity; sw.aimError = base.aimError;
}

// ---------------------------------------------------------------- frost drawing

// The fighter wearing these gloves (by its character or look), or null.
function icBallOf(ch, look) {
  if (typeof balls === "undefined" || !balls) return null;
  for (var i = 0; i < balls.length; i++) {
    var b = balls[i];
    if (b && b.char && ((ch && b.char === ch) || (look && b.char.look === look))) return b;
  }
  return null;
}
// From gloveColor (fighter-art.js): frosted gloves go icy white-blue, and
// Chuck's go electric blue in the all-out attack. Null leaves them alone.
function icedGloveColor(ch) {
  var b = icBallOf(ch, null);
  if (!b) return null;
  var col = ch.look ? ch.look.gloves : ch.color;
  if (b.iceRage || snowDayFlare(b)) return "#3fb2ff";
  if (b.frost && b.frost.level > 0 && /^#[0-9a-f]{6}$/i.test(col)) return mixHex(col, "#dff4ff", 0.25 + 0.55 * b.frost.level);
  return null;
}
function snowDayFlare(b) { return snowDayOn(b) && b.igbb.phase === "flare"; }

// From drawGlove (fighter-art.js), in the glove's own coordinates (centre at
// 0, 0, radius gr): ice over a frosted glove, the blue flare on Chuck's.
function frostGloveOver(c, look, gr) {
  if (c !== ctx) return; // only in the fight (not the gallery's own canvases)
  var b = icBallOf(null, look);
  if (!b) return;
  if (b.iceRage) { drawGloveFlare(c, 0, 0, gr, 1); return; }
  if (b.frost && b.frost.level > 0) drawGloveIce(c, 0, 0, gr, b.frost.level);
}
// From drawFist (draw-attacks.js): the same on a punching fist.
function frostFistOver(self, x, y, gr, ang) {
  if (!self || !self.frost || !(self.frost.level > 0)) return;
  ctx.save(); ctx.translate(x, y); ctx.rotate(ang || 0);
  drawGloveIce(ctx, 0, 0, gr, self.frost.level);
  ctx.restore();
}

// A coat of ice on a glove: a frosty glaze, ice crystals sticking out round
// the rim (more and longer as it builds), and glints.
function drawGloveIce(c, x, y, gr, level) {
  var k = Math.max(0, Math.min(1, level));
  c.save();
  c.translate(x, y);
  c.globalAlpha = 0.25 + 0.4 * k;
  c.fillStyle = "#e9f8ff";
  c.beginPath(); c.arc(0, 0, gr * 1.02, 0, Math.PI * 2); c.fill();
  c.globalAlpha = 1;
  var n = Math.min(IC_CRYSTALS.length, 2 + Math.round(k * 6));
  c.lineJoin = "round";
  for (var i = 0; i < n; i++) {
    var a = IC_CRYSTALS[i][0], len = gr * (0.25 + IC_CRYSTALS[i][1] * (0.4 + 0.6 * k)), w = 0.22;
    var bx0 = Math.cos(a - w) * gr * 0.82, by0 = Math.sin(a - w) * gr * 0.82, bx1 = Math.cos(a + w) * gr * 0.82, by1 = Math.sin(a + w) * gr * 0.82;
    var tx = Math.cos(a) * (gr * 0.85 + len), ty = Math.sin(a) * (gr * 0.85 + len);
    c.fillStyle = "#f4fcff"; c.strokeStyle = "#5e9cc4"; c.lineWidth = Math.max(1, gr * 0.09);
    c.beginPath(); c.moveTo(bx0, by0); c.lineTo(tx, ty); c.lineTo(bx1, by1); c.closePath(); c.fill(); c.stroke();
    c.strokeStyle = "rgba(120,190,235,0.9)"; c.lineWidth = Math.max(0.8, gr * 0.05);
    c.beginPath(); c.moveTo(Math.cos(a) * gr * 0.85, Math.sin(a) * gr * 0.85); c.lineTo(tx * 0.92, ty * 0.92); c.stroke();
  }
  // Frost cracks across the front, and glints.
  c.strokeStyle = "rgba(255,255,255,0.9)"; c.lineWidth = Math.max(1, gr * 0.08); c.lineCap = "round";
  c.beginPath(); c.moveTo(-gr * 0.5, -gr * 0.2); c.lineTo(-gr * 0.1, -gr * 0.05); c.lineTo(gr * 0.15, -gr * 0.4); c.stroke();
  if (k > 0.5) { c.beginPath(); c.moveTo(-gr * 0.2, gr * 0.45); c.lineTo(gr * 0.1, gr * 0.15); c.lineTo(gr * 0.45, gr * 0.3); c.stroke(); }
  var tw = 0.5 + 0.5 * Math.sin(icClock * 9 + gr);
  c.fillStyle = "#ffffff"; c.globalAlpha = 0.6 + 0.4 * tw;
  c.beginPath(); c.arc(-gr * 0.35, -gr * 0.45, gr * 0.13, 0, Math.PI * 2); c.fill();
  c.restore();
}

// A blue flare round a glove: a glow, and blue ice flames flickering off it.
function drawGloveFlare(c, x, y, gr, k) {
  c.save();
  c.translate(x, y);
  var g = c.createRadialGradient(0, 0, gr * 0.3, 0, 0, gr * 2.1);
  g.addColorStop(0, "rgba(160,225,255," + (0.75 * k) + ")"); g.addColorStop(0.5, "rgba(63,169,255," + (0.45 * k) + ")"); g.addColorStop(1, "rgba(63,169,255,0)");
  c.fillStyle = g;
  c.beginPath(); c.arc(0, 0, gr * 2.1, 0, Math.PI * 2); c.fill();
  for (var i = 0; i < 7; i++) {
    var a = i / 7 * Math.PI * 2 + icClock * 2.2, fl = 0.7 + 0.3 * Math.sin(icClock * 17 + i * 2.3);
    var len = gr * (0.8 + 0.5 * fl) * k;
    c.fillStyle = i % 2 ? "rgba(120,205,255,0.85)" : "rgba(230,248,255,0.9)";
    c.beginPath();
    c.moveTo(Math.cos(a - 0.35) * gr * 0.85, Math.sin(a - 0.35) * gr * 0.85);
    c.quadraticCurveTo(Math.cos(a) * (gr + len * 0.6), Math.sin(a) * (gr + len * 0.6), Math.cos(a + 0.12) * (gr + len), Math.sin(a + 0.12) * (gr + len));
    c.quadraticCurveTo(Math.cos(a + 0.25) * gr * 1.1, Math.sin(a + 0.25) * gr * 1.1, Math.cos(a + 0.35) * gr * 0.85, Math.sin(a + 0.35) * gr * 0.85);
    c.closePath(); c.fill();
  }
  c.restore();
}

// ---------------------------------------------------------------- drawing

// Blue ice flames licking up round him, behind the ball: power 0..1.
function drawIceFlames(b, power) {
  if (power <= 0) return;
  var r = b.r, n = 14;
  ctx.save();
  ctx.lineJoin = "round";
  [["#1f7ae0", 0.8, 1, "#0f4f9e"], ["#8fd8ff", 0.85, 0.66], ["#f2fbff", 0.85, 0.36]].forEach(function (L) {
    ctx.fillStyle = L[0]; ctx.globalAlpha = L[1] * Math.min(1, power * 1.6);
    if (L[3]) { ctx.strokeStyle = L[3]; ctx.lineWidth = 2; }
    for (var i = 0; i < n; i++) {
      var th = i / n * Math.PI * 2 + 0.2;
      var ox = Math.cos(th), oy = Math.sin(th);
      var dx = ox * 0.55, dy = oy * 0.55 - 1, dl = Math.sqrt(dx * dx + dy * dy) || 1; dx /= dl; dy /= dl; // out and up
      var fl = 0.65 + 0.35 * Math.sin(icClock * (9 + i % 4) + i * 1.7);
      var h = r * (0.4 + 0.65 * icHash(i + 3)) * (0.45 + 0.9 * power) * fl * L[2];
      var bw = 0.3;
      var b0x = b.x + Math.cos(th - bw) * r * 0.9, b0y = b.y + Math.sin(th - bw) * r * 0.9;
      var b1x = b.x + Math.cos(th + bw) * r * 0.9, b1y = b.y + Math.sin(th + bw) * r * 0.9;
      var bx = b.x + ox * r * 0.95, by = b.y + oy * r * 0.95;
      var sway = Math.sin(icClock * 6 + i) * r * 0.08;
      var tx = bx + dx * (r * 0.05 + h) + sway, ty = by + dy * (r * 0.05 + h);
      ctx.beginPath();
      ctx.moveTo(b0x, b0y);
      ctx.quadraticCurveTo(bx + dx * h * 0.5 - dy * r * 0.12 * L[2], by + dy * h * 0.5 + dx * r * 0.12 * L[2], tx, ty);
      ctx.quadraticCurveTo(bx + dx * h * 0.5 + dy * r * 0.12 * L[2], by + dy * h * 0.5 - dx * r * 0.12 * L[2], b1x, b1y);
      ctx.closePath(); ctx.fill();
    }
  });
  ctx.restore();
}

// How big his ice flames are right now (0 for none).
function icFlamePower(b) {
  var ic = icCfg(b);
  if (!ic || !b.alive) return 0;
  if (b.iceRage) return 1;
  var m = b.igbb;
  if (m && m.move === "snow") {
    if (m.phase === "pack") return 0.35 + 0.55 * m.t / IC_PACK;
    if (m.phase === "flare") return 1;
    return 0.2;
  }
  if (!ic.flames) return 0;
  var hurtK = (ic.flames.below - b.hp / MAX_HP) / ic.flames.below;
  return hurtK > 0 ? 0.25 + 0.4 * hurtK : 0;
}

// Under the fighters: snow on the mat, and his ice flames. From draw().
function drawLiddellUnder() {
  var k = snowLevel();
  if (k > 0) {
    // Snow settling on the mat in little drifts.
    var settle = k * Math.min(1, (icSnow ? icSnow.t : 0) / 4);
    ctx.save();
    for (var i = 0; i < 26; i++) {
      var x = icHash(i * 5 + 11) * W, y = icHash(i * 9 + 4) * H, rw = 8 + icHash(i + 40) * 16;
      ctx.globalAlpha = 0.75 * settle;
      ctx.fillStyle = "#ffffff"; ctx.strokeStyle = "rgba(120,160,200,0.5)"; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.ellipse(x, y, rw, rw * 0.38, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    }
    ctx.restore();
  }
  balls.forEach(function (b) { drawIceFlames(b, icFlamePower(b)); });
}

// From draw(), per fighter, after its hands: scooping and packing the snow,
// and the blue flare on his overhand.
function drawLiddell(b) {
  if (!b.alive || !icCfg(b)) return;
  var m = b.igbb;
  if (m && m.move === "snow") { drawSnowDay(b, m); return; }
  if (b.iceRage && b.swing) {
    var fist = icSwingFist(b);
    if (fist) drawGloveFlare(ctx, fist.x, fist.y, SWING_FIST_R, 1);
  }
}

// Where his swinging fist is (the same sums as drawSwing, cte.js).
function icSwingFist(self) {
  var st = self.swing, sw = self.char.swing, r = self.r;
  if (st.phase === "windup") {
    var w = Math.min(1, st.t / sw.windup), ca = st.ang - st.side * (HOOK_OPEN + 0.25 * w), cr = r * (1.25 - 0.2 * w);
    return { x: self.x + Math.cos(ca) * cr, y: self.y + Math.sin(ca) * cr };
  }
  if (st.phase === "strike") return hookFist(self, st, st.k);
  if (st.phase === "extend") return hookFist(self, st, 1);
  return null;
}

// The Snow Day wind-up. Everything happens low in front of him: the snow
// goes from the mat into his gloves, never up toward his head.
function drawSnowDay(b, m) {
  var r = b.r, size = (b.char.punch && b.char.punch.size) || 15, gs = size * 0.72;
  var shL = { x: b.x - r * 0.62, y: b.y - r * 0.05 }, shR = { x: b.x + r * 0.62, y: b.y - r * 0.05 };
  // the mat in front of his feet, and his stomach (well below his head, which
  // is the top third of the ball)
  var matY = b.y + r * 1.12, holdY = b.y + r * 0.3, sbR = r * 0.34;
  var gx, gy, ball = null, pile = 0, angL, angR;
  if (m.phase === "dip") {
    var k = easeOut(m.t / IC_DIP);
    gx = r * (0.5 - 0.12 * k); gy = b.y + r * 0.3 + (matY - b.y - r * 0.3) * k;
    pile = Math.min(1, m.t / (IC_DIP * 0.5));
    angL = Math.PI / 2 - 0.3; angR = Math.PI / 2 + 0.3;
  } else if (m.phase === "scoop") {
    var k2 = easeOut(m.t / IC_SCOOP);
    gx = r * (0.38 + 0.14 * k2); gy = matY - r * 0.1 + (holdY - matY + r * 0.1) * k2;
    pile = 1 - k2;
    ball = { y: gy - r * 0.04, r: sbR * (0.6 + 0.4 * k2), blue: 0 };
    angL = 0.3 * (1 - k2); angR = Math.PI - 0.3 * (1 - k2);
  } else if (m.phase === "pack") {
    var pat = Math.abs(Math.sin(m.t / (IC_PACK / 3) * Math.PI)), kp = m.t / IC_PACK;
    var br = sbR * (1 - 0.15 * kp);
    gx = br + r * (0.2 - 0.07 * pat); gy = holdY;
    ball = { y: holdY, r: br, blue: kp };
    angL = 0; angR = Math.PI;
  } else {
    var k3 = easeOut(m.t / IC_FLARE);
    gx = r * (0.5 + 0.1 * k3); gy = holdY - r * 0.06 * k3;
    ball = k3 < 0.6 ? { y: holdY, r: sbR * 0.85 * (1 + k3), blue: 1, burst: k3 / 0.6 } : null;
    angL = -0.4; angR = Math.PI + 0.4;
  }
  ctx.save();
  var L = { x: b.x - gx, y: gy }, R = { x: b.x + gx, y: gy };
  if (m.phase === "scoop") drawSnowDrift(b.x, matY, r, pile); // left behind on the mat as he lifts the snow
  strokeLimb(size * 0.7, armColor(b.char), function () { ctx.moveTo(shL.x, shL.y); ctx.lineTo(L.x, L.y); });
  strokeLimb(size * 0.7, armColor(b.char), function () { ctx.moveTo(shR.x, shR.y); ctx.lineTo(R.x, R.y); });
  drawGloveAt(L.x, L.y, gs, b.char, angL);
  drawGloveAt(R.x, R.y, gs, b.char, angR);
  if (m.phase === "dip") drawSnowDrift(b.x, matY, r, pile); // his gloves digging into it
  // The snowball held between his gloves, turning blue as it's packed.
  if (ball) {
    var blue = Math.min(1, ball.blue);
    if (blue > 0.25) drawGloveFlare(ctx, b.x, ball.y, ball.r, (blue - 0.25) / 0.75);
    ctx.globalAlpha = ball.burst ? 1 - ball.burst : 1;
    ctx.fillStyle = mixHex("#ffffff", "#6cc6ff", blue * 0.75); ctx.strokeStyle = "#4f7fa8"; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.arc(b.x, ball.y, ball.r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "rgba(255,255,255,0.95)";
    ctx.beginPath(); ctx.arc(b.x - ball.r * 0.35, ball.y - ball.r * 0.35, ball.r * 0.28, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "rgba(95,141,181,0.35)";
    ctx.beginPath(); ctx.arc(b.x + ball.r * 0.3, ball.y + ball.r * 0.3, ball.r * 0.3, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;
  }
  if (m.phase === "flare") { drawGloveFlare(ctx, L.x, L.y, gs, 1); drawGloveFlare(ctx, R.x, R.y, gs, 1); }
  ctx.restore();
}

// A drift of snow on the mat in front of his feet (k: 0..1 how much is left).
function drawSnowDrift(x, matY, r, k) {
  if (k <= 0.02) return;
  var pw = r * 0.78, ph = r * 0.38 * (0.35 + 0.65 * k), py = matY + r * 0.24;
  ctx.save();
  ctx.globalAlpha = Math.min(1, k * 1.6);
  ctx.fillStyle = "#ffffff"; ctx.strokeStyle = "#5f8db5"; ctx.lineWidth = 2.5; ctx.lineJoin = "round";
  ctx.beginPath(); ctx.moveTo(x - pw, py);
  ctx.quadraticCurveTo(x - pw * 0.75, py - ph * 0.9, x - pw * 0.3, py - ph);
  ctx.quadraticCurveTo(x - pw * 0.05, py - ph * 1.2, x + pw * 0.3, py - ph * 0.95);
  ctx.quadraticCurveTo(x + pw * 0.75, py - ph * 0.85, x + pw, py);
  ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = "rgba(150,190,225,0.45)"; // shade on its lower side
  ctx.beginPath(); ctx.ellipse(x + pw * 0.3, py - ph * 0.28, pw * 0.4, ph * 0.22, 0, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

// Snow falling over the whole arena: over the stands and the jumbotron in the
// stadium. From draw(), with the arena's placement (sc/ox/oy).
function drawLiddellSky(sc, ox, oy) {
  var k = snowLevel();
  if (k <= 0) return;
  var stadium = stadiumOn(), px = canvas.width / STAGE_W;
  var w = stadium ? STAGE_W : W, h = stadium ? STAGE_H : H, n = stadium ? 230 : 70, sz = stadium ? 8.5 : 3, fall = stadium ? 230 : 75;
  ctx.save();
  if (stadium) ctx.setTransform(px, 0, 0, px, 0, 0); else ctx.setTransform(sc, 0, 0, sc, ox, oy);
  var t = icSnow ? icSnow.t : 0;
  for (var i = 0; i < n; i++) {
    var a = icHash(i * 3 + 1), b2 = icHash(i * 7 + 2), c2 = icHash(i * 13 + 5);
    var y = ((b2 * (h + 60) + t * fall * (0.45 + 0.75 * c2)) % (h + 60)) - 30;
    var x = a * w + Math.sin(t * (0.7 + c2) + i) * sz * 4;
    var size = sz * (0.5 + 0.8 * c2);
    ctx.globalAlpha = k * (0.6 + 0.4 * c2);
    if (c2 > 0.82) drawSnowflake(x, y, size * 1.6, t * (c2 - 0.5) * 2 + i); // a few big six-armed flakes up front
    else {
      ctx.fillStyle = "#ffffff"; ctx.strokeStyle = "rgba(90,130,170,0.6)"; ctx.lineWidth = Math.max(0.8, size * 0.22);
      ctx.beginPath(); ctx.arc(x, y, size, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    }
  }
  ctx.restore();
}
function drawSnowflake(x, y, s, rot) {
  ctx.save();
  ctx.translate(x, y); ctx.rotate(rot);
  ctx.lineCap = "round";
  [["rgba(90,130,170,0.7)", s * 0.42], ["#ffffff", s * 0.22]].forEach(function (p) {
    ctx.strokeStyle = p[0]; ctx.lineWidth = p[1];
    ctx.beginPath();
    for (var i = 0; i < 6; i++) {
      var a = i * Math.PI / 3, ux = Math.cos(a), uy = Math.sin(a);
      ctx.moveTo(0, 0); ctx.lineTo(ux * s, uy * s);
      ctx.moveTo(ux * s * 0.55, uy * s * 0.55); ctx.lineTo(ux * s * 0.55 + Math.cos(a + 0.8) * s * 0.3, uy * s * 0.55 + Math.sin(a + 0.8) * s * 0.3);
      ctx.moveTo(ux * s * 0.55, uy * s * 0.55); ctx.lineTo(ux * s * 0.55 + Math.cos(a - 0.8) * s * 0.3, uy * s * 0.55 + Math.sin(a - 0.8) * s * 0.3);
    }
    ctx.stroke();
  });
  ctx.restore();
}

// ---------------------------------------------------------------- his look
// (from fighter-art.js; c is already at the ball's centre, r its radius)

// The "Icehawk": his mohawk as a spiky crest rising off the top of his head,
// past the ball (contained layout).
function drawIcehawk(c, r, look, ink) {
  var hc = look.hairColor, base = -r * 0.78;
  // Tufts swept up and a little back off a narrow strip, the middle ones
  // tallest: [x at the root, x at the tip, height of the tip], in radii.
  var tufts = [[-0.12, -0.17, -1.07], [-0.07, -0.08, -1.17], [0, 0.01, -1.21], [0.07, 0.1, -1.16], [0.12, 0.18, -1.06]];
  var path = function () {
    c.beginPath();
    c.moveTo(-r * 0.15, base);
    tufts.forEach(function (t, i) {
      var nx = i < tufts.length - 1 ? (t[0] + tufts[i + 1][0]) / 2 : r * 0.15 / r;
      c.quadraticCurveTo(t[0] * r - r * 0.02, (base + t[2] * r) / 2, t[1] * r, t[2] * r);  // up one side of the tuft to its point
      c.quadraticCurveTo(t[0] * r + r * 0.03, -r * 0.98, nx * r, i < tufts.length - 1 ? -r * 0.96 : base); // and down into the dip before the next
    });
    c.closePath();
  };
  c.save();
  c.lineJoin = "round";
  var g = c.createLinearGradient(0, -r * 1.2, 0, base);
  g.addColorStop(0, shadeHex(hc, 0.3)); g.addColorStop(1, shadeHex(hc, -0.15));
  c.fillStyle = g; path(); c.fill();
  // Outlined only where it stands up off his head: the root runs into the
  // buzzed scalp with no edge.
  c.save(); c.beginPath(); c.rect(-r, -r * 2, r * 2, r * 1.05); c.clip();
  c.strokeStyle = ink; c.lineWidth = Math.max(1.5, r * 0.04); path(); c.stroke();
  c.restore();
  c.strokeStyle = shadeHex(hc, 0.45); c.lineWidth = Math.max(1, r * 0.018); c.globalAlpha = 0.65; // strands
  [[-0.06, -0.07, -1.08], [0.02, 0.03, -1.12], [0.08, 0.11, -1.06]].forEach(function (s) {
    c.beginPath(); c.moveTo(s[0] * r, base - r * 0.04); c.quadraticCurveTo(s[0] * r, -r * 0.98, s[1] * r, s[2] * r); c.stroke();
  });
  c.restore();
}

// His goatee, and the Koei-Kan kanji tattooed on the left side of his scalp
// (screen right, as we look at him): drawn as brush strokes, a stand-in for
// the real characters. From drawArtHeadLayer.
function drawIcemanHead(c, r, look, lw) {
  if (look.scalpInk) {
    c.save();
    c.translate(r * 0.47, -r * 0.71); c.rotate(0.62);
    c.strokeStyle = "rgba(28,34,44,0.85)"; c.lineWidth = lw(0.026); c.lineCap = "round";
    var u = r * 0.075;
    [[0, -1.25], [0, 0], [0, 1.25]].forEach(function (p, i) { // three characters stacked down the side of his head
      var x = p[0] * u, y = p[1] * u;
      c.beginPath();
      if (i === 0) { c.moveTo(x - u * 0.45, y - u * 0.3); c.lineTo(x + u * 0.45, y - u * 0.3); c.moveTo(x, y - u * 0.5); c.lineTo(x, y + u * 0.45); c.moveTo(x - u * 0.4, y + u * 0.1); c.lineTo(x + u * 0.4, y + u * 0.4); }
      else if (i === 1) { c.moveTo(x - u * 0.45, y - u * 0.4); c.lineTo(x + u * 0.45, y - u * 0.4); c.moveTo(x - u * 0.3, y - u * 0.4); c.lineTo(x - u * 0.4, y + u * 0.45); c.moveTo(x + u * 0.25, y - u * 0.4); c.lineTo(x + u * 0.25, y + u * 0.45); c.moveTo(x - u * 0.35, y + u * 0.05); c.lineTo(x + u * 0.45, y + u * 0.05); }
      else { c.moveTo(x - u * 0.45, y - u * 0.35); c.lineTo(x + u * 0.45, y - u * 0.35); c.lineTo(x + u * 0.3, y + u * 0.45); c.moveTo(x - u * 0.2, y - u * 0.1); c.lineTo(x - u * 0.45, y + u * 0.4); c.moveTo(x + u * 0.05, y - u * 0.05); c.lineTo(x + u * 0.15, y + u * 0.2); }
      c.stroke();
    });
    c.restore();
  }
  if (look.goatee) {
    var gc = look.beardColor || look.hairColor;
    var goatee = function () {
      c.beginPath();
      // One patch: a moustache over the mouth running down both sides into
      // a beard that comes to a point under the chin...
      c.moveTo(-r * 0.17, -r * 0.33);
      c.quadraticCurveTo(-r * 0.18, -r * 0.45, 0, -r * 0.455);
      c.quadraticCurveTo(r * 0.18, -r * 0.45, r * 0.17, -r * 0.33);
      c.quadraticCurveTo(r * 0.13, -r * 0.22, r * 0.035, -r * 0.17);
      c.lineTo(0, -r * 0.155);
      c.lineTo(-r * 0.035, -r * 0.17);
      c.quadraticCurveTo(-r * 0.13, -r * 0.22, -r * 0.17, -r * 0.33);
      c.closePath();
      // ...with just a slit of lip showing through it
      c.moveTo(r * 0.1, -r * 0.39);
      c.quadraticCurveTo(0, -r * 0.4, -r * 0.1, -r * 0.39);
      c.quadraticCurveTo(0, -r * 0.37, r * 0.1, -r * 0.39);
      c.closePath();
    };
    c.save();
    c.fillStyle = gc; goatee(); c.fill("evenodd");
    goatee(); c.clip("evenodd");
    var gr2 = artRand(23);
    c.fillStyle = shadeHex(gc, -0.35); c.globalAlpha = 0.5;
    for (var i = 0; i < 70; i++) c.fillRect((gr2() * 2 - 1) * r * 0.18, -r * 0.46 + gr2() * r * 0.3, r * 0.016, r * 0.016);
    c.restore();
  }
}

// "icicles" shorts: white icicles hanging off the waistband all the way
// round, like his Iceman trunks. From drawArtBody, before the waistband.
function drawIcicleShorts(c, r, look, sTop, band, name) {
  var rnd = artRand(artSeed(name + "icicles")), y0 = sTop + band - r * 0.01, n = 11;
  c.save();
  // a frosty band of snow just under the waistband
  c.fillStyle = "#eaf6ff";
  c.beginPath(); c.moveTo(-r, y0);
  for (var j = 0; j <= 22; j++) c.lineTo(-r + j * r / 11, y0 + r * (0.035 + 0.025 * Math.sin(j * 1.9)));
  c.lineTo(r, y0); c.closePath(); c.fill();
  for (var i = 0; i < n; i++) {
    var cx = -r + (i + 0.5) * (2 * r / n) + (rnd() - 0.5) * r * 0.05, w = r * (0.07 + rnd() * 0.04), len = r * (0.14 + rnd() * 0.24);
    c.fillStyle = "#f6fbff"; c.strokeStyle = "#7fb0d6"; c.lineWidth = Math.max(1, r * 0.018);
    c.beginPath(); c.moveTo(cx - w, y0); c.quadraticCurveTo(cx - w * 0.25, y0 + len * 0.6, cx, y0 + len); c.quadraticCurveTo(cx + w * 0.35, y0 + len * 0.6, cx + w, y0); c.closePath(); c.fill(); c.stroke();
    c.fillStyle = "rgba(127,176,214,0.45)"; // shade down one side
    c.beginPath(); c.moveTo(cx + w * 0.15, y0); c.quadraticCurveTo(cx + w * 0.3, y0 + len * 0.55, cx, y0 + len); c.quadraticCurveTo(cx + w * 0.35, y0 + len * 0.6, cx + w, y0); c.closePath(); c.fill();
  }
  c.restore();
}

// ---------------------------------------------------------------- sound
// Synth stand-ins until Joe records the real ones.

function icAudio(fn) {
  try {
    var ac = getAudioCtx();
    if (!ac) return;
    if (ac.state === "suspended") ac.resume();
    fn(ac, ac.currentTime);
  } catch (e) { /* never let audio break the game */ }
}
// Ice forming on their gloves: a glassy tink, brighter as it thickens.
function playFrostTink(level) {
  icAudio(function (ac, t) {
    if (t - icTinkAt < 0.09) return;
    icTinkAt = t;
    var f = 2200 + 900 * (level || 0);
    caneTone(ac, t, "sine", f, f * 0.97, 0.12, 0.16);
    caneBurst(ac, t, 6200, 3, 0.12, 0.04);
  });
}
// Fully frozen: a crackle of ice setting hard.
function playGlovesFrozen() {
  icAudio(function (ac, t) {
    for (var i = 0; i < 6; i++) caneBurst(ac, t + i * 0.035, 3000 + i * 500, 4, 0.2, 0.04);
    caneTone(ac, t, "sine", 3100, 2900, 0.16, 0.4);
  });
}
// The snow starting: a soft gust of wind.
function playSnowWind() {
  icAudio(function (ac, t) {
    var s = ac.createBufferSource();
    s.buffer = caneNoise(ac); s.loop = true;
    var f = ac.createBiquadFilter();
    f.type = "bandpass"; f.Q.value = 0.8; f.frequency.setValueAtTime(380, t); f.frequency.linearRampToValueAtTime(900, t + 0.9); f.frequency.linearRampToValueAtTime(450, t + 1.8);
    var g = ac.createGain();
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.22, t + 0.7); g.gain.exponentialRampToValueAtTime(0.0001, t + 1.9);
    s.connect(f); f.connect(g); g.connect(strikeOut(ac));
    s.start(t); s.stop(t + 2);
  });
}
// Scooping and packing the snow: a crunch.
function playSnowCrunch(k) {
  icAudio(function (ac, t) {
    for (var i = 0; i < 4; i++) caneBurst(ac, t + i * 0.025, 1300 + i * 380, 1.6, 0.3 * (k || 1), 0.05);
  });
}
// The snow turning into a blue flare: a rising icy whoosh.
function playIceFlare() {
  playWhoosh();
  icAudio(function (ac, t) {
    caneTone(ac, t, "triangle", 320, 1500, 0.3, 0.45);
    caneTone(ac, t + 0.05, "sine", 2400, 3200, 0.12, 0.4);
    caneBurst(ac, t, 2600, 0.9, 0.35, 0.35);
  });
}
// An overhand right in the all-out attack: the haymaker and a shatter of ice.
function playOverhandIce() {
  icAudio(function (ac, t) {
    for (var i = 0; i < 5; i++) caneBurst(ac, t + 0.01 + i * 0.03, 4200 + i * 700, 3, 0.25, 0.05);
    caneTone(ac, t, "sine", 1900, 900, 0.12, 0.25);
  });
}
