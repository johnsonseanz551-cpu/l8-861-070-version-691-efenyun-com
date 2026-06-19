(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function initMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      panel.classList.toggle("open");
    });
  }

  function initHero() {
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
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === current);
      });
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        restart();
      });
    });

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

    if (slides.length > 1) {
      restart();
    }
  }

  function cardText(card) {
    return [
      card.getAttribute("data-title") || "",
      card.getAttribute("data-year") || "",
      card.getAttribute("data-genre") || "",
      card.getAttribute("data-tags") || ""
    ].join(" ").toLowerCase();
  }

  function initCardFilters() {
    var grids = Array.prototype.slice.call(document.querySelectorAll("[data-card-grid]"));
    grids.forEach(function (grid) {
      var scope = grid.closest(".section-wrap") || document;
      var search = scope.querySelector("[data-card-search]");
      var sort = scope.querySelector("[data-card-sort]");
      var cards = Array.prototype.slice.call(grid.children);

      function applyFilter() {
        var query = search ? search.value.trim().toLowerCase() : "";
        cards.forEach(function (card) {
          var matched = !query || cardText(card).indexOf(query) !== -1;
          card.classList.toggle("hidden-by-filter", !matched);
        });
      }

      function applySort() {
        if (!sort) {
          return;
        }
        var value = sort.value;
        var sorted = cards.slice();
        if (value === "rating") {
          sorted.sort(function (a, b) {
            return Number(b.getAttribute("data-rating") || 0) - Number(a.getAttribute("data-rating") || 0);
          });
        }
        if (value === "views") {
          sorted.sort(function (a, b) {
            return Number(b.getAttribute("data-views") || 0) - Number(a.getAttribute("data-views") || 0);
          });
        }
        if (value === "year") {
          sorted.sort(function (a, b) {
            return Number(b.getAttribute("data-year") || 0) - Number(a.getAttribute("data-year") || 0);
          });
        }
        sorted.forEach(function (card) {
          grid.appendChild(card);
        });
        cards = sorted;
        applyFilter();
      }

      if (search) {
        search.addEventListener("input", applyFilter);
      }
      if (sort) {
        sort.addEventListener("change", applySort);
      }
    });
  }

  function renderSearchCard(item) {
    var tags = (item.tags || []).slice(0, 3).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");
    return "" +
      "<article class=\"movie-card\">" +
      "<a href=\"" + item.url + "\">" +
      "<div class=\"poster\">" +
      "<img src=\"" + item.image + "\" alt=\"" + escapeHtml(item.title) + "\" loading=\"lazy\">" +
      "<span class=\"quality\">高清</span>" +
      "</div>" +
      "<div class=\"card-body\">" +
      "<div class=\"card-meta\">" + escapeHtml(item.year) + " · " + escapeHtml(item.region) + " · " + escapeHtml(item.type) + "</div>" +
      "<h3>" + escapeHtml(item.title) + "</h3>" +
      "<p>" + escapeHtml(item.oneLine) + "</p>" +
      "<div class=\"tag-row\">" + tags + "</div>" +
      "</div>" +
      "</a>" +
      "</article>";
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function initSearchPage() {
    var results = document.querySelector("[data-search-results]");
    var status = document.querySelector("[data-search-status]");
    var form = document.querySelector("[data-search-form]");
    if (!results || !status || !window.SEARCH_INDEX) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = (params.get("q") || "").trim();
    var input = form ? form.querySelector("input[name='q']") : null;
    if (input) {
      input.value = query;
    }

    if (!query) {
      return;
    }

    var words = query.toLowerCase().split(/\s+/).filter(Boolean);
    var matched = window.SEARCH_INDEX.filter(function (item) {
      var text = [
        item.title,
        item.region,
        item.type,
        item.year,
        item.genre,
        (item.tags || []).join(" "),
        item.oneLine
      ].join(" ").toLowerCase();
      return words.every(function (word) {
        return text.indexOf(word) !== -1;
      });
    }).slice(0, 120);

    if (!matched.length) {
      status.textContent = "没有找到匹配影片。";
      results.innerHTML = "";
      return;
    }

    status.textContent = "搜索结果";
    results.innerHTML = matched.map(renderSearchCard).join("");
  }

  function initPlayer() {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
    players.forEach(function (shell) {
      var video = shell.querySelector("video");
      var cover = shell.querySelector(".player-cover");
      if (!video || !cover) {
        return;
      }
      var stream = video.getAttribute("data-stream");
      var started = false;
      var hlsInstance = null;

      function attachStream() {
        if (started) {
          return Promise.resolve();
        }
        started = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = stream;
          return Promise.resolve();
        }
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(stream);
          hlsInstance.attachMedia(video);
          return Promise.resolve();
        }
        video.src = stream;
        return Promise.resolve();
      }

      function play() {
        cover.classList.add("hidden");
        attachStream().then(function () {
          var playPromise = video.play();
          if (playPromise && typeof playPromise.catch === "function") {
            playPromise.catch(function () {});
          }
        });
      }

      cover.addEventListener("click", play);
      video.addEventListener("play", function () {
        cover.classList.add("hidden");
      });
      window.addEventListener("pagehide", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
          hlsInstance = null;
        }
      });
    });
  }

  ready(function () {
    initMenu();
    initHero();
    initCardFilters();
    initSearchPage();
    initPlayer();
  });
})();
