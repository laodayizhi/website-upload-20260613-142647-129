(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobileMenu = document.querySelector('[data-mobile-menu]');
    if (menuButton && mobileMenu) {
        menuButton.addEventListener('click', function () {
            mobileMenu.classList.toggle('is-open');
        });
    }

    var hero = document.querySelector('[data-hero]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
        var index = 0;
        var show = function (next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === index);
            });
        };
        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                show(i);
            });
        });
        if (slides.length > 1) {
            setInterval(function () {
                show(index + 1);
            }, 5200);
        }
    }

    var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));
    panels.forEach(function (panel) {
        var input = panel.querySelector('[data-search]');
        var region = panel.querySelector('[data-region-filter]');
        var type = panel.querySelector('[data-type-filter]');
        var year = panel.querySelector('[data-year-filter]');
        var scopeId = panel.getAttribute('data-filter-panel');
        var scope = scopeId ? document.querySelector('[data-card-scope="' + scopeId + '"]') : document;
        var cards = scope ? Array.prototype.slice.call(scope.querySelectorAll('.movie-card')) : [];
        var empty = scope ? scope.querySelector('.no-result') : null;
        var update = function () {
            var term = input ? input.value.trim().toLowerCase() : '';
            var reg = region ? region.value : '';
            var typ = type ? type.value : '';
            var yr = year ? year.value : '';
            var visible = 0;
            cards.forEach(function (card) {
                var hay = [card.dataset.title, card.dataset.region, card.dataset.type, card.dataset.tags, card.dataset.year].join(' ').toLowerCase();
                var ok = (!term || hay.indexOf(term) !== -1) && (!reg || card.dataset.region === reg) && (!typ || card.dataset.type === typ) && (!yr || card.dataset.year === yr);
                card.style.display = ok ? '' : 'none';
                if (ok) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.classList.toggle('is-visible', visible === 0);
            }
        };
        [input, region, type, year].forEach(function (el) {
            if (el) {
                el.addEventListener('input', update);
                el.addEventListener('change', update);
            }
        });
    });

    var playButtons = Array.prototype.slice.call(document.querySelectorAll('[data-stream]'));
    playButtons.forEach(function (button) {
        button.addEventListener('click', function () {
            var frame = button.closest('.video-frame');
            var video = frame ? frame.querySelector('video') : null;
            var stream = button.getAttribute('data-stream');
            if (!frame || !video || !stream) {
                return;
            }
            var start = function () {
                var attempt = video.play();
                if (attempt && attempt.catch) {
                    attempt.catch(function () {});
                }
                frame.classList.add('is-playing');
            };
            if (window.Hls && window.Hls.isSupported()) {
                if (video._hlsPlayer) {
                    video._hlsPlayer.destroy();
                }
                var hls = new window.Hls({ enableWorker: true });
                video._hlsPlayer = hls;
                hls.loadSource(stream);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, start);
            } else {
                video.src = stream;
                video.addEventListener('loadedmetadata', start, { once: true });
                start();
            }
        });
    });
})();
