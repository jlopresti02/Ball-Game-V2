// Alexander Volkanovski, "The Great" (Christian, 2026-11-13). Featherweight,
// built on the Brawler base with kicks and wrestling: well-rounded. Every
// mechanic below has its own block under "volk" in his character file (and
// his special under "special"); take a block out and that part is off.
//
// Fight IQ    (gamePlan) `readAt` seconds in he reads their numbers (from
//             their character file, like Mighty Mouse's game film) and puts
//             two scores on a FIGHT IQ card: SUBS (guard, guillotine, armbar
//             shot, a Grappler's grab, suplexes, Mighty Mouse's finisher) and
//             STRIKES (punch damage over its cooldown, kicks, haymakers,
//             power punches, KO chances). The bigger threat picks the plan:
//               KICKS    they're the submission threat: he stays off the mat,
//                        kicks from outside on a short cooldown, never shoots
//                        and sprawls more.
//               WRESTLE  they're the striker: he closes the distance and shoots
//                        takedowns most of the times he's close.
//               MIXED    the scores are within `mixedWithin`: a bit of both.
//             Then he adapts (adapt): if his shots keep getting stuffed, if they
//             keep taking him down or checking his kicks, or if one kind of
//             damage is piling up on him, he switches plan ("ADAPTING"), at most
//             `max` times a fight.
// Circling    (circle) his footwork: he circles them at the plan's distance
//             (closer to wrestle, out at kicking range to kick), switching
//             between clockwise and counter-clockwise every `switchEvery`
//             seconds or when the cage gets in the way, with a little plant and
//             pivot, the distance swaying in and out (`sway`). A dashed arrow on
//             the mat shows which way he's going round.
// Durability  (durability) he takes `damageTaken` of the damage (0.88).
// Rivals      (rivals) Ilia Topuria knocked him out at UFC 298: against Ilia
//             there's no durability bonus and he takes `ilia.damageTaken`.
//             He beat Max Holloway three times: against Max (id
//             c-max-holloway, once he's in the game) he does `max.damage`.
// Walkout     (walkout) he comes out with an Australian flag round his
//             shoulders and throws it off into the crowd `keep` seconds in.
// Voice lines (lines) speech bubbles (speech.js), his real lines (sources
//             next to each one below).
// Kangaroo    his special (special.move "kangaroo"): an Aussie tune starts (an
//             original synth tune, a didgeridoo drone under clapsticks and a
//             tin whistle), the cameras flash and the whole arena goes green
//             and gold (the crowd, flags, the walkway, the mat, the jumbotron),
//             the crowd chants AUSSIE AUSSIE AUSSIE, OI OI OI. A big red
//             kangaroo bounds in through the crowd and over the cage, he hops
//             into its pouch, and it bounds after them. When it catches them it
//             holds them while he punches out of the pouch (`pouchPunches`,
//             `pouchDamage`), then it rears back on its tail (the tell: some
//             opponents duck out, `readChance`) and kicks them with both feet
//             (`kickDamage`) into a pinball off the cage (`walls`, `wallDamage`).
//             `rounds` rounds, then he hops out and it bounds off. Nothing in it
//             can be slipped or blocked.
// The game plan runs on b.vk, the special on b.igbb (move "kangaroo") like
// every special, the kangaroo itself on vkRoo and the green and gold arena on
// aussie.
"use strict";

// Registered here rather than in special.js's table, so fighters built in
// parallel don't all edit the same line.
SPECIAL_MOVES.kangaroo = "Kangaroo";

// Every line was checked in the source next to it.
var VK_LINES = {
  // https://www.espn.com/mma/story/_/id/37982315/alexander-volkanovski-stays-ufc-champ-tko-yair-rodriguez (UFC 290, 2023)
  king: "I'm the king of this division. No one is ever stopping me.",
  // https://sports.yahoo.com/alexander-volkanovski-looks-forward-making-012044079.html (UFC 298 media, 2024; trimmed "That's something I like using.")
  earned: "Earned, not given.",
  // https://www.espn.com/mma/story/_/id/47699520/ufc-325-alexander-volkanovski-wants-bulldozer-2996-day-sydney-homecoming (before UFC 325, 2026)
  old: "I want people thinking I'm old. I am old. But I'm still better than these guys.",
  // https://www.mmamania.com/ufc-245-results-stream-fight-card-start-time-predictions-odds-highlights-usman-covington-mma/2019/12/16/21024246/ufc-245-alexander-volkanovski-welcomes-max-holloway-rematch-blessed-remains-noncommittal-mma (after UFC 245; trimmed "That's the thing.")
  rounded: "They go one way, I go another. I'm so well rounded. I can just go anywhere with it.",
  // https://www.fightersonlymag.com/latest-news/alexander-volkanovski-says-prep-and-smarts-will-be-key-to-victory-at-ufc-284-fight-iq-is-definitely-gonna-have-to-come-into-play/ (UFC 284 week, 2023)
  puzzle: "If there's anyone for the job to figure any puzzle out, I'm the man.",
  // https://sports.yahoo.com/article/alexander-volkanovski-beat-ufc-champ-012036663.html (Flagrant podcast, 2025, on how to beat Topuria)
  wrestle: "Wrestle the bloke, mate.",
  // https://www.canberratimes.com.au/story/9163307/ufc-325-volkanovski-defeats-lopes-in-sydney-rematch/ (UFC 325, 2026)
  adjust: "When they're doing the right stuff, I make the adjustments, that's what makes a true champion.",
  // https://www.si.com/fannation/mma/ufc/ufc-298-volkanovski-reflects-ko-loss (the day after UFC 298, 2024)
  nail: "Sometimes you're the hammer, sometimes you're the nail.",
  // https://www.espn.com/mma/story/_/id/37982315/alexander-volkanovski-stays-ufc-champ-tko-yair-rodriguez (UFC 290, 2023)
  unexpected: "You've gotta expect the unexpected.",
  // https://www.mmamania.com/2023/2/10/23594111/ufc-284-pre-fight-press-conference-quotes-volkanovski-doesnt-buy-makhachevs-ko-talk (UFC 284 presser, Perth, 2023; trimmed)
  fans: "Some of the best fans in the world are here in Australia.",
  // https://www.espn.com/mma/story/_/id/44651940/volkanovski-wins-vacant-title-slugfest-lopes-ufc-314 (UFC 314, 2025; the swear word bleeped)
  movie: "This is the [BLEEP] people are going to write books about. This is a movie!",
  // same ESPN UFC 314 story
  adversity: "Adversity is a privilege.",
  // https://www.espn.com/mma/story/_/id/27984767/alexander-volkanovski-blessed-era-ends-ufc-245 (UFC 245 presser, 2019, about Max Holloway)
  blessed: "I think the Blessed Era ends. It's my time.",
  // https://www.bjpenn.com/mma-news/ufc/alexander-volkanovski-reveals-he-politely-asked-max-holloway-to-get-the-fk-out-of-my-division-immediately-following-their-trilogy-fight-at-ufc-276/ (what he told Max after UFC 276, 2022; bleeped)
  division: "Hey, can you please get the [BLEEP] out of my division?",
  // https://www.illawarramercury.com.au/story/8263337/im-still-the-king-volkanovski-calls-out-makhachev-after-defending-featherweight-title/ (UFC 290, 2023, about Ilia Topuria)
  squash: "Ilia has been running his mouth. If he wants to keep going, I'll squash him too.",
  // https://sports.yahoo.com/alexander-volkanovski-looks-forward-making-012044079.html (UFC 298 media, 2024, about Ilia)
  humble: "He's going to have to eat a big humble pie, and I get to do that."
};
var VK_START = ["king", "earned", "old"];
var VK_WIN = ["king", "movie"];
var VK_PLAN_LINE = { kicks: "rounded", wrestle: "wrestle", mixed: "puzzle" };
var VK_PLAN_NAMES = { kicks: "KICKS", wrestle: "WRESTLE", mixed: "MIX IT UP" };
var VK_PLAN_NOTES = { kicks: "STAY OFF THE MAT", wrestle: "TAKE HIM DOWN", mixed: "A BIT OF BOTH" };
var VK_STRIKE_SRC = { punch: true, kick: true, kickback: true, swing: true, power: true, combo: true, flow: true, proj: true, throw: true, golf: true, kopunch: true, kofinal: true, slugfest: true };
var VK_GRAPPLE_SRC = { grapple: true, finisher: true, slam: true };
var AUS = { green: "#00843d", deep: "#0b5d3b", gold: "#ffcd00", navy: "#012169", red: "#e4002b", white: "#ffffff" };
var AUS_SIGNS = [["OI OI OI", AUS.gold, AUS.green], ["THE GREAT", AUS.green, AUS.gold], ["AUSSIE!", AUS.gold, AUS.green],
  ["VOLK!", AUS.green, AUS.white], ["G'DAY!", AUS.white, AUS.green], ["STRAYA!", AUS.gold, AUS.navy]];

// The kangaroo: drawn in its own units (feet on the ground at 0, facing
// right, about 185 tall), scaled by KR_S in the arena.
var KR_S = 0.85;
var KR_HIP = { x: -4, y: -40 };       // the body tilts round its hips
var KR_POUCH = { x: 22, y: -96 };     // where he sits in the pouch
var KR_HOLD = { x: 50, y: -44 };      // where they're held: in front of its chest, plus their own radius
var KR_IN_POUCH = 0.65;               // his size in the pouch
var KR_CALL = 0.95;     // arms up while the arena turns green and gold
var KR_HOP = 0.42;      // one bound
var KR_HOP_LEN = 185;   // how far a bound goes, at most
var KR_HOP_H = 52;      // how high
var KR_INTO = 0.5;      // his hop up into the pouch
var KR_PUNCH_GAP = 0.2; // between punches out of the pouch
var KR_REAR = 0.6;      // rearing back on its tail: the tell
var KR_KICK = 0.14;     // both feet swinging through
var KR_RECOVER = 0.45;
var KR_OUT = 0.45;      // his hop back out of the pouch
var KR_CATCH = 74;      // a bound that lands this close to them catches them
var KR_GIVEUP = 18;     // the whole thing never runs longer than this

var vkClock = 0;
var vkRoo = null;       // the kangaroo while it's about
var vkCloth = [];       // his walkout flag flying off into the crowd
var vkTune = null;      // the Aussie tune while it plays
var aussie = { on: false, k: 0, chantT: 0, echoes: [], ribbons: [], ownerId: null };

function vkCfg(b) { return b && b.char && b.char.volk; }
function vkClone(o) { return o == null ? o : JSON.parse(JSON.stringify(o)); }
function vkRand(r) { return r[0] + Math.random() * (r[1] - r[0]); }
function vkIsIlia(b) { return !!(b && b.char && String(b.char.id).indexOf("c-ilia-topuria") === 0); }
function vkIsMax(b) { return !!(b && b.char && String(b.char.id).indexOf("c-max-holloway") === 0); }
function kangarooOn(b) { return !!(b && b.igbb && b.igbb.move === "kangaroo"); }
function aussieOn() { return aussie.k > 0; }

// From startMatchSeeded.
function resetVolk() {
  vkClock = 0; vkRoo = null; vkCloth = [];
  stopVolkTune(0);
  aussie = { on: false, k: 0, chantT: 0, echoes: [], ribbons: [], ownerId: null };
}

// From makeBall.
function initVolk(b) {
  b.vk = null;
  var cfg = vkCfg(b);
  if (!cfg && !(b.char.special && b.char.special.move === "kangaroo")) return;
  // His own copy of himself: the game plan changes it mid-fight.
  b.char = vkClone(b.char);
  cfg = vkCfg(b) || {};
  var ch = b.char, ci = cfg.circle || {};
  b.vk = {
    t: 0, plan: "mixed", read: null, card: null, adapts: 0, planT: 0,
    own: { kick: vkClone(ch.kick), grapple: vkClone(ch.grapple), hasKick: !!ch.hasKick, hasGrapple: !!ch.hasGrapple },
    dir: Math.random() < 0.5 ? 1 : -1, switchT: ci.switchEvery ? vkRand(ci.switchEvery) : 2, wallCd: 0, pivotFx: 0, lean: 0, circling: false,
    sway: Math.random() * 6.28, gapNow: 30,
    ev: { stuffed: 0, takenDown: 0, checked: 0 }, was: {},
    taken: { strike: 0, grapple: 0 }, lastSrc: null, hpPrev: MAX_HP,
    said: {}, lineGap: 1.2, winT: 0, rival: null,
    flag: cfg.walkout ? 1 : 0
  };
  vkApplyPlan(b);
}

// ---------------------------------------------------------------- every frame

// From update().
function tickVolk(dt) {
  vkClock += dt;
  tickAussie(dt);
  tickVolkCloth(dt);
  balls.forEach(function (b) {
    if (!b.vk) return;
    var other = balls[1 - b.id], cfg = vkCfg(b) || {}, v = b.vk;
    if (v.rival == null) v.rival = vkIsIlia(other) ? "ilia" : vkIsMax(other) ? "max" : "";
    tickVolkLines(b, other, cfg, dt);
    if (!started || over || !b.alive) return;
    v.t += dt; v.planT += dt;
    if (v.card) v.card.t += dt;
    v.pivotFx = Math.max(0, v.pivotFx - dt);
    if (v.flag === 1 && cfg.walkout && v.t >= cfg.walkout.keep) volkFlagOff(b);
    var gp = cfg.gamePlan;
    if (gp && !v.read && v.t >= gp.readAt) volkRead(b, other, cfg);
    tickVolkEvents(b, other, cfg);
    if (gp && v.read && gp.adapt) volkAdapt(b, other, cfg);
    volkCircle(b, other, cfg, dt);
  });
}

