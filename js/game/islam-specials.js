// Islam Makhachev's specials and matchups (Joe, 2026-11-22).
//
// His special (special.move "islam") charges like any other, and each time
// it's full he goes to the next one in `special.order`:
//   brotha      he backs off to `space` px, moans "Brothaaaa..." (Joe's clip)
//               arms out wide, they stand there lost (looking left and right,
//               scratching their head, a shrug, "?"s, held), he drops his level
//               and rushes in low (a blur behind him, dust, speed lines; they
//               see him at the last second) for a takedown nothing can stop
//               (straight into beginGrapple: no sprawl, counter or escape).
//   cheesecake  "California Cheesecake": he pulls out a cheesecake (drawn in
//               code from Joe's picture: graham crust, cream, raspberry glaze,
//               raspberries and mint) and tosses it behind them. Heavyweights,
//               anyone with a belly, Khabib, Sean O'Malley (and Paddy Pimblett
//               when he's added) chase it down and eat it with their back to
//               him, and he walks up behind them and suplexes them. Sean wolfs
//               it down instead and goes straight onto a sugar high
//               (omalley.js startSugarHigh). Against anyone else it's skipped.
//   dagestan    "2-3 years Dagestan and forget": a white van comes screeching
//               across the cage and runs them over (dizzy), two Dagestani guys
//               in papakhas hop out, bundle them in and it drives off. Then the
//               fight holds for a cut to Dagestan: the van pulls up in the
//               mountains, throws them out, a dust cloud of Dagestani fighters
//               beats them up, and Hasbulla launches them back with a catapult.
//               They fall back into the cage from the sky. (sceneLocked holds
//               everything else while it's on.)
// Matchups:
//   Volk        when his kangaroo is hopping after Islam, Islam says "Who check
//               Kangaroo's grappling?", lifts it over his head with Volk in the
//               pouch, shakes it until Volk falls out dizzy, and throws it out of
//               the arena (one-line hook in volkanovski.js updateKangaroo).
//   Dustin      one punch a fight (and from Renato Moicano if he's added) gets
//               through and launches Islam back across the cage, dizzy
//               (islamHurt, islam.js; his `islam.bigPunch` block).
// Voice lines: Joe's real clips (islam-voice.js) cut in as each special
// starts and as he walks up under the kangaroo; the bubbles go with them.
"use strict";

SPECIAL_MOVES.islam = "Islam's specials";
var ISL_ROO_ROLL = Math.PI / 2; // the kangaroo held on its side over his head
var ISL_ROO_Z = 0.25;          // how high it's held (in his radius): low enough for short arms
var islamRooTwinkle = null;    // the "ding" where the thrown kangaroo vanishes
var ISL_TRIP_T = 7.0;      // the cut to Dagestan
var islamTrip = null;      // { ownerId, vicId, u } while the fight holds for it

function islRand(r) { return r[0] + Math.random() * (r[1] - r[0]); }
function islamSpOn(b) { return !!(b && b.igbb && b.igbb.move === "islam"); }
function islIdHas(b, s) { return String((b && b.char && b.char.id) || "").indexOf(s) >= 0; }
// Who goes after the cheesecake (Joe: fat fighters, heavyweights, Khabib,
// Sean O'Malley, Paddy Pimblett when he's added).
function cakeChaser(o) {
  if (!o || !o.char) return false;
  var lk = o.char.look || {};
  return o.char.weightClass === "heavyweight" || !!lk.belly || islIdHas(o, "khabib") || islIdHas(o, "sean-omalley") || islIdHas(o, "paddy");
}
function islamDrawnApart(b) {
  var o = b && balls[1 - b.id], m = o && o.igbb;
  return !!(m && m.move === "islam" && m.kind === "dagestan" && m.vicId === b.id && (m.phase === "drive" || m.phase === "away" || m.phase === "fall") && m.inVan);
}
// His hands are drawn by us (drawHands skips them, draw-attacks.js).
function islamHandsBusy(b) {
  var m = b && b.igbb, om = b && balls[1 - b.id] && balls[1 - b.id].igbb;
  if (typeof axeCallBusy === "function" && axeCallBusy(b)) return true; // his hand out for the axe (islam-axe.js)
  if (m && m.move === "islam" && m.kind === "brotha" && m.phase !== "space") return true; // his arms in Brotha
  if (om && om.move === "islam" && om.kind === "brotha" && om.vicId === b.id && om.huh) return true; // theirs, lost
  if (m && m.move === "islam" && m.kind === "cheesecake" && (m.phase === "serve" || m.phase === "cakeToss")) return true;
  if (om && om.move === "islam" && om.kind === "cheesecake" && om.phase === "eat" && om.cake) return true; // theirs, eating it
  return !!(b && b.islamRoo && (b.islamRoo.step !== "say" || b.islamRoo.dance > 0));
}

// From updateSpecial (special.js).
function updateIslamSpecials(self, other, dt) {
  var sp = self.char.special;
  if (!self.igbb) {
    if (self.islamQuietT > 0) { self.islamQuietT -= dt; return false; } // let his kangaroo line finish first
    if (self.specialT < sp.chargeTime || !started || over || !canStartIgbb(self, other)) return false;
    var order = sp.order || ["brotha"], kind = null;
    for (var i = 0; i < order.length && !kind; i++) {
      var k = order[((self.islamSpN || 0) + i) % order.length];
      if (k === "cheesecake" && !cakeChaser(other)) continue;
      kind = k; self.islamSpN = ((self.islamSpN || 0) + i + 1) % order.length;
    }
    if (!kind) return false;
    clearActions(self);
    self.vx = 0; self.vy = 0;
    self.igbb = { move: "islam", kind: kind, phase: "start", t: 0, all: 0, vicId: other.id };
    if (kind === "brotha") { self.igbb.phase = "space"; islHold(other); } // they stand still from here on
    if (kind === "cheesecake") { self.igbb.phase = "serve"; playSwordDraw(); } // (the bubble says it)
    if (kind === "dagestan") self.igbb.phase = "call";
    var vk = { cheesecake: "islamCheesecake", dagestan: "islamDagestan" }[kind], mm = self.igbb; // (Brotha's goes with the moan)
    if (vk) islamVoice(vk, function () { return self.igbb === mm && mm.t < 0.6; }); // Joe's clip (islam-voice.js)
    crowdReact(0.6);
  }
  var m = self.igbb;
  if (m.move !== "islam") return false;
  m.t += dt; m.all += dt;
  if (m.phase !== "close") { self.vx = 0; self.vy = 0; }
  if (!self.alive || (over && m.phase !== "away")) { endIslamSpecial(self, other); return false; }
  if (m.all > 22) { endIslamSpecial(self, other); return false; } // never stuck
  if (m.kind === "brotha") return islBrotha(self, other, m, dt);
  if (m.kind === "cheesecake") return islCake(self, other, m, dt);
  return islDagestan(self, other, m, dt);
}

function endIslamSpecial(self, other) {
  var m = self.igbb;
  if (other && other.dazed === "held") other.dazed = false;
  if (other) other.islamHeld = false;
  if (m && m.kind === "dagestan" && islamTrip) islamTrip = null;
  if (m && m.cake) m.cake = null;
  self.igbb = null;
  self.specialT = 0;
  if (self.alive) setSpeed(self, self.baseSpeed || SPEED);
}
function islLet(o) { if (o.islamHeld && o.dazed === "held") o.dazed = false; o.islamHeld = false; }
function islHold(o) { if (o.alive && !o.grappled && !o.slam) { clearActions(o); o.dazed = "held"; o.vx = 0; o.vy = 0; o.islamHeld = true; } }
// From updateIslamMoves (islam-axe.js): if something cut his special short
// (a grab from outside it), whoever it was holding is let go.
function islamReleaseHeld(self) {
  var o = balls[1 - self.id];
  if (!o || !o.islamHeld || islamSpOn(self)) return;
  o.islamHeld = false;
  if (o.dazed === "held") o.dazed = false;
  if (islamTrip && islamTrip.ownerId === self.id) islamTrip = null;
}

// ---------------------------------------------------------------- Brotha

