(function () {
    var form = document.querySelector('[data-search-form]');
    var input = document.querySelector('[data-search-input]');
    var results = document.querySelector('[data-search-results]');
    var movies = window.SEARCH_MOVIES || [];

    function escapeHtml(value) {
        return String(value).replace(/[&<>"]/g, function (char) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;'
            }[char];
        });
    }

    function card(movie) {
        var tags = (movie.tags || []).slice(0, 4).map(function (tag) {
            return '<span>' + escapeHtml(tag) + '</span>';
        }).join('');

        return '<article class="movie-card">' +
            '<a class="poster-link" href="' + escapeHtml(movie.url) + '">' +
                '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
                '<span class="poster-shade"></span>' +
                '<span class="duration-badge">' + escapeHtml(movie.duration) + '</span>' +
                '<span class="play-badge">▶</span>' +
            '</a>' +
            '<div class="movie-card-body">' +
                '<a class="movie-title" href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a>' +
                '<p class="movie-desc">' + escapeHtml(movie.oneLine) + '</p>' +
                '<div class="movie-meta">' +
                    '<span>' + escapeHtml(movie.region) + '</span>' +
                    '<span>' + escapeHtml(movie.year) + '</span>' +
                    '<span>' + escapeHtml(movie.type) + '</span>' +
                '</div>' +
                '<div class="movie-tags">' + tags + '</div>' +
            '</div>' +
        '</article>';
    }

    function render(query) {
        if (!results) {
            return;
        }

        var text = (query || '').trim().toLowerCase();
        var list = movies.filter(function (movie) {
            if (!text) {
                return true;
            }
            return [
                movie.title,
                movie.region,
                movie.type,
                movie.genre,
                movie.year,
                (movie.tags || []).join(' '),
                movie.oneLine
            ].join(' ').toLowerCase().indexOf(text) !== -1;
        }).slice(0, 160);

        if (!list.length) {
            results.innerHTML = '<div class="empty-state show">没有找到匹配内容</div>';
            return;
        }

        results.innerHTML = list.map(card).join('');
    }

    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';

    if (input) {
        input.value = initial;
        input.addEventListener('input', function () {
            render(input.value);
        });
    }

    if (form) {
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            render(input ? input.value : '');
        });
    }

    render(initial);
})();
