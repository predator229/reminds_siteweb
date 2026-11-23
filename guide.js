// Guide : agrandit une capture dans une boîte de dialogue. Sans JavaScript, le lien ouvre l'image.
(function () {
  var dialog = document.querySelector("dialog.lightbox");
  if (!dialog || typeof dialog.showModal !== "function") {
    return;
  }
  var image = dialog.querySelector("img");

  document.addEventListener("click", function (event) {
    var link = event.target.closest("a.zoom");
    if (link) {
      event.preventDefault();
      var thumb = link.querySelector("img");
      image.src = link.getAttribute("href");
      image.alt = thumb ? thumb.alt : "";
      dialog.showModal();
      return;
    }
    if (event.target === dialog || event.target.closest(".lightbox-close")) {
      dialog.close();
    }
  });

  dialog.addEventListener("close", function () {
    image.removeAttribute("src");
  });
})();