function islBrotha(self, other, m, dt) {
  var c = self.char.special.brotha, r = self.r;
  if (!other.alive) { endIslamSpecial(self, other); return false; }
  var dx = other.x - self.x, dy = other.y - self.y, d = Math.sqrt(dx * dx + dy * dy) || 1;
  m.aim = Math.atan2(dy, dx);
  if (m.phase === "space") { // backs off to give them room to look lost in
    if (!m.to) m.to = islBrothaSpot(self, other, c.space);
    var tx = m.to.x - self.x, ty = m.to.y - self.y, td = Math.sqrt(tx * tx + ty * ty);
    if (td > 4) { var st = Math.min(td, c.backstep * dt); self.x += tx / td * st; self.y += ty / td * st; }
    if (td <= 4 || m.t >= 1.1) {
      m.phase = "moan"; m.t = 0;
      var mm = m;
      islamVoice("islamBrotha", function () { return self.igbb === mm && mm.phase === "moan" && mm.t < 0.6; }); // Joe's clip (islam-voice.js)
    }
    return true;
  }
  if (m.phase === "moan") {
    if (!m.huh && m.t >= c.confused) { m.huh = true; islHold(other); floater(other.x, other.y - other.r - 30, "HUH?!", "note"); }
    if (!m.huh2 && m.t >= c.confused + 0.45) { m.huh2 = true; floater(other.x, other.y - other.r - 30, "???", "note"); }
    var lineEnd = (typeof clipBuffers !== "undefined" && clipBuffers.islamBrotha) ? clipBuffers.islamBrotha.duration : c.moan; // the moment Joe's clip ends
    if (m.t >= lineEnd - c.set) { m.phase = "set"; m.t = 0; islBrothaDust(self, -Math.cos(m.aim), -Math.sin(m.aim), 10, 160); }
    return true;
  }
  if (m.phase === "set") { // drops his level
    if (m.t >= c.set) { m.phase = "rush"; m.t = 0; m.trail = []; m.v = c.dash * 0.45; playWhoosh(); crowdReact(0.7); }
    return true;
  }
  // The rush: low and fast, a blur behind him, dust off his feet.
  m.v = Math.min(c.dash, m.v + c.accel * dt);
  var step = Math.min(m.v * dt, Math.max(0, d - (r + other.r + 2)));
  self.x += dx / d * step; self.y += dy / d * step;
  m.trail.unshift({ x: self.x, y: self.y, a: m.aim });
  if (m.trail.length > 7) m.trail.length = 7;
  m.dustT = (m.dustT || 0) - dt;
  if (m.dustT <= 0) { m.dustT = 0.035; islBrothaDust(self, -dx / d, -dy / d, 3, 90); }
  if (!m.saw && d < r + other.r + 140) { m.saw = true; } // they finally clock it (drawn as a "!")
  if (d < r + other.r + 10 || m.t > 2.5) {
    // Nothing stops this one: no sprawl, no counter, no escape.
    islLet(other);
    self.igbb = null; self.specialT = 0; self.vx = 0; self.vy = 0;
    islBrothaDust(other, dx / d, dy / d, 16, 260);
    if (!reduceMotion) { shake = Math.max(shake, 14); hitStop = Math.max(hitStop, 0.07); }
    crowdReact(1);
    floater(other.x, other.y - other.r - 50, "QUICK TAKEDOWN!", "crit");
    beginGrapple(self, other);
    if (typeof commentaryCall === "function") commentaryCall("shot", self, other);
    return true;
  }
  return true;
}
// Where he backs off to: `dist` away from them, straight back if there's
// room, otherwise round to the side along the cage.
function islBrothaSpot(self, o, dist) {
  var back = Math.atan2(self.y - o.y, self.x - o.x), best = null;
  [0, 0.6, -0.6, 1.2, -1.2, 1.8, -1.8, 2.5, -2.5, Math.PI].some(function (off) {
    var a = back + off, x = o.x + Math.cos(a) * dist, y = o.y + Math.sin(a) * dist;
    x = Math.max(self.r + 4, Math.min(W - self.r - 4, x)); y = Math.max(self.r + 4, Math.min(H - self.r - 4, y));
    var dd = Math.hypot(x - o.x, y - o.y);
    if (!best || dd > best.d + 20) best = { x: x, y: y, d: dd };
    return dd >= dist * 0.85;
  });
  if (Math.hypot(self.x - o.x, self.y - o.y) >= best.d - 10) return { x: self.x, y: self.y }; // already far enough
  return best;
}
function islBrothaDust(b, nx, ny, n, sp) {
  if (reduceMotion) return;
  var rnd = typeof nativeRandom === "function" ? nativeRandom : Math.random;
  for (var i = 0; i < n; i++) {
    var a = Math.atan2(ny, nx) + (rnd() - 0.5) * 1.6, v = sp * (0.4 + rnd() * 0.8);
    particles.push({ x: b.x + nx * b.r * 0.6 + (rnd() - 0.5) * b.r * 0.6, y: b.y + b.r * 0.75, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 40,
      life: 0.45, max: 0.45, size: 4 + rnd() * 5, color: i % 3 ? "#c9b48a" : "#e8dcc0" });
  }
}
// The body language, as a turn, a stretch and a lift about his feet: Islam
// swaying through the moan, dropping his level and leaning into the rush;
// them looking left and right, lost, then jolting when they see him coming.
function islBrothaPoseOf(b) {
  var o = balls[1 - b.id], m = b.igbb, om = o && o.igbb;
  if (m && m.move === "islam" && m.kind === "brotha") {
    var lean = Math.cos(m.aim || 0) * 0.3;
    if (m.phase === "space") return { rot: 0, sx: 1, sy: 1, dy: -Math.abs(Math.sin(m.t * 15)) * 7 };
    if (m.phase === "moan") return { rot: Math.sin(m.t * 3.2) * 0.13, sx: 1 + Math.sin(m.t * 6.4) * 0.02, sy: 1 - Math.sin(m.t * 6.4) * 0.02, dy: 0 };
    var k = m.phase === "set" ? ease(m.t / 0.18) : 1;
    return { rot: lean * k, sx: 1 + 0.16 * k, sy: 1 - 0.26 * k, dy: 0 };
  }
  if (om && om.move === "islam" && om.kind === "brotha" && om.vicId === b.id && om.huh && b.alive) {
    if (om.phase === "rush" && om.saw) return { rot: 0, sx: 0.92, sy: 1.1, dy: -6 };
    var t = om.phase === "moan" ? om.t - (o.char.special.brotha.confused || 0.35) : 3 + om.t, seg = Math.floor(t / 0.6), u = ease((t - seg * 0.6) / 0.25);
    var from = seg === 0 ? 0 : (seg % 2 ? 1 : -1), to = seg % 2 ? -1 : 1;
    return { rot: 0.24 * (from + (to - from) * u), sx: 1, sy: 1, dy: -Math.abs(Math.sin(t * 2.2)) * 3 };
  }
  return null;
}
// From draw.js, before the fighter is drawn.
function applyIslamPose(b) {
  var p = islBrothaPoseOf(b);
  if (!p) return;
  var ax = b.x, ay = b.y + b.r;
  ctx.translate(ax, ay + p.dy); ctx.rotate(p.rot); ctx.scale(p.sx, p.sy); ctx.translate(-ax, -ay);
}
// A point on the fighter, moved the way the pose moves him.
function islPosePt(b, x, y) {
  var p = islBrothaPoseOf(b);
  if (!p) return { x: x, y: y };
  var ax = b.x, ay = b.y + b.r, px = (x - ax) * p.sx, py = (y - ay) * p.sy, c = Math.cos(p.rot), s = Math.sin(p.rot);
  return { x: ax + px * c - py * s, y: ay + p.dy + px * s + py * c };
}
// His gloves through Brotha (his own two arms), and theirs while they're lost.
function drawBrothaHands(b, o, m, now) {
  var r = b.r, f = { x: Math.cos(m.aim || 0), y: Math.sin(m.aim || 0) }, side = { x: -f.y, y: f.x };
  if (m.phase === "moan") { // arms out wide, palms up: "brothaaa"
    [-1, 1].forEach(function (sd) {
      var lift = Math.sin(m.t * 3.2 + sd) * r * 0.06;
      var sh = islPosePt(b, b.x + sd * r * 0.62, b.y - r * 0.25), hd = islPosePt(b, b.x + sd * r * 1.08, b.y - r * 0.5 + lift);
      drawBentArm(b, sh, hd, sd); drawGloveAt(hd.x, hd.y, r * 0.22, b.char);
    });
  } else if (m.phase === "set" || m.phase === "rush") { // both hands low and out in front, for the legs
    [-1, 1].forEach(function (sd) {
      var sh = islPosePt(b, b.x + side.x * sd * r * 0.6, b.y + side.y * sd * r * 0.4);
      var hd = islPosePt(b, b.x + f.x * r * 1.05 + side.x * sd * r * 0.42, b.y + r * 0.25 + f.y * r * 0.8 + side.y * sd * r * 0.3);
      drawBentArm(b, sh, hd, sd); drawGloveAt(hd.x, hd.y, r * 0.22, b.char);
    });
  }
  if (!m.huh || !o.alive) return;
  var or = o.r, saw = m.phase === "rush" && m.saw;
  if (saw) { // hands up, too late
    [-1, 1].forEach(function (sd) {
      var sh = islPosePt(o, o.x + sd * or * 0.62, o.y - or * 0.25), hd = islPosePt(o, o.x + sd * or * 0.7, o.y - or * 1.0);
      drawBentArm(o, sh, hd, sd); drawGloveAt(hd.x, hd.y, or * 0.22, o.char);
    });
    return;
  }
  // One glove scratching the top of the head, the other turned up in a shrug.
  var scr = Math.sin(now * 18) * or * 0.08;
  var sh1 = islPosePt(o, o.x + or * 0.62, o.y - or * 0.25), hd1 = islPosePt(o, o.x + or * 0.22 + scr, o.y - or * 1.02);
  drawBentArm(o, sh1, hd1, 1); drawGloveAt(hd1.x, hd1.y, or * 0.22, o.char);
  var sh2 = islPosePt(o, o.x - or * 0.62, o.y - or * 0.25), hd2 = islPosePt(o, o.x - or * 1.0, o.y - or * 0.42 - Math.abs(Math.sin(now * 2.2)) * or * 0.1);
  drawBentArm(o, sh2, hd2, -1); drawGloveAt(hd2.x, hd2.y, or * 0.22, o.char);
}
// Under the fighters: the blur of him behind the rush, and the speed lines.
function drawBrothaBlur(b, m) {
  if (m.phase !== "rush" || !m.trail) return;
  ctx.save();
  for (var i = m.trail.length - 1; i >= 1; i -= 1) {
    var p = m.trail[i];
    ctx.globalAlpha = 0.28 * (1 - i / m.trail.length);
    drawFighterArt(ctx, p.x, p.y, b.r, islamKratosLook(b) || b.char.look, theme.wall, { layout: "contained", name: b.char.name });
  }
  ctx.globalAlpha = 0.55; ctx.strokeStyle = "#ffffff"; ctx.lineCap = "round";
  var f = { x: Math.cos(m.aim), y: Math.sin(m.aim) };
  for (var j = 0; j < 6; j++) {
    var off = (j - 2.5) * b.r * 0.32, ln = b.r * (1.2 + (j * 37 % 5) * 0.25), bx = b.x - f.x * b.r * 1.1 - f.y * off, by = b.y - f.y * b.r * 1.1 + f.x * off;
    ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx - f.x * ln, by - f.y * ln); ctx.stroke();
  }
  ctx.restore();
}
function drawSawHim(o, now) {
  ctx.save();
  ctx.font = "900 " + Math.round(o.r * 0.9) + "px Impact, 'Arial Black', sans-serif";
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  var y = o.y - o.r * 1.75 + Math.sin(now * 30) * 2;
  ctx.lineWidth = 6; ctx.strokeStyle = "#1f2328"; ctx.strokeText("!", o.x, y);
  ctx.fillStyle = "#ff4d3d"; ctx.fillText("!", o.x, y);
  ctx.restore();
}

// ---------------------------------------------------------------- California Cheesecake

function islCake(self, other, m, dt) {
  var c = self.char.special.cheesecake;
  var sean = islIdHas(other, "sean-omalley") && typeof startSugarHigh === "function" && other.sugar;
  if (m.phase === "serve") { // holds it up on one palm, showing it off
    if (m.t >= c.serve) {
      // Lands behind them, away from him, inside the cage.
      var dx = other.x - self.x, dy = other.y - self.y, d = Math.sqrt(dx * dx + dy * dy) || 1, M = 70;
      var tx = Math.max(M, Math.min(W - M, other.x + dx / d * c.past)), ty = Math.max(M, Math.min(H - M, other.y + dy / d * c.past));
      m.phase = "cakeToss"; m.t = 0;
      m.cake = { x: self.x, y: self.y - self.r, sx: self.x + (dx / d) * self.r, sy: self.y - self.r * 0.4, tx: tx, ty: ty, z: 0, bites: 0, landed: false };
      playWhoosh();
    }
    return true;
  }
  var ck = m.cake;
  if (m.phase === "cakeToss") {
    var u = Math.min(1, m.t / c.toss);
    ck.x = ck.sx + (ck.tx - ck.sx) * u; ck.y = ck.sy + (ck.ty - ck.sy) * u; ck.z = Math.sin(Math.PI * u) * 120;
    if (u >= 1) {
      ck.landed = true; ck.z = 0;
      if (!reduceMotion) shake = Math.max(shake, 3);
      islHold(other);
      floater(other.x, other.y - other.r - 34, sean ? "SUGAR!!" : "CHEESECAKE?!", "note");
      m.phase = "chase"; m.t = 0;
    }
    return true;
  }
  if (m.phase === "chase") { // they drop everything and run for it
    var ex = ck.x - other.x, ey = ck.y - other.y, ed = Math.sqrt(ex * ex + ey * ey) || 1;
    var want = other.r * 0.95, step = c.run * (sean ? 1.4 : 1) * dt;
    if (ed > want) { var mv = Math.min(step, ed - want); other.x += ex / ed * mv; other.y += ey / ed * mv; }
    m.face = { x: ex / ed, y: ey / ed };
    if (ed <= want + 1 || m.t > 2.5) { m.phase = "eat"; m.t = 0; m.chomp = 0; }
    return true;
  }
  if (m.phase === "eat") {
    m.chomp -= dt; other.cakeFed = false;
    if (m.t >= (m.eatSfxAt || 0)) { // Tony's Minecraft eating noise, looped over the eating (ferguson-burrito.js's clip; a sound effect, not a voice line)
      m.eatSfxAt = m.t + 99;
      withClip("burritoEat", function (buf) { if (m.phase === "eat") { playClip("burritoEat", 0.95); m.eatSfxAt = m.t + (buf && buf.duration ? buf.duration - 0.05 : 1.6); } });
    }
    var eatT = sean ? c.seanEat : c.eat;
    if (m.chomp <= 0) {
      m.chomp = eatT / c.bites;
      ck.bites = Math.min(c.bites, ck.bites + 1);
      floater(ck.x, ck.y - 40, ck.bites % 2 ? "CHOMP!" : "NOM NOM", "note");
      for (var i = 0; i < 6 && !reduceMotion; i++) {
        var a = Math.random() * Math.PI * 2, s = 40 + Math.random() * 120;
        particles.push({ x: ck.x, y: ck.y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 40, life: 0.4, max: 0.4, size: 2 + Math.random() * 3, color: i % 3 ? "#f3ead2" : (i % 2 ? "#c9893f" : "#d4202c") });
      }
    }
    if (sean) {
      if (m.t >= eatT) { // wolfed down: straight onto a sugar high
        islCakeHeal(other, c);
        islLet(other);
        m.cake = null;
        startSugarHigh(other);
        floater(other.x, other.y - other.r - 80, "SUGAR RUSH!", "crit");
        endIslamSpecial(self, other);
        return false;
      }
      return true;
    }
    // Meanwhile he walks round behind them.
    var f = m.face || { x: 1, y: 0 }, bx = other.x - f.x * (self.r + other.r) * 0.9, by = other.y - f.y * (self.r + other.r) * 0.9;
    bx = Math.max(self.r, Math.min(W - self.r, bx)); by = Math.max(self.r, Math.min(H - self.r, by));
    var gx = bx - self.x, gy = by - self.y, gd = Math.sqrt(gx * gx + gy * gy) || 1, gs = c.sneak * dt;
    if (gd > 4) { var g2 = Math.min(gs, gd); self.x += gx / gd * g2; self.y += gy / gd * g2; }
    if ((gd < 10 && m.t >= c.eat * 0.5) || m.t >= c.eat) {
      islCakeHeal(other, c);
      islLet(other);
      floater(other.x, other.y - other.r - 34, "DISTRACTED!", "note");
      m.cake.gone = true;
      islamCakeLeft = m.cake; islamCakeLeft.t0 = performance.now() / 1000;
      self.igbb = null; self.specialT = 0;
      if (other.alive) beginSuplex(self, other);
      return true;
    }
    return true;
  }
  return true;
}
// Whoever eats it gets a little back (Joe 2026-11-23): +5, never past full.
function islCakeHeal(o, c) {
  if (!o.alive || o.cakeFed) return;
  o.cakeFed = true;
  var full = o.maxHp || MAX_HP, got = Math.max(0, Math.min(c.heal || 5, full - o.hp));
  if (got <= 0) return;
  o.hp += got;
  floater(o.x + o.r * 0.9, o.y - o.r - 10, "+" + Math.round(got) + " HP", "note");
}
var islamCakeLeft = null;
// From startMatchSeeded (match.js): nothing of his carries into the next fight
// (a rematch mid Dagestan cut used to keep the cut on screen).
function resetIslam() { islamTrip = null; islamCakeLeft = null; islamRooTwinkle = null; if (typeof islamSfxStop === "function") islamSfxStop("islamBeating", 0); } // what's left of the cake, lying on the mat after the suplex (fades)

