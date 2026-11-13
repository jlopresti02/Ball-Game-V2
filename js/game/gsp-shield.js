// GSP's Maple Shield (Joe, 2026-11-13). A round steel shield in Canada's
// colours (red bands either side of a white middle, the red maple leaf, a
// steel rim with rivets), slung on his back. Set in his character file under
// "gsp.shield"; leave it out and he has no shield.
//
// Toss    every `every` seconds (`chantEvery` while the crowd chants), when
//         they're `minGap`..`maxGap` away, he pulls it off his back and throws
//         it backhand ("MAPLE SHIELD!"). The first throw is a bank shot: aimed
//         at a cage wall so it comes off the wall into them. Every wall it
//         hits it turns back at them, up to `hits` hits and `bounces` walls,
//         then it flies back to him and he catches it. `damage` a hit
//         (`chantDamage` while the crowd chants) and `knockback`. It can be
//         slipped or blocked like anything thrown (source "shield"). While
//         it's out his back is empty: no shield blocks.
// Block   with it on his back he can swing it round onto his lead arm and
//         block `block`% of the strikes he doesn't slip (punches, kicks,
//         elbows, swings, bats): no damage, "BLOCKED!", and the attacker is
//         knocked back `blockKnockback` (like Chuck's Snow Day block).
// The throw runs on b.gspThrow, the shield in the air on b.gspDisc, the block
// pose on b.gspBlock. Only his own two arms and gloves are drawn.
"use strict";

PROJECTILE_SOURCES.shield = true; // (match.js) it flies at you: slipped or blocked, never countered

var GSP_SH_RELEASE = 0.14; // the backhand sweep
var GSP_SH_FOLLOW = 0.2;   // arm out after it's gone
var GSP_SH_BLOCK = 0.38;   // shield up on the lead arm after a block
// Strikes the shield can block.
var GSP_SH_MELEE = { punch: true, kick: true, elbow: true, teep: true, swing: true, jab: true, combo: true, bat: true, poke: true };

function gspShCfg(b) { var g = gspCfg(b); return g && g.shield; }
function gspShieldHome(b) { return !!(gspShCfg(b) && !b.gspDisc && !b.gspThrow); } // on his back
function gspShieldR(b) { return b.r * (gspShCfg(b).size || 0.62); }

// From initGsp.
function initGspShield(b) {
  b.gspThrow = null; b.gspDisc = null; b.gspBlock = null; b.gspBlockHit = null;
  b.gspBackSide = b.id === 0 ? -1 : 1;
  var sh = gspShCfg(b);
  b.gspShT = sh ? gspRand(sh.first) : Infinity;
}

// ---------------------------------------------------------------- the block

// From gspDodge, when a strike isn't slipped. True if the shield takes it.
function gspShieldBlock(b, source, attackerId) {
  var sh = gspShCfg(b);
  if (!sh || !sh.block || !GSP_SH_MELEE[source] || !gspShieldHome(b) || b.gspSp || gspDiveOn(b) || b.gspTaunt || b.gspStun > 0) return false;
  if (Math.random() * 100 >= sh.block) return false;
  var a = balls[attackerId];
  var dx = a.x - b.x, dy = a.y - b.y, d = Math.sqrt(dx * dx + dy * dy) || 1, ux = dx / d, uy = dy / d;
  b.gspBlock = { t: 0, ux: ux, uy: uy };
  b.gspBlockHit = attackerId; // knocked back next frame, once their swing's done (tickGspShield)
  b.justDodged = true;
  floater(b.x + ux * b.r, b.y - b.r - 30, "BLOCKED!", "dodge");
  var cx = b.x + ux * b.r * 1.05, cy = b.y + uy * b.r * 1.05;
  impacts.push({ x: cx, y: cy, nx: ux, ny: uy, life: 0.3, max: 0.3, color: "#ffffff" });
  for (var i = 0; i < 12 && !reduceMotion; i++) {
    var ang = Math.atan2(uy, ux) + (Math.random() - 0.5) * 1.9, v = 160 + Math.random() * 200;
    particles.push({ x: cx, y: cy, vx: Math.cos(ang) * v, vy: Math.sin(ang) * v, life: 0.25, max: 0.25, size: 2 + Math.random() * 2, color: i % 3 ? "#ffffff" : MTL.red });
  }
  hitStop = Math.max(hitStop, 0.04);
  playShieldBlock();
  return true;
}

// ---------------------------------------------------------------- the throw

