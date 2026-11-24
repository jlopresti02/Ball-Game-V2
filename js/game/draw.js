// Drawing the arena, fighters, projectiles and damage numbers.
"use strict";

// Camera shake moves the whole game screen (the ring, health bars, names
// and buttons), not just what's inside the ring.
var gameScreen = document.getElementById("screenGame");
// px: screen pixels per game unit.
function shakeScreen(px) {
  if (gamePaused) return; // a paused gallery demo holds still (gallery.js)
  if (shake > 0) {
    var sx = (Math.random() - 0.5) * shake * 2 * px, sy = (Math.random() - 0.5) * shake * 2 * px;
    gameScreen.style.transform = "translate(" + sx.toFixed(1) + "px," + sy.toFixed(1) + "px)";
  } else if (gameScreen.style.transform) {
    gameScreen.style.transform = "";
  }
}

function draw() {
  readTheme();
  // In the WWIT stadium the arena is drawn smaller, in the middle of a 9:16
  // stage (stadium.js); ox/oy is where its top-left corner lands.
  var stadium = stadiumOn(), px = canvas.width / STAGE_W;
  // The stadium mat is always light, so dark mode's light outlines would vanish.
  if (stadium) { theme.floor = WWIT.mat; theme.wall = STAGE_INK; theme.ink = STAGE_INK; }
  var s = stadium ? px * ST.A / W : canvas.width / W;
  var ox = stadium ? ST.AX * px : 0, oy = stadium ? ST.AY * px : 0;
  lastArenaXf = { s: s, ox: ox, oy: oy }; // for the death animation's snapshot (death.js)
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = theme.floor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  if (stadium) drawStadium(px);
  drawAussieStands(px); // the crowd in green and gold for Volkanovski's Kangaroo (volkanovski.js)

  ctx.setTransform(s, 0, 0, s, ox, oy);
  shakeScreen(s * canvas.getBoundingClientRect().width / canvas.width);

  if (allAmericanOn()) { drawRoadScene(); drawRoadNight(aaOwnerMove()); } // out on the highway (allamerican.js)
  else if (stadium) drawStadiumMat();
  else {
    ctx.strokeStyle = theme.grid; ctx.lineWidth = 1.5; ctx.beginPath();
    for (var gx = 50; gx < W; gx += 50) { ctx.moveTo(gx, 0); ctx.lineTo(gx, H); }
    for (var gy = 50; gy < H; gy += 50) { ctx.moveTo(0, gy); ctx.lineTo(W, gy); }
    ctx.stroke();
    ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(W / 2, 0); ctx.lineTo(W / 2, H); ctx.stroke();
    ctx.beginPath(); ctx.arc(W / 2, H / 2, W * 0.15, 0, Math.PI * 2); ctx.stroke();
    if (brazilMode) drawBrazilFloor();
    drawGspFloor(); // a faded Canada flag while the crowd chants GSP (gsp.js)
  }
  drawAussieMat(); // the green and gold mat with the kangaroo sign (volkanovski.js)

  drawSitSpots();
  drawSendLocCrater(); // the scorch the orbital strike leaves on the mat, under the fighters (send-location.js)

  particles.forEach(function (p) {
    ctx.globalAlpha = Math.max(0, p.life / p.max);
    ctx.fillStyle = p.color;
    ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
  });
  ctx.globalAlpha = 1;

  // Wall-slam shockwaves: a ring blasting out from the point of impact and
  // jagged crack lines spiking off the wall.
  impacts.forEach(function (im) {
    var k = Math.max(0, im.life / im.max), grow = 1 - k;
    var base = Math.atan2(im.ny, im.nx);
    ctx.save();
    ctx.lineCap = "round";
    ctx.globalAlpha = k;
    ctx.strokeStyle = im.color;
    ctx.lineWidth = 7 * k + 1;
    ctx.beginPath(); ctx.arc(im.x, im.y, 12 + 78 * grow, base - Math.PI / 2, base + Math.PI / 2); ctx.stroke();
    ctx.strokeStyle = theme.wall;
    ctx.lineWidth = 3;
    for (var ci = 0; ci < 6; ci++) {
      var ca = base + (ci / 5 - 0.5) * 2.6 + Math.sin(ci * 12.9 + im.x) * 0.12;
      var len = (22 + (ci % 3) * 12) * Math.min(1, grow * 4);
      var midA = ca + 0.25 * (ci % 2 ? 1 : -1);
      ctx.beginPath();
      ctx.moveTo(im.x, im.y);
      ctx.lineTo(im.x + Math.cos(midA) * len * 0.5, im.y + Math.sin(midA) * len * 0.5);
      ctx.lineTo(im.x + Math.cos(ca) * len, im.y + Math.sin(ca) * len);
      ctx.stroke();
    }
    // White-hot flash right at the contact point.
    ctx.globalAlpha = k * k;
    ctx.fillStyle = "#ffffff";
    ctx.beginPath(); ctx.arc(im.x, im.y, 18 * k + 4, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  });

  drawGuardZones(); // the circle round a fighter down in guard
  drawAuraRoses(false); // roses thrown on the mat (aurafarm.js)
  drawTornadoUnder();   // and from the Rose Tornado, and the swirl at its foot (ilia-tornado.js)
  drawJonLanes();       // GOAT Stampede: red lanes where the goats will charge, and his shadow (jon.js)
  drawHelmetChargeUnder(); // Helmet Charge: the red path he's about to run (hokit-helmet.js)
  drawItGhosts(); // Charles's afterimage where he teleported from (instant-transmission.js)
  drawIslamUnder(); // Islam's cheesecake on the mat (islam-specials.js)
  drawLeviathanUnder(); // Islam's axe throw: the red line it's about to fly down (islam-axe.js)
  drawRapierLungeUnder(); // Ilia's lunge: the red line he's about to lunge down (rapier.js)
  drawLadderUnder();   // Hokit's ladder standing in the ring, the red circle, his shadow (hokit-ladder.js)
  drawTopRopeUnder();  // Top Rope Body Slam: the red circle (cut off at the cage), his shadow (hokit-toprope.js)
  drawTossUnder();      // the shadow under a fighter thrown in the air (toss.js)
  drawDuckUnder();      // Duck Drop: the red circle, his shadow coming down, the crater (jon-duck.js)
  drawEagleStrikeUnder(); // Eagle Strike: the red path and the eagle's shadow (gaethje-eagle.js)
  drawPereiraUnder(); // Bow and Arrow: the red ricochet path (pereira.js)
  drawOmalleyUnder(); // sweets on the mat, the race lines, the crane kick's path (omalley.js)
  drawOmalleyAuraUnder(); // O'Malley's Sugar Rush swirl, flames and rings under him (omalley-aura.js)
  drawGspUnder(); // GSP's shadow in the air and the Superman Dive's red lane (gsp.js)
  drawLiddellUnder(); // snow on the mat, Chuck Liddell's ice flames (liddell.js)
  drawVanMeltUnder(); // puddles of melt water from Van's fire hands (van-melt.js)
  drawNgannouUnder(); // Ngannou's rage punch line, the Smash circle and crater, Dana at the cage (ngannou.js)
  drawVolkUnder(); // Volkanovski's circling arrow, his flag, the kangaroo behind him (volkanovski.js)
  drawHollowayUnder(); // the gold ring in the middle of the cage, the commentary desk (holloway.js)
  drawConorUnder(); // Conor McGregor's bus lane and the dolly's aim line (conor.js)
  drawStricklandUnder(); // the flag on the mat, Strickland's bike lane, the bike and the wreck (strickland.js)
  drawFergusonUnder(); // Tony Ferguson's slide afterimages (ferguson.js)
  drawKatanaDuelUnder(); // the katana duel's dusk-red mat and afterimages (katana-duel.js)
  drawBispingUnder(); // Michael Bisping's sea, pirate ship and red aim lines (bisping.js)
  drawAndersonUnder(); // Anderson Silva's weave ghosts, the front kick's yellow line and his shadow (anderson.js)
  drawCormierUnder(); // Daniel Cormier's double-leg lane and the dents his super slams leave (cormier.js)
  drawPratesUnder(); // Carlos Prates's Rubber Pistol aim line, cigarette butts on the mat (prates.js)
  if (!allAmericanOn()) drawReferee(); // under the fighters (referee.js)

  // A fighter running its special move is drawn on top (e.g. mounted for
  // Father's Plan's ground and pound).
  // A shooter caught in a guillotine goes underneath, its head buried
  // under the defender (and the defender, once it's taken down).
  drawDuelShadow(); // shadows under fighters leaping in a sword duel (sword.js)
  // Whoever took the back for a rear naked choke goes behind the one it chokes.
  // A bat swing goes over whoever it's hitting.
  (balls[0].igbb || guilloUnder(balls[1]) || rncBehind(balls[1]) || (balls[0].chAct && balls[0].chAct.kind === "bat") ? [balls[1], balls[0]] : balls).forEach(function (b) {
    if (!b.alive || duckDrawnApart(b) || golfDrawnApart(b) || topRopeDrawnApart(b) || ladderDrawnApart(b) || islamDrawnApart(b)) return; // (a duck, up in the sky, or falling in: drawDuckOver, drawDuckSky)
    var other = balls[1 - b.id];

    // Weaving slips the whole fighter sideways for a moment, and a taunting
    // fighter bounces on the spot. Everything below draws at the shifted spot.
    var wox = 0, woy = 0;
    var wvo = weaveFlowOffset(b); wox += wvo.x; woy += wvo.y; // the slip, gliding from one weave into the next (weave-flow.js)
    if (b.taunt && b.taunt.t > 0) woy -= Math.abs(Math.sin(b.taunt.t * 11)) * 6;
    var hjo = herbJoltOffset(b); wox += hjo.x; woy += hjo.y; // rocked by a bat or a cane (herbdean.js)
    var gbl = ganeBatLean(b); wox += gbl.x; woy += gbl.y; // throwing his weight into a bat swing (cheater.js)
    var dzo = dizzyOffset(b); wox += dzo.x; woy += dzo.y; // staggering after a haymaker (gaethje.js)
    var aao = allAmericanOffset(b); wox += aao.x; woy += aao.y; // launched down the highway (allamerican.js)
    var afo = auraOffset(b); wox += afo.x; woy += afo.y; // dancing, bowing, or shaking at the bull (aurafarm.js)
    var jfo = jonFloatOffset(b); wox += jfo.x; woy += jfo.y; // floating for GOAT Stampede (jon.js)
    var sbo = swordBodyOffset(b); wox += sbo.x; woy += sbo.y; // lunging and leaping with the sword (sword.js)
    var kmo = kameOffset(b); wox += kmo.x; woy += kmo.y; // leaning back to charge, lunging into the Kamehameha (kamehameha.js)
    var bpo = beamPinOffset(b); wox += bpo.x; woy += bpo.y; // shaking, pinned to the cage by a beam (beam-clash.js)
    var cgo = conorGuardOffset(b); wox += cgo.x; woy += cgo.y; // Conor's shoulder into a blocked shot (conor-guard.js)
    var rbo = rainbowOffset(b); wox += rbo.x; woy += rbo.y; // leaning over the pot of gold (rainbow-beam.js)
    var ngo = ngannouOffset(b); wox += ngo.x; woy += ngo.y; // up in the air for Ngannou's Smash (ngannou.js)
    var aso = andersonOffset(b); wox += aso.x; woy += aso.y; // Anderson Silva leaning back out of a shot, swaying with his hands down (anderson.js)
    var dco = cormierOffset(b); wox += dco.x; woy += dco.y; // held up over Daniel Cormier's head, or him running with them (cormier.js)
    var homeX = b.x, homeY = b.y; // put back exactly after (adding and subtracting would drift: seed.js replays)
    b.x += wox; b.y += woy;
    drawDarkSideRise(b); // dark smoke swirling round Hokit as he suits up (hokit-darkside.js)
    drawSaiyanAura(b); // Charles's golden aura while he's blond, behind him (dobronx.js)
    drawFergusonBehind(b); // Tony Ferguson's red Kaioken aura (ferguson.js)
    drawPratesBehind(b); // Carlos Prates's gold party aura (prates.js)
    drawGspBehind(b); // GSP's red cape, behind him (gsp.js)
    drawKameArmsBehind(b); // his arms reaching up behind his head for a Kamehameha fired upward (kamehameha.js)

    // While charging a power punch or rage attack, the ball jitters with
    // rising intensity; while throwing the power punch specifically, the
    // whole body spins through the same 3 turns as the windmilling fist.
    var jx = 0, jy = 0, spinAngle = 0, spinning = false;
    if (b.powerState) {
      if (b.powerState.phase === "charge") {
        var prog = b.powerState.t / b.char.powerPunch.chargeDur;
        var mag = 1 + 5 * prog;
        jx = (Math.random() - 0.5) * mag;
        jy = (Math.random() - 0.5) * mag;
      } else if (b.powerState.phase === "attack") {
        spinning = true;
        spinAngle = (b.powerState.t / b.char.powerPunch.spinDur) * Math.PI * 2 * 3;
      }
    } else if (b.rageState && b.rageState.phase === "charge") {
      var rprog = b.rageState.t / b.char.rage.chargeDur;
      var rmag = 1 + 5 * rprog;
      jx = (Math.random() - 0.5) * rmag;
      jy = (Math.random() - 0.5) * rmag;
    }
    var aas = allAmericanSpin(b); // tumbling after the truck (allamerican.js)
    if (aas) { spinning = true; spinAngle = aas; }
    var afs = auraSpin(b); // twirling in the Aura Farm dance (aurafarm.js)
    if (afs) { spinning = true; spinAngle = afs; }
    var tns = tornadoSpin(b); // tumbling round inside the Rose Tornado (ilia-tornado.js)
    if (tns) { spinning = true; spinAngle = tns; }
    var sws = swordBodySpin(b); // spinning into a sword strike (sword.js)
    if (sws) { spinning = true; spinAngle = sws; }

    ctx.save();
    ctx.translate(b.x + jx, b.y + jy);
    if (spinning) ctx.rotate(spinAngle);
    var tnx = tornadoTurn(b); // Ilia turning on the spot in the Rose Tornado (ilia-tornado.js)
    if (tnx !== 1) ctx.scale(tnx, 1);
    ctx.translate(-b.x, -b.y);
    if (b.watcherState && (b.watcherState.phase === "charge" || b.watcherState.phase === "laser")) {
      // Sitting: squashed down toward the ground, a little wider.
      ctx.translate(b.x, b.y + b.r);
      ctx.scale(1.08, 0.88);
      ctx.translate(-b.x, -(b.y + b.r));
    }
    if (b.squash) {
      // Just slammed into a wall: flattened against it, bulging sideways.
      var sq = b.squash, k = sq.t / sq.max;
      var ax = b.x - sq.nx * b.r, ay = b.y - sq.ny * b.r;
      ctx.translate(ax, ay);
      ctx.rotate(Math.atan2(sq.ny, sq.nx));
      ctx.scale(1 - 0.38 * k, 1 + 0.28 * k);
      ctx.rotate(-Math.atan2(sq.ny, sq.nx));
      ctx.translate(-ax, -ay);
    }
    applyGuilloPose(b); // bent over in (or leaning back with) a guillotine
    applyGuardPose(b);  // flat on its back in guard
    applyArmbarPose(b); // pulled over in an armbar
    applySuplexPose(b); // arching back into (or flipped over by) a suplex
    applyKamePose(b);   // crouched and tilted for the Kamehameha (kamehameha.js)
    applyTossPose(b);   // spun through the air by a takedown, then bouncing (toss.js)
    applyHotSaucePose(b); // Dustin swelling up, gulping and flailing in Hot Sauce Fire Breath (hot-sauce.js)
    applyPoatanStep(b); // Alex Pereira dipping his level on his 1-2 step (pereira.js)
    applyOmalleyPose(b); // Sean O'Malley up on one leg, leaping, buzzing or crashed (omalley.js)
    applyOmalleyAuraPose(b); // O'Malley's Sugar Rush jitter (omalley-aura.js)
    applyGspPose(b); // GSP crouching to load, up in the air for the leap and the dive (gsp.js)
    applyConorPose(b); // Conor McGregor rocking on his strut, planted, or gassed (conor.js)
    applyNgannouPose(b); // Ngannou crouching and leaping for the Smash, or knocked flat by it (ngannou.js)
    applyVolkPose(b); // Volkanovski leaning into his circling, small in the pouch (volkanovski.js)
    applyHollowayPose(b); // Max Holloway's spinning back fist, bouncing at the booth (holloway.js)
    applyDiazPose(b); // Nate Diaz leaning into the slap, the level change, the taunt (diaz.js)
    applyFergusonPose(b); // Tony Ferguson on his back in a hold, leaning into his slide, and whoever he's got (ferguson.js)
    applyFedorPose(b); // Fedor Emelianenko dropping his level, turning into the throw, and whoever he throws (fedor.js)
    applyIliaDarcePose(b); // Ilia leaning over a D'Arce, and them bent over head first under his arm (ilia-darce.js)
    applyPratesPose(b); // Carlos Prates long and lanky, bouncing on the beat in the party (prates.js)
    applyKneePose(b); // pulled down into the clinch, crouching for and flying in with a flying knee (knees.js)
    applyComboPose(b); // turning his back for a spinning back elbow (combos.js)
    applyAndersonPose(b); // Anderson Silva bent back in a weave, crouched for and flying in with the front kick (anderson.js)
    applyGaneShotPose(b); // Ciryl Gane crouched low and leaning into his shot (gane-shot.js)
    applyCormierPose(b); // Daniel Cormier dropping his level, carrying, chewing; whoever he's got lying across over his head (cormier.js)
    applyProchazkaPose(b); // Jiří Procházka twisting into a katana cut (prochazka.js)
    applyJonClinchPose(b); // Jon Jones leaning into the clinch, and whoever he's tripping (jon-clinch.js)
    applyLegKickLimp(b); // limping on a kicked calf: dipping onto the bad leg, the leg hanging out bruised (leg-kick.js)
    applyClinchPose(b); // leaning into the clinch, whoever's held rocked by each knee and elbow, the spin on the break (clinch.js)
    applyPunchTypePose(b); // dipping into an uppercut or a body shot, folding over one, chin snapping up (body-shots-uppercuts.js)
    applyIslamPose(b); // Islam's Brotha: swaying through the moan, low into the rush, and them looking round lost (islam-specials.js)

    var img = getImg(b.char.imgData);
    if (b.char.look) {
      // Fighter art: the muscled ball in its fight kit (beats a face photo)
      drawFighterArt(ctx, b.x, b.y, b.r, prGear5Look(b) || islamKratosLook(b) || b.char.look, theme.wall, { layout: "contained", name: b.char.name }); // Carlos Prates's white Gear 5 kit (prates-gear5.js); Islam's god of war look with the axe out (islam-axe.js)
    } else if (img) {
      ctx.save();
      ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2); ctx.closePath(); ctx.clip();
      ctx.drawImage(img, b.x - b.r, b.y - b.r, b.r * 2, b.r * 2);
      ctx.restore();
    } else {
      ctx.fillStyle = b.char.color;
      ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.28)";
      ctx.beginPath(); ctx.ellipse(b.x - b.r * 0.35, b.y - b.r * 0.4, b.r * 0.32, b.r * 0.2, -0.6, 0, Math.PI * 2); ctx.fill();
    }
    if (b.flash > 0) {
      ctx.fillStyle = "rgba(255,255,255," + (b.flash / 0.16) * 0.85 + ")";
      ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2); ctx.fill();
    }
    ctx.lineWidth = 3; ctx.strokeStyle = theme.wall;
    ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2); ctx.stroke();
    drawDiamondArmor(b); // Dustin's Diamond Guard armor, over the outline like Joe's mockup (diamond.js)

    if (b.char.label) {
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.font = "700 13px \"Barlow Condensed\", \"Arial Narrow\", sans-serif";
      ctx.lineWidth = 3; ctx.lineJoin = "round";
      ctx.strokeStyle = "rgba(0,0,0,0.55)"; ctx.strokeText(b.char.label, b.x, b.y);
      ctx.fillStyle = "#fff"; ctx.fillText(b.char.label, b.x, b.y);
    }

    if (b.powerState && b.powerState.phase === "charge") {
      var prog2 = b.powerState.t / b.char.powerPunch.chargeDur;
      ctx.lineCap = "round";
      ctx.strokeStyle = b.char.color;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r + 9, -Math.PI / 2, -Math.PI / 2 + prog2 * Math.PI * 2);
      ctx.stroke();
    } else if (b.rageState && b.rageState.phase === "charge") {
      var rprog2 = b.rageState.t / b.char.rage.chargeDur;
      ctx.lineCap = "round";
      ctx.strokeStyle = b.char.color;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r + 9, -Math.PI / 2, -Math.PI / 2 + rprog2 * Math.PI * 2);
      ctx.stroke();
    } else if (b.watcherState && b.watcherState.phase === "charge") {
      // The charge itself only begins once the sit delay has passed.
      var wch = b.char.watcher;
      var wprog2 = Math.max(0, Math.min(1, (b.watcherState.t - wch.preDelay) / wch.chargeDur));
      if (wprog2 > 0) {
        ctx.lineCap = "round";
        ctx.strokeStyle = b.char.color;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r + 9, -Math.PI / 2, -Math.PI / 2 + wprog2 * Math.PI * 2);
        ctx.stroke();
      }
    } else if (b.watcherState && b.watcherState.phase === "laser") {
      // A ring that drains as the lasers' time runs out.
      var wleft = Math.max(0, 1 - b.watcherState.t / b.char.watcher.fireDur);
      ctx.lineCap = "round";
      ctx.strokeStyle = b.char.color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r + 9, -Math.PI / 2, -Math.PI / 2 + wleft * Math.PI * 2);
      ctx.stroke();
    }

    // A soft glow when CTE forgets some damage and heals.
    if (b.healGlow > 0) {
      ctx.save();
      ctx.globalAlpha = Math.min(1, b.healGlow / 0.7);
      ctx.strokeStyle = theme.dodge;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r + 6 + (0.7 - b.healGlow) * 20, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // A fading ring while a Grappler is untouchable right after a slam.
    if (b.slamSafe > 0) {
      ctx.save();
      ctx.globalAlpha = Math.min(1, b.slamSafe / SLAM_SAFE_TIME) * 0.8;
      ctx.lineWidth = 3;
      ctx.strokeStyle = b.char.color;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r + 6, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // A bright pulsing ring whenever a fighter is invincible (the Watcher,
    // sitting in its corner), so it's obvious hits won't land.
    if (b.invincible) {
      var pulse = 0.55 + 0.35 * Math.sin(performance.now() / 140);
      ctx.save();
      ctx.setLineDash([5, 5]);
      ctx.lineWidth = 3;
      ctx.strokeStyle = "rgba(255,255,255," + pulse + ")";
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r + 5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    ctx.restore();

    // Small health bar over the ball (hidden while pinned by a finisher or
    // choked from behind, where it would sit on top of the other fighter).
    var pinned = balls[1 - b.id].grapple && balls[1 - b.id].grapple.finisher && balls[1 - b.id].grapple.phase !== "carry" || other.rnc;
    if (!pinned) {
      var bw = 64, bh = 8, bx = b.x - bw / 2, by = b.y - b.r - 18;
      if (by < 4) by = b.y + b.r + 10;
      ctx.fillStyle = theme.grid; ctx.fillRect(bx, by, bw, bh);
      ctx.fillStyle = b.char.color; ctx.fillRect(bx, by, bw * Math.min(1, b.hp / MAX_HP), bh);
      drawExtraHp(b, bx, by, bw, bh, false); // health over 500 (max-hp.js)
      ctx.lineWidth = 2; ctx.strokeStyle = theme.wall; ctx.strokeRect(bx, by, bw, bh);
    }

    drawFist(b, other);
    drawKoPunch(b);
    drawShock(b);
    drawKoOut(b);
    drawSwing(b);
    drawCheck(b);
    drawKick(b, other);
    drawTeep(b); // a teep, the front push kick (teep.js)
    drawGrapple(b);
    drawThrow(b, other);
    drawPowerSpin(b);
    drawJab(b);
    drawDiamondSword(b, other); // Dustin's diamond sword, under his guard glove (diamond.js)
    drawHands(b, other);
    drawPunchSetup(b); // set up by a body shot or uppercut: the ring, the dent, the snap, the big shot (body-shots-uppercuts.js)
    drawPereira(b); // Alex Pereira's CHAMA fists and bow (pereira.js)
    drawGane(b, other); // Ciryl Gane's gloves down by his hips (gane.js)
    drawOmalley(b); // Sean O'Malley's crane kick, sugar boost, pips and crash (omalley.js)
    drawOmalleyAuraOver(b); // O'Malley's Sugar Rush candies, ghost rims and burst (omalley-aura.js)
    drawGsp(b); // GSP's Superman fists, hands down for "not impressed" (gsp.js)
    drawMightyMouse(b); // Mighty Mouse's mimic aura and crouch (mighty-mouse.js)
    drawConor(b); // Conor McGregor's strut, counter stance, podium and gas tank (conor.js)
    drawLiddell(b); // Chuck Liddell packing the snow, his blue overhand (liddell.js)
    drawNgannou(b, other); // Ngannou's rage meter, going green, his rage punch, the Smash, the contract (ngannou.js)
    drawVolk(b); // Volkanovski's arms up, punching out of the pouch (volkanovski.js)
    drawHolloway(b); // Max Holloway's Blessed meter, pointing, the flashback pose, the BMF belt (holloway.js)
    drawVan(b); // Joshua Van's hands bar, his high guard, his gloves glowing or on fire, the flag (van.js)
    drawStrickland(b, other); // Sean Strickland's Philly shell, the bike, his overhands, the trauma meter (strickland.js)
    drawDiaz(b); // Nate Diaz's slap, arms out, the 209 surge, a handprint on whoever he slapped (diaz.js)
    drawElbow(b, other); // an elbow being thrown, and a cut bleeding (elbows.js)
    drawFerguson(b, other); // Tony Ferguson's slide, shot, shell, Kaioken glow and katanas (ferguson.js)
    drawFedor(b, other); // Fedor Emelianenko reaching for the clinch, speed lines off his fists, UNFAZED (fedor.js)
    drawBisping(b, other); // Michael Bisping's ship's hull in front of him on deck, his hands and captain's hat (bisping.js)
    drawAnderson(b); // Anderson Silva's hands down (anderson.js)
    drawCormier(b, other); // Daniel Cormier's arms in the shot and the carry, the cake, his cake pips; whoever he's carrying kicking (cormier.js)
    drawPrates(b, other); // Carlos Prates's gold hair, the cigarette, lighting up, the rubber arm and leg (prates.js)
    drawProchazka(b, other); // Jiří Procházka's hands low, his crit chin, the swords in his belt and his katanas (prochazka.js)
    drawDoBronx(b); // the pose
    drawSaiyanBolts(b); // lightning over Charles while he's blond (dobronx.js)
    drawKameHands(b); // and his hands and the ball of energy for the Kamehameha (kamehameha.js)
    drawRainbowPot(b); // Conor's pot of gold and his hands on it (rainbow-beam.js)
    drawShot(b);    // Hokit's double leg
    drawChairShot(b); // and his folding chair
    drawDazed(b);   // stars after a chair shot
    drawDizzy(b);   // stars and a spiral after a Gaethje haymaker
    drawAllAmerican(b); // and his All American haymaker
    drawAuraFarm(b);    // Ilia dancing, with the cape, KOing and lifting the bull
    drawTornadoArms(b); // and his arms flung out in the Rose Tornado (ilia-tornado.js)
    drawAaSlashes(b);   // eagle claw marks on whoever's out on the road
    drawMock(b);    // and his thumbs down
    drawCheater(b); // Gane cheating (and EVIL Jon Jones's eye poke)
    drawGoatStampede(b); // Jon floating, hands raised
    drawJonGlow(b); // Jon Jones's chest tattoo glowing gold or red
    drawHerbDeanSpecial(b); // and his bat during his special
    drawPokeStun(b);
    drawAngry(b);   // fuming at it
    b.x = homeX; b.y = homeY;
  });

  drawWatcherLasers();
  drawFinishers();
  balls.forEach(drawSpecial); // the IGBB grab hand goes over the opponent
  drawSpecialSolid(); // a guard snapping up as a special blocks a strike (special-solid.js)
  balls.forEach(drawPunchTypesOver); // uppercuts and body shots go over the opponent (body-shots-uppercuts.js)
  drawIslamTop(); // Islam's speech bubbles, the cheesecake in his hand, the van, the kangaroo over his head (islam-specials.js)
  drawLeviathanTop(); // Islam's axe in flight or whirling round him, Gane's bat in two halves (islam-axe.js)
  drawDiamondSwordsTop(); // Dustin's sword slashing into a bat, over both fighters (sword.js)
  drawDarkSideTop(); // Hokit's saber flying loose, the Force push, a saber lock (hokit-darkside.js)
  drawDuelVignette(); // the duel's dark edges and impact flash (sword.js)
  drawSprawls();
  drawGuillotines();
  drawRncs();
  drawIliaDarce(); // Ilia's D'Arce: his arm under their neck, and the tug-of-war bar (ilia-darce.js)
  drawArmbars();
  drawChairDebris();
  drawLadderDebris(); // the ladder he threw (hokit-ladder.js)
  drawCheaterObjects();
  drawHerb();
  drawRoadActors(); // eagles and the truck (allamerican.js)
  drawAuraRoses(true); // roses in the air
  drawAuraActors();    // the bull
  drawJonGoats();      // the goats (jon.js)
  drawHelmetChargeOver(); // the helmet dropping onto Hokit's head (hokit-helmet.js)
  drawKamehameha(); // Charles's Kamehameha beam (kamehameha.js)
  drawRainbowBeam(); // Conor's Pot o' Gold rainbow (rainbow-beam.js)
  drawBeamClash(); // where the two meet in a beam clash (beam-clash.js)
  drawItFx(); // and his Instant Transmission zip lines and hard shot (instant-transmission.js)
  drawTornadoOver(); // the Rose Tornado and the roses flying out of it (ilia-tornado.js)
  drawRingBear(); // Khabib's bear, or the dust cloud it's fighting in (khabib-bear.js)
  drawNateLion(); // Nate Diaz's lion (nate-lion.js)
  drawDuckOver();      // the duck, smoke and feathers, his superhero landing (jon-duck.js)
  drawEagleStrikeOver();  // the eagle swooping through, and its claw marks (gaethje-eagle.js)
  drawSuplexes();
  drawPereiraOver(); // his arrow flying, stuck in the cage, or up into the sky (pereira.js)
  drawOmalleyOver(); // Sugar Rush sweets falling in (omalley.js)
  drawGspOver(); // GSP's gi and headband flying off (gsp.js)
  drawMightyMouseOver(); // Mighty Mouse's SCOUTING notepad, sweat off a tired opponent (mighty-mouse.js)
  drawNgannouOver(); // Ngannou's mat chunks, contract scraps, punch-power banner in the test arena (ngannou.js)
  drawVolkOver(); // the kangaroo's pouch, arms and kick, the FIGHT IQ card (volkanovski.js)
  drawConorOver(); // Conor McGregor's bus, the lads and their brawl cloud, the dolly (conor.js)
  drawStricklandOver(); // the bald eagle at Strickland's side, fireworks over the test arena (strickland.js)
  drawDiazOver(); // Nick Diaz, his bubble, the NICK DIAZ banner in the test arena (diaz.js)
  drawFergusonOver(); // Tony Ferguson's holds and tug-of-war bar, the Kaioken flash, the CANCELLED stamps (ferguson.js)
  drawPratesOver(); // Carlos Prates's smoke, music notes and the disco lights (prates.js)
  drawSnowballsOver(); // Chuck Liddell's snowball flying at them (liddell-snowball.js)
  drawKneesOver(); // knees coming up, the clinch, the flying knee and its red line (knees.js)
  drawLegKicksOver(); // leg kicks whipping round low into the calf, the hit mark on it (leg-kick.js)
  drawHeadKicksOver(); // a head kick whipping up high into the head, the star on it (head-kick.js)
  drawFedorOver(); // Fedor Emelianenko's arms locked round them in the clinch and the throw (fedor.js)
  drawBispingOver(); // Michael Bisping's clinch elbows, cannonballs, smoke and 10-9 cards (bisping.js)
  drawAndersonOver(); // Anderson Silva's front kick: the knee up, the leg out, the foot on their face (anderson.js)
  drawCormierOver(); // SUPER SLAM! (cormier.js)
  drawProchazkaOver(); // the cuts Jiří Procházka's katanas leave (prochazka.js)
  drawKatanaDuelOver(); // the katana duel's petals and the loser's cut (katana-duel.js)
  if (typeof drawJiriReactOver === "function") drawJiriReactOver(); // animals Jiří Procházka cut in half (jiri-react.js)
  drawPushFlowOver(); // a tie-up's over-under arms, the frame on a pivot off the cage (push-flow.js)
  drawClinchOver(); // the clinch: arms tied round them, each knee and elbow, the swirl of the spin on the break (clinch.js)
  drawJonClinch(); // Jon Jones's arms locked over-under, his clinch knees and elbows, the trip's leg and red arrow (jon-clinch.js)
  drawVanOver(); // Joshua Van's chain counter under him, lit while he keeps it (van.js)
  drawVanMeltOver(); // Chuck's ice punch melting in Van's glove, steam, his fire sputtering out (van-melt.js)

  projectiles.forEach(function (p) {
    var pimg = getImg(p.imgData);
    if (pimg && p.aspect) {
      // A shaped image (Dustin's diamond): true proportions, spinning.
      var ph = p.r * 2, pw = ph * p.aspect;
      ctx.save();
      ctx.translate(p.x, p.y); ctx.rotate(p.angle || 0);
      ctx.imageSmoothingEnabled = false; // keeps the pixel art crisp
      ctx.drawImage(pimg, -pw / 2, -ph / 2, pw, ph);
      ctx.restore();
    } else if (pimg) {
      ctx.drawImage(pimg, p.x - p.r, p.y - p.r, p.r * 2, p.r * 2);
    } else {
      ctx.fillStyle = p.color; ctx.strokeStyle = theme.wall; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    }
  });

  drawAuraLights(s, ox, oy); // the arena going dark, the spotlight, then the lights back up (aurafarm.js)
  drawHerbBanner(); // "Herb Dean is entering the ring" when there's no jumbotron
  drawDiamondBanner(); // and "Diamond Guard" (diamond.js)
  drawTruckeesBanner(); // and the Truck-ee's ad (truckees-ad.js)
  drawNinersBanner(); // and the San Francisco 67'ers ad (hokit-helmet.js)
  drawPoorbetBanner(); // and the Poorbet sponsor ad (poorbet-ad.js)
  drawStillBanner(); // and the still fighter ads (still-ads.js)
  drawGaneAdBanner(); // and Gane's baby-proofing ad (gane-babyproof-ad.js)
  drawCologneBanner(); // and Ilia's cologne ad (cologne-ad.js)
  drawGoatGoatGoBanner(); // and Jon's GoatGoatGo ad (goatgoatgo-ad.js)
  drawTapWaterBanner(); // and Charles's Tap Water ad (tapwater-ad.js)
  drawMaxxBanner(); // and Max's Maxx Energy ad (maxx-energy-ad.js)
  drawProper12Banner(); // and Conor's Proper No. 12 ad (proper12-ad.js)
  drawBurritoBellBanner(); // and Tony Ferguson's Burrito Bell ad (burrito-bell-ad.js)
  drawIslamDagBanner(); // and Islam's Dagestan World Van Tours ad (islam-dagestan-ad.js)
  drawConorBanner(); // and Conor McGregor's 13 SECONDS (conor.js)
  drawBearWarnBanner(); // and WARNING: BEAR IN ARENA (bear-warning.js)
  drawTossOver(); // the throw's dust, ring and THROWN! (toss.js)
  drawGetUp(); // getting back up: the scramble, the wall walk, the pop (get-up.js)
  drawDeathFx(); // the loser's death animation (death.js)
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  drawSpeech(); // voice-line speech bubbles (speech.js), under the hit numbers and move names
  floaters.forEach(function (f) {
    var t = f.life / f.max;
    ctx.globalAlpha = Math.min(1, t * 2);
    var size = f.kind === "hit" ? 34 : (f.kind === "tick" ? 15 : (f.kind === "crit" ? 32 : (f.kind === "note" ? 17 : 28)));
    ctx.font = "800 " + size + 'px "Barlow Condensed", "Arial Narrow", sans-serif';
    var halfW = ctx.measureText(f.text).width / 2 + 6; // keeps wide text fully inside the arena
    var fx = Math.min(W - halfW, Math.max(halfW, f.x)), fy = Math.max(18, f.y);
    ctx.lineWidth = f.kind === "tick" ? 3 : 6; ctx.lineJoin = "round";
    ctx.strokeStyle = theme.floor; ctx.strokeText(f.text, fx, fy);
    ctx.fillStyle = f.kind === "note" ? theme.ink : ((f.kind === "dodge" || f.kind === "crit" || f.kind === "heal") ? theme.dodge : theme.hit); ctx.fillText(f.text, fx, fy);
  });
  ctx.globalAlpha = 1;
  drawIliaCombos(); // Ilia's combo finisher: the gold ring and 4-PIECE! over them (ilia-combos.js)

  if (stadium) drawJumbotron(px);
  drawLadderSky(s, ox, oy); // Hokit up the ladder and diving off it (hokit-ladder.js)
  drawHotSauce(s, ox, oy); // Dustin's bottle, gloves, steam and fire breath (hot-sauce.js)
  drawChamaCrowd(s, ox, oy); // the crowd shouting CHAMA back (pereira.js)
  drawGspCrowd(s, ox, oy); // the Montreal crowd chanting "GSP! GSP!" (gsp.js)
  drawStricklandSky(s, ox, oy); // America: flags all over the stands, fireworks, "U-S-A!" (strickland.js)
  drawLiddellSky(s, ox, oy); // snow falling over the whole arena (liddell.js)
  drawVolkSky(s, ox, oy); // AUSSIE AUSSIE AUSSIE, OI OI OI, and the streamers (volkanovski.js)
  drawHollowaySky(s, ox, oy); // Max Holloway's flashback TV, the 0:10 clock, his Button Mash buttons (holloway.js)
  drawProchazkaSky(s, ox, oy); // Jiří Procházka's dream of Musashi, over the whole screen (prochazka.js)
  drawTopRopeSky(s, ox, oy); // Hokit on the corner and flying off it, over the stands (hokit-toprope.js)
  drawDuckSky(s, ox, oy); // Jon falling in from the top of the screen, over the jumbotron (jon-duck.js)
  drawEagleSky(s, ox, oy); // Gaethje carried off by his eagle and dropping back in (gaethje-golf.js)
  drawSendLocation(s, ox, oy); // Khabib's phone call, the target circle and the beam (send-location.js)
  drawRingBearSky(s, ox, oy); // Khabib's thrown bear flying off the screen (khabib-bear.js)
  drawScreenFlash(); // the crowd's cameras going off (Do Bronx)
  fedorScreenCam(ox, oy, s); // the cinematic camera, letterbox and impact frame of Fedor's The Unmoving Man (fedor-unmoving.js)
  swordScreenZoom(ox, oy, s); // the whole screen pushing in on a sword duel (sword.js)
  katanaDuelScreenCam(ox, oy, s); // the katana duel's camera, letterbox and title (katana-duel.js)
  tossScreenZoom(ox, oy, s); // the camera punching in on a takedown landing (toss.js)
  deathScreenZoom(ox, oy, s); // the camera riding in on a K.O. flight (death.js)
  drawTaleTape(); // the tale of the tape before the whistle, which then starts the fight (tale-tape.js)
  drawIntroMsg(s, ox, oy); // the instruction to the viewer at the start (intro-msg.js)
  drawSendLocSpace(); // cut up to the space station while the fight holds (send-location.js)
  drawIslamCutscene(); // Islam's "2-3 years Dagestan": the van trip, the dust cloud and Hasbulla's catapult while the fight holds (islam-specials.js)
  drawCnCut(s, ox, oy); // Chuck Norris's entrance cutscene in Sean Strickland's America (chuck-norris-cut.js)
  drawDcCakeCut(); // Daniel Cormier's All About That Cake music video, over everything while the fight holds (cormier-cake-cut.js)
}
