// Thème clair / sombre. Chargé dans <head> pour éviter un flash au chargement.
// Par défaut on suit le réglage du système ; le choix manuel reste dans ce navigateur.
(function () {
  var KEY = "reminds-theme";
  var root = document.documentElement;
  var media = window.matchMedia("(prefers-color-scheme: dark)");

  function stored() {
    try {
      var value = localStorage.getItem(KEY);
      return value === "light" || value === "dark" ? value : null;
    } catch (e) {
      return null;
    }
  }

  function current() {
    return stored() || (media.matches ? "dark" : "light");
  }

  function sync() {
    var dark = current() === "dark";
    var buttons = document.querySelectorAll("[data-theme-toggle]");
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].setAttribute("aria-pressed", dark ? "true" : "false");
    }
    var meta = document.querySelector('meta[name="theme-color"]:not([media])');
    if (meta) {
      meta.setAttribute("content", dark ? "#14110f" : "#fbf7f4");
    }
  }

  var initial = stored();
  if (initial) {
    root.setAttribute("data-theme", initial);
  }

  document.addEventListener("DOMContentLoaded", function () {
    sync();
    var buttons = document.querySelectorAll("[data-theme-toggle]");
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].addEventListener("click", function () {
        var next = current() === "dark" ? "light" : "dark";
        root.setAttribute("data-theme", next);
        try {
          localStorage.setItem(KEY, next);
        } catch (e) {
          // Stockage indisponible : le choix vaut pour cette page seulement.
        }
        sync();
      });
    }
  });

  if (media.addEventListener) {
    media.addEventListener("change", sync);
  }
})();
