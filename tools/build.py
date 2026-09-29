#!/usr/bin/env python3
"""Bundle the game into one self-contained HTML file.

Usage:  python3 tools/build.py
Output: dist/ball-brawl.html

Inlines css/styles.css and every <script src="..."> from index.html, so the
result runs anywhere a single HTML file can (for example, as a Claude artifact).
"""
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def read(rel):
    with open(os.path.join(ROOT, rel), encoding="utf-8") as f:
        return f.read()


html = read("index.html")

html = html.replace(
    '<link rel="stylesheet" href="css/styles.css">',
    "<style>\n" + read("css/styles.css") + "</style>",
)

scripts = re.findall(r'<script src="([^"]+)"></script>', html)
bundle = "\n".join(read(src) for src in scripts)
# Wrap everything in one function so nothing leaks onto window.
bundled_tag = "<script>\n(function () {\n" + bundle + "\n})();\n</script>"

html = re.sub(r'(?:<script src="[^"]+"></script>\n?)+', lambda m: bundled_tag + "\n", html, count=1)

os.makedirs(os.path.join(ROOT, "dist"), exist_ok=True)
out = os.path.join(ROOT, "dist", "ball-brawl.html")
with open(out, "w", encoding="utf-8") as f:
    f.write(html)
print("Wrote", os.path.relpath(out, ROOT))
