// Jon Jones (char.jon): a Kicker who fights in two modes and swaps between
// them every `jon.swapEvery` seconds, starting in GOAT mode.
//
//   GOAT mode (chest tattoo glowing gold): kicks, normal punches and
//   wrestling. 5% of his takedowns go straight to the back for a rear naked
//   choke and 5% go into ground and pound; he suplexes from behind. Every
//   defense in the game except the guard pull and the weaves: blocks, kick
//   checks, sprawls (and reattacks), grab counters and the guillotine.
//
//   EVIL mode (tattoo glowing red): punches instead of kicks, with grappling defense
//   (sprawls) and the BMF's weave. A critical weave isn't a punch flurry:
//   it's an eye poke into a brutal combination (the same poke and combo
//   moves as Gane's Cheater mode, drawn by drawCheater).
//
// Each fighter's char is its own copy (makeBall), so swapping modes only
// changes that one fighter, never the roster.
"use strict";

var JON_MODE_FIELDS = ["hasPunch", "hasKick", "hasGrapple", "hasSuplex", "hasGuillotine", "hasWeave", "blockChance", "tdd"];

function isJon(b) { return !!(b && b.char.jon); }

// From makeBall: a private copy of the character, set to GOAT mode.
function jonCharCopy(ch) {
  var c = JSON.parse(JSON.stringify(ch));
  c.jon.goatLook = c.jon.goatLook || c.look; // never a copy that was left in its red EVIL look
  c.look = c.jon.goatLook;
  return c;
}

function initJon(b) {
  if (!isJon(b)) return;
  b.jonMode = null;
  b.jonT = 0;
  setJonMode(b, "goat", true);
  // Decodes both tattoos up front so a flicker shows each color right away.
  [b.char.jon.goatLook, b.char.jon.evilLook].forEach(function (l) {
    ((l && l.tattoos && l.tattoos.decals) || []).forEach(function (d) { artDecalImage(d.img); });
  });
  initDuckDrop(b); // jon-duck.js
}

function setJonMode(b, mode, quiet) {
  var j = b.char.jon, m = j[mode];
  JON_MODE_FIELDS.forEach(function (k) { b.char[k] = m[k] != null ? m[k] : (k === "blockChance" ? 0 : (k === "tdd" ? null : false)); });
  b.char.look = mode === "evil" ? j.evilLook : j.goatLook;
  b.jonMode = mode;
  b.jonT = 0;
  if (quiet) return;
  // Drops anything that belongs to the mode he's leaving.
  b.punch = null; b.kick = null; b.combo = null; b.taunt = null; b.flow = null;
  b.jonGlow = 0.6;
  var gold = mode === "goat";
  floater(b.x, b.y - b.r - 30, gold ? "GOAT MODE" : "EVIL MODE", gold ? "note" : "crit");
  var col = gold ? "#f5c542" : "#e0221b";
  for (var i = 0; i < 18 && !reduceMotion; i++) {
    var a = Math.random() * Math.PI * 2, s = 120 + Math.random() * 200;
    particles.push({ x: b.x, y: b.y - b.r * 0.15, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 0.45, max: 0.45, size: 2.5 + Math.random() * 3, color: col });
  }
  playJonModeSwap(mode);
}

// Busy with something the swap would break: waits until it's done.
function jonBusy(b) {
  return !!(b.grapple || b.grappled || b.sprawl || b.sprawled || b.choked || b.rnc || b.suplex || b.guillo ||
    b.armbar || b.guard || b.chAct || b.combo || b.taunt || b.flow || b.igbb || b.slam || b.koRush || b.koDuel || b.checkAnim);
}

// Every frame from update().
function tickJon(dt) {
  balls.forEach(function (b) {
    if (!isJon(b)) return;
    if (b.jonGlow > 0) b.jonGlow = Math.max(0, b.jonGlow - dt);
    if (!b.alive || over || !started) return;
    b.jonT += dt;
    if (b.jonT >= b.char.jon.swapEvery && !jonBusy(b) && !specialBusy(b)) setJonMode(b, b.jonMode === "goat" ? "evil" : "goat");
  });
}

