// BJJ submissions. For now: the guillotine off a shot.
//
// When a Grappler shoots for a grab on a fighter with the guillotine, there's
// a chance (`chance`%) the defender snaps on a guillotine instead: it wraps
// an arm around the shooter's head and the two lock up. A tug-of-war bar
// shows the choke sinking in against the escape. If the choke wins, the
// shooter taps (three pats) and loses the fight on the spot: a win by
// submission. If it doesn't finish, `outcomes` (relative odds) picks what
// happens: they scramble apart on an angle (escape), the shooter pops its
// head out and finishes the shot with ground and pound worth the shot's own
// damage (gnp), the defender sinks it back in for another go (resink), or
// the shooter, still caught in the hold, picks the defender up and slams it
// for `slamDamage` (slam).
//
// The odds of the tap: `tapBase`% at full health, plus up to `tapLowHp`% more
// the more damage the shooter has taken, so subs land late in fights the way
// they do in real MMA. After a failed attempt the defender can't throw
// another one for `cooldown` seconds.
"use strict";

var GUILLO_MIN_TIME = 2.6;   // the struggle lasts this long...
var GUILLO_MAX_EXTRA = 1.2;  // ...plus up to this much more
var GUILLO_TAP_TIME = 0.75;  // three pats, then the fight's called
var GUILLO_ESCAPE_SPEED = 360;
var GUILLO_GAP = 0.66;        // how close the pair is held (1 = just touching): the shooter's head is driven in under the defender

// Locked up in a submission (either applying it or caught in it), or down
// on its back in guard.
function subLocked(b) {
  return !!(b.guillo || b.choked || b.guard);
}

function canGuillotine(def) {
  if (!def.char.hasGuillotine || !def.alive || def.guilloCd > 0) return false;
  return !(def.koOut || def.shocked || def.shelled || def.igbb || def.koRush || def.koDuel ||
    def.slam || def.combo || def.taunt || def.flow || def.grapple || subLocked(def));
}

// Called from attemptGrab: true if the shot got caught in a guillotine.
function tryGuillotine(attacker, target) {
  if (!canGuillotine(target) || Math.random() >= target.char.guillotine.chance / 100) return false;
  beginGuillotine(target, attacker);
  return true;
}

function beginGuillotine(def, atk) {
  var gu = def.char.guillotine;
  var hurtFrac = 1 - Math.max(0, Math.min(1, atk.hp / MAX_HP));
  var tapChance = Math.min(95, gu.tapBase + gu.tapLowHp * hurtFrac);
  // The pair always locks up side by side (the shooter bent over sideways,
  // the way it looks from cageside), on whichever side it shot in from,
  // unless there's no room for it there before the wall.
  var side = atk.x >= def.x ? 1 : -1;
  var reach = (def.r + atk.r) * GUILLO_GAP + atk.r;
  if (def.x + side * reach > W || def.x + side * reach < 0) side = -side;
  def.guillo = {
    atkId: atk.id, t: 0, dur: GUILLO_MIN_TIME + Math.random() * GUILLO_MAX_EXTRA,
    taps: Math.random() < tapChance / 100, tapChance: tapChance, bar: 0, phase: "squeeze", tapT: 0,
    nx: side, ny: 0, wob: Math.random() * 10
  };
  atk.choked = true;
  atk.grappleCd = atk.char.grapple ? atk.char.grapple.cooldown : 0;
  [atk, def].forEach(function (b) {
    b.vx = 0; b.vy = 0;
    b.punch = null; b.kick = null; b.throwAnim = null; b.swing = null; b.checkAnim = null;
  });
  floater(def.x, Math.min(atk.y, def.y) - def.r - 30, "GUILLOTINE", "crit");
  playPunch(20);
  if (!reduceMotion) shake = Math.max(shake, 8);
}

