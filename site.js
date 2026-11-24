/* Site vitrine Reminds : thème clair/sombre (système par défaut, choix gardé dans ce navigateur ;
   ?theme=light|dark pour les rendus) et menu du téléphone. Chargé dans <head> : pas de flash. */
(function () {
  var KEY = 'reminds-theme';
  var root = document.documentElement;
  var media = window.matchMedia('(prefers-color-scheme: dark)');
  var forced = new URLSearchParams(location.search).get('theme');
  function stored() {
    try { var v = localStorage.getItem(KEY); return v === 'light' || v === 'dark' ? v : null; } catch (e) { return null; }
  }
  function apply(mode) { root.dataset.theme = mode; }
  apply(forced === 'light' || forced === 'dark' ? forced : (stored() || (media.matches ? 'dark' : 'light')));

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('[data-theme-toggle]').forEach(function (b) {
      b.addEventListener('click', function () {
        var next = root.dataset.theme === 'dark' ? 'light' : 'dark';
        apply(next);
        try { localStorage.setItem(KEY, next); } catch (e) { /* stockage indisponible : le choix vaut pour cette page */ }
      });
    });
    var btn = document.querySelector('.top__menu');
    var menu = document.getElementById('menu');
    if (btn && menu) {
      btn.addEventListener('click', function () {
        var open = btn.getAttribute('aria-expanded') !== 'true';
        btn.setAttribute('aria-expanded', String(open));
        menu.hidden = !open;
      });
      menu.addEventListener('click', function (e) {
        if (e.target.closest('a')) { btn.setAttribute('aria-expanded', 'false'); menu.hidden = true; }
      });
    }
    root.classList.add('ready');
  });
})();
