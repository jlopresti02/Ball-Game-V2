// The Gallery: a screen for browsing what's in the game, for planning and
// reviewing reels. Three tabs:
//   Fighters: each roster fighter's skin (drawn by the real fighter art
//     code), bio, moves with their numbers, and buttons that play a live
//     demo of the special move or a whole fight.
//   Assets: the arenas, props and pictures the game draws, rendered by the
//     same drawing code the fights use.
//   Sounds: every clip and synthesized sound effect, with a play button.
// Demos run in the real game screen with a pause button (pausing freezes the
// fight, its animations and its sound) so a moment can be looked at or
// screenshotted. Everything is read from the game itself, so new fighters,
// moves and sounds show up here without the gallery being updated.
"use strict";

var galleryTab = "fighters";
var galleryDemo = null;   // { kind: "special" | "fight", a, b } while a demo is running
var gamePaused = false;

// ---------------------------------------------------------------- pausing

// Pausing stops update() (main.js) and freezes the clock that the drawing
// code animates idle wobbles, fans and flashes with, and suspends audio.
var realPerfNow = performance.now.bind(performance);
var pausedAt = null, pausedTotal = 0;
try {
  performance.now = function () { return (pausedAt !== null ? pausedAt : realPerfNow()) - pausedTotal; };
} catch (e) { /* the clock just won't freeze */ }

function setGamePaused(on) {
  on = !!on;
  if (on === gamePaused) return;
  gamePaused = on;
  if (on) pausedAt = realPerfNow();
  else if (pausedAt !== null) { pausedTotal += realPerfNow() - pausedAt; pausedAt = null; }
  try {
    var ac = getAudioCtx();
    if (ac) { if (on) ac.suspend(); else ac.resume(); }
  } catch (e) { /* never let audio break the game */ }
  var btn = document.getElementById("demoPause");
  btn.textContent = on ? "▶ Play" : "⏸ Pause";
  btn.setAttribute("aria-pressed", on ? "true" : "false");
  document.getElementById("screenGame").classList.toggle("paused", on);
}

// ---------------------------------------------------------------- moves

function galleryFighters() { return customChars.slice(); }

function secs(n) { return (Math.round(n * 100) / 100) + "s"; }
function titleCase(s) { return String(s).toLowerCase().replace(/\b\w/g, function (c) { return c.toUpperCase(); }); }

var SUB_NAMES = { rnc: "rear naked choke", armbar: "armbar", guillotine: "guillotine", bjj: "rear naked choke or armbar", striker: "guillotine" };

// Short descriptions of each special. The numbers come from the fighter.
var SPECIAL_INFO = {
  igbb: function (sp) { return "Grabs them one-handed and throws them into a corner, then unloads a flurry of " + sp.punches + " fast " + sp.damage + "-damage punches while they shell up. If they survive he backs off with his guard up."; },
  fathersplan: function (sp) { return "Hurls them off " + sp.walls + " walls (" + sp.wallDamage + " each), slams them to the floor (" + sp.slamDamage + "), then kneels over them for " + sp.punches + " telegraphed ground-and-pound punches (" + sp.damage + " each). \"I'm gonna smash your boy.\""; },
  dobronx: function (sp) { return "Double-biceps pose that blasts them away, \"Charrrles... Do... BRONX!\", every camera flashes and the arena turns Brazil themed for " + sp.duration + " seconds: " + (sp.damageMult || 2) + "x damage, takedowns every time, and every takedown goes into a submission."; },
  chairshot: function (sp) { return "Pulls a folding chair from under the ring, charges them down and swings it over their head for " + sp.damage + " (can't be weaved or blocked), leaving them dazed for " + sp.dazeTime + "s. Then hurls the chair into the stands and runs a lap celebrating."; },
  herbdean: function (sp) { return "The ref falls asleep and blind Herb Dean barges in through the crowd with his cane. Gane beats them with a bat (" + sp.batDamage + " a swing), Herb whacks them with the cane (" + sp.caneDamage + "), and a last bat swing does " + sp.finisher + "."; },
  goatstampede: function (sp) { return "Floats up into the air, his tattoo flickering gold and red, and summons " + sp.goats + " goats. Each runs in through the crowd, leaps the fence and charges straight across the cage through center stage, down a lane shown in red first (" + sp.goatDamage + " if it rams them, then they pinball off " + sp.ramWalls + " walls for " + sp.ramWallDamage + " each). The lanes are random, so they can be dodged by being somewhere else."; },
  allamerican: function (sp) { return "A hook for " + sp.punchDamage + " so hard the cameras white out. They wake up on a highway at night under Free Bird: four bald eagles dive at them (" + sp.eagleDamage + " each), a semi runs them over (" + sp.truckDamage + "), \"U-S-A!\", then back in the cage he finishes with a rolling thunder kick (" + sp.thunderDamage + ")."; }
};

