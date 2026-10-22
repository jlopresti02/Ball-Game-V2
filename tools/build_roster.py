#!/usr/bin/env python3
"""Turn the character files in characters/*.json into js/roster-data.js.

Usage:  python3 tools/build_roster.py

Each file is one roster fighter. The game fills in any ability left out of a
file with that ability's defaults (switched off), so a file only needs the
abilities the fighter actually uses. Fields the game doesn't know about
(like "base" and "bio") are kept for reference and ignored in play.
"""
import glob
import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
fighters = []
for path in sorted(glob.glob(os.path.join(ROOT, "characters", "*.json"))):
    with open(path, encoding="utf-8") as f:
        ch = json.load(f)
    for key in ("id", "name"):
        if not ch.get(key):
            raise SystemExit(f"{os.path.basename(path)}: missing {key}")
    ch["builtin"] = False
    fighters.append(ch)

ids = [c["id"] for c in fighters]
if len(ids) != len(set(ids)):
    raise SystemExit("two character files share an id")

out = os.path.join(ROOT, "js", "roster-data.js")
with open(out, "w", encoding="utf-8") as f:
    f.write("// Roster fighters saved into the repo, so every version of the game has\n")
    f.write("// them. Generated from characters/*.json by tools/build_roster.py: edit\n")
    f.write("// the character files (or the fighter in the game), not this file.\n")
    f.write('"use strict";\n\n')
    f.write("var SAVED_ROSTER = " + json.dumps(fighters, indent=2) + ";\n")
print("Wrote js/roster-data.js with", len(fighters), "fighter(s):", ", ".join(c["name"] for c in fighters))
