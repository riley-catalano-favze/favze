#!/usr/bin/env python3
"""Adds a short content fingerprint (?v=abc12345) to every local CSS, JS, and font
reference in the site's HTML. When a file changes, its fingerprint changes, so every
browser loads the new version right away instead of a cached copy.

Runs automatically on GitHub after each push (.github/workflows/search-index.yml).
To run by hand from the repo root:
    python3 tools/version-assets.py
"""
import glob, hashlib, os, re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)

cache = {}
def fingerprint(path):
    if path not in cache:
        with open(path, 'rb') as fh:
            cache[path] = hashlib.sha1(fh.read()).hexdigest()[:8]
    return cache[path]

REF = re.compile(r'((?:href|src)=")((?:\.\./)*)(assets/(?:css|js|fonts)/[A-Za-z0-9._-]+\.(?:css|js|woff2))(?:\?v=[0-9a-f]+)?(")')
changed = 0
for f in sorted(glob.glob('**/*.html', recursive=True)):
    if f.startswith(('tools/', 'node_modules/', '.github/')):
        continue
    s = open(f, encoding='utf-8').read()
    def rep(m):
        target = os.path.normpath(os.path.join(os.path.dirname(f), m.group(2) + m.group(3)))
        if not os.path.exists(target):
            return m.group(0)
        return '%s%s%s?v=%s%s' % (m.group(1), m.group(2), m.group(3), fingerprint(target), m.group(4))
    n = REF.sub(rep, s)
    if n != s:
        open(f, 'w', encoding='utf-8').write(n)
        changed += 1
print('pages updated:', changed)
