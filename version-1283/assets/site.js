(function () {
  const mobileButton = document.querySelector('.mobile-toggle');
  const mobileNav = document.querySelector('.mobile-nav');

  if (mobileButton && mobileNav) {
    mobileButton.addEventListener('click', function () {
      const open = mobileNav.classList.toggle('is-open');
      mobileButton.setAttribute('aria-expanded', String(open));
    });
  }

  const hero = document.querySelector('[data-hero]');
  if (hero) {
    const slides = Array.from(hero.querySelectorAll('.hero-slide'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    let active = 0;
    let timer = null;

    const showSlide = function (index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === active);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === active);
      });
    };

    const start = function () {
      timer = window.setInterval(function () {
        showSlide(active + 1);
      }, 5600);
    };

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        window.clearInterval(timer);
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    start();
  }

  const cards = Array.from(document.querySelectorAll('[data-filter-card]'));
  const searchInput = document.querySelector('[data-search]');
  const filterControls = Array.from(document.querySelectorAll('[data-filter]'));

  if (cards.length && (searchInput || filterControls.length)) {
    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get('q');
    if (initialQuery && searchInput) {
      searchInput.value = initialQuery;
    }

    const filterCards = function () {
      const query = searchInput ? searchInput.value.trim().toLowerCase() : '';
      const activeFilters = filterControls.map(function (control) {
        return {
          key: control.getAttribute('data-filter'),
          value: control.value.trim().toLowerCase()
        };
      });

      cards.forEach(function (card) {
        const text = [
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-year'),
          card.getAttribute('data-genre'),
          card.textContent
        ].join(' ').toLowerCase();

        const queryMatched = !query || text.indexOf(query) !== -1;
        const filtersMatched = activeFilters.every(function (filter) {
          if (!filter.value) {
            return true;
          }
          const cardValue = (card.getAttribute('data-' + filter.key) || '').toLowerCase();
          return cardValue.indexOf(filter.value) !== -1;
        });

        card.classList.toggle('is-hidden', !(queryMatched && filtersMatched));
      });
    };

    if (searchInput) {
      searchInput.addEventListener('input', filterCards);
    }
    filterControls.forEach(function (control) {
      control.addEventListener('change', filterCards);
    });
    filterCards();
  }

  const video = document.getElementById('movie-player');
  const playCover = document.querySelector('.play-cover');

  if (video && typeof activeVideoUrl !== 'undefined' && activeVideoUrl) {
    let ready = false;

    const attach = function () {
      if (ready) {
        return;
      }
      ready = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = activeVideoUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        const hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(activeVideoUrl);
        hls.attachMedia(video);
      } else {
        video.src = activeVideoUrl;
      }
    };

    const play = function () {
      attach();
      if (playCover) {
        playCover.classList.add('is-hidden');
      }
      const promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {});
      }
    };

    if (playCover) {
      playCover.addEventListener('click', play);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      }
    });

    video.addEventListener('play', function () {
      if (playCover) {
        playCover.classList.add('is-hidden');
      }
    });
  }
})();
