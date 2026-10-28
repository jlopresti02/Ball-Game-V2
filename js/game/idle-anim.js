// Idle and movement animations (CONCEPTS): little bits of life for the
// fighters while they're just moving around, not attacking or tied up.
// IDLE_MODE picks which ones are on, so each can be looked at on its own:
//   "bounce"  boxer's bounce on the toes: a hop with a squash on landing
//   "lean"    leans into the direction it's moving, stretching when fast
//   "guard"   gloves pump and circle, with feints and glove taps
//   "feet"    two little feet shuffling under the ball, kicking up dust
//   "fatigue" breathing; when hurt, heavy breathing, swaying and sweat
//   "slip"    the odd head slip side to side and a shoulder roll
//   "all"     everything together (lean toned down)
//   "off"     the game as it is now
"use strict";

var IDLE_MODE = "off";
var idleClock = 0, idleClockLast = null;

function idleOn(name) { return IDLE_MODE === name || (IDLE_MODE === "all" && name !== "slip") || IDLE_MODE.split(",").indexOf(name) >= 0; }

// How much the idle animations show on a fighter right now (0 to 1): they
// fade in while it's just moving around and fade out the moment it does
// anything else.
function idleBlend(b) {
  if (IDLE_MODE === "off") return 0;
  return b.idleK || 0;
}
function tickIdle() {
  var now = performance.now() / 1000;
  var dt = idleClockLast === null ? 0 : Math.min(0.1, Math.max(0, now - idleClockLast));
  idleClockLast = now;
  idleClock += dt;
  balls.forEach(function (b) {
    var want = b.alive && inOrdinaryMovement(b) && !b.punch && !b.kick && !b.throwAnim ? 1 : 0;
    var k = b.idleK || 0;
    b.idleK = k + (want - k) * Math.min(1, dt * 8);
    var sp = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
    // Distance walked, for the footsteps
    var prevStep = Math.floor((b.stepD || 0) / (b.r * 0.9));
    b.stepD = (b.stepD || 0) + sp * dt;
    if (idleOn("feet") && started && b.idleK > 0.5 && Math.floor(b.stepD / (b.r * 0.9)) !== prevStep && !reduceMotion) {
      // A step lands: a puff of mat dust behind it.
      var side = Math.floor(b.stepD / (b.r * 0.9)) % 2 ? 1 : -1;
      for (var i = 0; i < 3; i++) {
        particles.push({ x: b.x + side * b.r * 0.32 + (Math.random() - 0.5) * 6, y: b.y + b.r * 0.98,
          vx: -b.vx * 0.15 + (Math.random() - 0.5) * 40, vy: -20 - Math.random() * 25,
          life: 0.35, max: 0.35, size: 2.5 + Math.random() * 2.5, color: "rgba(150,135,110,0.55)" });
      }
    }
    // Sweat flicking off a hurt fighter
    if (idleOn("fatigue") && started && b.alive && b.hp < MAX_HP * 0.4 && b.idleK > 0.5 && Math.random() < dt * 3 && !reduceMotion) {
      var a = -Math.PI / 2 + (Math.random() - 0.5) * 1.6;
      particles.push({ x: b.x + Math.cos(a) * b.r * 0.8, y: b.y + Math.sin(a) * b.r * 0.8,
        vx: Math.cos(a) * 70, vy: Math.sin(a) * 70 - 30, life: 0.5, max: 0.5, size: 2.6, color: "#7cc4ff" });
    }
  });
}

function bounceHop(b) {
  var hurt = idleOn("fatigue") && b.hp < MAX_HP * 0.4;
  var ph = idleClock * Math.PI * 2 * (hurt ? 1.6 : 2.3) + b.id * 1.7;
  return Math.abs(Math.sin(ph)); // 0 on the mat, 1 at the top of the hop
}

// Shifts where the whole fighter (and its gloves) is drawn.
function idleOffset(b) {
  var k = idleBlend(b), x = 0, y = 0;
  if (k <= 0) return { x: 0, y: 0 };
  if (idleOn("bounce")) y -= bounceHop(b) * b.r * 0.14 * k;
  if (idleOn("slip")) {
    var sl = slipAmount(b);
    x += sl * b.r * 0.28 * k; y += Math.abs(sl) * b.r * 0.12 * k;
  }
  if (idleOn("fatigue") && b.hp < MAX_HP * 0.4) x += Math.sin(idleClock * 1.7 + b.id) * b.r * 0.08 * k;
  return { x: x, y: y };
}

// The odd quick head slip: -1 / 1 at the bottom of the slip, else 0.
function slipAmount(b) {
  var period = 2.6, t = (idleClock + b.id * 1.3) % period, dur = 0.42;
  if (t > dur) return 0;
  var side = Math.floor((idleClock + b.id * 1.3) / period) % 2 ? 1 : -1;
  return side * Math.sin(Math.PI * t / dur);
}

