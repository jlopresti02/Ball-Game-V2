// Per-frame update, HUD health bars and canvas sizing.
"use strict";

// Which attack a fighter is charging (or, for the Watcher, firing) right
// now, and how far along it is. Drives the looping attack sounds.
function chargeProgress(b) {
  if (b.powerState && b.powerState.phase === "charge")
    return { kind: "power", p: b.powerState.t / b.char.powerPunch.chargeDur };
  if (b.rageState && b.rageState.phase === "charge")
    return { kind: "rage", p: b.rageState.t / b.char.rage.chargeDur };
  var ws = b.watcherState, wc = b.char.watcher;
  // The Watcher sits quietly for its sit delay, then the lasers charge.
  if (ws && ws.phase === "charge" && ws.t >= wc.preDelay)
    return { kind: "watcher", p: (ws.t - wc.preDelay) / wc.chargeDur };
  // Then the lasers fire.
  if (ws && ws.phase === "laser")
    return { kind: "laser", p: ws.t / wc.fireDur, n: wc.lasers };
  return null;
}

function update(dt) {
  tickCrowd(dt); // the crowd builds up and dies down (audio.js)
  tickCommentary(dt); // random commentary in Gaethje's fights (audio.js)
  tickDoBronxFx(dt); // camera flashes keep going through freeze-frames
  tickChairDebris(dt);
  tickLadder(dt); // the ladder Hokit stands up and throws (hokit-ladder.js)
  tickToss(dt); // the ragdoll throw's dust, bounces and camera (toss.js)
  if (hitStop > 0) {
    // Frozen for a split second after a wall slam; only the camera shake
    // and shockwaves keep moving so the impact still reads.
    hitStop -= dt;
    impacts.forEach(function (im) { im.life -= dt; });
    return;
  }
  var h = dt / SUBSTEPS;
  for (var s = 0; s < SUBSTEPS; s++) step(h);
  updateAbilities(dt);
  // Moves that place fighters directly (grabs, seats, throws) can't leave
  // anyone partly through a wall.
  balls.forEach(function (b) {
    if (!b.alive) return;
    b.x = Math.min(W - b.r, Math.max(b.r, b.x));
    b.y = Math.min(H - b.r, Math.max(b.r, b.y));
  });
  impacts = impacts.filter(function (im) { im.life -= dt; return im.life > 0; });
  updateReferee(dt);
  tickRefNap(dt);   // the ref nodding off in Gane's fights (cheater.js)
  tickCheater(dt);
  tickDarkSide(dt); // Hokit's Dark Side: the Force push, the saber's hum (hokit-darkside.js)
  tickKatanaLock(dt); // Tony's katanas locked up with a sword, saber or bat (ferguson-katanas.js)
  tickJon(dt);      // Jon Jones swapping between GOAT and EVIL mode (jon.js)
  tickHelmetCharge(dt); // the 67'ers ad's clock (hokit-helmet.js)
  tickRingBear(dt); // Khabib's bear wandering the ring (khabib-bear.js)
  tickIliaTornado(dt); // roses from Ilia's Rose Tornado (ilia-tornado.js)
  tickIliaCombos(dt); // Ilia's combo finisher: the ring and its text (ilia-combos.js)
  tickPunchTypes(dt); // setups from body shots and uppercuts wearing off (body-shots-uppercuts.js)
  tickSendLocation(dt); // Khabib's Send Me Location: sparks, rings, the crater cooling (send-location.js)
  tickHotSauce(dt); // Dustin's Hot Sauce Fire Breath: flames, steam, whoever's burning (hot-sauce.js)
  tickPereira(dt); // Alex Pereira's step, his arrow, the crowd's CHAMA (pereira.js)
  tickOmalley(dt); // Sean O'Malley's sweets and the race for them, sugar highs and crashes (omalley.js)
  tickGsp(dt); // GSP's walkout, the Montreal chant, his slip run (gsp.js)
  tickMightyMouse(dt); // Mighty Mouse's game film, copycat, cardio, voice lines (mighty-mouse.js)
  tickConor(dt); // Conor McGregor's gas tank, his lines, 13 SECONDS (conor.js)
  tickRainbow(dt); tickBeamClash(dt); tickBeamPins(dt); // the Pot o' Gold's coins, and a beam clash (rainbow-beam.js, beam-clash.js)
  tickLiddell(dt); // frost melting, the snow, Chuck Liddell's all-out attack (liddell.js)
  tickNgannou(dt); // Francis Ngannou's rage meter, knockdowns, Dana White (ngannou.js)
  tickVolk(dt); // Alexander Volkanovski's fight IQ, circling, the green and gold arena (volkanovski.js)
  tickMovement(dt); // shared movement styles: walking them down, cutting the cage, side steps (movement.js)
  tickHolloway(dt); // Max Holloway's Blessed meter, Button Mash buttons, the flashback (holloway.js)
  tickVan(dt); // Joshua Van's chain counter, the fire on his gloves, the win flag, his lines (van.js)
  tickStrickland(dt); // Sean Strickland's range, pace, trauma meter and the America show (strickland.js)
  tickDiaz(dt); // Nate Diaz's lines, holds and bottles, and Nick Diaz in the cage (diaz.js)
  tickFerguson(dt); // Tony Ferguson's Kaioken, won't-tap, lines, stamps, Burrito Bell (ferguson.js)
  tickFedor(dt); // Fedor Emelianenko's hands, his calm, his ground and pound and armbar, the mantra (fedor.js)
  tickBisping(dt); // Michael Bisping's clinch elbows, footwork, scorecard, lines and cannonballs (bisping.js)
  tickCormier(dt); // Daniel Cormier's belly, lines, the dents in the mat (cormier.js)
  tickPrates(dt); // Carlos Prates's footwork, the cigarette and the party, smoke and music (prates.js)
  tickProchazka(dt); // Jiří Procházka's samurai bar, the blade lock, his lines (prochazka.js)
  tickElbows(dt); // cuts from elbows bleeding (elbows.js)
  tickClinch(dt); // a clinch let go if something else takes over (clinch.js)
  tickKnees(dt); // knees landing, the clinch and flying knee let go if something else takes over, a flying-knee knockout (knees.js)
  tickCombos(dt); // a combination cut short if something else takes over (combos.js)
  tickAnderson(dt); // Anderson Silva's lean, front kick knockout, triangle off a takedown, lines (anderson.js)
  tickGetUp(dt); // a striker with a getUp block getting back up off the mat (get-up.js)
  tickSlows(dt); // limps wearing off (slowdown.js)
  tickLegKicks(dt); // a leg kick let go if something else takes over, the limping step (leg-kick.js)
  tickGane(dt); // Ciryl Gane's back-foot footwork, grabs coming round faster on him (gane.js)
  tickChatter(dt); // extra real voice lines for any fighter, by id (chatter.js)
  tickCommentaryCalls(dt); // the commentators' calls on big moments, knockouts, the end of the fight (commentary-calls.js)
  tickSpeech(dt); // voice-line speech bubbles (speech.js)
  tickTopRope(dt); // the dented mat after Hokit's Top Rope Body Slam (hokit-toprope.js)
  tickDuckDrop(dt); // smoke, feathers and the cracked mat from his Duck Drop (jon-duck.js)
  tickJumboAds(dt); // ads on the jumbotron, one at a time (truckees-ad.js)
  tickAdBreaks(dt); // sponsor ads at random times, like Poorbet (ad-breaks.js)
  tickEagleStrikes(dt); // Gaethje's Eagle Strike: the red path and the swoop (gaethje-eagle.js)
  tickGolf(dt);         // and his golf mode running out (gaethje-golf.js)
  tickDiamond(dt);  // Dustin turning into Diamond Guard and throwing diamonds (diamond.js)
  updateHerb(dt);   // Herb Dean wandering the cage (herbdean.js)
  tickWatchdog(dt); // a fighter stuck in one state far too long gets let go (watchdog.js)

  balls.forEach(function (b) {
    var charging = (!over && b.alive) ? chargeProgress(b) : null;
    updateChargeSound(b.id, charging ? charging.kind : null, charging ? charging.p : 0, charging ? charging.n : 0);
    if (!b.koOut) updateForget(b, dt);
    tickSpecialCharge(b, dt);
    b.healGlow = Math.max(0, (b.healGlow || 0) - dt);
    updateCheck(b, dt);
    if (b.checkStun > 0) { b.checkStun = Math.max(0, b.checkStun - dt); b.vx = 0; b.vy = 0; }
    if (b.checkAnim) stepInForKickBack(b, balls[b.checkAnim.towardId]);
    if (b.slamSafe > 0) b.slamSafe = Math.max(0, b.slamSafe - dt);
    if (b.guilloCd > 0) b.guilloCd = Math.max(0, b.guilloCd - dt);
    if (b.suplexCd > 0) b.suplexCd = Math.max(0, b.suplexCd - dt);
    if (b.guardCd > 0 && !subLocked(b)) b.guardCd = Math.max(0, b.guardCd - dt);
    if (b.iowaSafe) { b.iowaSafe.t -= dt; if (b.iowaSafe.t <= 0) b.iowaSafe = null; }
    b.flash = Math.max(0, b.flash - dt);
    b.immuneCd = Math.max(0, b.immuneCd - dt);
    if (b.jabAnim) {
      b.jabAnim.t += dt;
      if (b.jabAnim.t >= b.jabAnim.dur) b.jabAnim = null;
    }
    if (b.weaveAnim) {
      b.weaveAnim.t += dt;
      if (b.weaveAnim.t >= b.weaveAnim.dur) b.weaveAnim = null;
    }
    if (b.knockFly > 0) {
      // Launched by a combo finisher: flies at full launch speed for a moment
      // before the speed regulator starts easing it back down.
      b.knockFly = Math.max(0, b.knockFly - dt);
    }
    if (b.mock && (b.grappled || b.slam || subLocked(b) || b.igbb || b.koOut)) b.mock = null;
    steerAngry(b, dt); // wound up by a thumbs down: heads straight for him
    regulateSpeed(b, dt);
    if ((b.combo || b.flow || (b.jabAnim && b.jabAnim.big)) && !reduceMotion) {
      // Streak behind a fighter hunting down its combo.
      particles.push({
        x: b.x, y: b.y, vx: -b.vx * 0.12, vy: -b.vy * 0.12,
        life: 0.2, max: 0.2, size: b.r * 0.5, color: b.char.color
      });
    }
    if (b.rageState && b.rageState.phase === "attack" && !reduceMotion) {
      // A faint trail behind Sees Red while it's charging through the arena.
      particles.push({
        x: b.x, y: b.y, vx: -b.vx * 0.15, vy: -b.vy * 0.15,
        life: 0.22, max: 0.22, size: b.r * 0.45, color: b.char.color
      });
    }
    if (b.squash) {
      b.squash.t -= dt;
      if (b.squash.t <= 0) b.squash = null;
    }
    if (b.slam && b.alive && !reduceMotion) {
      // A streak in the attacker's color while the victim pinballs off the walls.
      particles.push({
        x: b.x, y: b.y, vx: -b.vx * 0.1, vy: -b.vy * 0.1,
        life: 0.3, max: 0.3, size: b.r * 0.75, color: balls[b.slam.attackerId].char.color
      });
    }
    b.shown += (b.hp - b.shown) * Math.min(1, dt * 4);
    if (Math.abs(b.hp - b.shown) < 0.1) b.shown = b.hp;
  });
  floaters = floaters.filter(function (f) { f.life -= dt; f.y -= 46 * dt; return f.life > 0; });
  particles = particles.filter(function (p) { p.life -= dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= 0.96; p.vy *= 0.96; return p.life > 0; });
  shake = Math.max(0, shake - dt * 30);
}

