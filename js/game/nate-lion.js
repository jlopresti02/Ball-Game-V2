// Nate Diaz's lion (Joe, 2026-11-15). Every so often Nate stops, throws his
// arms out wide (his taunt, diaz.js) and summons a lion. It roars, barges
// through the crowd and hops the cage like Khabib's bear (khabib-bear.js), then
// stalks his opponent, crouches low with its back end wiggling (the tell) and
// pounces. If it lands on them a cartoon smoke cloud goes up over the two of
// them and they get mauled; it clears with them seeing stars and the lion
// roaring, and it pads off out of the cage. If they get out of the way it
// lands and stalks them again, a few pounces at most. It never goes after Nate.
// Nate's line as he summons it: "Who the [BLEEP] knows what a gazelle is?"
// (Joe's recording, nateGazelle in nate-lion-art.js).
// The maul victim is held with the bear's flag (bearHeld), so every other
// move already leaves them alone while they're pinned.
// Config: char.lion. Art and roars: Joe's pictures and recording (nate-lion-art.js).
// The maul is the bear's cartoon smoke cloud (tickBearCloud / drawBearCloud,
// khabib-bear.js).
"use strict";

var LION_S = RADIUS * 0.85;     // size unit for distances (the picture is ~5 of these long)
var LION_LEN = LION_S * 5.2;    // nose to tail end, side on
var LION_BUMP = RADIUS * 1.25;  // how close the pounce has to land
var LION_LINE = "Who the [BLEEP] knows what a gazelle is?"; // Nate Diaz (Joe's clip: nateGazelle)
var LION_WORDS = ["RAWR!", "CHOMP!", "SWIPE!", "SLASH!", "GRRR!", "SCRATCH!"];
var LION_HOP = 0.6, LION_CROUCH = 0.55, LION_LEAP = 0.42, LION_ROAR = 1.9, LION_DAZE = 1.3;
var LION_SIDE_H = RADIUS * 3.3;   // the side-on picture's height (Joe's standing lion)
var LION_ROAR_H = RADIUS * 3.7;   // the roaring picture's height
var lionSideImg = new Image(); lionSideImg.src = LION_SIDE_SRC;
var lionRoarImg = new Image(); lionRoarImg.src = LION_ROAR_SRC;

var natLion = null;
var lionForceSide = null; // (demos: 0 bottom, 1 left, 2 right)

function lionRand(r) { return r[0] + Math.random() * (r[1] - r[0]); }
// Wrapped up with someone (a takedown, a slam, a submission, a sprawl): the
// lion waits for them to come apart rather than landing on both.
function lionTangled(b) { return !!(b && (b.grappled || b.grapple || b.slam || b.sprawl || b.sprawled || b.knockFly > 0 || subLocked(b))); }
function lionSummoning(b) { return !!(natLion && natLion.ownerId === b.id && natLion.phase === "summon"); }

// From makeBall (match.js).
function initNateLion(b) {
  var cfg = b.char.lion;
  b.lionN = 0;
  b.lionT = cfg ? lionRand(cfg.first) : Infinity;
  natLion = null;
  if (cfg) { withClip("lionRoarA"); withClip("lionRoarB"); withClip("nateGazelle"); } // decode Joe's roars ahead of time
}