// Runs on the fighter applying the choke each frame; the one caught in it is
// held still.
function updateGuillotine(self, dt) {
  var g = self.guillo, atk = balls[g.atkId];
  if (!self.alive || !atk.alive) { endGuillotine(self); return; }
  g.t += dt;
  self.vx = 0; self.vy = 0; atk.vx = 0; atk.vy = 0;

  if (g.phase === "squeeze" || g.phase === "tap") {
    // The shooter's head stays tucked under the defender's arm, and both
    // shudder a little as they fight over it.
    var jit = reduceMotion || g.phase !== "squeeze" ? 0 : 1.6;
    var gap = (self.r + atk.r) * GUILLO_GAP;
    atk.x = self.x + g.nx * gap + (Math.random() - 0.5) * jit;
    atk.y = self.y + (Math.random() - 0.5) * jit;
  }

  if (g.phase === "squeeze") {
    // The bar swings back and forth, then commits to how it ends: +1 is the
    // choke sunk in, -1 is the escape.
    var p = Math.min(1, g.t / g.dur), sgn = g.taps ? 1 : -1;
    var drift = sgn * Math.pow(p, 2.2);
    var swing = Math.sin(g.t * 4.7 + g.wob) * Math.sin(g.t * 1.9 + g.wob * 0.5) * 0.55 * (1 - p);
    g.bar = Math.max(-1, Math.min(1, drift + swing));
    if (p < 1) return;
    g.bar = sgn;
    if (g.taps) {
      g.phase = "tap";
      floater(atk.x, Math.min(atk.y, self.y) - atk.r - 30, "TAP", "crit");
      playPunch(10);
    } else {
      guilloNotFinished(self, atk, g);
    }
    return;
  }
  if (g.phase === "tap") {
    // Three pats on the defender, then the fight is over.
    g.tapT += dt;
    if (g.tapT >= GUILLO_TAP_TIME) {
      endGuillotine(self);
      submit(atk);
    }
    return;
  }
  if (g.phase === "drive" || g.phase === "mount" || g.phase === "pound") { updateGuilloGnp(self, atk, g, dt); return; }
  if (g.phase === "lift") updateGuilloSlam(self, atk, g, dt);
}

// The choke didn't finish. What happens next is rolled from `outcomes`:
// they scramble apart (escape), the shooter drives through and finishes its
// shot with ground and pound (gnp), the defender sinks it back in for
// another go (resink), or the shooter picks the defender up, hold and all,
// and slams it (slam).
function guilloNotFinished(self, atk, g) {
  var oc = self.char.guillotine.outcomes, roll = Math.random() * (oc.escape + oc.gnp + oc.resink + oc.slam);
  var cx = (self.x + atk.x) / 2, cy = Math.min(atk.y, self.y) - atk.r - 30;
  if ((roll -= oc.escape) < 0) {
    floater(cx, cy, "ESCAPE", "note");
    releaseGuillotine(self, atk, g);
    // They pop apart on an angle, spinning off each other.
    var a = (Math.random() < 0.5 ? -1 : 1) * (0.6 + Math.random() * 0.35);
    var ex = Math.cos(a) * g.nx, ey = Math.sin(a);
    atk.vx = ex * GUILLO_ESCAPE_SPEED; atk.vy = ey * GUILLO_ESCAPE_SPEED;
    self.vx = -ex * GUILLO_ESCAPE_SPEED; self.vy = -ey * GUILLO_ESCAPE_SPEED;
  } else if ((roll -= oc.gnp) < 0) {
    floater(cx, cy, "HEAD'S OUT", "note");
    beginGuilloGnp(self, atk, g);
  } else if ((roll -= oc.resink) < 0) {
    floater(cx, cy, "RE-SINK", "crit");
    g.phase = "squeeze"; g.t = 0; g.bar = 0; g.wob = Math.random() * 10;
    g.dur = GUILLO_MIN_TIME + Math.random() * GUILLO_MAX_EXTRA;
    g.taps = Math.random() < g.tapChance / 100;
    atk.flash = 0.16;
    if (!reduceMotion) shake = Math.max(shake, 8);
    playPunch(20);
  } else {
    floater(cx, cy, "GUILLOTINE SLAM", "crit");
    g.phase = "lift"; g.t = 0; g.sx = atk.x; g.sy = atk.y;
    playWhoosh();
  }
}