// Every move a fighter has, as { icon, name, info }, built from its stats.
function galleryMoves(ch) {
  var m = [];
  function add(icon, name, info) { m.push({ icon: icon, name: name, info: info }); }
  if (ch.hasPunch) {
    var p = ch.punch;
    if (ch.base === "BMF" || p.cooldown < 0.3) add("👊", "Jabs", p.damage + " damage each, one every " + secs(p.cooldown) + " up close.");
    else add("👊", "Punch", p.damage + " damage, one every " + secs(p.cooldown) + ", " + p.reach + " reach.");
    if (p.koChance > 0) add("⚡", "KO Rush", p.koChance + "% of fights he opens by sprinting in with a big hook cocked back. If it isn't weaved, blocked or countered, it's a knockout.");
  }
  if (ch.hasKick) {
    var k = ch.kick;
    add("🦵", "Kick", k.damage + " damage from long range (" + k.reach + " reach), one every " + secs(k.cooldown) + "." + (k.checkChance ? " Another Kicker checks it " + k.checkChance + "% of the time." : ""));
  }
  if (ch.hasProjectile) add("🎯", "Projectile", ch.proj.damage + " damage from range, one every " + secs(ch.proj.cooldown) + ".");
  if (ch.hasGrapple) {
    var g = ch.grapple;
    var shoot = g.shotChance ? "Shoots " + g.shotChance + "% of the times he's close enough" : "Grabs on contact";
    var info = shoot + " and slams them into the cage for " + g.damage + ". Sprawls " + g.sprawlChance + "% of shots on him.";
    if (g.vsGrapplerChance != null && g.vsGrapplerChance < 100) info += " Only shoots " + g.vsGrapplerChance + "% of the time against another Grappler.";
    add("🤼", g.shotName ? titleCase(g.shotName) : "Takedown", info);
  }
  if (ch.hasSuplex) add("🤼", "Back suplex", ch.suplex.chance + "% of his grabs from behind become a suplex over his head for " + ch.suplex.damage + ".");
  if (ch.hasGuillotine) {
    var gu = ch.guillotine;
    add("🔒", "Guillotine", gu.chance + "% of takedown shots on him get caught in a guillotine. They tap " + gu.tapBase + "% of the time at full health, up to " + (gu.tapBase + gu.tapLowHp) + "% when hurt. Rarely the one caught slams out of it (" + gu.slamDamage + ").");
  }
  if (ch.hasGuard) {
    var gd = ch.guard;
    var subs = (gd.subs || []).map(function (s) { return SUB_NAMES[s] || s; }).join(" or ");
    add("🥋", "Guard", gd.chance + "% of hits drop him into guard for " + secs(gd.time) + ". Step into the circle and it's a coin flip: pass (" + gd.passPunches + " free punches of " + gd.passDamage + ") or get caught in a " + subs + ".");
  }
  if (ch.hasWeave) {
    var w = ch.weave;
    add("🌀", "Weave", "Slips " + w.dodgeChance + "% of attacks. " + w.critChance + "% of slips are critical: a " + w.comboHits + "-punch chase combo ending in a launching blow, then a celebration.");
  }
  if (ch.hasArmbarShot) {
    var lets = ch.armbar && !ch.armbar.tapBase && !ch.armbar.tapLowHp;
    add("🦵", "Armbar shot", ch.armbarShot.chance + "% a second while touching: a double leg that always lands, straight into an armbar" + (lets ? ", and he always lets them go." : "."));
  }
  if (ch.hasThumbsDown) add("👎", "Thumbs down", "Every " + secs(ch.thumbsDown.cooldown) + " he mocks them. They see red for " + secs(ch.thumbsDown.anger) + " and storm straight at him.");
  if (ch.hasSwing) {
    var s = ch.swing;
    add("🥴", s.cooldown ? "Haymaker" : "Wild swing", s.damage + " damage" + (s.cooldown ? ", one every " + secs(s.cooldown) : ", sweeping hooks with no cooldown") + (s.dizzy ? ". Leaves them dizzy for " + secs(s.dizzy) + "." : "."));
  }
  if (ch.violent) add("💢", "Violent hits", "Everything he lands freezes the frame, shakes the screen and squashes them.");
  if (ch.hasPowerPunch) add("💥", "Power punch", "Spins into a " + ch.powerPunch.damageMin + "-" + ch.powerPunch.damageMax + " damage haymaker that pinballs them off the walls.");
  if (ch.hasRage) add("😡", "Sees red", "Charges in throwing " + ch.rage.punchCount + " jabs of " + ch.rage.punchDamage + ".");
  if (ch.hasWatcher) add("👁️", "Watcher", "Sits in a corner seat, charges up and fires " + ch.watcher.lasers + " tracking lasers.");
  if (ch.hasForget) add("🧠", "CTE Rejuvenation", "Forgets damage and regains " + ch.forget.heal + " health every " + secs(ch.forget.every) + ".");
  if (ch.hasCheater) {
    var c = ch.cheater;
    var objs = (typeof CHEATER_OBJECTS !== "undefined" ? CHEATER_OBJECTS : []).map(function (o) { return o.name.toLowerCase() + " " + o.damage; }).join(", ");
    add("😴", "Cheater mode", "The ref sleeps " + secs(c.asleep) + " after every " + secs(c.awake) + " awake. He picks one trick per nap: eye pokes into a combo, throwing objects (" + objs + "), or a bat (" + c.bat.damage + " a swing). Takedowns on him fail: he grabs the cage and stands up.");
  }
  if (ch.blockChance > 0) add("🛡️", "Block", "Blocks " + ch.blockChance + "% of strikes.");
  if (ch.jon) {
    // Jon Jones (jon.js): the moves above are his GOAT mode.
    var j = ch.jon, pk = ch.cheater.poke, pkTotal = pk.combo.reduce(function (a, b) { return a + b; }, pk.damage);
    var gnpTotal = j.gnp.reduce(function (a, b) { return a + b; }, 0);
    add("🐐", "GOAT mode", "Everything above, with his chest tattoo glowing gold. " + j.rncChance + "% of his takedowns go to the back for a rear naked choke and " + j.gnpChance + "% into ground and pound (" + j.gnp.length + " punches, " + gnpTotal + " total). Swaps modes every " + secs(j.swapEvery) + ".");
    add("😈", "EVIL mode", "Tattoo glowing red. Switches from kicks to punches, sprawls " + (j.evil.tdd ? j.evil.tdd.sprawlChance : 0) + "% of shots and slips " + ch.weave.dodgeChance + "% of attacks. " + ch.weave.critChance + "% of slips are an eye poke into a " + pk.combo.length + "-punch combination (" + pkTotal + " total).");
  }
  if (ch.diamond) {
    // Dustin Poirier's Diamond Guard (diamond.js).
    var dm = ch.diamond, gemDmg = dm.gemDamage != null ? dm.gemDamage : ch.punch.damage;
    add("💎", "Diamond Guard", "Below " + Math.round(dm.triggerHp * 100) + "% health he transforms: diamond armor on, blocks " + (dm.blockBonus || 0) + "% more, and every " + dm.throwEvery[0] + "-" + dm.throwEvery[1] + "s he throws a diamond for " + gemDmg + " damage (a punch's worth), on top of everything else.");
    var scl = dm.swordClash;
    if (scl && scl.enabled) add("🗡️", "Sword clash", "In Diamond Guard, when they pull a weapon (" + scl.weapons.join(", ") + ") he pulls out a diamond sword and parries " + scl.parryChance + "% of the swings: no damage, and the swing gets knocked away." + (scl.duel ? " Every " + scl.duel.after + " parries the weapons lock up in a sword duel: " + scl.duel.clashes + " clashes, then he disarms them (" + scl.duel.disarmChance + "%) or cuts through with a " + scl.duel.slashDamage + "-damage Diamond Slash." : ""));
  }
  return m;
}

