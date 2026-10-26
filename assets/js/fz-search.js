/* Favze sitewide search: free, runs in the browser, no third-party service.
   Modes: Broad (related words, typos, word endings), Phrase (words in this order), Exact (this exact term).
   Typing "quotes" switches to Phrase automatically. */
(function () {
  'use strict';
  var D = document, H = D.documentElement;
  var SRC = (D.currentScript && D.currentScript.src) || '';
  var INDEX_URL = SRC ? SRC.replace(/assets\/js\/fz-search\.js.*$/, 'search-index.json') : '/search-index.json';
  var data = null, loading = null, mode = 'broad', active = -1, lastQ = '';

  var STOP = { a: 1, an: 1, the: 1, and: 1, or: 1, of: 1, to: 1, in: 1, for: 1, on: 1, my: 1, me: 1, i: 1, is: 1, it: 1, do: 1, does: 1, how: 1, what: 1, with: 1, can: 1, you: 1, your: 1, be: 1, at: 1, by: 1, much: 1, many: 1, get: 1, need: 1, want: 1, help: 1, near: 1 };
  var SYN = {
    maps: ['local', 'map', 'pack', 'google business profile'], map: ['local', 'maps'], gbp: ['google business profile'],
    ads: ['paid', 'ppc', 'advertising'], ppc: ['paid search', 'google ads'], advertising: ['ads', 'paid'],
    website: ['web design', 'site'], site: ['website'], webdesign: ['web design'],
    chatgpt: ['ai', 'geo', 'generative'], ai: ['chatgpt', 'ai optimization', 'aeo', 'geo'], gemini: ['ai'], perplexity: ['ai'],
    text: ['sms'], texting: ['sms'], sms: ['text message'], email: ['newsletter', 'email marketing'], newsletter: ['email', 'insider', 'intel'],
    crm: ['hubspot'], hubspot: ['crm'], social: ['instagram', 'facebook', 'tiktok'], instagram: ['social'], facebook: ['social', 'meta'], tiktok: ['social'],
    price: ['pricing', 'cost', 'budget', 'free consultation'], pricing: ['price', 'cost'], cost: ['price', 'pricing', 'budget'],
    reviews: ['review', 'reputation'], review: ['reviews'], seo: ['search engine optimization', 'rank'], rank: ['seo', 'ranking'],
    consultation: ['free consultation', 'contact'], contact: ['free consultation', 'call', 'text'], audit: ['checklist'],
    goshen: ['elkhart county'], elkhart: ['elkhart county'], 'south': ['st joseph'], mishawaka: ['st joseph county'], warsaw: ['kosciusko'],
    plymouth: ['marshall'], valparaiso: ['porter'], 'fort': ['allen'], kokomo: ['howard'], niles: ['berrien'], dowagiac: ['cass'], shipshewana: ['lagrange']
  };

  var B = 'https://favze.com/';
  var BOOST = {
    cost: ['faq', 'free-consultation', 'why-us'], price: ['faq', 'free-consultation', 'why-us'], pricing: ['faq', 'free-consultation', 'why-us'], budget: ['faq', 'free-consultation'],
    chatgpt: ['services/ai-optimization', 'services/generative-engine-optimization'], ai: ['services/ai-optimization', 'services/answer-engine-optimization', 'services/generative-engine-optimization'],
    website: ['services/website-design'], web: ['services/website-design'], maps: ['services/local-seo'], map: ['services/local-seo'], reviews: ['services/local-seo'], review: ['services/local-seo'],
    contact: ['free-consultation'], call: ['free-consultation'], consultation: ['free-consultation'], newsletter: ['newsletters'], audit: ['full-digital-marketing-audit'],
    ads: ['services/paid-search-ads', 'services/paid-social-media-ads'], google: ['services/local-seo', 'services/paid-search-ads'], email: ['services/email-marketing'], text: ['services/short-message-service-sms'], sms: ['services/short-message-service-sms'],
    social: ['services/social-media-marketing', 'services/paid-social-media-ads'], crm: ['services/hubspot-setup'], hubspot: ['services/hubspot-setup'], seo: ['services/search-engine-optimization', 'services/local-seo'],
    riley: ['about'], founder: ['about'], about: ['about'], process: ['our-process'], framework: ['favze-framework'], areas: ['areas-served']
  };
  function norm(s) { return (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[’']/g, '').replace(/[^a-z0-9%&+#.\- ]+/g, ' ').replace(/\s+/g, ' ').trim(); }
  function stem(w) { return w.length > 4 ? w.replace(/(ings|ing|ers|er|ies|es|s|ed|ly)$/, '') : w; }
  function words(s) { return norm(s).split(' ').filter(function (w) { return w && !STOP[w]; }); }
  function lev1(a, b) { /* true when a and b are within one typo */
    if (Math.abs(a.length - b.length) > 1) return false;
    var i = 0, j = 0, e = 0;
    while (i < a.length && j < b.length) {
      if (a[i] === b[j]) { i++; j++; continue; }
      if (++e > 1) return false;
      if (a.length > b.length) i++; else if (b.length > a.length) j++; else { i++; j++; }
    }
    return e + (a.length - i) + (b.length - j) <= 1;
  }
  function escRe(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  function prep(p) {
    p._t = norm(p.t); p._d = norm(p.d); p._h = norm(p.h); p._b = norm(p.b);
    p._all = p._t + ' ' + p._h + ' ' + p._d + ' ' + p._b;
    var set = {}; p._all.split(' ').forEach(function (w) { if (w.length > 1) set[stem(w)] = 1; });
    p._w = Object.keys(set);
  }
  function load() {
    if (data) return Promise.resolve(data);
    if (loading) return loading;
    loading = fetch(INDEX_URL, { cache: 'force-cache' }).then(function (r) { if (!r.ok) throw new Error('index ' + r.status); return r.json(); }).then(function (j) { j.forEach(prep); data = j; return j; })
      .catch(function () { loading = null; return null; });
    return loading;
  }

  /* Scoring: title > headings > description > body. Exact and phrase hits outrank broad ones. */
  function fieldScore(p, test) { return (test(p._t) ? 12 : 0) + (test(p._h) ? 6 : 0) + (test(p._d) ? 4 : 0) + (test(p._b) ? 2 : 0); }
  function search(q, m) {
    var raw = norm(q.replace(/["“”]/g, ' '));
    if (!raw) return [];
    var quoted = /["“”]/.test(q);
    var useMode = quoted && m === 'broad' ? 'phrase' : m;
    var qw = words(raw); if (!qw.length) qw = raw.split(' ');
    var phraseRe = new RegExp('(^|\\W)' + escRe(raw) + '(\\W|$)');
    var res = [];
    data.forEach(function (p) {
      var score = 0, type = '';
      var exactHit = fieldScore(p, function (f) { return phraseRe.test(f); });
      if (useMode === 'exact') {
        if (!exactHit) return;
        score = exactHit * 3 + (p._t === raw ? 40 : 0); type = 'Exact match';
      } else if (useMode === 'phrase') {
        var seq = new RegExp(qw.map(escRe).join('\\W+(?:\\w+\\W+){0,2}'));
        var ph = fieldScore(p, function (f) { return seq.test(f); });
        if (!ph && !exactHit) return;
        score = exactHit * 3 + ph * 2; type = exactHit ? 'Exact match' : 'Phrase match';
      } else {
        var hits = 0, sc = 0;
        qw.forEach(function (w) {
          var sw = stem(w), alts = [w].concat(SYN[w] || []);
          var direct = fieldScore(p, function (f) { return (' ' + f).indexOf(' ' + sw) > -1; });
          if (direct) { hits++; sc += direct; return; }
          var syn = 0;
          alts.slice(1).forEach(function (a) { syn = Math.max(syn, fieldScore(p, function (f) { return f.indexOf(a) > -1; })); });
          if (syn) { hits++; sc += syn * 0.6; return; }
          if (sw.length >= 4 && p._w.some(function (x) { return x.length >= 4 && lev1(x, sw); })) { hits++; sc += 1.5; }
        });
        if (!hits) return;
        score = sc * (hits / qw.length) + exactHit * 3 + (hits === qw.length ? 8 : 0);
        type = exactHit ? 'Exact match' : hits === qw.length ? 'All words' : 'Related';
      }
      if (p.k === 'Service') score *= 1.15;
      qw.forEach(function (w) { (BOOST[w] || BOOST[stem(w)] || []).forEach(function (path, i) { if (p.u === B + path) score += 60 - i * 10; }); });
      res.push({ p: p, s: score, type: type });
    });
    res.sort(function (a, b) { return b.s - a.s; });
    return res.slice(0, 30);
  }
  function snippet(p, q) {
    var terms = words(q.replace(/["“”]/g, ' ')).map(stem).filter(function (t) { return t.length > 1; });
    var src = p.d || '';
    var body = p.b || '';
    var low = body.toLowerCase(), at = -1;
    for (var i = 0; i < terms.length && at < 0; i++) at = low.indexOf(terms[i]);
    if (at > -1 && !(new RegExp(terms.map(escRe).join('|'), 'i')).test(src)) {
      var st = Math.max(0, at - 70); src = (st ? '...' : '') + body.slice(st, st + 190).trim() + '...';
    }
    var html = esc(src);
    if (terms.length) html = html.replace(new RegExp('(' + terms.map(escRe).join('|') + ')', 'gi'), '<mark>$1</mark>');
    return html;
  }

  /* ---------- UI ---------- */
  var ICON = '<svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>';
  var dlg, input, list, status, lastFocus;
  function build() {
    dlg = D.createElement('div');
    dlg.className = 'fz-search'; dlg.id = 'fzSearch';
    dlg.setAttribute('data-nosnippet', ''); dlg.setAttribute('role', 'dialog'); dlg.setAttribute('aria-modal', 'true'); dlg.setAttribute('aria-labelledby', 'fzSearchTitle'); dlg.hidden = true;
    dlg.innerHTML =
      '<div class="fz-search-backdrop" data-close></div>' +
      '<div class="fz-search-panel">' +
        '<div class="fz-search-head">' +
          '<h2 id="fzSearchTitle" class="fz-search-title">Search Favze</h2>' +
          '<div class="fz-search-box">' + ICON +
            '<input id="fzSearchInput" type="search" autocomplete="off" spellcheck="false" placeholder="Try: Google Maps, website, ChatGPT, Goshen" aria-describedby="fzSearchHelp" aria-controls="fzSearchList" aria-autocomplete="list">' +
            '<button type="button" class="fz-search-close" data-close aria-label="Close search">Close</button>' +
          '</div>' +
          '<div class="fz-search-modes" role="radiogroup" aria-label="Match type">' +
            '<button type="button" role="radio" data-mode="broad" aria-checked="true">Broad</button>' +
            '<button type="button" role="radio" data-mode="phrase" aria-checked="false">Phrase</button>' +
            '<button type="button" role="radio" data-mode="exact" aria-checked="false">Exact</button>' +
            '<span id="fzSearchHelp" class="fz-search-help">Broad finds related words. Phrase keeps your words in order. Exact matches the exact term.</span>' +
          '</div>' +
        '</div>' +
        '<p class="fz-search-status" role="status" aria-live="polite"></p>' +
        '<ul class="fz-search-list" id="fzSearchList" role="listbox" aria-label="Search results"></ul>' +
      '</div>';
    D.body.appendChild(dlg);
    input = dlg.querySelector('input'); list = dlg.querySelector('.fz-search-list'); status = dlg.querySelector('.fz-search-status');
    dlg.addEventListener('click', function (e) { if (e.target.closest('[data-close]')) close(); });
    dlg.querySelectorAll('[data-mode]').forEach(function (b) {
      b.addEventListener('click', function () { setMode(b.getAttribute('data-mode')); input.focus(); });
    });
    var t = null;
    input.addEventListener('input', function () { clearTimeout(t); t = setTimeout(render, 90); });
    input.addEventListener('keydown', keys);
    dlg.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { e.preventDefault(); close(); }
      if (e.key === 'Tab') { /* keep focus inside the dialog */
        var f = [].slice.call(dlg.querySelectorAll('input,button,a[href]')).filter(function (x) { return x.offsetParent; });
        if (!f.length) return;
        if (e.shiftKey && D.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
        else if (!e.shiftKey && D.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
      }
    });
    list.addEventListener('click', function (e) {
      var a = e.target.closest('a'); if (!a) return;
      track('search_result_click', { search_term: lastQ, link_url: a.getAttribute('href') });
    });
  }
  function setMode(m) {
    mode = m;
    dlg.querySelectorAll('[data-mode]').forEach(function (b) { b.setAttribute('aria-checked', b.getAttribute('data-mode') === m ? 'true' : 'false'); });
    render();
  }
  function quick() {
    var picks = [
      ['Book a free consultation', 'https://favze.com/free-consultation', 'Page'],
      ['Local SEO and Google Maps', 'https://favze.com/services/local-seo', 'Service'],
      ['Website design', 'https://favze.com/services/website-design', 'Service'],
      ['Get recommended by AI tools', 'https://favze.com/services/ai-optimization', 'Service'],
      ['Free marketing audit checklist', 'https://favze.com/full-digital-marketing-audit', 'Page'],
      ['Favze Insights articles', 'https://favze.com/articles', 'Insights']
    ];
    status.textContent = 'Popular on Favze';
    list.innerHTML = picks.map(function (x, i) {
      return '<li role="option" id="fzr' + i + '" aria-selected="false"><a href="' + x[1] + '"><span class="fz-sr-kind">' + x[2] + '</span><span class="fz-sr-title">' + x[0] + '</span></a></li>';
    }).join('');
    active = -1;
  }
  function render() {
    var q = input.value.trim(); lastQ = q;
    if (!q) { quick(); return; }
    if (!data) { status.textContent = 'Loading search...'; load().then(function (d) { if (d) render(); else status.textContent = 'Search is reconnecting. Try again in a moment.'; }); return; }
    var r = search(q, mode);
    status.textContent = r.length ? r.length + (r.length === 1 ? ' result' : ' results') + ' for “' + q + '”' : 'No matches for “' + q + '”. Try Broad, fewer words, or ask Riley directly.';
    list.innerHTML = r.length ? r.map(function (x, i) {
      return '<li role="option" id="fzr' + i + '" aria-selected="false"><a href="' + esc(x.p.u) + '">' +
        '<span class="fz-sr-kind">' + esc(x.p.k) + '<em>' + esc(x.type) + '</em></span>' +
        '<span class="fz-sr-title">' + esc(x.p.t) + '</span>' +
        '<span class="fz-sr-snip">' + snippet(x.p, q) + '</span></a></li>';
    }).join('') : '<li class="fz-sr-empty"><a href="https://favze.com/free-consultation">Book a free consultation <span aria-hidden="true">&rarr;</span></a> <a href="sms:+15747475012">Text Riley <span aria-hidden="true">&rarr;</span></a></li>';
    active = -1;
    clearTimeout(render._t);
    render._t = setTimeout(function () { if (q === input.value.trim() && q.length > 1) track('search', { search_term: q, search_mode: mode, results: r.length }); }, 1200);
  }
  function keys(e) {
    var items = list.querySelectorAll('li[role="option"]');
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault(); if (!items.length) return;
      active = (active + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length;
      items.forEach(function (li, i) { li.setAttribute('aria-selected', i === active ? 'true' : 'false'); li.classList.toggle('is-active', i === active); });
      input.setAttribute('aria-activedescendant', items[active].id);
      items[active].scrollIntoView({ block: 'nearest' });
    } else if (e.key === 'Enter') {
      var pick = items[active >= 0 ? active : 0];
      if (pick) { e.preventDefault(); var a = pick.querySelector('a'); track('search_result_click', { search_term: lastQ, link_url: a.getAttribute('href') }); location.href = a.href; }
    }
  }
  function open() {
    if (!dlg) build();
    lastFocus = D.activeElement;
    dlg.hidden = false; H.classList.add('fz-search-open');
    requestAnimationFrame(function () { dlg.classList.add('is-open'); input.focus(); });
    render(); load();
  }
  function close() {
    if (!dlg || dlg.hidden) return;
    dlg.classList.remove('is-open'); H.classList.remove('fz-search-open');
    setTimeout(function () { dlg.hidden = true; }, 160);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  function track(name, params) {
    params = params || {}; params.page_path = location.pathname;
    if (typeof window.gtag === 'function') window.gtag('event', name, params);
    else (window.dataLayer = window.dataLayer || []).push(Object.assign({ event: name }, params));
  }

  /* Search buttons in the nav (desktop, tablet, phone) */
  function addButtons() {
    ['.fz-nav-actions', '.fz-nav-mob'].forEach(function (sel) {
      var box = D.querySelector(sel); if (!box || box.querySelector('.nav-search')) return;
      var b = D.createElement('button');
      b.type = 'button'; b.className = 'nav-search fz-icon-btn'; b.setAttribute('aria-label', 'Search the Favze website'); b.setAttribute('aria-haspopup', 'dialog'); b.title = 'Search';
      b.innerHTML = ICON;
      b.addEventListener('click', open);
      box.insertBefore(b, box.firstChild);
    });
  }
  addButtons();
  D.addEventListener('keydown', function (e) {
    var tag = (e.target.tagName || '').toLowerCase(), typing = tag === 'input' || tag === 'textarea' || e.target.isContentEditable;
    if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) { e.preventDefault(); open(); }
    else if (e.key === '/' && !typing) { e.preventDefault(); open(); }
  });
  window.fzSearch = { open: open, close: close, _search: function (q, m) { return load().then(function (d) { if (!d) return []; return search(q, m || 'broad').map(function (r) { return [r.p.t, r.type, Math.round(r.s)]; }); }); } };
})();
