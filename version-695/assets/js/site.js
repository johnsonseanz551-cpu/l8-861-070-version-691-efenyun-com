(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobileMenu = document.querySelector('[data-mobile-menu]');

    if (menuButton && mobileMenu) {
        menuButton.addEventListener('click', function () {
            mobileMenu.classList.toggle('open');
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var activeIndex = 0;

        function showHero(index) {
            if (!slides.length) {
                return;
            }
            activeIndex = (index + slides.length) % slides.length;
            slides.forEach(function (slide, current) {
                slide.classList.toggle('active', current === activeIndex);
            });
            dots.forEach(function (dot, current) {
                dot.classList.toggle('active', current === activeIndex);
            });
        }

        if (prev) {
            prev.addEventListener('click', function () {
                showHero(activeIndex - 1);
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                showHero(activeIndex + 1);
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showHero(Number(dot.getAttribute('data-hero-dot') || 0));
            });
        });

        setInterval(function () {
            showHero(activeIndex + 1);
        }, 5200);
    }

    document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
        var search = scope.querySelector('[data-card-search]');
        var filters = Array.prototype.slice.call(scope.querySelectorAll('[data-card-filter]'));
        var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-movie-card]'));
        var empty = scope.querySelector('[data-empty-state]');

        function matches(card) {
            var query = search ? search.value.trim().toLowerCase() : '';
            var haystack = [
                card.getAttribute('data-title') || '',
                card.getAttribute('data-region') || '',
                card.getAttribute('data-genre') || '',
                card.getAttribute('data-tags') || '',
                card.getAttribute('data-year') || ''
            ].join(' ').toLowerCase();
            var ok = query === '' || haystack.indexOf(query) !== -1;

            filters.forEach(function (filter) {
                var key = filter.getAttribute('data-card-filter');
                var value = filter.value;
                var target = card.getAttribute('data-' + key) || '';
                if (value && target.indexOf(value) === -1) {
                    ok = false;
                }
            });

            return ok;
        }

        function apply() {
            var visible = 0;
            cards.forEach(function (card) {
                var ok = matches(card);
                card.style.display = ok ? '' : 'none';
                if (ok) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.classList.toggle('show', visible === 0);
            }
        }

        if (search) {
            search.addEventListener('input', apply);
        }

        filters.forEach(function (filter) {
            filter.addEventListener('change', apply);
        });
    });
})();
