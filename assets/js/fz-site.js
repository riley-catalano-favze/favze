/* Favze sitewide behavior (shared by every page) */
(function () {
  'use strict';
  var D = document, H = D.documentElement;
  var reduceMotion = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Color helpers ---------- */
  function parse(str) {
    var m = str && str.match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    var p = m[1].split(/[\s,\/]+/).filter(Boolean).map(parseFloat);
    return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
  }
  function lum(c) { return 0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b; }
  function neutral(c) { return Math.max(c.r, c.g, c.b) - Math.min(c.r, c.g, c.b) < 30; }
  function ownText(el) {
    for (var n = el.firstChild; n; n = n.nextSibling) if (n.nodeType === 3 && n.textContent.trim()) return true;
    return false;
  }

  /* ---------- Section backgrounds: white / grey / black rhythm on dark-heavy pages ---------- */
  var SKIP_BLOCK = '.fz-own,.fz-goals,.vis-sec,.fz-smband,.fz-nl-duo,.fz-cta-band,.fz-cluster,.rs-sec,.rs-hero,.fz-about-band,.svc-grid,.sm-wrap,.fz-org,.fzd,nav,footer,script,style,noscript,link,template,.mm,.fz-mbar,#stcm-wrapper,.fz-form-sec,.fz-dot,.fz-ring,.fz-blk,.fz-philo,.fz-areas,.fz-related,.fz-sidenav,.fz-chat,.fz-chat-launch';
  function blockTone(el) {
    for (var e = el; e && e !== D.documentElement; e = e.parentElement) {
      var cs = getComputedStyle(e);
      if (cs.backgroundImage && cs.backgroundImage !== 'none') return e === el ? 'image' : 'dark';
      var c = parse(cs.backgroundColor);
      if (c && c.a >= 0.85) return lum(c) < 110 ? 'dark' : (lum(c) > 200 ? 'light' : 'mid');
    }
    return 'light';
  }
  function collectBlocks() {
    var out = [];
    function consider(el, depth) {
      if (el.matches(SKIP_BLOCK) || el.offsetHeight < 120) return;
      var big = el.offsetHeight > 2400 && depth < 3 && (el.tagName !== 'SECTION' || el.querySelectorAll(':scope > section').length >= 2);
      if (big || el.tagName === 'MAIN') {
        var kids = [].slice.call(el.children).filter(function (k) { return k.offsetHeight >= 120 && !k.matches(SKIP_BLOCK); });
        if (kids.length >= 3 || el.tagName === 'MAIN') { kids.forEach(function (k) { consider(k, depth + 1); }); return; }
      }
      out.push(el);
    }
    [].slice.call(D.body.children).forEach(function (el) { consider(el, 0); });
    return out;
  }
  function isIsland(el, cs) {
    var bg = parse(cs.backgroundColor);
    if (bg && bg.a >= 0.85 && (lum(bg) < 110 || !neutral(bg))) return true;
    if (cs.backgroundImage && cs.backgroundImage !== 'none' && /gradient|url/.test(cs.backgroundImage) && el.textContent.trim() && !softGradient(cs.backgroundImage)) return true;
    return false;
  }
  /* A gradient made only of see-through colors is a tint, not a dark panel: its text gets recolored with the section */
  function softGradient(bi) {
    if (!/gradient/.test(bi) || /url\(/.test(bi)) return false;
    var cols = bi.match(/rgba?\([^)]*\)/g);
    if (!cols || !cols.length) return false;
    for (var i = 0; i < cols.length; i++) { var c = parse(cols[i]); if (!c || c.a >= 0.5) return false; }
    return true;
  }
  function lightenNode(el, tone) {
    if (el.classList && el.classList.contains('fzd')) return false;
    var cs = getComputedStyle(el);
    if (cs.backgroundImage && cs.backgroundImage !== 'none' && !el.textContent.trim() && (cs.position === 'absolute' || cs.position === 'fixed')) {
      el.style.setProperty('opacity', '0', 'important');
      return false;
    }
    if (el !== this && isIsland(el, cs)) return false;
    var bg = parse(cs.backgroundColor);
    if (bg && bg.a > 0 && bg.a < 0.85 && (lum(bg) > 180 || lum(bg) < 70) && neutral(bg)) {
      el.style.setProperty('background-color', tone === 'white' ? '#f4f5f7' : '#ffffff', 'important');
    }
    ['top', 'right', 'bottom', 'left'].forEach(function (side) {
      var w = parseFloat(cs.getPropertyValue('border-' + side + '-width'));
      if (w > 0) {
        var bc = parse(cs.getPropertyValue('border-' + side + '-color'));
        if (bc && bc.a > 0 && lum(bc) > 160 && neutral(bc)) el.style.setProperty('border-' + side + '-color', 'rgba(0,0,0,.10)', 'important');
      }
    });
    var c = parse(cs.color);
    if (c && c.a > 0 && lum(c) > 160 && neutral(c)) {
      var fs = parseFloat(cs.fontSize), fw = parseInt(cs.fontWeight, 10);
      var strong = /^H[1-6]$/.test(el.tagName) || fs >= 20 || fw >= 700;
      el.style.setProperty('color', strong ? '#0a0a0a' : (c.a < 0.5 ? '#5a6070' : '#3d4148'), 'important');
    }
    if (el.tagName === 'svg' || el.tagName === 'SVG') {
      [el].concat([].slice.call(el.querySelectorAll('[stroke],[fill]'))).forEach(function (n) {
        ['stroke', 'fill'].forEach(function (attr) {
          var v = (n.getAttribute(attr) || '').toLowerCase().replace(/\s/g, '');
          if (/^(#fff|#ffffff|white|rgba?\(255,255,255)/.test(v)) n.setAttribute(attr, '#1a1d21');
        });
      });
      return false;
    }
    return !/^(IMG|VIDEO|CANVAS|IFRAME|PICTURE)$/.test(el.tagName);
  }
  function lighten(block, tone) {
    block.classList.add(tone === 'white' ? 'fz-sec-white' : 'fz-sec-grey', 'fz-lit');
    if (block.getBoundingClientRect().width < D.documentElement.clientWidth - 8 && !(block.parentElement && block.parentElement.classList.contains('fz-lit'))) block.classList.add('fz-bleed');
    (function walk(el) {
      var go = lightenNode.call(block, el, tone);
      if (!go) return;
      for (var k = el.firstElementChild; k; k = k.nextElementSibling) walk(k);
    })(block);
    if (window.MutationObserver) {
      new MutationObserver(function (muts) {
        muts.forEach(function (m) {
          [].forEach.call(m.addedNodes, function (n) {
            if (n.nodeType === 1 && !(n.closest && n.closest('.fzd'))) (function walk(el) {
              if (!lightenNode.call(block, el, tone)) return;
              for (var k = el.firstElementChild; k; k = k.nextElementSibling) walk(k);
            })(n);
          });
        });
      }).observe(block, { childList: true, subtree: true });
    }
  }
  function themeSections() {
    if (D.body.hasAttribute('data-fz-keep-theme')) return;
    var blocks = collectBlocks();
    if (blocks.length < 3) return;
    var tones = blocks.map(blockTone);
    var total = 0, dark = 0;
    blocks.forEach(function (b, i) { var h = b.offsetHeight; total += h; if (tones[i] === 'dark' || tones[i] === 'image') dark += h; });
    if (!total || dark / total < 0.6) return;
    function firstCls(k) {
      var c = blocks[k] ? (blocks[k].className || '').toString().replace(/\bfz-[a-z-]+\b/g, '').trim() : '';
      return /^(sec|section|container|wrap|wrapper|block|content|row)?$/.test(c) ? '' : c;
    }
    function runLen(k) {
      var c = firstCls(k), n = 1, j;
      if (!c) return 1;
      for (j = k - 1; j >= 0 && firstCls(j) === c; j--) n++;
      for (j = k + 1; j < blocks.length && firstCls(j) === c; j++) n++;
      return n;
    }
    var prevLight = false, lastTone = 'grey';
    for (var i = 1; i < blocks.length; i++) {
      var b = blocks[i], t = tones[i];
      var series = !!firstCls(i) && runLen(i) >= 3;
      if (b.offsetHeight < 400 && !series) continue;
      if (t === 'light' || t === 'mid') { prevLight = true; continue; }
      if (t === 'image') { prevLight = false; continue; }
      if (series) {
        var par = b.parentElement;
        if (par && par !== D.body && par.tagName !== 'MAIN' && !par.classList.contains('fz-lit')) lighten(par, 'grey');
        else {
          var bcs = getComputedStyle(b);
          var mt = parseFloat(bcs.marginTop) || 0, mb = parseFloat(bcs.marginBottom) || 0;
          if (mt > 0) { b.style.setProperty('padding-top', (parseFloat(bcs.paddingTop) + mt) + 'px', 'important'); b.style.setProperty('margin-top', '0', 'important'); }
          if (mb > 0) { b.style.setProperty('padding-bottom', (parseFloat(bcs.paddingBottom) + mb) + 'px', 'important'); b.style.setProperty('margin-bottom', '0', 'important'); }
        }
        lighten(b, lastTone === 'white' ? 'grey' : 'white');
        lastTone = lastTone === 'white' ? 'grey' : 'white';
        prevLight = true;
      } else if (!prevLight) {
        lastTone = lastTone === 'white' ? 'grey' : 'white';
        lighten(b, lastTone);
        prevLight = true;
      } else {
        prevLight = false;
      }
    }
  }

  /* ---------- Readability: lift faint text ---------- */
  function contrastPass() {
    var els = D.body.querySelectorAll('p,li,span,div,a,small,dd,dt,td,label');
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      if (!ownText(el) || el.closest('.fz-lit,#stcm-wrapper,.fz-mbar,nav,.mm,.fz-own,.fz-goals,.vis-sec,.fz-smband,.fz-nl-duo,.fz-cta-band,.fz-cluster,.rs-sec,.rs-hero,.fz-about-band,.svc-grid,.sm-wrap,.fz-org')) continue;
      var cs = getComputedStyle(el), c = parse(cs.color);
      if (!c || c.a === 0 || !neutral(c) || parseFloat(cs.fontSize) >= 24) continue;
      var L = lum(c);
      if (L > 200 && c.a < 0.68 && c.a >= 0.3) el.style.setProperty('color', 'rgba(255,255,255,.78)', 'important');
      else if (c.a >= 0.9 && L >= 95 && L <= 210) {
        var tone = blockToneFor(el);
        if (tone === 'light') el.style.setProperty('color', L > 165 ? '#5a6070' : '#4a4f57', 'important');
      }
    }
  }
  function blockToneFor(el) {
    for (var e = el; e && e !== D.documentElement; e = e.parentElement) {
      var cs = getComputedStyle(e);
      if (cs.backgroundImage && cs.backgroundImage !== 'none') return 'dark';
      var c = parse(cs.backgroundColor);
      if (c && c.a >= 0.85) return lum(c) > 200 ? 'light' : 'dark';
    }
    return 'light';
  }

  /* ---------- Tickers: one calm, steady speed ---------- */
  function calmTickers() {
    D.querySelectorAll('.mt,.trust-track,.ft-track').forEach(function (t) {
      var cs = getComputedStyle(t);
      if (!cs.animationName || cs.animationName === 'none') return;
      var dist = t.scrollWidth / 2;
      if (dist > 200) t.style.setProperty('animation-duration', Math.max(30, dist / 26).toFixed(1) + 's', 'important');
    });
  }

  /* ---------- Service pages: other services in one scrolling row ---------- */
  var ARROW_L = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6"/></svg>';
  var ARROW_R = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 18l6-6-6-6"/></svg>';
  function buildRails() {
    D.querySelectorAll('.other-grid, [data-fz-rail]').forEach(function (grid) {
      if (grid.closest('.fz-rail')) return;
      var cards = [].slice.call(grid.children);
      if (cards.length < 3) return;
      var rail = D.createElement('div'); rail.className = 'fz-rail';
      var vp = D.createElement('div'); vp.className = 'fz-rail-viewport';
      var lbl = grid.getAttribute('data-fz-rail') || 'More Favze services';
      vp.setAttribute('role', 'region'); vp.setAttribute('aria-label', lbl); vp.tabIndex = 0;
      grid.parentNode.insertBefore(rail, grid);
      vp.appendChild(grid); rail.appendChild(vp);
      cards.forEach(function (c) {
        var k = c.cloneNode(true); k.setAttribute('aria-hidden', 'true'); k.setAttribute('tabindex', '-1');
        k.querySelectorAll('a,button').forEach(function (x) { x.setAttribute('tabindex', '-1'); });
        grid.appendChild(k);
      });
      var btns = D.createElement('div'); btns.className = 'fz-rail-btns';
      btns.innerHTML = '<button type="button" class="fz-rail-btn" aria-label="Previous: ' + lbl + '">' + ARROW_L + '</button><button type="button" class="fz-rail-btn" aria-label="Next: ' + lbl + '">' + ARROW_R + '</button>';
      rail.appendChild(btns);
      var pos = 0, hover = false, anim = null, holdUntil = 0;
      function half() { return grid.scrollWidth / 2; }
      function wrap() { var h = half(); if (h > 0) { while (pos >= h) pos -= h; while (pos < 0) pos += h; } }
      function step() { var c = grid.firstElementChild; return c ? c.getBoundingClientRect().width + 16 : 296; }
      function glide(delta) {
        var from = pos, start = null, dur = 450;
        anim = function (t) {
          if (start === null) start = t;
          var p = Math.min(1, (t - start) / dur), e = 1 - Math.pow(1 - p, 3);
          pos = from + delta * e; wrap(); vp.scrollLeft = pos;
          if (p < 1) requestAnimationFrame(anim); else { anim = null; holdUntil = Date.now() + 2500; }
        };
        requestAnimationFrame(anim);
      }
      btns.children[0].addEventListener('click', function () { glide(-step()); });
      btns.children[1].addEventListener('click', function () { glide(step()); });
      rail.addEventListener('mouseenter', function () { hover = true; });
      rail.addEventListener('mouseleave', function () { hover = false; });
      rail.addEventListener('focusin', function () { hover = true; });
      rail.addEventListener('focusout', function () { hover = false; });
      vp.addEventListener('touchstart', function () { holdUntil = Date.now() + 4000; }, { passive: true });
      vp.addEventListener('scroll', function () { if (!anim && Math.abs(vp.scrollLeft - pos) > 2) { pos = vp.scrollLeft; wrap(); } }, { passive: true });
      if (reduceMotion) return;
      var last = null;
      (function tick(t) {
        if (last !== null && !anim && !hover && Date.now() > holdUntil && !H.classList.contains('fz-still')) {
          pos += Math.min(64, t - last) * 0.028; wrap(); vp.scrollLeft = pos;
        }
        last = t; requestAnimationFrame(tick);
      })(performance.now());
    });
  }

  /* ---------- Cursor: dot and ring ---------- */
  function cursor() {
    if (!window.matchMedia || !matchMedia('(hover:hover) and (pointer:fine)').matches) return;
    var dot = D.createElement('div'), ring = D.createElement('div');
    dot.className = 'fz-dot'; ring.className = 'fz-ring';
    dot.setAttribute('aria-hidden', 'true'); ring.setAttribute('aria-hidden', 'true');
    D.body.appendChild(ring); D.body.appendChild(dot); H.classList.add('fz-cur');
    var x = -100, y = -100, rx = -100, ry = -100;
    var HOVER = 'a,button,[role="button"],input,select,textarea,label,summary,.other-card,.fz-rail-btn';
    D.addEventListener('mousemove', function (e) {
      x = e.clientX; y = e.clientY;
      dot.style.transform = 'translate3d(' + x + 'px,' + y + 'px,0)';
      if (!H.classList.contains('fz-cur-on')) { rx = x; ry = y; H.classList.add('fz-cur-on'); }
    }, { passive: true });
    D.addEventListener('mouseover', function (e) {
      var t = e.target;
      if (t.tagName === 'IFRAME') { H.classList.remove('fz-cur-on'); return; }
      ring.classList.toggle('is-hover', !!(t.closest && t.closest(HOVER)));
    }, { passive: true });
    D.addEventListener('mousedown', function () { ring.classList.add('is-down'); });
    D.addEventListener('mouseup', function () { ring.classList.remove('is-down'); });
    H.addEventListener('mouseleave', function () { H.classList.remove('fz-cur-on'); });
    D.addEventListener('touchstart', function () { H.classList.remove('fz-cur-on'); }, { passive: true });
    D.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse') H.classList.remove('fz-cur-on'); }, { passive: true });
    (function loop() {
      var k = reduceMotion ? 1 : 0.2;
      rx += (x - rx) * k; ry += (y - ry) * k;
      ring.style.transform = 'translate3d(' + rx.toFixed(2) + 'px,' + ry.toFixed(2) + 'px,0)';
      requestAnimationFrame(loop);
    })();
  }

  /* ---------- Tally forms ---------- */
  function loadTally() {
    D.querySelectorAll('iframe[data-tally-src*="aQjrzb"]').forEach(function (fr) {
      if (fr.nextElementSibling && fr.nextElementSibling.classList.contains('fz-form-scroll-hint')) return;
      var h = D.createElement('p'); h.className = 'fz-form-scroll-hint';
      h.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M12 4v16M7 9l5-5 5 5M7 15l5 5 5-5"/></svg>Scroll inside the form to see every question';
      fr.parentNode.insertBefore(h, fr.nextSibling);
    });
    if (!D.querySelector('iframe[data-tally-src]')) return;
    var w = 'https://tally.so/widgets/embed.js';
    var v = function () {
      if (typeof window.Tally !== 'undefined') window.Tally.loadEmbeds();
      else D.querySelectorAll('iframe[data-tally-src]:not([src])').forEach(function (e) { e.src = e.dataset.tallySrc; });
    };
    if (typeof window.Tally !== 'undefined') v();
    else if (!D.querySelector('script[src="' + w + '"]')) { var s = D.createElement('script'); s.src = w; s.onload = v; s.onerror = v; D.body.appendChild(s); }
    else setTimeout(v, 1500);
  }

  /* ---------- Google Analytics click and form tracking ---------- */
  function track(name, params) {
    params = params || {};
    params.page_path = location.pathname;
    if (typeof window.gtag === 'function') window.gtag('event', name, params);
    else (window.dataLayer = window.dataLayer || []).push(Object.assign({ event: name }, params));
  }
  function clickTracking() {
    D.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a[href]');
      if (!a) return;
      var href = a.getAttribute('href') || '';
      var label = (a.textContent || a.getAttribute('aria-label') || '').replace(/\s+/g, ' ').trim().slice(0, 80);
      var p = { link_text: label, link_url: href };
      if (/^tel:/i.test(href)) return track('call_click', p);
      if (/^sms:/i.test(href)) return track('text_click', p);
      if (/^mailto:/i.test(href)) return track('email_click', p);
      if (/free-consultation|tally\.so\/r\/aQjrzb/i.test(href)) {
        if (a.closest('.fz-mbar')) return track('consult_mobile_bar_click', p);
        if (a.closest('nav')) return track('consult_nav_click', p);
        if (a.closest('footer')) return track('consult_footer_click', p);
        return track('consult_page_click', p);
      }
      if (/tally\.so\/r\/Gxg47Z/i.test(href)) return track('newsletter_link_click', p);
    }, true);
    window.addEventListener('message', function (e) {
      if (!/tally\.so$/.test((e.origin || '').replace(/^https?:\/\//, ''))) return;
      var d = e.data;
      if (typeof d === 'string') { try { d = JSON.parse(d); } catch (x) { return; } }
      if (!d || d.event !== 'Tally.FormSubmitted') return;
      var id = (d.payload && d.payload.formId) || '';
      if (id === 'aQjrzb') track('generate_lead', { form_name: 'free_consultation' });
      else if (id === 'Gxg47Z') track('newsletter_signup', { form_name: 'newsletter' });
      else track('form_submit', { form_name: id });
    });
  }

  /* ---------- Keep one H1 per page: the cookie preferences title becomes an H2 ---------- */
  function cookieHeading() {
    var fix = function () {
      D.querySelectorAll('#stcm-modal h1, #stcm-wrapper h1').forEach(function (h) {
        var n = D.createElement('h2');
        n.className = 'stcm-title';
        n.innerHTML = h.innerHTML;
        h.parentNode.replaceChild(n, h);
      });
    };
    fix();
    new MutationObserver(fix).observe(D.body, { childList: true, subtree: true });
  }

  /* ---------- Readability floor: no text smaller than 11.5px (labels) or 12.5px (sentences) ---------- */
  function readableText() {
    var els = D.body.querySelectorAll('body *:not(svg):not(svg *):not(script):not(style)');
    for (var i = 0; i < els.length; i++) {
      var e = els[i], own = false;
      for (var n = e.firstChild; n; n = n.nextSibling) { if (n.nodeType === 3 && n.textContent.trim().length > 1) { own = true; break; } }
      if (!own) continue;
      var c = getComputedStyle(e), fs = parseFloat(c.fontSize);
      if (!fs || fs >= 11.5) continue;
      var min = c.textTransform === 'uppercase' ? 11.5 : 12.5;
      if (fs < min) e.style.setProperty('font-size', min + 'px', 'important');
    }
  }

  /* ---------- Pause animations control (WCAG 2.2.2): footer button, remembered per visitor ---------- */
  function motionToggle() {
    var KEY = 'fz-still', still = false;
    try { still = localStorage.getItem(KEY) === '1'; } catch (e) {}
    if (still) H.classList.add('fz-still');
    var bot = D.querySelector('footer.ft-std .fb-bot');
    if (!bot) return;
    var btn = D.createElement('button');
    btn.type = 'button'; btn.className = 'fz-motion';
    var label = function () { var on = H.classList.contains('fz-still'); btn.textContent = on ? 'Play animations' : 'Pause animations'; btn.setAttribute('aria-pressed', on ? 'true' : 'false'); };
    label();
    btn.addEventListener('click', function () {
      H.classList.toggle('fz-still');
      try { localStorage.setItem(KEY, H.classList.contains('fz-still') ? '1' : '0'); } catch (e) {}
      label();
    });
    var links = bot.querySelector('div:last-child') || bot;
    links.appendChild(btn);
  }
  /* ---------- Skip link moves focus into the main content ---------- */
  function skipLink() {
    var a = D.querySelector('.fz-skip'); if (!a) return;
    a.addEventListener('click', function () {
      var t = D.getElementById((a.getAttribute('href') || '').slice(1));
      if (t) { if (!t.hasAttribute('tabindex')) t.setAttribute('tabindex', '-1'); t.focus(); }
    });
  }

  /* ---------- Menu button always reports open/closed to screen readers ---------- */
  function menuState() {
    var hb = D.getElementById('hb'), mm = D.getElementById('mm');
    if (!hb || !mm) return;
    hb.setAttribute('aria-controls', 'mm');
    var sync = function () {
      var open = mm.classList.contains('open') || mm.classList.contains('active') || mm.classList.contains('show');
      hb.setAttribute('aria-expanded', open ? 'true' : 'false');
      hb.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
      if (mm.hasAttribute('aria-hidden')) mm.setAttribute('aria-hidden', open ? 'false' : 'true');
    };
    sync();
    if (window.MutationObserver) new MutationObserver(sync).observe(mm, { attributes: true, attributeFilter: ['class'] });
  }

  /* ---------- WCAG 2.2 AA contrast: brand colors only (navy, teal, black, white, greys) ---------- */
  function relLum(c) {
    var f = function (v) { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
    return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b);
  }
  function ratio(a, b) { var x = relLum(a), y = relLum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); }
  function blend(top, under) { var a = top.a; return { r: top.r * a + under.r * (1 - a), g: top.g * a + under.g * (1 - a), b: top.b * a + under.b * (1 - a), a: 1 }; }
  function effectiveBg(el) {
    var layers = [];
    for (var e = el; e && e.nodeType === 1; e = e.parentElement) {
      var cs = getComputedStyle(e);
      var bi = cs.backgroundImage;
      if (bi && bi !== 'none') {
        if (/url\(/.test(bi)) return null;
        var cols = (bi.match(/rgba?\([^)]*\)/g) || []).map(parse).filter(Boolean);
        var solid = cols.filter(function (c) { return c.a >= 0.5; }); if (solid.length) cols = solid;
        if (cols.length) {
          var avg = cols.reduce(function (s, c) { return { r: s.r + c.r / cols.length, g: s.g + c.g / cols.length, b: s.b + c.b / cols.length, a: s.a + c.a / cols.length }; }, { r: 0, g: 0, b: 0, a: 0 });
          layers.push(avg); if (avg.a >= 0.95) break;
        }
      }
      var c = parse(cs.backgroundColor);
      if (c && c.a > 0) { layers.push(c); if (c.a >= 0.95) break; }
    }
    var base = { r: 255, g: 255, b: 255, a: 1 };
    for (var i = layers.length - 1; i >= 0; i--) base = blend(layers[i], base);
    return base;
  }
  var NAVY = { r: 6, g: 65, b: 135, a: 1 }, TEAL_LIGHT = 'rgb(127,216,234)';
  function rgbOf(v) { var h = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(v); return h ? { r: parseInt(h[1], 16), g: parseInt(h[2], 16), b: parseInt(h[3], 16), a: 1 } : parse(v); }
  function wcagContrast() {
    var els = D.body.querySelectorAll('body *:not(script):not(style):not(svg):not(svg *)');
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      if (!ownText(el) || el.closest('#stcm-wrapper,.fz-mbar,.fz-skip,.fzd,.fz-own,.fz-goals,.vis-sec,.fz-smband,.fz-nl-duo,.fz-cta-band,.fz-cluster,.rs-sec,.rs-hero,.fz-about-band,.svc-grid,.sm-wrap,.fz-org')) continue;
      var cs = getComputedStyle(el);
      var fg = parse(cs.color); if (!fg || fg.a === 0) continue;
      var bg = effectiveBg(el); if (!bg) continue;
      var col = blend(fg, bg), cr = ratio(col, bg);
      var fs = parseFloat(cs.fontSize), bold = parseInt(cs.fontWeight, 10) >= 700;
      var large = fs >= 24 || (bold && fs >= 18.66);
      var need = large ? 3 : 4.5;
      if (cr >= need + 0.15) continue;
      var txt = el.textContent.trim();
      /* Decorative numbers (01, 02, 03 watermarks) become pure decoration, read from the page by nobody */
      if (/^(0?\d{1,2}|[A-Z]{2,4})$/.test(txt) && !el.closest('a,button,label,[tabindex]') && (cr < 1.8 || el.getAttribute('aria-hidden') === 'true')) {
        el.setAttribute('aria-hidden', 'true'); el.setAttribute('data-fz-wm', txt); el.classList.add('fz-wm'); el.textContent = '';
        continue;
      }
      var darkBg = relLum(bg) < 0.18;
      var ownBg = parse(cs.backgroundColor);
      var saturated = !neutral(col);
      var pick;
      if (ownBg && ownBg.a >= 0.95 && !neutral(ownBg) && !darkBg && relLum(ownBg) > 0.12) {
        /* Small white text on a teal button: the button turns navy */
        el.style.setProperty('background-color', 'rgb(6,65,135)', 'important');
        if (ratio(parse(cs.color), NAVY) >= need) continue;
        pick = '#ffffff';
      } else if (darkBg) {
        pick = saturated ? TEAL_LIGHT : '#b8bcc4';
        if (ratio(rgbOf(pick), bg) < need) pick = '#ffffff';
      } else {
        pick = saturated ? '#064187' : '#3d4148';
        if (ratio(rgbOf(pick), bg) < need) pick = '#0a0a0a';
      }
      el.style.setProperty('color', pick, 'important');
    }
  }
  /* Links sitting inside sentences get an underline so they never depend on color alone */
  function inlineLinks() {
    D.querySelectorAll('main a:not([class]), footer .fb-desc a, footer p a').forEach(function (a) {
      var p = a.parentElement; if (!p) return;
      var has = false;
      for (var n = p.firstChild; n; n = n.nextSibling) if (n.nodeType === 3 && n.textContent.trim().length > 2) { has = true; break; }
      if (has) { a.style.setProperty('text-decoration', 'underline', 'important'); a.style.setProperty('text-underline-offset', '3px', 'important'); }
    });
  }
  /* Scrolling tables and comparison boxes can be reached and scrolled with a keyboard */
  function scrollRegions() {
    D.querySelectorAll('table, [class*="wrap"], [class*="scroll"], [class*="table"]').forEach(function (el) {
      if (el.closest('.fz-rail,nav,footer,.mm')) return;
      var cs = getComputedStyle(el);
      if (!/(auto|scroll)/.test(cs.overflowX + cs.overflowY)) return;
      if (el.scrollWidth <= el.clientWidth + 2 && el.scrollHeight <= el.clientHeight + 2) return;
      if (el.querySelector('a,button,input,select,textarea,[tabindex]')) return;
      el.setAttribute('tabindex', '0');
      if (!el.hasAttribute('role')) el.setAttribute('role', 'region');
      if (!el.hasAttribute('aria-label')) el.setAttribute('aria-label', 'Scrollable content');
    });
  }

  function run(fn) { try { fn(); } catch (e) { if (window.console) console.warn('fz-site:', e); } }
  H.classList.add('fz-boot');
  var unboot = function () { setTimeout(function () { H.classList.remove('fz-boot'); }, 60); };
  run(cookieHeading);
  run(motionToggle);
  run(skipLink);
  run(menuState);
  run(readableText);
  window.addEventListener('load', function () { run(readableText); run(wcagContrast); run(scrollRegions); run(inlineLinks); unboot(); });
  if (D.readyState === 'complete') unboot();
  run(clickTracking);
  run(themeSections);
  run(contrastPass);
  run(wcagContrast);
  run(scrollRegions);
  run(inlineLinks);
  (function watchNew() {
    var m = D.querySelector('main'); if (!m || !window.MutationObserver) return;
    var t = null;
    new MutationObserver(function (ms) { if (ms.every(function (x) { var n = x.target.nodeType === 1 ? x.target : x.target.parentNode; return n && n.closest && n.closest('.fzd'); })) return; clearTimeout(t); t = setTimeout(function () { run(readableText); run(wcagContrast); run(inlineLinks); }, 250); })
      .observe(m, { childList: true, subtree: true });
  })();
  run(buildRails);
  run(cursor);
  run(loadTally);
  if (D.readyState === 'complete') run(calmTickers); else window.addEventListener('load', function () { run(calmTickers); });
})();