// Lets go: the fight carries on, and the defender can't go for another
// guillotine for a while.
function releaseGuillotine(self, atk, g) {
  self.guilloCd = self.char.guillotine.cooldown;
  atk.grappleCd = atk.char.grapple ? atk.char.grapple.cooldown : 0;
  endGuillotine(self);
}

// ---------------------------------------------------------------
// The shooter pulls its head out and finishes the shot: drives the defender
// down to the floor, climbs on top and hammers it with ground and pound
// worth what the shot itself would have done.
// ---------------------------------------------------------------
var GNP_DRIVE_TIME = 0.4, GNP_MOUNT_TIME = 0.25, GNP_PUNCHES = 4;

function beginGuilloGnp(self, atk, g) {
  var total = atk.char.grapple ? atk.char.grapple.damage : 50;
  // Splits the shot's damage over the punches in whole numbers.
  g.hits = [];
  for (var i = 0; i < GNP_PUNCHES; i++) {
    g.hits.push(Math.round(total * (i + 1) / GNP_PUNCHES) - Math.round(total * i / GNP_PUNCHES));
  }
  g.phase = "drive"; g.t = 0;
  g.sx = self.x; g.sy = self.y;
  g.ex = Math.max(self.r + 40, Math.min(W - self.r - 40, self.x)); g.ey = H - self.r - 2;
  g.ax = atk.x; g.ay = atk.y;
  playWhoosh();
}

function updateGuilloGnp(self, atk, g, dt) {
  var k;
  if (g.phase === "drive") {
    // Runs them down into the floor, the shooter's shoulder in their gut.
    k = Math.min(1, g.t / GNP_DRIVE_TIME); k = k * k;
    self.x = g.sx + (g.ex - g.sx) * k; self.y = g.sy + (g.ey - g.sy) * k;
    var gap = (self.r + atk.r) * 0.8;
    atk.x = self.x + g.nx * gap * (1 - k * 0.3); atk.y = self.y - gap * 0.6 * k;
    if (k < 1) return;
    guilloImpact(atk, self, 0, false);
    floater(self.x, self.y - self.r - 30, "TAKEDOWN", "note");
    g.phase = "mount"; g.t = 0; g.mx = atk.x; g.my = atk.y;
    return;
  }
  // On top of them from the side nearer the middle, like Father's Plan.
  if (!g.dir) g.dir = self.x > W / 2 ? -1 : 1;
  var tx = self.x + g.dir * (self.r + atk.r) * 0.62, ty = self.y - (self.r + atk.r) * 0.62;
  if (g.phase === "mount") {
    k = Math.min(1, g.t / GNP_MOUNT_TIME);
    atk.x = g.mx + (tx - g.mx) * k; atk.y = g.my + (ty - g.my) * k;
    if (k >= 1) { g.phase = "pound"; g.t = 0; g.thrown = 0; }
    return;
  }
  var gp = g.gp, lean = 0;
  if (gp) {
    gp.t += dt;
    if (gp.t < gp.wind) lean = -6 * (gp.t / gp.wind);
    else if (gp.t < gp.wind + FP_STRIKE) lean = 12;
    else lean = 12 * Math.max(0, 1 - (gp.t - gp.wind - FP_STRIKE) / FP_RECOIL);
    if (!gp.hit && gp.t >= gp.wind + FP_STRIKE) { gp.hit = true; landGnpPunch(atk, self, gp); }
    if (gp.t >= gp.wind + FP_STRIKE + FP_RECOIL) g.gp = null;
  }
  atk.x = tx + Math.sin(g.t * 31) * 1.5; atk.y = ty + lean;
  if (!self.alive) { endGuillotine(self); checkEnd(); return; }
  if (!g.gp && g.thrown < g.hits.length) {
    var last = g.thrown === g.hits.length - 1;
    g.gp = { t: 0, wind: last ? FP_WIND_LAST * 0.8 : FP_WIND, hit: false, last: last, side: g.thrown % 2 ? -1 : 1, dmg: g.hits[g.thrown] };
    g.thrown++;
    playWhoosh();
  }
  if (g.thrown >= g.hits.length && !g.gp) {
    // Done: lets them up and gets back to its feet.
    releaseGuillotine(self, atk, g);
    self.vx = 0; self.vy = -SPEED * 0.6;
    atk.vx = g.dir * SPEED * 0.6; atk.vy = -SPEED * 0.3;
  }
}

