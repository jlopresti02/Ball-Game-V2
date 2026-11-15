// Nate Diaz's lion (Joe, 2026-11-15). Every so often Nate stops, throws his
// arms out wide (his taunt, diaz.js) and summons a lion. It roars, barges
// through the crowd and hops the cage like Khabib's bear (khabib-bear.js), then
// stalks his opponent, crouches with its tail twitching (the tell) and
// pounces. If it lands on them it pins them and mauls them: claws, bites,
// slashes and fur flying, then a roar over them while they see stars, and it
// pads off out of the cage. If they get out of the way it lands, roars and
// stalks them again, a few pounces at most. It never goes after Nate.
// Nate's line as he summons it: "Who the [BLEEP] knows what a gazelle is?"
// (silent until the real clip is in voice-clips.js).
// The maul victim is held with the bear's flag (bearHeld), so every other
// move already leaves them alone while they're pinned.
// Config: char.lion. Drawn in code (drawLionSide).
"use strict";

var LION_S = RADIUS * 0.85;     // drawing unit: the body is ~3.8 of these long, plus the head
var LION_LEN = LION_S * 5.2;    // nose to tail end, side on
var LION_BUMP = RADIUS * 1.25;  // how close the pounce has to land
var LION_LINE = "Who the [BLEEP] knows what a gazelle is?"; // Nate Diaz (clip still to come)
var LION_WORDS = ["RAWR!", "CHOMP!", "SWIPE!", "SLASH!", "GRRR!", "SCRATCH!"];
var LION_HOP = 0.6, LION_CROUCH = 0.55, LION_LEAP = 0.42, LION_ROAR = 1.1, LION_DAZE = 1.3;

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
  L.marks = L.marks.filter(function (m) { m.t += dt; return m.t < 0.35; });
  L.words = L.words.filter(function (w) { w.t += dt; return w.t < 0.5; });
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
    route: [], pounces: 0, marks: [], words: [], dazeT: 0, dazeId: -1, dealt: 0 };
  floater(b.x, b.y - b.r - 34, "HERE, KITTY!", "crit");
  if (canSay(b)) say(b, LION_LINE);
  playLionRoar(0.7);
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
  playLionRoar(1);
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
    L.phase = "maul"; L.t = 0; L.z = 0; L.hitT = 0.12; L.dealt = 0;
    L.cx = o.x; L.cy = o.y;
    floater(o.x, o.y - o.r - 40, "MAULED!", "crit");
    playSlam(); playLionRoar(0.9);
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
    if (L.pounces >= L.cfg.pounces) { L.phase = "roar"; L.t = 0; playLionRoar(0.9); return; }
    L.phase = "stalk"; L.t = 0;
  }
}