function specialInfo(ch) {
  if (!ch.hasSpecial || !ch.special) return null;
  var sp = ch.special, fn = SPECIAL_INFO[sp.move];
  var charge = "Charges in " + sp.chargeTime + "s; each clean hit takes " + sp.hitCut + "s off" + (sp.punchCut != null && sp.punchCut !== sp.hitCut ? ", each punch " + sp.punchCut + "s" : "") + ".";
  return { name: specialName(ch), info: fn ? fn(sp) : "", charge: charge };
}

// ---------------------------------------------------------------- drawing helpers

// Runs draw() with the game's drawing context pointed at another canvas, so
// functions that draw on the arena (props, flags) can draw a card instead.
function withCtx(c, draw) {
  var saved = ctx;
  ctx = c;
  try { readTheme(); draw(c); }
  catch (e) { /* one broken picture shouldn't break the page */ }
  finally { ctx = saved; }
}

function makeCanvas(w, h, scale) {
  var cv = document.createElement("canvas");
  var k = scale || Math.min(3, window.devicePixelRatio || 1);
  cv.width = Math.round(w * k); cv.height = Math.round(h * k);
  cv.style.width = w + "px"; cv.style.aspectRatio = w + " / " + h;
  var c = cv.getContext("2d");
  c.scale(k, k);
  return { el: cv, c: c };
}