// Leaning, squashing and breathing, applied round the ball before it's drawn.
function applyIdlePose(b) {
  var k = idleBlend(b);
  if (k <= 0) return;
  var sx = 1, sy = 1, rot = 0;
  if (idleOn("bounce")) {
    var g = Math.pow(1 - bounceHop(b), 6); // landing
    sx += 0.08 * g * k; sy -= 0.1 * g * k;
  }
  if (idleOn("fatigue")) {
    var hurt = b.hp < MAX_HP * 0.4;
    var br = Math.sin(idleClock * (hurt ? 5 : 2.4) + b.id) * (hurt ? 0.045 : 0.022) * k;
    sx += br; sy += br;
    if (hurt) rot += Math.sin(idleClock * 1.7 + b.id) * 0.1 * k;
  }
  if (idleOn("slip")) rot += slipAmount(b) * 0.38 * k;
  var leanK = IDLE_MODE === "all" ? 0.5 : 1;
  var sp = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
  if (idleOn("lean") && sp > 1) {
    rot += Math.max(-1, Math.min(1, b.vx / SPEED)) * 0.28 * k * leanK;
  }
  // Squash and stretch happen at the bottom of the ball (on the mat).
  var ax = b.x, ay = b.y + b.r;
  ctx.translate(ax, ay);
  ctx.rotate(rot);
  ctx.scale(sx, sy);
  ctx.translate(-ax, -ay);
  if (idleOn("lean") && sp > SPEED * 0.6) {
    // Stretched along the way it's going when it's moving fast.
    var st = Math.min(1, (sp - SPEED * 0.6) / SPEED) * 0.12 * k * leanK, an = Math.atan2(b.vy, b.vx);
    ctx.translate(b.x, b.y); ctx.rotate(an); ctx.scale(1 + st, 1 - st * 0.6); ctx.rotate(-an); ctx.translate(-b.x, -b.y);
  }
}

// Guard styles: where the gloves sit and how they move while a fighter is
// just moving around. Each fighter can have its own (`guardStyle` on the
// character); IDLE_GUARD picks one for everyone while testing.
//   mma     hands up at the cheekbones, pumping and pawing, the odd feint
//   boxer   tight high guard, gloves together at the chin, rolling side to
//           side with quick double-jab pops
//   muaythai tall long guard, hands high and out, lead hand pawing in
//           little circles, both rocking on the Thai rhythm
//   handsdown hands hanging at the hips, swaying loose, shrugging, and
//           beckoning "come on" with the lead hand
//   cocky   loose low hands swinging like pendulums, a showboat bolo wind
//           up and a fast shimmy
//   awkward hands at odd heights, jerking about out of rhythm, sudden
//           pokes and a glove wandering off wide
var GUARD_STYLES = ["mma", "boxer", "muaythai", "handsdown", "cocky", "awkward"];
var IDLE_GUARD = null;
function guardStyleOf(b) { return IDLE_GUARD || (b.char && b.char.guardStyle) || "mma"; }

// A smooth wobbly value (-1..1) for the awkward guard: mixed odd frequencies.
function wobble(t, seed) { return (Math.sin(t * 1.7 + seed) + Math.sin(t * 3.1 + seed * 2.3) * 0.6 + Math.sin(t * 5.3 + seed * 0.7) * 0.35) / 1.95; }
// 0..1 bump while `t` is within `dur` of the start of each `period`.
function beat(t, period, dur) { var x = t % period; return x < dur ? Math.sin(Math.PI * x / dur) : 0; }

