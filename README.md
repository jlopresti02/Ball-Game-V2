# Ball Brawl

A browser game where two balls fight in a square arena. Build fighters in the character editor, pick two from your roster, and watch them brawl.

## Play it

Open `index.html` in a browser. No install or build step is needed.

For a single self-contained file (handy for sharing or pasting into a Claude artifact), use `dist/ball-brawl.html`.

## Menus

- **Roster** (the main screen) holds the custom fighters you've built and saved. Roster fighters will later get their own textures, audio and special moves on top of the character bases.
- **The Dev Corner** (button at the top of the main screen) is where the character bases can be put into battle, against each other or against roster fighters.

## Character Bases

| Base | Attack |
| --- | --- |
| Gunner | Throws projectiles from range |
| Brawler | Close-range punch, 10% block chance |
| Kicker | Sweeping kick with long reach and long recovery |
| Grappler | Grabs on contact and slams the opponent into the nearest wall; can counter-grab |
| Power Puncher | Charges up, then spins into a 30-damage haymaker that sends the opponent pinballing into 4 walls for 5 damage each |
| Sees Red | Charges at the opponent throwing a flurry of jabs, but takes extra damage while winding up |
| Watcher | Sits in a corner seat (invincible), charges, then fires tracking lasers |
| BMF | Rapid 2-damage jabs up close; weaves (dodges) 50% of attacks, and 10% of weaves are critical: a 5-punch chase combo ending in a launching blow, then a 2-second hands-in-the-air celebration |

Roster fighters can mix any of these abilities, with sliders for every stat. They're saved in the browser's local storage.

## Project layout

```
index.html              Page markup for every screen (roster, Dev Corner, editor, game)
css/styles.css          All styling, including light and dark themes
js/config.js            Arena size, physics constants, Watcher corner seats
js/audio.js             Synthesized wall-bounce sound
js/characters.js        Character bases, ability defaults, saving roster fighters
js/ui/select.js         Screen switching, the roster screen and The Dev Corner
js/ui/editor.js         Character editor
js/game/match.js        Match setup, damage, blocking, win check
js/game/physics.js      Movement, wall bounces, ball-vs-ball collisions
js/game/abilities.js    Logic for every attack
js/game/weave.js        Weave dodge, critical-weave combo and the celebration taunt
js/game/update.js       Per-frame update, HUD, canvas sizing
js/game/draw-attacks.js Drawing each attack's animation
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
