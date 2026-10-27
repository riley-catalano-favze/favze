/* Favze service demos: a small, tappable, on-brand demo on every service card that shows what that service does.
   Demos are decoration on top of real page text (aria-hidden), so search engines and AI tools read the card copy as written. */
(function () {
  'use strict';
  var D = document, H = D.documentElement;
  window.fzDemos = true;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  function track(name, params) {
    params = params || {}; params.page_path = location.pathname;
    if (typeof window.gtag === 'function') window.gtag('event', name, params);
    else (window.dataLayer = window.dataLayer || []).push(Object.assign({ event: name }, params));
  }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'); }
  var CK = '<i class="fzd-ck"></i>';
  var STAR = '<i class="fzd-star"></i>';
  function stars(n) { var s = ''; for (var i = 0; i < n; i++) s += STAR; return '<span class="fzd-stars">' + s + '</span>'; }
  function search(t) { return '<div class="fzd-search"><i class="fzd-mag"></i><span data-t="' + esc(t) + '">' + esc(t.split('|')[0]) + '</span></div>'; }
  function net(nodes, hub, hubCls) {
    var lines = nodes.map(function (n) { return '<line x1="50" y1="46" x2="' + n[1] + '" y2="' + n[2] + '"' + (n[3] != null ? ' data-on="' + n[3] + '"' : '') + '/>'; }).join('');
    return '<div class="fzd-net"><svg class="fzd-lines-svg" viewBox="0 0 100 100" preserveAspectRatio="none">' + lines + '</svg>' +
      nodes.map(function (n) { return '<span class="fzd-node' + (n[4] ? ' ' + n[4] : '') + '" style="left:' + n[1] + '%;top:' + n[2] + '%"' + (n[5] != null ? ' data-on="' + n[5] + '"' : '') + '>' + esc(n[0]) + '</span>'; }).join('') +
      '<span class="fzd-hub ' + (hubCls || '') + '">' + esc(hub) + '</span></div>';
  }
  function T(list) { return esc(list.join('|')); }
  function first(list) { return esc(list[0]); }

  /* Each demo: n = number of steps, hint = the tap label, html = markup. Elements react to the step through data attributes:
     data-on="k" (shown from step k), data-at="a,b" (shown only on those steps), data-t="a|b" (text per step),
     data-w="10|80" (width % per step), data-x / data-y="0|-30" (offset px per step). */
  var DEMO = {
    gbp: { n: 5, hint: 'Tap to optimize', html: function () {
      return '<div class="fzd-card fzd-gbp"><div class="fzd-row"><span class="fzd-logo">YB</span><div class="fzd-grow"><b>Your Business</b><small>Plumber · Goshen, IN</small></div>' + stars(5) + '</div>' +
        '<div class="fzd-grid2">' + ['Categories', 'Service area', 'Description', 'Photos and video'].map(function (t, i) { return '<span class="fzd-chk" data-on="' + (i + 1) + '">' + CK + t + '</span>'; }).join('') + '</div>' +
        '<div class="fzd-meter"><i data-w="35|52|70|86|100"></i></div><small class="fzd-meta" data-t="Profile 35% complete|Profile 52% complete|Profile 70% complete|Profile 86% complete|Profile 100% complete">Profile 35% complete</small></div>';
    } },
    mappack: { n: 3, hint: 'Tap to climb', html: function () {
      return '<div class="fzd-map"><i class="r1"></i><i class="r2"></i><i class="r3"></i><span class="fzd-plat" data-t="Google Maps|Google Maps|Apple Maps">Google Maps</span>' +
        '<span class="fzd-pin p1">1</span><span class="fzd-pin p2">2</span><span class="fzd-pin you" data-on="0"><b data-t="3|1|1">3</b></span><span class="fzd-ring" data-on="1"></span></div>' +
        '<div class="fzd-list"><div class="fzd-li" data-y="0|32">Competitor A</div><div class="fzd-li" data-y="0|32">Competitor B</div><div class="fzd-li me" data-y="0|-64"><b>Your Business</b>' + stars(5) + '</div></div>';
    } },
    kw: { n: 3, hint: 'Tap for next search', html: function (p) {
      var q = p.q || ['plumber near me', 'water heater repair goshen', 'how to fix a leaky faucet'];
      var i = p.i || ['Ready to call', 'Ready to buy', 'Researching'];
      var v = p.v || ['High intent', 'High intent', 'Early stage'];
      return search(q.join('|')) + '<div class="fzd-kwrow"><span class="fzd-tag" data-t="' + T(i) + '">' + first(i) + '</span><span class="fzd-tag ghost" data-t="' + T(v) + '">' + first(v) + '</span></div>' +
        '<div class="fzd-bars3">' + [0, 1, 2].map(function (k) { return '<i data-w="' + ['92|86|40', '68|74|28', '40|52|18'][k] + '"></i>'; }).join('') + '</div><small class="fzd-meta light">Search demand by intent</small>';
    } },
    nap: { n: 2, hint: 'Tap to sync', html: function () {
      return '<div class="fzd-stack">' + [['Google', '574-555-0142', 0], ['Apple Maps', '574-555-0199', 1], ['Bing', '574-555-0142', 0], ['Yelp', '(574) 555-0100', 1]].map(function (r) {
        return '<div class="fzd-li wide"><b>' + r[0] + '</b><span class="fzd-grow"></span><span ' + (r[2] ? 'data-t="' + r[1] + '|574-555-0142" class="fzd-warn-txt"' : '') + '>' + r[1] + '</span>' + (r[2] ? '<i class="fzd-warn" data-at="0"></i>' : '') + '<span data-on="1">' + CK + '</span></div>';
      }).join('') + '</div>';
    } },
    localweb: { n: 3, hint: 'Tap to tour the page', html: function () {
      return '<div class="fzd-card fzd-page"><div class="fzd-browser"><i></i><i></i><i></i><span>yourbusiness.com/goshen</span></div>' +
        '<div class="fzd-pg"><b class="fzd-hl" data-at="0">Plumber in Goshen, IN</b><span class="fzd-lines"><i></i><i></i></span><span class="fzd-pill fzd-hl" data-at="1">{ } LocalBusiness</span><span class="fzd-call fzd-hl" data-at="2">Call now</span></div></div>' +
        '<span class="fzd-callout" data-t="City landing page|Schema markup|Tap-to-call on mobile">City landing page</span>';
    } },
    reviews: { n: 1, hint: 'Tap a star', manual: true, html: function () {
      return '<div class="fzd-card fzd-rev"><div class="fzd-row"><span class="fzd-pick">' + [1, 2, 3, 4, 5].map(function (k) { return '<i class="fzd-star big" data-k="' + k + '"></i>'; }).join('') + '</span><span class="fzd-avg">4.8</span></div>' +
        '<div class="fzd-bub in">"Fast, friendly, fixed it the same day."</div><div class="fzd-bub out">Thank you, Sarah! See you next spring.</div></div>';
    } },
    publish: { n: 2, hint: 'Tap to publish', html: function (p) {
      var t = p.t || 'Best Patio Ideas in Elkhart County';
      return '<div class="fzd-card fzd-post" data-y="0|-6"><small class="fzd-meta">' + esc(p.k || 'Local blog post') + '</small><b>' + esc(t) + '</b><span class="fzd-lines"><i></i><i></i></span></div>' +
        '<div class="fzd-card fzd-res" data-on="1"><small class="fzd-url">yourbusiness.com</small><b>' + esc(t) + '</b><span class="fzd-tag sm">' + esc(p.tag || 'Ranks locally') + '</span></div>';
    } },
    links: { n: 6, hint: 'Tap to earn a link', html: function (p) {
      var src = p.src || ['Chamber', 'Local news', 'Partner', 'Directory', 'Sponsor'];
      var pos = [[16, 16], [84, 16], [14, 76], [86, 76], [50, 6]];
      return net(src.map(function (t, i) { return [t, pos[i][0], pos[i][1], i + 1]; }), 'You') +
        '<div class="fzd-auth"><small>Authority</small><div class="fzd-meter"><i data-w="20|34|48|62|78|92"></i></div></div>';
    } },
    pack: { n: 2, hint: 'Tap for next search', html: function (p) {
      var q = p.q;
      return search(q.join('|')) + '<div class="fzd-stack mt">' +
        '<div class="fzd-li wide me" data-y="88|0"><span class="fzd-num" data-t="3|1">3</span><b>' + esc(p.name || 'Your Business') + '</b><span class="fzd-grow"></span>' + stars(5) + '</div>' +
        '<div class="fzd-li wide" data-y="-44|0"><span class="fzd-num" data-t="1|2">1</span>Competitor A</div>' +
        '<div class="fzd-li wide" data-y="-44|0"><span class="fzd-num" data-t="2|3">2</span>Competitor B</div></div>';
    } },
    structure: { n: 2, hint: 'Tap to structure', html: function () {
      return '<div class="fzd-card fzd-struct"><div data-at="0" class="fzd-mess"><span class="fzd-lines dense"><i></i><i></i><i></i><i></i><i></i><i></i></span></div>' +
        '<div data-on="1" class="fzd-clean"><b>How much does a furnace tune-up cost?</b><span class="fzd-pill">Short answer first</span><ul><li>' + CK + 'Clear heading</li><li>' + CK + 'Bullet list</li><li>' + CK + 'FAQ block</li></ul></div></div>' +
        '<span class="fzd-callout" data-t="Hard for AI to read|Easy for AI to quote">Hard for AI to read</span>';
    } },
    schema: { n: 2, hint: 'Tap to see Google’s view', html: function () {
      return '<div class="fzd-code" data-at="0"><span><em>"@type"</em>: "LocalBusiness",</span><span><em>"name"</em>: "Your Business",</span><span><em>"rating"</em>: 4.9,</span><span><em>"openingHours"</em>: "Mo-Fr 8-6"</span></div>' +
        '<div class="fzd-card fzd-rich" data-on="1"><small class="fzd-url">yourbusiness.com</small><b>Your Business · Goshen, IN</b><div class="fzd-row">' + stars(5) + '<small class="fzd-meta">4.9 · Open until 6 PM</small></div><div class="fzd-row"><span class="fzd-pill">Services</span><span class="fzd-pill">Book online</span></div></div>';
    } },
    snippet: { n: 3, hint: 'Tap to ask', html: function (p) {
      var q = p.q || ['How often should I service my AC?', 'Do I need a permit for a deck?', 'How long does a roof last?'];
      return search(q.join('|')) + '<div class="fzd-card fzd-snip" data-y="6|0|0"><small class="fzd-meta navy">Featured answer</small><span class="fzd-lines"><i></i><i></i></span><small class="fzd-src">Source: <b>yourbusiness.com</b></small></div>' +
        '<div class="fzd-paa"><span>People also ask</span><i class="fzd-chev"></i></div>';
    } },
    entity: { n: 5, hint: 'Tap to connect', html: function () {
      return net([['Plumbing', 16, 14, 1], ['Goshen, IN', 84, 14, 2], ['Owner: Riley', 16, 80, 3], ['4.9 reviews', 84, 80, 4]], 'Your Business', 'wide') +
        '<span class="fzd-callout" data-t="Facts AI can trust|Service known|Location known|Owner known|Reputation known">Facts AI can trust</span>';
    } },
    ai: { n: 3, hint: 'Tap to ask AI', html: function (p) {
      var q = p.q || ['Who is the best roofer in Goshen?', 'Good family dentist near Elkhart?', 'Who does patios in Middlebury?'];
      return '<div class="fzd-chat"><div class="fzd-chathead"><i class="fzd-spark"></i>' + esc(p.name || 'AI assistant') + '</div>' +
        '<div class="fzd-msg user" data-t="' + T(q) + '">' + first(q) + '</div>' +
        '<div class="fzd-msg bot"><span class="fzd-typing" data-at="0"><i></i><i></i><i></i></span><span data-on="1">Locals recommend <b>Your Business</b>.</span></div>' +
        '<span class="fzd-cite" data-on="2">' + esc(p.cite || 'Cited: yourbusiness.com') + '</span></div>';
    } },
    voice: { n: 3, hint: 'Tap the mic', html: function () {
      return '<div class="fzd-voice"><span class="fzd-mic" data-on="0"><i></i></span><span class="fzd-wave" data-at="1">' + '<i></i><i></i><i></i><i></i><i></i><i></i><i></i>' + '</span>' +
        '<div class="fzd-msg user sm" data-on="1">"Hey Siri, who fixes furnaces near me?"</div><div class="fzd-msg bot sm" data-on="2">"<b>Your Business</b> is open now, 2 miles away."</div></div>';
    } },
    monitor: { n: 3, hint: 'Tap for an AI update', html: function () {
      return '<div class="fzd-chart"><svg viewBox="0 0 200 90" preserveAspectRatio="none"><path class="fzd-line l0" d="M0 70 C30 64 50 60 70 52 S110 40 130 36 S170 26 200 20"/><path class="fzd-line l1" d="M0 70 C30 64 50 60 70 52 S100 62 120 58 S170 30 200 18"/></svg>' +
        '<span class="fzd-flag" data-on="1">Model update</span><span class="fzd-tag sm fzd-fix" data-on="2">' + CK + 'Adjusted</span></div><small class="fzd-meta light">AI visibility, tracked weekly</small>';
    } },
    serpshift: { n: 2, hint: 'Tap to see the shift', html: function () {
      return '<div class="fzd-card fzd-serp"><div class="fzd-aio" data-on="1"><small class="fzd-meta navy"><i class="fzd-spark dark"></i>AI Overview</small><span class="fzd-lines"><i></i></span><small class="fzd-src">Source: <b>Your Business</b></small></div>' +
        '<div class="fzd-blue"><i></i><i></i><i></i><i></i></div></div><span class="fzd-callout" data-t="Classic blue links|AI answers come first">Classic blue links</span>';
    } },
    inbox: { n: 2, hint: 'Tap to send', html: function () {
      return '<div class="fzd-card fzd-inbox"><div class="fzd-tabs"><span class="on">Primary</span><span>Promotions</span><span>Spam</span></div>' +
        '<div class="fzd-mail new" data-on="1"><b>Your Business</b> Your spring tune-up is ready</div><div class="fzd-mail"><b>Mom</b> Dinner Sunday?</div>' +
        '<div class="fzd-kpis"><span>Spam <b>0</b></span><span>Bounces <b>0</b></span><span>Reports <b>0</b></span></div></div><span class="fzd-fly" data-at="1"></span>';
    } },
    personal: { n: 3, hint: 'Tap next customer', html: function () {
      var nm = ['Sarah', 'Mike', 'Jen'], it = ['Hiking boots', 'Truck mats', 'Garden tools'], c = ['#0A89A3', '#064187', '#1f9d61'];
      return '<div class="fzd-card fzd-email"><small class="fzd-meta">To: <span data-t="' + nm.join('|') + '">Sarah</span></small><b>Hi <span data-t="' + nm.join('|') + '">Sarah</span>, picked for you</b>' +
        '<div class="fzd-row"><span class="fzd-prod">' + c.map(function (x, i) { return '<i data-at="' + i + '" style="background:' + x + '"></i>'; }).join('') + '</span><span class="fzd-grow"><span data-t="' + it.join('|') + '">Hiking boots</span><span class="fzd-btn sm">Shop now</span></span></div></div>';
    } },
    sendtime: { n: 3, hint: 'Tap next subscriber', html: function () {
      var h = [30, 46, 82, 54, 38, 44, 66, 40];
      return '<div class="fzd-hours">' + h.map(function (v, i) { return '<i style="height:' + v + '%" ' + (i === 2 ? 'data-at="0"' : i === 4 ? 'data-at="1"' : i === 6 ? 'data-at="2"' : '') + ' class="' + ([2, 4, 6].indexOf(i) > -1 ? 'pk' : '') + '"></i>'; }).join('') + '</div>' +
        '<div class="fzd-row"><span class="fzd-tag" data-t="Sarah opens at 7:40 AM|Mike opens at 12:15 PM|Jen opens at 8:30 PM">Sarah opens at 7:40 AM</span></div>';
    } },
    abtest: { n: 3, hint: 'Tap to run the test', html: function (p) {
      var a = p.a || 'Spring sale inside', b = p.b || 'Sarah, 20% off ends Friday';
      return '<div class="fzd-ab"><div class="fzd-abrow"><span class="fzd-abk">A</span><span class="fzd-grow">' + esc(a) + '<div class="fzd-meter thin"><i data-w="4|30|38"></i></div></span></div>' +
        '<div class="fzd-abrow win"><span class="fzd-abk">B</span><span class="fzd-grow">' + esc(b) + '<div class="fzd-meter thin"><i data-w="4|52|74"></i></div></span><span class="fzd-crown" data-on="2">Winner</span></div></div>';
    } },
    fatigue: { n: 1, hint: 'Drag the slider', manual: true, html: function () {
      return '<div class="fzd-fat"><div class="fzd-row"><b>Emails per week</b><span class="fzd-grow"></span><b class="fzd-val">2</b></div>' +
        '<div class="fzd-track"><i class="fzd-fill"></i><span class="fzd-knob"></span><span class="fzd-sweet">Sweet spot</span></div>' +
        '<div class="fzd-gauges"><span>Engagement<div class="fzd-meter thin"><i class="g1"></i></div></span><span>Unsubscribes<div class="fzd-meter thin warn"><i class="g2"></i></div></span></div></div>';
    } },
    heat: { n: 2, hint: 'Tap for heatmap', html: function () {
      return '<div class="fzd-card fzd-email tall"><span class="fzd-imgph"></span><span class="fzd-lines"><i></i><i></i></span><span class="fzd-btn">Book your tune-up</span>' +
        '<span class="fzd-heat h1" data-on="1"></span><span class="fzd-heat h2" data-on="1"></span></div><span class="fzd-callout" data-t="Clear layout|Clicks land on the button">Clear layout</span>';
    } },
    listbuild: { n: 3, hint: 'Tap to subscribe', html: function () {
      return '<div class="fzd-card fzd-form"><b>Get spring deals first</b><div class="fzd-input"><span data-t="you@email.com|sarah@email.com|sarah@email.com">you@email.com</span></div><span class="fzd-btn sm" data-at="0,1">Join the list</span><span class="fzd-tag sm ok" data-on="2">' + CK + 'Confirmed opt-in</span></div>' +
        '<div class="fzd-count"><small>Subscribers</small><b data-t="1,204|1,204|1,205">1,204</b></div>';
    } },
    segments: { n: 3, hint: 'Tap to re-sort', html: function () {
      var dots = '', cx = [18, 50, 82], cnt = [[0, 0, 0], [0, 0, 0]];
      for (var i = 0; i < 15; i++) {
        var g1 = i % 3, g2 = Math.floor(i / 5) % 3, L = [], Tp = [];
        L.push(26 + (i % 5) * 12); Tp.push(24 + Math.floor(i / 5) * 20);
        [g1, g2].forEach(function (g, k) { var j = cnt[k][g]++; L.push(cx[g] - 6 + (j % 2) * 12); Tp.push(18 + Math.floor(j / 2) * 16); });
        dots += '<i class="fzd-dot c' + g1 + '" data-l="' + L.join('|') + '" data-tp="' + Tp.join('|') + '"></i>';
      }
      return '<div class="fzd-dots">' + dots + '<span class="fzd-glab" data-on="1" style="left:18%"><span data-t="|Goshen|This week">Goshen</span></span><span class="fzd-glab" data-on="1" style="left:50%"><span data-t="|Elkhart|This month">Elkhart</span></span><span class="fzd-glab" data-on="1" style="left:82%"><span data-t="|South Bend|Last year">South Bend</span></span></div><span class="fzd-callout" data-t="All contacts|Grouped by town|Grouped by last purchase">All contacts</span>';
    } },
    rewrite: { n: 2, hint: 'Tap to optimize', html: function () {
      return '<div class="fzd-card fzd-rw"><small class="fzd-meta">Email copy</small><b data-t="Check out our sale!|Sarah, your favorite boots are 20% off">Check out our sale!</b>' +
        '<div class="fzd-row"><small class="fzd-meta">Clarity</small><div class="fzd-meter fzd-grow"><i data-w="35|92"></i></div></div></div>';
    } },
    flow: { n: 4, hint: 'Tap to add a lead', html: function (p) {
      var st = p.st || ['Signs up', 'Welcome', 'Follow-up', 'Buys'];
      return '<div class="fzd-flow">' + st.map(function (t, i) { return '<span class="fzd-step" data-on="' + i + '"><i>' + (i + 1) + '</i>' + esc(t) + '</span>'; }).join('') +
        '</div><span class="fzd-token" data-x="0|1|2|3"></span>';
    } },
    channels: { n: 4, hint: 'Tap to send', html: function (p) {
      var ch = p.ch || ['Email', 'Text', 'Ad'];
      return '<div class="fzd-orbit"><span class="fzd-hub wide">One customer</span>' + ch.map(function (t, i) { return '<span class="fzd-ch c' + i + '" data-on="' + (i + 1) + '">' + esc(t) + CK + '</span>'; }).join('') +
        '</div><span class="fzd-callout" data-t="One plan|' + esc(ch[0]) + ' sent|' + esc(ch[1]) + ' follows up|' + esc(ch[2]) + ' reminds">One plan</span>';
    } },
    report: { n: 2, hint: 'Tap to switch range', html: function (p) {
      var k = p.k || ['Opens', 'Clicks', 'Sales'], a = p.a || ['48%', '6.1%', '$2.4k'], b = p.b || ['52%', '7.4%', '$9.8k'];
      return '<div class="fzd-dash"><div class="fzd-row"><span class="fzd-tabs2"><span data-at="0">Week</span><span data-at="1">Month</span></span><small class="fzd-meta light">Example report</small></div>' +
        '<div class="fzd-kpi3">' + k.map(function (t, i) { return '<span><small>' + esc(t) + '</small><b data-t="' + esc(a[i]) + '|' + esc(b[i]) + '">' + esc(a[i]) + '</b></span>'; }).join('') + '</div>' +
        '<div class="fzd-sparks">' + [40, 55, 48, 66, 60, 78, 72, 90].map(function (h, i) { return '<i style="height:' + h + '%"></i>'; }).join('') + '</div></div>';
    } },
    platforms: { n: 5, hint: 'Tap to pick a platform', html: function () {
      var pl = ['HubSpot', 'Klaviyo', 'Mailchimp', 'Zoho', 'NetSuite'], fit = ['B2B nurture', 'Ecommerce flows', 'Small business', 'Bookings & invoices', 'Order data'];
      return '<div class="fzd-chips">' + pl.map(function (t, i) { return '<span data-at="' + i + '">' + t + '</span>'; }).join('') + '</div>' +
        '<div class="fzd-card fzd-fit"><small class="fzd-meta">Best fit for</small><b data-t="' + fit.join('|') + '">' + fit[0] + '</b><div class="fzd-flow mini"><span class="fzd-step on"><i>1</i></span><b class="fzd-arr"></b><span class="fzd-step on"><i>2</i></span><b class="fzd-arr"></b><span class="fzd-step on"><i>3</i></span></div></div>';
    } },
    conditional: { n: 3, hint: 'Tap to change the order status', html: function (p) {
      var c = p.c || ['Ordered', 'Shipped', 'Delivered'], h = p.h || ['Thanks, Sarah! Your order is in', 'Your boots shipped via UPS', 'Delivered! How do they fit?'], bt = p.b || ['View order', 'Track package', 'Leave a review'];
      return '<div class="fzd-chips">' + c.map(function (t, i) { return '<span data-at="' + i + '">' + esc(t) + '</span>'; }).join('') + '</div>' +
        '<div class="fzd-card fzd-email"><small class="fzd-meta">One template · <span data-t="if ordered|if shipped|if delivered">if ordered</span></small><b data-t="' + T(h) + '">' + first(h) + '</b><span class="fzd-btn sm" data-t="' + T(bt) + '">' + first(bt) + '</span></div>';
    } },
    funnel: { n: function (p) { return (p.st || [1, 2, 3, 4]).length; }, hint: 'Tap to move them along', html: function (p) {
      var st = p.st || ['Welcome', 'Nurture', 'Offer', 'Win-back'];
      return '<div class="fzd-funnel">' + st.map(function (t, i) { return '<span class="fzd-fl" style="width:' + (100 - i * (56 / st.length)) + '%" data-at="' + i + '">' + esc(t) + '</span>'; }).join('') + '</div>';
    } },
    geoai: { n: 4, hint: 'Tap to add a service town', html: function () {
      var t = [['Goshen', 20, 34], ['Elkhart', 46, 22], ['Middlebury', 74, 30], ['South Bend', 80, 70]];
      return '<div class="fzd-map full">' + '<i class="r1"></i><i class="r2"></i>' + t.map(function (x, i) { return '<span class="fzd-town" style="left:' + x[1] + '%;top:' + x[2] + '%"><i class="fzd-dotp aidot" data-on="' + i + '"></i>' + x[0] + '</span>'; }).join('') + '</div>' +
        '<div class="fzd-msg bot fzd-geomsg"><i class="fzd-spark dark"></i> AI knows you serve <b data-t="Goshen|Goshen + Elkhart|3 towns|4 towns">Goshen</b></div>';
    } },
    nurture: { n: 4, hint: 'Tap to nurture the lead', html: function () {
      var ev = ['Downloaded a guide', 'Opened 2 emails', 'Visited pricing page'];
      return '<div class="fzd-card fzd-feed"><small class="fzd-meta">Lead: Sarah Jones</small>' + ev.map(function (t, i) { return '<div class="fzd-ev" data-on="' + (i + 1) + '">' + CK + t + '</div>'; }).join('') +
        '<div class="fzd-row"><small class="fzd-meta">Lead score</small><div class="fzd-meter fzd-grow"><i data-w="10|35|60|92"></i></div></div></div>' +
        '<span class="fzd-tag fzd-tagfloat right2" data-on="3">Sales alert sent</span>';
    } },
    migrate: { n: 3, hint: 'Tap to watch the shift', html: function () {
      var d = '';
      for (var i = 0; i < 12; i++) { var c = i % 4, r = Math.floor(i / 4); d += '<i class="fzd-person" data-l="' + [12 + c * 8, (i < 4 ? 62 + c * 8 : 12 + c * 8), (i < 8 ? 62 + (c) * 8 : 12 + c * 8)].join('|') + '" data-tp="' + [36 + r * 22, 36 + r * 22, 36 + r * 22].join('|') + '"></i>'; }
      return '<div class="fzd-dots"><span class="fzd-zonel l"><b>Searching</b></span><span class="fzd-zonel r"><b>Asking AI</b></span>' + d + '</div>' +
        '<span class="fzd-callout" data-t="How people looked things up|More people ask AI|AI answers are the new front page">How people looked things up</span>';
    } },
    paa: { n: 3, hint: 'Tap a question', html: function () {
      return '<div class="fzd-card fzd-rich"><small class="fzd-meta navy">People also ask</small>' + ['How often should a furnace be serviced?', 'What does a tune-up include?', 'How much does a tune-up cost?'].map(function (q, i) { return '<div class="fzd-acc"><b>' + q + '</b><small class="fzd-meta fzd-ans" data-at="' + i + '">Answer from <b>yourbusiness.com</b></small></div>'; }).join('') + '</div>';
    } },
    signals: { n: 3, hint: 'Tap for next action', html: function () {
      var ev = ['Opened spring email', 'Clicked hiking boots', 'Bought boots'], tag = ['Engaged', 'Interested: boots', 'Customer: boots'];
      return '<div class="fzd-card fzd-feed"><small class="fzd-meta">Live activity · Sarah</small>' + ev.map(function (t, i) { return '<div class="fzd-ev" data-on="' + i + '">' + CK + esc(t) + '</div>'; }).join('') + '</div>' +
        '<span class="fzd-tag fzd-tagfloat" data-t="' + tag.join('|') + '">' + tag[0] + '</span>';
    } },
    contact: { n: 3, hint: 'Tap for next touch', html: function () {
      return '<div class="fzd-card fzd-contact"><div class="fzd-row"><span class="fzd-logo">SJ</span><div class="fzd-grow"><b>Sarah Jones</b><small>Lead · Goshen</small></div><span class="fzd-pill" data-t="New|Engaged|Customer">New</span></div>' +
        ['Filled out quote form', 'Opened follow-up email', 'Booked a call'].map(function (t, i) { return '<div class="fzd-ev" data-on="' + i + '">' + CK + t + '</div>'; }).join('') + '</div>';
    } },
    pipeline: { n: 3, hint: 'Drag the deal', html: function () {
      return '<div class="fzd-kan"><span><small>New</small></span><span><small>Talking</small></span><span><small>Won</small></span><b class="fzd-deal" data-x="0|1|2">Sarah · $4,200</b></div>';
    } },
    ticket: { n: 3, hint: 'Tap to resolve', html: function () {
      return '<div class="fzd-card fzd-ticket"><div class="fzd-row"><b>Ticket #1042</b><span class="fzd-grow"></span><span class="fzd-pill" data-t="New|In progress|Closed">New</span></div><small class="fzd-meta">"My invoice shows the wrong date."</small>' +
        '<div class="fzd-meter"><i data-w="10|60|100"></i></div><span class="fzd-tag sm ok" data-on="2">' + CK + 'Happy customer</span></div>';
    } },
    serpad: { n: 3, hint: 'Tap to click the ad', html: function () {
      return search('furnace repair near me') + '<div class="fzd-card fzd-ad"><small class="fzd-meta"><b class="fzd-spons">Sponsored</b> yourbusiness.com</small><b>Same-Day Furnace Repair · Goshen</b><span class="fzd-row"><span class="fzd-pill">Call now</span><span class="fzd-pill">Get a quote</span></span></div>' +
        '<span class="fzd-cursor" data-at="1"></span><span class="fzd-tag fzd-tagfloat ok" data-on="2">' + CK + 'New call from the ad</span>';
    } },
    lsa: { n: 3, hint: 'Tap to call', html: function () {
      return '<div class="fzd-card fzd-lsa"><span class="fzd-gg">' + CK + 'Google Verified</span><div class="fzd-row"><span class="fzd-logo">YB</span><div class="fzd-grow"><b>Your Business</b><small>4.9 ' + '· Serves Goshen</small></div></div>' +
        '<span class="fzd-btn sm" data-at="0">Call</span><span class="fzd-tag sm ok" data-on="1">' + CK + '<span data-t="Calling…|Calling…|Lead received">Calling…</span></span></div><small class="fzd-meta light fzd-note">You pay for leads, not clicks</small>';
    } },
    apple: { n: 2, hint: 'Tap for directions', html: function () {
      return '<div class="fzd-map"><i class="r1"></i><i class="r2"></i><i class="r3"></i><span class="fzd-pin you"><b>★</b></span><span class="fzd-me"></span><svg class="fzd-route" viewBox="0 0 100 100" preserveAspectRatio="none"><path data-on="1" d="M18 82 L18 54 L62 54 L62 30"/></svg></div>' +
        '<div class="fzd-card fzd-amad"><small class="fzd-meta"><b class="fzd-spons">Ad</b> Apple Maps</small><b>Your Business</b><small class="fzd-meta" data-t="Open now · 1.2 mi|8 min drive">Open now · 1.2 mi</small></div>';
    } },
    bing: { n: 2, hint: 'Tap to switch view', html: function () {
      return '<div class="fzd-chips"><span data-at="0">Bing search</span><span data-at="1">Copilot</span></div>' +
        '<div class="fzd-card fzd-ad"><small class="fzd-meta"><b class="fzd-spons">Ad</b> yourbusiness.com</small><b data-t="Licensed Electricians · Elkhart|Copilot suggests Your Business">Licensed Electricians · Elkhart</b><span class="fzd-lines"><i></i></span></div>';
    } },
    plan: { n: 3, hint: 'Tap to change the goal', html: function () {
      return '<div class="fzd-chips"><span data-at="0">Leads</span><span data-at="1">Sales</span><span data-at="2">Awareness</span></div>' +
        '<div class="fzd-split">' + [['Facebook', '50|30|40'], ['Instagram', '30|45|35'], ['Retargeting', '20|25|25']].map(function (r) { return '<div class="fzd-sp"><small>' + r[0] + '</small><div class="fzd-meter"><i data-w="' + r[1] + '"></i></div></div>'; }).join('') + '</div>';
    } },
    creative: { n: 3, hint: 'Swipe the ads', html: function () {
      var c = [['#0A89A3', 'Spring tune-ups are booking fast'], ['#064187', 'Meet the team behind your repairs'], ['#1f9d61', 'Rated 4.9 by your neighbors']];
      return '<div class="fzd-phone"><div class="fzd-feedhd"><span class="fzd-logo sm">YB</span>Your Business<small>Sponsored</small></div><div class="fzd-slides" data-x="0|-100|-200">' +
        c.map(function (x) { return '<div class="fzd-slide" style="background:' + x[0] + '"><b>' + x[1] + '</b></div>'; }).join('') + '</div><span class="fzd-btn xs">Book now</span></div>' +
        '<span class="fzd-callout right" data-t="Version 1|Version 2|Version 3">Version 1</span>';
    } },
    landing: { n: 3, hint: 'Tap to follow the click', html: function () {
      return '<div class="fzd-three"><div class="fzd-card mini" data-on="0"><small class="fzd-meta">Ad</small><b>20% off patios</b></div><b class="fzd-arr"></b>' +
        '<div class="fzd-card mini" data-on="1"><small class="fzd-meta">Landing page</small><b>Patio quote</b><span class="fzd-input sm"></span></div><b class="fzd-arr"></b>' +
        '<div class="fzd-card mini ok" data-on="2">' + CK + '<b>New lead</b></div></div>';
    } },
    radius: { n: 3, hint: 'Tap to change reach', html: function () {
      return '<div class="fzd-map"><i class="r1"></i><i class="r2"></i><span class="fzd-rad" data-w="34|52|74"></span><span class="fzd-pin you"><b>★</b></span></div>' +
        '<div class="fzd-card fzd-amad"><small class="fzd-meta">Within <span data-t="5|10|25">5</span> miles</small><b><span data-t="18,000|42,000|96,000">18,000</span> people</b><small class="fzd-meta">Example audience</small></div>';
    } },
    daily: { n: 2, hint: 'Tap to rebalance', html: function () {
      return '<div class="fzd-split">' + [['Ad A', '50|20', 'Low clicks'], ['Ad B', '50|80', 'Strong clicks']].map(function (r) { return '<div class="fzd-sp"><small>' + r[0] + ' · ' + r[2] + '</small><div class="fzd-meter"><i data-w="' + r[1] + '"></i></div></div>'; }).join('') +
        '</div><span class="fzd-tag" data-t="Budget split evenly|Budget moved to what works">Budget split evenly</span>';
    } },
    pixel: { n: 4, hint: 'Tap to track a visit', html: function (p) {
      var ev = p.ev || ['Page view', 'Form started', 'Lead submitted', 'Booked'];
      return '<div class="fzd-card fzd-feed"><small class="fzd-meta">' + esc(p.t || 'Conversion tracking') + '</small>' + ev.map(function (t, i) { return '<div class="fzd-ev" data-on="' + i + '">' + CK + esc(t) + '</div>'; }).join('') + '</div>';
    } },
    audit: { n: 3, hint: 'Tap to scan', html: function () {
      return '<div class="fzd-audit"><span class="fzd-score"><b data-t="54|71|92">54</b><small>Site score</small></span><div class="fzd-stack">' +
        ['Slow mobile pages', 'Missing title tags', 'Broken links'].map(function (t, i) { return '<div class="fzd-li wide"><span>' + t + '</span><span class="fzd-grow"></span><i class="fzd-warn" data-at="0"></i><span data-on="' + (i < 2 ? 1 : 2) + '">' + CK + '</span></div>'; }).join('') + '</div></div><span class="fzd-scan" data-at="0"></span>';
    } },
    onpage: { n: 2, hint: 'Tap to optimize', html: function () {
      return '<div class="fzd-card fzd-res big"><small class="fzd-url">yourbusiness.com › roof-repair</small><b data-t="Home|Roof Repair in Goshen, IN · Free Estimates">Home</b><small class="fzd-meta" data-t="Welcome to our website.|Licensed local roofers. Same-week repairs. Call for a free estimate.">Welcome to our website.</small></div>' +
        '<div class="fzd-row"><small class="fzd-meta light">Page score</small><div class="fzd-meter fzd-grow"><i data-w="30|94"></i></div></div>';
    } },
    vitals: { n: 2, hint: 'Tap to fix', html: function () {
      return '<div class="fzd-vitals">' + [['Load', '4.8s|1.6s'], ['Response', '480ms|120ms'], ['Stability', '0.31|0.02']].map(function (r) { return '<span class="fzd-gauge"><i class="fzd-arc" data-on="1"></i><b data-t="' + r[1] + '">' + r[1].split('|')[0] + '</b><small>' + r[0] + '</small></span>'; }).join('') + '</div>' +
        '<span class="fzd-callout" data-t="Needs work|Fast and stable">Needs work</span>';
    } },
    cluster: { n: 4, hint: 'Tap to add a post', html: function () {
      return net([['Patio costs', 16, 14, 1, '', 1], ['Materials', 84, 14, 1, '', 1], ['Timeline', 16, 80, 2, '', 2], ['Permits', 84, 80, 3, '', 3]], 'Pillar: Patios', 'wide') +
        '<span class="fzd-callout" data-t="One pillar page|Cluster posts link in|More topics covered|Topic authority">One pillar page</span>';
    } },
    optin: { n: 3, hint: 'Tap to join', html: function () {
      return '<div class="fzd-phone"><div class="fzd-feedhd">Messages</div><div class="fzd-thread"><div class="fzd-msg user sm" data-on="1">JOIN</div>' +
        '<div class="fzd-msg bot sm" data-on="2">You’re in! Deals 2x/month. Reply STOP to opt out.</div></div></div>' +
        '<div class="fzd-card fzd-amad"><small class="fzd-meta">Sign at the counter</small><b>Text JOIN to 55555</b><span class="fzd-tag sm ok" data-on="2">' + CK + 'Consent saved</span></div>';
    } },
    broadcast: { n: 2, hint: 'Tap to send', html: function () {
      var ph = '';
      for (var i = 0; i < 8; i++) ph += '<span class="fzd-mini-ph" data-on="1" style="transition-delay:' + (i * 70) + 'ms"><i></i></span>';
      return '<div class="fzd-card fzd-amad left"><small class="fzd-meta">Text blast</small><b>Flash sale: 20% off today</b></div><div class="fzd-phgrid">' + ph + '</div>' +
        '<span class="fzd-tag fzd-tagfloat" data-t="Ready to send|Delivered to your list">Ready to send</span>';
    } },
    smsflow: { n: 3, hint: 'Tap to reply', html: function () {
      return '<div class="fzd-phone wide"><div class="fzd-feedhd">Your Business</div><div class="fzd-thread"><div class="fzd-msg bot sm">Reminder: 2 PM tomorrow. Reply C to confirm.</div>' +
        '<div class="fzd-msg user sm" data-on="1">C</div><div class="fzd-msg bot sm" data-on="2">Confirmed! See you then.</div></div></div>';
    } },
    socialplan: { n: 3, hint: 'Tap to change the goal', html: function () {
      return '<div class="fzd-chips"><span data-at="0">Get calls</span><span data-at="1">Build trust</span><span data-at="2">Hire staff</span></div>' +
        '<div class="fzd-split">' + [['Facebook', '80|60|40'], ['Instagram', '45|80|35'], ['LinkedIn', '15|30|85']].map(function (r) { return '<div class="fzd-sp"><small>' + r[0] + '</small><div class="fzd-meter"><i data-w="' + r[1] + '"></i></div></div>'; }).join('') + '</div>';
    } },
    postdesign: { n: 3, hint: 'Tap to restyle', html: function () {
      return '<div class="fzd-post-sq"><span class="fzd-sq s0" data-at="0"><b>Spring Hours</b><small>Open late Fridays</small></span><span class="fzd-sq s1" data-at="1"><b>Meet Jake</b><small>15 years on the job</small></span><span class="fzd-sq s2" data-at="2"><b>4.9 Stars</b><small>Thank you, Goshen!</small></span></div>' +
        '<span class="fzd-callout right" data-t="Announcement|Team spotlight|Review post">Announcement</span>';
    } },
    calendar: { n: 4, hint: 'Tap to schedule', html: function () {
      var d = ['M', 'T', 'W', 'T', 'F', 'S', 'S'], c = '';
      d.forEach(function (x, i) { c += '<span class="fzd-day"><small>' + x + '</small>' + (i === 0 ? '<i class="fzd-ps" data-on="1"></i>' : i === 2 ? '<i class="fzd-ps b" data-on="2"></i>' : i === 4 ? '<i class="fzd-ps c" data-on="3"></i>' : '') + '</span>'; });
      return '<div class="fzd-cal">' + c + '</div><span class="fzd-callout" data-t="This week|Monday: tip video|Wednesday: project photo|Friday: customer review">This week</span>';
    } },
    community: { n: 3, hint: 'Tap to reply', html: function () {
      return '<div class="fzd-card fzd-feed"><div class="fzd-msg user sm">Do you service boats too?</div><div class="fzd-msg bot sm" data-on="1">We sure do! DM us for a spring slot.</div>' +
        '<div class="fzd-row"><span class="fzd-heart" data-on="2"></span><small class="fzd-meta" data-t="Replied in 2 min|Replied in 2 min|Liked by Mark">Replied in 2 min</small></div></div>';
    } },
    design: { n: 3, hint: 'Tap to restyle', html: function () {
      return '<div class="fzd-card fzd-site t0" data-on="0"><div class="fzd-browser"><i></i><i></i><i></i></div><div class="fzd-sitehero"><b data-t="Comfort, Fixed Fast|Built Right in Goshen|Your Smile, Our Craft">Comfort, Fixed Fast</b><span class="fzd-btn xs">Book now</span></div><div class="fzd-sitecards"><i></i><i></i><i></i></div></div>' +
        '<span class="fzd-callout right" data-t="HVAC brand|Contractor brand|Dental brand">HVAC brand</span>';
    } },
    ux: { n: 3, hint: 'Tap to follow a visitor', html: function () {
      return '<div class="fzd-tree"><span class="fzd-tn top" data-at="0,1,2">Home</span><div class="fzd-row c">' + ['Services', 'About', 'Contact'].map(function (t, i) { return '<span class="fzd-tn" ' + (i === 0 ? 'data-at="1,2"' : i === 2 ? 'data-at="2"' : '') + '>' + t + '</span>'; }).join('') + '</div></div>' +
        '<span class="fzd-callout" data-t="Visitor lands on Home|Tap 1: Services|Tap 2: Contact. Done.">Visitor lands on Home</span>';
    } },
    responsive: { n: 3, hint: 'Tap to resize', html: function () {
      return '<div class="fzd-dev" data-w="92|58|30"><div class="fzd-browser"><i></i><i></i><i></i></div><div class="fzd-sitehero"><b>Your Business</b><span class="fzd-btn xs">Call</span></div><div class="fzd-sitecards"><i></i><i></i><i></i></div></div>' +
        '<span class="fzd-callout right" data-t="Desktop|Tablet|Phone">Desktop</span>';
    } },
    security: { n: 2, hint: 'Tap to test the lock', html: function () {
      return '<div class="fzd-sec"><span class="fzd-lock" data-on="1"></span><div class="fzd-stack">' + ['HTTPS everywhere', 'Spam-proof forms', 'Daily backups'].map(function (t) { return '<div class="fzd-li wide">' + CK + t + '</div>'; }).join('') + '</div></div>' +
        '<span class="fzd-tag fzd-tagfloat" data-t="Protected|Bad request blocked">Protected</span>';
    } },
    qa: { n: 4, hint: 'Tap to run checks', html: function () {
      return '<div class="fzd-stack">' + ['Phone and desktop tested', 'Forms deliver', 'Pages load fast', 'Ready to launch'].map(function (t, i) { return '<div class="fzd-li wide"><span class="fzd-qck" data-on="' + (i + 1) + '">' + CK + '</span>' + t + '</div>'; }).join('') + '</div>';
    } },
    own: { n: 3, hint: 'Tap to hand over', html: function () {
      return '<div class="fzd-stack">' + ['Domain', 'Hosting', 'Logins and files'].map(function (t, i) { return '<div class="fzd-li wide"><b>' + t + '</b><span class="fzd-grow"></span><span class="fzd-owner" data-t="' + (i === 0 ? 'Agency|You|You' : i === 1 ? 'Agency|Agency|You' : 'Agency|Agency|You') + '">Agency</span></div>'; }).join('') + '</div>' +
        '<span class="fzd-key" data-x="0|30|60"></span>';
    } },

    areas: { n: 5, hint: 'Tap to add a town page', html: function () {
      var t = [['Goshen', 22, 30], ['Elkhart', 50, 18], ['Middlebury', 76, 34], ['Nappanee', 30, 70], ['Bristol', 70, 72]];
      return '<div class="fzd-map full"><i class="r1"></i><i class="r2"></i>' + t.map(function (x, i) { return '<span class="fzd-town" style="left:' + x[1] + '%;top:' + x[2] + '%"><i class="fzd-dotp"></i>' + x[0] + '<span class="fzd-tpage" data-on="' + (i < 1 ? 0 : i) + '">' + CK + 'Page live</span></span>'; }).join('') + '</div>' +
        '<span class="fzd-callout" data-t="1 service area page|2 service area pages|3 service area pages|4 service area pages|5 service area pages">1 service area page</span>';
    } },
    dental: { n: 3, hint: 'Tap to book', html: function () {
      return '<div class="fzd-card fzd-gbp"><div class="fzd-row"><span class="fzd-logo">YP</span><div class="fzd-grow"><b>Your Practice</b><small>Dentist · Open today</small></div>' + stars(5) + '</div>' +
        '<div class="fzd-slots"><span>Tue 9:00</span><span data-at="1,2" class="pick">Tue 10:30</span><span>Wed 2:00</span></div>' +
        '<span class="fzd-btn sm" data-at="0,1">Book appointment</span><span class="fzd-tag sm ok" data-on="2">' + CK + 'New patient booked</span></div>';
    } },
    homesvc: { n: 3, hint: 'Tap for an emergency search', html: function () {
      var towns = ['Goshen', 'Elkhart', 'Bristol', 'Wakarusa', 'Syracuse'];
      return search('emergency plumber near me') + '<div class="fzd-row mt"><span class="fzd-tag sm" data-t="2:14 AM|2:14 AM|2:15 AM">2:14 AM</span><span class="fzd-card fzd-mini-res"><b>Your Business</b><small class="fzd-meta">Open 24 hours</small></span></div>' +
        '<div class="fzd-chips sm">' + towns.map(function (t, i) { return '<span class="fzd-lit" data-on="' + (i < 2 ? 1 : 2) + '">' + t + '</span>'; }).join('') + '</div>';
    } },
    auto: { n: 3, hint: 'Tap for the next post', html: function () {
      var v = [['2022 Ford F-150', '$38,900', '#0A89A3'], ['2021 Honda CR-V', '$26,450', '#064187'], ['Oil change special', '$39.99', '#1f9d61']];
      return '<div class="fzd-card fzd-autopost"><small class="fzd-meta">Google Business Profile post</small><div class="fzd-row"><span class="fzd-car">' + v.map(function (x, i) { return '<i data-at="' + i + '" style="background:' + x[2] + '"></i>'; }).join('') + '<b class="fzd-carico"></b></span>' +
        '<div class="fzd-grow"><b data-t="' + v.map(function (x) { return x[0]; }).join('|') + '">' + v[0][0] + '</b><small class="fzd-meta" data-t="' + v.map(function (x) { return x[1]; }).join('|') + '">' + v[0][1] + '</small><span class="fzd-btn xs">View on lot</span></div></div></div>' +
        '<span class="fzd-callout right" data-t="Lot 1: Goshen|Lot 2: Elkhart|Service bay">Lot 1: Goshen</span>';
    } },
    hood: { n: 3, hint: 'Tap a neighborhood', html: function () {
      return '<div class="fzd-map"><i class="r1"></i><i class="r2"></i><span class="fzd-zone z0" data-at="0"></span><span class="fzd-zone z1" data-at="1"></span><span class="fzd-zone z2" data-at="2"></span></div>' +
        '<div class="fzd-card fzd-amad"><small class="fzd-meta">Neighborhood guide</small><b data-t="Living Downtown|Living Lakeside|Living Northside">Living Downtown</b><small class="fzd-meta" data-t="12 homes for sale|8 homes for sale|15 homes for sale">12 homes for sale</small></div>';
    } },
    classes: { n: 3, hint: 'Tap for the next class', html: function () {
      return '<div class="fzd-card fzd-sched"><small class="fzd-meta">Google post · Today’s classes</small>' + [['6:00 AM', 'Spin'], ['12:00 PM', 'Yoga'], ['6:00 PM', 'Strength']].map(function (r, i) { return '<div class="fzd-cls" data-at="' + i + '"><b>' + r[0] + '</b><span>' + r[1] + '</span><span class="fzd-grow"></span><span class="fzd-pill">Join</span></div>'; }).join('') + '</div>' +
        '<div class="fzd-count"><small>Reviews</small><b data-t="186|187|188">186</b></div>';
    } },
    dealers: { n: 3, hint: 'Tap to find a dealer', html: function () {
      var d = [['Elkhart', 30, 32], ['Warsaw', 62, 70], ['South Bend', 18, 62], ['Fort Wayne', 82, 46], ['Goshen', 48, 22]];
      return '<div class="fzd-map"><i class="r1"></i><i class="r2"></i>' + d.map(function (x, i) { return '<span class="fzd-dealer" style="left:' + x[1] + '%;top:' + x[2] + '%" ' + (i < 3 ? 'data-at="' + i + '"' : '') + '></span>'; }).join('') + '</div>' +
        '<div class="fzd-card fzd-amad"><small class="fzd-meta">Find a dealer</small><b data-t="Elkhart location|Warsaw location|South Bend location">Elkhart location</b><small class="fzd-meta" data-t="Page + map listing|Page + map listing|Page + map listing">Page + map listing</small></div>';
    } },
    practice: { n: 3, hint: 'Tap a practice area', html: function () {
      return '<div class="fzd-chips"><span data-at="0">Estate planning</span><span data-at="1">Tax prep</span><span data-at="2">Business law</span></div>' +
        '<div class="fzd-card fzd-email"><small class="fzd-url">yourfirm.com/<span data-t="estate-planning-goshen|tax-preparation-elkhart|business-law-south-bend">estate-planning-goshen</span></small><b data-t="Estate Planning Attorney in Goshen|Tax Preparation in Elkhart|Business Law in South Bend">Estate Planning Attorney in Goshen</b><span class="fzd-gg">' + CK + 'Compliance reviewed</span></div>';
    } },
    menu: { n: 3, hint: 'Tap for the lunch rush', html: function () {
      return '<div class="fzd-card fzd-menu"><div class="fzd-row"><b>Menu</b><span class="fzd-grow"></span><span class="fzd-pill">{ } Menu schema</span></div>' +
        [['Margherita pizza', '$14'], ['Garden salad', '$9'], ['Cannoli', '$5']].map(function (r) { return '<div class="fzd-mrow"><span>' + r[0] + '</span><span class="fzd-dots2"></span><b>' + r[1] + '</b></div>'; }).join('') + '</div>' +
        '<div class="fzd-busy"><small>Busy now</small><div class="fzd-hours mini">' + [30, 55, 90, 70, 40].map(function (h, i) { return '<i style="height:' + h + '%" class="' + (i === 2 ? 'pk on' : '') + '"></i>'; }).join('') + '</div><small class="fzd-meta light" data-t="212 reviews|214 reviews|217 reviews">212 reviews</small></div>';
    } },
    sources: { n: 4, hint: 'Tap to add a trusted source', html: function () {
      var src = ['Chamber of commerce', 'Local news story', 'Industry directory'];
      return '<div class="fzd-chat"><div class="fzd-msg bot">Top pick: <b>Your Business</b></div><div class="fzd-srcs">' + src.map(function (t, i) { return '<span class="fzd-src-chip" data-on="' + (i + 1) + '">' + t + '</span>'; }).join('') + '</div></div>' +
        '<div class="fzd-auth"><small>AI confidence</small><div class="fzd-meter"><i data-w="22|48|72|94"></i></div></div>';
    } },
    qmap: { n: 4, hint: 'Tap to map questions', html: function () {
      var c = [['Info', 'What is a heat pump?'], ['Compare', 'Heat pump vs furnace?'], ['Local', 'HVAC near Goshen?'], ['Buy', 'Heat pump cost installed?']];
      return '<div class="fzd-qgrid">' + c.map(function (x, i) { return '<div class="fzd-q" data-on="' + i + '"><small>' + x[0] + '</small><b>' + x[1] + '</b><span class="fzd-qsc">' + [72, 64, 91, 86][i] + '</span></div>'; }).join('') + '</div>';
    } },
    answerfmt: { n: 4, hint: 'Tap to switch format', html: function () {
      return '<div class="fzd-chips"><span data-at="0">Paragraph</span><span data-at="1">Steps</span><span data-at="2">Table</span><span data-at="3">Definition</span></div>' +
        '<div class="fzd-card fzd-fmt"><div data-at="0"><span class="fzd-lines"><i></i><i></i><i></i></span><small class="fzd-meta">40 to 60 word answer</small></div>' +
        '<div data-at="1" class="fzd-steps"><span>1. Turn off the water</span><span>2. Remove the handle</span><span>3. Replace the washer</span></div>' +
        '<div data-at="2" class="fzd-tbl"><span>Option</span><span>Cost</span><span>Furnace</span><span>$</span><span>Heat pump</span><span>$$</span></div>' +
        '<div data-at="3"><b>AEO:</b> structuring content so search engines show it as the answer.</div></div>';
    } },
    faqschema: { n: 2, hint: 'Tap to see the result', html: function () {
      return '<div class="fzd-code" data-at="0"><span><em>"@type"</em>: "FAQPage",</span><span><em>"name"</em>: "Do you offer free estimates?",</span><span><em>"text"</em>: "Yes, every estimate is free."</span></div>' +
        '<div class="fzd-card fzd-rich" data-on="1"><small class="fzd-url">yourbusiness.com › faq</small><div class="fzd-acc open"><b>Do you offer free estimates?</b><small class="fzd-meta">Yes, every estimate is free.</small></div><div class="fzd-acc"><b>How fast can you come out?</b></div></div>';
    } },
    snipwins: { n: 3, hint: 'Tap for this month', html: function () {
      return '<div class="fzd-stack">' + [['What is a heat pump?', 'Won|Won|Won', ''], ['Heat pump cost?', 'Lost|Refreshed|Won', 'x'], ['Best HVAC in Goshen?', 'New|Targeted|Won', 'x']].map(function (r) { return '<div class="fzd-li wide"><span>' + r[0] + '</span><span class="fzd-grow"></span><span class="fzd-st" data-t="' + r[1] + '">' + r[1].split('|')[0] + '</span></div>'; }).join('') + '</div>' +
        '<span class="fzd-tag fzd-tagfloat" data-t="Answer boxes: 1|Answer boxes: 1|Answer boxes: 3">Answer boxes: 1</span>';
    } },
    anatomy: { n: 5, hint: 'Tap to optimize', html: function () {
      return '<div class="fzd-card fzd-anat">' + [['Subject', 'Sarah, your boots are back'], ['Preheader', 'Sizes 7 to 10 in stock'], ['Headline', 'Back in stock'], ['Button', 'Shop boots']].map(function (r, i) { return '<div class="fzd-ar" data-on="' + (i + 1) + '"><small>' + r[0] + '</small><b>' + r[1] + '</b>' + CK + '</div>'; }).join('') + '</div>';
    } },
    aio: { n: 2, hint: 'Tap to search', html: function () {
      return search('best gutter cleaning in elkhart') + '<div class="fzd-card fzd-aiov"><small class="fzd-meta navy"><i class="fzd-spark dark"></i>AI Overview</small><span class="fzd-lines"><i></i><i></i></span>' +
        '<div class="fzd-srcs">' + ['yourbusiness.com', 'angi.com', 'localnews.com', 'bbb.org'].map(function (t, i) { return '<span class="fzd-src-chip' + (i === 0 ? ' me' : '') + '" data-on="' + (i === 0 ? 1 : 0) + '">' + t + '</span>'; }).join('') + '</div></div>';
    } },
    perplex: { n: 3, hint: 'Tap to ask Perplexity', html: function () {
      return '<div class="fzd-chathead"><i class="fzd-spark"></i>Perplexity</div><div class="fzd-card fzd-pp"><span>Top-rated roofers near Goshen include <b>Your Business</b><sup data-on="1">1</sup> and two others<sup data-on="2">2</sup>.</span>' +
        '<div class="fzd-srcs">' + ['1 yourbusiness.com', '2 bbb.org'].map(function (t, i) { return '<span class="fzd-src-chip' + (i === 0 ? ' me' : '') + '" data-on="' + (i + 1) + '">' + t + '</span>'; }).join('') + '</div></div>';
    } },
    copilot: { n: 3, hint: 'Tap to ask Copilot', html: function () {
      return '<div class="fzd-win"><div class="fzd-winbar"><i></i><i></i><i></i><span>Microsoft 365 · Copilot</span></div><div class="fzd-winbody"><div class="fzd-msg user sm">Find a local supplier for powder coating.</div>' +
        '<div class="fzd-msg bot sm" data-on="1">Suggested supplier: <b>Your Business</b>, Elkhart</div><span class="fzd-cite" data-on="2">Source: yourbusiness.com</span></div></div>';
    } },
    gemini: { n: 3, hint: 'Tap to ask Gemini', html: function () {
      return '<div class="fzd-phone wide gem"><div class="fzd-feedhd"><i class="fzd-spark dark"></i>Gemini</div><div class="fzd-thread"><div class="fzd-msg user sm">Kid-friendly dentist near me?</div>' +
        '<div class="fzd-msg bot sm" data-on="1"><b>Your Practice</b> · 4.9 · Open today</div><span class="fzd-row" data-on="2"><span class="fzd-pill">Directions</span><span class="fzd-pill">Call</span></span></div></div>';
    } },
    siri: { n: 3, hint: 'Tap to ask Siri', html: function () {
      return '<div class="fzd-phone wide siri"><div class="fzd-orb" data-on="0"></div><div class="fzd-thread c"><div class="fzd-msg user sm" data-on="1">"Where can I get my car detailed?"</div><div class="fzd-msg bot sm" data-on="2">"<b>Your Business</b> on Main St. is open until 6."</div></div></div>';
    } },
    trust: { n: 5, hint: 'Tap to add a signal', html: function () {
      return '<div class="fzd-sigs">' + ['Clear facts', 'Reviews', 'Schema', 'Mentions'].map(function (t, i) { return '<span class="fzd-sig" data-on="' + (i + 1) + '">' + CK + t + '</span>'; }).join('') + '</div>' +
        '<div class="fzd-auth wide"><small data-t="AI trust: low|AI trust: building|AI trust: building|AI trust: strong|AI cites you">AI trust: low</small><div class="fzd-meter"><i data-w="12|35|58|80|100"></i></div></div>';
    } },
    kwtable: { n: 3, hint: 'Tap to sort', html: function () {
      var rows = [['roof repair goshen', '320', 'Buy', 0], ['metal roof cost', '880', 'Research', 1], ['roofer near me', '1.2k', 'Buy', 2]];
      return '<div class="fzd-card fzd-kwt"><div class="fzd-kwh"><span>Keyword</span><span>Searches</span><span>Intent</span></div>' + rows.map(function (r, i) { return '<div class="fzd-kwr" data-y="' + ['0|52|0', '0|0|26', '0|-52|-26'][i] + '"><span>' + r[0] + '</span><span>' + r[1] + '</span><span class="fzd-in2 ' + (r[2] === 'Buy' ? 'b' : '') + '">' + r[2] + '</span></div>'; }).join('') + '</div>' +
        '<span class="fzd-callout" data-t="All keywords|Sorted by volume|Sorted by buyer intent">All keywords</span>';
    } },
    backlinks: { n: 4, hint: 'Tap to earn a link', html: function () {
      return '<div class="fzd-stack">' + [['Local news feature', 72], ['Industry association', 64], ['Supplier blog', 48]].map(function (r, i) { return '<div class="fzd-li wide" data-on="' + (i + 1) + '"><span class="fzd-lnk"></span>' + r[0] + '<span class="fzd-grow"></span><small>DA ' + r[1] + '</small></div>'; }).join('') + '</div>' +
        '<div class="fzd-auth"><small>Your authority</small><div class="fzd-meter"><i data-w="18|36|58|76"></i></div></div>';
    } },
    ranks: { n: 2, hint: 'Tap for this month', html: function () {
      return '<div class="fzd-card fzd-rk"><div class="fzd-kwh"><span>Keyword</span><span>Rank</span><span>Change</span></div>' + [['roof repair goshen', '14|3', '+11'], ['metal roofing elkhart', '22|6', '+16'], ['roofer near me', '9|2', '+7']].map(function (r) { return '<div class="fzd-kwr"><span>' + r[0] + '</span><b data-t="' + r[1] + '">' + r[1].split('|')[0] + '</b><span class="fzd-up" data-on="1">▲ ' + r[2] + '</span></div>'; }).join('') + '</div><small class="fzd-meta light fzd-note">Example monthly report</small>';
    } },
    smsseg: { n: 3, hint: 'Tap to pick a segment', html: function () {
      var c = [['Sarah', 'Goshen · VIP'], ['Mike', 'Elkhart · New'], ['Jen', 'Goshen · Lapsed'], ['Tom', 'South Bend · VIP']];
      return '<div class="fzd-chips"><span data-at="0">VIP</span><span data-at="1">Goshen</span><span data-at="2">Lapsed</span></div><div class="fzd-grid2">' +
        c.map(function (x, i) { var at = [[0, 1], [], [1, 2], [0]][i]; return '<span class="fzd-ct" ' + (at.length ? 'data-at="' + at.join(',') + '"' : 'data-at="9"') + '><b>' + x[0] + '</b><small>' + x[1] + '</small></span>'; }).join('') + '</div>';
    } },
    reinforce: { n: 3, hint: 'Tap to follow up', html: function () {
      return '<div class="fzd-three"><div class="fzd-card mini" data-on="0"><small class="fzd-meta">Email</small><b>Spring sale</b><small class="fzd-meta">Unopened · 24 hrs</small></div><b class="fzd-arr"></b>' +
        '<div class="fzd-card mini" data-on="1"><small class="fzd-meta">Text</small><b>Sale ends tonight: link</b></div><b class="fzd-arr"></b><div class="fzd-card mini ok" data-on="2">' + CK + '<b>Opened and bought</b></div></div>';
    } },
    smsreport: { n: 2, hint: 'Tap to switch range', html: function () {
      return '<div class="fzd-row"><span class="fzd-tabs2"><span data-at="0">Week</span><span data-at="1">Month</span></span><span class="fzd-grow"></span><small class="fzd-meta light">Example report</small></div><div class="fzd-fun">' +
        [['Sent', '1,000|4,200', '100|100'], ['Delivered', '990|4,150', '96|96'], ['Clicked', '160|710', '30|34'], ['Redeemed', '42|190', '12|14']].map(function (r) { return '<div class="fzd-fr"><small>' + r[0] + '</small><div class="fzd-meter"><i data-w="' + r[2] + '"></i></div><b data-t="' + r[1] + '">' + r[1].split('|')[0] + '</b></div>'; }).join('') + '</div>';
    } },
    socialstats: { n: 2, hint: 'Tap to switch range', html: function () {
      return '<div class="fzd-chart"><svg viewBox="0 0 200 90" preserveAspectRatio="none"><path class="fzd-line l0" d="M0 72 C30 70 50 64 70 60 S110 56 130 50 S170 44 200 40"/><path class="fzd-line l1" d="M0 72 C30 66 50 54 70 50 S110 36 130 30 S170 20 200 12"/></svg>' +
        '<span class="fzd-tag sm fzd-fix" data-t="Reach: 3,900|Reach: 18,400">Reach: 3,900</span></div><small class="fzd-meta light fzd-note" data-t="Example · this week|Example · this month">Example · this week</small>';
    } },
    ga: { n: 2, hint: 'Tap to switch view', html: function () {
      return '<div class="fzd-ga"><span class="fzd-donut"></span><div class="fzd-stack">' + [['Search', '#7fd8ea'], ['Social', '#f5b301'], ['Direct', '#fff']].map(function (r) { return '<div class="fzd-leg"><i style="background:' + r[1] + '"></i>' + r[0] + '</div>'; }).join('') + '</div></div>' +
        '<span class="fzd-callout" data-t="Traffic by source|Visitors on phones: 68%">Traffic by source</span>';
    } },
    crawl: { n: 4, hint: 'Tap to crawl the site', html: function () {
      return '<div class="fzd-stack">' + ['sitemap.xml submitted', '/services indexed', '/about indexed'].map(function (t, i) { return '<div class="fzd-li wide"><span class="fzd-qck" data-on="' + (i + 1) + '">' + CK + '</span>' + t + '</div>'; }).join('') + '</div><span class="fzd-bot" data-x="0|1|2|3"></span>';
    } },
    localsite: { n: 3, hint: 'Tap to match', html: function () {
      return '<div class="fzd-two"><div class="fzd-card mini"><small class="fzd-meta">Your website</small><b>Your Business</b><small class="fzd-meta">101 Main St, Goshen</small><small class="fzd-meta">574-555-0142</small></div>' +
        '<div class="fzd-card mini"><small class="fzd-meta">Google profile</small><b>Your Business</b><small class="fzd-meta" data-t="101 Main Street|101 Main St, Goshen|101 Main St, Goshen">101 Main Street</small><small class="fzd-meta">574-555-0142</small></div></div>' +
        '<span class="fzd-tag fzd-tagfloat ok" data-on="2">' + CK + 'Name, address, phone match</span>';
    } },
    entitycard: { n: 4, hint: 'Tap to fill in', html: function () {
      return '<div class="fzd-card fzd-anat">' + [['Who', 'Your Business, family owned'], ['What', 'Roofing and gutters'], ['Where', 'Goshen and Elkhart County'], ['Why', '4.9 stars · 20 years']].map(function (r, i) { return '<div class="fzd-ar" data-on="' + i + '"><small>' + r[0] + '</small><b>' + r[1] + '</b>' + CK + '</div>'; }).join('') + '</div>';
    } },
    faqsite: { n: 3, hint: 'Tap to open', html: function () {
      return '<div class="fzd-card fzd-rich"><small class="fzd-meta">yourbusiness.com · FAQ</small><div class="fzd-acc open"><b>How long does a roof replacement take?</b><small class="fzd-meta fzd-ans" data-on="1">Most homes take 1 to 2 days.</small></div><div class="fzd-acc"><b>Do you offer financing?</b></div></div>' +
        '<span class="fzd-tag fzd-tagfloat ok" data-on="2">' + CK + 'Shown as the answer</span>';
    } },
    cite: { n: 5, hint: 'Tap to check each AI', html: function () {
      return '<div class="fzd-sigs">' + ['ChatGPT', 'Perplexity', 'Gemini', 'Copilot', 'Claude'].map(function (t, i) { return '<span class="fzd-sig" data-on="' + i + '">' + CK + t + '</span>'; }).join('') + '</div><span class="fzd-callout">Each one cites yourbusiness.com</span>';
    } },
  };

  /* Card title → demo. Exact titles first; keywords catch any card added later. */
  var BY_TITLE = {
    /* Local SEO */
    'google business profile optimization': ['gbp'], 'google maps & apple maps rankings': ['mappack'],
    'local keyword research & search intent strategy': ['kw', { q: ['plumber near me', 'drain cleaning goshen', 'how to unclog a drain'], i: ['Ready to call', 'Ready to book', 'Researching'] }],
    'citation building & nap consistency': ['nap'], 'website optimization for local search': ['localweb'], 'review generation & reputation management': ['reviews'],
    'local content strategy': ['areas'], 'local authority & backlink strategy': ['links', { src: ['Chamber', 'Local news', 'Association', 'Sponsor', 'Partner'] }],
    'local seo for healthcare & dental practices': ['dental'], 'local seo for home services & contractors': ['homesvc'],
    'local seo for automotive & dealerships': ['auto'], 'local seo for real estate agents & brokerages': ['hood'],
    'local seo for fitness & wellness studios': ['classes'], 'local seo for manufacturers & dealers': ['dealers'],
    'local seo for law firms & financial services': ['practice'], 'local seo for retail stores & restaurants': ['menu'],
    /* AI Optimization */
    'content structure & ai-friendly formatting': ['structure'], 'schema markup & structured data': ['schema'],
    'featured snippet & people also ask optimization': ['paa'], 'semantic seo & entity optimization': ['entity'],
    'local ai visibility & geo-targeting': ['geoai'],
    'ai citation & authority signal building': ['sources'], 'voice search & conversational query optimization': ['voice'],
    'continuous monitoring & ai algorithm adaptation': ['monitor'],
    /* AEO */
    'your business becomes the source': ['snippet', { q: ['Is a tankless water heater worth it?', 'How long does a roof last?', 'Do I need a permit for a deck?'] }],
    'search is changing fast. aeo is the adaptation.': ['serpshift'],
    'question research & mapping': ['qmap'], 'answer-first content creation': ['answerfmt'], 'aeo monitoring & expansion': ['snipwins'],
    /* GEO */
    'your business becomes the source ai trusts': ['trust'], 'ai search is replacing traditional search: fast.': ['migrate'],
    'google ai overviews': ['aio'], 'chatgpt (with browse)': ['ai', { name: 'ChatGPT', q: ['Best roofer in Goshen?', 'Who installs patios near Elkhart?', 'Family dentist in Middlebury?'], cite: 'Cited: yourbusiness.com' }],
    'perplexity ai': ['perplex'], 'microsoft copilot': ['copilot'], 'google gemini': ['gemini'], 'apple intelligence & siri': ['siri'],
    /* Email */
    'inbox placement is ai-driven': ['inbox'], 'revenue-focused personalization': ['personal'], 'optimal send time prediction': ['sendtime'],
    'subject line & content testing': ['abtest'], 'email fatigue prevention': ['fatigue'], 'layout & cta optimization': ['heat'],
    'healthy email list building': ['listbuild'], 'ai-powered content optimization': ['anatomy'],
    'automated campaign workflows': ['flow', { st: ['New lead', 'Welcome', 'Cart reminder', 'Repeat buy'] }],
    'multi-channel integration': ['channels', { ch: ['Email', 'Text', 'Social'] }],
    'platform-matched automation builds': ['platforms'], 'dynamic, conditional-logic templates': ['conditional'],
    'full-funnel sequence architecture': ['funnel', { st: ['Awareness', 'Nurture', 'Conversion', 'Retention', 'Win-back'] }],
    'segmentation built on real signals': ['signals'],
    /* HubSpot */
    'crm & contact management': ['contact'], 'marketing hub': ['nurture'],
    'sales hub': ['pipeline'], 'service hub': ['ticket'],
    /* Paid search */
    'google search ads': ['serpad'], 'google local service ads': ['lsa'], 'apple maps ads': ['apple'], 'microsoft bing ads': ['bing'],
    /* Paid social */
    'strategic campaign planning & development': ['plan'], 'high-performance ad creative': ['creative'], 'landing page creation & optimization': ['landing'],
    'advanced audience targeting & retargeting': ['radius'], 'comprehensive daily campaign management': ['daily'],
    'conversion tracking & detailed reporting': ['pixel', { t: 'Conversion tracking', ev: ['Ad click', 'Form started', 'Lead submitted', 'Purchase'] }],
    /* SEO */
    'seo audit & competitive analysis': ['audit'], 'keyword research & search intent strategy': ['kwtable'], 'on-page seo optimization': ['onpage'],
    'technical seo foundation': ['vitals'], 'seo content strategy & creation': ['cluster'], 'authority & backlink strategy': ['backlinks'],
    'reporting, tracking & transparency': ['ranks'],
    /* SMS */
    'compliant sms subscriber list building': ['optin'], 'promotional sms & broadcast text campaigns': ['broadcast'],
    'automated text message workflows': ['smsflow'], 'sms + email integration': ['reinforce'],
    /* Social */
    'social media strategy & consulting': ['socialplan'], 'content creation & design': ['postdesign'], 'strategic scheduling & publishing': ['calendar'],
    'community management & engagement': ['community'], 'analytics & reporting': ['socialstats'],
    /* Website */
    'custom website design': ['design'], 'user experience & site structure': ['ux'], 'mobile-first & responsive design': ['responsive'],
    'security & best practices': ['security'], 'testing, qa & professional launch': ['qa'], 'google analytics setup & tracking': ['ga'],
    'clear ownership & full access': ['own'], 'search engine optimization foundation': ['crawl'], 'local seo setup & optimization': ['localsite'],
    'ai optimization': ['entitycard'], 'answer engine optimization (aeo)': ['faqsite'], 'generative engine optimization (geo)': ['cite']
  };
  var PAGE_OVERRIDE = {
    'email-marketing': { 'audience segmentation & targeting': ['segments'], 'analytics & continuous optimization': ['report', { k: ['Delivered', 'Clicks', 'Revenue'], a: ['98%', '4.1%', '$1.9k'], b: ['99%', '4.6%', '$8.3k'] }] },
    'answer-engine-optimization': { 'schema markup & structured data': ['faqschema'] },
    'short-message-service-sms': { 'audience segmentation & targeting': ['smsseg'], 'analytics & continuous optimization': ['smsreport'] }
  };
  var KEYWORDS = [[/review|reputation/, 'reviews'], [/map|local/, 'mappack'], [/schema|structured/, 'schema'], [/snippet|answer/, 'snippet'], [/voice/, 'voice'],
    [/ai|chatgpt|gemini|copilot|perplexity/, 'ai'], [/email|inbox/, 'inbox'], [/text|sms/, 'smsflow'], [/segment/, 'segments'], [/automat|workflow/, 'flow'],
    [/report|analytic|tracking/, 'report'], [/keyword/, 'kw'], [/backlink|authority/, 'links'], [/content/, 'publish'], [/ad/, 'serpad'], [/design/, 'design']];

  function pickDemo(title) {
    var t = title.toLowerCase().replace(/\s+/g, ' ').trim();
    var page = (location.pathname.match(/services\/([a-z-]+)/) || [])[1] || '';
    if (PAGE_OVERRIDE[page] && PAGE_OVERRIDE[page][t]) return PAGE_OVERRIDE[page][t];
    if (BY_TITLE[t]) return BY_TITLE[t];
    for (var i = 0; i < KEYWORDS.length; i++) if (KEYWORDS[i][0].test(t)) return [KEYWORDS[i][1]];
    return null;
  }

  function pickStep(list, s) { return list[Math.min(s, list.length - 1)]; }
  function apply(r, s) {
    r.setAttribute('data-s', s);
    r.querySelectorAll('[data-on]').forEach(function (e) { e.classList.toggle('on', s >= +e.getAttribute('data-on')); });
    r.querySelectorAll('[data-at]').forEach(function (e) { e.classList.toggle('on', e.getAttribute('data-at').split(',').indexOf(String(s)) > -1); });
    r.querySelectorAll('[data-t]').forEach(function (e) { var l = e.getAttribute('data-t'); if (l) { var v = pickStep(l.split('|'), s); if (e.textContent !== v) e.textContent = v; } });
    r.querySelectorAll('[data-w]').forEach(function (e) { var l = e.getAttribute('data-w'); if (l) e.style.width = pickStep(l.split('|'), s) + '%'; });
    r.querySelectorAll('[data-x]').forEach(function (e) { var v = +pickStep(e.getAttribute('data-x').split('|'), s); e.style.setProperty('--dx', v); });
    r.querySelectorAll('[data-l]').forEach(function (e) { e.style.left = pickStep(e.getAttribute('data-l').split('|'), s) + '%'; });
    r.querySelectorAll('[data-tp]').forEach(function (e) { e.style.top = pickStep(e.getAttribute('data-tp').split('|'), s) + '%'; });
    r.querySelectorAll('[data-y]').forEach(function (e) { var v = +pickStep(e.getAttribute('data-y').split('|'), s); e.style.transform = 'translateY(' + v + 'px)'; });
  }

  var live = [];
  function build(card, key, params) {
    var d = DEMO[key]; if (!d) return null;
    var r = D.createElement('div');
    r.className = 'fzd fzd-k-' + key; r.setAttribute('aria-hidden', 'true'); r.setAttribute('data-nosnippet', '');
    r.innerHTML = '<div class="fzd-in">' + d.html(params || {}) + '</div><span class="fzd-tap">' + d.hint + '</span>';
    r.fz = { s: 0, n: typeof d.n === 'function' ? d.n(params || {}) : d.n, key: key, last: 0, seen: false };
    apply(r, 0);
    if (d.manual) CUSTOM[key](r);
    else r.addEventListener('click', function () { advance(r, true); });
    return r;
  }
  function advance(r, user) {
    var f = r.fz; f.s = (f.s + 1) % f.n; apply(r, f.s);
    if (user) { f.last = Date.now(); r.classList.add('fzd-used'); if (!f.tracked) { f.tracked = 1; track('demo_tap', { demo: f.key }); } }
  }

  var CUSTOM = {
    reviews: function (r) {
      var stars = r.querySelectorAll('.fzd-pick .fzd-star'), avg = r.querySelector('.fzd-avg');
      function rate(k, user) {
        stars.forEach(function (s, i) { s.classList.toggle('on', i < k); });
        r.classList.toggle('rated', k > 0);
        avg.textContent = k >= 5 ? '4.9' : '4.8';
        if (user) { r.fz.last = Date.now(); r.classList.add('fzd-used'); if (!r.fz.tracked) { r.fz.tracked = 1; track('demo_tap', { demo: 'reviews' }); } }
      }
      stars.forEach(function (s, i) { s.addEventListener('click', function (e) { e.stopPropagation(); rate(i + 1, true); }); });
      r.addEventListener('click', function () { rate(5, true); });
      r.fz.n = 6; r.fz.tick = function () { var k = (r.fz.k = ((r.fz.k || 0) + 1) % 7); rate(Math.min(k, 5), false); };
    },
    fatigue: function (r) {
      var tr = r.querySelector('.fzd-track'), val = r.querySelector('.fzd-val'), g1 = r.querySelector('.g1'), g2 = r.querySelector('.g2');
      function set(n) {
        n = Math.max(1, Math.min(7, Math.round(n))); r.fz.v = n;
        var pct = (n - 1) / 6 * 100;
        r.style.setProperty('--p', pct);
        val.textContent = n;
        var eng = [55, 82, 90, 78, 60, 44, 32][n - 1], uns = [6, 8, 12, 24, 44, 66, 86][n - 1];
        g1.style.width = eng + '%'; g2.style.width = uns + '%';
        r.classList.toggle('sweet', n >= 2 && n <= 3);
      }
      function fromX(x) { var b = tr.getBoundingClientRect(); return 1 + (x - b.left) / b.width * 6; }
      var drag = false;
      r.addEventListener('pointerdown', function (e) { drag = true; try { r.setPointerCapture(e.pointerId); } catch (x) {} set(fromX(e.clientX)); r.fz.last = Date.now(); r.classList.add('fzd-used'); if (!r.fz.tracked) { r.fz.tracked = 1; track('demo_tap', { demo: 'fatigue' }); } });
      r.addEventListener('pointermove', function (e) { if (drag) { set(fromX(e.clientX)); r.fz.last = Date.now(); } });
      ['pointerup', 'pointercancel'].forEach(function (t) { r.addEventListener(t, function () { drag = false; }); });
      r.style.touchAction = 'pan-y';
      set(2);
      var seq = [2, 4, 6, 3, 2];
      r.fz.tick = function () { r.fz.i = ((r.fz.i || 0) + 1) % seq.length; set(seq[r.fz.i]); };
    }
  };

  /* Sales Hub: the deal card can be dragged between columns */
  function dragDeal(r) {
    var deal = r.querySelector('.fzd-deal'), kan = r.querySelector('.fzd-kan'); if (!deal) return;
    var drag = false, startX = 0, base = 0;
    r.style.touchAction = 'pan-y';
    deal.addEventListener('pointerdown', function (e) { e.stopPropagation(); drag = true; startX = e.clientX; base = r.fz.s; deal.classList.add('grab'); try { deal.setPointerCapture(e.pointerId); } catch (x) {} });
    deal.addEventListener('pointermove', function (e) { if (!drag) return; var w = kan.getBoundingClientRect().width / 3; deal.style.setProperty('--dx', Math.max(0, Math.min(2, base + (e.clientX - startX) / w))); });
    function up(e) {
      if (!drag) return; drag = false; deal.classList.remove('grab');
      var w = kan.getBoundingClientRect().width / 3, moved = Math.abs(e.clientX - startX) > 6;
      var s = moved ? Math.round(Math.max(0, Math.min(2, base + (e.clientX - startX) / w))) : (base + 1) % 3;
      r.fz.s = s; apply(r, s); r.fz.last = Date.now(); r.classList.add('fzd-used');
      if (!r.fz.tracked) { r.fz.tracked = 1; track('demo_tap', { demo: 'pipeline' }); }
    }
    deal.addEventListener('pointerup', up); deal.addEventListener('pointercancel', up);
  }

  function demos() {
    if (!/\/services\/[a-z-]+(\.html)?$/.test(location.pathname)) return;
    var cards = D.querySelectorAll('main .svc-card, main .svc-detail-card, main .service-row, main .why-ai-card, main .exp-card, main .surf-detail-card, main .plat-detail-card');
    cards.forEach(function (card) {
      if (card.querySelector('.fzd')) return;
      if (card.closest('[class*="industr"]:not(.svc-detail-card):not(.svc-card), .who-section, .why-section, .pain-section')) return;
      var h = card.querySelector('h3, .service-title, .svc-detail-title, .svc-detail-name, .exp-name, .plat-detail-name, .surf-detail-name, .exp-title'); if (!h) return;
      var pick = pickDemo(h.textContent); if (!pick) return;
      var r = build(card, pick[0], pick[1]); if (!r) return;
      if (pick[0] === 'pipeline') dragDeal(r);
      var hdr = card.querySelector(':scope > .svc-header, :scope > .plat-header, :scope > .surf-header');
      var icon = card.querySelector('.svc-icon, .svc-detail-icon, .exp-icon, .surf-detail-icon, .service-num');
      if (hdr) { if (icon && hdr.contains(icon)) icon.style.display = 'none'; hdr.parentNode.insertBefore(r, hdr); }
      else if (icon && !card.classList.contains('service-row')) { icon.style.display = 'none'; icon.parentNode.insertBefore(r, icon); }
      else h.parentNode.insertBefore(r, h);
      /* One visual per card: the demo replaces any small icon badge in the same card */
      [].slice.call(card.querySelectorAll('[class*="icon"]')).forEach(function (ic) {
        if (r.contains(ic) || ic.contains(h) || ic.querySelector('h3, p')) return;
        ic.classList.add('fzd-icon-off');
      });
      live.push(r);
    });
    if (!live.length) return;
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (es) { es.forEach(function (e) { e.target.fz.seen = e.isIntersecting; e.target.classList.toggle('fzd-live', e.isIntersecting); }); }, { threshold: 0.35 });
      live.forEach(function (r) { io.observe(r); });
    } else live.forEach(function (r) { r.fz.seen = true; });
    if (reduce) return;
    setInterval(function () {
      if (H.classList.contains('fz-still') || D.hidden) return;
      var now = Date.now();
      live.forEach(function (r) {
        if (!r.fz.seen || now - r.fz.last < 7000 || r.matches(':hover')) return;
        if (r.fz.tick) r.fz.tick(); else advance(r, false);
      });
    }, 2400);
  }
  if (D.readyState === 'loading') D.addEventListener('DOMContentLoaded', demos); else demos();
})();
