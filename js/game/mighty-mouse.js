// Demetrious "Mighty Mouse" Johnson (Christian, 2026-11-12). Flyweight, the
// smallest fighter in the game, on the Grappler base. Every mechanic below
// has its own block under "mightyMouse" in his character file; take a block
// out and that mechanic is off.
//
// Game film  (gameFilm) for the first `time` seconds he studies them: a
//            SCOUTING notepad under him fills up while he keeps his distance
//            and doesn't shoot. Then he reads their numbers and fights their
//            worst defence ("GAME PLAN: ..."):
//              TAKEDOWNS  their takedown defence (sprawl, plus a guillotine
//                         off the shot) is lower than their block: he shoots
//                         every time he's close, quicker and from further out.
//              KICKS      they're a Grappler: he stays outside their grab and
//                         kicks (their kick if he copied one, else `kicks.kick`).
//              STRIKES    their block is the weak spot: faster, harder punches
//                         (`strikes`), and he only shoots `strikes.shotChance`%.
// Copycat    (copycat) `delay` seconds after the game plan he copies their
//            normal attacks: punch (or Ilia's building combos), kick,
//            haymaker, projectile, at `scale` of their damage, thrown with
//            his own gloves.
// Cardio     (cardio) every `every` seconds (up to `max` times) he gets
//            faster (`speed`) and attacks faster (`rate`), and they tire:
//            `tire` slower each time, down to `tireMin` (slowdown.js), and
//            dripping sweat.
// Suplex to armbar  (finisher) once they're under `at` of their health, his
//            next takedown that lands is a back suplex he turns into an
//            armbar in mid-air (his finish on Ray Borg, UFC 216): up over his
//            head, he swings his legs over the arm, they crash down together
//            (`slamDamage`) and he cranks it. The armbar's tug-of-war
//            (armbar.js) decides it: they tap `tapBase`% plus up to
//            `tapLowHp`% more the more hurt they are. After an escape he
//            can't go for it again for `cooldown` seconds. While it's on he
//            heads straight for them.
// Mimic      his special (special.move "mimic"): he copies their special at
//            `power` of its damage, in his colours (a purple aura round him).
//            Copies IGBB, Father's Plan and Chair Shot (no ladder): those only
//            read the fighter's own special block. Every other special keeps
//            reading its owner's own state (Jon's looks, Pereira's arrow, the
//            referee, the Brazil arena...), so against those, or a fighter
//            with no special, he does his own: he crouches for the level
//            change ("MIGHTY MOUSE!", the tell), shoots across the cage, and
//            if the shot gets through their defences it's the suplex into the
//            mid-air armbar at any health (the special's `tapBase`,
//            `tapLowHp`, `slamDamage`).
// Voice lines (lines) speech bubbles (speech.js), real quotes from the
//            backlog: at the start, after he slips a strike (`dodge`%), when
//            they miss or he sprawls their shot (`miss`%), rarely after he
//            wins a scramble (`borg`%), two during the finisher, and after a
//            win, when he turns his back to show the kanji (look.backView).
// The mouse head (look.headwear "mouse") and his back are drawn in
// mighty-mouse-art.js. The finisher runs on b.mmFin; the game plan, copycat
// and cardio on b.mm; his own special on b.igbb (move "mimic").
"use strict";

SPECIAL_MOVES.mimic = "Mimic"; // (special.js)

var MM_LINES = {
  start: "Nobody has been able to do what I've been able to do.",
  dodge: "I'm not in the business of taking hits and concussions. That [BLEEP] is overrated.",
  miss: "What the [BLEEP] is this? Is this amateur hour?",
  borg: "Ray Borg was running his mouth, saying my scrambling game was garbage.", // names Borg, who isn't in the game: never said (isRayBorg)
  fin1: "I'm here to make a fool of you.",
  fin2: "Throw you like a bag of potatoes and break your arm.",
  win: "It was like trying to fight a muskrat."
};
var MM_PLAN_NAMES = { takedowns: "TAKEDOWNS", kicks: "KICKS", strikes: "STRIKES" };
var MM_COPIES = { igbb: true, fathersplan: true, chairshot: true }; // specials he can copy safely
var MF_LOCK = 0.32, MF_LIFT = 0.42, MF_SWITCH = 0.36, MF_DROP = 0.2; // the suplex into the armbar
var MF_LINE2 = 0.9;      // into the armbar before the second bubble
var MM_TELL = 0.6;       // his own special: crouched for the level change
var MM_SHOT_SPEED = 860, MM_SHOT_GIVEUP = 2.6;
var MM_PAD_SHOW = 3;     // the game plan stays up on the notepad
var mmClock = 0;
var mmSweat = [];        // drops flying off whoever's tiring

function mmCfg(b) { return b && b.char && b.char.mightyMouse; }
function mmClone(o) { return o == null ? o : JSON.parse(JSON.stringify(o)); }
function mmRound(x) { return Math.max(1, Math.round(x)); }

// From startMatchSeeded.
function resetMightyMouse() { mmClock = 0; mmSweat = []; }

// From makeBall.
function initMightyMouse(b) {
  b.mm = null; b.mmFin = null; b.mmTired = 0; b.mmForce = null;
  var cfg = mmCfg(b);
  if (!cfg && !(b.char.special && b.char.special.move === "mimic")) return;
  // His own copy of himself: the game plan and the copycat change it mid-fight.
  b.char = mmClone(b.char);
  cfg = mmCfg(b) || {};
  var ch = b.char;
  b.mm = {
    t: 0, phase: cfg.gameFilm ? "scout" : "plan", plan: null, note: "", padT: 0,
    copyAt: cfg.gameFilm || !cfg.copycat ? null : cfg.copycat.delay, copied: null, copyFx: 0,
    cardio: 0, cardioT: 0, speed0: b.baseSpeed, atk0: b.atkRate,
    finCd: 0, own: { grapple: mmClone(ch.grapple), special: mmClone(ch.special), look: ch.look },
    atk: { punch: mmClone(ch.punch), kick: ch.hasKick ? mmClone(ch.kick) : null, swing: ch.hasSwing ? mmClone(ch.swing) : null,
      proj: ch.hasProjectile ? mmClone(ch.proj) : null, ramp: mmClone(ch.ramp) },
    lineGap: 2, said: {}, winT: 0, hpPrev: MAX_HP, wasSprawl: false, mimic: null
  };
  mouseTactics(b, null, cfg);
}