// From updateGsp, before the Superman punch. True while he's throwing.
function updateGspShield(self, other, cfg, dt, full) {
  var sh = cfg.shield;
  if (!sh) return false;
  var m = self.gspThrow;
  if (m) {
    if (gspInterrupted(self) || over) { self.gspThrow = null; return false; } // (if it hadn't left his hand, it's back on his back)
    return runShieldThrow(self, other, sh, m, dt);
  }
  if (self.gspDisc || !started || over || self.igbb || !other.alive) return false;
  self.gspShT -= dt;
  if (self.gspShT > 0 || full || !canStartIgbb(self, other) || swordDuelActive()) return false;
  var dx = other.x - self.x, dy = other.y - self.y, gap = Math.sqrt(dx * dx + dy * dy) - self.r - other.r;
  if (gap < sh.minGap || gap > sh.maxGap) return false;
  clearActions(self);
  gspGiOff(self);
  self.vx = 0; self.vy = 0;
  self.gspBlock = null;
  self.gspThrow = { phase: "wind", t: 0, aim: Math.atan2(dy, dx), thrown: false };
  floater(self.x, self.y - self.r - 30, "MAPLE SHIELD!", "crit");
  playShieldWind();
  return true;
}

function runShieldThrow(self, other, sh, m, dt) {
  m.t += dt;
  var damp = Math.exp(-14 * dt); self.vx *= damp; self.vy *= damp;
  if (m.phase === "wind") {
    m.aim = gspTurn(m.aim, Math.atan2(other.y - self.y, other.x - self.x), dt * 8);
    if (m.t >= sh.wind) { m.phase = "release"; m.t = 0; }
    return true;
  }
  if (m.phase === "release") {
    if (!m.thrown && m.t >= GSP_SH_RELEASE * 0.55) { m.thrown = true; launchShield(self, other, sh, m); }
    if (m.t >= GSP_SH_RELEASE) { m.phase = "follow"; m.t = 0; }
    return true;
  }
  if (m.t >= GSP_SH_FOLLOW) {
    self.gspThrow = null;
    if (self.alive && inOrdinaryMovement(self)) setSpeed(self, self.baseSpeed || SPEED);
    return false;
  }
  return true;
}

// Off his hand: a bank shot off the cage into them if there's a clean one,
// straight at them if not.
function launchShield(self, other, sh, m) {
  var sr = gspShieldR(self), u = gspShieldHand(self, m, 1), x = u.x, y = u.y;
  var aim = gspBankShot(x, y, other, sr);
  if (aim == null) aim = Math.atan2(other.y - y, other.x - x);
  self.gspDisc = { x: x, y: y, vx: Math.cos(aim) * sh.speed, vy: Math.sin(aim) * sh.speed, rot: m.aim, spin: (Math.random() < 0.5 ? -1 : 1) * 26,
    phase: "out", t: 0, hits: 0, walls: 0, skip: 0, chant: !!self.gspChant, trail: [], fade: 0 };
  playWhoosh();
  playShieldSpin();
}
function gspBankShot(x, y, o, sr) {
  var best = [], clear = o.r + sr + 8;
  [[0, sr], [0, W - sr], [1, sr], [1, H - sr]].forEach(function (w) {
    var mx = w[0] === 0 ? 2 * w[1] - o.x : o.x, my = w[0] === 1 ? 2 * w[1] - o.y : o.y; // them, mirrored in that wall
    var dx = mx - x, dy = my - y, L = Math.sqrt(dx * dx + dy * dy);
    if (L < 1) return;
    var k = w[0] === 0 ? (w[1] - x) / dx : (w[1] - y) / dy; // where it meets the wall
    if (!(k > 0 && k < 1)) return;
    var wx = x + dx * k, wy = y + dy * k, firstLeg = L * k;
    if (firstLeg < 50) return; // (too close to that wall to see the bounce)
    // The way to the wall mustn't run through them.
    var ex = wx - x, ey = wy - y, s = Math.max(0, Math.min(1, ((o.x - x) * ex + (o.y - y) * ey) / (ex * ex + ey * ey)));
    var cx = x + ex * s - o.x, cy = y + ey * s - o.y;
    if (cx * cx + cy * cy < clear * clear) return;
    best.push({ a: Math.atan2(dy, dx), L: L });
  });
  if (!best.length) return null;
  best.sort(function (p, q) { return p.L - q.L; });
  return best[Math.random() < 0.7 || best.length < 2 ? 0 : 1].a; // the shortest bank, now and then the next one
}