// ---------------------------------------------------------------- fight IQ

// Reads their numbers: how much of a submission threat and how much of a
// striking threat they are, 0 to 100 each.
function volkScout(other) {
  var c = other.baseChar || other.char, sub = 0, str = 0;
  var g = c.hasGrapple && c.grapple;
  if (c.base === "Grappler") sub += 25;
  if (g) sub += g.shotChance == null ? 10 : g.shotChance * 0.3;
  if (g && g.damage >= 50) sub += 10;
  if (c.hasGuard && c.guard) sub += (c.guard.chance || 0) * 1.6 + ((c.guard.subs || []).length ? 15 : 0);
  if (c.hasGuillotine && c.guillotine) sub += (c.guillotine.chance || 0) * 1.6;
  if (c.hasArmbarShot) sub += 30;
  if (c.hasSuplex) sub += 10;
  if (c.mightyMouse && c.mightyMouse.finisher) sub += 25;
  if (c.hasPunch && c.punch) str += Math.min(45, c.punch.damage / Math.max(0.1, c.punch.cooldown) * 1.6);
  if (c.ramp) str += 25;
  if (c.hasKick && c.kick) str += c.kick.damage / Math.max(0.3, c.kick.cooldown) * 2;
  if (c.hasSwing && c.swing) str += c.swing.cooldown ? 12 : 30;
  if (c.hasPowerPunch) str += 30;
  if (c.punch && c.punch.koChance > 0) str += 10;
  if (["Brawler", "Kicker", "CTE", "Power Puncher", "BMF", "Sees Red"].indexOf(c.base) >= 0) str += 15;
  if (c.poatan || c.notorious || c.ngannou || c.iceman || c.suga) str += 12;
  return { sub: Math.round(Math.min(100, sub)), strike: Math.round(Math.min(100, str)) };
}

function volkRead(b, other, cfg) {
  var v = b.vk, gp = cfg.gamePlan, sc = volkScout(other);
  v.read = sc;
  var plan = Math.abs(sc.sub - sc.strike) < (gp.mixedWithin || 0) ? "mixed" : sc.sub > sc.strike ? "kicks" : "wrestle";
  volkSetPlan(b, plan, "FIGHT IQ");
  playFightIq();
  crowdReact(0.3);
  var L = cfg.lines;
  if (L && L.plan && Math.random() * 100 < L.plan) volkQueue(b, VK_LINES[VK_PLAN_LINE[plan]]);
}

function volkSetPlan(b, plan, title) {
  var v = b.vk;
  v.plan = plan; v.planT = 0;
  v.ev = { stuffed: 0, takenDown: 0, checked: 0 };
  v.taken = { strike: 0, grapple: 0 };
  v.card = { t: 0, title: title, plan: plan };
  vkApplyPlan(b);
}

// Sets his kicks and grappling for the plan (his own numbers are in v.own).
function vkApplyPlan(b) {
  var v = b.vk, cfg = vkCfg(b) || {}, gp = cfg.gamePlan || {}, ch = b.char;
  var p = (gp.plans || {})[v.plan] || {};
  if (v.own.hasKick && v.own.kick) {
    var k = vkClone(v.own.kick);
    k.cooldown *= p.kickCooldown || 1;
    k.damage = Math.round(k.damage * (p.kickDamage || 1));
    ch.kick = k;
  }
  if (v.own.hasGrapple && v.own.grapple) {
    var g = vkClone(v.own.grapple);
    if (p.shotChance != null) g.shotChance = p.shotChance;
    g.sprawlChance = Math.min(95, g.sprawlChance + (p.sprawlBonus || 0));
    g.reach += p.reachBonus || 0;
    g.cooldown *= p.grappleCooldown || 1;
    ch.grapple = g;
  }
}

// What happened to him this frame: shots stuffed, taken down, kicks checked,
// and which kind of damage he took.
function tickVolkEvents(b, other, cfg) {
  var v = b.vk, w = v.was;
  if (b.sprawled && !w.sprawled) v.ev.stuffed++;
  if (b.choked && !w.choked && other.guillo) v.ev.stuffed++;
  if (b.grappled && !w.grappled) v.ev.takenDown++;
  if (b.checkStun > 0 && !w.checkStun) v.ev.checked++;
  w.sprawled = !!b.sprawled; w.choked = !!b.choked; w.grappled = !!b.grappled; w.checkStun = b.checkStun > 0;
  var lost = v.hpPrev - b.hp;
  if (lost > 0.001 && v.lastSrc) {
    if (VK_STRIKE_SRC[v.lastSrc]) v.taken.strike += lost;
    else if (VK_GRAPPLE_SRC[v.lastSrc]) v.taken.grapple += lost;
    // One big shot that hurt: "Sometimes you're the hammer, sometimes you're the nail."
    var L = cfg.lines;
    if (L && L.nail && !v.said.nail && lost >= L.nail && b.hp < MAX_HP * 0.5 && b.alive && canSay(b)) { v.said.nail = true; volkSay(b, VK_LINES.nail, cfg); }
  }
  v.hpPrev = b.hp;
}

// Switching plans when it isn't working.
function volkAdapt(b, other, cfg) {
  var v = b.vk, ad = cfg.gamePlan.adapt, next = null;
  if (v.adapts >= ad.max || v.planT < ad.after || kangarooOn(b)) return;
  var ev = v.ev, tk = v.taken;
  if (v.plan === "wrestle" && ev.stuffed >= ad.stuffed) next = "mixed";
  else if (v.plan === "kicks" && (ev.takenDown >= ad.takenDown || ev.checked >= ad.checked)) next = "mixed";
  else if (v.plan === "mixed") {
    if (ev.stuffed >= ad.stuffed || tk.grapple - tk.strike > ad.damageLead) next = "kicks";
    else if (tk.strike - tk.grapple > ad.damageLead) next = "wrestle";
  }
  if (!next || next === v.plan) return;
  v.adapts++;
  volkSetPlan(b, next, "ADAPTING");
  floater(b.x, b.y - b.r - 46, "ADAPTING", "crit");
  playVolkAdapt();
  crowdReact(0.4);
  var L = cfg.lines;
  if (L && L.adapt && !v.said.adjust) { v.said.adjust = true; volkQueue(b, VK_LINES.adjust); }
}

// ---------------------------------------------------------------- circling

// Round and round them at the plan's distance, switching direction now and
// then with a plant and a pivot. Only in ordinary movement: anything that
// takes hold of him, sends him flying or winds him up leaves him alone.
function volkCircle(b, other, cfg, dt) {
  var c = cfg.circle, v = b.vk;
  v.circling = false;
  v.wallCd = Math.max(0, v.wallCd - dt);
  if (!c || !inOrdinaryMovement(b) || b.dizzy || b.angry || b.speedEase || !other.alive || other.invincible || v.t < (c.after || 0)) return;
  if (other.x < 0 || other.x > W || other.y < 0 || other.y > H) return; // (up in the air, off the screen)
  var dx = other.x - b.x, dy = other.y - b.y, d = Math.sqrt(dx * dx + dy * dy) || 1;
  if (d > (c.range || 9999)) return;
  v.circling = true;
  var ux = dx / d, uy = dy / d, tx = -uy * v.dir, ty = ux * v.dir;
  // Switching round: on the clock, or when the cage is in the way.
  v.switchT -= dt;
  var ax = b.x + tx * (b.r + 22), ay = b.y + ty * (b.r + 22);
  var walled = ax < b.r || ax > W - b.r || ay < b.r || ay > H - b.r;
  if (v.switchT <= 0 || (walled && v.wallCd <= 0)) {
    v.dir = -v.dir; tx = -tx; ty = -ty;
    v.switchT = vkRand(c.switchEvery);
    v.wallCd = 0.6;
    v.pivotFx = 0.35;
    var sp0 = Math.sqrt(b.vx * b.vx + b.vy * b.vy) || (b.baseSpeed || SPEED);
    b.vx = tx * sp0 * (c.pivot || 0.7); b.vy = ty * sp0 * (c.pivot || 0.7);
    volkPivotDust(b);
    playVolkPivot();
  }
  var gp = ((cfg.gamePlan || {}).plans || {})[v.plan] || {};
  v.sway += dt * Math.PI * 2 / (c.swayEvery || 1.7);
  var gap = (gp.gap != null ? gp.gap : 30) + (c.sway || 0) * Math.sin(v.sway);
  v.gapNow = gap;
  var want = b.r + other.r + gap, err = Math.max(-1.3, Math.min(1.3, (d - want) / 40));
  var wx = tx + ux * err, wy = ty + uy * err;
  var s = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
  if (s < 1) return;
  var cur = Math.atan2(b.vy, b.vx), wantA = Math.atan2(wy, wx);
  var diff = Math.atan2(Math.sin(wantA - cur), Math.cos(wantA - cur));
  var turn = Math.max(-(c.turn || 8) * dt, Math.min((c.turn || 8) * dt, diff));
  b.vx = Math.cos(cur + turn) * s; b.vy = Math.sin(cur + turn) * s;
  // A lean into the way he's going.
  var lean = Math.max(-1, Math.min(1, b.vx / ((b.baseSpeed || SPEED) || 1)));
  v.lean += (lean - v.lean) * Math.min(1, dt * 8);
}

function volkPivotDust(b) {
  if (reduceMotion) return;
  for (var i = 0; i < 7; i++) {
    var a = Math.PI * (0.15 + 0.7 * Math.random());
    particles.push({ x: b.x + (Math.random() - 0.5) * b.r, y: b.y + b.r * 0.9, vx: Math.cos(a) * 110 * (Math.random() < 0.5 ? -1 : 1), vy: -Math.sin(a) * 50,
      life: 0.32, max: 0.32, size: 3.5, color: "rgba(170,150,120,0.7)" });
  }
}

// ---------------------------------------------------------------- durability and rivals

// From hurt (match.js), just before the damage goes on.
function volkDamageMult(b, source, attackerId) {
  var m = 1, atk = attackerId != null && attackerId !== b.id ? balls[attackerId] : null;
  var cfg = vkCfg(b);
  if (b.vk && cfg) {
    b.vk.lastSrc = source;
    var ri = cfg.rivals && cfg.rivals.ilia;
    if (ri && atk && vkIsIlia(atk)) m *= ri.damageTaken || 1; // UFC 298: no chin bonus against Ilia
    else if (cfg.durability) m *= cfg.durability.damageTaken;
  }
  var ac = atk && atk.vk && vkCfg(atk);
  if (ac && ac.rivals && ac.rivals.max && vkIsMax(b)) m *= ac.rivals.max.damage || 1; // 3-0 against Max
  return m;
}

// ---------------------------------------------------------------- walkout flag

function volkFlagOff(b) {
  b.vk.flag = 2;
  // Thrown off over the cage into the nearest stand.
  var up = b.y < H / 2;
  vkCloth.push({ x: b.x, y: b.y - b.r * 0.3, vx: (b.x < W / 2 ? -1 : 1) * 160, vy: up ? -520 : 520, rot: 0, vr: (Math.random() < 0.5 ? -1 : 1) * 6, t: 0, dur: 1.2, r: b.r });
  playWhoosh();
  crowdReact(0.4);
}
function tickVolkCloth(dt) {
  vkCloth.forEach(function (p) { p.t += dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= Math.exp(-1.2 * dt); p.vy *= Math.exp(-1.2 * dt); p.rot += p.vr * dt; });
  vkCloth = vkCloth.filter(function (p) { return p.t < p.dur; });
}

// ---------------------------------------------------------------- voice lines

// A line that waits for his last bubble to finish (up to 6 seconds).
function volkQueue(b, text) { b.vk.pending = { text: text, t: 0 }; }

function volkSay(b, text, cfg) {
  if (!text) return;
  say(b, text);
  b.vk.lineGap = (cfg.lines && cfg.lines.gap) || 8;
}