var hudCache = [];
function updateHud(force) {
  for (var i = 0; i < 2; i++) {
    var b = balls[i];
    var rounded = Math.ceil(b.hp);
    var key = rounded + "/" + Math.round(b.shown);
    if (!force && hudCache[i] === key) continue;
    hudCache[i] = key;
    document.getElementById("hp" + i).textContent = rounded;
    document.getElementById("fill" + i).style.width = (b.hp / MAX_HP * 100) + "%";
    document.getElementById("ghost" + i).style.width = (b.shown / MAX_HP * 100) + "%";
    maxHpHud(i, b); // health over 500 as a pale layer on the bar (max-hp.js)
    document.getElementById("bar" + i).setAttribute("aria-valuenow", rounded);
  }
  updateRejuvHud(force);
  updateSpecialHud(force);
}

// CTE Rejuvenation bar: fills as the next heal gets closer, then empties
// when the timer resets, glowing for a moment as the heal lands.
var rejuvCache = [];
function updateRejuvHud(force) {
  for (var i = 0; i < 2; i++) {
    var b = balls[i];
    if (!b.char.hasForget) continue;
    var p = Math.max(0, Math.min(1, (b.forgetT || 0) / b.char.forget.every));
    var healing = b.healGlow > 0;
    var key = Math.round(p * 400) + (healing ? "h" : "");
    if (!force && rejuvCache[i] === key) continue;
    rejuvCache[i] = key;
    document.getElementById("rejuvFill" + i).style.width = (p * 100) + "%";
    document.getElementById("rejuvBar" + i).setAttribute("aria-valuenow", Math.round(p * 100));
    document.getElementById("rejuv" + i).classList.toggle("healing", healing);
  }
}

function resize() {
  var rect = canvas.getBoundingClientRect();
  if (!rect.width) return;
  var dpr = window.devicePixelRatio || 1;
  canvas.width = Math.round(rect.width * dpr);
  canvas.height = Math.round(rect.width * (stadiumOn() ? STAGE_H / STAGE_W : H / W) * dpr);
}