// ---------------------------------------------------------------- every frame

// From update().
function tickMightyMouse(dt) {
  mmClock += dt;
  tickMouseSweat(dt);
  balls.forEach(function (b) {
    if (!b.mm) return;
    var other = balls[1 - b.id], cfg = mmCfg(b) || {}, m = b.mm;
    mouseUntangle(b); mouseUntangle(other);
    tickMimicRestore(b, dt);
    tickMouseLines(b, other, cfg, dt);
    if (!started || over || !b.alive) return;
    m.t += dt;
    m.finCd = Math.max(0, m.finCd - dt);
    m.padT += dt;
    m.copyFx = Math.max(0, m.copyFx - dt);
    var gf = cfg.gameFilm;
    if (m.phase === "scout") {
      if (!m.scoutSaid) { m.scoutSaid = true; playScoutPencil(); } // (the notepad says SCOUTING)
      if (m.t >= gf.time) setGamePlan(b, other, cfg);
    }
    if (cfg.copycat && m.copyAt != null && m.copied == null && m.t >= m.copyAt && canCopy(b)) mouseCopycat(b, other, cfg.copycat);
    tickCardio(b, other, cfg, dt);
    mouseTactics(b, other, cfg);
    mouseSteer(b, other, dt, cfg);
  });
}

// A fighter can't hold on and be held at once. A counter-grab in the middle of
// the other fighter's turn can leave each of them grabbing the other (one
// carrying, one suplexing), and then neither ever moves again: the one being
// thrown lets go.
function mouseUntangle(x) {
  if (!x.grapple || !(x.grappled || x.choked)) return;
  var t = balls[x.grapple.targetId];
  if (t && !t.grapple) t.grappled = false;
  x.grapple = null;
}

// Busy with his finisher: the suplex and the mid-air armbar (the armbar
// itself then runs in armbar.js). From the abilities loop.
function updateMightyMouse(self, other, dt) {
  if (self.mmFin) return runMouseFinisher(self, other, self.mmFin, dt);
  return false;
}

// Not in the middle of something the copy would get in the way of.
function canCopy(b) { return !b.punch && !b.kick && !b.swing && !b.throwAnim && !b.igbb && !b.mmFin; }

// Close enough to finish it: the finisher is on and they're hurt enough.
function mouseFinishing(b, other, cfg) {
  var fin = cfg.finisher;
  return !!(fin && other && other.alive && b.mm.finCd <= 0 && b.mm.phase !== "scout" && other.hp <= fin.at * MAX_HP);
}

// Sets his grappling for the moment: studying, the game plan, or hunting for
// the finish.
function mouseTactics(b, other, cfg) {
  var m = b.mm, g = b.char.grapple, o = m.own.grapple, gf = cfg.gameFilm || {};
  var finishing = mouseFinishing(b, other, cfg);
  var shot = o.shotChance, reach = o.reach, cd = o.cooldown, vsg = o.vsGrapplerChance, sprawl = o.sprawlChance;
  if (m.plan === "kicks" && gf.kicks && gf.kicks.sprawl) sprawl = Math.min(95, o.sprawlChance + gf.kicks.sprawl); // staying outside: harder to take down
  if (finishing) { shot = null; reach = o.reach + 10; vsg = 100; }
  else if (m.phase === "scout") shot = 0;
  else if (m.plan === "takedowns" && gf.takedowns) { shot = null; reach = o.reach + gf.takedowns.reach; cd = o.cooldown * gf.takedowns.cooldown; vsg = 100; }
  else if (m.plan === "strikes" && gf.strikes) shot = gf.strikes.shotChance;
  else if (m.plan === "kicks") shot = 0;
  g.shotChance = shot; g.reach = reach; g.cooldown = cd; g.vsGrapplerChance = vsg; g.sprawlChance = sprawl;
  m.finishing = finishing;
}

// Studying them or fighting from outside: he keeps away. Striking: he presses
// in. Hunting the finish: he heads straight for them.
function mouseSteer(b, other, dt, cfg) {
  var m = b.mm;
  if (!inOrdinaryMovement(b) || b.dizzy || b.angry || !other.alive) return;
  var dx = other.x - b.x, dy = other.y - b.y, d = Math.sqrt(dx * dx + dy * dy) || 1;
  var want, rate;
  if (m.finishing) { want = Math.atan2(dy, dx); rate = 3.2; }
  else if (m.plan === "strikes" && d > b.r + other.r + 70) { want = Math.atan2(dy, dx); rate = 1.4; } // pressing in to land his hands
  else if (m.phase === "scout" || m.plan === "kicks") {
    var keep = b.r + other.r + (m.plan === "kicks" && b.char.hasKick ? b.char.kick.reach * 0.7 : 60);
    if (d < keep) { want = Math.atan2(-dy, -dx); rate = 4; }
    else if (m.plan === "kicks" && d > keep + 90) { want = Math.atan2(dy, dx); rate = 1.5; }
    else return;
  } else return;
  var s = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
  if (s < 1) return;
  var cur = Math.atan2(b.vy, b.vx), diff = Math.atan2(Math.sin(want - cur), Math.cos(want - cur));
  var turn = Math.max(-rate * dt, Math.min(rate * dt, diff));
  b.vx = Math.cos(cur + turn) * s; b.vy = Math.sin(cur + turn) * s;
}

