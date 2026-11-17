// Solid through the special (Joe, 2026-11-17): "fighters should block or dodge
// all moves thrown at them until the attack is over, like Charles, or Dustin
// with his hot sauce does." While one of the moves below is on, the fighter
// keeps a body: walking into him just eases them out of his space (no bounce,
// like Chuck's Snow Day, icDefend in liddell.js, and DC's eating, dcDefend in
// cormier.js), and every strike, shot or grab they start on him is either
// BLOCKED! (his guard snaps up on that side, they're knocked back) or DODGED!
// (he slips out to the side and sways back).
//
// Moves that already do this themselves aren't listed: Chuck's Snow Day, DC's
// eating, Dustin's hot sauce, Charles's Kamehameha and Instant Transmission,
// Khabib's phone call, Fedor's Unmoving Man, and Conor's moves (their own
// thread). Left alone on purpose (designed that way): Ilia's Rose Tornado
// (can't be touched, sucks them in), Dustin's hot sauce panic run (Joe turned
// down a solid wall there), Jon up in the sky as a duck or falling back in,
// Hokit's leap off the top rope and lying flat after it, GSP flying in on the
// Superman dive, Ngannou in the air on the Smash, Gaethje carried off by the
// eagle, Khabib running out of his own target circle, the slashes that run
// through them (Procházka's iai and finisher, Tony's X), Volkanovski riding
// the kangaroo, and Max trading in the Middle.
//
// Per move: which phases ("all" for every one), and slip: false where the
// move holds him on a spot itself (a slip would be undone), so he only blocks.
var SS_MOVES = {
  bow: { phases: "all" },                                       // Alex Pereira planted with the bow (pereira.js)
  kangaroo: { phases: ["call", "roo"] },                        // Volkanovski calling the kangaroo in (volkanovski.js)
  mranderson: { phases: "all" },                                // Anderson Silva suiting up as Mr. Anderson (anderson.js)
  dobronx: { phases: ["pose", "outro"], guard: false },         // Charles posing for Do Bronx: he already slips everything (dobronx.js), so just solid
  herbdean: { phases: ["announce"] },                           // Ciryl Gane while Herb Dean is announced (herbdean.js)
  mimic: { phases: ["crouch"] },                                // Mighty Mouse crouched for his own special (mighty-mouse.js)
  smash: { phases: ["crouch", "pose"] },                        // Ngannou crouching for the Smash, and posing after it (ngannou.js)
  supermandive: { phases: ["rise", "aim", "land", "crash"] },   // GSP rising and aiming the Superman dive, and landing (gsp.js)
  samurai: { phases: ["outfit", "dream", "draw", "sheathe"] },  // Procházka suiting up, drawing and sheathing (prochazka.js)
  duckdrop: { phases: ["flicker"] },                            // Jon's tattoo flickering before the poof (jon-duck.js)
  goatstampede: { phases: "all", slip: false },                 // Jon floating over the goats (jon.js)
  chairshot: { phases: ["fetch"] },                             // Hokit fetching the chair (chairshot.js)
  helmetcharge: { phases: ["suit", "set"] },                    // Hokit's helmet going on, and his three-point stance (hokit-helmet.js)
  toprope: { phases: ["run", "climb", "perch"], slip: false },  // Hokit heading up the corner and up on the post (hokit-toprope.js)
  bear: { phases: ["scrap", "after"], slip: false },            // Khabib scrapping with the bear (khabib-bear.js)
  america: { phases: ["end"] },                                 // Strickland's arms up at the end of America (strickland.js)
  katana: { phases: ["draw", "sheathe"] },                      // Tony drawing and sheathing the katanas (ferguson-katanas.js)
  broadside: { phases: ["rise"], slip: false },                 // Bisping's ship rising under him (bisping.js)
  sugarrush: { phases: ["call"] }                               // O'Malley calling the Sugar Rush (omalley.js)
};

function ssMove(b) {
  if (!b || !b.alive || !b.igbb) return null;
  var c = SS_MOVES[b.igbb.move];
  if (!c) return null;
  if (c.phases !== "all" && c.phases.indexOf(b.igbb.phase) < 0) return null;
  if (b.grappled || b.slam || b.dazed || subLocked(b)) return null;
  return c;
}
function specialSolidOn(b) { return !!ssMove(b); }

// Somebody free to walk into him or throw something (not held, hurt or busy in a move of their own).
function ssFree(o) {
  return o.alive && !o.koOut && !o.igbb && !o.grappled && !o.sprawl && !o.sprawled && !subLocked(o) && !o.slam && !o.dazed &&
    !o.shelled && !o.beamPin && !o.koDuel && !o.bearHeld && !o.torHeld && !swordDuelLocked(o);
}
function ssAttacking(o) { return !!(o.punch || o.kick || o.swing || o.jabAnim || o.throwAnim || o.combo || o.flow || o.grapple); }