// Where his throwing glove (and the shield in it) is, `k` 0..1 through the backhand.
function gspShieldHand(b, m, k) {
  var ux = Math.cos(m.aim), uy = Math.sin(m.aim), px = -uy, py = ux, r = b.r;
  // across his chest on the off side -> swept out front on his throwing side
  var a0 = { u: 0.35, p: -0.55 }, a1 = { u: 1.2, p: 0.5 };
  var e = easeOut(k), arc = Math.sin(Math.PI * k) * 0.35;
  var fu = a0.u + (a1.u - a0.u) * e + arc, fp = a0.p + (a1.p - a0.p) * e;
  return { x: b.x + ux * r * fu + px * r * fp, y: b.y + uy * r * fu + py * r * fp };
}

// ---------------------------------------------------------------- in the air

// From tickGsp, every frame, whatever he's doing.
function tickGspShield(b, dt) {
  if (b.gspBlock) { b.gspBlock.t += dt; if (b.gspBlock.t >= GSP_SH_BLOCK) b.gspBlock = null; }
  if (b.gspBlockHit != null) { // the blocked attacker, bounced off the shield
    var a = balls[b.gspBlockHit], sh = gspShCfg(b);
    b.gspBlockHit = null;
    if (a && a.alive && !a.grappled && !a.grapple && !a.slam && !subLocked(a) && !a.igbb) {
      var dx = a.x - b.x, dy = a.y - b.y, d = Math.sqrt(dx * dx + dy * dy) || 1;
      a.punch = null; a.kick = null; a.swing = null; a.jabAnim = null; a.combo = null; a.flow = null;
      a.vx = dx / d * sh.blockKnockback; a.vy = dy / d * sh.blockKnockback; a.knockFly = 0.25;
    }
  }
  var s = b.gspDisc;
  if (!s) return;
  var sh2 = gspShCfg(b), sr = gspShieldR(b), o = balls[1 - b.id];
  s.t += dt; s.rot += s.spin * dt;
  s.trail.unshift({ x: s.x, y: s.y }); if (s.trail.length > 6) s.trail.pop();
  if (s.phase === "drop") { // he's down: it clatters to a stop and fades
    s.vx *= Math.exp(-5 * dt); s.vy *= Math.exp(-5 * dt); s.spin *= Math.exp(-3 * dt);
    s.x = Math.max(sr, Math.min(W - sr, s.x + s.vx * dt)); s.y = Math.max(sr, Math.min(H - sr, s.y + s.vy * dt));
    s.fade += dt; if (s.fade > 1.2) b.gspDisc = null;
    return;
  }
  if (!b.alive) { s.phase = "drop"; return; }
  if (s.phase === "out" && s.t > 4) s.phase = "back"; // (never flies forever)
  if (s.phase === "back") {
    var hx = b.x - s.x, hy = b.y - s.y, hd = Math.sqrt(hx * hx + hy * hy) || 1;
    var sp = Math.max(sh2.speed, Math.sqrt(b.vx * b.vx + b.vy * b.vy) + 200);
    s.vx = hx / hd * sp; s.vy = hy / hd * sp;
    if (hd < b.r + sr * 0.4 || s.t > 7) { catchShield(b); return; }
  }
  s.skip = Math.max(0, s.skip - dt);
  var dist = Math.sqrt(s.vx * s.vx + s.vy * s.vy) * dt, n = Math.max(1, Math.ceil(dist / 6));
  for (var i = 0; i < n; i++) {
    s.x += s.vx * dt / n; s.y += s.vy * dt / n;
    var nx = 0, ny = 0;
    if (s.x < sr) { s.x = sr; nx = 1; } else if (s.x > W - sr) { s.x = W - sr; nx = -1; }
    if (s.y < sr) { s.y = sr; ny = 1; } else if (s.y > H - sr) { s.y = H - sr; ny = -1; }
    if (nx || ny) { shieldWall(b, s, sh2, o, nx, ny); }
    if (s.phase === "out" && s.skip <= 0 && o && o.alive && !o.koOut && !o.grappled && !o.grapple && !o.slam && !subLocked(o)) {
      var ox = s.x - o.x, oy = s.y - o.y, od = Math.sqrt(ox * ox + oy * oy);
      if (od < o.r + sr * 0.85) { shieldHit(b, s, sh2, o, ox / (od || 1), oy / (od || 1)); break; }
    }
  }
}

