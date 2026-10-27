/* Favze comparison pages: "Which should you start with?" quiz.
   Each Yes adds a point to the option that question favors. The higher side is suggested
   first; a tie suggests using both together. */
(function () {
  'use strict';
  document.querySelectorAll('.cp-quiz').forEach(function (quiz) {
    var qs = [].slice.call(quiz.querySelectorAll('.cp-q'));
    var result = quiz.querySelector('.cp-result'), text = quiz.querySelector('.cp-result-t'), live = quiz.querySelector('.cp-live');
    function score() {
      var a = 0, b = 0, done = 0;
      qs.forEach(function (q) {
        var on = q.querySelector('button[aria-pressed="true"]');
        if (!on) return;
        done++;
        if (on.getAttribute('data-v') === '1') { if (q.getAttribute('data-side') === 'a') a++; else b++; }
      });
      live.textContent = done < qs.length ? (qs.length - done) + ' of ' + qs.length + ' questions left.' : '';
      if (done < qs.length) { result.hidden = true; return; }
      var key = a > b ? 'a' : b > a ? 'b' : 'both';
      text.textContent = quiz.getAttribute('data-res-' + key);
      result.hidden = false; result.setAttribute('data-pick', key);
      live.textContent = 'Suggestion: ' + text.textContent;
      if (typeof window.gtag === 'function') window.gtag('event', 'compare_quiz_result', { page_path: location.pathname, result: key });
    }
    qs.forEach(function (q) {
      q.querySelectorAll('button').forEach(function (btn) {
        btn.addEventListener('click', function () {
          q.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', x === btn ? 'true' : 'false'); });
          q.classList.add('is-done');
          score();
        });
      });
    });
    quiz.querySelector('.cp-reset').addEventListener('click', function () {
      quiz.querySelectorAll('.cp-q button').forEach(function (x) { x.setAttribute('aria-pressed', 'false'); });
      qs.forEach(function (q) { q.classList.remove('is-done'); });
      result.hidden = true; live.textContent = 'Quiz cleared.';
      var first = quiz.querySelector('.cp-q button'); if (first) first.focus();
    });
  });
})();
