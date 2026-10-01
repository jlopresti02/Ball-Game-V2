// Match state: fighters, starting a match, damage, win check.
"use strict";

// ---------------------------------------------------------------
// Game screen: canvas, physics, drawing
// ---------------------------------------------------------------
var canvas = document.getElementById("c");
var ctx = canvas.getContext("2d");
var banner = document.getElementById("banner");
var startBtn = document.getElementById("startBtn");
var bannerText = document.getElementById("bannerText");

var theme = {};
function readTheme() {
  var cs = getComputedStyle(document.documentElement);
  ["floor", "grid", "wall", "ink", "hit", "dodge"].forEach(function (k) { theme[k] = cs.getPropertyValue("--" + k).trim(); });
}

var balls, projectiles, floaters, particles, shake, over, started;
var impacts = [], hitStop = 0; // wall-slam shockwaves and the brief freeze on each slam

// Each fighter's first charge-up comes a little earlier or later than its
// normal interval, so two identical fighters (a mirror match) don't charge,
// dash or sit in perfect sync for the whole fight.
function stagger() { return 0.6 + Math.random() * 0.8; }

function makeBall(id, ch) {
  return {
    id: id, char: ch,
    x: id === 0 ? W * 0.27 : W * 0.73,
    y: H / 2 + (Math.random() - 0.5) * 160,
    vx: 0, vy: 0, r: RADIUS,
    hp: MAX_HP, shown: MAX_HP, alive: true, flash: 0,
    shotTimer: ch.proj.cooldown * stagger(), punchCd: 0, punch: null, kickCd: 0, kick: null,
    grappleCd: 0, grapple: null, grappled: false, throwAnim: null,
    powerCd: ch.powerPunch.cooldown * stagger(), powerState: null,
    rageCd: ch.rage.cooldown * stagger(), rageState: null, jabAnim: null,
    watcherCd: ch.watcher.restDur * stagger(), watcherState: null, invincible: false, immuneCd: 0,
    slam: null, holdAtOne: false, flow: null, grabHold: false, initiativeReason: null, iowaSafe: null, sprawl: null, sprawled: false, checkAnim: null, checkStun: 0, swing: null, forgetT: 0, healGlow: 0,
    combo: null, taunt: null, weaveAnim: null, knockFly: 0, justDodged: false
  };
}

function startMatchWith(ch0, ch1) {
  stopAllChargeSounds();
  balls = [makeBall(0, ch0), makeBall(1, ch1)];
  projectiles = []; floaters = []; particles = []; shake = 0; over = false; started = false;
  impacts = []; hitStop = 0;

  document.getElementById("name0").textContent = ch0.name;
  document.getElementById("name1").textContent = ch1.name;
  ["0", "1"].forEach(function (i) {
    var ch = i === "0" ? ch0 : ch1;
    document.getElementById("name" + i).style.color = ch.color;
    document.getElementById("fill" + i).style.background = ch.color;
    document.getElementById("role" + i).textContent = abilitySummary(ch);
    document.getElementById("rejuv" + i).hidden = !ch.hasForget;
    document.getElementById("hud" + i).classList.remove("dead");
  });

  bannerText.hidden = true;
  startBtn.textContent = "Start match";
  banner.hidden = false;
  updateHud(true);
  showScreen("game");
}

function start() {
  balls.forEach(function (b) {
    var angle = Math.random() * Math.PI * 2;
    b.vx = Math.cos(angle) * SPEED;
    b.vy = Math.sin(angle) * SPEED;
  });
  started = true;
  banner.hidden = true;
}

function floater(x, y, text, kind) {
  var life = kind === "tick" ? 0.4 : (kind === "crit" ? 1.3 : (kind === "note" ? 1.1 : 0.9));
  floaters.push({ x: x, y: y, text: text, kind: kind, life: life, max: life });
}

function burst(b) {
  for (var i = 0; i < 28; i++) {
    var a = Math.random() * Math.PI * 2, s = 80 + Math.random() * 260;
    particles.push({ x: b.x, y: b.y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 0.6 + Math.random() * 0.4, max: 1, size: 3 + Math.random() * 5, color: b.char.color });
  }
}

// Grabs `target`, drags it to whichever wall is closest, and slams it there.
function beginGrapple(attacker, target) {
  target.slam = null; // a grab ends any wall slam in progress
  target.swing = null;
  target.flow = null;
  target.sprawl = null; target.sprawled = false;
  target.checkAnim = null; target.checkStun = 0;
  var gr = attacker.char.grapple;
  var distLeft = target.x - target.r, distRight = (W - target.r) - target.x;
  var distTop = target.y - target.r, distBottom = (H - target.r) - target.y;
  var min = Math.min(distLeft, distRight, distTop, distBottom);
  var endX = target.x, endY = target.y, nx = 0, ny = 0;
  if (min === distLeft) { endX = target.r + 2; nx = 1; }
  else if (min === distRight) { endX = W - target.r - 2; nx = -1; }
  else if (min === distTop) { endY = target.r + 2; ny = 1; }
  else { endY = H - target.r - 2; ny = -1; }
  // A grab that would finish the opponent becomes the finisher: always
  // driven straight down into the bottom wall, then pinned there.
  var finisher = wouldKill(target, gr.damage);
  if (finisher) {
    endX = Math.min(W - target.r - 2, Math.max(target.r + 2, target.x));
    endY = H - target.r - 2; nx = 0; ny = -1;
    target.holdAtOne = true; // survives until the last punch
    floater(target.x, target.y - target.r - 8, "FINISHER", "crit");
  }
  attacker.grapple = {
    targetId: target.id, startX: target.x, startY: target.y,
    endX: endX, endY: endY, t: 0, dur: finisher ? Math.max(gr.speed, 0.5) : gr.speed,
    nx: nx, ny: ny, dealt: false, finisher: finisher, phase: "carry"
  };
  attacker.grappleCd = gr.cooldown;
  target.grappled = true;
  target.vx = 0; target.vy = 0;
}