// Offsets from the normal guard spot: f forward, s out to the side, y down.
function idleHand(b, sgn) {
  var k = idleBlend(b), o = { f: 0, s: 0, y: 0 };
  if (k <= 0) return o;
  if (idleOn("guard")) {
    var r = b.r, t = idleClock + b.id * 0.9, lead = sgn === 1;
    var n, bt;
    switch (guardStyleOf(b)) {
      case "boxer":
        // Tight and high, gloves together at the chin, rolling side to side.
        o.f = -r * 0.1; o.s = -r * 0.18; o.y = -r * 0.28;
        o.s += Math.sin(t * 4.5) * r * 0.16 * sgn;        // shoulder roll: both shift together
        o.y += Math.abs(Math.sin(t * 9)) * r * -0.06;      // quick bounce
        n = Math.floor(t / 1.1);
        if (lead && n % 2 === 0) o.f += (beat(t, 1.1, 0.14) + beat(t - 0.18, 1.1, 0.14)) * r * 0.75; // double jab
        break;
      case "muaythai":
        // Tall, long guard: hands high and out, rocking on the rhythm.
        o.f = r * 0.18; o.s = r * 0.12; o.y = -r * 0.42;
        var rock = Math.sin(t * 4.4);
        o.y += rock * r * 0.12;                               // both rise and fall together
        if (lead) {                                           // lead hand pawing in little circles
          o.f += r * 0.22 + Math.cos(t * 9) * r * 0.12;
          o.y += Math.sin(t * 9) * r * 0.12;
        } else o.f += Math.sin(t * 2.2) * r * 0.06;
        break;
      case "handsdown":
        // Hands hanging at the hips, loose. Shrugs, and "come on" with the lead hand.
        o.f = -r * 0.55; o.s = r * 0.55; o.y = r * 0.75;
        o.s += Math.sin(t * 2.6 + sgn) * r * 0.08;
        o.y += Math.sin(t * 2.6 + sgn * 0.8) * r * 0.06;
        o.y -= beat(t + 0.5, 3.0, 0.5) * r * 0.3;            // shrug: both hands jump up
        bt = (t % 3.0);
        if (lead && bt > 1.2 && bt < 2.2) {                   // beckoning: hand up, curling it in twice
          var bk = Math.sin(Math.PI * (bt - 1.2) / 1.0);
          o.y -= bk * r * 0.85; o.f += bk * r * 0.65;
          o.f -= Math.abs(Math.sin((bt - 1.2) * Math.PI * 4)) * r * 0.3 * bk;
        }
        break;
      case "cocky":
        // Low loose hands swinging like pendulums, then showing off.
        o.f = -r * 0.25; o.s = r * 0.3; o.y = r * 0.45;
        o.f += Math.sin(t * 5 + (lead ? 0 : Math.PI)) * r * 0.3;
        o.y += Math.abs(Math.cos(t * 5 + (lead ? 0 : Math.PI))) * r * -0.12;
        bt = t % 4.0;
        if (!lead && bt < 1.1) {                              // bolo wind up: rear hand windmilling
          var ang = bt * Math.PI * 2 * 2.2, bw = Math.sin(Math.PI * bt / 1.1);
          o.f += Math.cos(ang) * r * 0.5 * bw; o.y += Math.sin(ang) * r * 0.5 * bw - r * 0.4 * bw;
        }
        if (bt > 2.2 && bt < 2.9) o.s += Math.sin(bt * 60) * r * 0.14; // shimmy
        break;
      case "awkward":
        // Odd heights, out of rhythm, the odd sudden poke and a wandering glove.
        o.f = wobble(t, sgn * 3) * r * 0.3; o.s = wobble(t * 0.8, sgn * 7) * r * 0.25;
        o.y = (lead ? -r * 0.35 : r * 0.3) + wobble(t * 1.3, sgn * 5) * r * 0.3;
        if (beat(t + sgn * 0.7, 1.9 + sgn * 0.35, 0.12) > 0) o.f += beat(t + sgn * 0.7, 1.9 + sgn * 0.35, 0.12) * r * 0.8;
        if (!lead) o.s += beat(t, 3.3, 0.9) * r * 0.6;     // glove wanders out wide
        break;
      default:
        // MMA: hands at the cheekbones, pumping in turn and pawing, the odd feint.
        o.y = -r * 0.1;
        o.f += Math.sin(t * 8 + sgn * 1.6) * r * 0.2;
        o.y += Math.cos(t * 8 + sgn * 1.6) * r * 0.1;
        o.s += Math.sin(t * 3.2) * r * 0.1;
        n = Math.floor(t / 1.4);
        if ((n % 2 ? 1 : -1) === sgn) o.f += beat(t, 1.4, 0.22) * r * 0.75;
    }
    o.f *= k; o.s *= k; o.y *= k;
  }
  if (idleOn("fatigue") && b.hp < MAX_HP * 0.4) o.y += b.r * 0.18 * k; // hands dropping
  return o;
}

// Shadows and feet under the fighters.
function drawIdleUnder() {
  tickIdle();
  balls.forEach(function (b) {
    var k = idleBlend(b);
    if (k <= 0 || !b.alive) return;
    if (idleOn("bounce")) {
      var h = bounceHop(b);
      ctx.fillStyle = "rgba(0,0,0," + (0.16 * k * (1 - h * 0.5)) + ")";
      ctx.beginPath(); ctx.ellipse(b.x, b.y + b.r * 0.95, b.r * (0.8 - h * 0.18), b.r * 0.2, 0, 0, Math.PI * 2); ctx.fill();
    }
    if (idleOn("feet")) {
      var sp = Math.sqrt(b.vx * b.vx + b.vy * b.vy), dirx = sp > 1 ? b.vx / sp : 0;
      var ph = (b.stepD || 0) / (b.r * 0.9) * Math.PI;
      var skin = (b.char.look && b.char.look.skin) || armColor(b.char);
      var lift = idleOn("bounce") ? -bounceHop(b) * b.r * 0.14 * k : 0;
      [-1, 1].forEach(function (s, i) {
        var step = Math.sin(ph + i * Math.PI);
        var fx = b.x + s * b.r * 0.34 + dirx * step * b.r * 0.22;
        var fy = b.y + b.r * 1.04 - Math.max(0, step) * b.r * 0.14 + lift;
        ctx.save();
        ctx.globalAlpha = k;
        ctx.fillStyle = skin; ctx.strokeStyle = theme.wall; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.ellipse(fx + dirx * b.r * 0.08, fy, b.r * 0.24, b.r * 0.13, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.restore();
      });
    }
  });
}
