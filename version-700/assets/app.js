const menuToggle = document.querySelector(".menu-toggle");
const mobileNav = document.querySelector(".mobile-nav");

if (menuToggle && mobileNav) {
  menuToggle.addEventListener("click", () => {
    const isOpen = mobileNav.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });
}

const heroSlides = Array.from(document.querySelectorAll("[data-hero-slide]"));
const heroDots = Array.from(document.querySelectorAll("[data-hero-dot]"));
let heroIndex = 0;
let heroTimer = null;

function showHeroSlide(index) {
  if (!heroSlides.length) {
    return;
  }

  heroIndex = (index + heroSlides.length) % heroSlides.length;
  heroSlides.forEach((slide, current) => {
    slide.classList.toggle("active", current === heroIndex);
  });
  heroDots.forEach((dot, current) => {
    dot.classList.toggle("active", current === heroIndex);
  });
}

function startHeroTimer() {
  if (!heroSlides.length) {
    return;
  }

  heroTimer = window.setInterval(() => {
    showHeroSlide(heroIndex + 1);
  }, 5200);
}

heroDots.forEach((dot, index) => {
  dot.addEventListener("click", () => {
    if (heroTimer) {
      window.clearInterval(heroTimer);
    }
    showHeroSlide(index);
    startHeroTimer();
  });
});

showHeroSlide(0);
startHeroTimer();

const filterPanel = document.querySelector("[data-filter-panel]");
const searchInput = document.getElementById("page-search");
const typeFilter = document.getElementById("type-filter");
const yearFilter = document.getElementById("year-filter");
const noResults = document.querySelector(".no-results");
const cards = Array.from(document.querySelectorAll(".movie-card"));

function normalizeText(value) {
  return String(value || "").trim().toLowerCase();
}

function fillSearchFromQuery() {
  if (!searchInput) {
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const query = params.get("q");
  if (query) {
    searchInput.value = query;
  }
}

function applyFilters() {
  if (!filterPanel || !cards.length) {
    return;
  }

  const keyword = normalizeText(searchInput ? searchInput.value : "");
  const typeValue = normalizeText(typeFilter ? typeFilter.value : "");
  const yearValue = normalizeText(yearFilter ? yearFilter.value : "");
  let visibleCount = 0;

  cards.forEach((card) => {
    const haystack = normalizeText([
      card.dataset.title,
      card.dataset.year,
      card.dataset.type,
      card.dataset.region,
      card.dataset.genre,
      card.dataset.category
    ].join(" "));
    const matchesKeyword = !keyword || haystack.includes(keyword);
    const matchesType = !typeValue || normalizeText(card.dataset.type).includes(typeValue);
    const matchesYear = !yearValue || normalizeText(card.dataset.year) === yearValue;
    const isVisible = matchesKeyword && matchesType && matchesYear;

    card.hidden = !isVisible;
    if (isVisible) {
      visibleCount += 1;
    }
  });

  if (noResults) {
    noResults.hidden = visibleCount !== 0;
  }
}

[searchInput, typeFilter, yearFilter].forEach((control) => {
  if (control) {
    control.addEventListener("input", applyFilters);
    control.addEventListener("change", applyFilters);
  }
});

fillSearchFromQuery();
applyFilters();