// Pinned: the claws and teeth, then it stands over them and roars.
function tickLionMaul(L, v, dt) {
  var cfg = L.cfg;
  v.x = L.cx + Math.sin(L.t * 37) * 2.5; v.y = L.cy + Math.cos(L.t * 29) * 2.5; v.vx = v.vy = 0;
  L.x = L.cx - L.face * LION_S * 2.45; L.y = L.cy + LION_S * 0.15; // reared up beside them, paws raking over them
  var hits = Math.max(1, Math.round(cfg.maulTime / 0.3)), per = cfg.maulDamage / hits;
  L.hitT -= dt;
  if (L.hitT <= 0) {
    L.hitT = 0.3 * (0.75 + Math.random() * 0.5);
    L.swipe = (L.swipe || 0) + 1;
    var a = -0.9 + (Math.random() - 0.5) * 0.9;
    L.marks.push({ x: v.x + (Math.random() - 0.5) * v.r * 0.8, y: v.y + (Math.random() - 0.5) * v.r * 0.8, ang: a, t: 0 });
    var wa = Math.random() * Math.PI * 2;
    L.words.push({ txt: LION_WORDS[Math.floor(Math.random() * LION_WORDS.length)], x: v.x + Math.cos(wa) * v.r * 1.9, y: v.y - v.r * 0.4 + Math.sin(wa) * v.r * 1.2, t: 0, rot: (Math.random() - 0.5) * 0.6 });
    if (v.alive && L.dealt < cfg.maulDamage) {
      v.invincible = false;
      var d = hurt(v, Math.min(per, cfg.maulDamage - L.dealt), "igbb", L.ownerId);
      v.invincible = v.alive;
      L.dealt += Math.max(d, per);
      v.flash = 0.08;
      if (!v.alive) checkEnd();
    }
    playPunch(10 + Math.random() * 16);
    if (Math.random() < 0.35) playBearGrowl(0.6);
    if (!reduceMotion) shake = Math.max(shake, 6);
    for (var i = 0; i < 5 && !reduceMotion; i++) {
      var pa = Math.random() * Math.PI * 2;
      particles.push({ x: v.x, y: v.y, vx: Math.cos(pa) * 160, vy: Math.sin(pa) * 120 - 40, life: 0.35, max: 0.35, size: 2 + Math.random() * 3, color: i % 2 ? "#c8873a" : "#e8d2a0" });
    }
  }
  if (L.t >= cfg.maulTime || !v.alive) {
    v.bearHeld = false; v.invincible = false; v.immuneCd = 0;
    if (v.alive) { v.dazed = true; L.dazeT = LION_DAZE; L.dazeId = v.id; }
    else v.dazed = false;
    L.phase = "roar"; L.t = 0; L.x = L.cx - L.face * (LION_S * 1.6 + v.r); L.y = L.cy;
    L.x = Math.max(LION_S * 2, Math.min(W - LION_S * 2, L.x));
    floater(L.x, L.y - LION_S * 2.6, "ROAR!", "crit");
    playLionRoar(1);
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

// A lion's roar, synthesized (a stand-in until there's a real recording):
// a low growling saw swelling up through a formant, with breath noise.
function playLionRoar(gain) {
  try {
    var ac = getAudioCtx();
    if (!ac) return;
    if (ac.state === "suspended") ac.resume();
    var t = ac.currentTime, dur = 1.5, g0 = gain || 1;
    var out = ac.createGain();
    out.gain.setValueAtTime(0.0001, t);
    out.gain.exponentialRampToValueAtTime(0.55 * g0, t + 0.18);
    out.gain.setValueAtTime(0.55 * g0, t + 0.7);
    out.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    out.connect(ac.destination);
    var osc = ac.createOscillator(), osc2 = ac.createOscillator();
    osc.type = "sawtooth"; osc2.type = "sawtooth";
    osc.frequency.setValueAtTime(70, t); osc.frequency.linearRampToValueAtTime(115, t + 0.35); osc.frequency.exponentialRampToValueAtTime(55, t + dur);
    osc2.frequency.setValueAtTime(73, t); osc2.frequency.linearRampToValueAtTime(121, t + 0.35); osc2.frequency.exponentialRampToValueAtTime(57, t + dur);
    var trem = ac.createOscillator(), tg = ac.createGain(); // the rattle in it
    trem.frequency.value = 23; tg.gain.value = 18;
    trem.connect(tg); tg.connect(osc.frequency); tg.connect(osc2.frequency);
    var bp = ac.createBiquadFilter(); bp.type = "bandpass"; bp.Q.value = 2.2;
    bp.frequency.setValueAtTime(380, t); bp.frequency.linearRampToValueAtTime(720, t + 0.4); bp.frequency.linearRampToValueAtTime(300, t + dur);
    var lp = ac.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 1400;
    osc.connect(bp); osc2.connect(bp); bp.connect(lp); lp.connect(out);
    // Breath: filtered noise under it.
    var nb = ac.createBuffer(1, Math.floor(ac.sampleRate * dur), ac.sampleRate), nd = nb.getChannelData(0);
    for (var i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
    var ns = ac.createBufferSource(); ns.buffer = nb;
    var nf = ac.createBiquadFilter(); nf.type = "bandpass"; nf.frequency.value = 900; nf.Q.value = 0.8;
    var ng = ac.createGain(); ng.gain.value = 0.35;
    ns.connect(nf); nf.connect(ng); ng.connect(out);
    [osc, osc2, trem, ns].forEach(function (n) { n.start(t); n.stop(t + dur + 0.05); });
  } catch (e) { /* never let audio break the game */ }
}

// ---------------------------------------------------------------- drawing

// Over the fighters (draw.js): the lion, and its claw marks and words.
function drawNateLion() {
  var L = natLion;
  if (!L || L.phase === "summon") return;
  var now = performance.now() / 1000;
  ctx.save();
  if (L.phase === "maul") {
    var v = balls[L.dazeId >= 0 && L.phase !== "maul" ? L.dazeId : 1 - L.ownerId];
    // On top of them: reared up over them, paws raking down.
    lionShadow(L.x, L.cy + LION_S * 1.1, 1);
    drawLionSide(L.x, L.y, L.face, "maul", now, L);
    drawLionMarks(L);
  } else {
    var crouch = L.phase === "crouch", pose = L.phase === "leap" ? "pounce" : L.phase === "roar" ? "roar" : crouch ? "crouch" : (L.moving ? "walk" : "stand");
    lionShadow(L.x, L.y + LION_S * 1.15, Math.max(0.4, 1 - (L.z || 0) / (LION_S * 4)));
    drawLionSide(L.x, L.y - (L.z || 0), L.face, pose, now, L);
    if (L.phase === "roar") lionRoarWaves(L, now);
    drawLionMarks(L);
  }
  ctx.restore();
}
function lionShadow(x, y, k) {
  ctx.fillStyle = "rgba(0,0,0," + (0.2 * k).toFixed(3) + ")";
  ctx.beginPath(); ctx.ellipse(x, y, LION_S * 2.3 * k, LION_S * 0.32 * k, 0, 0, Math.PI * 2); ctx.fill();
}
function lionRoarWaves(L, now) {
  var hx = L.x + L.face * LION_S * 2.5, hy = L.y - LION_S * 0.8;
  ctx.save();
  ctx.strokeStyle = "rgba(255,255,255,0.85)"; ctx.lineWidth = 3; ctx.lineCap = "round";
  for (var i = 0; i < 3; i++) {
    var u = ((now * 2.2 + i / 3) % 1), rr = LION_S * (0.5 + u * 1.6);
    ctx.globalAlpha = 1 - u;
    ctx.beginPath(); ctx.arc(hx, hy, rr, L.face > 0 ? -0.6 : Math.PI - 0.6, L.face > 0 ? 0.6 : Math.PI + 0.6); ctx.stroke();
  }
  ctx.restore();
}
// Claw slashes on them and the words flying off.
function drawLionMarks(L) {
  L.marks.forEach(function (m) {
    var u = m.t / 0.35, len = RADIUS * 0.9 * Math.min(1, u * 4);
    ctx.save();
    ctx.globalAlpha = u > 0.6 ? (1 - u) / 0.4 : 1;
    ctx.translate(m.x, m.y); ctx.rotate(m.ang);
    for (var k = -1; k <= 1; k++) {
      ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 6; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(-len / 2, k * 9); ctx.quadraticCurveTo(0, k * 9 - 6, len / 2, k * 9); ctx.stroke();
      ctx.strokeStyle = "#d2141e"; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(-len / 2, k * 9); ctx.quadraticCurveTo(0, k * 9 - 6, len / 2, k * 9); ctx.stroke();
    }
    ctx.restore();
  });
  L.words.forEach(function (w) {
    var u = w.t / 0.5, sc = u < 0.25 ? 0.5 + 2.4 * u : 1.1 - 0.1 * u;
    ctx.save();
    ctx.globalAlpha = u > 0.75 ? (1 - u) / 0.25 : 1;
    ctx.translate(w.x, w.y - u * 10); ctx.rotate(w.rot); ctx.scale(sc, sc);
    ctx.fillStyle = "#f0a020"; ctx.strokeStyle = "#2a1208"; ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (var j = 0; j < 16; j++) { var ba = j / 16 * Math.PI * 2, br = j % 2 ? 15 : 27; ctx.lineTo(Math.cos(ba) * br * 1.5, Math.sin(ba) * br); }
    ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.font = "900 16px 'Arial Black', Impact, sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.lineWidth = 5; ctx.strokeStyle = "#2a1208"; ctx.strokeText(w.txt, 0, 1);
    ctx.fillStyle = "#fff3c4"; ctx.fillText(w.txt, 0, 1);
    ctx.restore();
  });
}

// The lion side on, centred on its body at (x, y), facing right when face 1.
// pose: walk, stand, crouch, pounce, roar, maul.
var LION_FUR = "#d9a05b", LION_BELLY = "#efcf95", LION_MANE = "#8a4a1c", LION_MANE_DK = "#5c2c0e", LION_INK = "#2e1a0a";
function drawLionSide(x, y, face, pose, now, L) {
  var s = LION_S, walk = L ? L.walkT : now;
  ctx.save();
  ctx.translate(x, y); ctx.scale(face < 0 ? -1 : 1, 1);
  ctx.lineJoin = "round"; ctx.lineCap = "round";
  var bodyY = 0, tilt = 0, legSwing = 0, frontReach = 0, backReach = 0, legLen = 1.25, wig = 0, mouth = 0, rake = 0;
  if (pose === "walk") { legSwing = Math.sin(walk * 9) * 0.38; bodyY = -Math.abs(Math.sin(walk * 9)) * s * 0.06; }
  else if (pose === "stand") { legSwing = 0; }
  else if (pose === "crouch") { bodyY = s * 0.32; legLen = 0.9; wig = Math.sin(now * 26) * s * 0.08; tilt = 0.08; }
  else if (pose === "pounce") { tilt = -0.18; frontReach = -1.15; backReach = 1.0; }
  else if (pose === "roar") { tilt = -0.12; mouth = 1; bodyY = -s * 0.05; }
  else if (pose === "maul") { tilt = -0.32; mouth = 0.55 + 0.45 * Math.abs(Math.sin(now * 12)); rake = Math.sin(now * 20); }
  ctx.translate(0, bodyY); ctx.rotate(tilt);
  var lw = Math.max(2, s * 0.08);
  ctx.strokeStyle = LION_INK; ctx.lineWidth = lw;

  // Tail: curls up behind, the dark tuft on the end flicking.
  var flick = Math.sin(now * (pose === "crouch" ? 14 : 3)) * 0.35;
  ctx.save();
  ctx.lineWidth = s * 0.2; ctx.strokeStyle = LION_INK;
  var tx0 = -1.8 * s + wig, ty0 = -0.25 * s;
  var tx1 = -2.7 * s + wig, ty1 = (-0.9 + flick) * s;
  ctx.beginPath(); ctx.moveTo(tx0, ty0); ctx.quadraticCurveTo(-2.6 * s + wig, 0.2 * s, tx1, ty1); ctx.stroke();
  ctx.lineWidth = s * 0.12; ctx.strokeStyle = LION_FUR;
  ctx.beginPath(); ctx.moveTo(tx0, ty0); ctx.quadraticCurveTo(-2.6 * s + wig, 0.2 * s, tx1, ty1); ctx.stroke();
  ctx.fillStyle = LION_MANE_DK; ctx.strokeStyle = LION_INK; ctx.lineWidth = lw * 0.8;
  ctx.beginPath(); ctx.ellipse(tx1, ty1 - s * 0.1, s * 0.2, s * 0.3, -0.4, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.restore();

  // Legs: far pair first (darker), body, then the near pair.
  function leg(px, swing, reach, far, front) {
    var ang = swing + reach;
    var len = legLen * s;
    ctx.save();
    ctx.translate(px, 0.35 * s);
    if (front && pose === "maul") ang = -1.3 + rake * (far ? -0.5 : 0.5); // raking down at them
    ctx.rotate(ang);
    ctx.fillStyle = far ? shadeHex(LION_FUR, -0.18) : LION_FUR; ctx.strokeStyle = LION_INK; ctx.lineWidth = lw;
    ctx.beginPath();
    ctx.moveTo(-s * 0.26, -s * 0.2); ctx.lineTo(-s * 0.2, len); ctx.lineTo(s * 0.2, len); ctx.lineTo(s * 0.28, -s * 0.2); ctx.closePath();
    ctx.fill(); ctx.stroke();
    // Paw, claws out when it's attacking.
    ctx.beginPath(); ctx.ellipse(s * 0.06, len, s * 0.3, s * 0.18, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    if (pose === "pounce" || pose === "maul") {
      ctx.strokeStyle = "#fbf6e8"; ctx.lineWidth = Math.max(1.5, s * 0.05);
      for (var c = -1; c <= 1; c++) { ctx.beginPath(); ctx.moveTo(s * (0.2 + c * 0.1), len + s * 0.1); ctx.lineTo(s * (0.3 + c * 0.12), len + s * 0.32); ctx.stroke(); }
    }
    ctx.restore();
  }
  leg(-1.2 * s + wig, -legSwing, backReach, true, false);
  leg(1.15 * s, legSwing, frontReach, true, true);

  // Body
  var g = ctx.createLinearGradient(0, -0.85 * s, 0, 0.85 * s);
  g.addColorStop(0, shadeHex(LION_FUR, 0.1)); g.addColorStop(0.65, LION_FUR); g.addColorStop(1, LION_BELLY);
  ctx.fillStyle = g; ctx.strokeStyle = LION_INK; ctx.lineWidth = lw;
  ctx.beginPath(); ctx.ellipse(wig * 0.5, 0, 1.95 * s, 0.82 * s, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  // haunch and shoulder lines
  ctx.lineWidth = lw * 0.6; ctx.strokeStyle = shadeHex(LION_FUR, -0.35);
  ctx.beginPath(); ctx.arc(-1.15 * s + wig, 0.05 * s, 0.62 * s, -2.2, -0.5); ctx.stroke();

  leg(-1.35 * s + wig, legSwing, backReach, false, false);
  leg(1.0 * s, -legSwing, frontReach, false, true);

  // Head and mane at the front.
  var hx = 2.0 * s, hy = -0.62 * s;
  ctx.save();
  ctx.translate(hx, hy);
  if (pose === "roar" || pose === "maul") ctx.rotate(-0.15);
  // Mane: a shaggy ring of tufts.
  ctx.fillStyle = LION_MANE_DK; ctx.strokeStyle = LION_INK; ctx.lineWidth = lw;
  ctx.beginPath();
  var n = 14;
  for (var i = 0; i <= n; i++) {
    var a = i / n * Math.PI * 2, rr = (i % 2 ? 0.92 : 1.12) * s;
    var px = Math.cos(a) * rr - s * 0.18, py = Math.sin(a) * rr * 0.95;
    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  }
  ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = LION_MANE;
  ctx.beginPath(); ctx.arc(-s * 0.12, 0, s * 0.82, 0, Math.PI * 2); ctx.fill();
  // Ears poking out of the mane.
  ctx.fillStyle = LION_FUR; ctx.lineWidth = lw * 0.8;
  [-0.5, 0.25].forEach(function (ex) { ctx.beginPath(); ctx.arc(ex * s, -0.62 * s, s * 0.17, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); });
  // Face, side on: forehead, long muzzle out front.
  ctx.fillStyle = LION_FUR; ctx.lineWidth = lw;
  ctx.beginPath(); ctx.ellipse(s * 0.12, -s * 0.05, s * 0.55, s * 0.5, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  // Jaw: dropped open to roar or bite.
  var jaw = mouth * 0.35 * s;
  ctx.fillStyle = "#7a1414";
  if (mouth > 0) { ctx.beginPath(); ctx.moveTo(s * 0.35, s * 0.12); ctx.lineTo(s * 0.98, s * 0.06); ctx.lineTo(s * 0.92, s * 0.18 + jaw); ctx.lineTo(s * 0.35, s * 0.26 + jaw * 0.6); ctx.closePath(); ctx.fill(); }
  ctx.fillStyle = LION_BELLY;
  ctx.beginPath(); ctx.ellipse(s * 0.66, s * 0.24 + jaw, s * 0.3, s * 0.12, 0.05, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); // lower jaw
  ctx.beginPath(); ctx.ellipse(s * 0.66, s * 0.03, s * 0.36, s * 0.2, -0.05, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); // muzzle
  if (mouth > 0) { // fangs
    ctx.fillStyle = "#ffffff"; ctx.strokeStyle = LION_INK; ctx.lineWidth = Math.max(1, lw * 0.4);
    [[0.82, 1], [0.55, 1]].forEach(function (f) {
      ctx.beginPath(); ctx.moveTo(f[0] * s, s * 0.18); ctx.lineTo((f[0] + 0.07) * s, s * 0.18); ctx.lineTo((f[0] + 0.03) * s, s * 0.18 + s * 0.14); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(f[0] * s, s * 0.14 + jaw); ctx.lineTo((f[0] + 0.07) * s, s * 0.14 + jaw); ctx.lineTo((f[0] + 0.035) * s, s * 0.02 + jaw); ctx.closePath(); ctx.fill(); ctx.stroke();
    });
  }
  // Nose, eye with a mean brow, whisker dots.
  ctx.fillStyle = "#3a1d12";
  ctx.beginPath(); ctx.moveTo(s * 0.92, -s * 0.1); ctx.lineTo(s * 1.04, -s * 0.06); ctx.lineTo(s * 0.98, s * 0.04); ctx.closePath(); ctx.fill();
  ctx.fillStyle = "#1a0e06";
  ctx.beginPath(); ctx.ellipse(s * 0.36, -s * 0.2, s * 0.07, s * 0.09, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#ffd23f"; ctx.beginPath(); ctx.arc(s * 0.37, -s * 0.22, s * 0.025, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = LION_INK; ctx.lineWidth = lw * 0.9;
  ctx.beginPath(); ctx.moveTo(s * 0.2, -s * 0.36); ctx.lineTo(s * 0.52, -s * 0.28); ctx.stroke();
  ctx.fillStyle = shadeHex(LION_FUR, -0.4);
  [[0.62, 0.02], [0.7, 0.07], [0.56, 0.08]].forEach(function (p) { ctx.beginPath(); ctx.arc(p[0] * s, p[1] * s, s * 0.025, 0, Math.PI * 2); ctx.fill(); });
  ctx.restore();

  ctx.restore();
}