// Every frame from update() (update.js).
function tickNateLion(dt) {
  if (!natLion) {
    if (!started || over) return;
    balls.forEach(function (b) {
      var cfg = b.char.lion, o = balls[1 - b.id];
      if (!cfg || natLion || !b.alive || !o || !o.alive || b.lionN >= cfg.max) return;
      b.lionT -= dt;
      if (b.lionT > 0) return;
      if (jumboHold() || swordDuelActive() || balls.some(function (f) { return f.igbb || f.bearHeld; })) return;
      if ((typeof ringBear !== "undefined" && ringBear) || (typeof nickDiaz !== "undefined" && nickDiaz)) return;
      if (lionTangled(b) || lionTangled(o) || specialBusy(b) || specialBusy(o) || b.dazed || b.grabbed || (typeof diazBusy === "function" && diazBusy(b))) return;
      b.lionN++;
      b.lionT = lionRand(cfg.every);
      summonLion(b);
    });
    return;
  }
  var L = natLion, cfg = L.cfg, owner = balls[L.ownerId], o = balls[1 - L.ownerId];
  L.t += dt; L.walkT += dt;
  if (L.dazeT > 0) {
    L.dazeT -= dt;
    var dv = balls[L.dazeId];
    if (L.dazeT <= 0 && dv && dv.dazed === true) dv.dazed = false;
  }
  if ((over || !o.alive || !owner.alive) && !L.exiting && L.phase !== "summon") lionLetGo(L);

  if (L.phase === "summon") {
    if (over || !owner.alive) { natLion = null; return; }
    if (L.t >= cfg.call) lionEnter(L);
    return;
  }
  if (L.phase === "route") { tickLionRoute(L, dt); return; }
  if (L.phase === "stalk") { tickLionStalk(L, o, dt); return; }
  if (L.phase === "crouch") {
    L.face = o.x >= L.x ? 1 : -1;
    if (lionTangled(o) || lionTangled(owner)) { L.phase = "stalk"; L.t = 0; L.pounces--; return; } // they tied up: wait

    if (L.t >= LION_CROUCH) {
      // Pounce at where they are now (a little ahead if they're running).
      var lead = 0.18, px = o.x + o.vx * lead, py = o.y + o.vy * lead;
      L.phase = "leap"; L.t = 0; L.x0 = L.x; L.y0 = L.y;
      L.lx = Math.max(LION_S * 2, Math.min(W - LION_S * 2, px)); L.ly = Math.max(LION_S, Math.min(H - LION_S, py));
      L.face = L.lx >= L.x ? 1 : -1;
      playWhoosh(); playBearGrowl(0.8);
    }
    return;
  }
  if (L.phase === "leap") { tickLionLeap(L, o, dt); return; }
  if (L.phase === "maul") { tickLionMaul(L, o, dt); return; }
  if (L.phase === "roar") {
    if (L.t >= LION_ROAR) lionLeave(L);
    return;
  }
}

// Nate stops and throws his arms out (his taunt, diaz.js): here it comes.
function summonLion(b) {
  var cfg = b.char.lion;
  clearActions(b);
  b.vx = b.vy = 0;
  if (b.nd) b.nd.taunt = { t: 0, dur: cfg.call, kind: "lion" };
  natLion = { ownerId: b.id, cfg: cfg, phase: "summon", t: 0, walkT: 0, x: 0, y: 0, z: 0, face: 1, moving: false,
    route: [], pounces: 0, pops: [], words: [], dazeT: 0, dazeId: -1, dealt: 0 };
  floater(b.x, b.y - b.r - 34, "HERE, KITTY!", "crit");
  // His call for it, from Joe's recording: it cuts in on the talk channel
  // (a move's own call, like "send me location"). The bubble shows as it does
  // for any line with a clip; opts.clip is a name that isn't a clip, so say()
  // doesn't play it a second time.
  var talked = clipBuffers.nateGazelle ? cutInTalk("nateGazelle", 1) : null;
  if (!talked) withClip("nateGazelle", function () { if (natLion && natLion.phase === "summon") cutInTalk("nateGazelle", 1); });
  say(b, LION_LINE, { clip: "nateGazelleBubble" });
  crowdReact(0.8);
}

