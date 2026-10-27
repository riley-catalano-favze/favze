#!/usr/bin/env python3
"""Builds search-index.json for the sitewide search.

Every word of every page is indexed, split into sections so results can jump
straight to the matching part of a page. Runs automatically on GitHub after
every push (.github/workflows/search-index.yml). To run it by hand from the
repo root:
    python3 tools/build-search-index.py
"""
import glob, html, json, os, re
from html.parser import HTMLParser

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)

def url_of(f):
    u = 'https://favze.com/' + f
    u = re.sub(r'index\.html$', '', u)
    u = re.sub(r'\.html$', '', u)
    return u.rstrip('/') if u != 'https://favze.com/' else u

def kind_of(f):
    if f.startswith('services/'): return 'Service' if not f.endswith('index.html') else 'Services'
    if f.startswith('areas-served/'): return 'Area'
    if f.startswith('resources/articles/'): return 'Article' if f.count('/') == 3 and not f.endswith('index.html') else 'Insights'
    if f.startswith('resources/newsletters/'): return 'Newsletter'
    if f.startswith('resources/glossary/'): return 'Glossary'
    if f.startswith('resources/marketing-tools/'): return 'Tool'
    if f.startswith('resources/'): return 'Resources'
    return 'Page'

SKIP = {'script', 'style', 'svg', 'noscript', 'template', 'nav', 'footer', 'form', 'iframe', 'button', 'select', 'textarea'}
VOID = {'br', 'img', 'input', 'meta', 'link', 'hr', 'source', 'wbr', 'area', 'col', 'embed', 'param', 'track'}
HEAD = {'h1', 'h2', 'h3', 'h4'}
NAVCLS = re.compile(r'\b(sr-only|fz-related|fz-smband|fz-form-sec|ct-band|tp-side|fz-gl-more|fz-sidenav|tp-crumb|hero-ctas|fz-mbar)\b')
ANCHOR_TAGS = {'section', 'article', 'h2', 'h3', 'details', 'div'}

class Main(HTMLParser):
    """Collects visible text from <main>, grouped into sections keyed by the nearest id."""
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.inmain = 0; self.skip = 0; self.stack = []
        self.secs = [['', '', []]]          # [anchor id, heading, text parts]
        self.inhead = 0; self.headbuf = []
    def handle_starttag(self, t, a):
        a = dict(a)
        if t == 'main': self.inmain += 1; return
        if not self.inmain: return
        if t in VOID: return
        self.stack.append(t)
        if t in SKIP or NAVCLS.search(a.get('class') or '') or a.get('aria-hidden') == 'true': self.skip += 1; self.stack[-1] = '!' + t; return
        if self.skip: return
        i = a.get('id')
        if i and t in ANCHOR_TAGS and (t != 'div' or 'gl-' in (a.get('class') or '')):
            self.secs.append([i, '', []])
        if t in HEAD: self.inhead += 1; self.headbuf = []
    def handle_endtag(self, t):
        if t == 'main': self.inmain -= 1; return
        if not self.inmain or t in VOID: return
        while self.stack:
            x = self.stack.pop()
            if x.startswith('!'): self.skip -= 1
            elif t in HEAD and x == t and self.inhead:
                self.inhead -= 1
                h = ' '.join(' '.join(self.headbuf).split())
                if h and not self.secs[-1][1]: self.secs[-1][1] = h
            if x.lstrip('!') == t: break
    def handle_data(self, d):
        if not self.inmain or self.skip: return
        if self.inhead: self.headbuf.append(d)
        self.secs[-1][2].append(d)

def clean(s): return ' '.join(html.unescape(s).split())

out = []
for f in sorted(glob.glob('**/*.html', recursive=True)):
    if f in ('404.html',) or f.startswith(('tools/', 'node_modules/', '.github/')): continue
    s = open(f, encoding='utf-8').read()
    if re.search(r'<meta name="robots" content="[^"]*noindex', s): continue
    title = clean(re.sub(r'<[^>]+>', ' ', (re.search(r'<title>(.*?)</title>', s, re.S) or [None, ''])[1]))
    title = re.sub(r'\s+-\s+Favze( Insights)?$', '', title)
    desc = clean((re.search(r'<meta name="description" content="([^"]*)"', s) or [None, ''])[1])
    p = Main(); p.feed(s)
    secs = []
    for i, h, parts in p.secs:
        txt = ' '.join(' '.join(parts).split())
        txt = re.sub(r'\s+([,.;:!?)%])', r'\1', re.sub(r'([(])\s+', r'\1', txt))
        if not txt: continue
        if secs and (not i or secs[-1][0] == i): secs[-1][2] += ' ' + txt; continue
        secs.append([i, h, txt])
    out.append({'u': url_of(f), 'k': kind_of(f), 't': title, 'd': desc, 's': secs})

with open('search-index.json', 'w', encoding='utf-8') as fh:
    json.dump(out, fh, ensure_ascii=False, separators=(',', ':'))
words = sum(len(x[2].split()) for p in out for x in p['s'])
print(len(out), 'pages,', sum(len(p['s']) for p in out), 'sections,', words, 'words,', os.path.getsize('search-index.json') // 1024, 'KB')