// Off the cage: a ping, and it turns back at them (or home, once it's done).
function shieldWall(b, s, sh, o, nx, ny) {
  if (nx) s.vx = Math.abs(s.vx) * nx;
  if (ny) s.vy = Math.abs(s.vy) * ny;
  if (s.phase !== "out") return;
  s.walls++;
  var cx = s.x - nx * gspShieldR(b), cy = s.y - ny * gspShieldR(b);
  impacts.push({ x: cx, y: cy, nx: nx, ny: ny, life: 0.3, max: 0.3, color: theme.wall });
  igbbSparks(cx, cy, nx, ny, "#ffe08a", 8, 300);
  if (!reduceMotion) shake = Math.max(shake, 5);
  playShieldPing();
  if (s.hits >= sh.hits || s.walls > sh.bounces || !o || !o.alive) { s.phase = "back"; return; }
  // straight back at them, off the wall
  var sp = Math.sqrt(s.vx * s.vx + s.vy * s.vy), dx = o.x - s.x, dy = o.y - s.y, d = Math.sqrt(dx * dx + dy * dy) || 1;
  if (dx * nx + dy * ny > 0) { s.vx = dx / d * sp; s.vy = dy / d * sp; }
}

function shieldHit(b, s, sh, o, nx, ny) {
  var ux = s.vx, uy = s.vy, ul = Math.sqrt(ux * ux + uy * uy) || 1;
  ux /= ul; uy /= ul;
  var dealt = hurt(o, s.chant ? sh.chantDamage : sh.damage, "shield", b.id);
  if (o.justDodged) { s.skip = 0.35; return; } // slipped: it flies on past
  s.hits++;
  // it glances off them, out the far side of the hit
  var dot = ux * nx + uy * ny;
  s.vx = (ux - 2 * dot * nx) * ul; s.vy = (uy - 2 * dot * ny) * ul;
  s.x = o.x + nx * (o.r + gspShieldR(b) * 0.9); s.y = o.y + ny * (o.r + gspShieldR(b) * 0.9);
  s.skip = 0.3;
  var cx = o.x + nx * o.r, cy = o.y + ny * o.r;
  if (dealt > 0) {
    if (o.alive && !o.igbb) { o.vx += ux * sh.knockback; o.vy += uy * sh.knockback; o.knockFly = 0.3; }
    o.squash = { t: 0.16, max: 0.16, nx: -ux, ny: -uy };
    o.flash = 0.12;
    impacts.push({ x: cx, y: cy, nx: nx, ny: ny, life: 0.45, max: 0.45, color: MTL.red });
    igbbSparks(cx, cy, nx, ny, MTL.red, 14, 420);
    hitStop = Math.max(hitStop, 0.07);
    if (!reduceMotion) shake = Math.max(shake, 12);
    playShieldHit(dealt);
    crowdReact(0.6);
    var cr = gspCfg(b).crowd;
    gspCrowd(b, cr && cr.shield);
  } else playShieldBlock(); // blocked: clangs off
  if (s.hits >= sh.hits) s.phase = "back";
  checkEnd();
}

function catchShield(b) {
  b.gspDisc = null;
  b.gspShT = gspRand(b.gspChant && gspShCfg(b).chantEvery ? gspShCfg(b).chantEvery : gspShCfg(b).every);
  playShieldCatch();
}

// ---------------------------------------------------------------- drawing

// The shield itself: a steel rim with rivets round a Canada flag (red bands,
// white middle, the maple leaf), turned `rot`.
function drawMapleShield(c, x, y, R, rot, alpha) {
  c.save();
  c.globalAlpha *= alpha == null ? 1 : alpha;
  c.translate(x, y); c.rotate(rot || 0);
  c.beginPath(); c.arc(0, 0, R, 0, Math.PI * 2);
  var steel = c.createRadialGradient(-R * 0.35, -R * 0.35, R * 0.1, 0, 0, R);
  steel.addColorStop(0, "#f1f3f5"); steel.addColorStop(0.6, "#b9c0c7"); steel.addColorStop(1, "#7d868f");
  c.fillStyle = steel; c.fill();
  var f = R * 0.82;
  c.save();
  c.beginPath(); c.arc(0, 0, f, 0, Math.PI * 2); c.clip();
  c.fillStyle = MTL.white; c.fillRect(-f, -f, f * 2, f * 2);
  c.fillStyle = MTL.red; c.fillRect(-f, -f, f * 0.52, f * 2); c.fillRect(f * 0.48, -f, f * 0.52, f * 2);
  drawMapleLeaf(c, 0, 0, f * 0.42, MTL.red);
  // a shine across the face
  var sh = c.createLinearGradient(-f, -f, f, f);
  sh.addColorStop(0, "rgba(255,255,255,0.35)"); sh.addColorStop(0.45, "rgba(255,255,255,0)"); sh.addColorStop(1, "rgba(0,0,0,0.18)");
  c.fillStyle = sh; c.fillRect(-f, -f, f * 2, f * 2);
  c.restore();
  c.lineWidth = Math.max(1.2, R * 0.06); c.strokeStyle = "#5c646c";
  c.beginPath(); c.arc(0, 0, f, 0, Math.PI * 2); c.stroke();
  c.fillStyle = "#e6e9ec"; c.strokeStyle = "#5c646c"; c.lineWidth = Math.max(0.8, R * 0.03);
  for (var i = 0; i < 8; i++) { // rivets round the rim
    var a = i * Math.PI / 4 + Math.PI / 8;
    c.beginPath(); c.arc(Math.cos(a) * R * 0.91, Math.sin(a) * R * 0.91, R * 0.045, 0, Math.PI * 2); c.fill(); c.stroke();
  }
  c.lineWidth = 2.5; c.strokeStyle = theme.wall;
  c.beginPath(); c.arc(0, 0, R, 0, Math.PI * 2); c.stroke();
  c.restore();
}