// A fighter's skin: the ball with its gloves up either side.
function drawSkin(c, ch, size) {
  var r = size * 0.33, x = size / 2, y = size * 0.5;
  var ink = "#16211f";
  if (ch.look) {
    var gr = r * 0.36;
    drawFighterArt(c, x, y, r, ch.look, ink, { layout: "contained", name: ch.name });
    drawGlove(c, x - r * 0.98, y + r * 0.42, gr, ch.look, ink, -Math.PI / 2 + 0.35);
    drawGlove(c, x + r * 0.98, y + r * 0.42, gr, ch.look, ink, -Math.PI / 2 - 0.35);
  } else {
    c.fillStyle = ch.color; c.strokeStyle = ink; c.lineWidth = 3;
    c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill(); c.stroke();
  }
}

// ---------------------------------------------------------------- assets

function drawStadiumPreview(c, w, h, brazil) {
  var px = w / STAGE_W;
  var wasBrazil = brazilMode;
  brazilMode = !!brazil;
  try {
    c.save();
    c.scale(px, px);
    drawStandsLayer(c);
    c.save(); c.translate(ST.AX, ST.AY); c.scale(ST.A / W, ST.A / W); drawMatLayer(c); c.restore();
    var t = performance.now() / 1000;
    stadiumFans.forEach(function (f) {
      var fan = brazil ? f.br : f;
      c.save(); c.translate(fan.x, fan.y); drawFanBall(c, fan.r, fan); c.restore();
    });
    withCtx(c, function () {
      stadiumFans.forEach(function (f) {
        var fan = brazil ? f.br : f;
        if (fan.sign) drawFanSign(fan, t);
        else if (fan.flag) drawBrazilFlag(fan.x + fan.r * 0.3, fan.y - fan.r * 1.55, fan.r * 1.3, t, fan.phase);
      });
    });
    drawJumbotronFrame(c);
    c.restore();
  } finally { brazilMode = wasBrazil; }
}

function imageAsset(src) {
  return function (c, w, h) {
    var img = new Image();
    img.onload = function () {
      var k = Math.min(w / img.naturalWidth, h / img.naturalHeight) * 0.92;
      var iw = img.naturalWidth * k, ih = img.naturalHeight * k;
      c.drawImage(img, (w - iw) / 2, (h - ih) / 2, iw, ih);
    };
    img.src = src;
  };
}

function refereeLook() {
  var look = defaultLook();
  look.skin = "#c99172"; look.hair = "bald"; look.beard = "none"; look.build = "lean";
  return { look: look, shirt: "#151515", style: "tee", team: null, shirtless: false, cap: null, phase: 0 };
}

