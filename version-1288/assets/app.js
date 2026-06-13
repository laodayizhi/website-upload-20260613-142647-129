(function () {
  var toggle = document.querySelector('[data-menu-toggle]');
  var panel = document.querySelector('[data-mobile-panel]');

  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === current);
      });
    }

    function startHero() {
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        window.clearInterval(timer);
        showSlide(i);
        startHero();
      });
    });

    showSlide(0);
    startHero();
  }

  var filterInput = document.querySelector('[data-local-filter]');
  var yearFilter = document.querySelector('[data-year-filter]');
  var filterList = document.querySelector('[data-filter-list]');

  function applyLocalFilter() {
    if (!filterList) {
      return;
    }
    var query = filterInput ? filterInput.value.trim().toLowerCase() : '';
    var year = yearFilter ? yearFilter.value : '';
    var cards = Array.prototype.slice.call(filterList.querySelectorAll('[data-card]'));

    cards.forEach(function (card) {
      var text = [
        card.getAttribute('data-title') || '',
        card.getAttribute('data-tags') || '',
        card.getAttribute('data-region') || '',
        card.getAttribute('data-year') || ''
      ].join(' ').toLowerCase();
      var cardYear = card.getAttribute('data-year') || '';
      var matchQuery = !query || text.indexOf(query) !== -1;
      var matchYear = !year || cardYear === year;
      card.classList.toggle('is-hidden', !(matchQuery && matchYear));
    });
  }

  if (filterInput) {
    filterInput.addEventListener('input', applyLocalFilter);
  }
  if (yearFilter) {
    yearFilter.addEventListener('change', applyLocalFilter);
  }

  var searchInput = document.querySelector('[data-search-input]');
  var searchResults = document.querySelector('[data-search-results]');
  var searchTitle = document.querySelector('[data-search-title]');

  function getQuery() {
    var params = new URLSearchParams(window.location.search);
    return (params.get('q') || '').trim();
  }

  function renderSearch() {
    if (!searchResults || !window.searchMovies) {
      return;
    }

    var query = getQuery();
    if (searchInput) {
      searchInput.value = query;
    }
    if (!query) {
      return;
    }

    var terms = query.toLowerCase().split(/\s+/).filter(Boolean);
    var matches = window.searchMovies.filter(function (movie) {
      var text = [movie.title, movie.year, movie.region, movie.type, movie.genre, (movie.tags || []).join(' '), movie.oneLine].join(' ').toLowerCase();
      return terms.every(function (term) {
        return text.indexOf(term) !== -1;
      });
    }).slice(0, 96);

    if (searchTitle) {
      searchTitle.textContent = '搜索结果';
    }

    searchResults.innerHTML = matches.map(function (movie) {
      return '<article class="movie-card">' +
        '<a href="' + escapeAttr(movie.link) + '" class="card-cover" style="--cover: url(\'' + escapeAttr(movie.image) + '\')" aria-label="' + escapeAttr(movie.title) + '">' +
        '<span class="play-float">▶</span><span class="badge">' + escapeHtml(movie.type) + '</span></a>' +
        '<div class="card-body"><a href="' + escapeAttr(movie.link) + '" class="card-title">' + escapeHtml(movie.title) + '</a>' +
        '<p>' + escapeHtml(movie.oneLine || '') + '</p>' +
        '<div class="card-meta"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.genre) + '</span></div></div>' +
        '</article>';
    }).join('');
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"]/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;'
      }[char];
    });
  }

  function escapeAttr(value) {
    return escapeHtml(value).replace(/'/g, '&#39;');
  }

  renderSearch();

  var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

  players.forEach(function (player) {
    var video = player.querySelector('video');
    var source = player.getAttribute('data-play');
    var playButton = player.querySelector('[data-action="play"]');
    var toggleButton = player.querySelector('[data-action="toggle"]');
    var muteButton = player.querySelector('[data-action="mute"]');
    var fullscreenButton = player.querySelector('[data-action="fullscreen"]');
    var loaded = false;
    var hls = null;

    function loadVideo() {
      if (loaded || !video || !source) {
        return;
      }
      loaded = true;

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else {
        video.src = source;
      }

      video.controls = true;
    }

    function playVideo() {
      loadVideo();
      player.classList.add('is-started');
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {});
      }
    }

    function toggleVideo() {
      if (!video) {
        return;
      }
      if (video.paused) {
        playVideo();
      } else {
        video.pause();
      }
    }

    if (playButton) {
      playButton.addEventListener('click', playVideo);
    }
    if (toggleButton) {
      toggleButton.addEventListener('click', toggleVideo);
    }
    if (muteButton) {
      muteButton.addEventListener('click', function () {
        video.muted = !video.muted;
        muteButton.textContent = video.muted ? '取消静音' : '静音';
      });
    }
    if (fullscreenButton) {
      fullscreenButton.addEventListener('click', function () {
        var target = player.querySelector('.player-box') || video;
        if (document.fullscreenElement) {
          document.exitFullscreen();
        } else if (target && target.requestFullscreen) {
          target.requestFullscreen();
        }
      });
    }
    if (video) {
      video.addEventListener('play', function () {
        player.classList.add('is-started');
        if (toggleButton) {
          toggleButton.textContent = '暂停';
        }
      });
      video.addEventListener('pause', function () {
        if (toggleButton) {
          toggleButton.textContent = '播放';
        }
      });
    }
    window.addEventListener('pagehide', function () {
      if (hls && typeof hls.destroy === 'function') {
        hls.destroy();
      }
    });
  });
})();