function tickVolkLines(b, other, cfg, dt) {
  var L = cfg.lines, v = b.vk;
  if (!L || !started) return;
  v.lineGap = Math.max(0, v.lineGap - dt);
  if (over) {
    if (b.alive && !other.alive) v.winT += dt;
    if (L.win && b.alive && !other.alive && !v.said.win && v.winT >= 0.6) {
      v.said.win = true;
      var line = v.rival === "max" && L.rival ? VK_LINES.division
        : b.hp < MAX_HP * 0.3 ? VK_LINES.adversity
        : VK_LINES[pickLine(b, VK_WIN, "win")];
      say(b, line, { hold: 1 });
    }
    return;
  }
  if (!b.alive) return;
  var pd = v.pending;
  if (pd) {
    pd.t += dt;
    if (pd.t > 6 || kangarooOn(b)) v.pending = null;
    else if (!speaking(b) && pd.t > 0.2) { v.pending = null; volkSay(b, pd.text, cfg); }
  }
  if (L.start && !v.said.start) {
    v.said.start = true;
    var first = v.rival === "ilia" && L.rival ? VK_LINES.squash : v.rival === "max" && L.rival ? VK_LINES.blessed : VK_LINES[pickLine(b, VK_START, "start")];
    say(b, first); v.lineGap = L.gap;
    if (v.rival === "ilia") floater(b.x, b.y - b.r - 50, "UFC 298 REMATCH", "note");
    if (v.rival === "max") floater(b.x, b.y - b.r - 50, "UP 3-0", "note");
  }
  // Against Ilia, once he's hurt him: the humble pie line.
  if (v.rival === "ilia" && L.rival && !v.said.humble && other.hp < MAX_HP * 0.5 && v.lineGap <= 0 && canSay(b) && !kangarooOn(b)) { v.said.humble = true; volkSay(b, VK_LINES.humble, cfg); }
}

// ---------------------------------------------------------------- the Kangaroo (his special)

// From updateSpecial (special.js) for special.move "kangaroo".
function updateKangaroo(self, other, dt) {
  var sp = self.char.special;
  if (!self.igbb) {
    if (self.specialT < sp.chargeTime || !canStartIgbb(self, other) || over) return false;
    startKangaroo(self, other, sp);
    return true;
  }
  var m = self.igbb;
  if (m.move !== "kangaroo") return false;
  m.t += dt; m.all += dt;
  self.vx = 0; self.vy = 0;
  self.slamSafe = Math.max(self.slamSafe, 0.05); // nothing touches him while he's on the kangaroo (a silent miss)
  var roo = vkRoo;
  if (roo) tickRoo(roo, dt);
  tickKrVictim(self, other, m, dt);
  if (!self.alive) { endKangaroo(self, other, false); return false; }
  if (over && other.alive === false) { kangarooWin(self, other, m, dt); return true; }
  if (m.all > KR_GIVEUP && m.phase !== "out") { krOut(self, other, m); }

  if (m.phase === "call") {
    // Arms up while the cameras flash and it all goes green and gold.
    if (!m.lit && m.t >= 0.2) {
      m.lit = true;
      aussieStart(self);
      if ((vkCfg(self) || {}).lines) say(self, VK_LINES.unexpected);
    }
    if (m.t >= KR_CALL) {
      m.phase = "roo"; m.t = 0;
      vkRoo = roo = rooEnters(self, other);
      floater(W / 2, H - 50, "A KANGAROO?!", "note");
    }
    return true;
  }
  if (m.phase === "roo") {
    // Bounding in through the crowd and over the cage, to beside him.
    if (roo.mode === "stand" && roo.t > 0.1) {
      m.phase = "into"; m.t = 0;
      m.fx = self.x; m.fy = self.y;
      playWhoosh();
    }
    return true;
  }
  if (m.phase === "into") {
    // Hops up into the pouch.
    var k = Math.min(1, m.t / KR_INTO), e = k * k * (3 - 2 * k), pp = rooPt(roo, KR_POUCH.x, KR_POUCH.y);
    self.x = m.fx + (pp.x - m.fx) * e; self.y = m.fy + (pp.y - m.fy) * e - Math.sin(Math.PI * k) * 60;
    m.scale = 1 + (KR_IN_POUCH - 1) * e;
    if (k >= 1) {
      m.phase = "chase"; m.t = 0; m.round = 0; m.hops = 0; m.pouched = true;
      floater(self.x, self.y - 60, "INTO THE POUCH!", "crit");
      playRooBoing(1.3);
      crowdReact(0.8);
    }
    return true;
  }
  if (m.pouched) { var pq = rooPt(roo, KR_POUCH.x, KR_POUCH.y); self.x = pq.x; self.y = pq.y; }
  if (m.phase === "chase") {
    if (roo.mode !== "stand" || roo.t < 0.08) return true;
    // Landed. Close enough and free to grab: caught.
    var hold = krHoldSpot(roo, other);
    var cd = Math.hypot(other.x - hold.x, other.y - hold.y);
    if (other.alive && krGrabbable(other) && cd < (m.hops >= sp.hops ? KR_CATCH * 1.6 : KR_CATCH)) { krCatch(self, other, m); return true; }
    if (m.hops >= sp.hops + 2 || (!krGrabbable(other) && m.t > 4)) { floater(other.x, other.y - other.r - 30, "GOT AWAY!", "note"); krNextRound(self, other, m); return true; }
    // Another bound after them (the last ones lead them).
    var lead = m.hops >= sp.hops - 1 ? KR_HOP : 0;
    rooHopToward(roo, other, lead);
    m.hops++;
    return true;
  }
  if (m.phase === "box") {
    // It holds them while he punches out of the pouch.
    var punches = krPick(sp.pouchPunches, m.round);
    if (m.pf) {
      m.pf.t += dt;
      if (!m.pf.hit && m.pf.t >= 0.06) { m.pf.hit = true; krPouchPunch(self, other, m.pf); }
      if (m.pf.t >= 0.15) m.pf = null;
    }
    if (!m.pf && m.thrown < punches && m.t >= 0.25 + m.thrown * KR_PUNCH_GAP) {
      m.pf = { t: 0, side: m.thrown % 2 ? -1 : 1, hit: false };
      m.thrown++;
    }
    if (m.thrown >= punches && !m.pf && m.t >= 0.25 + punches * KR_PUNCH_GAP + 0.1) {
      m.phase = "rear"; m.t = 0;
      roo.mode = "rear"; roo.t = 0;
      floater(other.x, other.y - other.r - 34, "ROO KICK!", "crit");
      playRooRear();
      // The tell: some of them see it coming and duck out.
      m.read = other.alive && Math.random() * 100 < (sp.readChance || 0);
    }
    return true;
  }
  if (m.phase === "rear") {
    roo.lean = Math.min(1, m.t / (KR_REAR * 0.7));
    if (m.read && m.t >= KR_REAR * 0.75 && other.dazed === "held") {
      // Ducked out just before the feet came through.
      other.dazed = false; other.holdAtOne = m.hold0;
      var away = -roo.face;
      other.vx = away * 120; other.vy = (other.y < H / 2 ? 1 : -1) * 420;
      setSpeed(other, (other.baseSpeed || SPEED) * 1.2);
      floater(other.x, other.y - other.r - 30, "DUCKED IT!", "dodge");
    }
    if (m.t >= KR_REAR) { m.phase = "kick"; m.t = 0; roo.mode = "kick"; roo.t = 0; playWhoosh(); }
    return true;
  }
  if (m.phase === "kick") {
    roo.kick = Math.min(1, m.t / KR_KICK);
    if (!m.kicked && m.t >= KR_KICK) { m.kicked = true; krKick(self, other, m, sp); }
    if (m.t >= KR_KICK + KR_RECOVER) {
      roo.mode = "stand"; roo.t = 0; roo.kick = 0; roo.lean = 0;
      krNextRound(self, other, m);
    }
    return true;
  }
  if (m.phase === "out") {
    // Hops back out of the pouch onto the mat.
    var ko = Math.min(1, m.t / KR_OUT), eo = ko * ko * (3 - 2 * ko);
    if (!m.outFrom) { var p0 = rooPt(roo, KR_POUCH.x, KR_POUCH.y); m.outFrom = { x: p0.x, y: p0.y }; m.outTo = krDropSpot(self, roo); }
    m.pouched = false;
    self.x = m.outFrom.x + (m.outTo.x - m.outFrom.x) * eo; self.y = m.outFrom.y + (m.outTo.y - m.outFrom.y) * eo - Math.sin(Math.PI * ko) * 50;
    m.scale = KR_IN_POUCH + (1 - KR_IN_POUCH) * eo;
    if (ko >= 1) {
      rooLeaves(roo);
      var cfg = vkCfg(self) || {};
      if (cfg.lines && canSay(self)) say(self, VK_LINES.fans);
      endKangaroo(self, other, true);
      return false;
    }
    return true;
  }
  return true;
}

function startKangaroo(self, other, sp) {
  clearActions(self);
  if (self.vk && self.vk.flag === 1) volkFlagOff(self);
  self.igbb = { move: "kangaroo", phase: "call", t: 0, all: 0, round: 0, hops: 0, scale: 1, thrown: 0, hold0: !!other.holdAtOne };
  self.vx = 0; self.vy = 0;
  floater(self.x, self.y - self.r - 30, "KANGAROO!", "crit");
  playWhoosh();
  crowdReact(0.6);
}

// The arena goes green and gold, the tune starts, the crowd goes up.
function aussieStart(self) {
  aussie.on = true; aussie.ownerId = self.id; aussie.chantT = 0.25; aussie.hold = null;
  cameraFlash(); // (dobronx.js)
  if (self.char.special.tune !== false) playVolkTune();
  startChairFrenzy(); // everyone on their feet (chairshot.js)
}
function aussieStop() {
  if (!aussie.on) return;
  aussie.on = false;
  if (!over) screenFlash = Math.max(screenFlash, 0.55); // a quick flash to swap it back
  endChairFrenzy();
  stopVolkTune(1.4);
}

function krPick(v, round) { return Array.isArray(v) ? v[Math.min(round, v.length - 1)] : v; }

// Free to be picked up by the kangaroo.
function krGrabbable(o) {
  return o.alive && !o.slam && !o.grappled && !o.grapple && !o.sprawl && !o.sprawled && !subLocked(o) && !o.guard && !o.koOut && !o.invincible && !o.igbb &&
    !o.dazed && o.x > 0 && o.x < W && o.y > 0 && o.y < H &&
    !(typeof tornadoOn === "function" && tornadoOn(o)) && !(typeof bearOn === "function" && bearOn(o)) && !o.torHeld && !o.bearHeld &&
    !(typeof duckDropOn === "function" && duckDropOn(o)) && !(typeof sendLocOn === "function" && sendLocOn(o)) && !(typeof hotSauceOn === "function" && hotSauceOn(o));
}

function krHoldX(o) { return KR_HOLD.x + (o.r + 3) / KR_S; }
function krHoldSpot(roo, o) { return rooPt(roo, krHoldX(o), KR_HOLD.y, true); }

function krCatch(self, other, m) {
  clearActions(other);
  other.flow = null; other.taunt = null;
  m.hold0 = !!other.holdAtOne;
  other.dazed = "held"; other.holdAtOne = true; other.vx = 0; other.vy = 0;
  m.phase = "box"; m.t = 0; m.thrown = 0; m.pf = null; m.kicked = false;
  m.grabFrom = { x: other.x, y: other.y };
  vkRoo.mode = "hold"; vkRoo.t = 0;
  floater(other.x, other.y - other.r - 34, "CAUGHT!", "crit");
  playRooBoing(0.8);
  crowdReact(0.7);
}

// The one it's got hold of is pulled in front of it, shaking.
function tickKrVictim(self, other, m, dt) {
  if (!other.alive) return;
  if (other.dazed !== "held" || !vkRoo || (m.phase !== "box" && m.phase !== "rear" && m.phase !== "kick")) return;
  var h = krHoldSpot(vkRoo, other), k = Math.min(1, dt * 14);
  h.x = Math.max(other.r, Math.min(W - other.r, h.x)); h.y = Math.max(other.r, Math.min(H - other.r, h.y));
  other.x += (h.x - other.x) * k; other.y += (h.y - other.y) * k;
  other.vx = 0; other.vy = 0;
}

function krPouchPunch(self, other, pf) {
  if (!other.alive) return;
  var sp = self.char.special;
  var dealt = hurt(other, sp.pouchDamage, "igbb", self.id);
  if (dealt > 0) playPunch(dealt * 1.6);
  var dx = other.x - self.x, dy = other.y - self.y, d = Math.sqrt(dx * dx + dy * dy) || 1;
  var cx = other.x - dx / d * other.r, cy = other.y - dy / d * other.r;
  other.squash = { t: 0.12, max: 0.12, nx: -dx / d, ny: -dy / d };
  other.flash = 0.14;
  impacts.push({ x: cx, y: cy, nx: -dx / d, ny: -dy / d, life: 0.26, max: 0.26, color: AUS.gold });
  igbbSparks(cx, cy, -dx / d, -dy / d, AUS.green, 8, 320);
  if (!reduceMotion) shake = Math.max(shake, 8);
  hitStop = Math.max(hitStop, 0.04);
  crowdReact(0.2);
  checkEnd();
}

