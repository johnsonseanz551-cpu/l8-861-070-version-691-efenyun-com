(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  ready(function () {
    var menuButton = document.querySelector("[data-menu-toggle]");
    var mobileMenu = document.querySelector("[data-mobile-menu]");

    if (menuButton && mobileMenu) {
      menuButton.addEventListener("click", function () {
        mobileMenu.classList.toggle("is-open");
      });
    }

    document.querySelectorAll("[data-hero]").forEach(function (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var previous = hero.querySelector("[data-hero-prev]");
      var next = hero.querySelector("[data-hero-next]");
      var active = 0;
      var timer = null;

      function show(index) {
        if (!slides.length) {
          return;
        }
        active = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === active);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === active);
        });
      }

      function start() {
        stop();
        timer = window.setInterval(function () {
          show(active + 1);
        }, 5200);
      }

      function stop() {
        if (timer) {
          window.clearInterval(timer);
          timer = null;
        }
      }

      if (previous) {
        previous.addEventListener("click", function () {
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

      hero.addEventListener("mouseenter", stop);
      hero.addEventListener("mouseleave", start);
      show(0);
      start();
    });

    document.querySelectorAll("[data-filter-list]").forEach(function (list) {
      var wrapper = list.closest("main") || document;
      var input = wrapper.querySelector("[data-filter-input]");
      var year = wrapper.querySelector("[data-filter-select='year']");
      var type = wrapper.querySelector("[data-filter-select='type']");
      var empty = wrapper.querySelector("[data-filter-empty]");
      var items = Array.prototype.slice.call(list.children);

      function normalize(value) {
        return String(value || "").trim().toLowerCase();
      }

      function match(item) {
        var query = normalize(input ? input.value : "");
        var yearValue = normalize(year ? year.value : "");
        var typeValue = normalize(type ? type.value : "");
        var text = normalize([
          item.getAttribute("data-title"),
          item.getAttribute("data-region"),
          item.getAttribute("data-genre"),
          item.getAttribute("data-year"),
          item.getAttribute("data-tags"),
          item.getAttribute("data-type")
        ].join(" "));
        var yearMatch = !yearValue || normalize(item.getAttribute("data-year")) === yearValue;
        var typeMatch = !typeValue || normalize(item.getAttribute("data-type")).indexOf(typeValue) !== -1;
        var queryMatch = !query || text.indexOf(query) !== -1;
        return yearMatch && typeMatch && queryMatch;
      }

      function apply() {
        var visible = 0;
        items.forEach(function (item) {
          var ok = match(item);
          item.style.display = ok ? "" : "none";
          if (ok) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      }

      [input, year, type].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });

      apply();
    });

    var searchResults = document.getElementById("search-results");
    var searchInput = document.querySelector("[data-search-input]");
    var searchTitle = document.querySelector("[data-search-title]");
    var searchEmpty = document.querySelector("[data-search-empty]");

    if (searchResults && searchInput && window.siteMovieIndex) {
      var params = new URLSearchParams(window.location.search);
      var initialQuery = params.get("q") || "";
      searchInput.value = initialQuery;

      function escapeHtml(value) {
        return String(value || "").replace(/[&<>'"]/g, function (character) {
          return {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            "'": "&#39;",
            """: "&quot;"
          }[character];
        });
      }

      function card(movie) {
        return [
          "<article class="movie-card">",
          "<a href="" + escapeHtml(movie.file) + "" class="movie-link">",
          "<span class="poster-frame">",
          "<img src="" + escapeHtml(movie.cover) + "" alt="" + escapeHtml(movie.title) + "" loading="lazy">",
          "<span class="corner-badge">" + escapeHtml(movie.region) + "</span>",
          "<span class="play-hover">▶</span>",
          "</span>",
          "<span class="movie-info">",
          "<strong>" + escapeHtml(movie.title) + "</strong>",
          "<em>" + escapeHtml(movie.oneLine) + "</em>",
          "<span class="movie-meta">" + escapeHtml(movie.year) + " · " + escapeHtml(movie.type) + " · " + escapeHtml(movie.genre) + "</span>",
          "</span>",
          "</a>",
          "</article>"
        ].join("");
      }

      function render(query) {
        var normalized = String(query || "").trim().toLowerCase();
        if (!normalized) {
          if (searchTitle) {
            searchTitle.textContent = "热门内容";
          }
          if (searchEmpty) {
            searchEmpty.classList.remove("is-visible");
          }
          return;
        }

        var matches = window.siteMovieIndex.filter(function (movie) {
          return String([
            movie.title,
            movie.region,
            movie.genre,
            movie.year,
            movie.tags,
            movie.type,
            movie.oneLine
          ].join(" ")).toLowerCase().indexOf(normalized) !== -1;
        }).slice(0, 120);

        searchResults.innerHTML = matches.map(card).join("");

        if (searchTitle) {
          searchTitle.textContent = "搜索结果";
        }

        if (searchEmpty) {
          searchEmpty.classList.toggle("is-visible", matches.length === 0);
        }
      }

      searchInput.addEventListener("input", function () {
        render(searchInput.value);
      });

      render(initialQuery);
    }
  });
})();