function landGnpPunch(top, under, gp) {
  var big = gp.last;
  var dealt = hurt(under, gp.dmg, "finisher", top.id);
  if (dealt > 0) playPunch(dealt * (big ? 4 : 3));
  var cx = under.x, cy = under.y - under.r * 0.45;
  under.squash = { t: big ? 0.28 : 0.18, max: big ? 0.28 : 0.18, nx: 0, ny: -1 };
  impacts.push({ x: cx, y: cy, nx: 0, ny: -1, life: big ? 0.55 : 0.4, max: big ? 0.55 : 0.4, color: theme.hit });
  igbbSparks(cx, cy, 0, -1, top.char.color, big ? 26 : 16, big ? 560 : 420);
  if (!reduceMotion) shake = Math.max(shake, big ? 26 : 16);
  hitStop = Math.max(hitStop, big ? 0.18 : 0.08);
  checkEnd();
}

// ---------------------------------------------------------------
// Guillotine slam: still caught in the hold, the shooter stands up with the
// defender hanging off its neck, carries it up and over the top, and slams
// it down on the other side.
// ---------------------------------------------------------------
var GSLAM_LIFT_TIME = 0.6;

function updateGuilloSlam(self, atk, g, dt) {
  var k = Math.min(1, g.t / GSLAM_LIFT_TIME);
  g.e = k < 0.6 ? k / 0.6 * 0.5 : 0.5 + Math.pow((k - 0.6) / 0.4, 2) * 0.5; // slow lift, fast drop
  // The defender goes up and over in an arc from its side of the shooter to
  // the other.
  // Held in tight by the neck so the arm never stretches.
  var ang = Math.PI * g.e, reach = (self.r + atk.r) * 0.7;
  var ex = atk.x + g.nx * reach;
  var ey = Math.min(H - self.r - 2, atk.y + self.r * 0.3);
  var midX = atk.x - g.nx * Math.cos(ang) * reach, midY = atk.y - Math.sin(ang) * reach;
  self.x = midX; self.y = Math.min(midY, ey);
  if (k < 1) return;
  self.x = ex; self.y = ey;
  // Big slam: a heavy impact that breaks the hold.
  guilloImpact(atk, self, self.char.guillotine.slamDamage, true);
  releaseGuillotine(self, atk, g);
  checkEnd();
  if (self.alive) { self.vx = g.nx * 200; self.vy = 120; atk.vx = -g.nx * 260; atk.vy = -80; }
}

// Driven into the floor: flattened, a shockwave, sparks, a freeze-frame.
function guilloImpact(by, b, dmg, big) {
  var cx = b.x, cy = b.y + b.r;
  b.squash = { t: big ? 0.3 : 0.18, max: big ? 0.3 : 0.18, nx: 0, ny: -1 };
  b.flash = 0.16;
  impacts.push({ x: cx, y: cy, nx: 0, ny: -1, life: 0.5, max: 0.5, color: by.char.color });
  impacts.push({ x: cx, y: cy, nx: 0, ny: -1, life: big ? 0.8 : 0.55, max: big ? 0.8 : 0.55, color: theme.hit });
  igbbSparks(cx, cy, 0, -1, by.char.color, big ? 30 : 14, big ? 620 : 420);
  if (!reduceMotion) shake = Math.max(shake, big ? 34 : 18);
  hitStop = Math.max(hitStop, big ? 0.24 : 0.08);
  playSlam(); playPunch(big ? 50 : 30);
  if (dmg > 0) hurt(b, dmg, "finisher", by.id);
}

function endGuillotine(self) {
  var g = self.guillo;
  if (!g) return;
  balls[g.atkId].choked = false;
  self.guillo = null;
}