function krKick(self, other, m, sp) {
  var roo = vkRoo, dmg = krPick(sp.kickDamage, m.round);
  if (!other.alive || other.dazed !== "held") {
    var foot = rooPt(roo, 80, -50);
    floater(foot.x, foot.y - 30, "WHIFF", "note");
    playRooWhiff();
    return;
  }
  other.dazed = false; other.holdAtOne = m.hold0;
  var dealt = hurt(other, dmg, "igbb", self.id);
  var ky = (Math.random() - 0.5) * 0.5, kl = Math.sqrt(1 + ky * ky);
  var dirX = roo.face / kl, dirY = ky / kl;
  var foot2 = rooPt(roo, krHoldX(other) - other.r / KR_S * 0.7, -46);
  impacts.push({ x: foot2.x, y: foot2.y, nx: dirX, ny: dirY, life: 0.6, max: 0.6, color: AUS.gold });
  impacts.push({ x: foot2.x, y: foot2.y, nx: dirX, ny: dirY, life: 0.8, max: 0.8, color: theme.hit });
  igbbSparks(foot2.x, foot2.y, dirX, dirY, AUS.green, 24, 560);
  violentHit(self, other, 1.4); // (gaethje.js)
  hitStop = Math.max(hitStop, 0.16);
  if (!reduceMotion) shake = Math.max(shake, 30);
  playRooKick(dealt);
  floater(other.x, other.y - other.r - 40, m.round ? "BOOMER!" : "SKIPPY!", "crit");
  crowdReact(1);
  if (other.alive) beginWallSlam(other, dirX, dirY, { wallSlams: krPick(sp.walls, m.round), slamDamage: sp.wallDamage, knockback: sp.knockback });
  checkEnd();
}

function krNextRound(self, other, m) {
  m.round++;
  var sp = self.char.special;
  if (other.dazed === "held") { other.dazed = false; other.holdAtOne = m.hold0; }
  if (m.round >= (sp.rounds || 1) || !other.alive) { krOut(self, other, m); return; }
  m.phase = "chase"; m.t = 0; m.hops = 0; m.thrown = 0; m.kicked = false;
}

function krOut(self, other, m) {
  if (other.dazed === "held") { other.dazed = false; other.holdAtOne = m.hold0; }
  if (!vkRoo) { endKangaroo(self, other, true); return; }
  m.phase = "out"; m.t = 0; m.outFrom = null;
  vkRoo.mode = "stand"; vkRoo.t = 0; vkRoo.kick = 0; vkRoo.lean = 0;
}

// Where he lands hopping out: beside it, on the mat, inside the cage.
function krDropSpot(self, roo) {
  var x = roo.x - roo.face * 30, y = roo.y - self.r * 0.2;
  return { x: Math.max(self.r, Math.min(W - self.r, x)), y: Math.max(self.r, Math.min(H - self.r, y)) };
}

// After the knockout: it stands there with him in the pouch, fists up.
function kangarooWin(self, other, m, dt) {
  if (m.phase !== "win") {
    if (other.dazed === "held") other.dazed = false;
    m.phase = "win"; m.t = 0;
    if (vkRoo && vkRoo.mode !== "hop") { vkRoo.mode = "stand"; vkRoo.t = 0; vkRoo.kick = 0; vkRoo.lean = 0; }
    if (!m.pouched && vkRoo) { m.pouched = true; m.scale = KR_IN_POUCH; }
    if (!vkRoo) { m.pouched = false; m.scale = 1; }
  }
  if (m.pouched && vkRoo) { var p = rooPt(vkRoo, KR_POUCH.x, KR_POUCH.y); self.x = p.x; self.y = p.y; }
}

function endKangaroo(self, other, landed) {
  if (other && other.dazed === "held") other.dazed = false;
  if (other && self.igbb) other.holdAtOne = self.igbb.hold0;
  self.igbb = null; self.koPunch = null;
  if (landed) self.specialT = 0;
  self.slamSafe = 0;
  var spot = { x: Math.max(self.r, Math.min(W - self.r, self.x)), y: Math.max(self.r, Math.min(H - self.r, self.y)) };
  self.x = spot.x; self.y = spot.y;
  setSpeed(self, self.baseSpeed || SPEED);
}

// ---------------------------------------------------------------- the kangaroo

// A point on the kangaroo, from its own units to the arena (`ground`: ignores
// how high it's bounded).
function rooPt(roo, lx, ly, ground) {
  var tilt = roo.tilt || 0, dx = lx - KR_HIP.x, dy = ly - KR_HIP.y, c = Math.cos(tilt), s = Math.sin(tilt);
  var rx = KR_HIP.x + dx * c - dy * s, ry = KR_HIP.y + dx * s + dy * c + (roo.crouch || 0) * 10;
  return { x: roo.x + roo.face * rx * KR_S, y: roo.y + ry * KR_S - (ground ? 0 : roo.z) };
}

function krOffY() { return stadiumOn() ? (STAGE_H + 120 - ST.AY) * W / ST.A : H + 240; }

function rooEnters(self, other) {
  var face = other.x >= self.x ? 1 : -1;
  var tx = self.x - face * 46 * KR_S, ty = Math.max(130, Math.min(H - 6, self.y + self.r * 0.8));
  tx = Math.max(60, Math.min(W - 60, tx));
  var roo = { x: Math.max(80, Math.min(W - 80, tx + (Math.random() - 0.5) * 120)), y: krOffY(), z: 0, face: face, mode: "stand", t: 0,
    tilt: 0, crouch: 0, lean: 0, kick: 0, alpha: 1, goal: { x: tx, y: ty, face: face }, hopH: KR_HOP_H * 1.4, long: true };
  rooNextHop(roo);
  return roo;
}

// One bound toward roo.goal (or the whole way if it's close).
function rooNextHop(roo) {
  var g = roo.goal, dx = g.x - roo.x, dy = g.y - roo.y, d = Math.sqrt(dx * dx + dy * dy);
  if (d < 2) { roo.mode = "stand"; roo.t = 0; roo.face = g.face || roo.face; return false; }
  var len = Math.min(d, roo.long ? 250 : KR_HOP_LEN);
  roo.hop = { sx: roo.x, sy: roo.y, ex: roo.x + dx / d * len, ey: roo.y + dy / d * len, t: 0, dur: KR_HOP * (0.65 + 0.35 * len / KR_HOP_LEN), h: roo.hopH || KR_HOP_H };
  if (Math.abs(dx) > 8) roo.face = dx > 0 ? 1 : -1;
  roo.mode = "hop"; roo.t = 0;
  return true;
}

// The next bound after them: to the side of them nearer the middle, facing
// them, so the kick sends them into the cage.
function rooHopToward(roo, other, lead) {
  var ox = other.x + (lead ? other.vx * lead : 0), oy = other.y + (lead ? other.vy * lead : 0);
  ox = Math.max(other.r, Math.min(W - other.r, ox)); oy = Math.max(other.r, Math.min(H - other.r, oy));
  var face = ox >= W / 2 ? 1 : -1;
  var gx = ox - face * krHoldX(other) * KR_S, gy = Math.max(118, Math.min(H - 4, oy - KR_HOLD.y * KR_S));
  roo.goal = { x: gx, y: gy, face: face };
  roo.hopH = KR_HOP_H; roo.single = true; roo.long = false; // one bound at a time: it looks again after each one
  if (!rooNextHop(roo)) { roo.mode = "stand"; roo.t = 0.1; }
}

function rooLeaves(roo) {
  roo.leaving = true; roo.long = true; roo.single = false;
  roo.goal = { x: Math.max(60, Math.min(W - 60, roo.x + roo.face * 40)), y: krOffY() + 60, face: roo.face };
  roo.hopH = KR_HOP_H * 1.4;
  rooNextHop(roo);
}

// Runs every frame while the kangaroo's about (from his special, then on its
// own once it's leaving, from tickAussie).
function tickRoo(roo, dt) {
  roo.t += dt;
  if (roo.mode === "hop") {
    var h = roo.hop;
    h.t += dt;
    var k = Math.min(1, h.t / h.dur);
    roo.x = h.sx + (h.ex - h.sx) * k; roo.y = h.sy + (h.ey - h.sy) * k;
    roo.z = Math.sin(Math.PI * k) * h.h;
    roo.air = Math.sin(Math.PI * k);
    roo.tilt = 0.32 * roo.air;
    roo.crouch = Math.max(0, 1 - k / 0.18) * 0.8;
    if (k >= 1) {
      roo.z = 0; roo.air = 0; roo.tilt = 0;
      rooLanded(roo);
      if (roo.single || !rooNextHop(roo)) { roo.mode = "stand"; roo.t = 0; if (roo.single) roo.face = roo.goal.face || roo.face; }
    }
  } else {
    roo.air = 0; roo.z = 0;
    roo.crouch = Math.max(0, (roo.crouch || 0) - dt * 5);
    roo.tilt = roo.mode === "rear" || roo.mode === "kick" ? -0.5 * (roo.lean || 0) : 0;
  }
}

function rooLanded(roo) {
  roo.crouch = 1;
  var inside = roo.x > 0 && roo.x < W && roo.y > 0 && roo.y < H;
  playRooBoing(inside ? 1 : 0.6);
  if (inside && !reduceMotion) {
    shake = Math.max(shake, 5);
    for (var i = 0; i < 10; i++) {
      var a = Math.random() * Math.PI * 2, sp = 60 + Math.random() * 150;
      particles.push({ x: roo.x + Math.cos(a) * 20, y: roo.y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp * 0.4 - 20, life: 0.45, max: 0.45, size: 4 + Math.random() * 4, color: "rgba(170,150,120,0.6)" });
    }
  }
}

// ---------------------------------------------------------------- the green and gold arena

// From update(), through tickVolk: the arena fading in and out, the chant,
// the streamers, the kangaroo leaving.
function tickAussie(dt) {
  if (vkRoo && vkRoo.leaving) {
    tickRoo(vkRoo, dt);
    var out = vkRoo.y > krOffY() - 10 || (!stadiumOn() && vkRoo.y > H + 200);
    if (vkRoo.mode === "stand" || out) vkRoo.alpha = Math.max(0, vkRoo.alpha - dt * 3);
    if (vkRoo.alpha <= 0) vkRoo = null;
  }
  // Once his special's over, it stays green and gold a moment, until the
  // kangaroo's gone. (After a win it stays.)
  if (aussie.on && !over && !balls.some(kangarooOn)) {
    aussie.hold = (aussie.hold == null ? 1 : aussie.hold) - dt;
    if (aussie.hold <= 0 && !vkRoo) aussieStop();
  }
  var target = aussie.on ? 1 : 0;
  aussie.k = target > aussie.k ? Math.min(1, aussie.k + dt / 0.25) : Math.max(0, aussie.k - dt / 0.5);
  if (aussie.on && !over) {
    aussie.chantT -= dt;
    if (aussie.chantT <= 0) { aussieChant(); aussie.chantT = 3.4; }
  }
  aussie.echoes.forEach(function (e) { e.t += dt; });
  aussie.echoes = aussie.echoes.filter(function (e) { return e.t < 2.4; });
  // Green and gold streamers floating down.
  if (aussie.k > 0.5 && !reduceMotion && aussie.ribbons.length < 60 && Math.random() < dt * 22) {
    var sx = stadiumOn() ? Math.random() * STAGE_W : Math.random() * W;
    aussie.ribbons.push({ x: sx, y: -20, vy: 120 + Math.random() * 120, sw: Math.random() * 6.28, rate: 3 + Math.random() * 4, col: Math.random() < 0.5 ? AUS.green : AUS.gold, len: 10 + Math.random() * 10, t: 0 });
  }
  var floor = stadiumOn() ? STAGE_H + 30 : H + 30;
  aussie.ribbons.forEach(function (r) { r.t += dt; r.y += r.vy * dt; r.sw += r.rate * dt; r.x += Math.sin(r.sw) * 30 * dt; });
  aussie.ribbons = aussie.ribbons.filter(function (r) { return r.y < floor && (aussie.k > 0 || r.t < 0.5); });
}

// AUSSIE AUSSIE AUSSIE from one side of the stands, OI OI OI back from the other.
function aussieChant() {
  var spots = [], spots2 = [];
  for (var i = 0; i < 4; i++) {
    if (stadiumOn()) {
      spots.push({ x: 170 + i * 250 + (Math.random() - 0.5) * 80, y: 1430 + Math.random() * 120, d: i * 0.07 });
      spots2.push({ x: 150 + i * 260 + (Math.random() - 0.5) * 80, y: 120 + Math.random() * 60, d: 1.15 + i * 0.07 });
    } else {
      spots.push({ x: 70 + i * 120, y: H - 22, d: i * 0.07 });
      spots2.push({ x: 70 + i * 120, y: 24, d: 1.15 + i * 0.07 });
    }
  }
  aussie.echoes.push({ t: 0, text: "AUSSIE AUSSIE AUSSIE!", spots: spots });
  aussie.echoes.push({ t: 0, text: "OI! OI! OI!", spots: spots2 });
  playAussieChant();
  crowdReact(0.5);
}

// ---------------------------------------------------------------- drawing hooks

// The ball itself: leaning into his circling, small in the pouch (draw.js,
// with the other body poses).
function applyVolkPose(b) {
  if (!b.vk || !b.alive) return;
  var m = b.igbb;
  if (kangarooOn(b) && m.scale != null && m.scale !== 1) {
    ctx.translate(b.x, b.y); ctx.scale(m.scale, m.scale); ctx.translate(-b.x, -b.y);
    return;
  }
  if (b.vk.circling || Math.abs(b.vk.lean) > 0.02) {
    var ay = b.y + b.r, l = b.vk.lean * 0.13;
    ctx.translate(b.x, ay); ctx.rotate(l); ctx.translate(-b.x, -ay);
  }
}

