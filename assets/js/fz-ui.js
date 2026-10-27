/* Favze interactive components: quotes, tap-to-chat, side nav, reason picker, service visuals, 3D objects.
   Everything here adds motion on top of real page text, so search engines and AI tools can read every page. */
(function () {
  'use strict';
  var D = document, H = D.documentElement;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia && matchMedia('(hover:hover) and (pointer:fine)').matches;
  var B = 'https://favze.com/';
  function track(name, params) {
    params = params || {}; params.page_path = location.pathname;
    if (typeof window.gtag === 'function') window.gtag('event', name, params);
    else (window.dataLayer = window.dataLayer || []).push(Object.assign({ event: name }, params));
  }
  function run(fn) { try { fn(); } catch (e) { if (window.console) console.warn('fz-ui:', e); } }
  function inView(el, cls, opts) {
    if (!('IntersectionObserver' in window)) { el.classList.add(cls); return; }
    new IntersectionObserver(function (es) { es.forEach(function (e) { e.target.classList.toggle(cls, e.isIntersecting); }); }, opts || { rootMargin: '80px' }).observe(el);
  }
  var ARROW = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  /* ---------- Quote scroller: seamless loop, pauses on hover, focus or tap ---------- */
  function philo() {
    D.querySelectorAll('.fz-philo-rail, .fz-areas').forEach(function (rail) {
      var track = rail.querySelector('.fz-philo-track, .fz-areas-track'); if (!track || track.dataset.cloned) return;
      [].slice.call(track.children).forEach(function (li) {
        var c = li.cloneNode(true); c.setAttribute('aria-hidden', 'true');
        c.querySelectorAll('a,button').forEach(function (a) { a.setAttribute('tabindex', '-1'); });
        track.appendChild(c);
      });
      track.dataset.cloned = '1';
      rail.addEventListener('click', function (e) { if (!e.target.closest('a')) rail.classList.toggle('is-paused'); });
      inView(rail, 'is-visible');
      track.style.animationPlayState = 'paused';
      new IntersectionObserver(function (es) { es.forEach(function (e) { track.style.animationPlayState = e.isIntersecting ? '' : 'paused'; }); }).observe(rail);
    });
  }

  /* ---------- Side navigation on service pages (tablet and computer) ---------- */
  var COMPASS = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="9.5" stroke="currentColor" stroke-width="2"/><path d="M15.6 8.4l-2.1 5.1-5.1 2.1 2.1-5.1z" fill="currentColor"/></svg>';
  var SHORT = [
    [/^(what made you look|why are you looking)/i, 'Your Goals'], [/faq|frequently asked/i, 'FAQ'], [/pricing/i, 'Pricing'],
    [/fractional cmo/i, 'Your CMO'], [/insights before/i, 'Newsletter'], [/tips from favze insights/i, 'Insights'],
    [/articles & guides/i, 'Guides'], [/^pair /i, 'Pair With'], [/more digital marketing services/i, 'More Services'],
    [/^favze .*vs\.|vs\. generic/i, 'Why Favze'], [/local service ads/i, 'Ads vs LSAs'], [/aeo vs\. seo/i, 'AEO vs SEO'],
    [/three layers/i, 'SEO, AEO, GEO'], [/aeo \+ geo/i, 'AEO + GEO'], [/technical, on-page/i, 'SEO Types'],
    [/process|step by step|launches your/i, 'Process'], [/results/i, 'Results'], [/problems|concerns/i, 'Problems Solved'],
    [/by industry|every northern indiana industry|benefit most/i, 'Industries'], [/automation statistics/i, 'Automation ROI'], [/statistics/i, 'Stats & ROI'], [/roi/i, 'ROI'],
    [/^what is /i, 'What It Is'], [/includes|included|every part|what favze does|12 pillars/i, "What's Included"],
    [/platforms|every platform|chatgpt, perplexity|featured snippets, ai|facebook, instagram, tiktok/i, 'Platforms'],
    [/where aeo gets/i, 'Where It Shows'], [/complian/i, 'Compliance'], [/deliverability/i, 'Deliverability'],
    [/automation services/i, 'Automation'], [/ranking factors/i, 'Ranking Factors'], [/map pack/i, 'Map Pack'],
    [/how long/i, 'Timeline'], [/content strategy/i, 'Content'], [/ownership/i, 'Ownership'], [/principles/i, 'Principles'],
    [/compatible/i, 'Every Inbox'], [/ai search optimization for local/i, 'AI Search'], [/real reasons/i, 'Why Now'],
    [/^why .*(matter|work)/i, 'Why It Works'], [/ready to/i, "Who It's For"], [/company serving|services across|& michiana$/i, 'Service Area'],
    [/services (for|in|that)/i, 'Services'], [/one goal|one platform|all 4 platforms|two strategies|google maps$|^ai-optimized|works as hard/i, 'Overview']
  ];
  function shortLabel(t, used) {
    for (var i = 0; i < SHORT.length; i++) { if (SHORT[i][0].test(t) && !used[SHORT[i][1]]) return SHORT[i][1]; }
    var w = t.replace(/[:?].*$/, '').split(' ').slice(0, 3).join(' ');
    return used[w] ? t.split(' ').slice(0, 4).join(' ') : w;
  }
  function sidenav() {
    if (!/\/services\/[a-z-]+(\.html)?$/.test(location.pathname)) return;
    var secs = [].slice.call(D.querySelectorAll('main > section')).filter(function (s) {
      return s.querySelector('h2') && !s.classList.contains('fz-form-sec') && s.offsetHeight > 380;
    });
    if (secs.length < 4) return;
    var nav = D.createElement('div'); nav.className = 'fz-sidenav'; nav.setAttribute('role', 'navigation'); nav.setAttribute('aria-label', 'Sections on this page');
    nav.setAttribute('data-nosnippet', '');
    var ol = D.createElement('ol');
    var hero = D.querySelector('main .hero');
    var used = {};
    var items = (hero ? [{ el: hero, label: 'Top' }] : []).concat(secs.map(function (s) {
      var t = s.querySelector('h2').textContent.replace(/\s+/g, ' ').trim();
      var l = shortLabel(t, used); used[l] = 1;
      return { el: s, label: l, full: t };
    }));
    var DROP = ['Insights', 'Newsletter', 'Guides', 'Every Inbox', 'More Services', 'Service Area', 'Pair With', 'Your CMO'];
    for (var di = 0; items.length > 15 && di < DROP.length; di++) items = items.filter(function (it) { return it.label !== DROP[di]; });
    while (items.length > 15) { var cut = -1; for (var k = items.length - 1; k > 1; k--) { if (!/^(FAQ|Pricing|Process|Your Goals)$/.test(items[k].label)) { cut = k; break; } } if (cut < 0) break; items.splice(cut, 1); }
    items.forEach(function (it, i) {
      if (!it.el.id) it.el.id = 'sec-' + (i + 1);
      var li = D.createElement('li'), a = D.createElement('a');
      a.href = '#' + it.el.id; a.innerHTML = '<span>' + it.label.replace(/</g, '&lt;') + '</span><i></i>';
      if (it.full) a.title = it.full;
      a.addEventListener('click', function (e) { e.preventDefault(); it.el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' }); history.replaceState(null, '', '#' + it.el.id); track('side_nav_click', { section: it.label }); });
      li.appendChild(a); ol.appendChild(li); it.a = a;
    });
    nav.appendChild(ol);
    var svc = (location.pathname.match(/services\/([a-z-]+)/) || [])[1] || '';
    var cta = D.createElement('a'); cta.className = 'fz-sidenav-cta';
    cta.href = B + 'service-match?from=side-nav&service=' + svc;
    cta.innerHTML = '<span><b>Find My Service</b><small>Free 60-second quiz</small></span><i>' + COMPASS + '</i>';
    cta.setAttribute('aria-label', 'Find My Service: take the free Service Match quiz');
    cta.addEventListener('click', function () { track('side_nav_click', { section: 'Service Match' }); track('service_match_entry', { sm_entry: 'side-nav', service: svc }); });
    nav.appendChild(cta);
    D.body.appendChild(nav);
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { items.forEach(function (it) { it.a.classList.toggle('is-on', it.el === e.target); }); } });
    }, { rootMargin: '-45% 0px -50% 0px' });
    items.forEach(function (it) { io.observe(it.el); });
    /* Peek open once after the hero so visitors see the labels, then tuck away */
    var peeked = false;
    function peek() {
      if (peeked || window.scrollY < innerHeight * 0.8) return; peeked = true;
      nav.classList.add('is-peek'); setTimeout(function () { nav.classList.remove('is-peek'); }, 3200);
      window.removeEventListener('scroll', peek);
    }
    window.addEventListener('scroll', peek, { passive: true });
  }

  /* ---------- "Why are you looking?" picks: tracked, and carried to the consultation page ---------- */
  function reasons() {
    D.addEventListener('click', function (e) {
      var a = e.target.closest('a[data-fz-reason]'); if (!a) return;
      track('consult_reason_click', { service: a.getAttribute('data-fz-service') || '', reason: a.getAttribute('data-fz-reason') });
    });
    D.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a[data-sm-entry]'); if (!a) return;
      track('service_match_entry', { sm_entry: a.getAttribute('data-sm-entry') });
    });
    if (!/free-consultation/.test(location.pathname)) return;
    var q = new URLSearchParams(location.search), reason = q.get('reason'), service = q.get('service');
    if (!reason && !service) return;
    var label = (q.get('why') || reason || '').replace(/[-_]/g, ' ');
    var svc = (service || '').replace(/[-_]/g, ' ');
    D.querySelectorAll('iframe[data-tally-src*="aQjrzb"]').forEach(function (fr) {
      var src = fr.getAttribute('data-tally-src');
      var add = (service ? '&service=' + encodeURIComponent(service) : '') + (reason ? '&reason=' + encodeURIComponent(reason) : '');
      fr.setAttribute('data-tally-src', src + add);
      if (fr.src) fr.src = fr.src + add;
    });
    var card = D.querySelector('#consultation-form') || D.querySelector('.fz-form-card');
    if (card && label) {
      var p = D.createElement('p'); p.className = 'fz-picked';
      p.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0A89A3" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg><span>You picked <b>' + label.replace(/</g, '&lt;') + '</b>' + (svc ? ' for <b>' + svc.replace(/</g, '&lt;') + '</b>' : '') + '. Riley will start there.</span>';
      card.insertBefore(p, card.firstChild);
    }
  }

  /* ---------- Animated mini visuals for each part of a service ---------- */
  var W = 240, Hh = 132;
  function svg(inner) { return '<svg class="fz-mini" viewBox="0 0 ' + W + ' ' + Hh + '" aria-hidden="true" focusable="false"><rect class="bg" width="' + W + '" height="' + Hh + '" rx="18"/>' + inner + '</svg>'; }
  var MINI = {
    inbox: function () {
      var rows = [['Delivered', 'All sent', 'good'], ['Spam', '0', 'teal'], ['Bounces', '0', 'teal'], ['Reports', '0', 'teal']];
      return svg('<text x="18" y="26" class="ink" font-size="12" font-weight="800">Campaign inbox</text>' +
        rows.map(function (r, i) { var y = 40 + i * 21; return '<g class="anim-fade d' + (i + 1) + '"><rect x="16" y="' + y + '" width="208" height="17" rx="8.5" class="white"/><circle cx="28" cy="' + (y + 8.5) + '" r="4" class="' + r[2] + '"/><text x="40" y="' + (y + 12) + '" class="ink" font-size="10.5" font-weight="600">' + r[0] + '</text><text x="214" y="' + (y + 12) + '" text-anchor="end" class="' + (r[2] === 'good' ? 'good' : 'navy') + '" font-size="10.5" font-weight="800">' + r[1] + '</text></g>'; }).join(''));
    },
    stars: function () {
      var st = '';
      for (var i = 0; i < 5; i++) st += '<path class="gold anim-pop d' + (i + 1) + '" transform="translate(' + (34 + i * 36) + ',38) scale(1.25)" d="M10 0l3 6.5 7 .8-5.2 4.8 1.5 7L10 15.6 3.7 19.1l1.5-7L0 7.3l7-.8z"/>';
      return svg(st + '<rect x="40" y="82" width="160" height="30" rx="15" class="white"/><text x="120" y="101" text-anchor="middle" class="ink" font-size="11.5" font-weight="700">New 5-star review</text>');
    },
    map: function () {
      return svg('<path d="M0 46h240M0 90h240M70 0v132M170 0v132" stroke="#dbe3ea" stroke-width="10"/><circle cx="70" cy="46" r="5" class="soft"/><circle cx="170" cy="90" r="5" class="soft"/><circle cx="120" cy="68" r="14" class="teal anim-pulse" opacity=".4"/><path class="navy anim-up" d="M120 36c-10 0-17 7-17 16 0 12 17 28 17 28s17-16 17-28c0-9-7-16-17-16z"/><circle cx="120" cy="52" r="6" class="white anim-up"/><rect x="146" y="14" width="80" height="22" rx="11" class="white anim-fade"/><text x="186" y="29" text-anchor="middle" class="navy anim-fade" font-size="10.5" font-weight="800">You, #1 nearby</text>');
    },
    rank: function () {
      return svg('<text x="18" y="24" class="ink" font-size="11.5" font-weight="800">Search results</text>' +
        [0, 1, 2].map(function (i) { return '<rect x="18" y="' + (36 + i * 30) + '" width="204" height="22" rx="11" class="white"/><rect x="30" y="' + (44 + i * 30) + '" width="' + (110 - i * 14) + '" height="6" rx="3" class="line"/>'; }).join('') +
        '<g class="anim-up" style="transform-box:view-box"><rect x="14" y="96" width="212" height="26" rx="13" class="navy"/><text x="30" y="113" class="white" font-size="11" font-weight="800">#1 Your business</text></g>');
    },
    search: function () {
      return svg('<rect x="16" y="22" width="208" height="30" rx="15" class="white"/><circle cx="34" cy="37" r="6" fill="none" class="s-navy" stroke-width="2"/><text x="48" y="41" class="ink anim-fade" font-size="11" font-weight="600">best roofer near me</text><rect x="16" y="64" width="208" height="20" rx="10" class="white anim-fade d2"/><text x="28" y="78" class="navy anim-fade d2" font-size="10.5" font-weight="800">Your business: open now</text><rect x="16" y="92" width="160" height="10" rx="5" class="line anim-fade d3"/><rect x="16" y="108" width="120" height="10" rx="5" class="line anim-fade d4"/>');
    },
    code: function () {
      return svg('<rect x="14" y="14" width="212" height="104" rx="12" fill="#0e1520"/>' +
        ['{ "@type": "LocalBusiness",', '  "name": "Your Business",', '  "areaServed": "Michiana",', '  "telephone": "574-..." }'].map(function (l, i) { return '<text x="26" y="' + (38 + i * 20) + '" class="anim-fade d' + (i + 1) + '" fill="' + (i === 0 ? '#7fd8ea' : '#e3e7ec') + '" font-family="ui-monospace,monospace" font-size="10.5">' + l.replace(/"/g, '&quot;') + '</text>'; }).join(''));
    },
    answer: function () {
      return svg('<rect x="16" y="16" width="208" height="26" rx="13" class="white"/><text x="28" y="33" class="soft" font-size="10.5" font-weight="600">Q: How often should I service my AC?</text><g class="anim-fade d2"><rect x="16" y="50" width="208" height="66" rx="14" class="navy"/><text x="28" y="70" class="white" font-size="10.5" font-weight="800">Featured answer</text><rect x="28" y="80" width="180" height="6" rx="3" fill="#ffffff" opacity=".55"/><rect x="28" y="92" width="150" height="6" rx="3" fill="#ffffff" opacity=".4"/><text x="28" y="110" fill="#7fd8ea" font-size="9.5" font-weight="700">Source: your website</text></g>');
    },
    ai: function () {
      return svg('<rect x="16" y="14" width="150" height="26" rx="13" class="line"/><text x="28" y="31" class="ink" font-size="10.5" font-weight="600">Who is the best bakery here?</text><g class="anim-fade d2"><rect x="56" y="48" width="168" height="44" rx="14" class="white"/><text x="68" y="66" class="ink" font-size="10.5" font-weight="600">Locals recommend</text><text x="68" y="82" class="navy" font-size="11" font-weight="800">Your Business</text></g><g class="anim-pop d3"><rect x="140" y="100" width="84" height="20" rx="10" class="teal"/><text x="182" y="114" text-anchor="middle" class="white" font-size="9.5" font-weight="800">Cited source</text></g>');
    },
    voice: function () {
      var b = '';
      for (var i = 0; i < 13; i++) { var h = [10, 22, 34, 18, 42, 26, 48, 26, 42, 18, 34, 22, 10][i]; b += '<rect class="teal anim-pop d' + (i % 5 + 1) + '" x="' + (52 + i * 11) + '" y="' + (62 - h / 2) + '" width="6" height="' + h + '" rx="3"/>'; }
      return svg(b + '<text x="120" y="118" text-anchor="middle" class="ink" font-size="10.5" font-weight="700">"Hey Siri, who is open near me?"</text>');
    },
    chart: function () {
      return svg('<text x="18" y="24" class="ink" font-size="11.5" font-weight="800">Leads this quarter</text><path d="M20 108H222" stroke="#dbe3ea" stroke-width="2"/><path class="anim-dash" d="M20 100 C60 96 70 82 100 80 S150 58 170 50 S205 30 222 26" fill="none" stroke="#0A89A3" stroke-width="4" stroke-linecap="round"/><circle cx="222" cy="26" r="5" class="navy anim-pop d4"/>');
    },
    segments: function () {
      var c = '', cols = ['navy', 'teal', 'soft'];
      for (var i = 0; i < 18; i++) { var g = i % 3; c += '<circle class="' + cols[g] + ' anim-move" style="--mx:' + ([-40, 0, 40][g]) + 'px" cx="' + (100 + (i % 6) * 8) + '" cy="' + (40 + Math.floor(i / 6) * 22) + '" r="6"/>'; }
      return svg(c + '<text x="40" y="122" class="navy" font-size="10" font-weight="800">New</text><text x="104" y="122" class="teal" font-size="10" font-weight="800">Loyal</text><text x="172" y="122" class="soft" font-size="10" font-weight="800">Quiet</text>');
    },
    flow: function () {
      var n = ['Signs up', 'Welcome', 'Follow-up', 'Buys'];
      return svg('<path d="M40 66H200" stroke="#cfd8e2" stroke-width="3" stroke-dasharray="6 6"/>' + n.map(function (t, i) { var x = 40 + i * 53.3; return '<circle cx="' + x + '" cy="66" r="15" class="' + (i === 3 ? 'teal' : 'navy') + '"/><text x="' + x + '" y="102" text-anchor="middle" class="ink" font-size="9.5" font-weight="700">' + t + '</text>'; }).join('') + '<circle class="white anim-move" style="--mx:160px" cx="40" cy="66" r="5"/>');
    },
    sms: function () {
      return svg('<rect x="16" y="16" width="160" height="38" rx="14" class="white"/><text x="28" y="33" class="ink" font-size="10" font-weight="600">Reminder: 2pm tomorrow.</text><text x="28" y="46" class="ink" font-size="10" font-weight="600">Reply C to confirm</text><g class="anim-pop d2"><rect x="168" y="62" width="56" height="28" rx="14" class="navy"/><text x="196" y="80" text-anchor="middle" class="white" font-size="11" font-weight="800">C</text></g><text x="224" y="106" text-anchor="end" class="good anim-fade d3" font-size="10" font-weight="800">Delivered · Read</text>');
    },
    shield: function () {
      return svg('<path class="navy" d="M120 16l40 14v30c0 28-18 46-40 56-22-10-40-28-40-56V30z"/><path class="anim-dash" d="M104 64l11 11 22-24" fill="none" stroke="#7fd8ea" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/><text x="194" y="60" text-anchor="middle" class="good anim-fade" font-size="10" font-weight="800">Opted in</text><text x="46" y="60" text-anchor="middle" class="good anim-fade d2" font-size="10" font-weight="800">Compliant</text>');
    },
    social: function () {
      return svg('<rect x="40" y="12" width="160" height="108" rx="16" class="white"/><rect x="52" y="24" width="136" height="54" rx="10" class="line"/><circle cx="70" cy="51" r="10" class="teal"/><g class="anim-pop d2"><path class="navy" transform="translate(56,86)" d="M9 16S0 10 0 4.5C0 2 2 0 4.5 0 6.4 0 8 1.2 9 2.8 10 1.2 11.6 0 13.5 0 16 0 18 2 18 4.5 18 10 9 16 9 16z"/></g><text x="82" y="99" class="ink anim-fade d2" font-size="11" font-weight="800">248</text><rect x="122" y="88" width="66" height="16" rx="8" class="teal anim-pop d3"/><text x="155" y="100" text-anchor="middle" class="white anim-pop d3" font-size="9" font-weight="800">New follower</text>');
    },
    ad: function () {
      return svg('<rect x="16" y="18" width="208" height="58" rx="14" class="white"/><rect x="28" y="28" width="56" height="15" rx="7.5" class="line"/><text x="56" y="39" text-anchor="middle" class="ink" font-size="8.5" font-weight="800">Sponsored</text><text x="28" y="60" class="navy" font-size="11.5" font-weight="800">Your Business: Book today</text><g class="anim-move" style="--mx:-60px"><path transform="translate(180,74)" class="ink" d="M0 0l14 34 5-14 14-5z"/></g><rect x="16" y="88" width="98" height="28" rx="14" class="teal anim-pop d3"/><text x="65" y="106" text-anchor="middle" class="white anim-pop d3" font-size="10" font-weight="800">New lead</text>');
    },
    gauge: function () {
      return svg('<path d="M48 102a72 72 0 0 1 144 0" fill="none" stroke="#dfe5ec" stroke-width="14" stroke-linecap="round"/><path class="anim-dash" d="M48 102a72 72 0 0 1 144 0" fill="none" stroke="#0A89A3" stroke-width="14" stroke-linecap="round"/><text x="120" y="96" text-anchor="middle" class="navy" font-size="26" font-weight="900">Fast</text><text x="120" y="122" text-anchor="middle" class="soft" font-size="10" font-weight="700">Page speed</text>');
    },
    devices: function () {
      return svg('<rect x="30" y="22" width="128" height="80" rx="8" class="white" stroke="#cfd8e2" stroke-width="2"/><rect x="40" y="32" width="108" height="16" rx="4" class="navy"/><rect x="40" y="54" width="70" height="6" rx="3" class="line"/><rect x="40" y="66" width="90" height="6" rx="3" class="line"/><g class="anim-up d2"><rect x="168" y="56" width="44" height="66" rx="9" class="ink"/><rect x="172" y="62" width="36" height="54" rx="5" class="white"/><rect x="176" y="68" width="28" height="8" rx="3" class="teal"/></g>');
    },
    palette: function () {
      var c = ['#064187', '#0A89A3', '#0a0a0a', '#7fd8ea', '#f3f6fa'];
      return svg(c.map(function (x, i) { return '<circle class="anim-pop d' + (i + 1) + '" cx="' + (48 + i * 36) + '" cy="56" r="15" fill="' + x + '" stroke="#cfd8e2"/>'; }).join('') + '<rect x="48" y="90" width="144" height="22" rx="11" class="navy anim-fade d3"/><text x="120" y="105" text-anchor="middle" class="white anim-fade d3" font-size="10" font-weight="800">Your brand, everywhere</text>');
    },
    links: function () {
      var pts = [[40, 30], [200, 30], [40, 104], [200, 104], [120, 16]];
      return svg(pts.map(function (p, i) { return '<path class="anim-dash d' + (i + 1) + '" d="M' + p[0] + ' ' + p[1] + 'L120 66" stroke="#0A89A3" stroke-width="2.5" fill="none"/><circle cx="' + p[0] + '" cy="' + p[1] + '" r="9" class="soft"/>'; }).join('') + '<circle cx="120" cy="66" r="20" class="navy"/><text x="120" y="70" text-anchor="middle" class="white" font-size="10" font-weight="800">You</text>');
    },
    listings: function () {
      return svg(['Google', 'Apple Maps', 'Bing', 'Yelp'].map(function (t, i) { var y = 16 + i * 27; return '<rect x="16" y="' + y + '" width="208" height="21" rx="10.5" class="white"/><text x="28" y="' + (y + 14.5) + '" class="ink" font-size="10.5" font-weight="700">' + t + '</text><text x="150" y="' + (y + 14.5) + '" class="soft" font-size="9.5">Same name, phone</text><circle class="good anim-pop d' + (i + 1) + '" cx="212" cy="' + (y + 10.5) + '" r="5"/>'; }).join(''));
    },
    pipeline: function () {
      var cols = ['New', 'Talking', 'Won'];
      return svg(cols.map(function (t, i) { var x = 16 + i * 72; return '<rect x="' + x + '" y="16" width="64" height="100" rx="10" class="white"/><text x="' + (x + 10) + '" y="32" class="soft" font-size="9.5" font-weight="800">' + t + '</text><rect x="' + (x + 8) + '" y="40" width="48" height="16" rx="5" class="line"/>'; }).join('') + '<g class="anim-move" style="--mx:144px"><rect x="24" y="64" width="48" height="18" rx="5" class="navy"/><text x="48" y="77" text-anchor="middle" class="white" font-size="8.5" font-weight="800">New lead</text></g>');
    },
    plug: function () {
      return svg('<rect x="22" y="44" width="70" height="44" rx="12" class="navy"/><text x="57" y="70" text-anchor="middle" class="white" font-size="10" font-weight="800">Email</text><rect x="148" y="44" width="70" height="44" rx="12" class="teal"/><text x="183" y="70" text-anchor="middle" class="white" font-size="10" font-weight="800">SMS</text><path class="anim-dash" d="M92 66H148" stroke="#0a0a0a" stroke-width="3" stroke-dasharray="4 4"/><circle class="good anim-pop d3" cx="120" cy="66" r="8"/><text x="120" y="112" text-anchor="middle" class="ink" font-size="10" font-weight="700">One customer view</text>');
    },
    doc: function () {
      return svg('<rect x="60" y="12" width="120" height="108" rx="12" class="white"/>' + [0, 1, 2, 3, 4].map(function (i) { return '<rect class="anim-grow d' + (i + 1) + '" x="74" y="' + (30 + i * 16) + '" width="' + [92, 80, 88, 60, 72][i] + '" height="7" rx="3.5" fill="' + (i === 0 ? '#064187' : '#cfd8e2') + '"/>'; }).join(''));
    },
    target: function () {
      return svg('<circle cx="120" cy="66" r="48" class="line"/><circle cx="120" cy="66" r="32" class="white"/><circle cx="120" cy="66" r="16" class="teal"/><g class="anim-move" style="--mx:-62px"><path d="M182 66H128" stroke="#064187" stroke-width="4" stroke-linecap="round"/><path class="navy" d="M190 58l-10 8 10 8z"/></g>');
    },
    calendar: function () {
      var c = '';
      for (var i = 0; i < 14; i++) { var x = 30 + (i % 7) * 27, y = 40 + Math.floor(i / 7) * 34; c += '<rect x="' + x + '" y="' + y + '" width="22" height="28" rx="6" class="white"/>' + (i % 3 === 0 ? '<rect class="teal anim-pop d' + (i % 5 + 1) + '" x="' + (x + 4) + '" y="' + (y + 14) + '" width="14" height="8" rx="3"/>' : ''); }
      return svg('<text x="30" y="28" class="ink" font-size="11" font-weight="800">Content calendar</text>' + c);
    },
    radar: function () {
      return svg('<circle cx="120" cy="66" r="50" fill="none" stroke="#cfd8e2" stroke-width="2"/><circle cx="120" cy="66" r="30" fill="none" stroke="#cfd8e2" stroke-width="2"/><g class="anim-spin" style="transform-origin:120px 66px;transform-box:view-box"><path d="M120 66L120 16A50 50 0 0 1 163 41Z" fill="#0A89A3" opacity=".35"/></g><circle cx="148" cy="44" r="5" class="navy anim-pop d2"/><circle cx="100" cy="92" r="5" class="navy anim-pop d4"/>');
    },
    checklist: function () {
      return svg(['Desktop and phone tested', 'Forms send correctly', 'Pages load fast', 'Ready to launch'].map(function (t, i) { var y = 18 + i * 26; return '<rect x="16" y="' + y + '" width="208" height="20" rx="10" class="white"/><circle class="good anim-pop d' + (i + 1) + '" cx="30" cy="' + (y + 10) + '" r="6"/><text x="44" y="' + (y + 14) + '" class="ink" font-size="10.5" font-weight="600">' + t + '</text>'; }).join(''));
    },
    sitemap: function () {
      return svg('<rect x="96" y="14" width="48" height="22" rx="8" class="navy"/><text x="120" y="29" text-anchor="middle" class="wtxt" font-size="9.5" font-weight="800">Home</text>' + [36, 96, 156].map(function (x, i) { return '<path class="anim-dash d' + (i + 1) + '" d="M120 36V52H' + (x + 24) + 'V66" stroke="#0A89A3" stroke-width="2.5" fill="none"/><rect class="anim-pop d' + (i + 1) + '" x="' + x + '" y="66" width="48" height="20" rx="7" fill="#0A89A3"/><text class="anim-pop d' + (i + 1) + '" x="' + (x + 24) + '" y="80" text-anchor="middle" fill="#fff" font-size="9" font-weight="800">' + ['Services', 'About', 'Contact'][i] + '</text>'; }).join('') + '<text x="120" y="112" text-anchor="middle" class="soft" font-size="10" font-weight="700">Easy to find anything in two taps</text>');
    },
    key: function () {
      return svg('<circle cx="86" cy="62" r="24" fill="none" stroke="#064187" stroke-width="10"/><g class="anim-move" style="--mx:12px"><rect x="108" y="56" width="90" height="12" rx="6" class="navy"/><rect x="170" y="66" width="10" height="16" rx="3" class="navy"/><rect x="186" y="66" width="10" height="12" rx="3" class="navy"/></g><text x="120" y="112" text-anchor="middle" class="good anim-fade" font-size="10.5" font-weight="800">You own the site and the logins</text>');
    },
    clock: function () {
      return svg('<circle cx="120" cy="62" r="40" class="white" stroke="#cfd8e2" stroke-width="3"/><g class="anim-spin" style="transform-origin:120px 62px;transform-box:view-box"><path d="M120 62V32" stroke="#064187" stroke-width="5" stroke-linecap="round"/></g><path d="M120 62L140 72" stroke="#0A89A3" stroke-width="4" stroke-linecap="round"/><circle cx="120" cy="62" r="5" class="navy"/><rect x="152" y="96" width="74" height="22" rx="11" class="teal anim-pop d3"/><text x="189" y="111" text-anchor="middle" class="wtxt anim-pop d3" font-size="9.5" font-weight="800">Sent at 7:42am</text>');
    },
    abtest: function () {
      return svg('<rect x="18" y="20" width="96" height="70" rx="12" class="white"/><text x="66" y="44" text-anchor="middle" class="soft" font-size="12" font-weight="900">A</text><rect x="34" y="54" width="64" height="8" rx="4" class="line"/><rect x="126" y="20" width="96" height="70" rx="12" class="navy anim-pop d2"/><text x="174" y="44" text-anchor="middle" class="wtxt" font-size="12" font-weight="900">B</text><rect x="142" y="54" width="64" height="8" rx="4" fill="#7fd8ea"/><text x="174" y="112" text-anchor="middle" class="good anim-fade d3" font-size="10.5" font-weight="800">B wins: more clicks</text>');
    },
    spark: function () {
      return svg('<circle cx="120" cy="66" r="28" class="navy"/><circle cx="120" cy="66" r="28" class="teal anim-pulse" opacity=".5"/><path d="M120 50v32M104 66h32" stroke="#fff" stroke-width="4" stroke-linecap="round"/>');
    }
  };
  var RULES = [
    [/apple maps/, 'map'], [/local service/, 'stars'], [/google search ads|microsoft|bing/, 'ad'], [/marketing hub/, 'flow'], [/service hub/, 'sms'], [/sales hub|crm|contact management/, 'pipeline'],
    [/conditional|dynamic|template/, 'abtest'],
    [/test|qa|launch|quality/, 'checklist'], [/security|protection|ssl|secure|best practice/, 'shield'], [/ownership|access|own /, 'key'],
    [/send time|timing|time pred|when to send/, 'clock'], [/subject line|a\/b|split test|layout|cta optim/, 'abtest'], [/user experience|structure|navigation|architecture|site structure/, 'sitemap'],
    [/personaliz|fatigue|frequency/, 'segments'],
    [/deliver|inbox|list build|email list|healthy email/, 'inbox'], [/review|reputation|star/, 'stars'],
    [/map|geo-target|location|google business|gbp|local ai/, 'map'], [/nap|citation build|listing/, 'listings'],
    [/schema|structured|markup|technical|code/, 'code'], [/snippet|people also ask|answer|faq|position zero/, 'answer'],
    [/voice|conversational|alexa|siri/, 'voice'], [/citation|chatgpt|generative|entity|llm|ai visibility|\bai\b|ai-/, 'ai'],
    [/segment|audience|persona/, 'segments'], [/targeting|retarget/, 'target'],
    [/workflow|automat|sequence|nurture|drip/, 'flow'], [/sms|text|two-way/, 'sms'], [/compliance|opt-in|consent|tcpa/, 'shield'],
    [/integrat|multi-channel|connect/, 'plug'], [/analytic|report|monitor|tracking|measure|continuous|optimization/, 'chart'],
    [/speed|performance|core web|vitals|fast/, 'gauge'], [/mobile|responsive/, 'devices'], [/design|brand|visual|ux|ui/, 'palette'],
    [/backlink|authority|link/, 'links'], [/crm|pipeline|hubspot|sales|deal|contact/, 'pipeline'],
    [/calendar|schedul|posting|content strateg|content creation/, 'calendar'], [/social|community|engagement|follower|influencer/, 'social'],
    [/ad|campaign|ppc|bid|creative|sponsored/, 'ad'], [/keyword|search intent|research/, 'search'], [/seo|rank|search/, 'rank'],
    [/content|copy|blog|writing|article/, 'doc'], [/audit|competit/, 'radar']
  ];
  function pick(title) {
    var t = title.toLowerCase();
    pick.fb = false;
    for (var i = 0; i < RULES.length; i++) if (RULES[i][0].test(t)) return RULES[i][1];
    pick.fb = true;
    var page = (location.pathname.match(/services\/([a-z-]+)/) || [])[1] || '';
    return ({ 'answer-engine-optimization': 'answer', 'generative-engine-optimization': 'ai', 'ai-optimization': 'ai', 'local-seo': 'map', 'search-engine-optimization': 'rank', 'email-marketing': 'inbox', 'short-message-service-sms': 'sms', 'social-media-marketing': 'social', 'paid-social-media-ads': 'ad', 'paid-search-ads': 'ad', 'website-design': 'devices', 'hubspot-setup': 'pipeline' })[page] || 'spark';
  }
  function minis() {
    if (window.fzDemos) return;
    if (!/\/services\/[a-z-]+(\.html)?$/.test(location.pathname)) return;
    var cards = D.querySelectorAll('main .svc-card, main .svc-detail-card, main .service-row, main .why-ai-card, main .exp-card, main .surf-detail-card, main .plat-detail-card');
    var used = {};
    cards.forEach(function (card) {
      if (card.querySelector('.fz-mini')) return;
      if (card.closest('[class*="industr"], .who-section, .why-section, .pain-section')) return;
      var h = card.querySelector('h3, .service-title, .svc-detail-title, .svc-detail-name, .exp-name, .plat-detail-name, .exp-title'); if (!h) return;
      var kind = pick(h.textContent);
      if (used[kind] && pick.fb) { var alts = ['answer', 'ai', 'links', 'radar', 'chart', 'doc', 'search', 'target', 'checklist', 'code', 'flow', 'segments']; for (var q = 0; q < alts.length; q++) if (!used[alts[q]]) { kind = alts[q]; break; } }
      used[kind] = 1;
      var box = D.createElement('div'); box.className = 'fz-mini-box'; box.setAttribute('aria-hidden', 'true');
      box.innerHTML = MINI[kind]();
      var bg = getComputedStyle(card).backgroundColor, m = bg.match(/\d+/g);
      if (m && (0.2126 * m[0] + 0.7152 * m[1] + 0.0722 * m[2]) < 110 && (m[3] === undefined || +m[3] > 0)) card.classList.add('fz-dark-card');
      var hdr = card.querySelector(':scope > .svc-header, :scope > .plat-header');
      var icon = card.querySelector('.svc-icon, .svc-detail-icon, .exp-icon, .service-num');
      if (hdr) { if (icon && hdr.contains(icon)) icon.style.display = 'none'; hdr.parentNode.insertBefore(box, hdr); }
      else if (icon && !card.classList.contains('service-row')) { icon.style.display = 'none'; icon.parentNode.insertBefore(box, icon); }
      else h.parentNode.insertBefore(box, h);
      if (!reduce) { inView(box, 'fz-play'); card.addEventListener('mouseenter', function () { box.classList.remove('fz-play'); void box.offsetWidth; box.classList.add('fz-play'); }); }
      else box.classList.add('fz-still-mini');
    });
  }

  /* ---------- 3D objects follow the cursor; float gently on touch screens ---------- */
  function three() {
    var objs = [].slice.call(D.querySelectorAll('.fz-3d'));
    if (!objs.length) return;
    objs.forEach(function (o) { inView(o, 'fz-play'); });
    if (reduce) return;
    if (!fine) { objs.forEach(function (o) { o.classList.add('is-floating'); }); return; }
    var raf = null, mx = 0, my = 0;
    window.addEventListener('pointermove', function (e) {
      mx = e.clientX; my = e.clientY;
      if (raf) return;
      raf = requestAnimationFrame(function () {
        raf = null;
        if (H.classList.contains('fz-still')) return;
        objs.forEach(function (o) {
          var r = o.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight) return;
          var cx = r.left + r.width / 2, cy = r.top + r.height / 2;
          var ry = Math.max(-1, Math.min(1, (mx - cx) / (innerWidth / 2))) * 16;
          var rx = Math.max(-1, Math.min(1, (my - cy) / (innerHeight / 2))) * -10;
          o.querySelector('.fz-3d-obj').style.transform = 'rotateY(' + ry.toFixed(2) + 'deg) rotateX(' + rx.toFixed(2) + 'deg)';
        });
      });
    }, { passive: true });
  }

  /* ---------- Hero 3D toys: decorative, built from layers so they read as solid objects ---------- */
  var SVGNS = 'http://www.w3.org/2000/svg';
  var TOY = {
    pin: { mode: 'spin', ripple: 1, d: 'M50 3C30.7 3 15 18.4 15 37.4 15 63 50 97 50 97S85 63 85 37.4C85 18.4 69.3 3 50 3z', fx: '<circle cx="50" cy="37" r="13.5" fill="#fff"/>', both: 1 },
    bars: { mode: 'sway', d: 'M8 92V62h22v30zM39 92V42h22v50zM70 92V20h22v72z', fx: '<path d="M10 46 34 28l16 10L82 10" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M68 8h16v16" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>' },
    mail: { mode: 'sway', d: 'M10 20h80a6 6 0 0 1 6 6v50a6 6 0 0 1-6 6H10a6 6 0 0 1-6-6V26a6 6 0 0 1 6-6z', fx: '<path d="M8 25l42 31 42-31" stroke="#fff" stroke-width="4.5" fill="none" stroke-linejoin="round"/><circle cx="84" cy="22" r="13" fill="#fff"/><path d="M78 22l4.5 4.5L91 17" stroke="#0A89A3" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>' },
    sms: { mode: 'sway', d: 'M18 12h64a12 12 0 0 1 12 12v38a12 12 0 0 1-12 12H46L26 92V74h-8A12 12 0 0 1 6 62V24a12 12 0 0 1 12-12z', fx: '<circle class="fz-tdot" cx="31" cy="43" r="6.5" fill="#fff"/><circle class="fz-tdot" cx="50" cy="43" r="6.5" fill="#fff"/><circle class="fz-tdot" cx="69" cy="43" r="6.5" fill="#fff"/>' },
    heart: { mode: 'spin', beat: 1, d: 'M50 90S8 63 8 34C8 20 18 10 31 10c8.5 0 15 4.5 19 11.5C54 14.5 60.5 10 69 10c13 0 23 10 23 24 0 29-42 56-42 56z', fx: '<ellipse cx="30" cy="30" rx="9" ry="6" fill="#fff" opacity=".4" transform="rotate(-35 30 30)"/>', both: 1 },
    glass: { mode: 'spin', d: 'M40 6a32 32 0 1 0 0 64 32 32 0 1 0 0-64zm0 12a20 20 0 1 1 0 40 20 20 0 1 1 0-40zM60 66l9-9 26 26-9 9z', fx: '<path d="M27 30a15 15 0 0 1 12-10" stroke="#fff" stroke-width="4" stroke-linecap="round" fill="none" opacity=".75"/>', both: 1 },
    ask: { mode: 'sway', d: 'M50 6c24 0 44 16.5 44 37S74 80 50 80c-5 0-10-.7-14.5-2L12 92l7-21C11 63.5 6 53.6 6 43 6 22.5 26 6 50 6z', fx: '<path d="M38 33c0-7 5.5-12 12.5-12S63 26 63 32.5c0 9-12 9.5-12 18.5" stroke="#fff" stroke-width="6.5" fill="none" stroke-linecap="round"/><circle cx="51" cy="62" r="4.6" fill="#fff"/>' },
    spark: { mode: 'spin', d: 'M50 2C53 33 67 47 98 50 67 53 53 67 50 98 47 67 33 53 2 50 33 47 47 33 50 2z', fx: '<path d="M84 8c1 6 4 9 10 10-6 1-9 4-10 10-1-6-4-9-10-10 6-1 9-4 10-10z" fill="#fff"/>', both: 1 },
    funnel: { mode: 'sway', d: 'M6 10h88L60 50v32L40 94V50z', fx: '<circle class="fz-tdot" cx="32" cy="22" r="5" fill="#fff"/><circle class="fz-tdot" cx="50" cy="22" r="5" fill="#fff"/><circle class="fz-tdot" cx="68" cy="22" r="5" fill="#fff"/><path d="M50 58v20" stroke="#fff" stroke-width="5" stroke-linecap="round"/>' },
    book: { mode: 'sway', d: 'M50 22C40 14 24 12 8 14v66c16-2 32 1 42 9 10-8 26-11 42-9V14C76 12 60 14 50 22z', fx: '<path d="M50 22v66" stroke="#fff" stroke-width="2.5"/><path d="M17 31h24M17 41h24M17 51h18M59 31h24M59 41h24M59 51h18" stroke="#fff" stroke-width="3.2" stroke-linecap="round" opacity=".9"/>' },
    calc: { mode: 'sway', d: 'M24 4h52a9 9 0 0 1 9 9v74a9 9 0 0 1-9 9H24a9 9 0 0 1-9-9V13a9 9 0 0 1 9-9z', fx: '<rect x="24" y="13" width="52" height="20" rx="5" fill="#fff"/><path d="M58 23h12M64 17v12" stroke="#0A89A3" stroke-width="3" stroke-linecap="round"/>' + [0, 1, 2].map(function (r) { return [0, 1, 2].map(function (c) { return '<rect x="' + (24 + c * 18) + '" y="' + (42 + r * 16) + '" width="14" height="11" rx="3" fill="#fff" opacity="' + (c === 2 && r === 2 ? 1 : .85) + '"/>'; }).join(''); }).join('') },
    chip: { mode: 'spin', d: 'M30 20h40a10 10 0 0 1 10 10v40a10 10 0 0 1-10 10H30a10 10 0 0 1-10-10V30a10 10 0 0 1 10-10zM34 6h6v12h-6zM47 6h6v12h-6zM60 6h6v12h-6zM34 82h6v12h-6zM47 82h6v12h-6zM60 82h6v12h-6zM6 34h12v6H6zM6 47h12v6H6zM6 60h12v6H6zM82 34h12v6H82zM82 47h12v6H82zM82 60h12v6H82z', fx: '<rect x="32" y="32" width="36" height="36" rx="6" fill="none" stroke="#fff" stroke-width="3"/><path d="M50 38c1.6 7 5 10.4 12 12-7 1.6-10.4 5-12 12-1.6-7-5-10.4-12-12 7-1.6 10.4-5 12-12z" fill="#fff"/>', both: 1 },
    compass: { mode: 'spin', d: 'M50 4a46 46 0 1 0 0 92 46 46 0 1 0 0-92zm0 10a36 36 0 1 1 0 72 36 36 0 1 1 0-72z', fx: '<path d="M50 20 59 50H41z" fill="#fff"/><path d="M41 50h18L50 80z" fill="#fff" opacity=".45"/><circle cx="50" cy="50" r="5" fill="#0A89A3" stroke="#fff" stroke-width="2.5"/><path d="M50 8v6M50 86v6M8 50h6M86 50h6" stroke="#fff" stroke-width="3" stroke-linecap="round"/>', both: 1 },
    target: { mode: 'sway', build: 'rings' },
    atom: { mode: 'spin', build: 'atom' },
    cube: { mode: 'cube', build: 'cube' },
    site: { mode: 'sway', build: 'site' },
    photo: { mode: 'sway', build: 'photo' }
  };
  var TOY_PAGE = { 'local-seo': 'pin', 'search-engine-optimization': 'bars', 'email-marketing': 'mail', 'short-message-service-sms': 'sms',
    'social-media-marketing': 'heart', 'paid-search-ads': 'glass', 'answer-engine-optimization': 'ask', 'generative-engine-optimization': 'spark',
    'hubspot-setup': 'funnel', 'paid-social-media-ads': 'target', 'ai-optimization': 'atom', 'services': 'cube', 'website-design': 'site', 'about': 'photo', 'marketing-glossary': 'book', 'marketing-kpis-glossary': 'calc', 'ai-glossary': 'chip', 'service-match': 'compass' };
  function el(tag, cls, css) { var e = D.createElement(tag); if (cls) e.className = cls; if (css) e.style.cssText = css; return e; }
  function gradDefs() {
    if (D.getElementById('fzToyDefs')) return;
    var s = D.createElementNS(SVGNS, 'svg'); s.id = 'fzToyDefs'; s.setAttribute('aria-hidden', 'true');
    s.setAttribute('width', '0'); s.setAttribute('height', '0'); s.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden';
    s.innerHTML = '<defs><linearGradient id="fzTg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2fb6cf"/><stop offset=".55" stop-color="#0A89A3"/><stop offset="1" stop-color="#064187"/></linearGradient></defs>';
    D.body.appendChild(s);
  }
  function extrude(rot, t) {
    var n = 18, gap = 1.15;
    for (var i = 0; i < n; i++) {
      var front = i === n - 1, back = i === 0, z = (i - (n - 1) / 2) * gap;
      var fill = front || back ? 'url(#fzTg)' : (i > n - 4 ? '#0b6f93' : '#053a78');
      var s = D.createElementNS(SVGNS, 'svg'); s.setAttribute('class', 'fz-ly'); s.setAttribute('viewBox', '0 0 100 100');
      s.style.transform = 'translateZ(' + z.toFixed(2) + 'px)' + (back ? ' rotateY(180deg)' : '');
      var body = '<path d="' + t.d + '" fill="' + fill + '" fill-rule="evenodd"' + (front || back ? ' stroke="rgba(255,255,255,.35)" stroke-width=".8"' : '') + '/>';
      if (front || (back && t.both)) body += t.fx;
      s.innerHTML = t.beat ? '<g class="fz-beat">' + body + '</g>' : body;
      rot.appendChild(s);
    }
  }
  var BUILD = {
    rings: function (rot) {
      [[150, '#064187', 0], [116, '#ffffff', 14], [82, '#0A89A3', 28], [48, '#ffffff', 42], [20, '#064187', 56]].forEach(function (r) {
        var c = el('span', 'fz-tring', 'width:' + r[0] + 'px;height:' + r[0] + 'px;margin:' + (-r[0] / 2) + 'px 0 0 ' + (-r[0] / 2) + 'px;background:' + r[1] + ';transform:translateZ(' + r[2] + 'px);box-shadow:0 0 0 1px rgba(255,255,255,.25),0 6px 16px rgba(0,10,30,.3)');
        rot.appendChild(c);
      });
    },
    atom: function (rot, bob) {
      bob.appendChild(el('span', 'fz-atom-core'));
      ['rotateX(72deg)', 'rotateX(72deg) rotateY(60deg)', 'rotateX(72deg) rotateY(-60deg)'].forEach(function (tf, k) {
        var o = el('span', 'fz-orbit', 'transform:' + tf); var i = el('i', '', 'animation-delay:' + (-k * 1.05) + 's'); o.appendChild(i); rot.appendChild(o);
      });
    },
    cube: function (rot) {
      var ic = ['<path d="M26 8v40M6 28h40" stroke="#fff" stroke-width="5" stroke-linecap="round"/>',
        '<circle cx="22" cy="22" r="13" stroke="#fff" stroke-width="5" fill="none"/><path d="M32 32l12 12" stroke="#fff" stroke-width="5" stroke-linecap="round"/>',
        '<path d="M26 4C17 4 10 11 10 19c0 12 16 29 16 29s16-17 16-29C42 11 35 4 26 4z" fill="#fff"/><circle cx="26" cy="19" r="6" fill="#0A89A3"/>',
        '<path d="M8 44V30M20 44V20M32 44V26M44 44V8" stroke="#fff" stroke-width="6" stroke-linecap="round"/>',
        '<path d="M26 4l6 15 16 1-12 10 4 16-14-9-14 9 4-16L4 20l16-1z" fill="#fff"/>',
        '<rect x="6" y="10" width="40" height="30" rx="5" stroke="#fff" stroke-width="5" fill="none"/><path d="M8 13l18 13 18-13" stroke="#fff" stroke-width="4" fill="none"/>'];
      ['rotateY(0)', 'rotateY(90deg)', 'rotateY(180deg)', 'rotateY(-90deg)', 'rotateX(90deg)', 'rotateX(-90deg)'].forEach(function (tf, k) {
        var f = el('span', 'fz-face', 'transform:' + tf + ' translateZ(52px)');
        f.innerHTML = '<svg viewBox="0 0 52 52" fill="none">' + ic[k] + '</svg>'; rot.appendChild(f);
      });
    },
    site: function (rot) {
      var bar = '<span style="display:flex;gap:4px;padding:7px 8px;background:#e9eef3"><i style="width:7px;height:7px;border-radius:50%;background:#ff5f57"></i><i style="width:7px;height:7px;border-radius:50%;background:#febc2e"></i><i style="width:7px;height:7px;border-radius:50%;background:#28c840"></i></span>';
      [[-18, 'background:#064187', -34, 22], [0, 'background:#0A89A3', -14, 8], [18, 'background:#fff', 6, -6]].forEach(function (p, k) {
        var c = el('span', 'fz-panel', 'width:132px;height:96px;margin:' + (-48 + p[3]) + 'px 0 0 ' + (-66 + p[2]) + 'px;transform:translateZ(' + (k * 26 - 26) + 'px);' + p[1]);
        if (k === 2) c.innerHTML = bar + '<span style="margin:10px 10px 6px;height:9px;width:70%;border-radius:4px;background:#064187"></span><span style="margin:0 10px 8px;height:6px;width:52%;border-radius:4px;background:#b8c2cc"></span><span style="margin:0 10px;height:16px;width:44px;border-radius:999px;background:linear-gradient(135deg,#064187,#0A89A3)"></span>';
        rot.appendChild(c);
      });
    },
    photo: function (rot) {
      [[-26, '#064187', -8, 'rotateZ(-9deg)'], [-12, '#0A89A3', 8, 'rotateZ(7deg)']].forEach(function (p) {
        rot.appendChild(el('span', 'fz-panel', 'width:112px;height:132px;margin:-66px 0 0 -56px;background:' + p[1] + ';transform:translateZ(' + p[0] + 'px) translateX(' + p[2] + 'px) ' + p[3]));
      });
      var c = el('span', 'fz-panel', 'width:112px;height:132px;margin:-66px 0 0 -56px;background:#fff;padding:7px 7px 24px;box-sizing:border-box;transform:translateZ(14px) rotateZ(-2deg)');
      c.innerHTML = '<img src="' + B + 'assets/img/riley-avatar.webp" alt="" width="98" height="101" loading="lazy" decoding="async">';
      rot.appendChild(c);
    }
  };
  function toys() {
    var seg = location.pathname.replace(/\.html$/, '').replace(/\/$/, '').split('/');
    if (seg[seg.length - 1] === 'index') seg.pop();
    var key = TOY_PAGE[seg[seg.length - 1] || '']; if (!key) return;
    var host = D.querySelector('main .hero-visual, main .hero-map-visual, main .hero-ai-visual, main .hero .hright, main .hero .hero-right');
    var h1 = D.querySelector('main h1');
    if (!host && !h1) return;
    var t = TOY[key]; gradDefs();
    var toy = el('span', 'fz-toy'); toy.setAttribute('aria-hidden', 'true'); toy.setAttribute('data-nosnippet', ''); toy.dataset.mode = t.mode; toy.dataset.toy = key;
    var sc = el('span', 'fz-toy-sc'), tilt = el('span', 'fz-toy-tilt'), bob = el('span', 'fz-toy-bob'), rot = el('span', 'fz-toy-rot');
    bob.appendChild(rot); tilt.appendChild(bob); sc.appendChild(tilt); toy.appendChild(sc);
    if (t.ripple) { sc.appendChild(el('span', 'fz-ripple')); sc.appendChild(el('span', 'fz-ripple')); }
    sc.appendChild(el('span', 'fz-toy-shadow'));
    if (t.build) BUILD[t.build](rot, bob); else extrude(rot, t);
    var mq = matchMedia('(max-width:768px)');
    function place() {
      var mob = mq.matches || !host || host.offsetParent === null && getComputedStyle(host).display === 'none';
      toy.classList.toggle('is-mob', !!mob);
      if (mob && h1) { if (host) { host.classList.remove('fz-has-toy'); host.style.paddingTop = ''; } if (toy.parentNode !== h1) h1.insertBefore(toy, h1.firstChild); }
      else if (host) {
        host.classList.add('fz-has-toy'); if (toy.parentNode !== host) host.appendChild(toy);
        var first = host.firstElementChild === toy ? null : host.firstElementChild;
        var r = first ? host.getBoundingClientRect().right - first.getBoundingClientRect().right : 0;
        toy.style.setProperty('--toy-r', Math.max(0, r) + 'px');
        host.style.paddingTop = '';
        var base = parseFloat(getComputedStyle(host).paddingTop) || 0, tb = toy.getBoundingClientRect().bottom, top = Infinity;
        [].forEach.call(host.querySelectorAll('*'), function (n) { if (toy.contains(n)) return; var q = n.getBoundingClientRect(); if (q.width && q.height && q.top < top) top = q.top; });
        if (top !== Infinity && tb + 20 > top) host.style.paddingTop = (base + tb + 20 - top) + 'px';
      }
    }
    place(); window.addEventListener('resize', place); window.addEventListener('load', place);
    /* tilt toward cursor, drag to spin, tap to twirl */
    var tiltX = 0, tiltY = 0, spin = 0, vel = 0, dragging = false, lastX = 0, moved = 0, raf = null;
    function paint() { tilt.style.transform = 'rotateX(' + tiltX.toFixed(2) + 'deg) rotateY(' + (tiltY + spin).toFixed(2) + 'deg)'; }
    function coast() {
      raf = null; if (dragging) return;
      spin += vel; vel *= 0.94; paint();
      if (Math.abs(vel) > 0.08) raf = requestAnimationFrame(coast); else toy.classList.remove('is-free');
    }
    toy.addEventListener('pointerdown', function (e) {
      dragging = true; moved = 0; lastX = e.clientX; vel = 0; toy.classList.add('is-drag', 'is-free');
      try { toy.setPointerCapture(e.pointerId); } catch (x) {}
    });
    toy.addEventListener('pointermove', function (e) {
      if (!dragging) return; var dx = e.clientX - lastX; lastX = e.clientX; moved += Math.abs(dx);
      spin += dx * 0.9; vel = dx * 0.9; paint();
    });
    function up() {
      if (!dragging) return; dragging = false; toy.classList.remove('is-drag');
      if (moved < 4) { vel = 22; track('toy_spin', { toy: key }); }
      if (!raf) raf = requestAnimationFrame(coast);
    }
    toy.addEventListener('pointerup', up); toy.addEventListener('pointercancel', up);
    if (fine && !reduce) {
      window.addEventListener('pointermove', function (e) {
        if (dragging || H.classList.contains('fz-still')) return;
        var r = toy.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight) return;
        tiltY = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / (innerWidth / 2))) * 22;
        tiltX = Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height / 2)) / (innerHeight / 2))) * -14;
        if (!toy.classList.contains('is-free')) paint();
      }, { passive: true });
    }
  }

  /* ---------- Soft spotlight that follows the cursor across cards ---------- */
  function glow() {
    if (!fine || reduce) return;
    D.querySelectorAll('main .svc-card, main .svc-detail-card, main .why-ai-card, main .exp-card, main .surf-detail-card, main .plat-detail-card, main .fz-why a, main .fz-cmo-card, main .pain-card, main .who-card').forEach(function (c) {
      if (c.querySelector(':scope > .fz-glow-l')) return;
      var cs = getComputedStyle(c); if (cs.position === 'static') c.style.position = 'relative'; c.style.isolation = 'isolate';
      var l = el('span', 'fz-glow-l'); l.setAttribute('aria-hidden', 'true'); c.insertBefore(l, c.firstChild); c.classList.add('fz-glow');
      c.addEventListener('pointermove', function (e) {
        var r = c.getBoundingClientRect(); c.style.setProperty('--gx', (e.clientX - r.left) + 'px'); c.style.setProperty('--gy', (e.clientY - r.top) + 'px');
      }, { passive: true });
    });
  }

  function dials() { D.querySelectorAll('.fz-dial').forEach(function (d) { inView(d, 'is-moving'); }); }

  /* ---------- Tap-to-chat lead assistant (no typing, no AI, no cost) ---------- */
  var FLOW = {
    start: { say: ['Hi! I’m the Favze assistant. Tap an answer and I’ll point you to the right place.', 'What brings you here today?'],
      opts: [['I need more leads', 'leads'], ['Customers can’t find me on Google', 'google'], ['I want a better website', 'web'], ['Help with social media', 'social'], ['Show up in ChatGPT and AI', 'ai'], ['How much does it cost?', 'cost'], ['Just looking around', 'explore']] },
    leads: { say: ['Got it. More leads usually comes from two things: being found when people search, and following up fast when they reach out.', 'Here is where Favze would start:'],
      links: [['Paid Search Ads: show up at the top today', 'services/paid-search-ads'], ['Local SEO: get calls from Google Maps', 'services/local-seo'], ['Website Design: turn visitors into calls', 'services/website-design']], next: 'close' },
    google: { say: ['That one is fixable. It often comes down to a few Google Business Profile and website basics.', 'These two pages explain how Favze gets you into the Map Pack and search results:'],
      links: [['Local SEO', 'services/local-seo'], ['SEO', 'services/search-engine-optimization']], next: 'close' },
    web: { say: ['A good website explains what you do in seconds and makes it easy to call or book.', 'Every Favze site is fast, built for phones, and set up for search and AI from day one.'],
      links: [['See Website Design', 'services/website-design']], next: 'close' },
    social: { say: ['Social works best when people can find your posts, not just scroll past them.', 'Favze can run it for you, or boost what works with ads:'],
      links: [['Social Media Marketing', 'services/social-media-marketing'], ['Paid Social Ads', 'services/paid-social-media-ads']], next: 'close' },
    ai: { say: ['Many people now ask ChatGPT, Gemini, and Google AI for recommendations.', 'Favze helps those tools understand your business so they can name you. Start here:'],
      links: [['AI Optimization (the full plan)', 'services/ai-optimization'], ['Show up as the answer on Google (AEO)', 'services/answer-engine-optimization'], ['Get recommended by ChatGPT (GEO)', 'services/generative-engine-optimization']], next: 'close' },
    cost: { say: ['Every plan is custom, so the price depends on what you need: how many channels, how competitive your market is, and how much content it takes.', 'You see every cost up front. No hidden fees, and plans run month to month. Riley builds the number with you in a free consultation.'], next: 'close' },
    explore: { say: ['Happy to help you look around. Favze does three things:'],
      opts: [['Get found', 'found'], ['Turn visitors into leads', 'convert'], ['Keep customers coming back', 'keep']] },
    found: { say: ['Getting found covers Google, Google Maps, and AI tools.'], links: [['SEO', 'services/search-engine-optimization'], ['Local SEO', 'services/local-seo'], ['AI Optimization', 'services/ai-optimization']], next: 'close' },
    convert: { say: ['Turning visitors into leads is about ads and a website that makes people act.'], links: [['Website Design', 'services/website-design'], ['Paid Search Ads', 'services/paid-search-ads'], ['Paid Social Ads', 'services/paid-social-media-ads']], next: 'close' },
    keep: { say: ['Keeping customers is follow-up: emails, texts, and a CRM that remembers everyone.'], links: [['Email Marketing', 'services/email-marketing'], ['SMS Marketing', 'services/short-message-service-sms'], ['HubSpot Setup', 'services/hubspot-setup']], next: 'close' },
    close: { say: ['Want to talk it through with Riley? It’s free, and there’s no pressure.'], end: true }
  };
  function chat() {
    if (D.querySelector('.fz-chat-launch')) return;
    var launch = D.createElement('button');
    launch.type = 'button'; launch.className = 'fz-chat-launch'; launch.setAttribute('data-nosnippet', ''); launch.setAttribute('aria-haspopup', 'dialog'); launch.setAttribute('aria-label', 'Open the Favze chat assistant');
    launch.innerHTML = '<span class="fz-av" aria-hidden="true"><img src="https://favze.com/assets/img/riley-avatar.webp" alt="" width="64" height="64" loading="lazy" decoding="async"></span><span class="fz-dotlive" aria-hidden="true"></span><span class="fz-chat-lbl">Questions? Tap to chat</span>';
    var box = D.createElement('div');
    box.className = 'fz-chat'; box.setAttribute('data-nosnippet', ''); box.setAttribute('role', 'dialog'); box.setAttribute('aria-modal', 'true'); box.setAttribute('aria-label', 'Favze chat assistant'); box.hidden = true;
    box.innerHTML = '<div class="fz-chat-head"><span class="fz-av" aria-hidden="true"><img src="https://favze.com/assets/img/riley-avatar.webp" alt="" width="64" height="64" loading="lazy" decoding="async"></span><div><b>Favze</b><small>Tap an answer. Riley follows up personally.</small></div><button type="button" class="fz-chat-x" aria-label="Close chat">&times;</button></div>' +
      '<div class="fz-chat-log" role="log" aria-live="polite"></div><div class="fz-chat-opts"></div><p class="fz-chat-note">This assistant uses set answers. To reach a person, call or text 574-747-5012.</p>';
    D.body.appendChild(launch); D.body.appendChild(box);
    /* A one-time friendly hint after a few seconds */
    setTimeout(function () { if (!started) { launch.classList.add('is-hint'); setTimeout(function () { launch.classList.remove('is-hint'); }, 4200); } }, 6000);
    var log = box.querySelector('.fz-chat-log'), opts = box.querySelector('.fz-chat-opts'), started = false, lastFocus;
    function scroll() { log.scrollTop = log.scrollHeight; }
    function bubble(html, me) { var d = D.createElement('div'); d.className = 'fz-msg ' + (me ? 'fz-msg-me' : 'fz-msg-bot'); d.innerHTML = html; log.appendChild(d); scroll(); }
    function say(lines, done) {
      var i = 0;
      (function nxt() {
        if (i >= lines.length) { done && done(); return; }
        var t = D.createElement('div'); t.className = 'fz-typing'; t.innerHTML = '<i></i><i></i><i></i>'; t.setAttribute('aria-hidden', 'true'); log.appendChild(t); scroll();
        setTimeout(function () { t.remove(); bubble(lines[i++]); nxt(); }, reduce ? 50 : Math.min(1100, 380 + lines[i].length * 9));
      })();
    }
    function endButtons() {
      opts.innerHTML = '<a class="is-main" href="' + B + 'free-consultation" data-chat-cta="book">Book a Free Consultation</a><a href="sms:+15747475012" data-chat-cta="text">Text Riley</a><a href="tel:+15747475012" data-chat-cta="call">Call Riley</a><button type="button" data-go="start">Start over</button>';
    }
    function go(key) {
      var n = FLOW[key]; opts.innerHTML = '';
      say(n.say, function () {
        if (n.links) n.links.forEach(function (l) { bubble('<a href="' + B + l[1] + '" data-chat-link="' + l[1] + '">' + l[0] + ' &rarr;</a>'); });
        if (n.opts) opts.innerHTML = n.opts.map(function (o) { return '<button type="button" data-go="' + o[1] + '">' + o[0] + '</button>'; }).join('');
        else if (n.next) setTimeout(function () { go(n.next); }, reduce ? 50 : 650);
        else if (n.end) endButtons();
        var f = opts.querySelector('button,a'); if (f && box.contains(D.activeElement)) f.focus();
      });
    }
    opts.addEventListener('click', function (e) {
      var b = e.target.closest('[data-go]');
      if (b) { bubble(b.textContent, true); track('chat_choice', { choice: b.getAttribute('data-go'), label: b.textContent }); go(b.getAttribute('data-go')); return; }
      var c = e.target.closest('[data-chat-cta]'); if (c) track('chat_cta', { cta: c.getAttribute('data-chat-cta') });
    });
    log.addEventListener('click', function (e) { var a = e.target.closest('[data-chat-link]'); if (a) track('chat_link', { link: a.getAttribute('data-chat-link') }); });
    function open() {
      lastFocus = D.activeElement; box.hidden = false; H.classList.add('fz-chat-on');
      requestAnimationFrame(function () { box.classList.add('is-open'); box.querySelector('.fz-chat-x').focus(); });
      if (!started) { started = true; go('start'); }
      track('chat_open', {});
    }
    function close() { box.classList.remove('is-open'); H.classList.remove('fz-chat-on'); setTimeout(function () { box.hidden = true; }, 200); if (lastFocus) lastFocus.focus(); }
    launch.addEventListener('click', open);
    box.querySelector('.fz-chat-x').addEventListener('click', close);
    box.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') close();
      if (e.key === 'Tab') {
        var f = [].slice.call(box.querySelectorAll('button,a[href]')).filter(function (x) { return x.offsetParent; });
        if (!f.length) return;
        if (e.shiftKey && D.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
        else if (!e.shiftKey && D.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
      }
    });
    D.addEventListener('click', function (e) { var t = e.target.closest('[data-fz-chat-open]'); if (t) { e.preventDefault(); open(); } });
  }

  /* ---------- Areas-we-serve chips scroll on their own and pause on hover ---------- */
  function areaMarquee() {
    D.querySelectorAll('.city-grid').forEach(function (g) {
      if (g.closest('.fz-cg-rail')) return;
      var rail = D.createElement('div'); rail.className = 'fz-cg-rail';
      g.parentNode.insertBefore(rail, g); rail.appendChild(g);
      [].slice.call(g.children).forEach(function (c) { var k = c.cloneNode(true); k.setAttribute('aria-hidden', 'true'); k.setAttribute('tabindex', '-1'); g.appendChild(k); });
      g.classList.add('fz-cg-track');
    });
  }

  /* Hidden duplicates (marquee clones) never take keyboard focus */
  function hiddenFocus() {
    D.querySelectorAll('[aria-hidden="true"]').forEach(function (h) {
      if (h.matches('a[href],button,input,select,textarea,[tabindex]')) h.setAttribute('tabindex', '-1');
      h.querySelectorAll('a[href],button,input,select,textarea,[tabindex]').forEach(function (x) { x.setAttribute('tabindex', '-1'); });
    });
  }
  run(areaMarquee);
  run(philo); run(sidenav); run(reasons); run(minis); run(three); run(dials); run(toys); run(glow); run(chat); run(hiddenFocus);
  window.addEventListener('load', function () { run(hiddenFocus); setTimeout(function () { run(hiddenFocus); }, 1500); });
})();