// ---------------------------------------------------------------- 2-3 years Dagestan

function islDagestan(self, other, m, dt) {
  var c = self.char.special.dagestan;
  if (m.phase === "call") {
    if (m.t >= c.call) {
      // The van comes from the side farther from them, along their line.
      var fromLeft = other.x > W / 2;
      islHold(other);
      floater(other.x, other.y - other.r - 30, "!?", "note");
      var vs = islVanScale(self), half = 160 * vs; // it bursts in at the cage edge and stays inside the ring
      m.van = { x: fromLeft ? half : W - half, y: Math.max(170 * vs, Math.min(H - 10, other.y + other.r * 0.4)), dir: fromLeft ? 1 : -1, door: 0, guys: 0, s: vs, a: 0 };
      m.phase = "van"; m.t = 0;
      playVanScreech();
    }
    return true;
  }
  var v = m.van;
  if (m.phase === "van") {
    v.a = Math.min(1, v.a + dt / 0.18);
    v.x += v.dir * c.vanSpeed * dt;
    var front = v.x + v.dir * 150 * v.s;
    if ((v.dir > 0 && front >= other.x - other.r * 0.5) || (v.dir < 0 && front <= other.x + other.r * 0.5)) {
      var dealt = hurt(other, c.vanDamage, "igbb", self.id);
      floater(other.x, other.y - other.r - 40, "VAN HIT!", "crit");
      other.flash = 0.16;
      if (!reduceMotion) { shake = Math.max(shake, 18); hitStop = Math.max(hitStop, 0.08); }
      islamSfx("islamThump", 1, 0, 0.2); crowdReact(1); // Joe's thud, from just before its peak so it lands on the hit (islam-sfx.js)
      // knocked along ahead of the bumper, never under the van
      m.fly = { x0: other.x, x1: Math.max(other.r + 4, Math.min(W - other.r - 4, other.x + v.dir * 140)) };
      checkEnd();
      if (!other.alive) { endIslamSpecial(self, other); return false; }
      m.phase = "brake"; m.t = 0;
      m.stars = true;
    }
    return true;
  }
  if (m.phase === "brake") { // skids to a stop right behind them
    v.a = Math.min(1, v.a + dt / 0.18);
    var fu = Math.min(1, m.t / 0.3);
    other.x = m.fly.x0 + (m.fly.x1 - m.fly.x0) * (1 - (1 - fu) * (1 - fu));
    v.x += v.dir * c.vanSpeed * Math.max(0, 1 - m.t / 0.35) * dt;
    islVanClamp(v, other);
    if (m.t >= 0.4) { m.phase = "nab"; m.t = 0; }
    return true;
  }
  if (m.phase === "nab") { // door slides open, two guys hop out and bundle them in
    v.door = Math.min(1, m.t / 0.3); v.a = Math.min(1, v.a + dt / 0.18);
    var doorX = v.x - v.dir * 10, doorY = v.y - 10;
    if (m.t >= 0.6 && !m.carry) { m.carry = { x0: other.x, y0: other.y }; floater(other.x, other.y - other.r - 30, "KIDNAPPED!", "crit"); }
    if (m.carry) {
      var u = Math.min(1, (m.t - 0.6) / 0.6);
      other.x = m.carry.x0 + (doorX - m.carry.x0) * u; other.y = m.carry.y0 + (doorY - m.carry.y0) * u;
      if (u >= 1) { m.inVan = true; m.phase = "drive"; m.t = 0; playVanScreech(); }
    }
    return true;
  }
  if (m.phase === "drive") { // door slams, a burnout, then it tears off through the cage and away off the far side of the screen (Joe 2026-11-23)
    v.door = Math.max(0, 1 - m.t / 0.25); v.a = 1;
    if (m.t < ISL_VAN_GO) { // wheels spinning on the spot, the van rocking
      if (m.t >= 0.25 && !v.skid) v.skid = { x: v.x - v.dir * 92 * v.s, len: 0 };
      if (v.skid) v.skid.len = Math.min(70 * v.s, v.skid.len + 260 * v.s * dt);
      v.jit = m.t >= 0.25 ? Math.sin(m.t * 70) * 2.2 * v.s : 0;
    } else {
      v.jit = 0;
      if (!v.went) { v.went = true; v.vx = 200; if (!reduceMotion) shake = Math.max(shake, 6); }
      v.vx = Math.min(1900, v.vx + 4200 * dt);
      v.x += v.dir * v.vx * dt;
      if (!v.outDust && (v.dir > 0 ? v.x + 150 * v.s >= W : v.x - 150 * v.s <= 0)) { v.outDust = 0.001; } // punching out through the cage
    }
    if (v.outDust) v.outDust += dt;
    v.tilt = m.t >= ISL_VAN_GO ? Math.max(0, Math.sin(Math.PI * Math.min(1, (m.t - ISL_VAN_GO) / 0.35))) * 0.07 : 0; // nose up as it launches
    var gone = v.dir > 0 ? v.x - 160 * v.s > W + 260 : v.x + 160 * v.s < -260; // past the stands, off screen
    if ((v.went && gone) || m.t >= ISL_VAN_GO + 2.5) {
      m.phase = "away"; m.t = 0;
      islamTrip = { ownerId: self.id, vicId: other.id, u: 0, dealt: false };
      // Where they'll come back down: well away from him.
      var lx = self.x < W / 2 ? W * 0.68 : W * 0.32, ly = self.y < H / 2 ? H * 0.66 : H * 0.34;
      other.x = lx; other.y = ly;
      playWhoosh();
    }
    return true;
  }
  if (m.phase === "away") {
    islamTrip.u = m.t;
    if (!islamTrip.dealt && m.t >= 4.0) { // the beating in the dust cloud (never the knockout: that's the landing)
      islamTrip.dealt = true;
      hurt(other, Math.max(0, Math.min(c.beatDamage, other.hp - 1)), "igbb", self.id);
    }
    if (!islamTrip.vanIn && m.t >= 0.75) { islamTrip.vanIn = true; playVanScreech(); } // pulling up in Dagestan
    if (!islamTrip.boom && m.t >= 1.65) { islamTrip.boom = true; islamSfx("islamThump", 1); } // flung out onto the road (the thump peaks 0.25s in)
    if (!islamTrip.vanOff && m.t >= 1.95) { islamTrip.vanOff = true; playVanScreech(); } // and the van's off
    if (!islamTrip.beat && m.t >= 2.5) { islamTrip.beat = true; islamSfx("islamBeating", 1); } // the brawl in the dust cloud
    if (islamTrip.beat && !islamTrip.beatEnd && m.t >= 4.0) { islamTrip.beatEnd = true; islamSfxStop("islamBeating", 0.3); }
    if (!islamTrip.kickOut && m.t >= 4.15) { islamTrip.kickOut = true; islamSfx("islamThump", 0.7); } // kicked out of the cloud
    if (!islamTrip.inSpoon && m.t >= 5.22) { islamTrip.inSpoon = true; islamSfx("islamThump", 0.6); } // into the spoon
    if (!islamTrip.fling && m.t >= 5.42) { islamTrip.fling = true; islamSfx("islamCatapult", 1); } // Joe's catapult launch: the big hit lands on the crossbar slam
    if (!islamTrip.slam && m.t >= 5.96) { islamTrip.slam = true; playSlam(); } // the arm hitting the crossbar
    if (m.t >= ISL_TRIP_T) { islamTrip = null; m.phase = "fall"; m.t = 0; }
    return true;
  }
  if (m.phase === "fall") { // dropping back in from the sky
    if (!m.thumped && m.t >= c.fall - 0.25) { m.thumped = true; islamSfx("islamThump", 1); } // Joe's body thump, peaking on the landing (islam-sfx.js)
    if (m.t >= c.fall) {
      m.inVan = false;
      var dl = hurt(other, c.landDamage, "igbb", self.id);
      floater(other.x, other.y - other.r - 40, "BACK FROM DAGESTAN!", "crit");
      other.squash = { t: 0.24, max: 0.24, nx: 0, ny: 1 };
      if (!reduceMotion) { shake = Math.max(shake, 20); hitStop = Math.max(hitStop, 0.08); }
      playSlam(); crowdReact(1);
      for (var i = 0; i < 18 && !reduceMotion; i++) {
        var a = Math.random() * Math.PI * 2, s = 120 + Math.random() * 220;
        particles.push({ x: other.x + Math.cos(a) * other.r, y: other.y + other.r * 0.7, vx: Math.cos(a) * s, vy: Math.sin(a) * s * 0.4 - 20, life: 0.5, max: 0.5, size: 4 + Math.random() * 4, color: "#d8cdb5" });
      }
      islLet(other);
      checkEnd();
      endIslamSpecial(self, other);
      if (other.alive) makeDizzy(other, c.dizzy);
      return false;
    }
    return true;
  }
  return true;
}

// From sceneLocked (scene-lock.js) and main loop checks: the cut to Dagestan.
function islamTripOn() { return !!islamTrip; }

// ---------------------------------------------------------------- Volk's kangaroo

