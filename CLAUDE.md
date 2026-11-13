# Notes for Claude (and Joe)

Two people build Ball Brawl now:

- **Joe** ([jlopresti02](https://github.com/jlopresti02)) owns the game. Joe's Claude sessions push `claude/project-thread-*` branches.
- **Christian** ([Christian-T-256](https://github.com/Christian-T-256)) is a collaborator. Christian's Claude pushes `christian/*` branches.

Every change from Christian comes in as a pull request with Joe tagged as reviewer. Nothing reaches `main` until Joe merges it.

## Before you start any work

1. Pull `main`.
2. Check the open pull requests (`gh pr list`, or the Pull requests tab on GitHub). If one is already building the fighter or move you're about to work on, build on top of it or ask Joe first. Don't start a second version of the same fighter.
3. Read **In progress** below.

## In progress

Christian is adding these fighters, one pull request each, in this order:

| Fighter | Branch | Status |
|---|---|---|
| Alex Pereira | `christian/alex-pereira` | building |
| Conor McGregor | | next |
| Sean O'Malley | | queued |
| Chuck Liddell | | queued |
| Georges St-Pierre | | queued |
| Demetrious "Mighty Mouse" Johnson | | queued |

Joe is building Francis Ngannou (pull request #70). Christian's Claude won't touch him.

Christian's Claude updates this table in each of its pull requests. Joe's Claude: if Joe starts one of these fighters himself, update the table so Christian's Claude skips it.

## Working in the same files

- Every new fighter or move gets its own file in `js/game/`. Hooks into shared files (`match.js`, `abilities.js`, `update.js`, `physics.js`, `draw.js`, `draw-attacks.js`, `special.js`) stay one line each, with a comment naming the file they call into, the same way the existing ones do.
- `index.html` version stamps (`tools/bump_version.py`) change on almost every pull request and will conflict. Re-run the script after merging instead of resolving them by hand.
- Same for `js/roster-data.js`: re-run `python3 tools/build_roster.py` after merging.
- If you change something one of Christian's open pull requests depends on, say so in your pull request so Christian's Claude sees it when it pulls.

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