// The way in and out: through the big stands below the cage most of the
// time, otherwise the side columns, hopping the fence (as the bear does).
function lionSidePts(side, along) {
  var st = stadiumOn(), k = W / ST.A, fence = st ? ST.CAGE / 2 * k : 0, half = LION_LEN * 0.45;
  if (side === 0) {
    return { off: { x: along, y: st ? (STAGE_H - ST.AY) * k + LION_LEN * 0.5 : H + LION_LEN },
      out: { x: along, y: H + fence + LION_S * 1.6 }, inn: { x: along, y: H - LION_S * 1.6 } };
  }
  var sx = side === 1 ? -1 : 1;
  var offX = st ? (sx < 0 ? -ST.AX * k - LION_LEN * 0.6 : (STAGE_W - ST.AX) * k + LION_LEN * 0.6) : (sx < 0 ? -LION_LEN : W + LION_LEN);
  return { off: { x: offX, y: along }, out: { x: sx < 0 ? -fence - half : W + fence + half, y: along }, inn: { x: sx < 0 ? half : W - half, y: along } };
}
function lionEnter(L) {
  var r = Math.random(), side = r < 0.6 ? 0 : r < 0.8 ? 1 : 2;
  if (lionForceSide != null) side = lionForceSide;
  var along = (side === 0 ? W : H) * (0.25 + Math.random() * 0.5);
  var P = lionSidePts(side, along);
  L.phase = "route"; L.t = 0; L.x = P.off.x; L.y = P.off.y; L.face = side === 2 ? -1 : 1; L.moving = true;
  L.route = [{ x: P.out.x, y: P.out.y, fast: true }, { x: P.inn.x, y: P.inn.y, hop: true }];
  floater(Math.max(60, Math.min(W - 60, P.inn.x)), Math.min(H - 30, P.inn.y) - LION_S * 2.4, "A LION?!", "crit");
  playLionRoar("A", 1);
  crowdReact(1);
}
function tickLionRoute(L, dt) {
  var seg = L.route[0];
  if (!seg) {
    if (L.exiting) { natLion = null; return; }
    L.phase = "stalk"; L.t = 0; return;
  }
  L.moving = true;
  if (seg.hop) {
    if (seg.x0 == null) { seg.x0 = L.x; seg.y0 = L.y; seg.t = 0; playWhoosh(); }
    seg.t += dt;
    var u = Math.min(1, seg.t / LION_HOP);
    L.x = seg.x0 + (seg.x - seg.x0) * u; L.y = seg.y0 + (seg.y - seg.y0) * u;
    L.z = Math.sin(Math.PI * u) * LION_S * 2.2;
    if (Math.abs(seg.x - seg.x0) > 4) L.face = seg.x > seg.x0 ? 1 : -1;
    if (u >= 1) {
      L.z = 0; L.route.shift();
      playSlam(); crowdReact(0.7);
      if (!reduceMotion) shake = Math.max(shake, 9);
      lionDust(L.x, L.y + LION_S * 1.2, 14);
    }
    return;
  }
  var dx = seg.x - L.x, dy = seg.y - L.y, d = Math.sqrt(dx * dx + dy * dy), sp = L.cfg.speed * (seg.fast ? 2 : 1.4);
  if (d > 2) { var st = Math.min(d, sp * dt); L.x += dx / d * st; L.y += dy / d * st; if (Math.abs(dx) > 4) L.face = dx > 0 ? 1 : -1; }
  else L.route.shift();
}
// Fans shoved aside as it barges through the stands (herbdean.js).
function lionCrowdPush(f) {
  var L = natLion;
  if (!L || L.phase !== "route" || !stadiumOn() || (L.x > 0 && L.x < W && L.y > 0 && L.y < H)) return null;
  var k = ST.A / W, lx = ST.AX + L.x * k, ly = ST.AY + L.y * k;
  var dx = f.x - lx, dy = f.y - ly, d = Math.sqrt(dx * dx + dy * dy) || 1, reach = f.r * 0.85 + LION_LEN * 0.45 * k;
  if (d >= reach) return null;
  var push = reach - d;
  return { x: (dx < 0 ? -1 : 1) * push * 1.2, y: dy / d * push * 0.3 };
}

// Low and slow, straight at them. Close enough: down into the crouch.
function tickLionStalk(L, o, dt) {
  var cfg = L.cfg, nate = balls[L.ownerId];
  var dx = o.x - L.x, dy = o.y - L.y, d = Math.sqrt(dx * dx + dy * dy) || 1;
  L.moving = d > cfg.pounceRange;
  if (L.moving) {
    var st = Math.min(d - cfg.pounceRange * 0.9, cfg.speed * dt);
    L.x += dx / d * st; L.y += dy / d * st;
    L.x = Math.max(LION_S * 2, Math.min(W - LION_S * 2, L.x)); L.y = Math.max(LION_S, Math.min(H - LION_S, L.y));
  }
  if (Math.abs(dx) > 4) L.face = dx > 0 ? 1 : -1;
  if (L.t > cfg.stalk * 1.6 && L.pounces > 0) { lionLeave(L); return; } // gave up
  if (!L.moving && L.t > 0.35 && o.alive && !o.invincible && !o.bearHeld && !specialBusy(o) && !lionTangled(o) && !lionTangled(nate) && (inOrdinaryMovement(o) || o.dazed === true)) {
    L.phase = "crouch"; L.t = 0; L.pounces++;
    floater(L.x, L.y - LION_S * 2.2, "!", "note");
  }
}

