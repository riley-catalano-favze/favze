/* Why Us hero: the 12 Favze services float around the headline and drift toward the cursor (desktop only). */
(function () {
  'use strict';
  var orbit = document.querySelector('.wh-orbit');
  if (!orbit || !window.matchMedia) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || !matchMedia('(min-width: 1280px)').matches) return;
  var hero = orbit.closest('section'), bubs = [].slice.call(orbit.querySelectorAll('.wh-bub'));
  var mx = -9999, my = -9999, raf = null, active = false;
  hero.addEventListener('mousemove', function (e) { mx = e.clientX; my = e.clientY; if (!raf) raf = requestAnimationFrame(tick); });
  hero.addEventListener('mouseleave', function () { mx = my = -9999; if (!raf) raf = requestAnimationFrame(tick); });
  function tick() {
    raf = null; var moving = false;
    bubs.forEach(function (b) {
      var r = b.getBoundingClientRect(), cx = r.left + r.width / 2 - (b._x || 0), cy = r.top + r.height / 2 - (b._y || 0);
      var dx = mx - cx, dy = my - cy, d = Math.sqrt(dx * dx + dy * dy), tx = 0, ty = 0;
      if (d < 260) { var f = (1 - d / 260) * 0.35; tx = dx * f; ty = dy * f; }
      b._x = (b._x || 0) + (tx - (b._x || 0)) * 0.18; b._y = (b._y || 0) + (ty - (b._y || 0)) * 0.18;
      b.style.setProperty('--mx', b._x.toFixed(1) + 'px'); b.style.setProperty('--my', b._y.toFixed(1) + 'px');
      if (Math.abs(tx - b._x) > 0.3 || Math.abs(ty - b._y) > 0.3) moving = true;
    });
    if (moving) raf = requestAnimationFrame(tick);
  }
})();