// Behind his body (drawGspBehind): slung on his back, peeking out over the
// shoulder away from them.
function drawGspShieldBack(b) {
  if (!gspShCfg(b) || !gspShieldHome(b) || b.gspBlock || gspDiveOn(b) || b.gspSp) return;
  var o = balls[1 - b.id], want = o && o.x > b.x ? -1 : 1;
  b.gspBackSide += (want - b.gspBackSide) * 0.08;
  var l = gspLift(b), r = b.r * l.s, side = b.gspBackSide;
  drawMapleShield(ctx, b.x + side * r * 0.62, b.y + l.dy - r * 0.55, gspShieldR(b) * l.s * 1.05, side * 0.35);
}

// Over his body (drawGsp): his arms throwing it, or holding it up to block.
function drawGspShieldArms(b) {
  var size = b.char.punch.size || 14, r = b.r, m = b.gspThrow;
  if (m) {
    var ux = Math.cos(m.aim), uy = Math.sin(m.aim), px = -uy, py = ux;
    var k = m.phase === "wind" ? 0 : m.phase === "release" ? Math.min(1, m.t / GSP_SH_RELEASE) : 1;
    var wob = m.phase === "wind" ? Math.sin(Math.min(1, m.t / 0.12) * Math.PI / 2) : 1; // bringing it round off his back
    var h = gspShieldHand(b, m, k);
    // off hand tucked in guard on the far side
    gspArm(b, b.x - px * r * 0.45, b.y - py * r * 0.45, b.x + ux * r * 0.55 - px * r * 0.75, b.y + uy * r * 0.55 - py * r * 0.75, size, m.aim);
    if (m.phase === "wind" && wob < 1) { // reaching back over the shoulder for it
      var bx = b.x + b.gspBackSide * r * 0.62, by = b.y - r * 0.55;
      h = { x: bx + (h.x - bx) * wob, y: by + (h.y - by) * wob };
    }
    gspArm(b, b.x + px * r * 0.45, b.y + py * r * 0.45, h.x, h.y, size, m.aim);
    if (!m.thrown) drawMapleShield(ctx, h.x, h.y, gspShieldR(b), m.aim + k * 2.5);
    return;
  }
  var bl = b.gspBlock;
  if (bl) {
    var t = bl.t, inK = Math.min(1, t / 0.06), outK = Math.max(0, (t - (GSP_SH_BLOCK - 0.12)) / 0.12), k2 = inK * (1 - outK);
    var bux = bl.ux, buy = bl.uy, bpx = -buy, bpy = bux, jolt = t < 0.1 ? -Math.sin(t / 0.1 * Math.PI) * r * 0.12 : 0;
    var hx = b.x + bux * (r * (0.35 + 0.65 * k2) + jolt), hy = b.y + buy * (r * (0.35 + 0.65 * k2) + jolt);
    gspArm(b, b.x - bpx * r * 0.45, b.y - bpy * r * 0.45, b.x + bux * r * 0.6 - bpx * r * 0.7, b.y + buy * r * 0.6 - bpy * r * 0.7, size, Math.atan2(buy, bux));
    gspArm(b, b.x + bpx * r * 0.45, b.y + bpy * r * 0.45, hx, hy, size, Math.atan2(buy, bux));
    drawMapleShield(ctx, hx, hy, gspShieldR(b) * (1 + 0.12 * k2), 0);
  }
}
// For the gallery (gspGalleryMoves).
function gspShieldGalleryMove(sh, add) {
  add("🛡️", "Maple Shield", "A steel shield in Canada's colours on his back. Every " + sh.every[0] + "-" + sh.every[1] + "s (" + sh.chantEvery[0] + "-" + sh.chantEvery[1] + "s while they chant) he throws it backhand, banked off the cage into them; it turns back at them off every wall it hits, up to " + sh.hits + " hits, then flies back to him. " + sh.damage + " damage a hit (" + sh.chantDamage + " while they chant). With it on his back he blocks " + sh.block + "% of the strikes he doesn't slip, knocking the attacker back.");
}
function gspShieldHandsBusy(b) { return !!(b && (b.gspThrow || b.gspBlock)); }