// From attemptGrab once the shot can't be stopped: in GOAT mode some of his
// takedowns go to the back for a choke, or into ground and pound, instead
// of the normal slam. True if one of them happened.
function tryJonTakedown(atk, tgt) {
  if (!isJon(atk) || atk.jonMode !== "goat" || !tgt.alive) return false;
  var j = atk.char.jon, roll = Math.random() * 100;
  if (roll < j.rncChance) {
    atk.grappleCd = atk.char.grapple.cooldown;
    floater(atk.x, atk.y - atk.r - 44, "TAKES THE BACK", "note");
    beginRnc(atk, tgt);
    return true;
  }
  if (roll < j.rncChance + j.gnpChance) {
    atk.grappleCd = atk.char.grapple.cooldown;
    beginJonGnp(atk, tgt);
    return true;
  }
  return false;
}

// Ground and pound: drives them to the floor, mounts and hammers them. Runs
// on the guillotine's takedown-and-pound moves (bjj.js), with Jon on top.
function beginJonGnp(atk, tgt) {
  var side = atk.x >= tgt.x ? 1 : -1;
  var g = { atkId: atk.id, t: 0, nx: side, ny: 0, bar: 0, phase: "drive", jon: true };
  tgt.guillo = g;
  atk.choked = true;
  [atk, tgt].forEach(function (b) {
    b.vx = 0; b.vy = 0;
    b.punch = null; b.kick = null; b.throwAnim = null; b.swing = null; b.checkAnim = null;
  });
  beginGuilloGnp(tgt, atk, g);
  g.hits = atk.char.jon.gnp.slice();
  floater(atk.x, atk.y - atk.r - 44, "GROUND AND POUND", "crit");
}

// From tryWeave on a critical weave in EVIL mode: an eye poke instead of
// the punch flurry, straight into the combination (cheater.js).
function jonEvilPoke(b, atk) {
  if (!isJon(b) || b.jonMode !== "evil" || !b.char.weave.critPoke) return false;
  floater(b.x, b.y - b.r - 8, "WEAVE", "dodge");
  b.punch = null; b.kick = null; b.swing = null; b.throwAnim = null;
  b.chAct = { kind: "poke", t: 0, hit: false, side: Math.random() < 0.5 ? 1 : -1 };
  b.vx = 0; b.vy = 0;
  if (!reduceMotion) shake = Math.max(shake, 6);
  return true;
}