// Busy hands: arms up for the call, or punching out of the pouch (drawVolk).
function volkHandsBusy(b) { return kangarooOn(b); }

// Under the fighters: the circling arrow, his walkout flag, the kangaroo's
// shadow and its body (he sits in front of it, they're held in front of it).
function drawVolkUnder() {
  balls.forEach(function (b) {
    if (!b.vk || !b.alive) return;
    drawVolkCircleArrow(b);
    if (b.vk.flag === 1) drawVolkFlagCape(b);
  });
  if (vkRoo) {
    drawRooShadow(vkRoo);
    var m = vkRooOwner() && vkRooOwner().igbb;
    if (m && m.phase === "rear") drawRooKickPath(vkRoo, m);
    drawKangaroo(ctx, vkRoo, "back");
  }
}
function vkRooOwner() { var b = balls[aussie.ownerId]; return b && kangarooOn(b) ? b : null; }

// The dashed arrow round them on the mat, the way he's circling.
function drawVolkCircleArrow(b) {
  var v = b.vk, o = balls[1 - b.id];
  if (!v.circling || !o.alive) return;
  var dx = b.x - o.x, dy = b.y - o.y, d = Math.sqrt(dx * dx + dy * dy) || 1;
  if (d > b.r + o.r + 150) return;
  var a0 = Math.atan2(dy, dx), sweep = 1.75 * v.dir, R = d;
  var a1 = a0 + sweep, flash = v.pivotFx > 0 ? v.pivotFx / 0.35 : 0;
  ctx.save();
  ctx.beginPath(); ctx.rect(0, 0, W, H); ctx.clip();
  ctx.lineCap = "round";
  ctx.globalAlpha = 0.42 + 0.4 * flash;
  ctx.strokeStyle = b.char.color; ctx.lineWidth = 3.5 + 3 * flash;
  ctx.setLineDash([9, 8]); ctx.lineDashOffset = -vkClock * 40 * v.dir;
  ctx.beginPath(); ctx.arc(o.x, o.y, R, a0 + 0.35 * v.dir, a1, v.dir < 0); ctx.stroke();
  ctx.setLineDash([]);
  // the arrowhead
  var hx = o.x + Math.cos(a1) * R, hy = o.y + Math.sin(a1) * R;
  var tx = -Math.sin(a1) * v.dir, ty = Math.cos(a1) * v.dir;
  ctx.fillStyle = b.char.color;
  ctx.beginPath();
  ctx.moveTo(hx + tx * 12, hy + ty * 12);
  ctx.lineTo(hx - tx * 3 + Math.cos(a1) * 9, hy - ty * 3 + Math.sin(a1) * 9);
  ctx.lineTo(hx - tx * 3 - Math.cos(a1) * 9, hy - ty * 3 - Math.sin(a1) * 9);
  ctx.closePath(); ctx.fill();
  ctx.restore();
}

// His walkout flag round his shoulders, hanging down behind him.
function drawVolkFlagCape(b) {
  var r = b.r, sway = Math.sin(vkClock * 5) * r * 0.05;
  ctx.save();
  ctx.translate(b.x, b.y - r * 0.25);
  ctx.beginPath();
  ctx.moveTo(-r * 1.15, -r * 0.1); ctx.lineTo(r * 1.15, -r * 0.1);
  ctx.lineTo(r * 1.25 + sway, r * 1.35); ctx.quadraticCurveTo(0, r * 1.5, -r * 1.25 + sway, r * 1.35); ctx.closePath();
  ctx.clip();
  drawAusFlagRect(ctx, -r * 1.3, -r * 0.1, r * 2.6, r * 1.6);
  ctx.restore();
  ctx.save();
  ctx.translate(b.x, b.y - r * 0.25);
  ctx.strokeStyle = theme.wall; ctx.lineWidth = 2.5; ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(-r * 1.15, -r * 0.1); ctx.lineTo(-r * 1.25 + sway, r * 1.35); ctx.quadraticCurveTo(0, r * 1.5, r * 1.25 + sway, r * 1.35); ctx.lineTo(r * 1.15, -r * 0.1);
  ctx.stroke();
  ctx.restore();
}

// Per fighter, after its hands: his arms up for the call, punching out of the
// pouch, fists up after a win in it. From draw().
function drawVolk(b) {
  if (!b.vk || !b.alive) return;
  var m = b.igbb;
  if (!kangarooOn(b)) return;
  var s = m.scale || 1, r = b.r * s, o = balls[1 - b.id];
  if (m.phase === "call" || m.phase === "roo" || m.phase === "into" || m.phase === "out") {
    // Both arms up to the crowd.
    var pump = Math.abs(Math.sin(m.all * 9)) * r * 0.3;
    [-1, 1].forEach(function (sg, i) { vkArm(b, b.x + sg * r * 0.6, b.y - r * 0.4, b.x + sg * r * 0.95, b.y - r * 1.15 - (i ? pump : r * 0.3 - pump), r * 0.3, -Math.PI / 2); });
    return;
  }
  if (!m.pouched) return;
  // In the pouch: the guard up, and the punch out at them.
  var dx = o.x - b.x, dy = o.y - b.y, d = Math.sqrt(dx * dx + dy * dy) || 1, ux = dx / d, uy = dy / d;
  var face = vkRoo ? vkRoo.face : (ux >= 0 ? 1 : -1);
  if (m.phase === "win") {
    var wp = Math.abs(Math.sin(m.t * 10)) * r * 0.35;
    [-1, 1].forEach(function (sg, i) { vkArm(b, b.x + sg * r * 0.55, b.y - r * 0.35, b.x + sg * r * 0.85, b.y - r * 1.15 - (i ? wp : r * 0.35 - wp), r * 0.3, -Math.PI / 2); });
    return;
  }
  [-1, 1].forEach(function (sg) {
    var punching = m.pf && m.pf.side === sg && m.phase === "box";
    var sx = b.x + face * r * 0.35 + sg * r * 0.18, sy = b.y - r * 0.05 + sg * r * 0.2;
    var hx, hy;
    if (punching) {
      var k = Math.sin(Math.PI * Math.min(1, m.pf.t / 0.15));
      var reach = Math.max(r * 0.9, d - o.r * 0.85);
      hx = b.x + ux * reach * (0.45 + 0.55 * k) + sg * r * 0.12; hy = b.y + uy * reach * (0.45 + 0.55 * k) + sg * r * 0.1;
    } else {
      hx = b.x + face * r * 0.95; hy = b.y - r * 0.35 + sg * r * 0.32;
    }
    vkArm(b, sx, sy, hx, hy, r * 0.32, Math.atan2(hy - sy, hx - sx));
  });
}
function vkArm(b, sx, sy, hx, hy, gr, ang) {
  ctx.save();
  ctx.lineCap = "round";
  if (hasArmMuscle(b.char)) drawArmMuscle(ctx, b.char, sx, sy, hx, hy, gr * 0.65, theme.wall);
  else {
    ctx.strokeStyle = theme.wall; ctx.lineWidth = gr * 1.05 + 4;
    ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(hx, hy); ctx.stroke();
    ctx.strokeStyle = armColor(b.char); ctx.lineWidth = gr * 0.68;
    ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(hx, hy); ctx.stroke();
  }
  if (b.char.look) drawGlove(ctx, hx, hy, gr, b.char.look, theme.wall, ang);
  else { ctx.fillStyle = gloveColor(b.char); ctx.strokeStyle = theme.wall; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(hx, hy, gr, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); }
  ctx.restore();
}

// Over the fighters: the front of the pouch over him, its arms holding them,
// its feet kicking, the FIGHT IQ card, the flag flying off. From draw().
function drawVolkOver() {
  if (vkRoo) drawKangaroo(ctx, vkRoo, "front");
  vkCloth.forEach(function (p) {
    var k = p.t / p.dur, r = p.r;
    ctx.save();
    ctx.globalAlpha = Math.max(0, Math.min(1, (1 - k) * 3));
    ctx.translate(p.x, p.y); ctx.rotate(p.rot);
    drawAusFlagRect(ctx, -r * 1.1, -r * 0.65, r * 2.2, r * 1.3);
    ctx.strokeStyle = theme.wall; ctx.lineWidth = 2; ctx.strokeRect(-r * 1.1, -r * 0.65, r * 2.2, r * 1.3);
    ctx.restore();
  });
  balls.forEach(function (b) {
    var v = b.vk;
    if (!v || !b.alive || !v.card || !started || over) return;
    var cfg = vkCfg(b) || {}, dur = (cfg.gamePlan && cfg.gamePlan.card) || 2.6;
    if (v.card.t < dur) drawFightIqCard(b, v, v.card, dur);
  });
}

// The FIGHT IQ card: the two threat scores and the plan he picked.
function drawFightIqCard(b, v, card, dur) {
  var w = 132, h = 74, sc = v.read || { sub: 0, strike: 0 };
  // Beside him (speech bubbles go over and under), away from them if there's room.
  var o = balls[1 - b.id], side = o.x >= b.x ? -1 : 1;
  if (side < 0 && b.x - b.r - 14 - w < 2) side = 1;
  else if (side > 0 && b.x + b.r + 14 + w > W - 2) side = -1;
  var x = side > 0 ? b.x + b.r + 14 : b.x - b.r - 14 - w;
  x = Math.max(4, Math.min(W - w - 4, x));
  var y = Math.max(4, Math.min(H - h - 4, b.y - h / 2));
  var pop = Math.min(1, card.t / 0.15) * Math.min(1, (dur - card.t) / 0.3);
  ctx.save();
  ctx.globalAlpha = Math.max(0, pop);
  ctx.fillStyle = "#0e1f16"; ctx.strokeStyle = AUS.gold; ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.roundRect(x, y, w, h, 7); ctx.fill(); ctx.stroke();
  ctx.fillStyle = AUS.green; ctx.beginPath(); ctx.roundRect(x + 3, y + 3, w - 6, 16, 4); ctx.fill();
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.font = '900 13px "Barlow Condensed", "Arial Narrow", sans-serif';
  ctx.fillStyle = AUS.gold; ctx.fillText(card.title, x + w / 2, y + 11.5);
  // the two scores, filling in
  var fill = Math.min(1, card.t / 0.6);
  [["SUBS", sc.sub, "#e4572e"], ["STRIKES", sc.strike, "#f2a531"]].forEach(function (row, i) {
    var ry = y + 26 + i * 13;
    ctx.font = '800 11px "Barlow Condensed", "Arial Narrow", sans-serif';
    ctx.textAlign = "left"; ctx.fillStyle = "#e9efe9"; ctx.fillText(row[0], x + 7, ry + 1);
    ctx.fillStyle = "#24392d"; ctx.fillRect(x + 50, ry - 4, w - 84, 8);
    ctx.fillStyle = row[2]; ctx.fillRect(x + 50, ry - 4, (w - 84) * row[1] / 100 * fill, 8);
    ctx.textAlign = "right"; ctx.fillStyle = "#e9efe9"; ctx.fillText(String(Math.round(row[1] * fill)), x + w - 7, ry + 1);
  });
  ctx.textAlign = "center";
  ctx.font = '900 19px "Barlow Condensed", "Arial Narrow", sans-serif';
  ctx.fillStyle = AUS.gold; ctx.fillText(VK_PLAN_NAMES[card.plan], x + w / 2, y + h - 17);
  ctx.font = '700 10px "Barlow Condensed", "Arial Narrow", sans-serif';
  ctx.fillStyle = "#bfe3cb"; ctx.fillText(VK_PLAN_NOTES[card.plan], x + w / 2, y + h - 5.5);
  ctx.restore();
}