// Each asset: name, where it's used, its card size and how to draw it.
function galleryAssets() {
  var list = [];
  list.push({ name: "WWIT stadium", info: "The 9:16 reels arena: stands, cage, branded mat and jumbotron.", w: 270, h: 480, draw: function (c, w, h) { drawStadiumPreview(c, w, h, false); } });
  list.push({ name: "Brazil stadium", info: "Charles Oliveira's Do Bronx turns the stadium Brazil themed.", w: 270, h: 480, draw: function (c, w, h) { drawStadiumPreview(c, w, h, true); } });
  list.push({ name: "Test arena", info: "The plain square arena (and its Brazil flag during Do Bronx).", w: 220, h: 220, draw: function (c, w, h) {
    var s = w / W;
    c.save(); c.scale(s, s);
    c.fillStyle = theme.floor || "#f5f7f4"; c.fillRect(0, 0, W, H);
    c.strokeStyle = theme.grid || "#dbe2de"; c.lineWidth = 1.5; c.beginPath();
    for (var gx = 50; gx < W; gx += 50) { c.moveTo(gx, 0); c.lineTo(gx, H); }
    for (var gy = 50; gy < H; gy += 50) { c.moveTo(0, gy); c.lineTo(W, gy); }
    c.stroke();
    c.strokeStyle = theme.wall; c.lineWidth = 3; c.beginPath(); c.moveTo(W / 2, 0); c.lineTo(W / 2, H); c.stroke();
    c.beginPath(); c.arc(W / 2, H / 2, W * 0.15, 0, Math.PI * 2); c.stroke();
    c.lineWidth = 10; c.strokeRect(0, 0, W, H);
    c.restore();
  } });
  if (typeof WWIT_BADGE_SRC !== "undefined") list.push({ name: "WWIT MMA badge", info: "On the stadium mat, apron and jumbotron.", w: 220, h: 220, draw: imageAsset(WWIT_BADGE_SRC) });
  list.push({ name: "Fans", info: "The crowd, drawn in the fighter style: red and blue corner fans, caps, hoodies and the odd shirtless superfan.", w: 220, h: 220, draw: function (c, w, h) {
    var picks = [];
    for (var i = 0; i < stadiumFans.length && picks.length < 9; i += 7) if (!stadiumFans[i].sign) picks.push(stadiumFans[i]);
    picks.forEach(function (f, j) {
      var r = w / 7.4, x = (j % 3 + 0.5) * (w / 3), y = (Math.floor(j / 3) + 0.5) * (h / 3);
      c.save(); c.translate(x, y); drawFanBall(c, r, f); c.restore();
    });
  } });
  list.push({ name: "Referee", info: "Works the cage when Ciryl Gane fights, waves off knockouts and taps, and falls asleep for Cheater mode.", w: 220, h: 220, draw: function (c, w, h) {
    c.save(); c.translate(w / 2, h / 2); drawFanBall(c, w * 0.3, refereeLook()); c.restore();
  } });
  if (typeof HERB_LOOK !== "undefined") list.push({ name: "Blind Herb Dean", info: "Barges in with his white cane during Ciryl Gane's Herb Dean special.", w: 220, h: 220, draw: function (c, w, h) {
    drawFighterArt(c, w * 0.45, h * 0.54, w * 0.3, HERB_LOOK, "#0b0f12", { layout: "contained", name: "herb dean", caneSwing: 0.2 });
  } });
  list.push({ name: "Folding chair", info: "Josh Hokit's Chair Shot.", w: 220, h: 220, draw: function (c, w, h) {
    withCtx(c, function () { drawFoldingChair(w / 2, h / 2, w * 0.6, 0, false, 1); });
  } });
  list.push({ name: "Bat", info: "Ciryl Gane's Cheater mode and Herb Dean special.", w: 220, h: 220, draw: function (c, w, h) {
    withCtx(c, function () { drawBat(w * 0.16, h * 0.78, -Math.PI / 4, w * 0.82); });
  } });
  if (typeof CHEATER_OBJECTS !== "undefined") list.push({ name: "Thrown objects", info: "What Gane throws in Cheater mode: " + CHEATER_OBJECTS.map(function (o) { return o.name.toLowerCase() + " (" + o.damage + ")"; }).join(", ") + ". Placeholders for now.", w: 220, h: 220, draw: function (c, w, h) {
    withCtx(c, function () {
      CHEATER_OBJECTS.forEach(function (o, i) { drawCheaterObject(o.shape, (i + 0.5) * (w / CHEATER_OBJECTS.length), h / 2, w * 0.13, 0); });
    });
  } });
  if (typeof AA_TRUCK_SRC !== "undefined") list.push({ name: "Semi truck", info: "Runs them over in Justin Gaethje's All American.", w: 320, h: 160, draw: imageAsset(AA_TRUCK_SRC) });
  if (typeof AA_EAGLE_SRC !== "undefined") list.push({ name: "Bald eagle", info: "Four of them dive in Justin Gaethje's All American.", w: 220, h: 220, draw: imageAsset(AA_EAGLE_SRC) });
  if (typeof drawAaFlag === "function") list.push({ name: "American flag", info: "Gaethje waves it from the shoulder of the highway.", w: 220, h: 220, draw: function (c, w, h) {
    withCtx(c, function () { drawAaFlag(w * 0.2, h * 0.25, w * 0.62, h * 0.38, 0.6, 0); });
  } });
  list.push({ name: "Brazil flag", info: "Waved by the crowd during Do Bronx.", w: 220, h: 220, draw: function (c, w, h) {
    withCtx(c, function () { drawBrazilFlag(w * 0.5, h * 0.55, w * 0.55, 0, 0); });
  } });
  return list;
}

// ---------------------------------------------------------------- sounds

