(function () {
  function each(selector, callback) {
    Array.prototype.forEach.call(document.querySelectorAll(selector), callback);
  }

  function normalize(value) {
    return (value || "").toString().trim().toLowerCase();
  }

  function bindMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-mobile-nav]");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      menu.classList.toggle("is-open");
      button.setAttribute("aria-expanded", menu.classList.contains("is-open") ? "true" : "false");
    });
  }

  function bindMissingImages() {
    each("img", function (image) {
      image.addEventListener("error", function () {
        image.classList.add("is-missing");
      });
    });
  }

  function bindHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    if (slides.length < 2) {
      return;
    }
    var index = 0;
    var timer;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function start() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        window.clearInterval(timer);
        show(dotIndex);
        start();
      });
    });

    show(0);
    start();
  }

  function bindFilters() {
    var queryInput = document.querySelector("[data-page-search]");
    var typeFilter = document.querySelector("[data-type-filter]");
    var yearFilter = document.querySelector("[data-year-filter]");
    var regionFilter = document.querySelector("[data-region-filter]");
    var empty = document.querySelector("[data-empty-note]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card], [data-category-card]"));

    if (!cards.length) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q");
    if (initialQuery && queryInput) {
      queryInput.value = initialQuery;
    }

    function matched(card, query, type, year, region) {
      var text = normalize([
        card.getAttribute("data-title"),
        card.getAttribute("data-tags"),
        card.getAttribute("data-genre"),
        card.getAttribute("data-region"),
        card.getAttribute("data-year"),
        card.textContent
      ].join(" "));
      var cardType = normalize(card.getAttribute("data-type"));
      var cardYear = normalize(card.getAttribute("data-year"));
      var cardRegion = normalize(card.getAttribute("data-region"));
      var byQuery = !query || text.indexOf(query) !== -1;
      var byType = !type || cardType === type;
      var byYear = !year || cardYear === year;
      var byRegion = !region || cardRegion === region;
      return byQuery && byType && byYear && byRegion;
    }

    function apply() {
      var query = normalize(queryInput && queryInput.value);
      var type = normalize(typeFilter && typeFilter.value);
      var year = normalize(yearFilter && yearFilter.value);
      var region = normalize(regionFilter && regionFilter.value);
      var visible = 0;

      cards.forEach(function (card) {
        var ok = matched(card, query, type, year, region);
        card.classList.toggle("is-hidden", !ok);
        if (ok) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    }

    [queryInput, typeFilter, yearFilter, regionFilter].forEach(function (control) {
      if (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      }
    });

    apply();
  }

  document.addEventListener("DOMContentLoaded", function () {
    bindMenu();
    bindMissingImages();
    bindHero();
    bindFilters();
  });
})();