function drawRooShadow(roo) {
  var k = Math.min(1, roo.z / 80);
  ctx.save();
  ctx.globalAlpha = (0.3 - 0.12 * k) * roo.alpha;
  ctx.fillStyle = "#000000";
  ctx.beginPath(); ctx.ellipse(roo.x - roo.face * 6, roo.y + 2, 52 * KR_S * (1 - 0.3 * k), 11 * KR_S * (1 - 0.3 * k), 0, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

// The tell: a red chevron path out of its feet, the way the kick will go.
function drawRooKickPath(roo, m) {
  var f = rooPt(roo, 96, -46, true), k = Math.min(1, m.t / KR_REAR);
  ctx.save();
  ctx.globalAlpha = 0.25 + 0.55 * k;
  ctx.fillStyle = theme.hit;
  for (var i = 0; i < 4; i++) {
    var cx = f.x + roo.face * (20 + i * 34), cy = f.y, s = 13;
    if (cx < 0 || cx > W) break;
    ctx.beginPath();
    ctx.moveTo(cx - roo.face * s * 0.6, cy - s); ctx.lineTo(cx + roo.face * s * 0.5, cy); ctx.lineTo(cx - roo.face * s * 0.6, cy + s);
    ctx.lineTo(cx - roo.face * s * 0.15, cy); ctx.closePath(); ctx.fill();
  }
  ctx.restore();
}

// ---------------------------------------------------------------- the kangaroo art

var ROO = { body: "#b65a2a", dark: "#8c4220", belly: "#ecc99c", ear: "#d99878", nose: "#2a1a14" };

// The kangaroo in two layers: "back" (tail, legs, body, head, the inside of
// the pouch) goes under the fighters, "front" (the front of the pouch, its
// arms, its legs while it kicks) over them. `opts.silhouette` fills it in one
// colour (the road sign on the mat).
function drawKangaroo(c, roo, layer, opts) {
  opts = opts || {};
  var sil = opts.silhouette, ink = sil ? null : (opts.ink || theme.wall), s = opts.scale || KR_S;
  var air = roo.air || 0, lean = roo.lean || 0, kick = roo.kick || 0, crouch = roo.crouch || 0, tilt = roo.tilt || 0;
  var kicking = roo.mode === "rear" || roo.mode === "kick";
  var holding = roo.mode === "hold" || kicking;
  c.save();
  if (roo.alpha != null && roo.alpha < 1) c.globalAlpha *= roo.alpha;
  c.translate(roo.x, roo.y - (roo.z || 0));
  c.scale(roo.face * s, s);
  c.lineJoin = "round"; c.lineCap = "round";
  function paint(fill) {
    if (sil) { c.fillStyle = sil; c.fill(); return; }
    c.fillStyle = fill; c.fill();
    c.strokeStyle = ink; c.lineWidth = 3 / s; c.stroke();
  }
  function bodyXf() {
    c.translate(0, crouch * 10);
    c.translate(KR_HIP.x, KR_HIP.y); c.rotate(tilt); c.translate(-KR_HIP.x, -KR_HIP.y);
  }
  // A leg: the thigh and the long foot, swung round the hip by `rot`.
  function leg(dx, fill, rot, ext) {
    c.save();
    c.translate(dx, crouch * 6);
    c.translate(KR_HIP.x, KR_HIP.y); c.rotate(rot); c.scale(ext, 1); c.translate(-KR_HIP.x, -KR_HIP.y);
    if (kicking) { c.translate(0, -1); c.scale(1, 1 + 0.5 * kick); }
    c.beginPath(); c.moveTo(-22, -10); c.quadraticCurveTo(10, -15, 50, -5); c.quadraticCurveTo(55, -1, 49, 2); c.lineTo(-18, 2); c.quadraticCurveTo(-27, -1, -22, -10); c.closePath();
    paint(fill);
    c.restore();
    c.save();
    c.translate(dx, crouch * 8);
    c.translate(KR_HIP.x, KR_HIP.y); c.rotate(rot * 0.55 + tilt * 0.4); c.translate(-KR_HIP.x, -KR_HIP.y);
    c.beginPath(); c.ellipse(-6, -34 + crouch * 4, 27, 31 - crouch * 4, -0.45, 0, Math.PI * 2);
    paint(fill);
    c.restore();
  }
  var legRot = kicking ? -0.85 * kick - 0.15 * lean : air * 1.6;
  var legExt = kicking ? 1 + 0.5 * kick : 1;

  if (layer === "back") {
    // the tail, lifting in the air
    c.save();
    c.translate(-24, -34); c.rotate(-air * 0.35 + lean * 0.1); c.translate(24, 34);
    c.beginPath(); c.moveTo(-26, -48); c.quadraticCurveTo(-72, -32, -106, -5); c.quadraticCurveTo(-110, 2, -100, 2); c.quadraticCurveTo(-64, -6, -16, -22); c.closePath();
    paint(ROO.dark);
    c.restore();
    if (!kicking) leg(8, ROO.dark, legRot, legExt); // the far leg
    // the body
    c.save();
    bodyXf();
    c.beginPath();
    c.moveTo(-30, -42);
    c.bezierCurveTo(-42, -92, -22, -126, 0, -131);
    c.quadraticCurveTo(14, -135, 22, -127);
    c.bezierCurveTo(40, -113, 49, -80, 43, -56);
    c.quadraticCurveTo(35, -30, 10, -24);
    c.quadraticCurveTo(-18, -24, -30, -42);
    c.closePath();
    paint(ROO.body);
    if (!sil) {
      c.fillStyle = ROO.belly; c.beginPath(); c.ellipse(25, -80, 17, 35, -0.12, 0, Math.PI * 2); c.fill();
      // the opening of the pouch
      c.fillStyle = "#5a2c16"; c.beginPath(); c.ellipse(22, -88, 21, 6, -0.05, 0, Math.PI * 2); c.fill();
    }
    // the head: ears, skull, long muzzle, nose and eye
    [[-3, -168, -0.5], [8, -171, -0.18]].forEach(function (e) {
      c.beginPath(); c.ellipse(e[0], e[1], 6.5, 16, e[2], 0, Math.PI * 2); paint(ROO.body);
      if (!sil) { c.fillStyle = ROO.ear; c.beginPath(); c.ellipse(e[0] + 1, e[1] + 2, 3, 10, e[2], 0, Math.PI * 2); c.fill(); }
    });
    c.beginPath(); c.ellipse(10, -148, 17, 14.5, 0, 0, Math.PI * 2); paint(ROO.body);
    c.beginPath(); c.ellipse(30, -142, 16, 9.5, 0.14, 0, Math.PI * 2); paint(ROO.body);
    if (!sil) {
      c.fillStyle = ROO.belly; c.beginPath(); c.ellipse(31, -137, 11, 4, 0.14, 0, Math.PI * 2); c.fill();
      c.fillStyle = ROO.nose; c.beginPath(); c.ellipse(44, -144, 4.5, 3.4, 0.2, 0, Math.PI * 2); c.fill();
      c.beginPath(); c.arc(15, -153, 2.8, 0, Math.PI * 2); c.fill();
      c.fillStyle = "#ffffff"; c.beginPath(); c.arc(15.8, -153.8, 0.9, 0, Math.PI * 2); c.fill();
    }
    if (sil) {
      // (the road sign: arms and the near leg in the same colour)
      armsPath(false);
      c.restore();
      leg(-4, ROO.body, legRot, legExt);
    } else {
      c.restore();
      if (!kicking) leg(-4, ROO.body, legRot, legExt); // the near leg
    }
  } else {
    if (kicking) { leg(8, ROO.dark, legRot, legExt); leg(-4, ROO.body, legRot, legExt); }
    c.save();
    bodyXf();
    // the front of the pouch, over his shorts
    c.beginPath();
    c.moveTo(1, -88); c.quadraticCurveTo(22, -81, 43, -89);
    c.quadraticCurveTo(48, -64, 35, -51); c.quadraticCurveTo(21, -42, 7, -52); c.quadraticCurveTo(-3, -66, 1, -88);
    c.closePath();
    paint(ROO.belly);
    if (!sil) { c.strokeStyle = "rgba(120,70,40,0.5)"; c.lineWidth = 1.6 / s; c.beginPath(); c.moveTo(6, -84); c.quadraticCurveTo(22, -78, 39, -85); c.stroke(); }
    armsPath(holding);
    c.restore();
  }
  c.restore();

  // Its short arms: resting on its chest, or reaching out holding them.
  function armsPath(hold) {
    [[0, ROO.dark], [1, ROO.body]].forEach(function (a) {
      var sx = 24 + a[0] * 6, sy = -118 + a[0] * 3;
      var ex = hold ? 60 + a[0] * 12 : 40 + a[0] * 4, ey = hold ? -84 - a[0] * 8 : -100 + a[0] * 2;
      c.beginPath();
      c.moveTo(sx - 4, sy); c.quadraticCurveTo((sx + ex) / 2, (sy + ey) / 2 - 6, ex, ey - 4);
      c.quadraticCurveTo(ex + 6, ey, ex, ey + 5);
      c.quadraticCurveTo((sx + ex) / 2, (sy + ey) / 2 + 4, sx + 4, sy + 8);
      c.closePath();
      paint(a[1]);
    });
  }
}

// ---------------------------------------------------------------- the green and gold arena

// The stands, the walkway, the fans' flags and signs in green and gold (from
// draw(), right after the stadium).
function drawAussieStands(px) {
  if (aussie.k <= 0 || !stadiumOn()) return;
  var k = aussie.k, IN = ST.IN, ROW = 124, cage = { x: ST.AX - ST.CAGE, y: ST.AY - ST.CAGE, w: ST.A + ST.CAGE * 2, h: ST.A + ST.CAGE * 2 };
  ctx.save();
  ctx.setTransform(px, 0, 0, px, 0, 0);
  // The stands: whole rows in green and gold.
  ctx.save();
  ctx.beginPath(); ctx.rect(0, 0, STAGE_W, STAGE_H); ctx.rect(IN.x0, IN.y0, IN.x1 - IN.x0, IN.y1 - IN.y0); ctx.clip("evenodd");
  ctx.globalCompositeOperation = "color";
  ctx.globalAlpha = 0.85 * k;
  for (var r = 0; r <= ROWS_TB; r++) {
    ctx.fillStyle = r % 2 ? AUS.green : AUS.gold;
    ctx.fillRect(0, IN.y0 - ROW * (r + 1), STAGE_W, ROW);
    ctx.fillStyle = r % 2 ? AUS.gold : AUS.green;
    ctx.fillRect(0, IN.y1 + ROW * r, STAGE_W, ROW);
  }
  ctx.fillStyle = AUS.gold; ctx.fillRect(0, IN.y0, IN.x0, IN.y1 - IN.y0); ctx.fillRect(IN.x1, IN.y0, STAGE_W - IN.x1, IN.y1 - IN.y0);
  ctx.globalCompositeOperation = "source-over";
  ctx.globalAlpha = 0.14 * k;
  for (var r2 = 0; r2 <= ROWS_TB; r2++) {
    ctx.fillStyle = r2 % 2 ? AUS.green : AUS.gold;
    ctx.fillRect(0, IN.y0 - ROW * (r2 + 1), STAGE_W, ROW);
    ctx.fillStyle = r2 % 2 ? AUS.gold : AUS.green;
    ctx.fillRect(0, IN.y1 + ROW * r2, STAGE_W, ROW);
  }
  ctx.restore();
  // The walkway in green with gold lettering.
  ctx.save();
  ctx.beginPath(); ctx.rect(IN.x0, IN.y0, IN.x1 - IN.x0, IN.y1 - IN.y0); ctx.rect(cage.x, cage.y, cage.w, cage.h); ctx.clip("evenodd");
  ctx.globalAlpha = k;
  ctx.fillStyle = AUS.deep; ctx.fillRect(IN.x0, IN.y0, IN.x1 - IN.x0, IN.y1 - IN.y0);
  ctx.fillStyle = AUS.gold; ctx.textAlign = "center"; ctx.textBaseline = "middle";
  [IN.y0 + ST.APRON / 2 + 1, IN.y1 - ST.APRON / 2 + 1].forEach(function (ay) {
    for (var j = -1; j <= 1; j++) {
      ctx.globalAlpha = k * (j === 0 ? 1 : 0.65);
      ctx.font = "900 " + (j === 0 ? 30 : 21) + "px Impact, 'Arial Black', sans-serif";
      ctx.fillText(j === 0 ? "AUSTRALIA" : "OI OI OI", STAGE_W / 2 + j * 300, ay);
    }
  });
  ctx.restore();
  // Flags and signs over the fans.
  var t = performance.now() / 1000, signs = 0;
  ctx.globalAlpha = k;
  stadiumFans.forEach(function (f, i) {
    if (refClearsFan(f)) return;
    if (f.sign) {
      var fake = { x: f.x + (f.shx || 0), y: f.y + (f.shy || 0), r: f.r, rate: f.rate, phase: f.phase, sign: AUS_SIGNS[signs++ % AUS_SIGNS.length] };
      drawFanSign(fake, t);
    } else if (i % 6 === 2) {
      drawAusFlagWaving(f.x + f.r * 0.3, f.y - f.r * 1.55, f.r * 1.4, t, f.phase);
    }
  });
  ctx.restore();
}

// The mat (in the arena, under everything): a green wash and a gold line, the
// Southern Cross, and a kangaroo crossing sign faded into the middle.
function drawAussieMat() {
  if (aussie.k <= 0 || allAmericanOn()) return;
  var k = aussie.k;
  ctx.save();
  ctx.globalAlpha = 0.2 * k;
  ctx.fillStyle = AUS.green; ctx.fillRect(0, 0, W, H);
  var cx = W / 2, cy = H / 2, R = W * 0.47;
  ctx.globalAlpha = 0.7 * k; ctx.strokeStyle = AUS.gold; ctx.lineWidth = 6;
  ctx.beginPath();
  for (var i = 0; i <= 8; i++) { var an = Math.PI / 8 + i * Math.PI / 4; ctx[i ? "lineTo" : "moveTo"](cx + Math.cos(an) * R, cy + Math.sin(an) * R); }
  ctx.stroke();
  // the kangaroo crossing sign
  ctx.globalAlpha = 0.32 * k;
  ctx.save();
  ctx.translate(cx, cy); ctx.rotate(Math.PI / 4);
  ctx.fillStyle = AUS.gold; ctx.fillRect(-82, -82, 164, 164);
  ctx.strokeStyle = "#16211f"; ctx.lineWidth = 7; ctx.strokeRect(-74, -74, 148, 148);
  ctx.restore();
  drawKangaroo(ctx, { x: cx + 6, y: cy + 52, z: 0, face: 1, mode: "stand" }, "back", { silhouette: "#16211f", scale: 0.55 });
  // the Southern Cross in two corners
  ctx.globalAlpha = 0.55 * k;
  [[W * 0.14, H * 0.16], [W * 0.86, H * 0.84]].forEach(function (p) { drawSouthernCross(ctx, p[0], p[1], 34, AUS.gold); });
  ctx.restore();
}

// Over the jumbotron's top strip: OI! OI! OI! in gold on green (stadium.js).
function drawVolkJumbo(sx, sy, sw, h) {
  if (aussie.k <= 0) return;
  ctx.save();
  ctx.globalAlpha = aussie.k;
  ctx.fillStyle = AUS.deep; ctx.fillRect(sx + 4, sy + 2, sw - 8, 42);
  ctx.strokeStyle = AUS.gold; ctx.lineWidth = 3; ctx.strokeRect(sx + 4, sy + 2, sw - 8, 42);
  var pulse = 1 + 0.06 * Math.sin(vkClock * 10);
  ctx.translate(sx + sw / 2, sy + 24); ctx.scale(pulse, pulse);
  jtText("AUSSIE AUSSIE AUSSIE  OI! OI! OI!", 0, 0, 30, AUS.gold, "center", "#b8862f", sw - 40);
  ctx.restore();
}

// Over everything: the chant bubbles over the stands and the streamers.
function drawVolkSky(sc, ox, oy) {
  if (!aussie.echoes.length && !aussie.ribbons.length) return;
  var stadium = stadiumOn();
  ctx.save();
  if (stadium) { var px = canvas.width / STAGE_W; ctx.setTransform(px, 0, 0, px, 0, 0); } else ctx.setTransform(sc, 0, 0, sc, ox, oy);
  aussie.ribbons.forEach(function (r) {
    ctx.save();
    ctx.translate(r.x, r.y); ctx.rotate(Math.sin(r.sw) * 0.9);
    ctx.fillStyle = r.col; ctx.fillRect(-2.5, -r.len / 2, 5, r.len * (stadium ? 1.6 : 0.8));
    ctx.restore();
  });
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  aussie.echoes.forEach(function (e) {
    e.spots.forEach(function (s, i) {
      var t = e.t - s.d;
      if (t < 0 || t > 1.2) return;
      var pop = Math.min(1, t / 0.12), fade = Math.max(0, Math.min(1, (1.2 - t) / 0.3)), size = stadium ? 34 : 15;
      ctx.save();
      ctx.globalAlpha = fade;
      ctx.translate(s.x, s.y - t * (stadium ? 26 : 8)); ctx.scale(0.6 + 0.4 * pop, 0.6 + 0.4 * pop); ctx.rotate(Math.sin(s.x) * 0.12);
      ctx.font = '900 ' + size + 'px "Barlow Condensed", "Arial Narrow", sans-serif';
      var w = ctx.measureText(e.text).width + size * 0.6, hh = size * 1.15;
      ctx.fillStyle = i % 2 ? AUS.green : AUS.gold; ctx.strokeStyle = "#16211f"; ctx.lineWidth = stadium ? 4 : 2.5;
      ctx.beginPath(); ctx.roundRect(-w / 2, -hh / 2, w, hh, hh * 0.4); ctx.fill(); ctx.stroke();
      ctx.fillStyle = i % 2 ? AUS.gold : AUS.green; ctx.fillText(e.text, 0, 2);
      ctx.restore();
    });
  });
  ctx.restore();
}

// ---------------------------------------------------------------- flags and stars

// The Australian flag in a box: the Union Jack in the corner, the Commonwealth
// Star under it and the Southern Cross on the fly.
function drawAusFlagRect(c, x, y, w, h) {
  c.save();
  c.fillStyle = AUS.navy; c.fillRect(x, y, w, h);
  var cw = w / 2, ch = h / 2;
  c.save();
  c.beginPath(); c.rect(x, y, cw, ch); c.clip();
  c.strokeStyle = "#ffffff"; c.lineWidth = ch * 0.2;
  c.beginPath(); c.moveTo(x, y); c.lineTo(x + cw, y + ch); c.moveTo(x + cw, y); c.lineTo(x, y + ch); c.stroke();
  c.strokeStyle = AUS.red; c.lineWidth = ch * 0.07;
  c.beginPath(); c.moveTo(x, y); c.lineTo(x + cw, y + ch); c.moveTo(x + cw, y); c.lineTo(x, y + ch); c.stroke();
  c.fillStyle = "#ffffff"; c.fillRect(x + cw * 0.42, y, cw * 0.16, ch); c.fillRect(x, y + ch * 0.38, cw, ch * 0.24);
  c.fillStyle = AUS.red; c.fillRect(x + cw * 0.46, y, cw * 0.08, ch); c.fillRect(x, y + ch * 0.44, cw, ch * 0.12);
  c.restore();
  vkStar(c, x + cw / 2, y + h * 0.75, h * 0.14, 7, "#ffffff");
  drawSouthernCross(c, x + w * 0.75, y + h * 0.5, h * 0.4, "#ffffff");
  c.restore();
}
function drawAusFlagWaving(x, y, w, t, phase) {
  var h = w * 0.5, wave = Math.sin(t * 9 + phase) * w * 0.06;
  ctx.save();
  ctx.translate(x, y);
  ctx.strokeStyle = "#5b4630"; ctx.lineWidth = Math.max(2, w * 0.06);
  ctx.beginPath(); ctx.moveTo(-w * 0.5, -h * 0.5); ctx.lineTo(-w * 0.5, h * 1.4); ctx.stroke();
  ctx.transform(1, wave / w, 0, 1, 0, 0);
  drawAusFlagRect(ctx, -w * 0.5, -h * 0.5, w, h);
  ctx.strokeStyle = STAGE_INK; ctx.lineWidth = 1.5; ctx.strokeRect(-w * 0.5, -h * 0.5, w, h);
  ctx.restore();
}
// The Southern Cross: four seven-point stars and the little five-point one,
// `s` from top to bottom.
function drawSouthernCross(c, x, y, s, col) {
  [[0, -0.42, 0.1, 7], [-0.24, -0.06, 0.1, 7], [0.26, -0.14, 0.1, 7], [0, 0.42, 0.11, 7], [0.13, 0.1, 0.055, 5]].forEach(function (p) {
    vkStar(c, x + p[0] * s, y + p[1] * s, p[2] * s, p[3], col);
  });
}
function vkStar(c, x, y, r, n, col) {
  c.fillStyle = col;
  c.beginPath();
  for (var i = 0; i < n * 2; i++) {
    var a = -Math.PI / 2 + i * Math.PI / n, rr = i % 2 ? r * 0.44 : r;
    if (i) c.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); else c.moveTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
  }
  c.closePath(); c.fill();
}

// ---------------------------------------------------------------- his look (fighter-art.js)

// UFC 314 shorts: a gold Greek key band round the hem and a gold laurel up
// one leg (look.shortsStyle "meander").
function drawMeanderShorts(c, r, look, sTop, band) {
  var gold = look.trim, y0 = r * 0.72, hgt = r * 0.13, step = hgt;
  c.save();
  c.fillStyle = gold; c.fillRect(-r, y0 - r * 0.025, r * 2, r * 0.025); c.fillRect(-r, y0 + hgt, r * 2, r * 0.025);
  c.strokeStyle = gold; c.lineWidth = Math.max(1, r * 0.024); c.lineCap = "square";
  c.beginPath();
  for (var x = -r; x < r; x += step) {
    var a = x + step * 0.15, b2 = x + step * 0.85, t = y0 + hgt * 0.18, bt = y0 + hgt * 0.85;
    c.moveTo(a, bt); c.lineTo(a, t); c.lineTo(b2, t); c.lineTo(b2, bt - hgt * 0.35); c.lineTo(a + step * 0.38, bt - hgt * 0.35); c.lineTo(a + step * 0.38, bt - hgt * 0.62);
  }
  c.stroke();
  // the laurel up the outside of the left leg (screen right)
  c.fillStyle = gold;
  for (var i = 0; i < 5; i++) {
    var ly = y0 - r * 0.06 - i * r * 0.075, lx = r * (0.78 - i * 0.025);
    [-1, 1].forEach(function (sd) {
      c.save(); c.translate(lx + sd * r * 0.05, ly); c.rotate(sd * 0.7 - 0.2);
      c.beginPath(); c.ellipse(0, 0, r * 0.05, r * 0.022, 0, 0, Math.PI * 2); c.fill(); c.restore();
    });
  }
  c.restore();
}

// The big black tribal piece on his right shoulder (screen left), running down
// the arm (tattoos.tribalShoulder).
function drawVolkTribal(c, r, lw, contained) {
  var y0 = contained ? -r * 0.32 : -r * 0.42;
  c.save();
  c.fillStyle = "rgba(20,22,26,0.82)";
  c.translate(-r * 0.86, y0);
  [[0, 0, 1], [0.04, 0.2, 0.85], [0.02, 0.38, 0.7]].forEach(function (p) {
    var ox = p[0] * r, oy = p[1] * r, k = p[2];
    c.beginPath();
    c.moveTo(ox - r * 0.12 * k, oy);
    c.quadraticCurveTo(ox + r * 0.05 * k, oy - r * 0.12 * k, ox + r * 0.2 * k, oy - r * 0.05 * k);
    c.quadraticCurveTo(ox + r * 0.04 * k, oy - r * 0.02 * k, ox + r * 0.1 * k, oy + r * 0.1 * k);
    c.quadraticCurveTo(ox - r * 0.02 * k, oy + r * 0.02 * k, ox - r * 0.12 * k, oy);
    c.closePath(); c.fill();
  });
  c.beginPath();
  c.moveTo(-r * 0.04, -r * 0.08); c.quadraticCurveTo(r * 0.16, r * 0.15, r * 0.02, r * 0.5); c.quadraticCurveTo(r * 0.08, r * 0.18, -r * 0.08, -r * 0.02); c.closePath(); c.fill();
  c.restore();
}

// ---------------------------------------------------------------- gallery

function volkGalleryMoves(ch, add) {
  var v = ch.volk, gp = v.gamePlan, ci = v.circle, pl = gp && gp.plans;
  if (gp) add("🧠", "Fight IQ", secs(gp.readAt) + " in he reads their numbers onto a FIGHT IQ card: how much of a submission threat they are and how much of a striker. Against the submission threat it's KICKS: he stays off the mat, kicks " + Math.round(1 / pl.kicks.kickCooldown * 10) / 10 + "x as often and never shoots. Against the striker it's WRESTLE: he closes in and shoots " + pl.wrestle.shotChance + "% of the times he's close. Too close to call, he mixes it up.");
  if (gp && gp.adapt) add("🔄", "Adapting", "If it isn't working (shots stuffed, taken down, kicks checked, or one kind of damage piling up on him) he switches plans, up to " + gp.adapt.max + " times a fight. \"When they're doing the right stuff, I make the adjustments.\"");
  if (ci) add("🌀", "Circling", "Circles them at the plan's distance, switching between clockwise and counter-clockwise every " + ci.switchEvery[0] + "-" + ci.switchEvery[1] + "s (or when the cage is in the way) with a plant and a pivot. A dashed arrow on the mat shows which way he's going.");
  if (v.durability) add("🧱", "Durability", "Takes " + Math.round(v.durability.damageTaken * 100) + "% of the damage.");
  if (v.rivals && v.rivals.ilia) add("🇪🇸", "vs Ilia", "Ilia knocked him out at UFC 298: against Ilia he has no durability bonus and takes " + Math.round(v.rivals.ilia.damageTaken * 100) + "% damage.");
  if (v.rivals && v.rivals.max) add("🌺", "vs Max", "He beat Max Holloway three times: against Max he hits " + Math.round((v.rivals.max.damage - 1) * 100) + "% harder.");
  if (v.walkout) add("🇦🇺", "Walkout", "Comes out with an Australian flag round his shoulders and throws it into the crowd " + secs(v.walkout.keep) + " in.");
}
function volkKangarooInfo(sp) {
  return "An Aussie tune starts, the cameras flash and the whole arena goes green and gold (the crowd chants AUSSIE AUSSIE AUSSIE, OI OI OI). A big red kangaroo bounds in over the cage, he hops into its pouch and it bounds after them. When it catches them it holds them while he punches out of the pouch (" + sp.pouchPunches.join(", then ") + " punches of " + sp.pouchDamage + "), then rears back on its tail (the tell: " + sp.readChance + "% of the time they duck out) and kicks them with both feet (" + sp.kickDamage.join(", then ") + ") into the cage (" + sp.walls.join(", then ") + " wall slams of " + sp.wallDamage + "). " + sp.rounds + " rounds, then he hops out and it bounds off. Can't be slipped or blocked.";
}
function volkGallerySounds(groups, synth) {
  groups.push({ title: "Alexander Volkanovski", items: [
    synth("Aussie tune", "His Kangaroo special: an original synth tune (didgeridoo drone, clapsticks, tin whistle). Plays 8 seconds here.", function () { playVolkTune(); setTimeout(function () { stopVolkTune(1); }, 8000); }),
    synth("AUSSIE AUSSIE AUSSIE, OI OI OI", "The crowd while the arena's green and gold.", function () { playAussieChant(); }),
    synth("Kangaroo bound", "The kangaroo landing a bound.", function () { playRooBoing(1); }),
    synth("Roo kick", "Both feet into them.", function () { lastPunchSound = 0; playRooKick(40); }),
    synth("Fight IQ", "His read on them, and the plan.", function () { playFightIq(); }),
    synth("Adapting", "Switching plans mid-fight.", function () { playVolkAdapt(); }),
    synth("Pivot", "Switching which way he's circling.", function () { playVolkPivot(); })
  ] });
}
function volkGalleryAssets(list) {
  list.push({ name: "Kangaroo", info: "Alexander Volkanovski's Kangaroo special: he rides in its pouch and it kicks them.", w: 240, h: 260, draw: function (c, w, h) {
    withCtx(c, function () {
      var roo = { x: w * 0.42, y: h * 0.92, z: 0, face: 1, mode: "stand" };
      drawKangaroo(c, roo, "back", { scale: h / 220, ink: "#16211f" });
      drawKangaroo(c, roo, "front", { scale: h / 220, ink: "#16211f" });
    });
  } });
  list.push({ name: "Australian flag", info: "Waved by the crowd in the green and gold arena, and his walkout flag.", w: 220, h: 160, draw: function (c, w, h) {
    withCtx(c, function () { drawAusFlagRect(c, w * 0.1, h * 0.18, w * 0.8, h * 0.64); });
  } });
}

// ---------------------------------------------------------------- sound
// All synthesized. The tune is original: a didgeridoo-style drone on D with
// a vowel sweep, clapsticks on the eighths, a hop "boing" and a tin whistle
// melody in D major pentatonic.

function vkAudio(fn) {
  try {
    var ac = getAudioCtx();
    if (!ac) return;
    if (ac.state === "suspended") ac.resume();
    fn(ac, ac.currentTime);
  } catch (e) { /* never let audio break the game */ }
}

var VK_BEAT = 60 / 132 / 2; // an eighth note at 132 bpm
// 8 bars of eighths (MIDI notes, 0 a rest).
var VK_MELODY = [
  69, 0, 66, 69, 71, 69, 66, 64,
  62, 0, 64, 66, 69, 0, 0, 0,
  71, 0, 69, 71, 74, 71, 69, 66,
  64, 0, 66, 64, 62, 0, 0, 0,
  74, 0, 76, 74, 71, 0, 69, 0,
  66, 69, 71, 69, 66, 0, 64, 0,
  62, 64, 66, 69, 71, 0, 74, 0,
  76, 74, 71, 69, 74, 0, 0, 0
];
var VK_DIDGE_VOWEL = [420, 900, 520, 1150, 460, 980, 600, 1300];
function vkMidi(n) { return 440 * Math.pow(2, (n - 69) / 12); }

function playVolkTune() {
  vkAudio(function (ac, now) {
    stopVolkTune(0);
    var out = ac.createGain();
    out.gain.setValueAtTime(0.0001, now); out.gain.exponentialRampToValueAtTime(0.9, now + 0.15);
    out.connect(ac.destination);
    vkTune = { gain: out, srcs: [] };
    try { holdMusicOff(now); } catch (e) { /* (music.js) */ }
    var t0 = now + 0.05, bars = 8, len = bars * 8 * VK_BEAT, srcs = vkTune.srcs;
    // The didgeridoo: a buzzing low drone on D through a moving vowel filter.
    var dr = ac.createOscillator(), dr2 = ac.createOscillator(), dg = ac.createGain(), bp = ac.createBiquadFilter(), lp = ac.createBiquadFilter();
    dr.type = "sawtooth"; dr.frequency.value = 73.4; dr2.type = "square"; dr2.frequency.value = 73.6;
    var dmix = ac.createGain(); dmix.gain.value = 0.5;
    bp.type = "bandpass"; bp.Q.value = 3.2; lp.type = "lowpass"; lp.frequency.value = 1500;
    dr.connect(bp); dr2.connect(dmix); dmix.connect(bp); bp.connect(lp); lp.connect(dg); dg.connect(out);
    dg.gain.setValueAtTime(0.0001, t0);
    for (var i = 0; i < bars * 8; i++) {
      var t = t0 + i * VK_BEAT, acc = i % 4 === 0;
      bp.frequency.setTargetAtTime(VK_DIDGE_VOWEL[i % 8], t, VK_BEAT * 0.3);
      dg.gain.setTargetAtTime(acc ? 0.55 : 0.32, t, 0.02);
      dg.gain.setTargetAtTime(acc ? 0.36 : 0.24, t + VK_BEAT * 0.4, 0.05);
      // an overblown "toot" at the top of every other bar
      if (i % 16 === 8) vkToot(ac, out, t, srcs);
    }
    dg.gain.setTargetAtTime(0.0001, t0 + len, 0.3);
    dr.start(t0); dr2.start(t0); dr.stop(t0 + len + 1.5); dr2.stop(t0 + len + 1.5);
    srcs.push(dr, dr2);
    for (var j = 0; j < bars * 8; j++) {
      var tj = t0 + j * VK_BEAT + (j % 2 ? VK_BEAT * 0.12 : 0); // a little swing for the bounce
      vkClapstick(ac, out, tj, j % 2 ? 0.1 : (j % 4 === 0 ? 0.26 : 0.16), srcs);
      if (j % 4 === 0) vkThump(ac, out, tj, srcs);
      if (j % 8 === 6) vkBoing(ac, out, tj, 0.07, srcs);
      var n = VK_MELODY[j];
      if (n) {
        var hold = 1;
        while (j + hold < VK_MELODY.length && VK_MELODY[j + hold] === 0 && hold < 4) hold++;
        vkWhistle(ac, out, tj, vkMidi(n), VK_BEAT * hold * 0.92, srcs);
      }
    }
  });
}
function stopVolkTune(fade) {
  var tu = vkTune;
  if (!tu || !audioCtx) { vkTune = null; return; }
  vkTune = null;
  try {
    var now = audioCtx.currentTime, f = fade == null ? 0.8 : fade;
    tu.gain.gain.cancelScheduledValues(now);
    tu.gain.gain.setValueAtTime(Math.max(0.0001, tu.gain.gain.value || 0.9), now);
    tu.gain.gain.linearRampToValueAtTime(0, now + f + 0.01);
    tu.srcs.forEach(function (s) { try { s.stop(now + f + 0.05); } catch (e) { /* already stopped */ } });
    try { releaseMusic(); } catch (e) { /* (music.js) */ }
  } catch (e) { /* never let audio break the game */ }
}
function vkNoise(ac) { if (!punchNoise) punchNoise = makeNoiseBuffer(ac, 0.2); return punchNoise; }
function vkClapstick(ac, out, t, peak, srcs) {
  var o = ac.createOscillator(), g = ac.createGain();
  o.type = "triangle"; o.frequency.setValueAtTime(1900, t); o.frequency.exponentialRampToValueAtTime(1500, t + 0.04);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + 0.002); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
  o.connect(g); g.connect(out); o.start(t); o.stop(t + 0.07); srcs.push(o);
  var s = ac.createBufferSource(), f = ac.createBiquadFilter(), g2 = ac.createGain();
  s.buffer = vkNoise(ac); f.type = "bandpass"; f.frequency.value = 2600; f.Q.value = 3;
  g2.gain.setValueAtTime(0.0001, t); g2.gain.exponentialRampToValueAtTime(peak * 0.7, t + 0.001); g2.gain.exponentialRampToValueAtTime(0.0001, t + 0.025);
  s.connect(f); f.connect(g2); g2.connect(out); s.start(t); s.stop(t + 0.04); srcs.push(s);
}
function vkThump(ac, out, t, srcs) {
  var o = ac.createOscillator(), g = ac.createGain();
  o.type = "sine"; o.frequency.setValueAtTime(120, t); o.frequency.exponentialRampToValueAtTime(48, t + 0.14);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.4, t + 0.004); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
  o.connect(g); g.connect(out); o.start(t); o.stop(t + 0.2); srcs.push(o);
}
function vkBoing(ac, out, t, peak, srcs) {
  var o = ac.createOscillator(), g = ac.createGain(), vib = ac.createOscillator(), vg = ac.createGain();
  o.type = "sine"; o.frequency.setValueAtTime(150, t); o.frequency.exponentialRampToValueAtTime(420, t + 0.08); o.frequency.exponentialRampToValueAtTime(190, t + 0.3);
  vib.frequency.value = 22; vg.gain.value = 18; vib.connect(vg); vg.connect(o.frequency);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.32);
  o.connect(g); g.connect(out); o.start(t); vib.start(t); o.stop(t + 0.35); vib.stop(t + 0.35);
  if (srcs) srcs.push(o, vib);
}
function vkWhistle(ac, out, t, freq, dur, srcs) {
  var o = ac.createOscillator(), o2 = ac.createOscillator(), g = ac.createGain(), vib = ac.createOscillator(), vg = ac.createGain();
  o.type = "sine"; o.frequency.value = freq; o2.type = "triangle"; o2.frequency.value = freq * 2;
  vib.frequency.value = 5.5; vg.gain.value = freq * 0.012; vib.connect(vg); vg.connect(o.frequency);
  var g2 = ac.createGain(); g2.gain.value = 0.08;
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.16, t + 0.025); g.gain.setTargetAtTime(0.11, t + 0.05, 0.08);
  g.gain.setTargetAtTime(0.0001, t + Math.max(0.06, dur - 0.04), 0.03);
  o.connect(g); o2.connect(g2); g2.connect(g); g.connect(out);
  o.start(t); o2.start(t); vib.start(t); var end = t + dur + 0.2; o.stop(end); o2.stop(end); vib.stop(end);
  srcs.push(o, o2, vib);
}
function vkToot(ac, out, t, srcs) {
  var o = ac.createOscillator(), g = ac.createGain(), f = ac.createBiquadFilter();
  o.type = "sawtooth"; o.frequency.setValueAtTime(220, t); o.frequency.exponentialRampToValueAtTime(232, t + 0.2);
  f.type = "bandpass"; f.frequency.value = 1300; f.Q.value = 2.5;
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.22, t + 0.03); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.32);
  o.connect(f); f.connect(g); g.connect(out); o.start(t); o.stop(t + 0.35); srcs.push(o);
}