// clip: a recorded clip from SOUND_CLIPS. play: a sound made in code.
function gallerySounds() {
  function clip(name, label, info, gain) { return { clip: name, label: label, info: info, gain: gain || 0.85 }; }
  function synth(label, info, fn) { return { play: fn, label: label, info: info }; }
  var groups = [
    { title: "Announcer and crowd", items: [
      clip("hereWeGo", "Here we go!", "Opens every fight."),
      clip("crowd", "Crowd", "Loops under every fight, swelling on big moments.", 0.6),
      clip("knockout", "Knockout call", "Every win that isn't a submission."),
      clip("cameraFlash", "Camera flash", "Every camera flash (Do Bronx, All American)."),
      clip("usaChant", "U-S-A! chant", "When the truck hits in All American.")
    ] },
    { title: "Fighter lines", items: [
      clip("igbb", "It's gonna be bad", "Dustin Poirier's IGBB."),
      clip("smashYourBoy", "I'm gonna smash your boy", "Khabib's Father's Plan ground and pound."),
      clip("doBronx", "Charrrles... Do Bronx!", "Charles Oliveira's Do Bronx."),
      clip("saiyanUp", "Aura power-up", "Charles's Super Saiyan aura bursting on."),
      clip("saiyanLoop", "Super Saiyan aura", "Joe's aura hum, looping while Charles is blond."),
      clip("saiyanDown", "Aura power-down", "The aura dying away."),
      clip("kameCharge", "Kamehameha charge", "Charles charging the Kamehameha."),
      clip("kameFire", "Kamehameha fire", "The Kamehameha blast."),
      clip("hokitKnee", "Break him over my knee", "Josh Hokit's thumbs down (one of 5)."),
      clip("hokitDog", "Like my dog", "Josh Hokit's thumbs down."),
      clip("hokitDivision", "Incredible Hok division", "Josh Hokit's thumbs down."),
      clip("hokitWeights", "Weight classes", "Josh Hokit's thumbs down."),
      clip("hokitPlan", "Man with a plan", "Josh Hokit's thumbs down."),
      clip("ganePokeCall", "Eye poke line", "Ciryl Gane's first landed eye poke."),
      clip("ganeBatCall", "Bat line", "Ciryl Gane's first landed bat shot."),
      clip("ganeHerbDean", "Herb Dean line", "Ciryl Gane's Herb Dean special."),
      clip("gaethjeCommentary", "Gaethje commentary", "Once a fight when Justin Gaethje's in it.")
    ] },
    { title: "Special move sounds", items: [
      clip("chairShot", "Chair shot clang", "Josh Hokit's Chair Shot."),
      clip("freeBird", "Free Bird solo", "Justin Gaethje's All American."),
      clip("eagleScreech", "Eagle screech", "Each eagle dive in All American, and the warning for Gaethje's Eagle Strike."),
      clip("eagleSwoop", "Eagle swoop", "The eagle swooping through in Gaethje's Eagle Strike."),
      clip("truckeesAd", "Truck-ee's ad", "The jumbotron ad when Gaethje lands from the eagle in golf mode.", 0.8),
      clip("truckHorn", "Truck horn", "The semi coming in All American."),
      synth("Truck impact", "The semi hitting.", function () { playTruckImpact(); }),
      synth("Golf club whack", "Gaethje's golf club landing in golf mode.", function () { lastPunchSound = 0; playClubHit(); }),
      synth("Golf drive", "Gaethje teeing off in golf mode: one of nine recorded club-on-ball impacts at random.", function () { playGolfPing(); })
    ] },
    { title: "Hits and moves", items: [
      synth("Light punch", "Small punches (5 damage).", function () { lastPunchSound = 0; playPunch(5); }),
      synth("Heavy punch", "Big punches (25+ damage).", function () { lastPunchSound = 0; playPunch(30); }),
      synth("BMF jab", "BMF and Josh Hokit's jabs (whoosh pop).", function () { playBmfJab(); }),
      synth("Critical weave flurry", "The BMF's critical weave combo.", function () {
        for (var i = 0; i < 5; i++) setTimeout(function (last) { playCritPunch(last); }.bind(null, i === 4), i * 160);
      }),
      synth("Haymaker", "Gaethje's haymaker (bone rattler).", function () { playHaymaker(); }),
      synth("Kick", "Kicks (leg kick slap).", function () { playKick(); }),
      synth("Wall slam", "Grapples and slams.", function () { playSlam(); }),
      synth("Whoosh", "Big moves starting up.", function () { playWhoosh(); }),
      synth("Bat hit", "Gane's bat landing.", function () { playBatHit(true); }),
      synth("Cane swish", "Herb Dean swinging his cane.", function () { playCaneSwish(); }),
      synth("Cane whack", "Herb Dean's cane landing.", function () { playCaneWhack(); }),
      synth("Bounce", "Fighters bouncing off the walls.", function () { lastBounceSound = 0; playBounce(); }),
      synth("CTE Rejuvenation", "The CTE base forgetting damage.", function () { playForget(); })
    ] }
  ];
  // Anything new in SOUND_CLIPS that isn't listed above still shows up.
  var listed = {};
  groups.forEach(function (g) { g.items.forEach(function (it) { if (it.clip) listed[it.clip] = true; }); });
  groups.forEach(function (g) { g.items = g.items.filter(function (it) { return !it.clip || SOUND_CLIPS[it.clip]; }); });
  var extra = Object.keys(SOUND_CLIPS).filter(function (k) { return !listed[k]; });
  if (extra.length) groups.push({ title: "Other clips", items: extra.map(function (k) { return clip(k, k, ""); }) });
  return groups;
}

