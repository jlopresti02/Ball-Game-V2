# Ball Brawl

A browser game where two balls fight in a square arena. Build fighters in the character editor, pick two from your roster, and watch them brawl.

## Play it

Open `index.html` in a browser. No install or build step is needed.

For a single self-contained file (handy for sharing or pasting into a Claude artifact), use `dist/ball-brawl.html`.

## Menus

- **Roster** (the main screen) holds the custom fighters you've built and saved. Roster fighters will later get their own textures, audio and special moves on top of the character bases.
- **The Dev Corner** (button at the top of the main screen) is where the character bases can be put into battle, against each other or against roster fighters. Every card there has a **Mirror** button that puts that fighter on both sides; the second copy is named "<name> 2" and drawn in a lighter or darker shade. Its **Dev Fighters** section holds older versions of roster fighters for testing (e.g. Dustin Poirier with his face photo, from before his fighter art), and can hold test versions of roster fighters trying out a new mechanic before the real one gets it (`devVariant` in `js/dev-fighters.js`). An old copy of a repo fighter saved under another id without fighter art is removed from the roster automatically. The **Always KO Rush** switch makes every Brawler open each Dev Corner fight with the KO Rush (100% instead of 5%). The **Referee** switch puts the referee in every Dev Corner fight. The **Weight class** picker puts both fighters in one weight class for Dev Corner fights ("Their own" leaves them as they are).

## Arenas

The buttons under the arena hide once a fight starts, so a screen recording only shows the fight. After a win, tap the result to open a menu with **Rematch**, **Change fighters** and **Arena**.

The **Arena** button under the fight switches between two arenas, and the game remembers the choice on each device:

The crowd (its sound, and the fans in the WWIT stadium) has a mood: big moments raise it, it takes about a second to build up to fully excited, stays up for 3 seconds after the last big moment (a hit of 12.5 damage or more, or a slam), then takes about 4 seconds to die back down. Little jabs only nudge it. The settings are `CROWD_RISE`, `CROWD_KEEP`, `CROWD_FADE` and `CROWD_BIG` in `js/audio.js`.

- **Test**: the plain square arena with the health bars above it.
- **WWIT stadium**: a 9:16 frame for reels. The cage sits in the middle on a WWIT MMA branded mat, with stands of cheering fans (drawn in the fighter art style) around it. A jumbotron above the cage replaces the health bars and shows the clock, each fighter's health and special meter, and live strikes landed, damage dealt and takedowns. The cage and jumbotron stay out of the areas Reels and TikTok cover with their own buttons and captions.

## Referee

When Ciryl Gane (`c-ciryl-gane`) is in a fight, or the fighter has `"hasReferee": true`, a referee works inside the cage. He's a ball in a black REF shirt, drawn under the fighters and see-through to the fight (nothing hits him or bumps into him). He keeps to whichever corner or edge spot is furthest from both fighters, steps back from anyone who gets close, and when a fighter is knocked out or taps he runs in over them and waves it off ("STOP!"). The logic is in `js/game/referee.js`.

## Character Bases

