(function () {
  var toggle = document.querySelector(".menu-toggle");
  var panel = document.querySelector(".mobile-panel");

  if (toggle && panel) {
    toggle.addEventListener("click", function () {
      var opened = !panel.hasAttribute("hidden");
      if (opened) {
        panel.setAttribute("hidden", "");
        toggle.setAttribute("aria-expanded", "false");
        toggle.textContent = "☰";
      } else {
        panel.removeAttribute("hidden");
        toggle.setAttribute("aria-expanded", "true");
        toggle.textContent = "×";
      }
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
  var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
  var prev = document.querySelector(".hero-prev");
  var next = document.querySelector(".hero-next");
  var index = 0;
  var timer = null;

  function showSlide(nextIndex) {
    if (!slides.length) {
      return;
    }

    index = (nextIndex + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      var active = slideIndex === index;
      slide.classList.toggle("active", active);
      slide.setAttribute("aria-hidden", active ? "false" : "true");
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle("active", dotIndex === index);
    });
  }

  function restartHeroTimer() {
    if (timer) {
      window.clearInterval(timer);
    }

    if (slides.length > 1) {
      timer = window.setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    }
  }

  if (slides.length) {
    if (prev) {
      prev.addEventListener("click", function () {
        showSlide(index - 1);
        restartHeroTimer();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        showSlide(index + 1);
        restartHeroTimer();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        showSlide(Number(dot.getAttribute("data-slide")) || 0);
        restartHeroTimer();
      });
    });

    restartHeroTimer();
  }

  var filterInput = document.querySelector(".filter-input");
  var filterSelects = Array.prototype.slice.call(document.querySelectorAll(".filter-select"));
  var filterCards = Array.prototype.slice.call(document.querySelectorAll(".filter-list .movie-card"));

  function applyFilters() {
    var query = filterInput ? filterInput.value.trim().toLowerCase() : "";
    var filters = {};

    filterSelects.forEach(function (select) {
      filters[select.getAttribute("data-filter")] = select.value.trim().toLowerCase();
    });

    filterCards.forEach(function (card) {
      var haystack = [
        card.getAttribute("data-title"),
        card.getAttribute("data-year"),
        card.getAttribute("data-region"),
        card.getAttribute("data-type"),
        card.getAttribute("data-genre"),
        card.getAttribute("data-tags")
      ].join(" ").toLowerCase();
      var matchedQuery = !query || haystack.indexOf(query) !== -1;
      var matchedYear = !filters.year || (card.getAttribute("data-year") || "").toLowerCase() === filters.year;
      var matchedType = !filters.type || (card.getAttribute("data-type") || "").toLowerCase().indexOf(filters.type) !== -1 || (card.getAttribute("data-genre") || "").toLowerCase().indexOf(filters.type) !== -1;

      card.classList.toggle("is-hidden", !(matchedQuery && matchedYear && matchedType));
    });
  }

  if (filterInput || filterSelects.length) {
    if (filterInput) {
      filterInput.addEventListener("input", applyFilters);
    }

    filterSelects.forEach(function (select) {
      select.addEventListener("change", applyFilters);
    });
  }

  function movieCardHtml(movie) {
    return [
      '<article class="movie-card">',
      '<a href="./' + movie.url + '" class="movie-card-link">',
      '<span class="poster-wrap">',
      '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '">',
      '<span class="rating-badge">' + movie.rating + '</span>',
      '<span class="play-hover">▶</span>',
      '</span>',
      '<span class="card-content">',
      '<strong>' + escapeHtml(movie.title) + '</strong>',
      '<span class="card-desc">' + escapeHtml(movie.description) + '</span>',
      '<span class="card-meta"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.type) + '</span><span>' + escapeHtml(movie.category) + '</span></span>',
      '</span>',
      '</a>',
      '</article>'
    ].join("");
  }

  function escapeHtml(text) {
    return String(text || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  var searchResults = document.getElementById("search-results");
  var searchInput = document.getElementById("search-page-input");

  function renderSearchResults() {
    if (!searchResults || !Array.isArray(window.SITE_MOVIES)) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";

    if (searchInput) {
      searchInput.value = query;
    }

    var normalized = query.trim().toLowerCase();

    if (!normalized) {
      searchResults.innerHTML = '<div class="empty-state">请输入关键词查找影片。</div>';
      return;
    }

    var matched = window.SITE_MOVIES.filter(function (movie) {
      return movie.searchText.indexOf(normalized) !== -1;
    }).slice(0, 80);

    if (!matched.length) {
      searchResults.innerHTML = '<div class="empty-state">没有找到相关影片。</div>';
      return;
    }

    searchResults.innerHTML = matched.map(movieCardHtml).join("");
  }

  renderSearchResults();
})();