// From update(), after everything else has moved.
function tickSpecialSolid(dt) {
  if (!balls) return;
  balls.forEach(function (self) {
    var other = balls[1 - self.id], s = self.ssDef;
    if (s) {
      if (s.def) { s.def.t += dt; if (s.def.t > 0.35) s.def = null; }
      if (s.dodge) {
        var dg = s.dodge; dg.t += dt;
        var k = Math.min(1, dg.t / 0.4), cur = Math.sin(k * Math.PI), step = (cur - dg.done) * 55; // slips out, then sways back
        dg.done = cur;
        if (ssMove(self)) {
          self.x = Math.min(W - self.r, Math.max(self.r, self.x + dg.x * step));
          self.y = Math.min(H - self.r, Math.max(self.r, self.y + dg.y * step));
        }
        if (dg.t > 0.4) s.dodge = null;
      }
    }
    var c = ssMove(self), atk = ssAttacking(other);
    if (!c) { if (s) s.prevAtk = atk; return; }
    s = self.ssDef = self.ssDef || { prevAtk: atk, def: null, dodge: null };
    if (!ssFree(other)) { s.prevAtk = atk; return; }
    var dx = other.x - self.x, dy = other.y - self.y, d = Math.sqrt(dx * dx + dy * dy) || 1, ux = dx / d, uy = dy / d;
    if (d < self.r + other.r + 4) { // they walk into him: eased out of his space, no bounce
      var push = self.r + other.r + 4 - d;
      var nx = Math.min(W - other.r, Math.max(other.r, other.x + ux * push)), ny = Math.min(H - other.r, Math.max(other.r, other.y + uy * push));
      if (Math.hypot(nx - self.x, ny - self.y) < self.r + other.r) {
        // Caught behind him against the cage: they squeeze out along it,
        // away from the corner.
        var onSide = other.x <= other.r + 1 || other.x >= W - other.r - 1, sl = 700 * dt;
        ux = onSide ? 0 : (other.x < W / 2 ? 1 : -1); uy = onSide ? (other.y < H / 2 ? 1 : -1) : 0;
        nx = Math.min(W - other.r, Math.max(other.r, other.x + ux * sl));
        ny = Math.min(H - other.r, Math.max(other.r, other.y + uy * sl));
      }
      other.x = nx; other.y = ny;
      var vn = other.vx * ux + other.vy * uy;
      if (vn < 0) { other.vx -= vn * ux; other.vy -= vn * uy; } // (no longer pushing in)
    }
    if (c.guard !== false && atk && !s.prevAtk && d < self.r + other.r + 90 && !s.dodge && !s.def) {
      if (c.slip === false || Math.random() < 0.5) {
        s.def = { t: 0, x: ux, y: uy };
        other.punch = null; other.kick = null; other.swing = null; other.jabAnim = null; other.combo = null; other.flow = null; other.grapple = null;
        other.vx = ux * 380; other.vy = uy * 380;
        floater(self.x + ux * self.r, self.y - self.r - 30, "BLOCKED!", "dodge");
        playHotSauce("block");
        for (var i = 0; i < 10 && !reduceMotion; i++) {
          var a = Math.atan2(uy, ux) + (Math.random() - 0.5) * 1.8, v = 160 + Math.random() * 160;
          particles.push({ x: self.x + ux * self.r * 1.05, y: self.y + uy * self.r * 1.05, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 0.25, max: 0.25, size: 2 + Math.random() * 2, color: i % 2 ? "#ffffff" : self.char.color });
        }
      } else {
        // a slip out to the side, away from the cage if he's up against it
        var sd = Math.random() < 0.5 ? 1 : -1, px = -uy * sd, py = ux * sd;
        if (self.x + px * 70 < self.r || self.x + px * 70 > W - self.r || self.y + py * 70 < self.r || self.y + py * 70 > H - self.r) { px = -px; py = -py; }
        px -= ux * 0.4; py -= uy * 0.4;
        var pl = Math.sqrt(px * px + py * py) || 1;
        s.dodge = { t: 0, done: 0, x: px / pl, y: py / pl };
        other.punch = null; other.kick = null; other.swing = null; other.jabAnim = null; other.combo = null; other.flow = null; other.grapple = null;
        floater(self.x, self.y - self.r - 30, "DODGED!", "dodge");
        playHotSauce("dodge");
      }
      self.immuneCd = Math.max(self.immuneCd, 0.3); // (no BLOCK popping up over it as well)
    }
    s.prevAtk = atk;
  });
}

// The block: a guard arc snapping up on the side it came from (draw.js, over the fighters).
function drawSpecialSolid() {
  if (!balls) return;
  balls.forEach(function (b) {
    var s = b.ssDef;
    if (!s || !s.def || !b.alive) return;
    var k = s.def.t / 0.35, pop = Math.sin(Math.min(1, k * 1.6) * Math.PI / 2), fade = 1 - k;
    var ang = Math.atan2(s.def.y, s.def.x), rr = b.r * (1.08 + 0.12 * pop);
    ctx.save();
    ctx.globalAlpha = Math.max(0, fade);
    ctx.lineCap = "round";
    ctx.strokeStyle = "rgba(255,255,255,0.95)";
    ctx.lineWidth = b.r * 0.16;
    ctx.beginPath(); ctx.arc(b.x, b.y, rr, ang - 0.75, ang + 0.75); ctx.stroke();
    ctx.strokeStyle = b.char.color || "#bfe9ff";
    ctx.lineWidth = b.r * 0.07;
    ctx.beginPath(); ctx.arc(b.x, b.y, rr + b.r * 0.12, ang - 0.55, ang + 0.55); ctx.stroke();
    ctx.restore();
  });
}
