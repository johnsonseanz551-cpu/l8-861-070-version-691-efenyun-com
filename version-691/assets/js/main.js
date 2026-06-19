(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var toggle = document.querySelector("[data-menu-toggle]");
        var menu = document.querySelector("[data-menu]");

        if (toggle && menu) {
            toggle.addEventListener("click", function () {
                menu.classList.toggle("open");
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

            function restart() {
                if (timer) {
                    clearInterval(timer);
                }

                timer = setInterval(function () {
                    show(current + 1);
                }, 5000);
            }

            if (prev) {
                prev.addEventListener("click", function () {
                    show(current - 1);
                    restart();
                });
            }

            if (next) {
                next.addEventListener("click", function () {
                    show(current + 1);
                    restart();
                });
            }

            dots.forEach(function (dot) {
                dot.addEventListener("click", function () {
                    show(Number(dot.getAttribute("data-hero-dot")) || 0);
                    restart();
                });
            });

            show(0);
            restart();
        });

        document.querySelectorAll(".listing-section").forEach(function (section) {
            var input = section.querySelector("[data-filter-input]");
            var buttons = Array.prototype.slice.call(section.querySelectorAll("[data-filter-tag]"));
            var cards = Array.prototype.slice.call(section.querySelectorAll("[data-card]"));
            var empty = section.querySelector("[data-empty-state]");
            var activeTag = "";

            function normalize(value) {
                return String(value || "").trim().toLowerCase();
            }

            function applyFilter() {
                var query = normalize(input ? input.value : "");
                var visible = 0;

                cards.forEach(function (card) {
                    var haystack = normalize([
                        card.getAttribute("data-title"),
                        card.getAttribute("data-region"),
                        card.getAttribute("data-year"),
                        card.getAttribute("data-tags")
                    ].join(" "));
                    var matchQuery = !query || haystack.indexOf(query) !== -1;
                    var matchTag = !activeTag || haystack.indexOf(normalize(activeTag)) !== -1;
                    var show = matchQuery && matchTag;

                    card.style.display = show ? "" : "none";

                    if (show) {
                        visible += 1;
                    }
                });

                if (empty) {
                    empty.classList.toggle("visible", visible === 0);
                }
            }

            if (input) {
                var params = new URLSearchParams(window.location.search);
                var q = params.get("q");

                if (q) {
                    input.value = q;
                }

                input.addEventListener("input", applyFilter);
            }

            buttons.forEach(function (button) {
                button.addEventListener("click", function () {
                    activeTag = button.getAttribute("data-filter-tag") || "";

                    buttons.forEach(function (other) {
                        other.classList.toggle("active", other === button);
                    });

                    applyFilter();
                });
            });

            applyFilter();
        });
    });
}());
