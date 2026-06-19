(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    ready(function () {
        var toggle = document.querySelector("[data-menu-toggle]");
        var menu = document.querySelector("[data-mobile-menu]");
        if (toggle && menu) {
            toggle.addEventListener("click", function () {
                menu.classList.toggle("is-open");
            });
        }

        var slider = document.querySelector("[data-hero-slider]");
        if (slider) {
            var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
            var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
            var next = slider.querySelector("[data-hero-next]");
            var prev = slider.querySelector("[data-hero-prev]");
            var current = 0;
            var timer = null;

            function show(index) {
                current = (index + slides.length) % slides.length;
                slides.forEach(function (slide, i) {
                    slide.classList.toggle("is-active", i === current);
                });
                dots.forEach(function (dot, i) {
                    dot.classList.toggle("is-active", i === current);
                });
            }

            function start() {
                if (slides.length > 1) {
                    timer = window.setInterval(function () {
                        show(current + 1);
                    }, 5200);
                }
            }

            function stop() {
                if (timer) {
                    window.clearInterval(timer);
                    timer = null;
                }
            }

            dots.forEach(function (dot, i) {
                dot.addEventListener("click", function () {
                    show(i);
                });
            });
            if (next) {
                next.addEventListener("click", function () {
                    show(current + 1);
                });
            }
            if (prev) {
                prev.addEventListener("click", function () {
                    show(current - 1);
                });
            }
            slider.addEventListener("mouseenter", stop);
            slider.addEventListener("mouseleave", start);
            start();
        }

        var filterInput = document.querySelector("[data-list-filter]");
        if (filterInput) {
            var params = new URLSearchParams(window.location.search);
            var q = params.get("q") || "";
            if (q) {
                filterInput.value = q;
            }
            var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
            var empty = document.querySelector("[data-no-results]");

            function applyFilter() {
                var value = filterInput.value.trim().toLowerCase();
                var visible = 0;
                cards.forEach(function (card) {
                    var text = (card.getAttribute("data-search") || "").toLowerCase();
                    var matched = !value || text.indexOf(value) !== -1;
                    card.classList.toggle("is-hidden", !matched);
                    if (matched) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle("is-visible", visible === 0);
                }
            }

            filterInput.addEventListener("input", applyFilter);
            applyFilter();
        }
    });
})();
