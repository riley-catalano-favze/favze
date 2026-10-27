#!/usr/bin/env python3
"""Builds search-index.json for the sitewide search. Run from the repo root after editing pages:
    python3 tools/build-search-index.py
"""
import glob, html, json, os, re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)

def clean(s):
    s = re.sub(r'<[^>]+>', ' ', s)
    return ' '.join(html.unescape(s).split())

def url_of(f):
    u = 'https://favze.com/' + f
    u = re.sub(r'index\.html$', '', u)
    u = re.sub(r'\.html$', '', u)
    return u.rstrip('/') if u != 'https://favze.com/' else u

def kind_of(f):
    if f.startswith('services/'): return 'Service' if not f.endswith('index.html') else 'Services'
    if f.startswith('areas-served/'): return 'Area' if not f.endswith('index.html') else 'Areas'
    if f.startswith('resources/articles/'): return 'Article' if f.count('/') == 3 and not f.endswith('index.html') else 'Insights'
    if f.startswith('resources/newsletters/'): return 'Newsletter'
    if f.startswith('resources/glossary/'): return 'Glossary'
    if f.startswith('resources/marketing-tools/'): return 'Tool'
    if f.startswith('resources/'): return 'Resources'
    return 'Page'

out = []
for f in sorted(glob.glob('**/*.html', recursive=True)):
    if f in ('404.html',) or f.startswith(('tools/', 'node_modules/')): continue
    s = open(f, encoding='utf-8').read()
    if re.search(r'<meta name="robots" content="[^"]*noindex', s): continue
    title = clean((re.search(r'<title>(.*?)</title>', s, re.S) or [None, ''])[1])
    title = re.sub(r'\s+-\s+Favze( Insights)?$', '', title)
    desc = html.unescape((re.search(r'<meta name="description" content="([^"]*)"', s) or [None, ''])[1])
    m = re.search(r'<main\b[^>]*>(.*?)</main>', s, re.S)
    body = m.group(1) if m else s
    body = re.sub(r'<(script|style|svg|noscript|template)\b.*?</\1>', ' ', body, flags=re.S)
    body = re.sub(r'<(nav|footer)\b.*?</\1>', ' ', body, flags=re.S)
    heads = [clean(h) for h in re.findall(r'<h[1-3][^>]*>(.*?)</h[1-3]>', body, re.S)]
    parts = re.findall(r'<(p|li|dd|dt|td|h[2-4]|blockquote|summary)\b[^>]*>(.*?)</\1>', body, re.S)
    seen = set(); chunks = []
    for _, c in parts:
        c = clean(c)
        if len(c) < 25 or c in seen: continue
        seen.add(c); chunks.append(c)
    text = ' '.join(chunks)
    out.append({'u': url_of(f), 'k': kind_of(f), 't': title, 'd': desc,
                'h': ' | '.join(h for h in heads if h)[:600], 'b': text[:4000]})

with open('search-index.json', 'w', encoding='utf-8') as fh:
    json.dump(out, fh, ensure_ascii=False, separators=(',', ':'))
print(len(out), 'pages,', os.path.getsize('search-index.json') // 1024, 'KB')