// Over the ring (drawGspOver): the shield flying, with a red and white blur.
function drawGspShields() {
  if (!balls) return;
  balls.forEach(function (b) {
    var s = b.gspDisc;
    if (!s) return;
    var R = gspShieldR(b), a = s.phase === "drop" ? Math.max(0, 1 - s.fade / 1.2) : 1;
    ctx.save();
    if (!reduceMotion && s.phase !== "drop") {
      s.trail.forEach(function (p, i) {
        ctx.globalAlpha = 0.22 * (1 - i / s.trail.length);
        ctx.fillStyle = i % 2 ? MTL.white : MTL.red;
        ctx.beginPath(); ctx.arc(p.x, p.y, R * (0.95 - i * 0.08), 0, Math.PI * 2); ctx.fill();
      });
      ctx.globalAlpha = 1;
    }
    drawMapleShield(ctx, s.x, s.y, R, s.rot, a);
    ctx.restore();
  });
}

// ---------------------------------------------------------------- sound
// Synth stand-ins until Joe picks real ones.

// A struck piece of metal: a few out-of-tune partials ringing down.
function gspRing(ac, t, f, peak, dur) {
  [[1, 1], [2.76, 0.5], [5.4, 0.25], [8.9, 0.12]].forEach(function (p) {
    var o = ac.createOscillator(), g = ac.createGain();
    o.type = "sine"; o.frequency.value = f * p[0];
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak * p[1], t + 0.004);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur / Math.sqrt(p[0]));
    o.connect(g); g.connect(strikeOut(ac));
    o.start(t); o.stop(t + dur + 0.05);
  });
}
function playShieldWind() {
  gspAudio(function (ac, t) { caneBurst(ac, t, 1500, 1.4, 0.18, 0.1); gspRing(ac, t + 0.02, 1320, 0.05, 0.25); });
}
// Spinning away: a rising whirr.
function playShieldSpin() {
  gspAudio(function (ac, t) {
    var o = ac.createOscillator(), g = ac.createGain(), am = ac.createOscillator(), amg = ac.createGain();
    o.type = "triangle"; o.frequency.setValueAtTime(300, t); o.frequency.exponentialRampToValueAtTime(520, t + 0.5);
    am.frequency.value = 26; amg.gain.value = 0.05; am.connect(amg); amg.connect(g.gain);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.07, t + 0.08); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.6);
    o.connect(g); g.connect(strikeOut(ac));
    o.start(t); am.start(t); o.stop(t + 0.65); am.stop(t + 0.65);
  });
}
// Off the cage: a bright ping and the chain-link rattling.
function playShieldPing() {
  gspAudio(function (ac, t) {
    gspRing(ac, t, 1180 + Math.random() * 160, 0.16, 0.45);
    for (var i = 0; i < 3; i++) caneBurst(ac, t + 0.02 + i * 0.04, 3600 + i * 400, 6, 0.08, 0.05);
  });
}
function playShieldHit(dealt) {
  playPunch(dealt * 1.4);
  gspAudio(function (ac, t) { gspRing(ac, t, 560, 0.22, 0.6); caneTone(ac, t, "sine", 120, 50, 0.5, 0.22); });
}
function playShieldBlock() {
  gspAudio(function (ac, t) { gspRing(ac, t, 760, 0.2, 0.5); caneBurst(ac, t, 2200, 2, 0.2, 0.06); });
}
function playShieldCatch() {
  gspAudio(function (ac, t) { caneTone(ac, t, "sine", 220, 140, 0.25, 0.09); gspRing(ac, t + 0.01, 980, 0.07, 0.3); });
}
