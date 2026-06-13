(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var toggle = document.querySelector("[data-mobile-toggle]");
        var nav = document.querySelector("[data-nav-links]");
        if (toggle && nav) {
            toggle.addEventListener("click", function () {
                nav.classList.toggle("open");
            });
        }

        setupHero();
        setupFilters();
        applyQueryToSearchBox();
    });

    function setupHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }

        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var current = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                start();
            });
        });

        if (prev) {
            prev.addEventListener("click", function () {
                show(current - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(current + 1);
                start();
            });
        }

        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function setupFilters() {
        var searchInput = document.querySelector("[data-filter-search]");
        var categorySelect = document.querySelector("[data-filter-category]");
        var typeSelect = document.querySelector("[data-filter-type]");
        var reset = document.querySelector("[data-filter-reset]");
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
        var count = document.querySelector("[data-result-count]");

        if (!cards.length || (!searchInput && !categorySelect && !typeSelect)) {
            return;
        }

        if (categorySelect && window.__INITIAL_CATEGORY__) {
            categorySelect.value = window.__INITIAL_CATEGORY__;
        }

        if (typeSelect && window.__INITIAL_TYPE__) {
            typeSelect.value = window.__INITIAL_TYPE__;
        }

        function normalize(value) {
            return String(value || "").trim().toLowerCase();
        }

        function update() {
            var keyword = normalize(searchInput && searchInput.value);
            var category = categorySelect ? categorySelect.value : "";
            var type = typeSelect ? typeSelect.value : "";
            var visible = 0;

            cards.forEach(function (card) {
                var haystack = normalize(card.getAttribute("data-search"));
                var cardCategory = card.getAttribute("data-category") || "";
                var cardType = card.getAttribute("data-type") || "";
                var matched = true;

                if (keyword && haystack.indexOf(keyword) === -1) {
                    matched = false;
                }
                if (category && cardCategory !== category) {
                    matched = false;
                }
                if (type && cardType !== type) {
                    matched = false;
                }

                card.classList.toggle("is-hidden", !matched);
                if (matched) {
                    visible += 1;
                }
            });

            if (count) {
                count.textContent = "当前显示 " + visible + " 部影片";
            }
        }

        [searchInput, categorySelect, typeSelect].forEach(function (node) {
            if (node) {
                node.addEventListener("input", update);
                node.addEventListener("change", update);
            }
        });

        if (reset) {
            reset.addEventListener("click", function () {
                if (searchInput) {
                    searchInput.value = "";
                }
                if (categorySelect) {
                    categorySelect.value = window.__INITIAL_CATEGORY__ || "";
                }
                if (typeSelect) {
                    typeSelect.value = window.__INITIAL_TYPE__ || "";
                }
                update();
            });
        }

        update();
    }

    function applyQueryToSearchBox() {
        var params = new URLSearchParams(window.location.search);
        var query = params.get("q");
        var input = document.querySelector("[data-filter-search]");
        if (query && input) {
            input.value = query;
            input.dispatchEvent(new Event("input", { bubbles: true }));
        }
    }
})();
