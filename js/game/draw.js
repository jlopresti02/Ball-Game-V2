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
  drawRapierLungeUnder(); // Ilia's lunge: the red line he's about to lunge down (rapier.js)
  drawLadderUnder();   // Hokit's ladder standing in the ring, the red circle, his shadow (hokit-ladder.js)
  drawTopRopeUnder();  // Top Rope Body Slam: the red circle (cut off at the cage), his shadow (hokit-toprope.js)
  drawTossUnder();      // the shadow under a fighter thrown in the air (toss.js)
  drawDuckUnder();      // Duck Drop: the red circle, his shadow coming down, the crater (jon-duck.js)
  drawEagleStrikeUnder(); // Eagle Strike: the red path and the eagle's shadow (gaethje-eagle.js)
  drawPereiraUnder(); // Bow and Arrow: the red ricochet path (pereira.js)
  drawOmalleyUnder(); // sweets on the mat, the race lines, the crane kick's path (omalley.js)
  drawGspUnder(); // GSP's shadow in the air and the Superman Dive's red lane (gsp.js)
  drawLiddellUnder(); // snow on the mat, Chuck Liddell's ice flames (liddell.js)
  drawNgannouUnder(); // Ngannou's rage punch line, the Smash circle and crater, Dana at the cage (ngannou.js)
  drawVolkUnder(); // Volkanovski's circling arrow, his flag, the kangaroo behind him (volkanovski.js)
  if (!allAmericanOn()) drawReferee(); // under the fighters (referee.js)

  // A fighter running its special move is drawn on top (e.g. mounted for
  // Father's Plan's ground and pound).
  // A shooter caught in a guillotine goes underneath, its head buried
  // under the defender (and the defender, once it's taken down).
  drawDuelShadow(); // shadows under fighters leaping in a sword duel (sword.js)
  // Whoever took the back for a rear naked choke goes behind the one it chokes.
  // A bat swing goes over whoever it's hitting.
  (balls[0].igbb || guilloUnder(balls[1]) || rncBehind(balls[1]) || (balls[0].chAct && balls[0].chAct.kind === "bat") ? [balls[1], balls[0]] : balls).forEach(function (b) {
    if (!b.alive || duckDrawnApart(b) || golfDrawnApart(b) || topRopeDrawnApart(b) || ladderDrawnApart(b)) return; // (a duck, up in the sky, or falling in: drawDuckOver, drawDuckSky)
    var other = balls[1 - b.id];

    // Weaving slips the whole fighter sideways for a moment, and a taunting
    // fighter bounces on the spot. Everything below draws at the shifted spot.
    var wox = 0, woy = 0;
    if (b.weaveAnim) {
      var wa = b.weaveAnim, wk = Math.sin(Math.PI * wa.t / wa.dur);
      var wsp = Math.sqrt(b.vx * b.vx + b.vy * b.vy), wfx = 1, wfy = 0;
      if (wsp > 1) { wfx = b.vx / wsp; wfy = b.vy / wsp; }
      wox = -wfy * wa.sign * b.r * 0.75 * wk;
      woy = wfx * wa.sign * b.r * 0.75 * wk;
    }
    if (b.taunt && b.taunt.t > 0) woy -= Math.abs(Math.sin(b.taunt.t * 11)) * 6;
    var hjo = herbJoltOffset(b); wox += hjo.x; woy += hjo.y; // rocked by a bat or a cane (herbdean.js)
    var gbl = ganeBatLean(b); wox += gbl.x; woy += gbl.y; // throwing his weight into a bat swing (cheater.js)
    var dzo = dizzyOffset(b); wox += dzo.x; woy += dzo.y; // staggering after a haymaker (gaethje.js)
    var aao = allAmericanOffset(b); wox += aao.x; woy += aao.y; // launched down the highway (allamerican.js)
    var afo = auraOffset(b); wox += afo.x; woy += afo.y; // dancing, bowing, or shaking at the bull (aurafarm.js)
    var jfo = jonFloatOffset(b); wox += jfo.x; woy += jfo.y; // floating for GOAT Stampede (jon.js)
    var sbo = swordBodyOffset(b); wox += sbo.x; woy += sbo.y; // lunging and leaping with the sword (sword.js)
    var kmo = kameOffset(b); wox += kmo.x; woy += kmo.y; // leaning back to charge, lunging into the Kamehameha (kamehameha.js)
    var ngo = ngannouOffset(b); wox += ngo.x; woy += ngo.y; // up in the air for Ngannou's Smash (ngannou.js)
    var homeX = b.x, homeY = b.y; // put back exactly after (adding and subtracting would drift: seed.js replays)
    b.x += wox; b.y += woy;
    drawSaiyanAura(b); // Charles's golden aura while he's blond, behind him (dobronx.js)
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
    applyGspPose(b); // GSP crouching to load, up in the air for the leap and the dive (gsp.js)
    applyConorPose(b); // Conor McGregor rocking on his strut, planted, or gassed (conor.js)
    applyNgannouPose(b); // Ngannou crouching and leaping for the Smash, or knocked flat by it (ngannou.js)
    applyVolkPose(b); // Volkanovski leaning into his circling, small in the pouch (volkanovski.js)

    var img = getImg(b.char.imgData);
    if (b.char.look) {
      // Fighter art: the muscled ball in its fight kit (beats a face photo)
      drawFighterArt(ctx, b.x, b.y, b.r, b.char.look, theme.wall, { layout: "contained", name: b.char.name });
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
      ctx.fillStyle = b.char.color; ctx.fillRect(bx, by, bw * (b.hp / MAX_HP), bh);
      ctx.lineWidth = 2; ctx.strokeStyle = theme.wall; ctx.strokeRect(bx, by, bw, bh);
    }

    drawFist(b, other);
    drawKoPunch(b);
    drawShock(b);
    drawKoOut(b);
    drawSwing(b);
    drawCheck(b);
    drawKick(b, other);
    drawGrapple(b);
    drawThrow(b, other);
    drawPowerSpin(b);
    drawJab(b);
    drawDiamondSword(b, other); // Dustin's diamond sword, under his guard glove (diamond.js)
    drawHands(b, other);
    drawPereira(b); // Alex Pereira's CHAMA fists and bow, and a calf-kick limp (pereira.js)
    drawOmalley(b); // Sean O'Malley's crane kick, sugar boost, pips and crash (omalley.js)
    drawGsp(b); // GSP's Superman fists, hands down for "not impressed" (gsp.js)
    drawMightyMouse(b); // Mighty Mouse's mimic aura and crouch (mighty-mouse.js)
    drawConor(b); // Conor McGregor's strut, counter stance, podium and gas tank, Dustin's calf kick (conor.js)
    drawLiddell(b); // Chuck Liddell packing the snow, his blue overhand (liddell.js)
    drawNgannou(b, other); // Ngannou's rage meter, going green, his rage punch, the Smash, the contract (ngannou.js)
    drawVolk(b); // Volkanovski's arms up, punching out of the pouch (volkanovski.js)
    drawDoBronx(b); // the pose
    drawSaiyanBolts(b); // lightning over Charles while he's blond (dobronx.js)
    drawKameHands(b); // and his hands and the ball of energy for the Kamehameha (kamehameha.js)
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
  drawDiamondSwordsTop(); // Dustin's sword slashing into a bat, over both fighters (sword.js)
  drawDuelVignette(); // the duel's dark edges and impact flash (sword.js)
  drawSprawls();
  drawGuillotines();
  drawRncs();
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
  drawItFx(); // and his Instant Transmission zip lines and hard shot (instant-transmission.js)
  drawTornadoOver(); // the Rose Tornado and the roses flying out of it (ilia-tornado.js)
  drawRingBear(); // Khabib's bear, or the dust cloud it's fighting in (khabib-bear.js)
  drawDuckOver();      // the duck, smoke and feathers, his superhero landing (jon-duck.js)
  drawEagleStrikeOver();  // the eagle swooping through, and its claw marks (gaethje-eagle.js)
  drawSuplexes();
  drawPereiraOver(); // his arrow flying, stuck in the cage, or up into the sky (pereira.js)
  drawOmalleyOver(); // Sugar Rush sweets falling in (omalley.js)
  drawGspOver(); // GSP's gi and headband flying off (gsp.js)
  drawMightyMouseOver(); // Mighty Mouse's SCOUTING notepad, sweat off a tired opponent (mighty-mouse.js)
  drawNgannouOver(); // Ngannou's mat chunks, contract scraps, punch-power banner in the test arena (ngannou.js)
  drawVolkOver(); // the kangaroo's pouch, arms and kick, the FIGHT IQ card (volkanovski.js)

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
  drawConorBanner(); // and Conor McGregor's 13 SECONDS (conor.js)
  drawBearWarnBanner(); // and WARNING: BEAR IN ARENA (bear-warning.js)
  drawTossOver(); // the throw's dust, ring and THROWN! (toss.js)
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

  if (stadium) drawJumbotron(px);
  drawLadderSky(s, ox, oy); // Hokit up the ladder and diving off it (hokit-ladder.js)
  drawHotSauce(s, ox, oy); // Dustin's bottle, gloves, steam and fire breath (hot-sauce.js)
  drawChamaCrowd(s, ox, oy); // the crowd shouting CHAMA back (pereira.js)
  drawGspCrowd(s, ox, oy); // the Montreal crowd chanting "GSP! GSP!" (gsp.js)
  drawLiddellSky(s, ox, oy); // snow falling over the whole arena (liddell.js)
  drawVolkSky(s, ox, oy); // AUSSIE AUSSIE AUSSIE, OI OI OI, and the streamers (volkanovski.js)
  drawTopRopeSky(s, ox, oy); // Hokit on the corner and flying off it, over the stands (hokit-toprope.js)
  drawDuckSky(s, ox, oy); // Jon falling in from the top of the screen, over the jumbotron (jon-duck.js)
  drawEagleSky(s, ox, oy); // Gaethje carried off by his eagle and dropping back in (gaethje-golf.js)
  drawSendLocation(s, ox, oy); // Khabib's phone call, the target circle and the beam (send-location.js)
  drawRingBearSky(s, ox, oy); // Khabib's thrown bear flying off the screen (khabib-bear.js)
  drawScreenFlash(); // the crowd's cameras going off (Do Bronx)
  swordScreenZoom(ox, oy, s); // the whole screen pushing in on a sword duel (sword.js)
  tossScreenZoom(ox, oy, s); // the camera punching in on a takedown landing (toss.js)
  deathScreenZoom(ox, oy, s); // the camera riding in on a K.O. flight (death.js)
  drawIntroMsg(s, ox, oy); // the instruction to the viewer at the start (intro-msg.js)
  drawSendLocSpace(); // cut up to the space station while the fight holds (send-location.js)
}
