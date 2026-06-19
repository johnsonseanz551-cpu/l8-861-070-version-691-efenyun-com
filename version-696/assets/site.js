(function () {
    var mobileToggle = document.querySelector(".mobile-toggle");
    var mobilePanel = document.querySelector(".mobile-panel");

    if (mobileToggle && mobilePanel) {
        mobileToggle.addEventListener("click", function () {
            var isOpen = mobileToggle.getAttribute("aria-expanded") === "true";
            mobileToggle.setAttribute("aria-expanded", String(!isOpen));
            mobilePanel.hidden = isOpen;
        });
    }

    document.querySelectorAll("[data-hero]").forEach(function (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
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

        if (slides.length > 1) {
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
            dots.forEach(function (dot) {
                dot.addEventListener("click", function () {
                    show(Number(dot.dataset.heroDot || 0));
                    start();
                });
            });
            hero.addEventListener("mouseenter", stop);
            hero.addEventListener("mouseleave", start);
            start();
        }
    });

    function normalize(value) {
        return (value || "").toString().trim().toLowerCase();
    }

    function applyFilter(box) {
        var keywordInput = box.querySelector("[data-local-filter]");
        var genreSelect = box.querySelector("[data-genre-filter]");
        var grid = box.parentElement.querySelector(".filter-grid");
        if (!grid) {
            return;
        }
        var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));
        var keyword = normalize(keywordInput ? keywordInput.value : "");
        var genre = normalize(genreSelect ? genreSelect.value : "");
        var visible = 0;

        cards.forEach(function (card) {
            var haystack = normalize([
                card.dataset.title,
                card.dataset.region,
                card.dataset.genre,
                card.dataset.tags,
                card.dataset.year
            ].join(" "));
            var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
            var matchGenre = !genre || haystack.indexOf(genre) !== -1;
            var show = matchKeyword && matchGenre;
            card.classList.toggle("is-filtered-out", !show);
            if (show) {
                visible += 1;
            }
        });

        var status = document.querySelector("[data-search-status]");
        if (status) {
            status.textContent = visible > 0 ? "已匹配到相关影片" : "未匹配到相关影片";
        }
    }

    document.querySelectorAll("[data-filter-box]").forEach(function (box) {
        box.addEventListener("input", function () {
            applyFilter(box);
        });
        box.addEventListener("change", function () {
            applyFilter(box);
        });
    });

    var searchPage = document.querySelector("[data-search-page]");
    if (searchPage) {
        var params = new URLSearchParams(window.location.search);
        var query = params.get("q") || "";
        var input = searchPage.querySelector("[data-search-input]");
        var localInput = searchPage.querySelector("[data-local-filter]");
        var filterBox = searchPage.querySelector("[data-filter-box]");
        if (input) {
            input.value = query;
        }
        if (localInput) {
            localInput.value = query;
        }
        if (filterBox) {
            applyFilter(filterBox);
        }
    }
})();
