(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setupMenu() {
        const toggle = document.querySelector("[data-menu-toggle]");
        const panel = document.querySelector("[data-mobile-panel]");
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener("click", function () {
            panel.classList.toggle("is-open");
        });
    }

    function setupHeaderSearch() {
        const forms = document.querySelectorAll("[data-site-search]");
        forms.forEach(function (form) {
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                const input = form.querySelector("input[name='q']");
                const query = input ? input.value.trim() : "";
                const target = form.getAttribute("data-search-path") || "search.html";
                const suffix = query ? "?q=" + encodeURIComponent(query) : "";
                window.location.href = target + suffix;
            });
        });
    }

    function setupHero() {
        const hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
        const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
        const prev = hero.querySelector("[data-hero-prev]");
        const next = hero.querySelector("[data-hero-next]");
        if (!slides.length) {
            return;
        }
        let current = 0;
        let timer = null;

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
                const index = Number(dot.getAttribute("data-hero-dot"));
                show(index);
                start();
            });
        });
        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        start();
    }

    function setupSearchPage() {
        const resultBox = document.querySelector("[data-search-results]");
        if (!resultBox || !window.SITE_SEARCH_DATA) {
            return;
        }
        const form = document.querySelector("[data-search-page-form]");
        const input = form ? form.querySelector("input[name='q']") : null;
        const title = document.querySelector("[data-search-title]");
        const params = new URLSearchParams(window.location.search);
        const initialQuery = params.get("q") || "";
        if (input) {
            input.value = initialQuery;
        }

        function normalize(value) {
            return String(value || "").toLowerCase();
        }

        function render(query) {
            const words = normalize(query).split(/\s+/).filter(Boolean);
            const source = window.SITE_SEARCH_DATA;
            const matches = words.length
                ? source.filter(function (item) {
                    const haystack = normalize([
                        item.title,
                        item.region,
                        item.type,
                        item.year,
                        item.genre,
                        item.tags,
                        item.category
                    ].join(" "));
                    return words.every(function (word) {
                        return haystack.indexOf(word) !== -1;
                    });
                })
                : source.slice(0, 60);
            const limited = matches.slice(0, 120);
            if (title) {
                title.textContent = words.length ? "搜索结果" : "热门推荐";
            }
            resultBox.innerHTML = limited.map(function (item) {
                return [
                    '<article class="movie-card compact">',
                    '<a class="poster-wrap" href="' + item.url + '" aria-label="观看' + escapeHtml(item.title) + '">',
                    '<img src="' + item.image + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
                    '<span class="poster-shade"></span>',
                    '<span class="play-dot">▶</span>',
                    '</a>',
                    '<div class="card-body">',
                    '<div class="meta-line"><span>' + escapeHtml(item.category) + '</span><span>' + escapeHtml(item.year) + '</span></div>',
                    '<h3><a href="' + item.url + '">' + escapeHtml(item.title) + '</a></h3>',
                    '<p>' + escapeHtml(item.oneLine) + '</p>',
                    '<div class="tag-row"><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.type) + '</span></div>',
                    '</div>',
                    '</article>'
                ].join("");
            }).join("");
        }

        function escapeHtml(value) {
            return String(value || "")
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#039;");
        }

        if (form) {
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                const query = input ? input.value.trim() : "";
                const url = query ? "search.html?q=" + encodeURIComponent(query) : "search.html";
                history.replaceState(null, "", url);
                render(query);
            });
        }
        render(initialQuery);
    }

    ready(function () {
        setupMenu();
        setupHeaderSearch();
        setupHero();
        setupSearchPage();
    });
}());