// From updateKangaroo (volkanovski.js), every frame of his special once he's
// in the pouch: true while Islam has hold of the kangaroo.
function islamRooCounter(volk, isl, m, roo) {
  var ic = islamCfg(isl);
  if (!ic || !ic.roo || !roo) return false;
  var pre = isl.islamRoo && isl.islamRoo.step === "pre" ? isl.islamRoo : null; // already dancing since the special started
  if (isl.islamRoo && !pre) return true;
  if (m.phase !== "chase" || roo.mode !== "stand" || !isl.alive || isl.igbb || isl.grappled || isl.grapple || isl.dazed || subLocked(isl) || over) return false;
  clearActions(isl);
  isl.vx = 0; isl.vy = 0;
  var sr = isl.islamRoo = { step: "say", t: 0, all: 0, d0: pre ? pre.dance : 0.001, axe: pre && pre.axe };
  if (!sr.axe) islRooAxeUp(isl, sr);
  floater(isl.x, isl.y - isl.r - 30, "NOT TODAY!", "crit");
  isl.islamQuietT = 4.8; // the clip's length: no special talks over it
  islamVoice("islamKangaroo", function () { return isl.islamRoo === sr && sr.all < 0.6; }); // Joe's clip (islam-voice.js)
  crowdReact(0.8);
  return true;
}
// From updateIslamMoves (islam-axe.js), on Islam: true while he's lifting,
// shaking and throwing it.
function islamRooHeld(isl, dt) {
  var s = isl.islamRoo, vm = balls[1 - isl.id] && balls[1 - isl.id].igbb;
  // Dances from the moment Volk calls his kangaroo (Joe), in place until
  // Volk's in the pouch and islamRooCounter takes over.
  if (!s && vm && vm.move === "kangaroo" && vm.phase !== "chase" && vm.phase !== "out" && islamCfg(isl) && islamCfg(isl).roo && isl.alive && !isl.igbb && !isl.grappled && !isl.grapple && !isl.dazed && !subLocked(isl) && !over) {
    clearActions(isl);
    s = isl.islamRoo = { step: "pre", t: 0, all: 0, dance: 0.001, hx: isl.x, hy: isl.y };
    islRooAxeUp(isl, s);
  }
  if (s && s.axe) { // keeps to the open side, toward the middle, gliding over if he walks across
    s.axe.ft = (s.axe.ft || 0) + dt; s.axe.side = isl.x < W / 2 ? 1 : -1;
    s.axe.sx += (s.axe.side - s.axe.sx) * Math.min(1, dt * 3);
  }
  if (!s) return false;
  if (s.step === "pre") {
    if (!vm || vm.move !== "kangaroo" || vm.phase === "out" || over || !isl.alive || isl.grappled || isl.dazed) { isl.islamRoo = null; return false; }
    s.t += dt; s.dance += dt; isl.vx = 0; isl.vy = 0;
    isl.x = Math.max(isl.r, Math.min(W - isl.r, s.hx + Math.sin(s.dance * 9) * isl.r * 0.16));
    return true;
  }
  s.t += dt; s.all = (s.all || 0) + dt;
  isl.vx = 0; isl.vy = 0;
  var volk = balls[1 - isl.id], m = volk && volk.igbb, roo = vkRoo;
  if (!roo || over || !isl.alive) { isl.islamRoo = null; if (roo) { roo.roll = 0; roo.islamHeld = false; } return false; }
  if (s.step !== "throw" && s.step !== "wind" && !(m && m.move === "kangaroo")) { isl.islamRoo = null; roo.roll = 0; roo.islamHeld = false; return false; }
  roo.islamHeld = s.step !== "say"; // Volk's own kangaroo code leaves it to us while it's up (volkanovski.js tickRoo)
  var r = isl.r, cfg = isl.char.islam.roo;
  roo.mode = "stand"; roo.t = 0.01;
  if (s.step === "say") {
    // stops where he is and starts dancing right away, steps back a little
    // while he says his line, then walks over under it
    var tx = roo.x, ty = Math.min(H - r, roo.y + r * 0.2), dx = tx - isl.x, dy = ty - isl.y, d = Math.sqrt(dx * dx + dy * dy) || 1;
    var walkAt = cfg.say - 0.6;
    if (!s.home) s.home = { x: isl.x - Math.sin(s.d0 * 9) * r * 0.16, y: isl.y, bx: -dx / d, by: -dy / d };
    if (s.t < walkAt) {
      var bu = Math.min(1, Math.max(0, (s.t - 0.15) / 0.4)), be = bu * bu * (3 - 2 * bu), back = r * 0.6 * be;
      var bx = s.home.x + s.home.bx * back, by = s.home.y + s.home.by * back;
      s.dance = s.t + s.d0; // still dancing from when the special started (Joe), side to side on the beat
      var sway = s.dance ? Math.sin(s.dance * 9) * r * 0.16 : 0;
      isl.x = Math.max(r, Math.min(W - r, bx + sway)); isl.y = Math.max(r, Math.min(H - r, by));
    } else {
      s.dance = 0;
      if (d > 3) { var st = Math.min(d, 320 * dt); isl.x += dx / d * st; isl.y += dy / d * st; }
    }
    if (s.t >= cfg.say && d < 8) {
      s.step = "lift"; s.t = 0; s.rx = roo.x; s.ry = roo.y; playWhoosh();
      if (!s.axe) islRooAxeUp(isl, s); // (already hovering since he started dancing)
    }
    return true;
  }
  if (s.step === "lift") {
    // up off the mat and turned on its side as it goes over his head
    var u = Math.min(1, s.t / 0.75), e = u * u * u * (u * (u * 6 - 15) + 10);
    roo.x = s.rx + (isl.x - s.rx) * e; roo.y = s.ry + (isl.y - r * 0.2 - s.ry) * e; roo.z = ISL_ROO_Z * r * e;
    roo.tilt = 0; roo.roll = ISL_ROO_ROLL * e;
    if (u >= 1) { s.step = "shake"; s.t = 0; floater(isl.x, isl.y - r - 30, "LIFTED!", "crit"); crowdReact(1); }
    return true;
  }
  if (s.step === "shake") {
    // a steady, heavy shake: eased in, side to side with a bounce on each
    // swing and the body lagging behind it
    // shaken side to side only: it slides left and right over his head,
    // level, at the same height, easing in and out of each swing
    // a violent side to side shake, getting faster and wider, the
    // kangaroo's body whipping a little behind it
    var amp = Math.min(1, s.t / 0.25), sp = 22 + 10 * Math.min(1, s.t / cfg.shake), ph0 = s.ph || 0;
    s.ph = ph0 + sp * dt; var ph = s.ph;
    amp = amp * amp * (3 - 2 * amp);
    roo.x = isl.x + Math.sin(ph) * r * 0.85 * amp; roo.y = isl.y - r * 0.2; roo.z = ISL_ROO_Z * r;
    roo.tilt = 0; roo.roll = ISL_ROO_ROLL - Math.cos(ph) * 0.12 * amp;
    if (!reduceMotion) shake = Math.max(shake, 5 * amp);
    if (Math.floor(ph / Math.PI) !== Math.floor(ph0 / Math.PI)) { if (Math.floor(ph / Math.PI) % 2 === 0) floater(roo.x, roo.y - roo.z - 150, "SHAKE!", "note"); playRooBoing(0.5); }
    if (s.t >= cfg.shake) {
      // Volk falls out of the pouch, dizzy.
      var side = isl.x < W / 2 ? 1 : -1;
      m.pouched = false; m.scale = 1;
      endKangaroo(volk, isl, true);
      volk.x = Math.max(volk.r, Math.min(W - volk.r, isl.x + side * (r + volk.r + 12))); volk.y = Math.max(volk.r, Math.min(H - volk.r, isl.y + r * 0.3));
      volk.squash = { t: 0.2, max: 0.2, nx: 0, ny: 1 };
      playSlam();
      makeDizzy(volk, cfg.dizzy);
      floater(volk.x, volk.y - volk.r - 50, "FELL OUT!", "crit");
      s.step = "wind"; s.t = 0; s.side = side; s.wx = roo.x; s.wz = roo.z; s.wt = roo.roll;
      floater(roo.x, roo.y - roo.z - 120, "DIZZY!", "note");
    }
    return true;
  }
  if (s.step === "wind") { // cocks it back over his shoulder, then lets it fly
    // cocked way back over his shoulder, trembling with the effort, then
    // heaved: up, over the cage and out into the sky
    // a quick dip to load up, staying right over his head, then heaved
    // toward the nearest side of the ring and out over the cage
    if (!s.dir) {
      var dl = isl.x, dr = W - isl.x, du0 = isl.y, dd = H - isl.y, mn = Math.min(dl, dr, du0, dd);
      s.dir = mn === dl ? { x: -1, y: 0 } : mn === dr ? { x: 1, y: 0 } : mn === du0 ? { x: 0, y: -1 } : { x: 0, y: 1 };
    }
    var wu = Math.min(1, s.t / 0.3), dip = Math.sin(Math.PI * Math.min(1, wu / 0.8));
    roo.x = s.wx + (isl.x - s.wx) * wu; roo.z = ISL_ROO_Z * r - dip * r * 0.25; roo.roll = s.wt + (ISL_ROO_ROLL - s.wt) * wu;
    if (wu >= 1) {
      s.step = "throw"; s.t = 0; s.vx = s.dir.x * 820; s.vy = s.dir.y * 820; s.vz = 620; s.spin = (s.dir.x || s.dir.y) * roo.face * 13; playWhoosh();
      if (!reduceMotion) { shake = Math.max(shake, 16); hitStop = Math.max(hitStop, 0.06); }
      floater(isl.x, isl.y - r - 40, "YEET!", "crit"); crowdReact(1);
    }
    return true;
  }
  // Thrown out over the cage, end over end.
  roo.x += s.vx * dt; roo.y += s.vy * dt; roo.z += s.vz * dt; s.vz -= 700 * dt; roo.roll = (roo.roll || 0) + s.spin * dt;
  if (!s.trail) s.trail = [];
  s.trail.push({ x: roo.x, y: roo.y - roo.z - 72 }); if (s.trail.length > 10) s.trail.shift();
  if (s.t >= 1.3 || roo.x < -500 || roo.x > W + 500 || roo.y < -500 || roo.y > H + 500) {
    islamRooTwinkle = { x: roo.x, y: roo.y - roo.z - 72, t0: performance.now() / 1000 }; // a twinkle where it disappears
    vkRoo = null; isl.islamRoo = null;
    floater(W / 2, H * 0.2, "OUT OF THE ARENA!", "crit");
    crowdReact(1);
    return false;
  }
  return true;
}

// ---------------------------------------------------------------- sounds

function playVanScreech() { islamSfx("islamVanScreech", 0.9); } // Joe's van screech (islam-sfx.js)

// ---------------------------------------------------------------- drawing

// Under the fighters: the cheesecake on the mat, what's left of it.
function drawIslamUnder() {
  balls.forEach(function (b) {
    var m = b.igbb;
    if (m && m.move === "islam" && m.kind === "brotha") drawBrothaBlur(b, m);
    if (!m || m.move !== "islam" || m.kind !== "cheesecake" || !m.cake || m.phase === "serve") return;
    var ck = m.cake;
    ctx.fillStyle = "rgba(0,0,0,0.18)";
    ctx.beginPath(); ctx.ellipse(ck.x, ck.y + 14, 30, 9, 0, 0, Math.PI * 2); ctx.fill();
    drawCheesecake(ck.x, ck.y - ck.z, 1, ck.bites / Math.max(1, b.char.special.cheesecake.bites));
  });
  if (islamCakeLeft) {
    var a = Math.max(0, 1 - (performance.now() / 1000 - islamCakeLeft.t0) / 2);
    if (a <= 0) islamCakeLeft = null;
    else { ctx.save(); ctx.globalAlpha = a; drawCheesecake(islamCakeLeft.x, islamCakeLeft.y, 1, islamCakeLeft.bites / 5); ctx.restore(); }
  }
}

// Over the fighters: the speech bubbles, the cake in his hand, the "?" over a
// confused head, the van and its crew, the kangaroo lift, the fall from the sky.
function drawIslamTop() {
  var now = performance.now() / 1000;
  drawIslamRooTwinkle();
  balls.forEach(function (b) {
    var m = b.igbb, o = balls[1 - b.id], r = b.r;
    if (b.islamRoo) drawIslamRoo(b, b.islamRoo, now);
    if (!m || m.move !== "islam" || !b.alive) return;
    if (m.kind === "brotha") {
      drawBrothaHands(b, o, m, now);
      if (m.phase === "rush" && m.saw && o.alive) drawSawHim(o, now);
      else if (m.huh && o.alive) drawHuh(o, now);
    }
    if (m.kind === "cheesecake") {
      if (m.phase === "serve") {
        var side = o.x >= b.x ? 1 : -1, lift = Math.min(1, m.t / 0.35);
        var hx = b.x + side * r * 0.75, hy = b.y - r * (0.35 + 0.35 * lift);
        drawBentArm(b, { x: b.x + side * r * 0.66, y: b.y - r * 0.3 }, { x: hx, y: hy + 10 }, side);
        drawCheesecake(hx, hy - 6, 0.85, 0);
        drawGloveAt(hx, hy + 10, r * 0.22, b.char);
        drawGloveAt(b.x - side * r * 0.55, b.y - r * 0.05, r * 0.22, b.char);
      } else if (m.phase === "cakeToss") {
        var sd = o.x >= b.x ? 1 : -1;
        drawGloveAt(b.x + sd * r * 1.0, b.y - r * 0.5, r * 0.22, b.char);
        drawGloveAt(b.x - sd * r * 0.55, b.y - r * 0.05, r * 0.22, b.char);
      }
      if ((m.phase === "chase" || m.phase === "eat") && o.alive) drawHearts(o, now);
      if (m.phase === "eat" && m.cake && o.alive) drawCakeEater(o, m, b.char.special.cheesecake, now);
    }
    if (m.kind === "dagestan") {
      if (m.van) drawDagestanVan(b, o, m, now);
      if (m.phase === "fall") {
        // Straight down out of the sky onto his spot (seen from above): huge
        // and close at first, shrinking to his size as he falls, picking up
        // speed, with his shadow tightening under him and a target on the mat.
        var u = Math.min(1, m.t / b.char.special.dagestan.fall), h = 1 - u * u, k = 1 + 2.6 * h, y = o.y - h * o.r * 0.8;
        ctx.save();
        ctx.strokeStyle = "rgba(220,40,40," + (0.35 + 0.35 * Math.abs(Math.sin(m.t * 14))).toFixed(3) + ")"; ctx.lineWidth = 4;
        ctx.beginPath(); ctx.arc(o.x, o.y, o.r * (1.1 + 0.4 * h), 0, Math.PI * 2); ctx.stroke();
        ctx.fillStyle = "rgba(0,0,0," + (0.1 + 0.25 * u).toFixed(3) + ")";
        ctx.beginPath(); ctx.ellipse(o.x, o.y + o.r * 0.15, o.r * (0.5 + 0.5 * u), o.r * (0.42 + 0.4 * u), 0, 0, Math.PI * 2); ctx.fill();
        if (!reduceMotion && h > 0.15) { // air rushing past him
          ctx.strokeStyle = "rgba(255,255,255," + (0.6 * h).toFixed(3) + ")"; ctx.lineWidth = 3; ctx.lineCap = "round";
          for (var sl = 0; sl < 8; sl++) { var sa2 = sl / 8 * Math.PI * 2 + 0.3; var r1 = o.r * k * 1.05, r2 = r1 + o.r * (0.5 + 0.9 * h); ctx.beginPath(); ctx.moveTo(o.x + Math.cos(sa2) * r1, y + Math.sin(sa2) * r1); ctx.lineTo(o.x + Math.cos(sa2) * r2, y + Math.sin(sa2) * r2); ctx.stroke(); }
        }
        ctx.globalAlpha = Math.min(1, 0.55 + u * 1.5);
        ctx.translate(o.x, y); ctx.rotate((1 - u) * 6); ctx.translate(-o.x, -y);
        drawFighterArt(ctx, o.x, y, o.r * k, o.char.look, theme.wall, { layout: "contained", name: o.char.name });
        ctx.restore();
      }
    }
  });
}