// Through the air at them: pinned if it lands on them.
function tickLionLeap(L, o, dt) {
  var u = Math.min(1, L.t / LION_LEAP);
  L.x = L.x0 + (L.lx - L.x0) * u; L.y = L.y0 + (L.ly - L.y0) * u;
  L.z = Math.sin(Math.PI * u) * LION_S * 1.6;
  if (u < 0.55) return;
  var dx = o.x - L.x, dy = o.y - L.y;
  var near = dx * dx + dy * dy < (o.r + LION_BUMP) * (o.r + LION_BUMP);
  if (near && o.alive && !o.invincible && !o.bearHeld && !specialBusy(o) && !o.grabbed && !lionTangled(o)) {
    if (o.justDodged) return; // Charles teleported out from under it
    clearActions(o);
    o.bearHeld = true; o.dazed = "held"; o.vx = o.vy = 0; o.invincible = true; o.immuneCd = 99;
    L.phase = "maul"; L.t = 0; L.z = 0; L.hitT = 0.12; L.dealt = 0; L.vsId = o.id; L.pops = []; L.words = [];
    var cm = BEAR_CLOUD * 1.2; // the cloud stays inside the cage
    L.cx = Math.max(cm, Math.min(W - cm, (L.x + o.x) / 2)); L.cy = Math.max(cm, Math.min(H - cm, (L.y + o.y) / 2));
    floater(o.x, o.y - o.r - 40, "MAULED!", "crit");
    playSlam(); playBearGrowl(1);
    crowdReact(1);
    if (!reduceMotion) { shake = Math.max(shake, 16); hitStop = Math.max(hitStop, 0.08); }
    lionDust(o.x, o.y + o.r * 0.6, 12);
    return;
  }
  if (u >= 1) { // missed: lands, roars at them, and goes again
    L.z = 0;
    lionDust(L.x, L.y + LION_S * 1.2, 10);
    playSlam();
    if (o.alive) floater(o.x, o.y - o.r - 30, "ESCAPED!", "dodge");
    if (L.pounces >= L.cfg.pounces) { L.phase = "roar"; L.t = 0; playLionRoar("B", 0.9); return; }
    L.phase = "stalk"; L.t = 0;
  }
}

// Pinned: a cartoon smoke cloud goes up over the two of them (the bear's,
// khabib-bear.js) with paws, gloves and stars poking out and RAWR! CHOMP!
// bursts flying off; it clears with them seeing stars and the lion roaring.
function tickLionMaul(L, v, dt) {
  var cfg = L.cfg;
  v.x = L.cx + Math.sin(L.t * 31) * 3; v.y = L.cy + Math.cos(L.t * 27) * 3; v.vx = v.vy = 0;
  L.x = L.cx; L.y = L.cy;
  var per = cfg.maulDamage / Math.max(1, Math.round(cfg.maulTime / 0.28));
  var before = L.words.length;
  tickBearCloud(L, dt, 0.28, function () {
    if (!v.alive || L.dealt >= cfg.maulDamage) return;
    v.invincible = false;
    var d = hurt(v, Math.min(per, cfg.maulDamage - L.dealt), "igbb", L.ownerId);
    v.invincible = v.alive;
    L.dealt += Math.max(d, per);
    if (Math.random() < 0.3) playBearGrowl(0.6);
    if (!v.alive) checkEnd();
  });
  if (L.words.length > before) L.words[L.words.length - 1].txt = LION_WORDS[Math.floor(Math.random() * LION_WORDS.length)]; // lion words, not the bear's
  if (L.t >= cfg.maulTime || !v.alive) {
    v.bearHeld = false; v.invincible = false; v.immuneCd = 0;
    if (v.alive) { v.dazed = true; L.dazeT = LION_DAZE; L.dazeId = v.id; }
    else v.dazed = false;
    L.words = []; L.pops = [];
    // Steps out of the smoke beside them and roars.
    L.face = v.x >= L.cx ? 1 : -1;
    L.phase = "roar"; L.t = 0; L.x = L.cx - L.face * (LION_SIDE_H * 0.55 + v.r); L.y = L.cy;
    L.x = Math.max(LION_ROAR_H * 0.45, Math.min(W - LION_ROAR_H * 0.45, L.x));
    floater(L.x, L.y - LION_ROAR_H * 0.6, "ROAR!", "crit");
    playLionRoar("B", 1);
    crowdReact(1);
    if (!reduceMotion) shake = Math.max(shake, 10);
    checkEnd();
  }
}

