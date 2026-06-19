(function () {
  var body = document.body;

  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function escapeHTML(value) {
    return String(value || "").replace(/[&<>'"]/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#39;",
        "\"": "&quot;"
      }[char];
    });
  }

  function initMenu() {
    var button = qs(".menu-button");
    var panel = qs(".mobile-panel");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", function () {
      var open = panel.classList.toggle("open");
      button.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function initHero() {
    var slider = qs(".hero-slider");
    if (!slider) {
      return;
    }
    var slides = qsa(".hero-slide", slider);
    var dots = qsa(".hero-dot", slider);
    var prev = qs(".hero-prev", slider);
    var next = qs(".hero-next", slider);
    var active = 0;
    var timer;

    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === active);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === active);
      });
    }

    function start() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(active + 1);
      }, 5200);
    }

    if (!slides.length) {
      return;
    }
    show(0);
    start();

    if (prev) {
      prev.addEventListener("click", function () {
        show(active - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(active + 1);
        start();
      });
    }
    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        start();
      });
    });
  }

  function initSiteSearchForms() {
    qsa(".js-site-search").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = qs("input", form);
        var query = input ? input.value.trim() : "";
        var target = "search.html";
        if (query) {
          target += "?q=" + encodeURIComponent(query);
        }
        window.location.href = target;
      });
    });
  }

  function initFilters() {
    var filter = qs(".filter-bar");
    if (!filter) {
      return;
    }
    var keyword = qs("[data-filter='keyword']", filter);
    var year = qs("[data-filter='year']", filter);
    var region = qs("[data-filter='region']", filter);
    var type = qs("[data-filter='type']", filter);
    var cards = qsa(".movie-card[data-title]");
    var empty = qs(".empty-state");

    function valueOf(element) {
      return element ? element.value.trim().toLowerCase() : "";
    }

    function run() {
      var key = valueOf(keyword);
      var y = valueOf(year);
      var r = valueOf(region);
      var t = valueOf(type);
      var visible = 0;
      cards.forEach(function (card) {
        var haystack = [card.dataset.title, card.dataset.region, card.dataset.type, card.dataset.year, card.dataset.genre].join(" ").toLowerCase();
        var matched = true;
        if (key && haystack.indexOf(key) === -1) {
          matched = false;
        }
        if (y && String(card.dataset.year || "").toLowerCase() !== y) {
          matched = false;
        }
        if (r && String(card.dataset.region || "").toLowerCase() !== r) {
          matched = false;
        }
        if (t && String(card.dataset.type || "").toLowerCase() !== t) {
          matched = false;
        }
        card.style.display = matched ? "" : "none";
        if (matched) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle("visible", visible === 0);
      }
    }

    [keyword, year, region, type].forEach(function (element) {
      if (element) {
        element.addEventListener("input", run);
        element.addEventListener("change", run);
      }
    });
    run();
  }

  function cardTemplate(movie) {
    return [
      "<a class=\"movie-card tall\" href=\"" + escapeHTML(movie.url) + "\" data-title=\"" + escapeHTML(movie.title) + "\" data-region=\"" + escapeHTML(movie.region) + "\" data-type=\"" + escapeHTML(movie.type) + "\" data-year=\"" + escapeHTML(movie.year) + "\" data-genre=\"" + escapeHTML(movie.genre) + "\">",
      "<div class=\"poster-wrap\"><img src=\"" + escapeHTML(movie.cover) + "\" alt=\"" + escapeHTML(movie.title) + "\" loading=\"lazy\"><span class=\"card-badge\">" + escapeHTML(movie.type) + "</span><span class=\"card-duration\">" + escapeHTML(movie.duration) + "</span><span class=\"card-play\"><span>▶</span></span></div>",
      "<div class=\"card-body\"><h3>" + escapeHTML(movie.title) + "</h3><p>" + escapeHTML(movie.oneLine) + "</p><div class=\"card-meta\"><span>" + escapeHTML(movie.year) + "</span><span>" + escapeHTML(movie.region) + "</span><span class=\"meta-pill\">" + escapeHTML(movie.category) + "</span></div></div>",
      "</a>"
    ].join("");
  }

  function initSearchPage() {
    var page = qs("[data-search-page]");
    if (!page || !window.SEARCH_INDEX) {
      return;
    }
    var form = qs(".search-page-box form");
    var input = qs(".search-page-box input");
    var results = qs("[data-search-results]");
    var empty = qs(".empty-state");
    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q") || "";
    if (input) {
      input.value = initial;
    }

    function render() {
      var query = input ? input.value.trim().toLowerCase() : "";
      var list = window.SEARCH_INDEX.filter(function (movie) {
        if (!query) {
          return true;
        }
        return [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags, movie.oneLine].join(" ").toLowerCase().indexOf(query) !== -1;
      }).slice(0, 160);
      if (results) {
        results.innerHTML = list.map(cardTemplate).join("");
      }
      if (empty) {
        empty.classList.toggle("visible", list.length === 0);
      }
    }

    if (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        render();
      });
    }
    if (input) {
      input.addEventListener("input", render);
    }
    render();
  }

  initMenu();
  initHero();
  initSiteSearchForms();
  initFilters();
  initSearchPage();
})();