// Loses by submission: no damage number, just out.
function submit(b) {
  b.hp = 0; b.shown = 0; b.alive = false;
  burst(b);
  document.getElementById("hud" + b.id).classList.add("dead");
  winBy = "submission";
  checkEnd();
}

// How hard the choke is sunk in right now (0 to 1).
function guilloSqueeze(g) {
  if (g.phase === "tap" || g.phase === "lift") return 1;
  return g.phase === "squeeze" ? Math.max(0, g.bar) : 0;
}

// Still in the hold (as opposed to the ground and pound after it).
function guilloHolding(g) {
  return g.phase === "squeeze" || g.phase === "tap" || g.phase === "lift";
}

// Which of the pair is drawn underneath: the shooter while its head is
// buried in the hold, the defender once it's been taken down.
function guilloUnder(b) {
  var def = b.guillo ? b : (b.choked ? balls[1 - b.id] : null);
  if (!def || !def.guillo) return false;
  var holding = guilloHolding(def.guillo);
  return b === def ? !holding : holding;
}

// Poses both fighters while they're locked in a guillotine: the shooter is
// bent over sideways, head first into the defender's side (its head, the top
// third of the ball, turned to face the defender), and the defender leans
// back as it pulls the choke up. Called by the fighter drawing with the
// canvas already set up for that fighter.
function applyGuilloPose(b) {
  var g = b.guillo, def = b;
  if (!g) {
    if (!b.choked) return;
    def = balls[1 - b.id];
    g = def.guillo;
    if (!g) return;
  }
  if (g.phase === "mount" || g.phase === "pound") return; // back upright on top
  var angle = b === def ? guilloDefAngle(g) : guilloShooterAngle(g);
  ctx.translate(b.x, b.y);
  ctx.rotate(angle);
  ctx.translate(-b.x, -b.y);
}

// The defender leans back away from the shooter, pulling up on the choke,
// and a little further as it sinks in.
function guilloDefLean(g) {
  return -g.nx * (0.35 + 0.15 * guilloSqueeze(g));
}

// How far each of the pair is turned. g.nx is +1 when the shooter is on the
// defender's right, -1 on its left. The shooter is bent over sideways, head
// first; on a guillotine slam it straightens up as it lifts, and the
// defender flips over the top.
function guilloShooterAngle(g) {
  var e = g.phase === "lift" ? (g.e || 0) : 0;
  return -g.nx * Math.PI / 2 * (1 - e);
}
function guilloDefAngle(g) {
  var e = g.phase === "lift" ? (g.e || 0) : 0;
  return guilloDefLean(g) + g.nx * Math.PI * e;
}

// An arm: a dark outline with the skin colour inside it.
function strokeLimb(width, color, path) {
  ctx.lineCap = "round"; ctx.lineJoin = "round";
  [[theme.wall, width + 6], [color, width]].forEach(function (pass) {
    ctx.strokeStyle = pass[0]; ctx.lineWidth = pass[1];
    ctx.beginPath(); path(); ctx.stroke();
  });
}

function drawGloveAt(x, y, r, ch) {
  ctx.fillStyle = gloveColor(ch); ctx.strokeStyle = theme.wall; ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
}