// A crowd shout shaped by a band of noise: one syllable.
function vkShout(ac, at, freq, q, peak, dur) {
  var s = ac.createBufferSource();
  s.buffer = vkNoise(ac); s.loop = true;
  var f = ac.createBiquadFilter();
  f.type = "bandpass"; f.Q.value = q; f.frequency.value = freq;
  var g = ac.createGain();
  g.gain.setValueAtTime(0.0001, at);
  g.gain.exponentialRampToValueAtTime(peak, at + 0.04);
  g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
  s.connect(f); f.connect(g); g.connect(strikeOut(ac));
  s.start(at); s.stop(at + dur + 0.05);
}
// "Aus-sie, Aus-sie, Aus-sie!" then "Oi! Oi! Oi!"
function playAussieChant() {
  vkAudio(function (ac, t) {
    for (var i = 0; i < 3; i++) {
      vkShout(ac, t + i * 0.36, 760, 1.2, 0.36, 0.17);
      vkShout(ac, t + i * 0.36 + 0.17, 2900, 0.9, 0.24, 0.14);
    }
    for (var j = 0; j < 3; j++) vkShout(ac, t + 1.2 + j * 0.3, 640, 1.4, 0.48, 0.2);
  });
}
function playRooBoing(v) {
  vkAudio(function (ac, t) {
    vkBoing(ac, strikeOut(ac), t, 0.22 * (v || 1), null);
    caneTone(ac, t, "sine", 90, 45, 0.5 * (v || 1), 0.14);
  });
}
function playRooRear() {
  vkAudio(function (ac, t) { caneTone(ac, t, "triangle", 260, 520, 0.2, 0.3); caneBurst(ac, t, 900, 1.2, 0.18, 0.25); });
}
function playRooKick(dealt) {
  playSlam(); playPunch(Math.max(30, (dealt || 30) * 1.6));
  vkAudio(function (ac, t) { caneTone(ac, t, "sine", 85, 34, 0.9, 0.42); caneBurst(ac, t, 1400, 0.9, 0.5, 0.12); });
}
function playRooWhiff() {
  playWhoosh();
  vkAudio(function (ac, t) { caneTone(ac, t, "sine", 300, 150, 0.12, 0.3); });
}
function playFightIq() {
  vkAudio(function (ac, t) {
    caneTone(ac, t, "triangle", 784, 780, 0.18, 0.16);
    caneTone(ac, t + 0.1, "triangle", 1175, 1170, 0.2, 0.3);
  });
}
function playVolkAdapt() {
  vkAudio(function (ac, t) { [0, 0.07, 0.14].forEach(function (d, i) { caneTone(ac, t + d, "square", 520 + i * 220, 540 + i * 220, 0.06, 0.08); }); });
}
// The plant and pivot: a soft scuff of his feet.
function playVolkPivot() {
  vkAudio(function (ac, t) { caneBurst(ac, t, 3200, 1.6, 0.06, 0.04); caneBurst(ac, t + 0.05, 2600, 1.6, 0.05, 0.04); });
}