// ---------------------------------------------------------------- game film

// Reads the opponent's numbers: their worst defence and how to attack it.
function mouseRead(other) {
  var c = other.baseChar || other.char, g = c.hasGrapple && c.grapple;
  if (c.base === "Grappler" || (g && g.shotChance == null)) return { plan: "kicks", note: "GRAPPLER" };
  var sprawl = g ? (g.sprawlChance || 0) : 0;
  if (c.tdd && c.tdd.sprawlChance) sprawl = Math.max(sprawl, c.tdd.sprawlChance);
  var guil = c.hasGuillotine && c.guillotine ? (c.guillotine.chance || 0) : 0;
  var td = Math.min(100, sprawl + guil);
  var block = (c.blockChance || 0) + (other.blockBonus || 0);
  if (td <= block) return { plan: "takedowns", note: (guil ? "TD DEF " : "SPRAWL ") + td + "%" };
  return { plan: "strikes", note: "BLOCK " + block + "%" };
}

function setGamePlan(b, other, cfg) {
  var m = b.mm, rd = mouseRead(other);
  m.phase = "plan"; m.plan = rd.plan; m.note = rd.note; m.padT = 0;
  mouseArm(b, cfg);
  floater(b.x, b.y - b.r - 44, "GAME PLAN: " + MM_PLAN_NAMES[rd.plan], "crit");
  playScoutDone();
  crowdReact(0.4);
  if (cfg.copycat) m.copyAt = m.t + cfg.copycat.delay;
}

// Puts his attacks together: his own (or copied) punch and kick, with the
// game plan on top.
function mouseArm(b, cfg) {
  var m = b.mm, ch = b.char, gf = cfg.gameFilm || {};
  var p = mmClone(m.atk.punch);
  if (m.plan === "strikes" && gf.strikes) { p.cooldown *= gf.strikes.cooldown; p.damage = mmRound(p.damage * gf.strikes.damage); }
  ch.punch = p; ch.hasPunch = true;
  if (m.atk.ramp) ch.ramp = mmClone(m.atk.ramp); else delete ch.ramp;
  var kick = m.atk.kick || (m.plan === "kicks" && gf.kicks ? gf.kicks.kick : null);
  ch.hasKick = !!kick;
  if (kick) ch.kick = mmClone(kick);
  ch.hasSwing = !!m.atk.swing;
  if (m.atk.swing) ch.swing = mmClone(m.atk.swing);
  ch.hasProjectile = !!m.atk.proj;
  if (m.atk.proj) ch.proj = mmClone(m.atk.proj);
}

// ---------------------------------------------------------------- copycat

function mouseCopycat(b, other, cc) {
  var src = other.baseChar || other.char, m = b.mm, got = [], sc = cc.scale;
  if (src.hasPunch && src.punch) {
    var p = mmClone(src.punch);
    p.damage = mmRound(p.damage * sc); p.size = m.atk.punch.size; p.koChance = 0;
    m.atk.punch = p;
    if (src.ramp) {
      var rp = mmClone(src.ramp);
      rp.dmgStart *= sc; rp.dmgMax *= sc;
      m.atk.ramp = rp;
      got.push("COMBOS");
    } else { m.atk.ramp = null; got.push(p.cooldown < 0.3 ? "JABS" : "PUNCH"); }
  }
  if (src.hasKick && src.kick) { var k = mmClone(src.kick); k.damage = mmRound(k.damage * sc); m.atk.kick = k; got.push("KICK"); }
  if (src.hasSwing && src.swing) { var s = mmClone(src.swing); s.damage = mmRound(s.damage * sc); m.atk.swing = s; got.push("HAYMAKER"); }
  if (src.hasProjectile && src.proj) { var pr = mmClone(src.proj); pr.damage = mmRound(pr.damage * sc); m.atk.proj = pr; got.push("SHOTS"); }
  m.copied = got;
  mouseArm(b, mmCfg(b) || {});
  if (!got.length) return;
  var up = b.y - b.r - 50 > 30; // (by the top of the cage they'd pile up: under him instead)
  floater(b.x, up ? b.y - b.r - 50 : b.y + b.r + 30, "COPYCAT!", "crit");
  floater(b.x, up ? b.y - b.r - 16 : b.y + b.r + 62, "COPIED " + got.join(" + "), "note");
  m.copyFx = 0.6;
  playMimicWarble();
  crowdReact(0.3);
}

// ---------------------------------------------------------------- cardio

function tickCardio(b, other, cfg, dt) {
  var cc = cfg.cardio, m = b.mm;
  if (!cc) return;
  m.cardioT += dt;
  if (m.cardio < cc.max && m.cardioT >= cc.every) {
    m.cardioT -= cc.every;
    m.cardio++;
    floater(b.x, b.y - b.r - 44, "CARDIO", "crit");
    if (other.alive) floater(other.x, other.y - other.r - 30, m.cardio >= 3 ? "GASSED" : "TIRED", "note");
    playCardio(m.cardio);
  }
  b.baseSpeed = m.speed0 * (1 + cc.speed * m.cardio);
  b.atkRate = m.atk0 * (1 + cc.rate * m.cardio);
  other.mmTired = m.cardio;
  // Gassing out: they throw slower too (tireAttack each time, down to tireMin).
  if (other.mmAtk0 == null) other.mmAtk0 = other.atkRate;
  if (cc.tireAttack) other.atkRate = other.mmAtk0 * Math.max(cc.tireMin, 1 - cc.tireAttack * m.cardio);
  if (m.cardio > 0 && other.alive) {
    var mult = Math.max(cc.tireMin, 1 - cc.tire * m.cardio), sl = slowedBy(other, "tired");
    if (!sl || sl.t < 0.3 || sl.mult !== mult) addSlow(other, mult, 1, "tired");
    // Sweat flying off them, more the more tired they get.
    if (!reduceMotion && Math.random() < dt * (1.5 + m.cardio * 1.6)) {
      var a = -Math.PI / 2 + (Math.random() - 0.5) * 2.2;
      mmSweat.push({ x: other.x + Math.cos(a) * other.r * 0.8, y: other.y + Math.sin(a) * other.r * 0.8, vx: Math.cos(a) * (60 + Math.random() * 70), vy: Math.sin(a) * (60 + Math.random() * 70) - 40, t: 0, dur: 0.55 + Math.random() * 0.25 });
    }
  }
}

