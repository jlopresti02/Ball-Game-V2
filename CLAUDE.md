# Notes for Claude (and Joe)

Two people build Ball Brawl now:

- **Joe** ([jlopresti02](https://github.com/jlopresti02)) owns the game. Joe's Claude sessions push `claude/project-thread-*` branches.
- **Christian** ([Christian-T-256](https://github.com/Christian-T-256)) is a collaborator. Christian's Claude pushes `christian/*` branches.

Every change from Christian comes in as a pull request with Joe tagged as reviewer. Nothing reaches `main` until Joe merges it.

**Update 2026-11-13:** Christian asked his Claude to push his work straight to `main` instead. It only ever fast-forwards (never a force-push, never rewriting your commits), pulls `main` first, and runs headless test fights for every fighter it touched before each push (zero errors or it doesn't push). Joe: if you want pull requests back, change this paragraph and Christian's Claude will go back to them.

## Before you start any work

1. Pull `main`.
2. Check the open pull requests (`gh pr list`, or the Pull requests tab on GitHub). If one is already building the fighter or move you're about to work on, build on top of it or ask Joe first. Don't start a second version of the same fighter.
3. Read **In progress** below.

## In progress

Christian's fighters on `main` (2026-11-14): Alex Pereira, Conor McGregor, Sean O'Malley, Chuck Liddell, Georges St-Pierre, Demetrious "Mighty Mouse" Johnson, Alexander Volkanovski, Max Holloway, Nate Diaz, Sean Strickland, Tony Ferguson, and new today Fedor Emelianenko, Michael Bisping, Anderson Silva, Daniel Cormier, Carlos Prates, Jiří Procházka and Joshua Van. Christian's Claude has also added real voice lines to some of yours (chatter.js, below). Francis Ngannou is Joe's (pull request #70); Christian's rage extras went on top of it.

| Fighter or move | Who | Status |
|---|---|---|
| Carlos Prates | Christian's Claude | live on main |
| Jiří Procházka | Christian's Claude | live on main |
| Daniel Cormier | Christian's Claude | live on main |
| Joshua Van | Christian's Claude | live on main |
| Jon Jones: clinch, inside trip, spinning elbow, EVIL oblique kicks (new file `jon-clinch.js`, one-line hooks) | Christian's Claude | live on main |
| Max Holloway hits harder (volume punches 8-12, punch 8) and Ilia Topuria hits harder (punch 8) | Christian's Claude | live on main |
| Shared commentary calls (`commentary-calls.js`), Max's new lines, Khabib ground elbows | Christian's Claude | live on main |
| Conor's rainbow aims where they're heading (`potOfGold` lock/lead keys) | Christian's Claude | live on main |
| Tony Ferguson: Joe's look (olive skin, black hair, arm tattoo, higher headband, PR #96), see Joe's calls on looks below | Joe | live on main |
| Ilia Topuria's 3-4 punch combos ending in a hook (`ilia-combos.js`) and the shared hook punch any fighter can use (`hook-punch.js`, `hooks` block) | Christian's Claude | live on main |
| Michael Bisping's Broadside is a pirate ship in the middle of the ring with a three-cannon volley | Christian's Claude | live on main |
| Joshua Van's left hook on the shared hook punch | Christian's Claude | live on main |
| Shared leg kick that slows them down (`leg-kick.js`): Dustin's calf kicks (extra against Conor), Pereira on it, Jon's oblique kick shares the limp; Ciryl Gane fights off the back foot (`gane.js`); the shared hook takes an `over` option | Christian's Claude | live on main |
| Shared clinch any fighter can use (`clinch.js`, `clinch` block): tie-up, knees to the body and head, elbows, a parting shot on the break. Carlos Prates, Anderson Silva and Jiří Procházka use it in place of the plum | Christian's Claude | live on main |
| Strikers scramble back up after takedowns (`get-up.js`, `getUp` block, rated by size and wrestling): Ilia Topuria, Jiří Procházka, Francis Ngannou | Christian's Claude | live on main |
| Sean Strickland's America fires when he's landing or has them cornered; the eagle swoops in on a curve and lands; Chuck Norris tags in | Christian's Claude | live on main |
| Shared movement styles (`movement.js`, `movement` block): Ilia walks them down, Khabib cuts off the cage with rare side steps | Christian's Claude | live on main |
| Justin Gaethje's golf club comes out sooner (charge 35) and can't get him stuck in a grab; Max Holloway's Middle comes late in most fights (always accepted); Ilia's bull hits harder (70); an engine watchdog (`watchdog.js`) frees any fighter stuck too long | Christian's Claude | live on main |
| Uppercuts and body shots as shared punches that set up the bigger shot (`body-shots-uppercuts.js`, `uppercuts` / `bodyShots` blocks, hooks take `afterSetup` and `side`): Max, Ilia, Van, Dustin (body, then the left hook), Pereira, and Gaethje's uppercuts that stuff grabs, shots, clinches and guard pulls | Christian's Claude | live on main |
| Josh Hokit always walks forward with light combos, stuffs takedowns, shoots now and then, 800 health (`hokit-pressure.js`, `max-hp.js`: only a fighter with `maxHp` over 500 changes) | Christian's Claude | live on main |
| Balance from watching: Khabib's chin is up (shared `chin.js`, `chin` block, Gane's moved onto it) and 12% of his shots get stuffed (shared `stuffed-shots.js`, `grapple.stuffChance`); Charles Oliveira 30% stuffed, on the shared clinch with strong knees | Christian's Claude | live on main |
| Nate Diaz's lion: Nate summons a lion that hops the cage, stalks, pounces and mauls (`nate-lion.js`, `lion` block in his character file) | Joe's Claude | live on main |
| Francis Ngannou's Hulk punch telegraphs before it comes, and from far enough away it can be dodged (`rage.escape`, ngannou.js); close in it still lands. His rage fills as before | Christian's Claude | live on main |
| Justin Gaethje chops the calf on the shared leg kick (his own timer; three in a row and the leg gives out); Alex Pereira's head kick follows his calf kicks (`head-kick.js`, `headKick` block) | Christian's Claude | live on main |
| Sean Strickland keeps them at the end of his jab (opt-in spacing mode in `movement.js`) and his America is all his (no grabs, shots or punches on him; they back off dazed); Strickland and Ilia stuff more shots (takedown defense 80 and 68) | Christian's Claude | live on main |
| Christian's calls from watching: Charles Oliveira's clinch is normal strength (Do Bronx doubles it, `special.clinchMult`); Ngannou's Hulk punch is slipped about 3 in 4 unless they're touching (`rage.escape`); Pereira's head kick lands 40% of the time for 100 HP with an 8% knockout (`headKick.damageHp`, see the Pereira row below), and a miss leaves him off balance to get shot on or punished (`headKick.miss*`); his CHAMA counters fighters closing in (`poatan.chama`); Gaethje answers 90% of grabs with a 1.22x uppercut | Christian's Claude | live on main |
| Tony Ferguson's shuffle closes the distance and fires elbows, spinning elbows, kicks or a shot off the slide (`ferguson.slide` close/attack keys); his katana cuts a bit deeper (damage 7, finisher 18, clash win 30). Joe's look and Joe's burrito-as-first-Kaioken unchanged | Christian's Claude | live on main |
| Ciryl Gane's Herb Dean special hits a bit softer and ends a bit sooner (bat 10, finisher 34, cane 7; Herb joins for 2s and the beating stops at 6s via `special.herbJoined` / `special.beatMax` in herbdean.js) | Christian's Claude | live on main |
| Alex Pereira holds the middle of the ring and lets them come to him (opt-in `center` part in the shared `movement.js`, his `movement` block); his head kick misses more (lands 40%) but takes exactly 100 HP when it lands, 8% of those a knockout (`headKick.damageHp`, new in head-kick.js); CHAMA only once they're under 35% health or 40s into the fight (`poatan.chama.whenHurt` / `whenLate`) | Christian's Claude | live on main |
| Tony Ferguson's burrito ki barrage hits much harder (Christian asked for this change to Joe's numbers): fireballs 3 (was 1), the big one 42 (was 14), its slam 12 (was 4) (`ferguson.burrito.barrage`) | Christian's Claude | live on main |
| Sean O'Malley's four new real voice lines: "knocking people out since I was 16" (start), "It only takes one mistake against me" (sniper), "God, it feels good to win" (win) and "I didn't feel like it was gonna go like that" (new `voice.loss`), clips in `voice-clips.js` | Christian's Claude | live on main |
| Sean Strickland's four new real voice lines: "Peter Pan kicks" (start), "I love this country" (America), "blood splatter" (new `lines.combo`, once a fight on a landed one-two or Chuck Norris) and "It was a war. I'm salty" (new `lines.lose`), clips in `voice-clips.js` | Christian's Claude | live on main |
| Carlos Prates's look from Joe's photos (`prates-skin.js`, `look.pratesSkin`): curly top with a Clark Kent curl and faded sides, pencil moustache and light goatee, throat letters and neck vine, traced "Muay Thai" on his chest only, navel ring, a different traced sleeve on each arm (only on his arms, `tattoos.armDecalRight` / `armDecalLeft`). See Joe's calls on looks below | Joe | live on main |
| Fedor's special | Christian | not picked yet |

Christian's Claude updates this table with each change it ships. Joe's Claude: if Joe starts one of these fighters himself, update the table so Christian's Claude skips it.

## Never undo Joe's changes (Joe's rule, 2026-11-15)

Christian's Claude must not revert, undo or overwrite anything Joe (or Joe's Claude) put into the game (looks, moves, numbers, sounds, anything) **unless Christian specifically asked for that exact change**. "Restoring an older look" or "tidying up" is not a reason. Before touching something Joe changed, check `git log` on the file: if the last change to it came from a `claude/project-thread-*` branch or Joe's PR, leave it alone and ask Joe (or Christian) first. When you merge Joe's main into your work, keep Joe's version of anything that conflicts.

### Joe's calls on looks (don't change these back)

- **Tony Ferguson** (Joe, 2026-11-15): olive skin `#c49a6c`, black hair `#17130f`, dark stubble `#2a211a`, with his real arm tattoo and the higher headband (PR #92). Joe asked for this look; please don't switch him back to light skin or blonde hair. Ask Joe first if you think a look should change.
- **Carlos Prates** (Joe, 2026-11-15): Joe's look from four photos (`prates-skin.js`, turned on by `look.pratesSkin` in characters/carlos-prates.json). His tattoos are mapped to the real body parts; arm ink shows only on his arms, the chest script only on his chest. Please leave his hair, face, tattoos and decals as they are and ask Joe first.

## Working in the same files

- Every new fighter or move gets its own file in `js/game/`. Hooks into shared files (`match.js`, `abilities.js`, `update.js`, `physics.js`, `draw.js`, `draw-attacks.js`, `special.js`) stay one line each, with a comment naming the file they call into, the same way the existing ones do.
- `index.html` version stamps (`tools/bump_version.py`) change on almost every pull request and will conflict. Re-run the script after merging instead of resolving them by hand.
- Same for `js/roster-data.js`: re-run `python3 tools/build_roster.py` after merging.
- If you change something one of Christian's open pull requests depends on, say so in your pull request so Christian's Claude sees it when it pulls.

## What Christian's Claude added that touches everyone

- **Voice clips** (`js/game/voice-clips.js`, `SPEECH_CLIPS`): every line is the real person's real voice, cut from real footage by Christian's clip tool (it lives outside this repo and writes this file; don't edit it by hand). A clip is keyed by the line's **exact text**, so if you change a line's wording in the code it goes silent until the clip is re-keyed. A line with no clip is silent: no bubble. Swears are bleeped in the audio.
- **Chatter** (`js/game/chatter.js`): extra real lines for any fighter by id, yours included. Jon Jones's lines live here so `jon.js` stays yours. Its `moments` read fighter state to know when something happens: `b.jonMode` (GOAT/EVIL swaps), `b.chAct.kind === "poke"` (eye pokes) and `b.kick`. If you rename those in your code, Jon's moment lines go quiet: update `CHATTER_MOMENTS` in chatter.js too. Max Holloway's moments (`lowHealth`, `combo`, `knockdown`) read `b.hp`, the jumbotron's strikes landed (`statsFor`) and the opponent's `guard` / `dizzy` / `dazed`.
- **Commentary calls** (`js/game/commentary-calls.js`): `commentaryCall(kind, attacker, defender)` puts the commentator's real call on the lower-third when a big moment happens (combos, elbows, the spinning elbow, takedown shots, sprawls, suplexes, chokes, knockouts, close fights). One-line hooks in combos.js, elbows.js, grapple-duel.js, cte.js, suplex.js, bjj.js, rnc.js, special.js and a few fighter files call it. It decides by itself whether to talk (a chance, gaps, nobody else talking), so calling it from your own move is safe: `if (typeof commentaryCall === "function") commentaryCall("suplex", self, other);`. Knockouts and big punches are watched from there (a one-line hook in `hurt()`), no other hook needed.
- **Never name an absent opponent**: a line or commentator call that names a real fighter only plays when that fighter is the one in the cage (`vs` lines). Everything else names only the speaker or nobody.
- **Strikes any fighter can have**: `teep.js`, `knees.js` (knee, clinch knees, flying knee), `combos.js`, `elbows.js`. Elbows crit 35% of the time unless a fighter's `elbow` block sets `critChance`; knees crit 30%. Jon Jones throws elbows and knees.
- **Chuck Norris** (`js/game/chuck-norris.js`) is a guest in Sean Strickland's America (`special.norris` in Strickland's file), not a fighter.

## Voice lines Joe wants (for Christian's clip tool)

Joe asked for these real lines. Christian's Claude: when you're finding voice lines, please cut the ones still marked *wanted* and key them by the **exact text** shown (silent until then). Ones marked *in* already have Joe's own clip; leave their text alone.

| Fighter | Exact text in the code | Where it plays |
|---|---|---|
| Nate Diaz | `Who the [BLEEP] knows what a gazelle is?` (the real line: "Who the fuck knows what a gazelle is?", bleeped) | as he summons his lion (`LION_LINE` in `nate-lion.js`). *In*: Joe sent the clip (`nateGazelle`, `nate-lion-art.js`) |

## Voice lines never overlap (Joe's rule)

Only one person talks at a time in a fight: fighters, commentators, the "here we go" call, the knockout call, ad voices that speak over the fight. Every voice clip goes through the **talk channel** in `js/audio.js`. Never play a voice line with `playClip`, `playClipOnce` or your own `createBufferSource`.

- `playTalk(name, gain)`: the normal way. If someone is already talking and they finish within 1.5s (`TALK_WAIT`), the new line waits and plays right after. Otherwise it's skipped and returns `false`.
- A line that should only play once a fight: check the return value, and if it was skipped, try again at the next chance (see `charlesCallDone` in `abilities.js` or Gane's bat/poke calls). Don't mark it done until `playTalk` returns `true`.
- `cutInTalk(name, gain)`: only for the big moments (the knockout call, Do Bronx, a special's own call like "send me location"). It stops whoever is talking.
- `playPriorityTalk(name, gain)`: Gane's Herb Dean special only. Nothing cuts it off.
- Speech bubbles: `say()` and `announce()` in `js/game/speech.js` already use `playTalk` for their clips, so new lines added to `SPEECH_CLIPS` (voice-clips.js) follow the rule with no extra work.
- Sound effects, music and crowd (punches, slams, whooshes, songs, cheers) are not voice lines and stay off the talk channel.
- Talking ducks the music. Cheers on the talk channel (`TALK_CHEERS`) must never mute or dip it.

Before opening a pull request that adds a voice clip, search for it (`grep -n "yourClipName" js -r`) and check that every place it plays is one of the three talk functions above.