// Pads back out over the nearest side of the cage.
function lionLeave(L) {
  var side = L.y > H * 0.45 ? 0 : (L.x < W / 2 ? 1 : 2);
  var along = side === 0 ? Math.max(LION_LEN * 0.5, Math.min(W - LION_LEN * 0.5, L.x)) : Math.max(LION_LEN * 0.5, Math.min(H - LION_LEN * 0.5, L.y));
  var P = lionSidePts(side, along);
  L.phase = "route"; L.t = 0; L.exiting = true; L.z = 0;
  L.route = [{ x: P.inn.x, y: P.inn.y }, { x: P.out.x, y: P.out.y, hop: true }, { x: P.off.x, y: P.off.y, fast: true }];
}
function lionLetGo(L) {
  balls.forEach(function (f) {
    if (f.bearHeld && L.phase === "maul") { f.bearHeld = false; f.invincible = false; f.immuneCd = 0; if (f.dazed === "held") f.dazed = false; }
  });
  lionLeave(L);
}

function lionDust(x, y, n) {
  for (var i = 0; i < n && !reduceMotion; i++) {
    var a = i / n * Math.PI * 2;
    particles.push({ x: x + Math.cos(a) * LION_S, y: y, vx: Math.cos(a) * 180, vy: Math.sin(a) * 50 - 30, life: 0.45, max: 0.45, size: 3 + Math.random() * 4, color: "#d8cdb5" });
  }
}

// ---------------------------------------------------------------- sound

// Joe's lion recording: "A" the long roar (entrance), "B" the second one
// (over a mauled opponent, or giving up). Sound effects, not voice lines, so
// they stay off the talk channel. A growl stands in until they've decoded.
function playLionRoar(which, gain) {
  try {
    var name = which === "B" ? "lionRoarB" : "lionRoarA";
    if (!playClip(name, gain || 1)) { withClip(name); playBearGrowl(gain || 1); }
  } catch (e) { /* never let audio break the game */ }
}

// ---------------------------------------------------------------- drawing

// Over the fighters (draw.js): the lion, or the smoke cloud it's mauling in.
function drawNateLion() {
  var L = natLion;
  if (!L || L.phase === "summon") return;
  var now = performance.now() / 1000;
  if (L.phase === "maul") { drawBearCloud(L, now); return; }
  ctx.save();
  if (L.phase === "roar") {
    // Joe's roaring lion, facing whoever it just mauled.
    var k = 1 + 0.04 * Math.sin(now * 30) * Math.max(0, 1 - L.t / 1.2);
    lionShadow(L.x, L.y + LION_ROAR_H * 0.42, 0.8);
    drawLionPic(lionRoarImg, LION_ROAR_ASPECT, L.x, L.y - LION_ROAR_H * 0.05, LION_ROAR_H * k, -L.face, 0);
  } else {
    var h = LION_SIDE_H, sx = 1, sy = 1, rot = 0, bob = 0, wig = 0;
    if (L.phase === "crouch") { sy = 0.8; sx = 1.06; wig = Math.sin(now * 26) * 2.5; } // low, the back end wiggling (the tell)
    else if (L.phase === "leap") { rot = -0.22 * Math.cos(Math.PI * Math.min(1, L.t / LION_LEAP)); sx = 1.12; sy = 0.92; } // stretched out through the air
    else if (L.moving) { var w = Math.sin(L.walkT * 8); bob = Math.abs(w) * 2.5; rot = w * 0.03; }
    lionShadow(L.x, L.y + h * 0.45, Math.max(0.4, 1 - (L.z || 0) / (LION_S * 4)));
    ctx.save();
    ctx.translate(L.x + wig, L.y - (L.z || 0) - bob + h * 0.5 * (1 - sy));
    ctx.scale(sx, sy);
    drawLionPic(lionSideImg, LION_SIDE_ASPECT, 0, 0, h, L.face, rot);
    ctx.restore();
  }
  ctx.restore();
}
function lionShadow(x, y, k) {
  ctx.fillStyle = "rgba(0,0,0," + (0.2 * k).toFixed(3) + ")";
  ctx.beginPath(); ctx.ellipse(x, y, LION_SIDE_H * 0.55 * k, LION_SIDE_H * 0.09 * k, 0, 0, Math.PI * 2); ctx.fill();
}
// One of Joe's pictures centred on (x, y), `h` tall; dir 1 = as drawn
// (the standing lion faces right, the roaring one left), -1 mirrored.
function drawLionPic(img, aspect, x, y, h, dir, rot) {
  if (!(img.complete && img.naturalWidth)) return;
  var w = h * aspect;
  ctx.save();
  ctx.translate(x, y); ctx.rotate(rot || 0); ctx.scale(dir < 0 ? -1 : 1, 1);
  ctx.drawImage(img, -w / 2, -h / 2, w, h);
  ctx.restore();
}
