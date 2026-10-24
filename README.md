# Ball Brawl

A browser game where two balls fight in a square arena. Build fighters in the character editor, pick two from your roster, and watch them brawl.

## Play it

Open `index.html` in a browser. No install or build step is needed.

For a single self-contained file (handy for sharing or pasting into a Claude artifact), use `dist/ball-brawl.html`.

## Menus

- **Roster** (the main screen) holds the custom fighters you've built and saved. Roster fighters will later get their own textures, audio and special moves on top of the character bases.
- **The Dev Corner** (button at the top of the main screen) is where the character bases can be put into battle, against each other or against roster fighters. Every card there has a **Mirror** button that puts that fighter on both sides; the second copy is named "<name> 2" and drawn in a lighter or darker shade. Its **Dev Fighters** section holds older versions of roster fighters for testing (e.g. Dustin Poirier with his face photo, from before his fighter art), and test versions of roster fighters trying out a new mechanic before the real one gets it (e.g. Dustin Poirier (guillotine)). An old copy of a repo fighter saved under another id without fighter art is removed from the roster automatically. The **Always KO Rush** switch makes every Brawler open each Dev Corner fight with the KO Rush (100% instead of 5%).

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
| Dustin Poirier (fighter art) | Brawler | 22-damage punches every 0.95s (faster, higher-volume hands than the Brawler), 42 reach, 15% block, 5% opening KO Rush, special move IGBB |
| Khabib Nurmagomedov (fighter art) | Grappler | The Grappler's grab and wall slam, plus quick 5-damage punches every 0.7s that charge his special extra fast, 10% block, special move Father's Plan |

## Fighter art

A roster fighter with a `"look"` in its character file is drawn as a muscled ball in its fight kit instead of a flat colour or face photo: the top third of the ball is the head (hair, ears, beard, no face), the middle is the torso, the bottom is the shorts. Arms and legs are drawn in the fighter's skin tone and fists in its glove colour. The fighter's `color` still drives the health bar, sparks and damage numbers. Drawing lives in `js/game/fighter-art.js`.

| Look field | Values |
|---|---|
| `skin`, `hairColor`, `shorts`, `trim`, `gloves` | hex colours |
| `build` | `muscular`, `lean`, `stocky` |
| `hair` | `bald`, `buzz`, `short`, `long`, `mohawk`, `dreads` |
| `beard` | `none`, `stubble`, `full` |
| `ears` | `normal`, `cauliflower` |
| `bodyHair` | `none`, `light`, `heavy` |
| `shortsStyle` | `plain`, `stripe`, `split`, `print` |
| `tattoos` | any of `chest`, `script`, `claws`, `leftArm`, `rightArm`, `ribs`, `color` set to true |

## Submissions

BJJ submissions are switched on per fighter in its character file. So far there's one:

| Submission | What it does |
|---|---|
| Guillotine | When a Grappler shoots for a grab, `chance`% of the time (35 by default) the defender catches its head in a guillotine instead. The two lock up and a tug-of-war bar over them swings between the choke (defender's colour) and the escape (shooter's colour), for about 3 to 4 seconds, while the shooter's face goes red. The shooter taps `tapBase`% of the time at full health (20), plus up to `tapLowHp`% more (60) the more damage it's taken: three pats and the fight is over, a win by submission. Otherwise they scramble apart, and the defender can't throw another guillotine for `cooldown` seconds (5). Set with `"hasGuillotine": true` and a `"guillotine"` block. Only the Dev Corner's Dustin Poirier (guillotine) has it for now. |

## Special moves (created characters)

Roster fighters can have a special move, set in the editor's **Special move** section. It has a charge bar under the fighter's health (like CTE Rejuvenation) that fills over time and fills faster with every clean hit the fighter lands. When it's full the move goes off.

| Special | What it does |
|---|---|
| IGBB | Charges in 45 seconds; each clean hit takes 5 seconds off. Grabs the opponent with one hand and throws them into a corner, then unloads a flurry of 7 fast 10-damage punches (hooks and straights, in quick bursts, the last one a big hook) while they shell up (5 seconds at most; the flurry takes about 2). Every punch caves them into the corner with a shockwave, sparks and a freeze-frame. If they survive, backs away with the guard up, blocking everything. Dustin has it switched on. |
| Father's Plan | Charges in 40 seconds; each clean hit takes 4 seconds off, each punch 7. Grabs the opponent and hurls them off 4 walls in a row (6 damage each), then slams them down onto the floor (12) and kneels over them for 5 brutal ground-and-pound punches (12 each). Each punch is telegraphed: the fist cocks high over his head and trembles while a red target ring closes in on them, then it hammers straight down. The fifth winds up longer, with a glowing fist, and hits hardest. Every impact shakes the screen with a shockwave, sparks and a freeze-frame. If they survive, lets them up and backs off. Khabib has it switched on. Settings in the character file: `walls`, `wallDamage`, `slamDamage`, `punches`, `damage`, and `punchCut` (charge taken off per punch; other hits use `hitCut`). |

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