function tickMouseSweat(dt) {
  mmSweat.forEach(function (s) { s.t += dt; s.x += s.vx * dt; s.y += s.vy * dt; s.vy += 420 * dt; });
  mmSweat = mmSweat.filter(function (s) { return s.t < s.dur; });
}

// ---------------------------------------------------------------- the finisher

// From the top of beginGrapple (match.js): true if this takedown became the
// suplex into the mid-air armbar instead of a wall slam.
function mouseTakedown(attacker, target) {
  if (!attacker.mm || attacker.mmFin || !attacker.alive || !target.alive || over) return false;
  var forced = attacker.mmForce, cfg = mmCfg(attacker) || {}, fin = cfg.finisher;
  if (!forced) {
    if (!fin || attacker.mm.finCd > 0 || attacker.mm.phase === "scout") return false;
    if (target.hp > fin.at * MAX_HP && !wouldKill(target, attacker.char.grapple.damage)) return false;
  }
  beginMouseFinisher(attacker, target, forced || fin, !!forced);
  return true;
}

function beginMouseFinisher(self, vic, opts, special) {
  clearActions(self); clearActions(vic);
  vic.slam = null; vic.flow = null; vic.sprawl = null; vic.sprawled = false;
  if (vic.igbb) { vic.igbb = null; vic.koPunch = null; }
  self.koPunch = null;
  var side = vic.x >= self.x ? 1 : -1;
  var reach = (self.r + vic.r) * 0.8;
  if (self.x - side * reach < vic.r || self.x - side * reach > W - vic.r) side = -side;
  var jump = reach * 0.75;
  self.y = Math.min(H - self.r, Math.max(self.y, reach * 1.25 + vic.r + jump + 6)); // room over his head
  var hurtFrac = 1 - Math.max(0, Math.min(1, vic.hp / MAX_HP));
  self.mmFin = { vicId: vic.id, phase: "lock", t: 0, side: side, reach: reach, jump: jump, y0: self.y, special: special,
    tap: Math.min(95, (opts.tapBase || 0) + (opts.tapLowHp || 0) * hurtFrac), slamDamage: opts.slamDamage || 0, hold0: !!vic.holdAtOne, armT: 0, said2: false };
  self.suplex = { vicId: vic.id, t: 0, phase: "lock", side: side, reach: reach, mouse: true }; // drawn by suplex.js
  vic.choked = true; vic.holdAtOne = true; // (survives the slam: the armbar is what finishes it)
  self.vx = 0; self.vy = 0; vic.vx = 0; vic.vy = 0;
  floater(self.x, self.y - self.r - 60, "SUPLEX", "crit");
  var L = (mmCfg(self) || {}).lines;
  if (L && L.finisher) say(self, MM_LINES.fin1);
  playMouseSqueak();
  playWhoosh();
  crowdReact(0.6);
}

function runMouseFinisher(self, other, f, dt) {
  var vic = balls[f.vicId];
  if (!self.alive || !vic.alive || over) { endMouseFinisher(self); return false; }
  f.t += dt;
  var s = f.side;
  if (f.phase === "armbar") {
    // armbar.js has it now; a second bubble once it's cranked in.
    f.armT += dt;
    if (!f.said2 && f.armT >= MF_LINE2) { f.said2 = true; var L = (mmCfg(self) || {}).lines; if (L && L.finisher) say(self, MM_LINES.fin2); }
    if (!self.armbar) { endMouseFinisher(self); return false; }
    return false;
  }
  self.vx = 0; self.vy = 0; vic.vx = 0; vic.vy = 0;
  if (f.phase === "lock") {
    // Arms locked round their waist, chest to their back.
    vic.x = self.x + s * f.reach; vic.y = self.y;
    self.suplex.t = f.t;
    if (f.t >= MF_LOCK) { f.phase = "lift"; f.t = 0; self.suplex.phase = "lift"; self.suplex.t = 0; playWhoosh(); }
    return true;
  }
  if (f.phase === "lift") {
    // Up and over, to the top of the arc right over his head.
    var k = Math.min(1, f.t / MF_LIFT);
    self.suplex.t = k * 0.5 * SUPLEX_LIFT_TIME;
    var ang = Math.PI * suplexArc(self.suplex);
    vic.x = self.x + s * Math.cos(ang) * f.reach; vic.y = self.y - Math.sin(ang) * f.reach * 1.25;
    if (k >= 1) startMidAirArmbar(self, vic, f);
    return true;
  }
  var ab = self.armbar;
  if (!ab) { endMouseFinisher(self); return false; }
  var tx, ty;
  if (f.phase === "switch") {
    // He springs up off the mat after them, swinging his legs over the arm.
    var k2 = Math.min(1, f.t / MF_SWITCH), e2 = k2 * k2 * (3 - 2 * k2);
    self.y = f.y0 - f.jump * Math.sin(e2 * Math.PI / 2);
    tx = self.x + ab.side * (self.r + vic.r) * ARMBAR_GAP; ty = self.y - self.r * 0.3;
    vic.x = f.ax + (tx - f.ax) * e2; vic.y = f.ay + (ty - f.ay) * e2;
    if (k2 >= 1) { f.phase = "drop"; f.t = 0; }
    return true;
  }
  // "drop": they come down together, the arm already locked.
  var k3 = Math.min(1, f.t / MF_DROP);
  self.y = f.y0 - f.jump * (1 - k3 * k3);
  vic.x = self.x + ab.side * (self.r + vic.r) * ARMBAR_GAP; vic.y = self.y - self.r * 0.3;
  if (k3 >= 1) { landMouseArmbar(self, vic, f); f.phase = "armbar"; f.t = 0; }
  return true;
}