// Their own two gloves while they eat (Joe 2026-11-23): one steadies the
// plate, the other scoops a slice up to the mouth on every bite, chewing
// with crumbs flying.
function drawCakeEater(o, m, c, now) {
  var ck = m.cake, r = o.r, sean = islIdHas(o, "sean-omalley");
  var per = (sean ? c.seanEat : c.eat) / c.bites, u = 1 - Math.max(0, m.chomp) / per; // 0 at a bite, 1 just before the next
  var f = m.face || { x: 0, y: 1 }, side = f.x >= 0 ? 1 : -1;
  var mouth = { x: o.x + f.x * r * 0.05, y: o.y - r * 0.16 }; // under the beard line, where the art puts it
  var cake = { x: ck.x - side * 8, y: ck.y - 4 };
  // up at the mouth at the bite, down to the cake mid-way, back up again
  var lift = u < 0.25 ? 1 - u / 0.25 : u < 0.55 ? 0 : (u - 0.55) / 0.45, e = lift * lift * (3 - 2 * lift);
  var hx = cake.x + (mouth.x - cake.x) * e + side * r * 0.25 * (1 - e), hy = cake.y + (mouth.y - cake.y) * e - Math.sin(Math.PI * e) * r * 0.25;
  var shR = { x: o.x + side * r * 0.62, y: o.y - r * 0.1 }, shL = { x: o.x - side * r * 0.62, y: o.y - r * 0.1 };
  var steady = { x: cake.x - side * r * 0.35, y: cake.y + 6 };
  drawBentArm(o, shL, steady, -side); drawGloveAt(steady.x, steady.y, r * 0.2, o.char);
  drawBentArm(o, shR, { x: hx, y: hy }, side);
  if (u > 0.4) { // the slice in his glove on the way up
    var sk = r / 26; // sized to them
    ctx.save(); ctx.translate(hx + side * r * 0.08, hy - r * 0.24); ctx.rotate(-side * 0.3); ctx.scale(sk, sk);
    ctx.fillStyle = "#1f2328"; ctx.beginPath(); ctx.moveTo(-9, 5); ctx.lineTo(9, 5); ctx.lineTo(0, -10); ctx.closePath(); ctx.fill();
    ctx.fillStyle = "#c9893f"; ctx.fillRect(-7, 1, 14, 3);
    ctx.fillStyle = "#f3ead2"; ctx.beginPath(); ctx.moveTo(-7, 1); ctx.lineTo(7, 1); ctx.lineTo(0, -8); ctx.closePath(); ctx.fill();
    ctx.fillStyle = "#c8172a"; ctx.beginPath(); ctx.moveTo(-3, -4); ctx.lineTo(3, -4); ctx.lineTo(0, -8); ctx.closePath(); ctx.fill();
    ctx.restore();
  }
  drawGloveAt(hx, hy, r * 0.21, o.char);
  if (u < 0.3) { // chewing: cheeks puffed, crumbs off the mouth
    var ch = 1 - u / 0.3;
    ctx.save(); ctx.globalAlpha = 0.85 * ch; ctx.fillStyle = "#f3ead2"; ctx.strokeStyle = "#1f2328"; ctx.lineWidth = 1;
    for (var i = 0; i < 4; i++) { var a = i * 1.7 + 0.4, d = r * (0.25 + 0.35 * (1 - ch)); ctx.beginPath(); ctx.arc(mouth.x + Math.cos(a) * d, mouth.y + Math.sin(a) * d * 0.6 + (1 - ch) * 8, 2.4, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); }
    ctx.restore();
  }
}

function drawHuh(o, now) {
  ctx.save();
  ctx.font = "900 " + Math.round(o.r * 0.5) + "px Impact, 'Arial Black', sans-serif";
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  for (var i = 0; i < 3; i++) {
    var a = now * 2.2 + i * 2.1, x = o.x + Math.cos(a) * o.r * 0.7, y = o.y - o.r * 1.5 + Math.sin(a * 1.3) * 6;
    ctx.lineWidth = 4; ctx.strokeStyle = "#1f2328"; ctx.strokeText("?", x, y);
    ctx.fillStyle = "#ffd23f"; ctx.fillText("?", x, y);
  }
  ctx.restore();
}
function drawHearts(o, now) {
  ctx.save();
  for (var i = 0; i < 3; i++) {
    var u = (now * 0.8 + i / 3) % 1, x = o.x + (i - 1) * o.r * 0.45, y = o.y - o.r * (1.0 + u * 0.7);
    ctx.globalAlpha = 1 - u; ctx.fillStyle = "#ff4f7b"; ctx.strokeStyle = "#1f2328"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(x, y + 6); ctx.bezierCurveTo(x - 12, y - 4, x - 6, y - 14, x, y - 6); ctx.bezierCurveTo(x + 6, y - 14, x + 12, y - 4, x, y + 6); ctx.fill(); ctx.stroke();
  }
  ctx.restore();
}

