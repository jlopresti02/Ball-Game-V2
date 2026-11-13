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