// The chest tattoo's glow pulses out when he swaps modes.
function drawJonGlow(b) {
  if (!isJon(b) || !b.alive) return;
  var k = (b.jonGlow || 0) / 0.6;
  var pulse = 0.5 + 0.5 * Math.sin(performance.now() / 260 + b.id);
  var a = 0.1 + 0.08 * pulse + 0.45 * k;
  var red = b.igbb && (b.igbb.move === "goatstampede" || b.igbb.move === "duckdrop") ? (duckHeroic(b) || b.igbb.red) : b.jonMode === "evil";
  if (duckHeroic(b)) { k = 1; a = 0.45 + 0.25 * pulse; } // blazing like a superhero (jon-duck.js)
  var col = red ? "224,34,27" : "245,197,66";
  // Where the tattoo sits: across his right pec (screen left).
  var cx = b.x - b.r * 0.38, cy = b.y - b.r * 0.04, rr = b.r * (0.55 + 0.35 * k);
  ctx.save();
  var gr = ctx.createRadialGradient(cx, cy, 0, cx, cy, rr);
  gr.addColorStop(0, "rgba(" + col + "," + a + ")");
  gr.addColorStop(1, "rgba(" + col + ",0)");
  ctx.fillStyle = gr;
  ctx.globalCompositeOperation = "lighter";
  ctx.beginPath(); ctx.arc(cx, cy, rr, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

// ---------------------------------------------------------------
// Special: GOAT Stampede. He floats up into the air, his tattoo flickering
// between gold and red, and summons goats. Each one barges in through the
// crowd (like Ilia's bull), leaps the fence, and stamps at the edge of the
// mat while a red lane shows where it's about to run. Then it charges
// straight across in that line, always through center stage. The lanes
// come in from random spots along the edges and don't follow
// anyone, so the opponent can get out of the way just by being somewhere
// else when it comes through. Every goat that hits rams them for
// special.goatDamage.
// ---------------------------------------------------------------
var GS_RISE = 0.9, GS_LAND = 0.6, GS_HOVER = 64;   // float up, come down, how high
var GS_GOAT_R = 30;                                 // a goat's size (its hit radius)
var GS_RUN = 520, GS_LEAP = 0.25, GS_AIM = 0.95;    // through the crowd, over the fence, the lane warning
var GS_CHARGE = 1500;                               // charging speed
var GS_MAX = 16;                                    // the whole special never runs longer than this
var jonGoats = [];

function resetJonGoats() { jonGoats = []; }
function goatStampedeOn() { return balls.some(function (b) { return b.igbb && b.igbb.move === "goatstampede"; }); }

function updateGoatStampede(self, other, dt) {
  var sp = self.char.special;
  if (!self.igbb) {
    if (self.specialT < sp.chargeTime || !canStartIgbb(self, other)) return false;
    clearActions(self);
    self.igbb = { move: "goatstampede", phase: "rise", t: 0, all: 0, z: 0, spawned: 0, nextGoat: 0.3, flick: 0, red: false,
      hx: Math.max(self.r + 20, Math.min(W - self.r - 20, self.x)), hy: Math.max(self.r + GS_HOVER + 10, Math.min(H - self.r - 20, self.y)) };
    jonGoats = [];
    floater(self.x, self.y - self.r - 26, "GOAT STAMPEDE", "crit");
    playJonModeSwap("goat"); playJonModeSwap("evil");
    playJonBaa(); // he baas as he floats up (Joe's clip)
    playJonLevitate(); // and the telekinetic whoosh (audio.js)
  }
  var m = self.igbb;
  m.t += dt; m.all += dt;
  self.vx = 0; self.vy = 0;
  self.invincible = true; // up in the air: nothing reaches him
  // The tattoo flickers between gold and red the whole time.
  m.flick -= dt;
  if (m.flick <= 0) {
    m.red = !m.red; m.flick = 0.05 + Math.random() * 0.16;
    self.char.look = m.red ? self.char.jon.evilLook : self.char.jon.goatLook;
  }
  // Drifts to his spot as he rises, and bobs while he hangs there.
  self.x += (m.hx - self.x) * Math.min(1, dt * 3); self.y += (m.hy - self.y) * Math.min(1, dt * 3);
  if (over) { endGoatStampede(self, false); return false; }
  tickGoats(self, other, dt);

  if (m.phase === "rise") {
    var k = Math.min(1, m.t / GS_RISE);
    m.z = GS_HOVER * (1 - Math.pow(1 - k, 3));
    if (k >= 1) { m.phase = "stampede"; m.t = 0; }
    return true;
  }
  if (m.phase === "stampede") {
    m.z = GS_HOVER + (reduceMotion ? 0 : Math.sin(m.t * 3) * 5);
    m.nextGoat -= dt;
    if (m.spawned < sp.goats && m.nextGoat <= 0) {
      spawnGoat(self);
      m.spawned++; m.nextGoat = sp.goatGap * (0.75 + Math.random() * 0.5);
    }
    if ((m.spawned >= sp.goats && !jonGoats.length) || m.all > GS_MAX) { m.phase = "land"; m.t = 0; m.z0 = m.z; }
    return true;
  }
  // Comes back down.
  var kl = Math.min(1, m.t / GS_LAND);
  m.z = m.z0 * (1 - kl * kl);
  if (kl >= 1) {
    playSlam();
    if (!reduceMotion) shake = Math.max(shake, 8);
    endGoatStampede(self, true);
    return false;
  }
  return true;
}

function endGoatStampede(self, landed) {
  self.igbb = null;
  self.invincible = false;
  if (landed) self.specialT = 0;
  self.char.look = self.jonMode === "evil" ? self.char.jon.evilLook : self.char.jon.goatLook;
  jonGoats = [];
  setSpeed(self, self.baseSpeed || SPEED);
}

// Where everything off the mat is, in arena units (the stadium's stands, or
// just off the edge of the plain arena).
function gsFence() { return stadiumOn() ? ST.CAGE / 2 * W / ST.A : 0; }
function gsOffBottom() { return stadiumOn() ? (STAGE_H + 80 - ST.AY) * W / ST.A : H + GS_GOAT_R * 3; }
function gsOffSide() { return stadiumOn() ? (ST.AX + 80) * W / ST.A : GS_GOAT_R * 3; }

// A goat runs in through the crowd from the bottom or one of the sides, and
// picks a random line across the mat.
function spawnGoat(self) {
  var side = ["bottom", "bottom", "left", "right"][Math.floor(Math.random() * 4)];
  var f = gsFence(), g = { t: 0, phase: "run", z: 0, hoof: 0, hit: false, alpha: 1, side: side };
  var inset = GS_GOAT_R + 6, along = 70 + Math.random() * (W - 140);
  if (side === "bottom") {
    g.x = along + (Math.random() - 0.5) * 80; g.y = gsOffBottom();
    g.ox = along; g.oy = H + f + GS_GOAT_R + 6; g.ix = along; g.iy = H - inset; g.nx = 0; g.ny = -1;
  } else {
    var s = side === "left" ? -1 : 1;
    g.x = side === "left" ? -gsOffSide() : W + gsOffSide(); g.y = along + (Math.random() - 0.5) * 80;
    g.ox = side === "left" ? -f - GS_GOAT_R - 6 : W + f + GS_GOAT_R + 6; g.oy = along;
    g.ix = side === "left" ? inset : W - inset; g.iy = along; g.nx = -s; g.ny = 0;
  }
  // The charge: a straight line through center stage (give or take a
  // little), from wherever along the edge it came in.
  var cx = W / 2 + (Math.random() - 0.5) * 30, cy = H / 2 + (Math.random() - 0.5) * 30;
  var a = Math.atan2(cy - g.iy, cx - g.ix);
  g.dx = Math.cos(a); g.dy = Math.sin(a);
  g.face = g.dx >= 0 ? 1 : -1;
  if (side === "bottom") g.face = Math.random() < 0.5 ? 1 : -1; // (side on to us while it runs up)
  else g.face = g.nx;
  // Where the line leaves the mat.
  var tx = g.dx > 0 ? (W - g.ix) / g.dx : g.dx < 0 ? -g.ix / g.dx : Infinity;
  var ty = g.dy > 0 ? (H - g.iy) / g.dy : g.dy < 0 ? -g.iy / g.dy : Infinity;
  var tl = Math.min(tx, ty);
  g.ex = g.ix + g.dx * tl; g.ey = g.iy + g.dy * tl;
  jonGoats.push(g);
}

function tickGoats(self, other, dt) {
  jonGoats.forEach(function (g) {
    g.t += dt;
    if (g.phase === "run") {
      var dx = g.ox - g.x, dy = g.oy - g.y, d = Math.sqrt(dx * dx + dy * dy);
      var st = GS_RUN * dt;
      goatHooves(g, dt);
      if (d <= st) { g.x = g.ox; g.y = g.oy; g.phase = "leap"; g.t = 0; playGoatBleat(); }
      else { g.x += dx / d * st; g.y += dy / d * st; if (Math.abs(dx) > 4) g.face = dx > 0 ? 1 : -1; }
    } else if (g.phase === "leap") {
      var k = Math.min(1, g.t / GS_LEAP);
      g.x = g.ox + (g.ix - g.ox) * k; g.y = g.oy + (g.iy - g.oy) * k;
      g.z = Math.sin(Math.PI * k) * GS_GOAT_R * 1.5;
      if (k >= 1) { g.z = 0; g.phase = "aim"; g.t = 0; g.face = g.dx >= 0 ? 1 : -1; playHoof(); }
    } else if (g.phase === "aim") {
      // Stamping, head down, while its lane lights up.
      if (Math.floor(g.t / 0.22) !== Math.floor((g.t - dt) / 0.22)) {
        playHoof();
        if (!reduceMotion) auraDustAt(g.x - g.face * GS_GOAT_R * 0.5, g.y + GS_GOAT_R * 0.8, 3);
      }
      if (g.t >= GS_AIM) { g.phase = "charge"; g.t = 0; playWhoosh(); }
    } else if (g.phase === "charge") {
      g.x += g.dx * GS_CHARGE * dt; g.y += g.dy * GS_CHARGE * dt;
      goatHooves(g, dt);
      // Rams whoever is in its way, and keeps going.
      if (!g.hit && other.alive) {
        var hx = other.x - g.x, hy = other.y - g.y;
        if (hx * hx + hy * hy < (other.r + GS_GOAT_R * 0.85) * (other.r + GS_GOAT_R * 0.85)) goatRam(self, other, g);
      }
      // Leaps out over the fence on the far side and off through the crowd.
      var out = g.x < -GS_GOAT_R || g.x > W + GS_GOAT_R || g.y < -GS_GOAT_R || g.y > H + GS_GOAT_R;
      if (out) { g.alpha -= dt * 2.5; g.z = Math.max(0, Math.sin(Math.min(1, g.alpha) * Math.PI) * 18); }
    }
  });
  jonGoats = jonGoats.filter(function (g) { return g.alpha > 0; });
}

function goatRam(self, other, g) {
  g.hit = true;
  var dealt = hurt(other, self.char.special.goatDamage, "igbb", self.id);
  // Sent flying, pinballing violently off the walls (the power punch's wall
  // slam, abilities.js), taking damage on every wall.
  if (other.alive && !other.grappled && !other.grapple) {
    // Knocked off the goat's horns: mostly the way the goat is running,
    // pushed off to the side it caught them on (a glancing hit sends them
    // out wider). The walls then bounce them off at the true angle.
    var cx = other.x - g.x, cy = other.y - g.y, cl = Math.sqrt(cx * cx + cy * cy) || 1;
    var kx = g.dx * 0.65 + cx / cl * 0.35, ky = g.dy * 0.65 + cy / cl * 0.35, kl = Math.sqrt(kx * kx + ky * ky) || 1;
    var sp = self.char.special;
    beginWallSlam(other, kx / kl, ky / kl, { knockback: sp.ramSpeed, wallSlams: sp.ramWalls, slamDamage: sp.ramWallDamage });
    if (other.slam) other.slam.ease = 0.9; // glides back to normal speed after (physics.js)
    if (other.slam) other.slam.goat = 1; // the walls get the goat's cage-rattling thud (abilities.js)
  }
  other.squash = { t: 0.2, max: 0.2, nx: g.dx, ny: g.dy }; other.flash = 0.16;
  floater(other.x, other.y - other.r - 30, "RAMMED!", "crit");
  impacts.push({ x: other.x - g.dx * other.r, y: other.y - g.dy * other.r, nx: g.dx, ny: g.dy, life: 0.4, max: 0.4, color: self.char.color });
  playGoatRam(); // a deep thunder ram (audio.js)
  if (!reduceMotion) { shake = Math.max(shake, 16); hitStop = Math.max(hitStop, 0.06); }
  checkEnd();
}

var gsHoofT = 0;
function goatHooves(g, dt) {
  g.hoof += dt;
  if (g.hoof < 0.1) return;
  g.hoof = 0;
  if (performance.now() - gsHoofT > 60) { gsHoofT = performance.now(); playHoof(); } // (a herd doesn't pile up the sound)
  if (!reduceMotion && g.x > 0 && g.x < W && g.y > 0 && g.y < H) auraDustAt(g.x - (g.dx || 0) * GS_GOAT_R, g.y + GS_GOAT_R * 0.8, 1);
}
function auraDustAt(x, y, n) {
  for (var i = 0; i < n; i++) {
    var a = Math.random() * Math.PI * 2, sp = 60 + Math.random() * 120;
    particles.push({ x: x, y: y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp * 0.5 - 30, life: 0.45, max: 0.45, size: 4 + Math.random() * 4, color: "rgba(170,150,120,0.6)" });
  }
}

// Fans shoved aside by goats running through the stands (via herbShove).
function jonGoatPush(f) {
  if (!jonGoats.length) return null;
  var k = ST.A / W, tx = 0, ty = 0, hit = false;
  jonGoats.forEach(function (g) {
    if (g.x > 0 && g.x < W && g.y > 0 && g.y < H) return;
    var gx = ST.AX + g.x * k, gy = ST.AY + g.y * k;
    var dx = f.x - gx, dy = f.y - gy, d = Math.sqrt(dx * dx + dy * dy) || 1, reach = f.r * 0.85 + GS_GOAT_R * k * 1.2;
    if (d >= reach) return;
    var push = reach - d; hit = true;
    if (g.side === "bottom") { tx += (dx < 0 ? -1 : 1) * push * 1.2; ty += dy / d * push * 0.25; }
    else { tx += dx / d * push * 0.25; ty += (dy < 0 ? -1 : 1) * push * 1.2; }
  });
  return hit ? { x: tx, y: ty } : null;
}

// How high he's floating (draw.js lifts him by this).
function jonFloatOffset(b) {
  var m = b.igbb;
  if (m && m.move === "duckdrop") return duckPoseOffset(b); // down on one knee after a Duck Drop (jon-duck.js)
  if (!m || m.move !== "goatstampede") return { x: 0, y: 0 };
  return { x: 0, y: -(m.z || 0) };
}
// His hands are up, summoning (drawHands leaves them out).
function jonHandsBusy(b) { return !!(b.igbb && b.igbb.move === "goatstampede"); }

// Under the fighters: his shadow on the mat while he floats, and the red
// lane warnings.
function drawJonLanes() {
  balls.forEach(function (b) {
    var m = b.igbb;
    if (!m || m.move !== "goatstampede" || !b.alive) return;
    var sh = 1 - Math.min(0.5, (m.z || 0) / 160);
    ctx.fillStyle = "rgba(0,0,0,0.2)";
    ctx.beginPath(); ctx.ellipse(b.x, b.y + b.r * 0.9, b.r * 0.9 * sh, b.r * 0.28 * sh, 0, 0, Math.PI * 2); ctx.fill();
  });
  var now = performance.now() / 1000;
  jonGoats.forEach(function (g) {
    var show = g.phase === "aim" ? Math.min(1, g.t / 0.15) : g.phase === "charge" ? Math.max(0, 1 - g.t / 0.35) : (g.phase === "leap" ? 0.35 * Math.min(1, g.t / GS_LEAP) : 0);
    if (show <= 0) return;
    var len = Math.sqrt((g.ex - g.ix) * (g.ex - g.ix) + (g.ey - g.iy) * (g.ey - g.iy)), wdt = GS_GOAT_R * 1.8;
    var pulse = 0.7 + 0.3 * Math.sin(now * 18);
    ctx.save();
    ctx.translate(g.ix, g.iy); ctx.rotate(Math.atan2(g.dy, g.dx));
    ctx.globalAlpha = show;
    ctx.fillStyle = "rgba(220,20,20," + (0.22 * pulse) + ")";
    ctx.fillRect(0, -wdt / 2, len, wdt);
    ctx.strokeStyle = "rgba(220,20,20," + (0.85 * pulse) + ")"; ctx.lineWidth = 3; ctx.setLineDash([14, 10]);
    ctx.beginPath(); ctx.moveTo(0, -wdt / 2); ctx.lineTo(len, -wdt / 2); ctx.moveTo(0, wdt / 2); ctx.lineTo(len, wdt / 2); ctx.stroke();
    ctx.setLineDash([]);
    // Chevrons streaming the way it'll run.
    ctx.fillStyle = "rgba(235,30,30," + (0.75 * pulse) + ")";
    var off = (now * 160) % 46;
    for (var x = off; x < len - 10; x += 46) {
      ctx.beginPath(); ctx.moveTo(x, -wdt * 0.28); ctx.lineTo(x + 14, 0); ctx.lineTo(x, wdt * 0.28); ctx.lineTo(x + 6, 0); ctx.closePath(); ctx.fill();
    }
    ctx.restore();
  });
}

var jonGoatImg = null;
function goatImage() {
  if (!jonGoatImg && typeof JON_GOAT_SRC !== "undefined") { jonGoatImg = new Image(); jonGoatImg.src = JON_GOAT_SRC; }
  return jonGoatImg && jonGoatImg.complete && jonGoatImg.naturalWidth ? jonGoatImg : null;
}

// Over the fighters: the goats.
function drawJonGoats() {
  if (!jonGoats.length) return;
  var im = goatImage();
  jonGoats.slice().sort(function (a, b) { return a.y - b.y; }).forEach(function (g) {
    if (!stadiumOn() && (g.x < -GS_GOAT_R || g.x > W + GS_GOAT_R || g.y > H + GS_GOAT_R)) return;
    var r = GS_GOAT_R, running = g.phase === "run" || g.phase === "charge";
    var bob = running && !reduceMotion ? Math.abs(Math.sin(g.t * 24)) * 4 : (g.phase === "aim" && !reduceMotion ? Math.abs(Math.sin(g.t * 14)) * 2 : 0);
    var y = g.y - (g.z || 0) - bob;
    ctx.save();
    ctx.globalAlpha = Math.max(0, Math.min(1, g.alpha));
    ctx.fillStyle = "rgba(0,0,0,0.18)";
    ctx.beginPath(); ctx.ellipse(g.x, g.y + r * 0.85, r * 0.95, r * 0.28, 0, 0, Math.PI * 2); ctx.fill();
    ctx.translate(g.x, y);
    // Head down and leaning into it on the charge.
    var tilt = g.phase === "charge" ? Math.max(-0.4, Math.min(0.4, g.dy * 0.5)) * g.face : (g.phase === "aim" ? 0.08 : 0);
    ctx.rotate(tilt);
    ctx.scale(g.face, 1);
    if (im) {
      var w = r * 2.6, h = w * JON_GOAT_ASPECT;
      ctx.drawImage(im, -w / 2, r * 0.95 - h, w, h);
    } else {
      ctx.fillStyle = "#1b1b1b"; ctx.beginPath(); ctx.ellipse(0, 0, r * 1.1, r * 0.7, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(r * 0.95, -r * 0.45, r * 0.4, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  });
}

// Floating with both hands raised, summoning them.
function drawGoatStampede(b) {
  var m = b.igbb;
  if (!m || m.move !== "goatstampede" || !b.alive) return;
  var ch = b.char, arm = (ch.punch.size || 15) * 0.75, gr = b.r * 0.24;
  var up = m.phase === "rise" ? Math.min(1, m.t / GS_RISE) : m.phase === "land" ? 1 - Math.min(1, m.t / GS_LAND) : 1;
  var wave = reduceMotion ? 0 : Math.sin(performance.now() / 180) * 0.12;
  [-1, 1].forEach(function (s) {
    var sx = b.x + s * b.r * 0.62, sy = b.y - b.r * 0.15;
    var ang = -Math.PI / 2 + s * (0.55 + wave * s) * up + s * (1 - up) * 1.2;
    var hx = sx + Math.cos(ang) * b.r * 0.95, hy = sy + Math.sin(ang) * b.r * 0.95;
    strokeLimb(arm, armColor(ch), function () { ctx.moveTo(sx, sy); ctx.lineTo(hx, hy); });
    drawGloveAt(hx, hy, gr, ch);
  });
}