// At the top of the suplex: he lets go of the waist, grabs the arm and goes
// for the armbar in mid-air.
function startMidAirArmbar(self, vic, f) {
  self.suplex = null;
  f.ax = vic.x; f.ay = vic.y;
  vic.x = self.x - f.side; // the armbar goes on the side he was throwing them to
  beginArmbar(self, vic); // (armbar.js: the legs over the arm, the tug-of-war bar)
  if (floaters.length && floaters[floaters.length - 1].text === "ARMBAR") floaters.pop(); // (ours says MID-AIR ARMBAR!)
  vic.x = f.ax; vic.y = f.ay;
  self.armbar.taps = Math.random() * 100 < f.tap;
  f.phase = "switch"; f.t = 0;
  floater((self.x + vic.x) / 2, Math.min(self.y, vic.y) - vic.r - 34, "MID-AIR ARMBAR!", "crit");
  hitStop = Math.max(hitStop, 0.12);
  self.flash = 0.12;
  playArmbarSnap();
  crowdReact(0.8);
}

// They crash down onto the mat with the arm locked.
function landMouseArmbar(self, vic, f) {
  var cx = (self.x + vic.x) / 2, cy = Math.max(self.y, vic.y) + self.r * 0.6;
  impacts.push({ x: cx, y: cy, nx: 0, ny: -1, life: 0.55, max: 0.55, color: self.char.color });
  impacts.push({ x: cx, y: cy, nx: 0, ny: -1, life: 0.75, max: 0.75, color: theme.hit });
  igbbSparks(cx, cy, 0, -1, self.char.color, 22, 520);
  if (!reduceMotion) {
    shake = Math.max(shake, 24);
    for (var i = 0; i < 14; i++) {
      var sg = i % 2 ? 1 : -1;
      particles.push({ x: cx + sg * self.r * 0.6, y: cy, vx: sg * (120 + Math.random() * 240), vy: -Math.random() * 110, life: 0.35 + Math.random() * 0.25, max: 0.6, size: 3 + Math.random() * 3.5, color: theme.wall });
    }
  }
  hitStop = Math.max(hitStop, 0.12);
  vic.squash = { t: 0.24, max: 0.24, nx: 0, ny: -1 };
  vic.flash = 0.16;
  playSlam(); playPunch(45);
  if (f.slamDamage > 0) hurt(vic, f.slamDamage, "igbb", self.id);
  recordTakedown(self.id);
  floater(vic.x, vic.y - vic.r - 30, "TAKEDOWN", "note");
  crowdReact(1);
}

function endMouseFinisher(self) {
  var f = self.mmFin;
  if (!f) return;
  var vic = balls[f.vicId];
  if (self.suplex && self.suplex.mouse) self.suplex = null;
  if (self.armbar) endArmbar(self);
  if (f.phase !== "armbar") self.y = f.y0; // dropped out of it mid-air: back on the mat
  vic.choked = false;
  vic.holdAtOne = f.hold0;
  self.mmFin = null;
  var fin = (mmCfg(self) || {}).finisher;
  if (self.mm) self.mm.finCd = fin ? fin.cooldown : 6;
  self.grappleCd = self.char.grapple ? self.char.grapple.cooldown : 0;
}

// ---------------------------------------------------------------- Mimic (his special)

// The special he'd copy off them, or null (not one he can copy). His
// special's `copies` list can narrow MM_COPIES down.
function mimicSource(other, own) {
  var c = other.baseChar || other.char, sp = c.hasSpecial && c.special;
  if (!sp || !MM_COPIES[sp.move] || (own.copies && own.copies.indexOf(sp.move) < 0)) return null;
  return sp;
}

// From updateSpecial (special.js) for special.move "mimic".
function updateMimicSpecial(self, other, dt) {
  var sp = self.char.special, m = self.igbb;
  if (!m) {
    if (self.specialT < sp.chargeTime || !canStartIgbb(self, other) || self.mmFin || over) return false;
    var theirs = mimicSource(other, sp);
    if (theirs && self.mm) return startMimicCopy(self, other, sp, theirs, dt);
    clearActions(self);
    self.igbb = { move: "mimic", phase: "crouch", t: 0 };
    self.vx = 0; self.vy = 0;
    floater(self.x, self.y - self.r - 30, "MIGHTY MOUSE!", "crit");
    playMouseSqueak();
    crowdReact(0.5);
    return true;
  }
  if (m.move !== "mimic") return false;
  m.t += dt;
  if (over) { self.igbb = null; return false; }
  var dx = other.x - self.x, dy = other.y - self.y, d = Math.sqrt(dx * dx + dy * dy) || 1;
  if (m.phase === "crouch") {
    // The tell: he drops his level, glowing, before he shoots.
    self.vx = 0; self.vy = 0;
    if (m.t >= MM_TELL) { m.phase = "close"; m.t = 0; playWhoosh(); }
    return true;
  }
  // Shooting across the cage at them. Called off if they can't be reached:
  // stays charged.
  if (!other.alive || other.invincible || specialBusy(other) || m.t > MM_SHOT_GIVEUP) {
    self.igbb = null;
    setSpeed(self, self.baseSpeed || SPEED);
    return false;
  }
  if (d < self.r + other.r + 8) {
    self.igbb = null;
    self.specialT = 0;
    // The shot goes through all their normal defences (attemptGrab); if it
    // gets through, it's the suplex into the mid-air armbar.
    self.mmForce = { tapBase: sp.tapBase, tapLowHp: sp.tapLowHp, slamDamage: sp.slamDamage };
    var landed = attemptGrab(self, other);
    self.mmForce = null;
    if (!landed && self.alive && !self.mmFin) setSpeed(self, self.baseSpeed || SPEED);
    return true;
  }
  self.vx = dx / d * MM_SHOT_SPEED; self.vy = dy / d * MM_SHOT_SPEED;
  if (!reduceMotion) particles.push({ x: self.x, y: self.y, vx: -self.vx * 0.1, vy: -self.vy * 0.1, life: 0.2, max: 0.2, size: self.r * 0.55, color: self.char.color });
  return true;
}

