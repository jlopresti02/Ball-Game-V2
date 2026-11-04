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
  c.jon.goatLook = c.look;
  return c;
}

function initJon(b) {
  if (!isJon(b)) return;
  b.jonMode = null;
  b.jonT = 0;
  setJonMode(b, "goat", true);
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
  var col = b.jonMode === "evil" ? "224,34,27" : "245,197,66";
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
