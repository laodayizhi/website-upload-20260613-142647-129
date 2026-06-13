(function () {
  function initMobileMenu() {
    var button = document.querySelector('.mobile-menu-button');
    var menu = document.querySelector('.mobile-menu');
    if (!button || !menu) {
      return;
    }
    button.addEventListener('click', function () {
      menu.classList.toggle('hidden');
    });
  }

  function initHeroSlider() {
    var slider = document.querySelector('[data-hero-slider]');
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('.hero-dot'));
    if (!slides.length) {
      return;
    }
    var index = 0;
    function activate(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }
    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        activate(dotIndex);
      });
    });
    activate(0);
    window.setInterval(function () {
      activate(index + 1);
    }, 5200);
  }

  function initSearchPage() {
    var searchInput = document.querySelector('[data-search-input]');
    var resultBox = document.querySelector('[data-search-results]');
    var emptyBox = document.querySelector('[data-search-empty]');
    var filterButtons = Array.prototype.slice.call(document.querySelectorAll('[data-search-category]'));
    if (!searchInput || !resultBox || !window.MOVIE_SEARCH_DATA) {
      return;
    }
    var activeCategory = 'all';
    function render() {
      var term = searchInput.value.trim().toLowerCase();
      var matches = window.MOVIE_SEARCH_DATA.filter(function (item) {
        var categoryMatch = activeCategory === 'all' || item.category === activeCategory;
        var termMatch = !term || [item.title, item.category, item.year, item.region, item.genre, item.tags].join(' ').toLowerCase().indexOf(term) !== -1;
        return categoryMatch && termMatch;
      }).slice(0, 80);
      resultBox.innerHTML = matches.map(function (item) {
        return '<a href="./' + item.file + '" class="group flex gap-4 p-4 rounded-lg hover:bg-gray-50 transition-all border border-gray-100 bg-white">'
          + '<div class="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden relative image-frame">'
          + '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" loading="lazy" onerror="this.style.display=\'none\'">'
          + '<div class="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center"><span class="play-symbol-sm">▶</span></div>'
          + '</div>'
          + '<div class="flex-1 min-w-0">'
          + '<h3 class="font-semibold text-gray-900 mb-1 group-hover:text-emerald-600 transition-colors line-clamp-2">' + escapeHtml(item.title) + '</h3>'
          + '<p class="text-sm text-gray-600 mb-2 line-clamp-2">' + escapeHtml(item.oneLine) + '</p>'
          + '<div class="flex items-center gap-3 text-xs text-gray-500"><span class="px-2 py-0.5 bg-gray-100 rounded">' + escapeHtml(item.category) + '</span><span>' + escapeHtml(item.year) + '</span></div>'
          + '</div>'
          + '</a>';
      }).join('');
      if (emptyBox) {
        emptyBox.style.display = matches.length ? 'none' : 'block';
      }
    }
    function escapeHtml(value) {
      return String(value).replace(/[&<>"']/g, function (char) {
        return {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#39;'
        }[char];
      });
    }
    filterButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        activeCategory = button.getAttribute('data-search-category');
        filterButtons.forEach(function (item) {
          item.classList.toggle('is-active', item === button);
        });
        render();
      });
    });
    searchInput.addEventListener('input', render);
    render();
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMobileMenu();
    initHeroSlider();
    initSearchPage();
  });
})();