// Copies their special: his special block becomes theirs at `power` of the
// damage (his own charge settings), and their move's code runs it. It's
// swapped back as soon as the move is over (tickMimicRestore).
function startMimicCopy(self, other, sp, theirs, dt) {
  var copy = mmClone(theirs), power = sp.power != null ? sp.power : 0.5;
  Object.keys(copy).forEach(function (k) {
    if (typeof copy[k] === "number" && /damage|Damage/.test(k)) copy[k] = mmRound(copy[k] * power);
  });
  delete copy.ladder; // (Hokit's ladder finish keeps its own state, hokit-ladder.js)
  copy.chargeTime = sp.chargeTime; copy.hitCut = sp.hitCut; copy.punchCut = sp.punchCut;
  self.mm.mimic = { own: sp, move: theirs.move, began: false, t: 0 };
  self.char.special = copy;
  floater(self.x, self.y - self.r - 54, "MIMIC!", "crit");
  floater(self.x, self.y - self.r - 22, Math.round(power * 100) + "% POWER", "note");
  playMimicWarble();
  var on = updateSpecial(self, other, dt);
  if (self.igbb) self.mm.mimic.began = true;
  return on;
}

// Puts his own special back once the copied one is over (or never got going).
function tickMimicRestore(b, dt) {
  var mi = b.mm.mimic;
  if (!mi) return;
  mi.t += dt;
  if (b.igbb && b.igbb.move === mi.move) mi.began = true;
  if ((mi.began && !b.igbb) || (!mi.began && mi.t > 4) || !b.alive) {
    b.char.special = mi.own;
    b.mm.mimic = null;
  }
}

// ---------------------------------------------------------------- voice lines

function tickMouseLines(b, other, cfg, dt) {
  var L = cfg.lines, m = b.mm;
  if (!L || !started) return;
  m.lineGap = Math.max(0, m.lineGap - dt);
  if (L.start && !m.said.start && b.alive) { m.said.start = true; say(b, MM_LINES.start); m.lineGap = L.gap; }
  if (over) {
    if (b.alive && !other.alive) m.winT += dt;
    if (b.alive && !other.alive && !m.said.win) {
      if (m.winT >= 0.6) {
        m.said.win = true;
        if (L.win) say(b, MM_LINES.win, { hold: 1 });
        // Turns his back to them: the kanji on his back.
        if (b.char.look && b.char.look.tattoos && b.char.look.tattoos.back) { var bl = mmClone(b.char.look); bl.backView = true; b.char.look = bl; }
      }
    }
    return;
  }
  if (!b.alive || b.mmFin) { m.hpPrev = b.hp; return; }
  // Their strikes that came to nothing: slipped (`dodge`) or blocked / whiffed (`miss`).
  var ev = null;
  [other.punch, other.kick, other.koPunch].forEach(function (a) {
    if (!a || !a.hit || a.mmSeen) return;
    a.mmSeen = true;
    if (a === other.koPunch && a.targetId != null && a.targetId !== b.id) return;
    if (b.hp >= m.hpPrev - 0.001) ev = b.justDodged ? "dodge" : "miss";
  });
  var sw = other.swing;
  if (sw && (sw.phase === "extend" || sw.phase === "recover") && !sw.mmSeen) {
    sw.mmSeen = true;
    if (!sw.hit) ev = "miss";
    else if (b.hp >= m.hpPrev - 0.001) ev = b.justDodged ? "dodge" : "miss";
  }
  // Sprawling their shot: they missed. Winning the scramble after it: rarely Ray Borg.
  if (b.sprawl && !m.wasSprawl) ev = "miss";
  if (!b.sprawl && m.wasSprawl && b.grapple && L.borg && isRayBorg(other) && m.lineGap <= 0 && canSay(b) && Math.random() * 100 < L.borg) { say(b, MM_LINES.borg); m.lineGap = L.gap; }
  m.wasSprawl = !!b.sprawl;
  m.hpPrev = b.hp;
  if (ev && m.lineGap <= 0 && canSay(b) && Math.random() * 100 < (L[ev] || 0)) { say(b, MM_LINES[ev]); m.lineGap = L.gap; }
}

// ---------------------------------------------------------------- drawing