| Base | Attack |
| --- | --- |
| Gunner | Throws projectiles from range |
| Brawler | Close-range punch, 10% block chance. 5% chance to open the fight with a **KO Rush**: sprints at the opponent with a big hook cocked back (the opponent is shocked, shown by a "!", backs away slowly and can't attack until the punch is thrown) and throws one sweeping hook that knocks them out if it isn't weaved, blocked or countered. After a knockout the Brawler gets a few quick little follow-up hooks in on the slumped opponent, then celebrates with its hands up before the win is called. If both fighters KO Rush at once they **Slugfest**: 5 seconds of trading big looping 10-30 damage hooks in the middle, then whoever took less damage winds up a 10-damage punch that sends the other into the wall behind them and finishes them with the knockout punch |
| Kicker | Sweeping kick with long reach and long recovery. When kicked by another kicker it has a 25% chance to check the kick (no damage) and kick right back |
| Grappler | Grabs on contact and slams the opponent into the nearest wall; can counter-grab. A grab that gets weaved or blocked is an **escape**: no slam, and the two push apart. After landing a slam the Grappler can't be hit by anything for 0.8 seconds. If a grab would be the knockout, it becomes a finisher: a 20-damage slam into the bottom wall, then the opponent is pinned and hit with three 10-damage punches. Grappler vs Grappler: if both can grab at once, the one coming from the side or behind wins; face to face, the faster one, then the one with more health, then a coin flip. After a slam it presses the other into the wall and disengages unharmed ("Iowa Style"); the slammed Grappler can't grab it back for 1.5 seconds, so there are no back-to-back wall slams. A Grappler being grabbed has a 30% chance to Sprawl (stuff the grab and tie up); after a moment either one comes out with a Reattack slam (50/50) |
| Power Puncher | Charges up, then spins into a 30-damage haymaker that sends the opponent pinballing into 4 walls for 5 damage each |
| Sees Red | Charges at the opponent throwing a flurry of jabs, but takes extra damage while winding up |
| Watcher | Sits in a corner seat (invincible), charges, then fires tracking lasers |
| CTE | Telegraphed 25-damage sweeping hooks, alternating left and right, at anyone nearby with no cooldown between them. The aim is a guess, so hooks can whiff on spacing, and the arm hangs across his body after each one. Opponents block his swings twice as often and weave them 1.15x as often. Every 7 seconds he forgets some damage and regains 12 health (CTE Rejuvenation), with a bar under his health that fills up toward the next heal |
| BMF | Rapid 5-damage jabs up close; weaves (dodges) 75% of attacks, and 20% of weaves are critical: a 5-punch chase combo ending in a launching blow, then a 2-second hands-in-the-air celebration during which it takes double damage. Against another weaver (e.g. BMF vs BMF), a critical weave in the middle of the other's combo is a reversal (75%) or a flow counter (25%): it slips the rest of the combo, then lands one 15-damage strike that knocks them away and celebrates. Combos don't end in a celebration in those fights |

Roster fighters can mix any of these abilities, with sliders for every stat. They're saved in the browser's local storage.

## Weight classes

Every fighter has a `weightClass` (Middleweight if it hasn't got one). Middleweight is the baseline. The logic is in `js/game/weight.js`.

| Class | lb | Size | Move speed | Attack speed | Block |
| --- | --- | --- | --- | --- | --- |
| Strawweight | 115 | 31 px | 1.27x | 13% faster | +0% |
| Flyweight | 125 | 32 px | 1.22x | 10% faster | +1% |
| Bantamweight | 135 | 33 px | 1.17x | 8% faster | +2% |
| Featherweight | 145 | 35 px | 1.13x | 6% faster | +3% |
| Lightweight | 155 | 36 px | 1.09x | 5% faster | +4% |
| Welterweight | 170 | 37 px | 1.04x | 2% faster | +5% |
| Middleweight | 185 | 39 px | 1x | baseline | +6% |
| Light Heavyweight | 205 | 41 px | 0.95x | 3% slower | +7% |
| Heavyweight | 265 | 47 px | 0.84x | 9% slower | +8% |

Size is sqrt(lb / 185); move speed is the inverse; attack cooldowns (projectile, punch, kick, grab) tick at 1 / size^0.25. For each class between the two fighters: the lighter one takes +6% damage from the heavier one, the heavier one takes -5% from the lighter one, the lighter one slips 4% of the heavier one's strikes ("WHIFF"), and the heavier one wins grappling exchanges (who grabs first, sprawls, sprawl scrambles, grab escapes) 50% + 5% of the time, up to 85%. Dustin Poirier, Charles Oliveira and Khabib Nurmagomedov are Lightweights.

## Saving your fighters

Every fighter you build in the character creator is saved as soon as you tap **Save character**:

- **In this browser**, always (GitHub Pages and the claude.ai artifact).
- **In the cloud roster**, when you play the claude.ai artifact version. This copy survives cleared browser data and new versions of the game, works on any device signed in to claude.ai, and Claude can read it to build on your fighters. Fighters already saved in the browser are copied up the first time the artifact opens.
- **In the repo** (`js/roster-data.js`): Claude copies fighters from the cloud roster into the repo so the GitHub Pages version has them too.

The line under the Roster heading shows where your fighters are saved. **Export** downloads the whole roster as a file (and copies it), and **Import** loads one back in, e.g. to move fighters from GitHub Pages into the artifact or to send them to Claude.

## Roster fighters in the repo

Each saved roster fighter has a character file in `characters/` (one JSON file per fighter, with a short bio and the base it was built from). `python3 tools/build_roster.py` turns those files into `js/roster-data.js`, which every version of the game loads. Raising a file's `"rev"` pushes the change out to copies already saved in browsers and the cloud roster.

| Fighter | Base | Build |
|---|---|---|
| Dustin Poirier (fighter art) | Brawler | 22-damage punches every 0.95s (faster, higher-volume hands than the Brawler), 42 reach, 15% block, 5% opening KO Rush, special move IGBB, and the guillotine off a shot |
| Charles Oliveira (fighter art) | Grappler | The Grappler's grab and wall slam (but against another Grappler he only shoots for it half the time on contact), Khabib's quick 5-damage punches every 0.7s, 10% block, and the guard (25%) with the BJJ artist submissions (rear naked choke or armbar), special move Do Bronx |
| Josh Hokit (fighter art) | BMF | The BMF's rapid 5-damage jabs and 75% weave, the armbar shot (5%, and he always lets them go) and the thumbs down taunt. Unlike the BMF he can still weave 50% of attacks while celebrating (`weave.tauntDodge`), and his thumbs down is covered by his normal 75% weave. Special move Chair Shot. Heavyweight |
| Ciryl Gane (fighter art) | Kicker | The Kicker's long 40-damage kicks (25% chance to be checked) on a longer 4.5s cooldown, plus a steady 12-damage punch up close (1.1s cooldown, 35 reach). He throws one or the other, never both at once. That's his Fighter mode; when the referee falls asleep he switches to Cheater mode (below). No special move yet. Heavyweight |
| Khabib Nurmagomedov (fighter art) | Grappler | The Grappler's grab and wall slam, plus quick 5-damage punches every 0.7s that charge his special extra fast, a back suplex on 60% of his grabs from behind, 10% block, special move Father's Plan |

## Fighter art

A roster fighter with a `"look"` in its character file is drawn as a muscled ball in its fight kit instead of a flat colour or face photo: the top third of the ball is the head (hair, ears, beard, no face), the middle is the torso, the bottom is the shorts. Arms and legs are drawn in the fighter's skin tone and fists in its glove colour. The fighter's `color` still drives the health bar, sparks and damage numbers. Drawing lives in `js/game/fighter-art.js`.

| Look field | Values |
|---|---|
| `skin`, `hairColor`, `shorts`, `trim`, `gloves` | hex colours (`accent`: optional stripe colour for `pinstripe` shorts) |
| `build` | `muscular`, `lean`, `stocky` |
| `hair` | `bald`, `stubble`, `buzz`, `crop` (faded sides, top swept back and across from a part on the right over a high, straight hairline), `twists`, `short`, `long`, `mohawk`, `dreads` |
| `hairPuff` | `true` puts big twisted hair as a second circle behind the top of the ball (contained layout) |
| `cane` | `true` gives a white cane with a red tip at the right side (contained layout); pass `opts.caneSwing` (radians) to sweep it |
| `beard` | `none`, `stubble`, `short`, `chinstrap`, `full` |
| `ears` | `normal`, `cauliflower` |
| `bodyHair` | `none`, `light`, `heavy` |
| `shortsStyle` | `plain`, `stripe`, `split`, `print`, `chevron` (diagonal panel up one leg), `pinstripe` (thin stripes down both legs), `slash` (jagged streaks in the trim colour), `usa` (stars-and-stripes panel on one leg, white star on the waistband) |
| `headwear` | optional: `bandana` (stars-and-stripes bandana over the head) |
| `glasses` | optional: `shades` (dark sunglasses) |
| `outfit` | optional: `polo` (collared shirt over the torso, for a referee; `shirt` colour, optional `badge` colour for a chest badge) |
| `tattoos` | any of `chest`, `portraits`, `lionCrown` (crowned lion's head mid-chest), `medallion` (sun medallion on the sternum), `eyes` (pair of staring eyes low on the left side, above the waistband), `script`, `claws`, `leftArm`, `rightArm`, `ribs`, `color` set to true; `leftArm`/`rightArm` can also be `"dense"` (near-solid sleeve, dark emblem on the delt), `"lion"` (lion head on the delt, patchy ink) or `"sun"` (sunburst on the delt, script down the arm); `ribs` can be `"left"` to put the script on the other side; `armInk` gives the punching arms an inked texture |

## Submissions

BJJ submissions are switched on per fighter in its character file. So far there's one:

| Submission | What it does |
|---|---|
| Guillotine | When a Grappler shoots for a grab, `chance`% of the time (35 by default) the defender catches its head in a guillotine instead. The two lock up and a tug-of-war bar over them swings between the choke (defender's colour) and the escape (shooter's colour), for about 3 to 4 seconds, while the shooter (bent over sideways off its shot, head driven in under the defender, who leans back with an arm locked over its neck) goes red. The shooter taps `tapBase`% of the time at full health (10), plus up to `tapLowHp`% more (60) the more damage it's taken: three pats and the fight is over, a win by submission. If it doesn't finish, `outcomes` picks what happens (relative odds; at full health that's tap 10%, escape 26%, gnp 56%, resink 4%, slam 4%): **escape** (26) they spin apart on an angle; **gnp** (56) the shooter pops its head out, drives the defender down to the floor and finishes its shot with 4 ground-and-pound punches adding up to the shot's own damage; **resink** (4) the defender sinks it back in for another go at the tap; **slam** (4) the shooter, still caught in the hold, stands up with the defender hanging off its neck, carries it up over the top and slams it down on the other side for `slamDamage` (75). After it's let go, the defender can't throw another guillotine for `cooldown` seconds (5). Set with `"hasGuillotine": true` and a `"guillotine"` block. It's the striker submission set, given only to certain strikers. Dustin Poirier has it. |
| Rear naked choke | Part of the **BJJ artist** submission set (`"bjj"`): a guard submission, put `"rnc"` (or the whole set) in a guard's `subs`. The guard player scrambles round to their back: it climbs on behind them, its head peeking over one shoulder, hooks its legs round their waist and locks an arm under their chin (the other arm's forearm behind their head), while they grab at the choking arm with both hands. The same tug-of-war bar as the guillotine swings for about 2.5 to 3.5 seconds while their face goes red. They tap `tapBase`% of the time at full health (10), plus up to `tapLowHp`% more (50) the more damage they've taken: one hand lets go to pat the arm three times and it's a win by submission. Otherwise they turn in and the two pop apart on an angle. Set in an `"rnc"` block. The logic is in `js/game/rnc.js`. Charles Oliveira has it. |
| Armbar | Part of the **BJJ artist** submission set (`"bjj"`): a guard submission, put `"armbar"` (or the whole set) in a guard's `subs`. The guard player stays flat on its back, hugs the opponent's wrist to its chest, swings both legs up over them (curving round at the knee, one across the neck, one across the stomach), straightening the arm across its hips, with the elbow bending the wrong way as it's cranked. The same tug-of-war bar decides it. They tap `tapBase`% of the time at full health (10), plus up to `tapLowHp`% more (50) the more damage they've taken: their free hand pats the leg three times and it's a win by submission. Otherwise they rip the arm out and spin away. Set in an `"armbar"` block. The logic is in `js/game/armbar.js`. Charles Oliveira has it. |
| Suplex | When a fighter with it grabs an opponent that isn't facing it, `chance`% of the time (60) it throws a back suplex instead of its normal grab: it locks its arms round their waist, arches back and lifts them up over its own head, flipping them head first into the floor on the other side for `damage` (60), counted as a takedown. Then it can't suplex again for `cooldown` seconds (3). Set with `"hasSuplex": true` and a `"suplex"` block. The logic is in `js/game/suplex.js`. Khabib Nurmagomedov has it (and wrestlers will). |

### Guard

A fighter with `"hasGuard": true` can fall into guard when it's hit. Any punch, kick, swing, combo punch or projectile that lands on it has a `chance`% (25) to drop it onto its back, planted on the spot for `time` seconds (6) with a circle of `radius` (130) drawn around it and a ring that drains as the time runs out. Whoever hit it is pushed back out of the circle first (toward open floor if a wall is in the way), and has to stay out for half a second before stepping back in counts. The first time the opponent steps back into the circle it's a coin flip (`passChance`, 50): **guard passed**, the opponent gets on top for `passPunches` (4) free ground-and-pound punches of `passDamage` (10), or **caught**, the guard player goes for a submission picked at random from `subs`. The options are `"rnc"`, `"armbar"` and `"guillotine"`, or a whole submission set: `"bjj"` (the BJJ artist set: rear naked choke and armbar) or `"striker"` (the striker set: for now just the guillotine, which strikers normally get off a shot with `"hasGuillotine"`). Sets are listed in `SUB_SETS` in `js/game/guard.js`. If nobody steps in before the time is up it rolls back upright, the circle fading out, then pushes off away from the opponent and eases back to its normal speed. Once it's back on its feet it can't fall into guard again for `cooldown` seconds (3). The logic is in `js/game/guard.js`. Charles Oliveira has it.

A Grappler's `grapple.vsGrapplerChance` (100 by default) is how often it shoots for the grab on contact when the opponent is also a Grappler. Charles's is 50.

### Armbar shot and thumbs down

A fighter with `"hasArmbarShot": true` rolls once a second while it's touching the opponent: `armbarShot.chance`% (5) of the time it shoots a double leg. The shot always lands (no sprawl, weave or block): it drops its level, wraps both arms round their legs and drives them back, then goes straight into the armbar. Whether they tap is the fighter's own `"armbar"` odds; Josh Hokit has `tapBase` and `tapLowHp` at 0, so the one caught always escapes ("LETS IT GO"), and he goes straight into a thumbs down.

A fighter with `"hasThumbsDown": true` mocks the opponent every `thumbsDown.cooldown` seconds (8) when there's some space between them: it stops, sticks an arm out and pumps a thumbs down at them. It gets to them: for `anger` seconds (3) they glow red with an anger mark over their head and steer straight at it, 25% faster than normal. The logic for both is in `js/game/hokit.js`. Josh Hokit has them.

A fighter with `"hasCheater": true` cheats whenever the referee isn't looking (`js/game/cheater.js`). In its fights the ref falls asleep with cartoon Z's for `cheater.asleep` seconds (5) after every `cheater.awake` seconds (10) awake. While he sleeps, the fighter drops its normal attacks and picks one trick for the whole nap, each equally likely:
- **Eye pokes**: does `poke.damage`, and if it lands the opponent is stunned on the spot for a combo (`poke.combo`) they can't slip or block.
- **Throwing objects**: one every `throw.cooldown` seconds, picked at random from `CHEATER_OBJECTS` (placeholders for now: water bottle 8, shoe 10, stool 20).
- **A bat**: `bat.damage` (22) on a very fast `bat.cooldown` (0.25s).

While it's cheating, every normal takedown shot on it fails (not suplexes or special moves): whoever shot drives it back into the cage, and once it's up against it it grabs hold ("FENCE GRAB"), stands back up and gets away with no damage. When the ref wakes up it's back in Fighter mode. Ciryl Gane has it.

## Special moves (created characters)

Roster fighters can have a special move, set in the editor's **Special move** section. It has a charge bar under the fighter's health (like CTE Rejuvenation) that fills over time and fills faster with every clean hit the fighter lands. When it's full the move goes off.

| Special | What it does |
|---|---|
| IGBB | Charges in 45 seconds; each clean hit takes 5 seconds off. Grabs the opponent with one hand and throws them into a corner, then unloads a flurry of 7 fast 10-damage punches (hooks and straights, in quick bursts, the last one a big hook) while they shell up (5 seconds at most; the flurry takes about 2). Every punch caves them into the corner with a shockwave, sparks and a freeze-frame. If they survive, backs away with the guard up, blocking everything. Dustin has it switched on. |
| Father's Plan | Charges in 40 seconds; each clean hit takes 4 seconds off, each punch 7. Grabs the opponent and hurls them off 4 walls in a row (6 damage each), then slams them down onto the floor (12) and kneels over them for 5 brutal ground-and-pound punches (12 each). Each punch is telegraphed: the fist cocks high over his head and trembles while a red target ring closes in on them, then it hammers straight down. The fifth winds up longer, with a glowing fist, and hits hardest. Every impact shakes the screen with a shockwave, sparks and a freeze-frame. If they survive, lets them up and backs off. Khabib has it switched on. Settings in the character file: `walls`, `wallDamage`, `slamDamage`, `punches`, `damage`, and `punchCut` (charge taken off per punch; other hits use `hitCut`). |
| Do Bronx | Charges in 40 seconds; each clean hit takes 4 seconds off, each punch 5. Stops and hits a double-biceps pose that blasts the opponent away (no damage). The crowd's cameras all flash, whiting out the screen for a moment, and when it clears the arena is Brazil themed: in the WWIT stadium the fans switch to Brazil shirts, wave flags and signs ("DO BRONX!", "CHARLES!", "BRASIL!") and are all on their feet, the walkway turns green with DO BRONX / BRASIL on it, and the mat gets a faded Brazil flag (the test arena gets the flag too). For `duration` seconds (15, real time) every hit he lands does double damage, he always shoots for the takedown on contact (even against a Grappler) with 16 more grab reach, the opponent sprawls half as often, and every takedown goes straight into a submission attempt (one of his guard's `subs`). A green and gold ring pulses round him and his bar runs down. Then he poses again, the cameras flash, and everything goes back to normal. Charles Oliveira has it switched on. |
| Chair Shot | Charges in 40 seconds; each clean hit takes 3 seconds off, each punch 1. Reaches under the ring and comes up with a black folding chair, raises it overhead and charges the opponent down (he can be hit while charging; if he can't reach them in 3.5 seconds he throws the chair away and stays charged). When he gets there he swings it down across the top of their head for `damage` (40), which can't be weaved or blocked: CLANG, the chair bends, and they're left dazed on the spot with stars circling their head for `dazeTime` seconds (1.5). He recoils back off the impact still holding the chair, winds up with it cocked behind his head and hurls it as hard as he can over the cage into the nearest stand (the crowd pops when it lands), and runs a lap of the ring with both fists pumping for `celebrateTime` seconds (3), blocking everything, then gives them a thumbs down. The logic is in `js/game/chairshot.js`. Josh Hokit has it switched on. |

## Project layout

```
index.html              Page markup for every screen (roster, Dev Corner, editor, game)
css/styles.css          All styling, including light and dark themes
js/config.js            Arena size, physics constants, Watcher corner seats
js/audio.js             Synthesized wall-bounce sound
js/characters.js        Character bases, ability defaults, saving roster fighters
js/ui/select.js         Screen switching, the roster screen and The Dev Corner
js/ui/cropper.js        Photo cropper for the ball's appearance
js/ui/editor.js         Character editor
js/game/match.js        Match setup, damage, blocking, win check
js/game/physics.js      Movement, wall bounces, ball-vs-ball collisions
js/game/abilities.js    Logic for every attack
js/game/weave.js        Weave dodge, critical-weave combo and the celebration taunt
js/game/finisher.js     Grappler finisher: bottom-wall slam, pin and punches
js/game/grapple-duel.js Grappler vs Grappler: grab initiative, Iowa Style, Sprawl and Reattack
js/game/bjj.js          BJJ submissions: the guillotine off a shot
js/game/rnc.js          BJJ submissions: the rear naked choke off a back take
js/game/armbar.js       BJJ submissions: the armbar from the guard
js/game/suplex.js       the back suplex on grabs from behind
js/game/guard.js        Falling into guard: on its back, the circle, pass or get caught
js/game/hokit.js        Josh Hokit's armbar shot and thumbs down taunt
js/game/chairshot.js    Josh Hokit's special move, the folding chair shot
js/game/cheater.js      Ciryl Gane's Cheater mode while the referee sleeps
js/game/dobronx.js      Do Bronx: the pose, camera flashes, the Brazil arena and the 15-second boost
js/game/cte.js          CTE's wild swing and forget (heal) abilities
js/game/korush.js       Brawler's opening KO Rush and the Brawler vs Brawler Slugfest
js/game/special.js      Special moves for created characters (IGBB)
js/dev-fighters.js      Dev Corner-only fighters (older versions and test versions of roster fighters)
js/roster-store.js      Saving fighters: browser, cloud roster, repo; export/import
js/roster-data.js       Fighters saved into the repo (generated from characters/)
characters/             One character file per roster fighter
tools/build_roster.py   Builds js/roster-data.js from characters/
js/game/update.js       Per-frame update, HUD, canvas sizing
js/game/draw-attacks.js Drawing each attack's animation
js/game/fighter-art.js  Fighter art: muscled ball, head, tattoos, shorts, gloves
js/game/wwit-badge.js   The WWIT MMA badge image, inlined
js/game/stadium.js      WWIT stadium arena: stands, fans, cage, mat, jumbotron, fight stats
js/game/draw.js         Drawing the arena, fighters, projectiles, damage numbers
js/main.js              Game loop, button wiring, startup (loads last)
tools/build.py          Bundles everything into dist/ball-brawl.html
```

The scripts share one global scope and must load in the order listed in `index.html`.

## Adding a new ability

1. Add a `defaultX()` function and a `hasX` / `x` field to every character in `js/characters.js`, and to `normalizeChar` and `blankChar` so older saved characters keep working.
2. Add its editor block to `index.html` and wire its toggle and sliders in `js/ui/editor.js`.
3. Add its logic in `js/game/abilities.js` and its visuals in `js/game/draw-attacks.js`.
4. Add a line for it in `abilitySummary` in `js/ui/select.js`.

## Rebuilding the single-file version

```
python3 tools/build.py
```