// The cheesecake (Joe's picture, drawn in code): a whole cake seen from a
// little above, `eaten` 0..1 taken out of it in wedges.
function drawCheesecake(x, y, s, eaten) {
  var R = 26 * s, H2 = 12 * s, left = 1 - (eaten || 0);
  if (left <= 0.02) { // just crumbs on the plate
    ctx.fillStyle = "#f4f1ea"; ctx.strokeStyle = "#1f2328"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.ellipse(x, y + H2, R * 1.25, R * 0.5, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#c9893f"; for (var j = 0; j < 5; j++) { ctx.beginPath(); ctx.arc(x + (j - 2) * 6 * s, y + H2 + ((j * 7) % 5 - 2) * s, 2 * s, 0, Math.PI * 2); ctx.fill(); }
    return;
  }
  ctx.save();
  // Plate.
  ctx.fillStyle = "#f4f1ea"; ctx.strokeStyle = "#1f2328"; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.ellipse(x, y + H2, R * 1.25, R * 0.5, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  var a0 = -Math.PI / 2, a1 = a0 + Math.PI * 2 * left, full = left > 0.98;
  var wedge = function (cy, rr, ry) { ctx.beginPath(); if (!full) ctx.moveTo(x, cy); ctx.ellipse(x, cy, rr, ry, 0, a0, a1); ctx.closePath(); };
  // The side: graham crust at the bottom, cream above it.
  ctx.fillStyle = "#1f2328"; wedge(y + H2 * 0.6, R + 2, R * 0.42 + 2); ctx.fill();
  ctx.fillStyle = "#c9893f"; wedge(y + H2 * 0.55, R, R * 0.42); ctx.fill();
  ctx.fillStyle = "#f3ead2"; wedge(y + H2 * 0.2, R, R * 0.42); ctx.fill();
  for (var k = 1; k < 5; k++) { ctx.fillStyle = k < 3 ? "#f3ead2" : "#efe3c6"; wedge(y + H2 * 0.2 - k * H2 * 0.15, R, R * 0.42); ctx.fill(); }
  // The top: raspberry glaze over cream.
  ctx.fillStyle = "#f6efdc"; wedge(y - H2 * 0.55, R, R * 0.42); ctx.fill();
  ctx.fillStyle = "#c8172a"; wedge(y - H2 * 0.55, R * 0.88, R * 0.36); ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.35)";
  ctx.beginPath(); ctx.ellipse(x - R * 0.3, y - H2 * 0.7, R * 0.25, R * 0.07, -0.2, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = "#1f2328"; ctx.lineWidth = 1.5; wedge(y - H2 * 0.55, R, R * 0.42); ctx.stroke();
  // Raspberries and a mint leaf, on what's left.
  var berries = [[-0.35, -0.05], [0.0, -0.18], [0.32, -0.02], [0.12, 0.14], [-0.15, 0.16]];
  berries.forEach(function (bq, i) {
    var ba = Math.atan2(bq[1], bq[0]) - a0; if (ba < 0) ba += Math.PI * 2;
    if (!full && ba > Math.PI * 2 * left) return;
    var bx = x + bq[0] * R * 1.6, by = y - H2 * 0.8 + bq[1] * R * 1.2;
    ctx.fillStyle = "#e0294a"; ctx.strokeStyle = "#5c0a18"; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.arc(bx, by, 5.2 * s, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "rgba(255,190,200,0.8)"; ctx.beginPath(); ctx.arc(bx - 1.5 * s, by - 1.8 * s, 1.4 * s, 0, Math.PI * 2); ctx.fill();
  });
  if (left > 0.5) {
    ctx.fillStyle = "#4caf3a"; ctx.strokeStyle = "#1d4d16"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.ellipse(x + 2 * s, y - H2 * 1.4, 6 * s, 3 * s, -0.6, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(x + 8 * s, y - H2 * 1.25, 5 * s, 2.6 * s, 0.5, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  }
  ctx.restore();
}

// The van (drawn in code from Joe's picture): a white high-roof panel van,
// side on, sliding door, black bumper strip, red tail lights.
function drawIslVan(x, y, face, door, s) {
  s = s || 1;
  ctx.save();
  ctx.translate(x, y); ctx.scale(face * s, s);
  var OUT = "#1f2328";
  ctx.fillStyle = "rgba(0,0,0,0.2)"; ctx.beginPath(); ctx.ellipse(0, 4, 160, 16, 0, 0, Math.PI * 2); ctx.fill();
  // Body.
  ctx.fillStyle = "#f2f3f4"; ctx.strokeStyle = OUT; ctx.lineWidth = 4; ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(-150, -18); ctx.lineTo(-150, -150); ctx.quadraticCurveTo(-150, -160, -140, -160);
  ctx.lineTo(70, -160); ctx.quadraticCurveTo(95, -158, 110, -118); ctx.lineTo(140, -78); ctx.quadraticCurveTo(156, -70, 156, -50);
  ctx.lineTo(156, -18); ctx.closePath(); ctx.fill(); ctx.stroke();
  // Black bumper strip and lower trim.
  ctx.fillStyle = "#2b2f33"; ctx.fillRect(-150, -40, 306, 12);
  ctx.fillStyle = "#3a3f44"; ctx.fillRect(-150, -24, 306, 8);
  // Windows: the cab.
  ctx.fillStyle = "#3b4b5a";
  ctx.beginPath(); ctx.moveTo(72, -140); ctx.lineTo(98, -140); ctx.lineTo(126, -92); ctx.lineTo(72, -92); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = "rgba(255,255,255,0.35)"; ctx.beginPath(); ctx.moveTo(78, -136); ctx.lineTo(90, -136); ctx.lineTo(80, -100); ctx.lineTo(76, -100); ctx.closePath(); ctx.fill();
  // The sliding door (opens back along the side).
  var dx = -10 - door * 90;
  ctx.fillStyle = door > 0.05 ? "#141414" : "#f2f3f4";
  ctx.fillRect(-10, -146, 78, 104);
  ctx.strokeStyle = OUT; ctx.lineWidth = 2.5; ctx.strokeRect(-10, -146, 78, 104);
  if (door > 0.05) { ctx.fillStyle = "#e9eaeb"; ctx.fillRect(dx, -146, 78, 104); ctx.strokeRect(dx, -146, 78, 104); }
  // Panel lines, handle, mirror.
  ctx.beginPath(); ctx.moveTo(-148, -132); ctx.lineTo(68, -132); ctx.stroke();
  ctx.fillStyle = "#1f2328"; ctx.fillRect(48, -92, 14, 4); ctx.fillRect(128, -100, 8, 16);
  // Lights.
  ctx.fillStyle = "#d4202c"; ctx.fillRect(-150, -96, 8, 30);
  ctx.fillStyle = "#fff4c2"; ctx.beginPath(); ctx.ellipse(150, -62, 6, 8, 0, 0, Math.PI * 2); ctx.fill();
  // Wheels.
  [-92, 104].forEach(function (wx) {
    ctx.fillStyle = "#1a1a1a"; ctx.beginPath(); ctx.arc(wx, -14, 24, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#9aa3ab"; ctx.beginPath(); ctx.arc(wx, -14, 11, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#4a5056"; ctx.beginPath(); ctx.arc(wx, -14, 4, 0, Math.PI * 2); ctx.fill();
  });
  ctx.restore();
}

// A Dagestani guy: a ball with a big black beard and a woolly papakha.
var ISL_GUY_LOOKS = null;
function islGuyLook(i) {
  if (!ISL_GUY_LOOKS) {
    var base = { build: "muscular", bodyHair: "light", hair: "buzz", hairColor: "#1a1410", beard: "full", ears: "cauliflower", tattoos: {}, shortsStyle: "stripe", gloves: "#151515", trim: "#c9a646" };
    ISL_GUY_LOOKS = [
      Object.assign({}, base, { skin: "#d9a682", beardColor: "#1a1410", shorts: "#161616" }),
      Object.assign({}, base, { skin: "#e2b58f", beardColor: "#2a1d14", shorts: "#2b3d6b" }),
      Object.assign({}, base, { skin: "#cf9c78", beardColor: "#140f0c", shorts: "#3a3a3a" }),
      Object.assign({}, base, { skin: "#dcae88", beardColor: "#221811", shorts: "#5a1b1b" })
    ];
  }
  return ISL_GUY_LOOKS[i % ISL_GUY_LOOKS.length];
}
function drawDagGuy(x, y, r, i) {
  drawFighterArt(ctx, x, y, r, islGuyLook(i), theme.wall, { layout: "contained", name: "" });
  // The papakha.
  ctx.save();
  ctx.fillStyle = "#e8e2d6"; ctx.strokeStyle = "#1f2328"; ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.moveTo(x - r * 0.62, y - r * 0.72); ctx.lineTo(x - r * 0.55, y - r * 1.32); ctx.quadraticCurveTo(x, y - r * 1.45, x + r * 0.55, y - r * 1.32); ctx.lineTo(x + r * 0.62, y - r * 0.72); ctx.quadraticCurveTo(x, y - r * 0.6, x - r * 0.62, y - r * 0.72); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.strokeStyle = "rgba(120,110,95,0.6)"; ctx.lineWidth = 1.5;
  for (var k = 0; k < 7; k++) { var cx = x - r * 0.48 + k * r * 0.16; ctx.beginPath(); ctx.arc(cx, y - r * (1.0 + 0.12 * (k % 2)), r * 0.07, 0, Math.PI * 2); ctx.stroke(); }
  ctx.restore();
}

function islVanScale(b) { return Math.max(0.62, b.r / 80); }
// Keeps the van inside the ring and its bumper behind them.
function islVanClamp(v, o) {
  var half = 160 * v.s, lim = o.x - v.dir * (o.r * 1.3 + 156 * v.s + 10); // art and gloves clear of the bumper
  if (v.dir > 0) v.x = Math.min(v.x, lim); else v.x = Math.max(v.x, lim);
  v.x = Math.max(half, Math.min(W - half, v.x));
}
var ISL_VAN_GO = 0.75; // the drive-off: burnout until then, then it launches
function drawDagestanVan(b, o, m, now) {
  var v = m.van, r = b.r;
  if (m.phase === "away" || m.phase === "fall") return;
  var free = m.phase === "drive" && v.went; // driving off, it goes on over the stands
  ctx.save();
  if (!free) { ctx.beginPath(); ctx.rect(0, 0, W, H); ctx.clip(); } // never past the cage, until it drives off
  if (v.skid) { // rubber left on the mat
    ctx.fillStyle = "rgba(30,30,30,0.45)";
    for (var sk = 0; sk < 2; sk++) ctx.fillRect(v.dir > 0 ? v.skid.x - v.skid.len : v.skid.x, v.y - 4 * v.s - sk * 14 * v.s, v.skid.len, 6 * v.s);
  }
  ctx.globalAlpha = v.a == null ? 1 : v.a;
  if (v.tilt || v.jit) { // the back wheel's the pivot
    var px = v.x - v.dir * 92 * v.s, py = v.y;
    ctx.translate(px, py + (v.jit || 0)); ctx.rotate(-v.dir * (v.tilt || 0)); ctx.translate(-px, -py);
  }
  drawIslVan(v.x, v.y, v.dir, v.door, v.s || islVanScale(b));
  ctx.restore();
  ctx.save();
  if (!free) { ctx.beginPath(); ctx.rect(0, 0, W, H); ctx.clip(); }
  if (m.phase === "drive" && m.t >= 0.25) { // tyre smoke off the back wheel, then exhaust and speed lines as it goes
    var rx = v.x - v.dir * 92 * v.s, ry = v.y - 10 * v.s, go = m.t >= ISL_VAN_GO;
    for (var sp = 0; sp < 7; sp++) {
      var ph = ((m.t - 0.25) * 2.2 + sp / 7) % 1, rad = (14 + ph * 46) * v.s;
      ctx.globalAlpha = (1 - ph) * (go ? Math.max(0, 1 - (m.t - ISL_VAN_GO) / 0.5) : 0.85);
      ctx.fillStyle = "#dcdcdc"; ctx.beginPath(); ctx.arc(rx - v.dir * ph * 110 * v.s, ry - ph * 50 * v.s + Math.sin(sp * 2.3) * 8, rad, 0, Math.PI * 2); ctx.fill();
    }
    if (!go) { // the spinning wheel's blur
      ctx.globalAlpha = 0.8; ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 2.5;
      for (var wl = 0; wl < 3; wl++) { var wa = m.t * 40 + wl * 2.1; ctx.beginPath(); ctx.arc(rx, v.y - 14 * v.s, 20 * v.s, wa, wa + 1.1); ctx.stroke(); }
    } else {
      ctx.globalAlpha = 0.85; ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 3; ctx.lineCap = "round";
      for (var k2 = 0; k2 < 4; k2++) { var ly2 = v.y - 30 * v.s - k2 * 30 * v.s, lx2 = v.x - v.dir * 175 * v.s; ctx.beginPath(); ctx.moveTo(lx2, ly2); ctx.lineTo(lx2 - v.dir * (60 + k2 * 14), ly2); ctx.stroke(); }
    }
  }
  if (v.outDust) { // the dust burst where it goes through the cage
    var du = Math.min(1, v.outDust / 0.6), ex = v.dir > 0 ? W : 0;
    ctx.globalAlpha = 1 - du; ctx.fillStyle = "#e9dfc8";
    for (var p2 = 0; p2 < 6; p2++) { ctx.beginPath(); ctx.arc(ex - v.dir * (10 + du * 30), v.y - 30 - p2 * 22 * v.s, (30 + p2 * 4 + du * 30) * v.s, 0, Math.PI * 2); ctx.fill(); }
  }
  ctx.globalAlpha = 1;
  if (m.phase === "van" && v.a < 1) { // bursting in at the cage
    ctx.globalAlpha = 1 - v.a; ctx.fillStyle = "#e9dfc8";
    for (var p = 0; p < 6; p++) { ctx.beginPath(); ctx.arc(v.x - v.dir * 150 * v.s, v.y - 30 - p * 22, 30 + p * 4, 0, Math.PI * 2); ctx.fill(); }
  }
  ctx.restore();
  // The two guys.
  if (m.phase === "nab") {
    var out = Math.min(1, m.t / 0.35), doorX = v.x - v.dir * 10;
    for (var g = 0; g < 2; g++) {
      var gx0 = doorX + (g ? 18 : -18), gy0 = v.y - 40;
      var tx = m.carry ? o.x + (g ? 1 : -1) * o.r * 0.95 : o.x + (g ? 1 : -1) * o.r * 1.4, ty = m.carry ? o.y : o.y + 10;
      var gx = gx0 + (tx - gx0) * out, gy = gy0 + (ty - gy0) * out - Math.sin(Math.PI * Math.min(1, m.t / 0.35)) * 30;
      drawDagGuy(gx, gy, r * 0.62, g);
    }
  }
  if (m.phase === "van" || m.phase === "brake") { // dust and speed lines
    ctx.save(); ctx.strokeStyle = "rgba(255,255,255,0.8)"; ctx.lineWidth = 3; ctx.lineCap = "round";
    for (var k = 0; k < 4; k++) { var ly = v.y - 30 - k * 30, lx = v.x - v.dir * 170; ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(lx - v.dir * (50 + k * 12), ly); ctx.stroke(); }
    ctx.restore();
  }
  if (m.stars && o.alive && !m.inVan) {
    for (var i = 0; i < 3; i++) { var a = now * 5 + i * 2.1; drawStar(o.x + Math.cos(a) * o.r * 0.7, o.y - o.r * 1.0 + Math.sin(a) * 6, 9, "#ffd23f"); }
  }
}

// Islam holding the kangaroo up over his head (his own two arms).
function drawIslamRoo(b, s, now) {
  // (no speech bubbles on his moves: Joe's voice clips say the lines, islam-voice.js)
  if (s.axe) drawIslRooAxe(b, s, now);
  if (vkRoo && (s.step === "shake" || s.step === "wind" || s.step === "throw")) { // everyone's dizzy
    var hd = rooPt(vkRoo, 34, -168), dz = s.step === "shake" ? Math.min(1, s.t / 0.6) : 1;
    for (var st = 0; st < 3; st++) { var sa = now * 7 + st * 2.1; ctx.save(); ctx.globalAlpha = dz; drawStar(hd.x + Math.cos(sa) * 26, hd.y - 20 + Math.sin(sa) * 9, 10, "#ffd23f"); ctx.restore(); }
    var vo = balls[1 - b.id], vm = vo && vo.igbb;
    if (s.step === "shake" && vm && vm.pouched) for (var sv = 0; sv < 3; sv++) { var va = -now * 8 + sv * 2.1; ctx.save(); ctx.globalAlpha = dz; drawStar(vo.x + Math.cos(va) * vo.r * 0.6, vo.y - vo.r * 0.7 + Math.sin(va) * 6, 8, "#ffd23f"); ctx.restore(); }
  }
  if (s.step === "throw" && s.trail) { // speed streaks behind it
    ctx.save(); ctx.strokeStyle = "rgba(255,255,255,0.7)"; ctx.lineCap = "round";
    for (var tr = 1; tr < s.trail.length; tr++) { ctx.lineWidth = 2 + tr * 1.6; ctx.globalAlpha = tr / s.trail.length * 0.7; ctx.beginPath(); ctx.moveTo(s.trail[tr - 1].x, s.trail[tr - 1].y); ctx.lineTo(s.trail[tr].x, s.trail[tr].y); ctx.stroke(); }
    ctx.restore();
  }
  if ((s.step === "say" || s.step === "pre") && s.dance > 0) { // dancing: fists pumping, one up as the other comes down
    var dr2 = b.r;
    [-1, 1].forEach(function (sd) {
      var ph = s.dance * 9 + (sd > 0 ? Math.PI : 0), up = Math.max(0, Math.sin(ph));
      var shd = { x: b.x + sd * dr2 * 0.66, y: b.y - dr2 * 0.3 }, hd = { x: b.x + sd * dr2 * (0.85 + 0.1 * up), y: b.y - dr2 * (0.25 + 0.75 * up) };
      drawBentArm(b, shd, hd, sd); drawGloveAt(hd.x, hd.y, dr2 * 0.22, b.char);
    });
  }
  if (s.step === "say" || s.step === "pre" || s.step === "throw" || !vkRoo) return;
  var r = b.r, ro = vkRoo.roll || 0, k = Math.min(1, ro / ISL_ROO_ROLL), mid = 85 * KR_S;
  // under its middle, which turns round 85 units up from its feet
  var cx = vkRoo.x, cy = vkRoo.y - vkRoo.z - mid * k, under = r * (0.1 + 0.55 * k);
  var ease = s.step === "lift" ? Math.min(1, s.t / 0.25) : 1; ease = ease * ease * (3 - 2 * ease); // hands come up from his guard
  [-1, 1].forEach(function (sd) {
    var sh = { x: b.x + sd * r * 0.66, y: b.y - r * 0.3 }, tgt = { x: cx + sd * r * (0.4 + 0.15 * k), y: cy + under };
    var g0 = { x: b.x + sd * r * 0.75, y: b.y - r * 0.15 }, hand = { x: g0.x + (tgt.x - g0.x) * ease, y: g0.y + (tgt.y - g0.y) * ease };
    drawBentArm(b, sh, hand, sd);
    drawGloveAt(hand.x, hand.y, r * 0.22, b.char);
  });
}

// The twinkle in the sky where the kangaroo vanished (over everything).
function drawIslamRooTwinkle() {
  var tw = islamRooTwinkle; if (!tw) return;
  var t = performance.now() / 1000 - tw.t0; if (t > 0.7 || t < 0) { islamRooTwinkle = null; return; }
  var x = Math.max(30, Math.min(W - 30, tw.x)), y = Math.max(30, tw.y), k = Math.sin(Math.PI * t / 0.7);
  ctx.save(); ctx.translate(x, y); ctx.rotate(t * 4); ctx.fillStyle = "#fffbe0"; ctx.strokeStyle = "#ffd23f"; ctx.lineWidth = 2;
  ctx.beginPath(); for (var i = 0; i < 8; i++) { var a = i * Math.PI / 4, rr = (i % 2 ? 6 : 26) * k; ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore();
}

// As Kratos: the axe tossed up off his hand as he goes to lift, hovering
// beside him in a frosty glow while his hands are full, and flying back to
// his hand once the kangaroo's thrown.
// As Kratos, the axe goes up to hover beside him while he dances and lifts
// (on the open side, toward the middle).
function islRooAxeUp(isl, s) {
  var hsw = isl.rapier && isl.rapier.sword;
  if (hsw && hsw.out) s.axe = { x0: isl.x + (hsw.side >= 0 ? 1 : -1) * isl.r * 0.9, y0: isl.y - isl.r * 0.1, side: isl.x < W / 2 ? 1 : -1, sx: isl.x < W / 2 ? 1 : -1, ft: 0 };
}
function islRooAxeSpot(b, s, now) {
  return { x: b.x + s.axe.sx * b.r * 1.75, y: b.y - b.r * 0.35 + Math.sin(now * 3.2) * b.r * 0.08 };
}
function drawIslRooAxe(b, s, now) {
  var len = b.r * AXE_LEN * 0.85, hov = islRooAxeSpot(b, s, now), hand = { x: b.x + s.axe.side * -1 * b.r * 0.9, y: b.y - b.r * 0.1 }, x, y, a, glow = 1;
  var hoverA = -Math.PI / 2 + Math.sin(now * 2.1) * 0.12; // head up, swaying a little
  if (s.axe.ft < 0.4 && s.step !== "wind" && s.step !== "throw") { // off his hand, up and over, spinning
    var u = s.axe.ft / 0.4, e = u * u * (3 - 2 * u);
    x = s.axe.x0 + (hov.x - s.axe.x0) * e; y = s.axe.y0 + (hov.y - s.axe.y0) * e - Math.sin(Math.PI * u) * b.r * 0.9;
    a = hoverA + (1 - e) * Math.PI * 2 * s.axe.side; glow = e;
  } else if (s.step === "wind" || s.step === "throw") { // back to his hand as Volk drops out
    var ru = s.step === "throw" ? 1 : Math.min(1, s.t / 0.35), re = ru * ru;
    x = hov.x + (hand.x - hov.x) * re; y = hov.y + (hand.y - hov.y) * re - Math.sin(Math.PI * ru) * b.r * 0.5;
    a = hoverA - re * Math.PI * 1.5 * s.axe.side; glow = 1 - ru;
    if (ru >= 1) return;
  } else { x = hov.x; y = hov.y; a = hoverA; }
  ctx.save();
  if (glow > 0.05) { // the frost glow it hangs in
    var g = ctx.createRadialGradient(x, y, 2, x, y, len * 0.6);
    g.addColorStop(0, "rgba(200,240,255," + (0.45 * glow).toFixed(3) + ")"); g.addColorStop(1, "rgba(200,240,255,0)");
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, len * 0.6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "rgba(235,250,255," + (0.8 * glow).toFixed(3) + ")";
    for (var i = 0; i < 5; i++) { var pa = now * 1.6 + i * 1.26, pr = len * (0.3 + 0.08 * Math.sin(now * 3 + i)); ctx.beginPath(); ctx.arc(x + Math.cos(pa) * pr, y + Math.sin(pa) * pr * 0.6, 2.2, 0, Math.PI * 2); ctx.fill(); }
  }
  ctx.restore();
  drawSpunAxe(x, y, a, len, 1); // (islam-axe.js)
}
// From drawDiamondSword (sword.js): the axe isn't in his hand while it hovers.
function islamRooHover(b) {
  var s = b && b.islamRoo;
  return !!(s && s.axe && s.step !== "throw" && !(s.step === "wind" && s.t >= 0.35));
}

// ---------------------------------------------------------------- the cut to Dagestan

// Over everything, while the fight holds (draw.js, after the other cutscenes).
function drawIslamCutscene() {
  var T = islamTrip;
  if (!T || !balls) return;
  var isl = balls[T.ownerId], vic = balls[T.vicId], u = T.u, now = performance.now() / 1000;
  var cw = canvas.width, ch = canvas.height, k = Math.max(cw / 1080, ch / 1920);
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = "#000"; ctx.fillRect(0, 0, cw, ch);
  ctx.translate((cw - 1080 * k) / 2, (ch - 1920 * k) / 2); ctx.scale(k, k);
  ctx.beginPath(); ctx.rect(0, 0, 1080, 1920); ctx.clip();
  drawDagestanBackdrop(ctx); // the Caucasus, the stone village, the hillside (islam-dagestan-art.js)
  // Title.
  var ta = Math.min(1, u / 0.3) * (u < 1.6 ? 1 : Math.max(0, 1 - (u - 1.6) / 0.4));
  if (ta > 0) {
    ctx.save(); ctx.globalAlpha = ta; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.font = "900 120px Impact, 'Arial Black', sans-serif"; ctx.lineWidth = 12; ctx.strokeStyle = "#1f2328";
    ctx.strokeText("DAGESTAN", 540, 360); ctx.fillStyle = "#ffd23f"; ctx.fillText("DAGESTAN", 540, 360);
    ctx.font = "800 46px Impact, 'Arial Black', sans-serif"; ctx.lineWidth = 7;
    ctx.strokeText("2-3 YEARS AND FORGET", 540, 460); ctx.fillStyle = "#ffffff"; ctx.fillText("2-3 YEARS AND FORGET", 540, 460);
    ctx.restore();
  }
  // A wooden road sign.
  ctx.fillStyle = "#6b4a2a"; ctx.fillRect(943, 940, 14, 150);
  ctx.fillStyle = "#8a6238"; ctx.strokeStyle = "#1f2328"; ctx.lineWidth = 4;
  ctx.fillRect(850, 920, 200, 70); ctx.strokeRect(850, 920, 200, 70);
  ctx.fillStyle = "#f4ead2"; ctx.font = "800 30px Impact, sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("DAGESTAN", 950, 956);
  var R = 78; // fighters at cutscene size
  // The van pulls up, throws them out, and drives off.
  var vx = u < 1.3 ? -260 + 520 * islE(u / 1.3) : u < 1.95 ? 260 : 260 + Math.pow((u - 1.95) / 0.3, 2) * 1150;
  var door = u < 1.3 ? 0 : u < 1.45 ? (u - 1.3) / 0.15 : u < 1.8 ? 1 : Math.max(0, 1 - (u - 1.8) / 0.15);
  var vicX = 640, vicY = 1330; // out in front of the van, clear of it
  if (u >= 1.45 && u < 1.9) { // flung out of the door (behind the van's side), landing out in front
    var fu = (u - 1.45) / 0.45;
    var fx = 270 + (vicX - 270) * fu, fy = 1170 + (vicY - 1170) * fu - Math.sin(Math.PI * fu) * 110;
    drawIslVan(vx, 1240, 1, door, 1.5); islFighterAt(vic, fx, fy, R, fu * 8);
  } else if (u < 2.3) drawIslVan(vx, 1240, 1, door, 1.5); // and away before the beating
  // The dust cloud beating.
  if (u >= 1.9 && u < 2.6) { // dazed where they landed, as the van pulls away
    islFighterAt(vic, vicX, vicY, R, 0.3);
    for (var s0 = 0; s0 < 3; s0++) { var a0 = now * 5 + s0 * 2.1; drawStar(vicX + Math.cos(a0) * R * 0.6, vicY - R * 1.05 + Math.sin(a0) * 6, 12, "#ffd23f"); }
  }
  if (u >= 2.25 && u < 4.1) {
    for (var g = 0; g < 3; g++) { // Dagestani fighters piling in from the sides and the front
      var ju = Math.min(1, (u - 2.25) / 0.35), sx = [-80, 1160, 540][g], sy = [1520, 1520, 1780][g];
      if (ju < 1) drawDagGuy(sx + (vicX - sx) * ju, sy + (vicY - sy) * ju - Math.sin(Math.PI * ju) * 160, R * 0.85, g);
    }
    if (u > 2.55) islDustCloud(vicX, vicY, 230, now, vic);
  }
  if (u >= 4.1) {
    // Cloud gone: they're kicked out of it into a heap, Hasbulla wheels the
    // catapult out, two of the Dagestani guys heave them into the spoon, he
    // yanks the release and the arm whips up and slams into the crossbar,
    // throwing them off at a real 45 degrees.
    var CS = 1.3, cx1 = 440, ru = Math.min(1, (u - 4.1) / 0.85), re = 1 - Math.pow(1 - ru, 3);
    var cx = -380 + (cx1 + 380) * re, roll = (cx + 380) / (40 * CS);
    var U_PULL = 5.8, U_REL = 5.875, U_SLAM = 5.96, A_REST = -0.45, A_REL = -0.8, A_STOP = -2.04;
    var swing = u < U_PULL ? 0 : Math.min(1, Math.pow((u - U_PULL) / 0.16, 2)); // accelerating hard
    var arm = A_REST + (A_STOP - A_REST) * swing;
    if (u >= U_SLAM) { var rt = u - U_SLAM; arm = A_STOP + 0.22 * Math.exp(-rt * 7) * Math.abs(Math.sin(rt * 26)); } // recoil off the pad
    if (u >= 5.45 && u < U_PULL) arm = A_REST + 0.07 * Math.exp(-(u - 5.45) * 8) * Math.sin((u - 5.45) * 30); // dips as they land in it
    // the whole frame hops and the picture shakes on the slam
    var hop = 0, shk = 0;
    if (u >= U_SLAM) { var st0 = u - U_SLAM; hop = 16 * Math.exp(-st0 * 8) * Math.abs(Math.sin(st0 * 22)); shk = reduceMotion ? 0 : 18 * Math.exp(-st0 * 9); }
    var cy = 1380 - hop;
    ctx.save();
    if (shk > 0.5) ctx.translate(Math.sin(u * 97) * shk, Math.cos(u * 83) * shk);
    var hr = R * 0.85, rear = cx - 170 * CS;
    // Hasbulla: pushing from behind, then a step back onto the release rope, and a big yank
    var back = u < 5.45 ? 0 : Math.min(1, (u - 5.45) / 0.25), lean = u < 5.65 ? 0 : Math.min(1, (u - 5.65) / 0.15);
    var hx = rear - hr * 1.35 - back * 20 - lean * 16, hy = 1380 + 30 + back * 70, bob = ru < 1 ? Math.abs(Math.sin(u * 18)) * 6 : 0;
    if (ru < 1 && !reduceMotion) { // dust off the wheels
      ctx.fillStyle = "rgba(214,196,156,0.55)";
      for (var dp = 0; dp < 5; dp++) { var dph = (u * 3 + dp / 5) % 1; ctx.beginPath(); ctx.arc(rear - 20 - dph * 120, cy + 70 - dph * 30, 14 + dph * 26, 0, Math.PI * 2); ctx.fill(); }
    }
    var sp = drawIslCatapult(ctx, cx, cy, arm, now, CS, roll); // Joe's catapult (islam-dagestan-art.js)
    var vr = R * 0.8;
    var inBowl = function (s) { return { x: s.x + s.ny * vr * 0.55, y: s.y - Math.abs(s.nx) * vr * 0.55 - vr * 0.25 }; }; // sitting in the bowl
    var bucket = inBowl(sp);
    if (u >= U_SLAM && u < U_SLAM + 0.5) { // dust thrown up off the wheels, a crack at the crossbar
      var du = (u - U_SLAM) / 0.5;
      ctx.save(); ctx.globalAlpha = 0.7 * (1 - du); ctx.fillStyle = "#d8c8a2";
      [-160, -122, 122, 160].forEach(function (wx, i) { for (var q = 0; q < 3; q++) { ctx.beginPath(); ctx.arc(cx + wx * CS + (q - 1) * 40 * du * (i < 2 ? -1 : 1), 1380 + 60 - du * (30 + q * 20), 20 + du * (40 + q * 10), 0, Math.PI * 2); ctx.fill(); } });
      ctx.restore();
      if (du < 0.35) {
        var bx = cx + (-66) * CS, by = cy + (-185) * CS, ba = 1 - du / 0.35;
        ctx.save(); ctx.globalAlpha = ba; ctx.strokeStyle = "#fff6d8"; ctx.lineWidth = 7; ctx.lineCap = "round";
        for (var bl = 0; bl < 8; bl++) { var aa = bl / 8 * Math.PI * 2; ctx.beginPath(); ctx.moveTo(bx + Math.cos(aa) * 30, by + Math.sin(aa) * 30); ctx.lineTo(bx + Math.cos(aa) * (60 + 40 * (1 - ba)), by + Math.sin(aa) * (60 + 40 * (1 - ba))); ctx.stroke(); }
        ctx.font = "900 70px Impact, 'Arial Black', sans-serif"; ctx.textAlign = "center"; ctx.lineWidth = 9; ctx.strokeStyle = "#1f2328"; ctx.strokeText("WHAM!", bx + 30, by - 70); ctx.fillStyle = "#ffd23f"; ctx.fillText("WHAM!", bx + 30, by - 70);
        ctx.restore();
      }
    }
    // them, and the two guys who load them
    var heapX = 860, heapY = vicY, cd = vr + R * 0.8 + 6, gx0 = [heapX - cd - 30, heapX + cd + 30], gEnd = [heapX - cd + 40, heapX + cd + 10], gEndY = [80, 0], crew = [];
    var restB = inBowl({ x: cx1 + (10 + Math.cos(A_REST) * 290) * CS, y: 1380 + (-28 + Math.sin(A_REST) * 290) * CS, nx: Math.cos(A_REST), ny: Math.sin(A_REST) });
    var stars = function (x, y) { for (var st = 0; st < 3; st++) { var sa = now * 5 + st * 2.1; drawStar(x + Math.cos(sa) * R * 0.6, y - R * 0.85 + Math.sin(sa) * 6, 12, "#ffd23f"); } };
    var vx0, vy0, vrot, hands = false;
    if (u < 4.95) { // kicked clear of the cloud, the crew walks over
      var ku = Math.min(1, (u - 4.1) / 0.3);
      vx0 = vicX + (heapX - vicX) * islE(ku); vy0 = vicY + (heapY - vicY) * ku - Math.sin(Math.PI * ku) * 120; vrot = 1.4 + ku * 4;
      var wu = islE((u - 4.15) / 0.45);
      crew = [0, 1].map(function (g) { var g0 = vicX + (g ? 110 : -110); return { x: g0 + (gx0[g] - g0) * wu, y: heapY + 10 - Math.abs(Math.sin(u * 14 + g)) * 10 * (wu < 1 ? 1 : 0) }; });
    } else if (u < 5.32) { // grabbed under the arms, lifted, swung back, and heaved up
      var lu = (u - 4.95) / 0.37, sw2 = Math.sin(Math.PI * Math.min(1, lu / 0.6)) * (lu < 0.6 ? -1 : 0);
      vx0 = heapX + sw2 * 20; vy0 = heapY - 50 * islE(lu / 0.4) - (lu > 0.6 ? (lu - 0.6) / 0.4 * 120 : 0); vrot = 5.4 + lu * 0.6;
      crew = [0, 1].map(function (g) { return { x: heapX + (g ? 1 : -1) * cd, y: heapY + 10 - (lu > 0.6 ? 8 : 0) }; });
      hands = true;
    } else if (u < 5.45) { // in the air, into the spoon
      var fu2 = (u - 5.32) / 0.13, fx0 = heapX, fy0 = heapY - 170;
      vx0 = fx0 + (restB.x - fx0) * fu2; vy0 = fy0 + (restB.y - fy0) * fu2 - Math.sin(Math.PI * fu2) * 70; vrot = 6 + fu2 * 3;
      crew = [0, 1].map(function (g) { return { x: heapX + (g ? 1 : -1) * cd, y: heapY + 2 }; });
    } else if (u < U_REL) { // in the bowl, riding the arm until it lets go
      vx0 = bucket.x; vy0 = bucket.y; vrot = 9 + (u > U_PULL ? (u - U_PULL) * -20 : 0);
      var bk = Math.min(1, (u - 5.45) / 0.25);
      crew = [0, 1].map(function (g) { var g0 = heapX + (g ? 1 : -1) * cd; return { x: g0 + (gEnd[g] - g0) * bk, y: heapY + 10 + gEndY[g] * bk + (u > 5.6 ? -Math.abs(Math.sin(u * 16 + g * 1.4)) * 14 : 0) }; });
    } else { // let go at 45 degrees and gone, spinning
      var rB = inBowl({ x: cx + (10 + Math.cos(A_REL) * 290) * CS, y: 1380 + (-28 + Math.sin(A_REL) * 290) * CS, nx: Math.cos(A_REL), ny: Math.sin(A_REL) });
      var V = 3000, G = 2400, dxv = Math.sin(A_REL), dyv = -Math.cos(A_REL);
      var pos = function (t) { return { x: rB.x + dxv * V * t, y: rB.y + dyv * V * t + G * t * t / 2 }; };
      var tf = u - U_REL;
      for (var tr = 4; tr >= 1; tr--) { var tp = tf - tr * 0.025; if (tp < 0) continue; var pp = pos(tp); ctx.save(); ctx.globalAlpha = 0.12 * (5 - tr); islFighterAt(vic, pp.x, pp.y, vr, 9 - tp * 30); ctx.restore(); }
      var pc = pos(tf); vx0 = pc.x; vy0 = pc.y; vrot = 9 - tf * 30;
      ctx.save(); ctx.strokeStyle = "rgba(255,255,255,0.75)"; ctx.lineWidth = 4; ctx.lineCap = "round";
      for (var ln = 0; ln < 4; ln++) { var off = (ln - 1.5) * 26; ctx.beginPath(); ctx.moveTo(pc.x - dxv * 70 - dyv * off, pc.y - dyv * 70 + dxv * off); ctx.lineTo(pc.x - dxv * (170 + ln * 20) - dyv * off, pc.y - dyv * (170 + ln * 20) + dxv * off); ctx.stroke(); }
      ctx.restore();
      crew = [0, 1].map(function (g) { return { x: gEnd[g], y: heapY + 10 + gEndY[g] - Math.abs(Math.sin(u * 16 + g * 1.4)) * 18 }; });
    }
    crew.forEach(function (p, g) { drawDagGuy(p.x, p.y, R * 0.8, g); });
    if (vy0 > -200) islFighterAt(vic, vx0, vy0, vr, vrot);
    if (u < 4.95 && u > 4.4) stars(vx0, vy0);
    if (hands) crew.forEach(function (p, g) { // their gloves under the arms
      var sd = g ? 1 : -1;
      drawGloveAt(vx0 + sd * vr * 0.9, vy0 + vr * 0.1, R * 0.8 * 0.26, { look: islGuyLook(g), color: "#151515", punch: {} }, 0);
      drawGloveAt(vx0 + sd * vr * 0.75, vy0 + vr * 0.45, R * 0.8 * 0.26, { look: islGuyLook(g), color: "#151515", punch: {} }, 0);
    });
    if (back > 0) { // the release rope from his hands to the back of the frame
      ctx.save(); ctx.strokeStyle = "#cbb894"; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(hx + hr * 0.9, hy - hr * 0.1); ctx.quadraticCurveTo((hx + rear) / 2, 1380 + 60 - lean * 40, rear, cy - 8); ctx.stroke(); ctx.restore();
    }
    drawHasbulla(ctx, hx, hy - bob, hr, back > 0 ? lean : -0.4); // (islam-dagestan-art.js)
    var hgx = back > 0 ? hx + hr * 0.9 : rear - 6, hgy = back > 0 ? hy - hr * 0.1 : cy - 6;
    drawGloveAt(hgx, hgy - bob * 0.5, hr * 0.26, { look: ISL_HASBULLA, color: ISL_HASBULLA.skin, punch: {} }, 0); // his hands on the frame, then the rope
    drawGloveAt(hgx - 8, hgy + hr * 0.25 - bob * 0.5, hr * 0.26, { look: ISL_HASBULLA, color: ISL_HASBULLA.skin, punch: {} }, 0);
    ctx.save(); ctx.textAlign = "center"; ctx.font = "800 34px Impact, sans-serif"; ctx.lineWidth = 6; ctx.strokeStyle = "#1f2328"; ctx.globalAlpha = Math.min(1, (u - 4.3) / 0.2);
    var lx = Math.max(95, hx); ctx.strokeText("HASBULLA", lx, hy + hr + 34); ctx.fillStyle = "#ffffff"; ctx.fillText("HASBULLA", lx, hy + hr + 34); ctx.restore();
    ctx.restore(); // shake
    if (u > U_REL) {
      var la = Math.min(1, (u - U_REL) / 0.1), ls = 1 + 0.25 * Math.max(0, 1 - (u - U_REL) / 0.15);
      ctx.save(); ctx.translate(540, 1660); ctx.scale(ls, ls); ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.font = "900 84px Impact, 'Arial Black', sans-serif";
      ctx.globalAlpha = la; ctx.lineWidth = 10; ctx.strokeStyle = "#1f2328"; ctx.strokeText("LAUNCHED!", 0, 0); ctx.fillStyle = "#ff5a3c"; ctx.fillText("LAUNCHED!", 0, 0); ctx.restore();
    }
  }
  // Letterbox bars and a quick fade in / out.
  ctx.fillStyle = "#000"; ctx.fillRect(0, 0, 1080, 120); ctx.fillRect(0, 1800, 1080, 120);
  var fade = u < 0.25 ? 1 - u / 0.25 : u > ISL_TRIP_T - 0.3 ? (u - (ISL_TRIP_T - 0.3)) / 0.3 : 0;
  if (fade > 0) { ctx.fillStyle = "rgba(0,0,0," + fade.toFixed(3) + ")"; ctx.fillRect(0, 0, 1080, 1920); }
  ctx.restore();
}
function islE(u) { u = Math.max(0, Math.min(1, u)); return 1 - (1 - u) * (1 - u); }
function islFighterAt(b, x, y, r, rot, noShadow) {
  if (!b) return;
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot || 0); ctx.translate(-x, -y);
  drawFighterArt(ctx, x, y, r, b.char.look, theme.wall, { layout: "contained", name: b.char.name });
  ctx.restore();
}
function islDustCloud(cx, cy, R, now, vic) {
  var i, puffs = [];
  // Fists, feet and stars flying out.
  for (i = 0; i < 6; i++) {
    var ph = (now * 1.6 + i / 6) % 1, ang = i * 1.9 + Math.floor(now * 1.6 + i / 6) * 2.3, out = Math.sin(Math.PI * ph) * R * 0.8;
    var x = cx + Math.cos(ang) * (R * 0.6 + out), y = cy + Math.sin(ang) * (R * 0.5 + out * 0.8);
    if (i % 3 === 0) drawGloveAt(x, y, 22, { look: islGuyLook(i), color: "#151515", punch: {} }, ang);
    else if (i % 3 === 1) { ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.fillStyle = "#2a2a2a"; ctx.strokeStyle = "#111"; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(0, 0, 30, 15, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); ctx.restore(); }
    else drawStar(x, y, 18, "#ffd23f");
  }
  for (i = 0; i < 12; i++) {
    var a = i / 12 * Math.PI * 2 + now * 2.2, wob = Math.sin(now * 17 + i * 2.3);
    puffs.push({ x: cx + Math.cos(a) * R * (0.62 + 0.08 * wob), y: cy + Math.sin(a) * R * (0.5 + 0.06 * wob), r: R * (0.42 + 0.06 * Math.sin(now * 13 + i)) });
  }
  puffs.push({ x: cx, y: cy, r: R * 0.72 });
  ctx.fillStyle = "#2a2118"; puffs.forEach(function (p) { ctx.beginPath(); ctx.arc(p.x, p.y, p.r + 4, 0, Math.PI * 2); ctx.fill(); });
  ctx.fillStyle = "#efe2c4"; puffs.forEach(function (p) { ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill(); });
  ctx.fillStyle = "#d6c49c"; puffs.forEach(function (p) { ctx.beginPath(); ctx.arc(p.x + p.r * 0.2, p.y + p.r * 0.25, p.r * 0.55, 0, Math.PI * 2); ctx.fill(); });
  ctx.strokeStyle = "rgba(60,45,30,0.55)"; ctx.lineWidth = 4; ctx.lineCap = "round";
  for (i = 0; i < 4; i++) { var sa = now * 9 + i * 1.7; ctx.beginPath(); ctx.arc(cx + Math.cos(sa) * R * 0.25, cy + Math.sin(sa * 1.3) * R * 0.2, R * (0.18 + 0.05 * i), sa, sa + 1.6); ctx.stroke(); }
  // POW / BAM.
  var words = ["POW!", "BAM!", "WHAM!", "OOF!"], wi = Math.floor(now * 3) % 4, wu = (now * 3) % 1;
  ctx.save(); ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.font = "900 " + Math.round(60 + 30 * Math.sin(Math.PI * wu)) + "px Impact, 'Arial Black', sans-serif";
  var wx = cx + (wi % 2 ? 1 : -1) * R * 0.9, wy = cy - R * (0.6 + 0.2 * (wi >> 1));
  ctx.lineWidth = 8; ctx.strokeStyle = "#1f2328"; ctx.strokeText(words[wi], wx, wy); ctx.fillStyle = wi % 2 ? "#ff5a3c" : "#ffd23f"; ctx.fillText(words[wi], wx, wy);
  ctx.restore();
}