// From draw(), per fighter, after its hands: the purple aura while he's
// running a copied special, his crouch before his own shot, the flash when he
// copies their attacks.
function drawMightyMouse(b) {
  if (!b.alive || !b.mm) return;
  drawMouseAirShadow(b);
  var col = b.char.color;
  if (b.mm.mimic && b.igbb) {
    ctx.save();
    ctx.globalAlpha = 0.55 + 0.3 * Math.sin(mmClock * 14);
    ctx.strokeStyle = col; ctx.lineWidth = 5;
    ctx.setLineDash([10, 7]); ctx.lineDashOffset = -mmClock * 70;
    ctx.beginPath(); ctx.arc(b.x, b.y, b.r + 9, 0, Math.PI * 2); ctx.stroke();
    ctx.setLineDash([]); ctx.globalAlpha *= 0.5; ctx.lineWidth = 10;
    ctx.beginPath(); ctx.arc(b.x, b.y, b.r + 15 + 3 * Math.sin(mmClock * 9), 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
  }
  var m = b.igbb;
  if (m && m.move === "mimic" && m.phase === "crouch") {
    // Level change: a ring filling round him and dust kicked up at his feet.
    var k = Math.min(1, m.t / MM_TELL);
    ctx.save();
    ctx.lineCap = "round";
    ctx.globalAlpha = 0.3 + 0.25 * Math.sin(mmClock * 30);
    ctx.fillStyle = col;
    ctx.beginPath(); ctx.arc(b.x, b.y, b.r + 14, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1; ctx.strokeStyle = col; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.arc(b.x, b.y, b.r + 9, -Math.PI / 2, -Math.PI / 2 + k * Math.PI * 2); ctx.stroke();
    ctx.restore();
  }
  if (b.mm.copyFx > 0) {
    var cf = b.mm.copyFx;
    ctx.save();
    ctx.globalAlpha = cf / 0.6;
    ctx.strokeStyle = col; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.arc(b.x, b.y, b.r + 6 + (0.6 - cf) * 70, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
  }
}

// Over the fighters: the SCOUTING notepad and his game plan on it, and sweat
// flying off a tired opponent. From draw().
function drawMightyMouseOver() {
  mmSweat.forEach(function (s) {
    var a = Math.min(1, (s.dur - s.t) / 0.2), ang = Math.atan2(s.vy, s.vx);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.translate(s.x, s.y); ctx.rotate(ang - Math.PI / 2);
    ctx.fillStyle = "#a8dcff"; ctx.strokeStyle = "#2a6a9a"; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(0, 5); ctx.quadraticCurveTo(3.6, -1, 0, -3.6); ctx.quadraticCurveTo(-3.6, -1, 0, 5); ctx.fill(); ctx.stroke();
    ctx.restore();
  });
  balls.forEach(function (b) {
    var m = b.mm;
    if (!m || !b.alive || !started) return;
    drawMouseArmbarBar(b);
    var gf = (mmCfg(b) || {}).gameFilm;
    if (!gf) return;
    if (m.phase === "scout") drawScoutPad(b, Math.min(1, m.t / gf.time), null);
    else if (m.plan && m.padT < MM_PAD_SHOW && !over) drawScoutPad(b, 1, m);
  });
}

// While his finisher's speech bubble covers the armbar's tug-of-war bar
// (armbar.js draws it over the pair), the same bar shows under them.
function drawMouseArmbarBar(b) {
  var c = b.armbar, f = b.mmFin;
  if (!c || !f || f.phase !== "armbar" || !speaking(b)) return;
  var vic = balls[c.vicId], bw = 150, bh = 12;
  var bx = Math.min(W - bw - 6, Math.max(6, (b.x + vic.x) / 2 - bw / 2));
  var by = Math.max(b.y, vic.y) + Math.max(b.r, vic.r) + 18;
  if (by + bh > H - 4) return;
  var split = bw * (c.bar + 1) / 2;
  ctx.save();
  ctx.fillStyle = b.char.color; ctx.fillRect(bx, by, split, bh);
  ctx.fillStyle = vic.char.color; ctx.fillRect(bx + split, by, bw - split, bh);
  ctx.lineWidth = 2.5; ctx.strokeStyle = theme.wall; ctx.strokeRect(bx, by, bw, bh);
  ctx.fillStyle = theme.ink; ctx.fillRect(bx + split - 2, by - 4, 4, bh + 8);
  ctx.restore();
}

// Their shadow on the mat while he's up in the air with them (mid-air armbar).
function drawMouseAirShadow(b) {
  var f = b.mmFin;
  if (!f || (f.phase !== "switch" && f.phase !== "drop")) return;
  var h = Math.max(0, f.y0 - b.y), k = Math.min(1, h / (f.jump || 1));
  ctx.save();
  ctx.globalAlpha = 0.28 * (1 - 0.4 * k);
  ctx.fillStyle = "#000000";
  ctx.beginPath(); ctx.ellipse(b.x + f.side * -b.r * 0.4, f.y0 + b.r * 0.85, b.r * (1.6 - 0.5 * k), b.r * (0.32 - 0.1 * k), 0, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

// The notepad under him (over him if he's down by the cage): pencil
// scribbles filling in while he scouts, then the game plan in red.
function drawScoutPad(b, k, plan) {
  var w = 84, h = 52;
  var below = b.y + b.r + 16 + h + 12 < H;
  var x = Math.max(4, Math.min(W - w - 4, b.x - w / 2));
  var y = below ? b.y + b.r + 16 : b.y - b.r - 40 - h;
  var pop = plan ? Math.min(1, plan.padT / 0.15) * Math.min(1, (MM_PAD_SHOW - plan.padT) / 0.3) : 1;
  ctx.save();
  ctx.globalAlpha = Math.max(0, pop);
  // the pad
  ctx.fillStyle = "#fff8dc"; ctx.strokeStyle = "#16211f"; ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.roundRect(x, y, w, h, 5); ctx.fill(); ctx.stroke();
  ctx.strokeStyle = "rgba(70,120,200,0.45)"; ctx.lineWidth = 1;
  for (var i = 1; i < 5; i++) { ctx.beginPath(); ctx.moveTo(x + 3, y + 8 + i * 9); ctx.lineTo(x + w - 3, y + 8 + i * 9); ctx.stroke(); }
  ctx.strokeStyle = "rgba(214,40,40,0.7)";
  ctx.beginPath(); ctx.moveTo(x + 12, y + 3); ctx.lineTo(x + 12, y + h - 3); ctx.stroke();
  // spiral rings along the top
  ctx.strokeStyle = "#5b6270"; ctx.lineWidth = 2;
  for (var j = 0; j < 7; j++) { ctx.beginPath(); ctx.arc(x + 9 + j * 11, y, 3.2, Math.PI * 0.9, Math.PI * 2.1); ctx.stroke(); }
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  if (!plan) {
    // Scribbles filling the lines as he studies, the pencil moving along.
    ctx.strokeStyle = "#3a3f4a"; ctx.lineWidth = 1.6; ctx.lineCap = "round";
    var lines = 4, done = k * lines, px = x + 16, py = y + 13;
    for (var ln = 0; ln < lines; ln++) {
      var part = Math.max(0, Math.min(1, done - ln));
      if (part <= 0) break;
      var ly = y + 13 + ln * 9, len = (w - 22) * part;
      ctx.beginPath();
      for (var sx = 0; sx <= len; sx += 3) ctx.lineTo(x + 16 + sx, ly + Math.sin((sx + ln * 7) * 0.9) * 2.4);
      ctx.stroke();
      px = x + 16 + len; py = ly;
    }
    // the pencil
    ctx.save(); ctx.translate(px, py - 2); ctx.rotate(-0.7 + 0.12 * Math.sin(mmClock * 24));
    ctx.fillStyle = "#f2c230"; ctx.strokeStyle = "#16211f"; ctx.lineWidth = 1.2;
    ctx.fillRect(0, -2.5, 16, 5); ctx.strokeRect(0, -2.5, 16, 5);
    ctx.fillStyle = "#e8a0a8"; ctx.fillRect(16, -2.5, 3.5, 5);
    ctx.fillStyle = "#e9cf9e"; ctx.beginPath(); ctx.moveTo(0, -2.5); ctx.lineTo(-5, 0); ctx.lineTo(0, 2.5); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.restore();
    // SCOUTING and a bar filling in his colour
    var by = y + h + 4;
    ctx.fillStyle = "#16211f"; ctx.fillRect(x, by, w, 15);
    ctx.fillStyle = b.char.color; ctx.fillRect(x + 2, by + 2, (w - 4) * k, 11);
    ctx.font = '800 13px "Barlow Condensed", "Arial Narrow", sans-serif';
    ctx.fillStyle = "#ffffff"; ctx.fillText("SCOUTING", x + w / 2, by + 8);
  } else {
    // The game plan, in red marker, with the number that gave it away.
    ctx.font = '700 12px "Barlow Condensed", "Arial Narrow", sans-serif';
    ctx.fillStyle = "#3a3f4a"; ctx.fillText(plan.note, x + w / 2 + 5, y + 14);
    ctx.font = '900 19px "Barlow Condensed", "Arial Narrow", sans-serif';
    ctx.fillStyle = "#c81e1e"; ctx.fillText(MM_PLAN_NAMES[plan.plan], x + w / 2 + 5, y + 34);
    ctx.strokeStyle = "#c81e1e"; ctx.lineWidth = 2.2;
    var tw = ctx.measureText(MM_PLAN_NAMES[plan.plan]).width;
    ctx.beginPath(); ctx.ellipse(x + w / 2 + 5, y + 33, tw / 2 + 6, 12, -0.05, 0, Math.PI * 2); ctx.stroke();
  }
  ctx.restore();
}

// ---------------------------------------------------------------- sound
// Synth stand-ins until Joe records the real ones.

function mmAudio(fn) {
  try {
    var ac = getAudioCtx();
    if (!ac) return;
    if (ac.state === "suspended") ac.resume();
    fn(ac, ac.currentTime);
  } catch (e) { /* never let audio break the game */ }
}
// Pencil scratching on the notepad as he starts scouting.
function playScoutPencil() {
  mmAudio(function (ac, t) { for (var i = 0; i < 6; i++) caneBurst(ac, t + i * 0.07, 3200 + (i % 2) * 900, 3, 0.09, 0.05); });
}
// Game plan found: a bright double ding.
function playScoutDone() {
  mmAudio(function (ac, t) {
    caneTone(ac, t, "sine", 1320, 1310, 0.28, 0.25);
    caneTone(ac, t + 0.12, "sine", 1760, 1750, 0.28, 0.4);
  });
}
// The mouse squeak: a quick chirp up and down.
function playMouseSqueak() {
  mmAudio(function (ac, t) {
    caneTone(ac, t, "sine", 2600, 3900, 0.18, 0.07);
    caneTone(ac, t + 0.07, "sine", 3900, 2800, 0.16, 0.09);
  });
}
// Copying their moves: a warbling mirror tone.
function playMimicWarble() {
  mmAudio(function (ac, t) {
    [0, 0.09, 0.18].forEach(function (d, i) { caneTone(ac, t + d, "triangle", 520 + i * 160, 780 + i * 160, 0.22, 0.12); });
    caneTone(ac, t + 0.28, "triangle", 1240, 620, 0.18, 0.2);
  });
}
// Cardio stepping up: a heartbeat, quicker each level.
function playCardio(n) {
  mmAudio(function (ac, t) {
    var gap = Math.max(0.12, 0.3 - n * 0.03);
    caneTone(ac, t, "sine", 95, 60, 0.6, 0.14);
    caneTone(ac, t + gap, "sine", 90, 55, 0.5, 0.14);
    caneTone(ac, t + gap * 2, "sine", 600 + n * 80, 900 + n * 80, 0.12, 0.16);
  });
}
// Catching the arm mid-air: a sharp snap.
function playArmbarSnap() {
  mmAudio(function (ac, t) {
    caneBurst(ac, t, 1900, 2.5, 0.55, 0.05);
    caneBurst(ac, t + 0.03, 900, 1.5, 0.4, 0.07);
    caneTone(ac, t, "sine", 180, 90, 0.4, 0.12);
  });
}

// A line that names a real opponent only plays against that fighter. Ray Borg
// isn't on the roster, so his line stays quiet until he is.
function isRayBorg(o) { return !!(o && o.char && /ray borg/i.test(o.char.name || "")); }
