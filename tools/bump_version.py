#!/usr/bin/env python3
"""Stamp a fresh ?v= version onto every CSS and JS link in index.html.

GitHub Pages tells browsers to cache files for up to 10 minutes, so after a
push people can keep playing the old scripts. A new ?v= on each file makes
browsers fetch the new copies as soon as they load the page.

Usage:  python3 tools/bump_version.py   (run before each commit)
"""
import os
import re
import time

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
path = os.path.join(ROOT, "index.html")
version = time.strftime("%Y%m%d%H%M%S")

with open(path, encoding="utf-8") as f:
    html = f.read()

html = re.sub(r'((?:src|href)="(?:js|css)/[^"?]+\.(?:js|css))(?:\?v=[^"]*)?"', r'\1?v=' + version + '"', html)

with open(path, "w", encoding="utf-8") as f:
    f.write(html)
print("Stamped version", version)