function drawGuillotines() {
  balls.forEach(function (self) {
    var g = self.guillo;
    if (!g) return;
    var atk = balls[g.atkId];
    if (g.gp) { drawFpPound(atk, g.gp); return; }
    if (!guilloHolding(g)) return;
    var squeeze = guilloSqueeze(g);
    var s = g.nx, r = self.r, ar = atk.r;
    // Points on the defender turn with its lean.
    var la = guilloDefAngle(g), lc = Math.cos(la), ls = Math.sin(la);
    // The shooter's head direction (h) and across its neck (q, toward the
    // side the defender's arm comes over), turning with the shooter.
    var ka = guilloShooterAngle(g);
    var hx = Math.sin(ka), hy = -Math.cos(ka), qx = Math.cos(ka) * s, qy = Math.sin(ka) * s;
    function onAtk(alongHead, acrossNeck) { return { x: atk.x + hx * alongHead + qx * acrossNeck, y: atk.y + hy * alongHead + qy * acrossNeck }; }
    function onDef(ox, oy) { return { x: self.x + ox * lc - oy * ls, y: self.y + ox * ls + oy * lc }; }
    ctx.save();

    // The shooter's head is buried under the defender; what still shows of
    // it, up to the neck, goes red as the choke sinks in.
    if (squeeze > 0) {
      ctx.save();
      ctx.beginPath(); ctx.arc(atk.x, atk.y, ar, 0, Math.PI * 2); ctx.clip();
      ctx.beginPath();
      ctx.arc(atk.x, atk.y, ar, 0, Math.PI * 2);
      ctx.arc(self.x, self.y, r, 0, Math.PI * 2);
      ctx.clip("evenodd"); // the shooter minus the part under the defender
      ctx.globalAlpha = 0.55 * squeeze;
      ctx.fillStyle = "#d62020";
      var face = onAtk(ar * 0.68, 0);
      ctx.beginPath(); ctx.arc(face.x, face.y, ar * 0.5, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }

    // The defender's near arm: off its shoulder, over the top of the
    // shooter's neck (where its head meets its torso) and straight down
    // across it, both hands locked together underneath.
    // Everything on the neck turns with the shooter (e.g. as it's lifted
    // for a guillotine slam).
    var sh = onDef(s * r * 0.45, -r * 0.72);
    var over = onAtk(ar * 0.33, ar * 0.9), bend = onAtk(ar * 0.38, ar * 1.2), under = onAtk(ar * 0.33, -ar * 0.62);
    strokeLimb(r * 0.24, armColor(self.char), function () {
      ctx.moveTo(sh.x, sh.y);
      ctx.quadraticCurveTo(bend.x, bend.y, over.x, over.y);
      ctx.lineTo(under.x, under.y);
    });
    var g1 = onAtk(ar * 0.33 + r * 0.1, -ar * 0.62 - r * 0.06), g2 = onAtk(ar * 0.33 - r * 0.1, -ar * 0.62 - r * 0.12);
    drawGloveAt(g1.x, g1.y, r * 0.27, self.char);
    drawGloveAt(g2.x, g2.y, r * 0.27, self.char);

    // Tapping: the shooter reaches up with a free hand and pats the
    // defender's back three times.
    if (g.phase === "tap") {
      var pat = Math.abs(Math.sin(g.tapT / GUILLO_TAP_TIME * Math.PI * 3));
      var hand = onDef(-s * r * 0.15, -r * 0.95 - pat * r * 0.35), hx = hand.x, hy = hand.y;
      strokeLimb(ar * 0.26, armColor(atk.char), function () {
        ctx.moveTo(atk.x + s * ar * 0.1, atk.y - ar * 0.8);
        ctx.quadraticCurveTo(atk.x - s * ar * 0.3, hy - r * 0.2, hx, hy);
      });
      drawGloveAt(hx, hy, ar * 0.26, atk.char);
    }

    // Tug-of-war bar over the pair: the defender's colour is the choke,
    // the shooter's is the escape. The marker is where it stands.
    var bw = 150, bh = 12, cx = (self.x + atk.x) / 2;
    var bx = Math.min(W - bw - 6, Math.max(6, cx - bw / 2));
    var by = Math.min(self.y, atk.y) - r - 64;
    if (by < 8) by = Math.max(self.y, atk.y) + r + 30;
    var split = bw * (g.bar + 1) / 2;
    ctx.fillStyle = self.char.color; ctx.fillRect(bx, by, split, bh);
    ctx.fillStyle = atk.char.color; ctx.fillRect(bx + split, by, bw - split, bh);
    ctx.lineWidth = 2.5; ctx.strokeStyle = theme.wall; ctx.strokeRect(bx, by, bw, bh);
    ctx.fillStyle = theme.ink;
    ctx.fillRect(bx + split - 2, by - 4, 4, bh + 8);
    ctx.restore();
  });
}
