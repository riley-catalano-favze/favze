/* Local Marketing Guide mode.
   Visitors who arrive from the "Local Marketing Guides" menu carry ?view=guides.
   On the areas-served index, town links get the same parameter so the mode
   follows them. On a town page in this mode, the visible H1 reads
   "<Town> Local Marketing Guide". The HTML H1, title, meta description and
   canonical stay unchanged, so search engines see the same page content. */
(function () {
  try {
    if (new URLSearchParams(location.search).get('view') !== 'guides') return;
  } catch (e) { return; }

  function isTownLink(a) {
    try {
      var u = new URL(a.getAttribute('href'), location.href);
      if (u.origin !== location.origin && u.hostname !== 'favze.com') return false;
      var parts = u.pathname.replace(/\.html$/, '').replace(/\/$/, '').split('/').filter(Boolean);
      // areas-served/<county>/<town>, or industries/<industry>
      if (parts[0] === 'areas-served') return parts.length === 3 && parts[2] !== 'index';
      if (parts[0] === 'industries') return parts.length === 2 && parts[1] !== 'index';
      return false;
    } catch (e) { return false; }
  }

  function carryMode(root) {
    var links = (root || document).querySelectorAll('a[href]');
    for (var i = 0; i < links.length; i++) {
      var a = links[i];
      if (!isTownLink(a)) continue;
      try {
        var u = new URL(a.getAttribute('href'), location.href);
        if (u.searchParams.get('view') === 'guides') continue;
        u.searchParams.set('view', 'guides');
        a.setAttribute('href', u.pathname + u.search + u.hash);
      } catch (e) {}
    }
  }

  function industryH1() {
    var h = document.querySelector('main h1, h1');
    if (!h) return;
    var txt = (h.textContent || '').trim();
    var m = txt.match(/^Digital Marketing for (.+)$/);
    if (!m) return;
    h.textContent = 'Marketing Guide for Local ' + m[1];
  }

  function hubH1() {
    var h = document.querySelector('main h1, h1');
    if (h) h.textContent = 'Local Marketing Guides by Industry';
  }

  function townH1() {
    var h = document.querySelector('main h1, h1');
    if (!h) return;
    var line = h.querySelector('.h1-line') || h;
    var txt = (line.textContent || '').trim();
    if (!/Digital Marketing$/.test(txt)) return;
    var town = txt.replace(/\s*Digital Marketing$/, '');
    line.textContent = town + ' Local Marketing Guide';
  }

  var path = location.pathname;
  var isTown = /^\/areas-served\/[^\/]+\/[^\/]+(\.html)?$/.test(path);
  var isIndustry = /^\/industries\/[^\/]+(\.html)?$/.test(path) && !/^\/industries\/index(\.html)?$/.test(path);
  var isHub = /^\/industries\/?(index\.html)?$/.test(path);

  function run() {
    carryMode(document);
    if (isTown) townH1();
    if (isIndustry) industryH1();
    if (isHub) hubH1();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  else run();
})();
