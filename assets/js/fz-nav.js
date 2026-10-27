/* Favze shared navigation: desktop dropdowns and mobile menu sections (same on every page). */
(function () {
  'use strict';
  var D = document;
  function init() {
    var drops = [['fzTrigSvc', 'fzPanSvc'], ['fzTrigRes', 'fzPanRes']].map(function (p) {
      return { trig: D.getElementById(p[0]), pan: D.getElementById(p[1]) };
    }).filter(function (d) { return d.trig && d.pan; });
    function setOpen(d, open) {
      d.pan.classList.toggle('open', open);
      d.trig.setAttribute('aria-expanded', open ? 'true' : 'false');
    }
    drops.forEach(function (d) {
      if (d.trig.dataset.fzBound) return; d.trig.dataset.fzBound = '1';
      d.trig.addEventListener('click', function (e) {
        e.stopPropagation();
        var open = !d.pan.classList.contains('open');
        drops.forEach(function (x) { setOpen(x, false); });
        setOpen(d, open);
        if (open) { var first = d.pan.querySelector('a'); if (first && e.detail === 0) first.focus(); }
      });
      d.pan.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') { setOpen(d, false); d.trig.focus(); }
      });
    });
    D.addEventListener('mousedown', function (e) {
      drops.forEach(function (d) { if (!d.pan.contains(e.target) && !d.trig.contains(e.target)) setOpen(d, false); });
    });
    D.addEventListener('focusin', function (e) {
      drops.forEach(function (d) { if (!d.pan.contains(e.target) && !d.trig.contains(e.target)) setOpen(d, false); });
    });
    D.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') drops.forEach(function (d) { setOpen(d, false); });
    });
    [['fzMmSvcTrig', 'fzMmSvcSub'], ['fzMmResTrig', 'fzMmResSub']].forEach(function (p) {
      var t = D.getElementById(p[0]), s = D.getElementById(p[1]);
      if (!t || !s || t.dataset.fzBound) return; t.dataset.fzBound = '1';
      t.setAttribute('aria-controls', p[1]);
      t.addEventListener('click', function () {
        var open = s.classList.toggle('open');
        t.classList.toggle('open', open);
        t.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    });
    var mm = D.getElementById('mm'), hb = D.getElementById('hb');
    if (mm && hb) {
      mm.querySelectorAll('a').forEach(function (a) {
        a.addEventListener('click', function () {
          if (!mm.classList.contains('open')) return;
          mm.classList.remove('open'); hb.classList.remove('open');
          hb.setAttribute('aria-expanded', 'false'); mm.setAttribute('aria-hidden', 'true');
        });
      });
    }
  }
  if (D.readyState === 'loading') D.addEventListener('DOMContentLoaded', init); else init();
})();
