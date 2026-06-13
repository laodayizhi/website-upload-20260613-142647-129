(function () {
  var mobileButton = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (mobileButton && mobileNav) {
    mobileButton.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, current) {
        slide.classList.toggle('active', current === index);
      });
      dots.forEach(function (dot, current) {
        dot.classList.toggle('active', current === index);
      });
    }

    function restart() {
      if (timer) {
        clearInterval(timer);
      }
      timer = setInterval(function () {
        show(index + 1);
      }, 5600);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        var value = Number(dot.getAttribute('data-hero-dot'));
        show(value);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        restart();
      });
    }

    show(0);
    restart();
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function setupSearch() {
    var boxes = Array.prototype.slice.call(document.querySelectorAll('[data-search-box]'));
    var index = window.MOVIES_INDEX || [];

    boxes.forEach(function (box) {
      var input = box.querySelector('.site-search-input');
      var results = box.querySelector('[data-search-results]');

      if (!input || !results) {
        return;
      }

      input.addEventListener('input', function () {
        var query = input.value.trim().toLowerCase();
        if (!query) {
          results.classList.remove('active');
          results.innerHTML = '';
          return;
        }

        var matches = index.filter(function (movie) {
          return movie.searchText.indexOf(query) !== -1;
        }).slice(0, 28);

        results.innerHTML = matches.map(function (movie) {
          return '<a class="search-result-item" href="./' + movie.page + '">' +
            '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '">' +
            '<span><strong>' + escapeHtml(movie.title) + '</strong>' +
            '<small>' + escapeHtml(movie.year + ' · ' + movie.region + ' · ' + movie.type) + '</small></span>' +
            '</a>';
        }).join('');

        results.classList.toggle('active', matches.length > 0);
      });
    });

    document.addEventListener('click', function (event) {
      boxes.forEach(function (box) {
        if (!box.contains(event.target)) {
          var results = box.querySelector('[data-search-results]');
          if (results) {
            results.classList.remove('active');
          }
        }
      });
    });
  }

  function setupFilters() {
    var inputs = Array.prototype.slice.call(document.querySelectorAll('.page-filter-input'));

    inputs.forEach(function (input) {
      var section = input.closest('.filter-panel');
      var list = section ? section.querySelector('[data-filter-list]') : null;
      var cards = list ? Array.prototype.slice.call(list.querySelectorAll('[data-card]')) : [];

      input.addEventListener('input', function () {
        var query = input.value.trim().toLowerCase();
        cards.forEach(function (card) {
          var text = (card.getAttribute('data-filter-text') || '').toLowerCase();
          card.classList.toggle('is-filtered-out', query && text.indexOf(query) === -1);
        });
      });
    });
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

    players.forEach(function (player) {
      var video = player.querySelector('video');
      var cover = player.querySelector('.player-cover');
      var stream = player.getAttribute('data-stream');
      var hlsInstance = null;
      var loaded = false;

      if (!video || !stream) {
        return;
      }

      function reveal() {
        if (cover) {
          cover.classList.add('is-hidden');
        }
      }

      function start() {
        reveal();

        if (!loaded) {
          loaded = true;
          if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = stream;
            video.play().catch(function () {});
          } else if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
              enableWorker: true,
              lowLatencyMode: true
            });
            hlsInstance.loadSource(stream);
            hlsInstance.attachMedia(video);
            hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
              video.play().catch(function () {});
            });
          } else {
            video.src = stream;
            video.play().catch(function () {});
          }
        } else {
          video.play().catch(function () {});
        }
      }

      if (cover) {
        cover.addEventListener('click', start);
      }

      video.addEventListener('click', function () {
        if (!loaded || video.paused) {
          start();
        } else {
          video.pause();
        }
      });

      video.addEventListener('play', reveal);

      window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupHero();
    setupSearch();
    setupFilters();
    setupPlayers();
  });
})();