// Extra damage a fighter is currently taking (Sees Red winding up,
// a BMF celebrating).
function incomingMultiplier(b) {
  var m = 1;
  if (b.rageState && b.rageState.phase === "charge") m *= (b.char.rage.vulnMult != null ? b.char.rage.vulnMult : 2);
  if (b.taunt && b.taunt.t >= 0 && b.char.hasWeave) m *= (b.char.weave.tauntVuln != null ? b.char.weave.tauntVuln : 2);
  return m;
}
function wouldKill(b, amount) {
  return b.alive && b.hp <= amount * incomingMultiplier(b);
}

function hurt(b, amount, source, attackerId) {
  if (!b.alive) return 0;
  b.justDodged = false;
  // A seated Watcher can't be hurt by anything at all.
  if (b.invincible) {
    if (source !== "laser" && b.immuneCd <= 0) {
      floater(b.x, b.y - b.r - 8, "IMMUNE", "dodge");
      b.immuneCd = 0.5;
    }
    b.justDodged = true;
    return 0;
  }
  // Weave: slips the attack completely (grabs are weaved when they're
  // attempted, not when the slam lands). Callers check justDodged to skip
  // knockback, and projectiles fly on through.
  // CTE's wild swings are easier to see coming.
  var swinger = source === "swing" && attackerId != null ? balls[attackerId].char.swing : null;
  if (source !== "laser" && source !== "slam" && source !== "grapple" && source !== "finisher" && source !== "flow" && source !== "kickback" &&
      tryWeave(b, attackerId, swinger ? swinger.weaveMult : 1)) {
    b.justDodged = true;
    return 0;
  }
  // A passive chance to block an incoming attack outright and take no
  // damage at all (laser ticks are too frequent/small to bother blocking,
  // and you can't block a wall you're being slammed into).
  var blockChance = Math.min(100, b.char.blockChance * (swinger ? swinger.blockMult : 1));
  if (blockChance > 0 && source !== "laser" && source !== "slam" && source !== "finisher" && source !== "flow" && source !== "kickback" && Math.random() < blockChance / 100) {
    floater(b.x, b.y - b.r - 8, "BLOCK", "dodge");
    b.flash = 0.1;
    return 0;
  }
  // Sees Red is wide open mid wind-up: anything that lands while it's
  // charging (not the dash itself) does extra damage.
  if (b.rageState && b.rageState.phase === "charge") {
    var vm = b.char.rage.vulnMult != null ? b.char.rage.vulnMult : 2;
    // Whole-number hits stay whole numbers; tiny fractional hits (like
    // laser ticks) keep their fractions instead of rounding up to 1.
    amount = amount % 1 === 0 ? Math.round(amount * vm) : Math.round(amount * vm * 100) / 100;
  }
  // Celebrating after a critical-weave combo leaves the fighter wide open:
  // every hit that lands during the taunt does extra damage.
  if (b.taunt && b.taunt.t >= 0 && b.char.hasWeave) {
    var tm = b.char.weave.tauntVuln != null ? b.char.weave.tauntVuln : 2;
    amount = amount % 1 === 0 ? Math.round(amount * tm) : Math.round(amount * tm * 100) / 100;
  }
  b.hp = Math.max(0, b.hp - amount);
  if (b.holdAtOne && b.hp < 1) b.hp = 1; // pinned by a finisher: the last punch ends it
  if (b.hp < 0.001) b.hp = 0;
  if (source === "laser") {
    // Laser ticks land constantly, so they only give a soft pulse; the
    // running total floats up about once a second instead.
    b.flash = Math.max(b.flash, 0.07);
  } else {
    b.flash = 0.16;
    floater(b.x, b.y - b.r - 8, "-" + amount, "hit");
  }
  if (b.hp === 0) {
    b.alive = false;
    burst(b);
    document.getElementById("hud" + b.id).classList.add("dead");
  }
  // Grappler's counter: a chance to grab back whoever just hit it, as long
  // as the hit wasn't a projectile, laser or wall slam and it isn't already grappling.
  if (b.alive && source && source !== "proj" && source !== "grapple" && source !== "laser" && source !== "slam" && source !== "finisher" && source !== "flow" &&
      b.char.hasGrapple && !b.grapple && !b.grappled && b.grappleCd === 0 && attackerId != null) {
    var atk = balls[attackerId];
    if (atk && atk.alive && !atk.invincible && !grabBlockedByImpunity(b, atk)) {
      var chance = (b.char.grapple.counterChance != null ? b.char.grapple.counterChance : 25) / 100;
      if (Math.random() < chance && !tryWeave(atk, b.id)) attemptGrab(b, atk);
    }
  }
  return amount;
}

function checkEnd() {
  if (over) return;
  var alive = balls.filter(function (b) { return b.alive; });
  if (alive.length > 1) return;
  over = true;
  if (alive.length === 1) {
    bannerText.textContent = alive[0].char.name + " wins";
    bannerText.style.color = alive[0].char.color;
  } else {
    bannerText.textContent = "Draw";
    bannerText.style.color = "var(--ink)";
  }
  bannerText.hidden = false;
  startBtn.textContent = "New match";
  banner.hidden = false;
}