var galleryPlaying = null; // { src, btn }
function stopGallerySound() {
  var p = galleryPlaying;
  galleryPlaying = null;
  if (!p) return;
  try { p.src.onended = null; p.src.stop(); } catch (e) {}
  p.btn.classList.remove("playing");
  p.btn.textContent = "▶";
}
function playGallerySound(item, btn) {
  var ac = getAudioCtx();
  if (!ac) return;
  if (ac.state === "suspended") ac.resume();
  var wasThis = galleryPlaying && galleryPlaying.btn === btn;
  stopGallerySound();
  if (wasThis) return; // tapping a playing clip stops it
  if (item.play) { try { item.play(); } catch (e) {} return; }
  withClip(item.clip, function () {
    var src = playClip(item.clip, item.gain);
    if (!src) return;
    stopGallerySound();
    galleryPlaying = { src: src, btn: btn };
    btn.classList.add("playing");
    btn.textContent = "■";
    src.onended = function () { if (galleryPlaying && galleryPlaying.src === src) stopGallerySound(); };
  });
}

// ---------------------------------------------------------------- rendering

function renderGallery() {
  Array.prototype.forEach.call(document.querySelectorAll("#galleryTabs button"), function (b) {
    var on = b.dataset.tab === galleryTab;
    b.setAttribute("aria-selected", on ? "true" : "false");
    b.classList.toggle("secondary", !on);
  });
  var body = document.getElementById("galleryBody");
  body.innerHTML = "";
  readTheme();
  if (galleryTab === "fighters") renderGalleryFighters(body);
  else if (galleryTab === "assets") renderGalleryAssets(body);
  else renderGallerySounds(body);
}

function el(tag, cls, text) {
  var e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text != null) e.textContent = text;
  return e;
}

function renderGalleryFighters(body) {
  var list = galleryFighters();
  if (!list.length) { body.appendChild(el("p", "emptyNote", "No roster fighters yet.")); return; }
  list.forEach(function (ch) {
    var card = el("article", "gCard gFighter");
    card.style.setProperty("--fc", ch.color);
    var top = el("div", "gTop");
    var skin = makeCanvas(150, 150);
    skin.el.className = "gSkin";
    drawSkin(skin.c, ch, 150);
    top.appendChild(skin.el);
    var head = el("div", "gHead");
    head.appendChild(el("h3", null, ch.name));
    var nick = /^"([^"]+)"/.exec(ch.bio || "");
    if (nick) head.appendChild(el("div", "gNick", "“" + nick[1] + "”"));
    head.appendChild(el("div", "gMeta", (ch.base || "Custom") + " base · " + weightClassName(ch)));
    if (ch.look) {
      var sw = el("div", "gSwatches");
      [["Skin", ch.look.skin], ["Shorts", ch.look.shorts], ["Trim", ch.look.trim], ["Gloves", ch.look.gloves], ["Colour", ch.color]].forEach(function (s) {
        if (!s[1]) return;
        var d = el("span", "gSwatch");
        d.style.background = s[1];
        d.title = s[0] + " " + s[1];
        sw.appendChild(d);
      });
      head.appendChild(sw);
    }
    top.appendChild(head);
    card.appendChild(top);

    if (ch.bio) card.appendChild(el("p", "gBio", ch.bio.replace(/^"[^"]+"\.\s*/, "")));

    var sp = specialInfo(ch);
    if (sp) {
      var sbox = el("div", "gSpecial");
      sbox.appendChild(el("div", "gLabel", "⭐ Special move"));
      sbox.appendChild(el("h4", null, sp.name));
      sbox.appendChild(el("p", null, sp.info));
      sbox.appendChild(el("p", "gCharge", sp.charge));
      card.appendChild(sbox);
    }

    var moves = galleryMoves(ch);
    if (moves.length) {
      card.appendChild(el("div", "gLabel", "Moves"));
      var ul = el("ul", "gMoves");
      moves.forEach(function (mv) {
        var li = el("li");
        li.appendChild(el("span", "gIcon", mv.icon));
        var tx = el("div");
        tx.appendChild(el("strong", null, mv.name));
        tx.appendChild(el("span", null, " " + mv.info));
        li.appendChild(tx);
        ul.appendChild(li);
      });
      card.appendChild(ul);
    }

    // Demo controls: pick a sparring partner, then watch.
    var demo = el("div", "gDemo");
    var lab = el("label", "gVs");
    lab.appendChild(el("span", null, "vs"));
    var sel = document.createElement("select");
    var others = list.filter(function (o) { return o.id !== ch.id; }).concat(builtins);
    others.forEach(function (o) {
      var opt = document.createElement("option");
      opt.value = o.id; opt.textContent = o.name;
      sel.appendChild(opt);
    });
    lab.appendChild(sel);
    demo.appendChild(lab);
    function opponent() {
      var id = sel.value;
      return others.filter(function (o) { return o.id === id; })[0] || others[0];
    }
    if (sp) {
      var sb = el("button", "small", "▶ " + sp.name + " demo");
      sb.type = "button";
      sb.addEventListener("click", function () { startGalleryDemo("special", ch, opponent()); });
      demo.appendChild(sb);
    }
    var fb = el("button", "small secondary", "▶ Fight demo");
    fb.type = "button";
    fb.addEventListener("click", function () { startGalleryDemo("fight", ch, opponent()); });
    demo.appendChild(fb);
    card.appendChild(demo);
    body.appendChild(card);
  });
}

