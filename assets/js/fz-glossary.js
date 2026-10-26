/* Favze glossaries: instant search, topic filters, A to Z jump, copy link. All terms are in the page HTML, so search engines and AI read every definition. */
(function () {
  'use strict';
  var D = document, q = D.getElementById('glQ'); if (!q) return;
  var terms = [].slice.call(D.querySelectorAll('.gl-term'));
  var letters = [].slice.call(D.querySelectorAll('.gl-letter'));
  var filters = [].slice.call(D.querySelectorAll('.gl-filter'));
  var az = [].slice.call(D.querySelectorAll('.gl-az a'));
  var count = D.getElementById('glCount'), empty = D.getElementById('glEmpty'), svc = D.getElementById('favze-services');
  var cat = 'all', t = null;
  function track(name, p) { p = p || {}; p.page_path = location.pathname; if (typeof window.gtag === 'function') window.gtag('event', name, p); else (window.dataLayer = window.dataLayer || []).push(Object.assign({ event: name }, p)); }
  function words(s) { return s.toLowerCase().replace(/[^a-z0-9%$.\- ]/g, ' ').split(/\s+/).filter(Boolean); }
  function apply() {
    var w = words(q.value), shown = 0;
    terms.forEach(function (el) {
      var txt = el.getAttribute('data-text');
      var ok = (cat === 'all' || el.getAttribute('data-cat') === cat || (cat === 'services' && el.getAttribute('data-service') === '1')) &&
        w.every(function (x) { return txt.indexOf(x) > -1; });
      el.hidden = !ok; if (ok) shown++;
    });
    letters.forEach(function (L) {
      var any = [].some.call(L.querySelectorAll('.gl-term'), function (el) { return !el.hidden; });
      L.hidden = !any;
      az.forEach(function (a) { if (a.getAttribute('data-letter') === L.getAttribute('data-letter')) a.classList.toggle('is-off', !any); });
    });
    if (svc) svc.hidden = !!(w.length || (cat !== 'all' && cat !== 'services'));
    empty.hidden = shown > 0;
    count.textContent = (w.length || cat !== 'all') ? 'Showing ' + shown + ' of ' + terms.length + ' terms' : 'Showing all ' + terms.length + ' terms';
  }
  q.addEventListener('input', function () {
    apply(); clearTimeout(t);
    t = setTimeout(function () { if (q.value.trim().length > 2) track('glossary_search', { search_term: q.value.trim().slice(0, 80) }); }, 900);
  });
  filters.forEach(function (b) {
    b.addEventListener('click', function () {
      cat = b.getAttribute('data-cat');
      filters.forEach(function (x) { var on = x === b; x.classList.toggle('is-on', on); x.setAttribute('aria-pressed', on ? 'true' : 'false'); });
      apply(); track('glossary_filter', { filter: cat });
    });
  });
  function reset() { if (q.value || cat !== 'all') { q.value = ''; cat = 'all'; filters.forEach(function (x, i) { x.classList.toggle('is-on', i === 0); x.setAttribute('aria-pressed', i === 0 ? 'true' : 'false'); }); apply(); } }
  D.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('.gl-see a, .gl-az a, .gl-svc-name');
    if (a && a.getAttribute('href').charAt(0) === '#') reset();
  });
  D.querySelectorAll('.gl-copy').forEach(function (b) {
    b.addEventListener('click', function () {
      var url = location.origin + location.pathname + '#' + b.getAttribute('data-slug');
      var done = function () { var o = b.textContent; b.textContent = 'Link copied'; setTimeout(function () { b.textContent = o; }, 1600); };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(done, done); else done();
      track('glossary_copy_link', { term: b.getAttribute('data-slug') });
    });
  });
})();
