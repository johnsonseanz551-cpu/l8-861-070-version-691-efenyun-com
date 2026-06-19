(function () {
  function selectAll(selector, scope) {
    return Array.prototype.slice.call(
      (scope || document).querySelectorAll(selector),
    );
  }

  function initMobileMenu() {
    var button = document.querySelector(".mobile-toggle");
    var menu = document.querySelector(".mobile-menu");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      menu.classList.toggle("is-open");
      button.textContent = menu.classList.contains("is-open") ? "×" : "☰";
    });
  }

  function initSearchForms() {
    selectAll(".search-form").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector('input[name="q"]');
        if (!input || !input.value.trim()) {
          event.preventDefault();
          return;
        }
      });
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = selectAll(".hero-slide", hero);
    var dots = selectAll(".hero-dot", hero);
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        start();
      });
    });
    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }
    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function initFilters() {
    var panel = document.querySelector("[data-filter-panel]");
    if (!panel) {
      return;
    }
    var textInput = panel.querySelector("[data-filter-text]");
    var yearSelect = panel.querySelector("[data-filter-year]");
    var typeSelect = panel.querySelector("[data-filter-type]");
    var regionSelect = panel.querySelector("[data-filter-region]");
    var cards = selectAll(".filter-list .movie-card");

    function normalized(value) {
      return String(value || "")
        .trim()
        .toLowerCase();
    }

    function matchSelect(value, selected) {
      return selected === "全部" || !selected || value.indexOf(selected) !== -1;
    }

    function applyFilters() {
      var text = normalized(textInput && textInput.value);
      var year = yearSelect ? yearSelect.value : "全部";
      var type = typeSelect ? typeSelect.value : "全部";
      var region = regionSelect ? regionSelect.value : "全部";
      cards.forEach(function (card) {
        var title = card.getAttribute("data-title") || "";
        var cardYear = card.getAttribute("data-year") || "";
        var cardType = card.getAttribute("data-type") || "";
        var cardRegion = card.getAttribute("data-region") || "";
        var cardGenre = card.getAttribute("data-genre") || "";
        var haystack = normalized(
          [title, cardYear, cardType, cardRegion, cardGenre].join(" "),
        );
        var visible =
          (!text || haystack.indexOf(text) !== -1) &&
          matchSelect(cardYear, year) &&
          matchSelect(cardType, type) &&
          matchSelect(cardRegion, region);
        card.hidden = !visible;
      });
    }

    [textInput, yearSelect, typeSelect, regionSelect].forEach(function (item) {
      if (item) {
        item.addEventListener("input", applyFilters);
        item.addEventListener("change", applyFilters);
      }
    });
    applyFilters();
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function makeSearchCard(item) {
    var tags = (item.tags || [])
      .slice(0, 3)
      .map(function (tag) {
        return "<span>" + escapeHtml(tag) + "</span>";
      })
      .join("");
    return [
      '<article class="movie-card">',
      '<a href="./' + escapeHtml(item.file) + '" class="poster-link">',
      '<div class="poster-wrap">',
      '<img src="' +
        escapeHtml(item.cover) +
        '" alt="' +
        escapeHtml(item.title) +
        '" loading="lazy">',
      '<div class="poster-shade"></div>',
      '<div class="play-chip">▶</div>',
      "</div>",
      "</a>",
      '<div class="card-body">',
      '<a href="./' +
        escapeHtml(item.file) +
        '" class="card-title">' +
        escapeHtml(item.title) +
        "</a>",
      '<div class="card-meta"><span>' +
        escapeHtml(item.year) +
        "</span><span>" +
        escapeHtml(item.region) +
        "</span><span>" +
        escapeHtml(item.type) +
        "</span></div>",
      "<p>" + escapeHtml(item.oneLine) + "</p>",
      '<div class="tag-row">' + tags + "</div>",
      "</div>",
      "</article>",
    ].join("");
  }

  function initSearchPage() {
    var page = document.querySelector("[data-search-page]");
    if (!page || typeof movieSearchIndex === "undefined") {
      return;
    }
    var form = page.querySelector("[data-search-page-form]");
    var input = page.querySelector("[data-search-page-input]");
    var title = page.querySelector("[data-search-result-title]");
    var results = page.querySelector("[data-search-results]");
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q") || "";
    input.value = initialQuery;

    function render(query) {
      var value = String(query || "")
        .trim()
        .toLowerCase();
      var list = value
        ? movieSearchIndex.filter(function (item) {
            return (
              [
                item.title,
                item.region,
                item.type,
                item.year,
                item.genre,
                (item.tags || []).join(" "),
                item.oneLine,
              ]
                .join(" ")
                .toLowerCase()
                .indexOf(value) !== -1
            );
          })
        : movieSearchIndex.slice(0, 60);
      results.innerHTML = list.slice(0, 120).map(makeSearchCard).join("");
      title.textContent = value ? "搜索：" + query : "热门影视推荐";
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var query = input.value.trim();
      var nextUrl = query
        ? "./search.html?q=" + encodeURIComponent(query)
        : "./search.html";
      window.history.replaceState(null, "", nextUrl);
      render(query);
    });
    input.addEventListener("input", function () {
      render(input.value);
    });
    render(initialQuery);
  }

  function initPlayer() {
    if (typeof pageVideoUrl !== "string" || !pageVideoUrl) {
      return;
    }
    var video = document.querySelector("[data-player-video]");
    var cover = document.querySelector("[data-player-cover]");
    if (!video || !cover) {
      return;
    }
    var ready = false;
    var hls = null;

    function prepare() {
      if (ready) {
        return;
      }
      ready = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = pageVideoUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls();
        hls.loadSource(pageVideoUrl);
        hls.attachMedia(video);
      } else {
        video.src = pageVideoUrl;
      }
    }

    function play() {
      prepare();
      cover.classList.add("is-hidden");
      video.controls = true;
      var attempt = video.play();
      if (attempt && typeof attempt.catch === "function") {
        attempt.catch(function () {});
      }
    }

    cover.addEventListener("click", play);
    video.addEventListener("click", function () {
      if (!ready || video.paused) {
        play();
      }
    });
    window.addEventListener("beforeunload", function () {
      if (hls && typeof hls.destroy === "function") {
        hls.destroy();
      }
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initMobileMenu();
    initSearchForms();
    initHero();
    initFilters();
    initSearchPage();
    initPlayer();
  });
})();
