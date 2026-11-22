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
var ISL_TRIP_T = 6.0;      // the cut to Dagestan
var islamTrip = null;      // { ownerId, vicId, u } while the fight holds for it
var ISL_BUBBLES = { brotha: "BROTHAAAA...", dagestan: "2-3 YEARS DAGESTAN AND FORGET", roo: "KANGAROO HAVE GOOD STRIKING...", roo2: "BUT NOBODY CHECK THE GRAPPLING!" };

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
  if (m && m.move === "islam" && m.kind === "cheesecake" && (m.phase === "serve" || m.phase === "toss")) return true;
  return !!(b && b.islamRoo && b.islamRoo.step !== "say");
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
    if (kind === "dagestan") { self.igbb.phase = "call"; floater(self.x, self.y - self.r - 30, "DAGESTAN!", "crit"); }
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
      floater(self.x, self.y - r - 30, "BROTHA!", "crit");
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
      m.phase = "toss"; m.t = 0;
      m.cake = { x: self.x, y: self.y - self.r, sx: self.x + (dx / d) * self.r, sy: self.y - self.r * 0.4, tx: tx, ty: ty, z: 0, bites: 0, landed: false };
      playWhoosh();
    }
    return true;
  }
  var ck = m.cake;
  if (m.phase === "toss") {
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
    m.chomp -= dt;
    var eatT = sean ? c.seanEat : c.eat;
    if (m.chomp <= 0) {
      m.chomp = eatT / c.bites;
      ck.bites = Math.min(c.bites, ck.bites + 1);
      floater(ck.x, ck.y - 40, ck.bites % 2 ? "CHOMP!" : "NOM NOM", "note");
      playDcChomp();
      for (var i = 0; i < 6 && !reduceMotion; i++) {
        var a = Math.random() * Math.PI * 2, s = 40 + Math.random() * 120;
        particles.push({ x: ck.x, y: ck.y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 40, life: 0.4, max: 0.4, size: 2 + Math.random() * 3, color: i % 3 ? "#f3ead2" : (i % 2 ? "#c9893f" : "#d4202c") });
      }
    }
    if (sean) {
      if (m.t >= eatT) { // wolfed down: straight onto a sugar high
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
var islamCakeLeft = null; // what's left of the cake, lying on the mat after the suplex (fades)

// ---------------------------------------------------------------- 2-3 years Dagestan

function islDagestan(self, other, m, dt) {
  var c = self.char.special.dagestan;
  if (m.phase === "call") {
    if (m.t >= c.call) {
      // The van comes from the side farther from them, along their line.
      var fromLeft = other.x > W / 2;
      islHold(other);
      floater(other.x, other.y - other.r - 30, "!?", "note");
      m.van = { x: fromLeft ? -260 : W + 260, y: other.y + other.r * 0.4, dir: fromLeft ? 1 : -1, door: 0, guys: 0 };
      m.phase = "van"; m.t = 0;
      playVanScreech();
    }
    return true;
  }
  var v = m.van;
  if (m.phase === "van") {
    v.x += v.dir * c.vanSpeed * dt;
    var front = v.x + v.dir * 150;
    if ((v.dir > 0 && front >= other.x - other.r * 0.5) || (v.dir < 0 && front <= other.x + other.r * 0.5)) {
      var dealt = hurt(other, c.vanDamage, "igbb", self.id);
      floater(other.x, other.y - other.r - 40, "VAN HIT!", "crit");
      other.flash = 0.16;
      if (!reduceMotion) { shake = Math.max(shake, 18); hitStop = Math.max(hitStop, 0.08); }
      playSlam(); crowdReact(1);
      other.x = Math.max(other.r, Math.min(W - other.r, other.x + v.dir * 40));
      checkEnd();
      if (!other.alive) { endIslamSpecial(self, other); return false; }
      m.phase = "brake"; m.t = 0;
      m.stars = true;
    }
    return true;
  }
  if (m.phase === "brake") { // skids to a stop past them
    v.x += v.dir * c.vanSpeed * Math.max(0, 1 - m.t / 0.35) * dt;
    if (m.t >= 0.4) { m.phase = "grab"; m.t = 0; }
    return true;
  }
  if (m.phase === "grab") { // door slides open, two guys hop out and bundle them in
    v.door = Math.min(1, m.t / 0.3);
    var doorX = v.x - v.dir * 10, doorY = v.y - 10;
    if (m.t >= 0.6 && !m.carry) { m.carry = { x0: other.x, y0: other.y }; floater(other.x, other.y - other.r - 30, "KIDNAPPED!", "crit"); }
    if (m.carry) {
      var u = Math.min(1, (m.t - 0.6) / 0.6);
      other.x = m.carry.x0 + (doorX - m.carry.x0) * u; other.y = m.carry.y0 + (doorY - m.carry.y0) * u;
      if (u >= 1) { m.inVan = true; m.phase = "drive"; m.t = 0; playVanScreech(); }
    }
    return true;
  }
  if (m.phase === "drive") {
    v.door = Math.max(0, 1 - m.t / 0.25);
    v.x += v.dir * c.vanSpeed * Math.min(1, m.t / 0.4) * dt;
    if (m.t >= 1.0) {
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
    if (!islamTrip.boom && m.t >= 1.9) { islamTrip.boom = true; playSlam(); }
    if (!islamTrip.fling && m.t >= 5.0) { islamTrip.fling = true; playWhoosh(); }
    if (m.t >= ISL_TRIP_T) { islamTrip = null; m.phase = "fall"; m.t = 0; }
    return true;
  }
  if (m.phase === "fall") { // dropping back in from the sky
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
  if (isl.islamRoo) return true;
  if (m.phase !== "chase" || roo.mode !== "stand" || !isl.alive || isl.igbb || isl.grappled || isl.grapple || isl.dazed || subLocked(isl) || over) return false;
  clearActions(isl);
  isl.vx = 0; isl.vy = 0;
  var sr = isl.islamRoo = { step: "say", t: 0, all: 0 };
  floater(isl.x, isl.y - isl.r - 30, "NOT TODAY!", "crit");
  isl.islamQuietT = 4.8; // the clip's length: no special talks over it
  islamVoice("islamKangaroo", function () { return isl.islamRoo === sr && sr.all < 0.6; }); // Joe's clip (islam-voice.js)
  crowdReact(0.8);
  return true;
}
// From updateIslamMoves (islam-axe.js), on Islam: true while he's lifting,
// shaking and throwing it.
function islamRooHeld(isl, dt) {
  var s = isl.islamRoo;
  if (!s) return false;
  s.t += dt; s.all = (s.all || 0) + dt;
  isl.vx = 0; isl.vy = 0;
  var volk = balls[1 - isl.id], m = volk && volk.igbb, roo = vkRoo;
  if (!roo || over || !isl.alive) { isl.islamRoo = null; return false; }
  if (s.step !== "throw" && !(m && m.move === "kangaroo")) { isl.islamRoo = null; return false; }
  var r = isl.r, cfg = isl.char.islam.roo;
  roo.mode = "stand"; roo.t = 0.01;
  if (s.step === "say") { // walks up under it, talking
    var tx = roo.x, ty = Math.min(H - r, roo.y + r * 0.2), dx = tx - isl.x, dy = ty - isl.y, d = Math.sqrt(dx * dx + dy * dy) || 1;
    if (d > 3) { var st = Math.min(d, 300 * dt); isl.x += dx / d * st; isl.y += dy / d * st; }
    if (s.t >= cfg.say && d < 8) { s.step = "lift"; s.t = 0; s.rx = roo.x; s.ry = roo.y; playWhoosh(); }
    return true;
  }
  if (s.step === "lift") {
    var u = Math.min(1, s.t / 0.5), e = u * u * (3 - 2 * u);
    roo.x = s.rx + (isl.x - s.rx) * e; roo.y = s.ry + (isl.y - r * 0.2 - s.ry) * e; roo.z = r * 1.9 * e;
    if (u >= 1) { s.step = "shake"; s.t = 0; floater(isl.x, isl.y - r - 30, "LIFTED!", "crit"); crowdReact(1); }
    return true;
  }
  if (s.step === "shake") {
    roo.x = isl.x + Math.sin(s.t * 38) * r * 0.28; roo.y = isl.y - r * 0.2; roo.z = r * 1.9 + Math.abs(Math.sin(s.t * 19)) * r * 0.3;
    roo.tilt = Math.sin(s.t * 26) * 0.5;
    if (Math.floor(s.t / 0.5) !== Math.floor((s.t - dt) / 0.5)) { floater(roo.x, roo.y - roo.z - 150, "SHAKE!", "note"); if (!reduceMotion) shake = Math.max(shake, 6); playRooBoing(0.8); }
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
      s.step = "throw"; s.t = 0; s.vx = -side * 1100; s.vz = 700; s.spin = -side * 9;
    }
    return true;
  }
  // Thrown out over the cage, end over end.
  roo.x += s.vx * dt; roo.z += s.vz * dt; s.vz -= 600 * dt; roo.tilt += s.spin * dt;
  if (s.t >= 1.3 || roo.x < -400 || roo.x > W + 400) {
    vkRoo = null; isl.islamRoo = null;
    floater(W / 2, H * 0.2, "OUT OF THE ARENA!", "crit");
    crowdReact(1);
    return false;
  }
  return true;
}

// ---------------------------------------------------------------- sounds

function playVanScreech() { playWhoosh(); } // (placeholder: no van sound yet)

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
  balls.forEach(function (b) {
    var m = b.igbb, o = balls[1 - b.id], r = b.r;
    if (b.islamRoo) drawIslamRoo(b, b.islamRoo, now);
    if (!m || m.move !== "islam" || !b.alive) return;
    if (m.kind === "brotha") {
      if (m.phase === "moan") {
        var n = Math.min(8, 2 + Math.floor(m.t * 5));
        islBubble(b, "BROTHA" + new Array(n).join("A") + "...", Math.min(1, m.t / 0.15), true, now);
      }
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
        if (m.t > 0.1) islBubble(b, "CALIFORNIA CHEESECAKE!", 1, false, now);
      } else if (m.phase === "toss") {
        var sd = o.x >= b.x ? 1 : -1;
        drawGloveAt(b.x + sd * r * 1.0, b.y - r * 0.5, r * 0.22, b.char);
        drawGloveAt(b.x - sd * r * 0.55, b.y - r * 0.05, r * 0.22, b.char);
      }
      if ((m.phase === "chase" || m.phase === "eat") && o.alive) drawHearts(o, now);
    }
    if (m.kind === "dagestan") {
      if (m.phase === "call") islBubble(b, ISL_BUBBLES.dagestan, Math.min(1, m.t / 0.15), false, now);
      if (m.van) drawDagestanVan(b, o, m, now);
      if (m.phase === "fall") {
        var u = Math.min(1, m.t / b.char.special.dagestan.fall), top = o.y - H * 0.7, y = top + (o.y - top) * u * u;
        ctx.fillStyle = "rgba(0,0,0," + (0.08 + 0.2 * u).toFixed(3) + ")";
        ctx.beginPath(); ctx.ellipse(o.x, o.y + o.r * 0.8, o.r * (0.4 + 0.6 * u), o.r * (0.12 + 0.18 * u), 0, 0, Math.PI * 2); ctx.fill();
        ctx.save(); ctx.translate(o.x, y); ctx.rotate(u * 9); ctx.translate(-o.x, -y);
        drawFighterArt(ctx, o.x, y, o.r, o.char.look, theme.wall, { layout: "contained", name: o.char.name });
        ctx.restore();
      }
    }
  });
}

// A comic speech bubble over his head (there's no clip of these lines yet).
function islBubble(b, text, pop, wavy, now) {
  var r = b.r, fs = Math.round(r * 0.36);
  ctx.save();
  ctx.font = "900 " + fs + "px Impact, 'Arial Black', sans-serif";
  var words = text.split(" "), lines = [], cur = "";
  words.forEach(function (w) { var t = cur ? cur + " " + w : w; if (ctx.measureText(t).width > r * 3.4 && cur) { lines.push(cur); cur = w; } else cur = t; });
  lines.push(cur);
  var tw = 0; lines.forEach(function (l) { tw = Math.max(tw, ctx.measureText(l).width); });
  var bw = tw + fs * 1.2, bh = lines.length * fs * 1.15 + fs * 0.7;
  var x = Math.max(bw / 2 + 4, Math.min(W - bw / 2 - 4, b.x)), y = Math.max(bh / 2 + 4, b.y - r - bh / 2 - 26);
  ctx.translate(x, y); ctx.scale(pop, pop);
  ctx.fillStyle = "#ffffff"; ctx.strokeStyle = "#1f2328"; ctx.lineWidth = 3.5; ctx.lineJoin = "round";
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(-bw / 2, -bh / 2, bw, bh, fs * 0.6); else ctx.rect(-bw / 2, -bh / 2, bw, bh);
  ctx.fill(); ctx.stroke();
  var tx = b.x - x;
  ctx.beginPath(); ctx.moveTo(tx - 10, bh / 2 - 2); ctx.lineTo(tx, bh / 2 + 20); ctx.lineTo(tx + 10, bh / 2 - 2); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(tx - 10, bh / 2); ctx.lineTo(tx, bh / 2 + 20); ctx.lineTo(tx + 10, bh / 2); ctx.stroke();
  ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillStyle = "#1f2328";
  lines.forEach(function (l, li) {
    var ly = (li - (lines.length - 1) / 2) * fs * 1.15;
    if (!wavy) { ctx.fillText(l, 0, ly); return; }
    var w0 = ctx.measureText(l).width, xx = -w0 / 2;
    for (var i = 0; i < l.length; i++) { var cw = ctx.measureText(l[i]).width; ctx.fillText(l[i], xx + cw / 2, ly + Math.sin(now * 9 + i * 0.7) * fs * 0.12); xx += cw; }
  });
  ctx.restore();
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
function drawVan(x, y, face, door, s) {
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

function drawDagestanVan(b, o, m, now) {
  var v = m.van, r = b.r;
  if (m.phase === "away" || m.phase === "fall") return;
  drawVan(v.x, v.y, v.dir, v.door, Math.max(0.8, r / 70));
  // The two guys.
  if (m.phase === "grab") {
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
  var rooLine = (s.all || 0) < 2.05 ? ISL_BUBBLES.roo : ISL_BUBBLES.roo2; // in time with Joe's clip
  if (s.step === "say") { islBubble(b, rooLine, Math.min(1, s.t / 0.15), false, now); return; }
  if (s.step === "throw" || !vkRoo) return;
  var r = b.r, top = vkRoo.y - vkRoo.z;
  [-1, 1].forEach(function (sd) {
    var sh = { x: b.x + sd * r * 0.66, y: b.y - r * 0.3 }, hand = { x: vkRoo.x + sd * r * 0.4, y: top - r * 0.1 };
    drawBentArm(b, sh, hand, sd);
    drawGloveAt(hand.x, hand.y, r * 0.22, b.char);
  });
  if ((s.all || 0) < 4.7) islBubble(b, rooLine, 1, false, now);
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
  ctx.fillStyle = "#6b4a2a"; ctx.fillRect(150, 980, 14, 160);
  ctx.fillStyle = "#8a6238"; ctx.strokeStyle = "#1f2328"; ctx.lineWidth = 4;
  ctx.fillRect(70, 960, 200, 70); ctx.strokeRect(70, 960, 200, 70);
  ctx.fillStyle = "#f4ead2"; ctx.font = "800 30px Impact, sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("DAGESTAN", 170, 996);
  var R = 78; // fighters at cutscene size
  // The van pulls up, throws them out, and drives off.
  var vx = u < 1.3 ? -260 + 560 * islE(u / 1.3) : u < 2.0 ? 300 : 300 + (u - 2.0) * 900;
  var door = u < 1.3 ? 0 : u < 1.5 ? (u - 1.3) / 0.2 : u < 1.9 ? 1 : Math.max(0, 1 - (u - 1.9) / 0.15);
  if (u < 3.4) drawVan(vx, 1240, 1, door, 1.5);
  var vicX = 640, vicY = 1220;
  if (u >= 1.45 && u < 1.9) { // flung out of the door
    var fu = (u - 1.45) / 0.45;
    var fx = 300 + (vicX - 300) * fu, fy = 1150 + (vicY - 1150) * fu - Math.sin(Math.PI * fu) * 160;
    islFighterAt(vic, fx, fy, R, fu * 8);
  }
  // The dust cloud beating.
  if (u >= 1.9 && u < 4.1) {
    for (var g = 0; g < 3; g++) { // Dagestani fighters piling in
      var ju = Math.min(1, (u - 1.9) / 0.35), sx = [140, 940, 540][g], sy = [1500, 1500, 1640][g];
      if (ju < 1) drawDagGuy(sx + (vicX - sx) * ju, sy + (vicY - sy) * ju - Math.sin(Math.PI * ju) * 120, R * 0.85, g);
    }
    if (u > 2.1) islDustCloud(vicX, vicY, 230, now, vic);
  }
  if (u >= 4.1) {
    // Cloud gone: they're in the catapult's bucket, Hasbulla on the lever.
    var cx = 640, cy = 1380, swing = u < 4.9 ? 0 : Math.min(1, (u - 4.9) / 0.22);
    var arm = -0.45 - swing * 1.65; // rests up to the right, swings up and over into the crossbar
    var sp = drawIslCatapult(ctx, cx, cy, arm, now, 1.3); // Joe's catapult (islam-dagestan-art.js)
    var bucket = { x: sp.x, y: sp.y - 26 };
    if (u < 4.95) islFighterAt(vic, bucket.x, bucket.y, R * 0.8, 0, true);
    else { var lu = (u - 4.95) / 1.0; islFighterAt(vic, bucket.x - lu * 420, bucket.y - lu * 1900, R * 0.8 * (1 - lu * 0.4), -lu * 14); }
    // Hasbulla, small, heaving on the release rope.
    var hx = 290, hy = 1480, hr = R * 0.85, lean = u < 4.75 ? 0 : Math.min(1, (u - 4.75) / 0.15);
    ctx.save(); ctx.strokeStyle = "#cbb894"; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(hx + hr * 0.9 - lean * 8, hy - hr * 0.1); ctx.quadraticCurveTo((hx + cx - 220) / 2, cy + 50 - lean * 30, cx - 220, cy - 8); ctx.stroke(); ctx.restore();
    drawHasbulla(ctx, hx - lean * 10, hy, hr, lean); // (islam-dagestan-art.js)
    drawGloveAt(hx + hr * 0.9 - lean * 8, hy - hr * 0.1, hr * 0.26, { look: ISL_HASBULLA, color: ISL_HASBULLA.skin, punch: {} }, 0); // his hand on the rope
    ctx.save(); ctx.textAlign = "center"; ctx.font = "800 34px Impact, sans-serif"; ctx.lineWidth = 6; ctx.strokeStyle = "#1f2328"; ctx.strokeText("HASBULLA", hx, hy + hr + 34); ctx.fillStyle = "#ffffff"; ctx.fillText("HASBULLA", hx, hy + hr + 34); ctx.restore();
    if (u > 4.9) {
      ctx.save(); ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.font = "900 96px Impact, 'Arial Black', sans-serif";
      ctx.globalAlpha = Math.min(1, (u - 4.9) / 0.15); ctx.lineWidth = 10; ctx.strokeStyle = "#1f2328"; ctx.strokeText("LAUNCHED!", 540, 700); ctx.fillStyle = "#ff5a3c"; ctx.fillText("LAUNCHED!", 540, 700); ctx.restore();
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