function renderGalleryAssets(body) {
  var grid = el("div", "gAssets");
  galleryAssets().forEach(function (a) {
    var card = el("figure", "gCard gAsset");
    var cv = makeCanvas(a.w, a.h, a.w > 250 ? 2 : null);
    cv.el.className = "gArt";
    try { a.draw(cv.c, a.w, a.h); } catch (e) { /* skip a picture that can't draw */ }
    card.appendChild(cv.el);
    var cap = el("figcaption");
    cap.appendChild(el("strong", null, a.name));
    cap.appendChild(el("span", null, a.info));
    card.appendChild(cap);
    if (a.h > a.w) card.classList.add("tall");
    grid.appendChild(card);
  });
  body.appendChild(grid);
}

function renderGallerySounds(body) {
  gallerySounds().forEach(function (g) {
    body.appendChild(el("h3", "gGroup", g.title));
    var ul = el("ul", "gSounds");
    g.items.forEach(function (it) {
      var li = el("li", "gCard");
      var btn = el("button", "gPlay", "▶");
      btn.type = "button";
      btn.setAttribute("aria-label", "Play " + it.label);
      btn.addEventListener("click", function () { playGallerySound(it, btn); });
      li.appendChild(btn);
      var tx = el("div");
      tx.appendChild(el("strong", null, it.label));
      if (it.info) tx.appendChild(el("span", null, it.info));
      li.appendChild(tx);
      li.appendChild(el("span", "gKind", it.clip ? "clip" : "made in code"));
      ul.appendChild(li);
    });
    body.appendChild(ul);
  });
}

// ---------------------------------------------------------------- demos

// A special demo starts the fight with the special fully charged, so it goes
// off within a second or two. A fight demo is a normal fight.
function startGalleryDemo(kind, a, b) {
  stopGallerySound();
  galleryDemo = { kind: kind, a: a, b: b };
  setGamePaused(false);
  var ac = getAudioCtx();
  if (ac && ac.state === "suspended") ac.resume();
  startMatchWith(a, b);
  document.getElementById("screenGame").classList.add("demo");
  document.getElementById("demoTitle").textContent = kind === "special" ? specialName(a) + " demo" : a.name + " vs " + b.name;
  start();
  if (kind === "special") balls[0].specialT = a.special.chargeTime;
}

function endGalleryDemo() {
  setGamePaused(false);
  galleryDemo = null;
  document.getElementById("screenGame").classList.remove("demo");
}

document.getElementById("galleryBtn").addEventListener("click", function () { showScreen("gallery"); });
document.getElementById("galleryBackBtn").addEventListener("click", function () { showScreen("select"); });
Array.prototype.forEach.call(document.querySelectorAll("#galleryTabs button"), function (b) {
  b.addEventListener("click", function () {
    stopGallerySound();
    galleryTab = b.dataset.tab;
    renderGallery();
  });
});
document.getElementById("demoPause").addEventListener("click", function () { setGamePaused(!gamePaused); });
document.getElementById("demoAgain").addEventListener("click", function () {
  if (galleryDemo) startGalleryDemo(galleryDemo.kind, galleryDemo.a, galleryDemo.b);
});
document.getElementById("demoBack").addEventListener("click", function () { showScreen("gallery"); });
// Tapping the arena pauses and unpauses a demo too.
canvas.addEventListener("click", function () { if (galleryDemo && started && !over) setGamePaused(!gamePaused); });
